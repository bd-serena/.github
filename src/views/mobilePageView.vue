<template>
  <el-container id="main">
    <el-main style="padding:0">
      <el-container>
        <div
          id="water-wrap"
          class="query-design"
          :style="`background-color:${pageCache.bgClor||''};background-image:url(${pageCache.bgImg});`"
        >
          <div class="prev-page-wrap" @click="toPrevPage" v-show="mobileLinkPages.length>1">
            <i class="el-icon-arrow-left"></i>
            <span>{{prePageName}}</span>
          </div>
          <el-scrollbar
            v-if="s_edcuiCompts.length>0"
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
                <div style="height:100%">
                  <div
                    class="compt-title"
                    v-if="isShowName(item)"
                    :style="`color:${item.comptAttrs.extendSetting['title.textStyle.color']||''};`"
                  >{{item.comptAttrs.extendSetting['comptName.text']}}</div>
                  <div
                    :class="{'no-title':isShowName(item)==false,'has-title':isShowName(item)==true}"
                  >
                    <Cell
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
      </el-container>
    </el-main>
  </el-container>
</template>
<script>
import Cell from "../components/design/Cell.vue";
import VueDraggableResizable from "vue-draggable-resizable";
import VueGridLayout from "vue-grid-layout";
import { mapState, mapGetters, mapActions, mapMutations } from "vuex";
import {
  dealDataSetInfo,
  handlePageList,
  objDeepCopy,
  setCondiToCompt,
  getQueryCondi,
  getMatchedElementId,
  queryFieldMap,
  setWhereBeantimeOffset,
  mapDataSetInfoKey
} from "../utils/comonFunc.js";
export default {
  components: {
    Cell,
    VueDraggableResizable,
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem
  },
  data() {
    return {
      codeSrc: "",
      fieldTypeList: {} //数据库字段类型
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
                        _this.$set(_this.datasetMap,respData.af_id,dealDataSetInfo(data,"","",_this.fieldTypeList));
                      }
                      _this.upIsDSMapReady(true);
                    } else {
                      _this.$message.error("字段加载失败");
                    }
                  }
                })
                .catch(function(error) {
                  console.error(error);
                  // _this.$message.error("字段加载失败");
                });
              }else{
                _this.formatList = [];
                _this.$message.error("日期源格式查询失败");
              }
            });
          }else {
            _this.fieldTypeList = {};
            _this.$message.error("数据库字段类型查询失败");
          }
        });

    },
    ...mapActions({
      queryPageCompts: "PageDesign/queryPageCompts",
      setPageCache: "HomeBody/setPageCache",
      queryDatasetDetailList: "AnalyReportAttr/queryDatasetDetailList",
      queryPageFatherSonDetailList: "PageDesign/queryPageFatherSonDetailList",
      queryDbColConf: "DataSetDesign/queryDbColConf", //查询数据集信息
      queryDateFormatList: "DataSetDesign/queryDateFormatList"//日期源格式查询
    }),
    ...mapMutations({
      setQueryHistory: "PageDesign/setQueryHistory",
      upFilterData: "QueryTable/upFilterData",
      setSedcuiCompts: "PageDesign/setSedcuiCompts",
      upIsDSMapReady: "AnalyReportAttr/upIsDSMapReady"
    }),
    toPrevPage() {
      this.mobileLinkPages.pop();
      let curPage = this.mobileLinkPages[this.mobileLinkPages.length - 1];
      this.setSedcuiCompts(objDeepCopy(curPage.s_edcuiCompts));
      // this.setPageCache(objDeepCopy(curPage.pageInfo));
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
      datasetMap: state => state.AnalyReportAttr.datasetMap
    }),
    ...mapGetters({
      layout: "PageDesign/getLayout",
      comptAfIds: "PageDesign/getComptAfIds",
      flatCompt: "PageDesign/getFlatCompt",
      getPageParams: "PageDesign/getPageParams"
    }),
    prePageName() {
      if (this.mobileLinkPages.length > 1) {
        return this.mobileLinkPages[this.mobileLinkPages.length - 2].pageInfo
          .pageName;
      } else {
        return "";
      }
    }
  },
  activated() {
    if (this.pageCache != null && this.pageCache.operation == "preview") {
      var pageId = this.pageCache.pageId;
      var pageParam = Object.assign({
        pageId: pageId,
        createUser: window.sessionStorage.getItem("user_id"),
        classTypeId: "1001", //this.menuClassTypeId
        preViewFalg: "1", //1-记录操作日志标志    0-不记录操作日志
        isNeedDemo: this.pageCache.isDemo // 案例
      });
      this.queryPageFatherSonDetailList(pageParam)
        .then(val => {
          let flag = this.pageCache.classTypeId == "1001002" ? true : false;
          if (val.status == 200 && val.data.respResult == 1) {
            var pageInfo = val.data.respData[0];
            pageInfo.bgImg = (pageInfo.pageSetting || {}).bgImg || "";
            pageInfo.bgImageName = (pageInfo.pageSetting || {}).bgImageName || "";
            pageInfo.operation = this.pageCache.operation;
            pageInfo["classTypeId"] = this.pageCache.classTypeId || "1001002";
            this.setPageCache(pageInfo);
            document.title = this.pageCache.pageName || "";
            if (this.pageCache.isWatermark == 1) {
              this.$Watermark.set("water-wrap", 60, 20, -40, 0, flag);
            }
            let list = val.data.respData[0].pageDetails;
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
                compts.push(comp);
              });
              this.setSedcuiCompts(compts);
              let queryCondis = getQueryCondi() || []; //查询条件 pageId
              if (curPageCondi.length > 0) {
                let queryCompts = [];
                //回填前一页面的链接条件
                for (const comp of this.flatCompt) {
                  let otherPageCondi = setCondiToCompt(comp, curPageCondi);
                  comp.comptAttrs["otherPageCondi"] = objDeepCopy(
                    otherPageCondi
                  );
                  if (["Query", "MobileQuery"].includes(comp.type)) {
                    //找到查询组件
                    queryCompts.push(comp);
                  }
                }
                let pageParams = this.getPageParams;
                // 如果主页面与子页面都有查询组件时，且两个查询组件对应的数据集，都已添加到公共参数中，在从主页面跳转到子页面，需要把主页面设置的查询条件默认带给子页面的查询条件，传递条件的前提是子页面中查询组件绑定的数据集参与了公共参数的设置
                if (
                  pageParams.length > 0 &&
                  queryCompts.length > 0 &&
                  queryCondis.length > 0
                ) {
                  for (const comp1 of queryCompts) {
                    for (const field of comp1.comptAttrs.fieldList || []) {
                      for (const condi of queryCondis) {
                        let elementId = getMatchedElementId({
                          pageParams: pageParams,
                          rel_af_id: condi.rel_af_id,
                          rel_element_id: condi.rel_element_id,
                          af_id: field.comptAttrs.af_id
                        });
                        let fieldMap1 = queryFieldMap(field.type);
                        if (
                          elementId != "" &&
                          elementId == field.comptAttrs.element_id &&
                          JSON.stringify(fieldMap1) != "{}" &&
                          field.comptAttrs[fieldMap1.key] == condi[fieldMap1.condiKey]
                        ) {
                          //除elcascader查询组件外，其他组件都有是否默认值到设置，所以保险期间，都给他来个延时，保证条件不会丢
                          setTimeout(() => {
                            for (const valueKey1 of fieldMap1.valueKey || []) {
                              if (valueKey1.isDeepClone) {
                                field.comptAttrs[ valueKey1.keyName ] = objDeepCopy(condi[valueKey1.keyName]);
                              } else {
                                field.comptAttrs[valueKey1.keyName] = condi[valueKey1.keyName];
                              }
                            }
                          }, 1000);
                        }
                      }
                    }
                  }
                }
              }
            }

            var pageList = val.data.respData;
            if (pageList.length > 1) {
              let res = handlePageList(pageList, this.pageCache.classTypeId);
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
            if (afIds.length > 0) {
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
  mounted() {
    let pc = sessionStorage.getItem('pageCache');
    let pageInfo = JSON.parse(pc);
    this.setPageCache(pageInfo);
    document.title = this.pageCache.pageName || "";
    let metaInfo = [
      {
        name: "viewport",
        content:
          "width=device-width,initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0,user-scalable=no"
      },
      {
        name: "apple-mobile-web-app-capable",
        content: "yes"
      },
      {
        name: "apple-mobile-web-app-status-bar-style",
        content: "black"
      }
    ];
    let headObj = document.getElementsByTagName("head")[0];
    for (let index = 0; index < metaInfo.length; index++) {
      const element = metaInfo[index];
      let oMeta = document.createElement("meta");
      oMeta.content = element.content;
      oMeta.name = element.name;
      headObj.appendChild(oMeta);
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
  background-color: $main-bg;
  .query-design {
    width: 100%;
    height: 100%;
    background-color: #fff;
    background-repeat: no-repeat;
    background-position: center center;
    background-size: cover;
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
}
#qrcode {
  position: absolute;
  top: 100px;
  right: 20px;
}
.compt-title {
  color: #333;
  font-size: 18px;
  padding-top: 3px;
  padding-left: 5px;
  padding-bottom: 3px;
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
</style>
