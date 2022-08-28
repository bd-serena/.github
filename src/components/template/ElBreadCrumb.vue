<template>
  <div style="width:100%;height:100%;position:relative;">
    <el-breadcrumb :separator="separator" ref="breadCrumb" :class="breadCrumbClass">
      <el-breadcrumb-item
        v-for="item in vscompt.comptAttrs.editableTabs"
        :key="item.name"
        :name="item.name"
        :title="item.title"
        @click.native="goPage(item)"
      >{{item.title}}</el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
export default {
  props: ["vscompt"],
  data() {
    return {};
  },
  mounted() {},
  watch: {
    "vscompt.comptAttrs.editableTabs": {
      handler(neditableTabs) {
        this.$nextTick(() => {
          this.vscompt.comptAttrs.editableTabs.forEach((item, index) => {
            this.$refs.breadCrumb.$children[index].$el.querySelector(
              ".el-breadcrumb__inner, .el-breadcrumb__inner a"
            ).style.color = item.titleColor;
            this.$refs.breadCrumb.$children[index].$el.querySelector(
              ".el-breadcrumb__inner, .el-breadcrumb__inner a"
            ).style.fontWeight = this.vscompt.comptAttrs.extendSetting
              .fontWeight
              ? "bold"
              : "normal";
            this.$refs.breadCrumb.$children[index].$el.querySelector(
              ".el-breadcrumb__inner, .el-breadcrumb__inner a"
            ).style.cursor = item.pageId ? "pointer" : "default";
          });
        });
      },
      immediate: true,
      deep: true
    },
    "vscompt.comptAttrs.extendSetting": {
      handler(extendSetting) {
        this.$nextTick(() => {
          this.$refs.breadCrumb.$el.style.fontSize =
            extendSetting.fontSize + "px";
          this.vscompt.comptAttrs.editableTabs.forEach((item, index) => {
            this.$refs.breadCrumb.$children[index].$el.querySelector(
              ".el-breadcrumb__inner, .el-breadcrumb__inner a"
            ).style.fontWeight = extendSetting.fontWeight;
            this.$refs.breadCrumb.$children[index].$el.querySelector(
              ".el-breadcrumb__separator"
            ).style.color = extendSetting.sepColor;
            this.$refs.breadCrumb.$children[index].separator = this.separator;
          });
        });
      },
      immediate: true,
      deep: true
    }
  },
  computed: {
    separator() {
      return this.vscompt.comptAttrs.extendSetting.separator;
    },
    breadCrumbClass() {
      let breadCrumbClass;
      switch (this.pageCache.classTypeId) {
        case "1001001":
          breadCrumbClass = "bread-crumb-pc";
          break;
        case "1001002":
          breadCrumbClass = "bread-crumb-mobile";
          break;
        default:
          breadCrumbClass = "bread-crumb-hd";
      }
      return breadCrumbClass;
    },
    ...mapState({
      pageCache: state => state.HomeBody.pageCache,
      pageList: state => state.PageDesign.pageList
    })
  },
  methods: {
    ...mapActions({
      setPageCache: "HomeBody/setPageCache",
      gotoPage: "PageDesign/gotoPage"
    }),
    goPage(item) {
      item.urlType = "1";
      this.gotoPage(item);
      /* if (this.pageCache.operation == "preview" && item.pageId) {
        let pageCacheBak = objDeepCopy(this.pageCache);
        let pageInfo = this.pageList.filter(item1 => {
          return item1.pageId == item.pageId;
        });
        if(pageInfo[0].pageType == 1) {  //打开新页面
            pageInfo[0]["operation"] = "preview";
            window.sessionStorage.setItem("pageCache", JSON.stringify(pageInfo[0]));
            this.setPageCache(objDeepCopy(pageInfo[0]));

            let routeData = this.$router.resolve({
              name: "pageView"
            });
            window.open(routeData.href, "_blank");
            window.sessionStorage.setItem(
              "pageCache",
              JSON.stringify(pageCacheBak)
            );
            this.setPageCache(objDeepCopy(pageCacheBak));
          } else { //打开弹窗
            this.PCDialogPageInfo = pageInfo[0];
            this.PCDialogVisible = true;
          }
      } */
    }
  }
};
</script>

<style lang="scss" scoped>
.el-breadcrumb {
  /deep/ .el-breadcrumb__inner {
    cursor: pointer;
  }
}
.bread-crumb-hd {
  /deep/ .el-breadcrumb__item {
    .el-breadcrumb__inner {
      color: #fff;
    }
    .el-breadcrumb__separator {
      color: #fff;
    }
  }
}
</style>
