<template>
  <div style="width:100%;height:100%;position:relative;" :class="[subTittleShow?'has-sub-text':'']">
    <div class="sub-text-wrap" v-show="subTittleShow">{{ extendSetting['title.subtext'] }}</div>
    <el-row class="flex-row">
      <el-col
        v-for="(item, index) in comptRows"
        :span="colSpan"
        :key="item.element_id"
        :class="setColClass()"
      >
        <div class="grid-content" v-if="colSetting[item.element_id]">
          <div class="progress-title">{{ colSetting[item.element_id].nickName || item.name }}</div>
          <!-- el-progress 不支持小数点的 -->
          <div class="el-progress el-progress--line">
            <!-- colSetting[item.element_id].decimalDigit -->
            <div :class="['el-progress-bar', `digit-${maxPercentLength}`]">
              <div class="el-progress-bar__outer" style="min-height: 6px; height: 12%;">
                <div
                  class="el-progress-bar__inner"
                  :style="{
                  width: `${item.percent}%`,
                  'background-color': colSetting[item.element_id].barColor || defaultColor[index]
                }"
                ></div>
              </div>
            </div>
            <div class="el-progress__text" style="font-size: 14.4px;">{{ `${item.percent}%` }}</div>
          </div>
          <div
            class="progress-title"
            v-if="extendSetting.labelValShow"
          >{{`实际${formatNumber(item.value)}， 目标${computeTarget(item)}`}}</div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex";
import {
  constructList,
  getRequestParam,
  addPageCondis,
  getLinkRequestParam,
  loadDataDone,
  loadDataError,
  formatNumber
} from "../../utils/comonFunc.js";
export default {
  props: ["vscompt"],
  data() {
    return {
      time: "",
      linkageState: false,
      // 默认柱形图颜色
      defaultColor: Object.freeze([
        "#19D4AE",
        "#5AB1EF",
        "#fa6e86",
        "#ffb980",
        "#0067a6",
        "#c4b4e4",
        "#d87a80",
        "#9cbbff",
        "#d9d0c7",
        "#87a997",
        "#d49ea2",
        "#5b4947",
        "#7ba3a8"
      ])
    };
  },
  mounted() {},
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
    targetMeasureEIds: {
      deep: true,
      handler: function(newVal) {
        if (newVal.length > 0) {
          this.queryData();
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
    extendSetting() {
      return this.vscompt.comptAttrs.extendSetting;
    },
    comptRows() {
      let newRows = [];
      const rows = (this.vscompt.comptData || {}).rows || [];
      if (rows.length === 0) {
        return newRows;
      }
      for (const key in rows[0]) {
        if (rows[0].hasOwnProperty(key)) {
          const element = rows[0][key];
          const dataItem = this.yAxis1Data.find(item => item.nick_name === key);
          if (dataItem) {
            let dynamicTargetVal = rows[0][`${dataItem.element_id}_target`]
              ? rows[0][`${dataItem.element_id}_target`]
              : "";
            const dataObj = {
              element_id: dataItem.element_id,
              name: key,
              value: element,
              dynamicTargetVal
            };
            newRows.push({
              ...dataObj,
              ...{
                percent: this.countPercent(dataObj)
              }
            });
          }
        }
      }
      return newRows;
    },
    colSpan() {
      return Math.floor(24 / this.extendSetting.rowDisplayCount);
    },
    colSetting() {
      return this.vscompt.comptAttrs.colSetting;
    },
    // 动态目标度量 element_id数组
    targetMeasureEIds() {
      let eIdArr = [];
      for (const key in this.colSetting) {
        if (this.colSetting.hasOwnProperty(key)) {
          const curColSet = this.colSetting[key];
          if (
            curColSet &&
            curColSet.targetSetMode === "dynamic" &&
            curColSet.dynamicElementId
          ) {
            eIdArr.push({
              element_id: curColSet.dynamicElementId, // 目标度量ID
              fun_type: curColSet.dynamicPolymerizeType,
              src_element_id: key // 当前度量ID
            });
          }
        }
      }
      return eIdArr;
    },
    calcHeight() {
      const { rowDisplayCount } = this.extendSetting;
      let height = 33.333333;
      if (rowDisplayCount !== 3) {
        height = 100 / rowDisplayCount;
      }
      return `${height}%`;
    },
    // 百分比最大位数，用来算右边数据占位宽度
    maxPercentLength() {
      const percentArr = this.comptRows.map(row => (row.percent + "").length);
      return Math.max(...percentArr, 3) - 3;
    }
  },

  methods: {
    formatNumber,
    ...mapActions({
      queryComptData: "QueryTable/queryComptData",
      setLinkageCondi: "PageDesign/setLinkageCondi",
      gotoPage: "PageDesign/gotoPage"
    }),
    computeTarget(item) {
      const oriVal = this.getTargetVal(item);
      if (!oriVal || isNaN(Number(oriVal))) {
        return "--";
      } else {
        return this.formatNumber(oriVal);
      }
    },
    setColClass() {
      let classArr = [];
      const { rowDisplayCount } = this.extendSetting;
      if (rowDisplayCount === 5) {
        classArr.push("five-col");
      }
      // 如果进度条总数>每行展示个数，则需要flex:1撑开
      if (this.comptRows.length > rowDisplayCount && rowDisplayCount > 1) {
        // classArr.push('col-avg');
      }
      return classArr.join(" ");
    },
    queryData(param) {
      let params = getRequestParam({
        param: param,
        vscompt: this.vscompt,
        drillData: [],
        xAxisData: [],
        yAxis1Data: this.yAxis1Data,
        yAxis2Data: [],
        dataType: 1,
        datasetMap: this.datasetMap
      });
      this.executeReqest(params);
    },
    executeReqest(params) {
      if (!params || !params.afQueryBean || !params.afQueryBean.select_list || params.afQueryBean.select_list.length === 0) {
        return;
      }
      // 把目标度量的数据也一起查
      let targetMeasureList = [];
      let selectList = params.afQueryBean.select_list;
      const curDataset = this.datasetMap[this.vscompt.afId] || [];
      this.targetMeasureEIds.forEach(field1 => {
        const { element_id, fun_type, src_element_id } = field1;
        const targetMeasure = curDataset.find(
          item => item.element_id === element_id
        );
        if (targetMeasure) {
          targetMeasureList.push({
            ...targetMeasure,
            ...{
              nick_name: `${src_element_id}_target`, // 目标度量值
              fun_type: fun_type || "2"
            }
          });
        }
      });
      params.afQueryBean.select_list = selectList.concat(targetMeasureList);
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
      params.afQueryBean.head_bean.pageCount = 100;
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
      let params = getLinkRequestParam({
        linkageCondi: linkageCondi,
        vscompt: this.vscompt,
        xAxisData: [],
        yAxis1Data: this.yAxis1Data,
        yAxis2Data: [],
        dataType: 1
      });
      this.executeReqest(params);
    },
    getTargetVal(dataObj) {
      const { element_id, dynamicTargetVal } = dataObj;
      const curColSet = this.colSetting[element_id] || {};
      let { targetSetMode, staticTargetVal } = curColSet;
      return targetSetMode === "static" ? staticTargetVal : dynamicTargetVal;
    },
    countPercent(dataObj) {
      const { element_id, value } = dataObj;
      const curColSet = this.colSetting[element_id] || {};
      let val1 = Number(value) || 0;
      const decimalDigit = Number(curColSet.decimalDigit);
      let result = 100;
      const oriVal = Number(this.getTargetVal(dataObj));
      const target = oriVal || 0;
      if (target !== 0) {
        result = (val1 / oriVal) * 100;
      }
      return parseFloat(result).toFixed(decimalDigit);
    }
  }
};
</script>

<style lang="scss" scoped>
/deep/.time {
  display: inline-block;
}
/deep/ .five-col.el-col {
  width: 20% !important;
}
/deep/ .flex-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: center;
  flex: 1;
  width: 100%;
  height: 100%;
  .grid-content {
    height: 100%;
    width: 100%;
  }
  .el-col {
    padding: 0 10px;
  }
}
/deep/ .el-progress-bar {
  @for $i from 1 through 10 {
    &.digit-#{$i} {
      padding-right: 50px + 10 * $i;
      margin-right: -(50px + 10 * $i + 5);
    }
  }
}
</style>
