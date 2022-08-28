<template>
  <div style="height:100%;position:relative;">
    <!-- 只有pc端明细才显示导出，大屏或者手机端或者pc端明细都不能展示-->
    <div
      class="table-tool-icon"
      style="margin-right: 20px;"
      v-if="polymerizeType==2 && pageCache.classTypeId == '1001001'"
    >
     <div  class="icon-block" @click="queryHistory">
        <i class="icon-A10192_time" style="cursor:pointer;" ></i>
        <span>导出历史</span>
      </div>

      <div
        v-if="vscompt.comptAttrs.extendSetting.export && pageCache.classTypeId!== '1001002'"
        class="icon-block el-dropdown-link"
        @click="exportExcel('2')"
      >
        <i class="icon-A10165_upload" style="cursor:pointer;"></i>
        <span>导出</span>
      </div>
    </div>
    <!-- 交叉表聚合没导出没分页，明细-->
    <div
      ref="table"
      :class="[vscompt.comptAttrs.extendSetting.tableTheme+'-datagrid',pageCache.classTypeId == '1001002'? 'mobile_datagrid-wrap':'datagrid-wrap',polymerizeType==1?'polymer-wrap':'',pageCache.classTypeId == '1005'? 'bigScreen_datagrid-wrap':'']"
    >
      <!-- 清单 2-->
      <el-table
        v-if="polymerizeType==2"
        size="mini"
        :height="vscompt.comptAttrs.extendSetting.frozen?'100%':null"
        :border="vscompt.comptAttrs.extendSetting.tableTheme=='default'?true:false"
        :data="(vscompt.comptData || {}).rows || []"
        :row-class-name="rowClass"
        :span-method="mergeMethod"
        ref="tableBody"
        :class="[pageCache.classTypeId == '1001002'? 'mobile':'',pageCache.classTypeId == '1005'? 'bigScreen':'']"
        :style="tableStyle"
        :width="vscompt.comptAttrs.extendSetting.frozen?'100%':'100%'"
        :row-style="datagridRowStyle"
        :header-cell-style="{'background':vscompt.comptAttrs.extendSetting.thBgColor,color:vscompt.comptAttrs.extendSetting.thTextColor}"
        :cell-style="{'background':vscompt.comptAttrs.extendSetting.tbBgColor,color:vscompt.comptAttrs.extendSetting.tbTextColor,'border-color':vscompt.comptAttrs.extendSetting.tbBdColor}"
        :show-header="showHead"
        :header-row-style="headerStyle"
      >
        <el-table-column
          v-if="vscompt.comptAttrs.extendSetting.showIndex"
          type="index"
          label="序号"
          width="50"
          :index="indexMethod"
        ></el-table-column>
        <el-table-column
          v-for="(col,i) in tableCols || []"
          v-bind:key="col.prop+Math.random()"
          v-bind="col"
          header-align="center"
          :fixed="newColSetting[col.prop] !=undefined?newColSetting[col.prop].fixed:false"
          :align="newColSetting[col.prop] !=undefined?newColSetting[col.prop].align:'left'"
          :show-overflow-tooltip="true"
        >
          <template slot="header" slot-scope="scope">
            <div :title="col.label">{{col.label}}</div>
          </template>
          <template slot-scope="scope">
            <div @click="dgCellClick(scope.row, col, i, $event)">
              <i
                v-show="newColSetting && newColSetting[col.prop] && newColSetting[col.prop].setCondi==='showIcon' && (newColSetting[col.prop].colCondiExp||[]).length>0"
                v-if="(newColSetting[col.prop].colCondiExp||[]).length>0 && parseFloat(dataFormatter2(scope.row,i))>=parseFloat(newColSetting[col.prop].colCondiExp[0].num)"
                :class="['dg-icon',newColSetting[col.prop].colCondiExp[0].icon]"
                :style="{
                  'font-size': newColSetting[col.prop].colCondiExp[0].fontSize + 'px',
                  color: newColSetting[col.prop].colCondiExp[0].iconColor
                }"
              ></i>
              <i
                v-show="newColSetting && newColSetting[col.prop] && newColSetting[col.prop].setCondi==='showIcon' && (newColSetting[col.prop].colCondiExp||[]).length>1"
                v-else-if="(newColSetting[col.prop].colCondiExp||[]).length>1 && parseFloat(dataFormatter2(scope.row,i))<parseFloat(newColSetting[col.prop].colCondiExp[1].num)"
                :class="['dg-icon',newColSetting[col.prop].colCondiExp[1].icon]"
                :style="{
                  'font-size': newColSetting[col.prop].colCondiExp[1].fontSize + 'px',
                  color: newColSetting[col.prop].colCondiExp[1].iconColor
                }"
              ></i>
              <span :style="qdCondiStyle(col, scope, i)">{{dataFormatter2(scope.row,i)}}</span>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <!-- 清单 end -->
      <!-- 聚合  大屏考虑到冻结列，所以表格行背景色要设成跟页面背景色一致的颜色-->
      <el-table
        v-else
        size="mini"
        :height="vscompt.comptAttrs.extendSetting.frozen?'100%':null"
        :border="vscompt.comptAttrs.extendSetting.tableTheme=='default'?true:false"
        :data="tableData || []"
        :row-class-name="rowClass"
        :span-method="mergeMethod"
        ref="tableBody"
        :class="[pageCache.classTypeId == '1001002'? 'mobile':'',pageCache.classTypeId == '1005'? 'bigScreen':'']"
        :style="tableStyle"
        :width="vscompt.comptAttrs.extendSetting.frozen?'100%':'100%'"
        @cell-click="tbCellClick"
        :row-style="datagridRowStyle"
        :header-cell-style="{'background':vscompt.comptAttrs.extendSetting.thBgColor,color:vscompt.comptAttrs.extendSetting.thTextColor}"
        :cell-style="{'background':vscompt.comptAttrs.extendSetting.tbBgColor,color:vscompt.comptAttrs.extendSetting.tbTextColor,'border-color':vscompt.comptAttrs.extendSetting.tbBdColor}"
        :show-header="showHead"
        :header-row-style="headerStyle"

      >
        <el-table-column
          v-if="vscompt.comptAttrs.extendSetting.showIndex"
          type="index"
          label="序号"
          width="50"
          :index="indexMethod"
        ></el-table-column>
        <!-- 树形多表头 带合并 -->
        <template v-for="item in tableHeader">
          <table-column
            v-if="item.children && item.children.length"
            :key="item.pos+Math.random()"
            :coloumn-header="item"
            :colSetting="newColSetting"
            @emitTbHeaderClick="tbHeaderClick"
          ></table-column>
          <el-table-column
            v-else
            :label="item.label"
            :prop="item.prop"
            :key="item.pos+Math.random()"
            :align="item.align?item.align:'center'"
            :show-overflow-tooltip="true"
          >
            <template slot="header" slot-scope="scope">
              <div @click="tbHeaderClick(item)" :title="item.label">{{item.label}}</div>
            </template>
            <template slot-scope="scope">
              <div v-bind:data="obj=showIcon(scope)">
                <i
                  v-show="obj.type === 'showIcon'"
                  :class="obj.clazz"
                  :style="obj.style"
                ></i>
                <span :style="obj.type==='showNum'&&obj.style">{{scope.row[scope.column.property]}}</span>
              </div>
            </template>
          </el-table-column>
        </template>
      </el-table>
      <div
        v-if="vscompt.comptAttrs.extendSetting['pagination.show']&& pageCache.classTypeId!== '1001002' && vscompt.comptAttrs.polymerizeType==2"
        class="pagination pagination-wrap"
      >
        <div class="total-page-wrap">
          <span>共{{vscompt.comptAttrs.extendSetting['pagination.total']}}条</span>
        </div>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="vscompt.comptAttrs.extendSetting['pagination.currentPage']"
          :page-sizes="[10, 20, 30, 40, 50, 100]"
          :page-size="vscompt.comptAttrs.extendSetting.pageSize"
          layout="prev, pager, next, jumper"
          :pager-count="5"
          :total="vscompt.comptAttrs.extendSetting['pagination.total']"
        ></el-pagination>
      </div>
    </div>
    <!-- <div class="drill-label" v-show="vscompt.comptAttrs['curDrillIdx']||0 > 0" @click="toDrillData">
      {{vscompt.comptAttrs['drillWBeanList'] != undefined && vscompt.comptAttrs['drillWBeanList'].length>0 && vscompt.comptAttrs['curDrillIdx']||0 >
      0?vscompt.comptAttrs['drillWBeanList'][vscompt.comptAttrs['curDrillIdx']||0].label:""}}
      <span
        v-show="vscompt.comptAttrs['drillWBeanList'].length>0&&vscompt.comptAttrs['curDrillIdx']||0>0"
        class="drill-icon icon-A10018_doubleArrowLeft"
      ></span>
    </div> -->
    <div class="drill-label1" v-show="vscompt.comptAttrs['curDrillIdx']||0 > 0">
      <div v-for="(drill, index) in vscompt.comptAttrs['drillWBeanList']"
        :id="index"
        :key="index"
        v-show="index>0"
        class="sub-drill-label"
        @click="toDrillData(index)">
      {{vscompt.comptAttrs['drillWBeanList'] != undefined && vscompt.comptAttrs['drillWBeanList'].length>0 && vscompt.comptAttrs['curDrillIdx']||0 >
      0?vscompt.comptAttrs['drillWBeanList'][index].label:""}}
      <span
        v-show="vscompt.comptAttrs['drillWBeanList'].length>0&&vscompt.comptAttrs['curDrillIdx']||0>0&&vscompt.comptAttrs['drillWBeanList'][index].label!=''"
        class="drill-icon icon-A10018_doubleArrowLeft"
      ></span>
      </div>
    </div>
    <div
      class="drill-label link-reset"
      v-show="linkageState && vscompt.comptAttrs['mainLinkageData'] != undefined && vscompt.comptAttrs['mainLinkageData'].length>0"
      @click="resetLinage()"
    >
      <span class="icon-A10622_PreOffline" title="重置联动信息"></span>
    </div>

     <el-dialog
      size="mini"
      title="导出历史"
      width="600px"
      class="queryHis"
      :visible.sync="queryHisDialog"
      :append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
    <QueryHisDialog v-if="queryHisDialog"></QueryHisDialog>
    </el-dialog>
    <ExportForm fromElDatagrid="1"></ExportForm>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState, mapGetters } from 'vuex'
import {
  constructList,
  genWhereBean,
  getFilteredData,
  getOrderList,
  objDeepCopy,
  addPageCondis,
  getNoMergeTableData,
  getTableReqParam,
  dataInterval,
  handleTbDimCell,
  loadDataDone,
  loadDataError
} from '../../utils/comonFunc.js'

import ExportForm from '../design/ExportForm.vue'
import TableColumn from './TableHeaderColumn'
import QueryHisDialog from '../design/QueryHistory.vue'

export default {
  props: ['vscompt'],
  components: {
    ExportForm,
    TableColumn,
    QueryHisDialog
  },
  data () {
    return {
      param: null,
      showSummary: false,
      temp: '<i class="icon-A10192_time"><i>',
      linkageState: false,
      mergeLine: {},
      mergeIndex: {},
      firColVal: '', // 总计行第一列的值
      clickCell: {
        label: '',
        value: '',
        element_id: ''
      }, // 当前点击单元格的值
      tableHeader: [],
      tableData: [],
      tableSetMap: {},
      mergeFlag: false,
      showHead: true
    }
  },
  mounted () {
    if (this.vscompt.afId == '' && this.vscompt.comptData == undefined) {
      this.$set(this.vscompt, 'comptData', {
        rows: [],
        columns: []
      })
    }

    if (this.vscompt.oriComptData == undefined) {
      this.$set(this.vscompt, 'RequestSelectList', []) // 存储聚合下请求的selectList
      this.$set(this.vscompt, 'oriComptData', [])
      this.$set(this.vscompt, 'oriComptDataBak', [])
    }

    if (this.pageCache.classTypeId == '1001002' && this.polymerizeType == 2) {
      this.scroll(this.$refs.tableBody.$el.children[2])
      this.scroll(this.$refs.table.children[0])
    }
    // 分析报告，设置导出短信验证默认值
    if (this.pageCache.classTypeId == '1001001' && this.vscompt.comptAttrs.extendSetting.needSms === '' || this.vscompt.comptAttrs.extendSetting.needSms === undefined) {
      this.vscompt.comptAttrs.extendSetting.needSms = this.needSms
      let subAttrs = this.vscompt.styleAttrs[3].children
      let index = 4
      if ((subAttrs[index] || {}).enName !== 'needSms') {
        subAttrs.some((item, i) => {
          if (item.enName === 'needSms') {
            index = i
            return true
          }
        })
      }
      this.vscompt.styleAttrs[3].children[index].value = this.needSms
    }
  },
  computed: {
    queryHisDialog: {
      get () {
        return this.$store.state.compt.QueryHistory
      },
      set (value) {
        this.setQueryHistory(value)
      }
    },
    ...mapState({
      isDSMapReady: state => state.AnalyReportAttr.isDSMapReady,
      datasetMap: state => state.AnalyReportAttr.datasetMap,
      s_edcuiCompts: state => state.PageDesign.s_edcuiCompts,
      pageCache: state => state.HomeBody.pageCache,
      exportType: state => state.QueryTable.exportType,
      linkStack: state => state.PageDesign.linkStack,
      needSms: state => state.commonProperties.needSms,
      columnLimit: state => state.commonProperties.report.columnLimit,
      rowLimit: state => state.commonProperties.report.rowLimit
    }),
    ...mapGetters({
      getPageParams: 'PageDesign/getPageParams',
      getQueryCompts: 'PageDesign/getQueryCompts',
      nowPage: 'PageDesign/getActivedPage'
    }),
    isCanDrill () {
      return this.vscompt.comptAttrs.drillData.length > 1
    },
    xAxisData () {
      var result = []
      if (this.vscompt.comptAttrs.xAxisData.length > 0) {
        result =
          constructList(this.vscompt.comptAttrs.xAxisData, this.datasetMap, this.vscompt.comptAttrs.computedData || [])
            .resultList || []
      }
      return result
    },
    yAxis1Data () {
      var result = []
      if (this.vscompt.comptAttrs.yAxis1Data.length > 0) {
        result = constructList(this.vscompt.comptAttrs.yAxis1Data, this.datasetMap, this.vscompt.comptAttrs.computedData || []).resultList || []
      }
      return result
    },
    yAxis2Data () {
      var result = []
      if (this.vscompt.comptAttrs.yAxis2Data.length > 0) {
        result =
          constructList(this.vscompt.comptAttrs.yAxis2Data, this.datasetMap, this.vscompt.comptAttrs.computedData || [])
            .resultList || []
      }
      return result
    },
    drillData () {
      var result = []
      if (this.vscompt.comptAttrs.drillData.length > 0) {
        result =
          constructList(this.vscompt.comptAttrs.drillData, this.datasetMap, this.vscompt.comptAttrs.computedData || [])
            .resultList || []
      }
      return result
    },
    checkIfNeedTotal () {
      // 只有清单才有合计
      let extSet = this.vscompt.comptAttrs.extendSetting
      if (this.pageCache.classTypeId == '1001002') { // 手机端
        let len = 0
        try {
          len = this.vscompt.comptData.rows.length
        } catch (e) {}
        return (
          extSet['pagination.total'] - len <= 0 &&
          this.vscompt.comptAttrs.polymerizeType == 2
        )
      }
      return (
        Math.ceil(extSet['pagination.total'] / extSet.pageSize) ==
          extSet['pagination.currentPage'] &&
        this.vscompt.comptAttrs.polymerizeType == 2
      )
    },
    tableCols () {
      if (this.polymerizeType == 1) {
        // 聚合，不用处理
        return []
      }
      let cols = []
      let colSet = this.vscompt.comptAttrs.colSetting || {}
      if (
        this.vscompt.comptData &&
        this.vscompt.comptData.columns &&
        this.vscompt.comptData.columns.length > 0
      ) {
        let oriCols = this.vscompt.comptData.columns
        for (let index = 0; index < oriCols.length; index++) {
          const element = oriCols[index]
          if (element.prop.indexOf('XXXXCODE_') < 0) {
            let newCol = {
              ...element,
              ...objDeepCopy(colSet[element.prop] || {})
            }
            newCol['label'] =
              colSet[element.prop] != undefined
                ? colSet[element.prop].nick_name
                : newCol['label']
            cols.push(newCol)
          }
        }
      }
      return cols
    },
    newColSetting () {
      return this.vscompt.comptAttrs.colSetting
    },
    dataLength () {
      return ((this.vscompt.comptData || {}).rows || []).length
    },
    columnLength () {
      return ((this.vscompt.comptData || {}).columns || []).length
    },
    merge () {
      let arr = []
      let oriCols = (this.vscompt.comptData || {}).columns || []
      for (let index = 0; index < oriCols.length; index++) {
        const element = oriCols[index]
        if (element.prop != element.label) arr.push(oriCols[index].prop)
      }
      if (this.polymerizeType == 1) {
        // 聚合用另一个column
        oriCols = this.tableHeader
        arr = []
        for (let index = 0; index < oriCols.length; index++) {
          arr.push(`col${index}`)
        }
      }
      return arr
    },
    tableStyle () {
      if (this.polymerizeType == 1) {
        return this.vscompt.comptAttrs.extendSetting.frozen
          ? {}
          : {
            overflow: 'auto',
            height: '100%'
          }
      }
      return this.vscompt.comptAttrs.extendSetting.frozen
        ? {}
        : {
          height: 'auto'
        }
    },
    isPageLinkSet () {
      return (
        this.vscompt.comptAttrs['pageLinkageData'] != undefined &&
        this.vscompt.comptAttrs['pageLinkageData'].length > 0
      )
    },
    cellStyle () {
      var obj = {
        overflow: 'auto',
        'white-space': 'nowrap'
      }
      return obj
    },
    tableFieldPosMap() {
      let posMap = {};
      let rowDimCount = this.rowDimCount; //行中维度的数量
      let colDimCount = this.colDimCount; //列中维度的数量

      let rowList = {}
      let colList = {}
      const rowLen = this.xAxisData.length
      const colLen = this.yAxis1Data.length
      this.xAxisData.forEach((item, index) => {
        let temp = {
          isDim: item.element_type == 1,
          index
        }
        rowList[item.element_id] = temp
      })
      this.yAxis1Data.forEach((item, index) => {
        let temp = {
          isDim: item.element_type == 1,
          index
        }
        colList[item.element_id] = temp
      })

      /*  * 表头数 = 行维度数量 + (列有度量 ? 1:0)
        行维度数量为0 列无度量（维度） = 1
        行度量 列空 无表头 */
      let xCount = this.xAxisData.filter(item => { return item.element_type == 1; }).length || 0;
      let yCount = this.yAxis1Data.filter(item => { return item.element_type == 2 }).length ? 1 : 0

      if (xCount === 0 && this.yAxis1Data.length > 0) yCount = 1
      let headCount = xCount + yCount
      for (const element_id in this.newColSetting) {
        let isMeasure = false
        let isInRow = false //是度量字段,是否在行
        let startRowIdx = -1
        let startColIdx = -1
        let endRowIdx = -1
        let endColIdx = -1
        let cellOffset = [0, 0] //单元格偏移量
        let isInDrill = false
        /* 规则：
            *维度在行，纵向，表头，
                开始行: 该维度index
                开始列:（维度在列个数）- 1
                结束行：=开始行
                结束列：=开始列
            *维度在列，纵向，表头,
                -- 行有维度时，最后一个列维度只有最后一行
                开始行: 0 ，行维度个数 + 1
                开始列: 该维度index
                结束行：表头数headCount -1
                结束列：=开始列
            *度量在行，纵向，数据
                开始行: 表头数headCount
                开始列:（维度在列个数）
                结束行：=数据总数
                结束列：=开始列
            *度量在列，横向，表头
                开始行: 表头数headCount
                开始列:（维度在列个数）
                结束行：=开始行
                结束列：=数据列数
        */
       try {
        isMeasure = !({...rowList, ...colList}[element_id]).isDim
       } catch (error) {
         isInDrill = true
       }
        isInRow = !isInDrill && !!rowList[element_id]
        if (isInDrill) {
          // 如果是钻取字段且不在行列里，则其位置跟第一个钻取字段位置相同
          startColIdx = posMap[this.drillData[0].element_id].startColIdx;
          startRowIdx = posMap[this.drillData[0].element_id].startRowIdx;
          endRowIdx = startRowIdx
          endColIdx = startColIdx
        } else {
          // 维度在行=>纵向，表头，
          if (!isMeasure && isInRow) {
            const rowHasAll = rowDimCount != rowLen
            startRowIdx = rowList[element_id].index
            startColIdx = rowHasAll || colDimCount === 0 ? colDimCount : colDimCount - 1
            endRowIdx = startRowIdx
            endColIdx = startColIdx
          }
          // *维度在列，纵向，表头,
          else if (!isMeasure && !isInRow) {
            const isLastColDim = colList[element_id].index == colDimCount - 1
            const rowHasAll = rowDimCount != rowLen

            startRowIdx = isLastColDim && !rowHasAll ? (rowDimCount >= headCount ? headCount - 1 : rowDimCount) : 0
            startColIdx = colList[element_id].index
            endRowIdx = isLastColDim && !rowHasAll ? (rowDimCount >= headCount ? headCount - 1 : rowDimCount) : headCount - 1
            endColIdx = startColIdx
          }
          // *度量在行，纵向，数据
          else if (isMeasure && isInRow) {
            startRowIdx = rowDimCount === 0 && colLen > 0 ? rowList[element_id].index + 1 : rowList[element_id].index
            startColIdx = colDimCount
            endRowIdx = -8888 // 在handleColSet()计算数据总数
            endColIdx = startColIdx
            cellOffset = [rowLen - rowDimCount - 1, 0]
          }
          // *度量在列，横向，表头
          else if (isMeasure && !isInRow) {
            startRowIdx = headCount - 1
            startColIdx = colDimCount === 0 && rowLen > 0 ? colList[element_id].index + 1 : colList[element_id].index
            endRowIdx = startRowIdx
            endColIdx = -9999 // 在handleColSet()计算数据列数
            cellOffset = [0, colLen - colDimCount - 1]
          }
        }

        posMap[element_id] = {
          isMeasure,
          isInRow,
          startColIdx,
          cellOffset,
          startRowIdx,
          isInDrill,
          endRowIdx,
          endColIdx,
          nick_name: this.newColSetting[element_id].nick_name
        };
      }
      return posMap
    },
    // 行中维度的数量
    rowDimCount () {
      return (
        this.xAxisData.filter(item => {
          return item.element_type == 1
        }).length || 0
      )
    },
    // 列中维度的数量
    colDimCount () {
      return (
        this.yAxis1Data.filter(item => {
          return item.element_type == 1
        }).length || 0
      )
    },
    //  聚合明细类型 1-聚合 2-明细
    polymerizeType () {
      return this.vscompt.comptAttrs.polymerizeType
    },
    headerStyle (){
      let header = this.vscompt.comptAttrs.extendSetting.headerHeight || 35;
      this.$nextTick(()=>{
        this.$refs.tableBody.doLayout()
      })
      return {
        'height':`${header}px`
      }
    }
  },
  watch: {
    isDSMapReady: {
      immediate: true, // immediate选项可以开启首次赋值监听
      handler (newVal, oldVal) {
        if (this.vscompt.oriComptData == undefined) {
          this.$set(this.vscompt, 'RequestSelectList', []) // 存储聚合下请求的selectList
          this.$set(this.vscompt, 'oriComptDataBak', [])
          this.$set(this.vscompt, 'oriComptData', [])
        }
        if (this.vscompt.comptAttrs.curDrillIdx == undefined) {
          this.$set(this.vscompt.comptAttrs, 'curDrillIdx', 0)
          this.$set(this.vscompt.comptAttrs, 'drillWBeanList', [])
        }
        if (this.vscompt.comptData == undefined) {
          this.$set(this.vscompt, 'comptData', {
            columns: [],
            rows: []
          })
          this.$set(this.vscompt.comptAttrs, 'isNeedRestDrill', 0)
        }
        if (
          newVal &&
          this.vscompt.afId != '' &&
          this.vscompt.comptData.columns.length == 0
        ) {
          if (this.linkStack.length > 0 && this.vscompt.comptAttrs.isLinkage) {
            let param = []
            for (let item of this.linkStack) {
              if (item.comptId == this.vscompt.comptId) {
                param = item.param
                break
              }
            }
            if (param.length > 0) {
              this.queryLinkData(param)
            } else {
              this.queryData()
            }
          } else {
            this.queryData()
          }
        }
        // pagepreview.vue 加载datasetMap速度慢于表格加载速度时
        if (this.polymerizeType == 1 && this.tableHeader.length === 0) {
          let temp = this.vscompt.oriComptData
          this.$set(this.vscompt, 'oriComptData', [])
          this.$set(this.vscompt, 'oriComptData', temp)
        }
        if (this.pageCache.operation == 'preview') { // 数据刷新
          let time = this.vscompt.comptAttrs.extendSetting.timerValue
          dataInterval(time, this.queryData, this.vscompt.comptAttrs.extendSetting)
        }
      }
    },
    'vscompt.comptAttrs.isNeedRestDrill': {
      immediate: true,
      handler (newVal, oldVal) {
        if (newVal > 0) {
          this.vscompt.comptAttrs.curDrillIdx = 0
          this.vscompt.comptAttrs.drillWBeanList = []
        }
      }
    },
    'vscompt.comptAttrs.linkageCondi': {
      // 监听联动
      // immediate: true,
      deep: true,
      handler (newVal, oldVal) {
        if (this.vscompt.comptAttrs.isLinkage) {
          // if (
          //   this.vscompt.comptAttrs.isLinkage &&
          //   this.isDSMapReady &&
          //   (newVal || []).length >= 0
          // ) {
          this.queryLinkData(newVal || [])
        }
      }
    },
    'vscompt.comptAttrs.isNeedResetLink': {
      // immediate: true,
      handler (newVal, oldVal) {
        if (
          newVal > 0 &&
          this.vscompt.comptAttrs['mainLinkageData'].length > 0 &&
          this.linkageState
        ) {
          this.resetLinage()
        }
      }
    },
    'vscompt.comptAttrs.extendSetting.totalRow': {
      handler (newVal, oldVal) {
        if (this.polymerizeType == 1) {
          return
        }
        if (!newVal) {
          this.$set(this.vscompt.comptAttrs.extendSetting, 'pagination.currentPage', 1)
          this.queryData()
        }
      }
    },
    'vscompt.comptAttrs.extendSetting.subTotalCol': {
      handler (newVal, oldVal) {
        if (this.polymerizeType == 1 && newVal !== "") {
          this.$set(this.vscompt.comptAttrs.extendSetting, 'pagination.currentPage', 1)
          this.queryData()
        }
      }
    },
    'vscompt.comptAttrs.extendSetting.subTotal': {
      handler (newVal, oldVal) {
        if (this.polymerizeType == 1) {
          this.$set(this.vscompt.comptAttrs.extendSetting, 'pagination.currentPage', 1)
          this.queryData()
        }
      }
    },
    'vscompt.comptAttrs.extendSetting.batchSetting': {
      handler (newVal, oldVal) {
        if (
          newVal > 0 &&
          this.checkIfNeedTotal &&
          this.vscompt.comptAttrs.extendSetting.totalRow
        ) {
          this.queryData()
        }
        this.vscompt.comptAttrs.extendSetting['batchSetting'] = 0
      }
    },
    'vscompt.comptAttrs.extendSetting.pageSize': {
      // deep: true,
      handler (newVal, oldVal) {
        this.vscompt.comptAttrs.extendSetting['pagination.currentPage'] = 1
        this.queryData()
      }
    },
    dataLength () {
      if (this.dataLength > 0) {
        this.vscompt.comptData.rows = this.vscompt.comptData.rows.filter(item => item !== null)
        this.getMergeArr(this.vscompt.comptData.rows, this.merge)
      }
    },
    columnLength () {
      if (this.columnLength > 0) {
        this.vscompt.comptData.rows = (this.vscompt.comptData.rows || []).filter(item => item !== null)
        this.getMergeArr(this.vscompt.comptData.rows, this.merge)
      }
    },
    'vscompt.comptAttrs.extendSetting.showIndex': {
      deep: true,
      handler (newVal, oldVal) {
        // 合计完 选中展示序号，把第一列的值回填进去

        // 聚合，不处理
        if (this.polymerizeType == 1) {
          this.mergeThMethod()
          return
        }
        let comptData1 = this.vscompt.comptData || []
        if (comptData1.length === 0) {
          return
        }
        if (
          newVal &&
          this.dataLength > 0 &&
          this.checkIfHasTotalRow() &&
          comptData1.rows[this.dataLength - 1].isTotal != undefined
        ) {
          comptData1.rows[this.dataLength - 1][
            comptData1.columns[0].prop
          ] = this.firColVal
        }
        // 先选中，再勾掉
        if (oldVal) {
          comptData1.rows[this.dataLength - 1][comptData1.columns[0].prop] = '合计'
        }
        this.mergeThMethod()
      }
    },
    'vscompt.comptData.rows': {
      deep: true,
      handler (newVal, oldVal) {
        if (newVal != undefined && newVal.length > 0) {
          newVal = this.vscompt.comptData.rows.filter(item => item !== null)
          this.getMergeArr(newVal, this.merge)
        }
      }
    },
    'vscompt.comptAttrs.extendSetting.frozen': {
      handler (newVal, oldVal) {
        this.mergeThMethod()
        // var flag = this.vscompt.comptAttrs.extendSetting["frozen"];
        // if (flag) {
        //   document.getElementsByClassName(
        //     "el-table__header-wrapper"
        //   )[0].style.display = "block";
        //   document.getElementsByClassName(
        //     "el-table__body-wrapper"
        //   )[0].style.display = "block";
        // } else {
        //   document.getElementsByClassName(
        //     "el-table__header-wrapper"
        //   )[0].style.display = "table";
        //   document.getElementsByClassName(
        //     "el-table__body-wrapper"
        //   )[0].style.display = "table";
        // }
      }
    },
    'vscompt.oriComptData': {
      deep: true,
      immediate: true,
      handler (newVal, oldVal) {
        let rows = []
        let columns = []
        if (this.polymerizeType == 1 && newVal != undefined) {
          // 聚合
          if (newVal.length > 0) {
            /*  * 表头数 = 行维度数量 + (列有度量 ? 1:0)
              行维度数量为0 列无度量（维度） = 1
              行度量 列空 无表头 */
            let xCount = this.xAxisData.filter(item => { return item.element_type == 1 }).length || 0
            let yCount = this.yAxis1Data.filter(item => { return item.element_type == 2 }).length ? 1 : 0

            if (xCount === 0 && this.yAxis1Data.length > 0) yCount = 1
            let headCount = xCount + yCount - 1
            this.showHead = headCount !== -1
            // 限制最大行数 - 表头数
            if (newVal.length > this.rowLimit + headCount) {
              newVal.splice(this.rowLimit + headCount)
            }
            let dimList = this.xAxisData
              .concat(this.yAxis1Data)
              .filter(item => {
                return item.element_type == 1
              })
            if (this.drillData.length > 0 && this.vscompt.comptAttrs.curDrillIdx > 0) {
              // 如果处于下钻状态，把下钻的第一层换成下钻当前层
              for (let inx = 0; inx < dimList.length; inx++) {
                if (dimList[inx].element_id == this.drillData[0].element_id) {
                  dimList[inx] = this.drillData[this.vscompt.comptAttrs.curDrillIdx]
                }
              }
            }
            let data = getNoMergeTableData(
              objDeepCopy(newVal),
              headCount,
              dimList
            )
            rows = data.rows
            columns = data.columns
          }

          this.tableData = rows
          this.tableHeader = columns
          this.getMergeArr(this.tableData, this.merge)
        }
      }
    },
    newColSetting: {
      deep: true,
      handler (newVal, oldVal) {
        // 聚合 监听列设置将更改设进去
        if (
          newVal != undefined &&
          this.polymerizeType == 1 &&
          this.vscompt.oriComptDataBak != undefined
        ) {
          this.handleColSet(this.vscompt.oriComptDataBak, newVal)
        }
      }
    },
    'vscompt.oriComptDataBak': {
      deep: true,
      handler (newVal, oldVal) {
        // 聚合 监听列设置将更改设进去
        if (this.newColSetting != undefined && this.polymerizeType == 1) {
          this.handleColSet(newVal, this.newColSetting)
        }
      }
    },
    mergeFlag (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.mergeThMethod()
      }
    },
    'vscompt.comptAttrs.extendSetting.needTotal': {
      deep: true,
      handler (newVal, oldVal) {
        if (newVal !== undefined) {
          this.queryData()
        }
      }
    }
  },
  methods: {
    queryData (param) {
      this.vscompt.comptAttrs.loading = true
      let selectList = []
      let dim_value = ''
      let whereBean = objDeepCopy(this.vscompt.comptAttrs.whereBean)
      if (param != undefined && param.isUpDrill) {
        // 钻取返回可返回到指定层，drillWBeanList删除指定层之后的数据
        this.vscompt.comptAttrs.drillWBeanList.splice(this.vscompt.comptAttrs.curDrillIdx, this.vscompt.comptAttrs.drillWBeanList.length - this.vscompt.comptAttrs.curDrillIdx)
        this.vscompt.comptAttrs.curDrillIdx--
        let curDrillIdx = this.vscompt.comptAttrs.curDrillIdx
        // 下钻时，每层的下钻条件已经拼好，直接取就行了
        let wbRuleList = objDeepCopy(this.vscompt.comptAttrs.drillWBeanList[curDrillIdx].whereBean.rule_list) || []
        let drillWBRule = wbRuleList.filter(item => {
          return item.exp_id.indexOf('drill_exp') > -1
        })
        // 下钻条件和whereBean拼接
        whereBean = genWhereBean(
          drillWBRule,
          whereBean,
          true
        )

        // this.vscompt.comptAttrs.drillWBeanList.pop();
        // if (this.vscompt.comptAttrs.curDrillIdx > 0) {
        //   let drillLevel = objDeepCopy(
        //     this.vscompt.comptAttrs.drillWBeanList[
        //       this.vscompt.comptAttrs.drillWBeanList.length - 1
        //     ]
        //   );
        //   whereBean = genWhereBean(
        //     [
        //       {
        //         col_id: drillLevel.item.col_id,
        //         col_type: "2",
        //         exp_id: "",
        //         is_dim: "1",
        //         symbol: 3,
        //         rule_value: drillLevel.value,
        //         obj_id: drillLevel.item.tab_id,
        //         element_id: drillLevel.item.element_id
        //       }
        //     ],
        //     whereBean,
        //     true
        //   );
        // }
        this.vscompt.comptAttrs.extendSetting['pagination.currentPage'] = 1
      } else if (param != undefined && param.isDownDrill) {
        this.vscompt.comptAttrs.extendSetting['pagination.currentPage'] = 1
        this.vscompt.comptAttrs.curDrillIdx++
        let curDrillIdx = this.vscompt.comptAttrs.curDrillIdx
        // 构造当前层级的rule
        dim_value = this.clickCell.value
        let curField = this.drillData[curDrillIdx - 1]
        let curDrillWBRule = {
          col_id: curField.col_id,
          col_type: '2',
          exp_id: '',
          is_dim: '1',
          symbol: 3,
          rule_value: dim_value,
          obj_id: curField.tab_id,
          element_id: curField.element_id
        }
        // 获取下钻当前层级的前一级的rule_list（下钻时，每层的下钻条件已经拼好，直接取就行了）
        let wbRuleList = objDeepCopy(this.vscompt.comptAttrs.drillWBeanList[curDrillIdx - 1].whereBean.rule_list) || []
        let drillWBRule = wbRuleList.filter(item => {
          return item.exp_id.indexOf('drill_exp') > -1
        })
        for (let index = 0; index < drillWBRule.length; index++) {
          drillWBRule[index].exp_id = ''
        }
        drillWBRule.push(curDrillWBRule)// 所有下钻条件存在一起
        // 所有下钻条件和whereBean拼接
        whereBean = genWhereBean(
          drillWBRule,
          whereBean,
          true
        )

        this.vscompt.comptAttrs.drillWBeanList.push({
          item: objDeepCopy(
            this.drillData[this.vscompt.comptAttrs.curDrillIdx]
          ),
          whereBean: objDeepCopy(whereBean),
          label: param.label,
          value: dim_value
        })
      } else {
        let curDrillIdx = this.vscompt.comptAttrs.curDrillIdx
        if (curDrillIdx > 0) {
          // 下钻时，每层的下钻条件已经拼好，直接取就行了
          let wbRuleList = objDeepCopy(this.vscompt.comptAttrs.drillWBeanList[curDrillIdx].whereBean.rule_list) || []
          let drillWBRule = wbRuleList.filter(item => {
            return item.exp_id.indexOf('drill_exp') > -1
          })
          // 下钻条件和whereBean拼接
          whereBean = genWhereBean(
            drillWBRule,
            whereBean,
            true
          )
        }
      }

      // 还要判断当前是否在联动状态则应该返回联动的那个状态
      if (
        this.vscompt.comptAttrs['linkageCondi'] != undefined &&
        this.vscompt.comptAttrs['linkageCondi'].length > 0
      ) {
        whereBean = genWhereBean(
          this.vscompt.comptAttrs['linkageCondi'],
          objDeepCopy(whereBean)
        )
      }

      // 如果当前处在钻取条件下，去点页码，要把条件继续带下来查
      // if (this.vscompt.comptAttrs.curDrillIdx > 0 && param == undefined) {
      //   dim_value =
      //     this.clickCell.value ||
      //     this.vscompt.comptAttrs.drillWBeanList[
      //       this.vscompt.comptAttrs.curDrillIdx
      //     ].value;
      //   let curField = this.drillData[this.vscompt.comptAttrs.curDrillIdx - 1];
      //   whereBean = genWhereBean(
      //     [
      //       {
      //         col_id: curField.col_id,
      //         col_type: "2",
      //         exp_id: "",
      //         is_dim: "1",
      //         symbol: 3,
      //         rule_value: dim_value,
      //         obj_id: curField.tab_id,
      //         element_id: curField.element_id
      //       }
      //     ],
      //     whereBean,
      //     true
      //   );
      // }

      selectList = objDeepCopy(this.xAxisData)
      if (this.polymerizeType == 1) {
        // 交叉表聚合数据处理格式特殊处理
        selectList = (this.yAxis1Data || []).concat(selectList)
      }
      selectList = this.reGenSelectedList(selectList)
      let flag = false
      if (param != undefined && param.isExport != undefined) { flag = param.isExport }
      selectList = this.getSelectList(selectList, flag)
      if (selectList.length == 0) {
        this.vscompt.comptAttrs.loading = false
        return
      }

      selectList = objDeepCopy(selectList)
      if (this.polymerizeType == 2) {
        // 清单
        for (let index = 0; index < selectList.length; index++) {
          const element = selectList[index]
          if (element.element_type == 2) {
            selectList[index].fun_type = ''
          }
        }
      } else {
        // 聚合
        let dgColSetting = this.vscompt.comptAttrs.colSetting
        for (let index = 0; index < selectList.length; index++) {
          const element = selectList[index]
          if (element.element_type == 2) {
            selectList[index].fun_type =
              dgColSetting[element.element_id].polymerFunType == 0 ? 0 : (dgColSetting[element.element_id].polymerFunType || 2)
          }
        }
      }

      let orderList = getOrderList(selectList)
      let params = {
        reqType: '1',
        dataType: '2',
        afQueryBean: {
          af_id: this.vscompt.afId,
          begin_date: '',
          head_bean: {
            pageCount: this.vscompt.comptAttrs.extendSetting['pageSize'],
            start: this.vscompt.comptAttrs.extendSetting[
              'pagination.currentPage'
            ],
            user_id: window.sessionStorage.getItem('user_id')
          },
          is_need_log: 1,
          is_need_paging: 1,
          is_need_permission: 1,
          is_need_trans: 1,
          query_type: '1',
          select_list: selectList,
          order_list: orderList,
          where_bean: whereBean
        }
      }
      // 页面添加计算字段构造element_list
      let computedData = this.vscompt.comptAttrs.computedData || []
      if (computedData.length > 0) {
        let element_list = []
        let select_list = []
        for (let i = 0; i < params.afQueryBean.select_list.length; i++) {
          let item = params.afQueryBean.select_list[i]
          if (item.from_compt) {
            for (let j = 0; j < computedData.length; j++) {
              if (computedData[j].element_id === item.element_id) {
                let targ = computedData[j]
                let list = targ.related_fields
                let { element_id, element_name, is_calcul, tab_id, col_fun_exp, tab_alias } = targ
                element_list.push({ element_id, element_name, is_calcul, tab_id, col_fun_exp, tab_alias })
                element_list = element_list.concat(list)
                select_list.push(item)
                break
              }
            }
          } else {
            select_list.push(item)
          }
        }
        params.afQueryBean.element_list = element_list
        params.afQueryBean.select_list = select_list
      }

      if (
        param != undefined &&
        param.isExport != undefined &&
        param.isExport === true
      ) {
        return params
      }

      this.executeReqest(params)
    },
    executeReqest (params, queryTotal) {
      if (params.afQueryBean.select_list.length == 0) {
        this.vscompt.comptAttrs.loading = false
        return
      }
      // 补上其他页面的联动设置 在预览页面才要考虑传递公共参数和页面参数
      if (this.pageCache.operation == 'preview') {
        params = addPageCondis({
          vscompt: this.vscompt,
          params: params,
          datasetMap: this.datasetMap,
          pageParams: this.getPageParams,
          queryCompts: this.getQueryCompts(),
          pageId: this.pageCache.pageId
        })
      }

      let polymerizeType = this.polymerizeType
      if (polymerizeType == 1) {
        // 表格请求不太格式跟其他组件不一样
        params = getTableReqParam({
          params: params,
          xAxisData: this.xAxisData,
          yAxis1Data: this.yAxis1Data,
          polymerizeType: polymerizeType,
          vscompt: this.vscompt
        })

        this.vscompt['RequestSelectList'] = objDeepCopy(
          params.afQueryBean.select_list
        )
      }

      // queryTotal---true--查询合计信息
      let selList = objDeepCopy(params.afQueryBean.select_list)
      selList = selList.filter((item, i) => {
        return item.element_type == 2
      })
      let colFormatSet = {} // 存储总计的格式化设置
      if (queryTotal) {
        // 查询总计信息
        if (selList.length == 0) {
          this.$message.closeAll()
          this.$message({
            message: '请至少选一个度量字段',
            type: 'warning'
          })
          return
        } else {
          let colSets = this.vscompt.comptAttrs.colSetting
          for (let index = 0; index < selList.length; index++) {
            const element = selList[index]
            element.fun_type = colSets[element.element_id].totalFunType
            if (element.fun_type == 1) {
              // 针对非count总计列，小数点保留2位
              // count
              element.numType = 0
              element.dot = 0
            } else {
              element.numType = 1
              element.dot = 2
            }
            colFormatSet[element.element_id] = {
              dot: element.dot
            }
          }
          params.afQueryBean.head_bean.pageCount = ''
          params.afQueryBean.head_bean.start = ''
          params.afQueryBean.select_list = selList
        }
      }

      var _this = this
      this.vscompt.comptAttrs.loading = true
      let computedData = this.vscompt.comptAttrs.computedData || []
      this.queryComptData({ params, computedData })
        .then(function (response) {
          if (response.data.respResult == 1) {
            let comptData = response.data.respData
            if (_this.polymerizeType == 1) {
              // 交叉表聚合
              _this.$set(_this.vscompt, 'oriComptDataBak', objDeepCopy(
                comptData.result_data_list || []
              ))
              _this.vscompt['mergeList'] = comptData.result_merge_list
            }

            let subTotalObj = _this.vscompt.styleAttrs[3].children[1]
            let totalColIndex = 1
            if (subTotalObj.enName !== 'subTotalCol') {
              _this.vscompt.styleAttrs[3].children.some((attr, i) => {
                if (attr.enName !== 'subTotalCol') {
                  return false
                }
                totalColIndex = i
                subTotalObj = attr
                return true
              })
            }
            let colVal = _this.vscompt.styleAttrs[3].children[totalColIndex].value
            _this.vscompt.comptAttrs.extendSetting['subTotalCol'] = subTotalObj.value && colVal

            if (queryTotal && selList.length > 0) {
              // 总计处理
              comptData.data = comptData.data || []
              let comptData1 = _this.vscompt.comptData
              let rowData = objDeepCopy(comptData1.rows[0])
              let columns1 = comptData1.columns
              rowData.isTotal = true
              _this.firColVal = ''
              for (let index = 0; index < columns1.length; index++) {
                let prop1 = columns1[index].prop
                if (comptData.data.length > 0 && comptData.data[0][prop1]) {
                  let colVal = comptData.data[0][prop1]
                  rowData[prop1] =
                    colFormatSet[prop1].dot > 0 && colVal != parseInt(colVal)
                      ? parseFloat(colVal).toFixed(colFormatSet[prop1].dot)
                      : colVal // 带小数点保留2位小数
                  if (index == 0) {
                    _this.firColVal = rowData[prop1] // 存储第一列的值
                  }
                } else {
                  rowData[prop1] = ''
                }
                if (
                  index == 0 &&
                  !_this.vscompt.comptAttrs.extendSetting.showIndex
                ) {
                  rowData[columns1[0].prop] = '合计'
                }
              }
              _this.vscompt.comptData.rows.push(rowData)
            } else {
              let allColumns = objDeepCopy(_this.xAxisData.concat(_this.yAxis1Data))
              if (_this.drillData.length > 0 && _this.vscompt.comptAttrs.curDrillIdx > 0) {
                // 如果处于下钻状态，把下钻的第一层换成下钻当前层
                for (let inx = 0; inx < allColumns.length; inx++) {
                  if (allColumns[inx].element_id == _this.drillData[0].element_id) {
                    allColumns[inx] = _this.drillData[_this.vscompt.comptAttrs.curDrillIdx]
                  }
                }
              }
              for (
                let index = 0;
                index < (comptData.columns || []).length;
                index++
              ) {
                for (const col1 of allColumns) {
                  if (col1.element_id == comptData.columns[index].prop) {
                    comptData.columns[index] = {
                      ...objDeepCopy(col1),
                      ...objDeepCopy(comptData.columns[index])
                    }
                    break
                  }
                }
              }

              if (
                _this.pageCache.classTypeId == '1001002' &&
                _this.polymerizeType == 2
              ) {
                // 清单情况下
                // 手机
                if ((_this.vscompt.comptData.rows || []).length != 0) {
                  var temp = _this.vscompt.comptData.rows || []
                  if (params.afQueryBean.head_bean.start != 1) {
                    // 不是第一页才拼接
                    _this.vscompt.comptData = {
                      columns: comptData.columns || [],
                      rows: temp.concat(comptData.data) || []
                    }
                  } else {
                    _this.vscompt.comptData = {
                      columns: comptData.columns || [],
                      rows: comptData.data || []
                    }
                  }
                } else {
                  _this.vscompt.comptData = {
                    columns: comptData.columns || [],
                    rows: comptData.data || []
                  }
                }
              } else {
                // 交叉表聚合情况下columns值不更新
                if (polymerizeType != 1) {
                  _this.vscompt.comptData = {
                    columns: comptData.columns || [],
                    rows: comptData.data || []
                  }
                }
              }
              _this.vscompt.comptAttrs.extendSetting['pagination.total'] =
                Number(comptData.totalCount) || 0
              if (_this.checkIfHasTotalRow()) {
                _this.executeReqest(params, true)
              }
            }
            loadDataDone(_this.vscompt);
          } else {
            loadDataError(_this.vscompt,'数据更新失败');
            // _this.$message.error('数据更新失败')
            console.error(response.data.respErrorDesc)
          }
        })
        .catch(function (error) {
          console.error(error)
          // _this.$message.error("数据更新失败");
        })
        .finally(() => {
          _this.vscompt.comptAttrs.loading = false
        })
    },
    ...mapMutations({
      setExportType: 'QueryTable/setExportType',
      setTabActive: 'AsynExport/setTabActive'
    }),
    ...mapActions({
      queryAfPropertyData: 'QueryTable/queryAfPropertyData',
      queryComptData: 'QueryTable/queryComptData',
      exportTable: 'QueryTable/exportTable',
      setExportDialog: 'compt/setExportDialog',
      sendSms: 'compt/sendSms',
      setSmsId: 'compt/setSmsId',
      setCompLinkageCondi: 'PageDesign/setCompLinkageCondi',
      checkIfOpenChildPage: 'PageDesign/checkIfOpenChildPage',
      setQueryHistory: 'compt/setQueryHistory'
    }),
    toDrillData (index) {
      this.$set(this.vscompt.comptAttrs, 'curDrillIdx', index)
      this.queryData({ isUpDrill: true })
    },
    setLinkageCondi (isFromReset) {
      let dim_value = this.clickCell.value
      let is_dim = 0
      let field1 = this.xAxisData.concat(this.yAxis1Data).filter(item => {
        return item.element_id == this.clickCell.element_id
      })
      if (
        field1.length > 0 &&
        field1[0].dim_level_id != undefined &&
        field1[0].dim_level_id != null &&
        field1[0].dim_level_id != ''
      ) {
        is_dim = 1
      }
      let linkData = getFilteredData(
        this.vscompt.comptAttrs.mainLinkageData,
        'rel_element_id',
        this.clickCell.element_id
      )
      this.setCompLinkageCondi({
        linkData: linkData,
        dim_value: dim_value,
        is_dim: is_dim
      })
      if (!isFromReset) {
        // 如果是从resetLinage过来的，不要走跳转页面
        this.checkIfOpenChildPage({
          dim_value: dim_value,
          vscompt: this.vscompt,
          element_id: this.clickCell.element_id
        })
      }
    },
    queryLinkData (linkageCondi) {
      this.vscompt.comptAttrs.loading = true
      let whereBean = genWhereBean(
        linkageCondi,
        objDeepCopy(this.vscompt.comptAttrs.whereBean)
      )
      let selList = this.xAxisData
      if (this.polymerizeType == 1) {
        // 交叉表聚合数据处理格式特殊处理
        selList = (this.yAxis1Data || []).concat(selList)
      }
      let selectList = this.getSelectList(selList)
      // 还要判断当前是否在钻取状态，如果在钻取状态，钻取条件不能丢
      if (this.vscompt.comptAttrs.drillWBeanList.length > 1) {
        let drillWhereBean1 = objDeepCopy(
          this.vscompt.comptAttrs.drillWBeanList[
            this.vscompt.comptAttrs.curDrillIdx
          ].whereBean.rule_list[0]
        )
        if (
          drillWhereBean1 != undefined &&
          drillWhereBean1['exp_id'] != undefined
        ) {
          drillWhereBean1['exp_id'] = ''
          whereBean = genWhereBean(
            [drillWhereBean1],
            objDeepCopy(whereBean),
            true
          )
        }
        selectList = this.reGenSelectedList(selectList)
        selectList = this.getSelectList(selectList)
      }
      let orderList = getOrderList(selectList)
      let extSetting = this.vscompt.comptAttrs.extendSetting
      extSetting['pagination.currentPage'] = 1
      if (this.polymerizeType == 2) {
        // 清单
        selectList = objDeepCopy(selectList)
        for (let index = 0; index < selectList.length; index++) {
          const element = selectList[index]
          if (element.element_type == 2) {
            selectList[index].fun_type = ''
          }
        }
      } else {
        // 聚合 把聚合函数带进去
        selectList = objDeepCopy(selectList)
        let colSetting = this.vscompt.comptAttrs.colSetting
        for (let index = 0; index < selectList.length; index++) {
          const element = selectList[index]
          if (element.element_type == 2) {
            selectList[index].fun_type =
              colSetting[element.element_id].polymerFunType == 0 ? 0 : (colSetting[element.element_id].polymerFunType || 2)
          }
        }
      }
      let params = {
        reqType: '1',
        dataType: '2',
        afQueryBean: {
          af_id: this.vscompt.afId,
          begin_date: '',
          head_bean: {
            pageCount: extSetting['pageSize'],
            start: extSetting['pagination.currentPage'],
            user_id: window.sessionStorage.getItem('user_id')
          },
          is_need_log: 1,
          is_need_paging: 1,
          is_need_permission: 1,
          is_need_trans: 1,
          query_type: '1',
          select_list: selectList,
          order_list: orderList,
          where_bean: whereBean
        }
      }
      this.executeReqest(params)
    },
    resetLinage () {
      this.clickCell.label = ''
      this.clickCell.value = ''
      this.setLinkageCondi(true)
      this.clickCell.element_id = ''
      this.linkageState = false
    },
    getSelectList (xAxisData, isExport = false) {
      let selectList = xAxisData
      // let selectList = xAxisData.concat(
      //   this.yAxis1Data.concat(this.yAxis2Data)
      // );
      if (!isExport) {
        for (let index = 0; index < selectList.length; index++) {
          const element = selectList[index]
          if (element.dim_id != '' && element.dim_id != null) {
            let colItem = objDeepCopy(element)
            colItem.dim_id = ''
            colItem.dim_level_id = ''
            colItem['is_translate'] = 0
            if (this.polymerizeType == 1) {
              // 聚合
              colItem.nick_name = colItem.nick_name + '_drill'
            } else {
              colItem.nick_name = 'XXXXCODE_' + colItem.element_id
            }
            selectList.push(colItem) // 把所有有绑定维度的字段都加入查询列表，获取对应的维值
          }
        }
      }
      return selectList
    },
    headerCellStyle ({ row, column, rowIndex, columnIndex }) {
      // 表头样式
      if (rowIndex === 0) {
        return 'background-color: lightblue;color: #fff;border-bottom: 2px solid #fff;'
      }
    },
    queryHistory () {
      this.setTabActive('first')
      this.setQueryHistory(true)
    },
    dataFormatter2 (rowData, index) {
      let prop = (this.vscompt.comptData || {}).columns[index]['prop']
      let cellValue = rowData[prop] || ''
      let col = this.vscompt.comptAttrs.colSetting[prop]
      if (cellValue != '总计') {
        if (col.numType == 1) {
          cellValue = parseFloat(cellValue).toFixed(col.dot)
        } else if (col.numType == 2) {
          let dot = parseInt(col.dot + '' || '0')
          cellValue = parseFloat(parseFloat((cellValue + '').replace(/%/gi, '')) * 100).toFixed(dot) +
            '%'
        }
      }
      // 为空或者为NaN时候设置 -
      if (cellValue.indexOf('NaN') > -1 || cellValue == '') {
        cellValue = '-'
      }
      return cellValue
    },
    dataFormatter3 (oriCellVal, colSeting) {
      let cellValue = oriCellVal || ''
      if (cellValue != '总计') {
        if (colSeting.numType == 1) {
          cellValue = parseFloat(cellValue).toFixed(colSeting.dot)
        } else if (colSeting.numType == 2) {
          let dot = parseInt(colSeting.dot + '' || '0')
          cellValue = parseFloat(parseFloat((cellValue + '').replace(/%/gi, '')) * 100).toFixed(dot) +
            '%'
        }
      }
      // 为空或者为NaN时候设置 -
      if (cellValue.indexOf('NaN') > -1 || cellValue == '') {
        cellValue = '-'
      }
      return cellValue
    },
    handleSizeChange (val) {
      let extSet = this.vscompt.comptAttrs.extendSetting
      extSet['pagination.currentPage'] = 1 // 返回第一页
      extSet['pageSize'] = val
      this.queryData()
    },
    handleCurrentChange (val) {
      this.vscompt.comptAttrs.extendSetting['pagination.currentPage'] = val
      this.queryData()
    },
    rowClass ({ row, rowIndex }) {
      if (row.isTotal) {
        return 'row-count'
      }
    },
    exportExcel (type) {
      if (this.pageCache.pageName == null || this.pageCache.pageName == '' || !this.pageCache.pageId) {
        this.$message.error('页面尚未保存，无法导出数据')
        return
      }
      this.setExportType(type)
      let param = {
        userId: window.sessionStorage.getItem('user_id'),
        msisdn: window.sessionStorage.getItem('user_mobile')
      }
      if (this.vscompt.comptAttrs.extendSetting.needSms == false) {
        // 不需要短信
        try {
          this.vscompt.comptAttrs.loading = true
          let afQueryBean = this.queryData({ isExport: true }).afQueryBean // 获取afQueryBean

          let param = {} // 导出请求参数
          afQueryBean.is_need_trans = 1
          afQueryBean.is_watermark = '1'
          var waterStr =
            (sessionStorage.getItem('user_id') || '') +
            '\n' +
            (sessionStorage.getItem('user_name') || '') +
            '\n' +
            (new Date().toLocaleDateString() +
              ' ' +
              new Date().toTimeString().split(' ')[0])
          afQueryBean.watermark_msg = waterStr

          param.afQueryBean = afQueryBean
          param.isEncrypt = 0 // 不需要密码this.smsId
          param.pageInfo = { pageName: this.pageCache.pageName }
          param.asynExportInfo = {
            pageId: this.pageCache.pageId,
            userId: sessionStorage.getItem('user_id'),
            exportType: this.exportType
          }
          param.exportType = this.exportType
          param.isForceSync = '1' // 强制同步

          this.exportTable(param)
            .then(response => {
              var respType = response.data.type
              if (respType.indexOf('json') >= 0) {
                // 返回为json格式
                var reader = new FileReader()
                reader.readAsText(response.data, ['utf-8'])
                reader.onload = () => {
                  var obj = JSON.parse(reader.result)
                  if (obj.respResult == '1') {
                    this.vscompt.comptAttrs.loading = false
                    this.setExportDialog(false)
                    this.setTabActive('third')
                    this.setQueryHistory(true)
                  } else {
                    this.vscompt.comptAttrs.loading = false
                    this.$message.error('导出失败：' + obj.respErrorDesc)
                  }
                }
                reader.onerror = () => {
                  this.$message.error('读取后台返回json失败')
                }
              } else {
                // 返回为stream格式
                if (response.data.size == 0) {
                  throw '获取文件为空'
                }
                var fileName = this.pageCache.pageName + '.zip'
                var blob = new Blob([response.data])
                if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                  window.navigator.msSaveOrOpenBlob(blob, fileName)
                } else {
                  var downloadElement = document.createElement('a')
                  var href = window.URL.createObjectURL(blob) // 创建下载的链接
                  downloadElement.href = href
                  downloadElement.download = fileName // 下载后文件名
                  document.body.appendChild(downloadElement)
                  downloadElement.click() // 点击下载
                  document.body.removeChild(downloadElement) // 下载完成移除元素
                  window.URL.revokeObjectURL(href) // 释放掉blob对象
                }
                this.vscompt.comptAttrs.loading = false
              }
            })
            .catch(err => {
              // this.$message.error(err);
              this.vscompt.comptAttrs.loading = false
            })
        } catch (e) {
          this.$message.error(e)
          this.vscompt.comptAttrs.loading = false
        }
      } else {
        // 需要短信
        if (param.msisdn == 'undefined') {
          this.$message.error('当前用户的手机号码为空')
          return
        }
        param.fileName = this.pageCache.pageName
        this.sendSms(param)
          .then(val => {
            if (val.status === 200 && val.data.respResult === '1') {
              var id = val.data.respData
              this.setSmsId(id)
              this.setExportDialog(true)
            } else {
              this.$message.error(val.data.respErrorDesc)
            }
          })
          .catch(err => {
            // this.$message.error("获取短信验证码异常");
          })
      }
    },
    // 合并单元格
    getMergeArr (tableData, merge) {
      if (!merge) return
      this.mergeLine = {}
      this.mergeIndex = {}
      merge.forEach((item, k) => {
        tableData.forEach((data, i) => {
          if (i === 0) {
            this.mergeIndex[item] = this.mergeIndex[item] || []
            this.mergeIndex[item].push(1)
            this.mergeLine[item] = 0
          } else {
            if (data[item] === tableData[i - 1][item]) {
              this.mergeIndex[item][this.mergeLine[item]] += 1
              this.mergeIndex[item].push(0)
            } else {
              this.mergeIndex[item].push(1)
              this.mergeLine[item] = i
            }
          }
        })
      })
      this.mergeThMethod()
    },
    mergeMethod ({ row, column, rowIndex, columnIndex }) {
      let length = 1;
      let countFn = (data = {}) => {
        if (data.children && data.children.length > 0) {
          length++
          countFn(data.children[0])
        }
        return length
      }
      let len = countFn(this.tableHeader[0]);
      this.mergeFlag = this.vscompt.comptAttrs.extendSetting.mergeSimilarCells
      if (this.vscompt.comptAttrs.extendSetting.mergeSimilarCells || this.vscompt.comptAttrs.extendSetting.subTotal) {
        if (this.vscompt.mergeList && this.polymerizeType == 1) {
          for (let merge of this.vscompt.mergeList) {
            merge = JSON.parse(merge)
            let rowspan = 1
            let colspan = 1
            let { row: r1, col: c1, rowspan: rspan, colspan: cspan } = merge
            r1 -= len
            c1 += this.vscompt.comptAttrs.extendSetting.showIndex ? 1 : 0
            if (r1 < 0) {
              continue
            }
            // 未勾选合影单元格，但有小计
            if (!this.vscompt.comptAttrs.extendSetting.mergeSimilarCells) {
              if (!['小计', '合计'].includes(row[`col${c1}`])) {
                continue
              }
            }
            if (r1 == rowIndex && c1 == columnIndex) {
              rowspan = rspan
              colspan = cspan
              return {
                rowspan: rowspan,
                colspan: colspan
              }
            } else if (rowIndex >= r1 && rowIndex < r1 + rspan && columnIndex >= c1 && columnIndex < c1 + cspan) {
              rowspan = 0
              colspan = 0
              return {
                rowspan: rowspan,
                colspan: colspan
              }
            }
          }
        }
      }
    },
    mergeThMethod () {
      let mergeFlag = this.vscompt.comptAttrs.extendSetting.mergeSimilarCells
      let newVal = this.vscompt.mergeList
      this.$nextTick(() => {
        try {
          let table = this.$refs.tableBody
          let trs = table.$el.children[1].querySelector('thead').querySelectorAll('tr')
          let offset = this.vscompt.comptAttrs.extendSetting.showIndex ? 1 : 0
          if (this.vscompt.comptAttrs.extendSetting.showIndex && trs[0].firstElementChild.innerText !== '序号') {
            offset = 0
          }
          let len = trs.length
          let mergeList = newVal || []
          for (let merge of mergeList) {
            merge = JSON.parse(merge)
            let { row, col, rowspan, colspan } = merge
            col += offset
            let [row2, col2] = [row + rowspan - 1, col + colspan - 1]
            if (row > len - 1) {
              continue
            }
            let otherCellSpan = 0
            let display = 'none'
            if (!mergeFlag || this.polymerizeType == 2) {
              otherCellSpan = 1
              colspan = 1
              rowspan = 1
              display = 'table-cell'
            }
            trs[row].querySelectorAll('th')[col].colSpan = colspan
            trs[row].querySelectorAll('th')[col].rowSpan = rowspan
            // 把剩余的隐藏
            for (let i = row; i <= row2; i++) {
              for (let j = col; j <= col2; j++) {
                if (i !== row || j !== col) {
                  trs[i].querySelectorAll('th')[j].style.display = display
                  trs[i].querySelectorAll('th')[j].colSpan = otherCellSpan
                  trs[i].querySelectorAll('th')[j].rowSpan = otherCellSpan
                }
              }
            }
          }
        } catch (e) {}
      })
    },
    indexMethod (index) {
      index += 1 // 从0开始
      let rowLength
      if (this.vscompt.comptData && this.vscompt.comptData.rows) {
        rowLength = this.vscompt.comptData.rows.length
      }
      if (this.pageCache.classTypeId == '1001002' || this.polymerizeType == 1) {
        return index
      }
      if (
        this.vscompt.comptAttrs.extendSetting.showIndex &&
        this.checkIfHasTotalRow() &&
        index == rowLength
      ) {
        return '合计'
      } else {
        let extSet = this.vscompt.comptAttrs.extendSetting
        return (
          index +
          (parseInt(extSet['pagination.currentPage']) - 1) *
            parseInt(extSet['pageSize'])
        )
      }
    },
    checkIfHasTotalRow () {
      // 检查是否有合计行
      return (
        this.checkIfNeedTotal &&
        this.vscompt.comptAttrs.extendSetting.totalRow &&
        this.vscompt.comptData.rows.length > 0
      )
    },
    dgCellClick (row, column) {
      let label = row[column.element_id]
      let drillData1 = this.vscompt.comptAttrs.drillData
      let curDrillIdx1 = this.vscompt.comptAttrs.curDrillIdx
      if (
        this.isCanDrill &&
        curDrillIdx1 < drillData1.length - 1 &&
        drillData1[curDrillIdx1].element_id == column.element_id
      ) {
        if (curDrillIdx1 == 0) {
          this.vscompt.comptAttrs.drillWBeanList = []
          this.vscompt.comptAttrs.drillWBeanList.push({
            item: objDeepCopy(drillData1[0]),
            whereBean: objDeepCopy(this.vscompt.comptAttrs.whereBean),
            label: ''
          })
        }
        this.clickCell = {
          label: label,
          value:
            row[`XXXXCODE_${column.element_id}`] == undefined
              ? label
              : row[`XXXXCODE_${column.element_id}`],
          element_id: column.element_id
        }
        this.queryData({ isDownDrill: true, label: label })
      }
      let relMainData = getFilteredData(
        this.vscompt.comptAttrs.mainLinkageData,
        'rel_element_id',
        column.element_id
      )
      let pageLinkflag = false
      if (this.isPageLinkSet) {
        let relPageData = getFilteredData(
          this.vscompt.comptAttrs.pageLinkageData,
          'rel_element_id',
          column.element_id
        )
        pageLinkflag = relPageData.length > 0
      }

      if (relMainData.length > 0 || pageLinkflag) {
        if (
          column.element_id != this.clickCell.element_id &&
          this.clickCell.element_id != ''
        ) {
          // 如果一个表格有多个字段设置联动，当前处于联动下，点击另一个联动字段，应该先重置当前联动字段的联动，然后再设置新联动条件
          this.resetLinage()
        }
        this.clickCell = {
          label: label,
          value:
            row[`XXXXCODE_${column.element_id}`] == undefined
              ? label
              : row[`XXXXCODE_${column.element_id}`],
          element_id: column.element_id
        }
        this.setLinkageCondi()
        this.linkageState = true
      }
    },
    // 若表格钻取字段不在列字段里面，则将钻取字段塞到上级字段的位置，否则就不用塞
    reGenSelectedList (selectList) {
      let curDrillIdx1 = this.vscompt.comptAttrs.curDrillIdx
      let drillWBeanList1 = this.vscompt.comptAttrs.drillWBeanList
      if (curDrillIdx1 > 0) {
        let oriDrillField = objDeepCopy(drillWBeanList1[curDrillIdx1].item) // 如果钻取字段有在selectList内，则selectList不作处理，如果没有，把上级被钻取字段替换为本级字段
        let ifFieldInSel = selectList.some(item => {
          return item.element_id == oriDrillField.element_id
        })
        if (!ifFieldInSel) {
          let firstDrillField = drillWBeanList1[0].item
          for (let index = 0; index < selectList.length; index++) {
            const element = selectList[index]
            let copyNickName = `XXXXCODE_${element.element_id}`
            if (this.polymerizeType == 1) {
              // 聚合
              copyNickName = `${element.nick_name}_drill`
            }
            if (
              element.element_id == firstDrillField.element_id &&
              element.nick_name != copyNickName
            ) {
              if (this.polymerizeType == 1) { oriDrillField['replaceFieldId'] = element.element_id } // 替换字段的elementId
              selectList[index] = objDeepCopy(oriDrillField)
            }
          }
        }
      }
      return selectList
    },
    scroll (dom) {
      dom.addEventListener('scroll', () => {
        var currentPage = this.vscompt.comptAttrs.extendSetting[ 'pagination.currentPage' ]
        // 滚动距离
        let scrollTop = dom.scrollTop
        // 变量windowHeight是可视区的高度
        let windowHeight = dom.clientHeight
        // 变量scrollHeight是滚动条的总高度
        let scrollHeight = dom.scrollHeight
        if (scrollTop + windowHeight === scrollHeight) {
          // 获取到的不是全部数据 当滚动到底部 继续获取新的数据
          currentPage = currentPage + 1
          this.$set(
            this.vscompt.comptAttrs.extendSetting,
            'pagination.currentPage',
            currentPage
          )
          const extendSetting = this.vscompt.comptAttrs.extendSetting
          let flag = false
          if (this.pageCache.classTypeId == '1001002') {
            let len = 0
            try {
              len = this.vscompt.comptData.rows.length
            } catch (e) {}
            flag = len < extendSetting['pagination.total']
          } else {
            flag = extendSetting['pagination.currentPage'] < extendSetting['pagination.total']
          }
          if (flag) {
            this.queryData()
          } else if (this.pageCache.classTypeId == '1001002') {
            currentPage = Math.ceil(extendSetting['pagination.total'] / extendSetting.pageSize) + 1
            this.$set(
              this.vscompt.comptAttrs.extendSetting,
              'pagination.currentPage',
              currentPage
            )
          }
        }
      })
    },
    tbCellClick (row, column) {
      let colIdx = parseInt(column.property.substring(3))
      let dimInfo = row[`col-${colIdx}-dimInfo`] || {}
      /**
       *dimFieldName: subCont[1],//维度字段名称
        dimCode: subCont[2],//维度对应编码
        dimValue: subCont[3],//维度对应值
        dimElementId: ""//维度字段element_id
       */

      if (dimInfo.dimValue != undefined) {
        let columnInfo = this.xAxisData.concat(this.yAxis1Data).filter(item => {
          return item.element_id == dimInfo.dimElementId
        })
        let rowInfo = {}
        rowInfo[dimInfo.dimElementId] = dimInfo.dimValue
        rowInfo['XXXXCODE_' + dimInfo.dimElementId] = dimInfo.dimCode
        this.dgCellClick(
          rowInfo,
          columnInfo[0] || {
            element_id: dimInfo.dimElementId
          }
        )
      }
    },
    tbHeaderClick (column) {
      let newCol = objDeepCopy(column)
      if (column.dimInfo != undefined) {
        let colIdx = parseInt(newCol.prop.substring(3))
        let rowInfo = {}
        rowInfo[`col-${colIdx}-dimInfo`] = newCol.dimInfo
        newCol['property'] = newCol.prop
        this.tbCellClick(rowInfo, newCol)
      }
    },
    // 处理交叉表别名、条件设置
    handleColSet (oriComptDataBak = [], newColSetting = {}) {
      if (oriComptDataBak.length == 0) return

      let oriComptData1 = objDeepCopy(oriComptDataBak);

      // 先存一份原始数据
      for (let index = 0; index < oriComptData1.length; index++) {
        let rowData1 = oriComptData1[index].data_list || [];
        for (let index2 = 0; index2 < rowData1.length; index2++) {
          let secRowData = rowData1[index2];
          secRowData["oriDataVal"] = secRowData.data_val || "";
        }
      }

      for (const key in newColSetting) {
        // 判断该字段是否在请求的selectList中，如果不在，就不进行接下来的操作（这是以防有钻取，字段替换的情况）
        let isValidField = (this.vscompt['RequestSelectList'] || []).some(
          item => {
            return item.element_id == key
          }
        );
        if (!isValidField) continue; //如果不在当前表字段中，不进行处理
        const element = newColSetting[key] || {};

        let fieldMap = this.tableFieldPosMap[key]
        if (fieldMap != undefined) {
          let { isInRow, startRowIdx, startColIdx, endRowIdx, endColIdx, cellOffset } = fieldMap;
          let colLen = 0
          let rowLen = 0
          try {
            colLen = oriComptData1[0].data_list.length - 1
            rowLen = oriComptData1.length - 1
          } catch (error) {}
          endColIdx === -9999 ? endColIdx = colLen : null
          endRowIdx === -8888 ? endRowIdx = rowLen : null

          // 改别名，处理对齐
          let align = element.align || 'center'
          if (element.oriName != element.nick_name) {
            for (let i = startRowIdx; i <= endRowIdx;) {
              for (let j = startColIdx; j <= endColIdx;) {
                oriComptData1[i].data_list[j].data_val = element.nick_name;
                oriComptData1[0].data_list[j]['align'] = align // 处理对齐
                j += cellOffset[1] + 1
              }
              i += cellOffset[0] + 1
            }
          }

          /** 对度量字段设置数据格式和条件 */
          if (fieldMap.isMeasure) {
            if (isInRow) {
              //度量在行上
              let rowIdx = startRowIdx
              while (rowIdx <= endRowIdx) {
                let rowData1 = oriComptData1[rowIdx].data_list || [];
                const colLen = rowData1.length
                let colIdx = startColIdx + 1
                while (colIdx < colLen) {
                  let cellValRes = handleTbDimCell(rowData1[colIdx].data_val || '', [])
                  rowData1[colIdx].data_val = this.dataFormatter3(
                    cellValRes.cellValue,
                    element
                  )
                  rowData1[colIdx]['propKey'] = key
                  if (element.setCondi && element.colCondiExp.length > 0) {
                    if (
                      element.colCondiExp[0].num != '' &&
                      !isNaN(parseFloat(rowData1[colIdx]['oriDataVal'])) &&
                      parseFloat(rowData1[colIdx]['oriDataVal']) >=
                        parseFloat(element.colCondiExp[0].num)
                    ) {
                      rowData1[colIdx]["condiSetSymbol"] = 0;
                      rowData1[colIdx]["condiSetStyle"] = objDeepCopy(
                        {
                          ...element.colCondiExp[0],
                          setCondi: element.setCondi
                        }
                      );
                    } else if (
                      element.colCondiExp[1].num != '' &&
                      !isNaN(parseFloat(rowData1[colIdx]['oriDataVal'])) &&
                      parseFloat(rowData1[colIdx]['oriDataVal']) <
                        parseFloat(element.colCondiExp[1].num)
                    ) {
                      rowData1[colIdx]["condiSetSymbol"] = 1;
                      rowData1[colIdx]["condiSetStyle"] = objDeepCopy(
                        {
                          ...element.colCondiExp[1],
                          setCondi: element.setCondi
                        }
                      );
                    } else {
                      rowData1[colIdx]['condiSetSymbol'] = -1 // 单元格条件在第几区间 -1就不进行设置，0在条件1，1在条件2
                    }
                  } else {
                    rowData1[colIdx]['condiSetSymbol'] = -1
                  }
                  colIdx += cellOffset[1] + 1
                }
                rowIdx += cellOffset[0] + 1;
              }
            } else {
              //度量在列上
              let rowStart = startRowIdx + 1;
              let rowEnd = oriComptData1.length
              while (rowStart < rowEnd) {
                let rowData1 = oriComptData1[rowStart].data_list || [];
                let colIdx = startColIdx;
                while (colIdx <= endColIdx) {
                  let cellValRes = handleTbDimCell(rowData1[colIdx].data_val || "", []);
                  rowData1[colIdx].data_val = this.dataFormatter3(
                    cellValRes.cellValue,
                    element
                  )
                  rowData1[colIdx]['propKey'] = key
                  if (element.setCondi && element.colCondiExp.length > 0) {
                    if (
                      element.colCondiExp[0].num != '' &&
                      !isNaN(parseFloat(rowData1[colIdx]['oriDataVal'])) &&
                      parseFloat(rowData1[colIdx]['oriDataVal']) >=
                        parseFloat(element.colCondiExp[0].num)
                    ) {
                      rowData1[colIdx]["condiSetSymbol"] = 0;
                      rowData1[colIdx]["condiSetStyle"] = objDeepCopy(
                        {
                          ...element.colCondiExp[0],
                          setCondi: element.setCondi
                        }
                      );
                    } else if (
                      element.colCondiExp[1].num != '' &&
                      !isNaN(parseFloat(rowData1[colIdx]['oriDataVal'])) &&
                      parseFloat(rowData1[colIdx]['oriDataVal']) <
                        parseFloat(element.colCondiExp[1].num)
                    ) {
                      rowData1[colIdx]["condiSetSymbol"] = 1;
                      rowData1[colIdx]["condiSetStyle"] = objDeepCopy(
                        {
                          ...element.colCondiExp[1],
                          setCondi: element.setCondi
                        }
                      );
                    } else {
                      rowData1[colIdx]['condiSetSymbol'] = -1 // 单元格条件在第几区间 -1就不进行设置，0在条件1，1在条件2
                    }
                  } else {
                    rowData1[colIdx]['condiSetSymbol'] = -1
                  }
                  colIdx += cellOffset[1] + 1;
                }
                rowStart += cellOffset[0] + 1
              }
            }
          }
          /** 对度量字段设置数据格式和条件 */
        }
      }
      this.vscompt['oriComptData'] = oriComptData1
    },
    // 表格行样式设置
    datagridRowStyle ({ row, rowIndex }) {
      // 针对大屏表格
      let rowStyle = {}
      if (this.pageCache.classTypeId == '1005') {
        let bgClor = this.pageCache.bgClor || ''
        if (
          this.pageCache.operation == 'design' ||
          this.pageCache.operation == 'applyTemplate'
        ) { bgClor = this.nowPage.bgClor || '' }
        rowStyle = {
          'background-color': bgClor
        }
      }
      return rowStyle
    },
    qdCondiStyle(col, scope, i) {
      let res = {}
      let newColSetting = this.newColSetting
      let colCondiExp = newColSetting[col.prop].colCondiExp || []
      let val = parseFloat(this.dataFormatter2(scope.row, i))
      if (newColSetting && newColSetting[col.prop] && newColSetting[col.prop].setCondi === 'showNum' && colCondiExp.length > 1) {
        let index = -1
        if (colCondiExp.length > 0 && val >= parseFloat(colCondiExp[0].num)) {
          index = 0
        } else if (colCondiExp.length > 1 && val < parseFloat(colCondiExp[1].num)) {
          index = 1
        }
        if (index > -1) {
          res = {
            'font-size': colCondiExp[index].fontSize + 'px',
            color: colCondiExp[index].iconColor
          }
        }
      }
      return res
    },
    showIcon(item) {
      let obj = {
        type: '',
        clazz: '',
        style: ''
      }
      try {
        const {column, row} = item
        const condi = row[`${column.property}-condi`]
        if (condi.condiSetSymbol != -1 && condi.condiSetStyle.setCondi !== undefined) {
          const style = {
            'font-size': (condi.condiSetStyle.fontSize || '') + 'px',
            color: condi.condiSetStyle.iconColor || ''
          }
          const setCondi = condi.condiSetStyle.setCondi
          setCondi === 'showIcon' ? 'icon' : (setCondi === 'showNum' ? 'num' : '')
          obj = {
            type: setCondi,
            clazz: ['dg-icon',condi.condiSetStyle.icon || ''],
            style
          }
        }
      } catch (error) {}
      return obj
    }
  }
}
</script>

<style lang="scss" scoped>
.table-tool-icon {
  text-align: right;
  height: 30px;
  line-height: 30px;
}

.icon-block {
  color: #409eff;
  cursor: pointer;
  margin-left: 18px;
  display: inline-block;

  &:hover {
    color: #66b1ff;

    span {
      color: #66b1ff;
    }
  }

  span {
    color: #666;
    padding-left: 5px;
    display: inline-block;
    cursor: pointer;
  }
}

.tab-block {
  width: 33px;
  text-align: left;
  border-right: 1px solid #c0c4cc;
  display: inline-block;
  height: 16px;
  position: relative;
  top: 2px;

  i {
    float: left;
    margin-top: 1px;
    cursor: pointer;
    color: #409eff;

    &:hover {
      color: #66b1ff;
    }
  }
}

.normal-table {
  height: 100%;
}

.export-table {
  height: 100%;
  margin-top: -30px;
  padding-top: 30px;

  .el-table {
    /deep/ .row-count {
      font-weight: bold;
    }
  }
}

.pagination {
  width: 100%;
  text-align: right;
  margin-top: 10px;

  &.pagination-wrap {
    // display: inline-block;
    position: absolute;
    bottom: 0;
    display: inline-flex;
    float: right;
  }

  .total-page-wrap {
    flex: 1;
    white-space: nowrap;
    padding: 2px 5px;
    color: #303133;
    font-weight: bold;

    .count-notice {
      float: left;
    }

    & > span {
      margin-right: 10px;
      font-weight: normal;
      color: #606266;
      height: 28px;
      line-height: 28px;
    }
  }

  .tips-wrap {
    float: left;
    margin-right: 10px;
    height: 28px;
    line-height: 28px;
    color: #606266;
    font-weight: bold;
    padding: 2px 5px;
  }
}

.drill-label {
  position: absolute;
  left: 5px;
  bottom: 3px;
  cursor: pointer;
  z-index: 100;

  .drill-icon {
    font-size: 12px;
    vertical-align: -1px;
  }

  &:hover {
    color: #409cfb;
  }
}

.link-reset {
  left: 5px;
  bottom: 2px;
}

.default-datagrid {
  /deep/ .el-table td {
    border-right: 1px solid #ebeef5;
  }
}

.noborder-datagrid {
  /deep/ .el-table td {
    border-bottom: none;
    // border-right: 1px solid #ebeef5;
  }

  /deep/ .el-table thead th.is-leaf,
  /deep/ .el-table .el-table__header-wrapper {
    border-bottom: none;
  }
}

.innerborder-datagrid {
  /deep/ .el-table td {
    // border-right: 1px solid #ebeef5;
  }
}

.el-table {
  /deep/.el-table__header-wrapper {
    border-bottom: 2px solid #409eff;
  }
  /deep/ .row-count {
    font-weight: bold;
  }
  /deep/ th {
    color: #303133;
    div {
      width: 100%;
    }
    .cell {
      color: inherit;
    }
    &.is-leaf {
      border-bottom: none;
    }
  }
}
.mobile_datagrid-wrap {
  // height: calc(100% - 30px);
  height: 100%;
}
.datagrid-wrap {
  height: calc(100% - 70px);
  overflow: auto;
  &.polymer-wrap {
    //聚合表没有分页
    height: calc(100% - 20px);
  }

  /deep/ .el-table::before {
    height: 0px;
  }

  /deep/ .el-table td {
    cursor: pointer;
  }
}

/deep/ .el-pager li {
  background: transparent;
}

/deep/ .el-pagination button:disabled {
  background: transparent;
}

/deep/ .el-pagination .btn-prev,
/deep/ .el-pagination .btn-next {
  background: transparent;
}
/deep/.mobile.el-table--mini th,
/deep/.mobile.el-table--mini td {
  padding: 4px 0 !important;
}
/deep/.mobile .el-table--group::after,
.el-table--border::after {
  width: 0px;
}
/*大屏表格样式修改*/
/deep/.bigScreen_datagrid-wrap {
  .pagination .total-page-wrap {
    color: #4385fb;
    span {
      color: #4385fb;
      font-size: 18px;
    }
  }
  /deep/.el-pagination {
    color: #4385fb;
    button {
      font-size: 18px;
      color: #4385fb;
      i {
        font-size: 18px;
      }
      &:disabled {
        color: #666;
        &:hover {
          color: #666;
        }
      }
      &:hover {
        color: #b8f400;
      }
    }

    .el-pager li {
      font-size: 18px;
      color: #4385fb;
      &.active,
      &:hover {
        color: #b8f400;
      }
    }
    .el-pagination__jump {
      color: #4385fb;
      font-size: 18px;
      .el-input__inner {
        background-color: transparent;
        color: #b8f400;
        border-color: #004ea2;
        &:hover,
        &:focus {
          border-color: #b8f400;
        }
      }
    }
  }
}
/deep/.bigScreen.el-table {
  border: none;
  background-color: transparent;
  font-size: 14px;
  th div {
    font-size: 16px;
    width: 100%;
  }
  thead tr,
  thead th {
    background-color: #002d63;
    border-bottom: none;
    color: #fff;
  }

  tr {
    height: 36px;
    line-height: 36px;
    td {
      color: #abdfff;
      border-bottom: 1px dashed #004ea2;
      border-right: none;
    }
    &:last-child td {
      border-bottom: none;
    }
    &:hover > td,
    &.hover-row > td {
      background-color: transparent;
    }
  }
  th {
    border-right: none;
    & > .cell {
      color: inherit;
    }
  }
  .el-table__fixed::before,
  .el-table__fixed-right::before {
    background-color: transparent;
  }
}

// 钻取文字部分样式
.drill-label1 {
    position: absolute;
    left: 5px;
    bottom: 3px;
    z-index: 100;

    .drill-icon {
      font-size: 12px;
      vertical-align: -1px;
    }

    .sub-drill-label {
      cursor: pointer;
      display: inline-block;
      padding-left: 5px;
      &:hover {
        color: #409cfb;
      }
    }
  }

  /deep/.el-table thead th {
    padding: 0;
    .cell{
        line-height: normal;
        div{
            line-height: inherit;
        }
    }
  }
/*大屏表格样式修改*/
</style>
<style>
/* 聚合多表头 */
.polymer-wrap .el-table th div {
  width: 100%;
}
.polymer-wrap .el-table th > div > div {
  padding: 0px;
}
</style>
