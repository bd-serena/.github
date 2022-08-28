<template>
  <el-container class="dataset-page" v-loading="loading">
    <el-header class="design-page">
      <div class="head-left">
        <el-input
          class="page-name"
          size="mini"
          :class="{'page-input' : this.toSaveInput}"
          ref="toSaveBtn"
          v-model="dataSetName"
          placeholder="请输入数据集名称"
          @input="inputChange"
        ></el-input>
      </div>

      <div class="head-opt-btn">
        <el-tooltip class="item" effect="dark" content="预览" placement="top-start">
          <i :class="{'icon-A10603_Overview':true}" @click="previewEntity('','designView')"></i>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" v-if="isNeedSave" content="保存" placement="top-start">
          <i :class="{'icon-A10579_Preservation':true}" @click="saveDataSet"></i>
        </el-tooltip>
        <el-tooltip
          class="item"
          effect="dark"
          content="另存"
          placement="top-start"
          v-show="this.dataSetType!=1 "
          v-if="isNeedSaveAs"
        >
          <i :class="{'icon-A10545_PS':true}" @click="saveAsDataSet"></i>
        </el-tooltip>
      </div>
    </el-header>
    <el-container style="height:calc(100% - 50px)">
      <el-aside width="240px" class="dataset-aside" style="overflow:hidden;">
        <DataSetLeft @insertTableToEditor="insertTableToEditor" />
      </el-aside>
      <el-main class="design-main">
        <multipane
          class="dataset-right-wrap horizontal-panes custom-resizer-y"
          layout="horizontal"
          @paneResizeStop="panestop"
          v-show="!isSQLEditorShow"
        >
          <div
            class="pane"
            :style="{ minHeight: '100px',height:'350px', maxHeight:topMaxHeight+'px' }"
            v-show="!isHideTop"
          >
            <el-container class="dataset-right-top">
              <el-header height="22px" style="padding:16px 20px 20px;">
                <MainTitle title="SQL建模" style="height:22px;"></MainTitle>
                <div style="float: right;">
                  <div
                    class="icon-block"
                    @click="executeSql"
                    :class="{'icon-block': true, 'disabled': !sqlEditorData.isActive}"
                  >
                    <i class="icon-A10285-restore tool-btn-icon" />
                    <span class="tool-btn-text">运行</span>
                  </div>
                  <div
                    class="icon-block"
                    @click="formatSql"
                  >
                    <i class="icon-A10654_formatBrush tool-btn-icon" />
                    <span class="tool-btn-text">格式化</span>
                  </div>
                </div>
              </el-header>
              <el-main style="margin:0; padding:20px; height:100%" class="entity-rela-cont">
                <center ref="center" :datas.sync="sqlEditorData" />
              </el-main>
            </el-container>
          </div>
          <multipane-resizer>
            <i
              v-bind:class="[isHideTop ? 'icon-A10644_ShrinkRight' : 'icon-A10645_ShrinkLeft','i-top shrink-icon']"
              @click.prevent="slideAsideTop"
            />
          </multipane-resizer>
          <div class="pane" :style="{ flexGrow: 1, display:'flex' }">
            <div style="width:100%;overflow:hidden;flex-shrink:0;padding:16px 20px 20px;">
              <el-container class="dataset-right-bottom">
                <el-header height="34px" style="padding:0">
                  <MainTitle title="字段设置" style="height:22px;"></MainTitle>
                  <div style="float:right;margin-top:-2px;">
                    <el-input
                      placeholder="请输入字段名称"
                      prefix-icon="el-icon-search"
                      size="mini"
                      v-model="fieldFilterText"
                      style="width:140px"
                      id="auto_col_search"
                    ></el-input>
                  </div>
                </el-header>
                <el-container style="position:relative;overflow:hidden;">
                  <el-aside id="table1" width="50%" style="padding: 0 10px 0 0;">
                    <vxe-table
                      size="mini"
                      ref="table1"
                      :data="table1Data"
                      show-overflow
                      highlight-hover-row
                      height="100%"
                      style="width: 100%;"
                      v-loading="loadingFieldTab"
                      :row-key="true"
                      autotest="table1"
                    >
                      <vxe-table-column title="维度" show-overflow>
                        <template slot-scope="scope">
                          <!-- 字段图标的优先顺序：权限字段>计算字段>维度字段>普通字段 维度没有计算字段-->
                          <i
                            :class="['fir-col-icon '+scope.row.iconClr,scope.row.is_data_priv==1?'icon-A10313_project':(scope.row.dim_id != null && scope.row.dim_id != 'null'&& scope.row.dim_id != ''?'icon-A10514_InternetOfThings':'icon-A10465_Form')]"
                          ></i>
                          <span
                            style="margin-left: 10px"
                            v-if="scope.row.show_type == '2'"
                          >{{ scope.row["col_chs_name"] + (scope.row.dim_id != null && scope.row.dim_id != 'null'&& scope.row.dim_id != ''?'('+scope.row.dim_level_name+')':'') }}</span>
                          <span
                            style="margin-left: 10px"
                            v-else-if="scope.row.show_type == '1'"
                          >{{ scope.row["col_name"] + (scope.row.dim_id != null && scope.row.dim_id != 'null'&& scope.row.dim_id != ''?'('+scope.row.dim_level_name+')':'') }}</span>
                          <span
                            style="margin-left: 10px"
                            v-else
                          >{{ scope.row["element_name"] + (scope.row.dim_id != null && scope.row.dim_id != 'null'&& scope.row.dim_id != ''?'('+scope.row.dim_level_name+')':'') }}</span>
                        </template>
                      </vxe-table-column>
                      <vxe-table-column title="字段类型" show-overflow width="80px">
                        <template slot-scope="scope">
                          <span>{{(scope.row["col_type"]||'').toLocaleUpperCase()}}</span>
                        </template>
                      </vxe-table-column>
                      <vxe-table-column
                        field="source_format"
                        title="源时间格式"
                        show-overflow
                        width="110px"
                      >
                        <template slot-scope="scope">
                          <span>{{scope.row["source_format"]}}</span>
                        </template>
                      </vxe-table-column>
                      <vxe-table-column title="操作" align="center" width="150px">
                        <template slot-scope="scope">
                          <el-tooltip
                            class="item"
                            effect="dark"
                            content="显示/隐藏"
                            placement="top-start"
                          >
                            <i
                              class="dataset-opt-icon"
                              :class="scope.row.is_show == '1'?'icon-A10181_browseCount':'icon-A10493-Invisible'"
                              @click.prevent="hideRow(scope.rowIndex, scope.row, 1)"
                            ></i>
                          </el-tooltip>
                          <el-tooltip class="item" effect="dark" content="切换" placement="top-start">
                            <i
                              class="dataset-opt-icon icon-A10236_change"
                              @click.prevent="moveRow(scope.rowIndex,scope.row,1)"
                            ></i>
                          </el-tooltip>
                          <el-popover
                            placement="bottom"
                            title
                            :ref="'menuPopover1'+scope.rowIndex"
                            trigger="click"
                          >
                            <div ref="menu1" class="tb-contextMenu" x-placement="bottom-start">
                              <ul
                                role="menu"
                                id="cascader-menu-4038"
                                class="el-cascader-menu attr-menu"
                              >
                                <li
                                  tabindex="-1"
                                  role="menuitem"
                                  class="el-cascader-menu__item"
                                  @click.prevent="copyRow(scope.rowIndex,scope.row,1)"
                                >
                                  <el-tooltip
                                    class="item"
                                    effect="dark"
                                    content="复制"
                                    placement="top-start"
                                  >
                                    <span>
                                      <i class="tb-contextMenu-icon icon-A10183_copy"></i>
                                      <span>复制</span>
                                    </span>
                                  </el-tooltip>
                                </li>
                                <li
                                  tabindex="-1"
                                  role="menuitem"
                                  class="el-cascader-menu__item"
                                  @click.prevent="showRowInfo"
                                >
                                  <el-tooltip
                                    class="item"
                                    effect="dark"
                                    content="属性"
                                    placement="top-start"
                                  >
                                    <span>
                                      <i class="tb-contextMenu-icon icon-A10189_edit"></i>
                                      <span>属性</span>
                                    </span>
                                  </el-tooltip>
                                </li>
                                <li
                                  tabindex="-1"
                                  role="menuitem"
                                  class="el-cascader-menu__item"
                                  @click.prevent="delFieldRow(scope.rowIndex,scope.row,1,$event)"
                                >
                                  <el-tooltip
                                    class="item"
                                    effect="dark"
                                    content="删除"
                                    placement="top-start"
                                  >
                                    <span>
                                      <i class="tb-contextMenu-icon icon-A10065_delete"></i>
                                      <span>删除</span>
                                    </span>
                                  </el-tooltip>
                                </li>
                                <li
                                  tabindex="-1"
                                  role="menuitem"
                                  class="el-cascader-menu__item"
                                  @click.prevent="openDimChooseDialog(scope.rowIndex,scope.row)"
                                >
                                  <el-tooltip
                                    class="item"
                                    effect="dark"
                                    content="维层选择"
                                    placement="top-start"
                                  >
                                    <span>
                                      <i class="tb-contextMenu-icon icon-A10655_connection"></i>
                                      <span>维层选择</span>
                                    </span>
                                  </el-tooltip>
                                </li>
                                <li
                                  tabindex="-1"
                                  role="menuitem"
                                  class="el-cascader-menu__item"
                                  @click.prevent="cancelDimBind(scope.rowIndex,scope.row)"
                                  v-show="scope.row.dim_id != null && scope.row.dim_id != 'null'&& scope.row.dim_id != ''"
                                >
                                  <el-tooltip
                                    class="item"
                                    effect="dark"
                                    content="取消绑定"
                                    placement="top-start"
                                  >
                                    <span>
                                      <i class="tb-contextMenu-icon icon-A10622_PreOffline"></i>
                                      <span>取消绑定</span>
                                    </span>
                                  </el-tooltip>
                                </li>
                                <li
                                  tabindex="-1"
                                  role="menuitem"
                                  class="el-cascader-menu__item"
                                  v-if="scope.row['col_type']!='' && scope.row['col_type']!=null && scope.row['col_type'].toLocaleLowerCase()!='date' && (fieldTypeList[scope.row['col_type'].toLocaleLowerCase()]!=null && (fieldTypeList[scope.row['col_type'].toLocaleLowerCase()]['showType']=='1' || fieldTypeList[scope.row.col_type.toLocaleLowerCase()]['showType'] == '2')) && (scope.row.dim_id == null || scope.row.dim_id == '')"
                                  @mouseenter="showDateFormatList(scope.rowIndex,scope.row,1,$event)"
                                  @mouseleave="dateFormatPopVisible = false"
                                >
                                  <el-tooltip
                                    class="item"
                                    effect="dark"
                                    content="源时间格式"
                                    placement="top-start"
                                  >
                                    <span>
                                      <i class="tb-contextMenu-icon icon-A10138_table"></i>
                                      <span>源时间格式</span>
                                      <i class="el-icon-caret-right"></i>
                                    </span>
                                  </el-tooltip>
                                </li>
                                <!-- 源时间格式悬浮窗 dateFormatPopVisible-->
                                <el-popover
                                  v-if="scope.row['col_type']!='' && scope.row['col_type']!=null && scope.row['col_type'].toLocaleLowerCase()!='date' && (fieldTypeList[scope.row['col_type'].toLocaleLowerCase()]!=null && (fieldTypeList[scope.row['col_type'].toLocaleLowerCase()]['showType']=='1' || fieldTypeList[scope.row.col_type.toLocaleLowerCase()]['showType'] == '2')) && (scope.row.dim_id == null || scope.row.dim_id == '')"
                                  :ref="'popoverdate'+scope.rowIndex"
                                  placement="top-start"
                                  trigger="hover"
                                  v-model="dateFormatPopVisible"
                                  popper-class="dateFormat-popover"
                                >
                                  <ul style="line-height: 35px;">
                                    <li
                                      v-for="item in dateFormatList"
                                      :key="item.index"
                                      :label="item.label"
                                      :value="item.index"
                                      @click="saveColDateFormat(scope.rowIndex,scope.row,item,$event)"
                                    >
                                      <i
                                        :style="scope.row['source_format'] != '' && scope.row['source_format'] != null && scope.row['source_format'] == item.label ? '':'visibility:hidden'"
                                        class="icon-A10209_check"
                                        style="width: 4px;margin-right:4px"
                                      ></i>
                                      <span style="white-space: nowrap">{{item.label}}</span>
                                    </li>
                                  </ul>
                                </el-popover>
                                <li
                                  tabindex="-1"
                                  role="menuitem"
                                  class="el-cascader-menu__item"
                                  @mouseenter="showEncryptList(scope.rowIndex,scope.row,1,$event)"
                                  @mouseleave="dimDesensePopVis = false"
                                >
                                  <el-tooltip
                                    class="item"
                                    effect="dark"
                                    content="脱敏设置"
                                    placement="top-start"
                                  >
                                    <span>
                                      <i class="tb-contextMenu-icon icon-A10686_Task-monitoring"></i>
                                      <span>脱敏设置</span>
                                      <i class="el-icon-caret-right"></i>
                                    </span>
                                  </el-tooltip>
                                </li>
                                <el-popover
                                  :ref="'popoverdesense'+scope.rowIndex"
                                  placement="top-start"
                                  trigger="hover"
                                  v-model="dimDesensePopVis"
                                  popper-class="dateFormat-popover"
                                >
                                  <ul style="line-height: 35px;">
                                    <li
                                      v-for="item in encryptList"
                                      :key="item.index"
                                      :label="item.label"
                                      :value="item.index"
                                      @click="saveColEncrypt(scope.rowIndex,scope.row,1,item,$event)"
                                    >
                                      <i
                                        :style="scope.row['encrypt_id'] !== '' && scope.row['encrypt_id'] !== null && scope.row['encrypt_id'] === item.index ? '':'visibility:hidden'"
                                        class="icon-A10209_check"
                                        style="width: 4px;margin-right:4px"
                                      ></i>
                                      <span style="white-space: nowrap">{{item.label}}</span>
                                    </li>
                                  </ul>
                                </el-popover>
                                <!-- @click.prevent="setAuthField(scope.rowIndex,scope.row,1,$event)" -->
                                <li
                                  tabindex="-1"
                                  role="menuitem"
                                  class="el-cascader-menu__item"
                                  v-show="datasetPriv === 1"
                                  @mouseenter="showDataPrivList(scope.rowIndex,scope.row,1,$event)"
                                  @mouseleave="dataPrivPropVis = false"
                                >
                                  <el-tooltip
                                    class="item"
                                    effect="dark"
                                    content="权限标签"
                                    placement="top-start"
                                  >
                                    <span>
                                      <i class="tb-contextMenu-icon icon-A10133_info"></i>
                                      <span>权限标签</span>
                                      <b
                                        v-if="scope.row.is_data_priv==='1' || scope.row.priv_tag"
                                        class="tb-contextMenu-icon el-icon-circle-check check-icon"
                                      ></b>
                                      <i class="el-icon-caret-right"></i>
                                    </span>
                                  </el-tooltip>
                                </li>
                                <el-popover
                                  :ref="'popoverdesense'+scope.rowIndex"
                                  placement="top-start"
                                  trigger="hover"
                                  v-model="dataPrivPropVis"
                                  popper-class="dateFormat-popover"
                                >
                                  <ul style="line-height: 35px;">
                                    <li
                                      v-for="item in privTagList"
                                      :key="item.index"
                                      :label="item.label"
                                      :value="item.index"
                                      :class="['el-cascader-menu__item',privTagSetList.includes(item.index) && scope.row['priv_tag'] !== item.index ? 'item-disabled' : '']"
                                      @click="saveDataPriv(scope.rowIndex,scope.row,1,item,$event)"
                                    >
                                      <i
                                        :style="scope.row['priv_tag'] && scope.row['priv_tag'] === item.index ? '':'visibility:hidden'"
                                        class="icon-A10209_check"
                                        style="width: 4px;margin-right:4px"
                                      ></i>
                                      <span style="white-space: nowrap">{{item.label}}</span>
                                    </li>
                                  </ul>
                                </el-popover>
                              </ul>
                            </div>
                            <span
                              class="dataset-opt-icon"
                              slot="reference"
                              @click.prevent="showMenu(scope.rowIndex,scope.row,1,$event)"
                            >
                              <el-tooltip
                                class="item"
                                effect="dark"
                                content="更多"
                                placement="top-start"
                              >
                                <i class="el-icon-more"></i>
                              </el-tooltip>
                            </span>
                          </el-popover>
                        </template>
                      </vxe-table-column>
                      <!-- <vxe-table-column align="center">
                        <template slot="header" slot-scope="scope">
                          <el-tooltip class="item" effect="dark" content="新增" placement="top-start">
                            <i class="dataset-opt-icon icon-A10072_add"></i>
                          </el-tooltip>
                        </template>
                      </vxe-table-column>-->
                    </vxe-table>
                  </el-aside>
                  <el-main id="table2" style="padding: 0 0 0 10px;width:50%">
                    <vxe-table
                      size="mini"
                      ref="table2"
                      :data="table2Data"
                      height="100%"
                      style="width: 100%"
                      v-loading="loadingFieldTab"
                      :row-key="true"
                      autotest="table2"
                    >
                      <vxe-table-column title="度量" show-overflow>
                        <template slot-scope="scope">
                          <!-- 字段图标的优先顺序：权限字段>计算字段>维度字段>普通字段  度量没有维度字段-->
                          <i
                            :class="['fir-col-icon '+scope.row.iconClr,scope.row.is_data_priv==1?'icon-A10313_project':(scope.row.is_calcul == '0'? 'icon-A10465_Form':(scope.row.is_calcul == '1'?'icon-A10670_InsertFunction':'icon-A10667_Summation' ))]"

                          ></i>
                          <span
                            style="margin-left: 10px"
                            v-if="scope.row.show_type == '2'"
                          >{{ scope.row["col_chs_name"] }}</span>
                          <span
                            style="margin-left: 10px"
                            v-else-if="scope.row.show_type == '1'"
                          >{{ scope.row["col_name"] }}</span>
                          <span style="margin-left: 10px" v-else>{{ scope.row["element_name"] }}</span>
                        </template>
                      </vxe-table-column>
                      <vxe-table-column title="字段类型" width="130px" show-overflow>
                        <template slot-scope="scope">
                          <!-- 计算字段用既定的字段类型 -->
                          <span v-if="scope.row.is_calcul != '0'">{{computedFieldCType[curDsType]}}</span>
                          <span v-else>{{(scope.row["col_type"]||'').toLocaleUpperCase()}}</span>
                        </template>
                      </vxe-table-column>
                      <vxe-table-column title="操作" align="center" width="120px">
                        <template slot-scope="scope">
                          <el-tooltip
                            class="item"
                            effect="dark"
                            content="显示/隐藏"
                            placement="top-start"
                          >
                            <i
                              class="dataset-opt-icon"
                              :class="scope.row.is_show == '1'?'icon-A10181_browseCount':'icon-A10493-Invisible'"
                              @click.prevent="hideRow(scope.rowIndex, scope.row, 2)"
                            ></i>
                          </el-tooltip>
                          <el-tooltip
                            class="item"
                            effect="dark"
                            content="切换"
                            placement="top-start"
                            v-if="scope.row.is_calcul != '0'"
                          >
                            <i class="dataset-opt-icon icon-A10236_change disabled"></i>
                          </el-tooltip>
                          <el-tooltip
                            class="item"
                            effect="dark"
                            content="切换"
                            placement="top-start"
                            v-else
                          >
                            <i
                              class="dataset-opt-icon icon-A10236_change"
                              @click.prevent="moveRow(scope.rowIndex,scope.row,2)"
                            ></i>
                          </el-tooltip>
                          <el-popover
                            placement="bottom"
                            title
                            :ref="'menuPopover2'+scope.rowIndex"
                            trigger="click"
                          >
                            <div ref="menu1" class="tb-contextMenu" x-placement="bottom-start">
                              <ul
                                role="menu"
                                id="cascader-menu-4038"
                                class="el-cascader-menu attr-menu"
                              >
                                <li
                                  tabindex="-1"
                                  role="menuitem"
                                  class="el-cascader-menu__item"
                                  @click.prevent="copyRow(scope.rowIndex,scope.row,2)"
                                >
                                  <el-tooltip
                                    class="item"
                                    effect="dark"
                                    content="复制"
                                    placement="top-start"
                                  >
                                    <span>
                                      <i class="tb-contextMenu-icon icon-A10183_copy"></i>
                                      <span>复制</span>
                                    </span>
                                  </el-tooltip>
                                </li>
                                <li
                                  tabindex="-1"
                                  role="menuitem"
                                  class="el-cascader-menu__item"
                                  v-if="scope.row.is_calcul != '0'"
                                  @click.prevent="editComputedField(scope.rowIndex,scope.row,2)"
                                >
                                  <el-tooltip
                                    class="item"
                                    effect="dark"
                                    content="属性"
                                    placement="top-start"
                                  >
                                    <span>
                                      <i class="tb-contextMenu-icon icon-A10189_edit"></i>
                                      <span>属性</span>
                                    </span>
                                  </el-tooltip>
                                </li>
                                <li
                                  tabindex="-1"
                                  role="menuitem"
                                  class="el-cascader-menu__item"
                                  @click.prevent="showRowInfo"
                                  v-else
                                >
                                  <el-tooltip
                                    class="item"
                                    effect="dark"
                                    content="属性"
                                    placement="top-start"
                                  >
                                    <span>
                                      <i class="tb-contextMenu-icon icon-A10189_edit"></i>
                                      <span>属性</span>
                                    </span>
                                  </el-tooltip>
                                </li>
                                <li
                                  tabindex="-1"
                                  role="menuitem"
                                  class="el-cascader-menu__item"
                                  @click.prevent="delFieldRow(scope.rowIndex,scope.row,2,$event)"
                                >
                                  <el-tooltip
                                    class="item"
                                    effect="dark"
                                    content="删除"
                                    placement="top-start"
                                  >
                                    <span>
                                      <i class="tb-contextMenu-icon icon-A10065_delete"></i>
                                      <span>删除</span>
                                    </span>
                                  </el-tooltip>
                                </li>
                                <li
                                  tabindex="-1"
                                  role="menuitem"
                                  class="el-cascader-menu__item"
                                  @mouseenter="showEncryptList(scope.rowIndex,scope.row,2,$event)"
                                  @mouseleave="measureDesensePopVis = false"
                                >
                                  <el-tooltip
                                    class="item"
                                    effect="dark"
                                    content="脱敏设置"
                                    placement="top-start"
                                  >
                                    <span>
                                      <i class="tb-contextMenu-icon icon-A10686_Task-monitoring"></i>
                                      <span>脱敏设置</span>
                                      <i class="el-icon-caret-right"></i>
                                    </span>
                                  </el-tooltip>
                                </li>
                                <el-popover
                                  :ref="'popoverdesense'+scope.rowIndex"
                                  placement="top-start"
                                  trigger="hover"
                                  v-model="measureDesensePopVis"
                                  popper-class="desense-popover"
                                >
                                  <ul style="line-height: 35px;">
                                    <li
                                      v-for="item in encryptList"
                                      :key="item.index"
                                      :label="item.label"
                                      :value="item.index"
                                      @click="saveColEncrypt(scope.rowIndex,scope.row,2,item,$event)"
                                    >
                                      <i
                                        :style="scope.row['encrypt_id'] !== '' && scope.row['encrypt_id'] !== null && scope.row['encrypt_id'] === item.index ? '':'visibility:hidden'"
                                        class="icon-A10209_check"
                                        style="width: 4px;margin-right:4px"
                                      ></i>
                                      <span style="white-space: nowrap">{{item.label}}</span>
                                    </li>
                                  </ul>
                                </el-popover>
                              </ul>
                            </div>
                            <span
                              class="dataset-opt-icon"
                              slot="reference"
                              @click.prevent="showMenu(scope.rowIndex,scope.row,2,$event)"
                            >
                              <el-tooltip
                                class="item"
                                effect="dark"
                                content="更多"
                                placement="top-start"
                              >
                                <i class="el-icon-more"></i>
                              </el-tooltip>
                            </span>
                          </el-popover>
                        </template>
                      </vxe-table-column>
                    </vxe-table>
                  </el-main>
                </el-container>
              </el-container>
            </div>
          </div>
        </multipane>
      </el-main>
    </el-container>
    <el-dialog
      size="mini"
      title="属性"
      :visible.sync="fieldAttrDialogVisible"
      :close-on-click-modal="false"
      width="400px"
    >
      <el-container class="attr-dialog-wrap">
        <el-aside width="105px" class="radio-aside-wrap">
          <el-radio v-model="fieldAttrRadio" label="0">别名</el-radio>
          <el-radio v-model="fieldAttrRadio" label="1" @change="chooseAttrRadio('1')">物理字段名</el-radio>
          <!-- 如果描述为空，直接不能点 -->
          <el-radio
            v-model="fieldAttrRadio"
            label="2"
            @change="chooseAttrRadio('2')"
            :disabled="(fieldAttrForm.description || '').trim() ===''"
          >描述</el-radio>
        </el-aside>
        <el-main style="padding:0;">
          <el-form
            :model="fieldAttrForm"
            size="mini"
            ref="fieldAttrForm"
            :rules="fieldAttrFormRules"
          >
            <el-form-item prop="alias">
              <el-input
                v-model="fieldAttrForm.alias"
                placeholder="请输入别名"
                @focus="fieldAttrRadio='0'"
              ></el-input>
            </el-form-item>
            <el-form-item>
              <el-input
                v-model="fieldAttrForm.physiName"
                :readonly="true"
                :disabled="true"
                @click.native="chooseNotAlias('1')"
              ></el-input>
            </el-form-item>
            <el-form-item>
              <el-input
                v-model="fieldAttrForm.description"
                :readonly="true"
                :disabled="true"
                @click.native="chooseNotAlias('2')"
              ></el-input>
            </el-form-item>
          </el-form>
        </el-main>
      </el-container>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="fieldAttrCancel">取 消</el-button>
        <el-button size="mini" type="primary" @click="fieldAttrConfirm">保 存</el-button>
      </span>
    </el-dialog>
    <!-- 左侧实体预览 -->
    <el-dialog
      class="entity-dialog"
      title="预览"
      style="height:100%"
      :visible.sync="entityDialogVisible"
      :close-on-click-modal="false"
      size="mini"
      width="80%"
      @close="closePreviewDialog"
      id="auto_pre_close"
    >
      <div v-show="entityColsData.tableAttr.data.length > 0" style="height:22px">{{viewTip}}</div>
      <div id="dsetPreivewTbWrap">
        <el-table
          border
          size="mini"
          ref="table"
          height="100%"
          max-height="calc(80vh - 134px)"
          v-bind="entityColsData.tableAttr"
          :key="Math.random()"
          v-loading="prevLoading"
        >
          <el-table-column
            v-for="col in entityColsData.columns"
            :key="col.prop+Math.random()"
            :label="col.label"
            v-bind="col"
            :show-overflow-tooltip="true"
            :min-width="(col.label.replace(/[^\x00-\xff]/g, '01')).length / 1.5*16+40"
            class-name="table-head"
          ></el-table-column>
        </el-table>
      </div>
    </el-dialog>
    <!-- 即席查询中的新增数据集，保存时需指定目录 -->
    <el-dialog width="420px" :visible.sync="dialogSaveAs">
      <div slot="title" class="dialog-title">
        <span>{{this.dataSetType==1?'选择目录':'另存为'}}</span>
        <div class="title-line"></div>
      </div>
      <el-form ref="saveForm" :rules="rules" :model="saveForm">
        <el-form-item
          prop="pageName"
          label="名称"
          :label-width="'51px'"
          style="margin-bottom:14px;margin-top:-6px;"
        >
          <el-input
            size="mini"
            v-model="saveForm.pageName"
            @input="inputChange({type:'savaAs'})"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item
          style="margin-bottom: 0;"
          size="mini"
          prop="catalogId"
          class="win-item"
          label="目录"
          :label-width="'51px'"
        >
          <el-cascader
            :change-on-select="true"
            expand-trigger="hover"
            :show-all-levels="false"
            style="width:100%"
            :options="cataTreeData"
            v-model="saveForm.catalogId"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogSaveAs=false" size="mini">取 消</el-button>
        <el-button type="primary" @click="saveAsSubmit('saveForm')" size="mini">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 维度选择弹框 -->
    <el-dialog
      class="entity-dialog"
      title="维层选择"
      style="height:100%"
      :visible.sync="dimDialogVisible"
      :close-on-click-modal="false"
      size="mini"
      width="80%"
      id="auto_dim_dialog"
    >
      <div class="main-content-form">
        <el-form ref="form" :inline="true" :model="searchForm" class="demo-form-inline" size="mini">
          <el-form-item label="维度名称">
            <el-input size="mini" style="width:230px" v-model="myDimName" placeholder="请输入内容"></el-input>
          </el-form-item>
          <el-form-item label="维层名称">
            <el-input
              size="mini"
              style="width:230px"
              v-model="searchForm.pageName"
              placeholder="请输入内容"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button @click="executeDimLevelQry" type="primary" size="mini">查询</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="main-content-table">
        <!-- <GeminiScrollbar class="my-scroll-bar"> -->
        <el-table
          border
          size="mini"
          ref="dimTable"
          height="100%"
          max-height="calc(80vh - 198px)"
          :data="dimData"
          :key="Math.random()"
          v-loading="dimLoading"
          @row-dblclick="getDimInfo($event)"
          highlight-current-row
          row-key="dim_level_id"
        >
          <el-table-column prop="dim_name" label="维度名称"></el-table-column>
          <el-table-column prop="dim_level_name" label="维层名称"></el-table-column>
          <el-table-column prop="dim_level_info" label="描述信息"></el-table-column>
          <el-table-column prop="user_name" label="创建人"></el-table-column>
          <el-table-column prop="create_time" label="创建时间"></el-table-column>
        </el-table>
        <!-- </GeminiScrollbar> -->
      </div>
      <div class="table-page">
        <el-pagination
          :current-page="pageQuery.start"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="10"
          layout="total, sizes, prev, pager, next, jumper"
          :total="dimTotal"
          @size-change="sizeChange"
          @current-change="pageChange"
        ></el-pagination>
      </div>
    </el-dialog>
    <!-- 拓扑图关联设置浮窗 -->
    <el-popover
      placement="bottom"
      title
      ref="connConfigPoper"
      trigger="manual"
      width="300px"
      popper-class="conn-pop-wrap"
      v-model="connPopVisible"
    >
      <el-container class="conn-pop-container">
        <el-header height="85px">
          <el-row :gutter="20" style="height:100%;" class="conn-pop-top-wrap">
            <el-col :span="8">
              <div
                class="grid-content"
                :class="{'selected':activeConn=='1'}"
                @click="updateActiveConn('1')"
              >
                <span class="conn-pop-conn-icon opt inner-connect">
                  <i class="active"></i>
                  <i class="active"></i>
                </span>
                <span class="conn-pop-conn-icon opt inner-join-icon"></span>
                <div>内连接</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div
                class="grid-content"
                :class="{'selected':activeConn=='2'}"
                @click="updateActiveConn('2')"
              >
                <span class="conn-pop-conn-icon opt">
                  <i class="active"></i>
                  <i></i>
                </span>
                <div>左连接</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div
                class="grid-content"
                :class="{'selected':activeConn=='3'}"
                @click="updateActiveConn('3')"
              >
                <span class="conn-pop-conn-icon opt">
                  <i></i>
                  <i class="active"></i>
                </span>
                <div>右连接</div>
              </div>
            </el-col>
          </el-row>
        </el-header>
        <el-main>
          <div class="tb-tit-wrap">
            <div>
              <span :class="'tb-tit-icon icon-A10465_Form '+curSelConnInfo.parent.color||''"></span>
              <span
                class="tb-tit-txt"
                :title="curSelConnInfo.parent.phy_tab_name || ''"
              >{{curSelConnInfo.parent.phy_tab_name || ''}}</span>
            </div>
            <div>
              <span :class="'tb-tit-icon icon-A10465_Form '+curSelConnInfo.child.color||''"></span>
              <span
                class="tb-tit-txt"
                :title="curSelConnInfo.child.phy_tab_name|| ''"
              >{{curSelConnInfo.child.phy_tab_name|| ''}}</span>
            </div>
          </div>
          <div class="conn-pop-bottom-wrap">
            <el-scrollbar style="height:100%;" ref="conlListScroll">
              <ul>
                <li v-for="(selItem,index) in joinExpList" class="sel-item-wrap">
                  <el-select v-model="selItem.rel_col_id" placeholder="请选择" size="mini">
                    <el-option
                      v-for="item in connLeftSelOption"
                      :label="item.is_calcul == '0'?(item.col_chs_name || item.col_name):item.element_name"
                      :key="item.is_calcul == '0'?(item.col_chs_name || item.col_name):item.element_name"
                      :value="item.is_calcul == '0'?item.col_id:item.col_fun_exp"
                    ></el-option>
                  </el-select>
                  <div class="sel-item-opt-wrap">=</div>
                  <el-select v-model="selItem.col_id" placeholder="请选择" size="mini">
                    <el-option
                      v-for="item in connRightSelOption"
                      :label="item.is_calcul == '0'?(item.col_chs_name || item.col_name):item.element_name"
                      :key="item.is_calcul == '0'?(item.col_chs_name || item.col_name):item.element_name"
                      :value="item.is_calcul == '0'?item.col_id:item.col_fun_exp"
                    ></el-option>
                  </el-select>
                  <div class="sel-item-opt-wrap del-wrap">
                    <span class="icon-A10065_delete" @click="deleteSingleJoinSet(index)"></span>
                  </div>
                </li>
              </ul>
            </el-scrollbar>
          </div>
          <div class="conn-pop-btn-wrap">
            <el-button type="primary" plain size="mini" @click="addConnRow">添加</el-button>
            <el-button type="primary" plain size="mini" @click="clearConnSet">清空</el-button>
            <el-button type="primary" plain size="mini" @click="saveConnSet">保存</el-button>
          </div>
        </el-main>
      </el-container>
      <span
        slot="reference"
        style="position:fixed;z-index:-1;height:6px;width:6px;"
        id="relationSet"
      ></span>
    </el-popover>
    <el-dialog
      title="模型筛选器"
      :visible.sync="datasetfilterDialogVisible"
      width="620px"
      height="100%"
      class="datafilter-dialog"
      size="mini"
      :close-on-click-modal="false"
    >
      <DatasetFilter
        ref="datasetFilter"
        v-if="datasetfilterDialogVisible"
        :fieldList="datasetFieldList"
        :ruleList="rule_group_list"
        :fieldTypeList="fieldTypeList"
      ></DatasetFilter>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="datasetfilterDialogVisible=false">取 消</el-button>
        <el-button type="primary" @click="datasetFilter" size="mini">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="时间格式设置"
      :visible.sync="timeFormatDialog"
      :close-on-click-modal="false"
      size="mini"
      width="400px"
    >
      <el-container style="width:360px;height:74px;" class="date-config-wrap">
        <el-aside width="86px">
          <el-radio v-model="dateRadio" label="0">默认</el-radio>
          <el-radio v-model="dateRadio" label="1">日期型</el-radio>
          <!-- <el-radio v-model="fieldAttrRadio" label="2">时间型：</el-radio>-->
        </el-aside>
        <el-main style="padding: 0 0 0 20px;border-left: 1px dashed #dcdfe6;overflow:hidden;">
          <div v-if="dateRadio=='0'">使用默认字段格式</div>
          <div v-else>
            <el-form
              :model="dateConfigForm"
              size="mini"
              ref="dateConfigForm"
              :rules="dateConfigFormRules"
              label-width="96px"
            >
              <el-form-item label="源数据格式" prop="sourceFormat">
                <el-select v-model="dateConfigForm.sourceFormat" placeholder="请选择源数据格式">
                  <el-option
                    v-for="item in sourceFormatOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="显示数据格式">
                <!-- <el-select v-model="dateConfigForm.targetFormat">
                  <el-option label="同源数据格式" value="-1"></el-option>
                </el-select>-->
                <div v-if="dateConfigForm.targetFormat==='-1'">同源数据格式</div>
              </el-form-item>
            </el-form>
          </div>
        </el-main>
      </el-container>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancelTimeFormat">取 消</el-button>
        <el-button size="mini" type="primary" @click="setTimeFormat">确 认</el-button>
      </span>
    </el-dialog>
    <AddDataSource></AddDataSource>
  </el-container>
</template>

<script>
var curTableItem = {
  // index:-1,
  // row:{}
  // type:
};
const debounce = (function() {
  let timer = 0;
  return function(func, delay) {
    clearTimeout(timer);
    timer = setTimeout(func, delay);
  };
})();

const COLOR_ARRAY = [
  "clr0",
  "clr1",
  "clr2",
  "clr3",
  "clr4",
  "clr5",
  "clr6",
  "clr7"
];
import draggable from "vuedraggable";
import MainTitle from "../components/tools/MainTitle";
import { Multipane, MultipaneResizer } from "vue-multipane";
import { mapActions, mapMutations, mapState } from "vuex";
import eventBus from "../plugins/transData.js";
import Sortable from "sortablejs";
import DatasetFilter from "../components/design/DatasetFilter.vue";
import ComputedField from "../components/design/ComputedField.vue";
import { objDeepCopy, objClone, fieldMatch, mapDataSetInfoKey} from "../utils/comonFunc.js";
import AddDataSource from "../components/design/AddDataSource.vue";
import { service } from 'ngbd-utils';
import DataSetLeft from "../components/design/datasetDesign/DataSetLeft";
import { center } from "vue-nl-interaction-sql";
import "../../node_modules/vue-nl-interaction-sql/dist/interaction-sql.css";

export default {
  components: {
    MainTitle,
    draggable,
    Multipane,
    MultipaneResizer,
    DatasetFilter,
    ComputedField,
    AddDataSource,
    DataSetLeft,
    center
  },
  data() {
    var catalogCheck = (rule, value, callback) => {
      if (value.length == 0) {
        callback(new Error("请选择目录"));
      } else {
        callback();
      }
    };
    return {
      sqlEditorData: {
        isComplete: false, //是否为完整版 true完整 false只有编辑框
        isStopClicked: false, //停止按钮 false置灰 true激活
        isActive: true, //执行按钮 false置灰 true激活
        isChanged: false, //保存按钮 false置灰 true激活
        editAble: true, //编辑器是否可编辑
        isShowRight: false, //是否展示函数框
        limits: 1, //校验SQL语句数量限制，负数表示不限制，默认为5
        // dbType: 'hive',
        // user_id: '9990035',
        // sqlToolPath: 'http://10.1.8.6:23000/edc-plsqltool-ms-ora/v1/',
        // sqlToolAPI: 'querydata/',
        sqlstring: `select
  bodyO2.O0 as NKO0,
  sum(bodyO2.O1) as NKO1
from
  (
    select
      t1.XB as O0,
      t1.ZHIBIAO as O1
    from
      vistool_mode.TB_RESOUR_TOP t1
  ) bodyO2
group by
  bodyO2.O0`
        // sysId: '',
        // componentService: 'REG_QUERYTABLELIST_UDAP',
        // curLinkInfo: {
        //     dbResourceBeans: {
        //         resource_id: "C4FCC9055EFDC7E455851290BEB211E7",
        //         dbConnectionBeans: {
        //             conn_name: "hive_节点",
        //             conn_name_en: "udap_hive_dev"
        //         },
        //         resource_name: "Hive_连接管理",
        //         resource_type: "hive"
        //     },
        //     tenant_id: "T100000041",
        //     tenant_name: "新大陆"
        // },
        // isTestSubColumns: "1" // "1"：是，"0"：否
      },
      viewTip:'',
      realTabChsName:[],
      loading: false,
      className: "",
      isShowDiv: true,
      toSaveInput: false,
      schemaTip: "请选择",
      resourceName: "",
      dataSetName: "",
      dataResourceName: "大数据业务信息库",
      dataResourceNameBak: "大数据业务信息库",
      filterText: "",
      index: 0,
      activeNum: 0,
      slideVisiable: true,
      entityData: [],
      cur_condiData: Object.freeze([]),
      cur_condiDataBak: Object.freeze([]), //当前所有未过滤的表集合
      entityPageSize: 50, //左侧表分页条数
      entityCurPage: 1, //左侧表分页当前页
      isHideTop: false,
      bodyHeight: document.body.clientHeight,
      popVisible: false,
      pop3Visible: false,
      pgDataName:"",//pg数据名称
      connId: "",
      table1Data: Object.freeze([]),
      table2Data: Object.freeze([]),
      table1DataOri: [],
      table2DataOri: [],
      dataSource: [
        {
          label: "数据资产",
          children: [
            {
              label: "Hive"
            },
            {
              label: "Oracle"
            }
          ]
        },
        {
          label: "API服务"
        },
        {
          label: "本地文件",
          children: [
            {
              label: "EXCEL"
            },
            {
              label: "CSV"
            },
            {
              label: "TXT"
            }
          ]
        }
      ],
      popForm: {
        db_name: "大数据业务信息库", //数据库名称
        db_version: "", //数据库版本
        srcType: "Oracle", //数据源类型
        ip_address: "", //ip地址
        port: "", //ip端口
        user_name: "" //用户名
      },
      datasetPopFormItem:[
        {
          label: '数据库名称',
          class: 'd-popover-name',
          value: 'db_name'
        },
        {
          label: '数据源类型',
          class: '',
          value: 'srcType'
        },
        {
          label: '数据库版本',
          class: '',
          value: 'db_version'
        },
        {
          label: '数据库地址',
          class: '',
          value: 'ip_address'
        },
        {
          label: '端口',
          class: '',
          value: 'port'
        },
        {
          label: '用户名',
          class: '',
          value: 'user_name'
        },
      ],
      popFormItem:[],
      timeOptions: Object.freeze([
        {
          value: "",
          label: "默认"
        },
        {
          value: "YYYY-MM",
          label: "YYYY-MM"
        },
        /*{
          value: "YYYY/MM",
          label: "YYYY/MM"
        },*/
        {
          value: "YYYY-MM-DD",
          label: "YYYY-MM-DD"
        }
        /*{
          value: "YYYY/MM/DD",
          label: "YYYY/MM/DD"
        },
        {
          value: "YYYY-MM-DD hh:mm:ss",
          label: "YYYY-MM-DD hh:mm:ss"
        },
        {
          value: "YYYY/MM/DD hh:mm:ss",
          label: "YYYY/MM/DD hh:mm:ss"
        }*/
      ]),
      showContext: false,
      fieldFilterText: "",
      contextMenuVal: {
        isHide: false,
        timeVal: "YYYY-MM-DD"
      },
      // 字段描述弹窗
      fieldAttrDialogVisible: false,
      fieldAttrRadio: 2,
      fieldAttrForm: {
        alias: "",
        physiName: "brand_id",
        description: "品牌"
      },
      entityDialogVisible: false,
      countId: 0,
      fieldAttrFormRules: {
        alias: [{ validator: this.checkAlias, trigger: "blur" }]
      },
      frameId: "F00000000002",
      curAfId: "",
      curSubjectId: "",
      dateFormatFilter: ["number", "decimal"], // 允许进行日期格式化的字段类型  "date",
      loadingFieldTab: false,
      dialogSaveAs: false,
      saveForm: {
        pageName: "",
        catalogId: []
      },
      rules: {
        catalogId: [
          { required: true, validator: catalogCheck, trigger: "change" }
        ],
        pageName: [
          { required: true, message: "请输入名称", trigger: "blur" },
          { min: 1, max: 30, message: "长度在 1 到 30 个字符", trigger: "blur" }
        ]
      },
      cataTreeData: Object.freeze([]),
      topoAreaMinH: 60,
      deleteDialog: false,
      delText: "",
      toDelItem: null,
      isFirstWrap: false,
      mainTabId: "", //主表id
      parentTabInfo: {},
      // allFieldsMap: Object.freeze(new Map()),
      prevLoading: false,
      tabAliasCounter: 0, // 实体拓扑图实体别名计数器
      loadingTabList: false,
      ConnPopVisible: false,
      dimDialogVisible: false, //维度选择
      dimLoading: false, //维度选择
      dimDesensePopVis:false,//维度脱敏设置弹出框
      measureDesensePopVis:false,//度量脱敏设置弹出框
      dimData: [],
      pageQuery: {
        start: 1,
        pageCount: 10
      },
      dimTotal: 0,
      searchForm: {
        pageName: "",
        status: "",
        updateTime: ""
      },
      /**
       * 用来代表维度名称
       */
      myDimName: "",
      getRowKeys(row) {
        //用于行拖拽
        return (
          row.tab_alias +
          "_" +
          row.col_chs_name +
          "_" +
          row.is_copy +
          "_" +
          row.element_name +
          "_" +
          row.col_name +
          "-" +
          row.col_id
        );
      },
      // 时间格式设置
      dateRadio: "0",
      dateConfigForm: {
        sourceFormat: "",
        targetFormat: "-1"
      },
      sourceFormatOptions: Object.freeze([
        {
          value: "YYYYMMDDHHMISS",
          label: "YYYYMMDDHHMISS"
        },
        {
          value: "YYYYMMDD",
          label: "YYYYMMDD"
        },
        {
          value: "YYYYMM",
          label: "YYYYMM"
        },
        {
          value: "YYYY",
          label: "YYYY"
        }
      ]),
      dateConfigFormRules: {
        sourceFormat: [
          { required: true, message: "请选择源数据格式", trigger: "change" }
        ]
      },
      timeFormatDialog: false,
      computedDialogVis: false,
      datasetfilterDialogVisible: false,
      rule_group_list: [],
      editField: {},
      editFieldIdx: -1,
      dataSrcValue: "", //数据源下拉框值
      dataSrcFilterText: "", //数据源下拉框搜索条件
      allDataSrc: [], //数据源下拉数据
      allDataSrcCopy: [], //数据源下拉数据备份
      isDatasetQuery: false, //如果是数据集编辑状态，标识是否已请求过数据集信息
      fieldTypeList: {}, //数据库字段类型
      computedFieldCType: {
        //不同数据库类型 保存的计算字段类型
        oracle: "NUMBER",
        gbase: "DECIMAL",
        hive: "DECIMAL",
        mysql: "DECIMAL"
      },
      entitysTotal: 0, //资产 实体列表总条数
      entityScrollFlag: true, //资产 实体列表滚动加载请求flag (用于节流处理，不然滚动多次会触发多次请求)
      dateFormatList: [], //源时间格式列表
      encryptList: [], //加密策略类型列表
      cpFieldDelTip: "该字段已参与实体关系拓扑设置，请先取消，再删除！", //已参与关联的计算字段提示
      cpFieldInfo: {}, //复制计算字段的相关信息
      schemaList: [], //数据库实例名列表
      schemaListall: [], //每次查询备份数据
      schemaValue: "", //数据库模式下拉数据
      schemaConnIdMap: {}, //connid与schema映射数据
      datasetPriv: 1,
      isSQLEditorShow: false, // 是否展示sql编辑器
      dataPrivPropVis: false,//权限标签设置悬浮框
      privTagList: [],//用户归属企业下的所有权限标签列表
      privTagSetList: [] //当前数据集所有字段已设置标签权限集合
    };
  },
  methods: {
    scrollFixed(bool,name){
      if(bool){ //数据源和跨库资源下拉框出现的时候调整scrolltop大小，让选的值不会被遮挡
        setTimeout(() => {
          let dom = document.querySelector("."+name).parentElement.parentElement;
          let topVal = dom.scrollTop;
          if(topVal>0){
            topVal += 30;
            dom.scrollTo(0,topVal);
          }
        }, 0);
      }
    },
    inputChange(val) {
      let inputVal = this.dataSetName;
      if (inputVal.length > 30) {
        let str = inputVal.slice(0, 30);
        this.dataSetName = str;
        this.$message.warning("名称长度不能超过30字符!");
        return false;
      }
      if (val.type == "savaAs") {
        let inputVal = this.saveForm.pageName;
        if (inputVal.length > 30) {
          let str = inputVal.slice(0, 30);
          this.saveForm.pageName = str;
          this.$message.warning("名称长度不能超过30字符!");
          return false;
        }
      }
    },
    confirmChange(schema,row, operate) {
      // this.$refs.singleTable.setCurrentRow(this.$refs.singleTable.store.states.selection);
      if(this.filterText!==''){ //切换用户模式清空搜索关键字
        this.filterText = '';
        return;
      }
      if(operate === 'noclean'){
        if(row.dsType === 'postgresql' || row.dsType === 'greenplum' || row.dsType === 'sqlserver' || row.dsType === 'vertica'){ //pg，gp库
            this.getEntityList("", row , schema);
        }else{
            this.getEntityList("", row , "");
        }

        return;
      }

      this.connId = this.connIdBak;
      this.dataResourceName = this.dataResourceNameBak;

      //重置数据源信息
      this.setPopFormData();

      this.fieldFilterText = "";
      this.filterText = "";
      // this.getEntityList("", row);
      this.queryCatalog();
      this.entityData = [];
      this.table1DataOri = [];
      this.table2DataOri = [];
      this.table1Data = Object.freeze([]);
      this.table2Data = Object.freeze([]);
      this.updateTopoTabActive("");
      this.rule_group_list.splice(0, this.rule_group_list.length);
      if (typeof this.allFieldsMap.clear != "function") {
        this.allFieldsMap = new Map();
      }
      this.allFieldsMap.clear();
    },
    slideAsideTop() {
      this.isHideTop = !this.isHideTop;
    },
    resetBodyHeight() {
      this.bodyHeight = document.body.clientHeight;
    },
    hideRow(index, row, type) {
      var idx = -1;
      if (this.fieldFilterText.trim() == "") idx = index;
      else if (type == 1) {
        idx = this.table1DataOri.indexOf(row);
      } else {
        idx = this.table2DataOri.indexOf(row);
      }
      switch (type) {
        case 1: //左边
          row.is_show = row.is_show == "1" ? "0" : "1";
          this.$set(this.table1DataOri, idx, row);
          this.updatefieldTab(1);
          break;
        case 2: //右边
          row.is_show = row.is_show == "1" ? "0" : "1";
          this.$set(this.table2DataOri, idx, row);
          this.updatefieldTab(2);
          break;
        default:
          break;
      }
    },
    moveRow(index, row, type) {
      var idx = -1;
      if (this.fieldFilterText.trim() == "") idx = index;
      else if (type == 1) {
        idx = this.table1DataOri.indexOf(row);
      } else {
        idx = this.table2DataOri.indexOf(row);
      }
      switch (type) {
        case 1: //从左边移  当如果搜索文本不为空，则不能用传进来的index去判断
          this.table1DataOri.splice(idx, 1);
          row.element_type = 2;
          this.table2DataOri.push(row);
          if (row.priv_tag) {
            //如果当前字段设置了标签权限，移动到度量，需要从已选中的标签权限列表中删除
            this.privTagSetList.pop(row.priv_tag);
            row.priv_tag = ''; //清空该字段已设置的权限标签
          }
          break;
        case 2: //从右边
          this.table2DataOri.splice(idx, 1);
          row.element_type = 1;
          this.table1DataOri.push(row);
          break;
        default:
          break;
      }
      this.updatefieldTab(1);
      this.updatefieldTab(2);
    },
    copyRow(index, row, type) {
      var idx = -1;
      if (this.fieldFilterText.trim() == "") idx = index;
      else if (type == 1) {
        idx = this.table1DataOri.indexOf(row);
      } else {
        idx = this.table2DataOri.indexOf(row);
      }
      idx += 1;
      let newRow = objDeepCopy(row);
      newRow.is_data_priv = 0; //权限字段设为0
      newRow.priv_tag = ''; //权限标签设置为空
      newRow.show_type = "0";
      let name = this.generateName(row[this.SHOW_TYPE_ARR[row.show_type]]);
      newRow.element_name = name;
      newRow.is_copy = "1";
      newRow.element_id = "";
      if (row.is_calcul != "0") {
        //如果复制计算字段，则弹开计算字段弹窗，修改，如果点确定，则复制成功，点取消，就算没复制成功
        this.hideMenu();
        this.cpFieldInfo = {
          idx,
          newRow
        };
        this.editFieldIdx = -1;
        this.editField = {};
        this.computedDialogVis = true;
        this.$nextTick(() => {
          let computedFieldRef = this.$refs.computedField;
          computedFieldRef.content = newRow.col_fun_exp_desc;
          computedFieldRef.ruleForm.name = newRow.element_name;
        });
        return;
      }
      switch (type) {
        case 1: //左边
          this.table1DataOri.splice(idx, 0, newRow);
          this.updatefieldTab(1);
          break;
        case 2: //右边
          this.table2DataOri.splice(idx, 0, newRow);
          this.updatefieldTab(2);
          break;
        default:
          break;
      }
      this.hideMenu();
    },
    showMenu(index, row, type, event) {
      this.contextMenuVal = {
        isHide: row.is_show == "1" ? false : true,
        timeVal: row.show_format
      };
      curTableItem = {
        index: index,
        row: objDeepCopy(row),
        type: type
      };
      this.showContext = true;
    },
    hideMenu() {
      this.showContext = false;
      document.querySelector("#app").click();
      // curTableItem = {};
    },
    windowClickHandle() {
      if (this.showContext) {
        this.showContext = false;
      }
      if (this.connPopVisible) {
        this.connPopVisible = false;
      }
      // e.stopPropagation();
    },
    showRowInfo() {
      if(curTableItem.row.show_type!=="0"){
         this.fieldAttrForm = {
          alias: "",
          physiName: curTableItem.row.col_name,
          description: curTableItem.row.col_chs_name
        };
      }else{
        this.fieldAttrForm = {
          alias: curTableItem.row.element_name,
          physiName: curTableItem.row.col_name,
          description: curTableItem.row.col_chs_name
        };
      }
      this.fieldAttrRadio = curTableItem.row.show_type;
      this.hideMenu();
      this.fieldAttrDialogVisible = true;
    },
    // 删除表
    deleteItem(objInfo) {
      let _this = this;
      this.toDelItem = objInfo;
      this.delText = "确定把实体移出拓扑图吗";
      if (objInfo.item.tab_rel_list.length != 0) {
        this.delText = "确定把该实体和关联实体移出拓扑图吗";
      }
      this.deleteDialog = true;
      this.$confirm(this.delText, "提示", {
        closeOnClickModal: false,
        confirmButtonText: "确 定",
        cancelButtonText: "取 消"
      })
        .then(() => {
          this.deleteTopoItem();
           var deltabChsTab = objInfo.item.tab_chs_name; //要移除的物理名
            for(var i=0;i<=_this.realTabChsName.length;i++){
                if(_this.realTabChsName[i] == deltabChsTab){
                    _this.realTabChsName.splice(i,1);
                    break;
                }
            }
        })
        .catch(err => {
          console.error(err);
          this.$message({
            type: "info",
            message: "已取消"
          });
          this.deleteDialog = false;
        });
    },
    classifyFields(data) {
      this.table1DataOri = [];
      this.table2DataOri = [];
      this.table1DataOri = data.filter(item => {
        return item.element_type == 1;
      });
      this.table2DataOri = data.filter(item => {
        return item.element_type == 2;
      });
      this.updatefieldTab(1);
      this.updatefieldTab(2);
      this.loadingFieldTab = false;
    },
    /**
     * @param exclude:[所在数组序号（1-维度，2-度量）,在数组内的下标]
     * */
    checkIfDuplicate(name, exclude) {
      //检验是否重名
      var flag = false;
      if (name.trim() == "") return true;
      for (let index = 0; index < this.table1DataOri.length; index++) {
        let element = this.table1DataOri[index];
        if (exclude && exclude[0] == 1 && exclude[1] == index) continue;
        if (element[this.SHOW_TYPE_ARR[element.show_type]].trim() == name) {
          flag = true;
        }
      }
      if (!flag) {
        for (let index = 0; index < this.table2DataOri.length; index++) {
          let element = this.table2DataOri[index];
          if (exclude && exclude[0] == 2 && exclude[1] == index) continue;
          if (element[this.SHOW_TYPE_ARR[element.show_type]].trim() == name) {
            flag = true;
          }
        }
      }
      return flag;
    },
    setFieldName(element) {
      var res = {
        field_name: "",
        alias: ""
      };
      if (this.checkIfDuplicate(element.col_chs_name || "")) {
        res.field_name = "0";
        res.alias = this.generateName(element.col_chs_name);
      } else {
        res.field_name = "2";
      }
      // if (this.checkIfDuplicate(element.col_chs_name || "")) {
      //   if (this.checkIfDuplicate(element.col_name)) {
      //     res.field_name = "0";
      //     res.alias = this.generateName(element.col_name);
      //   } else {
      //     res.field_name = "1";
      //   }
      // } else {
      //   res.field_name = "2";
      // }
      return res;
    },
    previewEntity(item, view) {
      if(view == 'designView'){
        this.viewTip = '最大显示100条数据，聚合字段不预览';
      } else {
        this.viewTip = '最大显示100条数据';
      }
      if(typeof(item)==="object"){
        item.tableSchema= this.schemaValue;
        if(item.entity_type === 'db2') { //db2数据库schma临时从db_user获取，20201031 by linqh
          item.tableSchema= item.db_user;
        }
        item.conn_id= this.schemaConnIdMap[this.schemaValue];
      }
      this.upEntityColsData({ columns: [], tableAttr: { data: [] } });
      //如果当前数据源是数据库类型数据源，调另一个接口
      if (
        this.dataSrcValue &&
        (this.curResourceTypeId === "database" || this.curResourceTypeId === "localdb") &&
        view !== "designView"
      ) {
        this.entityDialogVisible = true;
        this.prevLoading = true;
        this.previewBaseEntity(item);
        return;
      }

      // 没有设置关联条件
      if (this.checkIfRelationSet() && view === "designView") {
        this.$message.warning("请完成关联条件设置");
        return false;
      }
      this.entityDialogVisible = true;
      this.prevLoading = true;
      let columns = [];
      if (this.curAfId != "") {
        //表示数据集已经保存
        var pageParam = Object.assign({
          objId: this.curAfId,
          operateUser: window.sessionStorage.getItem("user_id"),
          operateObj: 1004,
          operateType: 5,
          result: 1,
          remark: "数据集预览"
        });
        this.addOptlog(pageParam)
          .then(val => {})
          .catch(err => {
            console.error(err);
          });
      }

      if (view === "designView") {
        //设计中预览
        this.entityDialogVisible = true;
        var col_list = this.table1DataOri.concat(this.table2DataOri);
        item = {};
        item.col_list = col_list;
        item.view = view;

        col_list.map(list => {
          if (list.is_show == 1) {
            let name =
              list.show_type == "2"
                ? "col_chs_name"
                : list.show_type == 0
                ? "element_name"
                : "col_name";
            columns.push({
              label: list[name] || "",
              prop: list.col_id,
              "show-overflow-tooltip": true
            });
          }
        });

        let catalogId = "";
        if (this.dataSetCache && this.dataSetCache.catalogId) {
          catalogId = this.dataSetCache.catalogId || "";
        }
        var formattedData = this.formatDataBeforeSave(true);
        // 数据集信息
        const col_lists = formattedData.col_lists;
        const entity_lists = formattedData.entity_lists;
        for (let index = 0; index < col_lists.length; index++) {
          let lis = col_lists[index];
          lis.af_id = "";
          if (lis.is_show == 0) {
            col_lists.splice(index, 1);
            index--;
          }
        }
        let rule_group_list = objDeepCopy(this.rule_group_list);
        if (this.curResourceTypeId === "database" || this.curResourceTypeId === "localdb") {
          //直连数据库 没有tab_id，要把entity_lists里的tab_id都改成tab_alias
          entity_lists.forEach((item, index) => {
            entity_lists[index].tab_id = entity_lists[index].tab_alias;
          });
          col_lists.forEach((item, index) => {
            col_lists[index].tab_id = col_lists[index].tab_alias;
          });
          if (rule_group_list && rule_group_list.length > 0) {
            (rule_group_list[0].children || []).forEach((item, index) => {
              let idx1 = item.element_id.indexOf("split666888");
              if (idx1 > -1) {
                rule_group_list[0].children[index].element_id =
                  item.tab_alias + item.element_id.substring(idx1);
              } else {
                rule_group_list[0].children[index].element_id = item.tab_alias;
              }
            });
          }
        }
        let param = {
          anly_frame_info: {
            af_desc: this.dataSetName,
            af_id: "",
            af_id_list: [],
            af_name: this.dataSetName,
            af_status: "1",
            af_status_desc: "",
            af_status_list: [],
            af_type: "",
            anly_subject_id: this.curAfId == "" ? "" : this.curSubjectId,
            anly_subject_name: "",
            create_time: "",
            create_user: window.sessionStorage.getItem("user_id"),
            create_user_name: "",
            anly_frame_disposes: [],
            anly_frame_elements: col_lists,
            anly_frame_tab_infos: [],
            anly_frame_target_grps: [],
            catalogId: catalogId,
            conn_id: "",
            data_cycle: "",
            dispose_desc: "",
            dispose_type: "",
            dispose_type_list: [],
            frame_id: this.frameId,
            frame_id_list: [],
            frame_name: "",
            h_af_name: "",
            latest_date_time: "",
            orderBeans: [],
            page_count: 20,
            phy_chs_name: "",
            publish_time: "",
            publish_user: "",
            record_num_from: "",
            record_num_to: "",
            start: 0,
            storage_type: "",
            storage_type_list: [],
            sub_status: "",
            sub_status_desc: "",
            sub_target_object: "",
            subject_id: "",
            subject_id_list: [],
            subject_info: {
              af_name: "",
              bus_info: "",
              create_time: "",
              create_time_end: "",
              data_cycle: "",
              frame_id: "",
              frame_name: "",
              is_imp_type: "0",
              is_query_detail: "0",
              is_rule: "",
              key: "",
              max_record_num: "",
              min_record_num: "",
              oper_id: "",
              phy_tab_name: "",
              publish_time: "",
              publish_time_end: "",
              publish_user: "",
              rule_cond_type: "",
              subject_group: "",
              subject_id: "",
              subject_name: "",
              subject_status: "1",
              tab_chs_name: "",
              tab_rel_list: entity_lists,
              update_time: "",
              update_user: "",
              user_name: "",
              rule_group_list: rule_group_list
            },
            subject_name: "",
            tab_chs_name: "",
            tab_id: "",
            tenant_id: sessionStorage.getItem("tenant_id"),
            update_time: "",
            update_time_end: "",
            update_user: ""
          }
        };
        if (this.curResourceTypeId === "database" || this.curResourceTypeId === "localdb") {
          param["dgw_tables"] = this.genDgwTables(entity_lists);
        }
        if (this.privTagSetList.length > 0) {
          //0旧权限接口，1新权限接口内部方式，2新权限接口外部方式
          param.anly_frame_info["priv_pattern"] = "1"; //设计中预览，标签权限
        }
        item.param = param;
      }
      this.getPrevEntity(item, columns);
    },
    getPrevEntity(item, columns) {
      this.getDataEntity(item)
        .then(response => {
          this.$Watermark.set("dsetPreivewTbWrap", 0, 0, -40, 0, true);
          if (
            response.data.respResult == 1 &&
            response.status == 200 &&
            response.data.respData &&
            response.data.respData.is_success
          ) {
            this.handleEntityData(response);
          } else {
            if (
              !(response.data.respData || { is_success: false }).is_success &&
              columns.length == 0
            ) {
              this.$message.error("实体查询失败!");
            }
            this.upEntityColsData({
              columns: columns,
              tableAttr: { data: [] }
            });
          }
        })
        .catch(error => {
          console.error(error);
          // if (columns.length == 0) this.$message.error("实体查询失败！");
          this.upEntityColsData({ columns: columns, tableAttr: { data: [] } });
        })
        .finally(() => {
          this.prevLoading = false;
        });
    },
    fieldAttrConfirm() {
      var isCheck = false;
      if (this.fieldAttrRadio == "0") {
        this.$refs["fieldAttrForm"].validate(valid => {
          if (valid) {
            isCheck = true;
          } else {
            return false;
          }
        });
      }
      if (
        (this.fieldAttrRadio == "0" && isCheck) ||
        this.fieldAttrRadio != "0"
      ) {
        var row = objDeepCopy(curTableItem.row);
        row.show_type = this.fieldAttrRadio + "";
        if (this.fieldAttrRadio == "0") {
          row.element_name = this.fieldAttrForm.alias.trim();
        } else {
          row.element_name = row[this.SHOW_TYPE_ARR[this.fieldAttrRadio]];
          //修复如果先复制一个，院办用非别名，复制版用别名，设置成与物理或者中文名称相同，然后再去设原版，对应的，不切成别名的情况
          var flag1 = this.checkIfDuplicate(
            row[this.SHOW_TYPE_ARR[this.fieldAttrRadio]],
            [curTableItem.type, curTableItem.index]
          );
          if (flag1) {
            //重名 切成别名模式
            row.show_type = "0";
            row.element_name = this.generateName(
              row[this.SHOW_TYPE_ARR[this.fieldAttrRadio]]
            );
          }
        }
        var idx = -1;
        if (this.fieldFilterText.trim() == "") idx = curTableItem.index;
        else idx = this.getFieldRowIdx(curTableItem.type, curTableItem.row);

        // 获取与之有关联的计算度量
        if (row.is_copy != "1" && this.checkIfNumberField(row.col_type)) {
          var arr = this.getRelComputedField(curTableItem.row);
          var oriFieldName = `[${
            curTableItem.row[this.SHOW_TYPE_ARR[curTableItem.row.show_type]]
          }]`;
          var newFieldName = `[${row[this.SHOW_TYPE_ARR[row.show_type]]}]`;
          if (arr.length > 0) {
            for (let index = 0; index < arr.length; index++) {
              let rowIdx = this.table2DataOri.indexOf(arr[index]);
              while (arr[index].col_fun_exp_desc.indexOf(oriFieldName) > -1) {
                arr[index].col_fun_exp_desc = arr[
                  index
                ].col_fun_exp_desc.replace(oriFieldName, newFieldName);
              }
              this.$set(this.table2DataOri, rowIdx, arr[index]);
            }
          }
        }

        switch (curTableItem.type) {
          case 1:
            this.$set(this.table1DataOri, idx, row);
            this.updatefieldTab(1);
            break;
          case 2:
            this.$set(this.table2DataOri, idx, row);
            this.updatefieldTab(2);
            break;

          default:
            break;
        }
        this.fieldAttrDialogVisible = false;
      }
    },
    getSchemaList(operate){
      let param = {};
      let dataSource = (this.dataSrcValue||{}).dsId;
      if(!dataSource){
        this.schemaList = [];
        return;
      }
      this.schemaValue = "";
      let curDataSrc = this.dataSrcValue;
      if (curDataSrc.parentResourceTypeId === "dataasset") {
        //资产
        param = {
          // conn_id: this.connId
          connId: curDataSrc.dsId,
          dsType:curDataSrc.dsType,
          type: 'dataasset'
        };
      } else {
        //自定义数据源
        if(curDataSrc.parentResourceTypeId === "localdb"){
          //根据数据源获取数据库类型

          let pars = this.dataSrcValue;
          for(var c = 0 ; c < this.allDataSrc.length ; c++){
              if(this.allDataSrc[c].dsId == 'localdb'){
                  pars = this.allDataSrc[c].paramList;
                  break;
              }
          }

          for(var x = 0 ; x < pars.length ; x++){
            if(pars[x].paramName == 'db_type'){
               curDataSrc.dsType = pars[x].paramValue;
               break;
            }
          }

          // curDataSrc.dsType = 'oracle';
        }
        //sqlserver数据库
        if(curDataSrc.resourceTypeId === "sqlserver" || curDataSrc.resourceTypeId === "vertica"){
          let pars = this.dataSrcValue.paramList;
          for(var k = 0 ; k < pars.length ; k++){
            if(pars[k].paramName == 'db_name'){
              //sql需要指定对应数据库名
               curDataSrc.dbName = pars[k].paramValue;
               break;
            }
          }
        }
        param={
          dsId: curDataSrc.dsId,
          dsType:curDataSrc.dsType,
          type: 'database'
        }
      }
      this.querySchemaList(param).then(resp=>{
        if (resp.status === 200 && resp.data.respResult === '1') {
          let respData =  resp.data.respData || [];
          if(respData[0].connId){  //数据资产
            let schemaMap = {}
            let arry = [];  //去重构造{connid,schema}数组
            respData.forEach(val=>{
              schemaMap[val.userMode] = val.connId;
            })
            for(let key in schemaMap){
                arry.push(key);
            }
            this.schemaConnIdMap = schemaMap;
            this.schemaList = arry;
          }else{  //数据库
            this.schemaList = [];//清空
            if(curDataSrc.dsType === 'postgresql' || curDataSrc.dsType === 'greenplum'){    //pg,gp库需要类型
               this.schemaList = respData[0].schemaNameList;
            }else if(curDataSrc.dsType === 'sqlserver' || curDataSrc.dsType === 'vertica'){ //sqlserve 特殊处理
              let dname = curDataSrc.dbName;
               for(var p = 0 ; p < respData.length ; p++ ){
                 if(respData[p].dbName === dname){
                    this.schemaList = respData[p].schemaNameList;
                 }
              }
            }
            else{  //其他数据库类型就是其用户模式
              for(var q = 0 ; q < respData.length ; q++ ){
                  this.schemaList.push(respData[q].dbName);
              }
              //  this.schemaList = respData;
            }
          }
          this.schemaListall = objDeepCopy(this.schemaList);
          if(operate==='setValue'){
            let schema = this.schemaList[0] || "";
            if(this.dataSrcValue.paramList && this.dataSrcValue.paramList.length>0){    //如果是oracle下面选择与库名相同名称的模式
              var userName = this.dataSrcValue.paramList.filter(val=>{
                  return val.paramName=='user_name';
              })
              schema = userName[0].paramValue;
            }
            if(curDataSrc.dsType === 'postgresql' || curDataSrc.dsType === 'greenplum'){ //pg数据库
               this.pgDataName = respData[0].dbName;//数据库名
              schema = respData[0].schemaNameList[0]; //数据库模式第一个
              //  let scName = '';
              //  for(var i = 0 ; i < respData[0].schemaNameList.length ; i++){
              //       if(respData[0].schemaNameList[i] == 'public'){ //表示有public
              //         scName = 'public';
              //         break;
              //       }
              //  }
              //  if(scName === ''){
              //      schema = respData[0].schemaNameList[0]; //数据库模式第一个
              //  }else{
              //    schema = scName;
              //  }

            }else if(curDataSrc.dsType === 'sqlserver' || curDataSrc.dsType === 'vertica'){ //sqlserve特殊处理
                let pars = this.dataSrcValue.paramList;
                for(var x = 0 ; x < pars.length ; x++){
                  if(pars[x].paramName == 'db_name'){
                    //sql需要指定对应数据库名
                      this.pgDataName = pars[x].paramValue;
                  }
                }
                //根据数据库名获取对应数据第一个模式
                for(var g = 0 ; g < respData.length ; g++){
                    if(respData[g].dbName == this.pgDataName){ //表示有public
                      schema = respData[g].schemaNameList[0];
                      console.info(schema);
                      break;
                    }
               }

            }
            else{
              this.pgDataName = "";
            }
            //"" ，传递库名，用户模式(兼容带数据库模式的)
            this.schemaValue = schema;
            this.getEntityList("",this.dataSrcValue,this.pgDataName);
          }
        }else{
          this.$message.error(resp.data.respErrorDesc);
        }
      }).catch(err=>{
        console.error(err);
      })
    },
    getEntityList(val, curDataSrc,pgDataName) {  //添加pg数据库名称参数
      if(!this.schemaValue){
        return;
      }
      this.loadingTabList = true;
      let param = {};
      if (curDataSrc.parentResourceTypeId === "dataasset") {   //资产
        //资产
        /* param = {
          conn_id: this.connId || "D8CF9DC45FD11433981359E0E0A911E8",
          is_query_detail: "0",
          tenant_id: window.sessionStorage.getItem("tenant_id") || "34234234",
          key: (val || "").trim(),
          ext_query_type: this.entityType,
          start_page: this.entityCurPage,
          page_count: this.entityPageSize,
          schema: this.schemaValue
        }; */

        param = {
          dgwConnId: this.connId,
          dataAssetConnId:this.schemaConnIdMap[this.schemaValue],
          userMode: this.schemaValue,
          keyWord: (val || "").trim()
        };
      }else if(curDataSrc.parentResourceTypeId === "localdb"){ //本地上传
        let paramList = curDataSrc.paramList;
        let tableSchema = "";//数据库模式
        let dsDbType = "";
        //获取数据库模式
        for (let index = 0; index < (paramList || []).length; index++) {
          const element = paramList[index];
          if (element.paramName === "user_name") {
            tableSchema = element.paramValue;
            break;
          }
        }

        for (let index = 0; index < (paramList || []).length; index++) {
            const element = paramList[index];
            if (element.paramName === "tns") {
                dsDbType = element.paramValue.split(":")[1];
                break;
            }
        }
        //设置资源类型
        this.dataSrcValue.resourceTypeId = dsDbType;
        this.dataSrcValue.dsType = dsDbType;

        param = {
          dsId: 'localdb',  //固定
          key: (this.filterText || "").trim(),
          schema: tableSchema,
          schemaName:""
        };
      }
      else {  //自定义数据源
          if(pgDataName!=null && pgDataName!=''){ //pg库获取表字段走分支判断 add czl 2020/04/26
              param = {
              dsId: curDataSrc.dsId,
              key: (this.filterText || "").trim(),
              schema:pgDataName,
              schemaName:this.schemaValue
            };
          }else{ //其他库类型
            param = {
              dsId: curDataSrc.dsId,
              key: (this.filterText || "").trim(),
              schema: this.schemaValue,
              schemaName:""
            };
          }
      }
      this.queryEntityList({
        type: curDataSrc.parentResourceTypeId,
        param: param
      })
      .then(response => {
        var data = response.data.respData;
        if (response.data.respResult == 1 && data && data.length > 0) {
          if (this.curResourceTypeId == "dataasset") {
            //资产的实体列表要记录总条数
            this.entitysTotal = response.data.dataTotalCount;
          }
          // 如果是数据库，还要处理过滤条件
          let newData = this.formatEntityData(data);
          if (
             curDataSrc.parentResourceTypeId === "localdb" ||
            curDataSrc.parentResourceTypeId === "database" ||
            (curDataSrc.parentResourceTypeId === "dataasset" &&
              this.entityCurPage == 1)
          ) {
            this.dealEntityData(newData);
          } else {
            this.cur_condiData = this.cur_condiData.concat(newData);
            this.entityScrollFlag = true;
          }
        } else {
          // this.$message.success("数据源表集合为空");
          this.dealEntityData([]);
        }
      })
      .catch(error => {
        console.error(error);
        // this.$message.error("数据源表集合加载失败");
      })
      .finally(() => {
        this.loadingTabList = false;
      });
    },
    dealEntityData(data) {
      this.cur_condiDataBak = Object.freeze(data);
      this.entityCurPage = 1;
      this.cur_condiData = [];
      // 刷新实体表数据时滚动条重置到初始位置
      let selectorObj = document.querySelector(
        ".tables-detail .el-scrollbar__wrap"
      );
      if (typeof selectorObj.scrollTo === "function") {
        selectorObj.scrollTo(0, 0);
      }
      this.loadEntityData();
    },
    updatefieldTab(type) {
      let val = this.fieldFilterText.toLocaleLowerCase();
      switch (type) {
        case 1:
          if (val.trim() == "") {
            this.table1Data = Object.freeze(objDeepCopy(this.table1DataOri));
          } else {
            this.table1Data = Object.freeze(
              this.table1DataOri.filter(item => {
                return (
                  item[this.SHOW_TYPE_ARR[item.show_type]]
                    .toLocaleLowerCase()
                    .indexOf(val) > -1
                );
              })
            );
          }
          break;
        case 2:
          if (val.trim() == "") {
            this.table2Data = Object.freeze(objDeepCopy(this.table2DataOri));
          } else {
            this.table2Data = Object.freeze(
              this.table2DataOri.filter(item => {
                return (
                  item[this.SHOW_TYPE_ARR[item.show_type]]
                    .toLocaleLowerCase()
                    .indexOf(val) > -1
                );
              })
            );
          }
          break;
        default:
          break;
      }
    },
    saveDataSet() {
      let _catalogId = "";
      const dsType = this.dataSetType;
      var that = this;
      if (dsType == 0) {
        _catalogId = this.dataSetCache.catalogId;
        if (this.curAfId) {
          service({
            maskOff: true,
            url: this.renderEngine + "/list/checkPageInfoRelDataSet",
            method: "post",
            data: {
              afIds: [this.curAfId],
              relFlag: "1"
            },
            headers: {
              "X-UserId": window.sessionStorage.getItem("user_id") || "9999012",
              "X-SystemId": this.defaultSystemId || "111"
            }
          })
            .then(response => {
              if (
                response.data.respResult == 1 &&
                response.data.respData &&
                response.data.respData > 0
              ) {
                that
                  .$confirm("该数据集已被应用，确认修改数据集", "提示", {
                    closeOnClickModal: false,
                    confirmButtonText: "确 认",
                    cancelButtonText: "取 消"
                  })
                  .then(() => {
                    that.saveDataSetAct(_catalogId);
                  })
                  .catch(() => {
                    that.$message({
                      type: "info",
                      message: "已取消"
                    });
                  });
              } else {
                that.saveDataSetAct(_catalogId);
              }
            })
            .catch(error => {
              console.error(error);
              // that.$message.error("查询数据集是否被应用失败");
            });
        } else {
          that.saveDataSetAct(_catalogId);
        }
      } else if (dsType == 1) {
        // 从即席查询进入的新增
        // _catalogId = this.saveForm.catalogId
        this.dialogSaveAs = true;
        this.saveAsDataSet()
      }
    },
    saveDataSetAct(_catalogId, isFromSaveAs) {
      var formattedData = this.formatDataBeforeSave();
      // 数据集信息
      const col_lists = formattedData.col_lists;
      const entity_lists = formattedData.entity_lists;
      // const col_lists = this.table1DataOri.concat(this.table2DataOri);
      // const entity_lists = this.entityData;
      let dataSetName = this.dataSetName;
      let paramAfId = this.curAfId || "";
      let paramSubjectId = this.curAfId == "" ? "" : this.curSubjectId;
      if (isFromSaveAs) {
        //另存
        dataSetName = this.saveForm.pageName;
        paramAfId = "";
        paramSubjectId = "";
      } else {
        if (dataSetName == "") {
          this.$message.warning("请定义数据集名称");
          this.toSaveInput = true;
          this.$refs.toSaveBtn.focus();
          return;
        }
      }
      this.loading = true;
      this.toSaveInput = false;
      // 没选拓扑图 || 选完拓扑图但是字段都没选
      if (entity_lists.length == 0 || col_lists.length == 0) {
        this.$message.warning("请先进行数据建模设计！");
        this.loading = false;
        return;
      }
      // 没有设置关联条件
      if (this.checkIfRelationSet()) {
        this.$message.warning("请完成关联条件设置");
        this.loading = false;
        return;
      }
      var tid = sessionStorage.getItem("tenant_id"); //设置user_id

      let param = {
        af_desc: dataSetName,
        af_id: paramAfId,
        af_id_list: [],
        af_name: dataSetName,
        af_status: "1",
        af_status_desc: "",
        af_status_list: [],
        af_type: "",
        anly_frame_disposes: [],
        anly_frame_elements: col_lists,
        anly_frame_tab_infos: [],
        anly_frame_target_grps: [],
        anly_subject_id: paramSubjectId,
        anly_subject_name: "",
        catalogId: _catalogId,
        conn_id: this.connId,
        create_time: "",
        create_user: window.sessionStorage.getItem("user_id"),
        create_user_name: "",
        data_cycle: "",
        dispose_desc: "",
        dispose_type: "",
        dispose_type_list: [],
        frame_id: this.frameId,
        frame_id_list: [],
        frame_name: "",
        h_af_name: "",
        latest_date_time: "",
        orderBeans: [],
        page_count: 20,
        phy_chs_name: "",
        publish_time: "",
        publish_user: "",
        record_num_from: "",
        record_num_to: "",
        start: 0,
        storage_type: "",
        storage_type_list: [],
        sub_status: "",
        sub_status_desc: "",
        sub_target_object: "",
        subject_id: "",
        subject_id_list: [],
        subject_info: {
          af_name: "",
          bus_info: "",
          create_time: "",
          create_time_end: "",
          data_cycle: "",
          frame_id: "",
          frame_name: "",
          is_imp_type: "0",
          is_query_detail: "0",
          is_rule: "",
          key: "",
          max_record_num: "",
          min_record_num: "",
          oper_id: "",
          phy_tab_name: "",
          publish_time: "",
          publish_time_end: "",
          publish_user: "",
          rule_cond_type: "",
          subject_group: "",
          subject_id: "",
          subject_name: "",
          subject_status: "1",
          tab_chs_name: "",
          tab_rel_list: entity_lists,
          update_time: "",
          update_user: "",
          user_name: "",
          rule_group_list: this.rule_group_list
        },
        subject_name: "",
        tab_chs_name: "",
        tab_id: "",
        tenant_id: tid,
        update_time: "",
        update_time_end: "",
        update_user: ""
      };
      if (this.curResourceTypeId === "database" || this.curResourceTypeId === "localdb") {
        // 下划线改驼峰
        param = this.formatDBDatasetInfo(objClone(formattedData, 1));
        param.datasetName = dataSetName;
        param.datasetDesc = dataSetName;
        param["catalogId"] = _catalogId;
        if (paramAfId != "") {
          param["datasetId"] = paramAfId;
        }
      }
      param['privPattern'] = this.privTagSetList.length > 0 ? '1' : '0';//权限标签切割--add by songjj 2020/11/14
      const _this = this;
      this.saveDataSetInfo({
        type: this.curResourceTypeId,
        param: param
      })
        .then(function(response) {
          if (response.data.respResult == 1) {
            // if (isFromSaveAs) {
            //   //另存的就不用
            //   _this.$message.success("数据集另存成功");
            // } else {
            _this.dataSetName = response.data.respData.af_name || dataSetName;

            document.title = _this.dataSetName;
            let dataSetCache = objDeepCopy(_this.dataSetCache);
            dataSetCache.af_id =
              response.data.respData.af_id || response.data.respData;
            dataSetCache.af_name = _this.dataSetName;
            dataSetCache.af_desc = _this.dataSetName;
            dataSetCache.isDemo = '0'; // 另存后都不属于案例
            sessionStorage.setItem("dataSetCache", JSON.stringify(dataSetCache));
            _this.setDataSetCache(dataSetCache);
            // 成功
            _this.$message.success(
              "页面" + (isFromSaveAs ? "另存成功" : "保存成功")
            );
            _this.curAfId =
              response.data.respData.af_id || response.data.respData || "";
            _this.curSubjectId = response.data.respData.subject_id || "";
            // }

            // const ds = _this.dataSetType;
            // if (ds == 1) { //不跳回去
            //   // 跳回即席查询页面
            //   _this.$router.push({
            //     path: "/design",
            //     name: "design"
            //   });
            // }
          } else {
            _this.$message.error(response.data.respErrorDesc);
          }
          _this.loading = false;
        })
        .catch(function(error) {
          console.error(error);
          // _this.$message.error(
          //   "页面" + (isFromSaveAs ? "另存失败" : "保存失败")
          // );
          _this.loading = false;
        });
    },
    generateName(name) {
      var oriName = name;
      while (this.checkIfDuplicate(name)) {
        let number = name.substring(oriName.length);
        if (number == "") name = oriName + "1";
        else {
          //如果完全是数字，再加一位1
          number = parseInt(number);
          number++;
          name = oriName + number + "";
        }
      }
      return name;
    },
    formatFieldList(getStructureData, key, clrClass, isAddToTbData) {
      var fields = [];
      //console.log('queryDbColConf查到的类型:', this.fieldTypeList);
      var _this = this;
      //console.log('getStructure查到的类型:', getStructureData);

      //处理字段类型带括号如：timestamp(6)
      var reg = /\(\d+\)/;
      var data = getStructureData.filter(item => {
        for (let key in _this.fieldTypeList) {
          if ((item.colType || "").toLocaleLowerCase().replace(reg, "") == key) {
            return true;
          }
        }
      });
      //console.log('newdata:',data );
      for (let index = 0; index < data.length; index++) {
        const element = data[index];
        let element_type = 2;
        /* let col_id1 = (element.colId || "").toLocaleLowerCase();
        if (
          (element.dimId != "null" &&
            element.dimId != null &&
            element.dimId != "") ||
          ((element.dimId == "null" ||
            element.dimId == null ||
            element.dimId == "") &&
            ((element.colType != "" &&
              element.colType.toLocaleLowerCase() != "number") ||
              col_id1.indexOf("month") > -1 ||
              col_id1.indexOf("date") > -1))
        ) {
          element_type = 1;
        } */
        if (
          element.colType != "" &&
          (this.fieldTypeList[element.colType.toLocaleLowerCase().replace(reg, "")] || {})
            .elementType == "1"
        ) {
          element_type = 1;
        }
        let item = {
          af_id: "",
          element_id: "", //element.col_id
          element_name: "", //别名
          element_type: element_type, //1维度(左边)，2指标(右边)
          is_calcul: "0",
          tab_id: element.tabId,
          tab_chs_name: element.tabChsName,
          tab_col_id: element.colId, //字段物理名称   element.col_name
          col_type: element.colType,
          col_fun_exp: "",
          col_fun_exp_desc: "",
          is_trans_dim: "",
          dim_id: element.dimId,
          dim_name: element.dimName,
          dim_level_id: element.dimLevelId,
          dim_level_name: element.dimLevelName,
          order_id: "0",

          col_id: element.colId,
          col_name: element.colName,
          col_chs_name: element.colChsName,
          create_time: "",
          create_user: "",
          create_user_name: "",
          show_type: "2", //show_type 2:描述--col_chs_name 1:物理字段名--col_name 0:别名--element_name
          is_show: "1",
          show_format:
            fieldMatch(element.colType,this.fieldTypeList) == "date"
              ? "yyyy-MM-dd hh24:mi:ss"
              : "", //格式化 日期类型设一个默认值 yyyy-MM-dd hh24:mi:ss
          source_format: "", //源时间展现格式
          iconClr: clrClass,
          tab_alias: key, //实体别名
          is_copy: "0", //是否拷贝字段
          phy_tab_name: element.phyTabName,
          col_length: element.colLength,
          col_precise: element.colPrecise,
          data_type: element.data_type,
          is_data_priv: 0 //是否数据权限控制 number
        };
        if (
          element.dimId != null &&
          element.dimId != "" &&
          element.dimId != "null"
        ) {
          if (
            element.dimLevelId != null &&
            element.dimLevelId != "" &&
            element.dimLevelId != "null"
          ) {
            /* this.setDimRelation(item)
              .then(response => {
                var data = response.data.respData;
                if (response.data.respResult == "1") {
                  item.dfAreaSels = data;
                }
              })
              .catch(err => {
                console.error(err);
              }); */
          }
        }
        if (this.curResourceTypeId === "database" || this.curResourceTypeId === "localdb") {
          item["is_trans_dim"] = 0;
          item["col_chs_name"] = item["col_chs_name"]
            ? item["col_chs_name"]
            : item["col_name"];
        }
        let res = this.setFieldName(item);
        item.element_name = res.alias;
        item.show_type = res.field_name;
        if (isAddToTbData || isAddToTbData == undefined) {
          if (element_type == 1) {
            this.table1DataOri.push(item);
          } else {
            this.table2DataOri.push(item);
          }
        }
        fields.push(objDeepCopy(item));
      }
      if (isAddToTbData || isAddToTbData == undefined) {
        this.updatefieldTab(1);
        this.updatefieldTab(2);
      }
      if (typeof this.allFieldsMap.set != "function") {
        this.allFieldsMap = new Map([[key, fields]]);
      } else {
        this.allFieldsMap.set(key, fields);
      }
    },
    formatEntityData(data) {   //设置格式化值
      /**
         * tab_id  1  String    实体编码
         col_id  1  String    字段
         col_id_exp  1  String    实体字段表达式  （存放有加函数时的完整表达式）
         rel_tab_id  1  String    关联表编码
         rel_col_id  1  String    关联表字段
         rel_col_id_exp  1  String    关联实体字段表达式  （存放有加函数时的完整表达式）
         */
      var newData = [];
      for (let index = 0; index < data.length; index++) {
        const element = data[index];
        newData.push({
          tab_id: element.tab_id || element.tabName,
          phy_tab_name: element.phy_tab_name || element.tabName, //数据库的表是tab_name
          tab_chs_name: element.tabAlias, //数据库表中文名
          rel_tab_id: "", //上级关联实体编码
          join_type: "2", //默认左连接
          tab_schema: this.schemaValue,
          entity_type: element.dispose_list ? element.dispose_list[0].entity_type : '', //返回数据存储的数据库
          db_user:  element.dispose_list ? element.dispose_list[0].db_user : '', //返回数据存储的数据库用户
          tab_join_exp_list: [
            //实体关联关系表达式
            // {
            //   tab_id: "",
            //   col_id: "",
            //   col_id_exp: "",
            //   rel_tab_id: "",
            //   rel_col_id: "",
            //   rel_col_id_exp: ""
            // }
          ],
          tab_rel_list: [] //实体关联关系列表
        });
      }
      return newData;
    },
    queryDataSet() {
      this.loadingFieldTab = true;
      let param = {
        af_id: this.dataSetCache.datasetId,
        anly_subject_id: "",
        is_query_tab_his: "1",
        datasetId: this.dataSetCache.datasetId
      };
      const _this = this;
      if (this.curResourceTypeId === "database" || this.curResourceTypeId === "localdb") {
        param = {
          datasetId: this.dataSetCache.datasetId
        };
      }
      if(this.curResourceTypeId === 'localdb'){  //本地数据库设置
           //隐藏用户模式下拉    ---   相关数据库参数可以通过查服务获取
          this.isShowDiv = false;
          let dbuser1 = (this.dataSrcValue.paramList || []).filter(item0 => {
              return item0.paramName === "user_name";
          });
          this.schemaValue = dbuser1[0].paramValue;
          let pars = [];
          for(var s = 0 ; s < this.allDataSrc.length ; s++){
              if(this.allDataSrc[s].dsId == 'localdb'){
                  pars = this.allDataSrc[s].paramList;
                  break;
              }
          }

          for(var p = 0 ; p < pars.length ; p++){
            if(pars[p].paramName == 'db_type'){
               //解决编辑时候本地预览出错问题
               this.dataSrcValue.resourceTypeId = pars[p].paramValue;
               this.dataSrcValue.dsType = pars[p].paramValue;
               break;
            }
          }

          // this.getEntityList('',value,'');
      }

      this.getDataSetInfo({
        type: this.curResourceTypeId,
        param: param
      })
        .then(function(response) {
          var data = response.data.respData;
          if (response.data.respResult == 1 && data) {
            // 成功
            document.title = data.af_name || data.datasetName;
            data = mapDataSetInfoKey(data);
            if (_this.curResourceTypeId === "database" || _this.curResourceTypeId === "localdb") {
              //先把数据格式改成下划线的
              data = objClone(data, 2);
            }
            _this.dealDataSet(data);
            // _this.$message.error("数据集保存成功");
          } else {
            _this.$message.error("数据集详情查询失败");
          }
        })
        .catch(function(error) {
          console.error(error);
          _this.loadingFieldTab = false;
          // _this.$message.error("数据集详情查询失败");
        })
        .finally(() => {
          _this.loadingFieldTab = false;
          _this.isDatasetQuery = true;
        });
    },
    dealDataSet(data) {
      if(data.conn_id === "localdb"){  //本地数据库需要设置表中文名称
        var tabChsNames = data.subject_info.tab_rel_list;
        for(var i = 0 ; i < tabChsNames.length ; i++ ){
            this.realTabChsName.push(tabChsNames[i].tab_chs_name);
        }
      }
      let schemaMap = {}; //tab_alias与user_name的对应关系
      let sign = 'user_name';
      if(this.dataSrcValue){
        let dsType = (this.dataSrcValue.dsType || "").toLowerCase();
        if(dsType.includes('mysql') || dsType.includes('gbase')){
          sign = 'db_name';
        }
         //区分数据库模式提示语  add czl by 2020.04/26
        if(dsType === "oracle" ){
            this.schemaTip = this.userModeTip;
        }else if(dsType === "gbase" || dsType === "mysql"){
              this.schemaTip = this.dataModeTip;
        }else{
            this.schemaTip = this.shemaModeTip;
        }

      }
      (data.element_list||data.anly_frame_elements||[]).forEach(val => {  //资产为anly_frame_elements
        let key = val.tab_alias;
        let user = val[sign];
        schemaMap[key] = user;
        if (val.priv_tag) {
          this.privTagSetList.push(val.priv_tag);
        }
      })
      var entityData1 = data.subject_info.tab_rel_list || [];
      this.rule_group_list = data.subject_info.rule_group_list || [];
      for (let index = 0; index < entityData1.length; index++) {
        //回填schema字段
        let alias = entityData1[index].tab_alias;
        entityData1[index].tab_schema = schemaMap[alias];
        // 处理数据资产join_exp_list 没有按tab_alias group by 条件的情况（即出现一张表在拓扑图中多次使用时）
        if (
          entityData1[index].tab_join_exp_list &&
          entityData1[index].tab_join_exp_list.length > 0
        ) {
          let joinExpList1 = entityData1[index].tab_join_exp_list.filter(
            item => {
              return item.tab_alias == entityData1[index].tab_alias;
            }
          );
          entityData1[index].tab_join_exp_list = joinExpList1;
        }
        const element = entityData1[index];
        if (element.tab_join_exp_list && element.tab_join_exp_list.length > 0) {
          entityData1[index]["rel_tab_alias"] =
            element.tab_join_exp_list[0].rel_tab_alias;
        }
      }
      if (data.conn_id) {
        this.connId = data.conn_id;
        let connInfo = this.allDataSrcCopy.filter(item1 => {
          return item1.dsId === data.conn_id;
        });
        if (connInfo.length > 0) {
          this.dataSrcValue = connInfo[0];
          this.getSchemaList('setValue');
          // this.getEntityList(this.filterText, connInfo[0]);
        }
      }
      //单表计算字段涉及关联条件设置，要把col_id的值替换成col_id_exp 不然连接面板回显会有问题
      for (let index = 0; index < entityData1.length; index++) {
        const element = entityData1[index];
        if ((element.tab_join_exp_list || []).length > 0) {
          let oriJoinList = element.tab_join_exp_list;
          for (let index2 = 0; index2 < oriJoinList.length; index2++) {
            const element2 = oriJoinList[index2];
            if ((element2.col_id_exp || "").indexOf("[") > -1) {
              oriJoinList[index2].col_id = element2.col_id_exp;
            }
            if ((element2.rel_col_id_exp || "").indexOf("[") > -1) {
              oriJoinList[index2].rel_col_id = element2.rel_col_id_exp;
            }
          }
        }
      }
      this.formatSavedData(
        entityData1,
        data.anly_frame_elements || data.element_list || []
      );
      this.curAfId = data.af_id || data.dataset_id;
      this.dataSetName = data.af_name || data.dataset_name;
      this.curSubjectId = data.subject_id || "";
    },
    ruleListFormat(list) {
      let result = list || [];
      if(result.length>0){
        let pnode = result[0];
        pnode.type = pnode.element_type;
        pnode.element_id = "";
        delete pnode.id;
        if(pnode.children.length>0){
          pnode.children.forEach(val=>{
            let cid = val.element_id.split("split666888");
            val.element_id = cid[0] || "";
            val.col_id = cid[1] || "";
            delete val.element_name;
            delete val.id;
            delete val.parent_id;
          })
        }
      }
      return result;
    },
    resetPage() {
      this.dataSetName = "";
      this.filterText = "";
      this.activeNum = 0;
      this.slideVisiable = true;
      this.entityData = [];
      this.cur_condiData = Object.freeze([]);
      this.cur_condiDataBak = Object.freeze([]);
      this.isHideTop = false;
      this.bodyHeight = document.body.clientHeight;
      this.table1Data = Object.freeze([]);
      this.table2Data = Object.freeze([]);
      this.table1DataOri = [];
      this.table2DataOri = [];
      this.showContext = false;
      this.fieldFilterText = "";
      this.contextMenuVal = {
        isHide: false,
        timeVal: "YYYY-MM-DD"
      };
      // 字段描述弹窗
      this.fieldAttrDialogVisible = false;
      this.fieldAttrRadio = 2;
      this.fieldAttrForm = {
        alias: "",
        physiName: "brand_id",
        description: "品牌"
      };
      this.entityDialogVisible = false;
      this.countId = 0;
      this.fieldAttrFormRules = {
        alias: [{ validator: this.checkAlias, trigger: "blur" }]
      };
      this.frameId = "F00000000002";
      this.curAfId = "";
      this.curSubjectId = "";
      this.loadingFieldTab = false;
      this.topoAreaMinH = 60;
      this.mainTabId = ""; //主表id
      if (typeof this.allFieldsMap.clear == "function")
        this.allFieldsMap.clear();
      this.loadingTabList = false;
      this.computedDialogVis = false;
      this.editField = {};
      this.editFieldIdx = -1;
    },
    checkAlias(rule, value, callback) {
      var idx = curTableItem.index;
      if (this.fieldFilterText.trim() != "") {
        idx = this.getFieldRowIdx(curTableItem.type, curTableItem.row);
      }
      if (this.fieldAttrRadio == "0") {
        if (
          value == null ||
          value == "" ||
          (typeof value == "string" && value.trim() == "")
        ) {
          callback(new Error("别名不能为空"));
        } else if (value.indexOf("[") > -1 || value.indexOf("]") > -1) {
          //补充校验 别名内不能输入[]
          callback(new Error("别名不能包含[、]符号"));
        } else if (this.checkIfDuplicate(value, [curTableItem.type, idx])) {
          callback(new Error("别名不能重名"));
        } else {
          callback();
        }
      } else callback();
    },
    queryCatalog() {
      var user_id = window.sessionStorage.getItem("user_id");
      var param = {
        classTypeId: "1004",
        createUser: user_id
      };
      this.queryTreeData(param)
        .then(val => {
          if (val.status == 200 && val.data.respResult == 1) {
            var list = val.data.respData;
            if (list.length > 0) {
              var result = [];
              var first = [],
                second = [];
              list.forEach(function(val) {
                if (val.parentCatalogId == "myfold") {
                  first.push(val);
                } else {
                  second.push(val);
                }
              });
              first.forEach(val => {
                var temp = {};
                temp.value = val.catalogId;
                temp.id = val.catalogId;
                temp.label = val.catalogName;
                temp.level = 1;
                temp.typeId = val.classTypeId;
                temp.parentId = val.parentCatalogId;
                let children = this.generateTree(val, second);
                if (children.length > 0) {
                  temp.children = children;
                } else if (second.length > 0) {
                  temp.children = []; //防止选中后面没有数据-会显示旧数据子集
                }
                result.push(temp);
              });
            }
            // this.cataTreeData = Object.freeze(result);
            this.cataTreeData = [
              {
                id: "myfold",
                label: "我的文件夹",
                level: 0,
                value: "myfold",
                children: result
              }
            ];
          } else {
            this.$message.error("目录查询失败");
          }
        })
        .catch(err => {
          console.error(err);
          // this.$message.error("文件夹查询异常");
        });
    },
    generateTree(data, list) {
      var tree = [];
      for (var i = 0; i < list.length; i++) {
        var temp = list[i];
        if (temp.parentCatalogId == data.catalogId) {
          var obj = {};
          obj.value = temp.catalogId;
          obj.id = temp.catalogId;
          obj.label = temp.catalogName;
          obj.level = 2;
          obj.typeId = temp.classTypeId;
          obj.parentId = temp.parentCatalogId;
          tree.push(obj);
        }
      }
      return tree;
    },
    saveAsDataSet() {
      // this.curAfId = "";
      this.queryCatalog(); //重新在查询一下目录列表        -----   这个方法是异步的
      this.saveForm.pageName = this.dataSetName;
      this.dialogSaveAs = true;
      this.saveForm.catalogId = []
      this.$nextTick(() => {
        this.$refs.saveForm.clearValidate()
      })
    },
    saveAsSubmit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          var catalogId = this.saveForm.catalogId[
            this.saveForm.catalogId.length - 1
          ];
          // this.curAfId = "";
          this.saveDataSetAct(catalogId, true);
          this.dialogSaveAs = false;
        }
      });
    },
    activatedCode(){
      if (this.dataSetCache != null) {
        this.loadingFieldTab = true;
        const _this = this;
        if(this.curResourceTypeId === 'localdb'){  //本地数据库设置
            //隐藏用户模式下拉    ---   相关数据库参数可以通过查服务获取
            this.isShowDiv = false;
            let dbuser1 = (this.dataSrcValue.paramList || []).filter(item0 => {
                return item0.paramName === "user_name";
            });
            this.schemaValue = dbuser1[0].paramValue;
            let pars = [];
            for(var s = 0 ; s < this.allDataSrc.length ; s++){
                if(this.allDataSrc[s].dsId == 'localdb'){
                    pars = this.allDataSrc[s].paramList;
                    break;
                }
            }

            for(var p = 0 ; p < pars.length ; p++){
              if(pars[p].paramName == 'db_type'){
                //解决编辑时候本地预览出错问题
                this.dataSrcValue.resourceTypeId = pars[p].paramValue;
                this.dataSrcValue.dsType = pars[p].paramValue;
                break;
              }
            }

            // this.getEntityList('',value,'');
        }

        var objId = this.dataSetCache.datasetId;
        var cid = 'dads';
        var pageParam = Object.assign({
          objId: objId,
          createUser: window.sessionStorage.getItem("user_id"),
          classTypeId: cid,
          objType: cid,
          verNo: this.dataSetCache.verNo,
          preViewFalg: "1", //1-记录操作日志标志    0-不记录操作日志
          isNeedDemo: this.dataSetCache.isDemo // 案例
        });
        this.queryAfByVerNo(pageParam)
          .then(async response => {
          var data = response.data.respData;
          if (response.data.respResult == 1 && data) {
            // 成功
            document.title = data.af_name || data.datasetName;
            data = mapDataSetInfoKey(data);
            if (_this.curResourceTypeId === "database" || _this.curResourceTypeId === "localdb") {
              //先把数据格式改成下划线的
              data = objClone(data, 2);
            }
            _this.dealDataSet(data);
            // _this.$message.error("数据集保存成功");
          } else {
            _this.$message.error("数据集详情查询失败");
          }
        })
        .catch(function(error) {
          console.error(error);
          _this.loadingFieldTab = false;
          // _this.$message.error("数据集详情查询失败");
        })
        .finally(() => {
          _this.loadingFieldTab = false;
          _this.isDatasetQuery = true;
        });
      } else {
        if (this.pageCache.isWatermark == 1) {
          this.$Watermark.set("water-wrap", 60, 20, -40, 0, flag);
        }
      }
    },
    ...mapMutations({
      setTreeList: "HomeTree/setTreeList",
      upDataSrcDialogVis: "DataSetMgt/upDataSrcDialogVis",
      setDatasetType: "DataSetDesign/setDatasetType"
    }),
    ...mapActions({
      getDataEntity: "DataSetMgt/getDataEntity",
      upEntityColsData: "DataSetMgt/upEntityColsData",
      entityParams: "DataSetMgt/entityParams",
      queryTreeData: "HomeTree/queryTreeData",
      queryEntityFields: "DataSetDesign/queryEntityFields",
      getTabInfo: "DataSetMgt/getTabInfo",
      updateTopoTabActive: "DataSetDesign/updateTopoTabActive",
      updateFieldDatas: "DataSetDesign/updateFieldDatas",
      updateIsIndeterminate: "DataSetDesign/updateIsIndeterminate",
      updateCheckAll: "DataSetDesign/updateCheckAll",
      updateCheckedFields: "DataSetDesign/updateCheckedFields",
      updateFilterTabfieldText: "DataSetDesign/updateFilterTabfieldText",
      updateFieldDatasOri: "DataSetDesign/updateFieldDatasOri",
      updateAllFieldsMap: "DataSetDesign/updateAllFieldsMap",
      updateConnLeftSelOption: "DataSetDesign/updateConnLeftSelOption",
      updateConnRightSelOption: "DataSetDesign/updateConnRightSelOption",
      updateJoinExpList: "DataSetDesign/updateJoinExpList",
      updateCurSelConnInfo: "DataSetDesign/updateCurSelConnInfo",
      updateActiveConn: "DataSetDesign/updateActiveConn",
      updateConnPopVisible: "DataSetDesign/updateConnPopVisible",
      addOptlog: "compt/addOptlog", //添加预览日志
      setDataSetCache: "DataSetMgt/setDataSetCache", //使用vuex缓存数据
      queryDataSource: "DataSetMgt/queryDataSource", //数据源列表查询
      queryEntityList: "DataSetDesign/queryEntityList", //查询左侧表集合
      queryDbTbData: "DataSetDesign/queryDbTbData", //数据源 左侧表数据预览
      queryTbFields: "DataSetDesign/queryTbFields", //查询表字段
      saveDataSetInfo: "DataSetDesign/saveDataSetInfo", //保存数据集
      getDataSetInfo: "DataSetDesign/getDataSetInfo", //查询数据集信息
      queryDbColConf: "DataSetDesign/queryDbColConf", //查询数据库字段类型
      queryDateFormatList: "DataSetDesign/queryDateFormatList", //获取时间格式串列表
      queryEncryptList: "DataSetDesign/getDicValue", //获取加密策略类型列表
      updateDateFormatPopVisible: "DataSetDesign/updateDateFormatPopVisible",
      querySchemaList: "DataSetDesign/querySchemaList",
      setDatasetType: "DataSetDesign/setDatasetType",
      queryAfByVerNo: "PageDesign/queryAfByVerNo",
      getUserTagPriv: "DataSetDesign/getUserTagPriv"
    }),
    panestop(pane, container, size) {
      if (size.indexOf("px") > -1) {
        size = size.substring(0, size.length - 2);
      }
      this.topoAreaMinH = parseFloat(size) - 80;
    },
    fieldAttrCancel() {
      this.$refs["fieldAttrForm"].resetFields();
      this.fieldAttrDialogVisible = false;
    },
    /*
    @param tabId 待查字段的表的id：tab_id
    key 表的唯一标识id
    clrClass 图标颜色
    */
    queryTabFields(paramObj) {
      this.loading = true;
      let _this = this;
      let _param = {};
      let colListKey = "tab_col_list";
      if (this.curResourceTypeId === "dataasset") {
        _param.tab_id = paramObj.tabId;
        _param.is_query_detail = "1";
        _param.ext_query_type = _this.entityType;
      } else {
        if(this.dataSrcValue.dsType === 'postgresql' || this.dataSrcValue.dsType === 'greenplum' ||  this.dataSrcValue.dsType === 'sqlserver' || this.dataSrcValue.dsType === 'vertica'){ //pg、gp库
            _param.dsId = this.dataSrcValue.dsId;
            _param.dsDbType = this.dataSrcValue.dsType;
            _param.tableNames = [paramObj.tabId];
            _param.tableSchema = this.pgDataName;
            _param.schemaName = this.schemaValue;
            _param.dbName = this.dataSrcValue.dbName;
        } else {
            _param.dsId = this.dataSrcValue.dsId;
            _param.dsDbType = this.dataSrcValue.dsType;
            _param.tableNames = [paramObj.tabId];
            _param.tableSchema = this.schemaValue;
        }
        colListKey = "tabColList";
      }
      this.loadingFieldTab = true;
      // this.$axios({
      //   url: this.datasetUrl + "/dataAssetEntity/getTabInfoList",
      //   method: "post",
      //   data: _param,
      //   headers: {
      //     "X-UserId": window.sessionStorage.getItem("user_id") || "9999012",
      //     "X-SystemId": this.defaultSystemId || "111"
      //   }
      // })
      _this
        .queryDbColConf({ dbType: _this.dataSrcValue.resourceTypeId })
        .then(response => {
          if (response.status == 200 && response.data.respResult == "1") {
            _this.fieldTypeList = response.data.respData || {};
            //console.log('_this.fieldTypeList::', _this.fieldTypeList);

            this.queryTbFields({    //拖入实体
              type: this.curResourceTypeId,
              param: _param
            }).then(function(response) {
              if (
                response.data.respResult == 1 &&
                response.data.respData &&
                response.data.respData.length > 0 &&
                response.data.respData[0][colListKey] &&
                response.data.respData[0][colListKey].length > 0
              ) {
                let data = response.data.respData[0][colListKey];
                for (let index = 0; index < data.length; index++) {
                  data[index]["tab_chs_name"] =
                    response.data.respData[0].tab_chs_name ||
                    response.data.respData[0].tabAlias ||
                    "";
                  data[index]["phy_tab_name"] =
                    response.data.respData[0].phy_tab_name ||
                    response.data.respData[0].phyTabName ||
                    "";
                  data[index]["resourceTypeId"] = _this.dataSrcValue.resourceTypeId;  //资源类型

                  if (_this.curResourceTypeId === "database" || _this.curResourceTypeId === "localdb") {
                    data[index]["tab_id"] = data[index]["phy_tab_name"];
                    if (!data[index]["tab_chs_name"]) {
                      // data[index]["tab_chs_name"] = data[index]["phy_tab_name"];
                    }
                  }
                }
                //console.log('formatFieldList传入的data::', data);
                _this.formatFieldList(
                  objClone(data, 1),
                  paramObj.key,
                  paramObj.clrClass
                );
                if (
                  document.getElementsByClassName("tab-item dl_col").length > 1
                ){
                  //设置关联条件
                  _this.initFieldAssociation(paramObj.key, paramObj.parentKey,'',_this.curResourceTypeId, _this.realTabChsName);
                }
                _this.loading = false;
                return _this.queryDbColConf({
                  dbType: _this.dataSrcValue.resourceTypeId
                });
              } else {
                _this.$message.error("字段列表为空");
                _this.loading = false;
              }
            });
          } else {
            _this.loading = false;
            _this.fieldTypeList = {};
            _this.$message.error("数据库字段类型查询失败");
          }
        })
        .catch(function(error) {
          console.error(error);
          // _this.$message.error("字段详情加载失败");
        })
        .finally(() => {
          _this.loadingFieldTab = false;
        });
    },
    deleteTopoItem() {
      this.delFromEntityDataById(this.toDelItem.item);
      this.toDelItem = null;
      this.deleteDialog = false;
    },
    delFromEntityDataById(delItem) {
      //删除字段
      if (delItem.tab_alias == this.entityData[0].tab_alias) {
        //全部删除
        this.table1DataOri = [];
        this.table2DataOri = [];
        this.allFieldsMap.clear();
        if (this.topoTabActive.indexOf("-") > -1) this.updateTopoTabActive("");
        // 清空过滤字段
        this.rule_group_list = [];
      } else {
        var tabArr = this.getRelTabs(delItem); //用于删除下方字段用
        for (let index = 0; index < tabArr.length; index++) {
          this.table1DataOri = this.table1DataOri.filter(item => {
            return item.tab_alias != tabArr[index].tab_alias;
          });
          this.table2DataOri = this.table2DataOri.filter(item => {
            return item.tab_alias != tabArr[index].tab_alias;
          });
          this.allFieldsMap.delete(tabArr[index].tab_alias);
          // 删除对应表的过滤字段
          if (this.rule_group_list.length > 0) {
            this.rule_group_list[0].children = this.rule_group_list[0].children.filter(
              ruleItem => {
                return ruleItem.tab_alias != tabArr[index].tab_alias;
              }
            );
          }
        }
        // 删除相关的计算字段
        this.table2DataOri = this.table2DataOri.filter(valItem => {
          let flag1 = true;
          if (valItem.is_calcul != "0") {
            for (let index = 0; index < tabArr.length; index++) {
              if (
                typeof valItem.col_fun_exp.indexOf == "function" &&
                valItem.col_fun_exp.indexOf(tabArr[index].tab_alias) > -1 //tab_alias  tab_id
              ) {
                flag1 = false;
                break;
              }
            }
          }
          return flag1;
        });
        var that = this;
        var temArr = tabArr.filter(item => {
          return that.topoTabActive.indexOf(item.tab_id);
        });
        if (temArr.length > 0) this.updateTopoTabActive("");
      }
      this.updatefieldTab(1);
      this.updatefieldTab(2);

      const findUIDObj = (tab_alias, arr) => {
        if (!arr) return;
        const idx = arr.findIndex(obj => obj.tab_alias === tab_alias);
        if (idx > -1) return [arr, idx];
        for (const obj of arr) {
          const result = findUIDObj(tab_alias, obj.tab_rel_list);
          if (result) return result;
        }
      };
      const [arr, idx] = findUIDObj(delItem.tab_alias, this.entityData) || [];
      if (arr) {
        arr.splice(idx, 1); // Remove object from its parent array
      }
    },
    //获取对象里所有的tab_id
    getRelTabs(item) {
      var tabArr = [];
      var oriArr = this.treeJsonToArray([item]);
      for (let index = 0; index < oriArr.length; index++) {
        tabArr.push({
          tab_alias: oriArr[index].tab_alias,
          tab_id: oriArr[index].tab_id
        });
      }
      return tabArr;
    },
    // 树形结构数据转单层数组形式
    treeJsonToArray(nodes) {
      var r = [];
      if (Array.isArray(nodes)) {
        for (var i = 0, l = nodes.length; i < l; i++) {
          var copyNode = nodes[i];
          r.push({
            tab_id: copyNode.tab_id,
            tab_alias: copyNode.tab_alias,
            phy_tab_name: copyNode.phy_tab_name,
            rel_tab_id: copyNode.rel_tab_id,
            rel_tab_alias: copyNode.rel_tab_alias,
            join_type: copyNode.join_type,
            tab_join_exp_list: objDeepCopy(copyNode.tab_join_exp_list || []),
            color: copyNode.color,
            tab_schema: copyNode.tab_schema || ''
          });
          if (
            Array.isArray(copyNode["tab_rel_list"]) &&
            copyNode["tab_rel_list"].length > 0
          ) {
            // 若存在tab_rel_list则递归调用，把数据拼接到新数组中，并且删除该tab_rel_list
            var copyTabRelList = [];
            for (
              let index = 0, len2 = copyNode["tab_rel_list"].length;
              index < len2;
              index++
            ) {
              var element = copyNode["tab_rel_list"][index];
              copyTabRelList.push({
                tab_id: element.tab_id,
                tab_alias: element.tab_alias,
                phy_tab_name: element.phy_tab_name,
                rel_tab_id: copyNode.tab_id,
                rel_tab_alias: copyNode.tab_alias,
                join_type: element.join_type,
                tab_join_exp_list: objDeepCopy(element.tab_join_exp_list || []),
                tab_rel_list: objDeepCopy(element.tab_rel_list || []),
                color: element.color,
                tab_schema: element.tab_schema || ''
              });
            }
            r = r.concat(this.treeJsonToArray(copyTabRelList));
          }
          delete nodes[i]["tab_rel_list"];
        }
      }
      return r;
    },
    // 数组转树形结构数据（原理即为通过设置tab_id为key值，再通过rel_tab_id去找这个key是否一样，一样则为这数据的子级数据）
    arrayToTreeJson(treeArray) {
      var r = [];
      var tmpMap = {};
      for (var i = 0, l = treeArray.length; i < l; i++) {
        // 以每条数据的id作为obj的key值，数据作为value值存入到一个临时对象里面
        tmpMap[treeArray[i]["tab_alias"]] = treeArray[i]; //tab_id  "id"
      }
      var key;
      for (i = 0, l = treeArray.length; i < l; i++) {
        if (treeArray[i]["rel_tab_alias"])
          key = tmpMap[treeArray[i]["rel_tab_alias"]];
        //var
        else if (
          treeArray[i].tab_join_exp_list &&
          treeArray[i].tab_join_exp_list.length > 0
        ) {
          key = tmpMap[treeArray[i].tab_join_exp_list[0]["rel_tab_alias"]]; //var
        }
        //循环每一条数据的pid，假如这个临时对象有这个key值，就代表这个key对应的数据有children，需要Push进去
        //如果这一项数据属于哪个数据的子级
        var arrItem = objDeepCopy(treeArray[i]);
        if (arrItem["tab_rel_list"] == undefined) arrItem["tab_rel_list"] = [];
        if (key) {
          //如果没有treeArray[i]

          // 如果这个数据没有children
          if (!key["tab_rel_list"]) {
            key["tab_rel_list"] = [];
            key["tab_rel_list"].push(treeArray[i]);
            // 如果这个数据有children
          } else {
            key["tab_rel_list"].push(treeArray[i]);
          }
        } else {
          //如果没有这个Key值，就代表找不到属于哪个数据，那就代表没有父级,直接放在最外层
          r.push(treeArray[i]);
        }
      }
      return r;
    },
    cloneTabItem({
      tab_id,
      phy_tab_name,
      tab_chs_name,
      rel_tab_id,
      join_type,
      tab_schema,
      tab_join_exp_list

    }) {
      this.realTabChsName.push(tab_chs_name);// 将每一次拖入中文名称存入集合中
      let len = document.getElementsByClassName("tab-icon").length || 0;
      var colorClass = "";
      if (len < 8) {
        if (
          document.getElementsByClassName("tab-icon icon-A10465_Form clr" + len)
            .length == 0
        ) {
          colorClass = "clr" + len;
        } else {
          for (let index = 0; index < COLOR_ARRAY.length; index++) {
            if (
              document.getElementsByClassName(
                "tab-icon icon-A10465_Form " + COLOR_ARRAY[index]
              ).length == 0
            ) {
              colorClass = COLOR_ARRAY[index];
              break;
            }
          }
        }
      } else {
        len++;
        var remainder = len % 8;
        var multiple = (len - remainder) / 8;
        multiple++;
        for (let index = 0; index < COLOR_ARRAY.length; index++) {
          if (
            document.getElementsByClassName(
              "tab-icon icon-A10465_Form " + COLOR_ARRAY[index]
            ).length < multiple
          ) {
            colorClass = COLOR_ARRAY[index];
            break;
          }
        }
      }
      this.tabAliasCounter++;
      let falg = "1" ;  //默认显示
      if(!this.isShowDiv || this.dataSrcValue.isDemo === '1'){  //localdb
        falg = "0"
      }
      return {
        tab_id: tab_id,
        phy_tab_name: phy_tab_name,
        rel_tab_id: rel_tab_id,
        join_type: join_type,
        tab_join_exp_list: [],
        tab_rel_list: [],
        tab_alias: "t" + this.tabAliasCounter,
        color: colorClass,
        tab_schema: tab_schema,
        tab_chs_name:tab_chs_name,
        flag:falg
      };
    },
    //设置关联条件
    initFieldAssociation(key, parentKey, isResetTabRel,rid,tabChsName) {
      var entityDataList = this.treeJsonToArray(objDeepCopy(this.entityData));

      for (let index0 = 0; index0 < entityDataList.length; index0++) {
        entityDataList[index0]["tab_rel_list"] = [];
        if(rid === 'localdb' || this.dataSrcValue.isDemo === '1'){ //本地数据库和案例数据库
           entityDataList[index0]["flag"] = "0";
           entityDataList[index0]["tab_chs_name"] = tabChsName[index0];
        }else{
           entityDataList[index0]["flag"] = "1";
           entityDataList[index0]["tab_chs_name"] = tabChsName[index0];
        }
      }
      var childTabFields = this.allFieldsMap.get(key) || [];
      var parentTabFields = this.allFieldsMap.get(parentKey) || [];
      var join_exp_list = [];
      for (let index1 = 0; index1 < childTabFields.length; index1++) {
        for (let index2 = 0; index2 < parentTabFields.length; index2++) {
          if (
            childTabFields[index1].col_id.toLocaleLowerCase() ==
            parentTabFields[index2].col_id.toLocaleLowerCase()
          ) {
            join_exp_list.push({
              tab_id: childTabFields[index1].tab_id, //本表id
              tab_alias: childTabFields[index1].tab_alias, //本表别名
              col_id: childTabFields[index1].col_id, //本表字段id
              col_id_exp: childTabFields[index1].col_id, //exp放空
              rel_tab_id: parentTabFields[index2].tab_id, //上游表id
              rel_tab_alias: parentTabFields[index2].tab_alias, //上游表别名
              rel_col_id: parentTabFields[index2].col_id, //上游字段id
              rel_col_id_exp: parentTabFields[index2].col_id //exp放空
            });
            break;
          }
        }
      }

      for (let index = 0; index < entityDataList.length; index++) {
        if (entityDataList[index].tab_alias == key) {
          entityDataList[index].tab_join_exp_list = join_exp_list;
          if (isResetTabRel) {
            //在拓扑图区域内移动，关联关系重置为左连接，然后重新建立joinexplist，下面勾选的字段不变
            entityDataList[index].rel_tab_id = isResetTabRel.parentTabId;
            entityDataList[index].rel_tab_alias = isResetTabRel.parentKey;
            entityDataList[index].join_type = "2";
          }
        }
      }
      this.entityData = this.arrayToTreeJson(entityDataList);

    },
    /**
     * @PARAM
     * isForPreview 是否是预览数据时的数据构造
     * 如果是直连数据库的预览数据时的数据构造，tab_id 和rel_tab_id都用别名
     * */

    formatDataBeforeSave(isForPreview = false) {
      const field_lists = this.table1DataOri.concat(this.table2DataOri);
      var entity_lists = [],
        col_lists = [],
        usedTabList = [];
      var oriEntityArr = this.treeJsonToArray(objDeepCopy(this.entityData));
      for (let index = 0; index < oriEntityArr.length; index++) {
        let tab_join_exp_list1 = objDeepCopy(
          oriEntityArr[index].tab_join_exp_list
        );
        // if (this.curResourceTypeId === "database") {
        //   //直连数据库不要rel_tab_id
        //   tab_join_exp_list1.forEach(item => {
        //     delete item.tab_id;
        //     delete item.rel_tab_id;
        //   });
        // }
        // 如果关联字段是计算字段(即有用[]扩起来的字段表达式)，则保存前要把col_id改成里面用到到第一个字段的col_id
        tab_join_exp_list1.forEach((item, index) => {
          if (item.col_id.indexOf("[") > -1 && item.col_id_exp) {
            let res1 = this.getFirColId(item.col_id_exp, item.tab_alias);
            tab_join_exp_list1[index].col_id = res1 ? res1 : item.col_id;
          }
          if (item.rel_col_id.indexOf("[") > -1 && item.rel_col_id_exp) {
            let res2 = this.getFirColId(
              item.rel_col_id_exp,
              item.rel_tab_alias
            );
            tab_join_exp_list1[index].rel_col_id = res2
              ? res2
              : item.rel_col_id;
          }
        });
        let entityItem1 = {
          frame_id: oriEntityArr[index].frame_id,
          join_type: oriEntityArr[index].join_type,
          phy_tab_name: oriEntityArr[index].phy_tab_name,
          rel_phy_tab_name: oriEntityArr[index].rel_phy_tab_name,
          rel_tab_chs_name: oriEntityArr[index].rel_tab_chs_name,
          rel_tab_id: oriEntityArr[index].rel_tab_id, //直连数据库不传tabid
          // rel_tab_alias: oriEntityArr[index].rel_tab_alias || "",
          subject_id: oriEntityArr[index].subject_id,
          subject_name: oriEntityArr[index].subject_name,
          tab_alias: oriEntityArr[index].tab_alias,
          tab_chs_name: oriEntityArr[index].tab_chs_name,
          tab_id: oriEntityArr[index].tab_id, //直连数据库不传tabid
          tab_join_exp_list: tab_join_exp_list1,
          tab_schema: oriEntityArr[index].tab_schema || ''
        };
        if (this.curResourceTypeId === "database" || this.curResourceTypeId === "localdb") {
          entityItem1["tab_chs_name"] = entityItem1["tab_chs_name"]
            ? entityItem1["tab_chs_name"]
            : entityItem1["phy_tab_name"];
          entityItem1["rel_tab_chs_name"] = entityItem1["rel_tab_chs_name"]
            ? entityItem1["rel_tab_chs_name"]
            : entityItem1["rel_phy_tab_name"];
          entityItem1["rel_tab_alias"] =
            tab_join_exp_list1.length > 0
              ? tab_join_exp_list1[0].rel_tab_alias
              : "";
        }
        // else if (this.curResourceTypeId === "dataasset") {
        //   entityItem1["rel_tab_id"] = oriEntityArr[index].rel_tab_id;
        //   entityItem1["tab_id"] = oriEntityArr[index].tab_id;
        // }
        entity_lists.push(entityItem1);
        if (this.curResourceTypeId === "database" || this.curResourceTypeId === "localdb") {
          //直连数据库需要构造usedTabList
          /**
           * dataCycle数据周期：1日、2月
            tabType：实体来源类型（2：业务数据表，7：配置数据表）
            securityLevel： 1:一级、2:二级、3三级、4:四级
        */
          let tabColList = [];
          let allCols =
            this.allFieldsMap.get(oriEntityArr[index].tab_alias) || [];
          for (let index2 = 0; index2 < allCols.length; index2++) {
            const fieldItem1 = allCols[index2];
            tabColList.push({
              colId: fieldItem1.col_id,
              colName: fieldItem1.col_name,
              colChsName: fieldItem1.col_chs_name,
              colType: fieldItem1.col_type,
              colLength: fieldItem1.col_length,
              colPrecise: fieldItem1.col_precise,
              unit: fieldItem1.unit,
              dataDype: fieldItem1.data_type || "5",
              securityLevel: "4", //1:一级、2:二级、3三级、4:四级
              dimId: fieldItem1.dim_id,
              dimLevelId: fieldItem1.dim_level_id,
              is_null: "",
              alignType: "",
              isPartition: "",
              isPrimaryKey: "",
              isForeignKey: "",
              colRemark: "",
              colBusInfo: "",
              colTechCaliber: ""
            });
          }
          let dbUser = "",
            dbName = "";
          let userArr = (this.dataSrcValue.paramList || []).filter(item0 => {
            return item0.paramName === "user_name";
          });
          let dbArr = (this.dataSrcValue.paramList || []).filter(item0 => {
            return item0.paramName === "db_name";
          });

          if (userArr.length > 0) {
            dbUser = userArr[0].paramValue;
          }
          if (dbArr.length > 0) {
            dbName = dbArr[0].paramValue;
          }

          let disposeObj={
            disposeType: this.dataSrcValue.dsId,
            connId: this.dataSrcValue.dsId,
            dbUser: dbUser,
            storageType: this.curDsType,
            entityType:this.curDsType,
            dbName: dbName,
            schemaName: ''
          }
          let sign = 'dbUser';
          if(this.dataSrcValue){
            let dsType = (this.dataSrcValue.dsType || "").toLowerCase();
            if(dsType.includes('mysql') || dsType.includes('gbase')){
              sign = 'dbName';
            }else if(dsType.includes('postgresql') || dsType.includes('greenplum') || dsType.includes('sqlserver') ||  dsType.includes('vertica')){  //pg库
              disposeObj["schemaName"] = oriEntityArr[index].tab_schema || "";
            }
          }
          disposeObj[sign] = oriEntityArr[index].tab_schema || "";
          let tabChsName = "";//表中文名
          if(this.curResourceTypeId === "localdb"){  //本地数据库
             tabChsName = this.realTabChsName[index];
          }else{  //自定义数据库
             tabChsName = oriEntityArr[index].tab_chs_name || oriEntityArr[index].phy_tab_name;
          }

          usedTabList.push({
            tabAlias: oriEntityArr[index].tab_alias,
            phyTabName: oriEntityArr[index].phy_tab_name,
            // tabChsName:
            //   oriEntityArr[index].tab_chs_name ||
            //   oriEntityArr[index].phy_tab_name,
            tabChsName:tabChsName,
            frameId: oriEntityArr[index].frame_id,
            tabClassId: "",
            tabPathId: "",
            dataCycle: "99", //数据周期：1日、2月
            tabType: "2", //实体来源类型（2：业务数据表，7：配置数据表）
            securityLevel: "4",
            tenantId: sessionStorage.getItem("tenant_id"),
            reqNo: "",
            tabInfoDesc: "",
            tabColList: tabColList,
            userName: oriEntityArr[index].tab_schema || "",
            disposeList: [disposeObj]
          });
        }
      }
      for (let index = 0; index < field_lists.length; index++) {
        let colItem1 = {
          af_id: field_lists[index].af_id,
          col_chs_name: field_lists[index].col_chs_name,
          col_fun_exp: field_lists[index].col_fun_exp,
          col_fun_exp_desc: field_lists[index].col_fun_exp_desc,
          col_id: field_lists[index].col_id,
          col_name: field_lists[index].col_name,
          col_type: field_lists[index].col_type,
          create_time: field_lists[index].create_time,
          create_user: field_lists[index].create_user,
          create_user_name: field_lists[index].create_user_name,
          dim_id: field_lists[index].dim_id,
          dim_level_id: field_lists[index].dim_level_id,
          dim_level_name: field_lists[index].dim_level_name,
          dim_name: field_lists[index].dim_name,
          element_id: field_lists[index].element_id,
          element_name: field_lists[index].element_name,
          element_type: field_lists[index].element_type,
          is_calcul: field_lists[index].is_calcul,
          is_show: field_lists[index].is_show,
          is_trans_dim: field_lists[index].is_trans_dim,
          order_id: field_lists[index].order_id,
          show_format: field_lists[index].show_format,
          source_format: field_lists[index].source_format,
          show_type: field_lists[index].show_type,
          tab_chs_name: field_lists[index].tab_chs_name,
          tab_col_id: field_lists[index].tab_col_id,
          tab_id: field_lists[index].tab_id, //直连数据库不传tabid
          tab_alias: field_lists[index].tab_alias,
          is_copy: field_lists[index].is_copy,
          phy_tab_name: field_lists[index].phy_tab_name,
          is_data_priv: field_lists[index].is_data_priv,
          encrypt_id: field_lists[index].encrypt_id,  //新增加密策略字段
          priv_tag: field_lists[index].priv_tag //标签权限privTagId
        };
        if (this.curResourceTypeId === "database" || this.curResourceTypeId === "localdb") {
          colItem1["isDataRight"] = "0";
        }
        // else if (this.curResourceTypeId === "dataasset") {
        //   colItem1["tab_id"] = field_lists[index].tab_id;
        // }
        // 判断是否包含聚合类计算字段
        if(isForPreview && colItem1.is_calcul === '2'){
          continue;
        }
        col_lists.push(colItem1);
      }

      if ((this.curResourceTypeId === "database" || this.curResourceTypeId === "localdb") && isForPreview) {
        //直连数据库 预览数据 没有tab_id，要把entity_lists里的tab_id都改成tab_alias
        entity_lists.forEach((item, index) => {
          entity_lists[index].tab_id = entity_lists[index].tab_alias;
          entity_lists[index].rel_tab_id = entity_lists[index].rel_tab_alias;
          if (
            entity_lists[index].tab_join_exp_list &&
            entity_lists[index].tab_join_exp_list.length > 0
          ) {
            entity_lists[index].tab_join_exp_list.forEach((item2, index2) => {
              entity_lists[index].tab_join_exp_list[index2].tab_id =
                item2.tab_alias;
              entity_lists[index].tab_join_exp_list[index2].rel_tab_id =
                item2.rel_tab_alias;
            });
          }
        });
        col_lists.forEach((item, index) => {
          col_lists[index].tab_id = col_lists[index].tab_alias;
        });
      }

      return {
        col_lists: col_lists,
        entity_lists: entity_lists,
        usedTabList: usedTabList
      };
    },
    formatSavedData(entityData, colsData) {
      let rawTabId = entityData.map(item=>{
        return item.tab_id;
      });
      if (this.curResourceTypeId === "database" || this.curResourceTypeId === "localdb") {
        //直连数据库，tab_id，rel_tab_id都对应改成物理表名，不然字段图标都颜色显示不对
        let upResult = this.alterTabIds(entityData, colsData);
        entityData = upResult.entityData;
        for(var i = 0 ;i <entityData.length;i++){
          if(this.curResourceTypeId === "localdb" || this.dataSrcValue.isDemo === '1'){
              entityData[i]["flag"] = "0";
          }else{
              entityData[i]["flag"] = "1";
          }
        }
        colsData = upResult.colsData;
      }
      this.rule_group_list = this.ruleListFormat(this.rule_group_list); //rule返回参数转保存参数
      var tabIdArr = [],
        tabInfoArr = [];
      for (let index = 0; index < entityData.length; index++) {
        let idx = index % 8;
        entityData[index]["tab_rel_list"] = [];
        entityData[index]["color"] = COLOR_ARRAY[idx];
        let phyTabName1 = entityData[index].tab_id;

        tabInfoArr.push({
          tab_id: phyTabName1,
          tabKey: entityData[index]["tab_alias"],
          iconClr: entityData[index]["color"]
        });
        // tabIdArr.push(phyTabName1);
        tabIdArr = rawTabId;
      }

      // 查找表别名已经到第几个数了
      var max = -1;
      for (let index = 0; index < entityData.length; index++) {
        const element = entityData[index];
        let number = element.tab_alias.match(/[0-9]+$/);
        if (number != null) {
          number = parseInt(number[0]);
          max = number > max ? number : max;
        }
      }
      this.tabAliasCounter = max + 1;
      this.entityData = this.arrayToTreeJson(entityData);

      for (let index = 0; index < colsData.length; index++) {
        let tabId = colsData[index].tab_id;
        let idx = 0;
        for (let index2 = 0; index2 < entityData.length; index2++) {
          if (entityData[index2].tab_id == tabId) {
            idx = index2;
            break;
          }
        }
        colsData[index]["iconClr"] = entityData[idx].color;
        if (
          !colsData[index]["col_type"] &&
          colsData[index]["is_calcul"] != "0"
        ) {
          //如果计算字段类型没查回来，用既定的字段类型
          colsData[index]["col_type"] =
            this.computedFieldCType[this.curDsType] || "";
        }
        // 如果之前保存的数据集，且完全没设过数据权限字段，则先给它设0
        if (
          !colsData[index]["is_data_priv"] &&
          colsData[index]["is_data_priv"] != 0
        ) {
          colsData[index]["is_data_priv"] = 0;
        }
      }
      this.classifyFields(colsData);
      for (var g = 0; g < colsData.length; g++) {
        var temp = colsData[g];
        if (temp.dim_id != null && temp.dim_id != "" && temp.dim_id != "null") {
          if (
            temp.dim_level_id != null &&
            temp.dim_level_id != "" &&
            temp.dim_level_id != "null"
          ) {
            // this.getDimRelation(colsData, temp, i);
          }
        }
      }
      // 查询所有字段信息
      this.queryFieldsOfTabs({
        tabInfoArr: tabInfoArr,
        tabIdArr: tabIdArr
      });
    },
    itemOnMove(evt) {
      // return false; — for cancel
      // return -1; — insert before target
      // return 1; — insert after target
      // 限制不能A连A
      if (
        evt.to &&
        evt.to.parentNode &&
        evt.to.parentNode.children &&
        evt.to.parentNode.children.length > 0 &&
        evt.draggedContext.element.tab_id ==
          evt.to.parentNode.children[0].getAttribute("tid")
      ) {
        return false;
      }
    },
    queryFieldsOfTabs(tabArr) {
      this.loading = true;
      let _this = this;
      let _param = {};
      let colListKey = "tab_col_list";
      if (this.curResourceTypeId === "dataasset") {
        _param.tab_id_list = tabArr.tabIdArr;
        _param.is_query_detail = "1";
        _param.ext_query_type = _this.entityType;
      } else {
        // _param.dsId = this.dataSrcValue.dsId;
        // _param.dsDbType = this.dataSrcValue.dsType;
        // _param.tableNames = tabArr.tabIdArr;
        // _param.tableSchema = this.schemaValue;
        // colListKey = "tabColList";
        _param.tab_id_list = tabArr.tabIdArr;
        _param.is_query_detail = "1";
        // _param.ext_query_type = _this.entityType;
      }
      _this
        .queryDbColConf({ dbType: _this.dataSrcValue.resourceTypeId })
        .then(response => {
          if (response.status == 200 && response.data.respResult == "1") {
            _this.fieldTypeList = response.data.respData || {};
            this.queryTbFields({  //回显查询字段
              param: _param
            }).then(function(response) {
              if (
                response.data.respResult == 1 &&
                response.data.respData &&
                response.data.respData.length >= tabArr.tabIdArr.length
              ) {
                // 有可能查出很多条记录需要过滤
                var allData = response.data.respData;
                for (let index = 0; index < tabArr.tabIdArr.length; index++) {
                  const element = allData.filter(item => {
                    return (
                      item.tab_id == tabArr.tabIdArr[index] ||
                      item.phyTabName == tabArr.tabIdArr[index]
                    );
                  });
                  if (element.length > 0) {
                    let colData = element[0][colListKey] || [];
                    for (let index2 = 0; index2 < colData.length; index2++) {
                      colData[index2]["tab_chs_name"] =
                        element[0].tab_chs_name || element[0].tabAlias || "";
                      colData[index2]["phy_tab_name"] =
                        element[0].phy_tab_name || element[0].phyTabName || "";
                      if (_this.curResourceTypeId === "database" || _this.curResourceTypeId === "localdb") {
                        colData[index2]["tab_id"] =
                          colData[index2]["phy_tab_name"];
                      }
                    }
                    _this.formatFieldList(
                      objClone(colData, 1),
                      tabArr.tabInfoArr[index].tabKey,
                      tabArr.tabInfoArr[index].iconClr,
                      false
                    );
                  }
                }
              } else {
                _this.$message.error("字段列表查询失败");
              }
              _this.loading = false;
            });
          } else {
            _this.loading = false;
            _this.fieldTypeList = {};
            _this.$message.error("数据库字段类型查询失败");
          }
        })
        .catch(function(error) {
          console.error(error);
          // _this.$message.error("字段列表查询失败");
        })
        .finally(() => {

        });
    },
    getFieldRowIdx(type, row) {
      var idx = -1;
      switch (type) {
        case 1:
          for (let index = 0; index < this.table1DataOri.length; index++) {
            const element = this.table1DataOri[index];
            if (
              element[this.SHOW_TYPE_ARR[element.show_type]] ==
              row[this.SHOW_TYPE_ARR[row.show_type]]
            ) {
              idx = index;
              break;
            }
          }
          break;
        case 2:
          for (let index = 0; index < this.table2DataOri.length; index++) {
            const element = this.table2DataOri[index];
            if (
              element[this.SHOW_TYPE_ARR[element.show_type]] ==
              row[this.SHOW_TYPE_ARR[row.show_type]]
            ) {
              idx = index;
              break;
            }
          }
          break;
        default:
          break;
      }
      return idx;
    },
    /**
     * @param
     * type:1.showCurFields
     *      2.HandleCheckAllChange
     *      3.HandleCheckedFieldsChange
     * param 对应方法的参数
     */
    handleTabCkEvent(paramObj) {
      switch (paramObj.type) {
        case 1:
          this.showCurFields(paramObj.param);
          break;
        case 2:
          this.fieldCheckedChange(paramObj.param);
          break;
        case 3:
          this.fieldCheckAllChange(paramObj.param);
          break;
        default:
          break;
      }
    },
    // 拓扑图区域 实体图标点击展开所属字段列表
    showCurFields(item) {
      let fieldDatas1 = objDeepCopy(
        this.allFieldsMap.get(item.tab_alias) || []
      );
      let checkedArr = [];
      let table1Ori = this.table1DataOri.filter(fieldItem => {
        return fieldItem.tab_alias == item.tab_alias;
      });
      let table2Ori = this.table2DataOri.filter(fieldItem => {
        return fieldItem.tab_alias == item.tab_alias;
      });
      let selectedData = table1Ori.concat(table2Ori);
      for (let index = 0; index < fieldDatas1.length; index++) {
        const element = fieldDatas1[index];
        for (let index2 = 0; index2 < selectedData.length; index2++) {
          if (
            selectedData[index2].col_id == element.col_id &&
            selectedData[index2].is_copy != "1" &&
            selectedData[index2].is_calcul == "0"
          ) {
            //剔除复制字段和计算字段
            /**
               * (selectedData[index2].is_copy == "" ||
               selectedData[index2].is_copy == undefined ||
               selectedData[index2].is_copy == null ||
               selectedData[index2].is_copy == "0")
               */
            checkedArr.push(element.col_chs_name || element.col_name);
          }
        }
      }

      // 对于计算字段，如果参与的字段都属于同一张表，则都加进来
      let fieldList1 = this.getComputedFieldByAlias(item.tab_alias);
      fieldList1.forEach(newField => {
        //展示只有这个表参与的计算字段
        checkedArr.push(newField.element_name);
        fieldDatas1.push(newField);
      });
      this.updateFilterTabfieldText("");
      this.updateFieldDatasOri(fieldDatas1);
      this.updateFieldDatas(fieldDatas1);
      this.updateCheckedFields(checkedArr);
      var checkedCount = checkedArr.length;
      this.updateIsIndeterminate(
        checkedCount > 0 && checkedCount < fieldDatas1.length
      );
      this.updateCheckAll(checkedCount === fieldDatas1.length);
    },
    fieldCheckedChange(param) {
      if (param.checked) {
        switch (param.data.element_type) {
          case 1:
            this.table1DataOri.push(param.data);
            this.updatefieldTab(1);
            break;
          case 2:
            param.data.show_type = "2";//设置为描述名称(默认添加一个字段时候生效)
            this.table2DataOri.push(param.data);
            this.updatefieldTab(2);
            break;
          default:
            break;
        }
      } else {
        // 如果勾选的是计算字段，要先提示
        if (param.data.is_calcul != "0") {
          document.querySelector("#app").click();
          // this.hideMenu();
          let checkedArr1 = objDeepCopy(this.checkedFields);
          checkedArr1.push(param.data.element_name);
          this.updateCheckedFields(checkedArr1);
          if (this.ifConnUseCpField(param.data)) {
            this.openMessage("warning", this.cpFieldDelTip);
            return;
          }
          this.delCpField(param.data, 1);
          return;
        }

        //补充判断，如果该字段有关联计算字段，需要先提示
        if (
          param.data.is_copy != "1" &&
          this.checkIfNumberField(param.data.col_type)
        ) {
          let relArr = this.getRelComputedField(param.data);
          if (relArr.length > 0) {
            var checkedArr = objDeepCopy(this.checkedFields);
            checkedArr.push(param.data.col_chs_name || param.data.col_name);
            this.updateCheckedFields(checkedArr);
            this.showFieldCompDelTip(
              param.data.col_chs_name || param.data.col_name,
              relArr
            );
            return false;
          }
        }
        var idx = -1;
        for (let index = 0; index < this.table1DataOri.length; index++) {
          const element = this.table1DataOri[index];
          if (
            param.data.tab_alias == element.tab_alias &&
            param.data.col_id == element.col_id &&
            element.is_copy != "1"
          ) {
            idx = index;
          }
        }
        if (idx > -1) {
          this.table1DataOri.splice(idx, 1);
          this.updatefieldTab(1);
        } else {
          for (let index = 0; index < this.table2DataOri.length; index++) {
            const element = this.table2DataOri[index];
            if (
              param.data.tab_alias == element.tab_alias &&
              param.data.col_id == element.col_id &&
              element.is_copy != "1"
            ) {
              idx = index;
            }
          }
          this.table2DataOri.splice(idx, 1);
          this.updatefieldTab(2);
        }
      }
    },
    fieldCheckAllChange(param) {
      var checkedArr = objDeepCopy(this.checkedFields);
      switch (param) {
        case true:
          for (let index = 0; index < this.fieldDatas.length; index++) {
            const element = this.fieldDatas[index];
            let label = element.col_chs_name || element.col_name;
            if (this.checkedFields.indexOf(label) == -1) {
              this.fieldCheckedChange({
                checked: true,
                data: element
              });
              checkedArr.push(label);
            }
          }
          this.updateIsIndeterminate(false);
          this.updateCheckedFields(checkedArr);
          break;
        case false:
          //取消勾选前先判断，如果里面的字段有关联到计算字段，需要先提示
          var unCheckFlag = false;
          for (let index = 0; index < this.fieldDatas.length; index++) {
            const element = this.fieldDatas[index];
            if (
              element.is_copy != "1" &&
              this.checkIfNumberField(element.col_type)
            ) {
              let relArr = this.getRelComputedField(element);
              if (relArr.length > 0) {
                unCheckFlag = true;
                this.showFieldCompDelTip(
                  element.col_chs_name || element.col_name,
                  relArr
                );
                break;
              }
            }
          }
          if (unCheckFlag) {
            this.updateCheckAll(true);
            return false;
          }

          for (let index = 0; index < this.fieldDatas.length; index++) {
            const element = this.fieldDatas[index];
            this.fieldCheckedChange({
              checked: false,
              data: element
            });
            let label =
              element.is_calcul == "0"
                ? element.col_chs_name || element.col_name
                : element.element_name;
            let delIdx = checkedArr.indexOf(label);
            if (delIdx > -1) {
              checkedArr.splice(delIdx, 1);
            }
          }
          this.updateIsIndeterminate(false);
          this.updateCheckedFields(checkedArr);
          break;
        default:
          break;
      }
    },
    delFieldRow(index, row, type) {
      if (
        row.is_copy != "1" &&
        row.is_calcul == "0" &&
        this.checkIfNumberField(row.col_type)
      ) {
        let relArr = this.getRelComputedField(row);
        if (relArr.length > 0) {
          this.showFieldCompDelTip(
            row[this.SHOW_TYPE_ARR[row.show_type]],
            relArr
          );
          this.hideMenu();
          return;
        }
      }

      if (row.is_calcul != "0") {
        this.hideMenu();
        if (this.ifConnUseCpField(row)) {
          this.openMessage("warning", this.cpFieldDelTip);
          return;
        }

        //删除计算字段要提示
        this.delCpField(row, 2, index);
        return;
      }
      if (row.priv_tag) {
        this.privTagSetList.pop(row.priv_tag);
      }

      var idx = -1;
      if (this.fieldFilterText.trim() == "") idx = index;
      else if (type == 1) {
        idx = this.table1DataOri.indexOf(row);
      } else {
        idx = this.table2DataOri.indexOf(row);
      }
      switch (type) {
        case 1: //左边
          this.table1DataOri.splice(idx, 1);
          this.updatefieldTab(1);
          break;
        case 2: //右边
          this.table2DataOri.splice(idx, 1);
          this.updatefieldTab(2);
          break;
        default:
          break;
      }
      this.hideMenu();
    },
    saveConnSetting(data) {
      var entityDataList = this.treeJsonToArray(objDeepCopy(this.entityData));
      let tabChsName = this.realTabChsName;
      let rid = this.curResourceTypeId;
      for (let index0 = 0; index0 < entityDataList.length; index0++) {
        entityDataList[index0]["tab_rel_list"] = [];
      }
      for (let index = 0; index < entityDataList.length; index++) {
        if (entityDataList[index].tab_alias == data.key) {
           entityDataList[index].tab_join_exp_list = data.joinExpList;
           entityDataList[index].join_type = data.joinType;
        }
      }

      //设置要显示中文表名
       for (let index6 = 0; index6 < entityDataList.length; index6++) {
            if(rid === 'localdb' || this.dataSrcValue.isDemo === '1'){ //本地数据库和案例数据库
              entityDataList[index6]["flag"] = "0";
              entityDataList[index6]["tab_chs_name"] = tabChsName[index6];
            }
            else{
              entityDataList[index6]["flag"] = "1";
              entityDataList[index6]["tab_chs_name"] = tabChsName[index6];
          }
      }
      this.entityData = this.arrayToTreeJson(entityDataList);

    },
    addConnRow() {
      var joinExpList = objDeepCopy(this.joinExpList);
      joinExpList.push({
        tab_id: this.curSelConnInfo.child.tab_id, //本表id
        tab_alias: this.curSelConnInfo.child.tab_alias, //本表别名
        col_id: "", //本表字段id
        col_id_exp: "", //exp放空
        rel_tab_id: this.curSelConnInfo.parent.tab_id, //上游表id
        rel_tab_alias: this.curSelConnInfo.parent.tab_alias, //上游表别名
        rel_col_id: "", //上游字段id
        rel_col_id_exp: "" //exp放空
      });
      this.updateJoinExpList(joinExpList);
      let div = this.$refs["conlListScroll"].$refs["wrap"]; //滚动条自动滚到底部
      this.$nextTick(() => {
        div.scrollTop = div.scrollHeight;
      });
    },
    clearConnSet() {
      // var joinExpList = objDeepCopy(this.joinExpList);
      // for (let index = 0; index < joinExpList.length; index++) {
      //   joinExpList[index].col_id = "";
      //   joinExpList[index].rel_col_id = "";
      // }
      let joinExpList = [];
      this.updateJoinExpList(joinExpList);
    },
    saveConnSet() {
      var joinExpList = this.joinExpList.filter(item => {
        return item.col_id != "" && item.rel_col_id != "";
      });
      for (let index = 0; index < joinExpList.length; index++) {
        joinExpList[index].col_id_exp = joinExpList[index].col_id;
        joinExpList[index].rel_col_id_exp = joinExpList[index].rel_col_id;
      }
      this.saveConnSetting({
        joinExpList: joinExpList,
        joinType: this.activeConn,
        key: this.curSelConnInfo.child.tab_alias
      });
      this.connPopVisible = false;
    },
    deleteSingleJoinSet(index) {
      this.joinExpList.splice(index, 1);
    },
    openDimChooseDialog(index, row) {
      this.searchForm.pageName = "";
      var idx = -1;
      if (this.fieldFilterText.trim() == "") idx = index;
      else idx = this.table1DataOri.indexOf(row);
      curTableItem.row = row;
      curTableItem.index = idx;
      this.pageQuery.start = 1;
      this.queryDimInfoList();
      // this.table1DataOri.splice(idx, 1);
      // this.updatefieldTab(1);
      this.hideMenu();
    },
    cancelDimBind(index, row) {
      var idx = -1;
      if (this.fieldFilterText.trim() == "") idx = index;
      else idx = this.table1DataOri.indexOf(row);
      row.dim_id = "";
      row.dim_name = "";
      row.dim_level_id = "";
      row.dim_level_name = "";
      this.$set(this.table1DataOri, idx, row);
      this.updatefieldTab(1);
      this.hideMenu();
    },
    pageChange(val) {
      this.pageQuery.start = val;
      this.queryDimInfoList();
    },
    sizeChange(val) {
      this.pageQuery.pageCount = val;
      this.pageQuery.start = 1;
      this.queryDimInfoList();
    },
    /*
    维层查询
    联合维度查询
    */
    queryDimInfoList() {
      var _this = this;
      this.dimDialogVisible = true;
      this.dimLoading = true;

      let key = (this.searchForm.pageName || "").trim();
      let url = this.datasetUrl + "/dataAssetDim/getDimLevelList";
      let param = {
        dim_level_name: key,
        start: this.pageQuery.start,
        page_count: this.pageQuery.pageCount
      };
      if (
        this.curResourceTypeId === "database" ||
        this.curResourceTypeId === "dataasset" ||
        this.curResourceTypeId === "localdb"
      ) {
        //直连数据库的数据源要带systemid，即只能查到新建的维度维层信息，而资产的是可以看到所有的
        url = this.edcPubMsUrl + "/dataAssetDim/getDimLevelList";
        param = {
          dimLevelName: key,
          dimName: this.myDimName,
          start: this.pageQuery.start,
          pageCount: this.pageQuery.pageCount
        };
      }
      service({
        maskOff: true,
        url: url,
        method: "post",
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id") || "9999012",
          "X-TenantId": window.sessionStorage.getItem("tenant_id") + "" || "34234234",
          "X-SystemId": this.curResourceTypeId === "dataasset" ? "" : this.defaultSystemId
        }
      })
        .then(function(response) {
          if (
            response.data.respResult == 1 &&
            response.data.respData &&
            response.data.respData.length > 0
          ) {
            _this.dimTotal = response.data.dataTotalCount;
            let data = objDeepCopy(response.data.respData);
            if (
              _this.curResourceTypeId === "database" ||
              _this.curResourceTypeId === "dataasset" ||
              _this.curResourceTypeId === "localdb"
            ) {
              data = objClone(response.data.respData, 2); //字段名称驼峰改下划线格式
            }
            _this.dimData = data;
            //将当前绑定的维层高亮
            if (
              curTableItem.row &&
              curTableItem.row.dim_level_id &&
              curTableItem.row.dim_id
            ) {
              let curDimId = curTableItem.row.dim_id,
                curDimLevelId = curTableItem.row.dim_level_id;
              let curRow = data.filter(item => {
                return (
                  item.dim_level_id === curDimLevelId &&
                  item.dim_id === curDimId
                );
              });
              let currentRowInfo = "";
              if (curRow.length > 0) {
                currentRowInfo = curRow[0];
              }
              setTimeout(() => {
                _this.$refs.dimTable.setCurrentRow(currentRowInfo);
              }, 0);
            }
          } else {
            _this.$message.warning("维度列表为空");
            _this.dimData = [];
            _this.dimTotal = 0;
          }
        })
        .catch(function(error) {
          console.error(error);
          _this.dimLoading = false;
          // _this.$message.error("维度列表加载失败");
        })
        .finally(() => {
          _this.dimLoading = false;
        });
    },

    /**
     * 双击获取当前维度
     */
    getDimInfo(event) {
      var row = objDeepCopy(curTableItem.row);
      row.dim_id = event.dim_id;
      row.dim_level_id = event.dim_level_id;
      row.dim_level_name = event.dim_level_name;
      row.dim_name = event.dim_name;
      this.$set(this.table1DataOri, curTableItem.index, row);
      this.updatefieldTab(1);
      this.dimDialogVisible = false;
    },
    //行拖拽
    rowDrop() {
      const _this = this;
      //维度行拖拽
      const tbody = document.querySelector(
        "#table1 .vxe-table--body tbody"
      );
      Sortable.create(tbody, {
        //拖拽完毕之后发生该事件
        onEnd({ newIndex, oldIndex }) {
          const currRow = _this.table1DataOri.splice(oldIndex, 1)[0];
          _this.table1DataOri.splice(newIndex, 0, currRow);
          _this.updatefieldTab(1);
        }
      });
      //度量行拖拽
      const tbody2 = document.querySelector(
        "#table2 .vxe-table--body tbody"
      );
      Sortable.create(tbody2, {
        //拖拽完毕之后发生该事件
        onEnd({ newIndex, oldIndex }) {
          const currRow = _this.table2DataOri.splice(oldIndex, 1)[0];
          _this.table2DataOri.splice(newIndex, 0, currRow);
          _this.updatefieldTab(2);
        }
      });
    },
    setTimeFormat() {
      var flag = false;
      var idx = -1;
      if (this.fieldFilterText.trim() == "") idx = curTableItem.index;
      else idx = this.table1DataOri.indexOf(curTableItem.row);
      var row = objDeepCopy(curTableItem.row);
      switch (this.dateRadio) {
        case "0": //默认
          row.show_format = "";
          flag = true;
          break;
        case "1": //日期型
          this.$refs["dateConfigForm"].validate(valid => {
            if (valid) {
              flag = true;
              row.source_format = this.dateConfigForm.sourceFormat;
              if (this.dateConfigForm.targetFormat == "-1")
                row.show_format = this.dateConfigForm.sourceFormat;
            } else {
              return false;
            }
          });

          break;
        default:
          break;
      }
      if (flag) {
        this.$set(this.table1DataOri, idx, row);
        this.updatefieldTab(1);
        this.timeFormatDialog = false;
      }
    },
    showTimeFormatPop(index, row) {
      if (
        row.show_format == null ||
        row.show_format == "null" ||
        row.show_format.trim() == ""
      ) {
        this.dateRadio = "0";
        this.dateConfigForm.sourceFormat = "";
      } else {
        this.dateRadio = "1";
        this.dateConfigForm.sourceFormat = row.source_format;
      }
      curTableItem.row = row;
      curTableItem.index = index;
      this.timeFormatDialog = true;
    },
    cancelTimeFormat() {
      if (
        this.$refs["dateConfigForm"] &&
        typeof this.$refs["dateConfigForm"].resetFields == "function"
      )
        this.$refs["dateConfigForm"].resetFields();
      this.timeFormatDialog = false;
    },
    updateTabsRelation(paramsObj) {
      this.initFieldAssociation(paramsObj.key, paramsObj.parentKey, paramsObj);
    },
    chooseAttrRadio(val) {
      this.fieldAttrFormRules = {
        alias: [{ validator: this.checkAlias, trigger: "blur" }]
      };
    },
    chooseNotAlias(val) {
      // 点击切换之前先检查，如果描述为空则不能切过去，物理字段名一般不会为空
      let attrVal =
        val === "1" ? curTableItem.row.col_name : curTableItem.row.col_chs_name;
      if ((attrVal || "").trim() !== "") {
        this.fieldAttrRadio = val;
        this.$refs["fieldAttrForm"].resetFields();
      }
    },
    closePreviewDialog() {
      //重置数据
      this.upEntityColsData({
        columns: [],
        tableAttr: { data: [] }
      });
    },
    openComputedDialog() {
      if (this.entityData.length == 0) {
        this.$message.warning("请先进行拓扑图设计");
      } else {
        // 没有设置关联条件
        if (this.checkIfRelationSet()) {
          this.$message.warning("请完成关联条件设置");
          return;
        }

        this.editFieldIdx = -1;
        this.editField = {};
        this.cpFieldInfo = {};
        this.computedDialogVis = true;
        this.$nextTick(() => {
          this.$refs.computedField.$refs.input1.focus();
        });
      }
    },
    computedFieldCancel() {
      var computedFieldRef = this.$refs.computedField;
      computedFieldRef.$refs["ruleForm"].resetFields();
      computedFieldRef.funcFilterText = "";
      computedFieldRef.expErrorText = "";
      computedFieldRef.content = "";
      computedFieldRef.sendRequestFlag = false;
      this.computedDialogVis = false;
    },
    addComputedField() {
      var computedFieldRef = this.$refs.computedField;
      computedFieldRef.saveComputedField();
    },
    checkExpValid() {
      var computedFieldRef = this.$refs.computedField;
      computedFieldRef.saveComputedField();
    },
    saveComptedField(res) {
      let field = { ...res.fieldItem };
      field["col_type"] = this.computedFieldCType[this.curDsType] || "";
      if (this.editFieldIdx > -1) {
        let oriCpField = { ...this.table2DataOri[this.editFieldIdx] };
        this.$set(this.table2DataOri, this.editFieldIdx, field);
        //如果计算字段参与关联，要更新关联关系中的信息col_id和col_id_exp
        if (res.upConnInfo) {
          this.upCpConnInfo(oriCpField, field);
        }
      } else if (res.cpFieldInfo) {
        //如果是复制新增字段，要加在指定行后面
        this.table2DataOri.splice(res.cpFieldInfo.idx, 0, field);
      } else {
        this.table2DataOri.push(field);
      }
      this.updatefieldTab(2);
      this.computedFieldCancel();
    },
    datasetFilter() {
      var ruleGroupList = this.$refs.datasetFilter.getResult();
      this.rule_group_list.splice(0, this.rule_group_list.length);
      if (ruleGroupList.length > 0) {
        let condi = {
          element_type: 11,
          type: 11,
          element_id: "",
          element_name: "且",
          order_id: 1,
          exp_value: "",
          symbol: "",
          children: ruleGroupList
        };
        this.rule_group_list.push(condi);
      } else {
        this.rule_group_list = ruleGroupList;
      }
      this.datasetfilterDialogVisible = false;
    },
    editComputedField(index, row) {
      this.editField = row;
      for (let index = 0; index < this.table2DataOri.length; index++) {
        if (
          this.editField.element_name == this.table2DataOri[index].element_name
        ) {
          this.editFieldIdx = index;
          break;
        }
      }
      this.hideMenu();
      this.cpFieldInfo = {};
      this.computedDialogVis = true;
      this.$nextTick(() => {
        let computedFieldRef = this.$refs.computedField;
        computedFieldRef.content = row.col_fun_exp_desc;
        computedFieldRef.ruleForm.name = row.element_name;
      });
    },
    // 获取与之有关联的计算度量
    getRelComputedField(row) {
      var str = `[${row.tab_alias}.${row.col_id}]`;
      return this.table2DataOri.filter(item => {
        return item.is_calcul != "0" && item.col_fun_exp.indexOf(str) > -1;
      });
    },
    // 针对参与计算度量的字段的删除，进行提示
    showFieldCompDelTip(fieldName, relArr) {
      var computedField = "";
      for (let index = 0; index < relArr.length; index++) {
        if (index > 0 && index < relArr.length) {
          computedField += "、";
        }
        computedField += relArr[index].element_name;
      }
      let mesg = `${fieldName}涉及到计算度量${computedField}，请先完成相关计算度量的删除，再删除该字段`;
      this.$message({
        message: mesg,
        type: "warning"
      });
    },
    checkIfRelationSet() {
      // 设置关联条件
      return (
        document.getElementsByClassName("opt conn-icon dis-connect").length > 1
      );
    },
    schemaSelChange(value) {  //模式更新
      let dataSource = this.dataSrcValue;
      this.confirmChange(this.pgDataName,dataSource, 'noclean');
    },
    dataSrcSelChange(value) {
      //区分数据库模式提示语  add czl by 2020.04/26
      if(value.resourceTypeId === "oracle" ){
          this.schemaTip = this.userModeTip;
      }else if(value.resourceTypeId === "gbase" || value.resourceTypeId === "mysql"){
           this.schemaTip = this.dataModeTip;
      }else{
          this.schemaTip = this.shemaModeTip;
      }
      // 变更数据源需要刷新当前页面
      if (value != "") {
        this.realTabChsName = [];//清空表集合
        this.dataResourceNameBak = value.dsName;
        if((value.parentResourceTypeId === "dataasset" || value.parentResourceTypeId === "database") && value.isDemo === '0'){
          this.isShowDiv = true; //显示模式下拉
          if (value.parentResourceTypeId === "dataasset") {
            this.connIdBak = value.dsId;
          }

          // 切换数据源的时候分页重置为第一页,列表数据重置
          this.entityCurPage = 1;
          this.cur_condiData = Object.freeze([]);
          this.cur_condiDataBak = Object.freeze([]);
          this.$nextTick(() => {
            //确保滚动条已经恢复到原来的位置
            this.filterDataSrc("");
            this.confirmChange(value);
            this.getSchemaList('setValue');
          });
        }
        else{//本地上传和案例数据库
          let dbuser = (this.dataSrcValue.paramList || []).filter(item0 => {
              return item0.paramName === "user_name";
          });
          //隐藏用户模式下拉
          this.isShowDiv = false;
          this.schemaValue = dbuser[0].paramValue;
          this.getEntityList('',value,'');

        }
      }
    },
    //获取数据源信息
    getAllDataSrc() {
      this.queryDataSource({
        tenantId: window.sessionStorage.getItem("tenant_id") || "34234234",
        showTipFlag: "1"  //显示为本地上传
      })
        .then(response => {
          if (response.data.respResult == 1) {
            this.allDataSrcCopy = Object.freeze(
              objDeepCopy(response.data.respData || [])
            );
            this.allDataSrc = Object.freeze(response.data.respData || []);
            if (
              this.allDataSrcCopy.length > 0 &&
              this.connId != "" &&
              this.allDataSrcCopy.some(item => {
                return this.connId == item.dsId;
              })
            ) {
              this.dataSrcValue = this.allDataSrcCopy.filter(item => {
                return this.connId == item.dsId;
              })[0];
              this.setPopFormData();
            }
            if (
              this.dataSetCache &&
              this.dataSetCache.datasetId != "" &&
              this.dataSetCache.datasetId != undefined &&
              !this.isDatasetQuery
            ) {
              //如果是编辑页面初始进来，要查询数据集信息
              this.curAfId = this.dataSetCache.datasetId;
              // this.queryDataSet();
              if(this.dataSetCache.verNo){
                this.activatedCode();
              }else{
                this.queryDataSet();
              }
            }
          } else {
            this.$message.error("数据源列表加载失败");
          }
        })
        .catch(err => {
          // this.$message.error("数据源列表加载失败");
        });
    },
    toAddDataSrc() {
      document.getElementById("dataSrcSelect").click();
      this.upDataSrcDialogVis(true);
    },
    // 刷新数据源
    refreshDataSrc() {
      this.getAllDataSrc();
    },
    // 数据源下拉框静态搜索
    filterDataSrc(val) {
      val = val.trim();
      if (val) {
        //val存在
        this.allDataSrc = Object.freeze(
          this.allDataSrcCopy.filter(item => {
            if (
              !!~item.dsName.indexOf(val) ||
              !!~item.dsName.toUpperCase().indexOf(val.toUpperCase())
            ) {
              return true;
            }
          })
        );
      } else {
        //val为空时，还原数组
        this.allDataSrc = Object.freeze(this.allDataSrcCopy);
      }
    },
    filterSchema(val) {
      val = val.trim();
      if (val) {
        this.schemaList = this.schemaListall.filter(item=>{
          if (
            !!~item.indexOf(val) ||
            !!~item.toUpperCase().indexOf(val.toUpperCase())
          ) {
            return true;
          }
        })
      } else {
        this.schemaList = this.schemaListall;
      }
    },
    // 加载实体表
    loadEntityData() {
      let tempData = [],
        arrLen = this.cur_condiDataBak.length;
      let start = (this.entityCurPage - 1) * this.entityPageSize,
        end = start + this.entityPageSize;
      if (this.cur_condiData.length !== arrLen && arrLen !== 0) {
        tempData = this.cur_condiDataBak.filter((item, index) => {
          return index < end && index >= start;
        });
      }
      if (this.entityCurPage === 1) {
        //第一页
        this.cur_condiData = Object.freeze(tempData);
      } else {
        this.cur_condiData = Object.freeze(this.cur_condiData.concat(tempData));
      }
    },
    // 滚动加载实体列表
    loadMoreTable() {
      // 直连数据源，表是全部查回来，然后再静态分页；资产的连接是分页查询
      switch (this.curResourceTypeId) {
        case "dataasset":
          /* if (
            this.cur_condiData.length < this.entitysTotal &&
            this.entityScrollFlag
          ) {
            this.entityCurPage++;
            this.entityScrollFlag = false;
            this.getEntityList(this.filterText, this.dataSrcValue);
          }
          break; */
        case "localdb":
        case "database":
          if (this.cur_condiData.length !== this.cur_condiDataBak.length) {
            this.entityCurPage++;
            this.loadEntityData();
          }
          break;
        default:
          break;
      }
    },
    previewBaseEntity(tableInfo) {
      let _this = this;
      let dataSrc = this.dataSrcValue;
      let dsDbVersion = "";
      let dsDbType = "";//数据库类型
      for (let index = 0; index < (dataSrc.paramList || []).length; index++) {
        const element = dataSrc.paramList[index];
        if (element.paramName === "db_version") {
          dsDbVersion = element.paramValue;
          break;
        }
      }

      if(dataSrc.dsId === 'localdb'){  //本地数据库
           for (let index = 0; index < (dataSrc.paramList || []).length; index++) {
              const element = dataSrc.paramList[index];
              if (element.paramName === "tns") {
                  dsDbType = element.paramValue.split(":")[1];
                  break;
              }
            }
      }else{
        dsDbType = dataSrc.dsType;
      }
      let dname = '';
      //sqlserve特殊处理
      if(dsDbType === 'sqlserver' || dsDbType === 'vertica' ){
          let pars = this.dataSrcValue.paramList;
          for(var x = 0 ; x < pars.length ; x++){
            if(pars[x].paramName == 'db_name'){
              //sql需要指定对应数据库名
              dname = pars[x].paramValue;
               break;
            }
          }
      }


      this.queryDbTbData({
        dsId: dataSrc.dsId,
        tableName: tableInfo.phy_tab_name,
        dsDbType: dsDbType,
        dsDbVersion: dsDbVersion,
        tableSchema: this.schemaValue,
        tableDbName:dname
      })
        .then(response => {
          if (
            response.data.respResult == 1 &&
            response.data.respData &&
            response.data.respData.is_success
          ) {
            _this.$Watermark.set("dsetPreivewTbWrap", 0, 0, -40, 0, true);
            _this.handleEntityData(response);
          } else {
            _this.$message.error(
              response.data.respErrorDesc ||
                response.data.respData.err_msg ||
                "实体查询失败"
            );
          }
        })
        .catch(err => {
          console.error(err);
          // _this.$message.error("实体查询失败");
        })
        .finally(() => {
          _this.prevLoading = false;
        });
    },
    // 处理预览表格的请求数据
    handleEntityData(response) {
      let ecdata = { columns: [], tableAttr: { data: [] } };
      let result_col_list = response.data.respData.result_col_list || [];
      let result_data_list = response.data.respData.result_data_list || [];
      //对于类似t.id这个带.的字段不能作为prop，要改一下
      //表头
      result_col_list.forEach(function(item, i) {
        let prop = item.col_desc || item.col_id; //col_id可能会重复，所以用col_desc
        prop = prop.replace(/\./g, ""); //把里面的.去掉，不然el-table解析不出来
        let temp = {
          label: item.col_desc || item.col_id,
          prop: prop,
          "show-overflow-tooltip": true
        };
        ecdata.columns.push(temp);
      });
      result_data_list.forEach(function(item, i) {
        let rows = item.data_list;
        let temp = {};
        for (let j = 0; j < rows.length; j++) {
          let itm = result_col_list[j].col_desc || result_col_list[j].col_id; //col_id可能会重复，所以用col_desc
          itm = itm.replace(/\./g, ""); //把里面的.去掉，不然el-table解析不出来
          // let itm = result_col_list[j].col_id;
          temp[itm] = rows[j].data_val + "  ";
        }
        ecdata.tableAttr.data.push(temp);
      });
      this.upEntityColsData(ecdata);
    },
    // 构造直连数据库的数据集信息
    formatDBDatasetInfo(formattedData) {
      let oriRuleGroupList = objDeepCopy(this.rule_group_list);
      if (
        (oriRuleGroupList || []).length > 0 &&
        oriRuleGroupList[0] &&
        (oriRuleGroupList[0].children || []).length > 0
      ) {
        let oriChildren = objDeepCopy(oriRuleGroupList[0].children);
        oriChildren.forEach((item, index) => {
          let allCols = this.allFieldsMap.get(item.tab_alias) || [];
          if (allCols.length > 0) {
            oriChildren[index].element_id = allCols[0].phy_tab_name;
          }
        });
        oriRuleGroupList[0].children = oriChildren;
      }

      let param = {
        datasetName: "",
        datasetStatus: "1", //状态：1新建、2待发布、3已发布、4已下线
        datasetDesc: "",
        dataseType: "12", //分析框架类型 1：属性 2：指标 12：属性+指标
        frameId: this.frameId,
        tenantId: sessionStorage.getItem("tenant_id"),
        dataCycle: "99",
        disposeType: this.dataSrcValue.dsId,
        connId: this.dataSrcValue.dsId,
        elementList: formattedData.colLists,
        usedTabList: formattedData.usedTabList,
        subjectInfo: {
          ruleGroupList: objClone(oriRuleGroupList, 1),
          tabRelList: formattedData.entityLists
        }
      };
      return param;
    },
    executeDimLevelQry() {
      this.pageQuery.start = 1;
      this.queryDimInfoList();
    },
    // 构造右上角数据集预览的请求参数
    genDgwTables(entityLists) {
      let dgwTables = [],
        tabNameArr = [];
      let dbName = "";
      var temp = "";
      let userArr = (this.dataSrcValue.paramList || []).filter(item0 => {
        return item0.paramName === "db_name";
      });
      if (userArr.length > 0) {
        dbName = userArr[0].paramValue;
      }else{
        temp = (this.dataSrcValue.paramList || []).filter(item0 => {
            return item0.paramName === "tns";
        });
        dbName = temp[0].paramValue.split(":")[5];
      }
      for (let index = 0; index < entityLists.length; index++) {
        const element = entityLists[index];
        if (!tabNameArr.includes(element.phy_tab_name)) {
          tabNameArr.push(element.phy_tab_name);
          let allCols = this.allFieldsMap.get(element.tab_alias);
          let colLists = [];
          for (let index2 = 0; index2 < allCols.length; index2++) {
            const fieldItem1 = allCols[index2];
            colLists.push({
              col_id: fieldItem1.col_id || "",
              col_length: fieldItem1.col_length || "0",
              col_name: fieldItem1.col_name || "",
              col_type_desc: fieldItem1.col_type_desc || "",
              col_accuracy: fieldItem1.col_precise || "",
              data_type: fieldItem1.data_type || "",
              col_type: fieldItem1.col_type || ""
            });
          }
          let tabItem = {
            conn_id: this.dataSrcValue.dsId,
            db_type: this.dataSrcValue.dsType,
            db_name: dbName,
            // partitionNum: 0,
            // replicaNum: 0,
            resource_id: this.curDsType,
            tab_id: element.tab_alias,
            tab_name: element.phy_tab_name,
            tab_alias: element.tab_alias,
            tab_sechema: element.tab_schema,
            col_list: colLists
          };
          dgwTables.push(tabItem);
        }
      }
      return dgwTables;
    },
    // 判断字段是否是广义上的“number(度量)”
    checkIfNumberField(colType) {
      // item.col_type.toLocaleLowerCase() == "number"
      colType = (colType || "").toLocaleLowerCase();
      return (this.fieldTypeList[colType] || {}).elementType == "2";
    },
    alterTabIds(entityData, colsData) {
      let tabIdMap = {},
        tabAliasMap = {};
      for (let index = 0; index < entityData.length; index++) {
        const element = entityData[index];
        tabAliasMap[element.tab_alias] = element.tab_id;
        tabIdMap[element.tab_id] = element.phy_tab_name;
      }
      for (let index = 0; index < entityData.length; index++) {
        const element = entityData[index];
        entityData[index].tab_id =
          element.tab_id && tabIdMap[element.tab_id]
            ? tabIdMap[element.tab_id]
            : "";
        entityData[index].rel_tab_id =
          element.rel_tab_id && tabIdMap[element.rel_tab_id]
            ? tabIdMap[element.rel_tab_id]
            : "";
        let tab_join_exp_list = element.tab_join_exp_list || [];
        if (tab_join_exp_list.length > 0) {
          for (let index2 = 0; index2 < tab_join_exp_list.length; index2++) {
            const element2 = tab_join_exp_list[index2];
            tab_join_exp_list[index2].tab_id =
              element2.tab_id && tabIdMap[element2.tab_id]
                ? tabIdMap[element2.tab_id]
                : "";
            tab_join_exp_list[index2].rel_tab_id =
              element2.rel_tab_id && tabIdMap[element2.rel_tab_id]
                ? tabIdMap[element2.rel_tab_id]
                : "";
          }
          entityData[index].tab_join_exp_list = tab_join_exp_list;
        }
      }
      for (let index = 0; index < colsData.length; index++) {
        const element = colsData[index];
        colsData[index].tab_id =
          element.tab_id && tabIdMap[element.tab_id]
            ? tabIdMap[element.tab_id]
            : "";
      }

      // 对数据过滤条件也执行tabId替换
      if (
        this.rule_group_list.length > 0 &&
        this.rule_group_list[0] &&
        (this.rule_group_list[0].children || []).length > 0
      ) {
        const oriRuleArr = objDeepCopy(this.rule_group_list[0].children);
        oriRuleArr.forEach((item, index) => {
          let oriTabId = tabAliasMap[item.tab_alias];
          if (
            oriTabId &&
            (oriRuleArr[index].element_id || "")
              .trim()
              .indexOf(`${oriTabId}split`) === 0 &&
            tabIdMap[oriTabId]
          ) {
            oriRuleArr[index].element_id = oriRuleArr[index].element_id.replace(
              oriTabId + "split",
              tabIdMap[oriTabId] + "split"
            );
          }
        });
        this.$set(this.rule_group_list[0], "children", oriRuleArr);
      }
      return { entityData, colsData };
    },
    //查询加密策略列表
    queryEncryptLists() {
      let _this = this;
      this.queryEncryptList({
        dic_type: 2089
      })
        .then(response => {
          if (response.data.respResult == 1) {
            let dicList = [];
            response.data.respData.forEach(val => {
              dicList.push({ label: val.dic_name, index: val.dic_id });
            });
            _this.encryptList = dicList;
          } else {
            _this.$message.error(
              response.data.respErrorDesc ||
                response.data.respData.err_msg ||
                "加密策略查询失败"
            );
          }
        })
        .catch(err => {
          console.error(err);
        });
    },
    showEncryptList(index, row, type) {
      this.encryptList = [];
      this.queryEncryptLists();
      this.dimDesensePopVis = true;
      if(type === 2) {
        this.measureDesensePopVis = true;
      }
    },
    saveColEncrypt(index, row, type, data) {
      let rowData ;
      if(type === 1) {
        rowData = this.table1DataOri;
        this.dimDesensePopVis = false;
      } else {
        rowData = this.table2DataOri;
        this.measureDesensePopVis = false;
      }
      rowData.filter(item => {
        if (
          item.element_id === row.element_id &&
          item.col_name === row.col_name &&
          item.element_name === row.element_name
        ) {
          if (item["encrypt_id"] != data.index) {
            item["encrypt_id"] = data.index;
          } else {
            item["encrypt_id"] = "";
          }
        }
      });
      this.updatefieldTab(type);
      this.hideMenu();
    },
    queryDateFormatLists(colType) {
      let _this = this;
      this.queryDateFormatList({
        colType: colType
      })
        .then(response => {
          if (response.data.respResult == 1) {
            let dateList = [];
            response.data.respData.forEach(val => {
              dateList.push({ label: val.formatStr, index: val.orderNo });
            });
            _this.dateFormatList = dateList;
          } else {
            _this.$message.error(
              response.data.respErrorDesc ||
                response.data.respData.err_msg ||
                "时间格式串查询失败"
            );
          }
        })
        .catch(err => {
          console.error(err);
          // _this.$message.error("时间格式串查询失败");
        });
    },
    showDateFormatList(index, row, type) {
      this.dateFormatList = [];
      if (row != null && row.col_type != null) {
        let colType = (this.fieldTypeList[row.col_type.toLocaleLowerCase()] ||
          {})["showType"];
        this.queryDateFormatLists(colType);
      }
      this.dateFormatPopVisible = true;
    },
    saveColDateFormat(index, row, data) {
      this.table1DataOri.filter(item => {
        if (
          item.element_id === row.element_id &&
          item.col_name === row.col_name &&
          item.element_name === row.element_name
        ) {
          if (item["source_format"] != data.label) {
            item["source_format"] = data.label;
            item["show_format"] = data.label;
          } else {
            item["source_format"] = "";
            item["show_format"] = "";
          }
          // 清空过滤字段已选值
          let filterList = (this.rule_group_list[0] || {}).children || [];
          filterList.forEach(val=>{
            if(val.col_id === item.col_id && val.tab_alias === item.tab_alias) {
              val.exp_value = "";
            }
          })
        }
      });
      this.updatefieldTab(1);
      this.dateFormatPopVisible = false;
      this.hideMenu();
    },
    setPopFormData() {
      let dataSrcValue = this.dataSrcValue || []
      let paramList = dataSrcValue.paramList || [];
      if(dataSrcValue.parentResourceTypeId == "dataasset") { // "数据资产"
        this.popFormItem = []
        this.popForm = []
        paramList.forEach((item,index) => {
          let label = item.paramDesc || item.paramName || ''
          let value = item.paramValue
          let key = item.paramName || `item${index}`
          let temp = {
            class: '',
            label,
            value: key
          }
          this.popFormItem.push(temp)
          this.popForm[key] = value
        });
      } else {
        this.popFormItem = [...this.datasetPopFormItem]
        let _this = this;
        _this.popForm["srcType"] = (_this.dataSrcValue || {})["dsType"];
        paramList.forEach(item => {
          if (
            ["ip_address", "port", "db_version", "db_name", "user_name"].includes(
              item.paramName
            )
          ) {
            _this.popForm[item.paramName] = item.paramValue;
          }
        });
      }
    },
    // 检验计算字段是否只包含一张表的字段
    ifUseOneTab(field, tabAlias) {
      let flag = true,
        colFunExp = field.col_fun_exp;
      if (typeof this.allFieldsMap.keys == "function") {
        for (let key of this.allFieldsMap.keys()) {
          if (key != tabAlias && colFunExp.indexOf(`[${key}.`) > -1) {
            flag = false;
            break;
          }
        }
      }
      return flag;
    },
    // 拓扑图连接面板 字段列表设置
    setConnSelectOptions({ parentInfo, selfTabInfo }) {
      let fields1 = (this.allFieldsMap.get(parentInfo.tab_alias) || []).concat(
        this.getComputedFieldByAlias(parentInfo.tab_alias)
      );
      let fields2 = (this.allFieldsMap.get(selfTabInfo.tab_alias) || []).concat(
        this.getComputedFieldByAlias(selfTabInfo.tab_alias)
      );
      this.updateConnLeftSelOption(fields1);
      this.updateConnRightSelOption(fields2);
    },
    /**
     * @param:表别名
     * 获取仅使用一个表别名的字段的计算字段
     *  */
    getComputedFieldByAlias(tab_alias) {
      let fieldList1 = this.table2DataOri.filter(newField => {
        return (
          newField.is_calcul != "0" &&
          newField.col_fun_exp.indexOf(`[${tab_alias}.`) > -1 &&
          this.ifUseOneTab(newField, tab_alias)
        );
      });
      return fieldList1;
    },
    // 确认从拓扑图字段面板区域删除计算字段
    confirmDelCompuFields(fieldInfo) {
      let checkedArr2 = objDeepCopy(this.checkedFields);
      checkedArr2.splice(checkedArr2.indexOf(fieldInfo.element_name), 1);
      this.updateCheckedFields(checkedArr2);
      let fieldIdx = -1;
      this.table2DataOri.forEach((item, index) => {
        if (
          item.is_calcul != "0" &&
          item.element_name == fieldInfo.element_name
        ) {
          fieldIdx = index;
        }
      });
      if (fieldIdx > -1) {
        this.table2DataOri.splice(fieldIdx, 1);
        this.updatefieldTab(2);
      }
      let fieldDatas1 = objDeepCopy(this.fieldDatasOri);
      let fieldIdx2 = -1;
      fieldDatas1.forEach((item, index) => {
        if (
          item.is_calcul != "0" &&
          item.element_name == fieldInfo.element_name
        ) {
          fieldIdx2 = index;
        }
      });
      if (fieldIdx2 > -1) {
        fieldDatas1.splice(fieldIdx2, 1);
        this.updateFieldDatasOri(fieldDatas1);
        let filterVal = (this.filterTabfieldText || "").trim();
        let filteredFieldDatas1 = fieldDatas1.filter(item => {
          let label = item.col_chs_name || item.col_name;
          if (item.is_calcul != "0") {
            label = item.element_name;
          }
          return label.toLocaleLowerCase().indexOf(filterVal) > -1;
        });
        this.updateFieldDatas(filteredFieldDatas1);
        let checkedCount = checkedArr2.length;
        this.updateIsIndeterminate(
          checkedCount > 0 && checkedCount < fieldDatas1.length
        );
        this.updateCheckAll(checkedCount === fieldDatas1.length);
      }
    },
    /**
     * 检查计算字段是否被使用
     * @param
     * cpField:计算字段
     */
    ifConnUseCpField(cpField) {
      let flag = false;
      let entityDataList = this.treeJsonToArray(objDeepCopy(this.entityData));
      for (let index = 0; index < entityDataList.length; index++) {
        const element = entityDataList[index];
        let tab_join_exp_list = element.tab_join_exp_list;
        if ((tab_join_exp_list || []).length > 0) {
          for (let index2 = 0; index2 < tab_join_exp_list.length; index2++) {
            const element2 = tab_join_exp_list[index2];
            if (element2.col_id_exp == cpField.col_fun_exp) {
              flag = true;
              break;
            }
            if (element2.rel_col_id_exp == cpField.col_fun_exp) {
              flag = true;
              break;
            }
          }
          if (flag) {
            break;
          }
        }
      }
      return flag;
    },
    // 获取计算字段第一个用到的col_id
    getFirColId(colFunExp, tabAlias) {
      let newColId = "";
      let matchRes = colFunExp.match(/\[.*?\]/g);
      if (matchRes && matchRes.length > 0) {
        newColId = matchRes[0].replace(/\[|\]/g, "").trim();
        newColId = newColId.replace(tabAlias + ".", "").trim();
      }
      return newColId;
    },
    // 打开提示弹窗
    openMessage(type, msg) {
      this.$message.closeAll();
      this.$message({
        message: msg,
        type: type
      });
    },
    // 删除计算字段
    /**
     * @type 1--从拓扑图字段列表删
     *       2--从下面的字段列表删
     */
    delCpField(cpField, type = 1, index = -1) {
      this.$confirm(`确定删除字段${cpField.element_name}吗？`, "提示", {
        closeOnClickModal: false,
        confirmButtonText: "确 定",
        cancelButtonText: "取 消"
      })
        .then(() => {
          if (type == 1) {
            this.confirmDelCompuFields(cpField);
          } else {
            let idx2 = -1;
            if (this.fieldFilterText.trim() == "") idx2 = index;
            else idx2 = this.table2DataOri.indexOf(cpField);
            if (idx2 > -1) {
              this.table2DataOri.splice(idx2, 1);
              this.updatefieldTab(2);
            }
          }
        })
        .catch(err => {
          this.$message({
            type: "info",
            message: "已取消"
          });
        });
    },
    // 更新计算字段参与关联的关联关系
    upCpConnInfo(oriCpField, newCpField) {
      let entityDataList = this.treeJsonToArray(objDeepCopy(this.entityData));
      let rid = this.curResourceTypeId;
      let tabChsName = this.realTabChsName;
      for (let index0 = 0; index0 < entityDataList.length; index0++) {
        entityDataList[index0]["tab_rel_list"] = [];
      }
      for (let index = 0; index < entityDataList.length; index++) {
        const oriExpList = entityDataList[index].tab_join_exp_list;
        oriExpList.forEach((item, index) => {
          if (item.col_id_exp == oriCpField.col_fun_exp) {
            oriExpList[index].col_id = newCpField.col_fun_exp;
            oriExpList[index].col_id_exp = newCpField.col_fun_exp;
          }
          if (item.rel_col_id_exp == oriCpField.col_fun_exp) {
            oriExpList[index].rel_col_id = newCpField.col_fun_exp;
            oriExpList[index].rel_col_id_exp = newCpField.col_fun_exp;
          }
        });
        entityDataList[index].tab_join_exp_list = oriExpList;
      }


      //设置要显示中文表名
       for (let index3 = 0; index3 < entityDataList.length; index3++) {
            if(rid === 'localdb' || this.dataSrcValue.isDemo === '1'){ //本地数据库
              entityDataList[index3]["flag"] = "0";
              entityDataList[index3]["tab_chs_name"] = tabChsName[index3];
            }
            else{
              entityDataList[index3]["flag"] = "1";
              entityDataList[index3]["tab_chs_name"] = tabChsName[index3];
          }
      }


      this.entityData = this.arrayToTreeJson(entityDataList);
    },
    // 校验计算字段表达式是否重复
    checkCpFieldExpDup(cpField, passIdx = -1) {
      let flag = false;
      for (let index = 0; index < this.table2DataOri.length; index++) {
        const element = this.table2DataOri[index];
        if (passIdx == index) continue; //过滤掉这个计算字段本身
        if (
          element.is_calcul != "0" &&
          element.col_fun_exp == cpField.col_fun_exp
        ) {
          flag = true;
          break;
        }
      }
      return flag;
    },
    setAuthField(index, row, type) {
      if (this.curAuthField != "" && row.is_data_priv == 0) {
        this.$message.warning(
          `${
            this.curAuthField[this.SHOW_TYPE_ARR[this.curAuthField.show_type]]
          }字段已设置为权限字段，请先取消,再设置！`
        );
        this.hideMenu();
        return;
      }
      let idx = -1;
      let newVal = row.is_data_priv == 0 ? 1 : 0;
      if (this.fieldFilterText.trim() == "") idx = index;
      else if (type == 1) {
        idx = this.table1DataOri.indexOf(row);
      } else {
        idx = this.table2DataOri.indexOf(row);
      }
      switch (type) {
        case 1:
          this.$set(this.table1DataOri[idx], "is_data_priv", newVal);
          this.updatefieldTab(1);
          break;
        case 2:
          this.$set(this.table2DataOri[idx], "is_data_priv", newVal);
          this.updatefieldTab(2);
          break;
        default:
          break;
      }
      this.hideMenu();
    },
    showDataPrivList(index, row, type) {
      this.privTagList = [];
      let _this = this;
      this.getUserTagPriv({}).then(response => {
        if (response.data.respResult == 1) {
          response.data.respData.forEach(val => {
            _this.privTagList.push({label: val.privTagName, index: val.privTagId});
          });
        } else {
          _this.$message.error(
            response.data.respErrorDesc ||
            response.data.respData.err_msg ||
            "查询权限标签列表失败"
          );
        }
      })
      .catch(err => {
        console.error(err);
      });
      this.dataPrivPropVis = true;
      if (type === 2) {
        this.measureDesensePopVis = true;
      }
    },
    saveDataPriv(index, row, type, data) {
      let rowData;
      if (type === 1) {
        rowData = this.table1DataOri;
        this.dimDesensePopVis = false;
      } else {
        rowData = this.table2DataOri;
        this.measureDesensePopVis = false;
      }
      rowData.filter(item => {
        if (
          item.element_id === row.element_id &&
          item.col_name === row.col_name &&
          item.element_name === row.element_name
        ) {
          if (item["priv_tag"] != data.index) {
            item["priv_tag"] = data.index;
            this.privTagSetList.push(data.index);
          } else {
            item["priv_tag"] = "";
            this.privTagSetList.pop(data.index);
          }
        }
      });
      this.updatefieldTab(type);
      this.hideMenu();
    },
    executeSql() {
      if (!this.sqlEditorData.isActive) {
        return;
      }
      // this.$refs.center.$refs.center.execute(this.executeStyle, this.$refs.varReplace.varReplaceForm.varListData, whiteListResult.whiteList);
    },
    formatSql() {
      this.$refs.center.$refs.center.formatCode();
    },
    // 保存sql编辑器语句
    saveSqlEditor() {
      this.sqlEditorData.sqlstring = this.$refs.center.$refs.center.save();
    },
    insertTableToEditor(tabInfo) {
      this.$refs.center.$refs.center.insertIntoAce(tabInfo.phy_tab_name);
    }
  },
  computed: {
    table1DataTest() {
      let datas = [];
      for (let i = 0; i<500; i++) {
        let data = {"af_id":"","element_id":"","element_name":"","element_type":1,"is_calcul":"0","tab_id":"QRY_REJ_ONCE_USER_DETAIL","tab_chs_name":"","tab_col_id":"NAME","col_type":"VARCHAR2","col_fun_exp":"","col_fun_exp_desc":"","is_trans_dim":0,"dim_id":null,"dim_name":null,"dim_level_id":null,"dim_level_name":null,"order_id":"0","col_id":"NAME","col_name":"NAME","col_chs_name":"NAME","create_time":"","create_user":"","create_user_name":"","show_type":"2","is_show":"1","show_format":"","source_format":"","iconClr":"clr0","tab_alias":"t1","is_copy":"0","phy_tab_name":"QRY_REJ_ONCE_USER_DETAIL","col_length":"255","col_precise":null,"data_type":null,"is_data_priv":0};
        data.element_id = 'elementId' + i;
        data.col_chs_name = 'NAME' + i;
        datas.push(data);
      }
      return datas;
    },
    topMaxHeight() {
      return this.bodyHeight - 80 - 100; //60(header)+ 上下内边距10*2+100
    },
    ...mapState({
      datasetUrl: state => state.datasetUrl,
      treeData: state => state.HomeTree.treeData,
      dataSetCache: state => state.DataSetMgt.dataSetCache,
      dgwMsUrl: state => state.dgwMsUrl,
      dsSysMsUrl: state => state.dsSysMsUrl,
      cctSysMs: state => state.cctSysMs,
      entityType: state => state.commonProperties.entityType, //获取实体列表类型(7-his表   0-正式表)
      myFolder: state => state.commonProperties.myFolder,
      entityColsData: state => state.DataSetMgt.entityColsData,
      renderEngine: state => state.renderEngine,
      dataSetType: state => state.DataSetDesign.dataSetType,
      defaultSystemId: state => state.defaultSystemId,
      topoTabActive: state => state.DataSetDesign.topoTabActive,
      fieldDatas: state => state.DataSetDesign.fieldDatas,
      checkedFields: state => state.DataSetDesign.checkedFields,
      connLeftSelOption: state => state.DataSetDesign.connLeftSelOption,
      connRightSelOption: state => state.DataSetDesign.connRightSelOption,
      curSelConnInfo: state => state.DataSetDesign.curSelConnInfo,
      activeConn: state => state.DataSetDesign.activeConn,
      edcPubMsUrl: state => state.edcPubMsUrl,
      PADDINGBOTTOM: state => state.PADDINGBOTTOM,
      datasourcePriv: state => state.commonProperties.datasourcePriv, //数据源类型显示块
      fieldDatasOri: state => state.DataSetDesign.fieldDatasOri, //点击拓扑图实体图标打开的原始字段列表
      filterTabfieldText: state => state.DataSetDesign.filterTabfieldText, //点击拓扑图实体图标打开的原始字段列表 过滤输入框
      userModeTip: state => state.DataSetDesign.userModeTip ,//区分各种数据库模式 提示语常量
      dataModeTip: state => state.DataSetDesign.dataModeTip ,//区分各种数据库模式 提示语常量
      shemaModeTip: state => state.DataSetDesign.shemaModeTip //区分各种数据库模式 提示语常量
    }),
    allFieldsMap: {
      get: function() {
        return this.$store.state.DataSetDesign.allFieldsMap;
      },
      set: function(newValue) {
        this.updateAllFieldsMap(newValue);
      }
    },
    joinExpList: {
      get: function() {
        return this.$store.state.DataSetDesign.joinExpList;
      },
      set: function(newValue) {
        this.updateJoinExpList(newValue);
      }
    },
    connPopVisible: {
      get: function() {
        return this.$store.state.DataSetDesign.connPopVisible;
      },
      set: function(newValue) {
        this.updateConnPopVisible(newValue);
      }
    },
    dateFormatPopVisible: {
      get: function() {
        return this.$store.state.DataSetDesign.dateFormatPopVisible;
      },
      set: function(newValue) {
        this.updateDateFormatPopVisible(newValue);
      }
    },
    computeFields() {
      //剔除计算字段和复制字段和非number字段
      let data1 = this.table1DataOri.filter(item => {
        return (
          // this.checkIfNumberField(item.col_type) &&
          item.is_copy != "1" && item.is_calcul == "0"
        );
      });
      let data2 = this.table2DataOri.filter(item => {
        return (
          // this.checkIfNumberField(item.col_type) &&
          item.is_copy != "1" && item.is_calcul == "0"
        );
      });
      return data1.concat(data2);
    },
    datasetFieldList() {
      //剔除计算字段和复制字段
      let data1 = this.table1DataOri.filter(item => {
        return item.is_calcul == "0" && item.is_copy != "1";
      });
      let data2 = this.table2DataOri.filter(item => {
        return item.is_calcul == "0" && item.is_copy != "1";
      });
      return data1.concat(data2);
    },
    // 当前数据源所属类型 "dataasset":资产 ,"database":自定义 数据库
    curResourceTypeId() {
      return this.dataSrcValue.parentResourceTypeId || "";
    },
    curDsType() {
      let dsType = "";
      if (this.dataSrcValue && this.dataSrcValue.resourceTypeId) {
        dsType = this.dataSrcValue.resourceTypeId;
      }
      return dsType;
    },
    //当前设置的权限字段
    curAuthField() {
      let curAuthField = "";
      let filterRes = this.table1DataOri
        .concat(this.table2DataOri)
        .filter(field => {
          return field.is_data_priv == 1;
        });
      if (filterRes.length > 0) {
        curAuthField = filterRes[0];
      }
      return curAuthField;
    },
    // 案例不需要保存按钮
    isNeedSave() {
      let retVal = true
      if (this.dataSetCache) {
        retVal = this.dataSetCache.isDemo ? this.dataSetCache.isDemo === '0' : true
      }
      if(this.dataSetCache && this.dataSetCache.isDemo != '1'){
        retVal = this.dataSetCache.isVersion ? false : true
      }
      return retVal
    },
    isNeedSaveAs() {
      let retVal = true;
      if(this.dataSetCache){
        retVal = this.dataSetCache.isVersion ? false : true
      }
      return retVal
    },
    dataSrcWidth() {
      return this.dataSrcValue.dsId === 'demodb' || this.dataSrcValue.dsId === 'localdb' ? 220 : 190
    }
  },
  watch: {
    fieldFilterText(val) {
      if (val.trim() == "") {
        this.table1Data = Object.freeze(objDeepCopy(this.table1DataOri));
        this.table2Data = Object.freeze(objDeepCopy(this.table2DataOri));
      } else {
        val = val.toLocaleLowerCase();
        this.table1Data = Object.freeze(
          this.table1DataOri.filter(item => {
            return (
              item[this.SHOW_TYPE_ARR[item.show_type]]
                .toLocaleLowerCase()
                .indexOf(val) > -1
            );
          })
        );
        this.table2Data = Object.freeze(
          this.table2DataOri.filter(item => {
            return (
              item[this.SHOW_TYPE_ARR[item.show_type]]
                .toLocaleLowerCase()
                .indexOf(val) > -1
            );
          })
        );
      }
    },
    filterText(val) {
      debounce(() => {
        this.getEntityList(val, this.dataSrcValue);
      }, 1000);
    },
    entityData(val) {
      if (val.length == 0) {
        this.isFirstWrap = false;
        //this.mainTabId = "";
      } else {
        this.isFirstWrap = true;
        //this.mainTabId = val[0].tab_id;
      }
    }
  },
  activated() {
    this.connId = "";
    this.toSaveInput = false;
    window.onresize = () => {
      this.resetBodyHeight();
    };
    document.addEventListener("click", this.windowClickHandle);
    if (this.dataSetCache && this.dataSetCache.datasetId != "") {
      this.isDatasetQuery = false;
      this.connId = this.dataSetCache.connId || "";
    }
    this.getAllDataSrc();
    eventBus.$on("executeDeleteTabItem", this.deleteItem);
    var that = this;
    document.body.addEventListener(
      "click",
      function() {
        that.pop3Visible = false;
      },
      true
    );
    // 在连接设置浮窗区域上操作，禁止冒泡关闭浮窗
    // document
    //   .querySelector(".conn-pop-container")
    //   .addEventListener("click", function(e) {
    //     e.stopPropagation();
    //   });
  },
  deactivated() {
    document.removeEventListener("click", this.windowClickHandle);
    this.resetPage();
  },
  mounted() {
    this.datasetPriv = parseInt(this.$store.state.commonProperties.datasetPriv);
    this.realTabChsName = [];
    let ds = sessionStorage.getItem('dataSetCache');
    let pageInfo = JSON.parse(ds);
    if (pageInfo.dataSetType !== undefined) {
      this.setDatasetType(pageInfo.dataSetType);
    }
    this.setDataSetCache(pageInfo);
    document.title = this.dataSetCache.af_desc || "新增数据集";
    // window.sessionStorage.removeItem("dataSetCache");
    this.queryCatalog();
    this.rowDrop();
  }
};
</script>

<style lang="scss" scoped>
$main-bg: #2f5377; //设计区域背景色
$main-bg-design: #aaaaaa; // 设计区域背景色
$bg-clr1: #e4e7ee;
$main-bg1: #fff; // 设计区域内层背景
$font-main: #ffffff; //文字主色
$font-main2: #afc0d0;
$font-main3: #606266;
$border-clr2: #0a2b4c;
$input-bg-clr1: #0e3b67; // 输入框背景色
$hight-light-clr1: #45fffd; //高亮颜色
$main-color: #409eff; //主色调
$font-clr1: #fff; // 文字颜色1
$header-main-clr: #0a2b4c; // 头部背景色
$border-clr1: #0e3b67; // 输入框边框色
$font-clr2: #3f678d; // 输入框字体颜色
$icon-btn-disabled: #c0c4cc; //字体图标操作按钮禁用
$bd-clr1: #dcdfe6;

.dataset-aside {
  background-color: $main-bg;
  padding: 10px;

  /deep/ .el-input__inner {
    color: $font-main;
    background-color: $input-bg-clr1;
    border: 1px solid $border-clr2;
    margin: 10px 0;
  }


  /deep/ .el-table__row {
      height: 30px;
    }
}
.entity-dialog {
  /deep/ .el-table__row{
    height: 30px;
  }
}

.design-main {
  background-color: $main-bg-design;
  padding: 20px;
  height: 100%;
  overflow: hidden;

  .query-design {
    padding: 0px;
    background-color: $bg-clr1;

    /deep/ .el-header {
      padding: 20px;
      background-color: $main-bg1;
      overflow: hidden;

      &.tables-fade-in {
        animation: run 0.5s;
        height: 0 !important;
        padding: 0;
      }

      &.tables-fade-out {
        animation: runout 0.5s;
      }
    }

    .el-main {
      margin-top: 10px;
      background-color: $main-bg1;
      position: relative;
      overflow: visible;
    }
  }

  .entity-rela {
    /deep/ .el-tag {
      border: 1px solid $bg-clr1;
      background-color: $main-bg1;
      margin-right: 100px;
      width: 210px;
      color: $font-main3;

      .col-span > span:first-child {
        margin-right: 10px;
        display: inline-block;
      }

      .col-span > span:last-child {
        display: inline-block;
        width: 145px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        word-break: break-all;
      }

      &.active {
        border: 1px dashed $main-color;
        background-color: rgba($main-color, 0.15);
      }

      i {
        color: $main-color;
      }

      .tab-icon {
        cursor: pointer;
      }
    }

    & > ul {
      min-width: 100%;
    }
  }
}

.dataset-page {
  //弹窗
  /deep/ .entity-dialog {
    overflow: hidden;
  }

  /deep/ .entity-dialog .el-dialog {
    max-height: 80%;
  }

  /deep/ .entity-dialog .el-scrollbar__wrap {
    overflow-x: hidden;
  }

  /deep/ .entity-dialog .el-table th div {
    line-height: 23px;
  }

  /deep/ .entity-dialog .el-table th > .cell {
    height: 23px;
  }

  /deep/ .entity-dialog .el-table tbody tr  {
    height: 30px;
  }
}

.slide-btn {
  position: absolute;
  top: -12px;
  left: 50%;
}

@keyframes run {
  from {
    height: 200px;
    padding: 20px;
  }
  to {
    height: 0;
    padding: 0;
  }
}

@keyframes runout {
  from {
    height: 0px;
    padding: 0;
  }
  to {
    height: 200px;
    padding: 20px;
  }
}

.datasource-info {
  color: $font-main;
  padding: 5px 0;
  padding-top: 0px;
  border-bottom: 1px dashed $border-clr2;

  span {
    // float: right;
    // color: $font-main2;
    i:first-child {
      margin-right: 10px;
    }
  }

  /deep/ .cell > span {
    float: left;
  }
}

.dataset-right-wrap {
  width: 100%;
  height: 100%;
  overflow: hidden;

  .pane:first-child {
    flex-shrink: 0;
  }

  .multipane-resizer {
    flex-shrink: 0;
  }

  .pane {
    overflow: hidden;
    background-color: $main-bg1;

    & > div > .el-container {
      // padding: 20px;

      &.dataset-right-bottom {
        /deep/ .el-container {
          /deep/ .el-aside {
            flex-shrink: 0;
          }

          /deep/ .el-main {
            flex-shrink: 0;
          }
        }

        /deep/ .dataset-opt-icon {
          color: $main-color;
          font-size: 14px;
          margin-left: 20px;
          cursor: pointer;

          &:first-child {
            margin-left: 0px;
          }

          & + span {
            margin-left: 20px;

            i,
            span {
              margin-left: 0px;
            }
          }

          &.disabled {
            color: $icon-btn-disabled;
            cursor: not-allowed;

            &:hover {
              color: $icon-btn-disabled;
            }
          }

          &:hover {
            color: #66b1ff;
          }
        }

        /deep/ .el-table, .vxe-table {
          .fir-col-icon {
            color: $main-color;
            font-size: 14px;
            vertical-align: -2px;

            &.clr0 {
              color: #409eff;
            }

            &.clr1 {
              color: #67c23a;
            }

            &.clr2 {
              color: #a827f2;
            }

            &.clr3 {
              color: #b9a100;
            }

            &.clr4 {
              color: #e77645;
            }

            &.clr5 {
              color: #ff0000;
            }

            &.clr6 {
              color: #00b595;
            }

            &.clr7 {
              color: #736cff;
            }
          }

          th {
            border-right: none;
          }

          /deep/ .el-table__row {
            height: 30px;
          }
        }

        .tb-contextMenu {
          position: absolute;
          z-index: 2013;

          ul {
            height: 114px;
            max-width: 160px;
          }

          .el-cascader-menu__item {
            color: $font-main3;
            font-size: 12px;

            .tb-contextMenu-icon {
              margin-right: 8px;
              font-size: 12px;

              & + span {
                font-size: 12px;
              }
            }

            &:hover,
            &.is-active {
              color: $main-color;
              background-color: none;
            }
          }
        }

        .tool-btn {
          display: inline-block;
          margin-left: 20px;
          cursor: pointer;

          .tool-btn-icon {
            margin-right: 5px;
            color: $main-color;
          }

          .tool-btn-text {
            color: $font-main3;
          }

          &:hover {
            .tool-btn-text {
              color: $main-color;
            }
          }
        }
      }
    }
  }

  /deep/ .multipane-resizer {
    background-color: $bg-clr1;
    margin-top: 0px;
    top: 0px;
    text-align: center;

    & > i.shrink-icon {
      display: inline-block;
      font-size: 48px;
      cursor: pointer;
      transform: rotate(90deg);
      z-index: 10;
      margin-top: -19px;
      color: #79bbff;

      &:hover {
        color: #79bbff;
      }
    }
  }
}

.delete-icon {
  cursor: pointer;
}

.attr-dialog-wrap {
  .radio-aside-wrap {
    /deep/ .el-radio {
      margin-right: 0;
      margin-bottom: 18px;
      line-height: 28px;

      &:last-child {
        margin-bottom: 0px !important;
      }
    }
  }

  /deep/ .el-main {
    .el-form-item.el-form-item--mini:last-child {
      margin-bottom: 0px;
    }
  }
}

.el-header {
  &.design-page {
    height: 50px !important;
    line-height: 50px;
    background-color: $header-main-clr;

    .page-name {
      width: 230px;

      /deep/ .el-input__inner {
        border-color: $border-clr1;
        background-color: $border-clr1;
        color: $font-clr1;

        &::-webkit-input-placeholder {
          color: $font-clr2;
        }
      }
    }

    .page-input {
      /deep/ .el-input__inner {
        animation: glow 800ms ease-out infinite alternate;
      }

      @keyframes glow {
        from {
          border: 1px solid $border-clr1;
        }
        to {
          border: 1px solid #45fffd;
        }
      }
    }
  }
}

.head-left {
  float: left;

  .to-main {
    color: $font-clr1;
    cursor: pointer;
    margin-right: 26px;
  }
}

.design-main {
  &.el-main {
    .query-design {
      width: 100%;
      height: 100%;
      background-color: $main-bg1;
    }
  }
}

.head-opt-btn {
  float: right;
  color: $font-clr1;
  font-size: 16px;

  i {
    margin-left: 26px;
    cursor: pointer;
  }
}

// 滚动条样式
.tables-detail,
.entity-rela-cont {
  /deep/ .el-scrollbar__wrap {
    overflow-x: hidden;
  }
}

.dataset-popover2 {
  /deep/ .el-form-item__content,
  /deep/ .el-form-item__label {
    line-height: 30px;
    font-size: 12px;
  }

  /deep/ .el-form-item {
    margin-bottom: 0;
  }

  /deep/ .el-form-item__content label {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
    white-space: nowrap;
    color: #409eff;
    font-size: 12px;
  }
}

.popover2 {
  height: 220px;
  overflow: hidden;
  margin: 3px 0px 3px 7px;
}

// .popover-wrapper .el-popper[x-placement^="bottom"] {
//   padding: 15px 20px;
// }
.popover2 /deep/ .el-checkbox {
  max-width: 100%;
  display: block;
  margin-right: 0;
  height: 30px;
}

.popover2 /deep/ .el-checkbox__label {
  font-size: 12px;
}

.popover2 /deep/ .el-checkbox__inner {
  width: 12px;
  height: 12px;
  line-height: 12px;
}

.popover2 /deep/ .el-checkbox__inner::after {
  left: 3px;
  top: 0;
}

.popover2 /deep/ .el-checkbox__input {
  margin-top: 3px;
}

.popover2 /deep/ .el-checkbox__label {
  max-width: calc(100% - 15px);
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
  display: inline-block;
}

.popover2 /deep/ .el-scrollbar {
  height: 220px;
}

.popover2 /deep/ .el-scrollbar__wrap {
  overflow-y: scroll;
  overflow-x: auto;
}

.tb-contextMenu {
  /deep/ ul {
    height: auto;
    max-width: 160px;
    min-width: unset;
    width: 100%;

    &.attr-menu {
      padding: 0;
    }

    &:first-child {
      border-right: none;
    }

    &:nth-child(2) {
      border-left: solid 1px #e4e7ed;
    }

    .el-cascader-menu__item {
      color: $font-main3;
      padding: 0 8px;
      line-height: 34px;

      .tb-contextMenu-icon {
        margin-right: 8px;
        font-size: 12px;

        & + span {
          font-size: 12px;
        }
        &.check-icon {
          margin-right: 0;
          float: right;
          margin-top: 12px;
          color: $main-color;
        }
      }

      &:hover,
      &.is-active {
        color: $main-color;
        // background-color: none;
      }

      &:first-child {
        padding-top: 0;
      }

      &:last-child {
        padding-bottom: 0;
      }
      &.item-disabled,
      &.item-disabled:hover {
        color: $icon-btn-disabled;
        background-color: none;
        cursor: not-allowed;
        span,
        i {
          color: $icon-btn-disabled;
          cursor: not-allowed;
        }
      }
    }
  }

  .el-cascader-menu__item--extensible:after {
    right: 0px;
  }

  /deep/ .el-scrollbar__wrap {
    overflow-x: hidden;
  }
}

.data-source-dialog /deep/ .el-main {
  padding: 0 0 0 20px;
}

.data-source-dialog /deep/ .el-dialog__body {
  height: 300px;
}

.dataset-aside /deep/ .ds-filter .el-input__inner {
  background: #fff;
  border-color: $bd-clr1;
  color: $font-clr2;
  margin: 0 0 10px;
}

.dataset-aside /deep/ .ds-filter .el-input__suffix {
  height: 28px;
}

.ds-wrapper {
  border: 1px solid $bd-clr1;
  border-bottom: none;
}

.ds-wrapper /deep/ *::-webkit-scrollbar {
  width: 6px;
  height: 10px;
  background-color: transparent;
}

/*定义滚动条高宽及背景 高宽分别对应横竖滚动条的尺寸*/
.ds-wrapper /deep/ *::-webkit-scrollbar-track {
  background-color: transparent;
  width: 6px;
}

/*定义滚动条轨道 内阴影+圆角*/
.ds-wrapper /deep/ *::-webkit-scrollbar-thumb {
  background-color: #d3d8e4;
  width: 6px;
  border-radius: 6px;
}

/*定义滑块 内阴影+圆角*/
.ds-wrapper {
  /deep/ .el-table__body {
    width: calc(100%) !important;
  }


  /deep/ .el-table th.gutter {
    border-bottom: 2px solid #409eff;
  }
}

.data-source-dialog {
  /deep/ .el-scrollbar {
    height: 100%;
  }

  /deep/ .el-scrollbar__wrap {
    overflow-x: hidden;
  }
}

.datasource-info > label {
  width: calc(100% - 40px);
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ds-pro {
  color: #409eff;

  &:hover {
    color: #66b1ff;
  }
}

.field-filter {
  width: 156px;
}

.ds-wrapper /deep/ .el-table .cell {
  white-space: nowrap;
}

// 多表关联
.entity-rela-cont {
  .box {
    white-space: nowrap;
    padding-right: 3px;

    /deep/ .dl_col,
    /deep/ .wrap {
      position: relative;
      display: inline-block;
      vertical-align: top;
    }

    /deep/ .dl_col {
      position: relative;
      height: 38px;
      line-height: 37px;
      width: 218px;
      margin-bottom: 5px;
      border: 1px solid #dedede;
      color: #666;
      border-radius: 2px;
      background: #f1f1f1;
    }

    /deep/ .wrap {
      overflow: hidden;
      margin-left: -4px;
      position: relative;

      .box {
        margin-left: 115px;

        &:first-child > .dl_col:before {
          position: absolute;
          z-index: 200;
          top: -1px;
          left: -89px;
          width: 1px;
          height: 20px;
          background: #fff;
          content: "";
        }

        & + .box > .dl_col:after {
          position: absolute;
          top: 8px;
          left: -89px;
          width: 87px;
          height: 10px;
          border: 1px solid #dedede;
          border-width: 0 0 1px 1px;
          border-bottom-left-radius: 10px;
          content: "";
        }
      }
    }
  }
}

.entity-rela-cont {
  /deep/ .el-scrollbar__view {
    & > .entity-rela > .wrap > .box {
      margin-left: 4px;
    }

    & > .entity-rela > .wrap > .box > .tab-item:before,
    & > .entity-rela > .wrap > .box > .tab-item:after {
      display: none;
    }
  }
}

.span-ellipsis {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: block;
}

// 拓扑图关联设置浮窗
.conn-pop-container {
  padding: 8px 8px 0px 8px;
  width: 417px;
  height: 291px;

  .el-header {
    padding: 0 0 15px;

    .conn-pop-top-wrap {
      .el-col {
        height: 100%;
        text-align: center;

        .grid-content {
          font-size: 12px;
          cursor: pointer;
          padding-top: 13px;
          border: 1px solid $bd-clr1;
          height: 100%;
          border-radius: 4px;

          &.selected {
            border-color: $main-color;
            background-color: #ecf5ff;
          }
        }
      }
    }
  }

  .el-main {
    border-top: 1px dashed $bd-clr1;
    padding: 9px 0 0;
    overflow: hidden;

    .tb-tit-wrap {
      width: 100%;
      margin-bottom: 2px;

      & > div {
        display: inline-block;
        width: 170px;
        font-size: 12px;
        height: 22px;
        line-height: 22px;

        &:first-child {
          margin-right: 30px;
        }

        .tb-tit-icon {
          display: inline-block;
          vertical-align: 5px;
          margin-right: 10px;

          &.clr0 {
            color: #409eff;
          }

          &.clr1 {
            color: #67c23a;
          }

          &.clr2 {
            color: #a827f2;
          }

          &.clr3 {
            color: #b9a100;
          }

          &.clr4 {
            color: #e77645;
          }

          &.clr5 {
            color: #ff0000;
          }

          &.clr6 {
            color: #00b595;
          }

          &.clr7 {
            color: #736cff;
          }
        }

        .tb-tit-txt {
          display: inline-block;
          max-width: 148px;
          overflow: hidden;
          text-overflow: ellipsis;
          word-break: break-all;
          white-space: nowrap;
        }
      }
    }

    .sel-item-wrap {
      width: 100%;
      margin-bottom: 10px;

      &:last-child {
        margin-bottom: 0px;
      }

      .el-select {
        width: 160px;
      }

      .sel-item-opt-wrap {
        display: inline-block;
        padding: 0 10px;

        &.del-wrap {
          & > span {
            cursor: pointer;
            color: $main-color;
            font-size: 12px;
          }
        }
      }
    }

    .conn-pop-bottom-wrap {
      width: 100%;
      height: 121px;
      background-color: #f2f6fc;
      padding: 10px 0 10px 10px;

      /deep/ .el-scrollbar__wrap {
        overflow-x: hidden;
      }
    }

    .conn-pop-btn-wrap {
      width: 100%;
      text-align: right;
      margin-top: 10px;
    }
  }
}

// 连接图标
.opt {
  position: relative;
  // position: absolute;
  // left: -56px;
  // top: 50%;
  // margin-top: -13px;
  z-index: 9;
  width: 26px;
  height: 26px;
  line-height: 26px;
  text-align: center;
  background: $main-bg1;
  cursor: pointer;

  & > i {
    position: relative;
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 1px solid $main-color;
    background-color: $main-bg1;
    border-radius: 50%;
    opacity: 0.7;

    &.active {
      background-color: rgba($main-color, 0.2);
    }

    &:last-child {
      margin-left: -5px;
    }
  }

  &.dis-connect > i {
    border: 1px solid red;

    &.active {
      background-color: $main-bg1;
    }
  }

  &.inner-connect > i {
    &.active {
      background-color: $main-bg1;
    }
  }

  &.inner-join-icon {
    display: inline-block;
    width: 4px;
    height: 7px;
    // left: -45px;
    // top: 50%;
    // margin-top: -5px;
    left: -12px;
    top: -2px;
    z-index: 30;
    border-radius: 7px;
    background-color: #badcff; //0.2
    &.dis-connect {
      display: none;
    }
  }
}

.conn-pop-conn-icon.opt {
  background: transparent;
  margin: 0 auto;

  & > i {
    width: 20px;
    height: 20px;
  }

  &.inner-join-icon {
    height: 9px;
    left: -19px;
    top: -5px;
    background: #badcff;
  }
}

/*日期设置浮窗样式*/
.date-config-wrap {
  /deep/ .el-aside {
    .el-radio {
      margin-right: 0;
      margin-bottom: 18px;
      line-height: 28px;

      &:last-child {
        margin-bottom: 0px;
      }
    }
  }

  /deep/ .el-main {
    .el-form-item {
      &:last-child {
        margin-bottom: 0;
      }

      .el-select {
        width: 157px;
      }
    }
  }
}

// 弹框标题头字体
.dialog-title {
  & > span {
    line-height: 24px;
    font-size: 18px;
    color: #303133;
  }
}

.entity-opt-tooltip {
  //操作提示
  color: #c0c4cc;
  position: absolute;
  left: 50%;
  top: 50%;
  font-size: 20px;
  margin-left: -70px;
  margin-top: -26px;
}

// 维层选择弹窗 高亮绑定的维层行
.main-content-table {
  /deep/.el-table .el-table__body tr.current-row > td {
    //  current-row
    border: 1px solid #afd6ff;
    border-width: 1px 0px;
    &:first-child {
      border-left-width: 1px;
    }
    &:last-child {
      border-right-width: 1px;
    }
  }
}
</style>

<style lang="scss">
// @import '../assets/css/datasetDesign.scss';
</style>
