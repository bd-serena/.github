const ReportAttr = {
  namespaced: true,
  state: {
    allTablesData: [],
    condiData: [],
    tableCols: [],
    filterData: [],
    allColsData: [],
    loaderSign: false,
    activeName2: 'first',
    datasetName: '',
    comptNum: 2,
    areaNum: 1,
    updataSign: 1,//更新操作标识符
    areaInfo: {},//选中区域信息
    datasets: [],//查询条件数据集合集
  },
  mutations: {
    upTableCols(state, data) {
      if (data.type == 'add') {
        state.tableCols.push(data.data)
      } else if (data.type == 'reset') {
        state.tableCols = data.data
      }
    },
    upDatasetName(state, name) {
      state.datasetName = name;
    },
    upActiveName2(state, name) {
      state.activeName2 = name;
    },
    upCondiData(state, data) {
      if (data.type == 'add') {
        state.condiData.push(data.data)
      } else if (data.type == 'reset') {
        state.condiData = data.data
      }
    },
    upAllCols(state, data) {
      state.allColsData = data
    },
    upFilterData(state, data) {
      if (data.type == 'reset') {
        state.filterData = data.data
      } else if (data.type == 'add') {
        if (data.position !== undefined) {
          state.filterData.splice(data.position, 0, data.data)
        } else {
          state.filterData.push(data.data)
        }
      } else if (data.type == 'del') {
        state.filterData.splice(data.position, 1)
      }
    },
    resetTableData(state, data) {
      state.allTablesData = data
    },
    filterCols(state, data) {
      const value = data.value
      const _d = data.data
      state.allColsData = value ? _d.filter(item => item.label.includes(value)) : _d
    },
    upAreaInfo(state, data) {
      state.areaInfo = data;
    },
    upComptNum(state, type) {
      if (type == 'add') {
        state.comptNum++;
      } else {
        state.comptNum--;
      }
    },
    resetUpdataSign(state) {
      state.updataSign++
    },
    upDatasets(state, data) {
      if (!!data.type && data.type == 'reset') {
        state.datasets.splice(data.position, 1, data.data)
      } else {
        state.datasets = data
      }
    },
    colFillback(state, list) {
      let all = state.allColsData;
      for(let i=2; i<list.length; i++) {
        let temp = list[i];
        for(let j=0; j<all.length; j++) {
          if(all[j].element_id === temp.comptAttrs.element_id) {
            all[j].selected = true;
            break;
          }
        }
      }
    }
  },
  actions: {
    upTableCols({ state, commit, rootState }, data) { //更新查询条件字段列表
      commit('upTableCols', data)
    },
    upActiveName2({ state, commit, rootState }, data) { //更新查询条件字段列表
      commit('upActiveName2', data)
    },
    upDatasetName({ state, commit, rootState }, data) { //更新查询条件字段列表
      commit('upDatasetName', data)
    },
    upAllCols({ state, commit, rootState }, data) {
      commit('upAllCols', data)
    },
    upFilterData({ state, commit, rootState }, data) {
      commit('upFilterData', data)
    },
    upCondiData({ state, commit, rootState }, data) { //更新查询条件字段列表
      commit('upCondiData', data)
    },
    filterCols({ state, commit, rootState }, data) { //更新查询条件字段列表
      commit('filterCols', data)
    },
    upDatasets({ commit }, data) {
      commit('upDatasets', data)
    }
  }
}
export default ReportAttr
