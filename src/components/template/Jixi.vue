<template>
  <div class="jixi" :class="{twoBtn:vscompt.resetBtnShow}">
    <Cell
      v-for="compt in vscompt.fieldList"
      :key="compt.comptSort"
      :tableList="tableList"
      :isDesign="true"
      :vscompt="compt"
      :class="vscompt.wrap?mulTine(compt.comptAttrs.label.length,wordCount):line(compt.comptAttrs.label.length,wordCount)"
      ref="cell"
    ></Cell>
    <el-button v-show="vscompt.resetBtnShow" class="reset" @click="resetQuery" size="mini" type="warning">重置</el-button>
  </div>
</template>

<script>
import Cell from "../design/Cell.vue";
import { mapState, mapGetters, mapMutations } from "vuex";
import { objDeepCopy } from "../../utils/comonFunc";
export default {
  props: ["vscompt", "tableList"],
  components: {
    Cell
  },
  data() {
    return {};
  },
  methods: {
    resetQuery() {
      let fieldList = this.vscompt.fieldList;
      for (var params of fieldList) {
        if (params.type == "ElButton") {
          continue;
        }
        if (params.comptAttrs.is_import) {
          params.comptAttrs.m_value = [];
        } else if (params.type == "ElDatePicker") {
          if (params.comptAttrs.cycleType == "date") {
            params.comptAttrs.m_value = [];
          } else if (params.comptAttrs.cycleType == "daterange") {
            params.comptAttrs.m_value = [];
          }
        } else if (params.type == "ElNumber") {
          let defaultNUmList = objDeepCopy(params.comptAttrs.defaultNumList);
          params.comptAttrs.numList = defaultNUmList;
        } else {
          if (params.comptAttrs.default_value) {
            params.comptAttrs.m_value = params.comptAttrs.default_value;
          } else {
            if (params.comptAttrs.defaultSymbol && params.comptAttrs.symbol) {
              let defaultSymbol = params.comptAttrs.defaultSymbol;
              params.comptAttrs.symbol = defaultSymbol;
            }
            if (
              typeof params.comptAttrs.m_value == "object" &&
              params.comptAttrs.m_value.constructor == Array
            ) {
              params.comptAttrs.m_value = [];
            } else {
              params.comptAttrs.m_value = "";
            }
            if (params.comptAttrs.conArea === 'mutiple') {  //重置多选下拉框
              params.comptAttrs.treeSelVal = [];
              params.comptAttrs.m_label = [];
            }
          }
        }
      }
    },
    ...mapMutations({
      setSelLoadCnt: "QueryTable/setSelLoadCnt"
    })
  },
  computed: {
    line() {
      let wordCount = Number.parseInt(this.vscompt.wordCount);
      let line = "";
      return function(labeLength, wordNum) {
        // if (labeLength > wordNum) {
        // if (!this.wrap) {
        switch (wordCount) {
          case 1:
            // console.log("wordCount是", wordCount);
            line = "line1";
            break;
          case 2:
            line = "line2";
            break;
          case 3:
            line = "line3";
            break;
          case 4:
            line = "line4";
            break;
          case 5:
            line = "line5";
            break;
          case 6:
            line = "line6";
            break;
          case 7:
            line = "line7";
            break;
          case 8:
            line = "line8";
            break;
          case 9:
            line = "line9";
            break;
          case 10:
            line = "line10";
            break;
          default:
            line = "line6";

            break;
        }
        return line;
      };
    },
    mulTine() {
      let wordCount = Number.parseInt(this.vscompt.wordCount);
      let mulTine = "";
      return function(labeLength, wordNum) {
        if (labeLength > wordNum) {
          if (this.vscompt.wrap) {
            switch (wordCount) {
              case 1:
                // console.log("wordCount是", wordCount);
                mulTine = "mulTine1";
                break;
              case 2:
                mulTine = "mulTine2";
                break;
              case 3:
                mulTine = "mulTine3";
                break;
              case 4:
                mulTine = "mulTine4";
                break;
              case 5:
                mulTine = "mulTine5";
                break;
              case 6:
                mulTine = "mulTine6";
                break;
              case 7:
                mulTine = "mulTine7";
                break;
              case 8:
                mulTine = "mulTine8";
                break;
              case 9:
                mulTine = "mulTine9";
                break;
              case 10:
                mulTine = "mulTine10";
                break;
              default:
                mulTine = "mulTine6";

                break;
            }
            // console.log("mulTine是：", mulTine);
          }
          // flag =true ;
        } else {
          switch (wordCount) {
            case 1:
              // console.log("wordCount是", wordCount);
              mulTine = "line1";
              break;
            case 2:
              mulTine = "line2";
              break;
            case 3:
              mulTine = "line3";
              break;
            case 4:
              mulTine = "line4";
              break;
            case 5:
              mulTine = "line5";
              break;
            case 6:
              mulTine = "line6";
              break;
            case 7:
              mulTine = "line7";
              break;
            case 8:
              mulTine = "line8";
              break;
            case 9:
              mulTine = "line9";
              break;
            case 10:
              mulTine = "line10";
              break;
            default:
              break;
          }
        }
        // return flag;
        return mulTine;
      };
    },

    fieldList() {
      return this.vscompt.fieldList;
    },
    ...mapState({
      resetBtnShow: state => state.QueryTable.resetBtnShow,
      wrap: state => state.QueryTable.wrap,
      wordCount: state => state.QueryTable.wordCount,
      selLoadCnt:state => state.QueryTable.selLoadCnt
    }),
    ...mapGetters({
      noComputedTbCols: "QueryTable/noComputedTbCols"
    })
  },
  mounted(){
    let selCnt = (this.vscompt.fieldList || []).filter(item=>{
      return item.type === "ElCascader";
    }).length || 0;
    if(this.$route.name === "reportView"){
      this.setSelLoadCnt({
        type:"set",
        val:selCnt
      });
    }
  }
};
</script>

<style lang="scss" scoped>
/* yxq */
.el-button,
.el-form {
  display: inline-block;
}
.jixi {
  /deep/ {
    .el-select {
      width: 140px;
    }
  }
}

.el-date-editor.el-input {
  width: 200px;
}
.el-button {
  float: right;
  position: absolute;
  right: 0px;
  top: 50%;
  margin-top: -14px;
}
.twoBtn {
  .el-button:first-child {
    float: right;
    position: absolute;
    right: 0px;
    top: 50%;
    margin-top: -24px;
  }
  .reset {
    float: right;
    position: absolute;
    right: 0px;
    top: 50% !important;
    margin-top: 5px !important;
  }
}
.jixi {
  /deep/.el-form-item__label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
    box-sizing: border-box;
    width: 112px !important;
    padding-left: 18px;
  }
  /deep/ .el-form-item__content {
    margin-left: 112px !important;
  }
}
@mixin setWithAndMl($width) {
  /deep/.el-form-item__label {
    width: $width !important;
  }
  /deep/ .el-form-item__content {
    margin-left: $width !important;
  }
}
@mixin setOLinePadLeft($padLeft) {
  /deep/ .el-form-item__label {
    white-space: nowrap;
    font-size: 12px;
    box-sizing: border-box;
    padding-left: $padLeft;
  }
}
//单行响应用户输入的查询设置中的文字数变化

.line10 {
  @include setOLinePadLeft(18px);
  @include setWithAndMl(150px);
}

.line9 {
  @include setOLinePadLeft(18px);
  @include setWithAndMl(148px);
}
.line8 {
  @include setOLinePadLeft(18px);
  @include setWithAndMl(136px);
}
.line7 {
  @include setOLinePadLeft(18px);
  @include setWithAndMl(124px);
}

.line6 {
  @include setOLinePadLeft(18px);
  @include setWithAndMl(112px);
}

.line5 {
  @include setOLinePadLeft(18px);
  @include setWithAndMl(100px);
}
.line4 {
  @include setOLinePadLeft(18px);
  @include setWithAndMl(88px);
}
.line3 {
  @include setOLinePadLeft(18px);
  @include setWithAndMl(76px);
}

.line2 {
  @include setOLinePadLeft(18px);
  @include setWithAndMl(64px);
}
.line1 {
  @include setOLinePadLeft(18px);
  @include setWithAndMl(52px);
}
@mixin setPadLeft($padLeft) {
  /deep/ .el-form-item__label {
    white-space: normal;
    line-height: 14px;
    padding-left: $padLeft;
    height: 30px;
    word-break: break-word;
    // border: 1px solid yellow;
    box-sizing: border-box;
  }
}

//响应用户输入的查询设置中的文字数变化

.mulTine10 {
  @include setPadLeft(18px);
  @include setWithAndMl(150px);
}
.mulTine9 {
  @include setPadLeft(18px);
  @include setWithAndMl(148px);
}
.mulTine8 {
  @include setPadLeft(18px);
  @include setWithAndMl(136px);
}
.mulTine7 {
  @include setPadLeft(18px);
  @include setWithAndMl(124px);
}
.mulTine6 {
  @include setPadLeft(18px);
  @include setWithAndMl(112px);
}

.mulTine5 {
  @include setPadLeft(18px);
  @include setWithAndMl(100px);
}
.mulTine4 {
  @include setPadLeft(18px);
  @include setWithAndMl(88px);
}
.mulTine3 {
  @include setPadLeft(18px);
  @include setWithAndMl(76px);
}

.mulTine2 {
  @include setPadLeft(18px);
  @include setWithAndMl(64px);
}
.mulTine1 {
  @include setPadLeft(18px);
  @include setWithAndMl(52px);
}
</style>

