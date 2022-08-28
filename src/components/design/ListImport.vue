<template>
  <el-dialog size="mini" title="清单导入" width="405px" :visible.sync="listImportDialog" :append-to-body="true" :close-on-click-modal="false" :close-on-press-escape="false" @close="reset">
    <el-form ref="listImport">
      <el-form-item label="文件路径" :label-width="'70px'">
        <el-input size="mini" v-model="filePath" placeholder="文件名称和字段长度不超过50个字符" :disabled="true" style="width:228px"></el-input>
        <el-upload ref="upload" class="list-import" :show-file-list="false" action='' accept=".txt" :before-upload="uploadForm" :headers="uploadHeader" :auto-upload="false" :on-change="fileChange">
          <el-button slot="trigger" size="mini" type="primary">选择</el-button>
        </el-upload>
      </el-form-item>
      <p style="color:#409eff;font-size:12px;">*说明：导入的清单数据目前仅为单字段且仅保存7天</p>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="download" size="mini">模板下载</el-button>
      <el-button type="primary" @click="submitUpload" size="mini" :loading="loading">{{BtnText}}</el-button>
    </div>
  </el-dialog>

</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from "vuex";
import eventBus from "../../plugins/transData.js";
import { service } from 'ngbd-utils'
export default {
  data() {
    return {
      loading: false,
      BtnText: "导入",
      file:null,
      filePath:'',
      fileName:'',
      uploadHeader: {
        JTT: window.sessionStorage.getItem("jtt")
      }
    };
  },
  computed: {
    listImportDialog: {
      get() {
        return this.$store.state.compt.listImportDialog;
      },
      set(value) {
        this.setListImportDialog(value);
      }
    },
    pureName(){
      var name=this.fileName;
      var pattern = /\.{1}[a-z]{1,}$/;
      if (pattern.exec(name) !== null) {
          return (name.slice(0, pattern.exec(name).index));
      } else {
          return name;
      }
    },
    ...mapState({
      contextUrl: state => state.contextUrl,
      pageCache: state => state.HomeBody.pageCache,
      renderEngine: state => state.renderEngine,
      defaultSystemId: state => state.defaultSystemId
    })
  },
  methods: {
    reset(){
      this.file=null;
      this.filePath='';
      this.fileName='';
    },
    uploadForm(){
      let formData=new FormData();
      formData.append('file',this.file.raw);
      formData.append('tenantId',sessionStorage.getItem('tenant_id'));
      formData.append('pageId',this.pageCache.pageId||'');
      formData.append('userId',sessionStorage.getItem('user_id'));
      formData.append('importName',this.pureName);
      this.loading=true;
      this.BtnText='导入中';
      service({
        maskOff: true,
        url: this.$store.state.renderEngine+'/import/importWgInfo',
        method: "post",
        data: formData,
        timeout: this.axiosTimeout,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-SystemId": this.defaultSystemId,
          "X-NG-SessionId": window.sessionStorage.getItem("X-NG-SessionId")
        }
      }).then(val=>{
          if(val.status==200&&val.data.respResult=="1"){
            this.loading=false;
            this.BtnText='导入';
            this.$message.success("导入成功");
            eventBus.$emit('reload');
            this.setListImportDialog(false);
          }else if(val.data.respResult=="0"){
            throw val.data.respErrorDesc;
          }
        }).catch(err=>{
          this.loading=false;
          this.BtnText='导入';
          // this.$message.error(err);
        })
    },
    submitUpload() {
      if(this.filePath==""){
        this.$message.warning("请选择文件");
        return;
      }
      var name=this.fileName;
      var test=name.split(".");
      if(test[test.length-1]!="txt"){
        this.$message.warning("请上传txt文件");
        return;
      }
      if(name.length>40){
        this.$message.warning("文件名称长度不能超过50字符");
        return;
      }
      if(this.pageCache.pageId==null||this.pageCache.pageId==""){
        this.$message.warning("未保存页面无法使用该功能");
        return;
      }
      var param={importName:this.pureName,pageId:this.pageCache.pageId,userId:sessionStorage.getItem("user_id")};
      this.queryImportInfo(param).then(val=>{
        if(val.data!=null&&val.data.respResult=="1"){
          var total=val.data.dataTotalCount;
          if(total>0){  //已存在
            this.$confirm('文件已存在，是否覆盖?', '提示', {
              closeOnClickModal: false,
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              // this.$refs.upload.submit();
              this.uploadForm();
            }).catch((err) => {
              
            });
          }else{
            // this.$refs.upload.submit();
            this.uploadForm();
          }
        }else if(val.data.respResult=="0"){
            throw val.data.respErrorDesc;
        }
      }).catch(err=>{
        // this.$message.error(err);
      })
    
    },
    download(){
      this.downloadListTemplate().then(response => {
          if(response.data.size==0){
            throw "获取文件为空";
          }
          var fileName = "清单导入模板.txt";
          var blob = new Blob([response.data], {
            type: "text/plain;charset=utf-8"
          });
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
        }).catch(err => {
          // this.$message.error(err);
        });
    },
    fileChange(file){
      this.file=file;
      var name=document.querySelector(".list-import").querySelector(".el-upload__input").value||"";
      this.filePath=name;
      this.fileName=file.name;
    },
    ...mapActions({
      setListImportDialog: "compt/setListImportDialog",
      downloadListTemplate: "compt/downloadListTemplate",
      queryImportInfo: "compt/queryImportInfo"
    })
  }
};
</script>

