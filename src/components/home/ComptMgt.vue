<template>
  <el-container>
    <el-header height="60px" style="position:relative;z-index:1;">
      <div class="head-title">
          组件开发管理
      </div>
    </el-header>
    <el-main>
      <div class="main-content">
        <div class="main-content-form">
            <el-form ref="form" :inline="true" :model="searchForm" class="demo-form-inline" size="mini">
            <el-form-item label="组件名称">
              <el-input
                size="mini"
                style="width:210px"
                v-model="searchForm.compName"
                placeholder="请输入内容"
              ></el-input>
            </el-form-item>
            <el-form-item label="组件归属">
              <el-select size="mini" style="width:150px" v-model="searchForm.classTypeId" placeholder="请选择">
                <el-option label="全部" value=""></el-option>
                <el-option label="数据大屏" value="1005"></el-option>
                <el-option label="分析报告-PC" value="1001001"></el-option>
                <el-option label="分析报告-手机" value="1001002"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="更新时间">
              <el-date-picker
                size="mini"
                value-format=" yyyy-MM-dd"
                v-model="updateTime"
                type="daterange"
                align="right"
                unlink-panels
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :picker-options="pickerOptions"
              ></el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-button @click="renderTable" type="primary" size="mini">查询</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="main-content-tool">
          <div class="tool-btn" @click="uploadDialog=true">
            <span class="icon-A10072_add tool-btn-icon"></span>
            <span class="tool-btn-text">组件上传</span>
          </div>
          <div class="tool-btn" @click="downloadDoc">
            <span class="icon-A10091_download tool-btn-icon"></span>
            <span class="tool-btn-text">规范下载</span>
          </div>
          <!-- <div class="tool-btn" @click="">
            <span class="icon-A10091_download tool-btn-icon"></span>
            <span class="tool-btn-text">工具下载</span>
          </div> -->
        </div>
        <div class="main-content-table">
          <GeminiScrollbar class="my-scroll-bar">
            <!--即席查询-->
            <el-table
              height="100%"
              v-loading="loading"
              border
              :data="tableData"
              style="width: 100%"
              size="mini"
            >
              <!-- <el-table-column type="selection" width="55"></el-table-column> -->
              <el-table-column prop="compName" label="组件名称" :show-overflow-tooltip="true"></el-table-column>
              <el-table-column prop="classTypeName" label="组件归属" :show-overflow-tooltip="true"></el-table-column>
              <el-table-column prop="modifyUserName" label="创建者" :show-overflow-tooltip="true"></el-table-column>
              <el-table-column prop="modifyTime" label="更新时间" :show-overflow-tooltip="true"></el-table-column>
              <el-table-column label="操作" width="250">
                <template slot-scope="scope">
                  <el-tooltip v-if="scope.row.status==='1'" class="item" effect="dark" content="隐藏" placement="top-start">
                    <span
                      class="icon-A10494-Visible table-icon"
                      @click="doHideComp(scope.row)"
                    ></span>
                  </el-tooltip>
                  <el-tooltip v-if="scope.row.status==='0'" class="item" effect="dark" content="取消隐藏" placement="top-start">
                    <span
                      class="icon-A10493-Invisible table-icon"
                      @click="doShowComp(scope.row)"
                    ></span>
                  </el-tooltip>
                  <el-tooltip class="item" effect="dark" content="删除" placement="top-start">
                    <span
                      class="icon-A10065_delete table-icon"
                      @click="doDeleteComp(scope.row)"
                    ></span>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
          </GeminiScrollbar>
        </div>
        <div class="table-page">
          <el-pagination
            :current-page="searchForm.startPage"
            :page-sizes="[10, 20, 30, 40]"
            :page-size="20"
            layout="total, sizes, prev, pager, next, jumper"
            :total="tableData.length"
            @size-change="sizeChange"
            @current-change="pageChange"
          ></el-pagination>
        </div>
      </div>
    </el-main>
    <el-dialog size="mini" title="组件上传" width="485px" :visible.sync="uploadDialog" :append-to-body="true" :close-on-click-modal="false" :close-on-press-escape="false" @close="uploadReset">
      <el-form ref="comptImport">
        <el-form-item class="star" label="组件归属" :label-width="'80px'">
          <el-checkbox-group v-model="checkedList">
            <el-checkbox v-for="classType in classTypeIdList" :label="classType.id" :key="classType.id">{{classType.label}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item class="star" label="文件路径" :label-width="'80px'">
          <el-input size="mini" v-model="filePath" placeholder="文件名称和字段长度不超过50个字符" :disabled="true" style="width:308px"></el-input>
          <el-upload ref="upload" class="compt-import" :show-file-list="false" action='' accept=".zip" :before-upload="uploadForm" :auto-upload="false" :on-change="fileChange">
            <el-button slot="trigger" size="mini" type="primary">选择</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="uploadReset">取 消</el-button>
        <el-button type="primary" @click="submitUpload" size="mini" :loading="uploadLoading">{{BtnText}}</el-button>
      </div>
    </el-dialog>
  </el-container>
</template>

<script>
  import {mapActions,mapState} from "vuex";

  export default {
    components: {
      
    },
    data() {
      return {
        tableData:[],
        loading: true,
        pageList: [],
        pickerOptions: {
          shortcuts: [
            {
              text: "最近一周",
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                picker.$emit("pick", [start, end]);
              }
            },
            {
              text: "最近一个月",
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                picker.$emit("pick", [start, end]);
              }
            },
            {
              text: "最近三个月",
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                picker.$emit("pick", [start, end]);
              }
            }
          ]
        },
        updateTime:"",
        searchForm: {
          compName: "",
          beginTime: "",
          endTime: "",
          status: "",
          classTypeId: "",
          startPage: 1,
          pageSize: 20
        },
        uploadDialog: false,
        uploadLoading: false,
        BtnText: "上 传",
        file:null,
        filePath:'',
        fileName:'',
        checkedList:[],
        classTypeIdList:[]
      };
    },
    computed: {
      ...mapState({
        menuList: state => state.menuList
      })
    },
    methods: {
      pageChange(val) {
        this.searchForm.startPage = val;
        this.renderTable();
      },
      sizeChange(val) {
        this.searchForm.pageSize = val;
        this.searchForm.startPage = 1;
        this.renderTable();
      },
      selectTable(select) {
        this.pageList = select;
      },
      getComptList(param,isNeedResetStart = false){
        if (isNeedResetStart) {
          this.searchForm.startPage = 1;
        }
        return this.qryExtCompList(param);
      },
      uploadReset(){
        this.uploadDialog = false;
        this.file = null;
        this.filePath = '';
        this.fileName = '';
        this.checkedList.splice(0,this.checkedList.length);
      },
      resetSearchCondi() {
        this.searchForm.compName = "";
        this.updateTime = "";
        this.searchForm.beginTime = "";
        this.searchForm.endTime = "";
        this.searchForm.status = "";
        this.searchForm.classTypeId = "";
        this.searchForm.startPage = 1;
        this.searchForm.pageSize = 20;
      },
      async renderTable() {
        let param = this.searchForm;
        let resp = await this.getComptList(param);
        this.loading = true;
        if(resp){
          if (resp.status == 200 && resp.data.respResult == "1") {
            this.tableData = resp.data.respData;
          } else {
            this.$message.error('组件列表查询失败');
            console.error(resp.data.respErrorDesc);
          }
        }
        this.loading = false;
      },
      async uploadForm(){
        let formData=new FormData();
        formData.append('file',this.file.raw);
        formData.append('classTypeIdList',JSON.stringify(this.checkedList));
        this.uploadLoading=true;
        this.BtnText='上传中';
        let resp = await this.extCompUpload(formData);
        if(resp){
          if(resp.status==200&&resp.data.respResult=="1"){
              this.$message.success("上传成功");
              this.uploadDialog = false;
              this.renderTable();
          }else if(resp.data.respResult=="0"){
            this.$message.error(resp.data.respErrorDesc);
          }
        }
        this.BtnText='上 传';
        this.uploadLoading=false;
      },
      submitUpload() {
        if(this.checkedList.length===0){
          this.$message.warning("请选择组件归属");
          return;
        }
        if(this.filePath==""){
          this.$message.warning("请选择文件");
          return;
        }
        var name=this.fileName;
        var test=name.split(".");
        if(test[test.length-1]!="zip"){
          this.$message.error("请上传zip文件");
          return;
        }
        if(name.length>40){
          this.$message.error("文件名称长度不能超过50字符");
          return;
        }
        this.$confirm('组件文件会覆盖更新，确认上传?', '提示', {
          closeOnClickModal: false,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.uploadForm();
        }).catch((err) => {});
      },
      fileChange(file){
        this.file=file;
        var name=document.querySelector(".compt-import").querySelector(".el-upload__input").value||"";
        this.filePath=name;
        this.fileName=file.name;
      },
      doDeleteComp(row){
        let param = { 
          compId: row.compId,
          classTypeId: row.classTypeId
        }
        this.$confirm('确认删除该组件吗?', '提示', {
          closeOnClickModal: false,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async() => {
          let resp = await this.deleteComp([param]);
          if(resp){
            if(resp.status==200&&resp.data.respResult=="1"){
              this.renderTable();
            }else if(resp.data.respResult=="0"){
              this.$message.error(resp.data.respErrorDesc);
            }
          }
        }).catch((err) => {
        });
      },
      async doHideComp(row){
        let param = { 
          compId: row.compId,
          classTypeId: row.classTypeId
        }
        let resp = await this.hideComp(param);
        if(resp){
          if(resp.status==200&&resp.data.respResult=="1"){
            this.renderTable();
          }else if(resp.data.respResult=="0"){
            this.$message.error(resp.data.respErrorDesc);
          }
        }
      },
      async doShowComp(row){
        let param = { 
          compId: row.compId,
          classTypeId: row.classTypeId
        }
        let resp = await this.showComp(param);
        if(resp){
          if(resp.status==200&&resp.data.respResult=="1"){
            this.renderTable();
          }else if(resp.data.respResult=="0"){
            this.$message.error(resp.data.respErrorDesc);
          }
        }
      },
      async downloadDoc(){
        let resp = await this.downloadTemplate();
        if(resp) {
           if(resp.data.size==0){
            this.$message.error("获取文件为空");
          }
          var fileName = "dataeleph-组件开发规范.docx";
          var blob = new Blob([resp.data], {
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
        }
      },
      ...mapActions({
        qryExtCompList: "compt/qryExtCompList",
        extCompUpload: "compt/extCompUpload",
        hideComp: "compt/hideComp",
        showComp: "compt/showComp",
        deleteComp: "compt/deleteComp",
        downloadTemplate: "compt/downloadTemplate"
      })
    },
    created() {
      document.title = '组件开发管理';
      this.renderTable();
      this.menuList.forEach(val=>{
        if(val.classTypeId === '1005') {
          this.classTypeIdList.push({id:'1005',label:'数据大屏'})
        }else if(val.classTypeId === '1001') {
          this.classTypeIdList.push({id:'1001001',label:'分析报告-PC'})
          this.classTypeIdList.push({id:'1001002',label:'分析报告-手机'})
        }
      })
    },
    watch: {
      updateTime(val){
        if(val){  //updateTime不为空
          this.searchForm.beginTime = val[0].trim();
          this.searchForm.endTime = val[1].trim();
        } else {
          this.searchForm.beginTime = "";
          this.searchForm.endTime = "";
        }
      }
    }
  };
</script>

<style lang="scss" scoped>
    .el-header{
        background-color: #0a2b4c;
        height: 60px;
        line-height: 60px;
        .head-title{
            color:#fff;
            font-size: 18px;
        }
    }
    .el-main{
        background-color: #e4e7ee;
    color: #333;
    overflow: hidden;
    }
  .main-content {
    background: #fff;
    width: 100%;
    padding: 20px;
    height: 100%;
    position: relative;

    .main-content-form {
      text-align: left;
    }

    /deep/ .main-content-table th {
      background-color: #f5f7fa;
      border-bottom: 2px solid #409eff;
      border-right: none;
      color: #303133;
      text-align: center;
    }

    /deep/ .main-content-table td {
      text-align: center;
      border-right: none;
    }

    .table-icon {
      color: #409eff;
      font-size: 14px;
      margin-right: 20px;
      cursor: pointer;

      &:hover {
        color: #66b1ff;
      }

      &:last-child {
        margin-right: 0;
      }
    }

    /deep/ .device-dialog {
      top: 50%;
      margin: 0 auto;
      background-color: #fff;

      .device-wrap {
        background-repeat: no-repeat;
        background-position: 35px 10px;
      }
    }

    // 弹框标题头字体
    .dialog-title {
      & > span {
        line-height: 24px;
        font-size: 18px;
        color: #303133;
      }
    }

    .table-page {
      position: absolute;
      bottom: 20px;
      right: 20px;
    }

    .main-content-table {
      position: absolute;
      top: 103px;
      bottom: 62px;
      left: 20px;
      right: 20px;

      .device-icon {
        float: left;
        color: #409eff;
        font-size: 14px;
        margin-top: 20px;
        cursor: pointer;

        &:hover {
          color: #66b1ff;
        }
      }
    }

    /deep/ .gm-scrollbar .thumb {
      background-color: #d3d8e4;
    }
  }

  .el-form--inline {
    .el-form-item {
      margin-right: 70px;

      &:last-child {
        margin-left: -10px;
        margin-top: -1px;
        margin-right: 0;
      }
    }
  }

  .main-content-tool {
    position: absolute;
    top: 75px;
    right: 20px;
    text-align: right;

    .tool-btn {
      cursor: pointer;
      margin-left: 20px;
      display: inline-block;

      .tool-btn-icon {
        color: #409eff;
        margin-right: 5px;
      }

      .tool-btn-text {
        position: relative;
        top: -1px;
      }

      &:hover {
        .tool-btn-text {
          color: #409eff;
        }
      }
    }
  }

  /deep/ .el-dialog__body {
    padding-top: 13px;
    padding-bottom: 10px;
  }

  /deep/ .el-form-item {
    margin-bottom: 14px;
  }

  @media screen and (max-width: 1460px) {
    .el-form--inline {
      .el-form-item {
        margin-right: 20px;
      }
    }
  }

  .device-wrap {
    width: 100%;
    height: 200px;
    text-align: center;

    .device-item {
      display: inline-block;
      padding: 45px 59px;
      cursor: pointer;

      .device-icon {
        font-size: 60px;
        color: #afc0d0;

        &.actived {
          color: #409eff;
        }

        &:hover {
          color: #409eff;
        }
      }

      .device-shadow {
        display: block;
        width: 40px;
        height: 10px;
        border-radius: 50%;
        background: #c0c4cc;
        margin: 10px 0 0 10px;
        margin: 10px 0 0 10px;
        -webkit-box-shadow: #b7bdca 0px 0px 4px 3px;
      }
    }
  }

  .cn-name {
    float: left;
    width: 75%;
    margin-left: 20px;

    .name-text {
      display: inline-block;
      width: 100%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;

      &.name-txt1 {
        font-size: 15px;
        text-align: left;
      }

      &.name-txt2 {
        font-size: 11px;
        color: #cccccc;
        text-align: left;
      }
    }
  }

  .pageName {
    /deep/ .el-form-item__error {
      margin-top: -7px;
    }
  }

  .compt-import{
    display: inline-block;
  }
</style>

<style lang="scss">
.star{
  .el-form-item__label::before{
    content: "*";
    color: #f56c6c;
    margin-right: 4px;
  }
}

.el-table {
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
}
</style>
