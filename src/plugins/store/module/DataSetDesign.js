import {service} from 'ngbd-utils'

const DataSetDesign = {
  namespaced: true,
  state: {
    tableData: {
      total: 0,
      list: []
    },
    catalogId: '',
    catalogLevel: '',
    classtypeId: '1004',
    pageCache: null,
    dataSetType: 0, // 0 表示数据集管理的设计页面 1表示从即席查询进入的数据集设计页面
    topoTabActive: "0",
    fieldDatasOri: [], //拓扑图表格图标点开相关变量
    fieldDatas: [],
    isIndeterminate: false,
    checkAll: true,
    checkedFields: [],
    filterTabfieldText: "",
    connLeftSelOption: [], //拓扑图连接设置图标点开相关变量
    connRightSelOption: [],
    joinExpList: [],
    allFieldsMap: new Map(),
    curSelConnInfo: Object.freeze({
      parent: {
        tab_id: "",
        phy_tab_name: "",
        rel_tab_id: "",
        join_type: "",
        tab_join_exp_list: [],
        tab_rel_list: [],
        tab_alias: "",
        color: ""
      },
      child: {
        tab_id: "",
        phy_tab_name: "",
        rel_tab_id: "",
        join_type: "",
        tab_join_exp_list: [],
        tab_rel_list: [],
        tab_alias: "",
        color: ""
      }
    }), //当前选中连接信息
    activeConn: "2", //当前选中连接关联关系
    connPopVisible: false, //拓扑图关联关系设置浮窗v-model
    dimFilterData: [], //维度设计 当前过滤数据
    dimFilterMap: {}, //维度设计所有维层过滤数据集合，以id为key
    fieldOptions: [],
    fieldTypeMap: {}, //字段类型匹配map
    dimIdCounter: 0,//维度过滤行id计数器
    dateFormatPopVisible: false ,//源时间格式悬浮窗
    userModeTip: "请选择用户",  //区分各种数据库模式 提示语常量
    dataModeTip: "请选择数据库",//区分各种数据库模式 提示语常量
    shemaModeTip: "请选择模式"//区分各种数据库模式 提示语常量

  },
  getters: {},
  mutations: {
    setTableData(state, {
      total,
      list
    }) {
      state.tableData.total = total;
      state.tableData.list = list;
    },
    setDatasetType(state, param) {
      state.dataSetType = param
    },
    setTopoTabActive(state, param) {
      state.topoTabActive = param
    },
    setFieldDatasOri(state, param) {
      state.fieldDatasOri = Object.freeze(param)
    },
    setFieldDatas(state, param) {
      state.fieldDatas = Object.freeze(param)
    },
    setIsIndeterminate(state, param) {
      state.isIndeterminate = param
    },
    setCheckAll(state, param) {
      state.checkAll = param
    },
    setCheckedFields(state, param) {
      state.checkedFields = Object.freeze(param)
    },
    setFilterTabfieldText(state, param) {
      state.filterTabfieldText = param
    },
    setConnLeftSelOption(state, param) {
      state.connLeftSelOption = Object.freeze(param)
    },
    setConnRightSelOption(state, param) {
      state.connRightSelOption = Object.freeze(param)
    },
    setJoinExpList(state, param) {
      state.joinExpList = param
    },
    setAllFieldsMap(state, param) {
      state.allFieldsMap = param
    },
    setCurSelConnInfo(state, param) {
      state.curSelConnInfo = Object.freeze(param)
    },
    setActiveConn(state, param) {
      state.activeConn = param
    },
    setConnPopVisible(state, param) {
      state.connPopVisible = param
    },
    setDateFormatPopVisible(state, param) {
      state.dateFormatPopVisible = param;
    },
    setDimFilterData(state, param) {
      state.dimFilterData = param;
    },
    setFieldOptions(state, param) {
      state.fieldOptions = param;
    },
    setDimIdCounter(state, param) {
      state.dimIdCounter = param;
    }
  },
  actions: {
    queryDataSet({
                   state,
                   rootState
                 }, param) { //查询数据集
      // return axios.post(rootState.renderEngine + '/dataSet/getDataSetListByCatalogId', param);
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/dataSet/getDataSetListByCatalogId',
        method: 'post',
        data: param
      })
    },
    setDatasetType({
                     state,
                     commit
                   }, param) {
      commit('setDatasetType', param)
    },
    updateTopoTabActive({
                          state,
                          commit
                        }, param) {
      commit('setTopoTabActive', param)
    },
    updateFieldDatasOri({
                          state,
                          commit
                        }, param) {
      commit('setFieldDatasOri', param)
    },
    updateFieldDatas({
                       state,
                       commit
                     }, param) {
      commit('setFieldDatas', param)
    },
    updateIsIndeterminate({
                            state,
                            commit
                          }, param) {
      commit('setIsIndeterminate', param)
    },
    updateCheckAll({
                     state,
                     commit
                   }, param) {
      commit('setCheckAll', param)
    },
    updateCheckedFields({
                          state,
                          commit
                        }, param) {
      commit('setCheckedFields', param)
    },
    updateFilterTabfieldText({
                               state,
                               commit
                             }, param) {
      commit('setFilterTabfieldText', param)
    },
    updateConnLeftSelOption({
                              state,
                              commit
                            }, param) {
      commit('setConnLeftSelOption', param)
    },
    updateConnRightSelOption({
                               state,
                               commit
                             }, param) {
      commit('setConnRightSelOption', param)
    },
    updateJoinExpList({
                        state,
                        commit
                      }, param) {
      commit('setJoinExpList', param)
    },
    updateAllFieldsMap({
                         state,
                         commit
                       }, param) {
      commit('setAllFieldsMap', param)
    },
    updateCurSelConnInfo({
                           state,
                           commit
                         }, param) {
      commit('setCurSelConnInfo', param)
    },
    updateActiveConn({
                       state,
                       commit
                     }, param) {
      commit('setActiveConn', param)
    },
    updateConnPopVisible({
                           state,
                           commit
                         }, param) {
      commit('setConnPopVisible', param)
    },
    updateDateFormatPopVisible({
                                 state,
                                 commit
                               }, param) {
      commit('setDateFormatPopVisible', param)
    },
    queryEntityList({
                      rootState
                    }, {
                      type,
                      param
                    }) {
      let url = "",
        header = {};
      switch (type) {
        case "dataasset": //资产
          url = rootState.renderEngine + "/dataSet/getTabInfoListFromDgw";
          header = {
            "X-UserId": window.sessionStorage.getItem("user_id") || "9999012",
            "X-SystemId": rootState.defaultSystemId || "111",
            "X-TenantId": window.sessionStorage.getItem("tenant_id") + "" || "34234234"
          };
          break;
        case "localdb":
        case "database": //自定义 数据库
          url = rootState.renderEngine + "/dataSet/queryTablesByDsid";
          header = {
            "X-UserId": window.sessionStorage.getItem("user_id") || "9999012",
            "X-SystemId": rootState.defaultSystemId || "111",
            "X-TenantId": window.sessionStorage.getItem("tenant_id") + "" || "34234234"
          };
          break;
        default:
          break;
      }
      /*  return axios.post(url, param, {
         headers: header
       }); */
      return service({
        maskOff: true,
        url: url,
        method: 'post',
        data: param,
        headers: header
      })

    },
    // 查询数据库类型的数据源的表 预览数据
    queryDbTbData({
                    rootState
                  }, param) {
      /*   return axios.post(`${rootState.dgwMsUrl}/database/queryTableData`, param, {
          headers: {
            "X-UserId": window.sessionStorage.getItem("user_id") || "9999012",
            "X-SystemId": rootState.defaultSystemId || "111",
            "X-TenantId": window.sessionStorage.getItem("tenant_id") + "" || "34234234"
          }
        }); */
      return service({
        maskOff: true,
        // url: rootState.dgwMsUrl + '/database/queryTableData',
        url: rootState.renderEngine + '/database/queryTableData',
        method: 'post',
        data: param,
        timeout: rootState.commonProperties.axiosTimeout,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id") || "9999012",
          "X-SystemId": rootState.defaultSystemId || "111",
          "X-TenantId": window.sessionStorage.getItem("tenant_id") + "" || "34234234"
        }
      })
    },
    // 数据集设计页面 查询表字段
     queryTbFields({
                    rootState
                  }, {
                    type,
                    param
                  }) {
       let url = rootState.datasetUrl + "/dataAssetEntity/getTabInfoList";
       if (type === "database" || type === "localdb") { //本地上传与自定义数据库
         url = rootState.renderEngine + "/database/getStructure";
       } else {
         // 数据源为数据资产时，调用资产服务控制只能查看有订阅的实体字段 add by fujm 2020.07.06
         if (type === "dataasset" || param.ext_query_type) {
           // 是否进行租户控制	0否，1是（为0查询全部）
           param.is_tenant = "1";
           // 授权租户
           param.tenant_id = sessionStorage.getItem("tenant_id");
         }
       }

      return service({
        maskOff: true,
        url: url,
        method: 'post',
        data: param,
        timeout: rootState.commonProperties.axiosTimeout,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id") || "9999012",
          "X-SystemId": rootState.defaultSystemId || "111",
          "X-TenantId": window.sessionStorage.getItem("tenant_id") + "" || "34234234"
        }
      })
    },
    saveDataSetInfo({
                      rootState
                    }, {
                      type,
                      param
                    }) {
      let url = rootState.renderEngine + "/dataSet/saveDataSet";
      if (type === "database" || type === "localdb") {
        url = rootState.renderEngine + "/pubDataSetController/saveDataSetInfo";
        if (param.datasetId !== undefined && param.datasetId !== "") { //修改
          url = rootState.renderEngine + "/pubDataSetController/modDataSetInfo";
        }
      }
      /*  return axios.post(url, param, {
         headers: {
           "X-UserId": window.sessionStorage.getItem("user_id") || "9999012",
           "X-SystemId": rootState.defaultSystemId || "111",
           "X-TenantId": window.sessionStorage.getItem("tenant_id") + "" || "34234234"
         }
       }); */
      return service({
        maskOff: true,
        url: url,
        method: 'post',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id") || "9999012",
          "X-SystemId": rootState.defaultSystemId || "111",
          "X-TenantId": window.sessionStorage.getItem("tenant_id") + "" || "34234234"
        }
      })
    },
    getDataSetList({ rootState }, param) {
      const url = rootState.renderEngine + "/pubDataSetController/getDataSetList";
      let defaultParam = {
        start: 1,
        pageCount: "20",
        isNeedDemo: rootState.commonProperties.showDemo
      }
      param = {
        ...defaultParam,
        ...param
      }
      return service({
        maskOff: true,
        url: url,
        method: "post",
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId || "111",
          "X-TenantId": window.sessionStorage.getItem("tenant_id") + "" || "34234234"
        }
      })
    },
    getDataSetInfo({ rootState }, { type, param }) {
      let url = rootState.renderEngine + "/pubDataSetController/getDataSetInfo";
      if (type === "database" || type === "localdb") {
        url = rootState.renderEngine + "/pubDataSetController/getDataSetInfo";
      }
      /*  return axios.post(url, param, {
         headers: {
           "X-UserId": window.sessionStorage.getItem("user_id") || "9999012",
           "X-SystemId": rootState.defaultSystemId || "111",
           "X-TenantId": window.sessionStorage.getItem("tenant_id") + "" || "34234234"
         }
       }); */
      return service({
        maskOff: true,
        url: url,
        method: 'post',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id") || "9999012",
          "X-SystemId": rootState.defaultSystemId || "111",
          "X-TenantId": window.sessionStorage.getItem("tenant_id") + "" || "34234234"
        }
      })
    },
    // 获取维层类型字典列表
    getDicValueList({
                      rootState
                    }, param) {
      /*  return axios.post(rootState.edcPubMsUrl + "/dataAssetCommon/getDicValueList", param, {
         headers: {
           "X-UserId": window.sessionStorage.getItem("user_id"),
           "X-SystemId": rootState.defaultSystemId,
           "X-TenantId": window.sessionStorage.getItem("tenant_id") + "" || "34234234"
         }
       }); */
      return service({
        maskOff: true,
        url: rootState.edcPubMsUrl + "/dataAssetCommon/getDicValueList",
        method: 'post',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id") || "9999012",
          "X-SystemId": rootState.defaultSystemId || "111",
          "X-TenantId": window.sessionStorage.getItem("tenant_id") + "" || "34234234"
        }
      })
    },
    saveDim({
              rootState
            }, param) {
      let url = rootState.renderEngine + "/dim/addDim";
      if (param.dimId) {
        url = rootState.renderEngine + "/dim/modifyDim";
      }
      /*  return axios.post(url, param, {
         headers: {
           "X-UserId": window.sessionStorage.getItem("user_id"),
           "X-SystemId": rootState.defaultSystemId,
           "X-TenantId": window.sessionStorage.getItem("tenant_id") + "" || "34234234"
         }
       }); */
      return service({
        maskOff: true,
        url: url,
        method: 'post',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id") || "9999012",
          "X-SystemId": rootState.defaultSystemId || "111",
          "X-TenantId": window.sessionStorage.getItem("tenant_id") + "" || "34234234"
        }
      })
    },
    getDimInfoById({
                     rootState
                   }, param) {
      /*  return axios.post(rootState.edcPubMsUrl + "/dataAssetDim/getDimInfoDetail", param, {
         headers: {
           "X-UserId": window.sessionStorage.getItem("user_id"),
           "X-SystemId": rootState.defaultSystemId,
           "X-TenantId": window.sessionStorage.getItem("tenant_id") + "" || "34234234"
         }
       }); */
      return service({
        maskOff: true,
        url: rootState.edcPubMsUrl + "/dataAssetDim/getDimInfoDetail",
        method: 'post',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id") || "9999012",
          "X-SystemId": rootState.defaultSystemId || "111",
          "X-TenantId": window.sessionStorage.getItem("tenant_id") + "" || "34234234"
        }
      })
    },
    // 查询数据库类型的数据源的表 预览数据
    queryDbColConf({
                     rootState
                   }, param) {
      /*  return axios.post(`${rootState.renderEngine}/common/queryDbColConf`, param, {
         headers: {
           "X-UserId": window.sessionStorage.getItem("user_id") || "9999012",
           "X-SystemId": rootState.defaultSystemId || "111",
           "X-TenantId": window.sessionStorage.getItem("tenant_id") + "" || "34234234"
         }
       }); */
      return service({
        maskOff: true,
        url: rootState.renderEngine + "/common/queryDbColConf",
        method: 'post',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id") || "9999012",
          "X-SystemId": rootState.defaultSystemId || "111",
          "X-TenantId": window.sessionStorage.getItem("tenant_id") + "" || "34234234"
        }
      })
    },
    queryDateFormatList({
                          rootState
                        }, param) {
      /*  return axios.post(`${rootState.renderEngine}/dateFormat/queryFormatList`, param, {
         headers: {
           "X-UserId": window.sessionStorage.getItem("user_id") || "9999012",
           "X-SystemId": rootState.defaultSystemId || "111",
           "X-TenantId": window.sessionStorage.getItem("tenant_id") + "" || "34234234"
         }
       }); */
      return service({
        maskOff: true,
        url: rootState.renderEngine + "/dateFormat/queryFormatList",
        method: 'post',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id") || "9999012",
          "X-SystemId": rootState.defaultSystemId || "111",
          "X-TenantId": window.sessionStorage.getItem("tenant_id") + "" || "34234234"
        }
      })
    },
    //数据资产获取字典列表，比如脱敏设置的加密策略类型列表，查询表ST_DATA_TYPE_DIC
    getDicValue({
          rootState
        }, param) {
      return service({
        maskOff: true,
        url: rootState.datasetUrl + "/dataAssetEntity/getDicValue",
        method: 'post',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id") || "9999012",
          "X-SystemId": rootState.defaultSystemId || "111",
          "X-TenantId": window.sessionStorage.getItem("tenant_id") + "" || "34234234"
        }
      })
    },
    querySchemaList({
                      rootState
                    }, param) {
      let option = {
        maskOff: true,
        timeout: rootState.commonProperties.axiosTimeout,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id") || "9999012",
          "X-SystemId": rootState.defaultSystemId || "111",
          "X-TenantId": window.sessionStorage.getItem("tenant_id") + "" || "34234234"
        }
      };
      if (param.type === 'dataasset') {
        option.url = rootState.pubSYSUrl + "/conn/queryTenantResourceConnList";
        option.method = 'post';
        option.data = {connId: param.connId};
      } else if (param.type === 'database') {
        // if(param.dsType === 'postgresql' || param.dsType === 'greenplum' || param.dsType === 'sqlserver'){
        //   option.url = rootState.dgwMsUrl + "/database/querySchemaList/" + param.dsId +"/"+param.dsType + "?isInclusiveSys=0";
        // }else{
        //   option.url = rootState.dgwMsUrl + "/database/querySchemaList/" + param.dsId +"/"+param.dsType + "?isInclusiveSys=0";
        // }
        option.url = rootState.dgwMsUrl + "/database/querySchemaList/" + param.dsId +"/"+param.dsType + "?isInclusiveSys=0";
        option.method = 'get';
      }
      return service(option);
    },
    getUserTagPriv({
      rootState
      }, param) {
      return service({
        maskOff: true,
        url: rootState.pubSYSUrl + "/dataPriv/queryDataPrivTagList",
        method: 'post',
        data: param,
        headers: {
          "X-NG-UserId": window.sessionStorage.getItem("user_id") || "9990035"
        }
      })
    },
  }
}

export default DataSetDesign
