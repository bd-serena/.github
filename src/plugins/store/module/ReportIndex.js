import axios from 'axios';
import {service} from 'ngbd-utils'

const ReportIndex = {
  namespaced: true,
  state: {
    tableData: {
      total: 0,
      list: []
    },
    catalogId: '',
    catalogLevel: '',
    classtypeId: 1002,
    pageCache: null,
  },
  getters: {},
  mutations: {
    setTableData(state, {total, list}) {
      state.tableData.total = total;
      state.tableData.list = list;
    },
    setPageCache(state, param) {
      state.pageCache = param;
    }
  },
  actions: {
    queryDataSet({state, rootState}, param) {
      // return axios.post(rootState.renderEngine + '/dataSet/getDataSetListByCatalogId', param);
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/dataSet/getDataSetListByCatalogId',
        method: 'post',
        data: param
      })
    },
    queryTableData({state, rootState}, param) {
      //现为即席查询结果信息
      // return axios.post(rootState.renderEngine + '/list/queryPageInfoList', param);
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/list/queryPageInfoList',
        method: 'post',
        data: param
      })
    },
    saveAsPage({state, rootState}, param) {
      // return axios.post(rootState.renderEngine + '/saveAsPage', param);
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/saveAsPage',
        method: 'post',
        data: param
      })
    },
    updatePageInfo({state, rootState}, param) {
      // return axios.post(rootState.renderEngine + '/list/updatePageInfo', param);
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/list/updatePageInfo',
        method: 'post',
        data: param
      })
    },
    deletePageInfo({state, rootState}, param) {
      // return axios.post(rootState.renderEngine + '/list/deletePageInfo', param);
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/list/deletePageInfo',
        method: 'post',
        data: param
      })
    },
    pubPageInfo({state, rootState}, param) {
      // return axios.post(rootState.renderEngine + '/list/pubPageInfo', param);
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/list/pubPageInfo',
        method: 'post',
        data: param
      })
    },
    setReportCatalog({state}, {id, level, cid}) {
      // console.info("ok");
      if (id == '' || id == undefined) {
        state.catalogId = 'myfold';
      } else {
        state.catalogId = id;
      }
      state.catalogLevel = level;
      state.classtypeId = cid;
    },
    setPageCache({state, commit}, param) {
      commit('setPageCache', param);
    },
    savePageAndDetail({state, rootState}, param) {
      // return axios.post(rootState.renderEngine + '/savePageAndDetail', param);
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/savePageAndDetail',
        method: 'post',
        data: param
      })
    },
    updatePageAndDetail({state, rootState}, param) {
      // return axios.post(rootState.renderEngine + '/updatePageAndDetail', param);
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/updatePageAndDetail',
        method: 'post',
        data: param
      })
    },
    /*
    exportPageZip({ state, rootState }, param) {
      return service({
        maskOff: true,
        method: 'post',
        url: rootState.renderEngine + '/export/exportPageZip',
        data: param,
        responseType: 'blob'
      })
    },
    */
    exportPageZip({state, rootState}, param) {
      return axios({
        method: 'post',
        url: rootState.renderEngine + '/export/exportPageZip',
        data: param,
        responseType: 'blob',
        headers: {
          "X-NG-SessionId": window.sessionStorage.getItem("X-NG-SessionId")
        }
      })
    },
    getExportPage({state, rootState}, param) {
      // return axios.post(rootState.contextUrl + '/export/exportPageInfo', param);
      return service({
        maskOff: true,
        url: rootState.contextUrl + '/export/exportPageInfo',
        method: 'post',
        data: param
      })
    }
  },
}

export default ReportIndex
