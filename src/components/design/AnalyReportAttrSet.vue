<template>
  <div class="attrSet" :id="pageCache.classTypeId=='1005'?'big-screen':''">
    <div class="nav-title">{{comptTitle}}</div>
    <el-tabs type="border-card" v-model="activeName" class="tabcard" @tab-click="handleClick">
      <el-tab-pane
        label="数据"
        name="attr"
        style="height:100%;"
        v-if="activeComp.comptAttrs && activeComp.comptAttrs.isBindData == '1'"
        key="attr-pane"
        ref="rightPane"
      >
        <el-row
          class="el-row-24"
          v-show="activeComp.comptAttrs && activeComp.comptAttrs.isBindData == '1'"
        >
          <el-col :span="11">
            <div class="grid-content bg-purple">
              <el-row class="table-wrap">
                <el-scrollbar style="height:100%;" :native="false" :noresize="false" tag="section">
                  <div v-if="activeComp.type=='Query'||activeComp.type=='MobileQuery'">
                    <div class="col-title">
                      <span class="icon-A10429_orders"></span>
                      <label>查询字段</label>
                      <div class="col-setting" @click="openCondiSet">
                        <span class="icon-A10344_setting"></span>
                        字段设置
                      </div>
                    </div>
                    <draggable
                      :list="selectedQueryData"
                      class="query-table"
                      style="margin-bottom:0;padding-right: 3px;"
                      @add="addToArea"
                      filter=".default-tag"
                      :options="{group:'people'}"
                      :move="itemOnMove"
                      @sort="fieldRecord"
                    >
                      <el-tag
                        v-for="item in selectedQueryData"
                        v-bind:class="{dl_col:item.element_type != 1?true:false}"
                        v-bind:key="item.id"
                      >
                        <span class="col-span">
                          <span>{{item.col_type}}</span>
                          <span :title="item.element_name">{{ item.element_name }}</span>
                        </span>
                        <span style="float:right">
                          <el-tooltip effect="dark" content="删除" placement="top-start">
                            <i class="opt-btn el-icon-delete" @click="deleteItem(item,'query')"></i>
                          </el-tooltip>
                        </span>
                      </el-tag>
                    </draggable>
                    <div style="margin-bottom:10px;" class="pr3">
                      <draggable
                        :list="draggableTempData"
                        class="query-table default-wrap"
                        @add="itemOnadd"
                        filter=".default-tag"
                        :options="{group:'people'}"
                        @sort="fieldRecord"
                      ></draggable>
                      <div class="default-tag">拖动右侧字段至此</div>
                    </div>
                  </div>
                  <div v-else :class="{'big-screen':pageCache.classTypeId=='1005'}">
                    <!-- 钻取维度 curComptDataAuth.isDrill == 1 -->
                    <div class="col-title" v-show="isShowDrillDim">
                      <span class="icon-A10429_orders"></span>
                      <label>钻取维度</label>
                    </div>
                    <div
                      class="drill aside-left"
                      v-for="(drill, index) in selectedDrillData"
                      :id="index"
                      :key="drill.element_name"
                      style="margin-bottom:0px;"
                      v-show="isShowDrillDim && index == 0"
                    >
                      <el-row>
                        <el-col :span="4" style="padding:0px">
                          <a href="javascript:;" class="triggle" @click="triggleExp">
                            <span
                              v-bind:class="{'icon-A10011_triangleRight': (activeComp.comptAttrs.dillExpand != undefined && !activeComp.comptAttrs.dillExpand), 'icon-A10009_triangleDown':(activeComp.comptAttrs.dillExpand || activeComp.comptAttrs.dillExpand == undefined)}"
                            ></span>
                          </a>
                        </el-col>
                        <el-col :span="20" style="padding:0px">
                          <el-tag class="drill-tag">
                            <span class="col-span">
                              <!-- <span>{{drill.col_type}}</span> -->
                              <span :title="drill.element_name">{{ drill.element_name }}</span>
                            </span>
                            <span style="float:right">
                              <!-- 地图、区域地图中的维度不展示升序降序-->
                              <!-- 钻取先隐藏排序 -->
                              <!-- <span class="sort-icon" v-show="!['VeMap','VeAreaMap'].includes(curComptDataAuth.type)">
                                <el-tooltip effect="dark" content="升序" placement="top-start">
                                  <i
                                    class="icon-A10012_triangleEqualUp"
                                    :class="drill.sort == 1 ? 'selected':''"
                                    @click="setSort(drill,2,1)"
                                  ></i>
                                </el-tooltip>
                                <el-tooltip effect="dark" content="降序" placement="top-start">
                                  <i
                                    class="icon-A10013_triangleEqualDown"
                                    :class="drill.sort == 2 ? 'selected':''"
                                    @click="setSort(drill,2,2)"
                                  ></i>
                                </el-tooltip>
                              </span>-->
                              <el-tooltip effect="dark" content="删除" placement="top-start">
                                <i class="opt-btn el-icon-delete" @click="deleteItem(drill,2)"></i>
                              </el-tooltip>
                            </span>
                          </el-tag>
                        </el-col>
                      </el-row>

                      <div
                        v-show="activeComp.comptAttrs.dillExpand || activeComp.comptAttrs.dillExpand == undefined"
                      >
                        <draggable
                          :list="selectedDrillData"
                          class="drill-dim-wrap query-table"
                          @add="addToArea"
                          filter=".default-tag"
                          :options="{group:'people',sort:false}"
                          :move="itemOnMove"
                          v-show="isShowDrillDim"
                          id="auto_drilldim_wrap"
                          handle=".header"
                          @sort="fieldRecord"
                        >
                          <el-row
                            class="sub-drill"
                            v-for="(item, index) in selectedDrillData"
                            v-bind:class="{dl_col:item.element_type != 1?true:false}"
                            v-bind:key="item.id"
                            v-show="index > 0"
                          >
                            <el-col :span="4" style="height: 33px;"></el-col>
                            <el-col :span="20" style="padding:0px">
                              <el-tag class="drill-tag" style="margin-top:0px">
                                <span class="col-span">
                                  <!-- <span>{{item.col_type}}</span> -->
                                  <span :title="item.element_name">{{ item.element_name }}</span>
                                </span>
                                <span style="float:right">
                                  <!-- 地图、区域地图中的维度不展示升序降序-->
                                  <!-- 钻取先隐藏排序 -->
                                  <!-- <span class="sort-icon" v-show="!['VeMap','VeAreaMap'].includes(curComptDataAuth.type)">
                                    <el-tooltip effect="dark" content="升序" placement="top-start">
                                      <i
                                        class="icon-A10012_triangleEqualUp"
                                        :class="item.sort == 1 ? 'selected':''"
                                        @click="setSort(item,2,1)"
                                      ></i>
                                    </el-tooltip>
                                    <el-tooltip effect="dark" content="降序" placement="top-start">
                                      <i
                                        class="icon-A10013_triangleEqualDown"
                                        :class="item.sort == 2 ? 'selected':''"
                                        @click="setSort(item,2,2)"
                                      ></i>
                                    </el-tooltip>
                                  </span>-->
                                  <el-tooltip effect="dark" content="删除" placement="top-start">
                                    <i class="opt-btn el-icon-delete" @click="deleteItem(item,2)"></i>
                                  </el-tooltip>
                                </span>
                              </el-tag>
                            </el-col>
                          </el-row>
                        </draggable>
                        <div
                          style="margin-bottom:10px;"
                          class="pr3"
                          v-show="isShowDrillDim"
                          id="auto_drill"
                        >
                          <draggable
                            :list="draggableTempData"
                            class="drill-dim-wrap query-table default-wrap"
                            @add="itemOnadd"
                            filter=".default-tag"
                            :options="{group:'people'}"
                            id="auto_d"
                            @sort="fieldRecord"
                          ></draggable>
                          <div id="auto_dx" class="default-tag">拖动右侧字段至此</div>
                        </div>
                      </div>
                    </div>

                    <!-- 钻取维度 -->
                    <!-- 交叉表格聚合状态下才有转置 -->
                    <div class="col-title" v-show="curComptDataAuth.isDim == 1">
                      <el-tooltip
                        :disabled="curComptDataAuth.type !== 'CrossTable'"
                        effect="dark"
                        :enterable="false"
                        :content="curComptDataAuth.dimTitle==='列'?'对字段数据纵向扩展':'对字段数据横向扩展'"
                        placement="top"
                      >
                        <span>
                          <span class="icon-A10429_orders"></span>
                          <label>{{curComptDataAuth.dimTitle}}</label>
                        </span>
                      </el-tooltip>
                      <div
                        class="filter-setting"
                        @click="transPosition"
                        v-show="curComptDataAuth.type == 'CrossTable'&&polymerizeType == 1"
                      >
                        <span class="icon-A10480_LiftUpAndDown"></span>
                        转置
                      </div>
                    </div>
                    <draggable
                      :list="selectedDimData"
                      class="dim-wrap query-table"
                      style="margin-bottom:0;padding-right: 3px;"
                      @add="addToArea"
                      filter=".default-tag"
                      :options="{group:'people'}"
                      :move="itemOnMove"
                      v-show="curComptDataAuth.isDim == 1"
                      id="auto_dim_wrap"
                      @sort="fieldRecord"
                    >
                      <el-tag
                        v-for="item in selectedDimData"
                        v-bind:class="{dl_col:item.element_type != 1?true:false}"
                        v-bind:key="item.id"
                      >
                        <span class="col-span" :style="item.element_type == 1 && curComptDataAuth.isDrill == 1 &&  ((['VeMap','VeAreaMap','VeLines', 'VeBubbleMap'].includes(curComptDataAuth.type) && item.dim_id != '' && item.dim_id != undefined) || !['VeMap','VeAreaMap','VeLines', 'VeBubbleMap'].includes(curComptDataAuth.type)) ? {'width': 'calc(100% - 48px)'} : ''">
                          <span>{{item.col_type}}</span>
                          <span :title="item.element_name">{{ item.element_name }}</span>
                        </span>
                        <span style="float:right">
                          <span
                            class="sort-icon"
                            :class="!['VeMap','VeAreaMap','VeLines', 'VeBubbleMap', 'RankList'].includes(curComptDataAuth.type)  ? 'sort-icon-left':'sort-icon-right'"
                          >
                            <el-tooltip effect="dark" content="钻取" placement="top-start">
                              <i
                                class="icon-A10475_ExpandContraction"
                                style="font-size: 20px;top: 0px;"
                                v-show="item.element_type == 1 && curComptDataAuth.isDrill == 1 &&  ((['VeMap','VeAreaMap','VeLines', 'VeBubbleMap'].includes(curComptDataAuth.type) && item.dim_id != '' && item.dim_id != undefined) || !['VeMap','VeAreaMap','VeLines', 'VeBubbleMap'].includes(curComptDataAuth.type))"
                                @click="setDrillField(item)"
                              ></i>
                            </el-tooltip>
                          </span>
                          <!-- 地图、区域地图中的维度不展示升序降序-->
                          <span
                            class="sort-icon"
                            v-show="!['VeMap','VeAreaMap','VeLines', 'VeBubbleMap', 'RankList', 'VeBmap', 'VeLinesBmap', 'VeHeatBmap'].includes(curComptDataAuth.type) && item.is_calcul==0"
                          >
                            <el-tooltip effect="dark" content="升序" placement="top-start">
                              <i
                                class="icon-A10012_triangleEqualUp"
                                :class="item.sort == 1 ? 'selected':''"
                                @click="setSort(item,1,1)"
                              ></i>
                            </el-tooltip>
                            <el-tooltip effect="dark" content="降序" placement="top-start">
                              <i
                                class="icon-A10013_triangleEqualDown"
                                :class="item.sort == 2 ? 'selected':''"
                                @click="setSort(item,1,2)"
                              ></i>
                            </el-tooltip>
                          </span>
                          <el-tooltip effect="dark" content="删除" placement="top-start">
                            <i class="opt-btn el-icon-delete" @click="deleteItem(item,1)"></i>
                          </el-tooltip>
                        </span>
                      </el-tag>
                    </draggable>
                    <div
                      style="margin-bottom:10px;"
                      class="pr3"
                      v-show="curComptDataAuth.isDim == 1"
                      id="auto_dim"
                    >
                      <draggable
                        :list="draggableTempData"
                        class="dim-wrap query-table default-wrap"
                        @add="itemOnadd"
                        filter=".default-tag"
                        :options="{group:'people'}"
                        id="auto_di"
                        @sort="fieldRecord"
                      ></draggable>
                      <div id="auto_dix" class="default-tag">拖动右侧字段至此</div>
                    </div>

                    <!-- 度量1 -->
                    <div class="col-title" v-show="curComptDataAuth.isMeasure == 1">
                      <el-tooltip
                        effect="dark"
                        :enterable="false"
                        :content="curComptDataAuth.dimTitle==='列'?'对字段数据纵向扩展':'对字段数据横向扩展'"
                        placement="top"
                        :disabled="curComptDataAuth.type !== 'CrossTable'"
                      >
                        <span>
                          <span class="icon-A10429_orders"></span>
                          <label>{{curComptDataAuth.measureTitle}}</label>
                        </span>
                      </el-tooltip>
                      <div
                        class="filter-setting"
                        v-show="curComptDataAuth.type != 'CrossTable'"
                        @click="openAggFunDialog(1)"
                        id="auto_set1"
                      >
                        <span class="icon-A10598_DataOperation"></span>聚合
                      </div>
                    </div>
                    <draggable
                      :list="selectedMeasureData"
                      class="measure1-wrap query-table"
                      style="margin-bottom:0;padding-right: 3px;"
                      @add="addToArea"
                      filter=".default-tag"
                      :options="{group:'people'}"
                      :move="itemOnMove"
                      v-show="curComptDataAuth.isMeasure == 1"
                      id="auto_measure1_wrap"
                      @sort="fieldRecord"
                    >
                      <el-tag
                        v-for="item in selectedMeasureData"
                        v-bind:class="{dl_col:item.element_type != 1?true:false}"
                        v-bind:key="item.id"
                      >
                        <span class="col-span">
                          <span>{{item.col_type}}</span>
                          <span :title="item.element_name">{{ item.element_name }}</span>
                        </span>
                        <span style="float:right">
                          <!-- 只有一个度量的组件不展示升序降序：指标1、指标2、指标3、指标块、仪表盘、单值百分比   和地图、区域地图中的维度、度量-->
                          <span
                            class="sort-icon"
                            v-show="!['HdFlopDevice','HdKpiBlock','HdKpiBlock2','HdKpiBlock3','HdIconKpiBlock','VeRing','VeGauge','VeMap','VeAreaMap','VeLines', 'VeBubbleMap','VeSankey','VeTree'].includes(curComptDataAuth.type) && item.is_calcul==0"
                          >
                            <el-tooltip effect="dark" content="升序" placement="top-start">
                              <i
                                class="icon-A10012_triangleEqualUp"
                                :class="item.sort == 1 ? 'selected':''"
                                @click="setSort(item,3,1)"
                              ></i>
                            </el-tooltip>
                            <el-tooltip effect="dark" content="降序" placement="top-start">
                              <i
                                class="icon-A10013_triangleEqualDown"
                                :class="item.sort == 2 ? 'selected':''"
                                @click="setSort(item,3,2)"
                              ></i>
                            </el-tooltip>
                          </span>
                          <el-tooltip effect="dark" content="删除" placement="top-start">
                            <i class="opt-btn el-icon-delete" @click="deleteItem(item,3)"></i>
                          </el-tooltip>
                        </span>
                      </el-tag>
                    </draggable>
                    <div
                      style="margin-bottom:10px;"
                      class="pr3"
                      v-show="curComptDataAuth.isMeasure == 1"
                      id="auto_measure1"
                    >
                      <draggable
                        :list="draggableTempData"
                        class="measure1-wrap query-table default-wrap"
                        @add="itemOnadd"
                        filter=".default-tag"
                        :options="{group:'people'}"
                        id="auto_y1"
                        @sort="fieldRecord"
                      ></draggable>
                      <div id="auto_y1x" class="default-tag">拖动右侧字段至此</div>
                    </div>
                    <!-- 度量1 -->

                    <!-- 度量2  组合图独有 -->
                    <div class="col-title" v-show="['VeCombineChart', 'VeCombineStack'].includes(curComptDataAuth.type)">
                      <span class="icon-A10429_orders"></span>
                      <label>右Y轴/度量</label>
                      <div class="filter-setting" @click="openAggFunDialog(2)" id="auto_set2">
                        <span class="icon-A10598_DataOperation"></span> 聚合
                      </div>
                    </div>
                    <draggable
                      :list="selectedMeasureData2"
                      class="query-table measure2-wrap"
                      style="margin-bottom:0;padding-right: 3px;"
                      @add="addToArea"
                      filter=".default-tag"
                      :options="{group:'people'}"
                      :move="itemOnMove"
                      v-show="['VeCombineChart', 'VeCombineStack'].includes(curComptDataAuth.type)"
                      id="auto_measure2_wrap"
                      @sort="fieldRecord"
                    >
                      <el-tag
                        v-for="item in selectedMeasureData2"
                        v-bind:class="{dl_col:item.element_type != 1?true:false}"
                        v-bind:key="item.id"
                      >
                        <span class="col-span">
                          <span>{{item.col_type}}</span>
                          <span :title="item.element_name">{{ item.element_name }}</span>
                        </span>
                        <span style="float:right">
                          <span class="sort-icon" v-show="item.is_calcul==0">
                            <el-tooltip effect="dark" content="升序" placement="top-start">
                              <i
                                class="icon-A10012_triangleEqualUp"
                                :class="item.sort == 1 ? 'selected':''"
                                @click="setSort(item,4,1)"
                              ></i>
                            </el-tooltip>
                            <el-tooltip effect="dark" content="降序" placement="top-start">
                              <i
                                class="icon-A10013_triangleEqualDown"
                                :class="item.sort == 2 ? 'selected':''"
                                @click="setSort(item,4,2)"
                              ></i>
                            </el-tooltip>
                          </span>
                          <el-tooltip effect="dark" content="删除" placement="top-start">
                            <i class="opt-btn el-icon-delete" @click="deleteItem(item,4)"></i>
                          </el-tooltip>
                        </span>
                      </el-tag>
                    </draggable>
                    <div
                      style="margin-bottom:10px;"
                      class="pr3"
                      v-show="['VeCombineChart', 'VeCombineStack'].includes(curComptDataAuth.type)"
                      id="auto_measure2"
                    >
                      <draggable
                        :list="draggableTempData"
                        class="measure2-wrap query-table default-wrap"
                        @add="itemOnadd"
                        filter=".default-tag"
                        :options="{group:'people'}"
                        id="auto_y2"
                        @sort="fieldRecord"
                      ></draggable>
                      <div id="auto_y2x" class="default-tag">拖动右侧字段至此</div>
                    </div>

                    <!-- 其他配置维度或度量 -->
                    <div
                      v-for="(eitem, index) of elementObj"
                      :key="index"
                      v-if='eitem!==undefined'
                    >
                      <div class="col-title">
                        <span class="icon-A10429_orders"></span>
                        <label>{{eitem.name}}</label>
                        <div class="filter-setting" v-if="eitem.elementType!=1" @click="openAggFunDialog(eitem.key)" id="auto_set2">
                          <span class="icon-A10598_DataOperation"></span> 聚合
                        </div>
                      </div>
                      <draggable
                        :list="selectedDataObj[`${eitem.key.replace(/ColTitle/,'Data')}`]"
                        :class="['query-table', `${eitem.key}-wrap`]"
                        style="margin-bottom:0;padding-right: 3px;"
                        @add="addToArea"
                        filter=".default-tag"
                        :options="{group:'people'}"
                        :move="itemOnMove"
                        :id="`auto_${eitem.key}_wrap`"
                        @sort="fieldRecord"
                      >
                        <el-tag
                          v-for="item in selectedDataObj[`${eitem.key.replace(/ColTitle/,'Data')}`]"
                          v-bind:class="{dl_col:item.element_type != 1?true:false}"
                          v-bind:key="item.id"
                        >
                          <span :class="['col-span',{'col-span-1':item.element_type == 1}]">
                            <span>{{item.col_type}}</span>
                            <span :title="item.element_name">{{ item.element_name }}</span>
                          </span>
                          <span style="float:right">
                            <span
                              class="sort-icon sort-icon-left"
                            >
                              <el-tooltip effect="dark" content="钻取" placement="top-start" v-show="item.element_type == 1&&(eitem.icon||{}).drill!=0">
                                <i
                                  class="icon-A10475_ExpandContraction"
                                  style="font-size: 20px;top: 0px;"
                                  v-show="item.element_type == 1 && curComptDataAuth.isDrill == 1"
                                  @click="setDrillField(item)"
                                ></i>
                              </el-tooltip>
                            </span>
                            <!-- 计算字段 排序图标不展示 -->
                            <span class="sort-icon" v-if="(eitem.icon||{}).order!=0 && item.is_calcul==0">
                              <el-tooltip effect="dark" content="升序" placement="top-start">
                                <i
                                  class="icon-A10012_triangleEqualUp"
                                  :class="item.sort == 1 ? 'selected':''"
                                  @click="setSort(item,4,1)"
                                ></i>
                              </el-tooltip>
                              <el-tooltip effect="dark" content="降序" placement="top-start">
                                <i
                                  class="icon-A10013_triangleEqualDown"
                                  :class="item.sort == 2 ? 'selected':''"
                                  @click="setSort(item,4,2)"
                                ></i>
                              </el-tooltip>
                            </span>
                            <el-tooltip effect="dark" content="删除" placement="top-start">
                              <i class="opt-btn el-icon-delete" @click="deleteItem(item,eitem.key)"></i>
                            </el-tooltip>
                          </span>
                        </el-tag>
                      </draggable>
                      <div
                        style="margin-bottom:10px;"
                        class="pr3"
                        :id="`auto_${eitem.key}`"
                      >
                        <draggable
                          :list="draggableTempData"
                          :class="[`${eitem.key}-wrap`, 'query-table default-wrap']"
                          @add="itemOnadd"
                          filter=".default-tag"
                          :options="{group:'people'}"
                          id="auto_y2"
                          @sort="fieldRecord"
                        ></draggable>
                        <div id="auto_y2x" class="default-tag">拖动右侧字段至此</div>
                      </div>
                    </div>
                    <!-- 其他配置维度或度量end -->

                    <div
                      class="table-other-wrap"
                      v-show="['ElDatagrid','CrossTable'].includes(curComptDataAuth.type)"
                    >
                      <div class="col-title" style="margin-bottom:10px;">
                        <span class="icon-A10598_DataOperation"></span>
                        <label>聚合方式</label>
                      </div>
                      <div class="co-together-method">
                        <!-- @change="coChange" -->
                        <el-radio-group v-model="polymerizeType" @change="polymerChange">
                          <el-radio :label="1">聚合</el-radio>
                          <el-tooltip effect="dark" content="聚合计算设置" placement="top">
                            <!-- @click="openCalcOpr" -->
                            <span
                              class="icon-A10667_Summation calc-icon"
                              @click="openPolymerDialog"
                            ></span>
                          </el-tooltip>
                          <el-radio :label="2">明细</el-radio>
                        </el-radio-group>
                      </div>
                    </div>

                    <div class="col-title">
                      <span class="icon-A10184_filter"></span>
                      <label>数据过滤</label>
                      <span></span>
                      <div class="filter-setting" @click="openFilterSet" id="auto_setup">
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
                      :move="itemOnMove"
                      :list="filterData"
                      @add="addToArea"
                      id="auto_query_filter"
                      @sort="fieldRecord"
                    >
                      <el-tag
                        v-for="item in filterData"
                        v-bind:class="{dl_col:item.element_type != 1?true:false}"
                        v-bind:key="item.id"
                      >
                        <span class="col-span">
                          <span>{{item.col_type}}</span>
                          <span :title="item.element_name">{{ item.element_name }}</span>
                        </span>
                        <span style="float:right">
                          <!-- <i class="icon-A10184_filter filter-icon"></i> -->
                          <i class="opt-btn el-icon-delete" @click="deleteItem(item,5)"></i>
                        </span>
                      </el-tag>
                    </draggable>
                    <div style="margin-bottom:10px;" class="pr3" id="auto_filter">
                      <draggable
                        :list="draggableTempData"
                        class="query-filter default-wrap"
                        @add="itemOnadd"
                        filter=".default-tag"
                        :options="{group:'people'}"
                        id="auto_f"
                        @sort="fieldRecord"
                      ></draggable>
                      <div id="auto_fx" class="default-tag">拖动右侧字段至此</div>
                    </div>

                    <div
                      v-if="['VeMap','VeAreaMap','VeLines', 'VeBubbleMap'].includes(curComptDataAuth.type)"
                    >
                      <div class="col-title" style="margin-bottom:10px;">
                        <label>地图范围</label>
                        <span></span>
                      </div>
                      <div style="margin-bottom:10px;" class="pr3">
                        <el-select
                          size="mini"
                          style="width:100%;margin-bottom:10px;"
                          v-model="mapLevel"
                          placeholder="请选择"
                          @change="mapLevelChange"
                        >
                          <el-option label="全国" value="0"></el-option>
                          <el-option label="省级地图" value="1"></el-option>
                          <el-option label="市级地图" value="2"></el-option>
                        </el-select>
                        <el-select
                          v-if="mapLevel==='1'||mapLevel==='2'"
                          size="mini"
                          style="width:100%"
                          v-model="mapArea"
                          filterable
                          remote
                          reserve-keyword
                          placeholder="请输入关键词"
                          :remote-method="mapRemoteMethod"
                          :loading="loading"
                          @change="mapAreaChange"
                        >
                          <el-option
                            v-for="item in mapAreaList"
                            :key="item.label"
                            :label="item.label"
                            :value="mapLevel == 2 ? item.label : item.value"
                          ></el-option>
                        </el-select>
                      </div>
                    </div>
                  </div>
                </el-scrollbar>
              </el-row>
              <el-button
                v-show="activedCompt.type !== 'MobileQuery' && activedCompt.type !== 'Query'"
                type="primary"
                plain
                class="up-button"
                @click="confirmUpdateData"
                size="mini"
                id="auto_confirm"
              >确定</el-button>
            </div>
          </el-col>
          <!-- <el-col :span="13" style="padding:10px"> -->
          <el-col :span="13" style="padding:10px">
            <el-row class="grid-content bg-purple-light">
              <div class="r-title">数据集</div>
              <el-select
                filterable
                remote
                v-model="value"
                placeholder="请选择数据集"
                v-loadmore="loadMore"
                @change="datasetSelChange"
                :remote-method="remoteMethod"
                @visible-change="resetTables"
                size="mini"
                id="dataSet_1"
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
                <div style="height:40px;min-width:200px"></div>
              </el-select>

              <el-input
                class="input-search"
                placeholder="输入关键字搜索"
                prefix-icon="el-icon-search"
                v-model="filterText"
                size="mini"
                id="auto_ds_searth"
              ></el-input>

              <el-row class="el-row-12">
                <div class="col-title" style="color: #45fffd;">
                  <span class="icon-A10602_OpenGovernance"></span>
                  <label>维度</label>
                </div>
                <div class="col-wrap">
                  <div class="col-subtitle">字段名称</div>
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
                        :move="itemOnMove"
                        :options="{group:{name:'people',pull:'clone',put:false}}"
                        :clone="cloneDragItem"
                        @end="itemOnMove"
                        filter=".date-tag"
                        @sort="fieldRecord"
                      >
                        <div
                          class="col-item"
                          v-bind:class="{ selected:item.selected,'date-tag':item.col_type == 'dat' &&  !item.isNewCol && item.formatLevel != undefined}"
                          v-for="(item,index) in allColsData"
                          v-if="item.element_type == 1"
                          v-bind:key="item.id+'_'+index"
                          :index="index"
                          :id="'cols_'+index"
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
                                  v-show="item.col_type == 'dat' && !item.isNewCol && item.formatLevel != undefined"
                                >
                                  <span
                                    v-bind:class="(dateOpenList[item.element_id] == undefined || dateOpenList[item.element_id]) ? 'icon-A10009_triangleDown': 'icon-A10011_triangleRight'"
                                    style="color:#afc0d0;width:10px;margin-left: -10px;"
                                  ></span>
                                </a>
                                <span :auto-test="item.element_name">{{ item.element_name }}</span>
                              </div>
                            </el-tooltip>
                        </div>
                        <!-- <div
                         class="col-item"
                         v-bind:class="{ selected:item.selected,'date-tag':['Query','MobileQuery'].includes(activeComp.type) && item.col_type == 'dat' &&  !item.isNewCol && item.formatLevel != undefined}"
                         v-for="(item,index) in allColsData"
                         v-if="item.element_type == 1 && (['Query','MobileQuery'].includes(activeComp.type) || (!['Query','MobileQuery'].includes(activeComp.type) && !item.isNewCol))"
                         v-bind:key="item.id+'_'+index"
                         :index="index"
                         :id="'cols_'+index"
                         v-show="dateOpenList[item.element_id] == undefined || !(!dateOpenList[item.element_id] && item.isNewCol)"
                       >
                       <el-tooltip
                           placement="left"
                           :content="item.element_name"
                           :open-delay=1000
                         >
                         <div class="item-wrap">
                         <span v-if="!item.isNewCol">{{item.col_type}}</span><span v-else></span>
                         <a href="javascript:;" @click="isOpen(item)" v-show="item.col_type == 'dat' && !item.isNewCol && item.formatLevel != undefined">
                           <span
                             v-if="['Query','MobileQuery'].includes(activeComp.type)"
                             v-bind:class="(dateOpenList[item.element_id] == undefined || dateOpenList[item.element_id]) ? 'icon-A10009_triangleDown': 'icon-A10011_triangleRight'"
                             style="color:#afc0d0;width:10px;margin-left: -10px;"
                           ></span>
                         </a>
                         {{ item.element_name }}
                         </div>
                         </el-tooltip>
                       </div>-->
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
                    <span>字段名称</span>
                    <i v-show="showComputeIcon && showAppCal==='1'" class="compute-icon icon-A10072_add" @click="showComputeDialog=true"></i>
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
                        :move="itemOnMove"
                        :options="{group:{name:'people',pull:'clone',put:false}}"
                        :clone="cloneDragItem"
                        @end="itemOnMove"
                        @sort="fieldRecord"
                      >
                        <div
                          class="col-item"
                          v-bind:class="{ selected: item.selected }"
                          v-for="(item,index) in allColsData"
                          v-if="item.element_type != 1"
                          v-bind:key="item.id"
                          :index="index"
                          :id="'cols_'+index"
                        >
                          <el-tooltip
                              placement="left"
                              :content="item.element_name"
                              :open-delay=1000
                            >
                            <div class="item-wrap">
                              <span>{{item.col_type}}</span>
                              <span :auto-test="item.element_name">{{ item.element_name }}</span>
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
      </el-tab-pane>
      <el-tab-pane label="样式" name="style" class="grid-content" key="style-pane">
        <StyleAttr ref="styleAttr" :polymer="polymerizeType"></StyleAttr>
      </el-tab-pane>
      <el-tab-pane
        label="高级"
        name="interaction"
        class="grid-content"
        v-if="isAdvanceSetVis"
        key="interaction-pane"
      >
        <PageInteractSet :selectedDrillData="selectedDrillData"></PageInteractSet>
      </el-tab-pane>
    </el-tabs>
    <el-dialog
      title="聚合"
      :visible.sync="aggergationFunDialog"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="500px"
      height="100%"
      class="batch-dialog"
      size="mini"
      :before-close="handleClose"
    >
      <div style="height:230px;overflow:hidden;">
        <el-scrollbar style="height: 100%;overflow:hidden;" v-if="aggergationFunDialog">
          <el-form ref="dialog-form" label-width="180px" size="mini">
            <!-- @change="currentSel(item)" -->
            <el-form-item
              :label="item.name+':'"
              :title="item.name"
              v-for="(item,index) in yAxisData"
              :key="item.id"
              :value="item.fun_type"
            >
              <el-select
                v-model="item.fun_type"
                size="mini"
                placeholder="请选择"
                :id="'auto_sel'+index"
              >
                <el-option
                  v-if="item.is_calcul=='2'||item.fun_type=='0'"
                  v-for="cell in calcData2"
                  :key="cell.value"
                  :label="cell.label"
                  :value="cell.value"
                  :id="'auto_sum'+index+'_'+cell.value"
                ></el-option>
                <el-option
                  v-else
                  v-for="cell in calcData"
                  :key="cell.value"
                  :label="cell.label"
                  :value="cell.value"
                  :id="'auto_sum'+index+'_'+cell.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-scrollbar>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="upAggergationFunDialog(false)" size="mini">取 消</el-button>
        <el-button type="primary" @click="doSummarize()" size="mini">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="数据过滤"
      :visible.sync="datafilterDialogVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
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
    <InteractSettingDialog :xAxisData="selectedDimData"></InteractSettingDialog>
    <el-dialog
      size="mini"
      title="条件设置"
      :visible.sync="dialogTableVisible"
      :close-on-click-modal="false"
    >
      <CondiSet ref="condiset" pageType="report" v-if="dialogTableVisible"></CondiSet>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancelSet">取 消</el-button>
        <el-button size="mini" type="primary" @click="conditionSet">确 定</el-button>
      </span>
    </el-dialog>
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
          <el-form ref="dialog-form" label-width="180px" size="mini">
            <el-form-item
              :label="item.name+':'"
              :title="item.name"
              v-for="item in batchSetData"
              :key="item.id"
              :value="item.fun_type"
            >
              <el-select
                v-model="item.fun_type"
                placeholder="请选择"
                size="mini"
                @change="calcSettingChange(item)"
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
        <el-button type="primary" @click="batchSettingTotal" size="mini">确 定</el-button>
      </span>
    </el-dialog>
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
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import Datafilter from "./DateFilter.vue";
import ListImportDialog from "./ListImport.vue";
import {
  dealDataSetInfo,
  genWhereBean,
  getFilteredData,
  objDeepCopy,
  getTableReqParam,
  constructList,
  concatComputedData,
  mapDataSetInfoKey,
  loadDataDone,
  loadDataError,
  adjustQueryParams
} from "../../utils/comonFunc.js";
import StyleAttr from "./StyleAttr.vue";
import PageInteractSet from "./PageInteractSet.vue";
import InteractSettingDialog from "./InteractSettingDialog.vue";
import getUUID from "../../utils/UUID.js";

export default {
  components: {
    draggable,
    Datafilter,
    ListImportDialog,
    StyleAttr,
    PageInteractSet,
    InteractSettingDialog,
    CondiSet,
    ComputedDesign
  },
  data() {
    return {
      topfiveData: "5",
      beforeSetData: [], // 弹窗设置前保存一份数据
      beforeFilterData: [], //数据过滤前保存一份
      activeName: "attr",
      filterText1: "",
      filterText: "",
      value: "",
      valueIsChange: false,
      datasetName: "",
      initAfId: "",
      wdCheckAll: false,
      dlCheckAll: false,
      tabWdCheckAll: false,
      tabDlCheckAll: false,
      wdChecked: false,
      dlChecked: false,
      dialogTableVisible: false,
      draggedItem: [],
      allData: [],
      start: 1,
      wdColsLen: 0,
      dlColsLen: 0,
      wdtableCols: [],
      dltableCols: [],
      condiOpt: "",
      onesLoad: true,
      datafilterDialogVisible: false,
      showComputeDialog: false,
      calcData: [
        {
          label: "SUM",
          value: 2
        },
        {
          label: "COUNT",
          value: 1
        },
        {
          label: "AVG",
          value: 3
        },
        {
          label: "MAX",
          value: 4
        },
        {
          label: "MIN",
          value: 5
        },
        {
          label: "COUNT DISTINCT",
          value: 6
        }
      ],
      calcData2: [
        {
          label: '无',
          value: 0
        }
      ],
      dataClassifyAuth: Object.freeze([
        {
          chartChName: "组合图",
          type: "VeCombineChart",
          isDim: 1, // 维度
          dimTitle: "X轴/维度",
          isDrill: 1, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "左Y轴/度量" // 只有组合图才有右Y轴/度量
        },
        /**堆叠组合图 */
        {
          chartChName: "堆叠组合图",
          type: "VeCombineStack",
          isDim: 1, // 维度
          dimTitle: "X轴/维度",
          isDrill: 1, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "左Y轴/度量" // 只有组合图才有右Y轴/度量
        },
        /**堆叠组合图 */
        {
          chartChName: "饼图",
          type: "VePie",
          isDim: 1, // 维度
          dimTitle: "维度",
          isDrill: 1, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "度量" // 只有组合图才有右Y轴/度量
        },
         {
          chartChName: "词云图",
          type: "VeWordCloud",
          isDim: 1, // 维度
          dimTitle: "维度",
          isDrill: 1, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "度量" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "折线图",
          type: "VeLine",
          isDim: 1, // 维度
          dimTitle: "维度",
          isDrill: 1, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "度量" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "柱状图",
          type: "VeHistogram",
          isDim: 1, // 维度
          dimTitle: "维度",
          isDrill: 1, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "度量" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "折线面积图",
          type: "VeLineArea",
          isDim: 1, // 维度
          dimTitle: "维度",
          isDrill: 1, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "度量" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "条形图",
          type: "VeBar",
          isDim: 1, // 维度
          dimTitle: "维度",
          isDrill: 1, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "度量" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "堆积条形图",
          type: "VeStackBar",
          isDim: 1, // 维度
          dimTitle: "维度",
          isDrill: 1, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "度量" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "指标组",
          type: "PcKpiBlock",
          isDim: 1, // 维度
          dimTitle: "维度",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "度量" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "指标一",
          type: "HdKpiBlock",
          isDim: 0, // 维度
          dimTitle: "维度",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "度量" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "指标二",
          type: "HdKpiBlock2",
          isDim: 0, // 维度
          dimTitle: "维度",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "度量" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "指标三",
          type: "HdKpiBlock3",
          isDim: 0, // 维度
          dimTitle: "维度",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "度量" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "表格",
          type: "ElDatagrid",
          isDim: 1, // 维度
          dimTitle: "列",
          isDrill: 1, // 是否可钻取维度
          isMeasure: 0, // 度量
          measureTitle: "列" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "查询组件",
          type: "Query",
          isDim: 0, // 维度
          dimTitle: "",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 0, // 度量
          measureTitle: "" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "查询组件",
          type: "MobileQuery",
          isDim: 0, // 维度
          dimTitle: "",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 0, // 度量
          measureTitle: "" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "Tab列表",
          type: "ElTabs",
          isDim: 0, // 维度
          dimTitle: "",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 0, // 度量
          measureTitle: "" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "地图",
          type: "VeMap",
          isDim: 1, // 维度
          dimTitle: "维度",
          isDrill: 1, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "度量" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "堆叠面积图",
          type: "VeStackLineArea",
          isDim: 1, // 维度
          dimTitle: "维度",
          isDrill: 1, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "度量" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "雷达图",
          type: "VeRadar",
          isDim: 1, // 维度
          dimTitle: "维度",
          isDrill: 1, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "度量" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "堆叠柱状图",
          type: "VeStackHistogram",
          isDim: 1, // 维度
          dimTitle: "维度",
          isDrill: 1, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "度量" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "仪表图",
          type: "VeGauge",
          isDim: 0, // 维度
          dimTitle: "",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "度量" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "区域地图",
          type: "VeAreaMap",
          isDim: 1, // 维度
          dimTitle: "维度",
          isDrill: 1, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "度量" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "通用标题",
          type: "HdTitle",
          isDim: 1, // 维度
          dimTitle: "维度",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "度量" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "通用标题",
          type: "VeTitle",
          isDim: 1, // 维度
          dimTitle: "维度",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "度量" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "椭圆标题",
          type: "HdVerTitle",
          isDim: 1, // 维度
          dimTitle: "维度",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "度量" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "大屏头部",
          type: "HdHeader",
          isDim: 0, // 维度
          dimTitle: "",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 0, // 度量
          measureTitle: "" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "横线",
          type: "HdHorizontalLine",
          isDim: 0, // 维度
          dimTitle: "",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 0, // 度量
          measureTitle: "" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "竖线",
          type: "HdVerticalLine",
          isDim: 0, // 维度
          dimTitle: "",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 0, // 度量
          measureTitle: "" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "角分割线",
          type: "HdCorner",
          isDim: 0, // 维度
          dimTitle: "",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 0, // 度量
          measureTitle: "" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "单值百分比",
          type: "VeRing",
          isDim: 0, // 维度
          dimTitle: "",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "度量" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "图标指标块",
          type: "HdIconKpiBlock",
          isDim: 0, // 维度
          dimTitle: "",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "度量" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "交叉表",
          type: "CrossTable",
          isDim: 1, // 维度
          dimTitle: "行",
          isDrill: 1, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "列" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "图标",
          type: "HdIconBlock",
          isDim: 0, // 维度
          dimTitle: "",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 0, // 度量
          measureTitle: "" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "折叠面板",
          type: "VanCollapse",
          isDim: 0, // 维度
          dimTitle: "",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 0, // 度量
          measureTitle: "" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "目录",
          type: "ElBreadCrumb",
          isDim: 0, // 维度
          dimTitle: "",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 0, // 度量
          measureTitle: "" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "图片",
          type: "ElImage",
          isDim: 0, // 维度
          dimTitle: "",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 0, // 度量
          measureTitle: "" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "文本域",
          type: "PcTextarea",
          isDim: 0, // 维度
          dimTitle: "",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 0, // 度量
          measureTitle: "" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "文本域",
          type: "HdTextarea",
          isDim: 0, // 维度
          dimTitle: "",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 0, // 度量
          measureTitle: "" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "轮播",
          type: "ElCarousel",
          isDim: 0, // 维度
          dimTitle: "",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 0, // 度量
          measureTitle: "" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "文本域",
          type: "MobileTextarea",
          isDim: 0, // 维度
          dimTitle: "",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 0, // 度量
          measureTitle: "" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "翻牌器",
          type: "HdFlopDevice",
          isDim: 0, // 维度
          dimTitle: "维度",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "度量" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "时间",
          type: "HdTime",
          isDim: 1, // 维度
          dimTitle: "维度",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "度量" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "标题形状",
          type: "HdTitleShape",
          isDim: 1, // 维度
          dimTitle: "维度",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "度量" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "玫瑰图",
          type: "VeRosePie",
          isDim: 1, // 维度
          dimTitle: "维度",
          isDrill: 1, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "度量" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "列表柱状图",
          type: "HdTopFive",
          isDim: 1, // 维度
          dimTitle: "维度",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "度量" // 只有组合图才有右Y轴/度量
        }, {
          chartChName: "水位图",
          type: "HdWater",
          isDim: 0, // 维度
          dimTitle: "维度",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "度量" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "清单轮播",
          type: "ElSwiper",
          isDim: 1, // 维度
          dimTitle: "维度",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "度量" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "线条",
          type: "VeDragLine",
          isDim: 1, // 维度
          dimTitle: "维度",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "度量" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "边框",
          type: "HdBorderWrap",
          isDim: 0, // 维度
          dimTitle: "维度",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 0, // 度量
          measureTitle: "" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "按钮",
          type: "HdButton",
          isDim: 1, // 维度
          dimTitle: "维度",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "度量" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "迁徙图",
          type: "VeLines",
          isDim: 1, // 维度
          dimTitle: "维度",
          isDrill: 0, // 是否可钻取维度
          isMeasure: 0, // 度量
          measureTitle: "度量" // 只有组合图才有右Y轴/度量
        },
        {
          chartChName: "环形柱状图",
          type: "VeDoughnutPie",
          isDim: 1, // 维度
          dimTitle: "维度",
          isDrill: 1, // 是否可钻取维度
          isMeasure: 1, // 度量
          measureTitle: "度量" // 只有组合图才有右Y轴/度量
        }
      ]),
      comptTitle: "",
      curComptDataAuth: {
        type: "",
        isDim: 1, // 维度
        dimTitle: "",
        isDrill: 1, // 是否可钻取维度
        isMeasure: 1, // 度量
        measureTitle: "" // 只有组合图才有右Y轴/度量
      },
      selectedDimData: [],
      selectedDrillData: [], // 钻取维度  是通过维度里面 字段--设置--点击钻取维度再展现
      selectedMeasureData: [], // 左Y轴度量/维度
      selectedMeasureData2: [], // 右Y轴度量
      selectedQueryData: [],
      polymerizeType: 2, //聚合明细类型
      draggableTempData: [], //临时存放拖拽的数据
      isAddSuss: false, //数据拖拽是否成功
      lastToClassName: "", //数据拖拽结束前的classname
      firDrillField: {},
      yAxisData: [], //聚合弹窗字段列表
      loading: false, //地图范围
      mapLevel: "1", //地图范围层级，省级地图、市级地图
      mapArea: "fujian", //地图范围，所在省份拼音
      mapAreaList: [],
      tempList: [],
      fieldTypeList: {}, //数据库字段类型
      dateOpenList:{},//用来记录新增加的日期字段展开还是收缩
      formatList: [],//日期源格式
      mapAreaObj: {},//保存所有的地图范围,key:mapLevel,value:mapAreaList
      datasetDetail: {}, //当前数据集详情
      selectedDataObj: {},
      elementObj: [],
      ismove: false
    };
  },
  watch: {
    activeNameX(val) {
      this.activeName = val;
    },
    filterText(val) {
      this.filterNode(val);
    },
    selectedDimData(vals) {
      if (this.ismove) {
        this.ismove = false
        this.reSortAxisData(this.ismove==='same'?0:2)
      }
      // var that = this;
      // var _repeat = 0;
      let wdlen = 0;
      let dllen = 0;
      for (var i = 0; i < vals.length; i++) {
        // 不允许重复字段拖入查询条件区域
        /** 计算 是否全选**/
        if (vals[i].element_type == 1) {
          wdlen++;
        } else {
          dllen++;
        }
        /** end**/
      }
      this.tabWdCheckAll = !!(this.wdColsLen == wdlen && wdlen != 0);
      this.tabDlCheckAll = !!(this.dlColsLen == dllen && dllen != 0);
      this.dlCheckAll = this.tabDlCheckAll;
      this.wdCheckAll = this.tabWdCheckAll;
    },
    selectedMeasureData(vals) {
      if (this.ismove) {
        this.ismove = false
        this.reSortAxisData(this.ismove==='same'?1:2)
      }
    },
    wdCheckAll(checked) {
      this.tabWdCheckAll = checked;
    },
    dlCheckAll(checked) {
      this.tabDlCheckAll = checked;
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
          condiParam.map(function (params) {
            if (params.type == "ElButton") {
              return false;
            }
            condiData.push(params.comptAttrs);
          });
          // 结果字段
          let tableParam = this.s_edcuiCompts[1].comptAttrs.columns;
          tableParam.map(function (params) {
            tableData.push(params);
          });
          this.initAfId = af_id || "";
          if (this.onesLoad && this.initAfId != "") {
            this.getAllTablesData(af_id);
            this.getColsData(af_id, condiData, tableData);
          }
        } catch (e) { }
      } else if (sign == "default") {
        // 置空
        _this.wdCheckAll = false;
        _this.dlCheckAll = false;
        _this.tabWdCheckAll = false;
        _this.tabDlCheckAll = false;
        _this.wdChecked = false;
        _this.dlChecked = false;
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
        if (temp.element_type == 1) {
          // 维度
          _this.wdColsLen++;
        } else if (temp.element_type != 1) {
          // 度量
          _this.dlColsLen++;
        }
      }
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
    },
    value(val) {
      this.valueIsChange = true;
    },
    activedCompt(newVal, oldVal) {
      if (
        newVal != undefined &&
        newVal.comptId != "" &&
        newVal.comptId != undefined
      ) {
        this.updateAttrPanel(this.activedCompt);
        this.setSeriesData();
      }
    },
    mapLevel(newVal, oldVal) {
      this.queryMapInfo();
    }
  },
  computed: {
    ...mapState({
      comptNum: state => state.compt.comptNum,
      filterData: state => state.QueryTable.filterData,
      allColsData: state => state.QueryTable.allColsData,
      allTablesData: state => state.QueryTable.allTablesData,
      colValue: state => state.QueryTable.colValue,
      datasetUrl: state => state.datasetUrl,
      loaderSign: state => state.QueryTable.loaderSign,
      dgwMsUrl: state => state.dgwMsUrl,
      defaultSystemId: state => state.defaultSystemId,
      batchDialogVisible: state => state.QueryTable.batchDialogVisible,
      pageCache: state => state.HomeBody.pageCache,
      importField: state => state.compt.importField,
      s_edcuiCompts: state => state.PageDesign.s_edcuiCompts,
      dimInfoMap: state => state.AnalyReportAttr.dimInfoMap,
      activeNameX: state => state.PageDesign.activeName,
      edcuiComptTemps: state => state.PageDesign.edcuiCompts,
      aggergationFunDialog: state => state.PageDesign.aggergationFunDialog,
      datasetMap: state => state.AnalyReportAttr.datasetMap,
      showAppCal: state => state.commonProperties.showAppCal
    }),
    ...mapGetters({
      activedCompt: "PageDesign/getActivedCompt",
      colValue: "QueryTable/colValue",
      noComputedTbCols: "QueryTable/noComputedTbCols",
      datafilterCols: "QueryTable/datafilterCols",
      activeComptIdx: "PageDesign/activeComptIdx",
      flatCompt: "PageDesign/getFlatCompt",
      getColsTotalAndData: "PageDesign/getColsTotalAndData",
      isAdvanceSetVis:"PageDesign/isAdvanceSetVis"
    }),
    showComputeIcon() {
      let flag = true;
      if(this.activedCompt.type === "MobileQuery" || this.activedCompt.type === "Query") {
        flag = false;
      }
      return flag;
    },
    activeComp() {
      return this.activedCompt;
    },
    isShowDrillDim() {
      return this.selectedDrillData.length > 0;
    },
    batchSetData() {
      let res = [];
      let yAxisList = this.activeComp.comptAttrs.xAxisData;
      let allColumns = this.activedCompt.comptAttrs.colSetting || [];
      yAxisList.forEach(val => {
        let element = allColumns[val.element_id];
        if (
          element != null &&
          element.isNumber &&
          element.totalFunType != "" &&
          element.totalFunType != undefined
        )
          res.push({
            id: val.element_id,
            name: element.nick_name,
            fun_type: element.totalFunType || 2
          });
      });
      return res;
    },
    isAdvanceSetVisBak() {//该代码已经移到pageDesign.js
      //高级设置面板是否展示
      let flag = false;
      //对于可以绑定数据集，有维度字段（存在xAxisData属性中）的组件都可以联动其他组件
      // 对于只有度量字段没有维度字段的组件，不能联动其他组件的组件：eg:仪表盘 环形图(可以设置预警)，大屏的指标1-4等["VeGauge","VeRing"]
      // 交叉表比较特殊，交叉表聚合情况可以只有列，没有行字段
      // VeRing虽然不能设置联动，但是可以设置预警
      /**
       *   (["CrossTable", "VeRing"].includes(this.activedCompt.type) ||
          (comptAttrs.xAxisData || []).length > 0)
      */
      /* let typeArr = [];
      this.dataClassifyAuth.forEach(item => {
        if (
          item.isMeasure === 1 &&
          item.isDim === 0 &&
          item.type !== "VeRing"
        ) {
          typeArr.push(item.type);
        }
      });
      console.log(typeArr); */



      let comptAttrs = this.activedCompt.comptAttrs || {};
      if (
        this.activedCompt &&
        comptAttrs.isBindData == "1"
        // !typeArr.includes(this.activedCompt.type)
      ) {
        flag = true;
      }

       if (
          this.curComptDataAuth.isMeasure === 1 &&
          this.curComptDataAuth.isDim === 0 &&
          this.curComptDataAuth.type !== "VeRing"
        ) {
          flag = false;
        }

      if (
        [
          "HdIconBlock",
          "ElImage",
          "HdIconKpiBlock",
          "HdKpiBlock",
          "HdKpiBlock2",
          "HdKpiBlock3",
          "HdButton",
          "HdWater",
          "BdTextNote",
          "VeScatter",
          "Scatter"
        ].includes(this.activedCompt.type)
      ) {
        flag = true;
      }
      //暂时开放第三方组件
      if(this.activedCompt && this.activedCompt.comptAttrs && this.activedCompt.comptAttrs.isExtComp === "1"){
        flag = true;
      }
      if (["ProgressBar","VeTree"].includes(this.activedCompt.type)) {
        flag = false;
      }
      return flag;
    },
    groupFunc() {
      let flag = false;
      let data = this.selectedDimData.concat(this.selectedMeasureData);
      for(let i=0;i<data.length;i++){
        if(data[i].is_calcul=='2'){
          flag = true;
          break;
        }
      }
      return flag;
    }
  },
  mounted() {},
  activated() {
    this.start = 1;
    this.value = this.activedCompt.afId;
    this.datasetName = "";
    this.upComptDatasetName("");
    this.activeName = this.activeNameX;
    this.resetTableData([]);
    this.getAllTablesData(); // 修改第二次进入时数据集为空的bug
    this.onesLoad = true;
    if (this.pageCache.pageId == null) {
      this.initAfId = "";
    }
    this.comptTitle = "表格";
    this.queryMapInfo();
  },
  methods: {
    ...mapMutations({
      setActivedCompt: "PageDesign/setActivedCompt",
      upComptDatasetName: "compt/upComptDatasetName",
      upComptNum: "compt/upComptNum",
      upTableCols: "QueryTable/upTableCols",
      upFilterData: "QueryTable/upFilterData",
      filterCols: "QueryTable/filterCols",
      upAllCols: "QueryTable/upAllCols",
      upDatasChange: "QueryTable/upDatasChange",
      upTotalChange: "QueryTable/upTotalChange",
      upLoading: "compt/upLoading",
      setSedcuiCompts: "compt/setSedcuiCompts",
      setDatasetType: "DataSetDesign/setDatasetType",
      resetTableData: "QueryTable/resetTableData",
      upColumns: "QueryTable/upColumns",
      upIsChangeCalc: "QueryTable/upIsChangeCalc",
      upBatchDialog: "QueryTable/upBatchDialog",
      upColValue: "QueryTable/upColValue",
      recordCommand: "OptStack/recordCommand",
      upDimInfoMap: "AnalyReportAttr/upDimInfoMap",
      upAggergationFunDialog: "PageDesign/upAggergationFunDialog",
      setSelectAf: "QueryTable/setSelectAf"
    }),
    ...mapActions({
      upComptDatasetName: "compt/upComptDatasetName",
      upComptNum: "compt/upComptNum",
      upLoading: "compt/upLoading",
      cancelFilterSet: "QueryTable/cancelFilterSet",
      upDatasChange: "QueryTable/upDatasChange",
      upTotalChange: "QueryTable/upTotalChange",
      upTableCols: "QueryTable/upTableCols",
      upFilterData: "QueryTable/upFilterData",
      upIsChangeCalc: "QueryTable/upIsChangeCalc",
      filterCols: "QueryTable/filterCols",
      upAllCols: "QueryTable/upAllCols",
      upColumns: "QueryTable/upColumns",
      queryComptData: "QueryTable/queryComptData",
      upIsTotalOnly: "QueryTable/upIsTotalOnly",
      upColValue: "QueryTable/upColValue",
      setActivedCompt: "PageDesign/setActivedCompt",
      initSymbolSize: "PageDesign/initSymbolSize",
      initLableFormatter: "PageDesign/initLableFormatter",
      setJsonData: "PageDesign/setJsonData",
      setWarnData: "PageDesign/setWarnCol",
      setAnotherName: "PageDesign/setAnotherName",
      setActiveName: "PageDesign/setActiveName",
      queryMapAreaInfo: "PageDesign/queryMapAreaInfo",
      batchSetMapSeriesData: "PageDesign/batchSetMapSeriesData",
      setChartSeriesDate: "PageDesign/setChartSeriesDate",
      setAreaMapMaxData: "PageDesign/setAreaMapMaxData",
      qryStyleAttrs: "PageDesign/qryStyleAttrs",
      setComptsDevSeriesData: "PageDesign/setComptsDevSeriesData", // 第三方组件给系列赋值
      handleScatterData: "PageDesign/handleScatterData",
      setDatasetType: "DataSetDesign/setDatasetType",
      queryDbColConf: "DataSetDesign/queryDbColConf", //查询数据库字段类型
      getDataSetInfo: "DataSetDesign/getDataSetInfo", //查询数据集信息
      getDataSetList: "DataSetDesign/getDataSetList",
      queryDateFormatList: "DataSetDesign/queryDateFormatList",//日期源格式查询
      setDataSetCache: "DataSetMgt/setDataSetCache",
      queryDimInfoList: "AnalyReportAttr/queryDimInfoList",
    }),
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
        for(let i=0;i<this.selectedDimData.length;i++) {
          if(this.selectedDimData[i].element_id == id){
            this.selectedDimData.splice(i,1);
            break;
          }
        }
        for(let i=0;i<this.selectedMeasureData.length;i++) {
          if(this.selectedMeasureData[i].element_id == id){
            this.selectedMeasureData.splice(i,1);
            break;
          }
        }
      }
    },
    addComputedField() {
      var ComputedDesign = this.$refs.ComputedDesign;
      ComputedDesign.saveComputedField();
    },
    cpfieldAddSuccess(cpfield){
      cpfield.element_id = getUUID();
      let list = [cpfield];
      let result = dealDataSetInfo(list,this.pageCache.pageId || "","",this.fieldTypeList,this.formatList)
      result[0].from_compt = true;
      let computedData = this.activeComp.comptAttrs.computedData;
      this.allColsData.push(result[0])
      this.allData = objDeepCopy(this.allColsData);
      if(computedData && computedData.length>0) {
        computedData.push(result[0]);
      } else {
        this.$set(this.activeComp.comptAttrs,'computedData',result);
      }
      this.showComputeDialog = false;
    },
    isOpen(item){
      //判断新增加的日期层级字段是展开还是收缩
      let isOpen = false;
      if(this.dateOpenList[item.element_id] != undefined){
        isOpen = !this.dateOpenList[item.element_id];
      }
      this.$set(this.dateOpenList, item.element_id, isOpen);
    },
    handleClick(tab) {
      //tab.name可以直接用，不要通过index判断
      this.setActiveName(tab.name);
      if (tab.name == "style") {
        //自动化测试-背景id
        let tab = this.$el.querySelector(".el-color-picker__panel");
        if (tab != null && tab.getAttribute("id") == null) {
          tab.setAttribute("id", "auto_color_panel");
        }
        let panelDom = this.$el.querySelector("#auto_color_panel");
        if (panelDom != null) {
          //画板
          let tabpanel = panelDom.querySelector(".el-color-svpanel");
          if (tabpanel != null && tabpanel.getAttribute("id") == null)
            tabpanel.setAttribute("id", "auto_svpanel");
          let vertical = panelDom.querySelector(".is-vertical");
          if (vertical != null && vertical.getAttribute("id") == null)
            vertical.setAttribute("id", "auto_vertical");
          let slider = panelDom.querySelector(".el-color-alpha-slider");
          if (slider != null && slider.getAttribute("id") == null)
            slider.setAttribute("id", "auto_slider");
          //按钮
          let tabCancel = panelDom.querySelector(".el-color-dropdown__link-btn");
          if (tabCancel != null && tabCancel.getAttribute("id") == null)
            tabCancel.setAttribute("id", "auto_color_panel_cancel");
          let tabSure = panelDom.querySelector(".el-color-dropdown__btn");
          if (tabSure != null && tabSure.getAttribute("id") == null)
            tabSure.setAttribute("id", "auto_color_panel_sure");
          let inputTab = panelDom
            .querySelector(".el-color-dropdown__btns")
            .querySelector("input");
          if (inputTab != null && inputTab.getAttribute("id") == null)
            inputTab.setAttribute("id", "auto_color_panel_input");
        }
      } else if (tab.name == "interaction") {
        this.setActiveName("interaction");
        this.setWarnData();
      }
      this.setSeriesData();
    },
    setSeriesData() {
      //设置系列值
      const comptTypeArr = [
        //"VeCombineChart",
        //"VeLine",
        // "VeHistogram" 柱
        //"VeStackHistogram",堆叠柱状
        "PcKpiBlock",
        "HdKpiBlock",
        "HdKpiBlock2",
        // "VeLineArea",
        "ElDatagrid",
        "CrossTable",
        "PivotTable",
        "VeMap",
        // "VeRadar",
        // "VeStackLineArea",
        //"VeBar",条形
        //"VeStackBar",条形堆积
        //"VeGauge",
        "VeAreaMap",
        "VeBmap",
        "VeRing",
        "HdIconKpiBlock",
        "HdKpiBlock3",
        "ElSwiper",
        "HdWater",
        "VeScatter",
        "Scatter",
        'ProgressBar'
      ];
      if (
        this.activeName == "style" &&
        comptTypeArr.includes(this.curComptDataAuth.type)
      ) {
        // this.setChartSeriesDate();
        this.setJsonData();
      }
    },
    handleClose() {
      this.upBatchDialog(false);
      this.upAggergationFunDialog(false);
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
          if (i == 0 && _this.s_edcuiCompts[1].comptAttrs.totalRow) {
            _this.$message.error(
              "表格首字段无法进行数值汇总，请将该字段设为非首字段"
            );
            _this.calc_value = "";
            columns[i].calcAttr = "";
            columns[i].calcAttrBak = "";
          }
        }
      });
    },
    todraggedItem(evt) {
      const _idx = evt.item.attributes.index.value;
      const _itemdata = objDeepCopy(this.allColsData[_idx]);
      // const _itemdata = { ...this.allColsData[_idx] };
      this.draggedItem = _itemdata;
    },
    /**
     * type 1-维度 2-钻取维度  3-度量1 4-度量2 5-过滤字段
     *  */

    deleteItem(item, type) {
      let data = [];
      switch (type) {
        case 1:
          data = this.selectedDimData;
          break;
        case 2:
          data = this.selectedDrillData;
          break;
        case 3:
          data = this.selectedMeasureData;
          break;
        case 4:
          data = this.selectedMeasureData2;
          break;
        case 5:
          data = this.filterData;
          break;
        case "query":
          data = this.selectedQueryData;
          break;
        default:
          let item = this.curComptDataAuth[type]
          if (item) {
            data = this.selectedDataObj[type.replace(/ColTitle/,'Data')];
            break;
          }
      }
      var extraDataArr = []; // 额外需要更新字段选中状态的
      for (let index = 0; index < data.length; index++) {
        if (data[index].element_id == item.element_id) {
          let curItem = objDeepCopy(data[index]);
          if (
            type == 2 &&
            (this.curComptDataAuth.type == "VeMap" ||
              this.curComptDataAuth.type == "VeAreaMap" ||
              this.curComptDataAuth.type == "VeBmap" ||
              this.activedCompt.type === 'VeBubbleMap' ||
              index == 0)
          ) {
            if (index == 0) {
              //删除第一个需要确认是否删除
              this.$confirm("确认删除该钻取？", "提示", {
                closeOnClickModal: false,
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
              })
                .then(() => {
                  let oldData = objDeepCopy(data);
                  data.splice(index, data.length - index);
                  for (let index2 = index; index2 < oldData.length; index2++) {
                    // 去掉高亮状态，日期分层级需要新增加两个判断条件（formatLevel、isNewCol）
                    let extraData = {
                      element_id: oldData[index2].element_id,
                      af_id: oldData[index2].af_id,
                      formatLevel: oldData[index2].formatLevel,
                      isNewCol: oldData[index2].isNewCol
                    };
                    this.updateFieldSelState(extraData);
                  }
                  this.firDrillField = {};
                  this.confirmUpdateData();
                })
                .catch(() => { });
            } else {
              // 对于钻取维度，删掉其中的一项，必须把它后面的全删掉的情况有：1、地图组件和区域地图组件下钻存在层级关系。2、删除第一个钻取维度
              for (let index2 = index; index2 < data.length; index2++) {
                // 去掉高亮状态
                extraDataArr.push({
                  element_id: data[index2].element_id,
                  af_id: data[index2].af_id,
                  formatLevel: data[index2].formatLevel,
                  isNewCol: data[index2].isNewCol
                });
              }
              data.splice(index, data.length - index);
            }
          } else {
            data.splice(index, 1);
          }
          if (
            type == 1 &&
            this.selectedDrillData.length > 0 &&
            curItem.element_id == this.selectedDrillData[0].element_id &&
            curItem.af_id == this.selectedDrillData[0].af_id
          ) {
            for (
              let index2 = 0;
              index2 < this.selectedDrillData.length;
              index2++
            ) {
              // 去掉高亮状态
              extraDataArr.push({
                element_id: this.selectedDrillData[index2].element_id,
                af_id: this.selectedDrillData[index2].af_id,
                formatLevel: this.selectedDrillData[index2].formatLevel,
                isNewCol: this.selectedDrillData[index2].isNewCol
              });
            }
            // 对于图形组件 删掉x轴维度，若其有钻取，则钻取的维度也要删掉
            this.selectedDrillData = [];
            this.firDrillField = {};
          }
          // 删除维度清空交叉表小计合计
          if(['CrossTable'].includes(this.activedCompt.type) && item.element_type === 1) {
            if(this.activedCompt.comptAttrs.extendSetting.subTotalCol === item.element_name) {
              this.cleanCrossCount();
            }
          }
          break;
        }
      }

      // 去掉高亮状态，日期分层级需要新增加两个判断条件（formatLevel、isNewCol）
      this.updateFieldSelState({
        element_id: item.element_id,
        af_id: item.af_id,
        formatLevel: item.formatLevel,
        isNewCol: item.isNewCol
      });
      if (extraDataArr.length > 0) {
        for (let index = 0; index < extraDataArr.length; index++) {
          this.updateFieldSelState(extraDataArr[index]);
        }
      }
      this.fieldRecord()  //保存拖入字段
    },
    itemOnMove(nv) {
      this.ismove = nv.to.className != nv.from.className ? 'different' : 'same'
      //move和end都进这里
      let _idx = -1;
      try {
        if (nv.item) {
          _idx = nv.item.attributes.index.value;
        } else {
          _idx = this.getItemInColIdx(nv.draggedContext.element);
          this.lastToClassName = nv.to.className;
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

      let className = nv.to.className || "";
      if (
        (nv.type == "end" &&
          nv.to.className == "col-block" &&
          nv.from.className == "col-block") ||
        (nv.type == "end" &&
          nv.to.className !== this.lastToClassName &&
          nv.from.className == "col-block")
      ) {
        //1,如果数据从右边拖拽，未经过其他draggable拖拽失败，nv.to.className和nv.from.className都为col-block;
        //2,如果数据从右边拖拽经过其他draggable,不符合目标位置的规则,却符合经过的draggable规则。end和最后一次move的nv.to.className不同
        className = this.lastToClassName;
      }

      if (className && typeof className.trim === "function") {
        className = className
          .replace("query-table", "")
          .replace("default-wrap", "")
          .trim();
      }

      //限制提示框
      let isOpenMessageTip = false;
      if (
        (nv.type == "end" && !this.isAddSuss) ||
        nv.from.className == nv.to.className
      ) {
        //是end事件的时候，并且移动数据失败才出现提示框
        //同一个draggable里移动时，可出现提示框
        isOpenMessageTip = true;
      }

      // 聚合计算无法参与清单设计
      if(['ElDatagrid','CrossTable'].includes(this.activedCompt.type) && this.polymerizeType == 2) {
        if(this.allColsData[_idx].is_calcul == '2'){  //
          this.openMessageTip("聚合计算无法参与清单设计", "warning", isOpenMessageTip);
          this.isAddSuss = false;
          return false;
        }
      }

      let data = [];
      // 桑基图, 指标拆解树因为没有限制维度唯一，因此需做重复维度限制
      if (['VeSankey', 'DesicionTree'].includes(this.activedCompt.type) && className == "dim-wrap") {
        data = this.selectedDimData;
        if (
          JSON.stringify(data).indexOf(this.allColsData[_idx].element_id) > -1 &&
          nv.from.className.indexOf(className) < 0
        ) {
          this.openMessageTip("字段已存在", "warning", isOpenMessageTip);
          this.isAddSuss = false;
          return false;
        }
      }
      if (
        (this.activedCompt.type == "ElDatagrid" ||
          (['CrossTable'].includes(this.activedCompt.type) && this.polymerizeType == 2)) &&
        className == "dim-wrap"
      ) {
        //表格列维度度量都可以拖  selectedMeasureData
        data = this.selectedDimData;
        if (
          JSON.stringify(data).indexOf(this.allColsData[_idx].element_id) > -1 &&
          nv.from.className.indexOf(className) < 0
        ) {
          this.openMessageTip("字段已存在", "warning", isOpenMessageTip);
          this.isAddSuss = false;
          return false;
        } else if (
          nv.from.className != nv.to.className &&
          nv.from.className != "col-block"
        ) {
          this.isAddSuss = false;
          return false;
        } else {
          this.isAddSuss = true;
          return true;
        }
      }

      // 交叉表格组件聚合情况下行列拖拽规则
      //  1、度量必须在同一轴（要不全部在行上面，要不全部在列上），如果在拖拉过程中，第二个度量不与第一个度量在同轴，必须进行提示，且无法放在不同轴上；
      // 2.不管在行还是在列，度量都要在一起，且度量必须排在维度后面
      if (
        ['CrossTable'].includes(this.activedCompt.type) &&
        this.polymerizeType == 1 &&
        ["dim-wrap", "measure1-wrap"].includes(className)
      ) {
        data = this.selectedDimData.concat(this.selectedMeasureData);
        if (
          JSON.stringify(data).indexOf(this.allColsData[_idx].element_id) > -1 &&
          nv.from.className == "col-block"
        ) {
          this.openMessageTip("字段已存在", "warning", isOpenMessageTip);
          this.isAddSuss = false;
          return false;
        } else if (
          nv.from.className != nv.to.className &&
          ![
            "dim-wrap query-table",
            "measure1-wrap query-table",
            "col-block"
          ].includes(nv.from.className)
        ) {
          //交叉表聚合 行列允许互相拖，其他不行
          this.isAddSuss = false;
          return false;
        } else {
          let curDragField = this.allColsData[_idx];
          let location = "";
          let flag1 = this.selectedDimData.some(item1 => {
            return item1.element_type == 2;
          });
          let flag2 = this.selectedMeasureData.some(item1 => {
            return item1.element_type == 2;
          });
          location = flag1 ? "dim-wrap" : flag2 ? "measure1-wrap" : "";
          //1.度量字段且从右边拖过来，要求度量与已拖入的度量在同一区域
          if (
            curDragField.element_type == 2 &&
            nv.from.className == "col-block" &&
            location != "" &&
            nv.to.className.indexOf(location) < 0
          ) {
            this.openMessageTip(
              "度量必须在同一轴",
              "warning",
              isOpenMessageTip
            );
            this.isAddSuss = false;
            return false;
          } else {
            this.isAddSuss = true;
            return true;
          }
          //2.行列字段允许互相拖，拖度量的时候应该把其他的度量全拖过来
        }
      }

      //大屏查询组件只能拖入日期字段
      if (
        this.pageCache.classTypeId == "1005" &&
        this.activedCompt.type == "MobileQuery"
      ) {
        data = this.selectedQueryData;
        if (this.allColsData[_idx].type != "ElDatePicker") {
          this.openMessageTip("请拖入日期字段", "warning", true);
          this.isAddSuss = false;
          return false;
        } else if (data.length > 0) {
          this.openMessageTip("日期字段只能拖入一个", "warning", isOpenMessageTip);
          this.isAddSuss = false;
          return false;
        }
      }

      // 增加限制，除数据过滤外，X轴只能拖一个，两条y轴的不能拖一样的
      switch (className) {
        case "dim-wrap":
          data = this.selectedDimData;
          if (this.allColsData[_idx].element_type != 1) {
            this.openMessageTip("请拖入维度字段", "warning", isOpenMessageTip);
            this.isAddSuss = false;
            return false;
          } else if (data.length > 0) {
            // 组件最多能拖入的维度数量
            const maxDimCount = {
              'PivotTable': 3,
              'ElSwiper': 2,
              'VeSankey': 5,
              'VeTree':5,
              'DesicionTree':5
            };
            const curDimLimit = maxDimCount[this.activedCompt.type];
            // 默认是维度只能拖一个
            if (curDimLimit === undefined) {
              this.openMessageTip(
                "维度字段只能拖入一个",
                "warning",
                isOpenMessageTip
              );
              this.isAddSuss = false;
              return false;
            } else if (
              data.length == 1 &&
              JSON.stringify(data).indexOf(this.allColsData[_idx].element_id) > -1 &&
              nv.from.className.indexOf(className) < 0
            ) {
              this.openMessageTip("字段已存在", "warning", isOpenMessageTip);
              this.isAddSuss = false;
              return false;
            } else if (data.length === curDimLimit) {
              // 清单轮播组件 仅支持添加两个维度、一个度量，至少需要一个维度、一个度量
              this.openMessageTip(
                `维度字段最多只能拖入${curDimLimit}个`,
                "warning",
                isOpenMessageTip
              );
              this.isAddSuss = false;
              return false;
            } else {
              this.isAddSuss = true;
              return true;
            }
          } else if (
            (this.allColsData[_idx].selected || this.allColsData.filter((adata, i) => (adata.element_id ===this.allColsData[_idx].element_id && i != _idx && adata.selected)).length > 0) &&
            nv.from.className.indexOf("col-block") > -1 &&
            JSON.stringify(data).indexOf(this.allColsData[_idx].element_id) < 0
          ) {
            this.openMessageTip("该字段已被使用", "warning", isOpenMessageTip);
            this.isAddSuss = false;
            return false;
          } else if (
            JSON.stringify(data).indexOf(this.allColsData[_idx].element_id) > -1 &&
            nv.from.className.indexOf(className) < 0
          ) {
            this.openMessageTip("字段已存在", "warning", isOpenMessageTip);
            this.isAddSuss = false;
            return false;
          } else if (
            nv.from.className != nv.to.className &&
            nv.from.className != "col-block"
          ) {
            this.isAddSuss = false;
            return false;
          } else {
            this.isAddSuss = true;
            return true;
          }
          break;
        case "drill-dim-wrap":
          data = this.selectedDrillData;
          if (this.allColsData[_idx].element_type != 1) {
            this.openMessageTip("请拖入维度字段", "warning", isOpenMessageTip);
            this.isAddSuss = false;
            return false;
          } else if (
            JSON.stringify(data).indexOf(this.allColsData[_idx].element_id) > -1 &&
            nv.from.className.indexOf(className) < 0
          ) {
            this.openMessageTip("字段已存在", "warning", isOpenMessageTip);
            this.isAddSuss = false;
            return false;
          } else {
            if (["VeMap", "VeAreaMap", 'VeBubbleMap'].includes(this.activeComp.type)) {
              let dimList =
                this.dimInfoMap.get(this.selectedDrillData[0].dim_level_id) ||
                [];
              if (
                this.allColsData[_idx].dim_id ==
                this.selectedDrillData[0].dim_id &&
                dimList[this.selectedDrillData.length].dim_level_id ==
                this.allColsData[_idx].dim_level_id
              ) {
                if (this.selectedDrillData.length == 5) {
                  this.openMessageTip(
                    "最多仅支持4层的钻取",
                    "warning",
                    isOpenMessageTip
                  );
                  this.isAddSuss = false;
                  return false;
                } else {
                  this.isAddSuss = true;
                  return true;
                }
              } else {
                this.openMessageTip("无层级关系", "warning", isOpenMessageTip);
                this.isAddSuss = false;
                return false;
              }
            } else {
              if (this.selectedDrillData.length == 5) {
                this.openMessageTip(
                  "最多仅支持4层的钻取",
                  "warning",
                  isOpenMessageTip
                );
                this.isAddSuss = false;
                return false;
              } else {
                this.isAddSuss = true;
                return true;
              }
            }
          }
          break;
        case "measure1-wrap":
        case "measure2-wrap":
          data =
            className == "measure1-wrap"
              ? this.selectedMeasureData
              : this.selectedMeasureData2;
          if (this.allColsData[_idx].element_type != 2) {
            this.openMessageTip("请拖入度量字段", "warning", isOpenMessageTip);
            this.isAddSuss = false;
            return false;
          } else if (
            this.allColsData[_idx].selected &&
            nv.from.className.indexOf("col-block") > -1 &&
            JSON.stringify(data).indexOf(this.allColsData[_idx].element_id) < 0
          ) {
            this.openMessageTip("该字段已被使用", "warning", isOpenMessageTip);
            this.isAddSuss = false;
            return false;
          } else if (
            JSON.stringify(data).indexOf(this.allColsData[_idx].element_id) > -1 &&
            nv.from.className.indexOf(className) < 0
          ) {
            this.openMessageTip("字段已存在", "warning", isOpenMessageTip);
            this.isAddSuss = false;
            return false;
          } else if (
            nv.from.className != nv.to.className &&
            nv.from.className != "col-block"
          ) {
            this.isAddSuss = false;
            return false;
          } else if (
            ([
              "VePie",
              "VeGauge",
              "HdKpiBlock",
              "HdKpiBlock2",
              "HdIconKpiBlock",
              "VeRing",
              "HdFlopDevice",
              "VeAreaMap",
              "HdTopFive",
              "VeRosePie",
              "ElSwiper",
              "HdWater",
              "VeWordCloud",
              'VeBubbleMap',
              "VeWordCloud",
              "VeSankey",
              "VeWaterfall",
              "VeTreemap",
              "VeBmap",
              "VeDoughnutPie",
              "VeTree",
              "DesicionTree"
            ].includes(this.curComptDataAuth.type) ||
            (this.selectedDataObj._legendData||[]).length > 0 // 含有图例维度，只能拖入一个度量
            ) &&
            data.length > 0
          ) {
            //指标、饼图的度量只能有1个字段
            this.openMessageTip(
              "度量字段只能拖入一个",
              "warning",
              isOpenMessageTip
            );
            this.isAddSuss = false;
            return false;
          } else if (
            this.curComptDataAuth.type == "HdKpiBlock3" &&
            data.length >= 2
          ) {
            //指标3只能支持2个度量
            //指标、饼图的度量只能有1个字段
            this.openMessageTip(
              "度量字段只能拖入两个",
              "warning",
              isOpenMessageTip
            );
            this.isAddSuss = false;
            return false;
          } else if (
            this.curComptDataAuth.type == "VeMap" &&
            data.length >= 1
          ) {
            //地图的度量最多支持八个
            this.openMessageTip(
              "度量字段最多支持一个",
              "warning",
              isOpenMessageTip
            );
            this.isAddSuss = false;
            return false;
          } else {
            this.isAddSuss = true;
            return true;
          }
          break;
        case "query-filter":
          if (this.allColsData[_idx].is_calcul == "1" || this.allColsData[_idx].is_calcul == "2") {
            // 计算度量不能作为查询条件
            this.openMessageTip(
              "计算字段不能作为过滤条件",
              "warning",
              isOpenMessageTip
            );
            this.isAddSuss = false;
            return false;
          }
          if (
            JSON.stringify(this.filterData).indexOf(this.allColsData[_idx].element_id) >
            -1 &&
            nv.from.className != "query-filter"
          ) {
            this.openMessageTip("数据过滤已存在", "warning", isOpenMessageTip);
            this.isAddSuss = false;
            return false;
          } else if (
            nv.from.className != nv.to.className &&
            nv.from.className != "col-block"
          ) {
            this.isAddSuss = false;
            return false;
          } else {
            this.isAddSuss = true;
            return true;
          }
          break;
        case "":
          data = this.selectedQueryData;
          if (this.allColsData[_idx].is_calcul == "1" || this.allColsData[_idx].is_calcul == "2") {
            // 计算度量不能作为查询条件
            this.openMessageTip(
              "计算字段不能作为查询条件",
              "warning",
              isOpenMessageTip
            );
            this.isAddSuss = false;
            return false;
          }
          if (
            JSON.stringify(data).indexOf(this.allColsData[_idx].element_id) > -1 &&
            nv.from.className != "query-table"
          ) {
            this.openMessageTip("查询组件已存在", "warning", isOpenMessageTip);
            this.isAddSuss = false;
            return false;
          } else if (
            nv.from.className != nv.to.className &&
            nv.from.className != "col-block"
          ) {
            this.isAddSuss = false;
            return false;
          } else {
            this.isAddSuss = true;
            return true;
          }
          break;
        default:
          let k = className.replace(/-wrap/,'')
          let item = this.curComptDataAuth[k]
          if (!item) {
            return
          }
          item.count = this.resetDragRestrict(item);
          data = this.selectedDataObj[k.replace(/ColTitle/,'Data')];
          let text = '维度'
          if (item.elementType === 2) {
            text = '度量'
          } else if (item.elementType === 0) {
            text = '维度或度量'
          } else if (k === '_legendColTitle') {
            text = item.name
          }
          // 图例维度： 度量不止一个，则不可拖入维度图例  this.selectedDataObj._legendData.length
          if (k === '_legendColTitle' && (this.selectedMeasureData.length > 1 || this.selectedMeasureData2.length > 1)) {
            this.openMessageTip(`度量字段超过一个，无法添加颜色图例！`, "warning", isOpenMessageTip);
            this.isAddSuss = false;
            return false;
          }
          
          //维度、度量类型限制
          if(item.colType && item.colType.length > 0){
            const dragField= this.allColsData[_idx];
            const isConform = item.colType.includes(dragField.col_type);
            if(!isConform) {
              this.openMessageTip(`维度只能为${item.colType.join("、")}类型`, "warning", isOpenMessageTip);
              this.isAddSuss = false;
              return false;
            }
          }
          
          // 气泡图不限制大小度量和其他相同
          let scatterSizeBool = (k === 'sizeMeasureColTitle' && this.curComptDataAuth.type === 'Scatter') ? false : true
          if (this.allColsData[_idx].element_type != item.elementType && item.elementType !== 0) {
            this.openMessageTip(`请拖入${text}字段`, "warning", isOpenMessageTip);
            this.isAddSuss = false;
            return false;
          } else if (data.length >= item.count && item.count > -1) {
            let tipStr = `${text}字段最多只能拖入${item.count}个`;
            if (this.curComptDataAuth.type == 'VeFunnel' && item.count === 0) {
              tipStr = '已设置多个度量，无法添加维度！';
            }
            this.openMessageTip(
              tipStr,
              "warning",
              isOpenMessageTip
            );
            this.isAddSuss = false;
            return false;
          } else if (
            scatterSizeBool &&
            (this.allColsData[_idx].selected || this.allColsData.filter((adata, i) => (adata.element_id ===this.allColsData[_idx].element_id && i != _idx && adata.selected)).length > 0) &&
            nv.from.className.indexOf("col-block") > -1 &&
            JSON.stringify(data).indexOf(this.allColsData[_idx].element_id) < 0
          ) {
            this.openMessageTip("该字段已被使用", "warning", isOpenMessageTip);
            this.isAddSuss = false;
            return false;
          } else if (
            JSON.stringify(data).indexOf(this.allColsData[_idx].element_id) > -1 &&
            nv.from.className.indexOf(className) < 0
          ) {
            this.openMessageTip("字段已存在", "warning", isOpenMessageTip);
            this.isAddSuss = false;
            return false;
          } else if (
            nv.from.className != nv.to.className &&
            nv.from.className != "col-block"
          ) {
            this.isAddSuss = false;
            return false;
          } else {
            this.isAddSuss = true;
            return true;
          }
          break;
      }
      this.fieldRecord()  //保存拖入字段
    },
    // 重置拖动限制
    resetDragRestrict(item) {
      // 漏斗图
          if (this.curComptDataAuth.type == 'VeFunnel') {
            // 在拖维度时，如果度量数量超过一条，则不允许拖入维度
            if (item.elementType === 1) {
              item.count = this.selectedDataObj.yMeasureData.length > 1 ? 0 : 1;
            }
            // 在拖度量时，如果还未拖入维度，则最多允许拖10个度量
            if (item.elementType === 2) {
              item.count = this.selectedDataObj.xMeasureData.length === 0 ? 10 : 1;
            }
          }
          return item.count;
    },
    getItemInColIdx(row) {
      let _idx = -1;
      for (let index = 0; index < this.allColsData.length; index++) {
      //日期分层级需要新增加两个判断条件（formatLevel、isNewCol）
        if (this.allColsData[index].element_id == row.element_id && this.allColsData[index].formatLevel == row.formatLevel && this.allColsData[index].isNewCol == row.isNewCol) {
          _idx = index;
          break;
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
        title.indexOf(".") === -1 ? title = nv.item.querySelector('.col-span').children[1].innerText : null
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
      if (nv.to.className && nv.to.className.indexOf("query-table") > -1) {
        this.$set(this.allData[_idx], "selected", true);
        this.filterNode(this.filterText);
      }
      // 对于从x,y,数据钻取的字段里面拖到数据过滤的，要更新选中状态
      if (
        nv.to.className &&
        nv.to.className.indexOf("query-filter") > -1 &&
        nv.from.className.indexOf("query-table") > -1
      ) {
        this.$set(this.allData[_idx], "selected", false);
        if (
          nv.from.className.indexOf("dim-wrap") > -1 &&
          this.allData[_idx].element_id == this.selectedDrillData[0].element_id
        ) {
          // 若是从维度拖过来的，如果当前有设置钻取，则清空钻取维度信息
          for (let index = 0; index < this.selectedDrillData.length; index++) {
            let idx2 = this.getItemInColIdx(this.selectedDrillData[index]);
            this.$set(this.allData[idx2], "selected", false);
          }
          this.selectedDrillData = [];
        }
        this.filterNode(this.filterText);
      }

      // 只有地图、区域地图的维层有层级关系，对于钻取维度，放下重新排序
      if (
        nv.to.className.indexOf("drill-dim-wrap") > -1 &&
        this.selectedDrillData.length > 1 &&
        ["VeMap", "VeAreaMap", 'VeBubbleMap'].includes(this.activeComp.type)
      ) {
        let firLevelDim =
          this.selectedDimData.length > 1
            ? this.firDrillField.dim_level_id
            : this.selectedDimData[0].dim_level_id;
        let dimLevelList = this.dimInfoMap.get(firLevelDim) || [];
        if (dimLevelList.length > 0) {
          let newDrillList = [];
          for (let index = 0; index < dimLevelList.length; index++) {
            for (
              let index2 = 0;
              index2 < this.selectedDrillData.length;
              index2++
            ) {
              if (
                this.selectedDrillData[index2].dim_level_id ==
                dimLevelList[index].dim_level_id
              ) {
                let dimItem = objDeepCopy(this.selectedDrillData[index2]);
                dimItem.dimOrder = index;
                newDrillList.push(dimItem);
              }
            }
          }
          this.selectedDrillData = newDrillList;
        }
      }

      // 对于交叉表格组件，行列互拖时，如果时拖度量，要把剩余的度量全拖进来。
      if (this.activeComp.type == "CrossTable" && this.polymerizeType == 1) {
        let classArr1 = ["dim-wrap query-table", "measure1-wrap query-table"];
        let curDragItem = this.allData[_idx];
        let targetClass = (nv.to.className || "")
          .replace("default-wrap", "")
          .trim();
        let sourceClass = (nv.from.className || "")
          .replace("default-wrap", "")
          .trim();
        if (
          targetClass != sourceClass &&
          classArr1.includes(targetClass) &&
          classArr1.includes(sourceClass) &&
          curDragItem.element_type == 2
        ) {
          //
          let targetData =
            nv.to.className.indexOf("dim-wrap") > -1
              ? this.selectedDimData
              : this.selectedMeasureData;
          let sourceData =
            nv.to.className.indexOf("dim-wrap") > -1
              ? this.selectedMeasureData
              : this.selectedDimData;
          let measureData1 = sourceData.filter(item => {
            return item.element_type == 2;
          });

          if (nv.to.className.indexOf("dim-wrap") > -1) {
            // 如果是拖到“拖至此”那个块块上，要记得把数据搬过来
            // if (nv.from.className.indexOf("default-wrap") > -1) {
            //   this.selectedDimData.push(this.draggableTempData[0]);
            //   this.draggableTempData = [];
            // }
            this.selectedDimData = targetData.concat(measureData1);
            this.selectedMeasureData = sourceData.filter(item => {
              return item.element_type != 2;
            });
          } else {
            // 如果是拖到“拖至此”那个块块上，要记得把数据搬过来
            // if (nv.from.className.indexOf("default-wrap") > -1) {
            //   this.selectedMeasureData.push(this.draggableTempData[0]);
            //   this.draggableTempData = [];
            // }
            this.selectedMeasureData = targetData.concat(measureData1);
            this.selectedDimData = sourceData.filter(item => {
              return item.element_type != 2;
            });
          }
          // targetData = targetData.concat(measureData1);
          // sourceData = sourceData.filter(item => {
          //   return item.element_type != 2;
          // });
        }

        // 拖完结束后检查如果原来在行的字段被拖到列的字段中，此时钻取字段要清空
        if (
          this.selectedDrillData.length > 0 &&
          !this.selectedDimData.some(item3 => {
            return item3.element_id == this.selectedDrillData[0].element_id;
          })
        ) {
          this.selectedDrillData = [];
        }
      }
      this.fieldRecord()  //保存拖入字段
      // this.reSortAxisData();
    },
    itemOnadd(nv) {
      if (this.isAddSuss) {
        this.addToArea(nv);
        let className = nv.to.className || "";
        if (className && typeof className.trim === "function") {
          //className = className.replace(/(\w*)query-table(.*)default-wrap(.*)/g, "").trim();
          className = className
            .replace("query-table", "")
            .replace("default-wrap", "")
            .trim();
        }
        let data = [];
        switch (className) {
          case "dim-wrap":
            data = this.selectedDimData;
            break;
          case "drill-dim-wrap":
            data = this.selectedDrillData;
            break;
          case "measure1-wrap":
          case "measure2-wrap":
            data =
              className == "measure1-wrap"
                ? this.selectedMeasureData
                : this.selectedMeasureData2;
            break;
          case "query-filter":
            data = this.filterData;
            break;
          case "":
            data = this.selectedQueryData;
            break;
          default:
            let key = className.split('-')[0]
            let item = this.curComptDataAuth[key]
            if (item) {
              const preName = key.replace(/ColTitle/,'')
              data = this.selectedDataObj[`${preName}Data`]
            }
            break;
        }
        data.push(this.draggableTempData[0]);
        this.fieldRecord();
      }
      this.draggableTempData = [];
      // this.reSortAxisData();
    },
    openFilterSet() {
      // 过滤器弹窗
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
      this.fieldRecord();
      this.datafilterDialogVisible = false;
    },
    setSort(val, selectType, sort) {
      // sort 1 asc,2 desc
      //selectType  1.selectedDimData 2.selectedDrillData 3.selectedMeasureData 4.selectedMeasureData2
      //表格可支持多个字段排序，其他只支持一个字段排序。
      const selectedData = Object.values(this.selectedDataObj)
      const selectedDataArr = selectedData.reduce((cur, next) => cur = [...cur, ...next], [])
      var tableData = (this.selectedDimData || [])
        .concat(this.selectedMeasureData || [])
        .concat(this.selectedMeasureData2 || [])
        .concat(selectedDataArr);
      if (selectType == 2) {
        //清空其他sort排序
        tableData.forEach((item, i) => {
          this.$set(tableData[i], "sort", null);
        });
        tableData = this.selectedDrillData;
      } else {
        this.selectedDrillData.forEach((item, i) => {
          this.$set(this.selectedDrillData[i], "sort", null);
        });
      }
      tableData.forEach((item, i) => {
        if (item.col_id == val.col_id) {
          if (tableData[i].sort == sort) {
            this.$set(tableData[i], "sort", null);
          } else {
            this.$set(tableData[i], "sort", sort);
          }
        } else {
          if (!['ElDatagrid','CrossTable','PivotTable'].includes(this.activeComp.type)) {
            this.$set(tableData[i], "sort", null);
          }
        }
      });
      this.fieldRecord();
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
        .catch(function (error) {
          // _this.$message.error("数据集加载失败");
        });
    },
    unique(arr) {
      const res = new Map();
      return arr.filter(arr => !res.has(arr.datasetId) && res.set(arr.datasetId, 1));
    },
    getColsData(value, callback) {
      //, cd, td
      let _this = this;
      // 置空
      this.filterText1 = "";
      this.wdCheckAll = false;
      this.dlCheckAll = false;
      this.tabWdCheckAll = false;
      this.tabDlCheckAll = false;
      this.wdChecked = false;
      this.dlChecked = false;
      this.wdtableCols = [];
      this.upFilterData({ data: [], type: "reset" });
      this.selectedDimData = [];
      this.selectedDrillData = [];
      this.selectedMeasureData = [];
      this.selectedMeasureData2 = [];
      this.selectedQueryData = [];
      this.selectedDataObj = JSON.parse(JSON.stringify(this.dataObjBak||{}))
      let datasetId = value;
      /*let anly_subject_id = "";
      for (let i = 0; i < this.allTablesData.length; i++) {
        if (this.allTablesData[i].datasetId == value) {
          datasetId = this.allTablesData[i].datasetId;
          // _this.upComptDatasetName(this.allTablesData[i].af_name);
          break;
        }
      }*/
      let param = {
        datasetId,
        isQueryTabHis: 1,
        isEdit: 0
      };
      this.upAllCols([]);
      this.wdColsLen = 0;
      this.dlColsLen = 0;
      this.queryDbColConf({}).then(response => {
        if (response.status == 200 && response.data.respResult == "1") {
          this.fieldTypeList = response.data.respData || {};
          this.queryDateFormatList({}).then(response => {
            if (response.status == 200 && response.data.respResult == "1") {
              this.formatList = response.data.respData || [];
              this.getDataSetInfo({
                type: "dataasset",
                param: param
              }).then(function (response) {
                  _this.setSelectAf(datasetId);
                  if (
                    response.data.respResult == 1 &&
                    response.data.respErrorCode != -1 &&
                    response.status == 200 &&
                    response.data.respData
                  ) {
                    const respData = mapDataSetInfoKey(response.data.respData)
                    const data = respData.anly_frame_elements || []
                    _this.upComptDatasetName(respData.af_name);
                    if (data.length === 0) {
                      return
                    }
                    _this.datasetDetail = respData;
                    _this.upAllCols(
                      dealDataSetInfo(
                        data,
                        _this.pageCache.pageId || "",
                        respData.af_name,
                        _this.fieldTypeList,
                        _this.formatList
                      )
                    );
                    // 如果组件有计算字段拼接到度量里面
                    let computedData = _this.activeComp.comptAttrs.computedData || [];
                    if(computedData.length > 0) {
                      concatComputedData(datasetId, _this.allColsData, computedData);
                    }

                    _this.allData = objDeepCopy(_this.allColsData);
                    _this.$set(
                      _this.datasetMap,
                      datasetId,
                      objDeepCopy(_this.allColsData)
                    );

                    if (typeof callback === "function") {
                      callback();
                    }
                  }
                })
                .catch(function (error) {
                  console.error(error);
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
    //更新数据时候更新数据列
    updateData(comptData, isSaveWhereBean) {
      let newData = objDeepCopy(this.activedCompt);
      let oldYAxis1Data = objDeepCopy(this.activedCompt.comptAttrs.yAxis1Data);
      let oldYAxis2Data = objDeepCopy(this.activedCompt.comptAttrs.yAxis2Data);

      if(this.activedCompt.type === "CrossTable") {
        if(this.polymerizeType == 1) {
          //交叉表聚合
          this.activedCompt["oriComptDataBak"] = objDeepCopy(
            comptData.result_data_list || []
          );
          this.activedCompt['mergeList'] = comptData.result_merge_list
        }
        this.$refs.styleAttr.showSubTotalCol(null,null);
      }
      if ('PivotTable' === this.activedCompt.type) {
        this.$refs.styleAttr.showSubTotalCol(null,null);
      }
      comptData.rows = comptData.rows == null ? [] : comptData.rows;
      if (
        comptData.columns != undefined &&
        comptData.columns.length > 0 &&
        comptData.columns.indexOf("XXXXCODE") > -1
      ) {
        // 对于维度字段有维层绑定的，XXXXCODE列存的该字段对应的未翻译的编码
        comptData.columns.pop();
      }

      if (['CrossTable'].includes(newData.type)) {
        let subTotalObj = this.activedCompt.styleAttrs[3].children[0]
        let totalColIndex = 1
        if (subTotalObj.enName !== 'subTotalCol') {
          this.activedCompt.styleAttrs[3].children.some((attr, i) => {
            if (attr.enName !== 'subTotalCol') {
              return false
            }
            totalColIndex = i
            subTotalObj = attr
            return true
          })
        }
        let colVal = this.activedCompt.styleAttrs[3].children[totalColIndex].value
        this.activedCompt.comptAttrs.extendSetting['subTotalCol'] = subTotalObj.value && colVal
      }
      if(newData.type === "VeCombineChart"||newData.type === "VeCombineStack"){//组合图左右轴字段变化更新。例如，左轴字段拉到右轴，字段要更新，不在保留原样式
        oldYAxis1Data.forEach((item, i) => {
          if(JSON.stringify(newData.comptAttrs.yAxis1Data).indexOf(item.element_id) == -1 && newData.comptAttrs.colSetting[item.element_id] != undefined){
            delete this.activedCompt.comptAttrs.colSetting[item.element_id];
          }
        });
        oldYAxis2Data.forEach((item, i) => {
          if(JSON.stringify(newData.comptAttrs.yAxis2Data).indexOf(item.element_id) == -1 && newData.comptAttrs.colSetting[item.element_id] != undefined){
            delete this.activedCompt.comptAttrs.colSetting[item.element_id];
          }
        });
      }
      if (newData.type === "HdIconKpiBlock") {
        this.activedCompt.comptAttrs.seriesSelected = [];
        this.selectedMeasureData.map(item => {
          this.activedCompt.comptAttrs.seriesSelected.push(item.element_name);
        });
      }
      if (newData.type === "PcKpiBlock") {
        let seriesAttrs;
        let comptAttrs = this.activedCompt.comptAttrs;
        let extendSetting = comptAttrs.extendSetting;
        this.activedCompt.afId = this.value;
        this.activedCompt.comptAttrs.seriesSelected = [];
        this.selectedMeasureData.map(item => {
          this.activedCompt.comptAttrs.seriesSelected.push(item.element_name);
        });
        this.activedCompt.comptData = objDeepCopy(comptData);
        this.activedCompt.comptAttrs.filterData = objDeepCopy(
          newData.comptAttrs.filterData
        );
        this.activedCompt.comptAttrs.xAxisData = objDeepCopy(
          newData.comptAttrs.xAxisData
        );
        this.activedCompt.comptAttrs.yAxis1Data = objDeepCopy(
          newData.comptAttrs.yAxis1Data
        );
        this.activedCompt.comptAttrs.yAxis2Data = objDeepCopy(
          newData.comptAttrs.yAxis2Data
        );
        if (isSaveWhereBean) {
          let wbean = objDeepCopy(this.datafilterCols());
          newData.comptAttrs.whereBean = {
            exp: wbean.exp_,
            rule_list: wbean.rule_list
          };
          this.activedCompt.comptAttrs.whereBean = objDeepCopy(
            newData.comptAttrs.whereBean
          );
        }

        this.activedCompt.styleAttrs.forEach((data, index) => {
          if (data.enName == "seriesAttrs") {
            seriesAttrs = data.children;
          }
        });

        // seriesAttrs.forEach(seriesOptions => {
        //   switch (seriesOptions.enName) {
        //     case "comptData":
        //     case "rename":
        //     case "decimalDigit":
        //     case "riseIconColor":
        //     case "dropIconColor":
        //       seriesOptions.value = null;
        //       break;
        //     case "riseNum":
        //     case "dropNum":
        //       seriesOptions.inputValue = null;
        //       break;
        //   }
        // });

        //缓存系列
        if (extendSetting.series && extendSetting.series.length > 0) {
          extendSetting.cacheSeries = [...extendSetting.series];
        }
        //重载初始化系列(因拖拽排序后需载新的系列数据)
        let reinitialSeries = [];
        this.activedCompt.comptData.columns.forEach((data, index) => {
          if (index > 0) {
            reinitialSeries.push({
              name: data,
              id: comptAttrs.yAxis1Data[index - 1].element_id,
              decimalDigit: 3
            });
          }
        });
        //将缓存数据与新的系列数据匹配并进行属性合并
        if (extendSetting.cacheSeries && extendSetting.cacheSeries.length > 0) {
          reinitialSeries.forEach((seriesData, seriesIndex) => {
            extendSetting.cacheSeries.forEach(
              (cacheSeriesData, cacheSeriesIndex) => {
                if (seriesData.id === cacheSeriesData.id) {
                  Object.assign(seriesData, cacheSeriesData);
                }
              }
            );
          });
        }
        //重新赋值系列
        extendSetting.series = [...reinitialSeries];
        //重新赋值选中索引值
        if (extendSetting.cacheSeries && extendSetting.cacheSeries.length > 0) {
          comptAttrs.selectIndex = extendSetting.series.findIndex(function (
            series
          ) {
            return (
              series.id == extendSetting.cacheSeries[comptAttrs.selectIndex].id
            );
          });
        }
        //当度量删除剩下一个时，系列值选中值调整
        if (comptAttrs.selectIndex == -1) {
          comptAttrs.selectIndex = 0;
          seriesAttrs.forEach(seriesOptions => {
            switch (seriesOptions.enName) {
              case "rename":
                seriesOptions.value = extendSetting.series[0].name;
                break;
              case "decimalDigit":
                seriesOptions.value = extendSetting.series[0].decimalDigit;
                break;
              case "riseIconColor":
                seriesOptions.value = extendSetting.series[0].riseIconColor;
                break;
              case "dropIconColor":
                seriesOptions.value = extendSetting.series[0].dropIconColor;
                break;
              case "riseNum":
                seriesOptions.value = extendSetting.series[0].riseNum;
                break;
              case "dropNum":
                seriesOptions.value = extendSetting.series[0].dropNum;
                break;
              case "setCondi":
                seriesOptions.value = extendSetting.series[0].setCondi;
                break;
            }
          });
        }
      }
      //指标1-2-3模块使用
      else if (
        newData.type === "HdKpiBlock" ||
        newData.type === "HdKpiBlock2" ||
        newData.type === "HdKpiBlock3"
      ) {
        // let commonAttrs;
        let extendSetting = this.activedCompt.comptAttrs.extendSetting;
        this.activedCompt.afId = this.value;
        this.activedCompt.comptAttrs.seriesSelected = [];
        this.selectedMeasureData.map(item => {
          this.activedCompt.comptAttrs.seriesSelected.push(item.element_name);
        });
        this.activedCompt.comptData = objDeepCopy(comptData);
        this.activedCompt.comptAttrs.filterData = objDeepCopy(
          newData.comptAttrs.filterData
        );
        this.activedCompt.comptAttrs.xAxisData = objDeepCopy(
          newData.comptAttrs.xAxisData
        );
        this.activedCompt.comptAttrs.yAxis1Data = objDeepCopy(
          newData.comptAttrs.yAxis1Data
        );
        this.activedCompt.comptAttrs.yAxis2Data = objDeepCopy(
          newData.comptAttrs.yAxis2Data
        );
        if (isSaveWhereBean) {
          let wbean = objDeepCopy(this.datafilterCols());
          newData.comptAttrs.whereBean = {
            exp: wbean.exp_,
            rule_list: wbean.rule_list
          };
          this.activedCompt.comptAttrs.whereBean = objDeepCopy(
            newData.comptAttrs.whereBean
          );
        }

        //指标区间值存储容器
        // this.activedCompt.styleAttrs.forEach((data, index) => {
        //   if (data.enName == "commonAttrs") {
        //     commonAttrs = data.children;
        //   }
        // });

        //数值设置遍历
        // commonAttrs.forEach(seriesOptions => {
        //   switch (seriesOptions.enName) {
        //     case "comptData":
        //     case "rename":
        //     case "decimalDigit":
        //     case "riseIconColor":
        //     case "dropIconColor":
        //       seriesOptions.value = null;
        //       break;
        //     case "riseNum":
        //     case "dropNum":
        //       seriesOptions.inputValue = null;
        //       break;
        //   }
        // });
        if (extendSetting.series && extendSetting.series.length > 0) {
          extendSetting.cacheSeries = [...extendSetting.series];
        }
        let reinitialSeries = [];
        extendSetting.unitData = []; //单位数据

        this.activedCompt.comptData.columns.forEach((data, index) => {
          if (index === 0 || index > 0) {
            this.activedCompt.comptAttrs.extendSetting.unitData = [];
            if (extendSetting.series.length > 0) {
              this.activedCompt.styleAttrs[2].children[5].value = extendSetting
                .series[index].setCondi
                ? extendSetting.series[index].setCondi
                : false; // 是否启用条件格式
            }
            //这个是用来设置预警值
            reinitialSeries.push({
              name: data,
              id: this.activedCompt.comptAttrs.yAxis1Data[index].element_id
            });
            //单位
            var d = this.activedCompt.styleAttrs[1].children[4].value;
            this.activedCompt.comptAttrs.extendSetting.unitData.push({
              textname: d
            });
          }
        });

        if (extendSetting.cacheSeries && extendSetting.cacheSeries.length > 0) {
          reinitialSeries.forEach((seriesData, seriesIndex) => {
            extendSetting.cacheSeries.forEach(
              (cacheSeriesData, cacheSeriesIndex) => {
                if (seriesData.id == cacheSeriesData.id) {
                  Object.assign(seriesData, cacheSeriesData);
                }
              }
            );
          });
        }

        extendSetting.series = [...reinitialSeries];
      } else {
        // 维度重新排序
        let drillData1 = [];
        drillData1 = this.selectedDrillData.map(item => {
          return {
            af_id: item.af_id,
            element_id: item.element_id,
            sort: item.sort,
            formatLevel: item.formatLevel,
            isNewCol: item.isNewCol
          };
        });

        newData.comptAttrs.drillData = drillData1;
        //初始化时xAxisData为空
        let oriAfId = this.activedCompt.afId;

        // 清单轮播组件列设置备份初始化
        if (["ElSwiper", 'ProgressBar'].includes(this.activedCompt.type)) {
          this.$set(
            this.activedCompt.comptAttrs,
            "colSetting",
            this.initColSetting(this.activedCompt.type)
          );
        }

        // 不用整个$set
        this.activedCompt.afId = this.value;
        this.activedCompt.comptAttrs.filterData = objDeepCopy(
          newData.comptAttrs.filterData
        );
        this.activedCompt.comptAttrs.xAxisData = objDeepCopy(
          newData.comptAttrs.xAxisData
        );
        this.activedCompt.comptAttrs.yAxis1Data = objDeepCopy(
          newData.comptAttrs.yAxis1Data
        );
        this.activedCompt.comptAttrs.yAxis2Data = objDeepCopy(
          newData.comptAttrs.yAxis2Data
        );
        this.activedCompt.comptAttrs.drillData = objDeepCopy(
          newData.comptAttrs.drillData
        );

        if (isSaveWhereBean) {
          let wbean = objDeepCopy(this.datafilterCols());
          newData.comptAttrs.whereBean = {
            exp: wbean.exp_,
            rule_list: wbean.rule_list
          };
          this.activedCompt.comptAttrs.whereBean = objDeepCopy(
            newData.comptAttrs.whereBean
          );
        }

        if (
          newData.comptAttrs["mainLinkageData"] != undefined &&
          newData.comptAttrs.mainLinkageData.length > 0
        ) {
          //如果自己是主联动
          // 保存绑定钻取信息后，还要遍历删除主联动设置  "linkageCondi"和"mainLinkageData"
          // 如果在这期间删除了原来设置的联动字段，换了别的字段或者更换数据集，应该清掉原来设置的联动
          let newRelElIds = [];
          let newXData = this.selectedDimData;
          for (let index = 0; index < newXData.length; index++) {
            const element = newXData[index];
            if (element.element_type == 1) {
              newRelElIds.push(element.element_id);
            }
          }
          let oriAllMainData = objDeepCopy(newData.comptAttrs.mainLinkageData);
          let newAllMainData = oriAllMainData.filter(item => {
            return newRelElIds.includes(item.rel_element_id);
          });
          let oriRelElIds = []; // 未更新数据前的维度字段
          for (let index = 0; index < oriAllMainData.length; index++) {
            const element = oriAllMainData[index];
            if (!oriRelElIds.includes(element.rel_element_id))
              oriRelElIds.push(element.rel_element_id);
          }

          if (
            oriAfId == newData.afId &&
            (newRelElIds.length != oriRelElIds.length ||
              newRelElIds.sort().toString() != oriRelElIds.sort().toString() ||
              drillData1.length > 0)
          ) {
            //更新前后维度字段不完全一样
            for (let index = 0; index < oriRelElIds.length; index++) {
              const element = oriRelElIds[index];
              if (!newRelElIds.includes(element) || drillData1.length > 0) {
                const relMainData = getFilteredData(
                  oriAllMainData,
                  "rel_element_id",
                  element
                );
                this.clearLinkageSet(relMainData, element);
              }
            }
          }
          if (drillData1.length > 0) {
            newAllMainData = [];
          }

          newData.comptAttrs.mainLinkageData = newAllMainData;
          this.activedCompt.comptAttrs.mainLinkageData = objDeepCopy(
            newAllMainData
          );
        }

        if (this.activedCompt.type == "PivotTable") {
          // 为确保如果总计也开启，同时查出总计，所以采取调用组件内部请求的方式
          this.$set(this.activedCompt, 'refreshDataKey', (this.activedCompt.refreshDataKey || 0) + 1);
        }

        // 表格组件
        if (
          this.activedCompt.type == "ElDatagrid" ||
          (['CrossTable'].includes(this.activeComp.type) && this.polymerizeType == 2)
        ) {
          this.activedCompt.comptAttrs.extendSetting[
            "pagination.currentPage"
          ] = 1;
          this.activedCompt.comptAttrs.extendSetting[
            "pagination.total"
          ] = Number(comptData.totalCount);
          comptData.rows = comptData.data;
          let allColumns = newData.comptAttrs.xAxisData.concat(
            newData.comptAttrs.yAxis1Data
          );
          //如果处于下钻状态，把下钻的第一层换成下钻当前层
          if (
            this.activedCompt.comptAttrs.drillData.length > 0 &&
            this.activedCompt.comptAttrs.curDrillIdx > 0
          ) {
            let drillData = this.activedCompt.comptAttrs.drillData;
            let allDillCol =
              constructList(drillData, this.datasetMap, this.activedCompt.comptAttrs.computedData || []).resultList || [];

            for (let inx = 0; inx < allColumns.length; inx++) {
              if (allColumns[inx].element_id == drillData[0].element_id) {
                allColumns[inx] =
                  allDillCol[this.activedCompt.comptAttrs.curDrillIdx];
              }
            }
          }

          for (
            let index = 0;
            index < (comptData.columns || []).length;
            index++
          ) {
            comptData.columns[index] = {
              ...objDeepCopy(allColumns[index]),
              ...objDeepCopy(comptData.columns[index])
            };
          }
        }

        newData.comptData = comptData;
        if (
          this.activeComp.type != "CrossTable" ||
          (this.activeComp.type == "CrossTable" && this.polymerizeType == 2)
        )
          //交叉表聚合除外，其他组件数据需要重置
          this.activedCompt.comptData = objDeepCopy(comptData);
        if (
          comptData &&
          comptData.columns &&
          comptData.rows &&
          !["CrossTable", "ElDatagrid",'VeScatter','Scatter'].includes(newData.type)
        ) {
          if (newData.comptAttrs.yAxis2Data.length > 0) {
            // 双Y轴
            let yAxis2Arr = [];
            let yAxis2DataCopy = this.selectedMeasureData2;
            for (let index = 0; index < yAxis2DataCopy.length; index++) {
              yAxis2Arr.push(
                yAxis2DataCopy[index][
                this.SHOW_TYPE_ARR[yAxis2DataCopy[index].show_type]
                ]
              );
            }
            /* 如果设置了图例维度字段，则右y轴从columns 里面取 */
            if (this.selectedDataObj._legendData && this.selectedDataObj._legendData.length > 0) {
              yAxis2Arr = comptData.columns.filter(item => {
                let yCol = item.split('-').reverse()[0]
                return yCol.includes(yAxis2Arr[0])
              })
            }
            newData.comptAttrs.setting["axisSite"] = { right: yAxis2Arr };
            newData.comptAttrs.setting["showLine"] = yAxis2Arr;
            this.activedCompt.comptAttrs.setting["axisSite"] = objDeepCopy({
              right: yAxis2Arr
            });
            this.activedCompt.comptAttrs.setting["showLine"] = objDeepCopy(
              yAxis2Arr
            );
          }
        }

        if (newData.comptAttrs["isNeedResetLink"] == undefined) {
          newData.comptAttrs["isNeedResetLink"] = 1;
        } else {
          newData.comptAttrs["isNeedResetLink"]++;
        }
        this.activedCompt.comptAttrs["isNeedResetLink"] =
          newData.comptAttrs["isNeedResetLink"];
      }
      // 更新组件设置
      this.updateCompSetting();
      //  this.setChartSeriesDate();
    },
    // 确定更新数据完，可能还需要更新组件其他的配置信息
    updateCompSetting() {
      // 在设计确定时存储一份当前拖动的字段情况的信息,不然会因为记录字段信息导致在设计界面的展示结果跟原来确定的不一致
      let fieldDataObj = {};
      ['xAxisData', 'yAxis1Data', 'yAxis2Data', 'drillData', 'computedData'].forEach(attrName => {
        const oriData = this.activedCompt.comptAttrs[attrName] || [];
        const newData = oriData.map(item => {
          return {
            ...item
          };
        });
        fieldDataObj[attrName] = newData;
      });
      this.$set(this.activedCompt.comptAttrs, 'fieldDataObj', JSON.stringify(fieldDataObj));

      if(this.activedCompt.type === "PcIndicatorTrend") {
        //根据数据限制展示个数最大值
        if(this.activedCompt.styleAttrs.length > 0) {
          this.activedCompt.styleAttrs.forEach(item => {
            if(item.enName === "layoutAttrs" && item.children.length > 0) {
              item.children.forEach(item1 => {
                if(item1.enName === "slidesPerView") {
                  item1.max = this.activedCompt.comptData.columns.length - 1;
                  item1.value = item1.value > item1.max ? item1.max : item1.value;
                }
              })
            } else if(item.enName === "trendChartSetting" && item.children.length > 0) {
              let options = [];
              let columns = this.activedCompt.comptData.columns;
              if(columns.length > 1) {
                columns.slice(1).forEach((data,index) => {
                  options.push({
                    label: data,
                    value: data
                  })
                })
                item.children.forEach(item1 => {
                  if(item1.enName === "yAxisSite") {
                    item1.options = options
                  }
                })
              }
            }
          });
        }  
      }
    },
    // 组合数据 请求后台数据 再掉小傅接口进行数据格式转化 然后塞回来 渲染数据
    /**
     * paramObj:{
     *    idx:s_edcuiCompt对应下标
     *    selectList:查询列表
     *    where_bean:过滤条件
     * }
     * */
    queryData(params) {
      //确定时候将对应x与y轴实线加入
      //确定更新数据到统计图中
      var _this = this;
      //地图范围
      if (['VeBmap', 'VeLinesBmap'].includes(_this.activedCompt.type)) {
        let extend = _this.activedCompt.comptAttrs.extendSetting;
        if (['VeLinesBmap'].includes(_this.activedCompt.type)) {
          if (extend.series.length > 0) {
            extend.series[0].data = [];
            extend.series = extend.series.splice(0,1);
          } else {
            extend.series.push({data: [], type: 'lines'});
          }
        } else {
          extend.series[0].data = [];
          extend.series = extend.series.splice(0,1);
        }
        let geoJSON = {features: []};
        let chinaJSON = require("@/../public/echarts-map-geo/china.json");
        let fjJSON = require("@/../public/echarts-map-geo/province/fujian.json");
        geoJSON.features.push(...(fjJSON.features), ...(chinaJSON.features));
        _this.activedCompt.comptAttrs.setting["position"] = "china";
        extend.geo["map"] = "china";
        _this.activedCompt.comptAttrs.setting['mapOrigin'] = geoJSON;
      }
      if (['VeMap', 'VeAreaMap', 'VeLines', 'VeBubbleMap'].includes(_this.activedCompt.type)) {
        params.mapArea = _this.mapArea;
        this.activedCompt.comptAttrs.mapLevel = this.mapLevel;
        this.activedCompt.comptAttrs.mapArea = this.mapArea;
        let extend = _this.activedCompt.comptAttrs.extendSetting;
        if (['VeAreaMap', 'VeLines', 'VeBubbleMap'].includes(_this.activedCompt.type)) {
          extend.series[0].data = [];
          extend.series[1].data = [];
          extend.series = extend.series.splice(0,3);//清空迁徙图lines
        }
        delete extend['series.0.label.normal.show'];
        //全国
        if (_this.mapLevel === "0" && _this.mapArea != "") {
          const geoJSON = require("@/../public/echarts-map-geo/china.json");
          _this.activedCompt.comptAttrs.setting["position"] = "china";
          if (['VeAreaMap', 'VeLines', 'VeBubbleMap'].includes(_this.activedCompt.type)) {
            extend.geo["map"] = "china";
          }
          _this.activedCompt.comptAttrs.setting['mapOrigin'] = geoJSON;
        }
        //省级
        if (
          _this.mapLevel == "1" &&
          _this.mapArea != "" &&
          _this.activedCompt.comptAttrs.curDrillIdx == 0
        ) {
          const geoJSON = require("@/../public/echarts-map-geo/province/" +
            _this.mapArea + ".json");
          _this.$echarts.registerMap("province/" +_this.mapArea, geoJSON);
          if (['VeAreaMap', 'VeLines', 'VeBmap', 'VeBubbleMap'].includes(_this.activedCompt.type)) {
            extend.geo["map"] = "province/" + _this.mapArea;
          } else {
            require("@/../public/echarts-map-geo/province/" + _this.mapArea);
            extend["series"] = { type: "map", map: ""};
          }
          _this.activedCompt.comptAttrs.setting["position"] = "province/" + _this.mapArea;
          _this.activedCompt.comptAttrs.setting['mapOrigin'] = geoJSON;
        }
        //市级
        if (
          _this.mapLevel == "2" &&
          _this.mapArea &&
          _this.activedCompt.comptAttrs.curDrillIdx == 0
        ) {
          if (_this.activedCompt.type == "VeMap") {
            extend["series"] = {
              type: "map",
              map: _this.mapArea.replace(/(['一',('县市')])/gi, "")
            };
          } else{
            extend.geo["map"] = _this.mapArea.replace(/(['一',('县市')])/gi, "");
          }
          const geoJSON = require("@/../public/echarts-map-geo/city/" +
            _this.mapArea.replace(/(['一',('县市')])/gi, "") +
            ".json");
          _this.$echarts.registerMap(
            _this.mapArea.replace(/(['一',('县市')])/gi, ""),
            geoJSON
          );
          _this.activedCompt.comptAttrs.setting['mapOrigin'] = geoJSON;
        }
        //钻取情况下
        if (
          _this.mapLevel == "1" &&
          _this.activedCompt.comptAttrs.curDrillIdx == 1 &&
          _this.activedCompt.comptAttrs.drillData.length > 1
        ) {
          const geoJSON = require("@/../public/echarts-map-geo/city/" +
            (["VeAreaMap", 'VeBubbleMap'].includes(_this.activedCompt.type)
              ? extend.geo["map"] : extend["series"]["map"]));
          _this.$echarts.registerMap(
            ["VeAreaMap", 'VeBubbleMap'].includes(_this.activedCompt.type) ? extend.geo["map"] : extend["series"]["map"], geoJSON
          );
          _this.activedCompt.comptAttrs.setting['mapOrigin'] = geoJSON;
        }
      }

      //top5的组件默认先取10条数据
      if (this.activeComp.type === 'HdTopFive') {
        params.afQueryBean.head_bean.pageCount = this.activeComp.comptAttrs.extendSetting.pageSize;
        params.afQueryBean.is_need_paging = 1;
      }
      if (['VeFunnel', 'VeCompareFunnel'].includes(this.activeComp.type)) {
        params['rowDimList'] = this.selectedDataObj.xMeasureData;
      }
      if (this.activeComp.type === 'RankList') {
        // 内置条件 度量降序
        params.afQueryBean.order_list = this.selectedDataObj.yMeasureData.map(item => {
          return {
            col_id: item.col_id,
            element_id: item.element_id,
            obj_id: item.obj_id,
            order_type: 2
          }
        });
      }
      params = adjustQueryParams({
        params, 
        activedCompt: this.activedCompt
      });
      let computedData = this.activedCompt.comptAttrs.computedData||[];
      this.queryComptData({ params, computedData })
        .then(function (response) {
          if (response.data.respResult == 1) {
            if (
              [
                "VeCombineChart",
                "VeHistogram",
                "VeCombineStack",
                "VeStackHistogram",
                "VePercentStackHistogram",
                "VePie",
                "VeLine",
                "VeLineArea",
                "VeMap",
                "VeStackLineArea",
                "VePercentStackLineArea",
                "VeBar",
                "VeStackBar",
                "VeGauge",
                "VeAreaMap",
                "VeBmap",
                "VeLinesBmap",
                "VeHeatBmap",
                "VeRing",
                "VeRosePie",
                "VeLines",
                "VeWordCloud",
                'VeBubbleMap',
                "VeSankey",
                "VeWaterfall",
                "VeWordCloud",
                "VePercentStackBar"
              ].includes(_this.activedCompt.type)
            ) {
              _this.resetChartSeries(params, response);
              _this.resetChartSeriesType();
            }
            if (["VeRadar"].includes(_this.activedCompt.type)) {
              _this.resetVeRadarChartSeries(params, response);
            }
            if (["VeTree"].includes(_this.activedCompt.type)) {
              _this.resetVeTreeChartSeries(params, response);
            }
            //指标数据清空
            if (
              ["HdKpiBlock", "HdKpiBlock2", "HdKpiBlock3"].includes(
                _this.activedCompt.type
              )
            ) {
              _this.resetHdKpiBlockChartSeries(params, response);
            }
            // 桑基图设置links
            if (['VeSankey', 'SrcAndDest'].includes(_this.activedCompt.type)) {
              _this.activedCompt.comptAttrs.setting['links'] = response.data.respData.links;
            }
            // 指标拆解树数据格式构造
            if (['DesicionTree'].includes(_this.activedCompt.type)) {
              let rd = response.data.respData;
              let dt_data = {
                id: Math.random() * 1000,
                name: rd.columns[0] + '(总量)',
                value: rd.rows[0][rd.columns[0]],
                rate: 1,
                label: '',
                children: []
              };
              _this.activedCompt.comptAttrs.setting['data'] = [dt_data];
            }
            _this.elementObj.forEach((obj, i) => {
              if (i === 0) {
                _this.activedCompt.comptAttrs.yAxis1Data = _this.activedCompt.comptAttrs.yAxis1Data.filter(item => !item.isNewSetting)
                _this.activedCompt.comptAttrs.xAxisData = _this.activedCompt.comptAttrs.xAxisData.filter(item => !item.isNewSetting)
              }
              let tempData = _this.selectedDataObj[obj.key.replace(/ColTitle/,'Data')] || []
              const nKey = obj.key.replace(/ColTitle/,'')
              tempData.forEach(item => {
                item.isNewSetting = nKey
                if (item.element_type == 2) {
                  const temp = _this.activedCompt.comptAttrs.yAxis1Data.filter(item => {return item.element_id === item.element_id && item.isNewSetting === nKey})
                  if (temp.length === 0) {
                    _this.activedCompt.comptAttrs.yAxis1Data.push(item)
                  }
                } else if (item.element_type == 1) {
                  const temp = _this.activedCompt.comptAttrs.xAxisData.filter(item => {return item.element_id === item.element_id  && item.isNewSetting === nKey })
                  if (temp.length === 0) {
                    _this.activedCompt.comptAttrs.xAxisData.push(item)
                  }
                }
              })
            })
            // 散点图，气泡图处理 columns， rows 数据结构
            let respData = response.data.respData || []
            Promise.resolve().then(() => {
              if (['VeScatter', 'Scatter'].includes(_this.curComptDataAuth.type)) {
                return _this.handleScatterData([respData, {..._this.selectedDataObj, selectedMeasureData: _this.selectedMeasureData}, _this.activedCompt])
              } else {
                return  respData // _this.updateData(respData, true);
              }
            }).then(res => {
                respData = res;
                _this.updateData(respData, true);
            }).then(res => {
              loadDataDone(_this.activedCompt);
              if (
                _this.activeComp.type == "VeStackLineArea" ||
                _this.activeComp.type == "VePercentStackLineArea" ||
                _this.activeComp.type == "VeStackHistogram" ||
                _this.activeComp.type == "VePercentStackHistogram" ||
                _this.activeComp.type == "VeStackBar"||
                _this.activeComp.type == "VeCombineStack" ||
                _this.activeComp.type == "VePercentStackBar"
              ) {
                //堆叠面积图stack属性赋值
                var stackArr = objDeepCopy(_this.activeComp.comptData.columns);
                stackArr.shift(); //删除数组第一个维度
                if (_this.activedCompt.comptAttrs.yAxis2Data.length > 0) {
                  // 右Y轴维度应该删除
                  const rightArr = _this.activedCompt.comptAttrs.setting.axisSite.right || []
                  stackArr = stackArr.filter(item => !rightArr.includes(item))
                }
                _this.activedCompt.comptAttrs.setting["stack"] = {
                  度量: stackArr
                };
              }
              if (
                //  _this.activeComp.type == "VeCombineChart" ||
                // _this.activeComp.type == "VeLine" ||
                // _this.activeComp.type == "VeHistogram" ||
                // _this.activeComp.type == "VeStackHistogram" ||
                // _this.activeComp.type == "VeLineArea" ||
                // _this.activeComp.type == "VeStackLineArea" ||
                //_this.activeComp.type == "VeBar" ||
                // _this.activeComp.type == "VeStackBar" ||
                _this.activeComp.type == "VeGauge" ||
                _this.activeComp.type == "VeRing"
                //  _this.activeComp.type == "VeRadar"
              ) {
                //组合图:设置别名、标记点样式
                _this.setAnotherName(_this.activeComp);
                _this.initSymbolSize();
              } else if (
                [
                  "VeCombineChart",
                  "VeHistogram",
                  "VeStackHistogram",
                  "VePercentStackHistogram",
                  "VeBar",
                  "VeStackBar",
                  "VeLine",
                  "VeLineArea",
                  "VeStackLineArea",
                  "VePercentStackLineArea",
                  "VeRadar",
                  'VeCombineStack',
                  'VeScatter',
                  'VeWaterfall',
                  'Scatter',
                  "VePercentStackBar"
                ].includes(_this.activeComp.type)
              ) {
                //组合图新版样式设置
                // _this.setAnotherName();
                _this.initSymbolSize();
                _this.setChartSeriesDate();
              } else if (['VePie', 'VeRosePie', 'VeSankey', 'VeTreemap', 'VeWordCloud'].includes(_this.activeComp.type)) {
                //重新加载饼图的小数点和标签样式
                _this.initLableFormatter();
              } else if (['VeMap', 'VeAreaMap', 'VeLines'].includes(_this.activedCompt.type)) {
                _this.setAnotherName(_this.activedCompt);
                //区域地图给scatter设置data
                if (['VeAreaMap', 'VeLines'].includes(_this.activedCompt.type))
                  _this.resetMapScatterData(_this.activedCompt.type);
              } else if (['VeBubbleMap', 'VeHeatBmap', 'VeLinesBmap', 'VeBmap'].includes(_this.activedCompt.type)) {
                _this.setChartSeriesDate();
                _this.resetMapScatterData(_this.activedCompt.type);
              }
              if (_this.activedCompt.type === 'PcIndicatorTrend') {
                _this.setChartSeriesDate();
              }
              //第三方组件设置
              if(_this.activedCompt.comptAttrs && _this.activedCompt.comptAttrs.isExtComp === '1'){
                //如果该样式包含系列设置，则给系列赋值
                _this.setComptsDevSeriesData();
              }
            })
            // 词云图加载数据问题特殊处理
            if (_this.activedCompt.type === 'waitingVeWordCloud') {
              _this.activedCompt.type = 'VeWordCloud'
            }
          } else if (
            _this.activedCompt.type == "CrossTable" &&
            _this.polymerizeType == 1
          ) {
            //交叉表聚合按照报文的提示
            // _this.$message.error(response.data.respErrorDesc);
            loadDataError(_this.activedCompt,response.data.respErrorDesc);
          } else {
            // _this.$message.error("数据更新失败");
            // loadDataError(_this.activedCompt,'数据更新失败');
            loadDataError(_this.activedCompt,response.data.respErrorDesc);
            console.error(response.data.respErrorDesc);
          }
        })
        .catch(function (error) {
          console.error(error);
          // _this.upLoading(false);
          // _this.$message.error("数据更新失败");
        })
        .finally(() => {
          if (_this.activedCompt.comptAttrs["loading"] != undefined) {
            _this.activedCompt.comptAttrs["loading"] = false;
          }
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
        operation: "dataset",
        dataSetType: 1
      };
      this.setDataSetCache(dataSetCache);
      sessionStorage.setItem("dataSetCache", JSON.stringify(dataSetCache));
      let routeData = this.$router.resolve({ name: "dataset" });
      window.open(routeData.href, "_blank");
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
    openMessageTip(msg, type, isOpen) {
      this.$message.closeAll();
      if (isOpen) {
        this.$message({
          message: msg,
          type: type
        });
      }
    },
    // 更新右侧字段高亮状态 除数据过滤以外，日期分层级需要新增加两个判断条件（formatLevel、isNewCol）
    // obj 删除单个字段时
    updateFieldSelState(obj) {
      // 先把四个数组的element_id 加到一个数组里，去重，然后判断element_id在不在，不在就不选中
      let elementIdArr = [];
      let selArr = this.concatSelFields();
      let allSelFields = {};//根据element_id来找字段
      for (let index = 0; index < selArr.length; index++) {
        if (
          selArr[index] != undefined &&
          !elementIdArr.includes(selArr[index].element_id)
        ) {
          elementIdArr.push(selArr[index].element_id);
          this.$set(allSelFields, selArr[index].element_id, selArr[index]);
        }
      }

      if (obj != undefined) {
        if (!elementIdArr.includes(obj.element_id)) {
          for (let index = 0; index < this.allData.length; index++) {
            if (
              obj.element_id == this.allData[index].element_id &&
              obj.af_id == this.allData[index].af_id &&
              obj.formatLevel == this.allData[index].formatLevel &&
              obj.isNewCol == this.allData[index].isNewCol
            ) {
              this.$set(this.allData[index], "selected", false);
            }
          }
        }
        // else{//日期分层下钻部分删除，高亮取消
        //   for (let index = 0; index < this.allData.length; index++) {
        //     if (
        //       obj.element_id == this.allData[index].element_id &&
        //       obj.af_id == this.allData[index].af_id &&
        //       obj.formatLevel == this.allData[index].formatLevel &&
        //       obj.isNewCol == this.allData[index].isNewCol &&
        //       this.allData[index].col_type == 'dat'
        //     ) {
        //       this.$set(this.allData[index], "selected", false);
        //     }
        //   }
        // }
      } else {
        for (let index = 0; index < this.allData.length; index++) {
          let curData = this.allData[index];
          if (elementIdArr.includes(curData.element_id) && allSelFields[curData.element_id].isNewCol == curData.isNewCol && allSelFields[curData.element_id].formatLevel == curData.formatLevel) {
            this.$set(this.allData[index], "selected", true);
          } else {
            this.$set(this.allData[index], "selected", false);
          }
        }
      }
      this.filterNode(this.filterText);
    },
    concatSelFields(isNoNeedDrill) {
      let drillData = this.selectedDrillData || [];
      if (isNoNeedDrill) {
        drillData = [];
      }
      let selectedDataArr = []
      this.elementObj.forEach(obj => {
        selectedDataArr.push(...this.selectedDataObj[obj.key.replace(/ColTitle/,'Data')])
      })
      //去重
      let obj = {}
      const selectedData = selectedDataArr.reduce((cur, next) => {
        if (!obj[next.element_id]) {
          obj[next.element_id] = true
          cur.push(next)
        }
        return cur
      },[])
      return [
        ...this.selectedDimData,
        ...drillData,
        ...this.selectedMeasureData,
        ...this.selectedMeasureData2,
        ...this.selectedQueryData,
        ...selectedData
      ]
    },
    updateAttrPanel(activeCompObj) {
      this.selectedMeasureData = [];
      this.selectedDrillData = [];
      this.selectedMeasureData2 = [];
      this.selectedQueryData = [];
      this.selectedDataObj = JSON.parse(JSON.stringify(this.dataObjBak||{}))
      this.upFilterData({ data: [], type: "reset" });
      this.selectedDimData = [];
      this.allData = [];
      this.filterText = "";
      this.filterNode("");
      // 新页面才有setting，旧页面编辑无setting
      let comptSetting = activeCompObj.comptAttrs.setting || {};  //取json中setting赋值给curComptDataAuth
      if(comptSetting.isDim != null){
        comptSetting.chartChName = activeCompObj.comptAttrs.name;
        comptSetting.type = activeCompObj.type;
        this.comptTitle = comptSetting.chartChName;
        this.curComptDataAuth = comptSetting;
      } else {
        let attr = this.dataClassifyAuth.filter(item => {
          return item.type === activeCompObj.type
        })
        if(attr.length > 0) {
          this.comptTitle = attr[0].chartChName;
          this.curComptDataAuth = attr[0];
        }
      }

      // 构造自定义数组
      const val = this.curComptDataAuth
      this.selectedDataObj = {}
      this.dataObjBak = {}
      this.elementObj = []
      let keys = Object.keys(val)
      keys.forEach(k => {
        if (k.indexOf('ColTitle') > -1 ) {
          const k1 = k.replace(/ColTitle/,'')
          let xdata = []
          let ydata = []
          if (val[k].elementType != 2) {
            xdata = activeCompObj.comptAttrs.xAxisData.filter(item => item.isNewSetting == k1)
          }
          if (val[k].elementType != 1) {
            ydata = activeCompObj.comptAttrs.yAxis1Data.filter(item => item.isNewSetting == k1)
          }
          this.selectedDataObj[`${k1}Data`] = [...xdata, ...ydata]
          this.dataObjBak[`${k1}Data`] = []
          let subVal  = {...val[k], key: k}
          if (val[k].index !== undefined && !this.elementObj[val[k].index]) {
            this.elementObj[val[k].index] = subVal
          } else {
            this.elementObj.push(subVal)
          }
        }
      })
      // end

      /* let arr = this.dataClassifyAuth.filter(item => {
        return item.type.indexOf(activeCompObj.type) > -1;
      });
      if (arr.length > 0) {
        this.comptTitle = arr[0].chartChName;
        this.curComptDataAuth = arr[0];
      } */
      this.value =
        activeCompObj.afId.indexOf(",") > -1
          ? activeCompObj.afId.substring(0, activeCompObj.afId.indexOf(","))
          : activeCompObj.afId;
      if (this.value) {
        this.getAllTablesData(this.value); //每次都要带数据集id重新查下，因为默认展示是20条，如果没带数据集id再查一下，则下拉框值就是一串编号
        this.getColsData(this.value, this.updateSelField);
      }
      this.polymerizeType = this.activedCompt.comptAttrs.polymerizeType || 2;
      this.updateCrossTbState();
    },
    // 更新已选字段
    updateSelField() {
      let elementIdArr = [];
      let compt = this.activedCompt.comptAttrs || {};
      let selArr = [
        ...(compt.xAxisData || []),
        ...(compt.yAxis1Data || []),
        ...(compt.yAxis2Data || []),
        ...(compt.drillData || []),
        ...(compt.selectedQueryData || [])
      ];
      for (let index = 0; index < selArr.length; index++) {
        if (
          selArr[index] != undefined &&
          !elementIdArr.includes(selArr[index].element_id)
        ) {
          elementIdArr.push(selArr[index].element_id);
        }
      }
      //地图范围下拉框初始值
      if (['VeMap', 'VeAreaMap', 'VeLines', 'VeBmap', 'VeBubbleMap'].includes(this.activedCompt.type)) {
        this.mapLevel = this.activedCompt.comptAttrs.mapLevel;
        this.mapArea = this.activedCompt.comptAttrs.mapArea;
      }

      let colData1 = [];
      for (let index = 0; index < selArr.length; index++) {
        //const element = elementIdArr[index];
        //表格下钻存在elementIdArr和selArr个数不同的情况
        const element = selArr[index];//需要用到formatLevel、isNewCol的值，所以用selArr[index]
        // if(element.isNewSetting === 'sizeMeasure'){
        //   element.element_id = element.element_id.split('sizeMeasure')[0]
        // }
        for (let index2 = 0; index2 < this.allData.length; index2++) {
          const element2 = this.allData[index2];
          //日期分层级需要新增加两个判断条件（formatLevel、isNewCol）
          if (element2.element_id == element.element_id && element2.formatLevel == element.formatLevel && element2.isNewCol == element.isNewCol) {
            // if(element.isNewSetting === 'sizeMeasure'){
            //   element2.element_id = element2.element_id + 'sizeMeasure'
            //   selArr[index].element_id = selArr[index].element_id + 'sizeMeasure'
            // }
            // 这边要把原有的fun_type设置带回来
            colData1.push(objDeepCopy({
              ...element2,
              ...{
                fun_type: element.fun_type
              }
            }));
            break;
          }
        }
      }
      if (colData1.length > 0) {
        if (compt.selectedQueryData  && compt.selectedQueryData.length > 0) {
          this.selectedQueryData = this.getFieldData(colData1, "query");
        } else {
          this.selectedDimData = this.getFieldData(colData1, 1);
          this.selectedDrillData = this.getFieldData(colData1, 2);
          this.selectedMeasureData = this.getFieldData(colData1, 3);
          this.selectedMeasureData2 = this.getFieldData(colData1, 4);
          let keys = Object.keys(this.selectedDataObj)
          for(let k of keys) {
            this.selectedDataObj[k] = this.getFieldData(colData1, k);
          }
        }
        this.updateFieldSelState();
      }
      if (
        this.activeComp.comptAttrs.filterData &&
        this.activeComp.comptAttrs.filterData.length > 0
      ) {
        this.upFilterData({
          data: this.getFieldData(this.allData, 5),
          type: "reset"
        });
      } else {
        this.upFilterData({ data: [], type: "reset" });
      }
      this.firDrillField =
        this.selectedDrillData.length > 0
          ? objDeepCopy(this.selectedDrillData[0])
          : {};
    },
    // type  1-xaxis 2-drillData 3-yAxis1Data 4--yAxis2Data 5--filterData
    getFieldData(colData1, type) {
      let data = [];
      switch (type) {
        case 1:
          data = this.activeComp.comptAttrs.xAxisData.filter(item => !item.isNewSetting);
          break;
        case 2:
          data = this.activeComp.comptAttrs.drillData;
          break;
        case 3:
          data = this.activeComp.comptAttrs.yAxis1Data.filter(item => !item.isNewSetting);
          break;
        case 4:
          data = this.activeComp.comptAttrs.yAxis2Data;
          break;
        case 5:
          data = this.activeComp.comptAttrs.filterData;
          break;
        case "query":
          data = this.activeComp.comptAttrs.selectedQueryData;
          break;
        default:
          let k = type.replace(/Data/,'ColTitle')
          let item = this.curComptDataAuth[k]
          if (!item) {
            return
          }
          let xdata = []
          let ydata = []
          if (item.elementType == 2) {
            ydata = this.activeComp.comptAttrs.yAxis1Data.filter(val => val.isNewSetting === type.replace(/Data/g,''));
          } else if (item.elementType == 1) {
            xdata = this.activeComp.comptAttrs.xAxisData.filter(val => val.isNewSetting === type.replace(/Data/g,''));
          } else if (item.elementType == 0) {
            xdata = this.activeComp.comptAttrs.xAxisData.filter(val => val.isNewSetting === type.replace(/Data/g,''));
            ydata = this.activeComp.comptAttrs.yAxis1Data.filter(val => val.isNewSetting === type.replace(/Data/g,''));
          }
          data = [...xdata, ...ydata]
          break;
      }

      let result = [];
      for (const dataItem1 of data) {
        for (let index = 0; index < colData1.length; index++) {
          //日期分层级需要新增加两个判断条件（formatLevel、isNewCol）
          if (dataItem1.element_id == colData1[index].element_id && dataItem1.formatLevel == colData1[index].formatLevel && dataItem1.isNewCol == colData1[index].isNewCol) {
            let item = objDeepCopy(colData1[index]);
            let oriItem = [];
            if (type == 5) {
              // 过滤字段要把条件塞回去
              oriItem = this.activeComp.comptAttrs.filterData.filter(val => {
                return val.element_id == item.element_id;
              });
              item.numList = objDeepCopy(oriItem[0].numList || []);
              item.m_value =
                typeof oriItem[0].m_value == "string"
                  ? oriItem[0].m_value
                  : objDeepCopy(oriItem[0].m_value);
              item.radioCalcu = oriItem[0].radioCalcu;
              item.symbol = oriItem[0].symbol;
              item.isSetDefault = oriItem[0].isSetDefault;
              item.timeOprCount1 = oriItem[0].timeOprCount1;
              item.timeOpr1 = oriItem[0].timeOpr1;
              item.timeOprCount2 = oriItem[0].timeOprCount2;
              item.timeOpr2 = oriItem[0].timeOpr2;
              item.m_label = oriItem[0].m_label||'';
              item.treeSelVal = oriItem[0].treeSelVal||[];
            }
            if (type == 3 || type == 4 || type == 1 || type == 2) {
              //fun_type sort回填
              oriItem = this.activeComp.comptAttrs[
                type == 3
                  ? "yAxis1Data"
                  : type == 4
                    ? "yAxis2Data"
                    : type == 1
                      ? "xAxisData"
                      : "drillData"
              ].filter(val => {
                return val.element_id == item.element_id;
              });
              if ((type == 3 || type == 4) && item.element_type == 2)
                item["fun_type"] = oriItem[0]["fun_type"] == 0 ? 0 : (oriItem[0]["fun_type"] || 2);
              item["sort"] = oriItem[0]["sort"];
            }
            result.push(item);
            break;
          }
        }
      }
      return result;
    },
    setDrillField(item) {
      if (
        (this.activedCompt.comptAttrs.extendSetting.urlType == "1" &&
          this.activedCompt.comptAttrs.extendSetting.pageId) ||
        (this.activedCompt.comptAttrs.extendSetting.urlType == "2" &&
          this.activedCompt.comptAttrs.extendSetting.comptUrl)
      ) {
        this.$message({
          message: "该组件设置了URL链接，无法设置钻取",
          type: "warning"
        });
        return;
      }
      // if (
      //   this.selectedDrillData.length > 0 &&
      //   item.dim_level_id == this.selectedDrillData[0].dim_level_id &&
      //   item.element_id == this.selectedDrillData[0].element_id
      // ) {
      //   return;
      // }
      // //钻取
      // if (
      //   //组合图、饼图、柱状图、折线图可以往下面钻取
      //   [
      //     "VeCombineChart",
      //     "VePie",
      //     "VeHistogram",
      //     "VeStackHistogram",
      //     "VeLine",
      //     "VeLineArea",
      //     "VeMap",
      //     "VeStackLineArea",
      //     "VeBar",
      //     "VeRadar",
      //     "VeStackBar",
      //     "VeAreaMap",
      //     "PcKpiBlock"
      //   ].includes(this.activeComp.type) &&
      //   this.selectedDimData[0].dim_id != ""
      // ) {
      //   this.selectedDrillData = [];
      //   if (this.selectedDrillData.length == 0) {
      //     this.selectedDrillData.push(objDeepCopy(item));
      //     this.queryDimList(item);
      //   } else if (this.selectedDrillData[0].element_id != item.element_id) {
      //     this.selectedDrillData = [];
      //     this.selectedDrillData.push(objDeepCopy(item));
      //     this.queryDimList(item);
      //   }
      // }

      // //  (['CrossTable', 'PivotTable'].includes(this.activeComp.type) && this.polymerizeType == 2))
      // if (
      //   (this.activeComp.type == "ElDatagrid" ||
      //     ['CrossTable', 'PivotTable'].includes(this.activeComp.type)) &&
      //   item.dim_id != "" &&
      //   item.dim_level_id != ""
      // ) {
      //   this.selectedDrillData = [];
      //   this.selectedDrillData.push(objDeepCopy(item));
      //   this.firDrillField = objDeepCopy(item);
      //   this.queryDimList(item);
      // }

      if (this.selectedDrillData.length > 0) {
        if (item.element_id != this.selectedDrillData[0].element_id) {
          this.$message.warning("只能配置一个钻取顶层");
        }
        return;
      }
      const dimData = this.selectedDimData;
      //钻取
      if (
        //地图、区域地图钻取必须要有维层关系
        ["VeMap", "VeAreaMap","VeWordCloud", 'VeBubbleMap'].includes(this.activeComp.type) &&
        dimData[0].dim_id != ""
      ) {
        if (this.selectedDrillData.length == 0 || this.selectedDrillData[0].element_id != item.element_id) {
          this.selectedDrillData = [];
          this.selectedDrillData.push(objDeepCopy(item));
          this.queryDimList(item);
        }
      } else if (!["VeMap", "VeAreaMap", 'VeBubbleMap'].includes(this.activeComp.type)) {
        let oldSelectedDrillData = objDeepCopy(this.selectedDrillData);
        this.selectedDrillData = [];
        this.selectedDrillData.push(objDeepCopy(item));
        if (
          ['CrossTable', 'ElDatagrid'].includes(this.activeComp.type)
        ) {
          //表格和交叉表可以有多个维度字段，如果已经有了钻取维度，再点击其他维度字段的钻取，要把之前的钻取维度清空并且去掉高亮状态
          if (oldSelectedDrillData.length > 0) {
            for (let index = 0; index < oldSelectedDrillData.length; index++) {
              // 去掉高亮状态,日期分层级需要新增加两个判断条件（formatLevel、isNewCol）
              let extraData = {
                element_id: oldSelectedDrillData[index].element_id,
                af_id: oldSelectedDrillData[index].af_id,
                formatLevel: oldSelectedDrillData[index].formatLevel,
                isNewCol: oldSelectedDrillData[index].isNewCol
              };
              this.updateFieldSelState(extraData);
            }
          }
          this.firDrillField = objDeepCopy(item);
        }
      }
    },
    triggleExp(drill) {
      //钻取维度显示、隐藏
      let dillExpand = this.activeComp.comptAttrs["dillExpand"];
      if (dillExpand == undefined) {
        dillExpand = false;
      } else {
        dillExpand = !dillExpand;
      }
      this.$set(this.activeComp.comptAttrs, "dillExpand", dillExpand);
    },
    confirmUpdateData() {
      // 词云图加载数据问题特殊处理
      if (this.activedCompt.type === 'VeWordCloud') {
        this.activedCompt.type = 'waitingVeWordCloud'
      }
      let dataType = "1";
      let validArr = [];
      let title = "";
      let isNeedPaging = 0;
      let pageSet = {
        pageCount: 100, // 图形不要分页,限制100条  表格要
        start: ""
      };
      switch (this.activedCompt.type) {
        case "VeCombineChart":
        case "VeCombineStack":
          dataType = "1";
          validArr = [1, -1, 1, 1];
          title = "左Y轴";
          break;
        case "VeHistogram":
        case "VeBar":
        case "VeStackHistogram":
        case "VePercentStackHistogram":
        case "VeLine":
        case "VeLineArea":
        case "VeStackLineArea":
        case "VePercentStackLineArea":
        case "PcKpiBlock":
        case "VePie":
        case "VeStackBar":
        case "VeRosePie":
        case "VeWaterfall":
        case "VeTreemap":
        case "VeWordCloud":
        case "VePercentStackBar":
        // case "PcIndicatorTrend":
        case "DesicionTree":
          dataType = "1";
          validArr = [1, -1, 1, -1];
          title = "度量";
          break;
        case "ElDatagrid":
          dataType = "2";
          validArr = [1, -1, -1, -1];
          title = "列";
          isNeedPaging = 1;
          pageSet.pageCount = this.activedCompt.comptAttrs.extendSetting.pageSize;
          pageSet.start = 1;
          break;
        case "Query":
        case "MobileQuery":
          dataType = "query";
          validArr = [-1];
          title = "查询";
          break;
        case "VeMap":
        case "VeAreaMap":
        // case 'VeBubbleMap':
        case "VeBmap":
          dataType = "3";
          validArr = [1, -1, 1, -1];
          title = "度量";
          break;
        case "VeRadar":
          dataType = "4";
          validArr = [1, -1, 1, -1];
          title = "度量";
          break;
        case "VeGauge":
          dataType = "5";
          validArr = [-1, -1, 1, -1];
          title = "度量";
          break;
        case "VeRing":
          dataType = "7";
          validArr = [-1, -1, 1, -1];
          title = "度量";
          break;
        case "PivotTable":
          // 透视表不分页
          dataType = "2";
          validArr = [1, -1, 1, -1];
          title = "度量";
          pageSet.start = "";
           break;
        case "CrossTable":
          let selectedFields = this.selectedDimData.concat(
            this.selectedMeasureData
          );
          if (selectedFields.length == 0) {
            this.openMessageTip(`请至少拖入一个字段`, "warning", true);
            return;
          }
          dataType = "2";
          validArr = [-1, -1, -1, -1];
          title = "列";
          isNeedPaging = 1;
          pageSet.pageCount = this.activedCompt.comptAttrs.extendSetting.pageSize;
          pageSet.start = 1;
          break;
        case "HdIconKpiBlock":
          if (
            this.selectedDimData.concat(this.selectedMeasureData).length == 0
          ) {
            this.openMessageTip(`请至少拖入一个字段`, "warning", true);
            return;
          }
          break;
        case "HdWater":
          if (
            this.selectedDimData.concat(this.selectedMeasureData).length == 0
          ) {
            this.openMessageTip(`请至少拖入一个度量字段`, "warning", true);
            return;
          }
          break;
        case "ElSwiper": //清单轮播组件 仅支持添加两个维度、一个度量，至少需要一个维度、一个度量
          validArr = [1, -1, 1, -1];
          break;
        case "HdKpiBlock2":
          validArr = [-1, -1, 1, -1];
          break;
        case "VeLines":
          dataType = "3";
          break;
        case "VeLinesBmap":
        case "VeHeatBmap":
          dataType = "3";
          validArr = [1];
          break;
        case "VeFunnel": case "VeCompareFunnel":
          dataType = 8;
          break;
        case "VeSankey":
          dataType = "9";
          title = "度量";
          validArr = [2, -1, 1, -1];
          break;
        case 'VeBubbleMap':
          dataType = "3";
          validArr = [1, -1, -1, -1];
          break;
        case 'VeDoughnutPie':
          validArr = [1, -1, 1, -1];
          break;
        case "VeTree":
          dataType = "10";
          title = "度量";
          validArr = [2, -1, 1, -1];
          break;
        case "SrcAndDest":
          dataType = "9";
          break;
        default:
          break;
      }
      if (validArr[0] > 0 && this.selectedDimData.length < validArr[0]) {
        this.openMessageTip(`维度字段至少要${validArr[0]}个`, "warning", true);
        return;
      }
      if (validArr[2] > 0 && this.selectedMeasureData.length < validArr[2]) {
        let text1 = "至少";
        if (
          ["VePie", "VeGauge", "VeRing", "VeRosePie", "ElSwiper","VeWordCloud","HdKpiBlock2"].includes(this.activedCompt.type)
        ) {
          text1 = "至少";
          title = "度量";
        }
        this.openMessageTip(
          `${title}字段${text1}要${validArr[2]}个`,
          "warning",
          true
        );
        return;
      }
      if (validArr[3] > 0 && this.selectedMeasureData2.length < validArr[3]) {
        this.openMessageTip(`右Y轴字段至少要${validArr[3]}个`, "warning", true);
        return;
      }
      if (
        validArr[0] < 0 &&
        this.selectedQueryData.length == 0 &&
        (this.activedCompt.type == "Query" ||
          this.activedCompt.type == "MobileQuery")
      ) {
        this.openMessageTip("查询字段至少要1个", "warning", true);
        return;
      }
      // const selectedData = Object.values(this.selectedDataObj)
      // const selectedDataArr = selectedData.reduce((cur, next) => cur = [...cur, ...next], [])
      if (this.curComptDataAuth.type == 'VeFunnel' && this.selectedDataObj.yMeasureData.length === 1 && this.selectedDataObj.xMeasureData.length === 0) {
         this.openMessageTip(`请至少再拖入一个维度或者度量`, "warning", true);
         return;
      }
      // 图例维度可以不拖，如果加上=，会有问题，所以通过json配置的，维度度量没拖校验的，先忽略
      // if (selectedDataArr.length > 0) {
        let keys = Object.keys(this.selectedDataObj);
        // 对keys进行排序，按展示顺序校验提示
        keys.sort((a, b) => {
          return this.curComptDataAuth[`${a.replace(/Data/,'ColTitle')}`].index - this.curComptDataAuth[`${b.replace(/Data/,'ColTitle')}`].index
        });
        for (let k of keys) {
          let item = this.curComptDataAuth[`${k.replace(/Data/,'ColTitle')}`]
          if (!item) return
          // 图例维度可以不拖,跳过判断
          if (k.indexOf('legend') > -1) {
            continue;
          }
          item.count = this.resetDragRestrict(item);
          let [minlen, maxlen] = [item.min !== undefined ? item.min : 1, item.count]
          let text = ''
          let len = minlen
          let flag = false
          let title = item.name
          if (minlen !== maxlen) {
            if (this.selectedDataObj[k].length > maxlen && maxlen > -1) {
              text = '最多'
              len = maxlen
              flag = true
            } else if (this.selectedDataObj[k].length < minlen) {
              text = '至少'
              flag = true
            }
          } else {
            flag = this.selectedDataObj[k].length < len
          }

          if (this.curComptDataAuth.type == 'VeFunnel' && item.elementType === 1 && item.count === 0) {
            flag = false;
          }

          // 气泡地图 大小度量 颜色度量二者随便拉一个就行
          if (this.curComptDataAuth.type == 'VeBubbleMap' && this.selectedDimData.length === 1 && this.selectedDataObj['sizeMeasureData'].concat(this.selectedDataObj['colorMeasureData']).length > 0) {
            flag = false;
          }
          // lbs气泡地图
          if (this.curComptDataAuth.type == 'VeBmap' && this.selectedDataObj['sizeMeasureData'].length > 0) {
            flag = false;
          }

          if (title && flag) {
            this.openMessageTip(`${title}字段${text}要${len}个`, "warning", true);
            return
          }
        }
      // }
      if (this.activedCompt.comptAttrs["loading"] != undefined) {
        this.activedCompt.comptAttrs["loading"] = true;
      }

      let selectList = this.concatSelFields(true);
      if (this.activedCompt.type == "CrossTable" && this.polymerizeType == 1) {
        //交叉表聚合数据处理格式特殊处理
        selectList = (this.selectedMeasureData || []).concat(
          this.selectedDimData
        );
      }
      if (this.activedCompt.type === 'DesicionTree') {
        //指标拆解树数据处理格式特殊处理
        selectList = this.selectedMeasureData;
      }
      let orderList = [];
      if (dataType == "query") {
        var target = this.activedCompt;
        var showField = target.comptAttrs.fieldList;
        this.activedCompt.comptAttrs.isNeedResetLink++;
        var fieldList = [];
        selectList = objDeepCopy(this.selectedQueryData);
        selectList.forEach(val => {
          // 如果是之前的字段，保留字段信息
          let oriField = "";
          for (let index = 0; index < showField.length; index++) {
            const comptAttrsVal = showField[index].comptAttrs;
            //日期分层级需要新增加两个判断条件（formatLevel、isNewCol）
            if (
              comptAttrsVal.af_id == val.af_id &&
              comptAttrsVal.element_id == val.element_id &&
              comptAttrsVal.formatLevel == val.formatLevel &&
              comptAttrsVal.isNewCol == val.isNewCol
            ) {
              oriField = objDeepCopy(showField[index]);
              break;
            }
          }
          val.mainLinkageData = [];
          var uuid = getUUID();
          if (oriField != "") {
            uuid = oriField.comptSort;
            val = oriField.comptAttrs;
            val.isNeedResetLink = 0;
          }
          var item = {
            comptAttrs: val,
            type: val.type,
            comptSort: uuid,
            blockInfo: { x: 0, y: 0, w: 12, h: 12, i: uuid }
          };
          if (target.type == "MobileQuery") {
            item.blockInfo.h = 5;
            if(val.type==='ElNumber'){  //手机查询组件数值类型宽度要修改
              item.blockInfo.w = 20;
            }
          }

          if (
            this.pageCache.classTypeId == "1005" &&
            target.type == "MobileQuery"
          ) {
            item.blockInfo.w = 300;
            item.blockInfo.h = 50;
          }
          fieldList.push(item);
        });
        setTimeout(() => {
          target.afId = this.value;
          if (target.type == "MobileQuery") {
            if (target.comptAttrs.extendSetting.isNeedBtn == "true") {
              showField.splice(1, showField.length, ...fieldList);
            } else {
              showField.splice(0, showField.length, ...fieldList);
            }
          } else {
            showField.splice(0, showField.length, ...fieldList);
          }
          //日期分层级需要新增加两个判断条件（formatLevel、isNewCol）
          target.comptAttrs.selectedQueryData = selectList.map(item => {
            return {
              af_id: item.af_id,
              element_id: item.element_id,
              formatLevel: item.formatLevel,
              isNewCol: item.isNewCol
            };
          });
        }, 0);
        loadDataDone(this.activedCompt);
      } else {
        selectList.forEach(val => {
          if (val.sort != null) {
            let sortItem = {};
            sortItem.obj_id = val.tab_id;
            sortItem.col_id = val.col_id;
            sortItem.order_type = val.sort;
            sortItem.element_id = val.element_id;
            //时间格式截取字段,网关需要加聚合函数
            if(val.isNewCol){
              sortItem['dgw_fun_param'] = val.dgw_fun_param;
              sortItem['dgw_function'] = val.dgw_function;
            }
            orderList.push(sortItem);
          }
        });

        if (
          [
            "VeCombineChart",
            "VePie",
            "VeHistogram",
            "VeStackHistogram",
            "VePercentStackHistogram",
            "VeLine",
            "VeLineArea",
            "PcKpiBlock",
            "HdKpiBlock",
            "HdKpiBlock2",
            "HdKpiBlock3",
            "HdIconKpiBlock",
            "VeMap",
            "VeStackLineArea",
            "VePercentStackLineArea",
            "VeBar",
            "VeRadar",
            "VeStackBar",
            "VeAreaMap",
            "VeBmap",
            "VeHeatBmap",
            "HdFlopDevice",
            "VeRosePie",
            "VeCombineStack",
            "VeScatter",
            "Scatter",
            "VeLines",
            "VeLinesBmap",
            "VeWordCloud",
            "VeWaterfall",
            'VeBubbleMap',
            'VeFunnel',
            'VeCompareFunnel',
            'VeDoughnutPie',
            'VeSankey',
            'VeTree',
            "VeTreeMap",
            "VePercentStackBar",
            "PcIndicatorTrend"
          ].includes(this.activedCompt.type)
        ) {
          //图形 把有绑定维层的维度字段翻译一下
          let bindDimedItem = selectList.filter(item => {
            return (
              item.dim_id != "" && item.dim_id != null && item.element_type == 1
            );
          });
          // 气泡图应该只翻译x轴维度，不翻译图例维度
          if (["VeScatter", "Scatter"].includes(this.activedCompt.type) && this.selectedDataObj.legendDimData.length > 0) {
            bindDimedItem = bindDimedItem.filter(fieldItem1 => fieldItem1.element_id !== this.selectedDataObj.legendDimData[0].element_id);
          } 
          if (bindDimedItem.length > 0) {
            if (['VeSankey','VeTree'].includes(this.activedCompt.type)) {
              bindDimedItem.forEach(colItem => {
                let newItem = {
                  ...colItem,
                  ...{
                    dim_id: '',
                    dim_level_id: '',
                    is_translate: 0,
                    nick_name: `XXXXCODE_${colItem.col_id}`
                  }
                }
                selectList.unshift(newItem);
              })
            } else {
              let colItem = objDeepCopy(bindDimedItem[0]);
              let newItem = {
                ...colItem,
                ...{
                  dim_id: '',
                  dim_level_id: '',
                  is_translate: 0,
                  nick_name: "XXXXCODE"
                }
              }
              selectList.push(newItem);
            }
          }
        }
        let whereBean = objDeepCopy(this.datafilterCols());
        whereBean = objDeepCopy({
          exp: whereBean.exp_,
          rule_list: whereBean.rule_list
        });
        // 如果当前处在被联动状态，应该带上联动条件
        let oriLinkageCondi = this.activedCompt.comptAttrs["linkageCondi"];
        if (
          oriLinkageCondi != undefined &&
          oriLinkageCondi.length > 0 &&
          this.activedCompt.afId == this.value
        ) {
          //数据集没改的情况下，被联动组件的被联动情况应该带上
          whereBean = genWhereBean(oriLinkageCondi, objDeepCopy(whereBean));
        }

        // 如果当前处在钻取情况下，则保留钻取状态
        let curDrillIdx = this.activedCompt.comptAttrs["curDrillIdx"] || 0;
        let oriDrillWBeanList = objDeepCopy(
          this.activedCompt.comptAttrs["drillWBeanList"] || []
        );

        let samefalg = true; //用来判断下钻字段顺序是否完全相同
        if (
          this.activedCompt.comptAttrs.drillData != undefined &&
          this.selectedDrillData.length > 0 &&
          this.selectedDrillData.length ==
          this.activedCompt.comptAttrs.drillData.length
        ) {
          let selectedDrillData = this.selectedDrillData;
          let drillData = this.activedCompt.comptAttrs.drillData;
          selectedDrillData.forEach((item, i) => {
            if (item.element_id != drillData[i].element_id) {
              samefalg = false;
            }
          });
        }
        if (
          curDrillIdx > 0 &&
          curDrillIdx < oriDrillWBeanList.length &&
          this.activedCompt.afId == this.value &&
          this.selectedDrillData.length > 1 &&
          this.activedCompt.comptAttrs.drillData != undefined &&
          this.selectedDrillData.length ==
          this.activedCompt.comptAttrs.drillData.length &&
          samefalg
        ) {
          let wbRuleList =
            oriDrillWBeanList[curDrillIdx].whereBean.rule_list || [];
          let drillWBRule = wbRuleList.filter(item => {
            return item.exp_id.indexOf("drill_exp") > -1;
          });
          for (let index = 0; index < drillWBRule.length; index++) {
            drillWBRule[index].exp_id = "";
          }
          whereBean = genWhereBean(drillWBRule, objDeepCopy(whereBean), true);
          let oriDrillField = oriDrillWBeanList[curDrillIdx].item; //如果钻取字段有在selectList内，则selectList不作处理，如果没有，把上级被钻取字段替换为本级字段
          let ifFieldInSel = selectList.some(item => {
            return item.element_id == oriDrillField.element_id;
          });
          if (!ifFieldInSel) {
            let firstDrillField = oriDrillWBeanList[0].item;
            for (let index = 0; index < selectList.length; index++) {
              const element = selectList[index];
              if (element.element_id == firstDrillField.element_id) {
                selectList[index] = objDeepCopy(oriDrillField);
                if (
                  [
                    "VeCombineChart",
                    "VePie",
                    "VeCombineStack",
                    "VeHistogram",
                    "VeStackHistogram",
                    "VePercentStackHistogram",
                    "VeLine",
                    "VeLineArea",
                    "PcKpiBlock",
                    "VeMap",
                    "VeStackLineArea",
                    "VePercentStackLineArea",
                    "VeBar",
                    "VeRadar",
                    "VeStackBar",
                    "VeAreaMap",
                    "VeBmap",
                    "VeHeatBmap",
                    "HdFlopDevice",
                    "VeRosePie",
                    'VeBubbleMap',
                    "VeSankey",
                    "VeWaterfall",
                    "VeWordCloud",
                    "VeDoughnutPie",
                    "VeTree",
                    "VeTreeMap",
                    "VePercentStackBar",
                    "PcIndicatorTrend"
                  ].includes(this.activedCompt.type) &&
                  !selectList.some(item => {
                    return (
                      item.nick_name.indexOf("XXXXCODE") > -1 &&
                      item.element_id == oriDrillField.element_id
                    );
                  })
                ) {
                  let copyDrillField = objDeepCopy(oriDrillField);
                  copyDrillField.dim_id = "";
                  copyDrillField.dim_level_id = "";
                  copyDrillField["is_translate"] = 0;
                  if (['VeSankey'].includes(this.activedCompt.type)) {
                    copyDrillField.nick_name = `XXXXCODE_${element.col_id}`;
                    selectList.unshift(copyDrillField);
                  } else {
                    copyDrillField.nick_name = "XXXXCODE";
                    selectList[selectList.length - 1] = copyDrillField;
                  }
                }
                break;
              }
            }
          }

          if (
            this.selectedDrillData[curDrillIdx] != undefined &&
            this.selectedDrillData[curDrillIdx].sort != null
          ) {
            let sortItem1 = {
              obj_id: this.selectedDrillData[curDrillIdx].tab_id,
              col_id: this.selectedDrillData[curDrillIdx].col_id,
              order_type: this.selectedDrillData[curDrillIdx].sort,
              element_id: this.selectedDrillData[curDrillIdx].element_id
            };
            orderList.push(sortItem1);
          }
        } else {
          this.activedCompt.comptAttrs["curDrillIdx"] = 0;
          this.activedCompt.comptAttrs["drillWBeanList"] = [];
        }

        // 更新进度条系列设置colsetting的列信息
        this.updateProgressBarData();

        // let crossTableDrillList = []; //交叉表待翻译字段列表
        if (["CrossTable", "ElDatagrid", 'PivotTable'].includes(this.activeComp.type)) {
          //this.activedCompt.type == "ElDatagrid" ||
          // (['CrossTable', 'PivotTable'].includes(this.activeComp.type) && this.polymerizeType == 2)
          for (let index = 0; index < selectList.length; index++) {
            const element = selectList[index];
            if (element.dim_id != "" && element.dim_id != null) {
              let colItem = objDeepCopy(element);
              colItem.dim_id = "";
              colItem.dim_level_id = "";
              colItem["is_translate"] = 0;
              if (
                this.activeComp.type == "CrossTable" &&
                this.polymerizeType == 1
              ) {
                //聚合
                colItem.nick_name = colItem.nick_name + "_drill";
                // crossTableDrillList.push(colItem);
              } else {
                colItem.nick_name = "XXXXCODE_" + colItem.element_id;
              }
              selectList.push(colItem); //把所有有绑定维度的字段都加入查询列表，获取对应的维值
            }
          }

          selectList = objDeepCopy(selectList);
          if (this.polymerizeType == 2) {
            //清单
            for (let qd = 0; qd < selectList.length; qd++) {
              let element = selectList[qd];
              if (element.element_type == 2) {
                selectList[qd].fun_type = "";
              }
            }
          } else {
            //聚合
            let dgColSetting = this.activedCompt.comptAttrs.colSetting;
            for (let jh = 0; jh < selectList.length; jh++) {
              let element = selectList[jh];
              if (element.element_type == 2) {
                if (dgColSetting[element.element_id] == undefined) {
                  dgColSetting[element.element_id] = {
                    nick_name: element.nick_name,
                    align: element.align,
                    numType: element.numType || "",
                    dot: element.dot || "",
                    totalFunType: element.totalFunType, //合计
                    colCondiExp: [],
                    setCondi: false,
                    isNumber: element.element_type == 2, //表格数据格式和条件设置 只针对度量 element.col_type == "No."
                    polymerFunType: element.is_calcul == '2' ? 0 : 2,
                    oriName: element.nick_name
                  };
                }
                let polymerFunType = dgColSetting[element.element_id].polymerFunType;
                selectList[jh].fun_type = polymerFunType === 0 ? 0 : (polymerFunType || 2);
              }
            }
          }
        }

        if (
          this.activedCompt.type == "PcKpiBlock" ||
          this.activedCompt.type == "HdKpiBlock" ||
          this.activedCompt.type == "HdKpiBlock2" ||
          this.activedCompt.type == "HdKpiBlock3"
        ) {
          let seriesData = objDeepCopy(
            this.activedCompt.comptAttrs.extendSetting.series
          );
          seriesData.forEach(data1 => {
            selectList.forEach(data2 => {
              if (data1.id == data2.element_id) {
                data2.nick_name = data1.name;
              }
            });
          });
        }
        //处理点击更新确定数据后使用别的查询，避免别名回显错误的问题
        if (this.activedCompt.type == "HdIconKpiBlock") {
          let yAxis1Data = objDeepCopy(this.activedCompt.comptAttrs.yAxis1Data);
          yAxis1Data.forEach(data1 => {
            selectList.forEach(data2 => {
              if (data1.element_id == data2.element_id) {
                data2.nick_name = data1.nick_name;
              }
            });
          });
        }

        // 进度条构造请求参数 如果目标设置是动态的，加入对应度量
        if (this.activedCompt.type == "ProgressBar" && this.activedCompt.comptAttrs.colSetting) {
          const colSetting1 = this.activedCompt.comptAttrs.colSetting;
          let targetMeasureList = [];
          selectList.forEach(field1 => {
            const colSet = colSetting1[field1.element_id];
            if (colSet && colSet.targetSetMode === 'dynamic' && !colSet.targetMeasureElementId) {
              const targetMeasure = (this.datasetMap[this.activedCompt.afId] || []).find(field => field.element_id === colSet.targetMeasureElementId);
              if (targetMeasure) {
                targetMeasureList.push({
                  ...targetMeasure,
                  ...{
                    nick_name: `${field1.element_id}_target`, // 目标度量值
                    fun_type: colSet.targetPolymerizeType || '2'
                  }
                });
              }
            }
          });
          selectList = selectList.concat(targetMeasureList);
        }
        // 百分比堆叠图排序字段
        if (['VePercentStackLineArea', 'VePercentStackHistogram',"VePercentStackBar"].includes(this.activedCompt.type)) {
          let yAxis1Data = this.activedCompt.comptAttrs.yAxis1Data;
          selectList.forEach(data1 => {
            yAxis1Data.forEach(data2 => {
              if (data1.element_id == data2.element_id) {
                data2.sort = data1.sort;
              }
            });
          });
        }
        // 指标拆解树另存一份数据过滤的数据
        if (['DesicionTree'].includes(this.activedCompt.type)) {
          setTimeout(() => {
            let filterColsData = objDeepCopy(this.activedCompt.comptAttrs.whereBean);
            this.activedCompt.comptAttrs.setting.filterColsData = filterColsData;
          }, 1000)
        }

        let params = {
          reqType: "1",
          dataType: dataType,
          afQueryBean: {
            af_id: this.value,
            begin_date: "",
            head_bean: {
              pageCount: pageSet.pageCount, // 图形不要分页,限制100条  表格要
              start: pageSet.start,
              user_id: window.sessionStorage.getItem("user_id")
            },
            is_need_log: 1,
            is_need_paging: isNeedPaging,
            is_need_permission: 1,
            is_need_trans: 1,
            query_type: "1",
            select_list: selectList,
            order_list: orderList,
            where_bean: whereBean
          }
        }
        if (
          this.activedCompt.type == "CrossTable" &&
          this.polymerizeType == 1
        ) {
          //表格请求不太格式跟其他组件不一样
          params = getTableReqParam({
            params: params,
            xAxisData: this.selectedDimData,
            yAxis1Data: this.selectedMeasureData,
            polymerizeType: this.polymerizeType,
            vscompt: this.activedCompt
          });
          // params["drillDimList"] = crossTableDrillList;
          this.activedCompt["RequestSelectList"] = objDeepCopy(
            params.afQueryBean.select_list
          );
        }
        if (this.activedCompt.type == "ElSwiper") {
          params.afQueryBean.head_bean.pageCount = this.activedCompt.comptAttrs.extendSetting.pageSize;
          params.afQueryBean.head_bean.start = 1;
          params.afQueryBean.is_need_paging = 1;
        }

        /* 含有图例维度的需要添加 colDimList 和 rowDimList  */
        if ((this.selectedDataObj._legendData||[]).length > 0) {
          const lendData = this.selectedDataObj._legendData
          const otherData = selectList.filter(item => item.element_id !== lendData[0].element_id)
          const rowDimList = lendData
          const colDimList = [
            ...otherData.filter(item => item.element_type == 1),
            ...otherData.filter(item => item.element_type == 2)
          ]
          params.afQueryBean.select_list = [...colDimList, ...rowDimList]
          params.colDimList = colDimList.map(item => {
            return {
              "col_id": item.col_id,
              "nick_name": item.nick_name,
              "element_name": item.element_name,
              "element_type": item.element_type,
              "element_id": item.element_id,
              "obj_id": item.tab_id
            }
          })
          params.rowDimList = rowDimList.map(item => {
            let temp = {
              "col_id": item.col_id,
              "nick_name": item.nick_name,
              "element_name": item.element_name,
              "element_type": item.element_type,
              "element_id": item.element_id,
              "obj_id": item.tab_id
            }
            if (item.element_type == 2) {
              temp.fun_type = item.fun_type
            }
            return temp
          })
        }
        this.queryData(params);
      }
    },
    getFieldByEId(af_id, element_id) {
      return (this.datasetMap[af_id] || []).find(field => field.element_id === element_id);
      // let results = [];
      // arr.forEach(item => {
      //   const { af_id, element_id } = item;
      //   const res = (this.datasetMap[af_id] || []).find(field => field.element_id === element_id);
      //   if (res) {
      //     results.push(res);
      //   }
      // })
      // return results;
    },
    queryDimList(field) {
      var _this = this;
      this.queryDimInfoList({
        dim_level_list: [
          {
            dim_id: field.dim_id,
            dim_level_id: field.dim_level_id
          }
        ]
      })
        .then(response => {
          if (
            response.data.respResult == 1 &&
            response.data.dataTotalCount > 0 &&
            response.data.respData.length > 0
          ) {
            if (typeof _this.dimInfoMap.set !== "function") {
              _this.upDimInfoMap({
                type: "reset",
                data: new Map()
              });
            }
            _this.upDimInfoMap({
              type: "set",
              key: field.dim_level_id,
              data: response.data.respData[0].dim_level_list || []
            });
          } else {
            _this.$message.error("查询维层列表信息失败");
            // console.error(response.data.respErrorDesc);
          }
        })
        .catch(error => {
          // _this.$message.error("查询维层列表信息失败");
          console.error(error);
        });
    },
    clearLinkageSet(mainLinkageData, drillFieldId) {
      for (let index = 0; index < mainLinkageData.length; index++) {
        const element = mainLinkageData[index];
        for (let index2 = 0; index2 < this.flatCompt.length; index2++) {
          if (this.flatCompt[index2].comptId == element.comptId) {
            const comptItem = this.flatCompt[index2];
            if (
              comptItem.comptAttrs["linkageCondi"] != undefined &&
              comptItem.comptAttrs["linkageCondi"].length > 0
            ) {
              let linkageCondi = comptItem.comptAttrs["linkageCondi"];
              for (let index3 = 0; index3 < linkageCondi.length; index3++) {
                if (linkageCondi[index3].rel_element_id == drillFieldId) {
                  this.flatCompt[index2].comptAttrs["linkageCondi"].splice(
                    index3,
                    1
                  );
                  break;
                }
              }
            }
            break;
          }
        }
      }
    },
    currentSel(row) {
      if (
        ['ElDatagrid','CrossTable', 'PivotTable'].includes(this.activeComp.type)
      ) {
        //表格比较特殊，在xaxisdata里
        let colSetting = this.activedCompt.comptAttrs.colSetting;
        if (colSetting[row.id] == undefined) {
          colSetting[row.id] = {
            nick_name: row.nick_name,
            align: row.align,
            numType: row.numType || "",
            dot: row.dot || "",
            totalFunType: row.totalFunType, //合计
            colCondiExp: [],
            setCondi: false,
            isNumber: row.element_type == 2, //表格数据格式和条件设置 只针对度量 row.col_type == "No."
            polymerFunType: row.fun_type,
            fixed: false,
            oriName: row.nick_name
          };
        } else colSetting[row.id].polymerFunType = row.fun_type;
      }

      let isY1flag = false; //字段是否在y1轴
      for (let index = 0; index < this.selectedMeasureData.length; index++) {
        const element = this.selectedMeasureData[index];
        if (row.id == element.element_id) {
          element.fun_type = row.fun_type;
          isY1flag = true;
          break;
        }
      }
      if (isY1flag) {
        let comptYAxis1Data = this.activedCompt.comptAttrs.yAxis1Data;
        for (let index = 0; index < comptYAxis1Data.length; index++) {
          const element = comptYAxis1Data[index];
          if (row.id == element.element_id) {
            element.fun_type = row.fun_type;
            break;
          }
        }
      } else {
        for (let index = 0; index < this.selectedMeasureData2.length; index++) {
          const element = this.selectedMeasureData2[index];
          if (row.id == element.element_id) {
            element.fun_type = row.fun_type;
            break;
          }
        }
        let comptYAxis2Data = this.activedCompt.comptAttrs.yAxis2Data;
        for (let index = 0; index < comptYAxis2Data.length; index++) {
          const element = comptYAxis2Data[index];
          if (row.id == element.element_id) {
            element.fun_type = row.fun_type;
            break;
          }
        }
      }
      if (this.elementObj.length > 0) {
        let comptYAxis1Data = this.activedCompt.comptAttrs.yAxis1Data;
        for (let index = 0; index < comptYAxis1Data.length; index++) {
          const element = comptYAxis1Data[index];
          if (row.id == element.element_id) {
            element.fun_type = row.fun_type;
            (this.selectedDataObj[`${element['isNewSetting']}Data`]||[]).some(item => {
              if (item.element_id == row.id) {
                item.fun_type = row.fun_type;
                return true
              }
            })
            break;
          }
        }
      }
    },
    cloneDragItem(item) {
      return objDeepCopy(item);
    },
    async resetCompInfo() {
      let curCompTemp = {};
      let param={
        compType: this.activedCompt.type
      }
      let resp = await this.qryStyleAttrs(param);
      if(!resp){
        return;
      }else{
        if (resp.status == 200 && resp.data.respResult == "1") {
          curCompTemp = resp.data.respData;
        } else {
          this.$message.error(resp.data.respErrorDesc)
          return;
        }
      }

      let activeComp = this.activedCompt;
      // this.$set(activeComp.comptAttrs, "isNeedResetLink", 1); //以防在联动情况下，先重置再清联动信息
      if (activeComp.comptAttrs.isNeedResetLink != undefined)
        activeComp.comptAttrs.isNeedResetLink++;
      //清除其他组件联动这个组件的信息
      let curComptId = activeComp.comptId,
        oriAfId = activeComp.afId;
      for (let index = 0; index < this.flatCompt.length; index++) {
        const element = this.flatCompt[index];
        if (
          element.comptId != curComptId &&
          element.comptAttrs["mainLinkageData"] != undefined &&
          element.comptAttrs.mainLinkageData.length > 0
        ) {
          let array1 = element.comptAttrs.mainLinkageData;
          for (let index2 = 0; index2 < array1.length; index2++) {
            if (
              array1[index2].comptId == curComptId &&
              array1[index2].af_id == oriAfId
            ) {
              this.flatCompt[index].comptAttrs.mainLinkageData.splice(
                index2,
                1
              );
              break;
            }
          }
        }
      }
      setTimeout(() => {
        // activeComp.comptAttrs = objDeepCopy(curCompTemp.comptAttrs);
        for (const attrItem in activeComp.comptAttrs) {
          if (attrItem != "chartEvents") {
            //图形事件不能重置，不然后续的联动有问题
            if (typeof curCompTemp.comptAttrs[attrItem] == "undefined")
              if (typeof activeComp.comptAttrs[attrItem] == "object") {
                activeComp.comptAttrs[attrItem] = objDeepCopy(
                  curCompTemp.comptAttrs[attrItem]
                );
              } else {
                activeComp.comptAttrs[attrItem] =
                  curCompTemp.comptAttrs[attrItem];
              }
          }
        }
        activeComp.comptAttrs.extendSetting["comptName.text"] =
          activeComp.comptAttrs.name + activeComp.orderId;
      }, 0);
      activeComp.styleAttrs = objDeepCopy(curCompTemp.styleAttrs);
      let firChild = activeComp.styleAttrs[0].children || [];
      // 把组件原始名称回填样式
      for (const iterator of firChild) {
        if (iterator.enName == "comptName.text") {
          iterator.value = activeComp.comptAttrs.name + activeComp.orderId;
          break;
        }
      }

      activeComp.afId = "";
      if(activeComp.comptAttrs.isExtComp === "1"){
        activeComp["comptData"] = {
            columns: [],
            rows: []
          };
      }
      switch (activeComp.type) {
        case "VeCombineChart":
        case "VeHistogram":
        case "VeStackHistogram":
        case "VePie":
        case "VeWordCloud":
        case "VeLine":
        case "VeLineArea":
        case "VeStackLineArea":
        case "VePercentStackLineArea":
        case "VeMap":
        case "VeBar":
        case "VeStackBar":
        case "VeGauge":
        case "VeRing":
        case "PcKpiBlock":
        case "HdKpiBlock":
        case "HdKpiBlock2":
        case "HdKpiBlock3":
        case "HdIconKpiBlock":
        case "VeAreaMap":
        case "VeBmap":
        case "VeRosePie":
        case "ElSwiper":
        case "VeCombineStack":
        case 'VeBubbleMap':
        case 'VeTree':
        case 'PcIndicatorTrend':
          activeComp["comptData"] = {
            columns: [],
            rows: []
          };
          break;
        case "ElDatagrid":
        case "PivotTable":
          activeComp["comptData"] = {
            data: [],
            columns: []
          };
          break;
        case "CrossTable":
          activeComp["comptData"] = {
            data: [],
            columns: []
          };
          activeComp["oriComptData"] = [];
          break;
        default:
          break;
      }
    },
    datasetSelChange(value) {
      // 变更数据集，所有数据设置都要进行重置，包含钻取、聚合函数、条件设置等
      let oriAfId = this.activedCompt.afId;
      if (oriAfId != "" && value != "" && oriAfId != value)
        this.resetCompInfo();
      this.getColsData(value);
    },
    // 对于柱状图、组合图等图形，如果columns列数变比之前少，comptattrs的series.index属性要先删除，不然图形渲染会报错 series.type should be specified.
    resetChartSeries(params, response) {
      let columns = response.data.respData.columns || [];
      let columnCount = columns.length;
      if (columns.length > 0 && columns.indexOf("XXXXCODE") > -1) {
        columnCount -= 1;
      }
      // 撤销还原再绑定数据集报错问题修复
      if(!this.activedCompt.comptData){
        this.activedCompt.comptData={
          columns:[],
          rows:[]
        }
      }
      let oriColCount = 0
      try {
        oriColCount = this.activedCompt.comptData.columns.length || 0;
      } catch (e) {}
      // if (oriColCount > 0) {
      // this.updateChartSeries(columns);
      // }
      let oriCols =
        this.activedCompt.comptData.columns != undefined
          ? this.activedCompt.comptData.columns
          : [];

      let flag = true; //y轴顺序或者内容有变 就得更新系列的设置
      if (oriColCount > 0) {
        for (let index = 0; index < columns.length; index++) {
          if (
            columns[index].indexOf("XXXXCODE") == -1 &&
            oriCols[index] != columns[index]
          ) {
            flag = false;
            break;
          }
        }
      }
      if (
        [
          "VeCombineChart",
          "VeHistogram",
          "VeStackHistogram",
          "VePercentStackHistogram",
          "VePie",
          "VeWordCloud",
          "VeLine",
          "VeLineArea",
          "VeStackLineArea",
          "VePercentStackLineArea",
          "VeMap",
          "VeBar",
          "VeStackBar",
          "VeAreaMap",
          "VeBmap",
          "VeLinesBmap",
          "VeHeatBmap",
          "HdKpiBlock",
          "HdKpiBlock2",
          "HdKpiBlock3",
          "VeRosePie",
          "VeCombineStack",
          "VeScatter",
          "VeLines",
          "VeWaterfall",
          'VeBubbleMap',
          "VeSankey",
          "Scatter",
          "VePercentStackBar"
        ].includes(this.activedCompt.type) &&
        (!flag || columnCount < oriColCount)
      ) {
        // && columnCount < oriColCount
        if (
          this.activedCompt.type == "HdKpiBlock" ||
          this.activedCompt.type == "HdKpiBlock2" ||
          this.activedCompt.type == "HdKpiBlock3"
        ) {
          columnCount = 1;
          oriColCount = 1;
        } else {
          columnCount -= 1;
          oriColCount -= 1;
        }

        for (let index = 0; index < columnCount; index++) {
          let extSet = this.activedCompt.comptAttrs.extendSetting;
          if (extSet[`series.${index}.label.normal.show`] != undefined) {
            this.$set(extSet, `series.${index}.label.normal.show`, false);
            this.$set(extSet, `series.${index}.label.position`, 'right');
          }
          if (extSet[`series.${index}.name`] != undefined) {
            delete this.activedCompt.comptAttrs.extendSetting[
              `series.${index}.name`
            ];
            delete this.activedCompt.comptAttrs.extendSetting[
              `legend.data.${index}`
            ];
          }
          if (extSet[`series.${index}.markPoint`] != undefined) {
            delete this.activedCompt.comptAttrs.extendSetting[
              `series.${index}.markPoint`
            ];
          }
          if (extSet[`series.${index}.markPoint`] != undefined) {
            delete this.activedCompt.comptAttrs.extendSetting[
              `series.${index}.markPoint`
            ];
          }
          if (extSet[`series.${index}.itemStyle.normal.color`] != undefined) {
            delete this.activedCompt.comptAttrs.extendSetting[
              `series.${index}.itemStyle.normal.color`
            ];
          }
          if (extSet[`series.${index}.number.format`] != undefined) {
            delete this.activedCompt.comptAttrs.extendSetting[
              `series.${index}.number.format`
            ];
          }
          if (extSet[`series.${index}.decimalDigit`] != undefined) {
            delete this.activedCompt.comptAttrs.extendSetting[
              `series.${index}.decimalDigit`
            ];
          }
          if (extSet[`series.${index}.barWidth`] != undefined) {
            delete this.activedCompt.comptAttrs.extendSetting[
              `series.${index}.barWidth`
            ];
          }
          if (extSet[`series.${index}.label.normal.map.show`] != undefined) {
            this.$set(extSet, `series.${index}.label.normal.map.show`, false);
          }
          if (extSet[`series.${index}.itemStyle.normal.barBorderRadius`] != undefined) {
            delete this.activedCompt.comptAttrs.extendSetting[
              `series.${index}.itemStyle.normal.barBorderRadius`
            ];
          }
        }
        for (let index = columnCount; index < oriColCount; index++) {
          delete this.activedCompt.comptAttrs.extendSetting[
            `series.${index}.symbolSize`
          ];
          delete this.activedCompt.comptAttrs.extendSetting[
            `series.${index}.label.normal.show`
          ];
          delete this.activedCompt.comptAttrs.extendSetting[
            `series.${index}.name`
          ];
          delete this.activedCompt.comptAttrs.extendSetting[
            `series.${index}.type`
          ];
          delete this.activedCompt.comptAttrs.extendSetting[
            `series.${index}.itemStyle.normal.color`
          ];
          delete this.activedCompt.comptAttrs.extendSetting[
            `series.${index}.markPoint`
          ];
          delete this.activedCompt.comptAttrs.extendSetting[
            `legend.data.${index}`
          ];
          delete this.activedCompt.comptAttrs.extendSetting[
            `series.${index}.label.normal.map.show`
          ];
          delete this.activedCompt.comptAttrs.extendSetting[
            `series.${index}.barWidth`
          ];
          delete this.activedCompt.comptAttrs.extendSetting[
            `series.${index}.itemStyle.normal.barBorderRadius`
          ];
          delete this.activedCompt.comptAttrs.extendSetting[
            `series.${index}.label.normal.position`
          ];
        }

        if (
          [
            "VeCombineChart",
            "VeLine",
            "VeLineArea",
            "VeStackLineArea",
            "VePercentStackLineArea",
            "VeHistogram",
            "VeStackHistogram",
            "VePercentStackHistogram",
            "VeBar",
            "VeStackBar",
            "HdKpiBlock",
            "HdKpiBlock2",
            "HdKpiBlock3",
            "VeWaterfall",
            "VeCombineStack",
            "VePercentStackBar"
          ].includes(this.activedCompt.type)
        ) {
          let styleIdx =
            this.activedCompt.type == "VeHistogram" ||
            this.activedCompt.type == "VeStackHistogram" ||
            this.activedCompt.type == "VePercentStackHistogram" ||
            this.activedCompt.type == "VeStackBar" ||
            this.activedCompt.type == "VeBar" ||
            this.activedCompt.type == "VeWaterfall" ||
            this.activedCompt.type == "VePercentStackBar"
              ? 3
              : 4;
          this.activedCompt.styleAttrs[styleIdx].children[1].value = "";
          this.activedCompt.styleAttrs[styleIdx].children[2].value =
            styleIdx == 3 ? "0%" : "";
          this.activedCompt.styleAttrs[styleIdx].children[3].value = "";
          this.activedCompt.styleAttrs[styleIdx].children[4].value = "";
          if (this.activedCompt.type == "VeCombineChart"||this.activedCompt.type == "VeCombineStack"){
            this.activedCompt.styleAttrs[styleIdx].children[5].value = "";
            this.activedCompt.styleAttrs[styleIdx].children[6].value = "";
          }
        }
        if (
          ['VeMap', 'VeAreaMap'].includes(this.activedCompt.type)
        ) {
          delete this.activedCompt.comptAttrs.setting["labelMap"];
          this.activedCompt.styleAttrs[2].children[1].value = "";
          this.activedCompt.styleAttrs[2].children[2].value = false;
          this.activedCompt.styleAttrs[2].children[3].value =
            "{'smooth':false}";
          this.activedCompt.styleAttrs[2].children[3].isShow = false;
          this.activedCompt.styleAttrs[2].children[4].value = "0";
          this.activedCompt.styleAttrs[2].children[4].isShow = false;
        }
      }

      if (
        this.activedCompt.type == "VeMap" &&
        flag &&
        columnCount == oriColCount
      ) {
        this.batchSetMapSeriesData();
      } else if (
        this.activedCompt.type != "VePie" &&
        this.activedCompt.type != "VeRosePie" &&
        this.activedCompt.type != "VeSankey" &&
        this.activedCompt.type != "VeTree"
      ) {
        for (var i = 0; i < this.selectedMeasureData.length; i++) {
          this.activedCompt.comptAttrs.extendSetting[
            "series." + i + ".label.normal.show"
          ] = false;
           this.activedCompt.comptAttrs.extendSetting[
            "series." + i +".label.position"
          ] = 'right';
        }
      }
    },
    doSummarize() {
      this.saveAggSetting();
      this.upAggergationFunDialog(false);
      this.confirmUpdateData();
    },
    batchSettingTotal() {
      this.upBatchDialog(false);
      this.activedCompt.comptAttrs.extendSetting["batchSetting"]++;
    },
    polymerChange(polymerizeType) {
      switch (polymerizeType) {
        case 1: //聚合
          // 交叉表将行的数据全部转成列数据
          if (this.activedCompt.type == "CrossTable") {
            let tempData = objDeepCopy(this.selectedDimData);
            tempData.sort(function (item1, item2) {
              return item1.element_type - item2.element_type;
            }); //聚合 度量必须排在维度后面
            this.selectedMeasureData = tempData;
            this.selectedDimData = [];
            // 交叉表聚合切清单，如果行有钻取，则继续保留钻取数据；清单转聚合，钻取信息要清空
            this.clearDrillInfo();
            this.$set(
              this.activedCompt.styleAttrs[2].children[10],
              "disabled",
              true
            ); //聚合列冻结设置不显示
          }
          this.openAggFunDialog(3);
          break;
        case 2: //清单
          if(this.groupFunc){
            this.$message.warning('聚合计算无法参与清单设计！');
            this.polymerizeType = 1;
            return;
          }
          // 清空聚合设置
          let colSetting = this.activedCompt.comptAttrs.colSetting;
          for (let index = 0; index < this.selectedDimData.length; index++) {
            const element = this.selectedDimData[index];
            if (element.element_type == 2) {
              colSetting[element.element_id].polymerFunType = element.is_calcul == '2' ? 0 : 2;
            }
          }
          // 交叉表将行的数据全部转成列数据
          if (this.activedCompt.type == "CrossTable") {
            this.selectedDimData = this.selectedDimData.concat(
              objDeepCopy(this.selectedMeasureData)
            );
            this.selectedMeasureData = [];
            this.$set(
              this.activedCompt.styleAttrs[2].children[10],
              "disabled",
              false
            ); //聚合列冻结设置不显示
          }
          break;
        default:
          break;
      }
      this.fieldRecord();
      this.updateCrossTbState();
    },
    openPolymerDialog() {
      if (!this.aggergationFunDialog && this.polymerizeType == 1) {
        this.openAggFunDialog(3);
      }
    },
    resetChartSeriesType() {
      if (this.activeComp.type == "VeCombineChart"||this.activeComp.type == "VeCombineStack") {
        for (let i = 0; i < this.selectedMeasureData.length; i++) {
          let ind = i;
          this.activedCompt.comptAttrs.extendSetting[
            "series." + ind + ".type"
          ] = "bar";
        }
        for (let i = 0; i < this.selectedMeasureData2.length; i++) {
          let ind = this.selectedMeasureData.length + i;
          this.activedCompt.comptAttrs.extendSetting[
            "series." + ind + ".type"
          ] = "line";
        }
        // 组合图初始回显柱图
        this.activedCompt.styleAttrs.find((val)=>val.enName === "seriesAttrs").children.find((val)=>val.enName === "series.index.type").value = "bar"
      }
      if (
        ['VeMap', 'VeAreaMap', 'VeBubbleMap'].includes(this.activeComp.type)
      ) {
        for (var i = 0; i < this.selectedMeasureData.length; i++) {
          var ind = i;
          this.activedCompt.comptAttrs.extendSetting[
            "series." + ind + ".type"
          ] = "map";
        }
      }
    },
    resetVeRadarChartSeries(params, response) {
      for (var i = 0; i < this.selectedMeasureData.length; i++) {
        var ind = i;
        this.activedCompt.comptAttrs.extendSetting["series." + ind + ".type"] =
          "radar";
      }

      let isChange = false; //度量个数或者顺序是否改变
      let respRows = response.data.respData.rows || []; //实际返回度量数据
      let oriRows =
        this.activedCompt.comptData == undefined
          ? []
          : this.activedCompt.comptData.rows || []; //原始度量数据
      if (respRows.length != oriRows.length) {
        //个数改变
        isChange = true;
      } else {
        for (let i = 0; i < respRows.length; i++) {
          if (respRows[i].type != oriRows[i].type) {
            //顺序改变
            isChange = true;
            break;
          }
        }
      }

      if (isChange) {
        //重置数据标签
        this.activedCompt.comptAttrs.setting["label"] = eval(
          "({'show': false})"
        );

        //重置显示面积
        let itemStyleVal = "{normal: {areaStyle: {type: 'default'}}}";
        this.activedCompt.comptAttrs.setting["itemStyle"] = eval(
          "(" + itemStyleVal + ")"
        );

        //重置系列设置
        this.activedCompt.styleAttrs[2].children[1].value = "";
        this.activedCompt.styleAttrs[2].children[2].value = "0";
        this.activedCompt.styleAttrs[2].children[3].value = "";
        this.activedCompt.comptAttrs.extendSetting["legendData"] = {};
        this.activedCompt.comptAttrs.extendSetting["color"] = objDeepCopy(
          this.activedCompt.comptAttrs.defaultColor
        );
      }

    },
    //重置树图系列
    resetVeTreeChartSeries(params, response) {
      let isChange = false; //度量个数或者顺序是否改变
      let respRows = response.data.respData.rows || []; //实际返回度量数据
      let oriRows =
        this.activedCompt.comptData == undefined
          ? []
          : this.activedCompt.comptData.rows || []; //原始度量数据
      if (respRows.length != oriRows.length) {
        //个数改变
        isChange = true;
      }

      if (isChange) {
        for(let i = 1; i < oriRows.length; i++){
          //线条样式
          if (extSet[`series.${i}.lineStyle.curveness`] != undefined) {
            delete this.activedCompt.comptAttrs.extendSetting[
              `series.${i}.lineStyle.curveness`
            ];
          }
          //节点颜色
          if (extSet[`series.${i}.itemStyle.borderColor`] != undefined) {
            delete this.activedCompt.comptAttrs.extendSetting[
              `series.${i}.itemStyle.borderColor`
            ];
          }
          //节点全部展开
          if (extSet[`series.${i}.expandAndCollapse`] != undefined) {
            delete this.activedCompt.comptAttrs.extendSetting[
              `series.${i}.expandAndCollapse`
            ];
          }
          //节点全部展开
          if (extSet[`series.${i}.initialTreeDepth`] != undefined) {
            delete this.activedCompt.comptAttrs.extendSetting[
              `series.${i}.initialTreeDepth`
            ];
          }
        }
        for(let j = 0; j < respRows.length; j++){
          //图形方向
          this.activedCompt.comptAttrs.extendSetting[
              `series.${j}.orient`
            ] = this.activedCompt.styleAttrs[1].children[0].value;
          //线条样式
          this.activedCompt.comptAttrs.extendSetting[
              `series.${j}.lineStyle.curveness`
            ] = this.activedCompt.styleAttrs[1].children[1].value;
          //节点颜色
          this.activedCompt.comptAttrs.extendSetting[
              `series.${j}.itemStyle.borderColor`
            ] = 'source' ;
          //节点全部展开
          this.activedCompt.comptAttrs.extendSetting[
              `series.${j}.expandAndCollapse`
            ] = true;
          //节点全部展开
          this.activedCompt.comptAttrs.extendSetting[
              `series.${j}.initialTreeDepth`
            ] = -1;
        }
      }
    },
    //重置指标数据
    resetHdKpiBlockChartSeries(params, response) {
      let activedCompt = this.activedCompt;
      let extendSetting = this.activedCompt.comptAttrs.extendSetting;
      let styleAttrs = this.activedCompt.styleAttrs;
      let commonAttrs;
      styleAttrs.forEach(data => {
        if (data.enName === "numberAttrs") {
          commonAttrs = data.children;
        }
      });

      //指标1-2-3
      let isChange = false; //度量个数或者顺序是否改变
      let respRows = response.data.respData.rows || []; //实际返回度量数据
      let oriRows = this.activedCompt.comptData.rows || []; //当前数据值
      let respCols = response.data.respData.columns || []; //数据库key
      let oriCols = this.activedCompt.comptData.columns || []; //当前key

      if (respRows.length == 0 || oriRows.length == 0 || respCols.length > oriCols.length) {
        //原始数据库中数据直接清空
        this.activedCompt.styleAttrs[1].children[1].value = ""; //别名设置为空
        this.activedCompt.styleAttrs[1].children[2].value = "16"; //字体大小默认16
        this.activedCompt.styleAttrs[2].children[2].value = "16";
        this.activedCompt.styleAttrs[2].children[4].value = false; // 是否翻滚计数
        this.activedCompt.styleAttrs[2].children[5].value = false; // 是否启用条件格式
        this.activedCompt.styleAttrs[1].children[4].value = ""; //单位设置为空
        extendSetting.series = []; //清空系列中数据

        //将显示值初始化
        commonAttrs.forEach(seriesOptions => {
          switch (seriesOptions.enName) {
            case "numberType":
              seriesOptions.value = "无"; //赋值为无
              break;
            case "decimalDigit":
              seriesOptions.value = ""; //赋值为空
              break;
          }
        });
      } else {
        //有数据
        for (let i = 0; i < respRows.length; i++) {
          // if (respRows[i][respCols[i]] != oriRows[i][oriCols[i]]) {  //预留此方法，别删除
          if (respCols[i] != oriCols[i]) {
            //顺序改变
            isChange = true;
            break;
          }
        }
      }

      if (isChange) {
        this.activedCompt.styleAttrs[1].children[1].value = ""; //别名设置为空
        this.activedCompt.styleAttrs[1].children[2].value = "16"; //字体大小默认16
        this.activedCompt.styleAttrs[2].children[2].value = "16";
        this.activedCompt.styleAttrs[2].children[4].value = false; // 是否翻滚计数
        this.activedCompt.styleAttrs[2].children[5].value = false; // 是否启用条件格式
        this.activedCompt.styleAttrs[1].children[4].value = ""; //单位设置为空
        extendSetting.series = []; //清空系列中数据

        //将显示值初始化
        commonAttrs.forEach(seriesOptions => {
          switch (seriesOptions.enName) {
            case "numberType":
              seriesOptions.value = "无"; //赋值为无
              break;
            case "decimalDigit":
              seriesOptions.value = ""; //赋值为空
              break;
          }
        });
      }

      //真实名称与别名一致清空
      if (this.activedCompt.styleAttrs[1].children[0].options.length != 0) {
        var n_name = this.activedCompt.styleAttrs[1].children[1].value;
        var real_name = this.activedCompt.styleAttrs[1].children[0].options[
          activedCompt.comptAttrs.selectIndex
        ].label;
        if (n_name == real_name) {
          this.activedCompt.styleAttrs[1].children[1].value = ""; //别名设置为空
        }
      }
    },
    resetMapScatterData(type) {
      //散点scatter赋值
      //坐标集合
      let properties = {};
      let scatterData = [];
      if (!['VeHeatBmap'].includes(type)) {
        let mapJson = {};
        if (['VeLinesBmap', 'VeBmap'].includes(type)) {
          mapJson['geoJson'] = this.activedCompt.comptAttrs.setting['mapOrigin'];
        } else {
          mapJson = this.$echarts.getMap(
            this.mapLevel == "1"
              ? this.activedCompt.comptAttrs.drillData.length == 0
                ? "province/" + this.mapArea
                : this.activedCompt.comptAttrs.extendSetting.geo.map
              : this.mapArea.replace(/(['一',('县市')])/gi, "")
          );
        }
        let features = mapJson == null ? [] : (mapJson.geoJson || {}).features;
        for (var i = 0; i < features.length; i++) {
          properties[features[i].properties.name] = features[i].properties.cp;
          scatterData.push({
            name: features[i].properties.name,
            value: features[i].properties.cp
          });
          if (
            this.activeComp.comptData.rows == null ||
            this.activeComp.comptData.rows.length == 0
          ) {
            scatterData[i].value[2] = "-";
          }
        }
      }
      if (['VeBmap', 'VeLinesBmap', 'VeBubbleMap'].includes(type)) {
        let seriesName = this.activeComp.comptData.columns[1];
        let colsData = (this.getColsTotalAndData.colsData || {})[seriesName];
        for (let j = 0; j < scatterData.length; j++) {
          for (let key in colsData) {
            if (key === scatterData[j].name) {
              if (['VeBmap', 'VeLinesBmap'].includes(type)) {
                // 获取数据中的某个坐标点作为中心点
                this.activeComp.comptAttrs.setting.bmap.center = [scatterData[j].value[0], scatterData[j].value[1]];
              }
              scatterData[j].value[2] = colsData[key];
              break;
            }
          }
        }
        if ('VeBmap' === type) {
          scatterData = scatterData.filter(sd => {
            return sd.value[2] && sd.value[2] !== '-';
          });
        }     
        this.activedCompt.comptAttrs.extendSetting.series[0].data = scatterData;
      } else if(['VeAreaMap'].includes(type)){
        //区域地图在系列设置
        let styleIndex = ['VeAreaMap'].includes(type) ? 2 : 1;
        let seriesName = this.activeComp.comptData.columns[['VeAreaMap'].includes(type) ? 1 : 2];
        let colsData = (this.getColsTotalAndData.colsData || {})[seriesName];
        //如果显示数据标签，散点数据赋值data.value[2]
        if (
          this.activeComp.styleAttrs[styleIndex].children[2].value &&
          this.activeComp.comptData.rows != null &&
          this.activeComp.comptData.rows.length > 0
        ) {
          //小数点
          let decimal = this.activedCompt.styleAttrs[styleIndex].children[4].value;
          let tolCount = this.getColsTotalAndData.colsTotal[seriesName];
          //数据显示格式
          let smooth = this.activedCompt.styleAttrs[styleIndex].children[3].value;
          eval("smooth=" + this.activedCompt.styleAttrs[styleIndex].children[3].value);
          for (let i = 0; i < scatterData.length; i++) {
            for (let key in colsData) {
              if (key == scatterData[i].name) {
                scatterData[i].value[2] = smooth.smooth
                  ? (colsData[key] == 0 || colsData[key] == ""
                    ? 0
                    : parseFloat((colsData[key] * 100) / tolCount).toFixed(
                      parseInt(decimal)
                    )) + "%"
                  : parseFloat(colsData[key]).toFixed(parseInt(decimal));
                break;
              }
            }
          }
        }
        scatterData.forEach((item, index) => {
          const val1 = item.value[2];
          if (typeof val1 === 'string' && !isNaN(Number(val1))) {
            scatterData[index].value[2] = Number(val1);
          } else {
            scatterData[index].value[2] = 0;
          }
        });
        this.activedCompt.comptAttrs.extendSetting.series[0].data = scatterData;

        //如果显示最大值，重置
        if (
          this.activedCompt.styleAttrs[styleIndex].children[5].value &&
          this.activedCompt.comptData.rows != null &&
          this.activedCompt.comptData.rows.length > 0
        ) {
          this.setAreaMapMaxData();
        }
        //设置图例
        let legendName =
          this.activedCompt.comptAttrs.extendSetting.legend.data[0]["name"] != ""
            ? this.activedCompt.comptAttrs.extendSetting.legend.data[0]["name"]
            : this.activedCompt.comptData.columns[1];
        this.activedCompt.comptAttrs.extendSetting.series[0].name = legendName;
        this.activedCompt.comptAttrs.extendSetting.legend.data[0][
          "name"
        ] = legendName;

      }
      if (['VeLines', 'VeLinesBmap'].includes(type)) {
        // 迁徙图

        this.activedCompt.comptAttrs.extendSetting.series[0].data = scatterData;
        //  重写tooltip
        let columnsName = this.activedCompt.comptData.columns[2];
        this.activedCompt.comptAttrs.extendSetting.tooltip = {
          trigger: 'item',
          formatter:function(params, ticket, callback){
              if(params.seriesType === "lines"){
                  return params.data.fromName+">"+params.data.toName+"<br />"+ columnsName + ":" +params.data.value;
              }else{
                  return params.name;
              }
          }
        }

        //设置迁徙图路线
        let rows = this.activedCompt.comptData.rows || [];
        let columns = this.activedCompt.comptData.columns || [];
        // 显示top，刷新之后恢复默认值50
        this.activedCompt.styleAttrs[1].children[2].value = 50;
        //地图区域颜色等设置默认值
        let styleAttrs = this.activedCompt.styleAttrs;
        this.activedCompt.comptAttrs.extendSetting.geo.label.normal["color"] = styleAttrs[2].children[4].value || "#fff";
        this.activedCompt.comptAttrs.extendSetting.geo.itemStyle.normal["borderColor"] = styleAttrs[2].children[5].value || "rgba(255,255,255,0.6)";
        this.activedCompt.comptAttrs.extendSetting.geo.itemStyle.normal["areaColor"] = styleAttrs[2].children[6].value || "#00366f";

        let legendData = {};
        let legendNames = [];// 图例
        for(let i=0;i<rows.length;i++){
          let fromName = rows[i][columns[0]]; //迁出
          let toName = rows[i][columns[1]];//迁入
          // coords坐标不能为null
          if(!properties[fromName] || !properties[toName]){
            continue;
          }
          let item = {
            fromName : fromName,
            toName : toName,
            coords : [properties[fromName],properties[toName]],
            value : rows[i][columns[2]]
          }
          if(legendData[fromName]){
            legendData[fromName].push(item);
          }else{
            legendNames.push(fromName);
            legendData[fromName] = [item];
          }
        }
        //设置图例
        this.activedCompt.comptAttrs.extendSetting.legend.data = legendNames;
        if (['VeLinesBmap'].includes(type)) {
          this.activedCompt.comptAttrs.extendSetting.series = [];
        }
        for(let key in legendData){
          let lines = {
              name: key,
              type: 'lines',
              coordinateSystem: type === 'VeLines' ? 'geo' : 'bmap',
              zlevel: 1,
              symbol: ['none', 'arrow'],
              symbolSize: 5,
              effect: {
                  show: true,
                  period: styleAttrs[2].children[2].value || 6,
                  trailLength: 0.2,
                  symbol: styleAttrs[2].children[0].value || 'path://M1705.06,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705.06,1318.313z',
                  symbolSize: styleAttrs[2].children[1].value || 15,
                  constantSpeed: 0,
                  loop :true
              },
              lineStyle: {
                  normal: {
                      width: 1,
                      opacity: 0.6,
                      curveness: 0.2,
                      type: styleAttrs[2].children[3].value || 'solid'
                  }
              },
              data: legendData[key],
              animation: false //是否开启动画，默认true，此处要设置成false，不然轨迹会有残影
          }
          this.activedCompt.comptAttrs.extendSetting.series.push(lines);
        }
      } else if (['VeHeatBmap'].includes(type)) {
        this.activedCompt.comptAttrs.extendSetting.series = [];
        // 构造热力图数据
        let rows = this.activedCompt.comptData.rows || [];
        let columns = this.activedCompt.comptData.columns || [];
        let heatData = [];
        rows.forEach(row => {
          let point = [row[columns[0]], row[columns[1]], row[columns[2]]];
          heatData.push(point);
        })
        let heatSeries = {
          'name': columns[2],
          'type': 'heatmap',
          'coordinateSystem': 'bmap',
          'data': heatData,
          'pointSize': 5,
          'blurSize': 6
        }
        this.activeComp.comptAttrs.setting.bmap.center = heatData[0] || [104.114129, 37.550339];
        this.activedCompt.comptAttrs.extendSetting.series.push(heatSeries);
      }
    },
    openAggFunDialog(type) {
      this.activedCompt.comptAttrs.colSetting = this.initColSetting(this.activedCompt.type)
      //type=3--表格 列字段
      let curData =
        type == 1
          ? this.selectedMeasureData
          : type == 2
            ? this.selectedMeasureData2
            : this.selectedDimData.concat(this.selectedMeasureData);
      if (isNaN(type)) {
        curData = this.selectedDataObj[type.replace(/ColTitle/,'Data')]
      }
      if (curData.length == 0) {
        this.openMessageTip("请先拖入度量字段", "warning", true);
        return false;
      }
      let flag = curData.some(item => {
        return item.element_type == 2;
      });

      if (!flag) {
        this.openMessageTip("请先拖入度量字段", "warning", true);
        return false;
      } else {
        let res = [];
        let selectedDataArr = []
        this.elementObj.forEach(obj => {
          selectedDataArr.push(...this.selectedDataObj[obj.key.replace(/ColTitle/,'Data')])
        })
        let yAxisList = [
          ...this.selectedMeasureData,
          ...this.selectedMeasureData2,
          ...this.selectedDimData,
          ...selectedDataArr
        ]
        // let yAxisList = (this.selectedMeasureData || []).concat(
        //   (this.selectedMeasureData2 || []).concat(this.selectedDimData || [])
        // );
        if (
          ['ElDatagrid','CrossTable', 'PivotTable'].includes(this.activedCompt.type)
        ) {
          //表格的聚合函数设置取自colSetting
          let colSetting = this.activedCompt.comptAttrs.colSetting;
          yAxisList.forEach(val => {
            let funType = colSetting[val.element_id] == undefined ? 2 : colSetting[val.element_id].polymerFunType
            if (val.element_type == 2)
              res.push({
                ...objDeepCopy(val),
                ...{
                  id: val.element_id,
                  name: val.label,
                  fun_type: funType
                }
              });
          });
        } else {
          yAxisList.forEach(val => {
            if (val.is_calcul == '2'){
              val.fun_type = 0;
            }
            if (val.element_type == 2)
              res.push({
                id: val.element_id,
                name: val.label,
                fun_type: val.fun_type
              });
          });
        }
        // 去重
        let obj = {}
        let tempRes = res.reduce((cur,next) => {
          if (!obj[next.id]) {
            obj[next.id] = true
            cur.push(next)
          }
          return cur
        },[])
        this.yAxisData = tempRes;
        this.upAggergationFunDialog(true);
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
    conditionSet() {
      this.dialogTableVisible = false;
      let condisetData = this.$refs["condiset"].activedCompt;
      this.setActivedCompt(condisetData);
    },
    calcSettingChange(row) {
      let xAxisData = this.activedCompt.comptAttrs.xAxisData || [];
      for (let index = 0; index < xAxisData.length; index++) {
        const element = xAxisData[index];
        if (
          this.activedCompt.comptAttrs.colSetting[element.element_id] !=
          undefined &&
          row.id == element.element_id
        ) {
          //element.fun_type = row.fun_type;
          this.activedCompt.comptAttrs.colSetting[
            element.element_id
          ].totalFunType = row.fun_type;
        }
      }
    },
    // 保存聚合弹窗设置
    saveAggSetting() {
      for (let index = 0; index < this.yAxisData.length; index++) {
        const element = this.yAxisData[index];
        this.currentSel(element);
      }
    },
    mapRemoteMethod(query) {
      if (query !== "") {
        this.loading = true;
        setTimeout(() => {
          this.loading = false;
          this.mapAreaList = this.tempList.filter(item => {
            return item.label.toLowerCase().indexOf(query.toLowerCase()) > -1;
          });
        }, 200);
      } else {
        this.mapAreaList = objDeepCopy(this.tempList);
      }
    },
    queryMapInfo() {
      let _this = this;
      this.queryMapAreaInfo({})
        .then(val => {
          if (val.status == 200 && val.data.respResult == 1) {
            let dataList = val.data.respData;
            _this.mapAreaObj['0'] = []; _this.mapAreaObj['1'] = []; _this.mapAreaObj['2'] = [];
            dataList.forEach(data => {
              if(data.dimAreaType === '0'){
                _this.mapAreaObj['0'].push({value: data.remarks, label: data.dimAreaName });
              } else if(data.dimAreaType === '1'){
                _this.mapAreaObj['1'].push({value: data.remarks, label: data.dimAreaName });
              } else if(data.dimAreaType === '2'){
                _this.mapAreaObj['2'].push({value: data.remarks, label: data.dimAreaName });
              }
            });
          } else {
            this.$message.error("地域信息获取失败");
          }
          this.mapAreaList = _this.mapAreaObj[this.mapLevel];
          this.tempList = objDeepCopy(_this.mapAreaObj[this.mapLevel]);
        })
        .catch(err => {
          // this.$message.error("地域信息获取异常");
          console.error(err);
        });
    },
    mapLevelChange(val) {
      this.mapAreaList = this.mapAreaObj[val];
      this.mapArea =
        val === '2' ? this.mapAreaList[0].label : (this.mapLevel === '0' ? 'china' : this.mapAreaList[0].value);
      this.activedCompt.comptAttrs.mapLevel = this.mapLevel;
      this.activedCompt.comptAttrs.mapArea = this.mapArea;
    },
    mapAreaChange() {
      this.activedCompt.comptAttrs.mapLevel = this.mapLevel;
      this.activedCompt.comptAttrs.mapArea = this.mapArea;
    },
    // 转置
    transPosition() {
      let selectedDimDataBak = objDeepCopy(this.selectedDimData);
      this.selectedDimData = objDeepCopy(this.selectedMeasureData);
      this.selectedMeasureData = selectedDimDataBak;
      this.clearDrillInfo();
      this.fieldRecord();
    },
    // 清除钻取信息，更新字段选中状态
    clearDrillInfo() {
      let extraDataArr = [];
      // 更新右边字段状态
      for (let index2 = 0; index2 < this.selectedDrillData.length; index2++) {
        // 去掉高亮状态,日期分层级需要新增加两个判断条件（formatLevel、isNewCol）
        extraDataArr.push({
          element_id: this.selectedDrillData[index2].element_id,
          af_id: this.selectedDrillData[index2].af_id,
          formatLevel:this.selectedDrillData[index2].formatLevel,
          isNewCol: this.selectedDrillData[index2].isNewCol
        });
      }
      if (extraDataArr.length > 0) {
        // 如果有设置钻取 要把钻取字段清掉
        this.selectedDrillData = [];
        for (let index = 0; index < extraDataArr.length; index++) {
          this.updateFieldSelState(extraDataArr[index]);
        }
      }
    },
    reSortAxisData(type) {
      const { type: compType } = this.activeComp;
      // 透视表必须要维度在前
      if ((compType === 'CrossTable' && this.polymerizeType == 1)) {
        // 交叉表聚合，放下后要重排一下，度量必须排在维度后面
        this.$nextTick(() => {
          if (type !== 1) {
            this.selectedDimData = this.selectedDimData.sort(function (
              item1,
              item2
            ) {
              return item1.element_type - item2.element_type;
            });
          }
          if (type !== 0) {
            this.selectedMeasureData = this.selectedMeasureData.sort(function (
              item1,
              item2
            ) {
              return item1.element_type - item2.element_type;
            });
          }
        });
      }
    },
    // 交叉表更新数据面板状态
    updateCrossTbState() {
      if (this.activedCompt.type == "CrossTable") {
        if (this.polymerizeType == 2) {
          //明细
          this.curComptDataAuth.isMeasure = false; //展示行
          this.curComptDataAuth.dimTitle = "列";
        } else {
          this.curComptDataAuth.isMeasure = true;
          this.curComptDataAuth.dimTitle = "行";
        }
      }
      if (['CrossTable', 'PivotTable'].includes(this.activedCompt.type)) {
        this.activedCompt.comptAttrs.polymerizeType = this.polymerizeType;
        this.$nextTick(()=>{
          this.$refs.styleAttr.showSubTotalCol(null,null);
        })
      }
    },
    // 初始化列设置 compType--组件类型
    initColSetting(compType) {
      let newColSet = {};
      let oriColSet =
        objDeepCopy(this.activedCompt.comptAttrs.colSetting) || {};
      switch (compType) {
        case "ElSwiper":
          let fieldsData = this.selectedDimData.concat(
            this.selectedMeasureData
          );
          for (let index = 0; index < fieldsData.length; index++) {
            const dataItem = fieldsData[index];
            let fontSize = "",
              color = "";
            if (dataItem.element_id == this.selectedDimData[0].element_id) {
              //第一个维度
              fontSize = "22";
              color = "#606266";
            } else if (
              this.selectedDimData.length > 1 &&
              dataItem.element_id == this.selectedDimData[1].element_id
            ) {
              //第二个维度
              fontSize = "12";
              color = "#666";
            } else if (
              dataItem.element_id == this.selectedMeasureData[0].element_id
            ) {
              //度量字段
              fontSize = "22";
              color = "#21bdff";
            }
            let curColSet = {
              nickName: dataItem.nick_name,
              numType: dataItem.numType || "0",
              dot: dataItem.dot || "0",
              isNumber: dataItem.element_type == 2, //表格数据格式和条件设置 只针对度量 dataItem.col_type == "No."
              polymerFunType: dataItem.is_calcul == '2' ? 0 : 2, //聚合函数类型
              oriName: dataItem.nick_name, //原始名称
              fontSize: fontSize,
              color: color
            };
            let colSet1 = {
              ...curColSet,
              ...(oriColSet[dataItem.element_id] || {})
            };
            newColSet[dataItem.element_id] = colSet1;
          }
          break;
        case "CrossTable":
        case 'PivotTable':
        case "ElDatagrid":
          //备份之前的列设置
          let yAxis1DataCur = this.selectedDimData.concat(
            this.selectedMeasureData
          );
          for (let index = 0; index < yAxis1DataCur.length; index++) {
            const dataItem = yAxis1DataCur[index];
            let curColSet = {
              nick_name: dataItem.nick_name,
              align: dataItem.align,
              numType: dataItem.numType || "",
              dot: dataItem.dot || "",
              totalFunType: dataItem.total_fun_type || "", //合计
              colCondiExp: objDeepCopy(dataItem.col_condi_exp || []),
              setCondi: false,
              isNumber: dataItem.element_type == 2, //表格数据格式和条件设置 只针对度量 dataItem.col_type == "No."
              polymerFunType: dataItem.is_calcul == '2' ? 0 : 2, //聚合函数类型
              oriName: dataItem.nick_name //原始名称
            };
            let colSet1 = {
              ...curColSet,
              ...(oriColSet[dataItem.element_id] || {})
            };
            newColSet[dataItem.element_id] = colSet1;
          }
          // 如果该表格可以钻取 则要把钻取层次的字段设置都加上
          for (let index = 1; index < this.selectedDrillData.length; index++) {
            const element = this.selectedDrillData[index];
            if (newColSet[element.element_id] == undefined) {
              newColSet[element.element_id] = {
                nick_name: element.nick_name,
                align: element.align,
                numType: element.numType || "",
                dot: element.dot || "",
                totalFunType: element.total_fun_type || "", //合计
                colCondiExp: [],
                setCondi: false,
                isNumber: element.element_type == 2, //表格数据格式和条件设置 只针对度量 element.col_type == "No."
                oriName: element.nick_name
              };
            }
          }
          break;
        case "ProgressBar":
          newColSet = this.initProBarColSet();
          break;
        default:
          break;
      }
      return newColSet;
    },
    // 初始化进度条的列设置
    initProBarColSet() {
      // 初始化
      let newColSet = {};
      let oriColSet =
      objDeepCopy(this.activedCompt.comptAttrs.colSetting) || {};
      const measures = this.concatSelFields(true);
      for (let index = 0; index < measures.length; index++) {
        const dataItem = measures[index];
        let curColSet = {
              oriName: dataItem.nick_name,
              nickName: '', // 别名
              barColor: '#409eff', // 进度条背景色
              targetSetMode: 'static', // 目标设置模式
              dynamicElementId: '', // 动态目标度量element_id
              dynamicPolymerizeType: 2, // 目标聚合函数, 默认sum-2
              decimalDigit: "0", // 小数点
              staticTargetVal: '' // 静态目标值
            };
        let colSet1 = {
              ...curColSet,
              ...(oriColSet[dataItem.element_id] || {})
            };
            newColSet[dataItem.element_id] = colSet1;
      }
      return newColSet;
    },
    cleanCrossCount() {
      let style = this.activedCompt.styleAttrs[3].children || [];
      if(style.length>0) {
        style[0].value = false;
        style[1].value = "";
        style[2].value = false;
      }
      this.activedCompt.comptAttrs.extendSetting.subTotal = false;
      this.activedCompt.comptAttrs.extendSetting.totalRow = false;
    },
    fieldRecord(){  //记录拖入字段
      let newData = this.activedCompt;
      newData.afId = this.value; //数据集id赋值
      if(newData.type === 'Query' || newData.type === 'MobileQuery') {
        this.confirmUpdateData();
        return;
      }

      //   filterData赋值
      newData.comptAttrs.filterData = this.filterData.map(item => {
        return {
          af_id: item.af_id,
          element_id: item.element_id,
          numList: objDeepCopy(item.numList),
          m_value:
            typeof item.m_value == "string"
              ? item.m_value
              : objDeepCopy(item.m_value),
          radioCalcu: item.radioCalcu,
          symbol: item.symbol,
          isSetDefault: item.isSetDefault,
          timeOprCount1: item.timeOprCount1,
          timeOpr1: item.timeOpr1,
          timeOprCount2: item.timeOprCount2,
          timeOpr2: item.timeOpr2,
          formatLevel: item.formatLevel,
          isNewCol: item.isNewCol,
          m_label: item.m_label || "",
          treeSelVal: item.treeSelVal || []
        };
      });
      // 指标拆解树
      if (newData.type === 'DesicionTree') {
        newData.comptAttrs.xAxisData = this.selectedDimData.map(item => {
          return {
            ...item
          };
        });
        newData.comptAttrs.yAxis1Data = this.selectedMeasureData.map(item => {
          return {
            ...item
          };
        });
      } else {
        newData.comptAttrs.xAxisData = this.selectedDimData.map(item => {
          return {
            af_id: item.af_id,
            element_id: item.element_id,
            sort: item.sort,
            formatLevel: item.formatLevel,
            isNewCol: item.isNewCol,
            from_compt: item.from_compt
          };
        });
        newData.comptAttrs.yAxis1Data = this.selectedMeasureData.map(item => {
          return {
            af_id: item.af_id,
            element_id: item.element_id,
            fun_type: item.fun_type,
            sort: item.sort,
            nick_name: item.nick_name,
            formatLevel: item.formatLevel,
            isNewCol: item.isNewCol,
            from_compt: item.from_compt
          };
        });
      }
      newData.comptAttrs.yAxis2Data = this.selectedMeasureData2.map(item => {
        return {
          af_id: item.af_id,
          element_id: item.element_id,
          fun_type: item.fun_type,
          sort: item.sort,
          nick_name: item.nick_name,
          formatLevel: item.formatLevel,
          isNewCol: item.isNewCol,
          from_compt: item.from_compt
        };
      });

      newData.comptAttrs.selectedQueryData = this.selectedQueryData;

      //  把维度字段放入 xAxisData, 度量放入 yAxis1Data
      this.elementObj.forEach(obj => {
        let objdim = [];
        let objMea = [];
        const data = this.selectedDataObj[
          obj.key.replace(/ColTitle/, "Data")
        ].map(item => {
          let temp = {
            af_id: item.af_id,
            element_id: item.element_id,
            fun_type: item.fun_type,
            sort: item.sort,
            nick_name: item.nick_name,
            formatLevel: item.formatLevel,
            isNewCol: item.isNewCol,
            isNewSetting: obj.key.replace(/ColTitle/, "")
          };
          if (item.element_type == 1) {
            objdim.push(temp);
          } else {
            objMea.push(temp);
          }
          return temp;
        });
        // 塞isnewsetting,不然来源去向图没有不能区分哪个是来源，哪个是去向
        const attrName1 = obj.key.replace(/ColTitle/, "Data");
        this.selectedDataObj[attrName1].forEach((item2, index2) => {
          this.selectedDataObj[attrName1][index2]['isNewSetting'] = obj.key.replace(/ColTitle/, "");
        });
        let item = this.curComptDataAuth[`${obj.key}`];
        if (item.elementType == 2) {
          newData.comptAttrs.yAxis1Data.push(...data);
        } else if (item.elementType == 1) {
          newData.comptAttrs.xAxisData.push(...data);
        } else if (item.elementType == 0) {
          newData.comptAttrs.xAxisData.push(...objdim);
          newData.comptAttrs.yAxis1Data.push(...objMea);
        }
      });

      // 维度重新排序
      let drillData1 = [];
      drillData1 = this.selectedDrillData.map(item => {
        return {
          af_id: item.af_id,
          element_id: item.element_id,
          sort: item.sort,
          formatLevel: item.formatLevel,
          isNewCol: item.isNewCol
        };
      });
      newData.comptAttrs.drillData = drillData1;

      //地图范围，给地图层级和名称赋值
      if (["VeMap", "VeAreaMap", "VeLines", 'VeBubbleMap'].includes(this.activedCompt.type)) {
        newData.comptAttrs.mapLevel = this.mapLevel;
        newData.comptAttrs.mapArea = this.mapArea;
      }
      if (
        ["CrossTable",'PivotTable'].includes(this.activedCompt.type) ||
        (this.selectedDimData.length > 0 &&
          this.activedCompt.type == "ElDatagrid")
      ) {
        this.activedCompt.comptAttrs.polymerizeType = this.polymerizeType;
        //// 备份之前的列设置
        let newColSet = this.initColSetting(this.activedCompt.type);
        this.activedCompt.comptAttrs.colSetting = newColSet;
      }
    },
    updateProgressBarData() {
      if (this.activedCompt.type !== 'ProgressBar') {
        return;
      }
      // let oriColSet = this.activedCompt.comptAttrs.colSetting;
    }
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
        SELECTWRAP_DOM.addEventListener("scroll", function () {
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
  height: 100%;
  /deep/ .el-tag {
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

  /deep/ .tabcard.el-tabs--border-card > .el-tabs__header {
    height: 40px;
    padding-top: 10px;
    border: none;
    border-bottom: 1px solid #0a2b4c;
  }

  /deep/ .tabcard .el-tabs__content {
    padding: 0;
  }

  /deep/ .tabcard .el-tabs__item {
    height: 31px;
    line-height: 30px;
    padding: 0 15px;
    border: none;
  }

  /deep/ .tabcard .el-tabs__item.is-active {
    border: none;
    border-radius: 2px 2px 0 0;
  }

  /deep/ .el-tabs__nav-wrap {
    height: 40px;
    width: 100%;
  }

  /deep/ .opt-btn {
    cursor: pointer;
    padding-left: 3px;
  }

  /deep/ .el-tabs__nav-scroll {
    // padding-left: 179px;
    padding-right: 15px;
  }

  /deep/ .tabOption .el-tabs__nav-scroll .el-tabs__nav {
    height: 0;
  }

  .nav-title {
    position: absolute;
    height: 40px;
    line-height: 40px;
    padding-left: 10px;
    font-size: 16px;
    z-index: 99;
  }

  /deep/ .el-tabs__header {
    margin: 0;
  }

  /deep/ .el-tabs.el-tabs--top,
  /deep/ .el-row-24 {
    height: 100%;
  }

  /deep/ .el-tabs__content {
    height: calc(100% - 40px);
  }

  /deep/ .el-row-24 .el-col {
    height: 100%;
    padding: 10px 0 10px 10px;
  }

  .r-title,
  .l-title {
    text-align: center;
  }

  /deep/ .el-row-24 .grid-content > div:nth-child(-n + 3) {
    margin-bottom: 10px;
  }

  /deep/ .el-row-24 .grid-content,
  .col-block {
    height: 100%;
  }

  .col-block {
    padding-right: 15px;
  }

  /deep/ .el-row-12 {
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

  /deep/ .col-subtitle .el-checkbox {
    float: right;
  }

  .col-wrap {
    height: calc(100% - 19px);
  }

  .cols-item {
    height: calc(100% - 40px);
  }

  /deep/ .el-scrollbar__wrap {
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
    text-align: right;
    font-size: 12px;
    cursor: pointer;
  }

  /deep/ .up-button {
    bottom: 20px;
    position: absolute;
    width: calc(50% - 35px);
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

  .sort-icon-left {
    left: -10px;
  }

  .sort-icon-right {
    right: -2px;
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

  /deep/ .table-wrap .el-scrollbar__view {
    padding-right: 10px;
  }

  /deep/ .table-wrap .el-scrollbar__view > div > div,
  /deep/ .table-wrap .el-scrollbar__view .col-title {
    margin-bottom: 10px;
  }

  /deep/#big-screen .table-wrap .el-scrollbar__view {
    padding-right: 20px;
  }
  .big-screen{
    padding-right: 0px;
  }
  /deep/.stylattr .text-input .el-input__inner[maxlength] {
    padding-right: 45px;
  }

  /deep/.table-wrap .el-radio__label {
    color: #afc0d0;
  }

  /deep/ .col-subtitle .el-checkbox__label {
    font-size: 12px;
  }

  /deep/ .col-title span {
    font-size: 12px;
    &.el-tooltip {
      font-size: 14px;
    }
  }

  /deep/ .col-span {
    display: inline-block;
    width: calc(100% - 32px);
    text-overflow: ellipsis;
    overflow: hidden;
    &.col-span-1 {
      width: calc(100% - 45px);
    }
  }

  /deep/ .dim-wrap {
    /deep/ .col-span {
      width: calc(100% - 45px);
    }
  }

  /deep/ .col-span > span:first-child {
    padding-right: 5px;
  }

  /deep/ .batch-dialog {
    /deep/ .el-form-item__label {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }

  .query-condi .col-span {
    width: calc(100% - 42px);
  }

  .query-filter .col-span {
    width: calc(100% - 18px);
  }
  // data,style,interaction tab position
  /deep/.el-tabs__nav {
    float: right;
  }
}

.main-content-tool {
  text-align: right;
}

.main-content-tool .tool-btn {
  cursor: pointer;
  margin-left: 20px;
  display: inline-block;
  &:first-child {
    margin-left: 0;
  }
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
  position: relative;
}

.fix-icon {
  margin-right: 3px;
}

.attrSet /deep/ .bg-purple .el-tag.default-tag {
  text-align: center;
}

.icon-A10598_DataOperation {
  margin-right: 4px;
}

/deep/ .el-radio-group .calc-icon {
  font-size: 12px;
  margin-left: -25px;
  margin-right: 23px;
  cursor: pointer;
}

.default-tag {
  margin-bottom: 0;
  padding-right: 3px;
  border: 1px dashed #ffffff;
  color: #afc0d0;
  background-color: #496988;
  border-radius: 4px;
  height: 28px;
  line-height: 26px;
  width: 100%;
  text-align: center;
  font-size: 12px;
}

.default-wrap {
  margin-bottom: 0;
  padding-right: 3px;
  height: 28px;
  width: 100%;
  position: absolute;
}
$font-main2: #afc0d0;
$main-bg: #2f5377; //设计区域背景色
$hight-light-clr1: #45fffd; //高亮颜色
$main-color: #409eff; //主色调
$border-clr2: #0a2b4c;
$border-clr1: #0e3b67; // 输入框边框色
.drill {
  padding-right: 3px;
}

.drill-tag .col-span {
  width: calc(100% - 22px);
}

.triggle {
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
.drill-tag.el-tag {
  width: 100%;
  height: 28px;
  line-height: 26px;
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
.attrSet {
  .drill .el-row .el-col {
    border: none !important;
  }
}

.compute-icon{
  float:right;
  line-height:25px;
  cursor:pointer;
  &:hover{
    color:#66b1ff;
  }
}
</style>
