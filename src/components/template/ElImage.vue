<template>
    <div style="width:100%;height:100%;position:relative;">
        <el-image 
        style="width: 100%; height: 100%;overflow: hidden;"
            :style="`border-width: ${vscompt.comptAttrs.extendSetting.border||vscompt.comptAttrs.extendSetting.borderWidth}px;border-style:${vscompt.comptAttrs.extendSetting.borderStyle||''};border-color:${vscompt.comptAttrs.extendSetting.borderColor||'#0da2e7'}; border-radius:${vscompt.comptAttrs.extendSetting.borderRadius||''};`"
            :src="vscompt.comptAttrs.extendSetting.imgUrl" 
            fit="fill"
            @click.native="gotoPage(vscompt.comptAttrs.extendSetting)"
            >
            <div slot="error" class="image-slot" style="position: absolute;top: 0;left: 0px;right: 0px;color: #ccc;font-size: 12px;background: #fff;height: 100%;width: 100%;text-align: center;">
                <span>请选择图片</span>
            </div>
        </el-image>
    </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from "vuex";
export default {
  props: ["vscompt"],
  data() {
    return {
      optData: null,
      param: null
    };
  },
  mounted() {
    // this.optData=this.option.data;
    // this.param=this.option.param;
  },
  methods: {
    ...mapActions({
      gotoPage: "PageDesign/gotoPage"
    })
  }
};
</script>
<style lang="scss" scoped>
.image-slot{
  span {
    font-size: 20px;
    display: block;
    position: relative;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>

