import axios from 'axios';
import { service } from 'ngbd-utils'
const AsynExport = {
  namespaced: true,
  state: {
    tabActive:'third'
  },
  mutations: {
    setTabActive(state,value){
      state.tabActive=value;
    }
  },
  actions: {
    queryAsynExportList({ state, rootState }, param) { //查询数据集
      // return axios.post(rootState.renderEngine + '/asynexport/getAsynExportFlowList', param);
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/asynexport/getAsynExportFlowList',
        method: 'post',
        data: param
      })
    },
    addAsynExportFlow({state,rootState},param){
      // return axios.post(rootState.renderEngine+'/asynexport/addAsynExportFlow',param);
      return service({
        maskOff: true,
        url: rootState.renderEngine+'/asynexport/addAsynExportFlow',
        method: 'post',
        data: param
      })
    },
    delAsynExportFlow({state,rootState},param){
      // return axios.post(rootState.renderEngine+'/asynexport/delAsynExportFlow',param);
      return service({
        maskOff: true,
        url: rootState.renderEngine+'/asynexport/delAsynExportFlow',
        method: 'post',
        data: param
      })
    },
    delReportExport({state,rootState},param){
      /* return axios({
        url: rootState.renderEngine + "/delReportExport",
        method: "post",
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id")
          // "X-SystemId": this.defaultSystemId
        }
      }) */
      return service({
        maskOff: true,
        url: rootState.renderEngine + "/delReportExport",
        method: 'post',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-SystemId": this.defaultSystemId
        }
      })
    },
    downloadZip({ state, rootState },param) {
       return axios({
        method: 'post',
        url: rootState.renderEngine + '/export/downloadZipFile',
        data: param,
        responseType: 'blob',
        headers: {
          "X-NG-SessionId": window.sessionStorage.getItem("X-NG-SessionId")
        }
      }) 
      /*return service({
        maskOff: true,
        url: rootState.renderEngine + '/export/downloadZipFile',
        method: 'post',
        data: param,
        responseType: 'blob'
      })*/
    },
  }
}

export default AsynExport
