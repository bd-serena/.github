<template>
  <div class="container">
    <div class="img-block">
      <img src="comptPic/svg_animate.png" alt />
    </div>

    <div class="svg-part act">
      <svg id="svg-wrap" width="221" height="288">
        <g>
          <path class="st0" id="svg-line3" d="M17.6,59.6L106.9,14v3.8l16-8l55.2,30.8l60.4-34.8" />
          <path
            class="st0"
            id="svg-line1"
            d="M106.261,127.628l12.667,6.5v13.667l74,43.833L17.561,294.18"
          />
          <path class="st0" d="M106.261,127.628l-12.771,7.5L48.121,108.21" />
          <path class="st0" d="M106.261,127.628l-40.5,23.833l-45.369-26.918" />
          <path class="st0" d="M100.895,77.174l45.369,26.918l-40.003,23.536" />

          <circle id="dot1" cx="0" cy="-2" r="4" fill="#45fffd" />
          <circle id="dot2" cx="0" cy="-2" r="2" fill="#45fffd" />
          <circle id="dot3" cx="0" cy="-2" r="2" fill="#45fffd" />
          <circle id="dot4" cx="0" cy="-2" r="2" fill="#45fffd" />
          <circle id="dot5" cx="0" cy="-2" r="2" fill="#45fffd" />
          <circle id="dot6" cx="0" cy="-2" r="3" fill="#45fffd" />
        </g>
      </svg>
      <div class="rect rect1"></div>
      <div class="rect rect2"></div>
      <div class="rect rect3"></div>
      <div class="rect rect4"></div>
      <div class="rect rect5"></div>
      <div class="rect rect6"></div>

      <div class="cover" style="top:82px; right:64px;">
        <img src="comptPic/base_cover.png" alt />
      </div>
      <div class="cover" style="bottom:-52px; right:105px;">
        <img src="comptPic/data_source.png" alt />
      </div>
      <div class="cover" style="bottom:14px; right:-12px;">
        <img src="comptPic/data_set.png" alt />
      </div>
      <div class="cover" style="top:-94px; right:-111px;">
        <img src="comptPic/drive_seat.png" alt />
      </div>
      <div class="cover" style="top:-62px; left:-68px;">
        <img src="comptPic/paper_fold.png" alt />
        <div>
          <div
            class="paper-txt"
            v-for="(item,index) in menuList"
            :key="index"
          >{{item.classTypeName}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'; 
import Snap from "imports-loader?this=>window,fix=>module.exports=0!snapsvg/dist/snap.svg.js";
export default {
  data() {
    return {
      menuList: []
    };
  },
  methods: {
    ...mapMutations({
      setMenuList: "setMenuList"
    }),
    animate1(pln, pth) {
      let _this = this;
      let len = Snap.path.getTotalLength(pth.attr("d"));

      Snap.animate(
        len,
        0,
        function(l) {
          pln.attr({ fill: "#45fffd" });
          var dot = pth.getPointAtLength(l);
          pln.attr({
            transform: "t" + [dot.x, dot.y] + "r" + (dot.alpha - 90)
          });
        },
        2000,
        function() {
          pln.attr({ fill: "transparent" });
          Snap.animate(
            0,
            0,
            function() {},
            3000,
            function() {
              setTimeout(function() {
                _this.animate1(pln, pth);
              }, 1000);
            }
          );
        }
      );
    },
    animate2(tar, path) {
      let _this = this;
      let length = Snap.path.getTotalLength(path.attr("d"));
      let timer = null;
      clearTimeout(timer);
      Snap.animate(
        0,
        0,
        function() {},
        2000,
        function() {
          Snap.animate(
            length,
            0,
            function(l) {
              tar.attr({ fill: "#45fffd" });
              var dot = path.getPointAtLength(l);
              tar.attr({
                transform: "t" + [dot.x, dot.y] + "r" + (dot.alpha - 90)
              });
            },
            1000,
            function() {
              tar.attr({ fill: "transparent" });
              Snap.animate(
                0,
                0,
                function() {},
                2000,
                function() {
                  timer = setTimeout(function() {
                    _this.animate2(tar, path);
                  }, 1000);
                }
              );
            }
          );
        }
      );
    },
    animate3(tar, path) {
      let _this = this;
      let length = Snap.path.getTotalLength(path.attr("d"));
      let timer = null;
      clearTimeout(timer);
      Snap.animate(
        0,
        0,
        function() {},
        3000,
        function() {
          Snap.animate(
            0,
            length,
            function(l) {
              tar.attr({ fill: "#45fffd" });
              var dot = path.getPointAtLength(l);
              tar.attr({
                transform: "t" + [dot.x, dot.y] + "r" + (dot.alpha - 90)
              });
            },
            2000,
            function() {
              tar.attr({ fill: "transparent" });
              timer = setTimeout(function() {
                _this.animate3(tar, path);
              }, 1000);
            }
          );
        }
      );
    }
  },
  mounted() {
    let svg = Snap("#svg-wrap");
    let path = svg.select("#svg-line1");
    let dot1 = svg.select("#dot1");
    this.animate1(dot1, path); //轨迹1
    let dot2 = Snap.select("#dot2");
    let dot3 = Snap.select("#dot3");
    let dot4 = Snap.select("#dot4");
    let dot5 = Snap.select("#dot5");
    let dot6 = Snap.select("#dot6");
    let path21 = svg.paper.path("M20.4,124.5l45.4,26.9");
    let path22 = svg.paper.path("M48.1,108.2l45.4,26.9");
    let path23 = svg.paper.path("M74.7,92.4l46.1,26.5");
    let path24 = svg.paper.path("M100.9,77.2l45.4,26.9");
    let path3 = Snap.select("#svg-line3");
    this.animate2(dot2, path21); //轨迹2
    this.animate2(dot3, path22);
    this.animate2(dot4, path23);
    this.animate2(dot5, path24);
    this.animate3(dot6, path3); //轨迹3
  },
  created() {
    this.$axios
      .get("/render-engine/v1/outAuth/getCatalogClass")
      .then(resp => {
        if (resp.status == 200 && resp.data.respResult == "1") {
          let data = resp.data.respData || [];
          if (data.length > 0) {
            data = data.splice(0, 4);
            this.menuList = data.map(val => {
              let _m = {
                classTypeName: val.classTypeName,
                classTypeId: val.classTypeId
              };
              // _m.push({classTypeName: val.classTypeName, classTypeId: val.classTypeId})
              return _m;
            });
            this.setMenuList(this.menuList);
          }
        }
      })
      .catch(err => {
        console.log(err);
      });
  }
};
</script>

<style scoped>
.st0 {
  fill: none;
  stroke: transparent;
  stroke-miterlimit: 10;
}
/* .container {
  position: relative;
  margin: 0 auto;
  transform: scale(0.4);
  left: -80px;
  top: 12px;
} */

/* .container {
  margin: 50px;
  position: relative;
  margin-top: 20px;
  margin-left: -110px;
} */

.rect {
  position: absolute;
  top: 0;
  left: 0;
  width: 8px;
  height: 8px;
  background: #4fffff;
  border-radius: 4px;
}

.rect1,
.rect2,
.rect3,
.rect5 {
  width: 4px;
  height: 4px;
  border-radius: 2px;
}

.img-block {
  float: left;
}

.svg-part {
  position: absolute;
  top: 126px;
  left: 343px;
}

.cover {
  position: absolute;
}

.paper-txt {
  position: absolute;
  font-weight: bold;
  font-size: 15px;
  color: rgba(170, 225, 254, 0.7);
  transform: skewY(32deg);
  letter-spacing: -1px;
}
.paper-txt:nth-child(1) {
  top: 86px;
  left: 14px;
}
.paper-txt:nth-child(2) {
  top: 70px;
  left: 42px;
}
.paper-txt:nth-child(3) {
  top: 54px;
  left: 69px;
}
.paper-txt:nth-child(4) {
  top: 35px;
  left: 94px;
}
</style>