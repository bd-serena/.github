<template>
  <div class="datafilter">
    <div style="height: 100%">
      <GeminiScrollbar class="my-scroll-bar">
        <el-col :span="5">
          <div
            v-for="(item,index) in filterData" :key="index"
            :class="['df_name',{'date_name':item.type=='ElDatePicker','date_name2':item.isSetDefault}]"
          >
            <span :title="item[showTypeArr[item.show_type]]">{{ item[showTypeArr[item.show_type]] }}</span>
          </div>
        </el-col>
        <el-col :span="19" style="padding-right: 15px;">
          <div :class="['filter-wrap',{'date_uncheck':item.type=='ElDatePicker','date_ischeck':item.isSetDefault}]" v-for="(item,index) in filterData" :key="index">
            <!-- edit -->
              <FilterCell :filterItem="item" :id="index"  :key="index"></FilterCell>
            <!-- edit -->
          </div>
        </el-col>
      </GeminiScrollbar>
    </div>
  </div>
</template>
<script>
import { mapState, mapGetters, mapActions } from "vuex";
import FilterCell from "../design/FilterCell.vue";
export default {
  components: {
    FilterCell
  },
  data() {
    return {
      suffix2: "",
      timeOprCount1: 0,
      timeOpr1: 2,
      timeOprs: [{ value: 1, label: "+" }, { value: 2, label: "-" }],
      valueId: [], // 初始值
      valueText: [],
      conCaculs: [
        { value: "or", label: "或" },
        { value: "and", label: "且" },
        { value: "0", label: "无" }
      ],
      contains: [
        { value: 10, label: "包含" },
        { value: 11, label: "不包含" },
        { value: 8, label: "在…中（逗号隔开）" },
        { value: 9, label: "不在…中（逗号隔开）" },
        { value: 20, label: "为空" },
        { value: 21, label: "不为空" }
      ],
      dfAreaSels: [],
      dfArea: [],
      symbols: [
        { value: 2, label: ">" },
        { value: 1, label: "<" },
        { value: 3, label: "=" },
        { value: 4, label: "<=" },
        { value: 5, label: ">=" },
        { value: 8, label: "在…中（逗号隔开）" },
        { value: 9, label: "不在…中（逗号隔开）" }
      ],
      props: {
        value: "dim_value",
        label: "label",
        children: "children"
      },
      showTypeArr: {
        "2": "col_chs_name",
        "1": "col_name",
        "0": "element_name"
      },
      nullSelectValue: ""
    };
  },
  created() {
    var areaList = this.filterData;
    for (let i = 0; i < areaList.length; i++) {
      if (areaList[i].type == "ElCascader") {
        areaList[i].dfAreaSels = []
      }
    }
  },
  computed: {
    ...mapState({
      fieldSetList: state => state.compt.fieldSetList,
      datasetName: state => state.compt.datasetName,
      dgwMsUrl: state => state.dgwMsUrl,
      filterData: state => state.ReportAttr.filterData
    }),
    ...mapGetters({
      //filterData: "QueryTable/upFilterData"
    })
  },
  watch: {},
  methods: {
    ...mapActions({
      querySingleDimInfo: "AnalyReportAttr/querySingleDimInfo"
    }),
  },
  activated() { }
};
</script>
<style lang="scss" scoped>
$border-clr01: #dcdfe6; // 边框色1
$main-color: #409eff; //主色调
$bg-clr01: #ecf5ff; // 块背景色1
$txt-clr01: #67c23a; // 文字颜色1
$txt-clr02: #fff; // 文字颜色2
$txt-clr03: #606266; // 文字颜色3
$bg-clr02: #f0f2f5;
$clr1: #909399;
.datafilter {
  height: 240px;
  /deep/.df_name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    height: 30px;
    line-height: 28px;
    padding-right: 10px;
    margin-bottom: 10px;
  }
  /deep/.date_name,
  /deep/.date_uncheck {
    height: 60px;
  }
  /deep/.date_name2,
  /deep/.date_ischeck {
    height: 180px;
  }
  /deep/.el-input-group__prepend {
    width: 60px;
    background: #fff;
  }
  /deep/.el-tag {
    width: auto !important;
    margin: 2px 0 2px 6px !important;
    line-height: 18px !important;
    height: 20px !important;
    border: none !important;
    background: $bg-clr02 !important;
    color: $clr1 !important;
  }
  /deep/.el-input-group__append,
  .el-input-group__prepend {
    background-color: #fff !important;
  }
  /deep/.numSel .el-input input {
    padding-left: 10px !important;
  }
  /deep/.el-input-group > .el-input__inner {
    display: unset;
  }
  .el-scrollbar .el-scrollbar__view .el-select-dropdown__item {
    height: auto;
    // padding: 0;
  }
  .el-select-dropdown__item.selected {
    font-weight: normal;
  }
  /* .el-select {
          /* height: 28px;
      } */
}
.area /deep/ .el-select__tags {
  height: 26px;
  overflow-y: hidden;
  z-index: 200 !important;
}

.area /deep/ .el-select__tags:hover {
  overflow-y: auto;
}
.area /deep/ .el-select__tags::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 6px; /*高宽分别对应横竖滚动条的尺寸*/
  height: 6px;
}
.area /deep/ .el-select__tags::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 5px;
  background: rgba(144, 147, 153, 0.3);
}
.area /deep/ .el-select__tags::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  border-radius: 0;
}
/deep/ .el-select-dropdown__item.hover,
.el-select-dropdown__item:hover {
  background-color: #fff !important;
}
/deep/ .el-select-dropdown__item {
  padding: 0px;
}
.el-scrollbar .el-scrollbar__view .el-select-dropdown__item {
  height: auto;
  // padding: 0;
}
.con-line {
  color: $main-color;
  display: block;
  height: 28px;
  line-height: 28px;
  font-size: 14px;
  font-weight: bold;
  margin-right: 12px;
  > span {
    color: $txt-clr03;
    font-weight: normal;
    margin-right: 3px;
  }
}
.con-line-green {
  color: $txt-clr01;
  > span {
    color: $txt-clr03;
    font-weight: normal;
    margin-right: 3px;
  }
}
/deep/.number-input {
  >input.el-input__inner {
    padding-right: 0;
  }
}
/deep/.input-with-select.is-disabled .el-input-group__prepend {
  .el-input__icon,
  .el-input__inner {
    cursor: pointer;
  }
}
.datePicker-date {
  width: 155px;
}
.datePicker-datetime {
  width: 180px;
}
.filter-wrap {
  height: 30px;
  margin-bottom: 10px;
}
</style>

