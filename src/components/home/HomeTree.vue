<template>
  <div class="aside-body-wrap">
    <!-- <div class="aside-title">
      <span>{{realMeunName}}</span>
      <div class="aside-title-line"></div>
    </div>-->
    <div class="aside-body">
      <el-scrollbar style="height:100%;" class="ht-overflow">
        <!-- <el-scrollbar style="width:100%;height:100%;padding-bottom:10px;" :native="false" :noresize="false" tag="section"> -->
        <el-tree
          ref="tree"
          :data="treeData"
          :expand-on-click-node="false"
          :render-content="renderContent"
          :default-expanded-keys="expendId"
          node-key="id"
        ></el-tree>
      </el-scrollbar>
    </div>
    <!-- 简单提示不用这种方式！！！ <el-dialog :visible.sync="deleteDialog" width="30%">
      <div slot="title" class="dialog-title">
        <span>删除提示</span>
        <div class="title-line"></div>
      </div>
      <span>确认要删除该目录和其子页面吗？</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteDialog = false" size="mini">取 消</el-button>
        <el-button type="primary" @click="deleteDo" size="mini">确 定</el-button>
      </span>
    </el-dialog>-->
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";

export default {
  data() {
    return {
      id: 5,
      num: "",
      timeFn: null,
      deleteDialog: false,
      delNode: null,
      delData: null,
      expendId: [],
      menuName:'',
      nameCache: '' //名称编辑时默认名缓存，不符合规范还原默认值
    };
  },
  computed: {
    editNum() {
      return this.num;
    },
    ...mapGetters({
      getMenuName: "HomeTree/getMenuName"
    }),
    ...mapState({
      treeData: state => state.HomeTree.treeData,
      myFolder: state => state.commonProperties.myFolder,
      menuClassTypeId: state => state.HomeTree.menuClassTypeId,
      dataSetTreeIndex: state => state.HomeTree.dataSetTreeIndex,
      driveTree: state => state.HomeTree.driveTree,
      defaultSystemId: state => state.defaultSystemId
    })
  },
  created() {
    //打印下获得数据结果
    // this.realMeunName = this.getMenuName;
    // this.$refs.tree.setCurrentKey("myfold");
  },
  watch: {
    //检测值变化时候触发
    getMenuName(val) {
      //this.realMeunName = val;
      this.getCatalogData();
      var data = {};
      this.showPageList(data);
    }, //这个就是变化值
    deleteDialog(val) {
      if (!val) return;
      const text = "确认要删除该目录和其子页面吗？";
      this.open(text);
    },
    dataSetTreeIndex(val) {
      if (val != 999) {
        this.getCatalogData();
      }
    }
  },
  mounted() {
    this.getCatalogData();
  },
  methods: {
    openDelete() {
      this.open("确认要删除该目录和其子页面吗？");
    },
    getCatalogData() {
      var ctid = this.menuClassTypeId; //分类id
      var user_id = window.sessionStorage.getItem("user_id");
      var param = {
        classTypeId: ctid,
        createUser: user_id
      };
      if (ctid === "drive") {
        this.$store.commit("HomeTree/setTreeList", {
          result: this.driveTree,
          myFolder: "drive"
        });
        //默认展开第一级
        this.treeData.forEach(m => {
          this.expendId.push(m.id);
        });
        //默认选中某一个文件夹
        // let firstMenuId = '';
        // if( this.driveTree && this.driveTree[0]){
        //   firstMenuId = this.driveTree[0].id;
        // }
        // this.setCatalog({ id: firstMenuId }); //此处默认给予一个初始值
        // this.$nextTick(() => {
        //   this.$refs.tree.setCurrentKey(firstMenuId);
        //   // this.setCatalog({ id: firstMenuId }); //此处默认给予一个初始值
        // });

        return;
      }
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
                }
                // temp.children = this.generateTree(val, second);
                result.push(temp);
              });
            }

            if (this.dataSetTreeIndex != 1 && this.menuClassTypeId == "1004") {


              this.$store.commit("HomeTree/setTreeList", {
                result: result,
                myFolder: 0,
                isEmail: this.menuClassTypeId === '1003'
              });
              //默认选中某一个文件夹
              this.$nextTick(() => {
                if (this.dataSetTreeIndex === 0) {
                  this.$refs.tree.setCurrentKey("workfold");
                  this.setCatalog({ id: "workfold" }); //此处默认给予一个初始值
                } else if (this.dataSetTreeIndex === 2) {
                  this.$refs.tree.setCurrentKey("myfold");
                  this.setCatalog({ id: "myfold" }); //此处默认给予一个初始值
                }
                const ctid = this.menuClassTypeId; //分类id
                const curNode = this.$refs.tree.getCurrentNode()
                this.setDataSetCatalog({ id: curNode.id, level: curNode.level, cid: ctid });
              });
            } else if (this.menuClassTypeId == "1004") {
              this.$store.commit("HomeTree/setTreeList", {
                result: result,
                myFolder: this.myFolder
              });
              //默认选中某一个文件夹
              this.$nextTick(() => {
                this.$refs.tree.setCurrentKey("myfold");
                this.setCatalog({ id: "myfold" }); //此处默认给予一个初始值
                const ctid = this.menuClassTypeId; //分类id
                const curNode = this.$refs.tree.getCurrentNode()
                this.setDataSetCatalog({ id: curNode.id, level: curNode.level, cid: ctid });
              });
            } else {
              this.$store.commit("HomeTree/setTreeList", {
                result: result,
                myFolder: this.myFolder,
                isEmail: this.menuClassTypeId == "1003"
              });
              //默认选中某一个文件夹
              this.$nextTick(() => {
                this.$refs.tree.setCurrentKey("myfold");
                this.setCatalog({ id: "myfold" }); //此处默认给予一个初始值
              });
            }
            // this.$store.commit("HomeTree/setTreeList", {
            //   result: result,
            //   myFolder: this.myFolder
            // });

            //默认展开第一级
            this.treeData.forEach(m => {
              // console.info(m.id);
              this.expendId.push(m.id);
            });
          } else {
            this.$message.error("目录查询失败");
          }
        })
        .catch(err => {
          console.error(err);
          // this.$message.error("文件夹查询异常");
        });
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
    ...mapMutations({
      setTreeList: "HomeTree/setTreeList"
    }),
    ...mapActions({
      queryTreeData: "HomeTree/queryTreeData",
      addTreeData: "HomeTree/addTreeData",
      delTreeData: "HomeTree/delTreeData",
      editTreeData: "HomeTree/editTreeData",
      setCatalog: "HomeBody/setCatalog",
      setDataSetCatalog: "DataSetMgt/setDataSetCatalog",
      setReportCatalog: "ReportIndex/setReportCatalog",
      saveMenuTree: "HomeTree/saveMenuTree",
      modifyMenu: "HomeTree/modifyMenu",
      delMenu: "HomeTree/delMenu"
    }),
    treeAddHandle(data, dom) {
      if (document.querySelector('.edit-on') !== null) {
        return
      }
      if (data.id == "workfold") {
        //工作组空间不可以添加子目录
        this.$message.error("工作组空间不可以添加子目录");
        return;
      }

      // var num = 1;
      // if (data.children) {
      //   num = data.children.length + 1;
      // }

      var ctid = this.menuClassTypeId; //分类id

      var expendId = this.expendId;
      var user_id = sessionStorage.getItem("user_id"); //用户id
      var t_id = sessionStorage.getItem("tenant_id"); //租户id
      var param = {
        //catalogName:catalogName,
        classTypeId: ctid,
        //classTypeName: this.realMeunName,
        parentCatalogId: data.id,
        createUser: user_id,
        tenantId: t_id
      };
      if (data.level == 1) {
        param.isLeaf = "true";
      } else {
        param.isLeaf = "false";
      }
      this.addTreeData(param)
        .then(val => {
          if (val.status == 200 && val.data.respResult == 1) {
            var obj = val.data.respData;
            const newChild = {
              id: obj.catalogId,
              label: obj.catalogName,
              level: data.level + 1,
              typeId: obj.classTypeId,
              parentId: data.id,
              value: obj.catalogId,
              children: []
            };
            if (data.level == 1) {
              delete newChild.children;
            }
            if (!data.children) {
              this.$set(data, "children", []);
            }
            data.children.push(newChild);
            this.num = newChild.id;
            this.$nextTick(() => {
              expendId.pop();
              expendId.push(data.id);
            });
          } else {
            this.$message.error(val.data.respErrorDesc);
          }
        })
        .catch(err => {
          // this.$message.error("添加目录异常");
        });
    },
    treeDelHandle(node, data) {
      if (document.querySelector('.edit-on') !== null) {
        return
      }
      if (data.children != null && data.children.length > 0) {
        this.$message.warning("子目录不为空，请先删除子目录");
        return;
      } else {
        this.delNode = node;
        this.delData = data;
        // this.deleteDialog = true;
        this.openDelete();
      }
    },
    deleteMenu(menuId){
      var param = { menuId : menuId };
      let node = this.delNode;
      let data = this.delData;
      this.delMenu(param)
        .then(val => {
          if (val.status == 200 && val.data.respResult == 1) {
            const parent = node.parent;
            const children = parent.data.children || parent.data;
            const index = children.findIndex(d => d.id === data.id);
            children.splice(index, 1);
            this.setCatalog({ id: "" });
          } else {
            this.$message.error(val.data.respErrorDesc);
          }
        })
        .catch(err => {
          // this.$message.error("删除菜单异常");
        });
    },
    deleteDo() {
      //驾驶舱删除菜单
      if(this.menuClassTypeId === "drive"){
        this.deleteMenu(this.delData.id);
        return;
      }
      let node = this.delNode;
      let data = this.delData;
      let param = {};
      param.catalogId = data.id;
      param.classTypeId = data.typeId;
      param.catalogName = data.label;
      this.delTreeData(param)
        .then(val => {
          if (val.status == 200 && val.data.respResult == 1) {
            const parent = node.parent;
            const children = parent.data.children || parent.data;
            const index = children.findIndex(d => d.id === data.id);
            children.splice(index, 1);
            if (this.dataSetTreeIndex === 0 && this.menuClassTypeId == "1004") {
              this.$refs.tree.setCurrentKey("workfold");
              this.setCatalog({ id: "workfold" });
            } else if (this.menuClassTypeId == "1004") {
              this.$refs.tree.setCurrentKey("myfold");
              this.setCatalog({ id: "myfold" });
              const ctid = this.menuClassTypeId;
              const curNode = this.$refs.tree.getCurrentNode()
              this.setDataSetCatalog({ id: curNode.id, level: curNode.level, cid: ctid });
            } else {
              this.$refs.tree.setCurrentKey("myfold");
              this.setCatalog({ id: "myfold" });
            }
            // this.setCatalog({ id: "" });
          } else {
            this.$message.error(val.data.respErrorDesc);
          }
          this.deleteDialog = false;
        })
        .catch(err => {
          this.deleteDialog = false;
        });
    },
    treeEditBegin(data) {
      if (data.level === 0 || this.menuClassTypeId === 'drive') {
        return;
      }
      clearTimeout(this.timeFn);
      this.num = data.id;
      this.menuName = data.label;
      setTimeout(() => {
        document.querySelector(".edit-on").focus();
      }, 0);
    },
    editMenu(data, dom){
      var text = dom.value;
      var param = {menuId : data.value, menuName: text};
      let _this = this;
      this.modifyMenu(param)
        .then(val => {
          if (val.status == 200 && val.data.respResult == 1) {
            this.num = "";
            dom.value = text;
            data.label = text;
          } else {
            _this.$set(dom, "value", _this.menuName);
            _this.$set(data, "label", _this.menuName);
            this.$message.error(val.data.respErrorDesc);
          }
        })
        .catch(err => {
          // this.$message.error("修改菜单异常");
        });
    },
    treeEditEnd(data, dom) {
      var text = dom.value;
      if (text.trim() === "") {
        this.$message.error("目录名称不能为空");
        data.label = this.nameCache;
        return;
      }
      //驾驶舱编辑菜单
      if(this.menuClassTypeId === "drive"){
        this.editMenu(data,dom);
        return;
      }
      var param = {};
      var catalogIds = []; //目录集合
      catalogIds.push(data.id);
      var user_id = sessionStorage.getItem("user_id");
      param.catalogName = text;
      param.catalogId = data.id;
      param.catalogid_list = catalogIds;
      param.classTypeId = data.typeId;
      param.parentCatalogId = data.parentId;
      param.createUser = user_id;
      this.editTreeData(param)
        .then(val => {
          if (val.status == 200 && val.data.respResult == 1) {
            this.num = "";
            dom.value = text;
            data.label = text;
          } else {
            this.$message.error(val.data.respErrorDesc);
            data.label = this.nameCache;
          }
        })
        .catch(err => {
          // this.$message.error("修改目录异常");
        });
    },
    showPageList(data) {
      var ctid = this.menuClassTypeId; //分类id
      clearTimeout(this.timeFn);
      let components = 'HomeBody';
      if (ctid == 1004) {
        //数据集
        this.timeFn = setTimeout(() => {
          this.setDataSetCatalog({ id: data.id, level: data.level, cid: ctid });
        }, 300);
      } else if (ctid == 1003) {
        if (data.id === 'emailtask') {
          // this.$store.commit("EmailTaskMgt/setTaskUrl", 'EmailTaskMgt');
          components = 'EmailTaskMgt';
        } else if (data.id === 'sharedFolder') {
          components = 'sharedFolder';
        } else {
          //即系、报表
          this.timeFn = setTimeout(() => {
            this.setCatalog({ id: data.id, level: data.level, cid: ctid });
          }, 300);
        }

      } else {
        if(ctid==='drive' && !data.id){
          return;
        }
        //共享文件夹
        if (data.id === 'sharedFolder') {
          components = 'sharedFolder';
        } else {
          //即系、报表
          this.timeFn = setTimeout(() => {
            this.setCatalog({ id: data.id, level: data.level, cid: ctid });
          }, 300);
        }
      }
      this.$emit("changeCurrent", components);
    },
    renderContent(h, { node, data, store }) {
      var className = "tree-item level" + data.level;
      var icon;
      var right;//驾驶舱tree目录样式
      if (data.level === 0) {
        if (data.id == "myfold" && data.label != '我的维度') {
          icon = (
            <span class="tree-icon">
              <span
                class="icon-A10279-new"
                on-click={e => {
                  this.treeAddHandle(data, e.target);
                }}
              />
            </span>
          );
        }
      } else if (data.level == 1 && this.menuClassTypeId != "drive") {
        icon = (
          <span class="tree-icon">
            <span
              class="icon-A10279-new"
              on-click={e => {
                this.treeAddHandle(data, e.target);
              }}
            />
            <span
              class="icon-A10278-Deleted"
              on-click={e => {
                this.treeDelHandle(node, data);
              }}
            />
          </span>
        );
      } else if (data.level == 2 && this.menuClassTypeId != "drive") {
        icon = (
          <span
            class="tree-icon"
            on-click={e => {
              this.treeDelHandle(node, data);
            }}
          >
            <span class="icon-A10278-Deleted" />
          </span>
        );
      }
      setTimeout(() => {
        if (document.getElementsByClassName("edit-on").length > 0) {
          document.getElementsByClassName("edit-on")[0].focus();
        }
      }, 10);
      return (
        <span class={className}>
          <div
            class="tree-tit ellipsis"
            style={right}
            on-dblclick={val => this.treeEditBegin(data)}
            on-click={val => this.showPageList(data)}
          >
            <input
              class={this.editNum === data.id ? "edit-on" : "edit-off"}
              v-show={this.editNum === data.id}
              v-model={data.label}
              on-blur={val => this.treeEditEnd(data, val.target)}
              maxlength="10"
              on-focus={()=> this.nameCache = data.label}
            />
            <span v-show={this.editNum !== data.id} title={data.label}>
              {data.label}
            </span>
          </div>
          {icon}
        </span>
      );
    },
    open(text) {
      this.$confirm(text, "提示", {
        closeOnClickModal: false,
        confirmButtonText: "确定",
        cancelButtonText: "取消"
        // type: 'warning'
      })
        .then(() => {
          this.$message({
            type: "success",
            message: "操作成功!"
          });
          this.deleteDo();
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消"
          });
          this.deleteDialog = false;
        });
    }
  }
};
</script>


<style lang="scss" scoped>
.aside-title {
  text-align: left;
  font-size: 16px;
  color: #fff;
  height: 40px;
  line-height: 45px;
  border-bottom: 1px solid #0a2b4c;
  position: relative;
  span {
    margin-left: 10px;
  }
  .aside-title-line {
    width: 100%;
    height: 1px;
    background: #afc0d0;
    position: absolute;
    bottom: 0;
  }
}
.aside-body-wrap{
  height:100%;
  width:100%;
  float:left;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
}
.aside-body /deep/ .el-tree {
  background: transparent;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  color: #afc0d0;
}
/deep/.aside-body {
  height: 100%;
  .el-tree-node__content:hover {
    background-color: transparent;
    color: #409eff;
  }
  .el-tree-node:focus > .el-tree-node__content {
    background-color: transparent;
  }
  .el-tree-node__expand-icon {
    color: #afc0d0;
    font-size: 14px;
    margin-left: -5px;
    margin-top: -4px;
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
      input {
        width: 100%;
      }
    }
    .tree-tit.ellipsis {
      text-overflow: ellipsis;
    }
    &.level0,
    &.level2 {
      .tree-tit {
        right: 40px;
      }
    }
    &.level1 {
      .tree-tit {
        right: 60px;
      }
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
    right: 15px;
    height: 100%;
    .icon-A10278-Deleted {
      margin-left: 5px;
    }
  }
  .tree-icon:hover{
    display: block;
  }
  .el-tree-node.is-current > .el-tree-node__content .tree-tit {
    color: #409eff;
  }
}
/deep/.el-scrollbar__wrap {
  overflow: hidden;
}
.ht-overflow:hover /deep/ .el-scrollbar__wrap {
  overflow: visible;
  overflow-x: hidden;
}
/deep/ .el-scrollbar__thumb {
  background-color: rgba(10, 43, 76, 0.3);
}
.span-ellipsis {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: block;
}
</style>
