<template>
<div>
  <el-tabs v-model="activeName" class="qryHis" @tab-click="getTabData" v-if="this.menuClassTypeId === '1002' || this.menuClassTypeId == '1004' || this.menuClassTypeId == 'drive'">

    <el-tab-pane label="流水" name="first" v-if="this.menuClassTypeId!= '1001' ">
      <el-table
        :data="tableData"
        style="width: 100%"
        size="mini"
        height="250"
        :default-sort="{prop: 'create_time', order: 'descending'}"
        @cell-dblclick="cellDbEdit"
      >
        <el-table-column prop="create_time" label="查询时间" width="140"></el-table-column>
        <el-table-column prop="query_name" label="查询条件名称" :show-overflow-tooltip="true" width="140">
          <template slot-scope="scope">
            <span v-if="!scope.row.editeFlag">{{ scope.row.query_name }}</span>
            <span v-if="scope.row.editeFlag">
              <el-input
                class="cell-edit-input"
                ref="cellInput"
                v-model="scope.row.query_name"
                @blur="inputBlur(scope.row,scope.$index)"
              ></el-input>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="query_where_desc" :show-overflow-tooltip="true" label="查询条件"></el-table-column>
        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="查询">
              <span class="icon-A10089_search table-icon" @click="hisQuery(scope.$index)"></span>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="保存" placement="top-start">
              <span
                class="icon-A10404_collection table-icon"
                @click="saveHis(scope.row, scope.$index)"
              ></span>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="删除" placement="top-start">
              <span class="icon-A10065_delete table-icon" @click="delHis(scope.$index, tableData)"></span>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <div class="liushui">
        <span class="star">*</span>
        <span class="tips">双击可修改查询条件名称</span>
      </div>
    </el-tab-pane>

    <el-tab-pane label="收藏" name="second" v-if="this.menuClassTypeId!= '1001'">
      <el-table :data="collectData" style="width: 100%" size="mini" height="250">
        <el-table-column prop="query_time" label="查询时间" width="150"></el-table-column>
        <el-table-column prop="query_name" label="查询条件名称" width="140"></el-table-column>
        <el-table-column prop="query_where_desc" :show-overflow-tooltip="true" label="查询条件"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="预览">
              <span class="icon-A10089_search table-icon" @click="favQuery(scope.$index)"></span>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="删除" placement="top-start">
              <span class="icon-A10065_delete table-icon" @click="delFav(scope.row.fav_id)"></span>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="10"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-tab-pane>


    <el-tab-pane label="导出" name="third"  v-if="this.menuClassTypeId!= '1001'">
      <el-table
        v-loading="asynLoading"
        :data="exportData"
        style="width: 100%"
        size="mini"
        height="250"
      >
        <el-table-column prop="export_id" width="150" label="id" v-if="false"></el-table-column>
        <el-table-column prop="export_srlId" width="150" label="srlid" v-if="false"></el-table-column>
        <el-table-column prop="export_filename" width="150" label="id" v-if="false"></el-table-column>
        <el-table-column prop="export_type" width="150" label="exportType" v-if="false"></el-table-column>
        <el-table-column prop="export_time" width="180" label="导出提交时间"></el-table-column>
         <el-table-column prop="export_state" label="状态">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" :content="scope.row.export_err_msg" placement="top-start" v-if="scope.row.export_state=='异常' || scope.row.export_state=='推送失败'">
              <span style="color:#F56C6C">{{scope.row.export_state}}</span>
           </el-tooltip>

          <el-tooltip class="item" effect="dark" :content="scope.row.export_sucess_msg" placement="top-start" v-if="scope.row.export_state=='推送成功' || scope.row.export_state=='完成'">
            <span
              style="color:#409EFF"
              v-if="scope.row.export_state=='完成' || scope.row.export_state=='推送成功'"
            >{{scope.row.export_state}}</span>
          </el-tooltip>

           <span v-if="scope.row.export_state=='正在执行' || scope.row.export_state=='初始化'">{{scope.row.export_state}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="export_count" label="总记录数"></el-table-column>
        <el-table-column prop="export_size" label="文件大小" v-if="false"></el-table-column>
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
            <el-tooltip class="item" effect="dark" content="刷新" placement="top-start">
              <span class="icon-A10280-refresh table-icon" @click="reExport(scope.row)"></span>
              <span
                v-if="scope.row.export_state=='异常'"
                class="icon-A10280-refresh table-icon"
                @click="reExport(scope.row)"
              ></span>
              <span v-else class="icon-A10280-refresh table-icon disabled"></span>
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
    </el-tab-pane>
  </el-tabs>

<div v-if="this.menuClassTypeId == '1001'">
    <el-table
        v-loading="asynLoading"
        :data="exportData"
        style="width: 100%"
        size="mini"
        height="250"
      >
        <el-table-column prop="export_id" width="150" label="id" v-if="false"></el-table-column>
        <el-table-column prop="export_srlId" width="150" label="srlid" v-if="false"></el-table-column>
        <el-table-column prop="export_filename" width="150" label="id" v-if="false"></el-table-column>
        <el-table-column prop="export_type" width="150" label="exportType" v-if="false"></el-table-column>
        <el-table-column prop="export_time" width="180" label="导出提交时间"></el-table-column>
        <el-table-column prop="export_state" label="状态">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" :content="scope.row.export_err_msg" placement="top-start" v-if="scope.row.export_state=='异常' || scope.row.export_state=='推送失败'">
              <span style="color:#F56C6C">{{scope.row.export_state}}</span>
           </el-tooltip>

          <el-tooltip class="item" effect="dark" :content="scope.row.export_sucess_msg" placement="top-start" v-if="scope.row.export_state=='推送成功' || scope.row.export_state=='完成'">
            <span
              style="color:#409EFF"
              v-if="scope.row.export_state=='完成' || scope.row.export_state=='推送成功'"
            >{{scope.row.export_state}}</span>
          </el-tooltip>

           <span v-if="scope.row.export_state=='正在执行' || scope.row.export_state=='初始化'">{{scope.row.export_state}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="export_count" label="总记录数"></el-table-column>
        <el-table-column prop="export_size" label="文件大小" v-if="false"></el-table-column>
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
            <el-tooltip class="item" effect="dark" content="重新下载" placement="top-start">
              <span class="icon-A10280-refresh table-icon" @click="reExport(scope.row)"></span>
              <span
                v-if="scope.row.export_state=='异常'"
                class="icon-A10280-refresh table-icon"
                @click="reExport(scope.row)"
              ></span>
              <span v-else class="icon-A10280-refresh table-icon disabled"></span>
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
</div>

</template>


<script>
import { mapState, mapGetters, mapMutations, mapActions } from "vuex";
import { service } from 'ngbd-utils'
export default {
  data() {
    return {
      asynLoading: false,
      websocket: null,
      activeName: "first",
      options: [
        {
          label: "sum",
          value: "2"
        },
        {
          label: "count",
          value: "1"
        },
        {
          label: "avg",
          value: "3"
        },
        {
          label: "max",
          value: "4"
        },
        {
          label: "min",
          value: "5"
        }
      ],
      tableData: [],
      collectData: [],
      exportData: [],
      currentPage: 1,
      total: 1,
      expStateDic: {
        "0": "初始化",
        "1": "正在执行",
        "2": "完成",
        "3": "异常",
        "4": "最终文件处理",
        "5": "推送成功",
        "6": "推送失败"

      },
      exportPagination: {
        total: 0,
        start: 1,
        pageSize: 10
      }
    };
  },
  computed: {
    summarizeDialog: {
      get() {
        return this.$store.state.compt.QueryHistory;
      },
      set(value) {
        this.setQueryHistory(value);
      }
    },
    ...mapState({
      renderEngine: state => state.renderEngine,
      historyData: state => state.QueryTable.historyData,
      s_edcuiCompts: state => state.compt.s_edcuiCompts,
      pageCache: state => state.HomeBody.pageCache,
      allColsData: state => state.QueryTable.allColsData,
      tableCols: state => state.QueryTable.tableCols,
      cur_condiData: state => state.QueryTable.cur_condiData,
      tabActive: state => state.AsynExport.tabActive,
      websocketUrl: state => state.commonProperties.websocketUrl, //websocket地址
      trackData: state => state.QueryTable.trackData,
      dimList: state => state.QueryTable.dimList,
      msuList: state => state.QueryTable.msuList,
      menuClassTypeId: state => state.HomeTree.menuClassTypeId,
      filesync: state => state.commonProperties.filesync//各地本地化差异配置(湖南导出文件特殊处理)
    }),
    ...mapGetters({
      condiCols: "QueryTable/condiCols",
      resultCols: "QueryTable/resultCols",
      tableColumn: "QueryTable/tableColumn",
      summarizeCols: "QueryTable/summarizeCols"
    })
  },
  methods: {
    cellDbEdit(row, column, cell, event) {
      if (column.label === "查询条件名称") {
        row.editeFlag = true;
        this.$nextTick(() => {
          this.$refs.cellInput.focus();
        });
      }
    },
    inputBlur(row, index) {
      row.editeFlag = false;
      this.historyData[index].queryName = row.query_name;
    },
    dealTableData() {
      let condiParam = this.historyData;
      this.tableData = [];
      for (let i = 0; i < condiParam.length; i++) {
        if (!condiParam[i].queryName) {
          condiParam[i].queryName = "查询条件";
        }
        let tim = condiParam[i].time;
        let condiCont =
          condiParam[i].queryType === "summarize" ? "汇总:有" : "汇总:无";
        for (let j = 0; j < condiParam[i].condi.length; j++) {
          if (condiParam[i].condi[j].comptAttrs.is_import) {
            let trackSymbol = condiParam[i].condi[j].comptAttrs.import_symbol;
            let trackLabel = condiParam[i].condi[j].comptAttrs.import_tabLabel;
            // let trackRelation = "";
            if (trackLabel) {
              switch (trackSymbol) {
                case "100":
                  condiCont +=
                    " " +
                    condiParam[i].condi[j].comptAttrs.col_chs_name +
                    ":" +
                    "跟踪群-在" +
                    trackLabel +
                    "中";
                  break;
                case "101":
                  condiCont +=
                    " " +
                    condiParam[i].condi[j].comptAttrs.col_chs_name +
                    ":" +
                    "跟踪群-不包含" +
                    trackLabel;
                  break;
                default:
                  condiCont +=
                    " " +
                    condiParam[i].condi[j].comptAttrs.col_chs_name +
                    ":默认";
                  break;
              }
            } else {
              condiCont +=
                " " + condiParam[i].condi[j].comptAttrs.col_chs_name + ":默认";
            }
          } else {
            if (condiParam[i].condi[j].comptAttrs.type == "ElButton") {
              //return false;
            } else if (condiParam[i].condi[j].comptAttrs.type == "ElInput") {
              //文本类型
              let value = condiParam[i].condi[j].comptAttrs.m_value;
              let rela = condiParam[i].condi[j].comptAttrs.symbol; //10 包含 11 不包含 8 在…中（逗号隔开）9不在…中（逗号隔开）20为空 21不为空
              let relation = "";
              if (value == null) {
                value = "默认";
                condiCont +=
                  " " +
                  condiParam[i].condi[j].comptAttrs.col_chs_name +
                  ": " +
                  value;
              } else {
                switch (rela) {
                  case 10:
                    relation = "包含";
                    condiCont +=
                      " " +
                      condiParam[i].condi[j].comptAttrs.col_chs_name +
                      ": " +
                      relation +
                      value;
                    break;
                  case 11:
                    relation = "不包含";
                    condiCont +=
                      " " +
                      condiParam[i].condi[j].comptAttrs.col_chs_name +
                      ":" +
                      relation +
                      value;
                    break;
                  case 8:
                    condiCont +=
                      " " +
                      condiParam[i].condi[j].comptAttrs.col_chs_name +
                      ":在" +
                      value +
                      "中（逗号隔开）";
                    break;
                  case 9:
                    condiCont +=
                      " " +
                      condiParam[i].condi[j].comptAttrs.col_chs_name +
                      ":不在" +
                      value +
                      "中（逗号隔开）";
                    break;
                  case 20:
                    relation = "为空";
                    condiCont +=
                      " " +
                      condiParam[i].condi[j].comptAttrs.col_chs_name +
                      ":" +
                      value +
                      relation;
                    break;
                  case 21:
                    relation = "不为空";
                    condiCont +=
                      " " +
                      condiParam[i].condi[j].comptAttrs.col_chs_name +
                      ":" +
                      value +
                      relation;
                    break;
                }
              }
            } else if (
              condiParam[i].condi[j].comptAttrs.type == "ElDatePicker"
            ) {
              //日期
              if (condiParam[i].condi[j].comptAttrs.m_value.length > 1) {
                //区间
                let data1 = condiParam[i].condi[j].comptAttrs.m_value[0];
                let data2 = condiParam[i].condi[j].comptAttrs.m_value[1];

                if (data1 != "" && data1 != null && data2 != "" && data2 != null) {
                  condiCont +=
                    " " +
                    condiParam[i].condi[j].comptAttrs.col_chs_name +
                    ":" +
                    data1 +
                    "至" +
                    data2;
                } else if (data1 != "" && data1 != null && (data2 == "" ||  data2 == null)) {
                  condiCont +=
                    " " +
                    condiParam[i].condi[j].comptAttrs.col_chs_name +
                    ":" +
                    data1;
                } else if ((data1 == "" || data1 == null) && data2 != "" && data2 != null) {
                  condiCont +=
                    " " +
                    condiParam[i].condi[j].comptAttrs.col_chs_name +
                    ":" +
                    data2;
                } else if ((data1 == "" || data1 == null) && (data2 == "" ||  data2 == null)) {
                  condiCont +=
                    " " +
                    condiParam[i].condi[j].comptAttrs.col_chs_name +
                    ":默认";
                }
              } else {
                let data1 = condiParam[i].condi[j].comptAttrs.m_value[0];
                if (data1) {
                  condiCont +=
                    " " +
                    condiParam[i].condi[j].comptAttrs.col_chs_name +
                    ":" +
                    data1;
                } else if (data1 == null || data1 == "") {
                  condiCont +=
                    " " +
                    condiParam[i].condi[j].comptAttrs.col_chs_name +
                    ":默认";
                }
              }
            } else if (condiParam[i].condi[j].comptAttrs.type == "ElNumber") {
              let label_1 = "";
              let value_1 = "";
              let label_2 = "";
              let value_2 = "";
              if (
                condiParam[i].condi[j].comptAttrs.numList[0].label !=
                  undefined &&
                condiParam[i].condi[j].comptAttrs.numList[0].m_value !=
                  undefined
              ) {
                value_1 = condiParam[i].condi[j].comptAttrs.numList[0].m_value;
                switch (condiParam[i].condi[j].comptAttrs.numList[0].label) {
                  case 1:
                    label_1 = "<";
                    break;
                  case 2:
                    label_1 = ">";
                    break;
                  case 3:
                    label_1 = "=";
                    break;
                  case 4:
                    label_1 = "<=";
                    break;
                  default:
                    label_1 = ">=";
                    break;
                }
              }
              if (condiParam[i].condi[j].comptAttrs.numList.length > 1) {
                if (
                  condiParam[i].condi[j].comptAttrs.numList[1].label !=
                    undefined &&
                  condiParam[i].condi[j].comptAttrs.numList[1].m_value !=
                    undefined
                ) {
                  value_2 =
                    condiParam[i].condi[j].comptAttrs.numList[1].m_value;
                  switch (condiParam[i].condi[j].comptAttrs.numList[1].label) {
                    case 1:
                      label_2 = "<";
                      break;
                    case 2:
                      label_2 = ">";
                      break;
                    case 3:
                      label_2 = "=";
                      break;
                    case 4:
                      label_2 = "<=";
                      break;
                    default:
                      label_2 = ">=";
                      break;
                  }
                }
              }
              if (!value_1 && !value_2) {
                condiCont +=
                  " " +
                  condiParam[i].condi[j].comptAttrs.col_chs_name +
                  ":" +
                  "默认";
              } else if (value_1 && value_2) {
                let radioCalcu = condiParam[i].condi[j].comptAttrs.radioCalcu;
                radioCalcu = radioCalcu == "and" ? "且" : "或";
                condiCont +=
                  " " +
                  condiParam[i].condi[j].comptAttrs.col_chs_name +
                  ":" +
                  label_1 +
                  value_1 +
                  radioCalcu +
                  label_2 +
                  value_2;
              } else if (label_1 && value_1) {
                condiCont +=
                  " " +
                  condiParam[i].condi[j].comptAttrs.col_chs_name +
                  ":" +
                  label_1 +
                  value_1;
              } else if (label_2 && value_2) {
                condiCont +=
                  " " +
                  condiParam[i].condi[j].comptAttrs.col_chs_name +
                  ":" +
                  label_2 +
                  value_2;
              }
            } else if (condiParam[i].condi[j].comptAttrs.type == "ElCascader") {
              let comptAttrs = condiParam[i].condi[j].comptAttrs;
              let optionsString = "";

              //地市
              if (comptAttrs.m_value[0]) {
                if (comptAttrs.conArea === "single") {
                  condiCont +=
                    comptAttrs.col_chs_name +
                    ":" +
                    comptAttrs.m_label[comptAttrs.m_label.length - 1];
                } else if (comptAttrs.conArea === "mutiple") {
                  comptAttrs.m_label.forEach(function(value) {
                    optionsString += value + ",";
                  });
                  condiCont +=
                    comptAttrs.col_chs_name + ":" + optionsString.slice(0, -1);
                }
              } else if (!comptAttrs.m_value[0]) {
                condiCont += comptAttrs.col_chs_name + ":" + "默认";
              }
            }
          }
          condiCont += " ";
        }
        var obj = {
          create_time: tim,
          query_name: condiParam[i].queryName,
          query_where_desc: condiCont,
          editeFlag: false
        };
        this.tableData.push(obj);
      }
    },
    getAllFavList() {
      if(this.pageCache && !this.pageCache.pageId){
        this.collectData = [];
        this.total = 0;
        return;
      }
      let param = {
        query_user: window.sessionStorage.getItem("user_id"),
        page_id: this.pageCache.pageId
      };
      service({
        maskOff: true,
        url: this.renderEngine + "/his/queryFavList",
        method: "post",
        data: param,
        headers: {
          "Content-Type": "application/json"
        }
      }).then(response => {
        if (response.data.respResult == 1) {
          let data = response.data.respData;
          this.total = data.length;
          if (data.length != 0) {
            this.collectData = data;
          } else {
            this.collectData = [];
          }
        }
      });
    },
    hisQuery(index) {
      let fieldList = this.s_edcuiCompts[0].comptAttrs.fieldList;
      let historyData = this.historyData[index].condi;
      for (let i = 1; i < fieldList.length; i++) {
        let field_comptAttrs = fieldList[i].comptAttrs;
        for (let j = 1; j < historyData.length; j++) {
          let history_comptAttrs = historyData[j].comptAttrs;
          if (field_comptAttrs.is_import && history_comptAttrs.is_import) {
            if (this.pageCache.trackData.length > 0) {
              let trackDataArr = [];
              this.pageCache.trackData.forEach(data => {
                trackDataArr.push(data.value);
              });
              if (
                !trackDataArr.includes(history_comptAttrs.import_tabId) &&
                history_comptAttrs.import_tabId
              ) {
                this.$message.error("跟踪群已清理，请再次导入！");
                return false;
              } else {
                field_comptAttrs.import_symbol =
                  history_comptAttrs.import_symbol;
                field_comptAttrs.import_tabId = history_comptAttrs.import_tabId;
                field_comptAttrs.import_tabLabel =
                  history_comptAttrs.import_tabLabel;
                field_comptAttrs.import_tabName =
                  history_comptAttrs.import_tabName;
              }
            } else {
              this.$message.error("跟踪群已清理，请再次导入！");
              return false;
            }
          } else if (field_comptAttrs.element_id === history_comptAttrs.element_id) {
            switch (fieldList[i].type) {
              case "ElNumber":
                field_comptAttrs.numList = [...history_comptAttrs.numList];
                break;
              case "ElCascader":
                field_comptAttrs.conArea = history_comptAttrs.conArea;
                field_comptAttrs.m_value = [...history_comptAttrs.m_value];
                if (history_comptAttrs.m_label) {
                  field_comptAttrs.m_label = [...history_comptAttrs.m_label];
                }
                if(field_comptAttrs.conArea === "mutiple"){
                  field_comptAttrs["treeSelVal"] = [...(history_comptAttrs.treeSelVal || [])];
                }
                break;
              case "ElInput":
                field_comptAttrs.symbol = history_comptAttrs.symbol;
                field_comptAttrs.m_value = history_comptAttrs.m_value;
                break;
              case "ElDatePicker":
                field_comptAttrs.m_value = [...history_comptAttrs.m_value];
                break;
            }
          }
        }
      }
      this.summarizeDialog = false;
      this.queryInfo(this.historyData[index]);
    },
    favQuery(index) {
      let queryWhere = JSON.parse(this.collectData[index].query_where);
      let fieldList = this.s_edcuiCompts[0].comptAttrs.fieldList;
      for (let i = 1; i < fieldList.length; i++) {
        let field_comptAttrs = fieldList[i].comptAttrs;
        for (let j = 1; j < queryWhere.condi.length; j++) {
          let query_comptAttrs = queryWhere.condi[j].comptAttrs;
          if (field_comptAttrs.is_import && query_comptAttrs.is_import) {
            if (this.pageCache.trackData.length > 0) {
              let trackDataArr = [];
              this.pageCache.trackData.forEach(data => {
                trackDataArr.push(data.value);
              });
              if (
                !trackDataArr.includes(query_comptAttrs.import_tabId) &&
                query_comptAttrs.import_tabId
              ) {
                this.$message.error("跟踪群已清理，请再次导入！");
                return false;
              } else {
                field_comptAttrs.import_symbol = query_comptAttrs.import_symbol;
                field_comptAttrs.import_tabId = query_comptAttrs.import_tabId;
                field_comptAttrs.import_tabLabel =
                  query_comptAttrs.import_tabLabel;
                field_comptAttrs.import_tabName =
                  query_comptAttrs.import_tabName;
              }
            } else {
              this.$message.error("跟踪群已清理，请再次导入！");
              return false;
            }
          } else if (field_comptAttrs.element_id === query_comptAttrs.element_id) {
            switch (fieldList[i].type) {
              case "ElNumber":
                field_comptAttrs.numList = [...query_comptAttrs.numList];
                break;
              case "ElCascader":
                field_comptAttrs.conArea = query_comptAttrs.conArea;
                field_comptAttrs.m_value = [...query_comptAttrs.m_value];
                if (query_comptAttrs.m_label) {
                  field_comptAttrs.m_label = [...query_comptAttrs.m_label];
                }
                if(field_comptAttrs.conArea === "mutiple"){
                  field_comptAttrs["treeSelVal"] = [...(query_comptAttrs.treeSelVal || [])];
                }
                break;
              case "ElInput":
                field_comptAttrs.symbol = query_comptAttrs.symbol;
                field_comptAttrs.m_value = query_comptAttrs.m_value;
                break;
              case "ElDatePicker":
                field_comptAttrs.m_value = [...query_comptAttrs.m_value];
                break;
            }
          }
        }
      }
      this.summarizeDialog = false;
      this.queryInfo(queryWhere);
    },
    queryInfo(historyData) {
      let _this = this;
      let queryType = historyData.queryType;
      // let config = historyData.config;
      this.s_edcuiCompts[1].comptAttrs.pagination.currentPage = 1;
      this.setDimList(historyData.dimList);
      this.setMsuList(historyData.msuList);
      this.setQueryType(queryType);
      this.upLoading(true);
      //结果参数
      let params = {
        head_bean: {
          pageCount: this.s_edcuiCompts[1].comptAttrs.pagination.pageSize,
          start: ""
        }
      };
      this.queryAfPropertyData({ params })
        .then(function(response) {
          if (response.data.respResult == 1 && response.status == 200) {
            let respData = response.data.respData;
            let dataList = [];
            try {
              _this.s_edcuiCompts[1].comptAttrs.pagination.total = parseInt(
                response.data.respData.total_count
              );
              dataList = respData.result_data_list;
            } catch (e) {
              console.error(e);
            }
            let colList = [];
            if (queryType == "list") {
              colList = _this.resultCols.select_list;
              _this.setTabtag("false");
            } else if (queryType == "summarize") {
              colList = _this.summarizeCols || [];
              _this.setTabtag("true");
            }
            _this.s_edcuiCompts[1].comptAttrs.columns = [];
            _this.s_edcuiCompts[1].comptAttrs.tableattrs.data = [];
            _this.s_edcuiCompts[1].comptAttrs.columns = _this.tableColumn;
            for (var i = 0; i < dataList.length; i++) {
              var rows = dataList[i].data_list;
              var temp = {};
              for (var j = 0; j < rows.length; j++) {
                var item = colList[j].element_id;
                temp[item] = rows[j].data_val;
              }
              _this.s_edcuiCompts[1].comptAttrs.tableattrs.data.push(temp);
            }
          } else {
            _this.$message.error("数据更新失败");
          }
          _this.upLoading(false);
        })
        .catch(function(error) {
          _this.upLoading(false);
          // _this.$message.error("数据更新失败");
        });
    },
    saveHis(row, index) {
      let param = {
        query_name: row.query_name,
        query_where: JSON.stringify(this.historyData[index]),
        query_where_desc: row.query_where_desc,
        query_user: window.sessionStorage.getItem("user_id"),
        query_time: row.create_time,
        create_user: this.pageCache.createUser,
        update_user: this.pageCache.updateUser,
        page_id: this.pageCache.pageId
      };
      service({
        maskOff: true,
        url: this.renderEngine + "/his/insertFav",
        method: "post",
        data: param,
        headers: {
          "Content-Type": "application/json"
        }
      }).then(response => {
        if (response.data.respResult == 1) {
          this.$message({
            message: "收藏成功",
            type: "success"
          });
          this.delHis(index);
        } else {
          this.$message.error("收藏失败");
        }
      });
    },
    delHis(rowIndex) {
      this.tableData.splice(rowIndex, 1);
      this.historyData.splice(rowIndex, 1);
    },
    delFav(fav_id) {
      service({
        maskOff: true,
        url: this.renderEngine + "/his/deleteFav",
        method: "post",
        data: [fav_id],
        headers: {
          "Content-Type": "application/json"
        }
      }).then(response => {
        this.getAllFavList();
        this.$message({
          message: "删除成功",
          type: "success"
        });
      });
    },
    getTabData() {
      if (this.activeName == "first") {
        this.dealTableData();
      } else if (this.activeName == "second") {
        this.getAllFavList();
      } else if (this.activeName == "third") {
        if (this.exportData.length > 0) {
          return;
        }
        this.getAsynExportData();
      }
    },
    handleSizeChange(val) {},
    handleCurrentChange(val) {
      let param = {
        start: val,
        pageCount: 10,
        query_user: window.sessionStorage.getItem("user_id"),
        page_id: this.pageCache.pageId
      };
      service({
        maskOff: true,
        url: this.renderEngine + "/his/queryFavList",
        method: "post",
        data: param,
        headers: {
          "Content-Type": "application/json"
        }
      }).then(response => {
        if (response.data.respResult == 1) {
          let data = response.data.respData;
          if (data.length != 0) {
            this.collectData = data;
          }
        }
      });
    },
    initWebSocket() {
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
        let errMsg = obj.err_msg;
        let sucessMsg = obj.sucessMsg;
        if (this.exportData.length > 0) {
          for (var item of this.exportData) {
            if (item.export_id == id) {
              item.export_state = this.expStateDic[state];
              if(state == "2"){
                item.export_size = size;
                item.export_filename = fileName;
                item.export_sucess_msg = sucessMsg;
              }
              if(state == "3"){
                item.export_err_msg = errMsg;
              }
              if(state == "5"){   //推送成功
                item.export_size = size;
                item.export_filename = fileName;
                item.export_sucess_msg = sucessMsg;
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
        // console.info("发生请求参数");
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
      var id = val.export_id;
      var param = [{ exportInfoId: id }];
      this.delAsynExportFlow(param)
        .then(val => {
          if (val.data.respResult == "1") {
            this.getAsynExportData();
          } else {
            this.$message.error(val.data.respErrorDesc);
          }
        })
        .catch(err => {
          console.error(err);
        });
    },
    download(val) {
      if(this.filesync == '1'){  //湖南文件控制
          this.$message.success("生成文件成功，请前往文件管控平台下载所需文件! 文件名为:"+val.export_filename);
      }
      var id = val.export_id;
      var pageInfo = { pageName: this.pageCache.pageName };
      var asynExportInfo = { exportInfoId: id };
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
    reExport(row) {
      var id = row.export_id;
      var exportType = row.export_type;
      this.queryAfPropertyData({
        isNeedPaging: "0",
        isExport: true
      })
        .then(val => {
          var param = {};
          val.is_need_trans = 1;
          val.is_watermark = "1";
          var waterStr =
            (sessionStorage.getItem("user_id") || "") +
            "\n" +
            (sessionStorage.getItem("user_name") || "") +
            "\n" +
            (new Date().toLocaleDateString() +
              " " +
              new Date().toTimeString().split(" ")[0]);
          val.watermark_msg = waterStr;
          param.afQueryBean = val;
          try {
            param.pageInfo = { pageName: this.pageCache.pageName };
            param.asynExportInfo = {
              exportInfoId: id,
              pageId: this.pageCache.pageId,
              userId: sessionStorage.getItem("user_id"),
              exportType: exportType
            };
            param.exportType = exportType;
          } catch (e) {
            console.error(e);
          }
          return this.asynReExportData(param);
        })
        .then(response => {
          if (response.data.respResult == "1") {
            row.export_state = this.expStateDic["1"];
          } else {
            this.$message.error(response.data.respErrorDesc);
          }
        })
        .catch(err => {
          // this.$message.error(err);
        });
    },
    insertStr(soure, start, newStr) {
      //字符串插入
      return soure.slice(0, start) + newStr + soure.slice(start);
    },
    ...mapActions({
      setQueryHistory: "compt/setQueryHistory",
      upLoading: "compt/upLoading",
      queryAfPropertyData: "QueryTable/queryAfPropertyData",
      upDatasChange: "QueryTable/upDatasChange",
      queryAsynExportList: "AsynExport/queryAsynExportList",
      delAsynExportFlow: "AsynExport/delAsynExportFlow",
      upActivedId: "compt/upActivedId",
      upTableCols: "QueryTable/upTableCols",
      upCondiData: "QueryTable/upCondiData",
      downloadZip: "AsynExport/downloadZip",
      asynReExportData: "QueryTable/asynReExportData"
    }),
    ...mapMutations({
      setDimList: "QueryTable/setDimList",
      setMsuList: "QueryTable/setMsuList",
      setQueryType: "QueryTable/setQueryType",
      setTabtag: "QueryTable/setTabtag",
      upTableCols: "QueryTable/upTableCols",
      upCondiData: "QueryTable/upCondiData",
      setTabActive: "AsynExport/setTabActive",
      upLoading: "compt/upLoading"
    })
  },
  mounted() {
    this.activeName = this.tabActive;
    // if(this.menuClassTypeId == '1001' || this.menuClassTypeId == 'drive'){
    // 取消驾驶舱默认选中
    if(this.menuClassTypeId == '1001'){
        this.activeName = "third"
    }
    if (this.activeName == "first") {
      this.dealTableData();
    } else if (this.activeName == "second") {
      this.getAllFavList();
    } else if (this.activeName == "third") {
      this.getAsynExportData();
    }
  },
  beforeDestroy() {
    //页面离开时断开连接，清除定时器
    this.closeWebSocket();
  },
  watch: {
    historyData() {
      this.dealTableData();
    }
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
