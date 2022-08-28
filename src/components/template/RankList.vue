<template>
  <div style="width:100%;height:100%;position:relative;" 
  :class="{'rank-list-wrap':true, 'has-sub-text':subTittleShow}">
    <div class="sub-text-wrap" v-show="subTittleShow">{{ extendSetting['title.subtext'] }}</div>
    <el-container>
      <el-header v-if="extendSetting.colNameShow" height="30px">
        <div class="rank-item">
          <div
            :class="[index === displayCols.length - 1 ? 'data-bar-col' : 'info-col']"
            v-for="(item, index) in displayCols"
            :key="item"
            :style="index===1?{
              width: '80px'
            }:{}"
          >{{item}}</div>
        </div>
      </el-header>
      <el-main :style="{
    height: extendSetting.colNameShow?'calc(100% - 30px)':'100%'
  }">
        <el-scrollbar style="height:100%;" :native="false" :noresize="false" tag="section">
          <div class="rank-item" v-for="(item, index) in comptRows" :key="item[dimName]">
            <div class="info-col num-block">
              <span :class="['num-block-style'+extendSetting.topThreeShowType]">{{ index + 1 }}</span>
            </div>
            <div
              class="info-col title-wrap"
              @click="dimClick(item[dimName])"
              :title="item[dimName]"
            >{{ item[dimName] }}</div>
            <div
              class="info-col right value-wrap"
              v-if="extendSetting.dataLabelShow && extendSetting.labelShowPosition==='left'"
              :title="item[mesureName]"
            >{{ formatNumber(item[mesureName], 2) }}</div>
            <div class="data-bar-col">
              <el-progress
                :color="extendSetting.dataBarColor"
                :show-text="false"
                :percentage="countPercent(item[mesureName])"
                status="exception"
              ></el-progress>
            </div>
            <div
              class="info-col value-wrap"
              v-if="extendSetting.dataLabelShow && extendSetting.labelShowPosition==='right'"
              :title="item[mesureName]"
            >{{ formatNumber(item[mesureName], 2) }}</div>
          </div>
        </el-scrollbar>
      </el-main>
    </el-container>
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
import { mapActions, mapGetters, mapState } from "vuex";
import {
  constructList,
  getRequestParam,
  addPageCondis,
  getLinkRequestParam,
  dataInterval,
  loadDataDone,
  loadDataError,
  formatNumber
} from "../../utils/comonFunc.js";
export default {
  props: ["vscompt"],
  data() {
    return {
      time: "",
      linkageState: false
    };
  },
  mounted() {
    if (this.vscompt.afId == "" || this.vscompt.comptData == undefined) {
      this.$set(this.vscompt, "comptData", {
        columns: [],
        rows: []
      });
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
    subTittleShow() {
      return this.extendSetting['title.subtext'];
    },
    xAxisData() {
      var result = [];
      if (this.vscompt.comptAttrs.xAxisData.length > 0) {
        result =
          constructList(
            this.vscompt.comptAttrs.xAxisData,
            this.datasetMap,
            this.vscompt.comptAttrs.computedData || []
          ).resultList || [];
      }
      return result;
    },
    yAxis1Data() {
      var result = [];
      if (this.vscompt.comptAttrs.yAxis1Data.length > 0) {
        result =
          constructList(
            this.vscompt.comptAttrs.yAxis1Data,
            this.datasetMap,
            this.vscompt.comptAttrs.computedData || []
          ).resultList || [];
      }
      return result;
    },
    isPageLinkSet() {
      return (
        this.vscompt.comptAttrs["pageLinkageData"] != undefined &&
        this.vscompt.comptAttrs["pageLinkageData"].length > 0
      );
    },
    extendSetting() {
      return this.vscompt.comptAttrs.extendSetting;
    },
    comptRows() {
      return (this.vscompt.comptData || {}).rows || [];
    },
    comptColumns() {
      return (this.vscompt.comptData || {}).columns || [];
    },
    dimName() {
      return this.comptColumns[0] || "";
    },
    mesureName() {
      return this.comptColumns.length >= 2 ? this.comptColumns[1] : "";
    },
    displayCols() {
      return ["排序", ...this.comptColumns];
    },
    // 最大的度量值
    maxMeasureVal() {
      const valueArr = this.comptRows.map(item => item[this.mesureName]);
      return Math.max(...valueArr) || 1;
    }
  },
  methods: {
    formatNumber,
    ...mapActions({
      queryComptData: "QueryTable/queryComptData",
      setLinkageCondi: "PageDesign/setLinkageCondi",
      gotoPage: "PageDesign/gotoPage"
    }),
    queryData(param) {
      console.log("queryData");
      let params = getRequestParam({
        param: param,
        vscompt: this.vscompt,
        drillData: [],
        xAxisData: this.xAxisData,
        yAxis1Data: this.yAxis1Data,
        yAxis2Data: [],
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
      params.afQueryBean.head_bean.pageCount = 100;
      // 内置条件 度量降序
      params.afQueryBean.order_list = this.yAxis1Data.map(item => {
        return {
          col_id: item.col_id,
          element_id: item.element_id,
          obj_id: item.obj_id,
          order_type: 2
        };
      });
      if (params.afQueryBean.select_list.length === 0) {
        return;
      }
      var _this = this;
      let computedData = this.vscompt.comptAttrs.computedData || [];
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
            console.log("请求条件", params, comptData);
            loadDataDone(_this.vscompt);
          } else {
            loadDataError(_this.vscompt, "数据更新失败");
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
      console.log("queryLinkData");
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
    countPercent(value) {
      return parseFloat(((value / this.maxMeasureVal) * 100).toFixed(2));
    },
    dimClick(label) {
      if (
        (this.vscompt.comptAttrs["mainLinkageData"] != undefined &&
          this.vscompt.comptAttrs["mainLinkageData"].length > 0) ||
        this.isPageLinkSet
      ) {
        this.setLinkageCondi({
          label,
          xAxisData: this.xAxisData,
          vscompt: this.vscompt,
          isJumpNewPage: true
        });
        this.linkageState = true;
      } else {
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
/deep/.time {
  display: inline-block;
}
.rank-list-wrap {
  /deep/ .el-container {
    .el-header,
    .el-main {
      padding: 0;
    }
    .rank-item {
      position: relative;
      // line-height: normal;
      // display: inline-table;
      width: 100%;
      height: 28px;
      line-height: 28px;
      // border-collapse: separate;
      // border-spacing: 0;

      .info-col {
        vertical-align: middle;
        display: inline-block;
        // display: table-cell;
        position: relative;
        padding: 0 5px;
        // width: 1px;
        white-space: nowrap;
        &:first-child {
          min-width: 38px;
          text-align: center;
        }
        &.right {
          text-align: right;
        }
        &.title-wrap,
        &.value-wrap {
          cursor: pointer;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          word-break: break-all;
        }
        &.title-wrap {
          text-align: left;
          width: 80px;
        }
        &.value-wrap {
          width: 82px;
          text-align: right;
        }
      }
      .data-bar-col {
        // -webkit-appearance: none;
        // background-image: none;
        // box-sizing: border-box;
        display: inline-block;
        // outline: none;
        padding: 0 10px;
        width: calc(100% - 200px);
        // display: table-cell;
        vertical-align: middle;
      }
      .num-block-style2 {
        padding: 0 5px;
        color: #606266;
        background-color: #e4e7ed;
      }
      &:first-child {
        .num-block-style2 {
          background-color: #ffb606;
          color: #ffffff;
        }
      }
      &:nth-child(2) {
        .num-block-style2 {
          background-color: #aeb8c2;
          color: #ffffff;
        }
      }
      &:nth-child(3) {
        .num-block-style2 {
          background-color: #d6a184;
          color: #ffffff;
        }
      }
    }
    .el-header .rank-item {
      color: #606266;
    }
  }
}
</style>