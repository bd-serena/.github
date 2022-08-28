<template>
  <el-dialog
    size="mini"
    title="发布模板"
    width="750px"
    :visible.sync="captureDialogVisible"
    :append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :destroy-on-close="true"
  >
    <div class="mask-wrap"></div>
    <div id="capture-cont" style="width:100%;height:400px;position:relative;">
      <page-view :capture="true"></page-view>
    </div>
    <div class="capture-div">
      <el-form size="mini" :label-width="'130px'" style="margin-top:20px">
        <el-form-item label="请输入模板名称" :required="true" style="margin-bottom:0">
          <el-input style="width:250px" maxlength="15" show-word-limit v-model="templateParam.templateName"></el-input>
        </el-form-item>
      </el-form>
      <!-- <img id="capture-img" src alt /> -->
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="captureDialogVisible=false">取消</el-button>
      <el-button type="primary" size="mini" :loading="capturing" @click="capture">{{ capturingText }}</el-button>
    </div>
  </el-dialog>
</template>
<script>
import html2canvas from 'html2canvas'
import PageView from '../../views/PagePreView.vue'

import { mapState, mapActions } from 'vuex'
export default {
  components: {
    PageView
  },
  data () {
    return {
      templateParam: {
        templateName: '',
        pageId: '',
        thumbnail: ''
      },
      capturing: false
    }
  },
  computed: {
    ...mapState({
      captureDialogVisible: state => state.PageDesign.captureDialogVisible,
      pageCache: state => state.HomeBody.pageCache
    }),
    captureDialogVisible: {
      get () {
        return this.$store.state.PageDesign.captureDialogVisible
      },
      set (val) {
        this.$store.state.PageDesign.captureDialogVisible = val
      }
    },
    capturingText () {
      return this.capturing ? '发布中' : '确定'
    }
  },
  methods: {
    ...mapActions({
      addTemplate: 'PageDesign/addTemplate'
    }),
    capture () {
      this.capturing = true
      let option = {
        useCORS: true
      }
      if (this.templateParam.templateName == '') {
        this.$message.error('请输入模板名称')
        this.capturing = false;
        return
      }
      html2canvas(document.getElementById('capture-cont'), option).then(
        canvas => {
          const imgUrl = canvas.toDataURL()
          // document.getElementById("capture-img").setAttribute("src", imgUrl);
          this.templateParam.pageId = this.pageCache.pageId
          this.templateParam.thumbnail = imgUrl
          this.addTemplate(this.templateParam).then(val => {
            this.capturing = false
            if (val.data.respResult == 1 && val.status == 200) {
              this.$message.success(val.data.respData)
              this.captureDialogVisible = false
            } else {
              this.$message.error(val.data.respErrorDesc)
            }
          }).catch(err => {
            // this.$message.error("发布模板失败");
          })
        }
      ).catch(err => {
        // this.$message.error("截图失败")
      })
    }
  },
  watch: {}
}
</script>

<style lang="scss" scoped>
.mask-wrap{
  width:100%;
  height:400px;
  position: absolute;
  z-index: 1;
}
/deep/.el-input__count-inner{
  height:26px;
}
.capture-div {
  /deep/.el-input .el-input__count {
    height: 27px;
  }
}
</style>
