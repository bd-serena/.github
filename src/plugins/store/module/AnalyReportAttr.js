import { service } from 'ngbd-utils'
const AnalyReportAttr = {
  namespaced: true,
  state: {
    datasetMap: {},
    isDSMapReady: false,
    // 存储选择过的数据集列表
    dimInfoMap: new Map(), //存储维层信息
    interactDialogVis: false,
    cockpitPubDialogVis: false,
    emailTaskDialogVis: false,
    emailTaskLogDialogVis: false,
    appType: "1", //发布驾驶舱类型,1-驾驶舱 2-应用
    sharedDialogVis: false //分享应用
  },
  mutations: {
    upDatasetMap(state, param) {
      if (param.type == "reset") {
        state.datasetMap = param.data;
      } else {
        state.datasetMap[param.key] = param.data;
      }
    },
    upIsDSMapReady(state, param) {
      state.isDSMapReady = param;
    },
    upDimInfoMap(state, param) {
      if (param.type == "reset") {
        state.dimInfoMap = param.data;
      } else {
        if (typeof state.dimInfoMap.set != "function") {
          state.dimInfoMap = new Map();
        }
        state.dimInfoMap.set(param.key, param.data);
      }
    },
    setInteractDialogVis(state, param) {
      state.interactDialogVis = param;
    },
    setCockpitPubDialogVis(state, param) {
      state.cockpitPubDialogVis = param;
    },
    setEmailTaskDialogVis(state, param) {
      state.emailTaskDialogVis = param;
    },
    setEmailTaskLogDialogVis(state, param) {
      state.emailTaskLogDialogVis = param;
    },
    setAppType(state, param) {
      state.appType = param;
    },
    setSharedDialogVis(state, param) {
      state.sharedDialogVis = param
    }
  },
  actions: {
    // 查询数据集列表的所有详情
    /**
     * ,//[]
        anly_subject_id: anly_subject_id,
        is_need_trans: is_need_trans
    */
    queryDatasetDetailList({ rootState }, { af_id_list }) {
      let param = {
        datasetIdList: af_id_list, //[]
        isEdit: 0
      };
     /*  return axios.post(rootState.datasetUrl + '/dataAssetAnlyFrame/getDataSetDetailInfoList', param, {
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId
        }
      }) */
      return service({
        maskOff: true,
        url: rootState.edcPubMsUrl + '/dataAssetAnlyDataset/getDataSetInfoList',
        method: 'post',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId,
          "X-TenantId": window.sessionStorage.getItem("tenant_id") + "" || "34234234"
        }
      })
    },
    queryDimInfoList({ rootState }, { dim_level_list }) {
      let param = {
        "oper_id": window.sessionStorage.getItem("user_id"),
        "dim_level_list": dim_level_list,
        "start": 1,
        "page_count": 1
      };
     /*  return axios.post(rootState.renderEngine + '/dim/getDimInfoListByDimId', param, {
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId
        }
      }) */
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/dim/getDimInfoListByDimId',
        method: 'post',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId
        }
      })
    },
    queryEmailUser({ rootState }, { searchUser, userIdList }) {
     /*  return axios.post(rootState.renderEngine + '/dim/getDimInfoListByDimId', param, {/**/
      // headers: {
      //   "X-UserId": window.sessionStorage.getItem("user_id"),
      //   "X-SystemId": rootState.defaultSystemId
      // }
      // }) */
      let param = {
        "userIdList": userIdList,
        "userName": searchUser
      }
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/timedtask/getUserEmailList',
        data: param,
        method: 'post',
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id")
        }
      })
    },
    createRegularMailTask({ rootState }, param) {
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/timedtask/createRegularMailTask',
        method: 'post',
        data: param
      })
    },
    querySingleDimInfo({ rootState }, { dim_id, dim_level_id, is_all_data, parent_val }) {
      let curDate = new Date();
      let curYear = curDate.getFullYear();//获取当前年份
      let yearArr = [];//新疆地域特殊处理，加年份条件。数组格式存放需要展示的年份
      for (let i = 0; i < rootState.commonProperties.areaYear; i++) {
        yearArr.push(curYear - i);
      }
      let param = {
        dimId: dim_id,
        dimLevelId: dim_level_id,
        isAllData: is_all_data,
        parentVal: parent_val,
        statYear: yearArr
      };
     /*  return axios.post(rootState.dgwMsUrl + "/cacheData/getDimLevelDataTree", param, {
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId
        }
      }); */
      return service({
        maskOff: true,
        url: rootState.dgwMsUrl + "/cacheData/getDimLevelDataTree",
        method: 'post',
        data: param,
        timeout: rootState.commonProperties.axiosTimeout,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId
        }
      })
    }
  }
}
export default AnalyReportAttr
