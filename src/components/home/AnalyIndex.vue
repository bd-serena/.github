<template>
  <el-container>
    <el-header height="60px" style="position:relative;z-index:1;">
      <div class="head-title">
          使用分析
      </div>
    </el-header>
    <el-container>
      <el-aside style="width:200px;height:100%;overflow:hidden;">
        <div class="aside-body-wrap">
          <div class="aside-body">
            <el-scrollbar style="height:100%;" class="ht-overflow">
              <el-tree
                ref="tree"
                :data="treeData"
                highlight-current:true
                node-key="id"
                :render-content="renderContent"
              ></el-tree>
            </el-scrollbar>
          </div>
        </div>
      </el-aside>

      <el-main>
        <component v-if="!isframe" v-bind:is="component"></component>
        <iframe v-if="isframe" :src="url" style="height:100%;width:100%"></iframe>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import AnalyMgt from '@/components/home/AnalyMgt'
export default {
  components: {
    'AnalyMgt': AnalyMgt
  },
  data () {
    return {
      isframe: false,
      component: null,
      url: null,
      commonProperties: {},
      treeData: [
        {
          id: 1,
          label: '应用使用分析',
          isframe: true
        },
        {
          id: 2,
          label: '用户访问统计',
          isframe: true
        },
        {
          id: 3,
          label: '应用血缘分析',
          isframe: false,
          component: 'AnalyMgt'
        }
      ]
    }
  },
  computed: {

  },
  methods: {
    handleNodeClick (node) {
      if (!node.isframe) {
        this.isframe = node.isframe
        this.component = node.component
      } else {
        this.isframe = node.isframe
        this.url = node.url
      }
    },
    renderContent (h, { node, data, store }) {
      var className = 'tree-item level0'

      return (
        <span class={className}>
          <div
            class="tree-tit ellipsis"
            on-click={val => this.handleNodeClick(data)}
          >
            <span title={data.label}>
              {data.label}
            </span>
          </div>
        </span>
      )
    }
  },
  created () {
    this.commonProperties = JSON.parse(sessionStorage.getItem('commonProperties'))
    var analyPageIds = this.commonProperties.analyPageIds
    var analyByAppId = analyPageIds.split(',')[0] || ''
    var analyByUserId = analyPageIds.split(',')[1] || ''
    this.treeData[0].url = '/dataeleph-show/v1/preview/index?pageId=' + analyByAppId
    this.treeData[1].url = '/dataeleph-show/v1/preview/index?pageId=' + analyByUserId
  },
  mounted () {
    this.$refs.tree.setCurrentKey(1)
    this.handleNodeClick(this.treeData[0])
  },
  watch: {
  }
}
</script>

<style lang="scss" scoped>
iframe{
  border: 0 !important;
}
    .el-header{
        background-color: #0a2b4c;
        height: 60px;
        line-height: 60px;
        .head-title{
            color:#fff;
            font-size: 18px;
        }
    }
    .el-main{
        background-color: #e4e7ee;
    color: #333;
    overflow: hidden;
    }
 .aside-title {
  text-align: left;
  font-size: 16px;
  color: #fff;
  height: 40px;
  line-height: 45px;
  border-bottom: 1px solid #0a2b4c;
  position: relative;
  span {
    margin-left: 10px;
  }
  .aside-title-line {
    width: 100%;
    height: 1px;
    background: #afc0d0;
    position: absolute;
    bottom: 0;
  }
}
.aside-body-wrap{
  height:100%;
  width:100%;
  float:left;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
}
.aside-body /deep/ .el-tree {
  background: transparent;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  color: #afc0d0;
}
/deep/.aside-body {
  height: 100%;
  .el-tree-node__content:hover {
    background-color: transparent;
    color: #409eff;
  }
  .el-tree-node:focus > .el-tree-node__content {
    background-color: transparent;
  }
  .el-tree-node__expand-icon {
    color: #afc0d0;
    font-size: 14px;
    margin-left: -5px;
    margin-top: -4px;
  }
  .el-tree-node__children .el-tree-node__children .is-leaf {
      color: transparent;
    }
  .el-tree-node__content {
    height: 31px;
  }
  .tree-item {
    width: 100%;
    height: 21px;
    position: relative;
    .tree-tit {
      position: absolute;
      left: 0;
      overflow: hidden;
      white-space: nowrap;
      input {
        width: 100%;
      }
    }
    .tree-tit.ellipsis {
      text-overflow: ellipsis;
    }
    &.level0,
    &.level2 {
      .tree-tit {
        right: 40px;
      }
    }
    &.level1 {
      .tree-tit {
        right: 60px;
      }
    }
    &:hover {
      .tree-icon {
        display: block;
      }
    }
  }
  .tree-icon {
    display: none;
    font-size: 18px;
    position: absolute;
    z-index: 2;
    right: 15px;
    height: 100%;
    .icon-A10278-Deleted {
      margin-left: 5px;
    }
  }
  .tree-icon:hover{
    display: block;
  }
  .el-tree-node.is-current > .el-tree-node__content .tree-tit {
    color: #409eff;
  }
}
/deep/.el-scrollbar__wrap {
  overflow: hidden;
}
.ht-overflow:hover /deep/ .el-scrollbar__wrap {
  overflow: visible;
  overflow-x: hidden;
}
/deep/ .el-scrollbar__thumb {
  background-color: rgba(10, 43, 76, 0.3);
}
.span-ellipsis {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: block;
}
.aside-menu-tree {
  width: 190px;
  height: calc(100% - 30px);
  color: #afc0d0;
}
.menu-tree-options {
  height: 40px;
  cursor: pointer;
}
.minwidth .aside-menu-tree {
  padding: 10px 0 0 8px;
}
.maxwidth .aside-menu-tree {
  padding: 10px 20px 0;
}
.menu-tree-icon {
  display: inline-block;
  vertical-align: 2px;
  font-size: 16px;
  padding: 5px;
}
.menu-tree-text {
  display: inline-block;
  overflow: hidden;
  width: 85px;
  height: 20px;
  margin-left: 20px;
  font-size: 14px;
}
.menu-slide {
  position: absolute;
  top: 5px;
  right: 50%;
  margin-right: -10px;
  font-size: 20px;
  color: #fff;
  cursor: pointer;
  z-index: 9;
}

.el-aside {
  padding: 0 15px;
}

.el-aside {
  background-color: #2f5377;
  color: #333;
}

/deep/.aside-body .el-tree-node__expand-icon{
  color: transparent !important;
}
</style>
