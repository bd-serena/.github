<template>
  <el-tabs
    v-model="vscompt.comptAttrs.editableTabsValue"
    @tab-click="handleClick"
    ref="tabs"
    :class="pageCache.classTypeId === '1005'? 'bigsd':''"
  >
    <el-tab-pane
      :key="item.name"
      v-for="(item, index) in vscompt.comptAttrs.editableTabs"
      :label="item.title"
      :name="item.name"
    >
      <div class="has-compt" v-if="item.comptList.length>0">
        <div v-if="pageCache.classTypeId != '1005'">
          <grid-layout
            v-if="afterClick"
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
                style="position:relative;height:100%; overflow:hidden;"
                :style="setHeaderStyle(sub)"
                @click.stop="upBlock(sub.comptId)"
              >
                <div
                  class="compt-title"
                  v-if="isShowName(sub)"
                  :style="setFontStyle(sub)"
                  style="border-bottom: 1px solid #DCDFE6;"
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
                    v-show="sub.comptAttrs.isBindData=='1' && !sub.comptAttrs.isLoadData"
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
            </grid-item>
          </grid-layout>
        </div>
        <div v-if="pageCache.classTypeId === '1005'">
          <bd-draggable-resizable
            v-for="(sub,idx) in item.comptList"
            :class="{'active':sub.comptId===activedBlock}"
            :ref="'dr'+sub.comptId"
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
                  v-show="sub.comptAttrs.isBindData=='1' && !sub.comptAttrs.isLoadData && (sub.comptData === undefined ||  (sub.comptData.rows.length === 0 && sub.comptData.columns.length === 0))  || (sub.type === 'MobileQuery' && sub.comptAttrs.fieldList.length === 0)"
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
    </el-tab-pane>
  </el-tabs>
</template>

<style lang="scss" scoped>
$border1: #afc0d0; // 边框色1
$main-color: #409eff; //主色调
@media screen and (min-width: 1600px) and (max-width: 1920px) {
  .bigsd {
    /deep/ .el-tabs__item {
      font-size: 24px !important;
    }
  }
}
.bigsd {
  /deep/ .el-tabs__nav-scroll {
    border-bottom: 0px;
  }
  /deep/ .el-tabs__item.is-active {
    color: #b4f22b;
    font-weight: bold;
  }
  /deep/ .el-tabs__active-bar {
    background-color: #b4f22b;
  }
  /deep/.el-tabs__item {
    color: rgb(13, 162, 231);
    font-size: 17px;
  }
}
.el-tabs {
  height: 100%;
}
/deep/.el-tabs__header {
  margin-bottom: 0px;
}
/deep/.el-tabs__content {
  height: calc(100% - 42px);
}
/deep/.el-tabs__nav-scroll {
  float: left;
  position: relative;
  z-index: 2;
  border-bottom: 1px solid #ccc;
  &.el-tabs-center {
    left: 50%;
    transform: translateX(-50%);
  }
  &.el-tabs-right {
    float: right;
  }
  &.clear {
    float: none;
    left: 0;
    transform: translateX(0);
  }
}
/deep/.el-tabs__nav-wrap::after {
  width: 0;
}

.el-tab-pane {
  height: 100%;
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
</style>

<script>
import Cell from '../design/Cell.vue'
import VueGridLayout from 'vue-grid-layout'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import { windowResize } from '../../utils/comonFunc.js'
import eventBus from '../../plugins/transData.js'
import BdDraggableResizable from 'bd-draggable-resizable'
import DragResizeMixins from "../../utils/dragResizeMixins.js";
import ComptMixins from "../../utils/comptMixins";
export default {
  props: ['vscompt', 'scaleRatio'],
  components: {
    Cell,
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    BdDraggableResizable
  },
  mixins: [DragResizeMixins,ComptMixins],
  data () {
    return {
      tabSubCompt: null,
      afterClick: true
    }
  },
  mounted () {
    this.initTabAlign()
    this.changeTabHeader()
    this.$nextTick(() => {
      let node = document.querySelector('.el-tabs .el-tabs__header .el-tabs__nav:nth-child(1) .el-tabs__item.is-top.is-active')
      if (node && this.pageCache.operation !== 'design' && this.pageCache.classTypeId !== '1005') {
        setTimeout(()=>{
          node.click();
        },100)
      }
    })
  },
  watch: {
    align () {
      this.initTabAlign()
    },
    tabShow () {
      this.changeTabHeader()
    },
    tabLength () {
      let setting = this.vscompt.comptAttrs
      let dom = this.$el
      let tab = dom.querySelector('.el-tabs__nav').clientWidth
      let wrap = dom.querySelector('.el-tabs__nav-wrap').clientWidth
      let scroll = dom.querySelector('.el-tabs__nav-scroll')
      if (tab >= wrap - 74) {
        setting.extendSetting.tabAlign = ''
        scroll.classList.add('clear')
        setting.extendSetting.canAlign = false
        windowResize()
      } else {
        scroll.classList.remove('clear')
        setting.extendSetting.canAlign = true
      }
    }
  },
  computed: {
    align () {
      return this.vscompt.comptAttrs.extendSetting.tabAlign
    },
    tabShow () {
      return this.vscompt.comptAttrs.extendSetting.tabShow
    },
    layout () {
      let result = []
      let i = this.vscompt.comptAttrs.editableTabsValue
      let list = []
      for (let tab of this.vscompt.comptAttrs.editableTabs) {
        if (tab.name === i) {
          list = tab.comptList
          break
        }
      }
      if (list.length > 0) {
        for (var item of list) {
          result.push(item.blockInfo)
        }
      }
      return result
    },
    tabLength () {
      return this.vscompt.comptAttrs.editableTabs.length
    },
    ...mapState({
      activedBlock: state => state.PageDesign.activedBlock,
      activedTab: state => state.PageDesign.activedTab,
      pageCache: state => state.HomeBody.pageCache,
      s_edcuiCompts: state => state.PageDesign.s_edcuiCompts
    }),
    ...mapGetters({
      activeComptIdx: 'PageDesign/activeComptIdx',
      activedCompt: 'PageDesign/getActivedCompt'
    })
  },
  methods: {
    initTabAlign () {
      let align = this.align
      let list = this.$el.querySelector('.el-tabs__nav-scroll').classList
      if (this.vscompt.comptAttrs.extendSetting.canAlign === false) {
        list.remove('el-tabs-center')
        list.remove('el-tabs-right')
        list.add('clear')
        return
      }
      list.remove('el-tabs-center')
      list.remove('el-tabs-right')
      list.remove('clear')
      switch (align) {
        case 'center':
          list.add('el-tabs-center')
          break
        case 'right':
          list.add('el-tabs-right')
          break
        default:
          break
      }
    },
    changeTabHeader () {
      let tabShow = this.tabShow
      if (tabShow) {
        this.$el.querySelector('.el-tabs__header').style.display = 'block'
        this.$el.querySelector('.el-tabs__content').style.height =
          'calc(100% - 42px)'
      } else {
        this.$el.querySelector('.el-tabs__header').style.display = 'none'
        this.$el.querySelector('.el-tabs__content').style.height = '100%'
      }
    },
    isShowName (compt) {
      let result = false
      let setting = compt.comptAttrs.extendSetting
      if (setting != null) {
        if (setting['comptName.show'] === true) {
          result = true
        }
      }
      return result
    },
    upBlock (id) {
      // this.$set(this.vscompt.comptAttrs, "draggable", false);
      let tabId = this.vscompt.comptAttrs.editableTabsValue
      let list = []
      for (let tab of this.vscompt.comptAttrs.editableTabs) {
        if (tab.name === tabId) {
          list = tab.comptList
          break
        }
      }
      for (var compt of list) {
        if (compt.comptId === id) {
          this.upActivedTab(list)
          this.upActivedBlock(id)
          this.upActivedId(compt)
          this.tabSubCompt = compt
          this.commonFillback(); //公共高度宽度回填
          // 未比对过第一次需要比对
          if(!this.activedCompt.updated) {
            this.updateCompt(this.activedCompt,this.pageCache.classTypeId);
          }
          // 对于有绑定数据的组件，点击默认展示数据面板，对于只有样式设置的组件默认展示样式面板
          this.$nextTick(() => {
            this.refreshRightPanel()
          })
          break
        }
      }
    },
    pcResizedEvent () {
      windowResize()
    },
    handleClick (e) {
      this.afterClick = false;
      this.$nextTick(() => {
        windowResize()
        // 对 Table 进行重新布局
        eventBus.$emit('doTableLayout')
        this.afterClick = true;
        // 手机tab布局自适应调整
        if (this.pageCache.operation !== 'design' && this.pageCache.classTypeId !== '1005') {
          let heightArr = []
          this.s_edcuiCompts.forEach(item => {
            if(item.comptAttrs.editableTabs){
              item.comptAttrs.editableTabs.forEach(item1 => {
                if (item1.name == e.name && item1.comptList.length > 0) {
                  console.log(item1.comptList.length)
                  item1.comptList.forEach(val => {
                    let height = (val.blockInfo.y + val.blockInfo.h)
                    heightArr.push(height);
                  })
                  this.$set(item.blockInfo, "h", Math.max(...heightArr) + 4);
                }
              })
            }
          });
        }
      })
    },
    comptCopy (compt) {
      let activedTab = this.activedTab
      eventBus.$emit('addTabCompt', activedTab, compt)
    },
    deleteCompt (id) {
      let activedTab = this.activedTab
      eventBus.$emit('deleteTabCompt', activedTab, id)
    },
    ...mapMutations({
      upActivedId: 'PageDesign/upActivedId',
      upActivedBlock: 'PageDesign/upActivedBlock',
      upActivedTab: 'PageDesign/upActivedTab'
    }),
    ...mapActions({
      refreshRightPanel: 'PageDesign/refreshRightPanel'
    })
  }
}
</script>
