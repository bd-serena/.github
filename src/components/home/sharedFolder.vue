<template>
  <div class="main-content" v-loading="exportLoading">
    <div class="main-content-form">
      <SimpleCondi
        :data="condiSettingsData"
        @condiSubmit="search(true)"
      ></SimpleCondi>
    </div>
    <div class="main-content-table" :style="computedStyle('table')">
      <GeminiScrollbar class="my-scroll-bar">
        <el-table
          v-loading="loading"
          border
          :data="tableData"
          height="100%"
          style="width: 100%"
          @select="selectTable"
          @select-all="selectTable"
          size="mini"
        >
          <el-table-column
            type="selection"
            width="55"
            :selectable="unSelectDemo"
          ></el-table-column>
          <el-table-column
            prop="objName"
            label="中文名称"
            :show-overflow-tooltip="true"
          ></el-table-column>
          <el-table-column
            prop="createUserName"
            label="共享者"
            :show-overflow-tooltip="true"
          ></el-table-column>
          <el-table-column
            prop="createTime"
            label="共享时间"
            :show-overflow-tooltip="true"
          ></el-table-column>
          <el-table-column label="操作" width="250">
            <template slot-scope="scope">
              <el-tooltip
                class="item"
                effect="dark"
                content="预览"
                placement="top-start"
              >
                <span
                  class="icon-A10181_browseCount table-icon"
                  @click="toPrew(scope.row)"
                ></span>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </GeminiScrollbar>
    </div>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from "vuex";
import condiMixins from "../../utils/condiMixins.js";

export default {
  mixins: [condiMixins],
  data() {
    return {
      loading: true,
      pageQuery: {
        start: 1,
        pageCount: 10,
      },
      pageList: [],
      condiSettingsData: [
        {
          name: "名称",
          formSymbol: "pageName",
          type: "input",
          vModelValue: "",
          selectOptions: [],
        },
        {
          name: "共享时间",
          formSymbol: "updateTime",
          type: "date-picker",
          vModelValue: "",
          pickerOptions: {
            shortcuts: [
              {
                text: "最近一周",
                onClick(picker) {
                  const end = new Date();
                  const start = new Date();
                  start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                  picker.$emit("pick", [start, end]);
                },
              },
              {
                text: "最近一个月",
                onClick(picker) {
                  const end = new Date();
                  const start = new Date();
                  start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                  picker.$emit("pick", [start, end]);
                },
              },
              {
                text: "最近三个月",
                onClick(picker) {
                  const end = new Date();
                  const start = new Date();
                  start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                  picker.$emit("pick", [start, end]);
                },
              },
            ],
          },
        },
      ],
      exportLoading: false,
    };
  },
  computed: {
    ...mapState({
      tableData: (state) => state.HomeBody.tableData.list, //从homebody.js出获取数据
      total: (state) => state.HomeBody.tableData.total,
      catalogId: (state) => state.HomeBody.catalogId,
      classtypeId: (state) => state.HomeBody.classtypeId,
      tenantId: (state) => state.HomeBody.tenantId,
      catalogLevel: (state) => state.HomeBody.catalogLevel,
      treeData: (state) => state.HomeTree.treeData,
      contextUrl: (state) => state.contextUrl,
      myFolder: (state) => state.commonProperties.myFolder, //我的文件夹权限
      importPriv: (state) => state.commonProperties.importPriv, //导入权限
      executePriv: (state) => state.commonProperties.executePriv, //可执行权限
      fjbassPublish: (state) => state.commonProperties.fjbassPublish, //福建经分发布按钮是否启用（1：启用 0：不启用）
      pageCache: (state) => state.HomeBody.pageCache,
      menuClassTypeId: (state) => state.HomeTree.menuClassTypeId,
    }),
  },
  watch: {
    //节点改变分页初始化值也改变
    catalogId() {
      //目录变化--监听
      this.resetSearchCondi();
      this.search();
    },
    tenantId() {
      this.resetSearchCondi();
      this.search();
    },
    menuClassTypeId(val) {
      //头部菜单切换时候重新查询
      this.resetSearchCondi();
      if (val !== "drive") {
        this.search();
      }
    },
  },
  methods: {
    selectTable(select) {
      this.pageList = select;
    },
    search(isNeedResetStart = false) {
      this.pageList = [];
      if (isNeedResetStart) {
        //如果是点查询按钮，应该从第一页开始查
        this.pageQuery.start = 1;
      }
      this.loading = true;
      if (this.searchForm.updateTime == null) {
        this.searchForm.updateTime = "";
      }
      var startTime = (this.searchForm.updateTime[0] || "").replace(/\s*/g, "");
      var endTime = (this.searchForm.updateTime[1] || "").replace(/\s*/g, "");
      // 案例展示
      let commonParam = { startTime, endTime };
      let param = Object.assign(commonParam, {
        startPage: this.pageQuery.start,
        pageCount: this.pageQuery.pageCount,
        objName: this.searchForm.pageName,
        objType: this.menuClassTypeId
      });
      this.queryShareList(param)
        .then((val) => {
          if (val.status === 200 && val.data.respResult === "1") {
            var total = val.data.dataTotalCount;
            var list = val.data.respData;
            this.$store.commit("HomeBody/setTableData", { total, list });
          } else {
            this.$message.error("页面查询失败");
            console.error(val);
          }
          this.loading = false;
        })
        .catch((err) => {
          this.loading = false;
        });
    },
    toPrew(data) {
      data.operation = "preview";
      data = Object.assign(data, {
          pageId: data.objId,
          pageName: data.objName,
          classTypeId: data.objType
        })
      //共享预览，暂时统一预览草稿态
      this.setPageCache(data);
      sessionStorage.setItem("pageCache", JSON.stringify(this.pageCache));
      let routeData = {};
      if (this.menuClassTypeId == "1002") {
        routeData = this.$router.resolve({ name: "preview" }); //query: { timestamp: getTimestamp }
      } else if (this.menuClassTypeId == "1003") {
        //报表工具
        routeData = this.$router.resolve({ name: "reportView" }); //query: { timestamp: getTimestamp }
      } else if (['1001001','1001002','1005'].includes(data.classTypeId)) {
        //数据大屏
        routeData = this.$router.resolve({ name: "pageView" });
      }
      if (!!window.ActiveXObject || "ActiveXObject" in window) {
        this.storeVuexStore();
        window.open(routeData.href, "_blank");
      } else {
        this.storeVuexStore().then((val) => {
          window.open(routeData.href, "_blank");
        });
      }
    },
    ...mapMutations({
      setTableData: "HomeBody/setTableData",
    }),
    ...mapActions({
      queryShareList: "HomeBody/queryShareList",
      setPageCache: "HomeBody/setPageCache",
      storeVuexStore: "storeVuexStore",
      queryPageSettingList: "PageDesign/queryPageSettingList",
    }),
  },
  mounted() {
    this.search();
  },
  activated() {},
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

  /deep/ .device-dialog {
    top: 50%;
    margin: 0 auto;
    background-color: #fff;

    .device-wrap {
      background-repeat: no-repeat;
      background-position: 35px 10px;
    }
  }

  // 弹框标题头字体
  .dialog-title {
    & > span {
      line-height: 24px;
      font-size: 18px;
      color: #303133;
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

    .device-icon {
      float: left;
      color: #409eff;
      font-size: 14px;
      margin-top: 20px;
      cursor: pointer;

      &:hover {
        color: #66b1ff;
      }
    }
  }

  /deep/ .gm-scrollbar .thumb {
    background-color: #d3d8e4;
  }
}

// .el-form--inline {
//   .el-form-item {
//     margin-right: 70px;

//     &:last-child {
//       margin-left: -10px;
//       margin-top: -1px;
//       margin-right: 0;
//     }
//   }
// }

.main-content-tool {
  position: absolute;
  top: 75px;
  right: 20px;
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
  padding-top: 13px;
  padding-bottom: 10px;
}

/deep/ .el-form-item {
  margin-bottom: 14px;
}

@media screen and (max-width: 1460px) {
  .el-form--inline {
    .el-form-item {
      margin-right: 20px;
    }
  }
}

.device-wrap {
  width: 100%;
  height: 200px;
  text-align: center;

  .device-item {
    display: inline-block;
    padding: 45px 59px;
    cursor: pointer;

    .device-icon {
      font-size: 60px;
      color: #afc0d0;

      &.actived {
        color: #409eff;
      }

      &:hover {
        color: #409eff;
      }
    }

    .device-shadow {
      display: block;
      width: 40px;
      height: 10px;
      border-radius: 50%;
      background: #c0c4cc;
      margin: 10px 0 0 10px;
      margin: 10px 0 0 10px;
      -webkit-box-shadow: #b7bdca 0px 0px 4px 3px;
    }
  }
}

.cn-name {
  // float: left;
  // width: 75%;
  margin-left: 30px;

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
}

.pageName {
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
</style>
