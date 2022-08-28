<template>
  <el-container v-loading="loadingNew">
    <el-header class="design-page">
      <div class="head-left">
        <!--        <el-tooltip class="item to-main" effect="dark" content="返回" placement="top-start">
          <i :class="{'icon-A10233_left':true}" @click="toMain"></i>
        </el-tooltip>-->
        <el-input
          class="page-name"
          :class="{'page-input' : this.toSaveInput}"
          size="mini"
          v-model="pageName"
          placeholder="请输入页面名称"
          ref="toSaveBtn"
          @input="inputChange('pageName')"
        ></el-input>
      </div>
      <div class="head-opt-btn">
        <el-tooltip class="item" effect="dark" content="预览" placement="top-start">
          <i :class="{'icon-A10603_Overview':true}" @click="toPrew"></i>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" v-if="pageCache.isDemo ? pageCache.isDemo === '0' : true" content="保存" placement="top-start">
          <i :class="{'icon-A10579_Preservation':true}" @click="toSave"></i>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="另存" placement="top-start">
          <i :class="{'icon-A10545_PS':true}" @click="toSaveAs"></i>
        </el-tooltip>
      </div>
    </el-header>
    <el-container>
      <el-aside width="200px" v-if="designType==0">
        <div
          class="header-compts"
          v-if="designType==0"
          v-for="compt in edcuiCompts"
          :key="compt.comptSort"
          :data-id="compt.comptSort"
          @click="addToDesign(compt.comptSort)"
        >
          <div style="height:100%">
            <Cell :isDesign="false" :vscompt="compt"></Cell>
          </div>
        </div>
      </el-aside>
      <el-main style="position:relative" class="design-main">
        <!-- 即席查询 -->
        <div class="query-design" id="water-wrap" v-if="designType==1">
          <el-scrollbar
            class="my-scroll-bar"
            style="height:100%;"
            :native="false"
            :noresize="false"
            tag="section"
          >
            <div class="query-layout">
              <div
                :class="['query-grid',querygrid[index]==true?'actived':'']"
                :id="'main'+item.orderId"
                v-for="(item,index) in s_edcuiCompts"
                :key="item.comptSort"
                @click="upBlock(item.comptSort)"
              >
                <Cell
                  :isDesign="true"
                  :vscompt="item"
                  element-loading-background="rgba(0, 0, 0, 0.5)"
                ></Cell>
              </div>
            </div>
            <!-- <div>
                <div
                  v-for="(item,index) in s_edcuiCompts"
                  :key="item.comptSort"
                  :class="{'query-box':true,'box-condi':index==0,'box-table':index==1,'active':querygrid[index]}">
                  <div style="height:100%" @click="upBlock(item.comptSort)"><Cell :isDesign="true" :vscompt="item" v-loading="index==1?loading:false" element-loading-background="rgba(0, 0, 0, 0.5)"></Cell></div>
                </div>
            </div>-->
            <!-- <grid-layout
                :layout.sync="layout"
                :col-num="24"
                :row-height="1"
                :is-draggable="true"
                :is-resizable="true"
                :is-mirrored="false"
                :vertical-compact="true"
                :margin="[20, 20]"
                :use-css-transforms="true"
                :autoSize="true"
              >

                  <grid-item
                  :class="{'active':querygrid[index]}"
                  v-for="(item,index) in s_edcuiCompts"
                            :key="item.comptSort"
                            :x="item.blockInfo.x"
                            :y="item.blockInfo.y"
                            :w="item.blockInfo.w"
                            :h="item.blockInfo.h"
                            :i="item.comptSort">
                      <div style="height:100%" @click="upBlock(item.comptSort)"><Cell :isDesign="true" :vscompt="item" :id="'main'+(index+1)" v-loading="index==1?loading:false" element-loading-background="rgba(0, 0, 0, 0.5)"></Cell></div>
                      <el-tooltip v-if="designType!=1" class="item" effect="dark" content="删除" placement="top-start">
                        <i :class="{'opt-btn':true,'active': isQuery, 'el-icon-delete':true}" @click="deleteCompt(item.comptSort)"></i>
                      </el-tooltip>
                  </grid-item>
            </grid-layout>-->
          </el-scrollbar>
        </div>
        <!-- 界面定制及大屏 -->
        <div v-else-if="designType==0">
          <div id="opt-box" ref="optBox">
            <vue-draggable-resizable
              :ref="'dr'+compt.comptSort"
              v-if="s_edcuiCompts.length>0"
              :w="compt.blockInfo.w"
              :h="compt.blockInfo.h"
              :x="compt.blockInfo.x"
              :y="compt.blockInfo.y"
              :class="{ 'designCompt':true,'qryGroup':compt.jixi==true}"
              @resizestop="onResizstop"
              @dragging="onDrag"
              @resizing="onResize"
              :resizable="true"
              :grid="[1,1]"
              :parent="false"
              v-for="compt in s_edcuiCompts"
              :key="compt.comptSort"
              :data-id="compt.comptSort"
              @activated="upActivedId(compt.comptSort)"
            >
              <div style="height:100%">
                <Cell :isDesign="true" :vscompt="compt"></Cell>
              </div>
              <el-tooltip class="item" effect="dark" content="删除" placement="top-start">
                <i class="opt-btn el-icon-delete" @click="deleteCompt(compt.comptSort)"></i>
              </el-tooltip>
            </vue-draggable-resizable>
          </div>
          <rulerTool />
        </div>
      </el-main>
      <el-aside width="360px">
        <AttrSet></AttrSet>
        <el-form
          v-if="activedCompt.comptAttrs"
          :label-position="labelPosition"
          label-width="90px"
          :model="activedCompt"
        >
          <!-- yxq -->
          <el-form v-if="activedCompt.jixi==true">
            <el-checkbox-group v-model="activedCompt.checkList" @change="changeHandle">
              <el-checkbox v-for="item in fieldList" :key="item.id" :label="item">{{item.value}}</el-checkbox>
            </el-checkbox-group>
            <el-button @click="openSearch" size="small">打开设置</el-button>
          </el-form>
        </el-form>
      </el-aside>
    </el-container>
    <!-- yxq -->
    <el-dialog title="查询配置" :visible.sync="dialogVisible">
      <Search @hideSearch="dialogVisible=false"></Search>
    </el-dialog>

    <el-dialog width="420px" :visible.sync="dialogSaveAs" class="save-as-dialog">
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
            autocomplete="off"
            @input="inputChange('saveForm.pageName')"
          ></el-input>
        </el-form-item>
        <el-form-item
          style="margin-bottom:0;"
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
            :options="saveToTreeData"
            v-model="saveForm.catalogId"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogSaveAs=false" size="mini">取 消</el-button>
        <el-button type="primary" @click="saveAsSubmit('saveForm')" size="mini">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      size="mini"
      title="查询历史"
      width="600px"
      class="queryHis"
      :visible.sync="queryHisDialog"
      :append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <QueryHisDialog v-if="queryHisDialog"></QueryHisDialog>
    </el-dialog>
    <ExportForm></ExportForm>
    <summarizeDialog></summarizeDialog>
    <el-dialog
      size="mini"
      title="定时取数设置"
      width="600px"
      class="queryTask"
      :visible.sync="queryTaskDialog"
      :append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <QueryTask v-if="queryTaskDialog"></QueryTask>
    </el-dialog>
  </el-container>
</template>
<script>
import Cell from "../components/design/Cell.vue";
import VueDraggableResizable from "vue-draggable-resizable";
// import VueDraggableResizable from "../components/tools/vue-draggable-resizable"//后期自由布局加入后使用本地组件方式（需要改源代码）
import "vue-draggable-resizable/dist/VueDraggableResizable.css";
import rulerTool from "../components/tools/rulerTool.vue";
import Search from "../components/design/Search.vue";
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import VueGridLayout from "vue-grid-layout";
import AttrSet from "../components/design/AttrSet";
import ExportForm from "../components/design/ExportForm.vue";
import SummarizeDialog from "../components/design/SummarizeDialog.vue";
import QueryHisDialog from "../components/design/QueryHistory.vue";
import { objDeepCopy } from "../utils/comonFunc.js";
import { service } from "ngbd-utils";
import QueryTask from "../components/design/QueryTask.vue";

export default {
  components: {
    Cell,
    VueDraggableResizable,
    rulerTool,
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    Search,
    AttrSet,
    ExportForm,
    SummarizeDialog,
    QueryHisDialog,
    QueryTask
  },
  inject: ["reload"],
  data() {
    var catalogCheck = (rule, value, callback) => {
      if (value.length == 0) {
        callback(new Error("请选择目录"));
      } else {
        callback();
      }
    };
    return {
      loadingNew: false,
      labelPosition: "right",
      tableSvc: [
        {
          value: "http://10.1.2.111:8088/public/tableData",
          label: "表格服务1"
        }
      ],
      saveToTreeData: [],
      comptSvc: {},
      dialogVisible: false, //yxq
      w_trans: 1,
      querygrid: [true, false],
      pageName: "",
      dialogSaveAs: false,
      saveForm: {
        pageName: "",
        catalogId: []
      },
      toSaveInput: false,
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
  methods: {
    inputChange(val) {
      let inputVal = "";
      if (val == "pageName") {
        inputVal = this.pageName;
      } else {
        inputVal = this.saveForm.pageName;
      }
      if (inputVal.length > 30) {
        let str = inputVal.slice(0, 30);
        if (val == "pageName") {
          this.pageName = str;
        } else {
          this.saveForm.pageName = str;
        }
        this.$message.warning("名称长度不能超过30字符!");
        return false;
      }
    },
    addToDesign(cid) {
      let d_cpts = objDeepCopy(this.edcuiCompts[cid]);
      d_cpts["comptSort"] = this.comptNum;
      d_cpts["blockInfo"] = {};
      d_cpts["serviceId"] = "";
      if (this.designType == 1) {
        var item = { x: 0, y: 0, w: 12, h: 3, i: this.comptNum };
        d_cpts["blockInfo"] = item;
        this.layout.push(item);
      }
      if (d_cpts.jixi == true) {
        d_cpts["blockInfo"].out_w = 600;
      }
      this.s_edcuiCompts.push(d_cpts);
      this.upComptNum("add");
    },
    deleteCompt(cid) {
      const _compt = this.s_edcuiCompts;
      for (var i = 0; i < _compt.length; i++) {
        if (cid == _compt[i].comptSort) {
          this.s_edcuiCompts.splice(i, 1);
          this.upComptNum("delete");
        }
      }
    },
    onDrag(x, y) {
      this.activedCompt["blockInfo"]["x"] = x;
      this.activedCompt["blockInfo"]["y"] = y;
    },
    onResize(x, y, width, height) {
      this.activedCompt["blockInfo"]["x"] = x;
      this.activedCompt["blockInfo"]["y"] = y;
      this.activedCompt["blockInfo"]["h"] = height;
      this.activedCompt["blockInfo"]["w"] = width;
      // const _dr = "dr"+this.activedCompt.comptSort
      // this.$refs[_dr][0].w = 1600
    },
    onResizstop: function(i, newH, newW, newHPx, newWPx) {},
    objDeepCopy(source) {
      var that = this;
      var sourceCopy = source instanceof Array ? [] : {};
      for (var item in source) {
        sourceCopy[item] =
          typeof source[item] === "object"
            ? that.objDeepCopy(source[item])
            : source[item];
      }
      return sourceCopy;
    },
    setScale() {
      var _w = this.$refs.optBox.clientWidth;
      // var _h = window.innerHeight;
      this.w_trans = _w / 1366;
      // var h_trans = _h/winHeit
      document.getElementById("opt-box").style.transform =
        "scale(" + this.w_trans + ")";
      document.getElementById("opt-box").style.transformOrigin = "0 0";
      // document.getElementsByClassName('draw-center')[0].style.transform = 'scaleY('+h_trans+')'
    },
    toPrew() {
      this.pageCache.operation = "wait";
      this.pageCache.pageName = this.pageName;

      // console.info(this.pageCache.pageId);
      //进行操作日志记录
      if (this.pageCache.pageId != undefined) {
        //表示页面已经保存可以进行预览
        var pageParam = Object.assign({
          objId: this.pageCache.pageId,
          operateUser: window.sessionStorage.getItem("user_id"),
          operateObj: this.menuClassTypeId,
          operateType: 5,
          result: 1
        });
        this.addOptlog(pageParam)
          .then(val => {})
          .catch(err => {
            console.error(err);
          });
      }

      //预览界面跳转
      // this.$router.push({
      //   path: "/preview",
      //   name: "preview"
      // });
      let cacheData = JSON.parse(JSON.stringify(this.pageCache));

      sessionStorage.setItem("pageCache", JSON.stringify(cacheData));
      if(!!window.ActiveXObject || "ActiveXObject" in window) {
        this.storeVuexStore([
          "contextUrl",
          "defaultSystemId",
          "commonProperties",
          "HomeTree",
          "HomeBody",
          "PageDesign",
          "compt",
          "QueryTable"
        ]);
        let routeData = this.$router.resolve({ name: "preview" }); //query: { timestamp: getTimestamp }
        window.open(routeData.href, "_blank");
			} else {
        this.storeVuexStore([
          "contextUrl",
          "defaultSystemId",
          "commonProperties",
          "HomeTree",
          "HomeBody",
          "PageDesign",
          "compt",
          "QueryTable"
        ]).then(val => {
          let routeData = this.$router.resolve({ name: "preview" }); //query: { timestamp: getTimestamp }
          window.open(routeData.href, "_blank");
        })
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
    getCatalogData() {
      //获取目录最新数据
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
              list.forEach(function(val) {
                if (val.parentCatalogId == "myfold") {
                  if (_this.myFolder != "0") {
                    //0：隐藏 1：显示
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
          };
          //设置值
          this.setTreeList(obj);

          //将treedata进行过滤
          var temp = "";
          this.treeData.forEach(function(val) {
            //forEach不能使用this否则会包指向不对
            if (val.value == "myfold") {
              temp = val;
            }
          });
          //最后将值进行设置
          this.saveToTreeData.push(temp);
        })
        .catch(err => {
          console.error(err);
          // this.$message.error("文件夹查询异常");
        });
    },
    toMain() {
      this.upLoaderSign(false);
      this.$router.push({
        path: "/index",
        name: "index"
      });
    },
    toSave() {
      if (this.pageName.replace(/\s*/g, "") == "") {
        this.$message.warning("请填写页面名称");
        this.toSaveInput = true;
        this.$refs.toSaveBtn.focus();
        return;
      }
      this.loadingNew = true;
      this.toSaveInput = false;
      var pageId = "";
      var act = "";
      this.pageCache.pageName = this.pageName;
      if (this.pageCache.pageId == null) {
        //新增页面保存
        // pageId = '';
        //this.pageCache.pageId = pageId;
        act = "add";
      } else {
        //页面编辑保存
        pageId = this.pageCache.pageId;
        act = "edit";
      }
      var oldQueryType = this.queryType;
      if (oldQueryType == "summarize") this.setQueryType("list"); //用于修复在汇总状态下保存，会把当前的表格列给保存进来。

      this.s_edcuiCompts[1].comptAttrs.columns = this.tableColumn;
      var param = this.formatSaveInfo(pageId);
      var reqObj = {};
      reqObj.pageInfo = this.pageCache;
      reqObj.pageInfo.status = 0;
      reqObj.pageDetailList = param;
      reqObj.pageInfo.updateUser = sessionStorage.getItem("user_id");
      delete reqObj.pageInfo.operation;
      if (act == "edit") {
        //修改
        this.updatePageAndDetail(reqObj)
          .then(val => {
            if (val.status === 200 && val.data.respResult === "1") {
              document.title = this.pageName;
              sessionStorage.setItem("pageCache", JSON.stringify(this.pageCache));
              this.$message.success("页面更新成功");
            } else {
              this.$message.error(val.data.respErrorDesc);
            }
          })
          .catch(err => {
            // this.$message.error("页面更新失败");
          })
          .finally(() => {
            if (oldQueryType == "summarize") this.setQueryType(oldQueryType);
            this.loadingNew = false;
          });
      } else {
        //新增
        this.savePageAndDetail(reqObj)
          .then(val => {
            if (val.status === 200 && val.data.respResult === "1") {
              document.title = this.pageName;
              this.pageCache.pageId = val.data.respData.pageId;
              sessionStorage.setItem("pageCache", JSON.stringify(this.pageCache));
              this.$message.success("页面保存成功");
            } else {
              this.$message.error(val.data.respErrorDesc);
              this.pageCache.pageId = null;
            }
          })
          .catch(err => {
            this.pageCache.pageId = null;
            // this.$message.error("页面保存失败");
          })
          .finally(() => {
            if (oldQueryType == "summarize") this.setQueryType(oldQueryType);
            this.loadingNew = false;
          });
      }
    },
    formatSaveInfo(pageId) {
      var param = [];
      for (var val of this.s_edcuiCompts) {
        var temp = {};
        temp.pageId = pageId;
        temp.afId = val.afId;
        temp.blockInfo = JSON.stringify(val.blockInfo);
        var comptAttrs = { ...val.comptAttrs };
        if (val.type == "ElTable") {
          var cpyComptAttrs = JSON.parse(JSON.stringify(comptAttrs));
          cpyComptAttrs.tableattrs.data = [];
          cpyComptAttrs.pagination.total = 0;
          (cpyComptAttrs.filterData || []).forEach(fd => {
            if (fd.type === "ElCascader") {
              delete fd.dfAreaSels;
              fd.options = [];
              delete fd.options2;
            }
          });
          comptAttrs = cpyComptAttrs; // 清除表格数据和分页数据
          temp.compAttrs = JSON.stringify(comptAttrs);
        } else {
          // 清除即席条件数据
          comptAttrs = { ...val.comptAttrs };
          let jxData = objDeepCopy(comptAttrs.fieldList);
          for (var k = 0; k < jxData.length; k++) {
            if (jxData[k].type == "ElInput") {
              jxData[k].comptAttrs.m_value = "";
            } else if (jxData[k].type == "ElNumber") {
              if (jxData[k].comptAttrs.numList.length == 1) {
                jxData[k].comptAttrs.numList[0].m_value = "";
              } else {
                jxData[k].comptAttrs.numList[0].m_value = "";
                jxData[k].comptAttrs.numList[1].m_value = "";
              }
            } else if (jxData[k].type == "ElCascader") {
              jxData[k].comptAttrs.m_value = [];
              jxData[k].comptAttrs.options = [];
              delete jxData[k].comptAttrs.options2;
              if (jxData[k].comptAttrs.treeSelVal) {
                jxData[k].comptAttrs.treeSelVal = [];
              }
              // jxData[k].comptAttrs.dfAreaSels = [];
            } else if (jxData[k].type == "ElDatePicker") {
              if (
                jxData[k].comptAttrs.isSetDefault == undefined ||
                jxData[k].comptAttrs.isSetDefault == false
              ) {
                jxData[k].comptAttrs.m_value =
                  jxData[k].comptAttrs.m_value.length == 2 ? ["", ""] : [""];
              }
            }
          }
          comptAttrs.fieldList = jxData;
          // var obj = { fieldList: jxData };
          temp.compAttrs = JSON.stringify(comptAttrs);
        }
        // temp.compAttrs = JSON.stringify(comptAttrs);
        temp.elementId = val.comptSort;
        temp.compType = val.type;
        param.push(temp);
      }
      return param;
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
          classTypeId: this.menuClassTypeId,
          preViewFalg: "0" //1-记录操作日志标志    0-不记录操作日志
        });

        this.queryPageCompts(pageParam)
          .then(val => {
            if (val.status == 200 && val.data.respResult == 1) {
              this.$store.commit("compt/setSedcuiCompts", val.data.respData);
              this.upIsTotal(
                this.s_edcuiCompts[1].comptAttrs.totalRow || false
              ); //修复如果是勾选合计，页面重新进来勾掉合计没反应的问题。
            } else {
              // this.$message.error("页面信息查询失败");
            }
            this.upLoaderSign(true);
          })
          .catch(err => {
            // this.$message.error("页面信息查询异常");
            console.error(err);
          });
      } else {
        this.upLoaderSign("default");
        this.$store.commit("compt/resetTemplate");
      }
    },
    toSaveAs() {
      this.getCatalogData(); //重新在查询一下目录列表        -----   这个方法是异步的
      this.saveToTreeData.splice(0, this.saveToTreeData.length);
      this.saveForm.pageName = this.pageName;
      this.dialogSaveAs = true;
      this.saveForm.catalogId = []
      this.$nextTick(() => {
        this.$refs.saveForm.clearValidate()
      })
    },
    saveAsSubmit(formName) {
      const _this = this;
      this.$refs[formName].validate(valid => {
        if (valid) {
          var catalogId = this.saveForm.catalogId[
            this.saveForm.catalogId.length - 1
          ];
          var pageName = this.saveForm.pageName;
          var pageId = "";
          this.s_edcuiCompts[1].comptAttrs.columns = this.tableColumn;
          var param = this.formatSaveInfo(pageId);
          var reqObj = { pageInfo: {} };
          reqObj.pageInfo.pageId = pageId;
          reqObj.pageInfo.pageName = pageName;
          reqObj.pageInfo.catalogId = catalogId;
          reqObj.pageInfo.status = 0;
          reqObj.pageInfo.classTypeId = this.menuClassTypeId;
          reqObj.pageInfo.createUser = sessionStorage.getItem("user_id");
          reqObj.pageInfo.tenantId = sessionStorage.getItem("tenant_id");
          reqObj.pageDetailList = param;
          this.saveAsPage(reqObj)
            .then(val => {
              if (val.status === 200 && val.data.respResult === "1") {
                this.$message.success("页面另存成功");
                this.dialogSaveAs = false;

                //另存成功后，重新查询页面信息，其中：pageName+userId可确定唯一页面
                let param = {
                  classTypeId: this.menuClassTypeId,
                  pageName: pageName,
                  userId: sessionStorage.getItem("user_id")
                };
                this.queryTableData(param)
                  .then(val => {
                    if (val.status === 200 && val.data.respResult === "1") {
                      if (val.data.respData && val.data.respData.length > 0) {
                        this.setPageCache(val.data.respData[0]);
                        let pageInfo = JSON.stringify(this.pageCache);
                        sessionStorage.setItem("pageCache", pageInfo);
                        document.title = pageName;
                        //重新加载页面
                        setTimeout(() => {
                          _this.reload();
                        }, 500);
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
              // this.$message.error("页面另存失败");
            });
        } else {
          return false;
        }
      });
    },
    changeHandle(value) {
      //yxq
      var target = this.activedCompt.comptAttrs;
      target.splice(0, target.length);
      for (var val of value) {
        for (var item of this.edcuiCompts) {
          if (val.type == item.type) {
            let d_cpts = objDeepCopy(item);
            d_cpts["comptSort"] = this.comptNum;
            d_cpts["serviceId"] = "";
            d_cpts["fieldParam"] = {
              id: val.id,
              value: val.value
            };
            if (val.id == "field_btn") {
              d_cpts.methods = {
                clickHandle: `this.queryData(${this.activedCompt.comptSort})`
              };
            }
            target.push(d_cpts);
            this.upComptNum("add");
          }
        }
      }
    },
    openSearch() {
      //yxq
      this.dialogVisible = true;
    },
    upBlock(index) {
      for (var i = 0; i < this.s_edcuiCompts.length; i++) {
        this.querygrid[i] = false;
        if (index == i) {
          this.querygrid[i] = true;
        }
      }
      this.upActivedId(index);
    },
    ...mapMutations({
      upComptNum: "compt/upComptNum",
      upActivedId: "compt/upActivedId",
      getEdcuiCompts: "compt/getEdcuiCompts",
      setSedcuiCompts: "compt/setSedcuiCompts",
      upLoaderSign: "QueryTable/upLoaderSign",
      setQueryType: "QueryTable/setQueryType",
      setTreeList: "HomeTree/setTreeList",
      setQueryTaskDialog: "compt/setQueryTaskDialog"
    }),
    ...mapActions({
      upComptNum: "compt/upComptNum",
      upActivedId: "compt/upActivedId",
      getEdcuiCompts: "compt/getEdcuiCompts",
      queryPageCompts: "compt/queryPageCompts",
      savePageAndDetail: "HomeBody/savePageAndDetail",
      updatePageAndDetail: "HomeBody/updatePageAndDetail",
      upLoaderSign: "QueryTable/upLoaderSign",
      queryAfPropertyData: "QueryTable/queryAfPropertyData",
      setQueryHistory: "compt/setQueryHistory",
      addOptlog: "compt/addOptlog",
      setPageCache: "HomeBody/setPageCache",
      saveAsPage: "HomeBody/saveAsPage",
      upIsTotal: "QueryTable/upIsTotal",
      queryTreeData: "HomeTree/queryTreeData", //获取树最新数据
      queryTableData: "ReportIndex/queryTableData",
      storeVuexStore: "storeVuexStore",
    })
  },
  computed: {
    queryTaskDialog: {
      get() {
        return this.$store.state.compt.queryTaskDialog;
      },
      set(value) {
        this.setQueryTaskDialog(value);
      }
    },
    queryHisDialog: {
      get() {
        return this.$store.state.compt.QueryHistory;
      },
      set(value) {
        this.setQueryHistory(value);
      }
    },
    isQuery() {
      var result = false;
      if (this.designType == 1) {
        // 即席查询
        result = true;
      }
      return result;
    },
    ...mapState({
      edcuiCompts: state => state.compt.edcuiCompts,
      s_edcuiCompts: state => state.compt.s_edcuiCompts,
      comptNum: state => state.compt.comptNum,
      designType: state => state.compt.designType,
      fieldList: state => state.compt.fieldList, //yxq
      pageCache: state => state.HomeBody.pageCache,
      loading: state => state.compt.loading,
      treeData: state => state.HomeTree.treeData,
      loaderSign: state => state.QueryTable.loaderSign,
      dimList: state => state.QueryTable.dimList,
      msuList: state => state.QueryTable.msuList,
      menuClassTypeId: state => state.HomeTree.menuClassTypeId,
      queryType: state => state.QueryTable.queryType
    }),
    ...mapGetters({
      activedCompt: "compt/getActivedCompt",
      layout: "compt/getLayout",
      resultCols: "QueryTable/resultCols",
      tableColumn: "QueryTable/tableColumn"
    })
  },
  mounted() {
    this.$Watermark.set("water-wrap", 60, 20, -40, 0);
    let pc = sessionStorage.getItem('pageCache');
    let pageInfo = JSON.parse(pc);
    this.setPageCache(pageInfo);
    document.title = this.pageCache.pageName || "新增即席查询";
    // window.sessionStorage.removeItem("pageCache");
    if (this.pageCache == null) {
      this.$router.push({
        path: "/",
        name: ""
      });
    }
    // 读取组件属性配置
    this.getEdcuiCompts();

    if (this.designType == 0) {
      // 监听窗口resize
      this.setScale();
      window.onresize = () => {
        this.setScale();
      };
    }
  },
  activated() {
    this.dimList.splice(0, this.dimList.length);
    this.msuList.splice(0, this.msuList.length);
    this.upLoaderSign(false);
    this.toSaveInput = false;
    if (this.pageCache && this.pageCache.pageName != null) {
      this.pageName = this.pageCache.pageName;
    } else if (this.pageCache.operation != "wait") {
      this.pageName = "";
    }
    this.toLoad(); //页面进来就加载数据
  },
  watch: {
    "activedCompt.table_svc"() {
      let _cs = this.s_edcuiCompts.comptSort;
      this.comptSvc["svc" + _cs] = this.activedCompt.table_svc;
      var that = this;
      service({
        maskOff: true,
        url: this.activedCompt.table_svc,
        method: "get"
      })
        .then(function(response) {
          // that.activedCompt.tableattrs.data = response.data.respData.result_data_list
          var col_list = response.data.respData.result_col_list;
          var data_list = response.data.respData.result_data_list;
          var columns = that.activedCompt.columns;
          var table_data = [];
          for (var i = 0; i < data_list.length; i++) {
            let _data = {};
            for (var j = 0; j < col_list.length; j++) {
              columns[j].prop = col_list[j].col_id;
              columns[j].label = col_list[j].col_desc;
              _data["" + col_list[j].col_id] =
                data_list[i].data_list[j].data_val;
            }
            table_data.push(_data);
          }
          that.activedCompt.tableattrs.data = table_data;
          // that.activedCompt.columns = response.data.respData.result_col_list
        })
        .catch(function(error) {});
    }
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
      /deep/ .el-scrollbar__wrap {
        overflow-x: hidden;
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

.header-compts {
  transform: translate(-20%, -20%) scale(0.6);
}

.header-compts > div {
  display: block;
  // float: left;
  width: 200px;
  height: 120px;
  border: 1px dashed red;
  overflow: hidden;
  margin-left: 65px;
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

.designCompt.active {
  border: 1px dashed green;

  .opt-btn {
    display: inline-block;
  }
}

// 流动拖拽块样式
.vue-grid-item {
  border: 1px dashed $border1;
  // overflow: auto
  &.active {
    border: 1px dashed $main-color;
  }
}

.draggable {
  padding: 5px;
  border: 1px dashed green;
}

.active.draggable {
  border: 1px dashed red;
}

.is-vertical > .el-main {
  padding: 0;
}

.is-vertical > .el-container {
  height: calc(100% - 50px);
}

.query-layout {
  padding: 20px;

  .query-grid.actived {
    border-color: #409eff;
  }
}

.query-grid {
  border: 1px dashed #afc0d0;
}

.query-grid:hover {
  box-shadow: 0 0 3px 3px rgba(204, 204, 204, 0.7);
}

.query-grid:first-child {
  position: relative;
  min-height: 70px;

  /deep/ .el-form-item__content div {
    z-index: 100;
  }

  /deep/ .el-button {
    z-index: 100;
  }

  /deep/ .el-form-item__content {
    /deep/ .el-cascader {
      width: 140px;

      & > div {
        background-color: #fff;
      }
    }
  }
}

.query-grid:last-child {
  height: 465px;
  margin-top: 20px;
}

// 弹框标题头字体
.dialog-title {
  & > span {
    line-height: 24px;
    font-size: 18px;
    color: #303133;
  }
}

.query-grid > .jixi {
  padding-right: 50px;
}

.queryHis /deep/ .el-dialog__body {
  padding: 0px 20px 20px 20px !important;
}
</style>
<style>
/* 即席设计 查询条件区域 级联下拉框 面板宽度调整 */
.cascader-drop-wrap.el-popper .el-cascader-menu {
  min-width: 178px;
}
</style>
