<template>
  <el-container id="content-main">
    <el-header id="header-wrap"
      v-show="queryCriteria"
      style="height:auto;min-height: 70px;padding: 20px 20px 0px">
      <div class="header-compts"
        @click="showJIXI">
        <div style="height:100%">
          <Cell :isDesign="false"
            :vscompt="edcuiCompts[0]"></Cell>
        </div>
      </div>
      <div class="header-buttons">
        <span class="h-btns"
          @click="exportReportHis">
          <i class="icon-A10192_time"></i>
          <span>导出历史</span>
        </span>
      </div>
    </el-header>
    <el-container class="main-block">
      <div style="height:100%;width:100%;"
        @click="upActivedNum(1)">
        <el-container class="main-block">
          <el-aside v-show="asideSign"
            style="width: 150px;"
            class="m-aside">
            <el-container>
              <el-header class="m-asd-header">
                区域管理
                <div class="m-asd-opr">
                  <el-tooltip class="item"
                    :enterable='false'
                    effect="dark"
                    content="上移"
                    placement="bottom">
                    <span class="icon-A10584_Uppe"
                      @click="Reorder('up')"></span>
                  </el-tooltip>
                  <el-tooltip class="item"
                    :enterable='false'
                    effect="dark"
                    content="下移"
                    placement="bottom">
                    <span class="icon-A10585_lower"
                      @click="Reorder('lower')"></span>
                  </el-tooltip>
                  <el-tooltip class="item"
                    :enterable='false'
                    effect="dark"
                    content="刷新"
                    placement="bottom">
                    <span class="el-icon-refresh"
                      @click="updataAll"></span>
                  </el-tooltip>
                </div>
              </el-header>
              <el-main>
                <el-scrollbar style="height:100%;"
                  :native="false"
                  :noresize="false"
                  tag="section">
                  <ul class="area-list">
                    <li v-for="(item, index) in dataList"
                      :key="item.area_id"
                      @click.self="setCurArea(item)"
                      :dataIndex="index"
                      :class="{selected: item.area_name === cur_areaName}">
                      <span class="list-no"
                        @click.self="setCurArea(item)">{{index + 1}}</span>
                      <el-tooltip class="item"
                        :enterable='false'
                        effect="dark"
                        content="设置"
                        placement="bottom">
                        <span class="list-setting icon-A10344_setting"
                          @click.stop="areaSitePrompt(item,index)"></span>
                      </el-tooltip>
                      <el-tooltip class="item"
                        :enterable='false'
                        effect="dark"
                        content="删除"
                        placement="bottom">
                        <span class="list-delete icon-A10065_delete"
                          @click.stop="dropArea(item,index)"></span>
                      </el-tooltip>
                      <div class="area-div"
                        v-show="index!==areaHide"
                        @click.self="areaClick(item,index)"
                        @dblclick.stop="inputareaName(item,index,$event)"
                        :title="item.area_name">{{item.area_name}}</div>
                      <el-input class="list-input"
                        size="mini"
                        autofocus
                        :ref="'xxx'+index"
                        v-model="item.area_name"
                        v-show="index===areaHide"
                        @focus.stop.self="cur_areaName = item.area_name"
                        @change.self="val=>editAreaName(val,index)"
                        @blur="areaHide=-1"></el-input>
                    </li>
                    <li>
                      <div>
                        <p>刷新区域顺序：</p>
                        <p>“自下而向上”</p>
                      </div>
                    </li>
                  </ul>
                </el-scrollbar>
              </el-main>
            </el-container>
          </el-aside>
          <el-main class="m-right-main">
            <el-container>
              <el-header style="height: 44px;"
                class="main-header">
                <el-row :gutter="10">
                  <el-col :span="1"
                    style="z-index:182"
                    v-show="showAreaAdjust">
                    <span class="m-h-opr"
                      @click="asideShowChange">
                      <el-tooltip class="item"
                        :enterable='false'
                        effect="dark"
                        :content="asideSign?'关闭“区域管理”':'区域管理'"
                        placement="bottom">
                        <span v-if="asideSign"
                          class="icon-A10018_doubleArrowLeft"></span>
                        <span v-else
                          class="icon-A10019_doubleArrowRight"></span>
                      </el-tooltip>

                    </span>
                  </el-col>
                  <el-col style="width: 100px;"
                    :class="{'show-margin': !showAreaAdjust}">
                    <el-tooltip class="item"
                      :enterable='false'
                      effect="dark"
                      content="名称框"
                      placement="bottom">
                      <el-input v-model="cur_cellInput"
                        @blur="changeCellInput"
                        @keyup.enter.native="changeCellInput"
                        class="cell-input"
                        size="mini"></el-input>
                    </el-tooltip>
                  </el-col>
                  <el-col :span="1"
                    gutter="10"
                    class="m-func">
                    <i class="icon-A10670_InsertFunction"></i>
                  </el-col>
                  <el-col :span="15">
                    <el-input ref="cellInput"
                      id="cellInput"
                      style="opacity:1"
                      v-model="cur_cellText"
                      @blur="setCellData"
                      @focus="getCellsText"
                      @click.native="explainShow('input')"
                      @input="cellTextChange"
                      @keyup.enter.native="setCellsText"
                      size="mini"></el-input>
                  </el-col>
                </el-row>

              </el-header>
              <el-main class="table-wrap"
                :class="[{fmshow:fmPainter,'area-manage':asideSign,'hide-comment':newComment==='0'},beatClass]">
                <!-- handsontable -->
                <span class="icon-A10654_formatBrush fbmouse"></span>
                <div ref="formulasWrap"
                  class="formulas-wrap"
                  v-if="showFormula!=='0'"
                >
                  <div class="fml-panel el-cascader-panel is-bordered"
                    v-show="fmlPanelShow">
                    <div class="el-cascader-menu"
                      role="menu"
                      id="cascader-menu-989-0">
                      <el-scrollbar style="height:100%;"
                        :native="false"
                        :noresize="false"
                        tag="section">
                        <ul class="el-cascader-menu__list"
                          style="max-height:250px;">
                          <li role="menuitem"
                            :class="{'is-active':isActive==index}"
                            v-for="(item,index) in formulasData"
                            :key="'cascader-menu-989-0-'+index"
                            :id="'cascader-menu-989-0-'+index"
                            tabindex="-1"
                            class="el-cascader-node"
                            @click="showFmExplain(index)"
                            @dblclick="selectFormulas(index)"
                            @keyup.enter="selectFormulas">
                            <span class="el-cascader-node__label">{{item.label}}</span>
                          </li>
                        </ul>
                      </el-scrollbar>
                    </div>
                  </div>
                  <div ref="fmPopover"
                    id="fm-popover"
                    role="tooltip"
                    aria-hidden="false"
                    v-show="fmlPopoverShow"
                    class="el-popover el-popper el-popover--plain"
                    x-placement="left">
                    <div class="el-popover__title">{{fmlTitle}}</div>
                    {{fmlExplain }}
                    <div class="popper__arrow"
                      style="top: 18px;"></div>
                  </div>
                </div>
                <el-input v-model="sheetNameLabel"
                  ref="sheetNameIpt"
                  v-show="showSheetNameIpt"
                  placeholder="标签名"
                  size="mini"
                  @keyup.enter.native.prevent="completeSheetName"
                  @blur.stop="completeSheetName"
                  @input.native="sheetNameChange"
                  class="report-sheet-name"></el-input>
                <el-tabs tab-position="bottom"
                  type="border-card"
                  v-model="editableTabsValue"
                  editable
                  @tab-remove="removeTab"
                  @tab-add="addTab()"
                  :before-leave="beforeLeave"
                  style="height: 100%; margin: 0;"
                  v-loading="loading">
                  <el-tab-pane v-for="(item, index) in editableTabs"
                    :key="item.name"
                    :label="item.title"
                    :ref="'sheet'+index"
                    :name="item.name">
                    <span slot="label"
                      @dblclick="showNameIpt"
                      :title="item.title"
                      style="display:inline-block;width:60px;"
                    >
                      {{item.title}}
                    </span>
                    <div style="height:100%"
                      :id="`htTable${item.name}`"></div>
                    <bd-draggable-resizable
                      v-if="chartData.length>0"
                      v-for="(compt,index) in chartData"
                      :ref="'chart'+compt.comptId"
                      :w="compt.blockInfo.w"
                      :h="compt.blockInfo.h"
                      :x="compt.blockInfo.x"
                      :y="compt.blockInfo.y"
                      :z="compt.blockInfo.z"
                      :min-width="40"
                      :min-height="20"
                      class="chartCompt"
                      :draggable="true"
                      :resizable="true"
                      :grid="[1,1]"
                      :key="compt.comptId"
                      :data-id="compt.comptId"
                      @resizestop="onResizstop"
                      @dragging="onDrag"
                      @resizing="dragResize"
                      @activated="chartActive(compt)"
                      @deactivated="chartDeactive(compt)"
                      :onDragStart="dragResizeCallback"
                      :onResizeStart="dragResizeCallback"
                    >
                      <div
                        style="width:100%;height:100%;overflow:hidden;background:#fff;"
                      >
                        <Cell
                          :isDesign="true"
                          :vscompt="compt"
                          :scaleRatio="1"
                        ></Cell>
                      </div>
                  </bd-draggable-resizable>
                  </el-tab-pane>
                </el-tabs>
              </el-main>
            </el-container>
          </el-main>
        </el-container>
      </div>
    </el-container>
    <el-dialog size="mini"
      title="导出历史"
      width="700px"
      class="queryHis"
      :before-close="handleClose"
      :visible.sync="exportReportHisDialog"
      :append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <ExportReportHistory v-if="exportReportHisDialog"></ExportReportHistory>
    </el-dialog>
    <el-dialog size="mini"
      title="行高设置"
      :visible="rowHeightSet"
      width="200px"
      :before-close="handleRHSet"
      :append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <div style="margin: 0 auto;display: block;">
        <el-input size="mini"
          @input.native="validateNumber($event)"
          v-model="rowHeight"
          placeholder="行高"
          style="width: 140px;margin-right: 3px;"></el-input>px
      </div>
      <span slot="footer"
        class="dialog-footer">
        <el-button size="mini"
          @click="upRowHeightSet(false)">取 消</el-button>
        <el-button size="mini"
          type="primary"
          @click="commitRowHeight">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog size="mini"
      title="列宽设置"
      :visible="colWidthSet"
      width="200px"
      :before-close="handleCWSet"
      :append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <div style="margin: 0 auto;display: block;">
        <el-input size="mini"
          @keyup.native="validateNumberCol($event)"
          v-model="colWidth"
          placeholder="列宽"
          style="width: 140px;margin-right: 3px;"></el-input>px
      </div>
      <span slot="footer"
        class="dialog-footer">
        <el-button size="mini"
          @click="upColWidthSet(false)">取 消</el-button>
        <el-button size="mini"
          type="primary"
          @click="commitColWidthSet">确 定</el-button>
      </span>
    </el-dialog>
    <ExportReport v-if="exportReportFile"></ExportReport>
    <el-dialog size="mini"
      title="设置区域起始位置"
      :visible="areaSiteSetShow"
      width="250px"
      :append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="()=>{areaSiteSetShow=false}">
      <div style="margin: 0 auto;display: block;">
        <el-tooltip class="item"
          :enterable='false'
          effect="dark"
          :content="cur_areaName"
          placement="bottom">
          <label class="area-title">{{cur_areaName}}</label>
        </el-tooltip>
        <el-input ref="siteInput"
          size="mini"
          v-model="areaSite"
          placeholder="位置"
          @focus="initAreaSite=areaSite"
          style="width: 140px;margin-right: 3px;"></el-input>
      </div>
      <span slot="footer"
        class="dialog-footer">
        <el-button size="mini"
          @click="areaSiteSetShow=false">取 消</el-button>
        <el-button size="mini"
          type="primary"
          @click="refreshArea">确 定</el-button>
      </span>
    </el-dialog>
  </el-container>
</template>
<script>
import Cell from "../design/Cell.vue";
import { HST } from "../../utils/HandsTable.js";
import { mapState, mapGetters, mapMutations, mapActions } from "vuex";
import { HotTable } from "@handsontable/vue";
import Handsontable from "handsontable";
import ExportReportHistory from "../design/ExportReportHistory.vue"
import ExportReport from "../design/ExportReport.vue"
import { objDeepCopy,windowResize } from "../../utils/comonFunc.js"
import BdDraggableResizable from "bd-draggable-resizable";
import "vue-draggable-resizable/dist/VueDraggableResizable.css";


var elementResizeDetectorMaker = require("element-resize-detector");
export default {
  components: {
    HotTable,
    Cell,
    ExportReportHistory,
    ExportReport,
    BdDraggableResizable
  },
  name: "reportMain",
  data() {
    return {
      cur_cellInput: "A1",
      cur_cellText: "",
      dataList: [],
      editableTabsValue: "1",
      loading: true,
      sheetNameLabel: '',
      showSheetNameIpt: false,
      // tempData: [],
      showAreaAdjust: true,
      areaSiteSetShow: false,
      areaSite: '',
      initAreaSite: '',
      areaHide: -1,
      dbl: false,
      cur_areaName: '',
      mouseInTable: false,//标识鼠标是否位于表格区域
      beatClass: '',//当前选中区域class
      fmlModel: "",
      fmlTitle: "",
      fmlExplain: "",
      formulasData: [],
      isActive: -1,
      timeInteval: 0,//输入单元格时间间隔
      htInputSltEnd: 0,//handsontableInput 光标位置
      oldCellText: '',//hansontableInput 文字
      chartData: [],
      activedChart: null
    };
  },
  computed: {
    ...mapState({
      hot: state => state.ReportMgt.hot,
      rowHeightSet: state => state.ReportMgt.rowHeightSet,
      colWidthSet: state => state.ReportMgt.colWidthSet,
      hotObj: state => state.ReportMgt.hotObj,
      edcuiCompts: state => state.ReportMgt.edcuiCompts,
      queryCriteria: state => state.ReportMgt.queryCriteria,
      asideSign: state => state.ReportMgt.asideSign,
      editableTabs: state => state.ReportMgt.editableTabs,
      tabIndex: state => state.ReportMgt.tabIndex,
      activedNum: state => state.ReportMgt.activedNum,
      cellInput: state => state.ReportMgt.cellInput,
      cellText: state => state.ReportMgt.cellText,
      loaderSign: state => state.ReportMgt.loaderSign,
      sheetIndex: state => state.ReportMgt.sheetIndex,
      reportLoading: state => state.ReportMgt.reportLoading,
      exportReportHisDialog: state => state.ReportMgt.exportReportHisDialog,
      fmPainter: state => state.ReportMgt.fmPainter,
      leaveTab: state => state.ReportMgt.leaveTab,
      exportReportFile: state => state.ReportMgt.exportReportFile,
      maxCols: state => state.ReportMgt.maxCols,
      maxRows: state => state.ReportMgt.maxRows,
      refreshNum: state => state.ReportMgt.refreshNum,
      warnMessage: state => state.ReportMgt.warnMessage,
      messageSign: state => state.ReportMgt.messageSign,
      tempData: state => state.ReportMgt.tempData,
      fmlPanelShow: state => state.ReportMgt.fmlPanelShow,
      fmlPopoverShow: state => state.ReportMgt.fmlPopoverShow,
      insertFunc: state => state.ReportMgt.insertFunc,
      manualColWidths: state => state.ReportMgt.manualColWidths,
      manualRowHeights: state => state.ReportMgt.manualRowHeights,
      areaChangeFlag: state => state.ReportMgt.areaChangeFlag,
      areaInfo: state => state.ReportAttr.areaInfo,
      pageCache: state => state.HomeBody.pageCache,
      loadingEnd: state => state.HomeBody.loadingEnd,
      reportColumnLimit: state => state.commonProperties.report.columnLimit,
      reportRowLimit: state => state.commonProperties.report.rowLimit,
      newComment: state => state.commonProperties.report.newComment,
      nullAutoFill: state => state.commonProperties.report.nullAutoFill,
      showFormula: state => state.commonProperties.report.formula
    }),
    ...mapGetters({
      isQuery: "QueryTable/isQuery"
    }),
    rowHeight: {
      get() {
        return this.$store.state.ReportMgt.rowHeight;
      },
      set(val) {
        this.upRowHeight(val);
      }
    },
    colWidth: {
      get() {
        return this.$store.state.ReportMgt.colWidth;
      },
      set(val) {
        this.upColWidth(val);
      }
    }
  },
  watch: {
    cellInput(val) {
      this.cur_cellInput = val
    },
    cellText(val) {
      this.cur_cellText = val
    },
    cur_cellText(val) {
      this.upCellText(val)
      this.textChange()
    },
    loaderSign(sign) {
      let editableTabs = [];
      if (sign == true) {
        try {
          let tableList = this.edcuiCompts[1].comptAttrs.tableList;
          for (let i = 0, length = tableList.length; i < length; i++) {
            this.upTabIndex(this.tabIndex + 1);
            editableTabs.push({
              title: tableList[i].sheet_name,
              name: tableList[i].sheet_index
            });
          }
        } catch (e) {
          console.error(e)
        }
      } else if (sign == "default") {
        let newTabName = this.tabIndex + "";
        this.upTabIndex(this.tabIndex + 1);
        this.editableTabsValue = newTabName;
        editableTabs.push({
          title: `sheet${newTabName}`,
          name: newTabName
        });
      }
      this.upEditableTabs(editableTabs);
      let isQuery = this.isQuery('1003');
      if (!isQuery) {
        this.$message.warning("必填字段不能为空");
        this.resetReportLoading(false);
      }
      this.loadSheetData('1');
      //条件区变化时 表格区域resize
      this.resizeTable();
    },
    reportLoading(val) {
      this.loading = val
    },
    fmPainter(val) {
      if (val == false) {
        document.querySelector('.fbmouse').style['display'] = 'none'
      }
    },
    messageSign(val) {
      if (!!this.warnMessage.message && this.warnMessage.message != '') {
        this.$message(this.warnMessage)
        this.upWarnInfo("")
        this.upWarnMessage("")
        // this.resetReportLoading(false)
        // this.upLoadingEnd(true)
      }
    },
    fmlPanelShow(val) {
      if (!val) {
        this.isActive = -1
      }
      this.panelChange(val)
    },
    insertFunc(val) {
      if (val) {
        this.upInsertFunc(false)
        this.explainShow("textarea")
      }
    },
    //监听撤销操作，重新调用区域位置信息刷新操作
    areaChangeFlag(param) {
      if (param.type === 'reorder') {
        let { sort, index } = param
        this.Reorder(sort, index, false)
      } else if (param.type === 'resetSite') {
        let { newVal, origVal, name } = param
        this.areaSite = newVal
        this.initAreaSite = origVal
        this.cur_areaName = name
        this.refreshArea(false)
      }
    },
    sheetIndex: {
      handler(newVal, oldVal) {
        let tabList = this.edcuiCompts[1].comptAttrs.tableList;
        for(let item of tabList) {
          if(item.sheet_index == newVal) {
            if(!item.chartData){
              this.$set(item,'chartData',[]);
            }
            this.chartData = item.chartData;
            break;
          }
        }
        setTimeout(() => {  //筛选状态回显
          let index = HST.searchCurSheet().index;
          this.upShowFilter(tabList[index].show_filter || false);
        }, 500);

      }
    }
  },
  methods: {
    showJIXI() {
      this.upActivedNum(0);
      let list = this.edcuiCompts[0].comptAttrs.fieldList;
      if(list.length > 2) {
        this.colFillback(list);
      }
    },
    enterTabs($event) {
    },
    handleRHSet() {
      this.upRowHeightSet(false);
    },
    handleCWSet() {
      this.upColWidthSet(false);
    },
    validateNumber($event) {
      let height = this.rowHeight;
      height = height.replace(/[^\.\d]/g, '');
      height = height.replace(/\./g, '');
      this.upRowHeight(height);
    },
    validateNumberCol($event) {
      let width = this.colWidth;
      width = width.replace(/[^\.\d]/g, '');
      width = width.replace(/\./g, '');
      this.upColWidth(width);
    },
    commitRowHeight() {
      let height = parseInt(this.rowHeight);
      if (height < 22 || height > 682) {
        this.$message.warning('行高必须在22-682px之间');
        return;
      }
      HST.setRowHeight(height);
    },
    commitColWidthSet() {
      let colWidth = parseInt(this.colWidth);
      if (colWidth < 20 || colWidth > 1800) {
        this.$message.warning('列宽必须在20-1800px之间');
        return;
      }
      HST.setColWidth(colWidth);
    },
    sheetNameChange() {
      let sheetName = this.sheetNameLabel;
      var reg = /[^\d\w\u4E00-\u9FA5]/g;
      this.sheetNameLabel = sheetName.replace(reg, '');
    },
    completeSheetName(e) {
      this.$nextTick(_ => {
        let sheetName = this.sheetNameLabel;
        var reg = /^\s*?(.+)(\s*)/g;
        sheetName = sheetName.replace(reg, '$1');
        let CurSheet = HST.searchCurSheet(),
          index = CurSheet.index;
        if (CurSheet.sheetName) {
          let sameNames = this.editableTabs.filter((table, idx) => table.title == sheetName && idx != index);
          if (sameNames.length > 0 && CurSheet.sheetName) {
            this.$message.warning('sheet名称不能重复，请重新输入');
            this.sheetNameLabel = this.editableTabs[index].title
            return;
          }
          if (sheetName == '' && CurSheet.sheetName) {
            this.$message.warning('sheet名称不能为空，请重新输入');
            this.sheetNameLabel = this.editableTabs[index].title
            return;
          }
          if (this.countWords(sheetName) > 30) {
            this.$message.warning('sheet名称太长，请重新输入');
            this.sheetNameLabel = this.editableTabs[index].title
            return;
          }
          this.editableTabs[index].title = sheetName;
          this.edcuiCompts[1].comptAttrs.tableList[index].sheet_name = sheetName;
          this.$set(this.editableTabs[index], 'title', sheetName);
          this.$set(this.edcuiCompts[1].comptAttrs.tableList[index], 'sheet_name', sheetName);
          let arr = this.edcuiCompts[0].datasets || [];
          arr.forEach(ds => {
            if (ds.sheet_index == CurSheet.sheet_index) {
              ds.sheet_name = sheetName;
              let label = ds.label;
              label = label.replace(/(.*?)\:/g, ':');
              ds.label = sheetName + label;
            }
          });
          this.edcuiCompts[0].datasets = [...arr];
          this.showSheetNameIpt = false;
          this.hot.selectCell(0, 0);
        }
      });
    },
    countWords(str) {
      let len = 0, a;
      let str_len = str.length;
      for (var i = 0; i < str_len; i++) {
        a = str.charAt(i);
        len++;
        if (escape(a).length > 4) {
          len++;
        }
      }
      return len;
    },
    showNameIpt(e) {
      let sheetName = this.$refs.sheetNameIpt;
      let left = parseInt(e.target.parentNode.offsetLeft);
      let parent = document.querySelector('.table-wrap .el-tabs__nav');
      let transformValue = parent.style.transform.replace(/translateX\((.*)\)/g, '$1');
      let width = parseInt(parent.clientWidth);
      let parent2 = document.querySelector('.table-wrap .el-tabs__nav-scroll');
      let scrollLeft = parseInt(transformValue);
      let width2 = parseInt(parent2.clientWidth);
      let offset = (width - width2) > 0 ? (20) : 0;
      sheetName.$el.style.left = left + scrollLeft + offset + 10 + 'px';

      let index = HST.searchCurSheet().index;
      if (index != -1) {
        this.sheetNameLabel = this.edcuiCompts[1].comptAttrs.tableList[index].sheet_name;
        this.showSheetNameIpt = true;
        this.hot.deselectCell();
        this.$nextTick(() => {
          let obj = this.$refs.sheetNameIpt;
          obj.$el.querySelector('input').focus();
        });
      }
    },
    loadSheetData(activeName) {
      let elmId = "htTable" + activeName;
      const tableList = this.edcuiCompts[1].comptAttrs.tableList
      let tableData = []
      tableList.some((res, index) => {
        if (res.sheet_index == activeName) {
          tableData = res;
          if(!res.chartData){
            this.$set(res,'chartData',[]);
          }
          this.chartData = res.chartData;
          return true
        }
        return false
      })
      let setting = { ...HST.htData, data: [[]] };
      const func = HST.numFormatSetting(tableData.numericFormat||[], 'noRun')//数据格式化加载
      if (!!tableData) {
        setting = {
          ...setting,
          data: tableData.static_data_list,
          cell: tableData.style_list,
          mergeCells: tableData.merge_list,
          cells: func,
          fixedRowsTop: tableData.fixedRowsTop || 0,
          fixedColumnsLeft: tableData.fixedColumnsLeft || 0,
          manualColumnFreeze: true,
          hiddenColumns: {
            copyPasteEnabled: true,
            indicators: true,
            columns: tableData.hidden_col_list
          },
          hiddenRows: {
            copyPasteEnabled: true,
            indicators: true,
            rows: tableData.hidden_row_list
          },
          filters: tableData.show_filter,
          dropdownMenu: tableData.show_filter ? [ //下拉组件
            "filter_by_condition",
            "filter_by_value",
            "filter_action_bar"
          ] : false
        };
      }
      setTimeout(() => {
        let hot = new Handsontable(document.getElementById(elmId), setting),
          data = {};
        data[activeName] = hot;
        let hObj = { data: data, type: "add" };
        this.upHot(hot);
        HST.initEvent(hot);
        this.upHotObj(hObj);
        //更新区域数据
        this.updateSheetDataSet(activeName - 1);
        this.resizeRowColumn(activeName - 1);
        // window.top.document.querySelector('.htCommentsContainer').style.display = 'none'
        let htInput = document.getElementById(elmId).querySelector('.handsontableInput')
        htInput.setAttribute('onInput', 'inputChange()')
        htInput.setAttribute('onClick', 'explainShow("textarea")')
        htInput.setAttribute('onblur', 'htInputBlur()')
      }, 100);
    },
    asideShowChange() {
      this.upAsideSign(!this.asideSign);
      if (this.asideSign) {
        HST.cellOnClass("")
        this.upDataList()
        this.$nextTick(() => {
          this.hot.render()
        });
      } else {
        HST.removeAreaComments()
        this.cur_areaName = ''
        this.beatClass = ''
        this.$nextTick(() => {
          this.hot.render()
        });
      }
    },
    upDataList() {
      let index
      const list = this.edcuiCompts[1].comptAttrs.tableList
      for (index in list) {
        if (list[index].sheet_index == this.sheetIndex) {
          break
        }
      }
      let areaInfo = [...list[index].area_info];
      this.dataList = []
      areaInfo.forEach(info => {
        this.dataList.unshift({
          area_id: info.area_id,
          area_name: info.area_name,
          sheet_index: list[index].sheet_index
        })
      })
    },
    addTab() {
      const len = document.querySelector(".el-tabs__nav").children.length
      if (len == 20) {
        this.$message.warning('最多可添加20个sheet');
        return;
      }
      this.action = 'addTab';
      this.showSheetNameIpt = false;
      let newTabName = this.tabIndex + "";
      this.upTabIndex(this.tabIndex + 1);
      this.editableTabsValue = newTabName;
      let title = `sheet${newTabName}`
      this.editableTabs.push({
        title: title,
        name: newTabName
      });
      let sheet = {
        "sheet_id": '',
        "sheet_index": newTabName,
        "sheet_name": title,
        "area_info": []
      };
      this.edcuiCompts[1].comptAttrs.tableList.push(sheet)
      // let firstSheetData = this.edcuiCompts[1].comptAttrs.tableList[0].static_data_list;
      // let newData = new Array(50).fill(null);
      // firstSheetData.push(...newData);
      //渲染 组件
      var elmId = "htTable" + newTabName;
      var setting = { ...HST.htData, ...{ data: [[]] } };
      setTimeout(() => {
        let hot = new Handsontable(document.getElementById(elmId), setting);
        hot.selectCell(0, 0);
        let data = {};
        data[newTabName] = hot;
        let hObj = { data: data, type: "add" };
        this.upHotObj(hObj);
        this.upHot(hot);
        HST.initEvent(this.hot);
        HST.changeTabCellMapping();
        this.resizeRowColumn(len - 1);
        this.action = '';
        // window.top.document.querySelector('.htCommentsContainer').style.display = 'none'
        let htInput = document.getElementById(elmId).querySelector('.handsontableInput')
        htInput.setAttribute('onInput', 'inputChange()')
        htInput.setAttribute('onClick', 'explainShow("textarea")')
        htInput.setAttribute('onblur', 'htInputBlur()')
      }, 100);
    },
    removeTab(targetName) {
      let tabs = this.editableTabs;
      const sheetInfo = tabs.filter(val => val.name === targetName)
      const tableList = this.edcuiCompts[1].comptAttrs.tableList
      const len = document.querySelector(".el-tabs__nav").children.length
      let firm = true, tarIndex = -1
      if (len == 1) {
        this.$message.warning("不允许删除唯一工作表!")
        return
      }
      tableList.forEach((val, index) => {
        if (val.sheet_name === sheetInfo[0].title) {
          tarIndex = index
          if (val.area_info.length > 0) {
            firm = true
          }
        }
      })
      if (firm) {
        this.$confirm('是否删除工作表和其中的数据?', '提示', {
          closeOnClickModal: false,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.tabDelete(true, targetName)
          tableList.splice(tarIndex, 1)
        }).catch((err) => { });
      } else {
        let activeName = this.editableTabsValue;
        if (activeName === targetName) {
          tabs.forEach((tab, index) => {
            if (tab.name === targetName) {
              let nextTab = tabs[index + 1] || tabs[index - 1];
              if (nextTab) {
                activeName = nextTab.name;
              }
            }
          });
        }
        this.editableTabsValue = activeName;
        this.upEditableTabs(tabs.filter(tab => tab.name !== targetName));
        var hObj = { data: targetName, type: "delete" };
        this.upHotObj(hObj);
        document.querySelector(`#htTable${this.editableTabsValue}`).click();
      }
    },
    tabDelete(sign, targetName) {
      const tabs = this.editableTabs
      if (sign) {
        //刪除对应条件
        let datas = this.edcuiCompts[0].datasets || []
        const sheetInfo = tabs.filter(val => val.name === targetName)
        for (let j = 0; j < datas.length; j++) {
          const val = datas[j]
          if (val.sheet_name === sheetInfo[0].title) {
            datas.splice(j, 1)
            j--
          }
        }
      }
      let activeName = this.editableTabsValue;
      let param = {
        type: 'del',
        key: `sheet${targetName}`,
        isCur: activeName === targetName
      }
      this.upHistoryInfoList(param)
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.name === targetName) {
            let nextTab = tabs[index + 1] || tabs[index - 1];
            if (nextTab) {
              activeName = nextTab.name;
            }
          }
        });
      }

      this.editableTabsValue = activeName;
      this.upEditableTabs(tabs.filter(tab => tab.name !== targetName));
      var hObj = { data: targetName, type: "delete" };
      this.upHotObj(hObj);
      document.querySelector(`#htTable${this.editableTabsValue}`).click();

    },
    beforeLeave(activeName, oldActiveName) {
      // 多sheet
      if (this.hot.getActiveEditor().state === 'STATE_EDITING') {
        window.editingSheet = oldActiveName;
      }
      // 多sheet
      if (this.hotObj[activeName] == undefined && this.action !== 'addTab') {
        this.loadSheetData(activeName)
      }
      this.upSheetIndex(activeName)
      if (this.hotObj[activeName]) {
        setTimeout(() => {
          this.upHot(this.hotObj[activeName])
          this.hot.render()
          HST.changeTabCellMapping()
          let cells = this.hot.getSelected()
          if(!cells){
            return;
          }
          this.upLeaveTab(true)
          this.hot.selectCell(cells[0][0], cells[0][1]);
        }, 0);
      }

      let param = {
        type: 'add',
        key: `sheet${oldActiveName}`
      }
      this.upHistoryInfoList(param)
      this.upHistoryInfo(`sheet${activeName}`)
      const et = this.editableTabs
      et.some((val, index) => {
        if (val.name == activeName && val.refresh) {
          this.loadSheetData(activeName)
          et[index].refresh = false
          this.upEditableTabs(et)
        }
      })
    },
    resizeTable() {
      var erd = elementResizeDetectorMaker();
      erd.listenTo(document.querySelector("#header-wrap"), (element) => {
        var height = element.offsetHeight;
        let pheight = document.querySelector("body").offsetHeight;
        this.$nextTick(function () {
          document.querySelector("#content-main").style.height = pheight - 106 + "px";
          document.querySelector(".main-block").style.height = pheight - height - 106 + "px";
        })
      })
    },
    getCellsText() {
      if (HST.firstFocus) {
        // HST.formulasMouseUp('inputkeydown')
        const active = this.hot.getActiveEditor()
        active.state = 'STATE_VIRGIN'
        if ((this.cur_cellText || '').indexOf('=') === 0 && this.cur_cellText.length > 1) {
          clearTimeout(this.timeInteval)
          HST.cellSite = `${active.row},${active.col}`
          HST.formulasFlag = true
          HST.setFormulasInCell('inputkeydown')
        }
      }
    },
    setCellsText(val) {
      if (typeof val != 'string') {
        val = this.cur_cellText
      }

      this.upFmlPanelShow(false)
      this.upFmlPopoverShow(false)

      const cells = this.hot.getSelectedRangeLast()
      let active = this.hot.getActiveEditor(),
        cur_row = cells.highlight.row, cur_col = cells.highlight.col

      active.TEXTAREA.innerText = val
      active.TD.innerText = val

      this.$refs.cellInput.$el.children[0].selectionStart = 0
      HST.firstFocus = true
      active.wait = false
      active.originalValue = val
      this.hot.selectCell(cur_row, cur_col, cur_row, cur_col)
    },
    setCellData() {
      clearTimeout(this.timeInteval)
      let obj = document.querySelector(`#cellInput`)
      let start = obj.selectionStart
      if (['=', ',', ':', '+', '-', '*', '/', '>', '<', '('].indexOf(obj.value[start - 1]) == -1) {
        HST.formulasFlag = false
      }
      if (!HST.formulasFlag) {
        HST.setCellText()
      }
      const active = this.hot.getActiveEditor()
      active.isfocus = false
    },
    /** 单元格映射输入框 变化-计算公式 */
    cellTextChange(val) {
      if (this.showFormula === '0') {
        return
      }
      if ((val || '').trim().indexOf('=') == 0) {
        HST.mouseIn = 'input'
        let data = HST.fmlFunc('input')
        this.formulasData = data
        try {
          this.fmlExplain = data[0].value
          this.fmlModel = [data[0].label]
          this.fmlTitle = data[0].title || ''
          this.upFmlPanelShow(true)
          this.upFmlPopoverShow(true)
        } catch (e) { }
        this.showFmExplain(-2)
      }
      HST.setCellText()
    },
    /** 输入框（cellInput&& handsontableInput）变化监听 */
    textChange() {
      let active = this.hot.getActiveEditor()
      if (!!active && active.state !== 'STATE_VIRGIN') {
        clearTimeout(this.timeInteval)
        this.timeInteval = false;
        this.timeInteval = setTimeout(() => {
          this.timeInteval = false;
          let def = '', param = 'keydown'
          let val1 = this.cur_cellText || '', val2 = this.oldCellText
          if (HST.mouseIn === 'input') {
            val2 = HST.formulasValue
            active.fml = true
            active.state = 'STATE_WAITING'
            delete active.wait
            param = 'inputkeydown'
          }
          let reg1 = /(<=[=\:\+\-*\/\>\<\(\)\,])?([^[=\:\+\-*\/\>\<\(\)\,]+)/g
          let change, arr1 = [], arr2 = []
          while ((change = reg1.exec(val1)) != null) {
            arr1.push(change[0].toLocaleUpperCase())
          }
          while ((change = reg1.exec(val2)) != null) {
            arr2.push(change[0].toLocaleUpperCase())
          }

          def = arr1.filter(item => {
            if (arr2.indexOf(item) == -1) {
              let res = item.replace(/\W|\D/g, ''), num = 0
              if (res.length > 1) {
                num = HST.charToNum(res)
              }
              if (num <= this.maxCols) {
                return item
              }
            }
          }).join(',').replace(/$/g, '')

          let reg = /((^[a-zA-Z]+)\d+$)/g

          if (reg.test(def)) {
            HST.formulasFlag = true
            HST.setFormulasInCell(param)
            this.oldCellText = this.cur_cellText
            HST.formulasValue = this.cur_cellText
          } else if (HST.mouseIn === 'input') {
            active.TEXTAREA.setAttribute('readOnly', 'readOnly')
            document.querySelector('#cellInput').focus()
          }

        }, 1000);
      }
    },
    /** 双击或回车时 -回填计算公式 */
    selectFormulas(active) {
      if (this.showFormula === '0') {
        return
      }
      let i = 0, fmlElement = document.querySelector('.formulas-wrap')
      if (active != undefined) {
        this.isActive = active
        i = active
      } else {
        let child = fmlElement.querySelector('.is-active')
        while (child != null && (child = child.previousSibling) != null)
          i++;
      }
      // const index = HST.searchCurSheet().sheetIndex
      let fm = this.formulasData[i].label, obj,
        activeEdit = this.hot.getActiveEditor(),
        inputObj = document.querySelector('#cellInput')
      //htElement = document.querySelector(`#htTable${index}`)
      this.fmlModel = fm

      let top = fmlElement.style.top, end
      if (top == '0px') {//#cellInput 输入框
        obj = inputObj
        end = obj.selectionEnd
      } else {
        obj = activeEdit.TEXTAREA
        end = this.htInputSltEnd
      }
      let value = obj.value, start,
        reg = /(<=[=\:\+\-*\/\>\<\(\)\,])?([^[=\:\+\-*\/\>\<\(\)\,]+)/g,
        result, res = ''
      while (!!value && value.toString().length > 1 && (result = reg.exec(value)) != null) {
        if (result.input[result.index + result[2].length] != '(') {
          res = result[0]
        }
      }
      start = end - res.length
      let newValue = `${value.substring(0, start)}${fm}()${value.substring(end)}`

      if (top == '0px') {//#cellInput 输入框
        let obj1 = inputObj
        obj1.value = newValue
        activeEdit.TD.innerText = newValue
        obj1.focus()
        if (obj1.setSelectionRange) {//设置光标位置
          obj1.setSelectionRange(start + fm.length + 1, start + fm.length + 1)
        }
      } else {//单元格 handsontableInput 输入
        activeEdit.TEXTAREA.value = newValue
        activeEdit.state = 'STATE_EDITING'
        activeEdit._opened = true
        activeEdit._fullEditMode = true
        activeEdit.TEXTAREA_PARENT.hidden = false
        activeEdit.TEXTAREA.focus()
        if (activeEdit.TEXTAREA.setSelectionRange) {//设置光标位置
          activeEdit.TEXTAREA.setSelectionRange(start + fm.length + 1, start + fm.length + 1)
        }
        this.upCellText(newValue)
        this.resizeWidth(newValue)
      }
      this.upFmlPanelShow(false)
      this.upFmlPopoverShow(true)
    },
    /** 单击选中计算函数时 */
    showFmExplain(active) {
      if (this.showFormula === '0') {
        return
      }
      //保持输入框焦点状态
      let activeCell = this.hot.getActiveEditor(),
        inputObj = this.$refs.cellInput.$el.querySelector('input'),
        fmlTop = document.querySelector('.formulas-wrap').style.top
      if (this.mouseInTable && fmlTop !== '0px') {
        activeCell.state = 'STATE_WAITING'
        activeCell._opened = true
        activeCell._fullEditMode = true
        activeCell.TEXTAREA_PARENT.hidden = false
        if (active !== -1) {//表格输入框
          activeCell.focus()
        }
      } else if (fmlTop === '0px') {
        HST.firstFocus = false
        inputObj.focus()
      }

      let child, i = 0,
        fmlElement = document.querySelector('.formulas-wrap')
      if (active !== undefined && active >= 0) {
        this.isActive = active
        i = active
        child = fmlElement.getElementsByClassName('el-cascader-node')[i]
      } else {
        child = fmlElement.querySelector('.is-active')
        while ((child = (child || '').previousSibling) != null)
          i++;
      }
      const value = activeCell.TEXTAREA.value

      if (active !== undefined && active >= 0) {
        activeCell.TD.innerText = value
      }
      let litop = (child || '').offsetTop
      try {
        let t = fmlElement.querySelector('.el-scrollbar__wrap').scrollTop,
          top = Math.abs(t - litop)
        this.$refs.fmPopover.style.marginTop = `${top}px`
      } catch (e) { }
      if (!!this.formulasData && this.formulasData.length > 0) {
        this.fmlExplain = this.formulasData[i].value
        this.fmlTitle = this.formulasData[i].title
      }
    },
    /** 输入框单击时显示函数提示 */
    explainShow(type) {
      if (this.showFormula === '0') {
        return
      }
      const active = this.hot.getActiveEditor()
      let tvalue = '', start = -1, str = [], res = ""
      let obj = ""
      if (type == 'textarea') {
        // let sheet = HST.searchCurSheet().sheetIndex
        // obj = document.querySelector(`#htTable${sheet}`).querySelector('.handsontableInput')
        obj = active.TEXTAREA
        delete active.site
      } else {
        obj = document.querySelector('#cellInput')
        active.site = 'input'
      }
      tvalue = obj.value
      start = obj.selectionStart
      let reg2 = /(<=[=\:\+\-*\/\>\<\(\)\,])?(([a-zA-Z0-9][\w\.-]+)\()/g
      let change
      while ((change = reg2.exec(tvalue)) != null) {
        if (change.index <= start) {
          str.push(change)
        }
      }

      str.reverse().forEach(val => {
        if (res != "") return
        let temp = val.input.substr(val.index + val[3].length)//(xxx(a1:a4,a5),A1)
        let len = 0, lth = 0
        temp.split('').forEach((t, i) => {
          if (t == '(') {
            len++
          }
          if (t == ')') {
            len--
          }
          if (i != 0 && len == 0 && lth == 0) {
            lth = i
          }
        })
        if (lth == 0) {
          lth = temp.split('').length
        }
        if (start <= val.index + val[3].length + lth) {
          res = val[3]
        }
      })

      if (res != '') {
        try {
          if (!!this.formulasData && this.formulasData.length == 1
            && res.toLowerCase() == this.formulasData[0].label.toLowerCase() && this.fmlPopoverShow
          ) {
            return
          }
          let data = HST.fmlFunc(type, res)
          this.formulasData = data
          this.fmlExplain = data[0].value
          this.fmlModel = [data[0].label]
          this.fmlTitle = data[0].title || ''
          this.panelChange(false)
        } catch (e) { }
      } else {
        this.upFmlPopoverShow(false)
      }
    },
    /** 公式- 下拉面板只展示右侧说明 */
    panelChange(val) {
      if (this.showFormula === '0') {
        return
      }
      let obj = document.querySelector('#fm-popover')
      if (!val && this.fmlPopoverShow) {
        obj.querySelector('.popper__arrow').style.display = 'none'
        obj.style['margin-left'] = '0px'
        obj.style['margin-top'] = '0px'
        let fmStyle = document.querySelector('.formulas-wrap').style
        if (obj.style.float == 'left') {
          let l = parseFloat(fmStyle.left) + 190 + 'px'
          fmStyle.left = l
        }
        if (fmStyle.bottom) {
          const index = HST.searchCurSheet().sheetIndex
          let htObj = document.querySelector(`#htTable${index}`)
          let holderObj = htObj.querySelector('.handsontableInputHolder')
          let oh = document.querySelector('.table-wrap').offsetHeight
          let h = oh - holderObj.offsetTop - 10
          if (h > obj.offsetHeight) {
            fmStyle.top = holderObj.offsetTop + holderObj.offsetHeight + 5 + 'px'
            fmStyle.left = parseFloat(fmStyle.left) + holderObj.offsetWidth + 20 + 'px'
          }
        }
      } else if (val) {
        obj.querySelector('.popper__arrow').style.display = 'block'
        obj.style['margin-left'] = '12px'
      }
    },
    changeCellInput() {
      let val = this.cur_cellInput
      console.log(val)
      let num_begin = val.search(/[0-9]/),
        char_begin = val.search(/[a-zA-Z]/),
        num = parseInt(val.substring(num_begin)) - 1,
        char = val.substring(0, num_begin).toUpperCase(),
        reg = /^[a-zA-Z]+\d+$/,
        valid = reg.test(val),
        chars = [];
      if (!valid || num_begin <= 0 || char_begin < 0) {
        this.$message.warning("请输入有效的引用位置！")
      } else {
        for (let c of char) {
          chars.unshift(c.charCodeAt(0) - 65)
        }
        chars.map((cs, i) => {
          if (i == 0) {
            char = cs
          } else {
            char += 26 * (cs + 1)
          }
          return char
        })
        this.hot.selectCell(num, char, num, char)
      }
    },
    setCurArea(item) {
      const curSheet = HST.searchCurSheet(), index = curSheet.index,
        areaInfo = this.edcuiCompts[1].comptAttrs.tableList[index].area_info,
        length = areaInfo.length
      for (let i = 0; i < length; i++) {
        let info = areaInfo[i]
        if (info.area_name == item.area_name) {
          this.cur_areaName = info.area_name
          let r, c
          r = info.start_x
          c = info.start_y

          this.hot.selectCell(r, c, r, c)
          this.resetUpdataSign()
          this.beatClass = `beat-${info.area_id}`

          const obj = document.getElementById(`htTable${curSheet.sheetIndex}`)
          const item = obj.getElementsByClassName(`comment-item${r}.${c}`)[0]
          if (!!!item) {
            let element = this.hot.getCell(r, c)
            const left = element.offsetLeft + element.offsetWidth,
              top = element.offsetTop - element.offsetHeight / element.rowSpan - 8
            let parenttop = parseFloat((obj.querySelector('.wtSpreader').style.top || '0').replace(/[a-z]/ig, ''))
            let parentleft = parseFloat((obj.querySelector('.wtSpreader').style.left || '0').replace(/[a-z]/ig, ''))
            // let style = `left:${left + parentleft}px;top:${top + parenttop}px`
            let para = document.createElement('div')
            let node = ''
            try {
              node = document.createTextNode(this.cur_areaName)
              para.appendChild(node)
              // para.style = style
              // ie style 不能直接赋值。。
              para.style.left = `${left + parentleft}px`
              para.style.top = `${top + parenttop}px`
              para.className = `comment-item comment-item${r}.${c}`
              obj.querySelector(".CommentsContain").appendChild(para)
            } catch (e) { }
          }
        }
      }
    },
    dropArea(item, i) {
      const index = HST.searchCurSheet().index,
        areaInfo = this.edcuiCompts[1].comptAttrs.tableList[index].area_info
      let sub_index = -1, result = {},
        condiMap = objDeepCopy(this.edcuiCompts[0].datasets || []),
        condiData = []
      areaInfo.map((res, i) => {
        if (res.area_name == item.area_name) {
          sub_index = i
          result = res
        }
      })
      this.deleteArea({ index, sub_index })
      this.dataList.splice(i, 1)

      let history = {
        type: 'dropArea',
        areaInfo: result,
        index,
        sub_index,
        datasets: {
          newVal: this.edcuiCompts[0].datasets || [],
          origVal: condiMap
        }
      }
      if (this.dataList.length === 0) {
        condiData = objDeepCopy(this.edcuiCompts[0].comptAttrs.fieldList)
        history.condiData = {
          origVal: condiData,
          newVal: []
        }
      }
      this.upHistoryData(history)
    },
    Reorder(sign, index, flag = true) {
      const idx = HST.searchCurSheet().index
      let history = {
        type: 'reorder',
        sort: sign
      }
      if (index === undefined) {
        index = parseInt(document.querySelector('.area-list').querySelector('.selected').getAttribute('dataIndex'))
      }
      let list = this.dataList,
        areaInfo = this.edcuiCompts[1].comptAttrs.tableList[idx].area_info,
        sortIndex = list.length - index - 1
      if (sign === 'up') {
        if (index === 0) {
          return
        }
        list[index] = list.splice(index - 1, 1, list[index])[0]
        areaInfo[0] = areaInfo.splice(sortIndex + 1, 1, areaInfo[sortIndex])[0]
        history.index = sortIndex
      } else {
        if (index === this.dataList.length - 1) {
          return
        }
        list[index] = list.splice(index + 1, 1, list[index])[0]
        areaInfo[sortIndex] = areaInfo.splice(sortIndex - 1, 1, areaInfo[sortIndex])[0]
        history.index = sortIndex
      }

      if (flag && history.index !== undefined) {
        this.upHistoryData(history)
      } else if (!flag) {//撤销时刷新区域
        let repeatArea = HST.areaRepeat()
        if (repeatArea.length > 0) {
          this.updataAll()
        }
      }

    },
    editAreaName(val, index) {
      let sign = true
      if (val.trim() == "") {
        this.$message.warning('区域名称不能为空，请重新输入')
        this.dataList[index].area_name = this.cur_areaName
        document.querySelector('.area-list .selected').lastChild.children[0].focus()
        return
      }
      if (this.countWords(val) > 30) {
        this.$message.warning('区域名称太长，请重新输入')
        this.dataList[index].area_name = this.cur_areaName
        document.querySelector('.area-list .selected').lastChild.children[0].focus()
        return;
      }
      this.dataList.forEach((element, i) => {
        if (i !== index && val === element.area_name) {
          sign = false
          this.$message.warning('区域名称不能重复，请重新输入')
          this.dataList[index].area_name = this.cur_areaName
          document.querySelector('.area-list .selected').lastChild.children[0].focus()
        }
      });
      if (sign) {
        const sub_index = this.dataList.length - index - 1
        const i = HST.searchCurSheet().index
        const areaInfo = this.edcuiCompts[1].comptAttrs.tableList[i].area_info[sub_index]
        areaInfo.area_name = val
        this.upAreaInfo(this.dataList[index])
        try {
          document.querySelectorAll('.CommentsContain')[i].getElementsByClassName(`comment-item${areaInfo.start_x}.${areaInfo.start_y}`)[0].innerText = val
        } catch (e) { }
        this.areaHide = -1
      }
    },
    areaClick(item, index) {
      if (!this.dbl) {
        this.dbl = setTimeout(() => {
          this.setCurArea(item);
          this.dbl = false;
        }, 500);
      } else {
        clearTimeout(this.dbl);
        this.inputareaName(item, index);
        this.dbl = false;
      }
    },
    inputareaName(item, index) {
      let obj = document.querySelector('.area-list li.selected'), slc
      if (!!!obj) {
        obj = document.querySelectorAll('.area-list li')[index]
      }
      slc = obj.getAttribute('dataindex')
      if (index != slc) {
        this.setCurArea(item)
      }
      this.areaHide = index

      setTimeout(() => {
        obj.lastChild.children[0].focus()
      }, 200)
    },
    areaSitePrompt(item, i) {
      this.cur_areaName = item.area_id
      this.areaSiteSetShow = true
      const index = HST.searchCurSheet().index,
        areaInfo = this.edcuiCompts[1].comptAttrs.tableList[index].area_info
      let r, c
      areaInfo.map((res, i) => {
        if (res.area_name == item.area_name) {
          r = res.start_x
          c = res.start_y
          this.cur_areaName = item.area_name
        }
      })
      this.areaSite = HST.numToChar(c) + (r + 1)
      this.initAreaSite = this.areaSite
    },
    /**
     * flag:撤销操作不记录历史
    */
    refreshArea(flag = true) {
      let val = this.areaSite
      let num_begin = val.search(/[0-9]/),
        char_begin = val.search(/[a-zA-Z]/),
        reg = /^[a-zA-Z]+\d+$/,
        valid = reg.test(val),
        num = parseInt(val.substring(num_begin)) - 1,
        char = val.substring(0, num_begin).toUpperCase(),
        chars = []
      if (!valid || num_begin <= 0 || char_begin < 0 || num < 0) {
        this.$message.warning("请输入有效的引用位置！")
        this.$refs.siteInput.$el.querySelector('input').focus()
      } else {
        for (let c of char) {
          chars.unshift(c.charCodeAt(0) - 65)
        }
        chars.map((cs, i) => {
          if (i == 0) {
            char = cs
          } else {
            char += 26 * (cs + 1)
          }
          return char
        })
        if (char >= this.maxCols || num >= this.maxRows) {
          this.$message.warning("起始位置超出画布范围！")
          this.$refs.siteInput.$el.querySelector('input').focus()
          return
        }

        let countCols = this.hot.countCols();
        let countRows = this.hot.countRows();
        if (char > countCols) {
          let p = {
            insert: 'insert_col',
            begin: countCols - 1,
            number: char - countCols + 5,
            totalRow: countRows,
            totalCol: char
          }
          this.insertCell(p)
        }
        if (num > countRows) {
          let p = {
            insert: 'insert_row',
            begin: countRows - 1,
            number: num - countRows + 5,
            totalRow: num,
            totalCol: countCols
          }
          this.insertCell(p)
        }
        this.hot.selectCell(num, char, num, char)
        this.areaSiteSetShow = false
        if (this.initAreaSite != this.areaSite) {
          const index = HST.searchCurSheet().index,
            areaList = this.edcuiCompts[1].comptAttrs.tableList[index].area_info,
            cell = this.hot.getSelected()
          let repeatArea = HST.areaRepeat(), sub_index

          for (sub_index in areaList) {
            if (areaList[sub_index].area_name == this.cur_areaName) {
              break
            }
          }
          if (flag) {
            //获取欲移入位置区域是否有合并单元格，有则记录
            let start_x = areaList[sub_index].start_x, //num
              // start_y = areaList[sub_index].start_y, // char
              end_x = areaList[sub_index].end_x,
              end_y = areaList[sub_index].end_y,
              row1 = num, col1 = char,
              row2 = num + (end_x - start_x) + 1,
              col2 = char + (end_y - start_x) + 1,
              mergedCells = this.hot.getPlugin("MergeCells").mergedCellsCollection.mergedCells,
              origCell = []

            mergedCells.map(c => {
              if (
                ((c.col + c.colspan >= col1 && c.col + c.colspan <= col2) || (c.col >= col1 && c.col <= col2)) &&
                ((c.row + c.rowspan >= row1 && c.row + c.rowspan <= row2) || (c.row >= row1 && c.row <= row2))
              ) {
                origCell.push(c)
              }
            })

            let history = {
              type: 'resetSite',
              newSite: this.areaSite,
              origSite: this.initAreaSite,
              areaName: this.cur_areaName,
            }
            if (origCell.length > 0) {
              history.origCell = origCell
            }
            this.upHistoryData(history)
          }

          //判断移入位置是否有合并单元格，有则先取消合并
          if (cell[0][0] != cell[0][2] || cell[0][1] != cell[0][3]) {
            let settings = {
              mergeCells: []
            }
            this.hot.updateSettings(settings)
          }

          //重叠区域刷新
          if (repeatArea.length == 0) {
            //刷新区域
            this.upRefreshNum([])
            this.updataTable(num, char, areaList, sub_index)
          } else {
            let r_area = repeatArea.filter(val => val.split(',').indexOf(areaList[sub_index].area_name) > -1).join(',').split(','),
              r_num = r_area.filter((item, index) => r_area.indexOf(item) === index && item != "")
            this.upRefreshNum(r_num)
            if (r_num.length === 0) {
              this.updataTable(num, char, areaList, sub_index)
            }
            let count = 0
            for (sub_index in areaList) {
              if (r_num.indexOf(areaList[sub_index].area_name) > -1) {
                count++
                if (areaList[sub_index].area_name == this.cur_areaName) {
                  this.updataTable(num, char, areaList, sub_index)
                } else {
                  this.updataTable(areaList[sub_index].start_x, areaList[sub_index].start_y, areaList, sub_index)
                }
              }
              if (count == r_num.length) {
                break
              }
            }
          }

          //清除原先的标注(comment)
          let oldcell = this.initAreaSite
          const col = HST.charToNum(oldcell.replace(/\d+/g, '')),
            row = parseInt(oldcell.replace(/[^\d]+/g, '')) - 1,
            commentsPlugin = this.hot.getPlugin('comments');
          commentsPlugin.removeCommentAtCell(row, col);
        }
      }
    },
    updataTable(start_x, start_y, areaList, sub_index) {
      this.resetReportLoading(true)
      const curSheet = HST.searchCurSheet(),
        index = curSheet.index,
        sheetIndex = curSheet.sheetIndex,
        areaInfo = areaList[sub_index]
      let cur_areaName
      if (areaInfo.area_name == this.cur_areaName) {
        cur_areaName = this.cur_areaName
      }
      let autofill = {...areaInfo.autofill}
      autofill.show = this.nullAutoFill!=='0' && autofill.show
      let param = {
        colParam: areaInfo.af_col,
        rowParam: areaInfo.af_row,
        needTitle: areaInfo.needTitle,
        filterData: [...areaInfo.filterData],
        query_type: areaInfo.query_type,
        hiddenDimList: areaInfo.hideDim ? areaInfo.hiddenDimList : [],
        countDataField: areaInfo.countDataField || '',
        needTotal: areaInfo.needTotal,
        needSubTotal: areaInfo.selectCount,
        autoMerge: areaInfo.autoMerge,
        condiParam: { sheet: sheetIndex, area: areaInfo.area_id },
        autofill:  autofill,
        rename: areaInfo.rename
      };
      this.queryUpdataTable(param)
        .then(response => {
          let params = {
            af_col: areaInfo.af_col,
            af_row: areaInfo.af_row,
            index: index,
            areaIndex: sub_index,
            start_x: start_x,
            start_y: start_y,
            query_type: areaInfo.query_type,
            filterData: [...areaInfo.filterData],
            needTitle: areaInfo.needTitle,
            hideDim: areaInfo.hideDim,
            drillData: areaInfo.drillData,
            hiddenDimList: areaInfo.hideDim ? areaInfo.hiddenDimList : [],
            countDataField: areaInfo.countDataField,
            needTotal: areaInfo.needTotal,
            selectCount: areaInfo.selectCount,
            needBorder: areaInfo.needBorder,
            autoMerge: areaInfo.autoMerge,
            area_name: areaInfo.area_name,
            subStyleList: areaInfo.subStyleList,
            cur_areaName: cur_areaName,
            autofill: areaInfo.autofill,
            response: response,
            rename: areaInfo.rename
          }
          if (this.tempData.length > 0) {
            let lastData = this.tempData[this.tempData.length - 1]
            let key = Object.keys(lastData)
            if (key.length === 1 &&  key[0] === 'params') {
              this.tempData[this.tempData.length - 1] = params
            } else {
            this.tempData.push(params)
            }
          } else {
            this.tempData.push(params)
          }
          if (this.refreshNum.length <= this.tempData.length) {
            this.tempData.forEach((params, index) => {
              this.setAreaData(params)
            });
            this.upTempData([])
            this.upLoadingEnd(true)
          }
        })
        .catch(e => {
          this.upTempData([])
          this.upRefreshNum([])
          // this.$message.error("更新失败")
          this.resetReportLoading(false)
        })
    },
    updataAll() {
      const index = HST.searchCurSheet().index
      this.updateSheetDataSet(index);
    },
    handleClose() {
      this.upExportReportHisDialog(false)
    },
    exportReportHis() {
      this.upExportReportHisDialog(true)
    },
    onResizstop(x, y, width, height) {
      if (this.activedChart.type !== 'VeWordCloud' && this.activedChart.type !== '') { // 词云图的resize不需要手动触发
        windowResize();
      }
    },
    onDrag(x, y) {
      if (this.activedChart.blockInfo) {
        this.activedChart["blockInfo"]["x"] = x;
        this.activedChart["blockInfo"]["y"] = y;
      }
    },
    dragResize(x, y, width, height, flag) {
      if (this.activedChart.blockInfo) {
        this.activedChart["blockInfo"]["x"] = x;
        this.activedChart["blockInfo"]["y"] = y;
        this.activedChart["blockInfo"]["h"] = height;
        this.activedChart["blockInfo"]["w"] = width;
      }
    },
    deleteChart() {
      if (!!this.activedChart) {
        let id = this.activedChart.comptId;
        for (let i = 0; i < this.chartData.length; i++) {
          if(this.chartData[i].comptId === id) {
            this.chartData.splice(i,1);
            this.chartDeactive(this.activedChart)
            break;
          }
        }
      }
    },
    chartActive(compt) {
      this.activedChart = compt;
      let [r1,c1,r2,c2] = compt.selectRange;
      for(let i=r1; i<=r2; i++) {
        for(let j=c1; j<=c2; j++) {
          let cell = this.hot.getCell(i,j);
          cell.classList.add('chart-active');
        }
      }
      this.hot.deselectCell();
    },
    chartDeactive(compt) {
      this.activedChart = {};
      let [r1,c1,r2,c2] = compt.selectRange;
      for(let i=r1; i<=r2; i++) {
        for(let j=c1; j<=c2; j++) {
          let cell = this.hot.getCell(i,j);
          cell.classList.remove('chart-active');
        }
      }
    },
    dragResizeCallback(){
        let index = HST.searchCurSheet().index;
        let chartList = this.edcuiCompts[1].comptAttrs.tableList[index].chartData;
        let str = (JSON.stringify(chartList))
        let history = {
          type: 'dragresize',
          origVal: {
            str
          }
        }
        HST.upHisData(history)
    },
    resetFormularCell(active, index) {
      // 多sheet
      if (window.formularing && window.formularSheet !== index) {
        let _d = this.hotObj[window.formularSheet];
        let fmlCell = _d.getActiveEditor();
        if (window.formularValue) {
          let curFmlValue = window.formularValue;
          let oriExp = curFmlValue.substring(0, curFmlValue.length - 1);
          let hselected = this.hot.getSelected(); // [[startRow, startCol, endRow, endCol],...]
          // 构造公式范围
          let startWord = String.fromCharCode(hselected[0][1] + 65);
          let startLabel = startWord + (hselected[0][0] + 1);
          let endWord = String.fromCharCode(hselected[0][3] + 65);
          let endLabel = endWord + (hselected[0][2] + 1);
          let cellLabel = startLabel === endLabel ? startLabel : (startLabel + ':' + endLabel);
          // 获取当前sheet名称
          let curSheet = this.editableTabs.find(et => {
            return et.name === this.sheetIndex;
          })
          fmlCell.state = 'STATE_EDITING';
          fmlCell.TEXTAREA.value = `${oriExp}${curSheet.title}!${cellLabel})`;
          fmlCell.TEXTAREA.focus();
        }
      }
      // if (active.originalValue && active.originalValue.indexOf('=') === 0) {
      //   // active.state = 'STATE_EDITING';
      //   window.formularSheet = index;
      //   window.formularing = true;
      // }
      // 多sheet
    },
    ...mapMutations({
      upAsideSign: "ReportMgt/upAsideSign",
      upHot: "ReportMgt/upHot",
      upRowHeightSet: "ReportMgt/upRowHeightSet",
      upColWidthSet: "ReportMgt/upColWidthSet",
      upRowHeight: "ReportMgt/upRowHeight",
      upColWidth: "ReportMgt/upColWidth",
      upHotObj: "ReportMgt/upHotObj",
      upActivedNum: "ReportMgt/upActivedNum",
      upTabIndex: "ReportMgt/upTabIndex",
      upEditableTabs: "ReportMgt/upEditableTabs",
      upCellText: "ReportMgt/upCellText",
      upSheetIndex: 'ReportMgt/upSheetIndex',
      upExportReportHisDialog: "ReportMgt/upExportReportHisDialog",
      upAreaInfo: "ReportAttr/upAreaInfo",
      resetUpdataSign: "ReportAttr/resetUpdataSign",
      upLeaveTab: "ReportMgt/upLeaveTab",
      resetReportLoading: 'ReportMgt/resetReportLoading',
      upRefreshNum: 'ReportMgt/upRefreshNum',
      upWarnInfo: 'ReportMgt/upWarnInfo',
      upWarnMessage: 'ReportMgt/upWarnMessage',
      upTempData: 'ReportMgt/upTempData',
      upLoadingEnd: 'ReportMgt/upLoadingEnd',
      upInsertFunc: 'ReportMgt/upInsertFunc',
      upHistoryInfo: 'ReportMgt/upHistoryInfo',
      upHistoryInfoList: 'ReportMgt/upHistoryInfoList',
      upManualRowHeights: 'ReportMgt/upManualRowHeights',
      upManualColWidths: 'ReportMgt/upManualColWidths',
      upHistoryData: "ReportMgt/upHistoryData",
      upMaxRows: "ReportMgt/upMaxRows",
      upMaxCols: "ReportMgt/upMaxCols",
      upShowFilter: "ReportMgt/upShowFilter",
      colFillback: "ReportAttr/colFillback"
    }),
    ...mapActions({
      resizeRowColumn: "ReportMgt/resizeRowColumn",
      updateSheetDataSet: "ReportMgt/updateSheetDataSet",
      upRowHeightSet: "ReportMgt/upRowHeightSet",
      upColWidthSet: "ReportMgt/upColWidthSet",
      upRowHeight: "ReportMgt/upRowHeight",
      upColWidth: "ReportMgt/upColWidth",
      deleteArea: 'ReportMgt/deleteArea',
      resetReportLoading: 'ReportMgt/resetReportLoading',
      queryUpdataTable: "ReportMgt/queryUpdataTable",
      setAreaData: "ReportMgt/setAreaData",
      insertCell: 'ReportMgt/insertCell',
      upFmlPanelShow: 'ReportMgt/upFmlPanelShow',
      upFmlPopoverShow: 'ReportMgt/upFmlPopoverShow',
      resizeWidth: "ReportMgt/resizeWidth",
      upFirstLoad: "ReportMgt/upFirstLoad"
    })
  },
  created() {
    this.upMaxCols(this.reportColumnLimit||50)
    this.upMaxRows(this.reportRowLimit||500)
    HST.htData.maxCols = this.reportColumnLimit||50
    HST.htData.maxRows = this.reportRowLimit||500
    HST.htData.formulas = this.showFormula !== '0'
    if (this.newComment === '0') {
      window.top.document.querySelector('#app').classList.add('hide-comments')
    }
  },
  mounted() {
    this.upFirstLoad(true)
    this.$Watermark.set("content-main", 120, 20, 50, 60);
    document.addEventListener('mousemove', (e) => {
      const x = e.clientX, y = e.clientY
      let style = (document.querySelector('.fbmouse')||{}).style || {}
      style['left'] = (x + 10) + 'px'
      style['top'] = (y - 5) + 'px'
      if (document.querySelector('.fmshow') !== null) {
        if (e.toElement.localName !== 'td') {
          style['display'] = 'none'
        } else {
          style['display'] = 'block'
        }
      }
      if ((e.target.className === 'htCommentTextArea' || !e.target.className) && !HST.commentsType) {
        try {
          document.querySelector('.htComments').style.display = 'none'
          that.hot.getPlugin('Comments').hide()
        } catch (e) {}
      }
    }, false);
    let that = this
    document.addEventListener('focus', e => {
      if (e.srcElement.className === "el-input__inner" && e.srcElement.id !== 'cellInput') {
        const active = this.hot.getActiveEditor()
        active.state = 'STATE_WAITING'
      }
    }, true)
    document.addEventListener('mousedown', e => {
      const index = HST.searchCurSheet().sheetIndex
      let obj = ''
      const htTable = document.querySelector(`#htTable${index}`)
      if (!!htTable) {
        obj = htTable.querySelector('.handsontableInput')
        if (e.target.tagName === 'TD') {
          obj.removeAttribute('readOnly')
          obj.style.display = 'block'
          that.mouseInTable = true
          that.upFmlPanelShow(false)
          that.upFmlPopoverShow(false)
          that.formulasData = []
        } else if (!!obj && ['TD', "TEXTAREA"].indexOf(e.target.tagName) === -1 && ['el-cascader-node__label', "wtBorder", "summation"].indexOf(e.target.classList[0]) === -1) {
          const active = that.hot.getActiveEditor()
          if (!!active) {
            active.isfocus = true
          }
          obj.setAttribute('readOnly', 'readOnly')
          obj.style.display = 'none'
          that.upFmlPanelShow(false)
          if (e.target.id != 'cellInput') {
            that.upFmlPopoverShow(false)
            that.formulasData = []
          }
        }
      }

      //记录行列拖拽之前单元格宽高
      if (Array.from(e.target.classList).indexOf('manualRowResizer') > -1) {
        let ManualRowResize = this.hot.getPlugin('ManualRowResize');
        ManualRowResize.enablePlugin();
        ManualRowResize.saveManualRowHeights();
        let rowHeights = ManualRowResize.loadManualRowHeights();
        if (this.manualRowHeights.length === 0) {
          this.upManualRowHeights(rowHeights)
        }
      } else if (Array.from(e.target.classList).indexOf('manualColumnResizer') > -1) {
        let ManualColumnResize = this.hot.getPlugin('ManualColumnResize');
        ManualColumnResize.enablePlugin();
        ManualColumnResize.saveManualColumnWidths();
        let colWidths = ManualColumnResize.loadManualColumnWidths();
        if (this.manualColWidths.length === 0) {
          this.upManualColWidths(colWidths)
        }
      }

      // 关闭批注框
      if (!['htItemWrapper', 'htCommentTextArea'].includes(e.target.className)) {
         try {
          document.querySelector('.htComments').style.display = 'none'
          that.hot.getPlugin('Comments').hide()
        } catch (e) {}
      }
    })
    window.inputChange = (type) => {
      if (this.showFormula === '0') {
        return
      }
      const index = HST.searchCurSheet().sheetIndex
      let obj = document.querySelector(`#htTable${index}`)
      if (!!obj) {
        obj = obj.querySelector('.handsontableInput')
        this.upCellText(obj.value)
        if (typeof obj.value == 'string' && obj.value.indexOf('=') === 0) {
          let data = HST.fmlFunc('textarea')
          this.formulasData = data
          try {
            this.fmlExplain = data[0].value
            this.fmlModel = [data[0].label]
            this.fmlTitle = data[0].title || ''
            this.upFmlPanelShow(true)
            this.upFmlPopoverShow(true)
          } catch (e) { }
          this.showFmExplain(-1)
        }
      }
    }

    window.explainShow = (type) => {
      HST.textAreaClick = true
      this.explainShow(type)
    }
    window.htInputBlur = () => {
      const index = HST.searchCurSheet().sheetIndex,
        active = this.hot.getActiveEditor();
      // this.resetFormularCell(active, index);
      let oriValue = this.cur_cellText;
      // && [',', '+', '-', '*', '/'].includes(oriValue.substr(oriValue.length - 2, 1))
      if (oriValue && oriValue.indexOf('=') === 0) {
        window.formularing = true;
        window.formularValue = this.cur_cellText;
        if (window.formularSheet && window.formularSheet !== index ) {
          // sheet
          console.log(window.formularSheet);
        } else {
          window.formularSheet = index;
        }
      }
      if (active && active.state === 'STATE_FINISHED') {
        this.hot.getActiveEditor().isfocus = false
      }
      try {
        let obj = document.querySelector(`#htTable${index}`).querySelector('.handsontableInput')
        // obj.value = '=AVERAGE(A4:A6)';
        this.htInputSltEnd = obj.selectionEnd
      } catch (e) { }
    }
    window.fmlSourcePage = () => {
      const index = HST.searchCurSheet().sheetIndex,
      active = this.hot.getActiveEditor();
      this.resetFormularCell(active, index);
      if(window.formularSheet && index !== window.formularSheet) {
        document.querySelector(`#tab-${window.formularSheet}`).click();
      }
      setTimeout(() => {
        // 重置公式状态
        window.formularing = false;
        window.formularSheet = undefined;
        window.formularValue = undefined;
      }, 1000);
    }
    document.addEventListener('keydown', (e)=>{
      if(e.keyCode === 8 || e.keyCode === 46) {
        this.deleteChart();
      }
    })
  }
};
</script>
<style src="../../../node_modules/handsontable/dist/handsontable.full.css"></style>
<style scoped lang="scss">
$bdr-clr1: #c0c4cc;
$bdr-clr2: #666;
$bg-clr1: #ebeef5;
$clr1: #606266;
$clr2: #303133;
$clr3: #4aa2fd;
$clr4: #409eff;
$clr5: #666;
$bg-clr2: #dcdfe6;
$bg-clr3: #c6e2ff;
$bg-clr4: #ebeef5;
$bg-clr5: #005eff;
$bg-clr6: #ecf5ff;
$hover-clr: #66b1ff;
$shadow-clr: rgb(250, 236, 216);

.m-aside {
  border-right: 1px solid $bdr-clr1;
  z-index: 182;
  /deep/.el-scrollbar__wrap {
    overflow-x: hidden;
  }
}
.m-asd-header {
  height: 40px !important;
  line-height: 40px;
  border-bottom: 1px solid $bdr-clr1;
  background: $bg-clr2;
  font-size: 16px;
  color: $clr2;
  padding-left: 10px;
  position: relative;
  .m-asd-opr {
    position: absolute;
    color: $clr3;
    font-size: 14px;
    top: 0;
    right: 10px;
    text-align: right;
    span {
      cursor: pointer;
    }
    span:not(:first-child) {
      margin-left: 5px;
    }
    span:last-child {
      font-weight: bold;
    }
  }
  & ~ .el-main {
    padding: 5px 0;
    background: $bg-clr4;
  }
}
.area-list {
  color: $clr1;
  li {
    height: 38px;
    padding: 5px 10px;
    background: $bg-clr4;
    position: relative;
    &:not(:last-child):hover {
      background: $bg-clr3;
      .list-delete,
      .list-setting {
        display: block;
      }
      .area-div {
        right: 46px;
      }
    }
    &:not(:last-child).selected {
      background: $bg-clr3;
    }
    &:last-child {
      font-size: 12px;
      height: 60px;
      > div {
        position: relative;
        padding: 5px;
        line-height: 20px;
        color: #909390;
        box-sizing: border-box;
        border-radius: 4px;
        border: 1px solid $bg-clr4;
        background-color: #edf2fc;
        z-index: 100;
        > p {
          cursor: default;
          &:last-child {
            text-align: right;
          }
        }
      }
    }
    .list-no {
      position: absolute;
      top: 11px;
      left: 10px;
      font-size: 12px;
    }
    .area-div {
      position: absolute;
      height: 28px;
      z-index: 100;
      right: 20px;
      left: 28px;
      line-height: 28px;
      padding: 0 15px;
      font-size: 12px;
      -webkit-appearance: none;
      background-color: #ffffff;
      background-image: none;
      border-radius: 4px;
      border: 1px solid #dcdfe6;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      color: #606266;
      display: inline-block;
      white-space: nowrap;
      text-overflow: ellipsis;
      word-break: normal;
      cursor: pointer;
      overflow: hidden;
    }
    .list-delete,
    .list-setting {
      position: absolute;
      top: 13px;
      right: 10px;
      font-size: 12px;
      color: $clr4;
      display: none;
      cursor: pointer;
      z-index: 22;
    }
    .list-setting {
      right: 28px;
    }
    .list-input {
      padding: 0 36px 0 18px;
      z-index: 100;
    }
  }
}
.main-header {
  padding: 10px 5px 10px 0;
  color: $clr1;
  .el-col {
    text-align: center;
  }
  .el-col-1 {
    width: 35px;
    i,
    .m-refresh {
      font-size: 16px;
      vertical-align: middle;
    }
  }
  .m-refresh-wrap {
    text-align: center;
    width: 28px;
  }

  .el-col-6 {
    flex: 2;
  }
  .el-col-15 {
    flex: 6;
  }
  > .el-row {
    display: flex;
  }
  .m-h-opr {
    width: 25px;
    height: 24px;
    cursor: pointer;
    display: inline-block;
    border: 1px solid $bdr-clr1;
    border-left: 0;
    background: $clr4;
    text-align: center;
    line-height: 22px;
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
    &:hover {
      background: $hover-clr;
    }
    span {
      color: #ffffff;
      font-size: 12px;
    }
  }
  .m-select {
    width: 100%;
    height: 24px;
    /deep/.el-input__inner {
      height: 24px;
      line-height: 22px;
    }
    /deep/ .el-input__icon {
      line-height: 24px;
    }
  }
  .m-refresh {
    font-size: 12px;
    color: $clr1;
  }
}
.m-right-main {
  padding: 0;
  /deep/.cell-input .el-input__inner {
    text-align: center;
  }
  /deep/.el-input {
    z-index: 100;
  }
}
/**条件区域**/
.header-compts {
  position: relative;
  height: 100%;
  width: 100%;
  min-height: 50px;
  border: 1px dashed $clr4;
  /deep/ .jixi {
    padding-right: 140px;
  }
  /deep/ .el-button {
    float: right;
    position: absolute;
    // right: 70px;
    right: 0;
    top: 50%;
    margin-top: -14px;
    &:not(:first-child) {
      // right: 0px;
      display: none;
    }
  }
  /deep/ .el-form-item__content div {
    z-index: 999;
  }
  /deep/ .el-button {
    z-index: 100;
  }
}

/**表格区域*/
.table-wrap {
  padding: 0;
  overflow: hidden;
  position: relative;
  .wtHolder {
    width: 100% !important;
    height: 100% !important;
  }
  /deep/.el-tabs__content {
    height: calc(100% - 40px);
    padding: 0;
  }
  /deep/.el-tab-pane {
    height: 100%;
    overflow: hidden;
    position: relative;
  }
  /deep/ .report-sheet-name {
    position: absolute;
    width: 80px;
    bottom: 6px;
    z-index: 102;
    border: none;
    .el-input__inner {
      border: none;
    }
  }
  /deep/ .el-tabs--border-card .el-tabs__item.is-bottom {
    position: relative;
    .el-icon-close {
      position: absolute;
      top: 13px;
      right: 5px;
    }
  }
  /deep/ .el-tabs__item {
    width: 106px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  /deep/.el-tabs--border-card {
    border: 0;
  }
  /deep/ .el-tabs--bottom .el-tabs__header.is-bottom {
    margin-top: 0;
    z-index: 101;
  }
  /deep/.el-tabs__nav-wrap {
    width: calc(100% - 38px);
  }
  /deep/ .el-tabs__new-tab {
    margin-right: 10px;
    border-color: $clr4;
    background: #ffffff;
    .el-icon-plus {
      color: $clr4;
      vertical-align: 1px;
    }
  }
  /deep/ .ht_master {
    height: 100%;
    padding-left: 1px;
  }
  /deep/.ht_clone_top {
    padding-left: 1px;
  }
  /deep/ .handsontable {
    table.htCore {
      border-collapse: collapse;
    }
    .manualColumnResizer:hover,
    .manualColumnResizer.active,
    .manualRowResizer:hover,
    .manualRowResizer.active {
      background-color: $clr4;
    }
    .manualRowResizer {
      margin-top: 5px;
    }
    tbody th {
      min-height: 22px;
      line-height: 22px;
      &.ht__active_highlight {
        background-color: $bg-clr3;
        // border-top: 2px solid $clr4;
      }
    }
    thead th.ht__active_highlight {
      background-color: $bg-clr3;
      border-left: 2px solid $clr4;
      border-right: 2px solid $clr4;
    }
    .htBorders .wtBorder {
      background-color: $clr4 !important;
    }
    td {
      // white-space: pre;
      white-space: nowrap;
      line-height: normal;
      font-size: 11pt;
      box-sizing: border-box;
      cursor: cell;
      &.htRight {
        text-align: left;
      }
      /* 小计合计class*/
      &.align-center {
        text-align: center;
      }
      &.align-left {
        text-align: left;
      }
      &.align-right {
        text-align: right;
      }

      &.w-bold {
        font-weight: bold;
      }
      &.w-normal {
        font-weight: normal;
      }
      /** 数据边框 */
      &.b-right {
        border-right: 1px solid $bdr-clr2;
      }
      &.b-bottom {
        border-bottom: 1px solid $bdr-clr2;
      }
    }
    .htDimmed {
      color: inherit;
    }
    textarea {
      /*  width:100% !important; */
      overflow-y: hidden !important;
      line-height: normal;
      text-indent: inherit !important;
    }
    /* .handsontableInputHolder {
      width: auto;
    } */
  }

  /deep/ .fbmouse {
    position: fixed;
    z-index: 9999;
    display: none;
  }
  /deep/ .fmshow .fbmouse {
    display: block;
  }
  .formulas-wrap {
    position: absolute;
    display: block;
    z-index: 200;
    & > div {
      position: relative;
      display: inline-block;
    }
    /deep/.el-cascader-menu {
      height: auto;
    }
    /deep/.el-cascader-menu__list {
      position: relative;
      min-height: 100%;
      margin: 0;
      padding: 6px 0;
      list-style: none;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      background-color: #ffffff;
    }
    /deep/ .el-cascader-node {
      list-style-type: none;
      position: relative;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-align: center;
      -ms-flex-align: center;
      align-items: center;
      padding: 0;
      height: 34px;
      line-height: 34px;
      outline: none;
      &:not(.is-disabled):hover,
      &:not(.is-disabled):focus {
        /* color: $clr4;
        background: #f5f7fa; */
        background-color: $bg-clr6;
        color: $hover-clr;
        cursor: pointer;
      }
      &.in-active-path,
      &.is-selectable.in-checked-path,
      &.is-active {
        // color: $clr1;
        background-color: $bg-clr6;
        color: $hover-clr;
        font-weight: normal;
      }
      .el-cascader-node__prefix {
        display: none;
      }
      .el-cascader-node__label {
        cursor: pointer;
        padding: 0 20px 0 20px;
        -webkit-box-flex: 1;
        -ms-flex: 1;
        flex: 1;
      }
    }
    /deep/.el-cascader-panel.is-bordered {
      height: 100%;
      -webkit-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      background-color: #fff;
      border: 1px solid $bg-clr4;
    }
    /deep/.el-popover--plain {
      width: 300px;
      padding: 12px 20px;
      font-size: 12px;
    }
    /deep/.el-popover__title {
      font-size: 14px;
    }
  }
  /deep/.CommentsContain {
    display: none;
  }
  &.area-manage {
    /deep/.handsontable td {
      &.abg,
      &.abg-1,
      &.abg-2,
      &.abg-3,
      &.abg-4,
      &.abg-5,
      &.abg-6,
      &.abg-7 {
        position: relative;
      }
      &.abg:before,
      &[class*="highlight"].abg:before {
        opacity: 0.1;
      }
      &.abg-1:before,
      &[class*="highlight"].abg-1:before {
        opacity: 0.2;
      }
      &.abg-2:before,
      &[class*="highlight"].abg-2:before {
        opacity: 0.27;
      }
      &.abg-3:before,
      &[class*="highlight"].abg-3:before {
        opacity: 0.35;
      }
      &.abg-4:before,
      &[class*="highlight"].abg-4:before {
        opacity: 0.41;
      }
      &.abg-5:before,
      &[class*="highlight"].abg-5:before {
        opacity: 0.47;
      }
      &.abg-6:before,
      &[class*="highlight"].abg-6:before {
        opacity: 0.54;
      }
      &.abg-7:before,
      &[class*="highlight"].abg-7:before {
        opacity: 0.58;
      }
      &.abg:before,
      &.abg-1:before,
      &.abg-2:before,
      &.abg-3:before,
      &.abg-4:before,
      &.abg-5:before,
      &.abg-6:before,
      &.abg-7:before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        bottom: -100%\9; /* Fix for IE9 to spread the ":before" pseudo element to 100% height of the parent element */
        background: $bg-clr5;
      }

      &.beat-a1:before,
      &.beat-a2:before,
      &.beat-a3:before,
      &.beat-a4:before,
      &.beat-a5:before,
      &.beat-a6:before,
      &.beat-a7:before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        bottom: -100%\9; /* Fix for IE9 to spread the ":before" pseudo element to 100% height of the parent element */
        background: $bg-clr5;
      }
    }
    /deep/.CommentsContain {
      display: block;
      .comment-item {
        position: absolute;
        z-index: 999;
        background: #303133;
        color: #fff;
        border-radius: 4px;
        padding: 8px;
        font-size: 12px;
        line-height: 1.2;
        min-width: 10px;
        word-wrap: break-word;
      }
    }
    &.beat-a1 /deep/.handsontable td.beat-a1:before,
    &.beat-a2 /deep/.handsontable td.beat-a2:before,
    &.beat-a3 /deep/.handsontable td.beat-a3:before,
    &.beat-a4 /deep/.handsontable td.beat-a4:before,
    &.beat-a5 /deep/.handsontable td.beat-a5:before,
    &.beat-a6 /deep/.handsontable td.beat-a6:before,
    &.beat-a7 /deep/.handsontable td.beat-a7:before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      bottom: -100%\9; /* Fix for IE9 to spread the ":before" pseudo element to 100% height of the parent element */
      background: $bg-clr5;
      opacity: 0.4;
    }
  }
  &.hide-comment /deep/.htCommentCell:after {
    border: none;
  }
  /* &:not(.area-manage) /deep/.htCommentCell:after {
    border: none;
  } */
}
.header-buttons {
  display: none;
  text-align: right;
  margin: 10px 0 0;
}
.h-btns {
  color: $clr5;
  cursor: pointer;
  &:hover {
    color: $clr4;
  }
  i {
    color: $clr4;
    margin-right: 5px;
  }
}
.show-margin {
  margin-left: 10px;
}
.area-title {
  font-size: 12px;
  padding-right: 10px;
  width: 65px;
  display: inline-block;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
#content-main {
  /deep/.el-main {
    height: 100%;
  }
}
</style>
<style>
/* .htComments {
  margin-left: 10px;
} */
.htCommentCell:after {
  border-left: 8px solid transparent;
  border-top: 8px solid #409eff;
}
td.chart-active{
  background:#c1d0e4 !important;
}
</style>
