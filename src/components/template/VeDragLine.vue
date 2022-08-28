<template>
  <div style="width:100%;height:100%" ref="wrap">
    <v-stage ref="stage" :config="stageSize" @mousedown="clickHandle">
      <v-layer ref="layer">
        <v-line
          ref="line"
          :config=" {
        strokeWidth: lineWidth,
        stroke: lineColor,
        lineCap: 'round',
        dash: [dashVal],
        points: [points.x1,points.y1,points.x2,points.y2]
      }"
        />
        <v-circle
          :key="1"
          :config="{
                x: points.x1, 
                y: points.y1, 
                radius: circleRadio,
                stroke: '#666',
                fill: '#ddd',
                strokeWidth: 1,
                draggable: true,
                dragBoundFunc:((pos)=>{return circleDragBd(pos,0)})
          }"
        ></v-circle>
        <v-circle
          :key="2"
          :config="{
                x: points.x2, 
                y: points.y2, 
                radius: circleRadio,
                stroke: '#666',
                fill: '#ddd',
                strokeWidth: 1,
                draggable: true,
                dragBoundFunc:((pos)=>{return circleDragBd(pos,1)})
          }"
        ></v-circle>
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
import { mapState } from "vuex";
import DomSize from "@/utils/domSize.js";
export default {
  props: ["vscompt"],
  data() {
    return {
      stageSize: {
        width: 0,
        height: 0
      },
      circleRadio: 4,
      tempx: 0,
      tempy: 0
    };
  },
  mounted() {
    this.resetCanvas();
    let _this = this;
    DomSize.bind(this.$refs.wrap, function() {
      let w = parseInt(this.style.width);
      let h = parseInt(this.style.height);
      _this.stageSize.width = w;
      _this.stageSize.height = h;
    });
  },
  computed: {
    ...mapState({
      pageCache: state => state.HomeBody.pageCache
    }),
    points() {
      return this.vscompt.comptAttrs.points;
    },
    lineWidth() {
      return this.vscompt.comptAttrs.extendSetting.lineWidth;
    },
    dashVal() {
      if (this.vscompt.comptAttrs.extendSetting.lineType == "dashed") {
        return 5;
      } else if (this.vscompt.comptAttrs.extendSetting.lineType == "solid") {
        return 0;
      }
    },
    lineColor() {
      return this.vscompt.comptAttrs.extendSetting.lineColor || "#0da2e7";
    }
  },
  methods: {
    resetCanvas() {
      let width = this.$refs.wrap.clientWidth;
      let height = this.$refs.wrap.clientHeight;
      this.stageSize.width = width;
      this.stageSize.height = height;
      if (this.pageCache && this.pageCache.operation == "design") {
        this.circleRadio = 4;
      } else {
        this.circleRadio = 0;
      }
    },

    clickHandle(e) {
      if (this.pageCache && this.pageCache.operation == "design") {
        let name = e.target.className;
        if (name == "Circle") {
          this.circleRadio = 4;
          this.vscompt.blockInfo.draggable = false;
          this.vscompt.blockInfo.resizable = false;
        } else if (name == "Line") {
          this.circleRadio = 4;
          this.vscompt.blockInfo.draggable = false;
          this.vscompt.blockInfo.resizable = false;
        } else {
          if (this.circleRadio == 0) {
            this.circleRadio = 4;
          } else {
            this.circleRadio = 0;
          }
          this.vscompt.blockInfo.draggable = true;
          this.vscompt.blockInfo.resizable = true;
        }
      }
    },
    circleDragBd(pos, index) {
      switch (index) {
        case 0:
          this.points.x1 = pos.x;
          this.points.y1 = pos.y;
          break;
        case 1:
          this.points.x2 = pos.x;
          this.points.y2 = pos.y;
          break;
        default:
          break;
      }
    }
  }
};
</script>
