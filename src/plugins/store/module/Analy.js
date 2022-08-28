import { service } from 'ngbd-utils'

const Analy = {
  namespaced: true,
  state: {

  },
  getters: {
   
  },
  mutations: {
   
  },
  actions: {
    getAnalyList({rootState},param) {
      return service({
        maskOff: true,
        method:'post',
        url: rootState.renderEngine+'/analy/getAnalyList',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId
        }
      })
    }
  }
}

export default Analy
