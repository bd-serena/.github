<template>
  <el-container>
    <el-header>
      <div class="head-logo">
        <span class="icon-A10244_newlangLogo"></span>
      </div>
      <div class="head-menu">
        <div
          v-for="(menu, index) in menus"
          :key="index"
          :class="[{actived : active == menu.menuName}, 'menu-block']"
          @click="selected(menu.menuName)"
        >
          <span :class="[menu.description, 'menu-block-icon']"></span>
          <span class="menu-block-tit">{{menu.menuName}}</span>
        </div>
        <!-- <div class="menu-block actived">
          <span class="icon-A10600_Function menu-block-icon"></span>
          <span class="menu-block-tit">即席查询</span>
        </div>
        <div class="menu-block">
          <span class="icon-A10597_DataIndex menu-block-icon"></span>
          <span class="menu-block-tit">报表定制</span>
        </div>
        <div class="menu-block">
          <span class="icon-A10582_Template menu-block-icon"></span>
          <span class="menu-block-tit">内容定制</span>
        </div>
        <div class="menu-block">
          <span class="icon-A10540_quotaAnalysisTool menu-block-icon"></span>
          <span class="menu-block-tit">数据集管理</span>
        </div>-->
      </div>
      <div class="head-right">
        <p>
          你好！
          <span>张三</span>
        </p>
        <span class="icon-A10108_quit"></span>
      </div>
    </el-header>
    <el-container>
      <el-aside width="200px">
        <HomeTree></HomeTree>
      </el-aside>
      <el-main>
        <HomeBody></HomeBody>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import HomeTree from "../components/home/HomeTree";
import HomeBody from "../components/home/HomeBody";
import { mapState, mapGetters, mapMutations, mapActions } from "vuex";
import { service } from 'ngbd-utils'

export default {
  components: {
    HomeTree,
    HomeBody
  },
  data() {
    return {
      menus: [],
      active: "即席查询"
    };
  },
  methods: {
    getData() {
      service({
        maskOff: true,
        url: this.renderEngine + "/frame/qryMenuTree",
        data: {},
        method: 'post'
      }).then(response => {
          if (response.data.respResult == "0") {
            this.$message.error(response.data.respErrorDesc);
          } else {
            this.menus = response.data.respData;
          }
        })
        .catch(error => {});
    },
    selected(menuName) {
      this.active = menuName;
    }
  },
  mounted() {
    this.getData();
  },
  computed: {
    ...mapState({
      renderEngine: state => state.renderEngine
    })
  }
};
</script>

<style lang="scss" scoped>
.el-header {
  & > div {
    display: inline-block;
    color: #fff;
    font-size: 12px;
    height: 60px;
  }
  .head-logo {
    float: left;
    margin-left: 35px;
    span {
      font-size: 100px;
      display: inline-block;
      position: relative;
      top: -20px;
    }
  }
  .head-right {
    float: right;
    p {
      display: inline-block;
      margin-right: 35px;
    }
  }
  .head-menu {
    float: left;
    margin-left: 70px;
    .menu-block {
      display: inline-block;
      width: 76px;
      cursor: pointer;
      height: 60px;
      span {
        float: left;
        width: 100%;
      }
      .menu-block-icon {
        font-size: 25px;
        margin-top: 10px;
      }
      .menu-block-tit {
        font-size: 12px;
        line-height: 20px;
      }
      &:hover {
        background: #409eff;
      }
    }
    .menu-block.actived {
      background: #409eff;
    }
  }
}
.el-aside {
  padding: 0 20px;
}

// 内容布局

.el-header {
  background-color: #0a2b4c;
  color: #333;
  text-align: center;
  line-height: 60px;
}

.el-aside {
  background-color: #d3d8e4;
  color: #333;
}

.el-main {
  background-color: #e4e7ee;
  color: #333;
  overflow: hidden;
}
</style>


