<template>
  <div style="height:100%;position:relative;">
    <div
      ref="table"
      :class="[extendSetting.tableTheme+'-datagrid',pageCache.classTypeId == '1001002'? 'mobile_datagrid-wrap':'datagrid-wrap',polymerizeType==1?'polymer-wrap':'',pageCache.classTypeId == '1005'? 'bigScreen_datagrid-wrap':'']"
    >
      <el-table
        size="mini"
        :height="extendSetting.frozen?'100%':null"
        :border="extendSetting.tableTheme=='default'?true:false"
        :data="newComptData.rows"
        :row-class-name="rowClass"
        ref="tableBody"
        :class="[pageCache.classTypeId == '1001002'? 'mobile':'',pageCache.classTypeId == '1005'? 'bigScreen':'']"
        :style="tableStyle"
        :width="'100%'"
        :row-style="datagridRowStyle"
        :header-cell-style="{'background':extendSetting.thBgColor,color:extendSetting.thTextColor}"
        :cell-style="{'background':extendSetting.tbBgColor,color:extendSetting.tbTextColor,'border-color':extendSetting.tbBdColor}"
        :show-header="showHead"
        :header-row-style="headerStyle"
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
        lazy
        :load="loadNextLevel"
        row-key="id"
      >
        <el-table-column
          v-for="(col,i) in tableCols || []"
          v-bind:key="col.prop+Math.random()"
          v-bind="col"
          header-align="center"
          :align="newColSetting[col.prop] !=undefined?newColSetting[col.prop].align:'left'"
          :show-overflow-tooltip="true"
        >
          <template slot="header" slot-scope="scope">
            <div :title="col.label">{{col.label}}</div>
          </template>
          <template slot-scope="scope">
            <span @click="dgCellClick(scope.row, col, i, $event)">
              <i
                v-show="newColSetting && newColSetting[col.prop] && newColSetting[col.prop].setCondi==='showIcon' && (newColSetting[col.prop].colCondiExp||[]).length>0"
                v-if="(newColSetting[col.prop].colCondiExp||[]).length>0 && parseFloat(dataFormatter2(scope.row,i))>=parseFloat(newColSetting[col.prop].colCondiExp[0].num)"
                :class="['dg-icon',newColSetting[col.prop].colCondiExp[0].icon]"
                :style="{
                  'font-size': newColSetting[col.prop].colCondiExp[0].fontSize + 'px',
                  color: newColSetting[col.prop].colCondiExp[0].iconColor
                }"
              ></i>
              <i
                v-show="newColSetting && newColSetting[col.prop] && newColSetting[col.prop].setCondi==='showIcon' && (newColSetting[col.prop].colCondiExp||[]).length>1"
                v-else-if="(newColSetting[col.prop].colCondiExp||[]).length>1 && parseFloat(dataFormatter2(scope.row,i))<parseFloat(newColSetting[col.prop].colCondiExp[1].num)"
                :class="['dg-icon',newColSetting[col.prop].colCondiExp[1].icon]"
                :style="{
                  'font-size': newColSetting[col.prop].colCondiExp[1].fontSize + 'px',
                  color: newColSetting[col.prop].colCondiExp[1].iconColor
                }"
              ></i>
              <span :style="qdCondiStyle(col, scope, i)">{{dataFormatter2(scope.row,i)}}</span>
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import commonCompMixin from './mixins/commonCompMixin';
import { mapActions, mapMutations, mapState, mapGetters } from "vuex";
import {
  genWhereBean,
  getFilteredData,
  getOrderList,
  objDeepCopy,
  addPageCondis,
  getTableReqParam,
  loadDataDone,
  loadDataError
} from "../../utils/comonFunc.js";
import getUUID from "../../utils/UUID.js";

export default {
  mixins: [commonCompMixin],
  props: ["vscompt"],
  components: {},
  data() {
    return {
      param: null,
      showSummary: false,
      temp: '<i class="icon-A10192_time"><i>',
      linkageState: false,
      firColVal: "", // 总计行第一列的值
      clickCell: {
        label: "",
        value: "",
        element_id: ""
      }, // 当前点击单元格的值
      showHead: true
    };
  },
  mounted() {
    // 在点击确定的时候可能总计开关已经开启，为确保查完数据会再查总计数据，所以加了这个key
    if (this.vscompt.refreshDataKey === undefined) {
      this.$set(this.vscompt, 'refreshDataKey', 0);
    }
    if (this.vscompt.afId == "" && this.vscompt.comptData == undefined) {
      this.$set(this.vscompt, "comptData", {
        rows: [],
        columns: []
      });
    }
  },
  computed: {
    ...mapState({
      isDSMapReady: state => state.AnalyReportAttr.isDSMapReady,
      datasetMap: state => state.AnalyReportAttr.datasetMap,
      pageCache: state => state.HomeBody.pageCache,
      linkStack: state => state.PageDesign.linkStack,
      rowLimit: state => state.commonProperties.report.rowLimit
    }),
    ...mapGetters({
      getPageParams: "PageDesign/getPageParams",
      getQueryCompts: "PageDesign/getQueryCompts",
      nowPage: "PageDesign/getActivedPage"
    }),
    tableCols() {
      let cols = [];
      let colSet = this.vscompt.comptAttrs.colSetting || {};
      if (
        this.vscompt.comptData &&
        this.vscompt.comptData.columns &&
        this.vscompt.comptData.columns.length > 0
      ) {
        let oriCols = this.vscompt.comptData.columns;
        for (let index = 0; index < oriCols.length; index++) {
          const element = oriCols[index];
          if (element.prop.indexOf("XXXXCODE_") < 0) {
            let newCol = {
              ...element,
              ...objDeepCopy(colSet[element.prop] || {})
            };
            newCol["label"] =
              colSet[element.prop] != undefined
                ? colSet[element.prop].nick_name
                : newCol["label"];
            cols.push(newCol);
          }
        }
      }
      return cols;
    },
    newColSetting() {
      return this.vscompt.comptAttrs.colSetting;
    },
    tableStyle() {
      return this.vscompt.comptAttrs.extendSetting.frozen
        ? {}
        : {
            height: "auto"
          };
    },
    cellStyle() {
      var obj = {
        overflow: "auto",
        "white-space": "nowrap"
      };
      return obj;
    },
    //  聚合明细类型 1-聚合 2-明细
    polymerizeType() {
      return this.vscompt.comptAttrs.polymerizeType;
    },
    headerStyle() {
      let header = this.vscompt.comptAttrs.extendSetting.thHeader || 35;
      this.$nextTick(() => {
        this.$refs.tableBody.doLayout();
      });
      return {
        height: `${header}px`
      };
    },
    // 透视表第一个维度的element_id
    firLevelEId() {
      return (this.xAxisData[0] || {}).element_id;
    },
    // 透视表 如果有钻取，需要在原来comptdata上增加children属性
    newComptData(newVal) {
      const { columns = [], rows = [] } = this.vscompt.comptData || {};
      const hasNextLevel = this.xAxisData.length > 1;
      // 第一层根据维度字段数是否超过1来来确定是否有展开符号
      const newRows = rows.map(item => {
        return {
          ...item,
          ...{
            hasChildren: item.isTotalRow ? false : hasNextLevel,
            id: getUUID()
          }
        };
      });
      return {
        columns,
        rows: newRows
      };
    },
    extendSetting() {
      return this.vscompt.comptAttrs.extendSetting;
    }
  },
  watch: {
    "vscompt.comptAttrs.extendSetting.totalRow": {
      handler(newVal, oldVal) {
        let attrs = this.vscompt.styleAttrs[3].children || [];
        // 小计维度值
        const index = attrs.findIndex(
          (atts, index) => atts.enName === "subTotalCol"
        );
        if (index > -1) {
          this.$set(
            attrs[index],
            "value",
            newVal ? this.xAxisData[0].nick_name : ""
          );
        }
        this.queryData();
      }
    },
    'vscompt.refreshDataKey': {
      immediate: true,
      handler(newVal) {
        if (newVal > 0) {
          this.queryData();
        }
      }
    }
    // "vscompt.comptAttrs.extendSetting.batchSetting": {
    //   handler(newVal, oldVal) {
    //     if (newVal > 0 && this.vscompt.comptAttrs.extendSetting.totalRow) {
    //       this.queryData();
    //     }
    //     this.vscompt.comptAttrs.extendSetting["batchSetting"] = 0;
    //   }
    // }
  },
  methods: {
    queryData() {
      this.vscompt.comptAttrs.loading = true;
      let selectList = [];
      let whereBean = objDeepCopy(this.vscompt.comptAttrs.whereBean);

      // 还要判断当前是否在联动状态则应该返回联动的那个状态
      if (
        this.vscompt.comptAttrs["linkageCondi"] != undefined &&
        this.vscompt.comptAttrs["linkageCondi"].length > 0
      ) {
        whereBean = genWhereBean(
          this.vscompt.comptAttrs["linkageCondi"],
          objDeepCopy(whereBean)
        );
      }

      selectList = objDeepCopy(this.xAxisData);
      let flag = false;
      selectList = this.getSelectList(selectList, flag);
      if (selectList.length == 0) {
        this.vscompt.comptAttrs.loading = false;
        return;
      }

      // 透视表 select_list只要传第一个维度，其他维度都去掉
      selectList = selectList.filter((item, index) => {
        return (
          item.element_type === "2" ||
          index === 0 ||
          item.nick_name === `XXXXCODE_${selectList[0].element_id}`
        );
      });

      let params = this.configQueryParam({ selectList, whereBean });
      this.executeReqest(params);
    },
    configQueryParam({ selectList, whereBean }) {
      // 聚合
      let dgColSetting = this.vscompt.comptAttrs.colSetting;
      for (let index = 0; index < selectList.length; index++) {
        const element = selectList[index];
        if (element.element_type == 2) {
          selectList[index].fun_type =
            dgColSetting[element.element_id].polymerFunType == 0
              ? 0
              : dgColSetting[element.element_id].polymerFunType || 2;
        }
      }

      let orderList = getOrderList(selectList);
      let params = {
        reqType: "1",
        dataType: "2",
        afQueryBean: {
          af_id: this.vscompt.afId,
          begin_date: "",
          head_bean: {
            pageCount: "",
            start: "",
            user_id: window.sessionStorage.getItem("user_id")
          },
          is_need_log: 1,
          is_need_paging: 0,
          is_need_permission: 1,
          is_need_trans: 1,
          query_type: "1",
          select_list: selectList,
          order_list: orderList,
          where_bean: whereBean
        }
      };
      // 页面添加计算字段构造element_list
      let computedData = this.computedData || [];
      if (computedData.length > 0) {
        let element_list = [];
        let select_list = [];
        for (let i = 0; i < params.afQueryBean.select_list.length; i++) {
          let item = params.afQueryBean.select_list[i];
          if (item.from_compt) {
            for (let j = 0; j < computedData.length; j++) {
              if (computedData[j].element_id === item.element_id) {
                let targ = computedData[j];
                let list = targ.related_fields;
                let {
                  element_id,
                  element_name,
                  is_calcul,
                  tab_id,
                  col_fun_exp,
                  tab_alias
                } = targ;
                element_list.push({
                  element_id,
                  element_name,
                  is_calcul,
                  tab_id,
                  col_fun_exp,
                  tab_alias
                });
                element_list = element_list.concat(list);
                select_list.push(item);
                break;
              }
            }
          } else {
            select_list.push(item);
          }
        }
        params.afQueryBean.element_list = element_list;
        params.afQueryBean.select_list = select_list;
      }
      return params;
    },
    addDependCondi({ params, queryTotal }) {
      let newParams = { ...params };
      // 补上其他页面的联动设置 在预览页面才要考虑传递公共参数和页面参数
      if (this.pageCache.operation == "preview") {
        newParams = addPageCondis({
          vscompt: this.vscompt,
          params: newParams,
          datasetMap: this.datasetMap,
          pageParams: this.getPageParams,
          queryCompts: this.getQueryCompts(),
          pageId: this.pageCache.pageId
        });
      }
      let polymerizeType = Number(this.polymerizeType);
      if (queryTotal) {
        // 查总计的数据 用refreshdataset请求，过滤掉翻译维度字段
        newParams.afQueryBean.select_list = newParams.afQueryBean.select_list.filter(
          item => item.nick_name.indexOf("XXXXCODE_") === -1
        );
        // 表格请求不太格式跟其他组件不一样
        newParams = getTableReqParam({
          params: newParams,
          xAxisData: [this.xAxisData[0]],
          yAxis1Data: this.yAxis1Data,
          polymerizeType: polymerizeType,
          vscompt: this.vscompt
        });
        // queryTotal---true--查询合计信息
        let selList = objDeepCopy(newParams.afQueryBean.select_list);
        selList = selList.filter(
          item => item.nick_name.indexOf("_drill") === -1
        );
        for (let index = 0; index < selList.length; index++) {
          selList[index].numType = 0;
          selList[index].dot = 0;
          // if (selList[index].nick_name.indexOf("_drill") > -1) {
          //   selList[index].dim_id = "";
          //   selList[index].dim_level_id = "";
          //   selList[index].is_translate = 0;
          // }
        }
        newParams.afQueryBean.select_list = selList;
        newParams.colDimList = selList;
        newParams.rowDimList = [];
        newParams.drillDimList = [];
      }
      return newParams;
    },
    async queryTotalRow({ params }) {
      let newParams = this.addDependCondi({ params, queryTotal: true });
      let computedData = this.computedData || [];
      const response = await this.queryComptData({
        params: newParams,
        computedData
      });
      let newRowsData = [];
      if (response.data.respResult == 1) {
        let comptData = response.data.respData;
        let totalRow = comptData.result_data_list.slice(-1);
        if (totalRow.length > 0) {
          totalRow = totalRow[0].data_list;
          let totalRowData = {
            isTotalRow: true
          };
          totalRowData[this.firLevelEId] = "合计";
          for (let idx = 0; idx < this.yAxis1Data.length; idx++) {
            const { element_id } = this.yAxis1Data[idx];
            totalRowData[element_id] = totalRow[idx + 1].data_val;
          }
          newRowsData.push(totalRowData);
        }
      }
      return newRowsData;
    },
    async executeReqest(params) {
      if (params.afQueryBean.select_list.length == 0) {
        this.vscompt.comptAttrs.loading = false;
        return;
      }
      params = this.addDependCondi({ params });
      this.vscompt.comptAttrs.loading = true;
      let computedData = this.computedData || [];
      const response = await this.queryComptData({ params, computedData });
      let rows = [];
      if (response.data.respResult == 1) {
        let comptData = response.data.respData;
        this.vscompt.comptData.columns = [this.xAxisData[0]]
          .concat(this.yAxis1Data)
          .map(item => {
            return {
              ...item,
              ...{
                label: item.nick_name,
                prop: item.element_id
              }
            };
          });
        rows = comptData.data || [];
        loadDataDone(this.vscompt);
      } else {
        loadDataError(this.vscompt, "数据更新失败");
        console.error(response.data.respErrorDesc);
      }
      const queryTotal = this.vscompt.comptAttrs.extendSetting.totalRow;
      if (queryTotal) {
        rows = rows.concat(await this.queryTotalRow({ params }));
      }
      this.vscompt.comptData.rows = rows;
      this.vscompt.comptAttrs.loading = false;
    },
    ...mapMutations({
      setExportType: "QueryTable/setExportType",
      setTabActive: "AsynExport/setTabActive"
    }),
    ...mapActions({
      queryAfPropertyData: "QueryTable/queryAfPropertyData",
      queryComptData: "QueryTable/queryComptData",
      exportTable: "QueryTable/exportTable",
      setExportDialog: "compt/setExportDialog",
      sendSms: "compt/sendSms",
      setSmsId: "compt/setSmsId",
      setCompLinkageCondi: "PageDesign/setCompLinkageCondi",
      checkIfOpenChildPage: "PageDesign/checkIfOpenChildPage",
      gotoPage: "PageDesign/gotoPage"
      // setQueryHistory: 'compt/setQueryHistory'
    }),
    setLinkageCondi(isFromReset) {
      let dim_value = this.clickCell.value;
      let is_dim = 0;
      let field1 = this.xAxisData.concat(this.yAxis1Data).filter(item => {
        return item.element_id == this.clickCell.element_id;
      });
      if (
        field1.length > 0 &&
        field1[0].dim_level_id != undefined &&
        field1[0].dim_level_id != null &&
        field1[0].dim_level_id != ""
      ) {
        is_dim = 1;
      }
      let linkData = getFilteredData(
        this.vscompt.comptAttrs.mainLinkageData,
        "rel_element_id",
        this.clickCell.element_id
      );
      this.setCompLinkageCondi({
        linkData: linkData,
        dim_value: dim_value,
        is_dim: is_dim
      });
      if (!isFromReset) {
        // 如果是从resetLinage过来的，不要走跳转页面
        this.checkIfOpenChildPage({
          dim_value: dim_value,
          vscompt: this.vscompt,
          element_id: this.clickCell.element_id
        });
      }
    },
    queryLinkData() {
      this.queryData();
    },
    resetLinage() {
      this.clickCell.label = "";
      this.clickCell.value = "";
      this.setLinkageCondi(true);
      this.clickCell.element_id = "";
      this.linkageState = false;
    },
    getSelectList(xAxisData, isExport = false) {
      let selectList = xAxisData.concat(this.yAxis1Data);
      if (!isExport) {
        for (let index = 0; index < selectList.length; index++) {
          const element = selectList[index];
          if (element.dim_id != "" && element.dim_id != null) {
            let colItem = objDeepCopy(element);
            colItem.dim_id = "";
            colItem.dim_level_id = "";
            colItem["is_translate"] = 0;
            colItem.nick_name = "XXXXCODE_" + colItem.element_id;
            selectList.push(colItem); // 把所有有绑定维度的字段都加入查询列表，获取对应的维值
          }
        }
      }
      return selectList;
    },
    headerCellStyle({ row, column, rowIndex, columnIndex }) {
      // 表头样式
      if (rowIndex === 0) {
        return "background-color: lightblue;color: #fff;border-bottom: 2px solid #fff;";
      }
    },
    dataFormatter2(rowData, index) {
      let prop = (this.vscompt.comptData || {}).columns[index]["prop"];
      let cellValue = rowData[prop] || "";
      let col = this.vscompt.comptAttrs.colSetting[prop];
      if (cellValue != "总计") {
        if (col.numType == 1) {
          cellValue = parseFloat(cellValue).toFixed(col.dot);
        } else if (col.numType == 2) {
          let dot = parseInt(col.dot + "" || "0");
          cellValue =
            parseFloat(
              parseFloat((cellValue + "").replace(/%/gi, "")) * 100
            ).toFixed(dot) + "%";
        }
      }
      // 为空或者为NaN时候设置 -
      if (cellValue.indexOf("NaN") > -1 || cellValue == "") {
        cellValue = "-";
      }
      return cellValue;
    },
    dataFormatter3(oriCellVal, colSeting) {
      let cellValue = oriCellVal || "";
      if (cellValue != "总计") {
        if (colSeting.numType == 1) {
          cellValue = parseFloat(cellValue).toFixed(colSeting.dot);
        } else if (colSeting.numType == 2) {
          let dot = parseInt(colSeting.dot + "" || "0");
          cellValue =
            parseFloat(
              parseFloat((cellValue + "").replace(/%/gi, "")) * 100
            ).toFixed(dot) + "%";
        }
      }
      // 为空或者为NaN时候设置 -
      if (cellValue.indexOf("NaN") > -1 || cellValue == "") {
        cellValue = "-";
      }
      return cellValue;
    },
    rowClass({ row, rowIndex }) {
      if (row.isTotal) {
        return "row-count";
      }
    },
    dgCellClick(row, column) {
      this.gotoPage(this.vscompt.comptAttrs.extendSetting);
    },
    // 表格行样式设置
    datagridRowStyle({ row, rowIndex }) {
      // 针对大屏表格
      let rowStyle = {};
      if (this.pageCache.classTypeId == "1005") {
        let bgClor = this.pageCache.bgClor || "";
        if (
          this.pageCache.operation == "design" ||
          this.pageCache.operation == "applyTemplate"
        ) {
          bgClor = this.nowPage.bgClor || "";
        }
        rowStyle = {
          "background-color": bgClor
        };
      }
      return rowStyle;
    },
    qdCondiStyle(col, scope, i) {
      let res = {};
      let newColSetting = this.newColSetting;
      let colCondiExp = newColSetting[col.prop].colCondiExp || [];
      let val = parseFloat(this.dataFormatter2(scope.row, i));
      if (
        newColSetting &&
        newColSetting[col.prop] &&
        newColSetting[col.prop].setCondi === "showNum" &&
        colCondiExp.length > 1
      ) {
        let index = -1;
        if (colCondiExp.length > 0 && val >= parseFloat(colCondiExp[0].num)) {
          index = 0;
        } else if (
          colCondiExp.length > 1 &&
          val < parseFloat(colCondiExp[1].num)
        ) {
          index = 1;
        }
        if (index > -1) {
          res = {
            "font-size": colCondiExp[index].fontSize + "px",
            color: colCondiExp[index].iconColor
          };
        }
      }
      return res;
    },
    showIcon(item) {
      let obj = {
        type: "",
        clazz: "",
        style: ""
      };
      try {
        const { column, row } = item;
        const condi = row[`${column.property}-condi`];
        if (
          condi.condiSetSymbol != -1 &&
          condi.condiSetStyle.setCondi !== undefined
        ) {
          const style = {
            "font-size": (condi.condiSetStyle.fontSize || "") + "px",
            color: condi.condiSetStyle.iconColor || ""
          };
          const setCondi = condi.condiSetStyle.setCondi;
          setCondi === "showIcon"
            ? "icon"
            : setCondi === "showNum"
            ? "num"
            : "";
          obj = {
            type: setCondi,
            clazz: ["dg-icon", condi.condiSetStyle.icon || ""],
            style
          };
        }
      } catch (error) {}
      return obj;
    },
    /**
     * @param level 当前树层级
     * @param row 当前行的数据
     *
     */
    // 构造透视表下钻的参数
    genDrillWhereBean({ level, row }) {
      let prevLevelCondi = {};
      let whereBeanRuleList = [];
      let whereBean = {};
      // 构造从第一层到当前层的下钻条件
      for (let index = 0; index <= level; index++) {
        const curField = this.xAxisData[index];
        const curLevelDimEId = curField.element_id;
        const transDimKey = `XXXXCODE_${curLevelDimEId}`;
        whereBeanRuleList.push({
          col_id: curField.col_id,
          col_type: "2",
          exp_id: "",
          is_dim: "1",
          symbol: 3,
          rule_value: row[transDimKey],
          obj_id: curField.tab_id,
          element_id: curLevelDimEId
        });
        prevLevelCondi[transDimKey] = row[transDimKey];
      }
      whereBean = genWhereBean(
        whereBeanRuleList,
        objDeepCopy(this.vscompt.comptAttrs.whereBean),
        true
      );
      return {
        prevLevelCondi,
        whereBean
      };
    },
    // 透视表下钻
    async loadNextLevel(tree, treeNode, resolve) {
      const { level } = treeNode;
      let { prevLevelCondi, whereBean } = this.genDrillWhereBean({
        level,
        row: tree
      });
      const nextDim = this.xAxisData[level + 1];
      // 构造selectList
      let selectList = [nextDim].concat(this.yAxis1Data);
      selectList.push({
        ...nextDim,
        ...{
          nick_name: `XXXXCODE_${nextDim.element_id}`,
          dim_id: "",
          dim_level_id: "",
          is_translate: 0
        }
      });
      // 还要判断当前是否在联动状态则应该返回联动的那个状态
      if (
        this.vscompt.comptAttrs["linkageCondi"] != undefined &&
        this.vscompt.comptAttrs["linkageCondi"].length > 0
      ) {
        whereBean = genWhereBean(
          this.vscompt.comptAttrs["linkageCondi"],
          whereBean,
          false
        );
      }
      let params = this.configQueryParam({ selectList, whereBean });
      params = this.addDependCondi({
        params
      });
      let computedData = this.computedData || [];
      params.afQueryBean.head_bean.start = "";
      params.afQueryBean.is_need_paging = 0;
      const response = await this.queryComptData({ params, computedData });
      let resultRows = [];
      if (response.data.respResult == 1) {
        const { data } = response.data.respData;
        const dimCount = this.xAxisData.length - 1;
        const newData = data.map(item => {
          let newItem = {
            ...item,
            ...prevLevelCondi,
            ...{
              id: getUUID(),
              hasChildren: level + 1 < dimCount // 是否还能下钻
            }
          };
          // 把新下钻的维度数据塞到第一列里面
          newItem[this.firLevelEId] = item[nextDim.element_id];
          return newItem;
        });
        resultRows = newData;
      }
      resolve(resultRows);
      this.$nextTick(() => {
        this.$refs.tableBody.doLayout();
      })
    }
  }
};
</script>

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
    /deep/ .row-count {
      font-weight: bold;
    }
  }
}

.pagination {
  width: 100%;
  text-align: right;
  margin-top: 10px;

  &.pagination-wrap {
    // display: inline-block;
    position: absolute;
    bottom: 0;
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

.drill-label {
  position: absolute;
  left: 5px;
  bottom: 3px;
  cursor: pointer;
  z-index: 100;

  .drill-icon {
    font-size: 12px;
    vertical-align: -1px;
  }

  &:hover {
    color: #409cfb;
  }
}

.link-reset {
  left: 5px;
  bottom: 2px;
}

.default-datagrid {
  /deep/ .el-table td {
    border-right: 1px solid #ebeef5;
  }
}

.noborder-datagrid {
  /deep/ .el-table td {
    border-bottom: none;
    // border-right: 1px solid #ebeef5;
  }

  /deep/ .el-table thead th.is-leaf,
  /deep/ .el-table .el-table__header-wrapper {
    border-bottom: none;
  }
}

.innerborder-datagrid {
  /deep/ .el-table td {
    // border-right: 1px solid #ebeef5;
  }
}

.el-table {
  /deep/.el-table__header-wrapper {
    border-bottom: 2px solid #409eff;
  }
  /deep/ .row-count {
    font-weight: bold;
  }
  /deep/ th {
    color: #303133;
    div {
      width: 100%;
    }
    .cell {
      color: inherit;
    }
    &.is-leaf {
      border-bottom: none;
    }
  }
}
.mobile_datagrid-wrap {
  // height: calc(100% - 30px);
  height: 100%;
}
.datagrid-wrap {
  height: calc(100% - 70px);
  overflow: auto;
  &.polymer-wrap {
    //聚合表没有分页
    height: calc(100% - 20px);
  }

  /deep/ .el-table::before {
    height: 0px;
  }

  /deep/ .el-table td {
    cursor: pointer;
  }
}

/deep/ .el-pager li {
  background: transparent;
}

/deep/ .el-pagination button:disabled {
  background: transparent;
}

/deep/ .el-pagination .btn-prev,
/deep/ .el-pagination .btn-next {
  background: transparent;
}
/deep/.mobile.el-table--mini th,
/deep/.mobile.el-table--mini td {
  padding: 4px 0 !important;
}
/deep/.mobile .el-table--group::after,
.el-table--border::after {
  width: 0px;
}
/*大屏表格样式修改*/
/deep/.bigScreen_datagrid-wrap {
  .pagination .total-page-wrap {
    color: #4385fb;
    span {
      color: #4385fb;
      font-size: 18px;
    }
  }
  /deep/.el-pagination {
    color: #4385fb;
    button {
      font-size: 18px;
      color: #4385fb;
      i {
        font-size: 18px;
      }
      &:disabled {
        color: #666;
        &:hover {
          color: #666;
        }
      }
      &:hover {
        color: #b8f400;
      }
    }

    .el-pager li {
      font-size: 18px;
      color: #4385fb;
      &.active,
      &:hover {
        color: #b8f400;
      }
    }
    .el-pagination__jump {
      color: #4385fb;
      font-size: 18px;
      .el-input__inner {
        background-color: transparent;
        color: #b8f400;
        border-color: #004ea2;
        &:hover,
        &:focus {
          border-color: #b8f400;
        }
      }
    }
  }
}
/deep/.bigScreen.el-table {
  border: none;
  background-color: transparent;
  font-size: 14px;
  th div {
    font-size: 16px;
    width: 100%;
  }
  thead tr,
  thead th {
    background-color: #002d63;
    border-bottom: none;
    color: #fff;
  }

  tr {
    height: 36px;
    line-height: 36px;
    td {
      color: #abdfff;
      border-bottom: 1px dashed #004ea2;
      border-right: none;
    }
    &:last-child td {
      border-bottom: none;
    }
    &:hover > td,
    &.hover-row > td {
      background-color: transparent;
    }
  }
  th {
    border-right: none;
    & > .cell {
      color: inherit;
    }
  }
  .el-table__fixed::before,
  .el-table__fixed-right::before {
    background-color: transparent;
  }
}

/deep/.el-table thead th {
  padding: 0;
  .cell {
    line-height: normal;
    div {
      line-height: inherit;
    }
  }
}

/*大屏表格样式修改*/

// 树表格改图标
//有子节点 且未展开
.el-table /deep/ .el-icon-arrow-right {
  margin-top: -7px;
  &::before {
    content: "\e723";
  }
}
//有子节点 且已展开
.el-table /deep/ .el-table__expand-icon--expanded {
  transform: none;
  .el-icon-arrow-right::before {
    content: "\e722";
  }
}

.el-table.el-table--border {
  border: 1px solid #EBEEF5;
}
// 滚动条
.el-table.el-table--scrollable-y /deep/ .el-table__body-wrapper {
  overflow: scroll;
}
</style>
<style>
/* 聚合多表头 */
.polymer-wrap .el-table th div {
  width: 100%;
}
.polymer-wrap .el-table th > div > div {
  padding: 0px;
}
</style>
