<template>
  <div class="desicion-tree-node">
    <div
      v-for="(item, index) in nodes"
      :key="item.id"
      class="node-col"
      @click="comptClick"
    >

      <div
        :style="computeStyle({item, index})"
      >
        <div
          class="node-label"
          :style="computedBorder({item, index})"
        >
          <svg
            viewBox="0 0 30 30"
            width="30"
            height="30"
            style="position: absolute;left: 1px;"
          >
            <circle
              cx="15"
              cy="15"
              r="10"
              :stroke="item.rate === 1 ? vscompt.comptAttrs.extendSetting.nodeColor : '#DCDFE6'"
              stroke-width="5"
              fill="none"
            />
            <path
              v-if="item.rate < 1"
              :d="computePathD(item)"
              :stroke="vscompt.comptAttrs.extendSetting.nodeColor"
              stroke-width="5"
              fill="none"
            />
          </svg>
          <div class="node-infos">
            <span
              :title="item.name"
              class="node-name"
            >
              {{ item.name }}
            </span>
            <span
              :title="item.value"
              class="node-count"
            >{{ item.value }}</span>
          </div>
          <el-popover
            :disabled="item.children.length > 0 || treeDimList.length === 0"
            ref="chooseChild"
            placement="right"
            width="60"
            trigger="hover"
          >
            <div
              v-for="data in treeDimList"
              :key="data.element_id"
              class="tree-dim-list"
            >
              <span
                @click.stop="expandNode({item, data})"
                @touchstart.stop="expandNode({item, data})"
              >
                {{ data.element_name }}
              </span>
            </div>
            <span
              @click.stop="expandNode({item, status: 'close'})"
               @touchstart.stop="expandNode({item, status: 'close'})"
              slot="reference"
              class="expend-btn"
              :style="`background-color: ${vscompt.comptAttrs.extendSetting.nodeColor}`"
            />
          </el-popover>
        </div>
      </div>
      <div :style="`width: ${linkWidth}px; left: 163px;`">
        <svg
          class="from-to-chart-center-to-svg"
          viewBox="0 0 100 1888"
          width="100"
          height="1888"
          preserveAspectRatio="none"
          style="position: absolute;"
        >
          <path
            class="from-to-chart-to-path"
            :d="computedLink(cIndex)"
            :stroke="computedLinkStroke({path, cIndex, item})"
            stroke-width="1"
            fill="none"
            v-for="(path, cIndex) in item.children"
            :key="path.id"
          />
        </svg>
      </div>
      <desicion-tree-node
        style="left: 263px;"
        v-if="item.children.length > 0"
        :nodes="item.children"
        :vscompt="vscompt"
        :query-element="currentElement"
        :level-data="currentComptData"
        :ptree-dim-list="treeDimList"
        :rule-list="currentRuleList"
      />
      <div style="clear: both;" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import {
  objDeepCopy,
  getRequestParam,
  addPageCondis,
  loadDataDone,
  getCurDimValu,
  loadDataError } from '../../utils/comonFunc.js';
import DesicionTreeNode from '@component/template/DesicionTreeNode';
import commonCompMixin from '@component/template/mixins/commonCompMixin';
export default {
  name: 'DesicionTreeNode',
  mixins: [commonCompMixin],
  components: {
    DesicionTreeNode
  },
  props: ['nodes', 'vscompt', 'queryElement', 'levelData', 'ptreeDimList', 'ruleList'],
  data () {
    return {
      offset: 0,
      linkWidth: 100,
      currentElement: null,
      // treeDimList: [],
      currentRuleList: [],
      currentComptData: [],
      // 混入watch不希望执行mixins里的代码的属性
      mixinsEffectOn: {
        isDSMapReady: true
      }
    };
  },
  mounted () {
  },
  computed: {
    treeDimList () {
      // 过滤下级可以被展开的维度
      let ret = [];
      if (this.queryElement) {
        ret = this.ptreeDimList.filter(td => {
          return td.element_id !== this.queryElement.element_id;
        });
      } else {
        ret = objDeepCopy(this.xAxisData);
      }
      return ret;
    },
    filterData () {
      return this.vscompt.comptAttrs.setting.filterColsData;
    },
    ...mapGetters({
      datafilterCols: 'QueryTable/datafilterCols'
    })
  },
  methods: {
    computeStyle (params) {
      return {
        top: 0 * params.index + 'px'
      };
    },
    computePathD (item) {
      let alpha = item.rate * 2 * Math.PI;
      let rateState = item.rate > 0.5 ? 1 : 0;
      let cw = 30;
      let ex = cw / 2 + 10 * Math.sin(alpha);
      let ey = cw / 2 - 10 * Math.cos(alpha) + this.offset;
      let d = `M ${15} 5
              A ${10} ${10}, 0, ${rateState}, 1,${ex} ${ey}`;
      return d;
    },
    computedLink (cIndex) {
      let width = 200 / this.linkWidth * 48;
      return `M200 ${24 + width * cIndex}C 133.33333333333334 ${24 + width * cIndex} 66.66666666666667 24 0 24`;
    },
    computedLinkStroke (params) {
      let { path, cIndex, item } = params;
      let stroke = '#909399';
      let childrenExpend = item.children.filter(ic => {
        return ic.children.length > 0;
      });
      if (path.children.length > 0 || (childrenExpend.length === 0 && cIndex === 0)) {
        stroke = this.vscompt.comptAttrs.extendSetting.nodeColor;
      }
      return stroke;
    },
    computedBorder (params) {
      let { item, index } = params;
      let borderColor = '#C0C4CC';
      let childrenExpend = this.nodes.filter(ic => {
        return ic.children.length > 0;
      });
      if (item.children.length > 0 || (childrenExpend.length === 0 && index === 0)) {
        borderColor = this.vscompt.comptAttrs.extendSetting.nodeColor;
      }
      return { 'border-color': borderColor };
    },
    setTreeDim () {
      // 过滤下级可以被展开的维度
      if (this.queryElement) {
        this.treeDimList = this.ptreeDimList.filter(td => {
          return td.element_id !== this.queryElement.element_id;
        });
      } else {
        this.treeDimList = objDeepCopy(this.xAxisData);
      }
    },
    expandNode (params) {
      let node = params.item;
      if (node.children.length > 0 || params.status === 'close') {
        this.$set(node, 'children', []);
      } else {
        // 设置排序字段
        let dimData = this.xAxisData.find(xad => {
          return xad.element_id === params.data.element_id;
        });
        params.data.sort = dimData.sort;
        // 把当前展开维度信息传入子组件
        this.currentElement = params.data;
        // 设置wherebean
        let whereBean = {
          'exp': '',
          'rule_list': []
        };
        let filterWhereBean = objDeepCopy(this.filterData);
        if (filterWhereBean && filterWhereBean.rule_list.length > 0) {
          // filterWhereBean = objDeepCopy(this.datafilterCols());
          filterWhereBean = objDeepCopy({
            exp: filterWhereBean.exp,
            rule_list: filterWhereBean.rule_list
          });
        }
        if (node.label !== '') { // 一级查询不需要wherebean
          let dimValue = getCurDimValu(
            node.label,
            this.levelData.rows,
            this.levelData.columns[0],
            this.vscompt.type
          );
          this.currentRuleList = [];
          let exp = 'exp_cur_' + (this.ruleList ? this.ruleList.length : 0) + '$';
          let exps;
          if (!this.ruleList || this.ruleList.length === 0) {
            exps = exp;
          } else {
            exps = [];
            this.ruleList.forEach(rl => {
              exps.push(rl.exp_id);
              // exps = rl.exp_id + ' and ' + exp;
            });
            exps.push(exp);
            exps = exps.join(' and ');
          }
          let temp = {
            'col_id': this.queryElement.col_id,
            'col_type': this.queryElement.col_type,
            'exp_id': exp,
            'is_dim': this.queryElement.dim_id ? '1' : '0',
            'symbol': 3, //=
            'rule_value': dimValue,
            'obj_id': this.queryElement.tab_id,
            'element_id': this.queryElement.element_id
          };
          this.currentRuleList.push(temp);
          this.currentRuleList = this.currentRuleList.concat(this.ruleList || []);
          // let exps = (this.ruleList && this.vscompt.comptAttrs.whereBean['exp']) ? this.vscompt.comptAttrs.whereBean['exp'] + ' and ' + exp : exp;
          whereBean = {
            'exp': exps,
            'rule_list': this.currentRuleList
          };
        }
        if (filterWhereBean) {
          if (filterWhereBean['exp'] && whereBean['exp']) {
            whereBean['exp'] += ' and ' + filterWhereBean['exp'];
          } else if (filterWhereBean['exp'] && !whereBean['exp']) {
            whereBean['exp'] = filterWhereBean['exp'];
          } else {
            // whereBean['exp'] = whereBean['exp'];
          }
          // whereBean['exp'] += (filterWhereBean['exp'] ? ' and ' : '') + filterWhereBean['exp'];
          whereBean['rule_list'] = whereBean['rule_list'].concat(filterWhereBean['rule_list']);
        }
        this.vscompt.comptAttrs.whereBean = whereBean;
        this.nodes.forEach(pnode => {
          this.$set(pnode, 'children', []);
        });
        this.queryData({ label: node.label, expandData: params.data, node: node });
      }
    },
    queryData (param) {
      let params = getRequestParam({
        param: param,
        vscompt: this.vscompt,
        drillData: this.drillData,
        xAxisData: param ? [param.expandData] : [],
        yAxis1Data: this.yAxis1Data,
        yAxis2Data: this.yAxis2Data,
        dataType: 1,
        datasetMap: this.datasetMap
      });
      this.executeReqest(params, param ? param.node : undefined);
    },
    executeReqest (params, node) {
      if (this.pageCache.operation === 'preview') {
        params = addPageCondis({
          vscompt: this.vscompt,
          params: params,
          datasetMap: this.datasetMap,
          pageParams: this.getPageParams,
          queryCompts: this.getQueryCompts(),
          pageId: this.pageCache.pageId
        });
      }
      var _this = this;
      this.vscompt.comptAttrs.loading = true;
      let computedData = this.vscompt.comptAttrs.computedData || [];
      this.queryComptData({ params, computedData })
        .then(function (response) {
          if (response.data.respResult === '1') {
            let comptData = response.data.respData;
            if (
              comptData.columns !== undefined &&
              comptData.columns.length > 0 &&
              comptData.columns.indexOf('XXXXCODE') > -1
            ) {
              comptData.columns.pop();
            }
            if (comptData.rows === null || comptData.rows === undefined) {
              comptData.rows = [];
            }
            if (comptData.columns === null || comptData.columns === undefined) {
              comptData.columns = [];
            }
            _this.vscompt.comptData = comptData;
            _this.currentComptData = objDeepCopy(comptData);
            // 格式化数据
            _this.percentData(_this.vscompt.comptData, node);
            loadDataDone(_this.vscompt);
          } else {
            loadDataError(_this.vscompt, '数据更新失败');
            // _this.$message.error("数据更新失败");
            console.error(response.data.respErrorDesc);
          }
        })
        .catch(function (error) {
          console.error(error);
          // _this.$message.error("数据更新失败");
        })
        .finally(() => {
          _this.vscompt.comptAttrs.loading = false;
        });
    },
    percentData (newVal, node) {
      if (!node) {
        let rd = newVal;
        let dtData = {
          id: Math.random() * 1000,
          name: rd.columns[0] + '(总量)',
          value: rd.rows[0][rd.columns[0]],
          rate: 1,
          label: '',
          children: []
        };
        // this.$emit('resetNodes', dtData);
        this.vscompt.comptAttrs.setting.data = [dtData];
      } else {
        let xTitle = newVal.columns[0];
        let yTitle = newVal.columns[1];
        // 计算分母
        let newRows = newVal.rows;
        let total = 0;
        newRows.forEach((newrow) => {
          total += +newrow[yTitle];
        });
        let rowOld = newVal.rows.map(item => {
          let ret = {
            id: Math.random() * 1000,
            name: item[xTitle],
            value: item[yTitle],
            label: item[xTitle],
            rate: item[yTitle] / total,
            children: []
          };
          return ret;
        });
        this.$set(node, 'children', rowOld);
      }
    },
    comptClick () {
      if (!this.vscompt.comptAttrs.mainLinkageData || this.vscompt.comptAttrs.mainLinkageData.length === 0 || this.vscompt.comptAttrs.drillData.length === 0) {
        this.gotoPage(this.vscompt.comptAttrs.extendSetting);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
$desicion-main-color: purple;
$expend-size: 8px;
.node-col {
  // display: flex;
  position: relative;
  height: 48px;
  .node-label {
    position: relative;
    display: inline-block;
    width: 160px;
    border: 1px solid $desicion-main-color;
    border-radius: 16px;
    height: 32px;
    line-height: 32px;
    padding: 0 5px;
    margin: 8px 0;
    .node-infos {
      font-size: 12px;
      width: calc(100% - 45px);
      position: absolute;
      left: 35px;
      top: 3px;
      height: 30px;
      line-height: 12px;
      > span {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100%;
      }
    }
    .node-name {
      height: 14px;
      line-height: 14px;
    }
    .node-count {
      color: #ccc;
    }
  }
  > div {
    // width: 260px;
    position: absolute;
    float: left;
    // display: flex;
    // flex-direction: column;
    // flex: 1;
    // min-width: 250px;
    // max-width: 250px;
  }
  .expend-btn {
    position: absolute;
    top: 50%;
    margin-top: -5px;
    right: -4px;
    width: $expend-size;
    height: $expend-size;
    border-radius: 50%;
    // background-color: $desicion-main-color;
    cursor: pointer;
  }
  .circle-svg {
    position: absolute;
    top: 13px;
    width: 30px; height: 30px; vertical-align: middle; margin-left: -4px; margin-top: -5px;
  }
}
</style>
<style lang="scss">
  .tree-dim-list {
    &:first-child {
      margin-top: 0px;
    }
    margin-top: 8px;
    cursor: pointer;
    :hover {
      color: #409EFF;
    }
  }
</style>
