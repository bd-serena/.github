import { windowResize } from "./comonFunc.js";
export default {
  computed: {
    dragAndResize() {
      let flag = false;
      if (this.pageCache.operation == "design") {
        flag = true;
      }
      return flag;
    }
  },
  methods: {
    hdResizedEvent(left, top, width, height) {
      this.tabSubCompt.blockInfo.x = left;
      this.tabSubCompt.blockInfo.y = top;
      this.tabSubCompt.blockInfo.w = width;
      this.tabSubCompt.blockInfo.h = height;
      // 公共属性赋值
      if(this.tabSubCompt.styleAttrs){
        let commonAttrs = this.tabSubCompt.styleAttrs[0].children;
        for(let i=0; i<commonAttrs.length; i++) {
          if(commonAttrs[i].enName === 'commonHeight') {
            commonAttrs[i].value = height;
          } else if(commonAttrs[i].enName === 'commonWidth') {
            commonAttrs[i].value = width;
          }
        }
      }
      windowResize();
    },
    dragEvent(left, top) {
      this.tabSubCompt.blockInfo.x = left;
      this.tabSubCompt.blockInfo.y = top;
    },
    onActivated(id) {
      let e = window.event;
      this.vscompt.blockInfo.draggable = false;
      this.upBlock(id);
      e.stopPropagation();
    },
    onDragstop() {
      let flag = true;
      if (this.vscompt.comptAttrs.isLocked) {
        flag = false;
      }
      this.vscompt.blockInfo.draggable = flag;
    },
    commonFillback() {
      // 公共样式宽高赋值
      let commonAttrs = this.tabSubCompt.styleAttrs[0].children;
      for(let i=0; i<commonAttrs.length; i++) {
        if(commonAttrs[i].enName === 'commonHeight') {
          commonAttrs[i].value = this.tabSubCompt.blockInfo.h;
        } else if(commonAttrs[i].enName === 'commonWidth') {
          commonAttrs[i].value = this.tabSubCompt.blockInfo.w;
        }
      }
    }
  }
}
