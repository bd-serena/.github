<template>
  <div
    style="width:100%;height:100%;position:relative;cursor: pointer;"
    ref="centerContainer"
    @click="gotoPage(vscompt.comptAttrs.extendSetting)"
    :class="[subTittleShow?'has-sub-text':'']"
  >
    <div class="sub-text-wrap" v-show="subTittleShow">{{ vscompt.comptAttrs.extendSetting['title.subtext'] }}</div>
    <div class="from-to-chart">
      <div class="from-to-chart-main" :id="jsPlumbContainer">
        <div class="from-to-chart-main-wrapper">
          <div class="from-to-chart-from-container">
            <el-table
              :data="tableData.srcTbData"
              size="mini"
              row-key="id"
              ref="srcTable"
              style="width: 100%; overflow: hidden;"
              @hook:updated="deBounceRepaint"
              :key="tableRefreshKey"
            >
              <el-table-column
                label="来源"
                prop="label"
                align="left"
                :min-width="tableColWidth"
                :show-overflow-tooltip="true"
              />
              <el-table-column
                prop="value"
                :label="measureName"
                :min-width="tableColWidth"
                :show-overflow-tooltip="true"
              />
              <el-table-column
                label="占比"
                prop="percent"
                align="right"
                :min-width="tableColWidth"
                :show-overflow-tooltip="true"
              >
                <template slot-scope="scope" fixed="right">
                  <span>{{ scope.row.percent }}</span>
                  <span :id="scope.row.id" class="from-endpoint" />
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="from-to-chart-center-container">
            <div class="from-to-chart-center-inner-wrapper">
              <div class="from-to-chart-center-element">
                <div class="from-to-chart-left-icon">
                  <i class="anticon anticon-right icon-A10028_arrowLeft" :id="anchorId[0]"></i>
                </div>
                <div class="from-to-chart-right-icon">
                  <i class="anticon anticon-right icon-A10029_arrowRight" :id="anchorId[1]"></i>
                </div>
                <div class="from-to-chart-center-content">
                  <el-select v-model="centerDimVal" placeholder size="mini">
                    <el-option
                      v-for="item in centerData"
                      :key="item.label"
                      :label="item.label"
                      :value="item.label"
                    ></el-option>
                  </el-select>
                  <div>
                    <span
                      class="from-to-chart-indicator"
                      :title="`${measureName}: ${measureVal===''? '-': measureVal}`"
                    >
                      <span class="from-to-chart-indicator-name">{{ measureName }}</span>
                      <span
                        class="from-to-chart-indicator-value"
                      >{{`: ${measureVal===''? '-': measureVal}`}}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="from-to-chart-to-container" style="overflow: unset;">
            <el-table
              :data="tableData.destTbData"
              size="mini"
              row-key="id"
              ref="destTable"
              style="width: 100%; overflow: hidden;"
              @hook:updated="deBounceRepaint"
            >
              <el-table-column
                label="去向"
                prop="label"
                :min-width="tableColWidth"
                :show-overflow-tooltip="true"
              >
                <template slot-scope="scope">
                  <span :id="scope.row.id" class="to-endpoint" />
                  <span>{{ scope.row.label }}</span>
                </template>
              </el-table-column>
              <el-table-column
                prop="value"
                :label="measureName"
                :min-width="tableColWidth"
                :show-overflow-tooltip="true"
              />
              <el-table-column
                label="占比"
                prop="percent"
                align="right"
                :min-width="tableColWidth"
                :show-overflow-tooltip="true"
              />
            </el-table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DomSize from "@/utils/domSize.js";
import commonCompMixin from "./mixins/commonCompMixin";
import { jsPlumb } from "jsplumb";
import getUUID from "../../utils/UUID.js";
import _lodash from "lodash";
export default {
  name: "SrcAndDest",
  mixins: [commonCompMixin],
  data() {
    return {
      centerDimVal: "",
      strokeWidth: 12, // 连线最大宽度
      svgRefreshKey: 0,
      jsPlumbInstance: null,
      tableRefreshKey: 0,
      tableColWidth: "33.333333%"
    };
  },
  mounted() {
    const _this = this;
    DomSize.bind(this.$refs.centerContainer, function() {
      _this.$nextTick(() => {
        _this.tableRefreshKey++;
      });
    });
    this.jsPlumbInstance = jsPlumb.getInstance({
      Container: this.jsPlumbContainer
    });
    this.jsPlumbInstance.importDefaults({
      Endpoint: ["Blank", { radius: 0 }],
      EndpointStyle: { radius: 0 },
      Container: this.jsPlumbContainer
    });
  },
  watch: {
    centerData: {
      immediate: true,
      handler(newVal) {
        this.centerDimVal = (newVal[0] || {}).label || "";
      }
    },
    lineStyle(newVal) {
      this.repaintLine();
    }
  },
  computed: {
    subTittleShow() {
      return this.vscompt.comptAttrs.extendSetting['title.subtext'];
    },
    jsPlumbContainer() {
      return `jsplumb-container-${this.componentId}`;
    },
    listIdPrefix() {
      return `${this.componentId}-list-item-anchor-`;
    },
    // 中心节点的左右锚点
    anchorId() {
      return [
        `${this.componentId}-from-to-chart-left-anchor`,
        `${this.componentId}-from-to-chart-right-anchor`
      ];
    },
    componentId() {
      return this.vscompt.comptId || getUUID();
    },
    isHasMeasure() {
      return this.yAxis1Data.length > 0;
    },
    // 度量名称
    measureName() {
      if (!this.isHasMeasure) {
        return "";
      } else {
        return this.yAxis1Data[0].nick_name;
      }
    },
    // 中心节点度量总值
    measureVal() {
      if (!this.isHasMeasure) {
        return "";
      } else {
        return (
          (
            (this.dimData.center || []).find(
              item => item.label === this.centerDimVal
            ) || {}
          ).value || ""
        );
      }
    },
    // 来源 去向 中心节点 element_id映射
    nodeEIdMap() {
      const centerNode =
        this.xAxisData.find(item => item.isNewSetting === "centerNode") || {};
      const srcNode =
        this.xAxisData.find(item => item.isNewSetting === "srcNode") || {};
      const destNode =
        this.xAxisData.find(item => item.isNewSetting === "targetNode") || {};
      return {
        source: srcNode.element_id || "",
        center: centerNode.element_id || "",
        target: destNode.element_id || ""
      };
    },
    allLinks() {
      if (
        !this.vscompt.comptData ||
        (this.vscompt.comptData.rows || []).length === 0
      ) {
        return [];
      } else {
        return this.vscompt.comptAttrs.setting.links || [];
      }
    },
    comptData() {
      return this.vscompt.comptData || {};
    },
    curLinkData() {
      const srcLinks = this.allLinks.filter(
        item => item.target === this.centerDimVal
      );
      const targetLinks = this.allLinks.filter(
        item => item.source === this.centerDimVal
      );
      return {
        srcLinks,
        targetLinks
      };
    },
    dimData() {
      const { columns = [], rows = []} = this.comptData;
      let dataMap = {};
      const nodeEIdMap = this.nodeEIdMap;
      const [labelKey, valueKey] = columns;
      for (const key in nodeEIdMap) {
        if (nodeEIdMap.hasOwnProperty(key)) {
          const elementId = nodeEIdMap[key];
          const curDimData = rows
            .filter(item => item.element_id === elementId)
            .map(item2 => {
              return {
                label: item2[labelKey],
                value: item2[valueKey],
                percent: "11.11%",
                elementId
              };
            });
          dataMap[key] = curDimData;
        }
      }
      return dataMap;
    },
    tableData() {
      const srcTbData = this.getTableData(this.curLinkData.srcLinks, "source");
      const destTbData = this.getTableData(
        this.curLinkData.targetLinks,
        "target"
      );
      return {
        srcTbData,
        destTbData
      };
    },
    centerData() {
      return _lodash.unionBy(this.dimData.center || [], 'label');
    },
    lineStyle() {
      return Number(
        this.vscompt.comptAttrs.extendSetting["series.0.lineStyle.curveness"]
      );
    }
  },
  methods: {
    repaintLine() {
      this.jsPlumbInstance.deleteEveryEndpoint();
      this.jsPlumbInstance.deleteEveryConnection();
      this.addEndPointAndConnection(this.tableData);
    },
    deBounceRepaint() {
      this.repaintLine();
      // _lodash.debounce(this.repaintLine, 0);
    },
    addEndPoint(pointArr) {
      for (let index = 0; index < pointArr.length; index++) {
        const {
          id,
          type // 源-true 目标-false
        } = pointArr[index];
        this.jsPlumbInstance.addEndpoint(id, {
          enabled: true,
          uuid: id,
          anchor: type ? "Right" : "Left",
          maxConnections: -1,
          isSource: type,
          isTarget: !type,
          cssClass: type ? "jtk-sourceEndpoint" : "jtk-targetEndpoint"
        });
      }
    },
    /**
     * 创建端点和连线
     */
    addEndPointAndConnection({ srcTbData, destTbData }) {
      this.jsPlumbInstance.setSuspendDrawing(true);
      let pointArr = srcTbData.concat(destTbData).map(item => {
        return {
          id: `${this.listIdPrefix}${item.direction}-${item.index}`,
          type: item.direction === "source",
          strokeWidth: item.strokeWidth
        };
      });
      const anchorsArr = [];
      for (let index = 0; index < this.anchorId.length; index++) {
        const element = this.anchorId[index];
        anchorsArr.push({
          id: element,
          type: index !== 0
        });
      }
      this.addEndPoint(pointArr.concat(anchorsArr));
      const connector =
        this.lineStyle === 0.5 ? ["Bezier", { curviness: -1 }] : ["Straight"];
      for (let index = 0; index < pointArr.length; index++) {
        const { id, type, strokeWidth } = pointArr[index];
        const strokeColor = type
          ? "rgba(70, 140, 255, .5)"
          : "rgba(101, 202, 146, .5)";
        this.jsPlumbInstance.connect({
          source: type ? id : anchorsArr[1].id,
          target: type ? anchorsArr[0].id : id,
          cssClass: "col-connector",
          paintStyle: {
            stroke: strokeColor,
            strokeWidth
          },
          endpoint: "Blank",
          connector
        });
      }
      this.jsPlumbInstance.setSuspendDrawing(false, true);
    },
    computeSrokeWidth(item, index, firstStrokeWidth) {
      let strokeWidth = 1;
      if (this.isHasMeasure) {
        const percent = item.percent.substring(0, item.percent.indexOf("%"));
        strokeWidth = Math.max(
          (this.strokeWidth * Number(percent)) / 100,
          strokeWidth
        );
      }
      return {
        strokeWidth
      };
    },
    getTableData(oriTableData = [], key = "source") {
      const total =
        oriTableData.reduce(
          (cur, next) => (cur = cur + (Number(next.value) || 0)),
          0
        ) || 0;
      let data = oriTableData.map((item, index) => {
        let newItem = {
          label: item[key],
          value: item.value,
          percent:
            !Number(item.value) || total === 0
              ? "0.00%"
              : parseFloat((Number(item.value) / total) * 100).toFixed(2) + "%",
          strokeWidth: 1,
          direction: key,
          id: `${this.listIdPrefix}${key}-${index}`,
          index
        };
        if (!this.isHasMeasure) {
          newItem.percent = '';
          newItem.value = '-';
        }
        newItem.strokeWidth = this.computeSrokeWidth(
          newItem,
          index,
          1
        ).strokeWidth;
        return newItem;
      });
      if (this.isHasMeasure) {
        const sort = Number(this.yAxis1Data[0].sort) || 2; //1-升序 2-降序
        data.sort((a, b) => {
          if (sort === 1) {
            return a.value - b.value;
          } else {
            return b.value - a.value;
          }
        })
      }
      return data;
    },
    handleSuccResponse({ respData }) {
      this.$set(this.vscompt, "comptData", {
        columns: respData.columns,
        rows: respData.rows
      });
      this.$set(this.vscompt.comptAttrs.setting, "links", respData.links || []);
    }
  }
};
</script>

<style lang="scss" scoped>
.from-to-chart {
  width: 100%;
  height: 100%;
  padding: 26px 0 0;

  .from-to-chart-main {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .from-to-chart-main-wrapper {
    height: 100%;
    display: flex;
    width: 100%;
    height: 100%;
    overflow: hidden;

    .from-to-chart-from-container,
    .from-to-chart-to-container {
      width: calc((100% - 240px) / 2);
      overflow: hidden;
      min-width: 100px;
      z-index: 10;
    }

    .from-to-chart-center-container {
      position: relative;
      width: 240px;

      .from-to-chart-center-inner-wrapper {
        position: absolute;
        width: 100%;
        height: 100%;

        .from-to-chart-center-element {
          display: inline-block;
          position: absolute;
          width: 110px;
          top: 50%;
          margin-top: -12px;
          height: 48px;
          left: 60px;

          .from-to-chart-right-icon,
          .from-to-chart-left-icon {
            display: block;
            position: absolute;
            left: -15px;
            width: 40px;
            height: 20px;
            background: #468cff;
            border-radius: 10px;
            color: #fff;
            text-indent: 2px;
            line-height: 24px;

            .anticon {
              vertical-align: 0;
            }
          }

          .from-to-chart-right-icon {
            background: #65ca92;
            left: auto;
            right: -15px;
            text-align: right;
          }

          .from-to-chart-center-content {
            position: relative;
            vertical-align: middle;
            padding: 6px 0px;
            text-align: center;
            width: 100%;
            background: #f2f3f6;
            height: 48px;
            overflow: hidden;
            color: #333;
          }
        }
      }
    }
  }
}

  .from-to-chart-indicator
  .from-to-chart-indicator-name {
  position: relative;
  max-width: 50%;
  overflow: hidden;
  display: inline-block;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: right;
}
  .from-to-chart-indicator
  .from-to-chart-indicator-value {
  position: relative;
  max-width: 50%;
  overflow: hidden;
  display: inline-block;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: left;
}

  .from-to-chart-indicator
  .anticon {
  position: absolute;
  top: 9px;
  font-size: 12px;
  padding-left: 4px;
}

.from-to-chart-center-content
  /deep/
  .el-select
  .el-input--mini
  .el-input__inner {
  border: none;
  background: transparent;
  height: 18px;
  line-height: 18px;
}
.from-to-chart-center-content /deep/ .el-select .el-input .el-select__caret {
  height: 18px;
  line-height: 18px;
}

.from-to-chart-anchor {
  position: absolute;
  left: -10px;
  top: 15px;
  width: 1px;
  height: 1px;
  z-index: 10;
  &.left {
    right: 0;
    left: unset;
  }
}
.from-to-chart-from-container /deep/ .el-table .el-table__row {
  background-color: rgba(70, 140, 255, 0.1);
  td {
    border-bottom: 2px solid #fff;
  }
}
.from-to-chart-to-container /deep/ .el-table .el-table__row {
  background-color: rgba(101, 202, 146, 0.1);
  td {
    border-bottom: 2px solid #fff;
    padding: 2px 0;
  }
}

.from-to-chart /deep/ .el-table thead th.is-leaf,
.from-to-chart /deep/ .el-table thead tr,
.from-to-chart /deep/ .el-table thead th {
  border-bottom: none;
  background: transparent;
  & > .cell {
    height: 20px;
    line-height: 20px;
    white-space: nowrap;
  }
}

.from-to-chart /deep/ .el-table .to-endpoint {
  position: absolute;
  top: 17px;
  left: 1px;
}

.from-to-chart /deep/ .el-table .from-endpoint {
  position: absolute;
  top: 17px;
  right: 1px;
}

.from-to-chart .from-to-chart-main-wrapper {
  overflow-x: hidden;
  min-width: 400px;
}
.from-to-chart-left-icon,
.from-to-chart-right-icon {
  top: 12px;
}
</style>
