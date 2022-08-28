<template>
  <el-container v-loading="loadingNew">
    <div id="template-list" v-show="templateShow">
      <div class="template-list-title">
        <span class="icon-A10582_Template template-icon"></span>
        <span>模板应用</span>
      </div>

      <div class="template-list-item">
        <el-scrollbar style="height:100%;width:auto">
          <div class="template-block goto-design" @click="upTemplateShow(false)">
            <span class="icon-A10547_LS"></span>
            <p>自定义</p>
          </div>
          <div class="template-block" v-for="item in templateList">
            <div class="template-img">
              <img :src="item.thumbnail||''" alt />
              <div class="template-toolbar">
                <el-tooltip class="item" effect="dark" content="应用模板" placement="top-start">
                  <div class="template-toolbar-item" @click="templateApply(item.templateId)">
                    <span class="icon-A10094_edit"></span>
                  </div>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="预览模板" placement="top-start">
                  <div class="template-toolbar-item" @click="templatePreview(item.templateId)">
                    <span class="icon-A10181_browseCount"></span>
                  </div>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="删除模板" placement="top-start">
                  <div class="template-toolbar-item" @click="templateDelete(item.templateId)">
                    <span class="icon-A10064_delete"></span>
                  </div>
                </el-tooltip>
              </div>
            </div>
            <div class="template-name">{{item.templateName}}</div>
          </div>
          <div style="clear:both"></div>
        </el-scrollbar>
      </div>
    </div>
    <el-header class="design-page">
      <div class="head-left">
        <el-input
          class="page-name"
          :class="{'page-input' : this.toSaveInput}"
          size="mini"
          v-model="pageName"
          placeholder="请输入页面名称"
          @change="setHomePageName(pageName)"
          ref="toSaveBtn"
          @input="inputChange('pageName')"
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
            <!-- <span class="triangle icon-A10008_triangleUp"></span> -->
            <span class="triangle"></span>
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
                >
                  <div class="compt-list-img">
                    <img :src="compt.imgSrc||'comptPic/third.png'" alt />
                  </div>
                  <div class="compt-list-tit">
                    {{compt.compName}}
                  </div>
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
      <el-aside id="layer-hide" width="150" style="position:relative">
        <!-- 图层面板 -->
        <div class="layer-tit">
          <span>图层</span>
          <div class="layer-icon">
            <span
              v-show="activedCompt.blockInfo&&activedCompt.blockInfo.draggable===true"
              class="icon-A10374_password"
              style="margin-right:10px;"
              @click.stop="lockLayer"
            ></span>
            <span
              v-show="activedCompt.blockInfo&&activedCompt.blockInfo.draggable===false"
              class="icon-A10375_password"
              style="margin-right:10px;"
              @click.stop="unLockLayer"
            ></span>
            <span
              v-show="activedCompt.blockInfo"
              class="icon-A10065_delete"
              @click.stop="deleteCompt(activedCompt.comptId)"
            ></span>
          </div>
        </div>
        <div
          class="layer-list"
          @keydown.ctrl.90="executeRedoAndUndo({cmdType:'undo',pageId:activedPage})"
          @keydown.ctrl.89="executeRedoAndUndo({cmdType:'redo',pageId:activedPage})"
          @keydown.up="moveKey('up')"
          @keydown.down="moveKey('down')"
          @keydown.left="moveKey('left')"
          @keydown.right="moveKey('right')"
          tabindex="0"
        >
          <el-scrollbar style="height:100%">
            <div
              :class="{'layer-list-item':true,'actived':layer.comptId==activedCompt.comptId}"
              v-for="(layer, index) in allFlatCompts"
              @click.stop="layerClick(layer,index)"
              @contextmenu.prevent
              @mouseup="e=>layerContextMenu(e, layer, index)"
            >
              <span :class="['list-item-icon', layer.comptAttrs.comptIcon ]"></span>
              <span
                class="list-item-text"
                :title="layer.comptAttrs.extendSetting['comptName.text']"
              >{{layer.comptAttrs.extendSetting['comptName.text']}}</span>
              <span class="layer-lock-icon icon-A10374_password" v-show="layer.comptAttrs.isLocked"></span>
            </div>
          </el-scrollbar>
        </div>
      </el-aside>
      <el-main style="position:relative" class="design-main">
        <div class="design-toolbar">
          <div class="expend-btn" @click="expendCompt">
            <span v-if="expendShow==true" class="icon-A10018_doubleArrowLeft"></span>
            <span v-else class="icon-A10019_doubleArrowRight"></span>
          </div>
          <div class="right-btn">
            <!-- <div class="right-btn-item">
              <el-tooltip class="item active" effect="dark" content="另存" placement="bottom">
                <i class="icon-A10603_Overview"></i>
              </el-tooltip>
            </div>-->
            <div class="right-btn-item">
              <el-tooltip
                class="item"
                effect="dark"
                content="左对齐"
                @click.native="doAlign('left')"
                placement="bottom"
              >
                <i class="icon-A10726_leftAlign"></i>
              </el-tooltip>
            </div>
            <div class="right-btn-item">
              <el-tooltip
                class="item"
                effect="dark"
                content="右对齐"
                @click.native="doAlign('right')"
                placement="bottom"
              >
                <i class="icon-A10727_rightAlign"></i>
              </el-tooltip>
            </div>
            <div class="right-btn-item">
              <el-tooltip
                class="item"
                effect="dark"
                content="上对齐"
                @click.native="doAlign('top')"
                placement="bottom"
              >
                <i class="icon-A10724_topAlign"></i>
              </el-tooltip>
            </div>
            <div class="right-btn-item">
              <el-tooltip
                class="item"
                effect="dark"
                content="下对齐"
                @click.native="doAlign('bottom')"
                placement="bottom"
              >
                <i class="icon-A10725_bottomAlign"></i>
              </el-tooltip>
            </div>
            <div class="right-btn-item">
              <el-tooltip
                class="item"
                effect="dark"
                content="水平分布"
                @click.native="doAlign('horizon')"
                placement="bottom"
              >
                <i class="icon-A10722_horizontalLayout"></i>
              </el-tooltip>
            </div>
            <div class="right-btn-item">
              <el-tooltip
                class="item"
                effect="dark"
                content="垂直分布"
                @click.native="doAlign('vertical')"
                placement="bottom"
              >
                <i class="icon-A10723_verticalLayout"></i>
              </el-tooltip>
            </div>
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
          </div>
        </div>

        <!-- 标尺组件 -->
        <rulerTool
          ref="rulerMain"
          :scaleRatio="scaleRatio"
          @drawAxis="drawAxis"
          :scrollX="canvasScrollX"
          :scrollY="canvasScrollY"
          @toggleLine="toggleLine"
          :lineTabOffset="indicatorLineOffset"
        />

        <!-- 即席查询 -->
        <div
          id="water-wrap"
          class="query-design"
          ref="scaleWrap"
          @keydown.ctrl.67="copyKey"
          @keydown.ctrl.86="pasteKey"
          @keydown.ctrl.90="executeRedoAndUndo({cmdType:'undo',pageId:activedPage})"
          @keydown.ctrl.89="executeRedoAndUndo({cmdType:'redo',pageId:activedPage})"
          @keydown.46="deleteKey"
          @keydown.up="moveKey('up')"
          @keydown.down="moveKey('down')"
          @keydown.left="moveKey('left')"
          @keydown.right="moveKey('right')"
          tabindex="-1"
          @mousemove="lineDrag"
        >
          <GeminiScrollbar ref="mainScroll">
            <div class="auto-wrap">
              <div class="line-wrap" :style="`display:${lineShow?'block':'none'}`">
                <div
                  :key="xline.id"
                  v-for="xline of xlines"
                  class="xaxis-line"
                  :style="`top:${xline.pos}px`"
                  @dblclick="removeLine(xline.id,'x')"
                  @mousedown="e=>dragOn(e,xline,'x')"
                  @mouseup="dragOff"
                  title="双击取消辅助线"
                >
                  <span class="xline-label">{{Math.round((xline.pos-20)/scaleRatio)}}</span>
                </div>
                <div
                  :key="yline.id"
                  v-for="yline of ylines"
                  class="yaxis-line"
                  :style="`left:${yline.pos}px`"
                  @dblclick="removeLine(yline.id,'y')"
                  @mousedown="e=>dragOn(e,yline,'y')"
                  @mouseup="dragOff"
                  title="双击取消辅助线"
                >
                  <span class="yline-label">{{Math.round((yline.pos-40)/scaleRatio)}}</span>
                </div>
              </div>
              <div
                class="big-scale-wrap"
                :style="`height:${1080*scaleRatio+50}px; width:${1920*scaleRatio+100}px; transform: translateZ(0); padding-top:20px; padding-left:40px;`"
              >
                <div
                  id="opt-box"
                  :style="`background-color:${nowPage.bgClor||''};background-image:url(${nowPage.bgImg}); width:1920px; height:1080px;`"
                  ref="optBox"
                >
                  <bd-draggable-resizable
                    v-if="s_edcuiCompts.length>0"
                    v-for="(compt,index) in s_edcuiCompts"
                    :ref="'dr'+compt.comptId"
                    :w="compt.blockInfo.w"
                    :h="compt.blockInfo.h"
                    :x="compt.blockInfo.x"
                    :y="compt.blockInfo.y"
                    :z="compt.blockInfo.z"
                    :min-width="40"
                    :min-height="20"
                    :scaleRatio="scaleRatio"
                    :active="compt.comptId==activedCompt.comptId"
                    :class="{'designCompt':true,'alignReady':alignIds.includes(compt.comptId)}"
                    @resizestop="onResizstop"
                    @dragging="onDrag"
                    @resizing="dragResize"
                    :draggable="compt.blockInfo.draggable"
                    :resizable="compt.blockInfo.resizable"
                    :grid="[1,1]"
                    :parent="false"
                    :key="compt.comptId"
                    :data-id="compt.comptId"
                    @activated="upBlock(compt.comptId, compt.comptId)"
                    @dragstop="onDragStopCallback"
                    :onDragStart="onDragStartCallback"
                    :onResizeStart="onResizeStartCallback"
                  >
                    <div
                      style="width:100%;height:100%;overflow:hidden;"
                      :style="setHeaderStyle(compt)"
                      @click.ctrl="multiClick($event,compt.comptId)"
                      @click.stop="singleClick($event,compt.comptId)"
                    >
                      <div
                        class="compt-title"
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
                          :scaleRatio="scaleRatio"
                          v-loading="compt.comptAttrs.loading"
                        ></Cell>
                        <div
                          class="compt-nodata-tip"
                          v-show="compt.comptAttrs.isBindData=='1' && !compt.comptAttrs.isLoadData"
                        >
                          <span v-if="compt.type =='HdKpiBlock' || compt.type =='HdKpiBlock2' || compt.type =='HdIconKpiBlock'">{{!!compt.comptAttrs.queryInfo ? compt.comptAttrs.queryInfo : compt.comptAttrs.name + '：请设置一个度量'}}</span>
                          <span v-else-if="compt.type =='HdKpiBlock3'">{{!!compt.comptAttrs.queryInfo ? compt.comptAttrs.queryInfo : compt.comptAttrs.name + '：请设置两个度量'}}</span>
                          <span v-else>{{!!compt.comptAttrs.queryInfo ? compt.comptAttrs.queryInfo : compt.comptAttrs.name + '：请设置维度或度量'}}</span>
                        </div>
                      </div>
                    </div>
                    <el-dropdown v-show="compt.blockInfo.h>20" size="mini" class="block-menu" trigger="click">
                      <span class="el-dropdown-link">...</span>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item
                          v-show="compt.type!='ElTabs'"
                          @click.native="comptCopy(compt)"
                        >复制</el-dropdown-item>
                        <el-dropdown-item @click.native="deleteCompt(compt.comptId)">删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                  </bd-draggable-resizable>
                  <div v-show="s_edcuiCompts.length==0" class="null-tip">
                    <span>请添加</span>
                    <span class="icon-A10697_click"></span>
                    <span>组件</span>
                  </div>
                </div>
              </div>
            </div>
          </GeminiScrollbar>
        </div>
        <!-- 界面定制及大屏 -->

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
                    style="width:100%; color:#ccc"
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
          <div class="scale-bar">
            <span class="slider-icon icon-A10278-Deleted" @click="subScaleValue"></span>
            <div class="slider-bar">
              <el-slider v-model="scaleValue" :min="18" :max="175"></el-slider>
            </div>
            <span class="slider-icon icon-A10279-new" @click="addScaleValue"></span>
          </div>
        </div>
      </el-main>
      <el-aside id="attr-panel" width="360px">
        <AnalyReportAttrSet v-show="activedBlock !== '' && !pubStyle"></AnalyReportAttrSet>
        <PublicStyle v-show="activedBlock !== '' && pubStyle"></PublicStyle>
        <PageBaseSet v-show="activedBlock === ''"></PageBaseSet>
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
            size="mini"
            @input="inputChange('saveForm.pageName')"
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
    <!-- 图层右键菜单start -->
    <div class="layer-contextmenu" v-show="layerContextMenuShow" @contextmenu.prevent>
      <ul>
        <li @click="updateLayer('layerTop')">置于顶层</li>
        <li @click="updateLayer('layerBottom')">置于底层</li>
        <li @click="updateLayer('layerUp')">上移一层</li>
        <li @click="updateLayer('layerDown')">下移一层</li>
      </ul>
    </div>
    <!-- 图层右键菜单end -->
  </el-container>
</template>
<script>
import draggable from "vuedraggable";
import Cell from "../components/design/Cell.vue";
import BdDraggableResizable from "bd-draggable-resizable";
// import BdDraggableResizable from "../components/tools/bd-draggable-resizable"//后期自由布局加入后使用本地组件方式（需要改源代码）
import "vue-draggable-resizable/dist/VueDraggableResizable.css";
import rulerTool from "../components/tools/rule.vue";
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
import { animateEffect1, animateEffect2 } from "../utils/BgAnimate.js";
import AnalyReportAttrSet from "../components/design/AnalyReportAttrSet";
import PublicStyle from "../components/design/PublicStyle";
import eventBus from "../plugins/transData.js";
import PageBaseSet from "../components/design/PageBaseSet";
import ComptMixins from "../utils/comptMixins";

//import { constants } from "fs";

export default {
  components: {
    Cell,
    BdDraggableResizable,
    rulerTool,
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    PageBaseSet,
    AnalyReportAttrSet,
    draggable,
    PublicStyle
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
      pubStyle: false,
      loadingNew: false,
      alignList: [],
      alignIds: [],
      ctid: "", //分类id
      panelLeft: "", //面板平移距离
      comptListShow: false,
      tempCompt: null,
      pageName: "",
      tabPageId: "",
      editId: "",
      contextMenuShow: false,
      layerContextMenuShow: false,
      scaleValue: 0,
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
          { min: 1, max: 30, message: "长度在 1 到 40 个字符", trigger: "blur" }
        ],
        catalogId: [
          { required: true, validator: catalogCheck, trigger: "change" }
        ]
      },
      pageOrder: 1,
      // comptOrder: 1,
      comptPanelId: "",
      comptChildren: [],
      expendShow: false,
      tempBlockInfo: null,
      templateList: [],
      fieldTypeList: {}, //数据库字段类型
      dragLine: null,
      dragType: "",
      scrollX: 0,
      scrollY: 0,
      lineShow: true,
      lineTabOffset: 0,
      formatList: [] //日期格式层级
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
    toggleLine() {
      this.lineShow = !this.lineShow;
    },
    scrollHandle(e) {
      setTimeout(() => {
        let dom = this.$refs.mainScroll.$el.querySelector(".gm-scroll-view");
        this.scrollX = dom.scrollLeft;
        this.scrollY = dom.scrollTop;
      }, 0);
    },
    drawAxis(e) {
      let type = e.target.getAttribute("id");
      let id = getUUID();
      if (type == "yaxis") {
        let y = this.scrollY - 0 + e.pageY - 109;
        this.xlines.push({ id, pos: y });
      } else if (type == "xaxis") {
        let x = this.scrollX - 0 + e.pageX - this.lineTabOffset - 2;
        this.ylines.push({ id, pos: x });
      }
    },
    removeLine(id, type) {
      if (type == "x") {
        for (let x = 0; x < this.xlines.length; x++) {
          if (this.xlines[x].id == id) {
            this.xlines.splice(x, 1);
            break;
          }
        }
      } else if (type == "y") {
        for (let y = 0; y < this.ylines.length; y++) {
          if (this.ylines[y].id == id) {
            this.ylines.splice(y, 1);
            break;
          }
        }
      }
    },
    dragOn(e, line, type) {
      this.dragLine = line;
      this.dragType = type;
    },
    dragOff(e) {
      this.dragLine = null;
      this.dragType = "";
    },
    lineDrag(e) {
      let line = this.dragLine;
      let type = this.dragType;
      if (line != null) {
        let pos = { x: e.pageX, y: e.pageY };
        if (type == "y") {
          line.pos = pos.x + this.scrollX - this.lineTabOffset - 2;
        } else if (type == "x") {
          line.pos = pos.y + this.scrollY - 110;
        }
      }
      e.preventDefault();
    },

    lockLayer() {
      this.checkIfNeedRecordFirst({
        dataBefore: JSON.stringify(this.s_edcuiCompts),
        pageId: this.activedPage
      });
      //图层锁定
      this.activedCompt.blockInfo.draggable = false;
      this.activedCompt.blockInfo.resizable = false;
      this.activedCompt.comptAttrs.isLocked = true;
      this.recordOpt({
        curPageId: this.activedPage,
        cmd: {
          commandName: "lockLayer",
          dataBefore: JSON.stringify(objDeepCopy(this.s_edcuiCompts)),
          comptInfo: {}
          // comptInfo: objDeepCopy(this.activedCompt) //操作的组件
        },
        type: "undo"
      });
    },
    unLockLayer() {
      this.checkIfNeedRecordFirst({
        dataBefore: JSON.stringify(this.s_edcuiCompts),
        pageId: this.activedPage
      });
      //图层解锁
      this.activedCompt.blockInfo.draggable = true;
      this.activedCompt.blockInfo.resizable = true;
      this.activedCompt.comptAttrs.isLocked = false;
      this.recordOpt({
        curPageId: this.activedPage,
        cmd: {
          commandName: "unLockLayer",
          dataBefore: JSON.stringify(objDeepCopy(this.s_edcuiCompts)),
          comptInfo: {}
          // comptInfo: objDeepCopy(this.activedCompt) //操作的组件
        },
        type: "undo"
      });
    },
    layerClick(layer, index) {
      this.layerContextMenuShow = false;
      let activedNum;
      if (layer.parentComptId) {
        //如果是容器嵌套的组件activedNum为对象
        activedNum = this.allFlatCompts[index];
      } else {
        activedNum = layer.comptId;
      }
      if (this.$refs["dr" + layer.comptId]) {
        let compt = this.$refs["dr" + layer.comptId][0];
        compt.$emit("update:active", true);
      }
      this.upBlock(layer.comptId, activedNum); //更新两个参数upActivedBlock、upActivedId
    },
    clearAlign() {
      this.alignIds.splice(0, this.alignIds.length);
    },
    doSomething(comptId) {
      if (this.alignIds.includes(comptId)) {
        //取消选中
        for (let i = 0; i < this.alignIds.length; i++) {
          if (comptId == this.alignIds[i]) {
            this.alignIds.splice(i, 1);
            break;
          }
        }
      } else {
        this.alignIds.push(comptId);
      }
    },
    multiClick(e, comptId) {
      let commonArr = [];
      this.pubStyle = e.ctrlKey;
      if (e.ctrlKey) {
        this.doSomething(comptId);
        this.s_edcuiCompts.forEach(item => {
          if (this.alignIds.includes(item.comptId)) {
            commonArr.push(item);
          }
        });
        this.$store.commit("PageDesign/commonStyArr", commonArr);
        if(this.commonStyle.length === 0){
          let comH = commonArr[0].styleAttrs.find((val)=>val.enName === "commonAttrs").children.find((val)=>val.enName === "commonHeight")
          let comW = commonArr[0].styleAttrs.find((val)=>val.enName === "commonAttrs").children.find((val)=>val.enName === "commonWidth")
          let comC = commonArr[0].styleAttrs.find((val)=>val.enName === "commonAttrs").children.find((val)=>val.enName === "commonBackgroundColor" || val.enName === "backgroundColor" || val.enName === "bgColor")
          let comArr = []
          comArr.push(comH)
          comArr.push(comW)
          comArr.push(comC)
          this.$store.commit("PageDesign/commonSty", comArr);
        }
        if (commonArr.length > 0) {
          let styObj = commonArr.find(
            val => val.comptId === this.alignIds[this.alignIds.length - 1]
          );
          this.commonStyle.forEach(item => {
            if (!!item && item.enName === "commonWidth") {
              item.value = styObj.blockInfo.w;
            }
            if (!!item && item.enName === "commonHeight") {
              item.value = styObj.blockInfo.h;
            }
            if (!!item && item.enName === "commonBackgroundColor") {
              item.value = styObj.styleAttrs.find(val => val.enName === "commonAttrs").children.find(val => val.enName === "commonBackgroundColor" ||  val.enName === "backgroundColor" ||  val.enName === "bgColor").value;
            }
          });
          this.$store.commit("PageDesign/commonSty", this.commonStyle);
          this.recordOpt({
            curPageId: this.activedPage,
            cmd: {
              commandName: "multiClick",
              dataBefore: JSON.stringify(objDeepCopy(this.s_edcuiCompts)),
              comptInfo: {} //操作的组件 对齐不针对单个组件就没存
            },
            type: "undo"
          });
        } else {
          this.$message({
            message: "请选择需要批量设置的组件",
            type: "warning"
          });
        }
      }
    },
    singleClick(e, comptId) {
      if (!e.ctrlKey) {
        this.clearAlign();
      }
    },
    addScaleValue() {
      if (this.scaleValue < 175) {
        this.scaleValue++;
      }
    },
    subScaleValue() {
      if (this.scaleValue > 0) {
        this.scaleValue--;
      }
    },
    showPageSet() {
      this.comptPanelId = "";
      this.upActivedBlock("");
      this.upActivedId({});
      this.upActivedTab([]);
      this.clearAlign();
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
    ajustLayout(list) {
      if (list.length > 1) {
        for (let i = list.length - 2; i >= 0; i--) {
          if (list[i].blockInfo.x < 350 && list[i].blockInfo.y < 150) {
            list[i].blockInfo.y = 150;
          }
        }
      }
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
    moveKey(direction) {
      if (
        Object.keys(this.activedCompt).length !== 0 &&
        this.activedCompt.blockInfo
      ) {
        this.checkIfNeedRecordFirst({
          dataBefore: JSON.stringify(this.s_edcuiCompts),
          pageId: this.activedPage
        });
        this.recordOpt({
          curPageId: this.activedPage,
          cmd: {
            commandName: "moveLayer",
            dataBefore: JSON.stringify(objDeepCopy(this.s_edcuiCompts)),
            comptInfo: {
              direction: direction
            }
          },
          type: "undo"
        });
        if(this.alignIds.length > 0){//批量组件移动
          let direcArr = []
          this.s_edcuiCompts.forEach(item => {
            if (this.alignIds.includes(item.comptId)) {
              direcArr.push(item);
            }
          });
          direcArr.forEach(item => {
            switch (direction) {
              case "up":
                item.blockInfo.y -= 5;
                break;
              case "down":
                item.blockInfo.y += 5;
                break;
              case "left":
                item.blockInfo.x -= 5;
                break;
              case "right":
                item.blockInfo.x += 5;
                break;
            }
          });
        }else{
          switch (direction) {
            case "up":
              this.activedCompt.blockInfo.y -= 5;
              break;
            case "down":
              this.activedCompt.blockInfo.y += 5;
              break;
            case "left":
              this.activedCompt.blockInfo.x -= 5;
              break;
            case "right":
              this.activedCompt.blockInfo.x += 5;
              break;
          }
        }
      }
    },
    comptCopy(compt) {
      this.addToDesign(0, compt);
    },
    setHomePageName(val) {
      this.pageList[0].pageName = val;
    },
    expendCompt() {
      var dom = document.getElementById("layer-hide");
      if (dom.clientWidth > 0) {
        dom.style.width = "0px";
        this.expendShow = false;
        this.lineTabOffset = 0;
      } else {
        dom.style.width = "150px";
        this.expendShow = true;
        this.lineTabOffset = 150;
      }
      this.upActivedBlock("");
      this.upActivedId({});
      this.upActivedTab([]);
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
        if (newPage.pageDetail && newPage.pageDetail.length > 0) {
          for (var i = 0; i < newPage.pageDetail.length; i++) {
            var uuid = getUUID();
            newPage.pageDetail[i].comptId = uuid;
            newPage.pageDetail[i].blockInfo.i = uuid;
          }
        }
        this.pageList.push(newPage);
        this.pageResort();
        // 初始时候先记录一次
        this.initPageSnapshots({
          pageId: newPage.pageId,
          dataBefore: JSON.stringify(objDeepCopy(newPage.pageDetail))
        });
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
                // 清除页面操作栈信息
                this.clearSnapshots({ curPageId: pageId });
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
    layerContextMenu(e, layer, index) {
      if (e.button == 2) {
        this.layerClick(layer, index);
        let menu = document.querySelector(".layer-contextmenu");

        //鼠标点的坐标
        var oX = e.clientX;
        var oY =
          window.innerHeight - e.clientY > 120 ? e.clientY : e.clientY - 120;

        //菜单出现后的位置
        menu.style.left = oX + "px";
        menu.style.top = oY + "px";
        this.layerContextMenuShow = true;
      }
    },
    pageCheck(pageId) {
      this.setActivedPage(pageId);
      var data = [];
      var line = {};
      for (var item of this.pageList) {
        if (item.pageId == pageId) {
          data = item.pageDetail;
          line = item.lineObj;
          break;
        }
      }
      this.setPageDetail(data);
      this.setLineObj(line);
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
        height: "500",
        lineObj: {
          oldRatio: this.scaleRatio,
          xlines: [],
          ylines: []
        }
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
      //初次调用公共样式接口并缓存
      if(this.commonStyle.length === 0){
        this.queryCommonStyle()
          .then(val => {
            if (val.status == 200 && val.data.respResult == "1") {
              this.$store.commit("PageDesign/commonSty", val.data.respData);
            } else {
              this.$message.error(val.data.respErrorMsg);
            }
          })
          .catch(err => {
            // this.$message.error(err);
          });
      }
      //大屏时候tab组件里面不再添加tab
      if (
        this.pageCache.classTypeId == "1005" &&
        this.activedCompt.type == "ElTabs" &&
        compType === 'ElTabs'
      ) {
        this.$message({
          message: "请选择其他组件",
          type: "warning"
        });
        return;
      }

      this.checkIfNeedRecordFirst({
        dataBefore: JSON.stringify(this.s_edcuiCompts),
        pageId: this.activedPage
      });
      let command = {
        commandName: "addCompt",
        dataBefore: [],
        comptInfo: {} //操作的组件
      };

      //添加组件到设计区域
      let d_cpts = {};
      let uuid = getUUID();
      if (compt != null) {
        //组件复制
        d_cpts = objDeepCopy(compt);
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
          //复制组件替换名称,副本+序号
          genComptName(d_cpts, this.s_edcuiCompts);
        }
      } else {
        // const temp_Data = require("../../public/comptConfig/" + chartUrl); //图表json数据
        let param = {
          compType,
          classTypeId: '1005'
        }
        let temp_Data = [];
        let resp = await this.qryStyleAttrs(param);
        if(!resp){
          return;
        }else{
          if (resp.status == 200 && resp.data.respResult == "1") {
            temp_Data = [resp.data.respData]
            let commonAttrs = temp_Data[0].styleAttrs.find((val)=>val.enName === "commonAttrs")
            if(commonAttrs.children&&(commonAttrs.children.find((val)=>val.enName === "commonTitleFontSize")||commonAttrs.children.find((val)=>val.enName === "commonTitleColor"))){
              commonAttrs.children.find((val)=>val.enName === "commonTitleFontSize").isShow=false
              commonAttrs.children.find((val)=>val.enName === "commonTitleColor").isShow=false
            }
            temp_Data[0].comptAttrs.isLoadData = false;
            temp_Data[0].comptAttrs.extendSetting["grid.top"] = '10%';
            temp_Data[0].comptAttrs.extendSetting["grid.bottom"] = 20;
            temp_Data[0].comptAttrs.extendSetting["grid.right"] = 25;
            temp_Data[0].comptAttrs.extendSetting["grid.left"] = 25;
            temp_Data[0].comptAttrs.extendSetting["legend.top"] = 2;
            temp_Data[0].comptAttrs.extendSetting["legend.type"] = "scroll";
            temp_Data[0].comptAttrs.extendSetting["legend.pageButtonPosition"] = "start";
            if(temp_Data[0].type == "VeRing") {
              temp_Data[0].comptAttrs.extendSetting["series.0.radius"] = [
                '54%',
                "60%"
              ];
              this.$set(temp_Data[0].comptAttrs.extendSetting,"series.0.center",['50%','50%'])
            }
            if (
              temp_Data[0].type == "VeRosePie" ||
              temp_Data[0].type == "VePie"
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
            if (temp_Data[0].type == "VeLine" || temp_Data[0].type == "VeLineArea" || temp_Data[0].type == "VeStackLineArea" || temp_Data[0].type == "VeHistogram" || temp_Data[0].type == "VeStackHistogram" || temp_Data[0].type == "VeBar" || temp_Data[0].type == "VeStackBar") {
              temp_Data[0].comptAttrs.extendSetting['xAxis.0.axisLine.show'] = true
              temp_Data[0].comptAttrs.extendSetting['yAxis.0.axisLine.show'] = true
            }
          } else {
            // this.$message.error(resp.data.respErrorDesc)
            return;
          }
        }
        if (
          this.pageCache.classTypeId == "1005" &&
          ["ElDatagrid", "CrossTable"].includes(temp_Data[0].type)
        ) {
          //大屏表格不要导出，表格主题设置只保留默认设置
          let subAttrs = temp_Data[0].styleAttrs[3].children
          let index = 4
          if ((subAttrs[index]||{}).enName !== "needSms") {
            subAttrs.some((item, i) => {
              if (item.enName === 'needSms') {
                index = i
                return true
              }
            })
          }
          temp_Data[0].styleAttrs[3].children.splice(index, 1); //导出短信验证
          temp_Data[0].styleAttrs[1].children[0].options.splice(1, 2); //主题设置
        }
        this.initExtendData(temp_Data);
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
      //let gridWidth = 12;

      if (this.designType == 1) {
        // 组件居中显示
        let wrapH =
          document.getElementById("opt-box").clientHeight * this.scaleRatio;
        let wrapW =
          document.getElementById("opt-box").clientWidth * this.scaleRatio;
        let blockW = 600;
        let blockH = 300;
        let newX = Math.floor(
          (wrapW - blockW * this.scaleRatio) / 2 / this.scaleRatio
        );
        let newY = Math.floor(
          (wrapH - blockH * this.scaleRatio) / 2 / this.scaleRatio
        );
        var item = {
          x: newX,
          y: newY,
          w: blockW,
          h: blockH,
          i: uuid,
          z: this.maxLayer,
          draggable: true,
          resizable: true
        };
        if (compt != null) {
          d_cpts["blockInfo"].i = uuid;
          //item = d_cpts["blockInfo"];
        } else {
          if (d_cpts.type == "Query") {
            item.h = 14;
            item.w = 24;
          } else if (d_cpts.type == "HdButton") {
            item.h = 60;
            item.w = 130;
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
        if (this.pageCache.classTypeId == "1005") {
          d_cpts["blockInfo"] = { x: 0, y: 0, w: 350, h: 150, i: uuid };
        }
        this.$set(d_cpts, "parentComptId", this.activedCompt.comptId);
        let tabPage = {};
        if (this.activedCompt.type == "ElCarousel") {
          tabPage = target.editableTabs[tabId];
        } else {
          for (let item of target.editableTabs) {
            if (item.name == tabId) {
              tabPage = item;
              break;
            }
          }
        }
        if (tabPage.comptList) {
          // d_cpts.blockInfo.y = this.getSubLayoutY(tabPage.comptList);
          if (compt != null) {
            genComptName(d_cpts, tabPage.comptList);
          }
          tabPage.comptList.push(d_cpts);
          this.ajustLayout(tabPage.comptList);
        }
      } else {
        if (this.activedTab.length > 0) {
          //在tab容器内复制
          if (this.pageCache.classTypeId == "1005") {
            d_cpts["blockInfo"] = { x: 0, y: 0, w: 350, h: 150, i: uuid };
          }
          this.$set(d_cpts, "parentComptId", this.activedCompt.parentComptId);
          this.activedTab.push(d_cpts);
          this.ajustLayout(this.activedTab);
        } else {
          this.s_edcuiCompts.push(d_cpts);
        }
        // command.comptInfo = JSON.stringify(objDeepCopy(d_cpts));
      }
      // this.upComptNum("add");
      // if (this.s_edcuiCompts.length == 1) this.upActivedId(0);
      if (
        (compt == null) &&
        d_cpts.type == "HdIconBlock"
      ) {
        //新增图标后，给宽高赋值
        let iconBlockW = d_cpts["blockInfo"].w;
        let iconBlockH = d_cpts["blockInfo"].h;
        d_cpts.comptAttrs.maxWidth = iconBlockW - 12;
        d_cpts.comptAttrs.maxHeight = iconBlockH - 12;
      }
      d_cpts.updated = true; //状态置为最新，防止点击查询
      command.dataBefore = JSON.stringify(objDeepCopy(this.s_edcuiCompts));
      this.recordOpt({
        curPageId: this.activedPage,
        cmd: command,
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
          let command = {
            commandName: "delCompt",
            dataBefore: [],
            comptInfo: {} //操作的组件
          };
          let isNeedRecord = false;
          //删除组件
          if (this.activedTab.length > 0) {
            for (let i = 0; i < this.activedTab.length; i++) {
              if (this.activedTab[i].comptId == cid) {
                if (this.activedTab[i].comptAttrs.isLocked) {
                  this.$message.error("无法删除已锁定的组件");
                } else {
                  // command.comptInfo = JSON.stringify(
                  //   objDeepCopy(this.activedTab[i])
                  // );
                  this.activedTab.splice(i, 1);
                  isNeedRecord = true;
                }
                break;
              }
            }
          } else {
            const _compt = this.s_edcuiCompts;
            for (let i = 0; i < _compt.length; i++) {
              if (cid == _compt[i].comptId) {
                if (_compt[i].comptAttrs.isLocked) {
                  this.$message.error("无法删除已锁定的组件");
                } else {
                  // command.comptInfo = JSON.stringify(
                  //   objDeepCopy(this.s_edcuiCompts[i])
                  // );
                  this.s_edcuiCompts.splice(i, 1);
                  isNeedRecord = true;
                }
                break;
              }
            }
          }
          if (isNeedRecord) {
            command.dataBefore = JSON.stringify(
              objDeepCopy(this.s_edcuiCompts)
            );
            this.recordOpt({
              curPageId: this.activedPage,
              cmd: command,
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
      if (this.activedCompt.blockInfo) {
        this.activedCompt["blockInfo"]["x"] = x;
        this.activedCompt["blockInfo"]["y"] = y;
      }
    },
    doAlign(type) {
      let blockList = [];
      let param = { type, blockList, sign: "" };
      let valList = [];
      /*  this.alignList.forEach(val=>{
        blockList.push(val.blockInfo);
      }); */
      if (this.alignIds.length <= 1) {
        this.$message.warning("按下ctrl选择要对齐的组件");
        return;
      }
      this.checkIfNeedRecordFirst({
        dataBefore: JSON.stringify(this.s_edcuiCompts),
        pageId: this.activedPage
      });
      for (let id of this.alignIds) {
        for (let compt of this.s_edcuiCompts) {
          if (id == compt.comptId) {
            blockList.push(compt.blockInfo);
            break;
          }
        }
      }
      switch (type) {
        case "top":
          valList = blockList.map(val => {
            return val.y;
          });
          param.value = Math.min(...valList);
          param.sign = "y";
          break;
        case "left":
          valList = blockList.map(val => {
            return val.x;
          });
          param.value = Math.min(...valList);
          param.sign = "x";
          break;
        case "right":
          valList = blockList.map(val => {
            return val.x + val.w;
          });
          param.value = Math.max(...valList);
          param.sign = "right";
          break;
        case "bottom":
          valList = blockList.map(val => {
            return val.y + val.h;
          });
          param.value = Math.max(...valList);
          param.sign = "bottom";
          break;
        case "vertical":
          blockList.sort((a, b) => {
            return a.y - b.y;
          });
          param.sign = "vertical";
          break;
        case "horizon":
          blockList.sort((a, b) => {
            return a.x - b.x;
          });
          param.sign = "horizon";
          break;
      }
      this.adjust2(param);
    },
    adjust2({ blockList, sign, value }) {
      if (sign == "right") {
        blockList.forEach(val => {
          val.x = Math.floor(value - val.w);
        });
      } else if (sign == "bottom") {
        blockList.forEach(val => {
          val.y = Math.floor(value - val.h);
        });
      } else if (sign == "vertical") {
        let minH = blockList[0].y + blockList[0].h;
        let maxH = blockList[blockList.length - 1].y;
        let height = 0;
        for (let i = 1; i < blockList.length - 1; i++) {
          height += blockList[i].h;
        }
        let offset = Math.floor(
          (maxH - minH - height) / (blockList.length - 1)
        );
        for (let [idx, item] of blockList.entries()) {
          if (idx < blockList.length - 2) {
            blockList[idx + 1].y = Math.floor(item.y + item.h + offset);
          }
        }
      } else if (sign == "horizon") {
        let minW = blockList[0].x + blockList[0].w;
        let maxW = blockList[blockList.length - 1].x;
        let width = 0;
        for (let i = 1; i < blockList.length - 1; i++) {
          width += blockList[i].w;
        }
        let offset = Math.floor((maxW - minW - width) / (blockList.length - 1));
        for (let [idx, item] of blockList.entries()) {
          if (idx < blockList.length - 2) {
            blockList[idx + 1].x = Math.floor(item.x + item.w + offset);
          }
        }
      } else {
        blockList.forEach(val => {
          val[sign] = Math.floor(value);
        });
      }
      this.recordOpt({
        curPageId: this.activedPage,
        cmd: {
          commandName: "alignAdjust",
          dataBefore: JSON.stringify(objDeepCopy(this.s_edcuiCompts)),
          comptInfo: {} //操作的组件 对齐不针对单个组件就没存
        },
        type: "undo"
      });
    },
    adjust(comptId) {
      let id = "dr" + comptId;
      let target = this.$refs[id][0];
      target.$emit(
        "resizing",
        target.x,
        target.y,
        target.$el.clientWidth,
        target.$el.clientHeight,
        true
      );
    },
    dragResize(x, y, width, height, flag) {
      if (this.activedCompt.blockInfo) {
        //let id = "dr" + this.activedCompt.comptId;
        //let target = this.$refs[id][0];
        //let ratio = this.scaleRatio;
        // let gap = Math.abs(width - target.$el.clientWidth * ratio);
        //let nX, nY;
        // if(gap>20){
        //   width=width*ratio;
        //   height=height*ratio;
        //   nX=width;
        //   nY=height;
        // }else{
        /*  if(flag){
          nX=width;
          nY=height;
        }else{
          nX=width/(ratio);
           nY=height/(ratio);
        } */
        //}

        this.activedCompt["blockInfo"]["x"] = x;
        this.activedCompt["blockInfo"]["y"] = y;
        this.activedCompt["blockInfo"]["h"] = height;
        this.activedCompt["blockInfo"]["w"] = width;

        // 公共属性赋值
        let commonAttrs = this.activedCompt.styleAttrs[0].children;
        for(let i=0; i<commonAttrs.length; i++) {
          if(commonAttrs[i].enName === 'commonHeight') {
            commonAttrs[i].value = height;
          } else if(commonAttrs[i].enName === 'commonWidth') {
            commonAttrs[i].value = width;
          }
        }

        /*  let e=window.event;
        let offset=target.$el;
        nX=(e.pageX/ratio-offset.offsetLeft/ratio);
        nY=(e.pageY/ratio-offset.offsetTop/ratio);
        this.mousey=e.pageY;
        this.blocky=offset.offsetTop;
         */

        /*  this.$nextTick(()=>{
          target.$el.style.width=Math.floor(nX)+'px';
          target.$el.style.height=Math.floor(nY)+'px';
        }) */
      }
    },
    onResizstop: function(x, y, width, height) {
      if (this.activedCompt.type !== 'VeWordCloud' && this.activedCompt.type !== '') { // 词云图的resize不需要手动触发
        windowResize();
      }
      if (this.activedCompt.blockInfo) {
        this.recordOpt({
          curPageId: this.activedPage,
          cmd: {
            commandName: "resizeCompt",
            dataBefore: JSON.stringify(objDeepCopy(this.s_edcuiCompts)),
            comptInfo: {}
            // comptInfo: objDeepCopy(this.activedCompt) //操作的组件
          },
          type: "undo"
        });
      }
    },
    setScale() {
      // var _w = this.$refs.optBox.clientWidth;
      if(this.$refs.scaleWrap!=undefined && this.$refs.scaleWrap!=''){
        var _w = this.$refs.scaleWrap.clientHeight - 40;
        // var _h = window.innerHeight;
        this.w_trans = _w / 1080;
        // var h_trans = _h/winHeit
        document.getElementById("opt-box").style.transform =
          "scale(" + this.w_trans + ")";
        document.getElementById("opt-box").style.transformOrigin = "0 0";
        // document.getElementsByClassName('draw-center')[0].style.transform = 'scaleY('+h_trans+')'
        this.scaleValue = Math.floor(this.w_trans * 100);
      }
    },
    toPrew() {
      if (this.pageCache.operation != "applyTemplate") {
        this.pageCache.operation = "wait";
        this.pageCache.pageName = this.pageName;
      }
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
      if (this.pageCache.operation == "applyTemplate") {
        sessionStorage.setItem("pageCache", JSON.stringify(this.pageCache));
      } else {
        this.nowPage["classTypeId"] = this.pageCache.classTypeId;
        sessionStorage.setItem("pageCache", JSON.stringify(this.nowPage));
      }
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
      this.loadingNew = true;
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
        page.lineObj.oldRatio = this.scaleRatio;
        pageInfo.pageSetting = {
          pageId: !isFromSaveAs ? page.pageId : saveAsPageId,
          bgImg: page.bgImg,
          pageParams: JSON.stringify(page.pageParams || []),
          specEffect: page.bgEffects || "",
          bgimgId: page.bgImageName,
          width: page.width || "",
          height: page.height || "",
          gridLine: JSON.stringify(page.lineObj)
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
                  this.pageCache.isDemo = '0'; // 另存后的页面都不属于案例
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
      } else if (operation == "applyTemplate") {
        //应用模板
        var temp = objDeepCopy(this.pageTemplateInfo);
        var pageList = [];
        for (let item of temp) {
          let pageInfo = item.pageInfo;
          let AfRelList = item.pageCompAfRelList || [];
          pageInfo.pageDetails = item.pageDetailList;
          pageInfo.pageSetting = item.pageSetting;
          pageInfo.pageDetails.forEach(val => {
            //回填afid
            for (let i = 0; i < AfRelList.length; i++) {
              if (val.elementId == AfRelList[i].elementId) {
                val.afId = AfRelList[i].afId;
                break;
              }
            }
          });
          pageList.push(pageInfo);
        }
        var param = [];
        // var afIds = [];
        if (pageList.length > 0) {
          let res = handlePageList(
            pageList,
            this.pageCache.classTypeId,
            operation
          );
          param = res.pages || [];
          // var drillFieldList = res.drillFieldList || [];
        }
        this.pageName = param[0].pageName;
        this.$store.commit("PageDesign/setPageListAndScompts", param);
        //模板应用使用静态数据，清空afId，不查询数据集
        // afIds = this.comptAfIds;
        // if (afIds != undefined && afIds.length > 0) {
        //   this.queryDSDetailList(afIds, drillFieldList);
        // }
        this.pageCache.operation = "design";
        this.upTemplateShow(false);
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
              var param = [];
              var afIds = [];
              if (pageList.length > 0) {
                let res = handlePageList(pageList);
                param = res.pages || [];
                var drillFieldList = res.drillFieldList || [];
              }
              this.pageName = param[0].pageName;
              this.$store.commit("PageDesign/setPageListAndScompts", param);
              this.$refs.rulerMain.changePos(this.scaleRatio);
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
        let param = {
          pageId: getUUID(),
          pageName: "未命名" + this.pageIndex,
          pageDetail: [],
          parentId: 0,
          orderId: this.pageOrder++,
          pageType: "1",
          bgClor: "",
          bgEffects: null,
          isWatermark: "0",
          bgImg: "",
          bgImageName: "",
          lineObj: {
            oldRatio: this.scaleRatio,
            xlines: [],
            ylines: []
          }
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
              list.forEach(function(val) {
                if (val.parentCatalogId == "myfold") {
                  if (_this.myFolder != "0") {
                    //0：隐藏 1：显示
                    first.push(val);
                  }
                } else {
                  second.push(val);
                }
              });
              first.forEach(val => {
                var temp = {};
                temp.value = val.catalogId;
                temp.id = val.catalogId;
                temp.label = val.catalogName;
                temp.level = 1;
                temp.typeId = val.classTypeId;
                temp.parentId = val.parentCatalogId;
                let children = this.generateTree(val, second);
                if (children.length > 0) {
                  temp.children = children;
                } else {
                  temp.children = [];
                }

                result.push(temp);
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
          this.treeData.forEach(function(val) {
            //forEach不能使用this否则会包指向不对
            if (val.value == "myfold") {
              temp = val;
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
      this.saveForm.catalogId = []
      this.$nextTick(() => {
        this.$refs.saveForm.clearValidate()
      })
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

    upBlock(activedBlock, activedNum) {
      this.pubStyle = false;
      //组件选中触发
      this.upActivedBlock(activedBlock);
      // this.activedBlock = index;
      this.upActivedId(activedNum);
      this.upActivedTab([]);
      if (this.activedCompt.blockInfo) {
        this.tempBlockInfo = objDeepCopy(this.activedCompt.blockInfo);
        // 公共样式宽高赋值
        let commonAttrs = this.activedCompt.styleAttrs[0].children;
        for(let i=0; i<commonAttrs.length; i++) {
          if(commonAttrs[i].enName === 'commonHeight') {
            commonAttrs[i].value = this.activedCompt.blockInfo.h;
          } else if(commonAttrs[i].enName === 'commonWidth') {
            commonAttrs[i].value = this.activedCompt.blockInfo.w;
          }
        }
      } else {
        this.tempBlockInfo = null;
      }
      if (this.activedCompt.type == "VeDragLine") {
        this.scaleValue = 100;
      }
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
      recordCommand: "OptStack/recordCommand",
      clearSnapshots: "OptStack/clearSnapshots",
      setPageTemplateInfo: "PageDesign/setPageTemplateInfo",
      upTemplateShow: "PageDesign/upTemplateShow",
      setLineObj: "PageDesign/setLineObj",
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
      applyTemplate: "PageDesign/applyTemplate",
      deleteTemplate: "PageDesign/deleteTemplate",
      previewTemplate: "PageDesign/previewTemplate",
      queryTemplate: "PageDesign/queryTemplate",
      checkIfNeedRecordFirst: "OptStack/checkIfNeedRecordFirst",
      initPageSnapshots: "OptStack/initPageSnapshots",
      executeRedoAndUndo: "OptStack/executeRedoAndUndo",
      refreshRightPanel: "PageDesign/refreshRightPanel",
      queryDbColConf: "DataSetDesign/queryDbColConf", //查询数据库字段类型
      queryDateFormatList: "DataSetDesign/queryDateFormatList",
      storeVuexStore: "storeVuexStore",
      getCompLists: "PageDesign/getCompLists",
      qryStyleAttrs: "PageDesign/qryStyleAttrs",
      queryCommonStyle: "PageDesign/queryCommonStyle"
    }),
    queryDSDetailList(afIds, drillFieldList) {
      var drillFieldArr = [];
      var _this = this;
      _this.upIsDSMapReady(false);
      _this.queryDbColConf({}).then(response => {
        if (response.status == 200 && response.data.respResult == "1") {
          _this.fieldTypeList = response.data.respData || {};
          _this.queryDateFormatList({}).then(response => {
            if (response.status == 200 && response.data.respResult == "1") {
              _this.formatList = response.data.respData || [];
              this.queryDatasetDetailList({ af_id_list: afIds })
                .then(function(response) {
                  if (response.data.respResult == 1) {
                    let dsArr = [];
                    dsArr = response.data.respData;
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
                            null,
                            null,
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
                            curField[0].dim_id != null &&
                            curField[0].dim_level_id != null
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
      if (val.type == "Query") {
        //查询组件保存时需把条件清空
        let condiFields = objDeepCopy(comptAttrs.fieldList);
        for (var k = 0; k < condiFields.length; k++) {
          if (condiFields[k].type == "ElInput") {
            condiFields[k].comptAttrs.m_value = "";
          } else if (condiFields[k].type == "ElNumber") {
            if (condiFields[k].comptAttrs.numList.length == 1) {
              condiFields[k].comptAttrs.numList = [{ id: "0", m_value: "" }];
            } else {
              condiFields[k].comptAttrs.numList = [
                { id: "1", m_value: "" },
                { id: "1", m_value: "" }
              ];
            }
          } else if (condiFields[k].type == "ElCascader") {
            condiFields[k].comptAttrs.m_value = [];
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
      if (val.type == "ElTabs" || val.type == "VanCollapse" || val.type == "ElCarousel") {
        let tabCompts = this.getTabCompts(val);
        for (let compt of tabCompts) {
          compt.comptAttrs = this.clearComptSetting(compt);
        }
      }
      return comptAttrs;
    },
    initExtendData(compt) {
      //大屏和pc共用一个json,初始化大屏样式
      let curCompt = compt[0];
      if (curCompt.type == "VeGauge") {
        this.$set(
          curCompt.comptAttrs.extendSetting,
          "series.0.startAngle",
          180
        );
        this.$set(curCompt.comptAttrs.extendSetting, "series.0.endAngle", 0);
        this.$set(
          curCompt.comptAttrs.extendSetting,
          "series.0.axisLine.lineStyle.color",
          [[0.2, "#ff9425"], [0.8, "#428ff5"], [1, "#00c58e"]]
        );
        this.$set(
          curCompt.comptAttrs.extendSetting,
          "series.0.title.color",
          "#00f6ff"
        );
        this.$set(
          curCompt.comptAttrs.extendSetting,
          "series.0.title.offsetCenter",
          [0, "20%"]
        );
        this.$delete(curCompt.comptAttrs.extendSetting, "series.0.detail.color");
        this.$delete(curCompt.comptAttrs.extendSetting, "series.0.detail.offsetCenter");
        this.$set(
          curCompt.comptAttrs.extendSetting,
          "series.0.detail.color",
          "#fff"
        );
        this.$set(
          curCompt.comptAttrs.extendSetting,
          "series.0.detail.offsetCenter",
          [0, -5]
        );
        this.$set(curCompt.comptAttrs.extendSetting, "series.0.center", [
          "50%",
          "75%"
        ]);
        this.$set(curCompt.comptAttrs.extendSetting, "series.0.radius", "120%");
        curCompt.styleAttrs[2].children[0].options[0].color = "#ff9425";
        curCompt.styleAttrs[2].children[0].options[1].color = "#428ff5";
        curCompt.styleAttrs[2].children[0].options[2].color = "#00c58e";
        this.$set(curCompt.comptAttrs, "colorArr", [
          [0.2, "#ff9425"],
          [0.8, "#428ff5"],
          [1, "#00c58e"]
        ]);
        this.$set(curCompt.comptAttrs, "linearcolorArr", [
          { offset: 0, color: "#ff9425" },
          { offset: 0.2, color: "#428ff5" },
          { offset: 0.8, color: "#00c58e" }
        ]);
        this.$set(curCompt.comptAttrs, "linearAxisLabelColor", "#fff");
        this.$set(
          curCompt.comptAttrs.extendSetting,
          "series.1.detail.color",
          "#fff"
        );
      }
    },
    updateLayer(type) {
      this.checkIfNeedRecordFirst({
        dataBefore: JSON.stringify(this.s_edcuiCompts),
        pageId: this.activedPage
      });
      switch (type) {
        case "layerTop":
          this.activedCompt.blockInfo.z = this.maxLayer;
          break;
        case "layerBottom":
          this.activedCompt.blockInfo.z = this.minLayer;
          break;
        case "layerUp":
          this.activedCompt.blockInfo.z++;
          break;
        case "layerDown":
          this.activedCompt.blockInfo.z--;
          break;
        default:
          break;
      }
      this.recordOpt({
        curPageId: this.activedPage,
        cmd: {
          commandName: type,
          dataBefore: JSON.stringify(objDeepCopy(this.s_edcuiCompts)),
          comptInfo: {}
        },
        type: "undo"
      });
    },
    onDragStopCallback(evt) {
      let blockInfo = this.activedCompt.blockInfo;
      // 点击组件块不希望记录操作
      if (
        blockInfo &&
        (this.tempBlockInfo == null ||
          (this.tempBlockInfo != null &&
            (blockInfo.x != this.tempBlockInfo.x ||
              blockInfo.y != this.tempBlockInfo.y)))
      ) {
        this.recordOpt({
          curPageId: this.activedPage,
          cmd: {
            commandName: "dragCompt",
            dataBefore: JSON.stringify(objDeepCopy(this.s_edcuiCompts)),
            comptInfo: {}
            // comptInfo: objDeepCopy(this.activedCompt) //操作的组件
          },
          type: "undo"
        });
      }
    },
    onDragStartCallback(evt) {
      this.checkIfNeedRecordFirst({
        dataBefore: JSON.stringify(this.s_edcuiCompts),
        pageId: this.activedPage
      });
      if (this.activedCompt.blockInfo) {
        this.tempBlockInfo = objDeepCopy(this.activedCompt.blockInfo);
      } else this.tempBlockInfo = null;
    },
    templateApply(id) {
      let param = { templateId: id };
      this.applyTemplate(param)
        .then(val => {
          if (val.data.respResult == 1 && val.status == 200) {
            this.setPageTemplateInfo(val.data.respData);
            this.pageCache.operation = "applyTemplate";
            this.toLoad();
          } else {
            this.setPageTemplateInfo({});
            this.$message.error("模板详情查询失败");
          }
        })
        .catch(err => {
          this.setPageTemplateInfo({});
          // this.$message.error("模板详情查询失败");
        });
    },
    templatePreview(id) {
      let param = { templateId: id };
      this.applyTemplate(param)
        .then(val => {
          if (val.data.respResult == 1 && val.status == 200) {
            let pageInfo = val.data.respData[0].pageInfo;
            pageInfo.operation = "applyTemplate";
            pageInfo.tenantId = sessionStorage.getItem("tenant_id");
            let AfRelList = val.data.respData[0].pageCompAfRelList || [];
            pageInfo.pageDetails = val.data.respData[0].pageDetailList;
            pageInfo.pageSetting = val.data.respData[0].pageSetting;
            pageInfo.pageDetails.forEach(val => {
              //回填afid
              for (let i = 0; i < AfRelList.length; i++) {
                if (val.elementId == AfRelList[i].elementId) {
                  val.afId = AfRelList[i].afId;
                  break;
                }
              }
            });
            this.setPageCache(pageInfo);
            this.toPrew();
          } else {
            this.$message.error("模板详情查询失败");
          }
        })
        .catch(err => {
          // this.$message.error("模板详情查询失败");
        });
    },
    templateDelete(id) {
      let param = [{ templateId: id }];
      this.$confirm("确认删除该模板吗", "提示", {
        closeOnClickModal: false,
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(() => {
          this.deleteTemplate(param)
            .then(val => {
              if (val.data.respResult == 1 && val.status == 200) {
                this.$message.success(val.data.respData);
                for (let i = 0; i < this.templateList.length; i++) {
                  if (this.templateList[i].templateId == id) {
                    this.templateList.splice(i, 1);
                    break;
                  }
                }
              } else {
                this.$message.error("删除模板失败");
                console.error(val.data.respErrorDesc);
              }
            })
            .catch(err => {
              // this.$message.error("删除模板失败");
            });
        })
        .catch(() => {});
    },
    onResizeStartCallback(handle, ev) {
      this.checkIfNeedRecordFirst({
        dataBefore: JSON.stringify(this.s_edcuiCompts),
        pageId: this.activedPage
      });
    },
    // 每次保存操作，都要强制更新一下，不然undo ,redo那两个图标对状态不会更新
    recordOpt(commandData) {
      this.recordCommand(commandData);
      this.$forceUpdate();
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
    }
  },
  watch: {
    scaleValue(newV, oldV) {
      document.getElementById("opt-box").style.transform =
        "scale(" + newV / 100 + ")";
    },
    isWatermark(val) {
      if (val == 1) {
        let flag = this.pageCache.classTypeId == "1001002" ? true : false;
        this.$Watermark.set("opt-box", "0", "0", "0", "0", flag);
      } else {
        this.$Watermark.unset();
      }
    },
    bgEffects: {
      handler(value) {
        this.$nextTick(() => {
          let waterWrap = document.getElementById("opt-box");
          let newCanvas = document.createElement("canvas");
          if (waterWrap && waterWrap.querySelector(".canvasWrap")) {
            waterWrap.removeChild(waterWrap.querySelector(".canvasWrap"));
          }
          if (waterWrap && this.activedPage.bgEffects != 0) {
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
      immediate: true
    }
  },
  computed: {
    indicatorLineOffset() {
      return this.lineTabOffset;
    },
    canvasScrollX() {
      return this.scrollX;
    },
    canvasScrollY() {
      return this.scrollY;
    },
    layerArray() {
      let arry = this.s_edcuiCompts.map(val => {
        return val.blockInfo.z || 0;
      });
      arry.sort((a, b) => {
        return a - b;
      });
      return arry;
    },
    maxLayer() {
      if (this.layerArray.length == 0) {
        return 0;
      }
      return this.layerArray[this.layerArray.length - 1] + 1;
    },
    minLayer() {
      return this.layerArray[0] - 1;
    },
    scaleRatio() {
      return this.scaleValue / 100;
    },
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
    bgEffects() {
      return this.nowPage.bgEffects;
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
      cursor: state => state.OptStack.cursor,
      pageTemplateInfo: state => state.PageDesign.pageTemplateInfo,
      templateShow: state => state.PageDesign.templateShow,
      xlines: state => state.PageDesign.lineObj.xlines,
      ylines: state => state.PageDesign.lineObj.ylines,
      commonStyle: state => state.PageDesign.commonStyle,
      commonStyleArr: state => state.PageDesign.commonStyleArr
    }),
    ...mapGetters({
      activedCompt: "PageDesign/getActivedCompt",
      layout: "PageDesign/getLayout",
      nowPage: "PageDesign/getActivedPage",
      getTabCompts: "PageDesign/getTabCompts",
      comptAfIds: "PageDesign/getComptAfIds",
      activeComptIdx: "PageDesign/activeComptIdx",
      comptOrder: "PageDesign/latestOrderId",
      allFlatCompts: "PageDesign/getFlatCompt"
    })
  },
  created() {
    let param={
      classTypeId:this.pageCache.classTypeId
    }
    this.getCompLists(param).then(resp=>{
      if (resp.status == 200 && resp.data.respResult == "1") {
        let list = resp.data.respData || [];
        this.setComptMenu(list);
      } else {
        this.$message.error('查询组件菜单失败');
      }
    }).catch(err=>{
      console.log(err);
    })
  },
  mounted() {
    this.upActivedBlock("");
    window.addEventListener("scroll", this.scrollHandle, true);

    if (this.templateShow) {
      //大屏新增，查询模板列表
      this.queryTemplate({})
        .then(val => {
          if (val.data.respResult == 1 && val.status == 200) {
            this.templateList = val.data.respData || [];
          } else {
            this.$message.error("查询模板列表失败");
            console.error(val.data.respErrorDesc);
          }
        })
        .catch(err => {
          // this.$message.error("查询模板列表失败");
        });
    }
    let pc = sessionStorage.getItem('pageCache');
    let pageInfo = JSON.parse(pc);
    this.setPageCache(pageInfo);
    let homeMenu = JSON.parse(window.sessionStorage.getItem("homeMenu")) || [];
    let pageTit = "内容定制";
    for (let index = 0; index < homeMenu.length; index++) {
      if (
        (this.pageCache.classTypeId + "").indexOf(homeMenu[index].classTypeId) >
        -1
      ) {
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

    // if (this.designType == 0) {
    // 监听窗口resize
    // this.setScale();
    window.onresize = e => {
      if (e.isTrusted) {
        this.setScale();
      }
    };
    // }
    document.body.addEventListener("click", () => {
      _this.contextMenuShow = false;
      _this.layerContextMenuShow = false;
      _this.comptListShow = false;
      this.comptPanelId = "";
    });
    if(document.querySelector(".query-design")!=undefined && document.querySelector(".query-design")!=""){
      document.querySelector(".query-design").addEventListener("click", e => {
        let list = document.querySelectorAll(".handle");
        let escape = false;
        for (var i = 0; i < list.length; i++) {
          if (list[i].style.display == "block") {
            escape = true;
            break;
          }
        }
        if (escape) {
          return;
        }
        _this.upActivedBlock("");
        _this.upActivedId({});
        _this.upActivedTab([]);
        _this.clearAlign();
      });
    }
    if(document.querySelector(".el-aside") != undefined && document.querySelector(".el-aside")!=''){
      document.querySelector(".el-aside").addEventListener("click", e => {
        _this.upActivedBlock("");
        _this.upActivedId({});
        _this.upActivedTab([]);
        _this.clearAlign();
      });
    }
    eventBus.$on("addTabCompt", this.addTabCompt);
    eventBus.$on("deleteTabCompt", this.deleteTabCompt);

    this.setScale();
    document
      .getElementsByTagName("body")[0]
      .setAttribute("class", "bigscreen-body-wrap");
  },
  activated() {
    if (this.pageCache.pageId != null) {
      this.setPageDetail([]);
    }
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
      width: 10px;
      height: 10px;
      border: 1px solid #409eff;
      transform: rotate(45deg);
      bottom: -1px;
      background: #315a84;
      right: 5px;
      z-index: 11;
      border-right: none;
      border-bottom: none;
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
  background: #0e3b67;
  border-bottom: 1px solid #0a2b4c;
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
  background: #0e3b67;
  overflow: hidden;
  z-index: 99;

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
          color: #afc0d0;
        }
      }
    }
  }

  .page-tab {
    cursor: pointer;
    width: 100px;
    border-right: 1px solid #0a2b4c;
    padding: 0 5px;
    background: #315a84;

    &:first-child {
      border-left: 1px solid #0a2b4c;
    }

    &:hover,
    &.active {
      background: #409cfb;
      color: #fff !important;
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
    color: #4e7ba9;

    &:hover {
      color: #409cfb;
    }
  }

  .next-btn {
    color: #4e7ba9;
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
      border: 1px solid #0a2b4c;
      background: #315a84;
      border-radius: 5px;
      line-height: 17px;
      margin-top: 5px;
      color: #afc0d0;
      text-align: center;
      &:hover {
        background: #409cfb;
        color: #fff;
      }
    }
  }

  .scale-bar {
    float: right;
    width: 265px;

    .slider-icon {
      float: left;
      font-size: 16px;
      color: #4e7ba9;
      margin-top: 7px;
      cursor: pointer;
      &:hover {
        color: #409cfb;
      }
    }

    .slider-bar {
      float: left;
      width: 200px;
      margin-left: 10px;
      margin-right: 10px;

      /deep/ .el-slider__runway {
        margin: 12px 0;
        background-color: #4e5e6c;
      }

      /deep/ .el-slider__button-wrapper {
        width: 26px;
        height: 26px;
        top: -10px;
      }

      /deep/ .el-slider__bar {
        background-color: #315a84;
      }

      /deep/ .el-slider__button {
        width: 6px;
        height: 15px;
        border-radius: 10px;
        background-color: #4e7ba9;
        border: none;
      }
      /deep/ .el-slider__button.hover {
        background-color: #409cfb;
      }
    }
  }
}

.yaxis-line {
  padding-left: 5px;
  border-left: 1px solid #0698de;
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 99;
  cursor: ew-resize;
}

.xaxis-line {
  padding-top: 5px;
  border-top: 1px solid #0698de;
  position: absolute;
  left: 0;
  right: 0;
  z-index: 99;
  cursor: ns-resize;
}

.xline-label {
  position: absolute;
  left: 20px;
  font-size: 12px;
  color: #fff;
}

.yline-label {
  position: absolute;
  top: 0;
  font-size: 12px;
  color: #fff;
}

.auto-wrap {
  float: left;
  min-width: 100%;
  min-height: 100%;
  position: relative;
  overflow: hidden;
}

.design-main {
  overflow: hidden;
  &.el-main {
    background-color: #0a2b4c;
    padding-top: 60px;
    padding-bottom: 30px;
    padding-right: 0;
    padding-left: 0;

    .query-design {
      position: relative;
      width: 100%;
      height: 100%;
      outline: none;
      overflow: hidden;
      /deep/ .el-scrollbar__wrap {
        overflow-x: hidden;
      }
      /deep/ .el-scrollbar__bar.is-horizontal {
        display: none;
      }
      &.mobile-design {
        position: relative;
        width: 375px !important;
        height: 667px !important;
        margin: 0 auto;
        top: 50%;
        margin-top: -333.5px;
      }
    }

    #opt-box {
      background-color: #0a2b4c;
      border: 1px dashed #2f5377;
      background-repeat: no-repeat;
      background-position: center center;
      background-size: 100% 100%;
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
  background: #0e3b67;
  overflow: hidden;
  margin: 10px;
  margin-bottom: 0px;
  border-radius: 5px;
  border: 1px solid transparent;

  &:hover {
    border-color: #409eff;
    background: #0a2b4c;
  }

  img {
    width: 100%;
  }
}

.compt-list-tit {
  color: #afc0d0;
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
  z-index: 999;
  border: 1px dashed $border1;
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
  font-size: 24px;
  color: #2f5377;
  text-align: center;
  transform: translateY(-50%);
  position: relative;
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
  z-index: 100;

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

.layer-contextmenu {
  position: absolute;
  width: 80px;
  background: #fff;
  border: 1px solid #eee;
  box-shadow: 0 0.5em 1em 0 rgba(0, 0, 0, 0.1);
  border-radius: 1px;
  z-index: 100;
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

#layer-hide {
  width: 0px;
  transition: width 0.3s linear;
  background: #0e3b67;
  border-right: 1px solid #0a2b4c;
  overflow-x: hidden;
  .layer-tit {
    height: 40px;
    line-height: 40px;
    width: 150px;
    color: #fff;
    background: #0e3b67;
    border-bottom: 1px solid #0a2b4c;
    padding: 0 10px;
    overflow: hidden;
    .layer-icon {
      float: right;
      span {
        cursor: pointer;
        &:hover {
          color: #409eff;
        }
      }
    }
  }
}

#attr-panel {
  border-left: 1px solid #0a2b4c;
  background: #0e3b67;
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
  color: #fff;
  font-size: 16px;
  padding-top: 3px;
  padding-left: 20px;
  padding-bottom: 3px;
  text-align: left;
  // border-bottom: 1px solid #DCDFE6;
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
  background: #315a84;
  z-index: 1000;
  padding-left: 20px;
  padding-right: 0px;
  padding-top: 10px;
  padding-bottom: 15px;
  overflow: hidden;
  border-radius: 5px;
  box-shadow: 5px 5px 12px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #409eff;
}
/deep/ .el-scrollbar__thumb {
  background-color: rgba(10, 43, 76, 0.6);
}
.scroll-cont {
  /deep/ .el-scrollbar__wrap {
    overflow: visible;
    overflow-x: hidden;
  }
}
.no-title {
  height: 100%;
}
.has-title {
  height: 100%;
  margin-top: -30px;
  padding-top: 28px;
  padding-bottom: 16px;
}
.layer-list {
  padding-top: 15px;
  overflow-x: hidden;
  overflow-y: auto;
  position: absolute;
  top: 42px;
  bottom: 0;
  left: 0;
  right: 0;
  .layer-list-item {
    height: 40px;
    line-height: 40px;
    color: #afc0d0;
    border-top: 1px solid transparent;
    border-bottom: 1px solid transparent;
    padding-left: 11px;
    overflow: hidden;
    cursor: pointer;
    &:hover,
    &.actived {
      color: #fff;
      background-color: #3d6082;
      border-color: #0e3b67;
    }
    &:hover {
      background-color: #315a84;
    }
    .list-item-icon {
      float: left;
      line-height: 40px;
      padding-right: 10px;
    }
    .list-item-text {
      float: left;
      max-width: 85px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .layer-lock-icon {
      float: right;
      line-height: 40px;
      margin-right: 11px;
    }
  }
}

/deep/.gm-scrollbar-container {
  width: calc(100% + 1px);
}

.alignReady {
  outline: 5px solid #409cfb;
}

/deep/.el-scrollbar__wrap {
  overflow-x: hidden;
}

#template-list {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1002;
  padding: 20px;
  background-color: #0e3b67;
  padding-bottom: 5px;
  .template-list-title {
    font-size: 16px;
    color: #afc0d0;
    padding-bottom: 5px;
    border-bottom: 2px solid #3d5b78;
    .template-icon {
      margin-right: 10px;
      vertical-align: -1px;
    }
  }
  .template-list-item {
    height: 100%;
    margin-left: -20px;
    margin-top: -38px;
    padding-top: 38px;
    .template-block {
      float: left;
      width: 428px;
      height: 276px;
      border: 1px solid #000;
      margin-left: 20px;
      margin-top: 10px;
      margin-bottom: 10px;
      position: relative;
      &.goto-design {
        background: #0a2b4c;
        color: #999999;
        text-align: center;
        cursor: pointer;
        span {
          display: block;
          font-size: 38px;
          margin-top: 105px;
          margin-bottom: 10px;
        }
        p {
          font-size: 19px;
        }
      }
      .template-img {
        height: 240px;
        img {
          width: 100%;
          height: 100%;
        }
      }
      .template-name {
        text-align: center;
        height: 34px;
        line-height: 34px;
        background: #4b759f;
        color: #0a2b4c;
        font-size: 16px;
      }
      &.actived,
      &:hover {
        border-color: #409eff;
        box-shadow: #409eff 0px 0px 2px 0px;
        .template-name {
          background: #409eff;
          color: #fff;
        }
        .template-toolbar {
          display: block;
        }
      }
      .template-toolbar {
        position: absolute;
        top: 5px;
        right: 15px;
        display: none;
      }
      .template-toolbar-item {
        width: 37px;
        height: 37px;
        background: #c0c4cc;
        font-size: 20px;
        text-align: center;
        line-height: 40px;
        color: #0a2b4c;
        border-radius: 5px;
        margin-left: 5px;
        float: left;
        cursor: pointer;
        &:hover {
          background: #f2f6fc;
          color: #4385fb;
        }
      }
    }
  }
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
.canvasWrap {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: -2;
}
.ring-lable-bt {
  position: absolute;
  color: #00f6ff;
  bottom: 3px;
  width: 100%;
  text-align: center;
}
.warning {
  color: #ff6000;
  animation: text-grad 1s ease-in infinite;
}
@keyframes text-grad {
  0% {
    color: #fff000;
  }
  50% {
    color: #ff0000;
  }
  100% {
    color: #fff000;
  }
}
/* 组件图标的tooltip */
.el-tooltip__popper.compt-icon-toolTip {
  pointer-events: none;
}
</style>
