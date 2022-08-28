<template>
  <div>
    <el-table
    v-loading="asynLoading"
    :data="exportData"
    style="width: 100%"
    size="mini"
    height="250"
    >
      <el-table-column prop="export_id" width="150" label="id" v-if="false"></el-table-column>
      <el-table-column prop="export_filename" width="150" label="id" v-if="false"></el-table-column>
      <el-table-column prop="export_srlId" width="150" label="srlid" v-if="false"></el-table-column>
      <el-table-column prop="export_type" width="150" label="exportType" v-if="false"></el-table-column>
      <el-table-column prop="export_time" width="180" label="导出提交时间"></el-table-column>
      <el-table-column prop="export_state" label="状态">
          <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" :content="scope.row.export_err_msg" placement="top-start" v-if="scope.row.export_state=='异常' || scope.row.export_state=='推送失败'">
            <span
            style="color:#F56C6C"
            >{{scope.row.export_state}}</span>
          </el-tooltip>

          <el-tooltip class="item" effect="dark" :content="scope.row.export_sucess_msg" placement="top-start" v-if="scope.row.export_state=='推送成功' || scope.row.export_state=='完成'">
            <span style="color:#409EFF"
             v-if="scope.row.export_state=='完成' || scope.row.export_state=='推送成功'"
            >{{scope.row.export_state}}</span>
          </el-tooltip>

            <span v-if="scope.row.export_state=='正在执行' || scope.row.export_state=='初始化' || scope.row.export_state=='最终文件处理'">{{scope.row.export_state}}</span>
          </template>
      </el-table-column>
      <el-table-column prop="export_count" label="总记录数" v-if="false"></el-table-column>
      <el-table-column prop="export_size" label="文件大小(KB)" ></el-table-column>
      <el-table-column prop label="操作">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" content="下载" placement="top-start" v-if="filesync == '0' ">
          <span
          v-if="scope.row.export_state=='完成'"
          class="icon-A10091_download table-icon"
          @click="download(scope.row)"
          ></span>
          <span v-else class="icon-A10091_download table-icon disabled"></span>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="删除" placement="top-start">
          <span class="icon-A10065_delete table-icon" @click="delExport(scope.row)"></span>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <div class="table-page">
      <el-pagination
      v-show="exportPagination.total>exportPagination.pageSize"
      :current-page="exportPagination.start"
      :page-sizes="[10, 20, 30, 40,50]"
      :page-size="exportPagination.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="exportPagination.total"
      @size-change="sizeChange"
      @current-change="pageChange"
      ></el-pagination>
    </div>
    <div class="liushui">
    <span class="star">*</span>
    <span class="tips">导出成功的文件仅保存7天，请及时下载</span>
    </div>
  </div>
</template>


<script>
import { mapState, mapGetters, mapMutations, mapActions } from "vuex";
export default {
  data() {
    return {
      asynLoading: false,
      websocket: null,
      exportData: [],
      exportPagination: {
        total: 0,
        start: 1,
        pageSize: 10
      },
      expStateDic: {
       "0": "初始化",
        "1": "正在执行",
        "2": "完成",
        "3": "异常",
        "4": "最终文件处理",
        "5": "推送成功",
        "6": "推送失败"
      },
    }
  },
  computed: {
    ...mapState({
      pageCache: state => state.HomeBody.pageCache,
      websocketUrl: state => state.commonProperties.websocketUrl, //websocket地址
      filesync: state => state.commonProperties.filesync//各地本地化差异配置(湖南导出文件特殊处理)
    }),
    ...mapGetters({
    })
  },
  methods: {
    initWebSocket() {
      // console.info("开始调用websocket");
      if ("WebSocket" in window) {
        if (this.websocket) {
          return;
        }
        this.websocket = new WebSocket(this.websocketUrl);
        this.websocket.onerror = this.setErrorMessage;
        this.websocket.onopen = this.setOnopenMessage;
        this.websocket.onmessage = this.setOnmessageMessage;
        this.websocket.onclose = this.setOncloseMessage;
      } else {
        this.$message.error("当前浏览器不支持websocket");
      }
    },
    setErrorMessage() {
      var wsData = "WebSocket连接发生错误" + "   状态码：" + this.websocket.readyState;
      console.log(wsData);
    },
    setOnopenMessage() {
      var wsData = "WebSocket连接成功" + "   状态码：" + this.websocket.readyState;
      console.log(wsData);
      this.sendMessage();
    },
    setOnmessageMessage(event) {
      // console.log("服务端返回：" + event.data);
      try {
        var obj = JSON.parse(event.data);
        var id = obj.exportInfoId;
        var state = obj.status;
        let size = obj.fileSize;
        let fileName = obj.fileName;  //文件名称
        let errMsg = obj.err_msg; //异常信息
        let sucessMsg = obj.sucessMsg;
        if (this.exportData.length > 0) {
          for (var item of this.exportData) {
            if (item.export_id == id) {
              item.export_state = this.expStateDic[state];
              if(state == "2"){
                item.export_size = size;
                item.export_filename = fileName;
              }
              if(state == "3"){
                item.export_err_msg = errMsg;
              }
              if(state == "5"){   //推送成功
                item.export_sucess_msg = sucessMsg;
                item.export_size = size;
                item.export_filename = fileName;
              }
              if(state == "6"){
                item.export_size = size;
                item.export_filename = fileName;
                item.export_err_msg = errMsg;
              }
              break;
            }
          }
        }
      } catch (error) {
        this.$message.error(error);
      }

    },
    setOncloseMessage() {
      var wsData = "WebSocket连接关闭" + "   状态码：" + this.websocket.readyState;
      console.log(wsData);
    },
    //websocket发送消息
    sendMessage() {
      if (this.websocket.readyState == WebSocket.OPEN) {
        //如果WebSocket是打开状态
        var param = {
          userId: sessionStorage.getItem("user_id"),
          pageId: this.pageCache.pageId
        };
        this.websocket.send(JSON.stringify(param));
      } else {
        this.$message.error("websocket连接失败");
      }
    },
    closeWebSocket() {
      if (this.websocket) {
        this.websocket.close();
      }
    },
    getAsynExportData() {
      if (this.pageCache.pageId == null || this.pageCache.pageId == "") {
        return;
      }
      var param = {
        pageId: this.pageCache.pageId,
        userId: sessionStorage.getItem("user_id"),
        start: this.exportPagination.start,
        pageCount: this.exportPagination.pageSize
      };
      this.queryAsynExportList(param)
        .then(val => {
          if (val.status == 200 && val.data.respResult == "1") {
            var list = val.data.respData;
            if (list.length == 0) {
              this.exportData = list;
              this.exportPagination.total = 0;
            } else {
              this.exportData.splice(0, this.exportData.length);
              this.exportPagination.total = val.data.dataTotalCount;
              list.forEach(val => {
                var item = {};
                item.export_id = val.exportInfoId;
                item.export_srlId = val.srlId;
                item.export_type = val.exportType;
                item.export_time = val.exportTime;
                item.export_state = this.expStateDic[val.status];
                item.export_count = val.totalCount;
                item.export_size = val.fileSize;
                if(val.status == '5'){
                   item.export_sucess_msg = '已上传至文件管理平台!';
                }else{
                   item.export_sucess_msg = '完成';
                }
                item.export_err_msg = val.err_msg;
                item.export_filename = val.fileName;
                this.exportData.push(item);
              });
              this.initWebSocket();
            }
          } else {
            throw val.data.respErrorDesc;
          }
        })
        .catch(err => {
          // this.$message.error(err);
        });
    },
    sizeChange(val) {
      this.exportPagination.pageSize = val;
      this.exportPagination.start = 1;
      this.getAsynExportData();
    },
    pageChange(val) {
      this.exportPagination.start = val;
      this.getAsynExportData();
    },
    delExport(val) {
      this.asynLoading = true;
      var id = val.export_id;
      var param = { exportInfoId: id };
      this.delReportExport(param)
        .then(val => {
          // console.log("val",val)
          if (val.status == 200 && val.data.respResult == "1") {
            this.getAsynExportData();
          } else {
            this.$message.error("刪除失败");
            // console.log("刪除失败", val.data.respErrorDesc);
          }
          this.asynLoading = false;
        })
        .catch(err => {
          console.log(err);
          this.asynLoading = false;
        });
    },
    download(val) {
      var id = val.export_id;
      var pageInfo = { pageName: this.pageCache.pageName };
      var asynExportInfo = { exportInfoId: id, srlId: val.export_srlId };
      var param = { pageInfo, asynExportInfo };
      this.asynLoading = true;
      this.downloadZip(param)
        .then(response => {
          var respType = response.data.type;
          if (respType.indexOf("json") >= 0) {
            //返回为json格式
            var reader = new FileReader();
            reader.readAsText(response.data, ["utf-8"]);
            reader.onload = () => {
              var obj = JSON.parse(reader.result);
              // console.log(obj);
              if (obj.respResult != "1") {
                this.$message.error("导出失败：" + obj.respErrorDesc);
              }
            };
            reader.onerror = () => {
              this.$message.error("读取后台返回json失败");
            };
          } else {
            //返回为stream格式
            if (response.data.size == 0) {
              throw "获取文件为空";
            }
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
          }
          this.asynLoading = false;
        })
        .catch(err => {
          // this.$message.error(err);
          this.asynLoading = false;
        });
    },
    ...mapActions({
      queryAsynExportList: "AsynExport/queryAsynExportList",
      delReportExport: "AsynExport/delReportExport",
      downloadZip: "AsynExport/downloadZip",
    }),
    ...mapMutations({
      upExportReportHisDialog: "ReportMgt/upExportReportHisDialog",
    })
  },
  mounted() {
    this.getAsynExportData();
  },
  beforeDestroy() {
    //页面离开时断开连接，清除定时器
    this.closeWebSocket();
  },
  watch: {
  }
};
</script>

<style lang="scss" scoped>
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
.qryHis .el-table::before {
  height: 0;
}
.qryHis .el-table__fixed-right::before,
.el-table__fixed::before {
  height: 0;
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
  &:last-child {
    margin-right: 0;
  }
  &.disabled {
    color: #999999;
    cursor: not-allowed;
  }
}
</style>
