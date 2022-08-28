<template>
  <el-container v-loading="loadingPage">
    <el-header class="design-page">
      <div class="head-left">
        <el-input
          class="page-name"
          :class="{'page-input' : this.toSaveInput}"
          size="mini"
          v-model="pageName"
          placeholder="请输入维度名称"
          ref="toSaveBtn"
          @input="inputChange('pageName')"
        ></el-input>
      </div>

      <div class="head-opt-btn">
        <!-- <el-tooltip class="item" effect="dark" content="预览" placement="top-start">
          <i :class="{'icon-A10603_Overview':true}" @click="toPrew"></i>
        </el-tooltip>-->
        <el-tooltip class="item" effect="dark" v-if="oriDimInfo ? oriDimInfo.isDemo === '0' : true" content="保存" placement="top-start">
          <i :class="{'icon-A10579_Preservation':true}" @click="toSave(false)"></i>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="另存" placement="top-start">
          <i :class="{'icon-A10545_PS':true}" @click="toSaveAs"></i>
        </el-tooltip>
      </div>
    </el-header>
    <el-container>
      <el-main style="position:relative" class="design-main">
        <!-- 即席查询 -->
        <div class="query-design">
          <!-- 动态维度面板 start-->
          <el-container v-show="dimLevelGroup==='2'">
            <el-main class="left-block-wrap">
              <div>
                <MainTitle title="维度配置"></MainTitle>
                <span class="warn-tip">维层数据上限5W</span>
              </div>
              <div>
                <el-table
                  border
                  highlight-current-row
                  :data="dynamicDimData"
                  style="width: 100%"
                  size="mini"
                  height="100%"
                  id="table2"
                  ref="dynamicTable"
                  row-key="id"
                  :key="tableKey"
                  @current-change="switchRow"
                >
                  <el-table-column type="index" label="维层" :index="indexMethod" align="center"></el-table-column>
                  <el-table-column label="维层名称" :show-overflow-tooltip="true" prop="dimLevelName">
                    <template slot-scope="scope">
                      <!-- <div class="test-input" style="width:100%">
                        <input
                          type="text"
                          maxlength="10"
                          v-model="scope.row.dimLevelName"
                          placeholder="请输入维层名称"
                        />

                      </div>-->
                      <el-input
                        class="tb-input-wrap cell-edit-input"
                        v-model="scope.row.dimLevelName"
                        placeholder="请输入维层名称"
                        maxlength="10"
                      ></el-input>
                    </template>
                  </el-table-column>
                  <el-table-column label="维层类型" v-if="dimType==='2'">
                    <template slot-scope="scope">
                      <!-- :disabled="dimlvTypeData.length === 0" -->
                      <el-select
                        v-model="scope.row.dimLevelType"
                        placeholder="请选择维层类型"
                        size="mini"
                        class="tb-sel-wrap"
                      >
                        <el-option
                          v-for="item in dimlvTypeData"
                          :key="item.dicCode"
                          :label="item.dicValue"
                          :value="item.dicCode"
                        ></el-option>
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="维层编码">
                    <template slot-scope="scope">
                      <el-select
                        v-model="scope.row.dimLevelCode"
                        placeholder="请选择字段"
                        size="mini"
                        class="tb-sel-wrap"
                        popper-class="tb-sel-pop-wrap"
                        @change="dimCodeVal=>{selDimCode(dimCodeVal,scope.$index)}"
                      >
                        <el-option
                          v-for="item in dimFieldData"
                          :key="item.colId"
                          :label="item.colName+'('+(item.colChsName || '')+')'"
                          :value="item.colId"
                        >
                          <el-tooltip
                            class="item"
                            effect="dark"
                            :content="item.colName+'('+(item.colChsName || '')+')'"
                            placement="left-start"
                            :open-delay="200"
                          >
                            <span
                              class="tb-sel-opt-label"
                            >{{ item.colName+'('+(item.colChsName || '')+')' }}</span>
                          </el-tooltip>
                        </el-option>
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="维层描述">
                    <template slot-scope="scope">
                      <el-select
                        v-model="scope.row.dimLevelInfo"
                        placeholder="请选择字段"
                        size="mini"
                        class="tb-sel-wrap"
                        popper-class="tb-sel-pop-wrap"
                      >
                        <el-option
                          v-for="item in dimFieldData"
                          :key="item.colId"
                          :label="item.colName+'('+(item.colChsName || '')+')'"
                          :value="item.colId"
                        >
                          <el-tooltip
                            class="item"
                            effect="dark"
                            :content="item.colName+'('+(item.colChsName || '')+')'"
                            placement="left-start"
                            :open-delay="200"
                          >
                            <span
                              class="tb-sel-opt-label"
                            >{{ item.colName+'('+(item.colChsName || '')+')' }}</span>
                          </el-tooltip>
                        </el-option>
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="排序字段">
                    <template slot-scope="scope">
                      <el-select
                        v-model="scope.row.sortField"
                        placeholder="请选择字段"
                        size="mini"
                        class="tb-sel-wrap"
                        popper-class="tb-sel-pop-wrap"
                      >
                        <el-option
                          v-for="item in dimFieldData"
                          :key="item.colId"
                          :label="item.colName+'('+(item.colChsName || '')+')'"
                          :value="item.colId"
                        >
                          <el-tooltip
                            class="item"
                            effect="dark"
                            :content="item.colName+'('+(item.colChsName || '')+')'"
                            placement="left-start"
                            :open-delay="200"
                          >
                            <span
                              class="tb-sel-opt-label"
                            >{{ item.colName+'('+(item.colChsName || '')+')' }}</span>
                          </el-tooltip>
                        </el-option>
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="180" align="center">
                    <template slot-scope="scope">
                      <span class="sort-wrap" @click="sortFn(scope.$index, $event)">
                        <el-tooltip effect="dark"
                          :enterable='false'
                          content="升序"
                          placement="top">
                          <span :class="[{'el-icon-sort-up':false}, 'icon-A10008_triangleUp', {'sort-selected': scope.row.ruleType == 3}]"></span>
                        </el-tooltip>
                        <el-tooltip effect="dark"
                          :enterable='false'
                          content="降序"
                          placement="bottom">
                          <span :class="[{'el-icon-sort-down':false},'sort-down','icon-A10009_triangleDown',{'sort-selected': scope.row.ruleType == 4}]"></span>
                        </el-tooltip>
                      </span>
                      <el-tooltip class="item" effect="dark" content="拖动行" placement="top-start">
                        <span class="el-icon-rank table-icon drag-row-icon"></span>
                      </el-tooltip>
                      <el-tooltip class="item" effect="dark" content="删除" placement="top-start">
                        <span
                          class="icon-A10065_delete table-icon"
                          @click="deleteRow(2,scope.$index,$event)"
                        ></span>
                      </el-tooltip>
                      <el-tooltip class="item" effect="dark" content="新增" placement="top-start">
                        <span
                          class="icon-A10073_add table-icon"
                          @click="addRowData(2,scope.$index,$event)"
                        ></span>
                      </el-tooltip>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-main>
            <el-footer class="left-block-wrap" height="40%">
              <div>
                <MainTitle :title="filterTitle"></MainTitle>
              </div>
              <div>
                <DimFilterCondi :fieldTypeList="fieldTypeList"></DimFilterCondi>
              </div>
            </el-footer>
          </el-container>
          <!-- 动态维度面板 end-->
          <!-- 静态维度面板 start-->
          <el-container v-show="dimLevelGroup==='1'">
            <el-main class="left-block-wrap" style="padding-bottom:0">
              <div>
                <MainTitle title="维度配置"></MainTitle>
              </div>
              <div>
                <el-table
                  highlight-current-row
                  border
                  :data="staticDimData"
                  style="width: 100%"
                  size="mini"
                  height="100%"
                  id="table1"
                  row-key="id"
                  ref="staticTable"
                >
                  <el-table-column label="维值">
                    <template slot-scope="scope">
                      <el-input
                        class="tb-input-wrap cell-edit-input"
                        v-model="scope.row.dimValue"
                        placeholder="请输入维值"
                        size="mini"
                        width="250px"
                        maxlength="15"
                      ></el-input>
                    </template>
                  </el-table-column>
                  <el-table-column label="维值描述">
                    <template slot-scope="scope">
                      <el-input
                        class="tb-input-wrap cell-edit-input"
                        v-model="scope.row.dimValueDesc"
                        placeholder="请输入维值描述"
                        size="mini"
                        width="250px"
                        maxlength="15"
                      ></el-input>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="150" align="center">
                    <template slot-scope="scope">
                      <el-tooltip class="item" effect="dark" content="拖动行" placement="top-start">
                        <span class="el-icon-rank table-icon drag-row-icon"></span>
                      </el-tooltip>
                      <el-tooltip class="item" effect="dark" content="删除" placement="top-start">
                        <span
                          class="icon-A10065_delete table-icon"
                          @click="deleteRow(1,scope.$index,$event)"
                        ></span>
                      </el-tooltip>
                      <el-tooltip class="item" effect="dark" content="新增" placement="top-start">
                        <span
                          class="icon-A10073_add table-icon"
                          @click="addRowData(1,scope.$index,$event)"
                        ></span>
                      </el-tooltip>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-main>
          </el-container>
          <!-- 静态维度面板 end-->
        </div>
      </el-main>
      <el-aside width="360px" class="right-opt-panel">
        <el-container>
          <el-header height="40px" style="padding-left:0px;">
            <el-select
              v-model="dimLevelGroup"
              popper-class="dim-select-wrap"
              size="mini"
              class="no-border-select"
            >
              <el-option key="1" label="静态维" value="1"></el-option>
              <el-option key="2" label="动态维" value="2"></el-option>
            </el-select>
          </el-header>
          <el-main style="padding:12px;display:flex;flex-direction:column;">
            <el-row class="item-block">
              <div class="sub-nav-title">
                <span class="icon-A10165_upload"></span>
                维度类型
              </div>
              <el-select v-model="dimType" size="mini">
                <el-option key="1" label="地域维" value="2"></el-option>
                <el-option key="2" label="其他" value="3"></el-option>
              </el-select>
            </el-row>
            <el-row class="item-block">
              <div class="sub-nav-title">
                <span class="icon-A10165_upload"></span>
                维度描述
              </div>
              <el-input
                ref="dimDesc"
                type="textarea"
                :rows="5"
                placeholder="请输入内容"
                v-model="busInfo"
                size="mini"
                maxlength="200"
                class="desc-wrap"
              ></el-input>
            </el-row>
            <!-- 动态维展示 -->
            <el-row class="item-block" v-show="dimLevelGroup==='2'">
              <div class="sub-nav-title">
                <span class="icon-A10165_upload"></span>
                维表选择
              </div>
              <!--数据源选择-->
              <el-select
                filterable
                v-model="dataSrcValue"
                placeholder="请选择数据源"
                :filter-method="filterDataSrc"
                size="mini"
                :disabled="disabledFlag"
                value-key="dsId"
                style="width:150px;margin-right:10px;"
                @change="dataSrcSelChange"
                :loading="dataSrcLoading"
                popper-class="tb-sel-pop-wrap"
              >
                <el-option
                  v-for="(item,index1) in allDataSrc"
                  :key="item.dsId"
                  :label="item.dsName"
                  :value="item"
                  :id="'auto_ds'+index1"
                >
                  <el-tooltip
                    class="item"
                    effect="dark"
                    :content="item.dsName"
                    placement="left-start"
                    :open-delay="200"
                  >
                    <span class="tb-sel-opt-label">{{ item.dsName }}</span>
                  </el-tooltip>
                </el-option>
              </el-select>

             <!--数据库模式选择-->
             <el-select
               v-if="isDemoBase"
                filterable
                v-model="schemaValue"
                :placeholder= this.schemaTip
                v-scrollloadmore="{domClass:'.table-list-wrap.el-select-dropdown .el-select-dropdown__wrap',callBack:loadMoreTable}"
                size="mini"
                :disabled="disabledFlag"
                popper-class="table-list-wrap tb-sel-pop-wrap"
                @change="schemaSelChange"
                clearable
                @clear="setValueNull"
                style="width:150px;"
              >
                <el-option
                  v-for="(item,index1) in schemaList"
                  :key="item"
                  :label="item"
                  :value="item"
                  :id="'auto_mode'+index1"
                >
                  <el-tooltip
                    class="item"
                    effect="dark"
                    :content="item"
                    placement="left-start"
                    :open-delay="200"
                  >
                    <span class="tb-sel-opt-label">{{ item }}</span>
                  </el-tooltip>
                </el-option>
              </el-select>

              <br/>
              <br/>

              <!--维表选择-->
              <el-select
                filterable
                remote
                :loading="tableSelLoading"
                v-model="tabFilterText"
                placeholder="请选择表"
                v-scrollloadmore="{domClass:'.table-list-wrap.el-select-dropdown .el-select-dropdown__wrap',callBack:loadMoreTable}"
                size="mini"
                popper-class="table-list-wrap tb-sel-pop-wrap"
                @change="queryTabFields"
                :remote-method="remoteMethod"
                @visible-change="resetTables"
                clearable
                style="width:310px;"
              >
                <el-option
                  v-for="item in entityList"
                  :key="item.tab_id"
                  :label="item.phy_tab_name"
                  :value="item.tab_id"
                >
                  <el-tooltip
                    class="item"
                    effect="dark"
                    :content="item.phy_tab_name"
                    placement="left-start"
                    :open-delay="200"
                  >
                    <span class="tb-sel-opt-label">{{ item.phy_tab_name }}</span>
                  </el-tooltip>
                </el-option>
              </el-select>

            </el-row>
            <el-table
              :data="dimFieldData"
              v-show="dimLevelGroup==='2'"
              style="width: 100%"
              id="table3"
              v-loading="loadingFieldTab"
              height="calc(100% - 302px)"
              class="field-tb-wrap"
              size="mini"
              :key="Math.random()"
            >
              <el-table-column prop="colName" label="字段英文名称" :show-overflow-tooltip="true"></el-table-column>
              <el-table-column prop="colChsName" label="字段中文名称" :show-overflow-tooltip="true"></el-table-column>
            </el-table>
          </el-main>
        </el-container>
      </el-aside>
    </el-container>

    <el-dialog
      width="420px"
      :visible.sync="dialogSaveAs"
      class="save-as-dialog"
      :close-on-click-modal="false"
    >
      <div slot="title" class="dialog-title">
        <span>另存为</span>
        <div class="title-line"></div>
      </div>
      <el-form ref="saveForm" :rules="rules" :model="saveForm">
        <el-form-item
          prop="pageName"
          label="名称"
          :label-width="'51px'"
          style="margin-bottom:14px;margin-top:-6px;"
        >
          <el-input
            size="mini"
            v-model="saveForm.pageName"
            @input="inputChange('saveForm.pageName')"
            autocomplete="off"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogSaveAs=false" size="mini">取 消</el-button>
        <el-button type="primary" @click="saveAsSubmit('saveForm')" size="mini">确 定</el-button>
      </div>
    </el-dialog>
  </el-container>
</template>
<script>
import { mapActions, mapMutations, mapState } from "vuex";
import { objDeepCopy, objClone, fieldMatch } from "../utils/comonFunc.js";
import MainTitle from "../components/tools/MainTitle";
import Sortable from "sortablejs";
import DimFilterCondi from "../components/design/DimFilterCondi";

export default {
  components: {
    MainTitle,
    DimFilterCondi
  },
  inject: ["reload"],
  data() {
    return {
      frameId: "F00000000002",
      disabledFlag: false, //是否屏蔽下拉框标志
      dialogVisible: false, //yxq
      pageName: "",
      dialogSaveAs: false,
      at:0,
      saveForm: {
        pageName: ""
      },
      toSaveInput: false,
      rules: {
        pageName: [
          { required: true, message: "请输入名称", trigger: "blur" },
          { min: 1, max: 25, message: "长度在 1 到 25 个字符", trigger: "blur" }
        ]
      },
      dynamicDimData: [], //动态维层数据
      staticDimData: [], //静态维层数据
      dimLevelGroup: "2", //1：常值(静态维)，2：动态
      busInfo: "", //维度描述
      chooseDimTbVis: false,
      schemaValue: "",
      dimFieldData: [],
      schemaTip: "请选择",
      dimType: "2",
      dataSrcValue: "", //数据源下拉框值
      allDataSrc: [], //数据源下拉数据
      allDataSrcCopy: [], //数据源下拉数据备份
      tabFilterText1: "",
      tabFilterText: "",
      start: 1,
      pgDataName: "", //pg数据库名称
      entityPageSize: 50, //左侧表分页条数
      entityCurPage: 1, //左侧表分页当前页
      entityList: Object.freeze([]),
      entityListBak: Object.freeze([]), //当前所有未过滤的表集合
      tabSelLoading: false,
      loadingFieldTab: false,
      dimlvTypeData: [], //维层编码类型列表
      curDimId: "",
      oriDimInfo: null,
      connId: "",
      firstLoad: false,
      loadingPage: false, //加载维度页面信息
      fieldTypeList: {}, //数据库字段类型
      tableSelLoading: false, //表集合下拉框加载
      dataSrcLoading: false, //数据源下拉框加载
      reqGetBackFlag: 0, //查询数据库所有字段类型接口和查询该表所有字段接口  是否完成
      curRow: null, //动态维度当前行
      tableKey: 1,
      schemaList: [], //数据库实例名列表
      requestCount: 0, //请求计数 编辑页面动态维度要等getDimInfoById查维度数据接口、查数据源接口、查表接口、查字段接口 4个接口都返回再去掉遮罩，静态一个
      // valueIsChange: false,
      dimensionLoading:false
    };
  },
  methods: {
    inputChange(val) {
      let inputVal = "";
      if (val == "pageName") {
        inputVal = this.pageName;
      } else {
        inputVal = this.saveForm.pageName;
      }
      if (inputVal.length > 25) {
        let str = inputVal.slice(0, 25);
        if (val == "pageName") {
          this.pageName = str;
        } else {
          this.saveForm.pageName = str;
        }
        this.$message.warning("名称长度不能超过25字符!");
        return false;
      }
    },
    /**
     * @param
     * isFromSaveAs 是另存操作还是保存操作  true--另存
     */
    toSave(isFromSaveAs = false) {
      this.dimensionLoading = true;
      // 校验动态维和静态维表格 所有字段都是必填的，维值和维层名称不能重名
      let flag = true,
        warnTip = "";
      if (this.pageName.trim() === "" && !isFromSaveAs) {
        this.$message.warning("请定义维度名称");
        this.toSaveInput = true;
        this.$refs.toSaveBtn.focus();
        setTimeout(() => {
          this.toSaveInput = false;
        }, 0);
        return;
      }

      if (this.dimLevelGroup === "1") {
        if (this.staticDimData.length === 0) {
          //至少要有一条记录
          this.$message.error("维层记录至少要有一条");
          return;
        } else {
          flag = this.checkKeyValNull(this.staticDimData, [
            "dimValue",
            "dimValueDesc"
          ]);
          if (!flag) {
            warnTip = "维值和维值描述不能为空";
          } else {
            //校验维值不能重复
            flag = this.checkKeyValDuplicated(this.staticDimData, "dimValue");
            warnTip = "维值不能重复";
          }
          if (!flag) {
            this.$message.error(warnTip);
            return;
          }
        }
      } else {
        //动态维
        if (this.dataSrcValue === "") {
          this.$message.error("请选择数据源");
          return;
        } else if ((this.tabFilterText || "").trim() === "") {
          this.$message.error("请选择实体表");
          return;
        } else if (this.dynamicDimData.length === 0) {
          //至少要有一条记录
          this.$message.error("维层记录至少要有一条");
          return;
        } else {
          let attrAttr = [
            "dimLevelName",
            "dimLevelCode",
            "dimLevelInfo",
            "sortField"
          ];
          if (this.dimType === "3") {
            //其他维，要把dimLevelType默认值补上
            this.resetDimLvType(this.dimType);
          } else {
            attrAttr.push("dimLevelType");
          }
          // 地域维要检验维层类型，其他（维层类型隐藏，设默认值）
          flag = this.checkKeyValNull(this.dynamicDimData, attrAttr);
          if (!flag) {
            warnTip =
              attrAttr.indexOf("dimLevelType") > -1
                ? "维层名称、类型、编码、描述、排序不能为空"
                : "维层名称、编码、描述、排序不能为空";
          } else {
            //校验维值不能重复
            flag = this.checkKeyValDuplicated(
              this.dynamicDimData,
              "dimLevelName"
            );
            warnTip = "维层名称不能重复";
          }
          if (!flag) {
            this.$message.warning(warnTip);
            return;
          }

          // 校验维层排序字段必须是当前层的描述或者编码字段
          let validRes = this.checkDimSort();
          if (!validRes.flag) {
            this.$message.error("维层排序字段必须是当前层的描述或者编码字段");
            this.$refs.dynamicTable.setCurrentRow(
              this.dynamicDimData[validRes.index]
            );
            this.dialogSaveAs = false;
            return;
          }

          // // 校验过滤字段 如果字段有选，当前行就必填，如果没填就剔除数据
          if (this.curRow && this.curRow.id) {
            let filterValidate = this.validateFilterCondis();
            if (!filterValidate.flag) {
              this.$message.error("字段过滤规则不能为空");
              return;
            } else {
              this.saveCurRowFilter(this.curRow.id, filterValidate);
            }
          }
        }
      }
      this.genDimReqData(isFromSaveAs);
    },
    toSaveAs() {
      this.saveForm.pageName = this.pageName;
      this.dialogSaveAs = true;
      this.saveForm.catalogId = []
      this.$nextTick(() => {
        this.$refs.saveForm.clearValidate()
      })
    },
    setValueNull() {  //清空之前进行操作
       this.schemaSelChange();
    },
    saveAsSubmit(formName) {
      // const _this = this;
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.toSave(true);
          this.dialogSaveAs = false;
        } else {
          return false;
        }
      });
    },
    ...mapMutations({
      setFieldOptions: "DataSetDesign/setFieldOptions",
      setDimFilterData: "DataSetDesign/setDimFilterData",
      setDimIdCounter: "DataSetDesign/setDimIdCounter"
    }),
    ...mapActions({
      queryDataSource: "DataSetMgt/queryDataSource", //数据源列表查询
      queryEntityList: "DataSetDesign/queryEntityList", //查询左侧表集合
      queryTbFields: "DataSetDesign/queryTbFields", //查询表字段
      getDicValueList: "DataSetDesign/getDicValueList", // 获取维层类型字典列表
      saveDim: "DataSetDesign/saveDim", //新增维度
      getDimInfoById: "DataSetDesign/getDimInfoById",
      queryDbColConf: "DataSetDesign/queryDbColConf", //查询数据库字段类型
      querySchemaList: "DataSetDesign/querySchemaList" //获取数据库用户模式
    }),
    delRowData() {
      let { type, index } = this.toDelRow;
      switch (type) {
        case 1:
          this.staticDimData.splice(index, 1);
          if (this.staticDimData.length == 0) {
            this.resetDimTbData("1");
          }
          break;
        case 2:
          let oriId = this.dynamicDimData[index].id;
          if (this.curRow && this.curRow.id && this.curRow.id === oriId) {
            this.setDimFilterData([]);
          }
          this.$set(this.dimFilterMap, oriId, []);
          this.dynamicDimData.splice(index, 1);
          if (this.dynamicDimData.length == 0) {
            this.resetDimTbData("2");
            // 补上过滤数据
            this.$nextTick(() => {
              let keyId = this.dynamicDimData[0].id;
              this.$set(this.dimFilterMap, keyId, [this.getFilterRowEg()]);
              this.setDimFilterData(objDeepCopy(this.dimFilterMap[keyId]));
            });
          }
          break;
        default:
          break;
      }
    },
    addRowData(type, index, event) {
      event.stopPropagation();
      let id = new Date().getTime();
      let row = {};
      switch (type) {
        case 1:
          row = {
            dimValueDesc: "",
            dimValue: "",
            id: id
          };
          this.staticDimData.splice(index + 1, 0, row);
          break;
        case 2:
          row = {
            dimLevelName: "",
            dimLevelCode: "",
            dimLevelInfo: "",
            sortField: "",
            id: id
          };
          this.dynamicDimData.splice(index + 1, 0, row);
          break;
        default:
          break;
      }
      this.$nextTick(() => {
        this.scrollToRowIdx("table" + type, index + 1);
      });
    },
    rowDrag() {
      const _this = this;
      //静态维度表格行拖拽
      const tbody1 = document.querySelector(
        "#table1 .el-table__body-wrapper tbody"
      );
      Sortable.create(tbody1, {
        onEnd({ newIndex, oldIndex }) {
          const currentRow = _this.staticDimData.splice(oldIndex, 1)[0];
          _this.staticDimData.splice(newIndex, 0, currentRow);
        },
        // filter: ".table-icon,.test-input"
        handle: ".drag-row-icon"
      });
      //动态维度表格行拖拽
      const tbody2 = document.querySelector(
        "#table2 .el-table__body-wrapper tbody"
      );
      Sortable.create(tbody2, {
        //拖拽完毕之后发生该事件
        onEnd({ newIndex, oldIndex }) {
          const currentRow = _this.dynamicDimData.splice(oldIndex, 1)[0];
          _this.dynamicDimData.splice(newIndex, 0, currentRow);
        },
        handle: ".drag-row-icon"
      });
    },
    // 数据源下拉框静态搜索
    filterDataSrc(val) {
      val = val.trim();
      if (val) {
        //val存在
        this.allDataSrc = this.allDataSrcCopy.filter(item => {
          if (
            !!~item.dsName.indexOf(val) ||
            !!~item.dsName.toUpperCase().indexOf(val.toUpperCase())
          ) {
            return true;
          }
        });
      } else {
        //val为空时，还原数组
        this.allDataSrc = objDeepCopy(this.allDataSrcCopy);
      }
    },
    //获取数据源信息 query-过滤条件
    getAllDataSrc() {
      this.dataSrcLoading = true;
      let _this = this;
      this.queryDataSource({
        tenantId: window.sessionStorage.getItem("tenant_id") || "34234234",
        parentResourceTypeId: "database"
      })
        .then(function(response) {
          let respData = response.data.respData || [];
          if (response.data.respResult == 1 && respData.length > 0) {
            _this.allDataSrcCopy = Object.freeze(
              objDeepCopy(response.data.respData || [])
            );
            _this.allDataSrc = response.data.respData || [];
            if (
              _this.allDataSrcCopy.length > 0 &&
              _this.firstLoad &&
              _this.connId != ""
            ) {
              if(_this.allDataSrcCopy.some(item => {
                return _this.connId == item.dsId;
              })) {  //判断是否为动态维度   ---- 动态维
                _this.dataSrcValue =
                  (_this.allDataSrcCopy || []).filter(item => {
                    return _this.connId == item.dsId;
                  })[0] || "";


                _this.getSchemaList(_this.dataSrcValue);  //查询数据源下面所有模式列表(这里要做控制否则会查询多次)
                // _this.getEntityList("", _this.dataSrcValue);
               if(_this.dataSrcValue.dsType === 'postgresql' || _this.dataSrcValue.dsType === 'greenplum' || _this.dataSrcValue.dsType === 'sqlserver' || _this.dataSrcValue.dsType === 'vertica'){ //pg库
                     _this.schemaValue =_this.oriDimInfo.dimLevelList[0].dbUser;
                    _this.getEntityList("", _this.dataSrcValue , _this.pgDataName);
                }else{
                    _this.schemaValue = _this.oriDimInfo.dimLevelList[0].dbUser;
                    _this.pgDataName = "";  //非pg库置空
                    _this.getEntityList("", _this.dataSrcValue , "");
                }

                if (_this.dataSrcValue !== "") {
                  _this.queryDbColTypes(_this.dataSrcValue, true);
                }

                if (_this.oriDimInfo.phyTabName) {
                  //查表字段
                  _this.queryTabFields(_this.oriDimInfo.phyTabName, false);
                }
              } else {  //静态维度
                //如果获取不到数据源,跳过查询表，字段接口
                _this.requestCount += 2;
              }
            }
          } else {
            _this.$message.error("数据源列表加载失败");
            _this.firstLoad = false;
          }
        })
        .catch(err => {
          // _this.$message.error("数据源列表加载失败");
          _this.firstLoad = false;
        })
        .finally(() => {
          _this.dataSrcLoading = false;
          _this.requestCount++;
        });
    },
    remoteMethod(query) {   //检索时候使用
      if (query === '' ){  //为空时候不进行加载
        return
      }
      this.tabFilterText1 = query;
      this.start = 1;

      if(this.dataSrcValue.dsType === 'postgresql' || this.dataSrcValue.dsType === 'greenplum' || this.dataSrcValue.dsType === 'sqlserver' ||  this.dataSrcValue.dsType === 'vertica' ){  //pg库
        this.getEntityList(this.tabFilterText1, this.dataSrcValue,this.pgDataName);
      }else{
        this.getEntityList(this.tabFilterText1, this.dataSrcValue,"");
      }
    },
    resetTables(sign) {
      if (!sign) {
        if (this.tabFilterText1 != "") {
          this.start = 1;
          if(this.dataSrcValue.dsType === 'postgresql' || this.dataSrcValue.dsType === 'greenplum' || this.dataSrcValue.dsType === 'sqlserver' || this.dataSrcValue.dsType === 'vertica'){  //pg库
               this.getEntityList(this.tabFilterText1, this.dataSrcValue,this.pgDataName);
          }else{
              this.getEntityList(this.tabFilterText1, this.dataSrcValue,"");
          }
        }
        this.tabFilterText1 = "";
        // this.valueIsChange = false;
      }
    },
    // 加载实体表
    loadEntityData() {
      let tempData = [],
        arrLen = this.entityListBak.length;
      let start = (this.entityCurPage - 1) * this.entityPageSize,
        end = start + this.entityPageSize;
      if (this.entityList.length !== arrLen && arrLen !== 0) {
        tempData = this.entityListBak.filter((item, index) => {
          return index < end && index >= start;
        });
      }
      if (this.entityCurPage === 1) {
        //第一页
        this.entityList = Object.freeze(tempData);
      } else {
        this.entityList = Object.freeze(this.entityList.concat(tempData));
      }
    },
    // 滚动加载实体列表
    loadMoreTable() {
      if (this.entityList.length !== this.entityListBak.length) {
        this.entityCurPage++;
        this.loadEntityData();
      }
    },
    schemaSelChange(value) {  //模式更新
      //清空旧的数据
      this.resetDimTbData("2");
      this.tabFilterText = "";
      this.dealEntityData([]);
      //清空表字段与维度
      this.dimFieldData = [];
      this.tabFilterText1 = "";

      let dataSource = this.dataSrcValue;
      let fg = 'noclean';
      if(dataSource.dsType === 'postgresql' || dataSource.dsType === 'greenplum' || dataSource.dsType === 'sqlserver' || dataSource.dsType === 'vertica'){
         this.confirmChange(this.pgDataName, dataSource, fg);
      }else{
         this.confirmChange('', dataSource, fg);
      }
    },
    confirmChange(schema, row, operate) {   //确认该表
      // this.$refs.singleTable.setCurrentRow(this.$refs.singleTable.store.states.selection);
      if(this.filterText!==''){ //切换用户模式清空搜索关键字
        this.filterText = '';
        // return;
      }
      if(operate === 'noclean'){
        if(row.dsType === 'postgresql' || row.dsType === 'greenplum' || row.dsType === 'sqlserver' || row.dsType === 'vertica'){ //pg库
            this.getEntityList("", row , schema);
        }else{
            this.getEntityList("", row , "");
        }

        return;
      }

      this.connId = this.connIdBak;
      this.dataResourceName = this.dataResourceNameBak;

      //重置数据源信息
      this.setPopFormData();

      this.fieldFilterText = "";
      this.filterText = "";
      this.queryCatalog();
      this.entityData = [];
      this.table1DataOri = [];
      this.table2DataOri = [];
      this.table1Data = Object.freeze([]);
      this.table2Data = Object.freeze([]);
      this.updateTopoTabActive("");
      this.rule_group_list.splice(0, this.rule_group_list.length);
      if (typeof this.allFieldsMap.clear != "function") {
        this.allFieldsMap = new Map();
      }
      this.allFieldsMap.clear();
    },
    dataSrcSelChange(value) {   //数据源修改触发
      //区分数据库模式提示语  add czl by 2020.04/26
      if(value.resourceTypeId === "oracle"){
          this.schemaTip = this.userModeTip;
      }else if(value.resourceTypeId === "gbase" || value.resourceTypeId === "mysql"){
           this.schemaTip = this.dataModeTip;
      }else{
          this.schemaTip = this.shemaModeTip;
      }
      // 变更数据源需要刷新当前页面
      if (value != "") {
        this.dataResourceNameBak = value.dsName;
        if (value.parentResourceTypeId === "dataasset") {
          this.connIdBak = value.dsId;
        }
        // 切换数据源的时候分页重置为第一页,列表数据重置
        this.entityCurPage = 1;
        this.entityList = Object.freeze([]);
        this.entityListBak = Object.freeze([]);
        this.tabFilterText = "";
        this.tabFilterText1 = "";
        this.dimFieldData = [];
        this.start = 1;
        this.pgDataName = "";
        this.resetDimTbData("2");
        this.$nextTick(() => {
          //确保滚动条已经恢复到原来的位置
          this.filterDataSrc("");
          this.getSchemaList('setValue'); //请求数据库模式
        });
      }
    },
    getSchemaList(operate){//获取数据库用户模式
      let param = {};
      let dataSource = (this.dataSrcValue||{}).dsId;
      if(!dataSource){
        this.schemaList = [];
        return;
      }
      // this.schemaValue = "";
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

        //自定义数据源
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
            if(curDataSrc.dsType === 'postgresql' || curDataSrc.dsType === 'greenplum'){    //pg库需要类型
               this.schemaList = respData[0].schemaNameList;
            }else if(curDataSrc.dsType === 'sqlserver' || curDataSrc.dsType === 'vertica'){ //sqlserve 特殊处理
              let dname = curDataSrc.dbName;
               for(var p = 0 ; p < respData.length ; p++ ){
                 if(respData[p].dbName === dname){
                    this.schemaList = respData[p].schemaNameList;
                 }
              }
            }else{  //其他数据库类型就是其用户模式
              for(var po = 0 ; po < respData.length ; po++ ){
                  this.schemaList.push(respData[po].dbName);
              }
              //  this.schemaList = respData;
            }
          }
          this.schemaListall = objDeepCopy(this.schemaList);
          if(operate==='setValue'){
            let schema = this.schemaList[0] || "";
            if(this.dataSrcValue.paramList && this.dataSrcValue.paramList.length>0){
              var userName = this.dataSrcValue.paramList.filter(val=>{
                  return val.paramName=='user_name';
              })
              schema = userName[0].paramValue;
            }
            if(curDataSrc.dsType === 'postgresql' || curDataSrc.dsType === 'greenplum'){ //pg数据库
              //  pgDataName = respData[0].dbName;
               this.pgDataName = respData[0].dbName;//数据库名
               schema = respData[0].schemaNameList[0]; //数据库模式第一个
               this.schemaValue = schema;
               this.getEntityList("",this.dataSrcValue,this.pgDataName);
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
                this.pgDataName = '';
                this.schemaValue = schema;
                this.getEntityList("",this.dataSrcValue,'');
            }
            //"" ，传递库名，用户模式(兼容带数据库模式的)
            // this.getEntityList("",this.dataSrcValue,this.pgDataName);
          }

        }else{
          this.$message.error(resp.data.respErrorDesc);
        }
      }).catch(err=>{
        console.error(err);
      })
    },
    getEntityList(val, curDataSrc,pgDataName) {  //添加pg数据库名称参数
      //加载开始开启屏蔽
      this.disabledFlag = true;
      this.tableSelLoading = true;
      let _this = this;
      let flag6 = "1";
      //自定义数据源 限死直连数据库
      let param = {
        // dsId: curDataSrc.dsId,
        // key: (val || "").trim()
      };
      if(pgDataName!=null && pgDataName!=''){ //pg库获取表字段走分支判断 add czl 2020/04/26
              if((_this.schemaValue == '' || _this.schemaValue == null) && !(_this.firstLoad)){
                   //区分数据库模式提示语  add czl by 2020.04/26
                  if(curDataSrc.resourceTypeId === "oracle"){
                      _this.schemaTip = _this.userModeTip;
                  }else if(curDataSrc.resourceTypeId === "gbase" || curDataSrc.resourceTypeId === "mysql"){
                      _this.schemaTip = _this.dataModeTip;
                  }else{
                      _this.schemaTip = _this.shemaModeTip;
                  }

                  _this.$message.error(_this.schemaTip);
                  _this.resetDimTbData("2");
                  flag6 = "0";
              }
              param = {
              dsId: curDataSrc.dsId,
              key: (_this.tabFilterText1 || "").trim(),
              schema:pgDataName,
              schemaName:_this.schemaValue
            };
          }else{ //其他库类型
           if((_this.schemaValue == '' || _this.schemaValue == null) && !(_this.firstLoad)){
               //区分数据库模式提示语  add czl by 2020.04/26
                if(curDataSrc.resourceTypeId === "oracle"){
                    _this.schemaTip = _this.userModeTip;
                }else if(curDataSrc.resourceTypeId === "gbase" || curDataSrc.resourceTypeId === "mysql"){
                    _this.schemaTip = _this.dataModeTip;
                }else{
                    _this.schemaTip = _this.shemaModeTip;
                }
                _this.$message.error(_this.schemaTip);
                _this.resetDimTbData("2");
                flag6 = "0";
            }
            param = {
              dsId: curDataSrc.dsId,
              key: (_this.tabFilterText1 || "").trim(),
              schema: _this.schemaValue,
              schemaName:""
            };
          }

      this.queryEntityList({
        type: curDataSrc.parentResourceTypeId,
        param: param
      })
        .then(function(response) {
          var data = response.data.respData;
          if (response.data.respResult == 1 && data && data.length > 0) {
            // 如果是数据库，还要处理过滤条件
            let newData = [];
            for (let index = 0; index < data.length; index++) {
              const element = data[index];
              newData.push({
                tab_id: element.tab_id || element.tabName,
                phy_tab_name: element.phy_tab_name || element.tabName //数据库的表是tab_name
              });
            }
            _this.dealEntityData(newData);
            if (_this.curDimId && _this.firstLoad) {
              _this.tabFilterText = _this.oriDimInfo.phyTabName || "";
            }
            if(flag6 == "0"){ //模式为空不加载实体列表
                _this.tabFilterText = "";
                _this.dealEntityData([]);
                //清空表字段与维度
                _this.dimFieldData = [];
                _this.tabFilterText1 = "";
            }


          } else {
            if( _this.at > 1  && _this.schemaValue.length > 0){
                _this.$message.success("数据源表集合为空");
            }
               _this.dealEntityData([]);
          }
        })
        .catch(function(error) {
          console.error(error);
          // _this.$message.error("数据源表集合加载失败");
        })
        .finally(() => {
          _this.firstLoad = false;
          _this.tableSelLoading = false;
          _this.requestCount++;
          //加载完成关闭屏蔽
          _this.disabledFlag = false;
          _this.at++;
        });
    },
    dealEntityData(data) {
      this.entityListBak = Object.freeze(data);
      this.entityCurPage = 1;
      this.entityList = [];
      // 刷新实体表数据时滚动条重置到初始位置
      let selectorObj = document.querySelector(
        ".table-list-wrap.el-select-dropdown .el-select-dropdown__wrap"
      );
      if (selectorObj && typeof selectorObj.scrollTo === "function") {
        selectorObj.scrollTo(0, 0);
      }
      this.loadEntityData();
    },
    /*
    @param tabId 待查字段的表的id：tab_id
    */
    queryTabFields(tabId, isNeedReset = true) {
      if (!tabId) {
        this.dimFieldData = [];
        // 清空表 对应清空维度和维度过滤数据
        this.resetDimTbData("2");
        this.tabFilterText1 = "";
        this.remoteMethod("");
        return;
      }
      if (isNeedReset) {
        this.resetDimTbData("2");
        this.tabFilterText1 = "";
        this.dimFieldData = [];
      }
      let _this = this;
      let _param ={};
      if(_this.pgDataName.length > 0 && _this.pgDataName === 'vistool'){ //pg库
          _param = {
              dsId: _this.dataSrcValue.dsId,
              dsDbType: _this.dataSrcValue.dsType,
              tableNames: [tabId],
              tableSchema:_this.pgDataName,
              schemaName:_this.schemaValue
          };
      }
      else{
            _param = {
              dsId: _this.dataSrcValue.dsId,
              dsDbType: _this.dataSrcValue.dsType,
              tableNames: [tabId],
              schemaName:_this.schemaValue
          };
      }

      let colListKey = "tabColList";
      this.loadingFieldTab = true;
      this.queryTbFields({
        type: "database",
        param: _param
      })
        .then(function(response) {
          if (
            response.data.respResult == 1 &&
            response.data.respData &&
            response.data.respData.length > 0 &&
            response.data.respData[0][colListKey] &&
            response.data.respData[0][colListKey].length > 0
          ) {
            let data = response.data.respData[0][colListKey];
            for (let index = 0; index < data.length; index++) {
              data[index]["tab_chs_name"] =
                response.data.respData[0].tab_chs_name ||
                response.data.respData[0].tabAlias ||
                "";
              data[index]["phy_tab_name"] =
                response.data.respData[0].phy_tab_name ||
                response.data.respData[0].phyTabName ||
                "";
              data[index]["tab_id"] = data[index]["phy_tab_name"];
            }
            _this.dimFieldData = objClone(data, 1);
            if (!isNeedReset) {
              //编辑进来回显数据时
              _this.reqGetBackFlag += 1;
            }
            // 回填过滤条件
          } else {
            _this.$message.error("字段列表为空");
          }
        })
        .catch(function(error) {
          console.error(error);
          // _this.$message.error("字段详情加载失败");
        })
        .finally(() => {
          _this.loadingFieldTab = false;
          _this.requestCount++;
        });
    },
    indexMethod(index) {
      return index + 1;
    },
    resetDimTbData(type) {
      switch (type) {
        case "1": //静态维
          // this.staticDimData.push({
          //   dimValueDesc: "",
          //   dimValue: "",
          //   id: 0
          // });
          this.staticDimData = [
            {
              dimValueDesc: "",
              dimValue: "",
              id: 0
            }
          ];
          break;
        case "2": //动态维
          this.dynamicDimData = [
            {
              dimLevelName: "", //维层名称
              dimLevelCode: "", //维层编码
              dimLevelInfo: "", //维层描述
              dimLevelType: "", //从2.1.1字典查询服务获取   维层类型 待确认 是否必要
              dimValType: "2", //动态维层取值类型（1：手工输入SQL，2：配置表达式）
              sortField: "",
              id: 1
            }
          ];
          let keyId = this.dynamicDimData[0].id;
          this.$set(this.dimFilterMap, keyId, [this.getFilterRowEg()]);
          this.setDimFilterData(objDeepCopy(this.dimFilterMap[keyId]));
          break;
        case "3": //过滤条件
          this.setDimFilterData([]);

          break;
        default:
          break;
      }
    },
    // 构造维度字段待保存数据
    genDimReqData(isFromSaveAs = false) {
      let param = {};
      if (this.curDimId && !isFromSaveAs) {
        //只有保存 且是编辑状态才要传dimid
        param["dimId"] = this.curDimId;
      }
      param["dimName"] = this.pageName.trim();
      if (isFromSaveAs) {
        param["dimName"] = this.saveForm.pageName;
      }
      param["busInfo"] = (this.busInfo || "").trim();
      param["dimType"] = this.dimType;
      param["judgeState"] = 3;
      let dimLevelList = [],
        oriDimValList = [],
        oriDimLevelCnt = 0;
      switch (this.dimLevelGroup) {
        case "1":
          let dimLevel1 = {},
            oriDimLevel1 = {};
          let newDimValList = [];
          if (this.curDimId && !isFromSaveAs) {
            oriDimLevel1 = this.oriDimInfo.dimLevelList[0];
            dimLevel1["dimLevelId"] = oriDimLevel1.dimLevelId;
            oriDimValList = oriDimLevel1.dimValueDictionaryList || [];
            oriDimLevelCnt = oriDimValList.length || 0;
          }
          for (let index = 0; index < this.staticDimData.length; index++) {
            //已有的dimlevelid要保留，新加的就放空
            const element = this.staticDimData[index];
            let newItem = objDeepCopy(element);
            if (index < oriDimLevelCnt) {
              newItem = {
                ...objDeepCopy(oriDimValList[index]),
                ...objDeepCopy(element)
              };
              newItem["dimLevelId"] = oriDimValList[index]["dimLevelId"];
            } else {
              newItem["dimLevelId"] = "";
            }
            newDimValList.push(newItem);
          }
          dimLevel1 = {
            ...dimLevel1,
            ...{
              dimLevelGroup: this.dimLevelGroup,
              dimLevelName: param["dimName"],
              dimValueDictionaryList: newDimValList,
              dimValType: "2"
            }
          };
          dimLevelList.push(dimLevel1);
          break;
        case "2":
          for (let index = 0; index < this.dynamicDimData.length; index++) {
            const element = this.dynamicDimData[index];
            let dimLevelItem = objDeepCopy(element);
            dimLevelItem["dimLevelGroup"] = this.dimLevelGroup; //维层类别	1：常值，2：动态
            let tabId = (this.tabFilterText || "").trim();
            dimLevelItem["dimValType"] = "2"; //动态维层取值类型（1：手工输入SQL，2：配置表达式）
            dimLevelItem["isDataPermiss"] = "0";
            dimLevelItem["tabId"] = tabId;
            let dimValueExpList = [];
            let curDimLevelId = "";
            if (!isFromSaveAs) {
              curDimLevelId = element.dimLevelId ? element.dimLevelId : ""; //当前维层的维层id
            }
            ["dimLevelCode", "dimLevelInfo", "sortField"].forEach(
              (item, index2) => {
                let valExpItem = {
                  expType: index2 + 1,
                  tabId: tabId,
                  colId: element[item],
                  valueExp: element[item]
                  // ruleType 筛选条件才有
                };
                if (item === 'sortField' && element.ruleType) {
                  valExpItem['ruleType'] = element.ruleType
                }
                if (curDimLevelId) {
                  valExpItem["dimLevelId"] = curDimLevelId;
                }
                dimValueExpList.push(valExpItem);
              }
            );
            // 过滤条件
            let legalCondis = (this.dimFilterMap[element.id] || []).filter(
              item => {
                return item.colId != "";
              }
            );
            if (legalCondis.length > 0) {
              for (let index3 = 0; index3 < legalCondis.length; index3++) {
                const element3 = legalCondis[index3];
                let valueExp1 = this.genDimFilterData(element3);
                let filterItem = {
                  expType: 4,
                  tabId: tabId,
                  colId: element3.colId,
                  ruleType: element3.ruleType,
                  valueExp: valueExp1,
                  operaValue: (element3.operaValue || "").trim(),
                  symbol: element3.symbol
                };
                if (curDimLevelId) {
                  filterItem["dimLevelId"] = curDimLevelId;
                }
                dimValueExpList.push(filterItem);
              }
            }

            dimLevelItem["dimValueExpList"] = dimValueExpList;
            // 新增 dimLevelId parentDimLevelId，valueSql，relSql都为空
            // dimLevelList	parentDimLevelId	1	String		父维层编码
            dimLevelItem["dimLevelId"] = "";
            dimLevelItem["parentDimLevelId"] = "";
            dimLevelItem["valueSql"] = "";
            dimLevelItem["relSql"] = "";
            if (curDimLevelId) {
              dimLevelItem["dimLevelId"] = curDimLevelId;
            }
            dimLevelList.push(dimLevelItem);
          }
          param["tabList"] = this.genTabList();
          break;
        default:
          break;
      }
      param["dimLevelList"] = dimLevelList;
      this.saveDimInfo(param, isFromSaveAs);
    },
    saveDimInfo(param, isFromSaveAs = false) {
      this.saveDim(param)
        .then(response => {
          if (response.data.respResult === "1") {
            this.$message.success(
              isFromSaveAs ? "维度另存成功" : "维度保存成功"
            ); //保存成功要把最新的维度信息保存一份，不然再保存的时候dimlevelid什么信息不全编辑会有问题。
            this.dimensionLoading = false;
            document.title = param["dimName"] || "新增维度";
            this.pageName = param["dimName"] || "新增维度";
            if (!param.dimId) {
              if (response.data.respData) {
                this.curDimId =
                  response.data.respData.dimId ||
                  response.data.respData.dim_id ||
                  "";
              }
            }
            this.queryDimInfo(this.curDimId, false);
          } else {
            this.$message.error(
              response.data.respErrorDesc ||
                (isFromSaveAs ? "维度另存失败" : "维度保存失败")
            );
            this.dimensionLoading = false;
          }
        })
        .catch(error => {
          console.error(error);
          // this.$message.error(isFromSaveAs ? "维度另存失败" : "维度保存失败");
        });
    },
    // 新增维度需要把相关的表信息一起传到资产创建实体
    genTabList() {
      let tabList = [];
      let dbName = "";
      let userArr = (this.dataSrcValue.paramList || []).filter(item0 => {
        return item0.paramName === "user_name";
      });
      let dbArr = (this.dataSrcValue.paramList || []).filter(item0 => {
        return item0.paramName === "db_name";
      });
      if (userArr.length > 0) {
        // dbUser = userArr[0].paramValue;
      }
      if (dbArr.length > 0) {
        dbName = dbArr[0].paramValue;
      }
      let dsType = (this.dataSrcValue.dsType || "").toLowerCase();
      if(dsType.includes('postgresql') || dsType.includes('greenplum') || dsType.includes('sqlserver') || dsType.includes('vertica')){  //pg库
          // dbUser = this.schemaValue;
      }

      let tabColList = [];
      for (let index = 0; index < this.dimFieldData.length; index++) {
        const fieldItem = this.dimFieldData[index];
        let colItem = {
          ...fieldItem,
          ...{
            //  unit: fieldItem.unit,
            dataDype: fieldItem.data_type || "5",
            securityLevel: "4", //1:一级、2:二级、3三级、4:四级
            dimId: "",
            dimLevelId: "",
            is_null: "",
            alignType: "",
            isPartition: "",
            isPrimaryKey: "",
            isForeignKey: "",
            colRemark: "",
            colBusInfo: "",
            colTechCaliber: ""
          }
        };
        if (!colItem.colChsName) {
          colItem.colChsName = colItem.colName;
        }
        tabColList.push(colItem);
      }
     var tempDisposeList = {};

     if(dsType.includes('gbase') || dsType.includes('mysql')){  //gabse  与 mysql 的dbname、dbuser一样
        tempDisposeList = {
            disposeType: this.dataSrcValue.dsId,
            connId: this.dataSrcValue.dsId,
            dbUser: this.schemaValue,
            storageType: this.dataSrcValue.resourceTypeId,
            dbName: this.schemaValue
        }
     }else{
        tempDisposeList = {
            disposeType: this.dataSrcValue.dsId,
            connId: this.dataSrcValue.dsId,
            dbUser: this.schemaValue,
            storageType: this.dataSrcValue.resourceTypeId,
            dbName: dbName
        }
     }


      tabList.push({
        tabAlias: "",
        phyTabName: this.tabFilterText,
        tabChsName: this.tabFilterText,
        frameId: this.frameId,
        tabClassId: "",
        tabPathId: "",
        dataCycle: "99", //数据周期：1日、2月
        tabType: "2", //实体来源类型（2：业务数据表，7：配置数据表）
        securityLevel: "4",
        tenantId: sessionStorage.getItem("tenant_id"),
        reqNo: "",
        tabInfoDesc: "",
        tabColList: tabColList,
        disposeList: [
         tempDisposeList
        ]
      });
      return tabList;
    },
    // 获取维层类型列表
    getDicTypeList() {
      this.getDicValueList({
        typeId: "2076"
      })
        .then(response => {
          if (response.data.respResult === "1") {
            this.dimlvTypeData = response.data.respData || [];
          } else {
            this.dimlvTypeData = [];
            this.$message.error("维层类型列表查询失败");
          }
        })
        .catch(error => {
          this.dimlvTypeData = [];
          console.error(error);
          // this.$message.error("维层类型列表查询失败");
        });
    },
    /**
     * 校验属性值是否重名
     * @param
     * objArr:对象数组
     * keyName:要校验的属性名称
     * eg:checkKeyValDuplicated([{a:"1"},{a:"2"},{a:"1"}],"a")
     */
    checkKeyValDuplicated(objArr, keyName) {
      //校验维值不能重复
      let tempDimNameArr = [(objArr[0][keyName] || "").trim()];
      let flag = true;
      for (let index = 1; index < objArr.length; index++) {
        const element = objArr[index];
        const keyVal = (element[keyName] || "").trim();
        if (tempDimNameArr.includes(keyVal)) {
          flag = false;
          break;
        } else {
          tempDimNameArr.push(keyVal);
        }
      }
      return flag;
    },
    /**
     * 校验指定属性非空
     * @param
     * objArr:对象数组
     * keyNameArr:要校验的属性名称构成的字符串数组
     * eg:checkKeyValDuplicated([{a:"1",b:"2",c:""},{a:"2",b:"2",c:""},{a:"3",b:"",c:""}],["a","b"])
     */
    checkKeyValNull(objArr, keyNameArr) {
      let flag1 = true;
      for (let index = 0; index < objArr.length; index++) {
        const element = objArr[index];
        let flag2 = true;
        for (const key in element) {
          if (
            element.hasOwnProperty(key) &&
            keyNameArr.includes(key) &&
            (element[key] || "").trim() === ""
          ) {
            flag2 = false;
            break;
          }
        }
        if (!flag2) {
          flag1 = false;
          break;
        }
      }
      return flag1;
    },
    //查询维度详情
    /**
     * @param
     * isNeedFillBack:是否需要回填数据
     */
    queryDimInfo(dimId, isNeedFillBack = true) {
      this.getDimInfoById({
        dimId: dimId
      })
        .then(response => {
          if (response.data.respResult === "1") {
            let dimInfo = response.data.respData;
            if (dimInfo) {
              this.oriDimInfo = objDeepCopy(dimInfo);

            let _param = {};
            let _realThis = this;

            if(this.oriDimInfo.tabId)  {
                _param.tab_id = this.oriDimInfo.tabId;  //实体id
              //查询对应实体
              this.queryTbFields({    //拖入实体
                type: "da",
                param: _param
              }).then(response => {
                if (response.data.respResult == 1) {
                  let data = response.data.respData;
                  if (data.length > 0) {
                    this.schemaValue = data[0].dispose_list[0].db_user;
                    _realThis.oriDimInfo.schemaValue =
                      data[0].dispose_list[0].db_user; //设置模式值
                    _realThis.pgDataName = data[0].dispose_list[0].db_name; //设置库名
                  }
                }
              });
            }

            sessionStorage.setItem("dataSetCache", JSON.stringify(dimInfo));

            if (isNeedFillBack) {
              _realThis.fillBackDimInfo(dimInfo);
              // 查询数据源信息
             setTimeout(() =>{//延时500毫秒-解决回显时候无法填充模式值
                _realThis.getAllDataSrc();
              },500);

            } else if (
              //动态维保存后要把维层id回填到dynamicDimData中
              dimInfo.dimLevelList &&
              dimInfo.dimLevelList[0] &&
              dimInfo.dimLevelList[0].dimLevelGroup === "2"
            ) {
              for (
                let index = 0;
                index < dimInfo.dimLevelList.length;
                index++
              ) {
                const element = dimInfo.dimLevelList[index];
                _realThis.$set(
                  _realThis.dynamicDimData[index],
                  "dimLevelId",
                  element.dimLevelId
                );
              }
            }



              // window.sessionStorage.setItem(
              //   "dataSetCache",
              //   JSON.stringify(dimInfo)
              // );

              // if (isNeedFillBack) {
              //   this.fillBackDimInfo(dimInfo);
              //   // 查询数据源信息
              //   this.getAllDataSrc();
              // } else if (
              //   //动态维保存后要把维层id回填到dynamicDimData中
              //   dimInfo.dimLevelList &&
              //   dimInfo.dimLevelList[0] &&
              //   dimInfo.dimLevelList[0].dimLevelGroup === "2"
              // ) {
              //   for (
              //     let index = 0;
              //     index < dimInfo.dimLevelList.length;
              //     index++
              //   ) {
              //     const element = dimInfo.dimLevelList[index];
              //     this.$set(
              //       this.dynamicDimData[index],
              //       "dimLevelId",
              //       element.dimLevelId
              //     );
              //   }
              // }


            }
          } else {
            console.error(response.data.respErrorDesc);
            this.$message.error("获取维度详情失败");
          }
        })
        .catch(error => {
          console.error(error);
          // this.$message.error("获取维度详情失败");
        })
        .finally(() => {
          this.requestCount++;
          // if (this.loadingPage) {
          //   this.loadingPage = false;
          // }
        });
    },
    fillBackDimInfo(dimInfo) {
      this.connId = this.curDimId === "" ? "" : this.oriDimInfo.connId || "";
      let dimLevelGroup = "1";
      if ((dimInfo.dimLevelList || []).length > 0) {
        dimLevelGroup = dimInfo.dimLevelList[0].dimLevelGroup || "1";
      }
      this.dimLevelGroup = dimLevelGroup + "";
      this.pageName = dimInfo.dimName;
      this.dimType = dimInfo.dimType;
      this.busInfo = dimInfo.busInfo;
      switch (dimLevelGroup) {
        case "1":
          let dimValueDictionaryList = objDeepCopy(
            dimInfo.dimLevelList[0].dimValueDictionaryList
          );
          for (let index = 0; index < dimValueDictionaryList.length; index++) {
            dimValueDictionaryList[index]["id"] = index;
          }
          this.$nextTick(() => {
            this.staticDimData = dimValueDictionaryList;
          });
          break;
        case "2":
          this.tabFilterText = dimInfo.phyTabName || "";
          let dimLevelList = dimInfo.dimLevelList || [];
          let dynamicDimList = [];
          for (let index = 0; index < dimLevelList.length; index++) {
            const element = dimLevelList[index];
            const dimValueExpList = element.dimValueExpList || [];
            // expType:表达式类型（1：维度值字段，2：维度值描述字段，3排序字段，4：筛选条件）
            let dimLevelCode =
              this.getFilteredObj(dimValueExpList, "expType", "1")["colId"] ||
              "";
            let sortField =
              this.getFilteredObj(dimValueExpList, "expType", "3")["colId"] ||
              "";
            let dimLevelItem = {
              dimLevelName: element.dimLevelName,
              dimLevelCode: dimLevelCode,
              dimLevelInfo: element.dimLevelInfo,
              dimLevelType: element.dimLevelType,
              dimValType: element.dimValType,
              sortField: sortField,
              id: element.dimLevelId,
              dimLevelId: element.dimLevelId
            };
            let expList = element.dimValueExpList[2]
            if (expList && expList.ruleType) {
              dimLevelItem.ruleType = expList.ruleType
            }
            dynamicDimList.push(dimLevelItem);
          }
          this.dynamicDimData = dynamicDimList;
          break;
        default:
          break;
      }
    },
    /**
     * 根据属性值过滤数组
     * @param
     * objArr:对象数组
     * keyName:过滤条件的属性
     * keyVal:过滤条件的属性值
     * eg:getFilteredObj([{a:"1",b:"2"},{a:"3",b:"2"}],"a","1")
     */
    getFilteredObj(objArr, keyName, keyVal) {
      let result = objArr.filter(item => {
        return item[keyName] === keyVal;
      });
      return result[0] || {};
    },
    // 打开确认弹窗
    openConfirmDialog(text, callback) {
      this.$confirm(text, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        closeOnClickModal: false
      })
        .then(() => {
          callback();
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消"
          });
        });
    },
    deleteRow(type, index, event) {
      event.stopPropagation();
      this.toDelRow = { type, index };
      this.openConfirmDialog("是否删除该选项", this.delRowData);
    },
    /**
     * isEditFirst:是否编辑页面进来第一次查询
     */
    queryDbColTypes(dataSrcValue, isEditFirst = false) {
      this.queryDbColConf({ dbType: dataSrcValue.resourceTypeId })
        .then(response => {
          if (response.status == 200 && response.data.respResult == "1") {
            this.fieldTypeList = response.data.respData || {};
            this.$set(
              this.fieldTypeMap,
              dataSrcValue.resourceTypeId,
              objDeepCopy(this.fieldTypeList)
            );
            if (isEditFirst) {
              this.reqGetBackFlag += 1;
            }
          } else {
            this.fieldTypeList = {};
            this.$message.error("数据库字段类型查询失败");
          }
        })
        .catch(error => {
          this.fieldTypeList = {};
          console.error(error);
          // this.$message.error("数据库字段类型查询失败");
        });
    },
    // 重置维层类型的值
    resetDimLvType(dimType1) {
      let typeVal = "";
      if (dimType1 === "3") {
        //其他维，维层类型设成0
        typeVal = "0";
      }
      this.dynamicDimData.forEach((item, index) => {
        this.$set(this.dynamicDimData[index], "dimLevelType", typeVal);
      });
    },
    /**
     * 校验过滤条件
     */
    validateFilterCondis() {
      let flag = true,
        resultCondis = [];
      let oriFilterCondis = (this.dimFilterCondis || []).filter(item => {
        return item.colId !== "";
      });
      if (oriFilterCondis.length > 0) {
        //校验条件必选
        // { value: 20, label: "为空" }{ value: 21, label: "不为空" },  symbol-20,21 输入框为空，其他都不能为空
        for (let index = 0; index < oriFilterCondis.length; index++) {
          const element = oriFilterCondis[index];
          if (
            (element.operaValue || "").trim() === "" &&
            element.symbol != 20 &&
            element.symbol != 21
          ) {
            flag = false;
            break;
          }
        }
        resultCondis = flag ? oriFilterCondis : [];
      }
      return {
        flag,
        resultCondis
      };
    },
    switchRow(currentRow, oldCurrentRow) {
      if (oldCurrentRow && oldCurrentRow.id) {
        //切换前先校验过滤规则
        // 校验过滤字段 如果字段有选，当前行就必填，如果没填就剔除数据
        let filterValidate = this.validateFilterCondis();
        if (!filterValidate.flag) {
          this.$message.error("字段过滤规则不能为空");
          this.tableKey += 1;
          this.$nextTick(() => {
            this.$refs.dynamicTable.setCurrentRow(oldCurrentRow);
            this.curRow = objDeepCopy(oldCurrentRow);
          });
          return;
        } else {
          this.saveCurRowFilter(oldCurrentRow.id, filterValidate);
        }
      }
      // 切换
      this.switchRowHandler(currentRow);
    },
    // 保存当前选中行的过滤条件
    saveCurRowFilter(curRowId, filterValidate) {
      let condiArr = objDeepCopy(filterValidate.resultCondis);
      this.$set(
        this.dimFilterMap,
        curRowId,
        condiArr.length > 0 ? condiArr : [this.getFilterRowEg()]
      );
    },
    // 成功切换行
    switchRowHandler(currentRow) {
      if (
        this.curRow &&
        this.curRow.id &&
        currentRow &&
        currentRow.id &&
        currentRow.id === this.curRow.id
      ) {
        //如果前后一样，就不要切换
        return;
      }
      if (!currentRow) {
        return;
      }
      this.curRow = objDeepCopy(currentRow);
      if (!this.dimFilterMap[currentRow.id]) {
        this.$set(this.dimFilterMap, currentRow.id, [this.getFilterRowEg()]);
      }
      this.setDimFilterData(objDeepCopy(this.dimFilterMap[currentRow.id]));
    },
    // 构造维度过滤表达式
    genDimFilterData(condiItem) {
      const symbolMap = {
        number: [
          { value: 2, label: ">" },
          { value: 1, label: "<" },
          { value: 3, label: "=" },
          { value: 4, label: "<=" },
          { value: 5, label: ">=" },
          { value: 8, label: "in" }, //在…中（逗号隔开）
          { value: 9, label: "not in" } //不在…中（逗号隔开）
        ],
        char: [
          { value: 10, label: "like" }, //包含 //10:like,11:not like,8in =,9 not in ,20 为空，21 不为空
          { value: 11, label: "not like" }, //不包含
          { value: 8, label: "in" }, //在…中（逗号隔开）
          { value: 9, label: "not in" }, //不在…中（逗号隔开）
          { value: 20, label: "is null" }, //为空
          { value: 21, label: "is not null" } //不为空
        ]
      };
      let expression = "";
      let optLabel = symbolMap[condiItem.type].filter(item => {
        return item.value === condiItem.symbol;
      })[0].label;
      if (condiItem.type === "number") {
        switch (condiItem.symbol) {
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
            expression = `${
              condiItem.colId
            }${optLabel}${condiItem.operaValue.trim()}`;
            break;
          case 8:
          case 9:
            expression = this.genInSQLExp(condiItem, optLabel);
            break;
          default:
            break;
        }
      } else {
        switch (condiItem.symbol) {
          case 10:
          case 11:
            // like not like 要对模糊字段做个判断，如果字符串中包含like，要进行转义
            // select * from VT_PAGE_INFO where page_name like '%qq/%%' escape '/';
            let oriExp = condiItem.operaValue.trim();
            let isNeedEsc = /%/g.test(oriExp);
            if (isNeedEsc) {
              oriExp = oriExp.replace(/\%/g, "/%");
            }
            expression = `${condiItem.colId} ${optLabel} '%${oriExp}%'`;
            if (isNeedEsc) {
              expression += ` escape '/'`;
            }
            break;
          case 8:
          case 9:
            expression = this.genInSQLExp(condiItem, optLabel);
            break;
          case 20:
          case 21:
            expression = `${condiItem.colId} ${optLabel}`;
            break;
          default:
            break;
        }
      }
      return expression;
    },
    genInSQLExp(condiItem, optLabel) {
      let expression = "";
      // 构造单引号串
      let oriExp2 = (condiItem.operaValue || "").trim().split(",");
      let finalExp = "";
      oriExp2.forEach((expItem, index) => {
        if ((expItem || "").trim() != "") {
          if (finalExp.trim() != "") {
            finalExp += ",";
          }
          finalExp += `'${expItem}'`; //如果表达式里面有单引号，不做处理。
        }
      });
      expression = `${condiItem.colId} ${optLabel} (${finalExp})`;
      return expression;
    },
    // 生成过滤条件示例行
    getFilterRowEg() {
      return {
        ruleType: "1",
        colId: "",
        type: "",
        operaValue: "",
        symbol: 8,
        id: ++this.dimIdCounter
      };
    },
    // 选择维层编码时，排序字段默认选那个字段
    selDimCode(dimCodeVal, rowIndex) {
      this.$set(this.dynamicDimData[rowIndex], "sortField", dimCodeVal);
    },
    checkDimSort() {
      let res = {
        flag: true,
        index: -1
      };
      for (let index = 0; index < this.dynamicDimData.length; index++) {
        const element = this.dynamicDimData[index];
        if (
          ![element.dimLevelCode, element.dimLevelInfo].includes(
            element.sortField
          )
        ) {
          res.flag = false;
          res.index = index;
          break;
        }
      }
      return res;
    },
    scrollToRowIdx(tableId, rowIdx) {
      let tableObj = document.getElementById(tableId);
      try {
        let tr = tableObj
          .getElementsByClassName("el-table__body")[0]
          .getElementsByTagName("tr");
        if (tr && tr[rowIdx] && tr[rowIdx].scrollIntoView) {
          tr[rowIdx].scrollIntoView(true);
        }
      } catch (error) {}
    },
    sortFn(index, event) {
      event.stopPropagation()
      let ruleType = '3'
      if (Array.from(event.target.classList).includes('sort-down')) {
          ruleType = '4'
      }
      this.$set(this.dynamicDimData[index], 'ruleType', ruleType)
    }
  },
  computed: {
    ...mapState({
      fieldTypeMap: state => state.DataSetDesign.fieldTypeMap, //字段类型匹配映射
      dimFilterCondis: state => state.DataSetDesign.dimFilterData,
      dimFilterMap: state => state.DataSetDesign.dimFilterMap ,//所有维层过滤数据集合，以id为key
      userModeTip: state => state.DataSetDesign.userModeTip ,//区分各种数据库模式 提示语常量
      dataModeTip: state => state.DataSetDesign.dataModeTip ,//区分各种数据库模式 提示语常量
      shemaModeTip: state => state.DataSetDesign.shemaModeTip //区分各种数据库模式 提示语常量
    }),
    dimIdCounter: {
      //维度过滤行id计数器
      get: function() {
        return this.$store.state.DataSetDesign.dimIdCounter;
      },
      set: function(newValue) {
        this.setDimIdCounter(newValue);
      }
    },
    filterTitle() {
      let dimLevelName = "";
      if (this.curRow && this.curRow.id) {
        let res = this.dynamicDimData.filter(item => {
          return item.id === this.curRow.id;
        });
        dimLevelName = res.length > 0 ? res[0].dimLevelName : "";
      }
      return `数据过滤（${dimLevelName}）`;
    },
    isDemoBase() {
      return this.dataSrcValue.dsId !== 'demodb'
    }
  },
  watch: {
    dimLevelGroup(newVal, oldVal) {
      switch (newVal) {
        case "1": //静态维
          this.resetDimTbData("1");
          break;
        case "2": //动态维
          this.resetDimTbData("2");
          this.dataSrcValue = "";
          this.schemaValue = "";
          this.tabFilterText1 = "";
          this.tabFilterText = "";
          this.dimFieldData = [];
          break;
        default:
          break;
      }
    },
    dimFieldData(newVal) {
      this.setFieldOptions(objDeepCopy(newVal));
    },
    dataSrcValue(newVal) {
      if (newVal && newVal.resourceTypeId) {
        if (this.fieldTypeMap[newVal.resourceTypeId]) {
          this.fieldTypeList = objDeepCopy(
            this.fieldTypeMap[newVal.resourceTypeId]
          );
        } else {
          this.queryDbColTypes(newVal);
        }
      }
    },
    dimType(dimType1) {
      this.resetDimLvType(dimType1);
    },
    tabFilterText(val) {  //检索
      if (val == "") {   //非空时候进行检索
        this.remoteMethod(""); //第二个参数表示是否需要检索(1-需要   0-不需要)
      }
    },
    reqGetBackFlag(val) {
      if (val === 2 && this.dimLevelGroup === "2") {
        //回填过滤条件
        //两个请求都返回回来，然后再进行过滤字段都回显
        let dimLevelList = this.oriDimInfo.dimLevelList || [];
        for (let index = 0; index < dimLevelList.length; index++) {
          const element = dimLevelList[index];
          let filterExpList = (element.dimValueExpList || []).filter(item => {
            return item.expType === "4";
          });
          if (filterExpList.length === 0) {
            filterExpList = [this.getFilterRowEg()];
          } else {
            filterExpList.forEach((condiItem, index) => {
              let field = this.dimFieldData.filter(item => {
                return item.colId === condiItem.colId;
              });
              let type = "";
              if (field.length > 0) {
                type = fieldMatch(field[0].colType, this.fieldTypeList) || "";
              }
              filterExpList[index]["type"] = type;
              filterExpList[index]["symbol"] = parseInt(condiItem.symbol);
              filterExpList[index]["id"] = ++this.dimIdCounter;
            });
          }
          this.$set(this.dimFilterMap, element.dimLevelId, filterExpList);
        }

        this.reqGetBackFlag = 0;
      }
    },
    requestCount(newVal) {  //监听处理
      const sum = this.dimLevelGroup == "1" ? 1 : 4;
      if (this.loadingPage && sum == newVal) {
        this.loadingPage = false;
        // 默认选中第一行
        if (this.dynamicDimData.length > 0) {
          this.$nextTick(() => {
            this.$refs.dynamicTable.setCurrentRow(this.dynamicDimData[0]);
          });
        }
      }
    }
  },
  mounted() {
    this.reqGetBackFlag = 0;
    this.firstLoad = true;
    this.getDicTypeList();
    // this.$Watermark.set("main2", 60, 20, -40, 0);
    let dc = sessionStorage.getItem('dataSetCache');
    let pageInfo = JSON.parse(dc);
    document.title = pageInfo.dimName || "新增维度";
    if (pageInfo.dimId) {
      this.requestCount = 0;
      this.loadingPage = true;
      this.curDimId = pageInfo.dimId;
      this.oriDimInfo = objDeepCopy(pageInfo);
      this.connId = this.curDimId === "" ? "" : this.oriDimInfo.connId || "";
      this.queryDimInfo(pageInfo.dimId);
    } else {
      this.getAllDataSrc();
    }
    this.$nextTick(() => {
      this.rowDrag();
    });
  }
};
</script>
<style lang="scss" scoped>
$header-main-clr: #0a2b4c; // 头部背景色
$main-bg: #aaaaaa; // 设计区域背景色
$main-bg1: #fff; // 设计区域内层背景
$font-clr1: #fff; // 文字颜色1
$border-clr1: #0e3b67; // 输入框边框色
$input-bg-clr1: #0e3b67; // 输入框背景色
$font-clr2: #3f678d; // 输入框字体颜色
$border1: #afc0d0; // 边框色1
$main-color: #409eff; //主色调
$right-bg1: #2f5377; //右侧操作面板背景色
$font-main3: #333;
$hover-clr: #409eff; //鼠标经过颜色
$border-clr3: #498bce;
.el-header {
  &.design-page {
    height: 50px !important;
    line-height: 50px;
    background-color: $header-main-clr;

    .page-name {
      width: 230px;

      /deep/ .el-input__inner {
        border-color: $border-clr1;
        background-color: $border-clr1;
        color: $font-clr1;

        &::-webkit-input-placeholder {
          color: $font-clr2;
        }

        &:focus {
          border-color: $main-color;
        }
      }
    }

    .page-input {
      /deep/ .el-input__inner {
        animation: glow 800ms ease-out infinite alternate;
      }

      @keyframes glow {
        from {
          border: 1px solid $border-clr1;
        }
        to {
          border: 1px solid #45fffd;
        }
      }
    }
  }
}

.head-left {
  float: left;

  .to-main {
    color: $font-clr1;
    cursor: pointer;
    margin-right: 26px;
  }
}

.design-main {
  &.el-main {
    background-color: $main-bg;

    .query-design {
      width: 100%;
      height: 100%;
      background-color: $main-bg1;
      padding: 20px;

      /deep/ .el-scrollbar__wrap {
        overflow-x: hidden;
      }

      .left-block-wrap {
        padding: 0;
        &:first-child {
          padding-bottom: 20px;
        }
        & > div:first-child {
          height: 26px;
        }
        & > div {
          height: calc(100% - 27px);
          width: 100%;
        }
        /deep/.tb-sel-wrap.el-select {
          .el-input__inner {
            border-width: 0px;
            // padding: 0;
          }
          .el-input__suffix {
            visibility: hidden;
          }
          &:hover {
            .el-input__inner {
              border-width: 1px;
              border-color: $hover-clr;
              // padding: 0 15px;
            }
            .el-input__suffix {
              visibility: visible;
            }
          }
        }
        /deep/.tb-input-wrap.el-input {
          font-size: 12px;
          .el-input__inner {
            border-width: 0px;
            // padding: 0;
          }
          &:hover {
            .el-input__inner {
              border-width: 1px;
              border-color: $hover-clr;
              // padding: 0 15px;
            }
          }
        }
        // /deep/.el-table tr.current-row td,
        // /deep/.el-table tr.current-row + tr td {
        //   border-width: 1px 0;
        //   border-color: #afd6ff;
        //   &:first-child {
        //     border-left-width: 1px;
        //   }
        //   &:last-child {
        //     border-right-width: 1px;
        //   }
        // }
        /deep/.el-table .el-table__body tr.current-row > td {
          //  current-row
          border: 1px solid #afd6ff;
          border-width: 1px 0px;
          &:first-child {
            border-left-width: 1px;
          }
          &:last-child {
            border-right-width: 2px;
          }
        }
      }
    }
  }
}

.head-opt-btn {
  float: right;
  color: $font-clr1;
  font-size: 16px;

  i {
    margin-left: 26px;
    cursor: pointer;
  }
}

.opt-btn {
  display: none;
  position: absolute;
  right: 10px;
  top: 10px;
  cursor: pointer;

  &.active {
    display: inline-block;
  }
}

.is-vertical > .el-main {
  padding: 0;
}

.is-vertical > .el-container {
  height: calc(100% - 50px);
}

// 弹框标题头字体
.dialog-title {
  & > span {
    line-height: 24px;
    font-size: 18px;
    color: #303133;
  }
}

// 右侧面板
.right-opt-panel {
  background-color: $right-bg1;
  /deep/ .el-header {
    background-color: $border-clr1;
  }
  .item-block {
    margin-bottom: 12px;
    .sub-nav-title {
      color: $font-clr1;
      font-size: 16px;
      margin-bottom: 6px;
    }
    /deep/.is-focus .el-input__inner,
    /deep/.is-focus .el-textarea__inner {
      border-color: $main-color;
      background-color: $main-bg1;
      color: $font-main3;
    }
    /deep/.el-input__inner,
    /deep/.el-textarea__inner {
      color: $font-clr1;
      background-color: $input-bg-clr1;
      border: 1px solid $header-main-clr;
    }
    /deep/.el-input .el-input__inner:focus,
    /deep/.el-textarea .el-textarea__inner:focus {
      background-color: $main-bg1;
      color: #666666;
      border: 1px solid $hover-clr;
    }
    /deep/.el-select:hover .el-input__inner,
    /deep/.el-input:hover .el-input__inner,
    /deep/.el-textarea:hover .el-textarea__inner {
      border-color: $border-clr3;
    }
    /deep/.el-radio {
      color: $font-clr1;
    }
  }
}

/deep/.el-select.no-border-select {
  margin-top: 7px;
  width: 100px;
  .el-input__inner {
    border: none;
    background-color: transparent;
    color: $font-clr1;
    font-size: 16px;
  }
}
// 表格尾部的提示行
.tb-footer-wrap {
  width: calc(100% - 180px);
  &.t2 {
    div {
      display: inline-block;
      width: 50%;
      color: #c0c4cc;
      padding-left: 10px;
    }
  }
  &.t1 {
    div {
      display: inline-block;
      width: 20%;
      color: #c0c4cc;
      padding-left: 10px;
    }
  }
}
// 表格输入框
/deep/.cell-edit-input .el-input__inner {
  height: 24px;
  line-height: 24px;
}
.table-icon {
  color: $main-color;
  font-size: 14px;
  margin-right: 20px;
  cursor: pointer;
  vertical-align: -4px;
  &:hover {
    color: #66b1ff;
  }
  &:last-child {
    margin-right: 0;
  }
}
/* .sort-wrap {
  height: 20px;
  display: inline-block;
  vertical-align: middle;
  margin-right: 10px;
  span {
    font-size: 12px;
    color: $border1;
    margin-left: -5px;
    font-weight: bold;
    cursor: pointer;
    &.sort-selected {
      color: $hover-clr;
    }
  }
} */
.sort-wrap {
  width: 12px;
  height: 20px;
  display: inline-block;
  vertical-align: middle;
  margin-top: 2px;
  margin-right: 20px;
  span {
    font-size: 12px;
    height: 8px;
    margin-bottom: 1px;
    display: block;
    width: 12px;
    color: $border1;
    cursor: pointer;
    &.sort-selected {
      color: $hover-clr;
    }
  }
}
/deep/.field-tb-wrap.el-table {
  color: $font-clr1;
  background-color: transparent;
  &.el-table--enable-row-hover .el-table__body tr:hover > td {
    background-color: transparent;
  }
  &::before {
    background-color: transparent;
  }
  thead tr,
  thead th,
  tr {
    background-color: transparent;
  }
  th > .cell {
    color: $main-color;
  }
  td {
    border-bottom-style: dashed;
    border-bottom-color: #557fa7;
  }
  .el-table__body tr:last-child td {
    border-bottom: none;
  }
}

// 表格下拉框面板 文本过长限制
.tb-sel-pop-wrap .tb-sel-opt-label {
  display: inline-block;
  // width: 129px;
  max-width: 290px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/deep/ .el-table__body-wrapper::-webkit-scrollbar-thumb {
  // background-color: transparent;
}
/deep/ .el-table {
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    opacity: 0;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 4.5px;
    border: none;
    background-color: rgba(144, 147, 153, 0.3);
  }
  ::-webkit-scrollbar-thumb:hover {
    background-color: rgba(144, 147, 153, 0.5);
  }
}

/deep/.desc-wrap.el-textarea .el-textarea__inner {
  max-height: 102px;
}
.warn-tip {
  float: right;
  color: #f56c6c;
  &::before {
    content: "*";
    color: #f56c6c;
    margin-right: 4px;
    vertical-align: -3px;
  }
}
</style>
<style>
/* 即席设计 查询条件区域 级联下拉框 面板宽度调整 */
.cascader-drop-wrap.el-popper .el-cascader-menu {
  min-width: 178px;
}
.el-table__body-wrapper::-webkit-scrollbar-track {
  /* background-color: rgba(255, 255, 255, 0.5); 设置背景透明
   */
  background-color: transparent !important;
}
</style>
