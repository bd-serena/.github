<template>
  <el-form size="mini" :label-width="vscompt.labelWidth" :class="{'multi': vscompt.withSelect}">
    <el-form-item :label="vscompt.label" :title="vscompt.label" :required="vscompt.isSetRequired">
      <el-input
        v-if="vscompt.withSelect"
        style="width:315px"
        :placeholder="(vscompt.symbol==21||vscompt.symbol==20)?'':'请输入关键字'"
        v-model="vscompt.m_value"
        @blur="handleChange"
        :disabled="vscompt.symbol==21||vscompt.symbol==20"
        :title="vscompt.m_value"
      >
        <el-select
          style="width:138px; background-color:transparent"
          placeholder
          v-model="vscompt.symbol"
          slot="prepend"
          size="mini"
          @change="handleChange"
          @focus="clear"
        >
          <el-option
            v-for="item in vscompt.mutipleInputSymbols"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          ></el-option>
        </el-select>
      </el-input>
      <el-input v-else style="width:140px" :placeholder="(vscompt.symbol==21||vscompt.symbol==20)?'':'请输入关键字'" v-model="vscompt.m_value" :title="vscompt.m_value"></el-input>
    </el-form-item>
  </el-form>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import { getFieldFromDsMap, objDeepCopy } from "../../utils/comonFunc.js";
export default {
  props: ["vscompt"],
  data() {
    return {
      optData: null,
      param: null,
      symbols: [
        // { value: 10, label: "包含" },
        // { value: 11, label: "不包含" },
        // { value: 8, label: "在…中（逗号隔开）" },
        // { value: 9, label: "不在…中（逗号隔开）" },
        // { value: 20, label: "为空" },
        // { value: 21, label: "不为空" }
      ],
      isFromOut: true //是否从外部设置
    };
  },
  created() {
    const defaultSymbol = require("../../../public/comptConfig/cellCompt.json");
    this.symbols = defaultSymbol.ElInputSymbols
    if (typeof this.vscompt.mutipleInputSymbols == "undefined") {
      this.vscompt.mutipleInputSymbols = [];
      let mutipleInputSymbols = objDeepCopy(this.symbols);
      this.vscompt.mutipleInputSymbols = mutipleInputSymbols;
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
  mounted() {
    if (
      this.pageCache.operation &&
      (this.pageCache.operation == "preview" ||
        this.pageCache.operation == "design")
    ) {
      if (
        this.vscompt.isSetDefault &&
        !this.vscompt.is_import &&
        this.vscompt.default_value != undefined &&
        this.vscompt.defaultSymbol != undefined
      ) {
        this.vscompt.m_value = this.vscompt.default_value;
        this.vscompt.symbol = this.vscompt.defaultSymbol;
      }
      if(this.vscompt.m_value && this.vscompt.m_value!==''){
        this.handleChange();
      }
    }
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
    handleChange() {
      if (this.isQueryBtn == "false" && this.linkData.length > 0) {
        this.setLinkageCondi();
        this.linkageState = true;
      }
      let label = this.vscompt.symbol
      if (label == 21 || label == 20) {
        this.vscompt.m_value = ''
      }
    },
    clear() {
      //解决下拉框会出现上一次选种植的情况
      let panel = document.querySelector(".el-select-dropdown__item.hover");
      if (panel && panel.classList) {
        panel.classList.remove("hover");
      }
    },
    setLinkageCondi() {
      for (let index = 0; index < this.linkData.length; index++) {
        let link = this.linkData[index];
        var param = {};
        let subComp = this.vscompt;
        // 查询组件的联动标记
        param.isFromQuery = true;
        param.rel_af_id = link.rel_af_id;
        param.m_value = subComp.m_value;
        param.compt_symbol = subComp.symbol;
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
        if (subComp.m_value != null) {
          param.rule_value = subComp.m_value;
          param.symbol = subComp.symbol;
          param.is_dim = 0;
        }
        var target = this.getComptById(link.comptId);
        if (target == null) {
          continue;
        }
        target.comptAttrs.isLinkage = true;
        let linkageCondi = target.comptAttrs.linkageCondi || [],
          flag = true;
        for (let index2 = 0; index2 < linkageCondi.length; index2++) {
          const element = linkageCondi[index2];
          if (
            element.rel_element_id == param.rel_element_id &&
            element.element_id == param.element_id
          ) {
            flag = false;
            this.$set(target.comptAttrs.linkageCondi, index2, param);
            break;
          }
        }
        if (flag) {
          target.comptAttrs.linkageCondi.push(param);
        }
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
</style>
