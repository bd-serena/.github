<template>
  <!-- :min-width="coloumnHeader.width+'px' || '100px'" -->
  <el-table-column
    :label="coloumnHeader.label"
    :prop="coloumnHeader.label"
    :align="coloumnHeader.align?coloumnHeader.align:'center'"
    v-on="$listeners"
    v-bind="$attrs"
    :key="coloumnHeader.pos+Math.random()"
    :show-overflow-tooltip="true"
  >
    <template slot="header" slot-scope="scope">
      <div
        @click="tbHeaderClick(coloumnHeader)"
        :title="coloumnHeader.label"
      >{{coloumnHeader.label}}</div>
    </template>
    <template v-for="item in coloumnHeader.children">
      <tableHeaderColumn
        v-if="item.children && item.children.length"
        :key="item.pos+Math.random()"
        :coloumn-header="item"
        v-bind="$attrs"
        v-on="$listeners"
      ></tableHeaderColumn>
      <el-table-column
        v-else
        :key="item.pos+Math.random()"
        :label="item.label"
        :prop="item.prop"
        :align="item.align?item.align:'center'"
        :show-overflow-tooltip="true"
      >
        <template slot="header" slot-scope="scope">
          <div @click="tbHeaderClick(item)" :title="item.label">{{item.label}}</div>
        </template>
        <template slot-scope="scope">
          <div v-bind:data="obj=showIcon(scope)">
            <i
              v-show="obj.type === 'showIcon'"
              :class="obj.clazz"
              :style="obj.style"
            ></i>
            <span :style="obj.type==='showNum'&&obj.style">{{scope.row[scope.column.property]}}</span>
          </div>
        </template>
      </el-table-column>
    </template>
  </el-table-column>
</template>

<script>
export default {
  name: "tableHeaderColumn",
  props: {
    coloumnHeader: {
      type: Object,
      required: true
    },
    colSetting: {
      type: Object
    }
  },
  methods: {
    tbHeaderClick(item) {
      this.$emit("emitTbHeaderClick", item);
    },
    showIcon(item) {
      let obj = {
        type: '',
        clazz: '',
        style: ''
      }
      try {
        const {column, row} = item
        const condi = row[`${column.property}-condi`]
        if (condi.condiSetSymbol != -1 && condi.condiSetStyle.setCondi !== undefined) {
          const style = {
            'font-size': (condi.condiSetStyle.fontSize || '') + 'px',
            color: condi.condiSetStyle.iconColor || ''
          }
          const setCondi = condi.condiSetStyle.setCondi
          setCondi === 'showIcon' ? 'icon' : (setCondi === 'showNum' ? 'num' : '')
          obj = {
            type: setCondi,
            clazz: ['dg-icon',condi.condiSetStyle.icon || ''],
            style
          }
        }
      } catch (error) {}
      return obj
    }
  }
};
</script>

<style scoped>
</style>
