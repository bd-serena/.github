<template>
  <div style="width:100%; height:100%; position:absolute;">
    <bd-div
      type="bd-borderWrap-hd"
      :flashShow="vscompt.comptAttrs.extendSetting.flashShow"
      :flashDirection="vscompt.comptAttrs.extendSetting.flashDirection"
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

  },
  computed: {

  },
  methods: {
    
  }
};
</script>

<style lang="scss" scoped>

</style>