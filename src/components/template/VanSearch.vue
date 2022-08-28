<template>
  <div class="van-input">
    <span class="require-sign" v-show="vscompt.isSetRequired">*</span>
    <van-search
      v-model="vscompt.m_value"
      :placeholder="'请输入'+vscompt.col_chs_name"
      left-icon
      ref="searchInput"
      right-icon="search"
      :clearable="false"
      @search="setLinkageCondi"
    />
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import { getFieldFromDsMap } from "../../utils/comonFunc.js";
export default {
  props: ["vscompt"],
  computed: {
    linkData() {
      let data = this.vscompt.mainLinkageData || [];
      return data;
    },
    isQueryBtn() {
      let target = this.$parent.$parent.$parent.$parent.vscompt.comptAttrs;
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
      dgwMsUrl: state => state.dgwMsUrl,
      datasetMap: state => state.AnalyReportAttr.datasetMap
    })
  },
  data() {
    return {};
  },
  watch: {
    "vscompt.m_value": {
      handler(newVal, oldVal) {
        this.$nextTick(()=>{
          if (this.isQueryBtn == "false" && this.linkData.length > 0) {
            this.setLinkageCondi();
            this.linkageState = true;
          }
        })
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    let input = this.$refs.searchInput;
    input.querySelector(".van-icon-search").addEventListener("click", () => {
      this.setLinkageCondi();
      this.linkageState = true;
    });
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
    setLinkageCondi() {
      let dim_value = this.vscompt.m_value;
      for (let index = 0; index < this.linkData.length; index++) {
        let link = this.linkData[index];
        var param = {};
        let subComp = this.vscompt;
        // 查询组件的联动标记
        param.isFromQuery = true;
        param.rel_af_id = link.rel_af_id;
        param.m_value = subComp.m_value;
        param.compt_symbol = 10;
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
        param.rule_value = dim_value;
        param.symbol = 10; //3:=,8:in 10 like
        param.is_dim = 1;
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
.van-input {
  .van-search {
    padding: 0;
  }
  .van-cell {
    line-height: 20px;
  }
  .van-search__content {
    background-color: #fff;
    border: 1px solid #ebeef5;
    border-radius: 5px;
  }
}
.require-sign{
  color:#F56C6C;
  position:absolute;
  top:7px;
  left:-10px;
  z-index: 1;
}
</style>

