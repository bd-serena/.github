import SimpleCondi from '../components/design/SimpleCondi';
import { mapState, mapActions } from 'vuex';
export default {
  components: {
    SimpleCondi
  },
  data () {
    return {
      versionLoading: false, // 版本列表加载状态
      baseInfoDialogWidth: '720px', // 属性弹窗宽度
      verListTableHeight: '218px', // 版本列表高度
      dialogCommitVersion: false, // 提交版本窗口
      verRollbacking: false,
      commitVerForm: { // 提交版本信息 remark--描述
        remark: ''
      }
    };
  },
  methods: {
    /**
      通过条件数量判断高度
       */
    computedStyle (type) {
      let condiCount = 0;
      this.condiSettingsData.forEach((ele, index) => {
        if (!(index === this.condiSettingsData.length - 1 && ele.formSymbol === 'isShowDemo')) {
          if (ele.type === 'date-picker') {
            condiCount += 2;
          } else {
            condiCount++;
          }
        }
      });
      let toolTop = type === 'table' ? Math.ceil(condiCount / 4) * 42 + 48 : Math.ceil(condiCount / 4) * 42 + 20;
      return {
        'top': toolTop + 'px'
      };
    },
    resetSearchCondi () {
      this.pageQuery.start = 1;
      this.pageQuery.pageCount = 10;
      this.searchForm.pageName = '';
      this.searchForm.status = '';
      this.searchForm.updateTime = '';
      this.searchForm.isDemo = false;
      this.condiSettingsData.forEach((ele) => {
        ele.vModelValue = ele.type === 'checkbox' ? false : '';
      });
    },
    /**
     * 案例复选框禁用
     */
    unSelectDemo (row, index) {
      return row.isDemo !== '1';
    },
    /**
     * 打开提交版本窗口
     * @param {} data
     */
    showCommitVerDialog (data) {
      this.selectRow = data;
      this.dialogCommitVersion = true;
    },
    /**
     * 提交版本
     * submitType : page提交应用版本 analy提交数据集版本
     */
    versionSubmit (formName, submitType) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          var remark = this.commitVerForm.remark;
          var param = {
            objId: 'analy' === submitType ? this.selectRow.datasetId : this.selectRow.pageId,
            pageId: this.selectRow.pageId,
            objType: 'analy' === submitType ? 'dads' : this.selectRow.classTypeId,
            remark: remark,
            datasetId: this.selectRow.datasetId
          };
          ('analy' === submitType ? this.commitAfVersion(param) : this.commitVersion(param))
              .then(val => {
                if (val.status === 200 && val.data.respResult === '1') {
                  this.$message.success('版本提交成功');
                  this.dialogCommitVersion = false;
                  this.search();
                }
              })
              .catch(err => {});
        } else {
          return false;
        }
      });
    },
    openDialog (name) {
      this.saveForm.catalogId = [];
      this.$nextTick(() => {
        this.$refs[name].clearValidate();
        this.$refs[name].resetFields();
      });
    },
    /**
     * 版本回退
     * @param {*} data
     */
    gobacktoCurVer (data, backupType) {
      this.$confirm('是否回退当前版本到编辑环境！', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.verRollbacking = data.verNo;
        let dataSetCache = this.$store.state.DataSetMgt.dataSetCache;
        let versionParam = {
          objType: 'analy' === backupType ? this.$store.state.DataSetMgt.classTypeId : this.pageCache.classTypeId,
          verNo: data.verNo,
          objId: 'analy' === backupType ? dataSetCache.datasetId : this.pageCache.pageId
        };
        ('analy' === backupType ?  this.rollbackAfVer(versionParam) : this.rollbackVer(versionParam))
          .then(val => {
            if (val.status === 200 && val.data.respResult === '1') {
              this.dialogFormVisible = false;
              this.$message.success('版本回退成功');
              this.search(true);
            } else {
              this.$message.error('版本回退失败');
            }
            this.verRollbacking = false;
          })
          .catch(err => {
            this.$message.error(err);
            this.verRollbacking = false;
          });
      }).catch(() => {
        this.verRollbacking = false;
      });
    },
    ...mapActions({
      commitVersion: 'HomeBody/commitVersion', // 提交应用版本
      rollbackVer: 'HomeBody/rollbackVer', // 应用回退版本
      qryVersionList: 'HomeBody/qryVersionList', // 查询版本列表
      commitAfVersion: 'HomeBody/commitAfVersion', //提交数据集版本
      rollbackAfVer: 'HomeBody/rollbackAfVer'
    })
  },
  computed: {
    ...mapState({
      isShowDemo: state => state.isShowDemo
    }),
    searchForm () {
      let retValue = {};
      this.condiSettingsData.forEach((ele) => {
        retValue[ele.formSymbol + ''] = ele.vModelValue;
      });
      retValue['isShowDemo'] = this.isShowDemo;
      return retValue;
    }
  },
  watch: {
    dialogFormVisible (val) {
      if (!val) {
        let resetPageCache = Object.assign(this.pageCache, { verNo: '' });
        this.setPageCache(resetPageCache);
        this.$refs['ruleForm'].resetFields();
      }
    }
  }
};
