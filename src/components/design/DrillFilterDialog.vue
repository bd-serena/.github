<template>
  <el-dialog
    size="mini"
    title="钻取数据过滤"
    width="900px"
    @close="closeDialog"
    :visible="isShow"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :destroy-on-close="true"
  >
    <div class="content-wrap">
      <el-row>
        <el-col>层级</el-col>
        <el-col>钻取字段</el-col>
        <el-col>过滤字段</el-col>
        <el-col>过滤条件</el-col>
      </el-row>
      <el-row v-for="item in drillData" :key="item.id" style="position: relative;max-height:400px" >
        <GeminiScrollbar class="my-scroll-bar" style="max-height: 400px">
          <el-row>
            <el-col>顶层</el-col>
            <el-col>
              <span>{{item.label}}</span>
            </el-col>
            <el-col class="fil-wrap">
              <el-row  v-for="i in opts[item.id]||1" :key="item.id+'_'+i">
                <el-col class="fil-col">
                  <i v-if="i===1" class="el-icon-circle-plus"  @click="addFilter(item.id)"></i>
                  <el-select
                    size="mini"
                    style="width:70%"
                    value-key="element_name"
                    v-model="valObj[item.id]&&valObj[item.id][i - 1]"
                    placeholder="请选择"
                    @change="changeValue(item.id,i)">
                    <el-option v-for="(item1,index) in colsData"
                      :key="index"
                      :label="item1.element_name"
                      :value="item1"
                      v-if="(item1.col_type=='dat' && item1.isNewCol) || item1.col_type!='dat'">
                    </el-option>
                  </el-select>
                  <i class="el-icon-delete" @click="deleteFilter(item.id,i)"></i>
                </el-col>
                <el-col class="fil-opt">
                  <FilterCell v-if="!!filterData[item.id]&&filterData[item.id][i - 1]" :filterItem="filterData[item.id][i - 1]" :id="item.id"  :key="item.id+''+filterData[item.id][i - 1].id"></FilterCell>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
          <el-row v-for="(subItem,sunIndex) in item.subDrill" :key="subItem.id">
            <el-col>{{sunIndex+1}}</el-col>
            <el-col>
              <span>{{subItem.label}}</span>
            </el-col>
            <el-col class="fil-wrap">
              <el-row v-for="i in opts[subItem.id]||1" :key="subItem.id+'_'+i">
                <el-col class="fil-col">
                  <i v-if="i===1" class="el-icon-circle-plus"  @click="addFilter(subItem.id)"></i>
                  <el-select
                    size="mini"
                    style="width:70%"
                    value-key="element_name"
                    v-model="valObj[subItem.id]&&valObj[subItem.id][i - 1]"
                    placeholder="请选择"
                    @change="changeValue(subItem.id,i)">
                    <el-option v-for="(item1,index) in colsData"
                      :key="index"
                      :label="item1.element_name"
                      :value="item1"
                      v-if="(item1.col_type=='dat' && item1.isNewCol) || item1.col_type!='dat'">
                    </el-option>
                  </el-select>
                  <i class="el-icon-delete" @click="deleteFilter(subItem.id,i)"></i>
                </el-col>
                <el-col class="fil-opt">
                  <FilterCell v-if="!!filterData[subItem.id]&&filterData[subItem.id][i-1]" :filterItem="filterData[subItem.id][i - 1]" :key="subItem.id+''+filterData[subItem.id][i - 1].id"  :id="subItem.id"></FilterCell>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </GeminiScrollbar>
      </el-row>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="closeDialog">取 消</el-button>
      <el-button type="primary" @click="submitDialog" size="mini">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import FilterCell from "../design/FilterCell.vue";
import { objDeepCopy } from "../../utils/comonFunc.js";
export default {
  props: ["showDialog", "drillData", "colsData"],
  components: {
    FilterCell
  },
  data() {
    return {
      isShow: this.showDialog,
      valObj: {},
      filterData: {},
      opts: {},
      temp: { a: [{ a: 1 }, {}] }
    }
  },
  mounted() {
    this.valObj = {}
    let data = this.drillData
    data.map(d1 => {
      let fdata = objDeepCopy(d1.filterData || []), len = fdata.length || 1
      this.$set(this.valObj, d1.id, [...fdata])
      this.$set(this.filterData, d1.id, [...fdata])
      this.$set(this.opts, d1.id, len)
      d1.subDrill.map(d2 => {
        fdata = objDeepCopy(d2.filterData || [])
        len = fdata.length || 1
        this.$set(this.valObj, d2.id, [...fdata])
        this.$set(this.filterData, d2.id, [...fdata])
        this.$set(this.opts, d2.id, len)
      })
    })
  },

  methods: {
    changeValue(id, i) {
      let item = objDeepCopy(this.valObj[id][i - 1])
      if (item.type === 'ElCascader') {
        item.dfAreaSels = []
      }
      if (this.valObj[id]) {
        this.$set(this.filterData[id], i - 1, { ...item })
        this.filterData[id][i - 1] = { ...item }
      } else {
        this.$set(this.filterData, id, [{ ...item }])
      }
    },
    addFilter(id) {
      let arr = this.valObj[id] || []
      if (arr.length > 0 && arr[arr.length - 1].af_id !== '' && arr[arr.length - 1].af_id !== undefined) {//arr.length === len
        let i = (this.opts[id] || 1) + 1
        this.$set(this.opts, id, i)
        this.valObj[id].push({})
      }
    },
    deleteFilter(id, index) {
      let obj = this.valObj[id], len = obj.length
      if (len > 0) {
        if (len == 1) {
          this.$set(this.filterData, id, [])
        }
        this.valObj[id].splice([index - 1], 1)
        this.filterData[id].splice([index - 1], 1)
      }
      let i = (this.opts[id] || 1) - 1
      this.$set(this.opts, id, i)
    },
    submitDialog() {
      this.$emit('updateShowState')
      let parentDrillData = this.$parent.cur_drillData
      parentDrillData.map(pd => {
        if (!!this.filterData[pd.id]) {
          pd.filterData = [...this.filterData[pd.id]]
        }
        pd.subDrill.map(psd => {
          if (!!this.filterData[psd.id]) {
            psd.filterData = [...this.filterData[psd.id]]
          }
        })
      })
    },
    closeDialog() {
      this.$emit('updateShowState')
    }

  }
}
</script>
<style lang="scss" scoped>
$main-clr: #409eff;
$hover-clr: #66b1ff;
$bg1: #f5f7fa;
$bd-clr1: #498bce;
$bd-clr2: #c0c4cc;
.content-wrap {
  .el-row {
    line-height: 28px;
    margin-bottom: 10px;
  }
  > .el-row {
    &:first-child {
      height: 40px;
      line-height: 40px;
      background: $bg1;
      border-bottom: 2px solid $main-clr;
      .el-col {
        padding-left: 0;
        text-align: center;
      }
    }
    &:last-child {
      margin-bottom: 0;
    }
    .gm-scroll-view > .el-row {
      margin-right: 15px;
      border-bottom: 1px dashed $bd-clr1;
      &:last-child {
        border-bottom: none;
        margin-bottom: 0;
      }
    }
  }
  .el-col {
    display: inline-block;
    text-align: center;
    &:first-child {
      width: 5%;
    }
    &:nth-child(2) {
      width: 30%;
      text-align: left;
      padding: 0 30px;
      span {
        width: 100%;
        height: 28px;
        display: block;
        border: 1px solid #dcdfe6;
        border-radius: 3px;
        line-height: 26px;
        margin-bottom: 5px;
        cursor: pointer;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 0 10px;
        font-size: 12px;
      }
    }
    &:nth-child(3) {
      width: 21%;
    }
    &:nth-child(4) {
      width: 44%;
    }
    &.fil-wrap {
      width: 65%;
      .el-row {
        padding-bottom: 10px;
        border-bottom: 1px dashed $bd-clr1;
        &:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
      }
    }
    .fil-col {
      width: 30%;
      :first-child.el-select {
        margin-left: 24px;
      }
    }
    .fil-opt {
      width: 70%;
      padding-right: 0;
      text-align: left;
    }
    > i {
      color: $main-clr;
      font-size: 14px;
      padding: 0 5px;
      cursor: pointer;
      &:hover {
        color: $hover-clr;
      }
    }
    /deep/ .el-select .el-input.is-focus .el-input__inner,
    /deep/ .el-select .el-input__inner:focus {
      border-color: $bd-clr2;
    }
  }
  /deep/.gm-scrollbar-container .gm-scroll-view {
    height: auto !important;
    max-height: 400px;
    overflow-x: hidden;
  }
  /deep/ .gm-scrollbar-container {
    right: -10px;
    left: 0;
    width: calc(100% + 10px);
  }
}
</style>
