<template>
  <el-container id="main" style="position: relative;">
    <div style="position: absolute; bottom: 0;z-index:10; right: 0px;">
      <div
          class="stretch-btn-wrap"
          @click="capturePic"
        >
          <button
            type="button"
            class="stretch-btn-left"
          >
            <i
              class="icon-A10165_upload"
            />
          </button>
          <label class="stretch-text">导出</label>
        </div>
    </div>
    <el-main v-if="pageCache.classTypeId=='1005'" id="water-wrap" style="padding:0" :style="`background-color:${pageCache.bgClor||''};background-image:url(${pageCache.bgImg});background-size:${bgImgSize.width}px ${bgImgSize.height}px`">
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
            <div
              style="width:100%;height:100%;overflow:hidden"
              :style="setHeaderStyle(compt)"
            >
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

    <el-main v-else style="padding:0" :class="{'mobile-preview-wrap':!isPcTeminal}">
      <el-container>
        <div id="water-wrap" style="width: 100%; height: 100%;">
        <div
          class="query-design pc-design"
          v-if="designType==1"
          :style="`background-color:${pageCache.bgClor||''};background-image:url(${pageCache.bgImg});transform: scale(1);padding:${mobileNavBarShow?'56px 0 0':'0px'}`"
          :class="pageCache.classTypeId == '1001002' && (isPcTeminal&&!inFrame)?'mobile-design':''"
        >
          <!-- html2canvas截图时剔除标题头 -->
          <div class="prev-page-wrap" :data-html2canvas-ignore="true">
            <van-nav-bar :title="prePageName" left-arrow @click-left="toPrevPage" v-show="mobileNavBarShow" />
          </div>
          <el-scrollbar
            class="my-scroll-bar preview-scrollbar"
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
              :use-css-transforms="false"
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
                <div
                  style="height:100%;overflow:hidden"
                  :style="setHeaderStyle(item)"
                >
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
    <div v-show="ifMobilePreview" id="qrcode">
      <img style="width:150px;height:150px;" :src="codeSrc" />
    </div>
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
  resetTemplateCompt,
  setWhereBeantimeOffset,
  mapDataSetInfoKey
} from "../utils/comonFunc.js";
import QRCode from "qrcode";
import PCDialog from "../components/design/PCDialog.vue";
import { animateEffect1, animateEffect2 } from "../utils/BgAnimate.js";
import ComptMixins from "../utils/comptMixins";
import html2canvas from 'html2canvas';
import JsPDF from 'jspdf';
// 兼容IE
import "jspdf/dist/polyfills.es.js";
import canvg from 'canvg';
export default {
  components: {
    Cell,
    BdDraggableResizable,
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    ExportForm,
    SummarizeDialog,
    ListImportDialog,
    PCDialog
  },
  props:{
    capture:{
      type:Boolean,
      default:false
    }
  },
  mixins: [ComptMixins],
  data() {
    return {
      codeSrc: "",
      scaleRate: null,
      pcRatioW:1,
      pcRatioH:1,
      bgImgSize:{},
      fieldTypeList: {}, //数据库字段类型
      inFrame: false
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
    queryDSDetailList(afIds) {
      var _this = this;
      this.upIsDSMapReady(false);
      _this
        .queryDbColConf({})
        .then(response => {
          if (response.status == 200 && response.data.respResult == "1") {
            _this.fieldTypeList = response.data.respData || {};
            _this.queryDateFormatList({}).then(response => {
              if (response.status == 200 && response.data.respResult == "1") {
              _this.formatList = response.data.respData || [];
              this.queryDatasetDetailList(afIds)
                .then(function(response) {
                  if (response.data.respResult == 1) {
                    let dsArr = response.data.respData;
                    if (dsArr.length > 0) {
                      for (let index = 0; index < dsArr.length; index++) {
                        const respData = mapDataSetInfoKey(dsArr[index]);
                        const data = respData.anly_frame_elements || [];
                        // 要用$set，不然组件监测不到数据更新，构造xaxisdata这些不会即时刷新
                        _this.$set(_this.datasetMap,respData.af_id,dealDataSetInfo(data,"","",_this.fieldTypeList,_this.formatList))
                      }
                      _this.upIsDSMapReady(true);
                    } else {
                      _this.$GlobalFuncs.openMessageTip({
                        type: 'error',
                        message: '字段加载失败'
                      });
                      // _this.$message.error("字段加载失败");
                    }
                  }
                })
                .catch(function(error) {
                  console.error(error);
                  // _this.$message.error("字段加载失败");
                });
              }else{
                _this.formatList = [];
                _this.$GlobalFuncs.openMessageTip({
                        type: 'error',
                        message: '日期源格式查询失败'
                      });
                // _this.$message.error("日期源格式查询失败");
              }
            });
          }else {
            _this.fieldTypeList = {};
            _this.$GlobalFuncs.openMessageTip({
                        type: 'error',
                        message: '数据库字段类型查询失败'
                      });
            // _this.$message.error("数据库字段类型查询失败");
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
      queryDateFormatList: "DataSetDesign/queryDateFormatList"//日期源格式查询
    }),
    ...mapMutations({
      setQueryHistory: "PageDesign/setQueryHistory",
      upFilterData: "QueryTable/upFilterData",
      setSedcuiCompts: "PageDesign/setSedcuiCompts",
      upIsDSMapReady: "AnalyReportAttr/upIsDSMapReady"
    }),
    generateQRCode() {
      var that = this;
      // "http://10.1.8.6:8089/web/biui-new/html/掌上沙盘/weFrame.html"
      let url1 = `${
        this.$store.state.contextUrl
      }/dist/index.do?verify_code=${window.sessionStorage.getItem(
        "jtt"
      )}&random_seq=${window.sessionStorage.getItem(
        "random_seq"
      )}&is_phone=1&page_id=${
        this.pageCache.pageId
      }&tenant_id=${window.sessionStorage.getItem("tenant_id")}#/index`;
      QRCode.toDataURL(url1)
        .then(url => {
          that.codeSrc = url;
        })
        .catch(err => {
          console.error(err);
        });
    },
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
      // 手机端预览，
      if (!this.isPcTeminal && this.mobileLinkPages.length <= 1) {
        this.$router.go(-1);
        return;
      }
      this.mobileLinkPages.pop();
      let curPage = this.mobileLinkPages[this.mobileLinkPages.length - 1];
      this.setSedcuiCompts(objDeepCopy(curPage.s_edcuiCompts));
      // this.setPageCache(objDeepCopy(curPage.pageInfo));
    },
    templatePreview(){
      let flag = this.pageCache.classTypeId == "1001002" ? true : false;
      if (this.ifMobilePreview) {
        // this.generateQRCode();
      }
      var pageInfo = this.pageCache;
      pageInfo.bgImg = (pageInfo.pageSetting || {}).bgImg || "";
      pageInfo.bgImageName = (pageInfo.pageSetting || {}).bgImageName || "";
      pageInfo.bgEffects = (pageInfo.pageSetting || {}).specEffect || "";
      if (pageInfo.bgEffects != "")
        pageInfo.bgEffects = parseInt(pageInfo.bgEffects) || 0;
      this.setPageCache(pageInfo);
      if (this.pageCache.isWatermark == 1) {
        this.$Watermark.set("water-wrap", 60, 20, -40, 0, flag);
      }
      let list = pageInfo.pageDetails;
      // 取回上一个页面传过来的条件
      let pc = sessionStorage.getItem('pageLinkCondis');
      let pageLinkCondis = JSON.parse(pc || "{}");
      let curPageCondi = pageLinkCondis[pageInfo.pageId] || [];
      // let afIds = [];
      if (list.length > 0) {
        let compts = [];
        list.forEach(function(detail) {
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
            comp.comptAttrs["otherPageCondi"] = objDeepCopy(
              otherPageCondi
            );
          }
          // 设置从上一页面传过来的参数
          this.setPageQueryParams();
        }
      }
      var pageList = [pageInfo];
      let res = handlePageList(pageList, this.pageCache.classTypeId, this.pageCache.operation);
      this.$store.commit(
        "PageDesign/setPageListAndScompts",
        res.pages || []
      );
      // afIds = this.comptAfIds;
      // if (afIds.length > 0) {
      //   this.queryDSDetailList({ af_id_list: afIds });
      // }
    },
    activatedCode(){
      // const comptData = require('@/../public/comptConfig/comptData.json');
      var _this = this;
      let flag = this.pageCache.classTypeId == "1001002" ? true : false;
      if (this.ifMobilePreview) {
        // this.generateQRCode();
      }
      if (this.pageCache != null && (this.pageCache.operation == "preview" || this.pageCache.operation == "templateview")) {
        this.setSedcuiCompts([]);//清空上次预览的数据
        var pageId = this.pageCache.pageId;
        var cid = null;
        if(this.menuClassTypeId == "drive"){  //驾驶舱
          cid = this.pageCache.classTypeId;
        }else{
          cid = this.menuClassTypeId;
        }

        var pageParam = Object.assign({
          objId: pageId,
          createUser: window.sessionStorage.getItem("user_id"),
          classTypeId: cid,
          objType: this.pageCache.classTypeId,
          verNo: this.pageCache.verNo,
          // 手机端数据门户嵌入分析报告页面，加this.isPcTeminal条件限制，不然previewType会变成1，然后页面数据查不回来
          previewType: ((this.menuClassTypeId === 'drive' && this.isPcTeminal) || JSON.stringify(this.$route.query) !== '{}') ? '1' : '0',
          preViewFalg: "1", //1-记录操作日志标志    0-不记录操作日志
          isNeedDemo: this.pageCache.isDemo // 案例
        });
        this.qryPageDetailsByVerNo(pageParam)
          .then(async val => {
            if (val.status == 200 && val.data.respResult == 1) {
              let pageInfo = {};
              let pageList;
              // 手机端预览不要改头上的标题
              if(!this.capture && this.isPcTeminal){
                document.title = val.data.respData[0].pageName;
              }
              // 如果是下钻页面预览，有pageLinkCondis，则直接从首次预览查出的列表中筛选
              // const oriPageLinkCondis = sessionStorage.getItem('pageLinkCondis');
              // if (oriPageLinkCondis) {
              //   let allPagesInfo = [];
              //   let ap = sessionStorage.getItem('allPagesInfo');
              //   allPagesInfo = JSON.parse(ap);
              //   pageList = allPagesInfo;
              //   allPagesInfo.forEach((data) => {
              //     if (oriPageLinkCondis.indexOf(data.pageId) > -1) {
              //       pageInfo = data;
              //     }
              //   })
              // } else {
              //   pageInfo = val.data.respData[0];
              //   pageList = val.data.respData;
              // }
              pageInfo = val.data.respData[0];
              pageList = val.data.respData;
              pageInfo.bgImg = (pageInfo.pageSetting || {}).bgImg || "";
              pageInfo.bgImageName = (pageInfo.pageSetting || {}).bgImageName || "";
              pageInfo.bgEffects = (pageInfo.pageSetting || {}).specEffect || "";
              if (pageInfo.bgEffects != "")
                pageInfo.bgEffects = parseInt(pageInfo.bgEffects) || 0;
              pageInfo.operation = this.pageCache.operation;
              pageInfo["classTypeId"] = this.pageCache.classTypeId;
              this.setPageCache(pageInfo);
              if (this.pageCache.isWatermark == 1) {
                this.$Watermark.set("water-wrap", 60, 20, -40, 0, flag);
              }
              let list = pageInfo.pageDetails;
              // 取回上一个页面传过来的条件
              let pc = sessionStorage.getItem('pageLinkCondis');
              let pageLinkCondis = JSON.parse(pc || "{}");
              let curPageCondi = pageLinkCondis[pageInfo.pageId] || [];
              let afIds = [];
              let compts = [];
              if (list.length > 0) {
                list.forEach(function(detail) {
                  let comp = {};
                  comp.pageId = detail.pageId;
                  comp.afId = detail.afId || "";
                  comp.blockInfo = JSON.parse(detail.blockInfo);
                  comp.comptAttrs = JSON.parse(detail.compAttrs);
                  comp.comptId = detail.elementId;
                  comp.orderId = detail.orderId;
                  comp.type = detail.compType;
                  comp.styleAttrs = JSON.parse(detail.styleAttrs);
                  if(_this.pageCache.classTypeId == "1005" && _this.pageCache.operation == "templateview"){
                    comp.afId = "";
                  }
                  if(comp.afId == ""){//如果未绑定数据集则展示静态数据
                    resetTemplateCompt(comp,_this.pageCache.operation);
                  }
                  compts.push(comp);
                });
                this.setSedcuiCompts(compts);
                if (curPageCondi.length > 0) {
                  //回填前一页面的链接条件
                  for (const comp of this.flatCompt) {
                    let otherPageCondi = setCondiToCompt(comp, curPageCondi);
                    comp.comptAttrs["otherPageCondi"] = objDeepCopy(
                      otherPageCondi
                    );
                  }
                  // 设置从上一页面传过来的参数
                  this.setPageQueryParams();
                }
              }
              // 缓存所有包括下钻页面信息
              sessionStorage.setItem('allPagesInfo', JSON.stringify(pageList));
              // 保存外部参数
              if(pageList.length>0){
                let pageOutParams = pageList[0].pageSetting.pageParams || '[]';
                sessionStorage.setItem('pageOutParams',pageOutParams);
              }

              if (pageList.length > 1) {
                let res = handlePageList(pageList, this.pageCache.classTypeId,this.pageCache.operation);
                res.pages.leg = pageList.length
                this.$store.commit(
                  "PageDesign/setPageListAndScompts",
                  res.pages || []
                );
              } else {
                if (list.length > 0) {
                  for(let comp of compts) {
                    setWhereBeantimeOffset(comp)
                  }
                  this.setSedcuiCompts(compts);
                }
              }
              afIds = this.comptAfIds;
              //模板预览不匹配数据集
              if (afIds.length > 0 && this.pageCache.operation != "templateview") {
                this.queryDSDetailList({ af_id_list: afIds });
              }
            } else {
              // this.$message.error("页面信息查询失败");
            }
          })
          .catch(err => {
            console.error(err);
            // this.$message.error("页面信息查询异常");
          });
      } else {
        if (this.pageCache.isWatermark == 1) {
          this.$Watermark.set("water-wrap", 60, 20, -40, 0, flag);
        }
      }
    },
    parseValue(value) {
      return parseInt(value, 10);
    },
    // 获取截图的配置信息
    getCaptureOptions() {
      const scrollWrapDom = document.getElementsByClassName('preview-scrollbar')[0].firstElementChild;
      const dom = scrollWrapDom.firstElementChild;
      const box = window.getComputedStyle(dom);
      const width = Math.max(this.parseValue(box.width), this.parseValue(dom.scrollWidth));
      const height = Math.max(this.parseValue(box.height), this.parseValue(dom.scrollHeight));
      const isYScroll = this.parseValue(scrollWrapDom.clientHeight) < this.parseValue(dom.scrollHeight);
      const isXScroll = this.parseValue(scrollWrapDom.clientWidth) < this.parseValue(dom.scrollWidth);
      let option = {
        useCORS: true,
        allowTaint: true
      }
      // 如果没有纵向滚动条，就不用特殊设置，有纵向滚动条，需要调整windowHeight，height等配置属性
      if (isYScroll) {
        window.pageYOffset = 0;
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        option['scale'] = 1;
        option['windowHeight'] = height;
        option['height'] = height;
      }
      if (isXScroll) {
        window.pageXOffset = 0;
        document.documentElement.scrollLeft = 0;
        document.body.scrollLeft = 0;
        option['scale'] = 1;
        option['windowWidth'] = width;
        option['width'] = width;
      }
      return {
        option,
        width,
        height
      }
    },
    capturePic () {
      const {
        option,
        width,
        height
      } = this.getCaptureOptions();
      const _this = this;
      const captureWrapId = 'water-wrap';
      this.handleSvgElement();      
      const divObj = this.ifMobilePreview ? document.getElementById(captureWrapId).firstElementChild : document.getElementById(captureWrapId);
      // pc上的手机端导出
      if (this.ifMobilePreview && this.isPcTeminal) {
        this.mobileCapturePic({
        option,
        width,
        height,
        divObj
      });
      } else { // pc端 手机门户中的手机分析报告页面导出
        html2canvas(divObj, option).then(
          canvas => {
            _this.imgToPdf(canvas);
          }
        ).catch(err => {
          _this.$message.error("导出失败");
        });
      }
    },
    // html2canvas 导出图片,如果包含svg，要对svg进行特殊处理
    handleSvgElement() {
      const svgList = document.getElementById("water-wrap").querySelectorAll("svg");//divReport为需要截取成图片的dom的id
      svgList.forEach((value, index) => {
        try {
          var serializer = new XMLSerializer();
          // XMLSerializer.serializeToString() 把一个 XML 文档或节点转换为一个字符串
          var svgMarkup = serializer.serializeToString(value);
          //  线的位置都是有定位的，因此根据是否有定位判断是否为连线
          if (value.style.position) {
            var parentNode = value.parentNode;
            let canvas = document.createElement("canvas");
            let ctx = canvas.getContext("2d");
            let v = canvg.fromString(ctx, svgMarkup);
            v.start();
            canvas.style.position += value.style.position;
            canvas.style.left += value.style.left;
            canvas.style.top += value.style.top;
            canvas.setAttribute('canvas-from', 'capture-canvas'); // 标记canvas,截图完就删掉，不然会重复
            //  将绘制的canvas的线加入到DOM元素中
            parentNode.appendChild(canvas);
          }
        } catch (err) {
          console.log("error in print: " + err);
        }
      });
    },
    imgToPdf(canvas) {
      // 删除节点
            const svgCanvasList = document.querySelectorAll("canvas[canvas-from='capture-canvas']");
            svgCanvasList.forEach(item => {
              item.remove()
            });

        const contentWidth = canvas.width;
        const contentHeight = canvas.height;
        //页面偏移
        const pageData = canvas.toDataURL('image/jpeg', 1.0);
        const pdf = new JsPDF({
            orientation: this.ifMobilePreview ? "portrait" : "landscape",
            unit: "pt",
            format: [contentWidth, contentHeight]
        });
        pdf.addImage(pageData, 'JPEG', 0, 0, contentWidth, contentHeight);
        let pdfName = document.title;
        const mobileLinkPagesLen = this.mobileLinkPages.length;
        // pdfName = this.ifMobilePreview && mobileLinkPagesLen > 1 ? this.mobileLinkPages[mobileLinkPagesLen - 1].pageInfo
        //   .pageName : document.title;
        if (this.ifMobilePreview) {
          pdfName = mobileLinkPagesLen.length > 0 ? this.mobileLinkPages[mobileLinkPagesLen - 1].pageInfo
          .pageName : (this.pageCache.pageName || pdfName);
        }
        pdf.save(pdfName);
        if (document.getElementById("captureWrap")) {
          document.getElementById("captureWrap").remove();
        }
    },
    /* 手机端导出图片 */
    mobileCapturePic ({
        option,
        width,
        height,
        divObj
      }) {
      const _this = this;
      let newOption = {
        ...option
      };
      let newDivObj = null;
      if (newOption.height) {
        // 扣除手机区域顶部距离页面窗口上部的距离 667是.mobile-design那个div的高度，要少扣20px，不然第一个组件顶上去了
        const translateY = (window.innerHeight - 667 - 20);  
        newOption['y'] = translateY;
        newDivObj = divObj.children[1].firstElementChild.firstElementChild;
        // 滚动条滚到顶部
        newDivObj.parentElement.scrollTo(0,0);
      } else {
        newDivObj = divObj;
      }
      html2canvas(newDivObj, newOption).then(canvas => {
        _this.imgToPdf(canvas)
      }).catch(err => {
          _this.$message.error("导出失败");
        });
    }
  },
  computed: {
    ...mapState({
      s_edcuiCompts: state => state.PageDesign.s_edcuiCompts,
      designType: state => state.PageDesign.designType,
      pageCache: state => state.HomeBody.pageCache,
      tempEdcCompts: state => state.PageDesign.tempEdcCompts,
      dimList: state => state.QueryTable.dimList,
      msuList: state => state.QueryTable.msuList,
      menuClassTypeId: state => state.HomeTree.menuClassTypeId,
      mobileLinkPages: state => state.PageDesign.mobileLinkPages,
      datasetMap: state => state.AnalyReportAttr.datasetMap,
      PCDialogVisible: state => state.PageDesign.PCDialogVisible,
      isPcTeminal: state => state.isPcTeminal
    }),
    ...mapGetters({
      layout: "PageDesign/getLayout",
      comptAfIds: "PageDesign/getComptAfIds",
      flatCompt: "PageDesign/getFlatCompt",
      getPageParams: "PageDesign/getPageParams"
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
      const pageLen = this.mobileLinkPages.length;
      // 如果是手机端预览，则头部显示的是当前页面的标题，如果在pc端预览，则显示的是前一页的内容
      if (!this.isPcTeminal) {
        return pageLen === 0 ? this.pageCache.pageName : this.mobileLinkPages[pageLen - 1].pageInfo
          .pageName;
      } else if (pageLen > 1) {
        return this.mobileLinkPages[pageLen - 2].pageInfo
          .pageName;
      } else {
        return "";
      }
    },
    bgEffects() {
      return this.pageCache.bgEffects;
    },
    mobileNavBarShow() {
      return this.mobileLinkPages.length>1 || (!this.isPcTeminal && !this.inFrame);
    }
  },
  activated() {
    if(this.pageCache.operation=='applyTemplate'){
      this.templatePreview();
    }else{
      this.activatedCode();
    }
  },
  watch: {
    bgEffects: {
      handler(value) {
        this.$nextTick(() => {
          let waterWrap = document.getElementById("water-wrap");
          let newCanvas = document.createElement("canvas");
          if (waterWrap && waterWrap.querySelector(".canvasWrap")) {
            waterWrap.removeChild(waterWrap.querySelector(".canvasWrap"));
          }
          const bgEffects = this.pageCache.bgEffects;
          if (bgEffects && bgEffects != 0) {
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
      }
    }
  },
  created() {
    let frame = window.parent.length; //判断是否嵌入，嵌入需要全屏
    if(frame>0) {
      this.inFrame = true;
    } else {
      this.inFrame = false;
    }
  },
  mounted() {
    // let _this = this;
    this.$Watermark.unset("water-wrap");
    let pc = sessionStorage.getItem('pageCache');
    let pageInfo = JSON.parse(pc);
    this.setPageCache(pageInfo);
    if(pageInfo.pageType=="2"){ //预览弹窗模式
      let main=document.getElementById("main");
      main.style.margin="0 auto";
      main.style.width=pageInfo.width+"px";
      main.style.height=pageInfo.height+"px";
      main.style.border="1px solid #ccc";
      main.style.boxShadow="7px 7px 15px #ccc";
    }

    // if(!this.capture){
    //   document.title = this.pageCache.pageName;
    // }
    if (this.pageCache.classTypeId == "1001002") {
      this.setMobileScale();
      window.onresize = () => {
        this.setMobileScale();
      };
    }else if(this.pageCache.classTypeId == '1005'){
      if(this.capture){
        this.pcRatioW=710/1920;
        this.pcRatioH = 400/1080;
        this.activatedCode();
      }else{
        var _w = window.innerWidth;
        var _h = window.innerHeight;
        if(pageInfo.pageType=="2"){  //预览弹窗模式
          _w = pageInfo.width;
          _h = pageInfo.height;
        }
        this.pcRatioW = _w / 1920;
        this.pcRatioH = _h / 1080;
        this.bgImgSize.width = _w;
        this.bgImgSize.height = _h;
        document.getElementsByTagName("body")[0].setAttribute("class","bigscreen-body-wrap");
        document.body.style.height="auto";
        document.body.style.overflow="hidden";
        window.onresize = function() { // 如果直接使用this,this指向的不是vue实例
          let _w = window.innerWidth;
          let _h = window.innerHeight;
          let ratioW = _w / 1920;
          let ratioH = _h / 1080;
          document.querySelector(".query-design").style.transform=`scale(${ratioW},${ratioH})`;
          document.querySelector(".el-main").style.backgroundSize=`${_w}px ${_h}px`;
        }
      }
    }
  }
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
  &.mobile-preview-wrap {
    background-color: transparent;
  }
  .query-design {
    width: 100%;
    height: 100%;
    position:relative;
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
  .pc-design{
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
  transition: none;
  transition-property: none;
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
    top:50%;
    transform: translateY(-50%);
  }
}
#qrcode {
  position: absolute;
  top: 100px;
  right: 20px;
  display: none;
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
    content: '';
    width: 4px;
    height: 65%;
    position: absolute;
    top: 20%;
    left: 5px;
    background: #409EFF;
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
  // font-size: 14px;
  cursor: pointer;
  z-index: 1000;
  width: 100%;
  // &:hover {
  //   color: #409cfb;
  // }
}
.vdr{
  border:none !important;
}
/deep/.el-scrollbar__wrap{
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}
.stretch-btn-wrap {
  cursor: pointer;
  border: 1px solid #dcdfe6;
  border-radius: 30px 0px 0 30px;
  height: 42px;
  line-height: 42px;
  padding: 0 4px;
  background-color: #d9ecff;
  width: 38px;
  overflow: hidden;
  white-space: nowrap;
  z-index: 20;
  label,
  span {
    display: inline-block;
    cursor: pointer;
  }
  &:hover {
    width: 80px;
    transition:width 1s;
    -moz-transition:width 1s; /* Firefox 4 */
    -webkit-transition:width 1s; /* Safari and Chrome */
    -o-transition:width 1s; /* Opera */
  }
}
.stretch-text {
  margin: 0 5px;
  color: #409eff;
  width: 92px;
}
.stretch-btn-left {
  display: inline-block;
  border: 1px solid #dcdfe6;
  background: #fff;
  color: #409eff;
  border-radius: 50%;
  padding: 7px;
  text-align: center;
  line-height: 1;
  margin: 0;
  outline: none;
  z-index: 100;
  cursor: pointer;
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
