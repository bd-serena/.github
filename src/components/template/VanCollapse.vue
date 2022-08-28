<template>
  <div class="collapse-wrap" style="height:100%">
    <van-collapse
      v-model="vscompt.comptAttrs.editableTabsValue"
      accordion
      ref="collapse"
      @change="collapseActive($event)"
    >
      <van-collapse-item
        v-for="item in vscompt.comptAttrs.editableTabs"
        :key="item.name"
        :name="item.name"
        :title="item.title"
      >
        <div slot="icon">
          <span class="collapse-title-icon icon-A10061_strip"></span>
        </div>
        <div class="has-compt" v-if="item.comptList.length>0">
          <grid-layout
            :layout="layout"
            :col-num="24"
            :row-height="1"
            :is-draggable="dragAndResize"
            :is-resizable="dragAndResize"
            :is-mirrored="false"
            :vertical-compact="true"
            :use-css-transforms="true"
          >
            <grid-item
              v-for="(sub,idx) in item.comptList"
              :class="{'active':sub.comptId===activedBlock}"
              :key="sub.comptId"
              :x="sub.blockInfo.x"
              :y="sub.blockInfo.y"
              :w="sub.blockInfo.w"
              :h="sub.blockInfo.h"
              :i="sub.comptId"
              :maxW="28"
              :minH="2"
              :minW="2"
              @resized="resizedEvent"
            >
              <div
                style="height:100%;overflow:hidden;position:relative"
                :style="setHeaderStyle(sub)"
                @click.stop="upBlock(sub.comptId)"
              >
                <div
                  class="compt-title"
                  v-if="isShowName(sub)"
                  :style="setFontStyle(sub)"
                >{{sub.comptAttrs.extendSetting['comptName.text']}}</div>
                <div :class="{'no-title':isShowName(sub)==false,'has-title':isShowName(sub)==true}">
                  <Cell
                    :style="setBgStyle(sub)"
                    :isDesign="true"
                    :vscompt="sub"
                    :id="'main'+sub.orderId"
                    v-loading="sub.comptAttrs.loading"
                  />
                  <div
                    class="compt-nodata-tip"
                    v-show="sub.comptAttrs.isBindData=='1' && !sub.comptAttrs.isLoadData"
                  >
                    <span class="msg-tip">{{!!sub.comptAttrs.queryInfo ? sub.comptAttrs.queryInfo : sub.comptAttrs.name + '：请设置维度或度量'}}</span>
                  </div>
                </div>
                <el-dropdown size="mini" class="block-menu" trigger="click">
                  <span class="el-dropdown-link">...</span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item
                      v-show="sub.type!='VanCollapse'"
                      @click.native="comptCopy(sub)"
                    >复制</el-dropdown-item>
                    <el-dropdown-item @click.native="deleteCompt(sub.comptId)">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </grid-item>
          </grid-layout>
        </div>
        <div v-else class="no-compt">
          <span class="msg-tip">请拖入组件</span>
        </div>
      </van-collapse-item>
    </van-collapse>
  </div>
</template>

<script>
import Cell from "../design/Cell.vue";
import VueGridLayout from "vue-grid-layout";
import { mapState, mapGetters, mapMutations, mapActions } from "vuex";
import { windowResize } from "../../utils/comonFunc.js";
import eventBus from "../../plugins/transData.js";
import ComptMixins from "../../utils/comptMixins";
export default {
  props: ["vscompt"],
  components: {
    Cell,
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem
  },
  mixins: [ComptMixins],
  data() {
    return {};
  },
  mounted() {
    this.$refs.collapse.$children.forEach((item, index) => {
      this.vscompt.comptAttrs.editableTabs[index].expanded = item.expanded;
    });
    if (!this.vscompt.comptAttrs.contentHeight) {
      this.setContentHeight();
    }
    this.setContentStyle();
    this.changeCollapse();
  },
  watch: {
    "vscompt.comptAttrs.editableTabs": {
      handler() {
        this.changeCollapse();
        this.setTabStyle();
      }
    },
    "vscompt.comptAttrs.extendSetting": {
      handler(extendSetting) {
        // this.vscompt.comptAttrs.expandAction = true;
        this.setTabStyle();
        this.setContentStyle();
      },
      deep: true,
      immediate: true
    },
    "vscompt.comptAttrs.adjustCollapse": {
      handler() {
        this.changeCollapse();
        this.vscompt.comptAttrs.adjustCollapse = false;
      }
    },
    "vscompt.blockInfo.h": {
      handler(blockH) {
        this.$nextTick(() => {
          if (blockH < this.vscompt.comptAttrs.tabHeight) {
            this.vscompt.blockInfo.h = this.vscompt.comptAttrs.tabHeight;
          }
          if (!this.vscompt.comptAttrs.expandAction) {
            this.setContentHeight();
          }
          this.setContentStyle();
          this.vscompt.comptAttrs.expandAction = false;
        });
      }
    },
    comptNameShow:{
      handler(show) {
        this.vscompt.comptAttrs.expandAction = true;
        if (show == true) {
          this.vscompt.comptAttrs.tabHeight = 7;
          this.vscompt.comptAttrs.contentHeight -= 1.8;
          if (this.vscompt.blockInfo.h < 7) {
            this.vscompt.blockInfo.h = 7;
          }
        } else {
          this.vscompt.comptAttrs.tabHeight = 5.2;
          this.vscompt.comptAttrs.contentHeight += 1.8;
          if (this.vscompt.blockInfo.h < 5.2 || this.vscompt.blockInfo.h == 7) {
            this.vscompt.blockInfo.h = 5.2;
          }
        }
      },
      deep: true,
      immediate: false
    }
  },
  computed: {
    dragAndResize() {
      let flag = false;
      if (this.pageCache.operation == "design") {
        flag = true;
      }
      return flag;
    },
    layout() {
      let result = [];
      let i = this.vscompt.comptAttrs.editableTabsValue;
      let list = [];
      for (let tab of this.vscompt.comptAttrs.editableTabs) {
        if (tab.name == i) {
          list = tab.comptList;
          break;
        }
      }
      if (list.length > 0) {
        for (var item of list) {
          result.push(item.blockInfo);
        }
      }
      return result;
    },
    comptNameShow(){
      return this.vscompt.comptAttrs.extendSetting["comptName.show"];
    },
    ...mapState({
      activedBlock: state => state.PageDesign.activedBlock,
      activedTab: state => state.PageDesign.activedTab,
      pageCache: state => state.HomeBody.pageCache
    }),
    ...mapGetters({
      activedCompt: 'PageDesign/getActivedCompt'
    })
  },
  methods: {
    changeCollapse() {
      this.$nextTick(() => {
        this.$refs.collapse.children.forEach((item1, index1) => {
          this.vscompt.comptAttrs.editableTabs.forEach((item2, index2) => {
            if (item2.name == item1.name && item2.show) {
              this.$refs.collapse.children[index1].$el.style.display = "";
            } else if (item2.name == item1.name && item2.show == false) {
              this.$refs.collapse.children[index1].$el.style.display = "none";
            }
          });
        });
      });
      windowResize();
    },
    isShowName(compt) {
      let result = false;
      let setting = compt.comptAttrs.extendSetting;
      if (setting != null) {
        if (setting["comptName.show"] == true) {
          result = true;
        }
      }
      return result;
    },
    upBlock(id) {
      let tabId = this.vscompt.comptAttrs.editableTabsValue;
      let list = [];
      for (let tab of this.vscompt.comptAttrs.editableTabs) {
        if (tab.name == tabId) {
          list = tab.comptList;
          break;
        }
      }
      for (var compt of list) {
        if (compt.comptId == id) {
          this.upActivedTab(list);
          this.upActivedBlock(id);
          this.upActivedId(compt);
          // 未比对过第一次需要比对
          if (!this.activedCompt.updated) {
            this.updateCompt(this.activedCompt, this.pageCache.classTypeId);
          }
          // 对于有绑定数据的组件，点击默认展示数据面板，对于只有样式设置的组件默认展示样式面板
          this.$nextTick(() => {
            this.refreshRightPanel();
          });
          break;
        }
      }
    },
    resizedEvent() {
      windowResize();
    },
    handleClick() {
      this.$nextTick(() => {
        windowResize();
      });
    },
    comptCopy(compt) {
      let activedTab = this.activedTab;
      eventBus.$emit("addTabCompt", activedTab, compt);
    },
    deleteCompt(id) {
      let activedTab = this.activedTab;
      eventBus.$emit("deleteTabCompt", activedTab, id);
    },
    collapseActive(tab) {
      let that=this;
      setTimeout(() => {
        let containerHeight = 0;
        this.$refs.collapse.$children.forEach((item1, index1) => {
          if (item1.expanded) {
            // containerHeight += 28;
            containerHeight = this.vscompt.comptAttrs.oldGridH;
          } else {
            let oldGridH = this.vscompt.blockInfo.h;
            this.$set(this.vscompt.comptAttrs,'oldGridH',oldGridH);
            containerHeight += 5.2;
          }
          this.vscompt.comptAttrs.editableTabs.forEach((item2, index2) => {
            if (item2.name == item1.name) {
              item2.expanded = item1.expanded;
            }
          });
        });
        this.vscompt.blockInfo.h = containerHeight;
        // that.vscompt.comptAttrs.expandAction = true;
        // let containerHeight = 0;
        // that.$refs.collapse.$children.forEach((item1, index1) => {
        //   if (item1.expanded) {
        //     containerHeight +=
        //       that.vscompt.comptAttrs.contentHeight +
        //       that.vscompt.comptAttrs.tabHeight;

        //   } else {
        //     containerHeight += that.vscompt.comptAttrs.tabHeight;
        //   }
        //   that.vscompt.comptAttrs.editableTabs.forEach((item2, index2) => {
        //     if (item2.name == item1.name) {
        //       item2.expanded = item1.expanded;
        //     }
        //   });
        // });
        // that.vscompt.blockInfo.h = containerHeight;
        that.setContentStyle();
        windowResize();
      }, 0);
    },
    setTabStyle() {
      this.$nextTick(() => {
        let nodes = this.$refs.collapse.$el.childNodes;
        for (let i = 0; i < nodes.length; i++) {
          nodes[i].querySelector(
            ".van-collapse-item__title"
          ).style.backgroundColor = this.vscompt.comptAttrs.extendSetting.titleBgColor;
          nodes[i].querySelector(
            ".van-collapse-item__title"
          ).style.color = this.vscompt.comptAttrs.extendSetting.titleFontColor;
        }
      });
    },
    setContentStyle() {
      this.$nextTick(() => {
        let nodes = this.$refs.collapse.$el.childNodes;
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].querySelector(".van-collapse-item__content")) {
            nodes[i].querySelector(
              ".van-collapse-item__content"
            ).style.backgroundColor = this.vscompt.comptAttrs.extendSetting.panelBgColor;
            nodes[i].querySelector(".van-collapse-item__content").style.height =
              this.vscompt.comptAttrs.contentHeight * 11 + "px";
          }
        }
      });
    },
    setContentHeight() {
      this.vscompt.comptAttrs.contentHeight =
        this.vscompt.blockInfo.h -
        this.vscompt.comptAttrs.editableTabs.length *
          this.vscompt.comptAttrs.tabHeight;
    },
    ...mapMutations({
      upActivedId: "PageDesign/upActivedId",
      upActivedBlock: "PageDesign/upActivedBlock",
      upActivedTab: "PageDesign/upActivedTab"
    }),
    ...mapActions({
      refreshRightPanel: "PageDesign/refreshRightPanel"
    })
  }
};
</script>

<style lang="scss" scoped>
$border1: #afc0d0; // 边框色1
$main-color: #409eff; //主色调
.has-compt,
.no-compt {
  height: 100%;
  .msg-tip {
    display: block;
    text-align: center;
    font-size: 20px;
    color: #ccc;
    position: relative;
    top: 50%;
  }
}
.vue-grid-item {
  border: 1px dashed $border1;
  // overflow: auto
  &.active {
    border: 1px dashed $main-color;
  }

  &:hover {
    box-shadow: 0 0 3px 3px rgba(204, 204, 204, 0.7);
  }
}

.compt-nodata-tip {
  position: absolute;
  top: 0;
  left: 0px;
  right: 0px;
  color: #ccc;
  font-size: 12px;
  background: #fff;
  height: 100%;
  text-align: center;
  span {
    font-size: 20px;
    display: block;
    position: relative;
    top: 50%;
    transform: translateY(-50%);
  }
}
.compt-title {
  color: #333;
  font-size: 16px;
  padding-top: 3px;
  padding-left: 20px;
  padding-bottom: 3px;
  text-align: left;
  border-bottom: 1px solid #DCDFE6;
  position: relative;
  &::before {
    content: '';
    width: 4px;
    height: 65%;
    position: absolute;
    top: 20%;
    left: 5px;
    background: #409EFF;
    border-radius: 20px;
  }
}
.no-title {
  height: 100%;
}
.has-title {
  height: 100%;
  margin-top: -30px;
  padding-top: 30px;
}
.block-menu {
  position: absolute;
  top: 0;
  right: 5px;
  cursor: pointer;
  color: $main-color;
  width: 6px;
  height: 20px;
  padding: 0 5px;
  .el-dropdown-link {
    display: block;
    word-break: break-word;
    line-height: 5px;
  }
}
.collapse-wrap {
  /deep/div[class^='van-collapse'] {
    height: 100%;
  }
  /deep/ div .van-collapse-item__wrapper {
    height: calc(100% - 35px);
  }
}
.van-collapse {
  /deep/ .van-collapse-item {
    .van-collapse-item__title {
      padding: 5px 0;
      &:not(:last-child)::after {
        left: 0;
        border-color: $border1;
      }
      .collapse-title-icon {
        color: $main-color;
      }
      .van-cell__right-icon {
        margin-right: 10px;
      }
    }
    .van-collapse-item__content {
      padding: 0;
    }
  }
  &::after {
    border: none;
  }
}
</style>
