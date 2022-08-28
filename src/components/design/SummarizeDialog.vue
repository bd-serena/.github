<template>
  <el-dialog
    size="mini"
    title="汇总查询"
    width="600px"
    :visible.sync="summarizeDialog"
    :append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <div class="table-wrap">
      <div class="left-table">
        <el-table
          ref="dimTable"
          height="307"
          :row-key="getRowKeys"
          v-loading="false"
          border
          :data="dimData"
          style="width: 100%"
          @select="dimSelect"
          @select-all="dimSelect"
          size="mini"
        >
          <el-table-column type="selection" :reserve-selection="true" width="55"></el-table-column>
          <el-table-column prop="name" :show-overflow-tooltip="true" label="维度"></el-table-column>
        </el-table>
      </div>
      <div class="right-table">
        <el-table
          ref="msuTable"
          height="307"
          :row-key="getRowKeys"
          v-loading="false"
          border
          :data="msuData"
          style="width: 100%"
          @select="msuSelect"
          @select-all="msuSelect"
          size="mini"
        >
          <el-table-column type="selection" :reserve-selection="true" width="55"></el-table-column>
          <el-table-column prop="name" label="度量" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="fun_type" label width="150">
            <template slot-scope="scope">
              <el-select class="right-select" v-model="scope.row.fun_type" size="mini">
                <el-option
                  v-if="scope.row.is_calcul=='2'"
                  v-for="item in options2"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
                <el-option
                  v-else
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div style="clear:both"></div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="clearSummarize">清空</el-button>
      <el-button type="primary" size="mini" @click="doSummarize">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
  import {objDeepCopy} from "../../utils/comonFunc.js";

  export default {
    data() {
      return {
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
          },
          {
            label: "count distinct",
            value: "6"
          }
        ],
        options2: [
          {
            label: '无',
            value: '0'
          }
        ]
      };
    },
    computed: {
      summarizeDialog: {
        get() {
          return this.$store.state.compt.summarizeDialog;
        },
        set(value) {
          this.setSummarizeDialog(value);
        }
      },
      dimData() {
        let res = [];
        this.selectList.forEach(function (val) {
          if (val.element_type == "1") {
            res.push({id: val.element_name, name: val.label});
          }
        });
        return res;
      },
      msuData() {
        let res = [];
        this.selectList.forEach(val => {
          if (val.element_type == "2") {
            let filterArr = this.msuList.filter(item => {
              return val.element_name == item.id;
            });
            let fun_type = "2";
            if (filterArr.length > 0) {
              fun_type = filterArr[0].fun_type;
            }
            if(val.is_calcul=='2'){
              fun_type = '0';
            }
            res.push({
              id: val.element_name,
              name: val.label,
              fun_type: fun_type,
              is_calcul: val.is_calcul
            });
          }
        });
        return res;
      },
      ...mapState({
        contextUrl: state => state.contextUrl,
        pageCache: state => state.HomeBody.pageCache,
        dimList: state => state.QueryTable.dimList,
        msuList: state => state.QueryTable.msuList,
        selectList: state => state.QueryTable.tableCols,
        s_edcuiCompts: state => state.compt.s_edcuiCompts,
        historyData: state => state.QueryTable.historyData
      }),
      ...mapGetters({
        condiCols: "QueryTable/condiCols",
        resultCols: "QueryTable/resultCols",
        tableColumn: "QueryTable/tableColumn",
        summarizeCols: "QueryTable/summarizeCols"
      })
    },
    watch: {
      summarizeDialog: function (val) {
        if (val) {
          this.$nextTick(() => {
            if (this.dimData.length > 0 && this.$refs.dimTable) {
              this.$refs.dimTable.clearSelection();
              if (this.dimList) {
                this.dimList.forEach(row1 => {
                  this.$refs.dimTable &&
                  this.$refs.dimTable.toggleRowSelection(
                    this.dimData.find(row2 => row2.id === row1.id),
                    true
                  );
                });
              }
            }
            if (this.msuData.length > 0 && this.$refs.msuTable) {
              this.$refs.msuTable.clearSelection();
              if (this.msuList) {
                this.msuList.forEach(row1 => {
                  this.$refs.msuTable &&
                  this.$refs.msuTable.toggleRowSelection(
                    this.msuData.find(row2 => row2.id === row1.id),
                    true
                  );
                });
              }
            }
          });
        }
      }
    },
    methods: {
      dimSelect(val) {
        this.setDimList(val);
      },
      msuSelect(val) {
        for (let index = 0; index < val.length; index++) {
          const element = val[index];
          let res = this.msuData.filter(item => {
            return element.id == item.id;
          });
          val[index]["fun_type"] = res[0].fun_type;
        }
        this.setMsuList(val);
      },
      doSummarize() {
        // if (this.msuList.length == 0) {
        //   this.$message.error("请选择需汇总的度量字段");
        //   return;
        // }
        // 左边选，右边一定要选；右边选，左边可以不选；可以都不选，都不选就跟清空一样
        if (this.dimList.length == 0 && this.msuList.length == 0) {
          this.setTabtag("false");
          this.setQueryType("list");
          this.updateData("list");
        } else if (this.dimList.length != 0 && this.msuList.length == 0) {
          this.$message.warning("请选择需汇总的度量字段");
          return;
        } else {
          this.updateData();
          this.setTabtag("true");
        }
      },
      clearSummarize() {
        let sign = false;
        for(let i=0;i<this.selectList.length;i++) {
          if(this.selectList[i].is_calcul=='2') {
            sign = true;
            break;
          }
        }
        if(sign) {
          this.$message.warning('聚合计算无法参与清单设计');
          return;
        }
        this.dimList.splice(0, this.dimList.length);
        this.msuList.splice(0, this.msuList.length);
        this.setTabtag("false");
        this.setQueryType("list");
        this.updateData("list");
      },
      getRowKeys(row) {
        return row.id;
      },
      updateData(queryTypeVal) {
        let _this = this;
        let tim = this.getNowFormatDate();
        this.setQueryType("summarize");
        if (queryTypeVal == "list") {
          // 如果有聚合类字段禁止清单预览
          let sign = false;
          for(let i=0;i<this.selectList.length;i++) {
            if(this.selectList[i].is_calcul=='2') {
              sign = true;
              break;
            }
          }
          if(sign) {
            this.$message.warning('聚合计算无法参与清单设计');
            return;
          }
          this.setQueryType(queryTypeVal);
          // this.setTabtag("false");
        }
        this.upLoading(true);
        this.setSummarizeDialog(false);
        var params = {
          head_bean: {
            pageCount: this.s_edcuiCompts[1].comptAttrs.pagination.pageSize,
            start: ""
          }
        };
        this.queryAfPropertyData({params})
          .then(response => {
            if (response.data.respResult == 1 && response.status == 200) {
              var respData = response.data.respData;
              var dataList = [];
              if (_this.s_edcuiCompts[0].comptAttrs.fieldList.length > 1) {
                //暂时只保存清单的查询历史
                var obj = {
                  time: tim,
                  condi: objDeepCopy(_this.s_edcuiCompts[0].comptAttrs.fieldList),
                  config: JSON.parse(response.config.data),
                  queryType: "summarize",
                  dimList: [..._this.dimList],
                  msuList: [..._this.msuList]
                };
                _this.historyData.unshift(obj);
              }
              try {
                this.s_edcuiCompts[1].comptAttrs.pagination.total = parseInt(
                  response.data.respData.total_count
                );
                dataList = respData.result_data_list || [];
              } catch (e) {
              }
              var colList = this.summarizeCols || [];
              if (queryTypeVal == "list") {
                colList = this.resultCols.select_list;
              }
              // var columns = [],
              //   tableattrs = [];
              this.s_edcuiCompts[1].comptAttrs.columns = [];
              this.s_edcuiCompts[1].comptAttrs.tableattrs.data = [];
              this.s_edcuiCompts[1].comptAttrs.columns = this.tableColumn;
              this.upDatasChange(true);
              for (var i = 0; i < dataList.length; i++) {
                var rows = dataList[i].data_list;
                var temp = {};
                for (var j = 0; j < rows.length; j++) {
                  var item = colList[j].element_id;
                  temp[item] = rows[j].data_val;
                }
                this.s_edcuiCompts[1].comptAttrs.tableattrs.data.push(temp);
              }
              this.s_edcuiCompts[1].comptAttrs.pagination.currentPage = 1;
            } else {
              // _this.$message.error("数据更新失败");
              _this.$message.error(response.data.respErrorDesc != '' ? response.data.respErrorDesc : "数据更新失败");
            }
            this.upLoading(false);
          })
          .catch(error => {
            console.error(error);
            this.upLoading(false);
            // this.$message.error("数据更新失败");
          });
      },
      getNowFormatDate() {
        //获取当前时间
        var date = new Date();
        var seperator1 = "-";
        var seperator2 = ":";
        var month =
          date.getMonth() + 1 < 10
            ? "0" + (date.getMonth() + 1)
            : date.getMonth() + 1;
        var hours =
          date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
        var minutes =
          date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
        var seconds =
          date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
        var strDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
        var currentdate =
          date.getFullYear() +
          seperator1 +
          month +
          seperator1 +
          strDate +
          " " +
          hours +
          seperator2 +
          minutes +
          seperator2 +
          seconds;
        return currentdate;
      },
      ...mapActions({
        setSummarizeDialog: "compt/setSummarizeDialog",
        upLoading: "compt/upLoading",
        queryAfPropertyData: "QueryTable/queryAfPropertyData",
        upDatasChange: "QueryTable/upDatasChange"
      }),
      ...mapMutations({
        setDimList: "QueryTable/setDimList",
        setMsuList: "QueryTable/setMsuList",
        setQueryType: "QueryTable/setQueryType",
        setTabtag: "QueryTable/setTabtag"
      })
    }
  };
</script>

<style lang="scss" scoped>
  .table-wrap {
    /deep/ .el-table {
      thead th {
        border-right: none;
      }

      .cell {
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .left-table {
    width: 194px;
    float: left;
  }

  .right-table {
    width: 350px;
    margin-left: 15px;
    float: left;

    /deep/ .el-input--mini {
      .el-input__inner {
        height: 22px;
        line-height: 22px;
      }

      .el-input__icon {
        line-height: 22px;
      }
    }

    .right-select{
      margin-right:20px;
    }
  }
</style>
