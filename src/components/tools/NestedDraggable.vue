<template>
  <draggable
    class="dragArea wrap"
    tag="ul"
    :list="tasks"
    :sort="false"
    style="min-height:52px;"
    :group="{ name: 'people' }"
    :disabled="isFirstWrap"
    @add="AddToDragArea($event,parentTabInfo)"
    :move="itemOnMove2"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <li v-for="(item,index) in tasks" :key="item.id" class="box">
      <div
        class="tab-item dl_col"
        :tid="item.tab_id"
        @click.prevent="updateTopoTabActive(item.tab_id+'-'+item.tab_schema+'-'+item.tab_alias)"
        v-bind:class="{active:topoTabActive.split('-')[0]===item.tab_id && topoTabActive.split('-')[2]===item.tab_alias}"
      >
        <span class="col-span">
          <el-popover
            ref="popover2"
            placement="bottom"
            title
            width="216"
            trigger="click"
            offset="0"
            class="popover-wrapper"
          >
            <div class="popover2">
              <el-scrollbar>
                <div style="padding-right:10px;">
                  <el-checkbox
                    :indeterminate="isIndeterminate"
                    v-model="checkAll"
                    @change="emitHandleCheckAllChange"
                  >
                    <el-input
                      v-show="true"
                      placeholder="输入关键词搜索"
                      prefix-icon="el-icon-search"
                      class="ds-filter field-filter"
                      size="mini"
                      v-model="filterTabfieldText"
                      @input="fieldsChange"
                    ></el-input>
                  </el-checkbox>
                  <el-checkbox-group v-model="checkedFields">
                    <!--  item.element_name 为了兼容计算字段-->
                    <el-checkbox
                      v-for="item in fieldDatas"
                      :label="item.is_calcul == '0'?(item.col_chs_name || item.col_name):item.element_name"
                      :key="item.is_calcul == '0'?(item.col_chs_name || item.col_name):item.element_name"
                      @change="checked=>emitHandleCheckedFieldsChange(checked, item)"
                    >{{item.is_calcul == '0'?(item.col_chs_name || item.col_name):item.element_name}}</el-checkbox>
                  </el-checkbox-group>
                </div>
              </el-scrollbar>
            </div>
            <span @click="showCurFields(item)" slot="reference">
              <i class="tab-icon icon-A10465_Form" :class="'tab-icon icon-A10465_Form '+item.color"></i>
            </span>
          </el-popover>


           <!-- <span :title="(item.tab_schema?(item.tab_schema+'.'):'')+item.phy_tab_name">{{ item}}</span> -->
            <span v-if="item.flag === '1' || item.flag === undefined"  :title="(item.tab_schema?(item.tab_schema+'.'):'')+item.phy_tab_name">{{ (item.tab_schema?(item.tab_schema+'.'):'')+item.phy_tab_name }}</span>
            <span v-if="item.flag === '0'"  :title="item.tab_chs_name">{{ item.tab_chs_name || item.phy_tab_name}}</span>

        </span>

        <span style="float:right" class="right-opt-icon">
          <el-tooltip class="item" effect="dark" content="删除" placement="top-start">
            <i
              class="delete-icon icon-A10065_delete"
              @click.prevent="deleteItem(item)"
              :id="'auto_task_del'+index"
            ></i>
          </el-tooltip>
        </span>
        <!-- 关联类型（1：inner_join，2：left_join ，3：right_join） -->
        <span class="opt-outer-wrap">
          <span
            class="opt conn-icon"
            @click="updateConn(item,parentTabInfo || {},$event)"
            :class="{'dis-connect':item.tab_join_exp_list!= undefined && item.tab_join_exp_list.length==0,'inner-connect':item.join_type==1}"
          >
            <i :class="{'active':item.join_type==1 || item.join_type==2 || item.join_type==6 || item.join_type==''}"></i>
            <i :class="{'active':item.join_type==1 || item.join_type==3 || item.join_type==6}"></i>
          </span>
          <span
            v-show="item.join_type==1"
            class="opt inner-join-icon"
            :class="{'dis-connect':item.tab_join_exp_list!= undefined && item.tab_join_exp_list.length==0}"
          ></span>
        </span>
      </div>
      <nested-draggable
        :tasks="item.tab_rel_list||[]"
        :parentTabInfo="{tab_id: item.tab_id,tab_alias:item.tab_alias,tab_chs_name: item.tab_chs_name,phy_tab_name: item.phy_tab_name,rel_tab_id:parentTabInfo.tab_id || '',rel_tab_alias:parentTabInfo.tab_alias,join_type: item.join_type,tab_join_exp_list: item.tab_join_exp_list,tab_rel_list: item.tab_rel_list,color:item.color|| ''}"
        v-bind="$attrs"
        v-on="$listeners"
      />
    </li>
  </draggable>
</template>
<script>
import draggable from "vuedraggable";
import eventBus from "../../plugins/transData.js";
import { mapState, mapActions } from "vuex";
export default {
  props: {
    tasks: {
      required: true,
      type: Array
    },
    isFirstWrap: {
      //最外层---主表不可更改
      default: false,
      type: Boolean
    },
    parentTabInfo: {
      type: Object
    }
  },
  components: {
    draggable
  },
  data() {
    return {
      showTypeArr: {
        "2": "col_chs_name",
        "1": "col_name",
        "0": "element_name"
      }
    };
  },
  name: "nested-draggable",
  methods: {
    deleteItem(item, index) {
      eventBus.$emit("executeDeleteTabItem", { item: item });
    },
    emitHandleCheckAllChange(val) {
      this.$emit("emitTabCkEvent", {
        type: 3,
        param: val
      });
    },
    emitHandleCheckedFieldsChange(checked, data) {
      this.$emit("emitTabCkEvent", {
        type: 2,
        param: {
          checked: checked,
          data: data
        }
      });
      this.updateCheckAllState();
    },
    AddToDragArea(evt, parentObj) {

      /**
       * evt.to;    // target list
		evt.from;  // previous list
		evt.oldIndex;  // element's old index within old parent
		evt.newIndex;  // element's new index within new parent
		evt.oldDraggableIndex; // element's old index within old parent, only counting draggable elements
		evt.newDraggableIndex; // element's new index within new parent, only counting draggable elements
		evt.clone // the clone element
		evt.pullMode;  // when item is in another sortable: `"clone"` if cloning, `true` if moving
       */
      var curTabItem = evt.item._underlying_vm_;
      if (evt.from.className.indexOf("dragArea wrap") > -1) {
        //在拓扑图区域拖拉移动实体
        this.$emit("emitUpdateTabsRelation", {
          tabId: curTabItem.tab_id,
          key: curTabItem.tab_alias,
          parentKey: parentObj.tab_alias,
          parentTabId: parentObj.tab_id
        });
      } else {
        //从左侧拖实体进来
        this.$emit("emitQueryTabFields", {
          tabId: curTabItem.tab_id,
          key: curTabItem.tab_alias,
          clrClass: curTabItem.color,
          parentKey: parentObj.tab_alias
        });
      }
      this.updateTopoTabActive(curTabItem.tab_id + '-' + curTabItem.tab_schema + '-' + curTabItem.tab_alias);
    },
    updateConn(selfTabInfo, parentInfo, evt) {
      evt.stopPropagation();
      var oriTop = document.querySelector("#relationSet").style.top,
        oriLeft = document.querySelector("#relationSet").style.left;
      if (oriTop) {
        oriTop = oriTop.substring(
          0,
          oriTop.indexOf("px") > -1 ? oriTop.indexOf("px") : oriTop.length
        );
        oriLeft = oriLeft.substring(
          0,
          oriLeft.indexOf("px") > -1 ? oriLeft.indexOf("px") : oriLeft.length
        );
      }
      if (
        !this.connPopVisible ||
        (Math.abs(evt.clientY - parseInt(oriTop)) < 20 &&
          Math.abs(evt.clientX - parseInt(oriLeft)) < 20)
      ) {
        document.querySelector("#relationSet").style.top = evt.clientY + "px";
        document.querySelector("#relationSet").style.left = evt.clientX + "px";
        this.updateConnPopVisible(!this.connPopVisible);
      } else {
        this.updateConnPopVisible(!this.connPopVisible);
        this.$nextTick(() => {
          document.querySelector("#relationSet").style.top = evt.clientY + "px";
          document.querySelector("#relationSet").style.left =
            evt.clientX + "px";
          // this.updateConnPopVisible(!this.connPopVisible);
        });
      }
      this.updateActiveConn(selfTabInfo.join_type || "2");
      this.updateCurSelConnInfo({
        parent: parentInfo,
        child: selfTabInfo
      });
      this.$emit("emitConnSelOptions", { parentInfo, selfTabInfo });
      this.updateJoinExpList(selfTabInfo.tab_join_exp_list || []);
    },
    showCurFields(item) {
      this.$emit("emitTabCkEvent", {
        type: 1,
        param: item
      });
    },
    ...mapActions({
      updateTopoTabActive: "DataSetDesign/updateTopoTabActive",
      updateCheckedFields: "DataSetDesign/updateCheckedFields",
      updateCheckAll: "DataSetDesign/updateCheckAll",
      updateIsIndeterminate: "DataSetDesign/updateIsIndeterminate",
      updateFilterTabfieldText: "DataSetDesign/updateFilterTabfieldText",
      updateFieldDatas: "DataSetDesign/updateFieldDatas",
      updateConnLeftSelOption: "DataSetDesign/updateConnLeftSelOption",
      updateConnRightSelOption: "DataSetDesign/updateConnRightSelOption",
      updateJoinExpList: "DataSetDesign/updateJoinExpList",
      updateCurSelConnInfo: "DataSetDesign/updateCurSelConnInfo",
      updateActiveConn: "DataSetDesign/updateActiveConn",
      updateConnPopVisible: "DataSetDesign/updateConnPopVisible"
    }),
    itemOnMove2(evt) {
      // return false; — for cancel
      // return -1; — insert before target
      // return 1; — insert after target
      // 限制不能A连A
      if (
        evt.to &&
        evt.to.parentNode &&
        evt.to.parentNode.children &&
        evt.to.parentNode.children.length > 0 &&
        evt.draggedContext.element.tab_id ==
          evt.to.parentNode.children[0].getAttribute("tid")
      ) {
        return false;
      }
    },
    fieldsChange(val) {
      val = val.trim().toLocaleLowerCase();
      if (val == "") {
        this.updateFieldDatas(this.fieldDatasOri);
      } else {
        var fieldDatas = this.fieldDatasOri.filter(item => {
          let label = item.col_chs_name || item.col_name;
          if (item.is_calcul == "1") {
            label = item.element_name;
          }
          return label.toLocaleLowerCase().indexOf(val) > -1;
        });
        this.updateFieldDatas(fieldDatas);

      }
      this.updateCheckAllState();
    },
    updateCheckAllState() {
      var checkedCount = 0;
      if (this.filterTabfieldText.trim() == "") {
        checkedCount = this.checkedFields.length;
      } else {
        var val = this.filterTabfieldText.toLocaleLowerCase();
        var checkedfieldDatas = this.checkedFields.filter(item => {
          return item.toLocaleLowerCase().indexOf(val) > -1;
        });
        checkedCount = checkedfieldDatas.length || 0;
      }
      this.updateIsIndeterminate(
        checkedCount > 0 && checkedCount < this.fieldDatas.length
      );
      this.updateCheckAll(checkedCount === this.fieldDatas.length);
    }
  },
  computed: {
    ...mapState({
      topoTabActive: state => state.DataSetDesign.topoTabActive,
      fieldDatas: state => state.DataSetDesign.fieldDatas,
      fieldDatasOri: state => state.DataSetDesign.fieldDatasOri,
      isIndeterminate: state => state.DataSetDesign.isIndeterminate,
      allFieldsMap: state => state.DataSetDesign.allFieldsMap,
      connPopVisible: state => state.DataSetDesign.connPopVisible
    }),
    checkedFields: {
      get: function() {
        return this.$store.state.DataSetDesign.checkedFields;
      },
      set: function(newValue) {
        this.updateCheckedFields(newValue);
      }
    },
    checkAll: {
      get: function() {
        return this.$store.state.DataSetDesign.checkAll;
      },
      set: function(newValue) {
        this.updateCheckAll(newValue);
      }
    },
    filterTabfieldText: {
      get: function() {
        return this.$store.state.DataSetDesign.filterTabfieldText;
      },
      set: function(newValue) {
        this.updateFilterTabfieldText(newValue);
      }
    }
  }
};
</script>
<style scoped lang="scss">
$main-bg: #2f5377; //设计区域背景色
$font-main2: #afc0d0;
$hight-light-clr1: #45fffd; //高亮颜色
$main-color: #409eff; //主色调
$bg-clr1: #e4e7ee;
$font-main3: #606266;
$main-bg1: #fff; // 设计区域内层背景
$bd-clr1: #dcdfe6;
.dragArea {
  min-width: 100px;
}
.tab-item {
  position: relative;
  display: inline-block;
  vertical-align: top;

  .opt-outer-wrap {
    position: absolute;
    z-index: 10;
    left: -56px;
    top: 50%;
    width: 26px;
    height: 26px;
    line-height: 26px;
    margin-top: -13px;
  }
}
.wrap {
  position: relative;
  display: inline-block;
  vertical-align: top;
  overflow-y: hidden;
  // overflow: hidden;
  // margin-left: -4px;
  .box {
    white-space: nowrap;
    padding-right: 3px;
    margin-left: 115px; //50px
    .tab-item {
      position: relative;
      height: 32px;
      line-height: 30px;
      width: 210px;
      margin-bottom: 5px;
      border: 1px solid $bg-clr1;
      border-radius: 4px;
      font-size: 12px;

      cursor: pointer;
      color: $font-main3;
      background: $main-bg1;
      padding: 0 10px;
      white-space: nowrap;
      .col-span {
        display: inline-block;
        width: 170px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        word-break: break-all;
        height: 30px;
        line-height: 30px;
        & > span:first-child {
          margin-right: 10px;
          display: inline-block;
        }
        & > span:last-child {
          display: inline-block;
          width: 148px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          word-break: break-all;
          margin-left: 10px;
        }
        /deep/.el-popover__reference span:last-child {
          margin-left: 5px;
          display: inline-block;
          width: 145px;
          vertical-align: top;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          word-break: break-all;
        }
      }
      &.active,
      &:hover {
        border: 1px dashed $main-color;
        background: rgba($main-color, 0.15);
        & > .right-opt-icon {
          display: inline;
        }
      }
      & > .right-opt-icon {
        display: none;
      }

      i {
        color: $main-color;
      }
      .tab-icon {
        position: absolute;
        top: 10px;
        cursor: pointer;
        display: inline-block;
        &.clr0 {
          color: #409eff;
        }
        &.clr1 {
          color: #67c23a;
        }
        &.clr2 {
          color: #a827f2;
        }
        &.clr3 {
          color: #b9a100;
        }
        &.clr4 {
          color: #e77645;
        }
        &.clr5 {
          color: #ff0000;
        }
        &.clr6 {
          color: #00b595;
        }
        &.clr7 {
          color: #736cff;
        }
      }
    }

    &:first-child > .tab-item:before {
      position: absolute;
      z-index: 200;
      top: -3px; //-1  -3
      left: -89px;
      width: 1px;
      height: 17px; //20  17
      background: #fff;
      content: "";
    }
    &:first-child > .tab-item:after {
      position: absolute;
      top: 14px;
      left: -120px;
      width: 120px;
      border-top: 1px solid #dedede;
      content: "";
    }
    & + .box > .tab-item:after {
      position: absolute;
      top: 4px;
      left: -89px;
      width: 87px;
      height: 10px;
      border: 1px solid #dedede;
      border-width: 0 0 1px 1px;
      border-bottom-left-radius: 10px;
      content: "";
    }
    & + .box > .tab-item:before {
      position: absolute;
      left: -89px;
      top: -10000px;
      bottom: 22px;
      border-left: 1px solid #dedede;
      content: "";
    }

    & + .box {
      & > .tab-item {
        & > .conn-icon {
          line-height: 34px;
        }
      }
    }
  }
}

.popover2 {
  height: 220px;
  overflow: hidden;
  margin: 3px -5px 3px 7px;
}
.popover2 /deep/ .el-checkbox {
  max-width: 100%;
  display: block;
  margin-right: 0;
  height: 30px;
}
.popover2 /deep/ .el-checkbox__label {
  font-size: 12px;
}
.popover2 /deep/ .el-checkbox__inner {
  width: 12px;
  height: 12px;
  line-height: 12px;
}
.popover2 /deep/ .el-checkbox__inner::after {
  left: 3px;
  top: 0;
}
.popover2 /deep/ .el-checkbox__input {
  margin-top: 3px;
}
.popover2 /deep/ .el-checkbox__label {
  max-width: calc(100% - 15px);
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
  display: inline-block;
}
.popover2 /deep/ .el-scrollbar {
  height: 220px;
}
.popover2 /deep/ .el-scrollbar__wrap {
  overflow-y: scroll;
  overflow-x: auto;
}

// 连接图标
.opt {
  position: relative;
  // position: absolute;
  // left: -56px;
  // top: 50%;
  // margin-top: -13px;
  z-index: 9;
  width: 26px;
  height: 26px;
  line-height: 26px;
  text-align: center;
  background: $main-bg1;
  cursor: pointer;
  & > i {
    position: relative;
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 1px solid $main-color;
    background-color: $main-bg1;
    border-radius: 50%;
    opacity: 0.7;
    &.active {
      background-color: rgba($main-color, 0.2);
    }
    &:last-child {
      margin-left: -5px;
    }
  }
  &.dis-connect > i {
    border: 1px solid #f56c6c;
    &.active {
      background-color: $main-bg1;
    }
  }
  &.inner-connect > i {
    &.active {
      background-color: $main-bg1;
    }
  }
  &.inner-join-icon {
    display: inline-block;
    width: 4px;
    height: 7px;
    // left: -45px;
    // top: 50%;
    // margin-top: -5px;
    left: -12px;
    top: -2px;
    z-index: 30;
    border-radius: 7px;
    background-color: #badcff; //0.2
    &.dis-connect {
      display: none;
    }
  }
}
</style>
<style>
</style>
