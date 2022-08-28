<template>
  <el-button
    size="mini"
    :type="vscompt.btnType"
    @click="clickHandle"
    :tableList="tableList"
    style="margin-bottom:20px"
    :plain="vscompt.shape == 'plain'"
    :class="pageCache.classTypeId== '1005'?'bgsrc':''"
  >{{ vscompt.label }}</el-button>
</template>

<script>
import { objDeepCopy } from "../../utils/comonFunc.js";
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import { HST } from "../../utils/HandsTable.js";


export default {
  props: ["vscompt", "tableList"],
  data() {
    return {};
  },
  methods: {
    mobileQuery() {
      if (this.pageCache.classTypeId != "1005") {
        this.$parent.$parent.$parent.$parent.relateQuery("button");
      } else {
        this.$parent.$parent.$parent.relateQuery("button");
      }
    },
    // getDbName(pars){ //获取数据库名
    //   this.queryImportInfo(pars)
    //   .then(val => {
    //     if (val.data != null && val.data.respResult == "1") {
    //         this.setDbName(val.data.respData[0].dbName);//设置数据库名称
    //     }
    //   })
    //    return true;
    // },
    clickHandle: function() {
      if (
        this.vscompt.methods != null &&
        this.vscompt.methods.clickHandle != null
      ) {
        eval(this.vscompt.methods.clickHandle);
      }
    },

    getNowFormatDate() {
      //获取当前时间
      var date = new Date();
      var seperator1 = "-";
      var seperator2 = ":";
      var month =
        date.getMonth() + 1 < 10
          ? "0" + (date.getMonth() + 1)
          : date.getMonth() + 1;
      var hours =
        date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
      var minutes =
        date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
      var seconds =
        date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
      var strDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
      var currentdate =
        date.getFullYear() +
        seperator1 +
        month +
        seperator1 +
        strDate +
        " " +
        hours +
        seperator2 +
        minutes +
        seperator2 +
        seconds;
      return currentdate;
    },
    async queryInfo() {
      let columns = this.s_edcuiCompts[1].comptAttrs.columns || [];
      // 聚合计算字段无法清单预览
      if (this.queryType == "list") {
        let sign = false;
        for (let i = 0; i < columns.length; i++) {
          if (columns[i].is_calcul == "2") {
            sign = true;
            break;
          }
        }
        if (sign) {
          this.$message.warning("聚合计算无法查询清单");
          return;
        }
      }
      if (this.pageCache.operation != "preview") {
        columns = this.tableCols || [];
      }
      if (columns.length === 0) {
        this.$message.warning("请添加查询结果！");
        return;
      }
      var isQuery = this.isQuery();
      var tim = this.getNowFormatDate();
      // this.setQueryType("list");
      this.s_edcuiCompts[1].comptAttrs.pagination.currentPage = 1;
      let _this = this;
      // let select_list = this.resultCols.select_list;
      // let af_id = this.resultCols.af_id;

      if (!isQuery) {
        this.$message.warning("必填字段不能为空");
      } else {
        _this.upLoading(true);
        //结果参数
        var params = {
          head_bean: {
            pageCount: this.s_edcuiCompts[1].comptAttrs.pagination.pageSize,
            start: ""
          }
        };
        let condiParam1 = this.s_edcuiCompts[0].comptAttrs.fieldList;
        let tabName; //跟踪群物理表名
        for (var par of condiParam1) {
          if (
            par.comptAttrs.import_tabName != "" &&
            par.comptAttrs.import_symbol != ""
          ) {
            // //如果是导入字段
            var compt1 = par.comptAttrs;
            tabName = compt1.import_tabName;
          }
        }

        var pars = {
          tableName: tabName,
          pageId: "empty"
        };
        //开始获取跟踪群库名
        this.queryImportInfo(pars).then(val => {
          if (val.data.respResult === "1") {
            if (val.data.respData && val.data.respData.length>0 && val.data.respData[0].dbName) {   //gabse与mysql需要设置数据库名
              _this.setDbName(val.data.respData[0].dbName); //设置数据库名称
            }
            //获取网关数据
            _this.queryAfPropertyData({ params })
              .then(function(response) {
                if (response.data.respResult == 1 && response.status == 200) {
                  var respData = response.data.respData;
                  var dataList = [];
                  if (
                    (_this.queryType == "list" ||
                      _this.queryType == "summarize") &&
                    _this.s_edcuiCompts[0].comptAttrs.fieldList.length > 1
                  ) {
                    //暂时只保存清单的查询历史
                    var obj = {
                      time: tim,
                      condi: objDeepCopy(
                        _this.s_edcuiCompts[0].comptAttrs.fieldList
                      ),
                      config: JSON.parse(response.config.data),
                      queryType: _this.queryType,
                      dimList: [..._this.dimList],
                      msuList: [..._this.msuList]
                    };
                    _this.historyData.unshift(obj);
                  }
                  try {
                    _this.s_edcuiCompts[1].comptAttrs.pagination.total = parseInt(
                      response.data.respData.total_count
                    );
                    dataList = respData.result_data_list;
                  } catch (e) {
                    console.error(e);
                  }
                  var colList = [];
                  if (_this.queryType == "list") {
                    colList = _this.resultCols.select_list;
                  } else {
                    colList = _this.summarizeCols || [];
                  }
                  _this.s_edcuiCompts[1].comptAttrs.tableattrs.data = [];
                  _this.s_edcuiCompts[1].comptAttrs.columns = [];
                  _this.s_edcuiCompts[1].comptAttrs.columns = _this.tableColumn;
                  for (let i = 0; i < dataList.length; i++) {
                    var rows = dataList[i].data_list;
                    var temp = {};
                    for (var j = 0; j < rows.length; j++) {
                      var item = colList[j].element_id;
                      temp[item] = rows[j].data_val;
                    }
                    _this.s_edcuiCompts[1].comptAttrs.tableattrs.data.push(
                      temp
                    );
                  }
                } else {
                  _this.$message.error(
                    response.data.respErrorDesc != ""
                      ? response.data.respErrorDesc
                      : "数据更新失败"
                  );
                }
                _this.upLoading(false);
              })
              .catch(function(error) {
                _this.upLoading(false);
              });
          }
        });
      }
    },
    /**报表工具 查询操作 */
    queryReportInfo() {
      let isQuery = this.isQuery("1003");
      if (!isQuery) {
        this.$message.warning("必填字段不能为空");
        // return
      }
      let fieldList = this.edcuiCompts[0].comptAttrs.fieldList,
        len = 0,
        hasValueLen = 0;
      fieldList.forEach(fl => {
        let obj = fl.comptAttrs;
        if (obj.type == "ElDatePicker") {
          len++;
          if (
            !obj.isRequired ||
            (obj.isRequired &&
              ((obj.cycleType == "daterange" &&
                obj.m_value[0] &&
                obj.m_value[1]) ||
                (obj.cycleType != "daterange" && obj.m_value[0])))
          ) {
            hasValueLen++;
          }
        }
      });
      if (len != hasValueLen) {
        this.$message.warning("请选择日期");
        return;
      }

      const sheetArray = HST.searchCurSheet();
      //更新区域数据
      this.updateSheetDataSet(sheetArray.index);
      this.editableTabs.forEach(val => {
        if (val.title !== sheetArray.sheetName) val.refresh = true;
      });
      this.upBreadcrumb({});
    },
    /**报表工具 导出操作 */
    exportReportInfo() {
      if (this.pageCache.operation != "preview" && !!!this.pageCache.pageId) {
        this.$message.error("页面尚未保存，无法导出数据");
        this.upExportReportFile(false);
        return;
      }
      /* var param = {
          userId: window.sessionStorage.getItem("user_id"),
          msisdn: window.sessionStorage.getItem("user_mobile")
        };
        //需要短信
        if (this.edcuiCompts[0].needSms) {
          if (param.msisdn == "undefined") {
            this.$message.error("当前用户的手机号码为空");
            return;
          }
          param.fileName = this.pageCache.pageName;
          this.sendSms(param)
            .then(val => {
              if (val.status === 200 && val.data.respResult === "1") {
                var id = val.data.respData;
                this.setSmsId(id);
                this.setExportDialog(true);
                // this.openExportDialog()
              } else {
                this.$message.error(val.data.respErrorDesc);
              }
            })
            .catch(err => {
              this.$message.error("获取短信验证码异常");
            });
        } else {

        } */
      this.openExportDialog();
    },
    openExportDialog() {
      /* this.upExportReportFile(true);
        let ifDrill = this.tableList.comptAttrs.tableList.some(tl => {
          return tl.area_info.some(af => {
            if (
              af.drillData &&
              af.drillData.length > 0 &&
              af.drillData[0].subDrill &&
              af.drillData[0].subDrill.length > 0
            ) {
              return true;
            }
          });
        });
        if (ifDrill) {
          this.upExportReportDialog(true);
        } else {
          this.upExportReportDialog(false);
        } */
      this.upIsMailTask(false);
      this.upExportReportFile(true);
      this.upExportReportDialog(false);
    },
    /**报表工具 导出日志 */
    exportReportHis() {
      this.upExportReportHisDialog(true);
    },
    ...mapMutations({
      upPageNameFocus: "ReportMgt/upPageNameFocus",
      upIsMailTask: "ReportMgt/upIsMailTask",
      upLoading: "compt/upLoading",
      setQueryType: "QueryTable/setQueryType",
      upExportReportHisDialog: "ReportMgt/upExportReportHisDialog",
      upExportReportDialog: "ReportMgt/upExportReportDialog",
      upExportReportFile: "ReportMgt/upExportReportFile",
      upBreadcrumb: "ReportMgt/upBreadcrumb",
      setDbName: "QueryTable/setDbName"
    }),
    ...mapActions({
      savePageAndDetail: "HomeBody/savePageAndDetail",
      queryAfPropertyData: "QueryTable/queryAfPropertyData",
      updatePageAndDetail: "HomeBody/updatePageAndDetail",
      upLoading: "compt/upLoading",
      setExportDialog: "compt/setExportDialog",
      sendSms: "compt/sendSms",
      setSmsId: "compt/setSmsId",
      updateSheetDataSet: "ReportMgt/updateSheetDataSet",
      setReportExport: "compt/setReportExport",
      queryImportInfo: "compt/queryImportInfo"
    })
  },
  computed: {
    ...mapState({
      // tempPageDetails: state => state.ReportMgt.tempPageDetails,
      edcuiCompts: state => state.ReportMgt.edcuiCompts,
      editableTabs: state => state.ReportMgt.editableTabs,
      s_edcuiCompts: state => state.compt.s_edcuiCompts,
      reportExport: state => state.compt.reportExport,
      historyData: state => state.QueryTable.historyData,
      queryType: state => state.QueryTable.queryType,
      tableCols: state => state.QueryTable.tableCols,
      dimList: state => state.QueryTable.dimList,
      msuList: state => state.QueryTable.msuList,
      pageCache: state => state.HomeBody.pageCache,
      renderEngine: state => state.renderEngine
    }),
    ...mapGetters({
      datafilterCols: "QueryTable/datafilterCols",
      condiCols: "QueryTable/condiCols",
      resultCols: "QueryTable/resultCols",
      tableColumn: "QueryTable/tableColumn",
      summarizeCols: "QueryTable/summarizeCols",
      getCurSheetId: "ReportMgt/getCurSheetId",
      getPageDetails: "ReportMgt/getPageDetails",
      isQuery: "QueryTable/isQuery"
    })
  }
};
</script>

<style scoped>
.bgsrc {
  background-color: #3e60ae;
  color: #fff;
  border-color: #3e60ae;
}
</style>
