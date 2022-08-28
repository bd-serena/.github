<template>
  <div style="width:100%;height:100%;">
    <PCLayout :layoutType="layoutType" v-if="portal.portalType === '1'">
      <template v-slot:header>
        <div class="logo-cont">
          <img src="favicon.ico" alt="" />
          <div class="title-cont">
            <p class="portal-title" :title="portal.portalName">{{ portal.portalName }}</p>
            <p class="portal-subtitle" v-show="portal.showSubtitle==='1'" :title="portal.subtitle">{{ portal.subtitle }}</p>
          </div>
        </div>
      </template>
      <template v-slot:main>
        <ProtalView ref="view"></ProtalView>
      </template>
      <template v-slot:left>
        <div class="left-menu" :key="treeKey">
          <el-scrollbar style="height: 100%" class="ht-overflow">
            <!-- <el-tree
              ref="tree"
              :data="portal.portalPrivList"
              :expand-on-click-node="false"
              :default-expanded-keys="expendIds"
              node-key="privId"
              :props="defaultProps"
              @node-click="handleNodeClick"
            >
              <span class="tree-tit ellipsis" slot-scope="{ node, data }">
                <span :title="node.label">{{ node.label }}</span>
              </span>
            </el-tree> -->
             <el-menu
              :default-active="activeIndex"
              class="header-menu"
              mode="vertical"
              ref="leftMenu"
              @select="handleSelect"
            >
              <navigation-item
                v-for="menu in portal.portalPrivList"
                :key="menu.privId"
                :item="menu"
                layout="vertical"
              />
            </el-menu>
            <!-- <el-menu
              default-active="2"
              class="el-menu-vertical-demo"
            >
              <el-submenu index="1">
                <template slot="title">
                  <i class="el-icon-location"></i>
                  <span>导航一</span>
                </template>
                <el-menu-item-group>
                  <template slot="title">分组一</template>
                  <el-menu-item index="1-1">选项1</el-menu-item>
                  <el-menu-item index="1-2">选项2</el-menu-item>
                </el-menu-item-group>
                <el-menu-item-group title="分组2">
                  <el-menu-item index="1-3">选项3</el-menu-item>
                </el-menu-item-group>
                <el-submenu index="1-4">
                  <template slot="title">选项4</template>
                  <el-submenu index="1-4">
                  <template slot="title">选项4</template>
                  <el-menu-item index="1-4-1">选项1你好我好大家好</el-menu-item>
                </el-submenu>
                </el-submenu>
              </el-submenu>
              <el-menu-item index="2">
                <i class="el-icon-menu"></i>
                <span slot="title">导航二</span>
              </el-menu-item>
              <el-menu-item index="3" disabled>
                <i class="el-icon-document"></i>
                <span slot="title">导航三</span>
              </el-menu-item>
              <el-menu-item index="4">
                <i class="el-icon-setting"></i>
                <span slot="title">导航四</span>
              </el-menu-item>
            </el-menu> -->
          </el-scrollbar>
        </div>
      </template>
      <template v-slot:menu>
        <el-menu
          :default-active="activeIndex"
          class="header-menu"
          mode="horizontal"
          @select="handleSelect"
        >
          <navigation-item
            v-for="menu in portal.portalPrivList"
            :key="menu.privId"
            :item="menu"
          />
        </el-menu>
      </template>
      <template v-slot:menu2>
        <el-menu class="header-menu" mode="horizontal" @select="firSelect">
          <el-menu-item v-for="item of portal.portalPrivList" :key="item.privId" :index="item.privId">{{item.privName}}</el-menu-item>
        </el-menu>
      </template>
      <template v-slot:left2>
        <div class="left-menu" :key="treeKey">
          <el-scrollbar style="height: 100%" class="ht-overflow">
             <el-menu
              class="header-menu"
              mode="vertical"
              @select="handleSelect"
            >
              <navigation-item
                v-for="menu in secMenus"
                :key="menu.privId"
                :item="menu"
                layout="vertical"
              />
            </el-menu>
          </el-scrollbar>
        </div>
      </template>
    </PCLayout>
    <MBLayout v-if="portal.portalType === '2'"></MBLayout>
  </div>
</template>
<script>
import PCLayout from "../components/design/PCLayout";
import MBLayout from "../components/design/MBLayout";
import ProtalView from "../components/design/PortalView";
import navigationItem from "../components/design/NavigationItem";
import { mapState, mapActions, mapMutations } from "vuex";
import PortalMixin from '../components/template/mixins/PortalMixin'
import getUUID from "../utils/UUID";
export default {
  components: {
    PCLayout,
    ProtalView,
    navigationItem,
    MBLayout
  },
  mixins: [PortalMixin],
  data() {
    return {
      defaultProps: {
        children: "children",
        label: "privName",
      },
      activeIndex: "",
      activeMenu: {},
      portalTemp : {
        privName:'',
        portalName:'',
        portalAlias: '',
        subtitle: '',
        layoutType: '2',
        themeType: '2',
        footer: '',
        showSubtitle: '1',
        showFooter: '0',
        portalPrivList: [
          {
            isHome: "0",
            privName: '新增菜单',
            privId: getUUID(),
            parentId: '0'
          }
        ]
      },
      homePage: {},
      secMenus:[]
    };
  },
  methods: {
    ...mapActions({
      queryPortalDetail: "DataPortal/queryPortalDetail",
    }),
    ...mapMutations({
      setPortal: "DataPortal/setPortal",
      setExpendIds: "DataPortal/setExpendIds",
      setHomePage: "DataPortal/setHomePage"
    }),
    handleNodeClick(data) {
      this.$refs.view.openPage(data);
    },
    handleSelect(key, keyPath) {
      this.getMenuById(key);
      this.$refs.view.openPage(this.activeMenu);
    },
    openMenu() {
      setTimeout(() => {
        this.expendIds.forEach(val=>{
          this.$refs.leftMenu.open(val);
        })
      }, 100);
    },
    firSelect(key) {
      let menus = [];
      this.secMenus = [];
      for(let i=0;i<this.portal.portalPrivList.length;i++) {
        let item = this.portal.portalPrivList[i];
        if(item.privId === key) {
          menus = item.children || [];
          break;
        }
      }
      this.secMenus = menus;
    },
    getSubTree(list, id) {
      for (let i = 0; i < list.length; i++) {
        let priv = list[i];
        if (id === priv.privId) {
          this.activeMenu = priv;
          break;
        } else if (priv.children && priv.children.length > 0) {
          this.getSubTree(priv.children, id);
        }
      }
    },
    getMenuById(id) {
      for (let i = 0; i < this.portal.portalPrivList.length; i++) {
        let priv = this.portal.portalPrivList[i];
        if (id === priv.privId) {
          this.activeMenu = priv;
          break;
        } else if (priv.children && priv.children.length > 0) {
          this.getSubTree(priv.children, id);
        }
      }
    },
    travelTree(list, ids) {
      list.forEach(val=>{
        if(val.isFolder === '1') {
          ids.push(val.privId);
        }
        if(val.isHome === '1') {
          this.homePage = val;
        }
        if(val.children) {
          this.travelTree(val.children, ids);
        }
      })
    },
    getTreeIds(menuList) {
      let expendIds = [];
      this.homePage = {};
      menuList.forEach(val=>{
        if(val.isFolder === '1') {
          expendIds.push(val.privId);
        }
        if(val.isHome === '1') {
          this.homePage = val;
        }
        if(val.children) {
          this.travelTree(val.children, expendIds);
        }
      })
      return {expendIds};
    }
  },
  mounted() {},
  // created换成activated,每次页面重新activated,都要重新查下页面信息，不然没塞子页面信息，导致预览报错objid缺失
  activated() {
    let portalId = this.pageCache.portalId;
    let preview = this.pageCache.preview;
    if(!preview) {  //非预览
      if(portalId) {  //修改
        let param = {
          portalId
        }
        this.queryPortalDetail(param).then(resp => {
          if (resp.status == 200 && resp.data.respResult == "1") {
            let data = resp.data.respData;
            this.setPortal(data);
            let expendIds = this.getTreeIds(data.portalPrivList || []).expendIds;
            let homePage = this.homePage
            if(expendIds.length>0) {
              this.setExpendIds(expendIds);
              if(this.portal.portalType === '1' &&  this.portal.layoutType === '2') {  //左导航
                this.openMenu();
              }
            }
            if(homePage.privId) {
              this.setHomePage(homePage);
              this.activeIndex = homePage.privId;
              this.activeHomePage(homePage)
            }
          }
        }).catch(err => {})
      } else {  //新增
        this.portalTemp.portalType = this.pageCache.portalType;
        this.setPortal(this.portalTemp);
        this.$nextTick(()=>{  //默认选中第一个菜单
          let privId = this.portalTemp.portalPrivList[0].privId;
          let dom = document.querySelector(`div[data-trigger='${privId}']`);
          dom.click();
        })
      }
    } else {  //直接取预览数据
      let portal = this.pageCache;
      this.setPortal(portal);
      let expendIds = this.getTreeIds(portal.portalPrivList || []).expendIds;
      let homePage = this.homePage;
      if(expendIds.length>0) {
        this.setExpendIds(expendIds);
        if(this.portal.portalType === '1' && this.portal.layoutType === '2') {  //左导航
          this.openMenu();
        }
      }
      if(homePage.privId) {
        this.setHomePage(homePage);
        this.activeIndex = homePage.privId;
        this.activeHomePage(homePage);
      }
    }
  },
  computed: {
    ...mapState({
      layoutType: state => state.DataPortal.layoutType,
      portal: state => state.DataPortal.portal,
      expendIds: state => state.DataPortal.expendIds,
      treeKey: state => state.DataPortal.treeKey,
      pageCache: state => state.DataPortal.pageCache
    }),
  },
};
</script>

<style lang="scss" scoped>
/deep/.left-menu {
  height: 100%;
  padding: 10px;
  /* 菜单样式 */
  .header-menu {
    margin-left: -10px;
    width: 100%;
    .el-submenu__icon-arrow{
      right: -10px !important;
    }
  }
  .header-menu > div {
    width: 100%;
  }
  .el-menu {
    background-color: transparent;
    border-right: none;
  }
  .el-submenu__title {
    height: 34px;
    line-height: 34px;
    color:#afc0d0;
    &:hover, &:focus{
      background-color: transparent;
      color: #409eff;
    }
    i {
      color:#afc0d0;
      display: inline-block;
      vertical-align: middle;
      margin-right: 5px;
      width: 24px;
      text-align: center;
      font-size: 18px;
    }
  }
  .el-menu-item {
    height: 34px;
    line-height: 34px;
    color:#afc0d0;
    min-width: inherit;
    padding-right: 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    &:hover, &:focus{
      background-color: transparent;
      color: #409eff;
    }
    i {
      display: inline-block;
      color:#afc0d0;
      vertical-align: middle;
      margin-right: 5px;
      width: 24px;
      text-align: center;
      font-size: 18px;
    }
  }
}
/deep/.left-menu-tree {
  height: 100%;
  padding: 10px;
  .el-tree {
    background: transparent;
    height: 100%;
    overflow-y: hidden;
    overflow-x: hidden;
    color: #afc0d0;
  }
  .el-tree-node__content:hover {
    background-color: transparent;
    color: #409eff;
  }
  .el-tree-node:focus > .el-tree-node__content {
    background-color: transparent;
  }
  .el-tree-node__expand-icon {
    font-size: 14px;
    margin-left: -5px;
  }
  .el-tree-node__children .el-tree-node__children .is-leaf {
    color: transparent;
  }
  .el-tree-node__content {
    height: 31px;
  }
  .tree-item {
    width: 100%;
    height: 21px;
    position: relative;
    .tree-tit {
      position: absolute;
      left: 0;
      overflow: hidden;
      white-space: nowrap;
      right: 40px;
      input {
        width: 100%;
      }
    }
    .tree-tit.ellipsis {
      text-overflow: ellipsis;
    }
    &:hover {
      .tree-icon {
        display: block;
      }
    }
  }
  .tree-icon {
    display: none;
    font-size: 18px;
    position: absolute;
    z-index: 2;
    right: 0;
    height: 100%;
    .icon-A10278-Deleted {
      margin-left: 5px;
    }
  }
  .tree-icon:hover {
    display: block;
  }
  .el-tree-node.is-current > .el-tree-node__content .tree-tit {
    color: #409eff;
  }
}

/* 滚动条 */
/deep/ .el-scrollbar__wrap {
  overflow-x: hidden;
}
/deep/ .el-scrollbar__bar.is-horizontal {
  display: none;
}

.logo-cont {
  float: left;
  height: 100%;
  width: 143px;
  img {
    width: 25px;
    height: 25px;
    float: left;
    margin-top: 8px;
  }
  .title-cont {
    float: left;
    margin-left: 10px;
    color: #fff;
    width: calc(100% - 40px);
    .portal-title,.portal-subtitle {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .portal-title {
      position: relative;
      top: 2px;
    }
    .portal-subtitle {
      font-size: 12px;
      position: relative;
      bottom: 2px;
    }
  }
}

.ellipsis {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-menu {
  height: 100%;
  background: transparent;
  border-bottom: none;
  margin-left: 10px;
  float: left;
  & > div {
    float: left;
  }
  /deep/.el-menu-item {
    height: 100%;
    line-height: 38px;
    color: #afc0d0;
    border-bottom: none;
    &.is-active {
      color: #409eff;
      border-bottom: none;
    }
    &:hover,
    &:focus {
      background-color: transparent;
      color: #409eff;
    }
  }
  /deep/.el-submenu {
    height: 100%;
    line-height: 38px;
    .el-submenu__title {
      height: 100%;
      line-height: 38px;
      color: #afc0d0;
      &:hover,
      &:focus {
        background-color: transparent;
        color: #409eff;
      }
    }
    .el-submenu__icon-arrow {
      right: 5px;
    }
  }
}
</style>
