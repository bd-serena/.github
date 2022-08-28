<template>
  <div class="query">
    <div class="query-block" v-for="compt in vscompt.fieldList">
      <Cell :key="compt.comptSort" :isDesign="true" :vscompt="compt"></Cell>
    </div>
    <div class="query-btn">
      <el-button
        size="mini"
        v-if="vscompt.extendSetting.isNeedBtn=='true'"
        @click="relateQuery('button')"
        :type="'primary'"
        :plain="'plain'"
      >查询</el-button>
    </div>
  </div>
</template>

<script>
import Cell from "../design/Cell.vue";
import { mapState, mapGetters, mapMutations } from "vuex";
import { getFieldFromDsMap, objDeepCopy, getTimeFromOffset } from "../../utils/comonFunc.js";
export default {
  props: ["vscompt"],
  components: {
    Cell
  },
  data() {
    return {
      activedId: "",
      fieldArry: [],
      linkArray: [],
      objArray: {} //组件-条件对象
    };
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
    relateQuery(state) {
      if (state == "button") {
        let isQuery = this.isQuery(this.vscompt);
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

      let fieldList = this.vscompt.fieldList || [];
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
            if (compt.type == "ElCascader") {
              if (queryCondisField.length > 0) {
                subComp.m_value = queryCondisField[0].m_value;
              }
              if (subComp.m_value.length > 0) {
                param.rule_value = (subComp.m_value || []).join(",");
              } else {
                param.rule_value = "";
              }
              if( subComp.conArea =='mutiple' && queryCondisField.length >0) {//参数设置多选回显
                subComp.treeSelVal = queryCondisField[0].treeSelVal||[];
              }
              param.m_value = subComp.m_value;
              param.conArea = subComp.conArea;
              param.symbol = 8; //=
              param.is_dim = 1;
              if (param.rule_value != "") result.push(objDeepCopy(param));
            } else if (compt.type == "ElNumber") {
              if (state == "init" && this.pageCache.operation !== undefined) {
                subComp.numList = objDeepCopy(subComp.defaultNumList);
              }
              if (queryCondisField.length > 0) {
                subComp.numList = queryCondisField[0].numList;
              }
              if (subComp.numList.length > 0) {
                let flag = false;
                if (subComp.numList.length == 1) {
                  if (subComp.numList[0].label !== 20 && subComp.numList[0].label !== 21) {
                    flag = !Boolean(subComp.numList[0].m_value)
                  }
                } else if (subComp.numList.length == 2 && subComp.symbol !== 20 && subComp.symbol !== 21) {
                  for (let i = 0; i < 2; i++) {
                    if (subComp.numList[i].label !== 20 && subComp.numList[i].label !== 21) {
                      flag = flag || !Boolean(subComp.numList[i].m_value)
                        // !Boolean(subComp.numList[1].m_value);
                    }
                  }
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
            } else if (compt.type == "ElInput") {
              // 查询组件的联动标记
              if (queryCondisField.length > 0) {
                subComp.m_value = queryCondisField[0].m_value;
                subComp.symbol = queryCondisField[0].symbol;
              }
              param.m_value = subComp.m_value;
              param.compt_symbol = subComp.symbol;
              param.is_dim = 0;
              if (state == "init" && subComp.isSetDefault) {
                param.rule_value = subComp.default_value + "" || "";
                param.symbol = subComp.defaultSymbol;
              }
              if (subComp.m_value != null && subComp.m_value != "") {
                param.rule_value = subComp.m_value || "";
                param.symbol = subComp.symbol;
              }
              if (subComp.symbol === 20 || subComp.symbol === 21) {
                param.rule_value = null;
                param.symbol = subComp.symbol;
              }
              // 如果rule_value属性没有，也不插入
              if (param.rule_value != "" && param.rule_value !== undefined) result.push(objDeepCopy(param));
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
                if(subComp.isSetDefault && state === 'init') {
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
                param.m_value = subComp.m_value;
                param.cycleType = subComp.cycleType;
                param.target_format = subComp.show_format;
                param.format = subComp.source_format;

                //时间格式去掉带“-”
                var value = subComp.m_value[0]
                // if (typeof (value) == "string") {
                //   value = value.replace(/-/g, '')
                // } else if (value) {
                //   try {
                //     value = value.toLocaleDateString().replace(/-/g, '')
                //   } catch (e) { }
                // }
                subComp.m_value[0] = value;
                if (subComp.cycleType == "date") {
                  //单个值
                  param.rule_value = subComp.m_value[0] || "";
                  param.symbol = 3; //=
                  param.is_dim = 0;
                  if (param.rule_value != null && param.rule_value != "")
                    result.push(objDeepCopy(param));
                } else {
                  if (!subComp.m_value[0] && !subComp.m_value[1]) { // 如果双空就退出

                  } else {
                    param.rule_value = subComp.m_value[0] || "";
                    param.symbol = 5; //>=
                    param.is_dim = 0;
                    result.push(objDeepCopy(param));

                    value = subComp.m_value[1]
                    // if (typeof (value) == "string") {
                    //   value = value.replace(/-/g, '')
                    // } else if (value) {
                    //   try {
                    //     value = value.toLocaleDateString().replace(/-/g, '')
                    //   } catch (e) { }
                    // }
                    param.rule_value = value || "";
                    param.symbol = 4; //<=
                    param.is_dim = 0;
                    result.push(objDeepCopy(param));
                  }
                }
              }
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
    ...mapMutations({
      upLinkStack: "PageDesign/upLinkStack"
    })
  },
  computed: {
    ...mapGetters({
      flatCompt: "PageDesign/getFlatCompt",
      isQuery: "PageDesign/isQuery"
    }),
    ...mapState({
      s_edcuiCompts: state => state.PageDesign.s_edcuiCompts,
      datasetMap: state => state.AnalyReportAttr.datasetMap,
      PCDialogVisible: state => state.PageDesign.PCDialogVisible,
      PCDialogPageInfo: state => state.PageDesign.PCDialogPageInfo,
      pageCache: state => state.HomeBody.pageCache,
      isDSMapReady: state => state.AnalyReportAttr.isDSMapReady
    })
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
  }
};
</script>
<style lang="scss" scoped>
/* yxq */
.el-button,
.el-form {
  display: inline-block;
}

.el-form {
  width: 300px;
}

.el-date-editor.el-input {
  width: 200px;
}
.query {
  width: 100%;
  height: 100%;
  /deep/.el-form-item__label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
.query-block {
  float: left;
  border: 1px solid transparent;
  height: 40px;
  margin: 5px;
  padding-top: 4px;
}
.query-btn {
  float: left;
  margin-top: 9px;
  margin-left: 25px;
}
</style>

