<template>
  <el-container>
    <el-main>
      <div class="main-content">
        <div class="main-content-form">
            <el-form ref="form" :inline="true" :model="searchForm" class="demo-form-inline" size="mini">
            <el-form-item label="应用名称关键字">
              <el-input
                size="mini"
                style="width:210px"
                v-model="searchForm.appKey"
                placeholder="请输入内容"
              ></el-input>
            </el-form-item>
            <el-form-item label="数据集关键字">
              <el-input
                size="mini"
                style="width:210px"
                v-model="searchForm.dataSetKey"
                placeholder="请输入内容"
              ></el-input>
            </el-form-item>
            <el-form-item label="数据表关键字">
              <el-input
                size="mini"
                style="width:210px"
                v-model="searchForm.dataTabKey"
                placeholder="请输入内容"
              ></el-input>
            </el-form-item>
            <el-form-item>
              <el-button @click="renderTable" type="primary" size="mini">查询</el-button>
            </el-form-item>
            <el-form-item>
              <el-button @click="reset" type="primary" size="mini">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="main-content-table">
          <GeminiScrollbar class="my-scroll-bar">
            <el-table
              height="100%"
              v-loading="loading"
              row-key="rowKey"
              border
              :data="tableData"
              style="width: 100%"
              size="mini"
            >
              <!-- <el-table-column type="selection" width="55"></el-table-column> -->
              <el-table-column prop="pageName" label="应用名称" :show-overflow-tooltip="true" align="left"></el-table-column>
              <el-table-column prop="classTypeName" label="应用类型" :show-overflow-tooltip="true" align="center"></el-table-column>
              <el-table-column prop="dataSet" label="数据集" :show-overflow-tooltip="true" align="center"></el-table-column>
              <el-table-column prop="dataTab" label="数据表" :show-overflow-tooltip="true" align="center"></el-table-column>
              <el-table-column prop="dataOri" label="数据源" :show-overflow-tooltip="true" align="center"></el-table-column>
            </el-table>
          </GeminiScrollbar>
        </div>
        <div class="table-page">
          <el-pagination
            :current-page="searchForm.startPage"
            :page-sizes="[10, 20, 30, 40]"
            :page-size="20"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="sizeChange"
            @current-change="pageChange"
          ></el-pagination>
        </div>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  components: {

  },
  data () {
    return {
      tableData: [],
      loading: true,
      searchForm: {
        appKey: '',
        dataSetKey: '',
        dataTabKey: '',
        startPage: 1,
        pageSize: 20
      },
      total: 0
    }
  },
  computed: {

  },
  methods: {
    pageChange (val) {
      this.searchForm.startPage = val
      this.renderTable()
    },
    sizeChange (val) {
      this.searchForm.pageSize = val
      this.searchForm.startPage = 1
      this.renderTable()
    },
    reset () {
      this.searchForm = {
        appKey: '',
        dataSetKey: '',
        dataTabKey: '',
        startPage: 1,
        pageSize: 20
      }
      this.searchForm.tenantId = window.sessionStorage.getItem('tenant_id')
      this.renderTable()
    },
    async renderTable (isNeedResetStart = false) {
      if (isNeedResetStart) {
        this.searchForm.startPage = 1
      }
      let param = this.searchForm
      let resp = await this.getAnalyList(param)
      this.loading = true
      if (resp) {
        if (resp.status === 200 && resp.data.respResult === '1') {
          this.tableData = resp.data.respData.list
          this.total = resp.data.respData.total
        } else {
          this.$message.error('应用血缘分析查询失败')
          console.error(resp.data.respErrorDesc)
        }
      }
      this.loading = false
    },
    ...mapActions({
      getAnalyList: 'Analy/getAnalyList'
    })
  },
  created () {
    this.searchForm.tenantId = window.sessionStorage.getItem('tenant_id')
    this.renderTable()
  },
  watch: {
  }
}
</script>

<style lang="scss" scoped>
    .el-header{
        background-color: #0a2b4c;
        height: 60px;
        line-height: 60px;
        .head-title{
            color:#fff;
            font-size: 18px;
        }
    }
    .el-main{
        background-color: #e4e7ee;
    color: #333;
    overflow: hidden;
    }
  .main-content {
    background: #fff;
    width: 100%;
    padding: 20px;
    height: 100%;
    position: relative;

    .main-content-form {
      text-align: left;
    }

    /deep/ .main-content-table th {
      background-color: #f5f7fa;
      border-bottom: 2px solid #409eff;
      border-right: none;
      color: #303133;
      text-align: center;
    }

    /deep/ .main-content-table td {
      border-right: none;
    }

    .table-icon {
      color: #409eff;
      font-size: 14px;
      margin-right: 20px;
      cursor: pointer;

      &:hover {
        color: #66b1ff;
      }

      &:last-child {
        margin-right: 0;
      }
    }

    /deep/ .device-dialog {
      top: 50%;
      margin: 0 auto;
      background-color: #fff;

      .device-wrap {
        background-repeat: no-repeat;
        background-position: 35px 10px;
      }
    }

    /deep/.el-table--border td:first-child .cell{
      padding-left:25px !important;
    }

    /deep/ .el-table__expand-icon{
      position: absolute;
      left: 2%;
    }
    /deep/.el-table__indent{
      padding-left:0 !important;
    }

    // 弹框标题头字体
    .dialog-title {
      & > span {
        line-height: 24px;
        font-size: 18px;
        color: #303133;
      }
    }

    .table-page {
      position: absolute;
      bottom: 20px;
      right: 20px;
    }

    .main-content-table {
      position: absolute;
      top: 103px;
      bottom: 62px;
      left: 20px;
      right: 20px;

      .device-icon {
        float: left;
        color: #409eff;
        font-size: 14px;
        margin-top: 20px;
        cursor: pointer;

        &:hover {
          color: #66b1ff;
        }
      }
    }

    /deep/ .gm-scrollbar .thumb {
      background-color: #d3d8e4;
    }
  }

  .el-form--inline {
    .el-form-item {
      margin-right: 70px;

      &:last-child {
        margin-left: -10px;
        margin-top: -1px;
        margin-right: 0;
      }
    }
  }

  .main-content-tool {
    position: absolute;
    top: 75px;
    right: 20px;
    text-align: right;

    .tool-btn {
      cursor: pointer;
      margin-left: 20px;
      display: inline-block;

      .tool-btn-icon {
        color: #409eff;
        margin-right: 5px;
      }

      .tool-btn-text {
        position: relative;
        top: -1px;
      }

      &:hover {
        .tool-btn-text {
          color: #409eff;
        }
      }
    }
  }

  /deep/ .el-dialog__body {
    padding-top: 13px;
    padding-bottom: 10px;
  }

  /deep/ .el-form-item {
    margin-bottom: 14px;
  }

  @media screen and (max-width: 1460px) {
    .el-form--inline {
      .el-form-item {
        margin-right: 20px;
      }
    }
  }

  .device-wrap {
    width: 100%;
    height: 200px;
    text-align: center;

    .device-item {
      display: inline-block;
      padding: 45px 59px;
      cursor: pointer;

      .device-icon {
        font-size: 60px;
        color: #afc0d0;

        &.actived {
          color: #409eff;
        }

        &:hover {
          color: #409eff;
        }
      }

      .device-shadow {
        display: block;
        width: 40px;
        height: 10px;
        border-radius: 50%;
        background: #c0c4cc;
        margin: 10px 0 0 10px;
        margin: 10px 0 0 10px;
        -webkit-box-shadow: #b7bdca 0px 0px 4px 3px;
      }
    }
  }

  .cn-name {
    float: left;
    width: 75%;
    margin-left: 20px;

    .name-text {
      display: inline-block;
      width: 100%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;

      &.name-txt1 {
        font-size: 15px;
        text-align: left;
      }

      &.name-txt2 {
        font-size: 11px;
        color: #cccccc;
        text-align: left;
      }
    }
  }

  .pageName {
    /deep/ .el-form-item__error {
      margin-top: -7px;
    }
  }

  .compt-import{
    display: inline-block;
  }
</style>

<style lang="scss">
.star{
  .el-form-item__label::before{
    content: "*";
    color: #f56c6c;
    margin-right: 4px;
  }
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
</style>
