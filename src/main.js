import Vue from 'vue'
import './cube-ui'
import App from './App.vue'
import './utils/windowCommon'
import router from './plugins/router'
import store from './plugins/store/store'
import './plugins/element.js'
import './plugins/vxeTable.js'; // 大数据量表格
import './plugins/bdComptsPc.js'
import './plugins/bdComptsHd.js'
import './plugins/bdComptsMobile.js'
import './plugins/vant.js'
import 'vant/lib/icon/local.css'; //引用vant本地图标
import './assets/css/reset.css'
import './assets/css/common.scss'
import axios from 'axios'
import VCharts from 'v-charts'
import bdFontIcons from 'bd-font-icons'
import GeminiScrollbar from 'vue-gemini-scrollbar'
import Watermark from '../src/plugins/store/module/watermark'
import 'handsontable/languages/zh-CN' //引入中文语言包
import echarts from 'echarts'  //引入Echarts
import VueKonva from 'vue-konva'
import VueAwesomeSwiper from 'vue-awesome-swiper' //引入swiper幻灯片组件
import { permission, permissionFilters } from 'ngbd-utils'
// require styles
import 'swiper/dist/css/swiper.css'
require('promise.prototype.finally').shim();  //ie不兼容finally
import { bdCommonFunc } from 'ngbd-utils'


Vue.prototype.$echarts = echarts

Vue.config.productionTip = false
Vue.prototype.$axios = axios // 全局注册，使用方法为:this.$axios
Vue.prototype.$Watermark = Watermark
Vue.prototype.$GlobalFuncs = bdCommonFunc
Vue.prototype.SHOW_TYPE_ARR = {
  "2": "col_chs_name",
  "1": "col_name",
  "0": "element_name"
}
Vue.prototype.MOBILE_HEIGHT = 667;
Vue.use(VCharts)
Vue.use(bdFontIcons)
Vue.use(GeminiScrollbar)
Vue.use(VueAwesomeSwiper)
Vue.use(VueKonva)
// 全局注册滚动加载指令
/**
 * 用法：v-scrollloadmore={domClass:".tables-detail .el-scrollbar__wrap",callBack:funcName}
 */
Vue.directive('scrollloadmore',{
  bind: function (el, binding) {
    const SELECTWRAP_DOM = el.querySelector(
      binding.value.domClass
    );
    if (!SELECTWRAP_DOM) {
      return false;
    }
    SELECTWRAP_DOM.addEventListener("scroll", function() {
      /*
       * scrollHeight 获取元素内容高度(只读)
       * scrollTop 获取或者设置元素的偏移值,常用于, 计算滚动条的位置, 当一个元素的容器没有产生垂直方向的滚动条, 那它的scrollTop的值默认为0.
       * clientHeight 读取元素的可见高度(只读)
       * 如果元素滚动到底, 下面等式返回true, 没有则返回false:
       * ele.scrollHeight - ele.scrollTop === ele.clientHeight;
       */
      const PADDINGBOTTOM = 10; //滚动条距离底部的距离
      const CONDITION =
        this.scrollHeight - this.scrollTop - this.clientHeight <=
        PADDINGBOTTOM;
      if (CONDITION) {
        //改成滚动条滚动到距离底部小于等于10px时就加载数据(为了处理当浏览器缩放了或者屏幕显示设置缩放时，就不能下拉加载的情况，注意，如果callBack滚动加载是采用动态请求分页的，要注意节流处理，静态分页则不用)
        binding.value.callBack();
      }
    });
  }
})
Vue.directive('permission', permission)
// register global utility filters
Object.keys(permissionFilters).forEach(key => {
  Vue.filter(key, permissionFilters[key])
})


new Vue({
  router,
  store,
  mounted() {
    if(process.env.NODE_ENV === 'development') {
      import('./assets/dataeleph-comptsdev.umd.js')
      import('./assets/dataeleph-comptsdev.css')
    }

    if (process.env.NODE_ENV == "production") {   //发布版本
      
    }
  },
  render: h => h(App)
}).$mount('#app')
export { router }
