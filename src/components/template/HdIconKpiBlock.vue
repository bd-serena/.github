<template>
  <div style="width:100%;height:100%;position:relative;">
    <bd-div
      type="bd-iconKpiBlock-hd"
      :data="vscompt.comptData"
      v-bind="vscompt.comptAttrs.extendSetting"
      @click.native="gotoUrl()"
    />
    <div
      class="drill-label link-reset"
      v-show="linkageState && vscompt.comptAttrs['mainLinkageData'] != undefined && vscompt.comptAttrs['mainLinkageData'].length>0"
      @click="resetLinage()"
    >
      <span class="icon-A10622_PreOffline" title="重置联动信息"></span>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
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
      linkageState: false
    };
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
    }
  },
  mounted() {
    if (this.vscompt.afId == "" && this.vscompt.comptData == undefined) {
      this.$set(this.vscompt, "comptData", {
        columns: [],
        rows: []
      });
      this.$set(this.vscompt.comptAttrs, "isNeedResetLink", 0);
    }
  },
  watch: {
    isDSMapReady: {
      immediate: true, // immediate选项可以开启首次赋值监听
      handler(newVal, oldVal) {
        if (this.vscompt.comptData == undefined) {
          this.$set(this.vscompt, "comptData", {
            columns: [],
            rows: []
          });
        }
        if (
          newVal &&
          this.vscompt.afId != "" &&
          this.vscompt.comptData.columns.length == 0
        ) {
          if (this.linkStack.length > 0 && this.vscompt.comptAttrs.isLinkage) {
            let param = [];
            for (let item of this.linkStack) {
              if (item.comptId == this.vscompt.comptId) {
                param = item.param;
                break;
              }
            }
            if (param.length > 0) {
              this.queryLinkData(param);
            } else {
              this.queryData();
            }
          } else {
            this.queryData();
          }
        }
        if (this.pageCache.operation == "preview"){ //数据刷新
          let time=this.vscompt.comptAttrs.extendSetting.timerValue;
          dataInterval(time,this.queryData,this.vscompt.comptAttrs.extendSetting);
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
    },
    "vscompt.comptAttrs.isNeedResetLink": {
      handler(newVal, oldVal) {
        if (
          newVal > 0 &&
          this.vscompt.comptAttrs["mainLinkageData"].length > 0 &&
          this.linkageState
        ) {
          this.resetLinage();
        }
      }
    }
  },
  methods: {
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
          queryCompts: this.getQueryCompts(),
          pageId: this.pageCache.pageId
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
    resetLinage(item) {
      this.setLinkageCondi({
        label: "",
        xAxisData: this.xAxisData,
        vscompt: this.vscompt,
        isJumpNewPage: false
      });
      this.linkageState = false;
    },
    gotoUrl(){
      if(!this.vscompt.comptAttrs.mainLinkageData||this.vscompt.comptAttrs.mainLinkageData.length == 0){
        this.gotoPage(this.vscompt.comptAttrs.extendSetting);
      }
    },
    ...mapActions({
      queryComptData: "QueryTable/queryComptData",
      setLinkageCondi: "PageDesign/setLinkageCondi",
      gotoPage: "PageDesign/gotoPage"
    })
  }
};
</script>
<style lang="scss" scoped>
.link-reset {
  left: 5px;
  bottom: 2px;
}
</style>
