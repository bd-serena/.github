
<template>
  <div :class="{'base-set':true,'big-screen-baseset':pageInfo.classTypeId == '1005'}">
    <div class="nav-title">页面设计</div>
    <div class="set-body">
      <div class="sub-title">
        <span class="icon-A10235_next"></span>
        <span>基本设置</span>
      </div>
      <div class="sub-list">
        <el-row class="list-row" v-show="pageInfo.classTypeId != '1001002'">
          <div class="list-tit">页面类型：</div>
          <div class="list-item">
            <el-radio v-model="activedPage.pageType" label="1">新标签页</el-radio>
            <el-radio
              v-model="activedPage.pageType"
              label="2"
              v-show="activedPage.parentId != '0'"
            >浮动窗口</el-radio>
          </div>
        </el-row>
        <el-row class="list-row" v-show="activedPage.pageType == '2'">
          <div class="list-tit">弹窗宽度：</div>
          <div class="list-item">
            <el-input
              @keydown.native="channelInputLimit"
              @change="e=>rangeLimit(e,'width')"
              maxlength="10"
              size="mini"
              v-model="activedPage.width"
              placeholder="请输入弹窗宽度"
            ></el-input>
          </div>
        </el-row>
        <el-row class="list-row" v-show="activedPage.pageType == '2'">
          <div class="list-tit">弹窗高度：</div>
          <div class="list-item">
            <el-input
              @keydown.native="channelInputLimit"
              @change="e=>rangeLimit(e,'height')"
              maxlength="10"
              size="mini"
              v-model="activedPage.height"
              placeholder="请输入弹窗高度"
            ></el-input>
          </div>
        </el-row>
        <el-row class="list-row">
          <div class="list-tit">背景设置：</div>
          <div class="list-item">
            <el-color-picker
              size="mini"
              :show-alpha="true"
              color-format="rgb"
              v-model="activedPage.bgClor"
              @change="colorChange"
            ></el-color-picker>
          </div>
        </el-row>

        <el-row class="list-row">
          <div class="list-tit">背景图片：</div>
          <div class="list-item">
            <el-select
              class="image-select"
              v-model="activedPage.bgImageName"
              placeholder="请选择"
              size="mini"
              filterable
              clearable
              @change="selectImage"
              @clear="clearImg"
            >
              <div class="image-opts">
                <el-option
                  v-for="item in imageData"
                  :key="item.imgId"
                  :label="item.imgName"
                  :value="item.imgId"
                ></el-option>
                <div class="place-holder-div">占位框</div>
              </div>
              <div class="local-image">
                <el-upload
                  ref="upload"
                  class="list-import"
                  :show-file-list="false"
                  action
                  accept=".jpg, .jpeg, .png"
                  :auto-upload="false"
                  :on-change="fileChange"
                >
                  <div class="tool-btn">
                    <span class="icon-A10072_add tool-btn-icon"></span>
                    <span class="tool-btn-text">本地图片</span>
                  </div>
                </el-upload>
              </div>
            </el-select>
          </div>
        </el-row>

        <el-row class="list-row">
          <div class="list-tit">开启水印：</div>
          <div class="list-item">
            <el-radio v-model="activedPage.isWatermark" label="0">否</el-radio>
            <el-radio v-model="activedPage.isWatermark" label="1">是</el-radio>
          </div>
        </el-row>
        <el-row class="list-row" v-show="pageInfo.classTypeId == '1005'">
          <div class="list-tit">背景特效：</div>
          <div class="list-item">
            <el-select v-model="activedPage.bgEffects" placeholder="请选择" size="mini">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </div>
        </el-row>
      </div>
    </div>
  </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
export default {
  components: {},
  data() {
    return {
      pageInfo: {},
      options: [
        {
          value: 0,
          label: "无"
        },
        {
          value: 1,
          label: "特效一"
        },
        {
          value: 2,
          label: "特效二"
        }
      ],
      imageData: []
    };
  },

  mounted() {
    let pageCache = sessionStorage.getItem('pageCache');
    this.pageInfo = JSON.parse(pageCache);
    this.loadImageList();
  },
  computed: {
    ...mapGetters({
      activedPage: "PageDesign/getActivedPage"
    })
  },
  methods: {
    fileChange(file) {
      let raw = file.raw;
      if (!/\/(jpg|jpeg|png)/.test(raw.type)) {
        this.$message.error("上传图片只能是 JPG、PNG 格式!");
        return;
      }
      // if (isLt200K) {
      //   this.$message.error("上传图片大小不能超过 200K!");
      //   return;
      // }
      this.imgTrans(raw);
    },
    imgTrans(file) {
      let _this = this;
      let reader = new FileReader(); //html5读文件
      reader.readAsDataURL(file); //转BASE64
      reader.onload = function(e) {
        //读取完毕后调用接口
        let base64 = e.target.result;
        _this.activedPage.bgImg = base64;
        _this.activedPage.bgImageName = "";
        console.info(base64);
      };
    },
    clearImg() {
      this.activedPage.bgImg = "";
      this.bgImageName = "";
    },
    selectImage(selectedValue) {
      this.imageData.forEach((value, index) => {
        if (value.imgId == selectedValue) {
          this.activedPage.bgImg = value.bgImg;
          this.$set(this.activedPage, "bgImageName", value.imgId);
        }
      });
    },
    colorChange(val) {
      if (val === null && this.pageInfo.classTypeId === '1005') {
        this.activedPage.bgClor = '#0a2b4c'
      }
    },
    loadImageList() {
      let param = {
        classTypeId: this.pageInfo.classTypeId
      };
      this.queryBgImageList(param)
        .then(responseData => {
          if (responseData.status == 200 && responseData.data.respResult == 1) {
            this.imageData = responseData.data.respData;
            if (this.activedPage.bgImageName) {
              this.selectImage(this.activedPage.bgImageName);
            }
          } else {
            // this.$message.error("页面信息查询失败");
          }
        })
        .catch(err => {
          // this.$message.error("页面信息查询异常");
          console.error(err);
        });
    },
    channelInputLimit(e) {
      let reg = /^\d+$/;
      let key = e.key;
      let exp = ["Backspace", "Delete", "ArrowLeft", "ArrowRight"];
      if (!exp.includes(key) && !reg.test(key)) {
        e.returnValue = false;
        return false;
      }
    },
    rangeLimit(val, type) {
      if (type == "width") {
        if (val > 1366) {
          this.$message.warning("弹窗宽度不能超过1366px");
          this.activedPage.width = "1366";
        }
      }
      if (type == "height" && val > 768) {
        if (val > 768) {
          this.$message.warning("弹窗高度不能超过768px");
          this.activedPage.height = "768";
        }
      }
    },
    ...mapActions({
      queryBgImageList: "PageDesign/queryBgImageList"
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
    border-bottom: 1px solid #0a2b4c;
  }
  .sub-title {
    font-size: 14px;
    color: #fff;
    .icon-A10235_next {
      margin-right: 8px;
      font-size: 12px;
    }
  }
  .sub-list {
    padding-top: 5px;
    padding-left: 20px;
  }
  .set-body {
    padding-left: 15px;
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
  .list-item {
    width: calc(100% - 65px);
    padding-right: 35px;
    float: left;
  }
  .list-import {
    float: left;
    margin-right: 20px;
  }
  /deep/.el-select {
  width: 100%;
  }
  /deep/.el-radio {
    color: #afc0d0;
    .el-radio__label {
      font-size: 14px;
    }
  }
  /deep/.el-color-picker__trigger {
    border-color: #0a2b4c;
    background-color: #0e3b67;
  }
  /deep/.el-input__inner {
    border-color: #001830;
    background-color: #0a2b4c;
    color: #afc0d0;
    padding-right: 70px;
    &:hover {
      border-color: #498bce;
    }
    &:focus {
      border: 1px solid #409eff;
    }
  }
  /deep/.el-radio__input.is-checked .el-radio__inner {
    border-color: #409eff;
    background: #409eff;
  }
  /deep/.el-input__count .el-input__count-inner {
    color: #fff;
    background-color: transparent;
    font-size: 12px;
    -webkit-transform: scale(0.8);
    transform: scale(0.8);
    opacity: 0.7;
  }
  .local-image {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    padding: 5px;
    background-color: #e4e7ee;
    z-index: 10;
    .tool-btn {
      .tool-btn-text {
        margin-left: 5px;
      }
      .tool-btn-icon {
        color: #409eff;
      }
      &:hover {
        .tool-btn-text {
          color: #409eff;
        }
      }
    }
  }

  .image-opts {
    max-height: 171px;
  }
  .place-holder-div {
    height: 42px;
    visibility: hidden;
  }
  .big-screen-baseset {
    /deep/.el-radio__inner {
      background-color: #08325c;
      border-color: #002243;
    }
  }

</style>
