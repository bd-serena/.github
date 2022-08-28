<template>
  <div class="ruler-main">
    <div class="axis-block" title="显示/隐藏" @click="toggleLine">
      <div :class="['toggle-icon', lineShow ? 'icon-A10494-Visible' : 'icon-A10493-Invisible']"></div>
    </div>
    <div class="x-wrap" style="position:absolute; z-index:99">
      <canvas
        id="xaxis"
        ref="xaxis"
        width="4000"
        height="20"
        @mousemove="showIndicator"
        @mouseout="hideIndicator"
        @mousedown="drawAxis"
        style="left:20px"
      ></canvas>
    </div>
    <div class="y-wrap" style="position:absolute; z-index:99">
      <canvas
        id="yaxis"
        ref="yaxis"
        width="20"
        height="2000"
        @mousemove="showIndicator"
        @mouseout="hideIndicator"
        @mousedown="drawAxis"
        style="top:20px"
      ></canvas>
    </div>
    <div class="indicatory" ref="indicatory"></div>
    <div class="indicatorx" ref="indicatorx"></div>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
export default {
  props: ["scaleRatio", "scrollX", "scrollY", "lineTabOffset"],
  data() {
    return {
      AXIS_MARGIN: 0,
      AXIS_ORIGIN: { x: 0, y: 1000 },
      HORIZONTAL_TICK_SPACING: 10,
      VERTICAL_TICK_SPACING: 10,
      TICK_WIDTH: 20,
      dragLine: null,
      dragType: "",
      lineShow: true 
    };
  },
  computed: {
    ...mapState({
      lineObj: state=>state.PageDesign.lineObj
    })
  },
  mounted() {
    this.$nextTick(() => {
      this.drawXaxis();
      this.drawYaxis();      
    });
  },
  watch: {
    scaleRatio(o, v) {
      if (v == 0) {
        this.setOldRatio(o);
      } else {
        this.setOldRatio(v);
        this.changePos(o);
      }
    },
    scrollX(val) {
      this.$refs.xaxis.style.transform = `translateX(-${val}px)`;
    },
    scrollY(val) {
      this.$refs.yaxis.style.transform = `translateY(-${val}px)`;
    }
  },
  methods: {
    ...mapMutations({
      setOldRatio: "PageDesign/setOldRatio",
      setLinePos: "PageDesign/setLinePos"
    }),
    changePos(nv) {
      this.setLinePos(nv);
      this.drawXaxis();
      this.drawYaxis();
    },
    drawXaxis() {
      let xaxis = document.getElementById("xaxis");
      let xcontext = xaxis.getContext("2d");
      xcontext.clearRect(0, 0, xaxis.width, xaxis.height);
      xcontext.strokeStyle = "#bcc9d4";
      xcontext.fillStyle = "#0e1013";
      xcontext.fillRect(0, 0, 4000, 20);
      xcontext.lineWidth = 1.0;
      xcontext.beginPath();
      xcontext.moveTo(0, 0);
      xcontext.lineTo(4000, 0);
      xcontext.closePath();
      xcontext.stroke();
      this.drawXaxisTicks(xcontext);
    },
    drawYaxis() {
      let yaxis = document.getElementById("yaxis");
      let ycontext = yaxis.getContext("2d");
      ycontext.clearRect(0, 0, yaxis.width, yaxis.height);
      ycontext.strokeStyle = "#bcc9d4";
      ycontext.fillStyle = "#0e1013";
      ycontext.fillRect(0, 0, 20, 2000);
      ycontext.lineWidth = 1.0;
      ycontext.beginPath();
      ycontext.moveTo(0, 0);
      ycontext.lineTo(0, 2000);
      ycontext.closePath();
      ycontext.stroke();
      this.drawYaxisTicks(ycontext);
    },
    showIndicator(e) {
      let pos = {
        x: e.pageX,
        y: e.pageY
      };
      let type = e.target.getAttribute("id");
      if (type == "yaxis") {
        let line = this.$refs.indicatorx;
        line.style.display = "block";
        line.style.top = pos.y - 89 + "px";
      } else if (type == "xaxis") {
        let line = this.$refs.indicatory;
        line.style.display = "block";
        line.style.left = pos.x - 2 - this.lineTabOffset + "px";
      }
    },
    hideIndicator(e) {
      let type = e.target.getAttribute("id");
      let line = {};
      if (type == "yaxis") {
        line = this.$refs.indicatorx;
      } else if (type == "xaxis") {
        line = this.$refs.indicatory;
      }
      line.style.display = "none";
    },
    drawAxis(e) {
      this.$emit("drawAxis", e);
    },
    toggleLine(){
      this.$emit("toggleLine");
      this.lineShow = !this.lineShow;

    },
    drawXaxisTicks(xcontext) {
      let deltaY;
      xcontext.fillStyle = "#bcc9d4";
      xcontext.strokeStyle = "#bcc9d4";
      for (let i = 1; i < 2000; ++i) {
        xcontext.beginPath();
        xcontext.moveTo(20, 0);
        xcontext.lineTo(20, 20);
        xcontext.textAlign = "left";
        xcontext.fillText(0, 23, 15);
        if (i % 10 === 0) {
          deltaY = this.TICK_WIDTH;
          xcontext.moveTo(20 + this.VERTICAL_TICK_SPACING * i, 0);
          xcontext.lineTo(this.VERTICAL_TICK_SPACING * i + 20, 20);
          xcontext.fillText(
            Math.round((i * this.VERTICAL_TICK_SPACING) / this.scaleRatio),
            20 + this.VERTICAL_TICK_SPACING * i,
            17
          );
        } else if(i%5 ===0) {
          deltaY = this.TICK_WIDTH / 2;
        } else {
          deltaY = this.TICK_WIDTH /3;
        }
        xcontext.moveTo(
          20 + this.AXIS_ORIGIN.x + i * this.HORIZONTAL_TICK_SPACING,
          this.AXIS_MARGIN
        );
        xcontext.lineTo(
          20 + this.AXIS_ORIGIN.x + i * this.HORIZONTAL_TICK_SPACING,
          this.AXIS_MARGIN + deltaY
        );
        xcontext.stroke();
      }
    },
    drawYaxisTicks(ycontext) {
      let deltaY;
      ycontext.fillStyle = "#bcc9d4";
      ycontext.strokeStyle = "#bcc9d4";
      for (let i = 1; i < 2000; ++i) {
        ycontext.beginPath();
        ycontext.moveTo(0, 20);
        ycontext.lineTo(20, 20);
        ycontext.textAlign = "left";
        ycontext.fillText(0, 10, 30);
        if (i % 10 === 0) {
          deltaY = this.TICK_WIDTH;
          ycontext.moveTo(0, 20 + this.VERTICAL_TICK_SPACING * i);
          ycontext.lineTo(20, this.VERTICAL_TICK_SPACING * i + 20);
          this.fillTextVertical(
            ycontext,
            Math.round((i * this.VERTICAL_TICK_SPACING) / this.scaleRatio),
            10,
            30 + this.VERTICAL_TICK_SPACING * i
          );
          ycontext.restore();
        } else if(i%5 ===0) {
          deltaY = this.TICK_WIDTH / 2;
        } else {
          deltaY = this.TICK_WIDTH /3;
        }
        ycontext.moveTo(
          this.AXIS_ORIGIN.x,
          this.AXIS_ORIGIN.x + i * this.HORIZONTAL_TICK_SPACING + 20
        );
        ycontext.lineTo(
          this.AXIS_MARGIN + deltaY,
          this.AXIS_ORIGIN.x + i * this.HORIZONTAL_TICK_SPACING + 20
        );
        ycontext.stroke();
      }
    },
    fillTextVertical(context, text, x, y) {
      //文字竖排
      text = text + "";
      var arrText = text.split("");
      var arrWidth = arrText.map(function(letter) {
        return context.measureText(letter).width;
      });
      var align = context.textAlign;
      var baseline = context.textBaseline;
      if (align == "left") {
        x = x + Math.max.apply(null, arrWidth) / 2;
      } else if (align == "right") {
        x = x - Math.max.apply(null, arrWidth) / 2;
      }
      if (
        baseline == "bottom" ||
        baseline == "alphabetic" ||
        baseline == "ideographic"
      ) {
        y = y - arrWidth[0] / 2;
      } else if (baseline == "top" || baseline == "hanging") {
        y = y + arrWidth[0] / 2;
      }
      context.textAlign = "center";
      context.textBaseline = "middle";
      // 开始逐字绘制
      arrText.forEach(function(letter, index) {
        // 是否需要旋转判断
        var code = letter.charCodeAt(0);
        if (code <= 256) {
          context.translate(x, y);
          // 英文字符，旋转90°
          context.rotate((90 * Math.PI) / 180);
          context.translate(-x, -y);
        } else if (index > 0 && text.charCodeAt(index - 1) < 256) {
          // y修正
          y = y + arrWidth[index - 1] / 2;
        }
        context.fillText(letter, x, y);
        // 旋转坐标系还原成初始态
        context.setTransform(1, 0, 0, 1, 0, 0);
        // 确定下一个字符的纵坐标位置
        var letterWidth = arrWidth[index];
        y = y + letterWidth;
      });
      // 水平垂直对齐方式还原
      context.textAlign = align;
      context.textBaseline = baseline;
    }
  }
};
</script>

<style lang="scss" scoped>
.axis-block {
  width: 20px;
  height: 20px;
  position: absolute;
  z-index: 99;
  background: #0e1013;
  border-right: 1px solid #bcc9d4;
  border-bottom: 1px solid #bcc9d4;
  cursor: pointer;
  text-align: center;
}
.ruler-main {
  position: absolute;
  top: 40px;
  bottom: 0px;
  left: 0;
  right: 0;
  overflow: hidden;
}
#yaxis,
#xaxis {
  float: left;
}

#yaxis,
#xaxis {
  position: absolute;
  z-index: 99;
}

#xaxis,
.indicatory {
  cursor: ew-resize;
}

#yaxis,
.indicatorx {
  cursor: ns-resize;
}

.indicatory {
  height: 100%;
  width: 1px;
  border-left: 1px dashed #0698de;
  position: absolute;
  top: 0;
  pointer-events: none;
  left: -999px;
  z-index: 99;
}

.indicatorx {
  width: 100%;
  height: 1px;
  border-top: 1px dashed #0698de;
  position: absolute;
  left: 0;
  pointer-events: none;
  top: -999px;
  z-index: 99;
}

.toggle-icon {
  margin-top: 2px;
  font-size: 14px;
  color:#fff;
  opacity: 0.8;
}
</style>
