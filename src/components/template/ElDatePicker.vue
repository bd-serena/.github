<template>
  <el-form
    size="mini"
    :label-width="vscompt.labelWidth"
    :class="{'range':vscompt.cycleType=='daterange','jixi-date':vscompt.dateCycle!='datetime','jixi-datetime':vscompt.dateCycle=='datetime','range-datetime':vscompt.cycleType=='daterange' && vscompt.dateCycle=='datetime'}"
  >
    <el-form-item
      :required="vscompt.isRequired || vscompt.isSetRequired"
      :label="vscompt.label"
      :title="vscompt.label"
    >
      <el-date-picker
        ref="date"
        v-model="vscompt.m_value[0]"
        :value-format="dateFormat"
        :format="dateFormat"
        @change="startDateChange"
        :type="vscompt.dateCycle"
        :placeholder="vscompt.placeholder"
        :title="vscompt.m_value[0]"
      ></el-date-picker>
      <span v-if="vscompt.cycleType=='daterange'" style="margin:0 10px">至</span>
      <el-date-picker
        v-if="vscompt.cycleType=='daterange'"
        :value-format="dateFormat"
        :format="dateFormat"
        @change="endDateChange"
        v-model="vscompt.m_value[1]"
        :type="vscompt.dateCycle"
        :placeholder="vscompt.placeholder"
        :title="vscompt.m_value[1]"
      ></el-date-picker>
    </el-form-item>
  </el-form>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import {
  setTimeFormat,
  getTimeFromOffset,
  getFieldFromDsMap,
  objDeepCopy
} from "../../utils/comonFunc.js";
export default {
  props: ["vscompt"],
  data() {
    return {
      optData: null,
      param: null
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
        //有设置默认值显示默认值，没有设置就为空
        // var length=this.vscompt.m_value.length;
        // this.vscompt.m_value.splice(0,this.vscompt.m_value.length);
        // var dateNew=this.getResult(length);
        // this.vscompt.m_value=dateNew;
        if (this.vscompt.cycleType === "date") {
          this.dateOffsetChange({ type: 0, index: 0 });
        } else if (this.vscompt.cycleType === "daterange") {
          this.dateOffsetChange({ type: 1, index: 0 });
          this.dateOffsetChange({ type: 1, index: 1 });
        }
      }
    }
    // if (!this.vscompt.isSetDefault) {
    //   this.vscompt.m_value[0] = "";
    //   this.vscompt.m_value[1] = "";
    // }
  },
  computed: {
    linkData() {
      let data = this.vscompt.mainLinkageData || [];
      return data;
    },
    isQueryBtn() {
      let target = this.$parent.$parent.vscompt;

      if (this.pageCache.classTypeId == "1005") {
        target = this.$parent.$parent.$parent.$parent.vscompt.comptAttrs;
      }
      if (target != null) {
        let data = (target.extendSetting || {}).isNeedBtn || "false";
        return data;
      } else {
        return "false";
      }
    },
    dateFormat() {
      return setTimeFormat(this.vscompt.show_format, 1);
      // if (this.vscompt.dateCycle == 'month') {
      //     if(this.vscompt.show_format && this.vscompt.show_format.indexOf("-") < 0){
      //         return 'yyyyMM';
      //     }else
      //         return 'yyyy-MM';
      // }else if (this.vscompt.dateCycle == 'year') {
      //     return 'yyyy';
      // }else {
      //     let fix = "";
      //     if(this.vscompt.show_format && this.vscompt.show_format.toLowerCase().indexOf("ss") > -1) fix += "000000";
      //     if(this.vscompt.show_format && this.vscompt.show_format.indexOf("-") < 0){
      //         return 'yyyyMMdd'+fix;
      //     }else
      //         return 'yyyy-MM-dd'+fix;
      // }
    },
    ...mapGetters({
      flatCompt: "PageDesign/getFlatCompt"
    }),
    ...mapState({
      pageCache: state => state.HomeBody.pageCache,
      s_edcuiCompts: state => state.PageDesign.s_edcuiCompts,
      datasetMap: state => state.AnalyReportAttr.datasetMap
    })
  },
  watch: {
    "vscompt.isSetDefault": {
      handler(newVal, oldVal) {
        if (!newVal) {
          if(!this.vscompt.noClean && this.pageCache.operation !== 'wait' && this.pageCache.operation !== undefined){
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
    }
  },
  methods: {
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
        param.rel_element_id = subComp.element_id;
        param.cycleType = subComp.cycleType;
        param.rel_show_format = subComp.show_format;
        param.format = subComp.source_format;
        param.target_format = subComp.show_format;
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
    endDateChange(val) {
      if (val) {
        var nowDate = new Date(val).getTime();
        var originDate = new Date(this.vscompt.m_value[0]).getTime();
        if (
          this.vscompt.show_format &&
          this.vscompt.show_format.indexOf("-") < 0 &&
          this.vscompt.show_format.indexOf("/") < 0
        ) {
          nowDate = parseInt(val);
          originDate = parseInt(this.vscompt.m_value[0]);
        }
        if (this.vscompt.m_value[0] && nowDate < originDate) {
          this.$message.error("终止日期不得小于起始日期");
          this.$set(this.vscompt.m_value, 1, this.vscompt.m_value[0]);
        }
      } else {
        this.$set(this.vscompt.m_value, 1, "");
      }
      if (this.isQueryBtn == "false" && this.linkData.length > 0) {
        this.setLinkageCondi();
        this.linkageState = true;
      }
    },
    startDateChange(val) {
      if (val) {
        var nowDate = new Date(val).getTime();
        var originDate = new Date(this.vscompt.m_value[1]).getTime();
        if (
          this.vscompt.show_format &&
          this.vscompt.show_format.indexOf("-") < 0 &&
          this.vscompt.show_format.indexOf("/") < 0
        ) {
          nowDate = parseInt(val);
          originDate = parseInt(this.vscompt.m_value[1]);
        }
        if (
          this.vscompt.m_value[1] &&
          nowDate > originDate &&
          this.vscompt.cycleType == "daterange"
        ) {
          this.$message.error("终止日期不得小于起始日期");
          this.$set(this.vscompt.m_value, 0, this.vscompt.m_value[1]);
        }
      } else {
        this.$set(this.vscompt.m_value, 0, "");
      }
      if (this.isQueryBtn == "false" && this.linkData.length > 0) {
        this.setLinkageCondi();
        this.linkageState = true;
      }
    },
    getNowDate() {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      var m_value, date_type;
      var show_format = this.vscompt.show_format.toLowerCase();
      try {
        date_type =
          show_format == "yyyy"
            ? 3
            : show_format == "yyyy-mm" || show_format == "yyyy/mm"
            ? 2
            : 1;
      } catch (e) {
        console.error(e);
      }
      if (date_type == 1) {
        //日
        m_value =
          year +
          "-" +
          (month + 1).toString().padStart(2, "0") +
          "-" +
          day.toString().padStart(2, "0");
      } else if (date_type == 2) {
        //月
        m_value = year + "-" + (month + 1).toString().padStart(2, "0");
      } else if (date_type == 6) {
        m_value = year;
      }
      return m_value;
    },
    getResult(length) {
      var vscompt = this.vscompt;
      var data = [];
      if (length == 1) {
        var timeOpr = vscompt.timeOpr;
        var timeOprCount = vscompt.timeOprCount;
        if (vscompt.dateCycle == "month") {
          data.push(this.monthsChange(timeOpr, timeOprCount));
        } else {
          data.push(this.daysChange(timeOpr, timeOprCount));
        }
      } else if (length == 2) {
        var timeOpr1 = vscompt.timeOpr1;
        var timeOprCount1 = vscompt.timeOprCount1;
        var timeOpr2 = vscompt.timeOpr2;
        var timeOprCount2 = vscompt.timeOprCount2;
        if (vscompt.dateCycle == "month") {
          data.push(this.monthsChange(timeOpr1, timeOprCount1));
          data.push(this.monthsChange(timeOpr2, timeOprCount2));
        } else {
          data.push(this.daysChange(timeOpr1, timeOprCount1));
          data.push(this.daysChange(timeOpr2, timeOprCount2));
        }
      }
      return data;
    },
    daysChange(timeOpr, timeOprCount) {
      var days = timeOprCount;
      var newTime = "";
      if (days) {
        var nowDate = new Date();
        var now = new Date(
          nowDate.getFullYear() +
            "-" +
            (nowDate.getMonth() + 1) +
            "-" +
            nowDate.getDate()
        );
        var nowStamp = now.getTime();
        var opr1 = timeOpr || 1;
        var timeDistance = days * 24 * 60 * 60 * 1000;
        var timeStamp;
        if (opr1 == 1) {
          timeStamp = parseInt(nowStamp) + parseInt(timeDistance);
        } else if (opr1 == 2) {
          timeStamp = parseInt(nowStamp) - parseInt(timeDistance);
        }
        var newTimeStamp = new Date(timeStamp);
        var month =
          newTimeStamp.getMonth() + 1 < 10
            ? "0" + (newTimeStamp.getMonth() + 1)
            : newTimeStamp.getMonth() + 1;
        var day =
          newTimeStamp.getDate() < 10
            ? "0" + newTimeStamp.getDate()
            : newTimeStamp.getDate();
        newTime = newTimeStamp.getFullYear() + "-" + month + "-" + day;
      }
      return newTime;
    },
    monthsChange(timeOpr, timeOprCount) {
      var months = timeOprCount || 0;
      var nowDate = new Date();
      var nowMonth = nowDate.getMonth() + 1;
      var opr1 = timeOpr || 1;
      var timeStamp;
      if (opr1 == 1) {
        timeStamp = months;
      } else if (opr1 == 2) {
        timeStamp = -months;
      }
      var monthDistance = parseInt(timeStamp) + parseInt(nowMonth);
      var yearDistance = 0;
      var newYear;
      var newMonth;
      if (monthDistance <= 0) {
        yearDistance = Math.floor(monthDistance / 12);
        if (monthDistance % 12 == 0) {
          yearDistance--;
        }
        monthDistance = 12 + (monthDistance % 12);
      } else {
        if (monthDistance > 12) {
          yearDistance = Math.floor(monthDistance / 12);
          monthDistance = monthDistance % 12;
        }
      }
      newMonth = monthDistance;
      newYear = nowDate.getFullYear() + yearDistance;
      newMonth = newMonth < 10 ? "0" + newMonth : newMonth;
      var newTime = newYear + "-" + newMonth;
      return newTime;
    },
    getDate(value) {
      var date = new Date(value);
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var days = date.getDate();
      month = month < 10 ? "0" + month : month;
      days = days < 10 ? "0" + days : days;
      return year + "-" + month + "-" + days;
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
    }
  }
};
</script>
<style lang="scss" scoped>
.range.el-form {
  width: 470px;
}
.range-datetime.el-form {
  width: 510px;
}
.jixi-date {
  /deep/.el-date-editor.el-input,
  /deep/.el-date-editor.el-input__inner {
    width: 140px;
  }
}
.jixi-datetime {
  /deep/.el-date-editor.el-input,
  /deep/.el-date-editor.el-input__inner {
    width: 180px;
  }
}
.dp-required {
  color: red;
  margin-right: 3px;
}
</style>
<style lang="scss">
.el-date-picker {
  // background: red !important;
  table {
    // background: yellow;
    .today{
      // background: red;
      .cell,span{
        color: #606266 ;
        font-weight: normal;
      }
      // .current:not(.disabled){当前且不为不可用的颜色默认为今天 current 和today并存
      //   .cell{
      //   color: #409eff !important;
      // }
      // }
    }
}
}
</style>
