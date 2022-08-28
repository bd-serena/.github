<template>
  <div class="main-content">
    <div class="main-content-form">
      <SimpleCondi :data="condiSettingsData" @condiSubmit="search(true)"></SimpleCondi>
    </div>
    <div
      class="main-content-tool"
      :style="computedStyle()"
    >
      <div class="tool-btn" @click="addTableData">
        <span class="icon-A10072_add tool-btn-icon"></span>
        <span class="tool-btn-text">新增</span>
      </div>
      <div class="tool-btn" @click="goDelete">
        <span class="icon-A10065_delete tool-btn-icon"></span>
        <span class="tool-btn-text">删除</span>
      </div>
    </div>
    <div
      class="main-content-table"
      :style="computedStyle('table')"
    >
      <GeminiScrollbar class="my-scroll-bar">
        <el-table
          height="100%"
          v-loading="loading"
          border
          :data="tableData"
          style="width: 100%"
          @select="selectTable"
          @select-all="selectTable"
          size="mini"
        >
          <el-table-column type="selection" width="55" :selectable="unSelectDemo"></el-table-column>
          <el-table-column label="维度名称" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <div class="name-text name-txt1">{{ scope.row.dimName }}</div>
            </template>
          </el-table-column>
          <el-table-column label="维度类型" :show-overflow-tooltip="true" prop>
            <template slot-scope="scope">
              <span v-if="scope.row.dimType=='2'">地域维</span>
              <span v-if="scope.row.dimType=='3'">其他</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" :show-overflow-tooltip="true" prop>
            <template slot-scope="scope">
              <span>{{ scope.row.judgeStateDesc || "生效" }}</span>
            </template>
          </el-table-column>
          <el-table-column label="创建者" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <span>{{ scope.row.userName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="更新时间" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <span>{{ scope.row.updateTime }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="235">
            <template slot-scope="scope">
              <el-tooltip class="item" effect="dark" content="预览" placement="top-start">
                <span class="icon-A10181_browseCount table-icon" @click="previewDimData(scope.row)"></span>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="编辑" placement="top-start">
                <span class="icon-A10189_edit table-icon" @click="editDim(scope.row)"></span>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" v-if="scope.row.isDemo === '0'" content="删除" placement="top-start">
                <span class="icon-A10065_delete table-icon" @click="deleteRow(scope.row)"></span>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" v-if="scope.row.isDemo === '0'" content="任务列表" placement="top-start">
                <span class="icon-A10361_analysis table-icon" @click="showDimTaskLogs(scope.row)"></span>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </GeminiScrollbar>
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

    <!-- 数据集合另存为弹出框 -->
    <el-dialog width="420px" :visible.sync="dialogSaveAs">
      <div slot="title" class="dialog-title">
        <span>另存为</span>
        <div class="title-line"></div>
      </div>
      <el-form ref="saveForm" :rules="rules" :model="saveForm">
        <div v-if="1==2">
          <el-input size="mini" v-model="saveForm.afId"></el-input>
        </div>
        <el-form-item
          id="pagename-input"
          prop="pageName"
          label="名称"
          :label-width="'51px'"
          style="margin-bottom:14px;margin-top:-6px;"
        >
          <el-input size="mini" v-model="saveForm.pageName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          style="margin-bottom: 0;"
          size="mini"
          prop="catalogId"
          class="win-item"
          label="目录"
          :label-width="'51px'"
        >
          <el-cascader
            :change-on-select="true"
            expand-trigger="hover"
            :show-all-levels="false"
            style="width:100%"
            :options="cataTreeData"
            v-model="saveForm.catalogId"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogSaveAs=false" size="mini">取 消</el-button>
        <el-button type="primary" @click="saveAsSubmit('saveForm')" size="mini">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 维度预览 -->
    <el-dialog
      title="预览"
      style="height:100%"
      :visible.sync="dimDialogVisible"
      :close-on-click-modal="false"
      size="mini"
      width="400px"
      id="auto_pre_close"
      :destroy-on-close="true"
    >
      <div class="prev-tree-wrap" style="height:310px;overflow:hidden" v-loading="prevDimLoading">
        <div style="height: 22px;margin-bottom:10px;">最大显示100条 数据</div>
        <div style="width:100%;height:100%;" id="dimPreivewWrap">
          <el-scrollbar style="height:278px;" :native="false" :noresize="false" tag="section">
            <el-tree
              :props="props"
              :load="loadNode"
              lazy
              :default-expanded-keys="treeDefaultExpand"
              node-key="id"
              v-if="dimTreeShow"
            ></el-tree>
          </el-scrollbar>
        </div>
      </div>
    </el-dialog>
    <!-- 维度缓存任务日志列表弹框 -->
    <el-dialog
      class="dimTask-dialog"
      :title="selectRow.dimName"
      style="height:100%;width:800px;margin:0 auto;"
      append-to-body
      :visible.sync="dimTaskLogsDialogVis"
      :close-on-click-modal="false"
      size="mini"
      width="80%"
    >
      <div class="main-content-table">
        <el-table
          v-loading="loading"
          border
          size="mini"
          style="width:100%"
          :data="dimTaskLogList"
          :key="Math.random()"
        >
          <el-table-column prop="createTime" label="创建时间" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="updateTime" label="完成时间" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="excuteUserName" label="执行人" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column label="执行状态">
            <template slot-scope="scope">
              <el-tooltip class="item" content="成功" placement="top-start">
                <el-button v-if="scope.row.status=='成功'" size="mini" type="success" round>
                  <i class="icon-A10066_check"></i>
                </el-button>
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                :content="scope.row.errorMsg"
                placement="top-start"
              >
                <el-button v-if="scope.row.status=='失败'" size="mini" type="danger" round>
                  <i class="icon-A10268_close"></i>
                </el-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="同步" placement="top-start">
                <el-button v-if="scope.row.status=='同步'" size="mini" type="primary" round>
                  <i class="icon-A10280-refresh"></i>
                </el-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="等待" placement="top-start">
                <el-button v-if="scope.row.status=='等待'" size="mini" type="primary" round>
                  <i class="icon-A10334_loading"></i>
                </el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dimTaskRefresh" type="primary" size="mini">刷新</el-button>
        <el-button @click="dimTaskSynchronize" type="primary" size="mini">同步</el-button>
        <el-button @click="dimTaskLogsDialogVis = false" size="mini">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from "vuex";
import { objDeepCopy, objCloneByReplaceKey } from "../../utils/comonFunc";
import { service } from 'ngbd-utils'
import condiMixins from "../../utils/condiMixins.js"

export default {
  mixins: [condiMixins],
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
      cataTreeData: Object.freeze([]),
      pageQuery: {
        start: 1,
        pageCount: 10
      },
      pageList: [],
      selectRow: "",
      deleteType: "",
      condiSettingsData:[
        {
          name:'名称',
          formSymbol: 'pageName',
          type: 'input',
          vModelValue: '',
          selectOptions: []
        },
        {
          name:'维度类型',
          formSymbol: 'dimType',
          type: 'select',
          vModelValue: '',
          selectOptions: [
            {
              value: '',
              label: '全部'
            },
            {
              value: '2',
              label: '地域维'
            },
            {
              value: '3',
              label: '其他'
            }
          ]
        },
        {
          name:'更新时间',
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
      saveForm: {
        pageName: "",
        catalogId: [],
        afId: ""
      },
      deleteDialog: false,
      dialogSaveAs: false,
      formLabelWidth: "75px",
      rules: {
        pageName: [
          { required: true, message: "请输入名称", trigger: "blur" },
          { min: 1, max: 20, message: "长度在 1 到 20 个字符", trigger: "blur" }
        ],
        catalogId: [
          { required: true, validator: catalogCheck, trigger: "change" }
        ]
      },
      sourceType: [],
      sourceTypeVal: [],
      activeTabName: "first", //新增数据源弹窗tab
      addEntityVis: false, //新增实体弹窗
      addDBVis: false, //新增数据库类型弹窗
      dbList: Object.freeze([]), //数据源库类型 调接口查
      assetDataSrcList: [], // 资产数据源列表
      multipleSelection: [], //资产数据源选中列表
      dimDialogVisible: false,
      props: {
        label: "label",
        children: "zones",
        isLeaf: "leaf"
      },
      curPrevDim: null, //当前预览的维度
      treeDefaultExpand: [-1], //默认第一级展开
      treeIdCounter: 0,
      dimTaskLogsDialogVis: false, //维度任务日志列表弹框
      dimTaskLogList: [], //维度缓存任务日志列表（只展示前五条）
      prevDimLoading: false, //维度数据预览加载遮罩
      dimTreeShow: false //等维度信息查回来再加载树
    };
  },
  computed: {
    ...mapState({
      tableData: state => state.DataSetMgt.tableData.list, //从homebody.js出获取数据
      renderEngine: state => state.renderEngine,
      total: state => state.DataSetMgt.tableData.total,
      tenantId: state => state.HomeBody.tenantId,
      catalogId: state => state.DataSetMgt.catalogId,
      classtypeId: state => state.DataSetMgt.classtypeId,
      defaultSystemId: state => state.defaultSystemId,
      myFolder: state => state.commonProperties.myFolder, //我的文件夹权限
      dgwMsUrl: state => state.dgwMsUrl,
      dataSetCache: state => state.DataSetMgt.dataSetCache,
      edcPubMsUrl: state => state.edcPubMsUrl
    })
  },
  watch: {
    //节点改变分页初始化值也改变
    catalogId() {
      //目录变化--监听
      this.resetSearchCondi()
      this.search();
    },
    tenantId() {
      //租户变化 -- 监听
      this.search();
    },
    classtypeId() {
      //目录模块切换时候重新在查询
      this.resetSearchCondi()
      this.search();
    },
    deleteDialog(val) {
      if (!val) return;
      const text = "确认要删除所选项吗？";
      this.open(text);
    }
  },
  methods: {
    queryCatalog() {
      var user_id = window.sessionStorage.getItem("user_id");
      var param = {
        classTypeId: "1004",
        createUser: user_id
      };
      this.queryTreeData(param)
        .then(val => {
          if (val.status == 200 && val.data.respResult == 1) {
            var list = val.data.respData;
            if (list.length > 0) {
              var result = [];
              var first = [],
                second = [];
              list.forEach(function(val) {
                if (val.parentCatalogId == "myfold") {
                  first.push(val);
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
                } else if (second.length > 0) {
                  temp.children = []; //防止选中后面没有数据-会显示旧数据子集
                }
                result.push(temp);
              });
            }
            // this.cataTreeData = Object.freeze(result);
            this.cataTreeData = [
              {
                id: "myfold",
                label: "我的文件夹",
                level: 0,
                value: "myfold",
                children: result
              }
            ];
          } else {
            this.$message.error("目录查询失败");
          }
        })
        .catch(err => {
          console.error(err);
          // this.$message.error("文件夹查询异常");
        });
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
    saveAsSubmit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          //获取目录id
          var catalogId = this.saveForm.catalogId[
            this.saveForm.catalogId.length - 1
          ];
          var afId = this.saveForm.afId;
          this.saveAsDataSetAct(catalogId, afId);
          this.dialogSaveAs = false;
        }
      });
    },
    //另存为----数据集合(目录id)
    saveAsDataSetAct(_catalogId, _afId) {
      var param = {};
      var datasetName = this.saveForm.pageName; //数据集名称
      param.catalogId = _catalogId; //目录id
      param.datasetName = datasetName; //数据集名称
      param.datasetId = _afId; //数据集id
      param.createUser = sessionStorage.getItem("user_id"); //创建者工号

      const _this = this;
      service({
        maskOff: true,
        url: this.renderEngine + "/pubDataSetController/saveAsDataSet", //  此时只要传递一个af_id即可
        method: "post",
        data: param,
        headers: {
            "X-UserId": window.sessionStorage.getItem("user_id"),
            "X-TenantId": sessionStorage.getItem("tenant_id"),
            "X-SystemId": this.defaultSystemId
        }
      })
        .then(function(response) {
          if (response.data.respResult == 1) {
            _this.$message.success("维度另存成功");
            //刷新数据集列表
            _this.search();
          } else {
            _this.$message.error(response.data.respErrorDesc);
          }
        })
        .catch(function(error) {
          console.error(error);
          // _this.$message.success("数据集另存失败");
        });
    },
    search(isNeedResetStart = false) {
      if (isNeedResetStart) {
        //如果是点查询按钮，应该从第一页开始查
        this.pageQuery.start = 1;
      }
      this.loading = true;
      let key = this.searchForm.pageName.trim(); //维度名称
      let dimtype = this.searchForm.dimType; //维度类型
      if (dimtype == undefined) {
        dimtype = "";
      }

      if (this.searchForm.updateTime == null) {
        this.searchForm.updateTime = "";
      }
      //开始时间
      let updateBeginTime = (this.searchForm.updateTime[0] || "").replace(
        /\s*/g,
        ""
      );
      console.info(updateBeginTime);
      //结束时间
      let updateEndTime = (this.searchForm.updateTime[1] || "").replace(
        /\s*/g,
        ""
      );
      let t_id = sessionStorage.getItem("tenant_id");
      let user_id = sessionStorage.getItem("user_id");
      // 案例展示
      let isNeedDemo = this.searchForm.isShowDemo ? '1' : '0'
      let commonParam = { updateBeginTime, updateEndTime, isNeedDemo }
      //维度请求参数
      let dataSetParam;
      dataSetParam = Object.assign(commonParam, {
        tenantId: t_id,
        dimName: key, //维度名称
        dimType: dimtype, //维度类型
        createUser: user_id, //创建者
        start: this.pageQuery.start,
        pageCount: this.pageQuery.pageCount
      });

      this.queryDimList(dataSetParam)
        .then(val => {
          if (val.status === 200 && val.data.respResult === "1") {
            var total = val.data.dataTotalCount;
            var list = val.data.respData;
            //设置数据
            this.$store.commit("DataSetMgt/setTableData", { total, list });
          } else {
            this.$message.error("维度查询失败");
          }
          this.loading = false;
        })
        .catch(err => {
          // this.$message.error("维度查询异常");
          this.loading = false;
        });
    },
    addTableData() {
      //跳转到新增数据集界面
      if (this.catalogId === "") {
        this.$message.warning("请选择目录再创建维度");
        return;
      }
      // if (this.catalogId === "workfold") {
      //   this.$message.warning("不可在工作组空间下创建数据集");
      //   return;
      // }
      var item = {};

      //目录id
      item.catalogId = this.catalogId;
      item.af_id = "";
      item.operation = "dimension";
      this.setDataSetCache(item); //将数据缓存
      this.toDimensionDesign(); //跳转到添加数据集合界面
    },
    saveAsDataSet(data) {
      this.queryCatalog(); //重新在查询一下目录列表        -----   这个方法是异步的
      this.saveForm.pageName = data.af_name;
      this.saveForm.afId = data.af_id; //数据集id
      this.dialogSaveAs = true;
      this.saveForm.catalogId = []
      this.$nextTick(() => {
        this.$refs.saveForm.clearValidate()
      })
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
      //删除提示框
      if (this.pageList.length == 0) {
        this.$message.warning("请选择要删除的维度");
        return;
      } else {
        this.deleteDialog = true;
        this.deleteType = "multiple";
      }
    },
    delTableData() {
      //删除确认操作
      let tcList = [];
      let _this = this;
      if (this.deleteType == "multiple") {
        for (let index = 0; index < this.pageList.length; index++) {
          const element = this.pageList[index];
          tcList.push(element.dimId);
        }
      } else if (this.deleteType == "single") {
        tcList.push(this.selectRow.dimId);
      }
      var dimReq = {};
      dimReq.dimIdList = tcList;
      //批量删除
      this.getDataSrcReqApi({
        param: dimReq,
        type: "deleteDimList"
      })
        .then(function(response) {
          if (response.data.respResult === "1") {
            _this.$message.success("维度删除成功");
            _this.pageList = [];
            _this.search();
          } else {
            _this.$message.error(
              response.data.respErrorDesc || response.data.respData
            );
          }
        })
        .catch(function(error) {
          console.error(error);
          // _this.$message.error("维度删除失败");
        })
        .finally(() => {
          _this.deleteDialog = false;
        });
    },
    deleteRow(data) {
      this.selectRow = data;
      this.deleteType = "single";
      this.deleteDialog = true;
    },
    showDimTaskLogs(data) {
      this.dimTaskLogsDialogVis = true;
      this.selectRow = data;
      this.dimTaskLogList = [];
      this.queryDimTaskLogList(data.dimId);
    },
    open(text) {
      this.$confirm(text, "提示", {
        closeOnClickModal: false,
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(() => {
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
    ...mapMutations({
      setTableData: "DataSetMgt/setTableData"
    }),
    ...mapActions({
      queryDimList: "DataSetMgt/queryDimList", //维度列表查询
      queryTreeData: "HomeTree/queryTreeData",
      getDataSrcReqApi: "DataSetMgt/getDataSrcReqApi",
      setDataSetCache: "DataSetMgt/setDataSetCache",
      querySingleDimInfo: "AnalyReportAttr/querySingleDimInfo",
      storeVuexStore: "storeVuexStore",
      getDimInfoById: "DataSetDesign/getDimInfoById"
    }),
    toDimensionDesign() {
      //路由跳转新增数据集页面
      let pageInfo = JSON.stringify(this.dataSetCache);
      sessionStorage.setItem("dataSetCache", pageInfo);
      if(!!window.ActiveXObject || "ActiveXObject" in window) {
        this.storeVuexStore();
        let routeData = this.$router.resolve({ name: "DimensionDesign" });
        window.open(routeData.href, "_blank");
			} else {
        this.storeVuexStore().then(val => {
          let routeData = this.$router.resolve({ name: "DimensionDesign" });
          window.open(routeData.href, "_blank");
        })
      }
    },
    editDim(rowData) {
      let item = {
        ...rowData,
        ...{
          operation: "dimension"
        }
      };
      this.setDataSetCache(item); //将数据缓存
      this.toDimensionDesign();
    },
    previewDimData(dimInfo) {
      this.dimTreeShow = false;
      this.curPrevDim = objDeepCopy(dimInfo);
      this.dimDialogVisible = true;
      this.queryDimInfo(dimInfo.dimId);
      // setTimeout(() => {
      //   // 加载水印
      //   this.$Watermark.set("dimPreivewWrap", 0, 0, 0, 0, true);
      // }, 1000);
    },
    loadNode(node, resolve) {
      if (node.level === 0) {
        setTimeout(() => {
          // 加载水印
          this.$Watermark.set("dimPreivewWrap", 0, 0, 0, 0, true);
        }, 1000);
        return resolve([
          { label: this.curPrevDim.dimName, isLeaf: false, id: -1 }
        ]);
      } else {
        if ((this.curPrevDim.dimLevelList || []).length > 0) {
          this.queryDimData(node, resolve);
        } else {
          return resolve([]);
        }
      }
    },
    queryDimData(node, resolve) {
      let dimId = this.curPrevDim.dimId || "";
      let dimLevelArr = this.curPrevDim.dimLevelList || [];
      let dimLevelId = dimLevelArr[node.level - 1].dimLevelId || "";
      if (!dimId || !dimLevelId || dimLevelArr.length == 0) {
        resolve([]);
        return;
      }
      this.querySingleDimInfo({
        dim_id: dimId,
        dim_level_id: dimLevelId,
        is_all_data: "0",
        parent_val: node.data && node.data.dim_value ? node.data.dim_value : ""
      })
        .then(response => {
          if (response.data.respResult == 1) {
            // 最多展示100条
            let data = (response.data.respData || []).slice(0, 100);
            data = objCloneByReplaceKey(data, {
              dimValue: "dim_value",
              dimValueDesc: "label"
            });
            if (data.length == 1 && data[0].children) {
              data = data[0].children.slice(0, 100);
            }
            let isLeaf = node.level === dimLevelArr.length ? true : false;
            // let treeDefaultExpand = [];
            data.forEach((item, index) => {
              data[index]["leaf"] = isLeaf;
              data[index]["id"] = this.treeIdCounter++;
              // if (node.level === 0) {
              //   treeDefaultExpand.push(data[index]["id"]);
              // }
            });
            // if (node.level === 0) {
            //   if (isLeaf) {
            //     //第一层如果是叶子节点不用展开，如果不是，则要默认展开
            //     this.$set(this, "treeDefaultExpand", []);
            //   } else {
            //     this.$set(this, "treeDefaultExpand", treeDefaultExpand);
            //   }
            // }
            resolve(data);
          } else {
            this.$message.error(
              response.data.respErrorDesc || "查询维层数据失败"
            );
            resolve([]);
          }
        })
        .catch(error => {
          console.error(error);
          // this.$message.error("查询维层数据失败");
          resolve([]);
        });
    },
    queryDimTaskLogList(val) {
      //获取维度任务缓存日志
      let param = {
        dimId: val,
        startPage: 1,
        pageSize: 5 //默认展示前五条数据
      };
      let _this = this;
      service({
        maskOff: true,
        url: this.edcPubMsUrl + "/dimTask/getDimTaskLogList",
        method: "post",
        data: param,
        headers: {
          "X-UserId": sessionStorage.getItem("user_id"),
          "X-SystemId": _this.defaultSystemId || "1016",
          "X-TenantId": sessionStorage.getItem("tenant_id")
        }
      })
        .then(function(response) {
          if (response.data.respResult == 1) {
            _this.dimTaskLogList = response.data.respData;
          } else {
            _this.$message.error(response.data.respErrorDesc);
            _this.dimTaskLogList = [];
          }
        })
        .catch(function(error) {
          console.error(error);
          // _this.$message.error("维度任务日志列表获取失败");
          _this.dimTaskLogList = [];
        });
    },
    dimTaskRefresh() {
      //刷新
      let dimId = this.selectRow.dimId;
      this.queryDimTaskLogList(dimId);
    },
    dimTaskSynchronize() {
      //同步
      let dimId = this.selectRow.dimId;
      let _this = this;
      service({
        maskOff: true,
        url: this.edcPubMsUrl + "/dimTask/excuteDimTask",
        method: "post",
        data: {
          dimId: dimId
        },
        headers: {
          "X-UserId": sessionStorage.getItem("user_id"),
          "X-SystemId": _this.defaultSystemId || "1016",
          "X-TenantId": sessionStorage.getItem("tenant_id")
        }
      })
        .then(function(response) {
          if (response.data.respResult == 1) {
            _this.queryDimTaskLogList(dimId);
          } else {
            _this.$message.error(response.data.respErrorDesc);
          }
        })
        .catch(function(error) {
          console.error(error);
          // _this.$message.error("维度任务执行失败");
        });
    },
    queryDimInfo(dimId) {
      this.prevDimLoading = true;
      this.getDimInfoById({
        dimId: dimId
      })
        .then(response => {
          if (
            response.data &&
            response.data.respResult === "1" &&
            response.data.respData
          ) {
            this.curPrevDim = objDeepCopy(response.data.respData);
          } else {
            // console.error(response.data.respErrorDesc);
            this.$message.error("获取维度详情失败");
          }
        })
        .catch(error => {
          console.error(error);
          // this.$message.error("获取维度详情失败");
        })
        .finally(() => {
          this.prevDimLoading = false;
          this.dimTreeShow = true;
        });
    }
  },
  mounted() {
    this.setTableData({ total: 0, list: [] });
    this.search();
  },
  activated() {
    this.setTableData({ total: 0, list: [] });
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
  /deep/.main-content-table th {
    background-color: #f5f7fa;
    border-bottom: 2px solid #409eff;
    border-right: none;
    color: #303133;
    text-align: center;
  }
  /deep/.main-content-table td {
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
  /deep/.gm-scrollbar .thumb {
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
  right: 20px;
  top: 75px;
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
// /deep/.el-dialog__body {
//   padding-right: 40px;
//   padding-top: 13px;
//   padding-bottom: 10px;
// }
/deep/.el-form-item {
  margin-bottom: 18px;
}

.win-item {
  margin-bottom: 0;
}

@media screen and (max-width: 1460px) {
  .el-form--inline {
    .el-form-item {
      margin-right: 20px;
    }
  }
  .el-date-editor.el-range-editor.el-input__inner {
    width: 317px;
  }
}
#pagename-input {
  /deep/.el-form-item__error {
    margin-top: -7px;
  }
}
/deep/.el-dialog {
  /deep/.el-scrollbar__wrap {
    overflow-x: hidden;
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

<style lang="css">
.el-tooltip__popper {
  max-width: 50%;
}
</style>
