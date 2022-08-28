
<template>
  <div class="base-set">
    <div class="blank-mask" v-if="!isLoadData" @click="actPrevent"></div>
    <!-- <div class="nav-title">页面设计</div> -->
    <div class="set-body">
      <div class="sub-title">
        <span class="el-icon-arrow-down"></span>
        <span>高级设置</span>
      </div>
      <div class="sub-list">
        <el-row class="list-row"
          v-show="linkageSetting">
          <div class="list-tit">联动设置：</div>
          <div class="list-item">
            <span id="auto_linked"
              class="set-icon icon-A10655_connection"
              @click="openDialog"></span>
          </div>
        </el-row>
        <!-- 按钮和tab组件联动 -->
        <el-row class="list-row"
          v-show="specialLink">
          <div class="list-tit">联动设置：</div>
          <div class="list-item">
            <el-cascader v-model="activedCompt.comptAttrs.extendSetting.linkTabId"
              size="mini"
              placeholder="请选择tab组件"
              :options="linkTabList"
              expandTrigger="hover"
              :clearable="true"
              @change="tabSelect"></el-cascader>
          </div>
        </el-row>
        <el-row class="list-row"
          v-show="this.activedCompt.type=='VeCombineChart'||this.activedCompt.type=='VeLine'||this.activedCompt.type=='VeHistogram'||this.activedCompt.type=='VeStackHistogram'||this.activedCompt.type=='VeLineArea'||this.activedCompt.type=='VeStackLineArea' || this.activedCompt.type=='VeBar' || this.activedCompt.type=='VeStackBar' || this.activedCompt.type=='VeRing' || this.activedCompt.type=='VePie' || this.activedCompt.type=='VeRadar'">
          <div class="list-tit">预警设置：</div>
          <div class="list-item">
            <span class="set-icon icon-A10344_setting"
              @click="openWarnDialog()"></span>
          </div>
        </el-row>
        <el-row class="list-row"
          v-show="false">
          <div class="list-tit">链接地址：</div>
          <div class="list-item">
            <el-input v-model="link"
              placeholder="请输入链接地址"
              size="mini"
              style="width:178px"></el-input>
          </div>
        </el-row>
        <el-row class="list-row"
          v-show="urlSetting">
          <div class="list-tit">链接方式：</div>
          <div class="list-item">
            <el-radio :key="index"
              :label="item.label"
              v-model="activedCompt.comptAttrs.extendSetting.urlType"
              v-for="(item,index) in urlTypeOptions">{{item.value}}</el-radio>
          </div>
        </el-row>
        <el-row class="list-row"
          v-show="urlSetting">
          <div class="list-tit">链接地址：</div>
          <div class="list-item">
            <el-select v-if="activedCompt.comptAttrs.extendSetting.urlType=='1'"
              v-model="activedCompt.comptAttrs.extendSetting.pageId"
              size="mini"
              clearable
              @change="comptUrlState()"
              placeholder="请选择">
              <el-option v-for="option in otherPageList"
                :key="option.pageId"
                :label="option.pageName"
                :value="option.pageId"></el-option>
            </el-select>
            <el-input class="url-input"
              v-if="activedCompt.comptAttrs.extendSetting.urlType=='2'"
              size="mini"
              v-model="activedCompt.comptAttrs.extendSetting.comptUrl"
              placeholder="请输入内容"
              maxlength="50"
              show-word-limit
              @change="comptUrlState()"></el-input>
          </div>
        </el-row>
        <el-row class="list-row"
          v-show="timeSetting">
          <div class="list-tit">数据刷新：</div>
          <div class="list-item">
            <el-select size="mini"
              placeholder="请选择"
              v-model="activedCompt.comptAttrs.extendSetting.timerValue">
              <el-option v-for="option in intervalList"
                :key="option.value"
                :label="option.label"
                :value="option.value"></el-option>
            </el-select>
          </div>
        </el-row>
      </div>
    </div>
    <WarningSet v-if="this.warningDialog"></WarningSet>
  </div>
</template>
<script>
import { mapMutations, mapGetters, mapState, mapActions } from "vuex";
import WarningSet from "./WarningSet.vue";
export default {
  components: { WarningSet },
  props: ["selectedDrillData"],
  data() {
    return {
      urlTypeOptions: [
        {
          label: "1",
          value: "子页面"
        },
        {
          label: "2",
          value: "自定义"
        }
      ],
      link: "",
      intervalList: [
        {
          value: "0",
          label: "不刷新"
        },
        {
          value: "30000",
          label: "30秒"
        },
        {
          value: "60000",
          label: "1分钟"
        },
        {
          value: "120000",
          label: "2分钟"
        },
        {
          value: "300000",
          label: "5分钟"
        },
        {
          value: "600000",
          label: "10分钟"
        },
        {
          value: "1200000",
          label: "20分钟"
        }
      ],
      intervalValue: ""
    };
  },
  watch: {
    activedCompt(val) {
      if (!val.comptAttrs.extendSetting.urlType) {
        this.$set(val.comptAttrs.extendSetting, "urlType", "1");
      }
    }
  },
  computed: {
    linkageSetting() {
      let notLinkageCompts = [
        "VeGauge",
        "VeRing",
        "HdIconBlock",
        "ElImage",
        "HdIconKpiBlock",
        "HdKpiBlock",
        "HdKpiBlock2",
        "HdKpiBlock3",
        "ElSwiper",
        "HdButton",
        "HdTopFive",
        "HdWater",
        "BdTextNote",
        "VeLines",
        "VeBmap",
        "VeLinesBmap",
        "VeHeatBmap",
        "PivotTable",
        "DesicionTree",
        "SrcAndDest",
        "PcIndicatorTrend",
        "VeScatter"
      ];
      // 没有维度的漏斗图不能进行联动设置
      if (this.activedCompt.type === 'VeFunnel' && this.activedCompt.comptAttrs.xAxisData.length === 0) {
        return false;
      }
      if (notLinkageCompts.includes(this.activedCompt.type)) {
        return false;
      } else {
        return true;
      }
    },
    urlSetting() {
      let notUrlCompts = [
        "ElDatagrid",
        "CrossTable",
        "MobileQuery",
        "ElSwiper",
        "HdTopFive",
        'VeWordCloud'
      ];
      if (notUrlCompts.includes(this.activedCompt.type)) {
        return false;
      } else {
        return true;
      }
    },
    timeSetting() {
      let notTimeCompts = [
        "VeTitle",
        "HdHeader",
        "HdVerTitle",
        "HdTitle",
        "VeTitle",
        "ElBreadCrumb",
        "Query",
        "MobileQuery",
        "ElTabs",
        "VanCollapse",
        "HdTextarea",
        "PcTextarea",
        "ElCarousel",
        "HdHorizontalLine",
        "HdVerticalLine",
        "HdCorner",
        "HdIconBlock",
        "ElImage",
        "HdTitleShape",
        "HdButton"
      ];
      if (notTimeCompts.includes(this.activedCompt.type)) {
        return false;
      } else {
        return true;
      }
    },
    specialLink() {
      let specialLinkCompts = ["HdButton"];
      if (specialLinkCompts.includes(this.activedCompt.type)) {
        return true;
      } else {
        return false;
      }
    },
    otherPageList() {
      let list = [];
      this.allPageList.forEach(val => {
        if (val.pageId != this.activedPage) {
          list.push(val);
        }
      });
      return list;
    },
    linkTabList() {
      let list = [];
      this.allCompts.forEach(val => {
        if (val.type == "ElTabs") {
          let item = {};
          item.value = val.comptId;
          item.label = val.comptAttrs.extendSetting["comptName.text"];
          item.children = [];
          let sub = val.comptAttrs.editableTabs;
          sub.forEach(col => {
            let temp = {};
            temp.value = col.name;
            temp.label = col.title;
            item.children.push(temp);
          });
          list.push(item);
        }
      });
      return list;
    },
    isLoadData() {
      let val = true;
      let bindData = (this.activedCompt.comptAttrs || {}).isBindData === '1';
      if(bindData) {
        val = (this.activedCompt.comptAttrs || {}).isLoadData;
      }
      return val;
    },
    ...mapGetters({
      activeComptIdx: "PageDesign/activeComptIdx",
      activedCompt: "PageDesign/getActivedCompt",
      allCompts: "PageDesign/getFlatCompt"
    }),
    ...mapState({
      s_edcuiCompts: state => state.PageDesign.s_edcuiCompts,
      warningDialog: state => state.PageDesign.warningDialog,
      allPageList: state => state.PageDesign.pageList,
      activedPage: state => state.PageDesign.activedPage
    })
  },
  mounted() {
    if (!this.activedCompt.comptAttrs.extendSetting.urlType) {
      this.$set(this.activedCompt.comptAttrs.extendSetting, "urlType", "1");
    }
    if (!this.activedCompt.comptAttrs.extendSetting.timerValue) {
      this.$set(this.activedCompt.comptAttrs.extendSetting, "timerValue", "0");
      // this.activedCompt.comptAttrs.extendSetting.timerValue='0';
    }
    if (!this.activedCompt.comptAttrs.extendSetting.timer) {
      this.activedCompt.comptAttrs.extendSetting.timer = null;
    }
  },
  methods: {
    tabSelect(val) {
      let target = this.activedCompt.comptAttrs.extendSetting;
      if (
        (target.urlType == "1" && target.pageId) ||
        (target.urlType == "2" && target.comptUrl)
      ) {
        this.$message.error("该组件设置了URL链接，无法设置联动");
        target.linkTabId.splice(0, target.linkTabId.length);
        return;
      }
      target.pageId = "";
      target.comptUrl = ""
    },

    openDialog() {
      // 判断是否有钻取
      if (this.activedCompt.comptAttrs.isBindData == "0") {
        this.$message({
          message: "该组件不支持联动",
          type: "warning"
        });
        return;
      }
      if (this.activedCompt.afId == "") {
        this.$message({
          message: "请先绑定数据集",
          type: "warning"
        });
        return;
      }
      if (
        (this.activedCompt.comptAttrs.extendSetting.urlType == "1" &&
          this.activedCompt.comptAttrs.extendSetting.pageId) ||
        (this.activedCompt.comptAttrs.extendSetting.urlType == "2" &&
          this.activedCompt.comptAttrs.extendSetting.comptUrl)
      ) {
        this.$message({
          message: "该组件设置了URL链接，无法设置联动",
          type: "warning"
        });
        return;
      }
      if (
        this.activedCompt.type == "Query" ||
        this.activedCompt.type == "MobileQuery"
      ) {
        if (this.activedCompt.comptAttrs.selectedQueryData.length == 0) {
          this.$message({
            message: "查询字段至少要1个",
            type: "warning"
          });
          return;
        }
      } else {
        if (
          this.activedCompt.comptAttrs.xAxisData.length == 0 &&
          this.activedCompt.type != "CrossTable"
        ) {
          this.$message({
            message: "请先选择维度字段",
            type: "warning"
          });
          return;
        }
        if (this.activedCompt.comptAttrs.drillData.length > 0) {
          this.$message({
            message: "该维度已设置钻取！无法设置联动。",
            type: "warning"
          });
          return;
        }
      }
      this.setInteractDialogVis(true);
    },
    openWarnDialog() {
      this.setWarningDialog(true);
    },
    comptUrlState() {
      let comptAttrs = this.activedCompt.comptAttrs;
      if (this.activedCompt.type == "HdButton") {
        if (comptAttrs.extendSetting.linkTabId.length > 0) {
          this.$message.error("组件处于联动状态，无法设置链接");
          comptAttrs.extendSetting.pageId = "";
          comptAttrs.extendSetting.comptUrl = "";
          return;
        }
      } else if (
        comptAttrs.mainLinkageData && comptAttrs.mainLinkageData.length > 0 ||
        comptAttrs.drillData && comptAttrs.drillData.length > 0 ||
        this.selectedDrillData && this.selectedDrillData.length > 0 ||
        comptAttrs.pageLinkageData && comptAttrs.pageLinkageData.length > 0
      ) {
        this.$message.error("组件处于联动、钻取状态，无法设置链接");
        comptAttrs.extendSetting.pageId = "";
        comptAttrs.extendSetting.comptUrl = "";
        return;
      }
    },
    actPrevent() {
      this.$message.warning('请先绑定数据');
    },
    ...mapActions({
      setWarningDialog: "PageDesign/setWarningDialog"
    }),
    ...mapMutations({
      setInteractDialogVis: "AnalyReportAttr/setInteractDialogVis"
    })
  }
};
</script>
<style lang="scss" scoped>
.nav-title {
  padding-left: 15px;
  font-size: 16px;
  color: #fff;
  height: 40px;
  background: #0e3b67;
  line-height: 40px;
}
.sub-title {
  font-size: 13px;
  height: 33px;
  line-height: 33px;
  color: #fff;
  .el-icon-arrow-down {
    margin-right: 8px;
    font-size: 13px;
    font-weight: 300;
  }
}
.sub-list {
  padding-top: 5px;
  padding-left: 21px;
}
.set-body {
  padding-left: 20px;
  padding-top: 10px;
}
.list-row {
  height: 28px;
  line-height: 28px;
  margin-top: 10px;
}
.list-tit {
  float: left;
  font-size: 13px;
  color: #fff;
  opacity: 0.8;
}
/deep/.el-input__inner {
  border-color: #0a2b4c;
  background-color: #0e3b67;
  color: #afc0d0;
}
.set-icon {
  font-size: 14px;
  color: #afc0d0;
  cursor: pointer;
  &:hover {
    color: #409eff;
  }
}
.list-item {
  float: left;
  width: calc(100% - 65px);
  padding-right: 35px;
  opacity: 0.8;
  /deep/.el-select{
    width: 100%;
  }
  /deep/.el-radio {
    margin-right: 18px;
    color: #fff;
    .el-radio__input.is-checked .el-radio__inner {
      border-color: #409eff;
      background: #409eff;
    }
  }
  /deep/ .el-input__inner {
    color: #606266;
    background-color: #ffffff;
    border: 1px solid #dcdfe6;
  }
  .url-input {
    /deep/ .el-input__inner {
      padding-right: 50px;
    }
  }
  /deep/ .el-input__count-inner {
    color: #fff;
    background-color: transparent;
    font-size: 12px;
    transform: scale(0.8);
    opacity: 0.7;
  }
}
/deep/.el-cascader__label {
  color: #fff;
  span {
    color: #fff;
  }
}
.blank-mask {
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: 1;
}
</style>
