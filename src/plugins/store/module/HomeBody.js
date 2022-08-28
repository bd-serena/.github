import axios from 'axios';
import {service} from 'ngbd-utils'

const HomeBody = {
  namespaced: true,
  state: {
    tableData: {
      total: 0,
      list: []
    },
    catalogId: 'myfold',
    catalogLevel: '',
    classtypeId: 1002,
    pageCache: {},
    tenantId: '',
    versionList: []
  },
  getters: {},
  mutations: {
    setTableData(state, {total, list}) {
      state.tableData.total = total;
      state.tableData.list = list;
    },
    setPageCache(state, param) {
      state.pageCache = param;
    },
    // 版本列表数据
    setVersionList (state, param) {
      state.versionList = param
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
      // return axios.post(rootState.renderEngine + '/list/queryPageInfoList', param);
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/list/queryPageInfoList',
        method: 'post',
        data: param
      })
    },
    queryEmailTask({state, rootState}, param) {
      // return axios.post(rootState.renderEngine + '/list/queryPageInfoList', param);
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/timedtask/queryRegularMailTask',
        method: 'post',
        data: param
      })
    },
    changeMailTaskStatus({state, rootState}, param) {
      // return axios.post(rootState.renderEngine + '/list/queryPageInfoList', param);
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/timedtask/changeMailTaskStatus',
        method: 'post',
        data: param
      })
    },
    queryRegularMailTaskLog({state, rootState}, param) {
      // return axios.post(rootState.renderEngine + '/list/queryPageInfoList', param);
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/timedtask/queryRegularMailTaskLog',
        method: 'post',
        data: param
      })
    },
    saveAsPage({state, rootState}, param) {  //另存为即席
      // return axios.post(rootState.renderEngine + '/saveAs', param);
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/saveAs',
        method: 'post',
        data: param
      })
    },
    saveAsAnalysisReport({state, rootState}, param) {  //另存为分析报告
      // return axios.post(rootState.renderEngine + '/saveAsAnalysisReport', param);
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/saveAsAnalysisReport',
        method: 'post',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId,
          "X-TenantId": sessionStorage.getItem("tenant_id")
        }
      })
    },
    saveAsReport({state, rootState}, param) {  //另存为报表
      // return axios.post(rootState.renderEngine + '/saveAsReport', param);
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/saveAsReport',
        method: 'post',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-TenantId": sessionStorage.getItem("tenant_id")
        }
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
    setCatalog({state}, {id, level, cid}) {
      // console.info("ok");
      // id=id=='myfold'?'':id;
      if (id == '' || id == undefined) {
        state.catalogId = 'myfold';
      } else {
        state.catalogId = id;
      }

      state.catalogLevel = level;
      state.classtypeId = cid;
    },
    setTenantId({state}, {id}) {   //设置租户id
      if (id == '' || id == undefined) {
        state.tenantId = '34234234';
      } else {
        state.tenantId = id;
      }

    },
    setPageCache({state, commit}, param) {
      commit('setPageCache', param);
    },
    savePageAndDetail({state, rootState}, param) {
      // return axios.post(rootState.renderEngine + '/savePageInfoAndDetails', param);
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/savePageInfoAndDetails',
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
    /*
    exportPageZip({state, rootState}, param) {
      return service({
        maskOff: true,
        method: 'post',
        // url: rootState.renderEngine + '/export/exportPageZip',
        url: rootState.renderEngine + '/export/exportPageZip',
        data: param,
        responseType: 'blob'
      })
    },
    */
    /*
    getExportPage({state, rootState}, param) {
      return axios.post(rootState.contextUrl + '/export/exportPageInfo', param);
    }, */
    getExportPage({state, rootState}, param) {
      // return axios.post(rootState.contextUrl + '/export/exportPageInfo', param);
      return service({
        maskOff: true,
        method: 'post',
        url: rootState.renderEngine + '/export/exportPageInfo',
        data: param,
        responseType: 'blob',
        outerError: true,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId,
          "X-TenantId": sessionStorage.getItem("tenant_id")
        }
      })
    },
    movePageInfo({state, rootState}, param) {
      // return axios.post(rootState.renderEngine + '/list/batchMoveCatalog4PageInfo', param);
      return service({
        maskOff: true,
        method: 'post',
        url: rootState.renderEngine + '/list/batchMoveCatalog4PageInfo',
        data: param
      })
    },
    queryPageInfoById({state, rootState}, param) {
      // return axios.post(rootState.renderEngine + '/list/queryPageInfoById', param);
      return service({
        maskOff: true,
        method: 'post',
        url: rootState.renderEngine + '/list/queryPageInfoById',
        data: param
      })
    },
    /**
     * 查询版本信息列表
     * @param {} param0
     * @param {*} param
     */
    qryVersionList ({ state, rootState }, param) {
      // return axios.post(rootState.renderEngine + '/list/queryPageInfoList', param);
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/version/qryVersionList',
        method: 'post',
        data: param,
        headers: {
          'X-UserId': window.sessionStorage.getItem('user_id')
        }
      });
    },
    /**
     * 提交版本
     * @param {} param0
     * @param {*} param
     */
    commitVersion ({ state, rootState }, param) {
      // return axios.post(rootState.renderEngine + '/list/queryPageInfoList', param);
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/version/commitVersion',
        method: 'post',
        data: param,
        headers: {
          'X-UserId': window.sessionStorage.getItem('user_id'),
          'X-TenantId': window.sessionStorage.getItem('tenant_id')
        }
      });
    },
    /**
     * 回退版本
     * @param {} param0
     * @param {*} param
     */
    rollbackVer({ state, rootState }, param) {
      // return axios.post(rootState.renderEngine + '/list/queryPageInfoList', param);
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/version/rollbackVer',
        method: 'post',
        data: param,
        headers: {
          'X-UserId': window.sessionStorage.getItem('user_id'),
          'X-TenantId': window.sessionStorage.getItem('tenant_id')
        }
      });
    },
    commitAfVersion ({ state, rootState }, param) {
      // return axios.post(rootState.renderEngine + '/list/queryPageInfoList', param);
      return service({
        maskOff: true,
        url: rootState.edcPubMsUrl + '/dataAssetAnlyDataset/pushDataSetInfo',
        method: 'post',
        data: param,
        headers: {
          'X-UserId': window.sessionStorage.getItem('user_id'),
          'X-TenantId': window.sessionStorage.getItem('tenant_id'),
          "X-SystemId": rootState.defaultSystemId || '1016'
        }
      });
    },
    /**
     * 回退版本
     * @param {} param0
     * @param {*} param
     */
    rollbackAfVer({ state, rootState }, param) {
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/version/rollbackAfVer',
        method: 'post',
        data: param,
        headers: {
          'X-UserId': window.sessionStorage.getItem('user_id'),
          'X-TenantId': window.sessionStorage.getItem('tenant_id'),
          'X-SystemId': window.sessionStorage.getItem('X-SystemId')
        }
      });
    },
    queryShareList({ state, rootState }, param) {
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/share/queryShareList',
        method: 'post',
        data: param,
        headers: {
          'X-UserId': window.sessionStorage.getItem('user_id'),
          'X-TenantId': window.sessionStorage.getItem('tenant_id'),
          'X-SystemId': window.sessionStorage.getItem('X-SystemId')
        }
      });
    },
    deleteShare({ state, rootState }, objId) {
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/share/' + objId,
        method: 'delete',
        headers: {
          'X-UserId': window.sessionStorage.getItem('user_id'),
          'X-TenantId': window.sessionStorage.getItem('tenant_id')
        }
      });
    },
    querySharedDetail({ state, rootState }, objId) {
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/share/' + objId,
        method: 'get',
        headers: {
          'X-UserId': window.sessionStorage.getItem('user_id'),
          'X-TenantId': window.sessionStorage.getItem('tenant_id')
        }
      });
    },
  }
}

export default HomeBody
