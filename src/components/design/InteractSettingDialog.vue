<template>
  <el-dialog
    size="mini"
    title="联动设置"
    width="653px"
    :visible.sync="interactDialogVis"
    :append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="reset"
    :destroy-on-close="true"
    id="auto_link_dialog"
  >
    <div class="condi-set-box interact-set-wrap">
      <el-container>
        <el-aside width="185px" class="condi-aside">
          <div style="height:54px">
            <MainTitle width="100px" title="联动维度"></MainTitle>
            <div style="line-height:33px;" class="ds-title">
              <span class="con-ds">数据集：</span>
              <el-tooltip effect="dark" :content="datasetName" placement="top-start">
                <span class="con-dataset">{{datasetName}}</span>
              </el-tooltip>
            </div>
          </div>
          <div style="height:240px; overflow:hidden">
            <el-scrollbar class="my-scroll-bar">
              <div style="height:100%; padding-right:20px;">
                <div
                  v-for="item in fieldList"
                  v-bind:key="item.element_id+Math.random()"
                  :class="{'active':curField==item.element_id,'field-list':true}"
                  @click="changeField(item)"
                >
                  <span>{{ item.element_name }}</span>
                </div>
              </div>
            </el-scrollbar>
          </div>
        </el-aside>
        <el-main class="condi-main" :class="{'two-tab':isAllowPageLink}">
          <el-tabs v-model="activeName">
            <el-tab-pane label="同标签页" name="sPTab" id="auto_ds3">
              <el-checkbox
                :indeterminate="sPIsIndeterminate"
                v-model="sPCheckAll"
                @change="handleCheckAllChange"
                :disabled="sPCompts.length==0"
              >全选</el-checkbox>
              <!-- <el-input v-model="sercAf" @input="inputChange" placeholder="请输入查询数据集名称" size="mini"></el-input> -->
              <div class="horizon-split-line"></div>
              <div class="tab-check-wrap">
                <el-scrollbar style="height:100%;" :native="false" :noresize="false" tag="section">
                  <el-checkbox-group
                    v-model="sPCheckedCompts"
                    @change="handleCheckedCitiesChange"
                    id="sPCheckgroup"
                  >
                    <div
                      v-for="(item,index) in sPCompts"
                      :key="index+Math.random()"
                      class="check-item hide-label"
                      style="width: 100%;"
                    >
                      <el-checkbox
                        :key="item.comptId+Math.random()"
                        :label="item.comptId"
                        :disabled="item.disabled"
                      ></el-checkbox>
                      <span
                        class="check-item-label"
                        :title="sPCheckedCompts.indexOf(item.comptId)>-1&&sPComptsSelField[index].element_name != undefined ? (item.comptAttrs.extendSetting['comptName.text'] || (item.comptAttrs.name||'')+item.orderId) + '-' + sPComptsSelField[index].element_name:(item.comptAttrs.extendSetting['comptName.text'] || (item.comptAttrs.name||'')+item.orderId)"
                        style="width: 110px; "
                      >{{item.comptAttrs.extendSetting['comptName.text'] || (item.comptAttrs.name||'')+item.orderId}}</span>
                      <span
                        v-show="item.dataSetName!==datasetName"
                        class="check-item-label"
                        :title="item.dataSetName"
                        style="width: 110px; "
                      >{{item.dataSetName}}</span>
                      <span
                        v-show="item.dataSetName===datasetName"
                        class="check-item-label"
                        :title="item.dataSetName"
                        style="width: 110px; "
                      >同数据集</span>
                      <span
                        class="check-item-icon"
                        :class="sPComptsSelField[index] == '' ? 'not-selected' : ''"
                      >
                        <el-select
                          v-model="sPComptsSelField[index]"
                          placeholder="请选择"
                          style="width:140px;"
                          size="mini"
                          value-key="element_name"
                          :disabled="item.dataSetName===datasetName"
                        >

                          <el-option
                            v-show="item.dataSetName===datasetName"
                            v-for="(option,index333) in sPComptsSelOptions[item.comptId]"
                            :key="option.element_id+Math.random()"
                            :label="option.element_name"
                            v-if="(option.col_type=='dat' && option.isNewCol) || option.col_type!='dat'"
                            :value="{
                           element_id: option.element_id,
                           element_name: option.element_name
                        }"
                          ></el-option>
                          <el-option
                           v-show="item.dataSetName!==datasetName"
                            v-for="(option,index333) in sPComptsSelOptions[item.comptId]"
                            :key="option.element_id+Math.random()"
                            :label="option.element_name"
                            v-if="!option.isNewCol"
                            :value="{
                           element_id: option.element_id,
                           element_name: option.element_name
                        }"
                          ></el-option>
                        </el-select>
                      </span>
                    </div>
                  </el-checkbox-group>
                </el-scrollbar>
              </div>
            </el-tab-pane>

            <el-tab-pane label="不同标签页" name="tab3" v-if="!isAllowPageLink" id="auto_ds3">
              <el-checkbox
                :indeterminate="isIndeterminate3"
                v-model="checkAll3"
                @change="handleCheckAllChange"
                :disabled="curSelPage=='' || compts3.length==0"
              >全选</el-checkbox>
              <el-select
                v-model="curSelPage"
                placeholder="请选择"
                style="width:140px;"
                size="mini"
                value-key="pageId"
                @change="selPageChange"
              >
                <el-option
                  v-for="(option,index33) in pageList"
                  :key="option.pageId+Math.random()"
                  :label="option.pageName"
                  :value="option"
                  :id="'auto_pages'+index33"
                ></el-option>
              </el-select>
              <div class="horizon-split-line"></div>
              <div class="tab-check-wrap">
                <el-scrollbar style="height:100%;" :native="false" :noresize="false" tag="section">
                  <el-checkbox-group
                    v-model="checkedCompts3"
                    @change="handleCheckedCitiesChange"
                    id="thirdCheckgroup"
                    v-show="pageLinkSet"
                  >
                    <div
                      v-for="(item,index) in compts3"
                      class="check-item hide-label"
                      style="width: 100%;"
                    >
                      <el-checkbox
                        :key="item.comptId+Math.random()"
                        :label="item.comptId"
                        :disabled="item.disabled"
                      ></el-checkbox>
                      <span
                        class="check-item-label"
                        :title="checkedCompts3.indexOf(item.comptId)>-1&&comptsSelField3[index].element_name != undefined ? (item.comptAttrs.extendSetting['comptName.text'] || (item.comptAttrs.name||'')+item.orderId) + '-' + comptsSelField3[index].element_name:(item.comptAttrs.extendSetting['comptName.text'] || (item.comptAttrs.name||'')+item.orderId)"
                        style="width: 110px; "
                      >{{item.comptAttrs.extendSetting['comptName.text'] || (item.comptAttrs.name||'')+item.orderId}}</span>
                      <span
                        class="check-item-label"
                        :title="item.dataSetName"
                        style="width: 110px; "
                      >{{item.dataSetName}}</span>
                      <span
                        class="check-item-icon"
                        :class="comptsSelField3[index] == '' ? 'not-selected' : ''"
                      >
                        <el-select
                          v-model="comptsSelField3[index]"
                          placeholder="请选择"
                          style="width:140px;"
                          size="mini"
                          value-key="element_name"
                          :disabled="item.readOnly"
                        >
                          <el-option
                            v-for="(option,index333) in comptsSelOptions[item.afId + item.comptId]"
                            v-if="!option.isNewCol"
                            :key="option.element_id+Math.random()"
                            :label="option.element_name"
                            :value="{
                           element_id: option.element_id,
                           element_name: option.element_name
                        }"
                          ></el-option>
                        </el-select>
                      </span>
                    </div>
                  </el-checkbox-group>
                </el-scrollbar>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-main>
      </el-container>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="closeDialog">取 消</el-button>
      <el-button type="primary" @click="saveLinkageSet" size="mini">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex'
import MainTitle from '../tools/MainTitle'
import { objDeepCopy, getFilteredData } from '../../utils/comonFunc'
export default {
  components: {
    MainTitle
  },
  data () {
    return {
      // 同页面的数据集
      initSpCompt: [],
      sercAf: '',
      sPCompts: [],
      sPIsIndeterminate: false,
      sPCheckAll: false,
      sPCheckedCompts: [],
      sPComptsSelField: [],//同标签当前选中的关联字段
      sPComptsSelOptions: {},//同标签当前选中的关联组件
      fieldList: [],
      activeName: 'sPTab',
      curField: '',
      comptsSelField: [],
      comptsSelOptions: {},
      queryComptSelData: {}, // 用于存储查询组件各子组件的选项值
      warnTip1: '不同数据集中选中的组件必须设置关联的字段',
      warnTip2: '选中的组件必须设置关联的字段',
      compts3: [],
      checkedCompts3: [],
      comptsSelField3: [],
      isIndeterminate3: true,
      checkAll3: false,
      pageComptList: {}, // 其他非浮窗类型的子页面内的所有绑定数据集的组件（查询组件例外）1以pageId作为key
      curSelPage: '', // 当前选中的子页面
      curFieObj: {} //当前数据集关联的字段对象(curFieObj.element_id=curField),时间格式拆分有多个相同的element_id,this.curField不能关联到时间格式字段
    }
  },
  computed: {
    activedSubCompts () {
      let subList = this.activedCompt.comptAttrs.fieldList
      let targetCompt = {}
      for (let item of subList) {
        if (item.comptAttrs.element_id == this.curField) {
          targetCompt = item
          break
        }
      }
      return targetCompt
    },
    interactDialogVis: {
      get () {
        return this.$store.state.AnalyReportAttr.interactDialogVis
      },
      set (value) {
        this.setInteractDialogVis(value)
      }
    },
    datasetName () {
      let afName = ''
      if (
        this.activedCompt != undefined &&
        this.activedCompt.afId != undefined &&
        this.activedCompt.afId != ''
      ) {
        afName = this.getDataSetName(this.activedCompt.afId)
      }
      return afName
    },
    ...mapGetters({
      activeComptIdx: 'PageDesign/activeComptIdx',
      activedCompt: 'PageDesign/getActivedCompt',
      flatCompt: 'PageDesign/getFlatCompt',
      nowPage: 'PageDesign/getActivedPage',
      getTabCompts: 'PageDesign/getTabCompts',
      getFlatComptByList: 'PageDesign/getFlatComptByList'
    }),
    ...mapState({
      datasetMap: state => state.AnalyReportAttr.datasetMap,
      s_edcuiCompts: state => state.PageDesign.s_edcuiCompts,
      allPageList: state => state.PageDesign.pageList,
      activedPage: state => state.PageDesign.activedPage
    }),
    pageList () {
      let pList = []
      this.pageComptList = {}
      if (this.nowPage.pageType == 2) {
        // 浮动窗口不能设置
        return pList
      } else {
        // 主页面可以联动子页面，子页面只能联动子页面
        pList.push({
          pageName: '请选择',
          pageId: ''
        })
        for (let index = 0; index < this.allPageList.length; index++) {
          const element = this.allPageList[index]
          if (element.parentId != '0' && element.pageId != this.activedPage) {
            pList.push({
              pageName: element.pageName,
              pageId: element.pageId
            })
            let oriCompts =
              this.getFlatComptByList(element.pageDetail || []) || []
            let newCompts = this.filterPageCompts(oriCompts)
            this.pageComptList[element.pageId] = newCompts
          }
        }
        return pList
      }
    },
    pageLinkSet () {
      return (
        this.curSelPage &&
        this.curSelPage.pageId &&
        this.curSelPage.pageId != ''
      )
    },
    // 查询组件跟浮动窗窗中的组件不允许页面链接设置，对其进行屏蔽
    isAllowPageLink () {
      return (
        ['Query', 'MobileQuery'].includes(this.activedCompt.type) ||
        this.nowPage.pageType == 2
      )
    }
  },
  watch: {
    interactDialogVis (visable) {
      if (visable == false) return
      this.initSpCompt = objDeepCopy(this.sPCompts)

      this.activeName = 'sPTab'
      let val = this.activedCompt
      let comptId = this.activedCompt.comptId
      let curAfId = this.activedCompt.afId
      this.queryComptSelData = {}
      if (
        this.s_edcuiCompts.length > 0 &&
        val != undefined &&
        val.comptId != undefined
      ) {
        this.compts2 = this.flatCompt.filter(item => {
          return (
            item.type != 'Query' &&
            item.type != 'MobileQuery' &&
            item.comptId != comptId &&
            item.afId != curAfId &&
            item.comptAttrs.isBindData == '1'
            // &&
            // (item.comptAttrs.xAxisData.length > 0 ||
            //   ['VeGauge', 'VeRing', 'CrossTable'].includes(item.type))
          )
        })
        this.sPCompts = this.flatCompt.filter(item => {
          return (
            item.type != 'Query' &&
            item.type != 'MobileQuery' &&
            item.comptId != comptId &&
            item.comptAttrs.isBindData == '1'
            // &&
            // (item.comptAttrs.xAxisData.length > 0 ||
            //   ['VeGauge', 'VeRing', 'CrossTable'].includes(item.type))
          )
        })
        // 构造同标签页面数据
        this.sPComptsSelField = []
        this.sPComptsSelOptions = {}
        let comptsSelFieldCp = []

        for (let index = 0; index < this.sPCompts.length; index++) {
          const element = this.sPCompts[index]
          element.dataSetName = this.getDataSetName(element.afId)
          if (element.afId === curAfId) {
            comptsSelFieldCp.push('')

            this.$nextTick(() => {
              let sPfield0 = this.getField(curAfId, this.curField, this.curFieObj)
              // 同数据集默认选择
              if (this.sPComptsSelField[index] == '') {
                this.$set(this.sPComptsSelField, index, {
                  element_id: sPfield0.element_id,
                  element_name: sPfield0.element_name
                })
              }
            })
          } else {
            comptsSelFieldCp.push('')
          }
          // 构建同页面维度
          let spDsFields = (this.datasetMap[element.afId] || []).filter(
            item => {
              return item.element_type == '1' && !item.from_compt
            }
          )
          if (this.activedCompt.type == 'Query' || 'MobileQuery') {
            spDsFields = (this.datasetMap[element.afId] || []).filter(
              item => {
                return !item.from_compt
              }
            )
          }
          this.sPComptsSelOptions[element.comptId] = spDsFields
          if (spDsFields.length > 0) {
            // 有维层字段
            this.sPCompts[index]['disabled'] = false
          } else {
            this.sPCompts[index]['disabled'] = true
          }
        }
        let fieldArr = []
        let resultData = {}
        // let comptsSelFieldCp = objDeepCopy(this.comptsSelField);
        if (val.type == 'Query' || val.type == 'MobileQuery') {
          for (
            let i = 0;
            i < (val.comptAttrs.selectedQueryData || []).length;
            i++
          ) {
            const element = val.comptAttrs.selectedQueryData[i]
            let dataset = this.datasetMap[element.af_id] || []
            let res = dataset.filter(item => {
              //针对拆分的日期格式做特殊处理
              if(item.col_type === 'dat'){
                return item.element_id == element.element_id && item.isNewCol && element.formatLevel === item.formatLevel;
              }
              return item.element_id == element.element_id
            })
            if (res.length > 0) {
              fieldArr.push({
                element_id: res[0].element_id,
                af_id: res[0].af_id,
                element_name: res[0].element_name,
                isNewCol: res[0].isNewCol,
                formatLevel: res[0].formatLevel,
                col_type: res[0].col_type
              })
            }
          }

          if (val.comptAttrs.fieldList.length > 0) {
            let queryFieldList = val.comptAttrs.fieldList
            for (let index = 0; index < queryFieldList.length; index++) {
              const element = queryFieldList[index]
              if (element.type == 'ElButton') {
                continue
              }
              this.queryComptSelData[
                element.comptAttrs.element_id
              ] = objDeepCopy(
                this.initCkAndSelData(
                  element,
                  objDeepCopy(comptsSelFieldCp),
                  element.comptAttrs.element_id
                )
              )
            }
          }
        } else {
          let oriFieldList = (val.comptAttrs.xAxisData || []).concat(
            val.comptAttrs.yAxis1Data || []
          )
          // 散点图，气泡图 图例维度不支持联动
          oriFieldList = oriFieldList.filter(field2 => field2.isNewSetting !== "legendDim");
          for (let index = 0; index < oriFieldList.length; index++) {
            const element = oriFieldList[index]
            let dataset = this.datasetMap[element.af_id] || []
            let res = []
            dataset.forEach(item => {
              item.isNewSetting = element.isNewSetting
              let flag = false
              if(item.col_type === 'dat'){
                flag = item.element_id === element.element_id && item.isNewCol && element.formatLevel === item.formatLevel;
              } else {
                flag = item.element_id === element.element_id
              }
              flag ? res.push(item) :  ''
            })
            if (res.length > 0 && res[0].element_type == 1 && res[0].isNewSetting !== '_legend') {
              // 非查询组件只针对维度进行联动
              fieldArr.push({
                element_id: res[0].element_id,
                af_id: res[0].af_id,
                element_name: res[0].element_name,
                dataSetName: res[0].tab_chs_name,
                isNewCol: res[0].isNewCol,
                formatLevel: res[0].formatLevel,
                col_type: res[0].col_type
              })
            }
          }

          if (val.comptAttrs.mainLinkageData != undefined) {
            // 改造支持多字段切换
            for (let idx = 0; idx < fieldArr.length; idx++) {
              const element = fieldArr[idx]
              this.queryComptSelData[element.element_id] = objDeepCopy(
                this.initCkAndSelData(
                  val,
                  objDeepCopy(comptsSelFieldCp),
                  element.element_id
                )
              )
            }
          }
        }
        this.fieldList = fieldArr
        this.curField =
          this.fieldList.length > 0 ? this.fieldList[0].element_id : ''
        // 时间格式拆分的字段新增this.curFieObj对象
        if(this.curField){
          this.curFieObj = {
            element_id: this.curField,
            element_name: this.fieldList[0].element_name,
            isNewCol: this.fieldList[0].isNewCol,
            formatLevel: this.fieldList[0].formatLevel,
            col_type: this.fieldList[0].col_type
          }
        }
        resultData = objDeepCopy(this.queryComptSelData[this.curField])
        // 初始化之前缓存的设置
        if (resultData.sPComptsSelField != undefined) {
          this.resetTab('sp', resultData)
        }

        // if (resultData.comptsSelField != undefined) {
        //       this.resetTab(1, resultData);
        //     }
        // 页面链接
        this.curSelPage = ''
        this.resetTab(2, {
          checkedCompts3: [],
          compts3: [],
          comptsSelField3: []
        })
        this.initPageLinkData()
        // this.initSPData();
      }
    },
    curSelPage (newVal, oldVal) {
      if (oldVal != '' && oldVal.pageId != '') {
        // 下拉框切换后，该子页面联动设置即清空
        let curPageInfo =
          this.queryComptSelData[this.curField]['pageLinkInfo'][
            oldVal.pageId
          ] || {}
        for (
          let index = 0;
          index < (curPageInfo.checkedCompts3 || []).length;
          index++
        ) {
          curPageInfo.checkedCompts3[index] = ''
          if (!curPageInfo.compts3[index].readOnly) {
            curPageInfo.comptsSelField3[index] = ''
          }
        }
      }
    }
  },
  methods: {
    reset () { },
    handleCheckAllChange (val) {
      let arr1 = []
      switch (this.activeName) {
        case 'tab3':
          if (val) {
            for (let index = 0; index < this.compts3.length; index++) {
              const element = this.compts3[index]
              if (!element.disabled) arr1.push(element.comptId)
            }
          }
          this.checkedCompts3 = arr1
          this.isIndeterminate3 = false
          break
        case 'sPTab':
          if (val) {
            for (let index = 0; index < this.sPCompts.length; index++) {
              const element = this.sPCompts[index]
              if (!element.disabled) arr1.push(element.comptId)
            }
          }
          this.sPCheckedCompts = arr1
          this.sPIsIndeterminate = false
          break
        default:
          break
      }
    },
    handleCheckedCitiesChange (value, tabName) {
      let checkedCount = value.length
      let comptLength = 0
      switch (tabName || this.activeName) {
        case 'tab3':
          comptLength = this.compts3.filter(item => {
            return item.disabled == false
          }).length
          this.checkAll3 = checkedCount >= comptLength && checkedCount > 0
          this.isIndeterminate3 =
            checkedCount > 0 && checkedCount < comptLength
          break
        case 'sPTab':
          comptLength = this.sPCompts.filter(item => {
            return item.disabled == false
          }).length
          this.sPCheckAll = checkedCount >= comptLength && checkedCount > 0
          this.sPIsIndeterminate =
            checkedCount > 0 && checkedCount < comptLength
          break
        default:
          break
      }
    },
    ...mapMutations({
      setInteractDialogVis: 'AnalyReportAttr/setInteractDialogVis'
    }),
    closeDialog () {
      this.setInteractDialogVis(false)
    },
    saveLinkageSet () {
      if (!this.checkIfCkSelected('sPCheckgroup')) {
        this.$message({
          message: this.warnTip2,
          type: 'warning'
        })
        return
      }
      if (!this.checkIfCkSelected('thirdCheckgroup')) {
        this.$message({
          message: this.warnTip2,
          type: 'warning'
        })
        return
      }
      this.queryComptSelData[this.curField].sPCheckedCompts = objDeepCopy(
        this.sPCheckedCompts
      )
      this.queryComptSelData[this.curField].sPCompts = objDeepCopy(
        this.sPCompts
      )

      this.queryComptSelData[this.curField].sPComptsSelField = objDeepCopy(
        this.sPComptsSelField
      )

      let linkArr = []
      let oriLinkArr = []
      this.saveCurFieldSet()
      let activeCompId = this.activedCompt.comptId
      let newPageLinkData = this.updatePageLink() || []

      if (
        this.activedCompt.type == 'Query' ||
        this.activedCompt.type == 'MobileQuery'
      ) {
        for (const key in this.queryComptSelData) {
          let subCompIdx = -1
          let subFields = this.activedCompt.comptAttrs.fieldList
          for (let index = 0; index < subFields.length; index++) {
            if (subFields[index].comptAttrs.element_id == key) {
              subCompIdx = index
              break
            }
          }
          oriLinkArr = []
          let targetCompt =
            this.activedCompt.comptAttrs.fieldList[subCompIdx] || {}
          if (
            targetCompt.comptAttrs != undefined &&
            targetCompt.comptAttrs.mainLinkageData != undefined
          ) {
            oriLinkArr = objDeepCopy(
              targetCompt.comptAttrs.mainLinkageData || []
            )
          }
          linkArr = this.updateLinkageInfo('sP', {
            curField: key,
            checkedData: this.queryComptSelData[key].sPCheckedCompts,
            comptsSelField: this.queryComptSelData[key].sPComptsSelField
          })
          if (oriLinkArr.length > 0) {
            this.resetMainLinkState(oriLinkArr, linkArr)
          }
          if (targetCompt.comptAttrs != undefined) {
            targetCompt.comptAttrs['isNeedResetLink'] =
              targetCompt.comptAttrs['isNeedResetLink'] || 0 + 1 // 重置回未联动状态
            let linkArrBak = objDeepCopy(linkArr)
            setTimeout(() => {
              this.setMainData(activeCompId, linkArrBak, key)
              // targetCompt.comptAttrs.mainLinkageData = linkArr;
            }, 1000)
          }
        }
      } else {
        // 如果当前处在联动状态，然后又取消部分组件的联动，把之前的联动组件清掉
        /** *****适应多维度字段******** */
        let newMainLinkData = []
        let oldMainLinkData = objDeepCopy(
          this.activedCompt.comptAttrs.mainLinkageData || []
        )

        for (const key in this.queryComptSelData) {
          oriLinkArr = oldMainLinkData.filter(item => {
            return item.rel_element_id == key
          })

          // 获得同页面联动数据
          linkArr = this.updateLinkageInfo('sP', {
            curField: key,
            checkedData: this.queryComptSelData[key].sPCheckedCompts,
            comptsSelField: this.queryComptSelData[key].sPComptsSelField
          })
          if (oriLinkArr.length > 0) {
            this.resetMainLinkState(oriLinkArr, linkArr)
          }
          newMainLinkData = newMainLinkData.concat(objDeepCopy(linkArr))
        }
        this.activedCompt.comptAttrs['isNeedResetLink']++ // 重置回未联动状态
        // 怕组件之前的联动还没重置回去，所以加延时
        setTimeout(() => {
          this.setMainData(activeCompId, newMainLinkData)
        }, 1000)
        /** *****适应多维度字段*****/
      }
      this.activedCompt.comptAttrs['pageLinkageData'] = newPageLinkData
      this.activedCompt.comptAttrs.extendSetting.comptUrl = '' // 清除链接自定义
      this.activedCompt.comptAttrs.extendSetting.pageId = null // 清除链接子页面
      this.setInteractDialogVis(false)
    },
    /**
     * otherParam = {
     *  curField:curField,
     *  checkedData:checkedData,
     *  comptsSelField:comptsSelField
     * }
     */
    updateLinkageInfo (type, otherParam) {
      let checkedData = []
      let curField // = this.curField
      // switch (type) {
      //   case 'sP':
      //     checkedData = this.sPCheckedCompts
      //     break
      //
      //   case 3:
      //     checkedData = this.checkedCompts3
      //     break
      //   default:
      //     break
      // }
      let curSelPageId = ''
      let curAfId = this.activedCompt.afId
      let sPfield0 = this.getField(curAfId, otherParam.curField, this.curFieObj)
      checkedData = otherParam.checkedData
      curField = otherParam.curField
      var comptsSelField = otherParam.comptsSelField
      curSelPageId = otherParam.curSelPageId
      let linkArr = []
      for (let index = 0; index < checkedData.length; index++) {
        const comptId = checkedData[index]
        let idx = -1
        // 数据集关联的组件
        var compt = {}
        let elementId = curField

        for (let index1 = 0; index1 < this.flatCompt.length; index1++) {
          if (this.flatCompt[index1].comptId == comptId) {
            idx = index1
            compt = this.flatCompt[index1]
          }
        }
        // 构建同一个页面数据集信息
        if (type == 'sP') {
          for (let index2 = 0; index2 < this.sPCompts.length; index2++) {
            if (this.sPCompts[index2].comptId == comptId) {
              elementId = comptsSelField[index2].element_id
              break
            }
          }
        }

        // 页面链接当前选中页面信息保存
        if (type == 3) { // && otherParam != undefined
          comptsSelField = otherParam.comptsSelField
          let pageCompts = this.pageComptList[curSelPageId]
          for (let index1 = 0; index1 < pageCompts.length; index1++) {
            if (pageCompts[index1].comptId == comptId) {
              compt = pageCompts[index1]
              break
            }
          }
          for (let index3 = 0; index3 < otherParam.compts3.length; index3++) {
            if (otherParam.compts3[index3].comptId == comptId) {
              elementId = comptsSelField[index3].element_id
              break
            }
          }
        }

        if ([1, 2, 'sP'].includes(type)) {
          linkArr.push({
            comptId: comptId,
            // pageId: compt.pageId,
            rel_element_id: curField, // 主联动组件 字段element_id
            element_id: elementId, // 被联动组件对应字段element_id
            af_id: compt.afId
          })
        } else {
          linkArr.push({
            pageId: curSelPageId,
            relPageId: this.nowPage.pageId,
            comptId: comptId,
            rel_element_id: curField, // 主联动组件 字段element_id
            element_id: elementId, // 被联动组件对应字段element_id
            af_id: compt.afId
          })
        }

        //日期格式字段新增参数
        // if (sPfield0.col_type === 'dat' && elementId === sPfield0.element_id) {
        if (sPfield0.col_type === 'dat') {
          linkArr[index] = {
            ...linkArr[index],
            ...{
              isNewCol: sPfield0.isNewCol,
              formatLevel: sPfield0.formatLevel,
              col_type: sPfield0.col_type,
              format: sPfield0.source_format,
              target_format: sPfield0.show_format
            }
          }
        }

        if (type != 3) {
          if (
            this.flatCompt[idx] != null &&
            this.flatCompt[idx].comptAttrs != null
          ) {
            this.flatCompt[idx].comptAttrs.isLinkage = true
          }
        }
      }
      return linkArr
    },
    resetMainLinkState (oriLinkArr, linkArr) {
      for (let index = 0; index < oriLinkArr.length; index++) {
        const element = oriLinkArr[index]
        let res = linkArr.filter(item => {
          return item.comptId == element.comptId
        })
        if (res.length == 0) {
          // 同数据集 原先联动的组件取消联动
          for (let index2 = 0; index2 < this.flatCompt.length; index2++) {
            const element2 = this.flatCompt[index2]
            if (element2.comptId == element.comptId) {
              if (
                this.flatCompt[index2].comptAttrs['linkageCondi'] !=
                undefined &&
                this.flatCompt[index2].comptAttrs['linkageCondi'].length > 0
              ) {
                let condiIdx = -1
                let condiArr = this.flatCompt[index2].comptAttrs['linkageCondi']
                for (let index3 = 0; index3 < condiArr.length; index3++) {
                  const element3 = condiArr[index3]
                  if (element3.rel_element_id == this.curField) {
                    condiIdx = index3
                    break
                  }
                }
                this.flatCompt[index2].comptAttrs['linkageCondi'].splice(
                  condiIdx,
                  1
                )
              }
            }
          }
        }
      }
    },
    initCkAndSelData (val, comptsSelField, curElementId) {
      // 初始化选中项的值

      let sPComptsSelField = comptsSelField
      // 初始化同页面数据
      let sPCheckedCompts = []
      let mainLinkageData1 = getFilteredData(
        val.comptAttrs.mainLinkageData,
        'rel_element_id',
        curElementId
      )
      for (let index = 0; index < mainLinkageData1.length; index++) {
        const element = mainLinkageData1[index]

        // 获取数据
        sPCheckedCompts.push(element.comptId)

        for (let index1 = 0; index1 < this.sPCompts.length; index1++) {
          const element1 = this.sPCompts[index1]
          if (element1.comptId == element.comptId) {
            let datasetFields = this.datasetMap[element.af_id] || []
            let res = datasetFields.filter(item => {
              //同一个数据集,data类型的判断;不同数据集直接用element_id
              if(element.af_id === element1.af_id && item.col_type === 'dat'){
                return item.element_id == element.element_id && item.isNewCol && element.formatLevel === item.formatLevel;
              }
              return item.element_id == element.element_id
            })
            if (res.length > 0) {
              sPComptsSelField[index1] = {
                element_id: element.element_id,
                element_name: res[0].element_name
              }
            }
            break
          }
        }
      }
      return {
        sPCheckedCompts: sPCheckedCompts,
        sPComptsSelField: objDeepCopy(sPComptsSelField),
        sPCompts: this.sPCompts,
        comptsSelField: objDeepCopy(comptsSelField),
        pageLinkInfo: {} // 存放页面链接
      }
    },
    changeField (item) {
      if (!this.checkIfCkSelected('sPCheckgroup')) {
        this.$message({
          message: this.warnTip2,
          type: 'warning'
        })
        return
      }
      // if (this.curSelPage != "" && !this.checkIfCkSelected("thirdCheckgroup")) {
      //   this.$message({
      //     message: this.warnTip2,
      //     type: "warning"
      //   });
      //   return;
      // }
      let nodes = document.getElementById('sPCheckgroup').children
      for (let index = 0; index < nodes.length; index++) {
        const node = nodes[index]
        if (node.children[0].className.indexOf('is-checked') == -1) {
          this.sPComptsSelField[index] = ''
        }
      }

      // 保存当前设置
      this.saveCurFieldSet()
      let curFieldSelData = objDeepCopy(
        this.queryComptSelData[item.element_id]
      )
      // this.resetTab(1, curFieldSelData);
      this.resetTab('sp', curFieldSelData)
      // 多维度切换时同数据集默认选中
      let curAfId = this.activedCompt.afId
      for (let index = 0; index < this.sPCompts.length; index++) {
        const element = this.sPCompts[index]
        if (element.afId === curAfId) {
          this.$nextTick(() => {
            let sPfield0 = this.getField(curAfId, this.curField, this.curFieObj)
            // 同数据集默认选择
            // if (this.sPComptsSelField[index] == "") {
            this.$set(this.sPComptsSelField, index, {
              element_id: sPfield0.element_id,
              element_name: sPfield0.element_name
            })
            // }
          })
        }
      }

      this.curField = item.element_id
      this.curFieObj = item;
      let tab3Data = {
        checkedCompts3: [],
        compts3: [],
        comptsSelField3: []
      }
      if (this.pageList.length == 0) {
        this.curSelPage = ''
        this.resetTab(2, tab3Data)
      } else {
        this.curSelPage = curFieldSelData.curSelPage || ''
        if (
          curFieldSelData.curSelPage != '' &&
          curFieldSelData.curSelPage != undefined &&
          curFieldSelData.curSelPage.pageId != undefined
        ) {
          tab3Data =
            curFieldSelData.pageLinkInfo[curFieldSelData.curSelPage.pageId] ||
            tab3Data
        }
        this.resetTab(2, tab3Data)
      }
    },
    // 检查选中复选框是否都有选下拉框的值
    checkIfCkSelected (id) {
      if (id == 'thirdCheckgroup' && this.curSelPage == '') {
        // 如果页面链接没选中页面，则后续不用检查
        return true
      }
      let selData = []
      if (id == 'thirdCheckgroup') {
        selData = this.comptsSelField3
      } else {
        selData = this.comptsSelField
      }
      if (id == 'sPCheckgroup') {
        selData = this.sPComptsSelField
      }
      let nodes = document.getElementById(id).children
      let flag = true
      for (let index = 0; index < nodes.length; index++) {
        const node = nodes[index]
        if (
          node.children[0].className.indexOf('is-checked') > -1 &&
          selData[index] == ''
        ) {
          flag = false
          break
        }
      }
      return flag
    },
    getDataSetName (afId) {
      // 获取数据集名称
      let dataSetName = ''
      let data = this.datasetMap[afId] || []
      if (data.length > 0) {
        dataSetName = data[0].af_name
      }
      return dataSetName
    },
    // 所有绑定数据集的组件（查询组件例外）
    filterPageCompts (list) {
      let pageCompts = []
      list.forEach(val => {
        if (
          val.type != 'Query' &&
          val.type != 'MobileQuery' &&
          val.comptAttrs.isBindData == '1' &&
          val.afId != ''
        ) {
          pageCompts.push(objDeepCopy(val))
        }
      })
      return pageCompts
    },
    /**
     * comptId：当前设置的主联动组件ID
     * mainData：新的联动数据
     * key:针对查询组件 单字段的element_id
     * 设置组件的联动数据
     *  */
    setMainData (comptId, mainData, key) {
      for (let index = 0; index < this.flatCompt.length; index++) {
        const element = this.flatCompt[index]
        if (element.comptId === comptId) {
          if (key != undefined) {
            // 查询组件
            let subFields = element.comptAttrs.fieldList
            for (let index2 = 0; index2 < subFields.length; index2++) {
              if (subFields[index2].comptAttrs.element_id == key) {
                let targetCompt = element.comptAttrs.fieldList[index2] || {}
                if (
                  targetCompt.comptAttrs != undefined &&
                  targetCompt.comptAttrs.mainLinkageData != undefined
                ) {
                  for (let dataItem of mainData) {
                    dataItem['rel_af_id'] = targetCompt.comptAttrs.af_id
                  }
                  targetCompt.comptAttrs.mainLinkageData = mainData
                }
                break
              }
            }
          } else {
            // 非查询组件
            element.comptAttrs.mainLinkageData = mainData
          }
          break
        }
      }
    },
    getField (afId, elementId, curFieObj) {
      let dsFields = (this.datasetMap[afId] || []).filter(item => {
        //curFieObj 针对拆分的日期格式做特殊处理
        if(curFieObj && curFieObj.col_type === 'dat'){
          return item.element_id == elementId && item.isNewCol && curFieObj.formatLevel === item.formatLevel;
        }
        return item.element_id == elementId
      })
      if (dsFields.length > 0) {
        return dsFields[0]
      } else return ''
    },
    selPageChange () {
      // 切换页面时，之前的设置清空
      let pageLinkInfo = this.queryComptSelData[this.curField]['pageLinkInfo']
      for (const key in pageLinkInfo) {
        if (pageLinkInfo.hasOwnProperty(key)) {
          let element = pageLinkInfo[key]
          element.checkedCompts3 = []
          for (let index = 0; index < element.compts3.length; index++) {
            const element2 = element.compts3[index]
            if (element2.afId != this.activedCompt.afId) {
              element.comptsSelField3[index] = ''
            }
          }
        }
      }
      if (this.curSelPage != '') {
        let curPageInfo =
          this.queryComptSelData[this.curField]['pageLinkInfo'][
            this.curSelPage.pageId
          ] || {}
        this.resetTab(2, curPageInfo)
      }
    },
    initPageLinkData () {
      let pageLinkData = this.activedCompt.comptAttrs.pageLinkageData || []
      for (const key in this.queryComptSelData) {
        let pageSetting = {}
        // 初始化页面链接数据
        let curFieldData = pageLinkData.filter(item => {
          return item.rel_element_id == key
        })
        for (let index1 = 0; index1 < this.pageList.length; index1++) {
          const element1 = this.pageList[index1]
          let curPageChecked = curFieldData.filter(item => {
            return item.pageId == element1.pageId
          })
          let pageRes = this.initPageCk(element1.pageId, curPageChecked, key)
          if (element1.pageId != '') { pageSetting[element1.pageId] = objDeepCopy(pageRes) }
          if (curPageChecked.length > 0) {
            this.queryComptSelData[key]['curSelPage'] = objDeepCopy(element1)
            if (key == this.curField) {
              // 如果当前选中的字段有设置页面连接，则下拉框要回显
              this.curSelPage = objDeepCopy(element1)
              this.resetTab(2, pageRes)
            }
          }
        }
        this.queryComptSelData[key]['pageLinkInfo'] = objDeepCopy(pageSetting)
        if (this.queryComptSelData[key]['curSelPage'] == undefined) {
          this.queryComptSelData[key]['curSelPage'] = ''
        }
      }
    },

    // 初始化页面链接设置中的所有选项设置
    initPageCk (pageId, curPageChecked, curElementId) {
      let checkedCompts3 = []
      let compts3 = []
      let comptsSelField3 = []
      let curAfId = this.activedCompt.afId || ''
      let curPageCompts = this.pageComptList[pageId] || []
      for (let index = 0; index < curPageCompts.length; index++) {
        const element = curPageCompts[index]
        let dsFields = (this.datasetMap[element.afId] || []).filter(item => {
          return item.element_type == '1' && !item.from_compt
        })
        this.comptsSelOptions[element.afId + '' + element.comptId] = dsFields
        let isSameAf = false
        let checkItem = curPageChecked.filter(item => {
          return (
            item.rel_element_id == curElementId &&
            item.comptId == element.comptId
          )
        })
        if (element.afId == curAfId) {
          // 同数据集默认选中字段
          let field0 = this.getField(curAfId, curElementId)
          comptsSelField3.push({
            element_id: field0.element_id,
            element_name: field0.element_name
          })
          isSameAf = true
        } else {
          if (checkItem.length > 0) {
            let field1 = this.getField(
              checkItem[0].af_id,
              checkItem[0].element_id
            )
            comptsSelField3.push({
              element_id: field1.element_id,
              element_name: field1.element_name
            })
          } else comptsSelField3.push('')
        }

        if (checkItem.length > 0) {
          checkedCompts3.push(element.comptId)
        }
        compts3.push({
          ...objDeepCopy(element),
          ...{
            dataSetName: this.getDataSetName(element.afId),
            disabled: false,
            readOnly: isSameAf // 同数据集下拉框只读
          }
        })

        if (dsFields.length > 0) {
          // 有维层字段
          compts3[index]['disabled'] = false
        } else {
          compts3[index]['disabled'] = true
        }
      }

      return {
        checkedCompts3: checkedCompts3,
        compts3: compts3,
        comptsSelField3: comptsSelField3
      }
    },
    updatePageLink () {
      let pageLinkData = []
      for (const field in this.queryComptSelData) {
        let allPageSet = this.queryComptSelData[field]['pageLinkInfo'] || {}
        let selPageInfo = this.queryComptSelData[field]['curSelPage'] || ''
        if (selPageInfo != '') {
          let checkedCount = []
          let pageId = selPageInfo.pageId
          if (allPageSet[pageId].checkedCompts3.length > 0) {
            checkedCount = allPageSet[pageId].checkedCompts3.filter(item => {
              return item != ''
            })
          }
          if (checkedCount.length > 0) {
            pageLinkData = pageLinkData.concat(
              this.updateLinkageInfo(3, {
                checkedData: allPageSet[pageId].checkedCompts3,
                curField: field,
                comptsSelField: allPageSet[pageId].comptsSelField3,
                curSelPageId: pageId,
                compts3: allPageSet[pageId].compts3
              })
            )
          }
        }
      }
      return pageLinkData
    },
    // 保存当前页面链接选中的页面的链接设置
    saveCurFieldSet () {
      if (this.curSelPage != '' && this.curSelPage.pageId != undefined) {
        let fieldPLInfo = objDeepCopy(
          this.queryComptSelData[this.curField]['pageLinkInfo']
        )

        let nodes = document.getElementById('thirdCheckgroup').children
        let checkCount = 0
        for (let index = 0; index < nodes.length; index++) {
          const node = nodes[index]
          if (node.children[0].className.indexOf('is-checked') == -1) {
            if (this.activedCompt.afId !== this.compts3[index].afId) { this.comptsSelField3[index] = '' }
          } else {
            checkCount++
          }
        }
        fieldPLInfo[this.curSelPage.pageId] = {
          checkedCompts3: objDeepCopy(this.checkedCompts3),
          compts3: objDeepCopy(this.compts3),
          comptsSelField3: objDeepCopy(this.comptsSelField3)
        }

        // 保存当前设置
        this.queryComptSelData[this.curField]['pageLinkInfo'] = fieldPLInfo
        if (checkCount == 0) {
          this.queryComptSelData[this.curField]['curSelPage'] = ''
        } else {
          this.queryComptSelData[this.curField]['curSelPage'] = objDeepCopy(
            this.curSelPage
          )
        }
      } else {
        this.queryComptSelData[this.curField]['pageLinkInfo'] = objDeepCopy(
          this.queryComptSelData[this.curField]['pageLinkInfo']
        )
        this.queryComptSelData[this.curField]['curSelPage'] = ''
      }
      this.queryComptSelData[this.curField].comptsSelField = objDeepCopy(
        this.comptsSelField
      )
      // 缓存同页的数据
      this.queryComptSelData[this.curField].sPCheckedCompts = objDeepCopy(
        this.sPCheckedCompts
      )
      this.queryComptSelData[this.curField].sPComptsSelField = objDeepCopy(
        this.sPComptsSelField
      )
    },
    /**
     * 重置tab的数据
     * param:{
        checkedCompts3: checkedCompts3,
        compts3: compts3,
        comptsSelField3: comptsSelField3,
        curSelPage: curSelPage
      }
      type:1--tab1和tab2的重置；  2--tab3的重置
     */
    resetTab (type, param) {
      switch (type) {
        case 2:
          this.checkedCompts3 = objDeepCopy(param.checkedCompts3 || [])
          this.compts3 = objDeepCopy(param.compts3 || [])
          this.comptsSelField3 = objDeepCopy(param.comptsSelField3 || [])
          this.handleCheckedCitiesChange(param.checkedCompts3 || [], 'tab3')
          break
        case 'sp':
          this.sPCheckedCompts = objDeepCopy(param.sPCheckedCompts || [])
          this.sPCompts = objDeepCopy(param.sPCompts || [])
          this.sPComptsSelField = objDeepCopy(param.sPComptsSelField || [])
          this.handleCheckedCitiesChange(param.sPCheckedCompts || [], 'sPTab')
          break
        default:
          break
      }
    }
  },
  mounted () { }
}
</script>

<style lang="scss" scoped>
$border-clr01: #dcdfe6; // 边框色1
$main-color: #409eff; //主色调
$bg-clr01: #ecf5ff; // 块背景色1
$txt-clr01: #afc0d0; // 文字颜色1
$txt-clr02: #606266;
.condi-set-box {
  height: 300px;
  padding: 0;
  /deep/.el-main {
    padding: 0;
  }
  /deep/.el-header {
    padding: 0;
  }
  /deep/.el-form-item__label {
    text-align: right;
  }
  .condi-aside {
    border-right: 1px dashed $border-clr01;
    .con-dataset {
      display: inline-block;
      width: 110px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 19px;
      vertical-align: -5px;
    }
  }
  .condi-main {
    padding-left: 20px;
    overflow: hidden;
    /deep/ .el-input-group {
      vertical-align: middle;
    }
  }
  .field-list {
    width: 100%;
    height: 28px;
    border: 1px solid $border-clr01;
    border-radius: 3px;
    margin-bottom: 10px;
    line-height: 26px;
    text-align: left;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0 10px;
    font-size: 12px;
    &.active {
      border-color: $main-color;
      background-color: $bg-clr01;
      color: $main-color;
    }
    span {
      // float: left;
    }
  }
}

.interact-set-wrap {
  /deep/.el-tabs__nav {
    margin-left: -131px;
    left: 50%;
  }
  .two-tab /deep/.el-tabs__nav {
    margin-left: -83px;
  }
  /deep/.el-tab-pane {
    .horizon-split-line {
      margin: 10px 0px 20px;
      border-bottom: 1px dashed $border-clr01;
    }
    & > .el-checkbox {
      height: 24px;
      line-height: 25px;
      margin-top: 4px;
      margin-bottom: 4px;
    }
  }
  /deep/.el-tabs__header {
    margin: 0 0 10px;
  }
  /deep/.el-checkbox,
  /deep/.el-checkbox__label {
    font-size: 12px;
  }
  .check-item {
    display: inline-block;
    width: 50%;
    margin-bottom: 6px;
    &:nth-last-child(1),
    &:nth-last-child(2) {
      margin-bottom: 6px;
    }
    /deep/ span {
      font-size: 12px;
    }
    /deep/.el-checkbox {
      margin-right: 10px;
      &.is-checked + .check-item-label {
        color: $main-color;
      }
    }
    &.hide-label {
      /deep/.el-checkbox__label {
        display: none;
      }
    }
    .check-item-label {
      display: inline-block;
      width: 160px;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-all;
      white-space: nowrap;
      vertical-align: -3px;
      color: $txt-clr02;
      &.selected {
        color: $main-color;
      }
    }
    .check-item-icon {
      margin-left: 10px;
      cursor: pointer;
      color: $txt-clr02;
      &:hover {
        color: $main-color;
      }
      /deep/.el-select {
        .el-input__inner {
          border: none;
          height: 17px;
          line-height: 17px;
          text-overflow: ellipsis;
        }
      }
    }
  }
  #secondCheckgroup .check-item-label {
    width: 130px;
  }
  .condi-main {
    margin-top: -9px;
  }
  .ds-title {
    color: $txt-clr02;
  }
  /deep/.el-tab-pane {
    .tab-check-wrap {
      height: 200px;
      width: 100%;
      /deep/.el-scrollbar {
        .el-scrollbar__wrap {
          overflow-x: hidden;
        }
      }
    }
  }
}
/deep/.my-scroll-bar {
  height: 100%;
  .el-scrollbar__wrap {
    overflow-x: hidden;
  }
}
</style>
<style>
.interact-set-wrap
  .el-checkbox.is-checked
  + .check-item-label
  + .not-selected
  .el-select
  .el-select__caret::before {
  color: #f56c6c;
  animation: blink 3s linear infinite;
  /* 其它浏览器兼容性前缀 */
  -webkit-animation: blink 3s linear infinite;
  -moz-animation: blink 3s linear infinite;
  -ms-animation: blink 3s linear infinite;
  -o-animation: blink 3s linear infinite;
}
@-webkit-keyframes blink {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
.interact-set-wrap .check-item-icon .el-select .el-input__icon {
  line-height: 17px;
  transform: rotateZ(180deg);
}
</style>
