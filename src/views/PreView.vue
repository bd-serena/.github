<template>
  <el-container>
    <!-- <el-header class="design-page" v-show="pageCache.isQueryPre!='1'">
      <div class="head-left">
         <el-tooltip class="item to-main" effect="dark" content="返回" placement="top-start">
          <i :class="{'icon-A10233_left':true}" @click="toMain"></i>
        </el-tooltip>
        <el-input
          class="page-name"
          size="mini"
          v-model="pageCache.pageName"
          :disabled="true"
          placeholder="未命名"
        ></el-input>
      </div>
    </el-header> -->
    <el-main id="main" style="padding:0;">
      <el-container>
        <div v-if="designType==1" style="width:100%; height:100%">
          <div class="query-layout">
            <div class="query-grid" v-for="(item) in s_edcuiCompts" :key="item.comptSort">
              <Cell :isDesign="true" :vscompt="item"></Cell>
            </div>
          </div>
          <!--<div>
                    <div
                      v-for="(item,index) in s_edcuiCompts"
                      :key="item.comptSort"
                      :class="{'query-box':true,'box-condi':index==0}">
                      <div style="height:100%" @click="upBlock(item.comptSort)"><Cell :isDesign="true" :vscompt="item" v-loading="index==1?loading:false" element-loading-background="rgba(0, 0, 0, 0.5)"></Cell></div>
                    </div>
          </div>-->
          <!--  <grid-layout
                    :layout.sync="layout"
                    :col-num="24"
                    :row-height="1"
                    :is-draggable="false"
                    :is-resizable="false"
                    :is-mirrored="false"
                    :vertical-compact="true"
                    :margin="[20, 20]"
                    :use-css-transforms="true"
                    >

                        <grid-item v-for="item in s_edcuiCompts"
                                :key="item.comptSort"
                                :x="item.blockInfo.x"
                                :y="item.blockInfo.y"
                                :w="item.blockInfo.w"
                                :h="item.blockInfo.h"
                                :i="item.comptSort">
                            <div style="height:100%"><Cell :isDesign="true" :vscompt="item"></Cell></div>
                        </grid-item>
          </grid-layout>-->
        </div>
        <div v-else id="opt-box" ref="optBox">
          <vue-draggable-resizable
            v-if="s_edcuiCompts.length>0"
            :w="compt.blockInfo.w"
            :h="compt.blockInfo.h"
            :x="compt.blockInfo.x"
            :y="compt.blockInfo.y"
            :class="{ 'designCompt':false}"
            :resizable="false"
            :draggable="false"
            :grid="[1,1]"
            :parent="false"
            v-for="compt in s_edcuiCompts"
            :key="compt.comptSort"
            :data-id="compt.comptSort"
          >
            <div style="height:100%">
              <Cell :isDesign="true" :vscompt="compt"></Cell>
            </div>
          </vue-draggable-resizable>
        </div>
      </el-container>
    </el-main>
    <ExportForm></ExportForm>
    <summarizeDialog></summarizeDialog>
    <ListImportDialog></ListImportDialog>
    <el-dialog
      size="mini"
      title="查询历史"
      width="600px"
      class="queryHis"
      :visible.sync="queryHisDialog"
      :append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <QueryHisDialog v-if="queryHisDialog"></QueryHisDialog>
    </el-dialog>
    <el-dialog
      size="mini"
      title="定时取数设置"
      width="600px"
      class="queryTask"
      :visible.sync="queryTaskDialog"
      :append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <QueryTask v-if="queryTaskDialog"></QueryTask>
    </el-dialog>
  </el-container>
  <!-- 即席查询 -->
</template>
<script>
  import Cell from "../components/design/Cell.vue";
  import VueDraggableResizable from "vue-draggable-resizable";
  import VueGridLayout from "vue-grid-layout";
  import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
  import ExportForm from "../components/design/ExportForm.vue";
  import SummarizeDialog from "../components/design/SummarizeDialog.vue";
  import QueryHisDialog from "../components/design/QueryHistory.vue";
  import ListImportDialog from "../components/design/ListImport.vue";
  import QueryTask from "../components/design/QueryTask.vue";

  export default {
    components: {
      Cell,
      VueDraggableResizable,
      GridLayout: VueGridLayout.GridLayout,
      GridItem: VueGridLayout.GridItem,
      ExportForm,
      SummarizeDialog,
      QueryHisDialog,
      ListImportDialog,
      QueryTask
    },
    data() {
      return {};
    },
    methods: {
      setScale() {
        var _w = this.$refs.optBox.clientWidth;
        // var _h = window.innerHeight;
        var w_trans = _w / 1366;
        // var h_trans = _h/winHeit
        document.getElementById("opt-box").style.transform =
          "scale(" + w_trans + ")";
        document.getElementById("opt-box").style.transformOrigin = "0 0";
        // document.getElementsByClassName('draw-center')[0].style.transform = 'scaleY('+h_trans+')'
      },
      ...mapActions({
        qryPageDetailsByVerNo: "PageDesign/qryPageDetailsByVerNo",
        setPageCache: "HomeBody/setPageCache"
      }),
      ...mapMutations({
        setQueryHistory: "compt/setQueryHistory",
        upFilterData: "QueryTable/upFilterData",
        setTabtag: "QueryTable/setTabtag",
        setQueryTaskDialog: "compt/setQueryTaskDialog"
      }),
      toMain() {
        this.$router.go(-1);
      }
    },
    computed: {
      queryHisDialog: {
        get() {
          return this.$store.state.compt.QueryHistory;
        },
        set(value) {
          this.setQueryHistory(value);
        }
      },
      queryTaskDialog: {
        get() {
          return this.$store.state.compt.queryTaskDialog;
        },
        set(value) {
          this.setQueryTaskDialog(value);
        }
      },
      ...mapState({
        s_edcuiCompts: state => state.compt.s_edcuiCompts,
        designType: state => state.compt.designType,
        pageCache: state => state.HomeBody.pageCache,
        tempEdcCompts: state => state.compt.tempEdcCompts,
        dimList: state => state.QueryTable.dimList,
        msuList: state => state.QueryTable.msuList,
        menuClassTypeId: state => state.HomeTree.menuClassTypeId
      }),
      ...mapGetters({
        layout: "compt/getLayout"
      })
    },
    activated() {
      this.dimList.splice(0, this.dimList.length);
      this.msuList.splice(0, this.msuList.length);
      this.$Watermark.set("main");
      if (this.pageCache != null && this.pageCache.operation == "preview") {
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
          previewType: (this.menuClassTypeId === 'drive' || JSON.stringify(this.$route.query) !== '{}') ? '1' : '0',
          preViewFalg: "1" //1-记录操作日志标志    0-不记录操作日志
        });
        this.qryPageDetailsByVerNo(pageParam)
          .then(val => {
            if (val.status == 200 && val.data.respResult == 1) {
              /* var str=val.data.respData[1].compAttrs;
              var obj=JSON.parse(str);
              obj.tableattrs.data=[];
              obj.pagination.total=0;
              val.data.respData[1].compAttrs=JSON.stringify(obj); */
              let pageDetails = val.data.respData[0].pageDetails;
              var str = pageDetails[1].compAttrs;
              var obj = JSON.parse(str);
              var filterData = [];
              if (obj.filterData != null) {
                filterData = obj.filterData || [];
              }
              this.upFilterData({data: filterData, type: "reset"});
              this.$store.commit("compt/setSedcuiCompts", pageDetails);
              this.$store.commit("QueryTable/upTableCols", {
                data: obj.columns,
                type: "reset"
              });
            } else {
              // this.$message.error("页面信息查询失败");
            }
          })
          .catch(err => {
            console.error(err);
            // this.$message.error("页面信息查询异常");
          });
      }
      if (this.designType == 0) {
        this.setScale();
        window.onresize = () => {
          this.setScale();
        };
      }
    },
    mounted() {
      let pc = sessionStorage.getItem('pageCache');
      let pageInfo = JSON.parse(pc);
      this.setPageCache(pageInfo);
      document.title = this.pageCache.pageName;
      // 预览页面 清单/汇总切换按钮隐藏
      this.setTabtag('false');
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

        /deep/ .el-input__inner {
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

  .design-main {
    &.el-main {
      background-color: $main-bg;

      .query-design {
        width: 100%;
        height: 100%;
        background-color: $main-bg1;
      }
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

  .query-grid > .jixi {
    padding-right: 76px;
  }

  .query-grid:first-child {
    position: relative;
    min-height: 70px;
    padding-top: 18px;

    /deep/ .el-form-item__content {
      z-index: 100;
    }

    /deep/ .el-button {
      z-index: 100;
    }
  }

  .query-grid:last-child {
    height: 475px;
    margin-top: 20px;
  }
</style>


