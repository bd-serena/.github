<template>
  <div class="attrSet" :id="pageCache.classTypeId=='1005'?'big-screen':''">
    <div class="nav-title">公共样式</div>
    <div style="width:100%;padding:10px 0 10px 20px;" class="stylattr comStyle">
      <div style="height:calc(100vh - 110px);">
        <el-scrollbar style="height:100%;" :native="false" :noresize="false" tag="section">
          <div style="padding-right:20px;">
            <div v-for="(citem,index) in commonStyle" :key="index">
              <template v-if="!!citem">
                <div v-if="citem.showType === 'inputNumber'" class="cont-line">
                  <div class="inp-line">
                    <div class="inp-line-1">
                      <span class="inp-sp">{{citem.cnName}}</span>
                    </div>
                    <div class="inp-line-2">
                      <el-input-number
                        size="mini"
                        v-model="citem.value"
                        :min="inputNumberMin(citem)"
                        :max="inputNumberMax(citem)"
                        @change="setExtend(citem.enName,citem.value,citem)"
                      ></el-input-number>
                    </div>
                  </div>
                </div>
                <div v-else-if="citem.showType === 'colorPic'" class="cont-line">
                  <div class="inp-line">
                    <div class="inp-line-1">
                      <span>{{citem.cnName}}</span>
                    </div>
                    <div class="inp-line-2">
                      <el-color-picker
                        size="mini"
                        v-model="citem.value"
                        :show-alpha="true"
                        @change="setExtend(citem.enName,citem.value)"
                      ></el-color-picker>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapActions } from "vuex";
import { windowResize } from "../../utils/comonFunc.js";

export default {
  computed: {
    ...mapState({
      pageCache: (state) => state.HomeBody.pageCache,
      commonStyle: (state) => state.PageDesign.commonStyle,
      commonStyleArr: (state) => state.PageDesign.commonStyleArr,
    }),
  },
  methods: {
    ...mapActions({
      setExtenddata: "PageDesign/setExtend",
    }),
    setExtend(key, val, obj) {
      this.setExtenddata({ key, val });
      this.commonStyle.forEach((item) => {
        if (item.enName === key) {
          item.value = val;
        }
      });
      this.commonStyleArr.forEach((item) => {
        if (key === "commonWidth") {
          item.blockInfo.w = val;
        }
        if (key === "commonHeight") {
          item.blockInfo.h = val;
        }
        if (key === "commonBackgroundColor" || key === "backgroundColor" ||key === "bgColor") {
          item.styleAttrs
            .find((val) => val.enName === "commonAttrs")
            .children.find(
              (val) =>
                val.enName === "commonBackgroundColor" ||
                val.enName === "backgroundColor" ||
                val.enName === "bgColor"
            ).value = val;
          if (
            item.type === "HdTitle" ||
            item.type === "ElDatagrid" ||
            item.type === "CrossTable" ||
            item.type === "VeWordCloud" ||
            item.type === "HdVerticalLine" ||
            item.type === "HdHorizontalLine" ||
            item.type === "ElBreadCrumb" ||
            item.type === "ElCarousel" ||
            item.type === "ElTabs" ||
            item.type === "Query" ||
            item.type === "VeRing" ||
            item.type === "HdTopFive" ||
            item.type === "HdHeader" ||
            item.type === "HdVerTitle" ||
            item.type === "HdIconKpiBlock" ||
            item.type === "HdKpiBlock1" ||
            item.type === "HdWater" ||
            item.type === "ElSwiper" ||
            item.type === "HdCorner" ||
            item.type === "HdBorderWrap" ||
            item.type === "HdTitleShape" ||
            item.type === "DvBorder" ||
            item.type === "DvDecoration" ||
            item.type === "ElImage" ||
            item.type === "HdFlopDevice" ||
            item.type === "ComptsDevKpiBlock1" ||
            item.type === "MobileQuery" ||
            item.type === "HdTime"
          ) {
            item.comptAttrs.extendSetting["commonBackgroundColor"] = val;
          } else if (
            item.type === "HdTextarea" ||
            item.type === "HdIconBlock" ||
            item.type === "HdKpiBlock2" ||
            item.type === "HdKpiBlock3" ||
            item.type === "PcKpiBlock" ||
            item.type === "PcTextarea" ||
            item.type === "HdKpiBlock"
          ) {
            item.comptAttrs.extendSetting["bgColor"] = val;
          } else {
            item.comptAttrs.extendSetting["backgroundColor"] = val;
          }
          this.$set(item.comptAttrs.extendSetting, key, val);
        }
      });
      windowResize();
    },
    inputNumberMin(item) {
      return item.min;
    },
    inputNumberMax(item) {
      return item.max;
    },
  }
};
</script>
<style lang="scss" scoped src="../../assets/css/AttrSet.scss"/></style>
<style lang="scss" scoped>
.attrSet {
  height: 100%;
  /deep/ .el-tag {
    width: 100%;
    height: 28px;
    line-height: 26px;
    margin-bottom: 10px;
    font-size: 12px;
    cursor: move;
  }

  .tabcard.el-tabs--border-card {
    background: transparent;
    border: none;
  }

  /deep/ .tabcard.el-tabs--border-card > .el-tabs__header {
    height: 40px;
    padding-top: 10px;
    border: none;
    border-bottom: 1px solid #0a2b4c;
  }

  /deep/ .tabcard .el-tabs__content {
    padding: 0;
  }

  /deep/ .tabcard .el-tabs__item {
    height: 31px;
    line-height: 30px;
    padding: 0 15px;
    border: none;
  }

  /deep/ .tabcard .el-tabs__item.is-active {
    border: none;
    border-radius: 2px 2px 0 0;
  }

  /deep/ .el-tabs__nav-wrap {
    height: 40px;
    width: 100%;
  }

  /deep/ .opt-btn {
    cursor: pointer;
    padding-left: 3px;
  }

  /deep/ .el-tabs__nav-scroll {
    // padding-left: 179px;
    padding-right: 15px;
  }

  /deep/ .tabOption .el-tabs__nav-scroll .el-tabs__nav {
    height: 0;
  }

  .nav-title {
    // position: absolute;
    height: 40px;
    line-height: 40px;
    padding-left: 10px;
    font-size: 16px;
    z-index: 99;
    border-bottom: 1px solid #0a2b4c;
  }
  // .nav-title {
  //   padding-left: 15px;
  //   font-size: 16px;
  //   color: #fff;
  //   height: 40px;
  //   background: #0e3b67;
  //   line-height: 40px;
  //   border-bottom: 1px solid #0a2b4c;
  // }

  /deep/ .el-tabs__header {
    margin: 0;
  }

  /deep/ .el-tabs.el-tabs--top,
  /deep/ .el-row-24 {
    height: 100%;
  }

  /deep/ .el-tabs__content {
    height: calc(100% - 40px);
  }

  /deep/ .el-row-24 .el-col {
    height: 100%;
    padding: 10px 0 10px 10px;
  }

  .r-title,
  .l-title {
    text-align: center;
  }

  /deep/ .el-row-24 .grid-content > div:nth-child(-n + 3) {
    margin-bottom: 10px;
  }

  /deep/ .el-row-24 .grid-content,
  .col-block {
    height: 100%;
  }

  .col-block {
    padding-right: 15px;
  }

  /deep/ .el-row-12 {
    height: calc(50% - 47.5px);
  }

  .col-block span {
    font-size: 12px;
  }

  .col-title label {
    padding-left: 5px;
  }

  .col-subtitle {
    font-size: 12px;
    height: 25px;
    line-height: 25px;
    // margin-bottom: 7px;
  }

  /deep/ .col-subtitle .el-checkbox {
    float: right;
  }

  .col-wrap {
    height: calc(100% - 19px);
  }

  .cols-item {
    height: calc(100% - 40px);
  }

  /deep/ .el-scrollbar__wrap {
    overflow-x: hidden;
  }

  .col-item {
    font-size: 12px;
    height: 22px;
    line-height: 22px;
    cursor: move;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    position: relative;
    .item-wrap {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .group-delete {
      line-height: 22px;
      position: absolute;
      right: -18px;
      cursor: pointer;
      display: none;
    }
    &:hover {
      .group-delete {
        display: inline-block;
      }
    }
  }

  .col-item span {
    width: 30px;
    display: inline-block;
    padding-right: 10px;
  }

  .col-setting {
    height: 28px;
    line-height: 28px;
    text-align: right;
    font-size: 12px;
    cursor: pointer;
  }

  /deep/ .up-button {
    bottom: 20px;
    position: absolute;
    width: calc(50% - 35px);
  }

  .filter-setting {
    float: right;
    font-size: 12px;
    padding-top: 2px;
    cursor: pointer;
  }

  .filter-icon {
    padding-right: 5px;
    cursor: pointer;
  }

  .sort-icon {
    position: relative;
  }

  .sort-icon i {
    position: absolute;
    right: 2px;
    top: 0;
    transform: scale(0.6);
    cursor: pointer;
  }

  .sort-icon i:last-child {
    top: 6px;
  }

  .sort-icon-left {
    left: -10px;
  }

  .sort-icon-right {
    right: -2px;
  }

  .condi-wrap {
    height: calc(100% - 39px);
    width: 100%;
    padding-top: 38px;
  }

  .table-wrap {
    height: 100%;
    padding-bottom: 58px;
  }

  /deep/ .table-wrap .el-scrollbar__view {
    padding-right: 10px;
  }

  /deep/ .table-wrap .el-scrollbar__view > div > div,
  /deep/ .table-wrap .el-scrollbar__view .col-title {
    margin-bottom: 10px;
  }

  /deep/#big-screen .table-wrap .el-scrollbar__view {
    padding-right: 20px;
  }
  .big-screen {
    padding-right: 10px;
  }
  /deep/.stylattr .text-input .el-input__inner[maxlength] {
    padding-right: 45px;
  }

  /deep/.table-wrap .el-radio__label {
    color: #afc0d0;
  }

  /deep/ .col-subtitle .el-checkbox__label {
    font-size: 12px;
  }

  /deep/ .col-title span {
    font-size: 12px;
  }

  /deep/ .col-span {
    display: inline-block;
    width: calc(100% - 32px);
    text-overflow: ellipsis;
    overflow: hidden;
    &.col-span-1 {
      width: calc(100% - 45px);
    }
  }

  /deep/ .dim-wrap {
    /deep/ .col-span {
      width: calc(100% - 45px);
    }
  }

  /deep/ .col-span > span:first-child {
    padding-right: 5px;
  }

  /deep/ .batch-dialog {
    /deep/ .el-form-item__label {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }

  .query-condi .col-span {
    width: calc(100% - 42px);
  }

  .query-filter .col-span {
    width: calc(100% - 18px);
  }
  // data,style,interaction tab position
  /deep/.el-tabs__nav {
    float: right;
  }
}
.attrSet /deep/ .bg-purple .el-tag.default-tag {
  text-align: center;
}
.attrSet {
  .drill .el-row .el-col {
    border: none !important;
  }
}
/* 滚动条 */
/deep/ .el-tabs__nav-scroll {
  padding-left: 0px !important;
}

.tabOption .el-tabs__nav-scroll .el-tabs__nav {
  height: 0;
}

.el-scrollbar__wrap {
  overflow-x: hidden;
}

.table-wrap .el-scrollbar__view {
  padding-right: 10px;
}

.table-wrap .el-scrollbar__view > div {
  margin-bottom: 10px;
}

//   收缩内容块
/deep/ .el-collapse-item__header {
  background-color: #2f5377;
  color: #fff;
  height: 33px;
  line-height: 33px;
  padding-left: 20px;
  position: relative;
}

/deep/ .el-collapse-item__header .el-collapse-item__arrow {
  position: absolute;
  left: 0;
}

/deep/ .el-collapse-item__wrap {
  background-color: #315b85;
}

/deep/ .el-collapse-item__header,
/deep/ .el-collapse-item__wrap {
  border-bottom: 0px;
}

/deep/ .el-collapse-item__content {
  color: #fff;
  opacity: 0.8;
  padding: 0 10px 10px 10px;

  .lineCombo-select {
    .el-tag {
      width: auto;
    }
  }
}

/deep/ .el-collapse {
  border: 0px;
}

/deep/ .el-tabs__item.is-active {
  color: #409eff !important;
  border-bottom: 2px solid #409eff !important;
  background: none !important;
}

/deep/ .el-tabs__active-bar {
  height: 0 !important;
}

/deep/ .el-tabs__nav-wrap {
  height: 31px !important;
}

/deep/ .el-tabs__item {
  padding: 0 !important;
  margin-right: 30px;
}

/deep/ .tabtwo .el-tabs__nav-wrap.is-top {
  padding-left: 110px;
}

/deep/ .el-tabs__nav-wrap.is-top {
  padding-left: 59px;
}

//内容块中元素
.cont-line {
  margin-top: 10px;
}

._wrap {
  width: 25px;
  height: 25px;
  float: right;
  cursor: pointer;
  text-align: center;
  line-height: 24px;
  border: 1px solid transparent;
  border-radius: 5px;
  margin: 0 4px;
}

.stylattr .inp-line {
  width: 100%;
  overflow: hidden;
  min-height: 30px;
}

.stylattr .inp-line-1 {
  width: 60px;
  float: left;
  font-size: 13px;
  color: #fff;
  opacity: 0.8;
  line-height: 26px;
  &.inp_line-1_table {
    width: 90px;
  }
}

.stylattr .inp-line-2 {
  width: calc(100% - 60px);
  float: left;
  &.inp_line-2_table {
    width: calc(100% - 90px);
  }

  /deep/ .el-input__count-inner,
  /deep/ .el-textarea .el-input__count {
    color: #fff;
    background-color: transparent;
    font-size: 12px;
    transform: scale(0.8);
    opacity: 0.7;
  }
}

.stylattr .col-wrap {
  height: 30px;
}

.stylattr .el-radio {
  color: #fff;
  margin-right: 18px;
  &:last-child {
    margin-right: 0;
  }
}

.stylattr .compdInput {
  /deep/ .el-input-group {
    .el-input-group__prepend {
      width: 65px;
      border: none;
      background-color: #0e3b67;

      .el-select .el-input__inner {
        border-right: none;
        border-radius: 0;
      }
    }

    // &:hover {
    //   .el-select .el-input__inner {
    //     border: 1px solid #498bce;
    //     border-right: none;
    //   }
    // }
  }
}

/deep/ .el-color-picker__trigger {
  border: 1px solid #0a2b4c !important;
  background-color: #0e3b67 !important;
}

.el-radio__inner,
.el-checkbox__inner {
  background: #0e3b67 !important;
  border: 1px solid #0a2b4c !important;
}

.el-radio__input.is-checked + .el-radio__label {
  color: #fff !important;
}

.showPagingCls_1 {
  width: 50%;
}

.showPagingCls_2 {
  float: right;
  margin-top: -24px;
  margin-right: 60px;
}

$font-main2: #afc0d0;
$font-clr1: #45fffd;
$border-clr3: #498bce;
$input-bg-clr1: #0e3b67; // 输入框背景色

/***样式块 **/
// .pane-style {
//   height: 100%;
//   padding: 10px;

.el-form-item {
  margin-bottom: 5px;
}

.item-block {
  margin-bottom: 20px;
}

.item_label {
  padding-left: 10px;
  display: inline-block;
}

.sub-nav-title {
  height: 22px;
}

span[class^="icon-"] {
  font-size: 12px;
}

.batch-item {
  cursor: pointer;
}

.align-item {
  height: 30px;
  width: 30px;
  display: inline-block;
  text-align: center;
  vertical-align: middle;
  margin-top: -3px;
  margin-right: 4px;
  border-radius: 2px;
  border: 1px solid transparent;
  // float: unset;
  transform: scale(0.8);

  div {
    transform: scaleY(0.7);
    line-height: 1px;
  }

  span {
    display: inline-block;
    width: 70%;
    line-height: 2px;
  }

  span:nth-child(2n) {
    width: 50%;
  }
}

.align-item:first-child {
  text-align: left;
  padding-left: 5px;
}

.align-item:nth-child(n + 3) {
  text-align: right;
  padding-right: 5px;
}

/deep/ .batch-dialog {
  /deep/ .el-form-item__label {
    white-space: nowrap;
    text-overflow: ellipsis;
    color: #606266 !important;
  }

  /deep/ .el-input__inner {
    color: #606266 !important;
    background-color: #ffffff !important;
    border: 1px solid #dcdfe6 !important;
  }
}

/deep/ .el-form-item__label {
  color: $font-main2;
}

/deep/ .cbox.el-checkbox {
  color: $font-main2;
}

/deep/ .cbox .el-checkbox__input.is-checked + .el-checkbox__label {
  color: $font-main2;
}

.item_label {
  color: $font-main2;
}

.batch-item:hover {
  color: $font-clr1;
}

.align-item:hover,
.align-item.selected {
  border-color: $border-clr3;
  background: $input-bg-clr1;
}

.align-item span {
  border-top: 2px solid $font-main2;
}

.item-block .sub-nav-title {
  color: $font-clr1;
}

/deep/ .advance-col-form {
  .el-form-item:not(:first-child) {
    padding-left: 40px;
  }
}

// }

.tab-item-wrap {
  padding: 5px 0;
}

.tab-item-tit {
  float: left;
}

.tab-item-icon {
  float: right;

  span {
    margin-left: 5px;
    cursor: pointer;

    // &:hover {
    // color: #409eff;
    // }
  }
}

.tab-item:after {
  display: block;
  clear: both;
  content: "";
  visibility: hidden;
  height: 0;
}

.tool-text {
  margin-right: 10px;
}

.tool-button {
  width: 20px;
  display: inline-block;
  cursor: pointer;
  text-align: center;

  &:hover,
  &.actived {
    background-color: #409eff;
  }
}

.upload-button {
  float: left;
  margin-right: 20px;
}

/deep/.interval-cont {
  input.el-input__inner {
    padding-right: 0;
    padding-right: 5px;
  }
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: textfield;
  }
  input[type="number"] {
    -moz-appearance: textfield;
  }
}
.comStyle /deep/.inp-line .inp-line-2 {
  .el-input__inner {
    background-color: #0a2b4c;
    border: 1px solid #001830;
    color: #ffffff;
    &:hover {
      border-color: $border-clr3;
    }
  }
}
</style>
