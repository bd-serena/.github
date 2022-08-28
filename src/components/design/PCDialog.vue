<template>
  <el-dialog
    size="mini"
    :title="PCDialogPageInfo.pageName||''"
    :width="`${PCDialogPageInfo.width}px`"
    :visible.sync="PCDialogVisible"
    :append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :destroy-on-close="true"
    top="0"
    class="page-dialog"
  >
    <el-container style="100%">
      <div
        id="water-wrap2"
        class="query-design"
        :style="`position:relative;background-color:${PCDialogPageInfo.bgClor||''};background-image:url(${PCDialogPageInfo.bgImg||''});`"
      >
        <el-scrollbar
          v-if="PCDialogPageInfo.classTypeId!='1005' && s_edcuiCompts.length>0"
          class="my-scroll-bar"
          style="height:100%;"
          :native="false"
          :noresize="false"
          tag="section"
        >
          <grid-layout
            :layout="layout"
            :col-num="24"
            :row-height="1"
            :is-draggable="false"
            :is-resizable="false"
            :is-mirrored="false"
            :vertical-compact="true"
            :margin="[10, 10]"
            :use-css-transforms="true"
            :autoSize="true"
          >
            <grid-item
              v-for="(item,index) in s_edcuiCompts"
              :key="item.comptId"
              :x="item.blockInfo.x"
              :y="item.blockInfo.y"
              :w="item.blockInfo.w"
              :h="item.blockInfo.h"
              :i="item.comptId"
            >
              <div style="height:100%">
                <div
                  class="compt-title"
                  v-if="isShowName(item)"
                  :style="`color:${item.comptAttrs.extendSetting['title.textStyle.color']||''};`"
                >{{item.comptAttrs.extendSetting['comptName.text']}}</div>
                <div
                  :class="{'no-title':isShowName(item)==false,'has-title':isShowName(item)==true}"
                >
                  <Cell
                    :isDesign="true"
                    :vscompt="item"
                    :id="'main'+item.orderId"
                    v-loading="item.comptAttrs.loading"
                    v-if="PCDialogVisible"
                  ></Cell>
                  <div
                    class="compt-nodata-tip"
                    v-show="item.comptAttrs.isBindData=='1' && !item.comptAttrs.isLoadData"
                  >
                    <span>{{!!item.comptAttrs.queryInfo ? item.comptAttrs.queryInfo : item.comptAttrs.name + '：请设置维度或度量'}}</span>
                  </div>
                </div>
              </div>
            </grid-item>
          </grid-layout>
        </el-scrollbar>

        <div
          class="query-design"
          v-if="PCDialogPageInfo.classTypeId == '1005'&&s_edcuiCompts.length>0"
          :style="`background-color:${PCDialogPageInfo.bgClor||''};background-image:url(${PCDialogPageInfo.bgImg});width:1920px;height:1080px;transform:scale(${pcRatioW},${pcRatioH}); transform-origin:0 0 0;`"
        >
          <bd-draggable-resizable
            v-for="(compt,index) in s_edcuiCompts"
            :ref="'dr'+compt.comptId"
            :w="compt.blockInfo.w"
            :h="compt.blockInfo.h"
            :x="compt.blockInfo.x"
            :y="compt.blockInfo.y"
            :z="compt.blockInfo.z"
            class="designCompt"
            :resizable="false"
            :draggable="false"
            :grid="[1,1]"
            :parent="false"
            :key="compt.comptId"
            :data-id="compt.comptId"
          >
            <div style="width:100%;height:100%;overflow:hidden">
              <div
                class="compt-title bs-title"
                v-if="isShowName(compt)"
                :style="`color:${compt.comptAttrs.extendSetting['title.textStyle.color']||''};`"
              >{{compt.comptAttrs.extendSetting['comptName.text']}}</div>
              <div
                :class="{'no-title':isShowName(compt)==false,'has-title':isShowName(compt)==true}"
              >
                <Cell
                  :isDesign="true"
                  :vscompt="compt"
                  :id="'main'+compt.orderId"
                  v-loading="compt.comptAttrs.loading"
                ></Cell>
                <div
                  class="compt-nodata-tip"
                  v-show="compt.comptAttrs.isBindData=='1' && !compt.comptAttrs.isLoadData"
                >
                  <span>{{!!compt.comptAttrs.queryInfo ? compt.comptAttrs.queryInfo : compt.comptAttrs.name + '：请设置维度或度量'}}</span>
                </div>
              </div>
            </div>
          </bd-draggable-resizable>
        </div>

      </div>
    </el-container>
  </el-dialog>
</template>

<script>
import Cell from "../design/Cell.vue";
import BdDraggableResizable from "bd-draggable-resizable";
import VueGridLayout from "vue-grid-layout";
import { mapState, mapGetters } from "vuex";
import { isShowNameFunc } from "../../utils/comonFunc.js";
export default {
  components: {
    Cell,
    BdDraggableResizable,
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem
  },
  data() {
    return {
      pcRatioW:'1',
      pcRatioH:'1'
    };
  },
  mounted(){
    let dialog=this.$el.querySelector(".el-dialog");
    // dialog.style.top="50%";
    // dialog.style.transform="translateY(-50%)";
    if(this.PCDialogPageInfo.classTypeId=='1005'){  //大屏预览窗口
       var _w = this.PCDialogPageInfo.width;
        var _h = this.PCDialogPageInfo.height;
        this.pcRatioW = _w / 1940;
        this.pcRatioH = _h / 1100;
        dialog.querySelector(".el-dialog__header").style.border="none";
        dialog.querySelector(".el-dialog__title").style.visibility="hidden";
        dialog.querySelector(".el-dialog__headerbtn").style.zIndex="99";
        dialog.querySelector(".el-dialog__headerbtn").style.fontSize="22px";
        dialog.querySelector(".el-dialog__headerbtn").style.top="10px";
        dialog.querySelector(".el-dialog__headerbtn").style.right="15px";
        for(let i=1;i<5;i++){
          let corner=document.createElement("div");
          corner.className="corner-div corner"+i;
          dialog.appendChild(corner);
        }
        this.$nextTick(()=>{
          dialog.querySelector(".el-dialog__body").style.padding="0";
          dialog.querySelector(".el-dialog__body").style.height=this.PCDialogPageInfo.height+"px";
          dialog.querySelector(".el-dialog__body").style.marginTop="-54px";
          dialog.querySelector(".el-dialog__body").style.border="3px solid #0081b8";
        })
    }else{
      this.$nextTick(()=>{
          dialog.querySelector(".el-dialog__body").style.height=this.PCDialogPageInfo.height+"px";
      })
    }
    if (this.PCDialogPageInfo.isWatermark == 1) {
      this.$nextTick(() => {
        this.$Watermark.set("water-wrap2", 60, 20, -40, 0, true);
      });
    }
  },
  computed: {
    ...mapState({
      PCDialogVisible: state => state.PageDesign.PCDialogVisible,
      PCDialogPageInfo: state => state.PageDesign.PCDialogPageInfo
    }),
    ...mapGetters({
      layout: "PageDesign/getLayout"
    }),
    s_edcuiCompts() {
      return this.PCDialogPageInfo.pageDetail || [];
    },
    PCDialogVisible: {
      get() {
        return this.$store.state.PageDesign.PCDialogVisible;
      },
      set(val) {
        this.$store.state.PageDesign.PCDialogVisible = val;
      }
    }
  },
  methods: {
    isShowName(compt) {
      return isShowNameFunc(compt);
    }
  },
  watch: {
    PCDialogVisible(newVal) {
      /* if (newVal && this.PCDialogPageInfo.isWatermark == 1) {
        this.$nextTick(() => {
          this.$Watermark.set("water-wrap2", 60, 20, -40, 0, true);
        });
      } */
    }
  }
};
</script>
<style lang="scss">
  .query-design .vue-grid-layout{
    height: 100%!important;
  }
</style>
<style lang="scss" scoped>
.query-design {
  width: 100%;
  height: 100%;
  background-color: #fff;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
}
.has-title {
  height: 100%;
  margin-top: -30px;
  padding-top: 30px;
}
.no-title{
  height: 100%;
}
</style>

