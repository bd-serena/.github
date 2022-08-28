<template>
  <div style="width:100%;height:100%;position:relative;">
    <div class="desicion-tree">
      <desicion-tree-node
        :nodes="vscompt.comptAttrs.setting['data']"
        :vscompt="vscompt"
      />
    </div>
  </div>
</template>

<script>
import DesicionTreeNode from '@component/template/DesicionTreeNode';
import panzoom from 'panzoom';
export default {
  props: ['vscompt'],
  components: {
    DesicionTreeNode
  },
  data () {
    return {
    };
  },
  computed: {
    typeId () {
      return this.vscompt.comptAttrs.extendSetting.displayId;
    }
  },
  methods: {
  },
  mounted () {
    panzoom(document.querySelector('.desicion-tree'));
  },
  created () {
    // 清空展开的数据
    if (this.vscompt.comptAttrs.setting.data.length > 0) {
      this.vscompt.comptAttrs.setting.data[0].children = [];
    }
    // 清空wherebean
    if (this.vscompt.comptAttrs.whereBean.rule_list.length > 0) {
      this.vscompt.comptAttrs.whereBean.rule_list = [];
      this.vscompt.comptAttrs.whereBean.exp = '';
    }
  }
};
</script>

<style lang="scss" scoped>
.desicion-tree {
  width: 3000px;
  height: 1000px;
  > div {
    display: flex;
    flex: 1;
  }
}
</style>
