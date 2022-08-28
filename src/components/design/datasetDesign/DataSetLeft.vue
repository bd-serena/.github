<template>
    <div style="width: 100%;height: 100%;">
        <div class="data-sources">
          <div class="col-title">
            <span class="icon-A10612_reward"></span>
            <label>数据源</label>
          </div>
          <div class="datasource-info">
            <div class="datasource-select">
              <el-select
                filterable
                v-model="dataSrcValue"
                placeholder="请选择数据源"
                :filter-method="filterDataSrc"
                size="mini"
                value-key="dsId"
                :style="{'width':dataSrcWidth + 'px'}"
                @change="dataSrcSelChange"
                id="dataSrcSelect"
                @visible-change="scrollFixed($event,'datasrc-scroll')"
              >
                <div class="datas-opt main-content-tool datasrc-scroll">
                  <div class="tool-btn" @click="toAddDataSrc">
                    <span class="icon-A10072_add tool-btn-icon"></span>
                    <span class="tool-btn-text">新增数据源</span>
                  </div>
                  <div class="tool-btn" @click="refreshDataSrc">
                    <span class="icon-A10280-refresh tool-btn-icon"></span>
                    <span class="tool-btn-text">刷新</span>
                  </div>
                </div>
                <el-option
                  v-for="(item,index1) in allDataSrc"
                  :key="item.dsId"
                  :label="item.dsName"
                  :value="item"
                  :id="'auto_ds'+index1"
                ></el-option>
                <div style="height:25px;min-width:200px"></div>
                <div slot="empty">
                  <div style="height:25px;min-width:200px"></div>
                  <div
                    class="datas-opt main-content-tool"
                    style="height: 25px;background: #fff;line-height: 29px;"
                  >
                    <div class="tool-btn" @click="toAddDataSrc">
                      <span class="icon-A10072_add tool-btn-icon"></span>
                      <span class="tool-btn-text">新增数据源</span>
                    </div>
                    <div class="tool-btn" @click="refreshDataSrc">
                      <span class="icon-A10280-refresh tool-btn-icon"></span>
                      <span class="tool-btn-text">刷新</span>
                    </div>
                  </div>
                </div>
              </el-select>
              <span>
                <el-popover ref="popover" placement="bottom" title width="225" trigger="hover">
                  <el-form label-width="85px" class="dataset-popover">
                    <el-form-item
                      v-for="item in popFormItem"
                      :key="item.value"
                      :label="`${item.label}:`"
                      :title="`${item.label}: ${popForm[item.value]}`"
                    >
                      <!-- <el-tooltip
                        effect="dark"
                        :enterable='false'
                        :content="popForm[item.value]"
                        placement="bottom"> -->
                          <label :class="item.class">
                            {{popForm[item.value]}}
                        </label>
                      <!-- </el-tooltip> -->
                    </el-form-item>
                    <!-- <el-form-item label="数据库名称:">
                      <label class="d-popover-name">{{popForm.db_name}}</label>
                    </el-form-item>
                    <el-form-item label="数据源类型:">
                      <label>{{popForm.srcType}}</label>
                    </el-form-item>
                    <el-form-item label="数据库版本:">
                      <label>{{popForm.db_version}}</label>
                    </el-form-item>
                    <el-form-item label="数据库地址:">
                      <label>{{popForm.ip_address}}</label>
                    </el-form-item>
                    <el-form-item label="端口:">
                      <label>{{popForm.port}}</label>
                    </el-form-item>
                    <el-form-item label="用户名:">
                      <label>{{popForm.user_name}}</label>
                    </el-form-item> -->
                  </el-form>
                </el-popover>
                <el-tooltip v-show ="isShowDiv && dataSrcValue.dsId !== 'demodb'" class="item" effect="dark" content="属性" placement="top">
                  <i class="left-opt-icon icon-A10562_prompt" v-popover:popover></i>
                </el-tooltip>
              </span>
            </div>
            <div class="schema-select" v-if="isShowDiv && dataSrcValue.dsId !== 'demodb'">
              <div class="col-title">
                <span class="icon-A10349_dispatching"></span>
                <label>{{schemaTip}}</label>
              </div>
              <el-select
                filterable
                v-model="schemaValue"
                placeholder="请选择用户模式"
                :filter-method="filterSchema"
                @change="schemaSelChange"
                size="mini"
                style="width:190px;"
                id="schemaSelect"
                @visible-change="scrollFixed($event,'schema-scroll')"
              >
                <div class="datas-opt main-content-tool schema-scroll">
                  <div class="tool-btn" @click="getSchemaList">
                    <span class="icon-A10280-refresh tool-btn-icon"></span>
                    <span class="tool-btn-text">刷新</span>
                  </div>
                </div>
                <el-option
                  v-for="(item,index1) in schemaList"
                  :key="item"
                  :label="item"
                  :value="item"
                ></el-option>
                <div style="height:25px;min-width:200px"></div>
                <div slot="empty">
                  <div style="height:25px;min-width:200px"></div>
                  <div
                    class="datas-opt main-content-tool"
                    style="height: 25px;background: #fff;line-height: 29px;"
                  >
                    <div class="tool-btn" @click="getSchemaList">
                      <span class="icon-A10280-refresh tool-btn-icon"></span>
                      <span class="tool-btn-text">刷新</span>
                    </div>
                  </div>
                </div>
              </el-select>
            </div>
          </div>
        </div>
        <div class="data-tables">
          <div class="col-title">
            <span class="icon-A10465_Form"></span>
            <label>表</label>
          </div>
          <el-input
            class="input-search"
            placeholder="输入关键字搜索"
            prefix-icon="el-icon-search"
            v-model="filterText"
            size="mini"
          ></el-input>
          <div
            class="tables-detail"
            v-loading="loadingTabList"
            element-loading-background="#2f5377"
            v-scrollloadmore="{domClass:'.tables-detail .el-scrollbar__wrap',callBack:loadMoreTable}"
          >
            <el-scrollbar style="height:100%;" :native="false" :noresize="false" tag="section">
              <!-- 主表只能拖一次 -->
              <!-- @click.prevent="updateTopoTabActive(item.tab_id+'-'+schemaValue)" -->
              <!-- <draggable
                :sort="false"
                v-model="cur_condiData"
                class="query-condi"
                style="min-height:200px;"
                :options="{group:{name:'people',pull:'clone'},filter:'.dis-draggable'}"
                :clone="cloneTabItem"
                :move="itemOnMove"
              >
                
                
              </draggable> -->
              <el-tag
                  v-for="(item,index2) in cur_condiData"
                  @dblclick.native="addTabToEditor(item)"
                  v-bind:class="{dl_col:item.element_type != 1?true:false,active:topoTabActive.split('-')[0]===item.tab_id && topoTabActive.split('-')[1]===schemaValue,'dis-draggable':mainTabId == item.tab_id}"
                  v-bind:key="item.tab_id"
                  :tid="item.tab_id"
                >
                  <span class="col-span" :title="item.phy_tab_name">
                    <span v-if="!isShowDiv && dataSrcValue.dsId !== 'demodb'">{{ item.tab_chs_name }}</span>
                    <span v-else>{{ item.phy_tab_name }}</span>
                  </span>

                  <span style="float:right">
                    <el-tooltip class="item" effect="dark" content="预览" placement="top-start">
                      <i class="opt-btn icon-A10608_attention" @click="previewEntity(item,'')"></i>
                    </el-tooltip>
                  </span>
                </el-tag>
            </el-scrollbar>
          </div>
        </div>
        <!-- 左侧实体预览 -->
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
      <div v-show="entityColsData.tableAttr.data.length > 0" style="height:22px">{{viewTip}}</div>
      <div id="dsetPreivewTbWrap">
        <el-table
          border
          size="mini"
          ref="table"
          height="100%"
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
    </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from "vuex";
import draggable from "vuedraggable";
import { objDeepCopy, objClone, mapDataSetInfoKey} from "@/utils/comonFunc.js";

export default {
  components: {
    draggable
  },
  data() {
    return {
      viewTip:'',
      realTabChsName:[],
      loading: false,
      className: "",
      isShowDiv: true,
      toSaveInput: false,
      schemaTip: "请选择",
      resourceName: "",
      dataSetName: "",
      dataResourceName: "大数据业务信息库",
      dataResourceNameBak: "大数据业务信息库",
      filterText: "",
      index: 0,
      activeNum: 0,
      slideVisiable: true,
      entityData: [],
      cur_condiData: Object.freeze([]),
      cur_condiDataBak: Object.freeze([]), //当前所有未过滤的表集合
      entityPageSize: 50, //左侧表分页条数
      entityCurPage: 1, //左侧表分页当前页
      isHideTop: false,
      bodyHeight: document.body.clientHeight,
      popVisible: false,
      pop3Visible: false,
      pgDataName:"",//pg数据名称
      connId: "",
      table1Data: Object.freeze([]),
      table2Data: Object.freeze([]),
      table1DataOri: [],
      table2DataOri: [],
      dataSource: [
        {
          label: "数据资产",
          children: [
            {
              label: "Hive"
            },
            {
              label: "Oracle"
            }
          ]
        },
        {
          label: "API服务"
        },
        {
          label: "本地文件",
          children: [
            {
              label: "EXCEL"
            },
            {
              label: "CSV"
            },
            {
              label: "TXT"
            }
          ]
        }
      ],
      popForm: {
        db_name: "大数据业务信息库", //数据库名称
        db_version: "", //数据库版本
        srcType: "Oracle", //数据源类型
        ip_address: "", //ip地址
        port: "", //ip端口
        user_name: "" //用户名
      },
      datasetPopFormItem:[
        {
          label: '数据库名称',
          class: 'd-popover-name',
          value: 'db_name'
        },
        {
          label: '数据源类型',
          class: '',
          value: 'srcType'
        },
        {
          label: '数据库版本',
          class: '',
          value: 'db_version'
        },
        {
          label: '数据库地址',
          class: '',
          value: 'ip_address'
        },
        {
          label: '端口',
          class: '',
          value: 'port'
        },
        {
          label: '用户名',
          class: '',
          value: 'user_name'
        },
      ],
      popFormItem:[],
      timeOptions: Object.freeze([
        {
          value: "",
          label: "默认"
        },
        {
          value: "YYYY-MM",
          label: "YYYY-MM"
        },
        /*{
          value: "YYYY/MM",
          label: "YYYY/MM"
        },*/
        {
          value: "YYYY-MM-DD",
          label: "YYYY-MM-DD"
        }
        /*{
          value: "YYYY/MM/DD",
          label: "YYYY/MM/DD"
        },
        {
          value: "YYYY-MM-DD hh:mm:ss",
          label: "YYYY-MM-DD hh:mm:ss"
        },
        {
          value: "YYYY/MM/DD hh:mm:ss",
          label: "YYYY/MM/DD hh:mm:ss"
        }*/
      ]),
      showContext: false,
      fieldFilterText: "",
      contextMenuVal: {
        isHide: false,
        timeVal: "YYYY-MM-DD"
      },
      // 字段描述弹窗
      fieldAttrDialogVisible: false,
      fieldAttrRadio: 2,
      fieldAttrForm: {
        alias: "",
        physiName: "brand_id",
        description: "品牌"
      },
      entityDialogVisible: false,
      countId: 0,
      fieldAttrFormRules: {
        alias: [{ validator: this.checkAlias, trigger: "blur" }]
      },
      frameId: "F00000000002",
      curAfId: "",
      curSubjectId: "",
      dateFormatFilter: ["number", "decimal"], // 允许进行日期格式化的字段类型  "date",
      loadingFieldTab: false,
      dialogSaveAs: false,
      topoAreaMinH: 60,
      deleteDialog: false,
      delText: "",
      toDelItem: null,
      isFirstWrap: false,
      mainTabId: "", //主表id
      parentTabInfo: {},
      // allFieldsMap: Object.freeze(new Map()),
      prevLoading: false,
      tabAliasCounter: 0, // 实体拓扑图实体别名计数器
      loadingTabList: false,
      ConnPopVisible: false,
      dimDialogVisible: false, //维度选择
      dimLoading: false, //维度选择
      dimDesensePopVis:false,//维度脱敏设置弹出框
      measureDesensePopVis:false,//度量脱敏设置弹出框
      dimData: [],
      pageQuery: {
        start: 1,
        pageCount: 10
      },
      dimTotal: 0,
      searchForm: {
        pageName: "",
        status: "",
        updateTime: ""
      },
      /**
       * 用来代表维度名称
       */
      myDimName: "",
      getRowKeys(row) {
        //用于行拖拽
        return (
          row.tab_alias +
          "_" +
          row.col_chs_name +
          "_" +
          row.is_copy +
          "_" +
          row.element_name +
          "_" +
          row.col_name +
          "-" +
          row.col_id
        );
      },
      // 时间格式设置
      dateRadio: "0",
      dateConfigForm: {
        sourceFormat: "",
        targetFormat: "-1"
      },
      sourceFormatOptions: Object.freeze([
        {
          value: "YYYYMMDDHHMISS",
          label: "YYYYMMDDHHMISS"
        },
        {
          value: "YYYYMMDD",
          label: "YYYYMMDD"
        },
        {
          value: "YYYYMM",
          label: "YYYYMM"
        },
        {
          value: "YYYY",
          label: "YYYY"
        }
      ]),
      dateConfigFormRules: {
        sourceFormat: [
          { required: true, message: "请选择源数据格式", trigger: "change" }
        ]
      },
      timeFormatDialog: false,
      computedDialogVis: false,
      datasetfilterDialogVisible: false,
      rule_group_list: [],
      editField: {},
      editFieldIdx: -1,
      dataSrcValue: "", //数据源下拉框值
      dataSrcFilterText: "", //数据源下拉框搜索条件
      allDataSrc: [], //数据源下拉数据
      allDataSrcCopy: [], //数据源下拉数据备份
      isDatasetQuery: false, //如果是数据集编辑状态，标识是否已请求过数据集信息
      fieldTypeList: {}, //数据库字段类型
      computedFieldCType: {
        //不同数据库类型 保存的计算字段类型
        oracle: "NUMBER",
        gbase: "DECIMAL",
        hive: "DECIMAL",
        mysql: "DECIMAL"
      },
      entitysTotal: 0, //资产 实体列表总条数
      entityScrollFlag: true, //资产 实体列表滚动加载请求flag (用于节流处理，不然滚动多次会触发多次请求)
      dateFormatList: [], //源时间格式列表
      encryptList: [], //加密策略类型列表
      cpFieldDelTip: "该字段已参与实体关系拓扑设置，请先取消，再删除！", //已参与关联的计算字段提示
      cpFieldInfo: {}, //复制计算字段的相关信息
      schemaList: [], //数据库实例名列表
      schemaListall: [], //每次查询备份数据
      schemaValue: "", //数据库模式下拉数据
      schemaConnIdMap: {}, //connid与schema映射数据
      datasetPriv: 1,
      isSQLEditorShow: false, // 是否展示sql编辑器
      dataPrivPropVis: false,//权限标签设置悬浮框
      privTagList: [],//用户归属企业下的所有权限标签列表
      privTagSetList: [] //当前数据集所有字段已设置标签权限集合
      // viewTip:'',
      // realTabChsName:[],
      // dataSrcValue: "", //数据源下拉框值
      // dataSrcFilterText: "", //数据源下拉框搜索条件
      // allDataSrc: [], //数据源下拉数据
      // allDataSrcCopy: [], //数据源下拉数据备份
      // popFormItem:[],
      // isShowDiv: true,
      // schemaTip: "请选择",
      // schemaList: [], //数据库实例名列表
      // schemaListall: [], //每次查询备份数据
      // schemaValue: "", //数据库模式下拉数据
      // schemaConnIdMap: {}, //connid与schema映射数据
      // cur_condiData: Object.freeze([]),
      // cur_condiDataBak: Object.freeze([]), //当前所有未过滤的表集合
      // prevLoading: false,
      // entityDialogVisible: false,
      // loadingTabList: false,
      // filterText: "",
      // pgDataName:"",//pg数据名称
      // connId: "",
    }
  },
  computed: {
    ...mapState({
      datasetUrl: state => state.datasetUrl,
      treeData: state => state.HomeTree.treeData,
      dataSetCache: state => state.DataSetMgt.dataSetCache,
      dgwMsUrl: state => state.dgwMsUrl,
      dsSysMsUrl: state => state.dsSysMsUrl,
      cctSysMs: state => state.cctSysMs,
      entityType: state => state.commonProperties.entityType, //获取实体列表类型(7-his表   0-正式表)
      myFolder: state => state.commonProperties.myFolder,
      entityColsData: state => state.DataSetMgt.entityColsData,
      renderEngine: state => state.renderEngine,
      dataSetType: state => state.DataSetDesign.dataSetType,
      defaultSystemId: state => state.defaultSystemId,
      topoTabActive: state => state.DataSetDesign.topoTabActive,
      fieldDatas: state => state.DataSetDesign.fieldDatas,
      checkedFields: state => state.DataSetDesign.checkedFields,
      connLeftSelOption: state => state.DataSetDesign.connLeftSelOption,
      connRightSelOption: state => state.DataSetDesign.connRightSelOption,
      curSelConnInfo: state => state.DataSetDesign.curSelConnInfo,
      activeConn: state => state.DataSetDesign.activeConn,
      edcPubMsUrl: state => state.edcPubMsUrl,
      PADDINGBOTTOM: state => state.PADDINGBOTTOM,
      datasourcePriv: state => state.commonProperties.datasourcePriv, //数据源类型显示块
      fieldDatasOri: state => state.DataSetDesign.fieldDatasOri, //点击拓扑图实体图标打开的原始字段列表
      filterTabfieldText: state => state.DataSetDesign.filterTabfieldText, //点击拓扑图实体图标打开的原始字段列表 过滤输入框
      userModeTip: state => state.DataSetDesign.userModeTip ,//区分各种数据库模式 提示语常量
      dataModeTip: state => state.DataSetDesign.dataModeTip ,//区分各种数据库模式 提示语常量
      shemaModeTip: state => state.DataSetDesign.shemaModeTip //区分各种数据库模式 提示语常量
    }),
    dataSrcWidth() {
      return this.dataSrcValue.dsId === 'demodb' || this.dataSrcValue.dsId === 'localdb' ? 220 : 190
    },
    // 当前数据源所属类型 "dataasset":资产 ,"database":自定义 数据库
    curResourceTypeId() {
      return this.dataSrcValue.parentResourceTypeId || "";
    }
  },
  mounted() {
    this.getAllDataSrc();
  },
  methods: {
    ...mapMutations({
      // setTreeList: "HomeTree/setTreeList",
      upDataSrcDialogVis: "DataSetMgt/upDataSrcDialogVis",
      // setDatasetType: "DataSetDesign/setDatasetType"
    }),
    ...mapActions({
      getDataEntity: "DataSetMgt/getDataEntity",
      upEntityColsData: "DataSetMgt/upEntityColsData",
      entityParams: "DataSetMgt/entityParams",
      queryTreeData: "HomeTree/queryTreeData",
      queryEntityFields: "DataSetDesign/queryEntityFields",
      getTabInfo: "DataSetMgt/getTabInfo",
      updateTopoTabActive: "DataSetDesign/updateTopoTabActive",
      updateFieldDatas: "DataSetDesign/updateFieldDatas",
      updateIsIndeterminate: "DataSetDesign/updateIsIndeterminate",
      updateCheckAll: "DataSetDesign/updateCheckAll",
      updateCheckedFields: "DataSetDesign/updateCheckedFields",
      updateFilterTabfieldText: "DataSetDesign/updateFilterTabfieldText",
      updateFieldDatasOri: "DataSetDesign/updateFieldDatasOri",
      updateAllFieldsMap: "DataSetDesign/updateAllFieldsMap",
      updateConnLeftSelOption: "DataSetDesign/updateConnLeftSelOption",
      updateConnRightSelOption: "DataSetDesign/updateConnRightSelOption",
      updateJoinExpList: "DataSetDesign/updateJoinExpList",
      updateCurSelConnInfo: "DataSetDesign/updateCurSelConnInfo",
      updateActiveConn: "DataSetDesign/updateActiveConn",
      updateConnPopVisible: "DataSetDesign/updateConnPopVisible",
      addOptlog: "compt/addOptlog", //添加预览日志
      setDataSetCache: "DataSetMgt/setDataSetCache", //使用vuex缓存数据
      queryDataSource: "DataSetMgt/queryDataSource", //数据源列表查询
      queryEntityList: "DataSetDesign/queryEntityList", //查询左侧表集合
      queryDbTbData: "DataSetDesign/queryDbTbData", //数据源 左侧表数据预览
      queryTbFields: "DataSetDesign/queryTbFields", //查询表字段
      saveDataSetInfo: "DataSetDesign/saveDataSetInfo", //保存数据集
      getDataSetInfo: "DataSetDesign/getDataSetInfo", //查询数据集信息
      queryDbColConf: "DataSetDesign/queryDbColConf", //查询数据库字段类型
      queryDateFormatList: "DataSetDesign/queryDateFormatList", //获取时间格式串列表
      queryEncryptList: "DataSetDesign/getDicValue", //获取加密策略类型列表
      updateDateFormatPopVisible: "DataSetDesign/updateDateFormatPopVisible",
      querySchemaList: "DataSetDesign/querySchemaList",
      setDatasetType: "DataSetDesign/setDatasetType",
      queryAfByVerNo: "PageDesign/queryAfByVerNo",
      getUserTagPriv: "DataSetDesign/getUserTagPriv"
    }),
    scrollFixed(bool,name){
      if(bool){ //数据源和跨库资源下拉框出现的时候调整scrolltop大小，让选的值不会被遮挡
        setTimeout(() => {
          let dom = document.querySelector("."+name).parentElement.parentElement;
          let topVal = dom.scrollTop;
          if(topVal>0){
            topVal += 30;
            dom.scrollTo(0,topVal);
          }
        }, 0);
      }
    },
    schemaSelChange(value) {  //模式更新
      let dataSource = this.dataSrcValue;
      this.confirmChange(this.pgDataName,dataSource, 'noclean');
    },
    dataSrcSelChange(value) {
      //区分数据库模式提示语  add czl by 2020.04/26
      if(value.resourceTypeId === "oracle" ){
          this.schemaTip = this.userModeTip;
      }else if(value.resourceTypeId === "gbase" || value.resourceTypeId === "mysql"){
           this.schemaTip = this.dataModeTip;
      }else{
          this.schemaTip = this.shemaModeTip;
      }
      // 变更数据源需要刷新当前页面
      if (value != "") {
        this.realTabChsName = [];//清空表集合
        this.dataResourceNameBak = value.dsName;
        if((value.parentResourceTypeId === "dataasset" || value.parentResourceTypeId === "database") && value.isDemo === '0'){
          this.isShowDiv = true; //显示模式下拉
          if (value.parentResourceTypeId === "dataasset") {
            this.connIdBak = value.dsId;
          }

          // 切换数据源的时候分页重置为第一页,列表数据重置
          this.entityCurPage = 1;
          this.cur_condiData = Object.freeze([]);
          this.cur_condiDataBak = Object.freeze([]);
          this.$nextTick(() => {
            //确保滚动条已经恢复到原来的位置
            this.filterDataSrc("");
            this.confirmChange(value);
            this.getSchemaList('setValue');
          });
        }
        else{//本地上传和案例数据库
          let dbuser = (this.dataSrcValue.paramList || []).filter(item0 => {
              return item0.paramName === "user_name";
          });
          //隐藏用户模式下拉
          this.isShowDiv = false;
          this.schemaValue = dbuser[0].paramValue;
          this.getEntityList('',value,'');

        }
      }
    },
    //获取数据源信息
    getAllDataSrc() {
      this.queryDataSource({
        tenantId: window.sessionStorage.getItem("tenant_id") || "34234234",
        showTipFlag: "1"  //显示为本地上传
      })
        .then(response => {
          if (response.data.respResult == 1) {
            this.allDataSrcCopy = Object.freeze(
              objDeepCopy(response.data.respData || [])
            );
            this.allDataSrc = Object.freeze(response.data.respData || []);
            if (
              this.allDataSrcCopy.length > 0 &&
              this.connId != "" &&
              this.allDataSrcCopy.some(item => {
                return this.connId == item.dsId;
              })
            ) {
              this.dataSrcValue = this.allDataSrcCopy.filter(item => {
                return this.connId == item.dsId;
              })[0];
              this.setPopFormData();
            }
            if (
              this.dataSetCache &&
              this.dataSetCache.datasetId != "" &&
              this.dataSetCache.datasetId != undefined &&
              !this.isDatasetQuery
            ) {
              //如果是编辑页面初始进来，要查询数据集信息
              this.curAfId = this.dataSetCache.datasetId;
              // this.queryDataSet();
              if(this.dataSetCache.verNo){
                this.activatedCode();
              }else{
                this.queryDataSet();
              }
            }
          } else {
            this.$message.error("数据源列表加载失败");
          }
        })
        .catch(err => {
          // this.$message.error("数据源列表加载失败");
        });
    },
    toAddDataSrc() {
      document.getElementById("dataSrcSelect").click();
      this.upDataSrcDialogVis(true);
    },
    // 刷新数据源
    refreshDataSrc() {
      this.getAllDataSrc();
    },
    // 数据源下拉框静态搜索
    filterDataSrc(val) {
      val = val.trim();
      if (val) {
        //val存在
        this.allDataSrc = Object.freeze(
          this.allDataSrcCopy.filter(item => {
            if (
              !!~item.dsName.indexOf(val) ||
              !!~item.dsName.toUpperCase().indexOf(val.toUpperCase())
            ) {
              return true;
            }
          })
        );
      } else {
        //val为空时，还原数组
        this.allDataSrc = Object.freeze(this.allDataSrcCopy);
      }
    },
    filterSchema(val) {
      val = val.trim();
      if (val) {
        this.schemaList = this.schemaListall.filter(item=>{
          if (
            !!~item.indexOf(val) ||
            !!~item.toUpperCase().indexOf(val.toUpperCase())
          ) {
            return true;
          }
        })
      } else {
        this.schemaList = this.schemaListall;
      }
    },
    // 加载实体表
    loadEntityData() {
      let tempData = [],
        arrLen = this.cur_condiDataBak.length;
      let start = (this.entityCurPage - 1) * this.entityPageSize,
        end = start + this.entityPageSize;
      if (this.cur_condiData.length !== arrLen && arrLen !== 0) {
        tempData = this.cur_condiDataBak.filter((item, index) => {
          return index < end && index >= start;
        });
      }
      if (this.entityCurPage === 1) {
        //第一页
        this.cur_condiData = Object.freeze(tempData);
      } else {
        this.cur_condiData = Object.freeze(this.cur_condiData.concat(tempData));
      }
    },
    // 滚动加载实体列表
    loadMoreTable() {
      // 直连数据源，表是全部查回来，然后再静态分页；资产的连接是分页查询
      switch (this.curResourceTypeId) {
        case "dataasset":
          /* if (
            this.cur_condiData.length < this.entitysTotal &&
            this.entityScrollFlag
          ) {
            this.entityCurPage++;
            this.entityScrollFlag = false;
            this.getEntityList(this.filterText, this.dataSrcValue);
          }
          break; */
        case "localdb":
        case "database":
          if (this.cur_condiData.length !== this.cur_condiDataBak.length) {
            this.entityCurPage++;
            this.loadEntityData();
          }
          break;
        default:
          break;
      }
    },
    getSchemaList(operate){
      let param = {};
      let dataSource = (this.dataSrcValue||{}).dsId;
      if(!dataSource){
        this.schemaList = [];
        return;
      }
      this.schemaValue = "";
      let curDataSrc = this.dataSrcValue;
      if (curDataSrc.parentResourceTypeId === "dataasset") {
        //资产
        param = {
          // conn_id: this.connId
          connId: curDataSrc.dsId,
          dsType:curDataSrc.dsType,
          type: 'dataasset'
        };
      } else {
        //自定义数据源
        if(curDataSrc.parentResourceTypeId === "localdb"){
          //根据数据源获取数据库类型

          let pars = this.dataSrcValue;
          for(var c = 0 ; c < this.allDataSrc.length ; c++){
              if(this.allDataSrc[c].dsId == 'localdb'){
                  pars = this.allDataSrc[c].paramList;
                  break;
              }
          }

          for(var x = 0 ; x < pars.length ; x++){
            if(pars[x].paramName == 'db_type'){
               curDataSrc.dsType = pars[x].paramValue;
               break;
            }
          }

          // curDataSrc.dsType = 'oracle';
        }
        //sqlserver数据库
        if(curDataSrc.resourceTypeId === "sqlserver" || curDataSrc.resourceTypeId === "vertica"){
          let pars = this.dataSrcValue.paramList;
          for(var k = 0 ; k < pars.length ; k++){
            if(pars[k].paramName == 'db_name'){
              //sql需要指定对应数据库名
               curDataSrc.dbName = pars[k].paramValue;
               break;
            }
          }
        }
        param={
          dsId: curDataSrc.dsId,
          dsType:curDataSrc.dsType,
          type: 'database'
        }
      }
      this.querySchemaList(param).then(resp=>{
        if (resp.status === 200 && resp.data.respResult === '1') {
          let respData =  resp.data.respData || [];
          if(respData[0].connId){  //数据资产
            let schemaMap = {}
            let arry = [];  //去重构造{connid,schema}数组
            respData.forEach(val=>{
              schemaMap[val.userMode] = val.connId;
            })
            for(let key in schemaMap){
                arry.push(key);
            }
            this.schemaConnIdMap = schemaMap;
            this.schemaList = arry;
          }else{  //数据库
            this.schemaList = [];//清空
            if(curDataSrc.dsType === 'postgresql' || curDataSrc.dsType === 'greenplum'){    //pg,gp库需要类型
               this.schemaList = respData[0].schemaNameList;
            }else if(curDataSrc.dsType === 'sqlserver' || curDataSrc.dsType === 'vertica'){ //sqlserve 特殊处理
              let dname = curDataSrc.dbName;
               for(var p = 0 ; p < respData.length ; p++ ){
                 if(respData[p].dbName === dname){
                    this.schemaList = respData[p].schemaNameList;
                 }
              }
            }
            else{  //其他数据库类型就是其用户模式
              for(var q = 0 ; q < respData.length ; q++ ){
                  this.schemaList.push(respData[q].dbName);
              }
              //  this.schemaList = respData;
            }
          }
          this.schemaListall = objDeepCopy(this.schemaList);
          if(operate==='setValue'){
            let schema = this.schemaList[0] || "";
            if(this.dataSrcValue.paramList && this.dataSrcValue.paramList.length>0){    //如果是oracle下面选择与库名相同名称的模式
              var userName = this.dataSrcValue.paramList.filter(val=>{
                  return val.paramName=='user_name';
              })
              schema = userName[0].paramValue;
            }
            if(curDataSrc.dsType === 'postgresql' || curDataSrc.dsType === 'greenplum'){ //pg数据库
               this.pgDataName = respData[0].dbName;//数据库名
              schema = respData[0].schemaNameList[0]; //数据库模式第一个
              //  let scName = '';
              //  for(var i = 0 ; i < respData[0].schemaNameList.length ; i++){
              //       if(respData[0].schemaNameList[i] == 'public'){ //表示有public
              //         scName = 'public';
              //         break;
              //       }
              //  }
              //  if(scName === ''){
              //      schema = respData[0].schemaNameList[0]; //数据库模式第一个
              //  }else{
              //    schema = scName;
              //  }

            }else if(curDataSrc.dsType === 'sqlserver' || curDataSrc.dsType === 'vertica'){ //sqlserve特殊处理
                let pars = this.dataSrcValue.paramList;
                for(var x = 0 ; x < pars.length ; x++){
                  if(pars[x].paramName == 'db_name'){
                    //sql需要指定对应数据库名
                      this.pgDataName = pars[x].paramValue;
                  }
                }
                //根据数据库名获取对应数据第一个模式
                for(var g = 0 ; g < respData.length ; g++){
                    if(respData[g].dbName == this.pgDataName){ //表示有public
                      schema = respData[g].schemaNameList[0];
                      console.info(schema);
                      break;
                    }
               }

            }
            else{
              this.pgDataName = "";
            }
            //"" ，传递库名，用户模式(兼容带数据库模式的)
            this.schemaValue = schema;
            this.getEntityList("",this.dataSrcValue,this.pgDataName);
          }
        }else{
          this.$message.error(resp.data.respErrorDesc);
        }
      }).catch(err=>{
        console.error(err);
      })
    },
    getEntityList(val, curDataSrc,pgDataName) {  //添加pg数据库名称参数
      if(!this.schemaValue){
        return;
      }
      this.loadingTabList = true;
      let param = {};
      if (curDataSrc.parentResourceTypeId === "dataasset") {   //资产
        //资产
        /* param = {
          conn_id: this.connId || "D8CF9DC45FD11433981359E0E0A911E8",
          is_query_detail: "0",
          tenant_id: window.sessionStorage.getItem("tenant_id") || "34234234",
          key: (val || "").trim(),
          ext_query_type: this.entityType,
          start_page: this.entityCurPage,
          page_count: this.entityPageSize,
          schema: this.schemaValue
        }; */

        param = {
          dgwConnId: this.connId,
          dataAssetConnId:this.schemaConnIdMap[this.schemaValue],
          userMode: this.schemaValue,
          keyWord: (val || "").trim()
        };
      }else if(curDataSrc.parentResourceTypeId === "localdb"){ //本地上传
        let paramList = curDataSrc.paramList;
        let tableSchema = "";//数据库模式
        let dsDbType = "";
        //获取数据库模式
        for (let index = 0; index < (paramList || []).length; index++) {
          const element = paramList[index];
          if (element.paramName === "user_name") {
            tableSchema = element.paramValue;
            break;
          }
        }

        for (let index = 0; index < (paramList || []).length; index++) {
            const element = paramList[index];
            if (element.paramName === "tns") {
                dsDbType = element.paramValue.split(":")[1];
                break;
            }
        }
        //设置资源类型
        this.dataSrcValue.resourceTypeId = dsDbType;
        this.dataSrcValue.dsType = dsDbType;

        param = {
          dsId: 'localdb',  //固定
          key: (this.filterText || "").trim(),
          schema: tableSchema,
          schemaName:""
        };
      }
      else {  //自定义数据源
          if(pgDataName!=null && pgDataName!=''){ //pg库获取表字段走分支判断 add czl 2020/04/26
              param = {
              dsId: curDataSrc.dsId,
              key: (this.filterText || "").trim(),
              schema:pgDataName,
              schemaName:this.schemaValue
            };
          }else{ //其他库类型
            param = {
              dsId: curDataSrc.dsId,
              key: (this.filterText || "").trim(),
              schema: this.schemaValue,
              schemaName:""
            };
          }
      }
      this.queryEntityList({
        type: curDataSrc.parentResourceTypeId,
        param: param
      })
      .then(response => {
        var data = response.data.respData;
        if (response.data.respResult == 1 && data && data.length > 0) {
          if (this.curResourceTypeId == "dataasset") {
            //资产的实体列表要记录总条数
            this.entitysTotal = response.data.dataTotalCount;
          }
          // 如果是数据库，还要处理过滤条件
          let newData = this.formatEntityData(data);
          if (
             curDataSrc.parentResourceTypeId === "localdb" ||
            curDataSrc.parentResourceTypeId === "database" ||
            (curDataSrc.parentResourceTypeId === "dataasset" &&
              this.entityCurPage == 1)
          ) {
            this.dealEntityData(newData);
          } else {
            this.cur_condiData = this.cur_condiData.concat(newData);
            this.entityScrollFlag = true;
          }
        } else {
          // this.$message.success("数据源表集合为空");
          this.dealEntityData([]);
        }
      })
      .catch(error => {
        console.error(error);
        // this.$message.error("数据源表集合加载失败");
      })
      .finally(() => {
        this.loadingTabList = false;
      });
    },
    dealEntityData(data) {
      this.cur_condiDataBak = Object.freeze(data);
      this.entityCurPage = 1;
      this.cur_condiData = [];
      // 刷新实体表数据时滚动条重置到初始位置
      let selectorObj = document.querySelector(
        ".tables-detail .el-scrollbar__wrap"
      );
      if (typeof selectorObj.scrollTo === "function") {
        selectorObj.scrollTo(0, 0);
      }
      this.loadEntityData();
    },
    previewBaseEntity(tableInfo) {
      let _this = this;
      let dataSrc = this.dataSrcValue;
      let dsDbVersion = "";
      let dsDbType = "";//数据库类型
      for (let index = 0; index < (dataSrc.paramList || []).length; index++) {
        const element = dataSrc.paramList[index];
        if (element.paramName === "db_version") {
          dsDbVersion = element.paramValue;
          break;
        }
      }

      if(dataSrc.dsId === 'localdb'){  //本地数据库
           for (let index = 0; index < (dataSrc.paramList || []).length; index++) {
              const element = dataSrc.paramList[index];
              if (element.paramName === "tns") {
                  dsDbType = element.paramValue.split(":")[1];
                  break;
              }
            }
      }else{
        dsDbType = dataSrc.dsType;
      }
      let dname = '';
      //sqlserve特殊处理
      if(dsDbType === 'sqlserver' || dsDbType === 'vertica' ){
          let pars = this.dataSrcValue.paramList;
          for(var x = 0 ; x < pars.length ; x++){
            if(pars[x].paramName == 'db_name'){
              //sql需要指定对应数据库名
              dname = pars[x].paramValue;
               break;
            }
          }
      }


      this.queryDbTbData({
        dsId: dataSrc.dsId,
        tableName: tableInfo.phy_tab_name,
        dsDbType: dsDbType,
        dsDbVersion: dsDbVersion,
        tableSchema: this.schemaValue,
        tableDbName:dname
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
        let prop = item.col_desc || item.col_id; //col_id可能会重复，所以用col_desc
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
          let itm = result_col_list[j].col_desc || result_col_list[j].col_id; //col_id可能会重复，所以用col_desc
          itm = itm.replace(/\./g, ""); //把里面的.去掉，不然el-table解析不出来
          // let itm = result_col_list[j].col_id;
          temp[itm] = rows[j].data_val + "  ";
        }
        ecdata.tableAttr.data.push(temp);
      });
      this.upEntityColsData(ecdata);
    },
    previewEntity(item, view) {
      if(view == 'designView'){
        this.viewTip = '最大显示100条数据，聚合字段不预览';
      } else {
        this.viewTip = '最大显示100条数据';
      }
      if(typeof(item)==="object"){
        item.tableSchema= this.schemaValue;
        if(item.entity_type === 'db2') { //db2数据库schma临时从db_user获取，20201031 by linqh
          item.tableSchema= item.db_user;
        }
        item.conn_id= this.schemaConnIdMap[this.schemaValue];
      }
      this.upEntityColsData({ columns: [], tableAttr: { data: [] } });
      //如果当前数据源是数据库类型数据源，调另一个接口
      if (
        this.dataSrcValue &&
        (this.curResourceTypeId === "database" || this.curResourceTypeId === "localdb") &&
        view !== "designView"
      ) {
        this.entityDialogVisible = true;
        this.prevLoading = true;
        this.previewBaseEntity(item);
        return;
      }

      // 没有设置关联条件
      // if (this.checkIfRelationSet() && view === "designView") {
      //   this.$message.warning("请完成关联条件设置");
      //   return false;
      // }
      this.entityDialogVisible = true;
      this.prevLoading = true;
      let columns = [];
      if (this.curAfId != "") {
        //表示数据集已经保存
        var pageParam = Object.assign({
          objId: this.curAfId,
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
      }

      if (view === "designView") {
        //设计中预览
        this.entityDialogVisible = true;
        var col_list = this.table1DataOri.concat(this.table2DataOri);
        item = {};
        item.col_list = col_list;
        item.view = view;

        col_list.map(list => {
          if (list.is_show == 1) {
            let name =
              list.show_type == "2"
                ? "col_chs_name"
                : list.show_type == 0
                ? "element_name"
                : "col_name";
            columns.push({
              label: list[name] || "",
              prop: list.col_id,
              "show-overflow-tooltip": true
            });
          }
        });

        let catalogId = "";
        if (this.dataSetCache && this.dataSetCache.catalogId) {
          catalogId = this.dataSetCache.catalogId || "";
        }
        var formattedData = this.formatDataBeforeSave(true);
        // 数据集信息
        const col_lists = formattedData.col_lists;
        const entity_lists = formattedData.entity_lists;
        for (let index = 0; index < col_lists.length; index++) {
          let lis = col_lists[index];
          lis.af_id = "";
          if (lis.is_show == 0) {
            col_lists.splice(index, 1);
            index--;
          }
        }
        let rule_group_list = objDeepCopy(this.rule_group_list);
        if (this.curResourceTypeId === "database" || this.curResourceTypeId === "localdb") {
          //直连数据库 没有tab_id，要把entity_lists里的tab_id都改成tab_alias
          entity_lists.forEach((item, index) => {
            entity_lists[index].tab_id = entity_lists[index].tab_alias;
          });
          col_lists.forEach((item, index) => {
            col_lists[index].tab_id = col_lists[index].tab_alias;
          });
          if (rule_group_list && rule_group_list.length > 0) {
            (rule_group_list[0].children || []).forEach((item, index) => {
              let idx1 = item.element_id.indexOf("split666888");
              if (idx1 > -1) {
                rule_group_list[0].children[index].element_id =
                  item.tab_alias + item.element_id.substring(idx1);
              } else {
                rule_group_list[0].children[index].element_id = item.tab_alias;
              }
            });
          }
        }
        let param = {
          anly_frame_info: {
            af_desc: this.dataSetName,
            af_id: "",
            af_id_list: [],
            af_name: this.dataSetName,
            af_status: "1",
            af_status_desc: "",
            af_status_list: [],
            af_type: "",
            anly_subject_id: this.curAfId == "" ? "" : this.curSubjectId,
            anly_subject_name: "",
            create_time: "",
            create_user: window.sessionStorage.getItem("user_id"),
            create_user_name: "",
            anly_frame_disposes: [],
            anly_frame_elements: col_lists,
            anly_frame_tab_infos: [],
            anly_frame_target_grps: [],
            catalogId: catalogId,
            conn_id: "",
            data_cycle: "",
            dispose_desc: "",
            dispose_type: "",
            dispose_type_list: [],
            frame_id: this.frameId,
            frame_id_list: [],
            frame_name: "",
            h_af_name: "",
            latest_date_time: "",
            orderBeans: [],
            page_count: 20,
            phy_chs_name: "",
            publish_time: "",
            publish_user: "",
            record_num_from: "",
            record_num_to: "",
            start: 0,
            storage_type: "",
            storage_type_list: [],
            sub_status: "",
            sub_status_desc: "",
            sub_target_object: "",
            subject_id: "",
            subject_id_list: [],
            subject_info: {
              af_name: "",
              bus_info: "",
              create_time: "",
              create_time_end: "",
              data_cycle: "",
              frame_id: "",
              frame_name: "",
              is_imp_type: "0",
              is_query_detail: "0",
              is_rule: "",
              key: "",
              max_record_num: "",
              min_record_num: "",
              oper_id: "",
              phy_tab_name: "",
              publish_time: "",
              publish_time_end: "",
              publish_user: "",
              rule_cond_type: "",
              subject_group: "",
              subject_id: "",
              subject_name: "",
              subject_status: "1",
              tab_chs_name: "",
              tab_rel_list: entity_lists,
              update_time: "",
              update_user: "",
              user_name: "",
              rule_group_list: rule_group_list
            },
            subject_name: "",
            tab_chs_name: "",
            tab_id: "",
            tenant_id: sessionStorage.getItem("tenant_id"),
            update_time: "",
            update_time_end: "",
            update_user: ""
          }
        };
        if (this.curResourceTypeId === "database" || this.curResourceTypeId === "localdb") {
          param["dgw_tables"] = this.genDgwTables(entity_lists);
        }
        if (this.privTagSetList.length > 0) {
          //0旧权限接口，1新权限接口内部方式，2新权限接口外部方式
          param.anly_frame_info["priv_pattern"] = "1"; //设计中预览，标签权限
        }
        item.param = param;
      }
      this.getPrevEntity(item, columns);
    },
    getPrevEntity(item, columns) {
      this.getDataEntity(item)
        .then(response => {
          this.$Watermark.set("dsetPreivewTbWrap", 0, 0, -40, 0, true);
          if (
            response.data.respResult == 1 &&
            response.status == 200 &&
            response.data.respData &&
            response.data.respData.is_success
          ) {
            this.handleEntityData(response);
          } else {
            if (
              !(response.data.respData || { is_success: false }).is_success &&
              columns.length == 0
            ) {
              this.$message.error("实体查询失败!");
            }
            this.upEntityColsData({
              columns: columns,
              tableAttr: { data: [] }
            });
          }
        })
        .catch(error => {
          console.error(error);
          // if (columns.length == 0) this.$message.error("实体查询失败！");
          this.upEntityColsData({ columns: columns, tableAttr: { data: [] } });
        })
        .finally(() => {
          this.prevLoading = false;
        });
    },
    closePreviewDialog() {
      //重置数据
      this.upEntityColsData({
        columns: [],
        tableAttr: { data: [] }
      });
    },
    itemOnMove(evt) {
      // return false; — for cancel
      // return -1; — insert before target
      // return 1; — insert after target
      // 限制不能A连A
      if (
        evt.to &&
        evt.to.parentNode &&
        evt.to.parentNode.children &&
        evt.to.parentNode.children.length > 0 &&
        evt.draggedContext.element.tab_id ==
          evt.to.parentNode.children[0].getAttribute("tid")
      ) {
        return false;
      }
    },
    cloneTabItem({
      tab_id,
      phy_tab_name,
      tab_chs_name,
      rel_tab_id,
      join_type,
      tab_schema,
      tab_join_exp_list

    }) {
      this.realTabChsName.push(tab_chs_name);// 将每一次拖入中文名称存入集合中
      let len = document.getElementsByClassName("tab-icon").length || 0;
      var colorClass = "";
      if (len < 8) {
        if (
          document.getElementsByClassName("tab-icon icon-A10465_Form clr" + len)
            .length == 0
        ) {
          colorClass = "clr" + len;
        } else {
          for (let index = 0; index < COLOR_ARRAY.length; index++) {
            if (
              document.getElementsByClassName(
                "tab-icon icon-A10465_Form " + COLOR_ARRAY[index]
              ).length == 0
            ) {
              colorClass = COLOR_ARRAY[index];
              break;
            }
          }
        }
      } else {
        len++;
        var remainder = len % 8;
        var multiple = (len - remainder) / 8;
        multiple++;
        for (let index = 0; index < COLOR_ARRAY.length; index++) {
          if (
            document.getElementsByClassName(
              "tab-icon icon-A10465_Form " + COLOR_ARRAY[index]
            ).length < multiple
          ) {
            colorClass = COLOR_ARRAY[index];
            break;
          }
        }
      }
      this.tabAliasCounter++;
      let falg = "1" ;  //默认显示
      if(!this.isShowDiv || this.dataSrcValue.isDemo === '1'){  //localdb
        falg = "0"
      }
      return {
        tab_id: tab_id,
        phy_tab_name: phy_tab_name,
        rel_tab_id: rel_tab_id,
        join_type: join_type,
        tab_join_exp_list: [],
        tab_rel_list: [],
        tab_alias: "t" + this.tabAliasCounter,
        color: colorClass,
        tab_schema: tab_schema,
        tab_chs_name:tab_chs_name,
        flag:falg
      };
    },
    setPopFormData() {
      let dataSrcValue = this.dataSrcValue || []
      let paramList = dataSrcValue.paramList || [];
      if(dataSrcValue.parentResourceTypeId == "dataasset") { // "数据资产"
        this.popFormItem = []
        this.popForm = []
        paramList.forEach((item,index) => {
          let label = item.paramDesc || item.paramName || ''
          let value = item.paramValue
          let key = item.paramName || `item${index}`
          let temp = {
            class: '',
            label,
            value: key
          }
          this.popFormItem.push(temp)
          this.popForm[key] = value
        });
      } else {
        this.popFormItem = [...this.datasetPopFormItem]
        let _this = this;
        _this.popForm["srcType"] = (_this.dataSrcValue || {})["dsType"];
        paramList.forEach(item => {
          if (
            ["ip_address", "port", "db_version", "db_name", "user_name"].includes(
              item.paramName
            )
          ) {
            _this.popForm[item.paramName] = item.paramValue;
          }
        });
      }
    },
    activatedCode(){
      if (this.dataSetCache != null) {
        this.loadingFieldTab = true;
        const _this = this;
        if(this.curResourceTypeId === 'localdb'){  //本地数据库设置
            //隐藏用户模式下拉    ---   相关数据库参数可以通过查服务获取
            this.isShowDiv = false;
            let dbuser1 = (this.dataSrcValue.paramList || []).filter(item0 => {
                return item0.paramName === "user_name";
            });
            this.schemaValue = dbuser1[0].paramValue;
            let pars = [];
            for(var s = 0 ; s < this.allDataSrc.length ; s++){
                if(this.allDataSrc[s].dsId == 'localdb'){
                    pars = this.allDataSrc[s].paramList;
                    break;
                }
            }

            for(var p = 0 ; p < pars.length ; p++){
              if(pars[p].paramName == 'db_type'){
                //解决编辑时候本地预览出错问题
                this.dataSrcValue.resourceTypeId = pars[p].paramValue;
                this.dataSrcValue.dsType = pars[p].paramValue;
                break;
              }
            }

            // this.getEntityList('',value,'');
        }

        var objId = this.dataSetCache.datasetId;
        var cid = 'dads';
        var pageParam = Object.assign({
          objId: objId,
          createUser: window.sessionStorage.getItem("user_id"),
          classTypeId: cid,
          objType: cid,
          verNo: this.dataSetCache.verNo,
          preViewFalg: "1", //1-记录操作日志标志    0-不记录操作日志
          isNeedDemo: this.dataSetCache.isDemo // 案例
        });
        this.queryAfByVerNo(pageParam)
          .then(async response => {
          var data = response.data.respData;
          if (response.data.respResult == 1 && data) {
            // 成功
            document.title = data.af_name || data.datasetName;
            data = mapDataSetInfoKey(data);
            if (_this.curResourceTypeId === "database" || _this.curResourceTypeId === "localdb") {
              //先把数据格式改成下划线的
              data = objClone(data, 2);
            }
            _this.dealDataSet(data);
            // _this.$message.error("数据集保存成功");
          } else {
            _this.$message.error("数据集详情查询失败");
          }
        })
        .catch(function(error) {
          console.error(error);
          _this.loadingFieldTab = false;
          // _this.$message.error("数据集详情查询失败");
        })
        .finally(() => {
          _this.loadingFieldTab = false;
          _this.isDatasetQuery = true;
        });
      } else {
        if (this.pageCache.isWatermark == 1) {
          this.$Watermark.set("water-wrap", 60, 20, -40, 0, flag);
        }
      }
    },
    formatEntityData(data) {   //设置格式化值
      /**
         * tab_id  1  String    实体编码
         col_id  1  String    字段
         col_id_exp  1  String    实体字段表达式  （存放有加函数时的完整表达式）
         rel_tab_id  1  String    关联表编码
         rel_col_id  1  String    关联表字段
         rel_col_id_exp  1  String    关联实体字段表达式  （存放有加函数时的完整表达式）
         */
      var newData = [];
      for (let index = 0; index < data.length; index++) {
        const element = data[index];
        newData.push({
          tab_id: element.tab_id || element.tabName,
          phy_tab_name: element.phy_tab_name || element.tabName, //数据库的表是tab_name
          tab_chs_name: element.tabAlias, //数据库表中文名
          rel_tab_id: "", //上级关联实体编码
          join_type: "2", //默认左连接
          tab_schema: this.schemaValue,
          entity_type: element.dispose_list ? element.dispose_list[0].entity_type : '', //返回数据存储的数据库
          db_user:  element.dispose_list ? element.dispose_list[0].db_user : '', //返回数据存储的数据库用户
          tab_join_exp_list: [
            //实体关联关系表达式
            // {
            //   tab_id: "",
            //   col_id: "",
            //   col_id_exp: "",
            //   rel_tab_id: "",
            //   rel_col_id: "",
            //   rel_col_id_exp: ""
            // }
          ],
          tab_rel_list: [] //实体关联关系列表
        });
      }
      return newData;
    },
    // 插入表名到编辑器
    addTabToEditor(item) {
      this.$emit("insertTableToEditor", item);
    }
  },
}
</script>

<style lang="scss">
// @import './../../../assets/css/datasetDesign.scss';
$font-clr1: #45fffd; //维度颜色
$main-bg: #2f5377; //设计区域背景色
$main-bg-design: #aaaaaa; // 设计区域背景色
$bg-clr1: #e4e7ee;
$main-bg1: #fff; // 设计区域内层背景
$font-main: #ffffff; //文字主色
$font-main2: #afc0d0;
$font-main3: #606266;
$border-clr2: #0a2b4c;
$input-bg-clr1: #0e3b67; // 输入框背景色
$hight-light-clr1: #45fffd; //高亮颜色
$main-color: #409eff; //主色调
$font-clr1: #fff; // 文字颜色1
$header-main-clr: #0a2b4c; // 头部背景色
$border-clr1: #0e3b67; // 输入框边框色
$font-clr2: #3f678d; // 输入框字体颜色
$icon-btn-disabled: #c0c4cc; //字体图标操作按钮禁用
$bd-clr1: #dcdfe6;
.col-title {
  color: $font-clr1;
}

.col-title label {
  padding-left: 5px;
}

.col-title span {
  font-size: 12px;
}

#app .el-tooltip__popper {
  padding: 4px 6px;
}

html {
  overflow: hidden;
}

.table-page {
  text-align: right;
  margin-top: 10px;
}

#dsetPreivewTbWrap {
  position: relative;
}

// 数据源选择下拉框附加选项
.main-content-tool {
  text-align: right;
}
.main-content-tool .tool-btn {
  cursor: pointer;
  margin-left: 20px;
  display: inline-block;
}
.main-content-tool .tool-btn .tool-btn-icon {
  color: #409eff;
  margin-right: 5px;
}
.main-content-tool .tool-btn .tool-btn-text {
  position: relative;
  top: -1px;
  color: #000;
}
.datas-opt {
  position: absolute;
  bottom: 0px;
  width: 100%;
  z-index: 999;
  padding-right: 18px;
  margin: 0;
  height: 34px;
  line-height: 35px;
  border-bottom-left-radius: 3px;
  border-bottom-right-radius: 3px;
  background-color: #e4e7ee;
}

.main-content-tool .tool-btn:hover .tool-btn-text {
  color: #409eff;
}
.dateFormat-popover {
  left: 155px;
  top: -2px;
  height: 198px;
  width: 212px;
  font-size: 12px;
  overflow-y: auto;
}
.dateFormat-popover ul li span {
  margin-left: 4px;
}
.dateFormat-popover ul li:hover {
  background-color: #f5f7fa;
}

.desense-popover {
  left: -214px;
  top: -2px;
  height: 198px;
  width: 212px;
  font-size: 12px;
  overflow-y: auto;
}
.desense-popover ul li span {
  margin-left: 4px;
}
.desense-popover ul li:hover {
  background-color: #f5f7fa;
}

.data-tables {
    padding-top: 10px;
    height: calc(100% - 69px);

    /deep/ .el-tag {
      cursor: pointer;
      color: $font-main2;
      background: $main-bg;
      border-color: transparent;
      width: 100%;

      .col-span {
        display: inline-block;
        width: 170px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        word-break: break-all;
        height: 30px;
        line-height: 30px;
      }

      &.active,
      &:hover {
        border-color: $hight-light-clr1;
        color: $hight-light-clr1;

        & > span:last-child {
          display: inline;
        }
      }

      & > span:last-child {
        display: none;
      }

      &.dis-draggable {
        //主表只允许拖一次
        cursor: not-allowed;
      }
    }

    .tables-detail {
      height: calc(100% - 67px);
      width: calc(100% + 10px);
      overflow: visible;
      /deep/ .el-scrollbar__wrap {
        padding-bottom: 60px;
      }
      .query-condi {
        padding-right: 11px;
      }
    }
  }

  .dataset-popover /deep/ .el-form-item__label {
  color: #606266;
  font-size: 12px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.dataset-popover /deep/ .el-form-item__content label {
  color: #409eff;
  font-size: 12px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 100%;
  display: inline-block;
}

.dataset-popover /deep/ .el-form-item__content,
.dataset-popover /deep/ .el-form-item__label {
  line-height: 30px;
}

.dataset-popover /deep/ .d-popover-name {
  line-height: 24px;
  display: inline-block;
}

.dataset-popover /deep/ .el-form-item {
  margin-bottom: 0;
}
.left-opt-icon {
    cursor: pointer;
    color: $font-main2;
    float: right;
    margin-top: 17px;

    &:hover {
      color: $hight-light-clr1;
    }

    &.icon-A10429_orders {
      margin-left: 8px;
    }
  }
</style>
