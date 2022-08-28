<template>
  <el-container>
    <!-- <el-header class="design-page">
      <div class="head-left">
        <el-input class="page-name"
          size="mini"
          v-model="pageCache.pageName"
          :disabled="true"
          placeholder="未命名"></el-input>
      </div>
    </el-header> -->
    <el-main style="padding:0"
      id="main"
      v-loading="loading">
      <el-container id="content-main">
        <el-header id="header-wrap"
          style="height:auto;min-height: 100px;padding: 20px 20px 10px">
          <div class="header-compts">
            <div style="height:100%">
              <Cell :isDesign="false"
                :tableList="edcuiCompts[1]"
                :vscompt="edcuiCompts[0]"></Cell>
            </div>
            <div class="split-line"></div>
          </div>

        </el-header>
        <el-container class="main-block">
          <div style="height:100%;width:100%;">
            <el-container class="main-block">
              <el-main class="m-right-main">
                <el-container>
                  <el-header style="height: 30px">
                    <div class="breadCrumb-wrap">
                      <el-breadcrumb separator-class="el-icon-arrow-right">
                        <el-breadcrumb-item v-for="(item,index) in cur_breadcrumb"
                          :key="item.value">
                          <a href="Javascript:void(0)"
                            @click="drillHandle1(index)">{{item.value}}</a>
                        </el-breadcrumb-item>
                      </el-breadcrumb>
                    </div>
                    <div class="header-buttons">
                      <span class="h-btns"
                        @click="exportReportHis">
                        <i class="icon-A10192_time"></i>
                        <span>导出历史</span>
                      </span>
                      <span v-if="pageStatus==='preview'" class="h-btns" style="margin-left: 10px;"
                        @click="emailPush">
                        <i class="icon-A10163_publish"></i>
                        <span>邮件推送</span>
                      </span>
                    </div>
                  </el-header>
                  <el-main class="table-wrap" :class="{'hide-comment':newComment==='0'}">
                    <!-- handsontable -->
                    <el-tabs tab-position="bottom"
                      type="border-card"
                      v-model="editableTabsValue"
                      :before-leave="beforeLeave"
                      style="height: 100%; margin: 0;">
                      <el-tab-pane v-for="(item) in editableTabs"
                        :key="item.name"
                        :label="item.title"
                        :name="item.name">
                        <span slot="label"
                          :title="item.title">{{item.title}}</span>
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
                            @activated="chartActive(compt)"
                            @deactivated="chartDeactive(compt)"
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
      </el-container>
    </el-main>
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
    <ExportReport v-if="exportReportFile"></ExportReport>
    <ExportForm fromElDatagrid="2"></ExportForm>
    <EmailTask v-if="emailTaskDialogVis" :pageObj="curPageObj"></EmailTask>
  </el-container>
</template>
<script>
  import ExportReportHistory from "../components/design/ExportReportHistory.vue"
  import ExportReport from "../components/design/ExportReport.vue"
  import ExportForm from "../components/design/ExportForm.vue"
  import EmailTask from "../components/design/EmailTask.vue"
  import Cell from "../components/design/Cell.vue"
  import { HST } from "../utils/HandsTable.js"
  import { mapState, mapGetters, mapMutations, mapActions } from "vuex"
  import { HotTable } from "@handsontable/vue"
  import Handsontable from "handsontable"
  import BdDraggableResizable from "bd-draggable-resizable";
  var elementResizeDetectorMaker = require("element-resize-detector")
  export default {
    components: {
      HotTable,
      Cell,
      ExportReportHistory,
      ExportReport,
      ExportForm,
      EmailTask,
      BdDraggableResizable
    },
    data() {
      return {
        // loading: true,
        editableTabsValue: "1",
        back: -1,
        cur_breadcrumb: [],
        chartData: [],
        curPageObj: {},
        pageStatus: ''
        // hotObj: {}
      }
    },
    computed: {
      ...mapState({
        warnInfo: state => state.ReportMgt.warnInfo,
        exportReportHisDialog: state => state.ReportMgt.exportReportHisDialog,
        exportReportDialog: state => state.ReportMgt.exportReportDialog,
        exportReportFile: state => state.ReportMgt.exportReportFile,
        hot: state => state.ReportMgt.hot,
        reportLoading: state => state.ReportMgt.reportLoading,
        hotObj: state => state.ReportMgt.hotObj,
        edcuiCompts: state => state.ReportMgt.edcuiCompts,
        editableTabs: state => state.ReportMgt.editableTabs,
        pageCache: state => state.HomeBody.pageCache,
        breadcrumb: state => state.ReportMgt.breadcrumb,
        warnMessage: state => state.ReportMgt.warnMessage,
        messageSign: state => state.ReportMgt.messageSign,
        refreshNum: state => state.ReportMgt.refreshNum,
        tempData: state => state.ReportMgt.tempData,
        loadingEnd: state => state.ReportMgt.loadingEnd,
        emailTaskDialogVis: state => state.ReportMgt.emailTaskDialogVis,
        selLoadCnt:state => state.QueryTable.selLoadCnt, //查询条件下拉框加载数量
        reportColumnLimit: state => state.commonProperties.report.columnLimit,
        reportRowLimit: state => state.commonProperties.report.rowLimit,
        nullAutoFill: state => state.commonProperties.report.nullAutoFill,
        newComment: state => state.commonProperties.report.newComment,
        menuClassTypeId: state => state.HomeTree.menuClassTypeId,
        showFormula: state => state.commonProperties.report.formula,
        sheetIndex: state => state.ReportMgt.sheetIndex
      }),
      ...mapGetters({
        isQuery: "QueryTable/isQuery"
      }),
      loading(){
        let oriSelCnt = 0;
        if(this.edcuiCompts[0] && (this.edcuiCompts[0].fieldList || []).length > 0){
          oriSelCnt = (this.edcuiCompts[0].fieldList || []).filter(item=>{
            return item.type === "ElCascader";
          }).length || 0;
        }
        return this.reportLoading && (oriSelCnt>0 ? this.selLoadCnt > 0 : true);
      }
    },
    created() {
      this.upMaxCols(this.reportColumnLimit||50)
      this.upMaxRows(this.reportRowLimit||500)
      HST.preHtData.maxCols = this.reportColumnLimit||50
      HST.preHtData.maxRows = this.reportRowLimit||500
      HST.preHtData.formulas = this.showFormula !== '0'
      if (this.newComment === '0') {
        window.top.document.querySelector('#app').classList.add('hide-comments')
      }
    },
    mounted() {
      if (this.pageCache.operation == "design") {
        this.pageCache.operation = "wait"
        sessionStorage.setItem("pageCache", JSON.stringify(this.pageCache))
      }
      this.pageStatus = this.pageCache.operation;
      this.$Watermark.set("main", 60, 20, -40, 0);
      window.drillHandle = (areaId, elementName, val, transVal) => {
        const sheetInfo = HST.searchCurSheet();
        let edcuiCompts1 = this.edcuiCompts[1],
          areaData = edcuiCompts1.comptAttrs.tableList[sheetInfo.index].area_info,
          index,
          crumb = { ...this.breadcrumb }
        if (this.back !== -1 && this.back !== 0) {
          crumb[sheetInfo.sheetName].splice(this.back, crumb[sheetInfo.sheetName].length)
          this.upBreadcrumb(crumb)
          this.cur_breadcrumb = crumb[sheetInfo.sheetName]
        } else {
          if (this.back !== 0) {
            if (!!crumb[sheetInfo.sheetName]) {
              crumb[sheetInfo.sheetName].push({ value: transVal, param: `${areaId},${elementName},${val},${transVal}` })
            } else {
              crumb[sheetInfo.sheetName] = [{ value: transVal, param: `${areaId},${elementName},${val},${transVal}` }]
            }
            this.upBreadcrumb(crumb)
            this.cur_breadcrumb = crumb[sheetInfo.sheetName]
          } else {
            crumb[sheetInfo.sheetName] = []
            this.upBreadcrumb(crumb)
            this.cur_breadcrumb = []
          }
        }
        for (index in areaData) {
          if (areaData[index].area_id == areaId) {
            break;
          }
        }

        let drillParam = areaData[index].drillParam;
        if (drillParam.sheetId == undefined) {
          drillParam.sheetId = sheetInfo.sheetId;
        }
        if (drillParam.areaId == undefined) {
          drillParam.areaId = areaId;
        }
        if (drillParam.values == undefined) {
          drillParam.values = [];
        }

        let drillData = {},
          length = drillParam.values.length
        if (length == 0) {
          drillData = areaData[index].drillData.filter(data => {
            return data.label == elementName
            // let cha = "(";
            //return data.element_name == elementName || (data.element_name.substring(0,data.element_name.lastIndexOf(cha)) == elementName && data.type == "ElDatePicker" && data.isNewCol)
          })[0]
          if (this.back === -1) {
            let value = {
              element_id: drillData.element_id,
              value: val
            }
            drillParam.values.push(value);
          } else {
            drillParam.values.splice(this.back)
          }
        } else {
          drillData = areaData[index].drillData.filter(data => {
            return data.element_id == drillParam.values[0].element_id
          })[0]

          if (this.back === -1) {
            let value = {
              element_id: drillData.subDrill[length - 1].element_id,
              value: val
            }
            drillParam.values.push(value);
          }
        }
        if (this.back === 0) {
          drillData = [drillData]
        }
        this.back = -1
        this.resetReportLoading(true)


        //重叠区域刷新
        let repeatArea = HST.areaRepeat()
        if (repeatArea.length == 0) {
          this.upRefreshNum([])
          this.updata(areaData, index, sheetInfo, drillData, drillParam, areaId, true)
        } else {
          let r_area = repeatArea.filter(val => val.split(',').indexOf(areaData[index].area_name) > -1).join(',').split(','),
            r_num = r_area.filter((item, index) => r_area.indexOf(item) === index && item != "")
          this.upRefreshNum(r_num)
          if (r_num.length === 0) {
            this.updata(areaData, index, sheetInfo, drillData, drillParam, areaId, true)
          } else {
            let count = 0, sub_index
            for (sub_index in areaData) {
              if (r_num.indexOf(areaData[sub_index].area_name) > -1) {
                count++
                if (areaData[sub_index].area_id == areaId) {
                  this.updata(areaData, index, sheetInfo, drillData, drillParam, areaId, true)
                } else {
                  let dd = areaData[sub_index].drillData,
                    dp = areaData[sub_index].drillParam,
                    ai = areaData[sub_index].area_id
                  this.updata(areaData, sub_index, sheetInfo, dd, dp, ai, false)
                }
              }
              if (count == r_num.length) {
                break
              }
            }
          }
        }
      }

      document.addEventListener('mousemove', e => {
        try {
          /* if ((e.target.className === 'htCommentTextArea' || !e.target.className)) {
            document.querySelector('.htComments').style.display = 'none'
          } */
          if (e.target.className === 'htCommentTextArea') {
            document.querySelector('.htCommentTextArea').setAttribute('readOnly', 'readOnly')
          }
        } catch (e) { }
      })
    },
    watch: {
      breadcrumb(val) {
        if (Object.keys(val).length == 0) {
          this.cur_breadcrumb = []
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
      loadingEnd(val) {
        if (this.reportLoading && val) {
          if (this.showFormula === '0') {
            HST.isMerge = false
            this.resetReportLoading(false)
            this.upLoadingEnd(false)
            this.hot.render()
          } else {
            clearInterval(HST.rendered)
            HST.rendered = setTimeout(() => {
              this.resetReportLoading(false)
              this.upLoadingEnd(false)
              if (HST.isMerge) {
                HST.isMerge = false
                this.hot.getPlugin('formulas').recalculateFull()
              }
            }, 500);
          }
        }
      },
      sheetIndex: {
        handler(newVal, oldVal) {
          console.log('sss');
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
        }
      }
    },
    activated() {
      this.resizeTable();
      this.resetReportLoading(true);
      let pc = sessionStorage.getItem('pageCache');
      let pageInfo = JSON.parse(pc);
      this.setPageCache(pageInfo);
      // document.title = this.pageCache.pageName || '报表预览';

      let { pageId, operation } = pageInfo
      if (operation == "wait") {
        let isQuery = this.isQuery('1003');
        if (!isQuery) {
          this.$message.warning("必填字段不能为空");
          this.resetReportLoading(false);
        }
        this.loadSheetData('1');
        return;
      }
      if (pageId != null) {
        var pageParam = Object.assign({
          objId: pageId,
          createUser: window.sessionStorage.getItem("user_id"),
          classTypeId: 1003,
          objType: this.pageCache.classTypeId,
          verNo: this.pageCache.verNo,
          previewType: (this.menuClassTypeId === 'drive' || JSON.stringify(this.$route.query) !== '{}') ? '1' : '0',
          preViewFalg: "0" //1-记录操作日志标志    0-不记录操作日志
        });

        this.qryPageDetailsByVerNo(pageParam)
          .then(val => {
            if (val.status == 200 && val.data.respResult == 1) {
              let res = val.data.respData[0]
              document.title = res.pageName || '报表预览';
              let respData = res.pageDetails.filter(data => {
                return data.compType === 'Sheet' ? true : false;
              })
              if (respData != null && respData.length > 0) {
                let tableList = [];
                respData.forEach(data => {
                  let tableData = JSON.parse(data.compAttrs);
                  tableData.sheet_id = data.elementId;
                  tableList.push(tableData)
                })
                this.upTableList(tableList);
              } else {
                this.resetTableList();
              }
              let condiRuleList = {}
              respData = res.pageDetails.filter(data => {
                if(data.compType === 'Sheet') {
                  let compAttrs = JSON.parse(data.compAttrs)
                  if (compAttrs.condiRuleList) {
                    condiRuleList[compAttrs.sheet_name] = compAttrs.condiRuleList
                  }
                }
                return data.compType === 'QuerySetting' ? true : false;
              })
              this.upCondiRuleList({type:'reset', data: condiRuleList})
              let edcuiCompts0 = JSON.parse(respData[0].compAttrs)
              if (!!edcuiCompts0) {
                this.upEdcuiCompts0(edcuiCompts0)
              }
              this.upFirstLoad(true)
            } else {
              // this.$message.error("页面信息查询失败");
            }
            let tableList = this.edcuiCompts[1].comptAttrs.tableList;
            for (let i = 0, length = tableList.length; i < length; i++) {
              let newTabName = i + 1 + "";
              this.editableTabs.push({
                title: tableList[i].sheet_name,
                name: newTabName,
                content: `<div id="htTable${newTabName}"></div>`
              });
            }
            let isQuery = this.isQuery('1003');
            if (!isQuery) {
              this.$message.warning("必填字段不能为空");
              this.resetReportLoading(false);
            }
            this.loadSheetData('1');
          })
          .catch(err => {
            console.error("页面信息查询异常", err)
            // this.$message.error("页面信息查询异常");
          })
      } else {
        // this.upLoaderSign("default");
        this.resetTableList();
        this.resetReportLoading(false);
      }
    },
    methods: {
      drillHandle1(i) {
        const val = this.cur_breadcrumb[i].param
        this.back = i
        const sheetInfo = HST.searchCurSheet(), index = sheetInfo.index, param = val.split(',')
        let subIndex
        let areaData = this.edcuiCompts[1].comptAttrs.tableList[index].area_info;
        for (subIndex in areaData) {
          if (areaData[subIndex].area_id == param[0]) {
            break;
          }
        }
        if (i != 0) {
          areaData[subIndex].drillParam.values = areaData[subIndex].drillParam.values.splice(0, i)
          if (window.drillHandle) {
            window.drillHandle(param[0], param[1], param[2], param[3])
          }
        } else {
          //顶层
          areaData[subIndex].drillParam.values = []
          if (window.drillHandle) {
            window.drillHandle(param[0], param[1], param[2], param[3])
          }
        }

      },
      loadSheetData(activeName) {
        let elmId = "htTable" + activeName;
        let tableData = this.edcuiCompts[1].comptAttrs.tableList[activeName - 1];
        let setting = {
          ...HST.preHtData,
          data: [[]]
        }
        const func = HST.numFormatSetting(tableData.numericFormat||[], 'noRun')//数据格式化加载
        this.chartData = tableData.chartData || []; //回填图形数据
        if (!!tableData) {
          setting = {
            ...setting,
            data: tableData.static_data_list,
            cell: tableData.style_list,
            mergeCells: tableData.merge_list,
            cells: func,
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
            fixedRowsTop: tableData.fixedRowsTop || 0,
            fixedColumnsLeft: tableData.fixedColumnsLeft || 0,
            filters: tableData.show_filter,
            dropdownMenu: tableData.show_filter ? [ //下拉组件
              "filter_by_condition",
              "filter_by_value",
              "filter_action_bar"
            ] : false
          }
        }
        setTimeout(() => {
          let hot = new Handsontable(document.getElementById(elmId), setting);
          this.upHot(hot)
          HST.initEvent(hot)
          let data = {};
          data[activeName] = hot;
          let hObj = { data: data, type: "add" };
          this.upHotObj(hObj);
          // this.hotObj = { ...this.hotObj, ...data };
          //更新区域数据
          this.updateSheetDataSet(activeName - 1);
          this.resizeRowColumn(activeName - 1);
          const inputObj = document.getElementById(elmId).querySelector('.handsontableInput')
          inputObj.setAttribute('readOnly', 'readOnly')
          let divObj = document.createElement('div')
          let textObj = document.createElement('textarea')
          textObj.className = 'handsontableDiv'
          textObj.setAttribute('readOnly', 'readOnly')
          divObj.className = 'handsontableDivClone'
          document.getElementById(elmId).querySelector(".handsontableInputHolder").appendChild(textObj)
          document.getElementById(elmId).querySelector(".handsontableInputHolder").appendChild(divObj)
        }, 100);
      },
      updata(areaData, index, sheetInfo, drillData, drillParam, areaId, sign) {
        let hideDim = areaData[index].hideDim == undefined ? false : areaData[index].hideDim;
        let autofill = areaData[index].autofill
        autofill.show = this.nullAutoFill !== '0' && autofill.show

        let param = {
          colParam: areaData[index].af_col,
          rowParam: areaData[index].af_row,
          needTitle: areaData[index].needTitle,
          filterData: areaData[index].filterData,
          query_type: areaData[index].query_type,
          hiddenDimList: hideDim ? areaData[index].hiddenDimList : [],
          condiParam: { sheet: sheetInfo.sheetIndex, area: areaData[index].area_id },
          drillData: drillData,
          drillParam: drillParam,
          areaId: areaId,
          autoMerge: areaData[index].autoMerge,
          countDataField: areaData[index].countDataField || '',
          needTotal: areaData[index].needTotal,
          needSubTotal: areaData[index].selectCount,
          autofill: autofill,
          computedData: areaData[index].computedData,
          rename: areaData[index].rename
        };
        this.queryUpdataTable(param)
          .then(response => {
            let params = {
              index: sheetInfo.index,
              areaIndex: index,
              start_x: areaData[index].start_x,
              start_y: areaData[index].start_y,
              af_col: areaData[index].af_col,
              af_row: areaData[index].af_row,
              query_type: areaData[index].query_type,
              hideDim: hideDim,
              hiddenDimList: areaData[index].hiddenDimList || [],
              autoMerge: areaData[index].autoMerge,
              countDataField: areaData[index].countDataField,
              needTotal: areaData[index].needTotal,
              selectCount: areaData[index].selectCount,
              needBorder: areaData[index].needBorder,
              subStyleList: areaData[index].subStyleList,
              area_name: areaData[index].area_name,
              cur_areaName: sign ? areaData[index].area_name : '',
              rename: areaData[index].rename || false,
              autofill: autofill,
              response: response
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
            if (response.data.respResult === '0') {
              this.cur_breadcrumb.pop()
            }
          })
          .catch((e) => {
            // this.$message.error("更新失败")
            console.error(e)
            this.upWarnInfo("")
            this.resetReportLoading(false)
          })

      },
      beforeLeave(activeName, oldActiveName) {
        this.back = -1
        let name = document.querySelector(`#tab-${activeName}`).innerText
        this.cur_breadcrumb = this.breadcrumb[name] || []
        if (this.hotObj[activeName] == undefined) {
          this.loadSheetData(activeName);
        }
        this.upSheetIndex(activeName)
        if (this.hotObj[activeName]) {
          setTimeout(() => {
            this.upHot(this.hotObj[activeName])
            this.hot.render()
          }, 0);
        }
        const et = this.editableTabs
        et.some((val, index) => {
          if (val.name == activeName && val.refresh) {
            this.loadSheetData(activeName)
            et[index].refresh = false
            this.upEditableTabs(et)
          }
        })
      },
      handleClose() {
        this.upExportReportFile(false)
        this.upExportReportHisDialog(false)
      },
      exportReportHis() {
        this.upExportReportHisDialog(true)
      },
      emailPush() {
        if (this.pageCache && this.pageCache.pageId) {
          let obj = {
            "pageId": this.pageCache.pageId,
            "pageName": this.pageCache.pageName,
            "taskId": this.pageCache.taskId,
            "isCancel": this.pageCache.isCancel,
            "taskType": this.pageCache.taskType,
          }
          // const {pageId, pageName} = this.pageCache;
          // const obj = {pageId, pageName};
          this.curPageObj = obj;
        }
        this.upIsMailTask(true);
        this.upExportReportFile(true);
        this.upExportReportDialog(false);
      },
      resizeTable() {
        var erd = elementResizeDetectorMaker();
        erd.listenTo(document.querySelector("#header-wrap"), (element) => {
          var height = element.offsetHeight;
          let pheight = document.querySelector("body").offsetHeight;
          this.$nextTick(function () {
            document.querySelector("#content-main").style.height = pheight + "px";
            document.querySelector(".main-block").style.height = pheight - height + "px";
          })
        })
      },
      chartActive(compt) {
        let [r1,c1,r2,c2] = compt.selectRange;
        for(let i=r1; i<=r2; i++) {
          for(let j=c1; j<=c2; j++) {
            let cell = this.hot.getCell(i,j);
            cell.classList.add('chart-active');
          }
        }
      },
      chartDeactive(compt) {
        let [r1,c1,r2,c2] = compt.selectRange;
        for(let i=r1; i<=r2; i++) {
          for(let j=c1; j<=c2; j++) {
            let cell = this.hot.getCell(i,j);
            cell.classList.remove('chart-active');
          }
        }
      },
      ...mapMutations({
        upWarnInfo: "ReportMgt/upWarnInfo",
        upIsMailTask: "ReportMgt/upIsMailTask",
        upWarnMessage: "ReportMgt/upWarnMessage",
        upHotObj: "ReportMgt/upHotObj",
        upEdcuiCompts0: "ReportMgt/upEdcuiCompts0",
        upHot: "ReportMgt/upHot",
        upExportReportHisDialog: "ReportMgt/upExportReportHisDialog",
        upExportReportFile: "ReportMgt/upExportReportFile",
        upExportReportDialog: "ReportMgt/upExportReportDialog",
        upTableList: "ReportMgt/upTableList",
        resetTableList: "ReportMgt/resetTableList",
        resetReportLoading: "ReportMgt/resetReportLoading",
        upEditableTabs: "ReportMgt/upEditableTabs",
        upBreadcrumb: "ReportMgt/upBreadcrumb",
        upRefreshNum: 'ReportMgt/upRefreshNum',
        upTempData: 'ReportMgt/upTempData',
        upLoadingEnd: 'ReportMgt/upLoadingEnd',
        upMaxRows: "ReportMgt/upMaxRows",
        upMaxCols: "ReportMgt/upMaxCols",
        upCondiRuleList: 'ReportMgt/upCondiRuleList',
        setEmailTaskDialogVis: "ReportMgt/setEmailTaskDialogVis",
        upSheetIndex: 'ReportMgt/upSheetIndex'
      }),
      ...mapActions({
        doExportReport: "ReportMgt/doExportReport",
        queryUpdataTable: "ReportMgt/queryUpdataTable",
        setAreaData: "ReportMgt/setAreaData",
        resizeRowColumn: "ReportMgt/resizeRowColumn",
        updateSheetDataSet: "ReportMgt/updateSheetDataSet",
        resetReportLoading: "ReportMgt/resetReportLoading",
        upFirstLoad: "ReportMgt/upFirstLoad",
        setPageCache: "HomeBody/setPageCache",
        qryPageDetailsByVerNo: "PageDesign/qryPageDetailsByVerNo",
      })
    }
  }
</script>

<style src="../../node_modules/handsontable/dist/handsontable.full.css"></style>
<style scoped lang="scss">
  $header-main-clr: #0a2b4c;
  $bdr-clr1: #c0c4cc;
  $bdr-clr2: #666;
  $bg-clr1: #ebeef5;
  $clr1: #606266;
  $clr2: #303133;
  $clr3: #4aa2fd;
  $clr4: #ffffff;
  $clr5: #409eff;
  $bg-clr2: #dcdfe6;
  $bg-clr3: #c6e2ff;
  $bg-clr4: #ebeef5;
  $bg-clr5: #0e3b67; // 输入框背景色
  $border-clr1: #0e3b67; // 输入框边框色
  #main {
    position: relative;
    height: 100%;
  }
  #content-main {
    position: relative;
    height: 100%;
    overflow: hidden;
  }
  .main-block {
    position: relative;
  }
  .el-header.design-page {
    height: 50px !important;
    line-height: 50px;
    background-color: $header-main-clr;
    .head-left {
      float: left;
      .to-main {
        color: $clr4;
        cursor: pointer;
        margin-right: 26px;
      }
    }
    .page-name {
      width: 230px;
      /deep/.el-input__inner {
        border-color: $border-clr1;
        background-color: $bg-clr5;
        color: #fff;
      }
    }
  }

  .m-aside {
    border-right: 1px solid $bdr-clr1;
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
      span:nth-child(2) {
        margin-left: 9px;
      }
    }
    & ~ .el-main {
      padding: 5px 0;
      background: $bg-clr4;
    }
  }
  .m-right-main {
    padding: 0;
    /deep/.cell-input .el-input__inner {
      text-align: center;
    }
  }
  /**条件区域**/
  .header-compts {
    position: relative;
    height: 100%;
    width: 100%;
    min-height: 70px;
    /deep/ .jixi {
      padding-right: 140px;
    }
    /deep/ .el-button {
      float: right;
      position: absolute;
      right: 70px;
      top: 50%;
      margin-top: -14px;
      &:not(:first-child) {
        right: 0;
      }
    }
    .split-line {
      position: absolute;
      left: -20px;
      right: -20px;
      bottom: 0;
      border-bottom: 2px solid $clr5;
    }
    /deep/ .el-form-item__content div {
      z-index: 100;
    }

    /deep/ .el-button {
      z-index: 100;
    }
  }
  /**表格区域*/
  .breadCrumb-wrap {
    float: left;
    margin-top: 4px;
    /deep/.el-breadcrumb__item:last-child .el-breadcrumb__inner a {
      font-weight: bold;
      color: $clr2;
      cursor: pointer;
    }
  }
  .header-buttons {
    float: right;
    text-align: right;
    // &:hover {
    // }
    .h-btns:hover{
      color: $clr5;
      cursor: pointer;
    }
    .h-btns i {
      color: $clr5;
      margin-right: 5px;
    }
  }
  .table-wrap {
    position: relative;
    height: 100%;
    padding: 0 20px;
    overflow: hidden;
    .wtHolder {
      width: 100% !important;
      height: 100% !important;
    }
    /deep/ .el-tabs__item {
      width: 106px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    /deep/.el-tabs__content {
      height: calc(100% - 40px);
      padding: 0;
    }
    /deep/.el-tab-pane {
      height: 100%;
      overflow: hidden;
    }
    /deep/.el-tabs--border-card {
      border: 0;
    }
    /deep/ .el-tabs--bottom .el-tabs__header.is-bottom {
      margin-top: 0;
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
    /deep/.ht_master {
      height: 100%;
    }
    /deep/ .handsontable td {
      white-space: pre;
      line-height: normal;
      font-size: 11pt;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
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
      a {
        color: rgb(0, 0, 238);
      }
      &[class*="allRed"] {
        background-color: #ffc7ce !important;
        color: #9c0006 !important;
      }
      &[class*="allYellow"] {
        background-color: #ffeb9c !important;
        color: #9c6500 !important;
      }
      &[class*="allGreen"] {
        background-color: #c6efce !important;
        color: #006100 !important;
      }
      &[class*="redBg"] {
        background-color: #ffc7ce !important;
      }
      &[class*="redText"] {
        color: #9c0006 !important;
      }
      &[class*="redBorder"] {
        border-right: 1px solid #9c0006 !important;
        border-bottom: 1px solid #9c0006 !important;
      }
      &[class*="redBdRight"] {
        border-right: 1px solid #9c0006 !important;
      }
      &[class*="redBdBottom"] {
        border-bottom: 1px solid #9c0006 !important;
      }
    }

    /deep/.handsontable .wtBorder {
      &.corner {
        display: none !important;
      }
      .wtBorder {
        background-color: $clr4 !important;
      }
    }
    /deep/ .handsontableInput {
      min-width: 0 !important;
      width: 0 !important;
      height: 0 !important;
      opacity: 0;
    }
    /deep/.handsontableDiv {
      position: absolute;
      top: 0;
      min-width: 71px;
      max-width: 1774px;
      overflow-y: hidden;
      border: none;
      outline-width: 0;
      margin: 0;
      padding: 1px 5px 0 5px;
      font-family: inherit;
      line-height: 21px;
      font-size: inherit;
      -webkit-box-shadow: 0 0 0 2px #5292f7 inset;
      box-shadow: 0 0 0 2px #5292f7 inset;
      resize: none;
      display: block;
      color: #000;
      border-radius: 0;
      background-color: #fff;
      white-space: pre;
      box-sizing: border-box;
      z-index: 1;
      a {
        pointer-events: none;
      }
    }
    /deep/.handsontableDivClone {
      z-index: -1;
      opacity: 0;
      height: 0;
      width: auto !important;
    }
    &.hide-comment /deep/.htCommentCell:after {
      border: none;
    }
  }
</style>
<style lang="scss">
  .htCommentTextArea {
    resize: none;
  }
  td.chart-active{
    background:#c1d0e4 !important;
  }
</style>

