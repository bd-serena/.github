
<template>
  <div class="attrSet">
    <div class="nav-title">{{activedNum == 0 ? '查询条件':'查询结果'}}</div>
    <el-tabs
      type="border-card"
      v-model="activeName"
      class="tabcard"
      v-bind:class="{ tabOption: activedNum == 0 ? true: false}"
    >
      <el-tab-pane label="数据" name="attr" style="height:100%;">
        <el-row class="el-row-24">
          <el-col :span="12">
            <div class="grid-content bg-purple" v-show="activedCompt.type=='Jixi'">
              <div class="l-title">查询字段</div>
              <!--<div @click="setListImportDialog(true)">跟踪群</div>-->
              <div class="col-setting" @click="openCondiSet" v-show="activedCompt.type=='Jixi'">
                <span class="icon-A10344_setting"></span>
                字段设置
              </div>
              <div class="condi-wrap">
                <el-scrollbar style="height:100%;" :native="false" :noresize="false" tag="section">
                  <draggable
                    :list="cur_condiData"
                    class="query-condi"
                    filter=".default-tag"
                    style="padding-right:13px"
                    :options="{group:{name:'people',pull:'clone'}}"
                    :clone="cloneDragItem"
                    @add="addToArea"
                  >
                    <el-tag
                      v-for="item in cur_condiData"
                      v-bind:class="{dl_col:item.element_type != 1?true:false}"
                      v-bind:key="item.comptSort"
                    >
                      <el-tooltip
                        placement="top"
                        :content="item.element_name"
                        :disabled="countChar(item.element_name)>8?false:true"
                      >
                        <span class="col-span">
                          <span>{{item.col_type}}</span>
                          <span>{{ item.element_name }}</span>
                        </span>
                      </el-tooltip>
                      <span style="float:right">
                        <i class="icon-A10567_fix fix-icon" v-show="item.type == 'ElCascader'"></i>
                        <i class="icon-A10423_import" v-show="item.is_import"></i>
                        <el-tooltip effect="dark" content="删除" placement="top-start">
                          <i class="opt-btn el-icon-delete" @click="deleteItem(item)"></i>
                        </el-tooltip>
                      </span>
                    </el-tag>
                  </draggable>
                  <!-- <div class="foolter" style="padding-right:13px;">
                    <el-tag class="default-tag" style="margin-bottom:0px;">双击或拖动右侧字段至此</el-tag>
                  </div> -->
                  <div class="foolter" style="padding-right: 13px">
                    <draggable
                      class="copy-condi"
                      filter=".default-tag"
                      :options="{group:{name:'people'}}"
                      v-model="copyCondi">
                    </draggable>
                    <el-tag class="default-tag">双击或拖动右侧字段至此</el-tag>
                  </div>
                </el-scrollbar>
              </div>
            </div>
            <div class="grid-content bg-purple" v-show="activedCompt.type=='ElTable'">
              <el-row class="table-wrap">
                <el-scrollbar style="height:100%;" :native="false" :noresize="false" tag="section">
                  <div class="col-title">
                    <span class="icon-A10429_orders"></span>
                    <label>展示字段</label>
                  </div>
                  <!--  @update="onUpdate" -->
                  <draggable
                    :list="tableCols"
                    class="query-table"
                    style="margin-bottom:0;padding-right: 3px;"
                    @add="addToArea"
                    filter=".default-tag"
                    :options="{group:'people'}"
                    :move="itemOnMove"
                  >
                    <el-tag
                      v-for="item in tableCols"
                      v-bind:class="{dl_col:item.element_type != 1?true:false}"
                      v-bind:key="item.id"
                    >
                      <el-tooltip
                        placement="top"
                        :content="item.element_name"
                        :disabled="countChar(item.element_name)>12?false:true"
                      >
                        <span class="col-span">
                          <span>{{item.col_type}}</span>
                          <span>{{ item.element_name }}</span>
                        </span>
                      </el-tooltip>
                      <span style="float:right">
                        <span class="sort-icon" v-show="item.is_calcul==0">
                          <el-tooltip effect="dark" content="升序" placement="top-start">
                            <i
                              class="icon-A10012_triangleEqualUp"
                              :class="item.sort == 1 ? 'selected':''"
                              @click="setSort(item,1)"
                            ></i>
                          </el-tooltip>
                          <el-tooltip effect="dark" content="降序" placement="top-start">
                            <i
                              class="icon-A10013_triangleEqualDown"
                              :class="item.sort == 2 ? 'selected':''"
                              @click="setSort(item,2)"
                            ></i>
                          </el-tooltip>
                        </span>
                        <el-tooltip effect="dark" content="删除" placement="top-start">
                          <i class="opt-btn el-icon-delete" @click="deleteItem(item)"></i>
                        </el-tooltip>
                      </span>
                    </el-tag>
                  </draggable>
                  <!-- <div style="margin-bottom:10px;" class="pr3 foolter">
                    <el-tag class="default-tag">双击或拖动右侧字段至此</el-tag>
                  </div> -->
                  <div class="foolter">
                    <draggable
                      class="copy-table"
                      filter=".default-tag"
                      :options="{group:{name:'people'}}"
                      v-model="copyTable">
                    </draggable>
                    <el-tag class="default-tag">双击或拖动右侧字段至此</el-tag>
                  </div>

                  <div class="col-title" v-show="true">
                    <span class="icon-A10184_filter"></span>
                    <label>数据过滤</label>
                    <span></span>
                    <div class="filter-setting" @click="openFilterSet">
                      <span class="icon-A10344_setting"></span>
                      设置
                    </div>
                  </div>
                  <draggable
                    v-show="true"
                    class="query-filter"
                    filter=".default-tag"
                    style="margin-bottom:0;padding-right: 3px; "
                    :options="{group:'people'}"
                    :list="filterData"
                    @add="addToArea"
                  >
                    <el-tag
                      v-for="item in filterData"
                      v-bind:class="{dl_col:item.element_type != 1?true:false}"
                      v-bind:key="item.id"
                    >
                      <span class="col-span">
                        <span>{{item.col_type}}</span>
                        <span>{{ item.element_name }}</span>
                      </span>
                      <span style="float:right">
                        <!-- <i class="icon-A10184_filter filter-icon"></i> -->
                        <i class="opt-btn el-icon-delete" @click="deleteItem(item,'filter')"></i>
                      </span>
                    </el-tag>
                  </draggable>
                  <!-- <div class="foolter pr3">
                    <el-tag
                      class="default-tag"
                      v-show="true"
                      style="margin-bottom:0;"
                    >拖动右侧字段至此</el-tag>
                  </div> -->
                  <div class="foolter">
                    <draggable class="copy-filter"
                      filter=".default-tag"
                      v-model="copyFilter"
                      :options="{group:{name:'people'}}">
                    </draggable>
                    <el-tag slot="footer"
                      class="default-tag">拖动右侧字段至此</el-tag>
                  </div>
                </el-scrollbar>
              </el-row>

              <el-button
                type="primary"
                plain
                class="up-button"
                @click="updateData"
                v-show="activedCompt.type=='ElTable'"
                size="mini"
              >结果预览</el-button>
            </div>
          </el-col>
          <el-col :span="12" style="padding:10px">
            <el-row class="grid-content bg-purple-light">
              <div class="r-title">数据集</div>
              <el-select
                filterable
                remote
                v-model="value"
                placeholder="请选择数据集"
                v-loadmore="loadMore"
                @change="getColsData"
                :remote-method="remoteMethod"
                @visible-change="resetTables"
                size="mini"
              >
                <div class="datas-opt main-content-tool">
                  <div class="tool-btn" @click="toAddDataset">
                    <span class="icon-A10072_add tool-btn-icon"></span>
                    <span class="tool-btn-text">新增数据集</span>
                  </div>
                  <div class="tool-btn" @click="refreshDataset">
                    <span class="icon-A10280-refresh tool-btn-icon"></span>
                    <span class="tool-btn-text">刷新</span>
                  </div>
                </div>
                <el-option
                  v-for="item in allTablesData"
                  :key="item.datasetId"
                  :label="item.datasetName"
                  :value="item.datasetId"
                ></el-option>
                <div style="height:25px;min-width:200px"></div>
              </el-select>

              <el-input
                class="input-search"
                placeholder="输入关键字搜索"
                prefix-icon="el-icon-search"
                v-model="filterText"
                size="mini"
              ></el-input>

              <el-row class="el-row-12">
                <div class="col-title" style="color: #45fffd;">
                  <span class="icon-A10602_OpenGovernance"></span>
                  <label>维度</label>
                </div>
                <div class="col-wrap">
                  <div class="col-subtitle">
                    字段名称
                    <el-checkbox
                      v-show="activedNum ==1"
                      class="wdcbx cbox"
                      v-model="wdCheckAll"
                      @change="checked=>dsColChange(checked,'wd')"
                    >全选</el-checkbox>
                  </div>
                  <div class="cols-item">
                    <el-scrollbar
                      style="height:100%;"
                      :native="false"
                      :noresize="false"
                      tag="section"
                    >
                      <!-- @end="addToField" -->
                      <draggable
                        class="col-block"
                        :sort="false"
                        v-model="allColsData"
                        @start="todraggedItem"
                        :move="itemOnMove"
                        :options="{group:{name:'people',pull:'clone',put:false}}"
                        :clone="cloneDragItem"
                        filter=".date-tag"
                      >
                        <div
                          class="col-item"
                          v-bind:class="{ selected: (activedNum == 0 && wdChecked && item.selected)||(activedNum == 1 && item.dlselected) }"
                          v-for="(item,index) in allColsData"
                          v-if="item.element_type == 1"
                          v-bind:key="item.id+'_'+index"
                          @dblclick="toOption(index,$event,'wd')"
                          :index="index"
                          v-show="dateOpenList[item.element_id] == undefined || !(!dateOpenList[item.element_id] && item.isNewCol)"
                        >
                          <el-tooltip
                            placement="top"
                            :content="item.element_name"
                            :open-delay=1000
                          >
                            <div class="item-wrap" :class="item.col_type == 'dat' && !item.isNewCol && item.formatLevel != undefined ? 'date-tag':''">
                              <span v-if="!item.isNewCol">{{item.col_type}}</span><span v-else></span>
                              <a href="javascript:;" @click="isOpen(item)" v-show="item.col_type == 'dat' && !item.isNewCol && item.formatLevel != undefined">
                                <span
                                  v-bind:class="(dateOpenList[item.element_id] == undefined || dateOpenList[item.element_id]) ? 'icon-A10009_triangleDown': 'icon-A10011_triangleRight'"
                                  style="color:#afc0d0;width:10px;margin-left: -10px;"
                                ></span>
                              </a>
                              {{ item.element_name }}
                            </div>
                          </el-tooltip>
                        </div>
                        <!-- <div
                          class="col-item"
                          v-bind:class="{ selected: (activedNum == 0 && wdChecked && item.selected)||(activedNum == 1 && item.dlselected) }"
                          v-for="(item,index) in allColsData"
                          v-if="item.element_type == 1 && ((activedNum == 1 && !item.isNewCol) || activedNum == 0)"
                          :key="`${item.id}_${index}_${activedNum}`"
                          @dblclick="toOption(index,$event,'wd')"
                          :index="index"
                          v-show="!dateOpenList[item.element_id] || !(!dateOpenList[item.element_id] && item.isNewCol)"
                        >
                          <el-tooltip
                            placement="left"
                            :content="item.element_name"
                            :open-delay=1000
                          >
                            <div class="item-wrap" :class="activedNum == 0 && item.col_type == 'dat' && !item.isNewCol && item.formatLevel != undefined ? 'date-tag':''">
                              <span v-if="!item.isNewCol">{{item.col_type}}</span><span v-else></span>
                              <a href="javascript:;" @click="isOpen(item)" v-show="item.col_type == 'dat' && !item.isNewCol && item.formatLevel != undefined">
                                <span
                                  v-if="activedNum === 0"
                                  v-bind:class="(!dateOpenList[item.element_id] || dateOpenList[item.element_id]) ? 'icon-A10009_triangleDown': 'icon-A10011_triangleRight'"
                                  style="color:#afc0d0;width:10px;margin-left: -10px;"
                                ></span>
                              </a>
                              {{ item.element_name }}
                            </div>
                          </el-tooltip>
                        </div> -->
                        <!-- <el-tag v-for="item in allColsData" v-bind:key="item.id">{{ item.label }}</el-tag> -->
                      </draggable>
                    </el-scrollbar>
                  </div>
                </div>
              </el-row>
              <el-row class="el-row-12 dl-cols">
                <div class="col-title">
                  <span class="icon-A10196_ruler"></span>
                  <label>度量</label>
                </div>

                <div class="col-wrap">
                  <div class="col-subtitle">
                    字段名称
                    <!-- <i v-if="activedCompt.type!='Jixi'" class="compute-icon icon-A10072_add" @click="showComputeDialog=true"></i> -->
                    <el-checkbox
                      v-show="activedNum ==1"
                      class="cbox"
                      v-model="dlCheckAll"
                      @change="checked=>dsColChange(checked,'dl')"
                      style="margin-right:10px"
                    >全选</el-checkbox>
                  </div>
                  <div class="cols-item">
                    <el-scrollbar
                      style="height:100%;"
                      :native="false"
                      :noresize="false"
                      tag="section"
                    >
                      <!-- @end="addToField" -->
                      <draggable
                        class="col-block"
                        :sort="false"
                        v-model="allColsData"
                        @start="todraggedItem"
                        :move="itemOnMove"
                        :options="{group:{name:'people',pull:'clone',put:false}}"
                        :clone="cloneDragItem"
                      >
                        <div
                          class="col-item"
                          v-bind:class="{ selected: (activedNum == 0 && dlChecked && item.selected)||(activedNum == 1&&item.dlselected) }"
                          v-for="(item,index) in allColsData"
                          v-if="item.element_type != 1"
                          v-bind:key="item.id"
                          @dblclick="toOption(index,$event,'dl')"
                          :index="index"
                        >
                          <el-tooltip
                            placement="left"
                            :content="item.element_name"
                            :open-delay=1000
                          >
                            <div class="item-wrap">
                              <span>{{item.col_type}}</span>
                              {{ item.element_name }}
                              <span @click="deleteComputed(item.element_id)" v-if="item.is_calcul!='0' && item.from_compt" class="group-delete icon-A10065_delete"></span>
                            </div>
                          </el-tooltip>
                        </div>
                      </draggable>
                    </el-scrollbar>
                  </div>
                </div>
              </el-row>
            </el-row>
          </el-col>
        </el-row>
        <!-- <el-button type="success" @click="openCondiSet" v-show="activedCompt.type=='Jixi'">条件设置</el-button> -->

        <el-dialog
          size="mini"
          title="条件设置"
          :visible.sync="dialogTableVisible"
          :close-on-click-modal="false"
          :before-close="cancelSet"
        >
          <CondiSet v-if="dialogTableVisible" ref="condiset"></CondiSet>
          <span slot="footer" class="dialog-footer">
            <el-button size="mini" @click="cancelSet">取 消</el-button>
            <el-button size="mini" type="primary" @click="conditionSet">确 定</el-button>
          </span>
        </el-dialog>
      </el-tab-pane>
      <el-tab-pane label="设置" name="style" class="grid-content">
        <AdvanceSet ref="advanceset1" v-show="activedCompt.type==='ElTable'"></AdvanceSet>
        <QueryCondiset ref="SearchCondiset" v-show="activedCompt.type==='Jixi'"></QueryCondiset>
      </el-tab-pane>
    </el-tabs>
    <el-dialog
      title="批量设置"
      :visible.sync="batchDialogVisible"
      :close-on-click-modal="false"
      width="500px"
      height="100%"
      class="batch-dialog"
      size="mini"
      :before-close="handleClose"
    >
      <div style="height:220px;overflow:hidden;">
        <el-scrollbar style="height: 100%;overflow:hidden;" v-if="batchDialogVisible">
          <el-form ref="dialog-form" label-width="170px" size="mini">
            <!-- s_edcuiCompts[1].comptAttrs.columns -->
            <el-form-item
              :label="item.label+':'"
              v-for="(item,index) in noComputedTbCols"
              v-if="item.element_type == 2"
              :key="item.prop+index"
            >
              <el-select
                v-model="item.calcAttrBak"
                placeholder="请选择"
                size="mini"
                @change="calcChange(index)"
              >
                <el-option
                  v-for="item in calcData"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-scrollbar>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="upBatchDialog(false)" size="mini">取 消</el-button>
        <el-button type="primary" @click="batchSettings" size="mini">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="数据过滤"
      :visible.sync="datafilterDialogVisible"
      width="540px"
      height="100%"
      class="datafilter-dialog"
      size="mini"
      :before-close="closeFilterSet"
    >
      <Datafilter ref="dataFilter" v-if="datafilterDialogVisible"></Datafilter>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="closeFilterSet">取 消</el-button>
        <el-button type="primary" @click="sureDataFilter" size="mini">确 定</el-button>
      </span>
    </el-dialog>
    <ListImportDialog></ListImportDialog>
    <el-dialog
      size="mini"
      title="编辑计算字段"
      :visible.sync="showComputeDialog"
      :close-on-click-modal="false"
      width="700px"
      v-loading="true"
    >
        <ComputedDesign
          v-if="showComputeDialog"
          ref="ComputedDesign"
          :allData="allData"
          :fieldTypeList="fieldTypeList"
          :formatList="formatList"
          :datasetDetail="datasetDetail"
          @cpfieldAddSuccess="cpfieldAddSuccess"
        ></ComputedDesign>
        <span slot="footer" class="dialog-footer">
          <el-button size="mini" @click="showComputeDialog=false">取 消</el-button>
          <el-button size="mini" type="primary" @click="addComputedField">确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>
<script>
import ComputedDesign from "./ComputedDesign.vue";
import draggable from "vuedraggable";
import CondiSet from "./CondiSet";
import AdvanceSet from "./AdvanceSet";
import QueryCondiset from "./QueryCondiset";
import getUUID from "../../utils/UUID.js";
import { mapState, mapGetters, mapMutations, mapActions } from "vuex";
import { setTimeout } from "timers";
import Datafilter from "./DateFilter.vue";
import ListImportDialog from "./ListImport.vue";
import {
  objDeepCopy,
  fieldMatch,
  dealDataSetInfo,
  concatComputedData,
  initFuncDateParam,
  mapDataSetInfoKey
} from "../../utils/comonFunc.js";

export default {
  components: {
    draggable,
    CondiSet,
    AdvanceSet,
    Datafilter,
    ListImportDialog,
    QueryCondiset,
    ComputedDesign
  },
  data() {
    return {
      datasetDetail: {}, //当前数据集详情
      showComputeDialog: false,
      filterText1: "",
      filterText: "",
      value: "",
      valueIsChange: false,
      datasetName: "",
      initAfId: "",
      wdCheckAll: false,
      dlCheckAll: false,
      condiWdCheckAll: false,
      condiDlCheckAll: false,
      tabWdCheckAll: false,
      tabDlCheckAll: false,
      wdChecked: false,
      dlChecked: false,
      dialogTableVisible: false,
      activeName: "attr",
      draggedItem: [],
      allData: [],
      start: 1,
      wdColsLen: 0,
      dlColsLen: 0,
      cur_wdCondiData: [],
      cur_dlCondiData: [],
      wdtableCols: [],
      dltableCols: [],
      cur_condiData: [],
      condiOpt: "",
      onesLoad: true,
      datafilterDialogVisible: false,
      beforeSetData: [], // 弹窗设置前保存一份数据
      beforeFilterData: [], //数据过滤前保存一份
      calcData: [
        {
          value: "",
          label: "无"
        },
        {
          value: 1,
          label: "COUNT"
        },
        {
          value: 2,
          label: "SUM"
        },
        {
          value: 3,
          label: "AVG"
        },
        {
          value: 4,
          label: "MAX"
        },
        {
          value: 5,
          label: "MIN"
        }
      ],
      fieldTypeList: {}, //数据库字段类型
      dateOpenList:{},//用来记录新增加的日期字段展开还是收缩
      formatList: [],//日期源格式
      copyTable: [],
      copyFilter: [],
      copyCondi: [],
      copyFlag: -1
    };
  },
  watch: {
    filterText(val) {
      this.filterNode(val);
    },
    cur_condiData(vals) {
      var that = this;
      var _repeat = 0;
      let wdlen = 0,
        dllen = 0;
      for (let i = 0; i < vals.length; i++) {
        // 不允许重复字段拖入查询条件区域
        if (this.wdCheckAll || this.dlCheckAll) {
          //全选进入时
          for (let j = 0; j < vals.length; j++) {
            if (
              vals[i].element_name == vals[j].element_name &&
              vals[i].id == vals[j].id
            ) {
              _repeat++;
              if (_repeat == 2) {
                if (i > j) {
                  vals.splice(i, 1);
                  i--;
                } else {
                  vals.splice(j, 1);
                  j--;
                }
                _repeat = 0;
                break;
              }
            }
          }
          _repeat = 0;
        } else {
          // for (var j = 0; j < this.draggedItem.length; j++) {
          if (
            vals[i].element_name == this.draggedItem.element_name &&
            vals[i].id == this.draggedItem.id
          ) {
            _repeat++;
            if (_repeat == 2) {
              vals.splice(i, 1);
              break;
            }
          }
          // }
        }
        /**计算 是否全选**/
        if (vals[i].element_type == 1) {
          wdlen++;
        } else {
          dllen++;
        }
        /**end**/
      }
      // var target = this.activedCompt.comptAttrs.fieldList;
      var target = this.s_edcuiCompts[0].comptAttrs.fieldList;

      if (target && target.length > vals.length) {
        if (this.condiOpt == "add") {
          return;
        }
      }
      try {
        var old = objDeepCopy(target);
        target.splice(1, target.length - 1);
        var _tl = vals.length;
        for (let j = 0; j < _tl; j++) {
          var temp = null;
          for (var k = 0; k < old.length; k++) {
            if (vals[j].element_id == old[k].comptAttrs.element_id) {
              temp = old[k];
              break;
            }
          }
          var _item = {};
          if (temp) {
            _item = temp;
          } else {
            _item = {
              comptAttrs: vals[j],
              type: vals[j].type,
              comptSort: that.comptNum
            };
          }
          that.upComptNum("add");
          target.push(_item);
        }
      } catch (e) {}

      this.condiDlCheckAll = this.dlColsLen == dllen && dllen != 0 ? true : false;
      this.condiWdCheckAll = this.wdColsLen == wdlen && wdlen != 0 ? true : false;
      this.dlCheckAll = this.condiDlCheckAll;
      this.wdCheckAll = this.condiWdCheckAll;
    },
    tableCols(vals) {
      // var that = this;
      // var _repeat = 0;
      let wdlen = 0,
        dllen = 0;
      for (var i = 0; i < vals.length; i++) {
        // 不允许重复字段拖入查询条件区域
        /**计算 是否全选**/
        if (vals[i].element_type == 1) {
          wdlen++;
        } else {
          dllen++;
        }
        /**end**/
      }
      this.tabWdCheckAll = this.wdColsLen == wdlen && wdlen != 0 ? true : false;
      this.tabDlCheckAll = this.dlColsLen == dllen && dllen != 0 ? true : false;
      this.dlCheckAll = this.tabDlCheckAll;
      this.wdCheckAll = this.tabWdCheckAll;
    },
    activedNum(val) {
      if (val == 0) {
        this.activeName = "attr";
        this.wdCheckAll = this.condiWdCheckAll;
        this.dlCheckAll = this.condiDlCheckAll;
        // 清除组件计算字段
        for(let i=0;i<this.allColsData.length;i++){
          if(this.allColsData[i].from_compt){
            this.allColsData.splice(i,1)
          }
        }
        this.allData = objDeepCopy(this.allColsData);
      } else {
        this.wdCheckAll = this.tabWdCheckAll;
        this.dlCheckAll = this.tabDlCheckAll;
        // 如果组件有计算字段拼接到度量里面
        let af_id = this.activedCompt.afId || "";
        if(af_id!=""){
          let computedData = this.activedCompt.comptAttrs.computedData || [];
          if(computedData.length > 0) {
            concatComputedData(af_id,this.allColsData,computedData);
            this.allData = objDeepCopy(this.allColsData);
          }
        }
      }
    },
    wdCheckAll(checked) {
      if (this.activedNum == 0) {
        this.condiWdCheckAll = checked;
      } else {
        this.tabWdCheckAll = checked;
      }
    },
    dlCheckAll(checked) {
      if (this.activedNum == 0) {
        this.condiDlCheckAll = checked;
      } else {
        this.tabDlCheckAll = checked;
      }
    },
    loaderSign(sign) {
      const _this = this;
      let af_id = "";
      if (sign == true) {
        try {
          let condiParam = this.s_edcuiCompts[0].comptAttrs.fieldList;
          af_id = this.s_edcuiCompts[0].afId;
          let condiData = [];
          let tableData = [];
          condiParam.map(function(params) {
            if (params.type == "ElButton") {
              return false;
            }
            condiData.push(params.comptAttrs);
          });
          // _this.cur_condiData=(condiData)
          //结果字段
          let tableParam = this.s_edcuiCompts[1].comptAttrs.columns;
          tableParam.map(function(params) {
            tableData.push(params);
          });
          this.initAfId = af_id || "";
          if (this.onesLoad && this.initAfId != "") {
            this.getAllTablesData(af_id);
            this.getColsData(af_id, condiData, tableData);
          }
        } catch (e) {}
      } else if (sign == "default") {
        //置空
        _this.wdCheckAll = false;
        _this.dlCheckAll = false;
        _this.condiWdCheckAll = false;
        _this.condiDlCheckAll = false;
        _this.tabWdCheckAll = false;
        _this.tabDlCheckAll = false;
        _this.wdChecked = false;
        _this.dlChecked = false;
        _this.cur_wdCondiData = [];
        _this.cur_dlCondiData = [];
        _this.cur_condiData = [];
        _this.upAllCols([]);
        _this.value = "";
        _this.datasetName = "";
        var reset_data = { data: [], type: "reset" };
        _this.upTableCols(reset_data);
      }
    },
    allColsData(vals) {
      const _this = this;
      _this.wdColsLen = 0;
      _this.dlColsLen = 0;
      for (var i = 0; i < vals.length; i++) {
        const temp = vals[i];
        if (temp.element_type == 1 && !temp.isNewCol) {//新增的日期分层字段不加入维度字段总计中
          //维度
          _this.wdColsLen++;
        } else if (temp.element_type != 1) {
          //度量
          _this.dlColsLen++;
        }
      }
      if (this.activedNum == 0) {
        if (this.wdColsLen != this.cur_wdCondiData.length) {
          this.wdCheckAll = false;
        } else if (
          this.wdColsLen == this.cur_wdCondiData.length &&
          this.wdColsLen != 0
        ) {
          this.wdCheckAll = true;
        }
        if (this.dlColsLen != this.cur_dlCondiData.length) {
          this.dlCheckAll = false;
        } else if (
          this.dlColsLen == this.cur_dlCondiData.length &&
          this.dlColsLen != 0
        ) {
          this.dlCheckAll = true;
        }
      } else {
        if (this.wdColsLen != this.wdtableCols.length) {
          this.wdCheckAll = false;
        } else if (
          this.wdColsLen == this.wdtableCols.length &&
          this.wdColsLen != 0
        ) {
          this.wdCheckAll = true;
        }
        if (this.dlColsLen != this.dltableCols.length) {
          this.dlCheckAll = false;
        } else if (
          this.dlColsLen == this.dltableCols.length &&
          this.dlColsLen != 0
        ) {
          this.dlCheckAll = true;
        }
      }
    },
    value(val) {
      this.valueIsChange = true;
    },
    copyFilter(val) {
      if (val.length > 0 && this.copyFlag > -1) {
        const add_data = { data: { ...this.draggedItem }, type: "add" };
        this.upFilterData(add_data);
      } else if(val.length > 0) {
        this.copyFilter = []
        this.copyFlag = -1
      }
    },
    copyCondi(val) {
      if (val.length > 0 && this.copyFlag > -1) {
        this.cur_condiData.push({ ...this.draggedItem })
        if (this.allColsData[this.copyFlag].element_type == 1) {
          this.wdChecked = true;
        } else {
          this.dlChecked = true;
        }
        this.allColsData[this.copyFlag].selected = true;
        this.allData[this.copyFlag].selected = true;
      } else if(val.length > 0) {
        this.copyCondi = []
        this.copyFlag = -1
      }
    },
    copyTable(val) {
      if (val.length > 0 && this.copyFlag > -1) {
        const add_data = { data: { ...this.draggedItem }, type: "add" };
        this.upTableCols(add_data);
        if (this.allColsData[this.copyFlag].element_type == 1) {
          this.wdChecked = true;
        } else {
          this.dlChecked = true;
        }
        this.allColsData[this.copyFlag].dlselected = true;
        this.allData[this.copyFlag].dlselected = true;
      } else if(val.length > 0) {
        this.copyTable = []
        this.copyFlag = -1
      }
    }
  },
  computed: {
    ...mapState({
      comptNum: state => state.compt.comptNum,
      radioCycle: state => state.QueryTable.radioCycle,
      condiData: state => state.QueryTable.condiData,
      tableCols: state => state.QueryTable.tableCols,
      filterData: state => state.QueryTable.filterData,
      allColsData: state => state.QueryTable.allColsData,
      allTablesData: state => state.QueryTable.allTablesData,
      datasChange: state => state.QueryTable.datasChange,
      colValue: state => state.QueryTable.colValue,
      datasetUrl: state => state.datasetUrl,
      s_edcuiCompts: state => state.compt.s_edcuiCompts,
      activedNum: state => state.compt.activedNum,
      loading: state => state.compt.loading,
      loaderSign: state => state.QueryTable.loaderSign,
      dgwMsUrl: state => state.dgwMsUrl,
      defaultSystemId: state => state.defaultSystemId,
      batchDialogVisible: state => state.QueryTable.batchDialogVisible,
      pageCache: state => state.HomeBody.pageCache,
      dimList: state => state.QueryTable.dimList,
      msuList: state => state.QueryTable.msuList,
      importField: state => state.compt.importField,
      queryType: state => state.QueryTable.queryType
    }),
    ...mapGetters({
      activedCompt: "compt/getActivedCompt",
      condiCols: "QueryTable/condiCols",
      colValue: "QueryTable/colValue",
      resultCols: "QueryTable/resultCols",
      tableColumn: "QueryTable/tableColumn",
      summarizeCols: "QueryTable/summarizeCols",
      noComputedTbCols: "QueryTable/noComputedTbCols"
    })
  },
  mounted() {},
  activated() {
    let page = JSON.parse(sessionStorage.getItem("pageCache"));
    this.start = 1;
    this.value = this.activedCompt.afId;
    this.datasetName = "";
    this.upComptDatasetName("");
    this.activeName = "attr";
    this.resetTableData([]);
    this.getAllTablesData(); // 修改第二次进入时数据集为空的bug
    if(!page.classTypeId){
      this.upActivedId("1");
      this.getAllTablesData(page.datasetId);
      this.getColsData(page.datasetId);
      setTimeout(()=>{
        this.dsColChange(true,'wd');
        this.dsColChange(true,'dl');
        this.updateData();
      },800)  
    }
    this.onesLoad = true;
    if (this.pageCache.pageId == null) {
      this.initAfId = "";
    }
  },
  methods: {
    deleteComputed(id) {
      let sign = false;
      let list = this.activedCompt.comptAttrs.computedData || [];
      for(let i=0;i<list.length;i++){
        if(list[i].element_id == id){
          list.splice(i,1);
          sign = true;
          break;
        }
      }
      if(sign){
        let list = this.allColsData || [];
        for(let i=0;i<list.length;i++) {
          if(list[i].element_id == id){
            list.splice(i,1);
            break;
          }
        }
        let slist = this.tableCols;
        for(let i=0;i<slist.length;i++) {
          if(slist[i].element_id == id){
            slist.splice(i,1);
            break;
          }
        }
      }
    },
    cpfieldAddSuccess(cpfield){
      cpfield.element_id = getUUID();
      let list = [cpfield];
      let result = dealDataSetInfo(list,this.pageCache.pageId || "","",this.fieldTypeList,this.formatList)
      result[0].from_compt = true;
      let computedData = this.activedCompt.comptAttrs.computedData;
      this.allColsData.push(result[0])
      this.allData.push(result[0])
      if(computedData && computedData.length>0) {
        computedData.push(result[0]);
      } else {
        this.$set(this.activedCompt.comptAttrs,'computedData',result);
      }
      this.showComputeDialog = false;
    },
    addComputedField() {
      var ComputedDesign = this.$refs.ComputedDesign;
      ComputedDesign.saveComputedField();
    },
    handleClose() {
      this.upBatchDialog(false);
    },
    filterNode(value) {
      // if (!value) return true;
      this.filterCols({ value: value, data: this.allData });
      // this.allColsData = value ? this.allData.filter(item => item.label.includes(value)) : this.allData
    },
    calcChange(index) {
      let columns = this.s_edcuiCompts[1].comptAttrs.columns || [];
      var currentObj = columns[index];
      let _this = this;
      columns.forEach((item, i) => {
        if (item.prop == currentObj.prop) {
          if (i == 0) {
            if (_this.s_edcuiCompts[1].comptAttrs.totalRow) {
              _this.$message.error(
                "表格首字段无法进行数值汇总，请将该字段设为非首字段"
              );
              _this.calc_value = "";
              columns[i].calcAttr = "";
              columns[i].calcAttrBak = "";
            }
          }
        }
      });
    },
    todraggedItem(evt) {
      const _idx = evt.item.attributes.index.value;
      if (
        JSON.stringify(this.condiData).indexOf(this.allColsData[_idx].id) > -1
      ) {
        // this.$message({
        //   message: '条件已存在',
        //   type: 'warning'
        // });
        // return;
      }
      // Vue.set(this.allColsData[_idx], 'selected', true)
      const _itemdata = { ...this.allColsData[_idx] };
      this.draggedItem = _itemdata;
    },
    allowDrop() {
      return false;
    },
    deleteItem(item, $event) {
      this.condiOpt = "delete";
      if (this.activedNum == 0) {
        let c_d = this.cur_condiData;
        for (let i = 0; i < c_d.length; i++) {
          //日期分层级需要新增加两个判断条件（formatLevel、isNewCol）
          if (c_d[i].element_id == item.element_id && c_d[i].formatLevel == item.formatLevel && c_d[i].isNewCol == item.isNewCol) {
            c_d.splice(i, 1);
            // var reset_data = { data: c_d, type: "reset" };
            // this.upCondiData(reset_data);
            if (item.element_type == 1) {
              this.condiWdCheckAll = false;
              this.wdCheckAll = false;
            } else {
              this.condiDlCheckAll = false;
              this.dlCheckAll = false;
            }
            break;
          }
        }
      } else {
        if ($event == "filter") {
          //过滤器
          let c_d = this.filterData.slice();
          for (let i = 0; i < c_d.length; i++) {
            //日期分层级需要新增加两个判断条件（formatLevel、isNewCol）
            if (c_d[i].element_id == item.element_id && c_d[i].formatLevel == item.formatLevel && c_d[i].isNewCol == item.isNewCol) {
              c_d.splice(i, 1);
              let reset_data = { data: c_d, type: "reset" };
              this.upFilterData(reset_data);
              break;
            }
          }
        } else {
          //查询结果
          var c_d = this.tableCols;
          for (let i = 0; i < c_d.length; i++) {
            //日期分层级需要新增加两个判断条件（formatLevel、isNewCol）
            if (c_d[i].element_id == item.element_id && c_d[i].formatLevel == item.formatLevel && c_d[i].isNewCol == item.isNewCol) {
              c_d.splice(i, 1);
              let reset_data = { data: c_d, type: "reset" };
              this.upTableCols(reset_data);
              if (item.element_type == 1) {
                this.tabWdCheckAll = false;
                this.wdCheckAll = false;
              } else {
                this.tabDlCheckAll = false;
                this.dlCheckAll = false;
              }
              break;
            }
          }
          if (item.element_type == "1" && this.dimList.length > 0) {
            //删除维度汇总
            for (var d = 0; d < this.dimList.length; d++) {
              if (this.dimList[d].id == item.element_name) {
                this.dimList.splice(d, 1);
                break;
              }
            }
          } else if (item.element_type == "2" && this.msuList.length > 0) {
            //删除度量汇总
            for (var m = 0; m < this.msuList.length; m++) {
              if (this.msuList[m].id == item.element_name) {
                this.msuList.splice(m, 1);
                break;
              }
            }
          }
        }
      }
      if ($event != "filter") {
        //非过滤器
        var a_c_d = this.allColsData;
        for (let i = 0; i < a_c_d.length; i++) {
          //日期分层级需要新增加两个判断条件（formatLevel、isNewCol）
          if (a_c_d[i].element_id == item.element_id && a_c_d[i].formatLevel == item.formatLevel && a_c_d[i].isNewCol == item.isNewCol) {
            if (this.activedNum == 0) {
              this.allColsData[i].selected = false;
            } else {
              this.allColsData[i].dlselected = false;
            }
            break;
          }
        }
        for (let i = 0; i < this.allData.length; i++) {
          //日期分层级需要新增加两个判断条件（formatLevel、isNewCol）
          if (this.allData[i].element_id == item.element_id && this.allData[i].formatLevel == item.formatLevel && this.allData[i].isNewCol == item.isNewCol) {
            if (this.activedNum == 0) {
              this.allData[i].selected = false;
            } else {
              this.allData[i].dlselected = false;
            }
            break;
          }
        }
        // this.allData = this.objDeepCopy(this.allColsData)
      }
    },
    addToField(nv) {
      const _idx = nv.item.attributes.index.value;
      if (nv.to.className == "query-table") {
        if (
          JSON.stringify(this.tableCols).indexOf(this.allColsData[_idx].id) > -1
        ) {
          this.$message({
            message: "查询结果已存在",
            type: "warning"
          });
          return;
        }
        this.allColsData[_idx].dlselected = true;
        this.allData[_idx].dlselected = true;
        const add_data = { data: { ...this.draggedItem }, type: "add" };
        this.upTableCols(add_data);
      } else if (nv.to.className == "query-condi") {
        this.condiOpt = "add";
        // const fieldAttrs = {};
        // var target = this.activedCompt.comptAttrs.fieldList;
        if (
          JSON.stringify(this.condiData).indexOf(this.allColsData[_idx].id) > -1
        ) {
          this.$message({
            message: "条件已存在",
            type: "warning"
          });
          return;
        }
        if (this.allColsData[_idx].element_type == 1) {
          this.wdChecked = true;
        } else {
          this.dlChecked = true;
        }
        this.allColsData[_idx].selected = true;
        this.allData[_idx].selected = true;
        const add_data = { data: { ...this.draggedItem }, type: "add" };
        this.upCondiData(add_data);
      } else if (nv.to.className == "query-filter") {
        if (
          JSON.stringify(this.filterData).indexOf(this.allColsData[_idx].id) >
          -1
        ) {
          this.$message({
            message: "数据过滤已存在",
            type: "warning"
          });
          return;
        }
        // this.allColsData[_idx].dlselected = true
        const add_data = { data: { ...this.draggedItem }, type: "add" };
        this.upFilterData(add_data);
      }
    },
    itemOnMove(nv) {
      this.copyFlag = -1
      let _idx = this.getItemInColIdx(nv.draggedContext.element);
      if (["copy-table","query-table"].includes(nv.to.className)) {
        if (
          JSON.stringify(this.tableCols).indexOf(this.allColsData[_idx].id) >
            -1 &&
          nv.from.className != "query-table"
        ) {
          this.$message.closeAll();
          this.$message({
            message: "查询结果已存在",
            type: "warning"
          });
          return false;
        } else {
          this.copyFlag = _idx
          return true;
        }
      } else if (["copy-condi","query-condi"].includes(nv.to.className)) {
        if (nv.draggedContext.element.is_calcul == "1" || nv.draggedContext.element.is_calcul == "2") {
          //计算度量不能作为查询条件
          this.$message.closeAll();
          this.$message({
            message: "计算字段不能作为查询条件",
            type: "warning"
          });
          return false;
        }
        const reg = /\([Y|M|D|H|I|S]*\)/g;
        let id = this.allColsData[_idx].id.replace(reg, "");
        if ( JSON.stringify(this.cur_condiData).indexOf( id ) > -1 && nv.from.className != "query-condi" ) {
          this.$message.closeAll();
          this.$message({
            message: "条件已存在",
            type: "warning"
          });
          return false;
        } else {
          this.copyFlag = _idx
          return true;
        }
      } else if (["copy-filter","query-filter"].includes(nv.to.className)) {
        if (nv.draggedContext.element.is_calcul == "1" || nv.draggedContext.element.is_calcul == "2") {
          //计算度量不能作为查询条件
          this.$message.closeAll();
          this.$message({
            message: "计算字段不能作为过滤条件",
            type: "warning"
          });
          return false;
        }
        if ( JSON.stringify(this.filterData).indexOf(this.allColsData[_idx].id) > -1 && nv.from.className != "query-filter" ) {
          this.$message.closeAll();
          this.$message({
            message: "数据过滤已存在",
            type: "warning"
          });
          return false;
        } else {
          this.copyFlag = _idx
          return true;
        }
      }
    },
    getItemInColIdx(row) {
      let _idx = -1;
      for (let index = 0; index < this.allColsData.length; index++) {
        if(this.activedNum === 0 && row.col_type === "dat"){
          if (this.allColsData[index].element_id === row.element_id && this.allColsData[index].isNewCol && this.allColsData[index].formatLevel === row.formatLevel) {
            _idx = index;
            break;
          }
        } else{
          if (this.allColsData[index].element_id === row.element_id) {
            _idx = index;
            break;
          }
        }
      }
      return _idx;
    },
    addToArea(nv) {
      let _idx = -1;
      try {
        if (nv.item) {
          _idx = nv.item.attributes.index.value;
        } else {
          _idx = this.getItemInColIdx(nv.draggedContext.element);
        }
      } catch (error) {
        var title = nv.item.innerText;
        title = title.substring(title.indexOf(".") + 1, title.length);
        var newIdx = -1;
        for (let index = 0; index < this.allColsData.length; index++) {
          const element = this.allColsData[index];
          if (element[this.SHOW_TYPE_ARR[element.show_type]] == title) {
            newIdx = index;
            break;
          }
        }
        _idx = newIdx;
      }
      // const _idx = nv.item.attributes.index.value || -1;
      if (nv.to.className == "query-table") {
        this.allColsData[_idx].dlselected = true;
        this.allData[_idx].dlselected = true;
      } else if (nv.to.className == "query-condi") {
        if (this.allColsData[_idx].element_type == 1) {
          this.wdChecked = true;
        } else {
          this.dlChecked = true;
        }
        this.allColsData[_idx].selected = true;
        this.allData[_idx].selected = true;
      } else if (nv.to.className == "query-filter") {
        //字段拖到过滤区域不要更改右边的选中状态
        // this.allColsData[_idx].dlselected = true;
        // 如果是从展示字段拖到数据过滤区域，应该将右侧对应选中效果取消
        if (nv.from.className == "query-table") {
          this.allColsData[newIdx].dlselected = false;
          this.allData[newIdx].dlselected = false;
        }
      }
    },
    checkField(nv) {},
    onUpdate(item) {
      var target = this.tableCols;
      target.splice.apply(
        target,
        [item.newIndex, 0].concat(target.splice(item.oldIndex, 1))
      );
      var reset_data = { data: target, type: "reset" };
      this.upTableCols(reset_data);
      let columns = this.s_edcuiCompts[1].comptAttrs.columns;
      let index = 0;
      columns.forEach((item, idx) => {
        if (item.element_id == target[0].element_id) {
          index = idx;
        }
      });
      if (
        columns[index].calcAttr != "" &&
        target[0].element_type == 2 &&
        this.s_edcuiCompts[1].comptAttrs.totalRow
      ) {
        this.$message.error("表格首字段无法进行数值汇总，请修改汇总方式为‘无’");
      }
    },
    reSort() {
      var target = this.activedCompt.comptAttrs.fieldList;
      var vals = objDeepCopy(this.cur_condiData);
      var targetBak = objDeepCopy(target);
      target.splice(1, target.length - 1);
      var _tl = vals.length;
      for (var j = 1; j <= _tl; j++) {
        var _item = {
          comptAttrs: targetBak[j].comptAttrs,
          type: targetBak[j].type,
          comptSort: this.comptNum
        };
        this.upComptNum("add");
        target.push(_item);
      }
    },
    openCondiSet() {
      this.dialogTableVisible = true;
      var target = this.activedCompt.comptAttrs.fieldList;
      this.beforeSetData = objDeepCopy(target);
    },
    cancelSet() {
      this.dialogTableVisible = false;
      this.activedCompt.comptAttrs.fieldList = this.beforeSetData;
    },
    openFilterSet() {
      //过滤器弹窗
      this.datafilterDialogVisible = true;
      this.$nextTick(() => {
        let target = this.$refs["dataFilter"].filterData;
        this.beforeFilterData = objDeepCopy(target);
      });
    },
    closeFilterSet() {
      if (this.beforeFilterData) {
        this.cancelFilterSet(this.beforeFilterData);
      }
      this.datafilterDialogVisible = false;
    },
    sureDataFilter() {
      this.s_edcuiCompts[1].comptAttrs.filterData = this.filterData;
      this.datafilterDialogVisible = false;
      this.updateData();
    },
    dsColChange(ev, type) {
      if (this.activedNum == 1) {
        //查询结果执行这里
        this.tbColChange(ev, type);
        return false;
      }
      //查询条件 执行这里
      let _this = this;
      if (type == "wd") {
        //维度
        this.wdChecked = ev;
        this.allColsData.map(function(item, index) {
          if (item.element_type == 1) {
            item.selected = ev;
            if (ev) {
              _this.cur_wdCondiData.push(item);
              _this.cur_condiData.push(item);
            } else {
              _this.cur_wdCondiData = [];
            }
          }
        });
        if (this.filterText == "") {
          this.allData.map(function(item, index) {
            if (item.element_type == 1) {
              item.selected = ev;
            }
          });
        }
      } else {
        this.dlChecked = ev;
        this.allColsData.map(function(item, index) {
          if (item.element_type != 1) {
            item.selected = ev;
            if (ev) {
              _this.cur_dlCondiData.push(item);
              _this.cur_condiData.push(item);
            } else {
              _this.cur_dlCondiData = [];
            }
          }
        });
        if (this.filterText == "") {
          this.allData.map(function(item, index) {
            if (item.element_type != 1) {
              item.selected = ev;
            }
          });
        }
      }

      var wd = _this.cur_wdCondiData;
      var dl = _this.cur_dlCondiData;
      var vals = this.cur_condiData;

      for (var i = 0; i < vals.length; i++) {
        // 去重
        if (type == "wd") {
          if (wd.length == 0) {
            if (vals[i].element_type == 1) {
              vals.splice(i, 1);
              i--;
            }
          } else {
            let _repeat = 0;
            for (let j = 0; j < vals.length; j++) {
              if (
                vals[i].element_name == vals[j].element_name &&
                vals[i].id == vals[j].id
              ) {
                _repeat++;
                if (_repeat == 2) {
                  vals.splice(i, 1);
                  i--;
                  break;
                }
              }
            }
          }
        } else {
          if (dl.length == 0) {
            if (vals[i].element_type != 1) {
              vals.splice(i, 1);
              i--;
            }
          } else {
            let _repeat = 0;
            for (let j = 0; j < vals.length; j++) {
              if (
                vals[i].element_name == vals[j].element_name &&
                vals[i].id == vals[j].id
              ) {
                _repeat++;
                if (_repeat == 2) {
                  vals.splice(i, 1);
                  i--;
                  break;
                }
              }
            }
          }
        }
      }
      var reset_data = { data: vals, type: "reset" };
      _this.upCondiData(reset_data);
    },
    tbColChange(ev, type) {
      let _this = this;
      if (type == "wd") {
        //维度
        //已选择日期维度的element_id集合，用来判断是否已经选中日期了，如果选中了则用当前层级的日期字段，未选中则默认选中第一层（YYYY）
        let elementIdArr = [];
        let selArr =  objDeepCopy(_this.tableCols);
        for (let index = 0; index < selArr.length; index++) {
          if (
            selArr[index] != undefined &&
            !elementIdArr.includes(selArr[index].element_id) &&
            selArr[index].col_type == "dat" && selArr[index].element_type == 1
          ) {
            elementIdArr.push(selArr[index].element_id);
          }
        }
        this.allColsData.map(function(item, index) {
          //如果日期字段未选中，则默认选中第一层（YYYY）
          if (ev && item.element_type == 1 && !elementIdArr.includes(item.element_id) && ((item.col_type === "dat" && item.isNewCol && item.formatLevel === 1) || item.col_type !== "dat")){
          // if (ev && item.element_type == 1 && !elementIdArr.includes(item.element_id) && ((item.col_type == "dat" && !item.isNewCol) || item.col_type != "dat")) {
            item.dlselected = ev;
            _this.wdtableCols.push(item);
            _this.tableCols.push(item);
          } else if(!ev && item.element_type == 1){
            item.dlselected = ev;
            _this.wdtableCols = [];
          }
        });
        if (this.filterText == "") {
          this.allData.map(function(item, index) {
            if (item.element_type == 1 && ((item.col_type === "dat" && item.isNewCol && item.formatLevel === 1) || item.col_type !== "dat")) {
            // if (item.element_type == 1 && ((item.col_type == "dat" && !item.isNewCol) || item.col_type != "dat")) {
              item.dlselected = ev;
            }
          });
        }
      } else {
        this.allColsData.map(function(item, index) {
          if (item.element_type != 1) {
            item.dlselected = ev;
            if (ev) {
              _this.dltableCols.push(item);
              _this.tableCols.push(item);
            } else {
              _this.dltableCols = [];
            }
          }
        });
        if (this.filterText == "") {
          this.allData.map(function(item, index) {
            if (item.element_type != 1) {
              item.dlselected = ev;
            }
          });
        }
      }
      var vals = this.tableCols;
      var _repeat = 0;
      for (var i = 0; i < vals.length; i++) {
        // 去重
        if (type == "wd") {
          if (!ev) {
            if (vals[i].element_type == 1) {
              vals.splice(i, 1);
              i--;
            }
          } else {
            _repeat = 0;
            for (let j = 0; j < vals.length; j++) {
              if (
                vals[i].element_name == vals[j].element_name &&
                vals[i].id == vals[j].id
              ) {
                _repeat++;
                if (_repeat == 2) {
                  if (i > j) {
                    vals.splice(i, 1);
                    i--;
                  } else {
                    vals.splice(j, 1);
                    j--;
                  }
                }
              }
            }
          }
        } else {
          if (!ev) {
            if (vals[i].element_type != 1) {
              vals.splice(i, 1);
              i--;
            }
          } else {
            _repeat = 0;
            for (let j = 0; j < vals.length; j++) {
              if (
                vals[i].element_name == vals[j].element_name &&
                vals[i].id == vals[j].id
              ) {
                _repeat++;
                if (_repeat == 2) {
                  if (i > j) {
                    vals.splice(i, 1);
                    i--;
                  } else {
                    vals.splice(j, 1);
                    j--;
                  }
                }
              }
            }
          }
        }
      }
      var reset_data = { data: vals, type: "reset" };
      _this.upTableCols(reset_data);
    },
    toOption(index, obj, type) {
      if (this.activedNum == 0) {
        //日期字段双击特殊处理：第一个日期字段不可使用，只能使用各层级字段，并且只能拖入相同日期的一个层级。
        if (obj.target.parentNode.className.indexOf("selected") == -1 &&
        (this.allColsData[index].col_type == 'dat' && this.allColsData[index].isNewCol || this.allColsData[index].col_type != 'dat') &&
        JSON.stringify(this.cur_condiData).indexOf(this.allColsData[index].element_id) == -1) {
          if (type == "wd") {
            this.wdChecked = true;
          } else {
            this.dlChecked = true;
          }
          this.allColsData[index].selected = true;
          this.allData[index].selected = true;
          this.cur_condiData.push(objDeepCopy({ ...this.allColsData[index] }));
        }
      } else {
        if (obj.target.parentNode.className.indexOf("selected") == -1 &&
          (this.allColsData[index].col_type == 'dat' && this.allColsData[index].isNewCol || this.allColsData[index].col_type != 'dat') &&
        JSON.stringify(this.tableCols).indexOf(this.allColsData[index].element_id) == -1) {
          this.allColsData[index].dlselected = true;
          this.allData[index].dlselected = true;
          this.tableCols.push(objDeepCopy(this.allColsData[index]));
        }
      }
    },
    setSort(val, sort) {
      //sort 1 asc,2 desc
      var tableData = this.tableCols;
      tableData.map((item, i) => {
        if (item.col_id == val.col_id) {
          if (tableData[i].sort == sort) {
            this.$set(tableData[i], "sort", null);
          } else {
            this.$set(tableData[i], "sort", sort);
          }
        }
      });
    },
    getAllTablesData(datasetId = "", query = "") {
      var param = {
        datasetId: datasetId,
        start: this.start,
        tenantId:window.sessionStorage.getItem("tenant_id"),
        catalogId: "workfold",
        siteFalg:"1",
        objType: "dads",
        isEdit: 0
      };
      if (query != "") {
        param.datasetName = query.replace(/(^\s*)|(\s*$)/g, "");
        if (this.start == 1) {
          this.resetTableData([]);
        }
      }
      this.getDataSetList(param)
        .then(response => {
          let data = response.data.respData;
          let tempData = this.allTablesData;
          if (response.data.respResult == 1 && data && data.length > 0) {
            const curData = data.filter(item => item.datasetId === datasetId)
            if (datasetId != "" && curData.length > 0) {
              tempData.unshift(curData[0]);
              this.value = curData[0].datasetId;
            }
            tempData = [...tempData, ...data];
            this.resetTableData(this.unique(tempData));
          } else {
            if (datasetId == "" && this.allTablesData.length == 0) {
              this.start = null;
              this.$message.error("数据集为空");
            }
          }
        })
        .catch(function(error) {
          // _this.$message.error("数据集加载失败");
        });
    },
    unique(arr) {
      const res = new Map();
      return arr.filter(arr => !res.has(arr.datasetId) && res.set(arr.datasetId, 1));
    },
    getColsData(value, cd, td) {
      this.setSelectAf(value); //设置当前选择的afid
      let _this = this;
      //置空
      // this.initAfId = "";
      this.filterText1 = "";
      this.wdCheckAll = false;
      this.dlCheckAll = false;
      this.condiWdCheckAll = false;
      this.condiDlCheckAll = false;
      this.tabWdCheckAll = false;
      this.tabDlCheckAll = false;
      this.wdChecked = false;
      this.dlChecked = false;
      this.cur_wdCondiData = [];
      this.cur_dlCondiData = [];
      this.cur_condiData = [];
      this.wdtableCols = [];
      this.dltableCols = [];
      let filterData = [];
      if (this.s_edcuiCompts[1] != null) {
        filterData = this.s_edcuiCompts[1].comptAttrs.filterData || [];
      }
      this.upFilterData({ data: filterData, type: "reset" });
      let reset_data = { data: [], type: "reset" };
      this.upTableCols(reset_data);
      if (!this.onesLoad) {
        this.s_edcuiCompts[1].comptAttrs.columns = [];
        this.s_edcuiCompts[1].comptAttrs.tableattrs.data = [];
        this.s_edcuiCompts[1].comptAttrs.pagination.currentPage = 1;
        this.s_edcuiCompts[1].comptAttrs.pagination.total = 0;
        this.s_edcuiCompts[1].comptAttrs.totalRow = false;
        this.upColValue("");
        this.$refs.advanceset1.calc_value = "";
      } else {
        this.onesLoad = false;
      }
      let datasetId = value;
      /* let anly_subject_id = "";
      for (let i = 0; i < this.allTablesData.length; i++) {
        if (this.allTablesData[i].datasetId == value) {
          datasetId = this.allTablesData[i].datasetId;
          _this.upComptDatasetName(this.allTablesData[i].datasetName);
          break;
          // anly_subject_id = this.allTablesData[i].anly_subject_id;
        }
      } */
      try {
        this.s_edcuiCompts[0].afId = datasetId;
        this.s_edcuiCompts[1].afId = datasetId;
      } catch (e) {}
      let param = {
        datasetId,
        isQueryTabHis: 1,
        isEdit: 0
      };
      this.upAllCols([]);
      this.wdColsLen = 0;
      this.dlColsLen = 0;
      this.queryDbColConf({})
        .then(response => {
          if (response.status == 200 && response.data.respResult == "1") {
            this.fieldTypeList = response.data.respData || {};
            this.queryDateFormatList({}).then(response => {
              if (response.status == 200 && response.data.respResult == "1") {
                this.formatList = response.data.respData || [];
                this.getDataSetInfo({
                  type: "dataasset",
                  param: param
                }).then(response => {
                    if (
                      response.data.respResult == 1 &&
                      response.data.respErrorCode != -1 &&
                      response.status == 200 &&
                      response.data.respData
                    ) {
                      const respData = mapDataSetInfoKey(response.data.respData)
                      _this.datasetDetail = respData;
                      const data = respData.anly_frame_elements || []
                      if (data.length === 0) {
                        return
                      }
                      // const date_type = response.data.respData.data_cycle; //1:日，2:月，6:年
                      // var date_type = 1; //1:日，2:月，6:年
                      for (let i = 0; i < data.length; i++) {
                        let item = data[i];
                        item.is_import = false;
                        item.import_pageId = _this.pageCache.pageId || "";
                        item.import_symbol = "";
                        item.import_tabName = "";
                        item.import_tabId = "";
                        item.col_raw_type = item.col_type;
                        if (item.is_show == 0 || item.is_calcul == '2') { //聚合类字段不展示
                          continue;
                        }
                        let defc = { selected: false, dlselected: false };
                        let col_type = item.col_type; //type
                        let temp = { ...data[i], ...defc };
                        temp.col_type =
                          fieldMatch(temp.col_type, _this.fieldTypeList) == "number"
                            ? "No."
                            : fieldMatch(temp.col_type, _this.fieldTypeList) == "date"
                            ? "dat"
                            : temp.col_type.substring(0, 3);
                        temp.element_name =
                          (temp.element_name || "") == ""
                            ? item.show_type == 1
                              ? item.col_name
                              : item.col_chs_name
                            : temp.element_name;
                        temp.label = temp.element_name;
                        temp.id = temp.element_id + temp.element_name; //放在elename_name赋值之后，防止element_name为空的情况
                        let dateTypeList = [];//用来存放，根据源时间格式衍生出的多个不同层级日期字段
                        let show_format = temp.show_format || "";
                        let source_format = temp.source_format || "";
                        if ((show_format != "" || source_format != "") && temp.element_type == 1) {
                          //如果原字段类型是数值或者字符串的，根据源格式转换获取的格式来判断当前是第几级（1表示年,2表示月,3表示日,4表示小时,5表示分钟,6表示秒）
                          if(fieldMatch(col_type, _this.fieldTypeList) == "number" || fieldMatch(col_type, _this.fieldTypeList) == "char"){
                            for(let i = 0; i < _this.formatList.length; i++){
                              //数据源中的源格式YYYYMMDDHHMISS更改成yyyyMMddhh24miss，所以得把格式变成大写且去掉24来匹配是否一致。
                              //若一致，把YYYYMMDDHHMISS替换成yyyyMMddhh24miss
                              if(_this.formatList[i].formatStr.toLocaleUpperCase().replace("24","") == source_format.toLocaleUpperCase().replace("24","")){
                                temp.formatLevel = _this.formatList[i].formatLevel;
                                temp.show_format = _this.formatList[i].formatStr;
                                temp.source_format = _this.formatList[i].formatStr;
                                break;
                              }
                            }
                          } else if (fieldMatch(col_type, _this.fieldTypeList) == "date") {
                            //如果字段原类型是日期的，则默认展示到秒
                            temp.formatLevel = 6;
                            temp.show_format = "yyyy-MM-dd hh24:mi:ss"
                            temp.source_format = "yyyy-MM-dd hh24:mi:ss";
                          }
                          col_type = "date";
                          temp.col_type = "dat";
                        }

                        /*****dim_id!='' && col_type == 'date' 设为维度********/
                        if ((item.dim_id||'').trim() !== '' || item.dim_id == '0') {
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
                              m_value: [],
                              treeSelVal:[]//存储下拉树复选框的值
                            }
                          };
                        } else if (fieldMatch(col_type, _this.fieldTypeList) == "number") {
                          // temp.element_type = 2;
                          temp.col_type = "No.";
                          temp = {
                            ...temp,
                            ...{
                              type: "ElNumber",
                              labelWidth: "90px",
                              numList: [{ id: "0", label: 2, m_value: "" }], //前端构造，默认必须有
                              radioCalcu: "0", //前端构造，默认必须有
                              defaultNumList: [{ id: "0", label: 2, m_value: "" }] //前端构造，默认必须有，用来存放默认值
                            }
                          };
                        } else if (fieldMatch(col_type, _this.fieldTypeList) == "char") {
                          // temp.element_type = 1;
                          temp = {
                            ...temp,
                            ...{
                              type: "ElInput",
                              withSelect: true,
                              labelWidth: "90px",
                              selected: false,
                              dlselected: false,
                              m_value: "",
                              symbol: 10,
                              defaultSymbol: 10 //设置默认值，和symbol保持一致
                            }
                          };
                        } else if (fieldMatch(col_type, _this.fieldTypeList) == "date") {
                          // temp.element_type = 1;
                          /*const date = new Date();
                          const year = date.getFullYear();
                          const month = date.getMonth();
                          const day = date.getDate();
                          var m_value;*/

                          var split1 = "";
                          if (show_format.indexOf("/") > -1) {
                            split1 = "/";
                          } else if (show_format.indexOf("-") > -1) {
                            split1 = "-";
                          }
                          //1表示年,2表示月,3表示日,4表示小时,5表示分钟,6表示秒
                          for(let i = 1; i <= temp.formatLevel; i++){
                            let dateTemp = objDeepCopy(temp);
                            dateTemp.element_type = Number(dateTemp.element_type);
                            dateTemp.formatLevel = i;//日期字段的层级（1表示年,2表示月,3表示日,4表示小时,5表示分钟,6表示秒）
                            dateTemp.isNewCol = true;//用来判断是否是日期字段新增加的日期层级字段
                            let dateCycle = "year"
                            if (i == 1) {
                              //年
                              dateCycle = "year";
                              dateTemp.element_name = dateTemp.element_name + "(YYYY)";
                              dateTemp.show_format = temp.show_format.substring(0,4);
                            } else if (i == 2) {
                              // 月
                              dateCycle = "month";
                              dateTemp.element_name = dateTemp.element_name + "(MM)";
                              dateTemp.show_format = split1 == "" ? temp.show_format.substring(0,6):temp.show_format.substring(0,7);

                            } else if (i == 3) {
                              // 日
                              dateCycle = "date";
                              dateTemp.element_name = dateTemp.element_name + "(DD)";
                              dateTemp.show_format = split1 == "" ? temp.show_format.substring(0,8):temp.show_format.substring(0,10);
                            } else if (i == 4) {
                              dateCycle = "datetime";
                              dateTemp.element_name = dateTemp.element_name + "(HH)";
                              let indx = temp.source_format.indexOf(":") > -1 ? 1:0;//是否存在冒号，截取是否要多截取一位
                              dateTemp.show_format = temp.show_format.indexOf("mi") > -1 ? temp.show_format.substring(0,temp.show_format.indexOf("mi")-indx):temp.show_format;

                            } else if (i == 5) {
                              dateCycle = "datetime";
                              dateTemp.element_name = dateTemp.element_name + "(MI)";
                              let indx = temp.source_format.indexOf(":") > -1 ? 1:0;//是否存在冒号，截取是否要多截取一位
                              dateTemp.show_format = temp.show_format.indexOf("ss") > -1 ? temp.show_format.substring(0,temp.show_format.indexOf("ss")-indx):temp.show_format;

                            } else if (i == 6) {
                              dateCycle = "datetime";
                              dateTemp.element_name = dateTemp.element_name + "(SS)";
                              dateTemp.show_format = temp.show_format;

                            }
                            dateTemp = {
                                ...dateTemp,
                                ...{
                                  type: "ElDatePicker",
                                  dateCycle: dateCycle, // 前端构造，默认必须有
                                  cycleType: "date", // 前端构造，默认必须有
                                  m_value: [],
                                  labelWidth: "90px",
                                  timeOpr: 2,
                                  timeOpr1: 2,
                                  timeOpr2: 2,
                                  timeOprCount: 0,
                                  timeOprCount1: 0,
                                  timeOprCount2: 0,
                                  selected: false,
                                  dlselected: false
                                }
                              };
                            dateTemp.id = dateTemp.element_id + dateTemp.element_name;
                            //聚合函数
                            dateTemp = {
                              ...dateTemp,
                              ...initFuncDateParam(dateTemp, split1, _this.fieldTypeList)
                            }
                            dateTypeList.push(dateTemp);
                          }
                          // 1815-1885 释放
                          // if (date_type == 1) {
                            //日
                            /*m_value = year + split1 + (month + 1).toString().padStart(2, "0") + split1 + day.toString().padStart(2, "0");
                            var fix = "";
                            if (show_format.toLocaleUpperCase().indexOf("HHMISS") > -1) {
                              fix = "000000";
                            } else if (
                              show_format.toLocaleUpperCase().indexOf("HH:MI:SS") > -1
                            ) {
                              fix = " 00:00:00";
                            }*/
                            // m_value += fix;
                          //   temp = {
                          //     ...temp,
                          //     ...{
                          //       type: "ElDatePicker",
                          //       dateCycle: "date", //前端构造，默认必须有
                          //       cycleType: "date", //前端构造，默认必须有
                          //       // m_value: [m_value],
                          //       m_value: [""],
                          //       labelWidth: "90px",
                          //       timeOpr: 2,
                          //       timeOprCount: 0,
                          //       selected: false,
                          //       dlselected: false
                          //     }
                          //   };
                          // } else if (date_type == 2) {
                          //   //月
                          //   // m_value = year + split1 + (month + 1).toString().padStart(2, "0");
                          //   temp = {
                          //     ...temp,
                          //     ...{
                          //       type: "ElDatePicker",
                          //       dateCycle: "month", //前端构造，默认必须有
                          //       cycleType: "date", //前端构造，默认必须有
                          //       // m_value: [m_value],
                          //       m_value: [""],
                          //       labelWidth: "90px",
                          //       timeOpr1: 2,
                          //       timeOpr2: 2,
                          //       timeOprCount1: 0,
                          //       timeOprCount2: 0,
                          //       selected: false,
                          //       dlselected: false
                          //     }
                          //   };
                          // } else if (date_type == 6) {
                          //   // m_value = year;
                          //   temp = {
                          //     ...temp,
                          //     ...{
                          //       type: "ElDatePicker",
                          //       dateCycle: "year", //前端构造，默认必须有
                          //       cycleType: "date", //前端构造，默认必须有
                          //       //m_value: [m_value + ""],
                          //       m_value: [""],
                          //       labelWidth: "90px",
                          //       timeOpr: 2,
                          //       selected: false,
                          //       dlselected: false
                          //     }
                          //   };
                          // }
                        }
                        if (temp.element_type != 2) {
                          temp.element_type = 1;
                        }
                        if (temp.element_type == 1) {
                          //维度
                          _this.wdColsLen++;
                        } else if (temp.element_type != 1) {
                          //度量
                          _this.dlColsLen++;
                        }
                        //默认样式设置
                        temp.align =
                          temp.col_type == "No."
                            ? (temp.dim_id || "") != ""
                              ? "left"
                              : "right"
                            : "left";
                        temp.col_type =
                          temp.col_type.search(/No.|var|dat/) > -1
                            ? temp.col_type
                            : "var";
                        //编辑进入时，数据集字段选择状态
                        if (_this.loaderSign) {
                          if (cd) {
                            cd.map(function(row, index) {

                              let curDateLevel = row.formatLevel || 1;//获取查询条件拖入的时间字段当前的层级
                              //如果是非日期字段element_id相等即可。日期字段则要匹配的日期层级
                              if ((temp.col_type != 'dat' && row.element_id == temp.element_id) ||
                              (temp.col_type == 'dat' && curDateLevel <= dateTypeList.length &&
                              row.element_id == dateTypeList[curDateLevel-1].element_id &&
                              row.formatLevel == dateTypeList[curDateLevel-1].formatLevel && row.isNewCol)) {

                                let curTemp = row.col_type != 'dat' ? temp : dateTypeList[curDateLevel-1];
                                curTemp.selected = true;
                                if (curTemp.element_type == 1) {
                                  _this.wdChecked = true;
                                  _this.cur_wdCondiData.push(curTemp);
                                } else {
                                  _this.dlChecked = true;
                                  _this.cur_dlCondiData.push(curTemp);
                                }
                              }
                            });
                          }
                          if (td) {
                            td.map(function(row, index) {
                              let curDateLevel = row.formatLevel || 1;//获取查询条件拖入的时间字段当前的层级
                              //如果是非日期字段element_id相等即可。日期字段则要匹配的日期层级
                              if ((temp.col_type != 'dat' && row.element_id == temp.element_id) ||
                              (temp.col_type == 'dat' && curDateLevel <= dateTypeList.length &&
                              row.element_id == dateTypeList[curDateLevel-1].element_id &&
                              row.formatLevel == dateTypeList[curDateLevel-1].formatLevel && row.isNewCol)) {

                                let curTemp = row.col_type != 'dat' ? temp : dateTypeList[curDateLevel-1];
                                curTemp.dlselected = true;
                                curTemp = {
                                  ...curTemp,
                                  ...{
                                    nick_name: td[index].label,
                                    align: td[index].align,
                                    dot: td[index].dot,
                                    numType: td[index].numType,
                                    calcAttr: td[index].calcAttr,
                                    sort: td[index].sort,
                                    width: td[index].width
                                  }
                                };
                                if (curTemp.element_type == 1) {
                                  _this.wdChecked = true;
                                } else {
                                  _this.dlChecked = true;
                                }
                                td[index] = curTemp;
                              }
                            });
                          }
                        }
                        // if(td){
                        //   let containsList = td.filter(res => res.element_id === temp.element_id && temp.col_type == 'dat');
                        //   if (containsList.length>0 && temp.element_type === 1 && temp.element_id === dateTypeList[0].element_id) {
                        //       temp.dlselected = true;
                        //   }
                        // }
                        //end
                        if(temp.is_calcul == "1"){
                          temp.col_type = 'fx'
                        } else if(temp.is_calcul == "2"){
                          temp.col_type = 'gfx'
                        }
                        _this.allColsData.push(temp);
                        // let curData =  objDeepCopy(_this.allColsData);
                        _this.upAllCols(_this.allColsData.concat(dateTypeList));//把根据源时间格式衍生出的多个不同层级日期字段，加入到数据集维度字段列表中
                      }
                      _this.allData = objDeepCopy(_this.allColsData);
                      var reset_data = { data: td || [], type: "reset" };
                      _this.upTableCols(reset_data);
                      _this.cur_condiData = cd || [];
                    }
                  })
                  .catch(function(error) {
                    // _this.$message.error("字段加载失败");
                  });
              } else {
                _this.formatList = [];
                _this.$message.error("日期源格式查询失败");
              }
            });
          } else {
            _this.fieldTypeList = {};
            _this.$message.error("数据库字段类型查询失败");
          }
        });
    },
    updateData() {
      // 如果有聚合类字段禁止清单预览
      if(this.queryType=='list'){
        let sign = false;
        for(let i=0;i<this.tableCols.length;i++) {
          if(this.tableCols[i].is_calcul=='2') {
            sign = true;
            break;
          }
        }
        if(sign) {
          this.$message.warning('聚合计算无法参与清单设计');
          return;
        }
      }
      const tableCols = this.tableCols
      if (tableCols.length === 0) {
        this.$message.warning('请添加查询结果！')
        return
      }
      // this.setQueryType("list");
      this.upLoading(true);
      //结果参数
      // let af_id = this.resultCols.af_id;
      var _this = this;
      this.queryAfPropertyData()
        .then(function(response) {
          if (response.data.respResult == 1 && response.status == 200) {
            var respData = response.data.respData;
            var dataList = [];
            try {
              _this.s_edcuiCompts[1].comptAttrs.pagination.total = parseInt(
                response.data.respData.total_count
              );
              dataList = respData.result_data_list || [];
            } catch (e) {}

            var colList = [];
            if (_this.queryType == "list") {
              colList = _this.resultCols.select_list || [];
            } else {
              colList = _this.summarizeCols || [];
            }

            // var colList = _this.resultCols.select_list || [];
            // var columns = [],
            //   tableattrs = [];
            _this.s_edcuiCompts[1].comptAttrs.columns = [];
            _this.s_edcuiCompts[1].comptAttrs.tableattrs.data = [];
            _this.s_edcuiCompts[1].comptAttrs.columns = _this.tableColumn;
            _this.upDatasChange(true);
            for (var i = 0; i < dataList.length; i++) {
              var rows = dataList[i].data_list;
              var temp = {};
              for (var j = 0; j < rows.length; j++) {
                var item = colList[j].element_id;
                temp[item] = rows[j].data_val;
              }
              _this.s_edcuiCompts[1].comptAttrs.tableattrs.data.push(temp);
            }
            // _this.upColValue("");
            if (_this.s_edcuiCompts[1].comptAttrs.totalRow) {
              _this.upIsTotalOnly(true);
              _this.upTotalChange(true);
            }
          } else {
            _this.$message.error("数据更新失败");
          }
          _this.upLoading(false);
        })
        .catch(function(error) {
          console.error(error);
          _this.upLoading(false);
          // _this.$message.error("数据更新失败");
        });
    },
    loadMore() {
      if (this.start) {
        ++this.start;
        this.getAllTablesData("", this.filterText1);
      }
    },
    remoteMethod(query) {
      this.filterText1 = query;
      this.start = 1;
      if (query != "") {
        this.getAllTablesData("", query);
      } else {
        if (this.initAfId != "") {
          this.getAllTablesData(this.initAfId);
        }
        this.getAllTablesData();
      }
    },
    resetTables(sign) {
      if (!sign) {
        if (!this.valueIsChange && this.filterText1 != "") {
          this.refreshDataset();
        }
        this.filterText1 = "";
        this.valueIsChange = false;
      }
    },
    toAddDataset() {
      this.setDatasetType(1);
      let dataSetCache = {
        af_id: "",
        catalogId: "myfold",
        operation: "dataset"
      };
      this.setDataSetCache(dataSetCache);
      sessionStorage.setItem("dataSetCache", JSON.stringify(dataSetCache));
      sessionStorage.setItem("store",JSON.stringify(this.$store.state));
      let routeData = this.$router.resolve({ name: "dataset" });
      window.open(routeData.href, "_blank");
      
      // this.$router.push({
      //   path: "/dataset",
      //   name: "dataset"
      // });
    },
    refreshDataset() {
      this.start = 1;
      this.resetTableData([]);
      if (this.initAfId != "" || (this.pageCache.pageId || "") == "") {
        this.initAfId = this.value;
        this.getAllTablesData(this.initAfId);
        this.getColsData(this.initAfId);
      }
      this.getAllTablesData("", this.filterText1);
    },
    batchSettings() {
      this.upBatchDialog(false);
      let _this = this;
      let columns = this.s_edcuiCompts[1].comptAttrs.columns;
      columns.forEach((item, idx) => {
        item.calcAttr = item.calcAttrBak;
        item.fun_type = item.calcAttrBak;
      });
      // 更新到tablecolumns，否则就保存不进去
      let bakData = objDeepCopy(this.tableCols);
      for (let index = 0; index < bakData.length; index++) {
        let element = columns.filter(item => {
          return bakData[index].element_id == item.element_id;
        });
        bakData[index]["calcAttr"] = element[0].calcAttr;
      }
      var reset_data = { data: bakData, type: "reset" };
      this.upTableCols(reset_data);

      _this.upIsChangeCalc(true);
      // 更新外面的字段设置
      let curCol = this.$refs.advanceset1.colValue;
      if (curCol != "") {
        columns.forEach((item, idx) => {
          if (curCol == item.element_id) {
            _this.$refs.advanceset1.calc_value = item.calcAttr;
          }
        });
      }
    },
    conditionSet() {
      this.dialogTableVisible = false;
      let condisetData = this.$refs["condiset"].activedCompt;
      this.setActivedCompt(condisetData);
      this.reSort();
      // 跟踪群字段回显
      let fields = condisetData.comptAttrs.fieldList || [];
      let elementId = '';
      for(let i=0;i<fields.length;i++) {
        let temp = fields[i].comptAttrs;
        if(temp.is_import === true){
          elementId = temp.element_id;
          break;
        }
      }
      this.cur_condiData.forEach(val=>{
        val.is_import = false;
        if(val.element_id === elementId){
          val.is_import = true;
        }
      })
    },
    countChar(str) {
      let len = 0;
      for (let i = 0; i < str.length; i++) {
        let c = str.charCodeAt(i);
        if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
          len++;
        } else {
          len += 2;
        }
      }
      return len;
    },
    cloneDragItem(item) {
      return objDeepCopy(item);
    },
    isOpen(item){
      //判断新增加的日期层级字段是展开还是收缩
      let isOpen = false;
      if(this.dateOpenList[item.element_id] != undefined){
        isOpen = !this.dateOpenList[item.element_id];
      }
      this.$set(this.dateOpenList, item.element_id, isOpen);
    },
    ...mapMutations({
      setActivedCompt: "compt/setActivedCompt",
      setSedcuiCompts: "compt/setSedcuiCompts",
      upComptNum: "compt/upComptNum",
      upLoading: "compt/upLoading",
      upComptDatasetName: "compt/upComptDatasetName",
      upCondiData: "QueryTable/upCondiData",
      upTableCols: "QueryTable/upTableCols",
      upFilterData: "QueryTable/upFilterData",
      filterCols: "QueryTable/filterCols",
      upAllCols: "QueryTable/upAllCols",
      upDatasChange: "QueryTable/upDatasChange",
      upTotalChange: "QueryTable/upTotalChange",
      resetTableData: "QueryTable/resetTableData",
      upColumns: "QueryTable/upColumns",
      upIsChangeCalc: "QueryTable/upIsChangeCalc",
      upBatchDialog: "QueryTable/upBatchDialog",
      setQueryType: "QueryTable/setQueryType",
      setSelectAf: "QueryTable/setSelectAf",
      upColValue: "QueryTable/upColValue",
      upActivedId: "compt/upActivedId",
      setDatasetType: "DataSetDesign/setDatasetType"
    }),
    ...mapActions({
      cancelFilterSet: "QueryTable/cancelFilterSet",
      setActivedCompt: "compt/setActivedCompt",
      upComptDatasetName: "compt/upComptDatasetName",
      upLoading: "compt/upLoading",
      upComptNum: "compt/upComptNum",
      upCondiData: "QueryTable/upCondiData",
      upDatasChange: "QueryTable/upDatasChange",
      upTotalChange: "QueryTable/upTotalChange",
      upTableCols: "QueryTable/upTableCols",
      upFilterData: "QueryTable/upFilterData",
      upIsChangeCalc: "QueryTable/upIsChangeCalc",
      filterCols: "QueryTable/filterCols",
      upAllCols: "QueryTable/upAllCols",
      upColumns: "QueryTable/upColumns",
      queryAfPropertyData: "QueryTable/queryAfPropertyData",
      upColValue: "QueryTable/upColValue",
      upIsTotalOnly: "QueryTable/upIsTotalOnly",
      setDataSetCache: "DataSetMgt/setDataSetCache",
      setDatasetType: "DataSetDesign/setDatasetType",
      getDataSetInfo: "DataSetDesign/getDataSetInfo", //查询数据集信息
      queryDbColConf: "DataSetDesign/queryDbColConf", //查询数据库字段类型
      queryDateFormatList: "DataSetDesign/queryDateFormatList", //查询日期源格式
      getDataSetList: "DataSetDesign/getDataSetList"
    })
  },
  directives: {
    loadmore: {
      bind(el, binding) {
        const SELECTWRAP_DOM = el.querySelector(
          ".el-select-dropdown .el-select-dropdown__wrap"
        );
        if (!SELECTWRAP_DOM) {
          return false;
        }
        SELECTWRAP_DOM.addEventListener("scroll", function() {
          /*
           * scrollHeight 获取元素内容高度(只读)
           * scrollTop 获取或者设置元素的偏移值,常用于, 计算滚动条的位置, 当一个元素的容器没有产生垂直方向的滚动条, 那它的scrollTop的值默认为0.
           * clientHeight 读取元素的可见高度(只读)
           * 如果元素滚动到底, 下面等式返回true, 没有则返回false:
           * ele.scrollHeight - ele.scrollTop === ele.clientHeight;
           */
          const CONDITION =
            this.scrollHeight - this.scrollTop <= this.clientHeight;
          if (CONDITION) {
            binding.value();
          }
        });
      }
    }
  }
};
</script>
<style lang="scss" scoped src="../../assets/css/AttrSet.scss"/>
<style lang="scss" scoped>
.attrSet {
  position:relative;
  height: 100%;
  /deep/.el-tag {
    width: 100%;
    height: 28px;
    line-height: 26px;
    margin-bottom: 10px;
    font-size: 12px;
    cursor: move;
  }
  .tabcard.el-tabs--border-card {
    background: transparent;
    border: none;
  }
  /deep/.tabcard.el-tabs--border-card > .el-tabs__header {
    height: 40px;
    padding-top: 10px;
    border: none;
  }
  /deep/.tabcard .el-tabs__content {
    padding: 0;
  }
  /deep/.tabcard .el-tabs__item {
    height: 31px;
    line-height: 30px;
    padding: 0 15px;
    border: none;
  }
  /deep/.tabcard .el-tabs__item.is-active {
    border: none;
    border-radius: 2px 2px 0 0;
  }
  /deep/.el-tabs__nav-wrap {
    height: 40px;
    width: 100%;
  }

  /deep/.opt-btn {
    cursor: pointer;
    padding-left: 3px;
  }

  /deep/.el-tabs__nav-scroll {
    padding-left: 225px;
  }
  /deep/.tabOption .el-tabs__nav-scroll .el-tabs__nav {
    height: 110px;
  }
  .nav-title {
    position: absolute;
    height: 40px;
    line-height: 40px;
    padding-left: 10px;
    font-size: 16px;
    z-index: 99;
  }
  /deep/.el-tabs__header {
    margin: 0;
  }
  /deep/.el-tabs.el-tabs--top,
  /deep/.el-row-24 {
    height: 100%;
  }
  /deep/.el-tabs__content {
    height: calc(100% - 40px);
  }
  /deep/.el-row-24 .el-col {
    height: 100%;
    padding: 10px 0 10px 10px;
  }
  .r-title,
  .l-title {
    text-align: center;
  }
  /deep/.el-row-24 .grid-content > div:nth-child(-n + 3) {
    margin-bottom: 10px;
  }
  /deep/.el-row-24 .grid-content,
  .col-block {
    height: 100%;
  }
  .col-block {
    padding-right: 15px;
  }
  /deep/.el-row-12 {
    height: calc(50% - 47.5px);
  }
  .col-block span {
    font-size: 12px;
  }
  .col-title label {
    padding-left: 5px;
  }
  .col-subtitle {
    font-size: 12px;
    height: 25px;
    line-height: 25px;
    // margin-bottom: 7px;
  }
  /deep/.col-subtitle .el-checkbox {
    float: right;
  }
  .col-wrap {
    height: calc(100% - 19px);
  }
  .cols-item {
    height: calc(100% - 40px);
    padding-top: 5px;
  }
  /deep/.el-scrollbar__wrap {
    overflow-x: hidden;
  }
  .col-item {
    font-size: 12px;
    height: 22px;
    line-height: 22px;
    cursor: move;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    position: relative;
    .item-wrap {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .group-delete {
      line-height:22px;
      position: absolute;
      right:-18px;
      cursor:pointer;
      display: none;
    }
    &:hover{
      .group-delete{
        display: inline-block;
      }
    }
  }
  .col-item span {
    width: 30px;
    display: inline-block;
    padding-right: 10px;
  }
  .col-setting {
    height: 28px;
    line-height: 28px;
    float: right;
    font-size: 12px;
    padding-right: 13px;
    cursor: pointer;
  }
  /deep/.up-button {
    bottom: 20px;
    position: absolute;
    width: calc(50% - 23px);
  }
  .filter-setting {
    float: right;
    font-size: 12px;
    padding-top: 2px;
    cursor: pointer;
  }
  .filter-icon {
    padding-right: 5px;
    cursor: pointer;
  }
  .sort-icon {
    position: relative;
  }
  .sort-icon i {
    position: absolute;
    right: 2px;
    top: 0;
    transform: scale(0.6);
    cursor: pointer;
  }
  .sort-icon i:last-child {
    top: 6px;
  }
  .condi-wrap {
    height: calc(100% - 39px);
    width: 100%;
    padding-top: 38px;
  }
  .table-wrap {
    height: 100%;
    padding-bottom: 58px;
  }
  /deep/.table-wrap .el-scrollbar__view {
    padding-right: 10px;
  }
  /deep/.table-wrap .el-scrollbar__view > div {
    margin-bottom: 10px;
  }
  /deep/ .col-subtitle .el-checkbox__label {
    font-size: 12px;
  }
  /deep/ .col-title span {
    font-size: 12px;
  }
  /deep/ .col-span {
    display: inline-block;
    width: calc(100% - 32px);
    text-overflow: ellipsis;
    overflow: hidden;
  }
  /deep/ .col-span > span:first-child {
    padding-right: 5px;
  }
  /deep/.batch-dialog {
    /deep/.el-form-item__label {
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
  .query-condi .col-span {
    width: calc(100% - 42px);
  }
  .query-filter .col-span {
    width: calc(100% - 18px);
  }

/*   .query-condi,.query-table,.query-filter {
    position: relative
  } */
  .foolter {
    padding-right: 3px;
    margin-bottom: 17px;
    position: relative;
  }
}
.main-content-tool {
  text-align: right;
}
.main-content-tool .tool-btn {
  cursor: pointer;
  margin-left: 20px;
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
.pr3 {
  padding-right: 3px;
}
.fix-icon {
  margin-right: 3px;
}
.copy-table,
.copy-filter,
.copy-condi {
  position: absolute;
  left: 0;
  right: 0;
  height: 28px;
}

.compute-icon{
  float:right;
  line-height:28px;
  cursor:pointer;
  &:hover{
    color:#66b1ff;
  }
}
</style>
