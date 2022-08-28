import {service} from 'ngbd-utils'
import Vue from 'vue'

const vm = new Vue();
const DataPortal = {
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
    layoutType: 'left',
    portal: {},
    menu: {},
    expendIds: [],
    treeKey: 1,
    homePage: {}
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
    upLayoutType(state,val) {
      state.layoutType = val;
    },
    setPortal(state,val) {
      val.themeType = '2';
      state.portal = val;
    },
    setMenu(state,val) {
      if(!val.isFolder) {
        val.isFolder = '0'
      }
      if(!val.isHome) {
        val.isHome = '0'
      }
      if(!val.openType) {
        vm.$set(val,'openType','1');
      }
      state.menu = val;
    },
    setExpendIds(state,val) {
      state.expendIds = val;
    },
    setHomePage(state,val) {
      state.homePage = val;
    },
    upTreeKey(state) {
      state.treeKey ++;
    }
  },
  actions: {
    queryTableData({state, rootState}, param) {
      return service({
        maskOff: true,
        url: rootState.pubSYSUrl + '/portal/queryPortalList',
        method: 'post',
        data: param,
        headers: {
          "X-TenantId": param.tenantId || ''
        }
      })
    },
    saveAsPage({state, rootState}, param) {  //另存为即席
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/saveAs',
        method: 'post',
        data: param
      })
    },
    queryPortalDetail({rootState}, param) {
      return service({
        maskOff: true,
        url: rootState.pubSYSUrl + '/portal/' + param.portalId,
        method: 'get',
        data: param
      })
    },
    addPortal({rootState}, param) {
      return service({
        maskOff: true,
        url: rootState.pubSYSUrl + '/portal',
        method: 'post',
        headers: {
          "X-SystemId": rootState.defaultSystemId
        },
        data: param
      })
    },
    updatePortal({rootState}, param) {
      return service({
        maskOff: true,
        url: rootState.pubSYSUrl + '/portal',
        method: 'put',
        headers: {
          "X-SystemId": rootState.defaultSystemId
        },
        data: param
      })
    },
    deletePortal({rootState}, id) {
      return service({
        maskOff: true,
        url: rootState.pubSYSUrl + '/portal/' + id,
        method: 'Delete',
        headers: {
          "X-SystemId": rootState.defaultSystemId
        }
      })
    },
    getMenuTree({rootState}, id) {
      return service({
        maskOff: true,
        url: rootState.pubSYSUrl + '/menu/getMenuTree/' + id,
        method: 'get',
        headers: {
          "X-SystemId": rootState.defaultSystemId
        }
      })
    },
    queryRoles({rootState}, param) {
      return service({
        maskOff: true,
        url: rootState.pubSYSUrl + '/role/queryRoles',
        method: 'post',
        data: param,
        headers: {
          "X-SystemId": rootState.defaultSystemId
        }
      })
    },
    getUserList({rootState}, param) {
      return service({
        maskOff: true,
        url: rootState.pubSYSUrl + '/user/getUserList',
        method: 'post',
        data: param,
        headers: {
          "X-SystemId": rootState.defaultSystemId
        }
      })
    },
    getPrivConfig({rootState}, id) {
      return service({
        maskOff: true,
        url: rootState.pubSYSUrl + '/portal/getPrivConfig/' + id,
        method: 'get',
        headers: {
          "X-SystemId": rootState.defaultSystemId
        }
      })
    },
    addPrivConfig({rootState}, param) {
      return service({
        maskOff: true,
        url: rootState.pubSYSUrl + '/portal/privConfig',
        method: 'post',
        data: param,
        headers: {
          "X-SystemId": rootState.defaultSystemId
        }
      })
    }
  }
}

export default DataPortal
