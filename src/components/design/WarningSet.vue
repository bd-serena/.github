<template>
  <el-dialog
    title="预警设置"
    :visible.sync="warningDialog"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="650px"
    height="100%"
    class="datafilter-dialog"
    size="mini"
    id="auto_warn_dialog"
  >
    <div class="warningset">
      <el-scrollbar style="height:100%;" :native="false" :noresize="false" tag="section">
        <el-form ref="form" :model="form" label-width="80px" style="width:calc(100% - 20px)">
          <el-form-item label="预警名称">
            <el-input v-model="form.name" size="mini" style="width:310px;"></el-input>
          </el-form-item>
          <el-form-item label class="spwidth">
            <div class="rule-wrap" id="auto_warn_condi">
              <div v-for="(item,index) in rule" :key="index">
                <el-row>
                  <el-col :span="1">
                    <span
                      style="color:#409eff;vertical-align: -3px;font-size: 16px;"
                      class="icon-A10278-Deleted"
                      @click="delCondi(index)"
                    ></span>
                  </el-col>
                  <el-col :span="7" style="padding-right:10px;">
                    <div>
                      <el-select v-model="item.col" placeholder size="mini">
                        <el-option
                          v-for="(item,index1) in activedCompt.comptAttrs.warnCol || []"
                          :label="item.label"
                          :value="item.value"
                          :key="index1"
                          :id="'auto_warn_col'+index+index1"
                        ></el-option>
                      </el-select>
                    </div>
                  </el-col>
                  <el-col :span="8" style="padding-right:10px;">
                    <div>
                      <el-select v-model="item.rele" placeholder size="mini">
                        <el-option
                          v-for="(item,index1) in condi"
                          :label="item.label"
                          :value="item.value"
                          :key="index1"
                          :id="'auto_warn_condi'+index+index1"
                        ></el-option>
                      </el-select>
                    </div>
                  </el-col>
                  <el-col :span="5">
                    <div>
                      <el-input v-model="item.val" size="mini"></el-input>
                    </div>
                  </el-col>
                  <el-col :span="3" style="padding-left:10px;">
                    <div>时预警</div>
                  </el-col>
                </el-row>
              </div>
              <div @click="addCondi" style="cursor: pointer;">
                <span
                  class="icon-A10279-new"
                  style="color:#409eff;vertical-align: -3px;font-size: 16px;"
                ></span>
                <span>添加条件</span>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="开始时间">
            <el-select
              v-model="form.region"
              placeholder="小时"
              size="mini"
              style="width：100px;"
              @change="selTime()"
            >
              <el-option
                v-for="item in form.time"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
            <span class="icon-A10139_alert" style="margin-left:15px;color:#e6a23b"></span>
            <span>每</span>
            <span>{{this.form.text}}</span>
            <span>触发警报检测</span>
          </el-form-item>
          <el-form-item label="高亮显示" class="sp3">
            <el-checkbox-group v-model="form.type" class="sp3">
              <el-checkbox label="开启" name="1"></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </el-scrollbar>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" size="mini" @click="delWarningData">取消</el-button>
      <el-button type="primary" size="mini" @click="setWarningDate">确定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { mapState, mapGetters, mapActions } from "vuex";
export default {
  components: {},
  data() {
    return {
      form: {
        text: "小时",
        name: "",
        region: 1,
        date1: "",
        date2: "",
        delivery: false,
        type: [],
        resource: "",
        desc: "",
        time: [
          { value: 1, label: "小时" },
          { value: 2, label: "30分钟" },
          { value: 3, label: "20分钟" }
        ]
      },
      newrule: [],
      warncondiText: [],
      condi: [
        { value: 2, label: ">" },
        { value: 1, label: "<" },
        { value: 3, label: "=" },
        { value: 4, label: "<=" },
        { value: 5, label: ">=" }
      ],
      rule: [
        {
          col: "", //字段
          rele: "", //关系
          val: ""
        }
      ]
    };
  },

  mounted() {
    var arr = this.activedCompt.comptAttrs.warnData[0].rule || [];
    if (arr.length != 0) {
      this.rule = this.activedCompt.comptAttrs.warnData[0].rule;
    }
    if (this.activedCompt.comptAttrs.isWarn) {
      this.form.type = ["开启"];
    }

    var name = this.activedCompt.comptAttrs.warnData[0].name;
    if (name != "") {
      this.form.name = name;
    }

    var time = this.activedCompt.comptAttrs.warnData[0].time;
    if (time != "") {
      this.form.region = time;
    }
  },
  created() {},
  computed: {
    ...mapState({
      s_edcuiCompts: state => state.PageDesign.s_edcuiCompts
    }),
    ...mapGetters({
      activeComptIdx: "PageDesign/activeComptIdx",
      getActivedCompt: "PageDesign/getActivedCompt",
      activedCompt: "PageDesign/getActivedCompt"
    }),
    warningDialog: {
      get() {
        return this.$store.state.PageDesign.warningDialog;
      },
      set(value) {
        this.setWarningDialog(value);
      }
    }
  },
  watch: {},
  methods: {
    ...mapActions({
      setWarningDialog: "PageDesign/setWarningDialog",
      setWarnDate: "PageDesign/setWarnDate",
      delWarnDate: "PageDesign/delWarnDate"
    }),
    delCondi(index) {
      if (this.rule.length == 0) {
        this.$message.error("至少留一条条件");
        return;
      } else {
        this.rule.splice(index, 1);
      }
    },
    addCondi() {
      var obj = {
        col: "",
        rele: "",
        val: ""
      };
      this.rule.push(obj);
    },
    selTime() {
      if (this.form.region == 1) {
        this.form.text = "小时";
      } else if (this.form.region == 2) {
        this.form.text = "30分钟";
      } else {
        this.form.text = "20分钟";
      }
    },
    delWarningData() {
      this.form.type = [];
      this.setWarningDialog(false);
      return;
      //this.delWarnDate();
    },
    setWarningDate() {
      for (var i = 0; i < this.rule.length; i++) {
        if (
          this.rule[i]["col"] !== "" &&
          this.rule[i]["rele"] !== "" &&
          this.rule[i]["val"] !== ""
        ) {
          this.newrule.push(this.rule[i]);
        }
      }

      var name = this.form.name;
      var rule = this.newrule;
      var type = this.form.type;
      var time = this.form.region;
      var obj = {
        name: name,
        rule: rule,
        type: type,
        time: time
      };
      this.setWarnDate(obj);
      this.setWarningDialog(false);
    }
  },
  activated() {}
};
</script>
<style lang="scss" scoped>
$border-clr01: #dcdfe6; // 边框色1
$main-color: #409eff; //主色调
$bg-clr01: #ecf5ff; // 块背景色1
$txt-clr01: #67c23a; // 文字颜色1
$txt-clr02: #fff; // 文字颜色2
$txt-clr03: #606266; // 文字颜色3
.warningset {
  height: 300px;
}
.warningset .el-form-item {
  margin-bottom: 5px !important;
}
/deep/.el-form-item__label {
  color: #606266 !important;
}
/deep/.sp3 .el-form-item__label,
.sp3 {
  height: 30px !important;
  line-height: 30px !important;
}
.rule-wrap {
  background-color: #f5f5f5;
  padding: 15px;
}
/deep/ .el-select__tags::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 6px; /*高宽分别对应横竖滚动条的尺寸*/
  height: 6px;
}
/deep/ .el-select__tags::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 5px;
  background: rgba(144, 147, 153, 0.3);
}
/deep/ .el-select__tags::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  border-radius: 0;
}
/deep/ .el-select-dropdown__item.hover,
.el-select-dropdown__item:hover {
  background-color: #fff !important;
}
/deep/ .el-select-dropdown__item {
  padding: 0px;
}
/deep/.spwidth .el-form-item__content {
  margin-left: 40px !important;
}
.el-scrollbar .el-scrollbar__view .el-select-dropdown__item {
  height: auto;
  // padding: 0;
}

/deep/.el-form-item__label {
  color: #606266 !important;
}
/deep/.el-input__inner {
  background-color: #ffffff !important;
  border: 1px solid #dcdfe6 !important;
  color: #606266 !important;
}
</style>
