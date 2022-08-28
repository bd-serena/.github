<template>
  <el-dialog
    size="mini"
    title="SQL脚本"
    width="750px"
    :visible.sync="showReportSqlDialog"
    :append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :destroy-on-close="true"
    @close="closeDialog"
  >
    <center ref="center" :datas.sync="testCenter"></center>
    <span slot="footer" class="dialog-footer">
      <el-button
        size="mini"
        @click="copySql"
        :data-clipboard-text="sqlContentFormat"
        id="sqlContent"
      >复 制</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { mapState, mapMutations, mapActions } from "vuex";
import sqlFormatter from "nl-sql-formatter";
import Clipboard from "clipboard";
import { HST } from "../../utils/HandsTable.js";
import { center } from "vue-nl-interaction-sql";

export default {
  components: {
    center,
  },
  name: "sqlFormatterDialog",
  data() {
    return {
      testCenter: {
        isComplete: false, //是否为完整版 true完整 false只有编辑框
        isStopClicked: false, //停止按钮 false置灰 true激活
        isActive: true, //执行按钮 false置灰 true激活
        isChanged: false, //保存按钮 false置灰 true激活
        editAble: false, //编辑器是否可编辑
        isShowRight: false, //是否展示函数框
        limits: 1, //校验SQL语句数量限制，负数表示不限制，默认为5
        // dbType: 'hive',
        // user_id: '9990035',
        // sqlToolPath: 'http://10.1.8.6:23000/edc-plsqltool-ms-ora/v1/',
        // sqlToolAPI: 'querydata/',
        sqlstring: "",
        // sysId: '',
        // componentService: 'REG_QUERYTABLELIST_UDAP',
        // curLinkInfo: {
        //     dbResourceBeans: {
        //         resource_id: "C4FCC9055EFDC7E455851290BEB211E7",
        //         dbConnectionBeans: {
        //             conn_name: "hive_节点",
        //             conn_name_en: "udap_hive_dev"
        //         },
        //         resource_name: "Hive_连接管理",
        //         resource_type: "hive"
        //     },
        //     tenant_id: "T100000041",
        //     tenant_name: "新大陆"
        // },
        // isTestSubColumns: "1" // "1"：是，"0"：否
      },
    };
  },
  computed: {
    /**格式化sql */
    sqlContentFormat() {
      let sqlContent = this.getSqlString(); //原生sql
      if (sqlContent) {
        this.testCenter.sqlstring = sqlFormatter.format(sqlContent, {
          indexedPlaceholderTypes: ["?"],
          language: "n1ql",
        });
      }
      return this.testCenter.sqlstring;
    },
    showReportSqlDialog: {
      get() {
        return this.$store.state.ReportMgt.showReportSqlDialog;
      },
      set(value) {
        this.upShowReportSqlDialog(value);
      },
    },
    ...mapState({
      areaInfo: (state) => state.ReportAttr.areaInfo,
      edcuiCompts: (state) => state.ReportMgt.edcuiCompts,
    }),
  },
  watch: {
    "areaInfo.area_name": {
      deep: true,
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.getSqlString();
        }
      },
    },
    showReportSqlDialog: {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.getSqlString();
        }
      },
    },
  },
  mounted() {},
  methods: {
    closeDialog() {
      this.upShowReportSqlDialog(false);
    },
    /** 复制sql */
    copySql() {
      //复制
      var clipboard = new Clipboard("#sqlContent");
      clipboard.on("success", (e) => {
        // 释放内存
        clipboard.destroy();
        this.$message.success("复制成功！");
      });
      clipboard.on("error", (e) => {
        // 不支持复制
        Message({
          message: "该浏览器不支持自动复制",
          type: "warning",
        });
        // 释放内存
        clipboard.destroy();
      });
    },
    /**获取当前区域的原生sql */
    getSqlString() {
      let sqlContent = "";
      let areaInfo = this.areaInfo;
      if (areaInfo) {
        this.testCenter.sqlstring = "";
        let areaList =
          this.edcuiCompts[1].comptAttrs.tableList[HST.searchCurSheet().index]
            .area_info || [];
        for (let i = 0; i < areaList.length; i++) {
          let area = areaList[i];
          if (
            areaInfo.area_id === area.area_id &&
            areaInfo.sheet_index === area.sheet_index
          ) {
            sqlContent = area.sql;
            break;
          }
        }
      }
      return sqlContent;
    },
    ...mapMutations({
      upShowReportSqlDialog: "ReportMgt/upShowReportSqlDialog",
    }),
    ...mapActions({
      insertFunc: "ReportMgt/insertFunc",
    }),
  },
};
</script>
<style lang="scss" scoped>
/deep/ .ace-editor.ace_editor.ace-tm {
  height: 400px;
  .ace_layer.ace_marker-layer {
    .ace_active-line {
      height: 6px;
    }
  }
  .ace_scroller {
    right: 8px !important;
  }
}
/deep/ .frame-outer-wrap.hide-right-comp {
  margin-top: -28px;
}
/deep/ .ace_scrollbar.ace_scrollbar-v {
  width: 8px !important;
  bottom: -16px !important;
  top: -15px;
}
/deep/ .ace_scrollbar.ace_scrollbar-h {
  height: 8px !important;
  left: 31px !important;
  right: -11px !important;
  .ace_scrollbar-inner {
    width: 882px !important;
  }
}
/deep/ .ace_gutter {
  z-index: 20;
}
</style>
