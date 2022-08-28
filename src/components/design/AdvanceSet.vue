<template>
  <div class="pane-style">
    <el-row class="item-block" v-show="showSms==1">
      <div class="sub-nav-title">
        <span class="icon-A10165_upload"></span>
        导出设置
      </div>
      <el-checkbox class="cbox" v-model="s_edcuiCompts[1].comptAttrs.needSms">导出进行短信验证</el-checkbox>
    </el-row>
    <el-row class="item-block" v-show="queryType == 'list'">
      <div class="sub-nav-title">
        <span class="icon-A10176_strategy"></span>
        总计设置
      </div>
      <el-checkbox class="cbox" v-model="s_edcuiCompts[1].comptAttrs.totalRow">显示总计</el-checkbox>
      <div
        style="position: absolute;top: 25px;left: 0px;width: 14px;height: 14px;z-index: 2;background: transparent;"
        @click="totalCheckClick"
      ></div>
      <el-form ref="form" label-width="68px">
        <el-form-item label="字段设置">
          <el-select
            v-model="colValue"
            placeholder="请选择"
            size="mini"
            style="width:138px"
            @change="colDefaultCalc"
          >
            <!--  prop-->
            <!-- s_edcuiCompts[1].comptAttrs.columns -->
            <el-option
              v-for="item in noComputedTbCols"
              v-if="item.element_type == '2'"
              :key="item.prop+item.label"
              :label="item.label"
              :value="item.element_id"
            ></el-option>
          </el-select>
          <el-select
            v-model="calc_value"
            placeholder="请选择"
            size="mini"
            style="width:118px;padding-left:10px"
            @change="calcAttrSettings"
          >
            <el-option
              v-for="item in calcData"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div class="item_label batch-item" @click="upBatchDialog(true)">
        <span class="icon-A10609_function"></span>
        批量设置
      </div>
    </el-row>
    <el-row class="item-block" v-show="queryType == 'list'">
      <div class="sub-nav-title">
        <span class="icon-A10429_orders"></span>
        列设置
      </div>
      <el-form ref="form" label-width="72px" class="advance-col-form">
        <el-form-item label="选择列">
          <el-select
            v-model="col2_value"
            placeholder="请选择"
            size="mini"
            style="width:230px"
            @change="setAlignIcon"
          >
            <!-- :value="item.prop" 因为有复制字段，所以value不能用prop -->
            <el-option
              v-for="item in s_edcuiCompts[1].comptAttrs.columns"
              :key="item.prop+item.label"
              :label="item.element_name||item.label"
              :value="item.element_id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="命名">
          <el-input
            v-model="colText"
            placeholder="请输入列名称"
            size="mini"
            style="width:190px"
            @change="setNickName"
          ></el-input>
        </el-form-item>
        <el-form-item label="对齐">
          <div
            v-for="item in alignData"
            class="align-item"
            :class="{selected:alignSign==item.label}"
            @click="alignSetting(item.label)"
            :key="item.value"
          >
            <div>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="数值" v-show="!formatDisable">
          <el-select
            v-model="d1_value"
            placeholder="请选择"
            size="mini"
            style="width:90px;margin-right:10px;"
            :disabled="formatDisable"
            @change="dotSetting"
          >
            <el-option
              v-for="item in dataFormat"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
          <!-- <label class="item_label" style="padding-right:5px;">小数位</label> -->
          <el-select
            v-model="d2_value"
            placeholder="小数位"
            size="mini"
            style="width:90px"
            :disabled="d1_value == 0 ? true : dotDisable"
            @change="dotSetting"
          >
            <el-option
              v-for="item in dotPlaces"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-row>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from "vuex";
import { objDeepCopy } from "../../utils/comonFunc.js";
export default {
  data() {
    return {
      colText: "",
      col_value: "",
      col2_value: "",
      calc_value: "",
      calc2_value: "",
      d1_value: "",
      d2_value: 0,
      calcData: [
        {
          value: "",
          label: "无"
        },
        {
          value: 1,
          label: "COUNT"
        },
        {
          value: 2,
          label: "SUM"
        },
        {
          value: 3,
          label: "AVG"
        },
        {
          value: 4,
          label: "MAX"
        },
        {
          value: 5,
          label: "MIN"
        }
      ],
      alignSign: "",
      alignData: [
        {
          value: 0,
          label: "left"
        },
        {
          value: 1,
          label: "center"
        },
        {
          value: 2,
          label: "right"
        }
      ],
      dataFormat: [
        {
          value: 0,
          label: "默认"
        },
        {
          value: 1,
          label: "小数"
        },
        {
          value: 2,
          label: "百分比"
        }
      ],
      dotPlaces: [
        {
          value: 0,
          label: "无"
        },
        {
          value: 1,
          label: "1"
        },
        {
          value: 2,
          label: "2"
        },
        {
          value: 3,
          label: "3"
        },
        {
          value: 4,
          label: "4"
        },
        {
          value: 5,
          label: "5"
        }
      ],
      formatDisable: false,
      dotDisable: false
    };
  },
  computed: {
    colValue: {
      get() {
        return this.$store.state.QueryTable.colValue;
      },
      set(val) {
        this.upColValue(val);
      }
    },
    s_columns: {
      get() {
        return this.s_edcuiCompts[1].comptAttrs.columns;
      }
    },
    ...mapState({
      tableCols: state => state.QueryTable.tableCols,
      hasTotaled: state => state.QueryTable.hasTotaled,
      datasChange: state => state.QueryTable.datasChange,
      isTotal: state => state.QueryTable.isTotal,
      s_edcuiCompts: state => state.compt.s_edcuiCompts,
      batchDialogVisible: state => state.QueryTable.batchDialogVisible,
      queryType: state => state.QueryTable.queryType,
      needSms: state => state.commonProperties.needSms,
      showSms: state => state.commonProperties.showSms
    }),
    ...mapGetters({
      noComputedTbCols: "QueryTable/noComputedTbCols"
    })
  },
  watch: {
    datasChange() {
      let datasChange = this.datasChange;
      if (datasChange) {
        this.colDefaultCalc();
      }
      this.upDatasChange(false);
    },
    s_columns(columns) {
      let columsArr = [];
      columns.forEach((item, i) => {
        columsArr.push(item.element_name);
      });
      if (!columsArr.includes(this.col2_value) && this.calc_value==="") {
        this.col2_value = "";
        this.colText = "";
        this.col_value = "";
        this.calc_value = "";
        this.calc2_value = "";
        this.d1_value = "";
        this.d2_value = 0;
        this.alignSign = "";
      }
    }
  },
  activated() {
    this.colText = "";
    this.col_value = "";
    this.col2_value = "";
    this.calc_value = "";
    this.calc2_value = "";
    this.d1_value = "";
    this.d2_value = 0;
    this.alignSign = "";
    this.formatDisable = false;
    this.dotDisable = false;
    if(this.s_edcuiCompts[1].comptAttrs.needSms === "" || this.s_edcuiCompts[1].comptAttrs.needSms === undefined){
      this.s_edcuiCompts[1].comptAttrs.needSms = this.needSms;
    }
  },
  methods: {
    batchSettings() {
      this.upBatchDialog(false);
    },
    totalChange() {
      var isTotal = this.s_edcuiCompts[1].comptAttrs.totalRow;
      if (isTotal) {
        // var type = this.s_edcuiCompts[1].comptAttrs.columns[0].col_type;
        // if (type == 'No.') {
        //   this.$message.error('表格首字段无法进行数值汇总，请将该字段设为非首字段');
        // }
        // 判断有没有计算字段，有的话提示
        let computedFieldArr = this.tableCols.filter(item => {
          return item.is_calcul == "1";
        });
        if (computedFieldArr.length > 0) {
          this.$message.closeAll();
          this.$message({
            message: "计算字段无法进行数值汇总",
            type: "warning"
          });
          this.s_edcuiCompts[1].comptAttrs.totalRow = false;
          return;
        }
        this.upIsTotal(true);
      } else {
        // if (this.upisTotal) {

        // }
        this.upIsTotal(false);
      }
    },
    totalCheckClick() {
      var isTotal = !this.s_edcuiCompts[1].comptAttrs.totalRow;
      if (isTotal) {
        // 判断有没有计算字段，有的话提示
        let computedFieldArr = this.tableCols.filter(item => {
          return item.is_calcul == "1";
        });
        if (computedFieldArr.length > 0) {
          this.$message.closeAll();
          this.$message({
            message: "计算字段无法进行数值汇总",
            type: "warning"
          });
          this.s_edcuiCompts[1].comptAttrs.totalRow = false;
          return;
        }
        this.s_edcuiCompts[1].comptAttrs.totalRow = true;
        this.upIsTotal(true);
      } else {
        this.s_edcuiCompts[1].comptAttrs.totalRow = false;
        this.upIsTotal(false);
      }
    },
    setAlignIcon(id) {
      this.colText = "";
      this.d1_value = "";
      this.d2_value = 0;
      var columns = this.s_edcuiCompts[1].comptAttrs.columns || [];
      if (this.queryType == "summarize") {
        columns = this.tableCols || [];
      }
      columns.forEach((item, i) => {
        if (item.element_id == id) {
          //prop
          this.alignSign = item.align;
          if (item.col_type == "No.") {
            this.formatDisable = false;
            this.dotDisable = false;
          } else {
            this.formatDisable = true;
            this.dotDisable = true;
          }
        }

        // 回填重命名文本
        if (
          item.element_id == this.col2_value &&
          columns[i].label != item.element_name
        ) {
          this.colText = columns[i].label;
        }

        //数据格式更新
        if (item.element_id == this.col2_value) {
          //prop
          this.d1_value = columns[i].numType;
          this.d2_value = columns[i].dot;
        }
      });
    },
    alignSetting(align) {
      this.alignSign = align;
      if (this.queryType == "list") {
        var columns = this.s_edcuiCompts[1].comptAttrs.columns || [];
        columns.forEach((item, i) => {
          if (item.element_id == this.col2_value) {
            // prop
            columns[i].align = align;
          }
        });
      }
      var tablec = this.tableCols || [];
      tablec.forEach((item, i) => {
        if (item.element_id == this.col2_value) {
          tablec[i].align = align;
        }
      });
    },
    setNickName() {
      if (this.queryType == "list") {
        var columns = this.s_edcuiCompts[1].comptAttrs.columns || [];
        columns.forEach((item, i) => {
          if (item.element_id == this.col2_value) {
            // prop
            if (this.colText.trim() != "") {
              columns[i].nick_name = this.colText;
              columns[i].label = this.colText;
            } else {
              columns[i].nick_name = item.element_name;
              columns[i].label = item.element_name;
            }
          }
        });
      }

      // var tablec = this.tableCols || [];
      // tablec.map((item, i) => {
      //   if (item.col_id == this.col2_value) {
      //     if (this.colText.trim() != "") {
      //       tablec[i].label = this.colText;
      //     } else {
      //       tablec[i].label = item.element_name;
      //     }
      //   }
      // });
      var tablec = objDeepCopy(this.tableCols || []);
      tablec.map((item, i) => {
        if (item.element_id == this.col2_value) {
          if (this.colText.trim() != "") {
            tablec[i].nick_name = this.colText;
            tablec[i].label = this.colText;
          } else {
            tablec[i].nick_name = item.element_name;
            tablec[i].label = item.element_name;
          }
        }
      });
      this.upTableCols({ data: tablec, type: "reset" });
    },
    colDefaultCalc() {
      var _this = this;
      var columns = this.s_edcuiCompts[1].comptAttrs.columns || [];
      columns.forEach((item, i) => {
        if (item.element_id == _this.colValue) {
          //prop
          _this.calc_value = columns[i].calcAttr;
          if (i == 0) {
            _this.calc_value = "";
            columns[i].calcAttr = "";
            columns[i].calcAttrBak = "";
          } else {
            _this.upIsChangeCalc(true);
          }
        }
      });
    },
    calcAttrSettings() {
      var _this = this;
      let columns = this.s_edcuiCompts[1].comptAttrs.columns || [];
      columns.forEach((item, i) => {
        if (item.element_id == _this.colValue) {
          //prop
          columns[i].calcAttr = _this.calc_value;
          columns[i].calcAttrBak = _this.calc_value;
          _this.$set(_this.s_edcuiCompts[1].comptAttrs.columns, i, columns[i]);
          if (i != 0) {
            _this.upIsChangeCalc(true);
          } else {
            if (_this.s_edcuiCompts[1].comptAttrs.totalRow) {
              _this.$message.error(
                "表格首字段无法进行数值汇总，请将该字段设为非首字段"
              );
              _this.calc_value = "";
              columns[i].calcAttr = "";
              columns[i].calcAttrBak = "";
            }
          }
        }
      });
      var tablec = this.tableCols || [];
      tablec.forEach((item, i) => {
        if (item.element_id == _this.colValue) {
          tablec[i]["calcAttr"] = _this.calc_value;
          _this.$set(_this.tableCols, i, tablec[i]);
        }
      });
    },
    dotSetting() {
      if (this.queryType == "list") {
        let columns = this.s_edcuiCompts[1].comptAttrs.columns || [];
        columns.forEach((item, i) => {
          if (item.element_id == this.col2_value) {
            //prop
            columns[i].numType = this.d1_value;
            if (this.d1_value == 0) {
              this.d2_value = 0;
            }
            columns[i].dot = this.d2_value;
          }
        });
      }
      // this.upColumns(columns);
      // 找清华确认了，列设置只对清单有效，也就是说在汇总的情况下，设置列字段，也是设置清单列里面，只能切换到清单才能看效果
      // 若为清单状态，应保存到resultcols
      let columns = objDeepCopy(this.tableCols);
      columns.forEach((item, i) => {
        if (item.element_id == this.col2_value) {
          //prop
          columns[i].numType = this.d1_value;
          if (this.d1_value == 0) {
            this.d2_value = 0;
          }
          columns[i].dot = this.d2_value;
        }
      });
      this.upTableCols({ data: columns, type: "reset" });
    },
    ...mapMutations({
      upBatchDialog: "QueryTable/upBatchDialog",
      upIsTotal: "QueryTable/upIsTotal",
      upColumns: "QueryTable/upColumns",
      upIsChangeCalc: "QueryTable/upIsChangeCalc",
      upDatasChange: "QueryTable/upDatasChange",
      upHasTotaled: "QueryTable/upHasTotaled",
      upColValue: "QueryTable/upColValue"
    }),
    ...mapActions({
      upHasTotaled: "QueryTable/upHasTotaled",
      upIsChangeCalc: "QueryTable/upIsChangeCalc",
      upDatasChange: "QueryTable/upDatasChange",
      upColumns: "QueryTable/upColumns",
      upIsTotal: "QueryTable/upIsTotal",
      upColValue: "QueryTable/upColValue",
      upTableCols: "QueryTable/upTableCols"
    })
  }
};
</script>
<style lang="scss" scoped>
$font-main2: #afc0d0;
$font-clr1: #45fffd;
$border-clr3: #498bce;
$input-bg-clr1: #0e3b67; // 输入框背景色

/***样式块**/
.pane-style {
  height: 100%;
  padding: 10px;
  .el-form-item {
    margin-bottom: 5px;
  }
  .item-block {
    margin-bottom: 12px;
  }
  .item_label {
    padding-left: 0px;
    display: inline-block;
  }
  .sub-nav-title {
    height: 22px;
  }
  span[class^="icon-"] {
    font-size: 12px;
  }
  .batch-item {
    cursor: pointer;
  }
  .align-item {
    height: 30px;
    width: 30px;
    display: inline-block;
    text-align: center;
    vertical-align: middle;
    margin-top: -3px;
    margin-right: 4px;
    border-radius: 2px;
    border: 1px solid transparent;
    div {
      transform: scaleY(0.7);
      line-height: 1px;
    }
    span {
      display: inline-block;
      width: 70%;
      line-height: 2px;
    }
    span:nth-child(2n) {
      width: 50%;
    }
  }
  .align-item:first-child {
    text-align: left;
    padding-left: 5px;
  }
  .align-item:nth-child(n + 3) {
    text-align: right;
    padding-right: 5px;
  }
  /deep/.batch-dialog {
    /deep/.el-form-item__label {
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }

  /deep/.el-form-item__label {
    color: $font-main2;
  }
  /deep/.cbox.el-checkbox {
    color: $font-main2;
  }
  /deep/.cbox .el-checkbox__input.is-checked + .el-checkbox__label {
    color: $font-main2;
  }
  .item_label {
    color: $font-main2;
  }
  .batch-item:hover {
    color: $font-clr1;
  }
  .align-item:hover,
  .align-item.selected {
    border-color: $border-clr3;
    background: $input-bg-clr1;
  }
  .align-item span {
    border-top: 2px solid $font-main2;
  }
  .item-block .sub-nav-title {
    color: $font-clr1;
  }
  /deep/.advance-col-form {
    .el-form-item:not(:first-child) {
      padding-left: 40px;
    }
  }
}
</style>
