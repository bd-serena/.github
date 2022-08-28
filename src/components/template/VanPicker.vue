<template>
  <div>
    <div class="van-input">
      <span class="require-sign" v-show="vscompt.isSetRequired">*</span>
      <van-field
        :value="inputText"
        @click="popShow=true"
        :placeholder="'选择'+vscompt.label"
        :is-link="true"
        arrow-direction="down"
        readonly="readonly"
      />
    </div>

    <van-popup position="bottom" v-model="popShow" get-container="body">
      <van-picker
        show-toolbar
        @confirm="onConfirm"
        @cancel="popShow = false"
        :columns="columns"
        @change="onChange"
      />
    </van-popup>
  </div>
</template>

<script>
import { mapState, mapGetters,mapActions } from "vuex";
import { objDeepCopy,objCloneByReplaceKey } from "../../utils/comonFunc.js";
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
      flatCompt: "PageDesign/getFlatCompt",
      isNeedWatchVal: "PageDesign/isNeedWatchVal"
    }),
    ...mapState({
      datasetMap: state => state.AnalyReportAttr.datasetMap,
      pageCache: state => state.HomeBody.pageCache
    })
  },
  watch: {
    "vscompt.m_value": {
      deep: true,
      immediate: true,
      handler: function(newVal, oldVal) {
        let param = (newVal || []).join(",");
        if (
          this.isFromOut &&
          param.trim() != "" &&
          this.inputText == "" &&
          this.vscompt.options.length > 0 &&
          (this.isNeedWatchVal || this.pageCache.operation !== 'design')
        ) {
          this.isFromOut = false;
          this.linkageState = true;
          this.setLinkageCondi(param);
          this.getValues();
        }
      }
    },
    "vscompt.options": {
      handler: function(newVal, oldVal) {
        let param = (this.vscompt.m_value || []).join(",");
        if (
          this.isFromOut &&
          newVal.length > 1 &&
          param.trim() != "" &&
          this.inputText == "" &&
          (this.isNeedWatchVal || this.pageCache.operation !== 'design')
        ) {
          this.isFromOut = false;
          this.setLinkageCondi(param);
          this.getValues();
        }
      }
    }
  },
  data() {
    return {
      inputText: "",
      popShow: false,
      columns: [],
      isFromOut: true //是否从外部设置
    };
  },
  mounted() {
    // this.vscompt.m_value.splice(0, this.vscompt.m_value.length);
    this.getData();
  },
  methods: {
    ...mapActions({
      querySingleDimInfo: "AnalyReportAttr/querySingleDimInfo"
    }),
    getData() {
      var _this = this;
      var params = {
        dim_id: _this.vscompt.dim_id,
        dim_level_id: _this.vscompt.dim_level_id,
        is_all_data: "1",
        parent_val: ""
      };
      this.querySingleDimInfo(params).then(response => {
          var data = response.data.respData;
          if (response.data.respResult == "1" && data) {
            if (_this.vscompt.conArea == "single") {
              data = objCloneByReplaceKey(data,{"dimValue":"dim_value","dimValueDesc":"label"});
              _this.vscompt.options = [
                {
                  value: "",
                  label: "请选择"
                }
              ].concat(data);

              let first = data.map(val => {
                return { id: val.dim_value, text: val.label };
              });

              this.columns.push({
                values: [{ id: "", text: "请选择" }, ...first]
              });
            }
          }
        })
        .catch(function(error) {
          // _this.$message.error("维度数据加载失败");
        });
    },
    setCascade(picker, array) {
      let list = array.map(val => {
        return { id: val.dim_value, text: val.label };
      });
      list.unshift({ id: "", text: "请选择" });
      let item = { values: list };
      this.columns.push(item);
    },
    getChildList(id, list) {
      let result = [];
      for (let item of list) {
        if (id[0].id == item.dim_value) {
          result = item.children;
          break;
        }
      }
      return result;
    },
    onChange(picker, values, idx) {
      values.splice(idx + 1, values.length);
      this.columns.splice(idx + 1, this.columns.length);
      let id = objDeepCopy(values);
      let list = [];
      for (let item of this.vscompt.options) {
        if (item.dim_value == id[0].id) {
          list = item.children || [];
          id.shift();
          break;
        }
      }
      while (id.length > 0) {
        list = this.getChildList(id, list) || [];
        id.shift();
      }
      if (list.length > 0) {
        this.setCascade(picker, list);
      }
    },
    onConfirm(val) {
      let res = [];
      let text = "";
      if (val.length > 0) {
        val.forEach(val => {
          if (val.id != "") {
            res.push(val.id);
            text = val.text;
          }
        });
      }
      // this.vscompt["m_label"] = text;
      this.inputText = text;
      this.vscompt.m_value = res;
      this.handleChange(res);
      this.popShow = false;
    },
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
    handleChange(val) {
      let param = (val || []).join(",");
      if (this.isQueryBtn == "false" && this.linkData.length > 0) {
        this.setLinkageCondi(param);
        this.linkageState = true;
      }
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
        param.m_value = subComp.m_value;
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
    },
    // 根据id获取树形数组内的对象
    getChidlren(id, data) {
      var hasFound = false, // 表示是否有找到id值
        result = null;
      var fn = function(data) {
        if (Array.isArray(data) && !hasFound) {
          // 判断是否是数组并且没有的情况下，
          data.forEach(item => {
            if (item.dim_value != undefined && item.dim_value == id) {
              // 数据循环每个子项，并且判断子项下边是否有id值
              result = {
                id: item.dim_value,
                text: item.label
              }; // 返回的结果等于每一项
              hasFound = true; // 并且找到id值
            } else if (item.children) {
              fn(item.children); // 递归调用下边的子项
            }
          });
        }
      };
      fn(data); // 调用一下
      return result;
    },
    // 如果是前一个页面传过来的条件，要做回显
    getValues() {
      let values = [];
      let text = "";
      let m_value = this.vscompt.m_value;
      for (let index1 = 0; index1 < m_value.length; index1++) {
        const element1 = m_value[index1];
        if (element1 != "") {
          let res = this.getChidlren(element1, this.vscompt.options);
          if (res != null) {
            values.push(res);
            text = res.text;
            this.onChange({}, values, index1);
          }
        }
      }
      if (text != "") {
        this.inputText = text;
        for (let index1 = 0; index1 < values.length; index1++) {
          const element1 = values[index1];
          if (
            this.columns[index1] != undefined &&
            this.columns[index1].values != undefined
          ) {
            let columns = this.columns[index1].values || [];
            for (let index2 = 0; index2 < columns.length; index2++) {
              const element2 = columns[index2];
              if (element2.id == element1.id) {
                this.$set(this.columns, index1, {
                  values: objDeepCopy(columns),
                  defaultIndex: index2
                });
              }
            }
          }
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.van-input {
  .van-cell {
    padding: 5px 10px;
    line-height: 20px;
    border: 1px solid #ebeef5;
    border-radius: 5px;
  }
  /deep/.van-cell__right-icon {
    height: 20px;
    line-height: 20px;
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

