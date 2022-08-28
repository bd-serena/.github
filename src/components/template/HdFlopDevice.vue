<template>
  <div style="width:100%;height:100%;position:relative;">
    <div
      v-if="vscompt.comptAttrs.extendSetting.isSetNickName&&vscompt.comptAttrs.extendSetting.nickName==''"
      :style="{'font-size': vscompt.comptAttrs.extendSetting.kpiFontSize+'px','color': vscompt.comptAttrs.extendSetting.kpiColor}"
    >{{kpi}}</div>
    <div
      v-if="(vscompt.comptAttrs.extendSetting.isSetNickName)&&(vscompt.comptAttrs.extendSetting.nickName!='')"
      :style="{'font-size': vscompt.comptAttrs.extendSetting.kpiFontSize+'px','color': vscompt.comptAttrs.extendSetting.kpiColor}"
    >{{vscompt.comptAttrs.extendSetting.nickName}}</div>
    <bd-div
      type="bd-FlopDevice-hd"
      :oridata="this.oridata"
      :key="Math.random()"
      v-bind="vscompt.comptAttrs.extendSetting"
      style="    padding: 5px;display:inline-block "
      :unitName="vscompt.comptAttrs.extendSetting.unitName"
      :unitFontSize="vscompt.comptAttrs.extendSetting.unitFontSize"
      :unitColor="vscompt.comptAttrs.extendSetting.unitColor"
    ></bd-div>
    <!-- <div
      :style="{'display':'inline-block','font-size': vscompt.comptAttrs.extendSetting.unitFontSize+'px','color': vscompt.comptAttrs.extendSetting.unitColor}"
    >{{vscompt.comptAttrs.extendSetting.unitName}}</div>-->
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex";
import {
  constructList,
  getRequestParam,
  addPageCondis,
  getLinkRequestParam,
  dataInterval,
  loadDataDone,
  loadDataError
} from "../../utils/comonFunc.js";
export default {
  props: ["vscompt"],
  data() {
    return {
      kpi: "",
      oridata: []
    };
  },
  mounted() {},
  methods: {
    ...mapActions({
      queryComptData: "QueryTable/queryComptData",
      setLinkageCondi: "PageDesign/setLinkageCondi",
      gotoPage: "PageDesign/gotoPage"
    }),
    dealData() {
      for (var i = 0; i < this.oridata.length; i++) {
        if (this.oridata[i] != ".") {
          let num = this.oridata[i];
          this.oridata[i] = parseInt(num);
        }
      }
    },
    queryLinkData(linkageCondi) {
      let params = getLinkRequestParam({
        linkageCondi: linkageCondi,
        vscompt: this.vscompt,
        xAxisData: this.xAxisData,
        yAxis1Data: this.yAxis1Data,
        yAxis2Data: this.yAxis2Data,
        dataType: 1
      });
      this.executeReqest(params);
    },
    queryData(param) {
      let params = getRequestParam({
        param: param,
        vscompt: this.vscompt,
        drillData: this.drillData,
        xAxisData: this.xAxisData,
        yAxis1Data: this.yAxis1Data,
        yAxis2Data: this.yAxis2Data,
        dataType: 1,
        datasetMap: this.datasetMap
      });
      this.executeReqest(params);
    },
    executeReqest(params) {
      if (this.pageCache.operation == "preview")
        params = addPageCondis({
          vscompt: this.vscompt,
          params: params,
          datasetMap: this.datasetMap,
          pageParams: this.getPageParams,
          queryCompts: this.getQueryCompts()
        });
      var _this = this;
      let computedData = this.vscompt.comptAttrs.computedData||[];
      this.queryComptData({ params, computedData })
        .then(function(response) {
          if (response.data.respResult == 1) {
            let comptData = response.data.respData;
            if (
              comptData.columns != undefined &&
              comptData.columns.length > 0 &&
              comptData.columns.indexOf("XXXXCODE") > -1
            ) {
              comptData.columns.pop();
            }
            if (comptData.rows == null || comptData.rows == undefined) {
              comptData.rows = [];
            }
            if (comptData.columns == null || comptData.columns == undefined) {
              comptData.columns = [];
            }
            _this.vscompt.comptData = comptData;
            loadDataDone(_this.vscompt);
          } else {
            loadDataError(_this.vscompt,'数据更新失败');
            // _this.$message.error("数据更新失败");
            console.error(response.data.respErrorDesc);
          }
        })
        .catch(function(error) {
          console.error(error);
          // _this.$message.error("数据更新失败");
        })
        .finally(() => {
          _this.vscompt.comptAttrs.loading = false;
        });
    }
  },
  computed: {
    ...mapState({
      isDSMapReady: state => state.AnalyReportAttr.isDSMapReady,
      datasetMap: state => state.AnalyReportAttr.datasetMap,
      pageCache: state => state.HomeBody.pageCache,
      linkStack: state => state.PageDesign.linkStack
    }),
    ...mapGetters({
      getPageParams: "PageDesign/getPageParams",
      getQueryCompts: "PageDesign/getQueryCompts"
    }),
    isCanDrill() {
      return this.vscompt.comptAttrs.drillData.length > 1;
    },
    xAxisData() {
      var result = [];
      if (this.vscompt.comptAttrs.xAxisData.length > 0) {
        result =
          constructList(this.vscompt.comptAttrs.xAxisData, this.datasetMap, this.vscompt.comptAttrs.computedData || [])
            .resultList || [];
      }
      return result;
    },
    yAxis1Data() {
      var result = [];
      if (this.vscompt.comptAttrs.yAxis1Data.length > 0) {
        result =
          constructList(this.vscompt.comptAttrs.yAxis1Data, this.datasetMap, this.vscompt.comptAttrs.computedData || [])
            .resultList || [];
      }
      return result;
    },
    yAxis2Data() {
      var result = [];
      if (this.vscompt.comptAttrs.yAxis2Data.length > 0) {
        result =
          constructList(this.vscompt.comptAttrs.yAxis2Data, this.datasetMap, this.vscompt.comptAttrs.computedData || [])
            .resultList || [];
      }
      return result;
    },
    drillData() {
      var result = [];
      if (this.vscompt.comptAttrs.drillData.length > 0) {
        result =
          constructList(this.vscompt.comptAttrs.drillData, this.datasetMap, this.vscompt.comptAttrs.computedData || [])
            .resultList || [];
      }
      return result;
    },
    isPageLinkSet() {
      return (
        this.vscompt.comptAttrs["pageLinkageData"] != undefined &&
        this.vscompt.comptAttrs["pageLinkageData"].length > 0
      );
    }
  },
  watch: {
    isDSMapReady: {
      immediate: true, // immediate选项可以开启首次赋值监听
      handler(newVal, oldVal) {
        if (this.vscompt.comptAttrs.curDrillIdx == undefined) {
          this.$set(this.vscompt.comptAttrs, "curDrillIdx", 0);
          this.$set(this.vscompt.comptAttrs, "drillWBeanList", []);
        }
        if (this.vscompt.comptData == undefined) {
          this.$set(this.vscompt, "comptData", {
            columns: [],
            rows: []
          });
          this.$set(this.vscompt.comptAttrs, "isNeedRestDrill", 0);
        }

        if (
          newVal &&
          this.vscompt.afId != "" &&
          this.vscompt.comptData.columns.length == 0
        ) {
          this.queryData();
        }
        if (this.pageCache.operation == "preview") {
          //数据刷新
          let time = this.vscompt.comptAttrs.extendSetting.timerValue;
          dataInterval(
            time,
            this.queryData,
            this.vscompt.comptAttrs.extendSetting
          );
        }
      }
    },
    "vscompt.comptData": {
      deep: true,
      immediate: true,
      handler(newVal, oldVal) {
        if (this.vscompt.comptData == undefined) {
          return;
        }

        if (this.vscompt.comptData.columns.length != 0) {
          this.kpi = this.vscompt.comptData.columns[0];
          this.oridata = this.vscompt.comptData.rows[0][this.kpi].split("");
          var number = this.vscompt.comptData.rows[0][this.kpi];
          var y = String(number).indexOf(".") + 1; //获取小数点的位置
          if (y > 0) {
            let count = number.toString().split(".")[1].length;
            if (count > 5) {
              this.vscompt.styleAttrs[0].children[6].value = "";
            }
            if (this.vscompt.comptAttrs.extendSetting.precision != "") {
              this.oridata = [];
              this.oridata = Number(number)
                .toFixed(this.vscompt.comptAttrs.extendSetting.precision)
                .split("");
              this.vscompt.styleAttrs[0].children[6].value = this.vscompt.comptAttrs.extendSetting.precision;
              this.dealData();
            } else {
              this.oridata = [];
              number = Math.round(number);
              this.oridata = Number(number)
                .toFixed(this.vscompt.comptAttrs.extendSetting.precision)
                .split("");
              this.vscompt.styleAttrs[0].children[6].value = "";
              this.dealData();
            }
          } else {
            //整数补0
            let str = "";
            let pre = this.vscompt.comptAttrs.extendSetting.precision;
            if (pre == "2") {
              str = ".00";
            } else if (pre == "3") {
              str = ".000";
            } else if (pre == "4") {
              str = ".0000";
            } else if (pre == "5") {
              str = ".00000";
            } else if (pre == "1") {
              str = ".0";
            }

            number = number + str;
            this.oridata = [];
            this.oridata = number.split("");
            this.dealData();
          }
        }
      }
    },
    "vscompt.comptAttrs.extendSetting.precision": {
      deep: true,
      // immediate: true,
      handler(newVal, oldVal) {
        if (this.kpi == "") {
          return;
        }
        var number = this.vscompt.comptData.rows[0][this.kpi];
        if (newVal != 0) {
          //小数

          var y = String(number).indexOf(".") + 1; //获取小数点的位置
          if (y > 0) {
            //是小数
            this.oridata = [];
            this.oridata = Number(number)
              .toFixed(newVal)
              .split("");
            this.dealData();
          } else {
            //
            let str = ".0";
            if (newVal == 2) {
              str = ".00";
            } else if (newVal == 3) {
              str = ".000";
            } else if (newVal == 4) {
              str = ".0000";
            } else if (newVal == 5) {
              str = ".00000";
            }

            number = number + str;
            this.oridata = [];
            this.oridata = number.split("");
            this.dealData();
          }
        } else {
          //整数

          this.oridata = [];
          this.oridata = Number(number)
            .toFixed(newVal)
            .split("");
          this.dealData();
        }
      }
    },
    "vscompt.comptAttrs.linkageCondi": {
      //监听联动
      // immediate: true,
      deep: true,
      handler(newVal, oldVal) {
        if (this.vscompt.comptAttrs.isLinkage) {
          this.queryLinkData(newVal || []);
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.drill-label {
  position: absolute;
  left: 5px;
  bottom: 3px;
  cursor: pointer;
  z-index: 100;
  .drill-icon {
    font-size: 12px;
  }
  &:hover {
    color: #409cfb;
  }
}
.link-reset {
  left: 5px;
  bottom: 2px;
}
</style>
