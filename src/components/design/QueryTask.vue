<template>
  <div>
    <el-form :model="taskObj" :rules="taskRules" ref="taskForm">
      <el-row>
        <el-col :span="24">
          <el-form-item label="导出格式" prop="exportType">
            <el-select
              v-model="taskObj.exportType"
              placeholder="请选择"
              size="mini"
              style="width: 160px"
            >
              <el-option
                v-for="item in exportOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="开始日期" prop="beginTime">
            <el-date-picker
              v-model="taskObj.beginTime"
              size="mini"
              type="date"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              editable
              :picker-options="beginTime"
              clearable
              @change="dataComponentInit"
              placeholder="选择日期"
              style="width: 160px"
            >
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束日期" prop="endTime">
            <el-date-picker
              style="width: 160px"
              v-model="taskObj.endTime"
              size="mini"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              type="date"
              editable
              clearable
              :picker-options="endTime"
              @change="dataComponentInit"
              placeholder="选择日期"
            >
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12" v-show="taskObj.pushType === '2'">
          <el-form-item label="发送周期" prop="pushType">
            <el-select
              v-model="taskObj.pushType"
              placeholder="请选择"
              size="mini"
              style="width: 60px"
            >
              <el-option
                v-for="item in dateOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col
          :span="12"
          style="float: right"
          v-show="taskObj.pushType === '2'"
        >
          <el-form-item label="具体时间" prop="fixedPointTime">
            <el-time-picker
              v-model="taskObj.fixedPointTime"
              clearable
              size="mini"
              value-format="HH:mm:ss"
              format="HH:mm"
              style="width: 100px"
              placeholder="请选择"
            >
            </el-time-picker>
          </el-form-item>
        </el-col>
        <el-col :span="7" v-show="taskObj.pushType === '3'">
          <el-form-item label="发送周期" prop="pushType">
            <el-select
              v-model="taskObj.pushType"
              placeholder="请选择"
              size="mini"
              style="width: 60px"
            >
              <el-option
                v-for="item in dateOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="7" v-show="taskObj.pushType === '3'">
          <el-form-item label="每月第" prop="fixedPointDate">
            <el-select
              v-model="taskObj.fixedPointDate"
              placeholder="请选择"
              size="mini"
              style="width: 90px"
            >
              <el-option
                v-for="item in dayDataPickOption"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col
          v-show="taskObj.pushType === '3'"
          :span="2"
          style="line-height: 40px"
        >
          <span>天</span>
        </el-col>
        <el-col :span="8" class="mini-label" v-show="taskObj.pushType === '3'">
          <el-form-item label="时间" prop="fixedPointTime">
            <el-time-picker
              style="width: 100px"
              v-model="taskObj.fixedPointTime"
              clearable
              size="mini"
              value-format="HH:mm:ss"
              format="HH:mm"
              placeholder="请选择"
            >
            </el-time-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item style="text-align: right">
            <el-button size="mini" @click="resetTask">重 置</el-button>
            <el-button
              class="content-submit"
              type="primary"
              size="mini"
              @click="addTask"
              ></i
              >新 增</el-button
            >
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="30">
        <!-- 任务管理 -->
        <el-col :span="24">
          <el-collapse value="1" class="collapse-table">
            <el-collapse-item title="任务管理" name="1">
              <el-table
                :data="taskData"
                size="mini"
                style="width: 100%"
                height="250"
              >
                <el-table-column prop="createTime" width="140" label="创建时间">
                </el-table-column>
                <el-table-column
                  :show-overflow-tooltip="true"
                  prop="queryWhereDesc"
                  width="140"
                  label="查询条件"
                >
                </el-table-column>
                <el-table-column prop="nextPushTime" label="下次取数时间">
                </el-table-column>
                <el-table-column label="操作" width="100">
                  <template slot-scope="scope">
                    <el-popover
                      ref="showDetail"
                      placement="top-start"
                      trigger="click"
                      popper-class="detail-popover"
                      style="overflow: hidden"
                    >
                      <div class="showDetail">
                        <ul style="line-height: 35px; height: 114px">
                          <li>
                            <span style="white-space: nowrap"
                              >开始时间：{{ scope.row.beginTime }}</span
                            >
                          </li>
                          <li>
                            <span style="white-space: nowrap"
                              >结束时间：{{ scope.row.endTime }}</span
                            >
                          </li>
                          <li>
                            <span style="white-space: nowrap"
                              >发送周期：{{ scope.row.sendPeriodDesc }}</span
                            >
                          </li>
                        </ul>
                      </div>
                      <span slot="reference">
                        <el-tooltip
                          class="item"
                          effect="dark"
                          content="详情"
                          placement="top-start"
                        >
                          <span
                            class="icon-A10181_browseCount table-icon"
                            @click="showDetail"
                          ></span>
                        </el-tooltip>
                      </span>
                    </el-popover>
                    <el-tooltip
                      :hide-after="1000"
                      class="item"
                      effect="dark"
                      content="删除"
                      placement="top-start"
                    >
                      <span
                        class="icon-A10065_delete table-icon"
                        @click="deleteTask(scope.row.taskId)"
                      ></span>
                    </el-tooltip>
                  </template>
                </el-table-column>
              </el-table>
            </el-collapse-item>
          </el-collapse>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>


<script>
import { mapState, mapGetters, mapMutations, mapActions } from "vuex";
export default {
  data() {
    return {
      isShowDetail: false,
      isSubmit: false,
      taskData: [],
      exportOptions: [
        {
          value: "2",
          label: "excel",
        },
        {
          value: "5",
          label: "csv",
        },
      ],
      dateOptions: [
        {
          value: "2",
          label: "日",
        },
        {
          value: "3",
          label: "月",
        },
      ],
      timeStampList: [
        {
          value: "yyyy",
          label: "yyyy",
        },
        {
          value: "yyyyMM",
          label: "yyyyMM",
        },
        {
          value: "yyyyMMdd",
          label: "yyyyMMdd",
        },
        {
          value: "yyyyMMddHHmmss",
          label: "yyyyMMddHHmmss",
        },
      ],
      taskRules: {
        exportType: [
          { required: true, message: "导出格式必填项", trigger: "" },
        ],
        pushType: [
          { required: true, message: "发送周期为必填项", trigger: "" },
        ],
        fixedPointTime: [
          { required: true, message: "具体时间为必填项", trigger: "" },
        ],
        fixedPointDate: [
          { required: true, message: "日期为必填项", trigger: "" },
        ],
        endTime: [{ required: true, message: "结束日期为必填项", trigger: "" }],
        beginTime: [
          { required: true, message: "开始日期为必填项", trigger: "" },
        ],
      },
      taskObj: {
        exportType: "2",
        addressee: [],
        pushType: "2",
        subjectTimeStamp: "yyyyMMdd",
        beginTime: "",
        endTime: "",
        subject: "",
        bodyText: "",
        fixedPointTime: "",
        fixedPointDate: "",
        taskTimeSuffix: "",
      },
      beginTime: {},
      endTime: {},
    };
  },
  computed: {
    queryTaskDialog: {
      get() {
        return this.$store.state.compt.queryTaskDialog;
      },
      set(value) {
        this.setQueryTaskDialog(value);
      },
    },
    dayDataPickOption() {
      let array = [];
      let curDayNum = this.mGetDate(
        new Date().getFullYear(),
        new Date().getMonth() + 1
      );
      for (let i = 1; i < curDayNum + 1; i++) {
        let day = i < 10 ? "0" + i : "" + i;
        let obj = {
          value: day,
          label: day,
        };
        array.push(obj);
      }
      return array;
    },
    ...mapState({
      s_edcuiCompts: (state) => state.compt.s_edcuiCompts,
      pageCache: (state) => state.HomeBody.pageCache,
      queryType: (state) => state.QueryTable.queryType,
    }),
    ...mapGetters({
      condiCols: "QueryTable/condiCols",
      resultCols: "QueryTable/resultCols",
      tableColumn: "QueryTable/tableColumn",
      summarizeCols: "QueryTable/summarizeCols",
    }),
  },
  methods: {
    resetTask() {
      this.$refs.taskForm.resetFields();
    },
    queryWhere() {
      let condiParam = this.s_edcuiCompts[0].comptAttrs.fieldList;
      this.tableData = [];
      let condiCont = this.queryType === "summarize" ? "汇总:有" : "汇总:无";
      for (let j = 0; j < condiParam.length; j++) {
        if (condiParam[j].comptAttrs.is_import) {
          let trackSymbol = condiParam[j].comptAttrs.import_symbol;
          let trackLabel = condiParam[j].comptAttrs.import_tabLabel;
          // let trackRelation = "";
          if (trackLabel) {
            switch (trackSymbol) {
              case "100":
                condiCont +=
                  " " +
                  condiParam[j].comptAttrs.col_chs_name +
                  ":" +
                  "跟踪群-在" +
                  trackLabel +
                  "中";
                break;
              case "101":
                condiCont +=
                  " " +
                  condiParam[j].comptAttrs.col_chs_name +
                  ":" +
                  "跟踪群-不包含" +
                  trackLabel;
                break;
              default:
                condiCont +=
                  " " + condiParam[j].comptAttrs.col_chs_name + ":默认";
                break;
            }
          } else {
            condiCont += " " + condiParam[j].comptAttrs.col_chs_name + ":默认";
          }
        } else {
          if (condiParam[j].comptAttrs.type == "ElButton") {
            //return false;
          } else if (condiParam[j].comptAttrs.type == "ElInput") {
            //文本类型
            let value = condiParam[j].comptAttrs.m_value;
            let rela = condiParam[j].comptAttrs.symbol; //10 包含 11 不包含 8 在…中（逗号隔开）9不在…中（逗号隔开）20为空 21不为空
            let relation = "";
            if (value == null) {
              value = "默认";
              condiCont +=
                " " + condiParam[j].comptAttrs.col_chs_name + ": " + value;
            } else {
              switch (rela) {
                case 10:
                  relation = "包含";
                  condiCont +=
                    " " +
                    condiParam[j].comptAttrs.col_chs_name +
                    ": " +
                    relation +
                    value;
                  break;
                case 11:
                  relation = "不包含";
                  condiCont +=
                    " " +
                    condiParam[j].comptAttrs.col_chs_name +
                    ":" +
                    relation +
                    value;
                  break;
                case 8:
                  condiCont +=
                    " " +
                    condiParam[j].comptAttrs.col_chs_name +
                    ":在" +
                    value +
                    "中（逗号隔开）";
                  break;
                case 9:
                  condiCont +=
                    " " +
                    condiParam[j].comptAttrs.col_chs_name +
                    ":不在" +
                    value +
                    "中（逗号隔开）";
                  break;
                case 20:
                  relation = "为空";
                  condiCont +=
                    " " +
                    condiParam[j].comptAttrs.col_chs_name +
                    ":" +
                    value +
                    relation;
                  break;
                case 21:
                  relation = "不为空";
                  condiCont +=
                    " " +
                    condiParam[j].comptAttrs.col_chs_name +
                    ":" +
                    value +
                    relation;
                  break;
              }
            }
          } else if (condiParam[j].comptAttrs.type == "ElDatePicker") {
            //日期
            if (condiParam[j].comptAttrs.m_value.length > 1) {
              //区间
              let data1 = condiParam[j].comptAttrs.m_value[0];
              let data2 = condiParam[j].comptAttrs.m_value[1];

              if (
                data1 != "" &&
                data1 != null &&
                data2 != "" &&
                data2 != null
              ) {
                condiCont +=
                  " " +
                  condiParam[j].comptAttrs.col_chs_name +
                  ":" +
                  data1 +
                  "至" +
                  data2;
              } else if (
                data1 != "" &&
                data1 != null &&
                (data2 == "" || data2 == null)
              ) {
                condiCont +=
                  " " + condiParam[j].comptAttrs.col_chs_name + ":" + data1;
              } else if (
                (data1 == "" || data1 == null) &&
                data2 != "" &&
                data2 != null
              ) {
                condiCont +=
                  " " + condiParam[j].comptAttrs.col_chs_name + ":" + data2;
              } else if (
                (data1 == "" || data1 == null) &&
                (data2 == "" || data2 == null)
              ) {
                condiCont +=
                  " " + condiParam[j].comptAttrs.col_chs_name + ":默认";
              }
            } else {
              let data1 = condiParam[j].comptAttrs.m_value[0];
              if (data1) {
                condiCont +=
                  " " + condiParam[j].comptAttrs.col_chs_name + ":" + data1;
              } else if (data1 == null || data1 == "") {
                condiCont +=
                  " " + condiParam[j].comptAttrs.col_chs_name + ":默认";
              }
            }
          } else if (condiParam[j].comptAttrs.type == "ElNumber") {
            let label_1 = "";
            let value_1 = "";
            let label_2 = "";
            let value_2 = "";
            if (
              condiParam[j].comptAttrs.numList[0].label != undefined &&
              condiParam[j].comptAttrs.numList[0].m_value != undefined
            ) {
              value_1 = condiParam[j].comptAttrs.numList[0].m_value;
              switch (condiParam[j].comptAttrs.numList[0].label) {
                case 1:
                  label_1 = "<";
                  break;
                case 2:
                  label_1 = ">";
                  break;
                case 3:
                  label_1 = "=";
                  break;
                case 4:
                  label_1 = "<=";
                  break;
                default:
                  label_1 = ">=";
                  break;
              }
            }
            if (condiParam[j].comptAttrs.numList.length > 1) {
              if (
                condiParam[j].comptAttrs.numList[1].label != undefined &&
                condiParam[j].comptAttrs.numList[1].m_value != undefined
              ) {
                value_2 = condiParam[j].comptAttrs.numList[1].m_value;
                switch (condiParam[j].comptAttrs.numList[1].label) {
                  case 1:
                    label_2 = "<";
                    break;
                  case 2:
                    label_2 = ">";
                    break;
                  case 3:
                    label_2 = "=";
                    break;
                  case 4:
                    label_2 = "<=";
                    break;
                  default:
                    label_2 = ">=";
                    break;
                }
              }
            }
            if (!value_1 && !value_2) {
              condiCont +=
                " " + condiParam[j].comptAttrs.col_chs_name + ":" + "默认";
            } else if (value_1 && value_2) {
              let radioCalcu = condiParam[j].comptAttrs.radioCalcu;
              radioCalcu = radioCalcu == "and" ? "且" : "或";
              condiCont +=
                " " +
                condiParam[j].comptAttrs.col_chs_name +
                ":" +
                label_1 +
                value_1 +
                radioCalcu +
                label_2 +
                value_2;
            } else if (label_1 && value_1) {
              condiCont +=
                " " +
                condiParam[j].comptAttrs.col_chs_name +
                ":" +
                label_1 +
                value_1;
            } else {
              condiCont +=
                " " +
                condiParam[j].comptAttrs.col_chs_name +
                ":" +
                label_2 +
                value_2;
            }
          } else if (condiParam[j].comptAttrs.type == "ElCascader") {
            let comptAttrs = condiParam[j].comptAttrs;
            let optionsString = "";

            //地市
            if (comptAttrs.m_value[0]) {
              if (comptAttrs.conArea === "single") {
                condiCont +=
                  comptAttrs.col_chs_name +
                  ":" +
                  comptAttrs.m_label[comptAttrs.m_label.length - 1];
              } else if (comptAttrs.conArea === "mutiple") {
                comptAttrs.m_label.forEach(function (value) {
                  optionsString += value + ",";
                });
                condiCont +=
                  comptAttrs.col_chs_name + ":" + optionsString.slice(0, -1);
              }
            } else if (!comptAttrs.m_value[0]) {
              condiCont += comptAttrs.col_chs_name + ":" + "默认";
            }
          }
        }
        condiCont += " ";
      }
      return condiCont;
    },
    submitTask() {
      let queryWhereDesc = this.queryWhere();
      let sendPeriodDesc = "";
      let secondTargetTime =
        this.taskObj.fixedPointTime.substring(
          0,
          this.taskObj.fixedPointTime.lastIndexOf(":") + 1
        ) + "00";
      if (this.taskObj.pushType === "2") {
        sendPeriodDesc = "每日" + secondTargetTime + "发送";
      } else {
        sendPeriodDesc =
          "每月" +
          this.taskObj.fixedPointDate +
          "日" +
          secondTargetTime +
          "发送";
      }
      let param = {
        beginTime: this.taskObj.beginTime + " 00:00:00", //任务起始时间   yyyy-MM-dd hh:mm:ss
        endTime: this.taskObj.endTime + " 23:59:59", //任务结束时间  yyyy-MM-dd hh:mm:ss
        pushType: this.taskObj.pushType,
        fixedPointDate: this.taskObj.fixedPointDate,
        fixedPointTime: secondTargetTime,
        pageId: this.pageCache.pageId,
        queryWhereDesc: queryWhereDesc,
        sendPeriodDesc: sendPeriodDesc,
        exportPageBean: "",
      };
      this.queryAfPropertyData({
        isNeedPaging: "0",
        isExport: true,
      })
        .then((val) => {
          // var param = {};
          val.is_need_trans = 1;
          val.is_watermark = "1";
          var waterStr =
            (sessionStorage.getItem("user_id") || "") +
            "\n" +
            (sessionStorage.getItem("user_name") || "") +
            "\n" +
            (new Date().toLocaleDateString() +
              " " +
              new Date().toTimeString().split(" ")[0]);
          val.watermark_msg = waterStr;

          let exportPageBean = {};
          exportPageBean.afQueryBean = val;
          try {
            exportPageBean.isEncrypt = 0; //不需要密码this.smsId
            exportPageBean.pageInfo = { pageName: this.pageCache.pageName };
            exportPageBean.asynExportInfo = {
              pageId: this.pageCache.pageId,
              userId: sessionStorage.getItem("user_id"),
              exportType: this.taskObj.exportType,
            };
            exportPageBean.exportType = this.taskObj.exportType;
          } catch (e) {
            console.error(e);
          }
          param.exportPageBean = exportPageBean;
          return this.addTaskData(param);
        })
        .then((response) => {
          if (response.data.respResult == "1") {
            this.queryTasks();
          } else {
            this.$message.error(response.data.respErrorDesc);
          }
        })
        .catch((err) => {
          // this.$message.error(err);
        });
    },
    paramValid() {
      // 保存前先进行校验
      if (this.taskObj.pushType !== "1") {
        let beginTime = new Date(this.taskObj.beginTime.replace(/-/, "/"));
        let endTime = new Date(this.taskObj.endTime.replace(/-/, "/"));
        if (beginTime > endTime) {
          this.$message.error("开始日期不可以大于结束日期");
          return false;
        }
      }
      this.submitTask();
    },
    addTask() {
      if (this.taskObj.pushType !== "3") {
        // 发送周期不是月份时去掉校验规则
        delete this.taskRules.fixedPointDate;
      }
      // 保存推送任务
      this.$refs.taskForm.validate((valid) => {
        if (valid) {
          this.paramValid();
        } else {
          return false;
        }
      });
    },
    deleteTask(id) {
      console.log(id);
      this.deleteTaskById(id)
        .then((val) => {
          if (val.status === 200 && val.data.respResult === "1") {
            this.queryTasks();
          }
        })
        .catch((err) => {
          this.$message.error("删除定时取数失败");
        });
    },
    showDetail() {
      this.showDetail = true;
    },
    closeDialog() {
      this.setQueryTaskDialog(false);
    },
    dataComponentInit() {
      let that = this;
      this.beginTime.disabledDate = function (time) {
        var todayYear = new Date().getFullYear();
        var todayMonth = new Date().getMonth();
        var todayDay = new Date().getDate();
        var todayTime = new Date(
          todayYear,
          todayMonth,
          todayDay,
          "00",
          "00",
          "00"
        ).getTime(); // 毫秒
        if (time.getTime() < todayTime) {
          return true;
        }
        // 大于结束时间
        if (that.taskObj.endTime) {
          let endDate = new Date(that.taskObj.endTime.replace(/-/, "/"));
          if (endDate < time.getTime()) {
            return true;
          }
        }
        return false;
      };
      this.endTime.disabledDate = function (time) {
        var todayYear = new Date().getFullYear();
        var todayMonth = new Date().getMonth();
        var todayDay = new Date().getDate();
        var todayTime = new Date(
          todayYear,
          todayMonth,
          todayDay,
          "00",
          "00",
          "00"
        ).getTime(); // 毫秒
        if (time.getTime() < todayTime) {
          return true;
        }
        // 小于开始时间
        if (that.taskObj.beginTime) {
          let beginTime = new Date(that.taskObj.beginTime.replace(/-/, "/"));
          if (beginTime > time.getTime()) {
            return true;
          }
        }
        return false;
      };
    },
    queryTasks() {
      let param = {
        pageId: this.pageCache.pageId,
      };
      this.queryTaskList(param)
        .then((val) => {
          if (val.status === 200 && val.data.respResult === "1") {
            console.log(val.data.respData);
            this.taskData = val.data.respData;
          }
        })
        .catch((err) => {
          this.$message.error("定时取数查询异常");
        });
    },
    mGetDate(year, month) {
      var d = new Date(year, month, 0);
      return d.getDate();
    },
    ...mapActions({
      queryAfPropertyData: "QueryTable/queryAfPropertyData",
      queryTaskList: "QueryTable/queryTaskList",
      deleteTaskById: "QueryTable/deleteTaskById",
      addTaskData: "QueryTable/addTask",
    }),
    ...mapMutations({
      setQueryTaskDialog: "compt/setQueryTaskDialog",
    }),
  },
  mounted() {
    this.queryTasks();
  },
  watch: {},
};
</script>

<style lang="scss" scoped>
.el-popover.err-pop-wrap .el-scrollbar__wrap {
  overflow-x: hidden;
  padding-right: 10px;
}

/deep/ .el-tabs__header {
  margin: 0 0 10px;
}
/deep/ .el-dialog__body {
  padding: 0px 20px 20px 20px !important;
}
/deep/ .table-icon {
  color: #409eff;
  font-size: 14px;
  margin-right: 10px;
  cursor: pointer;
}
/deep/ .liushui {
  margin-top: 10px;
}
/deep/ .el-input__inner {
  height: 24px;
  line-height: 24px;
  font-size: 12px;
}
/deep/ .star {
  color: #ff0000;
  margin-right: 5px;
  vertical-align: -3px;
}
/deep/ .tips {
  color: #999999;
}

::-webkit-scrollbar {
  width: 9px;
  height: 9px;
}

::-webkit-scrollbar-track {
  opacity: 0;
}

::-webkit-scrollbar-thumb {
  border-radius: 4.5px;
  border: 1px solid #ffffff;
  border-right-width: 2px;
  background-color: #c8c8c8;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #a0a0a0;
}

.table-icon {
  color: #409eff;
  font-size: 14px;
  cursor: pointer;
  &:hover {
    color: #66b1ff;
  }
  &.disabled {
    color: #999999;
    cursor: not-allowed;
  }
}
.el-form-item {
  margin-bottom: 5px;
}
/deep/ .el-form-item__error {
  margin-top: -7px;
}
.detail-popover {
  left: -214px;
  top: -2px;
  height: 130px;
  width: 230px;
  font-size: 12px;
  overflow-y: auto;
}
.detail-popover ul li span {
  margin-left: 4px;
}
.detail-popover ul li:hover {
  background-color: #f5f7fa;
}
</style>
