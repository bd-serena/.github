<template>
<div style="width:100%;height:100%;position:relative;">
  <bd-div
    ref="icon"
    type="bd-icon-hd"
    v-bind="vscompt.comptAttrs.extendSetting"
    style="width:100%;height:100%;"
    v-bind:metricIconSize="vscompt.comptAttrs.maxWidth < vscompt.comptAttrs.maxHeight ? vscompt.comptAttrs.maxWidth : vscompt.comptAttrs.maxHeight"
    @click.native="gotoPage(vscompt.comptAttrs.extendSetting)"
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
  mounted() {},
  watch: {
    "vscompt.blockInfo.w":{
      handler(newVal, oldVal) {//监听组件的宽高变化
        this.vscompt.comptAttrs.maxWidth = this.$refs.icon.$el.clientWidth;
        /* if(this.pageCache.classTypeId == "1005"){//大屏图标组件
          this.vscompt.comptAttrs.maxWidth = this.$refs.icon.$el.clientWidth;
        }else{
          this.vscompt.comptAttrs.maxWidth = parseInt(document.querySelector(".vue-grid-placeholder").style.width.replace("px","")) - 12;
        } */
      }
    },
    "vscompt.blockInfo.h":{
      handler(newVal, oldVal) {//监听组件的宽高变化
        this.vscompt.comptAttrs.maxHeight = this.$refs.icon.$el.clientHeight;
        /* if(this.pageCache.classTypeId == "1005"){//大屏图标组件
          this.vscompt.comptAttrs.maxHeight = this.$refs.icon.$el.clientHeight;
        }else{
          this.vscompt.comptAttrs.maxHeight = parseInt(document.querySelector(".vue-grid-placeholder").style.height.replace("px","")) -12;
        } */
      }
    },
  },
  computed: {
    ...mapState({
      pageCache: state => state.HomeBody.pageCache
    }),
  },
  methods: {
    ...mapActions({
      gotoPage: "PageDesign/gotoPage"
    })
  }
};
</script>

<style lang="scss" scoped>

</style>