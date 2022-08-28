<template>
  <el-form ref="form" :inline="true" label-width="80px" class="common-form-condi" size="mini">
    <el-row :gutter="30">
      <el-col
        v-for="(item, index) in data"
        :key="item.index"
        :span="computedSpan(item, index)">
        <el-form-item :label="item.type === 'checkbox' ? '' : item.name">
          <el-input
            v-if="item.type === 'input'"
            style="width:100%"
            v-model="item.vModelValue"
            placeholder="请输入内容"
          ></el-input>
          <el-select
            v-if="item.type === 'select'"
            style="width:100%"
            v-model="item.vModelValue"
            placeholder="请选择"
            clearable
          >
            <el-option
              v-for="opt in item.selectOptions"
              :key="opt.index"
              :label="opt.label"
              :value="opt.value"
            >
            </el-option>
          </el-select>
          <el-cascader
            v-if="item.type === 'cascader'"
            style="width:100%"
            popper-class="type-cascader-wrap"
            v-model="item.vModelValue"
            :options="item.selectOptions"
            :change-on-select="true"
            expand-trigger="hover"
            :show-all-levels="false"
            :props="{ expandTrigger: 'hover' }"
            clearable
          ></el-cascader>
          <el-date-picker
            v-if="item.type === 'date-picker'"
            style="width: 100%"
            value-format="yyyy-MM-dd"
            v-model="item.vModelValue"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="item.pickerOptions"
          ></el-date-picker>
          <!-- <el-checkbox
            v-if="item.type === 'checkbox' && showDemo === '1' && curCatalogId === 'myfold'"
            v-model="item.vModelValue"
          >{{ item.name }}</el-checkbox> -->
        </el-form-item>
      </el-col>
      <el-col :span="searchSpan">
        <el-form-item class="submit-condi">
          <el-button @click="search" type="primary" size="mini">查询</el-button>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script>
import { mapState } from 'vuex'
export default {
  props: ['data'],
  data () {
    return {
      searchSpan: 2
    }
  },
  methods: {
    search () {
      this.$emit('condiSubmit')
    },
    computedSpan (item, index) {
      let retSpan = 6;
      if (item.type === 'date-picker') {
        // retSpan = index === this.data.length - 2 ? 8 : 10
        retSpan = 10;
      }
      // if (item.type === 'checkbox') {
      //   retSpan = this.showDemo === '1' && this.curCatalogId === 'myfold' ? 2 : 0
      // }
      return retSpan;
    }
  },
  computed: {
    ...mapState({
      showDemo: state => state.commonProperties.showDemo, // 案例权限
      catalogId: state => state.HomeBody.catalogId,
      datasetCatalogId: state => state.DataSetMgt.catalogId,
      classTypeId: state => state.HomeTree.menuClassTypeId
    }),
    curCatalogId () {
      let catalogId = this.classTypeId === '1004' ? this.datasetCatalogId : this.catalogId
      return catalogId
    }
  }
}
</script>
