<template>
  <van-tabbar v-model="active" route style="height: 50px" class="foot-tab-wrap">
    <van-tabbar-item
      v-for="tab in tabbarMenus"
      v-bind="tab"
      :key="tab.name"
      :icon-prefix="tab.iconPrefix"
      :class="{'van-tabbar-item--active': highlightTab(tab)}"
    >{{ tab.title }}</van-tabbar-item>
  </van-tabbar>
</template>

<script>
import { mapMutations } from 'vuex';
export default {
  data() {
    return {
      value: "",
      active: "数据门户",
      tabbarMenus: [
        {
          name: "数据门户",
          title: "数据门户",
          to: "/PortalIndex",
          iconPrefix: "icon",
          icon: "A10720_icon"
        },
        {
          name: "分析报告",
          title: "分析报告",
          to: "/AnalysisIndex",
          iconPrefix: "icon",
          icon: "A10468_lineChart"
        },
        {
          name: "收藏",
          title: "收藏",
          to: "/CollectIndex",
          iconPrefix: "icon",
          icon: "A10394_home"
        },
        {
          name: "setting",
          title: "设置",
          to: "/Setting",
          iconPrefix: "icon",
          icon: "A10344_setting"
        }
      ]
    };
  },
  computed: {
    curRouteFullPath() {
      return this.$route.fullPath;
    }
  },
  methods: {
    ...mapMutations({
      setMenuClassTypeId: "HomeTree/setMenuClassTypeId"
    }),
    switchPage(curActiveMenu) {
      this.active = curActiveMenu.name;
      const menus = JSON.parse(window.sessionStorage.getItem("X-NG-PrivList"));
      const menuInfo = menus.find(menuItem => menuItem.menuName === this.active);
      if (menuInfo) {
        this.$store.commit("HomeTree/setMenuName", menuInfo.menuName);
        this.setMenuClassTypeId(menuInfo.classTypeId);
      } else if (curActiveMenu) {
        this.$store.commit("HomeTree/setMenuName", curActiveMenu.title);
      }
    },
    highlightTab(tab) {
      const pageCache = JSON.parse(sessionStorage.getItem('PageCache'));
      let tabName = '分析报告';
      if (pageCache && pageCache.prevRoute && this.tabbarMenus.some(item => item.to === pageCache.prevRoute)) {
        tabName = this.tabbarMenus.find(item => item.to === pageCache.prevRoute).name;
      }
      return this.curRouteFullPath === '/AnalysisPreview' && tab.name === tabName
    }
  },
  mounted() {
    let idx = this.tabbarMenus.findIndex(
      item => item.to === this.curRouteFullPath
    );
    idx = Math.max(idx, 0);
    // 如果是列表页分析报告预览则菜单选中分析报告
    if (this.curRouteFullPath === '/AnalysisPreview') {
      idx = 1;
    }
    const curActiveMenu = this.tabbarMenus[idx];
    this.switchPage(curActiveMenu);
  }
};
</script>
