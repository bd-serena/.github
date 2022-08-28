<template >
  <div class="pane-style">
    <el-row class="item-block">
      <div class="sub-nav-title">
        <span class="icon-A10165_upload"></span>
        按钮设置
      </div>
      <el-checkbox class="cbox" @change="resetChange" v-model="s_edcuiCompts[0].comptAttrs.resetBtnShow">展示重置按钮</el-checkbox>
    </el-row>
    <el-row class="item-block">
      <div class="sub-nav-title">
        <span class="icon-A10165_upload"></span>
        字段标签
      </div>
    </el-row>
    <el-row class="item-block">
      <el-radio v-model="s_edcuiCompts[0].comptAttrs.radioArr" @change="radioChange" label="1">默认(6个中文宽度)</el-radio>
      <el-row class="item-block" style="margin-top:10px">
        <el-radio v-model="s_edcuiCompts[0].comptAttrs.radioArr" @change="radioChange" label="2">宽度自定义：
          <el-input
            :disabled="s_edcuiCompts[0].comptAttrs.radioArr!=='2'"
            @input="inputChange"
            placeholder="单位数"
            v-model="cTNum"
            size="mini"
          ></el-input>个中文
        </el-radio>
        <div class="radioTip">宽度自定义最多10个中文,超过文字用省略号展示</div>
      </el-row>

      <el-row class="item-block">
        <el-checkbox class="cbox" @change="wrapChange" v-model="s_edcuiCompts[0].comptAttrs.wrap">文字自动换行</el-checkbox>
        <div class="radioTip">最多2行,换行会缩排文字,超过文字则自动隐藏</div>
      </el-row>
    </el-row>
  </div>
</template>
<script>
import { mapState, mapGetters, mapMutations, mapActions } from "vuex";
import { type } from "os";

export default {
  data() {
    return {
      radio: "1",
      checkReset: false,
      // cTNum: "6"
    };
  },
  computed: {
    ...mapState({
      s_edcuiCompts: state => state.compt.s_edcuiCompts,
    }),
    cTNum:{
       get() {
        return this.s_edcuiCompts[0].comptAttrs.wordCount;
      },
      set(val){
        this.s_edcuiCompts[0].comptAttrs.wordCount= val;
      }
    },
    resetBtnShow: {
      get() {
        return this.$store.state.QueryTable.resetBtnShow;
      },
      set(val) {
        this.$store.state.QueryTable.resetBtnShow = val;
      }
    },
    wrap: {
      get() {
        return this.$store.state.QueryTable.wrap;
      },
      set(val) {
        this.$store.state.QueryTable.wrap = val;
      }
    },
    wordCount: {
      get() {
        return this.$store.state.QueryTable.wordCount;
      },
      set(val) {
        this.$store.state.QueryTable.wordCount = val;
      }
    }
  },
  watch: {
    radio(val) {
      // console.log(typeof val,"单选的值")
    },
    cTNum(val,olaval){
      // console.log('val', val);
      // console.log('olaval',olaval );
      let arr=["1","2","3","4","5","6","7","8","9","10"];
      if(arr.indexOf(val)==-1&&val){
        this.$message.error("仅支持输入1-10的数字");
        this.cTNum = olaval;
        // this.wordCount = olaval;
      }
      // if(!val){
      //   this.wordCount=olaval
      // }
    }
  },
  methods: {
    radioChange(val) {
      // console.log('单选框的值',val );
      if (val == "1") {
        this.cTNum = "6";
        // this.wordCount = "6";
      }
      if (val == "2") {
        if (!this.cTNum) {
          this.cTNum = "6";
          // this.wordCount = "6";
        }
      }
    },
    inputChange() {
      let num = this.cTNum;
      // console.log('num类型', num );
      if (num > 10) {
        this.$message.error("最多不能超过10个单位宽度");
        this.cTNum = 10;
        this.wordCount = "10";
        return false;
      } else {
        this.wordCount = num;
      }
    },
    resetChange(val) {
      this.resetBtnShow = val;
      // console.log('this.resetBtnShow是', this.resetBtnShow);
      // console.log('this.$store.state.QueryTable.resetBtnShow是', this.$store.state.QueryTable.resetBtnShow);
    },
    wrapChange(val) {
      // console.log("val", val);
      // if (val) {
      // }
      this.wrap = val;
      // console.log('this.resetBtnShow是', this.wrap);
      // console.log('this.$store.state.QueryTable.resetBtnShow是', this.$store.state.QueryTable.wrap);
    }
  }
};
</script>
<style lang="scss" scoped>
$font-main2: #afc0d0;
$font-clr1: #45fffd;
$border-clr3: #498bce;
$input-bg-clr1: #0e3b67; // 输入框背景色

/***样式块**/
.pane-style {
  height: 100%;
  padding: 10px;
  padding-left: 20px;
  .item-block {
    margin-bottom: 12px;
  }

  .sub-nav-title {
    height: 22px;
  }
  .item-block .sub-nav-title {
    color: $font-clr1;
  }
  span[class^="icon-"] {
    font-size: 12px;
  }

  /deep/.cbox .el-checkbox__input.is-checked + .el-checkbox__label {
    color: $font-main2;
  }
  /deep/.el-radio__label {
    color: $font-main2;
  }
  /deep/.el-input {
    // color: $font-main2;
    width: 70px;
    margin-right: 17px;
  }
  .radioTip {
    margin-left: 30px;
    color: $font-main2;
    opacity: 0.5;
  }
  /deep/.el-input__inner {
    color: #ffffff;
    background-color: #0e3b67;
    border: 1px solid #0a2b4c;
  }
}
</style>
