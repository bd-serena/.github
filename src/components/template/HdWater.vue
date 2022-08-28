<template>
  <div class="waterBlock"
    style="height:100%;width:100%;padding:10px;"
    v-bind="vscompt.comptAttrs.extendSetting"
    @click="clickHandle">
    <div class="water-title">
      <div class="water-text"
        :style="{'font-size': vscompt.comptAttrs.extendSetting.fontSize+'px','color': vscompt.comptAttrs.extendSetting.fontColor}">{{this.reName}}</div>
      <div class="water-num"
        :style="{'font-size': vscompt.comptAttrs.extendSetting.numFontSize+'px','color': vscompt.comptAttrs.extendSetting.numFontColor}">{{this.value}}</div>
    </div>
    <div class="canvas-wrap"
      :style="{border:'2px solid '+vscompt.comptAttrs.extendSetting.waterColor}">
      <canvas class="waterCanvas"
        :id="'canvas-'+vscompt.comptId"
        style="position:absolute;top:0px;left:0px;z-index:1;"></canvas>
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
  loadDataError
} from "../../utils/comonFunc.js";
export default {
  props: ["vscompt"],
  data() {
    return {
      value: "",
      reName: "",
      usingRate: 40,

      waveCount: '',//要显示的波浪个数
      //波长，即两波峰(波谷)之间的距离
      waveLen: '',
      //半波长
      halfWaveLen: '',
      //四风之一波长
      quarterWaveLen: '',
      //水平位移步长
      stepX: 1,
      //当前波浪起始点X坐标
      startX: '',
      //当前水平面高度
      waterHeight: 0,
      //当前X坐标
      currentX: '',
      //波峰
      peakY: '',
      //波谷
      troughY: '',
      color: 'rgba(0,222,255, 0.2)',//绘制颜色
      canvas: '',
      ctx: "",
      timeout: ''
    };
  },
  mounted() {
    this.startX = -1 * this.waveLen
    // this.initWaterHeight = this.waterHeight
    this.loop();
    let name = this.vscompt.comptAttrs.extendSetting['comptName.text'];
    this.vscompt.styleAttrs[0].children[0].value = name;
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
          this.loop()
          this.reName = this.vscompt.comptData.columns[0]
          this.value = this.vscompt.comptData.rows[0][this.reName]

          if (this.value !== "") {
            if (this.value.toString().indexOf('%') > -1) {
              if (this.value.replace('%', '') > 100) {
                this.value = 100 + '%'
              }
            } else if (this.value < 1) {
              this.value = (this.value * 100).toFixed(2) + '%'
            } else if (this.value >= 1) {
              this.value = 100 + '%'
            }
            if (this.value.toString().replace('%', '') <= 0) {
              this.value = "0"
            }
          } else {
            this.value = "0"
          }

          if (oldVal != undefined && newVal.columns[0] != oldVal.columns[0] && oldVal.columns[0] != undefined) {
            this.vscompt.comptAttrs.extendSetting['rename'] = ""
            if (this.vscompt.styleAttrs[0].children[3]) {
            this.vscompt.styleAttrs[0].children[3].value = ""
            }
            // this.vscompt.styleAttrs[0].children[3].value = ""
          } else {
            this.reName = this.vscompt.comptAttrs.extendSetting['rename'] || this.reName;
          }
        }
      }
    },
    "vscompt.comptAttrs.extendSetting.rename": {
      deep: true,
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal == "") {
          this.reName = this.vscompt.comptData.columns[0]
          return;
        } else {
          this.reName = newVal
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
      gotoPage: "PageDesign/gotoPage",
      openChildPage: "PageDesign/openChildPage"
    }),
    //渲染
    render() {
      if (this.waterHeight === this.canvas.height) {
        return
      }
      let ctx = this.ctx
      try {
        ctx.globalCompositeOperation = "source-over";
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = this.vscompt.comptAttrs.extendSetting.waterColor//this.color;
        ctx.beginPath();
        ctx.moveTo(this.currentX, this.waterHeight);
        for (var i = 0; i < this.waveCount + 1; i++ , this.currentX += this.waveLen) {
          //绘制波谷
          ctx.quadraticCurveTo(this.currentX + this.quarterWaveLen, this.troughY, this.currentX + this.halfWaveLen, this.waterHeight);
          //绘制波峰
          ctx.quadraticCurveTo(this.currentX + this.quarterWaveLen + this.halfWaveLen, this.peakY, this.currentX + this.waveLen, this.waterHeight);
        }
        ctx.lineTo(this.canvas.width, this.canvas.height);
        ctx.lineTo(0, this.canvas.height);
        ctx.closePath();
        ctx.fill();
      } catch (e) { }

    },
    //循环
    loop() {
      if (this.value !== "") {
        this.update();
        this.render();
      }
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        if (this.value !== "") {
          this.loop()
        }
      }, 1000 / 60);
    },
    //更新
    update() {
      this.canvas = document.querySelector(`#canvas-${this.vscompt.comptId}`)
      if (this.canvas === null) {
        return
      }
      this.ctx = this.canvas.getContext("2d");
      this.canvas.width = this.canvas.parentNode.offsetWidth;
      this.canvas.height = this.canvas.parentNode.offsetHeight;

      this.waveCount = this.canvas.width / 100
      this.waveLen = this.canvas.width / this.waveCount

      this.waveHeight = this.canvas.height / 20
      this.halfWaveLen = this.waveLen / 2
      this.quarterWaveLen = this.halfWaveLen / 2
      this.startX += this.stepX;
      this.currentX = this.startX;

      if (this.value !== "") {
        if (this.value.toString().indexOf('%') > -1) {
          this.waterHeight = this.value.replace('%', '')
          if (this.waterHeight > 100) {
            this.waterHeight = 100
          }
        } else if (this.value < 1) {
          this.waterHeight = this.value * 100
        } else if (this.value >= 1) {
          this.waterHeight = 100
        }
        if (this.value <= 0) {
          this.waterHeight = 0
        }
      }
      this.waterHeight = (100 - this.value.replace('%', '')) * this.canvas.height / 100
      this.peakY = this.waterHeight - this.waveHeight;
      this.troughY = this.waterHeight + this.waveHeight;
      if (this.startX >= 0) {
        this.startX = -1 * this.waveLen;
      }
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
          }
        })
        .catch(function (error) {
          // _this.$message.error("数据更新失败");
        })
        .finally(() => {
          _this.vscompt.comptAttrs.loading = false;
        });
    },

    clickHandle(e) {
      let setting = this.vscompt.comptAttrs.extendSetting;
      if (this.pageCache.operation == "design") {
        return;
      }
      if (setting.urlType == "2" && setting.comptUrl) {
        //打开连接地址
        this.gotoPage(setting);
      } else if (setting.linkTabId.length > 0) {
        //打开tab标签
        this.gotoTab(setting);
      } else if (setting.urlType == "1" && setting.pageId) {
        //打开内部页面
        let param = { pageLinkageData: [{}] };
        param.pageLinkageData[0].pageId = setting.pageId;
        param.noParam = true;
        this.openChildPage(param);
      }
    }
  },

};
</script>

<style lang="scss" scoped>
.water-title {
  position: absolute;
  top: 20px;
  left: 10px;
  right: 10px;
  z-index: 2;
}
.water-text,
.water-num {
  text-align: center;
  padding: 5px 10px 0 10px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.canvas-wrap {
  position: relative;
  height: 100%;
  width: 100%;
  border-radius: 15px;
  overflow: hidden;
}
</style>
