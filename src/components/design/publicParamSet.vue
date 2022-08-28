<template>
  <el-dialog
    size="mini"
    title="参数设置"
    width="653px"
    :visible.sync="paramSetDiaVis"
    :append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    class="paddingt0"
  >
    <div class>
        <el-tabs class="center-tabs" v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="内部参数" name="inner">
            <el-container>
            <el-aside width="185px" class="param-aside">
              <div style="height:34px">
                <div class="add-field">参数新增</div>
                <el-tooltip class="field-icon" effect="dark" content="新增" placement="top">
                  <i class="icon-A10417_addition" @click="addParam"></i>
                </el-tooltip>
              </div>
              <div style="height:215px;">
                <GeminiScrollbar class="my-scroll-bar">
                  <div style="height:100%; padding-right:20px;">
                    <div v-for="(item,index) in paramList" class="param-item-wrap">
                      <div
                        v-bind:key="item.id"
                        :class="{'active':curParam==item.id,'param-item':true}"
                        @click="changeParam(item)"
                      >
                        <span>{{ item.name }}</span>
                      </div>
                      <el-tooltip class="field-icon" effect="dark" content="删除" placement="top">
                        <i class="icon-A10065_delete" @click="deleteParam(index)"></i>
                      </el-tooltip>
                    </div>
                  </div>
                </GeminiScrollbar>
              </div>
            </el-aside>
            <el-main class="param-main">
              <el-checkbox
                :indeterminate="isIndeterminate1"
                v-model="checkAll1"
                @change="handleCheckAllChange"
                :disabled="curParam=='' || datasets.length==0"
              >全选</el-checkbox>
              <div class="horizon-split-line"></div>
              <div style="width:100%;height:200px;">
                <el-scrollbar style="height:100%;" :native="false" :noresize="false" tag="section">
                  <el-checkbox-group
                    v-model="checkedDataset"
                    @change="handleCheckedDsChange"
                    ref="checkgroup"
                  >
                    <div v-for="(item,index) in datasets" class="check-item" v-show="curParam!=''">
                      <el-checkbox :key="item.afId" :label="item.afId"></el-checkbox>
                      <div class="check-item-label">{{item.datasetName}}</div>
                      <el-select
                        v-model="dsSelectList[index]"
                        placeholder="请选择"
                        style="width:130px;"
                        size="mini"
                      >
                        <el-option
                          v-for="option in datasetMap[item.afId] || []"
                          :key="option.element_id"
                          :label="option.element_name"
                          :value="option.element_id"
                          v-if="!option.isNewCol"
                        ></el-option>
                      </el-select>
                    </div>
                  </el-checkbox-group>
                </el-scrollbar>
              </div>
            </el-main>
            </el-container>
          </el-tab-pane>
          <el-tab-pane label="外部参数" name="outer">
            <el-container>
              <OuterParam ref="outparam" v-if="paramSetDiaVis"/>
            
            </el-container>
          </el-tab-pane>
        </el-tabs>
      </el-container>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="upParamSetDiaVis(false)">取 消</el-button>
      <el-button type="primary" @click="saveParamSet" size="mini">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { mapState, mapGetters, mapMutations } from "vuex";
import { objDeepCopy } from "../../utils/comonFunc";
import OuterParam from './OuterParamSet.vue'
export default {
  components: {
    OuterParam
  },
  data() {
    return {
      activeName:'inner',
      paramList: [],
      datasets: [],
      compts2: [],
      checkedDataset: [],
      isIndeterminate1: true,
      checkAll1: false,
      curParam: "",
      paramCounter: 0, //参数计数器
      paramSelData: {},
      dsSelectList: [],
      dsSelOptions: {} //数据集下拉框选项
    };
  },
  mounted() {},
  watch: {
    paramSetDiaVis(newVal) {
      if (newVal) {
        this.initDsInfo();
        let paramInfo = this.pageList[0]["pageParams"] || [];
        /* paramInfo = paramInfo.filter(val => {
          return val.type === 'inner';
        }) */
        if (paramInfo.length > 0) {
          this.initParamInfo(paramInfo);
        }
      }
    }
  },
  computed: {
    ...mapState({
      datasetMap: state => state.AnalyReportAttr.datasetMap,
      pageList: state => state.PageDesign.pageList
    }),
    ...mapGetters({
      getComptAfIds: "PageDesign/getComptAfIds"
    }),
    paramSetDiaVis: {
      get() {
        return this.$store.state.PageDesign.paramSetDiaVis;
      },
      set(value) {
        this.upParamSetDiaVis(value);
      }
    }
  },
  methods: {
    handleClick(tab, event) {
      
    },
    ...mapMutations({
      upParamSetDiaVis: "PageDesign/upParamSetDiaVis"
    }),
    checkCurParamState(isCheckAll = false) {
      let flag = true;
      let curParamInfo = {};
      if(this.paramList.length==0){
        return flag;
      }
      for (let index = 0; index < this.paramList.length; index++) {
        const element = this.paramList[index];
        if (element.id == this.curParam) {
          curParamInfo = element;
          break;
        }
      }
      let warnTip = `内部参数${curParamInfo.name || ""}未完成设置`;
      // 1.检查复选框有选中，但下拉框没选中  2.检查一个都没勾
      if (!this.validSelect() || this.checkedDataset.length == 0) {
        this.$message({
          message: warnTip,
          type: "warning"
        });
        flag = false;
      } else if (isCheckAll) {
        //检查所有参数设置
        for (let index = 0; index < this.paramList.length; index++) {
          const element = this.paramList[index];
          if (element.id == this.curParam) continue;
          let paramSet = this.paramSelData[element.id] || {};
          if (
            paramSet.checkedDataset == undefined ||
            paramSet.checkedDataset.length == 0
          ) {
            this.$message({
              message: `内部参数${element.name || ""}未完成设置`,
              type: "warning"
            });
            flag = false;
            break;
          }
        }
      }
      return flag;
    },
    saveParamSet() {
      if (!this.checkCurParamState(true)) return;
      if (!this.$refs.outparam.checkCurParamState(true)) return;
      this.paramSelData[this.curParam] = {
        checkedDataset: objDeepCopy(this.checkedDataset),
        dsSelectList: objDeepCopy(this.dsSelectList)
      };
      this.saveParamInfo();
      this.upParamSetDiaVis(false);
    },
    changeParam(item) {
      if (!this.checkCurParamState()) return;
      this.paramSelData[this.curParam] = {
        checkedDataset: objDeepCopy(this.checkedDataset),
        dsSelectList: objDeepCopy(this.dsSelectList)
      };
      this.setActiveParam(item);
    },
    setActiveParam(item) {
      this.curParam = item.id;
      let curParamInfo = this.paramSelData[item.id] || {};
      this.dsSelectList = objDeepCopy(curParamInfo.dsSelectList || []);
      this.checkedDataset = objDeepCopy(curParamInfo.checkedDataset);
      this.handleCheckedDsChange(this.checkedDataset);
    },
    handleCheckAllChange(val) {
      let arr1 = [];
      if (val) {
        for (let index = 0; index < this.datasets.length; index++) {
          const element = this.datasets[index];
          arr1.push(element.afId);
        }
      }
      this.checkedDataset = arr1;
      this.isIndeterminate1 = false;
    },
    handleCheckedDsChange(value) {
      let checkedCount = value.length;
      let comptLength = this.datasets.length;
      this.checkAll1 = checkedCount >= comptLength && checkedCount > 0;
      this.isIndeterminate1 = checkedCount > 0 && checkedCount < comptLength;
    },
    addParam() {
      // 如果之前有设过，要查找到最大的计数
      let max = 0;
      for (const param1 of this.paramList) {
        let paramLen = param1.id.indexOf("parameter") > -1 ? 9 : 5;
        const num1 = parseInt(param1.id.substring(paramLen));
        max = num1 > max ? num1 : max;
      }
      this.paramCounter = max;
      this.paramCounter++;
      let id = "parameter" + this.paramCounter;
      this.paramList.push({
        id: id,
        name: id,
        dsMapList: {}
      });
      let dsSelectList = [];
      this.datasets.forEach(item => {
        dsSelectList.push("");
      });
      this.paramSelData[id] = {
        checkedDataset: [],
        dsSelectList: objDeepCopy(dsSelectList)
      };
      let curParamId = this.curParam;
      if (
        !this.paramList.some(item => {
          return item.id == curParamId;
        })
      ) {
        this.setActiveParam(this.paramList[0]);
      }
    },
    //校验右边选中复选框时是否选中下拉框内容
    validSelect() {
      // let nodes = document.getElementById("checkgroup").children;
      let nodes = this.$refs.checkgroup.$el.children;
      let flag = true;
      for (let index = 0; index < nodes.length; index++) {
        const node = nodes[index];
        if (
          node.children[0].className.indexOf("is-checked") > -1 &&
          this.dsSelectList[index] == ""
        ) {
          flag = false;
          break;
        }
      }
      return flag;
    },
    // 初始化右边数据集基本信息
    initDsInfo() {
      let datasets = [];
      for (const afId of this.getComptAfIds) {
        let dataset = this.datasetMap[afId] || [];
        datasets.push({
          datasetName: dataset.length > 0 ? dataset[0].af_name || "" : "",
          afId: afId
        });
      }
      this.datasets = objDeepCopy(datasets);
    },
    saveParamInfo() {
      let res = [];
      for (let index = 0; index < this.paramList.length; index++) {
        const element = this.paramList[index];
        let dsList = {};
        let paramData = this.paramSelData[element.id];
        if (paramData.checkedDataset.length > 0) {
          for (let index2 = 0; index2 < this.datasets.length; index2++) {
            const element = this.datasets[index2];
            const afId1 = element.afId;
            if (paramData.checkedDataset.includes(afId1)) {
              dsList[afId1] = paramData.dsSelectList[index2];
            }
          }
        }
        res.push({
          id: element.id,
          name: element.name,
          type: 'inner',
          dsList: dsList
        });
      }
      let outParam = this.$refs.outparam.saveParamInfo();
      res = res.concat(outParam);
      this.pageList[0]["pageParams"] = res;
    },
    initParamInfo(paramInfo) {
      let paramList = [],
        paramSelData = {};
      for (let index = 0; index < paramInfo.length; index++) {
        const element = paramInfo[index];
        if(element.type && element.type !== 'inner'){
          continue;
        }
        paramList.push({
          id: element.id,
          name: element.name
        });
        let checkedDataset = [];
        let dsSelectList = new Array(this.datasets.length).fill("");
        for (const key in element.dsList || {}) {
          checkedDataset.push(key);
          for (let index2 = 0; index2 < this.datasets.length; index2++) {
            const element2 = this.datasets[index2];
            if (element2.afId == key) {
              dsSelectList[index2] = element.dsList[key];
              break;
            }
          }
        }
        paramSelData[element.id] = {
          checkedDataset: objDeepCopy(checkedDataset),
          dsSelectList: objDeepCopy(dsSelectList)
        };
      }
      this.paramList = paramList;
      this.paramSelData = paramSelData;
      if(this.paramList.length>0){
        this.setActiveParam(this.paramList[0]);
      }
    },
    deleteParam(idx) {
      this.paramList.splice(idx, 1);
      if (this.paramList.length == 0) {
        this.curParam = "";
        return;
      }
      let flag = this.paramList.some(item => {
        return item.id == this.curParam;
      }); //当前选中的是否还在
      if (!flag) {
        this.setActiveParam(this.paramList[0]);
      }
    },
    getDataSetName(afId) {
      //获取数据集名称
      let dataSetName = "";
      for (let inx = 0; inx < this.allDataSetData.length; inx++) {
        if (this.allDataSetData[inx].af_id == afId) {
          dataSetName = this.allDataSetData[inx].af_name;
          break;
        }
      }
      return dataSetName;
    }
  }
};
</script>

<style lang="scss" scoped>
$border-clr01: #dcdfe6; // 边框色1
$main-color: #409eff; //主色调
$bg-clr01: #ecf5ff; // 块背景色1
$txt-clr01: #67c23a; // 文字颜色1
$txt-clr02: #fff; // 文字颜色2
$txt-clr03: #606266; // 文字颜色3
.field-icon {
  margin-left: 5px;
  cursor: pointer;
  color: #409eff;
  &:hover {
    color: #66b1ff;
  }
}
.title {
  margin-bottom: 10px;
}
.add-field {
  display: inline-block;
}
.field-cont {
  width: 210px;
  display: inline-block;
}
.filter-cont {
  width: 350px;
  float: right;
  padding-top: 5px;
}
.param-item-wrap {
  margin-bottom: 7px;
  &:last-child {
    margin-bottom: 0;
  }
}
.param-item {
  display: inline-block;
  width: 145px;
  height: 28px;
  border: 1px solid $border-clr01;
  border-radius: 3px;
  // margin-bottom: 10px;
  line-height: 26px;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 10px;
  font-size: 12px;
  &.active {
    border-color: $main-color;
    background-color: $bg-clr01;
    color: $main-color;
  }
  & + i {
    vertical-align: 8px;
  }
  span {
    // float: left;
  }
}

/deep/.el-scrollbar__wrap {
  overflow-x: hidden;
}

.el-scrollbar .el-scrollbar__view .el-select-dropdown__item .field-icon {
  color: #606266;
  &:hover {
    color: #66b1ff;
  }
}

.el-scrollbar
  .el-scrollbar__view
  .el-select-dropdown__item.selected
  .field-icon {
  color: $main-color;
}

.check-item {
  /deep/.el-checkbox {
    margin-right: 6px;
    .el-checkbox__label {
      display: none;
    }
  }
  .check-item-label {
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 238px;
    color: $txt-clr03;
    height: 28px;
    line-height: 28px;
    font-size: 12px;
    vertical-align: -9px;
  }
  /deep/.el-checkbox.is-checked .check-item-label {
    color: $main-color;
  }
  /deep/.el-select {
    margin-left: 10px;
  }
  /deep/.el-select {
    .el-input__inner {
      border: none;
      // height: 17px;
      // line-height: 17px;
      text-overflow: ellipsis;
    }
  }
}
.param-aside {
  border-right: 1px dashed $border-clr01;
}
.horizon-split-line {
  margin: 10px 0px 20px;
  border-bottom: 1px dashed $border-clr01;
}
.param-main {
  padding: 0 0 0 20px;
}

  /deep/.el_tabs__nav-scroll {
    margin-left: calc(50% - 76px);
  }

</style>
