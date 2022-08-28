<template>
  <div class="condi-set-box">
    <el-container>
      <el-aside
        width="185px"
        class="condi-aside"
      >
        <div style="height:54px">
          <MainTitle
            width="100px"
            title="查询字段"
          />
          <div style="line-height:33px;">
            <span class="con-ds">数据集：</span>
            <el-tooltip
              effect="dark"
              :content="datasetName"
              placement="top-start"
            >
              <span class="con-dataset">{{ datasetName }}</span>
            </el-tooltip>
          </div>
        </div>
        <div style="height:calc(100% - 54px);">
          <GeminiScrollbar class="my-scroll-bar">
            <div style="height:100%; padding-right:20px;">
              <div
                v-for="(item,index) in edcuiCompts[0].comptAttrs.fieldList"
                :key="item.comptAttrs.id+index"
                @click="listChange(index)"
                :class="{'active':cur_index==index,'field-list':true}"
                v-if="item.type !='ElButton'"
              >
                <!-- <span>{{item.type == 'ElDatePicker' ? 'dat': (item.type == 'ElNumber' ? 'NO.': 'var')}} {{ item.comptAttrs.element_name }}</span> -->
                <span>{{ item.comptAttrs.col_type }} {{ item.comptAttrs.element_name }}</span>
                <i
                  class="icon-A10567_fix-pic"
                  v-if="item.type=='ElCascader'"
                />
              </div>
            </div>
          </GeminiScrollbar>
        </div>
      </el-aside>
      <el-main class="condi-main">
        <GeminiScrollbar class="my-scroll-bar">
          <el-tabs
            v-model="activeName2"
            @tab-click="handleClick"
          >
            <el-tab-pane
              label="作用区域设置"
              name="first"
            >
              <div>
                已选择{{ selectedDatasets }}个数据区域（共{{ datasetsLen }}个）
              </div>
              <el-row style="margin-top: 5px;">
                <el-col :span="5">
                  <div class="condi-all-wrap">
                    <el-checkbox
                      :indeterminate="isIndeterminate"
                      v-model="datasetCheckAll"
                      @change="handleCheckAllChange"
                    >
                      全选
                    </el-checkbox>
                  </div>
                </el-col>
                <el-col :span="12">
                  <el-input
                    v-model="edcuiCompts[0].comptAttrs.fieldList[cur_index].comptAttrs.datasetInput"
                    placeholder="请输入内容"
                    @input="datasetInputChange"
                    size="mini"
                  />
                </el-col>
              </el-row>
              <div style="margin: 5px 0;" />
              <el-checkbox-group
                v-model="edcuiCompts[0].comptAttrs.fieldList[cur_index].comptAttrs.checkedDatasets"
                @change="handleCheckedDatasetsChange"
              >
                <!-- <div v-for="(item, idx) in edcuiCompts[1].comptAttrs.tableList"
                  :key="item.sheet_id"> -->
                <div
                  v-for="(dataset, index) in datasetsBak"
                  :key="dataset.af_Id+'&'+index"
                  style="margin-bottom: 5px;"
                >
                  <el-checkbox
                    @change="singleChkChange(dataset, index, dataset.sheet_index)"
                    :label="dataset.sheet_index + '&' + dataset.area_id"
                    :key="dataset.sheet_index + '&' + dataset.area_id"
                    v-model="dataset.show"
                  >
                    {{ dataset.label + (dataset.af_Id != edcuiCompts[0].afId? '（非同数据集）': '') }}
                  </el-checkbox>
                  <div
                    v-if="dataset.open"
                    v-show="dataset.show"
                    class="condi-down"
                  >
                    <el-row>
                      <el-col :span="8">
                        <span
                          class="ds-name"
                          :title="dataset.datasetName"
                        >{{ dataset.datasetName }}</span>
                      </el-col>
                      <el-col :span="16">
                        <el-select
                          v-model="dataset.fieldName"
                          filterable
                          placeholder="请选择"
                          size="mini"
                          @change="(val)=>colChange(val,index)"
                        >
                          <el-option
                            v-for="item in optionsData[index]"
                            :key="item.col_id+'&'+item.element_name"
                            :label="item.element_name"
                            :value="item.element_id"
                            v-if="item.col_type!='dat'||(item.col_type=='dat' && item.isNewCol && item.formatLevel==edcuiCompts[0].comptAttrs.fieldList[cur_index].comptAttrs.formatLevel)"
                          />
                        </el-select>
                      </el-col>
                    </el-row>
                  </div>
                </div>
                <!-- </div> -->
              </el-checkbox-group>
            </el-tab-pane>
            <el-tab-pane
              label="字段设置"
              name="second"
            >
              <div
                v-for="(item,index) in edcuiCompts[0].comptAttrs.fieldList"
                v-show="cur_index == index"
                :key="item.comptAttrs.id+index"
                style="height: calc(100% - 21px);"
                v-if="item.type !='ElButton'"
              >
                <div style="height:50px; padding-top:10px">
                  <el-form
                    :inline="true"
                    size="mini"
                  >
                    <el-form-item label="字段名称">
                      <el-input
                        v-model="item.comptAttrs.label"
                        :placeholder="item.comptAttrs.label"
                      />
                    </el-form-item>
                    <el-form-item
                      label
                      style="position:relation"
                    >
                    </el-form-item>
                  </el-form>
                </div>
                <div
                  class="condi-wrap"
                  v-show="!item.comptAttrs.is_import"
                >
                  <!-- 日期类型 -->
                  <div v-if="item.type=='ElDatePicker'">
                    <div class="con-title">
                      <div class="con-t-line" />
                      <div class="con-t-title">
                        <i class="icon-A10382_square" />
                        <span>条件设置</span>
                      </div>
                    </div>
                    <div class="marB">
                      <el-radio-group
                        v-model="radioCycle[index]"
                        @change="radioChange"
                      >
                        <el-radio label="daterange">
                          区间
                        </el-radio>
                        <el-radio label="date">
                          日期
                        </el-radio>
                      </el-radio-group>
                    </div>
                    <div>
                      <el-checkbox v-model="item.comptAttrs.isSetRequired">
                        设为必填字段
                      </el-checkbox>
                    </div>
                    <div class="con-set-default">
                      <el-checkbox
                        v-model="item.comptAttrs.isSetDefault"
                        @change="defaultChange"
                      >
                        设置默认值
                      </el-checkbox>
                    </div>
                    <div v-show="radioCycle[index] == 'date' && item.comptAttrs.isSetDefault">
                      <el-row>
                        <el-col :span="24">
                          <el-row>
                            <el-col :span="2.5">
                              <a
                                href="javascript:;"
                                class="con-line"
                              >
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
                                  />
                                </el-select>
                              </el-input>
                            </el-col>
                            <el-col
                              :span="8"
                              style="padding-left:20px;"
                            >
                              <el-date-picker
                                size="mini"
                                v-model="date_val[0]"
                                :value-format="dateFormat"
                                :format="dateFormat"
                                :type="item.comptAttrs.dateCycle"
                                placeholder="选择日期"
                                :disabled="true"
                                @change="datePickerChange({type:0,index:0,fieldData:item})"
                              />
                            </el-col>
                          </el-row>
                        </el-col>
                      </el-row>
                    </div>
                    <div v-show="radioCycle[index] == 'daterange' && item.comptAttrs.isSetDefault">
                      <el-row>
                        <el-col>开始时间：</el-col>
                      </el-row>
                      <el-row>
                        <el-col :span="24">
                          <el-row>
                            <el-col :span="2.5">
                              <a
                                href="javascript:;"
                                class="con-line con-line-green"
                              >
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
                                  />
                                </el-select>
                              </el-input>
                            </el-col>
                            <el-col
                              :span="8"
                              style="padding-left:20px;"
                            >
                              <el-date-picker
                                size="mini"
                                v-model="date_val[0]"
                                :type="item.comptAttrs.dateCycle"
                                placeholder="选择日期"
                                :value-format="dateFormat"
                                :format="dateFormat"
                                @change="datePickerChange({type:1,index:0,fieldData:item})"
                                :disabled="true"
                              />
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
                              <a
                                href="javascript:;"
                                class="con-line"
                              >
                                <span>偏移量</span>T
                              </a>
                            </el-col>
                            <el-col :span="8">
                              <el-input
                                placeholder="请输入偏移量"
                                size="mini"
                                @input="dateOffsetChange({type:1,index:1,fieldData:item})"
                                v-model.number="item.comptAttrs.timeOprCount2"
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
                                  />
                                </el-select>
                              </el-input>
                            </el-col>
                            <el-col
                              :span="8"
                              style="padding-left:20px;"
                            >
                              <el-date-picker
                                size="mini"
                                v-model="date_val[1]"
                                :type="item.comptAttrs.dateCycle"
                                placeholder="选择日期"
                                :value-format="dateFormat"
                                :format="dateFormat"
                                @change="datePickerChange({type:1,index:1,fieldData:item})"
                                :disabled="true"
                              />
                            </el-col>
                          </el-row>
                        </el-col>
                      </el-row>
                    </div>
                  </div>
                  <!-- 数值类型 -->
                  <div v-else-if="item.type == 'ElNumber'">
                    <div class="con-title">
                      <div class="con-t-line" />
                      <div class="con-t-title">
                        <i class="icon-A10382_square" />
                        <span>条件设置</span>
                      </div>
                    </div>
                    <div
                      v-for="(num,sub_index) in item.comptAttrs.numList"
                      :key="num.id+'_'+sub_index"
                      style="display:inline-block;;margin-top:8px;margin-bottom:10px;"
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
                        />
                      </el-select>
                      <el-input
                        style="width:75px"
                        :placeholder="item.comptAttrs.placeholder"
                        v-model="num.m_value"
                        :type="num.label < 7 ? 'number' : 'text'"
                        size="mini"
                        :disabled="true"
                        class="number-input"
                      />
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
                          :key="20+item.value"
                          :value="item.value"
                          :label="item.label"
                        />
                      </el-select>
                    </div>
                    <div>
                      <el-checkbox v-model="item.comptAttrs.isSetRequired">
                        设为必填字段
                      </el-checkbox>
                    </div>
                    <div class="con-set-selected">
                      <el-checkbox
                        v-model="item.comptAttrs.isSetSelected"
                        @change="numberMuSelectChange"
                      >
                        自定义下拉选项
                      </el-checkbox>
                    </div>
                    <div
                      class="num-mul-selected"
                      v-show="item.comptAttrs.isSetSelected&&!item.comptAttrs.is_import"
                    >
                      <SelectTree
                        :options="symbols"
                        :value="item.comptAttrs.muNumValue1"
                        :props="props"
                        :clearable="true"
                        :show-checkbox="true"
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
                        />
                      </el-select>
                      <SelectTree
                        :options="symbols"
                        v-show="!item.comptAttrs.is_import&&(item.comptAttrs.numSelectShow||item.comptAttrs.radioCalcu!='0')"
                        :value="item.comptAttrs.muNumValue2"
                        :props="props"
                        :clearable="true"
                        :show-checkbox="true"
                        v-model="item.comptAttrs.muNumValue2"
                        :show-all-levels="false"
                        @selectCheckChange="mutipleNumChange2"
                        :ref="item.comptAttrs.element_id"
                        @VisibleChange="muNum2VisibleChange"
                      />
                    </div>
                    <div
                      class="con-set-default"
                      v-show="!item.comptAttrs.is_import"
                    >
                      <el-checkbox
                        v-model="item.comptAttrs.isSetDefault"
                        @change="numberDefaultChange"
                      >
                        设置默认值
                      </el-checkbox>
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
                        @blur="event=>numberValid(event,defaultNum.m_value,sub_index,index)"
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
                          :disabled="defaultNum.label==21||defaultNum.label==20"
                        >
                          <el-option
                            v-show="sub_index==0"
                            v-for="item in item.comptAttrs.mutipleNumSymbols1"
                            :key="30+item.value"
                            :value="item.value"
                            :label="item.label"
                          />
                          <el-option
                            v-show="sub_index==1"
                            v-for="item in item.comptAttrs.mutipleNumSymbols2"
                            :key="40+item.value"
                            :value="item.value"
                            :label="item.label"
                          />
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
                        />
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
                      <div class="con-t-line" />
                      <div class="con-t-title">
                        <i class="icon-A10382_square" />
                        <span>条件设置</span>
                      </div>
                    </div>
                    <div class="marB">
                      <el-radio-group v-model="item.comptAttrs.conArea">
                        <el-radio label="single">
                          单选
                        </el-radio>
                        <el-radio label="mutiple">
                          多选
                        </el-radio>
                      </el-radio-group>
                      <div class="mulit-check">
                        <el-checkbox v-if="item.comptAttrs.conArea==='mutiple'" :disabled="item.comptAttrs.checkStrictly" v-model="item.comptAttrs.showCheckAll">显示“全选”选项</el-checkbox>
                        <el-checkbox v-if="item.comptAttrs.conArea==='mutiple'" v-model="item.comptAttrs.checkStrictly" @change="val=>checkChange(item.comptAttrs,val)">多选查询控件层级不关联</el-checkbox>
                      </div>
                    </div>
                    <div>
                      <el-checkbox v-model="item.comptAttrs.isSetRequired">
                        设为必填字段
                      </el-checkbox>
                      <!-- <span class="con-set-line" v-show="!item.comptAttrs.is_import"></span> -->
                    </div>
                    <div
                      class="con-title"
                      style="margin-top: 17px;"
                      v-show="!item.comptAttrs.is_import"
                    >
                      <div class="con-t-line" />
                      <div class="con-t-title">
                        <i class="icon-A10382_square" />
                        <span>级联关系</span>
                      </div>
                    </div>
                    <div class="con-cascader">
                      <el-scrollbar>
                        <el-form
                          :inline="true"
                          size="mini"
                        >
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
                                  >{{ c_d.label }}
                                  </el-option>
                                </el-select>
                                <div
                                  :class="{'cascade-line':node.level != 1,'level3':node.level == 3,'level4':node.level == 4,'level5':node.level == 5,'level6':node.level == 6}"
                                >
                                  <i class="cascade-line-icon" />
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
                      <div class="con-t-line" />
                      <div class="con-t-title">
                        <i class="icon-A10382_square" />
                        <span>条件设置</span>
                      </div>
                    </div>
                    <div>
                      <el-checkbox v-model="item.comptAttrs.isSetRequired">
                        设为必填字段
                      </el-checkbox>
                    </div>
                    <!-- 响应下拉框多选状态 -->
                    <div
                      class="con-set-selected"
                      v-show="!item.comptAttrs.is_import"
                    >
                      <el-checkbox
                        v-model="item.comptAttrs.isSetSelected"
                        @change="inputMuSelectChange"
                      >
                        自定义下拉选项
                      </el-checkbox>
                      <div
                        class="selectTree"
                        v-if="item.comptAttrs.isSetSelected"
                      >
                        <SelectTree
                          :options="inputSymbols"
                          :value="item.comptAttrs.mutipleInputValue"
                          :props="props"
                          :clearable="true"
                          :show-checkbox="true"
                          v-model="item.comptAttrs.mutipleInputValue"
                          :show-all-levels="false"
                          @selectCheckChange="mutipleInputChange"
                          :ref="item.comptAttrs.element_id"
                          @VisibleChange="muVisibleChange"
                        />
                      </div>
                    </div>
                    <div
                      class="con-set-default"
                      v-show="!item.comptAttrs.is_import"
                    >
                      <el-checkbox
                        v-model="item.comptAttrs.isSetDefault"
                        @change="inputDefaultChange"
                      >
                        设置默认值
                      </el-checkbox>
                    </div>

                    <div v-show="!item.comptAttrs.is_import && item.comptAttrs.isSetDefault">
                      <el-input
                        style="width:315px"
                        :placeholder="item.comptAttrs.defaultSymbol==21 || item.comptAttrs.defaultSymbol == 20?'':'请输入关键字'"
                        v-model="item.comptAttrs.default_value"
                        size="mini"
                        :disabled="item.comptAttrs.defaultSymbol==21 || item.comptAttrs.defaultSymbol == 20"
                        @input="inputChange({index:index,fieldData:item})"
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
                          />
                        </el-select>
                      </el-input>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </GeminiScrollbar>
      </el-main>
    </el-container>
  </div>
</template>
<script>
import Vue from "vue";
import { mapState, mapGetters, mapMutations, mapActions } from "vuex";
import { setTimeout } from "timers";
import MainTitle from "../tools/MainTitle";
import SelectTree from "../template/ElTreeSelect";
import { objDeepCopy, setTimeFormat, getTimeFromOffset, objClone, fieldMatch, inputNumber, mapDataSetInfoKey } from "../../utils/comonFunc.js";
let id = 1000;
export default {
  components: {
    MainTitle,
    SelectTree
  },
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
      // 树节点配置项
      props: {
        value: "value",
        label: "label",
        children: "null"
      },
      date_val: ["", ""],
      test: "",
      value1: "",
      value2: "",
      radioCycle: [],
      radioCalcu: [],
      activeName: "0",
      cur_index: 2,
      isSetDefault: true,
      timeOpr: 2,
      timeOpr1: 2,
      timeOpr2: 2,
      timeOprCount: 0,
      timeOprCount1: 0,
      timeOprCount2: 0,
      symbols: [
        /* { value: 2, label: ">" },
        { value: 1, label: "<" },
        { value: 3, label: "=" },
        { value: 4, label: "<=" },
        { value: 5, label: ">=" },
        { value: 8, label: "在…中（逗号隔开）" },
        { value: 9, label: "不在…中（逗号隔开）" } */
      ],
      inputSymbols: [
        /* { value: 10, label: "包含", children: null },
        { value: 11, label: "不包含", children: null },
        { value: 8, label: "在…中（逗号隔开）", children: null },
        { value: 9, label: "不在…中（逗号隔开）", children: null },
        { value: 20, label: "为空", children: null },
        { value: 21, label: "不为空", children: null } */
      ],
      timeOprs: [{ value: 1, label: "+" }, { value: 2, label: "-" }],
      conCacul: 1,
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
      nonCheck: true,
      isIndeterminate: false,
      datasetCheckAll: false,
      checkedDatasets: [
      ],
      // datasets: [],
      datasetsBak: [],
      field: '',
      fields: [
        {
          label: 'key code',
          value: 'key code'
        }
      ],
      datasetInput: '',
      selectedDatasets: 0,
      datasetsLen: 0,
      optionsData: []
    };
  },
  mounted() {
    this.init();
    if (this.edcuiCompts[0].comptAttrs.fieldList.length > 1) {
      this.edcuiCompts[0].comptAttrs.fieldList.forEach(val => {
        if (val.comptAttrs.is_import) {
          this.nonCheck = false;
        }
        if (!val.comptAttrs.isSetRequired) {
          // val.comptAttrs.isSetRequired = false
          this.$set(val.comptAttrs, 'isSetRequired', false)
        }
      });
      this.listChange(2);
    }
    // this.getCreateTablePriv();
  },
  computed: {
    ...mapState({
      fieldSetList: state => state.compt.fieldSetList,
      edcuiCompts: state => state.ReportMgt.edcuiCompts,
      datasetName: state => state.ReportAttr.datasetName,
      datasetUrl: state => state.datasetUrl,
      defaultSystemId: state => state.defaultSystemId,
      dgwMsUrl: state => state.dgwMsUrl,
      selectAf: state => state.QueryTable.selectAf,
      importField: state => state.compt.importField,
      vxdatasets: state => state.ReportAttr.datasets,
      nullAutoFill: state => state.commonProperties.report.nullAutoFill
    }),
    ...mapGetters({
      activedCompt: "ReportMgt/getActivedCompt"
    }),
    datasets: {
      get: function () {
        return this.$store.state.ReportAttr.datasets
      },
      set: function (nv) {
        this.upDatasets(nv)
      }
    },
    activeName2: {
      get: function () {
        return this.$store.state.ReportAttr.activeName2
      },
      set: function (name) {
        this.upActiveName2(name)
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
        this.edcuiCompts[0].comptAttrs.fieldList[this.activeName].comptAttrs
          .show_format || "YYYY-MM-DD";
      return setTimeFormat(format, 1);
    },
    editorCondi() {
      return this.edcuiCompts[0].comptAttrs.fieldList[this.activeName];
    }
  },
  watch: {
    datasets: {
      handler(val) {
        let comptAttrs = this.edcuiCompts[0].comptAttrs.fieldList[this.cur_index].comptAttrs
        this.optionsData = []
        val.forEach(dataset => {
          if (comptAttrs.switchFields) {
            let temp = comptAttrs.switchFields[comptAttrs['col_id'] + '&' + comptAttrs['element_name'] + '&' + dataset.sheet_index + '&' + dataset.area_id]
            this.optionsData.push(temp)
          } else {
            this.optionsData.push({})
          }
        })
        this.upDatasets(val)
      },
      deep: true
    },
    radio(val) {
      this.upCycle(val);
    },
    radioCalcu(val) {
      this.edcuiCompts[0].comptAttrs.fieldList[
        this.activeName
      ].comptAttrs.radioCalcu = val[this.activeName];
    },
    radioCycle(val) {
      this.edcuiCompts[0].comptAttrs.fieldList[
        this.activeName
      ].comptAttrs.cycleType = val[this.activeName];
    }
  },
  methods: {
    ...mapMutations({
      upCycle: "QueryTable/upCycle",
      setField: "compt/setField",
      setImportField: "compt/setImportField",
      upActiveName2: "ReportAttr/upActiveName2",
      upDatasets: 'ReportAttr/upDatasets'
    }),
    ...mapActions({
      upCycle: "QueryTable/upCycle",
      setField: "compt/setField",
      upActiveName2: "ReportAttr/upActiveName2",
      checkCreateTablePriv: "compt/checkCreateTablePriv",
      upDatasets: 'ReportAttr/upDatasets',
      queryDimLevelInfo: "compt/queryDimLevelInfo",
      queryDbColConf: "DataSetDesign/queryDbColConf", // 查询数据库字段类型
      getDataSetInfo: "DataSetDesign/getDataSetInfo", // 查询数据集信息
      queryDateFormatList: "DataSetDesign/queryDateFormatList"// 查询日期源格式
    }),
    isRequireChange() {
      let item = this.edcuiCompts[0].comptAttrs.fieldList[this.cur_index];
      let isRequired = item.comptAttrs.isRequired;
      if (isRequired) {
        item.comptAttrs.isSetDefault = true;
      }
    },
    init() {
      this.selectedDatasets = 0;
      this.upActiveName2('first');
      this.resetDatasets();
      this.upDatasets(this.datasets);
    },
    resetDatasets() {
      let arr = [];
      let fieldList = this.edcuiCompts[0].comptAttrs.fieldList;
      let tableList = this.edcuiCompts[1].comptAttrs.tableList;
      tableList.forEach((table, index) => {
        table.area_info.forEach((af, idx) => {
          af.sheet_index = af.sheet_index || table.sheet_index;
          af.sheet_name = af.sheet_name || table.sheet_name;
          this.datasets.forEach(ds => {
            if (ds.sheet_index == table.sheet_index && ds.area_id == af.area_id) {
              let autofill = this.nullAutoFill !== '0' && af.autofill
              let tempAf = {
                ...ds,
                af_Id: af.af_Id,
                af_col: af.af_col,
                af_row: af.af_row,
                area_id: af.area_id,
                area_name: af.area_name,
                sheet_name: af.sheet_name,
                end_x: af.end_x,
                end_y: af.end_y,
                start_x: af.start_x,
                start_y: af.start_y,
                needTitle: af.needTitle,
                query_type: af.query_type,
								where_bean: af.where_bean,
								filterData: af.filterData,
								hideDim: af.hideDim,
								drillData: af.drillData,
								countDataField: af.countDataField,
								selectCount: af.selectCount,
								needTotal: af.needTotal,
								autoMerge: af.autoMerge,
								hiddenDimList: af.hiddenDimList,
								subStyleList: af.subStyleList,
								cellList: af.cellList,
								needBorder: af.needBorder,
								autofill: autofill
              };
              // let keys = Object.keys(ds)
              // keys.forEach(k => {
              //   if (k.indexOf('&') > -1 || ['show', 'open', 'label'].includes(k)) {
              //     tempAf[k] = ds[k]
              //   }
              // })
              this.$set(table.area_info, idx, tempAf);
            }
          });
        });
        arr = arr.concat(table.area_info);
      });


      let cloneArr = objDeepCopy(arr)
      fieldList.forEach(fl => {
        if (fl.type === 'ElButton') {
          return
        }
        let key = fl.comptAttrs.col_id + '&' + fl.comptAttrs.element_name;
        cloneArr.forEach(item => {
          let suffix = '';
          let sheetName = item.sheet_name || '';
          let afId = this.edcuiCompts[0].afId;
          if (item.af_Id != afId) {
            item.show = false;
            item[key + '&' + item.sheet_index + '&' + item.area_id] = typeof (item[key + '&' + item.sheet_index + '&' + item.area_id]) === 'undefined' ? false : item[key + '&' + item.sheet_index + '&' + item.area_id];
            item.open = true;
            suffix = '（非同数据集）';
          } else {
            item.show = true;
            item[key + '&' + item.sheet_index + '&' + item.area_id] = typeof (item[key + '&' + item.sheet_index + '&' + item.area_id]) === 'undefined' ? true : item[key + '&' + item.sheet_index + '&' + item.area_id];
            item.open = false;
          }
          item.label = sheetName + ':' + item.area_name + suffix;
        });
      });

      /* arr.forEach(item => {
        let afId = this.edcuiCompts[0].afId;
        let suffix = '';
        let sheetName = item.sheet_name || '';
        if (item.af_Id != afId) {
          item.open = true;
          suffix = '（非同数据集）';
        } else {
          item.open = false;
        }
        item.label = sheetName + ':' + item.area_name + suffix;
      }); */
      this.datasets = cloneArr;
      this.datasetsBak = JSON.parse(JSON.stringify(cloneArr));
      this.datasetsLen = (this.datasets || []).length;
    },
    handleCheckAllChange() {
      let arr = [];
      let _this = this;
      let obj = this.edcuiCompts[0].comptAttrs.fieldList[this.cur_index].comptAttrs;
      let val = this.datasetCheckAll;
      let key = obj.col_id + '&' + obj.element_name + '&';
      let key2 = obj.col_id + '&' + obj.element_name + '&isCheckAll';
      let key3 = obj.col_id + '&' + obj.element_name + '&isIndeterminate';
      let datasetInput = obj.datasetInput || '';
      // result = [],
      let len = 0
      obj[key2] = val;
      obj[key3] = false;
      if (val) {
        this.datasets.forEach(item => {
          if (item.label.indexOf(datasetInput) != -1) {
            item[key + item.sheet_index + '&' + item.area_id] = true;
            arr.push(item.sheet_index + '&' + item.area_id);
          }
        });
        obj.checkedDatasets = arr;
        // this.selectedDatasets = this.datasets.length;
        this.$set(obj, 'checkedDatasets', arr);
      } else {
        this.datasets.forEach(item => {
          item[key + item.sheet_index + '&' + item.area_id] = false;
        });
        obj.checkedDatasets = [];
        // this.selectedDatasets = 0;
        this.$set(obj, 'checkedDatasets', []);
      }

      this.datasets.map((item, index) => {
        if (arr.includes(item.sheet_index + '&' + item.area_id) && item.label.indexOf(datasetInput) != -1) {
          item.show = true;
          len++
        } else {
          item.show = false;
        }
        this.$set(_this.datasets, index, item);
        this.$set(_this.datasetsBak, index, item);
      });
      this.selectedDatasets = len
      this.upDatasets(this.datasets);
      this.edcuiCompts[0].datasets = this.datasets;
      // this.datasetsBak = JSON.parse(JSON.stringify(this.datasets));
      this.isIndeterminate = false;
      this.edcuiCompts[1].comptAttrs.tableList.forEach((item, idx) => {
        _this.datasets.forEach((dataset, index) => {
          _this.singleChkChange(dataset, index, idx);
        });
      });
      this.datasetInputChange();
    },
    singleChkChange(areaInfo, index, currentSheetIdx) {
      this.currentSheetIdx = currentSheetIdx;
      var item = this.edcuiCompts[0].comptAttrs.fieldList[this.cur_index];
      let obj = item.comptAttrs;
      let key = obj.col_id + '&' + obj.element_name + '&' + areaInfo.sheet_index + '&' + areaInfo.area_id;
      if (areaInfo.open && ((typeof obj.switchFields !== 'object') || (obj.switchFields && !obj.switchFields[key]) || !areaInfo.datasetName)) {
        let afId = areaInfo.af_Id;
        var param = {
          datasetId: afId,
          isQueryTabHis: "1",
          isEdit: 0
        };
        // let _this = this;
        this.queryDbColConf({}).then(response => {
          if (response.status == 200 && response.data.respResult == "1") {
            this.fieldTypeList = response.data.respData || {};
            this.queryDateFormatList({}).then(response => {
              if (response && response.status == 200 && response.data.respResult == "1") {
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
                    const data = respData.anly_frame_elements || []
                    if (data.length === 0) {
                      return
                    }
                    areaInfo.datasetName = respData.af_name;
                    areaInfo.fields = data;
                    areaInfo.fields.forEach(temp => {
                      if (temp.is_show == 0) {
                        return
                      }
                      let col_type = temp.col_type;
                      temp.col_type =
                        fieldMatch(temp.col_type, this.fieldTypeList) == "number"
                          ? "No."
                          : fieldMatch(temp.col_type, this.fieldTypeList) == "date"
                            ? "dat"
                            : temp.col_type.substring(0, 3);

                      temp.element_name = (temp.element_name || "") == "" ? temp.show_type == 1 ? temp.col_name : temp.col_chs_name : temp.element_name;
                      temp.label = temp.element_name;
                      temp.id = temp.element_id + temp.element_name;

                      let dateTypeList = [];// 用来存放，根据源时间格式衍生出的多个不同层级日期字段
                      let show_format = temp.show_format || "";
                      let source_format = temp.source_format || "";
                      if ((show_format != "" || source_format != "") && temp.element_type == 1) {
                        // 如果原字段类型是数值或者字符串的，根据源格式转换获取的格式来判断当前是第几级（1表示年,2表示月,3表示日,4表示小时,5表示分钟,6表示秒）
                        if (fieldMatch(col_type, this.fieldTypeList) == "number" || fieldMatch(col_type, this.fieldTypeList) == "char") {
                          for (let i = 0; i < this.formatList.length; i++) {
                            // 数据源中的源格式YYYYMMDDHHMISS更改成yyyyMMddhh24miss，所以得把格式变成大写且去掉24来匹配是否一致。
                            // 若一致，把YYYYMMDDHHMISS替换成yyyyMMddhh24miss
                            if (this.formatList[i].formatStr.toLocaleUpperCase().replace("24", "") == source_format.toLocaleUpperCase().replace("24", "")) {
                              temp.formatLevel = this.formatList[i].formatLevel;
                              temp.show_format = this.formatList[i].formatStr;
                              temp.source_format = this.formatList[i].formatStr;
                              break;
                            }
                          }
                        } else if (fieldMatch(col_type, this.fieldTypeList) == "date") {
                          // 如果字段原类型是日期的，则默认展示到秒
                          temp.formatLevel = 6;
                          temp.show_format = "yyyy-MM-dd hh24:mi:ss"
                          temp.source_format = "yyyy-MM-dd hh24:mi:ss";
                        }
                        col_type = "date";
                        temp.col_type = "dat";
                      }
                      if (fieldMatch(col_type, this.fieldTypeList) == "date") {
                        var split1 = "";
                        if (show_format.indexOf("/") > -1) {
                          split1 = "/";
                        } else if (show_format.indexOf("-") > -1) {
                          split1 = "-";
                        }
                        // 1表示年,2表示月,3表示日,4表示小时,5表示分钟,6表示秒
                        for (let i = 1; i <= temp.formatLevel; i++) {
                          let dateTemp = objDeepCopy(temp);
                          dateTemp.formatLevel = i;// 日期字段的层级（1表示年,2表示月,3表示日,4表示小时,5表示分钟,6表示秒）
                          dateTemp.isNewCol = true;// 用来判断是否是日期字段新增加的日期层级字段
                          let dateCycle = "year"
                          if (i == 1) {
                            // 年
                            dateCycle = "year";
                            dateTemp.element_name = dateTemp.element_name + "(YYYY)";
                            dateTemp.show_format = temp.show_format.substring(0, 4);
                          } else if (i == 2) {
                            // 月
                            dateCycle = "month";
                            dateTemp.element_name = dateTemp.element_name + "(MM)";
                            dateTemp.show_format = split1 == "" ? temp.show_format.substring(0, 6) : temp.show_format.substring(0, 7);
                          } else if (i == 3) {
                            // 日
                            dateCycle = "date";
                            dateTemp.element_name = dateTemp.element_name + "(DD)";
                            dateTemp.show_format = split1 == "" ? temp.show_format.substring(0, 8) : temp.show_format.substring(0, 10);
                          } else if (i == 4) {
                            dateCycle = "datetime";
                            dateTemp.element_name = dateTemp.element_name + "(HH)";
                            let indx = temp.source_format.indexOf(":") > -1 ? 1 : 0;// 是否存在冒号，截取是否要多截取一位
                            dateTemp.show_format = temp.show_format.indexOf("mi") > -1 ? temp.show_format.substring(0, temp.show_format.indexOf("mi") - indx) : temp.show_format;
                          } else if (i == 5) {
                            dateCycle = "datetime";
                            dateTemp.element_name = dateTemp.element_name + "(MI)";
                            let indx = temp.source_format.indexOf(":") > -1 ? 1 : 0;// 是否存在冒号，截取是否要多截取一位
                            dateTemp.show_format = temp.show_format.indexOf("ss") > -1 ? temp.show_format.substring(0, temp.show_format.indexOf("ss") - indx) : temp.show_format;
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
                          dateTypeList.push(dateTemp);
                        }
                      }
                      areaInfo.fields = areaInfo.fields.concat(dateTypeList)
                    });
                    let currentColType = obj.col_type;
                    areaInfo.fields = areaInfo.fields.filter(item => {
                      return item.is_show !== '0' && item.element_type == 1 && item.col_type.toLowerCase() == currentColType.toLowerCase();
                    })
                    if (typeof obj.switchFields !== 'object') {
                      obj.switchFields = {};
                    }
                    obj.switchFields[key] = JSON.parse(JSON.stringify(areaInfo.fields));
                    this.$set(obj.switchFields, key, JSON.parse(JSON.stringify(areaInfo.fields)));
                    this.$set(this.datasets, index, areaInfo);
                    this.$set(this.datasetsBak, index, areaInfo);
                    this.edcuiCompts[0].datasets = this.datasets;
                    this.upDatasets(this.datasets);
                  }
                })
              }
            })
          }
        })
      }
    },
    handleCheckedDatasetsChange() {
      let _this = this;
      let item = this.edcuiCompts[0].comptAttrs.fieldList[this.cur_index];
      let obj = item.comptAttrs;
      let value = obj.checkedDatasets;
      let len = 0;
      let key = obj.col_id + '&' + obj.element_name + '&';
      // datasetInput = obj.datasetInput || '',
      let result = []
      /* if (datasetInput) {
        result = this.datasets.filter(item => {
          return (item.label.indexOf(datasetInput) != -1);
        });
      } else {
        result = this.datasets;
      } */

      this.datasets.map((item, index) => {
        if (value.includes(item.sheet_index + '&' + item.area_id)) {
          item.show = true;
          item[key + item.sheet_index + '&' + item.area_id] = true;
          len++;
        } else {
          item.show = false;
          let showKey = obj.col_id + '&' + obj.element_name;
          item.field && (item.field[showKey] = '');
          item.fieldName = '';
          item[key + item.sheet_index + '&' + item.area_id] = false;
        }
        /* if (item.label.indexOf(datasetInput) != -1) {
          result.push(item)
          if (item.show) {
            len++;
          }
        } */
        _this.$set(_this.datasets, index, item);
        _this.$set(_this.datasetsBak, index, item);
      });
      this.upDatasets(this.datasets);
      this.edcuiCompts[0].datasets = this.datasets;
      this.selectedDatasets = len;
      this.datasetCheckAll = this.selectedDatasets >= result.length;
      this.isIndeterminate = this.selectedDatasets > 0 && this.selectedDatasets < this.datasets.length;
      let key2 = obj.col_id + '&' + obj.element_name + '&isCheckAll';
      let key3 = obj.col_id + '&' + obj.element_name + '&isIndeterminate';
      obj[key2] = this.datasetCheckAll;
      obj[key3] = this.isIndeterminate;
      this.datasetInputChange();
    },
    datasetInputChange() {
      let item = this.edcuiCompts[0].comptAttrs.fieldList[this.cur_index];
      let obj = item.comptAttrs;
      let datasetInput = obj.datasetInput || '';
      let result = []
      if (datasetInput) {
        result = this.datasets.filter(item => {
          return (item.label.indexOf(datasetInput) != -1);
        });
      } else {
        result = this.datasets;
      }
      let checkedCount = 0;
      this.datasetsBak = JSON.parse(JSON.stringify(result));
      // this.upDatasets(this.datasets);
      let selectedArr = [];
      this.datasets.forEach((item, index) => {
        if (item.show) {
          selectedArr.push(item.sheet_index + '&' + item.area_id);
          checkedCount++;
        }
      });
      obj.checkedDatasets = selectedArr;
      this.$set(item.comptAttrs, 'checkedDatasets', selectedArr);
      this.$set(this.edcuiCompts[0].comptAttrs.fieldList, this.cur_index, item);
      if (datasetInput === '') {
        this.datasetCheckAll = this.datasets.length > 0 && checkedCount === this.datasets.length;
        this.isIndeterminate = checkedCount > 0 && checkedCount < this.datasets.length;
      }
    },
    handleClick() {

    },
    defaultChange() {
      var data = this.edcuiCompts[0].comptAttrs.fieldList[this.cur_index]
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
        var radioCycle = this.edcuiCompts[0].comptAttrs.fieldList[this.cur_index]
          .comptAttrs.cycleType;
        var item = this.edcuiCompts[0].comptAttrs.fieldList[this.cur_index];
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
      var item = this.edcuiCompts[0].comptAttrs.fieldList[this.cur_index]
        .comptAttrs;
      var param = {
        dimId: item.dim_id
      };
      var _this = this;
      this.queryDimLevelInfo(param).then(function (response) {
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
          // _this.$message.error("维层关系为空");
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
      this.upActiveName2('first');
      this.cur_index = index;
      this.activeName = index;
      let _this = this;
      var item = this.edcuiCompts[0].comptAttrs.fieldList[index];
      let obj = item.comptAttrs;
      let key = item.comptAttrs.col_id + '&' + item.comptAttrs.element_name;
      let len = 0;
      this.datasets.forEach((dataset, index) => {
        if (dataset.af_Id != this.edcuiCompts[0].afId) {
          let temp = dataset.field && dataset.field[key] && dataset.field[key] || {};
          dataset.fieldName = temp.element_id;
        }
        dataset.show = dataset[key + '&' + dataset.sheet_index + '&' + dataset.area_id];
        _this.$set(_this.datasetsBak, index, dataset);
        _this.$set(_this.datasets, index, dataset);
        if (dataset.show) {
          len++;
        }
      });
      this.upDatasets(this.datasets);
      // this.datasetsBak = JSON.parse(JSON.stringify(this.datasets));
      let key2 = obj.col_id + '&' + obj.element_name + '&isCheckAll';
      let key3 = obj.col_id + '&' + obj.element_name + '&isIndeterminate';
      item.comptAttrs.label2 = item.comptAttrs.label;
      this.datasetCheckAll = obj[key2] ? obj[key2] : false;
      this.isIndeterminate = obj[key3] ? obj[key3] : false;
      this.selectedDatasets = len;
      this.datasetsLen = this.datasets.length;
      this.edcuiCompts[1].comptAttrs.tableList.forEach((item, idx) => {
        _this.datasetsBak.forEach((dataset, index) => {
          if (item.sheet_index == dataset.sheet_index) {
            dataset.label = `${item.sheet_name}:${dataset.area_name}`
            _this.$set(_this.datasetsBak, index, dataset);
            _this.$set(_this.datasets, index, dataset);
          }
          _this.singleChkChange(dataset, index, idx);
        });
      });
      this.datasetInputChange();
      if (item.type == "ElDatePicker") {
        this.resetCondi();
      } else if (item.type == "ElCascader") {
        this.getDimRelation();
      }
    },
    changeCycle(item) {
      item.comptAttrs.radioCycle = this.radio;
    },
    radioChange(value) {
      var item = this.edcuiCompts[0].comptAttrs.fieldList[this.cur_index];
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
      // var item = this.activedCompt.comptAttrs.fieldList[this.cur_index];
      // this.date_val = item.comptAttrs.m_value || ["", ""];

      // this.timeOprCount = "";
      // this.timeOprCount1 = "";
      // this.timeOprCount2 = "";
      // this.timeOpr = 1;
      // this.timeOpr1 = 1;
      // this.timeOpr2 = 1;
      // if (value == "date") {
      //   this.datePickerChange({ type: 0, index: 0, fieldData: item });
      //   // this.daysChange("timeOprCount", "timeOpr", 0);
      //   // this.dateChange(item.comptAttrs.m_value[0], "timeOpr", "timeOprCount");
      // } else {
      //   // this.dateChange(
      //   //   item.comptAttrs.m_value[0],
      //   //   "timeOpr1",
      //   //   "timeOprCount1"
      //   // );
      //   // this.dateChange(
      //   //   item.comptAttrs.m_value[1],
      //   //   "timeOpr2",
      //   //   "timeOprCount2"
      //   // );
      //   // this.daysChange("timeOprCount1", "timeOpr1", 0);
      //   // this.daysChange("timeOprCount2", "timeOpr2", 1);
      //   this.datePickerChange({ type: 1, index: 0, fieldData: item });
      //   this.datePickerChange({ type: 1, index: 1, fieldData: item });
      // }
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
      var item = this.edcuiCompts[0].comptAttrs.fieldList[this.activeName].comptAttrs;

      const num = item.numList;
      const defaultNum = item.defaultNumList; // 数值类型存放默认值
      if (val == 0 && num.length == 2) {
        num.splice(1, 1);
        defaultNum.splice(1, 1);
        item.numSelectShow = false;
      } else if (num.length == 2) {
        item.numSelectShow = true;
      } else {
        if ((item.muNumValue2 || []).length === 0) {
          num.push({ id: "1", label: 2, m_value: "" });
          defaultNum.push({ id: "1", label: 2, m_value: "" });
        } else {
          num.push({ id: "1", label: item.muNumValue2[0], m_value: "" });
          defaultNum.push({ id: "1", label: item.muNumValue2[0], m_value: "" });
        }
        item.numSelectShow = true;
      }
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
      this.edcuiCompts[0].comptAttrs.fieldList[
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
      var afId = this.edcuiCompts[0].afId;
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
      var item = this.edcuiCompts[0].comptAttrs.fieldList[this.cur_index];
      var offset = 0;
      var timeOpr;
      var timeOprCount;
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
      var item = this.edcuiCompts[0].comptAttrs.fieldList[this.cur_index];
      var suffix = "";
      if (paramObj.type == 1) {
        suffix = paramObj.index == 0 ? "1" : "2";
      }
      var offset = 0;
      if ((item.comptAttrs["timeOprCount" + suffix] || 0) != "") {
        if (!Number.isInteger(item.comptAttrs["timeOprCount" + suffix] || 0)) {
          // 偏移量必须为整数
          item.comptAttrs["timeOprCount" + suffix] = "0";
        } else if (parseInt(item.comptAttrs["timeOprCount" + suffix]) > 1000) {
          // 偏移量最大值为1000
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
      if (paramObj.type == 1) {
        this.checkIfOutRange(paramObj.index);
      }
    },
    // 从时间推偏移量
    getOffsetFromTime(show_format, time) {
      show_format = show_format.toLocaleUpperCase();
      var currentDate = new Date();
      var offset = 0;
      var yearOff = parseInt(time.substring(0, 4)) - currentDate.getFullYear();
      var monthOff = 0;
      var currentMonth = currentDate.getMonth() + 1;
      var oldDate;
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
      var item = this.edcuiCompts[0].comptAttrs.fieldList[this.cur_index];
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
          var suffix = index == 0 ? 1 : 2;
          var another = index == 0 ? 2 : 1;
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
      var item = this.edcuiCompts[0].comptAttrs.fieldList[this.cur_index];
      this.date_val = item.comptAttrs.m_value || ["", ""];
      // this.timeOprCount = "";
      // this.timeOprCount1 = "";
      // this.timeOprCount2 = "";
      // this.timeOpr = 1;
      // this.timeOpr1 = 1;
      // this.timeOpr2 = 1;
      if (item.comptAttrs.isSetDefault) {
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
      }
    },
    colChange(val, index) {
      let item = { ...this.datasets[index] }
      if (typeof (item.field) !== 'object') { item.field = {} }
      let itemList = this.optionsData[index]
      itemList.some(item => {
        if (item.element_id === val) {
          val = item
          return true
        }
      })
      // let name = (val.element_name || "") == "" ? item.show_type == 1 ? val.col_name : val.col_chs_name : val.element_name;
      let fieldObj = this.edcuiCompts[0].comptAttrs.fieldList[this.cur_index].comptAttrs;
      let key = fieldObj.col_id + '&' + fieldObj.element_name;
      item.field[key] = val
      item.fieldName = val.element_id;
      this.$set(this.datasets, index, item);
      this.$set(this.datasetsBak, index, item);
      // this.edcuiCompts[0].datasets = this.datasets;
      this.upDatasets(this.datasets);
    },
    checkIsNullInput(item, index) {
      let val = item.comptAttrs['timeOprCount' + ( index===0 ? "" : index)];
      if (val === null || val === '') {
        this.$message.error("偏移量不能为空");
        this.$set(this.date_val, index - 1, this.date_val[index===0?-1:(index == 1 ? 1 : 0)]);
        this.$set(item.comptAttrs, 'timeOprCount' + (index===0?'':index), index === 0 ? 0 : item.comptAttrs['timeOprCount' + (index == 1 ? 2 : 1)]);
        this.$set(item.comptAttrs, 'timeOpr' + (index===0?'':index),  item.comptAttrs['timeOpr' + (index === 0 ? '' : index == 1 ? 2 : 1)]);
      }
    },
    numberMuSelectChange() {
      let data = this.activedCompt.comptAttrs.fieldList[this.cur_index].comptAttrs;
      let isChange = data.isSetSelected;
      if (!isChange) {
        let elementId = data.element_id;
        let numSelectTree = this.$refs[elementId];
        numSelectTree[0].clearHandle();
        numSelectTree[1].clearHandle();
      }
    },
    // 数字多选下拉框隐藏
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
        item.comptAttrs.numList[0].label = item.comptAttrs.muNumValue1[0] || this.symbols[0].value;
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
      if (!item.comptAttrs.isSetDefault && item.comptAttrs.numList[1]) {
        item.comptAttrs.numList[1].label = item.comptAttrs.muNumValue2[0] || this.symbols[0].value;
      }
      if (!val.length) {
        let allSymbos = objDeepCopy(this.symbols);
        item.comptAttrs.mutipleNumSymbols2 = allSymbos;
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
              // 将下拉选项重置 选项为多选数组第一个 清空输入框默认值
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
          }
          if (!muNumValue1.includes(num1.label)) {
            num1.label = muNumValue1[muNumValue1.length - 1];
            num1.m_value = "";
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
              // 将下拉选项重置 选项为多选数组第一个 清空输入框默认值
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
    // 接收树组件传来的selcet隐藏事件
    muVisibleChange(val) {
      if (!val) {
        let item = this.activedCompt.comptAttrs.fieldList[this.cur_index];
        let mutipleInputValue = item.comptAttrs.mutipleInputValue || [];
        if (mutipleInputValue.length) {
          if (item.comptAttrs.isSetDefault) {
            if (!mutipleInputValue.includes(item.comptAttrs.defaultSymbol)) {
              // 将下拉选项重置 选项为多选数组第一个 清空输入框默认值
              item.comptAttrs.defaultSymbol = mutipleInputValue[mutipleInputValue.length - 1];
              item.comptAttrs.default_value = "";
              this.$message.error("设置的默认选项不包含在下拉选项中,请重新设置默认值");
            }
          } else {
            if (!mutipleInputValue.includes(item.comptAttrs.defaultSymbol)) {
              // 将下拉选项重置 选项为多选数组第一个 清空输入框默认值
              item.comptAttrs.defaultSymbol = mutipleInputValue[mutipleInputValue.length - 1];
              item.comptAttrs.default_value = "";
            }
          }
          if (!mutipleInputValue.includes(item.comptAttrs.symbol)) {
            // 如果外面输入框不包含 重置外面输入框
            item.comptAttrs.symbol =
                mutipleInputValue[mutipleInputValue.length - 1];
            item.comptAttrs.m_value = "";
          }
        }
      }
    },
    // 监听自定义下拉选项文本类型事件
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
      this.$set(item.comptAttrs, 'mutipleInputSymbols', arr);
      this.$set(item.comptAttrs, 'mutipleInputValue', val);
      if (!item.comptAttrs.mutipleInputValue.length) {
        this.initInputSybols();
      }
      if (!item.comptAttrs.isSetDefault) {
        item.comptAttrs.symbol = item.comptAttrs.mutipleInputValue[0] || this.inputSymbols[0].value;
      }
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
            if ((data.muNumValue1 || []).length === 0) {
              this.$set(data.defaultNumList[index], "label", this.symbols[0].value);
              this.$set(data.numList[0], "label", this.symbols[0].value);
            } else {
              this.$set(data.defaultNumList[index], "label", data.muNumValue1[0]);
              this.$set(data.numList[0], "label", data.muNumValue1[0]);
            }
          } else {
            if ((data.muNumValue2 || []).length === 0) {
              this.$set(data.defaultNumList[index], "label", this.symbols[0].value);
              this.$set(data.numList[1], "label", this.symbols[0].value);
            } else {
              this.$set(data.defaultNumList[index], "label", data.muNumValue2[0]);
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
            if ((data.muNumValue1 || []).length === 0) {
              this.$set(data.defaultNumList[index], "label", this.symbols[0].value);
              this.$set(data.numList[0], "label", this.symbols[0].value);
            } else {
              this.$set(data.defaultNumList[index], "label", data.muNumValue1[0]);
              this.$set(data.numList[0], "label", data.muNumValue1[0]);
            }
          } else {
            if ((data.muNumValue2 || []).length === 0) {
              this.$set(data.defaultNumList[index], "label", this.symbols[0].value);
              this.$set(data.numList[1], "label", this.symbols[0].value);
            } else {
              this.$set(data.defaultNumList[index], "label", data.muNumValue2[0]);
              this.$set(data.numList[1], "label", data.muNumValue2[0]);
            }
          }
        }
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
      let data = this.activedCompt.comptAttrs.fieldList[this.cur_index].comptAttrs;
      let isChange = data.isSetDefault;
      if (!isChange) {
        this.$set(data, "default_value", "");
        this.$set(data, "m_value", "");
        // this.$set(data, "defaultSymbol",);
      }
    },
    inputChange(paramObj) {
      var item = this.activedCompt.comptAttrs.fieldList[this.cur_index];
      if (item.type == "ElNumber") {
        var num = objDeepCopy(paramObj.fieldData);
        if(num.label > 7) {
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
    // input下拉多选时如果没有多选下拉值
    initInputSybols() {
      var item = this.activedCompt.comptAttrs.fieldList[this.cur_index];
      let inputSymbols = objDeepCopy(this.inputSymbols);
      item.comptAttrs.mutipleInputSymbols = inputSymbols;
    },
    numberValid(InputEvent,val,sub_index,index) {
      let num = this.edcuiCompts[0].comptAttrs.fieldList[index].comptAttrs.defaultNumList[sub_index]
      if (val === null || val === undefined || val === '') {
        InputEvent.target.value = ''
      } else if (num.label) {
        let val2 = inputNumber(num.m_value,'mulit').replace(/\-+$/g,'')
        num.m_value = val2
        this.edcuiCompts[0].comptAttrs.fieldList[index].comptAttrs.defaultNumList[sub_index].m_value = val2
      }
    },
    /* numValid(num,sub_index,index) {
      if (num.label > 7) {
        let val2 = inputNumber(val,'mulit')
        this.edcuiCompts[0].comptAttrs.fieldList[index].comptAttrs.numList[sub_index].m_value = val2
      }
    } */
    checkChange(item, val) {
      if (val === true) {
        item.showCheckAll = false
      }
    }
  },
  created() {
    this.setradioCalcu(this.edcuiCompts[0]); // 设置日期粒度类型和计算且或类型
    const defaultSymbol = require("../../../public/comptConfig/cellCompt.json");
    this.symbols = defaultSymbol.ElNumberSymbols
    this.inputSymbols = defaultSymbol.ElInputSymbols
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
  }
  .condi-main {
    padding-left: 20px;
    margin-right: -10px;
    /deep/ .el-input-group {
      vertical-align: middle;
    }
    .el-tabs {
      padding-right: 10px;
    }
    /deep/.number-input > input {
      padding-right: 0px
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
  /deep/.gm-scrollbar.-horizontal {
    margin-bottom: -15px;
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
.condi-main /deep/ .el-radio {
  margin-right: 40px;
}
.con-set-default {
  margin: 25px 0 8px 0;
}
.con-line {
  color: $main-color;
  display: block;
  height: 28px;
  line-height: 28px;
  text-align: right;
  padding-right: 8px;
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
.condi-main /deep/ .el-input-group__prepend {
  width: 60px;
}
.condi-main /deep/ .el-input-group__prepend {
  background: $txt-clr02;
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
.attrSet .condi-main /deep/ {
  .el-tabs__item {
    color: $txt-clr03;
    &.is-active {
      color: $main-color;
    }
  }
  .el-tabs__active-bar {
    background-color: $main-color;
  }
  .el-tabs__nav-wrap:after {
    background-color: $border-clr01;
  }
}
.condi-down {
  font-size: 12px;
  padding-left: 26px;
  padding-top: 8px;
  span {
    display: block;
    height: 28px;
    line-height: 28px;
  }
}
.condi-all-wrap {
  height: 28px;
  line-height: 28px;
}
.ds-name {
  white-space: nowrap;
  overflow: hidden;
  max-width: 100%;
  text-overflow: ellipsis;
}
.con-set-default {
  margin: 15px 0 8px 0;
}
.con-set-selected {
  margin: 15px 0 8px 0;
}
.marB {
  margin-bottom: 10px;
}
.selectTree {
  margin-top: 10px;
}
.attrSet {
  .el-select /deep/.el-tag {
    width: auto;
    border-color: transparent;
    margin: 2px 0 2px 6px;
    background-color: #f0f2f5;
  }
  .num-mul-selected {
    margin-top: 10px;
    /deep/ .el-select {
      width: auto;
      // width: 100%;
      max-width: 140px;
    }
    .addNumList {
      width: 60px;
    }
    .el-select /deep/ .el-select__tags {
      width: auto;
      max-width: 136px;
      max-width: auto;
      overflow-x: hidden;
    }
  }
}
.condi-wrap /deep/.el-input.is-disabled .el-input-group__prepend .el-input__inner,
.condi-wrap /deep/.el-input.is-disabled .el-input-group__prepend .el-input__icon {
  cursor: pointer;
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

