/**
 * 所有组件模版都会用到的公用数据，方法
 */
import {
  mapState,
  mapGetters,
  mapActions
} from 'vuex';
import {
  constructList,
  getRequestParam,
  getLinkRequestParam,
  dataInterval,
  adjustQueryParams,
  addPageCondis,
  loadDataDone,
  loadDataError
} from "../../../utils/comonFunc.js";
export default {
  props: ["vscompt"],
  data() {
    return {
      linkageState: false,
      // 混入watch不希望执行mixins里的代码的属性
      mixinsEffectOn: {
        // isDSMapReady: false eg：不希望执行内部的isDSMapReady监听
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
      activedCompt: 'PageDesign/getActivedCompt',
      getPageParams: "PageDesign/getPageParams",
      getQueryCompts: "PageDesign/getQueryCompts"
    }),
    // 页面是否处于预览状态
    isPagePreview() {
      return this.pageCache.operation === "preview";
    },
    fieldDataObj() {
      return JSON.parse(this.vscompt.comptAttrs.fieldDataObj || '{}');
    },
    isCanDrill() {
      return this.drillData.length > 1;
    },
    computedData() {
      // 因为页面处于非外部预览（设计，内部预览）时，使用fieldDataObj里面的数据（即点击确定时的数据），在保存完外部预览，使用vscompt.comptAttrs下的数据
      return this.isPagePreview ? this.vscompt.comptAttrs.computedData : (this.fieldDataObj.computedData || []);
    },
    xAxisData() {
      let result = [];
      // 因为页面处于非外部预览（设计，内部预览）时，使用fieldDataObj里面的数据（即点击确定时的数据），在保存完外部预览，使用vscompt.comptAttrs下的数据
      const selData = this.isPagePreview ? this.vscompt.comptAttrs.xAxisData : (this.fieldDataObj.xAxisData || []);
      if (selData.length > 0) {
        result =
          constructList(selData, this.datasetMap, this.computedData || [])
          .resultList || [];
      }
      return result;
    },
    yAxis1Data() {
      let result = [];
      const selData = this.isPagePreview ? this.vscompt.comptAttrs.yAxis1Data : (this.fieldDataObj.yAxis1Data || []);
      if (selData.length > 0) {
        result =
          constructList(selData, this.datasetMap, this.computedData || [])
          .resultList || [];
      }
      return result;
    },
    yAxis2Data() {
      let result = [];
      const selData = this.isPagePreview ? this.vscompt.comptAttrs.yAxis2Data : (this.fieldDataObj.yAxis2Data || []);
      if (selData.length > 0) {
        result =
          constructList(selData, this.datasetMap, this.computedData || [])
          .resultList || [];
      }
      return result;
    },
    drillData() {
      let result = [];
      const selData = this.isPagePreview ? this.vscompt.comptAttrs.drillData : (this.fieldDataObj.drillData || []);
      if (selData.length > 0) {
        result =
          constructList(selData, this.datasetMap, this.computedData || [])
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
        if (this.mixinsEffectOn.isDSMapReady === false) {
          console.info('mixins isDSMapReady passed');
          return;
        }
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
    // "vscompt.comptAttrs.isNeedRestDrill": {
    //   immediate: true,
    //   handler(newVal, oldVal) {
    //     if (newVal > 0) {
    //       this.vscompt.comptAttrs.curDrillIdx = 0;
    //       this.vscompt.comptAttrs.drillWBeanList = [];
    //     }
    //   }
    // }
  },
  mounted() {
    if ((this.vscompt.afId == "" && this.vscompt.comptData == undefined)) {
      this.$set(this.vscompt, "comptData", {
        columns: [],
        rows: []
      });
      this.$set(this.vscompt.comptAttrs, "isNeedRestDrill", 0);
      this.$set(this.vscompt.comptAttrs, "isNeedResetLink", 0);
      this.$set(this.vscompt.comptAttrs, "fieldDataObj", '{}');
    }
  },
  methods: {
    ...mapActions({
      queryComptData: "QueryTable/queryComptData",
      setLinkageCondi: "PageDesign/setLinkageCondi",
      gotoPage: "PageDesign/gotoPage"
    }),
    queryLinkData(linkageCondi) {
      let params = getLinkRequestParam({
        linkageCondi: linkageCondi,
        vscompt: this.vscompt,
        xAxisData: this.xAxisData,
        yAxis1Data: this.yAxis1Data,
        yAxis2Data: [],
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
    resetLinage(item) {
      this.setLinkageCondi({
        label: "",
        xAxisData: this.xAxisData,
        vscompt: this.vscompt,
        isJumpNewPage: false
      });
      this.linkageState = false;
    },
    async executeReqest(params) {
      if (this.pageCache.operation == "preview") {
        params = addPageCondis({
          vscompt: this.vscompt,
          params: params,
          datasetMap: this.datasetMap,
          pageParams: this.getPageParams,
          queryCompts: this.getQueryCompts(),
          pageId: this.pageCache.pageId
        });
      }

      if (params.afQueryBean.select_list.length === 0) {
        return;
      }
      // 此方法用于组件个性化调整请求参数
      params = adjustQueryParams({
        params, 
        activedCompt: this.vscompt
      });
      let computedData = this.computedData || [];
      const response = await this.queryComptData({ params, computedData });
      if (response && response.data && response.data.respResult == 1) {
        // 处理组件请求成功的回调
        this.handleSuccResponse({
          respData: response.data.respData,
          params
        });
        loadDataDone(this.vscompt);
      } else {
        loadDataError(this.vscompt, "数据更新失败");
        console.error(response.data.respErrorDesc);
      }
      this.vscompt.comptAttrs.loading = false;
    },
    handleSuccResponse() {}
  }
}
