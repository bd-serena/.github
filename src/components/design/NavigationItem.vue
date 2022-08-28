<template>
  <div :key="treeKey">
    <template v-if="!item.children || item.children.length == 0">
      <el-menu-item :index="item.privId">
        <i v-show="layout==='vertical' && item.showIcon === '1'" :class="item.imgUrl ? 'icon-'+item.imgUrl : 'el-icon-location'"></i>
        {{ item.privName }}
      </el-menu-item>
    </template>
    <el-submenu v-else :index="item.privId">
      <template slot="title">
        <i v-show="layout==='vertical' && item.showIcon === '1'" :class="item.imgUrl ? 'icon-'+item.imgUrl : 'el-icon-location'"></i>
        {{ item.privName }}
      </template>
      <template v-for="child in item.children">
        <navigation-item
          v-if="child.children && child.children.length > 0"
          :item="child"
          :key="child.privId"
          :layout="layout"
        />
        <el-menu-item v-else :key="child.privId" :index="child.privId">
          <i v-show="layout==='vertical' && child.showIcon === '1'" :class="child.imgUrl ? 'icon-'+child.imgUrl : 'el-icon-location'"></i>
          {{ child.privName }}
        </el-menu-item>
      </template>
    </el-submenu>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "navigationItem",
  props: {
    item: {
      type: Object,
      required: true,
    },
    layout: {
      type: String,
      default: 'horizon'
    }
  },
   computed: {
    ...mapState({
      treeKey: state => state.DataPortal.treeKey
    }),
  },
  mounted(){

  }
};
</script>
