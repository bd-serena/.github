<template>
  <div class="main-content">
    <div class="main-content-form">
      <SimpleCondi :data="condiSettingsData" @condiSubmit="search(true)"></SimpleCondi>
    </div>
    <div
      class="main-content-tool"
      :style="computedStyle()"
    >
    <!-- :disabled="['workfold', 'recentbrowse', 'mycollect'].includes(catalogId) || executePriv == '0'" -->
      <el-popover
        placement="bottom"
        title=""
        width="130"
        trigger="hover">
        <div class="btn-list">
          <div
            class="icon-block"
            @click="addTableData('')"
          >
            <i class="icon-A10514_InternetOfThings tool-btn-icon" />
            <span class="tool-btn-text">拓扑图建模</span>
          </div>
          <div
            class="icon-block"
            @click="addTableData('sql')"
          >
            <i class="icon-A10687_SQL tool-btn-icon" style="font-size: 18px; vertical-align: -4px;" />
            <span class="tool-btn-text">SQL建模</span>
          </div>
        </div>
        <div
         slot="reference"
        v-show="(catalogId != 'workfold' &&   catalogId != 'recentbrowse'  &&  catalogId != 'mycollect' ) && executePriv != '0'"
        class="tool-btn"
      >
        <span class="icon-A10072_add tool-btn-icon"></span>
        <span class="tool-btn-text">新增</span>
      </div>
      </el-popover>
      <div
        v-if="(catalogId != 'workfold' &&   catalogId != 'recentbrowse'  &&  catalogId != 'mycollect' ) && executePriv != '0'"
        class="tool-btn"
        @click="goDelete"
      >
        <span class="icon-A10065_delete tool-btn-icon"></span>
        <span class="tool-btn-text">删除</span>
      </div>
      <div
        v-if="(catalogId != 'workfold' &&   catalogId != 'recentbrowse'  &&  catalogId != 'mycollect' ) && executePriv != '0'"
        class="tool-btn"
        @click="moveTableData"
      >
        <span class="icon-A10671_cutover tool-btn-icon"></span>
        <span class="tool-btn-text">移动</span>
      </div>
      <!-- <div class="tool-btn">
        <span class="icon-A10163_publish tool-btn-icon"></span>
        <span class="tool-btn-text">发布</span>
      </div>-->
    </div>
    <div
      class="main-content-table"
      :style="computedStyle('table')"
    >
      <GeminiScrollbar class="my-scroll-bar">
        <!--数据集管理-->
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
          <el-table-column type="selection" width="55" :selectable="unSelectDemo"></el-table-column>
          <!-- <el-table-column prop="af_name" label="数据集名称"> -->
          <el-table-column label="数据集名称" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <!-- v-if="scope.row.classTypeId == '1001001'" -->
              <div :class="{'device-icon': true, 'single-line': !!!scope.row.catalogClassPath}">
                <div class="icon-A10514_InternetOfThings" />
                <!-- <div v-else-if="scope.row.classTypeId == '1001002'" class="icon-A10112_phone"></div> -->
              </div>
              <div class="cn-name">
                <div class="name-text name-txt1">{{ scope.row.datasetName }}</div>
                <span v-if="scope.row.catalogClassPath != ''"><br/></span>
                <div class="name-text name-txt2" v-if="scope.row.catalogClassPath != ''">{{ scope.row.catalogClassPath || '' }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="状态" :show-overflow-tooltip="true">
            <template
              slot-scope="scope"
            >{{ scope.row.datasetStatus==="1"?"新建": (scope.row.datasetStatus === '2' ? '已修改' : "已提交") }}
            </template>
          </el-table-column>
          <!-- <el-table-column prop="catalog_class_path" label="所属目录"></el-table-column> -->
          <el-table-column prop="createUserName" label="创建者" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="updateTime" label="更新时间" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column label="操作" width="245">
            <template slot-scope="scope">
              <el-tooltip class="item" effect="dark" content="预览" placement="top-start">
                <span class="icon-A10181_browseCount table-icon" @click="toPrew(scope.row)"></span>
              </el-tooltip>
              <!-- <el-tooltip class="item" effect="dark" content="血缘" placement="top-start">
                <span class="icon-A10514_InternetOfThings table-icon" @click="toJump"></span>
              </el-tooltip> -->
              <el-tooltip class="item" effect="dark" content="编辑" placement="top-start">
                <span
                  v-show="((catalogId!='workfold'&&catalogId!='recentbrowse'&&catalogId!='mycollect')&&executePriv!='0')
                || (catalogId=='workfold'&&executePriv!='0'&&tenantId==scope.row.tenantId)
                || (catalogId=='recentbrowse'&&executePriv!='0'&&tenantId==scope.row.tenantId)
                || (catalogId=='mycollect'&&executePriv!='0'&&tenantId==scope.row.tenantId)"
                  class="icon-A10189_edit table-icon"
                  @click="editDataSet(scope.row)"
                ></span>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="另存为" placement="top-start">
                <span
                  v-show="((catalogId!='workfold'&&catalogId!='recentbrowse'&&catalogId!='mycollect')&&executePriv!='0')
                || (catalogId=='workfold'&&executePriv!='0')
                || (catalogId=='recentbrowse'&&executePriv!='0')
                || (catalogId=='mycollect'&&executePriv!='0')"
                  class="icon-A10545_PS table-icon"
                  @click="saveAsDataSet(scope.row)"
                ></span>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" v-if="scope.row.isDemo !== '1'" content="删除" placement="top-start">
                <span
                  v-show="((catalogId!='workfold'&&catalogId!='recentbrowse'&&catalogId!='mycollect')&&executePriv!='0')
                || (catalogId=='workfold'&&executePriv!='0'&&tenantId==scope.row.tenantId)
                || (catalogId=='recentbrowse'&&executePriv!='0'&&tenantId==scope.row.tenantId)
                || (catalogId=='mycollect'&&executePriv!='0'&&tenantId==scope.row.tenantId)"
                  class="icon-A10065_delete table-icon"
                  @click="deleteRow(scope.row)"
                ></span>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" v-if="scope.row.isDemo !== '1'" content="自助取数" placement="top-start">
                <span
                  v-show="((catalogId!='workfold'&&catalogId!='recentbrowse'&&catalogId!='mycollect')&&executePriv!='0')
                || (catalogId=='workfold'&&executePriv!='0'&&tenantId==scope.row.tenantId)
                || (catalogId=='recentbrowse'&&executePriv!='0'&&tenantId==scope.row.tenantId)
                || (catalogId=='mycollect'&&executePriv!='0'&&tenantId==scope.row.tenantId)"
                  class="icon-A10680_business table-icon"
                  :class="[scope.row.datasetStatus === '1' ? 'gray':null]"
                  @click="selfAccess(scope.row)"
                ></span>
              </el-tooltip>
              <el-tooltip
                v-if="scope.row.isDemo !== '1'"
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
                v-if="scope.row.isDemo !== '1'"
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
              <!-- <el-tooltip
                v-if="scope.row.isDemo !== '1'"
                class="item"
                effect="dark"
                content="属性"
                placement="top-start"
              >
                <span
                  class="icon-A10155_sigh table-icon"
                  @click="viewVersion(scope.row)"
                />
              </el-tooltip> -->

              <!-- <el-tooltip
                v-if="scope.row.isDemo !== '1'"
                class="item"
                effect="dark"
                content="引用详情"
                placement="top-start"
              >
                <span
                  class="icon-A10096_detail table-icon"
                  @click="viewRef(scope.row)"
                />
              </el-tooltip>-->
               <el-tooltip
                v-if="scope.row.isDemo !== '1'"
                class="item"
                effect="dark"
                content="更多操作"
                placement="top-start"
              >
                <el-dropdown trigger="hover" placement="bottom">
                  <span class="el-dropdown-link">
                    <span class="icon-A10009_triangleDown table-icon"></span>
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item
                      v-if="scope.row.isDemo !== '1'"
                      @click.native="viewVersion(scope.row)"
                      icon="icon-A10155_sigh"
                    >属性
                    </el-dropdown-item>
                    <el-dropdown-item
                      @click.native="showCommitVerDialog(scope.row)"
                      icon="icon-A10164_forward"
                    >提交版本
                    </el-dropdown-item>
                    <el-dropdown-item
                      v-if="scope.row.isDemo !== '1'"
                      @click.native="viewRef(scope.row)"
                      icon="icon-A10096_detail"
                    >引用详情
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
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
        <el-form-item prop="pageName" label="名称" :label-width="formLabelWidth">
          <el-input size="mini" v-model="form.pageName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item class="win-item" label="描述" :label-width="formLabelWidth">
          <el-input type="textarea" rows="4" v-model="form.pageDesc" maxlength="50"></el-input>
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
          :label-width="'51px'"
          style="margin-bottom:14px;margin-top:-6px;"
        >
          <el-input size="mini" @input="inputChange" v-model="saveForm.pageName" autocomplete="off"></el-input>
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
        <el-button
          type="primary"
          @click="saveAsSubmit('saveForm')"
          size="mini"
          id="auto_saveAs_sure"
        >确 定
        </el-button>
      </div>
    </el-dialog>

    <el-dialog width="420px" v-if="dialogMove" :visible.sync="dialogMove" @open="openDialog('moveForm')">
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
    <!-- <el-dialog :visible.sync="deleteDialog" width="30%">
      <div slot="title" class="dialog-title">
        <span>删除提示</span>
        <div class="title-line"></div>
      </div>
      <span>确认要删除所选项吗？</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteDialog = false" size="mini">取 消</el-button>
        <el-button type="primary" @click="delTableData" size="mini">确 定</el-button>
      </span>
    </el-dialog>-->

    <!-- 预览弹窗 -->
    <el-dialog
      class="entity-dialog"
      title="预览"
      style="height:100%"
      append-to-body
      :visible.sync="entityDialogVisible"
      :close-on-click-modal="false"
      size="mini"
      width="80%"
      id="auto_pre_close"
      v-if="entityDialogVisible"
    >
      <div v-show="entityColsData.tableAttr.data.length > 0" style="height:22px">最大显示100条数据，聚合字段不预览</div>
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
    <el-dialog width="420px" :visible.sync="dialogCommitVersion" @open="openDialog('commitVerForm')">
      <div slot="title" class="dialog-title">
        <span>提交版本</span>
        <div class="title-line"></div>
      </div>
      <el-form ref="commitVerForm" :rules="rules" :model="commitVerForm">
        <el-form-item
          size="mini"
          prop="remark"
          class="win-item"
          label="描述"
          :label-width="formLabelWidth"
          style="margin-bottom:11px;"
        >
          <el-input type="textarea" rows="3" v-model="commitVerForm.remark" maxlength="50"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogCommitVersion=false" size="mini">取 消</el-button>
        <el-button type="primary" @click="versionSubmit('commitVerForm', 'analy')" size="mini">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog :width="baseInfoDialogWidth" :visible.sync="versionDialogVisible" id="auto_base_info" class="version-dialog">
      <div slot="title" class="dialog-title">
        <span>基本信息</span>
        <div class="title-line"></div>
      </div>
      <el-form ref="ruleForm" :rules="rules" :model="form">
        <el-row :gutter="30">
          <!-- 版本信息 -->
          <el-col :span="24">
            <el-collapse value="1" class="collapse-table">
              <el-collapse-item title="版本信息" name="1">
                <el-table
                  :data="versionList"
                  v-loading="versionLoading"
                  size="mini"
                  :height="verListTableHeight"
                  style="width: 100%;">
                  <el-table-column
                    prop="verNo"
                    width="80"
                    label="版本号">
                    <template slot-scope="scope">
                      v{{ scope.row.verNo }}
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="createUserName"
                    width="100"
                    label="提交人">
                  </el-table-column>
                  <el-table-column
                    prop="createTime"
                    label="提交时间">
                  </el-table-column>
                  <el-table-column
                    show-overflow-tooltip
                    prop="remark"
                    label="描述">
                  </el-table-column>
                  <el-table-column label="操作" width="80">
                    <template slot-scope="scope">
                      <el-tooltip class="item" effect="dark" content="预览" placement="top-start">
                        <span class="icon-A10181_browseCount table-icon" @click="editDataSet(scope.row)"></span>
                      </el-tooltip>
                      <el-tooltip :hide-after="1000" class="item" effect="dark" content="回退" placement="top-start">
                        <span :class="[verRollbacking === scope.row.verNo ? 'el-icon-loading' : 'icon-A10652_cancel', 'table-icon']" @click="gobacktoCurVer(scope.row, 'analy')"></span>
                      </el-tooltip>
                    </template>
                  </el-table-column>
                </el-table>
              </el-collapse-item>
            </el-collapse>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="versionDialogVisible=false" size="mini">取 消</el-button>
        <el-button type="primary" @click="versionDialogVisible=false" size="mini">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {mapActions, mapMutations, mapState} from "vuex";
  import {objDeepCopy, mapDataSetInfoKey} from "../../utils/comonFunc.js";
  import {service} from 'ngbd-utils';
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
        userId: window.sessionStorage.getItem("user_id"),
        tid: window.sessionStorage.getItem("tenant_id"),
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
        refTableProp: [{
          prop: 'datasetName',
          value: '数据集名称'
        }, {
          prop: 'classTypeName',
          value: '应用类型'
        }, {
          prop: 'pageName',
          value: '应用名称'
        }, {
          prop: 'createUserName',
          value: '应用创建人'
        }],
        refTableData: [],
        condiSettingsData:[
          {
            name:'名称',
            formSymbol: 'pageName',
            type: 'input',
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
        refDialog: false,
        formLabelWidth: "75px",
        rules: {
          pageName: [
            {required: true, message: "请输入名称", trigger: "blur"},
            {min: 1, max: 30, message: "长度在 1 到 30 个字符", trigger: "blur"}
          ],
          catalogId: [
            {required: true, validator: catalogCheck, trigger: "change"}
          ]
        },
        entityDialogVisible: false,
        dialogMove: false,
        moveToTreeData: [],
        moveForm: {
          catalogId: [],
          pageId: ""
        },
        versionDialogVisible: false
      };
    },
    computed: {
      ...mapState({
        tableData: state => state.DataSetMgt.tableData.list, //从homebody.js出获取数据
        renderEngine: state => state.renderEngine,
        total: state => state.DataSetMgt.tableData.total,
        catalogId: state => state.DataSetMgt.catalogId,
        classtypeId: state => state.DataSetMgt.classtypeId,
        catalogLevel: state => state.DataSetMgt.catalogLevel,
        tenantId: state => state.HomeBody.tenantId,
        treeData: state => state.DataSetMgt.treeData,
        entityColsData: state => state.DataSetMgt.entityColsData,
        datasetUrl: state => state.datasetUrl,
        pubSYSUrl: state => state.pubSYSUrl,
        dgwMsUrl: state => state.dgwMsUrl,
        defaultSystemId: state => state.defaultSystemId,
        myFolder: state => state.commonProperties.myFolder, //我的文件夹权限
        importPriv: state => state.commonProperties.importPriv, //导入权限
        executePriv: state => state.commonProperties.executePriv, //可执行权限
        homeTreeData: state => state.HomeTree.treeData,
        dataSetCache: state => state.DataSetMgt.dataSetCache,
        datasourcePriv: state => state.commonProperties.datasourcePriv, //数据源类型显示块
        axiosTimeout: state => state.commonProperties.axiosTimeout,
        pageCache: state => state.HomeBody.pageCache,
        versionList: state => state.HomeBody.versionList // 版本列表
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
        // console.info("租户监听");
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
      addMyCollect(data) {
        //添加收藏
        var par = Object.assign({
          objId: data.datasetId,
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
                list.forEach(function (val) {
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
            console.info(this.saveForm);
            //获取目录id
            var catalogId = this.saveForm.catalogId[
            this.saveForm.catalogId.length - 1
              ];
            var afId = this.saveForm.afId;
            this.saveAsDataSetAct(catalogId, afId);
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
        console.info(_afId);
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
          .then(function (response) {
            if (response.data.respResult == 1) {
              _this.dialogSaveAs = false;
              _this.$message.success("页面另存成功");
              //刷新数据集列表
              _this.search();
            } else {
              _this.$message.error(response.data.respErrorDesc);
            }
          })
          .catch(function (error) {
            console.error(error);
            // _this.$message.error("页面另存失败");
          });
      },
      search(isNeedResetStart = false) {
        this.pageList = []
        if (isNeedResetStart) {
          //如果是点查询按钮，应该从第一页开始查
          this.pageQuery.start = 1;
        }
        var user_id = sessionStorage.getItem("user_id");
        this.loading = true;
        var key = this.searchForm.pageName;
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
        var t_id = sessionStorage.getItem("tenant_id");
        // 案例展示
        let isNeedDemo = this.searchForm.isShowDemo ? '1' : '0'
        let commonParam = { updateBeginTime, updateEndTime, isNeedDemo }
        var dataSetParam;
        if (this.myFolder == "0" || this.catalogId == "workfold") {
          //工作组文件夹
          //数据集参数
          dataSetParam = Object.assign(commonParam, {
            notCreateUser: user_id,
            tenantId: t_id,
            datasetName: key,
            // af_status: status,
            start: this.pageQuery.start,
            pageCount: this.pageQuery.pageCount,
            catalogId: this.catalogId,
            objType: "dads",
            isEdit: 1
          });
        } else {
          //我的文件夹下面
          dataSetParam = Object.assign(commonParam, {
            createUser: user_id,
            tenantId: t_id,
            datasetName: key,
            // af_status: status,
            start: this.pageQuery.start,
            pageCount: this.pageQuery.pageCount,
            catalogId: this.catalogId,
            objType: "dads",
            isEdit: 1
          });
        }


        this.queryDataSet({param:dataSetParam,  flag: "1"})
          // this.queryDataSet(dataSetParam)
          .then(val => {
            if (val.status === 200 && val.data.respResult === "1") {
              var total = val.data.dataTotalCount;
              var list = val.data.respData;
              //设置数据
              this.$store.commit("DataSetMgt/setTableData", {total, list});
            } else {
              this.$message.error("数据集查询失败");
            }
            this.loading = false;
          })
          .catch(err => {
            // this.$message.error("数据集查询异常");
            this.loading = false;
          });
      },
      addTableData(pageType="") {
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
        item.datasetId = "";
        item.operation = "dataset";
        this.setDataSetCache(item); //将数据缓存
        this.toDataSet(pageType); //跳转到添加数据集合界面
      },
      editDataSet(data) {
        let objId = data.datasetId ? data.datasetId : this.dataSetCache.datasetId;
        //编辑数据集
        var pageParam = Object.assign({
          objId: objId,
          operateUser: window.sessionStorage.getItem("user_id"),
          operateObj: 1004,
          operateType: 5,
          result: 1,
          remark: "数据集编辑"
        });
        this.addOptlog(pageParam)
          .then(val => {
          })
          .catch(err => {
            console.error(err);
          });

        data.catalogId = this.catalogId;
        data.operation = "dataset";
        let cacheData = objDeepCopy(data);
        if(data.verNo) {// 数据集版本预览
          let datasetObj = JSON.parse(data.objContent);
          delete cacheData.objContent;
          data = Object.assign(cacheData, datasetObj);
          data.isVersion = true;
       }
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
        this.saveForm.pageName = data.datasetName;
        this.saveForm.afId = data.datasetId; //数据集id
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
          const text = "确认要删除所选项吗？";
          this.open(text);
        }
      },
      delTableData() {
        //删除确认操作

        var idList = []; //数组
        if (this.deleteType == "multiple") {
          // var f = 0;
          this.pageList.forEach(function (val) {
            // if (val.af_status == "3") {
            //   f = f + 1;
            // } else {
            //   idList.push(val.af_id);
            // }
            idList.push(val.datasetId);
          });

          // if (f > 0) {
          //   this.$message.error("删除失败！无法删除已发布文件");
          //   return;
          // }
        } else if (this.deleteType == "single") {
          // if (this.selectRow.af_status == "3") {
          //   this.$message.error("删除失败！无法删除已发布文件");
          //   return;
          // } else {
          //   idList.push(this.selectRow.af_id); //将数据集id全部存放到数组中
          // }
          idList.push(this.selectRow.datasetId); //将数据集id全部存放到数组中
        }

        var dataSetParam = Object.assign({
          create_user: sessionStorage.getItem("user_id"),
          datasetIdList: idList
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
              this.$message.error(val.data.respErrorDesc);
            }
          })
          .catch(err => {
            // this.$message.error("数据集删除异常");
          });
      },
      deleteRow(data) {
        if (data.af_status == "3") {
          this.$message.error("删除失败！无法删除已发布文件");
        } else {
          this.selectRow = data;
          this.deleteType = "single";
          this.deleteDialog = true;
          const text = "确认要删除所选项吗？";
          this.open(text);
        }
      },
      viewRef(data) {
        this.refDialog = true;
        this.getDataSetRefList(data.datasetId)
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
      // 自助取数
      selfAccess(data){
        if(data.datasetStatus !== "1"){
          data.pageName = data.datasetName;
          this.setPageCache(data);
          let pageInfo = JSON.stringify(this.pageCache);
          sessionStorage.setItem("pageCache", pageInfo);
          this.storeVuexStore().then(val => {
            let routeData = this.$router.resolve({name: "design"});
            window.open(routeData.href, "_blank");
          })
          
        }else{
          this.$message({
            type: "warning",
            message: "请先提交版本!"
          });
        }
      },
      /**
       * @param pageType 页面类型：""--拓扑建模 "sql"--sql建模
       */
      toDataSet(pageType="") {
        //路由跳转新增数据集页面
        // this.$router.push({
        //   path: "/dataset",
        //   name: "dataset"
        // });
        const routeName = pageType === ""?"dataset":"dataSetSql"
        let pageInfo = JSON.stringify(this.dataSetCache);
        sessionStorage.setItem("dataSetCache", pageInfo);
        if(!!window.ActiveXObject || "ActiveXObject" in window) {
          this.storeVuexStore();
          let routeData = this.$router.resolve({name: routeName});
          window.open(routeData.href, "_blank");
        } else {
          this.storeVuexStore().then(val => {
            let routeData = this.$router.resolve({name: routeName});
            window.open(routeData.href, "_blank");
          })
        }
      },
      toPrew(data) {
        this.upEntityColsData({columns: [], tableAttr: {data: []}});
        //预览操作日志记录
        var pageParam = Object.assign({
          objId: data.datasetId,
          operateUser: window.sessionStorage.getItem("user_id"),
          operateObj: 1004,
          operateType: 5,
          result: 1,
          remark: "数据集预览"
        });
        this.addOptlog(pageParam)
          .then(val => {
          })
          .catch(err => {
            console.error(err);
          });

        this.entityDialogVisible = true;
        this.prevLoading = true;
        data.tab_id = data.datasetId;
        var param = {
          datasetId: data.datasetId,
          isQueryTabHis: "1",
          isNeedDemo: data.isDemo
        };

        this.getDataSetInfo({
          type: "dataasset",
          param: param
        }).then(response => {
          this.$Watermark.set("dsetPreivewTbWrap", 0, 0, -40, 0, true);
          if (
            response.data.respResult == 1 &&
            response.data.respErrorCode != -1 &&
            response.status == 200 &&
            response.data.respData
          ) {
            const respData = mapDataSetInfoKey(response.data.respData)
            let resParam = respData.anly_frame_elements || []
            let select_list = []
            if (resParam.length === 0) {
              return
            }
            resParam.forEach(function (params) {
              let nick_name =
                (params.element_name || "") == ""
                  ? params.show_type == 1
                  ? params.col_name
                  : params.col_chs_name
                  : params.element_name;
              let temp = {
                col_id: params.col_id,
                element_id: params.element_id,
                nick_name: nick_name,
                obj_id: params.tab_id
              };
              // 判断是否包含聚合类计算字段
              if(params.is_calcul!=="2"){
                select_list.push(temp);
              }
            });
            //数据展示
            var param = {
              af_id: data.datasetId,
              begin_date: "",
              head_bean: {
                pageCount: 100,
                start: 1,
                user_id: window.sessionStorage.getItem("user_id")
              },
              is_need_log: 1,
              is_need_paging: 1,
              is_need_permission: 1,
              is_need_trans: 1,
              query_type: "1",
              select_list: select_list,
              "is_need_count": "0"
              // "where_bean": where_bean
            };
            service({
              maskOff: true,
              // url: this.dgwMsUrl + "/dataAnlyFrameQuery/queryAfPropertyData",
              url: this.renderEngine + "/dataAnlyFrameQuery/queryAfPropertyData",
              method: 'post',
              data: param,
              timeout: this.axiosTimeout
            }).then(response => {
              if (
                response.data.respResult == 1 &&
                response.status == 200 &&
                response.data.respData &&
                response.data.respData.is_success
              ) {
                var ecdata = {columns: [], tableAttr: {data: []}};
                var result_col_list =
                  response.data.respData.result_col_list || [];
                var result_data_list =
                  response.data.respData.result_data_list || [];
                //表头
                result_col_list.forEach(function (item, i) {
                  let temp = {
                    label: item.col_desc,
                    prop: item.element_id, //  col_id
                    "show-overflow-tooltip": true
                  };
                  ecdata.columns.push(temp);
                });
                result_data_list.forEach(function (item, i) {
                  let rows = item.data_list;
                  let temp = {};
                  for (let j = 0; j < rows.length; j++) {
                    let itm = result_col_list[j].element_id; //col_id
                    temp[itm] = rows[j].data_val;
                  }
                  ecdata.tableAttr.data.push(temp);
                });
                this.upEntityColsData(ecdata);
              } else {
                this.upEntityColsData({columns: [], tableAttr: {data: []}});
              }
            })
              .catch(function (error) {
                // this.$message.error("实体查询失败");
                this.upEntityColsData({columns: [], tableAttr: {data: []}});
                console.error(error);
              })
              .finally(() => {
                this.prevLoading = false;
              });
          }
        });
      },
      //跳转血缘窗口
      toJump() {
        window.open("http://10.1.12.48:17181/edc-dataasset-web/dataasset/entityRelView.do?tab_id=T10000095758_43bee1608b474f01b3df49a80fa473b0&change_flag=old&p_priv_id=entityRelViewT10000095758_43bee1608b474f01b3df49a80fa473b0&p_priv_name=%E8%A1%80%E7%BC%98%E5%88%86%E6%9E%90");
      },
      labelHead(h, {column, index}) {
        try {
          let l = column.label.replace(/[^\x00-\xff]/g, "01").length / 1.5;
          let f = 16;
          column.minWidth = f * l + 40;
        } catch (e) {
        }
        return h(
          "div",
          {
            class: "table-head",
            style: {width: "100%", "line-height": "22px"}
          },
          [column.label]
        );
      },
      open(text) {
        this.$confirm(text, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          closeOnClickModal: false
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
            // this.$message({
            //   type: "info",
            //   message: "已取消"
            // });
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
            this.pageList.forEach(function (val) {
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
          this.$refs[name].resetFields()
        })
      },
      viewVersion(data) {
        this.setDataSetCache(data);
        sessionStorage.setItem("dataSetCache", JSON.stringify(data));
        this.selectRow = data;
        this.form.pageName = data.pageName;
        this.form.pageDesc = data.pageDesc;
        // 查询版本信息
        this.setVersionList([]) // 清空之前的查询列表
        this.versionLoading = true
        let versionParam = {
              objId: data.datasetId,
              objType: 'dads',
              isQueryContent: '1'
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
        this.versionDialogVisible = true;
      },
      ...mapMutations({
        setTableData: "DataSetMgt/setTableData",
        setVersionList: "HomeBody/setVersionList",
      }),
      ...mapActions({
        queryDataSet: "DataSetMgt/queryDataSet", //数据集查询
        getDataSetRefList: "DataSetMgt/getDataSetRefList",
        saveAsPage: "DataSetMgt/saveAsPage",
        queryTreeData: "HomeTree/queryTreeData",
        updatePageInfo: "DataSetMgt/updatePageInfo",
        deletePageInfo: "DataSetMgt/delDataSet", //删除数据集
        setDataSetCache: "DataSetMgt/setDataSetCache", //使用vuex缓存数据
        upEntityColsData: "DataSetMgt/upEntityColsData",
        getDataEntity: "DataSetMgt/getDataEntity",
        movePageInfo: "DataSetMgt/movePageInfo", //移动数据集文件到指定文件夹下
        addOptlog: "compt/addOptlog", //添加预览日志
        addCollect: "compt/addCollect",
        delCollect: "compt/delCollect",
        storeVuexStore: "storeVuexStore",
        setPageCache: "HomeBody/setPageCache",
        getDataSetInfo: "DataSetDesign/getDataSetInfo" //查询数据集信息
      })
    },
    created() {
      this.setTableData({total: 0, list: []});
      if (this.catalogId === 'myfold') {
        this.search();
      }
    }
  };
</script>
<style lang="scss" >
#dsetPreivewTbWrap .el-table {
  .cell,
  td div {
    padding-right: 0;
  }
}
</style>
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
    .gray{
      color: #606266;
      &:hover {
        color: #606266;
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

  /deep/ .el-dialog__body {
    padding-right: 40px;
    padding-top: 13px;
    padding-bottom: 10px;
  }

  /deep/ .refDialogClass .el-dialog__body {
    padding-right: 20px;
  }

  /deep/ .el-form-item {
    margin-bottom: 18px;
  }

  .entity-dialog {
    overflow: hidden;

    /deep/ .el-scrollbar__wrap {
      overflow-x: hidden;
    }

    /deep/ .el-dialog__body {
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
    /deep/ .el-form-item__error {
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
.version-dialog {
    /deep/ .el-dialog__body {
      padding-top: 13px;
      padding-bottom: 10px;
      padding-right: 20px;
    }
    /deep/ .el-collapse.collapse-table{
      border-top: 0px;
    }
  }
.btn-list>div {
  display: block;
  margin-left: 0;
  &:first-child {
    margin-bottom: 12px;
  }
}
</style>
