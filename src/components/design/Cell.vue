<template>
  <component
    v-if="vscompt.comptId != undefined && vscompt.type!='Query'"
    :ref="vscompt.comptId"
    :is="component"
    :vscompt="vscompt"
    :tableList="tableList"
    :scaleRatio="scaleRatio"
  />
  <component
    v-else
    :ref="vscompt.comptSort || vscompt.comptId"
    :is="component"
    :vscompt="vscompt.comptAttrs"
    :tableList="tableList"
    :scaleRatio="scaleRatio"
  />
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import ThirdTemplate from '../template/ThirdTemplate'

export default {
  props: ['isDesign', 'vscompt', 'tableList', 'scaleRatio'],
  data () {
    return {
      component: null
    }
  },
  methods: {
    initComptName () {
      var setting = this.vscompt.comptAttrs.extendSetting
      var attr = this.vscompt.comptAttrs
      var name = attr.name + this.vscompt.orderId
      if (setting != null && setting['comptName.text'] == '') {
        setting['comptName.text'] = name
        var style = this.vscompt.styleAttrs[0].children
        for (var item of style) {
          if (item.enName == 'comptName.text') {
            item.value = name
            break
          }
        }
      }
    }
  },
  computed: {
    ...mapState({
      pageCache: state => state.HomeBody.pageCache
    }),
    ...mapGetters({
      activedCompt: 'PageDesign/getActivedCompt'
    }),
    mobileQueryType () {
      let mobileType = ''
      // if(this.activedCompt.type=='MobileQuery'){

      let type = this.vscompt.type
      switch (type) {
        case 'ElDatePicker':
          mobileType = 'CubeDatePicker'
          break
        case 'ElCascader':
          mobileType = 'VanPicker'
          break
        case 'ElInput':
          mobileType = 'VanSearch'
          break
        default:
          mobileType = type
          break
      }
      // }
      return mobileType
    },
    loader () {
      var is_import = this.vscompt.comptAttrs.is_import
      if (!this.vscompt.type) {
        return () => import(`../template/Default`)
      } else if (is_import) {
        return () => import(`../template/ImportField`)
      } else if (
        [
          'VeCombineChart',
          'VeCombineStack',
          'VeHistogram',
          'VeStackHistogram',
          'VePercentStackHistogram',
          'VePie',
          'VeLine',
          'VeLineArea',
          'VeStackLineArea',
          'VePercentStackLineArea',
          'VeRadar',
          'VeBar',
          'VeStackBar',
          'VeGauge',
          'VeRing',
          'VeRosePie',
          'VeScatter',
          'Scatter',
          'VeWordCloud',
          'VeFunnel',
          'VeCompareFunnel',
          'VeSankey',
          'VeWaterfall',
          'VeTreemap',
          'VeWordCloud',
          'VeDoughnutPie',
          'VeTree',
          'VePercentStackBar'
        ].includes(this.vscompt.type)
      ) {
        return () => import(`../template/VeChartTemp`)
      } else if (
        [
          'HdHorizontalLine',
          'HdVerticalLine'
        ].includes(this.vscompt.type)
      ) {
        return () => import(`../template/HdLine`)
      } else if (
        [
          'WordCloud'
        ].includes(this.vscompt.type)
      ) {
        return () => import(`../template/WordCloud`)
      } else if (['VeAreaMap', 'VeLines', 'VeBmap', 'VeLinesBmap', 'VeHeatBmap'].includes(this.vscompt.type)) {
        return () => import(`../template/VeAreaMap`)
      } else {
        let type = this.vscompt.type
        // if(this.activedCompt.type!=null){
        if (this.pageCache.classTypeId == '1001002') {
          type = this.mobileQueryType
        }
        return () => import(`../template/${type}`)
      }
    }
  },
  mounted () {
    // 分析报告 初始化组件名称
    if (this.vscompt.comptId != undefined) {
      this.initComptName()
    }
    if (this.vscompt.comptAttrs.isExtComp === '1') { // 第三方组件
      this.component = ThirdTemplate
    } else {
      this.loader()
        .then(() => {
          this.component = () => this.loader()
        })
        .catch((error) => {
          this.component = () => import(`../template/Default`)
        })
    }
  }
}
</script>
