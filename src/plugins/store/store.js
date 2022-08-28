import compt from './module/Compt'
import QueryTable from './module/QueryTable'
import HomeTree from './module/HomeTree'
import HomeBody from './module/HomeBody'
import DataPortal from './module/DataPortal'
import DataSetMgt from './module/DataSetMgt'
import DataSetDesign from './module/DataSetDesign'
import ReportIndex from './module/ReportIndex'
import ReportAttr from './module/ReportAttr'
import ReportMgt from './module/ReportMgt'
import AsynExport from './module/AsynExport'
import PageDesign from './module/PageDesign'
import AnalyReportAttr from './module/AnalyReportAttr'
import Analy from './module/Analy'
import Vue from 'vue'
import Vuex from 'vuex'
import OptStack from './module/OptStack'
import {
  partialDeepCopy,
  isPC
} from "../../utils/comonFunc";
import { service } from 'ngbd-utils'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    compt,
    Analy,
    QueryTable,
    HomeTree,
    HomeBody,
    DataPortal,
    DataSetMgt,
    DataSetDesign,
    ReportIndex,
    ReportAttr,
    ReportMgt,
    AsynExport,
    PageDesign,
    AnalyReportAttr,
    OptStack
  },
  state: {
    contextUrl: '',
    uploadUrl:'/edc-visualtool-localdb/v1',
    pubSYSUrl:'/edc-pub-system-ms/v1',
    datasetUrl: '/edc-dataasset-svc-ms/v1',
    dgwMsUrl: '/edc-dgw-ms/v1',
    cctSysMs: '/nl-edc-cct-sys-ms/v1',
    dsSysMsUrl: '/edc-dataasset-svc-ms/v1',
    renderEngine: '/render-engine/v1',
    // renderEngine: 'http://10.1.2.111:8048/render-engine/v1',
    edcPubMsUrl: '/edc-pub-metainfo-ms/v1',
    defaultSystemId: 1016,
    menuName: '即席查询',
    commonProperties: {},
    menuList:[],
    isShowDemo: false, // 是否展示案例
    mobilePageList: [], // 手机页面列表
    curMobilePageIdx: -1, // 当前手机页面位置
    isPcTeminal: true // 当前页面所在终端 是否是web
  },
  getters: {

  },
  mutations: {
    upDesignType(state, type) {
      state.designType = type
    },
    upMenuName(state, type) {
      state.menuName = type
    },
    setVueConfig(state, param) {
      state.commonProperties = param;
    },
    setDefaultSystemId(state, param) {
      state.defaultSystemId = param;
    },
    setMenuList(state, value) {
      state.menuList = value;
    },
    upisShowDemo (state, value) {
      state.isShowDemo = value;
    },
    upIsPcTeminal(state, value) {
      state.isPcTeminal = value;
    }
  },
  actions: {
    upDesignType({
      commit
    }, type) {
      commit('upDesignType', type)
    },
    upMenuName({
      commit
    }, type) {
      commit('upMenuName', type)
    },
    setBaseUrl({
      state
    }, val) {
      var match = /^((ht|f)tps?):\/\/([\w\-]+(\.[\w\-]+)*\/)*[\w\-]+(\.[\w\-]+)*\/?(\?([\w\-\.,@?^=%&:\/~\+#]*)+)?/;
      for (var key in state) {
        var old = state[key];
        if (match.test(old)) {
          var sli = old.indexOf('/', 7);
          state[key] = val + old.substring(sli);
        }
      }
      state.contextUrl = val;
    },
    getVueConfig({
      state
    }) {
      //return axios.get(state.renderEngine + '/common/getVueConfig');
      return service({
        maskOff:true,
        url:state.renderEngine+'/common/getVueConfig',
        method:'get'
      })
    },
    getPageInfo({
      state
    }, param) {
      // return axios.post(state.renderEngine + '/list/queryPageInfoList', param);
      return service({
        maskOff:true,
        url: state.renderEngine + '/list/queryPageInfoList',
        method: 'post',
        data: param
      })
    },
    qryUserTenantList({
      state
    }, param) {
      // return axios.post(state.cctSysMs + '/frame/qryUserTenantList', param);
      return service({
        maskOff:true,
        url: state.cctSysMs + '/frame/qryUserTenantList',
        method: 'post',
        data: param
      })
    },
    /**
     * 缓存vuex store 跳转页面前缓存一些store的相关信息
     */
    storeVuexStore({
      rootState,
      rootGetters
    }, storeAttrArr = ["contextUrl", "defaultSystemId", "commonProperties", "HomeTree", "HomeBody", "PageDesign", "DataPortal"]) {
      let newStore = partialDeepCopy(rootState, storeAttrArr);
      // 保险起见，只把edcuiCompts、edcuiComptsMenu、pageList清掉
      if (newStore && newStore.PageDesign) {
        newStore.PageDesign["edcuiCompts"] = [];
        newStore.PageDesign["edcuiComptsMenu"] = [];
        newStore.PageDesign["pageList"] = [];
        newStore.PageDesign.lineObj = {};
      }
      const classtypeId = newStore.HomeBody.classtypeId + "";
      switch (classtypeId) {
        case "1002":
          if (newStore && newStore.compt) { //即席查询 把查询组件的options去掉
            try {
              let fieldList = newStore.compt.s_edcuiCompts[0].comptAttrs.fieldList || [];
              fieldList.forEach((item, index) => {
                if (item.type == "ElCascader") {
                  fieldList[index].comptAttrs.options = [];
                  fieldList[index].comptAttrs.options2 = [];
                }
              })
            } catch (error) {

            }

          }
          break;
        case "1001":
        case "1005": //大屏、分析报告 清空查询条件的下拉框的值
          if (newStore.PageDesign && (newStore.PageDesign.s_edcuiCompts || []).length > 0) {
            try {
              let flatComps = rootGetters['PageDesign/getFlatComptByList'](newStore.PageDesign.s_edcuiCompts);
              if (flatComps) {
                flatComps.forEach((item) => {
                  if (["Query", "MobileQuery"].includes(item.type) && item.comptAttrs && (item.comptAttrs.fieldList || []).length > 0) {
                    let fieldList = item.comptAttrs.fieldList;
                    fieldList.forEach((item2, index2) => {
                      if (["ElCascader", "VanPicker"].includes(item2.type)) {
                        fieldList[index2].comptAttrs.options = [];
                        fieldList[index2].comptAttrs.options2 = [];
                      }
                    })
                  }
                })
              }
            } catch (error) {

            }
          }
          break;
        default:
          break;
      }
      return sessionStorage.setItem("store",JSON.stringify(newStore));
    },

    /**
     * checkTermimal
     */
    refreshTerminalState({ commit }) {
      commit('upIsPcTeminal', isPC());
    }
  }
})
