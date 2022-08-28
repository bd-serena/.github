<template>
  <div style="width:100%;height:100%;position:relative;">
    <bd-div
      ref="indicatorTrend"
      type="bd-indicatorTrend-pc"
      v-bind="vscompt.comptAttrs.extendSetting"
      :data="vscompt.comptData"
      :series="seriesStyle"
      @click="blockClick"
      @handleCheckAllChange="changeFilterData"
      @changefilterColumns="changeFilterData"
    />
    <div
      class="drill-label link-reset"
      v-show="linkageState && vscompt.comptAttrs['mainLinkageData'] != undefined && vscompt.comptAttrs['mainLinkageData'].length>0"
      @click="resetLinage()"
    >
      <span class="icon-A10622_PreOffline" title="重置联动信息"></span>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import commonCompMixin from './mixins/commonCompMixin'
export default {
  props: ['vscompt'],
  mixins: [commonCompMixin],
  data () {
    return {}
  },
  computed: {
    indicatorTrend () {
      return this.$refs.indicatorTrend.$children[0]
    },
    ...mapState({
      isDSMapReady: state => state.AnalyReportAttr.isDSMapReady,
      datasetMap: state => state.AnalyReportAttr.datasetMap,
      pageCache: state => state.HomeBody.pageCache,
      linkStack: state => state.PageDesign.linkStack
    }),
    ...mapGetters({
      getPageParams: 'PageDesign/getPageParams',
      getQueryCompts: 'PageDesign/getQueryCompts'
    }),
    seriesStyle () {
      let seriesSetting = {}
      const { columns = [] } = this.vscompt.comptData || {}
      if (columns.length <= 1) {
        return seriesSetting
      }
      const { colSetting = {} } = this.vscompt.comptAttrs
      columns.slice(1).forEach(item => {
        const measureInfo =
          this.yAxis1Data.find(field => field.nick_name === item) || {}
        seriesSetting[item] = {}
        const element_id = measureInfo.element_id
        if (element_id && colSetting[element_id]) {
          seriesSetting[item] = { ...colSetting[element_id] }
        }
      })
      return seriesSetting
    }
  },
  mounted () {
    let extendSetting = this.vscompt.comptAttrs.extendSetting
    if (this.vscompt.comptAttrs.curDrillIdx == undefined) {
      this.$set(this.vscompt.comptAttrs, 'curDrillIdx', 0)
      this.$set(this.vscompt.comptAttrs, 'drillWBeanList', [])
    }
    if (this.vscompt.afId == '' || this.vscompt.comptData == undefined) {
      this.$set(this.vscompt, 'comptData', {
        columns: [],
        rows: []
      })
      this.$set(this.vscompt.comptAttrs, 'isNeedRestDrill', 0)
      this.$set(this.vscompt.comptAttrs, 'isNeedResetLink', 0)
    }

    this.indicatorTrend.activeIndicator = extendSetting.activeIndicator ? [...extendSetting.activeIndicator] : []
    this.indicatorTrend.filterColumns = extendSetting.filterColumns ? [...extendSetting.filterColumns] : []
  },
  watch: {
    'vscompt.comptData': {
      handler (newVal, oldVal) {
        this.setDefaultOption()
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
    }
  },
  methods: {
    handleSuccResponse ({ respData, params }) {
      if (
        respData.columns !== undefined &&
        respData.columns.length > 0 &&
        respData.columns.indexOf('XXXXCODE') > -1
      ) {
        respData.columns.pop()
      }
      if (respData.rows == null || respData.rows === undefined) {
        respData.rows = []
      }
      if (respData.columns == null || respData.columns === undefined) {
        respData.columns = []
      }
      this.vscompt.comptData = respData
    },
    blockClick (item) {
      this.vscompt.comptAttrs.extendSetting.activeIndicator = [...this.indicatorTrend.activeIndicator]
      if (
        (this.vscompt.comptAttrs['mainLinkageData'] != undefined &&
          this.vscompt.comptAttrs['mainLinkageData'].length > 0) ||
        this.isPageLinkSet
      ) {
        this.setLinkageCondi({
          label: item[this.vscompt.comptData.columns[0]],
          xAxisData: this.xAxisData,
          vscompt: this.vscompt,
          isJumpNewPage: true
        })
        this.linkageState = true
      } else {
        this.gotoPage(this.vscompt.comptAttrs.extendSetting)
      }
    },
    setDefaultOption () {
      let comptData = this.vscompt.comptData
      let extendSetting = this.vscompt.comptAttrs.extendSetting
      if (comptData.columns.length <= 1) {
        return
      }
      extendSetting.activeIndicator = [comptData.columns[1]]
      extendSetting.filterColumns = this.indicatorTrend.filterColumns = comptData.columns.slice(1)
      extendSetting.slidesPerView = this.vscompt.styleAttrs[1].children[0].value = comptData.columns.length - 1 < 4 ? comptData.columns.length - 1 : 4
      this.indicatorTrend.isIndeterminate = false
      this.indicatorTrend.checkAll = true
    },
    changeFilterData () {
      this.vscompt.comptAttrs.extendSetting.filterColumns = [...this.indicatorTrend.filterColumns]
    },
    ...mapActions({
      queryComptData: 'QueryTable/queryComptData',
      setLinkageCondi: 'PageDesign/setLinkageCondi',
      gotoPage: 'PageDesign/gotoPage'
    })
  }
}
</script>
<style lang="scss" scoped>
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
</style>
