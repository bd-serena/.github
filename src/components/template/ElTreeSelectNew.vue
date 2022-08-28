<template>
  <treeselect
    v-if="vscompt.treeSelVal"
    v-model="vscompt.treeSelVal"
    :class="['mulSelect',{allClass:allClass},{noFlat:!vscompt.checkStrictly}]"
    :multiple="true"
    :options="newOptions"
    value-consists-of="ALL"
    sort-value-by="LEVEL"
    placeholder="请选择"
    style="width:100%;"
    :open-on-click="true"
    :default-expand-level="vscompt.checkStrictly?0:1"
    :append-to-body="true"
    ref="treeselect"
    noOptionsText="暂无数据"
    loadingText="加载中..."
    clearAllText="清空"
    @select="scrollTo"
    @deselect="scrollTo"
    @open="scrollTo('open')"
    @input="valChange"
    :flat="vscompt.checkStrictly"
    :title="vscompt.m_label"
  >
    <label
      slot="option-label"
      slot-scope="{ node, shouldShowCount, count, labelClassName }"
      :class="labelClassName"
      :title="node.label"
    >{{ node.label }}</label>
    <div slot="value-label" slot-scope="{ node }" :title="node.raw.label">{{ node.raw.label }}</div>
  </treeselect>
</template>
<script>
import { mapActions } from "vuex";
import { objDeepCopy } from "../../utils/comonFunc.js";
// import the component
import Treeselect from "@riophae/vue-treeselect";
// import the styles
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
export default {
  name: "el-tree-select-new",
  components: {
    Treeselect
  },
  props: {
    options: {
      type: Array, // 必须是树形结构的对象数组
      default: () => {
        return [];
      }
    },
    vscompt: {
      type: Object
    },
    valAttrName: {
      //存储下拉值的属性名称
      type: String,
      default: () => {
        return "m_value";
      }
    }
  },
  data() {
    return {
      dataKey: "", //当前节点的key
      limitTextFunc: count => `还有 ${count} 个选项`,
      allClass: false,
      newOptions: [],
      called: false
    };
  },
  created() {
    if (this.vscompt.treeSelVal && this.vscompt.treeSelVal.length > 0) {
      let treeVal = this.vscompt.treeSelVal
      if (treeVal.length > 0 && treeVal[0].indexOf('&000') > -1) {
        this.idkeys = {}
      }
    }
  },
  mounted() {
    // 兼容以前保存的页面的多选值
    if (this.vscompt.treeSelVal == undefined) {
      let val = []
      if(Object.keys(this.vscompt[this.valAttrName]).length > 0) {
        val = this.vscompt[this.valAttrName]
      }
      this.$set( this.vscompt, "treeSelVal", val );
    }
    if (this.vscompt.treeSelVal && this.vscompt.treeSelVal.length > 0) {
      this.called = true
      this.newOptions = []
      this.loadStatus = 'loading'
      this.loadState()
      this.getDimRelation()
    } else {
      this.called = false
    }
  },
  watch: {
    "vscompt.treeSelVal": {
      //监听联动
      immediate: true,
      handler: function(newVal) {
        let value1 = objDeepCopy(newVal);
        if (this.isXjDim) {
          for (let index = 0; index < value1.length; index++) {
            const element = value1[index];
            if (element.lastIndexOf("_") > -1) {
              value1[index] = element.substring(element.lastIndexOf("_") + 1);
            }
          }
        }
        let m_value = [] //objDeepCopy(value1)
        value1.forEach(v => {
          m_value.push(v.split('&')[0])
        })
        let index = m_value.indexOf('000')
        if(index > -1) {
          m_value.splice(index,1)
        }
        this.vscompt[this.valAttrName] = m_value;
        let labelArr = [];
        let treeSelObj = this.$refs.treeselect;
        if (treeSelObj && (treeSelObj.selectedNodes || []).length > 0) {
          treeSelObj.selectedNodes.forEach((node, index) => {
            if (this.vscompt.checkStrictly === true && node.id === '000') {
              treeSelObj.selectedNodes.splice(index, 1)
              newVal.splice(newVal.indexOf('000'), 1)
              return
            }
            if (!/(\d|&)+( \(unknown\))?/.test(node.label)) {
              labelArr.push(node.label);
            }
          })
        }
        this.vscompt["m_label"] = labelArr; //查询历史要用
        this.$emit("selectChange", this.vscompt[this.valAttrName]);
      }
    },
    "vscompt.checkStrictly": {
      immediate: true,
      handler: function(newVal) {
        let options = this.newOptions
        if (newVal === true) {
          if (options && (options[0]||{}).dimValue === '000') {
            let val = options[0].children
            this.newOptions = val
          }
        } else {
          if (options && options.length > 0 && options[0].dimValue !== '000' && this.vscompt.showCheckAll === true) {
            let val = [{
              children: null,
              dimValue: "000",
              dimValueDesc: "全选",
              parentDimValue: null,
              id: "000",
              label: "全选"
            }]
            val[0].children = options
            this.newOptions = val
          }
        }
      }
    },
    "vscompt.showCheckAll": {
      immediate: true,
      handler: function(newVal) {
        let options = this.newOptions
        if (newVal === true) {
          if (options && options.length > 0 && options[0].dimValue !== '000' && this.vscompt.showCheckAll === true) {
            let val = [{
              children: null,
              dimValue: "000",
              dimValueDesc: "全选",
              parentDimValue: null,
              id: "000",
              label: "全选"
            }]
            val[0].children = options
            this.newOptions = val
          }
        } else {
          if (options && (options[0]||{}).dimValue === '000') {
            let val = options[0].children
            this.newOptions = val
          }
        }
      }
    }
  },
  computed: {
    // 是否新疆个性维
    isXjDim() {
      return this.vscompt && this.vscompt.dim_id == "D_5_00000001";
    },
  },
  methods: {
    loadState() {
      if (this.loadStatus === 'loading') { // 加载中
        this.$nextTick(() => {
          try {
            document.querySelector('.vue-treeselect__icon-container').children[0].className = 'vue-treeselect__icon-loader'
            document.querySelector('.vue-treeselect__tip-text').innerText = '加载中...'
          } catch (e) {}
      })
      } else {
        this.$nextTick(() => {
          try {
            document.querySelector('.vue-treeselect__icon-container').children[0].className = 'vue-treeselect__icon-warning'
            document.querySelector('.vue-treeselect__tip-text').innerText = '暂无数据'
          } catch (e) {}
        })
      }
    },
    getDimRelation() {
      let item = this.vscompt,
        _this = this,
        param = {
          dim_id: item.dim_id,
          dim_level_id: item.dim_level_id,
          is_all_data: "1",
          parent_val: ""
        };
        this.querySingleDimInfo(param).then((response) => {
        let data = response.data.respData;
        if (response.data.respResult == "1") {
          // data = objCloneByReplaceKey(data, {"dimValue": "dim_value", "dimValueDesc": "label"});
          const temp = data || []
          let val = []

          if (temp.length === 0) {
            this.loadStatus = 'noOptions'
            this.loadState()
          } else {
            this.treeJsonToArray(temp);
          }

          if (!this.vscompt.checkStrictly && this.vscompt.showCheckAll === true) {
            val = [{
              children: null,
              dimValue: "000",
              dimValueDesc: "全选",
              parentDimValue: null,
              id: '000',
              label: '全选'
            }]
            val[0].children = temp
            if (temp.length === 0) {
              val = []
            }
          } else {
            val = temp
          }
          this.newOptions = val
          let newVal = this.vscompt.treeSelVal||[];
          this.$nextTick(() => {
            let treeSelObj = this.$refs.treeselect;
            let newTreeVal = []
            if (treeSelObj && (treeSelObj.selectedNodes || []).length > 0) {
              treeSelObj.selectedNodes.forEach((node, index) => {
                if (this.vscompt.checkStrictly === true && node.id === '000') {
                  treeSelObj.selectedNodes.splice(index, 1)
                  newVal.splice(newVal.indexOf('000'), 1)
                  return
                }
                let idArr = node.id.split('&000')
                if (!/(\d&)+( \(unknown\))?/.test(node.label)) {
                  newTreeVal.push(node.id)
                } else if (idArr.length > -1) { // 旧key-修改
                  let id = idArr[0]
                  if (this.idkeys && this.idkeys[id]) {
                    newTreeVal.push(this.idkeys[id])
                  }
                }
              });
              this.$set( this.vscompt, "treeSelVal", newTreeVal );
            }
          })

        } else {
          _this.$message.error("维层信息查询失败");
          item.dfAreaSels = [];
          this.newOptions = null
        }
      })
        .catch(err => {
          _this.$message.error(err);
        });
    },
    treeJsonToArray(nodes, index = 0) {
      if (Array.isArray(nodes)) {
        for (var i = 0, l = nodes.length; i < l; i++) {
          var copyNode = nodes[i];
          let dimValue = copyNode.dimValue || copyNode.dim_value;
          let sunIndex = index === 0 ? `&${dimValue}` : `${index}`
          if (this.isXjDim) {
            if (copyNode.parentDimValue == null) {
              //第一层数据
              this.dataKey = dimValue;
            }
            copyNode.id = this.dataKey == dimValue
                ? `${this.dataKey}${sunIndex}`
                : `${this.dataKey}_${dimValue}${sunIndex}`
          } else {
            copyNode.id = `${dimValue}${sunIndex}`
          }
          if (!copyNode.label && copyNode.dimValueDesc) {
            copyNode.label = copyNode.dimValueDesc;
          }
          if (this.idkeys) {
            this.idkeys[`${dimValue}`] = copyNode.id
          }
          if (
            Array.isArray(copyNode["children"]) &&
            copyNode["children"].length > 0
          ) {
            this.treeJsonToArray(copyNode["children"], sunIndex);
          } else {
            delete copyNode["children"];
          }
        }
      }
    },
    scrollTo(type) {
      if (type === 'open' && !this.called) {
        this.called = true
        this.loadStatus = 'loading'
        this.loadState()
        this.getDimRelation()
      }
      this.$nextTick(() => {
        try {
          let obj = this.$refs.treeselect.$el.querySelector( ".vue-treeselect__multi-value" );
          if (obj && obj.scrollTop) {
            obj.scrollTop = 0;
          }
        } catch (error) {}
      });
    },
    valChange(val) {
      if (val.includes('000')) {
        this.allClass = true
      } else {
        this.allClass = false
      }
    },
    ...mapActions({
      querySingleDimInfo: "AnalyReportAttr/querySingleDimInfo"
    }),
  }
};
</script>
<style lang="scss" scoped>
$txt-clr01: #606266;
$icon-clr01: #c0c4cc;
$hover-clr01: #409eff;
.vue-treeselect /deep/ .vue-treeselect__multi-value {
  height: 25px;
  overflow: auto;
  margin-bottom: 0px;
  font-size: 12px;
  vertical-align: sub;
  overflow-x: hidden;
  width: calc(100% + 17px);
}
.vue-treeselect /deep/ .vue-treeselect__multi-value-label {
  color: #909399;
  white-space: nowrap;
  padding: 0px;
  // display: block;
  // overflow: hidden;
  // text-overflow: ellipsis;
  // white-space: nowrap;
  // word-break: break-all;
  // width: 100%;
}
.vue-treeselect /deep/ .vue-treeselect__multi-value-item {
  background: #f0f2f5;
  padding: 0 5px;
  margin: 0px 0 0px 6px;
  display: inline-block;
  border: none;
  height: 22px;
  line-height: 23px;
  pointer-events: none;
}
.vue-treeselect /deep/ .vue-treeselect__value-remove {
  color: #909399;
  display: none;
}
.vue-treeselect /deep/ .vue-treeselect__control {
  display: inline-block;
  height: 28px;
  line-height: 26px;
  vertical-align: -1px;
  border-color: #dcdfe6;
  border-radius: 5px;
}
.vue-treeselect /deep/ .vue-treeselect__placeholder,
.vue-treeselect__single-value {
  line-height: 26px;
}
.vue-treeselect /deep/ .vue-treeselect__multi-value-item-container {
  height: 20px;
  line-height: 19px;
  vertical-align: middle;
  padding: 0;
}
.vue-treeselect /deep/ .vue-treeselect__value-container {
  display: inline-block;
  width: calc(100% - 20px);
}
.vue-treeselect /deep/ .vue-treeselect__control-arrow-container,
.vue-treeselect /deep/ .vue-treeselect__x-container {
  display: inline-block;
}
.vue-treeselect.vue-treeselect--has-value
  /deep/
  .vue-treeselect__value-container {
  width: calc(100% - 40px);
  display: inline-block;
}
/deep/.vue-treeselect {
  .vue-treeselect__label {
    color: $txt-clr01;
  }
  .vue-treeselect__option-arrow {
    color: $icon-clr01;
  }
  .vue-treeselect__option--highlight {
    background: #f5f7fa;
  }
  .vue-treeselect__option-arrow-container:hover .vue-treeselect__option-arrow,
  .vue-treeselect--branch-nodes-disabled
    .vue-treeselect__option:hover
    .vue-treeselect__option-arrow {
    color: $icon-clr01;
  }
  .vue-treeselect__checkbox-container:hover
    span[class^="vue-treeselect__check"] {
    border-color: #409eff;
  }
  .vue-treeselect__checkbox--checked {
    border-color: #409eff;
    background: #409eff;
  }
}
/deep/.vue-treeselect.vue-treeselect--focused .vue-treeselect__control {
  border-color: $hover-clr01;
}
</style>
<style>
.vue-treeselect__value-container {
  overflow: hidden;
}
.vue-treeselect__portal-target .vue-treeselect__menu {
  /* overflow-x: auto; */
  min-width: 200px;
}
.vue-treeselect__portal-target .vue-treeselect__label {
  color: #606266;
}
.vue-treeselect__portal-target .vue-treeselect__option-arrow {
  color: #c0c4cc;
}
.vue-treeselect__portal-target .vue-treeselect__option--highlight {
  background: #f5f7fa;
}
.vue-treeselect__portal-target
  .vue-treeselect__option-arrow-container:hover
  .vue-treeselect__option-arrow,
.vue-treeselect__portal-target
  .vue-treeselect--branch-nodes-disabled
  .vue-treeselect__portal-target
  .vue-treeselect__option:hover
  .vue-treeselect__portal-target
  .vue-treeselect__option-arrow {
  color: #c0c4cc;
}
.vue-treeselect__portal-target .vue-treeselect__checkbox-container:hover span[class^="vue-treeselect__check"] {
  border-color: #409eff;
}
.vue-treeselect__checkbox--checked,
.vue-treeselect__checkbox--indeterminate,
.vue-treeselect__checkbox-container:hover .vue-treeselect__checkbox--checked {
  border-color: #409eff;
  background: #409eff;
}
.vue-treeselect__checkbox {
  transition-duration: 0s;
}
.vue-treeselect__portal-target {
  z-index: 9999999 !important;
}
.vue-treeselect__portal-target > div {
  top: 10px;
}
.vue-treeselect--open-below > div > .vue-treeselect__menu {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  background-color: #fff;
}
.vue-treeselect.vue-treeselect--focused .vue-treeselect__control {
  border-color: #409eff;
}
.vue-treeselect .vue-treeselect__multi-value::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.vue-treeselect .vue-treeselect__multi-value::-webkit-scrollbar-track {
  border-radius: 0px;
  background-color: transparent;
}
.vue-treeselect .vue-treeselect__multi-value::-webkit-scrollbar-thumb {
  border-radius: 5px;
  background-color: transparent;
}
.vue-treeselect__menu {
  min-width: 200px;
  width: 100%;
  overflow: auto;
}
.vue-treeselect__list-item div {
  width: auto;
}
/* .vue-treeselect__menu .vue-treeselect__list,
.vue-treeselect__menu .vue-treeselect__list-item
 {
  width: auto;
} */
/* 。vue-treeselect__list */
.vue-treeselect__list-item .vue-treeselect__option-arrow-container,
.vue-treeselect__list-item  .vue-treeselect__option-arrow-placeholder {
    width: 20px;
}
.vue-treeselect__list-item .vue-treeselect__option {
    width: 100%;
}
/* 增加全选 */
.vue-treeselect .vue-treeselect__indent-level-0 {
  margin-left: -25px;
}
.vue-treeselect__indent-level-0 > .vue-treeselect__option {
  padding-left: 25px;
}
.vue-treeselect__indent-level-0 > .vue-treeselect__option:not([data-id='000']) + .vue-treeselect__list {
  padding-left: 25px;
}
.vue-treeselect__indent-level-0 > .vue-treeselect__option:not([data-id='000']) {
  padding-left: 29px;
}
.vue-treeselect__indent-level-0 > .vue-treeselect__option[data-id='000'] + .vue-treeselect__list {
  padding-left: 4px;
}
.vue-treeselect__indent-level-0 > .vue-treeselect__option[data-id='000'] > .vue-treeselect__option-arrow-container {
  display: none;
}
.vue-treeselect__indent-level-0 > .vue-treeselect__option[data-id^='000'] > .vue-treeselect__label-container {
  padding-left: 24px;
}
.allClass.noFlat .vue-treeselect__multi-value-item-container:first-child {
  display: none;
}
/* end */

/*滚动条里面可以拖动的那部分(悬浮)*/
.vue-treeselect .vue-treeselect__multi-value::-webkit-scrollbar-thumb:hover {
  border-radius: 5px;
  background-color: transparent;
}
.vue-treeselect--searchable.vue-treeselect--multi.vue-treeselect--has-value .vue-treeselect__input-container {
  height: 24px;
}
.vue-treeselect__menu::-webkit-scrollbar-track {
  background-color: transparent;
}
.vue-treeselect__menu::-webkit-scrollbar-thumb {
  background: rgba(144, 147, 153, 0.3);
}
.vue-treeselect__menu::-webkit-scrollbar-thumb:hover {
  background: rgba(144, 147, 153, 0.5);
}
</style>
