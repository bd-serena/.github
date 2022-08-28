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
    </div>
    <div
      class="main-content-table no-pagination"
      :style="computedStyle('table')"
    >
      <GeminiScrollbar class="my-scroll-bar">
        <el-table
          height="100%"
          v-loading="loading"
          border
          :data="tableData"
          row-key="dsId"
          style="width: 100%"
          @select="selectTable"
          @select-all="selectTable"
          size="mini"
          class="sourceTable"
        >
          <el-table-column label="数据源名称" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <div class="name-text name-txt1">{{ scope.row.dsName }}</div>
            </template>
          </el-table-column>
          <el-table-column label="数据源类型" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <span
                v-if="scope.row.parentResourceTypeId !='localdb'"
              >{{ scope.row.parentResourceTypeName }}--</span>
              <span>{{ scope.row.resourceTypeId }}</span>
            </template>

          </el-table-column>
          <el-table-column label="创建者" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <span v-if="scope.row.parentResourceTypeId=='database'">{{ scope.row.optUserName }}</span>
              <span
                v-if="scope.row.parentResourceTypeId=='dataasset' || scope.row.parentResourceTypeId=='localdb' "
              >{{ scope.row.optUser }}</span>
            </template>
          </el-table-column>
          <el-table-column label="更新时间" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <span>{{ scope.row.optTime }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="235">
            <template slot-scope="scope">
              <el-tooltip
                class="item"
                effect="dark"
                content="预览"
                placement="top-start"
                v-if="scope.row.parentResourceTypeId ==='localdb' && scope.row.dsId !='localdb'"
              >
                <span
                  class="icon-A10181_browseCount table-icon"
                  @click="previewBaseEntity(scope.row)"
                ></span>
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                content="追加"
                placement="top-start"
                v-if="scope.row.parentResourceTypeId ==='localdb' && scope.row.dsId !='localdb'"
              >
                <span class="icon-A10817_add table-icon" @click="addTo(scope.row)"></span>
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                content="编辑"
                placement="top-start"
                v-if="scope.row.parentResourceTypeId!='dataasset' && scope.row.dsId!='localdb' && scope.row.parentResourceTypeId !='localdb'"
              >
                <span class="icon-A10189_edit table-icon" @click="editDataSrc(scope.row)"></span>
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                content="连接测试"
                placement="top-start"
                v-if="scope.row.parentResourceTypeId!='dataasset'  && scope.row.dsId!='localdb' && scope.row.parentResourceTypeId !='localdb'"
              >
                <span
                  class="icon-A10655_connection table-icon"
                  @click="rowTestConnection(scope.row)"
                ></span>
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                content="删除"
                placement="top-start"
                v-if="scope.row.dsId!='localdb' && scope.row.dsId!='demodb'"
              >
                <span class="icon-A10065_delete table-icon" @click="deleteRow(scope.$index,scope.row,tableData)"></span>
              </el-tooltip>
              <el-tooltip
                v-if="scope.row.isDemo === '0'"
                class="item"
                effect="dark"
                content="引用详情"
                placement="top-start"
              >
                <span
                  class="icon-A10096_detail table-icon"
                  @click="viewRef(scope.row)"
                  v-if="scope.row.dsId != 'localdb'"
                />
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </GeminiScrollbar>
    </div>

        <!-- 数据集引用详情页面 -->
    <el-dialog
      width="600px"
      title="引用详情"
      :visible.sync="refDialog"
      class="refDialogClass"
    >
      <div>
        <el-table
          :data="refTableData"
          border
          style="width: 100%"
          size="mini"
          height="200px"
        >
          <el-table-column
            v-for="(p,index) in refTableProp"
            :key="index"
            :prop="p.prop"
            :label="p.value"
            align="center"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!--本地数据库实体预览 -->
    <el-dialog
      class="entity-dialog"
      title="预览"
      style="height:100%"
      :visible.sync="entityDialogVisible"
      :close-on-click-modal="false"
      size="mini"
      width="80%"
      @close="closePreviewDialog"
      id="auto_pre_close"
    >
      <div v-show="entityColsData.tableAttr.data.length > 0" style="height:22px">最大显示100条 数据</div>
      <div id="dsetPreivewTbWrap">
        <el-table
          border
          size="mini"
          ref="table"
          height="100%"
          :fit="true"
          max-height="calc(80vh - 134px)"
          v-bind="entityColsData.tableAttr"
          :key="Math.random()"
          v-loading="prevLoading"
        >
          <el-table-column
            v-for="col in entityColsData.columns"
            :key="col.prop+Math.random()"
            :label="col.label"
            v-bind="col"
            :show-overflow-tooltip="true"
            :min-width="(col.label.replace(/[^\x00-\xff]/g, '01')).length / 1.5*16+40"
            class-name="table-head"
          ></el-table-column>
        </el-table>
      </div>
    </el-dialog>

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
    <AddDataSource @emitListSearch="search" :dataSrcInfo="curEditDataSrc"></AddDataSource>
    <el-dialog
      :visible.sync="excelAddToDialog"
      title="追加文件"
      width="530px"
      @close="closeaddToDialog('addToForm')"
      v-loading="upLoding"
    >
      <el-form ref="addToForm" :model="addToForm" :rules="uploadRules">
        <el-form-item :label-width="'100px'" label="请选择文件" style="margin-left:10px" prop="foldName">
          <el-input
            v-model="addToForm.foldName"
            size="mini"
            style="width:308px"
            placeholder="选择待上传文件"
            :disabled="true"
          ></el-input>
          <el-upload
            class="compt-import"
            :show-file-list="false"
            action
            accept=".xls, .xlsx"
            :auto-upload="false"
            :before-upload="addToExcel"
            :on-change="changeFile"
          >
            <el-button slot="trigger" size="mini" type="primary">选择</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item :label-width="'100px'" label="请输入名称" prop="dsName" style="margin-left:10px">
          <el-input
            v-model="addToForm.dsName"
            size="mini"
            style="width:308px;"
            :disabled="true"
            :title="addToForm.dsName"
          ></el-input>
        </el-form-item>
      </el-form>
      <span style="margin-left:20px;margin-top:20px;font-size:13px;color:red">
        注意：1、您使用的是Excel上传，将默认使用第一个sheet,导入时默认
        <br />
      </span>
      <span style="margin-left:79px;font-size:13px;color:red">
        第一行为表头;
        <br />
      </span>
      <span style="margin-left:58px;font-size:13px;color:red">
        2、文件列数不超过100列，文件大小不超过20M，若文件较大，
        <br />
      </span>
      <span style="margin-left:79px;font-size:13px;color:red">
        建议以追加的方式分批次上传。
        <br />
      </span>
      <span style="margin-left:58px;font-size:13px"></span>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="uploadReset('addToForm')">取 消</el-button>
        <el-button
          type="primary"
          @click="submitUpload('addToForm')"
          size="mini"
        >确定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :visible.sync="csvAddtoDialog"
      title="追加文件"
      width="530px"
      @close="closeCsvDialog('addCSVForm')"
      v-loading="csvLoading"
    >
      <el-form ref="addCSVForm" :model="addCSVForm" :rules="uploadRules">
        <el-form-item
          :label-width="'100px'"
          label="请选择文件"
          class="star"
          style="margin-left:10px"
          prop="foldName"
        >
          <el-input
            v-model="addCSVForm.foldName"
            size="mini"
            style="width:308px"
            placeholder="选择待上传文件"
            :disabled="true"
          ></el-input>
          <el-upload
            class="compt-import"
            :show-file-list="false"
            action
            accept=".csv"
            :auto-upload="false"
            :before-upload="CsvUploadMethod"
            :on-change="changeCsvFile"
          >
            <el-button slot="trigger" size="mini" type="primary">选择</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item
          :label-width="'100px'"
          label="请输入名称"
          class="star"
          prop="dsName"
          style="margin-left:10px"
        >
          <el-tooltip effect="light" placement="right">
            <div slot="content" style="color:#409eff">
              名称只能由中英文、数字及下划线、斜线
              <br />、反斜线、竖线、小括号、中括号组成，
              <br />不超过50个字符
              <br />
            </div>
            <el-input
              v-model="addCSVForm.dsName"
              size="mini"
              style="width:308px"
              :disabled="true"
              :title="addCSVForm.dsName"
            ></el-input>
          </el-tooltip>
        </el-form-item>
      </el-form>
      <span style="margin-left:20px;margin-top:20px;font-size:13px;color:red">
        注意：1、您使用的是CSV上传，将默认使用第一个sheet，导入时默认
        <br />
      </span>
      <span style="margin-left:79px;font-size:13px;color:red">
        第一行为表头;
        <br />
      </span>
      <span style="margin-left:58px;font-size:13px;color:red">
        2、文件列数不超过100列，文件大小不超过20M，若文件较大，
        <br />
      </span>
      <span style="margin-left:79px;font-size:13px;color:red">
        建议以追加的方式分批次上传。
        <br />
      </span>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="csvReset('addCSVForm')">取 消</el-button>
        <el-button type="primary" @click="csvUpload('addCSVForm')" size="mini">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from "vuex";
import { objDeepCopy } from "../../utils/comonFunc.js";
import AddDataSource from "../design/AddDataSource.vue";
import { service } from "ngbd-utils";
import condiMixins from "../../utils/condiMixins.js"

export default {
  mixins: [condiMixins],
  components: {
    AddDataSource
  },
  data() {
    var catalogCheck = (rule, value, callback) => {
      if (value.length == 0) {
        callback(new Error("请选择目录"));
      } else {
        callback();
      }
    };
    var checkFoldName = (uploadRules, value, callback) => {
      var reg = /^[a-zA-Z0-9\|_\\\(\/\)\[\]\u4E00-\u9FA5]+$/;
      // var reg="^[a-zA-Z0-9\|_\\\\(\/\)\\[\\]\u4E00-\u9FA5]+$"
      if (value.length > 50) {
        callback(new Error("文件名称不能超过50个字符"));
      } else if (!reg.test(value.trim())) {
        callback(new Error("文件名称错误"));
      } else {
        callback();
      }
    };
    return {
      //数据集引用对话框相关属性
      refDialog: false,
      refTableData: [],
      refTableProp: [{
          prop: 'refTypeName',
          value: '引用类型'
        }, {
          prop: 'refName',
          value: '引用名称'
        }, {
          prop: 'createUserName',
          value: '引用创建人'
        }, {
          prop: 'createTime',
          value: '引用创建时间'
        }],
      loading: true,
      prevLoading: false,
      cataTreeData: Object.freeze([]),
      pageList: [],
      selectRow: "",
      index: "",
      allData : [],
      deleteType: "",
      entityDialogVisible: false,
      /**本地文件上传模块begin */
      excelAddToDialog: false,
      addToForm: {
        foldName: "",
        dsName: ""
      },
      uploadRules: {
        dsName: [{ validator: checkFoldName, trigger: "blur" }],
        foldName: [
          { required: true, message: "请选择上传文件", trigger: "change" }
        ]
      },
      file: null,
      upLoding: false,
      /**本地文件上传模块end */
      /**本地文件上传CSV模块beign */
      csvAddtoDialog: false,
      addCSVForm: {
        foldName: "",
        dsName: ""
      },
      CsvFile: null,
      csvLoading: false,
      /**本地文件上传CSV模块end */
      condiSettingsData:[
        {
          name:'名称',
          formSymbol: 'pageName',
          type: 'input',
          vModelValue: '',
          selectOptions: []
        },
        {
          name:'类型',
          formSymbol: 'sourceTypeVal',
          type: 'cascader',
          vModelValue: [],
          selectOptions: []
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
      curEditDataSrc: "" //当前编辑的数据源
    };
  },
  computed: {
    ...mapState({
      tableData: state => state.DataSetMgt.tableData.list, //从homebody.js出获取数据
      renderEngine: state => state.renderEngine,
      catalogId: state => state.DataSetMgt.catalogId,
      tenantId: state => state.HomeBody.tenantId,
      classtypeId: state => state.DataSetMgt.classtypeId,
      defaultSystemId: state => state.defaultSystemId,
      dgwMsUrl: state => state.dgwMsUrl,
      entityColsData: state => state.DataSetMgt.entityColsData,
      datasourcePriv: state => state.commonProperties.datasourcePriv, //数据源类型显示块
      axiosTimeout: state => state.commonProperties.axiosTimeout
    }),
    dataSrcDialogVis: {
      get: function() {
        return this.$store.state.DataSetMgt.dataSrcDialogVis;
      },
      set: function(val) {
        this.upDataSrcDialogVis(val);
      }
    }
  },
  watch: {
    //节点改变分页初始化值也改变
    catalogId() {
      //目录变化--监听
      this.searchForm.pageName = "";
      this.searchForm.sourceTypeVal = [];
      this.searchForm.updateTime = "";
      this.search();
    },
    classtypeId() {
      //目录模块切换时候重新在查询
      this.searchForm.pageName = "";
      this.searchForm.sourceTypeVal = [];
      this.searchForm.updateTime = "";
      this.search();
    },
    tenantId() {
      this.search();
    },
    deleteDialog(val) {
      if (!val) return;
      const text = "确认要删除所选项吗？";
      this.open(text);
    }
  },
  methods: {
    //点击引用详情触发
    viewRef(data) {
        this.refDialog = true;
        let param = {};
        //判断是直连/资产还是本地
        if(data.tabPhyName){
          //本地
          param ={
            dataSourceId: "localdb",
            dataSourceName: data.dsName,
            tabPhyName: data.tabPhyName
          }
        }else {
          param ={
            dataSourceId: data.dsId,
            dataSourceName: data.dsName
          }
        }
        this.getDataSourceRefList(param)
          .then(val => {
            if (val.status === 200 && val.data.respResult === "1") {
              this.refTableData = val.data.respData;
            } else {
              this.$message.error(val.data.respErrorDesc);
            }
          })
          .catch(err => {
            console.error(err);
            this.$message.error("查询数据集引用列表异常");
          });
      },
    getDataSourceType() {
      this.getSourceType().then(val => {
        const souceAry = val.data.respData;
        if (val.data.respResult == 1 && souceAry.length > 0) {
          this.sourceType = [];
          // 过滤掉本地数据库
          // this.sourceType = souceAry.filter(item => {
          //   return item.resourceTypeId !== "localdb";
          // });
          this.sourceType = val.data.respData;
          let dbList = souceAry.filter(item => {
            return item.resourceTypeId === "database";
          });
          if (dbList.length > 0) {
            // 新增数据源弹窗的数据库列表
            this.dbList = Object.freeze(dbList[0].children || []);
          }
          let stringSource = JSON.stringify(val.data.respData)
          stringSource = stringSource.replace(/resourceTypeId/g, 'value')
          stringSource = stringSource.replace(/resourceTypeName/g, 'label')
          this.condiSettingsData.forEach((ele) => {
            if (ele.formSymbol === 'sourceTypeVal') {
              ele.selectOptions = JSON.parse(stringSource)
            }
          })
        }
      });
    },
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
              list.forEach(function(val1) {
                if (val1.parentCatalogId == "myfold") {
                  first.push(val1);
                } else {
                  second.push(val1);
                }
              });
              first.forEach(val2 => {
                var temp = {};
                temp.value = val2.catalogId;
                temp.id = val2.catalogId;
                temp.label = val2.catalogName;
                temp.level = 1;
                temp.typeId = val2.classTypeId;
                temp.parentId = val2.parentCatalogId;
                let children = this.generateTree(val2, second);
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
    closePreviewDialog() {
      //重置数据
      this.upEntityColsData({
        columns: [],
        tableAttr: { data: [] }
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
    // 树形结构数据转单层数组形式
    treeJsonToArray(nodes) {
      var r = [];
      if (Array.isArray(nodes)) {
        for (var i = 0, l = nodes.length; i < l; i++) {
          var copyNode = nodes[i];
          r.push({
            tab_id: copyNode.tab_id,
            tab_alias: copyNode.tab_alias,
            phy_tab_name: copyNode.phy_tab_name,
            rel_tab_id: copyNode.rel_tab_id,
            rel_tab_alias: copyNode.rel_tab_alias,
            join_type: copyNode.join_type,
            tab_join_exp_list: objDeepCopy(copyNode.tab_join_exp_list || []),
            color: copyNode.color
          });
          if (
            Array.isArray(copyNode["tab_rel_list"]) &&
            copyNode["tab_rel_list"].length > 0
          ) {
            // 若存在tab_rel_list则递归调用，把数据拼接到新数组中，并且删除该tab_rel_list
            var copyTabRelList = [];
            for (
              let index = 0, len2 = copyNode["tab_rel_list"].length;
              index < len2;
              index++
            ) {
              var element = copyNode["tab_rel_list"][index];
              copyTabRelList.push({
                tab_id: element.tab_id,
                tab_alias: element.tab_alias,
                phy_tab_name: element.phy_tab_name,
                rel_tab_id: copyNode.tab_id,
                rel_tab_alias: copyNode.tab_alias,
                join_type: element.join_type,
                tab_join_exp_list: objDeepCopy(element.tab_join_exp_list || []),
                tab_rel_list: objDeepCopy(element.tab_rel_list || []),
                color: element.color
              });
            }
            r = r.concat(this.treeJsonToArray(copyTabRelList));
          }
          delete nodes[i]["tab_rel_list"];
        }
      }
      return r;
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
            _this.$message.success("数据集另存成功");
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
    search() {
      this.loading = true;
      let key = this.searchForm.pageName.trim();
      let type = this.searchForm.sourceTypeVal;
      if (this.searchForm.updateTime == null) {
        this.searchForm.updateTime = "";
      }
      let updateBeginTime = (this.searchForm.updateTime[0] || "").replace(
        /\s*/g,
        ""
      );
      let updateEndTime = (this.searchForm.updateTime[1] || "").replace(
        /\s*/g,
        ""
      );
      let t_id = sessionStorage.getItem("tenant_id");
      let dataSetParam;
      dataSetParam = Object.assign({
        showTipFlag: "0", //显示本地名称
        tenantId: t_id,
        optBeginTime: updateBeginTime,
        optEndTime: updateEndTime,
        dsName: key,
        parentResourceTypeId: "",
        dsType: ""
      });

      if (type.length > 0) {
        dataSetParam.parentResourceTypeId = type[0];
        if (type.length > 1) {
          let list1 = this.sourceType.filter(item => {
            return item.resourceTypeId === type[0];
          });
          let list2 = list1[0].children.filter(item => {
            return item.resourceTypeId === type[1];
          });
          dataSetParam.dsType =
            list2.length > 0 ? list2[0].resourceTypeKey : "";
        }
      }

      this.queryDataSource(dataSetParam)
        .then(val => {
          if (val.status === 200 && val.data.respResult === "1") {
            var total = val.data.respData.length;
            var list = val.data.respData;
            //设置数据
            this.$store.commit("DataSetMgt/setTableData", { total, list });
          } else {
            this.$message.error("数据源查询失败");
          }
          this.loading = false;
        })
        .catch(err => {
          // this.$message.error("数据源查询异常");
          this.loading = false;
        });
    },
    addTableData() {
      this.upDataSrcDialogVis(true);
    },
    saveAsDataSet(data) {
      this.queryCatalog(); //重新在查询一下目录列表        -----   这个方法是异步的
      this.saveForm.pageName = data.af_name;
      this.saveForm.afId = data.af_id; //数据集id
      this.dialogSaveAs = true;
    },
    selectTable(select) {
      this.pageList = select;
    },
    goDelete() {
      //删除提示框
      if (this.pageList.length == 0) {
        this.$message.warning("请选择要删除的数据源！");
        return;
      } else {
        this.deleteDialog = true;
        this.deleteType = "multiple";
      }
    },
    delTableData() {
      //删除
      //删除确认操作
      let tcList = [];
      let _this = this;
      if (this.deleteType == "multiple") {
        //删除多个数据源
        for (let index = 0; index < this.pageList.length; index++) {
          const element = this.pageList[index];
          tcList.push({
            connId: element.dsId,
            tenantId:
              window.sessionStorage.getItem("tenant_id") + "" || "34234234",
            dsKey: element.parentResourceTypeId
          });
        }
      } else if (this.deleteType == "single") {
        //删除单个数据源
        let phyName = "";
        if (this.selectRow.parentResourceTypeId === "localdb") {
          phyName = this.selectRow.localDbTab.tabPhyName;
        }
        tcList.push({
          connId: this.selectRow.dsId, //连接id
          tabPhyName: phyName, //表物理名
          tenantId:window.sessionStorage.getItem("tenant_id") + "" || "34234234", //租户id
          dsKey: this.selectRow.parentResourceTypeId
        }); //将数据集id全部存放到数组中
      }
      this.getDataSrcReqApi({
        param: tcList,
        type: "deleteDataSrc"
      })
        .then(function(response) {
          if (response.data.respResult === "1") {
            _this.$message.success("数据源删除成功");
            _this.pageList = [];
            _this.search();
          } else {
            _this.$message.error(
              response.data.respErrorDesc || "数据源删除失败"
            );
          }
        })
        .catch(function(error) {
          console.error(error);
          // _this.$message.error("数据源删除失败");
        })
        .finally(() => {
          _this.deleteDialog = false;
        });
    },
    deleteRow(index,data,alldata) {
      this.selectRow = data;
      this.index = index;
      this.allData = alldata;
      this.deleteType = "single";
      this.deleteDialog = true;
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
    closeaddToDialog(addToForm) {
      this.excelAddToDialog = false;
      this.upLoding = false;
      this.file = null;
      this.addToForm.foldName = "";
      this.$refs[addToForm].resetFields();
    },
    addTo(row) {
      // console.log(row);
      if (row.resourceTypeId === "CSV") {
        this.csvAddtoDialog = true;
        this.addCSVForm.dsName = row.dsName;
      } else if (row.resourceTypeId === "EXCEL") {
        this.excelAddToDialog = true;
        this.addToForm.dsName = row.dsName;
      }
    },
    addToExcel() {
      let formData = new FormData();
      formData.append("file", this.file.raw);
      formData.append("dsName", this.addToForm.dsName);
      this.upLoding = true;
      this.appendExcel(formData)
        .then(res => {
          if (res) {
            if (res.status == 200 && res.data.respResult == "1") {
              this.$message.success("上传成功");
              this.upLoding = false;
              this.excelAddToDialog = false;
              this.search();
            } else if (res.data.respResult == "0") {
              this.$message.error(res.data.respErrorDesc);
              this.upLoding = false;
            }
          }
        })
        .catch(err => {
          this.$message.error(err);
          console.error(err);
          this.upLoding = false;
        })
        .finally(() =>{
          this.upLoding = false;
        });
    },
    changeFile(file) {
      this.file = file;
      this.addToForm.foldName = file.name;
    },
    uploadReset(addToForm) {
      this.upLoding = false;
      this.excelAddToDialog = false;
      this.file = null;
      this.$refs[addToForm].resetFields();
      this.addToForm.foldName = "";
    },
    submitUpload(addToForm) {
      if (this.file == null) {
        this.$message({
          message: "请选择文件",
          type: "warning"
        });
        return;
      }
      let test = this.addToForm.foldName.split(".");
      if (test[test.length - 1] != "xls" && test[test.length - 1] != "xlsx") {
        this.$message.error("文件后缀名应为.xlsx或是.xls");
        return;
      }
      this.$refs.addToForm.validate(valid => {
        if (valid) {
          this.$confirm("确认上传该excel文件?", "提示", {
            closeOnClickModal: false,
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          })
            .then(() => {
              this.addToExcel();
            })
            .catch(err => {});
        } else {
          this.$message("请按照提示要求输入文件名");
        }
      });
    },
    /**本地上传CSV追加 --begin*/
    OpenCSVDialog() {
      this.csvAddtoDialog = true;
    },
    closeCsvDialog(addCSVForm) {
      this.csvAddtoDialog = false;
      this.csvLoading = false;
      this.addCSVForm.foldName = "";
      this.addCSVForm.dsName = "";
      this.$refs[addCSVForm].resetFields();
    },
    csvReset(addCSVForm) {
      this.csvLoading = false;
      this.csvAddtoDialog = false;
      this.CsvFile = null;
      this.addCSVForm.foldName = "";
      this.addCSVForm.dsName = "";
      this.$refs[addCSVForm].resetFields();
    },
    csvUpload(addCSVForm) {
      if (this.CsvFile == null) {
        this.$message({
          message: "请选择文件",
          type: "warning"
        });
        return;
      }
      let test = this.addCSVForm.foldName.split(".");
      if (test[test.length - 1] != "csv") {
        this.$message.error("文件仅支持CSV格式！");
        return;
      }
      this.$refs.addCSVForm.validate(valid => {
        if (valid) {
          this.$confirm("确认上传该csv文件?", "提示", {
            closeOnClickModal: false,
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          })
            .then(() => {
              this.CsvUploadMethod();
            })
            .catch(err => {});
        } else {
          this.$message("请按照提示要求输入文件名");
        }
      });
    },
    CsvUploadMethod() {
      let formData = new FormData();
      formData.append("file", this.CsvFile.raw);
      formData.append("dsName", this.addCSVForm.dsName);
      this.csvLoading = true;
      this.extAppendCsv(formData)
        .then(res => {
          if (res) {
            if (res.status == 200 && res.data.respResult == "1") {
              this.$message.success("追加成功");
              this.csvLoading = false;
              this.csvAddtoDialog = false;
              this.dataSrcDialogVis = false;
              this.search();
            } else if (res.data.respResult == "0") {
              this.$message.error(res.data.respErrorDesc);
              this.csvLoading = false;
            }
          }
        })
        .catch(err => {
          this.$message.error(err);
          console.error(err);
          this.csvLoading = false;
        })
        .finally(() =>{
          this.csvLoading = false;
        });
    },
    changeCsvFile(file) {
      this.CsvFile = file;
      this.addCSVForm.foldName = file.name;
    },
    ...mapMutations({
      setTableData: "DataSetMgt/setTableData",
      upDataSrcDialogVis: "DataSetMgt/upDataSrcDialogVis"
    }),
    ...mapActions({
      appendExcel: "compt/appendExcel", //本地文件上传
      extAppendCsv: "compt/appendCsv", //本地文件上传Csv
      getSourceType: "DataSetMgt/getSourceType", //数据源查询
      upEntityColsData: "DataSetMgt/upEntityColsData",
      queryDataSource: "DataSetMgt/queryDataSource", //数据源查询
      queryTreeData: "HomeTree/queryTreeData",
      updatePageInfo: "DataSetMgt/updatePageInfo",
      queryDbTbData: "DataSetDesign/queryDbTbData", //数据源 左侧表数据预览
      getDataSrcReqApi: "DataSetMgt/getDataSrcReqApi",
      getDataSourceRefList: "DataSetMgt/getDataSourceRefList"//查询数据源（或物理表）被引用详情
    }),
    editDataSrc(rowData) {
      //编辑
      this.curEditDataSrc = objDeepCopy(rowData);
    },
    previewBaseEntity(tableInfo) {  //预览本地数据库表信息
      this.prevLoading = true;//开启加载中
      this.entityDialogVisible = true;
      let _this = this;
      let dsDbVersion = "";
      let paramList = tableInfo.paramList;
      let dsDbType = ""; //数据库用户模式
      let tableName = tableInfo.localDbTab.tabPhyName; //物理表名
      let tableSchema = ""; //数据库模式
      //获取数据库版本号
      for (let index = 0; index < (paramList || []).length; index++) {
        const element = paramList[index];
        if (element.paramName === "db_version") {
          dsDbVersion = element.paramValue;
          break;
        }
      }
      //获取数据库类型
      for (let index = 0; index < (paramList || []).length; index++) {
        const element = paramList[index];
        if (element.paramName === "tns") {
          dsDbType = element.paramValue.split(":")[1];
          break;
        }
      }
      //获取数据库模式
      for (let index = 0; index < (paramList || []).length; index++) {
        const element = paramList[index];
        if (element.paramName === "user_name") {
          tableSchema = element.paramValue;
          break;
        }
      }
      this.queryDbTbData({
        dsId: "localdb", //本地数据库dsid固定不变
        tableName: tableName, //表名
        dsDbType: dsDbType,
        dsDbVersion: dsDbVersion,
        tableSchema: tableSchema
      })
        .then(response => {
          if (
            response.data.respResult == 1 &&
            response.data.respData &&
            response.data.respData.is_success
          ) {
            _this.$Watermark.set("dsetPreivewTbWrap", 0, 0, -40, 0, true);
            _this.handleEntityData(response);
          } else {
            _this.$message.error(
              response.data.respErrorDesc ||
                response.data.respData.err_msg ||
                "实体查询失败"
            );
          }
        })
        .catch(err => {
          console.error(err);
          // _this.$message.error("实体查询失败");
        })
        .finally(() => {
          _this.prevLoading = false;
        });
    },
    // 处理预览表格的请求数据
    handleEntityData(response) {
      let ecdata = { columns: [], tableAttr: { data: [] } };
      let result_col_list = response.data.respData.result_col_list || [];
      let result_data_list = response.data.respData.result_data_list || [];
      //对于类似t.id这个带.的字段不能作为prop，要改一下
      //表头
      result_col_list.forEach(function(item, i) {
        // let prop = item.col_desc || item.col_id; //col_id可能会重复，所以用col_desc
        let prop = item.col_id || item.col_desc; //col_id可能会重复，所以用col_desc
        prop = prop.replace(/\./g, ""); //把里面的.去掉，不然el-table解析不出来
        let temp = {
          label: item.col_desc || item.col_id,
          prop: prop,
          "show-overflow-tooltip": true
        };
        ecdata.columns.push(temp);
      });
      result_data_list.forEach(function(item, i) {
        let rows = item.data_list;
        let temp = {};
        for (let j = 0; j < rows.length; j++) {
          // let itm = result_col_list[j].col_desc || result_col_list[j].col_id; //col_id可能会重复，所以用col_desc
          let itm = result_col_list[j].col_id || result_col_list[j].col_desc; //col_id可能会重复，所以用col_desc
          itm = itm.replace(/\./g, ""); //把里面的.去掉，不然el-table解析不出来
          // let itm = result_col_list[j].col_id;
          temp[itm] = rows[j].data_val + "  ";
        }
        ecdata.tableAttr.data.push(temp);
      });
      this.upEntityColsData(ecdata);
    },
    deleteDataSrc() {
      let _this = this;
      if (this.pageList.length == 0) {
        this.$message.warning("请选择要删除的数据源");
        return;
      } else {
        let tcList = [];
        for (let index = 0; index < this.pageList.length; index++) {
          const element = this.pageList[index];
          tcList.push({
            connId: element.dsId,
            tenantId:
              window.sessionStorage.getItem("tenant_id") + "" || "34234234",
            dsKey: element.parentResourceTypeId
          });
        }
        this.getDataSrcReqApi({
          param: {
            tcList: tcList
          },
          type: "deleteDataSrc"
        })
          .then(function(response) {
            if (response.data.respResult === "1") {
              _this.$message.success("数据源删除成功");
              _this.search();
            } else {
              _this.$message.error(
                response.data.respErrorDesc || "数据源删除失败"
              );
            }
          })
          .catch(function(error) {
            console.error(error);
            // _this.$message.error("数据源删除失败");
          });
      }
    },
    rowTestConnection(rowData) {
      let _this = this;
      service({
        maskOff: true,
        url: `${this.dgwMsUrl}/database/queryConnection/${rowData.dsId}`,
        method: "get",
        timeout: this.axiosTimeout,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id") || "9999012",
          "X-SystemId": this.defaultSystemId || "111",
          "X-TenantId":
            window.sessionStorage.getItem("tenant_id") + "" || "34234234"
        }
      })
        .then(function(response) {
          if (response.data.respResult === "1") {
            _this.$message.success(`数据源连接成功`);
          // } else {
          //   _this.$message.error(
          //     `连接失败，填写的数据库信息不正确或未开启数据库服务，请检查！`
          //   );
          }
        })
        .catch(function(error) {
          console.error(error);
          // _this.$message.error(
          //   `连接失败，填写的数据库信息不正确或未开启数据库服务，请检查！`
          // );
        });
    }
  },
  mounted() {
    this.setTableData({ total: 0, list: [] });
    this.getDataSourceType();
    this.search();
  },
  activated() {
    this.setTableData({ total: 0, list: [] });
    this.search();
  }
};
</script>



<style lang="scss" scoped>
.star {
  /deep/.el-form-item__label::before {
    content: "*";
    color: #f56c6c;
    margin-right: 4px;
  }
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

  #dsetPreivewTbWrap {
    position: relative;
  }

  .main-content-table {
    position: absolute;
    top: 103px;
    bottom: 62px;
    left: 20px;
    right: 20px;
    &.no-pagination {
      bottom: 20px;
    }
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
.entity-dialog {
  overflow: hidden;
  /deep/.el-scrollbar__wrap {
    overflow-x: hidden;
  }
  /deep/.el-dialog__body {
    padding: 15px;
  }
  /deep/ th .cell {
    line-height: 29px;
    height: 27px;
    padding-top: 2px;
  }
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
#dsetPreivewTbWrap {
  position: relative;
}
#pagename-input {
  /deep/.el-form-item__error {
    margin-top: -7px;
  }
}

.el-table {
  /deep/.el-table__expand-icon {
    // position: absolute;
    vertical-align: top;
    // &+.name-text {
    //   padding-left: 15px;
    // }
  }
  /deep/.el-table tr {
    height: 30px;
  }
  &.sourceTable {
    /deep/.cell {
      overflow: inherit;
    }
    /deep/.el-table__body-wrapper {
      overflow-y: auto;
    }
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
}
</style>
<style>
/* 类型级联下拉框面板高度 */
.type-cascader-wrap .el-cascader-menu {
  height: 116px;
}
</style>
