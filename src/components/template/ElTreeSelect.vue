<template>
  <el-select
    v-model="valueId"
    size="mini"
    :class="{allClass: allClass}"
    :clearable="clearable"
    @clear="clearHandle"
    multiple
    :value-key="'value'"
    ref="select"
    @visible-change="VisibleChange"
    :title="valueText"
  >
    <el-option value label key>
      <el-tree
        accordion
        ref="selectTree"
        :show-checkbox="showCheckbox"
        :data="options"
        :props="props"
        :node-key="props.value"
        :default-checked-keys="valueId"
        :default-expanded-keys="defaultExpandedKey"
        :expand-on-click-node="false"
        @check-change="handleCheckChange"
        @check="checkChange"
      ></el-tree>
    </el-option>
  </el-select>
</template>
<script>
export default {
  name: "el-tree-select",
  props: {
    options: {
      type: Array, // 必须是树形结构的对象数组
      default: () => {
        return [];
      }
    },
    props: {
      type: Object,
      default: () => {
        return {
          value: "id", // ID字段名
          label: "title", // 显示名称
          children: "children" // 子级字段名
        };
      }
    },
    value: {
      type: Array,
      default: () => {
        return null;
      }
    },
    clearable: {
      type: Boolean,
      default: () => {
        return true;
      }
    },
    showCheckbox: {
      type: Boolean,
      default: () => {
        return true;
      }
    },
    treeData: []
  },
  data() {
    return {
      valueId: [], // 初始值
      valueText: [],
      valueObj: {},
      valueTitle: "",
      option: [],
      defaultExpandedKey: ['000'],
      options1: [],
      allClass: false
    };
  },
  mounted() {
    this.initHandle();
  },
  watch: {
    value(value) {
      this.valueId = value;
    },
    valueId(vals) {
      if (vals) {
        var _this = this;
        var label = _this.props.label;
        var value = _this.props.value;
        this.$emit("getValue", vals);
        this.$nextTick(() => {
          _this.valueText = vals.map(
            id =>
              _this.$refs.selectTree.getNode(id) &&
              _this.$refs.selectTree.getNode(id).data[label]
          );
          vals.forEach(id => {
            if (_this.$refs.selectTree.getNode(id)) {
              let _label = _this.$refs.selectTree.getNode(id).data[label];
              let _value = _this.$refs.selectTree.getNode(id).data[value];
              _this.valueObj[_value] = _label;
            }
          });
          this.$refs.select.selected.forEach(val => {
            val.currentLabel = this.valueObj[val.value];
          });
        })
      }
    },
    option(vals) {
      if (vals) {
        var _this = this;
        var label = _this.props.label;
        setTimeout(function() {
          _this.valueText = _this.valueId.map(
            id =>
              _this.$refs.selectTree.getNode(id) &&
              _this.$refs.selectTree.getNode(id).data[label]
          );
        }, 300);
      }
    }
  },
  methods: {
    //下拉框切换事件
    VisibleChange(val) {
      this.$emit("VisibleChange", val);
    },
    handleCheckChange(data, checked, indeterminate) {
      this.valueId = this.$refs.selectTree.getCheckedKeys();
      this.$emit("selectChange", this.valueId);
      this.$nextTick(() => {
        this.$refs.select.selected.forEach(val => {
          val.currentLabel = this.valueObj[val.value];
        });
      });
    },
    checkChange(checkedNodes, checkedKeys) {
      if (this.valueId.includes('000')) {
        this.allClass = true
      } else {
        this.allClass = false
      }
      this.valueId = this.$refs.selectTree.getCheckedKeys();
      // let valId = [...this.valueId]
      let index = this.valueId.indexOf('000')
      if (index > -1) {
        this.valueId.splice(index,1)
      }
      this.$emit("selectCheckChange", this.valueId);
      this.$nextTick(() => {
        this.$refs.select.selected.forEach(val => {
          val.currentLabel = this.valueObj[val.value];
        });
      });
    },
    // 初始化值
    initHandle() {
      this.valueId = this.value;
      // let label = this.props.label;
      this.option = this.props.options;
      let children = this.props.children || 'children'
      let opts = [{
        label: '全选',
        value: '000'
      }]
      opts[0][`${children}`] = this.options
      if (this.options.length === 0) {
        opts = []
      }
      this.options1 = opts

    },
    // 清除选中
    clearHandle() {
      this.valueTitle = "";
      this.valueId = [];
      this.defaultExpandedKey = ['000'];
      this.$refs.selectTree.setCheckedKeys([]); // 设置默认选中
      this.$emit("getValue", []);
      this.$emit("selectCheckChange", []);
    }
  }
};
</script>
<style scoped>
.el-scrollbar .el-scrollbar__view .el-select-dropdown__item {
  height: auto;
  padding: 0;
}
.el-select-dropdown__item.selected {
  font-weight: normal;
}
/* .el-select {
        /* height: 28px;
    } */

.el-select /deep/ .el-select__tags {
  height: 26px;
  overflow-y: hidden;
  z-index: 1000 !important;
}

.el-select /deep/ .el-select__tags:hover {
  overflow-y: auto;
}
.el-select /deep/ .el-select__tags::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 6px; /*高宽分别对应横竖滚动条的尺寸*/
  height: 6px;
}
.el-select /deep/ .el-select__tags::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 5px;
  background: rgba(144, 147, 153, 0.3);
}
.el-select /deep/ .el-select__tags::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  border-radius: 0;
}
ul li >>> .el-tree .el-tree-node__content {
  height: auto;
}
.el-tree-node__label {
  font-weight: normal;
}
.el-tree >>> .is-current .el-tree-node__label {
  color: #409eff;
  font-weight: 700;
}
.el-tree >>> .is-current .el-tree-node__children .el-tree-node__label {
  color: #606266;
  font-weight: normal;
}
.el-select /deep/ .el-icon-close {
  display: none;
}
.el-select /deep/ .el-input__inner {
  background-color: transparent;
}

/deep/.el-tree > .el-tree-node > .el-tree-node__content {
  padding-left: 10px;
}
/deep/.el-tree > .el-tree-node > .el-tree-node__content > .el-tree-node__expand-icon {
  color: transparent;
  cursor: default;
}
/deep/.el-tree > .el-tree-node > .el-tree-node__children {
  margin-left: -18px;
  display: block !important;
}
.allClass /deep/ .el-tag:first-child {
  /* display: none; */
}

</style>
