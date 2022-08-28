<template>
  <div class="condi-set-box">
    <el-container>
      <el-aside width="185px" class="condi-aside">
        <div style="height:54px">
          <MainTitle width="100px" title="查询字段"></MainTitle>
          <div style="line-height:33px;">
            <span class="con-ds">数据集：</span>
            <el-tooltip effect="dark" :content="datasetName" placement="top-start">
              <span class="con-dataset">{{datasetName}}</span>
            </el-tooltip>
          </div>
        </div>
        <div style="height:calc(100% - 54px);">
          <el-scrollbar class="my-scroll-bar">
            <div style="height:100%; padding-right:20px;">
              <div
                v-for="(item,index) in activedCompt.comptAttrs.fieldList"
                v-bind:key="item.comptAttrs.id"
                @click="listChange(index)"
                :class="{'active':cur_index==index,'field-list':true}"
                v-if="item.type !='ElButton'"
              >
                <!-- <span>{{item.col_typetype == 'ElDatePicker' ? 'dat': (item.type == 'ElNumber' ? 'No.': 'var')}} {{ item.comptAttrs.element_name }}</span> -->
                <span>{{item.comptAttrs.col_type}} {{ item.comptAttrs.element_name }}</span>
                <i class="icon-A10567_fix-pic" v-if="item.type=='ElCascader'"></i>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </el-aside>
      <el-main class="condi-main">
        <MainTitle title="字段设置"></MainTitle>
        <GeminiScrollbar class="my-scroll-bar" style="height: calc(100% - 22px);">
          <div
            v-for="(item,index) in activedCompt.comptAttrs.fieldList"
            v-show="cur_index == index"
            v-bind:key="item.comptAttrs.id"
            style="height: calc(100% - 21px);"
            v-if="item.type !='ElButton'"
          >
            <div style="height:50px; padding-top:10px">
              <el-form :inline="true" size="mini">
                <el-form-item label="字段名称">
                  <el-input v-model="item.comptAttrs.label" :placeholder="item.comptAttrs.label"></el-input>
                </el-form-item>
                <el-form-item label style="position:relation">
                  <el-checkbox
                    v-show="pageType!='report' && item.type!=='ElDatePicker'"
                    v-model="item.comptAttrs.is_import"
                    @change="importChange"
                    :disabled="createTablePriv"
                  >是否设为导入字段</el-checkbox>
                  <div
                    class="check-mask"
                    v-show="!item.comptAttrs.is_import&&!nonCheck"
                    @click="$message.error('已经设置过导入字段')"
                  ></div>
                </el-form-item>
              </el-form>
            </div>
            <div class="condi-wrap">
              <!-- 日期类型 -->
              <div v-if="item.type=='ElDatePicker'">
                <div class="con-title">
                  <div class="con-t-line"></div>
                  <div class="con-t-title">
                    <i class="icon-A10382_square"></i>
                    <span>条件设置</span>
                  </div>
                </div>
                <div
                  class="marB" 
                  v-show="!item.comptAttrs.is_import">
                  <el-radio-group
                    v-model="radioCycle[index]"
                    @change="radioChange"
                  >
                    <el-radio label="daterange">区间</el-radio>
                    <el-radio label="date">日期</el-radio>
                  </el-radio-group>
                </div>
                <div>
                  <el-checkbox v-model="item.comptAttrs.isSetRequired">设为必填字段</el-checkbox>
                  <!-- <span class="con-set-line" v-show="!item.comptAttrs.is_import"></span> -->
                </div>
                <div class="con-set-default" v-show="!item.comptAttrs.is_import">
                  <el-checkbox v-model="item.comptAttrs.isSetDefault" @change="defaultChange">设置默认值</el-checkbox>
                </div>
                <div
                  v-show="radioCycle[index] == 'date' && item.comptAttrs.isSetDefault && !item.comptAttrs.is_import"
                >
                  <el-row>
                    <el-col :span="24">
                      <el-row>
                        <el-col :span="2.5">
                          <a href="javascript:;" class="con-line">
                            <span>偏移量</span>T
                          </a>
                        </el-col>
                        <el-col :span="8">
                          <el-input
                            placeholder="请输入偏移量"
                            size="mini"
                            v-model.number="item.comptAttrs.timeOprCount"
                            @input="dateOffsetChange({type:0,index:0,fieldData:item})"
                            @blur="checkIsNullInput(item,0)"
                            class="input-with-select"
                            :title="item.comptAttrs.timeOprCount"
                          >
                            <el-select
                              v-model="item.comptAttrs.timeOpr"
                              slot="prepend"
                              @change="dateOffsetChange({type:0,index:0,fieldData:item})"
                              placeholder
                            >
                              <el-option
                                v-for="item in timeOprs"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                              ></el-option>
                            </el-select>
                          </el-input>
                        </el-col>
                        <el-col :span="8" style="padding-left:20px;">
                          <el-date-picker
                            size="mini"
                            v-model="date_val[0]"
                            :value-format="dateFormat"
                            :format="dateFormat"
                            :type="item.comptAttrs.dateCycle"
                            placeholder="选择日期"
                            @change="datePickerChange({type:0,index:0,fieldData:item})"
                            :disabled="true"
                          ></el-date-picker>
                        </el-col>
                      </el-row>
                    </el-col>
                  </el-row>
                </div>
                <div
                  v-show="radioCycle[index] == 'daterange' && item.comptAttrs.isSetDefault && !item.comptAttrs.is_import"
                >
                  <el-row>
                    <el-col>开始时间：</el-col>
                  </el-row>
                  <el-row>
                    <el-col :span="24">
                      <el-row>
                        <el-col :span="2.5">
                          <a href="javascript:;" class="con-line con-line-green">
                            <span>偏移量</span>T
                          </a>
                        </el-col>
                        <el-col :span="8">
                          <el-input
                            placeholder="请输入偏移量"
                            size="mini"
                            v-model.number="item.comptAttrs.timeOprCount1"
                            @input="dateOffsetChange({type:1,index:0,fieldData:item})"
                            @blur="checkIsNullInput(item,1)"
                            class="input-with-select"
                            :title="item.comptAttrs.timeOprCount1"
                          >
                            <el-select
                              v-model="item.comptAttrs.timeOpr1"
                              slot="prepend"
                              @change="dateOffsetChange({type:1,index:0,fieldData:item})"
                              placeholder
                            >
                              <el-option
                                v-for="item in timeOprs"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                              ></el-option>
                            </el-select>
                          </el-input>
                        </el-col>
                        <el-col :span="8" style="padding-left:20px;">
                          <el-date-picker
                            size="mini"
                            v-model="date_val[0]"
                            :type="item.comptAttrs.dateCycle"
                            placeholder="选择日期"
                            :value-format="dateFormat"
                            :format="dateFormat"
                            @change="datePickerChange({type:1,index:0,fieldData:item})"
                            :disabled="true"
                          ></el-date-picker>
                        </el-col>
                      </el-row>
                    </el-col>
                  </el-row>
                  <el-row style="margin-top: 15px;">
                    <el-col>结束时间：</el-col>
                  </el-row>
                  <el-row>
                    <el-col :span="24">
                      <el-row>
                        <el-col :span="2.5">
                          <a href="javascript:;" class="con-line">
                            <span>偏移量</span>T
                          </a>
                        </el-col>
                        <el-col :span="8">
                          <el-input
                            placeholder="请输入偏移量"
                            size="mini"
                            v-model.number="item.comptAttrs.timeOprCount2"
                            @input="dateOffsetChange({type:1,index:1,fieldData:item})"
                            @blur="checkIsNullInput(item,2)"
                            class="input-with-select"
                            :title="item.comptAttrs.timeOprCount2"
                          >
                            <el-select
                              v-model="item.comptAttrs.timeOpr2"
                              slot="prepend"
                              @change="dateOffsetChange({type:1,index:1,fieldData:item})"
                              placeholder
                            >
                              <el-option
                                v-for="item in timeOprs"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                              ></el-option>
                            </el-select>
                          </el-input>
                        </el-col>
                        <el-col :span="8" style="padding-left:20px;">
                          <el-date-picker
                            size="mini"
                            v-model="date_val[1]"
                            :type="item.comptAttrs.dateCycle"
                            placeholder="选择日期"
                            :value-format="dateFormat"
                            :format="dateFormat"
                            @change="datePickerChange({type:1,index:1,fieldData:item})"
                            :disabled="true"
                          ></el-date-picker>
                        </el-col>
                      </el-row>
                    </el-col>
                  </el-row>
                </div>
              </div>
              <!-- 数值类型 -->
              <div v-else-if="item.type == 'ElNumber'">
                <div class="con-title">
                  <div class="con-t-line"></div>
                  <div class="con-t-title">
                    <i class="icon-A10382_square"></i>
                    <span>条件设置</span>
                  </div>
                </div>
                <div
                  v-for="(num,index) in item.comptAttrs.numList"
                  :key="num.id+'_'+index"
                  style="display:inline-block;margin-top:8px;margin-bottom:10px;"
                  v-show="!item.comptAttrs.is_import && pageCache.classTypeId!=='1001002'"
                >
                  <el-select
                    style="width:65px; background-color:transparent"
                    placeholder
                    v-model="num.label"
                    slot="prepend"
                    size="mini"
                    :disabled="true"
                  >
                    <el-option
                      v-for="item in symbols"
                      :key="10+item.value"
                      :value="item.value"
                      :label="item.label"
                    ></el-option>
                  </el-select>
                  <el-input
                    style="width:75px"
                    :placeholder="item.comptAttrs.placeholder"
                    v-model="num.m_value"
                    :type="num.label < 7 ? 'number' : 'text'"
                    size="mini"
                    :disabled="true"
                    class="number-input"
                  ></el-input>
                  <el-select
                    v-if="index!=1"
                    @change="addNumList"
                    style="background-color:transparent;width:60px; vertical-align:middle; margin:0 10px"
                    placeholder
                    v-model="item.comptAttrs.radioCalcu"
                    size="mini"
                  >
                    <el-option
                      v-for="item in conCaculs"
                      :key="20+item.value"
                      :value="item.value"
                      :label="item.label"
                    ></el-option>
                  </el-select>
                </div>
                <div>
                  <el-checkbox v-model="item.comptAttrs.isSetRequired">设为必填字段</el-checkbox>
                </div>

                <div class="con-set-selected" v-show="!item.comptAttrs.is_import && pageCache.classTypeId!=='1001002'">
                  <el-checkbox
                    v-model="item.comptAttrs.isSetSelected"
                    @change="numberMuSelectChange"
                  >自定义下拉选项</el-checkbox>
                </div>
                <!-- 原本的设置 -->
                <!-- lzc -->
                <!--   -->
                <div
                  class="num-mul-selected"
                  v-show="item.comptAttrs.isSetSelected&&!item.comptAttrs.is_import"
                >
                  <SelectTree
                    :options="symbols"
                    :value="item.comptAttrs.muNumValue1"
                    :props="props"
                    :clearable="true"
                    :showCheckbox="true"
                    :show-all-levels="false"
                    @selectCheckChange="mutipleNumChange1"
                    :ref="item.comptAttrs.element_id"
                    @VisibleChange="muNum1VisibleChange"
                  />
                  <el-select
                    @change="addNumList"
                    style="background-color:transparent;width:60px; vertical-align:middle; margin:0 10px"
                    placeholder
                    v-model="item.comptAttrs.radioCalcu"
                    size="mini"
                    class="addNumList"
                  >
                    <el-option
                      v-for="item in conCaculs"
                      :key="item.value"
                      :value="item.value"
                      :label="item.label"
                    ></el-option>
                  </el-select>
                  <SelectTree
                    :options="symbols"
                    v-show="!item.comptAttrs.is_import&&(item.comptAttrs.numSelectShow||item.comptAttrs.radioCalcu!='0')"
                    :value="item.comptAttrs.muNumValue2"
                    :props="props"
                    :clearable="true"
                    :showCheckbox="true"
                    v-model="item.comptAttrs.muNumValue2"
                    :show-all-levels="false"
                    @selectCheckChange="mutipleNumChange2"
                    :ref="item.comptAttrs.element_id"
                    @VisibleChange="muNum2VisibleChange"
                  />
                </div>
                <div class="con-set-default" v-show="!item.comptAttrs.is_import && pageCache.classTypeId!=='1001002'">
                  <el-checkbox
                    v-model="item.comptAttrs.isSetDefault"
                    @change="numberDefaultChange"
                  >设置默认值</el-checkbox>
                </div>
                <!-- 改造后下拉默认值绑定 -->
                <div
                  v-for="(defaultNum,sub_index) in item.comptAttrs.defaultNumList"
                  :key="defaultNum.id"
                  style="display:inline-block"
                  v-show="!item.comptAttrs.is_import && item.comptAttrs.isSetDefault"
                >
                  <el-input
                    style="width:140px"
                    :placeholder="item.comptAttrs.placeholder"
                    v-model="defaultNum.m_value"
                    class="number-input"
                    size="mini"
                    :type="defaultNum.label < 7 ? 'number' : 'text'"
                    @input="inputChange({index:sub_index,fieldData:defaultNum})"
                    @blur="event=>numberValid(event,defaultNum,sub_index)"
                    :disabled="defaultNum.label==21||defaultNum.label==20"
                    :title="defaultNum.m_value"
                  >
                    <el-select
                      style="width:65px; background-color:transparent"
                      placeholder
                      v-model="defaultNum.label"
                      slot="prepend"
                      size="mini"
                      @change="inputChange({index:sub_index,fieldData:defaultNum})"
                    >
                      <el-option
                        v-show="sub_index==0"
                        v-for="item in item.comptAttrs.mutipleNumSymbols1"
                        :key="30+item.value"
                        :value="item.value"
                        :label="item.label"
                      ></el-option>
                      <el-option
                        v-show="sub_index==1"
                        v-for="item in item.comptAttrs.mutipleNumSymbols2"
                        :key="40+item.value"
                        :value="item.value"
                        :label="item.label"
                      ></el-option>
                    </el-select>
                  </el-input>
                  <el-select
                    v-if="sub_index!=1"
                    @change="addNumList"
                    style="background-color:transparent;width:60px; vertical-align:middle; margin:0 10px"
                    placeholder
                    v-model="item.comptAttrs.radioCalcu"
                    size="mini"
                  >
                    <el-option
                      v-for="item in conCaculs"
                      :key="item.value"
                      :value="item.value"
                      :label="item.label"
                    ></el-option>
                  </el-select>
                </div>
                <!-- <el-button @click="addNumList(item)" size="mini">添加一项</el-button> -->
              </div>
              <!-- 下拉级联类型 -->
              <div
                v-else-if="item.type == 'ElCascader'"
                class="custom-tree-node"
                style="height: calc(100% - 50px);"
              >
                <div class="con-title">
                  <div class="con-t-line"></div>
                  <div class="con-t-title">
                    <i class="icon-A10382_square"></i>
                    <span>条件设置</span>
                  </div>
                </div>
                <div
                  class="marB"
                  v-show="!item.comptAttrs.is_import && activedCompt.type != 'MobileQuery'"
                >
                  <el-radio-group
                    v-model="item.comptAttrs.conArea"
                  >
                    <el-radio label="single">单选</el-radio>
                    <el-radio label="mutiple">多选</el-radio>
                  </el-radio-group>
                  <div class="mulit-check">
                    <el-checkbox v-if="item.comptAttrs.conArea==='mutiple'" :disabled="item.comptAttrs.checkStrictly" v-model="item.comptAttrs.showCheckAll">显示“全选”选项</el-checkbox>
                    <el-checkbox v-if="item.comptAttrs.conArea==='mutiple'" v-model="item.comptAttrs.checkStrictly" @change="val=>checkChange(item.comptAttrs,val)">多选查询控件层级不关联</el-checkbox>
                  </div>
                </div>
                <div>
                  <el-checkbox v-model="item.comptAttrs.isSetRequired">设为必填字段</el-checkbox>
                  <!-- <span class="con-set-line" v-show="!item.comptAttrs.is_import"></span> -->
                </div>
                <div class="con-title" style="margin-top: 17px;" v-show="!item.comptAttrs.is_import">
                  <div class="con-t-line"></div>
                  <div class="con-t-title">
                    <i class="icon-A10382_square"></i>
                    <span>级联关系</span>
                  </div>
                </div>
                <div class="con-cascader" v-show="!item.comptAttrs.is_import">
                  <el-scrollbar>
                    <el-form :inline="true" size="mini">
                      <el-form-item label="主级联">
                        <el-tree
                          :data="dimRelation"
                          node-key="id"
                          default-expand-all
                          :expand-on-click-node="false"
                        >
                          <span slot-scope="{ node, data }">
                            <el-select
                              size="mini"
                              :disabled="true"
                              v-model="data.label"
                              :class="{'cascade-mgr01':node.level == 1,'cascade-mgr02':node.level == 2,'cascade-mgr03':node.level == 3,'cascade-mgr04':node.level == 4,'cascade-mgr05':node.level == 5,'cascade-mgr06':node.level == 6}"
                              placeholder
                            >
                              <el-option
                                v-for="c_d in data.cascadeData"
                                :key="c_d.id"
                                :value="c_d.label"
                              >{{ c_d.label }}</el-option>
                            </el-select>
                            <!-- <span>
                                                      <i
                                                          v-if="node.level < 3"
                                                          class="con-icon icon-A10072_add"
                                                          @click="() => append(data)">
                                                      </i>
                                                      <i
                                                          v-if="node.level > 1"
                                                          class="con-icon icon-A10065_delete"
                                                          @click="() => remove(node, data)">
                                                      </i>
                            </span>-->
                            <div
                              :class="{'cascade-line':node.level != 1,'level3':node.level == 3,'level4':node.level == 4,'level5':node.level == 5,'level6':node.level == 6}"
                            >
                              <i class="cascade-line-icon"></i>
                            </div>
                          </span>
                        </el-tree>
                      </el-form-item>
                    </el-form>
                  </el-scrollbar>
                </div>
              </div>
              <!-- 文本类型 -->
              <div v-else-if="item.type == 'ElInput'">
                <div class="con-title">
                  <div class="con-t-line"></div>
                  <div class="con-t-title">
                    <i class="icon-A10382_square"></i>
                    <span>条件设置</span>
                  </div>
                </div>
                <div>
                  <el-checkbox v-model="item.comptAttrs.isSetRequired">设为必填字段</el-checkbox>
                </div>
                <!-- 响应下拉框多选状态 -->
                <div class="con-set-selected" v-show="!item.comptAttrs.is_import && pageCache.classTypeId!=='1001002'">
                  <el-checkbox
                    v-model="item.comptAttrs.isSetSelected"
                    @change="inputMuSelectChange"
                  >自定义下拉选项</el-checkbox>
                  <div class="selectTree" v-if="item.comptAttrs.isSetSelected">
                    <SelectTree
                      :options="inputSymbols"
                      :value="item.comptAttrs.mutipleInputValue"
                      :props="props"
                      :clearable="true"
                      :showCheckbox="true"
                      v-model="item.comptAttrs.mutipleInputValue"
                      :show-all-levels="false"
                      @selectCheckChange="mutipleInputChange"
                      :ref="item.comptAttrs.element_id"
                      @VisibleChange="muVisibleChange"
                    />
                  </div>
                </div>
                <div class="con-set-default" v-show="!item.comptAttrs.is_import && pageCache.classTypeId!=='1001002'">
                  <el-checkbox
                    v-model="item.comptAttrs.isSetDefault"
                    @change="inputDefaultChange"
                  >设置默认值</el-checkbox>
                </div>

                <div v-show="!item.comptAttrs.is_import && item.comptAttrs.isSetDefault">
                  <el-input
                    style="width:315px"
                    :placeholder="item.comptAttrs.defaultSymbol==21||item.comptAttrs.defaultSymbol==20?'':'请输入关键字'"
                    v-model="item.comptAttrs.default_value"
                    size="mini"
                    @input="inputChange({index:index,fieldData:item})"
                    :disabled="item.comptAttrs.defaultSymbol==21||item.comptAttrs.defaultSymbol==20"
                    :title="item.comptAttrs.default_value"
                  >
                    <el-select
                      v-show="!item.comptAttrs.isSetMultiple"
                      style="width:138px; background-color:transparent"
                      placeholder
                      v-model="item.comptAttrs.defaultSymbol"
                      slot="prepend"
                      size="mini"
                      @change="inputChange({index:index,fieldData:item})"
                    >
                      <el-option
                        v-for="item in item.comptAttrs.mutipleInputSymbols"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label"
                      ></el-option>
                    </el-select>
                  </el-input>
                </div>
              </div>
            </div>
          </div>
        </GeminiScrollbar>
      </el-main>
    </el-container>
  </div>
</template>
<script>
let id = 1000;
import Vue from "vue";
import { mapState, mapGetters, mapMutations, mapActions } from "vuex";
import { setTimeout } from "timers";
import MainTitle from "../tools/MainTitle";
import SelectTree from "../template/ElTreeSelect";

import { setTimeFormat, getTimeFromOffset, objDeepCopy, objClone, inputNumber } from "../../utils/comonFunc.js";
export default {
  components: {
    MainTitle,
    SelectTree
  },
  props: ["pageType"],
  data() {
    const data = [
      {
        id: 1,
        label: "省份",
        children: [
          {
            id: 2,
            label: "地市",
            children: [
              {
                id: 3,
                label: "县市"
              }
            ]
          }
        ]
      }
    ];
    return {
      //树节点配置项
      props: {
        value: "value",
        label: "label",
        children: "null"
      },
      // mutipleInputSymbols: [],
      activedCompt: [],
      date_val: ["", ""],
      test: "",
      value1: "",
      value2: "",
      radioCycle: [],
      radioCalcu: [],
      activeName: "0",
      cur_index: 1,
      isSetDefault: true,
      isSetRequired: false,
      isSetDisabled: false,
      timeOpr: 2,
      timeOpr1: 2,
      timeOpr2: 2,
      timeOprCount: 0,
      timeOprCount1: 0,
      timeOprCount2: 0,
      symbols: [
        /* { value: 2, label: ">", children: null },
        { value: 1, label: "<", children: null },
        { value: 3, label: "=", children: null },
        { value: 4, label: "<=", children: null },
        { value: 5, label: ">=", children: null },
        { value: 8, label: "在…中（逗号隔开）", children: null },
        { value: 9, label: "不在…中（逗号隔开）", children: null } */
      ],
      mutipleNumValue1: [1, 2, 3, 4, 5, 8, 9],

      // mutipleNumValue1: [1],
      // mutipleNumValue2: [2],

      inputSymbols: [
        /* { value: 10, label: "包含", children: null },
        { value: 11, label: "不包含", children: null },
        { value: 8, label: "在…中（逗号隔开）", children: null },
        { value: 9, label: "不在…中（逗号隔开）", children: null },
        { value: 20, label: "为空", children: null },
        { value: 21, label: "不为空", children: null } */
      ],
      timeOprs: [{ value: 1, label: "+" }, { value: 2, label: "-" }],
      conCaculs: [
        { value: "or", label: "或" },
        { value: "and", label: "且" },
        { value: "0", label: "无" }
      ],
      pickerOptions2: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            }
          }
        ]
      },
      data5: JSON.parse(JSON.stringify(data)),
      ConArea: "single",
      dimRelation: [],
      createTablePriv: false,
      nonCheck: true
    };
  },
  mounted() {
    if (this.activedCompt.comptAttrs.fieldList.length > 1) {
      this.activedCompt.comptAttrs.fieldList.forEach(val => {
        if (val.comptAttrs.is_import) {
          this.nonCheck = false;
        }
      });
      if (
        this.activedCompt.type == "MobileQuery" &&
        this.activedCompt.comptAttrs.extendSetting.isNeedBtn
      ) {
        //解决大屏查询组件，展示按钮时，字段设置不会默认选中当前字段
        this.listChange(1);
      } else if (this.pageType == "report") {
        this.listChange(0);
      } else {
        this.listChange(1);
      }
    } else if (
      this.activedCompt.comptAttrs.fieldList.length > 0 &&
      this.pageType == "report"
    ) {
      this.listChange(0);
    }
    //即席查询，查权限
    if (this.pageType != "report") {
      this.getCreateTablePriv();
    }
  },
  computed: {
    ...mapState({
      datasetName: state => state.compt.datasetName,
      dgwMsUrl: state => state.dgwMsUrl,
      selectAf: state => state.QueryTable.selectAf,
      importField: state => state.compt.importField,
      pageCache: state => state.HomeBody.pageCache
    }),
    ...mapGetters({
      activedCompt1: "compt/getActivedCompt", //即席页面的即席组件
      activedCompt2: "PageDesign/getActivedCompt" //分析报告的查询组件
    }),
    oldActivedCompt() {
      if (this.pageType == "report") {
        return this.activedCompt2;
      } else {
        return this.activedCompt1;
      }
    },
    radio: {
      get: function () {
        return this.radioCycle;
      },
      set: function (nv) {
        this.upCycle(nv);
      }
    },
    dateFormat() {
      // if (
      //   this.activedCompt.comptAttrs.fieldList[this.activeName].comptAttrs
      //     .dateCycle == "month"
      // ) {
      //   return "yyyy-MM";
      // } else {
      //   return "yyyy-MM-dd";
      // }
      let format =
        this.activedCompt.comptAttrs.fieldList[this.activeName].comptAttrs
          .show_format || "YYYY-MM-DD";
      return setTimeFormat(format, 1);
    },
    editorCondi() {
      return this.activedCompt.comptAttrs.fieldList[this.activeName];
    }
  },
  watch: {
    radio(val) {
      this.upCycle(val);
    },
    radioCalcu(val) {
      if (this.activedCompt.comptAttrs.fieldList.length > 0) {
        this.activedCompt.comptAttrs.fieldList[
          this.activeName
        ].comptAttrs.radioCalcu = val[this.activeName];
      }
    },
    radioCycle(val) {
      if (this.activedCompt.comptAttrs.fieldList.length > 0) {
        this.activedCompt.comptAttrs.fieldList[
          this.activeName
        ].comptAttrs.cycleType = val[this.activeName];
      }
    }
  },
  methods: {
    ...mapMutations({
      upCycle: "QueryTable/upCycle",
      setField: "compt/setField",
      setImportField: "compt/setImportField"
    }),
    ...mapActions({
      upCycle: "QueryTable/upCycle",
      setField: "compt/setField",
      checkCreateTablePriv: "compt/checkCreateTablePriv",
      queryDimLevelInfo: "compt/queryDimLevelInfo"
    }),
    defaultChange() {
      let data = this.activedCompt.comptAttrs.fieldList[this.cur_index]
        .comptAttrs;
      let isChange = data.isSetDefault;
      let mValue = data.m_value;
      if (!isChange) {
        Vue.set(mValue, 0, "");
        Vue.set(mValue, 1, "");
        this.date_val = ["", ""];
        data.timeOpr = 2;
        data.timeOpr1 = 2;
        data.timeOpr2 = 2;
        data.timeOprCount = 0;
        data.timeOprCount1 = 0;
        data.timeOprCount2 = 0;
      } else {
        var radioCycle = this.activedCompt.comptAttrs.fieldList[this.cur_index]
          .comptAttrs.cycleType;
        var item = this.activedCompt.comptAttrs.fieldList[this.cur_index];
        if (radioCycle == "date") {
          if (!data.timeOpr || data.timeOpr == "") {
            data.timeOpr = 2;
          }
          if (!data.timeOprCount || data.timeOprCount == "") {
            data.timeOprCount = 0;
          }
          this.dateOffsetChange({ type: 0, index: 0, fieldData: item });
          // this.daysChange("timeOprCount", "timeOpr", 0);
        } else {
          if (!data.timeOpr1 || data.timeOpr1 == "") {
            data.timeOpr1 = 2;
          }
          if (!data.timeOpr2 || data.timeOpr2 == "") {
            data.timeOpr2 = 2;
          }
          if (!data.timeOprCount1 || data.timeOprCount1 == "") {
            data.timeOprCount1 = 0;
          }
          if (!data.timeOprCount2 || data.timeOprCount2 == "") {
            data.timeOprCount2 = 0;
          }
          this.dateOffsetChange({ type: 1, index: 0, fieldData: item });
          this.dateOffsetChange({ type: 1, index: 1, fieldData: item });
          // this.daysChange("timeOprCount1", "timeOpr1", 0);
          // this.daysChange("timeOprCount2", "timeOpr2", 1);
        }
      }
    },
    dealDimRelation(data) {
      var j = 0;
      var tempData = [];
      for (var i = data.length - 1; i > -1; i--) {
        tempData[j];
        if (i == data.length - 1) {
          tempData[j] = {
            id: data[i].dim_level_id,
            label: data[i].dim_level_name
          };
        } else {
          tempData[j] = {
            id: data[i].dim_level_id,
            label: data[i].dim_level_name,
            children: [tempData[j - 1]]
          };
        }

        j++;
      }
      return [tempData[data.length - 1]];
    },
    getDimRelation() {
      var item = this.activedCompt.comptAttrs.fieldList[this.cur_index]
        .comptAttrs;
      var param = {
        dimId: item.dim_id
      };
      var _this = this;
      this.queryDimLevelInfo(param)
        .then(function (response) {
          var data = response.data.respData;
          data = objClone(data, 2);
          if (response.data.respResult == 1 && data && data.length > 0) {
            if (item.col_name === "home_code") {
              data = data.slice(0, 2);
            }
            data.forEach((dr, index) => {
              if (dr.dim_level_id == item.dim_level_id) {
                data.splice(index + 1);
              }
            });
            _this.dimRelation = _this.dealDimRelation(data);
          } else {
            //_this.$message.error("维层关系为空");
          }
        })
        .catch(function (error) {
          // _this.$message.error("维层关系加载失败");
        });
    },
    getDate(value) {
      var date = new Date(value);
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var days = date.getDate();
      month = month < 10 ? "0" + month : month;
      days = days < 10 ? "0" + days : days;
      return year + "/" + month + "/" + days;
    },
    listChange(index) {
      this.cur_index = index;
      this.activeName = index;
      var item = this.activedCompt.comptAttrs.fieldList[index];
      item.comptAttrs.label2 = item.comptAttrs.label;
      if (item.type == "ElDatePicker") {
        this.resetCondi();
      } else if (item.type == "ElCascader") {
        this.getDimRelation();
      } else if (item.type == "ElNumber") {
        // 初始化时下拉选项都有\
        if (typeof item.comptAttrs.mutipleNumSymbols1 == "undefined") {
          item.comptAttrs.mutipleNumSymbols1 = [];
          // let mutipleNumSymbols1 = item.comptAttrs.mutipleNumSymbols1;
          let mutipleNumSymbols1 = objDeepCopy(this.symbols);
          item.comptAttrs.mutipleNumSymbols1 = mutipleNumSymbols1;
          // this.initNumSybols();
        }
        if (typeof item.comptAttrs.mutipleNumSymbols2 == "undefined") {
          item.comptAttrs.mutipleNumSymbols2 = [];
          // let mutipleNumValue = item.comptAttrs.mutipleNumValue;
          let mutipleNumSymbols2 = objDeepCopy(this.symbols);
          item.comptAttrs.mutipleNumSymbols2 = mutipleNumSymbols2;
          // this.initNumSybols();
        }
      } else if (item.type == "ElNumber" && item.comptAttrs.isSetDefault) {
        //如果是数值类型，并且设置了默认值，给默认值赋值给当前值
        item.comptAttrs.defaultNumList.forEach((row, i) => {
          var num = objDeepCopy(row);
          this.$set(item.comptAttrs.numList, i, num);
        });
        // 初始化时下拉选项都有
        if (typeof item.comptAttrs.mutipleNumSymbols1 == "undefined") {
          item.comptAttrs.mutipleNumSymbols1 = [];
          // let mutipleNumSymbols1 = item.comptAttrs.mutipleNumSymbols1;
          let mutipleNumSymbols1 = objDeepCopy(this.symbols);
          item.comptAttrs.mutipleNumSymbols1 = mutipleNumSymbols1;
          // this.initNumSybols();
        }
        if (typeof item.comptAttrs.mutipleNumSymbols2 == "undefined") {
          item.comptAttrs.mutipleNumSymbols2 = [];
          // let mutipleNumValue = item.comptAttrs.mutipleNumValue;
          let mutipleNumSymbols2 = objDeepCopy(this.symbols);
          item.comptAttrs.mutipleNumSymbols2 = mutipleNumSymbols2;
          // this.initNumSybols();
        }
      } else if (item.type == "ElInput") {
        if (
          typeof item.comptAttrs.mutipleInputSymbols == "undefined" ||
          !item.comptAttrs.mutipleInputSymbols.length
        ) {
          item.comptAttrs.mutipleInputSymbols = [];
          // let muCaculsSymbols = item.comptAttrs.mutipleNumValue;
          let mutipleInputSymbols = objDeepCopy(this.inputSymbols);
          item.comptAttrs.mutipleInputSymbols = mutipleInputSymbols;
          // this.initNumSybols();
        }
      } else if (item.type == "ElInput" && item.comptAttrs.isSetDefault) {
        //如果是文本类型，并且设置了默认值，给默认值赋值给当前值
        item.comptAttrs.m_value = item.comptAttrs.default_value;
        item.comptAttrs.symbol = item.comptAttrs.defaultSymbol;
        //改变时 如果 多选选项为空 则设置默认值的下拉选项为默认值 记载时也会触发?
        if (!item.comptAttrs.mutipleInputValue.length) {
          this.initInputSybols();
        }
        if (
          typeof item.comptAttrs.mutipleInputSymbols == "undefined" ||
          !item.comptAttrs.mutipleInputSymbols.length
        ) {
          item.comptAttrs.mutipleInputSymbols = [];
          // let muCaculsSymbols = item.comptAttrs.mutipleNumValue;
          let mutipleInputSymbols = objDeepCopy(this.inputSymbols);
          item.comptAttrs.mutipleInputSymbols = mutipleInputSymbols;
          // this.initNumSybols();
        }
        // this.initInputSybols();
      }
    },
    changeCycle(item) {
      item.comptAttrs.radioCycle = this.radio;
    },
    radioChange(value) {
      var item = this.activedCompt.comptAttrs.fieldList[this.cur_index];
      if (!item.comptAttrs.timeOpr || item.comptAttrs.timeOpr == "") {
        item.comptAttrs.timeOpr = 2;
      }
      if (!item.comptAttrs.timeOpr1 || item.comptAttrs.timeOpr1 == "") {
        item.comptAttrs.timeOpr1 = 2;
      }
      if (!item.comptAttrs.timeOpr2 || item.comptAttrs.timeOpr2 == "") {
        item.comptAttrs.timeOpr2 = 2;
      }
      if (!item.comptAttrs.timeOprCount || item.comptAttrs.timeOprCount == "") {
        item.comptAttrs.timeOprCount = 0;
      }
      if (
        !item.comptAttrs.timeOprCount1 ||
        item.comptAttrs.timeOprCount1 == ""
      ) {
        item.comptAttrs.timeOprCount1 = 0;
      }
      if (
        !item.comptAttrs.timeOprCount2 ||
        item.comptAttrs.timeOprCount2 == ""
      ) {
        item.comptAttrs.timeOprCount2 = 0;
      }
      this.resetCondi();
    },
    setradioCalcu(data) {
      const result = [];
      const result_cycle = [];
      const _l = data.comptAttrs.fieldList;
      for (var i = 0; i < _l.length; i++) {
        let rc = _l[i].comptAttrs.radioCalcu
          ? _l[i].comptAttrs.radioCalcu
          : "and";
        result.push(rc);
        let rc_c = _l[i].comptAttrs.cycleType
          ? _l[i].comptAttrs.cycleType
          : "date";
        result_cycle.push(rc_c);
      }
      this.radioCalcu = result;
      this.radioCycle = result_cycle;
    },
    addNumList(val) {
      var item = this.activedCompt.comptAttrs.fieldList[this.activeName]
        .comptAttrs;
      const num = item.numList;
      const defaultNum = item.defaultNumList; //数值类型存放默认值
      if (val == 0 && num.length == 2) {
        num.splice(1, 1);
        defaultNum.splice(1, 1);
        item.numSelectShow = false;
      } else if (num.length == 2) {
        item.numSelectShow = true;
        return;
      } else {
        if (item.muNumValue2 == undefined) {
          num.push({ id: "1", label: 2, m_value: "" });
          defaultNum.push({ id: "1", label: 2, m_value: "" });
        } else {
          num.push({ id: "1", label: item.muNumValue2[0], m_value: "" });
          defaultNum.push({ id: "1", label: item.muNumValue2[0], m_value: "" });
        }
        item.numSelectShow = true;
      }
      // this.activedCompt.comptAttrs.fieldList[this.activeName].comptAttrs.numList.push({id:'1',m_value:''})
      // this.activedCompt.comptAttrs.fieldList[this.activeName].comptAttrs.radioCalcu = this.radioCalcu[this.activeName]
    },
    append(data) {
      const newChild = {
        id: 2,
        label: "地市",
        cascadeData: [{ id: 2, label: "地市" }, { id: 21, label: "县市" }]
      };
      if (!data.children) {
        this.$set(data, "children", []);
      }
      if (data.children.length == 0) {
        data.children.push(newChild);
      }
      this.activedCompt.comptAttrs.fieldList[
        this.activeName
      ].comptAttrs.options = [
          {
            value: "01",
            label: "福建",
            children: [
              {
                value: "591",
                label: "福州"
              },
              {
                value: "599",
                label: "南平"
              }
            ]
          },
          {
            value: "02",
            label: "新疆",
            children: [
              {
                value: "391",
                label: "乌鲁木齐"
              },
              {
                value: "399",
                label: "哈密"
              }
            ]
          }
        ];
    },
    remove(node, data) {
      setTimeout(() => {
        const parent = node.parent;
        const children = parent.data.children || parent.data;
        const index = children.findIndex(d => d.id === data.id);
        children.splice(index, 1);
      }, 200);
    },
    back() {
      // var $this = this;
      // setTimeout(function() {
      //     Object.assign($this.$data, $this.$options.data());
      // }, 3000);
    },
    getCreateTablePriv() {
      var afId = this.selectAf;
      var param = { afId };
      this.checkCreateTablePriv(param)
        .then(val => {
          if (val.data.respResult == "0") {
            throw val.data.respErrorDesc;
          } else if (val.data.respResult == "1") {
            this.createTablePriv = !val.data.respData;
          }
        })
        .catch(err => {
          // this.$message.error(err);
          this.createTablePriv = true;
        });
    },
    importChange(val) {
      if (val) {
        this.nonCheck = false;
      } else {
        this.nonCheck = true;
      }
    },
    /**
     * @param  paramObj = {
     *  type:int  0-日期 1-区间
     *  index:int 0-日期，区间起始时间 1-区间终止时间
     *  fieldData: 字段数据
     * }
     *
     * {type:1,index:0,fieldData:}
     * */

    datePickerChange(paramObj) {
      //
      /**
       * 日期：date_val[0], 'timeOpr', 'timeOprCount'
       * 区间：1.date_val[0], 'timeOpr1', 'timeOprCount1'
       *       2.date_val[1], 'timeOpr2', 'timeOprCount2'
       */
      var item = this.activedCompt.comptAttrs.fieldList[this.cur_index];
      var offset = 0,
        timeOpr,
        timeOprCount;
      if (
        this.date_val[paramObj.index] != "" &&
        this.date_val[paramObj.index] != undefined
      ) {
        offset = this.getOffsetFromTime(
          paramObj.fieldData.comptAttrs.show_format,
          this.date_val[paramObj.index]
        );
        timeOpr = offset >= 0 ? 1 : 2;
        timeOprCount = Math.abs(offset);
      }
      var suffix = "";
      if (paramObj.type == 1) {
        suffix = paramObj.index == 0 ? "1" : "2";
      }
      this.$set(item.comptAttrs, "timeOprCount" + suffix, timeOprCount);
      this.$set(item.comptAttrs, "timeOpr" + suffix, timeOpr);
      this.$set(
        item.comptAttrs.m_value,
        paramObj.index,
        this.date_val[paramObj.index]
      );

      if (paramObj.type == 1) {
        this.checkIfOutRange(paramObj.index);
      }
    },
    // 时间偏移量变化
    dateOffsetChange(paramObj) {
      var item = this.activedCompt.comptAttrs.fieldList[this.cur_index];
      var suffix = "";
      if (paramObj.type == 1) {
        suffix = paramObj.index == 0 ? "1" : "2";
      }
      var offset = 0;
      if ((item.comptAttrs["timeOprCount" + suffix] || 0) != "") {
        if (!Number.isInteger(item.comptAttrs["timeOprCount" + suffix] || 0)) {
          //偏移量必须为整数
          item.comptAttrs["timeOprCount" + suffix] = "0";
        } else if (parseInt(item.comptAttrs["timeOprCount" + suffix]) > 1000) {
          //偏移量最大值为1000
          item.comptAttrs["timeOprCount" + suffix] = 1000;
        }
        offset =
          item.comptAttrs["timeOpr" + suffix] == 2
            ? "-" + item.comptAttrs["timeOprCount" + suffix]
            : item.comptAttrs["timeOprCount" + suffix];
        offset = parseInt(offset);
      }
      var time = getTimeFromOffset(
        paramObj.fieldData.comptAttrs.show_format,
        offset
      );
      this.$set(this.date_val, paramObj.index, time);
      this.$set(
        item.comptAttrs.m_value,
        paramObj.index,
        this.date_val[paramObj.index]
      );
      //只会相应右边日历页面上的日期不会响应
      //  this.date_val[paramObj.index]=time ;
      if (paramObj.type == 1) {
        this.checkIfOutRange(paramObj.index);
      }
    },
    // 从时间推偏移量
    getOffsetFromTime(show_format, time) {
      show_format = show_format.toLocaleUpperCase();
      var currentDate = new Date();
      var offset = 0;
      var yearOff = parseInt(time.substring(0, 4)) - currentDate.getFullYear(),
        monthOff = 0,
        currentMonth = currentDate.getMonth() + 1,
        oldDate;
      switch (show_format) {
        case "YYYY":
          offset = yearOff;
          break;
        case "YYYYMM":
          monthOff = parseInt(time.substring(4, 6)) - currentMonth;
          offset = yearOff * 12 + monthOff;
          break;
        case "YYYYMMDD":
        case "YYYYMMDDHHMISS":
        case "YYYYMMDD HH:MI:SS":
          time = time.substring(0, 8);
          time =
            time.substring(0, 4) +
            "/" +
            time.substring(4, 6) +
            "/" +
            time.substring(6, 8);
          oldDate = new Date(time);
          offset = oldDate.getTime() - currentDate.getTime();
          offset = Math.floor(offset / (24 * 3600 * 1000)) + 1;
          break;
        case "YYYY-MM":
        case "YYYY/MM":
          monthOff = parseInt(time.substring(5, 7)) - currentMonth;
          offset = yearOff * 12 + monthOff;
          break;
        case "YYYY-MM-DD":
        case "YYYY/MM/DD":
        case "YYYY-MM-DD HH:MI:SS":
        case "YYYY/MM/DD HH:MI:SS":
          time = time.substring(0, 10);
          time = time.replace(/-/g, "/");
          oldDate = new Date(time);
          offset = oldDate.getTime() - currentDate.getTime();
          offset = Math.floor(offset / (24 * 3600 * 1000)) + 1;
          break;
        default:
          break;
      }
      return offset;
    },
    /** index 0--开始 1--结束
     * type: 1-改时间 2-改偏移量
     *
     */
    checkIfOutRange(index) {
      var item = this.activedCompt.comptAttrs.fieldList[this.cur_index];
      if (
        item.comptAttrs["timeOprCount1"] + "" != "" &&
        item.comptAttrs["timeOprCount2"] + "" != ""
      ) {
        var startOff =
          item.comptAttrs["timeOpr1"] == 1
            ? item.comptAttrs["timeOprCount1"]
            : "-" + item.comptAttrs["timeOprCount1"];
        var endOff =
          item.comptAttrs["timeOpr2"] == 1
            ? item.comptAttrs["timeOprCount2"]
            : "-" + item.comptAttrs["timeOprCount2"];
        startOff = parseInt(startOff);
        endOff = parseInt(endOff);
        if (startOff > endOff) {
          this.$message.error("终止日期不能小于开始日期");
          this.$set(this.date_val, index, this.date_val[index == 0 ? 1 : 0]);
          var suffix = index == 0 ? 1 : 2,
            another = index == 0 ? 2 : 1;
          this.$set(
            item.comptAttrs,
            "timeOprCount" + suffix,
            item.comptAttrs["timeOprCount" + another]
          );
          this.$set(
            item.comptAttrs,
            "timeOpr" + suffix,
            item.comptAttrs["timeOpr" + another]
          );
        }
      }
    },
    resetCondi() {
      var item = this.activedCompt.comptAttrs.fieldList[this.cur_index];
      this.date_val = item.comptAttrs.m_value || ["", ""];
      if (item.comptAttrs.cycleType == "date") {
        this.dateOffsetChange({ type: 0, index: 0, fieldData: item });
      } else {
        if (this.date_val[1] == undefined) {
          this.$set(this.date_val, 1, this.date_val[0]);
          this.$set(item.comptAttrs.m_value, 1, item.comptAttrs.m_value[0]);
        }
        this.dateOffsetChange({ type: 1, index: 0, fieldData: item });
        this.dateOffsetChange({ type: 1, index: 1, fieldData: item });
      }
    },
    inputChange(paramObj) {
      var item = this.activedCompt.comptAttrs.fieldList[this.cur_index];
      if (item.type == "ElNumber") {
        var num = objDeepCopy(paramObj.fieldData);
        if(num.label == 21 || num.label == 20) {
          paramObj.fieldData.m_value = ''
          num.m_value = ''
        } else if(num.label > 7) {
          let val2 = inputNumber(num.m_value,'mulit')
          paramObj.fieldData.m_value = val2
          num.m_value = val2
        }
        this.$set(item.comptAttrs.numList, paramObj.index, num);
      } else if (item.type == "ElInput") {
        item.comptAttrs.m_value = item.comptAttrs.default_value;
        item.comptAttrs.symbol = item.comptAttrs.defaultSymbol;
      }
    },
    //input下拉多选时如果没有多选下拉值
    initInputSybols() {
      var item = this.activedCompt.comptAttrs.fieldList[this.cur_index];
      let inputSymbols = objDeepCopy(this.inputSymbols);
      // if(!num){
      item.comptAttrs.mutipleInputSymbols = inputSymbols;
      // }
      // return false;
    },
    //下拉选项在 隐藏和移除tag时触发 移除tag还未监听
    // resetInputValue() {
    //   let item = this.activedCompt.comptAttrs.fieldList[this.cur_index];
    //   let mutipleInputValue = item.comptAttrs.mutipleInputValue;
    //   if (mutipleInputValue.length) {
    //     if (!mutipleInputValue.includes(item.comptAttrs.defaultSymbol)) {
    //       //将下拉选项重置 选项为多选数组第一个 清空输入框默认值
    //       // this.$nextTick(()=>{
    //       item.comptAttrs.defaultSymbol =
    //         mutipleInputValue[mutipleInputValue.length - 1];
    //       item.comptAttrs.default_value = "";
    //       // })
    //       this.$message.error(
    //         "设置的默认选项不包含在下拉选项中,请重新设置默认值"
    //       );
    //     }
    //   }
    // },
    //文本多选下拉框隐藏
    mutipleInputVisible(val) {
      // if (!val) {
      //   this.resetInputValue();
      // }
    },

    //数字多选下拉框隐藏
    mutipleNumChange1(val) {
      var item = this.activedCompt.comptAttrs.fieldList[this.cur_index];
      let arr = [];
      // let muNumValue1=item.comptAttrs.muNumValue1;
      this.symbols.forEach((item, index) => {
        val.forEach(valItem => {
          if (valItem == item.value) {
            arr.push(item);
          }
        });
      });
      item.comptAttrs.mutipleNumSymbols1 = arr;
      let copyData = objDeepCopy(val);
      item.comptAttrs.muNumValue1 = copyData;
      if (!item.comptAttrs.isSetDefault) {
        item.comptAttrs.numList[0].label = item.comptAttrs.muNumValue1[0];
      }
      if (!val.length) {
        let allSymbos = objDeepCopy(this.symbols);
        item.comptAttrs.mutipleNumSymbols1 = allSymbos;
        // return false;
      }
    },
    mutipleNumChange2(val) {
      var item = this.activedCompt.comptAttrs.fieldList[this.cur_index];
      let arr = [];
      // let muNumValue1=item.comptAttrs.muNumValue1;
      this.symbols.forEach((item, index) => {
        val.forEach(valItem => {
          if (valItem == item.value) {
            arr.push(item);
          }
        });
      });
      item.comptAttrs.mutipleNumSymbols2 = arr;

      item.comptAttrs.muNumValue2 = val;
      if (!item.comptAttrs.isSetDefault) {
        item.comptAttrs.numList[1].label = item.comptAttrs.muNumValue2[0];
      }
      if (!val.length) {
        let allSymbos = objDeepCopy(this.symbols);
        item.comptAttrs.mutipleNumSymbols2 = allSymbos;
        return;
      }
    },
    muNum1VisibleChange(val) {
      if (!val) {
        let item = this.activedCompt.comptAttrs.fieldList[this.cur_index];
        let muNumValue1 = item.comptAttrs.muNumValue1 || [];
        if (muNumValue1.length) {
          let defaultnum1 = item.comptAttrs.defaultNumList[0];
          let num1 = item.comptAttrs.numList[0];
          if (item.comptAttrs.isSetDefault) {
            if (!muNumValue1.includes(defaultnum1.label)) {
              //将下拉选项重置 选项为多选数组第一个 清空输入框默认值
              // this.$nextTick(()=>{
              defaultnum1.label = muNumValue1[muNumValue1.length - 1];
              defaultnum1.m_value = "";
              // })
              this.$message.error(
                "设置的默认选项不包含在第一个下拉选项中,请重新设置默认值"
              );
            }
          } else {
            if (!muNumValue1.includes(defaultnum1.label)) {
              defaultnum1.label = muNumValue1[muNumValue1.length - 1];
              defaultnum1.m_value = "";
            }
            if (!muNumValue1.includes(num1.label)) {
              num1.label = muNumValue1[muNumValue1.length - 1];
              num1.m_value = "";
            }
          }
        }
      }
    },
    muNum2VisibleChange(val) {
      if (!val) {
        let item = this.activedCompt.comptAttrs.fieldList[this.cur_index];
        let muNumValue2 = item.comptAttrs.muNumValue2 || [];
        let num2 = item.comptAttrs.numList[1];

        if (muNumValue2.length) {
          let defaultnum2 = item.comptAttrs.defaultNumList[1];
          if (item.comptAttrs.isSetDefault) {
            if (!muNumValue2.includes(defaultnum2.label)) {
              //将下拉选项重置 选项为多选数组第一个 清空输入框默认值
              // this.$nextTick(()=>{
              defaultnum2.label = muNumValue2[muNumValue2.length - 1];
              defaultnum2.m_value = "";
              // })
              this.$message.error(
                "设置的默认选项不包含在第二个下拉选项中,请重新设置默认值"
              );
            }
          } else {
            if (!muNumValue2.includes(defaultnum2.label)) {
              defaultnum2.label = muNumValue2[muNumValue2.length - 1];
              defaultnum2.m_value = "";
            }
            if (!muNumValue2.includes(num2.label)) {
              num2.label = muNumValue2[muNumValue2.length - 1];
              num2.m_value = "";
            }
          }
        }
      }
    },
    //接收树组件传来的selcet隐藏事件
    muVisibleChange(val) {
      if (!val) {
        let item = this.activedCompt.comptAttrs.fieldList[this.cur_index];
        let mutipleInputValue = item.comptAttrs.mutipleInputValue || [];
        if (mutipleInputValue.length) {
          if (item.comptAttrs.isSetDefault) {
            if (!mutipleInputValue.includes(item.comptAttrs.defaultSymbol)) {
              //将下拉选项重置 选项为多选数组第一个 清空输入框默认值
              // this.$nextTick(()=>{
              item.comptAttrs.defaultSymbol =
                mutipleInputValue[mutipleInputValue.length - 1];
              item.comptAttrs.default_value = "";
              // })
              this.$message.error(
                "设置的默认选项不包含在下拉选项中,请重新设置默认值"
              );
            }
          } else {
            if (!mutipleInputValue.includes(item.comptAttrs.symbol)) {
              //如果外面输入框不包含 重置外面输入框
              item.comptAttrs.symbol =
                mutipleInputValue[mutipleInputValue.length - 1];
              item.comptAttrs.m_value = "";
            }
            if (!mutipleInputValue.includes(item.comptAttrs.defaultSymbol)) {
              //将下拉选项重置 选项为多选数组第一个 清空输入框默认值
              // this.$nextTick(()=>{
              item.comptAttrs.defaultSymbol =
                mutipleInputValue[mutipleInputValue.length - 1];
              item.comptAttrs.default_value = "";
              // })
              // this.$message.error(
              //   "设置的默认选项不包含在下拉选项中,请重新设置默认值"
              // );
            }
          }
        }
      }
    },
    //监听自定义下拉选项文本类型事件
    mutipleInputChange(val) {
      var item = this.activedCompt.comptAttrs.fieldList[this.cur_index];
      let arr = [];
      this.inputSymbols.forEach((item, index) => {
        val.forEach(valItem => {
          if (valItem == item.value) {
            arr.push(item);
          }
        });
      });
      item.comptAttrs.mutipleInputSymbols = arr;
      item.comptAttrs.mutipleInputValue = val;
      if (!item.comptAttrs.mutipleInputValue.length) {
        this.initInputSybols();
      }
      // ////'组件value',item.comptAttrs.mutipleInputValue);
      // ////'item.comptAttrs.isSetDefault:', item.comptAttrs.isSetDefault);
      if (!item.comptAttrs.isSetDefault) {
        item.comptAttrs.symbol =
          item.comptAttrs.mutipleInputValue[0] || this.inputSymbols[0].value;
      }
      ////'默认值',item.comptAttrs.symbol);
    },
    // elnumber类型组件 默认值设置取消时值要清空
    numberDefaultChange() {
      let data = this.activedCompt.comptAttrs.fieldList[this.cur_index]
        .comptAttrs;
      let isChange = data.isSetDefault;
      if (!isChange) {
        for (let index = 0; index < data.defaultNumList.length; index++) {
          this.$set(data.defaultNumList[index], "m_value", "");
          this.$set(data.numList[index], "m_value", "");
          if (index == 0) {
            if (data.muNumValue1 == undefined) {
              // console.log("this.symbols[0].value", this.symbols[0].value);
              this.$set(
                data.defaultNumList[index],
                "label",
                this.symbols[0].value
              );
              this.$set(data.numList[0], "label", this.symbols[0].value);
            } else {
              // console.log("this.symbols[0].value", data.muNumValue1[0]);
              this.$set(
                data.defaultNumList[index],
                "label",
                data.muNumValue1[0]
              );
              this.$set(data.numList[0], "label", data.muNumValue1[0]);
            }
          } else {
            if (data.muNumValue2 == undefined) {
              // console.log("this.symbols[0].value", this.symbols[0].value);
              this.$set(
                data.defaultNumList[index],
                "label",
                this.symbols[0].value
              );
              this.$set(data.numList[1], "label", this.symbols[0].value);
            } else {
              this.$set(
                data.defaultNumList[index],
                "label",
                data.muNumValue2[0]
              );
              this.$set(data.numList[1], "label", data.muNumValue2[0]);
            }
          }
        }
      }
      if (isChange) {
        for (let index = 0; index < data.defaultNumList.length; index++) {
          this.$set(data.defaultNumList[index], "m_value", "");
          this.$set(data.numList[index], "m_value", "");
          if (index == 0) {
            if (data.muNumValue1 == undefined) {
              // console.log("this.symbols[0].value", this.symbols[0].value);
              this.$set(
                data.defaultNumList[index],
                "label",
                this.symbols[0].value
              );
              this.$set(data.numList[0], "label", this.symbols[0].value);
            } else {
              // console.log("this.symbols[0].value", data.muNumValue1[0]);
              this.$set(
                data.defaultNumList[index],
                "label",
                data.muNumValue1[0]
              );
              this.$set(data.numList[0], "label", data.muNumValue1[0]);
            }
          } else {
            if (data.muNumValue2 == undefined) {
              // console.log("this.symbols[0].value", this.symbols[0].value);
              this.$set(
                data.defaultNumList[index],
                "label",
                this.symbols[0].value
              );
              this.$set(data.numList[1], "label", this.symbols[0].value);
            } else {
              this.$set(
                data.defaultNumList[index],
                "label",
                data.muNumValue2[0]
              );
              this.$set(data.numList[1], "label", data.muNumValue2[0]);
            }
          }
        }
      }
    },
    // elnumber类型组件 自定义下拉选择还原设置取消时值要清空
    numberMuSelectChange() {
      let data = this.activedCompt.comptAttrs.fieldList[this.cur_index]
        .comptAttrs;
      let isChange = data.isSetSelected;
      if (!isChange) {
        // for (let index = 0; index < data.defaultNumList.length; index++) {
        //   this.$set(data.defaultNumList[index], "m_value", "");
        //   this.$set(data.numList[index], "m_value", "");
        // }
        // data.muNumValue1=[];
        // data.muNumValue2=[];
        let elementId = data.element_id;
        let numSelectTree = this.$refs[elementId];
        numSelectTree[0].clearHandle();
        numSelectTree[1].clearHandle();
        // this.$refs.numSelectTree2.clearHandle();
      }
    },
    // input类型组件 默认值设置取消时值要清空
    inputMuSelectChange() {
      let data = this.activedCompt.comptAttrs.fieldList[this.cur_index]
        .comptAttrs;
      let isChange = data.isSetSelected;
      if (!isChange) {
        let elementId = data.element_id;

        let inputSelectTree = this.$refs[elementId];
        inputSelectTree[0].clearHandle();
      }
    },
    inputDefaultChange() {
      let data = this.activedCompt.comptAttrs.fieldList[this.cur_index]
        .comptAttrs;
      let isChange = data.isSetDefault;
      if (!isChange) {
        this.$set(data, "default_value", "");
        this.$set(data, "m_value", "");
        // this.$set(data, "defaultSymbol",);
      }
    },
    numberValid(InputEvent,num,index) {
      let item = this.activedCompt.comptAttrs.fieldList[this.cur_index];
      if (num.m_value === null || num.m_value === undefined || num.m_value === '') {
        InputEvent.target.value = ''
      } else if(num.label > 7) {
        let val2 = inputNumber(num.m_value,'mulit').replace(/\-+$/g,'')
        num.m_value = val2
        this.$set(item.comptAttrs.numList, index, num);
      }
    },
    /* numValid(num,sub_index,index) {
      if (num.label > 7) {
        let val2 = inputNumber(val,'mulit')
        this.activedCompt.comptAttrs.fieldList[index].comptAttrs.numList[sub_index].m_value = val2
      }
    } */
    checkIsNullInput(item, index){
      let val = item.comptAttrs['timeOprCount' + ( index===0 ? "" : index)];
      if (val === null || val === '') {
        this.$message.error("偏移量不能为空");
        this.$set(this.date_val, index - 1, this.date_val[index===0?-1:(index == 1 ? 1 : 0)]);
        this.$set(item.comptAttrs, 'timeOprCount' + (index===0?'':index), index === 0 ? 0 : item.comptAttrs['timeOprCount' + (index == 1 ? 2 : 1)]);
        this.$set(item.comptAttrs, 'timeOpr' + (index===0?'':index),  item.comptAttrs['timeOpr' + (index === 0 ? '' : index == 1 ? 2 : 1)]);
      }
    },
    checkChange(item, val) {
      if (val === true) {
        item.showCheckAll = false
      }
    }
  },
  created() {
    const defaultSymbol = require("../../../public/comptConfig/cellCompt.json");
    this.symbols = defaultSymbol.ElNumberSymbols
    this.inputSymbols = defaultSymbol.ElInputSymbols
    this.activedCompt = objDeepCopy(this.oldActivedCompt);
    this.setradioCalcu(this.activedCompt); // 设置日期粒度类型和计算且或类型
  }
};
</script>
<style lang="scss" scoped>
$border-clr01: #dcdfe6; // 边框色1
$main-color: #409eff; //主色调
$bg-clr01: #ecf5ff; // 块背景色1
$txt-clr01: #67c23a; // 文字颜色1
$txt-clr02: #fff; // 文字颜色2
$txt-clr03: #606266; // 文字颜色3
.marB {
  margin-bottom: 10px;
}
.custom-tree-node {
  /deep/.el-tree {
    margin-top: -20px;
    background: transparent;
  }
  /deep/.el-tree-node__content {
    :hover {
      background-color: transparent;
    }
    height: 48px;
    position: relative;
    background-color: transparent;
    padding-top: 20px;
    .cascade-line-icon {
      display: none;
    }
    .cascade-line {
      position: relative;
      width: 30px;
      height: 35px;
      border-left: 1px dashed #ccc;
      border-bottom: 1px dashed #ccc;
      position: absolute;
      top: 0px;
      left: 27px;
      &.level3 {
        left: 76px;
      }
      &.level4 {
        left: 123px;
      }
      &.level5 {
        left: 170px;
      }
      &.level6 {
        left: 218px;
      }
      .cascade-line-icon {
        display: block;
        position: absolute;
        left: -2px;
        bottom: -2px;
        width: 5px;
        height: 5px;
        border: 1px dashed #d3d8e4;
        background-color: #fff;
      }
    }
    .el-tree-node__expand-icon.expanded,
    .el-tree-node__expand-icon.is-leaf {
      display: none;
    }
  }
}
.cascade-mgr01 {
  // margin-left: 10px;
}
.cascade-mgr02 {
  margin-left: 40px;
}
.cascade-mgr03 {
  margin-left: 70px;
}
.cascade-mgr04 {
  margin-left: 100px;
}
.cascade-mgr05 {
  margin-left: 130px;
}
.cascade-mgr06 {
  margin-left: 160px;
}
.condi-set-box {
  height: 300px;
  padding: 0;
  /deep/.el-main {
    padding: 0;
  }
  /deep/.el-header {
    padding: 0;
  }
  /deep/.el-form-item__label {
    text-align: right;
  }
  .condi-aside {
    border-right: 1px dashed $border-clr01;
    overflow: hidden;
  }
  .condi-main {
    padding-left: 20px;
    overflow: hidden;
    /deep/ .el-input-group {
      vertical-align: middle;
    }
  }
  .field-list {
    width: 100%;
    height: 28px;
    border: 1px solid $border-clr01;
    border-radius: 3px;
    margin-bottom: 10px;
    line-height: 26px;
    text-align: left;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0 10px;
    font-size: 12px;
    &.active {
      border-color: $main-color;
      background-color: $bg-clr01;
      color: $main-color;
    }
    span {
      // float: left;
    }
  }
}
.con-title {
  position: relative;
  padding-top: 9px;
  margin-bottom: 17px;
  margin-top: -3px;
  .con-t-line {
    height: 1px;
    border-bottom: 1px dashed $border-clr01;
  }
  .con-t-title {
    background: $txt-clr02;
    position: absolute;
    top: -2px;
    left: -7px;
    padding-right: 8px;
    i {
      color: $main-color;
      margin-right: 5px;
      display: inline-block;
      vertical-align: middle;
    }
    span {
      color: $txt-clr03;
      font-size: 14px;
      display: inline-block;
      vertical-align: middle;
    }
  }
}
.con-set-default {
  margin: 15px 0 8px 0;
}
.con-set-selected {
  margin: 15px 0 8px 0;
}
.con-line {
  color: $main-color;
  display: block;
  height: 28px;
  line-height: 28px;
  font-size: 14px;
  font-weight: bold;
  margin-right: 12px;
  > span {
    color: $txt-clr03;
    font-weight: normal;
    margin-right: 3px;
    margin-left: 3px;
  }
}
.con-line-green {
  color: $txt-clr01;
  > span {
    color: $txt-clr03;
    font-weight: normal;
    margin-right: 3px;
    margin-left: 3px;
  }
}
.con-label {
  height: 28px;
  line-height: 28px;
  text-align: center;
}
.el-date-editor.el-input {
  width: 100%;
}
.condi-main {
  /deep/ .el-radio {
    margin-right: 40px;
  }
  /deep/ .el-input-group__prepend {
    width: 60px;
  }
  /deep/ .el-input-group__prepend {
    background: $txt-clr02;
  }
  /deep/ .el-input.is-disabled .el-input-group__prepend {
    .el-input__inner,
    .el-input__icon {
      cursor: pointer;
    }
  }
}
.con-icon {
  color: $main-color;
}
.cascader-pic {
  // color: $main-color;
  float: right;
  font-size: 13px;
  margin-top: 7px;
}
.con-cas-title {
  text-align: right;
  padding-top: 4px;
}
.con-cascader {
  height: calc(100% - 88px);
  overflow: hidden;
}

.el-scrollbar {
  height: 100%;
}

.el-scrollbar__wrap {
  overflow-y: scroll;
}
.con-dataset {
  display: inline-block;
  max-width: 120px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  vertical-align: middle;
}
.con-ds {
  display: inline-block;
  vertical-align: middle;
}
.con-cascader /deep/ .el-tree__empty-text {
  display: inline-block;
  top: 57%;
  margin-left: 20px;
  width: 100px;
}
.check-mask {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  z-index: 99;
}
.con-set-line {
  border-left: 1px dashed #dcdfe6;
  margin-right: 30px;
}
.selectTree {
  margin-top: 10px;
  /deep/ .el-select {
    width: 100% !important;
    max-width: 140px;
  }
  .el-select /deep/ .el-select__tags {
    width: auto;
    max-width: 136px;
    max-width: auto;
    overflow-x: hidden;
  }
  /deep/ .el-tag {
    width: auto !important;
  }
}

.num-mul-selected {
  // /deep/ .el-select {
  //   height: 30px;
  //   width: 140px;
  // }
  // /deep/ .el-select__tags {
  //   max-width: 140px !important;
  //   /deep/.el-tag {
  //     height: 20px;
  //     padding: 0 5px;
  //     line-height: 19px;
  //     display: inline-block;
  //     width: auto;
  //   }
  // }
  margin-top: 10px;
  /deep/ .el-select {
    width: auto !important;
    // width: 100% !important;
    max-width: 140px;
  }
  .addNumList {
    width: 60px !important;
  }
  .el-select /deep/ .el-select__tags {
    width: auto;
    max-width: 136px;
    max-width: auto;
    overflow-x: hidden;
  }
  /deep/ .el-tag {
    width: auto !important;
  }
}
/deep/.number-input {
  >input.el-input__inner {
    padding-right: 0;
  }
}
.condi-wrap {
  padding-bottom: 10px
}
.mulit-check {
  padding-left: 10px;
  border-left: 1px dashed $border-clr01;
  vertical-align: text-top;
  display: inline-block;
  >label {
    display: block;
    &:first-child {
      padding-bottom: 10px;
    }
  }
}
</style>

