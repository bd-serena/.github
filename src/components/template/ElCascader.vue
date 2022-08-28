<template>
  <el-form size="mini" :label-width="vscompt.labelWidth">
    <el-form-item :label="vscompt.label" :title="vscompt.label" :required="vscompt.isSetRequired">
      <!-- <GeminiScrollbar class="my-scroll-bar"> -->
      <el-cascader
        v-if="vscompt.conArea == 'single'"
        filterable
        :show-all-levels="false"
        expand-trigger="hover"
        :props="props"
        :options="vscompt.options"
        v-model="vscompt.m_value"
        @change="handleChange"
        popper-class="cascader-drop-wrap"
        ref="combotree"
        clearable
        :title="vscompt.m_label&&vscompt.m_label.length>0?vscompt.m_label[vscompt.m_label.length - 1]:''"
      >
        <div slot-scope="{ node, data }">
          <div v-if="data.label">
            <div class="vue-treeselect__icon-container">
              <span class="vue-treeselect__icon-loader"></span>
            </div>
            <span class="vue-treeselect__tip-text vue-treeselect__loading-tip-text">加载中...</span>
          </div>
          <span v-else>{{ data.dimValueDesc }}</span>
        </div>
      </el-cascader>
      <div v-else style="display:inline-block;width:140px;">
        <SelectTree :options="vscompt.options2" :vscompt="vscompt" @selectChange="handleChange" />
      </div>
      <!-- </GeminiScrollbar> -->
    </el-form-item>
  </el-form>
</template>
<script>
import SelectTree from "./ElTreeSelectNew.vue";
import { mapState, mapGetters, mapActions,mapMutations } from "vuex";
import { getFieldFromDsMap } from "../../utils/comonFunc.js";
export default {
  components: {
    SelectTree
  },
  props: ["vscompt", "selectType"],
  data() {
    return {
      param: null,
      province: "",
      props: {
        value: "dimValue",
        label: "dimValueDesc",
        children: "children"
      },
      linkageState: false
    };
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
      dgwMsUrl: state => state.dgwMsUrl,
      datasetMap: state => state.AnalyReportAttr.datasetMap,
      s_edcuiCompts: state => state.PageDesign.s_edcuiCompts
    })
  },
  mounted() {
    if (this.vscompt.conArea == "single") {
      this.vscompt.options = [{label:'加载中'}]
      this.getData();
    }
  },
  methods: {
    ...mapActions({
      querySingleDimInfo: "AnalyReportAttr/querySingleDimInfo"
    }),
    ...mapMutations({
      setSelLoadCnt: "QueryTable/setSelLoadCnt"
    }),
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
    handleChange(e) {
      if(this.vscompt.conArea == "single") {  //单选时候给m_label赋值
        this.vscompt["m_label"] = this.$refs.combotree.currentLabels || [];
      }
      let param = (e || []).join(",");
      if (this.isQueryBtn == "false" && this.linkData.length > 0) {
        this.setLinkageCondi(param);
        this.linkageState = true;
      }
    },
    getValue(value) {
      this.vscompt.m_value = value;
      this.$nextTick(() => {
        this.vscompt["m_label"] = this.$refs.combotree.valueText;
      });
    },
    async getData() {
      var _this = this;
      var params = {
        dim_id: _this.vscompt.dim_id,
        dim_level_id: _this.vscompt.dim_level_id,
        is_all_data: "1",
        parent_val: ""
      };
      this.querySingleDimInfo(params)
        .then(response => {
          var data = response.data.respData;
          if (response.data.respResult == "1" && data) {
            if (_this.vscompt.conArea == "single") {
              _this.vscompt.options = [
                {
                  dimValue: "",
                  dimValueDesc: "请选择"
                }
              ].concat(data);
            }
            _this.$set(_this.vscompt, "options2", data);
            // _this.vscompt.options2 = data;
          } else {
            // _this.$message.error("维度数据为空");
          }
        })
        .catch(function(error) {
          // _this.$message.error("维度数据加载失败");
        }).finally(()=>{
          if(_this.$route.name === "reportView"){
            _this.setSelLoadCnt({type:"decrease"});
          }
        });
    },
    setLinkageCondi(val) {
      let dim_value = val;
      for (let index = 0; index < this.linkData.length; index++) {
        let link = this.linkData[index];
        var param = {};
        let subComp = this.vscompt;
        // 查询组件的联动标记
        param.isFromQuery = true;
        param.rel_af_id = link.rel_af_id;
        param.m_value = val.split(",") || []; //subComp.m_value 这时候m_value还没更新
        param.compt_type = subComp.type;
        param.conArea = subComp.conArea;
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
        param.symbol = 8; //3:=,8:in
        param.is_dim = 1;
        param.treeSelVal = subComp.treeSelVal;
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
  },
  watch: {
    "vscompt.conArea": {
      immediate: true,
      handler: function(newVal) {
        if (["report", "pageDesign", "design"].includes(this.$route.name)) {//设计页面切换单选、多选清空值
          this.vscompt["m_value"] = [];
          this.vscompt["treeSelVal"] = [];
          this.vscompt["m_label"] = [];
        }
        if(newVal === 'single' && (this.vscompt.options||[]).length === 0) {
          this.vscompt.options = [{label:'加载中'}]
          this.getData();
        }
      }
    }
  }
};
</script>
<style scoped>
.el-cascader /deep/ .el-cascader__label {
  z-index: 1000 !important;
  padding-right: 0;
  width: calc(100% - 25px);
}
/* 预览页面样式没有覆盖问题 */
.el-cascader {
  width: 140px;
}
/* .el-cascader /deep/ .el-input__inner {
  background-color: transparent;
} */
</style>

