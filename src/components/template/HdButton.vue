<template>
  <div style="width:100%;height:100%;">
    <bd-div
      type="bd-button-hd"
      v-bind="vscompt.comptAttrs.extendSetting"
      @buttonClick="clickHandle"
    ></bd-div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
import { windowResize } from "../../utils/comonFunc.js";
export default {
  props: ["vscompt"],
  data() {
    return {};
  },
  mounted() {},
  watch: {},
  computed: {
    ...mapState({
      pageCache: state => state.HomeBody.pageCache
    }),
    ...mapGetters({
      allCompts: "PageDesign/getFlatCompt"
    })
  },
  methods: {
    ...mapActions({
      gotoPage: "PageDesign/gotoPage",
      openChildPage: "PageDesign/openChildPage"
    }),
    gotoTab(setting) {
      let comptId = setting.linkTabId[0];
      let tabId = setting.linkTabId[1];
      for (let item of this.allCompts) {
        if (item.comptId == comptId) {
          item.comptAttrs.editableTabsValue = tabId;
          break;
        }
      }
      windowResize();
    },
    clickHandle(e) {
      let setting = this.vscompt.comptAttrs.extendSetting;
      if (this.pageCache.operation == "design") {
        return;
      }
      if (setting.urlType == "2" && setting.comptUrl) {
        //打开连接地址
        this.gotoPage(setting);
      } else if (setting.linkTabId.length > 0) {
        //打开tab标签
        this.gotoTab(setting);
      } else if (setting.urlType == "1" && setting.pageId) {
        //打开内部页面
        let param = { pageLinkageData: [{}] };
        param.pageLinkageData[0].pageId = setting.pageId;
        param.noParam = true;
        this.openChildPage(param);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
</style>