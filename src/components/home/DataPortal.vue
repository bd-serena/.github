<template>
  <div class="main-content">
    <div class="main-content-form">
      <SimpleCondi :data="condiSettingsData" @condiSubmit="search(true)"></SimpleCondi>
    </div>
    <div
      class="main-content-tool"
      :style="computedStyle()"
    >
      <div
        id="add-report"
        v-if="(catalogId != 'workfold' &&   catalogId != 'recentbrowse'  &&  catalogId != 'mycollect' ) && executePriv != '0'"
        class="tool-btn"
        @click="openDeviceChoose"
      >
        <span class="icon-A10072_add tool-btn-icon"></span>
        <span class="tool-btn-text">新增</span>
      </div>
    </div>
    <div
      class="main-content-table"
      :style="computedStyle('table')"
    >
      <GeminiScrollbar class="my-scroll-bar">
        <!--即席查询-->
        <el-table
          v-loading="loading"
          border
          :data="tableData"
          height="100%"
          style="width: 100%"
          size="mini"
        >
          <el-table-column label="门户名称" prop="privName"></el-table-column>
          <el-table-column label="门户类型" :show-overflow-tooltip="true">
            <template slot-scope="scope">{{ scope.row.portalType === '1' ? 'PC' : '手机' }}</template>
          </el-table-column>
          <el-table-column prop="createUserName" label="创建者" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="modifyTime" label="更新时间" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column label="操作" width="250">
            <template slot-scope="scope">
              <el-tooltip class="item" effect="dark" content="预览" placement="top-start">
                <span class="icon-A10181_browseCount table-icon" @click="toPrew(scope.row)"></span>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="编辑" placement="top-start">
                <span
                  v-show="((catalogId!='workfold'&&catalogId!='recentbrowse'&&catalogId!='mycollect')&&executePriv!='0')
                || (catalogId=='workfold'&&executePriv!='0'&&tenantId==scope.row.tenantId)
                || (catalogId=='recentbrowse'&&executePriv!='0'&&tenantId==scope.row.tenantId)
                || (catalogId=='mycollect'&&executePriv!='0'&&tenantId==scope.row.tenantId)"
                  class="icon-A10189_edit table-icon"
                  @click="editDesign(scope.row)"
                ></span>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="另存为" placement="top-start">
                <span
                  v-show="((catalogId!='workfold'&&catalogId!='recentbrowse'&&catalogId!='mycollect')&&executePriv!='0')
                || (catalogId=='workfold'&&executePriv!='0')
                || (catalogId=='recentbrowse'&&executePriv!='0')
                || (catalogId=='mycollect'&&executePriv!='0')"
                  class="icon-A10545_PS table-icon"
                  @click="saveTo(scope.row)"
                ></span>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="删除" placement="top-start">
                <span
                  v-show="((catalogId!='workfold'&&catalogId!='recentbrowse'&&catalogId!='mycollect')&&executePriv!='0')
                || (catalogId=='workfold'&&executePriv!='0'&&tenantId==scope.row.tenantId)
                || (catalogId=='recentbrowse'&&executePriv!='0'&&tenantId==scope.row.tenantId)
                || (catalogId=='mycollect'&&executePriv!='0'&&tenantId==scope.row.tenantId)"
                  class="icon-A10065_delete table-icon"
                  @click="deleteRow(scope.row)"
                ></span>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="属性" placement="top-start">
                <span
                  v-show="((catalogId!='workfold'&&catalogId!='recentbrowse'&&catalogId!='mycollect')&&executePriv!='0')
                || (catalogId=='workfold'&&executePriv!='0'&&tenantId==scope.row.tenantId)
                || (catalogId=='recentbrowse'&&executePriv!='0'&&tenantId==scope.row.tenantId)
                || (catalogId=='mycollect'&&executePriv!='0'&&tenantId==scope.row.tenantId)"
                  class="icon-A10155_sigh table-icon"
                  @click="showProps(scope.row)"
                ></span>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="权限设置" placement="top-start">
                <span
                  v-show="((catalogId!='workfold'&&catalogId!='recentbrowse'&&catalogId!='mycollect')&&executePriv!='0')
                || (catalogId=='workfold'&&executePriv!='0'&&tenantId==scope.row.tenantId)
                || (catalogId=='recentbrowse'&&executePriv!='0'&&tenantId==scope.row.tenantId)
                || (catalogId=='mycollect'&&executePriv!='0'&&tenantId==scope.row.tenantId)"
                  class="icon-A10686_Task-monitoring table-icon"
                  @click="showAuthority(scope.row)"
                ></span>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </GeminiScrollbar>
    </div>
    <div class="table-page">
      <el-pagination
        :current-page="pageQuery.startPage"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="10"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="sizeChange"
        @current-change="pageChange"
      ></el-pagination>
    </div>

    <el-dialog :width="baseInfoDialogWidth" :visible.sync="dialogFormVisible" id="auto_base_info">
      <div slot="title" class="dialog-title">
        <span>基本信息</span>
        <div class="title-line"></div>
      </div>
      <el-form ref="ruleForm" :model="form">
        <el-row :gutter="30">
          <el-col :span="11">
            <el-form-item prop="pageName" label="名称" :label-width="formLabelWidth" class="pageName">
              <el-input size="mini" v-model="form.pageName" autocomplete="off"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="13">
            <el-form-item
              prop="urlData"
              label="URL"
              :label-width="formLabelWidth"
            >
              <el-input
                size="mini"
                v-model="form.urlData"
                autocomplete="off"
                readonly
                style="width:calc(100% - 25px);"
              ></el-input>
              <el-tooltip class="item" effect="dark" content="复制URL" placement="top-start">
                <span
                  style="padding-left:10px;margin-right: 0;"
                  class="icon-A10183_copy table-icon"
                  :data-clipboard-text="form.urlData"
                  @click="copy"
                  id="copy_text"
                ></span>
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-dialog>

    <el-dialog width="420px" :visible.sync="dialogSaveAs">
      <div slot="title" class="dialog-title">
        <span>另存为</span>
        <div class="title-line"></div>
      </div>
      <el-form ref="saveForm" :rules="rules" :model="saveForm">
        <el-form-item id="pagename-input" prop="pageName" label="名称" :label-width="formLabelWidth" class="pageName">
          <el-input size="mini" @input="inputChange" v-model="saveForm.pageName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          size="mini"
          prop="catalogId"
          class="win-item"
          label="目录"
          :label-width="formLabelWidth"
          style="margin-bottom:11px;"
        >
          <el-cascader
            :change-on-select="true"
            expand-trigger="hover"
            :show-all-levels="false"
            style="width:100%"
            :options="saveToTreeData"
            v-model="saveForm.catalogId"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogSaveAs=false" size="mini">取 消</el-button>
        <el-button type="primary" @click="saveAsSubmit('saveForm')" size="mini">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      width="420px"
      :visible.sync="dialogDeviceChoose"
      top="-200px"
      custom-class="device-dialog"
    >
      <div slot="title" class="dialog-title">
        <span>选择门户类型</span>
        <div class="title-line"></div>
      </div>
      <div class="device-wrap" :style="{backgroundImage: 'url(' + popBg + ')' }">
        <div class="device-item" id="auto_pc">
          <span class="device-icon icon-A10130_hostsum" @click="choosePC"></span>
          <span class="device-shadow"></span>
        </div>
        <div class="device-item" id="auto_phone">
          <span class="device-icon icon-A10112_phone" @click="choosePhone"></span>
          <span class="device-shadow"></span>
        </div>
      </div>
    </el-dialog>
    <PortalAuthority></PortalAuthority>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import Clipboard from 'clipboard'
import popBg from '../../assets/images/device-popover-bgpic.png'
import condiMixins from '../../utils/condiMixins.js'
import PortalAuthority from "../../components/design/PortalAuthority.vue"

export default {
  mixins: [condiMixins],
  components: {
    PortalAuthority
  },
  data() {
    var catalogCheck = (rule, value, callback) => {
      if (value.length == 0) {
        callback(new Error('请选择目录'))
      } else {
        callback()
      }
    }
    return {
      loading: true,
      pageQuery: {
        startPage: 1,
        pageSize: 10
      },
      popBg: popBg,
      selectRow: '',
      deleteType: '',
      condiSettingsData: [
        {
          name: '门户名称',
          formSymbol: 'privName',
          type: 'input',
          vModelValue: '',
        },
        {
          name: '门户类型',
          formSymbol: 'portalType',
          type: 'select',
          vModelValue: '',
          selectOptions: [
            {
              value: '',
              label: '全部'
            },
            {
              value: '1',
              label: 'PC'
            },
            {
              value: '2',
              label: '手机'
            }
          ]
        },
        {
          name: '更新时间',
          formSymbol: 'updateTime',
          type: 'date-picker',
          vModelValue: '',
          pickerOptions: {
            shortcuts: [
              {
                text: '最近一周',
                onClick (picker) {
                  const end = new Date()
                  const start = new Date()
                  start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
                  picker.$emit('pick', [start, end])
                }
              },
              {
                text: '最近一个月',
                onClick (picker) {
                  const end = new Date()
                  const start = new Date()
                  start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
                  picker.$emit('pick', [start, end])
                }
              },
              {
                text: '最近三个月',
                onClick (picker) {
                  const end = new Date()
                  const start = new Date()
                  start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
                  picker.$emit('pick', [start, end])
                }
              }
            ]
          }
        }
      ],
      form: {
        pageName: '',
        pageDesc: ''
      },
      saveForm: {
        pageName: '',
        catalogId: [],
        pageId: ''
      },
      dialogFormVisible: false,
      saveToTreeData: [],
      deleteDialog: false,
      dialogSaveAs: false,
      formLabelWidth: '51px',
      rules: {
        pageName: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          { min: 1, max: 30, message: '长度在 1 到 30 个字符', trigger: 'blur' }
        ],
        catalogId: [
          { required: true, validator: catalogCheck, trigger: 'change' }
        ]
      },
      dialogDeviceChoose: false,
      deviceType: '1', //1-PC,2-手机
      dialogAuthority: false
    }
  },
  computed: {
    authorityDialog: {
      get() {
        return this.$store.state.compt.authorityDialog;
      },
      set(value) {
        this.setAuthorityDialog(value);
      },
    },
    ...mapState({
      tableData: state => state.DataPortal.tableData.list, // 从DataPortal.js出获取数据
      total: state => state.DataPortal.tableData.total,
      catalogId: state => state.HomeBody.catalogId,
      classtypeId: state => state.DataPortal.classtypeId,
      tenantId: state => state.HomeBody.tenantId,
      treeData: state => state.HomeTree.treeData,
      contextUrl: state => state.contextUrl,
      myFolder: state => state.commonProperties.myFolder, // 我的文件夹权限
      executePriv: state => state.commonProperties.executePriv, // 可执行权限
      pageCache: state => state.DataPortal.pageCache,
      menuClassTypeId: state => state.HomeTree.menuClassTypeId
    })
  },
  watch: {
    // 节点改变分页初始化值也改变
    catalogId () {
      // 目录变化--监听
      this.resetSearchCondi()
      this.search()
    },
    tenantId () {
      this.resetSearchCondi()
      this.search()
    },
    menuClassTypeId (val) {
      // 头部菜单切换时候重新查询
      this.resetSearchCondi()
      if (val !== 'drive') {
        this.search()
      }
    },
    deleteDialog (val) {
      if (!val) return
      const text = '确认要删除所选项吗？'
      this.open(text)
    }
  },
  methods: {
    inputChange () {
      let inputVal = this.saveForm.pageName
      if (inputVal.length > 30) {
        let str = inputVal.slice(0, 30)
        this.saveForm.pageName = str
        this.$message.warning('名称长度不能超过30字符!')
        return false
      }
    },
    copy () {
      // 复制
      var clipboard = new Clipboard('#copy_text')
      clipboard.on('success', e => {
        // 释放内存
        clipboard.destroy()
        this.$message.success('复制成功！')
      })
      clipboard.on('error', e => {
        // 不支持复制
        Message({
          message: '该浏览器不支持自动复制',
          type: 'warning'
        })
        // 释放内存
        clipboard.destroy()
      })
    },
    // 确定另存为分析报告
    saveAsSubmit (formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          var param = {
            portalId: this.saveForm.pageId
          }
          this.queryPortalDetail(param).then(resp => {
            if (resp.status == 200 && resp.data.respResult == "1") {
              let newPortal = resp.data.respData;
              if(this.saveForm.pageName === newPortal.privName) {
                this.$message.error('名称不能重复');
                return;
              } else {
                newPortal.createUser = sessionStorage.getItem('user_id')
                newPortal.privName = this.saveForm.pageName;
                newPortal.parentPrivId = this.menuClassTypeId;
                this.addPortal(newPortal).then(res => {
                  if (res.status == 200 && res.data.respResult == "1") {
                    this.$message.success('页面另存成功')
                    this.dialogSaveAs = false
                    this.search()
                  }
                }).catch(err => {})
              }
            }
          }).catch(err => {})

         /*  // 目录id
          var catalogId = this.saveForm.catalogId[
            this.saveForm.catalogId.length - 1
          ]

          var pageId = this.saveForm.pageId // 分析报告id
          var pageName = this.saveForm.pageName // 分析报告名称
          param.catalogId = catalogId
          param.pageName = pageName
          param.createUser = sessionStorage.getItem('user_id')


          this.saveAsAnalysisReport(param)
            .then(val => {
              if (val.status === 200 && val.data.respResult === '1') {
                this.$message.success('页面另存成功')
                this.dialogSaveAs = false
                this.search()
              } else {
                this.$message.error(val.data.respErrorDesc)
              }
            })
            .catch(err => {
              console.error(err)
              // this.$message.error("页面另存失败");
            }) */
        } else {
          return false
        }
      })
    },
    search (isNeedResetStart = false) {
      if (isNeedResetStart) {
        // 如果是点查询按钮，应该从第一页开始查
        this.pageQuery.startPage = 1
      }
      this.loading = true
      var { privName } = this.searchForm
      if (this.searchForm.updateTime == null) {
        this.searchForm.updateTime = ''
      }
      var beginTime = (this.searchForm.updateTime[0] || '').replace(
        /\s*/g,
        ''
      )
      var endTime = (this.searchForm.updateTime[1] || '').replace(
        /\s*/g,
        ''
      )
      var portalType = '';
      if (this.searchForm.portalType != null && this.searchForm.portalType != '') {
        portalType = this.searchForm.portalType
      }
      // 案例展示
      let params = { beginTime, endTime, privName, portalType }
      params.startPage = this.pageQuery.startPage;
      params.pageSize = this.pageQuery.pageSize;
      if (this.catalogId == 'workfold') {
        // 工作组文件夹
        params.tenantId = sessionStorage.getItem("tenant_id")
      }
      this.queryTableData(params)
        .then(val => {
          if (val.status === 200 && val.data.respResult === '1') {
            var total = val.data.dataTotalCount
            var list = val.data.respData
            this.$store.commit('DataPortal/setTableData', { total, list })
          } else {
            this.$message.error('页面查询失败')
            console.error(val)
          }
          this.loading = false
        })
        .catch(err => {
          this.loading = false
        })
    },
    addTableData () {
      if (this.catalogId === '') {
        this.$message.warning('请选择目录再创建页面')
        return
      }
      if (this.catalogId === 'workfold') {
        this.$message.warning('不可在工作组文件夹下添加！')
        return
      }
      var item = {}
      item.catalogId = this.catalogId
      item.operation = 'design'
      item.classTypeId = this.menuClassTypeId
      item.portalType = this.deviceType;
      this.setPageCache(item)
      this.toDesign()
    },
    editDesign (data) {
      var pageParam = Object.assign({
        objId: data.portalId,
        operateUser: window.sessionStorage.getItem('user_id'),
        operateObj: this.menuClassTypeId,
        operateType: 5,
        result: 1,
        remark: '数据门户编辑'
      })
      this.addOptlog(pageParam)
        .then(val => {
        })
        .catch(err => {
          console.error(err)
        })

      data.operation = 'design'
      data.classTypeId = data.classTypeId
      this.setPageCache(data)
      this.toDesign()
    },
    showProps (data) {
      this.selectRow = data;
      this.form.pageName = data.portalName;
      this.form.urlData = "/dataeleph-show/v1/preview/index?pageId=" + data.portalId;
      this.dialogFormVisible = true
    },
    showAuthority(data) {
      this.setPageCache(data);
      this.setAuthorityDialog(true);
    },
    saveTo (data) {
      // 数据另存为
      this.saveToTreeData.splice(0, this.saveToTreeData.length)
      var temp = ''
      this.treeData.forEach(function (val) {
        // forEach不能使用this否则会包指向不对
        if (val.value != 'workfold') {
          temp = val
        }
      })

      this.saveToTreeData.push(temp)

      // 选中行数据
      this.selectRow = data
      this.saveForm.pageName = data.privName // 分析报告名称
      this.saveForm.pageId = data.portalId // 分析报告父id
      this.saveForm.catalogId = []
      this.dialogSaveAs = true
    },
    pageChange (val) {
      this.pageQuery.startPage = val
      this.search()
    },
    sizeChange (val) {
      this.pageQuery.pageSize = val
      this.pageQuery.startPage = 1
      this.search()
    },
    delTableData () {
      let id = ''
      if (this.deleteType == 'single') {
        id = this.selectRow.portalId
      }
      this.deletePortal(id)
        .then(val => {
          if (val.status === 200 && val.data.respResult === '1') {
            this.$message.success('页面删除成功')
            this.deleteDialog = false
            this.search()
          } else {
            this.$message.error('页面删除失败' + val.data.respErrorDesc)
          }
        })
        .catch(err => {})
    },
    deleteRow (data) {
      this.selectRow = data
      this.deleteType = 'single'
      this.deleteDialog = true
    },
    open (text) {
      this.$confirm(text, '提示', {
        closeOnClickModal: false,
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(() => {
          this.$message({
            type: 'success',
            message: '操作成功!'
          })
          this.delTableData()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          })
          this.deleteDialog = false
        })
    },
    toDesign () {
      let pageInfo = JSON.stringify(this.pageCache)
      sessionStorage.setItem('pageCache', pageInfo)
      this.storeVuexStore()
      let routeData = this.$router.resolve({ name: 'portalDesign' })
      window.open(routeData.href, '_blank')
    },
    toPrew (data) {
      data.operation = 'preview'
      this.setPageCache(data)
      sessionStorage.setItem('pageCache', JSON.stringify(this.pageCache))
      this.storeVuexStore()
      let routeData = this.$router.resolve({ name: 'portalView' })
      window.open(routeData.href, '_blank')
    },
    ...mapMutations({
      setTableData: 'DataPortal/setTableData',
      setPageCache: "DataPortal/setPageCache",
      setAuthorityDialog: "compt/setAuthorityDialog"
    }),
    ...mapActions({
      queryTableData: 'DataPortal/queryTableData',
      saveAsAnalysisReport: 'DataPortal/saveAsAnalysisReport',
      updatePageInfo: 'DataPortal/updatePageInfo',
      addOptlog: 'compt/addOptlog',
      storeVuexStore: 'storeVuexStore',
      deletePortal: "DataPortal/deletePortal",
      addPortal: "DataPortal/addPortal",
      queryPortalDetail: "DataPortal/queryPortalDetail"
    }),
    // 选中终端
    openDeviceChoose () {
      this.dialogDeviceChoose = true
    },
    choosePC () {
      this.deviceType = '1'
      this.addTableData()
      this.dialogDeviceChoose = false
    },
    choosePhone () {
      this.deviceType = '2'
      this.addTableData()
      this.dialogDeviceChoose = false
    }
  },
  mounted () {
    this.search()
  }
}
</script>

<style lang="scss" scoped>
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
      text-align: center;
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

  // .el-form--inline {
  //   .el-form-item {
  //     margin-right: 70px;

  //     &:last-child {
  //       margin-left: -10px;
  //       margin-top: -1px;
  //       margin-right: 0;
  //     }
  //   }
  // }

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
    // float: left;
    // width: 75%;
    margin-left: 30px;

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
