<template>
  <el-container v-loading="loadingNew">
    <el-header class="design-page">
      <div class="head-left">
        <el-input
          class="page-name"
          :class="{'page-input' : this.toSaveInput}"
          size="mini"
          v-model="pageName"
          placeholder="请输入页面名称"
          @change="setHomePageName(pageName)"
          @input="inputChange('pageName')"
          ref="toSaveBtn"
        ></el-input>
        <div class="compt-icons">
          <!-- 变量前面要使用：  mouseenter鼠标进入事件 -->
          <div
            :class="{'compt-icons-cell':true,'actived':comptPanelId==comptMu.compId}"
            v-for="comptMu in edcuiComptsMenu"
            :key="comptMu.compId"
            :data-id="comptMu.compId"
            v-on:mouseenter="comptSelect($event,comptMu.compId,comptMu.children)"
            v-on:mouseleave="toggleCompList(false)"
            @click.stop="comptSelect($event,comptMu.compId,comptMu.children)"
            :id="'auto_'+comptMu.compId"
          >
            <el-tooltip
              class="item"
              effect="dark"
              :content="comptMu.compName"
              placement="bottom"
              popper-class="compt-icon-toolTip"
            >
              <i :class="comptMu.iconClass"></i>
            </el-tooltip>
            <span class="triangle icon-A10008_triangleUp"></span>
            <!-- 图形选择弹窗     动态改变样式(:style)-->
            <div class="compt-list" v-on:mouseleave="toggleCompList(false)">
              <el-scrollbar class="scroll-cont" style="height:100%;">
                <div
                  v-for="compt in comptMu.children"
                  class="header-compts"
                  v-if="designType==1"
                  :key="compt.compId"
                  :data-id="compt.compId"
                  @click="addToDesign(compt.compType)"
                  :id="'auto_comMu'+compt.compId"
                >
                  <div class="compt-list-img">
                    <img :src="compt.imgSrc||'comptPic/third.png'" alt />
                  </div>
                  <div class="compt-list-tit">{{compt.compName}}</div>
                </div>
                <div style="clear:both"></div>
              </el-scrollbar>
            </div>
          </div>
        </div>
      </div>

      <div class="head-opt-btn">
        <el-tooltip class="item" effect="dark" content="预览" placement="top-start">
          <i :class="{'icon-A10603_Overview':true}" @click="toPrew"></i>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" v-if="pageCache.isDemo ? pageCache.isDemo === '0' : true" content="保存" placement="top-start">
          <i :class="{'icon-A10579_Preservation':true}" @click="toSave"></i>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="另存" placement="top-start">
          <i :class="{'icon-A10545_PS':true}" @click="toSaveAs"></i>
        </el-tooltip>
      </div>
    </el-header>
    <el-container>
      <el-aside id="compt-hide" width="200">
        <!-- 图层面板 -->
      </el-aside>
      <el-main style="position:relative" class="design-main" ref="designBody">
        <div class="design-toolbar">
          <div class="right-btn">
            <div
              class="right-btn-item"
              :class="{'disabled':!((cursor[activedPage] != undefined
          ? cursor[activedPage]
          : -1) > 0)}"
            >
              <el-tooltip
                class="item"
                effect="dark"
                content="撤销"
                @click.native="executeRedoAndUndo({cmdType:'undo',pageId:activedPage})"
                placement="bottom"
              >
                <i class="icon-A10652_cancel"></i>
              </el-tooltip>
            </div>
            <div
              class="right-btn-item"
              :class="{'disabled':!((snapshots[activedPage] || []).length > (cursor[activedPage] != undefined
          ? cursor[activedPage]
          : -1) + 1)}"
            >
              <el-tooltip
                class="item"
                effect="dark"
                content="撤销回退"
                placement="bottom"
                @click.native="executeRedoAndUndo({cmdType:'redo',pageId:activedPage})"
              >
                <i class="icon-A10653_recover"></i>
              </el-tooltip>
            </div>
            <div class="right-btn-line">
              <span></span>
            </div>
            <div class="right-btn-item">
              <el-tooltip class="item" effect="dark" content="页面设置" placement="bottom">
                <i class="icon-A10205_edit" @click="showPageSet"></i>
              </el-tooltip>
            </div>
            <div class="right-btn-item">
              <el-tooltip class="item" effect="dark" content="参数设置" placement="bottom">
                <i class="icon-A10080_setting" @click="upParamSetDiaVis(true)"></i>
              </el-tooltip>
            </div>
          </div>
        </div>

        <!-- 即席查询 -->
        <div
          id="water-wrap"
          :style="`background-color:${nowPage.bgClor||''};background-image:url(${nowPage.bgImg});`"
          class="query-design"
          :class="pageCache.classTypeId == '1001002'?'mobile-design':''"
          v-if="designType==1"
          @keydown.ctrl.67="copyKey"
          @keydown.ctrl.86="pasteKey"
          @keydown.46="deleteKey"
          @keydown.ctrl.90="executeRedoAndUndo({cmdType:'undo',pageId:activedPage})"
          @keydown.ctrl.89="executeRedoAndUndo({cmdType:'redo',pageId:activedPage})"
          tabindex="-1"
        >
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
              :is-draggable="true"
              :is-resizable="true"
              :is-mirrored="false"
              :vertical-compact="true"
              :margin="[10, 10]"
              :use-css-transforms="false"
              :autoSize="true"
            >
              <grid-item
                v-for="(item,index) in s_edcuiCompts"
                :class="{'active':item.comptId===activedBlock}"
                :key="item.comptId"
                :x="item.blockInfo.x"
                :y="item.blockInfo.y"
                :w="item.blockInfo.w"
                :h="item.blockInfo.h"
                :i="item.comptId"
                :minH="2"
                :minW="pageCache.classTypeId == '1001002'?2:1"
                @click.native.stop="upBlock(item.comptId)"
                @moved="movedEvent"
                @resized="resizedEvent"
                @move="moveEvent"
                @resize="resizeEvent"
              >
                <div
                  style="position:relative;height:100%;overflow:hidden;"
                  :style="setHeaderStyle(item)"
                >
                  <div
                    class="compt-title"
                    v-if="isShowName(item)"
                    :style="setFontStyle(item)"
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
                <el-dropdown size="mini" class="block-menu" trigger="click">
                  <span class="el-dropdown-link">...</span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item
                      v-show="item.type!='ElTabs'"
                      @click.native="comptCopy(item)"
                    >复制</el-dropdown-item>
                    <el-dropdown-item @click.native="deleteCompt(item.comptId)">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </grid-item>
            </grid-layout>
          </el-scrollbar>
          <div v-else class="null-tip">
            <span>请添加</span>
            <span class="icon-A10697_click"></span>
            <span>组件</span>
          </div>
        </div>
        <!-- 界面定制及大屏 -->
        <div v-else-if="designType==0">
          <div id="opt-box" ref="optBox">
            <vue-draggable-resizable
              v-for="compt in s_edcuiCompts"
              :ref="'dr'+compt.comptId"
              v-if="s_edcuiCompts.length>0"
              :w="compt.blockInfo.w"
              :h="compt.blockInfo.h"
              :x="compt.blockInfo.x"
              :y="compt.blockInfo.y"
              :class="{ 'designCompt':true,'qryGroup':compt.jixi==true}"
              @resizestop="onResizstop"
              @dragging="onDrag"
              @resizing="onResize"
              :resizable="true"
              :grid="[1,1]"
              :parent="false"
              :key="compt.comptId"
              :data-id="compt.comptId"
              @activated="upActivedId(compt.comptId)"
            >
              <div style="height:100%; overflow:hidden;">
                <Cell :isDesign="true" :vscompt="compt"></Cell>
              </div>
              <el-tooltip class="item" effect="dark" content="删除" placement="top-start">
                <i class="opt-btn el-icon-delete" @click="deleteCompt(compt.comptId)"></i>
              </el-tooltip>
            </vue-draggable-resizable>
          </div>
          <rulerTool />
        </div>

        <div class="design-footbar">
          <div class="page-tabs">
            <div class="prev-btn" @click="prevPage">
              <span class="icon-A10015_triangleEqualRight"></span>
            </div>
            <div class="next-btn" @click="nextPage">
              <span class="icon-A10014_triangleEqualLeft"></span>
            </div>
            <div class="page-tab-slide">
              <draggable
                v-model="pageList"
                draggable=".drag-tab"
                class="slide-wrap"
                @end="pageResort"
                :move="pageTabOnMove"
              >
                <div
                  v-if="pageList.length>0"
                  v-for="(item,index) in pageList"
                  :class="{'page-tab':true,'active':item.pageId==activedPage,'drag-tab':index>-1}"
                  @click="pageCheck(item.pageId)"
                  @contextmenu.prevent
                  @mouseup="e=>contextMenu(e,item.pageId)"
                >
                  <input
                    style="width:100%"
                    class="pagetab-input"
                    type="text"
                    v-model="item.pageName"
                    v-if="item.pageId==editId"
                    @click.stop
                    @blur="pageTagBlur(item)"
                  />
                  <span v-else :title="item.pageName">{{item.pageName}}</span>
                </div>
                <div class="page-tab-add" @click="addSubPage">
                  <span>+</span>
                </div>
              </draggable>
            </div>
          </div>
        </div>
      </el-main>
      <el-aside width="360px" style="background:#2f5377;">
        <AnalyReportAttrSet v-show="activedBlock!==''"></AnalyReportAttrSet>
        <PageBaseSet v-show="activedBlock===''"></PageBaseSet>
      </el-aside>
    </el-container>

    <!-- 页面另存start -->
    <el-dialog width="420px" :visible.sync="dialogSaveAs" class="save-as-dialog">
      <div slot="title" class="dialog-title">
        <span>另存为</span>
        <div class="title-line"></div>
      </div>
      <el-form ref="saveForm" :rules="rules" :model="saveForm">
        <el-form-item
          prop="pageName"
          label="名称"
          :label-width="'51px'"
          style="margin-bottom:14px;margin-top:-6px;"
        >
          <el-input
            @input="inputChange('saveForm.pageName')"
            size="mini"
            v-model="saveForm.pageName"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item
          style="margin-bottom:0;"
          size="mini"
          prop="catalogId"
          class="win-item"
          label="目录"
          :label-width="'51px'"
        >
          <el-cascader
            :change-on-select="true"
            expand-trigger="hover"
            :show-all-levels="false"
            style="width:100%"
            :options="saveToTreeData"
            v-model="saveForm.catalogId"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogSaveAs=false" size="mini">取 消</el-button>
        <el-button type="primary" @click="saveAsSubmit('saveForm')" size="mini">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 页面另存end -->

    <!-- 页面tab右键菜单start -->
    <div class="context-menu" v-show="contextMenuShow">
      <ul>
        <li @click="pageRename">重命名</li>
        <li @click="pageCopy">复制</li>
        <li @click="pageDelete">删除</li>
      </ul>
    </div>
    <!-- 页面tab右键菜单end -->
    <!-- 参数设置弹窗 -->
    <publicParamSet></publicParamSet>
  </el-container>
</template>
<script>
import draggable from "vuedraggable";
import Cell from "../components/design/Cell.vue";
import VueDraggableResizable from "vue-draggable-resizable";
// import VueDraggableResizable from "../components/tools/vue-draggable-resizable"//后期自由布局加入后使用本地组件方式（需要改源代码）
import "vue-draggable-resizable/dist/VueDraggableResizable.css";
import rulerTool from "../components/tools/rulerTool.vue";
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import VueGridLayout from "vue-grid-layout";
import {
  dealDataSetInfo,
  objDeepCopy,
  windowResize,
  handlePageList,
  initComptName,
  genComptName,
  mapDataSetInfoKey
} from "../utils/comonFunc.js";
import getUUID from "../utils/UUID.js";
import AnalyReportAttrSet from "../components/design/AnalyReportAttrSet";
import eventBus from "../plugins/transData.js";
import publicParamSet from "../components/design/publicParamSet";
import PageBaseSet from "../components/design/PageBaseSet";
import ComptMixins from "../utils/comptMixins";
// import { constants } from "fs";

export default {
  components: {
    Cell,
    VueDraggableResizable,
    rulerTool,
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    PageBaseSet,
    AnalyReportAttrSet,
    draggable,
    publicParamSet
  },
  mixins: [ComptMixins],
  data() {
    var catalogCheck = (rule, value, callback) => {
      if (value.length == 0) {
        callback(new Error("请选择目录"));
      } else {
        callback();
      }
    };
    return {
      loadingNew: false,
      ctid: "", //分类id
      panelLeft: "", //面板平移距离
      comptListShow: false,
      tempCompt: null,
      pageName: "",
      tabPageId: "",
      editId: "",
      contextMenuShow: false,
      scaleValue: 50,
      saveToTreeData: [],
      requiedJson: {}, //请求json
      w_trans: 1,
      querygrid: [true, false],
      dialogSaveAs: false,
      saveForm: {
        pageName: "",
        catalogId: []
      },
      toSaveInput: false,
      rules: {
        pageName: [
          { required: true, message: "请输入名称", trigger: "blur" },
          { min: 1, max: 30, message: "长度在 1 到 30 个字符", trigger: "blur" }
        ],
        catalogId: [
          { required: true, validator: catalogCheck, trigger: "change" }
        ]
      },
      pageOrder: 1,
      // comptOrder: 1,
      comptPanelId: "",
      comptChildren: [],
      scaleRate: 1,
      fieldTypeList: {} //数据库字段类型
    };
  },
  methods: {
    inputChange(val) {
      let inputVal = "";
      if (val == "pageName") {
        inputVal = this.pageName;
      } else {
        inputVal = this.saveForm.pageName;
      }
      if (inputVal.length > 30) {
        let str = inputVal.slice(0, 30);
        if (val == "pageName") {
          this.pageName = str;
        } else {
          this.saveForm.pageName = str;
        }
        this.$message.warning("名称长度不能超过30字符!");
        return false;
      }
    },
    showPageSet() {
      this.comptPanelId = "";
      this.upActivedBlock("");
      this.upActivedId({});
      this.upActivedTab([]);
    },
    getLayoutY() {
      let result = 0;
      this.layout.forEach(val => {
        result += val.h;
      });
      return result;
    },
    getSubLayoutY(list) {
      let result = 0;
      if (list.length > 0) {
        list.forEach(val => {
          let item = val.blockInfo;
          result += item.h;
        });
      }
      return result;
    },
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
    comptSelect(_this, id, comptChildren) {
      this.panelLeft = _this.screenX - 290; //获取偏移量距离左边多少
      this.comptPanelId = id; //id标示
      this.comptListShow = true;
      this.comptChildren = comptChildren; //孩子节点
    },
    resizedEvent(i, newH, newW, newHPx, newWPx) {
      if (this.activedCompt.type !== 'VeWordCloud' && this.activedCompt.type !== '') { // 词云图的resize不需要手动触发
        windowResize()
      }
      this.recordOpt({
        curPageId: this.activedPage,
        cmd: {
          commandName: "resizeCompt",
          dataBefore: JSON.stringify(objDeepCopy(this.s_edcuiCompts)),
          comptInfo: {}
        },
        type: "undo"
      });
    },
    copyKey() {
      if (this.activedCompt.type === "ElTabs") {
        this.$message({
          message: "tab切换组件不支持复制",
          type: "warning"
        });
        return;
      }
      if (
        this.activedBlock !== "" &&
        this.activedCompt.type != "ElTabs" &&
        this.activedCompt.type != "ElCarousel"
      ) {
        this.tempCompt = this.activedCompt;
      } else {
        this.tempCompt = null;
      }
    },
    pasteKey() {
      if (this.tempCompt != null) {
        this.comptCopy(this.tempCompt);
      }
    },
    deleteKey() {
      if (this.activedBlock !== "") {
        var id = this.activedCompt.comptId;
        this.deleteCompt(id);
      }
    },
    comptCopy(compt) {
      this.addToDesign(0, compt);
    },
    setHomePageName(val) {
      this.pageList[0].pageName = val;
    },
    expendCompt() {
      var dom = document.getElementById("compt-hide");
      if (dom.clientWidth > 0) {
        dom.style.width = "0px";
      } else {
        dom.style.width = "200px";
      }
    },
    pageTagBlur(item) {
      if (item.pageName == "") {
        this.$message.error("页面名称不能为空");
        document.querySelector(".pagetab-input").focus();
        return;
      }
      if (item.parentId == 0) {
        this.pageName = item.pageName;
      }
      this.editId = "";
    },
    prevPage() {
      document.querySelector(".slide-wrap").style.transform = "translateX(0px)";
    },
    nextPage() {
      var list = document.querySelector(".slide-wrap");
      var wid = 0; //page-tab总宽度
      for (var i = 0; i < list.childNodes.length; i++) {
        wid += list.childNodes[i].clientWidth;
      }
      var wrap = document.querySelector(".page-tab-slide").clientWidth; //wrap宽度
      if (wid >= wrap) {
        var trans = wid - wrap + 25;
        document.querySelector(".slide-wrap").style.transform =
          "translateX(-" + trans + "px)";
      }
    },
    pageRename() {
      this.editId = this.tabPageId;
      this.$nextTick(() => {
        document.querySelector(".pagetab-input").focus();
      });
    },
    pageCopy() {
      var length = this.pageList.length;
      if (length > 9) {
        this.$message.error("已超过页面总个数，无法复制！");
        return;
      }
      var id = this.tabPageId;
      var newPage = null;
      for (var item of this.pageList) {
        if (item.pageId == id) {
          newPage = objDeepCopy(item);
          break;
        }
      }
      if (newPage) {
        newPage.pageId = getUUID();
        newPage.pageName = "未命名" + this.pageIndex;
        newPage.parentId = this.pageList[0].pageId;
        //替换复制页面的所有组件ID
        // 更新页面联动组件对应ID
        let comptIdObj = {};
        if (newPage.pageDetail && newPage.pageDetail.length > 0) {
          for (var i = 0; i < newPage.pageDetail.length; i++) {
            let uuid = comptIdObj[newPage.pageDetail[i].comptId] || getUUID();
            comptIdObj[`${newPage.pageDetail[i].comptId}`] = uuid;
            newPage.pageDetail[i].comptId = uuid;
            newPage.pageDetail[i].blockInfo.i = uuid;
            let attrs = newPage.pageDetail[i].comptAttrs;
            if (attrs.mainLinkageData.length > 0) {
              for (let page of attrs.mainLinkageData) {
                let uid = comptIdObj[page.comptId] || getUUID();
                comptIdObj[page.comptId] = uid;
                page.comptId = uid;
              }
            }
            if (attrs.fieldList.length > 0) {
              for (let field of attrs.fieldList) {
                let pages = field.comptAttrs.mainLinkageData;
                for (let page of pages) {
                  let uid = comptIdObj[page.comptId] || getUUID();
                  comptIdObj[page.comptId] = uid;
                  page.comptId = uid;
                }
              }
            }
            // attrs.mainLinkageData
            // attrs.fieldList[0].comptAttrs.mainLinkageData[0].comptId
          }
        }
        this.pageList.push(newPage);
        this.pageResort();
      }
    },
    pageDelete() {
      var pageId = this.tabPageId;
      for (var i = 0; i < this.pageList.length; i++) {
        if (this.pageList[i].pageId == pageId) {
          if (i == 0) {
            this.$message.error("不能删除主页面");
          } else {
            this.$confirm("确认删除子页面吗", "提示", {
              closeOnClickModal: false,
              confirmButtonText: "确定",
              cancelButtonText: "取消"
            })
              .then(() => {
                if (pageId == this.activedPage) {
                  //删除页面为当前页面
                  this.setActivedPage(this.pageList[i - 1].pageId);
                  var data = this.pageList[i - 1].pageDetail;
                  this.setPageDetail(data);
                }
                this.pageList.splice(i, 1);
              })
              .catch(() => {});
          }
          break;
        }
      }
    },
    contextMenu(e, pageId) {
      if (e.button == 2) {
        let menu = document.querySelector(".context-menu");
        var marginWidths = 60;
        var marginHeight = 85;
        //鼠标点的坐标
        var oX = e.clientX - marginWidths;
        var oY = e.clientY - marginHeight;

        //菜单出现后的位置
        menu.style.left = oX + "px";
        menu.style.top = oY + "px";
        this.contextMenuShow = true;
        this.tabPageId = pageId;
      }
    },
    pageCheck(pageId) {
      this.setActivedPage(pageId);
      var data = [];
      for (var item of this.pageList) {
        if (item.pageId == pageId) {
          data = item.pageDetail;
          break;
        }
      }
      this.setPageDetail(data);
      this.showPageSet(); //切换页面时，右侧面板应该显示页面基本设置而不是上次选中组件的遗留状态
    },
    addSubPage() {
      var length = this.pageList.length;
      if (length > 9) {
        this.$message.error("已超过页面总个数，无法新建！");
        return;
      }
      var uuid = getUUID();
      var param = {
        pageId: uuid,
        pageName: "未命名" + this.pageIndex,
        pageDetail: [],
        parentId: this.pageList[0].pageId,
        orderId: this.pageOrder++,
        pageType: "1",
        bgClor: "",
        isWatermark: "0",
        bgImg: "",
        bgImageName: "",
        width: "800",
        height: "500"
      };
      this.addPageList(param);
      this.pageResort();
      this.setActiveName("attr");
      // 初始时候先记录一次
      this.initPageSnapshots({
        pageId: param.pageId,
        dataBefore: JSON.stringify(objDeepCopy(param.pageDetail))
      });
    },

    async addToDesign(compType, compt) {
      this.checkIfNeedRecordFirst({
        dataBefore: JSON.stringify(this.s_edcuiCompts),
        pageId: this.activedPage
      });

      //添加组件到设计区域
      let d_cpts = {};
      let uuid = getUUID();
      if (compt != null) {
        //组件复制
        d_cpts = objDeepCopy(compt);
        // 组件复制时，若源组件处于被联动状态，应该清除被联动条件
        if (
          d_cpts.comptAttrs.linkageCondi &&
          d_cpts.comptAttrs.linkageCondi.length > 0
        ) {
          d_cpts.comptAttrs.linkageCondi = [];
          d_cpts.comptData.columns = []; //删除原数据，保证组件可以重新查询数据
          this.upIsDSMapReady(true);
          if (d_cpts.comptData.rows != undefined) {
            d_cpts.comptData.rows = [];
          }
          if (d_cpts.comptData.data != undefined) {
            d_cpts.comptData.data = [];
          }
        }
        if (d_cpts.comptAttrs.otherPageCondi) {
          //清除页面链接
          d_cpts.comptAttrs.otherPageCondi.splice(
            0,
            d_cpts.comptAttrs.otherPageCondi.length
          );
        }
        if (d_cpts.comptAttrs.pageLinkageData) {
          //清除页面链接
          d_cpts.comptAttrs.pageLinkageData.splice(
            0,
            d_cpts.comptAttrs.pageLinkageData.length
          );
        }
        if (
          this.activedCompt.type != "ElTabs" &&
          this.activedCompt.type != "VanCollapse"
        ) {
          genComptName(d_cpts, this.s_edcuiCompts);
        }
      } else {
        // const temp_Data = require("../../public/comptConfig/" + chartUrl); //图表json数据
        let param = {
          compType,
          classTypeId: this.pageCache.classTypeId
        };
        let temp_Data = [];
        let resp = await this.qryStyleAttrs(param);
        if (!resp) {
          // this.$message.error('组件详情查询异常')
          return;
        } else {
          if (resp.status == 200 && resp.data.respResult == "1") {
            temp_Data = [resp.data.respData];
            let commonAttrs = temp_Data[0].styleAttrs.find((val)=>val.enName === "commonAttrs")
            if(commonAttrs&&commonAttrs.children&&(commonAttrs.children.find((val)=>val.enName === "commonTitleFontSize")||commonAttrs.children.find((val)=>val.enName === "commonTitleColor"))){
              commonAttrs.children.find((val)=>val.enName === "commonTitleFontSize").isShow=false
              commonAttrs.children.find((val)=>val.enName === "commonTitleColor").isShow=false
            }
            temp_Data[0].comptAttrs.isLoadData = false;  //是否查询过数据
            temp_Data[0].comptAttrs.extendSetting["grid.top"] = '10%';
            temp_Data[0].comptAttrs.extendSetting["grid.bottom"] = 24;
            temp_Data[0].comptAttrs.extendSetting["grid.right"] = 25;
            temp_Data[0].comptAttrs.extendSetting["grid.left"] = 25;
            temp_Data[0].comptAttrs.extendSetting["legend.top"] = 2;
            temp_Data[0].comptAttrs.extendSetting["legend.type"] = "scroll";
            temp_Data[0].comptAttrs.extendSetting["legend.pageButtonPosition"] = "start";
            if (temp_Data[0].type === "VeDoughnutPie") {
              temp_Data[0].comptAttrs.extendSetting["legend.top"] = 'middle';
              temp_Data[0].comptAttrs.extendSetting["legend.pageButtonPosition"] = null;
            }
            if (
              temp_Data[0].type === "VeRosePie" ||
              temp_Data[0].type === "VePie"
            ) {
              let layoutAttrs = temp_Data[0].styleAttrs.find((val)=>val.enName === "layoutAttrs").children;
              layoutAttrs.find((val)=>val.enName === "ringLineWidth").value = 5;
              let seriesRadius = layoutAttrs.find((val)=>val.enName === "series.0.radius");
              temp_Data[0].comptAttrs.extendSetting["series.0.radius"] = [
                '0%',
                "60%"
              ];
              if(seriesRadius.photoType === 'ring') {
                temp_Data[0].comptAttrs.extendSetting["series.0.radius"] = ["30%","60%"];
              }
              this.$set(temp_Data[0].comptAttrs.extendSetting,"series.0.center",['50%','50%'])
              this.$set(temp_Data[0].comptAttrs.extendSetting,"legend.type",'')
            }
            else if (temp_Data[0].type == "VeRadar") {
              temp_Data[0].comptAttrs.extendSetting["legend.top"] = "1%";
              this.$set(temp_Data[0].comptAttrs.extendSetting,"radar.center",['50%','55%'])
            }
            if (temp_Data[0].type == "VeCombineChart" || temp_Data[0].type === 'VeCombineStack') {
              temp_Data[0].comptAttrs.extendSetting['xAxis.0.axisLine.show'] = true
              temp_Data[0].comptAttrs.extendSetting['yAxis.0.axisLine.show'] = true
              temp_Data[0].comptAttrs.extendSetting['yAxis.1.axisLine.show'] = true
            }
            if (['VeLine', 'VeLineArea', 'VeStackLineArea', 'VePercentStackLineArea', 'VeHistogram', 'VeStackHistogram', 'VePercentStackHistogram', 'VeBar', 'VeStackBar', 'VePercentStackBar'].includes(temp_Data[0].type)) {
              temp_Data[0].comptAttrs.extendSetting['xAxis.0.axisLine.show'] = true
              temp_Data[0].comptAttrs.extendSetting['yAxis.0.axisLine.show'] = true
            }
            if (['VeTreemap'].includes(temp_Data[0].type)) {
              temp_Data[0].comptAttrs.extendSetting['legend.top'] = -100;
            }
            // 指标2 修改pc手机端的基础样式
            if (this.pageCache.classTypeId !== "1005" && temp_Data[0].type === 'HdKpiBlock2') {
              let extendSetting1 = temp_Data[0].comptAttrs.extendSetting;
              let styleAttrs1 = temp_Data[0].styleAttrs;
              [{
                enName: 'targetPriMetricFontColor',
                value: '#606266',
                parentIdx: 1 // 对应styleAttrs1的children索引
              }, {
                enName: 'priMetricFontColor',
                value: '#409eff',
                parentIdx: 2
              }].forEach(item => {
                  styleAttrs1[item.parentIdx].children.find(styleItem => styleItem.enName === item.enName).value = item.value;
                  extendSetting1[item.enName] = item.value;
              });
              temp_Data[0].compName = '翻牌器';
              temp_Data[0].comptAttrs.name = '翻牌器';
            }
          } else {
            this.$message.error(resp.data.respErrorDesc);
            return;
          }
        }

        if (
          this.pageCache.classTypeId == "1001002" &&
          ["ElDatagrid", "CrossTable"].includes(temp_Data[0].type)
        ) {
          let subAttrs = temp_Data[0].styleAttrs[3].children;
          let index = 4;
          if ((subAttrs[index] || {}).enName !== "needSms") {
            subAttrs.some((item, i) => {
              if (item.enName === "needSms") {
                index = i;
                return true;
              }
            });
          }
          temp_Data[0].styleAttrs[3].children.splice(index, 1);
        }
        d_cpts = objDeepCopy(temp_Data);
        d_cpts = d_cpts[0];
        // d_cpts = objDeepCopy(this.edcuiCompts[cid]);
        d_cpts["blockInfo"] = {};
        d_cpts["serviceId"] = "";
        if (d_cpts.type == "ElTabs") {
          d_cpts.comptAttrs.editableTabs.forEach(val => {
            val.name = getUUID();
          });
          d_cpts.comptAttrs.editableTabsValue =
            d_cpts.comptAttrs.editableTabs[0].name;
        }
      }
      d_cpts["comptId"] = uuid;
      d_cpts["orderId"] = this.comptOrder;
      initComptName(d_cpts); //初始化组件名称，不然撤销的时候名称会丢
      let gridWidth = 12;
      if (this.pageCache.classTypeId == "1001002") {
        //手机组件 拖入占满一行
        gridWidth = 24;
      }
      if (this.designType == 1) {
        var item = { x: 0, y: this.getLayoutY(), w: gridWidth, h: 28, i: uuid };
        if (compt != null) {
          d_cpts["blockInfo"].i = uuid;
          //item = d_cpts["blockInfo"];
        } else {
          if (d_cpts.type == "Query") {
            item.h = 14;
            item.w = 24;
          }
          d_cpts["blockInfo"] = item;
          this.layout.push(item);
        }
      }

      if (
        this.activedCompt.type == "ElTabs" ||
        this.activedCompt.type == "VanCollapse" ||
        this.activedCompt.type == "ElCarousel"
      ) {
        //当前选中了tab组件
        var target = this.activedCompt.comptAttrs;
        var tabId = target.editableTabsValue;
        d_cpts["blockInfo"] = { x: 0, y: 0, w: 12, h: 12, i: uuid };
        let tabPage = {};
        if (this.activedCompt.type == "ElCarousel") {
          tabPage = target.editableTabs[tabId];
        } else {
          for (let item1 of target.editableTabs) {
            if (item1.name == tabId) {
              tabPage = item1;
              break;
            }
          }
        }
        if (tabPage.comptList) {
          d_cpts.blockInfo.y = this.getSubLayoutY(tabPage.comptList);
          if (compt != null) {
            genComptName(d_cpts, tabPage.comptList);
          }
          tabPage.comptList.push(d_cpts);
        }
      } else {
        if (this.activedTab.length > 0) {
          //在tab容器内复制
          this.activedTab.push(d_cpts);
        } else {
          this.s_edcuiCompts.push(d_cpts);
          // 聚焦当前创建的组件
          this.$nextTick(() => {
            let ele = document.querySelector("#water-wrap .el-scrollbar__wrap");
            ele.scrollTop = ele.scrollHeight;
          });
        }
      }
      if (compt == null && d_cpts.type == "HdIconBlock") {
        //新增图标后，给宽高赋值
        /**
         * 源码计算方式
         * const colWidth = (this.containerWidth - (this.margin[0] * (this.cols + 1))) / this.cols;
         * width: w === Infinity ? w : Math.round(colWidth * w + Math.max(0, w - 1) * this.margin[0]),
         * height: h === Infinity ? h : Math.round(this.rowHeight * h + Math.max(0, h - 1) * this.margin[1])
         */
        const containerWidth = document.getElementsByClassName(
          "query-design"
        )[0].clientWidth; //获取grid-layout的宽度
        const colWidth = (containerWidth - 10 * (24 + 1)) / 24; //参照源码计算每份的宽度
        let iconBlockW = Math.round(
          colWidth * d_cpts["blockInfo"].w +
            Math.max(0, d_cpts["blockInfo"].w - 1) * 10
        );
        let iconBlockH = Math.round(
          1 * d_cpts["blockInfo"].h +
            Math.max(0, d_cpts["blockInfo"].h - 1) * 10
        );
        d_cpts.comptAttrs.maxWidth = iconBlockW - 12;
        d_cpts.comptAttrs.maxHeight = iconBlockH - 12;
      }
      // this.upComptNum("add");
      // if (this.s_edcuiCompts.length == 1) this.upActivedId(0);
      this.recordOpt({
        curPageId: this.activedPage,
        cmd: {
          commandName: "addCompt",
          dataBefore: JSON.stringify(objDeepCopy(this.s_edcuiCompts)) || [],
          comptInfo: {} //操作的组件
        },
        type: "undo"
      });
    },
    deleteCompt(cid) {
      this.$confirm("确认删除组件吗?", "提示", {
        closeOnClickModal: false,
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.checkIfNeedRecordFirst({
            dataBefore: JSON.stringify(this.s_edcuiCompts),
            pageId: this.activedPage
          });
          let isNeedRecord = false;
          //删除组件
          if (this.activedTab.length > 0) {
            for (var i = 0; i < this.activedTab.length; i++) {
              if (this.activedTab[i].comptId == cid) {
                this.activedTab.splice(i, 1);
                isNeedRecord = true;
                break;
              }
            }
          } else {
            const _compt = this.s_edcuiCompts;
            for (let i1 = 0; i1 < _compt.length; i1++) {
              if (cid == _compt[i1].comptId) {
                this.s_edcuiCompts.splice(i1, 1);
                isNeedRecord = true;
                break;
              }
            }
          }
          if (isNeedRecord) {
            this.recordOpt({
              curPageId: this.activedPage,
              cmd: {
                commandName: "delCompt",
                dataBefore:
                  JSON.stringify(objDeepCopy(this.s_edcuiCompts)) || [],
                comptInfo: {} //操作的组件
              },
              type: "undo"
            });
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    onDrag(x, y) {
      this.activedCompt["blockInfo"]["x"] = x;
      this.activedCompt["blockInfo"]["y"] = y;
    },
    onResize(x, y, width, height) {
      this.activedCompt["blockInfo"]["x"] = x;
      this.activedCompt["blockInfo"]["y"] = y;
      this.activedCompt["blockInfo"]["h"] = height;
      this.activedCompt["blockInfo"]["w"] = width;
      // const _dr = "dr"+this.activedCompt.comptId
      // this.$refs[_dr][0].w = 1600
    },
    onResizstop: function(i, newH, newW, newHPx, newWPx) {},
    setScale() {
      var _w = this.$refs.optBox.clientWidth;
      // var _h = window.innerHeight;
      this.w_trans = _w / 1366;
      // var h_trans = _h/winHeit
      document.getElementById("opt-box").style.transform =
        "scale(" + this.w_trans + ")";
      document.getElementById("opt-box").style.transformOrigin = "0 0";
      // document.getElementsByClassName('draw-center')[0].style.transform = 'scaleY('+h_trans+')'
    },
    toPrew() {
      this.pageCache.operation = "wait";
      this.pageCache.pageName = this.pageName;

      // console.info(this.pageCache.pageId);
      //进行操作日志记录
      if (this.pageCache.pageId != undefined) {
        //表示页面已经保存可以进行预览
        var pageParam = Object.assign({
          objId: this.pageCache.pageId,
          operateUser: window.sessionStorage.getItem("user_id"),
          operateObj: this.menuClassTypeId,
          operateType: 5,
          result: 1
        });
        this.addOptlog(pageParam)
          .then(val => {})
          .catch(err => {
            console.error(err);
          });
      }

      //预览界面跳转
      // this.$router.push({
      //   path: "/preview",
      //   name: "preview"
      // });
      this.nowPage["classTypeId"] = this.pageCache.classTypeId;
      this.nowPage["operation"] = "wait";
      sessionStorage.setItem("pageCache", JSON.stringify(this.nowPage));
      if(!!window.ActiveXObject || "ActiveXObject" in window) {
        this.storeVuexStore([
          "contextUrl",
          "defaultSystemId",
          "commonProperties",
          "HomeTree",
          "HomeBody",
          "PageDesign",
          "AnalyReportAttr"
        ]);
        let routeData = this.$router.resolve({ name: "pageView" }); //query: { timestamp: getTimestamp }
        window.open(routeData.href, "_blank");
        this.pageCache.operation = "design"; //重置该页编辑状态
			} else {
        this.storeVuexStore([
          "contextUrl",
          "defaultSystemId",
          "commonProperties",
          "HomeTree",
          "HomeBody",
          "PageDesign",
          "AnalyReportAttr"
        ]).then(val => {
          let routeData = this.$router.resolve({ name: "pageView" }); //query: { timestamp: getTimestamp }
          window.open(routeData.href, "_blank");
          this.pageCache.operation = "design"; //重置该页编辑状态
        })
      }
    },
    toSave(e, isFromSaveAs) {
      if (!isFromSaveAs) {
        //保存
        if (this.pageName.replace(/\s*/g, "") == "") {
          this.$message.warning("请填写页面名称");
          this.toSaveInput = true;
          this.$refs.toSaveBtn.focus();
          return;
        }

        this.toSaveInput = false;
      } else {
        //另存（先算出主页面ID和名称）
        var saveAsMainPageId; //另存的主页面ID
        var saveAsMainPageName; //另存的主页面名称
        for (let page of this.pageList) {
          if (page.parentId == "0") {
            // saveAsMainPageId = getUUID();
            saveAsMainPageId = page.pageId; //原始父亲id
            saveAsMainPageName = this.saveForm.pageName;
          }
        }
      }
      this.loadingNew = true;

      let reqObj = [];
      for (let page of this.pageList) {
        let saveAsPageId; //另存的pageId
        let saveAsPageName; //另存的pageName
        if (page.parentId == "0") {
          //主页面
          saveAsPageId = saveAsMainPageId;
          saveAsPageName = saveAsMainPageName;
        } else {
          //子页面
          // saveAsPageId = getUUID();
          saveAsPageId = page.pageId;
          saveAsPageName = page.pageName;
        }
        var saveAsCatalogId = this.saveForm.catalogId[
          this.saveForm.catalogId.length - 1
        ]; //另存的目录ID

        let temp = {};
        let pageInfo = {
          catalogId: !isFromSaveAs ? this.pageCache.catalogId : saveAsCatalogId,
          classTypeId: this.pageCache.classTypeId,
          layoutType: this.pageCache.layoutType,
          createUser: window.sessionStorage.getItem('user_id'),
          tenantId: window.sessionStorage.getItem('tenant_id'),
          status: 0,
          updateUser: sessionStorage.getItem("user_id")
        };

        pageInfo.pageId = page.pageId;
        pageInfo.pageName = !isFromSaveAs ? page.pageName : saveAsPageName;
        if (isFromSaveAs) {
          //另存
          if (page.parentId != "0") {
            pageInfo.parentId = saveAsMainPageId;
          } else {
            pageInfo.parentId = page.parentId;
          }
        } else {
          //保存
          pageInfo.parentId = page.parentId;
        }
        pageInfo.orderId = page.orderId;
        pageInfo.pageType = page.pageType;
        pageInfo.bgClor = page.bgClor;
        pageInfo.isWatermark = page.isWatermark;
        pageInfo.pageSetting = {
          pageId: !isFromSaveAs ? page.pageId : saveAsPageId,
          bgImg: page.bgImg,
          bgimgId: page.bgImageName,
          pageParams: JSON.stringify(page.pageParams || []),
          specEffect: page.bgEffects || "",
          width: page.width || "",
          height: page.height || ""
        };
        temp.pageInfo = pageInfo;
        let pageDetail = [];
        let compts = page.pageDetail;
        for (let val of compts) {
          // let saveAsElementId = getUUID(); //另存为的elmentId
          // let saveAsElementId = val.getElementId; //另存为的elmentId   ---原始值
          let comp = {};
          comp.pageId = !isFromSaveAs ? page.pageId : saveAsPageId;
          comp.afId = val.afId;
          if (isFromSaveAs) {
            val.blockInfo.i = val.comptId; //如果是另存操作，需重新生成ElemenId
          }
          comp.blockInfo = JSON.stringify(val.blockInfo);
          let comptAttrs = this.clearComptSetting(objDeepCopy(val));

          //清除下拉框下拉列表数据
          (comptAttrs.fieldList || []).forEach(list => {
            if (list.type === "ElCascader") {
              if (list.comptAttrs.options) {
                list.comptAttrs.options = [];
              }
              if (list.comptAttrs.options2) {
                list.comptAttrs.options2 = [];
              }
            }
          });

          comp.compAttrs = JSON.stringify(comptAttrs);
          comp.styleAttrs = JSON.stringify(val.styleAttrs);
          comp.elementId = val.comptId; //如果是另存操作，需重新生成ID
          comp.orderId = val.orderId;
          comp.compType = val.type;
          pageDetail.push(comp);
        }
        temp.pageDetailList = pageDetail;
        reqObj.push(temp);
      }
      this.clearUpdated();  //保存前清空组件中的updated属性
      if (!isFromSaveAs) {
        //新增部分
        this.saveUpdatePageAndDetail(reqObj)
          .then(val => {
            if (val.status === 200 && val.data.respResult === "1") {
              //取pageId,pageName
              for (let temp of reqObj) {
                if (temp.pageInfo.parentId == "0") {
                  //主页面
                  this.pageCache.pageId = temp.pageInfo.pageId;
                  this.pageCache.pageName = temp.pageInfo.pageName;
                }
              }

              document.title = this.pageCache.pageName;
              sessionStorage.setItem("pageCache", JSON.stringify(this.pageCache));
              this.$message.success(
                "页面" + (isFromSaveAs ? "另存成功" : "保存成功")
              );
              if (isFromSaveAs) {
                this.pageCache.pageId = saveAsMainPageId;
                this.toLoad();
              }
              /*this.pageCache.pageId = val.data.respData.pageId;
                  window.sessionStorage.setItem("pageCache",JSON.stringify(this.pageCache));
                  this.$message.success("页面保存成功"); */
            } else {
              this.$message.error(val.data.respErrorDesc);
              this.pageCache.pageId = null;
            }
            this.loadingNew = false;
          })
          .catch(err => {
            this.pageCache.pageId = null;
            // this.$message.error(
            //   "页面" + (isFromSaveAs ? "另存失败" : "保存失败")
            // );
            this.loadingNew = false;
          });
      } else {
        //另存为
        this.saveAs4PageDetail(reqObj)
          .then(val => {
            if (val.status === 200 && val.data.respResult === "1") {
              var topPageId;
              //取pageId,pageName
              for (let temp of val.data.respData) {
                if (temp.pageInfo.parentId == "0") {
                  //主页面
                  topPageId = temp.pageInfo.pageId;
                  this.pageCache.pageId = temp.pageInfo.pageId;
                  this.pageCache.pageName = temp.pageInfo.pageName;
                  this.pageCache.isDemo = '0'; // 另存后的页面都不属于案例
                }
              }

              document.title = this.pageCache.pageName;
              sessionStorage.setItem("pageCache", JSON.stringify(this.pageCache));
              this.$message.success(
                "页面" + (isFromSaveAs ? "另存成功" : "保存成功")
              );
              if (isFromSaveAs) {
                this.pageCache.pageId = topPageId;
                this.toLoad();
              }
            } else {
              this.$message.error(val.data.respErrorDesc);
              this.pageCache.pageId = null;
            }
            this.loadingNew = false;
          })
          .catch(err => {
            this.pageCache.pageId = null;
            this.loadingNew = false;
            // this.$message.error(
            //   "页面" + (isFromSaveAs ? "另存失败" : "保存失败")
            // );
          });
      }
    },
    toLoad() {
      var pageId = this.pageCache.pageId;
      var operation = this.pageCache.operation;
      if (operation == "wait") {
        return;
      }
      if (pageId != null) {
        var pageParam = Object.assign({
          pageId: pageId,
          createUser: window.sessionStorage.getItem("user_id"),
          classTypeId: this.menuClassTypeId,
          preViewFalg: "0", //1-记录操作日志标志    0-不记录操作日志
          isNeedDemo: this.pageCache.isDemo // 案例
        });

        this.queryPageFatherSonDetailList(pageParam)
          .then(val => {
            if (val.status == 200 && val.data.respResult == 1) {
              var pageList = val.data.respData;
              var param1 = [];
              var afIds = [];
              if (pageList.length > 0) {
                let res = handlePageList(pageList);
                param1 = res.pages || [];
                var drillFieldList = res.drillFieldList || [];
              }
              this.pageName = param1[0].pageName;
              this.$store.commit("PageDesign/setPageListAndScompts", param1);
              afIds = this.comptAfIds;
              if (afIds != undefined && afIds.length > 0) {
                this.queryDSDetailList(afIds, drillFieldList);
              }
            } else {
              // this.$message.error("页面信息查询失败");
            }
          })
          .catch(err => {
            // this.$message.error("页面信息查询异常");
            console.error(err);
          });
      } else {
        var param = {
          pageId: getUUID(),
          pageName: "未命名" + this.pageIndex,
          pageDetail: [],
          parentId: 0,
          orderId: this.pageOrder++,
          pageType: "1",
          bgClor: "",
          isWatermark: "0",
          bgImg: "",
          bgImageName: ""
        };
        this.$store.commit("PageDesign/resetTemplate", param);
        this.pageName = this.pageList[0].pageName;
        // 初始时候先记录一次
        this.initPageSnapshots({
          pageId: param.pageId,
          dataBefore: JSON.stringify(objDeepCopy(param.pageDetail))
        });
      }
    },
    generateTree(data, list) {
      var tree = [];
      for (var i = 0; i < list.length; i++) {
        var temp = list[i];
        if (temp.parentCatalogId == data.catalogId) {
          var obj = {};
          obj.value = temp.catalogId;
          obj.id = temp.catalogId;
          obj.label = temp.catalogName;
          obj.level = 2;
          obj.typeId = temp.classTypeId;
          obj.parentId = temp.parentCatalogId;
          tree.push(obj);
        }
      }
      return tree;
    },
    getCatalogData() {
      //获取目录最新数据
      var ctid = this.menuClassTypeId; //分类id
      var user_id = window.sessionStorage.getItem("user_id");
      var param = {
        classTypeId: ctid,
        createUser: user_id
      };
      this.queryTreeData(param)
        .then(val => {
          if (val.status == 200 && val.data.respResult == 1) {
            var _this = this;
            var list = val.data.respData;
            if (list.length > 0) {
              var result = [];
              var first = [],
                second = [];
              list.forEach(function(val1) {
                if (val1.parentCatalogId == "myfold") {
                  if (_this.myFolder != "0") {
                    //0：隐藏 1：显示
                    first.push(val1);
                  }
                } else {
                  second.push(val1);
                }
              });
              first.forEach(val2 => {
                var temp1 = {};
                temp1.value = val2.catalogId;
                temp1.id = val2.catalogId;
                temp1.label = val2.catalogName;
                temp1.level = 1;
                temp1.typeId = val2.classTypeId;
                temp1.parentId = val2.parentCatalogId;
                let children = this.generateTree(val2, second);
                if (children.length > 0) {
                  temp1.children = children;
                } else {
                  temp1.children = [];
                }

                result.push(temp1);
              });
            }
          } else {
            this.$message.error("目录查询失败");
          }
          //将树集合设置到容器中
          var obj = {
            result: result,
            myFolder: this.myFolder
          };
          //设置值
          this.setTreeList(obj);

          //将treedata进行过滤
          var temp = "";
          this.treeData.forEach(function(val2) {
            //forEach不能使用this否则会包指向不对
            if (val2.value == "myfold") {
              temp = val2;
            }
          });
          //最后将值进行设置
          this.saveToTreeData.push(temp);
        })
        .catch(err => {
          console.error(err);
          // this.$message.error("文件夹查询异常");
        });
    },

    toSaveAs() {
      this.getCatalogData();
      this.saveToTreeData.splice(0, this.saveToTreeData.length);
      this.saveForm.pageName = this.pageName;
      this.dialogSaveAs = true;
      this.saveForm.catalogId = [];
      this.$nextTick(() => {
        this.$refs.saveForm.clearValidate();
      });
    },
    saveAsSubmit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          // var catalogId = this.saveForm.catalogId[
          // this.saveForm.catalogId.length - 1
          //   ];
          // var pageName = this.saveForm.pageName;
          //
          // var pageId = "";
          // var param = [];
          // this.s_edcuiCompts[1].comptAttrs.columns = this.tableColumn;
          // for (var val of this.s_edcuiCompts) {
          //   var temp = {};
          //   temp.pageId = pageId;
          //   temp.afId = val.afId;
          //   temp.blockInfo = JSON.stringify(val.blockInfo);
          //   temp.compAttrs = JSON.stringify(val.comptAttrs);
          //   temp.elementId = val.comptId;
          //   temp.compType = val.type;
          //   param.push(temp);
          // }
          // var reqObj = { pageInfo: {} };
          // reqObj.pageInfo.classTypeId = this.menuClassTypeId;
          // reqObj.pageInfo.pageId = pageId;
          // reqObj.pageInfo.pageName = pageName;
          // reqObj.pageInfo.catalogId = catalogId;
          // reqObj.pageInfo.status = 0;
          // reqObj.pageInfo.createUser = sessionStorage.getItem("user_id");
          // reqObj.pageInfo.tenantId = sessionStorage.getItem("tenant_id");
          // reqObj.pageDetailList = param;
          // this.saveAsPage(reqObj)
          //   .then(val => {
          //     if (val.status === 200 && val.data.respResult === "1") {
          //       this.$message.success("页面另存成功");
          //       this.dialogSaveAs = false;
          //     } else {
          //       this.$message.error(val.data.respErrorDesc);
          //     }
          //   })
          //   .catch(err => {
          //     this.$message.error("页面另存异常");
          //   });
          this.toSave(null, true);
          this.dialogSaveAs = false;
        } else {
          return false;
        }
      });
    },

    upBlock(index) {
      //组件选中触发
      /* for (var i = 0; i < this.edcuiCompts.length; i++) {
          this.$set(this.querygrid,i,false);
          if (index == i) {
            this.$set(this.querygrid,i,true);
          }
        } */
      this.upActivedBlock(index);
      // this.activedBlock = index;
      this.upActivedId(index);
      this.upActivedTab([]);
      // 未比对过第一次需要比对
      if(!this.activedCompt.updated) {
        this.updateCompt(this.activedCompt,this.pageCache.classTypeId);
      }
      // 对于有绑定数据的组件，点击默认展示数据面板，对于只有样式设置的组件默认展示样式面板
      this.$nextTick(() => {
        this.refreshRightPanel();
      });
    },
    ...mapMutations({
      upComptNum: "PageDesign/upComptNum",
      upActivedId: "PageDesign/upActivedId",
      getEdcuiCompts: "PageDesign/getEdcuiCompts",
      setSedcuiCompts: "PageDesign/setSedcuiCompts",
      setPageDetail: "PageDesign/setPageDetail",
      addPageList: "PageDesign/addPageList",
      pageResort: "PageDesign/pageResort",
      setTreeList: "HomeTree/setTreeList",
      upIsDSMapReady: "AnalyReportAttr/upIsDSMapReady",
      upDimInfoMap: "AnalyReportAttr/upDimInfoMap",
      setActivedPage: "PageDesign/setActivedPage",
      upActivedBlock: "PageDesign/upActivedBlock",
      upActivedTab: "PageDesign/upActivedTab",
      upParamSetDiaVis: "PageDesign/upParamSetDiaVis",
      recordCommand: "OptStack/recordCommand",
      clearSnapshots: "OptStack/clearSnapshots",
      setComptMenu: "PageDesign/setComptMenu"
    }),
    ...mapActions({
      getEdcuiCompts: "PageDesign/getEdcuiCompts",
      queryPageCompts: "PageDesign/queryPageCompts",
      addOptlog: "PageDesign/addOptlog",
      setPageCache: "HomeBody/setPageCache",
      saveAsPage: "HomeBody/saveAsPage",
      saveUpdatePageAndDetail: "PageDesign/saveUpdatePageAndDetail",
      saveAs4PageDetail: "PageDesign/saveAs4PageDetail",
      queryPageFatherSonDetailList: "PageDesign/queryPageFatherSonDetailList",
      queryTreeData: "HomeTree/queryTreeData", //获取树最新数据
      queryDatasetDetailList: "AnalyReportAttr/queryDatasetDetailList",
      queryDimInfoList: "AnalyReportAttr/queryDimInfoList",
      setActiveName: "PageDesign/setActiveName",
      emitUndoRedo: "OptStack/emitUndoRedo",
      checkIfNeedRecordFirst: "OptStack/checkIfNeedRecordFirst",
      initPageSnapshots: "OptStack/initPageSnapshots",
      executeRedoAndUndo: "OptStack/executeRedoAndUndo",
      refreshRightPanel: "PageDesign/refreshRightPanel",
      queryDbColConf: "DataSetDesign/queryDbColConf", //查询数据集信息
      queryDateFormatList: "DataSetDesign/queryDateFormatList", //日期源格式查询
      storeVuexStore: "storeVuexStore",
      getCompLists: "PageDesign/getCompLists",
      uptdistance: "PageDesign/uptdistance",
      setExtenddata: "PageDesign/setExtend",
      qryStyleAttrs: "PageDesign/qryStyleAttrs"
    }),
    queryDSDetailList(afIds, drillFieldList) {
      var drillFieldArr = [];
      var _this = this;
      _this.queryDbColConf({}).then(response => {
        if (response.status == 200 && response.data.respResult == "1") {
          _this.fieldTypeList = response.data.respData || {};
          _this.queryDateFormatList({}).then(response2 => {
            if (response2.status == 200 && response2.data.respResult == "1") {
              _this.formatList = response2.data.respData || [];
              this.queryDatasetDetailList({ af_id_list: afIds })
                .then(function(response1) {
                  if (response1.data.respResult == 1) {
                    let dsArr = [];
                    dsArr = response1.data.respData;
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
                            data.af_name,
                            _this.fieldTypeList,
                            _this.formatList
                          )
                        );
                      }
                      if (drillFieldList.length > 0) {
                        for (
                          let index = 0;
                          index < drillFieldList.length;
                          index++
                        ) {
                          let curField =
                            _this.datasetMap[drillFieldList[index].af_id];
                          curField = curField.filter(item => {
                            return (
                              item.element_id ==
                              drillFieldList[index].element_id
                            );
                          });
                          if (
                            curField.length > 0 &&
                            (curField[0].dim_id || "").trim() != "" &&
                              curField[0].dim_id != "0" &&
                            (curField[0].dim_level_id || "").trim() != "" &&
                              curField[0].dim_level_id != "0"
                          ) {
                            drillFieldArr.push(curField[0]);
                          }
                        }
                        if (drillFieldArr.length > 0) {
                          _this.queryDimList(drillFieldArr);
                        }
                      }
                      _this.upIsDSMapReady(true);
                    } else {
                      _this.$message.error("数据集详情列表查询失败");
                    }
                  } else {
                    _this.$message.error("数据集详情列表查询失败");
                  }
                })
                .catch(function(error) {
                  console.error(error);
                  // _this.$message.error("数据集详情列表查询失败");
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
    queryDimList(drillFieldArr) {
      var _this = this;
      this.queryDimInfoList({ dim_level_list: drillFieldArr })
        .then(response => {
          let responseData = response.data.respData || [];
          if (
            response.data.respResult == 1 &&
            response.data.dataTotalCount > 0 &&
            responseData.length > 0
          ) {
            for (let index = 0; index < responseData.length; index++) {
              if (typeof _this.dimInfoMap.set != "function") {
                _this.upDimInfoMap({
                  type: "reset",
                  data: new Map()
                });
              }
              if (
                responseData[index] &&
                responseData[index]["dim_level_list"] != undefined &&
                responseData[index]["dim_level_list"].length > 0
              ) {
                _this.upDimInfoMap({
                  type: "set",
                  key: responseData[index].dim_level_list[0].dim_level_id,
                  data: responseData[index].dim_level_list || []
                });
              }
            }
          } else {
            _this.$message.error("查询维层列表信息失败");
            console.error(response.data.respErrorDesc);
          }
        })
        .catch(error => {
          // _this.$message.error("查询维层列表信息失败");
          console.error(error);
        });
    },
    setMobileScale() {
      if (
        this.pageCache.classTypeId == "1001002" &&
        window.innerHeight < this.MOBILE_HEIGHT + 120
      ) {
        //667+50头+40头部操作栏+30下边tab切换+40
        this.scaleRate = window.innerHeight / (this.MOBILE_HEIGHT + 160);
      } else {
        this.scaleRate = 1;
      }
    },
    addTabCompt(activedTab, compt) {
      let d_cpts = {};
      let uuid = getUUID();
      if (compt != null) {
        d_cpts = objDeepCopy(compt);
      }
      d_cpts["comptId"] = uuid;
      d_cpts["orderId"] = this.comptOrder;
      d_cpts.blockInfo.i = uuid;
      activedTab.push(d_cpts);
    },
    deleteTabCompt(activedTab, id) {
      for (let [idx, val] of activedTab.entries()) {
        if (val.comptId == id) {
          activedTab.splice(idx, 1);
          break;
        }
      }
    },
    clearComptSetting(val) {
      let comptAttrs = val.comptAttrs;
      if (
        comptAttrs["linkageCondi"] != undefined &&
        comptAttrs["linkageCondi"].length > 0
      ) {
        //保存时清除联动条件
        comptAttrs["linkageCondi"] = [];
      }
      // 保存时清除钻取条件
      comptAttrs["curDrillIdx"] = 0;
      comptAttrs["drillWBeanList"] = [];
      if (val.type == "Query" || val.type == "MobileQuery") {
        //查询组件保存时需把条件清空
        let condiFields = objDeepCopy(comptAttrs.fieldList);
        for (var k = 0; k < condiFields.length; k++) {
          //查询组件保存时有默认值的直接填上
          if (condiFields[k].type == "ElInput") {
            condiFields[k].comptAttrs.m_value = "";
            if (
              condiFields[k].comptAttrs.isSetDefault &&
              !condiFields[k].comptAttrs.is_import &&
              condiFields[k].comptAttrs.default_value != undefined &&
              condiFields[k].comptAttrs.defaultSymbol != undefined
            ) {
              condiFields[k].comptAttrs.m_value =
                condiFields[k].comptAttrs.default_value;
              condiFields[k].comptAttrs.symbol =
                condiFields[k].comptAttrs.defaultSymbol;
            }
          } else if (condiFields[k].type == "ElNumber") {
            if (condiFields[k].comptAttrs.numList.length == 1) {
              condiFields[k].comptAttrs.numList = [{ id: "0", m_value: "" }];
            } else {
              condiFields[k].comptAttrs.numList = [
                { id: "1", m_value: "" },
                { id: "1", m_value: "" }
              ];
            }
            if (
              condiFields[k].comptAttrs.isSetDefault &&
              !condiFields[k].comptAttrs.is_import &&
              condiFields[k].comptAttrs.defaultNumList != undefined
            ) {
              condiFields[k].comptAttrs.defaultNumList.forEach((item, i) => {
                var num = objDeepCopy(item);
                this.$set(condiFields[k].comptAttrs.numList, i, num);
              });
            }
          } else if (condiFields[k].type == "ElCascader") {
            condiFields[k].comptAttrs.m_value = [];
            if (condiFields[k].comptAttrs.treeSelVal) {
              condiFields[k].comptAttrs.treeSelVal = [];
            }
          } else if (condiFields[k].type == "ElDatePicker") {
            if (
              condiFields[k].comptAttrs.isSetDefault == undefined ||
              condiFields[k].comptAttrs.isSetDefault == false
            ) {
              condiFields[k].comptAttrs.m_value =
                condiFields[k].comptAttrs.m_value.length == 2 ? ["", ""] : [""];
            }
          }
        }
        comptAttrs.fieldList = condiFields;
      }
      if (val.type == "ElDatagrid") {
        //表格分页需重置到第一页
        comptAttrs.extendSetting["pagination.currentPage"] = 1;
      }
      if (val.comptData != undefined) {
        delete val.comptData;
      }
      if (
        val.type == "ElTabs" ||
        val.type == "VanCollapse" ||
        val.type == "ElCarousel"
      ) {
        let tabCompts = this.getTabCompts(val);
        for (let compt of tabCompts) {
          compt.comptAttrs = this.clearComptSetting(compt);
        }
      }
      return comptAttrs;
    },
    // 显示隐藏组件模版选择面板
    toggleCompList(flag, isInCompPanel = false) {
      //isInCompPanel--是否在光标
      this.comptListShow = flag;
      if (!flag) {
        //若是要隐藏面板，则图标选中状态也得置空
        // this.comptPanelId = "";
        this.$nextTick(() => {
          if (!this.comptListShow) {
            this.comptPanelId = "";
          }
        });
      }
    },
    pageTabOnMove(evt) {
      // 限制主页面不能拖
      if (evt.draggedContext.index == 0) {
        this.$message.closeAll();
        this.$message.warning("主页面无法拖动");
        return false;
      } else if (
        evt.draggedContext.index != 0 &&
        evt.draggedContext.futureIndex == 0
      ) {
        //其他不能拖到第一个
        return false;
      } else {
        return true;
      }
    },
    // 每次保存操作，都要强制更新一下，不然undo ,redo那两个图标对状态不会更新
    recordOpt(commandData) {
      this.recordCommand(commandData);
      this.$forceUpdate();
    },
    movedEvent(i, newX, newY) {
      this.recordOpt({
        curPageId: this.activedPage,
        cmd: {
          commandName: "moveCompt",
          dataBefore: JSON.stringify(objDeepCopy(this.s_edcuiCompts)),
          comptInfo: {}
        },
        type: "undo"
      });
    },
    moveEvent(i, newX, newY) {
      this.checkIfNeedRecordFirst({
        dataBefore: JSON.stringify(this.s_edcuiCompts),
        pageId: this.activedPage
      });
    },
    resizeEvent(i, newH, newW, newHPx, newWPx) {
      this.checkIfNeedRecordFirst({
        dataBefore: JSON.stringify(this.s_edcuiCompts),
        pageId: this.activedPage
      });
    }
  },
  watch: {
    isWatermark(val) {
      if (val == 1) {
        let flag = this.pageCache.classTypeId == "1001002" ? true : false;
        this.$Watermark.set("water-wrap", 60, 20, -40, 0, flag);
      } else {
        this.$Watermark.unset();
      }
    }
  },
  computed: {
    pageIndex() {
      let idList = [];
      if (this.pageList.length > 0) {
        let reg = /^未命名(\d+)$/;
        for (var item of this.pageList) {
          if (reg.test(item.pageName)) {
            idList.push(item.pageName.match(/\d+/g)[0]);
          }
        }
        if (idList.length > 0) {
          let res;
          for (let i = 1; i <= this.pageList.length + 1; i++) {
            if (idList.indexOf(i + "") < 0) {
              res = i;
              break;
            }
          }
          return res;
        } else {
          return 1;
        }
      } else {
        return 1;
      }
    },
    isQuery() {
      var result = false;
      if (this.designType == 1) {
        // 即席查询
        result = true;
      }
      return result;
    },
    pageList: {
      get() {
        return this.$store.state.PageDesign.pageList;
      },
      set(value) {
        this.$store.commit("PageDesign/setPageList", value);
      }
    },
    isWatermark() {
      return this.nowPage.isWatermark;
    },
    ...mapState({
      edcuiCompts: state => state.PageDesign.edcuiCompts,
      edcuiComptsMenu: state => state.PageDesign.edcuiComptsMenu,
      s_edcuiCompts: state => state.PageDesign.s_edcuiCompts,
      comptNum: state => state.PageDesign.comptNum,
      designType: state => state.PageDesign.designType,
      pageCache: state => state.HomeBody.pageCache,
      loading: state => state.PageDesign.loading,
      treeData: state => state.HomeTree.treeData,
      menuClassTypeId: state => state.HomeTree.menuClassTypeId,
      activedNum: state => state.PageDesign.activedNum,
      dimInfoMap: state => state.AnalyReportAttr.dimInfoMap,
      datasetMap: state => state.AnalyReportAttr.datasetMap,
      activedPage: state => state.PageDesign.activedPage,
      activedBlock: state => state.PageDesign.activedBlock,
      activedTab: state => state.PageDesign.activedTab,
      snapshots: state => state.OptStack.snapshots,
      cursor: state => state.OptStack.cursor
    }),
    ...mapGetters({
      activedCompt: "PageDesign/getActivedCompt",
      layout: "PageDesign/getLayout",
      nowPage: "PageDesign/getActivedPage",
      getTabCompts: "PageDesign/getTabCompts",
      comptAfIds: "PageDesign/getComptAfIds",
      comptOrder: "PageDesign/latestOrderId"
    })
  },
  created() {
    let param = {
      classTypeId: this.pageCache.classTypeId
    };
    this.getCompLists(param)
      .then(resp => {
        if (resp.status == 200 && resp.data.respResult == "1") {
          let list = resp.data.respData || [];
          // 临时
          // 菜单这边pc和手机端的指标2组件名称改为翻牌器
          if (list[8].children.some(item => item.compType === 'HdKpiBlock2')) {
            list[8].children.find(item => item.compType === 'HdKpiBlock2').compName = '翻牌器';
          }
          // 临时
          this.setComptMenu(list);
        } else {
          this.$message.error("查询组件菜单失败");
        }
      })
      .catch(err => {
        console.log(err);
      });
  },
  mounted() {
    this.upActivedBlock("");
    let pc = sessionStorage.getItem('pageCache');
    let pageInfo = JSON.parse(pc);
    this.setPageCache(pageInfo);
    let homeMenu = JSON.parse(window.sessionStorage.getItem("homeMenu")) || [];
    let pageTit = "内容定制";
    for (let index = 0; index < homeMenu.length; index++) {
      let typeId = this.pageCache.classTypeId.substr(
        0,
        (homeMenu[index].classTypeId || "").toString().length
      );
      if (typeId.indexOf(homeMenu[index].classTypeId) > -1) {
        pageTit = homeMenu[index].menuName;
        break;
      }
    }
    this.ctid = this.pageCache.classTypeId;
    document.title = this.pageCache.pageName || `新增${pageTit}`;
    var _this = this;
    // window.sessionStorage.removeItem("pageCache");
    if (this.pageCache == null) {
      this.$router.push({
        path: "/",
        name: ""
      });
    }
    // 读取组件属性配置
    // this.getEdcuiCompts();

    if (this.designType == 0) {
      // 监听窗口resize
      this.setScale();
      window.onresize = () => {
        this.setScale();
      };
    }
    if (this.pageCache.classTypeId == "1001002") {
      let dom = this.$refs.designBody.$el;
      dom.style.paddingTop = '40px';
      dom.style.paddingBottom = '30px';
      // this.setMobileScale();
      // window.onresize = () => {
      //   this.setMobileScale();
      // };
    }
    document.body.addEventListener("click", () => {
      _this.contextMenuShow = false;
      _this.comptListShow = false;
      this.comptPanelId = "";
    });
    document.querySelector(".query-design").addEventListener("click", () => {
      _this.upActivedBlock("");
      _this.upActivedId({});
      _this.upActivedTab([]);
    });
    eventBus.$on("addTabCompt", this.addTabCompt);
    eventBus.$on("deleteTabCompt", this.deleteTabCompt);
  },
  activated() {
    this.toSaveInput = false;
    this.toLoad(); //页面进来就加载数据
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
      float: left;
      width: 230px;

      /deep/ .el-input__inner {
        border-color: $border-clr1;
        background-color: $border-clr1;
        color: $font-clr1;

        &::-webkit-input-placeholder {
          color: $font-clr2;
        }

        &:focus {
          border-color: $main-color;
        }
      }
    }

    .page-input {
      /deep/ .el-input__inner {
        animation: glow 800ms ease-out infinite alternate;
      }

      @keyframes glow {
        from {
          border: 1px solid $border-clr1;
        }
        to {
          border: 1px solid #45fffd;
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

.compt-icons {
  margin-left: 75px;
  float: left;
  padding-top: 4px;
  height: 50px;

  .compt-icons-cell {
    cursor: pointer;
    display: inline-block;
    margin-left: 40px;
    position: relative;

    .triangle {
      display: none;
      position: absolute;
      bottom: -2px;
      color: #fff;
      right: 2px;
      // z-index: 2013;
      font-size: 17px;
    }

    .compt-list {
      display: none;
    }

    &:hover,
    &.actived {
      .el-tooltip {
        color: #409eff;
      }
    }

    &.actived {
      .triangle {
        display: block;
      }
      .compt-list {
        display: block;
      }
    }
  }

  .el-tooltip {
    color: #afc0d0;
    font-size: 20px;
  }
}

.design-toolbar {
  position: absolute;
  width: 100%;
  height: 40px;
  top: 0;
  left: 0;
  background: #2f5377;

  .expend-btn {
    width: 20px;
    height: 100%;
    float: left;
    color: #afc0d0;
    line-height: 40px;
    text-align: center;
    background: #0e3b67;
    font-size: 13px;
    cursor: pointer;
  }
}

.right-btn {
  float: right;
  height: 100%;
  font-size: 13px;
  line-height: 40px;
  color: #afc0d0;
  margin-right: 15px;

  & > div {
    float: left;
  }

  .right-btn-item {
    margin-left: 5px;

    .el-tooltip {
      cursor: pointer;
      padding: 5px;
      border-width: 1px;
      border-style: solid;
      border-color: transparent;
      background-color: transparent;
      border-radius: 5px;

      &:hover,
      &.active {
        border-color: #409cfb;
        background: #409cfb;
        color: #fff;
      }
    }

    &.disabled {
      .el-tooltip {
        cursor: not-allowed;
        &:hover,
        &.active {
          border-color: transparent;
          background: transparent;
          color: #afc0d0;
        }
      }
    }
  }

  .right-btn-line {
    width: 1px;
    height: 100%;
    padding: 8px 0;
    margin-left: 15px;
    margin-right: 10px;

    span {
      display: block;
      width: 100%;
      height: 100%;
      background: #0a2b4c;
    }
  }
}

.design-footbar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 30px;
  background: #c0c4cc;
  overflow: hidden;

  .page-tabs {
    height: 100%;
    position: absolute;
    left: 10px;
    right: 275px;

    & > div {
      float: left;
    }

    .page-tab-slide {
      overflow: hidden;
      left: 44px;
      right: 15px;
      position: absolute;

      .slide-wrap {
        width: 1500px;
        transition: transform 0.5s ease-in-out;

        & > div {
          float: left;
          height: 100%;
          line-height: 30px;
          text-align: center;
          color: #606266;
        }
      }
    }
  }

  .page-tab {
    cursor: pointer;
    width: 100px;
    border-right: 1px solid #fff;
    padding: 0 5px;

    &:first-child {
      border-left: 1px solid #fff;
    }

    &:hover,
    &.active {
      background: #fff;
      color: #0a2b4c;
    }

    span {
      width: 100%;
      display: block;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    &.sortable-ghost {
      opacity: 0.8;
      background: #c8ebfb;
    }
  }

  .prev-btn {
    cursor: pointer;
    height: 100%;
    line-height: 32px;
    color: #fff;

    &:hover {
      color: #409cfb;
    }
  }

  .next-btn {
    color: #fff;
    cursor: pointer;
    height: 100%;
    line-height: 32px;
    margin-left: 3px;

    &:hover {
      color: #409cfb;
    }
  }

  .page-tab-add {
    margin-left: 10px;

    span {
      cursor: pointer;
      display: block;
      width: 20px;
      height: 20px;
      border: 1px solid #fff;
      background: #fff;
      border-radius: 5px;
      line-height: 17px;
      margin-top: 5px;
      color: #909399;
      text-align: center;
    }
  }

  .scale-bar {
    float: right;
    width: 265px;

    .slider-icon {
      float: left;
      font-size: 16px;
      color: #2f5377;
      margin-top: 7px;
      cursor: pointer;
    }

    .slider-bar {
      float: left;
      width: 200px;
      margin-left: 10px;
      margin-right: 10px;

      /deep/ .el-slider__runway {
        margin: 12px 0;
      }

      /deep/ .el-slider__button-wrapper {
        width: 26px;
        height: 26px;
        top: -10px;
      }

      /deep/ .el-slider__bar {
        background-color: #2f5377;
      }

      /deep/ .el-slider__button {
        border: solid 2px #2f5377;
      }
    }
  }
}

.design-main {
  &.el-main {
    background-color: $main-bg;
    padding: 10px;
    padding-top: 50px;
    padding-bottom: 40px;
    overflow: hidden;

    .query-design {
      width: 100%;
      height: 100%;
      background-color: $main-bg1;
      outline: none;
      background-repeat: no-repeat;
      background-position: center center;
      background-size: cover;
      overflow: hidden;

      /deep/ .el-scrollbar__wrap {
        overflow-x: hidden;
      }
      /deep/ .el-scrollbar__bar.is-horizontal {
        display: none;
      }
      &.mobile-design {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        margin-top:5px;
        @media screen and (max-width: 1600px) {
          width: 375px !important;
          height: 500px !important;
        }
        @media screen and (min-width: 1600px) {
          width: 375px !important;
          height: 667px !important;
        }
      }
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
  float: left;
}

.compt-list-img {
  cursor: pointer;
  display: block;
  width: 130px;
  height: 80px;
  background: #ebeef5;
  overflow: hidden;
  margin: 10px;
  margin-bottom: 0px;
  color: #fff;
  border-radius: 5px;
  border: 1px solid transparent;

  &:hover {
    border-color: #409eff;
    background: #f2f6fc;
  }

  img {
    width: 100%;
  }
}

.compt-list-tit {
  color: #999;
  height: 20px;
  line-height: 28px;
  text-align: center;
}

.opt-btn {
  display: none;
  position: absolute;
  right: 10px;
  top: 10px;
  cursor: pointer;

  &.active {
    display: inline-block;
  }
}

.designCompt.active {
  border: 1px dashed green;

  .opt-btn {
    display: inline-block;
  }
}

// 流动拖拽块样式
.vue-grid-item {
  overflow: hidden;
  z-index: 999;
  border: 1px dashed $border1;
  transition: none;
  transition-property: none;
  // overflow: auto
  &.active {
    border: 1px dashed $main-color;
  }

  &:hover {
    box-shadow: 0 0 3px 3px rgba(204, 204, 204, 0.7);
  }
}

.draggable {
  padding: 5px;
  border: 1px dashed green;
}

.active.draggable {
  border: 1px dashed red;
}

.is-vertical > .el-main {
  padding: 0;
}

.is-vertical > .el-container {
  height: calc(100% - 50px);
}

.query-layout {
  padding: 20px;

  .query-grid.actived {
    border-color: #409eff;
  }
}

.query-grid {
  border: 1px dashed #afc0d0;
}

.query-grid:hover {
  box-shadow: 0 0 3px 3px rgba(204, 204, 204, 0.7);
}

.query-grid:first-child {
  position: relative;
  min-height: 70px;

  /deep/ .el-form-item__content div {
    z-index: 100;
  }

  /deep/ .el-button {
    z-index: 100;
  }

  /deep/ .el-form-item__content {
    /deep/ .el-cascader {
      & > div {
        background-color: #fff;
      }
    }
  }
}

.query-grid:last-child {
  height: 465px;
  margin-top: 20px;
}

// 弹框标题头字体
.dialog-title {
  & > span {
    line-height: 24px;
    font-size: 18px;
    color: #303133;
  }
}

.query-grid > .jixi {
  padding-right: 76px;
}

.queryHis /deep/ .el-dialog__body {
  padding: 0px 20px 20px 20px !important;
}

.design-list {
  width: 100%;
  height: 100%;
}

.null-tip {
  width: 100%;
  font-size: 24px;
  color: #2f5377;
  text-align: center;
  transform: translateY(-50%);
  position: absolute;
  top: 50%;

  .icon-A10697_click {
    font-size: 65px;
    position: relative;
    top: 14px;
    margin: 10px;
  }
}

.context-menu {
  position: absolute;
  width: 60px;
  height: 85px;
  background: #fff;
  border: 1px solid #eee;
  box-shadow: 0 0.5em 1em 0 rgba(0, 0, 0, 0.1);
  border-radius: 1px;

  li {
    height: 28px;
    line-height: 28px;
    text-align: center;
    display: block;
    cursor: pointer;

    &:hover {
      color: #fff;
      background-color: #409cfb;
    }
  }
}

#compt-hide {
  width: 0px;
  transition: width 0.5s linear;
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
  z-index: 1000;
  .el-dropdown-link {
    display: block;
    word-break: break-word;
    line-height: 5px;
  }
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
  border-bottom: 1px solid #DCDFE6;
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

.compt-list {
  position: absolute;
  width: 490px;
  height: 250px;
  top: 46px;
  left: -235px;
  background: #fff;
  z-index: 1000;
  padding-left: 20px;
  padding-right: 0px;
  padding-top: 10px;
  padding-bottom: 15px;
  overflow: hidden;
  border-radius: 5px;
  box-shadow: 5px 5px 12px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #ebeef5;
}

.scroll-cont {
  /deep/ .el-scrollbar__wrap {
    overflow: visible;
    overflow-x: hidden;
  }

  /deep/ .el-scrollbar__thumb {
    background-color: #aaaaaa;
  }
}
.no-title {
  height: 100%;
}
.has-title {
  height: 100%;
  margin-top: -30px;
  padding-top: 30px;
  padding-bottom: 16px;
}
.canvasWrap {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
/deep/.vue-resizable-handle {
  z-index: 1000;
}
</style>
<style>
/* 即席设计 查询条件区域 级联下拉框 面板宽度调整 */
.cascader-drop-wrap.el-popper .el-cascader-menu {
  min-width: 178px;
}

.el-tooltip__popper.pageTag-toolTip {
  color: #606266;
  border: 1px solid #606266;
}
/* 组件图标的t */
.el-tooltip__popper.compt-icon-toolTip {
  pointer-events: none;
}
</style>
