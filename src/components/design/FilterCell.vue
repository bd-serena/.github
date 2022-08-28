<template>
  <div v-if="!!filterData&&Object.keys(filterData).length>0">
    <!--数值类型 -->
    <div
      v-if="filterData.type=='ElNumber'"
      style="width: 100%;height:30px;"
    >
      <div style="width: 100%;height:30px;">
        <el-col
          :span="10"
          style="height:30px;"
        >
          <el-input
            style="width:132px;"
            size="mini"
            class="number-input"
            v-model="filterData.numList[0].m_value"
            :type="(filterData.numList[0]||{}).label < 7 ? 'number' : 'text'"
            @blur="event=>numberValid(event,filterData.numList,0)"
            @input="numValid(0)"
            :disabled="filterData.numList[0]&&(filterData.numList[0].label==20||filterData.numList[0].label==21)"
            :title="filterData.numList[0].m_value"
          >
            <el-select
              style="width:65px; background-color:transparent"
              placeholder
              v-model="filterData.numList[0].label"
              slot="prepend"
              size="mini"
              :key="Math.random()"
              @change="handleChange(0)"
            >
              <el-option
                v-for="filterData in symbols"
                :key="Math.random()"
                :value="filterData.value"
                :label="filterData.label"
              />
            </el-select>
          </el-input>
        </el-col>
        <el-col
          :span="4"
          style="margin-top: 2px;height:30px"
        >
          <el-select
            v-model="filterData.radioCalcu"
            placeholder
            size="mini"
            :key="Math.random()"
            class="numSel"
            @change="conCaculsChange"
          >
            <el-option
              v-for="filterData in conCaculs"
              :key="Math.random()"
              :label="filterData.label"
              :value="filterData.value"
            />
          </el-select>
        </el-col>
        <el-col
          :span="10"
          style="padding-left: 9px;margin-top: 2px;height:30px;"
          v-show="filterData.radioCalcu != '0'"
        >
          <el-input
            style="width:132px;"
            v-model="filterData.numList[1]&&filterData.numList[1].m_value"
            class="number-input"
            size="mini"
            :type="(filterData.numList[1]||{}).label < 7 ? 'number' : 'text'"
            @blur="event=>numberValid(event,filterData.numList,1)"
            @input="numValid(1)"
            :disabled="filterData.numList[1]&&(filterData.numList[1].label==20||filterData.numList[1].label==21)"
            :title="filterData.numList[1]&&filterData.numList[1].m_value"
          >
            <el-select
              style="width:65px; background-color:transparent"
              placeholder
              v-model="filterData.numList[1]&&filterData.numList[1].label"
              @change="handleChange(1)"
              slot="prepend"
              size="mini"
            >
              <el-option
                v-for="filterData in symbols"
                :key="Math.random()"
                :value="filterData.value"
                :label="filterData.label"
              />
            </el-select>
          </el-input>
        </el-col>
      </div>
    </div>
    <!--地市类型 -->
    <div
      v-else-if="filterData.type == 'ElCascader'"
      style="width: 100%;height:30px"
      class="area"
    >
      <SelectTree
        :key="filterData.af_id+'_'+id+casKey"
        :options="filterData.dfAreaSels"
        :vscompt="filterData"
      />
    </div>
    <!-- 文本类型-->
    <div
      v-else-if="filterData.type=='ElInput'"
      style="width: 100%;height:30px"
    >
      <div style="width: 100%;height:30px">
        <el-input
          placeholder
          v-model="filterData.symbol==20||filterData.symbol==21? '':filterData.m_value"
          class="input-with-select"
          size="mini"
          :disabled="filterData.symbol==20||filterData.symbol==21"
          :title="filterData.symbol==20||filterData.symbol==21? '':filterData.m_value"
        >
          <el-select
            v-model="filterData.symbol"
            slot="prepend"
            placeholder
            style="width: 104px;"
          >
            <el-option
              v-for="item in contains"
              :key="Math.random()"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-input>
      </div>
    </div>
    <!-- 日期类型-->
    <div
      v-else-if="filterData.type=='ElDatePicker'"
      style="width: 100%;"
      :class="filterData.isSetDefault? 'date_ischeck':'date_uncheck'"
    >
      <div style="height:38px;width:100%">
        <el-col :span="11">
          <el-date-picker
            size="mini"
            v-model="filterData.m_value[0]"
            placeholder="开始日期"
            style="width: 155px;"
            @change="startDateChange(filterData.m_value[0])"
            :type="setTimeFormat(filterData.show_format,2)"
            :format="setTimeFormat(filterData.show_format,1)"
            :value-format="setTimeFormat(filterData.show_format,1)"
            :disabled="filterData.isSetDefault"
            :title="filterData.isSetDefault?'':filterData.m_value[0]"
          />
        </el-col>
        <el-col
          :span="2"
          style="text-align:center;line-height:28px;"
        >
          <span>至</span>
        </el-col>
        <el-col
          :span="11"
          style="text-align:right"
        >
          <el-date-picker
            size="mini"
            v-model="filterData.m_value[1]"
            placeholder="结束日期"
            style="width: 155px; "
            @change="endDateChange(filterData.m_value[1])"
            :type="setTimeFormat(filterData.show_format,2)"
            :format="setTimeFormat(filterData.show_format,1)"
            :value-format="setTimeFormat(filterData.show_format,1)"
            :disabled="filterData.isSetDefault"
            :title="filterData.isSetDefault?'':filterData.m_value[1]"
          />
        </el-col>
      </div>
      <div style="height:calc(100% - 38px);width:100%;">
        <el-checkbox
          v-model="filterData.isSetDefault"
          style="height:20px"
          @change="defaultChange"
        >
          设置默认值
        </el-checkbox>
        <div
          style="height:calc(100% - 20px);width:100%"
          v-if="filterData.isSetDefault"
        >
          <el-row style="margin:3px 0;">
            <el-col>开始时间：</el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-row>
                <el-col :span="2.5">
                  <a
                    href="javascript:;"
                    class="con-line con-line-green"
                  >
                    <span>偏移量</span>T
                  </a>
                </el-col>
                <el-col :span="11">
                  <el-input
                    placeholder="请输入偏移量"
                    size="mini"
                    v-model.number="filterData.timeOprCount1"
                    class="input-with-select"
                    @input="dateOffsetChange({type:1,index:0})"
                    @blur="checkIsNullInput(filterData,1)"
                    :title="filterData.timeOprCount1"
                  >
                    <el-select
                      v-model="filterData.timeOpr1"
                      slot="prepend"
                      placeholder
                      @change="dateOffsetChange({type:1,index:0})"
                    >
                      <el-option
                        v-for="initem in timeOprs"
                        :key="initem.value"
                        :value="initem.value"
                        :label="initem.label"
                      />
                    </el-select>
                  </el-input>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
          <el-row style="margin-top: 10px;">
            <el-col>结束时间：</el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-row>
                <el-col :span="2.5">
                  <a
                    href="javascript:;"
                    class="con-line"
                  >
                    <span>偏移量</span>T
                  </a>
                </el-col>
                <el-col :span="11">
                  <el-input
                    placeholder="请输入偏移量"
                    size="mini"
                    v-model.number="filterData.timeOprCount2"
                    class="input-with-select"
                    @input="dateOffsetChange({type:1,index:1})"
                    @blur="checkIsNullInput(filterData,2)"
                    :title="filterData.timeOprCount2"
                  >
                    <el-select
                      v-model="filterData.timeOpr2"
                      slot="prepend"
                      placeholder
                      @change="dateOffsetChange({type:1,index:1})"
                    >
                      <el-option
                        v-for="item in timeOprs"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label"
                      />
                    </el-select>
                  </el-input>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import {mapActions, mapState} from "vuex";
  import SelectTree from "../template/ElTreeSelectNew.vue";
  import {getTimeFromOffset, objCloneByReplaceKey, setTimeFormat, inputNumber } from "../../utils/comonFunc.js";

  export default {
    props: ["filterItem", "id"],
    components: {
      SelectTree
    },
    data() {
      return {
        casKey: '',
        filterData: this.filterItem,
        suffix2: "",
        timeOprCount1: 0,
        timeOpr1: 2,
        timeOprs: [{value: 1, label: "+"}, {value: 2, label: "-"}],
        valueId: [], // 初始值
        valueText: [],
        conCaculs: [
          {value: "or", label: "或"},
          {value: "and", label: "且"},
          {value: "0", label: "无"}
        ],
        contains: [
          /* {value: 10, label: "包含"},
          {value: 11, label: "不包含"},
          {value: 8, label: "在…中（逗号隔开）"},
          {value: 9, label: "不在…中（逗号隔开）"},
          {value: 20, label: "为空"},
          {value: 21, label: "不为空"} */
        ],
        dfAreaSels: [],
        dfArea: [],
        symbols: [
          /* {value: 2, label: ">"},
          {value: 1, label: "<"},
          {value: 3, label: "="},
          {value: 4, label: "<="},
          {value: 5, label: ">="},
          {value: 8, label: "在…中（逗号隔开）"},
          {value: 9, label: "不在…中（逗号隔开）"} */
        ],
        props: {
          value: "dim_value",
          label: "label",
          children: "children"
        },
        showTypeArr: {
          "2": "col_chs_name",
          "1": "col_name",
          "0": "element_name"
        },
        nullSelectValue: ""
      };
    },
    mounted() {
      let item = this.filterData
      try {
        if (item.hasOwnProperty("isSetDefault") == false) {
          // item.isSetDefault = false;
          this.$set(item, 'isSetDefault', false)
        }
        if (item.type == "ElCascader") {
          item.dfAreaSels = null
          // this.getDimRelation();
        } else if (item.type == "ElNumber") {
          if (item.numList.length == 1) {
            item.numList = [
              {id: "0", m_value: "", label: 2},
              {id: "1", m_value: "", label: ""}
            ];
          }
        } else if (item.type == "ElDatePicker" && item.isSetDefault == true) {
          this.dateOffsetChange({type: 1, index: 0});
          this.dateOffsetChange({type: 1, index: 1});
        }
      } catch (e) {
      }
      const defaultSymbol = require("../../../public/comptConfig/cellCompt.json");
      this.symbols = defaultSymbol.ElNumberSymbols
      this.contains = defaultSymbol.ElInputSymbols
    },
    computed: {
      ...mapState({
        fieldSetList: state => state.compt.fieldSetList,
        datasetName: state => state.compt.datasetName,
        dgwMsUrl: state => state.dgwMsUrl
      })
    },
    methods: {
      ...mapActions({
        querySingleDimInfo: "AnalyReportAttr/querySingleDimInfo"
      }),
      setTimeFormat: setTimeFormat,

      getValue(value) {
        let item = this.filterData;
        item.m_value = value;
      },
      getDimRelation() {
        let item = this.filterData,
          _this = this,
          param = {
            dim_id: item.dim_id,
            dim_level_id: item.dim_level_id,
            is_all_data: "1",
            parent_val: ""
          };
        this.querySingleDimInfo(param).then(function (response) {
          let data = response.data.respData;
          if (response.data.respResult == "1") {
            data = objCloneByReplaceKey(data, {"dimValue": "dim_value", "dimValueDesc": "label"});
            item.dfAreaSels = data;
            // _this.filterData.dfAreaSels = data
            _this.$set(_this.filterData, 'dfAreaSels', data)
            _this.casKey += 1
            _this.$set(_this.filterData, 'dfAreaSels', data)
          } else {
            _this.$message.error("维层信息查询失败");
            item.dfAreaSels = [];
            // _this.filterData.dfAreaSels = [];
            _this.$set(_this.filterData, 'dfAreaSels', [])
          }
        })
          .catch(err => {
            _this.$message.error(err);
          });
      },

      startDateChange(val) {
        var item = this.filterData;
        if (val) {
          var nowDate = new Date(val).getTime();
          var originDate = new Date(item.m_value[1]).getTime();
          if (
            item.show_format &&
            item.show_format.indexOf("-") < 0 &&
            item.show_format.indexOf("/") < 0
          ) {
            nowDate = parseInt(val);
            originDate = parseInt(item.m_value[1]);
          }
          if (item.m_value[1] && nowDate > originDate) {
            this.$message.error("终止日期不得小于起始日期");
            this.$set(item.m_value, 0, item.m_value[1]);
          }
        }
      },
      endDateChange(val) {
        var item = this.filterData;
        if (val) {
          var nowDate = new Date(val).getTime();
          var originDate = new Date(item.m_value[0]).getTime();
          if (
            item.show_format &&
            item.show_format.indexOf("-") < 0 &&
            item.show_format.indexOf("/") < 0
          ) {
            nowDate = parseInt(val);
            originDate = parseInt(item.m_value[0].replace(/\/|\-/g, ''));
          }
          if (item.m_value[0] && nowDate < originDate) {
            this.$message.error("终止日期不得小于起始日期");
            this.$set(item.m_value, 1, item.m_value[0]);
          }
        }
      },

      handleCheckChange(data, checked, indeterminate) {
        this.valueId = this.$refs.selectTree[0].getCheckedKeys();
      },
      // 时间偏移量变化
      dateOffsetChange(paramObj) {
        var item = this.filterData
        var suffix = "";
        if (paramObj.type == 1) {
          suffix = paramObj.index == 0 ? "1" : "2";
        }
        this.suffix2 = suffix;
        var offset = 0;
        if ((item["timeOprCount" + suffix] || 0) != "") {
          if (!Number.isInteger(parseInt(item["timeOprCount" + suffix] || 0))) {
            //偏移量必须为整数
            item["timeOprCount" + suffix] = "0";
          } else if (parseInt(item["timeOprCount" + suffix]) > 1000) {
            //偏移量最大值为1000
            item["timeOprCount" + suffix] = 1000;
          }
          offset =
            item["timeOpr" + suffix] == 2
              ? "-" + item["timeOprCount" + suffix]
              : item["timeOprCount" + suffix];
          offset = parseInt(offset);
        }
        var time = getTimeFromOffset(item.show_format, offset);
        this.$set(item.m_value, paramObj.index, time);

        if (paramObj.index == 0) {
          this.checkIfOutRange(0);
        } else {
          this.checkIfOutRange(1);
        }
      },
      /** index 0--开始 1--结束
       * type: 1-改时间 2-改偏移量
       *
       */
      checkIfOutRange(index) {
        let item = this.filterData
        if (
          item["timeOprCount1"] + "" != "" &&
          item["timeOprCount2"] + "" != ""
        ) {
          let startOff = item["timeOpr1"] == 1 ? item["timeOprCount1"] : "-" + item["timeOprCount1"],
            endOff = item["timeOpr2"] == 1 ? item["timeOprCount2"] : "-" + item["timeOprCount2"];
          startOff = parseInt(startOff);
          endOff = parseInt(endOff);
          if (startOff > endOff) {
            this.$message.error("终止日期不能小于开始日期");
            let offset = 0, time = "";
            if (index == 0) {
              this.$set(item, "timeOprCount1", item["timeOprCount2"]);
              this.$set(item, "timeOpr1", item["timeOpr2"]);
              offset = item["timeOpr" + this.suffix2] == 2 ? "-" + item["timeOprCount" + this.suffix2] : item["timeOprCount" + this.suffix2];
              offset = parseInt(offset);
              time = getTimeFromOffset(this.filterData[curindex].show_format, offset);
            } else {
              this.$set(item, "timeOprCount2", item["timeOprCount1"]);
              this.$set(item, "timeOpr2", item["timeOpr1"]);
              offset = item["timeOpr" + this.suffix2] == 2 ? "-" + item["timeOprCount" + this.suffix2] : item["timeOprCount" + this.suffix2];
              offset = parseInt(offset);
              time = getTimeFromOffset(this.filterData[curindex].show_format, offset);
            }
            this.$set(item.m_value, index, time);
          }
        }
      },
      defaultChange() {
        var item = this.filterData;
        if (item.isSetDefault) {
          this.filterData["timeOpr1"] = 2
          this.filterData["timeOpr2"] = 2
          this.filterData["timeOprCount1"] = 0
          this.filterData["timeOprCount2"] = 0
          let m_value = "";

          m_value = getTimeFromOffset(
            item.show_format,
            0
          );
          this.$set(item.m_value, 0, m_value);
          this.$set(item.m_value, 1, m_value);
        } else {

          this.$set(item.m_value, 0, '');
          this.$set(item.m_value, 1, '');
          this.filterData["timeOpr1"] = 2
          this.filterData["timeOpr2"] = 2
          this.filterData["timeOprCount1"] = 0
          this.filterData["timeOprCount2"] = 0
        }
      },
      numberValid(InputEvent, numList, order) {
        let val = numList[order].m_value
        if (val === null || val === undefined || val === '') {
          InputEvent.target.value = ''
        } else if(numList[order].label > 7) {
          let val2 = inputNumber(val,'mulit').replace(/\-+$/g,'')
          numList[order].m_value = val2
        }
      },
      numValid(index) {
        let num = this.filterData.numList[index]
        let val = num.m_value
        if (num.label > 7) {
          let val2 = inputNumber(val,'mulit')
          num.m_value = val2
        }
      },
      conCaculsChange(val) {
        let numList = this.filterData.numList
        if (val != 0 && numList[1]) {
          this.$set(this.filterData.numList, 1, {m_value: '', label: 2, id: '1'})
        }
      },
      handleChange(index) {
        if (this.filterData.numList[index].label == 21 || this.filterData.numList[index].label == 20) {
          this.filterData.numList[index].m_value = ''
        }
      },
      checkIsNullInput(item,index){
        let val = item['timeOprCount' + index];
        if (val === null || val === '') {
          this.$message.error("偏移量不能为空");
          this.$set(item.m_value, index - 1, item.m_value[index == 1 ? 1 : 0]);
          this.$set(item, 'timeOprCount' + index, item['timeOprCount' + (index == 1 ? 2 : 1)]);
          this.$set(item, 'timeOpr' + index, item['timeOpr' + (index == 1 ? 2 : 1)]);
        }
      }
    },
  }
</script>
<style lang="scss" scoped>
$main-color: #409eff; //主色调
$bg-clr01: #ecf5ff; // 块背景色1
$txt-clr01: #67c23a; // 文字颜色1
$txt-clr02: #fff; // 文字颜色2
$txt-clr03: #606266; // 文字颜色3

/deep/ .el-input-group__prepend {
  width: 60px;
  background: $txt-clr02;
}

/deep/ .el-input-group__append,
.el-input-group__prepend {
  background-color: #fff !important;
}

/deep/ .numSel .el-input input {
  padding-left: 10px !important;
}

/deep/ .el-input-group > .el-input__inner {
  display: unset;

  &[type="number"] {
    padding-right: 0;
  }
}

.con-line {
  color: $main-color;
  display: block;
  height: 28px;
  line-height: 28px;
  font-size: 14px;
  font-weight: bold;
  margin-right: 12px;

  > span {
    color: $txt-clr03;
    font-weight: normal;
    margin-right: 3px;
  }
}

.con-line-green {
  color: $txt-clr01;

  > span {
    color: $txt-clr03;
    font-weight: normal;
    margin-right: 3px;
  }
}

/deep/ .number-input {
  >input.el-input__inner {
    padding-right: 0;
  }
}

.area {
  /deep/ .el-select__tags {
    height: 26px;
    overflow-y: hidden;
    z-index: 1000 !important;
  }

  /deep/ .el-tag {
    width: auto !important;
    margin: 2px 0 2px 6px !important;
    line-height: 18px !important;
    height: 20px !important;
    border: none !important;
    background: #f0f2f5 !important;
    color: #909399 !important;
  }
}

/deep/ .el-input.is-disabled .el-input-group__prepend {
  .el-input__icon,
  .el-input__inner {
    cursor: pointer;
  }
}
</style>
