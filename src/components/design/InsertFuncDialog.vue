<template>
  <el-dialog
    size="mini"
    title="插入函数"
    width="500px"
    :visible.sync="showDialogInsertFunc"
    :append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :destroy-on-close="true"
  >
    <el-form
      size="mini"
      label-position="left"
      label-width="90px" 
      v-if="showDialogInsertFunc"
    >
      <el-form-item label="搜索函数">
        <el-input size="mini" style="width:180px" v-model="value" placeholder="请输入您要查找的函数名称"></el-input>
      </el-form-item>
      <el-form-item label="或选择类别">
        <el-select
          size="mini"
          v-model="funcType"
          placeholder="全部"
          @change="selectType"
        >
          <el-option
            v-for="(item,index) in formulasType"
            :key="index"
            :label="item.type"
            :value="item.type">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="func-block" label="选择函数">
        <el-scrollbar style="height:100%;" :native="false" :noresize="false" tag="section">
          <ul class="func-wrap">
            <li
              v-for="(item,index) in formulasData"
              :key="item.value"
              :class="{select:(curFunc===''&&index===0)||curFunc===item.label}"
              @click="selectFunc(item.label)"
              @dblclick="submitDialog"
            > {{item.label}}</li>
          </ul>
        </el-scrollbar>
      </el-form-item>
      <el-row>
        <div class="desc">{{funcDesc}}</div>
        <div>{{funcInfo}}</div>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="closeDialog">取 消</el-button>
      <el-button type="primary" @click="submitDialog" size="mini">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { mapState, mapMutations, mapActions } from "vuex";
const formulasJson = require("../../../public/comptConfig/formulasType.json"),
  formulas = require("../../../public/comptConfig/formulas.json")
export default {
  data() {
    return {
      value: '',
      funcType: '全部',
      formulasType: formulasJson,
      formulasData: formulas,
      funcDesc: '',
      funcInfo: '',
      curFunc: '',
    }
  },
  computed: {
    ...mapState({
      hot: state => state.ReportMgt.hot,
    }),
    showDialogInsertFunc: {
      get() {
        return this.$store.state.ReportMgt.showDialogInsertFunc;
      },
      set(value) {
        this.upShowDialogInsertFunc(value);
      }
    },
  },
  watch: {
    value(val) {
      this.searchFunc()
    },
    showDialogInsertFunc(val) {
      if (val === true) {
        this.value = ''
        this.funcType = '全部'
        this.formulasData = formulas
        this.funcInfo = this.formulasData[0].value
        this.funcDesc = this.formulasData[0].title
        this.curFunc = ''
        if (this.formulasType[0].type === '推荐') {
          this.formulasType.shift()
        }
      }
    }
  },
  mounted() {
    this.sort()
    this.funcInfo = this.formulasData[0].value
    this.funcDesc = this.formulasData[0].title
  },
  methods: {
    /**查找函数 */
    searchFunc() {
      this.formulasData = [...formulas.filter(item => item.label.indexOf(this.value.toLocaleUpperCase()) > -1)]
      if (this.formulasData !== null && this.formulasData.length > 0) {
        if (this.value === '') {
          if (this.formulasType[0].type === '推荐') {
            this.formulasType.shift()
          }
          this.funcType = '全部'
        } else {
          if (this.formulasType[0].type !== '推荐') {
            this.formulasType.unshift({ "type": "推荐", "label": [] })
          }
          this.funcType = '推荐'
        }
        this.funcInfo = this.formulasData[0].value
        this.funcDesc = this.formulasData[0].title
        this.curFunc = this.formulasData[0].label
      } else {
        this.funcInfo = ''
        this.funcDesc = ''
        this.curFunc = ''
      }
    },
    /** 选择函数类型*/
    selectType() {
      if (this.funcType !== '全部' && this.funcType !== '推荐') {
        let data = this.formulasType.filter(item => item.type === this.funcType),
          fmlArr = data[0].label || []
        this.formulasData = formulas.filter(item => fmlArr.indexOf(item.label) > -1)
        this.funcInfo = this.formulasData[0].value
        this.funcDesc = this.formulasData[0].title
      } else if (this.funcType === '全部') {
        this.formulasData = formulas
        this.funcInfo = this.formulasData[0].value
        this.funcDesc = this.formulasData[0].title
      } else {//推荐 
        if (this.value === '') {
          this.formulasData = []
          this.funcInfo = ''
          this.funcDesc = ''
        } else {//this.value不为空
          this.searchFunc()
        }
      }

    },
    /** 选中具体函数名 */
    selectFunc(val) {
      this.curFunc = val
      let curFml = formulas.filter(item => item.label === val)
      if (curFml !== null) {
        this.funcInfo = curFml[0].value
        this.funcDesc = curFml[0].title
      }
    },
    /** 排序 */
    sort() {
      this.formulasData = formulas.sort(function (a, b) {
        return a.label.localeCompare(b.label)
      })
    },
    closeDialog() {
      this.upShowDialogInsertFunc(false)
    },
    /** 确定按钮 */
    submitDialog() {
      let param = ""
      if (this.curFunc !== "") {
        param = `=${this.curFunc}()`
      } else {
        try {
          this.curFunc = this.formulasData[0].label
          param = `=${this.curFunc}()`
        } catch (e) { }
      }
      this.insertFunc(param)
      this.upShowDialogInsertFunc(false)
    },
    ...mapMutations({
      upShowDialogInsertFunc: "ReportMgt/upShowDialogInsertFunc"
    }),
    ...mapActions({
      insertFunc: "ReportMgt/insertFunc"
    }),
  },
}
</script>
<style lang="scss" scoped>
$bg-clr: #ecf5ff;
$main-clr: #66b1ff;
$bd-clr: #e4e7ed;
.func-block {
  /deep/label {
    float: none;
  }
  /deep/.el-form-item__content {
    margin-left: 0 !important;
    border: 1px solid $bd-clr;
    border-radius: 4px;
  }
}
.func-wrap {
  height: 200px;
  li {
    padding: 0 5px;
  }
  .select,
  li:hover,
  li:focus {
    background-color: $bg-clr;
    color: $main-clr;
    cursor: pointer;
  }
}
.desc {
  font-weight: bold;
}
</style>
