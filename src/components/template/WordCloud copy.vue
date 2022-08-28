<template>
  <div style="width:100%;height:100%;">
    <!--词云图组件-->
    <div class="word" style="width:100%;height:100%;"  ref="echartsWord"></div>

    <!--钻取回退部分-->
    <div class="drill-label1" v-show="vscompt.comptAttrs['curDrillIdx']||0 > 0">
      <div
        v-for="(drill, index) in vscompt.comptAttrs['drillWBeanList']"
        :id="index"
        :key="index"
        v-show="index>0"
        class="sub-drill-label"
        @click="toDrillData(index)"
      >
        {{vscompt.comptAttrs['drillWBeanList'] != undefined && vscompt.comptAttrs['drillWBeanList'].length>0 && vscompt.comptAttrs['curDrillIdx']||0 >
        0?vscompt.comptAttrs['drillWBeanList'][index].label:""}}
        <span
          v-show="vscompt.comptAttrs['drillWBeanList'].length>0&&vscompt.comptAttrs['curDrillIdx']||0>0&&vscompt.comptAttrs['drillWBeanList'][index].label!=''"
          class="drill-icon icon-A10018_doubleArrowLeft"
        ></span>
      </div>
    </div>
  </div>
</template>
<script>
import echarts from 'echarts'
import 'echarts-wordcloud/dist/echarts-wordcloud'
import 'echarts-wordcloud/dist/echarts-wordcloud.min'
import { mapState, mapActions, mapGetters } from 'vuex'
import DomSize from '@/utils/domSize.js'
import {
  constructList,
  getRequestParam,
  addPageCondis,
  objDeepCopy,
  getLinkRequestParam,
  dataInterval
} from '../../utils/comonFunc.js'
export default {
  props: ['vscompt'],
  watch: {
    isDSMapReady: {
      immediate: true, // immediate选项可以开启首次赋值监听
      handler (newVal, oldVal) {
        // 钻取设置
        if (this.vscompt.comptAttrs.curDrillIdx == undefined) {
          this.$set(this.vscompt.comptAttrs, 'curDrillIdx', 0)
          this.$set(this.vscompt.comptAttrs, 'drillWBeanList', [])
        }

        if (this.vscompt.comptData == undefined) {
          // 设置数据为空
          this.$set(this.vscompt, 'comptData', {
            columns: [],
            rows: []
          })
          this.$set(this.vscompt.comptAttrs, 'isNeedRestDrill', 0)
        }
        if (
          this.vscompt.serviceId == undefined ||
          this.vscompt.serviceId == ''
        ) {
          this.$set(this.vscompt, 'serviceId', '1') // 给个默认值用于为保存预览时候可以使用
        }
        // 预览、编辑时候使用
        if (newVal && this.vscompt.afId != '') {
          // 查询网关数据
          this.queryData()
        }

        if (this.pageCache.operation == 'preview') { // 数据刷新
          let time = this.vscompt.comptAttrs.extendSetting.timerValue
          dataInterval(time, this.queryData, this.vscompt.comptAttrs.extendSetting)
        }
      }
    },
    'vscompt.comptData': {
      // 监听数据变化
      deep: true,
      handler: function (newVal, oldVal) {
        if (newVal != undefined && newVal != '') {
          this.dataUpdate()
        }
      }
    },
    'vscompt.comptAttrs.linkageCondi': {
      // 监听联动
      // immediate: true,
      deep: true,
      handler (newVal, oldVal) {
        if (this.vscompt.comptAttrs.isLinkage) {
          this.queryLinkData(newVal || [])
        }
      }
    },
    'vscompt.serviceId': {
      // 未保存预览更新
      // 监听数据变化
      immediate: true,
      handler: function (newVal, oldVal) {
        if (this.vscompt.comptData.columns != undefined && this.vscompt.comptData.columns.length > 0) {
          this.dataUpdate()
        }
      }
    },
    'vscompt.comptAttrs.isNeedRestDrill': {
      // 设置钻取监听
      immediate: true,
      handler (newVal, oldVal) {
        if (newVal > 0) {
          this.vscompt.comptAttrs.curDrillIdx = 0
          this.vscompt.comptAttrs.drillWBeanList = []
        }
      }
    },
    'vscompt.styleAttrs': {
      // 监听数据变化
      deep: true,
      handler: function (newVal, oldVal) {
        this.dataUpdate()
      }
    },
    'vscompt.comptAttrs.extendSetting': {
      // 监听数据变化
      deep: true,
      handler: function (newVal, oldVal) {
        this.nickName = this.vscompt.comptAttrs.extendSetting['title.subtext']
        this.dataUpdate()
      }
    }
  },
  data () {
    return {
      worddata: [], // 词云图数据
      chartEvents: {}, // 组件对象
      shapeData: '', // 形状数据
      gridSizeData: '5', // 网格间距数据
      imageData: '', // 背景图片base64编码
      fontN: [10, 40],
      myWordChart: null,
      nickName: ''// 备注
    }
  },
  computed: {
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
    isCanDrill () {
      return this.vscompt.comptAttrs.drillData.length > 1
    },
    xAxisData () {
      let result = []
      if (this.vscompt.comptAttrs.xAxisData.length > 0) {
        result =
          constructList(this.vscompt.comptAttrs.xAxisData, this.datasetMap)
            .resultList || []
      }
      return result
    },
    yAxis1Data () {
      let result = []
      if (this.vscompt.comptAttrs.yAxis1Data.length > 0) {
        result =
          constructList(this.vscompt.comptAttrs.yAxis1Data, this.datasetMap)
            .resultList || []
      }
      return result
    },
    yAxis2Data () {
      let result = []
      if (this.vscompt.comptAttrs.yAxis2Data.length > 0) {
        result =
          constructList(this.vscompt.comptAttrs.yAxis2Data, this.datasetMap)
            .resultList || []
      }
      return result
    },
    drillData () {
      // 钻取属性设置
      let result = []
      if (this.vscompt.comptAttrs.drillData.length > 0) {
        result =
          constructList(this.vscompt.comptAttrs.drillData, this.datasetMap)
            .resultList || []
      }
      return result
    },
    isPageLinkSet () {
      return (
        this.vscompt.comptAttrs['pageLinkageData'] != undefined &&
        this.vscompt.comptAttrs['pageLinkageData'].length > 0
      )
    }
  },
  mounted () {
    if (this.vscompt.afId == '' && this.vscompt.comptData == undefined) {
      // this.$set(this.vscompt, "comptData", {
      //   columns: [],
      //   rows: []
      // });
      this.$set(this.vscompt.comptAttrs, 'isNeedRestDrill', 0)
      this.$set(this.vscompt.comptAttrs, 'isNeedResetLink', 0)
    }
    let that = this
    // 初始化相关数据
    this.$nextTick(() => {
      this.initCharts()// 点击事件(如果使用function(e)函数必须将this定义在外层否则获取不到)
      this.chartEvents.on('click', function (e) {
        // 钻取触发
        if (
          that.isCanDrill &&
          that.vscompt.comptAttrs.curDrillIdx <
            that.vscompt.comptAttrs.drillData.length - 1
        ) {
          if (that.vscompt.comptAttrs.curDrillIdx == 0) {
            that.vscompt.comptAttrs.drillWBeanList = []
            that.vscompt.comptAttrs.drillWBeanList.push({
              item: objDeepCopy(that.vscompt.comptAttrs.xAxisData[0]),
              whereBean: objDeepCopy(that.vscompt.comptAttrs.whereBean),
              label: ''
            })
          }
          that.queryData({ isDownDrill: true, label: e.name })
        }
        // 联动触发
        if (
          that.vscompt.comptAttrs.mainLinkageData.length > 0 ||
          that.isPageLinkSet
        ) {
          that.setLinkageCondi({
            label: e.name,
            xAxisData: that.xAxisData,
            vscompt: that.vscompt,
            isJumpNewPage: true
          })
          that.linkageState = true
        }
      })
    })
    DomSize.bind(this.$refs.echartsWord, () => {
      let myChart2 = this.myWordChart
      let minSize = Math.min(this.$refs.echartsWord.clientWidth, this.$refs.echartsWord.clientHeight)
      this.fontN = [minSize / 36, minSize / 8]
      myChart2.setOption({
        series: {
          sizeRange: this.fontN
        }
      })
      myChart2.resize()
    })
  },
  methods: {
    formateData (oriData) {
      let columns = oriData.columns || []
      let wordCloudData = []
      let rowDatas = oriData.rows || []
      for (let d = 0; d < rowDatas.length; d++) {
        let objData = {}
        objData.name = rowDatas[d][columns[0]] // name值
        objData.value = rowDatas[d][columns[1]] // value值
        wordCloudData.push(objData)
      }
      this.worddata = wordCloudData
    },
    toDrillData (index) {
      this.$set(this.vscompt.comptAttrs, 'curDrillIdx', index)
      this.queryData({ isUpDrill: true })
    },
    queryLinkData (linkageCondi) { // 查询联动数据
      if (this.xAxisData.length === 0 && this.yAxis1Data.length === 0 && this.yAxis2Data.length === 0) {
        return
      }
      let dataType = 1
      let params = getLinkRequestParam({
        linkageCondi: linkageCondi,
        vscompt: this.vscompt,
        xAxisData: this.xAxisData,
        yAxis1Data: this.yAxis1Data,
        yAxis2Data: this.yAxis2Data,
        dataType: dataType
      })
      this.executeReqest(params)
    },
    queryData (param) {
      // 查询网关数据
      let params = getRequestParam({
        param: param,
        vscompt: this.vscompt,
        drillData: this.drillData,
        xAxisData: this.xAxisData,
        yAxis1Data: this.yAxis1Data,
        yAxis2Data: this.yAxis2Data,
        dataType: 1,
        datasetMap: this.datasetMap
      })
      this.executeReqest(params)
    },
    executeReqest (params) {
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
      let _this = this
      this.vscompt.comptAttrs.loading = true
      let computedData = this.vscompt.comptAttrs.computedData || []
      this.queryComptData({ params, computedData })
        .then(function (response) {
          if (response.data.respResult == 1) {
            let comptData = response.data.respData
            if (
              comptData.columns != undefined &&
              comptData.columns.length > 0 &&
              comptData.columns.indexOf('XXXXCODE') > -1
            ) {
              comptData.columns.pop()
            }
            if (comptData.rows == null || comptData.rows == undefined) {
              comptData.rows = []
            }
            if (comptData.columns == null || comptData.columns == undefined) {
              comptData.columns = []
            }
            _this.vscompt.comptData = comptData
          } else {
            _this.$message.error('数据更新失败')
            console.error(response.data.respErrorDesc)
          }
        })
        .catch(function (error) {
          console.error(error)
        })
        .finally(() => {
          _this.vscompt.comptAttrs.loading = false
        })
    },
    dataUpdate () {
      // 监听数据修改时候进行数据更新
      this.formateData(this.vscompt.comptData)
      this.shapeData = this.vscompt.styleAttrs[1].children[0].value
      this.gridSizeData = this.vscompt.styleAttrs[1].children[1].value
      // let url = this.vscompt.styleAttrs[1].children[2].value; //背景图路径
      // if (url != undefined) {
      //   this.convertImgToBase64(url);
      // }
      this.initCharts()
    },
    // 实现将项目的图片转化成base64
    // -----/public/pc/jingyu.jpg
    convertImgToBase64 (url) {
      let image = new Image()
      image.setAttribute('crossOrigin', 'anonymous')
      image.src = url

      // image.onload为异步加载
      image.onload = () => {
        let canvas = document.createElement('canvas')
        canvas.width = image.width
        canvas.height = image.height
        let context = canvas.getContext('2d')
        context.drawImage(image, 0, 0, image.width, image.height)

        let quality = 0.8
        // 这里的dataurl就是base64类型
        let dataURL = canvas.toDataURL('image/jpeg', quality) // 使用toDataUrl将图片转换成jpeg的格式,不要把图片压缩成png，因为压缩成png后base64的字符串可能比不转换前的长！
        this.imageData = dataURL
      }
    },
    initCharts () {
      let _this = this
      if (!this.$refs.echartsWord) return
      this.myWordChart = echarts.init(this.$refs.echartsWord)
      let myChart2 = this.myWordChart
      // let e = document.body.clientWidth;
      this.chartEvents = myChart2
      // if (this.imageData != "") {
      //   let mkImg = new Image();
      //   mkImg.src = this.imageData;
      // } else {
      //   let mkImg = "";
      // }
      let minSize = 300
      if (_this.$refs.echartsWord) {
        minSize = Math.min(_this.$refs.echartsWord.clientWidth, _this.$refs.echartsWord.clientHeight)
      }
      _this.fontN = [minSize / 36, minSize / 8]
      myChart2.setOption({
        tooltip: {
          show: true
        },
        title: {
          //                        text: "热爱祖国",
          x: 'center'
        },
        // backgroundColor: "#fff",
        series: [
          {
            name: this.nickName,
            drawOutOfBound: false,
            type: 'wordCloud', // 类型固定写死
            gridSize: this.gridSizeData, // 网格尺寸
            sizeRange: this.fontN, // 文字字体大小范围
            rotationRange: [-90, 90], // 文本旋转范围，文本将通过rotationStep45在[-90,90]范围内随机旋转
            shape: this.shapeData, // 形状
            maskImage: this.imageData, // 背景图
            textStyle: {
              normal: {
                color: function () {
                  return (
                    'rgb(' +
                    Math.round(Math.random() * 255) +
                    ', ' +
                    Math.round(Math.random() * 255) +
                    ', ' +
                    Math.round(Math.random() * 255) +
                    ')'
                  )
                }
              }
            },
            left: 'center',
            top: 'center',
            right: null,
            bottom: null,
            width: '100%',
            height: '100%',
            data: this.worddata
          }
        ]
      })
      if (this.shapeData === 'cardioid') {
        this.imageData = new Image()
        this.imageData.src = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNi4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IuWbvuWxgl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCINCgkgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDE2IDE2IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAxNiAxNiIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8cGF0aCBkPSJNNy45ODEsMi4yNTRDOC4yNzQsMi4wMTksOC41NCwxLjc3Myw4LjgzNywxLjU3M2MwLjk0OS0wLjY0LDEuOTk5LTAuOSwzLjEzNC0wLjcyN2MxLjU4NiwwLjI0NCwyLjczNSwxLjExOCwzLjQ4MiwyLjUyDQoJYzAuNDA3LDAuNzYyLDAuNTYyLDEuNTg1LDAuNTQ2LDIuNDUzYy0wLjAxNSwwLjgxNi0wLjI2OSwxLjU1Mi0wLjY0NiwyLjI1N2MtMC4zNjIsMC42NzYtMC44MTIsMS4yOTItMS4zLDEuODgyDQoJYy0wLjc2OSwwLjkyOS0xLjYyMSwxLjc3NS0yLjUxMywyLjU4NGMtMC45NjQsMC44NzUtMS45NzgsMS42ODktMy4wMiwyLjQ3MWMtMC4yMjgsMC4xNzEtMC40NzQsMC4yNDctMC43NSwwLjE2Mw0KCWMtMC4xMDQtMC4wMzItMC4yMDgtMC4wODctMC4yOTUtMC4xNTFjLTEuNTA4LTEuMTE4LTIuOTQ2LTIuMzE0LTQuMjY2LTMuNjVDMi40NDMsMTAuNjAzLDEuNzI0LDkuNzksMS4xMTUsOC44ODINCgljLTAuMzcyLTAuNTU3LTAuNjg5LTEuMTQxLTAuOS0xLjc4QzAuMDcxLDYuNjY3LDAuMDIyLDYuMjIxLDAuMDA0LDUuNzY2Qy0wLjA3NywzLjc0MywxLjE1OSwxLjgxNiwzLjA1LDEuMQ0KCWMxLjQyNS0wLjUzOSwyLjc5MS0wLjM3MSw0LjA3OCwwLjQ0M2MwLjI5NSwwLjE4NSwwLjU2MSwwLjQxLDAuODAzLDAuNjYyQzcuOTUyLDIuMjI4LDcuOTc2LDIuMjQ4LDcuOTgxLDIuMjU0Ii8+DQo8L3N2Zz4NCg=='
        this.imageData.onload = () => {
          myChart2.setOption({
            series: {
              shape: '',
              maskImage: _this.imageData
            }
          })
          myChart2.resize()
        }
      } else if (this.shapeData === 'triangle') {
        myChart2.setOption({
          series: {
            top: 20,
            shape: _this.shapeData,
            maskImage: null
          }
        })
      } else {
        myChart2.setOption({
          series: {
            shape: this.shapeData,
            maskImage: null
          }
        })
      }
    },
    ...mapActions({
      queryComptData: 'QueryTable/queryComptData',
      setLinkageCondi: 'PageDesign/setLinkageCondi',
      initLableFormatter: 'PageDesign/initLableFormatter',
      gotoPage: 'PageDesign/gotoPage',
      handleScatterData: 'PageDesign/handleScatterData'
    })
  }
}
</script>

<style lang="scss" scoped>
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

.ring-lable-bt {
  position: absolute;
  color: #00f6ff;
  bottom: 3px;
  width: 100%;
  text-align: center;
}
</style>
