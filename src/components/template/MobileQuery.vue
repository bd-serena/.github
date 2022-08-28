<template>
  <div style="width:100%;height:100%;">
    <div class="has-compt" v-if="vscompt.comptAttrs.fieldList.length>0">
      <div v-if="pageCache.classTypeId!= '1005'">
        <grid-layout
          :layout="layout"
          :col-num="24"
          :row-height="1"
          :is-draggable="dragAndResize"
          :is-resizable="dragAndResize"
          :is-mirrored="false"
          :vertical-compact="true"
          :use-css-transforms="true"
        >
          <grid-item
            v-for="(sub,idx) in vscompt.comptAttrs.fieldList"
            :class="{'active':sub.comptSort===activedBlock}"
            :key="sub.comptSort"
            :x="sub.blockInfo.x"
            :y="sub.blockInfo.y"
            :w="sub.blockInfo.w"
            :h="sub.blockInfo.h"
            :minH="2"
            :minW="2"
            :i="sub.comptSort"
            @resized="resizedEvent"
          >
            <div style="height:100%">
              <div
                class="compt-title"
                v-if="isShowName(sub)"
              >{{sub.comptAttrs.extendSetting['comptName.text']}}</div>
              <div :class="{'no-title':isShowName(sub)==false,'has-title':isShowName(sub)==true}">
                <Cell
                  class="mobile-cell"
                  :isDesign="true"
                  :vscompt="sub"
                  :id="'main'+sub.orderId"
                  v-loading="sub.comptAttrs.loading"
                ></Cell>
                <div
                  class="compt-nodata-tip"
                  v-show="sub.comptAttrs.isBindData=='1' && !sub.comptAttrs.isLoadData"
                >
                  <span class="msg-tip">{{!!sub.comptAttrs.queryInfo ? sub.comptAttrs.queryInfo : sub.comptAttrs.name + '：请设置维度或度量'}}</span>
                </div>
              </div>
            </div>
          </grid-item>
        </grid-layout>
      </div>
      <div v-if="pageCache.classTypeId== '1005'">
        <bd-draggable-resizable
          v-for="(sub,idx) in vscompt.comptAttrs.fieldList"
          :class="{'active':sub.comptSort===activedBlock}"
          :key="sub.comptSort"
          :x="sub.blockInfo.x"
          :y="sub.blockInfo.y"
          :w="sub.blockInfo.w"
          :h="sub.blockInfo.h"
          :min-width="40"
          :min-height="20"
          :i="sub.comptSort"
          :grid="[1,1]"
          :draggable="dragAndResize"
          @resizing="hdResizedEvent"
          @dragging="dragEvent"
          @activated="onActivated(sub.comptSort)"
          @deactivated="onDragstop"
          :scaleRatio="scaleRatio"
          parent=".has-compt"
        >
          <div style="height:100%" class="bgsrc">
            <div
              class="compt-title"
              v-if="isShowName(sub)"
            >{{sub.comptAttrs.extendSetting['comptName.text']}}</div>
            <div :class="{'no-title':isShowName(sub)==false,'has-title':isShowName(sub)==true}">
              <Cell
                :isDesign="true"
                :vscompt="sub"
                :id="'main'+sub.orderId"
                v-loading="sub.comptAttrs.loading"
              ></Cell>
              <div
                class="compt-nodata-tip"
                v-show="sub.comptAttrs.isBindData=='1' && !sub.comptAttrs.isLoadData"
              >
                <span class="msg-tip">{{!!sub.comptAttrs.queryInfo ? sub.comptAttrs.queryInfo : sub.comptAttrs.name + '：请设置维度或度量'}}</span>
              </div>
            </div>
          </div>
        </bd-draggable-resizable>
      </div>
    </div>
    <div v-else class="no-compt">
      <span class="msg-tip">请拖入组件</span>
    </div>
  </div>
</template>

<script>
import Cell from "../design/Cell.vue";
import VueGridLayout from "vue-grid-layout";
import { mapState, mapGetters, mapMutations } from "vuex";
import { getFieldFromDsMap, objDeepCopy, getTimeFromOffset } from "../../utils/comonFunc.js";
import { windowResize } from "../../utils/comonFunc.js";
import BdDraggableResizable from "bd-draggable-resizable";
import DragResizeMixins from "../../utils/dragResizeMixins.js";
export default {
  props: ["vscompt", "scaleRatio"],
  components: {
    Cell,
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    BdDraggableResizable
  },
  mixins: [DragResizeMixins],
  data() {
    return {
      fieldArry: [],
      linkArray: [],
      objArray: {}, //组件-条件对象,
      tabSubCompt: null
    };
  },
  mounted() {
    this.$set(this.vscompt, "isNeedResetLink", 0);
    this.relateQuery("init");
  },
  watch: {
    "vscompt.isNeedResetLink": {
      handler(newVal, oldVal) {
        if (newVal > 0) {
          // this.clearLink();
        }
      }
    },
    btnShow(newVal, oldVal) {
      if (newVal == "true") {
        let button = {
          comptSort: 0,
          type: "ElButton",
          blockInfo: {
            h: 4,
            i: 0,
            w: 6,
            x: 0,
            y: 30
          },
          comptAttrs: {
            btnType: "primary",
            label: "查询",
            methods: {
              clickHandle: "this.mobileQuery()"
            }
          }
        };

        if (this.pageCache.classTypeId == "1005") {
          button.blockInfo.w = 80;
          button.blockInfo.h = 30;
        }
        this.vscompt.comptAttrs.fieldList.unshift(button);
      } else {
        this.vscompt.comptAttrs.fieldList.splice(0, 1);
      }
    },
    isDSMapReady: {
      immediate: true, // immediate选项可以开启首次赋值监听
      handler(newVal, oldVal) {
        if (newVal) {
          for (let key in this.objArray) {
            //遍历组件-条件对象，将每个组件的关联条件塞入对应组件同时塞入vuex，供组件初始化查询使用
            let target = this.getComptById(key);
            if (target == null) {
              continue;
            }
            let linkageCondi = target.comptAttrs.linkageCondi || [];
            if (this.objArray[key].length != 0) {
              target.comptAttrs.isLinkage = false;
              linkageCondi.splice(0, linkageCondi.length);
              linkageCondi.push(...this.objArray[key]); //关联条件塞入对应组件
            }
          }
        }
      }
    }
  },
  computed: {
    btnShow() {
      return this.vscompt.comptAttrs.extendSetting.isNeedBtn;
    },

    layout() {
      let result = [];
      let height = 0;
      let list = this.vscompt.comptAttrs.fieldList || [];
      if (list.length > 0) {
        for (var item of list) {
          height += item.blockInfo.h;
          item.blockInfo.y = height;
          if(item.type=='ElButton'){
            item.blockInfo.y = 1000;
          }
          result.push(item.blockInfo);
        }
      }
      return result;
    },
    ...mapGetters({
      flatCompt: "PageDesign/getFlatCompt",
      isQuery: "PageDesign/isQuery"
    }),
    ...mapState({
      activedBlock: state => state.PageDesign.activedBlock,
      datasetMap: state => state.AnalyReportAttr.datasetMap,
      PCDialogVisible: state => state.PageDesign.PCDialogVisible,
      PCDialogPageInfo: state => state.PageDesign.PCDialogPageInfo,
      pageCache: state => state.HomeBody.pageCache,
      isDSMapReady: state => state.AnalyReportAttr.isDSMapReady
    })
  },
  methods: {
    getComptById(id) {
      var result;
      for (var item of this.flatCompt) {
        if (item.comptId == id) {
          result = item;
          break;
        }
      }
      return result;
    },
    upBlock(id) {
      // let tabId = this.vscompt.comptAttrs.fieldList;
      for (var compt of this.vscompt.comptAttrs.fieldList) {
        if (compt.comptSort == id) {
          // this.upActivedTab(list);
          // this.upActivedBlock(id);
          // this.upActivedId(compt);
          this.tabSubCompt = compt;
          break;
        }
      }
    },
    relateQuery(state) {
      if (state == "button") {
        let isQuery = this.isQuery(this.vscompt.comptAttrs);
        if (!isQuery) {
          this.$message.warning("必填字段不能为空");
          return;
        }
      }
      let queryCondis = sessionStorage.getItem("queryCondis");
      let queryCondiObj = {};
      let queryCondisArry = [];
      let pageId = this.pageCache.pageId;
      if (state == "init" && queryCondis != null) {
        queryCondiObj = JSON.parse(queryCondis);
        if (this.PCDialogVisible === true) {
          pageId = this.PCDialogPageInfo.pageId;
        }
        queryCondisArry = queryCondiObj[pageId] || [];
      }

      let fieldList = this.vscompt.comptAttrs.fieldList || [];
      /*
       objArray:组件-条件对象
       格式为:
       {
         comptId1:[{condition1},{condition2},{condition3}],
         comptId2:[{condition1}]
       }
      */
      let objArray = {};
      for (var compt of fieldList) {
        if (
          compt.comptAttrs.mainLinkageData &&
          compt.comptAttrs.mainLinkageData.length > 0
        ) {
          let queryCondisField = [];
          if (queryCondisArry.length > 0) {
            queryCondisField = queryCondisArry.filter(val => {
              return val.element_id == compt.comptAttrs.element_id;
            });
          }
          var linkData = compt.comptAttrs.mainLinkageData;
          for (var link of linkData) {
            var param = { compt_type: compt.type };
            let result = [];
            let subComp = compt.comptAttrs;
            param.rel_element_id = subComp.element_id;
            param.col_type = 2;
            param.exp_id = "";
            param.isFromQuery = true;
            param.rel_af_id = link.rel_af_id;
            let res = getFieldFromDsMap(this.datasetMap, {
              element_id: link.element_id,
              af_id: link.af_id
            });
            param.obj_id = res.tab_id || "";
            param.col_id = res.col_id || "";
            param.element_id = link.element_id;
            if (state != "init" && compt.type == "ElCascader") {
              if (queryCondisField.length > 0) {
                subComp.m_value = queryCondisField[0].m_value;
              }
              if (subComp.m_value.length > 0) {
                param.rule_value = (subComp.m_value || []).join(",");
              } else {
                param.rule_value = "";
              }
              param.m_value = subComp.m_value;
              param.conArea = subComp.conArea;
              param.symbol = 8; //=
              param.is_dim = 1;
              if (param.rule_value != "") result.push(objDeepCopy(param));
            } else if (compt.type == "ElNumber") {
              if (state == "init") {
                subComp.numList = objDeepCopy(subComp.defaultNumList);
              }
              if (queryCondisField.length > 0) {
                subComp.numList = queryCondisField[0].numList;
              }
              if (subComp.numList.length > 0) {
                let flag = false;
                if (subComp.numList.length == 1) {
                  flag = !Boolean(subComp.numList[0].m_value);
                } else if (subComp.numList.length == 2) {
                  flag =
                    !Boolean(subComp.numList[0].m_value) &&
                    !Boolean(subComp.numList[1].m_value);
                }
                if (flag) {
                  continue;
                }
                subComp.numList.forEach((val, idx) => {
                  param.rule_value = subComp.numList[idx].m_value;
                  param.symbol = subComp.numList[idx].label || "";
                  param.is_dim = 0;
                  // 查询组件的联动标记
                  param.numList = objDeepCopy(subComp.numList);
                  result.push(objDeepCopy(param));
                });
              }
              if (subComp.numList.length > 1) {
                result[0].radioCalcu = subComp.radioCalcu;
              } else {
                delete result[0].radioCalcu;
              }
            } else if (compt.type == "ElDatePicker") {
              if (queryCondisField.length > 0) {
                //组件的时间格式的长度小于等于查询条件的时间格式的程度才回填
                if(subComp.show_format && subComp.show_format.length <= queryCondisField[0].target_format){
                  subComp.m_value = queryCondisField[0].m_value;
                  subComp.noClean = true;
                }
              }
              if (subComp.m_value.length > 0) {
                //偏移量设置
                if(subComp.isSetDefault) {
                  let suffix = "";
                  let paramObj = [{type: 0, index: 0}]
                  if (subComp.cycleType === "daterange") {
                    paramObj = [{type: 1, index: 0}, {type: 1, index: 1}]
                  }
                  paramObj.forEach(obj => {
                    if (obj.type == 1) {
                      suffix = obj.index == 0 ? "1" : "2";
                    }
                    let offset = 0;
                    if ((subComp["timeOprCount" + suffix] || 0) != "") {
                      offset = subComp["timeOpr" + suffix] == 2 ? "-" + subComp["timeOprCount" + suffix] : subComp["timeOprCount" + suffix];
                      offset = parseInt(offset);
                    }
                    let time = getTimeFromOffset(subComp.show_format, offset);
                    if (subComp.m_value[obj.index] || subComp.m_value[obj.index] === 0) {
                      subComp.m_value[obj.index] = time
                    }
                  })
                }

                // 查询组件的联动标记
                param.isFromQuery = true;
                param.rel_af_id = link.rel_af_id;
                param.m_value = subComp.m_value;
                param.cycleType = subComp.cycleType;
                param.target_format = subComp.show_format;
                param.format = subComp.source_format;
                if (subComp.cycleType == "date") {
                  //单个值
                  param.rule_value = subComp.m_value[0] || "";
                  param.symbol = 3; //=
                  param.is_dim = 0;
                  if (param.rule_value != null && param.rule_value != "")
                    result.push(objDeepCopy(param));
                } else {
                  if (
                    subComp.m_value[0] != null &&
                    subComp.m_value[0] != "" &&
                    (subComp.m_value[1] != null && subComp.m_value[1] != "")
                  ) {
                    param.rule_value = subComp.m_value[0] || "";
                    param.symbol = 5; //>=
                    param.is_dim = 0;
                    result.push(objDeepCopy(param));
                    param.rule_value = subComp.m_value[1] || "";
                    param.symbol = 4; //<=
                    param.is_dim = 0;
                    result.push(objDeepCopy(param));
                  }
                }
              }
            } else if (compt.type == "ElInput") {
              // 查询组件的联动标记
              param.m_value = subComp.m_value;
              param.compt_symbol = subComp.symbol;
              param.is_dim = 0;
              if (state == "init" && subComp.isSetDefault) {
                param.rule_value = subComp.default_value + "" || "";
                param.symbol = subComp.defaultSymbol;
              }
              if (queryCondisField.length > 0) {
                subComp.m_value = queryCondisField[0].m_value;
                subComp.symbol = queryCondisField[0].symbol;
              }
              if (subComp.m_value != null && subComp.m_value != "") {
                param.rule_value = subComp.m_value || "";
                param.symbol = subComp.symbol;
              }
              // 如果rule_value属性没有，也不插入
              if (param.rule_value != "" && param.rule_value != undefined) result.push(objDeepCopy(param));
            }
            if (objArray[link.comptId]) {
              objArray[link.comptId].push(...result);
            } else {
              objArray[link.comptId] = result;
            }
          }
        }
      }
      this.objArray = objArray;
      this.linkArray = [];
      for (let key in objArray) {
        //遍历组件-条件对象，将每个组件的关联条件塞入对应组件同时塞入vuex，供组件初始化查询使用
        let target = this.getComptById(key);
        if (target == null) {
          continue;
        }
        if (state != "init") {
          target.comptAttrs.isLinkage = true;
          let linkageCondi = target.comptAttrs.linkageCondi || [];
          linkageCondi.splice(0, linkageCondi.length);
          linkageCondi.push(...objArray[key]); //关联条件塞入对应组件
        }
        let stackData = { comptId: key, param: objArray[key] };
        this.linkArray.push(stackData);
        if (this.linkArray.length > 0) {
          this.upLinkStack(this.linkArray); //所有关联条件塞入vuex，被关联组件初始化会去该数组取值
          target.comptAttrs.linkageCondi.push(...objArray[key]); //关联条件塞入对应组件
        }
      }
    },
    clearLink() {
      let fieldList = this.vscompt.fieldList || [];
      for (var compt of fieldList) {
        if (
          compt.comptAttrs.mainLinkageData &&
          compt.comptAttrs.mainLinkageData.length > 0
        ) {
          var linkData = compt.comptAttrs.mainLinkageData;
          for (var link of linkData) {
            var param = {};
            let subComp = compt.comptAttrs;
            param.rel_element_id = subComp.element_id;
            param.col_type = 2;
            param.exp_id = "";
            let res = getFieldFromDsMap(this.datasetMap, {
              element_id: link.element_id,
              af_id: link.af_id
            });
            param.obj_id = res.tab_id || "";
            param.col_id = res.col_id || "";
            param.element_id = link.element_id;
            var target = this.getComptById(link.comptId);
            if (target == null) {
              continue;
            }
            let linkageCondi = target.comptAttrs.linkageCondi || [];
            for (let index2 = 0; index2 < linkageCondi.length; index2++) {
              const element = linkageCondi[index2];
              if (
                element.rel_element_id == param.rel_element_id &&
                element.element_id == param.element_id &&
                element.obj_id == param.obj_id
              ) {
                target.comptAttrs.linkageCondi.splice(index2, 1);
                break;
              }
            }
          }
        }
      }
    },
    isShowName(compt) {
      let result = false;
      let setting = compt.comptAttrs.extendSetting;
      if (setting && setting["comptName.show"] == true) {
        result = true;
      }
      return result;
    },
    resizedEvent() {
      windowResize();
    },
    ...mapMutations({
      upActivedId: "PageDesign/upActivedId",
      upActivedBlock: "PageDesign/upActivedBlock",
      upLinkStack: "PageDesign/upLinkStack"
    })
  }
};
</script>

<style lang="scss" scoped>
$border1: #afc0d0; // 边框色1
$main-color: #409eff; //主色调

.has-compt,
.no-compt {
  height: 100%;
  .msg-tip {
    display: block;
    text-align: center;
    font-size: 20px;
    color: #ccc;
    position: relative;
    top: 50%;
    transform: translateY(-50%);
  }
}
.vue-grid-item {
  border: 1px dashed $border1;
  // overflow: auto
  &.active {
    border: 1px dashed $main-color;
  }

  &:hover {
    box-shadow: 0 0 3px 3px rgba(204, 204, 204, 0.7);
  }
}

.compt-nodata-tip {
  position: absolute;
  top: 0;
  left: 0px;
  right: 0px;
  color: #ccc;
  font-size: 12px;
  background: #fff;
  height: 100%;
  text-align: center;
  span {
    font-size: 20px;
    display: block;
    position: relative;
    top: 50%;
    transform: translateY(-50%);
  }
}
.compt-title {
  color: #333;
  font-size: 18px;
  padding-top: 3px;
  padding-left: 5px;
  padding-bottom: 3px;
  text-align: left;
}
.no-title {
  height: 100%;
}
.has-title {
  height: 100%;
  margin-top: -30px;
  padding-top: 30px;
}
.block-menu {
  position: absolute;
  top: 0;
  right: 5px;
  cursor: pointer;
  color: #409cfb;
  width: 6px;
  height: 20px;
  padding: 0 5px;
  .el-dropdown-link {
    display: block;
    word-break: break-word;
    line-height: 5px;
  }
}

.query-btn {
  float: left;
  margin-top: 9px;
  margin-left: 25px;
}
/deep/.bgsrc .no-title .el-form-item .el-form-item__label {
  color: #fff;
}
/deep/.bgsrc
  .no-title
  .el-form-item
  .el-form-item__content
  .el-date-editor
  .el-input__inner {
  background: #333;
  color: #fff;
}
/deep/.mobile-cell{
  .el-form-item__label{
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
<style>
.bigscreen-body-wrap .el-picker-panel.el-date-picker.el-popper {
  background-color: #333;
}
.bigscreen-body-wrap .el-picker-panel.el-date-picker.el-popper .el-picker-panel__footer{
  background-color: #333;
}
.bigscreen-body-wrap .el-picker-panel.el-date-picker.el-popper .el-picker-panel__footer .el-button--default{
  background-color: #333;
}
.bigscreen-body-wrap .el-date-table td.next-month,
.el-date-table td.prev-month {
  color: #606266;
}

.bigscreen-body-wrap .el-picker-panel {
  color: #fff;
}
.bigscreen-body-wrap .el-date-table th,
.bigscreen-body-wrap .el-picker-panel__icon-btn,
.bigscreen-body-wrap .el-date-picker__header-label {
  color: #fff;
}
</style>
