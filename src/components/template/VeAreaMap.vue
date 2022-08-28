<template>
  <div style="width:100%;height:100%;position:relative;">
    <ve-bmap
      v-if="['VeBmap', 'VeLinesBmap', 'VeHeatBmap'].includes(vscompt.type)"
      v-bind="vscompt"
      width="100%"
      height="100%"
      :key="Math.random()"
      :data="{columns:(vscompt.comptData||{}).columns,rows:(vscompt.comptData||{}).rows}"
      :settings="vscompt.comptAttrs.setting"
      :events="vscompt.comptAttrs.chartEvents"
      :visual-map="vscompt.comptAttrs.extendSetting.visualMap"
      :series="vscompt.comptAttrs.extendSetting.series"
      :legend="vscompt.comptAttrs.extendSetting.legend"
      :title="vscompt.comptAttrs.extendSetting.title"
      :background-color="vscompt.comptAttrs.extendSetting.backgroundColor"
      :grid="vscompt.comptAttrs.extendSetting.grid"
      :tooltip="vscompt.comptAttrs.extendSetting.tooltip"
      :after-set-option-once="afterSetBmap"
      @click.native="bmapClick"
    />
    <ve-map
      v-else
      v-bind="vscompt"
      width="100%"
      height="100%"
      :key="Math.random()"
      :data="{columns:(vscompt.comptData||{}).columns,rows:(vscompt.comptData||{}).rows}"
      :settings="vscompt.comptAttrs.setting"
      :events="vscompt.comptAttrs.chartEvents"
      :geo="vscompt.comptAttrs.extendSetting.geo"
      :series="vscompt.comptAttrs.extendSetting.series"
      :legend="vscompt.comptAttrs.extendSetting.legend"
      :title="vscompt.comptAttrs.extendSetting.title"
      :background-color="vscompt.comptAttrs.extendSetting.backgroundColor"
      :grid="vscompt.comptAttrs.extendSetting.grid"
      :tooltip="vscompt.comptAttrs.extendSetting.tooltip"
    />
    <div class="drill-label" v-show="vscompt.comptAttrs['curDrillIdx']||0 > 0" @click="toDrillData">
      {{vscompt.comptAttrs['drillWBeanList'] != undefined && vscompt.comptAttrs['drillWBeanList'].length>0 && vscompt.comptAttrs['curDrillIdx']||0 > 0?vscompt.comptAttrs['drillWBeanList'][vscompt.comptAttrs['curDrillIdx']||0].label:""}}
      <span
        v-show="vscompt.comptAttrs['drillWBeanList'] != undefined && vscompt.comptAttrs['drillWBeanList'].length>0&&vscompt.comptAttrs['curDrillIdx']||0>0"
        class="drill-icon icon-A10018_doubleArrowLeft"
      ></span>
    </div>
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
import { mapState, mapActions } from 'vuex';
import {
  constructList,
  objDeepCopy,
  getRequestParam,
  addPageCondis,
  getLinkRequestParam,
  dataInterval,
  loadDataDone,
  loadDataError
} from '../../utils/comonFunc.js';
import { setTimeout } from 'timers';
export default {
  props: ["vscompt"],
  data () {
    return {
      linkageState: false,
      area_name: '',
      colsTotal: {},
      columnsData: {}
    };
  },
  async mounted () {
    // 地图范围
    if (!['VeBmap', 'VeLinesBmap', 'VeHeatBmap'].includes(this.vscompt.type)) {
      if (
        this.vscompt.comptAttrs.mapLevel == '1' &&
        (this.vscompt.comptAttrs.mapArea != '' ||
          this.vscompt.comptAttrs.mapArea != undefined)
      ) {
        this.vscompt.comptAttrs.setting['position'] =
          'province/' + this.vscompt.comptAttrs.mapArea;
      }
    }

    if (this.vscompt.comptAttrs.curDrillIdx == undefined) {
      this.$set(this.vscompt.comptAttrs, 'curDrillIdx', 0);
      this.$set(this.vscompt.comptAttrs, 'drillWBeanList', []);
    }
    if (this.vscompt.afId == '' && this.vscompt.comptData == undefined) {
      this.$set(this.vscompt, 'comptData', {
        columns: [],
        rows: []
      });
      this.$set(this.vscompt.comptAttrs, 'isNeedRestDrill', 0);
      this.$set(this.vscompt.comptAttrs, 'isNeedResetLink', 0);
    }
    // 钻取情况下保存，重置geo.map
    if (
      this.vscompt.comptAttrs.mapLevel == '1' &&
      this.vscompt.comptAttrs.curDrillIdx == 0 &&
      this.vscompt.comptAttrs.setting.position != '' &&
      this.vscompt.comptAttrs.extendSetting.geo.map !=
        this.vscompt.comptAttrs.setting.position
    ) {
      this.vscompt.comptAttrs.extendSetting.geo.map = this.vscompt.comptAttrs.setting.position;
      this.vscompt.comptAttrs.extendSetting.series[0].data = [];
    }
    // 区域地图,pc和手机端样式重置
    if (['1001001','1001002'].includes(this.pageCache.classTypeId) && this.vscompt.type === 'VeAreaMap') {
      // 地名和数据标签文字颜色
      this.$set(
        this.vscompt.comptAttrs.extendSetting.series[0].label.normal,
        'color',
        '#000'
      );
      // 地名和标签展示位置
      this.$set(
        this.vscompt.comptAttrs.extendSetting.series[0].label.normal,
        'position',
        'bottom'
      );
      // 地图区域颜色
      this.$set(
        this.vscompt.comptAttrs.extendSetting.geo.itemStyle.normal,
        'areaColor',
        '#ff7f50'
      );
      // 地图鼠标悬浮区域颜色
      this.$set(
        this.vscompt.comptAttrs.extendSetting.geo.itemStyle.emphasis,
        'areaColor',
        '#ffdf33'
      );
      // 图例文字颜色
      this.$set(
        this.vscompt.comptAttrs.extendSetting.legend.data[0].textStyle,
        'color',
        '#000'
      );
      // 图例图形颜色
      this.$set(
        this.vscompt.comptAttrs.extendSetting.series[0].itemStyle,
        'color',
        '#1be9bf'
      );
      // 图例默认展示
      if(this.vscompt.styleAttrs[1].children[0].value == '') {
        this.$set(this.vscompt.comptAttrs.extendSetting.legend, 'show', true);
        for(var i=0;i<5;i++) {
          this.$set(
            this.vscompt.styleAttrs[1].children[0].options[i],
            'isSelected',
            i == 3 ? true : false
          );
        }
      }
    }

    var that = this;
    this.vscompt.comptAttrs.chartEvents = {
      click: function (e) {
        if (
          that.isCanDrill &&
          that.vscompt.comptAttrs.curDrillIdx <
            that.vscompt.comptAttrs.drillData.length - 1
        ) {
          that.area_name = e.name;
          let mapName = e.name.replace(/(['一',('县市')])/gi, '');
          that.vscompt.comptAttrs.extendSetting.geo['map'] = mapName;
          if (that.vscompt.comptAttrs.curDrillIdx == 0) {
            that.vscompt.comptAttrs.drillWBeanList = [];
            that.vscompt.comptAttrs.drillWBeanList.push({
              item: objDeepCopy(that.vscompt.comptAttrs.xAxisData[0]),
              whereBean: objDeepCopy(that.vscompt.comptAttrs.whereBean),
              label: ''
            });
          }
          // 钻取情况下清空散点和最值
          that.vscompt.comptAttrs.extendSetting.series[0].data = [];
          that.vscompt.comptAttrs.extendSetting.series[1].data = [];
          // 省级下钻到市级
          if (that.vscompt.comptAttrs.mapLevel == '1') {
            let mapJson = require('@/../public/echarts-map-geo/city/' +
              mapName);
            that.$echarts.registerMap(mapName, mapJson);
          }
          that.queryData({ isDownDrill: true, label: e.name });
        }
        if (
          (that.vscompt.comptAttrs.mainLinkageData.length > 0 ||
            that.isPageLinkSet) &&
          that.isLinkageCondi(e.name)
        ) {
          that.setLinkageCondi({
            label: e.name,
            xAxisData: that.xAxisData,
            vscompt: that.vscompt,
            isJumpNewPage: true
          });
          that.linkageState = true;
        }
        if (!that.vscompt.comptAttrs.mainLinkageData || that.vscompt.comptAttrs.mainLinkageData.length === 0 || that.vscompt.comptAttrs.drillData.length === 0) {
          that.gotoPage(that.vscompt.comptAttrs.extendSetting);
        }
      }
    };
    if (this.isResetMapSeries) {
      setTimeout(() => {
        this.reSetAreaMapSeriesData();
      }, 500);
    }
    if (this.isRegisterMap) {
      let mapJson = require('@/../public/echarts-map-geo/city/' +
        this.vscompt.comptAttrs.extendSetting.geo.map);
      this.$echarts.registerMap(
        this.vscompt.comptAttrs.extendSetting.geo.map,
        mapJson
      );
    }
    if (['VeBmap', 'VeHeatBmap'].includes(this.vscompt.type)) {
      let range = await this.measureValRange();
      if (['VeBmap'].includes(this.vscompt.type)) {
        this.vscompt.comptAttrs.extendSetting.series[0].symbolSize = this.symbolSizeFunc;
      } else {
        this.vscompt.comptAttrs.extendSetting.visualMap.max = range[1][1];
      }
      // tooltip 格式
      this.vscompt.comptAttrs.extendSetting.tooltip = {
        trigger: 'item',
        formatter: (params, ticket, callback) => {
          let name = this.vscompt.comptAttrs.extendSetting.series[0].name || this.vscompt.comptData.columns[1];
          return params.name + '<br />' + name + ':' + params.data.value[2];
        }
      };
    }
    if (['VeLinesBmap'].includes(this.vscompt.type)) {
      //  重写tooltip
      let columnsName = this.vscompt.comptData.columns[2];
      this.vscompt.comptAttrs.extendSetting.tooltip = {
        trigger: 'item',
        formatter: function (params, ticket, callback) {
          if (params.seriesType === 'lines') {
            return params.data.fromName + '>' + params.data.toName + '<br />' + columnsName + ':' + params.data.value;
          } else {
            return params.name;
          }
        }
      };
    }
  },
  computed: {
    ...mapState({
      isDSMapReady: state => state.AnalyReportAttr.isDSMapReady,
      datasetMap: state => state.AnalyReportAttr.datasetMap,
      linkStack: state => state.PageDesign.linkStack,
      pageCache: state => state.HomeBody.pageCache
    }),
    isCanDrill () {
      return this.vscompt.comptAttrs.drillData.length > 1;
    },
    xAxisData () {
      var result = [];
      if (this.vscompt.comptAttrs.xAxisData.length > 0) {
        result =
          constructList(this.vscompt.comptAttrs.xAxisData, this.datasetMap, this.vscompt.comptAttrs.computedData || [])
            .resultList || [];
      }
      return result;
    },
    yAxis1Data () {
      var result = [];
      if (this.vscompt.comptAttrs.yAxis1Data.length > 0) {
        result =
          constructList(this.vscompt.comptAttrs.yAxis1Data, this.datasetMap, this.vscompt.comptAttrs.computedData || [])
            .resultList || [];
      }
      return result;
    },
    yAxis2Data () {
      var result = [];
      if (this.vscompt.comptAttrs.yAxis2Data.length > 0) {
        result =
          constructList(this.vscompt.comptAttrs.yAxis2Data, this.datasetMap, this.vscompt.comptAttrs.computedData || [])
            .resultList || [];
      }
      return result;
    },
    drillData () {
      var result = [];
      if (this.vscompt.comptAttrs.drillData.length > 0) {
        result =
          constructList(this.vscompt.comptAttrs.drillData, this.datasetMap, this.vscompt.comptAttrs.computedData || [])
            .resultList || [];
      }
      return result;
    },
    isPageLinkSet () {
      return (
        this.vscompt.comptAttrs['pageLinkageData'] != undefined &&
        this.vscompt.comptAttrs['pageLinkageData'].length > 0
      );
    },
    isResetMapSeries () {
      if (['VeBmap', 'VeLinesBmap', 'VeHeatBmap'].includes(this.vscompt.type)) {
        return false;
      }
      return (
        this.vscompt.comptAttrs.extendSetting.series[0].label.normal.show !=
          undefined &&
        this.vscompt.comptAttrs.extendSetting.series[0].label.normal.show &&
        (this.vscompt.comptAttrs.extendSetting.series[0].label.normal
          .formatter == undefined ||
          this.vscompt.comptAttrs.extendSetting.series[0].label.normal
            .formatter == null)
      );
    },
    isRegisterMap () {
      // 当前地图处于钻取状态，重新注册地图echarts.isRegisterMap
      return (
        this.vscompt.comptAttrs.mapLevel == '1' &&
        this.vscompt.comptAttrs.curDrillIdx == 1 &&
        this.vscompt.comptAttrs.extendSetting.geo.map != ''
      );
    }
  },
  watch: {
    isDSMapReady: {
      immediate: true, // immediate选项可以开启首次赋值监听
      handler (newVal, oldVal) {
        if (this.vscompt.comptAttrs.curDrillIdx == undefined) {
          this.$set(this.vscompt.comptAttrs, 'curDrillIdx', 0);
          this.$set(this.vscompt.comptAttrs, 'drillWBeanList', []);
        }
        if (this.vscompt.comptData == undefined) {
          this.$set(this.vscompt, 'comptData', {
            columns: [],
            rows: []
          });
          this.$set(this.vscompt.comptAttrs, 'isNeedRestDrill', 0);
        }
        if (this.vscompt.comptAttrs.isResetSeriesData != 0) {
          this.$set(this.vscompt.comptAttrs, 'isResetSeriesData', 0);
        }
        // 清除指标维度选中状态，默认全部选中
        if (
          this.vscompt.comptAttrs.extendSetting['legend.selected'] != undefined
        ) {
          let selectedObj = this.vscompt.comptAttrs.extendSetting[
            'legend.selected'
          ];
          for (let key in selectedObj) {
            selectedObj[key] = true;
          }
        }
        // 省/市级地图，动态获取该市级json
        let mapLevel = this.vscompt.comptAttrs.mapLevel;
        if (mapLevel === '1' || mapLevel === '2') {
          let mapName = mapLevel === '1' ? this.vscompt.comptAttrs.mapArea : this.vscompt.comptAttrs.mapArea.replace(/(['一',('县市')])/gi, '');
          const geoJson = require('@/../public/echarts-map-geo/'+ (mapLevel === '1' ? 'province/' : 'city/') + mapName + '.json');
          this.$echarts.registerMap((mapLevel === '1' ? 'province/' : '') + mapName,geoJson);
        }
        if (
          newVal &&
          this.vscompt.afId != '' &&
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
        if (this.pageCache.operation == 'preview') { // 数据刷新
          let time=this.vscompt.comptAttrs.extendSetting.timerValue;
          dataInterval(time,this.queryData,this.vscompt.comptAttrs.extendSetting);
        }
      }
    },
    'vscompt.comptAttrs.isNeedRestDrill': {
      immediate: true,
      handler (newVal, oldVal) {
        if (newVal > 0) {
          this.vscompt.comptAttrs.curDrillIdx = 0;
          this.vscompt.comptAttrs.drillWBeanList = [];
        }
      }
    },
    'vscompt.comptAttrs.linkageCondi': {
      // 监听联动
      // immediate: true,
      deep: true,
      handler (newVal, oldVal) {
        if (this.vscompt.comptAttrs.isLinkage) {
          this.queryLinkData(newVal || []);
        }
      }
    },
    'vscompt.comptAttrs.isNeedResetLink': {
      handler (newVal, oldVal) {
        if (
          newVal > 0 &&
          this.vscompt.comptAttrs['mainLinkageData'].length > 0 &&
          this.linkageState
        ) {
          this.resetLinage();
        }
      }
    },
    'vscompt.comptAttrs.isResetSeriesData': {
      handler (newVal, oldVal) {
        if (newVal > 0) {
          this.setAreaMapSeriesData();
        }
      }
    },
    'vscompt.comptData': {
      async handler (newVal, oldVal) {
        let range = await this.measureValRange();
        if (this.vscompt.type === 'VeBmap') {
          let columnsName = newVal.columns[0];
          // let seriesData = this.vscompt.comptAttrs.extendSetting.series[0].data;
          let features = this.vscompt.comptAttrs.setting.mapOrigin.features;
          let scatterData = newVal.rows.map(row => {
            let ret;
            features.forEach(ft => {
              if (ft.properties.name === row[columnsName]) {
                ft.properties.cp[2] = row[newVal.columns[1]];
                ret = { name: ft.properties.name, value: ft.properties.cp };
              }
            });
            return ret;
          });
          this.vscompt.comptAttrs.extendSetting.series[0].data = scatterData;
          this.vscompt.comptAttrs.extendSetting.series[0].symbolSize = this.symbolSizeFunc;
        } else if (this.vscompt.type === 'VeHeatBmap') {
          this.vscompt.comptAttrs.extendSetting.visualMap.max = range[1][1];
        } else if (['VeLinesBmap'].includes(this.vscompt.type)) {
          //  重写tooltip
          let columnsName = newVal.columns[2];
          this.vscompt.comptAttrs.extendSetting.tooltip = {
            trigger: 'item',
            formatter: function (params, ticket, callback) {
              if (params.seriesType === 'lines') {
                return params.data.fromName + '>' + params.data.toName + '<br />' + columnsName + ':' + params.data.value;
              } else {
                return params.name;
              }
            }
          };
        }
      }
    }
  },
  methods: {
    symbolSizeFunc (val) {
      if (!val[2]) {
        return 0;
      }
      let range = this.measureValRange();
      const valRange = range[0][1] - range[0][0];
      if (valRange === 0) { // 最大最小值一样的情况，默认为15
        return 15;
      }
      let ret = 5 + parseInt((val[2] - range[0][0]) / valRange * 20);
      if (ret > 25) {
        ret = 25;
      }
      if (ret < 5) {
        ret = 5;
      }
      return ret;
    },
    queryData (param) {
      let params = getRequestParam({
        param: param,
        vscompt: this.vscompt,
        drillData: this.drillData,
        xAxisData: this.xAxisData,
        yAxis1Data: this.yAxis1Data,
        yAxis2Data: this.yAxis2Data,
        dataType: 3,
        datasetMap: this.datasetMap
      });
      if (param != undefined && param.isUpDrill) {
        this.vscompt.comptAttrs.extendSetting.series[0].data = [];
        this.vscompt.comptAttrs.extendSetting.series[1].data = [];
        require('@/../public/echarts-map-geo/province/' +
          this.vscompt.comptAttrs.mapArea);
        this.vscompt.comptAttrs.extendSetting.geo['map'] =
          'province/' + this.vscompt.comptAttrs.mapArea;
      }
      params['mapArea'] = this.vscompt.comptAttrs.mapArea;
      if(param && param.isDownDrill) {
        params['mapArea'] = this.area_name;
      }
      this.executeReqest(params);
    },
    executeReqest (params) {
      params = addPageCondis({
        vscompt: this.vscompt,
        params: params,
        datasetMap: this.datasetMap
      });
      var _this = this;
      this.vscompt.comptAttrs.loading = true;
      let computedData = this.vscompt.comptAttrs.computedData||[];
      this.queryComptData({ params, computedData })
        .then(function (response) {
          if (response.data.respResult == 1) {
            let comptData = response.data.respData;
            if (
              comptData.columns != undefined &&
              comptData.columns.length > 0 &&
              comptData.columns.indexOf('XXXXCODE') > -1
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
            _this.resetGeo();
            _this.getColsTotalAndData();
            if (!['VeBmap', 'VeLinesBmap', 'VeHeatBmap'].includes(_this.vscompt.type)) {
              _this.resetMapScatterData();
            }
            let extend = _this.vscompt.comptAttrs.extendSetting;
            let scaData = extend.series[0];
            // 如果散点图data为null或者只有经纬度 或者钻取情况下，重置data,赋经纬度和初始值value[2]
            if (
              scaData == undefined ||
              scaData.data == null ||
              scaData.data.length == 0 ||
              scaData.data[0].value == undefined ||
              scaData.data[0].value.length < 3 ||
              (_this.vscompt.styleAttrs[2].children[2].value == true &&
                params.afQueryBean.where_bean != null &&
                params.afQueryBean.where_bean.exp != '' &&
                params.afQueryBean.where_bean.rule_list.length > 0)
            ) {
              if (!['VeHeatBmap'].includes(_this.vscompt.type)) {
                let mapName = '';
                if (
                  _this.vscompt.comptAttrs.mapLevel == '1' &&
                  _this.vscompt.comptAttrs.curDrillIdx == 0
                ) {
                  mapName = 'province/' + _this.vscompt.comptAttrs.mapArea;
                } else if (
                  _this.vscompt.comptAttrs.mapLevel == '2' ||
                  _this.vscompt.comptAttrs.curDrillIdx == 1
                ) {
                  mapName = _this.area_name.replace(/(['一',('县市')])/gi, '');
                }
                let mapJson = _this.$echarts.getMap(mapName);
                let features =
                  mapJson == null ? [] : (mapJson.geoJson || {}).features;
                // 坐标集合
                let properties = {};
                let seriesData =
                  _this.columnsData[
                    _this.vscompt.styleAttrs[2].children[0].value
                  ];
                let maxData = { column: '', result: 0 };
                // 散点data
                let scatterData = [{}];
                for (var i = 0; i < features.length; i++) {
                  properties[features[i].properties.name] =
                    features[i].properties.cp;
                  // set散点坐标
                  scatterData.push({
                    name: features[i].properties.name,
                    value: features[i].properties.cp
                  });
                  // set散点data
                  if (seriesData != null && seriesData != {})
                    scatterData[i].value[2] =
                      seriesData[features[i].properties.name];
                }
                scatterData = scatterData.filter(sd => {
                  return sd.value[2] && sd.value[2] !== '-';
                });
                // 设置散点
                extend.series[0].data = scatterData;
                extend.series[0].name = extend.legend.data[0]||{}.name ? extend.legend.data[0]||{}.name : _this.vscompt.comptData.columns[1];
                // 设置最大值
                if (
                  extend['series.0.markPoint'] &&
                  seriesData != null &&
                  seriesData != {} &&
                  maxData.column != '' &&
                  _this.vscompt.type === 'VeAreaMap'
                ) {
                  properties[maxData.column].push(maxData.result);
                  extend.series[1].data = [];
                  extend.series[1].data.push({
                    name: maxData.column,
                    value: properties[maxData.column]
                  });
                }
                // 如果显示数据标签，重置散点data格式
                if (_this.vscompt.type === 'VeAreaMap') {
                  if (extend.series[0].label.normal.show) {
                    _this.ResetScatterSeriesData({
                      vscompt: _this.vscompt,
                      colsTotal: _this.colsTotal,
                      columnsData: _this.columnsData
                    });
                  }
                }
              }
              if(['VeLines', 'VeBmap', 'VeLinesBmap', 'VeHeatBmap'].includes(_this.vscompt.type)) {
                //  重写tooltip
                let columnsName = _this.vscompt.comptData.columns[2];
                _this.vscompt.comptAttrs.extendSetting.tooltip = {
                  trigger: 'item',
                  formatter: function (params, ticket, callback) {
                    if(params.seriesType === 'lines') {
                      return params.data.fromName+'>'+params.data.toName+'<br />'+ columnsName + ':' +params.data.value;
                    }else{
                      return params.name;
                    }
                  }
                };
              }
            }
            _this.setAnotherName(_this.vscompt);
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
    ...mapActions({
      queryComptData: 'QueryTable/queryComptData',
      setLinkageCondi: 'PageDesign/setLinkageCondi',
      setAreaMapSeriesData: 'PageDesign/setAreaMapSeriesData',
      ResetScatterSeriesData: 'PageDesign/ResetScatterSeriesData',
      gotoPage: 'PageDesign/gotoPage',
      setAnotherName: 'PageDesign/setAnotherName'
    }),
    toDrillData () {
      this.queryData({ isUpDrill: true });
    },
    queryLinkData (linkageCondi) {
      let params = getLinkRequestParam({
        linkageCondi: linkageCondi,
        vscompt: this.vscompt,
        xAxisData: this.xAxisData,
        yAxis1Data: this.yAxis1Data,
        yAxis2Data: this.yAxis2Data,
        dataType: 3
      });
      this.executeReqest(params);
    },
    resetLinage () {
      this.setLinkageCondi({
        label: '',
        xAxisData: this.xAxisData,
        vscompt: this.vscompt,
        isJumpNewPage: false
      });
      this.linkageState = false;
    },
    getColsTotalAndData () {
      let columns = (this.vscompt.comptData || {}).columns || [];
      let array = (this.vscompt.comptData || {}).rows || [];
      for (var i = 1; i < columns.length; i++) {
        let result = 0;
        let col = {};
        for (var j = 0; j < array.length; j++) {
          result += parseFloat(array[j][columns[i]]);
          col[array[j][columns[0]]] = parseFloat(array[j][columns[i]]);
        }
        this.colsTotal[columns[i]] = result;
        this.columnsData[columns[i]] = col;
      }
    },
    isLinkageCondi (areaName) {
      let areaExist = false;
      let columns = (this.vscompt.comptData || {}).columns || [];
      let rows = (this.vscompt.comptData || {}).rows || [];
      for (var i = 0; i < rows.length; i++) {
        if (areaName == rows[i][columns[0]]) {
          areaExist = true;
          break;
        }
      }
      // 判断地图是否处于被联动状态，如果被联动，点击其他地区不能触发联动
      if (
        this.vscompt.comptAttrs.linkageCondi != undefined &&
        this.vscompt.comptAttrs.linkageCondi.length > 0 &&
        areaExist
      ) {
        return true;
      }
      if (
        this.vscompt.comptAttrs.mainLinkageData != undefined &&
        this.vscompt.comptAttrs.mainLinkageData.length > 0 &&
        areaExist
      ) {
        return true;
      }
      if(this.vscompt.comptAttrs.pageLinkageData != undefined && this.vscompt.comptAttrs.pageLinkageData.length >0 && areaExist) {
        return true;
      }
      return false;
    },
    reSetAreaMapSeriesData () {
      // 数据与标签
      let dataLab =
        this.vscompt.comptAttrs.extendSetting[
          'series.0.label.normal.map.show'
        ] || false;
      // 地名
      let areaName = this.vscompt.styleAttrs[1].children[1].value || false;
      let formatter = dataLab
        ? areaName
          ? "function(params){return (params.value[2]==undefined ? '-' : params.value[2])+'\\n'+params.name }"
          : "function(params){return params.value[2]==undefined ? '-' : params.value[2]}"
        : areaName
          ? 'function(params){return params.name}'
          : '';
      if (formatter == '') {
        this.vscompt.comptAttrs.extendSetting.series[0].label.normal.show = false;
      } else {
        this.vscompt.comptAttrs.extendSetting.series[0].label.normal.formatter = eval(
          '(' + formatter + ')'
        );
        this.vscompt.comptAttrs.extendSetting.series[0].label.normal.show = false;
        this.vscompt.comptAttrs.extendSetting.series[0].label.normal.show = true;
      }
    },
    resetMapScatterData () {
      // 散点scatter赋值
      let scatterData = [];
      let type = this.vscompt.type;
      if (!['VeHeatBmap'].includes(type)) {
        let mapArea = this.vscompt.comptAttrs.mapArea;
        let mapLevel = this.vscompt.comptAttrs.mapLevel;
        let mapJson = {};
        if (['VeBmap', 'VeLinesBmap'].includes(this.vscompt.type)) {
          let geoJson = this.vscompt.comptAttrs.setting['mapOrigin'];
          mapJson['geoJson'] = geoJson;
        } else {
          mapJson = this.$echarts.getMap(
            mapLevel == '1'
              ? this.vscompt.comptAttrs.drillData.length == 0
                ? 'province/' + mapArea
                : this.vscompt.comptAttrs.extendSetting.geo.map
              : mapArea.replace(/(['一',('县市')])/gi, '')
          );
        }
        let features = mapJson == null ? [] : (mapJson.geoJson || {}).features;
        // 坐标集合
        let properties = {};
        for (var i = 0; i < features.length; i++) {
          properties[features[i].properties.name] = features[i].properties.cp;
          scatterData.push({
            name: features[i].properties.name,
            value: features[i].properties.cp
          });
          if (
            this.vscompt.comptData.rows == null ||
            this.vscompt.comptData.rows.length == 0
          ) {
            scatterData[i].value[2] = '-';
          }
        }
        this.vscompt.comptAttrs.extendSetting.series[0].data = scatterData;
      }
      if (['VeAreaMap'].includes(type)) {
        // 区域地图在系列设置
        let styleIndex = type === 'VeAreaMap' ? 2 : 1;
        let seriesName = this.vscompt.comptData.columns[type === 'VeAreaMap' ? 1 : 2];
        // let colsData = (this.getColsTotalAndData.colsData || {})[seriesName];
        let colsData = (this.columnsData || {})[seriesName];
        // 如果显示数据标签，散点数据赋值data.value[2]
        if (
          this.vscompt.styleAttrs[styleIndex].children[2].value &&
          this.vscompt.comptData.rows != null &&
          this.vscompt.comptData.rows.length > 0
        ) {
          // 小数点
          let decimal = this.vscompt.styleAttrs[styleIndex].children[4].value;
          // let tolCount = this.getColsTotalAndData.colsTotal[seriesName];
          let tolCount = (this.colsTotal || {})[seriesName];
          // 数据显示格式
          let smooth = this.vscompt.styleAttrs[styleIndex].children[3].value;
          eval('smooth=' + this.vscompt.styleAttrs[styleIndex].children[3].value);
          for (let i = 0; i < scatterData.length; i++) {
            for (let key in colsData) {
              if (key == scatterData[i].name) {
                scatterData[i].value[2] = smooth.smooth
                  ? (colsData[key] == 0 || colsData[key] == ''
                    ? 0
                    : parseFloat((colsData[key] * 100) / tolCount).toFixed(
                      parseInt(decimal)
                    )) + '%'
                  : parseFloat(colsData[key]).toFixed(parseInt(decimal));
                break;
              }
            }
          }
        }
       
        // 设置图例
        let legendName =
          this.vscompt.comptAttrs.extendSetting.legend.data[0]['name'] != ''
            ? this.vscompt.comptAttrs.extendSetting.legend.data[0]['name']
            : this.vscompt.comptData.columns[1];
        this.vscompt.comptAttrs.extendSetting.series[0].name = legendName;
        this.vscompt.comptAttrs.extendSetting.legend.data[0][
          'name'
        ] = legendName;

      } else if (['VeLines', 'VeLinesBmap'].includes(type)) {
        // 迁徙图

        //  重写tooltip
        let columnsName = this.vscompt.comptData.columns[2];
        this.vscompt.comptAttrs.extendSetting.tooltip = {
          trigger: 'item',
          formatter: function (params, ticket, callback) {
            if(params.seriesType === 'lines') {
              return params.data.fromName+'>'+params.data.toName+'<br />'+ columnsName + ':' +params.data.value;
            }else{
              return params.name;
            }
          }
        };

        // 设置迁徙图路线
        let rows = this.vscompt.comptData.rows || [];
        let columns = this.vscompt.comptData.columns || [];
        // 显示top，刷新之后恢复默认值50
        this.vscompt.styleAttrs[1].children[2].value = 50;
        // 地图区域颜色等设置默认值
        let styleAttrs = this.vscompt.styleAttrs;
        this.vscompt.comptAttrs.extendSetting.geo.label.normal['color'] = styleAttrs[2].children[4].value || '#fff';
        this.vscompt.comptAttrs.extendSetting.geo.itemStyle.normal['borderColor'] = styleAttrs[2].children[5].value || 'rgba(255,255,255,0.6)';
        this.vscompt.comptAttrs.extendSetting.geo.itemStyle.normal['areaColor'] = styleAttrs[2].children[6].value || '#00366f';

        let legendData = {};
        let legendNames = [];// 图例
        for(let i=0;i<rows.length;i++) {
          let fromName = rows[i][columns[0]]; // 迁出
          let toName = rows[i][columns[1]];// 迁入
          // coords坐标不能为null
          if(!properties[fromName] || !properties[toName]) {
            continue;
          }
          let item = {
            fromName: fromName,
            toName: toName,
            coords: [properties[fromName],properties[toName]],
            value: rows[i][columns[2]]
          };
          if(legendData[fromName]) {
            legendData[fromName].push(item);
          }else{
            legendNames.push(fromName);
            legendData[fromName] = [item];
          }
        }
        // 设置图例
        this.vscompt.comptAttrs.extendSetting.legend.data = legendNames;
        for(let key in legendData) {
          let lines = {
            name: key,
            type: 'lines',
            zlevel: 1,
            symbol: ['none', 'arrow'],
            symbolSize: 5,
            effect: {
              show: true,
              period: styleAttrs[2].children[2].value || 6,
              trailLength: 0.2,
              symbol: styleAttrs[2].children[0].value || 'path://M1705.06,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705.06,1318.313z',
              symbolSize: styleAttrs[2].children[1].value || 15,
              constantSpeed: 0,
              loop: true
            },
            lineStyle: {
              normal: {
                width: 1,
                opacity: 0.6,
                curveness: 0.2,
                type: styleAttrs[2].children[3].value || 'solid'
              }
            },
            data: legendData[key],
            animation: false // 是否开启动画，默认true，此处要设置成false，不然轨迹会有残影
          };
          this.vscompt.comptAttrs.extendSetting.series.push(lines);
        }
      } else {
        console.log(type);
      }
    },
    resetGeo () {
      let newData = this.vscompt;
      let mapLevel = newData.comptAttrs.mapLevel;
      let mapArea = newData.comptAttrs.mapArea;
      // 地图范围，给地图层级和名称赋值
      if (['VeMap', 'VeAreaMap', 'VeLines'].includes(newData.type)) {
        let extend = newData.comptAttrs.extendSetting;
        if (['VeAreaMap', 'VeLines'].includes(newData.type)) {
          extend.series[0].data = [];
          extend.series[1].data = [];
          extend.series = extend.series.splice(0,3);// 清空迁徙图lines
        }
        delete extend['series.0.label.normal.show'];
        // 全国
        if (mapLevel === '0' && mapArea != '') {
          const geoJSON = require('@/../public/echarts-map-geo/china.json');
          newData.comptAttrs.setting['position'] = 'china';
          if (['VeAreaMap', 'VeLines'].includes(newData.type)) {
            extend.geo['map'] = 'china';
          }
          newData.comptAttrs.setting['mapOrigin'] = geoJSON;
        }
        // 省级
        if (
          mapLevel == '1' &&
          mapArea != '' &&
          newData.comptAttrs.curDrillIdx == 0
        ) {
          const geoJSON = require('@/../public/echarts-map-geo/province/' +
            mapArea + '.json');
          this.$echarts.registerMap('province/' +mapArea, geoJSON);
          if (['VeAreaMap', 'VeLines'].includes(newData.type)) {
            extend.geo['map'] = 'province/' + mapArea;
          } else {
            require('@/../public/echarts-map-geo/province/' + mapArea);
            extend['series'] = { type: 'map', map: ''};
          }
          newData.comptAttrs.setting['position'] = 'province/' + mapArea;
          newData.comptAttrs.setting['mapOrigin'] = geoJSON;
        }
        // 市级
        if (
          mapLevel == '2' &&
          mapArea &&
          newData.comptAttrs.curDrillIdx == 0
        ) {
          if (newData.type == 'VeMap') {
            extend['series'] = {
              type: 'map',
              map: mapArea.replace(/(['一',('县市')])/gi, '')
            };
          } else{
            extend.geo['map'] = mapArea.replace(/(['一',('县市')])/gi, '');
          }
          const geoJSON = require('@/../public/echarts-map-geo/city/' +
            mapArea.replace(/(['一',('县市')])/gi, '') +
            '.json');
          this.$echarts.registerMap(
            mapArea.replace(/(['一',('县市')])/gi, ''),
            geoJSON
          );
          newData.comptAttrs.setting['mapOrigin'] = geoJSON;
        }
        // 钻取情况下
        if (
          mapLevel == '1' &&
          newData.comptAttrs.curDrillIdx == 1 &&
          newData.comptAttrs.drillData.length > 1
        ) {
          const geoJSON = require('@/../public/echarts-map-geo/city/' +
            (newData.type === 'VeAreaMap'
              ? extend.geo['map'] : extend['series']['map']));
          this.$echarts.registerMap(
            newData.type === 'VeAreaMap' ? extend.geo['map'] : extend['series']['map'], geoJSON
          );
          newData.comptAttrs.setting['mapOrigin'] = geoJSON;
        }
      }
    },
    measureValRange () {
      let range = [
        [0, 0],
        [0, 0]
      ];
      let {
        columns = [],
        rows = []
      } = this.vscompt.comptData || {};
      if (columns.length === 0 || rows.length === 0) {
        return range;
      }
      for (let index = 1; index < columns.length; index++) {
        const measureName = columns[index];
        const measureVals = rows.map(row1 => row1[measureName]);
        range[index - 1] = [Math.min(...measureVals), Math.max(...measureVals)];
        // console.log('度量最大最小值', measureName, ...range[index - 1]);
      }
      return range;
    },
    afterSetBmap (echarts) {
      let bmap = echarts.getModel().getComponent('bmap').getBMap();
      bmap.addControl(new window.BMap.NavigationControl({ offset: new window.BMap.Size(0, 25) }));
      bmap.addEventListener('zoomend', (e) => {
        let center = this.vscompt.comptAttrs.setting.bmap.center;
        bmap.centerAndZoom(new window.BMap.Point(center[0], center[1]), bmap.getZoom());
        this.vscompt.comptAttrs.setting.bmap.zoom = bmap.getZoom();
      });
      // bmap.addEventListener('dragend', () => {
      //   let center = bmap.getCenter();
      // });
    },
    bmapClick () {
      if (!this.vscompt.comptAttrs.mainLinkageData || this.vscompt.comptAttrs.mainLinkageData.length === 0 || this.vscompt.comptAttrs.drillData.length === 0) {
        this.gotoPage(this.vscompt.comptAttrs.extendSetting);
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
