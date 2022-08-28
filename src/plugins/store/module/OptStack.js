import {
  windowResize
} from "../../../utils/comonFunc";
import {
  Message
} from 'element-ui';
const OptStack = {
  namespaced: true,
  state: {
    snapshots: {}, //操作历史栈
    cursor: {}, //当前光标
    maxSnapshots: 20 //每个tab能存储的最大操作数
  },
  getters: {},
  mutations: {
    // 记录用户操作
    // record operation snapshots
    recordCommand(state, {
      cmd,
      curPageId
    }) {
      if (state.snapshots[curPageId] == undefined) {
        state.snapshots[curPageId] = [];
        state.cursor[curPageId] = -1;
      }
      
      while (state.cursor[curPageId] < state.snapshots[curPageId].length - 1) {
        state.snapshots[curPageId].pop()
      }
      
      let prevCmd = state.snapshots[curPageId][state.snapshots[curPageId].length - 1];
      if(prevCmd && prevCmd.commandName == "moveLayer" && prevCmd.comptInfo.direction == cmd.comptInfo.direction){
        state.snapshots[curPageId].pop();
      }

      // 这样生成的动画更好的表现新旧历史记录的替换
      state.snapshots[curPageId].push(cmd);
      // 确保历史记录条数限制
      if (state.snapshots[curPageId].length > state.maxSnapshots) {
        state.snapshots[curPageId].shift()
      }
      state.cursor[curPageId] = state.snapshots[curPageId].length - 1;
    },
    clearSnapshots(state, {
      curPageId
    }) {
      state.cursor[curPageId] = -1;
      state.snapshots[curPageId] = [];
    }
  },
  actions: {
    undoCommand({
      state,
      dispatch
    }, {
      curPageId
    }) {
      state.cursor[curPageId] -= 1;
      let popCmd = state.snapshots[curPageId][state.cursor[curPageId]];
      dispatch('executeCommand', {
        data: JSON.parse(popCmd.dataBefore) || []
      });
    },
    redoCommand({
      state,
      dispatch
    }, {
      curPageId
    }) {
      state.cursor[curPageId] += 1;
      const popCmd = state.snapshots[curPageId][state.cursor[curPageId]];
      dispatch('executeCommand', {
        data: JSON.parse(popCmd.dataBefore) || [] //objDeepCopy(popCmd.dataAfter || [])
      });
    },
    executeCommand({
      commit
    }, cmd) {
      commit('PageDesign/setSedcuiCompts', cmd.data, {
        root: true
      });
      // 因为可能块块大小也有变化，所以要触发resize
      windowResize();
    },
    emitUndoRedo({
      dispatch
    }, {
      curPageId,
      cmdType
    }) {
      let actionName = "";
      switch (cmdType) {
        case "undo":
          actionName = "undoCommand";
          break;
        case "redo":
          actionName = "redoCommand";
          break;
        default:
          break;
      }
      dispatch(actionName, {
        curPageId: curPageId
      })
    },
    // 执行每次操作前都要检查下当前是否有保存错初始页面状态，没有的话要保存一下
    checkIfNeedRecordFirst({
      state,
      dispatch
    }, {
      dataBefore,
      pageId
    }) {
      if ((state.snapshots[pageId] || []).length == 0) {
        // 页面初始需要记录一次页面状态
        dispatch("initPageSnapshots", {
          pageId: pageId,
          dataBefore: dataBefore
        });
      }
    },
    // 页面初始需要记录一次页面状态
    initPageSnapshots({
      commit
    }, {
      pageId,
      dataBefore
    }) {
      commit("recordCommand", {
        curPageId: pageId,
        cmd: {
          commandName: "init",
          dataBefore: dataBefore,
          comptInfo: {} //操作的组件
        },
        type: "undo"
      });
    },
    executeRedoAndUndo({
      dispatch,
      state
    }, {
      cmdType,
      pageId
    }) {
      //执行撤销回退
      let curPageSnapshots = state.snapshots[pageId] || [];
      let curPageCursor =
        state.cursor[pageId] != undefined ?
        state.cursor[pageId] :
        -1;
      // this.cursor[pageId] 这个不能用computed，因为当curpageId没变当时候，cursor也不会变
      let canUndo = curPageCursor > 0 ? true : false;
      let canRedo = curPageSnapshots.length > curPageCursor + 1 ? true : false;
      if ((canRedo && cmdType == "redo") || (canUndo && cmdType == "undo")) {
        dispatch("emitUndoRedo", {
          curPageId: pageId,
          cmdType: cmdType
        });
      } else {
        Message.closeAll();
        Message({
          message: "当前页面不能再撤销回退了",
          type: "warning"
        });
      }
    },
  }
}

export default OptStack

/**
 * 
 * 撤销重做：
 * 每次画板有进行可以撤销回退都操作
 * 回退栈清空
 * 
 * 回退栈是基于撤销栈而言的
 * 当前连续撤销了几下就可以回退几下
 */
