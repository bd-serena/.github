<template>
  <div class="datafilter" style="height:300px">
    <div style="height: 100%">
      <div class="title">
        <div class="add-field">过滤字段</div>
        <el-tooltip class="field-icon" effect="dark" content="新增" placement="top">
          <i class="icon-A10417_addition" @click="addField"></i>
        </el-tooltip>
      </div>
      <el-scrollbar ref="dfscroll" style="height:270px;" v-loading="asyn">
        <div class="field-cont">
          <div v-for="(sel,idx) in selectList" class="field-list" :key="idx">
            <el-select
              v-model="sel.id"
              filterable
              size="mini"
              @change="change(sel.id,idx)"
              placeholder="请选择"
            >
              <el-option
                v-for="item in transData"
                :key="item.id"
                :label="item[SHOW_TYPE_ARR[item.show_type]]"
                :value="item.id"
              >
                <el-tooltip
                  class="field-icon"
                  effect="dark"
                  :content="item.phy_tab_name+'.'+item[SHOW_TYPE_ARR[item.show_type]]"
                  placement="right-start"
                  :open-delay="200"
                >

                  <span style="float: left;">{{item[SHOW_TYPE_ARR[item.show_type]]}}</span>
                </el-tooltip>
              </el-option>
            </el-select>
            <el-tooltip class="field-icon" effect="dark" content="删除" placement="top">
              <i class="icon-A10065_delete" @click="deleteField(sel.id,idx)"></i>
            </el-tooltip>
          </div>
        </div>

        <div class="filter-cont">
          <div v-for="(item,index) in filterData" :key="index">
            <!--数值类型 -->
            <div v-if="item.type=='ElNumber'" style="width:100%;height:29px;margin-bottom:9px;line-height:15px;">
              <div style="width: 100%;height:29px;">
                <el-col :span="10" style="height:29px;vertical-align: bottom;">
                  <el-input
                    style="width:132px;"
                    size="mini"
                    v-model="item.numList[0].exp_value"
                    :class="{'number-input':item.numList[0].label < 7}"
                    :disabled="item.numList[0].label==20||item.numList[0].label==21"
                    :type="item.numList[0].label < 7 ? 'number' : 'text'"
                    @blur="event=>numberValid(event,item.numList,0)"
                    @input="numValid(index,0)"
                    :title="item.numList[0].exp_value"
                  >
                    <el-select
                      :style="`width:${(item.numList[0].label==20||item.numList[0].label==21)?95:65}px; background-color:transparent`"
                      placeholder
                      slot="prepend"
                      size="mini"
                      :key="Math.random()"
                      v-model="item.numList[0].label"
                      @change="numberHandle(item.numList[0])"
                    >
                      <el-option
                        v-for="item in symbols"
                        :key="Math.random()"
                        :value="item.value"
                        :label="item.label"
                      ></el-option>
                    </el-select>
                  </el-input>
                </el-col>
                <el-col :span="4" style="height:29px;line-height:29px; text-align:center;">
                  且
                </el-col>
                <el-col :span="10" style="padding-left: 9px;height:29px;text-align:right">
                  <el-input
                    style="width:132px;"
                    v-model="item.numList[1].exp_value"
                    size="mini"
                    :class="{'number-input':item.numList[1].label < 7}"
                    :disabled="item.numList[1].label==20||item.numList[1].label==21"
                    :type="item.numList[1].label < 7 ? 'number' : 'text'"
                    @blur="event=>numberValid(event,item.numList,1)"
                    @input="numValid(index,1)"
                    :title="item.numList[1].exp_value"
                  >
                    <el-select
                      :style="`width:${(item.numList[1].label==20||item.numList[1].label==21)?95:65}px; background-color:transparent`"
                      placeholder
                      v-model="item.numList[1].label"
                      slot="prepend"
                      size="mini"
                      @change="numberHandle(item.numList[1])"
                    >
                      <el-option
                        v-for="item in symbols"
                        :key="Math.random()"
                        :value="item.value"
                        :label="item.label"
                      ></el-option>
                    </el-select>
                  </el-input>
                </el-col>
              </div>
            </div>
            <!--地市类型 -->
            <div
              v-else-if="item.type == 'ElCascader'"
              style="width: 100%;margin-bottom: 9px;height:29px"
              class="area"
            >
              <SelectTree
                :key="item.col_id+item.element_id"
                :options="item.dfAreaSels"
                :vscompt="item"
                :valAttrName="'exp_value'"
              />
            </div>
            <!-- 文本类型-->
            <div
              v-else-if="item.type=='ElInput'"
              style="width: 100%;margin-bottom: 9px;height:29px"
            >
              <div style="width: 100%;margin-bottom: 9px;height:29px">
                <el-input
                  placeholder
                  v-model="item.exp_value"
                  class="input-with-select"
                  size="mini"
                  style="margin-bottom: 9px;"
                  :disabled="item.symbol==20||item.symbol==21"
                  :title="item.exp_value"
                >
                  <el-select v-model="item.symbol" @change="inputHandle(item.symbol,item)" slot="prepend" placeholder style="width: 104px;">
                    <el-option
                      v-for="item in contains"
                      :key="Math.random()"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </el-input>
              </div>
            </div>
            <!-- 日期类型-->
            <div
              v-else-if="item.type=='ElDatePicker'"
              style="width: 100%;height:29px;margin-bottom: 9px;"
            >
              <el-col :span="11">
                <el-date-picker
                  size="mini"
                  v-model="item.exp_value[0]"
                  placeholder="开始日期"
                  style="margin-bottom: 9px;"
                  :type="setTimeFormat(item.show_format,2)"
                  @change="startDateChange(item.exp_value[0],index)"
                  :format="setTimeFormat(item.show_format,1)"
                  :value-format="setTimeFormat(item.show_format,1)"
                  :class="item.dateCycle=='date' ? 'datePicker-date' : 'datePicker-datetime'"
                  :title="item.exp_value[0]"
                ></el-date-picker>
              </el-col>
              <el-col :span="2" style="text-align: center;padding-top: 4px;">
                <span>至</span>
              </el-col>
              <el-col :span="11" style="text-align:right">
                <el-date-picker
                  size="mini"
                  v-model="item.exp_value[1]"
                  placeholder="结束日期"
                  style="margin-bottom: 9px;"
                  :type="setTimeFormat(item.show_format,2)"
                  @change="endDateChange(item.exp_value[1],index)"
                  :format="setTimeFormat(item.show_format,1)"
                  :value-format="setTimeFormat(item.show_format,1)"
                  :class="item.dateCycle=='date' ? 'datePicker-date' : 'datePicker-datetime'"
                  :title="item.exp_value[1]"
                ></el-date-picker>
              </el-col>
            </div>
            <div v-else-if="item.col_id && !item.type" style="width: 100%;height:29px;margin-bottom: 9px; line-height:29px;">
               <el-col :span="11">
                 <span>暂不支持</span>
              </el-col>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>
<script>
import { mapState, mapGetters, mapActions } from "vuex";
import SelectTree from "../template/ElTreeSelectNew.vue";
import { setTimeFormat, fieldMatch, objCloneByReplaceKey, inputNumber } from "../../utils/comonFunc.js";

export default {
  components: {
    SelectTree
  },
  props: ["fieldList", "ruleList", "fieldTypeList"],
  data() {
    return {
      // SHOW_TYPE_ARR:{
      //   "2": "col_chs_name",
      //   "1": "col_name",
      //   "0": "element_name"
      // },
      asynLength: 0,
      selectList: [],
      filterData: [],
      transData: [],
      asyn: true,
      conCaculs: [
        { value: "or", label: "或" },
        { value: "and", label: "且" },
        { value: "0", label: "无" }
      ],
      contains: [
        /* { value: "10", label: "包含" },
        { value: "11", label: "不包含" },
        { value: "8", label: "在…中（逗号隔开）" },
        { value: "9", label: "不在…中（逗号隔开）" },
        { value: "20", label: "为空" },
        { value: "21", label: "不为空" } */
      ],
      dfAreaSels: [],
      dfArea: [],
      symbols: [
        /* { value: "2", label: ">" },
        { value: "1", label: "<" },
        { value: "3", label: "=" },
        { value: "4", label: "<=" },
        { value: "5", label: ">=" },
        { value: 8, label: "在…中（逗号隔开）" },
        { value: 9, label: "不在…中（逗号隔开）" } */
      ],
      props: {
        value: "dim_value",
        label: "label",
        children: "children"
      }
    };
  },
  created(){
    const defaultSymbol = require("../../../public/comptConfig/cellCompt.json");
    this.symbols = defaultSymbol.ElNumberSymbols2;
    this.contains = defaultSymbol.ElInputSymbols2;
  },
  mounted() {
    var list = JSON.parse(JSON.stringify(this.fieldList));
    this.dataTrans(list);
  },
  watch: {
    asyn() {
      if (this.ruleList.length > 0 && !this.asyn) {
        this.fillback();
      }
    }
  },
  computed: {
    ...mapState({
      fieldSetList: state => state.compt.fieldSetList,
      datasetName: state => state.compt.datasetName,
      dgwMsUrl: state => state.dgwMsUrl
    }),
    ...mapGetters({})
  },

  methods: {
    ...mapActions({
      querySingleDimInfo: "AnalyReportAttr/querySingleDimInfo"
    }),
    inputHandle(sym,item){
      if(sym==20||sym==21){
        item.exp_value="";
      }
    },
    numberHandle(item){
      if(item.label==20||item.label==21){
        item.exp_value=" ";
      }else {
        item.exp_value="";
      }
    },
    setTimeFormat: setTimeFormat,
    getDimRelation(list, item, i) {
      var param = {
        dim_id: item.dim_id,
        dim_level_id: item.dim_level_id,
        is_all_data: "1",
        parent_val: ""
      };
      this.querySingleDimInfo(param).then(response => {
          var data = response.data.respData;
          for(let l1 = 0,len = list.length; l1 < len; l1++) {
            let l = list[l1]
            if(l.id === item.id) {
              i = l1
              break
            }
          }
          if (response.data.respResult == "1") {
            data = objCloneByReplaceKey(data,{"dimValue":"dim_value","dimValueDesc":"label"});
            item.dfAreaSels = data;
            this.$set(list, i, item);
          } else {
            this.$message.error("维层信息查询失败");
            item.dfAreaSels = [];
            this.$set(list, i, item);
          }
          this.asynLength--;
          if (this.asynLength == 0) {
            this.asyn = false;
          }
        })
        .catch(err => {
          // this.$message.error(err);
        });
    },
    fillback() {
      if(this.ruleList.length == 0){
        return;
      }
      this.ruleList[0].children.forEach((val, idx) => {
        var nid = "";
        var elementId = val.element_id || "";
        if (elementId.indexOf("split") > -1) {
          var id = elementId.split("split666888");
          nid = id[0] + "," + id[1];
        } else {
          nid = elementId + "," + val.col_id;
        }
        this.selectList.push({ id: nid });
        this.change(nid, idx, "fillback");
        this.fillbackFilter(val, nid);
      });
    },
    getValue(value, index) {
      var item = this.filterData[index];
      item.exp_value = value;
    },
    startDateChange(val, index) {
      var item = this.filterData[index];
      if(val==null){
        this.$set(item.exp_value, 0, "");
      }else if (val) {
        var nowDate = new Date(val).getTime();
        var originDate = new Date(item.exp_value[1]).getTime();
        if (item.exp_value[1] && nowDate > originDate) {
          this.$message.error("起始日期不得大于终止日期");
          this.$set(item.exp_value, 0, item.exp_value[1]);
        }
      }
    },
    endDateChange(val, index) {
      var item = this.filterData[index];
      if(val==null){
        this.$set(item.exp_value, 1, "");
      }else if (val) {
        var nowDate = new Date(val).getTime();
        var originDate = new Date(item.exp_value[0]).getTime();
        if (item.exp_value[0] && nowDate < originDate) {
          this.$message.error("终止日期不得小于起始日期");
          this.$set(item.exp_value, 1, item.exp_value[0]);
        }
      }
    },
    ////////////////////

    findFieldById(val) {
      //val=tab_id+","+"col_id";
      var res = {};
      var tab_id = val.split(",")[0];
      var col_id = val.split(",")[1];
      for (let item of this.transData) {
        if (item.tab_id == tab_id && item.col_id == col_id) {
          res = item;
          break;
        }
      }
      for (let item of this.filterData) {
        if (item.tab_id == tab_id && item.col_id == col_id) {
          res = null;
          break;
        }
      }
      return res;
    },
    change(val, idx, fillback) {
      var res = this.findFieldById(val);
      if (res != null) {
        this.filterData.splice(idx, 1, res);
        // res.check='check';
      } else {
        if (fillback == "fillback") {
          idx = this.selectList.length - 1;
          this.selectList.splice(idx, 1);
        } else {
          this.selectList.splice(idx, 1);
          this.filterData.splice(idx, 1);
        }
        return;
      }
    },
    deleteField(val, idx) {
      // var res=this.findFieldById(val);
      // delete(res.check);
      this.selectList.splice(idx, 1);
      this.filterData.splice(idx, 1);
    },
    addField() {
      var list = this.selectList;
      if (list.length > 0) {
        if (list[list.length - 1].id == null) {
          return;
        }
      }
      list.push({});
      this.filterData.push({});
      let div = this.$refs["dfscroll"].$refs["wrap"]; //滚动条自动滚到底部
      this.$nextTick(()=>{
        div.scrollTop = div.scrollHeight;
      })
    },
    getResult() {
      return this.condiCols(this.filterData);
    },
    dataTrans(param) {
      //数据库字段类型匹配
      var dimFieldCnt = 0; //统计有哪些维度字段
      var data = param;
      // const date_type = response.data.respData.data_cycle; //1:日，2:月，6:年
      var date_type = 1; //1:日，2:月，6:年
      for (var i = 0; i < data.length; i++) {
        var item = data[i];
        if (item.is_show == 0) {
          continue;
        }
        let col_type = item.col_type;
        let temp = { ...data[i] };
        temp.col_type =
          fieldMatch(temp.col_type, this.fieldTypeList) == "number"
            ? "No."
            : fieldMatch(temp.col_type, this.fieldTypeList) == "date"
            ? "dat"
            : temp.col_type.substring(0, 3);
        temp.element_name =
          (temp.element_name || "") == ""
            ? item.show_type == 1
              ? item.col_name
              : item.col_chs_name
            : temp.element_name;
        temp.label = temp.element_name;
        temp.id = temp.tab_id + "," + temp.col_id;
        let show_format = temp.show_format || "";
        if (show_format != "") {
          col_type = "date";
          temp.col_type = "dat";
          show_format = show_format.toLowerCase();
        }
        /*****dim_id!='' && col_type == 'date' 设为维度********/
        if ((item.dim_id||'').trim() !== '' || item.dim_id == '0') {
          dimFieldCnt++;
          //有维度
          if ((item.dim_level_id||'').trim() !== '' || item.dim_level_id == '0') {
            //维层
            temp.conArea = "single";
          }
          // temp.element_type = 1;
          temp = {
            ...temp,
            ...{
              type: "ElCascader",
              labelWidth: "90px",
              options: [],
              selected: false,
              dlselected: false,
              exp_value: [],
              symbol: "",
              treeSelVal:[]//存储下拉树复选框的值
            }
          };
          this.asynLength++;
          this.asyn = false
          // this.getDimRelation(this.transData, temp, i);
          // console.log("维度");

        } else if (fieldMatch(col_type, this.fieldTypeList) == "number") {
          // temp.element_type = 2;
          temp.col_type = "No.";
          temp = {
            ...temp,
            ...{
              type: "ElNumber",
              labelWidth: "90px",
              numList: [
                {
                  id: "0",
                  exp_value: "",
                  label: "2",
                  symbol: ""
                },
                {
                  id: "1",
                  exp_value: "",
                  label: "2",
                  symbol: ""
                }
              ], //前端构造，默认必须有
              radioCalcu: "0" //前端构造，默认必须有
            }
          };
        } else if (fieldMatch(col_type, this.fieldTypeList) == "char") {
          // temp.element_type = 1;
          temp = {
            ...temp,
            ...{
              type: "ElInput",
              labelWidth: "90px",
              selected: false,
              dlselected: false,
              exp_value: "",
              symbol: "10"
            }
          };
        } else if (fieldMatch(col_type, this.fieldTypeList) == "date") {
          // temp.element_type = 1;
          const date = new Date();
          const year = date.getFullYear();
          const month = date.getMonth();
          const day = date.getDate();
          var m_value;
          try {
            date_type =
              show_format == "yyyy"
                ? 6
                : show_format == "yyyy-mm" || show_format == "yyyy/mm"
                ? 2
                : 1;
          } catch (e) {}
          if (date_type == 1) {
            //日
            m_value =
              year +
              "-" +
              (month + 1).toString().padStart(2, "0") +
              "-" +
              day.toString().padStart(2, "0");
            temp = {
              ...temp,
              ...{
                type: "ElDatePicker",
                dateCycle: "date", //前端构造，默认必须有
                cycleType: "date", //前端构造，默认必须有
                exp_value: ['', ''],
                labelWidth: "90px",
                timeOpr: 2,
                timeOprCount: 0,
                selected: false,
                dlselected: false
              }
            };
          } else if (date_type == 2) {
            //月
            m_value = year + "-" + (month + 1).toString().padStart(2, "0");
            temp = {
              ...temp,
              ...{
                type: "ElDatePicker",
                dateCycle: "month", //前端构造，默认必须有
                cycleType: "date", //前端构造，默认必须有
                exp_value: ['', ''],
                labelWidth: "90px",
                timeOpr1: 2,
                timeOpr2: 2,
                timeOprCount1: 0,
                timeOprCount2: 0,
                selected: false,
                dlselected: false
              }
            };
          } else if (date_type == 6) {
            m_value = year + "";
            temp = {
              ...temp,
              ...{
                type: "ElDatePicker",
                dateCycle: "year", //前端构造，默认必须有
                cycleType: "date", //前端构造，默认必须有
                exp_value: ['', ''],
                labelWidth: "90px",
                timeOpr: 2,
                selected: false,
                dlselected: false
              }
            };
          }
        }

        //默认样式设置
        temp.align =
          temp.col_type == "No."
            ? (temp.dim_id || "") != ""
              ? "left"
              : "right"
            : "left";
        temp.col_type =
          temp.col_type.search(/No.|var|dat/) > -1 ? temp.col_type : "var";
        //编辑进入时

        //end
        this.transData.push(temp);
      }
      if (dimFieldCnt === 0) {
        //如果没有维度字段，则关闭加载遮罩
        this.asyn = false;
      }
    },
    fillbackFilter(val, id) {
      var target = {};
      for (var item of this.transData) {
        if (item.id == id) {
          target = item;
          break;
        }
      }
      if (target.type == "ElCascader") {
        console.info(val.init_value);
        target.exp_value = val.exp_value.split(",");
        target.symbol = val.symbol;
        target.treeSelVal = val.init_value.split(",") || val.treeSelVal || val.exp_value.split(",");
      } else if (target.type == "ElNumber") {
        if (target.numList.length > 1) {
            if (target.first == null) {
              target.numList[0].id = 0;
              target.numList[0].exp_value = val.exp_value;
              target.numList[0].label = val.symbol;
              target.numList[0].symbol = val.symbol;
              target.first = "no";
            } else {
              target.numList[1].id = 1;
              target.numList[1].exp_value = val.exp_value;
              target.numList[1].label = val.symbol;
              target.numList[1].symbol = val.symbol;
              delete target.first;
            }

        } else {
          target.numList[0].id = 0;
          target.numList[0].exp_value = val.exp_value;
          target.numList[0].label = val.symbol;
          target.numList[0].symbol = val.symbol;
        }
      } else if (target.type == "ElInput") {
        target.exp_value = val.exp_value;
        target.symbol = val.symbol;
      } else if (target.type == "ElDatePicker") {
        if (target.exp_value.length > 1) {
          if (target.first == null) {
            if(val.symbol==4){
              target.exp_value[1] = val.exp_value;
            }else if(val.symbol==5){
              target.exp_value[0] = val.exp_value;
            }
            target.first = "no";
          } else {
            target.exp_value[1] = val.exp_value;
            delete target.first;
          }
        } else {
          target.exp_value[0] = val.exp_value;
        }
      }
    },
    condiCols(filterList) {
      //查询条件字段
      let condiParam = filterList;
      let rule_group_list = [];
      condiParam.map(function(params) {
        var temp = {
          tab_alias: params.tab_alias,
          element_id: params.tab_id,
          element_type: 5,
          type: 5,
          col_id: params.col_id
        };
        if (
          params.exp_value &&
          (params.exp_value != "" || params.exp_value.length > 0)
        ) {
          if (params.type == "ElInput") {
            //模糊搜索
            let symbol = params.symbol || "-1";
            if (symbol != -1) {
              let value = params.exp_value;
              if (symbol == 9 || symbol == 21) {
                //value = null;
              }
              temp.symbol = symbol; //10:like,11:not like,8in =,9 not in ,20 为空，21 不为空
              temp.exp_value = value;
              rule_group_list.push(temp);
            }
          } else if (params.type == "ElSelect") {
            //下拉树
            temp.symbol = 8; //in
            temp.exp_value = params.exp_value;
            rule_group_list.push(temp);
          } else if (params.type == "ElDatePicker") {
            //日期
            if (params.exp_value.length > 1) {
              //区间
              value = params.exp_value[0];
              if (typeof value == "string") {
              //  value = value.replace(/-/g, "");
              } else if (value) {
                try {
                //  value = value.toLocaleDateString().replace(/-/g, "");
                } catch (e) {}
              }

              if (value) {
                let newTemp = {
                  ...temp,
                  symbol: 5, //>=
                  exp_value: value
                };

                rule_group_list.push(newTemp);
              }

              value = params.exp_value[1];
              if (typeof value == "string") {
              //  value = value.replace(/-/g, "");
              } else if (value) {
                try {
                //  value = value.toLocaleDateString().replace(/-/g, "");
                } catch (e) {}
              }

              if (value) {
                let newTemp = {
                  ...temp,
                  symbol: 4, //<=
                  exp_value: value
                };

                rule_group_list.push(newTemp);
              }
            } else {
              let value = params.exp_value[0];
              if (typeof value == "string") {
               // value = value.replace(/-/g, "");
              } else if (value) {
                try {
                 // value = value.toLocaleDateString().replace(/-/g, "");
                } catch (e) {}
              }

              if (value) {
                temp.symbol = 3; //=
                temp.exp_value = value;
                rule_group_list.push(temp);
              }
            }
          } else if (params.type == "ElCascader") {
            //维层
            var value = "";
            try {
              value = params.exp_value.join(",");
            } catch (e) {}
            temp.symbol = 8; //in
            temp.exp_value = value;
            temp.treeSelVal = params.treeSelVal;
            var nodesStr = params.treeSelVal.join(",");   
            temp.init_value = nodesStr;
            rule_group_list.push(temp);
          }
        } else if (params.numList && params.type == "ElNumber") {
          //数字类型
          let label = -1;
          if (params.numList.length > 1) {
            //区间
            //radioCalcu and or
            //let radioCalcu = params.radioCalcu || ""
            //两个条件都有
            if (
              params.numList[0].label != undefined &&
              params.numList[1].label != undefined &&
              params.numList[0].exp_value != "" &&
              params.numList[1].exp_value != ""
            ) {
              label = params.numList[0].label;
              if (label != -1) {
                let newTemp = {
                  ...temp,
                  symbol: label,
                  exp_value: params.numList[0].exp_value
                };
                rule_group_list.push(newTemp);
              }
              label = params.numList[1].label;
              if (label != -1) {
                let newTemp = {
                  ...temp,
                  symbol: label,
                  exp_value: params.numList[1].exp_value
                };
                rule_group_list.push(newTemp);
              }
            } else if (
              (params.numList[0].label != undefined &&
                params.numList[0].exp_value != "") ||
              (params.numList[1].label != undefined &&
                params.numList[1].exp_value != "")
            ) {
              let i = 0;
              if (
                params.numList[1].label != undefined &&
                params.numList[1].exp_value != ""
              ) {
                i = 1;
              }
              label = params.numList[i].label;
              if (label != -1) {
                var newTemp = {
                  ...temp,
                  symbol: label,
                  exp_value: params.numList[i].exp_value
                };
                rule_group_list.push(newTemp);
              }
            }
          } else {
            if (params.numList[0].label != undefined)
              label = params.numList[0].label;
            if (label != -1) {
              temp.symbol = label;
              temp.exp_value = params.numList[0].exp_value;
              rule_group_list.push(temp);
            }
          }
        } else if (params.symbol != -1) {
          if (params.type == "ElInput") {
            //模糊搜索
            let symbol = params.symbol || "-1";
            if (symbol != -1) {
              let value = params.exp_value;
              if (symbol == 21) {
                value = null;
              } else if (symbol == 20) {
                value = null;
              }

              temp.symbol = symbol; //10:like,11:not like,8in =,9 not in ,20 为空，21 不为空
              temp.exp_value = value;

              rule_group_list.push(temp);
            }
          }
        }
      });
      return rule_group_list;
    },
    numberValid(InputEvent,numList,order) {
      let val = numList[order].exp_value
      if (val === null || val === undefined || val === '') {
        InputEvent.target.value = ''
      } else if(numList[order].label > 7) {
        let val2 = inputNumber(val,'mulit').replace(/\-+$/g,'')
        numList[order].exp_value = val2
      }
    },
    numValid(index,order) {
      let num = this.filterData[index].numList[order]
      let val = num.exp_value
      if (num.label > 7) {
        let val2 = inputNumber(val,'mulit')
        num.exp_value = val2
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.field-icon {
  margin-left: 5px;
  cursor: pointer;
  color: #409eff;
  &:hover {
    color: #66b1ff;
  }
}
.title {
  margin-bottom: 10px;
}
.add-field {
  display: inline-block;
}
.field-cont {
  width: 210px;
  display: inline-block;
}
.filter-cont {
  width: 350px;
  float: right;
  padding-top: 5px;
}
.field-list {
  padding: 5px 0;
}

/deep/.el-scrollbar__wrap {
  overflow-x: hidden;
}

.el-scrollbar .el-scrollbar__view .el-select-dropdown__item .field-icon {
  color: #606266;
  &:hover {
    color: #66b1ff;
  }
}

.el-scrollbar
  .el-scrollbar__view
  .el-select-dropdown__item.selected
  .field-icon {
  color: #409eff;
}

.el-select-dropdown__item{
  max-width: 250px;
  .field-icon{
    width:100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}
/deep/.input-with-select.is-disabled .el-input-group__prepend {
 .el-input__icon,
 .el-input__inner {
    cursor: pointer;
  }
}
.datePicker-date{
  width:155px;
}
.datePicker-datetime{
  width:155px;
}
/deep/.number-input {
  >input.el-input__inner {
    padding-right: 0;
  }
}
/deep/ .el-input.is-disabled .el-input-group__prepend {
  .el-input__inner,
  .el-input__icon {
    cursor: pointer;
  }
}
</style>

