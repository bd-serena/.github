<template>
  <div>
    <div class="van-input">
      <span class="require-sign" v-show="vscompt.isSetRequired">*</span>
      <van-field
        v-model="vscompt.m_value[0]"
        :class="{'date-range':vscompt.cycleType=='daterange'}"
        @click="openDatePicker(0)"
        right-icon="notes-o"
        placeholder="请选择日期"
        readonly="readonly"
      />
      <span v-if="vscompt.cycleType=='daterange'" style="line-height:32px;float:left;width:10%;">至</span>
      <van-field
        v-if="vscompt.cycleType=='daterange'"
        class="date-range"
        v-model="vscompt.m_value[1]"
        @click="openDatePicker(1)"
        right-icon="notes-o"
        placeholder="请选择日期"
        readonly="readonly"
      />
    </div>
  </div>
</template>

<script>
import {
  DatePicker
} from 'cube-ui'
import { mapState, mapGetters, mapActions } from "vuex";
import { dateToFormat } from "../../utils/DateUtil";
import {
  getTimeFromOffset,
  getFieldFromDsMap,
  objDeepCopy
} from "../../utils/comonFunc.js";
export default {
  components: {
    DatePicker
  },
  props: ["vscompt"],
  data() {
    return {
      model: {
        inputValue: "kk",
        inputValues: "",
        radioValue: "man",
        dateValue: "",
        selectValue: "",
        checkboxGroupValue: ["Phone", "DM", "EDM", "SMS", "Share to LCLG"]
      },
      vanInput: "",
      popShow: false,
      dateIndex: 0,
      currentDate: new Date(),
      formatList: []//日期源格式
    };
  },
  mounted() {
    if (
      this.pageCache.operation &&
      (this.pageCache.operation == "preview" ||
        this.pageCache.operation == "design")
    ) {
      if (
        this.vscompt.timeOprCount > 0 ||
        this.vscompt.timeOprCount1 > 0 ||
        this.vscompt.timeOprCount2 > 0
      ) {
        if (this.vscompt.cycleType === "date") {
          this.dateOffsetChange({ type: 0, index: 0 });
        } else if (this.vscompt.cycleType === "daterange") {
          this.dateOffsetChange({ type: 1, index: 0 });
          this.dateOffsetChange({ type: 1, index: 1 });
        }
      }
    }
  },
  watch: {
    "vscompt.isSetDefault": {
      handler(newVal, oldVal) {
        if (!newVal) {
          if (!this.vscompt.noClean && this.pageCache.operation !== 'wait' && this.pageCache.operation !== undefined) {
            this.vscompt.m_value[0] = "";
            this.vscompt.m_value[1] = "";
          }
        } else {
          if (this.vscompt.cycleType === "date") {
            this.dateOffsetChange({ type: 0, index: 0 });
          } else if (this.vscompt.cycleType === "daterange") {
            this.dateOffsetChange({ type: 1, index: 0 });
            this.dateOffsetChange({ type: 1, index: 1 });
          }
        }
        this.$nextTick(()=>{
          if (this.isQueryBtn == "false" && this.linkData.length > 0) {
            this.setLinkageCondi();
            this.linkageState = true;
          }
        })
      },
      deep: true,
      immediate: true
    },
    "vscompt.m_value": {
      handler(newVal){
        if (this.isQueryBtn == "false" && this.linkData.length > 0) {
          this.setLinkageCondi();
          this.linkageState = true;
        }
      }
    }
  },
  methods: {
    openDatePicker(val) {
      this.dateIndex = val;
      if(this.vscompt.formatLevel == undefined || this.vscompt.formatLevel == ""){//兼容旧代码
        let showFormat = this.vscompt.show_format;
        this.queryDateFormatList({}).then(response => {
            if (response.status == 200 && response.data.respResult == "1") {
              this.formatList = response.data.respData || [];
              for(let i = 0; i < this.formatList.length; i++){
                //数据源中的源格式YYYYMMDDHHMISS更改成yyyyMMddhh24miss，所以得把格式变成大写且去掉24来匹配是否一致。
                //若一致，把YYYYMMDDHHMISS替换成yyyyMMddhh24miss
                if(this.formatList[i].formatStr.toLocaleUpperCase().replace("24","") == showFormat.toLocaleUpperCase().replace("24","")){
                  this.vscompt.formatLevel = this.formatList[i].formatLevel;
                  this.vscompt.show_format = this.formatList[i].formatStr;
                  this.vscompt.source_format = this.formatList[i].formatStr;
                  break;
                }
              }
              this.showDatePicker();
            }else{
              this.formatList = [];
              this.$message.error("日期源格式查询失败");
            }
        });
      }else{
        this.showDatePicker();
      }
    },
    showDatePicker(){//展示日期选择面板
      let formatLevel = this.vscompt.formatLevel;
      if (!this.datePicker) {
        this.datePicker = this.$createDatePicker({
          title: 'Date Picker',
          value: new Date(),
          startColumn: 'year',
          columnCount: formatLevel,
          format: { year: 'YYYY', month: 'MM', date: 'DD', hour: 'hh', minute: 'mm', second: 'ss' },
          zIndex: 2000,
          onSelect: this.selectHandle,
          onCancel: this.cancelHandle
        })
      }
      this.datePicker.show()
    },
    selectHandle(date, selectedVal, selectedText) {
      //根据把selectedText数据根据时间格式转为字符串
      let formDate = dateToFormat(
        this.vscompt.show_format,
        selectedText
      );
      this.$set(this.vscompt.m_value, this.dateIndex, formDate);
    },
    cancelHandle() {//取消日期选择面板
      this.$set(this.vscompt.m_value, this.dateIndex, '');
      if (this.isQueryBtn == "false" && this.linkData.length > 0) {
        this.setLinkageCondi();
        this.linkageState = true;
      }
    },
    getComptById(id) {
      var result;
      for (var item of this.flatCompt) {
        if (item.comptId == id) {
          result = item;
          break;
        }
      }
      return result;
    },
    setLinkageCondi() {
      for (let index = 0; index < this.linkData.length; index++) {
        let link = this.linkData[index];
        var param = {};
        let result = [];
        let subComp = this.vscompt;
        // 查询组件的联动标记
        param.isFromQuery = true;
        param.rel_af_id = link.rel_af_id;
        param.m_value = subComp.m_value;
        param.compt_type = subComp.type;
        param.cycleType = subComp.cycleType;
        param.rel_show_format = subComp.show_format;
        param.format = subComp.source_format;
        param.target_format = subComp.show_format;
        param.rel_element_id = subComp.element_id;
        param.col_type = 2;
        param.exp_id = "";
        let res = getFieldFromDsMap(this.datasetMap, {
          element_id: link.element_id,
          af_id: link.af_id
        });
        param.obj_id = res.tab_id || "";
        param.col_id = res.col_id || "";
        param.element_id = link.element_id;
        param.is_dim = 0;
        if (subComp.m_value.length > 0) {
          if (subComp.cycleType == "date") {
            //单个值
            param.rule_value = subComp.m_value[0] || "";
            param.symbol = 3; //=
            result.push(objDeepCopy(param));
          } else {
            param.rule_value = subComp.m_value[0] || "";
            param.symbol = 5; //>=
            result.push(objDeepCopy(param));
            param.rule_value = subComp.m_value[1] || "";
            param.symbol = 4; //<=
            result.push(objDeepCopy(param));
          }
        }
        var target = this.getComptById(link.comptId);
        if (target == null) {
          continue;
        }
        target.comptAttrs.isLinkage = true;
        // let linkageCondi = target.comptAttrs.linkageCondi || [];
        // linkageCondi.splice(0, linkageCondi.length);
        // linkageCondi.push(...result);
        // 时间可能是单个也可能是区间(2个条件) 先把已有的删掉，再设值
        let linkageCondi = target.comptAttrs.linkageCondi || [],
          idxArr = [];
        for (let index2 = 0; index2 < linkageCondi.length; index2++) {
          const element = linkageCondi[index2];
          if (
            element.rel_element_id == param.rel_element_id &&
            element.element_id == param.element_id
          ) {
            idxArr.push(index2);
          }
        }
        for (let index3 = idxArr.length - 1; index3 > -1; index3--) {
          linkageCondi.splice(idxArr[index3], 1);
        }
        target.comptAttrs.linkageCondi.push(...result);
      }
    },
    // 时间偏移量变化
    dateOffsetChange(paramObj) {
      var item = this.vscompt;
      var suffix = "";
      if (paramObj.type == 1) {
        suffix = paramObj.index == 0 ? "1" : "2";
      }
      var offset = 0;
      if ((item["timeOprCount" + suffix] || 0) != "") {
        offset =
          item["timeOpr" + suffix] == 2
            ? "-" + item["timeOprCount" + suffix]
            : item["timeOprCount" + suffix];
        offset = parseInt(offset);
      }
      var time = getTimeFromOffset(this.vscompt.show_format, offset);
      this.$set(item.m_value, paramObj.index, time);
    },
    ...mapActions({
      queryDateFormatList: "DataSetDesign/queryDateFormatList"//日期源格式查询
    })
  },
  computed: {
    linkData() {
      let data = this.vscompt.mainLinkageData || [];
      return data;
    },
    isQueryBtn() {
      let target = this.$parent.$parent.$parent.$parent.vscompt.comptAttrs;
      if (target != null) {
        let data = (target.extendSetting || {}).isNeedBtn || "false";
        return data;
      } else {
        return "false";
      }
    },
    ...mapGetters({
      flatCompt: "PageDesign/getFlatCompt"
    }),
    ...mapState({
      pageCache: state => state.HomeBody.pageCache,
      datasetMap: state => state.AnalyReportAttr.datasetMap
    })
  }
};
</script>

<style lang="scss" scoped>
.van-input {
  .van-cell {
    padding: 5px 10px;
    line-height: 20px;
    border: 1px solid #ebeef5;
    border-radius: 5px;
  }
}
.date-range {
  float: left;
  width: 45%;
}
.require-sign{
  color:#F56C6C;
  position:absolute;
  top:7px;
  left:-10px;
  z-index: 1;
}
</style>
<style>
.cube-picker-confirm{
  color: #1989fa;
}
.cube-picker-title-group .cube-picker-title{
  display: none;
}
</style>



