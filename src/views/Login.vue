<template>
  <el-container :class="['body-wrap', isPcTeminal?'pc-login':'mobile-login']">
    <div
      v-if="isPcTeminal"
      style="position:absolute;width:100%;height:100%;z-index:0;overflow: hidden;min-width: 1280px;"
    >
      <img src="comptPic/loginBg.jpg" alt style="min-height:100%;min-width:100%;" />
    </div>
    <div class="info-block">
      <el-row class="info-wrap">
        <div class="head" v-if="isPcTeminal">
          <div class="logo">
            <img src="comptPic/loginLogo.png" alt />
          </div>大数据分析与可视化
        </div>
        <div class="info-detail" v-if="isPcTeminal">
          企业级
          <span class="high-light">数据可视化</span>
          解决方案，零编码快速搭建
          <span v-if="menuList.length>0" class="high-light">
            <span v-for="(item,index) in menuList" :key="index">
              {{item.classTypeName}}
              <span v-if="index < menuList.length - 1">、</span>
            </span>
          </span>
          <span v-if="menuList.length>0">等数据分析应用，实现数据直观展现与高效分析。</span>
          <span v-else>数据分析应用，实现数据直观展现与高效分析。</span>
        </div>
        <LoginAnimate v-if="isPcTeminal" />
        <div v-else class="mobile-container-wrap">
          <LoginAnimate />
        </div>
      </el-row>
      <div class="login-wrap">
        <el-form
          :class="{error:errorMessage!=''}"
          :label-position="labelPosition" 
          label-width="0">
          <div class="title" v-if="isPcTeminal">
            <div class="split-line"></div>
            <span>登录</span>
          </div>
          <el-form-item label>
            <el-input
              ref="userName"
              prefix-icon="icon-A10150_userCount"
              placeholder="请输入用户名"
              v-model="name"
              @input="inputChange"
            ></el-input>
          </el-form-item>
          <el-form-item label>
            <el-input
              type="password"
              ref="password"
              prefix-icon="icon-A10374_password"
              placeholder="请输入密码"
              v-model="password"
              @input="inputChange"
              @keyup.enter.native="login"
            ></el-input>
          </el-form-item>
          <el-row class="error-wrap" v-show="errorMessage!=''">
            <span :class="{animate:errorMessage.length >20}">{{errorMessage}}</span>
          </el-row>
          <el-form-item>
            <el-button type="primary" @click="login">登 录</el-button>
          </el-form-item>
          <el-row v-if="false" style="margin-top: -10px;">
            <el-checkbox class="save-ps" v-model="checked">记住密码</el-checkbox>
            <span class="forget-ps">忘记密码</span>
          </el-row>
        </el-form>
      </div>
    </div>

    <bd-div
      type="bd-slide-code"
      :pointX="pointX"
      :pointY="pointY"
      @onSuccess="success"
      @refresh="refresh"
      @onFail="fail"
      @onClose="close"
      :show="slideShow"
    />
  </el-container>
</template>
<script>
import { AESUtil } from "ngbd-utils";
import { mapActions, mapMutations, mapState } from "vuex";
import LoginAnimate from './../components/design/LoginAnimate'
// import Snap from "imports-loader?this=>window,fix=>module.exports=0!snapsvg/dist/snap.svg.js";
export default {
  components: {
    LoginAnimate
  },
  data() {
    return {
      labelPosition: "right",
      name: "",
      password: "",
      slideShow: false,
      checked: false,
      errorMessage: "",
      mesOverstep: false,
      pointX: 0,
      pointY: 0,
      passportkey: "",
      menuList:[]
    };
  },
  methods: {
    ...mapActions({
      getVueConfig: "getVueConfig"
    }),
    ...mapMutations({
      setVueConfig: "setVueConfig",
      setDefaultSystemId: "setDefaultSystemId",
      setMenuList: "setMenuList"
    }),
    refresh() {
      this.showSlide();
    },
    showSlide() {
      let param = {
        width: "310",
        height: "160"
      };
      this.slideShow = false;
      this.getPassport(param)
        .then(resp => {
          if (resp.status == 200 && resp.data.respResult == "1") {
            let data = resp.data.respData || "";
            let info = JSON.parse(AESUtil.decrypt(data));
            this.pointX = info.x;
            this.pointY = info.y;
            this.passportkey = info.passportkey;
            this.slideShow = true;
          } else {
            this.$message.error("获取验证码失败");
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    hideSlide() {
      this.slideShow = false;
    },

    login() {
      if (this.name == "") {
        // this.$message.error("请输入用户名");
        this.errorMessage = "请输入用户名";
        this.$refs.userName.focus();
        return;
      } else if (this.password == "") {
        // this.$message.error("请输入密码");
        this.errorMessage = "请输入密码";
        this.$refs.password.focus();
        return;
      }
      let reg = /^10086(\d+)$/; //账号以10086开头
      if (reg.test(this.name)) {
        this.success(0);
      } else {
        this.showSlide();
      }
    },
    success(x) {
      var param = {};
      var reg = /^[0-9]*$/;
      if (!reg.test(this.name)) {
        param = {
          nickName: this.name,
          password: AESUtil.encrypt(this.password)
        };
      } else {
        param = {
          userId: this.name,
          password: AESUtil.encrypt(this.password)
        };
      }
      param.x = Math.round(x);
      param.passportkey = this.passportkey;

      this.$axios
        .post("/edc-pub-system-ms/v1/login/check", param)
        .then(resp => {
          if (resp.data.respResult == "1") {
            let data = resp.data.respData;
            window.sessionStorage.setItem(
              "X-NG-UserInfo",
              data["X-NG-UserInfo"]
            );
            window.sessionStorage.setItem(
              "X-NG-SessionId",
              resp.headers["x-ng-sessionid"]
            );
            // this.$axios.defaults.headers.common["X-NG-SessionId"] =
            //   resp.headers["x-ng-sessionid"];
            this.hideSlide();
            return this.getVueConfig();
          } else {
            this.hideSlide();
            this.$refs.userName.focus();
            this.errorMessage = resp.data.respErrorDesc;
          }
        })
        .then(resp => {
          if (resp.status == 200 && resp.data.respResult == "1") {
            let param = resp.data.respData;
            this.setVueConfig(param);
            this.setDefaultSystemId(param.systemId);
            window.sessionStorage.setItem("X-SystemId", param.systemId);
            // if (sessionId != null && sessionId != "") {
            //   this.$axios.defaults.headers.common["X-NG-SessionId"] = sessionId;
            // }
            let XUserInfo = window.sessionStorage.getItem("X-NG-UserInfo");
            if (XUserInfo != null && XUserInfo != "") {
              let xUser = JSON.parse(XUserInfo);
              let user = xUser.userInfo;
              let tenant = xUser.currentTenant;
              if (tenant === null) {
                tenant = xUser.tenantList[0];
              }
              window.sessionStorage.setItem("user_id", user.userId); //设置user_id
              window.sessionStorage.setItem("tenant_id", tenant.tenantId);
              window.sessionStorage.setItem("tenant_name", tenant.tenantName);
              window.sessionStorage.setItem("home_city", user.homeCity);
              window.sessionStorage.setItem("user_name", user.userName);
              window.sessionStorage.setItem("user_mobile", user.mobilePhone);
              window.sessionStorage.setItem("orgId", user.orgId);
              window.sessionStorage.setItem("regionId", user.regionId);
              window.sessionStorage.setItem("user_nickName", user.nickName);
            }
            let xUser1 = JSON.parse(XUserInfo);
            if (xUser1.tenantList.length === 0) {
              throw "请找管理员划分租户归属！";
            } else {
              let callbackUrl = "/dataeleph";
              let xUrl = sessionStorage.getItem("X-NG-CallbackUrl");
              if (xUrl == null || xUrl == "") {
                sessionStorage.setItem("X-NG-CallbackUrl", callbackUrl);
              }
              this.$router.push({ path: this.isPcTeminal ? "/index" : "/PortalIndex" });
            }
          } else {
            throw "查询配置文件失败";
          }
        })
        .catch(err => {
          if (this.errorMessage == "") {
            this.hideSlide();
            this.$refs.userName.focus();
            this.errorMessage = "登录异常：" + err;
          }
        });
    },
    fail() {},
    inputChange() {
      this.errorMessage = "";
    },
    close() {
      this.hideSlide();
    },
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
          Snap.animate(0, 0, function() {}, 3000, function() {
            setTimeout(function() {
              _this.animate1(pln, pth);
            }, 1000);
          });
        }
      );
    },
    animate2(tar, path) {
      let _this = this;
      let length = Snap.path.getTotalLength(path.attr("d"));
      let timer = null;
      clearTimeout(timer);
      Snap.animate(0, 0, function() {}, 2000, function() {
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
            Snap.animate(0, 0, function() {}, 2000, function() {
              timer = setTimeout(function() {
                _this.animate2(tar, path);
              }, 1000);
            });
          }
        );
      });
    },
    animate3(tar, path) {
      let _this = this;
      let length = Snap.path.getTotalLength(path.attr("d"));
      let timer = null;
      clearTimeout(timer);
      Snap.animate(0, 0, function() {}, 3000, function() {
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
      });
    },
    getPassport(param) {
      return this.$axios.post("/edc-pub-system-ms/v1/auth/passport", param);
    },
    focusOutEventHandler() {
      // 软键盘收起的事件处理
      let ua = navigator.userAgent.toLowerCase();
      if (ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1) {
          // 键盘收齐页面空白问题
          window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      }
    }
  },
  created() {
    this.$axios.get("/render-engine/v1/outAuth/getCatalogClass").then(resp=>{
      if (resp.status == 200 && resp.data.respResult == "1") {
        let data = resp.data.respData||[];
        if(data.length>0){
          data = data.splice(0,4);
          this.menuList = data.map(val=>{
            let _m = {classTypeName: val.classTypeName, classTypeId: val.classTypeId}
            // _m.push({classTypeName: val.classTypeName, classTypeId: val.classTypeId})
            return _m
          });
          this.setMenuList(this.menuList);
        }
      }
    }).catch(err=>{
      console.log(err);
    })
  },
  mounted() {
    // let svg = Snap("#svg-wrap");
    // let path = svg.select("#svg-line1");
    // let dot1 = svg.select("#dot1");
    // this.animate1(dot1, path);  //轨迹1
    // let dot2 = Snap.select("#dot2");
    // let dot3 = Snap.select("#dot3");
    // let dot4 = Snap.select("#dot4");
    // let dot5 = Snap.select("#dot5");
    // let dot6 = Snap.select("#dot6");
    // let path21 = svg.paper.path("M20.4,124.5l45.4,26.9");
    // let path22 = svg.paper.path("M48.1,108.2l45.4,26.9");
    // let path23 = svg.paper.path("M74.7,92.4l46.1,26.5");
    // let path24 = svg.paper.path("M100.9,77.2l45.4,26.9");
    // let path3 = Snap.select("#svg-line3");
    // this.animate2(dot2, path21);  //轨迹2
    // this.animate2(dot3, path22);
    // this.animate2(dot4, path23);
    // this.animate2(dot5, path24);
    // this.animate3(dot6, path3);   //轨迹3

    // 苹果设备h5页面软键盘收回后页面底部留白问题
    // 这里监听键盘收起，然后滚动顶部
    if (!this.isPcTeminal) {
      document.body.addEventListener('focusout', this.focusOutEventHandler);
      // this.$once('hook:beforeDestroy',() => {
      //   document.body.addEventListener('focusout', null);
      // });
    }
  },
  computed: {
    ...mapState({
      isPcTeminal: state => state.isPcTeminal
    })
  }
};
</script>

<style lang="scss" scoped>
$bg-clr1: #114d95;
$main-clr: #409eff;
$main-clr2: #ffffff;
$main-clr3: #45fffd;
$main-clr4: #5dadff;
$hover-clr: #45fffd;
$bd-clr: #2385ea;
$bgi-lg1: rgba(46, 30, 162, 0.8);
$bgi-lg2: rgba(0, 128, 178, 0.8);
$error-clr: #f56c6c;
.pc-login {
  &.body-wrap {
    position: relative;
    min-width: 1280px;
    overflow: hidden;
    background-repeat: no-repeat;
    background-size: 100% 100%;
  }
  .info-block {
    width: 1200px;
    height: 650px;
    margin: auto;
  }
  .info-wrap {
    float: left;
    .head {
      font-size: 22px;
      color: $main-clr;
      padding-bottom: 25px;
      .logo {
        background-repeat: no-repeat;
        background-size: 100% 100%;
        height: 40px;
        width: 202px;
      }
    }
    .info-detail {
      color: $main-clr2;
      font-size: 20px;
      line-height: 40px;
      max-width: 630px;
      .high-light {
        color: $main-clr3;
      }
    }
    .login-img {
      margin-left: -13%;
      background-repeat: no-repeat;
      background-size: contain;
      height: calc(100% - 200px);
      background-position-y: center;
    }
  }

  .login-wrap {
    float: right;
    height: 100%;
    margin-top: 130px;
    > form {
      width: 390px;
      height: 390px;
      background-image: linear-gradient(
        -45deg,
        rgba(46, 30, 162, 0.8),
        rgba(0, 128, 178, 0.8)
      );
      background-image: -webkit-linear-gradient(
        -45deg,
        rgba(46, 30, 162, 0.8),
        rgba(0, 128, 178, 0.8)
      );
      padding: 40px;
      padding-top: 60px;
      margin: auto;
      position: relative;
    }
    /deep/.title {
      position: relative;
      height: 30px;
      color: $main-clr3;
      margin-bottom: 30px;
      .split-line {
        position: absolute;
        height: 2px;
        left: 0;
        right: 0;
        bottom: 0;
        background: -webkit-linear-gradient(0deg, #2d4ca7, #2264ab);
        background: -o-linear-gradient(0deg, #2d4ca7, #2264ab);
        background: linear-gradient(0deg, #2d4ca7, #2264ab);
      }
      span {
        position: relative;
        display: inline-block;
        height: 30px;
        font-size: 16px;
        border-bottom: 1px solid $main-clr3;
        z-index: 2;
      }
    }
    /deep/.el-input__prefix {
      left: 10px;
    }
    /deep/.el-input__inner {
      background-color: $bg-clr1;
      border-color: $bd-clr;
      color: $main-clr2;
      /* &:hover {
      border-color: $hover-clr;
    } */
      &:focus {
        border-color: $hover-clr;
      }
    }
    /deep/ .el-button--primary {
      width: 100%;
      margin-top: 40px;
    }
    /deep/.save-ps {
      color: $main-clr4;
    }
    /deep/.forget-ps {
      color: $main-clr4;
      float: right;
      cursor: pointer;
    }
    /deep/.el-checkbox__inner {
      background: transparent;
      border-color: #409eff;
    }
  }
  /deep/ .container {
    margin: 50px;
    position: relative;
    margin-top: 20px;
    margin-left: -110px;
  }
}

.mobile-login {
  .img-block {
    float: unset;
  }
  &.body-wrap {
    position: relative;
    display: block;
    overflow: hidden;
    background-repeat: no-repeat;
    background-size: 100% 100%;
    width: 100%;
    height: 100%;
  }
  .info-block {
    position: relative;
    height: 100% !important;
  }
  .info-wrap {
    position: relative;
    height: 50%;
    background-color: #0a2b4c;
  }

  .login-wrap {
    position: relative;
    height: 50%;
    margin-top: 0 !important;
    width: 100%;
    > form {
      position: absolute;
      top: 50%;
      width: 80%;
      left: 10%;
      margin-top: -92.5px;
    }
    /deep/.el-input__inner {
      border-width: 0 0 1px;
      border-radius: 0px;
    }
    /deep/ .el-button--primary {
      width: 100%;
      margin-top: 20px;
    }
    /deep/.forget-ps {
      float: right;
      cursor: pointer;
    }
    /deep/.el-checkbox__inner {
      background: transparent;
      border-color: #409eff;
    }
    .error-wrap {
      left: 0px;
      right: 0px;
      bottom: 50px;
    }
    .el-form-item:last-child {
      margin-bottom: 0;
    }
  }
  .mobile-container-wrap {
    position: absolute;
    width: 284px;
    height: 200px;
    transform: translate(-50%, -50%);
    left: 50%;
    top: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  /deep/ .container {
    position: relative;
    margin: unset;
    transform: scale(0.4);
    margin-top: -20px;
    // width: 284px;
    // height: 168px;
    // left: -142px;
    // top: 20px;
    // left: -80px;
    // // top: 50%;
    // margin-top: -84.4px;
  }
}

.error-wrap {
  position: absolute;
  color: $error-clr;
  left: 40px;
  right: 40px;
  overflow: hidden;
}
.animate {
  display: inline-block;
  white-space: nowrap;
  animation: 10s wordsLoop linear infinite normal;
}

@keyframes wordsLoop {
  0% {
    transform: translateX(200px);
    -webkit-transform: translateX(200px);
  }
  100% {
    transform: translateX(-100%);
    -webkit-transform: translateX(-100%);
  }
}

@-webkit-keyframes wordsLoop {
  0% {
    transform: translateX(200px);
    -webkit-transform: translateX(200px);
  }
  100% {
    transform: translateX(-100%);
    -webkit-transform: translateX(-100%);
  }
}
@media screen and (max-width: 1366px) {
  .info-block {
    height: 590px;
  }
  .login-wrap {
    margin-top: 100px;
  }
  .container {
    transform: scale(0.8);
  }
}


/* svg部分 */
.st0 {
  fill: none;
  stroke: transparent;
  stroke-miterlimit: 10;
}
.container {
  margin: 50px;
  position: relative;
  margin-top: 20px;
  margin-left: -110px;
}

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

.paper-txt{
  position: absolute;
  font-weight: bold;
  font-size: 15px;
  color: rgba(170, 225, 254, 0.7);
  transform: skewY(32deg);
  letter-spacing: -1px;
}
.paper-txt:nth-child(1){
  top:86px;
  left:14px;
}
.paper-txt:nth-child(2){
  top:70px;
  left:42px;
}
.paper-txt:nth-child(3){
  top:54px;
  left:69px;
}
.paper-txt:nth-child(4){
  top:35px;
  left:94px;
}


// .rect4 {
//   offset-path: path(
//     "M106.261,127.628l12.667,6.5v13.667l74,43.833L17.561,294.18"
//   );
//   animation: lineOne 8s linear 0s infinite normal;
// }

// .rect6 {
//   offset-path: path("M17.6,59.6L106.9,14v3.8l16-8l55.2,30.8l60.4-34.8");
//   animation: lastLine 8s linear 0s infinite normal;
// }

/*4line*/
// .rect1 {
//   offset-path: path("M20.4,124.5l45.4,26.9");
//   animation: fourLine 8s linear 0s infinite normal;
// }

// .rect2 {
//   offset-path: path("M48.1,108.2l45.4,26.9");
//   animation: fourLine 8s linear 0s infinite normal;
// }

// .rect3 {
//   offset-path: path("M74.7,92.4l46.1,26.5");
//   animation: fourLine 8s linear 0s infinite normal;
// }

// .rect5 {
//   offset-path: path("M100.9,77.2l45.4,26.9");
//   animation: fourLine 8s linear 0s infinite normal;
// }

@keyframes lineOne {
  0% {
    offset-distance: 100%;
  }
  25% {
    offset-distance: 100%;
  }
  62.5% {
    offset-distance: 0%;
  }
}

@keyframes fourLine {
  0% {
    offset-distance: 100%;
    background: #4fffff;
  }
  62.5% {
    offset-distance: 100%;
  }
  75% {
    offset-distance: 0%;
    background: #4fffff;
  }
  76% {
    background: transparent;
  }
  100% {
    offset-distance: 0%;
    background: transparent;
  }
}

@keyframes lastLine {
  0% {
    offset-distance: 0%;
  }
  75% {
    offset-distance: 0%;
  }
  100% {
    offset-distance: 100%;
  }
}

@media screen and (min-height: 671px) {
    .mobile-login /deep/ .container {
    transform: scale(0.5);
    margin-top: -40px;
    // left: -83px;
  }
}
</style>
<style>
.vue-puzzle-vcode {
  display: none;
}
.vue-puzzle-vcode.show {
  display: block;
}
</style>


