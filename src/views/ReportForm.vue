<template>
  <el-container style="overflow:hidden" v-loading="loading">
    <el-header class="design-page">
      <div class="head-left">
        <el-input class="page-name"
          ref="toSaveBtn"
          size="mini"
          v-model="pageCache.pageName"
          @input="inputChange('pageCache.pageName')"
          placeholder="未命名"></el-input>
      </div>

      <div class="head-opt-btn">
        <el-tooltip class="item"
          effect="dark"
          content="预览"
          placement="top-start">
          <i :class="{'icon-A10603_Overview':true}"
            @click="preview()"></i>
        </el-tooltip>
        <el-tooltip class="item"
          v-if="pageCache.isDemo ? pageCache.isDemo === '0' : true"
          effect="dark"
          content="保存"
          placement="top-start">
          <i :class="{'icon-A10579_Preservation':true}"
            @click="saveReportForm"></i>
        </el-tooltip>
        <el-tooltip class="item"
          effect="dark"
          content="另存"
          placement="top-start"
          v-show="this.reportFormType!=1 ">
          <i :class="{'icon-A10545_PS':true}"
            @click="saveAsReportForm"></i>
        </el-tooltip>
      </div>
    </el-header>
    <el-main style="padding: 0;"
      class="elMain">
      <div :class="{'mask-wrap':asideSign}"
        @click="manageTip"></div>
      <el-container>
        <el-main class="rf-header-wrap">
          <el-container>
            <el-header style="height: 66px;">
              <report-func></report-func>
            </el-header>
            <el-main class="elMain">
              <report-main></report-main>
            </el-main>
          </el-container>
        </el-main>
        <el-aside width="360px">
          <report-attr-set ref="attrSet"></report-attr-set>
        </el-aside>
      </el-container>
    </el-main>
    <el-dialog
      width="420px"
      :visible.sync="dialogSaveAs"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="save-as-dialog">
      <div slot="title"
        class="dialog-title">
        <span>另存为</span>
        <div class="title-line"></div>
      </div>
      <el-form ref="saveForm"
        :rules="rules"
        :model="saveForm">
        <el-form-item prop="pageName"
          label="名称"
          :label-width="'51px'"
          style="margin-bottom:14px;margin-top:-6px;">
          <el-input size="mini"
            v-model="saveForm.pageName"
            @input="inputChange('saveForm.pageName')"
            autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item style="margin-bottom:0;"
          size="mini"
          prop="catalogId"
          class="win-item"
          label="目录"
          :label-width="'51px'">
          <el-cascader :change-on-select="true"
            expand-trigger="hover"
            :show-all-levels="false"
            style="width:100%"
            :options="saveToTreeData"
            v-model="saveForm.catalogId"></el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer"
        class="dialog-footer">
        <el-button @click="dialogSaveAs=false"
          size="mini">取 消
        </el-button>
        <el-button type="primary"
          @click="saveAsSubmit('saveForm')"
          size="mini">确 定
        </el-button>
      </div>
    </el-dialog>
  </el-container>
</template>
<script>
import ReportAttrSet from '../components/design/reportAttrSet.vue'
import ReportFunc from '../components/design/reportFunc.vue'
import ReportMain from '../components/design/reportMain.vue'
import { mapActions, mapMutations, mapState, mapGetters } from 'vuex'
import { HST } from "../utils/HandsTable.js"
import { objDeepCopy } from '../utils/comonFunc'

export default {
  name: 'ReportForm',
  components: {
    ReportAttrSet,
    ReportFunc,
    ReportMain,
  },
  inject: ['reload'],
  data() {
    var catalogCheck = (rule, value, callback) => {
      if (value.length == 0) {
        callback(new Error("请选择目录"));
      } else {
        callback();
      }
    };
    return {
      loading: false,
      // reportFormName: '',
      reportFormType: '',
      toSaveInput: false,
      dialogSaveAs: false,
      saveForm: {
        pageName: "",
        catalogId: []
      },
      saveToTreeData: [],
      rules: {
        pageName: [
          { required: true, message: "请输入名称", trigger: "blur" },
          { min: 1, max: 30, message: "长度在 1 到 30 个字符", trigger: "blur" }
        ],
        catalogId: [
          { required: true, validator: catalogCheck, trigger: "change" }
        ]
      }
    };
  },
  mounted() {
    let pc = sessionStorage.getItem('pageCache');
    let pageInfo = JSON.parse(pc);
    this.setPageCache(pageInfo);
    document.title = this.pageCache.pageName || "新增报表工具";
    if (this.pageCache == null) {
      this.$router.push({
        path: "/",
        name: ""
      });
    }
  },
  activated() {
    this.upLoaderSign(false);
    this.toSaveInput = false;
    // if (this.pageCache && this.pageCache.pageName != null) {
    //   this.reportFormName = this.pageCache.pageName;
    // } else if (this.pageCache && this.pageCache.operation != "wait") {
    //   this.reportFormName = "";
    // }
    this.toLoad();  //页面进来就加载数据
  },
  watch: {
    pageNameFocus(flag) {
      if (flag == true) {
        this.upPageNameFocus(false)
        this.$refs.toSaveBtn.focus()
      }
    }
  },
  methods: {
    inputChange(val) {
      let inputVal = "";
      if (val == "pageCache.pageName") {
        inputVal = this.pageCache.pageName;
      } else {
        inputVal = this.saveForm.pageName;
      }
      if (inputVal.length > 30) {
        let str = inputVal.slice(0, 30);
        if (val == "pageCache.pageName") {
          this.pageCache.pageName = str;
        } else {
          this.saveForm.pageName = str;
        }
        this.$message.warning("名称长度不能超过30字符!");
        return false;
      }
    },
    toMain() {
      this.upLoaderSign(false);
      this.$router.push({
        path: "/index",
        name: "index"
      });
    },
    preview() {
      /* let isQuery = this.isQuery('1003');
      if (!isQuery) {
        this.$message.warning("必填字段不能为空");
        return
      } */
      // this.pageCache.pageName = this.reportFormName
      // this.pageCache.operation = "wait"
      // window.sessionStorage.setItem("pageCache", JSON.stringify(this.pageCache))
      let PageDetails = this.getPageDetails('preview');
      this.upTempPageDetails(PageDetails);
      // let tableList = [];
      // let datas = this.getTableStyleAndRelative('').details
      // datas.forEach(data => {
      //   tableList.push(JSON.parse(data.compAttrs))
      // })
      // this.upTableList(tableList);
      let store = {}
      const $store = { ...this.$store.state };
      for (let key in $store) {
        if (["contextUrl", "defaultSystemId"].includes(key)) {
          store[key] = $store[key];
        } else if (["contextUrl", "defaultSystemId", "commonProperties", "HomeTree", "HomeBody"].includes(key)) {
          store[key] = objDeepCopy($store[key])
        } else if (key === 'ReportMgt') {
          let mgt = {};
          for (const key2 in $store[key]) {
            const element = $store[key][key2];
            if (key2 === "edcuiCompts") {
              let edcBak1 = objDeepCopy(element[0] || {});
              if (edcBak1.comptAttrs && edcBak1.comptAttrs.fieldList) {
                let fieldList = edcBak1.comptAttrs.fieldList;
                fieldList.forEach((item, index) => { //下拉清除下拉选项，预览页重新请求
                  if (item.type === "ElCascader") {
                    fieldList[index].comptAttrs.options = [];
                    fieldList[index].comptAttrs.options2 = [];
                  }
                });
              }
              mgt[key2] = [edcBak1, { ...element[1] }];
            } else if (key2 === "hotObj") {
              mgt[key2] = {};
            } else if (key2 !== "hot") {
              mgt[key2] = element;
            }
          }
          store[key] = mgt
        }
      }
      sessionStorage.setItem("store", JSON.stringify(store));
      let routeData = this.$router.resolve({ name: "reportView" });
      window.open(routeData.href, "_blank");
    },
    toLoad() {
      var pageId = this.pageCache.pageId;
      var operation = this.pageCache.operation;
      if (operation == "wait") {
        return;
      }
      if (pageId != null) {
        var pageParam = Object.assign({
          pageId: pageId,
          createUser: window.sessionStorage.getItem("user_id"),
          classTypeId: 1003,
          preViewFalg: "0" //1-记录操作日志标志    0-不记录操作日志
        });

        this.queryPageCompts(pageParam)
          .then(val => {
            if (val.status == 200 && val.data.respResult == 1) {
              let respData = val.data.respData.filter(data => {
                return data.compType === 'Sheet' ? true : false;
              })
              if (respData != null && respData.length > 0) {
                let tableList = [];
                respData.forEach(data => {
                  let tableData = JSON.parse(data.compAttrs);
                  tableData.sheet_id = data.elementId;
                  tableList.push(tableData)
                })
                this.upTableList(tableList);
              } else {
                this.resetTableList();
              }

              let condiRuleList = {}
              respData = val.data.respData.filter(data => {
                if(data.compType === 'Sheet') {
                  let compAttrs = JSON.parse(data.compAttrs)
                  if (compAttrs.condiRuleList) {
                    condiRuleList[compAttrs.sheet_name] = compAttrs.condiRuleList
                  }
                  let showFilter = compAttrs.show_filter || false;
                  this.upShowFilter(showFilter);
                }
                return data.compType === 'QuerySetting' ? true : false;
              })
              this.upCondiRuleList({type:'reset', data: condiRuleList})
              const index = HST.searchCurSheet().sheetIndex || 1
              let curFormat = condiRuleList[`sheet${index}`] || []
              curFormat.forEach((curRule, i) => {
                if(curRule.cells.length === 0) {
                  curFormat.splice(i, 1)
                }
              })
              curFormat = (JSON.parse(JSON.stringify(curFormat))).reverse()
              const tempRule = {...curFormat[0]}
              this.upRuleIndex((tempRule.index||0) + 1)

              let edcuiCompts0
              respData.length > 0 ? edcuiCompts0 = JSON.parse(respData[0].compAttrs) : null
              if (!!edcuiCompts0) {
                this.upEdcuiCompts0(edcuiCompts0)
              }
            } else {
              // this.$message.error("页面信息查询失败");
            }
            this.upLoaderSign(true);
            // this.resetReportLoading(false)
          })
          .catch(err => {
            this.resetReportLoading(false)
            // this.$message.error("页面信息查询异常");
            console.error(err)
          });
      } else {
        this.upLoaderSign("default");
        this.resetTableList();
        this.resetReportLoading(false)
      }
    },
    saveReportForm() {
      let index = HST.searchCurSheet().index
      let sub_index = HST.searchCurArea(index)
      if (sub_index !== -1) {
        let area_info = this.edcuiCompts[1].comptAttrs.tableList[index].area_info[sub_index]
        let af_col = area_info.af_col,
          cur_colData = this.$refs.attrSet.cur_colData,
          af_row = area_info.af_row,
          cur_rowData = this.$refs.attrSet.cur_rowData,
          hiddenDimList = area_info.hiddenDimList,
          cur_hiddenDims = this.$refs.attrSet.hiddenDims
        if (JSON.stringify(af_col) != JSON.stringify(cur_colData) || JSON.stringify(af_row) != JSON.stringify(cur_rowData) || JSON.stringify(hiddenDimList) != JSON.stringify(cur_hiddenDims)) {
          this.$confirm(`"${area_info.area_name}"的修改未更新，如果继续，您的修改将丢失。是否继续操作？`, '提示', {
            closeOnClickModal: false,
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.doSave()
          }).catch(() => {
          });
        } else {
          this.doSave()
        }
      } else {
        this.doSave()
      }
    },
    doSave() {
      if (this.pageCache.pageName == undefined || this.pageCache.pageName.replace(/\s*/g, "") == "") {
        this.$message.warning("请在设计页填写页面名称");
        this.toSaveInput = true;
        this.$refs.toSaveBtn.focus();
        return;
      }
      this.loading = true;

      this.toSaveInput = false;
      // let pageId = "";
      let act = "";
      // this.pageCache.pageName = this.reportFormName;
      if (this.pageCache.pageId == null) {
        //新增页面保存
        // pageId = getUUID();
        // this.pageCache.pageId = pageId;
        act = "add";
      } else {
        //页面编辑保存
        // pageId = this.pageCache.pageId;
        act = "edit";
      }
      const params = this.getPageDetails();
      if (params === false) {
        this.loading = false
        return
      }
      let reqObj = {};
      reqObj.pageInfo = JSON.parse(JSON.stringify(this.pageCache));
      reqObj.pageInfo.status = 0;
      reqObj.pageDetailList = params.details;
      reqObj.pageCompAfRelList = params.relative;
      reqObj.pageInfo.updateUser = sessionStorage.getItem("user_id");
      delete reqObj.pageInfo.operation;
      if (act == "edit") {
        //修改
        this.updatePageAndDetail(reqObj)
          .then(val => {
            if (val.status === 200 && val.data.respResult === "1") {
              this.$message.success("页面更新成功");
            } else {
              this.$message.error(val.data.respErrorDesc);
            }
            this.loading = false;
          })
          .catch(err => {
            console.error("error:", err)
            this.loading = false;
            // this.$message.error("页面更新失败");
          });
      } else {
        //新增
        this.savePageAndDetail(reqObj)
          .then(val => {
            if (val.status === 200 && val.data.respResult === "1") {
              this.$message.success("页面保存成功");
              let pageCache = this.pageCache
              pageCache.pageId = val.data.respData.pageId
              this.setPageCache(pageCache)
            } else {
              this.$message.error(val.data.respErrorDesc);
              this.pageCache.pageId = null;
            }
            this.loading = false
          })
          .catch(err => {
            console.error(err)
            this.pageCache.pageId = null;
            // this.$message.error("页面保存失败");
            this.loading = false;
          });
      }
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
    getCatalogData() {//获取目录最新数据
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
              var result = [];
              var first = [],
                second = [];
              list.forEach(function (val) {
                if (val.parentCatalogId == "myfold") {
                  if (_this.myFolder != "0") { //0：隐藏 1：显示
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

                result.push(temp);
              });
            }

          } else {
            this.$message.error("目录查询失败");
          }
          //将树集合设置到容器中
          var obj = {
            result: result,
            myFolder: this.myFolder
          }
          //设置值
          this.setTreeList(obj);

          //将treedata进行过滤
          var temp = "";
          this.treeData.forEach(function (val) {
            //forEach不能使用this否则会包指向不对
            if (val.value == "myfold") {
              temp = val;
            }
          });
          //最后将值进行设置
          this.saveToTreeData.push(temp);

        })
        .catch(err => {
          console.error(err)
          // this.$message.error("文件夹查询异常");
        });
    },
    saveAsReportForm() {
      this.getCatalogData();
      this.saveToTreeData.splice(0, this.saveToTreeData.length);
      this.saveForm.pageName = this.pageCache.pageName;
      this.dialogSaveAs = true;
      this.saveForm.catalogId = []
      this.$nextTick(() => {
        this.$refs.saveForm.clearValidate()
      })
    },
    saveAsSubmit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          let catalogId = this.saveForm.catalogId[
            this.saveForm.catalogId.length - 1
          ];
          let pageName = this.saveForm.pageName;
          let pageId = "";
          const param = this.getPageDetails();

          var reqObj = { pageInfo: {} };
          reqObj.pageInfo.pageId = pageId;
          reqObj.pageInfo.pageName = pageName;
          reqObj.pageInfo.catalogId = catalogId;
          reqObj.pageInfo.status = 0;
          reqObj.pageInfo.classTypeId = this.menuClassTypeId;
          reqObj.pageInfo.createUser = sessionStorage.getItem("user_id");
          reqObj.pageInfo.tenantId = sessionStorage.getItem("tenant_id");
          reqObj.pageDetailList = param.details;
          reqObj.pageCompAfRelList = param.relative;

          this.saveAsReport(reqObj)
            .then(val => {
              if (val.status === 200 && val.data.respResult === "1") {
                this.$message.success("页面另存成功");
                this.dialogSaveAs = false;


                //另存成功后，重新查询页面信息，其中：pageName+userId可确定唯一页面
                let infoParam = {
                  classTypeId: this.menuClassTypeId,
                  pageName: pageName,
                  userId: sessionStorage.getItem("user_id")
                };
                this.queryTableData(infoParam)
                  .then(val => {
                    if (val.status === 200 && val.data.respResult === "1") {
                      if (val.data.respData && val.data.respData.length > 0) {
                        this.setPageCache(val.data.respData[0]);
                        this.pageCache.operation = "design"
                        let pageInfo = JSON.stringify(this.pageCache);
                        sessionStorage.setItem("pageCache", pageInfo);
                        document.title = pageName;
                      }
                    } else {
                      console.error(val);
                    }
                  })
                  .catch(err => {
                    console.error(err);
                    // this.$message.error("页面查询异常");
                  });

                //另存成功后，重新查询页面信息
                var pageParam = Object.assign({
                  pageId: val.data.respData.pageId,
                  createUser: window.sessionStorage.getItem("user_id"),
                  classTypeId: 1003,
                  preViewFalg: "0" //1-记录操作日志标志    0-不记录操作日志
                });
                this.queryPageCompts(pageParam)
                  .then(val => {
                    if (val.status === 200 && val.data.respResult === "1") {
                      if (val.data.respData && val.data.respData.length > 0) {
                        //重新加载页面
                        let respData = val.data.respData.filter(data => {
                          return data.compType === 'Sheet' ? true : false;
                        })
                        if (respData != null && respData.length > 0) {
                          let tableList = [];
                          respData.forEach(data => {
                            let tableData = JSON.parse(data.compAttrs);
                            tableData.sheet_id = data.elementId;
                            tableList.push(tableData)
                          })
                          this.upTableList(tableList);
                        } else {
                          this.resetTableList();
                        }
                        // this.upLoaderSign(true);
                      }
                    } else {
                      console.error(val);
                    }
                  })
                  .catch(err => {
                    console.error(err);
                    // this.$message.error("页面查询异常");
                  });
              } else {
                this.$message.error(val.data.respErrorDesc);
              }
            })
            .catch(err => {
              console.error(err);
              // this.$message.error("页面另存异常");
            });
        } else {
          return false;
        }
      });
    },
    manageTip() {
      this.$message.close()
      this.$message.warning('请先关闭“区域管理”再进行操作！');
    },
    ...mapMutations({
      upPageNameFocus: "ReportMgt/upPageNameFocus",
      upTempPageDetails: "ReportMgt/upTempPageDetails",
      upEdcuiCompts0: "ReportMgt/upEdcuiCompts0",
      upTableList: "ReportMgt/upTableList",
      resetTableList: "ReportMgt/resetTableList",
      resetReportLoading: "ReportMgt/resetReportLoading",
      upCondiRuleList: 'ReportMgt/upCondiRuleList',
      upRuleIndex: 'ReportMgt/upRuleIndex',
      setTreeList: "HomeTree/setTreeList",
      upShowFilter: "ReportMgt/upShowFilter"
    }),
    ...mapActions({
      saveAsReport: "HomeBody/saveAsReport",
      setPageCache: "HomeBody/setPageCache",
      savePageAndDetail: "HomeBody/savePageAndDetail",
      queryPageCompts: "compt/queryPageCompts",
      upLoaderSign: "ReportMgt/upLoaderSign",
      updatePageAndDetail: "HomeBody/updatePageAndDetail",
      resetReportLoading: "ReportMgt/resetReportLoading",
      queryTreeData: "HomeTree/queryTreeData",//获取树最新数据
      queryTableData: "ReportIndex/queryTableData",
      storeVuexStore: "storeVuexStore"
    })
  },
  computed: {
    ...mapState({
      pageNameFocus: state => state.ReportMgt.pageNameFocus,
      menuClassTypeId: state => state.HomeTree.menuClassTypeId,
      hotObj: state => state.ReportMgt.hotObj,
      edcuiCompts: state => state.ReportMgt.edcuiCompts,
      maxCols: state => state.ReportMgt.maxCols,
      maxRows: state => state.ReportMgt.maxRows,
      asideSign: state => state.ReportMgt.asideSign,
      pageCache: state => state.HomeBody.pageCache,
      treeData: state => state.HomeTree.treeData,
    }),
    ...mapGetters({
      getPageDetails: "ReportMgt/getPageDetails"
      // isQuery: "QueryTable/isQuery"
    })
  }
}
</script>
<style scoped lang="scss">
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
.el-header {
  &.design-page {
    height: 40px !important;
    line-height: 40px;
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
    .query-design {
      width: 100%;
      height: 100%;
      background-color: $main-bg1;
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

.rf-header-wrap {
  padding: 0;
  .el-container > .el-header,
  .el-container > .el-main {
    padding: 0;
  }
}

.mask-wrap {
  position: absolute;
  width: 100%;
  // height: calc(100% - 40px);
  height: 100%;
  background: $main-bg;
  opacity: 0.2;
  z-index: 181;
  margin-top: -40px;
}
.elMain {
  height: 100%;
  overflow: hidden;
}
</style>


