import { service } from 'ngbd-utils'

const DataSetMgt = {
  namespaced: true,
  state: {
    tableData: {
      total: 0,
      list: []
    },
    catalogId: '',
    catalogLevel: '',
    classtypeId: '1004',
    dataSetCache: null,
    entityColsData: {
      columns: [],
      tableAttr: {
        data: []
      }
    }, //实体字段及数据
    dataSrcDialogVis: false, //数据源新增弹窗
    activeTabName: "first", //新增数据源弹窗 tab选中项
    addDBVis: false, //新增数据库类型弹窗
  },
  getters: {
    getDataSetCache(state) { //获取数据集对象
      return state.dataSetCache;
    },
    entityParams: (state) => (param) => {
      let params = {}
      let tab_id = param.tab_id;
      let exp = "";
      let rule_list = [];
      let order_list = [];
      // rule_list.push({
      //   "col_id":"TX_DATE",
      //   "exp_id":"exp1$",
      //   "obj_id":'T215054_f0dd32953ea54e37b8d91e3b65e0bbec',
      //   "rule_value":"201604",
      //   "symbol":"3",
      //   "is_random":"1",
      //   "random_cnt":100
      // });
      let dgwSelects = [];
      // dgwSelects.push({
      //   "col_id":"TX_DATE",
      //   "nick_name":"TX_DATE",
      //   "obj_id":"T215054_f0dd32953ea54e37b8d91e3b65e0bbec"
      // })

      if (param.view === "designView") { //设计时预览
        try {
          param.param.anly_frame_info.anly_frame_elements.map(list => {
            if (list.is_show == 1) {
              if ((list.dim_id || "") != "") {
                order_list.push({
                  "obj_id": list.tab_id,
                  "col_id": list.col_id,
                  "order_type": 1
                })
              }
            }
          })
        } catch (e) {
        }
        params = {
          "begin_date": "",
          "head_bean": {
            "pageCount": 100,
            "start": 1,
            "user_id": window.sessionStorage.getItem('user_id')
          },
          "is_need_log": 1,
          "is_need_paging": 1,
          "is_need_permission": 1,
          "is_need_trans": 1,
          "query_type": "1",
          // "select_list": dgwSelects,
          "where_bean": {},
          "order_list": []
        }
        params = {
          ...params,
          ...param.param
        }
      } else {
        params = {
          "tabId": tab_id,
          "pageCount": 100,
          "start": 1,
          "is_need_trans": 1,
          "where": {
            "exp": exp,
            "rule_list": rule_list
          },
          "dgwSelects": dgwSelects, //输出参数
          "order_list": param.order_list || []
        }
      }
      params.tableSchema = param.tableSchema;
      params.conn_id = param.conn_id;
      return params;
    }
  },
  mutations: {
    setTableData(state, {
      total,
      list
    }) {
      state.tableData.total = total;
      state.tableData.list = list;
    },
    setDataSetCache(state, param) {
      state.dataSetCache = param;
    },
    upEntityColsData(state, data) {
      state.entityColsData = data
    },
    upDataSrcDialogVis(state, data) {
      state.dataSrcDialogVis = data;
    },
    upActiveTabName(state, data) {
      state.activeTabName = data;
    },
    upAddDBVis(state, data) {
      state.addDBVis = data;
    }
  },
  actions: {
    getSourceType({
      state,
      rootState
    }) { //查询数据源下拉资源类型
      /*  return axios.post(rootState.renderEngine + '/datasource/getResourceTypes', {}, {
         headers: {
           "X-UserId": sessionStorage.getItem("user_id"),
           "X-SystemId": rootState.defaultSystemId || "111",
           "X-TenantId": sessionStorage.getItem("tenant_id")
         }
       }); */
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/datasource/getResourceTypes',
        method: 'post',
        data: {},
        headers: {
          "X-UserId": sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId || "111",
          "X-TenantId": sessionStorage.getItem("tenant_id")
        }
      })
    },
    queryDataSource({
      state,
      rootState
    }, param) { //查询数据源
      /*  return axios.post(rootState.renderEngine + '/datasource/getDataSources', param, {
         headers: {
           "X-UserId": sessionStorage.getItem("user_id"),
           "X-SystemId": rootState.defaultSystemId || "1016",
           "X-TenantId": sessionStorage.getItem("tenant_id")
         }
       }); */
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/datasource/getDataSources',
        method: 'post',
        data: param,
        headers: {
          "X-UserId": sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId || "1016",
          "X-TenantId": sessionStorage.getItem("tenant_id")
        }
      })
    },
    queryDimList({
      state,
      rootState
    }, param) { //查询维度
      /*  return axios.post(rootState.edcPubMsUrl + '/dataAssetDim/getDimInfoList', param, {
         headers: {
           "X-UserId": sessionStorage.getItem("user_id"),
           "X-SystemId": rootState.defaultSystemId || "1016",
           "X-TenantId": sessionStorage.getItem("tenant_id")
         }
       }); */
      return service({
        maskOff: true,
        url: rootState.edcPubMsUrl + '/dataAssetDim/getDimInfoList',
        method: 'post',
        data: param,
        headers: {
          "X-UserId": sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId || "1016",
          "X-TenantId": sessionStorage.getItem("tenant_id")
        }
      })
    },
    updateUserPassword({
      state,
      rootState
    }, param) {
      return service({
        maskOff: true,
        url: rootState.pubSYSUrl + '/user/updatePassword',
        method: 'post',
        data: param,
        headers: {
          "X-NG-UserId": sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId,
          "X-TenantId": sessionStorage.getItem("tenant_id")
        }
      })
    },
    getDataSetRefList({
      state,
      rootState
    }, param) {
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/pubDataSetController/getDataSetRefList/' + param,
        method: 'get',
        headers: {
          "X-UserId": sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId,
          "X-TenantId": sessionStorage.getItem("tenant_id")
        }
      })
    },
    getDataSourceRefList({
      state,
      rootState
    }, param) {
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/datasource/getDataSourceRefList/',
        method: 'post',
        data: param,
        headers: {
          "X-UserId": sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId
        }
      })
    },
    queryDataSet({
      state,
      rootState
    },
      {
        param,
        flag
      }
    ) { //查询数据集
      /*  return axios.post(rootState.renderEngine + '/dataSet/getDataSetListByCatalogId', param, {
         headers: {
           "X-UserId": sessionStorage.getItem("user_id"),
           "X-SystemId": rootState.defaultSystemId || "111"
         }
       }); */
      let url = rootState.renderEngine + '/dataSet/getDataSetListByCatalogId';
      if ('1' === flag) {
        url = rootState.renderEngine + '/pubDataSetController/getDataSetList';
      }
      return service({
        maskOff: true,
        url: url,
        method: 'post',
        data: param,
        headers: {
          "X-UserId": sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId || "111",
          "X-TenantId": sessionStorage.getItem("tenant_id")
        }
      })
    },
    getCockpitList({
      state,
      rootState
    }, param) { //查询驾驶舱列表
      /*  return axios.post(rootState.renderEngine + '/cockpit/getCockpitList', param, {
         headers: {
           "X-UserId": sessionStorage.getItem("user_id"),
           "X-SystemId": rootState.defaultSystemId || "111"
         }
       }); */
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/cockpit/queryCockpitList',
        method: 'post',
        data: param,
        headers: {
          "X-UserId": sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId || "111"
        }
      })
    },
    getCockpitType({
      state,
      rootState
    }, param) { //获取驾驶舱下拉列表
      /*  return axios.post(rootState.renderEngine + '/cockpit/getCockpitTypeList', {}, {
         headers: {
           "X-UserId": sessionStorage.getItem("user_id"),
           "X-SystemId": rootState.defaultSystemId || "111"
         }
       }); */
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/cockpit/getCockpitTypeList',
        method: 'post',
        data: param,
        headers: {
          "X-UserId": sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId || "111"
        }
      })
    },
    delCockpitApply({
      state,
      rootState
    },param) {
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/cockpit/deleteApp/' + param,
        method: 'delete',
        headers: {
          "X-UserId": sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId || "1016"
        }
      })
    },
    saveAsPage({
      state,
      rootState
    }, param) {
      // return axios.post(rootState.renderEngine + '/saveAsPage', param);
      /*  return axios.post(rootState.renderEngine + '/saveAsPage', param, {
         headers: {
           "X-UserId": sessionStorage.getItem("user_id"),
           "X-SystemId": rootState.defaultSystemId || "111"
         }
       }); */
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/saveAsPage',
        method: 'post',
        data: param,
        headers: {
          "X-UserId": sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId || "111"
        }
      })
    },
    delDataSet({
      state,
      rootState
    }, param) { //删除数据集
      // return axios.post(rootState.renderEngine + '/dataSet/delDataSet', param);
      /*  return axios.post(rootState.renderEngine + '/dataSet/delDataSet', param, {
         headers: {
           "X-UserId": sessionStorage.getItem("user_id"),
           "X-SystemId": rootState.defaultSystemId || "111"
         }
       }); */
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/pubDataSetController/deleteDataSetList',
        method: 'post',
        data: param,
        headers: {
          "X-UserId": sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId || "111",
          "X-TenantId": sessionStorage.getItem("tenant_id")
        }
      })
    },
    setDataSetCatalog({
      state
    }, {
      id,
      level,
      cid
    }) { //设置传递值
      // id = id == 'myfold' ? '' : id;
      if (id === '' || id === undefined) {
        state.catalogId = 'myfold';
      } else {
        state.catalogId = id;
      }
      state.catalogLevel = level;
      state.classtypeId = cid;
    },
    setDataSetCache({
      state,
      commit
    }, param) { //将编辑参数缓存起来
      commit('setDataSetCache', param); //方法跳转
    },
    savePageAndDetail({
      state,
      rootState
    }, param) {
      // return axios.post(rootState.renderEngine + '/savePageAndDetail', param);
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/savePageAndDetail',
        method: 'post',
        data: param
      })
    },
    savePageDetail({
      state,
      rootState
    }, param) {
      // return axios.post(rootState.renderEngine + '/savePageDetail', param);
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/savePageDetail',
        method: 'post',
        data: param
      })
    },
    upEntityColsData({
      state,
      commit
    }, data) {
      commit("upEntityColsData", data)
    },
    getDataEntity({
      state,
      commit,
      rootState,
      getters
    }, param) {
      var params = getters.entityParams(param)
      if (param.view === "designView") {
        params["is_need_count"] = "0";
        // return axios.post(rootState.renderEngine + '//dataAnlyFrameQuery/queryAfPropertyData', params)
        return service({
          maskOff: true,
          // url: rootState.dgwMsUrl + '/dataAnlyFrameQuery/queryAfPropertyData',
          url: rootState.renderEngine + '/dataAnlyFrameQuery/queryAfPropertyData',
          timeout: rootState.commonProperties.axiosTimeout,
          method: 'post',
          data: params
        })
      }
      // return axios.post(rootState.dgwMsUrl + '/dataEntityQuery/getDataEntity', params);
      return service({
        maskOff: true,
        url: rootState.dgwMsUrl + '/dataEntityQuery/getDataEntity',
        timeout: rootState.commonProperties.axiosTimeout,
        method: 'post',
        data: params
      })
    },
    getTabInfo({
      state,
      commit,
      rootState,
      getters
    }, tab_id) {
      
      return service({
        maskOff: true,
        url: rootState.datasetUrl + "/dataAssetEntity/getTabInfoList",
        method: "post",
        data: {
          tab_id: tab_id,
          is_query_detail: "1"
        },
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id") || "9999012",
          "X-SystemId": rootState.defaultSystemId || "111"
        }
      });
    },
    movePageInfo({
      state,
      rootState
    }, param) { //移动数据集
      /*  return axios.post(rootState.renderEngine + '/dataSet/batchMoveCatalog4DataSet', param, {
         headers: {
           "X-UserId": sessionStorage.getItem("user_id"),
           "X-SystemId": rootState.defaultSystemId || "111"
         }
       }); */
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/dataSet/batchMoveCatalog4DataSet',
        method: "post",
        data: param,
        headers: {
          "X-UserId": sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId || "111"
        }
      });
    },
    // 资产的数据源相关的接口
    getDataSrcReqApi({
      rootState
    }, {
      param,
      type
    }) {
      let url = "";
      switch (type) {
        case "getAssetList": //获取资产传统关系数据库列表
          url = "/datasource/getDADataSources";
          break;
        case "addAssetDataSrc": //新增资产类型的数据源
          url = "/datasource/saveTenantConnRel";
          break;
        case "addCustomizeDataSrc": //新增自定义数据库的数据源
          url = "/datasource/addDataSource";
          break;
        case "upCustomizeDataSrc": //新增自定义数据库的数据源
          url = "/datasource/modifyDataSource";
          break;
        case "deleteDataSrc": //新增自定义数据库的数据源
          url = "/datasource/batchDelDataSources";
          break;
        case "qryDbVersion": //查询数据库版本列表
          url = "/datasource/qryDbVersion";
          break;
        case "testConnection": //连接测试
          url = "/datasource/testConnection";
          break;
        case "deleteDimList": //批量删除维度
          url = "/dim/deleteDimList";
          break;
        default:
          break;
      }

      return service({
        maskOff: true,
        url: rootState.renderEngine + url,
        method: "post",
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id") || "9999012",
          "X-SystemId": rootState.defaultSystemId || "111",
          "X-TenantId": window.sessionStorage.getItem("tenant_id") + "" || "34234234"
        }
      });
    }
  }
}

export default DataSetMgt
