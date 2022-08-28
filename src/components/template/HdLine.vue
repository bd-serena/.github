<template>
<div style="width:100%;height:100%;position:relative;display:flex;justify-content:center;align-items:center;">
  <bd-div
    type="bd-line-hd"
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