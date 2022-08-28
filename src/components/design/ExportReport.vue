<template>
  <div>
    <el-dialog size="mini"
               title="选择导出类型"
               width="400px"
               class="export"
               v-if="exportReportDialog"
               :visible.sync="exportReportDialog"
               :append-to-body="true"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :before-close="cancelExport">
      <el-radio-group v-model="radio">
        <el-radio :label="1">导出所有Sheet</el-radio>
        <el-radio :label="2">导出当前所见Sheet</el-radio>
        <el-radio :label="3"
                  :disabled="isDrill">导出钻取(1+N)报表
        </el-radio>
      </el-radio-group>
      <div class="col-wrap"
           v-show="false && breadcrumb.length !==0">
        选择钻取字段：
        <el-select v-model="colValue"
                   size="mini"
                   placeholder="请选择">
          <el-option v-for="(item,index) in breadcrumb"
                     v-if="index == 0"
                     :key="item.value"
                     :label="item.value"
                     :value="item.value">
          </el-option>
        </el-select>
      </div>
      <el-row>
        <el-col :span="24"
                class="explain">
          <div>说明：将根据钻取设置，对二级维度分SHEET导出</div>
          <div>例如：全省+N个地市分页</div>
        </el-col>
        <!-- <el-col :span="24"
          v-show="pageCache.operation != 'preview'">
          <i class="el-icon-warning"></i>
          <span>此操作将保存报表设计</span>
        </el-col> -->
      </el-row>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="cancelExport"
                   size="mini">取 消</el-button>
        <el-button type="primary"
                   @click="openDrillDialog('drill')"
                   size="mini">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  import {mapActions, mapGetters, mapMutations, mapState} from "vuex"
  import {HST} from "../../utils/HandsTable.js"

  export default {
    data() {
      return {
        radio: 1,
        colValue: '',
        colArray: [{
          value: '地市',
          label: '500'
        }, {
          value: '区县',
          label: '501'
        },],
        isDrill: false
      }
    },
    computed: {
      ...mapState({
        smsId: state => state.compt.smsId,
        edcuiCompts: state => state.ReportMgt.edcuiCompts,
        exportReportFile: state => state.ReportMgt.exportReportFile,
        pageCache: state => state.HomeBody.pageCache,
        renderEngine: state => state.renderEngine,
        tempPageDetails: state => state.ReportMgt.tempPageDetails,
        isMailTask: state => state.ReportMgt.isMailTask,
        breadcrumb: state => state.ReportMgt.breadcrumb,
        needSms: state => state.commonProperties.needSms
      }),
      exportReportDialog: {
        get() {
          return this.$store.state.ReportMgt.exportReportDialog;
        },
        set(value) {
          this.upExportReportDialog(value);
        }
      }
    },
    mounted() {
      const sheetInfo = HST.searchCurSheet(), breadcrumb = this.breadcrumb[sheetInfo.sheetName],
        tableList = this.edcuiCompts[1].comptAttrs.tableList,
        areaData = tableList[sheetInfo.index].area_info
      if (!!breadcrumb && breadcrumb.length !== 0) {
        areaData.forEach((element, index) => {
          let drillParam = areaData[index].drillParam, drillData = element.drillData
          if (Object.keys(drillParam).length !== 0) {
            let keys = Object.keys(drillData)
            for (let key of keys) {
              const name = breadcrumb[0].param.split(',')[0]
              if (element.area_id === name) {
                this.isDrill = drillData[key].subDrill.length === breadcrumb.length
                break
              }
            }
          }
        });
        if (!this.exportReportDialog || !this.exportReportFile) {
          if (this.pageCache.operation != "preview") {
            this.$confirm("此操作将保存报表设计，是否继续？", "提示", {
              closeOnClickModal: false,
              confirmButtonText: "是",
              cancelButtonText: "否",
              type: "warning"
            }).then(() => {
              this.submitExport()
            }).catch(err => {
              this.upExportReportFile(false)
            })
          } else {
            this.openDrillDialog()
          }
        }
      } else {
        this.isDrill = !areaData.some(af => {
          if (af.drillData && af.drillData.length > 0 && af.drillData[0].subDrill && af.drillData[0].subDrill.length > 0) {
            return true;
          }
        })

        if (!this.exportReportDialog && this.pageCache.operation != "preview") {
          if (!this.exportReportDialog) {
            this.$confirm("此操作将保存报表设计，是否继续？", "提示", {
              closeOnClickModal: false,
              confirmButtonText: "是",
              cancelButtonText: "否",
              type: "warning"
            }).then(() => {
              this.submitExport()
            }).catch(err => {
              this.upExportReportFile(false)
              // console.error("导出保存异常", err);
            })
          }
        } else {
          if (!this.exportReportDialog) {
            // this.upExportReportDialog(false)
            // this.upExportReportFile(false)
            this.openDrillDialog();
          }
        }

      }
      // 短信验证默认值
      if(this.edcuiCompts[0].needSms === "" && this.edcuiCompts[0].needSms === undefined){
        this.edcuiCompts[0].needSms = this.needSms;
      }
    },
    methods: {
      cancelExport() {
        this.upExportReportDialog(false)
        this.upExportReportFile(false)
      },
      submitExport() {
        this.upExportReportDialog(false)
        this.upExportReportFile(false)
        let reqObj = {};
        let params = {};
        let act = "";
        if (this.pageCache.operation != 'preview') {
          if (this.pageCache.pageName == undefined || this.pageCache.pageName.replace(/\s*/g, "") == "") {
            this.$message.warning("请在设计页填写页面名称");
            this.upPageNameFocus(true);
            return;
          }
          if (this.pageCache.pageId == null) {
            //新增页面保存
            act = "add";
          } else {
            //页面编辑保存
            act = "edit";
          }
          if (this.pageCache.operation == "wait") {
            params = this.tempPageDetails;
            if (params.message) {
              this.$message.error(`${params.message.sheetName}的${params.message.col}${params.message.row}单元格公式存在错误，请返回设计页面修改`)
              return
            }
          } else {
            params = this.getPageDetails;
            if (params === false) {
              return
            }
          }
          reqObj.pageInfo = JSON.parse(JSON.stringify(this.pageCache));
          reqObj.pageInfo.status = 0;
          reqObj.pageDetailList = params.details;
          reqObj.pageCompAfRelList = params.relative;
          reqObj.pageInfo.updateUser = sessionStorage.getItem("user_id");
          delete reqObj.pageInfo.operation;
          if (act == "edit") {
            //修改
            this.updatePageAndDetail(reqObj)
              .then(val => {
                if (val.status === 200 && val.data.respResult === "1") {
                  this.$message.success("页面更新成功");
                  this.pageCache.operation = 'preview'
                  this.openDrillDialog();
                } else {
                  this.$message.error(val.data.respErrorDesc || '');
                }
              })
              .catch(err => {
                console.error("error:", err);
                this.$message.error("页面更新失败");
              });
          } else {
            //新增
            this.savePageAndDetail(reqObj)
              .then(val => {
                if (val.status === 200 && val.data.respResult === "1") {
                  this.$message.success("页面保存成功");
                  this.pageCache.pageId = val.data.respData.pageId;
                  this.pageCache.operation = 'preview'
                  this.openDrillDialog();
                } else {
                  this.$message.error(val.data.respErrorDesc || '');
                  this.pageCache.pageId = null;
                }
              })
              .catch(err => {
                console.error(err);
                this.pageCache.pageId = null;
                this.$message.error("页面保存失败");
              });
          }
        } else {
          this.openDrillDialog();
        }
      },
      openDrillDialog(type) {
        let tableList = this.edcuiCompts[1].comptAttrs.tableList
        let ifDrill = tableList.some(tl => {
          return tl.area_info.some(af => af.drillData && af.drillData.length > 0 && af.drillData[0].subDrill && af.drillData[0].subDrill.length > 0);
        });
        if (ifDrill && type !== 'drill') {
          this.upExportReportDialog(true)
          this.upExportReportFile(true)
          return
        }
        this.checkIfSms(type)
      },
      checkIfSms(type) {
        this.upExportParam({radio: this.radio, type: type})
        this.upExportReportDialog(false)
        this.upExportReportFile(false)
        var param = {
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
          this.doExport(type)
        }
      },
      doExport(type) {
        this.doExportReport()
      },
      ...mapMutations({
        upExportReportDialog: "ReportMgt/upExportReportDialog",
        upExportReportFile: "ReportMgt/upExportReportFile",
        resetReportLoading: "ReportMgt/resetReportLoading",
        setEmailTaskDialogVis: "ReportMgt/setEmailTaskDialogVis",
        upExportReportHisDialog: "ReportMgt/upExportReportHisDialog",
        upIsMailTask: "ReportMgt/upIsMailTask",
        upExportParam: "ReportMgt/upExportParam",
      }),
      ...mapActions({
        savePageAndDetail: "HomeBody/savePageAndDetail",
        updatePageAndDetail: "HomeBody/updatePageAndDetail",
        setSmsId: "compt/setSmsId",
        sendSms: "compt/sendSms",
        setExportDialog: "compt/setExportDialog",
        doExportReport: "ReportMgt/doExportReport",
      }),
      ...mapGetters({
        getWhereBean: "ReportMgt/getWhereBean",
        getPageDetails: "ReportMgt/getPageDetails",
        datafilterCols: "QueryTable/datafilterCols",
      }),
    },
  }
</script>
<style lang="scss" scoped>
  $warning: #e6a23c;
  .el-radio {
    display: block;
    height: 30px;
  }

  .export {
    /deep/ .el-dialog__body {
      padding-bottom: 10px;
      padding-left: 30px;
    }

    /deep/ .el-icon-warning {
      font-size: 16px;
      color: $warning;

      + span {
        // font-size: 12px;
        padding-left: 5px;
        display: inline-block;
        vertical-align: text-top;
      }
    }

    .col-wrap {
      position: absolute;
      top: 128px;
      left: 190px;
    }

    .explain {
      padding-left: 23px;
      padding-bottom: 10px;
    }
  }
</style>
