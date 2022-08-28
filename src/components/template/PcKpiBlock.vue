<template>
  <div style="width:100%;height:100%;position:relative;">
    <bd-div
      type="bd-kpiBlock-pc"
      :data="vscompt.comptData"
      v-bind="vscompt.comptAttrs.extendSetting"
      @click="blockClick"
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
  mounted() {
    if (this.vscompt.comptAttrs.curDrillIdx == undefined) {
      this.$set(this.vscompt.comptAttrs, "curDrillIdx", 0);
      this.$set(this.vscompt.comptAttrs, "drillWBeanList", []);
    }
    if (this.vscompt.afId == "" || this.vscompt.comptData == undefined) {
      this.$set(this.vscompt, "comptData", {
        columns: [],
        rows: []
      });
      this.$set(this.vscompt.comptAttrs, "isNeedRestDrill", 0);
      this.$set(this.vscompt.comptAttrs, "isNeedResetLink", 0);
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
          if(this.linkStack.length>0 && this.vscompt.comptAttrs.isLinkage){
            let param=[];
            for(let item of this.linkStack){
              if(item.comptId==this.vscompt.comptId){
                param=item.param;
                break;
              }
            }
            if(param.length>0){
              this.queryLinkData(param);
            }else{
              this.queryData();
            }
          }else{
            this.queryData();
          }
        }
        if (this.pageCache.operation == "preview"){ //数据刷新
          let time=this.vscompt.comptAttrs.extendSetting.timerValue;
          dataInterval(time,this.queryData,this.vscompt.comptAttrs.extendSetting);
        }
      }
    },
    "vscompt.comptAttrs.isNeedRestDrill": {
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal > 0) {
          this.vscompt.comptAttrs.curDrillIdx = 0;
          this.vscompt.comptAttrs.drillWBeanList = [];
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
        datasetMap:this.datasetMap
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
            _this.setSeries();
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
    blockClick(item) {
      if (
        (this.vscompt.comptAttrs["mainLinkageData"] != undefined &&
          this.vscompt.comptAttrs["mainLinkageData"].length > 0) ||
        this.isPageLinkSet
      ) {
        this.setLinkageCondi({
          label: item[this.vscompt.comptData.columns[0]],
          xAxisData: this.xAxisData,
          vscompt: this.vscompt,
          isJumpNewPage: true
        });
        this.linkageState = true;
      }else{
        this.gotoPage(this.vscompt.comptAttrs.extendSetting);
      }
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
    setSeries() {
      //缓存系列
      let compt = this.vscompt;
      if (compt.comptAttrs.extendSetting.series && compt.comptAttrs.extendSetting.series.length > 0) {
        compt.comptAttrs.extendSetting.cacheSeries = [...compt.comptAttrs.extendSetting.series];
      }
      //重载初始化系列(因拖拽排序后需载新的系列数据)
      let reinitialSeries = [];
      compt.comptData.columns.forEach((data, index) => {
        if (index > 0) {
          reinitialSeries.push({
            name: data,
            id: compt.comptAttrs.yAxis1Data[index - 1].element_id,
            decimalDigit: 3
          });
        }
      });
      //将缓存数据与新的系列数据匹配并进行属性合并
      if (compt.comptAttrs.extendSetting.cacheSeries && compt.comptAttrs.extendSetting.cacheSeries.length > 0) {
        reinitialSeries.forEach((seriesData, seriesIndex) => {
          compt.comptAttrs.extendSetting.cacheSeries.forEach(
            (cacheSeriesData, cacheSeriesIndex) => {
              if (seriesData.id === cacheSeriesData.id) {
                Object.assign(seriesData, cacheSeriesData);
              }
            }
          );
        });
      }
      //重新赋值系列
      compt.comptAttrs.extendSetting.series = [...reinitialSeries];
      //重新赋值选中索引值
      if (compt.comptAttrs.extendSetting.cacheSeries && compt.comptAttrs.extendSetting.cacheSeries.length > 0) {
        for(let i=0;i<compt.comptAttrs.extendSetting.series.length;i++) {
          if(compt.comptAttrs.extendSetting.series[i].id == compt.comptAttrs.extendSetting.cacheSeries[compt.comptAttrs.selectIndex]||{}.id){
            compt.comptAttrs.selectIndex = i;
            break;
          }
        }
      }
      //当度量删除剩下一个时，系列值选中值调整
      if (compt.comptAttrs.selectIndex == -1) {
        compt.comptAttrs.selectIndex = 0;
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
.drill-label {
  position: absolute;
  left: 5px;
  bottom: 3px;
  cursor: pointer;
  z-index: 100;
  .drill-icon {
    font-size: 12px;
    vertical-align: -1px;
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
