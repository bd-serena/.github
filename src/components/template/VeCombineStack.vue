<template>
  <div style="width:100%;height:100%;position:relative;z-index:0">
    <ve-histogram
      v-if="vscompt.type=='VeCombineChart' || vscompt.type=='VeHistogram' || vscompt.type=='VeStackHistogram'|| vscompt.type=='VeCombineStack'"
      v-bind="vscompt"
      width="100%"
      height="100%"
      :data="{columns:(vscompt.comptData||{}).columns,rows:(vscompt.comptData||{}).rows}"
      :settings="vscompt.comptAttrs.setting"
      :extend="vscompt.comptAttrs.extendSetting"
      :events="chartEvents"
    ></ve-histogram>
    <ve-bar
      v-if="vscompt.type=='VeBar' || vscompt.type=='VeStackBar'"
      v-bind="vscompt"
      width="100%"
      height="100%"
      :data="{columns:(vscompt.comptData||{}).columns,rows:(vscompt.comptData||{}).rows}"
      :settings="vscompt.comptAttrs.setting"
      :extend="vscompt.comptAttrs.extendSetting"
      :events="chartEvents"
    ></ve-bar>
    <ve-pie
      v-if="vscompt.type=='VePie' || vscompt.type=='VeRosePie'"
      v-bind="vscompt"
      width="100%"
      height="100%"
      :data="{columns:(vscompt.comptData||{}).columns,rows:(vscompt.comptData||{}).rows}"
      :settings="vscompt.comptAttrs.setting"
      :extend="vscompt.comptAttrs.extendSetting"
      :events="chartEvents"
    ></ve-pie>
    <ve-scatter v-if="vscompt.type=='Scatter'"
                v-bind="vscompt"
                width="100%"
                height="100%"
                :data=chartData
                :extend="ScaextendSetting"
                :events="chartEvents"></ve-scatter>
    <ve-ring
      v-if="vscompt.type=='VeRing'"
      v-bind="vscompt"
      width="100%"
      height="100%"
      :data="{columns:(vscompt.comptData||{}).columns,rows:(vscompt.comptData||{}).rows}"
      :settings="vscompt.comptAttrs.setting"
      :extend="vscompt.comptAttrs.extendSetting"
      :events="chartEvents"
    ></ve-ring>
    <ve-line
      v-if="vscompt.type=='VeLine' || vscompt.type=='VeLineArea' || vscompt.type=='VeStackLineArea'"
      v-bind="vscompt"
      width="100%"
      height="100%"
      :data="{columns:(vscompt.comptData||{}).columns,rows:(vscompt.comptData||{}).rows}"
      :settings="vscompt.comptAttrs.setting"
      :extend="vscompt.comptAttrs.extendSetting"
      :events="chartEvents"
    ></ve-line>
    <ve-radar
      v-if="vscompt.type=='VeRadar'"
      v-bind="vscompt"
      width="100%"
      height="100%"
      :data="{columns:(vscompt.comptData||{}).columns,rows:radarRows}"
      :settings="vscompt.comptAttrs.setting"
      :extend="vscompt.comptAttrs.extendSetting"
      :events="chartEvents"
    ></ve-radar>

    <ve-gauge
      v-if="vscompt.type=='VeGauge'"
      v-bind="vscompt"
      width="100%"
      height="100%"
      :data="{columns:(vscompt.comptData||{}).columns,rows:(vscompt.comptData||{}).rows}"
      :settings="vscompt.comptAttrs.setting"
      :extend="vscompt.comptAttrs.extendSetting"
      :events="chartEvents"
    ></ve-gauge>
    <div class="drill-label1" v-show="vscompt.comptAttrs['curDrillIdx']||0 > 0" >
      <div v-for="(drill, index) in vscompt.comptAttrs['drillWBeanList']"
           :id="index"
           :key="index"
           v-show="index>0"
           class="sub-drill-label"
           @click="toDrillData(index)">
        {{vscompt.comptAttrs['drillWBeanList'] != undefined && vscompt.comptAttrs['drillWBeanList'].length>0 && vscompt.comptAttrs['curDrillIdx']||0 >
        0?vscompt.comptAttrs['drillWBeanList'][index].label:""}}
        <span
          v-show="vscompt.comptAttrs['drillWBeanList'].length>0&&vscompt.comptAttrs['curDrillIdx']||0>0&&vscompt.comptAttrs['drillWBeanList'][index].label!=''"
          class="drill-icon icon-A10018_doubleArrowLeft"
        ></span>
      </div>
    </div>
    <div
      class="drill-label link-reset"
      v-show="linkageState && vscompt.comptAttrs['mainLinkageData'] != undefined && vscompt.comptAttrs['mainLinkageData'].length>0"
      @click="resetLinage()"
    >
      <span class="icon-A10622_PreOffline" title="重置联动信息"></span>
    </div>
    <div
      ref="text"
      v-show="vscompt.type == 'VeRing' && pageCache.classTypeId == '1005' && (vscompt.comptAttrs.extendSetting['anotherName.show'] || vscompt.comptAttrs.extendSetting['anotherName.show'] == undefined)"
      class="ring-lable-bt"
      :style="`color:${vscompt.comptAttrs.extendSetting['anotherName.color']||''};font-size:${vscompt.comptAttrs.extendSetting['anotherName.fontSize']||''}px;`"
    >{{vscompt.comptAttrs.extendSetting['anotherName.text']}}
    </div>
  </div>
</template>

<script>
    import {mapActions, mapGetters, mapState} from "vuex";
    import {addPageCondis, constructList, getLinkRequestParam, getRequestParam, objDeepCopy, toggleClass, dataInterval, formatNumber, loadDataDone, loadDataError} from "../../utils/comonFunc.js";

  export default {
    props: ["vscompt"],
    data() {
      return {
        ScaextendSetting:{
          // "symbol":""
          "series.2.symbolSize":"114",
          "title.textStyle.color": "blue",
          "backgroundColor": "yellow",
         "legend": {
          "left": "10",
          "top": 10,
          "orient": "horizontal"
        },
        "xAxis.0.name": "林资产o",
        "xAxis.0.axisLine.lineStyle.color": "black"
        },
chartData: {
        columns: ['日期', '访问用户', '下单用户', '年龄'],
        rows: [
          { '日期': '1/1', '访问用户': 123, '年龄': 3, '下单用户': 1244 },
          { '日期': '1/2', '访问用户': 1223, '年龄': 6, '下单用户': 2344 },
          { '日期': '1/3', '访问用户': 7123, '年龄': 9, '下单用户': 3245 },
          { '日期': '1/4', '访问用户': 4123, '年龄': 12, '下单用户': 4355 },
          { '日期': '1/5', '访问用户': 3123, '年龄': 15, '下单用户': 4564 },
          { '日期': '1/6', '访问用户': 2323, '年龄': 20, '下单用户': 6537 }
        ]
      },
        radarData: [],
        linkageState: false,
        defaultColor: [
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
        ],
        originColor: {},
        visualMap: [],
        chartEvents: {},
        ligthFlag: false //用来判断当前是否闪烁
      };
    },
    mounted() {
      let extSet = this.vscompt.comptAttrs.extendSetting;
      // let legendData = this.vscompt.comptAttrs.extendSetting["legendData"] || {};
      // debugger;
      if (
        this.vscompt.type == "VeRadar" &&
        extSet["legend.formatter"] == undefined &&
        JSON.stringify(
          this.vscompt.comptAttrs.extendSetting["legendData"] || {}
        ) == "{}"
      ) {
        this.$set(this.vscompt.comptAttrs.extendSetting, "legendData", {});
        extSet["legend.formatter"] = this.legendFormatter;
      } else if (
        this.vscompt.type == "VePie" ||
        this.vscompt.type == "VeGauge" ||
        this.vscompt.type == "VeRing" ||
        this.vscompt.type == "VeRosePie"
      ) {
        //饼图和仪表盘初始化时设置小数点
        this.setDecimalDigit();
      }
      if (this.vscompt.comptAttrs.curDrillIdx == undefined) {
        this.$set(this.vscompt.comptAttrs, "curDrillIdx", 0);
        this.$set(this.vscompt.comptAttrs, "drillWBeanList", []);
      }
      if ((this.vscompt.afId == "" && this.vscompt.comptData == undefined) ) {
        this.$set(this.vscompt, "comptData", {
          columns: [],
          rows: []
        });
        // if(this.vscompt.type=scatter)
        this.$set(this.vscompt.comptAttrs, "isNeedRestDrill", 0);
        this.$set(this.vscompt.comptAttrs, "isNeedResetLink", 0);
      }

            var that = this;
            this.chartEvents = {
                click: function (e) {
                    //雷达图，禁用series的点击事件
                    if (e.seriesType == "radar" && e.componentType == "series") {
                        return;
                    }
                    if (
                        that.isCanDrill &&
                        that.vscompt.comptAttrs.curDrillIdx <
                        that.vscompt.comptAttrs.drillData.length - 1
                    ) {
                        if (that.vscompt.comptAttrs.curDrillIdx == 0) {
                            that.vscompt.comptAttrs.drillWBeanList = [];
                            that.vscompt.comptAttrs.drillWBeanList.push({
                                item: objDeepCopy(that.vscompt.comptAttrs.xAxisData[0]),
                                whereBean: objDeepCopy(that.vscompt.comptAttrs.whereBean),
                                label: ""
                            });
                        }
                        that.queryData({isDownDrill: true, label: e.name});
                    }
                    if (
                        that.vscompt.comptAttrs.mainLinkageData.length > 0 ||
                        that.isPageLinkSet
                    ) {
                        that.setLinkageCondi({
                            label: e.name,
                            xAxisData: that.xAxisData,
                            vscompt: that.vscompt,
                            isJumpNewPage: true
                        });
                        that.linkageState = true;
                    }
                }
            };

            if (this.pageCache.classTypeId == "1005") {
                //大屏页面
                this.$set(
                    this.vscompt.comptAttrs.extendSetting,
                    "legend.textStyle.color",
                    "#fff"
                );
                this.$set(
                    this.vscompt.comptAttrs.extendSetting,
                    "title.textStyle.color",
                    "#fff"
                );
                if (this.vscompt.type !== "VePie" && this.vscompt.type !== "VeRadar" && this.vscompt.type !== "VeRosePie") {
                    this.$set(
                        this.vscompt.comptAttrs.extendSetting,
                        "xAxis.0.axisLine.lineStyle.color",
                        "#8A9DC8"
                    );
                    this.$set(
                        this.vscompt.comptAttrs.extendSetting,
                        "yAxis.0.axisLine.lineStyle.color",
                        "#8A9DC8"
                    );
                    this.$set(
                        this.vscompt.comptAttrs.extendSetting,
                        "xAxis.0.axisLabel.color",
                        "#fff"
                    );
                    this.$set(
                        this.vscompt.comptAttrs.extendSetting,
                        "yAxis.0.axisLabel.color",
                        "#fff"
                    );
                }

                if (
                    this.vscompt.type == "VeCombineChart" ||
                     this.vscompt.type == "VeCombineStack" ||
                    this.vscompt.type == "VeHistogram"
                ) {
                    this.$set(
                        this.vscompt.comptAttrs.extendSetting,
                        "yAxis.1.axisLine.lineStyle.color",
                        "#8A9DC8"
                    );

          this.$set(
            this.vscompt.comptAttrs.extendSetting,
            "yAxis.1.axisLabel.color",
            "#fff"
          );
        }
        if (this.vscompt.type == "VeRing") {
          this.lightText();
        }
      }
      //图形空白处点击事件
      let myChart = this.$children[0].echarts;
      myChart.getZr().on('click', params => {
        let pointInPixel = [params.offsetX, params.offsetY];
        if ((!params.tartget && !params.topTarget) || myChart.containPixel("series", pointInPixel)) {
          if(!this.vscompt.comptAttrs.mainLinkageData||this.vscompt.comptAttrs.mainLinkageData.length == 0||this.vscompt.comptAttrs.drillData.length == 0){
            this.gotoPage(this.vscompt.comptAttrs.extendSetting);
          }
        }
      })
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
      dataType() {
        let dataType = 1;
        if (this.vscompt.type == "VeRadar") {
          dataType = 4;
        } else if (this.vscompt.type == "VeGauge") {
          dataType = 5;
        } else if (this.vscompt.type == "VeRing") {
          dataType = 7;
        } else if (this.vscompt.type === 'VeSankey') {
          dataType = 9;
        } else if (this.vscompt.type === 'VeFunnel' || this.vscompt.type === 'VeCompareFunnel') {
          dataType = 8;
        } else if (this.vscompt.type === 'VeTree') {
          dataType = '10';
        }
        return dataType;
      },
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
      },
      legendData1() {
        return this.vscompt.comptAttrs.extendSetting["legendData"] || {};
      },
      radarRows() {
        let legendData =
          this.vscompt.comptAttrs.extendSetting["legendData"] || {};
        let oriRows = objDeepCopy((this.vscompt.comptData || {}).rows || []);
        if (this.vscompt.type == "VeRadar") {
          // let oriRows = objDeepCopy((this.vscompt.comptData || {}).rows || []);

          //---设置最大值begin---
          let largeNumber = 0; //最大值
          for (let i = 0; i < oriRows.length; i++) {
            let obj = oriRows[i];
            for (let item in obj) {
              if (
                item != "type" &&
                parseFloat(oriRows[i][item]) > parseFloat(largeNumber)
              ) {
                largeNumber = oriRows[i][item];
              }
            }
          }

          let indicatorArray = [];
          if (oriRows.length > 0) {
            let obj = oriRows[0];
            for (let item in obj) {
              if (item != "type") {
                indicatorArray.push({
                  text: item,
                  max: largeNumber
                });
              }
            }
          }
          this.$set(this.vscompt.comptAttrs.extendSetting, "radar", {
            indicator: indicatorArray
          });
          //---设置最大值end---

          if (oriRows.length > 0 && JSON.stringify(legendData) != "{}") {
            for (const key in legendData) {
              for (let i = 0; i < oriRows.length; i++) {
                if (oriRows[i].type == key) {
                  for (const key2 in oriRows[i]) {
                    if (key2 != "type") {
                      //设置弹出标签小数点位数
                      oriRows[i][key2] = parseFloat(oriRows[i][key2]).toFixed(
                        parseInt(legendData[key].dot)
                      );
                    } else {
                      //设置弹出标签别名
                      oriRows[i][key2] = legendData[key].name;
                    }
                  }
                }
              }
            }
          }

          //剔除type==XXXXCODE的元素
          oriRows = oriRows.filter(function (oriRow) {
            return oriRow.type != "XXXXCODE";
          });
          return oriRows;
        }
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
          } else {
            if (this.vscompt.comptAttrs.xAxisData && this.vscompt.comptAttrs.xAxisData.length > 0) {
              let xAxisData = constructList(this.vscompt.comptAttrs.xAxisData, this.datasetMap, this.vscompt.comptAttrs.computedData || []).resultList || [];
              this.xAxisFormate(xAxisData);
            }
            if (this.vscompt.comptAttrs.yAxis1Data && this.vscompt.comptAttrs.yAxis1Data.length > 0) {
              let yAxis1Data = constructList(this.vscompt.comptAttrs.yAxis1Data, this.datasetMap, this.vscompt.comptAttrs.computedData || []).resultList || [];
              this.yAxisFormate(yAxis1Data, 0);
            }
            if (this.vscompt.comptAttrs.yAxis2Data && this.vscompt.comptAttrs.yAxis2Data.length > 0) {
              let yAxis2Data = constructList(this.vscompt.comptAttrs.yAxis2Data, this.datasetMap, this.vscompt.comptAttrs.computedData || []).resultList || [];
              this.yAxisFormate(yAxis2Data, 1);
            }
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
      "vscompt.comptAttrs.extendSetting.legendData": {
        // immediate: true,
        deep: true,
        handler(newVal, oldVal) {
          if (this.vscompt.type == "VeRadar") {
            // this.radarRows;
          }
        }
      },
      "vscompt.comptAttrs.isNeedResetLink": {
        deep: true,
        handler(newVal, oldVal) {
          if (
            newVal > 0 &&
            this.vscompt.comptAttrs["mainLinkageData"].length > 0 &&
            this.linkageState
          ) {
            this.resetLinage();
          }
        }
      },

      "vscompt.comptAttrs.warnData": {
        handler(newVal, oldVal) {
          if (
            this.vscompt.comptAttrs.warnData != undefined &&
            this.vscompt.comptAttrs.warnData instanceof Array &&
            this.vscompt.comptAttrs.warnData.length != 0
          ) {
            if (
              this.vscompt.type == "VeRing" ||
              this.vscompt.type == "VePie" ||
              this.vscompt.type == "VeRadar"
            ) {
              //比率环形图预警是文本闪烁
              this.lightText();
            } else {
              var arr = this.vscompt.comptAttrs.warnData[0].rule || [];

              //相同的key合并
              var map = {};
              let param = [];
              arr.forEach(element => {
                if (map.hasOwnProperty(element.col)) {
                  param = map[element.col];
                  param.push(element);
                } else {
                  param = [];
                  param.push(element);
                }
                map[element.col] = param;
              });
              var keys = Object.keys(map); // 返回所有的Key
              var isInit = false;
              this.originColor = {};
              for (let i = 0; i < arr.length; i++) {
                //已经设置好颜色了
                if (
                  this.vscompt.comptAttrs.extendSetting[
                  "series." + arr[i].col + ".itemStyle.normal.color"
                    ] !== "" &&
                  this.vscompt.comptAttrs.isSetColor[
                  "series." + arr[i].col + ".itemStyle.normal.color"
                    ]
                ) {
                  this.originColor[
                    arr[i].col
                    ] = this.vscompt.comptAttrs.extendSetting[
                  "series." + arr[i].col + ".itemStyle.normal.color"
                    ];
                } else {
                  this.originColor[arr[i].col] = "";
                }
              }
              for (let i = 0; i < keys.length; i++) {
                var effect = this.vscompt.comptAttrs.warnData[0].type || [];
                var ind = parseInt(keys[i]) + 1;
                var chartKey = this.vscompt.comptData.columns[ind];
                if (i == 0) {
                  isInit = true;
                } else {
                  isInit = false;
                }
                if (effect.length != 0) {
                  this.light2(
                    this.vscompt.type,
                    map[keys[i]],
                    parseInt(keys[i]),
                    chartKey,
                    isInit
                  );
                } else {
                  this.vscompt.comptAttrs.extendSetting["visualMap"] = [];
                }
              }
            }
          }
        }
      },
      "vscompt.comptData.rows": {
        handler(newVal, oldVal) {
          if (
            (newVal || []).length > 0 &&
            (this.vscompt.type == "VeRing" ||
              this.vscompt.type == "VePie" ||
              this.vscompt.type == "VeRadar")
          ) {
            this.lightText();
          }
        }
      },
      "vscompt.comptAttrs.isLinearGradient": {
        handler(newVal, oldVal) {
          if(this.vscompt.type == "VeGauge"){
            if(this.vscompt.comptAttrs.isLinearGradient){
              let linearcolorArr = this.vscompt.comptAttrs.linearcolorArr;
              this.vscompt.comptAttrs.extendSetting['series.0.axisLine.lineStyle.color'] = [[1, new this.$echarts.graphic.LinearGradient(0, 0, 1, 0,linearcolorArr)]];
            }else{
              let colorArr = this.vscompt.comptAttrs.colorArr;
              this.vscompt.comptAttrs.extendSetting['series.0.axisLine.lineStyle.color'] = colorArr;
            }
          }
        }
      },
      "vscompt.comptData": {
        handler(newVal, oldVal) {
          if(this.vscompt.type === "VeBar" || this.vscompt.type === "VeStackBar") {
            let datasetMap = this.datasetMap;
            let xAxisData = this.vscompt.comptAttrs.xAxisData;
            let yAxisData = this.vscompt.comptAttrs.yAxis1Data.concat(this.vscompt.comptAttrs.yAxis2Data || []);
            let xAxisData_result = constructList(xAxisData, datasetMap, this.vscompt.comptAttrs.computedData || []).resultList || [];
            let yAxisData_result= constructList(yAxisData, datasetMap, this.vscompt.comptAttrs.computedData || []).resultList || [];
            this.xAxisFormate(yAxisData_result);
            this.yAxisFormate(xAxisData_result, 0);
          } else {
            this.xAxisFormate(this.xAxisData);
            this.yAxisFormate(this.yAxis1Data, 0);
            if(this.yAxis2Data.length > 0){
              this.yAxisFormate(this.yAxis2Data, 1);
            }
          }
          if(["VeRing", "VePie", "VeRosePie", "VeGauge"].includes(this.vscompt.type) ){
              this.setDecimalDigit();
          }
        }
      }
    },
    methods: {
      lightText() {
        var effect = this.vscompt.comptAttrs.warnData[0].type || [];
        if (
          effect.length != 0 &&
          this.vscompt.comptData.rows.length > 0 &&
          this.vscompt.comptData.columns.length > 0
        ) {
          var arr = this.vscompt.comptAttrs.warnData[0].rule || [];
          //相同的key合并
          var map = {};
          let param = [];
          arr.forEach(element => {
            if (map.hasOwnProperty(element.col)) {
              param = map[element.col];
              param.push(element);
            } else {
              param = [];
              param.push(element);
            }
            map[element.col] = param;
          });
          var keys = Object.keys(map); // 返回所有的Key
          var array = map[keys[0]]; //比率环形图只有一个度量字段，所以只有1个key

          // let comptData = objDeepCopy(this.vscompt);
          //预警判断符号对应的值
          let condi = [
            {value: 2, label: ">"},
            {value: 1, label: "<"},
            {value: 3, label: "="},
            {value: 4, label: "<="},
            {value: 5, label: ">="}
          ];

          var condiMap = {};
          condi.forEach(element => {
            condiMap[element.value] = element;
          });
          if (this.vscompt.type == "VeRing") {
            let dataVal =
              this.vscompt.comptData.rows[0][this.vscompt.comptData.columns[1]] *
              100; //比率环形图的值
            let isLight = false; //用来标记是否
            for (var i = 0; i < array.length; i++) {
              let label = condiMap[array[i].rele].label;
              let test = "" + dataVal + label + array[i].val; //比率环形图的值+判断符号+预警值，拼接成字符串表达式
              if (!isLight) {
                //只要有表达式是true，则isLight都为true
                isLight = eval("(" + test + ")");
              }
            }
            if (isLight && !this.ligthFlag) {
              //数据符合预警设置，如果当前没设置闪烁，则设置闪烁；如果已经设置过闪烁了，就不再设置闪烁
              toggleClass(this.$refs.text, "animate-warning"); //执行第一次打开闪烁，第二次关闭闪烁
              this.ligthFlag = true; //用来标记已经设置了闪烁
            } else if (!isLight && this.ligthFlag) {
              //数据不符合预警设置，如果当前没设置闪烁，则不设置闪烁；如果已经设置过闪烁了，再执行一遍可取消闪烁
              toggleClass(this.$refs.text, "animate-warning"); //执行第一次打开闪烁，第二次关闭闪烁
              this.ligthFlag = false; //用来标记已经取消了闪烁
            }
          } else if (this.vscompt.type == "VePie") {
            let columnName = this.vscompt.comptData.columns[1];
            let rowsData = this.vscompt.comptData.rows;
            for (var j = 0; j < rowsData.length; j++) {
              //初始化全部
              let key = "series.0.data." + j + ".selected";
              // let key1 = "series.0.data." + j + ".itemStyle.color";
              this.vscompt.comptAttrs.extendSetting[key] = false;
              //this.vscompt.comptAttrs.extendSetting[key1] = '';
            }
            for (var i1 = 0; i1 < array.length; i1++) {
              for (var j1 = 0; j1 < rowsData.length; j1++) {
                let key = "series.0.data." + j1 + ".selected";
                // let key1 = "series.0.data." + j + ".itemStyle.color";
                let test =
                  "" +
                  rowsData[j1][columnName] +
                  condiMap[array[i1].rele].label +
                  array[i1].val;
                if (!this.vscompt.comptAttrs.extendSetting[key]) {
                  this.vscompt.comptAttrs.extendSetting[key] = eval(
                    "(" + test + ")"
                  );
                }
                if (this.vscompt.comptAttrs.extendSetting[key]) {
                  //this.vscompt.comptAttrs.extendSetting[key1] = 'red';
                }
              }
            }
          } else if (this.vscompt.type == "VeRadar") {
            let value = [];
            let columnData = this.vscompt.comptData.columns;
            for (var k = 0; k < keys.length; k++) {
              array = map[keys[k]];
              let rowsData = this.vscompt.comptData.rows[array[0].col];
              var value1 = [];
              for (var i2 = 0; i2 < array.length; i2++) {
                for (var j2 = 1; j2 < columnData.length; j2++) {
                  if (value1.length < columnData.length - 1) {
                    value1.push("");
                  }
                  let test =
                    "" +
                    rowsData[columnData[j2]] +
                    condiMap[array[i2].rele].label +
                    array[i2].val;
                  if (eval("(" + test + ")")) {
                    value1[j2 - 1] = rowsData[columnData[j2]];
                  }
                }
              }
              value.push(value1);
            }
            this.vscompt.comptAttrs.extendSetting["series.10"]["data"] = value;
          }
        } else if (effect.length == 0) {
          if (this.vscompt.type == "VeRadar") {
            this.vscompt.comptAttrs.extendSetting["series.10"]["data"] = [];
          } else if (this.vscompt.type == "VePie" && this.vscompt.comptData != undefined) {
            let rowsData = this.vscompt.comptData.rows;
            for (var j3 = 0; j3 < rowsData.length; j3++) {
              //初始化全部
              let key = "series.0.data." + j3 + ".selected";
              this.vscompt.comptAttrs.extendSetting[key] = false;
            }
          } else if (this.vscompt.type == "VeRing" && this.ligthFlag) {
            //预警设置关闭，如果当前没设置闪烁，则不设置闪烁；如果已经设置过闪烁了，再执行一遍可取消闪烁
            toggleClass(this.$refs.text, "animate-warning"); //执行第一次打开闪烁，第二次关闭闪烁
            this.ligthFlag = false; //用来标记已经取消了闪烁
          }
        }
      },
      light2(veType, array, index, key, isInit) {
        if (isInit) {
          this.visualMap = [];
          this.vscompt.comptAttrs.extendSetting["visualMap"] = [];
        }
        // var maxflag = false;
        // var flagkey = "gt";
        var pieces = [];
        //获取数组的最值
        var dataarray = this.vscompt.comptData.rows;
        var minVal = parseInt(dataarray[0][key]);
        var maxVal = parseInt(dataarray[0][key]);

        for (var j = 0; j < dataarray.length; j++) {
          var cur = parseInt(dataarray[j][key]);
          cur < minVal ? (minVal = cur) : null;
          cur > maxVal ? (maxVal = cur) : null;
        }
        for (var i = 0; i < array.length; i++) {
          var ruleObj = {};
          ruleObj.color = "red";
          array[i].val = parseInt(array[i].val);
          if (array[i].rele == 1) {
            //<
            ruleObj.lt = array[i].val;
            ruleObj.gte = minVal > 0 ? 0 : minVal;
          } else if (array[i].rele == 2) {
            //>
            // maxflag = true;
            ruleObj.gt = array[i].val;
            ruleObj.lte = maxVal;
          } else if (array[i].rele == 4) {
            //<=
            ruleObj.lte = array[i].val;
            ruleObj.gte = minVal > 0 ? 0 : minVal;
          } else if (array[i].rele == 5) {
            //>=
            // var flagkey = "gte";
            // maxflag = true;
            ruleObj.gte = array[i].val;
            ruleObj.lte = maxVal;
          } else {
            ruleObj.value = array[i].val;
            ruleObj.color = "red";
          }

          pieces.push(ruleObj);
        }
        //获取数组的最值
        // var dataarray = this.vscompt.comptData.rows;
        // var min = parseInt(dataarray[0][key]);
        // for (var j = 0; j < dataarray.length; j++) {
        //   var cur = parseInt(dataarray[j][key]);
        //   cur < min ? (min = cur) : null;
        // }

        if (
          this.originColor[index] !== "" &&
          this.originColor[index] != undefined
        ) {
          this.bgcolor = this.originColor[index];
        } else {
          this.bgcolor = this.defaultColor[index];
        }

        // if (maxflag) {
        //   var max = parseInt(pieces[0][flagkey]);
        //   for (var z = 0; z < pieces.length; z++) {
        //     var cur1 = parseInt(pieces[z][flagkey]);
        //     cur1 < max ? (max = cur1) : null;
        //   }
        // } else {
        //   var max = parseInt(dataarray[0][key]);
        //   for (var y = 0; y < dataarray.length; y++) {
        //     var cur2 = parseInt(dataarray[y][key]);
        //     cur2 > max ? (max = cur2) : null;
        //   }
        // }
        // var m2 = max - 1;
        // var m3 = min + 1;
        // var maxdata = {
        //   lt: parseInt(m2),
        //   gt: parseInt(m3),
        //   color: this.bgcolor
        // };
        // pieces.push(maxdata);

        //条形图、条形堆积图使用x轴进行预警，其他使用y轴进行预警
        var flag;
        if (veType == "VeBar" || veType == "VeStackBar") {
          flag = 0;
        } else {
          flag = 1;
        }
        var obj = {
          show: false,
          seriesIndex: index,
          inverse: true,
          orient: "vertical",
          pieces: pieces,
          dimension: flag, // 1为y轴，0为x轴
          outOfRange: {
            color: this.bgcolor
          }
        };
        this.visualMap.push(obj);
        this.$set(
          this.vscompt.comptAttrs.extendSetting,
          "visualMap",
          this.visualMap
        );
      },
      queryData(param) {
        let params = getRequestParam({
          param: param,
          vscompt: this.vscompt,
          drillData: this.drillData,
          xAxisData: this.xAxisData,
          yAxis1Data: this.yAxis1Data,
          yAxis2Data: this.yAxis2Data,
          dataType: this.dataType,
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
        this.vscompt.comptAttrs.loading = true;
        let computedData = this.vscompt.comptAttrs.computedData||[];
        this.queryComptData({params, computedData})
          .then(function (response) {
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
          .catch(function (error) {
            console.error(error);
            // _this.$message.error("数据更新失败");
          })
          .finally(() => {
            _this.vscompt.comptAttrs.loading = false;
          });
      },
      toDrillData(index) {
        this.$set(this.vscompt.comptAttrs, "curDrillIdx", index);
        this.queryData({isUpDrill: true});
      },
      queryLinkData(linkageCondi) {
        if(this.xAxisData.length===0 && this.yAxis1Data.length===0 && this.yAxis2Data.length===0) {
          return;
        }
        let params = getLinkRequestParam({
          linkageCondi: linkageCondi,
          vscompt: this.vscompt,
          xAxisData: this.xAxisData,
          yAxis1Data: this.yAxis1Data,
          yAxis2Data: this.yAxis2Data,
          dataType: this.dataType
        });
        this.executeReqest(params);
      },
      resetLinage() {
        this.setLinkageCondi({
          label: "",
          xAxisData: this.xAxisData,
          vscompt: this.vscompt,
          isJumpNewPage: false
        });
        this.linkageState = false;
      },
      legendFormatter(name) {
        let name1 = name,
          legendData = this.vscompt.comptAttrs.extendSetting.legendData || {};
        if (legendData[name]) name1 = legendData[name].name;
        return name1;
      },
      setDecimalDigit() {

        let decimalDigit = this.vscompt.comptAttrs.decimalDigit; //获取小数点位数
        if (this.vscompt.type == "VePie"  || this.vscompt.type == "VeRosePie") {
          //重新加载饼图的提示框小数点和数据标签样式
          let val =
            "{formatter:function(data){return data.name + ' , ' + parseFloat(data.value).toFixed(" +
            parseInt(decimalDigit) +
            ") +'('+parseFloat(data.percent).toFixed(" +
            parseInt(decimalDigit) +
            ")+'%'+')';}}";
          this.vscompt.comptAttrs.extendSetting["tooltip"] = eval(
            "(" + val + ")"
          );
          let labVal = this.vscompt.comptAttrs.labelFunc.replace(
            /decimal/g,
            decimalDigit
          );
          this.vscompt.comptAttrs.extendSetting["series.0.label"] = eval(
            "(" + labVal + ")"
          );
        } else if (this.vscompt.type == "VeGauge") {
          let unit = this.vscompt.comptAttrs.unit; //仪表盘单位设置
          //重新加载仪表盘的提示框小数点和数据小数点
          let tooltipForm =
            "{formatter:function(data){return data.name + ' : ' + parseFloat(data.value).toFixed(" +
            parseInt(decimalDigit) +
            ")+'" +
            unit +
            "';}} ";
          this.vscompt.comptAttrs.extendSetting["tooltip"] = eval(
            "(" + tooltipForm + ")"
          );

          let detailForm =
            "{formatter:function(value){return isNaN(value)?'-':parseFloat(value).toFixed(" +
            parseInt(decimalDigit) +
            ")+'" +
            unit +
            "';}} ";
          this.vscompt.comptAttrs.extendSetting["series.0.detail"] = eval(
            "(" + detailForm + ")"
          );
          //区间状态
          let intervalDescFunc = this.vscompt.comptAttrs.intervalDescFunc == undefined ? "function(value){return '';}"  : this.vscompt.comptAttrs.intervalDescFunc;
          this.vscompt.comptAttrs.extendSetting["series.1.detail.formatter"] = eval("(" + intervalDescFunc + ")");
          if(JSON.stringify(this.vscompt.comptAttrs.extendSetting).indexOf("series.1.type") == -1){
            this.vscompt.comptAttrs.extendSetting["series.1.type"] = "gauge";
            this.vscompt.comptAttrs.extendSetting["series.1.radius"] = "80%";
            this.vscompt.comptAttrs.extendSetting["series.1.startAngle"] = 180;
            this.vscompt.comptAttrs.extendSetting["series.1.endAngle"] = 0;
            this.vscompt.comptAttrs.extendSetting["series.1.center"] = [
              "50%",
              "75%"
            ];
            this.vscompt.comptAttrs.extendSetting["series.1.axisLine.lineStyle.width"] = 0;
            this.vscompt.comptAttrs.extendSetting["series.1.axisLine.lineStyle.opacity"] = 0;
            this.vscompt.comptAttrs.extendSetting["series.1.axisLine.show"] = false;
            this.vscompt.comptAttrs.extendSetting["series.1.splitLine.show"] = false;
            this.vscompt.comptAttrs.extendSetting["series.1.axisTick.show"] = false;
            this.vscompt.comptAttrs.extendSetting["series.1.axisLabel.show"] = false;
            this.vscompt.comptAttrs.extendSetting["series.1.pointer.show"] = false;
            this.vscompt.comptAttrs.extendSetting["series.1.detail.color"] = "#fff";
            this.vscompt.comptAttrs.extendSetting["series.1.detail.offsetCenter"] = [
              0,
              "-60%"
            ];
            this.vscompt.comptAttrs.extendSetting["series.1.detail.formatter"] = eval("(" + "function(value){return '';}" + ")");
          }
        } else if (this.vscompt.type == "VeRing") {
          let detailForm =
            "function(data){return isNaN(data.value)?'-':parseFloat(parseFloat(data.value*100).toFixed(2))+'%'} ";
          this.vscompt.comptAttrs.extendSetting[
            "series.0.data.0.label.normal.formatter"
            ] = eval("(" + detailForm + ")");
        }
      },
      xAxisFormate(xAxisData) {
        if(xAxisData.length === 0){
          return;
        }
        if(
          ["VeBar", "VeLine", "VeStackBar", "VeLineArea", "VeStackLineArea", "VeHistogram", "VeStackHistogram", "VeCombineChart", "VeCombineStack"].includes(this.vscompt.type)
        ) {
          let axisAttrs;
          this.vscompt.styleAttrs.forEach((data)=>{
            if(data.enName == "axisAttrs"){
              axisAttrs = data;
            }
          });
          if(xAxisData[0].col_type === "No.") {
            this.vscompt.comptAttrs.extendSetting["xAxis.0.axisLabel.formatter"] = (value, index) => {
              return formatNumber(value) + axisAttrs.children[0].children[1].value;
            }
          } else {
            this.vscompt.comptAttrs.extendSetting["xAxis.0.axisLabel.formatter"] = "{value}" + axisAttrs.children[0].children[1].value;
          }
        }
      },
      yAxisFormate(yAxisData, yIndex) {//yAxisData Y轴对象属性, yIndex Y轴索引
        if(yAxisData.length === 0){
          return;
        }
        if(
          ["VeBar", "VeLine", "VeStackBar", "VeLineArea", "VeStackLineArea", "VeHistogram", "VeStackHistogram", "VeCombineChart","VeCombineStack"].includes(this.vscompt.type)
        ) {
          let axisAttrs;
          this.vscompt.styleAttrs.forEach((data)=>{
            if(data.enName == "axisAttrs"){
              axisAttrs = data;
            }
          });
          let unit = axisAttrs.children[yIndex+1].children[1].value;
          let seriesIndexName = "yAxis."+ yIndex +".axisLabel.formatter"
          if(yAxisData[0].col_type === "No.") {
            this.vscompt.comptAttrs.extendSetting[seriesIndexName] = (value, index) => {
              return formatNumber(value) + unit;
            }
          } else {
            this.vscompt.comptAttrs.extendSetting[seriesIndexName] = "{value}" + unit;
          }
        }
      },
      ...mapActions({
        queryComptData: "QueryTable/queryComptData",
        setLinkageCondi: "PageDesign/setLinkageCondi",
        initLableFormatter: "PageDesign/initLableFormatter",
        gotoPage: "PageDesign/gotoPage"
      })
    }
  };
</script>

<style lang="scss" scoped>
  .drill-label1 {
    position: absolute;
    left: 5px;
    bottom: 3px;
    z-index: 100;

    .drill-icon {
      font-size: 12px;
      vertical-align: -1px;
    }

    .sub-drill-label {
      cursor: pointer;
      display: inline-block;
      padding-left: 5px;
      &:hover {
        color: #409cfb;
      }
    }
  }

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

  .ring-lable-bt {
    position: absolute;
    color: #00f6ff;
    bottom: 3px;
    width: 100%;
    text-align: center;
  }
</style>

