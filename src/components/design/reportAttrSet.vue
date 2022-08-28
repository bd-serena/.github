<template>
  <div class="attrSet">
    <el-container style="position:relative">
      <el-header class="rf-aside-title">{{activedNum == 0 ? '参数设置':'数据绑定'}}</el-header>
      <el-tabs
        type="border-card"
        v-model="activeName"
        :class="['tabcard',{seniorHide:activedNum == 0}]"
      >
        <el-tab-pane label="数据" name="attr" style="height:100%;">
          <el-container class="el-row-24">
            <el-aside v-if="activedNum == 1" width="50%" class="aside-left bg-purple">
              <el-tooltip
                effect="dark"
                :enterable="false"
                :content="areaInfo.area_name||'区域：未定义'"
                placement="bottom"
              >
                <div class="as-title">{{areaInfo.area_name||'区域：未定义'}}</div>
              </el-tooltip>
              <el-scrollbar style="height: calc(100% - 83px);">
                <div class="table-wrap">
                  <el-row v-show="polymerizeType == 1 && cur_drillData.length > 0">
                    <el-col :span="12" class="co-highlight">
                      <el-tooltip effect="dark" :enterable="false" content="钻取/维度" placement="top">
                        <em>
                          <span class="icon-A10475_ExpandContraction"></span>
                          <span>钻取/维度</span>
                        </em>
                      </el-tooltip>
                    </el-col>
                    <el-col :span="12" class="setting-wrap">
                      <span @click="openDrill">
                        <span class="icon-A10184_filter"></span>
                        过滤
                      </span>
                    </el-col>
                  </el-row>
                  <div
                    class="drill-wrap"
                    v-if="polymerizeType == 1"
                    :style="cur_drillData.length > 0 ? 'margin-bottom: 15px;': ''"
                  >
                    <div
                      class="drill"
                      v-for="(drill, index) in cur_drillData"
                      :id="index"
                      :key="drill.element_name"
                    >
                      <el-row>
                        <el-col :span="4">
                          <a href="javascript:;" class="triggle" @click="triggleExp(drill)">
                            <span
                              :class="{'icon-A10011_triangleRight': !drill.expand, 'icon-A10009_triangleDown':drill.expand}"
                            ></span>
                          </a>
                        </el-col>
                        <el-col :span="20">
                          <el-tag class="drill-tag">
                            <span class="col-span">
                              <span :title="drill.element_name">{{ drill.element_name }}</span>
                            </span>
                            <a
                              href="javascript:;"
                              @click="deleteDrill(index)"
                              class="delete-tag el-icon-delete"
                            ></a>
                          </el-tag>
                        </el-col>
                      </el-row>
                      <div class="sub-drill-wrap" v-show="drill.expand">
                        <draggable
                          v-model="drill.subDrill"
                          class="query-drill"
                          @end="reSort"
                          @start="dragStart"
                          :move="allow"
                          handle=".header"
                          filter=".default-tag"
                          :options="{group:{name:'people'}}"
                        >
                          <el-row
                            class="sub-drill"
                            v-for="(sd,idx) in drill.subDrill"
                            v-bind:key="sd.element_name|| sd.dim_level_id"
                          >
                            <el-col :span="4" style="height: 33px;"></el-col>
                            <el-col :span="20">
                              <el-tag class="drill-tag">
                                <span class="col-span">
                                  <span
                                    :title="sd.element_name || sd.dim_level_name"
                                  >{{ sd.element_name || sd.dim_level_name }}</span>
                                </span>
                                <a
                                  href="javascript:;"
                                  @click="deleteSubDrill(idx)"
                                  class="delete-tag el-icon-delete"
                                ></a>
                              </el-tag>
                            </el-col>
                          </el-row>
                        </draggable>
                        <div
                          slot="footer"
                          style="margin-bottom:5px; text-align:center;position: relative;"
                        >
                          <draggable
                            class="copy-dragg"
                            filter=".default-tag"
                            v-model="copyDragg"
                            :options="{group:{name:'people'}}"
                          ></draggable>
                          <el-tag slot="footer" class="default-tag">拖动右侧字段至此</el-tag>
                        </div>
                      </div>
                    </div>
                  </div>
                  <el-row>
                    <el-col :span="12" class="co-highlight">
                      <el-tooltip
                        effect="dark"
                        :enterable="false"
                        content="对字段数据纵向扩展"
                        placement="top"
                      >
                        <em>
                          <span class="icon-A10669_Column"></span>
                          <span>列</span>
                        </em>
                      </el-tooltip>
                    </el-col>
                    <el-col :span="12" v-if="rowShow" class="setting-wrap">
                      <span class="transfer" @click="transfer">
                        <span class="icon-A10480_LiftUpAndDown"></span>
                        转置
                      </span>
                    </el-col>
                  </el-row>
                  <draggable
                    v-model="cur_colData"
                    class="query-col"
                    @end="reSort"
                    @start="dragStart"
                    :move="allow"
                    filter=".default-tag"
                    style="padding-right:10px"
                    :options="{group:{name:'people'}}"
                  >
                    <el-tag
                      v-for="(item, index) in cur_colData"
                      v-bind:class="{dl_col:item.element_type == 2?true:false}"
                      v-bind:key="item.comptSort"
                    >
                      <span class="col-span">
                        <span>{{item.col_type}}</span>
                        <span :title="item.element_name">{{ item.element_name }}</span>
                      </span>
                      <span style="float:right">
                        <el-tooltip
                          effect="dark"
                          :enterable="false"
                          :content="item.actived?'钻取顶层':'已绑定维层'"
                          v-show="item.type == 'ElCascader'"
                          placement="top"
                        >
                          <i
                            :class="{'active': item.actived, 'icon-A10567_fix rp-had-elcas': true }"
                            @click="addDrill(item)"
                          ></i>
                        </el-tooltip>
                        <el-tooltip
                          effect="dark"
                          :enterable="false"
                          :content="item.actived?'钻取顶层':'钻取'"
                          placement="top"
                          v-show="item.type != 'ElCascader' && item.element_type == 1 && !isDetail"
                        >
                          <i
                            :class="{'active': item.actived, 'icon-A10567_fix rp-elcas': true }"
                            @click="addDrill(item)"
                          ></i>
                        </el-tooltip>
                        <i class="icon-A10423_import" v-show="item.type == 'ElImport'"></i>
                        <span style="float:right">
                          <span class="sort-wrap" v-show="item.is_calcul==0">
                            <el-tooltip
                              effect="dark"
                              :enterable="false"
                              content="升序"
                              placement="top"
                            >
                              <i
                                :class="{'icon-A10008_triangleUp': true, 'sort-selected': item.sort == 1}"
                                @click="sort(index, cur_colData, 1)"
                              ></i>
                            </el-tooltip>
                            <el-tooltip
                              effect="dark"
                              :enterable="false"
                              content="降序"
                              placement="bottom"
                            >
                              <i
                                :class="{'icon-A10009_triangleDown': true, 'sort-selected': item.sort == 2}"
                                @click="sort(index, cur_colData, 2)"
                              ></i>
                            </el-tooltip>
                          </span>
                          <el-tooltip
                            effect="dark"
                            :enterable="false"
                            content="删除"
                            placement="top-start"
                          >
                            <i
                              class="opt-btn el-icon-delete"
                              @click="deleteItem(item, 'col')"
                              style="margin-left: 2px;"
                            ></i>
                          </el-tooltip>
                        </span>
                      </span>
                    </el-tag>
                  </draggable>
                  <div
                    slot="footer"
                    style="padding-right:10px;margin-bottom:20px; position:relative;"
                  >
                    <draggable
                      class="copy-col"
                      filter=".default-tag"
                      v-model="copyCol"
                      :options="{group:{name:'people'}}"
                    ></draggable>
                    <el-tag slot="footer" class="default-tag">双击或拖动右侧字段至此</el-tag>
                  </div>
                  <div class="as-col-wrap" v-if="rowShow">
                    <el-row>
                      <el-col :span="12" class="co-highlight">
                        <el-tooltip
                          effect="dark"
                          :enterable="false"
                          content="对字段数据横向扩展"
                          placement="top"
                        >
                          <em>
                            <span class="icon-A10429_orders"></span>
                            <span>行</span>
                          </em>
                        </el-tooltip>
                      </el-col>
                    </el-row>
                    <draggable
                      v-model="cur_rowData"
                      class="query-row"
                      @end="reSort"
                      @start="dragStart"
                      :move="allow"
                      filter=".default-tag"
                      style="padding-right:10px"
                      ref="rowDragg"
                      :options="{group:{name:'people'}}"
                    >
                      <el-tag
                        v-for="(item, index) in cur_rowData"
                        v-bind:class="{dl_col:item.element_type != 1?true:false}"
                        v-bind:key="item.comptSort"
                      >
                        <span class="col-span">
                          <span>{{item.col_type}}</span>
                          <span :title="item.element_name">{{ item.element_name }}</span>
                        </span>

                        <span style="float:right">
                          <el-tooltip
                            effect="dark"
                            :enterable="false"
                            :content="item.actived?'钻取顶层':'已绑定维层'"
                            v-show="item.type == 'ElCascader'"
                            placement="top"
                          >
                            <i
                              :class="{'active': item.actived, 'icon-A10567_fix rp-had-elcas': true }"
                              @click="addDrill(item)"
                            ></i>
                          </el-tooltip>
                          <el-tooltip
                            effect="dark"
                            :enterable="false"
                            :content="item.actived?'钻取顶层':'钻取'"
                            placement="top"
                            v-show="item.type != 'ElCascader' && item.element_type == 1 && !isDetail"
                          >
                            <i
                              :class="{'active': item.actived, 'icon-A10567_fix rp-elcas': true }"
                              @click="addDrill(item)"
                            ></i>
                          </el-tooltip>
                          <i class="icon-A10423_import" v-show="item.type == 'ElImport'"></i>
                          <span class="sort-wrap" v-show="item.is_calcul==0">
                            <el-tooltip
                              effect="dark"
                              :enterable="false"
                              content="升序"
                              placement="top"
                            >
                              <i
                                :class="{'icon-A10008_triangleUp': true, 'sort-selected': item.sort == 1}"
                                @click="sort(index, cur_rowData, 1)"
                              ></i>
                            </el-tooltip>
                            <el-tooltip
                              effect="dark"
                              :enterable="false"
                              content="降序"
                              placement="bottom"
                            >
                              <i
                                :class="{'icon-A10009_triangleDown': true, 'sort-selected': item.sort == 2}"
                                @click="sort(index, cur_rowData, 2)"
                              ></i>
                            </el-tooltip>
                          </span>
                          <el-tooltip
                            effect="dark"
                            :enterable="false"
                            content="删除"
                            placement="top-start"
                          >
                            <i
                              class="opt-btn el-icon-delete"
                              @click="deleteItem(item, 'row')"
                              style="margin-left: 2px;"
                            ></i>
                          </el-tooltip>
                        </span>
                      </el-tag>
                    </draggable>
                    <div style="padding-right:10px;margin-bottom:5px;position: relative;">
                      <draggable
                        class="copy-row"
                        filter=".default-tag"
                        v-model="copyRow"
                        :options="{group:{name:'people'}}"
                      ></draggable>
                      <el-tag class="default-tag">双击或拖动右侧字段至此</el-tag>
                    </div>
                  </div>

                  <div class="split-bottom"></div>
                </div>
                <div class="table-other-wrap">
                  <el-row>
                    <el-col class="co-highlight" :span="12">
                      <span class="icon-A10598_DataOperation"></span>聚合方式
                    </el-col>
                  </el-row>
                  <div class="co-together-method">
                    <el-radio-group v-model="polymerizeType" @change="coChange">
                      <el-radio :label="1">聚合</el-radio>
                      <el-tooltip
                        effect="dark"
                        :enterable="false"
                        v-show="!isDetail"
                        content="聚合计算设置"
                        placement="top"
                      >
                        <span class="icon-A10667_Summation calc-icon" @click="openCalcOpr"></span>
                      </el-tooltip>
                      <el-radio :label="2">明细</el-radio>
                    </el-radio-group>
                  </div>
                </div>
                <div class="data-filter-wrap">
                  <el-row>
                    <el-col class="co-highlight" :span="12">
                      <span class="icon-A10184_filter"></span>数据过滤
                    </el-col>
                    <el-col :span="12" class="setting-wrap">
                      <span @click="openFilters">
                        <span class="icon-A10344_setting"></span>
                        设置
                      </span>
                    </el-col>
                  </el-row>
                  <draggable
                    v-model="cur_filterData"
                    class="query-filters"
                    @add="addToFilter"
                    filter=".default-tag"
                    handle=".header"
                    style="padding-right:10px"
                    :options="{group:{name:'people', pull: 'clone'},sort: false,disabled: false}"
                  >
                    <el-tag
                      v-for="item in cur_filterData"
                      v-bind:class="{dl_col:item.element_type != 1?true:false}"
                      v-bind:key="item.comptSort"
                    >
                      <span class="col-span">
                        <span>{{item.col_type}}</span>
                        <span :title="item.element_name">{{ item.element_name }}</span>
                      </span>

                      <span style="float:right">
                        <i class="icon-A10423_import" v-show="item.type == 'ElImport'"></i>
                        <el-tooltip
                          effect="dark"
                          :enterable="false"
                          content="删除"
                          placement="top-start"
                        >
                          <i
                            class="opt-btn el-icon-delete"
                            @click="deleteItem(item, 'filter')"
                            style="margin-left: 2px;"
                          ></i>
                        </el-tooltip>
                      </span>
                    </el-tag>
                  </draggable>
                  <div style="padding-right:10px;margin-bottom:17px;position: relative;">
                    <draggable
                      class="copy-filter"
                      v-model="copyFilter"
                      filter=".default-tag"
                      :options="{group:{name:'people'}}"
                    ></draggable>
                    <el-tag class="default-tag" style="text-align:center;">拖动右侧字段至此</el-tag>
                  </div>
                </div>
              </el-scrollbar>
              <div class="as-footer">
                <el-dropdown
                  split-button
                  type="primary"
                  size="mini"
                  @click="updataTable"
                  :class="{disabled:reportLoading}"
                >
                  更新
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item @click.native="updataTable" :disabled="reportLoading">更新当前区域</el-dropdown-item>
                    <el-dropdown-item
                      @click.native="updataAllTables"
                      :disabled="reportLoading"
                    >刷新全部区域</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
                <el-button
                  size="mini"
                  style="margin-left:10px;"
                  @click="deleteTable"
                  :disabled="reportLoading"
                >清除</el-button>
              </div>
            </el-aside>
            <el-aside v-else width="50%" class="aside-left bg-purple">
              <div class="as-title">查询字段</div>
              <el-row>
                <el-col class="co-highlight" :span="12">
                  <span></span>
                </el-col>
                <el-col :span="12" class="setting-wrap">
                  <div @click="openCondiSet">
                    <span class="icon-A10344_setting"></span>
                    <span>设置</span>
                  </div>
                </el-col>
              </el-row>
              <el-scrollbar style="height: calc(100% - 83px);">
                <div class="condi-wrap">
                  <draggable
                    v-model="cur_condiData"
                    class="query-condi"
                    @end="reSort"
                    @add="addToCondi"
                    :move="allow"
                    filter=".default-tag"
                    style="padding-right:10px"
                    :options="{group:{name:'people',pull:'clone'}}"
                    :clone="cloneDragItem"
                  >
                    <el-tag
                      v-for="item in cur_condiData"
                      v-bind:class="{dl_col:item.element_type != 1?true:false}"
                      v-bind:key="item.comptSort"
                    >
                      <span class="col-span">
                        <span>{{item.col_type}}</span>
                        <span :title="item.element_name">{{ item.element_name }}</span>
                      </span>

                      <span style="float:right">
                        <i class="icon-A10423_import" v-show="item.type == 'ElImport'"></i>
                        <el-tooltip
                          effect="dark"
                          :enterable="false"
                          content="删除"
                          placement="top-start"
                        >
                          <i
                            class="opt-btn el-icon-delete"
                            @click="deleteItem(item)"
                            style="margin-left: 2px;"
                          ></i>
                        </el-tooltip>
                      </span>
                    </el-tag>
                  </draggable>
                  <div style="padding-right:10px;margin-bottom:17px;position: relative;">
                    <draggable
                      class="copy-condi"
                      filter=".default-tag"
                      :options="{group:{name:'people'}}"
                    ></draggable>
                    <el-tag class="default-tag">双击或拖动右侧字段至此</el-tag>
                  </div>
                </div>
              </el-scrollbar>
            </el-aside>
            <el-main class="aside-main grid-content">
              <div class="as-title">数据集</div>
              <el-select
                filterable
                remote
                v-model="value"
                placeholder="请选择数据集"
                v-loadmore="loadMore"
                @change="changeDataSet"
                :remote-method="remoteMethod"
                @visible-change="resetTables"
                size="mini"
              >
                <div v-show="activedNum == 1" class="datas-opt main-content-tool">
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
                <div v-show="activedNum == 1" style="height:25px;min-width:200px"></div>
              </el-select>

              <el-input
                class="input-search"
                placeholder="输入关键字搜索"
                prefix-icon="el-icon-search"
                v-model="filterText"
                size="mini"
              ></el-input>
              <div class="r-attrs">
                <el-row class="el-row-12" :style="'height:' + (activedNum == 1? '50%': '50%')">
                  <div class="col-title">
                    <span class="icon-A10602_OpenGovernance"></span>
                    <label>维度</label>
                  </div>
                  <div class="col-wrap">
                    <div class="col-subtitle">
                      字段名称
                      <el-checkbox
                        v-show="activedNum !== 0"
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
                        <draggable
                          class="col-block"
                          :sort="false"
                          v-model="allColsData"
                          @start="todraggedItem"
                          :move="allow"
                          @end="addToField"
                          :options="{group:{name:'people',pull:'clone'}}"
                          :clone="cloneDragItem"
                          filter=".date-tag"
                        >
                         <div
                           class="col-item"
                           v-bind:class="{ selected: (activedNum === 0 && rowChecked && item.selected)||(activedNum === 1 && item.tbSelected && ((cur_rowData.concat(cur_colData)).length > 0)) ,'date-tag': item.col_type === 'dat' &&  !item.isNewCol && item.formatLevel != undefined}"
                           v-for="(item,index) in allColsData"
                           v-if="item.element_type == 1"
                           v-bind:key="item.id+'_'+index"
                           @dblclick="toOption(index,$event,'row')"
                           :index="index"
                           v-show="dateOpenList[item.element_id] == undefined || !(!dateOpenList[item.element_id] && item.isNewCol)"
                         >
                           <el-tooltip
                             placement="top"
                             :content="item.element_name"
                             :open-delay="1000"
                           >
                             <div class="item-wrap">
                               <span v-if="!item.isNewCol">{{item.col_type}}</span>
                               <span v-else></span>
                               <a
                                 href="javascript:;"
                                 @click="isOpen(item)"
                                 v-show="item.col_type === 'dat' && !item.isNewCol && item.formatLevel != undefined"
                               >
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
                            v-bind:class="{ selected: (activedNum == 0 && rowChecked && item.selected)||(activedNum == 1 && item.tbSelected && ((cur_rowData.concat(cur_colData)).length > 0)) ,'date-tag': activedNum === 0 && item.col_type == 'dat' &&  !item.isNewCol && item.formatLevel != undefined}"
                            v-for="(item,index) in allColsData"
                            v-if="item.element_type == 1 && ((activedNum == 1 && !item.isNewCol) || activedNum == 0)"
                            :key="`${item.id}_${index}_${activedNum}`"
                            @dblclick="toOption(index,$event,'row')"
                            :index="index"
                            v-show="dateOpenList[item.element_id] == undefined || !(!dateOpenList[item.element_id] && item.isNewCol)"
                          >
                            <el-tooltip
                              placement="left"
                              :content="item.element_name"
                              :open-delay=1000
                            >
                              <div class="item-wrap">
                                <span v-if="!item.isNewCol">{{item.col_type}}</span>
                                <span v-else></span>
                                <a
                                  href="javascript:;"
                                  @click="isOpen(item)"
                                  v-show="item.col_type == 'dat' && !item.isNewCol && item.formatLevel != undefined"
                                >
                                  <span
                                    v-if="activedNum === 0"
                                    v-bind:class="(dateOpenList[item.element_id] == undefined || dateOpenList[item.element_id]) ? 'icon-A10009_triangleDown': 'icon-A10011_triangleRight'"
                                    style="color:#afc0d0;width:10px;margin-left: -10px;"
                                  ></span>
                                </a>
                                {{ item.element_name }}
                              </div>
                            </el-tooltip>
                          </div> -->
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
                      <i  v-show="showAppCal==='1' && activedNum !== 0" class="compute-icon icon-A10072_add" @click="computedOpen"></i>
                      <el-checkbox
                        v-show="activedNum !== 0"
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
                        <draggable
                          class="col-block col-dl"
                          :sort="false"
                          v-model="allColsData"
                          @start="todraggedItem"
                          @end="addToField"
                          :options="{group:{name:'people',pull:'clone',put:false}}"
                          :clone="cloneDragItem"
                        >
                          <div
                            class="col-item"
                            v-bind:class="{ selected: (activedNum == 0 && colChecked && item.selected)||(activedNum == 1&&item.tbSelected && ((cur_rowData.concat(cur_colData)).length > 0)) }"
                            v-for="(item,index) in allColsData"
                            v-if="item.element_type != 1"
                            v-bind:key="item.id"
                            @dblclick="toOption(index,$event,'col')"
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
              </div>
            </el-main>
          </el-container>
        </el-tab-pane>
        <el-tab-pane label="设置" name="style" class="grid-content">
          <div v-show="activedNum == 1" class="senior">
            <el-row>
              <div class="as-title">{{areaInfo.area_name||'区域：未定义'}}</div>
            </el-row>
            <el-row>
              <el-col class="co-highlight" :span="24">
                <span class="icon-A10344_setting"></span>展示设置
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24" class="senior-wrap">
                <el-checkbox label="3" v-model="hideTitle" @change="toUpdate">不显示标题字段名</el-checkbox>
                <el-checkbox label="4" v-model="hideDim" @change="toggleHidden">隐藏指定维度</el-checkbox>
                <el-select
                  size="mini"
                  style="width:50%;margin-bottom: 10px;"
                  class="hiddenDims"
                  v-model="hiddenDims"
                  multiple
                  collapse-tags
                  v-show="hideDim"
                  placeholder="请选择"
                  @change="toUpdate"
                >
                  <el-option
                    v-for="item in hiddenDimFields"
                    :key="item.element_name"
                    :label="item.nick_name||item.element_name"
                    :value="item.element_name"
                  ></el-option>
                </el-select>

                <el-checkbox label="5" v-if="!isDetail" v-model="autoMerge" @change="toUpdate">自动合并维度相同值</el-checkbox>
                <el-checkbox label="7" v-if="dataBorder!=='0'" v-model="needBorder" @change="toUpdate">数据边框</el-checkbox>
                <el-checkbox label="4" v-if="nullAutoFill!=='0'" v-model="autofill.show" @change="toggleFill">度量空值时自动填充</el-checkbox>
                <el-select
                  size="mini"
                  style="width:30%;margin:0 10px 10px 0;"
                  class="hiddenDims"
                  v-model="autofill.val"
                  v-show="autofill.show"
                  placeholder="请选择度量"
                  @change="autoFillChange"
                >
                  <el-option
                    v-for="item in autofillFields"
                    :key="item.value"
                    :label="item.label"
                    :value="item.label"
                  ></el-option>
                </el-select>
                <el-select
                  size="mini"
                  style="width:60%;margin-bottom: 10px;"
                  class="hiddenDims"
                  multiple
                  collapse-tags
                  v-model="autofill.col"
                  v-show="autofill.show"
                  placeholder="请选择"
                  @change="toUpdate"
                >
                  <el-option
                    v-for="item in cur_countData"
                    :key="item.id"
                    v-if="item.element_type!=1"
                    :label="item.nick_name||item.element_name"
                    :value="item.element_name"
                  ></el-option>
                </el-select>
                <el-checkbox label="8" v-model="rename.show" @change="toUpdate">重命名</el-checkbox>
                <el-select
                  size="mini"
                  style="width:48%;margin:0 10px 10px 0;"
                  class="hiddenDims"
                  v-model="rename.field"
                  v-show="rename.show"
                  placeholder="请选择字段"
                  @change="renameChange"
                >
                  <el-option
                    v-for="item in cur_countData"
                    :key="item.element_id"
                    :label="item.element_name"
                    :value="item.element_id"
                  ></el-option>
                </el-select>
                <el-input
                  style="width:48%"
                  class="input-search"
                  placeholder="请输入别名"
                  v-model="rename.text"
                  v-show="rename.show"
                  @blur="renameCheck"
                  size="mini"
                ></el-input>
              </el-col>
            </el-row>
            <el-row v-show="ifCount">
              <el-col class="co-highlight" :span="24">
                <span class="el-icon-edit"></span>数据计算
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24" class="senior-wrap" v-show="ifCount">
                <el-checkbox
                  label="6"
                  v-model="selectCount"
                  @change="countChanage"
                  style="float:left; margin-right:30px;"
                >小计</el-checkbox>

                 <el-checkbox
                  label="6"
                  v-show="!isDetail"
                  v-model="isTotalCount"
                  @change="countChanage"
                  style
                >合计</el-checkbox>
                <span class="total-count" v-show="showCountOption">
                  <el-row>
                    <el-col :span="12">
                      <el-select
                        size="mini"
                        v-model="countDataField"
                        collapse-tags
                        placeholder="请选择维度"
                        @change="toUpdate"
                      >
                        <el-option
                          v-for="item in countData"
                          :key="item.element_name"
                          :label="item.nick_name||item.element_name"
                          :value="item.element_name"
                        ></el-option>
                      </el-select>
                    </el-col>
                    <el-col
                      v-show="!!countDataField"
                      :span="2"
                      style="text-align: right; padding-top: 5px;"
                    >
                      <el-tooltip
                        effect="dark"
                        :enterable="false"
                        content="设置"
                        placement="top-start"
                      >
                        <span>
                          <span
                            class="icon-A10344_setting"
                            style="cursor: pointer;"
                            @click="openTotalCount"
                            title="设置"
                          ></span>
                          <span style="cursor: pointer;" @click="openTotalCount" title="设置"></span>
                        </span>
                      </el-tooltip>
                    </el-col>
                  </el-row>
                </span>
              </el-col>
            </el-row>
          </div>
          <div v-show="activedNum == 0&&showSms==1" class="senior">
            <el-row>
              <div class="co-highlight">
                <span class="icon-A10165_upload"></span>
                导出设置
              </div>
              <el-checkbox class="cbox" v-model="edcuiCompts[0].needSms">导出进行短信验证</el-checkbox>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-container>
    <el-dialog
      title="批量设置"
      :visible.sync="batchDialogVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="500px"
      height="100%"
      class="batch-dialog"
      size="mini"
      :before-close="handleClose"
    >
      <div style="height:220px;overflow:hidden;">
        <el-scrollbar style="height: 100%;overflow:hidden;" v-if="batchDialogVisible">
          <el-form ref="dialog-form" label-width="170px" size="mini">
            <el-form-item
              :label="item.label+':'"
              :title="item.label"
              v-for="item in cur_countData"
              v-if="item.element_type == 2"
              :key="item.id"
            >
              <el-select v-model="item.calc" placeholder="请选择" size="mini">
                <el-option
                  v-if="item.is_calcul=='2'"
                  v-for="calc in calcData2"
                  :key="calc.value"
                  :label="calc.label"
                  :value="calc.value"
                ></el-option>
                <el-option
                  v-else
                  v-for="calc in calcData"
                  :key="calc.value"
                  :label="calc.label"
                  :value="calc.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-scrollbar>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelSet" size="mini">取 消</el-button>
        <el-button type="primary" @click="batchSettings" size="mini">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="数据过滤"
      :visible.sync="datafilterDialogVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="540px"
      height="200px"
      class="datafilter-dialog"
      :before-close="closeFilterSet"
      size="mini"
    >
      <Datafilter v-if="datafilterDialogVisible"></Datafilter>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="closeFilterSet">取 消</el-button>
        <el-button type="primary" @click="sureDataFilter" size="mini">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      size="mini"
      title="条件设置"
      :visible.sync="condiSetVisible"
      :before-close="cancelCondiSet"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <CondiSet v-if="condiSetVisible"></CondiSet>
      <span slot="footer" class="dialog-footer">
        <div>
          <el-button size="mini" @click="cancelCondiSet">取 消</el-button>
          <el-button
            size="mini"
            v-show="activeName2 == 'first'"
            type="primary"
            @click="gotoNext"
          >下一步</el-button>
          <el-button size="mini" type="primary" @click="conditionSet">确 定</el-button>
        </div>
      </span>
    </el-dialog>
    <el-dialog
      :title="countTitle"
      :visible.sync="totalCountIsShow"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="cancelSetTotalCount"
      width="480px"
      height="100%"
      class="datafilter-dialog"
      size="mini"
    >
      <el-form ref="form" class="form" label-width="130px">
        <el-form-item :label="countTitle+'维度：'">
          <el-select v-model="countDataField" placeholder="请选择" size="mini" :disabled="true">
            <el-option
              v-for="cd in countData"
              :key="cd.element_name"
              :label="cd.nick_name || cd.element_name"
              :value="cd.element_name"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="countTitle+'位置：'">
          <el-select v-model="subStyleList.align" placeholder="请选择" size="mini">
            <el-option v-for="cd in alignData" :key="cd.value" :label="cd.label" :value="cd.value"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item :label="countTitle+'加粗：'">
          <el-select v-model="subStyleList.weight" placeholder="请选择" size="mini">
            <el-option v-for="cd in weightData" :key="cd.value" :label="cd.label" :value="cd.value"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <!-- <el-row style="margin-top: 10px;">
        <el-col :span="24" style="text-align: center;">
          <el-checkbox label="3" v-model="isTotalCount">合计：增加一行合计，将所有小计相加</el-checkbox>
        </el-col>
      </el-row> -->
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancelSetTotalCount">取 消</el-button>
        <el-button type="primary" @click="closeTotalCount" size="mini">确 定</el-button>
      </span>
    </el-dialog>
    <DrillFilter
      v-if="drillShowDialog"
      :showDialog="drillShowDialog"
      :drillData="cur_drillData"
      :colsData="allColsData"
      @updateShowState="drillShowDialog=false"
    ></DrillFilter>
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
    <SqlFormatterDialog></SqlFormatterDialog>
  </div>
</template>
<script>
import ComputedDesign from "./ComputedDesign.vue";
import draggable from "vuedraggable";
import { mapState, mapGetters, mapMutations, mapActions } from "vuex";
import CondiSet from "./ReportCondiSet.vue";
import Datafilter from "./DateFilterReport.vue";
import DrillFilter from "./DrillFilterDialog.vue";
import { HST } from "../../utils/HandsTable.js";
import { objDeepCopy, fieldMatch, dealDataSetInfo, concatComputedData, initFuncDateParam, mapDataSetInfoKey } from "../../utils/comonFunc.js";
import getUUID from "../../utils/UUID.js";
import SqlFormatterDialog from "./SqlFormatterDialog.vue";
export default {
  components: {
    draggable,
    Datafilter,
    CondiSet,
    DrillFilter,
    ComputedDesign,
    SqlFormatterDialog //区域sql
  },
  name: "reportAttrSet",
  data() {
    return {
      datasetDetail: {}, //当前数据集详情
      showComputeDialog: false,
      hideDim: false,
      selectCount: false, //是否小计
      rowShow: true,
      filterText1: "",
      filterText: "",
      value: "",
      oldValue: "",
      countDataField: "",
      valueIsChange: false,
      initAfId: "",
      wdCheckAll: false,
      dlCheckAll: false,
      condiWdCheckAll: false,
      condiDlCheckAll: false,
      tabWdCheckAll: false,
      tabDlCheckAll: false,
      rowChecked: false,
      colChecked: false,
      dialogTableVisible: false,
      batchDialogVisible: false,
      datafilterDialogVisible: false,
      condiSetVisible: false,
      autoMerge: false, // 自动合并维度相同值
      isDetail: false,
      activeName: "attr",
      draggedItem: [],
      allData: [],
      hiddenDims: [],
      isTotalCount: false, // 是否添加合计
      totalCountIsShow: false,
      start: 1,
      wdColsLen: 0,
      dlColsLen: 0,
      wdtableCols: [],
      dltableCols: [],
      cur_filterData: [],
      cur_filterDataBak: [],
      cur_countData: [],
      cur_wdCondiData: [],
      cur_dlCondiData: [],
      cur_condiData: [], //条件参数
      cur_rowData: [], //当前行数据
      cur_colData: [], //当前列数据
      cur_drillData: {}, //当前钻取数据
      hiddenDimFields: [], //隐藏维度字段
      countData: [], //小计合计维度字段
      subDrillCopy: [],
      copyCol: [],
      copyRow: [],
      copyDragg: [],
      copyFilter: [],
      condiOpt: "",
      polymerizeType: 1,
      checkList: [],
      hideTitle: false,
      onesLoad: true,
      relatives: {},
      dimensions: {},
      beforeSetData: [], // 弹窗设置前保存一份数据
      calcData: [
        {
          value: 2,
          label: "SUM"
        },
        {
          value: 1,
          label: "COUNT"
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
        },
        {
          value: 6,
          label: "COUNT DISTINCT"
        }
      ],
      calcData2: [
        {
          value: 0,
          label: '无'
        }
      ],
      areaName: "区域：未定义", //当前区域名称
      areaDataSet: [], //所有区域包含的数据集id
      areaTablesData: [], //所有区域包含的数据集
      condiAllData: [], //条件数据集的字段
      alignData: [
        { value: "center", label: "居中" },
        { value: "left", label: "左对齐" },
        { value: "right", label: "右对齐" }
      ], //小计位置
      weightData: [
        { value: "bold", label: "加粗" },
        { value: "normal", label: "常规" }
      ], //小计加粗
      subStyleList: {
        weight: "bold",
        align: "center"
      },
      defaultStyle: {
        weight: "bold",
        align: "center"
      },
      curCell: "",
      needBorder: false,
      drillShowDialog: false,
      origCondiData: [],
      fieldTypeList: {}, //数据库字段类型
      formatList: [], //日期源格式
      dateOpenList: {}, //用来记录新增加的日期分层字段展开还是收缩
      allowEle: { condi: "", filter: "" },
      //度量字段空值展示
      autofill: {
        show: false,
        val: 0,
        col: [],
        colList: []
      },
      autofillFields: [
        {
          value: 0,
          label: 0
        },
        {
          value: 1,
          label: "/"
        },
        {
          value: 2,
          label: "-"
        }
      ],
      countTitle: '',
      updateTime: null,
      rename:{
        show:false,
        field:'',
        text:''
      }
    };
  },
  watch: {
    filterText(val) {
      this.filterNode(val);
    },
    cur_condiData(vals) {
      let target = this.edcuiCompts[0].comptAttrs.fieldList;
      try {
        target.splice(2, target.length - 1);
        let _tl = vals.length;
        for (let j = 0; j < _tl; j++) {
          vals[j].datasetCheckAll = false;
          vals[j].isIndeterminate = false;
          let _item = {
            comptAttrs: vals[j], //{ ...vals[j] },
            type: vals[j].type,
            comptSort: this.comptNum
          };
          this.upComptNum("add");
          this.edcuiCompts[0].afId = vals[j].af_id;
          target.push(_item);
        }
      } catch (e) {}
      this.upComptNum("add");
      this.condiAllData = [...this.allColsData];
    },
    condiData(val) {
      if (val.length === 0) {
        this.cur_condiData = [];
      }
    },
    cur_rowData(vals) {
      let tmpData = [...vals, ...this.cur_colData];
      for (let i = 0; i < vals.length; i++) {
        let val = vals[i];
        val.position = 1;
        let unique = 0;
        for (let j = 0; j < tmpData.length; j++) {
          let val2 = tmpData[j];
          if (val.id == val2.id) {
            unique++;
          }
          if (unique == 2) {
            tmpData.splice(j, 1);
            i = i == 0 ? 0 : i - 1;
            j = j == 0 ? 0 : j - 1;
            unique = 0;
          }
        }
      }
      this.cur_countData = tmpData;
    },
    cur_colData(vals) {
      let tmpData = [...vals, ...this.cur_rowData];
      for (let i = 0; i < vals.length; i++) {
        let val = vals[i];
        val.position = 2;
        let unique = 0;
        for (let j = 0; j < tmpData.length; j++) {
          let val2 = tmpData[j];
          if (val.id == val2.id) {
            unique++;
          }
          if (unique == 2) {
            tmpData.splice(j, 1);
            i = i == 0 ? 0 : i - 1;
            j = j == 0 ? 0 : j - 1;
            unique = 0;
          }
        }
      }
      this.cur_countData = tmpData;
    },
    cur_countData(vals) {
      let arr = [];
      let wdArr = [];
      let arr2 = [];
      let fillArr = [];
      for (let i = 0, len = vals.length; i < len; i++) {
        if (vals[i].element_type == 1) {
          arr.push(vals[i]);
        } else {
          wdArr.push(vals[i]);
        }
      }
      this.countData = JSON.parse(JSON.stringify(arr));
      this.hiddenDimFields = JSON.parse(JSON.stringify(arr));
      this.hiddenDims.forEach(hdDim => {
        arr.forEach(ar => {
          if (ar.element_name == hdDim) {
            arr2.push(hdDim);
          }
        });
      });
      (this.autofill.col || []).forEach(item => {
        wdArr.forEach(ar => {
          if (ar.element_name == item) {
            fillArr.push(item);
          }
        });
      });
      this.hiddenDims = JSON.parse(JSON.stringify(arr2));
      this.autofill.col = [...fillArr];
      const hasCountDataField = this.countData.some(
        cd => cd.element_type == 1 && cd.element_name == this.countDataField
      );
      if (!hasCountDataField) {
        this.countDataField = "";
        this.selectCount = false;
        this.isTotalCount = false;
      }
    },
    tableCols(vals) {
      if (vals.length == 0) {
        this.cur_rowData = [];
        this.cur_rowDataBak = [];
        this.cur_colData = [];
        this.cur_colDataBak = [];
        this.dlCheckAll = false;
        this.wdCheckAll = false;
      }
    },
    updataSign(val) {
      const sheetInfo = HST.searchCurSheet();
      if (
        this.areaName === this.areaInfo.area_name &&
        this.areaInfo.sheet_index === sheetInfo.sheetIndex &&
        this.areaInfo.area_name != undefined
      ) {
        return;
      }
      if (this.asideSign && !!this.areaInfo.area_name) {
        return;
      }
      this.resetReportLoading(true);
      this.areaName = this.areaInfo.area_name;
      if (!!this.areaInfo.area_id) {
        const index = sheetInfo.index,
          sub_index = HST.searchCurArea(index),
          areaInfo = this.edcuiCompts[1].comptAttrs.tableList[index].area_info[sub_index],
          td = [
            ...objDeepCopy(areaInfo.af_col),
            ...objDeepCopy(areaInfo.af_row)
          ];
        let cd = []; //条件
        // this.areaName = areaInfo.area_name || areaInfo.cur_areaName
        this.polymerizeType = areaInfo.query_type;
        this.cur_drillData = [...(areaInfo.drillData || [])];
        this.countDataField = areaInfo.countDataField;
        this.isTotalCount =
          typeof areaInfo.needTotal == "undefined" ? false : areaInfo.needTotal;
        this.autoMerge =
          typeof areaInfo.autoMerge == "undefined" ? false : areaInfo.autoMerge;
        this.selectCount =
          typeof areaInfo.selectCount == "undefined"
            ? false
            : areaInfo.selectCount;
        this.subStyleList = { ...this.defaultStyle, ...areaInfo.subStyleList };
        if (this.value === areaInfo.af_Id) {
          let cur_td = [...this.cur_colData, ...this.cur_rowData];
          if (JSON.stringify(td) == JSON.stringify(cur_td)) {
            //过滤条件回填
            this.cur_filterData = [
              ...this.edcuiCompts[1].comptAttrs.tableList[index].area_info[
                sub_index
              ].filterData
            ];
            let reset_fdata = { data: [...this.cur_filterData], type: "reset" };
            this.upFilterData(reset_fdata);
            //高级属性回填
            this.hideTitle = !areaInfo.needTitle;
            this.hideDim = areaInfo.hideDim;
            this.autofill = {
              ...(areaInfo.autofill || { show: false, val: 0, col: [] })
            };
            this.hiddenDims = areaInfo.hiddenDimList;
            this.needBorder = areaInfo.needBorder;
            this.rename.show = areaInfo.rename || false;
            this.rename.field = '';
            this.rename.text = '';
            let tempData = [...this.cur_rowData, ...this.cur_colData];
            this.upAllCols(this.uniqueCur(tempData, [...this.allData]));
            this.resetReportLoading(false);
            return false;
          }
        }
        this.value = areaInfo.af_Id;
        const valueKey = (this.allTablesData || []).filter( data => data.datasetId === this.value );
        if (valueKey.length === 0) {
          this.getAllTablesData(this.value);
        }
        this.getColsData(this.value, cd, td);
        //过滤条件回填
        this.cur_filterData = [
          ...this.edcuiCompts[1].comptAttrs.tableList[index].area_info[
            sub_index
          ].filterData
        ];
        let reset_data = { data: [...this.cur_filterData], type: "reset" };
        this.upFilterData(reset_data);
        //高级属性回填
        this.hideTitle = !areaInfo.needTitle;
        this.hideDim = areaInfo.hideDim;
        this.hiddenDims = areaInfo.hiddenDimList;
        this.needBorder = areaInfo.needBorder;
        this.rename.show = areaInfo.rename || false;
        this.rename.field = '';
        this.rename.text = '';
        this.autofill = {
          ...(areaInfo.autofill || { show: false, val: 0, col: [] })
        };
      } else {
        this.hideTitle = false;
        this.hideDim = false;
        this.needBorder = false;
        this.hiddenDims = [];
        this.polymerizeType = 1;
        this.wdCheckAll = false;
        this.dlCheckAll = false;
        this.cur_filterData = [];
        this.cur_drillData = [];
        this.selectCount = false;
        this.countDataField = "";
        this.isTotalCount = false;
        this.autoMerge = false;
        this.rename.show = false;
        this.rename.field = '';
        this.rename.text = '';
        this.subStyleList = { ...this.defaultStyle };
        this.autofill = {
          show: false,
          val: 0,
          col: [],
          colList: []
        };
        // 空白区域清空组件计算字段
        for(let i=0;i<this.allColsData.length;i++) {
          if(this.allColsData[i].from_compt){
            this.allColsData.splice(i,1);
          }
        }
        let allData = [...this.allColsData];
        allData.forEach(element => {
          delete element.tbSelected;
          delete element.sort;
        });
        this.resetReportLoading(false);
      }
    },
    activedNum(arg) {
      if (arg == 0) {
        this.areaName = "";
        this.activeName = "attr";
        let tableList = this.edcuiCompts[1].comptAttrs.tableList;
        this.areaDataSet = [];
        tableList.forEach(list => {
          list.area_info.forEach(info => {
            if (!!info.af_Id && this.areaDataSet.indexOf(info.af_Id) == -1) {
              this.areaDataSet.push(info.af_Id);
            }
          });
        });
        let flag = 0,
          condiAfId = "";
        let datasetsCurs = this.areaDataSet;
        let datasetsTableCurs = this.areaTablesData;
        let curAreaTables = [];
        for (let i = 0; i < datasetsCurs.length; i++) {
          for (let j = 0; j < datasetsTableCurs.length; j++) {
            if (datasetsTableCurs[j].datasetId == datasetsCurs[i]) {
              flag++;
              curAreaTables.push(datasetsTableCurs[j]);
              if (this.edcuiCompts[0].afId == "") {
                condiAfId = datasetsCurs[i];
              }
            }
          }
        }
        if (curAreaTables.length === datasetsCurs.length) {
          this.areaTablesData = curAreaTables;
        }
        if (
          (this.areaTablesData.length === 0 && this.areaDataSet.length > 0) ||
          flag != datasetsCurs.length
        ) {
          this.getAllTablesData(this.areaDataSet);
        } else {
          const tempData = this.allTablesData;
          this.resetTableData(this.areaTablesData);
          this.areaTablesData = tempData;
          let val = this.value;
          if ( this.areaTablesData.filter(data => data.datasetId == this.value).length == 0 ) {
            val = condiAfId;
          }
          let result = this.areaTablesData.find(item => item.datasetId == val);
          let datasetName = result ? result.datasetName : "";
          if (datasetName === "") {
            this.value = "";
            this.upAllCols([]);
          }
          this.upDatasetName(datasetName);
        }
        let condiData = [...this.edcuiCompts[0].comptAttrs.fieldList],
          condiInfo = [];
        try {
          condiData.splice(0, 2);
          let curData = [];
          let len = condiData.length;
          for (let i = 0; i < len; i++) {
            let val = condiData[i];
            curData.push(val.comptAttrs);
          }
          condiInfo = curData;
        } catch (e) {}

        if (condiInfo.length > 0 && this.cur_condiData.length === 0) {
          this.value = this.edcuiCompts[0].afId;
          let td = [];
          this.getColsData(this.value, condiInfo, td);
        } else {
          if (condiInfo.length !== 0) {
            this.value = this.edcuiCompts[0].afId;
            this.upAllCols([...this.condiAllData]);
          } else {
            if (condiAfId === "") {
              condiAfId = this.areaDataSet[0];
            }
            if (this.areaDataSet.filter(val => val == this.value).length == 0) {
              this.value = condiAfId;
              var reset_data = { data: [], type: "reset" };
              this.upTableCols(reset_data);
              this.getColsData(this.value);
            }
          }
        }
      } else {
        this.activeName = "attr";
        const tempData = this.allTablesData;
        this.resetTableData(this.areaTablesData);
        this.areaTablesData = tempData;
        this.resetUpdataSign();
      }
    },
    polymerizeType(val) {
      if (val === 1) {
        this.rowShow = true;
        this.isDetail = false;
      } else {
        this.rowShow = false;
        this.isDetail = true;
      }
    },
    value(val, oldVal) {
      this.oldValue = oldVal;
      let result = this.allTablesData.find(item => item.datasetId == val);
      let datasetName = result ? result.af_name : "";
      this.upDatasetName(datasetName);
    },
    asideSign(bool) {
      if (bool) {
        this.curCell = this.hot.getSelected();
      } else {
        let cell = this.curCell;
        this.hot.selectCell(cell[0][0], cell[0][1], cell[0][2], cell[0][3]);
      }
    },
    "areaInfo.area_name": {
      deep: true,
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal === undefined) {
          this.activeName = "attr";
          this.clearGfx();
        }
      }
    },
    loadingEnd(val) {
      if (this.reportLoading && val) {
        if (this.showFormula === '0') {
          HST.isMerge = false;
          this.resetReportLoading(false);
          this.upLoadingEnd(false);
          this.hot.render();
        } else {
          clearInterval(HST.rendered);
          HST.rendered = setTimeout(() => {
            this.resetReportLoading(false);
            this.upLoadingEnd(false);
            if (HST.isMerge) {
              HST.isMerge = false;
              this.hot.getPlugin("formulas").recalculateFull();
            }
          }, 500);
        }
      }
    },
    areaChangeFlag(param) {
      if (
        ["updateArea", "dropArea"].indexOf(param.type) > -1 &&
        Object.keys(param).length > 0
      ) {
        const { index, sub_index, areaInfo } = param;
        let areaList = this.edcuiCompts[1].comptAttrs.tableList[index]
          .area_info;
        if (param.type === "dropArea") {
          areaList.splice(sub_index, 0, areaInfo);
        }
        this.hot.selectCell(...this.hot.getSelected()[0]);
        this.resetReportLoading(true);
        this.updata(areaInfo, sub_index, true);
      }
    }
  },
  computed: {
    ...mapState({
      hot: state => state.ReportMgt.hot,
      activedNum: state => state.ReportMgt.activedNum,
      edcuiCompts: state => state.ReportMgt.edcuiCompts,
      sheetIndex: state => state.ReportMgt.sheetIndex,
      tempData: state => state.ReportMgt.tempData,
      refreshNum: state => state.ReportMgt.refreshNum,
      tempRefreshNum: state => state.ReportMgt.tempRefreshNum,
      asideSign: state => state.ReportMgt.asideSign,
      loadingEnd: state => state.ReportMgt.loadingEnd,
      reportLoading: state => state.ReportMgt.reportLoading,
      areaChangeFlag: state => state.ReportMgt.areaChangeFlag,
      historyData: state => state.ReportMgt.historyData,
      condiData: state => state.ReportAttr.condiData,
      datasetName: state => state.ReportAttr.datasetName,
      activeName2: state => state.ReportAttr.activeName2,
      tableCols: state => state.ReportAttr.tableCols,
      filterData: state => state.ReportAttr.filterData,
      allColsData: state => state.ReportAttr.allColsData,
      allTablesData: state => state.ReportAttr.allTablesData,
      datasets: state => state.ReportAttr.datasets,
      upActivedNum: state => state.ReportAttr.upActivedNum,
      areaInfo: state => state.ReportAttr.areaInfo,
      pageCache: state => state.HomeBody.pageCache,
      dgwMsUrl: state => state.dgwMsUrl,
      datasetUrl: state => state.datasetUrl,
      defaultSystemId: state => state.defaultSystemId,
      dimList: state => state.QueryTable.dimList,
      msuList: state => state.QueryTable.msuList,
      comptNum: state => state.ReportAttr.comptNum,
      updataSign: state => state.ReportAttr.updataSign,
      showAppCal: state => state.commonProperties.showAppCal,
      needSms: state => state.commonProperties.needSms,
      showSms: state => state.commonProperties.showSms,
      dataBorder: state => state.commonProperties.report.dataBorder,
      nullAutoFill: state => state.commonProperties.report.nullAutoFill,
      showFormula: state => state.commonProperties.report.formula
    }),
    ...mapGetters({
      isQuery: "QueryTable/isQuery"
    }),
    ifCount() {
      let result = false;
      if(!this.isDetail){
        for(let i=0; i<this.cur_countData.length; i++) {
          if(this.cur_countData[i].element_type === 1) {
            result = true;
            break;
          }
        }
      }
      return result;
    },
    showCountOption(){
      let result = false;
      let countField = this.countDataField;
      if(countField === ''){
        countField = this.countData.length>0 ? this.countData[0].element_name : '';
      }
      if(this.selectCount && !this.isTotalCount) {  //只小计
        result = true;
        this.countDataField = countField;
        this.countTitle = '小计';
      } else if(!this.selectCount && this.isTotalCount) {  //只合计
        this.countDataField = countField;
        let row = this.cur_rowData.filter(val=>{
          return val.element_type === 1;
        })
        let col = this.cur_colData.filter(val=>{
          return val.element_type === 1;
        })
        if(row.length>0 && col.length>0) {
          result = true;
        }
        this.countTitle = '合计';
      } else if(!this.selectCount && !this.isTotalCount) {  //都没有
        // result = false;
      } else {  //都有
        result = true;
        this.countDataField = countField;
        this.countTitle = '小计与合计';
      }
      return result;
    },
    groupFunc() {
      let flag = false;
      let data = this.cur_countData;
      for(let i=0;i<data.length;i++){
        if(data[i].is_calcul=='2'){
          flag = true;
          break;
        }
      }
      return flag;
    },
    activedArea() {
			let index = HST.searchCurSheet().index;
			let sub_index = HST.searchCurArea(index);
      let areaInfo = this.edcuiCompts[1].comptAttrs.tableList[index].area_info;
			return areaInfo[sub_index] || {};
		}
  },
  mounted() {
    // this.origCondiData = objDeepCopy(this.edcuiCompts[0].comptAttrs.fieldList)
    if (
      this.edcuiCompts[0].needSms === "" ||
      this.edcuiCompts[0].needSms === undefined
    ) {
      this.edcuiCompts[0].needSms = this.needSms;
    }
  },
  activated() {
    this.start = 1;
    let reset_data = { data: [], type: "reset" };
    this.upFilterData(reset_data);
    this.resetTableData([]);
    this.getAllTablesData();
  },
  methods: {
    dropCharts() {
      let index = HST.searchCurSheet().index;
      let charts = this.edcuiCompts[1].comptAttrs.tableList[index].chartData || [];
      charts.splice(0,charts.length);
    },
    renameChange(id) {
      // let list = this.activedArea.af_col.concat(this.activedArea.af_row);
      let list = this.cur_countData;
      let [item] = list.filter(val=>{
        return val.element_id === id;
      })
      let text = '';
      if(item){
        text = (item.nick_name && item.nick_name !== item.element_name) ? item.nick_name : '';
      }
      this.rename.text = text;
    },
    renameCheck() {
      let text = this.rename.text;
      // let list = this.activedArea.af_col.concat(this.activedArea.af_row);
      let list = this.cur_countData;
      let target = {};
      let flag = true;
      for(let item of list){
        if(text !== '' && item.nick_name === text && item.element_id !== this.rename.field) {
          this.$message.warning('重命名字段名称不能重复');
          flag = false;
        }
        if(item.element_id === this.rename.field) {
          target = item;
        }
      }
      if(flag) {
        if(text === ''){
          text = target.element_name;
        }
        target.nick_name = text;
        let rawList = this.cur_colData.concat(this.cur_rowData);
        let areaField = this.activedArea.af_col.concat(this.activedArea.af_row);
        for(let item of rawList) {
          if(target.element_id === item.element_id){
            item.nick_name = text;
            break;
          }
        }
        for(let item of areaField) {
          if(target.element_id === item.element_id){
            item.nick_name = text;
            break;
          }
        }
        for(let item of this.hiddenDimFields) {
          if(target.element_id === item.element_id){
            item.nick_name = text;
            break;
          }
        }
        for(let item of this.countData) {
          if(target.element_id === item.element_id){
            item.nick_name = text;
            break;
          }
        }
        for(let item of this.cur_drillData) {
          if(target.element_id === item.element_id){
            item.nick_name = text;
            break;
          }
        }
        this.toUpdate();
      } else {
        this.rename.text = '';
      }
    },
    toUpdate() {
      if (document.querySelector("td.current") === null) {  //未选中单元格
        this.$message.warning('未选中单元格');
        return;
      }
      clearTimeout(this.updateTime);
      this.updateTime = setTimeout(() => {
        this.updataTable();
      }, 500);
    },
    computedOpen() {
      if(this.activedArea.area_id) {
        this.showComputeDialog = true;
      } else {
        this.$message.warning('请在数据区域中新增计算字段');
      }
    },
    clearGfx() {
      for(let i=0;i<this.allColsData.length;i++) {
        let item = this.allColsData[i];
        if(item.from_compt && item.is_calcul=='2') {
          this.allColsData.splice(i,1);
        }
      }
      this.allData = [...this.allColsData];
    },
    deleteComputed(id) {
      let sign = false;
      let list = this.activedArea.computedData || [];
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
            this.allData = [...this.allColsData];
            break;
          }
        }
        for(let i=0;i<this.cur_rowData.length;i++) {
          if(this.cur_rowData[i].element_id == id){
            this.cur_rowData.splice(i,1);
            break;
          }
        }
        for(let i=0;i<this.cur_colData.length;i++) {
          if(this.cur_colData[i].element_id == id){
            this.cur_colData.splice(i,1);
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
      if (result[0].is_calcul == '2') {
        result[0].calc = 0;
      } else {
        result[0].calc = 2;
      }
      let computedData = this.activedArea.computedData;
      this.allColsData.push(result[0])
      this.allData.push(result[0])
      if(computedData && computedData.length>0) {
        computedData.push(result[0]);
      } else {
        if(this.activedArea.area_id) {
          this.activedArea.computedData = result;
        }
      }
      this.showComputeDialog = false;
    },
    addComputedField() {
      var ComputedDesign = this.$refs.ComputedDesign;
      ComputedDesign.saveComputedField();
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
    isOpen(item) {
      //判断新增加的日期层级字段是展开还是收缩
      let isOpen = false;
      if (this.dateOpenList[item.element_id] != undefined) {
        isOpen = !this.dateOpenList[item.element_id];
      }
      this.$set(this.dateOpenList, item.element_id, isOpen);
    },
    openTotalCount() {
      this.totalCountIsShow = true;
      this.isTotalCountBak = this.isTotalCount;
    },
    cancelSetTotalCount() {
      this.totalCountIsShow = false;
      this.isTotalCount = this.isTotalCountBak;
    },
    closeTotalCount() {
      this.totalCountIsShow = false;
      this.toUpdate();
    },
    deleteSubDrill(idx, key) {
      this.cur_drillData[0].subDrill.splice(idx, 1);
    },
    deleteDrill(index) {
      this.$confirm("确认删除该钻取？", "提示", {
        closeOnClickModal: false,
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          // 清除重命名信息
          if(this.cur_drillData[index].element_id === this.rename.field) {
            this.rename.field = '';
            this.rename.text = '';
          }
          let elementName = this.cur_drillData[index].element_name;
          let hasFlag = this.cur_colData.some(cd => {
            if (cd.element_name == elementName) {
              cd.actived = false;
              return true;
            }
          });
          if (!hasFlag) {
            this.cur_rowData.some(cd => {
              if (cd.element_name == elementName) {
                cd.actived = false;
                return true;
              }
            });
          }
          this.cur_drillData.splice(index, 1);
        })
        .catch(() => {});
    },
    addDrill(item) {
      if (this.isDetail) return;
      if (item.element_type == 2) return;
      let key = `${item.element_name}`;
      let curDrillData = this.cur_drillData;
      if (curDrillData.length > 0 && curDrillData[0].element_name != key) {
        this.$message.warning("只能配置一个钻取顶层");
        return;
      }
      if (curDrillData.length > 0 && curDrillData[0].element_name == key) {
        return;
      }
      const index = HST.searchCurSheet().index;
      let sub_index = HST.searchCurArea(index);
      let areaInfo = this.edcuiCompts[1].comptAttrs.tableList[index].area_info;
      let hadDrill = false;
      areaInfo.some((af, idx) => {
        if (idx != sub_index && af.drillData.length > 0) {
          this.$message.warning(
            `${af.area_name}已配置钻取，一个SHEET只能配置一个区域钻取`
          );
          hadDrill = true;
          return;
        }
      });
      if (hadDrill) return;
      let temp = { expand: true, subDrill: [] };
      item.actived = true;
      curDrillData.push({ ...item, ...temp });
    },
    triggleExp(drill) {
      drill.expand = !drill.expand;
    },
    gotoNext() {
      this.activename2 = "second";
      this.upActiveName2("second");
    },
    toggleHidden() {
      let hideDim = this.hideDim;
      let obj = document.querySelector(
        ".aside-left>.el-scrollbar>.el-scrollbar__wrap"
      );
      if (hideDim) {
        this.$nextTick(() => {
          let obj2 = document.querySelector(".hiddenDims");
          let senior = document.querySelector(".senior");
          let top = obj2.offsetTop + senior.offsetTop;
          obj.scrollTo(0, top);
        });
      } else {
        this.toUpdate();
        this.hiddenDims.splice(0,this.hiddenDims.length);
      }
    },
    toggleFill(val) {
      if(!val) {
        this.toUpdate();
        this.autofill.col.splice(0,this.autofill.col.length);
      }
    },
    autoFillChange() {
      if(this.autofill.col.length>0){
        this.toUpdate();
      }
    },
    countChanage() {
      const selectCount = this.selectCount;
      let obj = document.querySelector(
        ".aside-left>.el-scrollbar>.el-scrollbar__wrap"
      );
      if (selectCount) {
        this.$nextTick(() => {
          let obj2 = document.querySelector(".total-count");
          let senior = document.querySelector(".senior");
          let top = obj2.offsetTop + senior.offsetTop;
          obj.scrollTo(0, top);
        });
      }
      this.$nextTick(() => {
        this.toUpdate();
      })
    },
    openCondiSet() {
      this.condiSetVisible = true;
      this.listBak = JSON.parse(
        JSON.stringify(this.edcuiCompts[0].comptAttrs.fieldList)
      );
      this.upDatasets(
        JSON.parse(JSON.stringify(this.edcuiCompts[0].datasets || []))
      );
      this.datasetsBak = JSON.parse(JSON.stringify(this.datasets));
    },
    cancelCondiSet() {
      this.condiSetVisible = false;
      this.edcuiCompts[0].datasets = JSON.parse(
        JSON.stringify(this.datasetsBak)
      );
      this.edcuiCompts[0].comptAttrs.fieldList = JSON.parse(
        JSON.stringify(this.listBak)
      );
      this.upDatasets(JSON.parse(JSON.stringify(this.datasetsBak)));
    },
    conditionSet() {
      this.edcuiCompts[0].datasets = JSON.parse(JSON.stringify(this.datasets));
      this.upDatasets(this.datasets);
      this.$set(
        this.edcuiCompts[0].comptAttrs,
        "fieldList",
        this.edcuiCompts[0].comptAttrs.fieldList
      );
      this.condiSetVisible = false;
    },
    openDrill() {
      // this.cur_filterDataBak = JSON.parse(JSON.stringify(this.cur_filterData));
      this.drillShowDialog = true;
    },
    openFilters() {
      this.cur_filterDataBak = JSON.parse(JSON.stringify(this.cur_filterData));
      let reset_data = {
        data: objDeepCopy([...this.cur_filterData]),
        type: "reset"
      };
      this.upFilterData(reset_data);
      this.datafilterDialogVisible = true;
    },
    sureDataFilter() {
      this.cur_filterData = JSON.parse(JSON.stringify(this.filterData));
      this.datafilterDialogVisible = false;
    },
    openCalcOpr() {
      if (this.isDetail) return;
      this.batchDialogVisible = true;
      let data = this.cur_countData;
      data.forEach(item => {
        if (item.element_type == 2) {
          item.calcBak = item.calc;
        }
      });
    },
    cancelSet() {
      this.batchDialogVisible = false;
      let data = this.cur_countData;
      data.forEach(item => {
        if (item.element_type == 2) {
          item.calc = item.calcBak;
        }
      });
    },
    transfer() {
      let rowData = JSON.parse(JSON.stringify(this.cur_rowData));
      let colData = JSON.parse(JSON.stringify(this.cur_colData));
      for (let i = 0; i < colData.length; i++) {
        colData[i].position = 1;
      }
      for (let i = 0; i < rowData.length; i++) {
        rowData[i].position = 2;
      }
      this.cur_rowData = colData;
      this.cur_colData = rowData;
    },
    coChange() {
      let coType = this.polymerizeType;
      let rowData = this.cur_rowData;
      let _this = this;
      if (coType == 2) {
        if(this.groupFunc){
          this.$message.warning('聚合计算无法参与清单设计！');
          this.polymerizeType = 1;
          return;
        }
        if (rowData.length == 0) {
          this.rowShow = false;
          this.isDetail = true;
          this.cur_drillData = [];
          this.resetActivated();
          let colData = this.cur_colData;
          colData.forEach(item => {
            if (item.element_type == 2) {
              _this.$delete(item, "calc");
            }
          });
          return;
        }
        this.$confirm("选择“明细”，字段将全部移至“列”，是否继续操作?", "提示", {
          closeOnClickModal: false,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            let currowData = this.cur_rowData;
            this.cur_colData = this.cur_colData.concat(currowData);
            let colData = this.cur_colData;
            colData.forEach((item, index) => {
              if (item.element_type == 2) {
                _this.$delete(item, "calc");
              }
            });
            this.rowShow = false;
            this.isDetail = true;
            this.cur_drillData = [];
            this.cur_rowData = [];
            this.resetActivated();
          })
          .catch(() => {
            this.polymerizeType = 1;
            this.isDetail = false;
            this.rowShow = true;
          });
      } else {
        let colData = this.cur_colData;
        let tempRowData = [],
          tempColData = [];
        colData.forEach(item => {
          if (item.element_type == 2) {
            if (item.col_type == "No." || item.is_calcul == '1') {
              this.$set(item, "calc", 2);
            } else {
              this.$set(item, "calc", 1);
            }
            if (item.is_calcul == '2') {
              this.$set(item, "calc", 0);
            }
            tempColData.push(item);
          } else {
            tempRowData.push(item);
          }
        });
        this.cur_colData = tempRowData.concat(tempColData);
        this.isDetail = false;
      }
    },
    resetActivated() {
      let hasActivated = this.cur_colData.find(cd => cd.actived);
      if (hasActivated) {
        hasActivated.actived = false;
      } else {
        hasActivated = this.cur_rowData.find(cd => cd.actived);
        if (hasActivated) hasActivated.actived = false;
      }
    },
    cloneDragItem(item) {
      return objDeepCopy(item);
    },
    addToCondi(nv) {
      let condiData = this.cur_condiData;
      if (condiData.length > 10) {
        let newIndex = nv.newIndex;
        condiData.splice(newIndex, 1);
      }
    },
    sort(index, obj, type) {
      if (obj[index].sort == type) {
        delete obj[index].sort;
      } else {
        obj[index].sort = type;
      }
      this.$set(obj, index, obj[index]);
    },
    changeCalc(it, index, obj) {
      obj[index].calc = it.value;
      this.$set(obj, index, obj[index]);
    },
    loadMore() {
      if (this.activedNum === 0) {
        return;
      }
      if (this.start) {
        ++this.start;
        this.getAllTablesData("", this.filterText1);
      }
    },
    handleClose() {
      this.batchDialogVisible = false;
      let data = this.cur_countData;
      data.forEach(item => {
        if (item.element_type == 2) {
          item.calc = item.calcBak;
        }
      });
    },
    closeFilterSet() {
      this.cur_filterData = JSON.parse(JSON.stringify(this.cur_filterDataBak));
      let reset_data = { data: [...this.cur_filterData], type: "reset" };
      this.upFilterData(reset_data);
      this.datafilterDialogVisible = false;
    },
    filterNode(value) {
      this.filterCols({ value: value, data: this.allData });
    },
    toAddDataset() {
      this.setDatasetType(1);
      let dataSetCache = {
        af_id: "",
        catalogId: "myfold",
        operation: "dataset",
        dataSetType: 1
      };
      this.setDataSetCache(dataSetCache);
      sessionStorage.setItem("dataSetCache", JSON.stringify(dataSetCache));
      // window.sessionStorage.setItem("store", zip(JSON.stringify(this.$store.state)));
      let routeData = this.$router.resolve({ name: "dataset" });
      window.open(routeData.href, "_blank");
    },
    getAllTablesData(datasetId = "", query = "") {
      let param = {
        datasetId: datasetId,
        start: this.start,
        tenantId:window.sessionStorage.getItem("tenant_id"),
        catalogId: "workfold",
        siteFalg:"1",
        objType: "dads",
        isEdit: 0
      };
      if (datasetId instanceof Array) {
        delete param["datasetId"];
        param.datasetIdList = datasetId;
        param.start = 1;
      }
      if (query != "") {
        param.datasetName = query.replace(/(^\s*)|(\s*$)/g, "");
        if (this.start == 1) {
          this.resetTableData([]);
        }
      }
      this.getDataSetList(param)
        .then(response => {
          let data = response.data.respData;
          this.areaTablesData = this.allTablesData;
          if (datasetId instanceof Array) {
            this.areaTablesData = this.allTablesData;
            this.resetTableData(data);
            let val = this.value;
            let result = this.areaTablesData.find(item => item.datasetId == val);
            let datasetName = result ? result.af_name : "";
            this.upDatasetName(datasetName);
          } else {
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
          }
        })
        .catch(function(error) {
          // this.$message.error("数据集加载失败");
        });
    },
    unique(arr) {
      const res = new Map();
      return arr.filter(a => !res.has(a.datasetId) && res.set(a.datasetId, 1));
    },
    uniqueCur(curVal, vals) {
      let idArr = [];
      curVal.map(c => {
        idArr.push(c.id);
      });
      vals.map(val => {
        if (idArr.includes(val.id)) {
          val.tbSelected = true;
        }
      });
      return vals;
      // const res = new Map();
      // return vals.filter(vals => !res.has(vals.id) && res.set(vals.id, 1));
    },
    changeDataSet() {
      if (this.activedNum == 0 && this.cur_condiData.length > 0) {
        this.$confirm("切换数据集将清空已选查询条件，是否继续操作？", "提示", {
          closeOnClickModal: false,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            this.datasetSwitch();
          })
          .catch(() => {
            this.SwitchCanel();
          });
      } else {
        this.cur_rowData = [];
        this.cur_colData = [];
        this.cur_filterData = [];
        this.cur_filterDataBak = [];
        var reset_data = { data: [], type: "reset" };
        this.upFilterData(reset_data);
        this.hideTitle = false;
        this.hideDim = false;
        this.hiddenDims = [];
        this.needBorder = false;
        this.cur_drillData = [];
        this.polymerizeType = 1;
        this.autofill = {
          show: false,
          val: 0,
          col: [],
          colList: []
        };
        this.rename.show = false;
        this.getColsData(this.value);
      }
    },
    datasetSwitch() {
      this.cur_condiData = [];
      var reset_data = { data: [], type: "reset" };
      this.upCondiData(reset_data);
      this.datasetsBak = [];
      this.upDatasets([]);
      this.edcuiCompts[0].datasets = [];
      this.getColsData(this.value);
    },
    SwitchCanel() {
      this.value = this.oldValue;
    },
    getColsData(value, cd, td) {
      //置空
      this.filterText1 = "";
      this.filterText = "";
      this.wdCheckAll = false;
      this.dlCheckAll = false;
      this.condiWdCheckAll = false;
      this.condiDlCheckAll = false;
      this.tabWdCheckAll = false;
      this.tabDlCheckAll = false;
      this.rowChecked = false;
      this.colChecked = false;
      this.cur_wdCondiData = [];
      this.cur_dlCondiData = [];
      if (td && td.length > 0) {
        this.hideTitle = "";
        this.needBorder = false;
        this.cur_filterData = [];
        this.cur_filterDataBak = [];
        this.rename.show = false;
        const reset_data = { data: [], type: "reset" };
        this.upFilterData(reset_data);
      }

      const datasetId = value;
      let param = {
        datasetId: datasetId,
        isQueryTabHis: 1,
        isEdit: 0
      };
      this.upAllCols([]);
      this.wdColsLen = 0;
      this.dlColsLen = 0;
      this.queryDbColConf({}).then(resQu => {
        if (resQu.status == 200 && resQu.data.respResult == "1") {
          this.fieldTypeList = resQu.data.respData || {};
          this.queryDateFormatList({}).then(responseForm => {
            if (
                responseForm &&
                responseForm.status == 200 &&
                responseForm.data.respResult == "1"
            ) {
              this.formatList = responseForm.data.respData || [];
              this.getDataSetInfo({
                type: "dataasset",
                param: param
              })
                .then(response => {
                  this.resetReportLoading(false);
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
                    this.datasetDetail = respData;
                    // 如果组件有计算字段拼接到度量里面
                    let computedData = this.activedArea.computedData || [];
                    if(computedData.length > 0) {
                      concatComputedData(datasetId, data, computedData);
                    }
                    for (let i = 0; i < data.length; i++) {
                      let item = data[i];
                      if (item.is_show == 0) {
                        continue;
                      }
                      item.col_raw_type = item.col_type;
                      let defc = { selected: false, tbSelected: false };
                      let col_type = item.col_type;
                      let temp = { ...data[i], ...defc };
                      // temp.col_type = temp.col_type.search(/number|double/gi) > -1 ? "No." : temp.col_type.search(/time/gi) > -1 ? "dat" : temp.col_type.substring(0, 3);

                      temp.col_type =
                        fieldMatch(temp.col_type, this.fieldTypeList) ==
                        "number"
                          ? "No."
                          : fieldMatch(temp.col_type, this.fieldTypeList) ==
                            "date"
                          ? "dat"
                          : temp.col_type.substring(0, 3);

                      temp.element_name =
                        (temp.element_name || "") == ""
                          ? item.show_type == 1
                            ? item.col_name
                            : item.col_chs_name
                          : temp.element_name;
                      temp.label = temp.element_name;
                      temp.id = temp.element_id + temp.element_name;

                      var dateTypeList = []; //用来存放，根据源时间格式衍生出的多个不同层级日期字段
                      let show_format = temp.show_format || "";
                      let source_format = temp.source_format || "";
                      if (
                        (show_format != "" || source_format != "") &&
                        temp.element_type == 1
                      ) {
                        //如果原字段类型是数值或者字符串的，根据源格式转换获取的格式来判断当前是第几级（1表示年,2表示月,3表示日,4表示小时,5表示分钟,6表示秒）
                        if (
                          fieldMatch(col_type, this.fieldTypeList) ==
                            "number" ||
                          fieldMatch(col_type, this.fieldTypeList) == "char"
                        ) {
                          for (let iForm = 0; iForm < this.formatList.length; iForm++) {
                            //数据源中的源格式YYYYMMDDHHMISS更改成yyyyMMddhh24miss，所以得把格式变成大写且去掉24来匹配是否一致。
                            //若一致，把YYYYMMDDHHMISS替换成yyyyMMddhh24miss
                            if (
                              this.formatList[iForm].formatStr
                                .toLocaleUpperCase()
                                .replace("24", "") ==
                              source_format
                                .toLocaleUpperCase()
                                .replace("24", "")
                            ) {
                              temp.formatLevel = this.formatList[iForm].formatLevel;
                              temp.show_format = this.formatList[iForm].formatStr;
                              temp.source_format = this.formatList[iForm].formatStr;
                              break;
                            }
                          }
                        } else if (
                          fieldMatch(col_type, this.fieldTypeList) == "date"
                        ) {
                          //如果字段原类型是日期的，则默认展示到秒
                          temp.formatLevel = 6;
                          temp.show_format = "yyyy-MM-dd hh24:mi:ss";
                          temp.source_format = "yyyy-MM-dd hh24:mi:ss";
                        }
                        col_type = "date";
                        temp.col_type = "dat";
                      }

                      /*****dim_id!='' && col_type == 'date' 设为维度********/
                      if (
                        (item.dim_id || "").trim() !== "" ||
                        item.dim_id == "0"
                      ) {
                        //有维度
                        if (
                          (item.dim_level_id || "").trim() !== "" ||
                          item.dim_level_id == "0"
                        ) {
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
                            tbSelected: false,
                            m_value: [],
                            treeSelVal: [] //存储下拉树复选框的值
                          }
                        };
                      } else if (
                        fieldMatch(col_type, this.fieldTypeList) == "number"
                      ) {
                        temp.col_type = "No.";
                        temp = {
                          ...temp,
                          ...{
                            type: "ElNumber",
                            calc:
                              temp.element_type == 2
                                ? temp.col_type == "No."
                                  ? 2
                                  : 1
                                : "",
                            labelWidth: "90px",
                            numList: [{ id: "0", m_value: "", label: 2 }], //前端构造，默认必须有
                            defaultNumList: [
                              { id: "0", m_value: "", label: 2 }
                            ],
                            radioCalcu: "0" //前端构造，默认必须有
                          }
                        };
                      } else if (
                        fieldMatch(col_type, this.fieldTypeList) == "char"
                      ) {
                        temp = {
                          ...temp,
                          ...{
                            type: "ElInput",
                            withSelect: true,
                            labelWidth: "90px",
                            selected: false,
                            tbSelected: false,
                            m_value: "",
                            symbol: 10,
                            defaultSymbol: 10 //设置默认值，和symbol保持一致
                          }
                        };
                      } else if (
                        fieldMatch(col_type, this.fieldTypeList) == "date"
                      ) {
                        var split1 = "";
                        if (show_format.indexOf("/") > -1) {
                          split1 = "/";
                        } else if (show_format.indexOf("-") > -1) {
                          split1 = "-";
                        }
                        //1表示年,2表示月,3表示日,4表示小时,5表示分钟,6表示秒
                        for (let iTime = 1; iTime <= temp.formatLevel; iTime++) {
                          let dateTemp = objDeepCopy(temp);
                          dateTemp.element_type = Number(dateTemp.element_type);
                          dateTemp.formatLevel = iTime; //日期字段的层级（1表示年,2表示月,3表示日,4表示小时,5表示分钟,6表示秒）
                          dateTemp.isNewCol = true; //用来判断是否是日期字段新增加的日期层级字段
                          let dateCycle = "year";
                          if (iTime == 1) {
                            //年
                            dateCycle = "year";
                            dateTemp.element_name =
                              dateTemp.element_name + "(YYYY)";
                            dateTemp.show_format = temp.show_format.substring(
                              0,
                              4
                            );
                          } else if (iTime == 2) {
                            // 月
                            dateCycle = "month";
                            dateTemp.element_name =
                              dateTemp.element_name + "(MM)";
                            dateTemp.show_format =
                              split1 == ""
                                ? temp.show_format.substring(0, 6)
                                : temp.show_format.substring(0, 7);
                          } else if (iTime == 3) {
                            // 日
                            dateCycle = "date";
                            dateTemp.element_name =
                              dateTemp.element_name + "(DD)";
                            dateTemp.show_format =
                              split1 == ""
                                ? temp.show_format.substring(0, 8)
                                : temp.show_format.substring(0, 10);
                          } else if (iTime == 4) {
                            dateCycle = "datetime";
                            dateTemp.element_name =
                              dateTemp.element_name + "(HH)";
                            let indx =
                              temp.source_format.indexOf(":") > -1 ? 1 : 0; //是否存在冒号，截取是否要多截取一位
                            dateTemp.show_format =
                              temp.show_format.indexOf("mi") > -1
                                ? temp.show_format.substring(
                                    0,
                                    temp.show_format.indexOf("mi") - indx
                                  )
                                : temp.show_format;
                          } else if (iTime == 5) {
                            dateCycle = "datetime";
                            dateTemp.element_name =
                              dateTemp.element_name + "(MI)";
                            let indx =
                              temp.source_format.indexOf(":") > -1 ? 1 : 0; //是否存在冒号，截取是否要多截取一位
                            dateTemp.show_format =
                              temp.show_format.indexOf("ss") > -1
                                ? temp.show_format.substring(
                                    0,
                                    temp.show_format.indexOf("ss") - indx
                                  )
                                : temp.show_format;
                          } else if (iTime == 6) {
                            dateCycle = "datetime";
                            dateTemp.element_name =
                              dateTemp.element_name + "(SS)";
                            dateTemp.show_format = temp.show_format;
                          }
                          dateTemp.col_chs_name = dateTemp.element_name;
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
                          dateTemp = {
                            ...dateTemp,
                            ...initFuncDateParam(dateTemp,split1, this.fieldTypeList)
                          }
                          dateTemp.id =
                            dateTemp.element_id + dateTemp.element_name;
                          dateTypeList.push(dateTemp);
                        }
                        //临时释放
                        // let date_type = "";
                        // const date = new Date();
                        // const year = date.getFullYear();
                        // const month = date.getMonth();
                        // const day = date.getDate();
                        // var m_value;
                        // temp.isNewCol = true
                        // temp.formatLevel = 1
                        // try {
                        //   //date_type 6:年  2:年月  1:年月日  其他包含时分秒：5
                        //   date_type =
                        //     show_format == "yyyy"
                        //       ? 6
                        //       : show_format == "yyyy-mm" ||
                        //         show_format == "yyyy/mm" ||
                        //         show_format == "yyyymm" ||
                        //         show_format === "yyyy/MM" ||
                        //         show_format === "yyyyMM"
                        //       ? 2
                        //       : show_format == "yyyy-MM-dd" ||
                        //         show_format == "yyyy/MM/dd" ||
                        //         show_format == "yyyyMMdd"
                        //       ? 1
                        //       : 5;
                        // } catch (e) {}
                        // if (date_type == 1) {
                        //   //日
                        //   m_value =
                        //     year +
                        //     split1 +
                        //     (month + 1).toString().padStart(2, "0") +
                        //     split1 +
                        //     day.toString().padStart(2, "0");
                        //   var fix = "";
                        //   if (
                        //     show_format.toLocaleUpperCase().indexOf("HHMISS") >
                        //     -1
                        //   ) {
                        //     fix = "000000";
                        //   } else if (
                        //     show_format
                        //       .toLocaleUpperCase()
                        //       .indexOf("HH:MI:SS") > -1
                        //   ) {
                        //     fix = " 00:00:00";
                        //   }
                        //   m_value += fix;
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
                        //       tbSelected: false
                        //     }
                        //   };
                        // } else if (date_type == 2) {
                        //   //月
                        //   m_value =
                        //     year +
                        //     split1 +
                        //     (month + 1).toString().padStart(2, "0");
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
                        //       tbSelected: false
                        //     }
                        //   };
                        // } else if (date_type == 5) {
                        //   //datetime格式
                        //   m_value = year.toString();
                        //   temp = {
                        //     ...temp,
                        //     ...{
                        //       type: "ElDatePicker",
                        //       dateCycle: "datetime", //前端构造，默认必须有
                        //       cycleType: "datetime", //前端构造，默认必须有
                        //       //m_value: [m_value + ""],
                        //       m_value: [""],
                        //       labelWidth: "90px",
                        //       timeOpr: 2,
                        //       selected: false,
                        //       tbSelected: false
                        //     }
                        //   };
                        // } else if (date_type == 6) {
                        //   m_value = year.toString();
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
                        //       tbSelected: false
                        //     }
                        //   };
                        // }
                      }
                      if (temp.element_type != 2) {
                        temp.element_type = 1;
                      }
                      if (temp.element_type == 1) {
                        //  && !temp.isNewCol
                        //新增加的日期分层字段，不加入维度字段个数总计
                        //维度
                        this.wdColsLen++;
                        temp.sort = 1;
                      } else if (temp.element_type != 1) {
                        //度量
                        this.dlColsLen++;
                      }
                      temp.col_type =
                        temp.col_type.search(/No.|var|dat/) > -1
                          ? temp.col_type
                          : "var";
                      if (temp.element_type == 2) {
                        if (temp.col_type == "No.") {
                          temp.calc = 2;
                        } else {
                          temp.calc = 1;
                        }
                        if (temp.is_calcul == '2') {
                          temp.calc = 0;
                        }
                      }
                      if (cd && cd.length > 0) {
                        cd.map((row, index) => {
                          let curDateLevel = row.formatLevel || 1; //获取查询条件拖入的时间字段当前的层级
                          //如果是非日期字段element_id相等即可。日期字段则要匹配的日期层级
                          let dateTypeArr =
                            dateTypeList[curDateLevel - 1] || [];
                          if (
                            (temp.col_type != "dat" &&
                              row.col_id == temp.col_id &&
                              row.element_name == temp.element_name) ||
                            (temp.col_type == "dat" &&
                              row.col_id == dateTypeArr.col_id &&
                              row.element_name == dateTypeArr.element_name &&
                              row.isNewCol == dateTypeArr.isNewCol)
                          ) {
                            let curTemp =
                              row.col_type != "dat" ? temp : dateTypeArr;
                            curTemp.selected = true;
                            if (row.col_type !== curTemp.col_type) {
                              row = objDeepCopy(curTemp);
                            }
                            if (row.element_type == 1) {
                              this.rowChecked = true;
                              this.cur_wdCondiData.push(row);
                            } else {
                              this.colChecked = true;
                              this.cur_dlCondiData.push(row);
                            }
                          }
                        });
                      }
                      if (td && td.length > 0) {
                        td.map((row, index) => {
                          let curDateLevel = row.formatLevel || 1; //获取查询条件拖入的时间字段当前的层级
                          //如果是非日期字段element_id相等即可。日期字段则要匹配的日期层级
                          let dateTypeArr = dateTypeList[curDateLevel - 1] || [];
                          if (
                            (temp.col_type != "dat" &&
                              row.col_id == temp.col_id &&
                              row.element_name == temp.element_name) ||
                            (temp.col_type == "dat" &&
                              row.col_id == dateTypeArr.col_id &&
                              row.element_name == dateTypeArr.element_name &&
                              row.isNewCol == dateTypeArr.isNewCol)
                          ) {
                            let curTemp =
                              row.col_type != "dat" ? temp : dateTypeArr;
                            curTemp.tbSelected = true;
                            curTemp = {
                              ...curTemp,
                              ...{
                                nick_name: row.label,
                                dot: row.dot,
                                numType: row.numType,
                                calcAttr: row.calcAttr,
                                sort: row.sort
                              }
                            };
                            if (curTemp.element_type == 1) {
                              this.rowChecked = true;
                            } else {
                              this.colChecked = true;
                            }
                            td[index] = curTemp;
                          }
                        });
                      }
                      //end
                      if(temp.is_calcul == "1"){
                        temp.col_type = 'fx'
                      } else if(temp.is_calcul == "2"){
                        temp.col_type = 'gfx'
                      }
                      this.allColsData.push(temp);
                      this.upAllCols(this.allColsData.concat(dateTypeList)); //把根据源时间格式衍生出的多个不同层级日期字段，加入到数据集维度字段列表中
                    }
                    let len1 = 0,
                      len2 = 0,
                      len11 = 0,
                      len22 = 0;
                    this.allColsData.map(item => {
                      if (item.element_type == 1) {
                        len1 += item.isNewCol ? 0 : 1; //分层的日期字段，不应该加入维度个数的总数中
                        if (item.tbSelected) {
                          len11++;
                        }
                      } else {
                        len2++;
                        if (item.tbSelected) {
                          len22++;
                        }
                      }
                    });
                    if (len11 == len1 && len1 > 0) {
                      this.wdCheckAll = true;
                    }
                    if (len22 == len2 && len2 > 0) {
                      this.dlCheckAll = true;
                    }
                    if (cd && cd.length > 0) {
                      this.cur_condiData = cd;
                      this.condiAllData = [...this.allColsData];
                    }
                    if (td && td.length > 0) {
                      const index = HST.searchCurSheet().index,
                        sub_index = HST.searchCurArea(index),
                        areaInfo = this.edcuiCompts[1].comptAttrs.tableList[
                          index
                        ].area_info[sub_index];
                      if (!!areaInfo) {
                        // 初始化行列的position 方便delete
                        areaInfo.af_row.map(item => {
                          item.position = 1;
                        });
                        areaInfo.af_col.map(item => {
                          item.position = 2;
                        });
                        this.cur_rowData = objDeepCopy(areaInfo.af_row);
                        this.cur_colData = objDeepCopy(areaInfo.af_col);
                      }
                      const reset_data1 = { data: td || [], type: "reset" };
                      this.upTableCols(reset_data1);
                    }
                    this.allData = [...this.allColsData];
                    if (this.activedNum === 0) {
                      this.condiAllData = [...this.allColsData];
                    }
                  }
                })
                .catch(error => {
                  // this.$message.error("字段加载失败");
                  this.resetReportLoading(false);
                });
            } else {
              this.formatList = [];
              this.$message.error("日期源格式查询失败");
            }
          });
        }
      });
    },
    tbColChange(ev, type) {
      let _this = this;
      let wdLen = 0;
      let len = 0;
      if (type == "wd") {
        //维度
        //已选择维度的element_id集合，用来判断是否已经选中日期了，如果选中了则用当前层级的日期字段，未选中则默认选中第一层（YYYY）
        let elementIdArr = [];
        let selArr = objDeepCopy(this.cur_colData); //维度全选，默认到列
        for (let index = 0; index < selArr.length; index++) {
          if (
            selArr[index] != undefined &&
            !elementIdArr.includes(selArr[index].element_id) &&
            selArr[index].col_type == "dat" &&
            selArr[index].element_type == 1
          ) {
            elementIdArr.push(selArr[index].element_id);
          }
        }
        let rowData = this.cur_colData;
        for (let i = 0; i < rowData.length; i++) {
          if (rowData[i].element_type == 1) {
            wdLen++;
          }
        }
        let addIndex = 0;
        this.allColsData.map(function(item, index) {
          item = { ...item };
          if (item.element_type == 1) {
            //如果日期字段未选中，则默认选中第一层（YYYY）
            if (
              ev &&
              !item.tbSelected &&
              !elementIdArr.includes(item.element_id) &&
              ((item.col_type === "dat" &&
                item.isNewCol &&
                item.formatLevel === 1) ||
                item.col_type !== "dat")
            ) {
            // if (
            //   ev &&
            //   !item.tbSelected &&
            //   !elementIdArr.includes(item.element_id) &&
            //   ((item.col_type == "dat" && !item.isNewCol) ||
            //     item.col_type != "dat")
            // ) {
              let tempSel = item.tbSelected;
              item.tbSelected = ev;
              _this.wdtableCols.push(item);
              _this.tableCols.push(item);
              if (!item.position || tempSel === undefined) {
                item.position = 2;
                _this.cur_colData.splice(wdLen + addIndex, 0, item);
                addIndex++;
              }
            } else if (!ev) {
              item.tbSelected = false;
              _this.wdtableCols = [];
              let key = item.element_name;
              if (
                !_this.isDetail &&
                _this.cur_drillData.length > 0 &&
                _this.cur_drillData[0].element_name == key
              ) {
                _this.cur_drillData.splice(0, 1);
              }
            }
            // item.tbSelected = ev;
            item.sort = 1;
          }
        });
        if (!ev) {
          this.allColsData.map(function(item, index) {
            if (item.element_type == 1) {
              delete item.position;
            }
          });
          for (let i = 0; i < this.cur_colData.length; i++) {
            if (this.cur_colData[i].element_type == 1) {
              this.cur_colData.splice(i, 1);
              i--;
            }
          }
          for (let i = 0; i < this.cur_rowData.length; i++) {
            if (this.cur_rowData[i].element_type == 1) {
              this.cur_rowData.splice(i, 1);
              i--;
            }
          }
        }
        if (this.filterText == "") {
          this.allData.map(function(item, index) {
            if ( ev && item.element_type == 1 && !elementIdArr.includes(item.element_id) && ((item.col_type === "dat" && item.isNewCol && item.formatLevel === 1) || item.col_type !== "dat") ) {
            // if (
            //   ev &&
            //   item.element_type == 1 &&
            //   !elementIdArr.includes(item.element_id) &&
            //   ((item.col_type == "dat" && !item.isNewCol) ||
            //     item.col_type != "dat")
            // ) {
              item.tbSelected = ev;
            } else if (!ev && item.element_type == 1) {
              item.tbSelected = ev;
            }
          });
        }
        if (this.allColsData.length === 0) {
          this.wdCheckAll = false;
        }
      } else {
        // 判断行是否已经有度量
        let rowHasDl = false;
        let startIndex = -1;
        for (let i = 0; i < this.cur_rowData.length; i++) {
          if (this.cur_rowData[i].element_type == 2) {
            if (!rowHasDl) {
              rowHasDl = true;
              startIndex = i;
            }
            len++;
          }
        }
        let rowAddIndex = 0;
        let sign = false;
        this.allColsData.forEach(function(item, index) {
          item = { ...item };
          if (item.element_type != 1) {
            // 聚合字段不能全选
            if(_this.polymerizeType == 2 && item.is_calcul == '2'){
              sign = true;
              item.selected = false;
              item.tbSelected = false;
            } else {
              if (ev && !item.tbSelected) {
                _this.dltableCols.push(item);
                _this.tableCols.push(item);
                if (rowHasDl) {
                  if (!item.position) {
                    item.position = 1;
                    _this.cur_rowData.splice(
                      startIndex + len + rowAddIndex,
                      0,
                      item
                    );
                    rowAddIndex++;
                  }
                } else {
                  if (!item.position) {
                    item.position = 2;
                    _this.cur_colData.push(item);
                  }
                }
              }
              item.tbSelected = ev;
            }
          }
        });
        if (!ev) {
          this.allColsData.map(function(item, index) {
            if (item.element_type == 2) {
              delete item.position;
            }
          });
          for (let i = 0; i < this.cur_colData.length; i++) {
            if (this.cur_colData[i].element_type == 2) {
              this.cur_colData.splice(i, 1);
              i--;
            }
          }
          for (let i = 0; i < this.cur_rowData.length; i++) {
            if (this.cur_rowData[i].element_type == 2) {
              this.cur_rowData.splice(i, 1);
              i--;
            }
          }
        }
        if (this.filterText == "") {
          this.allData.map(function(item, index) {
            if (item.element_type != 1) {
              if(_this.polymerizeType==2 && item.is_calcul == '2') {
                item.tbSelected = false;
                item.selected = false;
              }else{
                item.tbSelected = ev;
              }
            }
          });
        }
        if (this.allColsData.length === 0) {
          this.dlCheckAll = false;
        }
        if(sign) {
          _this.$message.warning('聚合计算无法拖入清单设计')
        }
      }
      let vals = this.tableCols;
      let _repeat = 0;
      for (let i = 0; i < vals.length; i++) {
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
      let reset_data = { data: vals, type: "reset" };
      _this.upTableCols(reset_data);
    },
    deleteItem(item, type) {
      this.condiOpt = "delete";
      // 清除重命名信息
      if(item.element_id === this.rename.field) {
        this.rename.field = '';
        this.rename.text = '';
      }
      // 删除别名信息
      for(let i=0; i<this.allData.length; i++) {
        if(this.allData[i].element_id === item.element_id) {
          delete this.allData[i].nick_name;
          break;
        }
      }

      if (this.activedNum == 0) {
        let c_dDel = this.cur_condiData;
        for (var i = 0; i < c_dDel.length; i++) {
          if (
              c_dDel[i].id == item.id &&
              c_dDel[i].formatLevel == item.formatLevel &&
              c_dDel[i].isNewCol == item.isNewCol
          ) {
            delete item.position;
            delete item.sort;
              c_dDel.splice(i, 1);
            if (item.element_type == 1) {
              this.condiWdCheckAll = false;
              this.wdCheckAll = false;
            } else {
              this.condiDlCheckAll = false;
              this.dlCheckAll = false;
              if (item.col_type == "No.") {
                item.calc = 2;
              } else {
                item.calc = 1;
              }
            }

            var reset_data = { data: [...c_dDel], type: "reset" };
            this.upCondiData(reset_data);
            break;
          }
        }
        const datas = this.edcuiCompts[0].datasets || [];
        const key = `${item.col_id}&${item.element_name}`;
        for (let j of datas) {
          delete j[key];
          if (!!j.field) {
            delete j.field[key];
          }
        }
      } else {
        if (type == "filter") {
          //过滤器
          let c_d1 = this.cur_filterData;
          for (let iFil = 0; iFil < c_d1.length; iFil++) {
            if (
              this.filterData[iFil].id == item.id &&
              this.filterData[iFil].formatLevel == item.formatLevel &&
              this.filterData[iFil].isNewCol == item.isNewCol
            ) {
              const del_data = { type: "del", position: iFil };
              this.upFilterData(del_data);
            }
            if (c_d1[iFil].id == item.id) {
                c_d1.splice(iFil, 1);
              break;
            }
          }
        } else {
          //查询结果
          var c_d, o_d;
          if (item.position == 1) {
            c_d = this.cur_rowData;
            o_d = this.cur_colData;
          } else {
            c_d = this.cur_colData;
            o_d = this.cur_rowData;
          }
          for (let iQuery = 0; iQuery < c_d.length; iQuery++) {
            if (
              c_d[iQuery].id == item.id &&
              c_d[iQuery].formatLevel == item.formatLevel &&
              c_d[iQuery].isNewCol == item.isNewCol
            ) {
              delete item.position;
              c_d.splice(iQuery, 1);
              let reset_data2 = { data: c_d.concat(o_d), type: "reset" };
              this.upTableCols(reset_data2);
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
          if (
            this.cur_drillData.length > 0 &&
            this.cur_drillData[0].element_name == item.element_name
          ) {
            this.cur_drillData.splice(0, 1);
            this.resetActivated();
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
      if (type !== "filter") {
        //非过滤器
        var a_c_d = this.allColsData;
        for (let iNon = 0; iNon < a_c_d.length; iNon++) {
          if (
            a_c_d[iNon].id == item.id &&
            a_c_d[iNon].formatLevel == item.formatLevel &&
            a_c_d[iNon].isNewCol == item.isNewCol
          ) {
            delete a_c_d[iNon].position;
            if (this.activedNum == 0) {
              this.allColsData[iNon].selected = false;
            } else {
              this.allColsData[iNon].tbSelected = false;
            }
            break;
          }
        }
        for (let iAll = 0; iAll < this.allData.length; iAll++) {
          if (
            this.allData[iAll].id == item.id &&
            this.allData[iAll].formatLevel == item.formatLevel &&
            this.allData[iAll].isNewCol == item.isNewCol
          ) {
            if (this.activedNum == 0) {
              this.allData[iAll].selected = false;
            } else {
              this.allData[iAll].tbSelected = false;
            }
            break;
          }
        }
      }
    },
    deleteCountData(index) {
      this.cur_countData.splice(index, 1);
    },
    dsColChange(ev, type) {
      if (this.activedNum == 1) {
        //查询结果执行这里
        this.tbColChange(ev, type);
        return false;
      }
      //查询条件 执行这里
      const allColsData = objDeepCopy(this.allColsData);
      if (type == "wd") {
        //维度
        if (this.wdCheckAll && this.wdColsLen > 10) {
          this.$message.warning("查询条件不得超过10个！");
          this.wdCheckAll = false;
          return;
        }
        this.wdChecked = ev;
        this.allColsData.map((item, index) => {
          item = { ...item };
          if (item.element_type == 1) {
            item.selected = ev;
            if (ev) {
              this.cur_wdCondiData.push(allColsData[index]);
              this.cur_condiData.push(allColsData[index]);
              this.cur_rowData.push(allColsData[index]);
            } else {
              this.cur_rowData = [];
              this.cur_wdCondiData = [];
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
        this.allColsData.map((item, index) => {
          item = { ...item };
          if (item.element_type != 1) {
            item.selected = ev;
            if (ev) {
              this.cur_dlCondiData.push(allColsData[index]);
              this.cur_condiData.push(allColsData[index]);
              this.cur_colData.push(allColsData[index]);
            } else {
              this.cur_dlCondiData = [];
              this.cur_colData = [];
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

      var wd = this.cur_rowData;
      var dl = this.cur_colData;
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
            for (var j = 0; j < vals.length; j++) {
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
            for (let jRe = 0; jRe < vals.length; jRe++) {
              if (
                vals[i].element_name == vals[jRe].element_name &&
                vals[i].id == vals[jRe].id
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
      this.upCondiData(reset_data);
    },
    resetTables(sign) {
      if (!sign) {
        if (!this.valueIsChange && this.filterText1 != "") {
          this.refreshDataset();
        }
        this.filterText1 = "";
        this.valueIsChange = false;
      } else if (
        this.activedNum != 0 &&
        !this.valueIsChange &&
        this.filterText1 == ""
      ) {
        this.refreshDataset();
      }
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
    remoteMethod(query) {
      if (this.activedNum === 0) {
        return;
      }
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
    upSort(item, index) {
      var data = item.element_type == 1 ? this.cur_rowData : this.cur_colData;
      if (index != 0) {
        let previewIndex = index - 1;
        let temp = JSON.parse(JSON.stringify(data[index]));
        data[index] = JSON.parse(JSON.stringify(data[previewIndex]));
        data[previewIndex] = temp;
        this.$set(data, previewIndex, temp);
        this.$set(data, index, data[index]);
      }
    },
    downSort(item, index) {
      var data = item.element_type == 1 ? this.cur_rowData : this.cur_colData;
      if (index != data.length - 1) {
        let nextIndex = index + 1;
        let temp = JSON.parse(JSON.stringify(data[index]));
        data[index] = JSON.parse(JSON.stringify(data[nextIndex]));
        data[nextIndex] = temp;
        this.$set(data, nextIndex, temp);
        this.$set(data, index, data[index]);
      }
    },
    todraggedItem(evt) {
      const _idx = evt.item.attributes.index.value;
      const _itemdata = { ...this.allColsData[_idx] };
      this.draggedItem = _itemdata;
    },
    batchSettings() {
      this.batchDialogVisible = false;
    },
    dragInSameGroupOpr(flag, _idx, nv, copyFlag) {
      let newIndex = nv.newIndex;
      let tips = "";
      let position;
      let otherGroup,
        thisGroup,
        elementType,
        curElements = 0,
        elements = 0,
        checkType;
      if (flag == 1) {
        // 列
        otherGroup = this.cur_rowData;
        thisGroup = this.cur_colData;
        tips = "行";
        position = 2;
      } else {
        otherGroup = this.cur_colData;
        thisGroup = this.cur_rowData;
        tips = "列";
        position = 1;
      }
      if (this.allColsData[_idx].element_type == 1) {
        elementType = 1;
        checkType = "wdCheckAll";
      } else {
        elementType = 2;
        checkType = "dlCheckAll";
      }

      let flagIndex = -1;

      if (thisGroup[newIndex].id != this.allColsData[_idx].id) {
        flagIndex = newIndex - 1;
        let temp = { ...thisGroup[newIndex] };
        this.$set(thisGroup, newIndex, { ...thisGroup[flagIndex] });
        this.$set(thisGroup, flagIndex, temp);
      }

      const reg = /\([Y|M|D|H|I|S]*\)/g;
      let id = this.allColsData[_idx].id.replace(reg, "");
      if (JSON.stringify(this.tableCols).indexOf(id) > -1) {
        this.$message({
          message: "字段已存在",
          type: "warning"
        });
        thisGroup.splice(newIndex, 1);
        return;
      }

      this.allColsData[_idx].element_type == 1 &&
        (this.allColsData[_idx].sort = 1);

      if (this.isDetail) {
        this.allColsData[_idx].tbSelected = true;
        if (
          this.allColsData[_idx].element_type == 2 &&
          this.polymerizeType == 2
        ) {
          delete thisGroup[newIndex].calc;
        }
        if (this.allColsData[_idx].element_type == 1) {
          thisGroup[newIndex].sort = 1;
        }
        for (let iCol = 0; iCol < this.allColsData.length; iCol++) {
          if (this.allColsData[iCol].element_type == elementType) {
            elements += this.allColsData[iCol].isNewCol ? 0 : 1; //分层级的日期字段，不加入字段总计
            if (this.allColsData[iCol].tbSelected) {
              curElements++;
            }
          }
        }
        /* if (elements != 0 && elements == curElements) {
          this[checkType] = true;
        }
        return; */
      } else {
        //拖动度量，但已有度量出现在列/行
        if (this.allColsData[_idx].element_type == 2) {
          let lens = 0;
          for (let iOth = 0; iOth < otherGroup.length; iOth++) {
            if (otherGroup[iOth].element_type == 2) {
              lens++;
              break;
            }
          }

          if (lens > 0) {
            this.$message({
              message: "度量已经出现在" + tips + "，请拖动到" + tips,
              type: "warning"
            });

            let flagIndex1 = -1;
            for (let iGro = 0; iGro < thisGroup.length; iGro++) {
              if (thisGroup[iGro].id == this.allColsData[_idx].id) {
                  flagIndex1 = iGro;
                break;
              }
            }

            if (flagIndex1 != newIndex) {
              let temp = { ...thisGroup[newIndex] };
              this.$set(thisGroup, newIndex, { ...thisGroup[flagIndex1] });
              this.$set(thisGroup, flagIndex1, temp);
            }
            thisGroup.splice(newIndex, 1);
            return;
          }
          this.allColsData[_idx].position = position;
          if (this.polymerizeType == 2) {
            delete thisGroup[newIndex].calc;
          }
          // 度量拖到维度之前，调整到所有维度之后
          if (
            thisGroup[newIndex + 1] &&
            thisGroup[newIndex + 1].element_type == 1
          ) {
            let len = thisGroup.length;
            let end = 0;
            for (let iEle = 0; iEle < len; iEle++) {
              let data = thisGroup[iEle];
              if (data.element_type == 1) {
                end++;
              }
            }
            let temp = { ...this.allColsData[_idx] };

            thisGroup.splice(newIndex, 1);
            thisGroup.splice(end, 0, temp);
          }
        } else if (this.allColsData[_idx].element_type == 1) {
          // 维度拖到度量之后，调整到所有度量之前

          let flagIndex2 = -1;
          for (let iData = 0; iData < thisGroup.length; iData++) {
            if (thisGroup[iData].id == this.allColsData[_idx].id) {
              flagIndex2 = iData;
              break;
            }
          }

          if (flagIndex2 != newIndex) {
            let temp = { ...thisGroup[newIndex] };
            this.$set(thisGroup, newIndex, { ...thisGroup[flagIndex2] });
            this.$set(thisGroup, flagIndex2, temp);
          }

          this.allColsData[_idx].position = position;
          if (newIndex > 0 && thisGroup[newIndex - 1].element_type == 2) {
            let len = thisGroup.length;
            let start = -1;
            for (let p = 0; p < len; p++) {
              let data = thisGroup[p];
              if (data.element_type == 2) {
                start = p;
                break;
              }
            }

            let temp = { ...this.allColsData[_idx] };
            thisGroup.splice(newIndex, 1);
            thisGroup.splice(start, 0, temp);
          }
        }
      }

      this.allColsData[_idx].tbSelected = true;
      this.allData[_idx].tbSelected = true;
      this.draggedItem.position = position;
      const add_data = { data: { ...this.draggedItem }, type: "add" };
      this.upTableCols(add_data);

      for (let m = 0; m < this.allColsData.length; m++) {
        if (this.allColsData[m].element_type == elementType) {
          elements += this.allColsData[m].isNewCol ? 0 : 1; //分层级的日期字段，不加入字段总计
          if (this.allColsData[m].tbSelected) {
            curElements++;
          }
        }
      }
      if (elements != 0 && elements == curElements) {
        this[checkType] = true;
      }
    },
    addToField(nv) {
      const _idx = nv.item.attributes.index.value;
      // 清单查询聚合字段不能拖入
      if(this.polymerizeType === 2 && this.allColsData[_idx].is_calcul=='2') {
        this.$message.warning('聚合计算无法参与清单设计！');
        let id = this.allColsData[_idx].element_id;
        for(let i=0;i<this.cur_colData.length;i++){
          if(this.cur_colData[i].element_id == id) {
            this.cur_colData.splice(i,1);
          }
        }
        return;
      }
      if (this.activedNum === 0) {
        if (this.cur_condiData.length > 10) {
          this.$message.warning("查询条件不得超过10个！");
        }
      }
      if (nv.to.className == "query-row") {
        //行
        this.dragInSameGroupOpr(2, _idx, nv);
      } else if (nv.to.className == "query-col") {
        //列
        this.dragInSameGroupOpr(1, _idx, nv);
      } else if (nv.to.className == "query-condi") {
        this.toCondi(nv, _idx);
      } else if (nv.to.className == "query-filters") {
        this.toFilter(_idx, nv);
      } else if (nv.to.className == "query-drill") {
        this.toDrill(nv, _idx);
      } else {
        if (nv.to.className == "copy-dragg") {
          this.cur_drillData[0].subDrill.push(this.allColsData[_idx]);
          this.toDrill(nv, _idx);
        } else if (nv.to.className == "copy-row") {
          this.cur_rowData.push(this.allColsData[_idx]);
          nv.newIndex = this.cur_rowData.length - 1;
          this.dragInSameGroupOpr(2, _idx, nv, 1);
        } else if (nv.to.className == "copy-col") {
          this.cur_colData.push(this.allColsData[_idx]);
          nv.newIndex = this.cur_colData.length - 1;
          this.dragInSameGroupOpr(1, _idx, nv, 1);
        } else if (nv.to.className == "copy-filter") {
          this.cur_filterData.push(this.allColsData[_idx]);
          nv.newIndex = this.cur_filterData.length - 1;
          this.addToFilter(nv, _idx);
          this.toFilter(_idx, nv);
        } else if (nv.to.className == "copy-condi") {
          this.cur_condiData.push(this.allColsData[_idx]);
          nv.newIndex = this.cur_condiData.length - 1;
          this.toCondi(nv, _idx);
        }
      }
    },
    toCondi(nv, _idx) {
      const reg = /\([Y|M|D|H|I|S]*\)/g;
      let id = this.allColsData[_idx].id.replace(reg, "");
      if (JSON.stringify(this.condiData).indexOf(id) > -1) {
        this.$message({
          message: "条件已存在",
          type: "warning"
        });
        this.cur_condiData.splice(nv.newIndex, 1);
        return;
      }
      if (this.allColsData[_idx].element_type == 1) {
        this.rowChecked = true;
      } else {
        this.colChecked = true;
      }
      this.allColsData[_idx].selected = true;
      this.allData[_idx].selected = true;
      const add_data = { data: { ...this.allColsData[_idx] }, type: "add" };
      this.upCondiData(add_data);
    },
    toDrill(nv, _idx) {
      let key = nv.to.parentNode.parentNode.id || 0;
      let topObj = this.cur_drillData[key];
      let original = this.allColsData[_idx];
      const newIndex = nv.to.parentNode.parentNode.id
        ? nv.newIndex
        : topObj.subDrill.length - 1;
      if (original.element_type == 2) {
        this.$message.warning("钻取只支持维度，请重新设置");
        topObj.subDrill.splice(newIndex, 1);
        return;
      }
      if (original.element_name == topObj.element_name) {
        this.$message.warning("钻取顶层已存在该字段，请重新设置");
        topObj.subDrill.splice(newIndex, 1);
        return;
      }
      let hadField = 0;
      for (let sd of topObj.subDrill) {
        if (sd.element_name == original.element_name) {
          hadField++;
        }
      }

      if (hadField == 2) {
        this.$message.warning("已存在该字段，请重新设置");
        topObj.subDrill.splice(newIndex, 1);
        return;
      }
      let lens = topObj.subDrill.length;
      if (lens > 4) {
        this.$message.warning("最多可配置4个层级，请重新设置");
        topObj.subDrill.splice(newIndex, 1);
        return;
      }
    },
    toFilter(_idx, nv) {
      const reg = /\([Y|M|D|H|I|S]*\)/g;
      let id = this.allColsData[_idx].id.replace(reg, "");
      if (JSON.stringify(this.filterData).indexOf(id) > -1) {
        this.$message({
          message: "数据过滤已存在",
          type: "warning"
        });
        return;
      }
      let data = { ...this.allColsData[_idx] };
      const add_data = { data: data, type: "add", position: nv.newIndex };
      this.upFilterData(add_data);
    },
    toOption(index, obj, type) {
      if (this.activedNum == 1) {
        // 清单查询不能拖入聚合字段
        if(this.polymerizeType == 2 && this.allColsData[index].is_calcul=='2'){
          this.$message.warning('聚合计算无法参与清单设计！');
          return;
        }

        //数据绑定
        //日期字段双击特殊处理：第一个日期字段不可使用，只能使用各层级字段，并且只能拖入相同日期的一个层级。
        const reg = /\([Y|M|D|H|I|S]*\)/g;
        let id = this.allColsData[index].id.replace(reg, "");
        if (obj.target.className.indexOf("selected") == -1 &&
          (this.allColsData[index].col_type == 'dat' && this.allColsData[index].isNewCol || this.allColsData[index].col_type != 'dat') &&
          JSON.stringify(this.cur_colData).indexOf(id) == -1
        ) {
          this.allColsData[index].tbSelected = true;
          (this.allData[index] || []).tbSelected = true;
          this.allColsData[index].element_type == 1 &&
            (this.allColsData[index].sort = 1);
          if (
            this.polymerizeType == 2 &&
            this.allColsData[index].element_type == 2
          ) {
            delete this.allColsData[index].calc;
          }
          var elementType;
          var elements = 0;
          var curElements = 0;
          var checkType;

          if (this.isDetail) {
            this.cur_colData.push(this.allColsData[index]);
            if (type == "row") {
              elementType = 1;
              checkType = "wdCheckAll";
            } else {
              elementType = 2;
              checkType = "dlCheckAll";
            }
            for (let n = 0; n < this.allColsData.length; n++) {
              if (this.allColsData[n].element_type == elementType) {
                elements += this.allColsData[n].isNewCol ? 0 : 1; //分层级的日期字段，不加入字段总计
                if (this.allColsData[n].tbSelected) {
                  curElements++;
                }
              }
            }
            if (elements != 0 && elements == curElements) {
              this[checkType] = true;
            }
            return;
          }

          let data = this.cur_colData;
          var startWdIndex = -1;
          let wdLen = 0;
          for (let b = 0; b < data.length; b++) {
            if (data[b].element_type == 1) {
              if (startWdIndex == -1) {
                startWdIndex = b;
              }
              wdLen++;
            }
          }
          if (type == "row") {
            //行
            this.rowChecked = true;
            this.allColsData[index].position = 2;

            if (wdLen == 0) {
              // 如果列没有维度
              data.unshift({ ...this.allColsData[index] });
            } else {
              data.splice(wdLen, 0, { ...this.allColsData[index] });
            }

            elementType = 1;
            checkType = "wdCheckAll";
          } else {
            //列

            // 如果行已经拖过度量，则弹出提示
            var rowData = this.cur_rowData;
            var breakFlag = false;
            for (var iRowData = 0; iRowData < rowData.length; iRowData++) {
              if (rowData[iRowData].element_type == 2) {
                breakFlag = true;
                break;
              }
            }

            if (breakFlag) {
              this.allColsData[index].position = 1;
              rowData.push(this.allColsData[index]);
              elementType = 2;
              checkType = "dlCheckAll";
              for (let a = 0; a < this.allColsData.length; a++) {
                if (this.allColsData[a].element_type == elementType) {
                  elements++;
                  if (this.allColsData[a].tbSelected) {
                    curElements++;
                  }
                }
              }
              if (elements != 0 && elements == curElements) {
                this[checkType] = true;
              }
              return;
            }

            let startDlIndex = -1;
            if (wdLen == 0) {
              startDlIndex = 0;
            } else {
              startDlIndex = wdLen;
            }

            let startIndex = -1;
            let dlLen = 0;
            for (let i = 0; i < this.cur_colData.length; i++) {
              let dataCur = this.cur_colData[i];
              if (dataCur.element_type == 2) {
                if (startIndex == -1) {
                  startIndex = i;
                }
                dlLen++;
              }
            }

            let startColIndex = -1;

            if (startIndex != -1) {
              startColIndex = startIndex + dlLen;
            } else {
              startColIndex = startDlIndex;
            }

            this.allColsData[index].position = 2;
            this.cur_colData.splice(startColIndex, 0, {
              ...this.allColsData[index]
            });
            this.colChecked = true;
            elementType = 2;
            checkType = "dlCheckAll";
          }
          const add_data = {
            data: { ...this.allColsData[index] },
            type: "add"
          };
          this.upTableCols(add_data);
        } else if (JSON.stringify(this.cur_colData).indexOf(id) > -1) {
          this.$message.warning("字段已存在");
        }
        for (let s = 0; s < this.allColsData.length; s++) {
          if (this.allColsData[s].element_type == elementType) {
            elements += this.allColsData[s].isNewCol ? 0 : 1; //分层级的日期字段，不加入字段总计
            if (this.allColsData[s].tbSelected) {
              curElements++;
            }
          }
        }
        if (elements != 0 && elements == curElements) {
          this[checkType] = true;
        }
      } else {
        //条件区域
        const reg = /\([Y|M|D|H|I|S]*\)/g;
        let id = this.allColsData[index].id.replace(reg, "");
        if (
          obj.target.className.indexOf("selected") == -1 &&
          ((this.allColsData[index].col_type == "dat" &&
            this.allColsData[index].isNewCol) ||
            this.allColsData[index].col_type != "dat") &&
          JSON.stringify(this.cur_condiData).indexOf(id) == -1
        ) {
          if (this.cur_condiData.length < 10) {
            this.allColsData[index].selected = true;
            this.allData[index].selected = true;
            if (type == "row") {
              //维度
              this.rowChecked = true;
            } else {
              //度量
              this.colChecked = true;
            }
            const data = objDeepCopy(this.allColsData[index]);
            this.cur_condiData.push(data);
            const add_data = { data: data, type: "add" };
            this.upCondiData(add_data);
          } else {
            this.$message.warning("查询条件不得超过10个！");
          }
        } else if (JSON.stringify(this.cur_condiData).indexOf(id) > -1) {
          this.$message.warning("条件已存在");
        }
      }
    },
    dragStart(nv) {
      this.cur_rowDataBak = JSON.parse(JSON.stringify(this.cur_rowData));
      this.cur_colDataBak = JSON.parse(JSON.stringify(this.cur_colData));
    },
    allow(ev) {
      if (ev.from.className === "col-block") {
        let flag = false;
        let mes = "条件已存在";
        let mesFlag = false;
        let type = "condi";
        if (["copy-condi", "query-condi"].includes(ev.to.className)) {
          const reg = /\([Y|M|D|H|I|S]*\)/g;
          let id = ev.draggedContext.element.id.replace(reg, "");
          flag = this.cur_condiData.some(val => val.id.replace(reg, "") === id);
        } else if (["query-filters", "copy-filter"].includes(ev.to.className)) {
          const reg = /\([Y|M|D|H|I|S]*\)/g;
          let id = ev.draggedContext.element.id.replace(reg, "");
          flag = this.cur_filterData.some(
            val => val.id.replace(reg, "") === id
          );
          mes = "数据过滤已存在";
          type = "filter";
        }
        if (flag) {
          mesFlag = this.allowEle[type] !== ev.draggedContext.element.id;
          if (mesFlag) {
            this.$message.warning(mes);
            this.allowEle[type] = ev.draggedContext.element.id;
          }
          return false;
        }
        if (this.cur_condiData.length >= 10) {
          mesFlag = this.allowEle[type] !== ev.draggedContext.element.id;
          if (mesFlag) {
            this.$message.warning("查询条件不得超过10个！");
            this.allowEle[type] = ev.draggedContext.element.id;
          }
          return false;
        }
      } else {
        if (ev.to.className === "col-block") {
          return false;
        } else {
          return null;
        }
      }
    },
    dragThrough(newIndex, flag, oldIndex) {
      let newData, bakData, position, oldData;
      if (flag == 2) {
        bakData = this.cur_rowDataBak;
        oldData = this.cur_rowData;
        newData = this.cur_colData;
        position = 2;
      } else {
        bakData = this.cur_colDataBak;
        newData = this.cur_rowData;
        oldData = this.cur_colData;
        position = 1;
      }

      let flagIndex = -1;
      for (let l = 0; l < newData.length; l++) {
        if (newData[l].id == bakData[oldIndex].id) {
          flagIndex = l;
          break;
        }
      }

      if (flagIndex != -1 && flagIndex != newIndex) {
        let tempNew = { ...newData[newIndex] };
        this.$set(newData, newIndex, newData[flagIndex]);
        this.$set(newData, flagIndex, tempNew);
      }

      if (newData[newIndex].element_type == 1) {
        newData[newIndex].position = position;
        // 维度拖到了度量之后,放到所有度量之前
        if (newIndex > 0 && newData[newIndex - 1].element_type == 2) {
          let len = newData.length;
          let start = -1;
          for (var i = 0; i < len; i++) {
            let data = newData[i];
            if (data.element_type == 2) {
              start = i;
              break;
            }
          }
          let tempNew2 = { ...newData[newIndex] };
          newData.splice(newIndex, 1);
          newData.splice(start, 0, tempNew2);
        }
      } else {
        // 度量拖到了维度之前，则放到所有维度之后
        let startIndex = -1;
        let len = 0;
        for (let o = 0; o < bakData.length; o++) {
          if (bakData[o].element_type == 2) {
            if (startIndex == -1) {
              startIndex = o;
            }
            len++;
          }
        }

        var temp = bakData.splice(startIndex, len);
        if (newData[newIndex + 1] && newData[newIndex + 1].element_type == 1) {
          var lens = 0;
          let lenL = newData.length;
          for (let g = 0; g < lenL; g++) {
            let data = newData[g];
            if (data.element_type == 1) {
              lens++;
            }
          }
          for (let f = 0; f < temp.length; f++) {
            temp[f].position = position;
          }

          let oldStartIndex = -1;
          let oldLens = 0;
          for (let h = 0; h < oldData.length; h++) {
            let data = oldData[h];
            if (data.element_type == 2) {
              if (oldStartIndex == -1) {
                oldStartIndex = h;
              }
              oldLens++;
            }
          }
          oldData.splice(oldStartIndex, oldLens);
          newData.splice(newIndex, 1);
          newData.splice(lens, 0, ...temp);
        } else if (
          (newIndex > 0 && newData[newIndex - 1].element_type == 1) ||
          newIndex == 0
        ) {
          // 度量拖到维度后面，或者拖动后只有度量
          let oldStartIndex = -1;
          let oldLens = 0;
          for (let d = 0; d < oldData.length; d++) {
            let data = oldData[d];
            if (data.element_type == 2) {
              if (oldStartIndex == -1) {
                oldStartIndex = d;
              }
              oldLens++;
            }
          }
          for (let e = 0; e < temp.length; e++) {
            temp[e].position = position;
          }
          oldData.splice(oldStartIndex, oldLens);
          newData.splice(newIndex, 1);
          newData.splice(newIndex, 0, ...temp);
        }
      }
    },
    addToFilter(nv, _idx) {
      const newIndex = nv.newIndex;
      // 清单查询聚合字段不能拖入
      let findex = nv.item.attributes.index.value;
      if(this.allColsData[findex].is_calcul!='0') {
        this.$message.warning('计算字段不能作为过滤条件');
        let id = this.allColsData[findex].element_id;
        for(let i=0;i<this.cur_filterData.length;i++){
          if(this.cur_filterData[i].element_id == id) {
            this.cur_filterData.splice(i,1);
          }
        }
        for(let i=0;i<this.filterData.length;i++){
          if(this.filterData[i].element_id == id) {
            this.filterData.splice(i,1);
          }
        }
        return;
      }

      let data = this.cur_filterData;
      let temp = data[nv.newIndex];

      if (_idx) {
        let flagIndex = -1;
        for (let i = 0; i < data.length; i++) {
          if (data[i].id == this.allColsData[_idx].id) {
            flagIndex = i;
            break;
          }
        }

        if (flagIndex != newIndex) {
          let temp1 = { ...data[newIndex] };
          this.$set(data, newIndex, { ...data[flagIndex] });
          this.$set(data, flagIndex, temp1);
        }
      }

      let len = 0;
      for (let i = 0; i < data.length; i++) {
        if (data[i].id == temp.id) {
          len++;
        }
      }
      if (len > 1) {
        data.splice(nv.newIndex, 1);
      }
    },
    reSort(nv) {
      let toClassName = nv.to.className;
      if (
        ["query-filters", "copy-filter", "copy-dragg", "query-drill"].includes(
          toClassName
        )
      ) {
        let dataResort = [];
        if (nv.from.className == "query-row") {
            dataResort = this.cur_rowData;
        } else if (nv.from.className == "query-col") {
            dataResort = this.cur_colData;
        }
        if (
          nv.to.className == "query-filters" ||
          toClassName == "copy-filter"
        ) {
          if (toClassName == "copy-filter") {
            this.cur_filterData.push(this.copyFilter[nv.newIndex]);
            nv.newIndex = this.cur_filterData.length - 1;
          }
            dataResort.splice(nv.oldIndex, 0, this.cur_filterData[nv.newIndex]);
          this.cur_filterData.splice(nv.newIndex, 1);
        } else {
          let key = 0;
          let topObj = this.cur_drillData[key];
          if (toClassName == "copy-dragg") {
            topObj.subDrill.push(this.copyDragg[nv.newIndex]);
            nv.newIndex = topObj.subDrill.length - 1;
          }
            dataResort.splice(nv.oldIndex, 0, topObj.subDrill[nv.newIndex]);
          topObj.subDrill.splice(nv.newIndex, 1);
        }
      }
      if (this.isDetail) {
        if (nv.from.className == "query-col") {
          if (toClassName == "copy-col") {
            let oldIndex = nv.oldIndex;
            let newIndex = nv.newIndex;
            this.cur_colData.splice(oldIndex, 0, { ...this.copyCol[newIndex] });
            return;
          }
        }
        return;
      }
      let data, bakData;
      if (nv.to.className == "query-row" || toClassName == "copy-row") {
        if (nv.from.className == "query-row") {
          if (toClassName == "copy-row") {
            let oldIndex = nv.oldIndex;
            let newIndex = nv.newIndex;
            this.cur_rowData.splice(oldIndex, 0, { ...this.copyRow[newIndex] });
            return;
          }
          data = this.cur_rowData;
          bakData = this.cur_rowDataBak;
          this.rePaint(nv, bakData, data);
          return;
        } else {
          // 列拖到行
          let newIndex = nv.newIndex;
          let oldIndex = nv.oldIndex;
          if (toClassName == "copy-row") {
            this.cur_rowData.push(this.copyRow[newIndex]);
            newIndex = this.cur_rowData.length - 1;
          }
          this.dragThrough(newIndex, 1, oldIndex);
        }
      } else if (nv.to.className == "query-col" || toClassName == "copy-col") {
        if (nv.from.className == "query-row") {
          // 行拖到列
          let newIndex = nv.newIndex;
          let oldIndex = nv.oldIndex;
          if (toClassName == "copy-col") {
            this.cur_colData.push(this.copyCol[newIndex]);
            newIndex = this.cur_colData.length - 1;
          }
          this.dragThrough(newIndex, 2, oldIndex);
        } else if (nv.from.className == "query-col") {
          if (toClassName == "copy-col") {
            let oldIndex = nv.oldIndex;
            let newIndex = nv.newIndex;
            this.cur_colData.splice(oldIndex, 0, { ...this.copyCol[newIndex] });
            return;
          }
          data = this.cur_colData;
          bakData = this.cur_colDataBak;
          this.rePaint(nv, bakData, data);
          return;
        }
      }
    },
    rePaint(nv, bakData, data) {
      let newIndex = nv.newIndex;
      // 维度拖到了度量后面
      if (
        data[newIndex].element_type == 1 &&
        newIndex > 0 &&
        data[newIndex - 1].element_type == 2
      ) {
        let startDlIndex1 = -1;
        for (let i = 0; i < bakData.length; i++) {
          if (bakData[i].element_type == 2) {
            startDlIndex1 = i;
            break;
          }
        }
        let temp = { ...data[newIndex] };
        data.splice(newIndex, 1);
        data.splice(startDlIndex1 - 1, 0, temp);
      } else if (
        data[newIndex].element_type == 2 &&
        data[newIndex + 1] &&
        data[newIndex + 1].element_type == 1
      ) {
        // 度量拖到了维度前面
        var startDlIndex = -1;
        for (let i = 0; i < bakData.length; i++) {
          if (bakData[i].element_type == 2) {
            startDlIndex = i;
            break;
          }
        }
        let temp = { ...data[newIndex] };
        data.splice(newIndex, 1);
        data.splice(startDlIndex, 0, temp);
      }

      if (nv.to.className == "query-row") {
        this.cur_rowData = data;
      } else {
        this.cur_colData = data;
      }
    },
    /** 更新 */
    updataTable() {
      if (this.reportLoading) {
        return;
      }
      if (this.cur_colData.length == 0 && this.cur_rowData == 0) {
        return;
      }
      if (document.querySelector("td.current") === null) {  //未选中单元格
        this.$message.warning('未选中单元格');
        return;
      }

      this.resetReportLoading(true);
      this.resetFilter();

      //重叠区域刷新
      let repeatArea = HST.areaRepeat();
      const index = HST.searchCurSheet().index
      const areaList = (this.edcuiCompts[1].comptAttrs.tableList[index]||{}).area_info;
      let sub_index, cur_index;
      for (sub_index in areaList) {
        if (areaList[sub_index].area_id == this.areaInfo.area_id) {
          cur_index = sub_index;

          break;
        }
      }
      if (repeatArea.length > 0) {
        let r_area = repeatArea
            .filter(
              val => val.split(",").indexOf(areaList[sub_index].area_name) > -1
            )
            .join(",")
            .split(","),
          r_num = r_area.filter(
            (item, index1) => r_area.indexOf(item) === index1 && item != ""
          );
        this.upRefreshNum(r_num);
        let count = 0;
        for (sub_index in areaList) {
          if (
            !!this.areaInfo.area_name &&
            areaList[sub_index].area_name !== this.areaInfo.area_name &&
            r_num.indexOf(areaList[sub_index].area_name) > -1
          ) {
            count++;
            this.updata(areaList[sub_index], sub_index);
          }
          if (count == r_num.length) {
            break;
          }
        }
      } else {
        this.upRefreshNum(-1);
      }
      this.updata(undefined, cur_index, false, areaList);
    },
    updata(areaInfo, sub_index, resume = false, areaList = []) {
      const curSheet = HST.searchCurSheet(),
        index = curSheet.index,
        sheetIndex = curSheet.sheetIndex;
      let af_col,
        af_row,
        query_type,
        filterData,
        needTitle,
        hideDim,
        drillData,
        hiddenDimList,
        countDataField,
        needTotal,
        selectCount,
        autoMerge,
        area_id,
        subStyleList,
        cur_areaName,
        needBorder,
        autofill,
        computedData,
        rename
      if (!!areaInfo) {
        af_col = areaInfo.af_col;
        af_row = areaInfo.af_row;
        query_type = areaInfo.query_type;
        filterData = [...areaInfo.filterData];
        needTitle = areaInfo.needTitle;
        hideDim = areaInfo.hideDim;
        drillData = areaInfo.drillData;
        hiddenDimList = areaInfo.hideDim ? areaInfo.hiddenDimList : [];
        countDataField = areaInfo.countDataField;
        needTotal = areaInfo.needTotal;
        selectCount = areaInfo.selectCount;
        autoMerge = areaInfo.autoMerge;
        subStyleList = areaInfo.subStyleList;
        needBorder = areaInfo.needBorder;
        area_id = areaInfo.area_id;
        autofill = { ...areaInfo.autofill };
        computedData = areaInfo.computedData || [];
        rename = areaInfo.rename || false;
      } else {
        af_col = [...this.cur_colData];
        af_row = [...this.cur_rowData];
        query_type = this.polymerizeType;
        filterData = [...this.filterData];
        needTitle = !this.hideTitle;
        hideDim = this.hideDim;
        drillData = this.cur_drillData;
        hiddenDimList = this.hideDim ? this.hiddenDims : [];
        countDataField = this.countDataField || "";
        needTotal = this.isTotalCount;
        selectCount = this.selectCount;
        autoMerge = this.autoMerge;
        area_id = this.areaInfo.area_id;
        subStyleList = { ...this.subStyleList };
        cur_areaName = this.areaInfo.area_name;
        needBorder = this.needBorder;
        autofill = { ...this.autofill };
        computedData = this.activedArea.computedData || [];
        rename = this.rename.show;
      }
      if(this.activedArea.af_Id && this.activedArea.rename){
        let paramList = af_col.concat(af_row);
        let nameList = this.activedArea.af_col.concat(this.activedArea.af_row);
        nameList.forEach(val=>{
          if(val.nick_name){
            for(let item of paramList){
              if(item.element_id === val.element_id){
                item.nick_name = val.nick_name;
                break;
              }
            }
          }
        })
      }
      let param = {
        colParam: af_col,
        rowParam: af_row,
        needTitle: needTitle,
        filterData: filterData,
        drillData: drillData,
        query_type: query_type,
        hiddenDimList: hiddenDimList,
        countDataField: countDataField,
        needTotal: needTotal,
        needSubTotal: selectCount,
        autoMerge: autoMerge,
        autofill: autofill,
        condiParam: { sheet: sheetIndex, area: area_id },
        computedData,
        rename
      };
      this.queryUpdataTable(param)
        .then(response => {
          let params = {
            af_col: af_col,
            af_row: af_row,
            query_type: query_type,
            filterData: filterData,
            needTitle: needTitle,
            hideDim: hideDim,
            drillData: drillData,
            hiddenDimList: hiddenDimList,
            countDataField: countDataField,
            needTotal: needTotal,
            selectCount: selectCount,
            autoMerge: autoMerge,
            response: response,
            area_id: area_id,
            subStyleList: subStyleList,
            cur_areaName: cur_areaName,
            needBorder: needBorder,
            autofill: autofill,
            computedData: param.computedData,
            rename: rename
          };
          if (!!areaInfo) {
            params = {
              ...params,
              ...{
                index: index,
                areaIndex: sub_index,
                start_x: areaInfo.start_x,
                start_y: areaInfo.start_y,
                resume
              }
            };
          } else {
            //添加到历史记录
            let list = [],
              colLen = 0,
              rowLen = 0;
            try {
              list = response.data.respData.result_data_list;
              rowLen = list.length;
              colLen = list[0].data_list.length;
            } catch (e) {}
            let newVal = { ...params };
            newVal.area_name = newVal.cur_areaName;
            delete newVal.cur_areaName;
            delete newVal.response;
            if (!!areaList[sub_index]) {
              newVal = {
                ...newVal,
                start_x: areaList[sub_index].start_x,
                start_y: areaList[sub_index].start_y,
                af_Id: areaList[sub_index].af_Id
              };
            }
            newVal.end_x = newVal.start_x + rowLen - 1;
            newVal.end_y = newVal.start_y + colLen - 1;
            let history = {
              type: "updateArea",
              index,
              sub_index,
              newVal,
              condiData: {
                origVal: [],
                newVal: []
              },
              datasets: {
                origVal: [],
                newVal: []
              }
            };
            if (sub_index !== undefined) {
              //非新区域加载，记录区域原始配置
              history.origVal = (this.edcuiCompts[1].comptAttrs.tableList[index] || {}).area_info[sub_index];
              delete history.origVal["cellList"];
            } else if (!!this.areaInfo.area_id) {
              //记录静态数据

              let [row, col] = this.hot.getSelected()[0];
              history.cells = [[row, col, row + rowLen, col + colLen]];
              history.staticData = [
                this.hot.getSourceData(row, col, row + rowLen, col + colLen)
              ];
            }
            //条件记录
            if (this.edcuiCompts[0].comptAttrs.fieldList.length > 2) {
              history.condiData.newVal = objDeepCopy(
                this.edcuiCompts[0].comptAttrs.fieldList
              );
              if (this.historyData.length === 0) {
                this.origCondiData = objDeepCopy(
                  this.edcuiCompts[0].comptAttrs.fieldList
                );
              }
              history.condiData.origVal = objDeepCopy(this.origCondiData);
              this.origCondiData = objDeepCopy(
                this.edcuiCompts[0].comptAttrs.fieldList
              );
              history.datasets.newVal = objDeepCopy(this.datasets);
              history.datasets.origVal = objDeepCopy(
                this.edcuiCompts[0].datasets
              );
            }

            this.upHistoryData(history);
          }
          if (this.tempData.length > 0) {
            let lastData = this.tempData[this.tempData.length - 1];
            let key = Object.keys(lastData);
            if (key.length === 1 && key[0] === "params") {
              this.tempData[this.tempData.length - 1] = params;
            } else {
              this.tempData.push(params);
            }
          } else {
            this.tempData.push(params);
          }
          if (
            !!!this.areaInfo.area_name ||
            this.refreshNum == -1 ||
            this.refreshNum.length <= this.tempData.length
          ) {
            for (let y = 0; y < this.tempData.length; ) {
              let dataItem = this.tempData[y];
              if (dataItem.area_id != this.areaInfo.area_id) {
                this.setAreaData(dataItem);
                this.tempData.splice(y, 1);
              } else {
                y++;
              }
            }
            this.upLoadingEnd(true);
            this.setAreaData(...this.tempData);
            this.upTempData([]);
            // this.resetReportLoading(false)
            // this.upLoadingEnd(true)
            this.upTempRefreshNum(0);
          }
          this.resetFields();
        })
        .catch(e => {
          // this.$message.error("更新失败");
          this.upHistoryData({ type: "delete" });
          console.error(e);
          this.resetReportLoading(false);
        });
    },
    resetFields() {
      this.allColsData.forEach(item => {
        // delete item.position;
        item.element_type == 2 && delete item.sort;
      });
    },
    /** 刷新全部 */
    updataAllTables() {
      const index = HST.searchCurSheet().index;
      let data = this.edcuiCompts[1].comptAttrs.tableList[index];
      let cellData = [];
      let isQuery = this.isQuery("1003");
      if (!isQuery) {
        this.$message.warning("必填字段不能为空");
      }
      data.area_info.map(areaInfo => {
        cellData.push([
          areaInfo.start_x,
          areaInfo.start_y,
          areaInfo.end_x,
          areaInfo.end_y
        ]);
      });
      if (cellData.length > 0) {
        HST.resetCellsData(cellData);
      }
      this.updateSheetDataSet(index);
    },
    /** 清除 */
    deleteTable() {
      const sheetArray = HST.searchCurSheet(),
        index = sheetArray.index;
      let sub_index = HST.searchCurArea(index),
        afId = this.edcuiCompts[0].afId,
        res = {},
        tableList = this.edcuiCompts[1].comptAttrs.tableList,
        condiMap = objDeepCopy(this.edcuiCompts[0].datasets || []),
        condiData = [];

      if (sub_index != -1) {
        res = { ...tableList[index].area_info[sub_index] };
        this.deleteArea({ index, sub_index });
      } else {
        let reset_data = { data: [], type: "reset" };
        this.upTableCols(reset_data);
      }
      this.dropCharts();
      let len = 0,
        val = this.value;
      tableList.forEach((list, idx) => {
        let counts = list.area_info.filter(item => item.af_Id == val);
        if (counts.length != 0) {
          len += counts.length;
        }
      });
      if (len == 0) {
        let ds = this.areaTablesData;
        condiData = objDeepCopy(this.edcuiCompts[0].comptAttrs.fieldList);
        for (let i = 0; i < ds.length; i++) {
          if (ds[i].datasetId == afId) {
            ds.splice(i, 1);
            this.edcuiCompts[0].afId = "";
            this.cur_condiData.splice(0, this.cur_condiData.length);
            this.edcuiCompts[0].datasets = [];
            break;
          }
        }
      }
      this.cur_filterData.splice(0, this.cur_filterData.length);
      this.upFilterData({ data: [], type: "reset" });
      this.resetUpdataSign();

      let history = {
        type: "dropArea",
        areaInfo: res,
        index,
        sub_index,
        datasets: {
          newVal: this.datasets,
          origVal: condiMap
        }
      };
      if (len == 0) {
        history.condiData = {
          origVal: condiData,
          newVal: []
        };
      }
      this.upHistoryData(history);
    },
    resetFilter() {
      let index = HST.searchCurSheet().index;
      let areaInfo = this.edcuiCompts[1].comptAttrs.tableList[index];
      areaInfo.show_filter = false;
      this.upShowFilter(false);
      this.hot.updateSettings({
        filters: false,
        dropdownMenu: false
      })
    },
    ...mapGetters({
      datafilterCols: "QueryTable/datafilterCols"
    }),
    ...mapMutations({
      upDatasets: "ReportAttr/upDatasets",
      upActiveName2: "ReportAttr/upActiveName2",
      upComptNum: "ReportAttr/upComptNum",
      upFilterData: "ReportAttr/upFilterData",
      upTableCols: "ReportAttr/upTableCols",
      upCondiData: "ReportAttr/upCondiData",
      filterCols: "ReportAttr/filterCols",
      upAllCols: "ReportAttr/upAllCols",
      upDatasetName: "ReportAttr/upDatasetName",
      upLoading: "compt/upLoading",
      upBatchDialog: "QueryTable/upBatchDialog",
      upIsChangeCalc: "QueryTable/upIsChangeCalc",
      setQueryType: "QueryTable/setQueryType",
      resetTableData: "ReportAttr/resetTableData",
      upAreaInfo: "ReportAttr/upAreaInfo",
      resetUpdataSign: "ReportAttr/resetUpdataSign",
      upTableList: "ReportMgt/upTableList",
      resetReportLoading: "ReportMgt/resetReportLoading",
      upEdcuiCompts0: "ReportMgt/upEdcuiCompts0",
      upRefreshNum: "ReportMgt/upRefreshNum",
      upTempData: "ReportMgt/upTempData",
      upTempRefreshNum: "ReportMgt/upTempRefreshNum",
      upLoadingEnd: "ReportMgt/upLoadingEnd",
      upHistoryData: "ReportMgt/upHistoryData",
      setDatasetType: "DataSetDesign/setDatasetType",
      upShowFilter: "ReportMgt/upShowFilter"
    }),
    ...mapActions({
      upTableCols: "ReportAttr/upTableCols",
      upDatasets: "ReportAttr/upDatasets",
      upFilterData: "ReportAttr/upFilterData",
      upActiveName2: "ReportAttr/upActiveName2",
      filterCols: "ReportAttr/filterCols",
      upCondiData: "ReportAttr/upCondiData",
      upDatasetName: "ReportAttr/upDatasetName",
      upLoading: "compt/upLoading",
      upIsChangeCalc: "QueryTable/upIsChangeCalc",
      queryAfPropertyData: "QueryTable/queryAfPropertyData",
      upAllCols: "ReportAttr/upAllCols",
      queryUpdataTable: "ReportMgt/queryUpdataTable",
      setAreaData: "ReportMgt/setAreaData",
      resetReportLoading: "ReportMgt/resetReportLoading",
      deleteArea: "ReportMgt/deleteArea",
      updateSheetDataSet: "ReportMgt/updateSheetDataSet",
      queryDbColConf: "DataSetDesign/queryDbColConf", //查询数据库字段类型
      getDataSetInfo: "DataSetDesign/getDataSetInfo", //查询数据集信息
      getDataSetList: "DataSetDesign/getDataSetList",
      queryDateFormatList: "DataSetDesign/queryDateFormatList", //查询日期源格式
      setDataSetCache: "DataSetMgt/setDataSetCache",
      setDatasetType: "DataSetDesign/setDatasetType"
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
$main-bg: #2f5377; //设计区域背景色
$main-bg-design: #aaaaaa; // 设计区域背景色
$bg-clr1: #e4e7ee;
$main-bg1: #fff; // 设计区域内层背景
$font-main: #ffffff; //文字主色
$font-main2: #afc0d0;
$font-main3: #606266;
$border-clr2: #0a2b4c;
$border-clr1: #0e3b67; // 输入框边框色
$border-clr3: #498bce;
$input-bg-clr1: #0e3b67; // 输入框背景色
$hight-light-clr1: #45fffd; //高亮颜色
$main-color: #409eff; //主色调
$font-clr1: #fff; // 文字颜色1
$header-main-clr: #0a2b4c; // 头部背景色
$border-clr1: #0e3b67; // 输入框边框色
$font-clr2: #3f678d; // 输入框字体颜色
$icon-btn-disabled: #c0c4cc; //字体图标操作按钮禁用
$bd-clr1: #dcdfe6;

$icon-clr: #409eff; //操作图标颜色
$hover-clr: #409eff; //鼠标经过颜色
$bg-clr1: #e4e7ee;
$bdr-clr1: #0b2c4d;
$bdr-clr2: #aaff45;
.rf-aside-title {
  position: absolute;
  height: 40px !important;
  background-color: $border-clr1;
  padding-left: 10px;
  color: $font-main;
  font-size: 16px;
  line-height: 40px;
  z-index: 1;
}
.aside-left {
  border-right: 1px solid $border-clr1;
  background-color: $main-bg;
  padding: 10px;
  padding-right: 0;
  overflow-y: hidden;
  .setting-wrap {
    width: auto;
    float: right;
    font-size: 12px;
    padding-right: 13px;
    cursor: pointer;
  }
}
.aside-main {
  background-color: $main-bg;
}
.as-title {
  color: $font-main;
  text-align: center;
  height: 14px;
  line-height: 14px;
}
.aside-main {
  padding: 10px;
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
  color: $main-color;
  margin-right: 5px;
}
.main-content-tool .tool-btn .tool-btn-text {
  position: relative;
  top: -1px;
}
.attrSet {
  height: 100%;
  background: $main-bg;
  /deep/.el-main {
    height: 100%;
  }
  /* b标签切换 */
  /deep/.tabcard {
    &.el-tabs--border-card {
      height: 100%;
      background: transparent;
      border: none;
    }
    & > .el-tabs__header {
      height: 40px;
      padding-top: 10px;
      border: none;
    }
    .el-tabs__content {
      height: calc(100% - 40px);
      padding: 0;
    }
    .el-tabs__item {
      height: 31px;
      line-height: 30px;
      padding: 0 15px;
      border: none;
    }
    .el-tabs__item.is-active {
      border: none;
      border-radius: 2px 2px 0 0;
    }
    .el-tabs__nav-scroll {
      padding-left: 225px;
    }
  }

  /deep/.el-tag {
    width: 100%;
    height: 28px;
    line-height: 26px;
    margin-top: 10px;
    font-size: 12px;
    cursor: move;
    background: transparent;
    border-color: $hight-light-clr1;
    color: $font-main2;
    > span > i {
      height: 26px;
      display: inline-block;
      vertical-align: middle;
      line-height: 26px;
    }
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
  /deep/ .col-subtitle {
    margin-bottom: 5px;
  }
  /deep/.el-row-12 {
    height: calc(50%);
    padding-bottom: 10px;
  }
  .col-block span {
    font-size: 12px;
  }
  .col-title {
    color: $hight-light-clr1;
  }
  .col-title label {
    padding-left: 5px;
  }
  .col-subtitle {
    font-size: 12px;
    height: 25px;
    line-height: 25px;
  }
  /deep/.col-subtitle .el-checkbox {
    float: right;
  }
  .col-wrap {
    height: calc(100% - 19px);
  }
  .cols-item {
    height: calc(100% - 25px);
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
    padding-right: 10px;
    cursor: pointer;
  }
  /deep/.up-button {
    bottom: 10px;
    position: absolute;
    width: calc(50% - 20px);
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
    right: 5px;
    top: 0;
    transform: scale(0.6);
    cursor: pointer;
  }
  .sort-icon i:last-child {
    top: 6px;
  }
  .condi-wrap {
    height: calc(40% - 19px);
    width: 100%;
  }
  .table-wrap {
    /* height: 100%; */
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
    width: calc(100% - 52px);
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
      overflow: hidden;
    }
  }
  .aside-left .el-row .el-col {
    border: none !important;
    color: $main-color;
    span {
      font-size: 12px;
      margin-right: 3px;
      text-align: left;
    }
    &:nth-child(2n) {
      text-align: right;
      color: $font-main2;
    }
    &.co-highlight {
      color: $hight-light-clr1;
      > em > span:last-child {
        font-size: 14px;
      }
    }
  }
  .aside-left {
    .as-title {
      margin-bottom: 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding-right: 10px;
    }
  }
  /deep/ .hiddenDims .el-tag {
    border-color: $border-clr2;
    height: 20px;
    line-height: 17px;
    background: $font-main2;
    color: $border-clr2;
  }
  /deep/ .hiddenDims .el-tag {
    margin-top: 2px;
  }
  /deep/ .el-tag > span > i.rp-had-elcas {
    margin-right: 5px;
    height: 14px;
    line-height: 14px;
    margin-top: -3px;
    width: 14px;
    text-align: center;
    color: $main-color;
    cursor: pointer;
    &.active {
      background-color: $main-color;
      color: $border-clr1;
      /* color: #999; */
    }
  }
  /deep/ .el-tag > span > i.rp-elcas {
    margin-right: 5px;
    height: 14px;
    line-height: 14px;
    margin-top: -3px;
    width: 14px;
    text-align: center;
    &.active {
      background-color: $main-color;
      /* color: $header-main-clr; */
      color: $border-clr1;
      /* color: #999; */
    }
  }
}
.datas-opt {
  position: absolute;
  bottom: 0px;
  width: 100%;
  z-index: 999;
  padding-right: 18px;
  margin: 0;
  height: 34px;
  line-height: 35px;
  border-bottom-left-radius: 3px;
  border-bottom-right-radius: 3px;
  background-color: $bg-clr1;
}

.main-content-tool .tool-btn:hover .tool-btn-text {
  color: $hover-clr;
}
.item-block .sub-nav-title {
  color: $font-clr1;
}
.input-search {
  margin-bottom: 10px;
}
/* .as-col-wrap { */
/* border-bottom: 1px dashed $border-clr2; */
.split-bottom {
  height: 1px;
  width: calc(100% - 10px);
  display: block;
  border-bottom: 1px dashed $border-clr2;
}
.as-col-wrap {
  margin-bottom: 20px;
}
/* } */
.aside-left /deep/ .el-scrollbar__view {
  /* height: 100%; */
}
.table-other-wrap {
  /* height: 60%; */
  padding-top: 12px;
}
.r-attrs {
  height: calc(100% - 100px);
}
.co-together-method {
  margin-top: 5px;
  /deep/ .el-radio__inner::after {
    /* background: $main-color; */
    width: 6px;
    height: 6px;
  }
  /deep/ .el-radio__inner {
    background: $input-bg-clr1;
    border-color: $bdr-clr1;
  }
  /deep/ .el-radio {
    color: $font-main2;
  }
  /deep/ .el-radio__label {
    font-size: 12px;
  }
  /deep/ .el-radio__input.is-checked .el-radio__inner {
    background: $main-color;
    border-color: $main-color;
  }
  /deep/ .el-radio__input.is-checked + .el-radio__label {
    /* color: $font-main2; */
  }
}
.data-filter-wrap {
  margin-top: 15px;
  > .el-row {
    padding-right: 10px;
  }
}
.aside-main /deep/,
.aside-left /deep/,
.senior /deep/ {
  .el-checkbox {
    margin-right: 0;
  }
  .el-checkbox__inner {
    border-color: $bdr-clr1;
    background: $input-bg-clr1;
  }
  .el-checkbox__label {
    font-size: 12px;
    color: $font-main2;
  }
  .el-radio__input.is-checked .el-radio__inner,
  .el-checkbox__input.is-checked .el-checkbox__inner {
    background: $main-color;
    border-color: $main-color;
  }
}
.aside-main /deep/,
.aside-left /deep/ {
  .el-checkbox__input.is-checked + .el-checkbox__label {
    color: $main-color;
  }
}
.as-footer {
  height: 59px;
  padding: 20px 10px 20px 0;
  text-align: center;
  .el-button,
  /deep/.el-button--primary {
    color: $main-color;
    background: $main-bg1;
    border-color: $bd-clr1;
  }
  /deep/.disabled .el-button-group {
    button {
      cursor: not-allowed;
    }
  }
}
.opt-btn {
  cursor: pointer;
}
.sort-wrap {
  width: 12px;
  height: 20px;
  display: inline-block;
  vertical-align: middle;
  margin-top: -4px;
  i {
    font-size: 12px;
    height: 8px;
    margin-bottom: 1px;
    display: block;
    width: 12px;
    color: $font-main2;
    cursor: pointer;
  }
}
.calc-selected {
  color: $main-color;
}
.calcList li {
  line-height: 22px;
  cursor: pointer;
}
.calc {
  cursor: pointer;
}
.sort-wrap i.sort-selected {
  color: $hover-clr;
}
.dl_col .sort-wrap i.sort-selected {
  color: $hover-clr;
}
.hide {
  visibility: hidden;
}
.el-radio-group .calc-icon {
  font-size: 12px;
  margin-left: -25px;
  margin-right: 25px;
  cursor: pointer;
}
.hiddenDims {
  margin-top: 4px;
}
.hiddenDims /deep/ .el-select__tags {
  /* height: 26px;
  overflow-y: auto; */
}
.hiddenDims /deep/ {
  .el-select__tags-text {
    max-width: 50px;
    display: inline-block;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  .el-tag__close.el-icon-close {
    top: -4px;
    border-radius: 0;
    background: $border-clr2;
    color: $font-main2;
  }
  .el-tag {
    width: auto;
  }
  .el-tag__close.el-icon-close {
    right: -3px;
  }
}
.triggle {
  margin-top: 10px;
  height: 28px;
  line-height: 26px;
  display: block;
  font-size: 16px;
  text-align: center;
  border: 1px solid $font-main2;
  color: $font-main2;
  margin-right: 5px;
  border-radius: 4px;
  &:hover {
    border-color: $main-color;
    color: $main-color;
  }
  span {
    margin: 0 !important;
  }
  &:active {
    color: $main-color;
  }
}
.drill {
  padding-right: 10px;
}
.drill-tag .col-span {
  width: calc(100% - 22px);
}
.drill-tag .delete-tag {
  display: none;
  float: right;
  height: 28px;
  line-height: 28px;
  color: $font-main2;
}
.drill-tag:hover .delete-tag {
  display: inline-block;
}
.rp-elcas {
  cursor: pointer;
}
.drill-wrap {
  margin-bottom: 0;
}
.sub-drill .el-tag {
  margin-top: 5px;
}
.as-footer /deep/ .el-dropdown__caret-button {
  height: 28px;
}
.total-count {
  padding-right: 10px;
  display: block;
  margin-top: 4px;
  margin-bottom: 10px;
}
.copy-dragg,
.copy-row,
.copy-col,
.copy-filter,
.copy-condi {
  position: absolute;
  left: 0;
  right: 0;
  height: 28px;
  bottom: 0;
}
.form {
  /deep/.el-form-item {
    width: 320px;
    margin: auto;
  }
}
.senior {
  padding: 10px;
  padding-top: 0;
  padding-left: 20px;
  .as-title {
    width: 50%;
    height: 24px;
    padding: 10px;
    padding-bottom: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .co-highlight {
    color: $hight-light-clr1;
    height: 22px;
    margin: 10px 0;
    > span {
      font-size: 12px;
      margin-right: 3px;
      text-align: left;
    }
  }
}
.senior-wrap {
  /deep/.el-checkbox {
    margin-bottom: 10px;
    display: table;
  }
  /deep/.el-checkbox__label {
    font-size: 12px;
    color: $font-main2;
  }
  span[class^="icon-"] {
    cursor: pointer;
    font-size: 12px;
    margin-right: 3px;
    text-align: left;
    color: $font-main2;
  }
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
<style lang="scss">
.el-select-dropdown.is-multiple .el-select-dropdown__item {
  padding-right: 40px;
}
</style>
