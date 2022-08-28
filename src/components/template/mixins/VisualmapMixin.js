import {
    formatNumber
  } from "../../../utils/comonFunc.js";
export default { 
    data() {
      return {
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
        ]
      }
    },
    computed: {
        // 两个度量字段的最大最小值区间范围
    measureValRange() {
        let range = [
          [0, 0]
        ];
        let {
          columns = [],
          rows = []
        } = this.vscompt.comptData || {};
        if (columns.length === 0 || rows.length === 0) {
          return range;
        }
        for (let index = 1; index < columns.length; index++) {
          const measureName = columns[index];
          const measureVals = rows.map(row1 => row1[measureName]);
          range[index - 1] = [Math.min(...measureVals), Math.max(...measureVals)];
        } 
        return range;
      },
      visualList() {
        let list = [];
        let {
          columns = [],
          rows = []
        } = this.vscompt.comptData || {};
        const yAxis1Data = this.yAxis1Data || [];
        if (yAxis1Data.length === 0 || columns.length === 0 || rows.length === 0) {
          return list;
        }
        for (let index = 0; index < yAxis1Data.length; index++) {
          const [min, max] = this.measureValRange[index];
          let splitList = this.initSplitList(this.measureValRange[index]);
          splitList.forEach((item, index2) => {
            splitList[index2]['iconColor'] = this.defaultColor[index2];
          });
          const { element_id, isNewSetting } = yAxis1Data[index];
          // colorMeasure 颜色度量
          if (isNewSetting === 'sizeMeasure') { // 大小度量 只显示最大最小范围
            splitList = [{
              "label": `${formatNumber(min, 2)} ～ ${formatNumber(max, 2)}`,
              "iconColor": "#ccc"
            }];
          }
          list.push({
            element_id,
            splitList,
            title: yAxis1Data[index].nick_name   
          });
        }
        return list;
      }
    },
    methods: {
        // visualmap 数据分成五个区间
    initSplitList(dataRange) {
        let list = [];
        const [min, max] = dataRange;
        const divider = Math.round((max - min) / 5);
        if (min === max) {
          list = [{
            gte: min,
            lte: max,
            label: `${formatNumber(min, 2)} ～ ${formatNumber(max, 2)}`
          }]
          return list;
        }
        for (let index = 0; index < 5; index++) {
          const curMin = index > 0 ? list[index - 1].lt : min;
          const cuMax = index < 4 ? curMin + divider : max;
          let item = {
            gte: curMin,
            label: `${formatNumber(curMin, 2)} ～ ${formatNumber(cuMax, 2)}`,
            color: this.defaultColor[index]
          }
          // 最后一个要小于等于，其他只要小于
          if (index === 4) {
            item['lte'] = cuMax;
          } else {
            item['lt'] = cuMax;
          }
          list.push(item);
        }
        list.sort((a, b) => {
          return a.gte - b.gte > -1;
        });
        return list;
      }
    },
}