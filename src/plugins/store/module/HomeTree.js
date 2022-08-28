import axios from 'axios';
import { service } from 'ngbd-utils'

const HomeTree = {
  namespaced: true,
  state: {
    selectId: '',
    treeData: [{
      id: "myfold",
      label: "我的文件夹",
      level: 0,
      value: "myfold"
    }],
    menuName: '即席查询',
    btnList: [], //按钮菜单列表
    menuClassTypeId: 'drive', //当前选中菜单分类id
    dataSetTreeIndex: 999,//数据集的子菜单 0 数据源 1数据集 2 维度 999 当前选中的菜单非数据集
    driveTree:[],
    cockpitButton: [{
      id: "10099145",
      label: "发布",
      level: 0,
      value: "10099145"
    }]
  },
  getters: {
    selectData(state) {
      var result = {};
      if (state.treeData.length > 1 && state.selectId !== '') {
        for (var item of state.treeData) {
          if (item.id == state.selectId) {
            result = item;
            break;
          }
        }
      }
      return result;
    },
    getMenuName(state) { //获取菜单名称
      return state.menuName;
    }
  },
  mutations: {
    setTreeList (state, obj) {
      var a = []
      if (obj.myFolder == 'drive') {
        a = obj.result
      } else if (state.menuClassTypeId === '1009') { // 数据门户菜单过滤mycollect、recentbrowse
        a = [
          {
            id: 'workfold',
            label: '工作组文件夹',
            level: 0,
            children: '',
            value: 'workfold'
          },
          {
            id: 'myfold',
            label: '我的文件夹',
            level: 0,
            children: obj.result,
            value: 'myfold'
          }
        ]
      } else if (obj.myFolder != '0') { // 0：隐藏 1：显示
        a.push({
          id: "mycollect",
          label: "我的收藏",
          level: 0,
          children: '',
          value: "mycollect"
        });
        if (["1001", "1002", "1003"].includes(state.menuClassTypeId)) {
          a.push({
            id: "sharedFolder",
            label: "共享文件夹",
            level: 0,
            children: '',
            value: "sharedFolder"
          });
        }
        a.push({
          id: "recentbrowse",
          label: "最近浏览",
          level: 0,
          children: '',
          value: "recentbrowse"
        },
        {
          id: "workfold",
          label: "工作组文件夹",
          level: 0,
          children: '',
          value: "workfold"
        },
        {
          id: "myfold",
          label: "我的文件夹",
          level: 0,
          children: obj.result,
          value: "myfold"
        });
      } else {
        a = [
          {
            id: state.dataSetTreeIndex == 2?"myfold":"workfold",
            label: state.dataSetTreeIndex == 2?"我的维度":"工作组文件夹",
            level: 0,
            children: '',
            value: state.dataSetTreeIndex == 2?"myfold":"workfold"
          }
        ];
      }
      if (obj && obj["isEmail"]) {
        let obj = {
          id: "emailtask",
          label: "邮件任务管理",
          level: 0,
          value: "emailtask"
        }
        a.push(obj);
      }
      state.treeData = a;
    },
    addTreeData(state, value) {
    },
    updateTreeData(state, value) {
    },
    setMenuName(state, value) {  //菜单名称
      state.menuName = value;
    },
    setMenuClassTypeId(state, value) {  //菜单分类id
      state.menuClassTypeId = value;
    },
    setBtnList(state, value) {  //按钮菜单列表
      state.btnList = value;
    },
    setDataSetTreeIndex(state, value) {
      state.dataSetTreeIndex = value;
    },
    setDriveTree(state, list) {
      const getNewTree = (list,level) => {
        return list.map(obj => {
          let item = {
            id: obj.menuId,
            label: obj.menuName,
            value: obj.menuId,
            parentId: obj.parentId,
            level : level
          }
          if (obj.children) {
            item.children = getNewTree(obj.children,level+1);
          } else {
            item.children = null;
          }
          return item;
        })
      };
      // list.forEach(val=>{
      //   let item = {children:"",level:0};
      //   item.id = val.id;
      //   item.label = val.menuName;
      //   item.value = val.id;
      //   item.parentId = val.parent_id;
      //   arry.push(item);
      // })
      let array = getNewTree(list,0);
      state.driveTree = array;
    },
    setCockpitButton(state, value) {  //驾驶舱按钮菜单列表
      state.cockpitButton = value;
    }
  },
  actions: {
    queryTreeData({ state, rootState }, param) {
      // return axios.post(rootState.renderEngine + '/catalog/getCatalogList', param);
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/catalog/getCatalogList',
        method: 'post',
        data: param
      })
    },
    addTreeData({ state, rootState }, param) {
      // return axios.post(rootState.renderEngine + '/catalog/addCatalog', param);
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/catalog/addCatalog',
        method: 'post',
        data: param
      })
    },
    delTreeData({ state, rootState }, param) {
      // return axios.post(rootState.renderEngine + '/catalog/delCatalog', param);
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/catalog/delCatalog',
        method: 'post',
        data: param
      })
    },
    editTreeData({ state, rootState }, param) {
      // return axios.post(rootState.renderEngine + '/catalog/editCatalog', param);
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/catalog/editCatalog',
        method: 'post',
        data: param
      })
    },
    queryUserRoleList({ state, rootState }, param) {
      return service({
        maskOff: true,
        url: rootState.pubSYSUrl + "/role/getUserRoleList",
        method: 'post',
        data: param,
        headers: {
          "X-NG-UserId": window.sessionStorage.getItem("user_id")
        }
      })
    },
    saveMenuTree({ state, rootState }, param) {
      return service({
        maskOff: true,
        url: rootState.pubSYSUrl + "/menu/addMenu",
        method: 'post',
        data: param,
        headers: {
          "X-NG-UserId": window.sessionStorage.getItem("user_id")
        }
      })
    },
    modifyMenu({ state, rootState }, param) {
      return service({
        maskOff: true,
        url: rootState.pubSYSUrl + "/menu/modifyMenu",
        method: 'post',
        data: param,
        headers: {
          "X-NG-UserId": window.sessionStorage.getItem("user_id")
        }
      })
    },
    delMenu({ state, rootState }, param) {
      return service({
        maskOff: true,
        url: rootState.pubSYSUrl + "/menu/delMenu",
        method: 'post',
        data: param,
        headers: {
          "X-NG-UserId": window.sessionStorage.getItem("user_id")
        }
      })
    }
  }
}

export default HomeTree
