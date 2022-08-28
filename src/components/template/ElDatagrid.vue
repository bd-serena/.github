<template>
  <div style="height:100%;position:relative;">
    <div
      class="table-tool-icon"
      style="margin-right: 20px;"
      v-if="pageCache.classTypeId== '1001001'"
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

    <div
      ref="table"
      :class="[vscompt.comptAttrs.extendSetting.tableTheme+'-datagrid',pageCache.classTypeId === '1001002'? 'mobile_datagrid-wrap':'datagrid-wrap',pageCache.classTypeId === '1005'? 'bigScreen_datagrid-wrap':'']"
    >
      <el-table
        size="mini"
        :height="vscompt.comptAttrs.extendSetting.frozen?'100%':null"
        :border="vscompt.comptAttrs.extendSetting.tableTheme=='default'?true:false"
        :data="tableData"
        :row-class-name="rowClass"
        :span-method="mergeMethod"
        ref="tableBody"
        :class="[pageCache.classTypeId === '1001002'? 'mobile':'',pageCache.classTypeId === '1005'? 'bigScreen':'']"
        :style="tableStyle"
        :width="vscompt.comptAttrs.extendSetting.frozen?'100%':'100%'"
        :row-style="datagridRowStyle"
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
                v-show="newColSetting && newColSetting[col.prop] && newColSetting[col.prop].setCondi && newColSetting[col.prop].colCondiExp.length>0"
                v-if="newColSetting[col.prop].colCondiExp.length>0 && parseFloat(dataFormatter2(scope.row,i))>=parseFloat(newColSetting[col.prop].colCondiExp[0].num)"
                :class="['dg-icon',newColSetting[col.prop].colCondiExp[0].icon]"
                :style="{
                  'font-size': newColSetting[col.prop].colCondiExp[0].fontSize + 'px',
                  color: newColSetting[col.prop].colCondiExp[0].iconColor
                }"
              ></i>
              <i
                v-show="newColSetting && newColSetting[col.prop] && newColSetting[col.prop].setCondi && newColSetting[col.prop].colCondiExp.length>1"
                v-else-if="newColSetting[col.prop].colCondiExp.length>1 && parseFloat(dataFormatter2(scope.row,i))<parseFloat(newColSetting[col.prop].colCondiExp[1].num)"
                :class="['dg-icon',newColSetting[col.prop].colCondiExp[1].icon]"
                :style="{
                  'font-size': newColSetting[col.prop].colCondiExp[1].fontSize + 'px',
                  color: newColSetting[col.prop].colCondiExp[1].iconColor
                }"
              ></i>
              <span>{{dataFormatter2(scope.row,i)}}</span>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div
        v-if="vscompt.comptAttrs.extendSetting['pagination.show']&&pageCache.classTypeId!== '1001002'&&pageCache.classTypeId!= '1005'"
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
    <div class="drill-label1" v-show="vscompt.comptAttrs['curDrillIdx']||0 > 0">
      <!-- {{vscompt.comptAttrs['drillWBeanList'] !== undefined && vscompt.comptAttrs['drillWBeanList'].length>0 && vscompt.comptAttrs['curDrillIdx']||0 >
      0?vscompt.comptAttrs['drillWBeanList'][vscompt.comptAttrs['curDrillIdx']||0].label:""}}
      <span
        v-show="vscompt.comptAttrs['drillWBeanList'].length>0&&vscompt.comptAttrs['curDrillIdx']||0>0"
        class="drill-icon icon-A10018_doubleArrowLeft"
      ></span> -->
      <div v-for="(drill, index) in vscompt.comptAttrs['drillWBeanList']"
        :id="index"
        :key="index"
        v-show="index>0"
        class="sub-drill-label"
        @click="toDrillData(index)">
      {{vscompt.comptAttrs['drillWBeanList'] !== undefined && vscompt.comptAttrs['drillWBeanList'].length>0 && vscompt.comptAttrs['curDrillIdx']||0 >
      0?vscompt.comptAttrs['drillWBeanList'][index].label:""}}
      <span
        v-show="vscompt.comptAttrs['drillWBeanList'].length>0&&vscompt.comptAttrs['curDrillIdx']||0>0&&vscompt.comptAttrs['drillWBeanList'][index].label!=''"
        class="drill-icon icon-A10018_doubleArrowLeft"
      ></span>
      </div>
    </div>
    <div
      class="drill-label link-reset"
      v-show="linkageState && vscompt.comptAttrs['mainLinkageData'] !== undefined && vscompt.comptAttrs['mainLinkageData'].length>0"
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
  dataInterval,
  loadDataDone,
  loadDataError
} from '../../utils/comonFunc.js'

import ExportForm from '../design/ExportForm.vue'
import DomSize from '../../utils/domSize.js'
import QueryHisDialog from '../design/QueryHistory.vue'
import eventBus from '../../plugins/transData.js'

export default {
  props: ['vscompt'],
  components: {
    ExportForm,
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
      isPlay: false,
      restoreData: false,
      autoPlay: 0,
      playDataLength: 0,
      tableHeight: 0,
      playTimeOut: 0
    }
  },
  mounted () {
    let _this = this
    if (this.vscompt.afId === '' && this.vscompt.comptData === undefined) {
      this.$set(this.vscompt, 'comptData', {
        rows: [],
        columns: []
      })
    }

    if (this.pageCache.classTypeId === '1001002') {
      this.scroll(this.$refs.tableBody.$el.children[2])
      this.scroll(this.$refs.table.children[0])
    }

    this.tableHeight = this.$refs.table.offsetHeight
    DomSize.bind(this.$refs.table, function () {
      _this.tableHeight = parseInt(this.style.height)
    })
    // 分析报告设置表格导出是否需要短信验证默认值
    if (this.pageCache.classTypeId === '1001001' && this.vscompt.comptAttrs.extendSetting.needSms === '' || this.vscompt.comptAttrs.extendSetting.needSms === undefined) {
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
    eventBus.$on('doTableLayout', this.doTableLayout)
  },
  computed: {
    originalData () {
      return (this.vscompt.comptData || {}).rows || []
    },
    tableData () {
      let tableData
      if (this.isPlay && !this.restoreData) {
        tableData = [...this.originalData, ...this.originalData.slice(0, this.playDataLength)]
      } else {
        tableData = [...this.originalData]
      }
      return tableData
    },
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
      needSms: state => state.commonProperties.needSms
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
        result =
          constructList(this.vscompt.comptAttrs.yAxis1Data, this.datasetMap, this.vscompt.comptAttrs.computedData || [])
            .resultList || []
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
      if (this.pageCache.classTypeId === '1001002') { // 手机端
        let len = 0
        try {
          len = this.vscompt.comptData.rows.length
        } catch (e) {}
        return (
          extSet['pagination.total'] - len <= 0 &&
          this.vscompt.comptAttrs.polymerizeType === 2
        )
      }
      return (
        Math.ceil(extSet['pagination.total'] / extSet.pageSize) ==
          extSet['pagination.currentPage'] &&
        this.vscompt.comptAttrs.polymerizeType === 2
      )
    },
    tableCols () {
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
          if (element.prop.indexOf('XXXXCODE_') < 0 && colSet[element.prop]) {
            let newCol = {
              ...element,
              ...objDeepCopy(colSet[element.prop] || {})
            }
            newCol['label'] =
              colSet[element.prop] !== undefined
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
        if (element.prop !== element.label) arr.push(oriCols[index].prop)
      }
      return arr
    },
    tableStyle () {
      return this.vscompt.comptAttrs.extendSetting.frozen
        ? {}
        : {
          overflow: 'scroll',
          height: '100%'
        }
    },
    isPageLinkSet () {
      return (
        this.vscompt.comptAttrs['pageLinkageData'] !== undefined &&
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
    headerStyle (){
      let header = this.vscompt.comptAttrs.extendSetting.headerHeight || 35;
      this.$nextTick(()=>{
        this.doTableLayout();
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
        if (this.vscompt.comptAttrs.curDrillIdx === undefined) {
          this.$set(this.vscompt.comptAttrs, 'curDrillIdx', 0)
          this.$set(this.vscompt.comptAttrs, 'drillWBeanList', [])
        }
        if (this.vscompt.comptData === undefined) {
          this.$set(this.vscompt, 'comptData', {
            columns: [],
            rows: []
          })
          this.$set(this.vscompt.comptAttrs, 'isNeedRestDrill', 0)
        }
        if (
          newVal &&
          this.vscompt.afId !== '' &&
          this.vscompt.comptData.columns.length === 0
        ) {
          if (this.linkStack.length > 0 && this.vscompt.comptAttrs.isLinkage) {
            let param = []
            for (let item of this.linkStack) {
              if (item.comptId === this.vscompt.comptId) {
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

        if (this.pageCache.operation === 'preview') { // 数据刷新
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
        if (newVal && this.checkIfNeedTotal) {
          this.queryData()
        }
        if (!newVal) {
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
        this.vscompt.comptData.rows = this.vscompt.comptData.rows.filter(item => item !== null)
        this.getMergeArr(this.vscompt.comptData.rows, this.merge)
      }
    },
    'vscompt.comptAttrs.extendSetting.showIndex': {
      deep: true,
      handler (newVal, oldVal) {
        // 合计完 选中展示序号，把第一列的值回填进去
        let comptData1 = this.vscompt.comptData
        if (
          newVal &&
          this.dataLength > 0 &&
          this.checkIfHasTotalRow() &&
          comptData1.rows[this.dataLength - 1].isTotal !== undefined
        ) {
          comptData1.rows[this.dataLength - 1][comptData1.columns[0].prop] = this.firColVal
        }
        // 先选中，再勾掉
        if (oldVal) {
          comptData1.rows[this.dataLength - 1][comptData1.columns[0].prop] =
            '合计'
        }
      }
    },
    'vscompt.comptData.rows': {
      deep: true,
      handler (newVal, oldVal) {
        if (newVal !== undefined && newVal.length > 0) {
          newVal = newVal.filter(item => item !== null)
          this.getMergeArr(newVal, this.merge)
        }
      }
    },
    'vscompt.comptAttrs.extendSetting.frozen': {
      handler (newVal, oldVal) {
        var flag = this.vscompt.comptAttrs.extendSetting['frozen']
        if (flag) {
          document.getElementsByClassName(
            'el-table__header-wrapper'
          )[0].style.display = 'block'
          document.getElementsByClassName(
            'el-table__body-wrapper'
          )[0].style.display = 'block'
        } else {
          document.getElementsByClassName(
            'el-table__header-wrapper'
          )[0].style.display = 'table'
          document.getElementsByClassName(
            'el-table__body-wrapper'
          )[0].style.display = 'table'
        }
      }
    },
    originalData: {
      handler (newData, oldData) {
        if (newData.length > 0) {
          this.tableAutoPlay()
        }
      }
    },
    tableHeight: {
      handler (newData, oldData) {
        if (this.originalData.length > 0) {
          this.tableAutoPlay()
        }
      }
    },
    'vscompt.comptAttrs.extendSetting.duration': {
      handler (newData, oldData) {
        if (this.originalData.length > 0) {
          this.tableAutoPlay()
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
      if (param !== undefined && param.isUpDrill) {
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
      } else if (param !== undefined && param.isDownDrill) {
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
            this.drillData[curDrillIdx]
          ),
          whereBean: objDeepCopy(whereBean),
          label: param.label,
          value: dim_value
        })
      } else {
        // 如果当前处在钻取条件下，去点页码，要把条件继续带下来查
        // if (this.vscompt.comptAttrs.curDrillIdx > 0) {
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
        this.vscompt.comptAttrs['linkageCondi'] !== undefined &&
        this.vscompt.comptAttrs['linkageCondi'].length > 0
      ) {
        whereBean = genWhereBean(
          this.vscompt.comptAttrs['linkageCondi'],
          objDeepCopy(whereBean)
        )
      }

      // 如果当前处在钻取条件下，去点页码，要把条件继续带下来查
      // if (this.vscompt.comptAttrs.curDrillIdx > 0) {
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
      selectList = this.reGenSelectedList(selectList)
      let flag = false
      if (param !== undefined && param.isExport !== undefined) { flag = param.isExport }
      selectList = this.getSelectList(selectList, flag)
      if (selectList.length === 0) {
        this.vscompt.comptAttrs.loading = false
        return
      }

      selectList = objDeepCopy(selectList)
      if (this.vscompt.comptAttrs.polymerizeType === 2) {
        // 清单
        for (let index = 0; index < selectList.length; index++) {
          const element = selectList[index]
          if (element.element_type === "2") {
            selectList[index].fun_type = ''
          }
        }
      } else {
        // 聚合
        let dgColSetting = this.vscompt.comptAttrs.colSetting
        for (let index = 0; index < selectList.length; index++) {
          const element = selectList[index]
          if (element.element_type === "2") {
            let polymerFunType = dgColSetting[element.element_id].polymerFunType
            selectList[index].fun_type = polymerFunType === 0 ? 0 : (polymerFunType || 2)
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
        param !== undefined &&
        param.isExport !== undefined &&
        param.isExport === true
      ) {
        return params
      }
      this.executeReqest(params)
    },
    executeReqest (params, queryTotal) {
      if (params.afQueryBean.select_list.length === 0) {
        this.vscompt.comptAttrs.loading = false
        return
      }
      // 补上其他页面的联动设置 在预览页面才要考虑传递公共参数和页面参数
      if (this.pageCache.operation === 'preview') {
        params = addPageCondis({
          vscompt: this.vscompt,
          params: params,
          datasetMap: this.datasetMap,
          pageParams: this.getPageParams,
          queryCompts: this.getQueryCompts(),
          pageId: this.pageCache.pageId
        })
      }
      // queryTotal---true--查询合计信息
      let selList = objDeepCopy(params.afQueryBean.select_list)
      selList = selList.filter((item, i) => {
        return item.element_type === "2"
      })
      let colFormatSet = {} // 存储总计的格式化设置
      if (queryTotal) {
        // 查询总计信息
        if (selList.length === 0) {
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
            if (element.fun_type === 1) {
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
      if (this.pageCache.classTypeId === '1005') {
        params.afQueryBean.head_bean.pageCount = this.vscompt.comptAttrs.extendSetting.pageSize
      }
      let computedData = this.vscompt.comptAttrs.computedData || []
      this.queryComptData({ params, computedData })
        .then(function (response) {
          if (response.data.respResult === '1') {
            let comptData = response.data.respData
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
                    colFormatSet[prop1].dot > 0 && colVal !== parseInt(colVal)
                      ? parseFloat(colVal).toFixed(colFormatSet[prop1].dot)
                      : colVal // 带小数点保留2位小数
                  if (index === 0) {
                    _this.firColVal = rowData[prop1] // 存储第一列的值
                  }
                } else {
                  rowData[prop1] = ''
                }
                if (
                  index === 0 &&
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
                  if (allColumns[inx].element_id === _this.drillData[0].element_id) {
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
                  if (col1.element_id === comptData.columns[index].prop) {
                    comptData.columns[index] = {
                      ...objDeepCopy(col1),
                      ...objDeepCopy(comptData.columns[index])
                    }
                    break
                  }
                }
              }

              if (_this.pageCache.classTypeId === '1001002') {
                // 手机
                if ((_this.vscompt.comptData.rows || []).length !== 0) {
                  var temp = _this.vscompt.comptData.rows || []
                  if (params.afQueryBean.head_bean.start !== 1) {
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
                _this.vscompt.comptData = {
                  columns: comptData.columns || [],
                  rows: comptData.data || []
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
        return item.element_id === this.clickCell.element_id
      })
      if (
        field1.length > 0 &&
        field1[0].dim_level_id !== undefined &&
        field1[0].dim_level_id !== null &&
        field1[0].dim_level_id !== ''
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
      let selectList = this.getSelectList(this.xAxisData)
      // 还要判断当前是否在钻取状态，如果在钻取状态，钻取条件不能丢
      if (this.vscompt.comptAttrs.drillWBeanList.length > 1) {
        // let drillWhereBean1 = objDeepCopy(
        //   this.vscompt.comptAttrs.drillWBeanList[
        //     this.vscompt.comptAttrs.curDrillIdx
        //   ].whereBean.rule_list[0]
        // );
        // if (
        //   drillWhereBean1 !== undefined &&
        //   drillWhereBean1["exp_id"] !== undefined
        // ) {
        //   drillWhereBean1["exp_id"] = "";
        //   whereBean = genWhereBean(
        //     [drillWhereBean1],
        //     objDeepCopy(whereBean),
        //     true
        //   );
        // }
        let wbRuleList = objDeepCopy(this.vscompt.comptAttrs.drillWBeanList[this.vscompt.comptAttrs.curDrillIdx].whereBean.rule_list) || []
        let drillWBRule = wbRuleList.filter(item => {
          return item.exp_id.indexOf('drill_exp') > -1
        })
        whereBean = genWhereBean(drillWBRule, objDeepCopy(whereBean), true)
        selectList = this.reGenSelectedList(selectList)
        selectList = this.getSelectList(selectList)
      }
      let orderList = getOrderList(selectList)
      let extSetting = this.vscompt.comptAttrs.extendSetting
      extSetting['pagination.currentPage'] = 1
      if (this.vscompt.comptAttrs.polymerizeType === 2) {
        // 清单
        selectList = objDeepCopy(selectList)
        for (let index = 0; index < selectList.length; index++) {
          const element = selectList[index]
          if (element.element_type === "2") {
            selectList[index].fun_type = ''
          }
        }
      } else {
        // 聚合 把聚合函数带进去
        selectList = objDeepCopy(selectList)
        let colSetting = this.vscompt.comptAttrs.colSetting
        for (let index = 0; index < selectList.length; index++) {
          const element = selectList[index]
          if (element.element_type === "2") {
            selectList[index].fun_type =
              colSetting[element.element_id].polymerFunType || 2
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
      let selectList = xAxisData.concat(
        this.yAxis1Data.concat(this.yAxis2Data)
      )
      if (!isExport) {
        for (let index = 0; index < selectList.length; index++) {
          const element = selectList[index]
          if (element.dim_id !== '' && element.dim_id !== null) {
            let colItem = objDeepCopy(element)
            colItem.dim_id = ''
            colItem.dim_level_id = ''
            colItem['is_translate'] = 0
            colItem.nick_name = 'XXXXCODE_' + colItem.element_id
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
    dataFormatter2 (rowData, index) {
      let prop = (this.vscompt.comptData || {}).columns[index]['prop']
      let cellValue = rowData[prop]
      let col = this.vscompt.comptAttrs.colSetting[prop]
      if (cellValue !== '总计') {
        if (col.numType === 1) {
          cellValue = parseFloat(cellValue).toFixed(col.dot)
        } else if (col.numType === 2) {
          let dot = parseInt(col.dot + '' || '0')
          cellValue = parseFloat(parseFloat((cellValue + '').replace(/%/gi, '')) * 100).toFixed(dot) +
            '%'
        }
      }
      // 为空或者为NaN时候设置 -
      if (cellValue.indexOf('NaN') > -1 || cellValue === '') {
        cellValue = '-'
      }
      return cellValue
    },
    dateFtt (fmt, date) {
      let oldDate = date
      date = new Date(date)
      var o = {
        mm: date.getMonth() + 1, // 月份
        'd+': date.getDate(), // 日
        'h+': date.getHours(), // 小时
        mi: date.getMinutes(), // 分
        's+': date.getSeconds(), // 秒
        'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
        S: date.getMilliseconds() // 毫秒
      }
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(
          RegExp.$1,
          (date.getFullYear() + '').substr(4 - RegExp.$1.length)
        )
      }
      for (var k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
          fmt = fmt.replace(
            RegExp.$1,
            RegExp.$1.length === 1
              ? o[k]
              : ('00' + o[k]).substr(('' + o[k]).length)
          )
        }
      }
      if (fmt.search(/NaN/gi) > -1) {
        return oldDate
      }
      return fmt
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
      if (this.pageCache.pageName === null || this.pageCache.pageName === '') {
        this.$message.error('页面尚未保存，无法导出数据')
        return
      }
      this.setExportType(type)
      var param = {
        userId: window.sessionStorage.getItem('user_id'),
        msisdn: window.sessionStorage.getItem('user_mobile')
      }
      if (this.vscompt.comptAttrs.extendSetting.needSms === false) {
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
                  if (obj.respResult === '1') {
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
                if (response.data.size === 0) {
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
        if (param.msisdn === 'undefined') {
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
          if (data) {
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
          }
        })
      })
    },
    queryHistory () {
      this.setTabActive('first')
      this.setQueryHistory(true)
    },
    mergeMethod ({ row, column, rowIndex, columnIndex }) {
      if (this.vscompt.comptAttrs.extendSetting.mergeSimilarCells) {
        const index = this.merge.indexOf(column.property)
        if (index > -1) {
          if (this.mergeIndex === undefined || Object.keys(this.mergeIndex).length === 0) {
            this.vscompt.comptData.rows = this.vscompt.comptData.rows.filter(item => item !== null)
            this.getMergeArr(this.vscompt.comptData.rows, this.merge)
          }
          const _row = this.mergeIndex[this.merge[index]][rowIndex]
          const _col = _row > 0 ? 1 : 0
          return {
            rowspan: _row,
            colspan: _col
          }
        }
      }
    },
    indexMethod (index) {
      index += 1 // 从0开始
      let rowLength = this.vscompt.comptData.rows.length
      if (this.pageCache.classTypeId === '1001002') {
        return index
      }
      if (this.pageCache.classTypeId === '1005') {
        if (index > rowLength) {
          index -= rowLength
          return index
        }
      }
      if (
        this.vscompt.comptAttrs.extendSetting.showIndex &&
        this.checkIfHasTotalRow() &&
        index === rowLength
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
        drillData1[curDrillIdx1].element_id === column.element_id
      ) {
        if (curDrillIdx1 === 0) {
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
            row[`XXXXCODE_${column.element_id}`] === undefined
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
          column.element_id !== this.clickCell.element_id &&
          this.clickCell.element_id !== ''
        ) {
          // 如果一个表格有多个字段设置联动，当前处于联动下，点击另一个联动字段，应该先重置当前联动字段的联动，然后再设置新联动条件
          this.resetLinage()
        }
        this.clickCell = {
          label: label,
          value:
            row[`XXXXCODE_${column.element_id}`] === undefined
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
          return item.element_id === oriDrillField.element_id
        })
        if (!ifFieldInSel) {
          let firstDrillField = drillWBeanList1[0].item
          for (let index = 0; index < selectList.length; index++) {
            const element = selectList[index]
            if (
              element.element_id === firstDrillField.element_id &&
              element.nick_name !== `XXXXCODE_${element.element_id}`
            ) {
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
          this.$set(this.vscompt.comptAttrs.extendSetting, 'pagination.currentPage', currentPage)
          const extendSetting = this.vscompt.comptAttrs.extendSetting
          let flag = false
          if (this.pageCache.classTypeId === '1001002') {
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
          } else if (this.pageCache.classTypeId === '1001002') {
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
    // 表格行样式设置
    datagridRowStyle ({ row, rowIndex }) {
      // 针对大屏表格
      let rowStyle = {}
      if (this.pageCache.classTypeId === '1005') {
        let bgClor = this.pageCache.bgClor || ''
        if (
          this.pageCache.operation === 'design' ||
          this.pageCache.operation === 'applyTemplate'
        ) { bgClor = this.nowPage.bgClor || '' }
        rowStyle = {
          'background-color': bgClor
        }
      }
      return rowStyle
    },
    tableAutoPlay () { // 表格自动播放
      if (this.pageCache.classTypeId === '1005') {
        let _this = this
        this.$nextTick(() => {
          let tablePlay = _this.$refs.tableBody.$el
          let tableHeader = tablePlay.getElementsByClassName('el-table__header-wrapper')[0]
          let tableWrapper = tablePlay.getElementsByClassName('el-table__body-wrapper')[0]
          let tableBody = tablePlay.getElementsByClassName('el-table__body')[0]
          let tableTr = tableBody.getElementsByTagName('tr')[0]
          let tableBodyHeight = tablePlay.offsetHeight - tableHeader.offsetHeight
          let rowHeight = tableTr.offsetHeight
          let y = 0

          clearInterval(_this.autoPlay)
          clearTimeout(_this.playTimeOut)
          tableBody.style.transform = 'translate3d(0px, 0px, 0px)'

          _this.playDataLength = Math.floor(tableBodyHeight / rowHeight)
          _this.isPlay = _this.playDataLength < _this.originalData.length

          if (_this.isPlay) {
            _this.restoreData = false
            _this.autoPlay = setInterval(function () {
              tableBody.style.transitionDuration = '300ms'
              tableBody.style.transform = 'translate3d(0px, ' + y + 'px, 0px)'
              y -= rowHeight
              if (y === -(_this.vscompt.comptAttrs.extendSetting.pageSize + 1) * rowHeight) {
                _this.playTimeOut = setTimeout(function () {
                  tableBody.style.transitionDuration = '0ms'
                  tableBody.style.transform = 'translate3d(0px, 0px, 0px)'
                  y = -rowHeight
                }, 200)
              }
            }, _this.vscompt.comptAttrs.extendSetting.duration * 1000)
          } else {
            _this.restoreData = true
          }

          tablePlay.onmouseenter = () => {
            if (_this.autoPlay && _this.isPlay) {
              clearInterval(_this.autoPlay)
              clearTimeout(_this.playTimeOut)
            }
            // _this.restoreData = true;
          }

          tablePlay.onmouseleave = () => {
            // _this.restoreData = false;
            if (_this.isPlay) {
              _this.autoPlay = setInterval(function () {
                tableBody.style.transitionDuration = '300ms'
                tableBody.style.transform = 'translate3d(0px, ' + y + 'px, 0px)'
                y -= rowHeight
                if (y === -(_this.vscompt.comptAttrs.extendSetting.pageSize + 1) * rowHeight) {
                  _this.playTimeOut = setTimeout(function () {
                    tableBody.style.transitionDuration = '0ms'
                    tableBody.style.transform = 'translate3d(0px, 0px, 0px)'
                    y = -rowHeight
                  }, 200)
                }
              }, _this.vscompt.comptAttrs.extendSetting.duration * 1000)
            }
            tableWrapper.scrollTop = 0
          }
          // tableWrapper.onmousewheel = () => {
          //   tableBody.style.transform = "translate3d(0px, 0px, 0px)";
          // }
        })
      }
    },
    doTableLayout () {
      this.$refs.tableBody.doLayout()
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

  /deep/ .el-table thead th.is-leaf {
    border-bottom: none;
  }
}

.innerborder-datagrid {
  /deep/ .el-table td {
    // border-right: 1px solid #ebeef5;
  }
}

.el-table {
  /deep/ .row-count {
    font-weight: bold;
  }
  th div {
    width: 100%;
  }
}
.mobile_datagrid-wrap {
  // height: calc(100% - 30px);
  height: 100%;
}
.datagrid-wrap {
  height: calc(100% - 70px);

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
  height: 100%;
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
  .el-table__body-wrapper{
    overflow-y: hidden;
  }
  th div {
    font-size: 16px;
    width: 100%;
  }
  thead tr,
  thead th {
    background-color: #002d63;
    border-bottom: none;
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
      color: #fff;
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
