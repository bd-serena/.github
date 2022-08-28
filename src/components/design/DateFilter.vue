<template>
  <div class="datafilter">
    <div style="height: 100%">
      <GeminiScrollbar class="my-scroll-bar">
        <el-col :span="5">
          <div
            v-for="(item,index) in filterData"
            style=" height: 30px;padding-right: 10px;margin-bottom: 10px;"
            :class="['df_name',{'date_name':item.type=='ElDatePicker','date_name2':item.isSetDefault}]"
            :id="'auto_df'+index"
            :key="'auto_df'+index"
          >
            <span :title="item[showTypeArr[item.show_type]]">{{ item[showTypeArr[item.show_type]] }}</span>
            <!-- <span :title="item.col_chs_name">{{ item.col_chs_name }}</span> -->
          </div>
        </el-col>
        <el-col :span="19" style="padding-right: 15px;">
          <div v-for="(item,index) in filterData" :key="index">
            <!--数值类型 -->
            <div v-if="item.type=='ElNumber'" style="width: 100%;height:30px;margin-bottom: 10px;">
              <div style="width: 100%;height:30px;">
                <el-col :span="10" style="height:30px;margin-top: 2px;">
                  <el-input
                    style="width:132px;"
                    size="mini"
                    class="number-input"
                    v-model="item.numList[0].m_value"
                    :id="'auto_input'+index"
                    :type="(item.numList[0]||{}).label < 7 ? 'number' : 'text'"
                    @blur="event=>numberValid(event,item.numList,0)"
                    @input="numValid(index,0)"
                    :disabled="item.numList[0]&&(item.numList[0].label==21||item.numList[0].label==20)"
                    :title="item.numList[0].m_value"
                  >
                    <el-select
                      style="width:65px; background-color:transparent"
                      placeholder
                      v-model="item.numList[0].label"
                      slot="prepend"
                      size="mini"
                      :key="Math.random()"
                      :id="'auto_syms_'+index"
                      @change="handleChange(item.numList,index,0)"
                    >
                      <el-option
                        v-for="item in symbols"
                        :key="Math.random()"
                        :value="item.value"
                        :label="item.label"
                        :id="'auto_sym'+index+item.value"
                      ></el-option>
                    </el-select>
                  </el-input>
                </el-col>
                <el-col :span="4" style="margin-top: 2px;height:30px">
                  <el-select
                    v-model="item.radioCalcu"
                    placeholder
                    size="mini"
                    :key="Math.random()"
                    class="numSel"
                    :id="'auto_cons_'+index"
                    @change="val=>conCaculsChange(val,index)"
                  >
                    <el-option
                      v-for="item in conCaculs"
                      :key="Math.random()"
                      :label="item.label"
                      :value="item.value"
                      :id="'auto_con'+index+'_'+item.value"
                    ></el-option>
                  </el-select>
                </el-col>
                <el-col
                  :span="10"
                  style="margin:2px 0 10px;height:30px;text-align:right;padding-right:1px"
                  v-show="item.radioCalcu != '0'"
                >
                  <el-input
                    style="width:132px;"
                    v-model="(item.numList[1]||{}).m_value"
                    class="number-input"
                    size="mini"
                    :id="'auto_input1_'+index"
                    :type="(item.numList[1]||{}).label < 7 ? 'number' : 'text'"
                    @blur="event=>numberValid(event,item.numList,1)"
                    @input="numValid(index,1)"
                    :disabled="item.numList[1]&&(item.numList[1].label==21||item.numList[1].label==20)"
                    :title="(item.numList[1]||{}).m_value"
                  >
                    <el-select
                      style="width:65px; background-color:transparent"
                      placeholder
                      v-model="(item.numList[1]||{}).label"
                      slot="prepend"
                      size="mini"
                      :id="'auto_syms2_'+index"
                      @change="handleChange(item.numList,index,1)"
                    >
                      <el-option
                        v-for="item in symbols"
                        :key="Math.random()"
                        :value="item.value"
                        :label="item.label"
                        :id="'auto_sym_'+index+item.value"
                      ></el-option>
                    </el-select>
                  </el-input>
                </el-col>
              </div>
            </div>
            <!--地市类型 -->
            <div
              v-else-if="item.type == 'ElCascader'"
              style="width: 100%;margin-bottom: 10px;height:30px"
              class="area"
            >
              <SelectTree
                :options="item.dfAreaSels"
                :vscompt="item"
              />
            </div>
            <!-- 文本类型-->
            <div
              v-else-if="item.type=='ElInput'"
              style="width: 100%;margin-bottom: 10px;height:30px"
            >
              <div style="width: 100%;margin-bottom: 10px;height:30px">
                <el-input
                  placeholder
                  v-model="item.symbol==20||item.symbol==21? '':item.m_value"
                  class="input-with-select"
                  size="mini"
                  style="margin-bottom: 10px;"
                  :disabled="item.symbol==20||item.symbol==21"
                  :title="item.symbol==20||item.symbol==21? '':item.m_value"
                >
                  <el-select v-model="item.symbol" slot="prepend" placeholder style="width: 104px;">
                    <el-option
                      v-for="item in contains"
                      :key="Math.random()"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </el-input>
              </div>
            </div>
            <!-- 日期类型-->
            <div
              v-else-if="item.type=='ElDatePicker'"
              style="width: 100%;margin-bottom: 10px;"
              :class="item.isSetDefault? 'date_ischeck':'date_uncheck'"
            >
              <div style="height:38px;width:100%">
                <el-col :span="11">
                  <el-date-picker
                    size="mini"
                    v-model="item.m_value[0]"
                    placeholder="开始日期"
                    style="margin-bottom: 10px;"
                    @change="startDateChange(item.m_value[0],index)"
                    :type="setTimeFormat(item.show_format,2)"
                    :format="setTimeFormat(item.show_format,1)"
                    :value-format="setTimeFormat(item.show_format,1)"
                    :disabled="item.isSetDefault"
                    :class="item.dateCycle=='date' ? 'datePicker-date' : 'datePicker-datetime'"
                    :title="item.isSetDefault?'':item.m_value[0]"
                  ></el-date-picker>
                </el-col>
                <el-col :span="2" style="text-align: center;padding-top: 4px;">
                  <span>至</span>
                </el-col>
                <el-col :span="11">
                  <el-date-picker
                    size="mini"
                    v-model="item.m_value[1]"
                    placeholder="结束日期"
                    style="margin-bottom: 10px;"
                    @change="endDateChange(item.m_value[1],index)"
                    :type="setTimeFormat(item.show_format,2)"
                    :format="setTimeFormat(item.show_format,1)"
                    :value-format="setTimeFormat(item.show_format,1)"
                    :disabled="item.isSetDefault"
                    :class="item.dateCycle=='date' ? 'datePicker-date' : 'datePicker-datetime'"
                    :title="item.isSetDefault?'':item.m_value[1]"
                  ></el-date-picker>
                </el-col>
              </div>
              <div style="height:calc(100% - 38px);width:100%;">
                <el-checkbox
                  v-model="item.isSetDefault"
                  style="height:20px"
                  @change="defaultChange(index)"
                >设置默认值</el-checkbox>
                <div style="height:calc(100% - 20px);width:100%" v-if="item.isSetDefault">
                  <el-row style="    margin: 3px 0;">
                    <el-col>开始时间：</el-col>
                  </el-row>
                  <el-row>
                    <el-col :span="24">
                      <el-row>
                        <el-col :span="2.5">
                          <a href="javascript:;" class="con-line con-line-green">
                            <span>偏移量</span>T
                          </a>
                        </el-col>
                        <el-col :span="11">
                          <el-input
                            placeholder="请输入偏移量"
                            size="mini"
                            v-model.number="item.timeOprCount1"
                            class="input-with-select"
                            @input="dateOffsetChange({type:1,index:0,curIndex:index})"
                            @blur="checkIsNullInput(item,1)"
                            :title="item.timeOprCount1"
                          >
                            <el-select
                              v-model="item.timeOpr1"
                              slot="prepend"
                              placeholder
                              @change="dateOffsetChange({type:1,index:0,curIndex:index})"
                            >
                              <el-option
                                v-for="initem in timeOprs"
                                :key="initem.value"
                                :value="initem.value"
                                :label="initem.label"
                              ></el-option>
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
                          <a href="javascript:;" class="con-line">
                            <span>偏移量</span>T
                          </a>
                        </el-col>
                        <el-col :span="11">
                          <el-input
                            placeholder="请输入偏移量"
                            size="mini"
                            v-model.number="item.timeOprCount2"
                            class="input-with-select"
                            @input="dateOffsetChange({type:1,index:1,curIndex:index})"
                            @blur="checkIsNullInput(item,2)"
                            :title="item.timeOprCount2"
                          >
                            <el-select
                              v-model="item.timeOpr2"
                              slot="prepend"
                              placeholder
                              @change="dateOffsetChange({type:1,index:1,curIndex:index})"
                            >
                              <el-option
                                v-for="item in timeOprs"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                              ></el-option>
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
        </el-col>
      </GeminiScrollbar>
    </div>
  </div>
</template>
<script>
import { mapState, mapGetters, mapActions } from "vuex";
import SelectTree from "../template/ElTreeSelectNew.vue";
import { setTimeFormat, getTimeFromOffset, objCloneByReplaceKey, inputNumber } from "../../utils/comonFunc.js";
export default {
  components: {
    SelectTree
  },
  data() {
    return {
      suffix2: "",
      timeOprCount1: 0,
      timeOpr1: 2,
      timeOprs: [{ value: 1, label: "+" }, { value: 2, label: "-" }],
      valueId: [], // 初始值
      valueText: [],
      conCaculs: [
        { value: "or", label: "或" },
        { value: "and", label: "且" },
        { value: "0", label: "无" }
      ],
      contains: [
        /* { value: 10, label: "包含" },
        { value: 11, label: "不包含" },
        { value: 8, label: "在…中（逗号隔开）" },
        { value: 9, label: "不在…中（逗号隔开）" },
        { value: 20, label: "为空" },
        { value: 21, label: "不为空" } */
      ],
      dfAreaSels: [],
      dfArea: [],
      symbols: [
        /* { value: 2, label: ">" },
        { value: 1, label: "<" },
        { value: 3, label: "=" },
        { value: 4, label: "<=" },
        { value: 5, label: ">=" },
        { value: 8, label: "在…中（逗号隔开）" },
        { value: 9, label: "不在…中（逗号隔开）" } */
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
    var areaList = this.filterData;
    for (let i = 0; i < areaList.length; i++) {
      if (areaList[0].hasOwnProperty("isSetDefault") == false) {
        areaList[i].isSetDefault = false;
      }
      if (areaList[i].type == "ElCascader") {
        // this.getDimRelation(i);
      } else if (areaList[i].type == "ElNumber") {
        if (areaList[i].numList.length == 1) {
          areaList[i].numList = [
            { id: "0", m_value: "", label: 2 },
            { id: "1", m_value: "", label: "" }
          ];
        }
      } else if (areaList[i].type == "ElDatePicker" && areaList[i].isSetDefault == true) {
        this.dateOffsetChange({ type: 1, index: 0, curIndex: i });
        this.dateOffsetChange({ type: 1, index: 1, curIndex: i});
      }
    }
  },
  created() {
    const defaultSymbol = require("../../../public/comptConfig/cellCompt.json");
    this.symbols = defaultSymbol.ElNumberSymbols
    this.contains = defaultSymbol.ElInputSymbols
  },
  computed: {
    ...mapState({
      fieldSetList: state => state.compt.fieldSetList,
      datasetName: state => state.compt.datasetName,
      dgwMsUrl: state => state.dgwMsUrl,
      filterData: state => state.QueryTable.filterData
    }),
    ...mapGetters({
      //filterData: "QueryTable/upFilterData"
    })
  },
  watch: {
    //     filterData: {
    //   handler(val) {
    //     console.log(val[0]['numList'], "过滤组件新智")
    //   },
    //   deep: true
    // }
  },
  methods: {
    ...mapActions({
      querySingleDimInfo: "AnalyReportAttr/querySingleDimInfo"
    }),
    setTimeFormat: setTimeFormat,

    getValue(value, index) {
      var item = this.filterData[index];
      item.m_value = value;
    },
    getDimRelation(index) {
      var item = this.filterData[index];
      var param = {
        dim_id: item.dim_id,
        dim_level_id: item.dim_level_id,
        is_all_data: "1",
        parent_val: ""
      };
      var _this = this;
      this.querySingleDimInfo(param).then(function (response) {
        var data = response.data.respData;
        if (response.data.respResult == "1") {
          data = objCloneByReplaceKey(data, { "dimValue": "dim_value", "dimValueDesc": "label" });
          item.dfAreaSels = data;
          _this.$set(_this.filterData, index, item);
        } else {
          _this.$message.error("维层信息查询失败");
          item.dfAreaSels = [];
          _this.$set(_this.filterData, index, item);
        }
      })
        .catch(err => {
          // _this.$message.error(err);
        });
    },

    startDateChange(val, index) {
      var item = this.filterData[index];
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
        } else if (item.m_value[1] === undefined) {
          // 时间区间才设了起始时间，也要使m_value变成区间格式
          this.$set(item.m_value, 1, '');
        }
      }
      // if (val) {
      //   var item = this.filterData[index];
      //   var nowDate = new Date(val).getTime();
      //   var originDate = new Date(item.m_value[1]).getTime();
      //   if (item.m_value[1] && nowDate > originDate) {
      //     this.$message.error("终止日期不得小于起始日期");
      //   }
      // }
    },
    endDateChange(val, index) {
      var item = this.filterData[index];
      if (val) {
        var nowDate = new Date(val).getTime();
        var originDate = new Date(item.m_value[0]).getTime();
        if (
          item.show_format &&
          item.show_format.indexOf("-") < 0 &&
          item.show_format.indexOf("/") < 0
        ) {
          nowDate = parseInt(val);
          originDate = parseInt(item.m_value[0]);
        }
        if (item.m_value[0] && nowDate < originDate) {
          this.$message.error("终止日期不得小于起始日期");
          this.$set(item.m_value, 1, item.m_value[0]);
        }

        // var item = this.filterData[index];
        // var nowDate = new Date(val).getTime();
        // var originDate = new Date(item.m_value[0]).getTime();
        // if (item.m_value[0] && nowDate < originDate) {
        //   this.$message.error("终止日期不得小于起始日期");
        // }
      }
    },

    handleCheckChange(data, checked, indeterminate) {
      this.valueId = this.$refs.selectTree[0].getCheckedKeys();
    },
    // 时间偏移量变化
    dateOffsetChange(paramObj) {
      var item = this.filterData[paramObj.curIndex];
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
        offset = item["timeOpr" + suffix] == 2 ? "-" + item["timeOprCount" + suffix] : item["timeOprCount" + suffix];
        offset = parseInt(offset);
      }
      var time = getTimeFromOffset(item.show_format, offset);
      this.$set(item.m_value, paramObj.index, time);

      if (paramObj.index == 0) {
        this.checkIfOutRange(0, paramObj.curIndex);
      } else {
        this.checkIfOutRange(1, paramObj.curIndex);
      }
    },
    /** index 0--开始 1--结束
     * type: 1-改时间 2-改偏移量
     *
     */
    checkIfOutRange(index, curindex) {
      var item = this.filterData[curindex];
      if (
        item["timeOprCount1"] + "" != "" &&
        item["timeOprCount2"] + "" != ""
      ) {
        var startOff =
          item["timeOpr1"] == 1
            ? item["timeOprCount1"]
            : "-" + item["timeOprCount1"];
        var endOff =
          item["timeOpr2"] == 1
            ? item["timeOprCount2"]
            : "-" + item["timeOprCount2"];
        startOff = parseInt(startOff);
        endOff = parseInt(endOff);
        if (startOff > endOff) {
          this.$message.error("终止日期不能小于开始日期");
          var offset = 0;
          var time = "";
          if (index == 0) {
            this.$set(item, "timeOprCount1", item["timeOprCount2"]);
            this.$set(item, "timeOpr1", item["timeOpr2"]);
            offset =
              item["timeOpr" + this.suffix2] == 2
                ? "-" + item["timeOprCount" + this.suffix2]
                : item["timeOprCount" + this.suffix2];
            offset = parseInt(offset);
            time = getTimeFromOffset(
              this.filterData[curindex].show_format,
              offset
            );
          } else {
            this.$set(item, "timeOprCount2", item["timeOprCount1"]);
            this.$set(item, "timeOpr2", item["timeOpr1"]);
            offset =
              item["timeOpr" + this.suffix2] == 2
                ? "-" + item["timeOprCount" + this.suffix2]
                : item["timeOprCount" + this.suffix2];
            offset = parseInt(offset);
            time = getTimeFromOffset(
              this.filterData[curindex].show_format,
              offset
            );
          }
          this.$set(item.m_value, index, time);
        }
      }
    },
    defaultChange(index) {
      var item = this.filterData[index];
      if (item.isSetDefault) {
        this.$set(item, "timeOpr1", 2);
        this.$set(item, "timeOpr2", 2);
        this.$set(item, "timeOprCount1", 0);
        this.$set(item, "timeOprCount2", 0);
        // const date = new Date();
        // const year = date.getFullYear();
        // const month = date.getMonth();
        // const day = date.getDate();
        // let fix = "";
        let m_value = "";
        // if (item["show_format"] == "YYYYMMDDHHMISS") {
        //   m_value =
        //     year +
        //     "" +
        //     (month + 1).toString().padStart(2, "0") +
        //     day +
        //     "" +
        //     "000000";
        // } else if (item["show_format"] == "YYYYMMDD") {
        //   m_value =
        //     year + "" + (month + 1).toString().padStart(2, "0") + day + "";
        // } else if (item["show_format"] == "YYYYMM") {
        //   m_value = year + "" + (month + 1).toString().padStart(2, "0");
        // } else {
        //   m_value = year + "";
        // }
        m_value = getTimeFromOffset(
              item.show_format,
              0
            );
        this.$set(item.m_value, 0, m_value);
        this.$set(item.m_value, 1, m_value);
      } else {
        this.$set(item.m_value, 0, "");
        this.$set(item.m_value, 1, "");
        this.$set(item, "timeOpr1", 2);
        this.$set(item, "timeOpr2", 2);
        this.$set(item, "timeOprCount1", 0);
        this.$set(item, "timeOprCount2", 0);
      }
    },
    numberValid(InputEvent,numList,order) {
      let val = numList[order].m_value
      if (val === null || val === undefined || val === '') {
        InputEvent.target.value = ''
      } else if(numList[order].label > 7) {
        let val2 = inputNumber(val,'mulit').replace(/\-+$/g,'')
        numList[order].m_value = val2
      }
      // if(numList[order]) {
        // let val2 = inputNumber(val)
        // this.filterData[index].numList[order].m_value = val2
      // } else {
      //   this.$set(this.filterData[index].numList, order, { m_value: '', label: 2, id: '1' })
      // }
    },
    numValid(index,order) {
      let num = this.filterData[index].numList[order]
      let val = num.m_value
      if (num.label > 7) {
        let val2 = inputNumber(val,'mulit')
        num.m_value = val2
      }
    },
    conCaculsChange(val,index) {
      let numList = this.filterData[index].numList
      if (val != 0 && numList[1]) {
       this.$set(this.filterData[index].numList, 1, { m_value: '', label: 2, id: '1' })
      }
    },
    handleChange(numList,index,order) {
      if(numList[order]) {
        let val = numList[order].label
        if (val == 21 || val == 20) {
          this.filterData[index].numList[order].m_value = ''
        }
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
  activated() { }
};
</script>
<style lang="scss" scoped>
$border-clr01: #dcdfe6; // 边框色1
$main-color: #409eff; //主色调
$bg-clr01: #ecf5ff; // 块背景色1
$txt-clr01: #67c23a; // 文字颜色1
$txt-clr02: #fff; // 文字颜色2
$txt-clr03: #606266; // 文字颜色3
.datafilter {
  height: 216px;
  /deep/.df_name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    height: 30px;
    line-height: 28px;
  }
  /deep/.date_name {
    height: 60px !important;
  }
  /deep/.date_name2 {
    height: 180px !important;
  }
  /deep/.date_ischeck {
    height: 180px;
  }
  /deep/.date_uncheck {
    height: 60px;
  }
  /deep/ .el-input.is-disabled .el-input-group__prepend {
    .el-input__icon,
    .el-input__inner {
      cursor: pointer;
    }
  }
  /deep/.el-input-group__prepend {
    width: 60px;
    background: #fff;
  }
  /deep/.el-tag {
    width: auto !important;
    margin: 2px 0 2px 6px !important;
    line-height: 18px !important;
    height: 20px !important;
  }
  /deep/.el-input-group__append,
  .el-input-group__prepend {
    background-color: #fff !important;
  }
  /deep/.numSel .el-input input {
    padding-left: 10px !important;
  }
  /deep/.el-input-group > .el-input__inner {
    display: unset;
  }
  .el-scrollbar .el-scrollbar__view .el-select-dropdown__item {
    height: auto;
    // padding: 0;
  }
  .el-select-dropdown__item.selected {
    font-weight: normal;
  }
  /* .el-select {
          /* height: 28px;
      } */
}
.area /deep/ .el-select__tags {
  height: 26px;
  overflow-y: hidden;
  z-index: 200 !important;
}

.area /deep/ .el-select__tags:hover {
  overflow-y: auto;
}
.area /deep/ .el-select__tags::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 6px; /*高宽分别对应横竖滚动条的尺寸*/
  height: 6px;
}
.area /deep/ .el-select__tags::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 5px;
  background: rgba(144, 147, 153, 0.3);
}
.area /deep/ .el-select__tags::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  border-radius: 0;
}
/deep/ .el-select-dropdown__item.hover,
.el-select-dropdown__item:hover {
  background-color: #fff !important;
}
/deep/ .el-select-dropdown__item {
  padding: 0px;
}
.el-scrollbar .el-scrollbar__view .el-select-dropdown__item {
  height: auto;
  // padding: 0;
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
/deep/.number-input {
  >input.el-input__inner {
    padding-right: 0;
  }
}
/deep/.input-with-select.is-disabled .el-input-group__prepend {
 .el-input__icon,
 .el-input__inner {
    cursor: pointer;
  }
}
.datePicker-date{
  width:155px;
}
.datePicker-datetime{
  width:175px;
}
</style>

