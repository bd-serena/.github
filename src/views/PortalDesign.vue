<template>
  <el-container>
    <el-header class="design-page">
      <div class="head-left">
        <el-input
          class="page-name"
          :class="{'page-input' : this.toSaveInput}"
          size="mini"
          maxlength="30"
          v-model="portal.privName"
          placeholder="请输入门户名称"
          ref="toSaveBtn"
        ></el-input>
      </div>

      <div class="head-opt-btn">
        <el-tooltip class="item" effect="dark" content="预览" placement="top-start">
          <i @click="toPreview" :class="{'icon-A10603_Overview':true}"></i>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="保存" placement="top-start">
          <i @click="savePortal" :class="{'icon-A10579_Preservation':true}"></i>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="另存" placement="top-start">
          <i @click="toSaveAs" :class="{'icon-A10545_PS':true}"></i>
        </el-tooltip>
      </div>
    </el-header>
    <el-container>
      <el-main style="position:relative" class="design-main" ref="designBody">
        <Portal></Portal>
      </el-main>
      <el-aside width="360px" style="background:#2f5377;">
        <PortalSetting></PortalSetting>
      </el-aside>
    </el-container>

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
          <el-input
            size="mini"
            value="我的文件夹"
            disabled
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
import Portal from "../views/Portal"
import PortalSetting from "../components/design/PortalSetting"

export default {
  components: {
   Portal,
   PortalSetting
  },
  data() {
    return {
      dialogSaveAs: false,
      toSaveInput: false,
      pageName: '',
      saveForm: {
        pageName: ""
      },
      rules: {
        pageName: [
          { required: true, message: "请输入名称", trigger: "blur" },
          { min: 1, max: 30, message: "长度在 1 到 30 个字符", trigger: "blur" }
        ]
      },
      homePage: {}
    };
  },
  methods: {
    ...mapActions({
      queryPortalDetail: "DataPortal/queryPortalDetail",
      addPortal: "DataPortal/addPortal",
      updatePortal: "DataPortal/updatePortal",
      storeVuexStore: "storeVuexStore"
    }),
    ...mapMutations({
      setPortal: "DataPortal/setPortal",
      setExpendIds: "DataPortal/setExpendIds",
      setPageCache: "DataPortal/setPageCache"
    }),
    savePortal() {
      let param = this.portal;
      if(param.portalType === '2') {  //手机页面
        param.portalName = '手机门户'
      }
      if(param.privName === '') {
        this.$message.warning('请输入页面名称');
        return;
      }
      if(param.portalName === '') {
        this.$message.warning('请输入门户名称');
        return;
      }
      if(!param.parentPrivId){
        param.parentPrivId = this.menuClassTypeId;
      }
      this.homeCheck(); //如果没设置主页设置默认主页
      if(param.portalId){ //修改
        this.updatePortal(param).then(resp=>{
          if (resp.status == 200 && resp.data.respResult == "1") {
            this.$message.success('门户修改成功');
          }
        }).catch(err=>{})
      } else {  //新增
        param.tenantId = sessionStorage.getItem('tenant_id');
        this.addPortal(param).then(resp=>{
          if (resp.status == 200 && resp.data.respResult == "1") {
            let id = resp.data.respData;
            this.portal.portalId =  id;
            this.$message.success('门户保存成功');
          }
        }).catch(err=>{})
      }
    },
    homeCheck() {
      let data = this.portal.portalPrivList;
      if(data.length > 0) {
        this.getTreeIds(data);
        if(!this.homePage.privId) { //没有设置主页
          let leaf = null;
          for(let i=0; i<data.length; i++) {
            let menu = data[i];
            if(!menu.children) {  //叶子菜单
              // menu.isHome = '1';
              leaf = menu;
              break;
            } else {
              leaf = this.findLeaf(menu.children);
              if(leaf) {
                break;
              }
            }
          }
          if(leaf) {
            leaf.isHome = '1';
          }
        }
      }
    },
    findLeaf(data) {
      let leaf = null;
      for(let i=0; i<data.length; i++) {
        if(!data[i].children) {
          leaf = data[i];
          break;
        } else {
          leaf = this.findLeaf(data[i].children);
          if(leaf) {
            break;
          }
        }
      }
      return leaf;
    },
    toSaveAs() {
      this.saveForm.pageName = this.portal.privName;
      this.dialogSaveAs = true;
      this.saveForm.catalog = '我的文件夹';
    },
    saveAsSubmit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          let param = this.portal;
          if(param.privName === this.saveForm.pageName) {
            this.$message.error('名称不能重复');
            return;
          }
          param.parentPrivId = this.menuClassTypeId;
          param.privName = this.saveForm.pageName;
          param.tenantId = sessionStorage.getItem('tenant_id');
          this.addPortal(param).then(resp => {
            if (resp.status == 200 && resp.data.respResult == "1") {
              let id = resp.data.respData;
              this.queryPortalDetail({portalId: id}).then(res=>{
                if (res.status == 200 && res.data.respResult == "1") {
                  let data = res.data.respData;
                  this.setPortal(data);
                  let expendIds = this.getTreeIds(data.portalPrivList || []).ids;
                  if(expendIds.length>0) {
                    this.setExpendIds(expendIds);
                  }
                  this.$message.success("门户另存成功");
                  this.dialogSaveAs = false;
                }
              }).catch(err=>{})
            }
          }).catch(err => {})
        } else {
          return false;
        }
      });
    },
    toPreview() {
      this.setPageCache(this.portal);
      this.pageCache.preview = true;
      sessionStorage.setItem("pageCache", JSON.stringify(this.pageCache));
      this.storeVuexStore();
      let routeData = this.$router.resolve({ name: "portalView" }); //query: { timestamp: getTimestamp }
      window.open(routeData.href, "_blank");
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
      let ids = [];
      this.homePage = {};
      menuList.forEach(val=>{
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
      return {ids};
    }
  },
  computed: {
    ...mapState({
      portal: state => state.DataPortal.portal,
      pageCache: state => state.DataPortal.pageCache,
      menuClassTypeId: state => state.HomeTree.menuClassTypeId
    })
  },
  created() {

  },
  mounted() {

  },
  activated() {

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
    border-bottom: 1px solid #000;

    .page-name {
      float: left;
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
    padding: 0;
    overflow: hidden;

    .query-design {
      width: 100%;
      height: 100%;
      background-color: $main-bg1;
      outline: none;
      background-repeat: no-repeat;
      background-position: center center;
      background-size: cover;
      overflow: hidden;

      /deep/ .el-scrollbar__wrap {
        overflow-x: hidden;
      }
      /deep/ .el-scrollbar__bar.is-horizontal {
        display: none;
      }
      &.mobile-design {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        margin-top:5px;
        @media screen and (max-width: 1600px) {
          width: 375px !important;
          height: 500px !important;
        }
        @media screen and (min-width: 1600px) {
          width: 375px !important;
          height: 667px !important;
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


</style>
