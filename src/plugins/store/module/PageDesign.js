import axios from 'axios';
import { service } from 'ngbd-utils'
import {
  dateFormatTrans,
  filterQueryCondis,
  getCurDimValu,
  getMatchedElementId,
  getQueryCondi,
  objDeepCopy,
  queryFieldMap,
  setCondiToCompt,
  constructList,
  formatNumber,
  getFilteredData,
  windowResize
} from "../../../utils/comonFunc";
import { router } from "../../../main"

const PageDesign = {
  namespaced: true,
  state: {
    loading: false, // 加载中
    activedNum: -1, //当前选中的组件,有可能是id或者组件对象
    activedBlock: '', //当前选中的布局块
    comptNum: 0,
    datasetName: '',
    edcuiCompts: [],
    edcuiComptsMenu: [], //菜单json数据
    exportDialog: false,
    summarizeDialog: false,
    aggergationFunDialog: false,
    listImportDialog: false,
    QueryHistory: false,
    smsId: '',
    importField: '',
    colIndex: 0,
    pageList: [],
    designType: 1,
    s_edcuiCompts: [],
    activedCompt: [],
    templateData: [],
    bgColor: 'rgba(255, 255, 255, 1)',
    activedPage: 0,
    paramVal: "",
    warningDialog: false,
    isExistFlag: false,
    activeName: 'attr',
    styleAttrsIndex: [],
    activedTab: [],
    mobileLinkPages: [], //手机端子页面联动信息
    PCDialogVisible: false, //pc内容定制浮动窗口
    PCDialogPageInfo: {}, //pc内容定制浮窗页面数据
    pageComptsList: [], //存储页面跳转的组件列表
    paramSetDiaVis: false, //参数设置弹窗
    linkStack: [],
    captureDialogVisible: false,
    pageTemplateInfo: {},
    templateShow: false, //大屏设计页面是否展示模板列表
    lineObj:{},
    commonStyle: [],//大屏设计页面公共样式
    commonStyleArr: [], //大屏设计页面公共样式
    newStyleSetCompts: ['ProgressBar', 'PcIndicatorTrend'] // 新版组件的样式设置，值都存储在extendSetting里
  },
  getters: {
    getActivedCompt(state, getters, rootState, rootGetters) {
      var result = {}
      if (typeof state.activedNum == 'object') {
        result = state.activedNum;
      } else if (state.activedNum !== '') {
        var cpts = state.s_edcuiCompts
        for (var i = 0; i < cpts.length; i++) {
          if (cpts[i].comptId == state.activedNum) {
            result = cpts[i]
            break;
          }
        }
      } else if (state.comptNum != null) {
        if (state.comptNum == 0) {
          result = state.s_edcuiCompts[state.comptNum] || {}
        } else {
          result = state.s_edcuiCompts[state.comptNum - 1]
        }
      }
      state.activedCompt = result
      return result
    },
    getActivedPage(state, getters, rootState, rootGetters) {
      var result = {}
      if (state.activedPage !== '') {
        for (var page of state.pageList) {
          if (page.pageId == state.activedPage) {
            result = page
            break;
          }
        }
      }
      if (rootState.HomeBody.pageCache.classTypeId == "1005" && result.bgClor == "") {
        //  result.bgClor = "rgba(14, 59, 103, 1)";
        result.bgClor = "#0a2b4c";
      }
      return result
    },
    getLayout(state, getters, rootState, rootGetters) { // 获取流动式布局块面信息
      const result = []
      if (state.designType != 1) {
        return result
      }
      for (var i = 0; i < state.s_edcuiCompts.length; i++) {
        // state.s_edcuiCompts[i].blockInfo["i"] = state.s_edcuiCompts[i].comptId
        result.push(state.s_edcuiCompts[i].blockInfo)
      }
      return result
    },
    activeComptIdx(state) { // 当前
      let idx = -1
      /* for (let i = 0; i < state.s_edcuiCompts.length; i++) {
        if (state.s_edcuiCompts[i].comptId == state.activedNum) {
          idx = i
          break;
        }
      } */
      if (state.activedCompt.type != null) {
        idx = state.activedCompt.orderId;
      }
      return idx
    },
    getFlatCompt(state, getters) {
      let flatCompts = [];
      if (state.PCDialogVisible) { //浮窗打开，设置联动条件时，应该查找浮窗内所有组件 不然会报错
        flatCompts = getters.getFlatComptByList(state.PCDialogPageInfo.pageDetail || []);
        return flatCompts;
      }
      let list = state.s_edcuiCompts;
      list.forEach(val => {
        flatCompts.push(val);
        if (val.type == 'ElTabs' || val.type == 'VanCollapse' || val.type == 'ElCarousel') {
          let tabCompts = getters.getTabCompts(val);
          flatCompts.push(...tabCompts);
        }
      })
      return flatCompts;
    },
    getFlatComptByList: (state, getters) => list => {
      let flatCompts = [];
      list.forEach(val => {
        flatCompts.push(val);
        if (val.type == 'ElTabs' || val.type == 'VanCollapse' || val.type == 'ElCarousel') {
          let tabCompts = getters.getTabCompts(val);
          flatCompts.push(...tabCompts);
        }
      })
      return flatCompts;
    },
// 获取所有页面的组件
    getAllFlatCompt(state, getters) {
      let flatCompts = [];
      let list = [];
      for (let index = 0; index < state.pageList.length; index++) {
        const element = state.pageList[index];
        list = list.concat(element.pageDetail);
      }
      flatCompts = getters.getFlatComptByList(list) || [];
      return flatCompts;
    },
    getComptAfIds(state, getters) {
      let list = [];
      let comptList = [];
      if (getters.getAllFlatCompt.length > 0) {
        comptList = getters.getAllFlatCompt;
      } else {
        comptList = getters.getFlatCompt;
      }
      comptList.forEach(val => {
        let afId = (val.afId || "").trim();
        afId = afId.split(",");
        afId.forEach(item => {
          let id = item.trim() || "";
          if (id != "" && !list.includes(id)) {
            list.push(id);
          }
        });
      })
      return list;
    },
    getTabCompts: (state, getters) => obj => {
      let result = [];
      let list = obj.comptAttrs.editableTabs;
      for (let item of list) {
        let compts = item.comptList;
        for (let compt of compts) {
          if (compt.type == 'ElTabs' || compt.type == 'VanCollapse' || compt.type == 'ElCarousel') {
            result.push(compt);
            let tabCompts = getters.getTabCompts(compt);
            result.push(...tabCompts);
          } else {
            result.push(compt);
          }
        }
      }
      return result;
    },
    getPageById: (state, getters) => pageId => {
      let pageItem = state.pageList.filter(item => {
        return item.pageId == pageId;
      })
      if (pageItem.length > 0)
        return pageItem[0];
      else
        return {};
    },
    getColsTotalAndData(state, getters) {
      let columns = (state.activedCompt.comptData || {}).columns || [];
      let array = (state.activedCompt.comptData || {}).rows || [];
      let colsTotal = {};//总计
      let colsData = {};//每个系列对应的维度值
      for (var i = 0; i < columns.length; i++) {
        let result = 0;
        let col = {};
        for (var j = 0; j < array.length; j++) {
          result += parseFloat(array[j][columns[i]]);
          col[array[j][['VeLines', 'VeLinesBmap'].includes(state.activedCompt.type) ? columns[1] : columns[0]]] = parseFloat(array[j][columns[i]]);
        }
        colsTotal[columns[i]] = result;
        colsData[columns[i]] = col;
      }
      return {
        colsTotal: colsTotal,
        colsData: colsData
      };
    },
    getPageParams(state) {
      let res = [];
      if (state.pageList.length > 0) {
        res = state.pageList[0].pageParams || [];
      }
      return res;
    },
// 获取当前页的查询组件
    getQueryCompts: (state, getters) => param => {
      let res = [];
      let flatCompt = [];
      if (param != undefined) {
        let result = {};
        for (var page of state.pageList) {
          if (page.pageId == param) {
            result = page
            break;
          }
        }
        flatCompt = getters.getFlatComptByList(result.pageDetail || []);
      } else {
        flatCompt = getters.getFlatCompt;
      }
      for (const comp of flatCompt) {
        if (["Query", "MobileQuery"].includes(comp.type)) {
          //找到查询组件
          res.push(comp);
        }
      }
      return res;
    },
// 判断查询组件值是否需要执行设置联动条件操作
//基本条件：列表点进来的预览页面 当前是非首页或者浮窗
    isNeedWatchVal(state, getters, rootState, rootGetters) {
      let pageCache = rootState.HomeBody.pageCache;
      return pageCache.operation == "preview" && (pageCache.parentId != "0" || state.PCDialogVisible)
    },
    isQuery: (state, getters, rootState, rootGetters) => queryCompt => {//查询条件字段
      let condiParam = queryCompt.fieldList
      let isQuery = true;
      for (var params of condiParam) {
        if (params.type == 'ElButton') {
          continue;
        }
        if (params.comptAttrs.isSetRequired) {
          if (params.comptAttrs.is_import) {  //如果是导入字段
            if (params.comptAttrs.import_tabId == "" || params.comptAttrs.import_symbol == "") {
              isQuery = false;
              break;
            }
          } else if (params.type == 'ElDatePicker') {
            if ((params.comptAttrs.cycleType == "date" && (params.comptAttrs.m_value[0] == '' || params.comptAttrs.m_value[0] == null))||
              (params.comptAttrs.cycleType == "daterange" && (params.comptAttrs.m_value[0] == '' || params.comptAttrs.m_value[0] == null || params.comptAttrs.m_value[1] == '' || params.comptAttrs.m_value[1] == null))
            ) {
              isQuery = false;
              break;
            }
          } else if (params.type == 'ElNumber') {
            params.comptAttrs.numList.forEach((item, i) => {
              if ((item.label !==20 && item.label !== 21) && (item.label == "" || item.m_value == "")) {
                isQuery = false;
              }
            });
            if (isQuery == false) {
              break;
            }
          } else {
            if ((params.comptAttrs.symbol !==20 && params.comptAttrs.symbol !== 21) && (params.comptAttrs.m_value == '' || params.comptAttrs.m_value.length <= 0)) {
              isQuery = false;
              break;
            }
          }
        }
      }
      return isQuery;
    },
    latestOrderId(state, getters) {
      if (getters.getAllFlatCompt.length > 0) {
        let idList = [];
        getters.getAllFlatCompt.forEach(val => {
          idList.push(val.orderId);
        })
        let max = Math.max(...idList);
        return max + 1;
      } else {
        return 1;
      }
    },
    isAdvanceSetVis(state, getters, rootState, rootGetters) {
      //高级设置面板是否展示
      let flag = false;
      //对于可以绑定数据集，有维度字段（存在xAxisData属性中）的组件都可以联动其他组件
      // 对于只有度量字段没有维度字段的组件，不能联动其他组件的组件：eg:仪表盘 环形图(可以设置预警)，大屏的指标1-4等["VeGauge","VeRing"]
      // 交叉表比较特殊，交叉表聚合情况可以只有列，没有行字段
      // VeRing虽然不能设置联动，但是可以设置预警
      /**
       *   (["CrossTable", "VeRing"].includes(this.activedCompt.type) ||
          (comptAttrs.xAxisData || []).length > 0)
      */
      /* let typeArr = [];
      this.dataClassifyAuth.forEach(item => {
        if (
          item.isMeasure === 1 &&
          item.isDim === 0 &&
          item.type !== "VeRing"
        ) {
          typeArr.push(item.type);
        }
      });
      console.log(typeArr); */


      let comptAttrs = state.activedCompt.comptAttrs || {};
      if (
        state.activedCompt &&
        comptAttrs.isBindData == "1"
        // !typeArr.includes(this.activedCompt.type)
      ) {
        flag = true;
      }

       if (
        comptAttrs.setting && 
        comptAttrs.setting.isMeasure === 1 &&
        comptAttrs.setting.isDim === 0 &&
        state.activedCompt.type !== "VeRing"
        ) {
          flag = false;
        }

      if (
        [
          "HdIconBlock",
          "ElImage",
          "HdIconKpiBlock",
          "HdKpiBlock",
          "HdKpiBlock2",
          "HdKpiBlock3",
          "HdButton",
          "HdWater",
          "BdTextNote",
          "VeScatter",
          "Scatter"
        ].includes(state.activedCompt.type)
      ) {
        flag = true;
      }
      //暂时开放第三方组件
      if(state.activedCompt && state.activedCompt.comptAttrs && state.activedCompt.comptAttrs.isExtComp === "1"){
        flag = true;
      }
      if (["ProgressBar","VeTree"].includes(state.activedCompt.type)) {
        flag = false;
      }
      return flag;
    }
  },
  mutations: {
    //大屏设计页面公共样式
    commonStyArr(state, value) {
      state.commonStyleArr = value;
    },
    //大屏设计页面公共样式
    commonSty(state, value) {
      state.commonStyle = value;
    },
    setLineObj(state, value) {
      state.lineObj = value;
    },
    setOldRatio(state, value) {
      state.pageList.forEach(val=>{
        val.lineObj.oldRatio = value;
      })
      // state.lineObj.oldRatio = value;
    },
    setLinePos(state, value){
      state.pageList.forEach(v=>{
        let obj = v.lineObj;
        if (obj.xlines.length > 0) {
          obj.xlines.forEach(val => {
            val.pos = (((val.pos - 20) / obj.oldRatio) * value + 20).toFixed(3);
          });
        }
        if (obj.ylines.length > 0) {
          obj.ylines.forEach(val => {
            val.pos = (((val.pos - 40) / obj.oldRatio) * value + 40).toFixed(3);
          });
        }
      })
    },
    setActivedCompt(state, value) {
      state.activedCompt.comptAttrs = value.comptAttrs;
    },
    addPageList(state, value) {
      state.pageList.push(value)
    },
    upComptNum(state, type) {
      if (type == 'add') {
        state.comptNum++
      } else {
        state.comptNum--
      }
    },
    upActivedBlock(state, value) {
      state.activedBlock = value;
    },
    upComptDatasetName(state, name) {
      state.datasetName = name;
    },
    upActivedId(state, id) {
      state.activedNum = id;
    },
    upAggergationFunDialog(state, bool) {
      state.aggergationFunDialog = bool
    },
    getEdcuiCompts(state) {
      //图形菜单
      const menuData = require('@/../public/comptConfig/edcuiComptsMenu.json');
      state.edcuiComptsMenu = menuData;
      // 读取默认组件配置
      let allComptData = [];
      for (let index = 0; index < menuData.length; index++) {
        const element = menuData[index].children;
        let iconClass = menuData[index].iconClass;
        element.forEach(item => {
          allComptData = allComptData.concat(require(`@/../public/comptConfig/${item.requiedJson}`));
          allComptData[allComptData.length - 1].comptAttrs.comptIcon = iconClass;
        })
      }
      state.edcuiCompts = Object.freeze(allComptData);
      state.comptNum = state.s_edcuiCompts.length;
    },
    setComptMenu(state, value) {
      const menuData = value || [];
      state.edcuiComptsMenu = menuData;
    },
    setPageDetail(state, value) {
      state.s_edcuiCompts = [];
      setTimeout(() => {
        state.s_edcuiCompts = value;
      }, 0);
    },
    setSedcuiCompts(state, list) {
      if (list.length > 0) {
        state.s_edcuiCompts = list;
      } else {
        state.s_edcuiCompts = [];
      }
    },
    setPageListAndScompts(state, list) {
      state.pageList.splice(0, state.pageList.length);
      state.pageList = list;
      const oriPageLinkCondis = sessionStorage.getItem('pageLinkCondis');
      let allPage = sessionStorage.getItem('allPagesInfo');
      let allPagesInfo = JSON.parse(allPage);
      let linkedIndex = 0;
      if (oriPageLinkCondis) {
        allPagesInfo.forEach((data, index) => {
          if (oriPageLinkCondis.indexOf(data.pageId) > -1) {
            linkedIndex = index;
          }
        });
      } else {
        state.s_edcuiCompts.splice(0, state.s_edcuiCompts.length);
        state.s_edcuiCompts = list[0].pageDetail;
      }
      state.activedPage = list[linkedIndex].pageId;
      state.lineObj = list[linkedIndex].lineObj;
    },
    setPageList(state, list) {
      state.pageList.splice(0, state.pageList.length);
      state.pageList = list;
    },
    pageResort(state) {
      state.pageList.forEach((val, idx) => {
        val.orderId = idx + 1;
      })
    },
    upLoading(state, bolean) {
      state.loading = bolean
    },
    resetTemplate(state, val) {
      state.pageList.splice(0, state.pageList.length, val);
      state.s_edcuiCompts = val.pageDetail;
      state.activedPage = val.pageId;
      state.lineObj= val.lineObj;

      //state.s_edcuiCompts = JSON.parse(JSON.stringify(state.templateData));
    },
    setExportDialog(state, value) {
      state.exportDialog = value;
    },
    setSmsId(state, id) {
      state.smsId = id;
    },
    setSummarizeDialog(state, value) {
      state.summarizeDialog = value;
    },
    setQueryHistory(state, value) {
      state.QueryHistory = value;
    },
    setListImportDialog(state, value) {
      state.listImportDialog = value;
    },
    setImportField(state, val) {
      state.importField = val;
    },
    setBgColor(state, val) {
      state.bgColor = val
    },
    setActivedPage(state, val) {
      state.activedPage = val;
    },
    setWarningDialog(state, value) {
      state.warningDialog = value;
    },
    upActivedTab(state, value) {
      state.activedTab = value;
    },
    upParamSetDiaVis(state, value) {
      state.paramSetDiaVis = value;
    },
    upLinkStack(state, value) {
      state.linkStack = value;
    },
    setPageTemplateInfo(state, value) {
      state.pageTemplateInfo = value;
    },
    upTemplateShow(state, value) {
      state.templateShow = value;
    }
  },
  actions: {
    //调用大屏设计页面公共样式接口
    queryCommonStyle({
                       state,
                       commit,
                       rootState
                     }, param) {
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/comp/queryCommonStyle',
        method: 'post',
        data: param
      })
    },
    setActivedCompt({ state, commit, rootState }, value) {
      commit('setActivedCompt', value);
    },
    upComptNum({
                 state,
                 commit,
                 rootState
               }, type) {
      commit('upComptNum', type);
    },
    upComptDatasetName({
                         state,
                         commit,
                         rootState
                       }, name) {
      commit('upComptDatasetName', name);
    },
    upActivedId({
                  commit
                }, id) {
      commit('upActivedId', id);
    },
    getEdcuiCompts({
                     commit
                   }) {
      commit('getEdcuiCompts')
    },
    queryPageCompts({
                      state,
                      commit,
                      rootState
                    }, param) {
      // return axios.post(rootState.renderEngine + '/queryPageDetailsById', param)
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/queryPageDetailsById',
        method: 'post',
        data: param
      })
    },
    addOptlog({
                state,
                commit,
                rootState
              }, param) { //保存操作日志
      // return axios.post(rootState.renderEngine + '/optlog/addOptlog', param)
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/optlog/addOptlog',
        method: 'post',
        data: param
      })
    },
    addCollect({
                 state,
                 commit,
                 rootState
               }, param) { //添加收藏
      // return axios.post(rootState.renderEngine + '/collect/addCollect', param)
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/collect/addCollect',
        method: 'post',
        data: param
      })
    },
    delCollect({
                 state,
                 commit,
                 rootState
               }, param) { //取消收藏
      // return axios.post(rootState.renderEngine + '/collect/delCollect', param)
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/collect/delCollect',
        method: 'post',
        data: param
      })
    },
    upLoading({
                state,
                commit
              }, bolean) {
      commit('upLoading', bolean)
    },
    setExportDialog({
                      state,
                      commit
                    }, value) {
      commit('setExportDialog', value)
    },
    sendSms({
              state,
              commit,
              rootState
            }, param) {
      // return axios.post(rootState.renderEngine + '/export/sendSms', param)
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/export/sendSms',
        method: 'post',
        data: param
      })
    },
    setSmsId({
               state,
               commit
             }, id) {
      commit('setSmsId', id)
    },
    checkSms({
               state,
               rootState
             }, param) {
      // return axios.post(rootState.renderEngine + '/export/checkPassWord', param)
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/export/checkPassWord',
        method: 'post',
        data: param
      })
    },
    logout({
             rootState
           }) {
      // return axios.get(rootState.contextUrl + '/dist/logout.do');
      // window.location.href = rootState.contextUrl + '/dist/logout.do';
      return service({
        maskOff: true,
        url: rootState.contextUrl + '/dist/logout.do',
        method: 'get'
      })
    },
    setSummarizeDialog({
                         state,
                         commit
                       }, value) {
      commit('setSummarizeDialog', value);
    },
    setListImportDialog({
                          state,
                          commit
                        }, value) {
      commit('setListImportDialog', value);
    },
    setWarningDialog({
                       state,
                       commit
                     }, value) {
      commit('setWarningDialog', value);
    },
    downloadListTemplate({
                           state,
                           rootState
                         }) {
      /*
        return service({
          maskOff: true,
          method: 'post',
          url: rootState.renderEngine + '/export/downloadListTemplate',
          responseType: 'blob'
        })
        */
      return axios({
        method: 'post',
        url: rootState.renderEngine + '/export/downloadListTemplate',
        responseType: 'blob',
        headers: {
          "X-NG-SessionId": window.sessionStorage.getItem("X-NG-SessionId")
        }
      })
    },
    setQueryHistory({
                      state,
                      commit
                    }, value) {
      commit('setQueryHistory', value);
    },
    checkCreateTablePriv({
                           state,
                           rootState
                         }, param) {
      return service({
        maskOff: true,
        method: 'post',
        url: rootState.renderEngine + '/import/checkCreateTablePriv',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId
        }
      })
    },
    queryImportInfo({
                      state,
                      rootState
                    }, param) {
      // return axios.post(rootState.renderEngine + '/import/queryImportInfo', param);
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/import/queryImportInfo',
        method: 'post',
        data: param
      })
    },
    saveUpdatePageAndDetail({
                              state,
                              rootState
                            }, param) {
      // return axios.post(rootState.renderEngine + '/batchSaveUpdatePageAndDetail', param);
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/batchSaveUpdatePageAndDetail',
        method: 'post',
        data: param
      })
    },
    saveAs4PageDetail({
                        state,
                        rootState
                      }, param) {
      // return axios.post(rootState.renderEngine + '/saveAsAnalysisReport4PageDetail', param);
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/saveAsAnalysisReport4PageDetail',
        method: 'post',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId,
          "X-TenantId": sessionStorage.getItem("tenant_id")
        }
      })
    },
    deletePageAndDetail({
                          state,
                          rootState
                        }, param) {
      // return axios.post(rootState.renderEngine + '/batchDelPageAndDetail', param);
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/batchDelPageAndDetail',
        method: 'post',
        data: param
      })
    },
    queryPageFatherSonDetailList({
                                   state,
                                   rootState
                                 }, param) {
      // return axios.post(rootState.renderEngine + '/list/queryPageFatherSonDetailList', param);
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/list/queryPageFatherSonDetailList',
        method: 'post',
        data: param,
        headers: {
          "X-UserId": sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId || "111",
          "X-TenantId": sessionStorage.getItem("tenant_id")
        }
      })
    },
    qryPageDetailsByVerNo({
      state,
      rootState
    }, param) {
      // return axios.post(rootState.renderEngine + '/list/queryPageFatherSonDetailList', param);
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/version/qryPageDetailsByVerNo',
        method: 'post',
        data: param,
        headers: {
          "X-UserId": sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId || "111",
          "X-TenantId": sessionStorage.getItem("tenant_id")
        }
      })
    },
    queryAfByVerNo({
      state,
      rootState
    }, param) {
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/version/queryAfByVerNo',
        method: 'post',
        data: param,
        headers: {
          "X-UserId": sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId || "111",
          "X-TenantId": sessionStorage.getItem("tenant_id")
        }
      })
    },
    queryBgImageList({ state, rootState }, param) {
      return service({
        maskOff: true,
        method: 'post',
        url: rootState.renderEngine + '/common/queryBgImgInfo',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id")
        }
      })
    },
    uptColIndex({
                  state,
                  getters,
                  rootState
                }) {

      if (['ElDatagrid','CrossTable','VeMap', 'PivotTable'].includes(state.activedCompt.type)) {
        let array
        var arr2 = [];
        if (state.activedCompt.type == 'VeRadar') {
          array = (state.activedCompt.comptData || {}).rows || [];
          for (let j = 0; j < array.length; j++) {
            if (array[j].type != "XXXXCODE") {
              arr2.push(array[j].type)
            }
          }
        } else {
          array = (state.activedCompt.comptData || {}).columns || [];
          for (let j = 1; j < array.length; j++) {
            arr2.push(array[j])
          }
        }

        for (let i = 0; i < arr2.length; i++) {
          if (state.paramVal == arr2[i]) {
            state.colIndex = i;
            break;
          }
        }



        return;
      }

      if (state.activedCompt.comptAttrs.yAxis1Data == undefined && state.activedCompt.comptAttrs.yAxis2Data == undefined && state.activedCompt.comptAttrs.xAxisData == undefined) {
        return;
      }
      let array = state.activedCompt.comptAttrs.yAxis1Data.concat(state.activedCompt.comptAttrs.yAxis2Data || []);
      if (array.length == 0) {
        return;
      }
      var datasetMap = rootState.AnalyReportAttr.datasetMap;
      var result = constructList(array, datasetMap, state.activedCompt.comptAttrs.computedData || []);

      //若有图例维度，从columns获取
      const _legend = state.activedCompt.comptAttrs.xAxisData.filter(item => item.isNewSetting === '_legend')
      if (_legend.length > 0) {
        const columns = state.activedCompt.comptData.columns || []
        columns.some((item, i) => {
          if (item == state.paramVal) {
            state.colIndex = i - 1 // 减去横坐标
            return true
          }
        })
      } else if (result.resultList && result.resultList.length != 0) {
        for (let i = 0; i < result.resultList.length; i++) {
          if (state.activedCompt.type == 'VeRadar') {
            if (result.resultList[i]['col_chs_name'] == state.paramVal) {
              state.colIndex = i;
              break;
            }
          } else {
            if (result.resultList[i]['element_id'] == state.paramVal) {
              state.colIndex = i;
              break;
            }
          }

        }
      }

    },
    setExtend({
                state,
                getters,
                commit,
                dispatch,
                rootState
              }, param) {
      let activedCompt = state.activedCompt;
      let type = activedCompt.type;
      let seriesAttrs = [];
      let layoutAttrs = [];
      if(type === 'VeRing') {
        seriesAttrs = activedCompt.styleAttrs.find((val)=>val.enName === "seriesAttrs").children || [];//但只百分比-1
      }
      if(type === 'VePie' || type === 'VeRosePie') {
         layoutAttrs = activedCompt.styleAttrs.find((val)=>val.enName === "layoutAttrs").children || [];
      }
      //第三方组件，并且key以comptsDev开头
      if(activedCompt && activedCompt.comptAttrs && activedCompt.comptAttrs.isExtComp === "1"
        && param.key.startsWith('comptsDev')){
        dispatch('setComptsDevExtend', param);
        return;
      }
      //公共背景色设置
      if ((param.key === 'commonBackgroundColor' || param.key === 'backgroundColor' || param.key === 'bgColor')&&(type === "HdTitle" || type === "VeTitle"  || type === 'BdTextNote' || type === 'ElDatagrid' || type === 'CrossTable' || type === 'PivotTable' || type === 'VeWordCloud' || type === 'PcKpiBlock' || type === 'HdVerticalLine' || type === 'HdHorizontalLine' || type === 'ElBreadCrumb' || type === 'ElCarousel' || type === 'ElTabs' || type === 'Query' || type === 'VeRing' || type === 'HdTopFive' || type === 'HdHeader' || type === 'HdVerTitle' || type === 'HdTextarea' || type === 'HdIconKpiBlock' || type === 'HdKpiBlock1' || type === 'HdKpiBlock2' || type === 'HdKpiBlock3' || type === 'HdWater' || type === 'ElSwiper' || type === 'HdCorner' || type === 'HdBorderWrap' || type === 'HdTitleShape' || type === 'DvBorder' || type === 'DvDecoration' || type === 'HdIconBlock' || type === 'ElImage' || type === 'HdFlopDevice' || type === 'ComptsDevKpiBlock1' || type === 'HdKpiBlock' || type === 'MobileQuery' || type === 'HdTime' || type === 'VanCollapse')) {
        router.app.$set(state.activedCompt.comptAttrs.extendSetting, param.key, param.val);
      }
      //是否显示第一个字段
      if (['VeCombineChart', 'VeLine', 'VeHistogram', 'VeStackHistogram', 'VePercentStackHistogram', 'VeLineArea', 'VeStackLineArea', 'VePercentStackLineArea', 'VeMap', 'VeBar', 'VeStackBar', 'VeGauge', 'VeAreaMap', 'VeCombineStack', 'VeWaterfall', 'VeBubbleMap', 'VeBmap','VePercentStackBar'].includes(type)) {
      // if (type == "VeCombineChart" || type == "VeLine" || type == "VeHistogram" || type == "VeStackHistogram" || type == "VeLineArea" || type == "VeStackLineArea" || type == "VeMap" || type == "VeBar" || type == "VeStackBar" || type == "VeGauge" || type == "VeAreaMap" || type == "VeRing"|| type =="VeCombineStack") {
        //系列默认选中第一个字段
        dispatch('getStyleAttrIndex', {
          "parantName": "seriesAttrs",
          "childrenName": "comptData"
        });
        state.paramVal = state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].value;
      }
      dispatch('uptColIndex');
      //获取含有坐标轴图形的 xAxisData、yAxisData
      if (type == "VeCombineChart" || type == "VeLine" || type == "VeLineArea" || type == "VeStackLineArea" || type == "VePercentStackLineArea" || type == "VeHistogram"
        || type == "VeStackHistogram" || type == "VePercentStackHistogram" || type == "VeBar" || type == "VeStackBar" || type == "VeCombineStack" || type == "VeWaterfall" || type == "VePercentStackBar") {
        var xAxisData = state.activedCompt.comptAttrs.xAxisData;
        var datasetMap = rootState.AnalyReportAttr.datasetMap;
        var xAxisDataResult = constructList(xAxisData, datasetMap, state.activedCompt.comptAttrs.computedData || []);
      }
      //大屏横标题颜色清空设置默认颜色
      if (type == "HdTitle" && param.key == "fontColor" && param.val == null) {
        param.val = "rgb(255, 255, 255)";
      }
      //边框三清空颜色变成默认渐变色
      if (type == "HdBorderWrap" && param.key == "borderColor" && param.val == null) {
        // param.val = "rgb(255, 255, 255)";\
        state.activedCompt.comptAttrs.extendSetting.setBoderColor = false;
      } else if (type == "HdBorderWrap" && param.key == "borderColor" && param.val != null) {
        state.activedCompt.comptAttrs.extendSetting.setBoderColor = true;
      }
      // param.val = param.val.replace(/\s*/g,"")
      //显示数据标签与标记点
      if (param.key === 'series.index.label.normal.show' || param.key === 'series.index.symbolSize') {
        // 全局显示数据标签，显示标记点
        var len = state.activedCompt.comptData.columns.length;
        len = len - 1;

        // 有图例维度 则按照该字段条数
        if (state.activedCompt.comptAttrs.setting['legendDimColTitle']) {
          len = Object.keys(state.activedCompt.comptData.rows).length
        }
        var init = true;
        for (let i = 0; i < len; i++) {
          let key = 'series.' + i + '.label.normal.show'
          if (param.key == 'series.index.symbolSize') {
            key = 'series.' + i + '.symbolSize'
            if (init) {
              if (param.val == true) {
                param.val = 5;
              } else {
                param.val = 1;
              }
              init = false;
            }

          }
          // state.activedCompt.comptAttrs.extendSetting[key] = param.val
          router.app.$set(state.activedCompt.comptAttrs.extendSetting,key,param.val)
        }
        if (param.key === 'series.index.label.normal.show' && type !== 'VeScatter' && type !== 'Scatter') {//显示数据标签总控制
          //1、页面样式中当前系列的数据标签显示复选框状态要跟着变
          let parantName = 'seriesAttrs'
          if (type === 'VeScatter' || type === 'Scatter') {
            parantName = 'axisAttrs'
          }
          dispatch('getStyleAttrIndex', {
            "parantName": parantName,
            "childrenName": "series.label.normal.show"
          });
          state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].value = param.val;
          //2、遍历每个系列，更改colSetting中数据标签显示的值
          dispatch('getStyleAttrIndex', {
            "parantName": parantName,
            "childrenName": "comptData"
          });
          let options = state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].options;
          options.forEach((item, i) => {
            state.activedCompt.comptAttrs.colSetting[item.value]['series.label.normal.show'] = param.val;
          });
        }
      }
      //柱状圆角
      else if (param.key === 'series.index.itemStyle.normal.barBorderRadius') {
        var leng = state.activedCompt.comptData.columns.length;
        leng = leng - 1;
        for (let i = 0; i < leng; i++) {
          let key = 'series.' + i + '.itemStyle.normal.barBorderRadius'

          state.activedCompt.comptAttrs.extendSetting[key] = param.val
        }
      }
      //是否显示x与y轴
      else if (param.key == 'xAxis.0.axisLabel.formatter' || param.key == 'xAxis.axisLabel.formatter') {
        let temp = param.val
        if(xAxisDataResult && xAxisDataResult.resultList && xAxisDataResult.resultList.length>0 && xAxisDataResult.resultList[0].col_type == "No.") {
          param.val = (value) => {
            return formatNumber(value) + temp;
          }
        } else {
          param.val = '{value}' + temp
        }
        state.activedCompt.comptAttrs.extendSetting[param.key] = param.val
      } else if (param.key == 'yAxis.0.axisLabel.formatter' || param.key == 'yAxis.1.axisLabel.formatter' || param.key == 'yAxis.axisLabel.formatter') {
        let temp = param.val
        param.val = (value) => {
          return formatNumber(value) + temp;
        }
        state.activedCompt.comptAttrs.extendSetting[param.key] = param.val
      } else if (param.key == 'yAxis.0.axisTick' || param.key == 'yAxis.1.axisTick' || param.key == 'xAxis.0.axisTick' || param.key == 'yAxis.axisTick' || param.key == 'xAxis.axisTick') {
        var ob = {
          show: param.val
        }
        param.val = ob
        state.activedCompt.comptAttrs.extendSetting[param.key] = param.val
      } else if (param.key == 'series.index.type' || param.key == 'series.index.itemStyle.normal.color' ||
        param.key == 'series.label.normal.show' || param.key == 'series.index.markPoint' ||
        param.key == 'series.index.name,legend.data.index' || param.key == 'series.index.barWidth' || param.key == 'series.index.name') {
        // 系列转换属性
        let index = state.colIndex
        let key = 'series.' + index + '.type'
        if (["VeCombineChart", "VeLine", "VeLineArea", "VeStackLineArea", "VePercentStackLineArea", "VeHistogram", "VeStackHistogram", "VePercentStackHistogram", "VeBar", "VeStackBar", "VeCombineStack", "VeScatter", "Scatter", 'VeWaterfall', 'VeBubbleMap', 'VePercentStackBar'].includes(type) ) {
          //组合图新版样式设置
          //保存到colsetting
          dispatch('getStyleAttrIndex', {
            "parantName": "seriesAttrs",
            "childrenName": "comptData"
          });
          let elemId = state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].value;

          if (elemId != "") {
            if (!state.activedCompt.comptAttrs.colSetting[elemId]) {
              state.activedCompt.comptAttrs.colSetting[elemId] = {}
            }
            state.activedCompt.comptAttrs.colSetting[elemId][param.key] = param.val
            if ('VeScatter' === type || 'Scatter' === type) {
              let value = state.activedCompt.styleAttrs[3].children[0].value
              value = state.activedCompt.styleAttrs[3].children[0].options.filter(item => {return item.value === value || item.label === value})[0].label
              let labelName = param.val || value

              let ydata = state.activedCompt.comptAttrs.yAxis1Data || []
              let xdata = [...state.activedCompt.comptAttrs.xAxisData, ...ydata]
              xdata.some(val => {
                if (val.element_id == elemId) {
                  if (val.isNewSetting === 'yMeasure') {
                    state.activedCompt.comptAttrs.extendSetting['yAxis.name'] = labelName
                    return true
                  } else if (val.isNewSetting === 'xMeasure') {
                    state.activedCompt.comptAttrs.extendSetting['xAxis.0.name'] = labelName
                    return true
                  }
                }
              })
              let labelMap = state.activedCompt.comptAttrs.setting.labelMap || {}
              labelMap[value] = labelName
              router.app.$set(state.activedCompt.comptAttrs.setting, 'labelMap', labelMap);
              return
            }
          }
        }

        if (param.key == 'series.index.itemStyle.normal.color') { // 图形颜色
          if (type == 'VeRadar') { //雷达图的图形颜色在此处独立设置
            key = 'color';
            state.activedCompt.comptAttrs.extendSetting[key][index] = param.val; //颜色赋值
            var selectedCol = state.activedCompt.styleAttrs[2].children[0].value
            state.activedCompt.comptAttrs.colSetting[selectedCol]['series.index.itemStyle.normal.color'] = param.val;
          } else if (type === 'VeWaterfall') {
            // 瀑布图
            state.activedCompt.comptAttrs.extendSetting['series.1.itemStyle.normal.color'] = param.val;
          } else {
            key = 'series.' + index + '.itemStyle.normal.color';
            state.activedCompt.comptAttrs.isSetColor['series.' + index + '.itemStyle.normal.color'] = true;
          }
        } else if (param.key == 'series.label.normal.show') { // 显示图标数据标签
          key = 'series.' + index + '.label.normal.show'
          if (type == "VeRadar") {
            state.activedCompt.comptAttrs.setting['label'] = eval("({'show':" + param.val + "})");
            return;
          } else if (type === 'VeWaterfall') {
            // 瀑布图
            state.activedCompt.comptAttrs.extendSetting['series.1.label.normal.show'] = param.val;
          } else {
            //1、遍历每个系列，判断是否所有系列都不展示数据标签
            dispatch('getStyleAttrIndex', {
              "parantName": "seriesAttrs",
              "childrenName": "comptData"
            });
            let options = state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].options;
            let isShow = false;
            options.forEach((item, i) => {
              if (state.activedCompt.comptAttrs.colSetting[item.value]['series.label.normal.show']) {
                isShow = true;
              }
            });

            //2、页面样式中总控制数据标签显示复选框状态要跟着变
            dispatch('getStyleAttrIndex', {
              "parantName": "layoutAttrs",
              "childrenName": "series.index.label.normal.show"
            });
            state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].value = isShow;

          }
        } else if (param.key == 'series.index.markPoint') { // 显示最值
          key = 'series.' + index + '.markPoint'
          if (['VeAreaMap', 'VeLines', 'VeBubbleMap'].includes(type)) {
            if (param.val) {
              //设置地图最大值
              dispatch('setAreaMapMaxData');
            } else {
              state.activedCompt.comptAttrs.extendSetting.series[1].data = [];
            }

          } else {
            if (param.val) {
              var obj = {
                data: [{
                  type: 'max',
                  name: '最大值'
                }, {
                  type: 'min',
                  name: '最小值'
                }]
              }
              param.val = obj
            }
          }
        } else if (param.key == 'series.index.name,legend.data.index') {
          // 别名
          if (type == "VeMap") {
            key = '';
            if (param.val != "") {
              router.app.$set(state.activedCompt.comptAttrs.setting.labelMap, state.paramVal, param.val);
            } else {
              router.app.$delete(state.activedCompt.comptAttrs.setting.labelMap, state.paramVal);
            }
          } else if (['VeAreaMap', 'VeBubbleMap'].includes(type)) {
            //scatter设置name
            key = '';
            if (param.val != "") {
              state.activedCompt.comptAttrs.extendSetting.series[0].name = param.val;
              state.activedCompt.comptAttrs.extendSetting.legend.data[0]["name"] = param.val;
            } else {
              state.activedCompt.comptAttrs.extendSetting.series[0].name = state.paramVal || (state.activedCompt.comptData.columns || [])[1];
              state.activedCompt.comptAttrs.extendSetting.legend.data[0]["name"] = state.paramVal || (state.activedCompt.comptData.columns || [])[1];
            }
          } else if (type == "VeGauge") {
            key = '';
            let labelMap = state.activedCompt.comptAttrs.setting['labelMap'] || {};
            if (param.val == "") { //如果是别名为空则用字段自己的名称
              param.val = state.paramVal;
            }
            labelMap[state.paramVal] = param.val;
            state.activedCompt.comptAttrs.setting['labelMap'] = labelMap;
            state.activedCompt.comptAttrs.extendSetting['series.0.data.0.name'] = param.val; //仪表盘图例的名称
          } else if (type === 'VeWaterfall') {
            key = '';
            state.activedCompt.comptAttrs.extendSetting["series.0.name"] = '';
            // state.activedCompt.comptAttrs.extendSetting["legend.data.0"] = '';
            state.activedCompt.comptAttrs.extendSetting["series.1.name"] = param.val;
            // state.activedCompt.comptAttrs.extendSetting["legend.data.1"] = param.val;
          } else {
            //let key2 = 'legend.data.index'
            key = 'series.' + index + '.name'
            param.val = param.val.replace(/\s*/g, "");
            let key2 = 'legend.data.' + index + ''
            if (param.val != '') {
              router.app.$set(state.activedCompt.comptAttrs.extendSetting, key2, param.val);
              // state.activedCompt.comptAttrs.extendSetting[key2] = param.val;
            } else {
              let indx = state.colIndex + 1;
              param.val = state.activedCompt.comptData.columns[indx]
              router.app.$delete(state.activedCompt.comptAttrs.extendSetting, key2);
              // state.activedCompt.comptAttrs.extendSetting[key2] = param.val
            }
            if (['VeBmap', 'VeLinesBmap', 'VeHeatBmap'].includes(state.activedCompt.type)) {
              state.activedCompt.comptAttrs.extendSetting.title.text = param.val;
            }
          }
        } else if (param.key == 'series.index.barWidth') { // 柱子宽度
          key = 'series.' + index + '.barWidth';
          if (type === 'VeWaterfall') {
            key = 'series.1.barWidth';
          }
        }

        if (param.key != '' && key != '') {
          if (type == 'VeRadar' && param.key == 'series.index.itemStyle.normal.color') { // 雷达图在此处设置图形颜色
            let colorArray = state.activedCompt.comptAttrs.extendSetting[key];
            state.activedCompt.comptAttrs.extendSetting[key] = colorArray;
          } else {
            state.activedCompt.comptAttrs.extendSetting[key] = param.val;
            /* 组合图且有图例 */
            if (type === 'VeCombineChart') {
              const _legend = state.activedCompt.comptAttrs.xAxisData.filter(item => item.isNewSetting === '_legend')
              if (_legend.length > 0 && param.key === 'series.index.type') {
                const columns = state.activedCompt.comptData.columns || []
                columns.forEach((item, i) => {
                  const lastName = state.paramVal.split('-').reverse()[0]
                  const lastIndex = item.indexOf(lastName)
                  if (lastIndex > 0) {
                    let key = 'series.' + (i- 1) + '.type'
                    state.activedCompt.comptAttrs.extendSetting[key] = param.val;
                    state.activedCompt.comptAttrs.colSetting[item][param.key] = param.val
                    return true
                  }
                })
              }
            }
          }
        }
      }else if (param.key === 'ringLineWidth' && (type === 'VePie' || type === 'VeRosePie')) {
            let seriesRadius,tagList = {};
            // if(layoutAttrs.length > 0) {
              seriesRadius = layoutAttrs.find((val)=>val.enName === "series.0.radius") || {};
              tagList = layoutAttrs.find((val)=>val.enName === "tagList") || {};
            // }
            // if (seriesRadius !== undefined){
              if(seriesRadius.photoType === 'ring') {
                //权重：0-9
                let multiplier = parseInt(param.val);
                //得到内半径的占比--对数据进行转换形成新的内半径
                let newOutSIZE = state.activedCompt.comptAttrs.extendSetting['series.0.radius'][1];
                //得到基数---总是外半径的一半拿去乘权重
                let num = parseInt(newOutSIZE.split('%')[0])/2;

                let result = num + (num/10).toFixed(2)*(10-multiplier);
                result = result + '%'
                state.activedCompt.comptAttrs.extendSetting['series.0.radius'][0] = result
                if(tagList.value === true) {
                  dispatch('modifyLegendFomatter',state.activedCompt);
                }
              }
            // }
      }
       else if (param.key == 'ratio') { //饼图，图形大小和图形类型联动
        let radiusKey = 'series.0.radius';
        let boreSize = "50%";
        let outSize = "100%";
        if (type === 'VePie' || type === 'VeRosePie') {
          //值得注意
          let seriesRadius = layoutAttrs.find((val)=>val.enName === "series.0.radius") || {};
          let ringLineWidth = layoutAttrs.find((val)=>val.enName === "ringLineWidth");
          if(seriesRadius.photoType === 'pie') {
            boreSize = (type == "VePie" || type === 'VeRosePie' ? 0 : 100) * param.val + "%";
            outSize = 100 * param.val + "%";
            if (state.activedCompt.comptAttrs.extendSetting[radiusKey][0] == "0%") {
              boreSize = "0%";
            }
          }
          if(seriesRadius.photoType === 'ring') {
            let multiplier = 0
            if(ringLineWidth) {
              multiplier = parseInt(ringLineWidth.value);
            }
            outSize =  param.val * 100 + "%";
            let num = parseInt(outSize.split('%')[0])/2;
            let result = num + (num/10).toFixed(2)*(10 - multiplier);
            boreSize = result + '%';
          }
        } else if (type === "VeRing") {
          if(rootState.HomeBody.pageCache.classTypeId == "1005"){
            //改变图形大小时带上权重
              let ratio,SeriesRadius = {};
              if(seriesAttrs.length > 0){
                ratio = seriesAttrs.find((val)=>val.enName === "ratio");
                SeriesRadius = seriesAttrs.find((val)=>val.enName === "series.0.radius") || {};
              }
              let ringSize;
              let weight;
              if(ratio) {
                ringSize = ratio.value;
              }
              if(SeriesRadius.value) {
                weight = parseInt(eval(SeriesRadius.value)[0]);
              }
              if(SeriesRadius.value === '1'){
                weight = 80;
              }
              outSize = ringSize * 100 + '%';
              boreSize = ringSize * 50 + (ringSize * 10 * weight/20) + '%';
          }
        }
        let radiusObj = [boreSize, outSize]
        state.activedCompt.comptAttrs.extendSetting[radiusKey] = radiusObj;
        state.activedCompt.comptAttrs[param.key] = param.val;

        if(activedCompt.type === 'VeDoughnutPie') {//设置圆环图大小
          let dataLength = state.activedCompt.comptData.rows.length;
          let ratio = param.val*100;
            for(let i=0; i<dataLength; i++){
              router.app.$set(state.activedCompt.comptAttrs.extendSetting,'series.'+i+'.radius',[ratio - ratio / dataLength * i + '%', ratio - ratio / dataLength / 2 * ( i*2 + 1 ) + '%']);
            }
        }

        if(type === 'VePie' || type === 'VeRosePie' || type === 'VeDoughnutPie') {
          let taglist = layoutAttrs.find((val)=>val.enName === "tagList") || {};
          if(taglist.value === true) {
            dispatch('modifyLegendFomatter',state.activedCompt);
          }
        }
      } else if (param.key == 'series.0.radius') { //饼图，图形大小和图形类型联动
        let ratio = state.activedCompt.comptAttrs['ratio'];
        let boreSize = "30%";
        let outSize = "60%";
        //仅仅知识饼图而非环形图
        if (type === 'VePie' || type === 'VeRosePie') {
          let seriesRadius = layoutAttrs.find((val)=>val.enName === "series.0.radius") || {};
          let ringLineWidth = layoutAttrs.find((val)=>val.enName === "ringLineWidth");
          if(seriesRadius.photoType === 'pie') {
            //那改变图形类型切回饼图是否需要加上其他参数
            boreSize = "0%";
            // boreSize = (type == "VePie" || 'VeRosePie' ? 50 : 20) * ratio + "%";
            outSize = 100 * ratio + "%";
            if(param.val[0] == "0%"){
              boreSize = "0%";
            }
          }
          if(seriesRadius.photoType === 'ring') {
            state.activedCompt.comptAttrs['radius'] = param.val;
            let multiplier = 0
            if(ringLineWidth) {
              multiplier = parseInt(ringLineWidth.value);
            }
            let result = parseInt(100 * ratio)/20 * (10 - multiplier);
            boreSize = result + parseInt(100 * ratio)/2 + "%";
            outSize = 100 * ratio + "%";
          }
        } else if (type == "VeRing") {
          if(rootState.HomeBody.pageCache.classTypeId == "1005") {
              //此时是修改环形图的环线条宽度
              //1-5即0-4 5对应0，1对应4
            let ratio = seriesAttrs.find((val)=>val.enName === "ratio");
            let SeriesRadius = seriesAttrs.find((val)=>val.enName === "series.0.radius") || {};
            let ringSize;
            let weight;
              if(ratio) {
                ringSize = ratio.value;
              }
              if(SeriesRadius.value) {
                weight = parseInt(eval(SeriesRadius.value)[0]);
              }
              if(SeriesRadius.value === '1'){
                weight = 80;
              }
              outSize = ringSize * 100 + '%';
              boreSize = ringSize * 50 + ringSize * weight * 0.5 + '%';
          }
        }
        let radiusObj = [boreSize, outSize]
        state.activedCompt.comptAttrs.extendSetting[param.key] = radiusObj;
        if(type === 'VePie' || type === 'VeRosePie' || type === 'VeDoughnutPie') {
          let taglist = layoutAttrs.find((val)=>val.enName === "tagList") || {};
          if(taglist.value === true) {
            dispatch('modifyLegendFomatter',state.activedCompt);
          }
        }
      } else if (param.key == 'decimalDigit') { //小数点，与标签数据和悬浮显示联动
        if (type == "VeMap") {
          dispatch('setMapSeriesData', param);
          let key = 'series.' + state.colIndex + '.decimalDigit';
          state.activedCompt.comptAttrs.extendSetting[key] = param.val;
        } else if (['VeAreaMap'].includes(type)) {
          state.activedCompt.comptAttrs.isResetSeriesData++;
        } else if (type == "VeGauge") {
          state.activedCompt.comptAttrs[param.key] = param.val;
          dispatch('initLableFormatter');
        } else if (type == "VePie" || type == "VeRosePie") {
          //是否要加上环形图
          state.activedCompt.comptAttrs[param.key] = param.val;
          let val = "{formatter:function(data){return data.name + ' , ' + parseFloat(data.value).toFixed(" + parseInt(param.val) + ") +'('+parseFloat(data.percent).toFixed(" + parseInt(param.val) + ")+'%'+')';}}"
          state.activedCompt.comptAttrs.extendSetting['tooltip'] = eval("(" + val + ")");

          let labVal = state.activedCompt.comptAttrs['labelFunc'].replace(/decimal/g, state.activedCompt.comptAttrs['decimalDigit']);
          state.activedCompt.comptAttrs.extendSetting['series.0.label'] = eval("(" + labVal + ")");
          //当标签列表选中时才有必要修改图例的百分比保留几位小数
          if(type === 'VePie' || type === 'VeRosePie') {
            let taglist = layoutAttrs.find((val)=>val.enName === "tagList") || {};
            if(taglist.value === true) {
              dispatch('modifyLegendFomatter',state.activedCompt);
            }
          }
        } else if(type == "VeDoughnutPie") {
          //是否要加上环形图
          state.activedCompt.comptAttrs[param.key] = param.val;
          let val = "function(data){return data.name + ' , ' + parseFloat(data.value).toFixed(" + parseInt(param.val) + ") +'('+parseFloat(data.percent).toFixed(" + parseInt(param.val) + ")+'%'+')';}"
          state.activedCompt.comptAttrs.extendSetting.tooltip.formatter = eval("(" + val + ")");
          let labVal = state.activedCompt.comptAttrs['labelFunc'].replace(/decimal/g, state.activedCompt.comptAttrs['decimalDigit']);
          state.activedCompt.comptAttrs.extendSetting.series.label.formatter = eval("(" + labVal + ")");
          //当标签列表选中时才有必要修改图例的百分比保留几位小数
          let taglist = layoutAttrs.find((val)=>val.enName === "tagList") || {};
          if(taglist.value === true) {
            dispatch('modifyLegendFomatter',state.activedCompt);
          }
        }
      } else if (param.key == 'unit') { //仪表盘设置单位
        state.activedCompt.comptAttrs[param.key] = param.val;
        dispatch('initLableFormatter');
      } else if (param.key == 'series.0.label') { //标签样式，与小数点联动
        state.activedCompt.comptAttrs['labelFunc'] = param.val;
        let val = '';
        if (state.activedCompt.type === "VeSankey") {
          val = param.val;
        } else {
          val = param.val.replace(/decimal/g, state.activedCompt.comptAttrs['decimalDigit']);
        }
        state.activedCompt.comptAttrs.extendSetting[param.key] = eval("(" + val + ")");
        router.app.$set(state.activedCompt.comptAttrs.extendSetting,"series.0.labelLine.show",true);
        if(state.activedCompt.comptAttrs.extendSetting[param.key].formatter === '') {
          router.app.$set(state.activedCompt.comptAttrs.extendSetting,"series.0.labelLine.show",false);
        }
      } else if (param.key == 'series.label') { //标签样式，与小数点联动
        state.activedCompt.comptAttrs['labelFunc'] = param.val;
        let val = param.val.replace(/decimal/g, state.activedCompt.comptAttrs['decimalDigit']);
        router.app.$set(state.activedCompt.comptAttrs.extendSetting.series.label,"formatter",eval("(" + val + ")"));
        router.app.$set(state.activedCompt.comptAttrs.extendSetting.series.labelLine,"show",true);
        if(state.activedCompt.comptAttrs.extendSetting.series.label.formatter === '') {
          router.app.$set(state.activedCompt.comptAttrs.extendSetting.series.labelLine,"show",false);
        }
      } else if (param.key == 'legend.type') {
        let typeVal = "";
        if (!param.val) {
          typeVal = "scroll";
        }
        state.activedCompt.comptAttrs.extendSetting[param.key] = typeVal;
      } else if (param.key == 'series.index.name.normal.show' || param.key == "series.index.number.format" || param.key == "series.index.label.normal.map.show") { //地名，数据显示格式设置,地图数据标签
        if (['VeAreaMap', 'VeBubbleMap'].includes(type))
          state.activedCompt.comptAttrs.isResetSeriesData++;
        if (param.key == 'series.index.name.normal.show') {
          if (type == "VeMap"){
            dispatch('batchSetMapSeriesData');
          } else if(type === "VeLines"){
            router.app.$set(state.activedCompt.comptAttrs.extendSetting.series[0].label.normal,"show",param.val);
          }
        } else if (param.key == "series.index.label.normal.map.show") { //地图数据标签
          //小数点位数
          dispatch('getStyleAttrIndex', {
            "parantName": "seriesAttrs",
            "childrenName": "decimalDigit"
          });
          let numCount = state.styleAttrsIndex;
          //数据标签
          dispatch('getStyleAttrIndex', {
            "parantName": "seriesAttrs",
            "childrenName": "series.index.label.normal.map.show"
          });
          let dataLabel = state.styleAttrsIndex;
          //数据显示格式
          dispatch("getStyleAttrIndex", {
            "parantName": "seriesAttrs",
            "childrenName": "series.index.number.format"
          });
          state.activedCompt.styleAttrs[dataLabel[0]].children[dataLabel[1]].value = param.val;
          state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]]['isShow'] = param.val;
          state.activedCompt.styleAttrs[numCount[0]].children[numCount[1]]['isShow'] = param.val;
          let key = 'series.' + state.colIndex + '.label.normal.map.show';
          state.activedCompt.comptAttrs.extendSetting[key] = param.val;
        } else if (param.key == "series.index.number.format") {
          let key = 'series.' + state.colIndex + '.number.format';
          state.activedCompt.comptAttrs.extendSetting[key] = JSON.stringify(param.val).replace(/"/g, "'");
        }
        if (type == "VeMap" && param.key != 'series.index.name.normal.show') dispatch('setMapSeriesData', param);
      } else if (param.key == 'series.index.area.normal.show') { //显示面积
        if (param.val) {
          let itemStyleVal = "{normal: {areaStyle: {type: 'default'}}}";
          state.activedCompt.comptAttrs.setting['itemStyle'] = eval("(" + itemStyleVal + ")");
        } else {
          state.activedCompt.comptAttrs.setting['itemStyle'] = "";
        }
      } else if (param.key == 'series.0.axisTick.show,series.0.splitLine.show') {
        state.activedCompt.comptAttrs.extendSetting['series.0.axisTick.show'] = param.val;
        state.activedCompt.comptAttrs.extendSetting['series.0.splitLine.show'] = param.val;
      } else if (param.key == 'ringColor') {//比率环形图环的颜色
        param.val = param.val == null ? "#dadc38" : param.val;//如果颜色清空则设置成默认颜色
        state.activedCompt.comptAttrs.extendSetting['color'][0] = param.val;
      } else if (param.key == 'series.0.data.0.label.normal.color') {//比率环形图中心数值颜色
        param.val = param.val == null ? "#fff" : param.val;//如果颜色清空则设置成默认颜色
        state.activedCompt.comptAttrs.extendSetting[param.key] = param.val
      } else if (param.key == 'anotherName.text') {//比率环形图环文字设置
        param.val = param.val == "" ? state.paramVal : param.val;//如果清空则用字段名称
        state.activedCompt.comptAttrs.extendSetting[param.key] = param.val
      } else if (param.key == "title.subtext" && ["VeAreaMap","VeLines", 'VeBubbleMap'].includes(type)) {//地图备注
        state.activedCompt.comptAttrs.extendSetting.title['subtext'] = param.val;
      } else if (param.key == "isLinearGradient"){
        state.activedCompt.comptAttrs.isLinearGradient = param.val;
        state.activedCompt.comptAttrs.extendSetting['series.0.axisLabel.color'] = param.val ? state.activedCompt.comptAttrs.linearAxisLabelColor : "auto";
      } else if (param.key == "axis.index.name") { // 显示轴标题（x与y）
        if (param.val) {
          let xTitle = state.activedCompt.comptData.columns[0]
          let yTitle = state.activedCompt.comptData.columns[1]
          const values = Object.values(state.activedCompt.comptAttrs.colSetting)
          let i = 0
          values.some(val => {
            if (val.comptData === xTitle) {
              i++
              xTitle = val['series.index.name'] || xTitle
            } else {
              if (val.comptData === yTitle) {
                i++
                yTitle = val['series.index.name'] || yTitle
              }
            }
            return i === 2
          })
          state.activedCompt.comptAttrs.extendSetting['xAxis.0.name'] = xTitle
          state.activedCompt.comptAttrs.extendSetting['yAxis.name'] = yTitle
        } else {
          state.activedCompt.comptAttrs.extendSetting['xAxis.0.name'] = ''
          state.activedCompt.comptAttrs.extendSetting['yAxis.name'] = ''
        }
      } else if(["effect.symbol", "effect.symbolSize", "effect.period", "lineStyle.normal.type", "areaColor", "borderColor", "label.normal.color", "show.top"].includes(param.key)){//迁徙图lines样式处理
        if(param.key === "show.top"){//迁徙图top5
          dispatch("setTopValueLines",param)
        } else {
          dispatch("batchSetLinesStyle",param);
        }
      }else if (param.key === 'commonTitleFontSize') {
        param.val = param.val == "" ? "16" : param.val;//大屏字体大小默认16
        router.app.$set(state.activedCompt.comptAttrs.extendSetting,param.key,param.val);
      }else if (param.key === 'commonTitleColor') {
        //大屏字体颜色
        router.app.$set(state.activedCompt.comptAttrs.extendSetting,param.key,param.val);
      } else {
        state.activedCompt.comptAttrs.extendSetting[param.key] = param.val;
        if(param.key === 'commonWidth') { //大屏公共属性宽度和高度
          state.activedCompt.blockInfo.w = param.val;
          windowResize()
        } else if(param.key === 'commonHeight') {
          state.activedCompt.blockInfo.h = param.val;
          windowResize()
        }
      }

      if (type == "VeCombineChart" || type == "VeLine" || type == "VeHistogram" || type == "VeStackHistogram" || type == "VePercentStackHistogram" || type == "VeLineArea" || type == "VeStackLineArea" || type == "VePercentStackLineArea" || type == "VeMap" || type == "VeBar" || type == "VeStackBar" || type == "VeAreaMap" || type == "VeRadar" || type == "VeGauge" || type == "VeRing"|| type =="VeCombineStack" || type == 'VeBubbleMap' || type == 'VePercentStackBar') {
        let oriVal = state.activedCompt.comptAttrs.extendSetting["backgroundColor"];
        state.activedCompt.comptAttrs.extendSetting["backgroundColor"] = "transparent";
        if (param.key == 'series.index.itemStyle.normal.color' && state.activedCompt.comptAttrs.warnData.length > 0) { //改图形颜色，要对应的改下该图形的warndata,触发它更新颜色色值
          // let oriWarnName = state.activedCompt.comptAttrs.warnData[0].name;
          let oriWarnData = objDeepCopy(state.activedCompt.comptAttrs.warnData);
          state.activedCompt.comptAttrs.warnData.splice(0, oriWarnData.length);
          state.activedCompt.comptAttrs.warnData = oriWarnData;
          // state.activedCompt.comptAttrs.warnData[0].name = "";
          // console.info(oriWarnName);
          // state.activedCompt.comptAttrs.warnData[0].name = oriWarnName;
        }
        state.activedCompt.comptAttrs.extendSetting["backgroundColor"] = oriVal;
      }
    },
    upComDevSeriesData({
                         dispatch,
                         state
                       }, param){
      let array = state.activedCompt.comptAttrs.yAxis1Data.concat(state.activedCompt.comptAttrs.yAxis2Data || []);
      for(let idx=0;idx<array.length;idx++){
        if(param.val === array[idx].element_id){
          state.colIndex = idx;
          break;
        }
      }
      dispatch('getStyleAttrIndex', {
        "parantName": param.parentEnname,
        "childrenName": param.key
      });
      let seriesAttrs;
      let styleAttrs = state.activedCompt.styleAttrs || [];
      styleAttrs.forEach(data => {
        if (data.enName == param.parentEnname) {
          seriesAttrs = data.children;
        }
      });
      //从当前属性的下一个属性开始遍历，只更新当前样式以下属性
      for(let i=0; i<seriesAttrs.length; i++){
        let enName = seriesAttrs[i].enName || "";
        if(enName.includes("series.index")){
          let seriesName = enName.substring(enName.indexOf("series.index")+12);
          state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[i].value =
            state.activedCompt.comptAttrs.extendSetting['series.' + state.colIndex + seriesName] ||  state.activedCompt.comptAttrs.extendSetting[seriesName.substring(1)];
        }
      }
    },
    setComptsDevExtend({
                         state
                       }, param){
      let key = param.key;
      if(key.includes("series.index")){//系列
        // 系列转换属性
        let index = state.colIndex;
        key = 'series.' + index + key.substring(key.indexOf("series.index")+12);
        router.app.$set(state.activedCompt.comptAttrs.extendSetting,key,param.val);
      } else {
        key = key.substring('comptsDev.'.length);
        state.activedCompt.comptAttrs.extendSetting[key] = param.val;
      }
    },
    initSymbolSize({
                     state,
                     getters
                   }) {
      var array = state.activedCompt.comptData.columns;
      var type = state.activedCompt.type;
      if (type == "VeCombineChart" || type == "VeLine"|| type =="VeCombineStack") {
        state.activedCompt.styleAttrs[4].children[0].options = [];
      } else if (type == "VeHistogram" || type == "VeBar" || type == "VeStackBar") { //条形图、柱状图将标记点设置为空
        state.activedCompt.styleAttrs[3].children[0].options = [];
      }
      if (type != "VeRadar") {
        for (var i = 1; i < array.length; i++) {
          var ind = i - 1;
          state.activedCompt.comptAttrs.extendSetting['series.' + ind + '.symbolSize'] = 1;
        }
      }
    },
    isExist({
              state,
              getters
            }, param) {
      var len = state.activedCompt.comptData.columns.length;
      len = len - 1;
      state.isExistFlag = false;
      for (var i = 0; i < len; i++) {
        var name = state.activedCompt.comptAttrs.extendSetting['series.' + i + '.name'];
        if (param == name) {
          state.isExistFlag = true;
          //return true;
        }
      }
      //return false;
    },
    setJsonData({
                  rootState,
                  state,
                  getters,
                  dispatch
                }) {
      //系列
      var idxParam = {
        "parantName": "seriesAttrs",
        "childrenName": "comptData"
      };
      dispatch('getStyleAttrIndex', idxParam);
      if (state.activedCompt.type == "ProgressBar" && state.activedCompt.styleAttrs[2]) {
        let children1 = state.activedCompt.styleAttrs[2].children || [];
        // 目标度量需要展示该数据集的所有度量字段
        const attr1Index = children1.findIndex(attrItem => attrItem.enName === 'dynamicElementId');
        const datasetMap1 = rootState.AnalyReportAttr.datasetMap;
        if(attr1Index >  -1) {
          children1[attr1Index].options = (datasetMap1[state.activedCompt.afId] || []).filter(field1 => field1.element_type === '2').map(field1 => {
            return {
              label: field1.element_name,
              value: field1.element_id
            }
          });
        }
      }
      let wdColData = {}
      if (state.activedCompt.comptData && state.activedCompt.comptData.columns) {
        var array = state.activedCompt.comptData.columns;
        state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].options = [];
        if (['ElDatagrid', 'CrossTable'].includes(state.activedCompt.type)) {
          array = array.filter(item => {
            return item.label.indexOf("XXXXCODE_") < 0;
          })
        }
        if ('PivotTable' === state.activedCompt.type) { // 透视表所有维度字段都要带回来
          const pivoTabCpAttr = state.activedCompt.comptAttrs;
          array = (pivoTabCpAttr.xAxisData.length > 0 ? [pivoTabCpAttr.xAxisData[0]]: []).concat(pivoTabCpAttr.yAxis1Data);
          array = constructList(array, rootState.AnalyReportAttr.datasetMap, state.activedCompt.comptAttrs.computedData || []).resultList || [];
        }
        for (var i = 1; i < array.length; i++) {
          var obj = {
            'label': array[i],
            'value': array[i]
          }

          if (['ElDatagrid', 'CrossTable', 'PivotTable'].includes(state.activedCompt.type)) {
            obj = {
              "label": array[i].element_name || array[i].nick_name || array[i].label,
              "value": array[i].element_id
            };
            obj = {
              ...array[i],
              ...obj
            };
            wdColData[array[i].element_id] = i
          }

          state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].options.push(obj);
          // //赋值预警字段
          // var obj2 = {
          //     'label': array[i],
          //     'value': i - 1
          // }
          // state.s_edcuiCompts[idx].comptAttrs.warnCol.push(obj2);
          if (state.activedCompt.type === 'ElSwiper') {//清单轮播 下拉
            let swiperXYData = state.activedCompt.comptAttrs.xAxisData.concat(state.activedCompt.comptAttrs.yAxis1Data);
            let swiperOptions = [];
            for (let index = 0; index < swiperXYData.length; index++) {
              const swiElement = swiperXYData[index];
              swiperOptions.push({
                'label': array[index],
                'value': swiElement.element_id
              });
            }
            state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].options = swiperOptions;
          }
        }

        if (['VeScatter','Scatter', 'ProgressBar'].includes(state.activedCompt.type) && array.length > 0) { // columns 都是度量， 第一个也要。。
          const attrs = state.activedCompt.comptAttrs
          let XYData = [...attrs.yAxis1Data]
          let options = []
          let styleArr = state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]]
          let flag = false
          let obj = {}
          for ( let item of XYData) {
            flag = styleArr.value === item.element_id || flag
            let temp = {
              'label': item.nick_name,
              'value': item.element_id
            }
            obj[item.element_id] ? '' : obj[item.element_id] = true && options.push(temp)
          }
          state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].options = options
          if (styleArr.value === '' || !flag) {
            state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].value = options[0].value
            state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]+1].value = ''
          }
        }
        if (['CrossTable'].includes(state.activedCompt.type) && (array || []).length > 0) {
          wdColData[array[0].element_id] = 0
          let array1 = [...array]
          let len = array1.length
          let newArr = []
          let allData = [
            ...state.activedCompt.comptAttrs.xAxisData,
            ...state.activedCompt.comptAttrs.yAxis1Data
          ]
          let index1 = -1
          let attrs = state.activedCompt.styleAttrs[3].children || []
          let valFlag = false
          let flag = attrs.some((atts,index) => {
            index1 = index
            return atts.enName === "subTotalCol"
          })
          if (flag) {
            allData.some(item => {
              if (wdColData[item.element_id] !== undefined) { //  && !item.isNewCol
                let temp = array1[wdColData[item.element_id]]
                if (temp.element_type == 1) {
                  temp.value = temp.label // item.element_id
                  newArr.push(temp)
                  valFlag = valFlag || attrs[index1].value === temp.value
                }
                --len
              }
              return len === 0
            })
            try {
              attrs[index1].options = newArr
              if (!attrs[index1].value) {
                attrs[index1].value = newArr[0].value
              } else if (newArr.length === 0 || !valFlag) {
                attrs[index1].value = ''
              }
            } catch (e) {}
          }
        }

        if (['ElDatagrid', 'CrossTable', 'PivotTable'].includes(state.activedCompt.type) && (array || []).length > 0) {
          let firItem = {
            "label": array[0].element_name || array[0].nick_name || array[0].label,
            "value": array[0].element_id
          };
          firItem = {
            ...array[0],
            ...firItem
          };
          let children = state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children;
          children[state.styleAttrsIndex[1]].options.unshift(firItem);
          // 默认选中第一列
          children[state.styleAttrsIndex[1]].value = firItem.value;
          let curColSetting = state.activedCompt.comptAttrs.colSetting[firItem.value];
          // 如果没改过别名，输入框为空
          if (curColSetting.nick_name != firItem.label) {
            children[1].value = curColSetting.nick_name;
          } else {
            children[1].value = "";
          }

          if (curColSetting.setCondi === false && ['CrossTable', 'PivotTable'].includes(state.activedCompt.type)) {
            curColSetting.setCondi = 'default'
          }
          children[2].value = curColSetting.align;
          children[3].value = (curColSetting.numType || "0") + "";
          children[4].value = (curColSetting.dot || "0") + "";
          children[5].value = curColSetting.setCondi;
          if (children[10]) {
            children[10].value = curColSetting.fixed ? true : false;
          }     
          if (curColSetting.colCondiExp.length >= 2) {
            children[6].inputValue = curColSetting.colCondiExp[0].num;
            children[7].value = curColSetting.colCondiExp[0].iconColor;
            children[8].inputValue = curColSetting.colCondiExp[1].num;
            children[9].value = curColSetting.colCondiExp[1].iconColor;
          } else {
            children[6].inputValue = "";
            children[7].value = "#F56C6C";
            children[8].inputValue = "";
            children[9].value = "#67C23A";
          }
          if (curColSetting.isNumber != undefined) {
            //非number类型的表格列字段，不展示数据格式设置和条件设置
            let numberFlag = !!!curColSetting.isNumber;
            for (let attrIndex = 3; attrIndex < 10; attrIndex++) {
              children[attrIndex].disabled = numberFlag;
              if (attrIndex === 5 && ['CrossTable', 'PivotTable'].includes(state.activedCompt.type)) {
                children[attrIndex].isShow = !numberFlag
              }
              if (attrIndex > 5 && !numberFlag) {//number类型的条件设置的显示根据启用条件格式，选中则显示，不选则隐藏
                children[attrIndex].disabled = !curColSetting.setCondi||curColSetting.setCondi==='default' ? true : false//!curColSetting.setCondi;
              }
            }
          }
          // 对齐只针对列，所以如果处于聚合情况下要判断
          if (state.activedCompt.comptAttrs.polymerizeType == 1 && ['CrossTable'].includes(state.activedCompt.type)) {
            let isCol = state.activedCompt.comptAttrs.yAxis1Data.some(item => {
              return item.element_id == firItem.value;
            });
            children[2].disabled = isCol ? false : true;
          } else {
            children[2].disabled = false;
          }
        }

        // 清单轮播组件
        if (state.activedCompt.type == "ElSwiper") {
          // 默认选中第一列
          let swiperChilds = state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children;
          let firElId = state.activedCompt.comptAttrs.xAxisData[0].element_id;
          swiperChilds[state.styleAttrsIndex[1]].value = firElId;
          let colSettingSwiper = state.activedCompt.comptAttrs.colSetting[firElId];
          // 如果没改过别名，输入框为空
          if (colSettingSwiper.nickName != colSettingSwiper.oriName) {
            swiperChilds[1].value = colSettingSwiper.nickName;
          } else {
            swiperChilds[1].value = "";
          }
          // 维度字段不能设置别名，数据格式，小数点,度量可以
          swiperChilds[1].disabled = true;
          swiperChilds[4].disabled = true;
          swiperChilds[5].disabled = true;

          for (let indexSwi = 2; indexSwi < swiperChilds.length; indexSwi++) {
            const elementSwi = swiperChilds[indexSwi];
            if (colSettingSwiper[elementSwi.enName] != undefined) {
              swiperChilds[indexSwi].value = colSettingSwiper[elementSwi.enName];
            }
          }
        }
        if (state.activedCompt.type == "HdWater") {
          state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].options = [];
          let array = state.activedCompt.comptData.columns;
          if (array && array.length > 0) {
            for (let i = 0; i < array.length; i++) {
              let obj = {
                'label': array[i],
                'value': i
              }
              state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].options.push(obj);
              state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].value = 0
            }
          }
        }
        if (state.activedCompt.type == "VeDoughnutPie") {
          state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].options = [];
          let columns = state.activedCompt.comptData.columns;
          let rows = state.activedCompt.comptData.rows;
          if (rows && rows.length > 0) {
            for (let i = 0; i < rows.length; i++) {
              let obj = {
                'label': rows[i][columns[0]],
                'value': i
              }
              state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].options.push(obj);
              state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].value = 0
            }
          }
        }
        if (state.activedCompt.type == "PcKpiBlock" || state.activedCompt.type == "HdKpiBlock" || state.activedCompt.type == "HdKpiBlock2" || state.activedCompt.type == "HdKpiBlock3") {
          state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].options = [];
          let array = state.activedCompt.comptAttrs.seriesSelected;
          if (array && array.length > 0) {
            for (let i = 0; i < array.length; i++) {
              let obj = {
                'label': array[i],
                'value': i
              }
              state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].options.push(obj);
            }

            if (state.activedCompt.type == "PcKpiBlock") {
              state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].value = state.activedCompt.comptAttrs.selectIndex;
            }

            if (
              state.activedCompt.type == "HdKpiBlock" ||
              state.activedCompt.type == "HdKpiBlock2" ||
              state.activedCompt.type == "HdKpiBlock3"
            ) {
              state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].value = state.activedCompt.comptAttrs.selectIndex;
              let activedCompt = state.activedCompt;
              let styleAttrs = activedCompt.styleAttrs;
              let extendSetting = activedCompt.comptAttrs.extendSetting;
              let seriesAttrs;
              let commonAttrs;
              //通用设置seriesAttrs
              styleAttrs.forEach(data => {
                if (data.enName == "seriesAttrs") {
                  seriesAttrs = data.children;
                }
              });
              //数值设置numberAttrs
              styleAttrs.forEach(data => {
                if (data.enName == "numberAttrs") {
                  commonAttrs = data.children;
                }
              });

              //指标1-2-3的值设置
              // this.$set(state.activedCompt.comptAttrs, "selectIndex", state.activedCompt.comptAttrs.selectIndex);
              seriesAttrs.forEach(seriesOptions => {
                switch (seriesOptions.enName) {
                  case "rename":
                    var v = state.activedCompt.styleAttrs[1].children[0].options[
                      activedCompt.comptAttrs.selectIndex
                      ].label;
                    seriesOptions.value =
                      activedCompt.comptData.columns[
                        activedCompt.comptAttrs.selectIndex
                        ];


                    if (seriesOptions.value == v) {
                      seriesOptions.value = "";
                    }
                    break;
                  case "others":
                    break;
                }
              });

              commonAttrs.forEach(seriesOptions => {
                switch (seriesOptions.enName) {
                  case "decimalDigit":
                    seriesOptions.value = extendSetting.series[
                      activedCompt.comptAttrs.selectIndex
                      ].decimalDigit
                      ? extendSetting.series[activedCompt.comptAttrs.selectIndex]
                        .decimalDigit
                      : ""
                    break;
                  case "numberType":
                    var v = extendSetting.series[
                      activedCompt.comptAttrs.selectIndex
                      ].numberType
                      ? extendSetting.series[activedCompt.comptAttrs.selectIndex]
                        .numberType
                      : "";

                    if (v == "") {
                      seriesOptions.value = "无";
                    } else if (v == 1) {
                      seriesOptions.value = "小数点";
                    } else if (v == 2) {
                      seriesOptions.value = "百分比";
                    } else {
                      seriesOptions.value = "无";
                    }

                    break;
                  // case "setCondi":
                  //   seriesOptions.value =
                  //     extendSetting.series[
                  //       activedCompt.comptAttrs.selectIndex
                  //     ].setCondi;
                  //   break;
                  case "riseNum":
                    seriesOptions.inputValue = extendSetting.series[
                      activedCompt.comptAttrs.selectIndex
                      ].riseNum
                      ? extendSetting.series[activedCompt.comptAttrs.selectIndex]
                        .riseNum
                      : null;
                    break;
                  case "riseIconColor":
                    seriesOptions.value = extendSetting.series[
                      activedCompt.comptAttrs.selectIndex
                      ].riseIconColor
                      ? extendSetting.series[activedCompt.comptAttrs.selectIndex]
                        .riseIconColor
                      : "#ff6000";
                    break;
                  case "dropNum":
                    seriesOptions.inputValue = extendSetting.series[
                      activedCompt.comptAttrs.selectIndex
                      ].dropNum
                      ? extendSetting.series[activedCompt.comptAttrs.selectIndex]
                        .dropNum
                      : null;
                    break;
                  case "dropIconColor":
                    seriesOptions.value = extendSetting.series[
                      activedCompt.comptAttrs.selectIndex
                      ].dropIconColor
                      ? extendSetting.series[activedCompt.comptAttrs.selectIndex]
                        .dropIconColor
                      : "#67C23A";
                    break;
                }
              });
            }


          }
        }

        if (state.activedCompt.type == "HdIconKpiBlock") {
          state.activedCompt.styleAttrs[1].children[0].options = [];
          let array = state.activedCompt.comptAttrs.seriesSelected;
          if (array && array.length > 0) {
            for (let i = 0; i < array.length; i++) {
              let obj = {
                'label': array[i],
                'value': i
              }
              state.activedCompt.styleAttrs[1].children[0].options.push(obj);
              state.activedCompt.styleAttrs[1].children[0].value = 0;
            }
          }
          return
        }

        //地图默认选中
        if (['VeMap', 'VeAreaMap'].includes(state.activedCompt.type)) {
          if (state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].value == '')
            state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].value = array[1];
          let labelMap = state.activedCompt.comptAttrs.setting['labelMap'];
          if (labelMap != undefined && labelMap != {}) {
            //别名
            var otherName = {
              "parantName": "seriesAttrs",
              "childrenName": "series.index.name,legend.data.index"
            };
            dispatch('getStyleAttrIndex', otherName);
            state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].value = labelMap[state.activedCompt.styleAttrs[2].children[0].value];
          }
        }

        //雷达图
        if (state.activedCompt.type === 'VeRadar') {
          state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].options = [];
          let array = state.activedCompt.comptData.rows;
          if (array && array.length > 0) {
            for (let i = 0; i < array.length; i++) {
              if (array[i].type != "XXXXCODE") {
                let obj = {
                  'label': array[i].type,
                  'value': array[i].type
                }
                state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].options.push(obj);
              }
            }

          }
        }

        //仪表盘
        if (state.activedCompt.type === 'VeGauge') {
          state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].options = [];
          let array = state.activedCompt.comptData.rows;
          if (array && array.length > 0) {
            for (let i = 0; i < array.length; i++) {
              if (array[i].type != "XXXXCODE") {
                let obj = {
                  'label': array[i].type,
                  'value': array[i].type
                }
                state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].options.push(obj);
              }
            }
            //默认选中第一个
            state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].value = array[0].type;
          }
        }

        dispatch('switchSeriesData');
      }
    },
    // 切换系列下拉框选项，对应切换系列的设置
    switchSeriesData({state,dispatch}) {
      // 通过colSetting 存储列设置的组件，目前暂时只有进度条使用这一套，前面已经设置好系列字段
      if (!state.activedCompt.comptAttrs.colSetting || !state.newStyleSetCompts.includes(state.activedCompt.type)) {
          return;
      }
      dispatch("getStyleAttrIndex", {
        "parantName": "seriesAttrs",
        "childrenName": "comptData"
      });
      let seriesChilds = state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children;
          // 选中的系列字段element_id
          let firElId = seriesChilds[state.styleAttrsIndex[1]].value;
          let seriesColSet = state.activedCompt.comptAttrs.colSetting[firElId];
          if (seriesColSet) {
            // 如果没改过别名，输入框为空
            if (seriesColSet.nickName !== seriesColSet.oriName) {
              seriesChilds[1].value = seriesColSet.nickName;
            } else {
              seriesChilds[1].value = "";
            }
          }

          for (let indexSeries = 2; indexSeries < seriesChilds.length; indexSeries++) {
            const {
              enName: attrEnName
            } = seriesChilds[indexSeries];
            if (seriesColSet[attrEnName] !== undefined) {
              seriesChilds[indexSeries].value = seriesColSet[attrEnName];
            }
            if(state.activedCompt.type === 'ProgressBar') {
              // 是否绑定动态目标值
              const isDynamic = seriesColSet.targetSetMode === 'dynamic';
              // 静态时则不显示动态度量的设置，动态则不显示静态的
              if (['dynamicElementId', 'dynamicPolymerizeType'].includes(attrEnName)) {
                seriesChilds[indexSeries].isShow = isDynamic;
              }
              if (['staticTargetVal'].includes(attrEnName)) {
                seriesChilds[indexSeries].isShow = !isDynamic;
              }
            }
          }
    },
    setWarnCol({
                 state,
                 getters,
                 dispatch
               }) {
      //系列
      var idxParam = {
        "parantName": "seriesAttrs",
        "childrenName": "comptData"
      };
      dispatch('getStyleAttrIndex', idxParam);
      if (state.activedCompt.comptData && state.activedCompt.comptData.columns) {
        var array = state.activedCompt.comptData.columns;
        state.activedCompt.comptAttrs.warnCol = [];
        if (state.activedCompt.type == 'VeRadar') {
          array = state.activedCompt.comptData.rows;
          for (let i = 0; i < array.length; i++) {
            if (array[i].type != "XXXXCODE") {
              //赋值预警字段
              let obj2 = {
                'label': array[i].type,
                'value': i
              }
              state.activedCompt.comptAttrs.warnCol.push(obj2);
            }

          }
        } else {
          for (let i = 1; i < array.length; i++) {

            //赋值预警字段
            let obj2 = {
              'label': array[i],
              'value': i - 1
            }
            state.activedCompt.comptAttrs.warnCol.push(obj2);

          }
        }
      }
    },
    setAnotherName({state,getters},compt) {
      if (compt.comptData.columns != null && compt.comptData.columns.length > 0) {
        var name = compt.comptData.columns[1]
        var type = compt.type;
        if (type == "VeCombineChart" || type === 'VeCombineStack') {
          compt.comptAttrs.extendSetting['xAxis.0.axisLine.show'] = compt.comptAttrs.extendSetting['xAxis.0.axisLine.show'] === undefined ? true : compt.comptAttrs.extendSetting['xAxis.0.axisLine.show'];
          compt.comptAttrs.extendSetting['yAxis.0.axisLine.show'] = compt.comptAttrs.extendSetting['yAxis.0.axisLine.show'] === undefined ? true : compt.comptAttrs.extendSetting['yAxis.0.axisLine.show'];
          compt.comptAttrs.extendSetting['yAxis.1.axisLine.show'] = compt.comptAttrs.extendSetting['yAxis.1.axisLine.show'] === undefined ? true : compt.comptAttrs.extendSetting['yAxis.1.axisLine.show'];
          compt.styleAttrs[4].children[0].value = name;
          compt.styleAttrs[4].children[2].value = compt.comptAttrs.extendSetting['series.0.type'];
        } else if (type == "VeLine" || type == "VeLineArea" || type == "VeStackLineArea" || type == "VePercentStackLineArea") {
          compt.comptAttrs.extendSetting['xAxis.0.axisLine.show'] = compt.comptAttrs.extendSetting['xAxis.0.axisLine.show'] === undefined ? true : compt.comptAttrs.extendSetting['xAxis.0.axisLine.show'];
          compt.comptAttrs.extendSetting['yAxis.0.axisLine.show'] = compt.comptAttrs.extendSetting['yAxis.0.axisLine.show'] === undefined ? true : compt.comptAttrs.extendSetting['yAxis.0.axisLine.show'];
          compt.styleAttrs[4].children[0].value = name;
        } else if (type == "VeHistogram" || type == "VeStackHistogram" || type == "VePercentStackHistogram" || type == "VeBar" || type == "VeStackBar" || type == "VePercentStackBar") { //柱状图、条形、堆积条形图
          //在点击确定时候设置x与y轴显示线条
          compt.comptAttrs.extendSetting['xAxis.0.axisLine.show'] = compt.comptAttrs.extendSetting['xAxis.0.axisLine.show'] === undefined ? true : compt.comptAttrs.extendSetting['xAxis.0.axisLine.show'];
          compt.comptAttrs.extendSetting['yAxis.0.axisLine.show'] = compt.comptAttrs.extendSetting['yAxis.0.axisLine.show'] === undefined ? true : compt.comptAttrs.extendSetting['yAxis.0.axisLine.show'];
          compt.styleAttrs[3].children[0].value = name;
        } else if (type == "VeGauge") { //仪表图
          name = compt.comptData.rows[0].type;
          compt.styleAttrs[3].children[0].value = name;
          compt.comptAttrs.extendSetting['series.0.data.0.name'] = name; //仪表盘图例的名称
        } else if (type == "VeRing") { //仪表图
          compt.styleAttrs[1].children[0].value = name;
          compt.comptAttrs.extendSetting['anotherName.text'] = name;
          //compt.comptAttrs.extendSetting['series.0.data.0.name'] = name; //仪表盘图例的名称
        } else if (type == "VeRadar") { //雷达图
          name = (compt.comptData.rows[0]||{}).type;
          compt.styleAttrs[2].children[0].value = name;
        } else if (['VeMap', 'VeAreaMap'].includes(type)) { //地图设置系列默认选中
          compt.styleAttrs[2].children[0].value = name;
        } else if (type == "VeScatter" || type == "Scatter") {
          compt.styleAttrs[3].children[0].value = compt.comptData.columns[0];
        }
      }
    },
    setIconDate({
                  state,
                  getters,
                  dispatch
                }, param) {
      //  var type = state.s_edcuiCompts[idx].type;
      var array = [];
      //图表布局
      var idxParam = {
        "parantName": "layoutAttrs",
        "childrenName": "legend"
      };
      if (state.activedCompt.type == 'ElTabs') {
        idxParam.childrenName = 'tabAlign';
      } else if (state.activedCompt.type == 'ElCarousel') {
        idxParam.childrenName = 'direction';
      } else if (state.activedCompt.type == 'HdBorderWrap') {
        idxParam.childrenName = 'flashDirection'
      }
      dispatch('getStyleAttrIndex', idxParam);
      array = state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].options

      for (var i = 0; i < array.length; i++) {
        array[i].isSelected = false
        if (i == param) {
          array[i].isSelected = true
        }
      }
    },
    getColIndex({
                  state,
                  getters,
                  dispatch,
                  rootState
                }, param) {
      state.paramVal = param;
      dispatch('uptColIndex');
      let ind = state.colIndex;
      let activedCompt = state.activedCompt
      let comptType = activedCompt.type;



      // var elemname = param;
      var array = state.activedCompt.comptAttrs.yAxis1Data.concat(state.activedCompt.comptAttrs.yAxis2Data || []);
      if (array.length == 0) {
        return;
      }
      // var datasetMap = rootState.AnalyReportAttr.datasetMap;
      // var result = constructList(array, datasetMap);
      /*var elemId = ""
        if (result.resultList && result.resultList.length != 0) {
          for (let i = 0; i < result.resultList.length; i++) {
            if (result.resultList[i].col_chs_name == elemname) {
              elemId = result.resultList[i].element_id;
              break;
            }
          }
        }*/

      // if (comptType === "PcKpiBlock" || comptType === "HdKpiBlock" || comptType === "HdKpiBlock2" || comptType === "HdKpiBlock3" || state.activedCompt.comptAttrs.isExtComp === "1") {
      if (!["PcKpiBlock", "HdKpiBlock", "HdKpiBlock2", "HdKpiBlock3","PcIndicatorTrend"].includes(comptType) && state.activedCompt.comptAttrs.isExtComp !== "1") {
        if (!['VeMap', 'VeAreaMap', 'VeScatter', 'Scatter', 'VeBubbleMap', 'VeBmap', 'VeHeatBmap', 'VeLinesBmap'].includes(comptType)) {
          //图形颜色
          dispatch('getStyleAttrIndex', {
            "parantName": "seriesAttrs",
            "childrenName": "series.index.itemStyle.normal.color"
          });
          if (!['VeRadar', 'ProgressBar'].includes(comptType)) {
            //  var color = state.activedCompt.comptAttrs.extendSetting['series.' + ind + '.itemStyle.normal.color'];
            var color = state.activedCompt.comptAttrs.colSetting[param]['series.index.itemStyle.normal.color'];
            state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].value = color;
          }
        }

        if (!['VeRadar', 'VeMap', 'VeScatter', 'Scatter', 'ProgressBar', 'VeBubbleMap', 'VeBmap', 'VeHeatBmap', 'VeLinesBmap'].includes(comptType)) {
          //数据标签
          dispatch('getStyleAttrIndex', {
            "parantName": "seriesAttrs",
            "childrenName": "series.label.normal.show"
          });
          //  var pointNum = state.activedCompt.comptAttrs.extendSetting['series.' + ind + '.label.normal.show'];
          var pointNum = state.activedCompt.comptAttrs.colSetting[param]['series.label.normal.show'];
          if (pointNum !== true) {
            pointNum = false;
          }
          state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].value = pointNum;
          //最值
          dispatch('getStyleAttrIndex', {
            "parantName": "seriesAttrs",
            "childrenName": "series.index.markPoint"
          });
          // var MAX = state.activedCompt.comptAttrs.extendSetting['series.' + ind + '.markPoint'];
          var MAX = state.activedCompt.comptAttrs.colSetting[param]['series.index.markPoint'];
          // if (typeof (MAX) == "object") {
          //   MAX = true;
          // } else {
          //   MAX = false;
          // }
          state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].value = MAX;
        }
        //别名
        let key = (comptType === 'VeScatter' || comptType === 'Scatter') ? 'series.index.name' : 'series.index.name,legend.data.index'
        dispatch('getStyleAttrIndex', {
          "parantName": "seriesAttrs",
          "childrenName": key
        });
        //  var ANNAME = state.activedCompt.comptAttrs.extendSetting['series.' + ind + '.name'];
        if (!['VeRadar', 'VeMap', 'ProgressBar', 'VeBmap', 'VeHeatBmap', 'VeLinesBmap'].includes(comptType)) {
          let ANNAME = state.activedCompt.comptAttrs.colSetting[param][key];
          if (ANNAME != param) {
            state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].value = ANNAME;
          }
        }

        //组合图系列类型
        if (comptType == "VeCombineChart" || comptType == 'VeCombineStack') {
          // var type = state.activedCompt.comptAttrs.extendSetting['series.' + ind + '.type'];
          var type = state.activedCompt.comptAttrs.colSetting[param]['series.index.type'];
          state.activedCompt.styleAttrs[4].children[2].value = type;
        }
        if (['VeMap', 'VeAreaMap'].includes(comptType)) {
          //数据标签
          dispatch('getStyleAttrIndex', {
            "parantName": "seriesAttrs",
            "childrenName": "series.index.label.normal.map.show"
          });
          let label = state.activedCompt.comptAttrs.extendSetting['series.' + ind + '.label.normal.map.show'];
          if (label !== true) {
            label = false;
          }
          state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].value = label;
          //别名
          dispatch('getStyleAttrIndex', {
            "parantName": "seriesAttrs",
            "childrenName": "series.index.name,legend.data.index"
          });
          let labelMap = state.activedCompt.comptAttrs.setting['labelMap'] || {};
          state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].value = labelMap[param];

          //小数点位数
          dispatch('getStyleAttrIndex', {
            "parantName": "seriesAttrs",
            "childrenName": "decimalDigit"
          });
          let numCount = state.styleAttrsIndex;
          let dicimal = state.activedCompt.comptAttrs.extendSetting['series.' + ind + '.decimalDigit'] || "0";
          state.activedCompt.styleAttrs[numCount[0]].children[numCount[1]].value = dicimal;

          //数据显示格式
          dispatch("getStyleAttrIndex", {
            "parantName": "seriesAttrs",
            "childrenName": "series.index.number.format"
          });
          let format = state.activedCompt.comptAttrs.extendSetting['series.' + ind + '.number.format'] || "{'smooth':false}";
          state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].value = format;
          if (label) {
            state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]]['isShow'] = true;
            state.activedCompt.styleAttrs[numCount[0]].children[numCount[1]]['isShow'] = true;
          } else {
            state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]]['isShow'] = false;
            state.activedCompt.styleAttrs[numCount[0]].children[numCount[1]]['isShow'] = false;
          }
          dispatch('setMapSeriesData');
        }
        if (['VeStackBar', 'VeBar', 'VeStackHistogram', 'VeHistogram', "VeCombineChart", "VeWaterfall"].includes(comptType)) {
          dispatch('getStyleAttrIndex', {
            "parantName": "seriesAttrs",
            "childrenName": "series.index.barWidth"
          });
          let barWidth = String(state.activedCompt.comptAttrs.colSetting[param]['series.index.barWidth']);
          let unit = "";
          if (barWidth) {
            if (barWidth.indexOf("%") != -1) {
              unit = "%";
              barWidth = barWidth.slice(0, -1);
            } else {
              unit = "px";
              barWidth = barWidth.slice(0, -2);
            }
            state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].value = barWidth;
            state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].unitValue = unit;
          }
        }
      }

    },
    uptdistance({
                  state,
                  rootState,
                  getters,
                  dispatch
                }, param) {
      state.activedCompt.comptAttrs.extendSetting['legend.formatter'] = function(params) {
        if(params.indexOf('\\n') == -1){
          return params;
        }else{
          return '{white|'+params.split('\\n')[0]+'}\n'+params.split('\\n')[1];
        }
      };
      let arrRadius = state.activedCompt.comptAttrs.extendSetting['series.0.radius'];
      let legendVal = ''
      //获取当前图例分行情况
      if (state.activedCompt.styleAttrs[1].children[1] && state.activedCompt.styleAttrs[1].children[1].value === false) {
        legendVal = 'scroll'
      }
      switch(param)
      {
        case 'left' :
          let param1={top:28,bottom:18,left:'15%',right:10}
          let param2={top:'middle',bottom:null,left:10,right:null,orient:'vertical',type:'scroll',pageButtonPosition:null}
          if(state.activedCompt.type == 'VeRosePie' || state.activedCompt.type == 'VePie' || state.activedCompt.type == 'VeRing'){
            router.app.$set(state.activedCompt.comptAttrs.extendSetting,"series.0.center",["65%","50%"])
              router.app.$set(state.activedCompt.comptAttrs.extendSetting,"series.0.radius",arrRadius)
              param2.type = legendVal
          }else if(state.activedCompt.type == 'VeCombineChart' || state.activedCompt.type == 'VeCombineStack'){
            param2.pageButtonPosition = 'end'
          }else if(state.activedCompt.type == 'VeDoughnutPie') {
            for (let i = 0; i < state.activedCompt.comptData.rows.length; i++) {
              router.app.$set(state.activedCompt.comptAttrs.extendSetting, 'series.' + i + '.center', ["65%", '50%'])
            }
            param2.type = legendVal
          }
          dispatch('adjustgrid',param1)
          dispatch('adjustlegend',param2)
          break;
        case 'right' :
          let param3={top:28,bottom:18,left:10,right:'15%'}
          let param4={top:'middle',bottom:null,left:null,right:10,orient:'vertical',type:'scroll',pageButtonPosition:null}
          if(state.activedCompt.type == 'VeRosePie' || state.activedCompt.type == 'VePie' || state.activedCompt.type == 'VeRing'){
            router.app.$set(state.activedCompt.comptAttrs.extendSetting,"series.0.center",["35%","50%"])
              router.app.$set(state.activedCompt.comptAttrs.extendSetting,"series.0.radius",arrRadius)
              param4.type = legendVal
          }else if(state.activedCompt.type == 'VeCombineChart' || state.activedCompt.type == 'VeCombineStack'){
            param4.pageButtonPosition = 'end'
          }else if(state.activedCompt.type == 'VeDoughnutPie'){
            for (let i = 0; i < state.activedCompt.comptData.rows.length; i++) {
              router.app.$set(state.activedCompt.comptAttrs.extendSetting, 'series.' + i + '.center', ["35%","50%"])
            }
            param4.type = legendVal
          }
          dispatch('adjustgrid',param3)
          dispatch('adjustlegend',param4)
          break;
        case 'top' :
          let param5={top:'10%',bottom:24,left:10,right:10}
          let param6={top:2,bottom:null,left:'center',right:null,orient:'horizontal',type:'scroll',pageButtonPosition:'start'}
          if(state.activedCompt.type == 'VeRosePie' || state.activedCompt.type == 'VePie' || state.activedCompt.type == 'VeRing'){
            router.app.$set(state.activedCompt.comptAttrs.extendSetting,"series.0.center",["50%","50%"])
            router.app.$set(state.activedCompt.comptAttrs.extendSetting,"series.0.radius",arrRadius)
            param6.type = legendVal
          }
          if(state.activedCompt.type == 'VeRadar'){
            router.app.$set(state.activedCompt.comptAttrs.extendSetting,"radar.center",['50%','55%'])
            param6.top='1%'
          }
          if(state.activedCompt.type == 'VeDoughnutPie'){
            for (let i = 0; i < state.activedCompt.comptData.rows.length; i++) {
              router.app.$set(state.activedCompt.comptAttrs.extendSetting, 'series.' + i + '.center', ["50%","50%"])
            }
            param6.type = legendVal
          }
          dispatch('adjustgrid',param5)
          dispatch('adjustlegend',param6)
          break;
        case 'bottom' :
          let param7={top:28,bottom:'10%',left:10,right:10}
          let param8={top:null,bottom:0,left:'center',right:null,orient:'horizontal',type:'scroll',pageButtonPosition:'start'}
          if(state.activedCompt.type == 'VeRosePie' || state.activedCompt.type == 'VePie' || state.activedCompt.type == 'VeRing'){
            router.app.$set(state.activedCompt.comptAttrs.extendSetting,"series.0.center",["50%","50%"])
            router.app.$set(state.activedCompt.comptAttrs.extendSetting,"series.0.radius",arrRadius)
            param8.type = legendVal
          }
          if(state.activedCompt.type == 'VeRadar'){
            router.app.$set(state.activedCompt.comptAttrs.extendSetting,"radar.center",['50%','48%'])
            param8.bottom='1%'
          }
          if(state.activedCompt.type == 'VeDoughnutPie'){
            for (let i = 0; i < state.activedCompt.comptData.rows.length; i++) {
              router.app.$set(state.activedCompt.comptAttrs.extendSetting, 'series.' + i + '.center', ["50%","50%"])
            }
            param8.type = legendVal
          }
          dispatch('adjustgrid',param7)
          dispatch('adjustlegend',param8)
          break;
      }
    },
    adjustgrid({state},param){
      delete state.activedCompt.comptAttrs.extendSetting['grid.top']
      delete state.activedCompt.comptAttrs.extendSetting['grid.bottom']
      delete state.activedCompt.comptAttrs.extendSetting['grid.left']
      delete state.activedCompt.comptAttrs.extendSetting['grid.right']
      state.activedCompt.comptAttrs.extendSetting['grid.top'] = param.top;
      state.activedCompt.comptAttrs.extendSetting['grid.bottom'] = param.bottom;
      state.activedCompt.comptAttrs.extendSetting['grid.left'] = param.left;
      state.activedCompt.comptAttrs.extendSetting['grid.right'] = param.right;
    },
    adjustlegend({state},param1){
      delete state.activedCompt.comptAttrs.extendSetting['legend.top']
      delete state.activedCompt.comptAttrs.extendSetting['legend.bottom']
      delete state.activedCompt.comptAttrs.extendSetting['legend.left']
      delete state.activedCompt.comptAttrs.extendSetting['legend.right']
      state.activedCompt.comptAttrs.extendSetting['legend.top'] = param1.top;
      state.activedCompt.comptAttrs.extendSetting['legend.bottom'] = param1.bottom;
      state.activedCompt.comptAttrs.extendSetting['legend.left'] = param1.left;
      state.activedCompt.comptAttrs.extendSetting['legend.right'] = param1.right;
      state.activedCompt.comptAttrs.extendSetting['legend.orient'] = param1.orient;
      state.activedCompt.comptAttrs.extendSetting['legend.type'] = param1.type;
      state.activedCompt.comptAttrs.extendSetting['legend.pageButtonPosition'] = param1.pageButtonPosition;
    },
    setWarnDate({
                  state,
                  getters,
                  dispatch
                }, param) {
      state.activedCompt.comptAttrs.warnData = [];
      state.activedCompt.comptAttrs.warnData.push(param);
      //  state.activedCompt.styleAttrs[4].children[6].value = true;
      if (param.type.length != 0) {
        state.activedCompt.comptAttrs.isWarn = true;
      } else {
        state.activedCompt.comptAttrs.isWarn = false;
      }
    },
    delWarnDate({
                  state,
                  getters,
                  dispatch
                }) {
      // state.activedCompt.comptAttrs.warnData = [];
      state.activedCompt.comptAttrs.extendSetting['visualMap'] = [];
      //state.activedCompt.styleAttrs[4].children[6].value = false;
      state.activedCompt.comptAttrs.isWarn = false;
    },
    setActiveName({
                    state
                  }, param) {
      state.activeName = param
    },
    initLableFormatter({
                         state,
                         getters
                       }) {
      if (state.activedCompt.type == 'VePie' || state.activedCompt.type == "VeRosePie") {
        let decimalDigit = state.activedCompt.comptAttrs.decimalDigit;
        let val = "{formatter:function(data){return data.name + ' , ' + parseFloat(data.value).toFixed(" + parseInt(decimalDigit) + ") +'('+parseFloat(data.percent).toFixed(" + parseInt(decimalDigit) + ")+'%'+')';}}"
        state.activedCompt.comptAttrs.extendSetting['tooltip'] = eval("(" + val + ")");
        let labVal = state.activedCompt.comptAttrs.labelFunc.replace(/decimal/g, decimalDigit);
        state.activedCompt.comptAttrs.extendSetting['series.0.label'] = eval("(" + labVal + ")");
      } else if (['VeSankey', 'VeTreemap'].includes(state.activedCompt.type)) {
        let labVal = state.activedCompt.comptAttrs.labelFunc;
        state.activedCompt.comptAttrs.extendSetting['series.0.label'] = eval("(" + labVal + ")");
      } else if (state.activedCompt.type == 'VeGauge') {
        let decimalDigit = state.activedCompt.comptAttrs['decimalDigit']; //小数点
        let unit = state.activedCompt.comptAttrs['unit']; //单位
        //悬浮提示框
        let tooltipForm = "{formatter:function(data){return data.name + ' : ' + parseFloat(data.value).toFixed(" + parseInt(decimalDigit) + ")+'" + unit + "';}} "
        state.activedCompt.comptAttrs.extendSetting['tooltip'] = eval("(" + tooltipForm + ")");
        //图表显示值
        let detailForm = "{formatter:function(value){return isNaN(value)?'-':parseFloat(value).toFixed(" + parseInt(decimalDigit) + ")+'" + unit + "';}} ";
        state.activedCompt.comptAttrs.extendSetting['series.0.detail'] = eval("(" + detailForm + ")");

        // 解决IE浏览器series.0.detail 属性在 series.0.detail.color 及 detail.offsetCenter 之后， 导致设置的标题位置不生效
        const keys = Object.keys(state.activedCompt.comptAttrs.extendSetting)
        const detailK = keys.filter(k => k.indexOf('series.0.detail.') > -1)
        detailK.forEach(item => {
          let key = item.replace(/series.0.detail./g,'')
          router.app.$set(state.activedCompt.comptAttrs.extendSetting["series.0.detail"], key, state.activedCompt.comptAttrs.extendSetting[item])
        })
        // end
      }
    },
    modifyLegendFomatter({state},param) {
        let activedCompt = param;
        if (!activedCompt.comptData || activedCompt.comptData.columns.length === 0) {
          return;
        }
        let decimalDigit = activedCompt.comptAttrs.decimalDigit; //获取小数点位数
        if((activedCompt.type == "VePie"  || activedCompt.type == "VeRosePie")) {
          let layoutAttrs = activedCompt.styleAttrs.find((val)=>val.enName === "layoutAttrs").children || [];
          let taglist = layoutAttrs.find((val)=>val.enName === "tagList") || {};
          let tagListStyle = layoutAttrs.find((val)=>val.enName === "tagListStyle");
          if(taglist.value === true) {
            router.app.$set(activedCompt.comptAttrs.extendSetting, "legend.formatter", '')
            if(tagListStyle) {
              let v = tagListStyle.value; //获取列表样式
              let ComptData = activedCompt.comptData || [];

              activedCompt.comptAttrs.extendSetting["legend.formatter"] = function(name){
                let total = 0;

                const dataKey1 = ComptData.columns[0]
                const dataKey2 = ComptData.columns[1]
                ComptData.rows.forEach(arr =>{
                  total += parseFloat(arr[dataKey2])//值可能是float
                })
                let legendData = name;
                if(ComptData){
                  ComptData.rows.forEach(arr =>{
                    if(arr[dataKey1] === name){
                      const percent = total == 0 ? 0 : (arr[dataKey2]/total * 100).toFixed(decimalDigit);
                      switch(v) {
                        case "0":
                          legendData += " " + parseFloat(arr[dataKey2]).toFixed(decimalDigit) + " " + percent +'%';
                          break;
                        case "1":
                          legendData += " " + parseFloat(arr[dataKey2]).toFixed(decimalDigit);
                          break;
                        case "2":
                          legendData += " "+ percent +'%';
                          break;
                        default:
                          legendData += " ";
                      }
                    }
                  })
                }
                return legendData;
              }
            }
          }
        }
    },
    getStyleAttrIndex({
                        state,
                        getters,
                        dispatch
                      }, param) {
      var result = [];
      for (var i = 0; i < state.activedCompt.styleAttrs.length; i++) {
        if (state.activedCompt.styleAttrs[i].enName == param.parantName) {
          result[0] = i;
          for (var j = 0; j < state.activedCompt.styleAttrs[i].children.length; j++) {
            if (state.activedCompt.styleAttrs[i].children[j].enName == param.childrenName) {
              result[1] = j;
              break;
            }
          }
          break;
        }
      }

      state.styleAttrsIndex = result;
    },
    // 设置组件联动条件
    setCompLinkageCondi({
                          state,
                          getters,
                          rootState
                        }, param) {
      let {
        linkData,
        dim_value,
        is_dim
      } = param;
      let flatCompt = [];
      if (state.PCDialogVisible) { //浮窗打开，设置联动组件时应该查找浮窗内端所有组件
        flatCompt = getters.getFlatComptByList(state.PCDialogPageInfo.pageDetail || []);
      } else { //在pc端标签页或者手机端页面，组件通过getFlatCompt获取
        flatCompt = getters.getFlatCompt;
      }

      let datasetMap = rootState.AnalyReportAttr.datasetMap;
      for (let index = 0; index < linkData.length; index++) {
        const comptId = linkData[index].comptId,
          relElementId = linkData[index].element_id; // element_id
        let element = linkData[index];
        for (let index2 = 0; index2 < flatCompt.length; index2++) {
          if (flatCompt[index2].comptId == comptId) {
            let fieldInfo = datasetMap[linkData[index].af_id] || [];
            if (fieldInfo.length > 0) {
              let field = fieldInfo.filter(item => {
                //时间格式的拆分，不能只用element_id匹配
                if(element.col_type === 'dat') {
                  return item.element_id == relElementId && item.isNewCol && item.formatLevel === element.formatLevel;
                }
                return item.element_id == relElementId
              });
              if (field.length > 0) {
                let idx = -1;
                let condiData = flatCompt[index2].comptAttrs.linkageCondi;
                for (let index3 = 0; index3 < condiData.length; index3++) {
                  if (condiData[index3].element_id == field[0].element_id) {
                    idx = index3;
                    let condiItem = objDeepCopy(condiData[index3]);
                    condiItem.rule_value = dim_value;
                    condiItem.target_format = field[0].show_format;
                    condiItem.format = field[0].source_format;
                    flatCompt[index2].comptAttrs.isLinkage = true;
                    flatCompt[index2].comptAttrs.linkageCondi.splice(index3, 1, condiItem);
                    break;
                  }
                }

                if (idx == -1) {
                  //设置where_bean条件
                  flatCompt[index2].comptAttrs.isLinkage = true;
                  flatCompt[index2].comptAttrs.linkageCondi.push({
                    col_id: field[0].col_id,
                    col_type: "2",
                    exp_id: "",
                    is_dim: is_dim,
                    symbol: 3, //=
                    rule_value: dim_value,
                    obj_id: field[0].tab_id,
                    element_id: field[0].element_id,
                    rel_element_id: linkData[index].rel_element_id,
                    format: element.format,
                    target_format: element.target_format
                  });
                }
              }
            }
          }
        }
      }
    },
    // 设置组件跨页面联动的条件
    setPageLinkCondis({
                        state,
                        getters,
                        rootState
                      }, param) {
      // 页面联动条件
      let pageLink = sessionStorage.getItem('pageLinkCondis');
      let pageLinkCondis = JSON.parse(pageLink || '{}') || {};
      if (['VeSankey', 'VeTree'].includes(param.type)) {
        pageLinkCondis = {};
      }
      let linkCondi1 = [];
      // 遍历当前页组件，把联动状态下的组件的条件塞到跳转页面的被联动组件中
      for (const dataItem of param.pageLinkageData) {
        if (param.pageId == dataItem.pageId) {
          linkCondi1.push({
            element_id: dataItem.element_id,
            af_id: dataItem.af_id,
            value: param.value, //联动条件值
            comptId: dataItem.comptId
          });
          //时间格式的字段新增以下参数
          if(dataItem.col_type === 'dat'){
            linkCondi1[linkCondi1.length-1] = {
              ...linkCondi1[linkCondi1.length-1],
              ...{
                isNewCol: dataItem.isNewCol,
                formatLevel: dataItem.formatLevel,
                col_type: dataItem.col_type,
                format: dataItem.format,
                target_format: dataItem.target_format
              }
            }
          }
        }
      }
      pageLinkCondis[param.pageId] = linkCondi1;
      sessionStorage.setItem("pageLinkCondis", JSON.stringify(pageLinkCondis)
      );
    },
    // 打开子页面
    openChildPage({
                    state,
                    getters,
                    rootState,
                    commit,
                    dispatch
                  }, param) {
      let pageInfo = objDeepCopy(getters.getPageById(
        param.pageLinkageData[0].pageId
      ));
      pageInfo["operation"] = "preview";
      if (!param.noParam) {
        dispatch("setPageLinkCondis", {
          pageLinkageData: param.pageLinkageData,
          pageId: pageInfo.pageId,
          value: param.linkVal,
          type: param.type
        });
      }
      if (pageInfo.classTypeId == "1001001" || pageInfo.classTypeId == "1005") { //pc端
        if (pageInfo.pageType == 1) { //打开新页面
          let pageCacheBak = objDeepCopy(rootState.HomeBody.pageCache);
          dispatch('HomeBody/setPageCache', pageInfo, {
            root: true
          });
          sessionStorage.setItem("pageCache", JSON.stringify(pageInfo));
          sessionStorage.setItem("store", JSON.stringify(rootState));
          let routeData = router.resolve({
            name: "pageView"
          });
          window.open(routeData.href, "_blank");
          sessionStorage.setItem("pageCache", JSON.stringify(pageCacheBak));
          dispatch('HomeBody/setPageCache', pageCacheBak, {
            root: true
          });
        } else { //打开浮动窗
          dispatch("orgnizeComptsList", pageInfo);
          let list2 = objDeepCopy(state.pageComptsList);
          pageInfo.pageDetail = list2;
          state.PCDialogPageInfo = pageInfo;
          state.PCDialogVisible = true;
          // 设置公共参数传递
          dispatch("setPageQueryParams");
        }
      } else { //手机端 当前页面打开
        // 跳转之前存储当前页面信息
        dispatch('HomeBody/setPageCache', pageInfo, {
          root: true
        });
        dispatch("orgnizeComptsList", pageInfo);
        let list = objDeepCopy(state.pageComptsList);
        commit("setSedcuiCompts", list);

        state.mobileLinkPages.push({
          pageInfo: objDeepCopy(pageInfo),
          s_edcuiCompts: objDeepCopy(state.s_edcuiCompts)
        });
        // 设置公共参数传递
        dispatch("setPageQueryParams");
      }
    },
    // 检查是否打开链接子页面
    checkIfOpenChildPage({
                           state,
                           getters,
                           rootState,
                           dispatch
                         }, param) {
      let flag = false;
      let linkDataAll = param.vscompt.comptAttrs["pageLinkageData"] || [];
      if (param.element_id != undefined && param.element_id != "") {
        let curElLink = linkDataAll.filter(item => {
          return item.rel_element_id == param.element_id;
        });
        if (curElLink.length > 0) {
          flag = true;
          linkDataAll = objDeepCopy(curElLink);
        }
      } else {
        flag = true;
      }
      if (
        linkDataAll.length > 0 &&
        rootState.HomeBody.pageCache["operation"] == "preview" && flag
      ) {
        if (
          rootState.HomeBody.pageCache.classTypeId == "1001002" &&
          state.mobileLinkPages.length == 0
        ) {
          //手机端外部预览
          state.mobileLinkPages.push({
            pageInfo: objDeepCopy(rootState.HomeBody.pageCache),
            s_edcuiCompts: objDeepCopy(state.s_edcuiCompts)
          });
        }
        // 带公共参数的条件：
        // 1.如果当前页有查询组件且联动组件与查询条件联动，
        // 2.参数设置里 对被联动组件
        let linkageCondi1 = param.vscompt.comptAttrs["linkageCondi"] || [];
        // 直接根据公共参数等过滤出需要往下带的查询条件
        let qc = sessionStorage.getItem('queryCondis');
        let queryCondisObj = JSON.parse(qc || "{}") || {};
        //存储查询条件值
        let queryCondis = linkageCondi1.filter(item => { //过滤出查询条件的联动条件
          return (item["isFromQuery"] || false) == true
        });
        // 如果当前页没查询条件，还要查看otherCondi，把前前一页的条件带下来
        let curPageId1 = rootState.HomeBody.pageCache.pageId;
        let curPageQueryCompts = getters.getQueryCompts(curPageId1);
        let ntPageQueryCompts = getters.getQueryCompts(linkDataAll[0].pageId); //待跳转页的查询条件
        if (curPageQueryCompts.length == 0) {
          let tempCondis = objDeepCopy(queryCondisObj[curPageId1] || []);
          queryCondis = queryCondis.concat(tempCondis);
        }
        queryCondis = filterQueryCondis({
          queryCondis: queryCondis,
          queryCompts: ntPageQueryCompts,
          pageParams: getters.getPageParams
        });
        queryCondisObj[linkDataAll[0].pageId] = queryCondis;
        sessionStorage.setItem("queryCondis", JSON.stringify(queryCondisObj));
        dispatch("openChildPage", {
          pageLinkageData: linkDataAll,
          linkVal: param.dim_value,
          type: param.vscompt.type
        });

      }
    },
    setQueryCondis({
                     state
                   }, param) {
      // 1.如果当前页有查询组件且联动组件与查询条件联动，
      // 2.参数设置里 对被联动组件
      let linkageCondi1 = param.vscompt.comptAttrs["linkageCondi"] || [];
      //存储查询条件值
      let queryCondis = linkageCondi1.filter(item => { //过滤出查询条件的联动条件
        return (item["isFromQuery"] || false) == true
      });
      let qc = sessionStorage.getItem('queryCondis');
      let queryCondisObj = JSON.parse(qc || "{}") || {};
      queryCondisObj[linkDataAll[0].pageId] = queryCondis;
      sessionStorage.setItem("queryCondis", JSON.stringify(queryCondisObj));
    },
    //手机跳转页和打开浮动窗，传递组件条件
    orgnizeComptsList({
                        state,
                        getters
                      }, pageInfo) {
      let list = objDeepCopy(pageInfo.pageDetail);
      // 取回上一个页面传过来的条件
      let lc = sessionStorage.getItem('pageLinkCondis');
      let pageLinkCondis = JSON.parse(lc || "{}");
      let curPageCondi = pageLinkCondis[pageInfo.pageId] || [];
      if (curPageCondi.length > 0) {
        let flatCompts = getters.getFlatComptByList(list) || [];
        //回填前一页面的链接条件
        for (const comp of flatCompts) {
          let otherPageCondi = setCondiToCompt(comp, curPageCondi);
          comp.comptAttrs["otherPageCondi"] = objDeepCopy(
            otherPageCondi
          );
        }
      }
      state.pageComptsList = objDeepCopy(list);
    },
    setMapSeriesData({
                       state,
                       getters,
                       dispatch
                     }, param) {
      if (state.activedCompt == null || state.activedCompt.styleAttrs == null) return;
      //数据与标签
      dispatch("getStyleAttrIndex", {
        "parantName": "seriesAttrs",
        "childrenName": "series.index.label.normal.map.show"
      });
      let dataLab = state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].value;
      //数据显示格式
      dispatch("getStyleAttrIndex", {
        "parantName": "seriesAttrs",
        "childrenName": "series.index.number.format"
      });
      let format = state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].value;
      //地名
      dispatch("getStyleAttrIndex", {
        "parantName": "layoutAttrs",
        "childrenName": "series.index.name.normal.show"
      });
      let areaName = state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].value;
      //小数点
      dispatch("getStyleAttrIndex", {
        "parantName": "seriesAttrs",
        "childrenName": "decimalDigit"
      });
      let decimal = state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].value;
      //系列
      dispatch("getStyleAttrIndex", {
        "parantName": "seriesAttrs",
        "childrenName": "comptData"
      });
      let seriesName = state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].value;
      let tolCount = getters.getColsTotalAndData.colsTotal[state.paramVal || seriesName];
      let colIndex = state.colIndex || 0;
      let colsData = getters.getColsTotalAndData.colsData;
      let smooth = format;
      eval('smooth=' + format)
      if (param != null) {
        switch (param.key) {
          case "series.label.normal.show": //显示数据与标签
            dataLab = param.val;
            break;
          case "decimalDigit": //小数点
            decimal = param.val;
            break;
          case "series.index.name.normal.show": //地名
            areaName = param.val;
            break;
          case "series.index.number.format": //数据显示格式"
            format = param.val;
            smooth = format;
            break;
          default:
            break;
        }
      }
      let showLab = !dataLab && !areaName ? false : true;
      let formatter = !dataLab ?
        (areaName ? "function(data){return data.name;}" : "") :
        (
          areaName ?
            (smooth.smooth ?
                "function(data){let c; eval('c =' +JSON.stringify(" + JSON.stringify(colsData[seriesName]) + "));return data.name + ' : ' + (isNaN(data.value) ? '-' : parseFloat(c[data.name]*100/" + parseInt(tolCount) + ").toFixed(" + parseInt(decimal) + ")+'%');}" :
                "function(data){let c; eval('c =' +JSON.stringify(" + JSON.stringify(colsData[seriesName]) + "));return data.name + ' : ' + (isNaN(data.value) ? '-' : parseFloat(c[data.name]).toFixed(" + parseInt(decimal) + "));}"
            ) :
            (smooth.smooth ?
                "function(data){let c; eval('c =' +JSON.stringify(" + JSON.stringify(colsData[seriesName]) + "));return (isNaN(data.value) ? '-' : parseFloat(c[data.name]*100/" + parseInt(tolCount) + ").toFixed(" + parseInt(decimal) + ")+'%');}" :
                "function(data){let" +
                " c; eval('c =' +JSON.stringify(" + JSON.stringify(colsData[seriesName]) + "));return (isNaN(data.value) ? '-' : parseFloat(c[data.name]).toFixed(" + parseInt(decimal) + "));}"
            )
        );
      state.activedCompt.comptAttrs.extendSetting["series." + colIndex + ".label.normal.show"] = showLab;
      if (formatter != "") {
        state.activedCompt.comptAttrs.extendSetting["series." + colIndex + ".label.normal.formatter"] = eval('(' + formatter + ')');
      } else {
        delete state.activedCompt.comptAttrs.extendSetting["series." + colIndex + ".label.normal.formatter"];
      }
    },
    setAreaMapSeriesData({
                           state,
                           getters,
                           dispatch
                         }, param) {
      //数据格式，小数点改变更新scatter的数据data
      dispatch("ResetScatterSeriesData");
      //数据与标签
      dispatch("getStyleAttrIndex", {
        "parantName": ['VeAreaMap', 'VeBubbleMap'].includes(state.activedCompt.type) ? "seriesAttrs" : "layoutAttrs",
        "childrenName": "series.index.label.normal.map.show"
      });
      let dataLab = state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].value;
      //地名
      dispatch("getStyleAttrIndex", {
        "parantName": "layoutAttrs",
        "childrenName": "series.index.name.normal.show"
      });
      let areaName = state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].value;
      let formatter = dataLab ? (
        areaName ? "function(params){return (params.value[2] == undefined ? '-' : params.value[2])+'\\n'+ params.name}" : "function(params){return (params.value[2] == undefined ? '-' : params.value[2])}"
      ) : (
        areaName ? "function(params){return params.name}" : ""
      );
      if (formatter == "") {
        state.activedCompt.comptAttrs.extendSetting.series[0].label.normal.show = false;
      } else {
        state.activedCompt.comptAttrs.extendSetting.series[0].label.normal.formatter = eval('(' + formatter + ')');
        state.activedCompt.comptAttrs.extendSetting.series[0]['id'] = Math.random();
        router.app.$set(state.activedCompt.comptAttrs.extendSetting.series[0].label.normal, "show", true);
      }
    },
    setAreaMapMaxData({
                        state,
                        getters
                      }) {
      let properties = {};
      let features = [];
      if (state.activedCompt.comptAttrs.mapLevel == "1") {
        features = (require("@/../public/echarts-map-geo/province/" + state.activedCompt.comptAttrs.mapArea + ".json") || {}).features || [];
      } else if (state.activedCompt.comptAttrs.mapLevel == "2") {
        features = (require("@/../public/echarts-map-geo/city/" + state.activedCompt.comptAttrs.mapArea.replace(/(['一',('县市')])/gi, "") + ".json") || {}).features || [];
      }
      for (var i = 0; i < features.length; i++) {
        properties[features[i].properties.name] = features[i].properties.cp;
      }
      let seriesName = ['VeAreaMap','VeBubbleMap'].includes(state.activedCompt.type) ? state.paramVal : state.activedCompt.comptData.columns[2];
      let seriesData = getters.getColsTotalAndData.colsData[seriesName];
      let maxData = {
        "column": "",
        "result": 0
      };
      //求最大值
      for (let keys in seriesData) {
        if (properties[keys] != null && properties[keys] != undefined && parseInt(seriesData[keys]) > maxData.result) {
          maxData.result = parseInt(seriesData[keys]);
          maxData.column = keys;
        }
      }
      if (maxData.column != "" && maxData.result != 0) {
        properties[maxData.column].push(maxData.result);
        state.activedCompt.comptAttrs.extendSetting.series[1].data.push({
          name: maxData.column,
          value: properties[maxData.column]
        });
      }
    },
    // 设置联动条件 param.isJumpNewPage 是否要跳转新页面 true--跳  只针对单一维度的
    setLinkageCondi({
                      dispatch
                    }, param) {
      let dim_value = param.label;
      let is_dim = 0;
      if (
        ['VeSankey', 'VeTree'].includes(param.vscompt.type) ||
        (param.xAxisData[0].dim_level_id != undefined &&
        param.xAxisData[0].dim_level_id != null &&
        param.xAxisData[0].dim_level_id != "")
      ) {
        let rows = objDeepCopy(param.vscompt.comptData.rows);
        // 气泡图 rows是对象，要调成数组,不然联动找不到维值
        if (['VeScatter', 'Scatter'].includes(param.vscompt.type)) {
          let newRows = [];
          for (const key in rows) {
            if (rows.hasOwnProperty(key)) {
              const element = rows[key];
              newRows = newRows.concat(element);
            }
          }
          rows = newRows;
        }
        is_dim = 1;
        dim_value =
          getCurDimValu(
            param.label,
            rows,
            param.vscompt.comptData.columns[0],
            param.vscompt.type
          ) || "";

      }
      let linkData = param.vscompt.comptAttrs.mainLinkageData;
      let clickCell_element = null;
      if (['VeSankey', 'VeTree'].includes(param.vscompt.type) && param.label) {
        clickCell_element = param.vscompt.comptData.rows.find(item => {
          return item[param.vscompt.comptData.columns[0]] === param.label;
        })
        linkData = getFilteredData(
          param.vscompt.comptAttrs.mainLinkageData,
          'rel_element_id',
          clickCell_element.element_id
        )
        // // 外部链接页面条件
        // let opc = param.vscompt.comptAttrs["pageLinkageData"];
        // if (param.vscompt.comptAttrs["pageLinkageData"]) {
        //   param.vscompt.comptAttrs["pageLinkageData"] = getFilteredData(
        //     opc,
        //     'rel_element_id',
        //     clickCell_element.element_id
        //   )
        //   sessionStorage.setItem('pageLinkCondis', JSON.stringify(param.vscompt.comptAttrs["pageLinkageData"]));
        // }
      }
      dispatch("setCompLinkageCondi", {
        linkData: linkData,
        dim_value: dim_value,
        is_dim: is_dim
      });
      if (param.isJumpNewPage) {
        dispatch("checkIfOpenChildPage", {
          dim_value: dim_value,
          vscompt: param.vscompt,
          element_id: clickCell_element ? clickCell_element.element_id : ''
        });
      }
    },
    queryMapAreaInfo({
                       state,
                       getters,
                       rootState
                     }, param) {
      // return axios.post(rootState.renderEngine + '/area/queryAreaInfo', param)
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/area/queryAreaInfo',
        method: 'post',
        data: param
      })
    },
    // 设置联动页面查询组件参数
    setPageQueryParams({
                         state,
                         getters,
                         rootState
                       }) {
      let queryCompts = getters.getQueryCompts(); //当前页的查询条件

      // 取回上一个页面传过来的条件
      let lc = sessionStorage.getItem('pageLinkCondis');
      let pageLinkCondis = JSON.parse(lc || "{}");
      let curPageId = rootState.HomeBody.pageCache.pageId;
      if (state.PCDialogVisible) { //浮窗打开，应该用浮窗的页面ID
        curPageId = state.PCDialogPageInfo.pageId;
      }
      let curPageCondi = pageLinkCondis[curPageId] || [];
      let queryCondis = getQueryCondi(curPageId) || [];
      //   //回填前一页面的链接条件
      let pageParams = getters.getPageParams; //公共参数

      if (curPageCondi.length > 0 && pageParams.length > 0 &&
        queryCompts.length > 0 &&
        queryCondis.length > 0) {
        for (const comp1 of queryCompts) {
          for (const field of comp1.comptAttrs.fieldList || []) {
            for (let condi of queryCondis) {
              if (condi.compt_type != field.type) continue;
              let elementId = getMatchedElementId({
                pageParams: pageParams,
                rel_af_id: condi.rel_af_id,
                rel_element_id: condi.rel_element_id,
                af_id: field.comptAttrs.af_id
              });
              let fieldMap1 = queryFieldMap(field.type);
              // elnumber 如果num_list数组长度只一个，没有radioCalcu，要手动补上
              if (field.type == "ElNumber" && (condi.numList || []).length == 1) condi[fieldMap1.condiKey] = "0";
              //除elcascader查询组件外，其他组件都有是否默认值到设置，所以保险期间，都给他来个延时，保证条件不会丢
              if (
                elementId != "" &&
                elementId == field.comptAttrs.element_id &&
                JSON.stringify(fieldMap1) != "{}" &&
                (field.type == "ElInput" ? true : field.comptAttrs[fieldMap1.key] ==
                  condi[fieldMap1.condiKey])
              ) {
                setTimeout(() => {
                  for (const valueKey1 of fieldMap1.valueKey || []) {
                    if (field.type == "ElDatePicker" && valueKey1.keyName == "m_value") { //日期查询组件要根据源组件的时间格式和目标组件的时间格式进行转化一下，不然组件会报错
                      //条件时间格式的长度大于等于组件时间格式的长度才回填
                      if (condi.rel_show_format.length < field.comptAttrs.show_format.length) {
                        condi['m_value'] = ['', '']
                        field.comptAttrs['m_value'] = ['', '']
                      }
                      let valueArr = [];
                      condi[valueKey1.keyName].forEach(item1 => {
                        valueArr.push(dateFormatTrans({
                          sourceFormat: condi.rel_show_format,
                          targetFormat: field.comptAttrs.show_format,
                          source: item1
                        }) || "");
                      });
                      field.comptAttrs[
                        valueKey1.keyName
                        ] = valueArr;
                    } else {
                      if (valueKey1.isDeepClone) {
                        field.comptAttrs[
                          valueKey1.keyName
                          ] = objDeepCopy(condi[valueKey1.keyName]);
                      } else {
                        field.comptAttrs[valueKey1.keyName] =
                          condi[valueKey1.keyName];
                      }
                    }
                  }
                  if (field.type == "ElInput") { //补上symbol
                    field.comptAttrs.symbol =
                      condi.compt_symbol;
                  }
                }, 1000);
              }
            }
          }
        }
      }
    },
    batchSetMapSeriesData({
                            state,
                            getters,
                            dispatch
                          }, param) {
      let colsTotal = getters.getColsTotalAndData.colsTotal;
      let columnsData = getters.getColsTotalAndData.colsData;
      let columns = (state.activedCompt.comptData || {}).columns || [];
      for (var i = 1; i < columns.length; i++) {
        let idx = i - 1;
        //数据与标签
        let dataLab = state.activedCompt.comptAttrs.extendSetting["series." + idx + ".label.normal.map.show"] || false;
        //数据显示格式
        let format = state.activedCompt.comptAttrs.extendSetting["series." + idx + ".number.format"] || "{'smooth':false}";
        //地名
        let areaName = state.activedCompt.styleAttrs[1].children[1].value || false;
        //小数点
        let decimal = state.activedCompt.comptAttrs.extendSetting["series." + idx + ".decimalDigit"] || '0';
        let smooth = format;
        eval('smooth=' + format);
        let formatter = !dataLab ?
          (areaName ? "function(data){return data.name;}" : "") :
          (
            areaName ?
              (smooth.smooth ?
                  "function(data){let c; eval('c =' +JSON.stringify(" + JSON.stringify(columnsData[columns[i]]) + "));return data.name + ' : ' + (isNaN(data.value) ? '-' : parseFloat(c[data.name]*100/" + parseInt(colsTotal[columns[i]]) + ").toFixed(" + parseInt(decimal) + ")+'%');}" :
                  "function(data){let c; eval('c =' +JSON.stringify(" + JSON.stringify(columnsData[columns[i]]) + "));return data.name + ' : ' + (isNaN(data.value) ? '-' : parseFloat(c[data.name]).toFixed(" + parseInt(decimal) + "));}"
              ) :
              (smooth.smooth ?
                  "function(data){let c; eval('c =' +JSON.stringify(" + JSON.stringify(columnsData[columns[i]]) + "));return (isNaN(data.value) ? '-' : parseFloat(c[data.name]*100/" + parseInt(colsTotal[columns[i]]) + ").toFixed(" + parseInt(decimal) + ")+'%');}" :
                  "function(data){let" +
                  " c; eval('c =' +JSON.stringify(" + JSON.stringify(columnsData[columns[i]]) + "));return (isNaN(data.value) ? '-' : parseFloat(c[data.name]).toFixed(" + parseInt(decimal) + "));}"
              )
          );
        state.activedCompt.comptAttrs.extendSetting["series." + idx + ".label.normal.show"] = !dataLab && !areaName ? false : true;
        if (formatter != "")
          state.activedCompt.comptAttrs.extendSetting["series." + idx + ".label.normal.formatter"] = eval('(' + formatter + ')');
      }
    },
    ResetScatterSeriesData({
                             state,
                             getters,
                             dispatch
                           }, param) {
      let activedCompt = param != null && param.vscompt != null ? param.vscompt : state.activedCompt;
      //重置散点图中的数据data.value[2]
      //区域地图在系列,迁徙图在布局
      let styleIdx = ['VeAreaMap', 'VeBubbleMap'].includes(activedCompt.type) ? 2 : 1;
      let format = activedCompt.styleAttrs[styleIdx].children[3].value;
      let decimal = activedCompt.styleAttrs[styleIdx].children[4].value;
      let seriesName = ['VeAreaMap', 'VeBubbleMap'].includes(activedCompt.type) ? activedCompt.styleAttrs[2].children[0].value : activedCompt.comptAttrs.yAxis1Data[0].nick_name;
      let compData = getters.getColsTotalAndData;
      let tolCount = param != null && param.colsTotal != null ? param.colsTotal[state.paramVal || seriesName] : compData.colsTotal[state.paramVal || seriesName];
      let colsData = param != null && param.columnsData != null ? param.columnsData[seriesName] : (compData.colsData || {})[seriesName];
      let smooth = format;
      eval('smooth=' + format)
      let seriesData = activedCompt.comptAttrs.extendSetting.series[0].data || [];
      for (var i = 0; i < seriesData.length; i++) {
        for (let key in colsData) {
          if (key == seriesData[i].name) {
            seriesData[i].value[2] = smooth.smooth ? (tolCount == 0 ? 0 : parseFloat(colsData[key] * 100 / tolCount).toFixed(parseInt(decimal))) + '%' : parseFloat(colsData[key]).toFixed(parseInt(decimal));
            break;
          }
        }
      }
    },
    setComptsDevSeriesData({
                             state,
                             dispatch,
                             rootState
                           }, param) {
      let idxParam = {
        "parantName": "seriesAttrs",
        "childrenName": "seriesData"
      };
      dispatch('getStyleAttrIndex', idxParam);
      // 如果样式中包含系列设置
      if (state.styleAttrsIndex && state.styleAttrsIndex.length > 1) {
        let array = state.activedCompt.comptAttrs.yAxis1Data.concat(state.activedCompt.comptAttrs.yAxis2Data || []);
        let datasetMap = rootState.AnalyReportAttr.datasetMap;
        let result = constructList(array, datasetMap, state.activedCompt.comptAttrs.computedData || []);
        if(result.resultList && result.resultList.length != 0) {
          state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].options = [];
          for (let i = 0; i < result.resultList.length; i++) {
            let obj = {
              "label": result.resultList[i].element_name,
              "value": result.resultList[i].element_id
            }
            state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].options.push(obj);
          }
        }
        // 默认选中
        state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].value = result.resultList[0].element_id;
      }
    },
    setChartSeriesDate({
                         state,
                         getters,
                         dispatch,
                         rootState
                       }, param) {
      var array = state.activedCompt.comptAttrs.yAxis1Data.concat(state.activedCompt.comptAttrs.yAxis2Data || []);
      var datasetMap = rootState.AnalyReportAttr.datasetMap;
      var result = constructList(array, datasetMap, state.activedCompt.comptAttrs.computedData || []);
      var idxParam = {
        "parantName": "seriesAttrs",
        "childrenName": "comptData"
      };
      dispatch('getStyleAttrIndex', idxParam);
      var colorArray = ["#19d4ae",
        "#5ab1ef",
        "#fa6e86",
        "#ffb980",
        "#0067a6",
        "#c4b4e4",
        "#d87a80",
        "#9cbbff",
        "#d9d0c7",
        "#87a997",
        "#d49ea2",
        "#5b4947",
        "#7ba3a8"];
      if (result.resultList && result.resultList.length != 0) {
        state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].options = [];
        // 如果包含图例字段，不从result 里面取 columns
        const xAxisData = state.activedCompt.comptAttrs.xAxisData || []
        let flag = false
        if (state.activedCompt.comptAttrs.setting._legendColTitle) {
          xAxisData.some(item => {
            if (item.isNewSetting === '_legend') {
              flag = true
              return true
            }
          })
        }
        const columns = [...state.activedCompt.comptData.columns].splice(1)
        /* 有图例维度_legendColTitle */
        if (flag) {
          const len = columns.length
          for (let i = 0; i < len; i++) {
            let obj = {
              "label": columns[i],
              "value": columns[i]
            }
            state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].options.push(obj);
            if (state.activedCompt.comptAttrs.colSetting[columns[i]] == undefined) {
              state.activedCompt.comptAttrs.colSetting[columns[i]] = {}
              //保存系列设置有的属性
              let styletemp = state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children;
              for (let j = 0; j < styletemp.length; j++) {
                state.activedCompt.comptAttrs.colSetting[columns[i]][styletemp[j].enName] = j === 0 ? columns[i] : styletemp[j].value
                if (['VeCombineChart', 'VeCombineStack'].includes(state.activedCompt.type)) {
                  var yAxis2 = state.activedCompt.comptAttrs.yAxis2Data;
                  for (var y = 0; y < yAxis2.length; y++) {
                    let yCol = columns[i].split('-').reverse()[0]
                    if (yCol.includes(yAxis2[y].nick_name)) {
                      let typeflag = 'line';
                      state.activedCompt.comptAttrs.colSetting[columns[i]]['series.index.type'] = typeflag;
                      break;
                    }
                  }
                }

                //初始化系列中的图形颜色
                if(styletemp[j].enName === "series.index.itemStyle.normal.color"){
                  state.activedCompt.comptAttrs.colSetting[columns[i]]['series.index.itemStyle.normal.color'] = i>12 ? colorArray[i%13] : colorArray[i];
                }
              }
            } else {
              //原有的度量 清空extend里面的系列设置 把colsetting字段里的样式带入
              let extend = state.activedCompt.comptAttrs.extendSetting;
              for (let key in extend) {
                if (key.includes('series') && typeof extend[key] != 'object' && !key.includes('symbolSize') && !key.includes('series.type')) {//组合图、折线图、折线面积图、堆叠面积图，有线条样式设置series:{smooth:false}，保留原设置，线条样式不清空
                  delete state.activedCompt.comptAttrs.extendSetting[key]
                }
              }
            }
          }
        } else {
          // 无图例走原先判断
          for (let i = 0; i < result.resultList.length; i++) {
            let obj
            if (state.activedCompt.type == 'VeRadar') {
              obj = {
                "label": result.resultList[i].label,//col_chs_name,
                "value": result.resultList[i].label,//col_chs_name
              }
            } else {
              obj = {
                "label": result.resultList[i].label,//col_chs_name,
                "value": result.resultList[i].element_id
              }
            }
            state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].options.push(obj);

            //雷达图新增的度量 添加colsetting字段
            if (state.activedCompt.type == 'VeRadar') {
              if (state.activedCompt.comptAttrs.colSetting[result.resultList[i].col_chs_name] == undefined) {

                state.activedCompt.comptAttrs.colSetting[result.resultList[i].col_chs_name] = {}
                //保存系列设置有的属性
                let styletemp = state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children;
                for (let j = 0; j < styletemp.length; j++) {
                  state.activedCompt.comptAttrs.colSetting[result.resultList[i].col_chs_name][styletemp[j].enName] = styletemp[j].value


                  let legendData = state.activedCompt.comptAttrs.colSetting['legendData'];
                  if (legendData == undefined) state.activedCompt.comptAttrs.colSetting['legendData'] = {};
                  if (legendData != undefined && !legendData[result.resultList[i].col_chs_name]) {
                    legendData[result.resultList[i].col_chs_name] = {
                      dot: 0,
                      name: result.resultList[i].col_chs_name
                    }
                  }
                }

              } else {
                //原有的度量 清空extend里面的系列设置 把colsetting字段里的样式带入
                let extend = state.activedCompt.comptAttrs.extendSetting;
                for (let key in extend) {
                  if (key == 'legendData') {
                    delete state.activedCompt.comptAttrs.extendSetting[key]
                  }

                  if (key == 'color') {
                    state.activedCompt.comptAttrs.extendSetting[key] = colorArray
                  }
                }


              }
            } else {
              //非雷达图新增的度量 添加colsetting字段
              const colElementId = result.resultList[i].element_id;
              if (state.activedCompt.comptAttrs.colSetting[colElementId] == undefined) {
                router.app.$set(state.activedCompt.comptAttrs.colSetting, colElementId, {});
                //保存系列设置有的属性
                let styletemp = state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children;
                // 存储度量原始名称
                router.app.$set(state.activedCompt.comptAttrs.colSetting[colElementId], 'oriName', result.resultList[i].label || '');
                for (let j = 0; j < styletemp.length; j++) {
                  if(state.newStyleSetCompts.includes(state.activedCompt.type)) {
                    router.app.$set(state.activedCompt.comptAttrs.colSetting[colElementId], styletemp[j].enName, styletemp[j].value);
                  } else {
                    state.activedCompt.comptAttrs.colSetting[result.resultList[i].element_id][styletemp[j].enName] = styletemp[j].value
                  }
                  //初始化系列中的图形颜色
                  if(styletemp[j].enName === "series.index.itemStyle.normal.color"){
                    state.activedCompt.comptAttrs.colSetting[result.resultList[i].element_id]['series.index.itemStyle.normal.color'] = i>12 ? colorArray[i%13] : colorArray[i];
                  }
                  if (['VeCombineChart', 'VeCombineStack'].includes(state.activedCompt.type)) {
                    let yAxis2 = state.activedCompt.comptAttrs.yAxis2Data;
                    for (let y = 0; y < yAxis2.length; y++) {
                      if (result.resultList[i].element_id == yAxis2[y].element_id) {
                        let typeflag = 'line';
                        state.activedCompt.comptAttrs.colSetting[result.resultList[i].element_id]['series.index.type'] = typeflag
                        break;
                      }
                    }
                  } else if (['VeScatter', 'Scatter'].includes(state.activedCompt.type)) {
                    if (j === 0) {
                      state.activedCompt.comptAttrs.colSetting[result.resultList[i].element_id][styletemp[j].enName] = result.resultList[i].label
                    } else {
                      state.activedCompt.comptAttrs.colSetting[result.resultList[i].element_id][styletemp[j].enName] = ''
                    }
                  }
                }

              } else {
                //原有的度量 清空extend里面的系列设置 把colsetting字段里的样式带入
                let extend = state.activedCompt.comptAttrs.extendSetting;
                for (let key in extend) {
                  if (key.includes('series') && typeof extend[key] != 'object' && !key.includes('symbolSize') && !key.includes('series.type')) {//组合图、折线图、折线面积图、堆叠面积图，有线条样式设置series:{smooth:false}，保留原设置，线条样式不清空
                    delete state.activedCompt.comptAttrs.extendSetting[key]
                  }
                }
              }
            }
          }
          //从colsetting赋值extend
          if (state.activedCompt.type == "VeRadar") {
            for (let z = 0; z < result.resultList.length; z++) {
              if (z < 13) {
                let radarcolor = state.activedCompt.comptAttrs.colSetting[result.resultList[z]['col_chs_name']]['series.index.itemStyle.normal.color']
                if (radarcolor != "" && radarcolor != colorArray[z]) {
                  colorArray[z] = radarcolor
                }

              } else {
                colorArray[z].push(state.activedCompt.comptAttrs.colSetting[result.resultList[z]['col_chs_name']]['series.index.itemStyle.normal.color'])
              }
            }
          }

          // 气泡图 tooltip处理
          if(['Scatter', 'VeScatter'].includes(state.activedCompt.type)) {
            const columns = state.activedCompt.comptData.columns;
            let colsObj = Object.values(state.activedCompt.comptAttrs.colSetting)
            const comptId = state.activedCompt.comptId
            state.activedCompt.comptAttrs.extendSetting["series.0.tooltip.trigger"] = 'item';

            state.activedCompt.comptAttrs.extendSetting["tooltip.formatter"] = function(params) {
              let res = params.marker + params.seriesName+'<br />';
              let obj = {};
              columns.reduce((cur, next, index) => {
                if (obj[next] === undefined) {
                  if (state.activedCompt.comptId === comptId) {
                    colsObj = Object.values(state.activedCompt.comptAttrs.colSetting)
                  }
                  const colObj = colsObj.filter(o => o.comptData === next)[0] || {}
                  const name = colObj['series.index.name'] || next
                  obj[next] = index + ''
                  cur.push(next)
                  const value = (params.data.value[index]||'0').replace(/(?=\B(?:\d{3})+\b)(\d{3}(?:\.\d+$)?)/g,',$1');
                  res += '<span>' + name + '：' + value +'<br />' + '</span>'
                }
                return cur
              }, []);
              return res;
            }
          }
        }
        // 整体的系列标签显示状态
        let layoutattr = state.activedCompt.styleAttrs.find(attr => {
          return attr.enName === 'layoutAttrs';
        })
        let allSeriesLabelShow = layoutattr.children ? (layoutattr.children.find(layout => {
          return layout.enName === 'series.index.label.normal.show';
        }) || {}) : {};
        const len = flag ? columns.length : result.resultList.length
        for (let k = 0; k < len; k++) {
          if (state.activedCompt.type == "VeRadar") {
            state.activedCompt.comptAttrs.extendSetting["color"] = colorArray
            state.activedCompt.comptAttrs.extendSetting["legendData"] = objDeepCopy(state.activedCompt.comptAttrs.colSetting['legendData']);
          } else if (state.activedCompt.type !== "VeScatter" && state.activedCompt.type !== "Scatter" && state.activedCompt.type !== "PcIndicatorTrend") {
            let styleobj
            if (flag) {
              styleobj = state.activedCompt.comptAttrs.colSetting[columns[k]] || []
            } else {
              styleobj = state.activedCompt.comptAttrs.colSetting[result.resultList[k].element_id] || []
            }
            if (allSeriesLabelShow.value) {
              styleobj['series.label.normal.show'] = allSeriesLabelShow.value;
            }
            if (styleobj['series.index.name,legend.data.index'] != "") {
              if (state.activedCompt.type === 'VeWaterfall') {
                state.activedCompt.comptAttrs.extendSetting["series.0.name"] = '';
                // state.activedCompt.comptAttrs.extendSetting["legend.data.0"] = '';
                state.activedCompt.comptAttrs.extendSetting["series.1.name"] = styleobj['series.index.name,legend.data.index'];
                // state.activedCompt.comptAttrs.extendSetting["legend.data.1"] = styleobj['series.index.name,legend.data.index'];
              } else {
                state.activedCompt.comptAttrs.extendSetting["series." + k + ".name"] = styleobj['series.index.name,legend.data.index'];
                state.activedCompt.comptAttrs.extendSetting["legend.data." + k] = styleobj['series.index.name,legend.data.index'];
              }
            } else {
              let name = flag ? columns[k] : result.resultList[k].label||result.resultList[k].col_chs_name;
              if (state.activedCompt.type === 'VeWaterfall') {
                state.activedCompt.comptAttrs.extendSetting["series.0.name"] = '';
                // state.activedCompt.comptAttrs.extendSetting["legend.data.0"] = '';
                state.activedCompt.comptAttrs.extendSetting["series.1.name"] = name;
                // state.activedCompt.comptAttrs.extendSetting["legend.data.1"] = name;
              } else {
                state.activedCompt.comptAttrs.extendSetting["series." + k + ".name"] = name;
                state.activedCompt.comptAttrs.extendSetting["legend.data." + k] = name;
                // lbs地图初始化图例标题
                if (['VeBmap', 'VeLinesBmap', 'VeHeatBmap'].includes(state.activedCompt.type)) {
                  state.activedCompt.comptAttrs.extendSetting.title.text = name;
                }
              }
            }
            if (!['VeBmap', 'VeLinesBmap', 'VeHeatBmap'].includes(state.activedCompt.type)) {
              state.activedCompt.comptAttrs.extendSetting["series." + k + ".type"] = styleobj['series.index.type'] || state.activedCompt.comptAttrs.extendSetting['series.type'];
            }
            // state.activedCompt.comptAttrs.extendSetting["series." + k + ".itemStyle.normal.color"] = styleobj['series.index.itemStyle.normal.color'];
            state.activedCompt.comptAttrs.extendSetting["series." + k + ".itemStyle.normal.color"] = colorArray[k];
            state.activedCompt.comptAttrs.extendSetting["series." + k + ".label.normal.show"] = styleobj['series.label.normal.show'];
            state.activedCompt.comptAttrs.extendSetting["series." + k + ".markPoint"] = styleobj['series.index.markPoint'];
            state.activedCompt.comptAttrs.extendSetting["series." + k + ".barWidth"] = styleobj['series.index.barWidth'];
            if (styleobj['series.index.markPoint']) {
              var obj = {
                data: [{ 'name': '最大值', 'type': 'max' }, { 'name': '最小值', 'type': 'min' }]
              }
              state.activedCompt.comptAttrs.extendSetting["series." + k + ".markPoint"] = obj
            }
            //柱图形状
            if(["VeBar","VeCombineChart","VeHistogram"].includes(state.activedCompt.type)){
              let parantName = state.activedCompt.type == "VeCombineChart" ? "styleAttrs" : "layoutAttrs";
              idxParam = {
                "parantName": parantName,
                "childrenName": "series.index.itemStyle.normal.barBorderRadius"
              };
              dispatch('getStyleAttrIndex', idxParam);
              let barBorderRadius = state.activedCompt.styleAttrs[state.styleAttrsIndex[0]].children[state.styleAttrsIndex[1]].value
              state.activedCompt.comptAttrs.extendSetting["series." + k + ".itemStyle.normal.barBorderRadius"] = eval("(" + barBorderRadius + ")");
            }
            if (state.activedCompt.type == "VeWaterfall") {
              state.activedCompt.comptAttrs.extendSetting["series.1.label.normal.position"] = "top";
              state.activedCompt.comptAttrs.extendSetting["series.1.barWidth"] = styleobj['series.index.barWidth'];
            }

          }

          if(state.activedCompt.type == "VeHistogram") {
            state.activedCompt.comptAttrs.extendSetting["series." + k + ".label.normal.position"] = "top";
          }
          if (state.activedCompt.type == "VeBar") {
            state.activedCompt.comptAttrs.extendSetting["series." + k + ".label.normal.position"] = "right";
          }

          //默认回显第一个字段
          if (k == 0) {
            let element_id = result.resultList[k].element_id
            if (flag) {
              element_id = columns[k]
            }
            let styleobj = state.activedCompt.comptAttrs.colSetting[element_id]
            let barWidth = state.activedCompt.type == 'VeRadar' ? "" : String(styleobj['series.index.barWidth']);
            if (barWidth && barWidth.indexOf("%") != -1) {
              barWidth = barWidth.slice(0, -1);
            } else if (barWidth && barWidth.indexOf("px") != -1) {
              barWidth = barWidth.slice(0, -2);
            }
            if (['VeCombineStack','VeCombineChart'].includes(state.activedCompt.type)) {
              state.activedCompt.styleAttrs[4].children[0].value = element_id;
              state.activedCompt.styleAttrs[4].children[1].value = styleobj['series.index.name,legend.data.index'];
              state.activedCompt.styleAttrs[4].children[3].value = barWidth;
              state.activedCompt.styleAttrs[4].children[4].value = styleobj['series.index.itemStyle.normal.color'];
              state.activedCompt.styleAttrs[4].children[5].value = styleobj['series.label.normal.show'];
              state.activedCompt.styleAttrs[4].children[6].value = styleobj['series.index.markPoint'];
            } else if (state.activedCompt.type == 'VeLine' || state.activedCompt.type == 'VeLineArea' || state.activedCompt.type == 'VeStackLineArea' || state.activedCompt.type == 'VePercentStackLineArea') {
              state.activedCompt.styleAttrs[4].children[0].value = element_id;
              state.activedCompt.styleAttrs[4].children[1].value = styleobj['series.index.name,legend.data.index'];
              state.activedCompt.styleAttrs[4].children[2].value = styleobj['series.index.itemStyle.normal.color'];
              state.activedCompt.styleAttrs[4].children[3].value = styleobj['series.label.normal.show'];
              state.activedCompt.styleAttrs[4].children[4].value = styleobj['series.index.markPoint'];
            } else if (['VeWaterfall'].includes(state.activedCompt.type)) {
              state.activedCompt.styleAttrs[3].children[0].value = element_id;
              state.activedCompt.styleAttrs[3].children[2].value = barWidth;
            } else if (['VeStackBar', 'VeBar', 'VeStackHistogram', 'VePercentStackHistogram', 'VeHistogram', 'VePercentStackBar'].includes(state.activedCompt.type)) {
              state.activedCompt.styleAttrs[3].children[0].value = element_id;
              state.activedCompt.styleAttrs[3].children[1].value = styleobj['series.index.name,legend.data.index'];
              state.activedCompt.styleAttrs[3].children[2].value = barWidth;
              state.activedCompt.styleAttrs[3].children[3].value = styleobj['series.index.itemStyle.normal.color'];
              state.activedCompt.styleAttrs[3].children[4].value = styleobj['series.label.normal.show'];
              state.activedCompt.styleAttrs[3].children[5].value = styleobj['series.index.markPoint'];
            }  else if (state.activedCompt.type == 'VeRadar') {
              var radarStyleObj = state.activedCompt.comptAttrs.colSetting[result.resultList[k].col_chs_name]
              state.activedCompt.styleAttrs[2].children[0].value = result.resultList[k].col_chs_name;
              if (state.activedCompt.comptAttrs.colSetting['legendData'][result.resultList[k].col_chs_name]['name'] == result.resultList[k].col_chs_name) {
                state.activedCompt.styleAttrs[2].children[1].value = ""
              } else {
                state.activedCompt.styleAttrs[2].children[1].value = state.activedCompt.comptAttrs.colSetting['legendData'][result.resultList[k].col_chs_name]['name']
              }
              if (state.activedCompt.comptAttrs.colSetting['legendData'][result.resultList[k].col_chs_name]['dot'] == 0) {
                state.activedCompt.styleAttrs[2].children[2].value = "无"
              } else {
                state.activedCompt.styleAttrs[2].children[2].value = state.activedCompt.comptAttrs.colSetting['legendData'][result.resultList[k].col_chs_name]['dot']
              }

              if (radarStyleObj['series.index.itemStyle.normal.color'] != "") {
                state.activedCompt.styleAttrs[2].children[3].value = radarStyleObj['series.index.itemStyle.normal.color'];
              } else {
                state.activedCompt.styleAttrs[2].children[3].value = colorArray[k]
              }
            } else if (['VeScatter','Scatter'].includes(state.activedCompt.type)) {
              state.activedCompt.styleAttrs[3].children[0].value = result.resultList[k].element_id;
              let value = state.activedCompt.styleAttrs[3].children[1].value
              if (result.resultList[k].element_id === element_id) {
                value = styleobj['series.index.name'] || ''
              }
              state.activedCompt.styleAttrs[3].children[1].value = value
            } else if (['VeBubbleMap', 'VeBmap', 'VeLinesBmap', 'VeHeatBmap', 'PcIndicatorTrend'].includes(state.activedCompt.type)) {
              // 默认回显第一个系列字段的设置，这边只负责回显设置值
              const seriesSetEnName = 'seriesAttrs'; // 系列设置英文名
              const seriesSetChildren = (state.activedCompt.styleAttrs.find(attrItem => attrItem.enName === seriesSetEnName) || {}).children;
              (seriesSetChildren || []).forEach((setItem1, index) => {
                // 第一个是系列下拉选项
                if (index === 0) {
                  seriesSetChildren[index].value = element_id;
                } else {
                  seriesSetChildren[index].value = styleobj[setItem1.enName]
                }
              })
            }
          }

          /* if (state.activedCompt.type == 'VeLine'
              || state.activedCompt.type == 'VeLineArea'
              || state.activedCompt.type == 'VeStackLineArea') {
              state.activedCompt.comptAttrs.extendSetting["series." + k + ".type"] = 'line'
            }

            if (state.activedCompt.type == 'VeStackBar' || state.activedCompt.type == 'VeBar' || state.activedCompt.type == 'VeStackHistogram' || state.activedCompt.type == 'VeHistogram') {
              state.activedCompt.comptAttrs.extendSetting["series." + k + ".type"] = 'bar'
            }

            if (state.activedCompt.type == 'VeRadar') {
              state.activedCompt.comptAttrs.extendSetting["series." + k + ".type"] = 'radar'
              // state.activedCompt.comptAttrs.extendSetting["color"] = state.activedCompt.comptAttrs.colSetting['seriesColor']['color']
              // state.activedCompt.comptAttrs.extendSetting["legendData"] = objDeepCopy(state.activedCompt.comptAttrs.colSetting['legendData'])
            } */
          if (['VeLine', 'VeLineArea', 'VeStackLineArea', 'VePercentStackLineArea', 'VeStackBar', 'VeBar', 'VeStackHistogram', 'VePercentStackHistogram', 'VeRadar', 'VeScatter', 'Scatter', 'VeWaterfall','VePercentStackBar'].includes(state.activedCompt.type)) {
            let stype = state.activedCompt.comptAttrs.extendSetting['series.type']
            state.activedCompt.comptAttrs.extendSetting["series." + k + ".type"] = stype
          }
        }

        if (["VeScatter","Scatter"].includes(state.activedCompt.type) && state.activedCompt.styleAttrs[2].children[1].value) {
          // 有图例维度 则按照该字段条数
          let len = Object.keys(state.activedCompt.comptData.rows).length
          for (let k = 0; k < len; k++) {
            router.app.$set(state.activedCompt.comptAttrs.extendSetting, "series." + k + ".label.normal.show", state.activedCompt.styleAttrs[2].children[1].value)
          }
        }

      }

    },
    addTemplate({ //新增模板
                  state,
                  commit,
                  rootState
                }, param) {
      return service({
        maskOff: true,
        method: "post",
        url: rootState.renderEngine + '/template/publishTemplate',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId,
          "X-TenantId": sessionStorage.getItem("tenant_id")
        }
      })
    },
    queryTemplate({ state, commit, rootState }, param) {  //查询模板列表
      return service({
        maskOff: true,
        method: "post",
        url: rootState.renderEngine + '/template/queryTemplateList',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId,
        }
      })
    },
    deleteTemplate({ state, commit, rootState }, param) { //删除模板
      return service({
        maskOff: true,
        method: "post",
        url: rootState.renderEngine + '/template/deleteTemplates',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId,
        }
      })
    },
    applyTemplate({ state, commit, rootState }, param) { //应用模板
      return service({
        maskOff: true,
        method: "post",
        url: rootState.renderEngine + '/template/appTemplate',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId,
        }
      })
    },
    // 对于有绑定数据的组件，点击默认展示数据面板，对于只有样式设置的组件默认展示样式面板
    refreshRightPanel({ state, getters, dispatch }) {
      let activedCompt = getters.getActivedCompt;
      if (activedCompt && activedCompt.comptAttrs) {
        if (activedCompt.comptAttrs.isBindData == "0") {
          setTimeout(() => {
            dispatch("setActiveName", "style");
          }, 0);
        } else {
          if ((activedCompt.afId || "").trim() == "") {
            //初次拖进来，还没绑定数据才切到数据
            setTimeout(() => {
              dispatch("setActiveName", "attr");
            }, 0);
          }
          if (!getters.isAdvanceSetVis && state.activeName === "interaction") {
            setTimeout(() => {
              dispatch("setActiveName", "attr");
            }, 0);
          }
        }
      }
    },
    gotoPage({ state, commit, dispatch, rootState }, param) {
      let pageCache = rootState.HomeBody.pageCache;
      if (pageCache.operation == "preview") {
        if (param.pageId && param.urlType == "1") {
          let pageCacheBak = objDeepCopy(pageCache);
          let pageInfo = state.pageList.filter(item => {
            return item.pageId == param.pageId;
          });
          if(pageInfo[0].pageType == 1) {  //打开新页面
            pageInfo[0]["operation"] = "preview";
            sessionStorage.setItem("store", JSON.stringify(rootState));
            sessionStorage.setItem("pageCache", JSON.stringify(pageInfo[0]));
            let routeData = router.resolve({
              name: "pageView"
            });
            window.open(routeData.href, "_blank");
            sessionStorage.setItem("pageCache", JSON.stringify(pageCacheBak));
          } else { //打开弹窗
            state.PCDialogPageInfo = pageInfo[0];
            state.PCDialogVisible = true;
          }
        } else if (param.urlType == "2" && param.comptUrl != "") {
          let url = param.comptUrl.indexOf("http://") == -1 ? "http://" + param.comptUrl : param.comptUrl;
          window.open(url);
        }
      }
    },
    getCompLists({ state, rootState }, param) {
      return service({
        maskOff: true,
        method: "post",
        url: rootState.renderEngine + '/comp/getCompLists',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId,
        }
      })
    },
    qryStyleAttrs({state,rootState}, param) {
      return service({
        maskOff: true,
        method: "post",
        url: rootState.renderEngine + '/comp/qryStyleAttrs',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId,
        }
      })
    },
    queryPageSettingList({state,rootState}, param) {
      return service({
        maskOff: true,
        method: "post",
        url: rootState.renderEngine + '/pagesetting/queryPageSettingList',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId,
        }
      })
    },
    /**
     * 处理散点图、气泡图 数据
     * vchatrs约定：
     * 1.数组的第一项（默认为 columns[1]）展示为纵轴，第二项（默认为 columns[2]）展示为散点大小。
     * 2.metrics 数组的第一项（默认为 columns[1]）展示为纵轴，第二项（默认为 columns[2]）展示为散点大小。
     * 图例展示数据格式为：（上海北京 为图例）
     * rows: { '上海':[],'北京':[] }
     *
     * this..selectedDataObj.legendDimData.label 维度 名称
     */
    handleScatterData(state, [respData, vscompt, activedCompt]) {
      let colObj = {}
      let {rows = [], columns} = respData
      let legendDimData
      let selectedMeasureData
      let sizeMeasureData
      let label = 'label'
      let drillName
      if (activedCompt !== undefined) { // 新charts加载
        legendDimData = vscompt.legendDimData || []
        selectedMeasureData = vscompt.xMeasureData || []
        sizeMeasureData = vscompt.sizeMeasureData || []
        drillName = columns[0]
      } else {
        legendDimData = (vscompt.comptAttrs.xAxisData || []).filter(item => item.isNewSetting)
        selectedMeasureData = (vscompt.comptAttrs.yAxis1Data || []).filter(item => item.isNewSetting === 'xMeasure')
        sizeMeasureData = (vscompt.comptAttrs.yAxis1Data || []).filter(item => item.isNewSetting === 'sizeMeasure')
        label = 'nick_name'
        const drill = [...vscompt.comptAttrs.drillWBeanList].reverse()
        drill.length > 0 ? drillName = drill[0].item.label : null
      }
      let legendName = (legendDimData[0]||{})[label]
      // let tempName = legendName
      let index = columns.indexOf(legendName)
      if (index > -1) {
        columns.splice(index, 1)
      } else {
        index = columns.indexOf(drillName)
        index > -1 ? columns.splice(index, 1) : null
        // tempName = drillName
      }
      let dimension = (selectedMeasureData[0]||{})[label]// x轴
      let sizeLabel = (sizeMeasureData[0]||{})[label] || ''
      if (sizeLabel !== '') {
        columns.splice(2, 0, sizeLabel)
      }
      let columns1 = columns;
      //解决分析报告手机端气泡图回显问题
      if (dimension === undefined) {
        dimension = (legendDimData[1]||{})[label]
      }
      columns = [...new Set([dimension, ...columns])]
      if(columns1[1] == columns1[2] || columns1[0] == columns1[2]){
        columns.splice(2,0,sizeLabel)
      }
      let flag = false
      if (columns.length === 2) {
        flag = true
        // columns.push(tempName)
      }
      rows = rows || []
      for(let row of rows) {
        let name = row[legendName] || row[drillName] // 下钻之后无法取到legendName
        if (!flag) {
          delete row[legendName]
        }
        if (colObj[name]) {
          colObj[name].push(row)
        } else {
          colObj[name] = [row]
        }
      }
      let data = {
        rows: colObj,
        columns
      }
      return data
    },
    batchSetLinesStyle({state}, param){
      /**
       * 迁徙图的路线，n个起点n个图例
       * 所以需要批量设置series[index].type === lines的样式
       */
      let series = state.activedCompt.comptAttrs.extendSetting.series;
      if (param.key.indexOf(".") > -1){
        let keys = param.key.split(".");
        if(param.key === "label.normal.color"){
          //字体颜色
          series[0][keys[0]][keys[1]][keys[2]] = param.val;
        } else {
          for (let i = state.activedCompt.type === 'VeLinesBmap'? 0 : 3; i < series.length; i++) {
            //param.key=xxx.xxx
            if(keys.length === 2){
              state.activedCompt.comptAttrs.extendSetting.series[i][keys[0]][keys[1]] = param.val;
            } else {
              state.activedCompt.comptAttrs.extendSetting.series[i][keys[0]][keys[1]][keys[2]] = param.val;
            }
            state.activedCompt.comptAttrs.extendSetting.series[i]["id"] = Math.random();
          }
        }
      } else {
        // 设置边框颜色,区域颜色默认值
        let value = param.val ? param.val : (param.key === "borderColor" ? "rgba(255,255,255,0.6)" : "#00366f")
        if (state.activedCompt.type === "PcTextarea" || state.activedCompt.type === "ElImage" || state.activedCompt.type === "HdButton" || state.activedCompt.type === "HdTextarea") {
          state.activedCompt.comptAttrs.extendSetting[param.key] = value;
        } else {
          state.activedCompt.comptAttrs.extendSetting.geo.itemStyle.normal[param.key] = value;
        }
      }
    },
    setTopValueLines({state},param){
      let value = state.activedCompt.comptData.rows.length <= value ? state.activedCompt.comptData.rows.length : param.val;
      let series = state.activedCompt.comptAttrs.extendSetting.series;
      if(series.length <= 3){
        return;//如果当前迁徙图没有lines,或者当前设置的top n大于结果集的长度,直接返回
      }
      let linesItem = series[3];//保留lines其他属性设置
      let features = [];
      if (state.activedCompt.comptAttrs.mapLevel == "1") {
        features = (require("@/../public/echarts-map-geo/province/" + state.activedCompt.comptAttrs.mapArea + ".json") || {}).features || [];
      } else if (state.activedCompt.comptAttrs.mapLevel == "2") {
        features = (require("@/../public/echarts-map-geo/city/" + state.activedCompt.comptAttrs.mapArea.replace(/(['一',('县市')])/gi, "") + ".json") || {}).features || [];
      }
      //坐标集合
      let properties = {};
      for (var i = 0; i < features.length; i++) {
        properties[features[i].properties.name] = features[i].properties.cp;
      }
      let rows = objDeepCopy(state.activedCompt.comptData.rows) || [];
      let property = state.activedCompt.comptData.columns[2];
      //对rows重新排序
      let compare = function(property){
        return function(a,b){
          var value1 = a[property];
          var value2 = b[property];
          return value1 - value2;
        }
      }
      let rowsSort = rows.sort(compare(property)).reverse();
      let legendData = {};
      let legendNames = [];// 图例
      //取rows top n
      rowsSort.splice(value);
      let columns = objDeepCopy(state.activedCompt.comptData.columns) || [];
      for(let i=0;i<rowsSort.length;i++){
        let fromName = rowsSort[i][columns[0]]; //迁出
        let toName = rowsSort[i][columns[1]];//迁入
        let item = {
          fromName : fromName,
          toName : toName,
          coords : [properties[fromName],properties[toName]],
          value : rowsSort[i][columns[2]]
        }
        if(legendData[fromName]){
          legendData[fromName].push(item);
        }else{
          legendNames.push(fromName);
          legendData[fromName] = [item];
        }
      }
      //设置图例
      state.activedCompt.comptAttrs.extendSetting.legend.data = legendNames;
      let linesSeries = [];
      if(linesItem["id"]) delete linesItem["id"];
      for(let key in legendData){
        let lines = objDeepCopy(linesItem);
        lines.data = legendData[key];
        lines.name = key;
        linesSeries.push(lines);
      }
      if(series[0]["id"]) delete series[0]["id"];
      series = series.splice(0,3);
      state.activedCompt.comptAttrs.extendSetting.series = series.concat(linesSeries);
    }
  }
}

export default PageDesign
