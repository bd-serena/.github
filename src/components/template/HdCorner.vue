<template>
<div style="width:100%;height:100%;position:relative;">
  <bd-div
    type="bd-corner-hd"
    v-bind="vscompt.comptAttrs.extendSetting"
  />
</div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from "vuex";
import { windowResize, objDeepCopy } from "../../utils/comonFunc.js";
import eventBus from "../../plugins/transData.js";
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

  },
  methods: {
    
  }
};
</script>

<style lang="scss" scoped>

</style>