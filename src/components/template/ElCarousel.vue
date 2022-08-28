<template>
  <div :class="{'block':true,'pc-block':pageCache.classTypeId != '1005'}" style="height:100%">
    <el-carousel data-v="123" ref="carousel" trigger="click" :autoplay="vscompt.comptAttrs.extendSetting.autoplay" :direction="vscompt.comptAttrs.extendSetting.direction" @change="pageChange">
      <el-carousel-item v-for="item in vscompt.comptAttrs.editableTabs" :key="item.name">
        <div class="has-compt" v-if="item.comptList.length>0">
          <div v-if="pageCache.classTypeId != '1005'">
            <grid-layout
              :layout="layout"
              :col-num="24"
              :row-height="1"
              :is-draggable="dragAndResize"
              :is-resizable="dragAndResize"
              :is-mirrored="false"
              :vertical-compact="true"
              :use-css-transforms="false"
            >
              <grid-item
                v-for="(sub,idx) in item.comptList"
                :class="{'active':sub.comptId===activedBlock}"
                :key="sub.comptId"
                :x="sub.blockInfo.x"
                :y="sub.blockInfo.y"
                :w="sub.blockInfo.w"
                :h="sub.blockInfo.h"
                :minH="2"
                :minW="2"
                :i="sub.comptId"
                @resized="pcResizedEvent"
              >
                <div
                  style="height:100%; overflow:hidden;"
                  :style="setHeaderStyle(sub)"
                  @click.stop="upBlock(sub.comptId)"
                >
                  <div
                    class="compt-title"
                    v-if="isShowName(sub)"
                    :style="setFontStyle(sub)"
                    style="border-bottom: 1px solid #DCDFE6;"
                  >{{sub.comptAttrs.extendSetting['comptName.text']}}</div>
                  <div
                    :class="{'no-title':isShowName(sub)==false,'has-title':isShowName(sub)==true}"
                  >
                    <Cell
                      :style="setBgStyle(sub)"
                      :isDesign="true"
                      :vscompt="sub"
                      :id="'main'+sub.orderId"
                      v-loading="sub.comptAttrs.loading"
                    ></Cell>
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
                        v-show="sub.type!='ElTabs'"
                        @click.native="comptCopy(sub)"
                      >复制</el-dropdown-item>
                      <el-dropdown-item @click.native="deleteCompt(sub.comptId)">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </div>
              </grid-item>
            </grid-layout>
          </div>
          <div v-if="pageCache.classTypeId === '1005'">
            <bd-draggable-resizable
              v-for="(sub,idx) in item.comptList"
              :class="{'active':sub.comptId===activedBlock}"
              :active="sub.comptId==activedCompt.comptId"
              :key="sub.comptId"
              :x="sub.blockInfo.x"
              :y="sub.blockInfo.y"
              :w="sub.blockInfo.w"
              :h="sub.blockInfo.h"
              :min-width="22"
              :min-height="20"
              :grid="[1,1]"
              :draggable="dragAndResize"
              @resizing="hdResizedEvent"
              @dragging="dragEvent"
              @activated="onActivated(sub.comptId)"
              @deactivated="onDragstop"
              :scaleRatio="scaleRatio"
            >
              <div
                style="position:relative;height:100%; overflow:hidden;"
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
                  ></Cell>
                  <div
                    class="compt-nodata-tip"
                    v-show="sub.comptAttrs.isBindData=='1' && !sub.comptAttrs.isLoadData && (sub.comptData == undefined ||  (sub.comptData.rows.length == 0 && sub.comptData.columns.length == 0))  || (sub.type == 'MobileQuery' && sub.comptAttrs.fieldList.length == 0)"
                  >
                    <span class="msg-tip">{{!!sub.comptAttrs.queryInfo ? sub.comptAttrs.queryInfo : sub.comptAttrs.name + '：请设置维度或度量'}}</span>
                  </div>
                </div>
                <el-dropdown size="mini" class="block-menu" trigger="click">
                  <span class="el-dropdown-link">...</span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-show="sub.type!='ElTabs'" @click.native="comptCopy(sub)">复制</el-dropdown-item>
                    <el-dropdown-item @click.native="deleteCompt(sub.comptId)">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </bd-draggable-resizable>
          </div>
        </div>
        <div v-else class="no-compt">
          <span class="msg-tip">请拖入组件</span>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>
<script>
import Cell from "../design/Cell.vue";
import { mapState, mapGetters, mapMutations, mapActions } from "vuex";
import VueGridLayout from "vue-grid-layout";
import { windowResize } from "../../utils/comonFunc.js";
import eventBus from "../../plugins/transData.js";
import BdDraggableResizable from "bd-draggable-resizable";
import DragResizeMixins from "../../utils/dragResizeMixins.js";
import ComptMixins from "../../utils/comptMixins";

export default {
  props: ["vscompt", "scaleRatio"],
  components: {
    Cell,
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    BdDraggableResizable
  },
  mixins: [DragResizeMixins,ComptMixins],
  data() {
    return {
      tabSubCompt: null
    };
  },
  computed: {
    direction() {
      return this.vscompt.comptAttrs.extendSetting.direction;
    },
    pageShow() {
      return this.vscompt.comptAttrs.extendSetting.pageShow;
    },
    pageStyle() {
      return this.vscompt.comptAttrs.extendSetting.pageStyle;
    },
    layout() {
      let result = [];
      let i = this.vscompt.comptAttrs.editableTabsValue;
      let list = [];
      list = this.vscompt.comptAttrs.editableTabs[i].comptList;
      if (list.length > 0) {
        for (var item of list) {
          result.push(item.blockInfo);
        }
      }
      return result;
    },
    ...mapState({
      activedBlock: state => state.PageDesign.activedBlock,
      activedTab: state => state.PageDesign.activedTab,
      pageCache: state => state.HomeBody.pageCache,
      s_edcuiCompts: state => state.PageDesign.s_edcuiCompts
    }),
    ...mapGetters({
      activeComptIdx: "PageDesign/activeComptIdx",
      activedCompt: "PageDesign/getActivedCompt"
    })
  },
  mounted() {
    this.indicatorToggle(this.pageShow);
    this.showPageStyle(this.pageStyle);
  },
  watch: {
    direction() {
      this.$nextTick(()=>{
        this.$refs.carousel.resetItemPosition();
      })
    },
    pageShow(val) {
      this.indicatorToggle(val);
    },
    pageStyle(val){
      this.showPageStyle(val);
    },
    "vscompt.comptAttrs.editableTabs"(){
      this.showPageStyle(this.pageStyle);
    }
  },
  methods: {
    ...mapMutations({
      upActivedId: "PageDesign/upActivedId",
      upActivedBlock: "PageDesign/upActivedBlock",
      upActivedTab: "PageDesign/upActivedTab"
    }),
    ...mapActions({
      refreshRightPanel: "PageDesign/refreshRightPanel"
    }),
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
      list = this.vscompt.comptAttrs.editableTabs[tabId].comptList;
      for (var compt of list) {
        if (compt.comptId == id) {
          this.upActivedTab(list);
          this.upActivedBlock(id);
          this.upActivedId(compt);
          this.tabSubCompt = compt;
          this.commonFillback();  //公共高度宽度回填
          // 未比对过第一次需要比对
          if(!this.activedCompt.updated) {
            this.updateCompt(this.activedCompt,this.pageCache.classTypeId);
          }
          // 对于有绑定数据的组件，点击默认展示数据面板，对于只有样式设置的组件默认展示样式面板
          this.$nextTick(() => {
            this.refreshRightPanel();
          });
          break;
        }
      }
    },
    pageChange(val) {
      this.vscompt.comptAttrs.editableTabsValue = val;
    },
    pcResizedEvent() {
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
    indicatorToggle(val){
      let dom = this.$el;
      let wrap = dom.querySelector(".el-carousel");
      if(val){//显示
        wrap.setAttribute("no-indicators","true");
      }else{//隐藏
        wrap.setAttribute("no-indicators","false");
      }
    },
    showPageStyle(val){
      let dom = this.$el;
      this.$nextTick(()=>{
        let wrap = dom.querySelectorAll(".el-carousel__button");
        if(val==1){//条形
          wrap.forEach(val=>{
            val.classList.remove("pagestyle-dot")
            val.classList.add("pagestyle-bar")
          })
        }else if(val==2){//圆形
          wrap.forEach(val=>{
            val.classList.remove("pagestyle-bar")
            val.classList.add("pagestyle-dot")
          })
        }
      })
    }
  }
};
</script>
<style scoped lang="scss">
$border1: #afc0d0; // 边框色1
$main-color: #409eff; //主色调
/deep/.el-carousel {
  height: 100%;
}
/deep/.el-carousel__container {
  height: 100%;
}
.pc-block{
  /deep/.el-carousel__button{
    background-color:#ccc;
  }
}
.el-carousel[no-indicators="false"]{
  /deep/.el-carousel__arrow{
    display: none;
  }
  /deep/.el-carousel__indicators{
    display: none;
  }
}
.el-carousel__item h3 {
  color: #475669;
  font-size: 14px;
  opacity: 0.75;
  line-height: 150px;
  margin: 0;
}
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
    transform: translateY(-50%);
  }
}
.vue-grid-item {
  border: 1px dashed $border1;
  transition: none;
  transition-property: none;
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
  color: #409cfb;
  width: 6px;
  height: 20px;
  padding: 0 5px;
  .el-dropdown-link {
    display: block;
    word-break: break-word;
    line-height: 5px;
  }
}
/deep/.el-carousel__button{
  &.pagestyle-dot{
    width:10px;
    height:10px;
    border-radius: 5px;
  }
}
</style>
