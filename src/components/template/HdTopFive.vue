<template>
  <div style="width:100%;height:100%;position:relative;">
    <bd-div
      type="bd-TopFive-hd"
      :oridata="this.oridata"
      v-bind="vscompt.comptAttrs.extendSetting"
      style="    padding: 5px;display:inline-block "
    ></bd-div>
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
      time: "",
      oridata: []
    };
  },
  mounted() {
    if (this.vscompt.comptData.rows.length != 0) {
      this.calcData();
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
        if (this.vscompt.comptData.rows.length != 0) {
          this.calcData();
        } else {
          this.oridata = [];
        }
      }
    },
    "vscompt.comptAttrs.extendSetting.pageSize": {
      // deep: true,
      handler(newVal, oldVal) {
        this.queryData();
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

  methods: {
    ...mapActions({
      queryComptData: "QueryTable/queryComptData",
      setLinkageCondi: "PageDesign/setLinkageCondi",
      gotoPage: "PageDesign/gotoPage"
    }),
    calcData() {
      let array = this.vscompt.comptData.rows;
      let name = this.vscompt.comptData.columns[0];
      let val = this.vscompt.comptData.columns[1];
      this.oridata = [];
      for (let i = 0; i < array.length; i++) {
        let obj = {
          index: i + 1,
          val: parseInt(array[i][val]),
          col: array[i][name]
        };
        // this.oridata.push(obj);
        this.$set(this.oridata, i, obj);
      }

      // var tem = this.vscompt.styleAttrs[0].children[0].value;
      // this.vscompt.styleAttrs[0].children[0].value = 1;
      // this.vscompt.styleAttrs[0].children[0].value = tem;
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
      var page = this.vscompt.comptAttrs.extendSetting.pageSize;
      params.afQueryBean.head_bean.pageCount = page;
      params.afQueryBean.is_need_paging = 1;
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
  }
};
</script>

<style lang="scss" scoped>
/deep/.time {
  display: inline-block;
}
</style>