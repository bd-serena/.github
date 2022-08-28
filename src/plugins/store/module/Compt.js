import axios from 'axios';
import { service } from 'ngbd-utils'

const Compt = {
  namespaced: true,
  state: {
    loading: false,//加载中
    activedNum: 0,
    comptNum: 0,
    datasetName: "",
    edcuiCompts: [],
    exportDialog: false,
    reportExport: false,
    summarizeDialog: false,
    listImportDialog:false,
    QueryHistory:false,
    queryTaskDialog:false,
    authorityDialog:false,
    smsId: '',
    importField:'',
    // designType:0,
    // s_edcuiCompts:[{
    //     comptSort: 0,
    //     type: "ElTable",
    //     comptAttrs: {
    //       tableattrs: {
    //         data: [
    //           {
    //             date: "2016-05-02",
    //             name: "王小虎",
    //             address: "上海市普陀区金沙江路 1518 弄"
    //           },
    //           {
    //             date: "2016-05-04",
    //             name: "王小虎",
    //             address: "上海市普陀区金沙江路 1517 弄"
    //           }
    //         ],
    //         style: "width:100%",
    //         stripe: true,
    //         border: true,
    //         "highlight-current-row": true,
    //         "show-header": true
    //       },
    //       columns: [
    //         { prop: "date", label: "日期", width: "180" },
    //         { prop: "name", label: "姓名", width: "180" },
    //         { prop: "address", label: "地址" }
    //       ]
    //     },
    //     blockInfo: { x: 257, y: 51, h: 200, w: 443 },
    //     // blockInfo: { x: 0, y: 0, h: 6, w: 6 },
    //     afId: ""
    //   },
    //   {
    //     comptSort: 1,
    //     type: "ElInput",
    //     comptAttrs: {
    //       label: "查询条件",
    //       labelWidth: "80px",
    //       m_value: "",
    //       placeholder: "查询名称"
    //     },
    //     blockInfo: { x: 79, y: 269, h: 61, w: 318 },
    //     // blockInfo: { x: 0, y: 2, h: 2, w: 6 },
    //     afId: ""
    //   }],
    designType: 1,
    s_edcuiCompts: [
      {
        comptSort: 0,
        type: "Jixi",
        comptAttrs: {
          "fieldList": [
            {
              "comptSort": 0,
              "type": "ElButton",
              "comptAttrs": {
                "btnType": "primary",
                "shape": "plain",
                "label": "查询",
                "methods": {
                  "clickHandle": 'this.queryInfo()'
                }
              }
            }
          ],
          resetBtnShow:false,
          wrap:false,
          wordCount:6,
          radioArr: "1",
        },
        // blockInfo: { x: 79, y: 269, h: 61, w: 318 },
        blockInfo: { x: 0, y: 0, h: 6, w: 24 },
        afId: ""
      },
      {
        comptSort: 1,
        type: "ElTable",
        comptAttrs: {
          export: true,//是否显示导出按钮
          needSms: "",//是否需要短信验证码
          totalRow: false,//显示总计
          summarizing: true,//是否显示汇总按钮
          exportTask: true,//是否显示定时取数
          pagination: {
            show: true,
            "currentPage": 1,
            "pageSize": 10,
            "total": 0,
            "methods": {
              "handleSizeChange": '',
              "handleCurrentChange": ''
            }
          },
          tableattrs: {
            data: [
              // {
              //   date: "2016-05-02",
              //   name: "王小虎",
              //   address: "上海市普陀区金沙江路 1518 弄"
              // },
              // {
              //   date: "2016-05-04",
              //   name: "王小虎",
              //   address: "上海市普陀区金沙江路 1517 弄"
              // }
            ],
            style: "width:100%;height:100%",
            stripe: true,
            border: true,
            "highlight-current-row": true,
            "show-header": true
          },
          columns: [
            // { prop: "date", label: "日期", width: "180" },
            // { prop: "name", label: "姓名", width: "180" },
            // { prop: "address", label: "地址" }
          ]
        },
        // blockInfo: { x: 257, y: 51, h: 200, w: 443 },
        blockInfo: { x: 0, y: 2, h: 18, w: 24 },
        afId: ""
      }],
    fieldSetList: {},
    activedCompt: [],
    templateData: [
      {
        comptSort: 0,
        type: "Jixi",
        comptAttrs: {
          "fieldList": [
            {
              "comptSort": 0,
              "type": "ElButton",
              "comptAttrs": {
                "btnType": "primary",
                "label": "查询",
                "methods": {
                  "clickHandle": 'this.queryInfo()'
                }
              }
            }
          ],
          resetBtnShow:false,
          wrap:false,
          wordCount:6,
          radioArr: "1",
        },
        blockInfo: { x: 0, y: 0, h: 6, w: 24 },
        afId: ""
      },
      {
        comptSort: 1,
        type: "ElTable",
        comptAttrs: {
          export: true,//是否显示导出按钮
          needSms: "",//是否需要短信验证码
          summarizing:true,//是否显示汇总按钮
          exportTask: true,//是否显示定时取数
          totalRow: false,//显示总计
          tableattrs: {
            data: [
            ],
            style: "width:100%;height:100%",
            stripe: true,
            border: true,
            "highlight-current-row": true,
            "show-header": true
          },
          columns: [
          ],
          pagination: {
            show: true,
            "currentPage": 1,
            "pageSize": 10,
            "total": 0,
            "methods": {
              "handleSizeChange": '',
              "handleCurrentChange": ''
            }
          },
        },
        blockInfo: { x: 0, y: 2, h: 18, w: 24 },
        afId: ""
      }]
  },
  getters: {
    getActivedCompt(state, getters, rootState, rootGetters) {
      var result = {};
      if (state.activedNum !== '') {
        var cpts = state.s_edcuiCompts;
        for (var i = 0; i < cpts.length; i++) {
          if (cpts[i].comptSort == state.activedNum) {
            result = cpts[i];
            break;
          }
        }
      } else if (state.comptNum != null) {
        if (state.comptNum == 0) {
          result = state.s_edcuiCompts[state.comptNum] || {};
        } else {
          result = state.s_edcuiCompts[state.comptNum - 1];
        }
      }
      state.activedCompt = result;
      return result;
    },
    getLayout(state, getters, rootState, rootGetters) { // 获取流动式布局块面信息
      const result = []
      if (state.designType != 1) { return result }
      for (var i = 0; i < state.s_edcuiCompts.length; i++) {
        state.s_edcuiCompts[i].blockInfo["i"] = state.s_edcuiCompts[i].comptSort
        result.push(state.s_edcuiCompts[i].blockInfo)
      }
      return result
    }
  },
  mutations: {
    setActivedCompt(state,value){
    state.activedCompt.comptAttrs = value.comptAttrs;
    },
    upComptNum(state, type) {
      if (type == 'add') {
        state.comptNum++;
      } else {
        state.comptNum--;
      }

    },
    upComptDatasetName(state, name) {
      state.datasetName = name;
    },
    upActivedId(state, id) {
      state.activedNum = id;
    },
    getEdcuiCompts(state) {
      // 读取默认组件配置
      const comptData = require('@/../public/comptConfig/edcuiCompts.json')
      state.edcuiCompts = comptData;
      state.comptNum = state.s_edcuiCompts.length;
    },
    setSedcuiCompts(state, list) {

      if (list.length > 0) {
        let compts = [];
        list.forEach(function (val) {
          var temp = {};
          temp.comptSort = val.elementId;
          temp.type = val.compType;
          temp.comptAttrs = JSON.parse(val.compAttrs);
          temp.blockInfo = JSON.parse(val.blockInfo);
          temp.afId = val.afId;
          compts.push(temp);
        });
        state.s_edcuiCompts = compts;
      } else {
        state.s_edcuiCompts = JSON.parse(JSON.stringify(state.templateData));
      }
    },
    upLoading(state, bolean) {
      state.loading = bolean
    },
    resetTemplate(state) {
      state.s_edcuiCompts = JSON.parse(JSON.stringify(state.templateData));
    },
    setExportDialog(state, value) {
      state.exportDialog = value;
    },
    setReportExport(state, value) {
      state.reportExport = value;
    },
    setSmsId(state, id) {
      state.smsId = id;
    },
    setSummarizeDialog(state,value){
      state.summarizeDialog = value;
    },
    setQueryHistory(state,value){
      state.QueryHistory = value;
    },
    setListImportDialog(state,value){
      state.listImportDialog = value;
    },
    setImportField(state,val){
      state.importField=val;
    },
    setQueryTaskDialog(state,value){
      state.queryTaskDialog = value;
    },
    setAuthorityDialog(state,value){
      state.authorityDialog = value;
    },
  },
  actions: {
    setActivedCompt({ state, commit, rootState }, value){
      commit('setActivedCompt', value);
    },
    upComptNum({ state, commit, rootState }, type) {
      commit('upComptNum', type);
    },
    upComptDatasetName({ state, commit, rootState }, name) {
      commit('upComptDatasetName', name);
    },
    upActivedId({ commit }, id) {
      commit('upActivedId', id);
    },
    getEdcuiCompts({ commit }) {
      commit('getEdcuiCompts')
    },
    queryPageCompts({ state, commit, rootState }, param) {
      // return axios.post(rootState.renderEngine + '/queryPageDetailsById' ,param)
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/queryPageDetailsById',
        method: 'post',
        data: param
      })
    },
    addOptlog({ state, commit, rootState }, param) { //保存操作日志
      // return axios.post(rootState.renderEngine + '/optlog/addOptlog' ,param)
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/optlog/addOptlog',
        method: 'post',
        data: param
      })
    },
    addCollect({ state, commit, rootState }, param) { //添加收藏
      // return axios.post(rootState.renderEngine + '/collect/addCollect' ,param)
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/collect/addCollect',
        method: 'post',
        data: param
      })
    },
    delCollect({ state, commit, rootState }, param) { //取消收藏
      // return axios.post(rootState.renderEngine + '/collect/delCollect' ,param)
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/collect/delCollect',
        method: 'post',
        data: param
      })
    },
    upLoading({ state, commit }, bolean) {
      commit('upLoading', bolean)
    },
    setExportDialog({ state, commit }, value) {
      commit('setExportDialog', value)
    },
    setReportExport({ state, commit }, value) {
      commit('setReportExport', value)
    },
    sendSms({ state, commit, rootState }, param) {
      // return axios.post(rootState.renderEngine + '/export/sendSms', param)
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/export/sendSms',
        method: 'post',
        data: param
      })
    },
    setSmsId({ state, commit }, id) {
      commit('setSmsId', id)
    },
    checkSms({ state, rootState }, param) {
      // return axios.post(rootState.renderEngine + '/export/checkPassWord', param)
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/export/checkPassWord',
        method: 'post',
        data: param
      })
    },
    logout({ rootState }) {
      // return axios.get(rootState.contextUrl + '/dist/logout.do');
      // window.location.href = rootState.contextUrl + '/dist/logout.do';
      return service({
        maskOff: true,
        url: rootState.contextUrl + '/dist/logout.do',
        method: 'get'
      })
    },
    setSummarizeDialog({state,commit},value){
      commit('setSummarizeDialog',value);
    },
    setListImportDialog({state,commit},value){
      commit('setListImportDialog',value);
    },
    downloadListTemplate({ state, rootState }) {
      return axios({
        method: 'post',
        url: rootState.renderEngine + '/export/downloadListTemplate',
        responseType: 'blob',
        headers: {
          "X-NG-SessionId": window.sessionStorage.getItem("X-NG-SessionId")
        }
      })
      /* return service({
        maskOff: true,
        url: rootState.renderEngine + '/export/downloadListTemplate',
        method: 'post',
        responseType: 'blob'
      }) */
    },
    setQueryHistory({state,commit},value){
      commit('setQueryHistory',value);
    },
    setQueryTaskDialog({state,commit},value){
      commit('setQueryTaskDialog',value);
    },
    setAuthorityDialog({state,commit},value){
      commit('setAuthorityDialog',value);
    },
    checkCreateTablePriv({state,rootState},param){
      return service({
        maskOff: true,
        method:'post',
        url: rootState.renderEngine+'/import/checkCreateTablePriv',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId
        }
      })
    },
    queryImportInfo({state,rootState},param){
      // return axios.post(rootState.renderEngine+'/import/queryImportInfo',param);
      return service({
        maskOff: true,
        method:'post',
        url: rootState.renderEngine+'/import/queryImportInfo',
        data: param
      })
    },
    queryDimLevelInfo({rootState},param){
      return service({
        maskOff: true,
        method:'post',
        url: rootState.dgwMsUrl+'/cacheData/getDimLevelInfo',
        data: param,
        timeout: rootState.commonProperties.axiosTimeout,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId
        }
      })
    },
    qryExtCompList({rootState},param){
      return service({
        maskOff: true,
        method:'post',
        url: rootState.renderEngine + '/comp/qryExtCompList',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId
        }
      })
    },
    extCompUpload({rootState},param){
      return service({
        maskOff: true,
        method:'post',
        url: rootState.renderEngine + '/comp/extCompUpload',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId
        }
      })
    },
    extExcelUpload({rootState},param){
      return service({
        maskOff: true,
        method:'post',
        url: rootState.uploadUrl + '/localdb/importExcel',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-TenantId": window.sessionStorage.getItem("tenant_id")
        }
      })
    },
    appendExcel({rootState},param){
      return service({
        maskOff: true,
        method:'post',
        url: rootState.uploadUrl + '/localdb/appendExcel',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-TenantId": window.sessionStorage.getItem("tenant_id")
        }
      })
    },
    extCsvUpload({rootState},param){
      return service({
        maskOff: true,
        method:'post',
        url: rootState.uploadUrl + '/localdb/importCsv',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-TenantId": window.sessionStorage.getItem("tenant_id")
        }
      })
    },
    appendCsv({rootState},param){
      return service({
        maskOff: true,
        method:'post',
        url: rootState.uploadUrl + '/localdb/appendCsv',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-TenantId": window.sessionStorage.getItem("tenant_id")
        }
      })
    },
    hideComp({rootState},param){
      return service({
        maskOff: true,
        method:'put',
        url: rootState.renderEngine + '/comp/hideComp',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId
        }
      })
    },
    showComp({rootState},param){
      return service({
        maskOff: true,
        method:'put',
        url: rootState.renderEngine + '/comp/showComp',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId
        }
      })
    },
    deleteComp({rootState},param){
      return service({
        maskOff: true,
        method:'delete',
        url: rootState.renderEngine + '/comp/deleteComp',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId
        }
      })
    },
    downloadTemplate({rootState},param) {
      return axios({
        maskOff: true,
        method:'post',
        url: rootState.renderEngine + '/comp/downloadTemplate',
        responseType: 'blob',
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId,
          "X-NG-SessionId": window.sessionStorage.getItem("X-NG-SessionId")
        }
      })
    }
  }
}

export default Compt
