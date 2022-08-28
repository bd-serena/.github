<template>
  <el-table
    border
    :data="filterData"
    style="width: 100%"
    size="mini"
    height="100%"
    class="filter-tb-wrap"
    id="table3"
    row-key="id"
  >
    <el-table-column label="过滤条件关系" width="100">
      <template slot-scope="scope">
        <div>
          <el-select
            v-model="scope.row.ruleType"
            size="mini"
            class="tb-sel-wrap"
            v-show="scope.$index > 0"
            style="width:80px;"
          >
            <el-option key="1" label="and" value="1"></el-option>
            <el-option key="2" label="or" value="2"></el-option>
          </el-select>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="过滤字段" width="140">
      <template slot-scope="scope">
        <el-select
          v-model="scope.row.colId"
          placeholder="请选择字段"
          size="mini"
          class="tb-sel-wrap"
          popper-class="tb-sel-pop-wrap"
          @change="((val)=>{fieldSelChange(val, scope.$index)})"
        >
          <!-- colChsName -->
          <el-option
            v-for="item in fieldsList"
            :key="item.colId"
            :label="item.colName+'('+(item.colChsName || '')+')'"
            :value="item.colId"
          >
            <el-tooltip
              class="item"
              effect="dark"
              :content="item.colName+'('+(item.colChsName || '')+')'"
              placement="left-start"
            >
              <span class="tb-sel-opt-label">{{ item.colName+'('+(item.colChsName || '')+')' }}</span>
            </el-tooltip>
          </el-option>
        </el-select>
      </template>
    </el-table-column>
    <el-table-column label="字段过滤规则">
      <template slot-scope="scope">
        <!--数值类型 start-->
        <div v-if="scope.row.type=='number'" class="rule-wrap comp-number">
          <el-input
            size="mini"
            class="input-with-select"
            v-model="scope.row.operaValue"
            :maxlength="3000"
            :title="scope.row.operaValue"
          >
            <el-select
              style="width:150px; background-color:#fff"
              placeholder
              v-model="scope.row.symbol"
              slot="prepend"
              size="mini"
              :key="Math.random()"
            >
              <el-option
                v-for="item in symbols"
                :key="Math.random()+scope.$index"
                :value="item.value"
                :label="item.label"
              ></el-option>
            </el-select>
          </el-input>
        </div>
        <!--数值类型 end-->
        <!-- 文本类型 start-->
        <div v-else-if="scope.row.type=='char'" class="rule-wrap comp-input">
          <el-select
            style="width:150px; background-color:#fff"
            v-model="scope.row.symbol"
            size="mini"
            @change="((newVal)=>{inputSelChange(newVal,scope.$index)})"
          >
            <el-option
              v-for="item in contains"
              :key="Math.random()"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
          <el-input
            v-model="scope.row.operaValue"
            size="mini"
            :disabled="scope.row.symbol==20||scope.row.symbol==21"
            :maxlength="3000"
          ></el-input>
        </div>
        <!-- 文本类型 end-->
      </template>
    </el-table-column>
    <el-table-column label="操作" width="150" align="center">
      <template slot-scope="scope">
        <el-tooltip class="item" effect="dark" content="拖动行" placement="top-start">
          <span class="el-icon-rank table-icon drag-row-icon"></span>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="删除" placement="top-start">
          <span class="icon-A10065_delete table-icon" @click="delRowData(scope.$index)"></span>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="新增" placement="top-start">
          <span class="icon-A10073_add table-icon" @click="addRowData(scope.$index)"></span>
        </el-tooltip>
      </template>
    </el-table-column>
  </el-table>
</template>
<script>
import { mapState, mapMutations } from "vuex";
import { fieldMatch } from "../../utils/comonFunc.js";
import Sortable from "sortablejs";
export default {
  props: ["fieldTypeList"],
  data() {
    return {
      symbols: Object.freeze([
        { value: 2, label: ">" },
        { value: 1, label: "<" },
        { value: 3, label: "=" },
        { value: 4, label: "<=" },
        { value: 5, label: ">=" },
        { value: 8, label: "在…中（逗号隔开）" },
        { value: 9, label: "不在…中（逗号隔开）" }
      ]),
      contains: Object.freeze([
        { value: 10, label: "包含" },
        { value: 11, label: "不包含" },
        { value: 8, label: "在…中（逗号隔开）" },
        { value: 9, label: "不在…中（逗号隔开）" },
        { value: 20, label: "为空" },
        { value: 21, label: "不为空" }
      ]),
      filterRow: Object.freeze([
        {
          ruleType: "1",
          colId: "",
          type: "",
          operaValue: "",
          symbol: 8
        }
      ])
    };
  },
  methods: {
    ...mapMutations({
      setDimFilterData: "DataSetDesign/setDimFilterData",
      setDimIdCounter: "DataSetDesign/setDimIdCounter"
    }),
    fieldSelChange(value, index) {
      if (value !== "") {
        let field = this.dimFieldData.filter(item => {
          return item.colId === value;
        });
        let fieldItem = { ...this.filterData[index] };
        fieldItem.type = this.getTypeByCol(field[0]);
        fieldItem.operaValue = "";
        fieldItem.symbol = 8;
        this.$set(this.filterData, index, fieldItem);
      }
    },
    delRowData(index) {
      this.filterData.splice(index, 1);
      if (this.filterData.length === 0) {
        this.setDimFilterData([this.getFilterRowEg()]);
      }
    },
    addRowData(index) {
      this.filterData.splice(index + 1, 0, this.getFilterRowEg());
      this.$nextTick(() => {
        this.scrollToRowIdx("table3", index + 1);
      });
    },
    getTypeByCol(col) {
      return fieldMatch(col.colType, this.fieldTypeList);
    },
    rowDrag() {
      const _this = this;
      //静态维度表格行拖拽
      const tbody1 = document.querySelector(
        "#table3 .el-table__body-wrapper tbody"
      );
      Sortable.create(tbody1, {
        onEnd({ newIndex, oldIndex }) {
          const currentRow = _this.filterData.splice(oldIndex, 1)[0];
          _this.filterData.splice(newIndex, 0, currentRow);
        },
        handle: ".drag-row-icon"
      });
    },
    // 生成过滤条件示例行
    getFilterRowEg() {
      return {
        ruleType: "1",
        colId: "",
        type: "",
        operaValue: "",
        symbol: 8,
        id: ++this.dimIdCounter
      };
    },
    // 当char类型当字段，选择为空或不为空时，输入框值要置为空
    inputSelChange(selVal, index) {
      if (selVal === 20 || selVal === 21) {
        this.$set(this.filterData[index], "operaValue", "");
      }
    },
    scrollToRowIdx(tableId, rowIdx) {
      let tableObj = document.getElementById(tableId);
      try {
        let tr = tableObj
          .getElementsByClassName("el-table__body")[0]
          .getElementsByTagName("tr");
        if (tr && tr[rowIdx] && tr[rowIdx].scrollIntoView) {
          tr[rowIdx].scrollIntoView(true);
        }
      } catch (error) {}
    }
  },
  computed: {
    ...mapState({
      filterData: state => state.DataSetDesign.dimFilterData,
      dimFieldData: state => state.DataSetDesign.fieldOptions
      // dimIdCounter: state => state.DataSetDesign.dimIdCounter //维度过滤行id计数器
    }),
    dimIdCounter: {
      //维度过滤行id计数器
      get: function() {
        return this.$store.state.DataSetDesign.dimIdCounter;
      },
      set: function(newValue) {
        this.setDimIdCounter(newValue);
      }
    },
    // 目前暂时只做字符型和number型的字段的过滤设置
    fieldsList() {
      let newList = this.dimFieldData.filter(item => {
        return ["number", "char"].includes(this.getTypeByCol(item));
      });
      return newList;
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.rowDrag();
    });
  }
};
</script>
<style lang="scss" scoped>
$hover-clr: #409eff; //鼠标经过颜色
.el-table.filter-tb-wrap {
  /deep/.rule-wrap {
    width: auto;
    .comp-number {
      /deep/ .el-col {
        height: 100%;
      }
      /deep/ .el-col.comp-number-col1 {
        width: 230px;
      }
    }
    /deep/.el-select + .el-input {
      width: calc(100% - 150px);
    }
    /deep/.input-with-select .el-input-group__prepend .el-input--suffix input {
      color: #606266;
    }

    /deep/.el-input {
      border-width: 0px;
      .el-input__inner,
      .el-input-group__prepend {
        border-width: 0px;
        border-radius: 0px;
      }
      .el-input__suffix-inner {
        visibility: hidden;
      }

      .el-input__inner,
      .el-input-group__prepend {
        background: #fff;
      }
    }

    /deep/.input-with-select:hover {
      border: 1px solid $hover-clr;
      & > .el-input__inner {
        border-left: 1px solid $hover-clr;
      }
      .el-input__suffix-inner {
        visibility: visible;
      }
    }

    &.comp-input:hover {
      /deep/.el-select {
        .el-input__inner {
          border-width: 1px 0 1px 1px;
          border-color: $hover-clr;
        }
        .el-input__suffix-inner {
          visibility: visible;
        }
        & + .el-input .el-input__inner {
          border-width: 1px;
          border-color: $hover-clr;
        }
      }
    }
  }
}
// 表格下拉框面板 文本过长限制
.tb-sel-pop-wrap .tb-sel-opt-label {
  display: inline-block;
  width: 129px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
<style>
/* .comp-number .el-col .el-input__inner,
.comp-input .el-input__inner {
  width: 120px;
} */
</style>