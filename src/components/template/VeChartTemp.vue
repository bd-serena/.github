<template>
  <div style="width:100%;height:100%;position:relative;z-index:0" ref="echartsWordCloud">
    <ve-histogram
      v-if="vscompt.type=='VeCombineChart' || vscompt.type=='VeHistogram' || vscompt.type=='VeStackHistogram'|| vscompt.type=='VePercentStackHistogram'|| vscompt.type=='VeCombineStack'"
      v-bind="vscompt"
      width="100%"
      height="100%"
      :data="{columns:(vscompt.comptData||{}).columns,rows:(vscompt.comptData||{}).rows}"
      :settings="vscompt.comptAttrs.setting"
      :extend="vscompt.comptAttrs.extendSetting"
      :events="chartEvents"
    ></ve-histogram>
    <ve-bar
      v-if="vscompt.type=='VeBar' || vscompt.type=='VeStackBar' || vscompt.type=='VePercentStackBar'"
      v-bind="vscompt"
      width="100%"
      height="100%"
      :data="{columns:(vscompt.comptData||{}).columns,rows:(vscompt.comptData||{}).rows}"
      :settings="vscompt.comptAttrs.setting"
      :extend="vscompt.comptAttrs.extendSetting"
      :events="chartEvents"
    ></ve-bar>
    <ve-pie
      v-if="vscompt.type=='VePie' || vscompt.type=='VeRosePie'"
      v-bind="vscompt"
      width="100%"
      height="100%"
      :data="{columns:(vscompt.comptData||{}).columns,rows:(vscompt.comptData||{}).rows}"
      :settings="vscompt.comptAttrs.setting"
      :extend="vscompt.comptAttrs.extendSetting"
      :events="chartEvents"
    ></ve-pie>
    <ve-pie
      v-if="vscompt.type==='VeDoughnutPie'"
      v-bind="vscompt"
      width="100%"
      height="100%"
      :data="{columns:(doughnutPieData||{}).columns,rows:(doughnutPieData||{}).rows}"
      :settings="vscompt.comptAttrs.setting"
      :extend="vscompt.comptAttrs.extendSetting"
      :events="chartEvents"
    ></ve-pie>
    <ve-scatter v-if="vscompt.type=='VeScatter' || vscompt.type=='Scatter'"
      v-bind="vscompt"
      width="100%"
      height="100%"
      :data="{columns:(vscompt.comptData||{}).columns||[],rows:(vscompt.comptData||{}).rows||[]}"
      :settings="vscompt.comptAttrs.setting"
      :extend="vscompt.comptAttrs.extendSetting"
      :events="chartEvents"></ve-scatter>
    <ve-ring
      v-if="vscompt.type=='VeRing'"
      v-bind="vscompt"
      width="100%"
      height="100%"
      :data="{columns:(vscompt.comptData||{}).columns,rows:(vscompt.comptData||{}).rows}"
      :settings="vscompt.comptAttrs.setting"
      :extend="vscompt.comptAttrs.extendSetting"
      :events="chartEvents"
    ></ve-ring>
    <ve-line
      v-if="vscompt.type=='VeLine' || vscompt.type=='VeLineArea' || vscompt.type=='VeStackLineArea' || vscompt.type=='VePercentStackLineArea'"
      v-bind="vscompt"
      width="100%"
      height="100%"
      :data="{columns:(vscompt.comptData||{}).columns,rows:(vscompt.comptData||{}).rows}"
      :settings="vscompt.comptAttrs.setting"
      :extend="vscompt.comptAttrs.extendSetting"
      :events="chartEvents"
    ></ve-line>
    <ve-radar
      v-if="vscompt.type=='VeRadar'"
      v-bind="vscompt"
      width="100%"
      height="100%"
      :data="{columns:(vscompt.comptData||{}).columns,rows:radarRows}"
      :settings="vscompt.comptAttrs.setting"
      :extend="vscompt.comptAttrs.extendSetting"
      :events="chartEvents"
    ></ve-radar>

    <ve-gauge
      v-if="vscompt.type=='VeGauge'"
      v-bind="vscompt"
      width="100%"
      height="100%"
      :data="{columns:(vscompt.comptData||{}).columns,rows:(vscompt.comptData||{}).rows}"
      :settings="vscompt.comptAttrs.setting"
      :extend="vscompt.comptAttrs.extendSetting"
      :events="chartEvents"
    ></ve-gauge>
    <ve-wordcloud
      v-if="vscompt.type === 'VeWordCloud'"
      v-bind="vscompt"
      width="100%"
      height="100%"
      :data="{columns:(vscompt.comptData||{}).columns,rows:(vscompt.comptData||{}).rows}"
      :settings="vscompt.comptAttrs.setting"
      :extend="vscompt.comptAttrs.extendSetting"
      :events="chartEvents"
    ></ve-wordcloud>
    <ve-sankey
      v-if="vscompt.type === 'VeSankey'"
      v-bind="vscompt"
      width="100%"
      height="100%"
      :data="{columns:(vscompt.comptData||{}).columns,rows:(vscompt.comptData||{}).rows}"
      :settings="vscompt.comptAttrs.setting"
      :extend="vscompt.comptAttrs.extendSetting"
      :events="chartEvents"
    ></ve-sankey>
    <ve-waterfall
      v-if="vscompt.type === 'VeWaterfall'"
      v-bind="vscompt"
      width="100%"
      height="100%"
      :data="{columns:(vscompt.comptData||{}).columns,rows:(vscompt.comptData||{}).rows}"
      :settings="vscompt.comptAttrs.setting"
      :extend="vscompt.comptAttrs.extendSetting"
      :events="chartEvents"
    ></ve-waterfall>
    <ve-tree
      v-if="vscompt.type === 'VeTree' || vscompt.type === 'VeTreemap'"
      v-bind="vscompt"
      width="100%"
      height="100%"
      :data="vscompt.type === 'VeTreemap'?vscompt.comptAttrs.setting.data:{columns:(vscompt.comptData||{}).columns,rows:(vscompt.comptData||{}).rows}"
      :settings="vscompt.comptAttrs.setting"
      :extend="vscompt.comptAttrs.extendSetting"
      :events="chartEvents"
    ></ve-tree>
    <ve-funnel
      v-if="vscompt.type === 'VeFunnel'"
      :data="{columns:(vscompt.comptData||{}).columns,rows:(vscompt.comptData||{}).rows}"
      :settings="vscompt.comptAttrs.setting"
      :extend="vscompt.comptAttrs.extendSetting"
      :events="chartEvents"
      :after-config="cpFunnelAfterConfig"
      width="100%"
      height="100%"
    ></ve-funnel>
    <!-- 对比漏斗图下拉框 -->
    <div class="cp-funnel-sel-wrap" v-if="vscompt.type === 'VeCompareFunnel'">
      <el-row :gutter="10">
        <el-col :span="12"><div class="grid-content" style="text-align: right;">
          <el-select v-model="leftCpfSelVal" filterable placeholder="请选择" size="mini" style="text-align: right;">
    <el-option
      v-for="item in cpFunnelDimValueArr"
      :key="`left_cp_sel_${item}`"
      :disabled="item===rightCpfSelVal"
      :label="item"
      :value="item">
    </el-option>
  </el-select>
          </div></el-col>
        <el-col :span="12"><div class="grid-content">
          <el-select v-model="rightCpfSelVal" filterable placeholder="请选择" size="mini">
    <el-option
      v-for="item in cpFunnelDimValueArr"
      :key="`right_cp_sel_${item}`"
      :disabled="item===leftCpfSelVal"
      :label="item"
      :value="item">
    </el-option>
  </el-select>
          </div></el-col>
      </el-row>
    </div>
    <div style="position: relative; height: calc(100% - 45px); width: 100%; top: 45px;" @click="cpFunnelClick">
      <ve-funnel
        v-if="vscompt.type === 'VeCompareFunnel'"
        :data="{columns:(vscompt.comptData||{}).columns,rows:(vscompt.comptData||{}).rows}"
        :settings="vscompt.comptAttrs.setting"
        :extend="vscompt.comptAttrs.extendSetting"
        :events="chartEvents"
        :after-config="cpFunnelAfterConfig"
        :key="`${leftCpfSelVal}-${rightCpfSelVal}`"
        width="100%"
        height="100%"
      ></ve-funnel>
    </div>
    <div class="drill-label1" v-show="vscompt.comptAttrs['curDrillIdx']||0 > 0" >
      <!-- {{vscompt.comptAttrs['drillWBeanList'] != undefined && vscompt.comptAttrs['drillWBeanList'].length>0 && vscompt.comptAttrs['curDrillIdx']||0 >
      0?vscompt.comptAttrs['drillWBeanList'][vscompt.comptAttrs['curDrillIdx']||0].label:""}}
      <span
        v-show="vscompt.comptAttrs['drillWBeanList'].length>0&&vscompt.comptAttrs['curDrillIdx']||0>0"
        class="drill-icon icon-A10018_doubleArrowLeft"
      ></span>
      </div> -->
      <!-- <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item v-for="(item,index) in vscompt.comptAttrs['drillWBeanList']"
          :key="item.value">
          <a href="Javascript:void(0)"
            @click="toDrillData(index)">{{item.label}}</a>
        </el-breadcrumb-item>
      </el-breadcrumb> -->
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
    <div
      ref="text"
      v-show="vscompt.type == 'VeRing' && pageCache.classTypeId == '1005' && (vscompt.comptAttrs.extendSetting['anotherName.show'] || vscompt.comptAttrs.extendSetting['anotherName.show'] == undefined)"
      class="ring-lable-bt"
      :style="`color:${vscompt.comptAttrs.extendSetting['anotherName.color']||''};font-size:${vscompt.comptAttrs.extendSetting['anotherName.fontSize']||''}px;`"
    >{{vscompt.comptAttrs.extendSetting['anotherName.text']}}
    </div>
  </div>
</template>

<script>
  import {mapActions, mapMutations, mapGetters, mapState} from "vuex";
  import {addPageCondis, constructList, getLinkRequestParam, getRequestParam, objDeepCopy, toggleClass, dataInterval, formatNumber, loadDataDone, loadDataError} from "../../utils/comonFunc.js";
  import DomSize from '@/utils/domSize.js'

  export default {
    props: ["vscompt"],
    data() {
      return {
        ScaextendSetting:{
        },
        chartData: {
          columns: ['日期', '访问用户', '下单用户', '年龄'],
          rows: [
            { '日期': '1/1', '访问用户': 123, '年龄': 3, '下单用户': 1244 },
            { '日期': '1/2', '访问用户': 1223, '年龄': 6, '下单用户': 2344 },
            { '日期': '1/3', '访问用户': 7123, '年龄': 9, '下单用户': 3245 },
            { '日期': '1/4', '访问用户': 4123, '年龄': 12, '下单用户': 4355 },
            { '日期': '1/5', '访问用户': 3123, '年龄': 15, '下单用户': 4564 },
            { '日期': '1/6', '访问用户': 2323, '年龄': 20, '下单用户': 6537 }
          ]
        },
        radarData: [],
        linkageState: false,
        defaultColor: [
          "#19D4AE",
          "#5AB1EF",
          "#fa6e86",
          "#ffb980",
          "#0067a6",
          "#c4b4e4",
          "#d87a80",
          "#9cbbff",
          "#d9d0c7",
          "#87a997",
          "#d49ea2",
          "#5b4947",
          "#7ba3a8"
        ],
        originColor: {},
        visualMap: [],
        chartEvents: {},
        ligthFlag: false, //用来判断当前是否闪烁
        leftCpfSelVal: '', // 对比漏斗图左侧下拉框选值
        rightCpfSelVal: '' // 对比漏斗图右侧下拉框选值
      };
    },
    created() {
      // 解决初次加载散点图、气泡图、折线图、折线面积图、堆叠面积图时，图形渲染报错 series.type should be specified.
      const setting = this.vscompt.comptAttrs.extendSetting
      if (['VeLine', 'VeScatter','Scatter', 'VeLineArea', 'VeStackLineArea', 'VePercentStackLineArea'].includes(this.vscompt.type) && !setting['series.0.type']) {
        setting['series.0.type'] = setting['series.type']
      }
    },
    mounted() {
      // 漏斗图隐藏图例
      if (['VeFunnel', 'VeCompareFunnel'].includes(this.vscompt.type)) {
        this.$set(this.vscompt.comptAttrs.extendSetting.legend, 'show', false);
        this.vscompt.comptAttrs.extendSetting['grid.bottom'] = 10;
        this.vscompt.comptAttrs.extendSetting['grid.top'] = 10;
      }
      let extSet = this.vscompt.comptAttrs.extendSetting;
      // debugger;
      if (
        this.vscompt.type == "VeRadar" &&
        extSet["legend.formatter"] == undefined &&
        JSON.stringify(
          this.vscompt.comptAttrs.extendSetting["legendData"] || {}
        ) == "{}"
      ) {
        this.$set(this.vscompt.comptAttrs.extendSetting, "legendData", {});
        extSet["legend.formatter"] = this.legendFormatter;
      } else if (
        this.vscompt.type == "VePie" ||
        this.vscompt.type == "VeGauge" ||
        this.vscompt.type == "VeRing" ||
        this.vscompt.type == "VeRosePie" ||
        this.vscompt.type == "VeDoughnutPie"
      ) {
        //饼图和仪表盘初始化时设置小数点
        this.setDecimalDigit();
        if((this.vscompt.type === "VePie" || this.vscompt.type === 'VeRosePie') &&
        this.vscompt.styleAttrs.find((val)=>val.enName === "layoutAttrs").children.find((val)=>val.enName === "tagList") !== undefined &&
        this.vscompt.styleAttrs.find((val)=>val.enName === "layoutAttrs").children.find((val)=>val.enName === "tagList").value === true){
                this.setLegendFormatter();
              }
      }

      if (this.vscompt.comptAttrs.curDrillIdx == undefined) {
        this.$set(this.vscompt.comptAttrs, "curDrillIdx", 0);
        this.$set(this.vscompt.comptAttrs, "drillWBeanList", []);
      }
      if ((this.vscompt.afId == "" && this.vscompt.comptData == undefined) ) {
        this.$set(this.vscompt, "comptData", {
          columns: [],
          rows: []
        });
        // if(this.vscompt.type=scatter)
        this.$set(this.vscompt.comptAttrs, "isNeedRestDrill", 0);
        this.$set(this.vscompt.comptAttrs, "isNeedResetLink", 0);
      }
      // 词云图改变文字颜色
      if (this.vscompt.type === 'VeWordCloud') {
        this.vscompt.comptAttrs.setting.color = function () {
            // Random color
            return 'rgb(' + [
                Math.round(Math.random() * 255),
                Math.round(Math.random() * 255),
                Math.round(Math.random() * 255)
            ].join(',') + ')';
        }
      }
      if (this.vscompt.type === 'VeTreemap') {

        this.vscompt.comptAttrs.extendSetting['tooltip.formatter'] = (params) => {
          let res = this.vscompt.comptData.columns[1] + ': ' + params.data.value + '<br />' + '占比dd: ' + params.data.percent;
          return res;
        }
        let labVal = this.vscompt.comptAttrs.labelFunc;
        this.vscompt.comptAttrs.extendSetting['series.0.label'] = eval('(' + labVal + ')');
      }

      var that = this;
      this.chartEvents = {
        click: function (e) {

          if(that.vscompt.type === 'VeDoughnutPie') {
            if(!that.vscompt.comptAttrs.mainLinkageData || that.vscompt.comptAttrs.mainLinkageData.length == 0 || that.vscompt.comptAttrs.drillData.length == 0){
              that.gotoPage(that.vscompt.comptAttrs.extendSetting);
            }
            if(e.dataIndex===1) {
              return;
            }
          }
          // 没有维度的漏斗图不能进行联动设置
          if (that.vscompt.type === 'VeFunnel' && that.vscompt.comptAttrs.xAxisData.length === 0) {
            return;
          }
          console.log(e);
          //雷达图，禁用series的点击事件
          if (e.seriesType == "radar" && e.componentType == "series") {
            return;
          }
          let label = e.name
          // 对比漏斗图点击联动时，取对应一侧的下拉框值（seriesIndex=3-右侧，seriesIndex=0-左侧）
          if (that.vscompt.type === 'VeCompareFunnel') {
            label = e.seriesIndex === 3 ? that.rightCpfSelVal : that.leftCpfSelVal;
          }

          if (
            that.isCanDrill &&
            that.vscompt.comptAttrs.curDrillIdx <
            that.vscompt.comptAttrs.drillData.length - 1
          ) {
            if (that.vscompt.comptAttrs.curDrillIdx == 0) {
              that.vscompt.comptAttrs.drillWBeanList = [];
              that.vscompt.comptAttrs.drillWBeanList.push({
                item: objDeepCopy(that.vscompt.comptAttrs.xAxisData[0]),
                whereBean: objDeepCopy(that.vscompt.comptAttrs.whereBean),
                label: ""
              });
            }
            that.queryData({isDownDrill: true, label: label});
          }
          if (
            that.vscompt.comptAttrs.mainLinkageData.length > 0 ||
            that.isPageLinkSet
          ) {
            // 桑基图点中连线不进行联动
            if (that.vscompt.type === 'VeSankey') {
              if (e.name.indexOf('>') >= 0) {
                that.$message.warning("请点击节点查看联动");
                return;
              }
            }
            that.setLinkageCondi({
              label: label,
              xAxisData: that.xAxisData,
              vscompt: that.vscompt,
              isJumpNewPage: true
            });
            that.linkageState = true;
          }
        }
      };

      if (this.pageCache.classTypeId == "1005") {
        //大屏页面
        this.$set(
          this.vscompt.comptAttrs.extendSetting,
          "legend.textStyle.color",
          "#fff"
        );
        this.$set(
          this.vscompt.comptAttrs.extendSetting,
          "title.textStyle.color",
          "#fff"
        );
        if (this.vscompt.type !== "VePie" && this.vscompt.type !== "VeRadar" && this.vscompt.type !== "VeRosePie") {
          this.$set(
            this.vscompt.comptAttrs.extendSetting,
            "xAxis.0.axisLine.lineStyle.color",
            "#8A9DC8"
          );
          this.$set(
            this.vscompt.comptAttrs.extendSetting,
            "yAxis.0.axisLine.lineStyle.color",
            "#8A9DC8"
          );
          this.$set(
            this.vscompt.comptAttrs.extendSetting,
            "xAxis.0.axisLabel.color",
            "#fff"
          );
          this.$set(
            this.vscompt.comptAttrs.extendSetting,
            "yAxis.0.axisLabel.color",
            "#fff"
          );
        }

        //散点图y轴就一个没有0
        if (['VeScatter', 'Scatter'].includes(this.vscompt.type)) {
          this.$set(
            this.vscompt.comptAttrs.extendSetting,
            "yAxis.axisLine.lineStyle.color",
            "#8A9DC8"
          );
          this.$set(
            this.vscompt.comptAttrs.extendSetting,
            "yAxis.axisLabel.color",
            "#fff"
          );
        }

        if (
          this.vscompt.type == "VeCombineChart" ||
          this.vscompt.type == "VeCombineStack" ||
          this.vscompt.type == "VeHistogram"
        ) {
          this.$set(
            this.vscompt.comptAttrs.extendSetting,
            "yAxis.1.axisLine.lineStyle.color",
            "#8A9DC8"
          );

          this.$set(
            this.vscompt.comptAttrs.extendSetting,
            "yAxis.1.axisLabel.color",
            "#fff"
          );
        }
        if (this.vscompt.type == "VeRing") {
          this.lightText();
        }
      }
      //图形空白处点击事件
      let myChart = this.$children[0].echarts;
      if (myChart && typeof myChart.getZr === 'function') {
        myChart.getZr().on('click', params => {
          let pointInPixel = [params.offsetX, params.offsetY];
          // 漏斗图要加判断，前面的条件不符合
          if ((!params.tartget && !params.topTarget) || myChart.containPixel("series", pointInPixel) || ['VeFunnel', 'VeCompareFunnel'].includes(this.vscompt.type)) {
            if(!this.vscompt.comptAttrs.mainLinkageData||this.vscompt.comptAttrs.mainLinkageData.length == 0||this.vscompt.comptAttrs.drillData.length == 0){
              this.gotoPage(this.vscompt.comptAttrs.extendSetting);
            }
          }
        })
      }

      // 监听dom变化，改变字体（词云图）
      if (this.vscompt.type === 'VeWordCloud') {
        DomSize.bind(this.$refs.echartsWordCloud, () => {
          if (that.activedCompt.comptId !== that.vscompt.comptId) return
          that.vscompt.type = ''
          let minSize = Math.min(that.$refs.echartsWordCloud.clientWidth, that.$refs.echartsWordCloud.clientHeight)
          minSize = minSize > 480 ? 480 : minSize
          if (that.pageCache.layoutType) {
            minSize = minSize > 360 ? 360 : minSize
          }
          that.vscompt.comptAttrs.extendSetting['series.0.sizeRange'] = [minSize / 20, minSize / 6]
          setTimeout(() => {
            if (that.activedCompt.comptId !== that.vscompt.comptId) return
            that.vscompt.type = 'VeWordCloud'
          }, 500)
        })
      }
      if(this.pageCache.static){
        this.queryData();
      }
      if (['VeFunnel', 'VeCompareFunnel'].includes(this.vscompt.type)) {
        this.vscompt.comptAttrs.setting.label.formatter = this.funnelLabelFormatFunc;
      }
    },
    computed: {
      doughnutPieData(){
        let levels = [];
        let rebuildRows = [];
        let total = 0;
        let columns = this.vscompt.comptData.columns;
        let rows = this.vscompt.comptData.rows;
        if(columns.length>0&&rows.length>0){
          rows.sort((a, b) => {
            return b[columns[1]] - a[columns[1]];
          });
          rows.forEach((item, index) => {
            total += Number(item[columns[1]]);
          });
          rows.forEach( item => {
            let newItem = {};
            newItem[columns[0]] = item[columns[0]] + '_clone';
            newItem[columns[1]] = total - item[columns[1]];
            rebuildRows.push(newItem);
            levels.push([item[columns[0]],newItem[columns[0]]]);
          });
          this.vscompt.comptAttrs.setting.level = levels;
        }
        return {
          columns: columns,
          rows: [...rows,...rebuildRows]
        }
      },
      ...mapState({
        isDSMapReady: state => state.AnalyReportAttr.isDSMapReady,
        datasetMap: state => state.AnalyReportAttr.datasetMap,
        pageCache: state => state.HomeBody.pageCache,
        linkStack: state => state.PageDesign.linkStack
      }),
      ...mapGetters({
        activedCompt: 'PageDesign/getActivedCompt',
        getPageParams: "PageDesign/getPageParams",
        getQueryCompts: "PageDesign/getQueryCompts"
      }),
      dataType() {
        let dataType = 1;
        if (this.vscompt.type == "VeRadar") {
          dataType = 4;
        } else if (this.vscompt.type == "VeGauge") {
          dataType = 5;
        } else if (this.vscompt.type == "VeRing") {
          dataType = 7;
        } else if (this.vscompt.type === 'VeSankey') {
          dataType = 9;
        } else if (this.vscompt.type === 'VeFunnel' || this.vscompt.type === 'VeCompareFunnel') {
          dataType = 8;
        } else if (this.vscompt.type === 'VeTree') {
          dataType = '10';
        }
        return dataType;
      },
      isCanDrill() {
        return this.vscompt.comptAttrs.drillData.length > 1;
      },
      xAxisData() {
        var result = [];
        if (this.vscompt.comptAttrs.xAxisData.length > 0) {
          result =
            constructList(this.vscompt.comptAttrs.xAxisData, this.datasetMap, this.vscompt.comptAttrs.computedData || [])
              .resultList || [];
        }
        return result;
      },
      yAxis1Data() {
        var result = [];
        if (this.vscompt.comptAttrs.yAxis1Data.length > 0) {
          result =
            constructList(this.vscompt.comptAttrs.yAxis1Data, this.datasetMap, this.vscompt.comptAttrs.computedData || [])
              .resultList || [];
        }
        return result;
      },
      yAxis2Data() {
        var result = [];
        if (this.vscompt.comptAttrs.yAxis2Data.length > 0) {
          result =
            constructList(this.vscompt.comptAttrs.yAxis2Data, this.datasetMap, this.vscompt.comptAttrs.computedData || [])
              .resultList || [];
        }
        return result;
      },
      drillData() {
        var result = [];
        if (this.vscompt.comptAttrs.drillData.length > 0) {
          result =
            constructList(this.vscompt.comptAttrs.drillData, this.datasetMap, this.vscompt.comptAttrs.computedData || [])
              .resultList || [];
        }
        return result;
      },
      isPageLinkSet() {
        return (
          this.vscompt.comptAttrs["pageLinkageData"] != undefined &&
          this.vscompt.comptAttrs["pageLinkageData"].length > 0
        );
      },
      legendData1() {
        return this.vscompt.comptAttrs.extendSetting["legendData"] || {};
      },
      radarRows() {
        let legendData =
          this.vscompt.comptAttrs.extendSetting["legendData"] || {};
        let oriRows = objDeepCopy((this.vscompt.comptData || {}).rows || []);
        if (this.vscompt.type == "VeRadar") {
          // let oriRows = objDeepCopy((this.vscompt.comptData || {}).rows || []);

          //---设置最大值begin---
          let largeNumber = 0; //最大值
          for (let i = 0; i < oriRows.length; i++) {
            let obj = oriRows[i];
            for (let item in obj) {
              if (
                item != "type" &&
                parseFloat(oriRows[i][item]) > parseFloat(largeNumber)
              ) {
                largeNumber = oriRows[i][item];
              }
            }
          }

          let indicatorArray = [];
          if (oriRows.length > 0) {
            let obj = oriRows[0];
            for (let item in obj) {
              if (item != "type") {
                indicatorArray.push({
                  text: item,
                  max: largeNumber
                });
              }
            }
          }
          this.$set(this.vscompt.comptAttrs.extendSetting, "radar", {
            indicator: indicatorArray
          });
          //---设置最大值end---

          if (oriRows.length > 0 && JSON.stringify(legendData) != "{}") {
            for (const key in legendData) {
              for (let i = 0; i < oriRows.length; i++) {
                if (oriRows[i].type == key) {
                  for (const key2 in oriRows[i]) {
                    if (key2 != "type") {
                      //设置弹出标签小数点位数
                      oriRows[i][key2] = parseFloat(oriRows[i][key2]).toFixed(
                        parseInt(legendData[key].dot)
                      );
                    } else {
                      //设置弹出标签别名
                      oriRows[i][key2] = legendData[key].name;
                    }
                  }
                }
              }
            }
          }

          //剔除type==XXXXCODE的元素
          oriRows = oriRows.filter(function (oriRow) {
            return oriRow.type != "XXXXCODE";
          });
          return oriRows;
        }
      },
      // 对比漏斗图维值数组
      cpFunnelDimValueArr() {
        if (this.vscompt.type !== 'VeCompareFunnel') {
          return [];
        }
        const {
          columns,
          rows
        } = this.vscompt.comptData || {};
        let arr = [];
        if ((rows || []).length === 0 || (columns || []).length === 0) {
          return arr;
        }
        const dimName = columns[0];
        for(let i = 0; i < (rows || []).length; i++){
          const val1 = rows[i][dimName];
          if (!arr.includes(val1)) {
            arr.push(val1);
          }
        }
        return arr;
      },
      // 对比漏斗图左右侧数据
      cpFunnelLeftData() {
        if (this.vscompt.type !== 'VeCompareFunnel') {
          return [];
        }
        if (this.cpFunnelDimValueArr.includes(this.leftCpfSelVal)) {
          return this.getCpFunnelDataByDimVal(this.leftCpfSelVal);
        } else {
          return [];
        }
      },
      cpFunnelRightData() {
        if (this.vscompt.type !== 'VeCompareFunnel') {
          return [];
        }
        if (this.cpFunnelDimValueArr.includes(this.rightCpfSelVal)) {
          return this.getCpFunnelDataByDimVal(this.rightCpfSelVal);
        } else {
          return [];
        }
      }
    },
    watch: {
      isDSMapReady: {
        immediate: true, // immediate选项可以开启首次赋值监听
        handler(newVal, oldVal) {
          if (this.vscompt.comptAttrs.curDrillIdx == undefined) {
            this.$set(this.vscompt.comptAttrs, "curDrillIdx", 0);
            this.$set(this.vscompt.comptAttrs, "drillWBeanList", []);
          }
          if (this.vscompt.comptData == undefined) {
            this.$set(this.vscompt, "comptData", {
              columns: [],
              rows: []
            });
            this.$set(this.vscompt.comptAttrs, "isNeedRestDrill", 0);
          }

          if (
            newVal &&
            this.vscompt.afId != "" &&
            this.vscompt.comptData.columns.length == 0
          ) {
            if (this.linkStack.length > 0 && this.vscompt.comptAttrs.isLinkage) {
              let param = [];
              for (let item of this.linkStack) {
                if (item.comptId == this.vscompt.comptId) {
                  param = item.param;
                  break;
                }
              }
              if (param.length > 0) {
                this.queryLinkData(param);
              } else {
                this.queryData();
              }
            } else {
              this.queryData();
            }
          }

          if (this.pageCache.operation == "preview"){ //数据刷新
            let time=this.vscompt.comptAttrs.extendSetting.timerValue;
            dataInterval(time,this.queryData,this.vscompt.comptAttrs.extendSetting);
          } else {
            if (this.vscompt.comptAttrs.xAxisData && this.vscompt.comptAttrs.xAxisData.length > 0) {
              let xAxisData = constructList(this.vscompt.comptAttrs.xAxisData, this.datasetMap, this.vscompt.comptAttrs.computedData || []).resultList || [];
              this.xAxisFormate(xAxisData);
            }
            if (this.vscompt.comptAttrs.yAxis1Data && this.vscompt.comptAttrs.yAxis1Data.length > 0) {
              let yAxis1Data = constructList(this.vscompt.comptAttrs.yAxis1Data, this.datasetMap, this.vscompt.comptAttrs.computedData || []).resultList || [];
              this.yAxisFormate(yAxis1Data, 0);
            }
            if (this.vscompt.comptAttrs.yAxis2Data && this.vscompt.comptAttrs.yAxis2Data.length > 0) {
              let yAxis2Data = constructList(this.vscompt.comptAttrs.yAxis2Data, this.datasetMap, this.vscompt.comptAttrs.computedData || []).resultList || [];
              this.yAxisFormate(yAxis2Data, 1);
            }
          }
        }
      },
      "vscompt.comptAttrs.isNeedRestDrill": {
        immediate: true,
        handler(newVal, oldVal) {
          if (newVal > 0) {
            this.vscompt.comptAttrs.curDrillIdx = 0;
            this.vscompt.comptAttrs.drillWBeanList = [];
          }
        }
      },
      "vscompt.comptAttrs.linkageCondi": {
        //监听联动
        // immediate: true,
        deep: true,
        handler(newVal, oldVal) {
          if (this.vscompt.comptAttrs.isLinkage) {
            this.queryLinkData(newVal || []);
          }
        }
      },
      "vscompt.comptAttrs.extendSetting.legendData": {
        // immediate: true,
        deep: true,
        handler(newVal, oldVal) {
          if (this.vscompt.type == "VeRadar") {
            // this.radarRows;
          }
        }
      },
      "vscompt.comptAttrs.isNeedResetLink": {
        deep: true,
        handler(newVal, oldVal) {
          if (
            newVal > 0 &&
            this.vscompt.comptAttrs["mainLinkageData"].length > 0 &&
            this.linkageState
          ) {
            this.resetLinage();
          }
        }
      },

      "vscompt.comptAttrs.warnData": {
        handler(newVal, oldVal) {
          if (
            this.vscompt.comptAttrs.warnData != undefined &&
            this.vscompt.comptAttrs.warnData instanceof Array &&
            this.vscompt.comptAttrs.warnData.length != 0
          ) {
            if (
              this.vscompt.type == "VeRing" ||
              this.vscompt.type == "VePie" ||
              this.vscompt.type == "VeRadar"
            ) {
              //比率环形图预警是文本闪烁
              this.lightText();
            } else {
              var arr = this.vscompt.comptAttrs.warnData[0].rule || [];

              //相同的key合并
              var map = {};
              let param = [];
              arr.forEach(element => {
                if (map.hasOwnProperty(element.col)) {
                  param = map[element.col];
                  param.push(element);
                } else {
                  param = [];
                  param.push(element);
                }
                map[element.col] = param;
              });
              var keys = Object.keys(map); // 返回所有的Key
              var isInit = false;
              this.originColor = {};
              for (let i = 0; i < arr.length; i++) {
                //已经设置好颜色了
                if (
                  this.vscompt.comptAttrs.extendSetting[
                  "series." + arr[i].col + ".itemStyle.normal.color"
                    ] !== "" &&
                  this.vscompt.comptAttrs.isSetColor[
                  "series." + arr[i].col + ".itemStyle.normal.color"
                    ]
                ) {
                  this.originColor[
                    arr[i].col
                    ] = this.vscompt.comptAttrs.extendSetting[
                  "series." + arr[i].col + ".itemStyle.normal.color"
                    ];
                } else {
                  this.originColor[arr[i].col] = "";
                }
              }
              for (let i = 0; i < keys.length; i++) {
                var effect = this.vscompt.comptAttrs.warnData[0].type || [];
                var ind = parseInt(keys[i]) + 1;
                var chartKey = this.vscompt.comptData.columns[ind];
                if (i == 0) {
                  isInit = true;
                } else {
                  isInit = false;
                }
                if (effect.length != 0) {
                  this.light2(
                    this.vscompt.type,
                    map[keys[i]],
                    parseInt(keys[i]),
                    chartKey,
                    isInit
                  );
                } else {
                  this.vscompt.comptAttrs.extendSetting["visualMap"] = [];
                }
              }
            }
          }
        },
        immediate: true
      },
      "vscompt.comptData.rows": {
        handler(newVal, oldVal) {
          if (
            (newVal || []).length > 0 &&
            (this.vscompt.type == "VeRing" ||
              this.vscompt.type == "VePie" ||
              this.vscompt.type == "VeRadar")
          ) {
            this.lightText();
          }
        }
      },
      "vscompt.comptAttrs.isLinearGradient": {
        handler(newVal, oldVal) {
          if(this.vscompt.type == "VeGauge"){
            if(this.vscompt.comptAttrs.isLinearGradient){
              let linearcolorArr = this.vscompt.comptAttrs.linearcolorArr;
              this.vscompt.comptAttrs.extendSetting['series.0.axisLine.lineStyle.color'] = [[1, new this.$echarts.graphic.LinearGradient(0, 0, 1, 0,linearcolorArr)]];
            }else{
              let colorArr = this.vscompt.comptAttrs.colorArr;
              this.vscompt.comptAttrs.extendSetting['series.0.axisLine.lineStyle.color'] = colorArr;
            }
          }
        }
      },
      "vscompt.comptData": {
        handler(newVal, oldVal) {
          
          newVal = newVal || []
          if(this.vscompt.type == "VeDoughnutPie") {
            this.setDoughnutPieSeries(newVal, oldVal);
          }
          if(this.vscompt.type === "VeBar" || this.vscompt.type === "VeStackBar") {
            let datasetMap = this.datasetMap;
            let xAxisData = this.vscompt.comptAttrs.xAxisData;
            let yAxisData = this.vscompt.comptAttrs.yAxis1Data.concat(this.vscompt.comptAttrs.yAxis2Data || []);
            let xAxisData_result = constructList(xAxisData, datasetMap, this.vscompt.comptAttrs.computedData || []).resultList || [];
            let yAxisData_result= constructList(yAxisData, datasetMap, this.vscompt.comptAttrs.computedData || []).resultList || [];
            this.xAxisFormate(yAxisData_result);
            this.yAxisFormate(xAxisData_result, 0);
          } else {
            this.xAxisFormate(this.xAxisData);
            this.yAxisFormate(this.yAxis1Data, 0);
            if(this.yAxis2Data.length > 0){
              this.yAxisFormate(this.yAxis2Data, 1);
            }
          }
          if(["VeRing", "VePie", "VeRosePie", "VeGauge", "VeDoughnutPie"].includes(this.vscompt.type) ){
              this.setDecimalDigit();
              //标签列表被勾中
              if((this.vscompt.type === "VePie" || this.vscompt.type === 'VeRosePie' || this.vscompt.type === 'VeDoughnutPie') &&
              this.vscompt.styleAttrs.find((val)=>val.enName === "layoutAttrs").children.find((val)=>val.enName === "tagList") !== undefined && this.vscompt.styleAttrs.find((val)=>val.enName === "layoutAttrs").children.find((val)=>val.enName === "tagList").value === true){
                this.setLegendFormatter();
              }
          }
          if (['VeScatter','Scatter'].includes(this.vscompt.type)) {
            let xTitle = newVal.columns[0]
            let yTitle = newVal.columns[1]
            let data = this.vscompt.comptAttrs.yAxis1Data
            for (let item of data) {
              if (item.nick_name === xTitle) {
                let elmid = item.element_id
                let name = (this.vscompt.comptAttrs.colSetting[elmid]||{}).comptData
                if (name === xTitle) {
                  xTitle = this.vscompt.comptAttrs.colSetting[elmid]['series.index.name'] || xTitle
                }
              }
              if (item.nick_name === yTitle) {
                let elmid = item.element_id
                let name = (this.vscompt.comptAttrs.colSetting[elmid]||{}).comptData
                if (name === yTitle) {
                  yTitle = this.vscompt.comptAttrs.colSetting[elmid]['series.index.name'] || yTitle
                }
              }
            }
            if (this.vscompt.styleAttrs[2].children[0].value === true) {
              this.vscompt.comptAttrs.extendSetting['xAxis.0.name'] = xTitle
              this.vscompt.comptAttrs.extendSetting['yAxis.name'] = yTitle
            }
          }
          if (['VePercentStackLineArea', 'VePercentStackHistogram','VePercentStackBar'].includes(this.vscompt.type)) {
            newVal.rows.map(row => {
              let newColumns = newVal.columns;
              let total = 0;
              newColumns.forEach((newcol, index) => { // 计算分母
                if (index > 0) {
                  total += +row[newcol];
                }
              });
              newColumns.forEach((newcol, index) => { // 计算占比值
                if (index > 0) {
                  let rowOld = +row[newcol];
                  row[newcol] = ((rowOld / total) * 100).toFixed(2);
                }
              });
              return row;
            })
            // 获取排序信息
            let sortData = this.vscompt.comptAttrs.yAxis1Data.find(ydata => {
              return ydata.sort;
            })
            if (sortData) {
              let name = sortData.nick_name;
              newVal.rows.sort((a, b) => {
                return sortData.sort === 1 ? a[name] - b[name] : b[name] - a[name];
              });
            }
          }
          if (['VeSankey'].includes(this.vscompt.type)) {
            this.vscompt.comptAttrs.setting.links = newVal.links;
          }
        
          if (['VeTreemap'].includes(this.vscompt.type)) {
            let changeVal = objDeepCopy(newVal);
            let xTitle = changeVal.columns[0];
            let yTitle = changeVal.columns[1];
            // 计算分母
            let newRows = changeVal.rows;
            let total = 0;
            newRows.forEach((newrow) => {
              total += +newrow[yTitle];
            });
            let rowOld = changeVal.rows.map(item => {
              let ret = {
                name: item[xTitle],
                value: item[yTitle],
                percent: (item[yTitle] / total * 100).toFixed(2) + '%'
              };
              return ret;
            })
            
            let rowNew = {};
            rowNew[xTitle] = xTitle;
            rowNew[yTitle] = rowOld;
            changeVal.rows = [rowNew];
             this.vscompt.comptAttrs.setting.data = changeVal
           
          }
        }
      },
      // 不用immediate,内部预览不会触发左右下拉框的设值
      cpFunnelDimValueArr: {
        immediate: true,
        handler(newVal) {
          this.leftCpfSelVal = newVal[0] || '';
          this.rightCpfSelVal = newVal[1] || '';
        }
      },
      // 切换更新下拉框选值时，重置联动条件
      leftCpfSelVal(newVal) {
        this.switchLinkage(newVal);
      },
      rightCpfSelVal(newVal) {
        this.switchLinkage(newVal);
      }
    },
    methods: {
      // 对比漏斗图 下拉框切换 如果当前处于联动，则切换联动条件
      switchLinkage(label) {
        if (!this.linkageState || this.vscompt.comptAttrs.mainLinkageData.length === 0) {
          return;
        }
        this.setLinkageCondi({
              label: label,
              xAxisData: this.xAxisData,
              vscompt: this.vscompt,
              isJumpNewPage: true
            });
            this.linkageState = true;
      },
      // 漏斗图内部标签展示格式化方法
      funnelLabelFmatFunc({ rows, columns, labelParamsData }) {
        const { labelFormatType } = this.vscompt.comptAttrs.extendSetting;
        let { name, realValue } = labelParamsData;
        if (realValue === undefined) {
          realValue = labelParamsData.value;
        }
        realValue = Number(realValue);
        let targetLabel = '';
        const measure = realValue;
        const [dimName, measureName] = columns;
        let firLevelVal = Number(rows[0][measureName]);
        const dataIndex = rows.findIndex(rowItem => rowItem[dimName] === name);
        let prevLevelVal = Number(rows[dataIndex === 0? 0: (dataIndex - 1)][measureName]) || 0;
        if (firLevelVal === 0) { // 分母不能为0
          firLevelVal = 1;
        }
        if (prevLevelVal === 0) { // 分母不能为0
          prevLevelVal = 1;
        }
        // 占上一层百分比
        const prevLevelPercent = dataIndex === 0 ? '100.00%' : (realValue/prevLevelVal*100).toFixed(2) + '%';
        // 占第一层百分比
        const firstLevelPercent = dataIndex === 0 ? '100.00%' : (realValue/firLevelVal*100).toFixed(2) + '%';
        targetLabel = labelFormatType.replace('measureVal', measure).replace('measure', name).replace('prevLevelPercent', prevLevelPercent).replace('firstLevelPercent', firstLevelPercent).replace('close', '');
        return targetLabel;
      },
      // 漏斗图标签样式格式化
      funnelLabelFormatFunc({ data }) {
        const { rows, columns } = this.vscompt.comptData;
        return this.funnelLabelFmatFunc({
          rows,
          columns,
          labelParamsData: data
        });
      },
      // 对比漏斗图内容标签样式格式化
      cpFunnelLabelInsideFormat({ seriesIndex, data }) {
        // seriesIndex=0:左边  seriesIndex=1:右边
        const arrData = seriesIndex%2 === 0 ? this.cpFunnelLeftData : this.cpFunnelRightData;
        return this.funnelLabelFmatFunc({
          rows: arrData,
          columns: ['name', 'value'],
          labelParamsData: data
        });
      },
      // 对比漏斗图内容外侧标签样式格式化 只需要显示图例内容
      cpFunnelLabelOutsideFormat({ data }) {
        return data.name;
      },
      // 根据维值构造这个维值一侧的漏斗图数据
      getCpFunnelDataByDimVal(curDimValue) {
          const {
          columns,
          rows
        } = this.vscompt.comptData;
        const dimName = columns[0];
        const oriRows = rows.filter(item => item[dimName] === curDimValue);
        let newRows = [];
        for (let index = 0; index < oriRows.length; index++) {
          const rowItem1 = oriRows[index];
          for (const key in rowItem1) {
            if (rowItem1.hasOwnProperty(key) && ![dimName, 'XXXXCODE'].includes(key)) {
              const element = rowItem1[key];
              newRows.push({
                name: key,
                value: element
              });
            }
          }
        }
        return newRows;
      },
      cpFunnelAfterConfig(options) {
        let leftData = this.cpFunnelLeftData;
        let rightData = this.cpFunnelRightData;
        const { extendSetting, setting } = this.vscompt.comptAttrs;
        const FUNNEL_HEIGHT = '88%';
        const FUNNEL_TOP = '10%';
        const commonSet = {
          height: FUNNEL_HEIGHT,
          top: FUNNEL_TOP,
          tooltip: {
            show: false
          }
        };
        if (this.vscompt.type === 'VeCompareFunnel') {
          const legendData = leftData.map(item => item.name);
          options.legend.data = legendData;
          const labelShow = options.series.label.show === undefined ? true : options.series.label.show;
          const labelAtLeft = options.series.label.position === 'left';
          // 只找到label可以设置标签的，所以弄了series弄了两套数据，一套label显示在外侧，当作标签，一套标签在内容里面
          const series = [
            {
                name: '漏斗图',
                sort: 'none',
                type: 'funnel',
                width: '44%',
                left: '5%',
                funnelAlign: 'right',
                label: {
                    show: labelShow && labelAtLeft,
                    position: 'left',
                    formatter: this.cpFunnelLabelOutsideFormat
                },
                center: ['25%', '25%'],  // for pie
                data: leftData
            },
            {
                name: '漏斗图',
                sort: 'none',
                type: 'funnel',
                width: '44%',
                left: '50%',
                funnelAlign: 'left',
                label: {
                    show: labelShow && !labelAtLeft,
                    position: 'right',
                    formatter: this.cpFunnelLabelOutsideFormat
                },
                center: ['75%', '25%'],  // for pie
                data: rightData
            },
            {
                name: '漏斗图',
                sort: 'none',
                type: 'funnel',
                width: '44%',
                left: '5%',
                funnelAlign: 'right',
                label: {
                    show: extendSetting.labelFormatType==='close'? false : true,
                    position: 'inside',
                    formatter: this.cpFunnelLabelInsideFormat
                },
                center: ['25%', '25%'],  // for pie
                data: leftData
            },
            {
                name: '漏斗图',
                sort: 'none',
                type: 'funnel',
                width: '44%',
                left: '50%',
                funnelAlign: 'left',
                label: {
                    show: extendSetting.labelFormatType==='close'? false : true,
                    position: 'inside',
                    formatter: this.cpFunnelLabelInsideFormat
                },
                center: ['75%', '25%'],  // for pie
                data: rightData
            }
        ];
        series.forEach((item, index) => {
          series[index] = {
            ...commonSet,
            ...item
          }
        })
        options.series = series;
        } else {
          const { position, show } = setting.label;
          const oriSeries1 = {
            ...options.series,
            ...commonSet,
            ...{
              label: {
                show,
                position,
                formatter: this.cpFunnelLabelOutsideFormat
              },
              legend: {
                show: false
              }
              // height: FUNNEL_HEIGHT,
              // top: FUNNEL_TOP
            }
          };
          const oriSeries2 = {
            ...options.series,
            ...commonSet,
            ...{
              label: {
                show: extendSetting.labelFormatType==='close'? false : true,
                position: 'inside',
                formatter: this.funnelLabelFormatFunc
              },
              legend: {
                show: false
              }
              // height: FUNNEL_HEIGHT,
              // top: FUNNEL_TOP
            }
          }
          options.series = [oriSeries1, oriSeries2];
        }
        options.title['top'] = -10;
        return options;
      },
      lightText() {
        var effect = this.vscompt.comptAttrs.warnData[0].type || [];
        if (
          effect.length != 0 &&
          this.vscompt.comptData.rows.length > 0 &&
          this.vscompt.comptData.columns.length > 0
        ) {
          var arr = this.vscompt.comptAttrs.warnData[0].rule || [];
          //相同的key合并
          var map = {};
          let param = [];
          arr.forEach(element => {
            if (map.hasOwnProperty(element.col)) {
              param = map[element.col];
              param.push(element);
            } else {
              param = [];
              param.push(element);
            }
            map[element.col] = param;
          });
          var keys = Object.keys(map); // 返回所有的Key
          var array = map[keys[0]]; //比率环形图只有一个度量字段，所以只有1个key

          // let comptData = objDeepCopy(this.vscompt);
          //预警判断符号对应的值
          let condi = [
            {value: 2, label: ">"},
            {value: 1, label: "<"},
            {value: 3, label: "="},
            {value: 4, label: "<="},
            {value: 5, label: ">="}
          ];

          var condiMap = {};
          condi.forEach(element => {
            condiMap[element.value] = element;
          });
          if (this.vscompt.type == "VeRing") {
            let dataVal = this.vscompt.comptData.rows[0][this.vscompt.comptData.columns[1]] * 100; //比率环形图的值
            let isLight = false; //用来标记是否
            for (var i = 0; i < array.length; i++) {
              let label = condiMap[array[i].rele].label;
              let test = "" + dataVal + label + array[i].val; //比率环形图的值+判断符号+预警值，拼接成字符串表达式
              if (!isLight) {
                //只要有表达式是true，则isLight都为true
                isLight = eval("(" + test + ")");
              }
            }
            if (isLight && !this.ligthFlag) {
              //数据符合预警设置，如果当前没设置闪烁，则设置闪烁；如果已经设置过闪烁了，就不再设置闪烁
              toggleClass(this.$refs.text, "animate-warning"); //执行第一次打开闪烁，第二次关闭闪烁
              this.ligthFlag = true; //用来标记已经设置了闪烁
            } else if (!isLight && this.ligthFlag) {
              //数据不符合预警设置，如果当前没设置闪烁，则不设置闪烁；如果已经设置过闪烁了，再执行一遍可取消闪烁
              toggleClass(this.$refs.text, "animate-warning"); //执行第一次打开闪烁，第二次关闭闪烁
              this.ligthFlag = false; //用来标记已经取消了闪烁
            }
          } else if (this.vscompt.type == "VePie") {
            let columnName = this.vscompt.comptData.columns[1];
            let rowsData = this.vscompt.comptData.rows;
            for (let j = 0; j < rowsData.length; j++) {
              //初始化全部
              let key = "series.0.data." + j + ".selected";
              // let key1 = "series.0.data." + j + ".itemStyle.color";
              this.vscompt.comptAttrs.extendSetting[key] = false;
              //this.vscompt.comptAttrs.extendSetting[key1] = '';
            }
            for (let i = 0; i < array.length; i++) {
              for (let j = 0; j < rowsData.length; j++) {
                let key = "series.0.data." + j + ".selected";
                // let key1 = "series.0.data." + j + ".itemStyle.color";
                let test =
                  "" +
                  rowsData[j][columnName] +
                  condiMap[array[i].rele].label +
                  array[i].val;
                if (!this.vscompt.comptAttrs.extendSetting[key]) {
                  this.vscompt.comptAttrs.extendSetting[key] = eval(
                    "(" + test + ")"
                  );
                }
                if (this.vscompt.comptAttrs.extendSetting[key]) {
                  //this.vscompt.comptAttrs.extendSetting[key1] = 'red';
                }
              }
            }
          } else if (this.vscompt.type == "VeRadar") {
            let value = [];
            let columnData = this.vscompt.comptData.columns;
            for (var k = 0; k < keys.length; k++) {
              array = map[keys[k]];
              let rowsData = this.vscompt.comptData.rows[array[0].col];
              var value1 = [];
              for (let i = 0; i < array.length; i++) {
                for (var j = 1; j < columnData.length; j++) {
                  if (value1.length < columnData.length - 1) {
                    value1.push("");
                  }
                  let test =
                    "" +
                    rowsData[columnData[j]] +
                    condiMap[array[i].rele].label +
                    array[i].val;
                  if (eval("(" + test + ")")) {
                    value1[j - 1] = rowsData[columnData[j]];
                  }
                }
              }
              value.push(value1);
            }
            this.vscompt.comptAttrs.extendSetting["series.10"]["data"] = value;
          }
        } else if (effect.length == 0) {
          if (this.vscompt.type == "VeRadar") {
            this.vscompt.comptAttrs.extendSetting["series.10"]["data"] = [];
          } else if (this.vscompt.type == "VePie" && this.vscompt.comptData != undefined) {
            let rowsData = this.vscompt.comptData.rows;
            for (let j = 0; j < rowsData.length; j++) {
              //初始化全部
              let key = "series.0.data." + j + ".selected";
              this.vscompt.comptAttrs.extendSetting[key] = false;
            }
          } else if (this.vscompt.type == "VeRing" && this.ligthFlag) {
            //预警设置关闭，如果当前没设置闪烁，则不设置闪烁；如果已经设置过闪烁了，再执行一遍可取消闪烁
            toggleClass(this.$refs.text, "animate-warning"); //执行第一次打开闪烁，第二次关闭闪烁
            this.ligthFlag = false; //用来标记已经取消了闪烁
          }
        }
      },
      light2(veType, array, index, key, isInit) {
        if (isInit) {
          this.visualMap = [];
          this.vscompt.comptAttrs.extendSetting["visualMap"] = [];
        }
        // var maxflag = false;
        // var flagkey = "gt";
        let pieces = [];
        //获取数组的最值
        let dataarray = this.vscompt.comptData.rows;
        let minVal = parseInt(dataarray[0][key]) || 0;
        let maxVal = parseInt(dataarray[0][key]) || 0;
        for (let j = 0; j < dataarray.length; j++) {
          let cur = parseInt(dataarray[j][key]) || 0;
          cur < minVal ? (minVal = cur) : null;
          cur > maxVal ? (maxVal = cur) : null;
        }
        for (let i = 0; i < array.length; i++) {
          let ruleObj = {};
          ruleObj.color = "red";
          array[i].val = parseInt(array[i].val) || 0;
          if (array[i].rele == 1) {
            //<
            ruleObj.lt = array[i].val;
            ruleObj.gte = minVal > 0 ? 0 : minVal;
          } else if (array[i].rele == 2) {
            //>
            // maxflag = true;
            ruleObj.gt = array[i].val;
            ruleObj.lte = maxVal;
          } else if (array[i].rele == 4) {
            //<=
            ruleObj.lte = array[i].val;
            ruleObj.gte = minVal > 0 ? 0 : minVal;
          } else if (array[i].rele == 5) {
            //>=
            // flagkey = "gte";
            // maxflag = true;
            ruleObj.gte = array[i].val;
            ruleObj.lte = maxVal;
          } else {
            ruleObj.value = array[i].val;
            ruleObj.color = "red";
          }

          pieces.push(ruleObj);
        }
        //获取数组的最值
        // var dataarray = this.vscompt.comptData.rows;
        // var min = parseInt(dataarray[0][key]);
        // for (var j = 0; j < dataarray.length; j++) {
        //   var cur = parseInt(dataarray[j][key]);
        //   cur < min ? (min = cur) : null;
        // }

        if (
          this.originColor[index] !== "" &&
          this.originColor[index] != undefined
        ) {
          this.bgcolor = this.originColor[index];
        } else {
          this.bgcolor = this.defaultColor[index];
        }

        // if (maxflag) {
        //   var max = parseInt(pieces[0][flagkey]);
        //   for (var z = 0; z < pieces.length; z++) {
        //     var cur1 = parseInt(pieces[z][flagkey]);
        //     cur1 < max ? (max = cur1) : null;
        //   }
        // } else {
        //   var max = parseInt(dataarray[0][key]);
        //   for (var y = 0; y < dataarray.length; y++) {
        //     var cur2 = parseInt(dataarray[y][key]);
        //     cur2 > max ? (max = cur2) : null;
        //   }
        // }
        // var m2 = max - 1;
        // var m3 = min + 1;
        // var maxdata = {
        //   lt: parseInt(m2),
        //   gt: parseInt(m3),
        //   color: this.bgcolor
        // };
        // pieces.push(maxdata);

        //条形图、条形堆积图使用x轴进行预警，其他使用y轴进行预警
        let flag;
        if (veType == "VeBar" || veType == "VeStackBar") {
          flag = 0;
        } else {
          flag = 1;
        }
        let obj = {
          show: false,
          seriesIndex: index,
          inverse: true,
          orient: "vertical",
          pieces: pieces,
          dimension: flag, // 1为y轴，0为x轴
          outOfRange: {
            color: this.bgcolor
          }
        };
        this.visualMap.push(obj);
        this.$set(
          this.vscompt.comptAttrs.extendSetting,
          "visualMap",
          this.visualMap
        );
      },
      queryData(param) {
        let params = getRequestParam({
          param: param,
          vscompt: this.vscompt,
          drillData: this.drillData,
          xAxisData: this.xAxisData,
          yAxis1Data: this.yAxis1Data,
          yAxis2Data: this.yAxis2Data,
          dataType: this.dataType,
          datasetMap: this.datasetMap
        });
        this.executeReqest(params, param);
      },
      executeReqest(params, drillState) {
        if (this.pageCache.operation == "preview")
          params = addPageCondis({
            vscompt: this.vscompt,
            params: params,
            datasetMap: this.datasetMap,
            pageParams: this.getPageParams,
            queryCompts: this.getQueryCompts(),
            pageId: this.pageCache.pageId
          });
        var _this = this;
        this.vscompt.comptAttrs.loading = true;
        let computedData = this.vscompt.comptAttrs.computedData||[];
        if(this.pageCache.static){
          let comptType = this.vscompt.type;
          staticDataTrans(params,comptType);
        }else{
          if (['VeFunnel', 'VeCompareFunnel'].includes(this.vscompt.type)) {
            params['rowDimList'] = this.xAxisData;
          }
          this.queryComptData({params, computedData})
            .then(function (response) {
              if (response.data.respResult == 1) {
                let comptData = response.data.respData;
                if (
                  comptData.columns != undefined &&
                  comptData.columns.length > 0 &&
                  comptData.columns.indexOf("XXXXCODE") > -1
                ) {
                  comptData.columns.pop();
                }
                if (comptData.rows == null || comptData.rows == undefined) {
                  comptData.rows = [];
                }
                if (comptData.columns == null || comptData.columns == undefined) {
                  comptData.columns = [];
                }
                if ( _this.vscompt.comptAttrs.setting.legendDimColTitle) {
                  _this.handleScatterData([comptData, _this.vscompt]).then(res => {
                    _this.vscompt.comptData = res;
                  })
                } else {
                  _this.resetChartSeries(params, response, drillState);
                  _this.vscompt.comptData = comptData;
                }
                _this.setAnotherName(_this.vscompt);
                loadDataDone(_this.vscompt);
              } else {
                loadDataError(_this.vscompt,'数据更新失败');
                // _this.$message.error("数据更新失败");
                console.error(response.data.respErrorDesc);
              }
            })
            .catch(function (error) {
              console.error(error);
              // _this.$message.error("数据更新失败");
            })
            .finally(() => {
              _this.vscompt.comptAttrs.loading = false;
            });
        }
      },
      // 对于柱状图、组合图等图形，如果columns列数变比之前少，comptattrs的series.index属性要先删除，不然图形渲染会报错 series.type should be specified.
      resetChartSeries(params, response, drillState) {
        let columns = response.data.respData.columns || [];
        let columnCount = columns.length;
        if (columns.length > 0 && columns.indexOf("XXXXCODE") > -1) {
          columnCount -= 1;
        }
        let oriColCount = 0
        try {
          oriColCount = this.vscompt.comptData.columns.length || 0;
        } catch (e) {}
        let oriCols =
          this.vscompt.comptData.columns != undefined
            ? this.vscompt.comptData.columns
            : [];

        let flag = true; //y轴顺序或者内容有变 就得更新系列的设置
        if (oriColCount > 0) {
          for (let index = 0; index < columns.length; index++) {
            if (
              columns[index].indexOf("XXXXCODE") == -1 &&
              oriCols[index] != columns[index]
            ) {
              flag = false;
              break;
            }
          }
        }

        // 图例维度重新设置右Y轴
        let _legendData = this.xAxisData.filter(item => item.isNewSetting === '_legend')
        if (this.yAxis2Data.length > 0 && _legendData.length > 0) {
          // 双Y轴
          let yAxis2Arr = [];
          let yAxis2DataCopy = this.yAxis2Data;
          const y2label = yAxis2DataCopy[0].label
          yAxis2Arr = columns.filter(item => item.split('-').reverse()[0].includes(y2label))
          this.vscompt.comptAttrs.setting["axisSite"] = { right: yAxis2Arr };
          this.vscompt.comptAttrs.setting["showLine"] = yAxis2Arr;
          this.vscompt.comptAttrs.setting["axisSite"] = objDeepCopy({
            right: yAxis2Arr
          });
          this.vscompt.comptAttrs.setting["showLine"] = objDeepCopy(
            yAxis2Arr
          );
        }
        if (!drillState) { // 联动时不需要删除操作
          if (_legendData.length > 0) {
            // 删除多余图例 （联动时可能变少）
            const settings = this.vscompt.comptAttrs.extendSetting
            const keys = Object.keys(settings)
            const len = columns.length
            const arr = [
              'series.index.symbolSize',
              'series.index.label.normal.show',
              'series.index.label.normal.position',
              'series.index.name',
              'series.index.type',
              'series.index.itemStyle.normal.color',
              'series.index.markPoint',
              'legend.data.index',
              'series.index.label.normal.map.show',
              'series.index.barWidth',
              'series.index.itemStyle.normal.barBorderRadius',
              'series.index.label.position'
            ]
            keys.forEach(k => {
              let key = k.replace(/(\d+)/g,'index')
              if (arr.includes(key)) {
                let index = k.replace(/(\D)/g,'')
                if (index >= len - 1) {
                  delete this.vscompt.comptAttrs.extendSetting[ k ];
                }
              }
            });
          }
        }

        if (
          [
            "VeCombineChart",
            "VeHistogram",
            "VeStackHistogram",
            "VePercentStackHistogram",
            "VePie",
            "VeLine",
            "VeLineArea",
            "VeStackLineArea",
            "VePercentStackLineArea",
            "VeMap",
            "VeBar",
            "VeStackBar",
            "VeAreaMap",
            "HdKpiBlock",
            "HdKpiBlock2",
            "HdKpiBlock3",
            "VeRosePie",
            "VeCombineStack",
            "VeScatter",
            "VeLines",
            "VeLinesBmap",
            "Scatter",
            "VeWaterfall",
            'VeWordCloud',
            'VePercentStackBar'
          ].includes(this.vscompt.type) &&
          (!flag || columnCount < oriColCount)
        ) {
          if (
            this.vscompt.type == "HdKpiBlock" ||
            this.vscompt.type == "HdKpiBlock2" ||
            this.vscompt.type == "HdKpiBlock3"
          ) {
            columnCount = 1;
            oriColCount = 1;
          } else {
            columnCount -= 1;
            oriColCount -= 1;
          }
        }
      },
      toDrillData(index) {
        this.$set(this.vscompt.comptAttrs, "curDrillIdx", index);
        this.queryData({isUpDrill: true});
      },
      queryLinkData(linkageCondi) {
        if(this.xAxisData.length===0 && this.yAxis1Data.length===0 && this.yAxis2Data.length===0) {
          return;
        }
        let params = getLinkRequestParam({
          linkageCondi: linkageCondi,
          vscompt: this.vscompt,
          xAxisData: this.xAxisData,
          yAxis1Data: this.yAxis1Data,
          yAxis2Data: this.yAxis2Data,
          dataType: this.dataType
        });
        this.executeReqest(params);
      },
      resetLinage() {
        this.setLinkageCondi({
          label: "",
          xAxisData: this.xAxisData,
          vscompt: this.vscompt,
          isJumpNewPage: false
        });
        this.linkageState = false;
      },
      legendFormatter(name) {
        let name1 = name,
          legendData = this.vscompt.comptAttrs.extendSetting.legendData || {};
        if (legendData[name]) name1 = legendData[name].name;
        return name1;
      },
      setLegendFormatter() {
        let activedCompt = this.vscompt;
        if (!activedCompt.comptData || activedCompt.comptData.columns.length === 0) {
          return;
        }
        let decimalDigit = activedCompt.comptAttrs.decimalDigit; //获取小数点位数
        if(activedCompt.type == "VePie"  || activedCompt.type == "VeRosePie" || activedCompt.type == "VeDoughnutPie") {
          let layoutAttrs = activedCompt.styleAttrs.find((val)=>val.enName === "layoutAttrs").children || [];
          let tagList = layoutAttrs.find((val)=>val.enName === "tagList") || {};
          let tagListStyle = layoutAttrs.find((val)=>val.enName === "tagListStyle");
          if(tagList.value === true) {
            this.$set(activedCompt.comptAttrs.extendSetting, "legend.formatter", '')
            if(tagListStyle) {
              let v = tagListStyle.value; //获取列表样式
              let ComptData = activedCompt.comptData || [];
              activedCompt.comptAttrs.extendSetting["legend.formatter"] = function(name){
                let total = 0;
                const dataKey1 = ComptData.columns[0] || []
                const dataKey2 = ComptData.columns[1] || []
                ComptData.rows.forEach(arr =>{
                  total += parseFloat(arr[dataKey2])//值可能是float
                })
                let legendData = name;
                if(ComptData){
                  ComptData.rows.forEach(arr =>{
                    if(arr[dataKey1] === name){
                      const percent = total == 0 ? 0 : (arr[dataKey2]/total * 100).toFixed(decimalDigit);
                      switch(v) {
                        case "0":
                          legendData += " " + parseFloat(arr[dataKey2]).toFixed(decimalDigit) + " " + percent +'%';
                          break;
                        case "1":
                          legendData += " " + parseFloat(arr[dataKey2]).toFixed(decimalDigit);
                          break;
                        case "2":
                          legendData += " "+ percent +'%';
                          break;
                        default:
                          legendData += " ";
                      }
                    }
                  })
                }
                return legendData;
              }
            }
          }
        }
      },
      setDecimalDigit() {
        let decimalDigit = this.vscompt.comptAttrs.decimalDigit; //获取小数点位数
        if (this.vscompt.type == "VePie" || this.vscompt.type == "VeRosePie") {
          //重新加载饼图的提示框小数点和数据标签样式
          let val =
            "{formatter:function(data){return data.name + ' , ' + parseFloat(data.value).toFixed(" +
            parseInt(decimalDigit) +
            ") +'('+parseFloat(data.percent).toFixed(" +
            parseInt(decimalDigit) +
            ")+'%'+')';}}";
          this.vscompt.comptAttrs.extendSetting["tooltip"] = eval(
            "(" + val + ")"
          );
          let labVal = this.vscompt.comptAttrs.labelFunc.replace(
            /decimal/g,
            decimalDigit
          );
          this.vscompt.comptAttrs.extendSetting["series.0.label"] = eval(
            "(" + labVal + ")"
          );
        } else if (this.vscompt.type == "VeDoughnutPie") {
          //重新加载饼图的提示框小数点和数据标签样式
          let val =
            "function(data){return data.name + ' , ' + parseFloat(data.value).toFixed(" +
            parseInt(decimalDigit) +
            ") +'('+parseFloat(data.percent).toFixed(" +
            parseInt(decimalDigit) +
            ")+'%'+')';}";
          this.vscompt.comptAttrs.extendSetting.tooltip.formatter = eval(
            "(" + val + ")"
          );
          let labVal = this.vscompt.comptAttrs.labelFunc.replace(
            /decimal/g,
            decimalDigit
          );
          this.vscompt.comptAttrs.extendSetting.series.label.formatter = eval(
            "(" + labVal + ")"
          );
        } else if (this.vscompt.type == "VeGauge") {
          let unit = this.vscompt.comptAttrs.unit; //仪表盘单位设置
          //重新加载仪表盘的提示框小数点和数据小数点
          let tooltipForm =
            "{formatter:function(data){return data.name + ' : ' + parseFloat(data.value).toFixed(" +
            parseInt(decimalDigit) +
            ")+'" +
            unit +
            "';}} ";
          this.vscompt.comptAttrs.extendSetting["tooltip"] = eval(
            "(" + tooltipForm + ")"
          );

          let detailForm =
            "{formatter:function(value){return isNaN(value)?'-':parseFloat(value).toFixed(" +
            parseInt(decimalDigit) +
            ")+'" +
            unit +
            "';}} ";
          this.vscompt.comptAttrs.extendSetting["series.0.detail"] = eval(
            "(" + detailForm + ")"
          );
          // 解决IE浏览器series.0.detail 属性在 series.0.detail.color 及 detail.offsetCenter 之后， 导致设置的标题位置不生效
          const keys = Object.keys(this.vscompt.comptAttrs.extendSetting)
          const detailK = keys.filter(k => k.indexOf('series.0.detail.') > -1)
          detailK.forEach(item => {
            let key = item.replace(/series.0.detail./g,'')
            this.$set(this.vscompt.comptAttrs.extendSetting["series.0.detail"], key, this.vscompt.comptAttrs.extendSetting[item])
          })
          // end

          //区间状态
          let intervalDescFunc = this.vscompt.comptAttrs.intervalDescFunc == undefined ? "function(value){return '';}"  : this.vscompt.comptAttrs.intervalDescFunc;
          this.vscompt.comptAttrs.extendSetting["series.1.detail.formatter"] = eval("(" + intervalDescFunc + ")");
          if(JSON.stringify(this.vscompt.comptAttrs.extendSetting).indexOf("series.1.type") == -1){
            this.vscompt.comptAttrs.extendSetting["series.1.type"] = "gauge";
            this.vscompt.comptAttrs.extendSetting["series.1.radius"] = "80%";
            this.vscompt.comptAttrs.extendSetting["series.1.startAngle"] = 180;
            this.vscompt.comptAttrs.extendSetting["series.1.endAngle"] = 0;
            this.vscompt.comptAttrs.extendSetting["series.1.center"] = [ "50%", "75%" ];
            this.vscompt.comptAttrs.extendSetting["series.1.axisLine.lineStyle.width"] = 0;
            this.vscompt.comptAttrs.extendSetting["series.1.axisLine.lineStyle.opacity"] = 0;
            this.vscompt.comptAttrs.extendSetting["series.1.axisLine.show"] = false;
            this.vscompt.comptAttrs.extendSetting["series.1.splitLine.show"] = false;
            this.vscompt.comptAttrs.extendSetting["series.1.axisTick.show"] = false;
            this.vscompt.comptAttrs.extendSetting["series.1.axisLabel.show"] = false;
            this.vscompt.comptAttrs.extendSetting["series.1.pointer.show"] = false;
            this.vscompt.comptAttrs.extendSetting["series.1.detail.color"] = "#fff";
            this.vscompt.comptAttrs.extendSetting["series.1.detail.offsetCenter"] = [ 0, "-60%" ];
            this.vscompt.comptAttrs.extendSetting["series.1.detail.formatter"] = eval("(" + "function(value){return '';}" + ")");
          }
        } else if (this.vscompt.type == "VeRing") {
          let detailForm =
            "function(data){return isNaN(data.value)?'-':parseFloat(parseFloat(data.value*100).toFixed(2))+'%'} ";
          this.vscompt.comptAttrs.extendSetting[
            "series.0.data.0.label.normal.formatter"
            ] = eval("(" + detailForm + ")");
        }
      },
      xAxisFormate(xAxisData) {
        if(xAxisData.length === 0){
          return;
        }
        if(
          ["VeBar", "VeLine", "VeStackBar", "VeLineArea", "VeStackLineArea", "VePercentStackLineArea", "VeHistogram", "VeStackHistogram", "VePercentStackHistogram", "VeCombineChart", "VeCombineStack", 'VeWaterfall','VePercentStackBar'].includes(this.vscompt.type)
        ) {
          let axisAttrs;
          this.vscompt.styleAttrs.forEach((data)=>{
            if(data.enName == "axisAttrs"){
              axisAttrs = data;
            }
          });
          if(xAxisData[0].col_type === "No." && xAxisData[0].element_type == 2) {
            this.vscompt.comptAttrs.extendSetting["xAxis.0.axisLabel.formatter"] = (value, index) => {
              return formatNumber(value) + axisAttrs.children[0].children[1].value;
            }
          } else {
            this.vscompt.comptAttrs.extendSetting["xAxis.0.axisLabel.formatter"] = "{value}" + axisAttrs.children[0].children[1].value;
          }
        }
      },
      yAxisFormate(yAxisData, yIndex) {//yAxisData Y轴对象属性, yIndex Y轴索引
        if(yAxisData.length === 0){
          return;
        }
        if(
          ["VeBar", "VeLine", "VeStackBar", "VeLineArea", "VeStackLineArea", "VePercentStackLineArea", "VeHistogram", "VeStackHistogram", "VePercentStackHistogram", "VeCombineChart","VeCombineStack", 'VeWaterfall','VePercentStackBar'].includes(this.vscompt.type)
        ) {
          let axisAttrs;
          this.vscompt.styleAttrs.forEach((data)=>{
            if(data.enName == "axisAttrs"){
              axisAttrs = data;
            }
          });
          let unit = axisAttrs.children[yIndex+1].children[1].value;
          let seriesIndexName = this.vscompt.type === 'VeWaterfall' ? 'yAxis.axisLabel.formatter' : "yAxis."+ yIndex +".axisLabel.formatter"
          if(yAxisData[0].col_type === "No." && yAxisData[0].element_type == 2) {
            this.vscompt.comptAttrs.extendSetting[seriesIndexName] = (value, index) => {
              return formatNumber(value) + unit;
            }
          } else {
            this.vscompt.comptAttrs.extendSetting[seriesIndexName] = "{value}" + unit;
          }
        }
      },
      // 对比漏斗图点击事件
      cpFunnelClick() {
          if(!this.vscompt.comptAttrs.mainLinkageData||this.vscompt.comptAttrs.mainLinkageData.length == 0||this.vscompt.comptAttrs.drillData.length == 0){
              this.gotoPage(this.vscompt.comptAttrs.extendSetting);
            }
      },
      setDoughnutPieSeries(newVal, oldVal){
        let legendData = [];
        let columns = newVal.columns;
        let rows = newVal.rows;
        let extendSetting = this.vscompt.comptAttrs.extendSetting;
        let ratio = this.vscompt.comptAttrs.ratio*100;
        let keys = Object.keys(extendSetting)
            keys.forEach(k => {
              if (k.includes("series.")) {
                delete extendSetting[ k ];
              }
            });
        if(rows.length>0&&columns.length>0){
          rows.sort((a, b) => {
            return b[columns[1]] - a[columns[1]];
          });
          let legendOptions = this.vscompt.styleAttrs[1].children[0].options;
          let isSelectedOption = legendOptions.filter( item => item.isSelected === true);
          let legendAlign = isSelectedOption[0].label;
          let center = [];
          let barWidth = ratio / rows.length / 2;

          switch(legendAlign){
            case "left": center = ["65%", '50%'];break;
            case "right": center = ["35%", '50%'];break;
            default: center = ["50%", '50%'];break;
          }
          this.$nextTick(_=>{
            rows.forEach((item, index) => {
              legendData.push(item[columns[0]]);           
              this.$set(extendSetting,'series.'+index+'.center',center);
              this.$set(extendSetting,'series.'+index+'.radius',[ratio - barWidth * index * 2 + '%', ratio - barWidth * ( index * 2 + 1 ) + '%']);
              this.$set(extendSetting,'series.'+index+'.data.0.label.position', 'inner');
              this.$set(extendSetting,'series.'+index+'.data.1.label.show', false);
              this.$set(extendSetting,'series.'+index+'.data.1.labelLine.show', false);
              this.$set(extendSetting,'series.'+index+'.data.1.tooltip.show', false);
              this.$set(extendSetting,'series.'+index+'.data.1.itemStyle.color', '#e3f0ff');
              this.$set(extendSetting,'series.'+index+'.data.1.emphasis.itemStyle.color', '#e3f0ff');
            });
            this.$set(extendSetting,'legend.data', legendData);
          });
          
        }
      },
      ...mapActions({
        queryComptData: "QueryTable/queryComptData",
        setLinkageCondi: "PageDesign/setLinkageCondi",
        initLableFormatter: "PageDesign/initLableFormatter",
        gotoPage: "PageDesign/gotoPage",
        handleScatterData: "PageDesign/handleScatterData",
        setAnotherName: "PageDesign/setAnotherName"
      }),
      ...mapMutations({
      })
    }
  };
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
  .cp-funnel-sel-wrap {
    position: absolute;
    top: 20px;
    width:100%;
    left: 0;
    z-index: 10;
    /deep/ .el-select > .el-input--mini > .el-input__inner {
      border: none;
    }
    /deep/ .el-col:first-child .el-select > .el-input--mini > .el-input__inner {
      text-align: right;
    }
    /deep/ .el-col:last-child .el-select > .el-input--mini > .el-input__inner {
      padding-left: 0;
    }
  }
</style>

