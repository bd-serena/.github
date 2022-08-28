<template>
  <el-dialog
    size="mini"
    title="推送日志"
    width="700px"
    :visible.sync="emailTaskLogDialogVis"
    :append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="reset"
    :destroy-on-close="true"
    class="el-dialog-cockpitPublic"
  >
    <el-table
      :data="versionList"
      v-loading="versionLoading"
      size="mini"
      height="243"
      style="width: 100%;">
      <el-table-column
        min-width="120"
        prop="resultPushTime"
        :show-overflow-tooltip="true"
        label="推送时间">
      </el-table-column>
      <el-table-column
        prop="emailSubject"
        min-width="80"
        label="邮件主题"
        :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.emailSubject }}
        </template>
      </el-table-column>
      <el-table-column
        prop="state"
        min-width="80"
        label="推送状态">
        <template slot-scope="scope">
          <span>
            {{ status(scope.row.resultCode) }}
          </span>
          <el-tooltip v-if="scope.row.resultCode === '-1'" effect="dark" :content="scope.row.resultErrorInfo" placement="top">
            <i class="icon-A10266_sigh sql-status-icon"></i>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <div style="text-align: right;margin-top: 10px;">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      />
    </div>
  </el-dialog>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
export default {
  name: 'EmailTaskLog',
  props: {
    pageObj: {
      type: Object
    }
  },
  data () {
    return {
      emailRules: {},
      versionLoading: false,
      currentPage: 1, // 默认第一页
      total: 0, // 总记录
      pageSize: 10, // 分页默认为10条/页
      asynLoading: false,
      websocket: null,
      versionList: [],
      resultCodeList: [
        {
          value: '0',
          label: '等待'
        }, {
          value: '-1',
          label: '失败'
        }, {
          value: '1',
          label: '正在执行'
        }, {
          value: '2',
          label: '成功'
        }
      ]
    }
  },
  computed: {
    ...mapState({
      pageCache: state => state.HomeBody.pageCache,
      websocketUrl: state => state.commonProperties.websocketUrl, // websocket地址
      filesync: state => state.commonProperties.filesync// 各地本地化差异配置(湖南导出文件特殊处理)
    }),
    ...mapGetters({
    }),
    emailTaskLogDialogVis: {
      get () {
        if (this.$store.state.AnalyReportAttr.emailTaskLogDialogVis) {
          this.queryLog()
        }
        return this.$store.state.AnalyReportAttr.emailTaskLogDialogVis
      },
      set (value) {
        this.setEmailTaskLogDialogVis(value)
      }
    },
    status () {
      return function (val) {
        let obj = this.resultCodeList.find(e => {
          if (val === e.value) {
            return e.label
          }
        }) && this.resultCodeList.find(e => {
          if (val === e.value) {
            return e.label
          }
        }).label
        if (obj) {
          return obj;
        } else {
          return '失败';
        }
      }
    }
  },
  methods: {
    ...mapActions({
      queryRegularMailTaskLog: 'HomeBody/queryRegularMailTaskLog'
    }),
    ...mapMutations({
      setEmailTaskLogDialogVis: 'AnalyReportAttr/setEmailTaskLogDialogVis'
    }),
    closeDialog () {
      this.setEmailTaskLogDialogVis(false)
      this.reset()
    },
    reset () {

    },
    queryLog () {
      let that = this
      let param = {
        'mailTaskLog': {
          'taskId': this.pageObj.taskId
        },
        'startPage': this.currentPage, // 起始页
        'pageNum': this.pageSize // 分页数量
      }
      this.queryRegularMailTaskLog(param)
        .then(val => {
          if (val.status === 200 && val.data.respResult === '1') {
            that.versionList = val.data.respData.data
            that.total = val.data.respData.totalCount
          }
        })
        .catch(err => {
          this.$message.error('日志查询失败')
        })
    },
    handleSizeChange (val) {
      // Size该笔那
      // this.pictLoading = true;
      this.pageSize = val;
      // this.getEntityList('order');
      this.queryLog()
    },
    handleCurrentChange (val) {
      //
      this.currentPage = val;
      this.queryLog()
    },
    saveEmailTask () {
      this.setEmailTaskLogDialogVis(false)
    },
    createFilter (queryString) {
      return (restaurant) => {
        return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      }
    },
    handleSelect (item) {
      console.log(item)
    }
  },
  mounted () {
    // this.queryLog();
  },
  beforeDestroy () {

  },
  watch: {
  }
}
</script>

<style lang="scss" scoped>
.sql-status-icon{
  color: red;
}
.el-table {
  ::-webkit-scrollbar {
    width: 9px;
    height: 9px;
  }

  ::-webkit-scrollbar-track {
    opacity: 0;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 4.5px;
    border: 1px solid #ffffff;
    border-right-width: 2px;
    background-color: #c8c8c8;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: #a0a0a0;
  }
}
// 可滚动区域 鼠标移入 滚动条显示 鼠标移出 滚动条隐藏
.scroll-wrap-enable::-webkit-scrollbar-thumb,
.ht_master .wtHolder::-webkit-scrollbar-thumb,
.el-table__body-wrapper::-webkit-scrollbar-thumb {
  // opacity:0 ;
  visibility: hidden;
}

.scroll-wrap-enable:hover::-webkit-scrollbar-thumb,
.ht_master .wtHolder:hover::-webkit-scrollbar-thumb,
.el-table__body-wrapper:hover::-webkit-scrollbar-thumb {
  // opacity:1;
  visibility: visible // background: #e8e8e8;
}
</style>
