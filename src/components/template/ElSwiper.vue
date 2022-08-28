<template>
  <div style="width:100%;height:100%;position:relative;" ref="wrap" class="swiper-outer-wrap">
    <!--     @mouseenter="stopAutoplay"
    @mouseleave="startAutoplay"-->
    <swiper
      :options="swiperOption"
      ref="mySwiper"
      style="height: 100%;height:100%"
      v-if="swiperDatas.length>0"
      :key="swiperKey"
      @mouseenter.native="stopAutoplay"
      @mouseleave.native="startAutoplay"
    >
      <swiper-slide
        v-for="(item,index) in swiperDatas"
        :key="Math.random()*index"
        :style="{height:sliderItemH+'px'}"
      >
        <div class="carl-item-wrap" :style="{'background-image':swiperBg }">
          <div
            class="carl-row-item"
            :style="{height:swiperItemStyle.firRowLH+'px','line-height':swiperItemStyle.firRowLH+'px'}"
          >
            <span :style="swiperItemStyle.dimVal1" :title="item.dimVal1">{{item.dimVal1}}</span>
            <span :style="swiperItemStyle.measureVal" :title="item.measureVal">{{item.measureVal}}</span>
          </div>
          <div
            class="carl-row-item"
            :style="{height:swiperItemStyle.secRowLH+'px','line-height':swiperItemStyle.secRowLH+'px'}"
          >
            <span :style="swiperItemStyle.dimVal2" :title="item.dimVal2">{{item.dimVal2}}</span>
            <span
              :style="{'font-size':swiperItemStyle.dimVal2.fontSize,'color':swiperItemStyle.measureVal.color}"
              :title="item.measureTitle"
            >{{item.measureTitle}}</span>
          </div>
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>
<script>
import { mapState, mapGetters, mapActions } from "vuex";
import {
  addPageCondis,
  constructList,
  getLinkRequestParam,
  getRequestParam,
  dataInterval,
  formatNumber,
  loadDataDone,
  loadDataError
} from "../../utils/comonFunc.js";
import DomSize from "@/utils/domSize.js";
export default {
  props: ["vscompt"],
  data() {
    return {
      swiperOption: {
        slidesPerView: "auto",
        direction: "vertical",
        spaceBetween: 0,
        loop: true,
        loopAdditionalSlides: 1,
        notNextTick: true,
        speed: 3000,
        watchOverflow: true, //当没有足够的slide切换时，例如只有1个slide（非loop），swiper会失效且隐藏导航等。默认不开启这个功能。
        autoplay: {
          autoplay: true,
          delay: 0,
          stopOnLastSlide: false,
          disableOnInteraction: false
        },
        observer: true, //修改swiper自己或子元素时，自动初始化swiper
        observeParents: true, //修改swiper的父元素时，自动初始化swiper
        autoHeight: true,
        preventClicks: false, //当swiper在触摸时阻止默认事件（preventDefault），用于防止触摸时触发链接跳转。
        preventClicksPropagation: false, //阻止click冒泡。拖动Swiper时阻止click事件。
        allowTouchMove: false
      },
      swiperKey: 0,
      sliderItemH: 80
    };
  },
  computed: {
    ...mapState({
      pageCache: state => state.HomeBody.pageCache,
      isDSMapReady: state => state.AnalyReportAttr.isDSMapReady,
      datasetMap: state => state.AnalyReportAttr.datasetMap,
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
    swiperDatas() {
      this.swiperKey++;
      let newData = [];
      if (
        this.vscompt.afId != "" &&
        this.vscompt.comptData &&
        this.vscompt.comptData.columns &&
        this.vscompt.comptData.columns.length > 0 &&
        this.vscompt.comptData.rows
      ) {
        let comptData = this.vscompt.comptData;
        let columns = comptData.columns || [],
          colCount = columns.length;
        let colFormatSet = (this.vscompt.comptAttrs.colSetting || {})[
          this.vscompt.comptAttrs.yAxis1Data[0].element_id
        ] || { dot: "0", numType: "0" };
        for (let index = 0; index < (comptData.rows || []).length; index++) {
          const element = comptData.rows[index];
          let measureTit = columns[colCount - 1];
          let oriVal = element[measureTit];

          let meaVal = oriVal;
          if (!isNaN(parseFloat(oriVal))) {
            if (colFormatSet.numType == 1) {
              meaVal =
                formatNumber(oriVal, colFormatSet.dot) ||
                parseFloat(oriVal).toFixed(parseInt(colFormatSet.dot || "0"));
            } else if (colFormatSet.numType == 2) {
              let dot = parseInt(colFormatSet.dot + "" || "0");
              meaVal = parseFloat(parseFloat((oriVal + "").replace(/%/gi, ""))*100).toFixed(dot) +
                "%";
            } else {
              meaVal = formatNumber(oriVal);
            }
          }

          let rowItem = {
            dimVal1: element[columns[0]],
            dimVal2: colCount > 2 ? element[columns[1]] : "",
            measureTitle: colFormatSet.nickName || measureTit,
            measureVal: meaVal
          };
          newData.push(rowItem);
        }
      } else if (
        this.vscompt.afId == "" ||
        this.pageCache.operation == "templateview"
      ) {
        newData = this.vscompt.comptData.rows;
      }
      return newData;
    },
    swiperItemStyle() {
      // 度量名称先用维度2的名称字体大小
      let style = {
        dimVal1: {
          fontSize: "22px",
          color: "#606266"
        },
        dimVal2: {
          fontSize: "12px",
          color: "#666"
        },
        measureVal: {
          fontSize: "22px",
          color: "#21bdff"
        },
        firRowLH: 34, //第一行行高
        secRowLH: 26 //第二行行高
      };
      let comptAttrs1 = this.vscompt.comptAttrs;
      if (this.vscompt.afId != "") {
        let colSetting = this.vscompt.comptAttrs.colSetting || {},
          attrNameAttr = ["dimVal1", "dimVal2"];
        for (let index = 0; index < comptAttrs1.xAxisData.length; index++) {
          const element = comptAttrs1.xAxisData[index];
          let colSet1 = colSetting[element.element_id];
          if (colSet1) {
            style[attrNameAttr[index]].fontSize = colSet1.fontSize + "px";
            style[attrNameAttr[index]].color = colSet1.color;
          }
        }
        let measureSet1 = colSetting[comptAttrs1.yAxis1Data[0].element_id];
        if (comptAttrs1.yAxis1Data.length > 0 && measureSet1) {
          style.measureVal.fontSize = measureSet1.fontSize + "px";
          style.measureVal.color = measureSet1.color;
        }
        let dimHeight1 = this.getNumStr(style.dimVal1.fontSize);
        let dimHeight2 = this.getNumStr(style.dimVal2.fontSize);
        let measureHeight = this.getNumStr(style.measureVal.fontSize);
        const baseH = 12;

        style.firRowLH = Math.max(dimHeight1, measureHeight) + baseH;
        style.secRowLH = dimHeight2 + baseH;
        this.sliderItemH = style.firRowLH + style.secRowLH + 20;
        setTimeout(() => {
          this.swiperKey++;
        }, 0);
      }
      return style;
    },
    swiperBg() {
      let extSet = this.vscompt.comptAttrs.extendSetting;
      let itemBgColor1 = extSet.itemBgColor1 || "rgba(28, 102, 165, 0.2)";
      let itemBgColor2 = extSet.itemBgColor2 || "rgba(28, 102, 165, 0.7)";
      let bg = `linear-gradient(${itemBgColor1},${itemBgColor2})`;
      setTimeout(() => {
        this.swiperKey++;
      }, 0);
      return bg;
    }
  },
  mounted() {
    if (this.vscompt.afId == "" && this.vscompt.comptData == undefined) {
      this.$set(this.vscompt, "comptData", {
        columns: [],
        rows: []
      });
    }
    let _this = this;
    DomSize.bind(this.$refs.wrap, function() {
      _this.swiperKey++;
      _this.updateSwiperState(parseInt(this.style.height));
    });

    // this.$refs.mySwiper.$el.onmouseover = function() {
    //   //鼠标放上暂停轮播
    //   this.$refs.mySwiper.autoplay.stop();
    // };
    // this.$refs.mySwiper.$el.onmouseleave = function() {
    //   this.$refs.mySwiper.autoplay.start();
    // };
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
    "vscompt.comptAttrs.extendSetting.pageSize": {
      // deep: true,
      handler(newVal, oldVal) {
        this.queryData();
      }
    },
    "vscompt.comptAttrs.extendSetting.duration": {
      // deep: true,
      handler(newVal, oldVal) {
        this.swiperKey++;
        this.$set(this.swiperOption, "speed", (parseInt(newVal) || 3) * 1000);
        // this.$set(
        //   this.swiperOption.autoplay,
        //   "delay",
        //   (parseInt(newVal) || 3) * 1000
        // );
      }
    },
    swiperDatas: {
      deep: true,
      handler(newVal, oldVal) {
        this.updateSwiperState();
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
  methods: {
    ...mapActions({
      queryComptData: "QueryTable/queryComptData",
      setLinkageCondi: "PageDesign/setLinkageCondi"
    }),
    queryData(param) {
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
      params.afQueryBean.head_bean.pageCount = this.vscompt.comptAttrs.extendSetting.pageSize;
      params.afQueryBean.head_bean.start = 1;
      params.afQueryBean.is_need_paging = 1;
      params.afQueryBean.select_list = (
        params.afQueryBean.select_list || []
      ).filter(item => {
        return item.nick_name.indexOf("XXXXCODE") == -1;
      });
      let computedData = this.vscompt.comptAttrs.computedData||[];
      this.queryComptData({ params, computedData })
        .then(function(response) {
          if (response.data.respResult == 1) {
            let comptData = response.data.respData;
            if (comptData.rows == null || comptData.rows == undefined) {
              comptData.rows = [];
            }
            if (comptData.columns == null || comptData.columns == undefined) {
              comptData.columns = [];
            }
            _this.$set(_this.vscompt, "comptData", comptData);
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
    // autoplay和loop在列表总条数高度比面板高度小的时候要关掉
    updateSwiperState(outerHeight) {
      let comptRows = this.vscompt.comptData.rows;
      let wrapH = 0;
      if (outerHeight) {
        wrapH = outerHeight;
      }
      let swiper = null;
      if (this.$refs.mySwiper && this.$refs.mySwiper.swiper) {
        swiper = this.$refs.mySwiper.swiper;
      }

      if (this.$refs.wrap && this.$refs.wrap.clientHeight) {
        wrapH = this.$refs.wrap.clientHeight;
      }
      if (wrapH && swiper) {
        if (this.sliderItemH * comptRows.length <= wrapH) {
          this.$set(this.swiperOption, "loop", false);
          this.$set(this.swiperOption.autoplay, "autoplay", false);
        } else {
          this.$set(this.swiperOption, "loop", true);
          this.$set(this.swiperOption.autoplay, "autoplay", true);
        }
        swiper.update(true);
      }
    },
    // 根据带单位字符串获取数值，eg:getNumStr("10px","px") 获取数值
    getNumStr(oriStr, unit = "px") {
      return parseFloat(
        (oriStr || "").substring(0, oriStr.indexOf(unit)) || "0"
      );
    },
    startAutoplay() {
      let swiperObj =
        this.$refs.mySwiper && this.$refs.mySwiper.swiper
          ? this.$refs.mySwiper.swiper
          : null;
      if (swiperObj && swiperObj.autoplay) {
        swiperObj.autoplay.start();
      }
    },
    stopAutoplay() {
      let swiperObj =
        this.$refs.mySwiper && this.$refs.mySwiper.swiper
          ? this.$refs.mySwiper.swiper
          : null;
      if (swiperObj && swiperObj.autoplay) {
        swiperObj.autoplay.stop();
      }
    }
  }
};
</script>
<style scoped lang="scss">
$border1: #afc0d0; // 边框色1
$main-color: #409eff; //主色调
.has-compt,
.no-compt {
  height: 100%;
  .msg-tip {
    display: block;
    text-align: center;
    font-size: 20px;
    color: #ccc;
    position: relative;
    top: 50%;
    transform: translateY(-50%);
  }
}

.no-title {
  height: 100%;
}
.has-title {
  height: 100%;
  margin-top: -30px;
  padding-top: 30px;
}
.block-menu {
  position: absolute;
  top: 0;
  right: 5px;
  cursor: pointer;
  color: #409cfb;
  width: 6px;
  height: 20px;
  padding: 0 5px;
  .el-dropdown-link {
    display: block;
    word-break: break-word;
    line-height: 5px;
  }
}
/deep/.swiper-slide {
  height: 66px;
  .carl-item-wrap {
    width: 100%;
    height: 100%;
    padding: 10px 20px;
    // background-image: linear-gradient(
    //   rgba(28, 102, 165, 0.4),
    //   rgba(56, 169, 255, 0.4)
    // );
    .carl-row-item {
      width: 100%;
      display: flex;
      align-items: center;
      span {
        width: 50%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        word-break: break-all;
        text-align: left;
      }
      span:last-child {
        width: calc(50% - 8px);
        margin: 0 8px 0 auto;
        text-align: right;
      }
    }
  }
}
</style>
