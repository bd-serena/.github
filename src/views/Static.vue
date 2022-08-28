<template>
  <el-container id="main">
    <el-main
      v-if="pageCache.classTypeId=='1005'"
      id="water-wrap"
      style="padding:0"
      :style="`background-color:${pageCache.bgClor||''};background-image:url(${pageCache.bgImg});background-size:${bgImgSize.width}px ${bgImgSize.height}px`"
    >
      <el-container id="bigscreen-section">
        <div
          class="query-design"
          :style="`width:1920px;height:1080px;transform:scale(${pcRatioW},${pcRatioH}); transform-origin:0 0 0;`"
          v-if="designType==1"
        >
          <bd-draggable-resizable
            v-for="(compt,index) in s_edcuiCompts"
            :ref="'dr'+compt.comptId"
            :w="compt.blockInfo.w"
            :h="compt.blockInfo.h"
            :x="compt.blockInfo.x"
            :y="compt.blockInfo.y"
            :z="compt.blockInfo.z"
            class="designCompt"
            :resizable="false"
            :draggable="false"
            :grid="[1,1]"
            :parent="false"
            :key="compt.comptId"
            :data-id="compt.comptId"
          >
            <div style="width:100%;height:100%;overflow:hidden" :style="setHeaderStyle(compt)">
              <div
                class="compt-title bs-title"
                v-if="isShowName(compt)"
                :style="setFontStyle(compt)"
              >{{compt.comptAttrs.extendSetting['comptName.text']}}</div>
              <div
                :class="{'no-title':isShowName(compt)==false,'has-title':isShowName(compt)==true}"
              >
                <Cell
                  :style="setBgStyle(compt)"
                  :isDesign="true"
                  :vscompt="compt"
                  :id="'main'+compt.orderId"
                  v-loading="compt.comptAttrs.loading"
                ></Cell>
                <div
                  class="compt-nodata-tip"
                  v-show="(compt.type != 'MobileQuery' && compt.comptAttrs.isBindData=='1' && !compt.comptAttrs.isLoadData &&  (compt.comptData == undefined ||  (compt.comptData.rows.length == 0 && compt.comptData.columns.length == 0))) || (compt.type == 'MobileQuery' && compt.comptAttrs.fieldList.length == 0)"
                >
                  <span>{{!!compt.comptAttrs.queryInfo ? compt.comptAttrs.queryInfo : compt.comptAttrs.name + '：请设置维度或度量'}}</span>
                </div>
              </div>
            </div>
          </bd-draggable-resizable>
        </div>
      </el-container>
    </el-main>

    <el-main v-else style="padding:0">
      <el-container>
        <div id="water-wrap" style="width: 100%; height: 100%;">
          <div
            class="query-design pc-design"
            v-if="designType==1"
            :style="`background-color:${pageCache.bgClor||''};background-image:url(${pageCache.bgImg});transform: scale(${scaleRate});`"
            :class="pageCache.classTypeId == '1001002'?'mobile-design':''"
          >
            <div class="prev-page-wrap" @click="toPrevPage" v-show="mobileLinkPages.length>1">
              <i class="el-icon-arrow-left"></i>
              <span>{{prePageName}}</span>
            </div>
            <el-scrollbar
              class="my-scroll-bar"
              style="height:100%;"
              :native="false"
              :noresize="false"
              tag="section"
            >
              <grid-layout
                :layout="layout"
                :col-num="24"
                :row-height="1"
                :is-draggable="false"
                :is-resizable="false"
                :is-mirrored="false"
                :vertical-compact="true"
                :margin="[10, 10]"
                :use-css-transforms="true"
                :autoSize="true"
              >
                <grid-item
                  v-for="(item,index) in s_edcuiCompts"
                  :key="item.comptId"
                  :x="item.blockInfo.x"
                  :y="item.blockInfo.y"
                  :w="item.blockInfo.w"
                  :h="item.blockInfo.h"
                  :i="item.comptId"
                >
                  <div style="height:100%;overflow:hidden" :style="setHeaderStyle(item)">
                    <div
                      class="compt-title"
                      v-if="isShowName(item)"
                      :style="setFontStyle(item)"
                      style="border-bottom: 1px solid #DCDFE6;"
                    >{{item.comptAttrs.extendSetting['comptName.text']}}</div>
                    <div
                      :class="{'no-title':isShowName(item)==false,'has-title':isShowName(item)==true}"
                    >
                      <Cell
                        :style="setBgStyle(item)"
                        :isDesign="true"
                        :vscompt="item"
                        :id="'main'+item.orderId"
                        v-loading="item.comptAttrs.loading"
                      ></Cell>
                      <div
                        class="compt-nodata-tip"
                        v-show="item.comptAttrs.isBindData=='1' && !item.comptAttrs.isLoadData"
                      >
                        <span>{{!!item.comptAttrs.queryInfo ? item.comptAttrs.queryInfo : item.comptAttrs.name + '：请设置维度或度量'}}</span>
                      </div>
                    </div>
                  </div>
                </grid-item>
              </grid-layout>
            </el-scrollbar>
          </div>
        </div>
      </el-container>
    </el-main>

    <ExportForm></ExportForm>
    <summarizeDialog></summarizeDialog>
    <ListImportDialog></ListImportDialog>
    <PCDialog v-if="PCDialogVisible"></PCDialog>
  </el-container>
  <!-- 即席查询 -->
</template>
<script>
import Cell from "../components/design/Cell.vue";
import BdDraggableResizable from "bd-draggable-resizable";
import VueGridLayout from "vue-grid-layout";
import { mapState, mapGetters, mapActions, mapMutations } from "vuex";
import ExportForm from "../components/design/ExportForm.vue";
import SummarizeDialog from "../components/design/SummarizeDialog.vue";
import ListImportDialog from "../components/design/ListImport.vue";
import {
  dealDataSetInfo,
  handlePageList,
  objDeepCopy,
  setCondiToCompt,
  setWhereBeantimeOffset,
  mapDataSetInfoKey
} from "../utils/comonFunc.js";
import PCDialog from "../components/design/PCDialog.vue";
import { animateEffect1, animateEffect2 } from "../utils/BgAnimate.js";
import ComptMixins from "../utils/comptMixins";
export default {
  components: {
    Cell,
    BdDraggableResizable,
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    ExportForm,
    SummarizeDialog,
    ListImportDialog,
    PCDialog,
  },
  props: {
    capture: {
      type: Boolean,
      default: false,
    },
  },
  mixins: [ComptMixins],
  data() {
    return {
      codeSrc: "",
      scaleRate: null,
      pcRatioW: 1,
      pcRatioH: 1,
      bgImgSize: {},
      fieldTypeList: {}, //数据库字段类型
    };
  },
  methods: {
    isShowName(compt) {
      let result;
      let setting = compt.comptAttrs.extendSetting;
      if (setting == null) {
        result = false;
      } else {
        if (setting["comptName.show"] == true) {
          result = true;
        } else {
          result = false;
        }
      }
      return result;
    },
    getStaticData(comptId) {
      let data = comptData[comptId];
      return data;
    },
    queryDSDetailList(afIds) {
      var _this = this;
      this.upIsDSMapReady(false);
      _this.queryDbColConf({}).then((response) => {
        if (response.status == 200 && response.data.respResult == "1") {
          _this.fieldTypeList = response.data.respData || {};
          _this.queryDateFormatList({}).then((response) => {
            if (response.status == 200 && response.data.respResult == "1") {
              _this.formatList = response.data.respData || [];
              this.queryDatasetDetailList(afIds)
                .then(function (response) {
                  if (response.data.respResult == 1) {
                    let dsArr = response.data.respData;
                    if (dsArr.length > 0) {
                      for (let index = 0; index < dsArr.length; index++) {
                        const respData = mapDataSetInfoKey(dsArr[index]);
                        const data = respData.anly_frame_elements || [];
                        // 要用$set，不然组件监测不到数据更新，构造xaxisdata这些不会即时刷新
                        _this.$set(
                          _this.datasetMap,
                          respData.af_id,
                          dealDataSetInfo(
                            data,
                            "",
                            "",
                            _this.fieldTypeList,
                            _this.formatList
                          )
                        );
                      }
                      _this.upIsDSMapReady(true);
                    } else {
                      _this.$message.error("字段加载失败");
                    }
                  }
                })
                .catch(function (error) {
                  console.error(error);
                  // _this.$message.error("字段加载失败");
                });
            } else {
              _this.formatList = [];
              _this.$message.error("日期源格式查询失败");
            }
          });
        } else {
          _this.fieldTypeList = {};
          _this.$message.error("数据库字段类型查询失败");
        }
      });
    },
    ...mapActions({
      queryPageCompts: "PageDesign/queryPageCompts",
      setPageCache: "HomeBody/setPageCache",
      queryDatasetDetailList: "AnalyReportAttr/queryDatasetDetailList",
      qryPageDetailsByVerNo: "PageDesign/qryPageDetailsByVerNo",
      setPageQueryParams: "PageDesign/setPageQueryParams",
      queryDbColConf: "DataSetDesign/queryDbColConf", //查询数据集信息
      queryDateFormatList: "DataSetDesign/queryDateFormatList", //日期源格式查询
    }),
    ...mapMutations({
      setQueryHistory: "PageDesign/setQueryHistory",
      upFilterData: "QueryTable/upFilterData",
      setSedcuiCompts: "PageDesign/setSedcuiCompts",
      upIsDSMapReady: "AnalyReportAttr/upIsDSMapReady",
      upDatasetMap: "AnalyReportAttr/upDatasetMap"
    }),
    setMobileScale() {
      if (
        this.pageCache.classTypeId == "1001002" &&
        window.innerHeight < this.MOBILE_HEIGHT + 50
      ) {
        //667+50头+20
        this.scaleRate = window.innerHeight / (this.MOBILE_HEIGHT + 70);
      } else {
        this.scaleRate = null;
      }
    },
    toPrevPage() {
      this.mobileLinkPages.pop();
      let curPage = this.mobileLinkPages[this.mobileLinkPages.length - 1];
      this.setSedcuiCompts(objDeepCopy(curPage.s_edcuiCompts));
    },
    async activatedCode() {
      let flag = this.pageCache.classTypeId == "1001002" ? true : false;

      this.setSedcuiCompts([]); //清空上次预览的数据
      let pageInfo = {};
      let pageList;
      // 如果是下钻页面预览，有pageLinkCondis，则直接从首次预览查出的列表中筛选
      const oriPageLinkCondis = sessionStorage.getItem("pageLinkCondis");
      if (oriPageLinkCondis) {
        let ap = await localforage.getItem('allPagesInfo');
        let allPagesInfo = JSON.parse(ap);
        pageList = allPagesInfo;
        allPagesInfo.forEach((data) => {
          if (oriPageLinkCondis.indexOf(data.pageId) > -1) {
            pageInfo = data;
          }
        });
      } else {
        pageInfo = pageData[0];
        pageList = pageData;
      }
      pageInfo.bgImg = (pageInfo.pageSetting || {}).bgImg || "";
      pageInfo.bgImageName = (pageInfo.pageSetting || {}).bgImageName || "";
      pageInfo.bgEffects = (pageInfo.pageSetting || {}).specEffect || "";
      if (pageInfo.bgEffects != "")
        pageInfo.bgEffects = parseInt(pageInfo.bgEffects) || 0;
      pageInfo.operation = this.pageCache.operation;
      pageInfo["classTypeId"] = this.pageCache.classTypeId;
      let pageInfoSimple = objDeepCopy(pageInfo);
      delete pageInfoSimple.pageDetails;
      this.setPageCache(pageInfoSimple);
      if (this.pageCache.isWatermark == 1) {
        this.$Watermark.set("water-wrap", 60, 20, -40, 0, flag);
      }
      let list = pageInfo.pageDetails;
      // 取回上一个页面传过来的条件
      let plc = sessionStorage.getItem('pageLinkCondis');
      let pageLinkCondis = JSON.parse(plc || "{}");
      let curPageCondi = pageLinkCondis[pageInfo.pageId] || [];
      let afIds = [];
      let compts = [];
      if (list.length > 0) {
        list.forEach(function (detail) {
          let comp = {};
          comp.pageId = detail.pageId;
          comp.afId = detail.afId || "";
          comp.blockInfo = JSON.parse(detail.blockInfo);
          comp.comptAttrs = JSON.parse(detail.compAttrs);
          comp.comptId = detail.elementId;
          comp.orderId = detail.orderId;
          comp.type = detail.compType;
          comp.styleAttrs = JSON.parse(detail.styleAttrs);
          compts.push(comp);
        });
        this.setSedcuiCompts(compts);
        if (curPageCondi.length > 0) {
          //回填前一页面的链接条件
          for (const comp of this.flatCompt) {
            let otherPageCondi = setCondiToCompt(comp, curPageCondi);
            comp.comptAttrs["otherPageCondi"] = objDeepCopy(otherPageCondi);
          }
          // 设置从上一页面传过来的参数
          this.setPageQueryParams();
        }
      }
      // 缓存所有包括下钻页面信息
      await localforage.setItem("allPagesInfo", JSON.stringify(pageList));
      // 保存外部参数
      if (pageList.length > 0) {
        let pageOutParams = pageList[0].pageSetting.pageParams || "[]";
        sessionStorage.setItem("pageOutParams", pageOutParams);
      }

      if (pageList.length > 1) {
        let res = handlePageList(
          pageList,
          this.pageCache.classTypeId,
          this.pageCache.operation
        );
        res.pages.leg = pageList.length;
        this.$store.commit("PageDesign/setPageListAndScompts", res.pages || []);
      } else {
        if (list.length > 0) {
          for (let comp of compts) {
            setWhereBeantimeOffset(comp);
          }
          // this.setSedcuiCompts(compts);
        }
      }
      afIds = this.comptAfIds;
      //模板预览不匹配数据集
      if (afIds.length > 0 && this.pageCache.operation != "templateview") {
          this.flatCompt.forEach(val=>{
            // let id = val.comptId;
            // let data = this.getStaticData(id);
            // if(data){
            //   if(val.type === 'CrossTable'){
            //     let {columns,rows,oriComptData} = data;
            //     val.comptData = {columns,rows};
            //     val.oriComptData = oriComptData;
            //   } else {
            //     val.comptData = data;
            //   }
            // }
          })
      
        // this.queryDSDetailList({ af_id_list: afIds });
      }

      if (this.pageCache.isWatermark == 1) {
        this.$Watermark.set("water-wrap", 60, 20, -40, 0, flag);
      }
    },
  },
  computed: {
    ...mapState({
      s_edcuiCompts: (state) => state.PageDesign.s_edcuiCompts,
      designType: (state) => state.PageDesign.designType,
      pageCache: (state) => state.HomeBody.pageCache,
      tempEdcCompts: (state) => state.PageDesign.tempEdcCompts,
      dimList: (state) => state.QueryTable.dimList,
      msuList: (state) => state.QueryTable.msuList,
      menuClassTypeId: (state) => state.HomeTree.menuClassTypeId,
      mobileLinkPages: (state) => state.PageDesign.mobileLinkPages,
      datasetMap: (state) => state.AnalyReportAttr.datasetMap,
      PCDialogVisible: (state) => state.PageDesign.PCDialogVisible,
    }),
    ...mapGetters({
      layout: "PageDesign/getLayout",
      comptAfIds: "PageDesign/getComptAfIds",
      flatCompt: "PageDesign/getFlatCompt",
      getPageParams: "PageDesign/getPageParams",
    }),
    ifMobilePreview() {
      //只有列表的预览可以看到二维码，设计页面出来的预览看不到
      /**
       *  &&
        (this.pageCache.operation == "preview" ||
          (this.pageCache.operation == "wait" &&
            this.pageCache.pageId != undefined))
       */
      return (
        this.pageCache.operation == "preview" &&
        this.pageCache.classTypeId == "1001002"
      );
    },
    prePageName() {
      if (this.mobileLinkPages.length > 1) {
        return this.mobileLinkPages[this.mobileLinkPages.length - 2].pageInfo
          .pageName;
      } else {
        return "";
      }
    },
    bgEffects() {
      return this.pageCache.bgEffects;
    },
  },
  created() {
    let pageInfo = objDeepCopy(pageData[0]);
    delete pageInfo.pageDetails;
    pageInfo.operation = 'preview'
    this.setPageCache(pageInfo);
    let dsData = {type:'reset'};
    dsData.data = datasetMap;
    this.upDatasetMap(dsData);
  },
  activated() {
    this.activatedCode();
  },
  watch: {
    bgEffects: {
      handler(value) {
        this.$nextTick(() => {
          let waterWrap = document.getElementById("water-wrap");
          let newCanvas = document.createElement("canvas");
          if (waterWrap.querySelector(".canvasWrap")) {
            waterWrap.removeChild(waterWrap.querySelector(".canvasWrap"));
          }
          if (this.pageCache.bgEffects != 0) {
            waterWrap.insertBefore(newCanvas, waterWrap.childNodes[0]);
            newCanvas.setAttribute("id", "bgEffects");
            newCanvas.setAttribute("class", "canvasWrap");
            let canvas = document.getElementById("bgEffects");
            switch (value) {
              case 1:
                animateEffect1(canvas);
                break;
              case 2:
                animateEffect2(canvas);
                break;
            }
          }
        });
      },
    },
  },
  mounted() {
    this.$Watermark.unset("water-wrap");
    let pageInfo = this.pageCache;
    if (pageInfo.pageType == "2") {
      //预览弹窗模式
      let main = document.getElementById("main");
      main.style.margin = "0 auto";
      main.style.width = pageInfo.width + "px";
      main.style.height = pageInfo.height + "px";
      main.style.border = "1px solid #ccc";
      main.style.boxShadow = "7px 7px 15px #ccc";
    }
    document.title = pageInfo.pageName;

    if (pageInfo.classTypeId == "1001002") {
      this.setMobileScale();
      window.onresize = () => {
        this.setMobileScale();
      };
    } else if (pageInfo.classTypeId == "1005") {
      var _w = window.innerWidth;
      var _h = window.innerHeight;
      if (pageInfo.pageType == "2") {
        //预览弹窗模式
        _w = pageInfo.width;
        _h = pageInfo.height;
      }
      this.pcRatioW = _w / 1920;
      this.pcRatioH = _h / 1080;
      this.bgImgSize.width = _w;
      this.bgImgSize.height = _h;
      document.getElementsByTagName("body")[0].setAttribute("class", "bigscreen-body-wrap");
      document.body.style.height = "auto";
      document.body.style.overflow = "hidden";
      window.onresize = function () {
        // 如果直接使用this,this指向的不是vue实例
        let _w = window.innerWidth;
        let _h = window.innerHeight;
        let ratioW = _w / 1920;
        let ratioH = _h / 1080;
        document.querySelector(
          ".query-design"
        ).style.transform = `scale(${ratioW},${ratioH})`;
        document.querySelector(
          ".el-main"
        ).style.backgroundSize = `${_w}px ${_h}px`;
      };
    }
  },
};
</script>
<style lang="scss" scoped>
$header-main-clr: #0a2b4c; // 头部背景色
$main-bg: #aaaaaa; // 设计区域背景色
$main-bg1: #fff; // 设计区域内层背景
$font-clr1: #fff; // 文字颜色1
$border-clr1: #0e3b67; // 输入框边框色
$input-bg-clr1: #0e3b67; // 输入框背景色
$font-clr2: #3f678d; // 输入框字体颜色
$border1: #afc0d0; // 边框色1
$main-color: #409eff; //主色调
.el-header {
  &.design-page {
    height: 50px !important;
    line-height: 50px;
    background-color: $header-main-clr;
    .page-name {
      width: 230px;
      /deep/.el-input__inner {
        border-color: $border-clr1;
        background-color: $border-clr1;
        color: $font-clr1;
        &::-webkit-input-placeholder {
          color: $font-clr2;
        }
      }
    }
  }
}
.head-left {
  float: left;
  .to-main {
    color: $font-clr1;
    cursor: pointer;
    margin-right: 26px;
  }
}

.el-main {
  background-repeat: no-repeat;
  background-position: 0 0;
  background-size: 100% 100%;
  background-color: $main-bg;
  overflow: hidden;
  .query-design {
    width: 100%;
    height: 100%;
    position: relative;
    background-repeat: no-repeat;
    background-position: center center;
    background-size: 100% 100%;
    &.mobile-design {
      position: absolute;
      width: 375px !important;
      height: 667px !important;
      top: 50%;
      margin-top: -333.5px;
      left: 50%;
      margin-left: -187px;
    }
  }
  .pc-design {
    background-color: #fff;
  }
}

.head-opt-btn {
  float: right;
  color: $font-clr1;
  font-size: 16px;
  i {
    margin-left: 26px;
    cursor: pointer;
  }
}

.header-compts {
  transform: translate(-20%, -20%) scale(0.6);
}
.header-compts > div {
  display: block;
  // float: left;
  width: 200px;
  height: 120px;
  border: 1px dashed red;
  overflow: hidden;
  margin-left: 65px;
}
#opt-box {
  .vdr {
    border: none;
  }
}
.query-layout {
  padding: 20px;
}
.query-grid:first-child {
  position: relative;
  min-height: 70px;
  padding-top: 18px;
  /deep/.el-form-item__content {
    z-index: 100;
  }
  /deep/.el-button {
    z-index: 100;
  }
}
.query-grid:last-child {
  min-height: 475px;
  margin-top: 20px;
}

/deep/.vue-grid-item {
  z-index: 999;
  border: none !important;
  &.active {
    border: none !important;
  }

  &:hover {
    box-shadow: none !important;
  }
}

/deep/.block-menu {
  display: none;
}

.compt-nodata-tip {
  position: absolute;
  top: 0;
  left: 0px;
  right: 0px;
  color: #ccc;
  font-size: 12px;
  background: #fff;
  height: 100%;
  text-align: center;
  span {
    font-size: 20px;
    display: block;
    position: relative;
    top: 50%;
    transform: translateY(-50%);
  }
}
.compt-title {
  color: #333;
  font-size: 16px;
  padding-top: 3px;
  padding-left: 20px;
  padding-bottom: 3px;
  text-align: left;
  position: relative;
  &::before {
    content: "";
    width: 4px;
    height: 65%;
    position: absolute;
    top: 20%;
    left: 5px;
    background: #409eff;
    border-radius: 20px;
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
.prev-page-wrap {
  position: absolute;
  top: 0;
  left: 0;
  font-size: 14px;
  cursor: pointer;
  z-index: 100000;
  &:hover {
    color: #409cfb;
  }
}
.vdr {
  border: none !important;
}
/deep/.el-scrollbar__wrap {
  overflow-x: hidden;
}
</style>
<style>
.canvasWrap {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
