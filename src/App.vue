<template>
<!-- 这边判断是不是在iframe中,如果是在iframe里，就是宽高自适应，不设最小宽度和高度 -->
  <div id="app" :class="isPcTeminal?'pc-wrap':'mobile-wrap'" 
  @blur="focusOutEventHandler"
  @focusout="focusOutEventHandler"
  @focus="focusEventHandler"
  :style="`${isInFrame?'min-width: unset;min-height:unset':''}`">
    <keep-alive>
<!--  设置key，如果有几个路由都是用的一个组件，刷新组件内容    -->
      <router-view v-if="isRouterAlive" :key="$route.fullPath"></router-view>
    </keep-alive>
  </div>
</template>
<script>
  import { mapActions, mapState } from "vuex";
  export default {
    name: 'App',
    provide() {
      return {
        reload: this.reload
      }
    },
    data() {
      return {
        isRouterAlive: true
      }
    },
    methods: {
      ...mapActions({
        storeVuexStore: "storeVuexStore",
        refreshTerminalState: "refreshTerminalState"
      }),
      reload() {
        this.isRouterAlive = false
        this.$nextTick(function () {
          this.isRouterAlive = true
        })
      },
      // 手机端页面增加放大缩小控制
      adPhoneSetting() {
        let metaInfo = [
          {
            name: "viewport",
            content:
              "width=device-width,initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0,user-scalable=no"
          },
          {
            name: "apple-mobile-web-app-capable",
            content: "yes"
          },
          {
            name: "apple-mobile-web-app-status-bar-style",
            content: "black"
          }
        ];
        let headObj = document.getElementsByTagName("head")[0];
        for (let index = 0; index < metaInfo.length; index++) {
          const element = metaInfo[index];
          let oMeta = document.createElement("meta");
          oMeta.content = element.content;
          oMeta.name = element.name;
          headObj.appendChild(oMeta);
        }
      },
      focusOutEventHandler() {
        if (this.isPcTeminal) {
          return;
        }
        // 软键盘收起的事件处理
        let ua = navigator.userAgent.toLowerCase();
        if (ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1) {
            // 键盘收齐页面空白问题
            window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        }
      },
      focusEventHandler() {
        if (this.isPcTeminal) {
          return;
        }
        const bodyObj = document.getElementsByTagName('body');
        if (bodyObj && bodyObj[0]) {
          bodyObj[0].scrollTop = bodyObj[0].scrollHeight;
        }
      }
    },
    components: {},
    created() {
      this.refreshTerminalState();
      //在页面加载时读取sessionStorage里的状态信息
      let input = sessionStorage.getItem("store");
      this.$store.replaceState(Object.assign({}, this.$store.state, JSON.parse(input)))
      

      //在页面刷新时将vuex里的信息保存到sessionStorage里
      window.addEventListener("beforeunload", () => {
        this.storeVuexStore();
      });
      window.addEventListener("resize", () => {
        this.refreshTerminalState();
      });
      // 苹果设备h5页面软键盘收回后页面底部留白问题
      // 这里监听键盘收起，然后滚动顶部
      // if (!this.isPcTeminal) {
      //   document.body.addEventListener('focusout', this.focusOutEventHandler);
      //   // this.$once('hook:beforeDestroy',() => {
      //   //   document.body.addEventListener('focusout', null);
      //   // });
      // }
    },
    computed: {
      ...mapState({
        isPcTeminal: state => state.isPcTeminal
      }),
      isInFrame() {
        return window.frames.length !== parent.frames.length;
      }
    },
    watch: {
      isPcTeminal(newVal) {
        if (!newVal) {
          this.adPhoneSetting();
        }
      } 
    }
  }
</script>

<style>
  body {
    overflow-y: auto;
  }
  #app {
    height: 100%;
  }
  .pc-wrap{
    min-width: 1280px;
    min-height: 650px;
  }

  .el-container {
    height: 100%;
  }

  .hide-comments ~.htCommentsContainer .htComments {
    display: none !important;
  }

  .page-dialog .el-dialog {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
</style>
