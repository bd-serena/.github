<template>
  <el-dialog
    size="mini"
    :title="appType === '2' ? '发布应用' : '发布驾驶舱'"
    width="700px"
    :visible.sync="cockpitPubDialogVis"
    :append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="reset"
    :destroy-on-close="true"
    class="el-dialog-cockpitPublic"
  >
    <div class="condi-set-box interact-set-wrap" style="height:336px;">
      <el-form
        ref="cockpitForm"
        :rules="rules"
        :model="cockpitForm"
        :inline="true"
        class="demo-form-inline"
        size="mini"
      >
        <el-form-item prop="pageName" v-if="appType==='2'" label="应用名称">
          <el-input v-model="cockpitForm.pageName" :maxlength="20" class="el-input-pageName" />
        </el-form-item>
        <el-form-item prop="pageUrl" v-if="appType==='2'" label="应用地址">
          <el-input v-model="cockpitForm.pageUrl" :maxlength="300" class="el-input-pageUrl" />
        </el-form-item>
        <el-form-item label="发布路径" class="publish-menus">
          <el-cascader
            :options="cockpitForm.menuTreeList"
            v-model="cockpitForm.menuTreeValue"
            @change="menuTreeChange"
            :show-all-levels="false"
            :change-on-select="true"
            expand-trigger="hover"
            style="width:100%"
            :props="{ checkStrictly : true, value:'menuId', label:'menuName'}"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <el-container>
        <el-transfer
          ref="el-transfer"
          filterable
          :filter-method="filterMethod"
          filter-placeholder="请输入角色名称"
          :titles="['待选项', '已选项']"
          v-model="roleSelectedList"
          :data="roleList"
          style="height:250px"
          @change="roleSelectedChange"
        ></el-transfer>
      </el-container>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button
        v-if="appType!=='2'"
        :disabled="delCockpitVis"
        size="mini"
        @click="delCockpitPublicList"
      >一键取消</el-button>
      <el-button size="mini" @click="closeDialog">取 消</el-button>
      <el-button type="primary" @click="saveCockpitPublicList" size="mini">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapActions, mapMutations, mapState } from "vuex";
import { service } from "ngbd-utils";

export default {
  data() {
    let checkPageName = (userRules, value, callback, source) => {
      if (!value.trim()) {
        return callback(new Error(`请输入应用名称`));
      } else if (value.length > 20) {
        callback(new Error(`应用名称不能超过20个字符`));
      } else {
        callback();
      }
    };
    let checkPageUrl = (userRules, value, callback, source) => {
      if (!value.trim()) {
        return callback(new Error(`请输入应用地址`));
      } else if (value.length > 300) {
        callback(new Error(`应用地址不能超过300个字符`));
      } else {
        callback();
      }
    };
    return {
      roleList: [], //角色列表
      roleSelectedList: [], //当前菜单已选角色列表
      roleSelectedMap: {}, //全部菜单已选角色列表
      cockpitForm: {
        menuTreeValue: [], //发布路径下拉框值
        menuTreeList: [], //发布路径列表
        pageId: "", //页面id,发布应用传空
        pageName: "", // 应用名称
        pageUrl: "", // 应用地址
      },
      allPublicRoleMap: {}, //已发布的所有菜单角色权限配置信息{menuId:roleList}
      delCockpitVis: true,
      checkPageName: {},
      rules: {
        pageName: [
          { required: true, validator: checkPageName, trigger: "blur" },
        ],
        pageUrl: [{ required: true, validator: checkPageUrl, trigger: "blur" }],
      },
    };
  },
  computed: {
    cockpitPubDialogVis: {
      get() {
        return this.$store.state.AnalyReportAttr.cockpitPubDialogVis;
      },
      set(value) {
        this.setCockpitPubDialogVis(value);
      },
    },
    appType: {
      get() {
        return this.$store.state.AnalyReportAttr.appType;
      },
      set(value) {
        this.setAppType(value);
      },
    },
    ...mapState({
      renderEngine: (state) => state.renderEngine,
      defaultSystemId: (state) => state.defaultSystemId,
      pageCache: (state) => state.HomeBody.pageCache,
    }),
  },
  methods: {
    ...mapMutations({
      setCockpitPubDialogVis: "AnalyReportAttr/setCockpitPubDialogVis",
      setAppType: "AnalyReportAttr/setAppType"
    }),
    ...mapActions({
      pubPageInfo: "HomeBody/pubPageInfo",
      setPageCache: "HomeBody/setPageCache",
      delCockpitApply: "DataSetMgt/delCockpitApply"
    }),
    closeDialog() {
      this.setCockpitPubDialogVis(false);
      this.reset();
    },
    filterMethod(query, item) {
      return item.label.indexOf(query) > -1;
    },
    reset() {
      this.$refs["cockpitForm"].resetFields();
      this.setAppType("");
      this.setPageCache("");
    },
    menuTreeChange(menuIds) {
      if (!menuIds) {
        return;
      }
      let menuId = menuIds[menuIds.length - 1];
      //重置角色列表
      this.queryRoleList(menuId);
      //重置已选项
      this.roleSelectedList = this.roleSelectedMap[menuId];
    },
    roleSelectedChange(data, moveStatus, moveList) {
      this.roleSelectedMap[
        this.cockpitForm.menuTreeValue[
          this.cockpitForm.menuTreeValue.length - 1
        ]
      ] = data || [];
    },
    delCockpitPublicList() {
      this.$refs.cockpitForm.validate((valid) => {
        if (valid) {
          this.$confirm("确认取消发布驾驶舱?", "提示", {
            closeOnClickModal: false,
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          })
            .then(() => {
              // let params = [];
              // let pageId = this.pageCache.pageId;
              // this.cockpitForm.menuTreeList.forEach((val) => {
              //   let item = {
              //     pageId: pageId,
              //     privId: val.menuId,
              //     roleIds: [],
              //   };
              //   params.push(item);
              // });
              // this.cockpitPublic(params, 2); //2已提交状态
              //取消发布驾驶舱
              this.cancelCockpitPublish(this.pageCache.pageId);
              this.delCockpitVis = false;
              this.reset();
              this.setCockpitPubDialogVis(false);
            })
            .catch((err) => {
              console.error(err);
            });
        } else {
          return false;
        }
      });
    },
    cancelCockpitPublish() {
      let pageId = this.pageCache.pageId;
      let _this = this;
      _this.delCockpitApply(pageId).then((val) => {
        if (val.status === 200 && val.data.respResult === "1") {
          _this.updatePageInfo(pageId, '2');
        } else {
          this.$message.error("驾驶舱取消发布失败！");
        }
      });
    },
    saveCockpitPublicList() {
      this.$refs.cockpitForm.validate((valid) => {
        if (valid) {
          let roleMap = this.roleSelectedMap || {};
          let pageId = this.pageCache.pageId;
          // 发布应用
          //发布驾驶舱，菜单角色不能为空
          let publishInfoList = [];
          // this.cockpitForm.menuTreeList.forEach((val) => {
          //   if (roleMap[val.menuId] && roleMap[val.menuId].length > 0) {
          //     let item = {
          //       privId: val.menuId,
          //       roleIdList: roleMap[val.menuId] || [],
          //     };
          //     if (item.roleIdList && item.roleIdList.length > 0) {
          //       checkNull++;
          //     }
          //     publishInfoList.push(item);
          //   }
          // });
          for(let privId in roleMap){
            let item = {
              privId: privId,
              roleIdList: roleMap[privId] || [],
            };
            if (item.roleIdList && item.roleIdList.length > 0) {
                publishInfoList.push(item);
            }
          }
          if (publishInfoList.length < 1) {
            this.$message.warning(`发布角色不能为空`);
            return false;
          }
          let params = {
            appType: this.appType || "1",
            publishInfoList: publishInfoList,
            pageId: pageId,
            pageName: this.cockpitForm.pageName,
            pageUrl: this.cockpitForm.pageUrl,
          };
          this.cockpitPublic(params, 1);
        }
      });
    },
    querycockpitDialogData() {
      let _this = this;
      //获取菜单列表
      service({
        maskOff: true,
        url: `${this.renderEngine}/cockpit/getCockpitMenu`,
        method: "get",
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id") || "9999012",
          "X-SystemId": this.defaultSystemId || "1016",
          "X-TenantId":
            window.sessionStorage.getItem("tenant_id") || "34234234",
        },
      })
        .then(function (response) {
          if (response.data.respResult === "1") {
            if (
              response.data.respData != null &&
              response.data.respData.length > 0
            ) {
              let data = response.data.respData;
              _this.cockpitForm.menuTreeList = data;
              if (data && data.length > 0) {
                _this.cockpitForm.menuTreeValue.push(data[0].menuId);
                _this.roleSelectedList = _this.allPublicRoleMap[data[0].menuId];
                _this.queryRoleList(data[0].menuId);
              }
            }
          } else {
            _this.$message.error(response.data.respErrorDesc);
          }
        })
        .catch(function (error) {
          console.error(error);
          // _this.$message.error(`获取发布路径失败`);
        });
    },
    //根据菜单id获取角色权限列表
    queryRoleList(menuId) {
      let _this = this;
      service({
        maskOff: true,
        url: `${this.renderEngine}/cockpit/getRoleListByPrivId/` + menuId,
        method: "get",
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id") || "9999012",
          "X-SystemId": this.defaultSystemId || "111",
          "X-TenantId":
            window.sessionStorage.getItem("tenant_id") + "" || "34234234",
        },
      })
        .then(function (response) {
          if (response.data.respResult === "1") {
            let resultList = [];
            let dataList = response.data.respData;
            dataList.forEach((roleInfo) => {
              resultList.push({
                label: roleInfo.roleName,
                key: roleInfo.roleId,
              });
            });
            _this.roleList = resultList;
          } else {
            _this.$message.error(response.data.respErrorDesc);
          }
        })
        .catch(function (error) {
          console.error(error);
          // _this.$message.error(`获取角色列表失败`);
        });
    },
    //发布驾驶舱
    cockpitPublic(param, status) {
      //status页面状态  0:未发布 1:已发布  2:已提交
      let appType = this.appType;
      let _this = this;
      service({
        maskOff: true,
        url: `${this.renderEngine}/cockpit/publishCockpit`,
        method: "post",
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id") || "9999012",
          "X-SystemId": this.defaultSystemId || "111",
          "X-TenantId":
            window.sessionStorage.getItem("tenant_id") + "" || "34234234",
        },
      })
        .then(function (response) {
          if (response.data.respResult === "1") {
            //发布应用不用更新page
            if (appType === "2") {
              _this.$message.success("应用发布成功");
              _this.reset();
              _this.setCockpitPubDialogVis(false);
              _this.$parent.search();
              return;
            }
            _this.updatePageInfo(param.pageId , '1');
            _this.reset();
            _this.setCockpitPubDialogVis(false);
            _this.$parent.search();
          } else {
            _this.$message.error(response.data.respErrorDesc);
          }
        })
        .catch(function (error) {
          console.error(error);
          // _this.$message.error(`操作失败`);
        });
    },
    updatePageInfo(pageId, status) {
      let pageParam = [];
      pageParam.push({
        pageId: pageId, //pageId唯一
        status: status,
      });
      let _this = this;
      this.pubPageInfo(pageParam)
        .then((val) => {
          if (val.status === 200 && val.data.respResult === "1") {
            _this.$message.success(
              status === "1" ? "驾驶舱发布成功" : "驾驶舱取消发布成功"
            );
          } else {
            _this.$message.success(
              status === "1" ? "驾驶舱发布失败" : "驾驶舱取消发布失败"
            );
          }
        })
        .catch((err) => {
          console.error(err);
        });
    },
    //获取驾驶舱配置列表
    getCockpitPublicInfo(pageId) {
      let _this = this;
      service({
        maskOff: true,
        url: `${this.renderEngine}/cockpit/getCockpitCfgByPageId/` + pageId,
        method: "get",
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id") || "9999012",
          "X-SystemId": this.defaultSystemId || "1016",
          "X-TenantId":
            window.sessionStorage.getItem("tenant_id") + "" || "34234234",
        },
      })
        .then(function (response) {
          if (response.data.respResult === "1") {
            let respData = response.data.respData;
            _this.cockpitForm.pageId = respData.pageId;
            _this.cockpitForm.pageName = respData.pageName;
            _this.cockpitForm.pageUrl = respData.pageUrl;
            if (respData.publishInfoList) {
              respData.publishInfoList.forEach((val) => {
                if (val.roleIdList && val.roleIdList.length > 0) {
                  _this.allPublicRoleMap[val.privId] = val.roleIdList;
                  _this.delCockpitVis = false;
                }
              });
              _this.roleSelectedMap = _this.allPublicRoleMap;
            }
          } else {
            _this.$message.error(response.data.respErrorDesc);
          }
        })
        .catch(function (error) {
          console.error(error);
        });
    },
  },
  mounted() {
    //获取当前页面的驾驶舱配置信息
    if (this.pageCache && this.pageCache.pageId) {
      this.getCockpitPublicInfo(this.pageCache.pageId);
    }
    //查询驾驶舱发布路径和角色权限列表
    this.querycockpitDialogData();
  },
};
</script>

<style lang="scss" scoped>
$border-clr01: #dcdfe6; // 边框色1
$main-color: #409eff; //主色调
$bg-clr01: #ecf5ff; // 块背景色1
$txt-clr01: #afc0d0; // 文字颜色1
$txt-clr02: #606266;
.condi-set-box {
  height: 300px;
  padding: 0;

  /deep/ .el-main {
    padding: 0;
  }

  /deep/ .el-header {
    padding: 0;
  }

  /deep/ .el-form-item__label {
    text-align: right;
  }

  .condi-aside {
    border-right: 1px dashed $border-clr01;

    .con-dataset {
      display: inline-block;
      width: 110px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 19px;
      vertical-align: -5px;
    }
  }

  .condi-main {
    padding-left: 20px;
    overflow: hidden;

    /deep/ .el-input-group {
      vertical-align: top;
    }
  }

  .field-list {
    width: 100%;
    height: 28px;
    border: 1px solid $border-clr01;
    border-radius: 3px;
    margin-bottom: 10px;
    line-height: 26px;
    text-align: left;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0 10px;
    font-size: 12px;

    &.active {
      border-color: $main-color;
      background-color: $bg-clr01;
      color: $main-color;
    }
  }
}

.interact-set-wrap {
  /deep/ .el-tabs__nav {
    margin-left: -131px;
    left: 50%;
  }

  .two-tab /deep/ .el-tabs__nav {
    margin-left: -83px;
  }

  /deep/ .el-tab-pane {
    .horizon-split-line {
      margin: 10px 0px 20px;
      border-bottom: 1px dashed $border-clr01;
    }

    & > .el-checkbox {
      height: 24px;
      line-height: 25px;
      margin-top: 4px;
      margin-bottom: 4px;
    }
  }

  /deep/ .el-tabs__header {
    margin: 0 0 10px;
  }

  /deep/ .el-checkbox,
  /deep/ .el-checkbox__label {
    font-size: 12px;
  }

  .check-item {
    display: inline-block;
    width: 50%;
    margin-bottom: 6px;

    &:nth-last-child(1),
    &:nth-last-child(2) {
      margin-bottom: 6px;
    }

    /deep/ span {
      font-size: 12px;
    }

    /deep/ .el-checkbox {
      margin-right: 10px;

      &.is-checked + .check-item-label {
        color: $main-color;
      }
    }

    &.hide-label {
      /deep/ .el-checkbox__label {
        display: none;
      }
    }

    .check-item-label {
      display: inline-block;
      width: 160px;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-all;
      white-space: nowrap;
      vertical-align: -3px;
      color: $txt-clr02;

      &.selected {
        color: $main-color;
      }
    }

    .check-item-icon {
      margin-left: 10px;
      cursor: pointer;
      color: $txt-clr02;

      &:hover {
        color: $main-color;
      }

      /deep/ .el-select {
        .el-input__inner {
          border: none;
          height: 17px;
          line-height: 17px;
          text-overflow: ellipsis;
        }
      }
    }
  }

  #secondCheckgroup .check-item-label {
    width: 130px;
  }

  .condi-main {
    margin-top: -9px;
  }

  .ds-title {
    color: $txt-clr02;
  }

  /deep/ .el-tab-pane {
    .tab-check-wrap {
      height: 200px;
      width: 100%;

      /deep/ .el-scrollbar {
        .el-scrollbar__wrap {
          overflow-x: hidden;
        }
      }
    }
  }

  /deep/ .el-transfer-panel__list.is-filterable {
    height: 126px;
    padding-top: 0;
  }

  /deep/ .el-transfer-panel {
    width: 270px;
  }
}
</style>
<style>
.interact-set-wrap
  .el-checkbox.is-checked
  + .check-item-label
  + .not-selected
  .el-select
  .el-select__caret::before {
  color: #f56c6c;
  animation: blink 3s linear infinite;
  /* 其它浏览器兼容性前缀 */
  -webkit-animation: blink 3s linear infinite;
  -moz-animation: blink 3s linear infinite;
  -ms-animation: blink 3s linear infinite;
  -o-animation: blink 3s linear infinite;
}

@-webkit-keyframes blink {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.interact-set-wrap .check-item-icon .el-select .el-input__icon {
  line-height: 17px;
  transform: rotateZ(180deg);
}
.el-input-pageName {
  width: 185px;
}
.el-input-pageUrl {
  width: 275px;
}
.publish-menus .el-form-item__label{
  width: 78px;
}
</style>




