<template>
  <div style="height:100%;" v-loading="exportLoading">
    <div class="table-tool-icon">
      <div class="tab-block" v-if="tabTag=='true'">
        <el-tooltip class="item" effect="dark" :content="tabtagVal" placement="bottom">
          <i class="icon-A10671_cutover" @click="updateData"></i>
        </el-tooltip>
      </div>
      <div  class="icon-block" @click="queryHistory">
        <i class="icon-A10192_time" style="cursor:pointer;" ></i>
        <span>查询历史</span>
      </div>
      <div v-if="vscompt.summarizing" class="icon-block" @click="showSummarize">
          <i class="icon-A10096_detail" style="cursor:pointer;" ></i>
          <span>汇总</span>
      </div>
      <el-dropdown trigger="click">
        <div v-if="vscompt.export" class="icon-block el-dropdown-link">
            <i class="icon-A10165_upload" style="cursor:pointer;" ></i>
            <span>即时取数</span>
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="exportExcel('5')">csv</el-dropdown-item>
          <el-dropdown-item @click.native="exportExcel('2')">excel</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <div v-if="vscompt.exportTask" class="icon-block" @click="queryTask">
          <i class="icon-A10788_upcoming" style="cursor:pointer;" ></i>
          <span>定时取数</span>
      </div>
    </div>
    <div :class="vscompt.export==true?'export-table':'normal-table'" >
      <el-table size="mini" :ref="'table'+vscompt.id"
        v-bind="vscompt.tableattrs"
        height="100%"
        v-loading="loading"
        :row-class-name="rowClass"
        @header-dragend="colWidthChange"
      >
        <el-table-column
          v-for="(col,i) in vscompt.columns"
          v-bind:key="col.prop+Math.random()"
          v-bind="col"
          :prop="col.element_id"
          header-align="center"
          :align="col.align||'left'"
          :width="col.width||''"
          :formatter="(row, column, cellValue, index)=>dataFormatter(row, column, cellValue, index,i,col)"
        >
        </el-table-column>
      </el-table>
      <div  v-if="vscompt.pagination&&vscompt.pagination.show" class="pagination pagination-wrap"  v-show="vscompt.pagination.total>vscompt.pagination.pageSize">
        <div class="total-page-wrap" v-if="vscompt.pagination.total>parseInt(previewCount)">
          <span class="count-notice" v-if="isShowTips">总计针对本次查询全记录数</span>
          <span>共{{vscompt.pagination.total}}条，最多预览{{previewCount}}条</span>
        </div>
        <div class="total-page-wrap" v-else>
          <span>共{{vscompt.pagination.total}}条</span>
        </div>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="vscompt.pagination.currentPage"
          :page-sizes="[10, 20, 30, 40, 50, 100]"
          :page-size="vscompt.pagination.pageSize"
          layout=" sizes, prev, pager, next, jumper"
          :pager-count="5"
          :total="vscompt.pagination.total>parseInt(previewCount)? parseInt(previewCount):vscompt.pagination.total">
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.table-tool-icon {
  text-align: right;
  height: 30px;
  line-height: 30px;
}
.icon-block {
  color: #409eff;
  cursor: pointer;
  margin-left: 18px;
  display: inline-block;
  &:hover {
    color: #66b1ff;
    span {
      color: #66b1ff;
    }
  }
  span {
    color: #666;
    padding-left: 5px;
    display: inline-block;
    cursor: pointer;
  }
}
.tab-block {
  width: 33px;
  text-align: left;
  border-right: 1px solid #c0c4cc;
  display: inline-block;
  height: 16px;
  position: relative;
  top: 2px;
  i {
    float: left;
    margin-top: 1px;
    cursor: pointer;
    color: #409eff;
    &:hover {
      color: #66b1ff;
    }
  }
}
.normal-table {
  height: 100%;
}
.export-table {
  height: 100%;
  margin-top: -30px;
  padding-top: 30px;
  .el-table {
    /deep/.row-count {
      font-weight:bold;
    }
  }
}
.pagination {
  width: 100%;
  text-align: right;
  margin-top: 10px;
  &.pagination-wrap {
    // display: inline-block;
    display: inline-flex;
    float: right;
  }
  .total-page-wrap {
    flex: 1;
    white-space: nowrap;
    padding: 2px 5px;
    color: #303133;
    font-weight: bold;
    .count-notice {
      float: left;
    }
    & > span {
      margin-right: 10px;
      font-weight: normal;
      color: #606266;
      height: 28px;
      line-height: 28px;
    }
  }
  .tips-wrap {
    float: left;
    margin-right: 10px;
    height: 28px;
    line-height: 28px;
    color: #606266;
    font-weight: bold;
    padding: 2px 5px;
  }
}
</style>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from "vuex";
export default {
  props: ["vscompt"],
  data() {
    return {
      optData: null,
      param: null,
      exportLoading: false,
      showSummary: false
    };
  },
  mounted() {
    // this.optData=this.option.data;
    // this.param=this.option.param;
    //导出是否需要短信验证加默认值
    if(this.vscompt.needSms === "" || this.vscompt.needSms === undefined){
      this.vscompt.needSms = this.needSms;
    }
  },
  watch: {
    isTotal(isTotal) {
      // let _this = this;
      // if (
      //   (this.previewCount &&
      //     Math.ceil(this.previewCount / _this.vscompt.pagination.pageSize) ==
      //       _this.vscompt.pagination.currentPage) ||
      //   (!this.previewCount &&
      //     Math.ceil(
      //       _this.vscompt.pagination.total / _this.vscompt.pagination.pageSize
      //     ) == _this.vscompt.pagination.currentPage)
      // ) {
      // if(this.checkIfNeedTotal()){
      //   this.changeData();
      // }
      this.changeData();
    },
    // isTotal:{
    //   immediate:true,
    //   handler:function(){
    //     this.changeData();
    //   }
    // },
    totalChange(val) {
      // let totalChange = this.totalChange;
      if (val) {
        // let _this = this;
        // if (
        //   (this.previewCount &&
        //     Math.ceil(this.previewCount / _this.vscompt.pagination.pageSize) ==
        //       _this.vscompt.pagination.currentPage) ||
        //   (!this.previewCount &&
        //     Math.ceil(
        //       _this.vscompt.pagination.total / _this.vscompt.pagination.pageSize
        //     ) == _this.vscompt.pagination.currentPage)
        // ) {
        if(this.checkIfNeedTotal()){
          if(this.isTotalOnly){
            this.queryTotalInfo();
          }else{
            this.changeData();
          }
        }
        this.upTotalChange(false);
      }
    },
    isChangeCalc(isChangeCalc) {
      // let _this = this;
      // if (
      //   this.isChangeCalc &&
      //   ((this.previewCount &&
      //     Math.ceil(this.previewCount / _this.vscompt.pagination.pageSize) ==
      //       _this.vscompt.pagination.currentPage) ||
      //     (!this.previewCount &&
      //       Math.ceil(
      //         _this.vscompt.pagination.total / _this.vscompt.pagination.pageSize
      //       ) == _this.vscompt.pagination.currentPage))
      // )
      if(this.checkIfNeedTotal()){
        this.changeData();
      }
      this.upIsChangeCalc(false);
    }
  },
  computed: {
    isShowTips() {
      // let _this = this;
      // return (
      //   _this.s_edcuiCompts[1].comptAttrs.totalRow &&
      //   ((this.previewCount &&
      //     Math.ceil(this.previewCount / _this.vscompt.pagination.pageSize) ==
      //       _this.vscompt.pagination.currentPage) ||
      //     (!this.previewCount &&
      //       Math.ceil(
      //         _this.vscompt.pagination.total / _this.vscompt.pagination.pageSize
      //       ) == _this.vscompt.pagination.currentPage)) && this.queryType == "list"
      // );
      return (
        this.s_edcuiCompts[1].comptAttrs.totalRow && this.checkIfNeedTotal()
      );
    },
    tabtagVal() {
      if (this.queryType == "list") {
        return "汇总";
      } else if (this.queryType == "summarize") {
        return "清单";
      }
    },
    ...mapState({
      dgwMsUrl: state => state.dgwMsUrl,
      smsId: state => state.compt.smsId,
      s_edcuiCompts: state => state.compt.s_edcuiCompts,
      pageCache: state => state.HomeBody.pageCache,
      loading: state => state.compt.loading,
      queryType: state => state.QueryTable.queryType,
      tabTag: state => state.QueryTable.tabTag,
      datasChange: state => state.QueryTable.datasChange,
      totalChange: state => state.QueryTable.totalChange,
      previewCount: state => state.commonProperties.previewCount,
      isTotalOnly: state => state.QueryTable.isTotalOnly,
      dimList: state => state.QueryTable.dimList,
      msuList: state => state.QueryTable.msuList,
      tableCols: state => state.QueryTable.tableCols,
      exportType: state => state.QueryTable.exportType,
      needSms: state => state.commonProperties.needSms
    }),
    ...mapGetters({
      condiCols: "QueryTable/condiCols",
      // hasTotaled: "QueryTable/hasTotaled",
      resultCols: "QueryTable/resultCols",
      isChangeCalc: "QueryTable/isChangeCalc",
      datasChange: "QueryTable/datasChange",
      totalChange: "QueryTable/totalChange",
      isTotal: "QueryTable/isTotal",
      tableColumn: "QueryTable/tableColumn",
      summarizeCols: "QueryTable/summarizeCols"
    })
  },
  methods: {
    colWidthChange(newWidth, oldWidth, column, event) {
      var columns = this.vscompt.columns;
      for (var i = 0; i < columns.length; i++) {
        if (columns[i].element_id == column.property) {
          columns[i].width = newWidth;
          this.tableCols[i].width = newWidth;
          break;
        }
      }
    },
    change() {
      this.vscompt.methods.cellClick = function() {};
    },
    // exportTable() {
    //   this.$message({
    //     message: "恭喜你，这是一条导出成功消息",
    //     type: "success"
    //   });
    // },
    handleSizeChange(val) {
      this.vscompt.pagination.currentPage = 1; //返回第一页
      this.vscompt.pagination.pageSize = val;
      if (
        this.vscompt.pagination.methods != null &&
        this.vscompt.pagination.methods.handleSizeChange != null
      ) {
        // eval(this.vscompt.pagination.methods.handleSizeChange)
        this.changeData();
      }
    },
    handleCurrentChange(val) {
      this.vscompt.pagination.currentPage = val;
      if (
        this.vscompt.pagination.methods != null &&
        this.vscompt.pagination.methods.handleCurrentChange != null
      ) {
        // eval(this.vscompt.pagination.methods.handleCurrentChange)

        this.changeData();
      }
    },
    changeData() {
      let _this = this;
      _this.upLoading(true);
      //取参数
      this.queryAfPropertyData()
        .then(function(response) {
          let respData = response.data.respData;
          let colList = [];
          if (_this.queryType == "list") {
            colList = _this.resultCols.select_list;
          } else if (_this.queryType == "summarize") {
            colList = _this.summarizeCols || [];
          }
          if (respData && respData.is_success == true) {
            let dataList = respData.result_data_list;
            _this.vscompt.tableattrs.data = [];
            for (let i = 0; i < dataList.length; i++) {
              let rows = dataList[i].data_list;
              let temp = {};
              for (let j = 0; j < rows.length; j++) {
                let item = colList[j].element_id;
                temp[item] = rows[j].data_val;
              }
              _this.vscompt.tableattrs.data.push(temp);
            }
            // 修复编辑页面进来直接设置总计，分页丢了的问题
            _this.vscompt.pagination.total = parseInt(
                respData.total_count
              );
            if (_this.previewCount) {
              let count =
                _this.vscompt.pagination.pageSize *
                  _this.vscompt.pagination.currentPage -
                parseInt(_this.previewCount);
              if (count > 0) {
                _this.vscompt.tableattrs.data.splice(
                  _this.vscompt.tableattrs.data.length - count,
                  count
                );
              }
            }
            _this.queryTotalInfo();
            _this.upLoading(false);
          }else{
            _this.upLoading(false);
            _this.$message.error("数据更新失败");
          }
        })
        .catch(function(error) {
          _this.upLoading(false);
          // _this.$message.error("数据更新失败");
        });
    },
    queryTotalInfo() {
      let _this = this;
      let select_list = this.resultCols.select_list;
      let params;
      // if (
      //   ((this.previewCount &&
      //     Math.ceil(this.previewCount / _this.vscompt.pagination.pageSize) ==
      //       _this.vscompt.pagination.currentPage) ||
      //     (!this.previewCount &&
      //       Math.ceil(
      //         _this.vscompt.pagination.total / _this.vscompt.pagination.pageSize
      //       ) == _this.vscompt.pagination.currentPage)) &&
      //   _this.s_edcuiCompts[1].comptAttrs.totalRow
      // )
      if (
        this.checkIfNeedTotal() &&
        _this.s_edcuiCompts[1].comptAttrs.totalRow
      )
      {
        let columns = _this.s_edcuiCompts[1].comptAttrs.columns;
        let selectList = [];
        _this.calcIndexArrs = [];
        columns.forEach((item, index) => {
          if (item.calcAttr) {
            item.col_id = item.prop;
            item.nick_name = item.label;
            item.fun_type = item.calcAttr;
            selectList.push(item);
            _this.calcIndexArrs.push(item.element_id);
            // 针对非count总计列，小数点保留2位
            if(item.calcAttr == 1){ //count
              item.numType = 0;
              item.dot = 0;
            }else{
              item.numType = 1;
              item.dot = 2;
            }
          }
        });
        if (selectList.length > 0) {
          // 判断列表里是否包含计算字段，如果是计算字段则提示
          var eleIdArr = [];
          this.tableCols.forEach(item => {
            if (item.is_calcul == "1") {
              eleIdArr.push(item.element_id);
            }
          });
          if(eleIdArr.length > 0){
            this.$message.closeAll();
            this.$message({
              message: "计算字段无法进行数值汇总",
              type: "warning"
            });
            return;
          }
          params = {
            select_list: selectList,
            head_bean: {
              pageCount: "",
              start: "",
              user_id: window.sessionStorage.getItem("user_id")
            }
          };

          _this.queryAfPropertyData({ params: params }).then(response => {
            let respData = response.data.respData;
            let colList = select_list;
            if(respData && (respData.is_success == true || respData.is_success == "true")){
              let dataList = respData.result_data_list || [];
              // _this.vscompt.tableattrs.data = [];
              for (let i = 0; i < dataList.length; i++) {
                let rows = dataList[i].data_list;
                let temp = {};
                for (let j = 0; j < rows.length; j++) {
                  let item = _this.calcIndexArrs[j];
                  temp[item] = rows[j].data_val;
                }
                temp.isTotal = true;
                temp[colList[0].element_id] = "总计"; //col_id
                let len1 = _this.vscompt.tableattrs.data.length||0;
                if(len1>0 && _this.vscompt.tableattrs.data[len1-1][colList[0].element_id] == "总计"){// 总计出现两次 取消选中 再选中
                  _this.vscompt.tableattrs.data.splice(len1-1,1);
                }
                _this.vscompt.tableattrs.data.push(temp);
              }
            }else{
              _this.$message.error("总计信息查询失败");
              console.error(respData.err_msg);
            }
          }).catch(function(error) {
          // _this.$message.error("总计信息查询失败");
          console.error(error);
        });
        }
      }
    },
    getSummaries(param) {
      let _this = this;
      let { data } = param;//columns,
      const sums = [];
      // data = [
      //     {
      //         "data_val": "86330"
      //     },
      //      {
      //         "data_val": "86330"
      //     },
      //      {
      //         "data_val": "111"
      //     }
      // ];
      data.forEach((item, index) => {
        if (index == 0) {
          sums[0] = "总计";
          return;
        }
        for (let i = 0, len = _this.calcIndexArrs.length; i < len; i++) {
          if (_this.calcIndexArrs[i] == index) {
            sums[index] = item.data_val;
            break;
          }
        }
      });

      return sums;
    },
    exportExcel(type) {
      if (this.pageCache.pageName == null || this.pageCache.pageName == '' || !this.pageCache.pageId){
        this.$message.warning("页面尚未保存，无法导出数据");
        return;
      }
      this.setExportType(type);
      var param = {
        userId: window.sessionStorage.getItem("user_id"),
        msisdn: window.sessionStorage.getItem("user_mobile")
      };
      if (this.vscompt.needSms === false) {
        //不需要短信
        try {
          this.exportLoading = true;
          this.queryAfPropertyData({
            isNeedPaging: "0",
            isExport: true
          })
            .then(val => {
              var param={};
              val.is_need_trans = 1;
              val.is_watermark="1";
              var waterStr = (sessionStorage.getItem('user_id')||'') +'\n'+ (sessionStorage.getItem("user_name")||"")+ '\n' +((new Date()).toLocaleDateString() + " " + (new Date()).toTimeString().split(' ')[0]);
              val.watermark_msg=waterStr;
              param.afQueryBean=val;
              try {
                param.isEncrypt=0;  //不需要密码this.smsId
                param.pageInfo={pageName:this.pageCache.pageName};
                param.asynExportInfo={pageId:this.pageCache.pageId,userId:sessionStorage.getItem("user_id"),exportType:this.exportType};
                param.exportType=this.exportType;
              } catch (e) {
                console.error(e);
              }
              return this.exportTable(param);
            })
            .then(response => {
              var respType=response.data.type;
              if(respType.indexOf("json")>=0){  //返回为json格式
                var reader=new FileReader();
                reader.readAsText(response.data,['utf-8']);
                reader.onload=()=>{
                  var obj=JSON.parse(reader.result);
                  if(obj.respResult=="1"){
                    this.exportLoading = false;
                    this.setExportDialog(false);
                    this.setTabActive('third');
                    this.setQueryHistory(true);
                  }else{
                    this.exportLoading = false;
                    this.$message.error("导出失败："+obj.respErrorDesc);
                  }
                };
                reader.onerror=()=>{
                  this.$message.error("读取后台返回json失败");
                }
              }else{  //返回为stream格式
                if(response.data.size==0){
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
                this.exportLoading = false;
              }
            })
            .catch(err => {
              // this.$message.error(err);
              this.exportLoading = false;
            });
        } catch (e) {
          this.$message.error(e);
          this.exportLoading = false;
        }

        return;
      }
      //需要短信
      if (param.msisdn == "undefined") {
        this.$message.error("当前用户的手机号码为空");
        return;
      }
      param.fileName=this.pageCache.pageName;
      this.sendSms(param)
        .then(val => {
          if (val.status === 200 && val.data.respResult === "1") {
            var id = val.data.respData;
            this.setSmsId(id);
            this.setExportDialog(true);
          } else {
            this.$message.error(val.data.respErrorDesc);
          }
        })
        .catch(err => {
          // this.$message.error("获取短信验证码异常");
        });
    },
    showSummarize() {
      // 如果没选度量 提示
      let msuList = this.tableCols.filter(item=>{
        return item.element_type == 2;
      })
      if(msuList.length == 0){
        this.$message.warning("没有可用的度量字段");
        return;
      }
      this.setSummarizeDialog(true);
    },
    queryHistory(){
      this.setTabActive('first');
      this.setQueryHistory(true);
    },
    queryTask(){
      if (this.pageCache.pageName == null || this.pageCache.pageName == '' || !this.pageCache.pageId) {
        this.$message.warning('页面尚未保存，无法设置定时取数')
        return
      }
      this.setQueryTaskDialog(true);
    },
    /**
     * numType: 1 小数， 2 百分比
     * dot:小数位数
     *
     * **/
    dataFormatter(row, column, cellValue, index, i, col) {
      if (cellValue != "总计") {
        if (col.numType == 1) {
          cellValue = parseFloat(cellValue).toFixed(col.dot);
        } else if (col.numType == 2) {
          cellValue =
            parseFloat(cellValue.replace(/%/gi, "") + "00").toFixed(col.dot) +
            "%";
        }
      }
      // 日期格式化先屏蔽
      /* if ((col.show_format || "") != "") {
        let len = 0;
        if (typeof cellValue == "string")
          len = cellValue.replace(/-|\/|,/gi, "").length || 0;
        var value = "";
        if (cellValue != undefined) value = cellValue.toString(); //.replace(/-|\//g, "");
        if (
          value.search(/-|\/|:/gi) == -1 &&
          (value.length == 10 || value.length == 13)
        ) {
          value = parseInt(value);
        } else {
          if (value.search(/:/gi) > -1) {
            value = value.replace(/-/gi, "/");
          } else {
            if (len.toString().search(/4|6|8/) > -1) {
              value = value.replace(/-|\/|,/g, "").padEnd(8, "01");
              value =
                value.slice(0, 4) +
                "/" +
                value.slice(4, 6) +
                "/" +
                value.slice(6);
            }
          }
        }
        let formatter = col.show_format.toLowerCase();
        cellValue = this.dateFtt(formatter, value);
      } */
      // if (row.isTotal && cellValue) {
      //   cellValue = '<b>' + cellValue + '</b>'
      // }
      if (cellValue == "总计" && i > 0) {
        cellValue = "";
      }
      //为空或者为NaN时候设置 -
      if (cellValue == "NaN" || cellValue == "" ) {
        cellValue = "-";
      }

      return cellValue;
    },
    dateFtt(fmt, date) {
      let oldDate = date;
      date = new Date(date);
      var o = {
        mm: date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //小时
        mi: date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        S: date.getMilliseconds() //毫秒
      };
      if (/(y+)/.test(fmt))
        fmt = fmt.replace(
          RegExp.$1,
          (date.getFullYear() + "").substr(4 - RegExp.$1.length)
        );
      for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
          fmt = fmt.replace(
            RegExp.$1,
            RegExp.$1.length == 1
              ? o[k]
              : ("00" + o[k]).substr(("" + o[k]).length)
          );
      if (fmt.search(/NaN/gi) > -1) {
        return oldDate;
      }
      return fmt;
    },
    updateData() {
      var _old = this.queryType;
      var _new = _old == "list" ? "summarize" : "list";
      // 如果有聚合类字段禁止清单预览
      if(_new == 'list') {
        let sign = false;
        for(let i=0;i<this.tableCols.length;i++) {
          if(this.tableCols[i].is_calcul=='2') {
            sign = true;
            break;
          }
        }
        if(sign) {
          this.$message.warning('聚合计算无法参与清单设计');
          return;
        }
      }

      this.setQueryType(_new);
      this.upLoading(true);
      //结果参数
      var params = {
        head_bean: {
          pageCount: this.vscompt.pagination.pageSize,
          start: ""
        }
      };
      this.queryAfPropertyData({ params })
        .then(response => {
          if (response.data.respResult == 1 && response.status == 200) {
            var respData = response.data.respData;
            var dataList = [];
            try {
              this.s_edcuiCompts[1].comptAttrs.pagination.total = parseInt(
                response.data.respData.total_count
              );
              dataList = respData.result_data_list || [];
            } catch (e) {
              // console.log(e);
            }
            var colList = null;
            if (_new == "list") {
              colList = this.resultCols.select_list;
            } else if (_new == "summarize") {
              colList = this.summarizeCols || [];
            }
            this.s_edcuiCompts[1].comptAttrs.columns = [];
            this.s_edcuiCompts[1].comptAttrs.tableattrs.data = [];
            this.s_edcuiCompts[1].comptAttrs.columns = this.tableColumn;
            for (var i = 0; i < dataList.length; i++) {
              var rows = dataList[i].data_list;
              var temp = {};
              for (var j = 0; j < rows.length; j++) {
                var item = colList[j].element_id;
                temp[item] = rows[j].data_val;
              }
              this.s_edcuiCompts[1].comptAttrs.tableattrs.data.push(temp);
            }
            this.vscompt.pagination.currentPage = 1;
          } else {
            this.$message.error("数据更新失败");
          }
          this.upLoading(false);
        })
        .catch(error => {
          console.error(error);
          this.upLoading(false);
          // this.$message.error("数据更新失败");
        });
    },
    rowClass({ row, rowIndex}) {
      if(row.isTotal){
        return "row-count"
      }
    },
    ...mapMutations({
      upLoading: "compt/upLoading",
      upIsTotal: "QueryTable/upIsTotal",
      upDatasChange: "QueryTable/upDatasChange",
      upTotalChange: "QueryTable/upTotalChange",
      upIsChangeCalc: "QueryTable/upIsChangeCalc",
      setQueryType: "QueryTable/setQueryType",
      setTabtag: "QueryTable/setTabtag",
      setDimList: "QueryTable/setDimList",
      setMsuList: "QueryTable/setMsuList",
      setTabActive: "AsynExport/setTabActive",
      setExportType: "QueryTable/setExportType"
    }),
    ...mapActions({
      queryAfPropertyData: "QueryTable/queryAfPropertyData",
      upIsTotal: "QueryTable/upIsTotal",
      upTotalChange: "QueryTable/upTotalChange",
      upLoading: "compt/upLoading",
      setExportDialog: "compt/setExportDialog",
      sendSms: "compt/sendSms",
      setSmsId: "compt/setSmsId",
      upIsChangeCalc: "QueryTable/upIsChangeCalc",
      exportTable: "QueryTable/exportTable",
      setSummarizeDialog: "compt/setSummarizeDialog",
      setQueryHistory:"compt/setQueryHistory",
      setQueryTaskDialog:"compt/setQueryTaskDialog"
    }),
    checkIfNeedTotal(){
      return ((this.previewCount &&
          Math.ceil(this.previewCount / this.vscompt.pagination.pageSize) ==
            this.vscompt.pagination.currentPage) ||
        (this.previewCount &&
          Math.ceil(
            this.vscompt.pagination.total / this.vscompt.pagination.pageSize
          ) == this.vscompt.pagination.currentPage)) && this.queryType == "list";
    }
  }
};
</script>
