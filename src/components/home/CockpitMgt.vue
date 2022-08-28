<template>
  <div class="main-content">
    <div class="main-content-form">
      <SimpleCondi :data="condiSettingsData" @condiSubmit="search(true)"></SimpleCondi>
    </div>
    <div
      class="main-content-tool"
      :style="computedStyle()"
    >
      <div v-if="privButton('发布')" class="tool-btn" @click="applyCockpit" >
          <span class="icon-A10072_add tool-btn-icon"></span>
          <span class="tool-btn-text">发布</span>
      </div>
    </div>
    <div
      class="main-content-table"
      :style="computedStyle('table')"
    >
      <GeminiScrollbar class="my-scroll-bar">
        <!--驾驶舱管理-->
        <el-table
          v-loading="loading"
          border
          :data="tableData"
          height="100%"
          style="width: 100%"
          @select="selectTable"
          @select-all="selectTable"
          size="mini"
          id="auto_ds_table"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column label="中文名称" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <div class="name-text name-txt1">{{ scope.row.pageName }}</div>
              <!-- <br />
              <div class="name-text name-txt2">{{ scope.row.catalog_class_path }}</div> -->
            </template>
          </el-table-column>
          <el-table-column label="类型" :show-overflow-tooltip="true">
            <template slot-scope="scope">{{ scope.row.classTypeName}}</template>
          </el-table-column>
          <el-table-column prop="operUserName" label="创建者" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="operTime" label="更新时间" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column label="操作" width="235">
            <template slot-scope="scope">
              <el-tooltip class="item" effect="dark" content="预览" placement="top-start">
                <span class="icon-A10181_browseCount table-icon" @click="toPrew(scope.row)"></span>
              </el-tooltip>
              <el-tooltip
                v-show="scope.row.isCollect==0 &&
               (
                ((catalogId!='workfold'&&catalogId!='recentbrowse'&&catalogId!='mycollect')&&executePriv!='0')
                || (catalogId=='workfold'&&executePriv!='0')
                || (catalogId=='recentbrowse'&&executePriv!='0')
                || (catalogId=='mycollect'&&executePriv!='0')
                )"
                class="item"
                effect="dark"
                content="收藏"
                placement="top-start"
              >
                <span
                  class="icon-A10059_pentagramHollow table-icon"
                  @click="addMyCollect(scope.row)"
                ></span>
              </el-tooltip>

              <el-tooltip
                v-show="scope.row.isCollect==1 &&
               (
                ((catalogId!='workfold'&&catalogId!='recentbrowse'&&catalogId!='mycollect')&&executePriv!='0')
                || (catalogId=='workfold'&&executePriv!='0')
                || (catalogId=='recentbrowse'&&executePriv!='0')
                || (catalogId=='mycollect'&&executePriv!='0')
                )"
                class="item"
                effect="dark"
                content="取消收藏"
                placement="top-start"
              >
                <span class="icon-A10058_pentagram table-icon" @click="delMyCollect(scope.row)"></span>
              </el-tooltip>
              <el-tooltip v-if="scope.row.classTypeId==='1008' && privButton('修改')" class="item" effect="dark" content="编辑" placement="top-start">
                <span
                  v-show="((catalogId!='workfold'&&catalogId!='recentbrowse'&&catalogId!='mycollect')&&executePriv!='0')
                || (catalogId=='workfold'&&executePriv!='0'&&tenantId==scope.row.tenantId)
                || (catalogId=='recentbrowse'&&executePriv!='0'&&tenantId==scope.row.tenantId)
                || (catalogId=='mycollect'&&executePriv!='0'&&tenantId==scope.row.tenantId)"
                  class="icon-A10189_edit table-icon"
                  @click="editCockpitApply(scope.row)"
                ></span>
              </el-tooltip>
              <el-tooltip v-if="scope.row.classTypeId==='1008' && privButton('删除')" class="item" effect="dark"  content="删除" placement="top-start">
                <span
                  v-show="((catalogId!='workfold'&&catalogId!='recentbrowse'&&catalogId!='mycollect')&&executePriv!='0')
                || (catalogId=='workfold'&&executePriv!='0'&&tenantId==scope.row.tenantId)
                || (catalogId=='recentbrowse'&&executePriv!='0'&&tenantId==scope.row.tenantId)
                || (catalogId=='mycollect'&&executePriv!='0'&&tenantId==scope.row.tenantId)"
                  class="icon-A10065_delete table-icon"
                  @click="delCockpitApp(scope.row)"
                ></span>
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

    <el-dialog width="420px" :visible.sync="dialogFormVisible">
      <div slot="title" class="dialog-title">
        <span>基本信息</span>
        <div class="title-line"></div>
      </div>
      <el-form ref="ruleForm" :rules="rules" :model="form">
        <el-form-item prop="pageName" label="名称" :label-width="formLabelWidth" class='pageName'>
          <el-input size="mini" v-model="form.pageName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item class="win-item" label="描述" :label-width="formLabelWidth">
          <el-input type="textarea" rows="4" v-model="form.pageDesc"  maxlength="50"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible=false" size="mini">取 消</el-button>
        <el-button type="primary" @click="submitForm('ruleForm')" size="mini">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 数据集合另存为弹出框 -->
    <el-dialog width="420px" :visible.sync="dialogSaveAs" @open="openDialog('saveForm')">
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
          class="pageName"
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
          id="auto_catalog"
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
        <el-button type="primary" @click="saveAsSubmit('saveForm')" size="mini" id="auto_saveAs_sure">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog width="420px" :visible.sync="dialogMove" @open="openDialog('moveForm')">
      <div slot="title" class="dialog-title">
        <span>移动</span>
        <div class="title-line"></div>
      </div>
      <el-form ref="moveForm" :rules="rules" :model="moveForm">
        <el-form-item
          size="mini"
          prop="catalogId"
          class="win-item"
          label="目录"
          :label-width="formLabelWidth"
          style="margin-bottom:11px;"
        >
          <el-cascader
            expand-trigger="hover"
            :show-all-levels="false"
            style="width:100%"
            :options="cataTreeData"
            v-model="moveForm.catalogId"
            :change-on-select="true"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogMove=false" size="mini">取 消</el-button>
        <el-button type="primary" @click="moveSubmit('moveForm')" size="mini">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 预览弹窗 -->
    <el-dialog
      class="entity-dialog"
      title="预览"
      style="height:100%"
      :visible.sync="entityDialogVisible"
      :close-on-click-modal="false"
      size="mini"
      width="80%"
      id="auto_pre_close"
    >
      <div v-show="entityColsData.tableAttr.data.length > 0" style="height:22px">最大显示100条 数据</div>
      <div id="dsetPreivewTbWrap">
        <el-table
          border
          size="mini"
          ref="table"
          height="100%"
          max-height="calc(80vh - 110px)"
          v-bind="entityColsData.tableAttr"
          :key="Math.random()"
          v-loading="prevLoading"
        >
          <el-table-column
            :render-header="labelHead"
            v-for="col in entityColsData.columns"
            v-bind:key="col.prop+Math.random()"
            v-bind="col"
          ></el-table-column>
        </el-table>
      </div>
    </el-dialog>
    <!--发布应用-->
    <CockpitDialog v-if="cockpitPubDialogVis"></CockpitDialog></div>
</template>

<script>
import { mapActions, mapMutations, mapState } from "vuex";
import { objDeepCopy } from "../../utils/comonFunc.js";
import { service } from 'ngbd-utils'
import condiMixins from "../../utils/condiMixins.js"
import CockpitDialog from "../design/CockpitDialog.vue";

export default {
  mixins: [condiMixins],
  components: {
    CockpitDialog
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
      prevLoading: true,
      loading: true,
      cataTreeData: Object.freeze([]),
      pageQuery: {
        start: 1,
        pageCount: 10
      },
      pageList: [],
      table1DataOri: [],
      table2DataOri: [],
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
          name:'类型',
          formSymbol: 'sourceTypeVal',
          type: 'select',
          vModelValue: '',
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
      form: {
        pageName: "",
        pageDesc: ""
      },
      saveForm: {
        pageName: "",
        catalogId: [],
        afId: ""
      },
      dialogFormVisible: false,
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
      entityDialogVisible: false,
      dialogMove: false,
      moveToTreeData: [],
      sourceType: [],
      sourceTypeVal: [],
      moveForm: {
        catalogId: [],
        pageId: ""
      }
    };
  },
  computed: {
    ...mapState({
      tableData: state => state.DataSetMgt.tableData.list, //从homebody.js出获取数据
      renderEngine: state => state.renderEngine,
      total: state => state.DataSetMgt.tableData.total,
      // catalogId: state => state.DataSetMgt.catalogId,
      catalogId: state => state.HomeBody.catalogId,
      classtypeId: state => state.DataSetMgt.classtypeId,
      catalogLevel: state => state.DataSetMgt.catalogLevel,
      treeData: state => state.DataSetMgt.treeData,
      entityColsData: state => state.DataSetMgt.entityColsData,
      datasetUrl: state => state.datasetUrl,
      dgwMsUrl: state => state.dgwMsUrl,
      defaultSystemId: state => state.defaultSystemId,
      myFolder: state => state.commonProperties.myFolder, //我的文件夹权限
      importPriv: state => state.commonProperties.importPriv, //导入权限
      executePriv: state => state.commonProperties.executePriv, //可执行权限
      homeTreeData: state => state.HomeTree.treeData,
      pageCache: state => state.HomeBody.pageCache,
      dataSetCache: state => state.DataSetMgt.dataSetCache,
      cockpitPubDialogVis: state => state.AnalyReportAttr.cockpitPubDialogVis,
      cockpitButton: state => state.HomeTree.cockpitButton
    })
  },
  watch: {
    //节点改变分页初始化值也改变
    catalogId() {
      //目录变化--监听
      this.pageQuery.start = 1;
      this.pageQuery.pageCount = 10;
      this.searchForm.pageName = "";
      this.searchForm.status = "";
      this.searchForm.updateTime = "";
      this.search();
    },
    classtypeId() {
      //目录模块切换时候重新在查询
      this.pageQuery.start = 1;
      this.pageQuery.pageCount = 10;
      this.searchForm.pageName = "";
      this.searchForm.status = "";
      this.searchForm.updateTime = "";
      this.search();
    },
    deleteDialog(val) {
      if (!val) return;
      const text = "确认要删除所选项吗？";
      this.open(text);
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
              // console.log(err);
              // this.$message.error("页面修改失败");
            });
        } else {
          // console.log("error submit!!");
          return false;
        }
      });
    },
    getCockpitTypeReq(){    //获取驾驶舱下拉列表(此处函数名称与后台调用方法名称不能一样否则会死循环)
      var par = {};
      par = Object.assign({
        pageId : '',
        qryExtType: '1'
      });

      this.getCockpitType(par).then(val => {
          if (val.status === 200 && val.data.respResult === "1") {
              // const souceAry = val.data.respData;
              // this.sourceType = [];
              this.sourceType = val.data.respData;
              this.condiSettingsData.forEach((ele) => {
                if (ele.formSymbol === 'sourceTypeVal') {
                  ele.selectOptions = []; //先清空，不然会有重复的数据
                  this.sourceType.forEach((st) => {
                    ele.selectOptions.push({
                      value: st.classTypeId,
                      label: st.classTypeName
                    })
                  })
                }
              })
          }

        });

    },
    addMyCollect(data) {
      //添加收藏
      var par = Object.assign({
        objId: data.af_id,
        userId: window.sessionStorage.getItem("user_id"),
        favoriteObj: 1004
      });
      this.addCollect(par)
        .then(val => {
          if (val.status === 200 && val.data.respResult === "1") {
            this.$message.success("数据集收藏成功");
            this.search();
          } else {
            this.$message.error("数据集收藏失败");
          }
        })
        .catch(err => {
          // this.$message.error("数据集收藏失败");
          console.error(err);
        });
    },
    delMyCollect(data) {
      //取消收藏
      var os = [];
      os.push(data.af_id);
      var par = Object.assign({
        objIds: os,
        userId: window.sessionStorage.getItem("user_id"),
        favoriteObj: 1004
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
            _this.$message.success("页面另存成功");
            //刷新数据集列表
            _this.search();
          } else {
            _this.$message.error(response.data.respErrorDesc);
          }
        })
        .catch(function(error) {
          console.error(err);
          // _this.$message.error("页面另存失败");
        });
    },
    //查询驾驶舱
    search(isNeedResetStart = false) {
      if (isNeedResetStart) {
        //如果是点查询按钮，应该从第一页开始查
        this.pageQuery.start = 1;
      }

      this.loading = true;
      var key = this.searchForm.pageName;
      if (this.searchForm.updateTime == null) {
        this.searchForm.updateTime = "";
      }
      //开始与结束时间
      let updateBeginTime = (this.searchForm.updateTime[0] || "").replace(
        /\s*/g,
        ""
        );
       let updateEndTime = (this.searchForm.updateTime[1] || "").replace(
        /\s*/g,
        ""
        );

      var prid = this.catalogId || '';
      //默认给个值
      if(this.catalogId == 'myfold'){
        let privList = JSON.parse(window.sessionStorage.getItem("X-NG-PrivList")) || [];
        let menuList = privList.filter(val=>{return ((val.menuName === '运营首页' || val.meuName === '驾驶舱') && val.parentId === '0')});
        prid = (menuList[0] || {}).menuId;
      }

      var cockpitParam = Object.assign({
          beginTime: updateBeginTime,
          endTime: updateEndTime,
          pageName: key,
          startPage: this.pageQuery.start,
          pageSize: this.pageQuery.pageCount,
          privId: prid,
          classTypeId: this.searchForm.sourceTypeVal
        });
      this.getCockpitList(cockpitParam)
        .then(val => {
          if (val.status == 200 && val.data.respResult == "1") {
            var total = val.data.dataTotalCount;
            var list = val.data.respData;
            //设置数据
            this.$store.commit("DataSetMgt/setTableData", { total, list });
          }
          else {
            this.$message.error("驾驶舱查询失败");
          }
          this.loading = false;
        })
        .catch(err => {
          // this.$message.error("驾驶舱询异常");
          this.loading = false;
        });
    },
    addTableData() {
      //跳转到新增数据集界面
      if (this.catalogId === "") {
        this.$message.warning("请选择目录再创建数据集");
        return;
      }
      if (this.catalogId === "workfold") {
        this.$message.warning("不可在工作组空间下创建数据集");
        return;
      }
      // else if (this.catalogLevel != 2) {
      //   this.$message.warning("请选择叶子目录再创建数据集");
      //   return;
      // }
      var item = {};

      //目录id
      item.catalogId = this.catalogId;
      item.af_id = "";
      item.operation = "dataset";
      this.setDataSetCache(item); //将数据缓存
      this.toDataSet(); //跳转到添加数据集合界面
    },
    editDataSet(data) {
      //编辑数据集
      // console.log(data);
      var pageParam = Object.assign({
        objId: data.af_id,
        operateUser: window.sessionStorage.getItem("user_id"),
        operateObj: 1004,
        operateType: 5,
        result: 1,
        remark: "数据集预览"
      });
      this.addOptlog(pageParam)
        .then(val => {})
        .catch(err => {
          console.error(err);
        });

      data.catalogId = this.catalogId;
      // console.info(data.af_id);
      data.operation = "dataset";
      this.setDataSetCache(data); //设置数据集缓存数据
      this.toDataSet(); //跳转到数据集界面
    },
    editPage(data) {
      this.selectRow = data;
      this.form.pageName = data.pageName;
      this.form.pageDesc = data.pageDesc;
      this.dialogFormVisible = true;
    },
    saveAsDataSet(data) {
      this.queryCatalog(); //重新在查询一下目录列表        -----   这个方法是异步的
      this.saveForm.pageName = data.af_name;
      this.saveForm.afId = data.af_id; //数据集id
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
      //删除提示框
      if (this.pageList.length == 0) {
        this.$message.warning("请选择要删除的数据集");
        return;
      } else {
        this.deleteDialog = true;
        this.deleteType = "multiple";
      }
    },
    delTableData() {
      //删除确认操作

      var idList = []; //数组
      if (this.deleteType == "multiple") {
        // var f = 0;
        this.pageList.forEach(function(val) {
          idList.push(val.af_id);
        });


      } else if (this.deleteType == "single") {

        idList.push(this.selectRow.af_id); //将数据集id全部存放到数组中
      }

      var dataSetParam = Object.assign({
        create_user: sessionStorage.getItem("user_id"),
        af_id_list: idList
      });

      this.deletePageInfo(dataSetParam)
        .then(val => {
          //调用后台方法
          if (val.status === 200 && val.data.respResult === "1") {
            this.$message.success("数据集删除成功");
            this.deleteDialog = false;
            this.pageList = []
            this.search();
          } else {
            this.$message.error("数据集删除失败");
          }
        })
        .catch(err => {
          // this.$message.error("数据集删除异常");
          // console.log(err);
        });
    },
    deleteRow(data) {
      if (data.af_status == "3") {
        this.$message.error("删除失败！无法删除已发布文件");
      } else {
        this.selectRow = data;
        this.deleteType = "single";
        this.deleteDialog = true;
      }
    },
    toDataSet() {
      //路由跳转新增数据集页面
      let pageInfo = JSON.stringify(this.dataSetCache);
      sessionStorage.setItem("dataSetCache", pageInfo);
      if(!!window.ActiveXObject || "ActiveXObject" in window) {
        this.storeVuexStore();
        let routeData = this.$router.resolve({ name: "dataset" });
        window.open(routeData.href, "_blank");
			} else {
        this.storeVuexStore().then(val => {
          let routeData = this.$router.resolve({ name: "dataset" });
          window.open(routeData.href, "_blank");
        })
      }
    },
    toPrew(data) {   //预览
      //外部应用预览
      if(data.classTypeId === '1008'){
        window.open(data.pageUrl, "_blank");
      }
      data.operation = "preview";
      this.setPageCache(data);
      // console.info(data);
      sessionStorage.setItem("pageCache", JSON.stringify(this.pageCache));
      let routeData = {};
      if (data.classTypeId == "1002") {
        routeData = this.$router.resolve({ name: "preview" }); //query: { timestamp: getTimestamp }
      } else if (data.classTypeId == "1003") {
        //报表工具
        routeData = this.$router.resolve({ name: "reportView" }); //query: { timestamp: getTimestamp }
      } else if (['1001001','1001002','1005'].includes(data.classTypeId)) {
        //数据大屏 //内容定制(pc与手机)
        routeData = this.$router.resolve({ name: "pageView" });
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
    labelHead(h, { column, index }) {
      try {
        let l = column.label.replace(/[^\x00-\xff]/g, "01").length / 1.5;
        let f = 16;
        column.minWidth = f * l + 40;
      } catch (e) {}
      return h(
        "div",
        {
          class: "table-head",
          style: { width: "100%", "line-height": "22px" }
        },
        [column.label]
      );
    },
    open(text) {
      this.$confirm(text, "提示", {
        closeOnClickModal: false,
        confirmButtonText: "确定",
        cancelButtonText: "取消"
        // type: 'warning'
      })
        .then(() => {
          this.$message({
            type: "success",
            message: "操作成功!"
          });
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
    moveTableData() {
      this.moveForm.catalogId = [];
      if (this.pageList.length == 0) {
        this.$message.warning("请选择要移动的页面");
        return;
      } else {
        this.queryCatalog(); //获取最新数据,和另存为的目录共用
        this.dialogMove = true;
      }
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
          this.pageList.forEach(function(val) {
            idList.push(val.af_id);
          });
          param.af_id_list = idList;
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
    openDialog(name) {
      this.saveForm.catalogId = []
      this.$nextTick(() => {
        this.$refs[name].clearValidate()
      })
    },
    applyCockpit() {
      this.setAppType('2');
      this.setCockpitPubDialogVis(true);
    },
    editCockpitApply(data) {
        this.setPageCache(data);
        sessionStorage.setItem("pageCache", JSON.stringify(this.pageCache));
        this.setAppType('2');
        this.setCockpitPubDialogVis(true);
    },
    delCockpitApp(data) {
      if (!data) return;
      const text = "确认要删除该应用吗？";
      this.$confirm(text, "提示", {
          closeOnClickModal: false,
          confirmButtonText: "确定",
          cancelButtonText: "取消"
          // type: 'warning'
        })
        .then(() => {
          this.delCockpitApply(data.pageId).then(val => {
            if (val.status === 200 && val.data.respResult === "1") {
              this.$message.success("应用删除成功！");
              this.search();
            } else {
              this.$message.error(val.data.respErrorDesc);
            }
          });
        })
    },
    privButton(buttonName){
      if(this.cockpitButton){
        let roleList = (JSON.parse(window.sessionStorage.getItem("X-NG-UserInfo")) || {}).roleList || [];
        let isPlatRole = roleList.filter(role=>role.roleName === '企业管理员');
        return isPlatRole.length > 0 && this.cockpitButton.filter(but=>but.menuName === buttonName).length > 0;
      }
      return false;
    },
    ...mapMutations({
      setTableData: "DataSetMgt/setTableData",
      setCockpitPubDialogVis: "AnalyReportAttr/setCockpitPubDialogVis",
      setAppType: "AnalyReportAttr/setAppType"
    }),
    ...mapActions({
      getCockpitType: "DataSetMgt/getCockpitType", //驾驶舱下拉列表
      queryDataSet: "DataSetMgt/queryDataSet", //数据集查询
      getCockpitList: "DataSetMgt/getCockpitList", //驾驶舱列表查询
      saveAsPage: "DataSetMgt/saveAsPage",
      setPageCache: "HomeBody/setPageCache",
      queryTreeData: "HomeTree/queryTreeData",
      updatePageInfo: "DataSetMgt/updatePageInfo",
      deletePageInfo: "DataSetMgt/delDataSet", //删除数据集
      setDataSetCache: "DataSetMgt/setDataSetCache", //使用vuex缓存数据
      movePageInfo: "DataSetMgt/movePageInfo", //移动数据集文件到指定文件夹下
      storeVuexStore: "storeVuexStore",
      setCatalog: "HomeBody/setCatalog",
      delCockpitApply: "DataSetMgt/delCockpitApply"
    })
  },
  mounted() {
    this.setTableData({ total:0, list:[] });
    this.getCockpitTypeReq();  //获取驾驶舱类型
    this.search();
  },
  activated() {
    this.setTableData({ total:0, list:[] });
    this.getCockpitTypeReq();  //获取驾驶舱类型
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
  text-align: right;
  top: 75px;
  right: 20px;
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
/deep/.el-dialog__body {
  padding-right: 40px;
  padding-top: 13px;
  padding-bottom: 10px;
}
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
    width:317px;
  }
}
#dsetPreivewTbWrap {
  position: relative;
}
 .pageName {
  /deep/.el-form-item__error {
    margin-top: -7px;
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
