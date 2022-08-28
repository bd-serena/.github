<template>
  <div>
    <el-dialog
      v-dialogDrag
      title="条件格式设置"
      :visible.sync="ruleObj.newRuleDialogVisible"
      width="480px"
      :before-close="newRuleCancel"
    >
      <div>
        <el-form
          ref="condiForm"
          size="mini"
          :inline="true"
          :model="ruleObj"
          class="demo-form-inline"
          :rules="formRules"
        >
          <!-- <el-form-item style="width:100px">
            <el-input value="单元格值" :readonly="true"></el-input>
          </el-form-item> -->
          <el-form-item label="单元格值">
            <el-select
              v-model="ruleObj.symbol"
              placeholder="请选择"
            >
              <el-option
                v-for="item in ruleObj.options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item prop="mValue" style="margin-right:0">
            <el-input
              v-model="ruleObj.mValue"
              @input="numValid"
              placeholder="请输入数值"
            />
          </el-form-item>
          <el-form-item
            label="设置为"
            label-width="68px"
          >
            <el-select
              v-model="ruleObj.style"
              placeholder="请选择"
            >
              <el-option
                v-for="item in ruleObj.styleList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="预览"
            style="margin-left: 22px;"
          >
            <div :class="[ruleObj.style,'preDiv']">
              ABC123
            </div>
          </el-form-item>
        </el-form>
      </div>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          size="mini"
          @click="newRuleCancel"
        >取 消</el-button>
        <el-button
          size="mini"
          type="primary"
          @click="newRuleSubmit"
        >确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      class="editDialog"
      v-dialogDrag
      title="条件格式规则管理器"
      :visible.sync="ruleObj.mngRuleDialogVisible"
      width="650px"
      :before-close="mngRuleCancel"
    >
      <div>
        <div class="sub-title">
          <span></span>
          <label>当前SHEET规则管理</label>
        </div>
        <el-table
          :data="condiRuleBak"
          style="width: 100%"
          size="mini"
          height="250"
          @row-click="rowClick"
        >
          <el-table-column label="条件规则" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <div>
                单元格值 {{scope.row.symbol==='!='?'&lt;&gt;':scope.row.symbol==='=='?'=':scope.row.symbol}} {{scope.row.mValue}}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="格式" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <div :class="['font-class',scope.row.style]">字体AaBbCc</div>
            </template>
          </el-table-column>
          <el-table-column label="应用单元格" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <div>
                {{cellMap(scope.row.cells)}}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <el-tooltip class="item" effect="dark" content="编辑规则" placement="top-start">
                <span class="icon-A10189_edit table-icon" @click="editRule(scope)"></span>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="删除规则" placement="top-start">
                <span class="icon-A10065_delete table-icon" @click="delRule(scope)"></span>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          size="mini"
          @click="mngRuleCancel"
        >取 消</el-button>
        <el-button
          size="mini"
          type="primary"
          @click="mngRuleSubmit"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import { inputNumber } from "../../utils/comonFunc.js";
import { HST } from "../../utils/HandsTable.js";
import "../../utils/dialogDrag.js";
export default {
  props: {
    propList: {
      type: Object
    }
  },
  components: {
  },
  data () {
    return {
      ruleObj: {
        newRuleDialogVisible: false,
        mngRuleDialogVisible: false,
        symbol: '>',
        mValue: '',
        style: 'allRed',
        options: [
          {
            value: '>',
            label: '大于'
          }, {
            value: '<',
            label: '小于'
          }, {
            value: '==',
            label: '等于'
          }, {
            value: '!=',
            label: '不等于'
          }, {
            value: '>=',
            label: '大于或等于'
          }, {
            value: '<=',
            label: '小于或等于'
          }
        ],
        styleList: [
          {
            label: '浅红填充色深红色文本',
            value: 'allRed'
          },
          {
            label: '黄填充色深黄色文本',
            value: 'allYellow'
          },
          {
            label: '绿填充色深绿色文本',
            value: 'allGreen'
          },
          {
            label: '浅红色填充',
            value: 'redBg'
          },
          {
            label: '红色文本',
            value: 'redText'
          },
          {
            label: '红色边框',
            value: 'redBorder'
          }
        ]
      },
      condiRuleBak: {},
      formRules: {
        mValue: [{ required: true, message: '请输入数值', trigger: "blur" }]
      },
      editFlag: -1
    };
  },

  mounted() {
    this.ruleObj.newRuleDialogVisible = this.propList.newRuleDialogVisible
    this.ruleObj.mngRuleDialogVisible = this.propList.mngRuleDialogVisible
    const index = HST.searchCurSheet().sheetIndex
    let curFormat = this.condiRuleList[`sheet${index}`] || []
    curFormat = curFormat.filter(curRule => curRule.cells.length > 0)
    this.condiRuleBak = (JSON.parse(JSON.stringify(curFormat))).reverse()
    const tempRule = {...this.condiRuleBak[0]}
    this.upRuleIndex((tempRule.index||0) + 1)
  },

  methods: {
    newRuleSubmit() {
      this.$refs.condiForm.validate(valid => {
        if (valid) {
          const index = HST.searchCurSheet().sheetIndex
          const { symbol, mValue, style } = this.ruleObj
          let index1 = this.editFlag
          if (index1 === -1) {
            index1 = this.ruleIndex + 1
            this.upRuleIndex(index1)
          }
          let cells = this.hot.getSelected()
          
          cells.forEach((cell, i) => {
            let [r1, c1, r2, c2] = cell
            if (r1 > r2) {
              [r1, r2] = [r2, r1]
            }
            if (c1 > c2) {
              [c1, c2] = [c2, c1]
            }
            cells[i] = [r1, c1, r2, c2]
          })
          let param = {
            type: 'add',
            sheet: index,
            data: {
              cells: cells,
              symbol,
              mValue,
              style,
              index: index1
            }
          }
          if (this.editFlag > -1) {
            let newRule = { ...param.data }
            delete newRule.cells
            Object.assign(this.condiRuleBak[this.editFlag],newRule)
            this.newRuleCancel()
            return
          }
          const oldCondiRuleArr = JSON.parse(JSON.stringify((this.condiRuleList[`sheet${index}`]||[])))
          this.upCondiRuleList(param)
          this.newRuleCancel()
          let history = {
            type: 'condiRule',
            sheet: index,
            newVal: JSON.parse(JSON.stringify((this.condiRuleList[`sheet${index}`]||[]))),
            origVal: oldCondiRuleArr
          }
          this.upHistoryData(history)
        }
      })
    },
    newRuleCancel() {
      let propList = this.propList
      propList.newRuleDialogVisible = false
      if (this.editFlag > -1) {
        propList.mngRuleDialogVisible = true
        this.ruleObj.mngRuleDialogVisible = true
      }
      this.$emit('update:propList', propList)
      this.ruleObj.newRuleDialogVisible = false
    },
    mngRuleSubmit() {
      const index = HST.searchCurSheet().sheetIndex
      let oldCondiRule = JSON.parse(JSON.stringify((this.condiRuleList[`sheet${index}`]||[])))
      let param ={
        type: 'reset',
        sheet: index,
        data: this.condiRuleBak.reverse()
      }
      this.upCondiRuleList(param)
      this.mngRuleCancel()
      HST.condiRuleClass({type:'edit',data:oldCondiRule})
      let history = {
        type: 'condiRule',
        sheet: index,
        newVal: JSON.parse(JSON.stringify((this.condiRuleList[`sheet${index}`]||[]))),
        origVal: oldCondiRule
      }
      this.upHistoryData(history)
    },
    mngRuleCancel() {
      this.editFlag = -1
      let propList = this.propList
      propList.mngRuleDialogVisible = false
      this.$emit('update:propList', propList)
      this.ruleObj.mngRuleDialogVisible = false
    },
    cellMap(cells) {
      let res = []
      for(let cell of cells) {
        // $G$670:$I$672,$E$668:$I$668
        let [r1, c1, r2, c2] = cell
        let c11 = HST.numToChar(c1)
        let c21 = HST.numToChar(c2)
        if(r1 === r2 && c11 === c21) {
          res.push(`${c11}${r1+1}`)
        } else {
          res.push(`${c11}${r1+1}:${c21}${r2+1}`)
        }
      }
      return res.join()
    },
    editRule(scope) {
      let {$index, row} = scope
      this.editFlag = $index
      let editRuleObj = {
        newRuleDialogVisible: true,
        mngRuleDialogVisible: false,
        symbol: row.symbol,
        mValue: row.mValue,
        style: row.style
      }
      Object.assign(this.ruleObj, editRuleObj)
    },
    delRule(scope) {
      let { $index } = scope
      this.condiRuleBak.splice($index,1)
    },
    rowClick(row) {
      this.hot.selectCells(row.cells)
    },
    numValid() {
      let val2 = inputNumber(this.ruleObj.mValue)
      this.ruleObj.mValue = val2
    },
    ...mapMutations({
      upHistoryData: "ReportMgt/upHistoryData",
      upCondiRuleList: 'ReportMgt/upCondiRuleList',
      upRuleIndex: 'ReportMgt/upRuleIndex'
    })
  },

  computed: {
    ...mapState({
      hot: state => state.ReportMgt.hot,
      condiRuleList: state => state.ReportMgt.condiRuleList,
      ruleIndex: state => state.ReportMgt.ruleIndex
    }),
  }
}

</script>
<style lang='scss' scoped>
/deep/.preDiv {
  height: 30px;
  width: 100px;
  border: 1px solid #C0C4CC;
  border-radius: 5px;
  text-align: center;
}
.font-class {
  text-align:center;
  width: 120px;
}
.sub-title {
  font-size: 16px;
  padding-bottom: 5px;
  > span {
  width: 3px;
  height: 15px;
  background-color: #409eff;
  display: inline-block;
  vertical-align: -2px;
  margin-right: 5px;
  }
}

</style>
<style lang="scss">
.el-dropdown-menu--mini .el-dropdown-menu__item {
  &.nav-item {
    background-color: #eee;
    font-weight: bold;
    color: #666;
  }
  &.text-item {
    padding-left: 20px;
  }
}
[class*="allRed"] {
  background-color: #ffc7ce !important;
  color: #9c0006 !important;
}
[class*="allYellow"] {
  background-color: #ffeb9c !important;
  color: #9c6500 !important;
}
[class*="allGreen"] {
  background-color: #c6efce !important;
  color: #006100 !important;
}
[class*="redBg"] {
  background-color: #ffc7ce !important;
}
[class*="redText"] {
  color: #9c0006 !important;
}
[class*="redBorder"] {
  border: 1px solid #9c0006 !important;
}
[class*="redBdRight"] {
  border-right: 1px solid #9c0006 !important;
}
[class*="redBdBottom"] {
  border-bottom: 1px solid #9c0006 !important;
}
.editDialog {
  ::-webkit-scrollbar {
    width: 9px;
    height: 9px;
  }

  ::-webkit-scrollbar-track {
    opacity: 0;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 4.5px;
    border: 1px solid #ffffff;
    border-right-width: 2px;
    background-color: #c8c8c8;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: #a0a0a0;
  }
}
</style>
