<template>
  <div style="width:100%;height:100%;position:relative;">
    <bd-div
     type="bd-title-pc"
      v-bind="vscompt.comptAttrs.extendSetting"
     ></bd-div>
  </div>
</template>

<script>
export default {
  props: ["vscompt"],
  data() {
    return {
      
    };
  },
  mounted() {
    
  },
  methods: {
   
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
