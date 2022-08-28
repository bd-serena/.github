<template>
  <el-form size="mini" :label-width="vscompt.labelWidth" style="width:470px">
    <el-form-item class="imp-select" :label="vscompt.label" :title="vscompt.label" :required="vscompt.isSetRequired">
      <el-select v-model="vscompt.import_symbol" :placeholder="'请选择'" style="width:138px">
        <el-option
          v-for="option in data1"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        ></el-option>
      </el-select>
      <el-select
        :loading="loading"
        filterable
        remote
        :remote-method="remoteMethod"
        v-model="vscompt.import_tabId"
        @focus="focusFun"
        @change="setTableName"
        style="width:177px"
      >
        <div class="datas-opt main-content-tool">
          <div class="tool-btn import-btn" @click="setListImportDialog(true)">
            <span class="icon-A10072_add tool-btn-icon"></span>
            <span class="tool-btn-text">导入跟踪群</span>
          </div>
          <div class="tool-btn fresh-btn" @click="freshData">
            <span class="icon-A10280-refresh tool-btn-icon"></span>
            <span class="tool-btn-text">刷新</span>
          </div>
        </div>
        <el-option
          v-for="option in data2"
          :key="option.id"
          :label="option.label"
          :value="option.value"
        ></el-option>
        <div style="height:25px;"></div>
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script>
import { mapState, mapActions } from "vuex";
import eventBus from "../../plugins/transData.js";
export default {
  props: ["vscompt"],
  data() {
    return {
      data1: [
        { value: "", label: "请选择" },
        { value: "100", label: "在...中" },
        { value: "101", label: "不包含" }
      ],
      data2: [],
      tableList: {},
      labelList: {},
      dataBak: [],
      loading: false
    };
  },
  mounted() {
    eventBus.$on("reload", () => {
      this.freshData();
    });
    this.freshData();
  },
  methods: {
    freshData() {
      var param = {
        userId: sessionStorage.getItem("user_id"),
        pageId: this.pageCache.pageId || ""
      };
      this.queryImportInfo(param)
        .then(val => {
          if (val.data != null && val.data.respResult == "1") {
            if(this.pageCache != null && this.pageCache.operation !== "wait") { //页面内预览不清空选项
              this.vscompt.import_tabId = "";
            }
            this.data2.splice(0, this.data2.length);
            this.tableList = {};
            this.labelList = {};
            if ((val.data.respData||[]).length > 0) {
              val.data.respData.forEach(val => {
                var temp = {
                  value: val.importInfoId,
                  label: val.importName,
                  value1: val.tableName
                };
                this.data2.push(temp);
                this.tableList[val.importInfoId] = val.tableName;
                this.labelList[val.importInfoId] = val.importName;
              });
            } else {
              this.data2.push({ value: "", label: "", value1: "" });
            }
            this.dataBak = JSON.parse(JSON.stringify(this.data2));
            this.pageCache.trackData = this.dataBak;
          } else if (val.data.respResult == "0") {
            throw val.data.respErrorDesc;
          }
        })
        .catch(err => {
          // this.$message.error(err);
        });
    },
    setTableName(val) {
      if (val == "") {
        return;
      }
      var tableName = this.tableList[val];
      var labelName = this.labelList[val];
      this.vscompt.import_tabName = tableName;
      this.vscompt.import_tabLabel = labelName;
    },
    ...mapActions({
      queryImportInfo: "compt/queryImportInfo",
      setListImportDialog: "compt/setListImportDialog"
    }),
    remoteMethod(query) {
      if (query !== "") {
        this.loading = true;
        setTimeout(() => {
          this.loading = false;
          this.data2 = this.dataBak.filter(item => {
            return item.label.toLowerCase().indexOf(query.toLowerCase()) > -1;
          });
        }, 200);
      } else {
        this.data2 = this.dataBak;
      }
    },
    focusFun() {
      if (!this.data2.length) {
        this.data2 = this.dataBak;
      }
    }
  },
  computed: {
    listImportDialog: {
      get() {
        return this.$store.state.compt.listImportDialog;
      },
      set(value) {
        this.setListImportDialog(value);
      }
    },
    ...mapState({
      pageCache: state => state.HomeBody.pageCache
    })
  }
};
</script>
<style scoped>
.imp-select .el-select {
  display: inline-block;
}
.main-content-tool {
  text-align: right;
}
.main-content-tool .tool-btn {
  cursor: pointer;
  display: inline-block;
}
.main-content-tool .tool-btn .tool-btn-icon {
  color: #409eff;
  margin-right: 5px;
}
.main-content-tool .tool-btn .tool-btn-text {
  position: relative;
  top: -1px;
}
.import-btn {
  float: left;
  margin-left: 0px;
}
.fresh-btn {
  float: right;
  margin-left: 10px;
}
.datas-opt {
  position: absolute;
  bottom: 0px;
  width: 100%;
  z-index: 999;
  padding: 0 10px;
  margin: 0;
  height: 34px;
  line-height: 35px;
  border-bottom-left-radius: 3px;
  border-bottom-right-radius: 3px;
  background-color: #e4e7ee;
}
</style>
