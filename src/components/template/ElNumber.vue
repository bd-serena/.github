<template>
  <el-form
    size="mini"
    :label-width="vscompt.labelWidth"
    :class="{'multi': vscompt.numList.length>1}"
  >
    <el-form-item :label="vscompt.label" :title="vscompt.label" :required="vscompt.isSetRequired">
      <div v-for="(num,index) in vscompt.numList" :key="num.id" style="display:inline-block">
        <el-input
          style="width:140px"
          :placeholder="vscompt.placeholder"
          v-model="num.m_value"
          :class="{'number-input':num.label < 7 }"
          :type="(num||{}).label < 7 ? 'number' : 'text'"
          @blur="event=>numberValid(event,num.m_value,index,(num||{}).label)"
          @input="numValid(num.m_value,index,(num||{}).label)"
          :disabled="num&&(num.label==21||num.label==20)"
          :title="num.m_value"
        >
          <el-select
            style="width:65px; background-color:transparent"
            placeholder
            v-model="num.label"
            slot="prepend"
            size="mini"
            @change="handleChange(index)"
          >
            <el-option
              v-show="index==0"
              v-for="item in vscompt.mutipleNumSymbols1"
              :key="item.value"
              :value="item.value"
              :label="item.label"
            ></el-option>
            <el-option
              v-show="index==1"
              v-for="item in vscompt.mutipleNumSymbols2"
              :key="40+item.value"
              :value="item.value"
              :label="item.label"
            ></el-option>
          </el-select>
        </el-input>
        <div style="display:inline-block; margin:0 10px;" v-if="index<vscompt.numList.length-1">
          <span v-if="vscompt.radioCalcu=='and'">且</span>
          <span v-else-if="vscompt.radioCalcu=='or'">或</span>
        </div>
      </div>
    </el-form-item>
  </el-form>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import { getFieldFromDsMap, objDeepCopy, inputNumber } from "../../utils/comonFunc.js";
export default {
  props: ["vscompt"],
  data() {
    return {
      optData: null,
      param: null,
      symbols: [
        // { value: 2, label: ">" },
        // { value: 1, label: "<" },
        // { value: 3, label: "=" },
        // { value: 4, label: "<=" },
        // { value: 5, label: ">=" },
        // { value: 8, label: "在…中（逗号隔开）" },
        // { value: 9, label: "不在…中（逗号隔开）" }
      ]
    };
  },
  created() {
    const defaultSymbol = require("../../../public/comptConfig/cellCompt.json");
    this.symbols = defaultSymbol.ElNumberSymbols
    // 初始化时下拉选项都有
    if (typeof this.vscompt.mutipleNumSymbols1 == "undefined") {
      this.vscompt.mutipleNumSymbols1 = [];
      // let mutipleNumSymbols1 = item.comptAttrs.mutipleNumSymbols1;
      let mutipleNumSymbols1 = objDeepCopy(this.symbols);
      // this.$nextTick(() => {
        this.vscompt.mutipleNumSymbols1 = mutipleNumSymbols1;
      // });
      // this.initNumSybols();
    }
    if (typeof this.vscompt.mutipleNumSymbols2 == "undefined") {
      this.vscompt.mutipleNumSymbols2 = [];
      // let mutipleNumValue = item.comptAttrs.mutipleNumValue;
      let mutipleNumSymbols2 = objDeepCopy(this.symbols);

      // this.$nextTick(() => {
        this.$set(this.vscompt.mutipleNumSymbols2, mutipleNumSymbols2);
        this.vscompt.mutipleNumSymbols2 = mutipleNumSymbols2;
      // });
      // this.initNumSybols();
    }
  },
  mounted() {
    if (
      this.pageCache.operation &&
      (this.pageCache.operation == "preview" ||
        this.pageCache.operation == "design")
    ) {
      if (
        this.vscompt.isSetDefault &&
        !this.vscompt.is_import &&
        this.vscompt.defaultNumList != undefined
      ) {
        this.vscompt.defaultNumList.forEach((item, i) => {
          var num = objDeepCopy(item);
          this.$set(this.vscompt.numList, i, num);
        });
      }
    }
  },
  computed: {
    linkData() {
      let data = this.vscompt.mainLinkageData || [];
      return data;
    },
    isQueryBtn() {
      let target = this.$parent.$parent.vscompt;
      if (target != null) {
        let data = (target.extendSetting || {}).isNeedBtn || "false";
        return data;
      } else {
        return "false";
      }
    },
    ...mapGetters({
      flatCompt: "PageDesign/getFlatCompt"
    }),
    ...mapState({
      s_edcuiCompts: state => state.PageDesign.s_edcuiCompts,
      datasetMap: state => state.AnalyReportAttr.datasetMap,
      pageCache: state => state.HomeBody.pageCache
    })
  },
  methods: {
    getComptById(id) {
      var result;
      for (var item of this.flatCompt) {
        if (item.comptId == id) {
          result = item;
          break;
        }
      }
      return result;
    },
    handleChange(index) {
      if (this.isQueryBtn == "false" && this.linkData.length > 0) {
        this.setLinkageCondi();
        this.linkageState = true;
      }
      if(index !== undefined) {
        let num = this.vscompt.numList[index]
        if (num.label == 21 || num.label == 20) {
          num.m_value = ''
        }
      }
    },
    numberValid(InputEvent,val, index, type) {
      this.handleChange()
      if (val === null || val === undefined || val === '') {
        InputEvent.target.value = ''
      }
      if (type > 7) {
        let val2 = inputNumber(val,'mulit').replace(/\-+$/g,'')
        this.vscompt.numList[index].m_value = val2
      }
    },
    numValid(val, index, type) {
      if (type > 7) {
        let val2 = inputNumber(val,'mulit')
        this.vscompt.numList[index].m_value = val2
      }
    },
    setLinkageCondi() {
      for (let index = 0; index < this.linkData.length; index++) {
        let link = this.linkData[index];
        var param = {};
        let result = [];
        let subComp = this.vscompt;
        // 查询组件的联动标记
        param.isFromQuery = true;
        param.rel_af_id = link.rel_af_id;
        param.numList = subComp.numList;
        param.radioCalcu = subComp.radioCalcu;
        param.compt_type = subComp.type;
        param.rel_element_id = subComp.element_id;
        param.col_type = 2;
        param.exp_id = "";
        let res = getFieldFromDsMap(this.datasetMap, {
          element_id: link.element_id,
          af_id: link.af_id
        });
        param.obj_id = res.tab_id || "";
        param.col_id = res.col_id || "";
        param.element_id = link.element_id;
        param.is_dim = 0;
        if (subComp.numList.length > 0) {
          subComp.numList.forEach((val, idx) => {
            param.rule_value = subComp.numList[idx].m_value;
            param.symbol = subComp.numList[idx].label || "";
            result.push(objDeepCopy(param));
          });
        }
        if (subComp.numList.length > 1) {
          result[0].radioCalcu = subComp.radioCalcu;
        } else {
          delete result[0].radioCalcu;
        }
        var target = this.getComptById(link.comptId);
        if (target == null) {
          continue;
        }
        target.comptAttrs.isLinkage = true;
        // 数值型可能是单个也可能是区间(2个条件) 先把已有的删掉，再设值
        let linkageCondi = target.comptAttrs.linkageCondi || [],
          idxArr = [];
        for (let index2 = 0; index2 < linkageCondi.length; index2++) {
          const element = linkageCondi[index2];
          if (
            element.rel_element_id == param.rel_element_id &&
            element.element_id == param.element_id
          ) {
            idxArr.push(index2);
          }
        }
        for (let index3 = idxArr.length - 1; index3 > -1; index3--) {
          linkageCondi.splice(idxArr[index3], 1);
        }
        target.comptAttrs.linkageCondi.push(...result);
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.multi.el-form {
  width: 470px;
}
/deep/.el-input.is-disabled .el-input-group__prepend .el-input__inner,
/deep/.el-input.is-disabled .el-input-group__prepend .el-input__icon {
  cursor: pointer;
}
/deep/.number-input {
  >input.el-input__inner {
    padding-right: 0;
  }
}
</style>
