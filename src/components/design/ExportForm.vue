<template>
  <el-dialog
    width="420px"
    :visible.sync="exportDialog"
    :append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @open="openFunc"
  >
    <div slot="title" class="dialog-title">
      <span>数据导出</span>
      <div class="title-line"></div>
    </div>
    <el-form ref="exportForm" :rules="rules" :model="exportForm" @submit.native.prevent>
      <el-form-item prop="verifyCode" label="短信验证码:" :label-width="'100px'">
        <el-input
          size="mini"
          v-model.trim="exportForm.verifyCode"
          autocomplete="off"
          @keyup.enter.native="exportSubmit('exportForm')"
          maxlength="6"
          show-word-limit
        ></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="setExportDialog(false)" size="mini">取 消</el-button>
      <el-button type="primary" @click="exportSubmit('exportForm')" size="mini" :loading="loading">{{BtnText}}</el-button>
    </div>
  </el-dialog>

</template>

<script>
  import {mapActions, mapMutations, mapState} from "vuex";

  export default {
    props: ["fromElDatagrid"],
    data() {
      return {
        rules: {
          verifyCode: [
            {required: true, message: "请输入短信验证码", trigger: "blur"},
          ]
        },
        exportForm: {
          verifyCode: ""
        },
        loading: false,
        BtnText: "确 定"
      };
    },
    computed: {
      exportDialog: {
        get() {
          return this.$store.state.compt.exportDialog;
        },
        set(value) {
          this.setExportDialog(value);
        }
      },
      ...mapState({
        smsId: state => state.compt.smsId,
        contextUrl: state => state.contextUrl,
        pageCache: state => state.HomeBody.pageCache,
        exportType: state => state.QueryTable.exportType
      })
    },
    methods: {
      ...mapActions({
        setExportDialog: "compt/setExportDialog",
        setReportExport: "compt/setReportExport",
        queryAfPropertyData: "QueryTable/queryAfPropertyData",
        checkSms: "compt/checkSms",
        exportTable: "QueryTable/exportTable",
        setQueryHistory: "compt/setQueryHistory",
        doExportReport: "ReportMgt/doExportReport",
      }),
      ...mapMutations({
        setTabActive: "AsynExport/setTabActive"
      }),
      exportSubmit(formName) {
        this.$refs[formName].validate(valid => {
          if (valid) {
            var smsParam = {
              srlId: this.smsId,
              checkPassword: this.exportForm.verifyCode
            };
            this.loading = true;
            this.BtnText = "校验中";
            Promise.resolve(smsParam).then(val=>{
              if (this.fromElDatagrid != '1' && this.fromElDatagrid != '2') {
                return this.queryAfPropertyData({
                  isNeedPaging: "0",
                  isExport: true
                });
              }
            }).then(val => {
                var param = {smsInfo:smsParam};
                this.BtnText = "下载中";
                if (this.fromElDatagrid == '1') {
                  val = this.$parent.queryData({isExport: true}).afQueryBean; //获取afQueryBean
                  this.$parent.vscompt.comptAttrs.loading = false;
                  param.isForceSync = "1"; //强制同步
                }
                if (this.fromElDatagrid == '2') {
                  let smsInfo = {
                    srlId: this.smsId,
                    checkPassword: this.exportForm.verifyCode
                  }
                  return this.doExportReport(smsInfo)
                }
                val.is_need_trans = 1;
                val.is_watermark = "1";
                var waterStr = (sessionStorage.getItem('user_id') || '') + '\n' + (sessionStorage.getItem("user_name") || "") + '\n' + ((new Date()).toLocaleDateString() + " " + (new Date()).toTimeString().split(' ')[0]);
                val.watermark_msg = waterStr;
                param.afQueryBean = val;
                try {
                  param.srlId = this.smsId;
                  param.isEncrypt = 1;  //需要密码
                  param.pageInfo = {pageName: this.pageCache.pageName};
                  param.asynExportInfo = {
                    pageId: this.pageCache.pageId,
                    userId: sessionStorage.getItem("user_id"),
                    srlId: this.smsId,
                    exportType: this.exportType
                  };
                  param.exportType = this.exportType;
                } catch (e) {
                  console.error(e);
                }
                return this.exportTable(param);
              })
              .then(response => {
                if (this.fromElDatagrid == '2') {
                  this.BtnText = "确 定";
                  this.loading = false;
                  // this.setExportDialog(false);
                  this.setReportExport(true);
                  return
                }
                var respType = response.data.type;
                if (respType.indexOf("json") >= 0) {  //返回为json格式
                  var reader = new FileReader();
                  reader.readAsText(response.data, ['utf-8']);
                  reader.onload = () => {
                    var obj = JSON.parse(reader.result);
                    if (obj.respResult == "1") {
                      this.BtnText = "确 定";
                      this.loading = false;
                      this.setExportDialog(false);
                      this.setTabActive('third');
                      this.setQueryHistory(true);
                    } else {
                      this.$message.error("导出失败：" + obj.respErrorDesc);
                    }
                    this.BtnText = "确 定";
                    this.loading = false;
                  };
                  reader.onerror = () => {
                    this.$message.error("读取后台返回json失败");
                    this.BtnText = "确 定";
                    this.loading = false;
                  }
                } else {  //返回为stream格式
                  if (response.data.size == 0) {
                    throw "获取文件为空";
                  }
                  this.BtnText = "确 定";
                  var fileName = this.pageCache.pageName + ".zip";
                  var blob = new Blob([response.data]);
                  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                    window.navigator.msSaveOrOpenBlob(blob, fileName);
                  } else {
                    var downloadElement = document.createElement("a");
                    var href = window.URL.createObjectURL(blob); //创建下载的链接
                    downloadElement.href = href;
                    downloadElement.download = fileName; //下载后文件名
                    document.body.appendChild(downloadElement);
                    downloadElement.click(); //点击下载
                    document.body.removeChild(downloadElement); //下载完成移除元素
                    window.URL.revokeObjectURL(href); //释放掉blob对象
                  }
                  this.loading = false;
                  this.setExportDialog(false);
                }
              })
              .catch(err => {
                this.BtnText = "确 定";
                this.loading = false;
                // this.$message.error(err);
              });
          } else {
            this.BtnText = "确 定";
            this.loading = false;
            return false;
          }
        });
      },
      openFunc() {
        this.$nextTick(() => {
          this.$refs.exportForm.resetFields()
          this.$refs.exportForm.clearValidate()
        })
      }
    }
  };
</script>
<style lang="scss" scoped>
  /deep/.el-input .el-input__count .el-input__count-inner {
    background: none
  }
</style>