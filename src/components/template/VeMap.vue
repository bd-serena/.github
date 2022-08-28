<template>
  <div style="width:100%;height:100%;position:relative;">
    <ve-map
      v-bind="vscompt"
      width="100%"
      height="100%"
      :data="{columns:(vscompt.comptData||{}).columns,rows:(vscompt.comptData||{}).rows}"
      :settings="vscompt.comptAttrs.setting"
      :extend="vscompt.comptAttrs.extendSetting"
      :events="vscompt.comptAttrs.chartEvents"
    ></ve-map>
    <div style="position: absolute; top: 30px; left: 10px;">
      <div v-for="(item,index) in visualList" class="visual-list-item" :key="item.element_id">
        <div class="visual-item-tit">
          {{ visualTitleList[index] || item.title }}
        </div>
        <div v-for="range in item.splitList" class="visual-range-item" :key="range.label">
          <b class="range-icon" :style="{'background-color': range.iconColor}" />
          <span>{{ range.label }}</span>
        </div>
      </div>
    </div>
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
import { mapState, mapActions } from "vuex";
import VisualmapMixin from '@component/template/mixins/VisualmapMixin';
import {
  constructList,
  objDeepCopy,
  getRequestParam,
  addPageCondis,
  getLinkRequestParam,
  dataInterval,
  loadDataDone,
  loadDataError
} from "../../utils/comonFunc.js";
export default {
  props: ["vscompt"],
  mixins: [VisualmapMixin],
  data() {
    return {
      linkageState: false,
      area_name: "",
      maxData: {},
      colsTotal: {},
      columnsData: {},
      visualTitleList: []
    };
  },
  mounted() {
    //地图范围
    if (
      (this.vscompt.comptAttrs.mapLevel == "1")  &&
      (this.vscompt.comptAttrs.mapArea != "" ||
        this.vscompt.comptAttrs.mapArea != undefined)
    ) {
      this.vscompt.comptAttrs.setting["position"] =
        "province/" + this.vscompt.comptAttrs.mapArea;
    }

    if (this.vscompt.comptAttrs.curDrillIdx == undefined) {
      this.$set(this.vscompt.comptAttrs, "curDrillIdx", 0);
      this.$set(this.vscompt.comptAttrs, "drillWBeanList", []);
    }
    if (this.vscompt.afId == "" && this.vscompt.comptData == undefined) {
      this.$set(this.vscompt, "comptData", {
        columns: [],
        rows: []
      });
      this.$set(this.vscompt.comptAttrs, "isNeedRestDrill", 0);
      this.$set(this.vscompt.comptAttrs, "isNeedResetLink", 0);
    }
    if(this.vscompt.comptAttrs.mapLevel == '1' && this.vscompt.comptAttrs.curDrillIdx == 0 &&
      this.vscompt.comptAttrs.setting.position != "" && this.vscompt.comptAttrs.extendSetting.series.map != ""){
      this.vscompt.comptAttrs.extendSetting.series.map = ""
    }
    var that = this;
    this.vscompt.comptAttrs.chartEvents = {
      click: function(e) {
        if (
          that.isCanDrill &&
          that.vscompt.comptAttrs.curDrillIdx <
            that.vscompt.comptAttrs.drillData.length - 1
        ) {
          that.area_name = e.name;
          let mapName = e.name.replace(/(['一',('县市')])/gi, "");
          that.vscompt.comptAttrs.extendSetting["series"] = {
            type: "map",
            map: mapName
          };
          //省级下钻到市级
          if(that.vscompt.comptAttrs.mapLevel == "1"){
            let mapJson = require("@/../public/echarts-map-geo/city/" + mapName);
            that.$echarts.registerMap(mapName,mapJson);
          }
          if (that.vscompt.comptAttrs.curDrillIdx == 0) {
            that.vscompt.comptAttrs.drillWBeanList = [];
            that.vscompt.comptAttrs.drillWBeanList.push({
              item: objDeepCopy(that.vscompt.comptAttrs.xAxisData[0]),
              whereBean: objDeepCopy(that.vscompt.comptAttrs.whereBean),
              label: ""
            });
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
        if(!that.vscompt.comptAttrs.mainLinkageData||that.vscompt.comptAttrs.mainLinkageData.length === 0||that.vscompt.comptAttrs.drillData.length === 0){
            that.gotoPage(that.vscompt.comptAttrs.extendSetting);
        }
      }
    };
    if(this.isResetMapSeries){
      this.getColsTotalAndData();
      setTimeout(() => {
        let yAxisData = that.yAxis1Data ==null || that.yAxis1Data.length == 0 ? 
            constructList(that.vscompt.comptAttrs.yAxis1Data, that.datasetMap, that.vscompt.comptAttrs.computedData || []).resultList || [] : that.yAxis1Data;
        if (yAxisData.length === 0 && that.vscompt.comptAttrs.yAxis1Data.length > 0) {
          yAxisData = that.vscompt.comptAttrs.yAxis1Data;
        }
        for(var i=0;i<yAxisData.length;i++){
          let { element_name = '' } = that.yAxis1Data[i] || {}; 
          if (!element_name && yAxisData[i].nick_name) {
            element_name = yAxisData[i].nick_name;
          }
          that.setMapAllSeriesData(i,element_name);
        }
      },500)
    }
    if (this.isRegisterMap) {
      let mapJson = require("@/../public/echarts-map-geo/city/" +
              this.vscompt.comptAttrs.extendSetting.series.map);
       this.$echarts.registerMap(this.vscompt.comptAttrs.extendSetting.series.map, mapJson);
    }
  },
  computed: {
    ...mapState({
      isDSMapReady: state => state.AnalyReportAttr.isDSMapReady,
      datasetMap: state => state.AnalyReportAttr.datasetMap,
      linkStack: state => state.PageDesign.linkStack,
      pageCache: state => state.HomeBody.pageCache
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
    },
    isResetMapSeries() {
      return (
        this.vscompt.comptAttrs.extendSetting["series.0.label.normal.show"] != undefined && 
        this.vscompt.comptAttrs.extendSetting["series.0.label.normal.show"] &&
        this.vscompt.comptAttrs.extendSetting["series.0.label.normal.formatter"] == undefined
      )
    },
    isRegisterMap() {
      //当前地图处于钻取状态，重新注册地图echarts.isRegisterMap
      return this.vscompt.comptAttrs.mapLevel == '1' &&
        this.vscompt.comptAttrs.curDrillIdx == 1 &&
        this.vscompt.comptAttrs.extendSetting.series.map != ""
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
        //清除指标维度选中状态，默认全部选中
        if(this.vscompt.comptAttrs.extendSetting['legend.selected'] != undefined){
          let selectedObj = this.vscompt.comptAttrs.extendSetting['legend.selected'];
          for(let key in selectedObj){
            selectedObj[key] = true;
          }
        }
        //省/市级地图，动态获取该市级json
        let mapLevel = this.vscompt.comptAttrs.mapLevel
        if (mapLevel === "1" || mapLevel === "2") {
          let mapName = mapLevel === '1' ? this.vscompt.comptAttrs.mapArea : this.vscompt.comptAttrs.mapArea.replace(/(['一',('县市')])/gi, ""); 
          const geoJson = require("@/../public/echarts-map-geo/"+ (mapLevel === '1' ? "province/" : "city/") + mapName + ".json");
          this.$echarts.registerMap((mapLevel === '1' ? "province/" : "") + mapName, geoJson);
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
    },
    visualList(newVal) {
      const visualMap = this.vscompt.comptAttrs.extendSetting.visualMap;
      if (newVal.length > 0) {
        visualMap.pieces = newVal[0].splitList || [];
      }
    },
    'vscompt.comptAttrs.setting.labelMap': {
      deep: true,
      immediate: true,
      handler(newVal) {
        this.initVisualTitleList(newVal);
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
        dataType: 3,
        datasetMap:this.datasetMap
      });
      if (param != undefined && param.isUpDrill) {
        this.vscompt.comptAttrs.extendSetting["series"] = {
          type: "map",
          map: this.vscompt.comptAttrs.drillWBeanList[
            this.vscompt.comptAttrs.drillWBeanList.length - 1
          ].label
        };
        //获取地图json
        require("@/../public/echarts-map-geo/province/"+this.vscompt.comptAttrs.mapArea);
      }
      params['mapArea'] = this.vscompt.comptAttrs.mapArea;
      if(param && param.isDownDrill){
        params['mapArea'] = this.area_name;
      }
      this.executeReqest(params);
    },
    executeReqest(params) {
      params = addPageCondis({
        vscompt: this.vscompt,
        params: params,
        datasetMap: this.datasetMap
      });
      var _this = this;
      this.vscompt.comptAttrs.loading = true;
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
            _this.getColsTotalAndData();
            for(var i=0;i<_this.yAxis1Data.length;i++){
              _this.setMapAllSeriesData(i,_this.yAxis1Data[i].element_name);
            }
            //设置最大值
            let seriesName = _this.vscompt.styleAttrs[2].children[0].value || (_this.vscompt.comptData || {}).columns[1] || 10000;
            _this.vscompt.comptAttrs.extendSetting.visualMap.max = _this.maxData[seriesName];
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
    ...mapActions({
      queryComptData: "QueryTable/queryComptData",
      setLinkageCondi: "PageDesign/setLinkageCondi",
      gotoPage: "PageDesign/gotoPage"
    }),
    toDrillData() {
      this.queryData({ isUpDrill: true });
    },
    queryLinkData(linkageCondi) {
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
    resetLinage() {
      this.setLinkageCondi({
        label: "",
        xAxisData: this.xAxisData,
        vscompt: this.vscompt,
        isJumpNewPage: false
      });
      this.linkageState = false;
    },
    getColsTotalAndData() {
      let columns = (this.vscompt.comptData || {}).columns || [];
      let array = (this.vscompt.comptData || {}).rows || [];
      for (var i = 1; i < columns.length; i++) {
        let result = 0;
        let col = {};
        let arr = [];
        for (var j = 0; j < array.length; j++) {
          result += parseFloat(array[j][columns[i]]);
          col[array[j][columns[0]]] = parseFloat(array[j][columns[i]]);
          arr.push(parseFloat(array[j][columns[i]]));
        }
        this.colsTotal[columns[i]] = result;
        this.columnsData[columns[i]] = col;
        arr.sort();
        this.maxData[columns[i]] = arr[arr.length-1];
      }
    },
    setMapAllSeriesData(idx,seriesName){
      //数据与标签
      let dataLab = this.vscompt.comptAttrs.extendSetting["series."+idx+".label.normal.map.show"] || false;
      //数据显示格式
      let format = this.vscompt.comptAttrs.extendSetting["series."+idx+".number.format"] || "{'smooth':false}";
      //地名
      let areaName = this.vscompt.styleAttrs[1].children[1].value || false;
      //小数点
      let decimal = this.vscompt.comptAttrs.extendSetting["series."+idx+".decimalDigit"] || '0';
      let tolCount = this.colsTotal[seriesName];
      let colsData = this.columnsData[seriesName];
      let smooth = format;
      eval('smooth=' + format);
      let formatter = !dataLab ?
        (areaName ? "function(data){return data.name;}" : "")
        : (
          areaName ?
            (smooth.smooth ?
                "function(data){let c; eval('c =' +JSON.stringify(" + JSON.stringify(colsData) + "));return data.name + ' : ' + (isNaN(data.value) ? '-' : parseFloat(c[data.name]*100/" + parseInt(tolCount) + ").toFixed(" + parseInt(decimal) + ")+'%');}"
                : "function(data){let c; eval('c =' +JSON.stringify(" + JSON.stringify(colsData) + "));return data.name + ' : ' + (isNaN(data.value) ? '-' : parseFloat(c[data.name]).toFixed(" + parseInt(decimal) + "));}"
            )
            : (smooth.smooth ?
              "function(data){let c; eval('c =' +JSON.stringify(" + JSON.stringify(colsData) + "));return (isNaN(data.value) ? '-' : parseFloat(c[data.name]*100/" + parseInt(tolCount) + ").toFixed(" + parseInt(decimal) + ")+'%');}"
              : "function(data){let" +
              " c; eval('c =' +JSON.stringify(" + JSON.stringify(colsData) + "));return (isNaN(data.value) ? '-' : parseFloat(c[data.name]).toFixed(" + parseInt(decimal) + "));}"
            )
        );
      if(formatter != "")
        this.$set(this.vscompt.comptAttrs.extendSetting, `series.${idx}.label.normal.formatter`, eval('('+formatter+')'));
    },
    isLinkageCondi(areaName){
      let areaExist = false;
      let columns = (this.vscompt.comptData || {}).columns || [];
      let rows = (this.vscompt.comptData || {}).rows || [];
      for(var i=0;i<rows.length;i++){
        if(areaName == rows[i][columns[0]]){
          areaExist = true;
          break;
        }
      }
      //判断地图是否处于被联动状态，如果被联动，点击其他地区不能触发联动
      if(this.vscompt.comptAttrs.linkageCondi != undefined && this.vscompt.comptAttrs.linkageCondi.length >0 && areaExist){
        return true;
      }
      if(this.vscompt.comptAttrs.mainLinkageData != undefined && this.vscompt.comptAttrs.mainLinkageData.length >0 && areaExist){
        return true;
      }
      if(this.vscompt.comptAttrs.pageLinkageData != undefined && this.vscompt.comptAttrs.pageLinkageData.length >0 && areaExist){
        return true;
      }
      return false;
    },
    // 生成度量列表名称
    initVisualTitleList(labelMap) {
      let arr = [];
      for (let index = 0; index < this.yAxis1Data.length; index++) {
        const { nick_name } = this.yAxis1Data[index];
        arr.push(labelMap[nick_name] || nick_name);
      }
      this.visualTitleList = arr;
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
