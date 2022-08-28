<template>
  <div class="main-content"
       v-loading="exportLoading">
    <div class="main-content-form">
      <el-form ref="form"
               :inline="true"
               :model="searchForm"
               class="demo-form-inline"
               size="mini">
        <el-form-item label="名称">
          <el-input size="mini"
                    style="width:210px"
                    v-model="searchForm.pageName"
                    placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select size="mini"
                     style="width:150px"
                     v-model="searchForm.status"
                     placeholder="请选择">
            <el-option label="全部"
                       value=""></el-option>
            <el-option label="未发布"
                       value="0"></el-option>
            <el-option label="已发布"
                       value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="更新时间">
          <el-date-picker size="mini"
                          value-format=" yyyyMMdd"
                          v-model="searchForm.updateTime"
                          type="daterange"
                          align="right"
                          unlink-panels
                          range-separator="至"
                          start-placeholder="开始日期"
                          end-placeholder="结束日期"
                          :picker-options="pickerOptions">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button @click="search()"
                     type="primary"
                     size="mini">查询
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="main-content-tool">
      <div v-if="catalogId != 'workfold' && executePriv != '0'"
           class="tool-btn"
           @click="addTableData">
        <span class="icon-A10072_add tool-btn-icon"></span>
        <span class="tool-btn-text">新增</span>
      </div>
      <div v-if="catalogId != 'workfold' && executePriv != '0'"
           class="tool-btn"
           @click="goDelete">
        <span class="icon-A10065_delete tool-btn-icon"></span>
        <span class="tool-btn-text">删除</span>
      </div>
      <div v-if="catalogId != 'workfold' && executePriv != '0'"
           class="tool-btn"
           @click="goPublic">
        <span class="icon-A10163_publish tool-btn-icon"></span>
        <span class="tool-btn-text">发布</span>
      </div>
      <div v-if="catalogId != 'workfold' && executePriv != '0'"
           class="tool-btn"
           @click="exportZip">
        <span class="icon-A10091_download tool-btn-icon"></span>
        <span class="tool-btn-text">导出</span>
      </div>

      <el-upload v-if="catalogId != 'workfold' && importPriv != '0'"
                 class="tool-btn"
                 :show-file-list="false"
                 accept=".zip"
                 :on-success="importSucc"
                 :before-upload="beforeUploadHandle"
                 :on-error="importError"
                 :action="contextUrl+'/import/importPageInfo.do'"
                 :headers="uploadHeader">
        <a>
          <span class="icon-A10165_upload tool-btn-icon"></span>
          <span class="tool-btn-text">导入</span>
        </a>
      </el-upload>
    </div>
    <div class="main-content-table">
      <GeminiScrollbar class="my-scroll-bar">

        <!--报表工具-->
        <el-table v-loading="loading"
                  border
                  :data="tableData"
                  height="100%"
                  style="width: 100%"
                  @select="selectTable"
                  @select-all="selectTable"
                  size="mini">
          <el-table-column type="selection"
                           width="55"></el-table-column>
          <el-table-column label="中文名称">
            <template slot-scope="scope">
              <div style="height: 0px;font-size:15px;text-align:left;"> {{ scope.row.pageName }}</div>
                <span v-if="scope.row.catalogClassPath != ''"><br/></span>
              <div style="font-size:11px; color:#CCCCCC ;text-align:left;" v-if="scope.row.catalogClassPath != ''"> {{ scope.row.catalogClassPath }}</div>
            </template>

          </el-table-column>
          <el-table-column label="状态">
            <template slot-scope="scope">
              {{ scope.row.status==1?"已发布":"未发布" }}
            </template>
          </el-table-column>
          <el-table-column prop="createUser"
                           label="创建者"></el-table-column>
          <el-table-column prop="updateTime"
                           label="更新时间"></el-table-column>
          <el-table-column label="操作">
            <!--开发态：他人文件只能预览、另存、收藏；自己创建文件增加编辑、删除、属性功能
                测试/生产态：只能进行预览，隐藏其他所有操作
             -->
            <template slot-scope="scope">
              <el-tooltip class="item"
                          effect="dark"
                          content="预览"
                          placement="top-start">
								<span class="icon-A10181_browseCount table-icon"
                      @click="toPrew(scope.row)"></span>
              </el-tooltip>
              <el-tooltip class="item"
                          effect="dark"
                          content="编辑"
                          placement="top-start">
								<span
                  v-show="(catalogId=='myfold'&&executePriv!='0') || (catalogId=='workfold'&&executePriv!='0'&&window.sessionStorage.getItem('user_id')==scope.row.createUser)"
                  class="icon-A10189_edit table-icon"
                  @click="editDesign(scope.row)"></span>
              </el-tooltip>
              <el-tooltip class="item"
                          effect="dark"
                          content="属性"
                          placement="top-start">
								<span
                  v-show="(catalogId=='myfold'&&executePriv!='0') || (catalogId=='workfold'&&executePriv!='0'&&window.sessionStorage.getItem('user_id')==scope.row.createUser)"
                  class="icon-A10155_sigh table-icon"
                  @click="editPage(scope.row)"></span>
              </el-tooltip>
              <el-tooltip class="item"
                          effect="dark"
                          content="另存为"
                          placement="top-start">
								<span v-show="(catalogId=='myfold'&&executePriv!='0') || (catalogId=='workfold'&&executePriv!='0')"
                      class="icon-A10545_PS table-icon"
                      @click="saveTo(scope.row)"></span>
              </el-tooltip>
              <el-tooltip class="item"
                          effect="dark"
                          content="删除"
                          placement="top-start">
								<span
                  v-show="(catalogId=='myfold'&&executePriv!='0') || (catalogId=='workfold'&&executePriv!='0'&&window.sessionStorage.getItem('user_id')==scope.row.createUser)"
                  class="icon-A10065_delete table-icon"
                  @click="deleteRow(scope.row)"></span>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </GeminiScrollbar>
    </div>
    <div class="table-page">
      <el-pagination :current-page="pageQuery.start"
                     :page-sizes="[10, 20, 30, 40]"
                     :page-size="10"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total"
                     @size-change="sizeChange"
                     @current-change="pageChange"></el-pagination>
    </div>

    <el-dialog width="420px"
               :visible.sync="dialogFormVisible">
      <div slot="title"
           class="dialog-title">
        <span>基本信息</span>
        <div class="title-line"></div>
      </div>
      <el-form ref="ruleForm"
               :rules="rules"
               :model="form">
        <el-form-item prop="pageName"
                      label="名称"
                      :label-width="formLabelWidth">
          <el-input size="mini"
                    v-model="form.pageName"
                    autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item class="win-item"
                      label="描述"
                      :label-width="formLabelWidth">
          <el-input type="textarea"
                    rows="5"
                    v-model="form.pageDesc"
                    style="height:116px;"
                     maxlength="50"></el-input>
        </el-form-item>
        <el-form-item prop="urlData"
                      label="URL"
                      :label-width="formLabelWidth"
                      style="margin-bottom: 4px;">
          <el-input size="mini"
                    v-model="form.urlData"
                    autocomplete="off"
                    style="width:305px;"></el-input>
          <el-tooltip class="item"
                      effect="dark"
                      content="复制URL"
                      placement="top-start">
						<span style="padding-left:10px;margin-right: 0;"
                  class="icon-A10545_PS table-icon"
                  :data-clipboard-text="form.urlData"
                  @click="copy"
                  id="copy_text"></span>
          </el-tooltip>
        </el-form-item>
      </el-form>
      <div slot="footer"
           class="dialog-footer">
        <el-button @click="dialogFormVisible=false"
                   size="mini">取 消
        </el-button>
        <el-button type="primary"
                   @click="submitForm('ruleForm')"
                   size="mini">确 定
        </el-button>
      </div>
    </el-dialog>

    <el-dialog width="420px"
               :visible.sync="dialogSaveAs">
      <div slot="title"
           class="dialog-title">
        <span>另存为</span>
        <div class="title-line"></div>
      </div>
      <el-form ref="saveForm"
               :rules="rules"
               :model="saveForm">
        <el-form-item prop="pageName"
                      label="名称"
                      :label-width="formLabelWidth">
          <el-input size="mini"
                    v-model="saveForm.pageName"
                    autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item size="mini"
                      prop="catalogId"
                      class="win-item"
                      label="目录"
                      :label-width="formLabelWidth"
                      style="margin-bottom:11px;">
          <el-cascader :show-all-levels="false"
                       style="width:100%"
                       :options="saveToTreeData"
                       v-model="saveForm.catalogId"></el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer"
           class="dialog-footer">
        <el-button @click="dialogSaveAs=false"
                   size="mini">取 消
        </el-button>
        <el-button type="primary"
                   @click="saveAsSubmit('saveForm')"
                   size="mini">确 定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {mapActions, mapMutations, mapState} from "vuex";
  import Clipboard from 'clipboard';

  export default {
    data() {
      var catalogCheck = (rule, value, callback) => {
        if (value.length == 0) {
          callback(new Error("请选择目录"));
        } else {
          callback();
        }
      };
      return {
        loading: true,
        pageQuery: {
          start: 1,
          pageCount: 10
        },
        pageList: [],
        selectRow: "",
        deleteType: "",
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
        searchForm: {
          pageName: "",
          status: "",
          updateTime: ""
        },
        form: {
          pageName: "",
          pageDesc: ""
        },
        saveForm: {
          pageName: "",
          catalogId: [],
          pageId: ""
        },
        dialogFormVisible: false,
        saveToTreeData: [],
        deleteDialog: false,
        dialogSaveAs: false,
        formLabelWidth: "51px",
        rules: {
          pageName: [
            {required: true, message: "请输入名称", trigger: "blur"},
            {min: 1, max: 20, message: "长度在 1 到 20 个字符", trigger: "blur"}
          ],
          catalogId: [
            {required: true, validator: catalogCheck, trigger: "change"}
          ]
        },
        uploadHeader: {
          JTT: window.sessionStorage.getItem("jtt"),
          "X-catalogId":this.$store.state.HomeBody.catalogId,
          "X-classTypeId":this.$store.state.HomeTree.menuClassTypeId
        },
        exportLoading: false
      };
    },
    computed: {
      ...mapState({
        tableData: state => state.ReportIndex.tableData.list, //从ReportIndex.js出获取数据
        total: state => state.ReportIndex.tableData.total,
        catalogId: state => state.ReportIndex.catalogId,
        tenantId: state => state.HomeBody.tenantId,
        classtypeId: state => state.ReportIndex.classtypeId,
        catalogLevel: state => state.ReportIndex.catalogLevel,
        treeData: state => state.HomeTree.treeData,
        contextUrl: state => state.contextUrl,
        myFolder: state => state.commonProperties.myFolder, //我的文件夹权限
        importPriv: state => state.commonProperties.importPriv, //导入权限
        executePriv: state => state.commonProperties.executePriv  //可执行权限
      })
    },
    watch: {
      //节点改变分页初始化值也改变
      catalogId() {
        //目录变化--监听
        this.pageQuery.start = 1;
        this.pageQuery.pageCount = 10;
        this.search();
      },
      tenantId() {
        //租户变化 -- 监听
        this.resetSearchCondi();
        this.search();
      },
      classtypeId() {
        //目录模块切换时候重新在查询
        this.pageQuery.start = 1;
        this.pageQuery.pageCount = 10;
        this.search();
      },
      deleteDialog(val) {
        if (!val) return
        const text = '确认要删除所选项吗？'
        this.open(text)
      }
    },
    methods: {
      submitForm(formName) {
        this.$refs[formName].validate(valid => {
          if (valid) {
            var param = Object.assign({}, this.selectRow, this.form);
            this.updatePageInfo(param)
              .then(val => {
                if (val.status === 200 && val.data.respResult === "1") {
                  this.$message.success("页面修改成功");
                  this.dialogFormVisible = false;
                  this.search();
                } else {
                  this.$message.error(val.data.respErrorDesc);
                }
              })
              .catch(err => {
                // this.$message.error("页面修改失败");
              });
          } else {
            return false;
          }
        });
      },
      copy() {//复制
        var clipboard = new Clipboard('#copy_text');
        clipboard.on('success', e => {
          // 释放内存
          clipboard.destroy();
          this.$message.success("复制成功！");
        })
        clipboard.on('error', e => {
          // 不支持复制
          Message({
            message: '该浏览器不支持自动复制',
            type: 'warning'
          });
          // 释放内存
          clipboard.destroy()
        })
      },
      saveAsSubmit(formName) {
        this.$refs[formName].validate(valid => {
          if (valid) {
            var param = {};
            for (var item of this.tableData) {
              if (item.pageId == this.saveForm.pageId) {
                param = JSON.parse(JSON.stringify(item));
                break;
              }
            }
            var catalogId = this.saveForm.catalogId[
            this.saveForm.catalogId.length - 1
              ];
            var pageName = this.saveForm.pageName;
            param.catalogId = catalogId;
            param.pageName = pageName;
            this.saveAsPage(param)
              .then(val => {
                if (val.status === 200 && val.data.respResult === "1") {
                  this.$message.success("页面另存成功");
                  this.dialogSaveAs = false;
                  this.search();
                } else {
                  this.$message.error(val.data.respErrorDesc);
                }
              })
              .catch(err => {
              });
          } else {
            return false;
          }
        });
      },
      search() {
        var tid = sessionStorage.getItem("tenant_id");
        var uid = sessionStorage.getItem("user_id");
        this.loading = true;
        var {pageName} = this.searchForm;
        var status = this.searchForm.status;
        if (this.searchForm.updateTime == null) {
          this.searchForm.updateTime = "";
        }
        var updateBeginTime = (this.searchForm.updateTime[0] || "").replace(
          /\s*/g,
          ""
        );
        var updateEndTime = (this.searchForm.updateTime[1] || "").replace(
          /\s*/g,
          ""
        );

        var param;
        if (this.myFolder == '0' || this.catalogId == "workfold") {  //工作组文件夹
          param = Object.assign(
            {updateBeginTime, updateEndTime, pageName, status},
            {
              start: this.pageQuery.start,
              pageCount: this.pageQuery.pageCount,
              catalogId: this.catalogId,
              tenantId: tid,
              createUser: uid,
              workFlag: "1"
            }
          );

        } else {
          param = Object.assign(
            {updateBeginTime, updateEndTime, pageName, status},
            {
              start: this.pageQuery.start,
              pageCount: this.pageQuery.pageCount,
              catalogId: this.catalogId,
              tenantId: tid,
              createUser: uid,
              workFlag: "0"
            }
          );
        }
        this.queryTableData(param)
          .then(val => {
            if (val.status === 200 && val.data.respResult === "1") {
              var total = val.data.dataTotalCount;
              var list = val.data.respData;
              this.$store.commit("ReportIndex/setTableData", {total, list});
            } else {
              this.$message.error("页面查询失败");
            }
            this.loading = false;
          })
          .catch(err => {
            // this.$message.error("页面查询异常");
            this.loading = false;
          });
      },
      addTableData() {
        var tid = sessionStorage.getItem("tenant_id");
        if (this.catalogId === "") {
          this.$message.warning("请选择目录再创建页面");
          return;
        }
        if (this.catalogId === "workfold") {
          this.$message.warning("不可在工作组文件夹下添加！");
          return;
        }
        var item = {};
        item.tenantId = tid;
        item.createUser =
          sessionStorage.getItem("user_id") == null
            ? "999999"
            : sessionStorage.getItem("user_id");
        item.catalogId = this.catalogId;
        item.operation = "design";
        if (this.classtypeId == 1002) {
          item.layoutType = 1;
        }
        this.setPageCache(item);
        this.toDesign();
      },
      editDesign(data) {
        data.operation = "design";
        this.setPageCache(data);
        this.toDesign();
      },
      editPage(data) {
        return false;
        // this.selectRow = data;
        // this.form.pageName = data.pageName;
        // this.form.pageDesc = data.pageDesc;
        // if (data.status == '1') {//发布
        // 	this.form.urlData = "/dataeleph-show/v1/preview/index?pageId=" + data.pageId;
        // }
        // else {
        // 	this.form.urlData = "";
        // }
        // this.dialogFormVisible = true;
      },
      saveTo(data) {
        return false;
        // this.saveToTreeData.splice(0, this.saveToTreeData.length);
        // var temp = "";
        // this.treeData.forEach(function (val) { //forEach不能使用this否则会包指向不对
        // 	if (val.value != 'workfold') {
        // 		temp = val;
        // 	}
        
        // });
        
        // this.saveToTreeData.push(temp);
        
        // this.selectRow = data;
        // this.saveForm.pageName = data.pageName;
        // this.saveForm.pageId = data.pageId;
        // this.saveForm.catalogId = [];
        // this.dialogSaveAs = true;
      },
      pageChange(val) {
        this.pageQuery.start = val;
        this.search();
      },
      sizeChange(val) {
        this.pageQuery.pageCount = val;
        this.pageQuery.start = 1;
        this.search();
      },
      selectTable(select) {
        this.pageList = select;
      },
      goDelete() {
        if (this.pageList.length == 0) {
          this.$message.warning("请选择要删除的页面");
          return;
        } else {
          var list = this.pageList;
          var flag = false;
          for (var i = 0; i < list.length; i++) {
            if (list[i].status == "1") {
              flag = true;
              break;
            }
          }
          if (flag) {
            this.$message.error("不能删除已发布的页面");
            return;
          }
          this.deleteDialog = true;
          this.deleteType = "multiple";
        }
      },
      goPublic() {
        //发布
        if (this.pageList.length == 0) {
          this.$message.warning("请选择要发布的页面");
          return;
        }

        let pageParam = [];
        this.pageList.forEach(function (val) {
          pageParam.push({
            pageId: val.pageId,
            status: '1' //1:已发布 0:未发布
          });
        });
        this.pubPageInfo(pageParam)
          .then(val => {
            //调用后台方法
            if (val.status === 200 && val.data.respResult === "1") {
              this.$message.success("批量发布成功");
              this.deleteDialog = false;
              this.search();
            } else {
              this.$message.error("批量发布失败");
            }
          })
          .catch(err => {
            // this.$message.error("批量发布异常");
          });
      },
      delTableData() {
        var idList = [];
        if (this.deleteType == "multiple") {
          this.pageList.forEach(function (val) {
            idList.push(val.pageId);
          });
        } else if (this.deleteType == "single") {
          idList.push(this.selectRow.pageId);
        }
        this.deletePageInfo(idList)
          .then(val => {
            if (val.status === 200 && val.data.respResult === "1") {
              this.$message.success("页面删除成功");
              this.deleteDialog = false;
              this.search();
            } else {
              this.$message.error("页面删除失败");
            }
          })
          .catch(err => {
            // this.$message.error("页面删除异常");
          });
      },
      deleteRow(data) {
        return false;
        // if (data.status == "1") {
        // 	this.$message.error("不能删除已发布的页面");
        // 	return;
        // }
        // this.selectRow = data;
        // this.deleteType = "single";
        // this.deleteDialog = true;
      },
      open(text) {
        this.$confirm(text, '提示', {
          closeOnClickModal: false,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          // type: 'warning'
        }).then(() => {
          this.$message({
            type: 'success',
            message: '操作成功!'
          });
          this.delTableData()
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          });
          this.deleteDialog = false
        });
      },
      toDesign() {
        const getTimestamp = new Date().getTime()
        this.$router.push({
          path: '/report',
          name: 'report',
          query: {timestamp: getTimestamp}
        });
      },
      toPrew(data) {
        return false;
        // data.operation = "preview";
        // this.setPageCache(data);
        // this.$router.push({
        // 	path: "/preview",
        // 	name: "preview"
        // });
      },
      exportZip() {
        if (this.pageList.length == 0) {
          this.$message.warning("请选择要导出的报表");
          return;
        }
        var list = this.pageList;
        var flag = false;
        var errmsg = "";
        for (var i = 0; i < list.length; i++) {
          if (list[i].status == "0") {
           errmsg = errmsg + list[i].pageName + ",";
           if(flag === false){
              flag = true;
           }
          }
        }
        if (flag) {
          this.$message.error(errmsg.slice(0,errmsg.length-1) + "未提交版本，无法导出！");
          return;
        }
        this.exportLoading = true;
        var idList = [];
        this.pageList.forEach(function (val) {
          idList.push(val.pageId);
        });
        var param = {};
        param.pageIdList = idList;
        param.classTypeId = this.menuClassTypeId; //分类id
        this.getExportPage(param)
          .then(response => {
            var fileName = "页面.zip";
            var blob = new Blob([response.data], {
              type: "application/zip;charset=utf-8"
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
            this.exportLoading = false;
          })
          .catch(err => {
            // this.$message.error(err);
            this.exportLoading = false;
          });
      },
      beforeUploadHandle(file) {
        let fileName = file.name;
        let fileType = fileName.substring(fileName.lastIndexOf("."), fileName.length);
        if (fileType.toLowerCase() !== '.zip') {
          this.$message.error('请选择zip文件上传！');
          return false;
        }
        this.uploadHeader['X-catalogId']=this.catalogId;
        this.uploadHeader['X-classTypeId']=this.menuClassTypeId;
      },
      importSucc(response, file, fileList) {
        if (response.respResult == 1) { // 成功
          this.$message.success(response.respData);
        } else if (response.respResult == 0) {
          this.$message.error(response.respErrorDesc);
        }
      },
      importError(err, file, fileList) {
        this.$message.error("导入文件出错");
      },
      ...mapMutations({
        setTableData: "ReportIndex/setTableData"
      }),
      ...mapActions({
        queryTableData: "ReportIndex/queryTableData",
        saveAsPage: "ReportIndex/saveAsPage",
        updatePageInfo: "ReportIndex/updatePageInfo",
        deletePageInfo: "ReportIndex/deletePageInfo",
        setPageCache: "ReportIndex/setPageCache",
        pubPageInfo: "ReportIndex/pubPageInfo",
        exportPageZip: "ReportIndex/exportPageZip",
        getExportPage: "ReportIndex/getExportPage"
      })
    },
    mounted() {
      this.search();
    },
    activated() {
      this.search();
    }
  };
</script>

<style lang="scss" scoped>
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
    text-align: right;
    margin: 6px 0 10px 0;

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
