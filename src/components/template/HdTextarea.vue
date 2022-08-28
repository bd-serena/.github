<template>
  <div style="width:100%;height:100%;position:relative;">
    <bd-div
      ref="textarea"
      type="BdTextareaHd"
      v-bind="vscompt.comptAttrs.extendSetting"
      style="padding: 5px 0;"
      @textisbluring="setdata"
      class="bgtextarea"
    ></bd-div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  props: ["vscompt"],
  data() {
    return {};
  },
  computed: {
    ...mapState({
      pageCache: state => state.HomeBody.pageCache
    })
  },
  mounted() {
    this.$refs.textarea.$el.querySelector(
      ".text-input"
    ).innerHTML = this.vscompt.comptAttrs["text"];
    if (this.pageCache.operation != "design") {
      this.$set(this.vscompt.comptAttrs.extendSetting, "editable", false);
    }
    if (this.vscompt.comptAttrs.extendSetting["bgColor"] == "transparent") {
      this.vscompt.styleAttrs[0].children[0].value = "";
    }
    if (this.vscompt.comptAttrs.extendSetting["borderColor"] == "transparent") {
      this.vscompt.styleAttrs[0].children[1].value = "";
    }
    if (this.vscompt.comptAttrs.extendSetting["borderStyle"] != null) {
      this.vscompt.styleAttrs[0].children[2].value = this.vscompt.comptAttrs.extendSetting[
        "borderStyle"
      ];
    }
    if (this.vscompt.comptAttrs.extendSetting["borderWidth"] != null) {
      this.vscompt.styleAttrs[0].children[3].value = this.vscompt.comptAttrs.extendSetting[
        "borderWidth"
      ];
    }
    if (this.vscompt.comptAttrs.extendSetting["borderRadius"] != null) {
      this.vscompt.styleAttrs[0].children[4].value = this.vscompt.comptAttrs.extendSetting[
        "borderRadius"
      ];
    }
    if (this.vscompt.comptAttrs.extendSetting["fontFamily"] != null) {
      this.vscompt.styleAttrs[0].children[5].value = this.vscompt.comptAttrs.extendSetting[
        "fontFamily"
      ];
    }
    if (this.vscompt.comptAttrs.extendSetting["fontWeight"] != null) {
      this.vscompt.styleAttrs[0].children[6].value = this.vscompt.comptAttrs.extendSetting[
        "fontWeight"
      ];
    }

    if (this.vscompt.comptAttrs.extendSetting["textDecoration"] != null) {
      this.vscompt.styleAttrs[0].children[7].value = this.vscompt.comptAttrs.extendSetting[
        "textDecoration"
      ];
    }
    if (this.vscompt.comptAttrs.extendSetting["fontSize"] != null) {
      this.vscompt.styleAttrs[0].children[8].value = this.vscompt.comptAttrs.extendSetting[
        "fontSize"
      ];
    }
    if (this.vscompt.comptAttrs.extendSetting["color"] == "transparent") {
      this.vscompt.styleAttrs[0].children[9].value = "transparent";
    }
    if (this.vscompt.comptAttrs.extendSetting["textAlign"] != null) {
      this.vscompt.styleAttrs[0].children[10].value = this.vscompt.comptAttrs.extendSetting[
        "textAlign"
      ];
    }
  },
  methods: {
    setdata() {
      const data = this.$refs.textarea.$children[0].value;
      this.$set(this.vscompt.comptAttrs, "text", data);
    }
  },
  watch: {}
};
</script>

<style lang="scss" scoped>
.drill-label {
  position: absolute;
  left: 5px;
  bottom: 3px;
  cursor: pointer;
  z-index: 100;
  .drill-icon {
    font-size: 12px;
  }
  &:hover {
    color: #409cfb;
  }
}
.link-reset {
  left: 5px;
  bottom: 2px;
}
/deep/.gm-scroll-view {
  overflow-x: hidden;
}
</style>

<style lang="scss">
.bgtextarea{
  .el-scrollbar__wrap {
    padding-right: 10px;
    padding-left: 5px;
  }
}
</style>