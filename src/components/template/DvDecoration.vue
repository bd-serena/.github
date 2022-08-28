<template>
  <div style="width:100%;height:100%;position:relative;">
    <bd-div
      type="bd-dataV-hd"
      :display-id="typeId"
    />
  </div>
</template>

<script>
export default {
  props: ["vscompt"],
  data() {
    return {};
  },
  mounted() {
  },
  watch: {

  },
  computed: {
    typeId(){
      return this.vscompt.comptAttrs.extendSetting.displayId
    }
  },
  methods: {

  }
};
</script>

<style lang="scss" scoped>

</style>
