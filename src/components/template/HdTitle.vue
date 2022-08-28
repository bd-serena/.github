<template>
<div style="width:100%;height:100%;position:relative;">
  <bd-div
    type="bd-title-hd"
    v-bind="vscompt.comptAttrs.extendSetting"
  />
</div>
</template>

<script>
export default {
  props: ["vscompt"],
  data() {
    return {};
  },
  mounted() {},
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
  },
  computed: {

  },
  methods: {
    
  }
};
</script>

<style lang="scss" scoped>

</style>