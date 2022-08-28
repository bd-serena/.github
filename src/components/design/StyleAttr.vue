<template>
  <div style="height:100%;width:100%;padding:10px 0 10px 20px;" class="stylattr">
    <div class="blank-mask" v-if="!isLoadData" @click="actPrevent"></div>
    <div style="height:calc(100vh - 110px);">
      <el-scrollbar style="height:100%;" :native="false" :noresize="false" tag="section">
        <div style="padding-right:20px;">
          <el-collapse v-model="activeNames" ref="collapse">
            <el-collapse-item
              v-for="(item,index) in styledata.styleAttrs"
              :title="item.cnName"
              :key="index"
              :name="index"
              v-show="collapseItemShow(item)"
            >
              <div v-for="(citem,ind) in item.children" :key="ind">
                <div
                  v-if="citem.showType =='boolean' && showCheckBox(citem,ind,item.children)&&citem.cnName!=='导出进行短信验证'"
                  :class="citem.showPaging? 'cont-line showPagingCls_1':'cont-line'"
                  :autotest="citem.enName"
                >
                  <el-checkbox
                    v-model="citem.value"
                    style="margin-right:10px;"
                    @change="setExtend(citem.enName,citem.value,citem.valueType,citem.datalength)"
                    :id="'auto'+index+'_'+citem.showType+ind"
                  ></el-checkbox>
                  <span>{{citem.cnName}}</span>
                </div>
                <div
                  v-if="citem.showType =='boolean' && showCheckBox(citem,ind,item.children)&&citem.cnName=='导出进行短信验证'&&showSms==1"
                  :class="citem.showPaging? 'cont-line showPagingCls_1':'cont-line'"
                  :autotest="citem.enName"
                >
                  <el-checkbox
                    v-model="citem.value"
                    style="margin-right:10px;"
                    @change="setExtend(citem.enName,citem.value,citem.valueType,citem.datalength)"
                    :id="'auto'+index+'_'+citem.showType+ind"
                  ></el-checkbox>
                  <span>{{citem.cnName}}</span>
                </div>
                <div
                  v-else-if="citem.showType =='text'&&showText(citem)"
                  class="cont-line"
                  :autotest="citem.enName"
                >
                  <div class="inp-line">
                    <div class="inp-line-1">
                      <span class="inp-sp">{{citem.cnName}}</span>
                    </div>
                    <div class="inp-line-2">
                      <el-input
                        size="mini"
                        v-model="citem.value"
                        placeholder="请输入内容"
                        :disabled="citem.disabled"
                        maxlength="15"
                        show-word-limit
                        @change="setExtend(citem.enName,citem.value,citem.valueType,citem.datalength)"
                        :id="'auto'+index+'_'+citem.showType+ind"
                        class="text-input"
                      ></el-input>
                    </div>
                  </div>
                </div>
                <!-- 文本域 -->
                <div v-else-if="citem.showType =='textArea'" class="cont-line"
                  :autotest="citem.enName">
                  <div class="inp-line line-3">
                    <div class="inp-line-1">
                      <span class="inp-sp">{{citem.cnName}}</span>
                    </div>
                    <div class="inp-line-2">
                      <el-input
                        type="textarea"
                        v-model="citem.value"
                        placeholder="请输入内容"
                        :disabled="citem.disabled"
                        maxlength="500"
                        :rows="4"
                        show-word-limit
                        @change="setExtend(citem.enName,citem.value,citem.valueType,citem.datalength)"
                        :id="'auto'+index+'_'+citem.showType+ind"
                        class="text-input"
                      ></el-input>
                    </div>
                  </div>
                </div>
                <!-- 交叉表聚合不显示分页 -->
                <div
                  v-else-if="citem.showType =='select'&& (citem.isShow == undefined || citem.isShow == true)&&(citem.terminalShow ? citem.terminalShow.includes(pageCache.classTypeId) : !(activedCompt.type=='CrossTable'&& activedCompt.comptAttrs.polymerizeType == 1 && citem.enName == 'pageSize'))"
                  :class="citem.showPaging? 'cont-line showPagingCls_1 showPagingCls_2':'cont-line'"
                  :autotest="citem.enName"
                >
                  <div
                    class="inp-line"
                    v-show="showTagList(citem)"
                  >
                    <div class="inp-line-1">
                      <span class="inp-sp" v-show="!citem.showPaging">{{citem.cnName}}</span>
                    </div>
                    <div class="inp-line-2">
                      <el-select
                        v-model="citem.value"
                        :multiple="citem.multiple"
                        :clearable="citem.clearable"
                        size="mini"
                        placeholder="请选择"
                        @change="changeSel(citem.selectType,citem.value,citem.enName,citem.valueType,item.enName)"
                        :class="citem.enName=='lineCombo'? 'lineCombo-select':''"
                        style="width:100%"
                        :id="'auto'+index+'_'+citem.showType+ind"
                      >
                        <el-option
                          v-for="selitem in citem.options"
                          :key="selitem.value"
                          :label="selitem.label"
                          :value="selitem.value"
                          :id="'auto_'+selitem.value"
                        ></el-option>
                      </el-select>
                    </div>
                    <div class="inp-line-1" style="margin-top: 1px;">
                      <span
                        class="inp-sp"
                        v-show="citem.showPaging"
                        style="margin-left: 10px"
                      >{{citem.cnName}}</span>
                    </div>
                  </div>
                </div>
                <div
                  v-else-if="((citem.showType =='inputNumber'&& (citem.terminalShow ? citem.terminalShow.includes(pageCache.classTypeId) : activedCompt.type!='VeCombineChart') || (citem.showType =='inputNumber'&&activedCompt.type=='VeCombineChart'&&styledata.styleAttrs[4].children[2].value==='bar') || (citem.enName === 'commonWidth' || citem.enName === 'commonHeight' || citem.enName === 'commonTitleFontSize'))) && (citem.disabled != undefined?!citem.disabled:true)&&(citem.isShow != undefined ? citem.isShow : true)"
                  class="cont-line"
                  :autotest="citem.enName"
                >
                  <div class="inp-line"  v-show="showTypeInInhputNumber(citem)">
                    <div class="inp-line-1">
                      <span class="inp-sp">{{citem.cnName}}</span>
                    </div>
                    <div class="inp-line-2">
                      <el-input-number
                        size="mini"
                        v-model="citem.value"
                        :min="inputNumberMin(citem)"
                        :max="inputNumberMax(citem)"
                        :maxlength="citem.maxLength"
                        :disabled="inputNumberEnable(citem)"
                        @change="setExtend(citem.enName,citem.showUnit&&citem.value&&!citem.notAddUnit?citem.value+citem.unitValue:citem.value,citem.valueType,citem.datalength)"
                      ></el-input-number>
                      <el-select
                        v-model="citem.unitValue"
                        size="mini"
                        placeholder="请选择"
                        v-if="citem.showUnit"
                        style="width: 85px; margin-left:5px;"
                        @change="setExtend(citem.enName,citem.value+citem.unitValue,citem.valueType,citem.datalength)"
                      >
                        <el-option
                          v-for="unit in citem.unitOptions"
                          :key="unit.value"
                          :label="unit.label"
                          :value="unit.value"
                          :id="'auto_'+unit.value"
                        ></el-option>
                      </el-select>
                    </div>
                  </div>
                </div>
                <div
                  v-else-if="citem.showType =='compdInput'&&(citem.disabled != undefined?!citem.disabled:true)"
                  class="cont-line"
                  :autotest="citem.enName"
                >
                  <div class="inp-line">
                    <div class="inp-line-1">
                      <span class="inp-sp">{{citem.cnName}}</span>
                    </div>
                    <div class="inp-line-2 compdInput">
                      <el-input
                        placeholder="请输入内容"
                        v-model="citem.inputValue"
                        class="input-with-select"
                        size="mini"
                        @change="setExtend(citem.enName,citem.inputValue,citem.valueType,citem.datalength)"
                      >
                        <el-select v-model="citem.selectValue" slot="prepend" placeholder="请选择">
                          <el-option
                            v-for="selitem in citem.options"
                            :key="selitem.value"
                            :label="selitem.label"
                            :value="selitem.value"
                          ></el-option>
                        </el-select>
                      </el-input>
                    </div>
                  </div>
                </div>
                <div
                  v-else-if="citem.showType =='colorPic'&&(citem.disabled != undefined?!citem.disabled:true)&&(citem.isShow != undefined ? citem.isShow : true)"
                  class="cont-line"
                  :autotest="citem.enName"
                >
                  <div class="inp-line">
                    <div
                      :class="['inp-line-1', {'inp_line-1_table':['thBgColor','thTextColor','tbBgColor','tbTextColor','tbBdColor'].includes(citem.enName)}]"
                    >
                      <span>{{citem.cnName}}</span>
                      <span class="icon-A10034_up" v-if="citem.iconType==1"></span>
                      <span class="icon-A10035_down" v-if="citem.iconType==2"></span>
                    </div>
                    <div
                      :class="['inp-line-2',{'inp_line-2_table':['thBgColor','thTextColor','tbBgColor','tbTextColor','tbBdColor'].includes(citem.enName)}]"
                    >
                      <el-color-picker
                        size="mini"
                        v-model="citem.value"
                        :show-alpha="true"
                        @change="setExtend(citem.enName,citem.value,citem.valueType,citem.datalength)"
                        :disabled="activedCompt.type == 'ElImage' && activedCompt.comptAttrs.extendSetting.border == '0' ? true : false"
                        :id="'auto_'+citem.enName"
                      ></el-color-picker>
                    </div>
                  </div>
                </div>
                <div
                  v-else-if="citem.showType =='radio'&& (citem.isShow == undefined || citem.isShow == true)"
                  class="cont-line"
                  :autotest="citem.enName"
                >
                  <span style="margin-right:10px;">{{citem.cnName}}</span>
                  <el-radio
                    :key="ccindex"
                    v-model="citem.value"
                    :label="item2.label"
                    v-for="(item2,ccindex) in citem.options"
                    @change="setExtend(citem.enName,citem.value,citem.valueType,citem.datalength)"
                    :id="'auto'+index+'_'+citem.showType+ind"
                  >{{item2.value}}</el-radio>
                </div>
                <div
                  v-else-if="citem.showType =='icon'&&(citem.disabled != undefined?!citem.disabled:true)"
                  class="cont-line icon-wrap"
                  :autotest="citem.enName"
                >
                  <span style="float:left;line-height:23px;">{{citem.cnName}}</span>
                  <div
                    v-if="['align','priMetricTextAlign'].includes(citem.enName)"
                    style="display: inline-block;margin-left: 10px;"
                  >
                    <div
                      v-for="(item2,ccindex) in citem.options"
                      class="align-item"
                      :class="['_wrap',{'selected':item2.label == citem.value}]"
                      @click="clickIcon(ccindex,item2.label,citem.enName,citem.valueType)"
                      :key="ccindex"
                      :id="'auto'+index+'_'+citem.showType+ind+'_'+ccindex"
                    >
                      <div>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="branch">
                    <div
                      :key="ccindex"
                      v-for="(item2,ccindex) in citem.options"
                      :class="['_wrap',{'iconSelect':item2.isSelected == true}]"
                      @click="clickIcon(ccindex,item2.label,citem.enName,citem.valueType,citem.options)"
                      :id="'auto'+index+'_'+citem.showType+ind+'_'+ccindex"
                    >
                      <el-tooltip effect="dark" :content="item2.value" placement="top-start">
                        <i :class="item2.icon"></i>
                      </el-tooltip>
                    </div>
                  </div>
                </div>
                <!-- 区间设置 -->
                <div v-else-if="citem.showType =='inputColorPic'" class="cont-line interval-cont"
                  :autotest="citem.enName">
                  <div
                    :key="ccindex"
                    v-for="(item2,ccindex) in citem.options"
                    class="inp-line"
                    style="margin-top: 10px;"
                  >
                    <div class="inp-line-1" style="width:24%;margin-right: 5px;">
                      <el-input
                        size="mini"
                        v-model="item2.min"
                        @change="setOption(ccindex,'min',item2.min)"
                        :disabled="item2.isDisabled"
                        style="width:100%;"
                        placeholder="请输入"
                        type="number"
                      ></el-input>
                    </div>
                    <div class="inp-line-1" style="width:5%;">~</div>
                    <div class="inp-line-1" style="width:24%;margin-right: 5px;">
                      <el-input
                        size="mini"
                        v-model="item2.max"
                        @change="setOption(ccindex,'max',item2.max)"
                        style="width:100%;padding-right: 5px"
                        placeholder="请输入"
                        type="number"
                      ></el-input>
                    </div>
                    <div class="inp-line-1" style="width:28px;margin-right: 5px;">
                      <el-color-picker
                        size="mini"
                        v-model="item2.color"
                        :show-alpha="true"
                        @change="setOption(ccindex,'color',item2.color)"
                      ></el-color-picker>
                    </div>
                    <div class="inp-line-1" style="width:24%;margin-right: 5px;">
                      <el-input
                        size="mini"
                        v-model="item2.intervalDesc"
                        style="width:100%;"
                        placeholder="请输入"
                        :maxlength="item2.maxLength"
                        :disabled="pageCache.classTypeId != '1005' "
                      ></el-input>
                    </div>
                    <div class="inp-line-1" style="width:5%;">
                      <el-tooltip
                        effect="dark"
                        content="删除"
                        placement="top-start"
                        v-show="item2.isShowDel"
                      >
                        <span class="el-icon-delete" @click="delOption(ccindex)"></span>
                      </el-tooltip>
                    </div>
                  </div>
                  <div class="inp-line">
                    <div class="inp-line-1" style="width:75%;;margin-right: 10px;">
                      <span class="icon-A10279-new" @click="addOption">添加</span>
                    </div>
                    <div class="inp-line-1">
                      <el-button type="primary" plain class @click="refreshData" size="mini">更新</el-button>
                    </div>
                  </div>
                </div>
                <!-- 区间设置 -->
                <div v-else-if="citem.showType == 'button'" class="cont-line"
                  :autotest="citem.enName">
                  <span class="tool-text">{{citem.cnName}}</span>
                  <el-tooltip class="item" effect="dark" :content="citem.cnName" placement="top">
                    <span
                      :class="{'tool-button':true,'actived':citem.value=='bold'}"
                      @click="setExtend(citem.enName,citem.value,'button',0,citem)"
                    >B</span>
                  </el-tooltip>
                </div>
                <div
                  v-else-if="citem.showType == 'batchSetting'&&(['ElDatagrid','CrossTable'].includes(activedCompt.type) && activedCompt.comptAttrs.polymerizeType == 2)"
                  class="cont-line"
                  :autotest="citem.enName"
                >
                  <div data-v-4c71659e class="item_label batch-item" @click="upBatchDialog(true)">
                    <span data-v-4c71659e class="icon-A10609_function"></span>
                    批量设置
                  </div>
                </div>

                <div
                  v-else-if="item.tabType =='horizontalTab'"
                  class="cont-line"
                  :autotest="citem.enName"
                  :class="item.children.length<3?'tabtwo':''"
                >
                  <el-tabs v-model="activeName" @tab-click="handleClick" v-if="ind === 0">
                    <el-tab-pane
                      v-for="(item3,cccindex) in item.children"
                      :key="cccindex"
                      :label="item3.cnName"
                      :name="`index${cccindex}`"
                    >
                      <div v-for="(item4,ccccindex) in item3.children" :key="ccccindex">
                        <div v-if="item4.showType =='text'">
                          <div class="inp-line" style="margin-top:10px;">
                            <div class="inp-line-1">
                              <span class="inp-sp">{{item4.cnName}}</span>
                            </div>
                            <div class="inp-line-2">
                              <el-input
                                maxlength="15"
                                size="mini"
                                v-model="item4.value"
                                placeholder="请输入内容"
                                show-word-limit
                                @change="setExtend(item4.enName,item4.value,item4.valueType,item4.datalength)"
                                :id="'auto_'+item3.enName+'_'+item4.showType+ccccindex"
                              ></el-input>
                            </div>
                          </div>
                        </div>
                        <div v-else-if="item4.showType =='boolean'">
                          <el-checkbox
                            v-model="item4.value"
                            style="margin-right:10px;"
                            @change="setExtend(item4.enName,item4.value,item4.valueType,item4.datalength)"
                            :id="'auto_'+item3.enName+'_'+item4.showType+ccccindex"
                          ></el-checkbox>
                          <span>{{item4.cnName}}</span>
                        </div>
                      </div>
                    </el-tab-pane>
                  </el-tabs>
                </div>
                <!-- 图标指标块-图标样式设置start -->
                <div v-else-if="citem.showOtherAttrs == 'HdIconKpiBlock'" class="cont-line"
                  :autotest="citem.enName">
                  <div class="inp-line">
                    <div class="inp-line-1">
                      <span class="inp-sp">{{citem.cnName}}</span>
                    </div>
                    <div class="inp-line-2">
                      <el-popover
                        placement="bottom"
                        width="350"
                        v-model="visible"
                        @hide="popoverHide"
                        @show="popoverShow"
                        popper-class="style-panel-popover"
                      >
                        <el-scrollbar class="popover-scroll">
                          <div class="icon-list-wrap">
                            <div
                              v-for="(iconClass,index) in iconArray"
                              :key="index"
                              class="item-icon"
                              :class="iconIndex == index?'selected':''"
                              @click="selectIcon(index,citem.enName)"
                            >
                              <div :class="iconClass"></div>
                            </div>
                          </div>
                        </el-scrollbar>
                        <div style="text-align: right;">
                          <el-button type="primary" size="mini" @click="submitIcon()">确定</el-button>
                        </div>
                        <el-button slot="reference" size="mini">选择</el-button>
                      </el-popover>
                    </div>
                  </div>
                </div>
                <!-- 图标指标块-图标样式设置end -->
                <!-- 容器组件-标签设置start -->
                <div v-else-if="item.showOtherAttrs == 'ElTabs'" class="cont-line"
                  :autotest="citem.enName">
                  <el-button
                    style="width:100%;margin-top:10px;"
                    type="primary"
                    plain
                    class
                    @click="addTab"
                    size="mini"
                  >新增Tab标签</el-button>
                  <div
                    class="tab-item-wrap"
                    v-for="(tab,idx) of activedCompt.comptAttrs.editableTabs"
                    :key="idx"
                  >
                    <div class="tab-item">
                      <div class="tab-item-tit">{{tab.title}}</div>
                      <div class="tab-item-icon">
                        <el-tooltip
                          v-show="activedCompt.type != 'ElCarousel'"
                          effect="dark"
                          content="上移"
                          placement="top-start"
                        >
                          <span class="icon-A10034_up" @click="moveTabUp(idx)"></span>
                        </el-tooltip>
                        <el-tooltip
                          v-show="activedCompt.type != 'ElCarousel'"
                          effect="dark"
                          content="下移"
                          placement="top-start"
                        >
                          <span class="icon-A10035_down" @click="moveTabDown(idx)"></span>
                        </el-tooltip>
                        <el-tooltip
                          v-show="activedCompt.type != 'ElCarousel'"
                          effect="dark"
                          content="隐藏"
                          placement="top-start"
                        >
                          <span class="icon-A10206_eyes" @click="hideTab"></span>
                        </el-tooltip>
                        <el-tooltip effect="dark" content="删除" placement="top-start">
                          <span class="icon-A10065_delete" @click="deleteTab(idx)"></span>
                        </el-tooltip>
                      </div>
                    </div>

                    <div class="inp-line">
                      <div class="inp-line-1">
                        <span class="inp-sp">标题</span>
                      </div>
                      <div class="inp-line-2">
                        <el-input
                          size="mini"
                          @focus="tabTitleFocus(tab.title)"
                          @blur="tabTitleBlur(tab)"
                          @change="checkTabName(tab.title, idx)"
                          v-model="tab.title"
                          placeholder="请输入标题"
                          maxlength="15"
                          show-word-limit
                        ></el-input>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 容器组件-标签设置end -->
                <!-- 容器组件-折叠设置start -->
                <div v-else-if="item.showOtherAttrs == 'VanCollapse'" class="cont-line"
                  :autotest="citem.enName">
                  <div
                    class="tab-item-wrap"
                    :key="idx"
                    v-for="(tab,idx) of activedCompt.comptAttrs.editableTabs"
                  >
                    <div class="tab-item">
                      <div class="tab-item-tit">{{tab.title}}</div>
                      <div class="tab-item-icon">
                        <el-tooltip effect="dark" content="隐藏" placement="top-start">
                          <span class="icon-A10206_eyes" @click="hideTab(idx)"></span>
                        </el-tooltip>
                        <el-tooltip effect="dark" content="删除" placement="top-start">
                          <span class="icon-A10065_delete" @click="deleteTab(idx)"></span>
                        </el-tooltip>
                      </div>
                    </div>

                    <div class="inp-line">
                      <div class="inp-line-1">
                        <span class="inp-sp">标题</span>
                      </div>
                      <div class="inp-line-2">
                        <el-input
                          size="mini"
                          max="15"
                          maxlength="15"
                          @focus="tabTitleFocus(tab.title)"
                          @blur="tabTitleBlur(tab)"
                          v-model="tab.title"
                          placeholder="请输入标题"
                          show-word-limit
                        ></el-input>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 容器组件-折叠设置end -->
                <!-- 大屏组件-线条设置start -->
                <div
                  v-else-if="citem.showOtherAttrs == 'HdLine'&& item.children[3].value== 'largeDots'"
                  class="cont-line"
                  :autotest="citem.enName"
                >
                  <div class="inp-line">
                    <div class="inp-line-1">
                      <span class="inp-sp">{{citem.cnName}}</span>
                    </div>
                    <div class="inp-line-2">
                      <el-input-number
                        size="mini"
                        :min="parseInt(citem.min)"
                        :max="parseInt(citem.max)"
                        v-model="citem.value"
                        :maxlength="citem.maxLength"
                        @change="setExtend(citem.enName,citem.value,citem.valueType,citem.datalength)"
                      ></el-input-number>
                    </div>
                  </div>
                </div>
                <!-- 大屏组件-线条设置end -->
                <!-- 目录组件-标签设置start -->
                <div v-else-if="citem.showOtherAttrs == 'ElBreadCrumb'" class="cont-line"
                  :autotest="citem.enName">
                  <el-button
                    style="width:100%;margin-top:10px;"
                    type="primary"
                    plain
                    class
                    @click="addTab"
                    size="mini"
                  >新增子目录</el-button>
                  <div
                    class="tab-item-wrap"
                    v-for="(tab,idx) of activedCompt.comptAttrs.editableTabs"
                    :key="idx"
                  >
                    <div class="inp-line">
                      <div class="inp-line-2">
                        <span class="inp-sp">{{numberWord[idx]+"级目录"}}</span>
                      </div>
                      <div class="inp-line-1" style="padding-left: 25px;" v-show="idx > 0">
                        <el-tooltip effect="dark" content="删除" placement="top-start">
                          <span class="icon-A10065_delete" @click="deleteTab(idx)"></span>
                        </el-tooltip>
                      </div>
                    </div>

                    <div class="inp-line">
                      <div class="inp-line-2">
                        <el-input
                          size="mini"
                          @focus="tabTitleFocus(tab.title)"
                          @blur="tabTitleBlur(tab)"
                          v-model="tab.title"
                          placeholder="请输入标题"
                          maxlength="10"
                        ></el-input>
                      </div>
                      <div class="inp-line-1" style="padding-left: 20px;">
                        <el-color-picker size="mini" v-model="tab.titleColor" :show-alpha="true"></el-color-picker>
                      </div>
                    </div>
                    <div class="inp-line">
                      <div class="inp-line-1">
                        <div class="inp-line-1">
                          <span class="inp-sp">关联链接</span>
                        </div>
                      </div>
                      <div class="inp-line-2">
                        <el-select v-model="tab.pageId" size="mini" clearable placeholder="请选择">
                          <el-option
                            v-for="option in allPageList"
                            :key="option.pageId"
                            :label="option.pageName"
                            :value="option.pageId"
                          ></el-option>
                        </el-select>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 目录组件-标签设置end -->
                <div
                  v-else-if="citem.showType =='upload'&& (citem.isShow == undefined || citem.isShow == true)"
                  class="cont-line"
                  :autotest="citem.enName"
                >
                  <div class="inp-line">
                    <div class="inp-line-1">
                      <span class="inp-sp">{{citem.cnName}}</span>
                    </div>
                    <div class="inp-line-2">
                      <el-upload
                        ref="upload"
                        class="upload-button"
                        :show-file-list="false"
                        action
                        accept=".jpg, .png"
                        :auto-upload="false"
                        :on-change="fileChange"
                      >
                        <el-button slot="trigger" size="mini" type="primary">选择</el-button>
                      </el-upload>
                      <el-button
                        v-show="activedCompt.comptAttrs.extendSetting.imgUrl!=''"
                        size="mini"
                        type="primary"
                        @click="clearImg"
                      >清除</el-button>
                    </div>
                  </div>
                </div>
                <!-- 组件列表展示类型 -->
                <div
                  v-else-if="citem.showType == 'comptList' && (citem.isShow == undefined || citem.isShow == true)"
                  class="cont-line"
                  :autotest="citem.enName"
                >
                  <div class="inp-line">
                      <div class="inp-line-1">
                        <span class="inp-sp">{{citem.cnName}}</span>
                      </div>
                  </div>
                  <BdComptList :key="activedCompt.comptId" :comptType="activedCompt.type" :list="citem.options" :activeId="citem.value" @changeHandle="changeHandle"/>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import { objDeepCopy, windowResize } from '../../utils/comonFunc.js'
import getUUID from '../../utils/UUID.js'
import BdComptList from '../template/BdComptList.vue'

export default {
  components: {
    BdComptList
  },
  props:['polymer'],
  data () {
    return {
      init: false,
      activeName: 'index1',
      activeNames: [0, 1, 2, 3, 4, 5, 6],
      lbOptions: [],
      colText: '',
      calc_value: '',
      col2_value: '',
      d1_value: '',
      d2_value: 0,
      alignSign: '',
      alignData: [
        {
          value: 0,
          label: 'left'
        },
        {
          value: 1,
          label: 'center'
        },
        {
          value: 2,
          label: 'right'
        }
      ],
      dataFormat: [
        {
          value: 0,
          label: '默认'
        },
        {
          value: 1,
          label: '小数'
        },
        {
          value: 2,
          label: '百分比'
        }
      ],
      dotPlaces: [
        {
          value: 0,
          label: '无'
        },
        {
          value: 1,
          label: '1'
        },
        {
          value: 2,
          label: '2'
        },
        {
          value: 3,
          label: '3'
        },
        {
          value: 4,
          label: '4'
        },
        {
          value: 5,
          label: '5'
        }
      ],
      formatDisable: false,
      dotDisable: false,
      tabTitleTemp: '',
      iconArray: [
        'icon-A10482_RadarMap',
        'icon-A10573_Chart',
        'icon-A10523_liveness',
        'icon-A10519_MIGU',
        'icon-A10515_WBN',
        'icon-A10122_goal',
        'icon-A10062_3strip',
        'icon-A10126_platmanage',
        'icon-A10469_AreaMap',
        'icon-A10527_Remuneration',
        'icon-A10526_payment',
        'icon-A10194_data',
        'icon-A10407_help'
      ],
      iconIndex: '',
      visible: false,
      numberWord: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'],
      showCountList: false
    }
  },
  computed: {
    ...mapGetters({
      activeComptIdx: 'PageDesign/activeComptIdx',
      activedCompt: 'PageDesign/getActivedCompt'
    }),
    ...mapState({
      s_edcuiCompts: state => state.PageDesign.s_edcuiCompts,
      isExistFlag: state => state.PageDesign.isExistFlag,
      colIndex: state => state.PageDesign.colIndex,
      datasetMap: state => state.AnalyReportAttr.datasetMap,
      activeNameX: state => state.PageDesign.activeName,
      allPageList: state => state.PageDesign.pageList,
      menuClassTypeId: state => state.HomeTree.menuClassTypeId,
      pageCache: state => state.HomeBody.pageCache,
      showSms: state => state.commonProperties.showSms,
      newStyleSetCompts: state => state.PageDesign.newStyleSetCompts
    }),
    styledata () {
      /* if (
              this.activeComptIdx > -1 &&
              this.s_edcuiCompts.length > this.activeComptIdx
            ) {
              return this.s_edcuiCompts[this.activeComptIdx];
            } else {
              return [];
            } */
      if (this.activedCompt.type != null) {
        return this.activedCompt
      } else {
        return []
      }
    },
    tabIndex () {
      let idList = []
      let tabList = this.activedCompt.comptAttrs.editableTabs || []
      if (tabList.length > 0) {
        let reg = /^TAB(\d+)$/
        for (var item of tabList) {
          if (reg.test(item.title)) {
            idList.push(item.title.match(/\d+/g)[0])
          }
        }
        if (idList.length > 0) {
          let res
          for (let i = 1; i <= tabList.length + 1; i++) {
            if (idList.indexOf(i + '') < 0) {
              res = i
              break
            }
          }
          return res
        } else {
          return 1
        }
      } else {
        return 1
      }
    },
    crossTableCount(){
      let flag = false;
      let type = '';
      let attrset = this.$parent.$parent.$parent;
      let row = attrset.selectedDimData.filter(val=>{
        return val.element_type === 1;
      })
      let col = attrset.selectedMeasureData.filter(val=>{
        return val.element_type === 1;
      })
      if(row.length>0 || col.length>0) {
        flag = true;
      }
      if(row.length>0 && col.length>0) {
        type = 'allIn';
      }
      return { flag, type};
    },
    isLoadData() {
      let val = true;
      let bindData = (this.activedCompt.comptAttrs || {}).isBindData === '1';
      if(bindData) {
        val = (this.activedCompt.comptAttrs || {}).isLoadData;
      }
      return val;
    }
  },
  methods: {
    ...mapMutations({
      // setExtenddata: "PageDesign/setExtend",
      upBatchDialog: 'QueryTable/upBatchDialog'
    }),
    ...mapActions({
      setExtenddata: 'PageDesign/setExtend',
      setJsonData: 'PageDesign/setJsonData',
      setIconDate: 'PageDesign/setIconDate',
      getColIndex: 'PageDesign/getColIndex',
      getStyleAttrIndex: 'PageDesign/getStyleAttrIndex',
      setAnotherName: 'PageDesign/setAnotherName',
      uptdistance: 'PageDesign/uptdistance',
      isExist: 'PageDesign/isExist',
      upComDevSeriesData: 'PageDesign/upComDevSeriesData',
      switchSeriesData: 'PageDesign/switchSeriesData'
    }),
    setLegendFormatter() {
      let activedCompt = this.activedCompt;
        if (!activedCompt.comptData || activedCompt.comptData.columns.length === 0) {
          return;
        }
        let decimalDigit = activedCompt.comptAttrs.decimalDigit; //获取小数点位数
        if(activedCompt.type == "VePie"  || activedCompt.type == "VeRosePie" || activedCompt.type == "VeDoughnutPie") {
          let layoutAttrs = activedCompt.styleAttrs.find((val)=>val.enName === "layoutAttrs").children || [];
          let tagList = layoutAttrs.find((val)=>val.enName === "tagList") || {};
          let tagListStyle = layoutAttrs.find((val)=>val.enName === "tagListStyle");
          if(tagList.value === true) {
            this.$set(activedCompt.comptAttrs.extendSetting, "legend.formatter", '')
            if(tagListStyle) {
              let v = tagListStyle.value; //获取列表样式
              let ComptData = activedCompt.comptData || [];
              let rows = [...ComptData.rows];
              activedCompt.comptAttrs.extendSetting["legend.formatter"] = function(name){
                let total = 0;
                const dataKey1 = ComptData.columns[0] || []
                const dataKey2 = ComptData.columns[1] || []
                rows.forEach(arr =>{
                  total += parseFloat(arr[dataKey2])//值可能是float
                })
                let legendData = name;
                if(rows){
                  rows.forEach(arr =>{
                    if(arr[dataKey1] === name){
                      const percent = total == 0 ? 0 : (arr[dataKey2]/total * 100).toFixed(decimalDigit);
                      switch(v) {
                        case "0":
                          legendData += " " + parseFloat(arr[dataKey2]).toFixed(decimalDigit) + " " + percent +'%';
                          break;
                        case "1":
                          legendData += " " + parseFloat(arr[dataKey2]).toFixed(decimalDigit);
                          break;
                        case "2":
                          legendData += " "+ percent +'%';
                          break;
                        default:
                          legendData += " ";
                      }
                    }
                  })
                }
                return legendData;
              }
            }
          }
        }
      },
        //判断是否展示列表样式
    showTagList(citem){
      let activedCompt = this.activedCompt
      if((activedCompt.type === 'VePie' || activedCompt.type === 'VeRosePie' || activedCompt.type === 'VeDoughnutPie') && citem.enName === 'tagListStyle') {
        //标签样式
        if(activedCompt.styleAttrs.find((val)=>val.enName === "layoutAttrs").children.find((val)=>val.enName === "tagList").value === true) {
          return true
        }
        return false
      }else {
        //其他图形
        return activedCompt.type==='VeCombineStack' ? citem.cnName!=='类型':activedCompt.type==='CrossTable'&&citem.enName=='subTotalCol' ? this.showCountList : citem.disabled != undefined?!citem.disabled:true
      }
    },
    showTypeInInhputNumber (citem) {
      let activedCompt = this.activedCompt
      //仅限制在饼图和玫瑰图且是环线条宽度
      if ((activedCompt.type === 'VeRosePie' || activedCompt.type === 'VePie') && citem.enName === 'ringLineWidth') {
        //单值百分比没有photoType = pie || ring 的属性
        if(activedCompt.styleAttrs.find((val)=>val.enName === "layoutAttrs").children.find((val)=>val.enName === "series.0.radius").photoType === 'pie') {
          return false;
        }
      }
      return true;
    },
    collapseItemShow (item) {
      let activedCompt = this.activedCompt
      let pageCache = this.pageCache

      if (
        (item.terminalShow &&
          item.terminalShow.includes(pageCache.classTypeId)) ||
        !(
          item.terminalShow &&
          ['CrossTable', 'PivotTable'].includes(activedCompt.type) &&
          item.enName == 'otherAttrs' &&
          activedCompt.comptAttrs.polymerizeType == 1
        )
      ) {
        return true
      }
      return false
    },
    legendFormatter(name) {
        let name1 = name,
          legendData = this.vscompt.comptAttrs.extendSetting.legendData || {};
        if (legendData[name]) name1 = legendData[name].name;
        return name1;
      },
    changeSel (s_type, val, key, type, parentEnname) {
      // parentEnname 父节点的enName
      let activedCompt = this.activedCompt;
      // 系列设置 且是进度条调用切换系列方法
      if (key === 'comptData' && this.newStyleSetCompts.includes(activedCompt.type)) {
        this.switchSeriesData();
        return;
      }

      // 第三方组件系列切换，更新数据
      if (
        s_type === 0 &&
        key === 'seriesData' &&
        activedCompt &&
        activedCompt.comptAttrs &&
        activedCompt.comptAttrs.isExtComp === '1'
      ) {
        this.upComDevSeriesData({ key, val, type, parentEnname })
        return
      }

      let comptType = activedCompt.type
      let styleAttrs = activedCompt.styleAttrs
      // let layoutAttrs = activedCompt.layoutAttrs;

      let extendSetting = activedCompt.comptAttrs.extendSetting
      let seriesAttrs
      let commonAttrs
      let layoutAttrs

      styleAttrs.forEach(data => {
        if (data.enName == 'seriesAttrs') {
          seriesAttrs = data.children
        }
        if (data.enName == 'commonAttrs') {
          commonAttrs = data.children
        }
        if (data.enName == 'layoutAttrs') {
          layoutAttrs = data.children
        }
      })
      if (comptType == 'HdBorderWrap') {
        if (key == 'styleChange') {
          if (val == 'type1') {
            layoutAttrs.forEach(element => {
              if (
                ['flashShow', 'flashDirection', 'evertDirection'].includes(
                  element.enName
                )
              ) {
                element.disabled = false
              }
              if (
                [
                  'backgroundColor',
                  'bdSize',
                  'backgroundColor',
                  'borderColor',
                  'opacityNum',
                  'SFlashShow',
                  'SFlashDirection',
                  'TEvertDirection'
                ].includes(element.enName)
              ) {
                element.disabled = true
              }
            })
          }
          if (val == 'type2') {
            layoutAttrs.forEach(element => {
              if (
                [
                  'TEvertDirection',
                  'opacityNum',
                  'SFlashShow',
                  'SFlashDirection'
                ].includes(element.enName)
              ) {
                element.disabled = false
              }
              if (
                [
                  'backgroundColor',
                  'bdSize',
                  'backgroundColor',
                  'borderColor',
                  'flashShow',
                  'flashDirection',
                  'evertDirection'
                ].includes(element.enName)
              ) {
                element.disabled = true
              }
            })
          }

          if (val == 'type3') {
            layoutAttrs.forEach(element => {
              // console.log("element的名字", element.enName);
              if (
                [
                  'flashShow',
                  'flashDirection',
                  'evertDirection',
                  'opacityNum',
                  'SFlashShow',
                  'SFlashDirection',
                  'TEvertDirection'
                ].includes(element.enName)
              ) {
                element.disabled = true
              }
              if (
                ['backgroundColor', 'bdSize', 'borderColor'].includes(
                  element.enName
                )
              ) {
                element.disabled = false
              }
            })
          }
        }
      }
      if (comptType == 'HdButton' && val == 'none') {
        extendSetting.borderWidth = 0
        for (let opt of styleAttrs[0].children) {
          if (opt.enName == 'borderWidth') {
            opt.value = 0
            break
          }
        }
      }
      if (s_type == 0) {
        if (
          !['ElDatagrid', 'CrossTable', 'ElSwiper', 'PivotTable'].includes(comptType) &&
          comptType != 'HdIconKpiBlock' && key !== 'tagListStyle' && key !== 'ringLineWidth'
        ) {
          this.getColIndex(val)
        }
        if(key === 'tagListStyle') {
          let digital = 0
          if(activedCompt.comptAttrs['decimalDigit'] !== 0) {
            digital = activedCompt.comptAttrs['decimalDigit']
          }
          this.$set(activedCompt.comptAttrs.extendSetting, "legend.formatter", '')
        activedCompt.comptAttrs.extendSetting["legend.formatter"] = function(name){
            let total = 0
            let legendData = name
            let ComptData = activedCompt.comptData
            const dataKey1 = ComptData.columns[0]
            const dataKey2 = ComptData.columns[1]
            ComptData.rows.forEach(arr =>{
              total += parseFloat(arr[dataKey2])//值可能是float
            })
            if(ComptData){
			  if(val === '0'){
				  ComptData.rows.forEach(arr =>{
					  if(arr[dataKey1] === name){
            const percent = total == 0 ? 0 : (arr[dataKey2]/total * 100).toFixed(digital)
						legendData += " " + parseFloat(arr[dataKey2]).toFixed(digital) + " " + percent +'%'
					  }
				  })
			  }
			  if(val === '1'){
				  ComptData.rows.forEach(arr =>{
					  if(arr[dataKey1] === name){
						legendData += " " + parseFloat(arr[dataKey2]).toFixed(digital)
					  }
				  })
			  }
			  if(val === '2'){
				  ComptData.rows.forEach(arr =>{
					  if(arr[dataKey1] === name){
						const percent = total == 0 ? 0 : (arr[dataKey2]/total * 100).toFixed(digital)
						legendData += " "+ percent +'%'
					  }
				  })
			  }
            }
            return legendData;
        }
        }
        if (['HdKpiBlock', 'HdKpiBlock2', 'HdKpiBlock3'].includes(comptType)) {
          // 指标1-2-3的值设置
          this.$set(activedCompt.comptAttrs, 'selectIndex', val)
          seriesAttrs.forEach(seriesOptions => {
            if (seriesOptions.enName == 'rename') {
              // switch (seriesOptions.enName) {
              //   case "rename":
              var v = this.activedCompt.styleAttrs[1].children[0].options[
                activedCompt.comptAttrs.selectIndex
              ].label
              seriesOptions.value =
                activedCompt.comptData.columns[
                  activedCompt.comptAttrs.selectIndex
                ]

              if (seriesOptions.value == v) {
                seriesOptions.value = ''
              }
              // break;
              // }
            }
          })

          commonAttrs.forEach(seriesOptions => {
            if (
              ['riseNum', 'riseIconColor', 'dropNum', 'dropIconColor'].includes(
                seriesOptions.enName
              )
            ) {
              seriesOptions.disabled = !extendSetting.series[
                activedCompt.comptAttrs.selectIndex
              ].setCondi // 启用条件格式未勾选隐藏，勾选则显示
            }
            switch (seriesOptions.enName) {
              case 'decimalDigit':
                seriesOptions.value =
                  extendSetting.series[activedCompt.comptAttrs.selectIndex]
                    .decimalDigit != null
                    ? extendSetting.series[activedCompt.comptAttrs.selectIndex]
                      .decimalDigit
                    : ''
                break
              case 'numberType':
                var v = extendSetting.series[
                  activedCompt.comptAttrs.selectIndex
                ].numberType
                  ? extendSetting.series[activedCompt.comptAttrs.selectIndex]
                    .numberType
                  : ''

                if (v == '') {
                  seriesOptions.value = '无'
                } else if (v == 1) {
                  seriesOptions.value = '小数点'
                } else if (v == 2) {
                  seriesOptions.value = '百分比'
                } else {
                  seriesOptions.value = '无'
                }
                break
              case 'setCondi':
                seriesOptions.value =
                  extendSetting.series[activedCompt.comptAttrs.selectIndex]
                    .setCondi || false
                break
              case 'riseNum':
                seriesOptions.inputValue = extendSetting.series[
                  activedCompt.comptAttrs.selectIndex
                ].riseNum
                  ? extendSetting.series[activedCompt.comptAttrs.selectIndex]
                    .riseNum
                  : null
                break
              case 'riseIconColor':
                seriesOptions.value = extendSetting.series[
                  activedCompt.comptAttrs.selectIndex
                ].riseIconColor
                  ? extendSetting.series[activedCompt.comptAttrs.selectIndex]
                    .riseIconColor
                  : '#ff6000'
                break
              case 'dropNum':
                seriesOptions.inputValue = extendSetting.series[
                  activedCompt.comptAttrs.selectIndex
                ].dropNum
                  ? extendSetting.series[activedCompt.comptAttrs.selectIndex]
                    .dropNum
                  : null
                // if (seriesOptions.inputValue != null) {
                // } else {
                //   if (comptType == "HdKpiBlock3") {
                //     //指标3
                //     this.activedCompt.styleAttrs[1].children[4].value = false; // 是否启用条件格式
                //   } else {
                //     //指标1-2
                //     this.activedCompt.styleAttrs[1].children[5].value = false; // 是否启用条件格式
                //   }
                // }
                break
              case 'dropIconColor':
                seriesOptions.value = extendSetting.series[
                  activedCompt.comptAttrs.selectIndex
                ].dropIconColor
                  ? extendSetting.series[activedCompt.comptAttrs.selectIndex]
                    .dropIconColor
                  : '#67C23A'
                break
            }
          })
        } else if (comptType == 'PcKpiBlock') {
          this.$set(activedCompt.comptAttrs, 'selectIndex', val)
          seriesAttrs.forEach(seriesOptions => {
            if (
              ['riseNum', 'riseIconColor', 'dropNum', 'dropIconColor'].includes(
                seriesOptions.enName
              )
            ) {
              seriesOptions.disabled = !extendSetting.series[
                activedCompt.comptAttrs.selectIndex
              ].setCondi // 启用条件格式未勾选隐藏，勾选则显示
            }
            switch (seriesOptions.enName) {
              case 'rename':
                if (comptType == 'PcKpiBlock') {
                  let nickName =
                    activedCompt.comptAttrs.yAxis1Data[
                      activedCompt.comptAttrs.selectIndex
                    ].nick_name
                  if (
                    nickName &&
                    nickName !==
                      styleAttrs[2].children[0].options[
                        activedCompt.comptAttrs.selectIndex
                      ].label
                  ) {
                    seriesOptions.value =
                      activedCompt.comptData.columns[
                        activedCompt.comptAttrs.selectIndex + 1
                      ]
                  } else {
                    seriesOptions.value = ''
                  }
                } else {
                  seriesOptions.value =
                    activedCompt.comptData.columns[
                      activedCompt.comptAttrs.selectIndex
                    ]
                }

                break
              case 'decimalDigit':
                seriesOptions.value =
                  extendSetting.series[activedCompt.comptAttrs.selectIndex]
                    .decimalDigit != null
                    ? extendSetting.series[activedCompt.comptAttrs.selectIndex]
                      .decimalDigit
                    : 3
                break
              case 'setCondi':
                seriesOptions.value = extendSetting.series[
                  activedCompt.comptAttrs.selectIndex
                ].setCondi
                  ? extendSetting.series[activedCompt.comptAttrs.selectIndex]
                    .setCondi
                  : false
                break
              case 'riseNum':
                seriesOptions.inputValue = extendSetting.series[
                  activedCompt.comptAttrs.selectIndex
                ].riseNum
                  ? extendSetting.series[activedCompt.comptAttrs.selectIndex]
                    .riseNum
                  : null
                break
              case 'riseIconColor':
                seriesOptions.value = extendSetting.series[
                  activedCompt.comptAttrs.selectIndex
                ].riseIconColor
                  ? extendSetting.series[activedCompt.comptAttrs.selectIndex]
                    .riseIconColor
                  : ''
                break
              case 'dropNum':
                seriesOptions.inputValue = extendSetting.series[
                  activedCompt.comptAttrs.selectIndex
                ].dropNum
                  ? extendSetting.series[activedCompt.comptAttrs.selectIndex]
                    .dropNum
                  : null
                break
              case 'dropIconColor':
                seriesOptions.value = extendSetting.series[
                  activedCompt.comptAttrs.selectIndex
                ].dropIconColor
                  ? extendSetting.series[activedCompt.comptAttrs.selectIndex]
                    .dropIconColor
                  : ''
                break
            }
          })
        }
        if (
          ['ElDatagrid', 'CrossTable', 'ElSwiper', 'PivotTable'].includes(
            this.activedCompt.type
          )
        ) {
          // 表格列设置下拉框切换调用的方法
          this.fillBackSeriesData({ value: val, enName: key, valueType: type })
        }

        if (this.activedCompt.type == 'VeRadar') {
          // 设置雷达图的系列设置缓存值
          if (
            activedCompt.comptAttrs.extendSetting['legendData'][
              activedCompt.styleAttrs[2].children[0].value
            ] != undefined
          ) {
            // 别名
            if (
              activedCompt.comptAttrs.extendSetting['legendData'][val].name !=
              val
            ) {
              activedCompt.styleAttrs[2].children[1].value =
                activedCompt.comptAttrs.extendSetting['legendData'][val].name
            } else {
              activedCompt.styleAttrs[2].children[1].value = ''
            }

            // 小数点
            activedCompt.styleAttrs[2].children[2].value =
              activedCompt.comptAttrs.extendSetting['legendData'][val].dot + ''

            // 颜色
            activedCompt.styleAttrs[2].children[3].value =
              activedCompt.comptAttrs.extendSetting['color'][this.colIndex]
          } else {
            activedCompt.styleAttrs[2].children[1].value = ''
            activedCompt.styleAttrs[2].children[2].value = '0'
            activedCompt.styleAttrs[2].children[3].value = ''
          }
        }

        if (comptType == 'HdIconKpiBlock') {
          seriesAttrs.forEach(seriesOptions => {
            if (seriesOptions.enName == 'rename') {
              // switch (seriesOptions.enName) {
              //   case "rename":
              let nickName = activedCompt.comptData.columns[0]
              if (
                nickName &&
                nickName !== styleAttrs[1].children[0].options[0].label
              ) {
                seriesOptions.value = activedCompt.comptData.columns[0]
              } else {
                seriesOptions.value = ''
              }
              // break;
            }
          })
          if (key == 'numberFormat') {
            switch (val) {
              case '1':
                styleAttrs[2].children[0].disabled = false
                styleAttrs[3].children[1].isShow = true
                extendSetting.decimals = styleAttrs[3].children[1].value
                break
              case '2':
                styleAttrs[2].children[0].disabled = true
                styleAttrs[2].children[0].value = '%'
                styleAttrs[3].children[1].isShow = true
                extendSetting.decimals = styleAttrs[3].children[1].value
                extendSetting.metricUnit = '%'
                break
              default:
                styleAttrs[2].children[0].disabled = false
                styleAttrs[3].children[1].isShow = false
                extendSetting.decimals = ''
                styleAttrs[3].children[1].value = ''
            }
          }
        }
      } else {
        this.setExtend(key, val, type)
      }
    },
    clickIcon (index, val, key, valueType, options) {
      if (valueType == 'String') {
        this.setSelect(val, options)
        this.setExtend(key, val, valueType)
      } else if (this.activedCompt.type == 'ElTabs') {
        if (this.activedCompt.comptAttrs.extendSetting.canAlign == false) {
          this.$message.error('tab页过多无法设置对齐方式')
          return
        }
        this.setIconDate(index)
        this.setExtend('tabAlign', val, '', 0)
      } else if (this.activedCompt.type == 'ElCarousel') {
        this.setIconDate(index)
        this.setExtend('direction', val, '', 0)
      } else if (this.activedCompt.type == 'HdBorderWrap') {
        this.setIconDate(index)
        this.setExtend('flashDirection', val, '', 0)
        this.setExtend('SFlashDirection', val, '', 0)
      } else {
        this.setIconDate(index)
        let obj
        let right = {
          top: 'center',
          right: 'right',
          orient: 'vertical'
        }
        let left = {
          top: 'center',
          left: 'left',
          orient: 'vertical'
        }
        let bottom = { bottom: 20, orient: 'horizontal' }
        let show = { show: false }
        let top = { top: 10, orient: 'horizontal' }
        if (val == 'top') {
          obj = top
        } else if (val == 'right') {
          obj = right
        } else if (val == 'bottom') {
          obj = bottom
        } else if (val == 'left') {
          obj = left
        } else {
          obj = show
        }
        if (['VeAreaMap', 'VeLines'].includes(this.activedCompt.type)) {
          if (this.activedCompt.type === 'VeLines' && val === 'bottom') {
            obj = { orient: 'vertical', top: 'bottom', left: 'right' }
          }
          // 区域地图，保存图例legend.data
          obj['data'] = this.activedCompt.comptAttrs.extendSetting.legend.data
          this.activedCompt.styleAttrs[1].children[0].value = index
        }

        this.setExtend('legend', obj, '', 0)
        if (obj == left) {
          this.uptdistance('left')
        } else if (obj == right) {
          this.uptdistance('right')
        } else if (obj == bottom) {
          // if (
          //   this.activedCompt.type == "VeRosePie" ||
          //   this.activedCompt.type == "VePie"
          // ) {
          //   let object = { bottom: 27, orient: "horizontal" };
          //   this.setExtend("legend", object, "", 0);
          // }
          // let object = { bottom: 15, orient: "horizontal" };
          // this.setExtend("legend", object, "", 0);
          this.uptdistance('bottom')
        } else {
          // if (
          //   this.activedCompt.type == "VeRosePie" ||
          //   this.activedCompt.type == "VePie"
          // ) {
          //   let object = { top: 10, orient: "horizontal" };
          //   this.setExtend("legend", object, "", 0);
          // }
          this.uptdistance('top')
        }
      }
    },
    setSelect(val,options = []) {
      options.forEach(v => {
        v.isSelected = v.label === val ? true : false;
      })
    },
    setExtend (key, val, type, length, obj) {
      // 值发生改变时候设置值
      let activedCompt = this.activedCompt
      let comptType = activedCompt.type
      let styleAttrs = activedCompt.styleAttrs
      let extendSetting = activedCompt.comptAttrs.extendSetting
      let seriesAttrs,commonAttrs,layoutAttrs,seriesRadius;
      // 勾选展示标题显示字体大小和字体颜色否则隐藏
      if (key === 'comptName.show') {
        if(val){
          this.activedCompt.styleAttrs.find((val)=>val.enName === "commonAttrs").children.find((val)=>val.enName === "commonTitleFontSize").isShow=true
          this.activedCompt.styleAttrs.find((val)=>val.enName === "commonAttrs").children.find((val)=>val.enName === "commonTitleColor").isShow=true
        }else{
          this.activedCompt.styleAttrs.find((val)=>val.enName === "commonAttrs").children.find((val)=>val.enName === "commonTitleFontSize").isShow=false
          this.activedCompt.styleAttrs.find((val)=>val.enName === "commonAttrs").children.find((val)=>val.enName === "commonTitleColor").isShow=false
        }
      }

      // 漏斗图
      if(['VeFunnel', 'VeCompareFunnel'].includes(activedCompt.type)) {
        if (['series.label.position', 'series.label.show'].includes(key)) {
          const attrName = key.substring(key.lastIndexOf('.') + 1);
          this.$set(this.activedCompt.comptAttrs.setting.label, attrName, val);
          return;
        } else if ('labelFormatType' === key) {
          this.$set(this.activedCompt.comptAttrs.extendSetting, key, val);
          return;
        }
      }

      // 排行榜
      if(activedCompt.type === 'RankList') {
        this.$set(this.activedCompt.comptAttrs.extendSetting, key, val);
        if (key === 'dataLabelShow') {
          activedCompt.styleAttrs.find((val)=>val.enName === "compStyleAttrs").children.find((val)=>val.enName === "labelShowPosition").isShow=val;
        }
        return;
      }

      if (this.newStyleSetCompts.includes(activedCompt.type)) {
        this.setSeriesData({key, val, type, length, obj});
      }


      if(activedCompt.type === 'VePie' || activedCompt.type === 'VeRosePie') {
        layoutAttrs = activedCompt.styleAttrs.find((val)=>val.enName === "layoutAttrs").children || [];
        seriesRadius = layoutAttrs.find((val)=>val.enName === "series.0.radius") || {};
        if(key === 'series.0.radius'){
          let arrRadius = eval(val)
          if(arrRadius[0] === '30%'){
            seriesRadius.photoType = 'ring'
          }
          if(arrRadius[0] === '0%'){
            seriesRadius.photoType = 'pie'
          }
        }
      }

      if (comptType === 'VePie' || comptType === 'VeRosePie' || activedCompt.type === 'VeDoughnutPie') {
        this.$set(activedCompt.comptAttrs.extendSetting, "legend.formatter", '')
        activedCompt.comptAttrs.extendSetting["legend.formatter"] = function(name){
          //首先判断标签列表是否存在-加上标签列表选中--
          if(val === true && activedCompt.styleAttrs.find((val)=>val.enName === "layoutAttrs").children.find((val)=>val.enName === "legend").options[0].isSelected === true && (activedCompt.comptAttrs.extendSetting["series.0.labelLine.show"] === false || activedCompt.comptAttrs.extendSetting.series.labelLine.show === false) && key === 'tagList'){
            this.setLegendFormatter();
          } else {
            return name;
          }
        }
      }

      if (type == 'Number') {
        val = Number(val)
      }

      if (comptType == 'HdTime') {
        if (key == 'color' && val == null) {
          val = '#fff'
        }
      }
      if (comptType == 'HdTopFive') {
        if (key == 'barBackColor' && val == null) {
          val = ''
        } else if (key == 'fontColor' && val == null) {
          val = '#fff'
        }
      }
      if (comptType == 'HdWater') {
        if (key == 'BgColor' && val == null) {
          val = '#409EFF'
        } else if (
          (key == 'fontColor' || key == 'numFontColor') &&
          val == null
        ) {
          val = '#fff'
        }
      }

      if (comptType == 'HdFlopDevice') {
        if (key == 'unitColor' && val == null) {
          val = '#fff'
        }
        if (key == 'kpiColor' && val == null) {
          val = '#fff'
        }
        if (key == 'fontColor' && val == null) {
          val = '#fff000'
        }
      }
      if (comptType == 'HdVerTitle') {
        if (key == 'fontColor' && val == null) {
          val = '#00f6ff'
        }
      }
      if (comptType == 'HdTitleShape') {
        if (key == 'fontColor' && val == null) {
          val = '#0000ff'
        }
      }
      if (comptType == 'HdTextarea' || comptType == 'PcTextarea') {
        if (key == 'bgColor' && val == null) {
          val = 'transparent'
        }
        if (key == 'borderColor' && val == null) {
          val = '#ccc'
        }
        if (key == 'color' && val == null) {
          val = '#fff'
        }
      }
      if (comptType == 'HdButton') {
        if (key == 'backgroundColor' && val == null) {
          val = '#174f95'
        }
        if (key == 'borderColor' && val == null) {
          val = '#2762ab'
        }
        if (key == 'fontColor' && val == null) {
          val = '#fff'
        }
      }
      if (
        (comptType == 'HdVerticalLine' ||
          activedCompt.type == 'HdHorizontalLine') &&
        val == null
      ) {
        val = '#666'
      }
      if (activedCompt.type === 'VeRadar') {
        // 雷达图颜色清空
        if (key === 'series.index.itemStyle.normal.color' && val === null) {
          val = activedCompt.comptAttrs.defaultColor[this.colIndex]
        }
      }

      styleAttrs.forEach(obj1 => {
        if (obj1.enName == 'seriesAttrs') {
          seriesAttrs = obj1.children
        }
        if (obj1.enName == 'commonAttrs') {
          commonAttrs = obj1.children
        }
        // if (obj1.enName == 'otherAttrs') {
        //   otherAttrs = obj1.children
        // }
      })

      /* 交叉表 颜色默认值 */
      if (['CrossTable', 'PivotTable'].includes(comptType)) {
        /* if (val === null && ['tbTextColor', 'thTextColor', 'thBgColor', 'tbBgColor', 'tbBdColor'].includes(key)) {
          let colorObj = {
            tbTextColor: '#303133',
            thTextColor: '#303133',
            thBgColor: '#f5f7fa',
            tbBgColor: '#ffffff',
            tbBdColor: '#ebeef5',
          }
          val = colorObj[key]
        } else  */if (key === 'setCondi') {
          let iconType = 1
          let cnName = '显示为'
          let disabled = false
          if (val === 'showNum') {
            iconType = 0
            cnName = '数值颜色'
          } else if (val === 'default') {
            disabled = true
          }
          seriesAttrs.forEach(obj1 => {
            if (['num1', 'num2'].includes(obj1.enName)) {
              obj1.disabled = disabled
            } else if (['iconColor1', 'iconColor2'].includes(obj1.enName)) {
              if (iconType === 1 && obj1.enName === 'iconColor2') {
                iconType = 2
              }
              let temp = {
                cnName,
                iconType,
                disabled
              }
              Object.assign(obj1, temp)
            }
          })
        } else if (key === 'subTotal') {
         /*  otherAttrs.some(obj1 => {
            if (['totalRow'].includes(obj1.enName)) {
              obj1.disabled = !val
              return true
            }
          }) */
          // this.$set(this.activedCompt.comptAttrs.extendSetting, 'needTotal', !this.activedCompt.comptAttrs.extendSetting.needTotal)
          this.$set(this.activedCompt.comptAttrs.extendSetting, 'subTotal', !this.activedCompt.comptAttrs.extendSetting.subTotal)
          this.showSubTotalCol(val, null)
        } else if (key === 'totalRow') {
          this.$set(this.activedCompt.comptAttrs.extendSetting, 'needTotal', !this.activedCompt.comptAttrs.extendSetting.needTotal)
          this.showSubTotalCol(null, val)
        }
      }

      if (["PcKpiBlock", "HdKpiBlock", "HdKpiBlock2", "HdKpiBlock3"].includes(comptType)) {
        //指标1,2,3为数值设置
        if (["HdKpiBlock", "HdKpiBlock2", "HdKpiBlock3"].includes(comptType)) {
          styleAttrs.forEach(obj1 => {
            if (obj1.enName == 'numberAttrs') {
              commonAttrs = obj1.children
            }
          })
        }
        if (
          ['riseNum', 'riseIconColor', 'dropNum', 'dropIconColor'].includes(key)
          // && extendSetting.series[activedCompt.comptAttrs.selectIndex].setCondi
        ) {
          let ris
          let drop
          // 最大值
          commonAttrs.forEach(data => {
            if (['riseNum'].includes(data.enName)) {
              ris = data.inputValue
            }
          })

          // 最小值
          commonAttrs.forEach(data => {
            if (['dropNum'].includes(data.enName)) {
              drop = data.inputValue
            }
          })

          // 如果min > max   开始置换值
          if (parseInt(drop) > parseFloat(ris)) {
            commonAttrs.forEach(data => {
              if (['dropNum'].includes(data.enName)) {
                data.inputValue = ris
              }
            })

            key = 'dropNum'
            val = ris
          }

          if (extendSetting.series[activedCompt.comptAttrs.selectIndex].setCondi) {
            // 设置值
            this.$set(extendSetting.series[activedCompt.comptAttrs.selectIndex], key, val)
          }
        }
        // 设置单位值
        if (['textname'].includes(key)) {
          let val1 = this.activedCompt.styleAttrs[1].children[4].value
          // 将值设置到组件中
          this.$set(this.activedCompt.comptAttrs.extendSetting.unitData[0], key, val1)
        }

        switch (key) {
          case 'rename':
            if (comptType == 'PcKpiBlock') {
              if (val == styleAttrs[2].children[0].options[ activedCompt.comptAttrs.selectIndex ].label) {
                this.$message.error('该度量已存在')
                return
              }
              if (!val) {
                val = styleAttrs[2].children[0].options[ activedCompt.comptAttrs.selectIndex ].label
              }
              activedCompt.comptData.rows.forEach(rowsData => {
                rowsData[val] = rowsData[ activedCompt.comptData.columns[ activedCompt.comptAttrs.selectIndex + 1 ] ]
                delete rowsData[ activedCompt.comptData.columns[ activedCompt.comptAttrs.selectIndex + 1 ] ]
              })
              activedCompt.comptData.columns.splice([activedCompt.comptAttrs.selectIndex + 1], 1, val)
            } else if (["HdKpiBlock", "HdKpiBlock2", "HdKpiBlock3"].includes(comptType)) {
              if (!val) {
                val = this.activedCompt.styleAttrs[1].children[0].options[ activedCompt.comptAttrs.selectIndex ].label
              }
              activedCompt.comptData.rows.forEach(rowsData => {
                rowsData[val] = rowsData[ activedCompt.comptData.columns[ activedCompt.comptAttrs.selectIndex ] ]
                delete rowsData[ activedCompt.comptData.columns[ activedCompt.comptAttrs.selectIndex ] ]
              })
              activedCompt.comptData.columns.splice([activedCompt.comptAttrs.selectIndex], 1, val)
            }

            // 最后统一设置值
            extendSetting.series[ activedCompt.comptAttrs.selectIndex ].name = val
            activedCompt.comptAttrs.yAxis1Data[ activedCompt.comptAttrs.selectIndex ].nick_name = val
            break
          case 'isdigitRoll':
            // 是否翻转--(将数据设置到系列中)
            this.$set(extendSetting.series[activedCompt.comptAttrs.selectIndex], key, val)
            break
          // 数值类型--(将数据设置到系列中)
          case 'numberType':
            this.$set(extendSetting.series[activedCompt.comptAttrs.selectIndex], key, parseInt(val))
            switch (val) {
              case '1' : styleAttrs[2].children[1].isShow = true; break
              case '2' : styleAttrs[2].children[1].isShow = true; break
              default: this.$set(extendSetting.series[activedCompt.comptAttrs.selectIndex], 'decimalDigit', '')
                styleAttrs[2].children[1].value = ''
                styleAttrs[2].children[1].isShow = false
            }
            break
          // 精度--(将数据设置到系列中)
          case 'decimalDigit':
            this.$set(extendSetting.series[activedCompt.comptAttrs.selectIndex], key, parseInt(val))
            break
          case 'setCondi':
            this.$set(extendSetting.series[activedCompt.comptAttrs.selectIndex], key, val)
            // 指标1,2,3预警箭头设置
            if (["HdKpiBlock", "HdKpiBlock2", "HdKpiBlock3"].includes(comptType)) {
              let ris
              let drop
              // 最大值
              commonAttrs.forEach(data => {
                if (['riseNum'].includes(data.enName)) {
                  ris = data.inputValue
                }
              })

              // 最小值
              commonAttrs.forEach(data => {
                if (['dropNum'].includes(data.enName)) {
                  drop = data.inputValue
                }
              })

              // 如果min > max   开始置换值
              if (parseInt(drop) > parseFloat(ris)) {
                commonAttrs.forEach(data => {
                  if (['dropNum'].includes(data.enName)) {
                    data.inputValue = ris
                  }
                })
              }

              // 设置预警值
              commonAttrs.forEach(data => {
                if (
                  [
                    'riseNum',
                    'riseIconColor',
                    'dropNum',
                    'dropIconColor'
                  ].includes(data.enName)
                ) {
                  data.disabled = !val // 启用条件格式未勾选隐藏，勾选则显示
                  if (val) {
                    this.$set(
                      extendSetting.series[activedCompt.comptAttrs.selectIndex],
                      data.enName,
                      data.value || data.inputValue
                    )
                  } else {
                    this.$set(
                      extendSetting.series[activedCompt.comptAttrs.selectIndex],
                      data.enName,
                      null
                    )
                  }
                }
              })
            } else {
              seriesAttrs.forEach(data => {
                if (
                  [
                    'riseNum',
                    'riseIconColor',
                    'dropNum',
                    'dropIconColor'
                  ].includes(data.enName)
                ) {
                  data.disabled = !val // 启用条件格式未勾选隐藏，勾选则显示
                  if (val) {
                    this.$set(
                      extendSetting.series[activedCompt.comptAttrs.selectIndex],
                      data.enName,
                      data.value || data.inputValue
                    )
                  } else {
                    this.$set(
                      extendSetting.series[activedCompt.comptAttrs.selectIndex],
                      data.enName,
                      null
                    )
                  }
                }
              })
            }

            break
          case 'priMetricTextAlign':
            styleAttrs[1].children.forEach(data => {
              if (data.enName == key) {
                data.value = val
              }
            })
            this.setExtenddata({ key, val })
            break
          default:
            this.setExtenddata({ key, val })
        }
      } else if (comptType == 'HdIconKpiBlock') {
        switch (key) {
          case 'rename':
            if (val == styleAttrs[1].children[0].options[0].label) {
              this.$message.error('该度量已存在')
              return
            }
            if (!val) {
              val = styleAttrs[1].children[0].options[0].label
            }
            activedCompt.comptData.rows.forEach(rowsData => {
              rowsData[val] = rowsData[activedCompt.comptData.columns[0]]
              delete rowsData[activedCompt.comptData.columns[0]]
            })
            activedCompt.comptData.columns.splice(0, 1, val)
            activedCompt.comptAttrs.yAxis1Data[0].nick_name = val
            break;
          case 'others':
          default:
            this.setExtenddata({ key, val })
        }
      } else if (
        ['ElDatagrid', 'CrossTable', 'PivotTable'].includes(comptType) &&
        [ 'nick_name', 'align', 'numType', 'dot', 'setCondi', 'num1', 'iconColor1', 'num2', 'iconColor2', 'fixed', 'tbTextColor', 'tbBgColor', 'thTextColor', 'thBgColor', 'tbBdColor', 'thHeader'].includes(key)
      ) {
        let children = this.activedCompt.styleAttrs[2].children
        let curColElId = this.activedCompt.styleAttrs[2].children[0].value
        if (curColElId == '') return
        if ([ 'nick_name', 'align', 'numType', 'dot', 'setCondi', 'fixed' ].includes(key)) {
          if (key == 'nick_name' && (val || '').trim() == '') {
            val = this.activedCompt.comptAttrs.colSetting[curColElId][key]
            this.activedCompt.styleAttrs[2].children[1].value = ''
            // 如果输入框为空 要取回原来对名称
            let curField = children[0].options.filter(item1 => {
              return item1.element_id == curColElId
            })
            if (curField.length > 0) {
              val = curField[0].label
            }
          }

          this.$set(this.activedCompt.comptAttrs.colSetting[curColElId], key, val)
          if (key == 'fixed' && val == true) {
            this.$set(this.activedCompt.comptAttrs.colSetting[curColElId], key, 'left')
          }
          if (key == 'align') {
            children[2].value = val
          }
          if (val == 0 && key == 'numType') {
            // 数值设默认，则小数位重置为无
            this.activedCompt.comptAttrs.colSetting[curColElId]['dot'] = '0'
            children[4].value = '0'
          }
          if (key == 'setCondi' && !['CrossTable', 'PivotTable'].includes(comptType)) {
            seriesAttrs.forEach(data => {
              if (['num1', 'iconColor1', 'num2', 'iconColor2'].includes(data.enName)) {
                data.disabled = !val // 启用条件格式未勾选隐藏，勾选则显示
              }
            })
          }
        } else if (key.indexOf('num') > -1 || key.indexOf('iconColor') > -1) {
          let condiArr = objDeepCopy(this.activedCompt.comptAttrs.colSetting[curColElId].colCondiExp)
          if (condiArr.length == 0) {
            condiArr = [
              {
                icon: 'icon-A10034_up',
                iconColor: '#F56C6C',
                num: '',
                opt: '',
                fontSize: 12
              },
              {
                icon: 'icon-A10035_down',
                iconColor: '#67C23A',
                num: '',
                opt: '',
                fontSize: 12
              }
            ]
          }
          let colIdx = parseInt(key.substring(key.length - 1)) - 1
          let KeyName = key.substring(0, key.length - 1)
          // 要求条件数组第一个条件值要小于等于第二个的，如果第二个小于第一个，直接改为第二个的值
          // 1.校验是否数值,非数值，若另外一个输入框为空，则转为0，否则转为跟另一个数组一样的值
          if (key.indexOf('num') > -1) {
            let valueArr1 = [condiArr[0].num, condiArr[1].num]
            valueArr1[colIdx] = val
            val = this.getTransValue({
              valueArr: valueArr1,
              valueIdx: colIdx
            })
            children[colIdx == 0 ? 6 : 8].inputValue = val
          }
          if (KeyName === 'iconColor' && !val) {
            val = colIdx == 0 ? '#F56C6C' : '#67C23A'
            children[colIdx == 0 ? 7 : 9].value = val
          }
          condiArr[colIdx][KeyName] = val
          this.$set(this.activedCompt.comptAttrs.colSetting[curColElId], 'colCondiExp', condiArr)
        } else if (['tbTextColor', 'tbBgColor', 'thTextColor', 'thBgColor', 'tbBdColor', 'thHeader'].includes(key)) {
          this.$set(this.activedCompt.comptAttrs.extendSetting, key, val)
        }
      } else if (
        comptType == 'ElSwiper' &&
        ['nickName', 'numType', 'dot', 'fontSize', 'color'].includes(key)
      ) {
        let childrenSwi = this.activedCompt.styleAttrs[1].children
        let curColElIdSwi = this.activedCompt.styleAttrs[1].children[0].value
        if (curColElIdSwi == '') return
        if (key == 'nickName' && (val || '').trim() == '') {
          val = this.activedCompt.comptAttrs.colSetting[curColElIdSwi].oriName
          this.$set(
            this.activedCompt.comptAttrs.colSetting[curColElIdSwi],
            key,
            val
          )
        }
        if (key == 'color' && (val || '').trim() == '') {
          // let defaultClr = ["#606266","#666","#21bdff"];
          // let elementIdx = -1,swiperCompAttr = this.activedCompt.comptAttrs;
          if (swiperCompAttr.xAxisData.length > 0 && swiperCompAttr.xAxisData[0].element_id == curColElIdSwi) {
            val = '#606266'
          } else if (swiperCompAttr.yAxis1Data.length > 0 && swiperCompAttr.yAxis1Data[0].element_id == curColElIdSwi) {
            val = '#21bdff'
          } else {
            val = '#666'
          }
          this.$set(childrenSwi[3], 'value', val)
        }
        this.$set(
          this.activedCompt.comptAttrs.colSetting[curColElIdSwi],
          key,
          val
        )
        if (val == 0 && key == 'numType') {
          // 数值设默认，则小数位重置为无
          this.activedCompt.comptAttrs.colSetting[curColElIdSwi]['dot'] = '0'
          childrenSwi[5].value = '0'
        }
      } else {
        // this.$set(this.s_edcuiCompts[0].comptAttrs.extendSetting,key,val);
        // if (key == "iswaring") {
        //   this.setWarningDialog(true);
        // }

        if (key == 'series.index.name,legend.data.index') {
          // val = val.replace(/\s*/g, "");
          // if (val == "") {
          //   this.$message.error("度量名称不能为空");
          //   return;
          // }

          this.isExist(val)
          if (this.isExistFlag) {
            this.$message.error('该度量已存在')
            return
          }
          // var flag = this.isExist(val).then(value => {
          //   console.log(value);
          //   if (value) {
          //     this.$message.error("该度量已存在");
          //     return;
          //   }
          // });
          // 判断地图别名
          if (comptType == 'VeMap' && val != '') {
            let existFlag = false
            let labelMap = activedCompt.comptAttrs.setting['labelMap'] || {}
            for (var labelKey in labelMap) {
              if (val == labelMap[labelKey]) {
                existFlag = true
                break
              }
            }
            if (existFlag) {
              this.$message.error('该度量已存在')
              return
            }
          }
        }

        if (
          ['itemBgColor1', 'itemBgColor2'].includes(key) &&
          comptType == 'ElSwiper'
        ) {
          // 清单轮播组件 渐变色设置 清空颜色，重置颜色
          const bakColor = [
            'rgba(28, 102, 165, 0.2)',
            'rgba(28, 102, 165, 0.7)'
          ]
          const attrTitArr = ['itemBgColor1', 'itemBgColor2']
          if (!val) {
            val = bakColor[attrTitArr.indexOf(key)]
            let styleArr1 = this.activedCompt.styleAttrs[0].children || []
            let attrIdx = -1
            for (let index = 0; index < styleArr1.length; index++) {
              const element = styleArr1[index]
              if (element.enName === key) {
                attrIdx = index
                break
              }
            }
            if (attrIdx > -1) {
              this.$set(
                this.activedCompt.styleAttrs[0].children[attrIdx],
                'value',
                val
              )
            }
          }
        }

        if (type == 'Object' || type == 'Array') {
          val = eval('(' + val + ')')
        }
        if (type == 'button') {
          val = val == 'normal' ? 'bold' : 'normal'
          obj.value = val
        }
        if (
          key == 'series.index.label.normal.show' ||
          key == 'series.index.showSymbol'
        ) {
          this.setExtenddata({ key, val, length })
        } else if (
          (key == 'series.index.name,legend.data.index' ||
            key == 'decimalDigit') &&
          comptType == 'VeRadar'
        ) {
          let paramVal = this.activedCompt.styleAttrs[2].children[0].value // 原名
          let oriColSet = (this.activedCompt.comptAttrs.extendSetting[
            'legendData'
          ] || {})[paramVal] || {
            name: paramVal,
            dot: 0
          }
          if (key == 'decimalDigit') {
            oriColSet.dot = val || 0
          } else {
            oriColSet.name = val || paramVal
          }

          // 改图例别名
          this.$set(
            this.activedCompt.comptAttrs.extendSetting['legendData'],
            paramVal,
            oriColSet
          )
          this.$forceUpdate()

          this.$set(
            this.activedCompt.comptAttrs.colSetting['legendData'],
            paramVal,
            oriColSet
          )
        } else {
          this.setExtenddata({ key, val })
        }
        if (key == 'comptName.show') {
          this.resizedEvent()
        }

        // 新版样式设置，enName对应的就是extendSetting里的属性 从指标卡趋势图开始
        if ('PcIndicatorTrend' === comptType && this.activedCompt.comptAttrs.extendSetting[key] !== undefined) {
          this.$set(this.activedCompt.comptAttrs.extendSetting, key, val);
        } 

        // if (key == "shape" && this.activedCompt.type == "WordCloud" ) {  //形状
        //     console.info("设置形状");
        //     for(var pp = 0 ; pp < layoutAttrs.length ; pp++){
        //         const element = layoutAttrs[pp];
        //         if (element.enName === key) {
        //           //设置属性值
        //           this.activedCompt.layoutAttrs.shape = element.value;
        //           break;
        //         }
        //     }
        // }
      }
    },
    handleClick (tab, event) {},
    resizedEvent () {
      // let myEvent = new Event('resize')
      // window.dispatchEvent(myEvent)
      windowResize();
    },
    addTab () {
      if (this.activedCompt.type === 'ElBreadCrumb') {
        let data = this.activedCompt.comptAttrs.editableTabs
        if (data.length > 2) {
          this.$message.warning('最高支持三级目录，已无法新增！')
        } else {
          let level = this.numberWord[data.length]
          let name = level + '级目录'
          let tab = {
            title: name,
            name: name,
            titleColor: '',
            titleUrl: '',
            comptList: []
          }
          data.push(tab)
        }
      } else {
        let data = this.activedCompt.comptAttrs.editableTabs
        let tabLen = this.activedCompt.comptAttrs.editableTabs.length
        let limit = 7
        if (this.activedCompt.type === 'ElCarousel') limit = 9
        if (tabLen > limit) {
          this.$message.warning(`最高支持${limit + 1}个TAb，已无法新增！`)
        } else {
          let id = 'TAB' + this.tabIndex
          let tab = {
            name: getUUID(),
            title: id,
            comptList: []
          }
          if (this.activedCompt.type === 'VanCollapse') {
            tab.show = true
            tab.expanded = false
            this.activedCompt.blockInfo.h += 5.2
            windowResize()
          }
          data.push(tab)
          this.$nextTick(() => {
            if (this.activedCompt.comptAttrs.extendSetting.canAlign == false) {
              this.setIconDate(2)
              this.setExtend('tabAlign', 'left', '', 0)
            }
          })
        }
      }
    },
    moveTabUp (idx) {
      let data = this.activedCompt.comptAttrs.editableTabs
      if (idx == 0) {
        return
      }
      let temp = data.splice(idx, 1)
      data.splice(idx - 1, 0, ...temp)
    },
    moveTabDown (idx) {
      let data = this.activedCompt.comptAttrs.editableTabs
      if (idx == data.length - 1) {
        return
      }
      let temp = data.splice(idx, 1)
      data.splice(idx + 1, 0, ...temp)
    },
    deleteTab (idx) {
      let data = this.activedCompt.comptAttrs.editableTabs
      if (this.activedCompt.type === 'VanCollapse') {
        if (data[idx].expanded == true) {
          this.activedCompt.blockInfo.h -= 28
        } else {
          this.activedCompt.blockInfo.h -= 5.2
        }
        windowResize()
      }
      data.splice(idx, 1)
    },
    hideTab (idx) {
      if (this.activedCompt.type === 'VanCollapse') {
        let currentTab = this.activedCompt.comptAttrs.editableTabs[idx]
        let currentBlockHeight = this.activedCompt.blockInfo.h
        if (currentTab.show) {
          this.$set(currentTab, 'show', (currentTab.show = false))
          if (currentTab.expanded == true) {
            this.activedCompt.blockInfo.h = currentBlockHeight - 28
          } else {
            this.activedCompt.blockInfo.h = currentBlockHeight - 5.2
          }
        } else {
          this.$set(currentTab, 'show', (currentTab.show = true))
          if (currentTab.expanded == true) {
            this.activedCompt.blockInfo.h = currentBlockHeight + 28
          } else {
            this.activedCompt.blockInfo.h = currentBlockHeight + 5.2
          }
        }
        this.activedCompt.comptAttrs.adjustCollapse = true
        windowResize()
      } else {
        let tabShow = this.activedCompt.comptAttrs.extendSetting.tabShow
        this.activedCompt.comptAttrs.extendSetting.tabShow =
          tabShow != true
      }
    },
    checkTabName (title, idx) {
      this.activedCompt.comptAttrs.editableTabs.forEach((data, index) => {
        if (title === data.title && idx != index) {
          this.activedCompt.comptAttrs.editableTabs[idx].title = this.tabTitleTemp
          this.$message.warning('已存在该标签名！')
        }
      })
    },
    fillBackSeriesData (param) {
      if (param.enName == 'comptData' && this.activedCompt.type == 'ElSwiper') {
        let swiperChilds = this.activedCompt.styleAttrs[1].children
        let currColElId = swiperChilds[0].value
        let colSettingSwiper = this.activedCompt.comptAttrs.colSetting[
          currColElId
        ]
        let isMeasure = false
        if (
          this.activedCompt.comptAttrs.yAxis1Data[0].element_id == currColElId
        ) {
          isMeasure = true
        }

        for (let indexSwi = 1; indexSwi < swiperChilds.length; indexSwi++) {
          const elementSwi = swiperChilds[indexSwi]
          if (colSettingSwiper[elementSwi.enName] != undefined) {
            swiperChilds[indexSwi].value = colSettingSwiper[elementSwi.enName]
          }
          // 如果没改过别名，输入框为空
          if (elementSwi.enName == 'nickName') {
            if (colSettingSwiper.nickName != colSettingSwiper.oriName) {
              swiperChilds[indexSwi].value = colSettingSwiper.nickName
            } else {
              swiperChilds[indexSwi].value = ''
            }
          }
          let disabledArr = ['nickName', 'numType', 'dot']
          if (isMeasure) {
            // 维度字段不能设置别名，数据格式，小数点,度量可以
            if (disabledArr.includes(elementSwi.enName)) {
              swiperChilds[indexSwi].disabled = false
            }
          } else {
            if (disabledArr.includes(elementSwi.enName)) {
              swiperChilds[indexSwi].disabled = true
            }
          }
        }
        return
      }
      if (param.enName == 'comptData') {
        let children = this.activedCompt.styleAttrs[2].children
        let curColElId = children[0].value
        let curColSetting = this.activedCompt.comptAttrs.colSetting[curColElId]
        // 如果没改过别名，输入框为空
        let fieldLabel = children[0].options.filter(item => {
          return item.element_id == curColElId
        })
        if (curColSetting.nick_name != fieldLabel[0].label) {
          children[1].value = curColSetting.nick_name
        } else {
          children[1].value = ''
        }
        if (curColSetting.setCondi === false && ['CrossTable', 'PivotTable'].includes(this.activedCompt.type)) {
          curColSetting.setCondi = 'default'
        }
        children[2].value = curColSetting.align
        children[3].value = (curColSetting.numType || '0') + ''
        children[4].value = (curColSetting.dot || '0') + ''
        children[5].value = curColSetting.setCondi
        if (children[10]) {
          children[10].value = !!curColSetting.fixed
        }
        if (curColSetting.colCondiExp.length >= 2) {
          children[6].inputValue = curColSetting.colCondiExp[0].num
          children[7].value = curColSetting.colCondiExp[0].iconColor
          children[8].inputValue = curColSetting.colCondiExp[1].num
          children[9].value = curColSetting.colCondiExp[1].iconColor
        } else {
          children[6].inputValue = ''
          children[7].value = '#F56C6C'
          children[8].inputValue = ''
          children[9].value = '#67C23A'
        }
        if (curColSetting.isNumber != undefined) {
          // 非number类型的表格列字段，不展示数据格式设置和条件设置
          let flag = !curColSetting.isNumber
          for (let index = 3; index < 10; index++) {
            children[index].disabled = flag
            if (index === 5 && ['CrossTable', 'PivotTable'].includes(this.activedCompt.type)) {
              children[index].isShow = !flag
            }
            if (index > 5 && !flag) {
              // number类型的条件设置的显示根据启用条件格式，选中则显示，不选则隐藏
              children[index].disabled = !!(!curColSetting.setCondi || curColSetting.setCondi === 'default')
            }
          }
        }
        // 对齐只针对列，所以如果处于聚合情况下要判断
        if (
          this.activedCompt.comptAttrs.polymerizeType == 1 &&
          this.activedCompt.type == 'CrossTable'
        ) {
          let isCol = this.activedCompt.comptAttrs.yAxis1Data.some(item => {
            return item.element_id == curColElId
          })
          children[2].disabled = !isCol
        } else {
          children[2].disabled = false
        }
      }
    },
    tabTitleFocus (val) {
      this.tabTitleTemp = val
    },
    tabTitleBlur (tab) {
      if (tab.title == '') {
        this.$message.error('标题不能为空')
        tab.title = this.tabTitleTemp
      }
    },
    addOption () {
      // 仪表盘增加区间
      var item = this.activedCompt.styleAttrs[2].children[0]
      const itemOpt = item.options
      const optLen = itemOpt.length - 1
      if (optLen > 6) {
        this.$message.warning('最高支持8个区间，已无法新增！')
      } else {
        itemOpt.push({
          id: optLen,
          min: itemOpt[optLen].max,
          max: itemOpt[optLen].max + 1,
          color: '#428ff5',
          isDisabled: true,
          isShowDel: true,
          intervalDesc: '',
          maxLength: '10'
        })
      }
    },
    delOption (idx) {
      var item = this.activedCompt.styleAttrs[2].children[0]
      const itemOpts = item.options
      const optLen = itemOpts.length - 1
      if (idx < optLen) {
        itemOpts[idx + 1].min = itemOpts[idx - 1].max
      }
      itemOpts.splice(idx, 1)
    },
    refreshData () {
      var item = this.activedCompt.styleAttrs[2].children[0]
      const isLinearGradient = this.activedCompt.comptAttrs.isLinearGradient // 是否渐变
      const itemOpts = item.options
      const optLen = itemOpts.length - 1
      const min = itemOpts[0].min // 仪表盘的最小值
      const max = itemOpts[optLen].max // 仪表盘的最大值
      const value = max - min
      let styleAttr = []
      let linearstyleAttr = []
      let isRefresh = true
      let formatStr = "function(value){var desc = '';" // 拼凑
      let lineStyleColor = []

      for (let i = 0; i < itemOpts.length; i++) {
        let option = itemOpts[i]
        if (option.min == '' && option.max == '') {
          this.$message.warning('第' + (1 + i) + '个区间存在不是数值，请检查区间值')
          isRefresh = false
          break
        } else if (Number(option.min) >= Number(option.max)) {
          this.$message.warning('第' + (1 + i) + '个区间值不连续，请检查区间值')
          isRefresh = false
          break
        } else if (
          option.color == '' ||
          option.color == 'null' ||
          option.color == undefined
        ) {
          this.$message.warning('第' + (1 + i) + '个区间未设置颜色，请选择颜色')
          // isRefresh = false;
          return
        } else {
          // 构造区间颜色
          let temp = [(option.max - min) / value, option.color]
          styleAttr.push(temp)

          // 构造渐变区间颜色
          let offset = i == 0 ? 0 : (itemOpts[i - 1].max - min) / value
          let lineartemp = { offset: offset, color: option.color }
          linearstyleAttr.push(lineartemp)

          // 构造区间描述
          formatStr +=
            ' if(value >= ' +
            option.min +
            ' && value < ' +
            option.max +
            "){desc = '" +
            option.intervalDesc +
            "'}else"
        }
      }
      if (isRefresh) {
        formatStr += " {desc = ''} return desc;}"
        lineStyleColor = isLinearGradient
          ? [
            [
              1,
              new this.$echarts.graphic.LinearGradient(
                0,
                0,
                1,
                0,
                linearstyleAttr
              )
            ]
          ]
          : styleAttr
        this.activedCompt.comptAttrs.colorArr = styleAttr // 颜色区间
        this.activedCompt.comptAttrs.linearcolorArr = linearstyleAttr // 渐变颜色区间
        this.activedCompt.comptAttrs.intervalDescFunc = formatStr // 区间状态

        let key = 'series.0.axisLine.lineStyle.color'
        let val = lineStyleColor
        this.setExtenddata({ key, val })

        key = 'series.0.min'
        val = min
        this.setExtenddata({ key, val })

        key = 'series.0.max'
        val = max
        this.setExtenddata({ key, val })

        key = 'series.1.detail.formatter'
        val = eval('(' + formatStr + ')')
        this.setExtenddata({ key, val })
      }
    },
    setOption (id, type, color) {
      // 连续的区间，前一个区间的最大值等于下一个区间的最小值
      var item = this.activedCompt.styleAttrs[2].children[0]
      const itemOpts = item.options
      const optLen = itemOpts.length - 1
      if (type == 'max' && id < optLen) {
        itemOpts[id + 1].min = itemOpts[id].max
      }
    },
    selectIcon (index, key) {
      this.iconIndex = index
      let val = this.iconArray[index]
      this.setExtenddata({ key, val })
    },
    submitIcon () {
      this.initialIcon = this.iconArray[this.iconIndex]
      this.visible = false
    },
    popoverHide () {
      this.activedCompt.comptAttrs.extendSetting.metricIcon = this.initialIcon
    },
    popoverShow () {
      let _this = this
      this.initialIcon = this.activedCompt.comptAttrs.extendSetting.metricIcon
      this.iconIndex = this.iconArray.findIndex(function (value) {
        return value == _this.initialIcon
      })
    },
    // valueArr 值数组 设置的目标值所在数组的下标
    getTransValue ({ valueArr, valueIdx }) {
      let anotherIdx = (valueIdx + 1) % 2
      let oriValue = valueArr[valueIdx]
      let newValue = oriValue
      let anotherValue = valueArr[anotherIdx] || 0
      // 要求条件数组第一个条件值要大于第二个的，如果第二个大于第一个，直接改为第一个的值
      // 1.校验是否数值,非数值，若另外一个输入框为空，则转为0，否则转为跟另一个数组一样的值
      let patrn = /^\d+(\.\d+)?$/
      if (!patrn.exec(newValue)) {
        newValue = 0
      }
      if ((valueArr[anotherIdx] || '').trim() == '') return newValue // 另外一个条件还没输就不用进一步限制
      if (!patrn.exec(anotherValue)) {
        anotherValue = 0
      }
      switch (valueIdx) {
        case 0:
          if (parseFloat(newValue) < parseFloat(anotherValue)) { newValue = anotherValue }
          break
        case 1:
          if (parseFloat(anotherValue) < parseFloat(newValue)) { newValue = anotherValue }
          break
        default:
          break
      }
      return newValue
    },
    fileChange (file) {
      let raw = file.raw
      const isJPG = 'image/jpeg'
      const isPNG = 'image/png'
      const isLt50K = file.size / 1024 > 200
      if (raw.type !== isJPG && raw.type !== isPNG) {
        this.$message.error('上传图片只能是 JPG、PNG 格式!')
        return
      }
      if (isLt50K) {
        this.$message.error('上传图片大小不能超过 200K!')
        return
      }
      this.imgTrans(raw)
    },
    imgTrans (file) {
      let _this = this
      let reader = new FileReader() // html5读文件
      reader.readAsDataURL(file) // 转BASE64
      reader.onload = function (e) {
        // 读取完毕后调用接口
        let base64 = e.target.result
        _this.activedCompt.comptAttrs.extendSetting.imgUrl = base64
      }
    },
    clearImg () {
      this.activedCompt.comptAttrs.extendSetting.imgUrl = ''
    },
    inputNumberMin (item) {
      let min = ''
      if (item.cnName === '字体大小') {
        min = 12
      } else if (item.unitValue === '%') {
        min = 0
      } else if (item.unitValue === 'px') {
        min = 0
      }
      else {
        min = item.min
      }

      return min
    },
    inputNumberMax (item) {
      let max = ''
      if (item.cnName === '字体大小' && item.enName !== 'commonTitleFontSize') {
        max = 100
      } else if (item.cnName === '字体大小' && item.enName === 'commonTitleFontSize') {
        max = 30
      }  else if (item.unitValue === '%') {
        max = 80
      } else if (item.unitValue === 'px') {
        max = 80
      }
      else {
        max = item.max
      }

      return max
    },
    showCheckBox (citem, index, item) {
      const pageCache = this.pageCache
      const activedCompt = this.activedCompt
      const polymerizeType = activedCompt.comptAttrs.polymerizeType
      // 原来判断
      let flag = (citem.terminalShow ? citem.terminalShow.includes(pageCache.classTypeId) : citem.disabled != undefined ? !citem.disabled : (!(citem.enName == 'totalRow' && ['ElDatagrid', 'CrossTable', 'PivotTable'].includes(activedCompt.type) && activedCompt.comptAttrs.polymerizeType == 1)))
      //饼图--展示标签列表
      //判空逻辑
      if(activedCompt.type === 'VePie' || activedCompt.type === 'VeRosePie' || activedCompt.type === 'VeDoughnutPie'){
      let layoutAttrs = activedCompt.styleAttrs.find((val)=>val.enName === "layoutAttrs").children || [];
      let legend = layoutAttrs.find((val)=>val.enName === "legend") || {};
        //判断是否展示标签列表选项框--首先判断标签列表是否存在
          if(legend.options[0].isSelected === true && (activedCompt.comptAttrs.extendSetting["series.0.labelLine.show"] === false || activedCompt.comptAttrs.extendSetting.series.labelLine.show === false)){
              if(citem.enName === 'tagList') {
                flag = true;
              }
              if(activedCompt.styleAttrs.find((val)=>val.enName === "commonAttrs").children.find((val)=>val.enName === "comptName.show") ) {
                this.setLegendFormatter();
              }
          }
          if((legend.options[0].isSelected === false || activedCompt.comptAttrs.extendSetting["series.0.labelLine.show"] === true || activedCompt.comptAttrs.extendSetting.series.labelLine.show === true) && citem.enName === 'tagList'){
            layoutAttrs.find((val)=>val.enName === "tagList").value = false
            flag = false
          }
      }
      // 交叉表新增判断
      if (activedCompt.type === 'CrossTable') {
        if (
          (polymerizeType == 1 && ['totalRow'].includes(citem.enName) && !(item[index - 2] || {}).value) ||
          // (['subTotal'].includes(citem.enName) && item[index + 1].options.length <= 0) ||
          (polymerizeType != 1 && ['mergeSimilarCells'].includes(citem.enName)) ||
          (polymerizeType == 2 && ['subTotal'].includes(citem.enName))
        ) {
          flag = false
        } else if (polymerizeType == 2 && ['totalRow'].includes(citem.enName)) {
          citem.disabled = false
          flag = true
        }

        if(polymerizeType === 1 && (citem.enName === 'subTotal' || citem.enName === 'totalRow')){
          flag = this.crossTableCount.flag;
        }
      }
      if (['CrossTable'].includes(activedCompt.type) && citem.enName == 'needSms' &&
        !(polymerizeType == 2 && pageCache.classTypeId == '1001001') ||
        (['ElDatagrid'].includes(activedCompt.type) && citem.enName == 'needSms' && pageCache.classTypeId != '1001001')
      ) {
        flag = false
      }
      return flag
    },
    showSubTotalCol(sub,total) {
      let flag = false;
      if(this.polymer === 2) {
        this.showCountList = flag;
        return;
      }
      let subTotal = sub === null? this.activedCompt.comptAttrs.extendSetting.subTotal : sub;
      let totalRow = total === null? this.activedCompt.comptAttrs.extendSetting.totalRow : total;
      if(subTotal) {  //只小计
        flag = true;
      } else if( totalRow) {  //只合计
        let type = this.crossTableCount.type;
        if(type === 'allIn'){
          flag = true;
        }
      }
      this.showCountList = flag;
    },
    changeHandle (val) {
      let style = this.activedCompt.styleAttrs[0].children
      let extend = this.activedCompt.comptAttrs.extendSetting
      for (let i = 0; i < style.length; i++) {
        if (style[i].enName === 'displayId') {
          style[i].value = val
          break
        }
      }
      extend.displayId = val
    },
    inputNumberEnable(citem) { //图片组件无边框时需要禁止边框粗细修改
      let flag = false;
      if(this.activedCompt.type == 'ElImage' && citem.enName === 'borderWidth') {
        flag = this.activedCompt.comptAttrs.extendSetting.border == '0' ? true : false
      }
      return flag;
    },
    actPrevent() {
      this.$message.warning('请先绑定数据');
    },
    // 设置系列数据
    setSeriesData({key, val, type, length, obj}) {
      const colSetting = this.activedCompt.comptAttrs.colSetting;
      const styleAttr = this.activedCompt.styleAttrs;
      const seriesChild = (styleAttr.find(attr1 => attr1.enName === 'seriesAttrs') || {}).children || [];
      if (!colSetting || seriesChild.length === 0 ) {
        return;
      }
      // 选中的列字段element_id
      const selElementId = seriesChild[0].value;
      if (!selElementId || !colSetting[selElementId]) {
        return;
      }
      // 系列英文名数组
      const seriesAttrsArr = seriesChild.filter(item => item.enName !== 'comptData').map(item => item.enName);
      if (!seriesAttrsArr.includes(key)) {
        return;
      }
      // const arrtIndex = seriesChild.findIndex(attr1 => attr1.enName === key);
        let newVal = val;
        this.$set(colSetting[selElementId], key, newVal);
        console.log('colSetting', colSetting[selElementId]);

        if (key === 'targetSetMode') { //
          const isDynamic = newVal === 'dynamic';
          seriesChild.forEach((item, index) => {
            if (['dynamicElementId', 'dynamicPolymerizeType'].includes(item.enName)) {
              this.$set(seriesChild[index], 'isShow', isDynamic);
            }
            if (['staticTargetVal'].includes(item.enName)) {
              this.$set(seriesChild[index], 'isShow', !isDynamic);
            }
          });
        }
        //指标趋势图条件格式
        if(this.activedCompt.type === "PcIndicatorTrend") {
          if (key === 'setCondi') {
            seriesChild.forEach((item, index) => {
              if (['riseNum', 'riseIconColor','dropNum', 'dropIconColor'].includes(item.enName)) {
                this.$set(seriesChild[index], 'disabled', !val);
              }
            });
          }
        }
    },
    showText(citem) {
      return (citem.disabled != undefined?!citem.disabled:(citem.isShow != undefined?citem.isShow:true))
    }
  },
  mounted () {},
  activated () {},
  updated () {
    this.$nextTick(() => {
      let div = this.$refs.collapse.$el
      if (div.childNodes.length > 0) {
        div.childNodes.forEach(val => {
          var obj = val.querySelector('.el-collapse-item__wrap')
          const len = obj.querySelectorAll('.cont-line').length
          val.style.display = len === 0 ? 'none' : 'block'
        })
      }
    })
  }
}
</script>

<style lang="scss" scoped>
/* 滚动条 */
/deep/ .el-tabs__nav-scroll {
  padding-left: 0px !important;
}

.tabOption .el-tabs__nav-scroll .el-tabs__nav {
  height: 0;
}

.el-scrollbar__wrap {
  overflow-x: hidden;
}

.table-wrap .el-scrollbar__view {
  padding-right: 10px;
}

.table-wrap .el-scrollbar__view > div {
  margin-bottom: 10px;
}

//   收缩内容块
/deep/ .el-collapse-item__header {
  background-color: #2f5377;
  color: #fff;
  height: 33px;
  line-height: 33px;
  padding-left: 20px;
  position: relative;
}

/deep/ .el-collapse-item__header .el-collapse-item__arrow {
  position: absolute;
  left: 0;
}

/deep/ .el-collapse-item__wrap {
  background-color: #315b85;
}

/deep/ .el-collapse-item__header,
/deep/ .el-collapse-item__wrap {
  border-bottom: 0px;
}

/deep/ .el-collapse-item__content {
  color: #fff;
  opacity: 0.8;
  padding: 0 10px 10px 10px;

  .lineCombo-select {
    .el-tag {
      width: auto;
    }
  }
}

/deep/ .el-collapse {
  border: 0px;
}

/deep/ .el-tabs__item.is-active {
  color: #409eff !important;
  border-bottom: 2px solid #409eff !important;
  background: none !important;
}

/deep/ .el-tabs__active-bar {
  height: 0 !important;
}

/deep/ .el-tabs__nav-wrap {
  height: 31px !important;
}

/deep/ .el-tabs__item {
  padding: 0 !important;
  margin-right: 30px;
}

/deep/ .tabtwo .el-tabs__nav-wrap.is-top {
  padding-left: 110px;
}

/deep/ .el-tabs__nav-wrap.is-top {
  padding-left: 59px;
}

//内容块中元素
.cont-line {
  margin-top: 10px;
}

._wrap {
  width: 25px;
  height: 25px;
  float: right;
  cursor: pointer;
  text-align: center;
  line-height: 24px;
  border: 1px solid transparent;
  border-radius: 5px;
  margin: 0 4px;
}

.iconSelect {
  border-color: #409eff;
}

.stylattr .inp-line {
  width: 100%;
  overflow: hidden;
  min-height: 30px;
}

.stylattr .inp-line-1 {
  width: 60px;
  float: left;
  &.inp_line-1_table {
    width: 90px;
  }
}

.stylattr .inp-line-2 {
  width: calc(100% - 60px);
  float: left;
  &.inp_line-2_table {
    width: calc(100% - 90px);
  }

  /deep/ .el-input__count-inner,
  /deep/ .el-textarea .el-input__count {
    color: #fff;
    background-color: transparent;
    font-size: 12px;
    transform: scale(0.8);
    opacity: 0.7;
  }
}

.stylattr .col-wrap {
  height: 30px;
}

.stylattr .el-radio {
  color: #fff;
  margin-right: 18px;
  &:last-child {
    margin-right: 0;
  }
}

.stylattr .compdInput {
  /deep/ .el-input-group {
    .el-input-group__prepend {
      width: 65px;
      border: none;
      background-color: #0e3b67;

      .el-select .el-input__inner {
        border-right: none;
        border-radius: 0;
      }
    }

    &:hover {
      .el-select .el-input__inner {
        border: 1px solid #498bce;
        border-right: none;
      }
    }
  }
}

/deep/ .el-color-picker__trigger {
  border: 1px solid #0a2b4c !important;
  background-color: #0e3b67 !important;
}

.el-radio__inner,
.el-checkbox__inner {
  background: #0e3b67 !important;
  border: 1px solid #0a2b4c !important;
}

.el-radio__input.is-checked + .el-radio__label {
  color: #fff !important;
}

.showPagingCls_1 {
  width: 50%;
}

.showPagingCls_2 {
  float: right;
  margin-top: -24px;
  margin-right: 60px;
}

$font-main2: #afc0d0;
$font-clr1: #45fffd;
$border-clr3: #498bce;
$input-bg-clr1: #0e3b67; // 输入框背景色

/***样式块 **/
// .pane-style {
//   height: 100%;
//   padding: 10px;

.el-form-item {
  margin-bottom: 5px;
}

.item-block {
  margin-bottom: 20px;
}

.item_label {
  padding-left: 10px;
  display: inline-block;
}

.sub-nav-title {
  height: 22px;
}

span[class^="icon-"] {
  font-size: 12px;
}

.batch-item {
  cursor: pointer;
}

.align-item {
  height: 30px;
  width: 30px;
  display: inline-block;
  text-align: center;
  vertical-align: middle;
  margin-top: -3px;
  margin-right: 4px;
  border-radius: 2px;
  border: 1px solid transparent;
  float: unset;
  transform: scale(0.8);

  div {
    transform: scaleY(0.7);
    line-height: 1px;
  }

  span {
    display: inline-block;
    width: 70%;
    line-height: 2px;
  }

  span:nth-child(2n) {
    width: 50%;
  }
}

.align-item:first-child {
  text-align: left;
  padding-left: 5px;
}

.align-item:nth-child(n + 3) {
  text-align: right;
  padding-right: 5px;
}

/deep/ .batch-dialog {
  /deep/ .el-form-item__label {
    white-space: nowrap;
    text-overflow: ellipsis;
    color: #606266 !important;
  }

  /deep/ .el-input__inner {
    color: #606266 !important;
    background-color: #ffffff !important;
    border: 1px solid #dcdfe6 !important;
  }
}

/deep/ .el-form-item__label {
  color: $font-main2;
}

/deep/ .cbox.el-checkbox {
  color: $font-main2;
}

/deep/ .cbox .el-checkbox__input.is-checked + .el-checkbox__label {
  color: $font-main2;
}

.item_label {
  color: $font-main2;
}

.batch-item:hover {
  color: $font-clr1;
}

.align-item:hover,
.align-item.selected {
  border-color: $border-clr3;
  background: $input-bg-clr1;
}

.align-item span {
  border-top: 2px solid $font-main2;
}

.item-block .sub-nav-title {
  color: $font-clr1;
}

/deep/ .advance-col-form {
  .el-form-item:not(:first-child) {
    padding-left: 40px;
  }
}

// }

.tab-item-wrap {
  padding: 5px 0;
}

.tab-item-tit {
  float: left;
}

.tab-item-icon {
  float: right;

  span {
    margin-left: 5px;
    cursor: pointer;

    &:hover {
      color: #409eff;
    }
  }
}

.tab-item:after {
  display: block;
  clear: both;
  content: "";
  visibility: hidden;
  height: 0;
}

.tool-text {
  margin-right: 10px;
}

.tool-button {
  width: 20px;
  display: inline-block;
  cursor: pointer;
  text-align: center;

  &:hover,
  &.actived {
    background-color: #409eff;
  }
}

.upload-button {
  float: left;
  margin-right: 20px;
}

/deep/.interval-cont {
  input.el-input__inner {
    padding-right: 0;
    padding-right: 5px;
  }
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: textfield;
  }
  input[type="number"] {
    -moz-appearance: textfield;
  }
}

.blank-mask {
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: 1;
}
</style>
<style>
.style-panel-popover {
  background-color: #0a2b4c;
  border: none;
}

.style-panel-popover[x-placement^="bottom"] .popper__arrow,
.style-panel-popover[x-placement^="bottom"] .popper__arrow::after {
  border-bottom-color: #0a2b4c;
}

.style-panel-popover[x-placement^="top"] .popper__arrow,
.style-panel-popover[x-placement^="top"] .popper__arrow::after {
  border-top-color: #0a2b4c;
}

.style-panel-popover .popover-scroll {
  height: 200px;
}

.style-panel-popover .el-scrollbar__wrap {
  overflow-x: hidden;
}

.style-panel-popover .icon-list-wrap {
  margin-left: -10px;
}

.style-panel-popover .item-icon {
  float: left;
  width: 30px;
  height: 30px;
  text-align: center;
  background-color: #2f5377;
  font-size: 20px;
  color: #afc0d0;
  margin-left: 10px;
  margin-bottom: 10px;
  cursor: pointer;
}

.style-panel-popover .item-icon > div {
  line-height: 30px;
}

.style-panel-popover .item-icon:hover,
.style-panel-popover .item-icon.selected {
  color: #409eff;
}
.el-color-picker__panel > .el-color-dropdown__btns > .el-color-dropdown__link-btn{
  display: none;
}
.branch{
  display: inline-block;margin-left: 10px;
}
</style>
