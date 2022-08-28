<template>
  <el-container>
    <el-header height="100px" style="padding: 0; overflow: hidden;">
      <van-search
        v-model="inputValue"
        placeholder="请输入搜索关键词"
        @search="queryData"
        @clear="queryData"
      />
      <van-tabs v-model="active" @click="queryData">
        <van-tab
          v-for="tabItem in tabList"
          :key="tabItem.catalogId"
          :name="tabItem.catalogId"
          :title="tabItem.tabTitle"
        ></van-tab>
      </van-tabs>
    </el-header>
    <el-main :style="{
      height: isHomeNavShow ? 'calc(100% - 150px)':'calc(100% - 100px)',
      padding: 0
    }">
      <van-list v-model="loading" :finished="finished" finished-text="没有更多了" @load="onLoad" :immediate-check="false">
        <van-swipe-cell v-for="(item, index) in lists" :key="index">
          <van-cell center :title="`${ item.privName || item.pageName }`" :icon-prefix="'icon'" icon="A10095_detail" @click="goPage(item)">
            <template #right-icon>
              <div class="meta-wrap">
                  <div>{{ (item[updateTimeName] || '').substring(0, 10) }}</div>
                  <div>{{ `${item.createUserName}${ item.statusName ? ` ${item.statusName}` : ''}` }}</div>
                </div>
            </template>
          </van-cell>
          <template #right>
            <van-button
              square
              :text="item.isCollect === '1'?'取消收藏':'收藏'"
              type="warning"
              class="collect-button"
              v-if="isCollectEnable(item)"
              @click="collectRow(item, index)"
            />
            <van-button
              square
              text="删除"
              type="danger"
              class="delete-button"
              v-if="menuName!=='收藏'"
              :disabled="!isDeleteEnable(item)"
              @click="deleteRow(item)"
            />
          </template>
        </van-swipe-cell>
      </van-list>
    </el-main>
    <el-footer height="50px" v-if="isHomeNavShow">
      <Footer :key="$route.fullPath" />
    </el-footer>
  </el-container>
</template>

<script>
import { mapActions, mapState, mapMutations } from "vuex";
import { Toast, Dialog } from 'vant';
import Footer from './Footer'
export default {
  components: {
    Footer
  },
  computed: {
    ...mapState({
      menuName: state => state.HomeTree.menuName,
      executePriv: state => state.commonProperties.executePriv, //可执行权限
      tenantId: state => state.HomeBody.tenantId,
      mobileLinkPages: state => state.PageDesign.mobileLinkPages
    }),
    tabList() {
      if (["/AnalysisIndex", "/PortalIndex"].includes(this.curRouteFullPath)) {
        return [
          {
            tabTitle: "我的文件夹",
            catalogId: "myfold"
          },
          {
            tabTitle: "工作组文件夹",
            catalogId: "workfold"
          }
        ];
      } else {
        return [
          // {
          //   tabTitle: "数据门户",
          //   catalogId: "Portal"
          // },
          {
            tabTitle: "分析报告",
            catalogId: "Analysis"
          }
        ];
      }
    },
    // 删除、查询、收藏方法中间英文名
    methodEnName() {
      return this.curRouteFullPath.replace('Index', '').substring(1);
    },
    curRouteFullPath() {
      return this.$route.fullPath;
    },
    // 手机门户页面预览不要底部的菜单栏
    isHomeNavShow() {
      return this.curRouteFullPath.indexOf('PortalPreview') === -1;
    },
    // 分析报告用的updateTime，数据门户展示的是modifyTime
    updateTimeName() {
      if (this.menuName === '分析报告' || this.active === 'Analysis') {
        return 'updateTime';
      } else {
        return 'modifyTime'
      }
    }
  },
  data() {
    return {
      inputValue: "",
      active: "myfold",
      lists: [],
      loading: false,
      finished: false,
      listTotal: 0, // 每个tab的
      start: 1
    };
  },
  created() {
    this.active = this.tabList[0].catalogId;
  },
  activated() {
    this.queryData();
  },
  methods: {
    ...mapActions({
      queryPortalData: "DataPortal/queryTableData",
      queryAnalysisData: "HomeBody/queryTableData",
      addCollect: "compt/addCollect",
      delCollect: "compt/delCollect",
      deleteAnalysisInfo: "HomeBody/deletePageInfo", // 删除分析报告
      deletePortalInfo: "DataPortal/deletePortal",
      setAnalysisPageCache: "HomeBody/setPageCache"   
    }),
    ...mapMutations({
      setPortalPageCache: "DataPortal/setPageCache"
    }),
    queryData() {
      this.listTotal = 0;
      this.finished = false;
      this.loading = true;
      this.lists = [];
      this.start = 1;
      this.onLoad();
    },
    formatQueryParam() {
      let param = {};
      const searchText1 = (this.inputValue || "").trim();
      let querMethod = `query${this.methodEnName}Data`;
      const tenantId = window.sessionStorage.getItem("tenant_id");
      const userId = sessionStorage.getItem("user_id");
      if (this.curRouteFullPath === "/AnalysisIndex") {
        param = {
          pageName: searchText1,
          status: "",
          isNeedDemo: "0",
          start: this.start,
          pageCount: 10,
          catalogId: this.active,
          createUser: userId,
          classTypeId: "1001002",
          workFlag: this.active === 'workfold'? '1' : '0',
          isTopPage: "1",
          tenantId
        };
      } else if (this.curRouteFullPath === "/PortalIndex") {
        // 数据门户
        param = {
          privName: searchText1,
          portalType: "2",
          startPage: this.start,
          pageSize: 10
        };
        if (this.active === 'workfold') {
          param['tenantId'] = tenantId; // 工作组文件夹多传一个租户
        }
      } else { // 收藏
      // 目前只有分析报告的收藏tab
        param = {
            pageName: searchText1,
            status: "",
            isNeedDemo: "0",
            start: this.start,
            pageCount: 10,
            catalogId: 'mycollect',
            createUser: userId,
            classTypeId: "1001002",
            workFlag: "3",
            isTopPage: "1",
            tenantId
          };
          querMethod = 'queryAnalysisData';
        //
        // if (this.active === 'Analysis') { // 查询分析报告的收藏列表
        //   param = {
        //     pageName: searchText1,
        //     status: "",
        //     isNeedDemo: "0",
        //     start: this.start,
        //     pageCount: 10,
        //     catalogId: 'mycollect',
        //     createUser: userId,
        //     classTypeId: "1001002",
        //     workFlag: "3",
        //     isTopPage: "1",
        //     tenantId
        //   };
        //   querMethod = 'queryAnalysisData';
        // } else { // 查询数据门户
        //   querMethod = '';
        // }
      }
      return {
        param,
        querMethod
      };
    },
    async onLoad() {
      const { param, querMethod } = this.formatQueryParam();
      if (this[querMethod] === undefined || this.finished) {
        this.loading = false;
        return;
      }
      // 异步更新数据
      const response = await this[querMethod](param);
      if (response.status === 200 && response.data.respResult === "1") {
        this.listTotal = response.data.dataTotalCount || 0;
        const list = response.data.respData || [];
        this.lists = this.lists.concat(list);
        if (this.lists.length >= this.listTotal) {
          this.finished = true;
        } else {
          this.start += 1;
          this.finished = false;
        }
        this.loading = false;
      }
    },
    deleteRow(data) {
      if (data.status === "1") {
        Toast("不能删除已发布的页面");
        return;
      }
      Dialog.confirm({
        title: "提示",
        message: "确认要删除所选项吗？"
      })
        .then(() => {
          // on confirm
          this.doDelete(data);
        })
        .catch(() => {
          // on cancel
        });
    },
    async doDelete(row) {
      const methodName = `delete${this.methodEnName}Info`;
      if (this[methodName] === undefined) {
        return;
      }
      let param = [row.pageId];
      if (this.curRouteFullPath === "/PortalIndex") {
        param = row.portalId;
      }
      const response = await this[methodName](param);
      if (response && response.data && response.data.respResult === "1") {
        Toast.success("页面删除成功");
        this.queryData();
      } else {
        Toast.fail("页面删除失败");
      }
    },
    isDeleteEnable(row) {
      // 收藏页面不能删除
      if (this.curRouteFullPath === "/CollectIndex") {
        return false;
      }
      const executePriv = this.executePriv + "";
      const arr1 = ["workfold", "recentbrowse", "mycollect"];
      return (
        (row.isDemo !== "1" &&
          !arr1.includes(this.active) &&
          executePriv !== "0") ||
        (arr1.includes(this.active) &&
          executePriv !== "0" &&
          this.tenantId == row.tenantId)
      );
    },
    isCollectEnable(row) {
      // 数据门户、收藏页面不能收藏
      if ("数据门户" === this.menuName) {
        return false;
      }
      return row.isDemo !== "1" && this.executePriv != "0";
    },
    async collectRow(row, index) {
      let method = this.addCollect;
      let executeTitle = "收藏";
      let param = {
        objId: row.pageId,
        userId: window.sessionStorage.getItem("user_id"),
        favoriteObj: "1001" // 分析报告classtypeid
      };
      if (Number(row.isCollect) === 1) {
        method = this.delCollect;
        param.objIds = [row.pageId];
        executeTitle = "取消收藏";
      }
      const response = await method(param);
      if (response && response.data && response.data.respResult === "1") {
        Toast.success(`页面${executeTitle}成功`);
        this.queryData();
      } else {
        Toast.fail(`页面${executeTitle}失败`);
      }
    },
    goPage(item) {
      let prefixRouteName = '';
      let prevRoute = this.curRouteFullPath;
      if (['Portal', 'Analysis'].includes(this.methodEnName)) {
        prefixRouteName = this.methodEnName;
      } else {
        prefixRouteName = this.active;
      }
      const data = {
            ...item,
            ...{
              operation: "preview",
              prevRoute
            }
          };
          sessionStorage.setItem('pageCache', JSON.stringify(data));
          this[`set${prefixRouteName}PageCache`](data);      
          const routeNameMap = {
            AnalysisPreview: 'AnalysisPreview',
            PortalPreview: 'portalView'
          };
          // 设计页名称路由要与原来一样，不然识别不到
          const routeName = routeNameMap[`${prefixRouteName}Preview`];
          // 页面跳转预览页面之前，把mobileLinkPages清空
          this.mobileLinkPages.splice(0, this.mobileLinkPages.length);
          this.$router.push({ name: routeName, path: routeName });
    }
  }
};
</script>

<style scoped lang="scss">
/deep/ .van-tabs--line .van-tabs__wrap {
  border-bottom: 1px solid #dcdfe6;
}
/deep/ .van-tabs__line {
  background-color: #409eff;
}
/deep/ .van-swipe-cell {
  &::after {
        position: absolute;
        display: block;
        content: "";
        left: 30px;
        bottom: 0;
        right: 0;
        border-bottom: 1px solid #dcdfe6;
  }
  .van-cell::after {
    border-bottom: none;
  }
  .van-swipe-cell__wrapper {
    height: 58px;
    & > div {
      height: 100%;
    }
  }
  .van-cell--center {
    padding: 0;
  }
  .van-swipe-cell__right > button {
    height: 100%;
  }
  .meta-wrap {
    text-align: right;
    color: #c0c4cc;
  }
  .van-cell__left-icon {
    font-size: 20px;
    color: #409eff;
    margin-right: 10px;
  }
  .van-cell__title {
    max-width: calc(100% - 105px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

  }
}

/deep/ .van-list {
  padding: 0 15px 0 16px;
}
</style>
