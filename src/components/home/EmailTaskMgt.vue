<template>
  <div class="main-content" v-loading="exportLoading">
    <div class="main-content-form">
      <SimpleCondi :data="condiSettingsData" @condiSubmit="search(true)"></SimpleCondi>
    </div>
    <div
      class="main-content-table"
      :style="computedStyle('table')"
    >
        <el-table
          v-loading="loading"
          border
          :data="tableData"
          height="100%"
          style="width: 100%"
          @select="selectTable"
          @select-all="selectTable"
          size="mini"
        >
          <!-- <el-table-column type="selection" width="55" :selectable="unSelectDemo"></el-table-column> -->
          <el-table-column label="报表名称" prop="pageName" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <div class="name-text name-txt1" style="height: 46px; line-height: 46px;">{{ scope.row.pageName }}</div>
               <!-- <span v-if="scope.row.catalogClassPath != ''"><br/></span>
              <div class="name-text name-txt2"  v-if="scope.row.catalogClassPath != ''">{{ scope.row.catalogClassPath }}</div> -->
            </template>
            <!-- <template slot-scope="scope">
              <div class="name-text name-txt1">{{ scope.row.pageName }}</div>
            </template> -->
          </el-table-column>
          <el-table-column label="任务状态" :show-overflow-tooltip="true">
            <template slot-scope="scope">{{ scope.row.isCancel === '1' ? '取消' : '开启' }}</template>
          </el-table-column>
          <el-table-column prop="userName" label="创建者" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="updateTime" label="更新时间" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="nextPushTime" label="下次定时" :show-overflow-tooltip="true">
            <template slot-scope="scope">{{ scope.row.nextPushTime }}</template>
          </el-table-column>
          <el-table-column label="操作" width="250">
            <template slot-scope="scope">
              <el-tooltip class="item" effect="dark" content="编辑" placement="top-start">
                <span
                  class="icon-A10189_edit table-icon"
                  @click="editTask(scope.row)"
                ></span>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" :content="scope.row.isCancel === '0' ? '取消' : '开启'" placement="top-start">
                <span
                  :class="{'icon-A10075_pause': scope.row.isCancel === '0', 'icon-A10076_play':scope.row.isCancel !== '0', 'table-icon': true}"
                  @click="suspendTask(scope.row)"
                ></span>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="日志" placement="top-start">
                <span
                  class="icon-A10695_logQuery table-icon"
                  @click="searchLog(scope.row)"
                ></span>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      <!-- </GeminiScrollbar> -->
    </div>
    <div class="table-page">
      <el-pagination
        :current-page="pageQuery.start"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="10"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="sizeChange"
        @current-change="pageChange"
      ></el-pagination>
    </div>
    <!-- 邮件推送 -->
    <EmailTask v-if="emailTaskDialogVis" :pageObj="clickPageObj"></EmailTask>
    <!-- 推送日志 -->
    <EmailTaskLog v-if="emailTaskLogDialogVis" :pageObj="clickPageObj"></EmailTaskLog>
  </div>
</template>

<script>
  import {mapActions, mapMutations, mapState} from "vuex";
  import Clipboard from "clipboard";
  import CaptureDialog from "../design/CaptureDialog.vue";
  import CockpitDialog from "../design/CockpitDialog.vue";
  import condiMixins from "../../utils/condiMixins.js"
  import EmailTask from "../design/EmailTask.vue"
  import EmailTaskLog from "../design/EmailTaskLog.vue"
  export default {
    mixins: [condiMixins],
    components: {
      CaptureDialog,
      CockpitDialog,
      EmailTask,
      EmailTaskLog
    },
    data() {
      var catalogCheck = (rule, value, callback) => {
        if (value.length == 0) {
          callback(new Error("请选择目录"));
        } else {
          callback();
        }
      };
      return {
        userId: window.sessionStorage.getItem("user_id"),
        tid: window.sessionStorage.getItem("tenant_id"),
        loading: true,
        pageQuery: {
          start: 1,
          pageCount: 10
        },
        pageList: [],
        clickPageObj: {}, // 选中的page
        selectRow: "",
        deleteType: "",
        condiSettingsData:[
          {
            name:'报表名称',
            formSymbol: 'pageName',
            type: 'input',
            vModelValue: '',
            selectOptions: []
          },
          {
            name:'任务状态',
            formSymbol: 'status',
            type: 'select',
            vModelValue: '',
            selectOptions: [
              {
                value: '',
                label: '全部'
              },
              {
                value: '1',
                label: '取消'
              },
              {
                value: '0',
                label: '正常'
              }
            ]
          },
          {
            name:'下次定时',
            formSymbol: 'updateTime',
            type: 'date-picker',
            vModelValue: '',
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
            }
          }
        ],
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
            {min: 1, max: 30, message: "长度在 1 到 30 个字符", trigger: "blur"}
          ],
          catalogId: [
            {required: true, validator: catalogCheck, trigger: "change"}
          ]
        },
        uploadHeader: {
          JTT: window.sessionStorage.getItem("jtt"),
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-NG-SessionId": window.sessionStorage.getItem("X-NG-SessionId")
        },
        exportLoading: false,
        dialogMove: false,
        moveToTreeData: [],
        moveForm: {
          catalogId: [],
          pageId: ""
        }
      };
    },
    computed: {
      ...mapState({
        tableData: state => state.DataSetMgt.tableData.list, //从homebody.js出获取数据
        total: state => state.DataSetMgt.tableData.total,
        catalogId: state => state.HomeBody.catalogId,
        tenantId: state => state.HomeBody.tenantId,
        classtypeId: state => state.HomeBody.classtypeId,
        catalogLevel: state => state.HomeBody.catalogLevel,
        treeData: state => state.HomeTree.treeData,
        contextUrl: state => state.contextUrl,
        myFolder: state => state.commonProperties.myFolder, //我的文件夹权限
        importPriv: state => state.commonProperties.importPriv, //导入权限
        executePriv: state => state.commonProperties.executePriv, //可执行权限
        fjbassPublish: state => state.commonProperties.fjbassPublish, //福建经分发布按钮是否启用（1：启用 0：不启用）
        pageCache: state => state.HomeBody.pageCache,
        menuClassTypeId: state => state.HomeTree.menuClassTypeId,
        btnList: state => state.HomeTree.btnList,
        captureDialogVisible: state => state.PageDesign.captureDialogVisible,
        cockpitPubDialogVis: state => state.AnalyReportAttr.cockpitPubDialogVis,
        emailTaskDialogVis: state => state.ReportMgt.emailTaskDialogVis,
        emailTaskLogDialogVis: state => state.AnalyReportAttr.emailTaskLogDialogVis,
        versionList: state => state.HomeBody.versionList // 版本列表
      }),
      captureDialogVisible: {
        get() {
          return this.$store.state.PageDesign.captureDialogVisible;
        },
        set(val) {
          this.$store.state.PageDesign.captureDialogVisible = val;
        }
      },
    },
    watch: {
      //节点改变分页初始化值也改变
      catalogId() {
        //目录变化--监听
        this.resetSearchCondi();
        this.search();
      },
      tenantId() {
        //租户变化 -- 监听
        this.resetSearchCondi();
        this.search();
      },
      // classtypeId() {
      // console.log("classtypeId");
      //   this.resetSearchCondi();
      //   this.search();
      // },
      menuClassTypeId(val) {
        this.setTableData({total: 0, list: []});
        //头部菜单切换时候重新查询
        this.resetSearchCondi();
        if (val !== 'drive' ) {
          this.search();
        }
      },
      deleteDialog(val) {
        if (!val) return;
        const text = "确认要删除所选项吗？";
        this.open(text);
      }
    },
    methods: {
      inputChange() {
        let inputVal = this.saveForm.pageName;
        if (inputVal.length > 30) {
          let str = inputVal.slice(0, 30);
          this.saveForm.pageName = str;
          this.$message.warning("名称长度不能超过30字符!");
          return false;
        }
      },
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
      copy() {
        //复制
        var clipboard = new Clipboard("#copy_text");
        clipboard.on("success", e => {
          // 释放内存
          clipboard.destroy();
          this.$message.success("复制成功！");
        });
        clipboard.on("error", e => {
          // 不支持复制
          Message({
            message: "该浏览器不支持自动复制",
            type: "warning"
          });
          // 释放内存
          clipboard.destroy();
        });
      },
      addMyCollect(data) {
        //添加收藏
        var par = Object.assign({
          objId: data.pageId,
          userId: window.sessionStorage.getItem("user_id"),
          favoriteObj: this.menuClassTypeId
        });
        this.addCollect(par)
          .then(val => {
            if (val.status === 200 && val.data.respResult === "1") {
              this.$message.success("页面收藏成功");
              this.search();
            } else {
              this.$message.error("页面收藏失败");
            }
          })
          .catch(err => {
            // this.$message.error("页面收藏失败");
            console.error(err);
          });
      },
      delMyCollect(data) {
        //取消收藏
        var os = [];
        os.push(data.pageId);
        var par = Object.assign({
          objIds: os,
          userId: window.sessionStorage.getItem("user_id"),
          favoriteObj: this.menuClassTypeId
        });
        this.delCollect(par)
          .then(val => {
            if (val.status === 200 && val.data.respResult === "1") {
              this.$message.success("取消收藏成功");
              this.search();
            } else {
              this.$message.error("取消收藏失败");
            }
          })
          .catch(err => {
            // this.$message.error("取消收藏失败");
            console.error(err);
          });
      },
      saveAsSubmit(formName) {
        this.$refs[formName].validate(valid => {
          if (valid) {
            var reqObj = {pageInfo: {}};
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
            param.createUser = sessionStorage.getItem("user_id");
            reqObj.pageInfo = param;
            if (this.menuClassTypeId == "1005") {
              //大屏另存为
              // reqObj.pageInfo = param;
              this.saveAsAnalysisReport(param)
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
                  console.error(err);
                  // this.$message.error("页面另存失败");
                });
            } else {
              this.saveAsReport(reqObj)
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
                  console.error(err);
                  // this.$message.error("页面另存失败");
                });
            }
          } else {
            return false;
          }
        });
      },
      search(isNeedResetStart = false) {
        this.pageList = []
        if (isNeedResetStart) {
          //如果是点查询按钮，应该从第一页开始查
          this.pageQuery.start = 1;
        }
        // var uid = sessionStorage.getItem("user_id");
        var tid = sessionStorage.getItem("tenant_id");
        this.loading = true;
        let pageName = this.condiSettingsData[0].vModelValue;
        let status = this.condiSettingsData[1].vModelValue;
        let queryPushBeginTime = "";
        let queryPushEndTime = "";
        if (this.condiSettingsData[2].vModelValue) {
          queryPushBeginTime = typeof(this.condiSettingsData[2].vModelValue[0]) !== 'undefined' ?  this.condiSettingsData[2].vModelValue[0] + " 00:00:00" : this.condiSettingsData[2].vModelValue[0];
          queryPushEndTime = typeof(this.condiSettingsData[2].vModelValue[1]) !== 'undefined' ? this.condiSettingsData[2].vModelValue[1] + " 23:59:59" : this.condiSettingsData[2].vModelValue[1];
        }
        var param = {
          "mailPushTaskInfo":{
          "pageName": pageName,           //报表名
          "tenantId": tid,
          "taskType": "1",           //任务类型 1：定时邮件
          "isCancel": status,           //是否取消 1:取消 0：开放
          },
          "isNeedMailInfo": 0,     //查询是否需要关联邮件内容 0：不做关联
          "queryPushBeginTime": queryPushBeginTime, //推送时间范围检索
          "queryPushEndTime": queryPushEndTime,   //推送时间范围检索
          "startPage": this.pageQuery.start,          //起始页
          "pageNum": this.pageQuery.pageCount             //分页数量
        }
        this.queryEmailTask(param)
          .then(val => {
            if (val.status === 200 && val.data.respResult === "1") {
              var total = val.data.respData.totalCount;
              var list = val.data.respData.data;
              this.$store.commit("DataSetMgt/setTableData", {total, list});
            } else {
              this.$message.error("页面查询失败");
              // console.error(val);
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
        // else if (this.catalogLevel != 2) {
        //   this.$message.warning("请选择叶子目录再创建页面");
        //   return;
        // }
        var item = {};
        item.tenantId = tid;
        item.createUser =
          sessionStorage.getItem("user_id") == null
            ? "999999"
            : sessionStorage.getItem("user_id");
        item.catalogId = this.catalogId;
        item.operation = "design";
        item.classTypeId = this.menuClassTypeId;
        if (this.classtypeId == 1002) {
          item.layoutType = 1;
        } else if (this.classtypeId == 1005) {
          //大屏新增时打开模板列表
          this.upTemplateShow(true);
        }
        this.setPageCache(item);
        this.toDesign();
      },
      editTask(data) {
        if (data && data.pageId) {
          const {pageId, pageName, taskId, isCancel, taskType} = data
          const obj = {pageId, pageName, taskId, isCancel, taskType}  
          this.clickPageObj = obj;
          this.setEmailTaskDialogVis(true);
        } else {
          this.$message.error("当前报表没有邮件推送任务");
        }
      },
      suspendTask(row) {
        let param = {
          "mailPushTaskInfo":{
            "taskId": row["taskId"],
            "isCancel": row["isCancel"] === '1' ? '0' : '1'
          }
        }
        this.changeMailTaskStatus(param)
          .then(val => {
            let msg = row["isCancel"] === '0' ? '取消' : '开启';
            if (val.status === 200 && val.data.respResult === "1") {
              this.$message.success(msg + "成功")
              if (row["isCancel"] === "0") {
                row["nextPushTime"] = '无';
              } else {
                this.search();
              }
              row["isCancel"] = row["isCancel"] === "0" ? "1" : "0";
              // row["nextPushTime"] = row["isCancel"] === "0" ? "#" : "";

            } else {
              this.$message.error(msg + "失败")
            }
          })
          .catch(error => {
            this.$message.error((row["isCancel"] === '1' ? '取消' : '开启') + "失败")
          })
      },
      searchLog(data) {
        if (data && data.pageId) { 
          const {pageId, pageName, taskId, isCancel, taskType} = data;
          const obj = {pageId, pageName, taskId, isCancel, taskType};
          this.clickPageObj = obj;
          this.setEmailTaskLogDialogVis(true);
        } else {
          this.$message.info("当前报表没有邮件推送日志");
        }
       
      },
      editPage(data) {
        this.selectRow = data;
        this.form.pageName = data.pageName;
        this.form.pageDesc = data.pageDesc;
        if (data.status !== '0') {
          //发布和已提交都有url
          this.form.urlData =
            "/dataeleph-show/v1/preview/index?pageId=" + data.pageId;
        } else {
          this.form.urlData = "";
        }
        this.setPageCache(data);
        // 查询版本信息
        this.setVersionList([]) // 清空之前的查询列表
        this.versionLoading = true
        let versionParam = {
              objId: data.pageId,
              objType: data.classTypeId
            }
        this.qryVersionList(versionParam)
          .then(val => {
            if (val.status === 200 && val.data.respResult === "1") {
              if (!val.data.respData) {
                val.data['respData'] = []
              }
              this.$store.commit("HomeBody/setVersionList", val.data.respData);
            } else {
              // this.$message.error("页面查询失败");
            }
            this.versionLoading = false;
          })
          .catch(err => {
            // this.$message.error("页面查询异常");
            this.versionLoading = false;
          });
        this.dialogFormVisible = true;
      },
      generateTree(data, list) {
        var tree = [];
        for (var i = 0; i < list.length; i++) {
          var temp = list[i];
          if (temp.parentCatalogId == data.catalogId) {
            var obj = {};
            obj.value = temp.catalogId;
            obj.id = temp.catalogId;
            obj.label = temp.catalogName;
            obj.level = 2;
            obj.typeId = temp.classTypeId;
            obj.parentId = temp.parentCatalogId;
            tree.push(obj);
          }
        }
        return tree;
      },
      getCatalogData() {
        //获取目录最新数据
        var ctid = this.menuClassTypeId; //分类id
        var user_id = window.sessionStorage.getItem("user_id");
        var param = {
          classTypeId: ctid,
          createUser: user_id
        };
        this.queryTreeData(param)
          .then(val => {
            if (val.status == 200 && val.data.respResult == 1) {
              var _this = this;
              var list = val.data.respData;
              if (list.length > 0) {
                // var result = [];
                var first = [],
                  second = [];
                list.forEach(function (val) {
                  if (val.parentCatalogId == "myfold") {
                    if (_this.myFolder != "0") {
                      //0：隐藏 1：显示
                      first.push(val);
                    }
                  } else {
                    second.push(val);
                  }
                });
                first.forEach(val => {
                  var temp = {};
                  temp.value = val.catalogId;
                  temp.id = val.catalogId;
                  temp.label = val.catalogName;
                  temp.level = 1;
                  temp.typeId = val.classTypeId;
                  temp.parentId = val.parentCatalogId;
                  let children = this.generateTree(val, second);
                  if (children.length > 0) {
                    temp.children = children;
                  } else {
                    temp.children = [];
                  }

                  // result.push(temp);
                });
              }
            } else {
              this.$message.error("目录查询失败");
            }

            //删除数组中所有内容
            this.saveToTreeData.splice(0, this.saveToTreeData.length);
            var temp = "";
            this.treeData.forEach(function (val) {
              //forEach不能使用this否则会包指向不对
              if (val.value == "myfold") {
                temp = val;
              }
            });

            this.saveToTreeData.push(temp);

          })
          .catch(err => {
            console.error(err);
            // this.$message.error("文件夹查询异常");
          });
      },
      saveTo(data) {
        this.getCatalogData(); //获取最新数据

        this.selectRow = data;
        this.saveForm.pageName = data.pageName;
        this.saveForm.pageId = data.pageId;
        this.saveForm.catalogId = [];
        this.dialogSaveAs = true;
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
            this.$message.warning("不能删除已发布的页面");
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
              this.pageList = []
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
        if (data.status == "1") {
          this.$message.warning("不能删除已发布的页面");
          return;
        }
        this.selectRow = data;
        this.deleteType = "single";
        this.deleteDialog = true;
      },
      open(text) {
        this.$confirm(text, "提示", {
          closeOnClickModal: false,
          confirmButtonText: "确定",
          cancelButtonText: "取消"
          // type: 'warning'
        })
          .then(() => {
            // this.$message({
            //   type: "success",
            //   message: "操作成功!"
            // });
            this.delTableData();
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消"
            });
            this.deleteDialog = false;
          });
      },
      toDesign() {
        // const getTimestamp = new Date().getTime();
        // this.$router.push({
        //   path: "/design",
        //   name: "design",
        //   query: { timestamp: getTimestamp }
        // });
        let pageInfo = JSON.stringify(this.pageCache);
        sessionStorage.setItem("pageCache", pageInfo);
        let routeName = "";
        switch (+this.menuClassTypeId) {
          case 1002: //即席查询--1002
            routeName = "design";
            break;
          case 1003: //报表定制--1003
            routeName = "report";
            break;
          case 1005: //数据大屏--1005
            routeName = "bigScreenDesign";
            break;
        }
        if(!!window.ActiveXObject || "ActiveXObject" in window) {
          this.storeVuexStore();
          let routeData = this.$router.resolve({name: routeName}); //query: { timestamp: getTimestamp }
          window.open(routeData.href, "_blank");
        } else {
          this.storeVuexStore().then(val => {
            let routeData = this.$router.resolve({name: routeName}); //query: { timestamp: getTimestamp }
            window.open(routeData.href, "_blank");
          })
        }
      },
      iconMenuClick(name, rowData) {
        switch (name) {
          case "btnPublishTemplate":
            this.showCaptureDialog(rowData);
            break;
          case "others":
            break;
        }
      },
      showCaptureDialog(data) {
        data.operation = "templateview";
        this.setPageCache(data);
        sessionStorage.setItem("pageCache", JSON.stringify(this.pageCache));
        /*let viewName = "";
        if (this.menuClassTypeId == "1002") {
          viewName = "preview";
        } else if (this.menuClassTypeId == "1003") {
          viewName = "reportView";
          //报表工具
        } else if (this.menuClassTypeId == "1005") {
          //数据大屏
          viewName = "pageView";
        }*/
        this.captureDialogVisible = true;
      },
      toPrew111(){ //打开词云图
          let routeData = this.$router.resolve({name: "reportView11"}); //query: { timestamp: getTimestamp }
          window.open(routeData.href, "_blank");
      },
      toPrew(data) {
        data.operation = "preview";
        if (data.verNo) {
          data = Object.assign(this.pageCache, {verNo: data.verNo, operation: data.operation});
        }
        this.setPageCache(data);
        sessionStorage.setItem("pageCache", JSON.stringify(this.pageCache));
        let routeData = {};
        if (this.menuClassTypeId == "1002") {
          //即席查询
          // this.$router.push({
          //   path: "/preview",
          //   name: "preview"
          // });
          routeData = this.$router.resolve({name: "preview"}); //query: { timestamp: getTimestamp }
        } else if (this.menuClassTypeId == "1003") {
          //报表工具
          routeData = this.$router.resolve({name: "reportView"}); //query: { timestamp: getTimestamp }
        } else if (this.menuClassTypeId == "1005") {
          //数据大屏
          routeData = this.$router.resolve({name: "pageView"});
        }
        if(!!window.ActiveXObject || "ActiveXObject" in window) {
          this.storeVuexStore();
          window.open(routeData.href, "_blank");
        } else {
          this.storeVuexStore().then(val => {
            window.open(routeData.href, "_blank");
          })
        }
      },
      //跳转血缘窗口
      toJump() {
        window.open("http://10.1.12.48:17181/edc-dataasset-web/dataasset/entityRelView.do?tab_id=T10000095758_43bee1608b474f01b3df49a80fa473b0&change_flag=old&p_priv_id=entityRelViewT10000095758_43bee1608b474f01b3df49a80fa473b0&p_priv_name=%E8%A1%80%E7%BC%98%E5%88%86%E6%9E%90");
        //get请求

      },
      exportZip() {
        if (this.pageList.length == 0) {
          this.$message.warning("请选择要导出的页面");
          return;
        }
        var list = this.pageList;
        var flag = false;
        for (var i = 0; i < list.length; i++) {
          if (list[i].status == "0") {
            flag = true;
            break;
          }
        }
        if (flag) {
          this.$message.error("不能导出未发布的页面");
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
        if (response.respResult == 1) {
          // 成功
          this.$message.success(response.respData);
        } else if (response.respResult == 0) {
          this.$message.error(response.respErrorDesc);
        }
      },
      importError(err, file, fileList) {
        this.$message.error("导入文件出错");
      },
      moveTableData() {
        this.moveForm.catalogId = [];
        if (this.pageList.length == 0) {
          this.$message.warning("请选择要移动的页面");
          return;
        } else {
          this.getCatalogData(); //获取最新数据,和另存为的目录共用
          this.dialogMove = true;
        }
      },
      showCockpitDialog(data) {
        this.setPageCache(data);
        sessionStorage.setItem("pageCache", JSON.stringify(this.pageCache));
        this.setCockpitPubDialogVis(true);
      },
      moveSubmit(formName) {
        this.$refs[formName].validate(valid => {
          if (valid) {
            var param = {};
            var catalogId = this.moveForm.catalogId[
            this.moveForm.catalogId.length - 1
              ];
            param.catalogId = catalogId;

            var idList = [];
            this.pageList.forEach(function (val) {
              idList.push(val.pageId);
            });
            param.pageIdList = idList;

            this.movePageInfo(param)
              .then(val => {
                if (val.status === 200 && val.data.respResult === "1") {
                  this.$message.success("页面移动成功");
                  this.dialogMove = false;
                  this.pageList = []
                  this.search();
                } else {
                  this.$message.error("页面移动失败");
                }
              })
              .catch(err => {
                // this.$message.error("页面移动异常");
              });
          } else {
            return false;
          }
        });
      },
      ...mapMutations({
        setTableData: "HomeBody/setTableData",
        setVersionList: "HomeBody/setVersionList",
        setTreeList: "HomeTree/setTreeList",
        upTemplateShow: "PageDesign/upTemplateShow",
        setCockpitPubDialogVis: "AnalyReportAttr/setCockpitPubDialogVis",
        setEmailTaskDialogVis: "ReportMgt/setEmailTaskDialogVis",
        setEmailTaskLogDialogVis: "AnalyReportAttr/setEmailTaskLogDialogVis",
      }),
      ...mapActions({
        changeMailTaskStatus: "HomeBody/changeMailTaskStatus",
        queryTableData: "HomeBody/queryTableData",
        queryEmailTask: "HomeBody/queryEmailTask",
        saveAsAnalysisReport: "HomeBody/saveAsAnalysisReport",
        saveAsReport: "HomeBody/saveAsReport",
        updatePageInfo: "HomeBody/updatePageInfo",
        deletePageInfo: "HomeBody/deletePageInfo",
        setPageCache: "HomeBody/setPageCache",
        pubPageInfo: "HomeBody/pubPageInfo",
        exportPageZip: "HomeBody/exportPageZip",
        getExportPage: "HomeBody/getExportPage",
        movePageInfo: "HomeBody/movePageInfo",
        addOptlog: "compt/addOptlog",
        addCollect: "compt/addCollect",
        delCollect: "compt/delCollect",
        queryTreeData: "HomeTree/queryTreeData", //获取树最新数据
        storeVuexStore: "storeVuexStore"
      })
    },
    mounted() {
      this.setTableData({total: 0, list: []});
      this.search();
    },
    activated() {
      // this.search();
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

      &:last-child {
        margin-right: 0;
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
// .el-table .cell.el-tooltip{
//   height: 46px;
// }
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

  .pageName {
    /deep/ .el-form-item__error {
      margin-top: -7px;
    }
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
