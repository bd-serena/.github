<template>
  <div>
    <div class="van-input">
      <span class="require-sign" v-show="vscompt.isSetRequired">*</span>
      <van-field
        v-model="vscompt.m_value[0]"
        :class="{'date-range':vscompt.cycleType=='daterange'}"
        @click="showPopup(0)"
        right-icon="notes-o"
        placeholder="请选择日期"
        readonly="readonly"
      />
      <span v-if="vscompt.cycleType=='daterange'" style="line-height:32px;float:left;width:10%;">至</span>
      <van-field
        v-if="vscompt.cycleType=='daterange'"
        class="date-range"
        v-model="vscompt.m_value[1]"
        @click="showPopup(1)"
        right-icon="notes-o"
        placeholder="请选择日期"
        readonly="readonly"
      />
    </div>
    <van-popup position="bottom" v-model="popShow" get-container="body">
      <van-datetime-picker
        v-model="currentDate"
        :type="dateType"
        @confirm="dateConfirm"
        @cancel="dateClear"
        :formatter="formatter"
      />
    </van-popup>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import { dateToYYYYMMDD } from "../../utils/DateUtil";
import {
  getTimeFromOffset,
  getFieldFromDsMap,
  objDeepCopy
} from "../../utils/comonFunc.js";
export default {
  props: ["vscompt"],
  data() {
    return {
      vanInput: "",
      popShow: false,
      dateIndex: 0,
      currentDate: new Date()
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
          // this.vscompt.m_value[0] = "";
          // this.vscompt.m_value[1] = "";
        } else {
          if (this.vscompt.cycleType === "date") {
            this.dateOffsetChange({ type: 0, index: 0 });
          } else if (this.vscompt.cycleType === "daterange") {
            this.dateOffsetChange({ type: 1, index: 0 });
            this.dateOffsetChange({ type: 1, index: 1 });
          }
        }
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
        param.cycleType = subComp.cycleType;
        param.rel_show_format = subComp.show_format;
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
    showPopup(val) {
      this.dateIndex = val;
      this.currentDate = this.popData;
      this.popShow = true;
    },
    dateConfirm(val) {
      this.vscompt.m_value[this.dateIndex] = dateToYYYYMMDD(
        this.currentDate,
        this.dateType
      );
      if (this.isQueryBtn == "false" && this.linkData.length > 0) {
        this.setLinkageCondi();
        this.linkageState = true;
      }
      this.popShow = false;
    },
    dateClear(){
      this.vscompt.m_value[this.dateIndex]='';
      if (this.isQueryBtn == "false" && this.linkData.length > 0) {
        this.setLinkageCondi();
        this.linkageState = true;
      }
      this.popShow=false;
    },
    formatter(type, value) {
      if (type === "year") {
        return `${value}年`;
      } else if (type === "month") {
        return `${value}月`;
      } else if (type == "day") {
        return `${value}日`;
      } else if (type == "hour") {
        return `${value}时`;
      } else if (type == "minute") {
        return `${value}分`;
      }
      return value;
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
    popData() {
      let date = this.currentDate;
      let param = this.vscompt.m_value[this.dateIndex]||"";
      if (param != "") {
        let y, m, d;
        switch (this.dateType) {
          case "year":
            date = new Date(param);
            break;
          case "year-month":
            y = param.substring(0, 4);
            m = param.substring(4, 6) - 1;
            date = new Date(y, m);
            break;
          case "date":
            y = param.substring(0, 4);
            m = param.substring(4, 6) - 1;
            d = param.substring(6, 8);
            date = new Date(y, m, d);
            break;
        }
      }
      return date;
    },
    dateType() {
      let result = "date";
      let type = this.vscompt.dateCycle;
      switch (type) {
        case "year":
          result = "year";
          break;
        case "month":
          result = "year-month";
          break;
        case "date":
          result = "date";
          break;
        case "datetime":
          result = "datetime";
          break;
      }
      return result;
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


