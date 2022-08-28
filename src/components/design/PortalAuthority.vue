<template>
  <el-dialog
    width="720px"
    :title="'菜单权限设置'"
    :visible.sync="authorityDialog"
    append-to-body
    :destroy-on-close="true"
    :close-on-click-modal="false"
  >
    <div>
      <el-form>
        <el-row>
          <el-col :span="6">
            <div class="left-menu-tree">
              <el-input
                placeholder="输入菜单进行查询"
                v-model="filterText"
                prefix-icon="el-icon-search"
                size="mini"
                style="width: 100%"
                @keyup.enter.native="resFilter"
              >
              </el-input>
              <div class="menu-tree">
                <el-tree
                  style="overflow: auto"
                  :data="menuTreeData"
                  :expand-on-click-node="true"
                  :filter-node-method="filterNode"
                  node-key="menuId"
                  ref="menuTree"
                  :props="treeProps"
                  @node-click="handleNodeClick"
                />
              </div>
            </div>
          </el-col>
          <el-col :span="18">
            <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
              <el-tab-pane label="按角色" name="roleList">
                <div class="dialog-content dialog-addUser">
                  <el-transfer
                    ref="transfer"
                    style="height: 300px"
                    filterable
                    filter-placeholder="角色名"
                    v-model="roleSelectedList"
                    :titles="['待选项', '已选项']"
                    :data="roleUnSelectedList"
                    :props="roleTransferProps"
                    @change="changeSelectList"
                  />
                </div>
              </el-tab-pane>
              <el-tab-pane label="按用户" name="userList">
                <div class="dialog-content dialog-addUser">
                  <el-transfer
                    ref="transfer"
                    style="height: 300px"
                    filterable
                    filter-placeholder="用户名"
                    v-model="userSelectedList"
                    :titles="['待选项', '已选项']"
                    :data="userUnSelectedList"
                    :props="userTransferProps"
                    @change="changeSelectList"
                  />
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="restData" size="mini"> 重 置 </el-button>
      <el-button @click="setAuthorityDialog(false)" size="mini">
        取 消
      </el-button>
      <el-button type="primary" size="mini" @click="addAuthority">
        确 定
      </el-button>
    </div>
  </el-dialog>
</template>


<script>
import { mapState, mapGetters, mapMutations, mapActions } from "vuex";
export default {
  data() {
    return {
      privConfigData: {},
      privConfigList: [],
      menuTreeData: [],
      userSelectedList: [],
      userUnSelectedList: [],
      roleSelectedList: [],
      roleUnSelectedList: [],
      filterText: "",
      treeProps: {
        value: "menuId", // ID字段名
        label: "menuName", // 显示名称
        children: "children", // 子级字段名
        isLeaf: (data) => {
          return !data.children;
        },
      },
      activeName: "roleList",
      curAllIdList: {},
      privId: "",
      roleTransferProps: {
        key: "roleId",
        label: "roleName",
      },
      userTransferProps: {
        key: "userId",
        label: "userName",
      },
    };
  },
  computed: {
    authorityDialog: {
      get() {
        return this.$store.state.compt.authorityDialog;
      },
      set(value) {
        this.setAuthorityDialog(value);
      },
    },
    ...mapState({
      pageCache: (state) => state.DataPortal.pageCache,
    }),
    ...mapGetters({
      condiCols: "QueryTable/condiCols",
      resultCols: "QueryTable/resultCols",
      tableColumn: "QueryTable/tableColumn",
      summarizeCols: "QueryTable/summarizeCols",
    }),
  },
  methods: {
    restData() {//重置当前菜单
      this.userSelectedList = [];
      this.roleSelectedList = [];
      this.changeSelectList();
    },
    changeSelectList() {
      //当前菜单所选的角色、用户
      this.curAllIdList.privId = this.privId;
      this.curAllIdList.roleIdList = [...this.roleSelectedList];
      this.curAllIdList.userIdList = [...this.userSelectedList];

      //获取当前菜单以外的菜单权限
      let tempData = this.privConfigList.filter((item) => {
        return item.privId !== this.privId;
      });
      //所有菜单权限拼接
      tempData.push({ ...this.curAllIdList });
      this.privConfigList = [...tempData];
    },
    addAuthority() {
      //新增权限配置信息，所有菜单的角色用户权限都要放在请求报文。因为服务端是删除后新增，若其他菜单权限未返回，
      this.privConfigData.privConfigList = this.privConfigList;
      this.addPrivConfig(this.privConfigData)
        .then((val) => {
          if (val.status === 200 && val.data.respResult === "1") {
            this.$message.success("权限分配成功");
          } else {
            this.$message.error("权限分配失败");
          }
        })
        .catch((err) => {
          this.$message.error("权限分配失败");
        })
        .finally(() => {
          this.setAuthorityDialog(false);
        });
    },
    handleClick(tab, event) {
      this.activeName = tab.name;
    },
    handleNodeClick(data, node) {
      //菜单树点击，只有叶子节点才能分配权限
      if (node.isLeaf) {
        this.privId = data.menuId;
        let tempList = this.privConfigList.filter((item) => {
          return item.privId == data.menuId;
        });
        this.curAllIdList = tempList.length > 0 ? tempList[0] : {};
        this.getRoles();
        this.getUsers();
      } else {
        this.userUnSelectedList = [];
        this.roleUnSelectedList = [];
      }
    },
    getRoles() {
      //查询角色列表
      if (this.privId != "") {
        this.queryRoles({})
          .then((val) => {
            if (val.status === 200 && val.data.respResult === "1") {
              let data = val.data.respData;
              this.roleUnSelectedList = data;
              console.log(this.curAllIdList);
              console.log(this.curAllIdList.roleIdList);
              this.roleSelectedList = this.curAllIdList.roleIdList || [];
            } else {
              this.$message.error("角色查询失败");
              console.error(val);
            }
          })
          .catch((err) => {
            this.$message.error("角色查询失败");
          });
      }
    },
    getUsers() {
      //查询用户列表
      if (this.privId != "") {
        console.log(this.curAllIdList);
        this.getUserList({})
          .then((val) => {
            if (val.status === 200 && val.data.respResult === "1") {
              let data = val.data.respData;
              this.userUnSelectedList = data;
              this.userSelectedList = this.curAllIdList.userIdList || [];
              console.log(this.userSelectedList);
            } else {
              this.$message.error("用户查询失败");
              console.error(val);
            }
          })
          .catch((err) => {
            this.$message.error("用户查询失败");
          });
      }
    },
    resFilter() {
      //菜单树搜索
      this.$refs.menuTree.filter(this.filterText);
    },
    getMenuTreeData() {
      //获取菜单树
      this.getMenuTree(this.pageCache.portalId)
        .then((val) => {
          if (val.status === 200 && val.data.respResult === "1") {
            this.menuTreeData = val.data.respData;
            console.log(val.data.respData);
          } else {
            this.$message.error("页面查询失败");
            console.error(val);
          }
        })
        .catch((err) => {
          this.$message.error("页面查询失败");
        });
    },
    getPrivConfigData() {
      //查询权限配置信息
      this.getPrivConfig(this.pageCache.portalId)
        .then((val) => {
          if (val.status === 200 && val.data.respResult === "1") {
            console.info(val.data);
            this.privConfigData = val.data.respData;
            this.privConfigList = this.privConfigData.privConfigList;
          } else {
            this.$message.error("页面查询失败");
            console.error(val);
          }
        })
        .catch((err) => {
          this.$message.error("页面查询失败");
        });
    },
    filterMethod(query, item) {
      if (item) {
        if (this.activeName === "roleList") {
          return item.roleName && item.roleName.indexOf(query) > -1;
        } else {
          return item.userName && item.userName.indexOf(query) > -1;
        }
      }
    },
    renderTransfer(h, option) {
      return <span title={option.label}>{option.label}</span>;
    },
    filterNode(value, data) {
      if (!value) {
        return true;
      }
      if (data.menuName !== null && data.menuName !== undefined) {
        return (
          data.menuName.indexOf(value) !== -1 ||
          data.menuName.indexOf(value.toLowerCase()) !== -1 ||
          data.menuName.indexOf(value.toUpperCase()) !== -1
        );
      } else {
        return false;
      }
    },
    ...mapActions({
      getMenuTree: "DataPortal/getMenuTree",
      queryRoles: "DataPortal/queryRoles",
      getUserList: "DataPortal/getUserList",
      getPrivConfig: "DataPortal/getPrivConfig",
      addPrivConfig: "DataPortal/addPrivConfig",
    }),
    ...mapMutations({
      setAuthorityDialog: "compt/setAuthorityDialog",
    }),
  },
  mounted() {
    // this.getMenuTreeData();
    // this.getPrivConfigData();
  },
  watch: {
    authorityDialog(newVal) {
      if (newVal) {
        this.getMenuTreeData();
        this.getPrivConfigData();
      } else {
        this.userUnSelectedList = [];
        this.roleUnSelectedList = [];
      }
    },
  },
};
</script>

<style lang="scss" scoped>
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
  .el-tree-node__label {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .el-tree-node__content:hover {
    background-color: transparent;
  }
  .el-tree-node__content .is-leaf + span:hover {
    background-color: transparent;
    color: #409eff;
  }
  .el-tree-node.is-current > .el-tree-node__content .is-leaf + span {
    color: #409eff;
  }
  .el-tree-node.is-current > .el-tree-node__content .is-leaf .tree-tit {
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
}
</style>