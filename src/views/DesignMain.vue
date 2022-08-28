<template>
  <el-container>
    <el-header>
      <div
        class="header-compts"
        v-for="compt in edcuiCompts"
        :key="compt.comptSort"
        :data-id="compt.comptSort"
        @click="addToDesign(compt.comptSort)"
      >
        <div style="height:100%">
          <Cell :isDesign="false" :vscompt="compt"></Cell>
        </div>
      </div>
    </el-header>
    <el-container>
      <el-aside width="200px">Aside</el-aside>
      <el-main style="position:relative">
        <div id="opt-box">
          <vue-draggable-resizable
            v-if="s_edcuiCompts.length>0"
            :w="compt.blockInfo.out_w"
            :h="compt.blockInfo.out_h"
            :x="compt.blockInfo.x"
            :y="compt.blockInfo.y"
            :class="{ 'designCompt':true}"
            @dragging="onDrag"
            @resizing="onResize"
            :resizable="true"
            :grid="[1,1]"
            :parent="false"
            v-for="compt in s_edcuiCompts"
            :key="compt.comptSort"
            :data-id="compt.comptSort"
            @activated="activeCompt(compt.comptSort)"
          >
            <div style="height:100%">
              <Cell :isDesign="true" :vscompt="compt"></Cell>
            </div>
          </vue-draggable-resizable>
        </div>
        <rulerTool/>
      </el-main>
      <el-aside width="300px">
        <el-form
          v-if="activedCompt.comptAttrs"
          :label-position="labelPosition"
          label-width="90px"
          :model="activedCompt"
        >
          <el-form-item v-bind:key="attr.name" v-for="attr in attrs" :label="attr.desc">
            <el-input v-if="attr.type == 'input'" v-model="activedCompt.comptAttrs[''+attr.name]"></el-input>
            <el-select
              v-if="attr.type == 'svc-select'"
              v-model="activedCompt.table_svc"
              placeholder="请选择"
            >
              <el-option
                v-for="item in tableSvc"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-aside>
    </el-container>
  </el-container>
</template>
<script>
import Cell from "../components/design/Cell.vue";
import VueDraggableResizable from "vue-draggable-resizable";
import rulerTool from "../components/tools/rulerTool.vue";
import { service } from 'ngbd-utils'
export default {
  components: {
    Cell,
    VueDraggableResizable,
    rulerTool
  },
  data() {
    return {
      edcuiCompts: [],
      s_edcuiCompts: [
        {
          comptSort: 0,
          type: "ElTable",
          comptAttrs: {
            tableattrs: {
              data: [
                {
                  date: "2016-05-02",
                  name: "王小虎",
                  address: "上海市普陀区金沙江路 1518 弄"
                },
                {
                  date: "2016-05-04",
                  name: "王小虎",
                  address: "上海市普陀区金沙江路 1517 弄"
                }
              ],
              style: "width:100%",
              stripe: true,
              border: true,
              "highlight-current-row": true,
              "show-header": true
            },
            columns: [
              { prop: "date", label: "日期", width: "180" },
              { prop: "name", label: "姓名", width: "180" },
              { prop: "address", label: "地址" }
            ]
          },
          blockInfo: { x: 257, y: 51, out_h: 200, out_w: 443 },
          serviceId: ""
        },
        {
          comptSort: 1,
          type: "ElInput",
          comptAttrs: {
            label: "查询条件",
            labelWidth: "80px",
            m_value: "",
            placeholder: "查询名称"
          },
          blockInfo: { x: 79, y: 269, out_h: 61, out_w: 318 },
          serviceId: ""
        }
      ],
      activedCompt: {},
      labelPosition: "right",
      comptNum: 0,
      tableSvc: [
        {
          value: "http://10.1.2.111:8088/public/tableData",
          label: "表格服务1"
        }
      ],
      comptSvc: {}
    };
  },
  methods: {
    addToDesign(cid) {
      let d_cpts = this.objDeepCopy(this.edcuiCompts[cid]);
      d_cpts["comptSort"] = this.comptNum;
      d_cpts["blockInfo"] = {};
      d_cpts["serviceId"] = "";
      this.s_edcuiCompts.push(d_cpts);
      this.activedCompt = this.s_edcuiCompts[this.comptNum];
      this.comptNum++;
    },
    activeCompt(cid) {
      var cpts = this.s_edcuiCompts;
      for (var i = 0; i < cpts.length; i++) {
        if (cpts[i].comptSort == cid) {
          this.activedCompt = cpts[i];
        }
      }
    },
    onDrag(x, y) {
      this.activedCompt["blockInfo"]["x"] = x;
      this.activedCompt["blockInfo"]["y"] = y;
    },
    onResize(x, y, width, height) {
      this.activedCompt["blockInfo"]["x"] = x;
      this.activedCompt["blockInfo"]["y"] = y;
      this.activedCompt["blockInfo"]["out_h"] = height;
      this.activedCompt["blockInfo"]["out_w"] = width;
    },
    objDeepCopy(source) {
      var that = this;
      var sourceCopy = source instanceof Array ? [] : {};
      for (var item in source) {
        sourceCopy[item] =
          typeof source[item] === "object"
            ? that.objDeepCopy(source[item])
            : source[item];
      }
      return sourceCopy;
    },
    setScale() {
      var _w = window.innerWidth;
      var _h = window.innerHeight;
      var w_trans = _w / 1366;
      // var h_trans = _h/winHeit
      document.getElementById("opt-box").style.transform =
        "scale(" + w_trans + ")";
      document.getElementById("opt-box").style.transformOrigin = "0 0";
      // document.getElementsByClassName('draw-center')[0].style.transform = 'scaleY('+h_trans+')'
    }
  },
  computed: {
   
  },
  mounted() {
    // 读取默认组件配置
    const comptData = require("../../public/comptConfig/edcuiCompts.json");
    this.edcuiCompts = comptData;
    // 读取组件属性配置
    this.comptNum = this.s_edcuiCompts.length;
    // 监听窗口resize
    this.setScale();
    window.onresize = () => {
      this.setScale();
    };
  },
  watch: {
    "activedCompt.table_svc"() {
      let _cs = this.s_edcuiCompts.comptSort;
      this.comptSvc["svc" + _cs] = this.activedCompt.table_svc;
      var that = this;
      service({
        maskOff:true,
        url:this.activedCompt.table_svc,
        method:'get'
      }).then(function(response) {
          // that.activedCompt.tableattrs.data = response.data.respData.result_data_list
          var col_list = response.data.respData.result_col_list;
          var data_list = response.data.respData.result_data_list;
          var columns = that.activedCompt.columns;
          var table_data = [];
          for (var i = 0; i < data_list.length; i++) {
            let _data = {};
            for (var j = 0; j < col_list.length; j++) {
              columns[j].prop = col_list[j].col_id;
              columns[j].label = col_list[j].col_desc;
              _data["" + col_list[j].col_id] =
                data_list[i].data_list[j].data_val;
            }
            table_data.push(_data);
          }
          that.activedCompt.tableattrs.data = table_data;
          // that.activedCompt.columns = response.data.respData.result_col_list
        })
        .catch(function(error) {});
    }
  }
};
</script>
<style>
.header-compts {
  transform: translate(-20%, -20%) scale(0.6);
}
.header-compts > div {
  display: block;
  float: left;
  width: 400px;
  height: 120px;
  border: 1px dashed red;
  overflow: hidden;
}
.designCompt.active {
  border: 1px dashed green;
}
/* 拖拽部分样式 */
.resizable .handle {
  position: absolute;
  width: 5px;
  height: 5px;
}
.resizable .handle-tl {
  left: 0;
  top: 0;
  cursor: nw-resize;
}
.resizable .handle-bl {
  left: 0;
  bottom: 0;
  cursor: sw-resize;
}
.resizable .handle-br {
  right: 0;
  bottom: 0;
  cursor: nw-resize;
}
.resizable .handle-tr {
  right: 0;
  top: 0;
  cursor: sw-resize;
}
.resizable .handle-ml {
  height: 50%;
  left: 0;
  top: 25%;
  cursor: e-resize;
}
.resizable .handle-mr {
  height: 50%;
  right: 0;
  top: 25%;
  cursor: e-resize;
}
.resizable .handle-bm {
  width: 50%;
  left: 25%;
  bottom: 0;
  cursor: n-resize;
}
.resizable .handle-tm {
  width: 50%;
  left: 25%;
  top: 0;
  cursor: n-resize;
}
.draggable {
  padding: 5px;
  border: 1px dashed transparent;
}
.active.draggable {
  border: 1px dashed green;
}
</style>


