<template>
  <div style="width:100%;height:100%;position:relative;">
    <bd-div
      type="bd-verTitle-hd"
      v-bind="vscompt.comptAttrs.extendSetting"
      style="    padding: 5px 0;"
    ></bd-div>
  </div>
</template>

<script>
export default {
  props: ["vscompt"],
  data() {
    return {};
  },
  mounted() {},
  methods: {},
  watch: {
    /* "vscompt.comptAttrs.extendSetting.titletext": {
      immediate: true,
      handler(newVal, oldVal) {
        this.$set(
          this.vscompt.comptAttrs.extendSetting,
          "comptName.text",
          newVal
        );
      }
    } */
  }
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
</style>
