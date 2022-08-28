<template>
  <div class="rf-header clearfix"
       :class={disabled:!!!activedNum||reportLoading}>
    <div class="rf-h-left">
      <div class="rh-h-left1">
        <el-row>
          <el-col :span="16"
                  class="rh-1-col1">
            <el-row>
              <el-col :span="12">
                <el-tooltip class="item"
                            :disabled="undoDisabled"
                            :enterable='false'
                            effect="dark"
                            content="撤销"
                            placement="top">
                  <span :class="['icon-A10652_cancel',{'disabled':undoDisabled}]"
                        @click="redoUndo('undo')"></span>
                </el-tooltip>

              </el-col>
              <el-col :span="12">
                <el-tooltip class="item"
                            :disabled="redoDisabled"
                            :enterable='false'
                            effect="dark"
                            content="恢复"
                            placement="top">
                  <span :class="['icon-A10653_recover',{'disabled':redoDisabled}]"
                        @click="redoUndo('redo')"></span>
                </el-tooltip>
              </el-col>
            </el-row>
          </el-col>
          <el-col :span="8">
            <el-row>
              <el-col :span="24">
                <el-tooltip class="item"
                            :enterable='false'
                            effect="dark"
                            content="格式刷"
                            placement="top">
                  <span class="icon-A10654_formatBrush"
                        :class="{selected:fmPainter}"
                        @click="setFormatPaint"
                        @dblclick="setFormatPaint(true)"></span>
                </el-tooltip>
              </el-col>
            </el-row>
          </el-col>
          <!-- <el-col class="rh-l1-4" :span="8">
            <el-tooltip class="item"
                        :enterable='false'
                        effect="dark"
                        content="剪切"
                        placement="bottom">
              <span class="icon-A10657_cutting"
                    @click="copyEvent(true)"></span>
            </el-tooltip>
          </el-col> -->
        </el-row>
        <el-row class="rh-h-l2">
          <el-col class="rh-l1-1" :span="8">
            <el-tooltip class="item"
                        :enterable='false'
                        effect="dark"
                        content="复制"
                        placement="bottom">
              <span id="text-copy"
                    class="icon-A10183_copy"
                    :data-clipboard-text="copyText"
                    @click="copyEvent()"></span>
            </el-tooltip>
          </el-col>
          <el-col class="paste-copy rh-l1-2" :span="8">
            <span>
              <el-tooltip class="item"
                          :enterable='false'
                          effect="dark"
                          content="粘贴"
                          placement="bottom">
                <span class="icon-A10656_Paste"
                      @click="pasteEvent()"></span>
              </el-tooltip>
              <el-dropdown size="mini"
                           trigger="click"
                           @command="command=>pasteEvent(command)">
                <span class="icon-A10009_triangleDown rf-down"></span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command='false'>全部</el-dropdown-item>
                  <el-dropdown-item command='true'>值</el-dropdown-item>
                  <el-dropdown-item command='style'>样式</el-dropdown-item>
                  <el-dropdown-item v-if="showFormula !== '0'" command='formulas' :disabled="pasteFml">公式</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </span>

          </el-col>
          <el-col class="rh-l1-4" :span="8">
            <el-tooltip class="item"
                        :enterable='false'
                        effect="dark"
                        content="剪切"
                        placement="bottom">
              <span class="icon-A10657_cutting"
                    @click="copyEvent(true)"></span>
            </el-tooltip>
          </el-col>
        </el-row>
      </div>
      <div class="rh-h-left2">
        <el-row>
          <el-col>
            <el-tooltip class="item"
                        :enterable='false'
                        effect="dark"
                        content="字体"
                        placement="bottom">
              <el-select v-model="curCellStyle.fontFamily || characterType"
                         placeholder="请选择"
                         size="mini"
                         class="rh-sel1"
                         @change="font=>setFont(font,'font-family')">
                <el-option v-for="item in characterTypes"
                           :key="item.key"
                           :label="item.value"
                           :value="item.key">
                  <span style="float: left">{{ item.value }}</span>
                </el-option>
              </el-select>
            </el-tooltip>
            <el-tooltip class="item"
                        :enterable='false'
                        effect="dark"
                        content="字号"
                        placement="bottom">
              <el-select v-model="curCellStyle.fontSize || fontSize"
                         placeholder="请选择"
                         size="mini"
                         class="rh-sel2"
                         @change="font=>setFont(font,'font-size')">
                <el-option v-for="item in fontSizes"
                           :key="item.key"
                           :label="item.value"
                           :value="item.key">
                  <span style="float: left">{{ item.value }}</span>
                </el-option>
              </el-select>
            </el-tooltip>

          </el-col>
        </el-row>
        <el-row class="rh-h2-l2">
          <el-col class="rh-l2-1">
            <span class="rh-l2-11">
              <el-tooltip class="item"
                          :enterable='false'
                          effect="dark"
                          :content="curCellStyle.bold == 'bold'?'取消加粗':'加粗'"
                          placement="bottom">
                <span :class="{selected:curCellStyle.bold === 'bold'}"
                      @click="setFontStyle('bold','font-weight')">
                  B
                </span>
              </el-tooltip>
            </span>
            <span class="rh-l2-12">
              <el-tooltip class="item"
                          :enterable='false'
                          effect="dark"
                          :content="curCellStyle.italic == 'italic'?'取消斜体':'斜体'"
                          placement="bottom">
                <i :class="{selected:curCellStyle.italic === 'italic'}"
                   @click="setFontStyle('italic','font-style')">
                  I
                </i>
              </el-tooltip>
            </span>
            <span class="rh-l2-13">
              <el-tooltip class="item"
                          :enterable='false'
                          effect="dark"
                          :content="curCellStyle.textDecoration=='underline'?'下划线':(curCellStyle.textDecoration=='line-through'?'删除线':'文本排版')"
                          placement="bottom">
                <el-dropdown trigger="click"
                             @command="(command) => setFontStyle(command,'text-decoration')"
                             :class="{selected: (curCellStyle.textDecoration&&curCellStyle.textDecoration !== 'none')}">
                  <span class="el-dropdown-link">
                    <span :style="`text-decoration:${curCellStyle.textDecoration}`">U</span>
                    <i class="el-icon-arrow-down el-icon--right"></i>
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-for="(val,i) in decoration"
                                      :key="i"
                                      :command="val"
                                      :style="`text-decoration:${val}`">U</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </el-tooltip>
            </span>
          </el-col>
          <el-col class="rh-l2-2">
            <el-tooltip class="item"
                        :enterable='false'
                        effect="dark"
                        content="框线"
                        placement="bottom">
              <span class="rh-l2-21">
                <span class="rh-21-wrap"
                      :class="[bdClass||'rh-bd-type-1']"
                      @click="setBorder()">
                  <em class="e1"></em>
                  <em class="e2"></em>
                  <em class="e3"></em>
                  <em class="e4"></em>
                </span>
                <span class="el-icon-arrow-down el-icon--right rf-down border-down"
                      @click="bdMenuShow = !bdMenuShow"></span>
                <ul class="el-dropdown-menu el-popper bdMenu"
                    ref="border-menu"
                    v-show="bdMenuShow">
                  <li v-for="(val,i) in borderArray"
                      :key="i"
                      class="el-dropdown-menu__item"
                      :class="{selected:val.key===borderType}"
                      @mouseover="dropColorPicker('bdPicker',false)"
                      @click="setBorder({type:val.key},i)">
                    <span class="rh-21-wrap"
                          :class="'rh-bd-type-'+i">
                      <em class="e1"></em>
                      <em class="e2"></em>
                      <em class="e3"></em>
                      <em class="e4"></em>
                    </span>
                    <span>{{val.value}}</span>
                  </li>
                  <li class="el-dropdown-menu__item has_sub_item"
                      @click="dropColorPicker('bdPicker')"
                      @mouseover="dropColorPicker('bdPicker')">
                    <span class="rh-21-wrap">
                      <em class="e1"></em>
                      <em class="e2"
                          :style="`background:${borderColor}`"></em>
                    </span>
                    <span>边框颜色</span>
                    <i class="el-icon-arrow-right"></i>
                    <el-color-picker size="mini"
                                     ref="bdPicker"
                                     class="bdPicker"
                                     v-model="borderColor"
                                     color-format="hex"
                                     @change="setBorder({color:borderColor})"></el-color-picker>
                  </li>
                  <li class="el-dropdown-menu__item has_sub_item"
                      @mouseover="borderStyleOver()"
                      @mouseleave="dropColorPicker('bdPicker',false)">
                    <span class="rh-21-wrap">
                      <em class="e1"></em>
                    </span>
                    <span>边框线型</span>
                    <i class="el-icon-arrow-right"></i>
                    <ul class="el-dropdown-menu el-popper submenu"
                        v-show="subMenuShow">
                      <li class="el-dropdown-menu__item"
                          :class="{selected:borderStyle === 'none'}"
                          @click="setBorder({style:'none'})">
                        <span>无边框</span>
                      </li>
                      <li v-for="(val,i) in bdStyleArray"
                          :key="i"
                          class="el-dropdown-menu__item"
                          :class="{selected:borderStyle === val.key}"
                          v-show="val.key!='double'||borderType!='double'"
                          @click="setBorder({style:val.key})">
                        <span :style="`border-top-style:${val.value}`"></span>
                      </li>
                    </ul>
                  </li>
                  <div x-arrow=""
                       class="popper__arrow"
                       ref="arrow"></div>
                </ul>
              </span>
            </el-tooltip>
          </el-col>
          <el-col class="rh-l2-3">
            <el-row>
              <el-col :span="12"
                      style="padding: 0;">
                <el-tooltip class="item"
                            :enterable='false'
                            effect="dark"
                            content="填充颜色"
                            placement="bottom">
                  <span class="rh-3-1-out">
                    <span class="rh-3-1-wrap"
                          @click="setColor('background-color')">
                      <span class="rh-3-1">
                        <span class="rh-3-11 icon-A10658_stuff">
                        </span>
                        <span class="rh-3-12"
                              :style="`background:${bgColor||'transparent'}`">
                        </span>
                      </span>
                    </span>
                    <span class="rh-3-2 icon-A10009_triangleDown"
                          @click="dropColorPicker('bgcPicker')">
                    </span>
                    <el-color-picker size="mini"
                                     style="width:0,height:0"
                                     ref="bgcPicker"
                                     v-model="bgColor"
                                     @change="setColor('background-color')"
                                     color-format="hex"></el-color-picker>
                  </span>
                </el-tooltip>
              </el-col>
              <el-col :span="12"
                      style="padding: 0;">
                <el-tooltip class="item"
                            :enterable='false'
                            effect="dark"
                            content="字体颜色"
                            placement="bottom">
                  <span class="rh-4-1-outside">
                    <span class="rh-4-1-wrap"
                          @click="setColor('color')">
                      <span class="rh-4-1">
                        <span class="rh-4-11">
                          A
                        </span>
                        <span class="rh-4-12"
                              :style="`background:${fontColor||'#666666'}`">
                        </span>
                      </span>
                    </span>
                    <span class="rh-4-2 icon-A10009_triangleDown"
                          @click="dropColorPicker('fontcPicker')">
                    </span>
                  </span>
                </el-tooltip>
                <el-color-picker size="mini"
                                 style="width:0,height:0"
                                 ref="fontcPicker"
                                 v-model="fontColor"
                                 color-format="hex"
                                 @change="setColor('color')"></el-color-picker>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      </div>
      <!-- 排版 -->
      <div class="rh-h-left3">
        <el-row class="rh-h-top">
          <el-col :span="8"
                  v-for="value in verAlignData"
                  :key="value.value"
                  class="rh-v-wrap">
            <el-tooltip class="item"
                        :enterable='false'
                        effect="dark"
                        :content="value.label"
                        placement="top">
              <span @click="setVerticalAlign(value.value)"
                    :class="{selected:((!!!curCellStyle.verticalAlign && value.value ==='top') ||curCellStyle.verticalAlign === value.value)}">
                <span :class="`rh-v-${value.value}`">
                  <em class="e1">
                    <i></i>
                  </em>
                  <em class="e2">
                    <i></i>
                  </em>
                  <em class="e3">
                    <i></i>
                  </em>
                </span>
              </span>
            </el-tooltip>
          </el-col>
        </el-row>
        <el-row class="rh-h-bottom">
          <el-col :span="8"
                  v-for="value in textAlignData"
                  :key="value.value"
                  class="rh-bottom-wrap">
            <el-tooltip class="item"
                        :enterable='false'
                        effect="dark"
                        :content="value.label"
                        placement="bottom">
              <span @click="setTextAlign(value.value)"
                    :class="{selected:((!!!curCellStyle.verticalAlign && value.value ==='left') || curCellStyle.textAlign === value.value)}">
                <span :class="`rh-h-align-${value.value}`">
                  <em class="e1"></em>
                  <em class="e2"></em>
                  <em class="e3"></em>
                  <em class="e4"></em>
                </span>
              </span>
            </el-tooltip>
          </el-col>
        </el-row>
      </div>
      <div class="rh-h-left5">
        <el-tooltip class="item"
                    :enterable='false'
                    effect="dark"
                    content="自动换行"
                    placement="top">
          <div class="rh-left5-top">
            <span class="rh-left5-top-wrap"
                  :class="{selected:curCellStyle.wrapCol === 'break-word'}"
                  @click="setFontStyle('break-word','overflow-wrap')">
              <span class="icon-A10661_automaticlineBreak"></span>
              <span class="rh-l5-txt">自动换行</span>
            </span>
          </div>
        </el-tooltip>
        <el-tooltip class="item"
                    :enterable='false'
                    effect="dark"
                    :content="mergeCell?'取消合并':'合并'"
                    placement="bottom">
          <div class="rh-left5-bottom">
            <span class="rh-left5-bottom-wrap"
                  :class="mergeCell? 'selected':''"
                  @click="mergeCells(!mergeCell)">
              <span class="icon-A10662_consolidationCentered"></span>
              <span v-if="!mergeCell"
                    class="rh-l5-txt">合并</span>
              <span v-else
                    class="rh-l5-txt">取消合并</span>
            </span>
          </div>
        </el-tooltip>
      </div>
      <div class="rh-h-left5" style="width:15%">
        <el-tooltip class="item"
                    :enterable='false'
                    effect="dark"
                    content="筛选"
                    placement="top">
          <div class="rh-left5-top">
            <span class="rh-left5-top-wrap"
                  :class="{selected:showFilter}"
                  @click="setShowFilter">
              <span class="icon-A10666_sortingAndFiltering"></span>
              <span class="rh-l5-txt">筛选</span>
            </span>
          </div>
        </el-tooltip>
      </div>
    </div>
    <div class="rf-h-right">
      <div class="rf-right-1">
        <div class="rh-r-11">
          <div class="rh-r-11-top"
               style="margin-top: -1px;">
            <!-- <span class="icon-A10663_insert"></span>
            <span class="rh-r-txt">插入</span>
            <span class="icon-A10009_triangleDown r-down"></span> -->

            <el-dropdown size="mini"
                         trigger="click"
                         @visible-change="handleValid"
                         @command="command=>handleCell(command,'insert')">
              <span>
                <span class="icon-A10663_insert"></span>
                <span class="rh-r-txt">插入</span>
                <span class="icon-A10009_triangleDown r-down"></span>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command='row'
                                  :disabled="handleRowDisabled">插入整行</el-dropdown-item>
                <el-dropdown-item command='col'
                                  :disabled="handleColDisabled">插入整列</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
          <div class="rh-r-11-top"
               style="margin-top: 3px;">

            <el-dropdown size="mini"
                         trigger="click"
                         @visible-change="handleValid('delete')"
                         @command="command=>handleCell(command,'delete')">
              <span>
                <span class="icon-A10664_delete"></span>
                <span class="rh-r-txt">删除</span>
                <span class="icon-A10009_triangleDown r-down"></span>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command='row'
                                  :disabled="handleRowDisabled">删除整行</el-dropdown-item>
                <el-dropdown-item command='col'
                                  :disabled="handleColDisabled">删除整列</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
        <div class="rh-r-12">
          <el-dropdown
            size="mini"
            trigger="click"
            placement="bottom"
            @command="command=>handleRowCol(command)"
          >
            <div>
              <div class="icon-A10665_format rh-format"></div>
              <div class="rh-r-txt">格式</div>
              <div class="icon-A10009_triangleDown r-down"></div>
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="cellSize" disabled class="nav-item">单元格大小</el-dropdown-item>
              <el-dropdown-item command="row" class="text-item">行高</el-dropdown-item>
              <el-dropdown-item command="col" class="text-item">列宽</el-dropdown-item>
              <el-dropdown-item v-if="cellCondFormat!=='0'" command="cellRule" disabled class="nav-item">单元格条件格式</el-dropdown-item>
              <el-dropdown-item v-if="cellCondFormat!=='0'" command="ruleSetting" class="text-item">条件格式设置</el-dropdown-item>
              <el-dropdown-item v-if="cellCondFormat!=='0'" command="ruleManage" class="text-item">规则管理</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
      <div :class="{'undo': hasUndo, 'rh-h-left4': true}">
        <div class="undo-mask"></div>
        <div class="rh-left4-top">
          <span class="icon-A10659_decreaseIndent"></span>
        </div>
        <div class="rh-left4-bottom">
          <span class="icon-A10660_IncreaseIndent"></span>
        </div>
      </div>
      <div :class="{'rf-right-2': true}">
        <label class="maskbox xj"></label>
        <div class="undo-mask"></div>
        <div class="rh-r-r21"
             v-if="false">
          <div class="icon-A10666_sortingAndFiltering rh-format"></div>
          <div class="rh-r-txt">筛选/排版</div>
          <div class="icon-A10009_triangleDown r-down"></div>
        </div>
        <div v-if="dataSetting!=='0'" class="rh-r-r21">
          <!-- <div class="rh-format">T</div>
          <div class="rh-r-txt">数字</div>
          <div class="icon-A10009_triangleDown r-down"></div> -->

          <el-dropdown size="mini"
                       trigger="click"
                       placement="bottom"
                       @command="command=>setNumFormater(command)">
            <div @click="setCellFmtMapping">
              <div class="rh-format">T</div>
              <div class="rh-r-txt">数字</div>
              <div class="icon-A10009_triangleDown r-down"></div>
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-for="(item,index) in numFormater"
                                :key="item.command"
                                :class="{select:item.command===numSettingClicked}"
                                :command="item.command">
                <div>
                  <div v-if="index === 0"
                       style="display:inline-block;width:25px;font-weight:bold;line-height:15px;vertical-align:3px;">
                    <span style="display:block">ABC</span>
                    <span style="display:block;font-size:14px;">123</span>
                  </div>
                  <div v-if="index === 1"
                       style="display:inline-block;width:25px;font-weight:bold;vertical-align:8px;font-size:14px;">
                    <span>123</span>
                  </div>
                  <div v-if="index === 2"
                       style="display:inline-block;width:25px;font-weight:normal;vertical-align: 8px; font-size: 24px;">
                    <span>%</span>
                  </div>
                  <div v-if="index === 3"
                       style="display:inline-block;width:25px;vertical-align: -2px; font-size: 16px;">
                    <span class="icon-A10344_setting"></span>
                  </div>

                  <div style="display:inline-block;line-height:20px;padding:5px 0 5px 5px;">
                    <span style="display:block;font-size:14px;"> {{item.value}} </span>
                    <span style="display:block"> {{item.patten}} </span>
                  </div>
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>

        </div>

        <div v-if="showFormula!=='0'" class="summation rh-r-r21" style="width:25%;">
          <!-- <div
               style="width:auto;"
               class="summation"
          >
            <div class="summation icon-A10667_Summation rh-summa"></div>
            <div class="summation rh-r-txt">插入函数</div>
          </div> -->
          <el-dropdown size="mini"
                       trigger="click"
                       placement="bottom"
                       @command="command=>setCustomFunc(command)">
            <div>
              <div class="summation icon-A10667_Summation rh-summa"></div>
              <div class="summation rh-r-txt">插入函数</div>
              <div class="summation icon-A10009_triangleDown r-down"></div>
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-for="(item,index) in basicFormulas"
                                :key="index"
                                :command="item.label"
                                class="summation"
              >
                <div v-if="item.label==='other'" style="height:1px;border-bottom:1px dashed #ccc;left:12px;right:0;position:absolute;"></div>
                <div class="summation" style="font-size:14px;">
                  <span :class="['summation',{'icon-A10667_Summation':index===0}]" style="width:12px;display:inline-block;font-size:12px"></span>
                  {{item.value}}
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div class="rh-r-r21" @click="toggleFixed">
          <el-dropdown size="mini"
                       trigger="click"
                       placement="bottom"
                       @command="command=>setFixedFunc(command)">
            <div>
              <div class="icon-A10668_freeze rh-format"></div>
              <div class="rh-r-txt">冻结</div>
              <div class="icon-A10009_triangleDown r-down"></div>
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="fixed" v-show="showFixed">冻结窗格</el-dropdown-item>
              <el-dropdown-item command="unfixed" v-show="!showFixed">取消冻结窗格</el-dropdown-item>
              <el-dropdown-item command="fixedLine">冻结首行</el-dropdown-item>
              <el-dropdown-item command="fixedColumn">冻结首列</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div class="rh-r-r21" style="width:25%">
          <el-dropdown size="mini"
                       trigger="click"
                       placement="bottom"
                       @command="command=>renderChart(command)">
            <div>
              <div class="icon-A10668_freeze rh-format"></div>
              <div class="rh-r-txt">插入图形</div>
              <div class="icon-A10009_triangleDown r-down"></div>
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-for="(item,index) in chartList"
                                :key="item.id"
                                :command="item.id">
                <div style="display:inline-block;vertical-align: -2px; font-size: 16px; line-height:30px;">
                    <span :class="item.icon"></span>
                    <span style="display:inline-block"> {{item.label}} </span>
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div class="rh-r-r21 rh-undo"
             :class="queryCriteria ? 'selected':''"
             @click="paramShowChange">
          <div>
            <span class="icon-A10392_search rh-format"></span>
            <span class="rh-r-txt">参数</span>
            <span v-if="queryCriteria"
                  class="icon-A10008_triangleUp r-down"></span>
            <span v-else
                  class="icon-A10009_triangleDown  r-down"></span>
          </div>
        </div>
      </div>
    </div>
    <el-dialog
      size="mini"
      width="500px"
      title="自定义数字格式"
      v-if="dialogNumFml"
      :visible.sync="dialogNumFml"
      :close-on-click-modal="false"
      :before-close="cancelSet"
    >
      <el-container>
        <el-container>
          <el-aside width="165px" class="condi-aside">
            <div>
              <MainTitle width="100px" title="分类"></MainTitle>
              <ul class="num-aside">
                <li v-for="(item, index) in numFormater" v-if="item.command !=='custom'"
                    :class="{select:item.command==numSettingClicked&&!multiFmt}"
                    :key="item.command"
                    @click.self="setCurFmt(item)"
                > {{item.value}}</li>
              </ul>
            </div>
          </el-aside>
          <el-main class="condi-main">
            <div>
              <span v-show="numSettingClicked=='common'||multiFmt">{{numExplain}}</span>
              <div v-show="(numSettingClicked=='numeric'||numSettingClicked=='percent')&&!multiFmt">
                <label>小数位数：</label>
                <el-select
                  v-model="numDot"
                  size="mini"
                  style="width:138px"
                  @change="setDot"
                >
                  <el-option
                    v-for="item in [0,1,2,3,4,5,6]"
                    v-if="numSettingClicked=='percent'?item<=2:item<=6"
                    :key="item"
                    :label="item"
                    :value="item"
                  ></el-option>
                </el-select>
              </div>
            </div>

          </el-main>
        </el-container>
        <el-footer height="40px" style="padding: 20px 0 0 15px;color:#666">
          <span v-show="numSettingClicked=='numeric'">数值格式用于一般数字的表示。</span>
          <span v-show="numSettingClicked=='percent'">以百分数的形式显示单元格的值。</span>
        </el-footer>
      </el-container>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancelSet">取 消</el-button>
        <el-button size="mini" type="primary" @click="conditionSet">确 定</el-button>
      </span>
    </el-dialog>
    <dialogInsertFunc v-if="showFormula"></dialogInsertFunc>
    <ReportCondiRule v-if="propList.newRuleDialogVisible||propList.mngRuleDialogVisible" :propList.sync="propList"></ReportCondiRule>
  </div>
</template>
<script>
import { HST } from "../../utils/HandsTable.js";
import { mapState, mapMutations, mapActions } from "vuex";
import MainTitle from "../tools/MainTitle";
import dialogInsertFunc from "../design/InsertFuncDialog.vue";
import ReportCondiRule from "../design/ReportCondiRule.vue";
import getUUID from "../../utils/UUID";
export default {
  name: 'ReportFunc',
  components: {
    MainTitle,
    dialogInsertFunc,
    ReportCondiRule
  },
  data() {
    return {
      showFixed: true,
      characterType: '微软雅黑体',
      characterTypes: [
        { key: 'Microsoft YaHei', value: '微软雅黑体' },
        { key: '黑体', value: '黑体' },
        { key: '宋体', value: '宋体' },
        { key: 'Arial', value: 'Arial' },
        { key: 'Calibri', value: 'Calibri' },
        { key: 'Monaco', value: 'Monaco' },
        { key: 'Tahoma', value: 'Tahoma' },
        { key: 'Helvetica', value: 'Helvetica' },
      ],
      fontSize: '11',
      fontSizes: [
        { key: '10pt', value: 10 },
        { key: '11pt', value: 11 },
        { key: '12pt', value: 12 },
        { key: '14pt', value: 14 },
        { key: '16pt', value: 16 },
        { key: '18pt', value: 18 },
        { key: '24pt', value: 24 },
        { key: '28pt', value: 28 },
        { key: '32pt', value: 32 },
        { key: '36pt', value: 36 },
        { key: '44pt', value: 44 },
        { key: '52pt', value: 52 },
        { key: '72pt', value: 72 },
      ],
      decDefault: 'none',
      decoration: ['none', 'underline', 'line-through'],
      borderArray: [
        { key: 'none', value: '无框线' },
        { key: 'all-border', value: '所有框线' },
        { key: 'border', value: '外侧框线' },
        { key: 'border-bottom', value: '下框线' },
        { key: 'border-top', value: '上框线' },
        { key: 'border-left', value: '左框线' },
        { key: 'border-right', value: '右框线' },
        { key: 'double', value: '粗匣框线' }
      ],
      bdStyleArray: [
        { key: 'solid', value: 'solid' },
        { key: 'dotted', value: 'dotted' },
        { key: 'double', value: 'double' },
      ],
      verAlignData: [
        {
          value: 'top',
          label: '上对齐'
        }, {
          value: 'middle',
          label: '垂直对齐'
        }, {
          value: 'bottom',
          label: '下对齐'
        }
      ],
      textAlignData: [
        {
          value: 'left',
          label: '左对齐'
        }, {
          value: 'center',
          label: '居中对齐'
        }, {
          value: 'right',
          label: '右对齐'
        }
      ],
      chartList: [{
        id: 'VeLine',
        icon: 'icon-A10113_chart',
        label: '线图'
      },{
        id: 'VeHistogram',
        icon: 'icon-A10470_Histogram',
        label: '柱图'
      },{
        id: 'VePie',
        icon: 'icon-A10473_PieChart',
        label: '饼图'
      },{
        id: 'VeGauge',
        icon: 'icon-A10483_InstrumentChart',
        label: '仪表盘'
      },{
        id: 'VeRadar',
        icon: 'icon-A10482_RadarMap',
        label: '雷达图'
      },{
        id: 'VeScatter',
        icon: 'icon-A10471_ScatterPlot',
        label: '散点图'
      },{
        id: 'VeFunnel',
        icon: 'icon-A10471_ScatterPlot',
        label: '漏斗图'
      },{
        id: 'VeRosePie',
        icon: 'icon-A10471_ScatterPlot',
        label: '极坐标'
      }
      ],
      numFormater: [{
        command: 'common',
        type: 'numeric',
        value: '常规',
        patten: '无特定格式'
      }, {
        command: 'numeric',
        type: 'numeric',
        value: '数值',
        patten: '1.22'
      }, {
        command: 'percent',
        type: 'numeric',
        value: '百分比',
        patten: '122.00%'
      }, {
        command: 'custom',
        type: 'custom',
        value: '自定义',
        patten: ''
      }],//数字格式
      numExplain: '不包含任何特定数字格式。',
      numSettingClicked: 'common',
      numDot: 2,
      multiFmt: false,//选中单元格是否包含多种数据格式
      bgColor: '#FFC000',//背景色
      fontColor: '#666666',
      bdMenuShow: false,
      subMenuShow: false,
      borderType: 'all-border',//边框类型
      borderStyle: 'solid',//边框线型
      borderColor: '#666666',//边框颜色
      handleRowDisabled: false,
      handleColDisabled: false,
      hasUndo: true,
      bdClass: '',
      pasteFml: false,
      dialogNumFml: false,
      basicFormulas: [{
        value: '求和',
        label: '=SUM()'
      }, {
        value: '平均值',
        label: '=AVERAGE()'
      }, {
        value: '计数',
        label: '=COUNT()'
      }, {
        value: '最大值',
        label: '=MAX()'
      }, {
        value: '最小值',
        label: '=MIN()'
      }, {
        value: '其他函数...',
        label: 'other'
      }],
      propList: {
        type: 'new',
        newRuleDialogVisible: false,
        mngRuleDialogVisible: false
      }
    };
  },
  watch: {
    copySourceText(val) {
      if (val.length == 0) {
        this.pasteFml = true
      } else {
        this.pasteFml = false
      }
    },
    condiRule(val) {
      HST.condiRuleClass()
    }
  },
  computed: {
    ...mapState({
      edcuiCompts: state => state.ReportMgt.edcuiCompts,
      queryCriteria: state => state.ReportMgt.queryCriteria,
      hot: state => state.ReportMgt.hot,
      curCellStyle: state => state.ReportMgt.curCellStyle,
      mergeCell: state => state.ReportMgt.mergeCell,
      activedNum: state => state.ReportMgt.activedNum,
      copyText: state => state.ReportMgt.copyText,
      copySourceText: state => state.ReportMgt.copySourceText,
      formatPainter: state => state.ReportMgt.formatPainter,
      fmPainter: state => state.ReportMgt.fmPainter,
      maxRows: state => state.ReportMgt.maxRows,
      maxCols: state => state.ReportMgt.maxCols,
      cellText: state => state.ReportMgt.cellText,
      historyData: state => state.ReportMgt.historyData,
      historyType: state => state.ReportMgt.historyType,
      historyIndex: state => state.ReportMgt.historyIndex,
      reportLoading: state => state.ReportMgt.reportLoading,
      condiRule: state => state.ReportMgt.condiRule,
      cellCondFormat: state =>state.commonProperties.report.cellCondFormat,
      dataSetting: state =>state.commonProperties.report.dataSetting,
      showFormula: state =>state.commonProperties.report.formula,
      showFilter: state => state.ReportMgt.showFilter
    }),
    redoDisabled() {
      return (this.historyData.length === this.historyIndex + 1 && this.historyType != 'undo')
    },
    undoDisabled() {
      return this.historyIndex < 0 || (this.historyIndex === 0 && this.historyType === 'undo')
    }
  },
  mounted() {
    document.addEventListener('mouseup', function (e) {
      if (e.target.className.toString().indexOf('border-down') === -1) {
        let sign = false;
        function findParent(dom) {
          if (dom && !sign) {
            if (dom.parentNode && ((dom.parentNode.className || '').toString().indexOf('el-color-dropdown') > -1 || (dom.parentNode.className || '').toString().indexOf('has_sub_item') > -1) || (dom.className || '').toString().indexOf('has_sub_item') > -1) {
              sign = true
            } else {
              findParent(dom.parentNode)
            }
          }
        }
        findParent(e.target)
        if (!sign) {
          this.bdMenuShow = false
          document.querySelector('.bdMenu').style.display = 'none'
        }
      }
    })
  },
  methods: {
    /** 条件参数区域展示or隐藏 */
    paramShowChange() {
      this.upQueryCriteria(!this.queryCriteria);
      if (this.queryCriteria) {
        this.upActivedNum(0)
      } else {
        this.upActivedNum(1)
        this.$nextTick(() => {
          this.hot.render()
        });
      }

    },
    /** 文字水平对齐方式 */
    setTextAlign(align) {
      HST.setTextAlign(align)
    },
    /** 文字竖直对齐方式 */
    setVerticalAlign(align) {
      HST.setVerticalAlign(align)
    },
    /** 文字加粗 or 斜体Italic,下划线,自动换行
     * style: bold,italic,underline...,none
     * type: font-weight加粗,font-style斜体,text-decoration 下划线,overflow-wrap
     */
    setFontStyle(style, type) {
      const hot = this.hot,
        cells = hot.getSelected(),
        {row: hr, col: hc} = hot.getSelectedRangeLast().highlight
      let origVal = [], newVal = []
      const highStyle = hot.getCellMeta(hr, hc).style || []
      cells.map(cell => {
        let range = cell, origArr = [], newArr = []
        if (range[2] < range[0]) {
          [range[0], range[2]] = [range[2], range[0]];
        }
        if (range[3] < range[1]) {
          [range[1], range[3]] = [range[3], range[1]];
        }
        for (let i = range[0]; i <= range[2]; i++) {
          for (let j = range[1]; j <= range[3]; j++) {
            let celldom = hot.getCell(i, j), st = {};
            if (hot.getCellMeta(i, j).style) {
              let hotst = hot.getCellMeta(i, j).style;
              st = JSON.parse(JSON.stringify(hotst));
              try {
                st.length === 0 ? st = {} : null
              } catch (e) {}
              origArr.push({ ...hotst })
            }
            if (((type == 'font-style' || type == 'font-weight' || type == 'overflow-wrap') && !!highStyle[type]) || style == 'none') {
              delete st[type]
              if (type !== 'text-decoration') style = 'normal'
              if (type == 'overflow-wrap') {
                delete celldom.style['white-space']
              }
            } else {
              st[type] = style
              if (type == 'overflow-wrap') {
                if (style == "normal") {
                  // celldom.style['white-space'] = 'pre'
                  celldom.style['white-space'] = 'nowrap'
                } else {
                  celldom.style['white-space'] = 'pre-line'
                }
              }
            }
            hot.setCellMeta(i, j, 'style', st);
            if (!!celldom) {
              if (type == 'overflow-wrap') {
                if (style == "normal") {
                  celldom.style['white-space'] = 'nowrap'
                } else {
                  celldom.style['white-space'] = 'pre-line'
                }
              }
              celldom.style[type] = style;
            }
            newArr.push(st)
          }
        }
        origVal.push(origArr)
        newVal.push(newArr)
      })
      let history = {
        type: 'style',
        origVal: origVal,
        newVal: newVal,
        cells: cells
      }
      this.upHistoryData(history)
      HST.getCellStyle();
    },
    /** 文字字体，文字大小
     * font:字体or大小
     * type: font-family,font-size
     */
    setFont(font, type) {
      const hot = this.hot,
        cells = hot.getSelected()
      let origVal = [], newVal = []
      cells.map(cell => {
        let range = cell, origArr = [], newArr = []
        if (range[2] < range[0]) {
          [range[0], range[2]] = [range[2], range[0]];
        }
        if (range[3] < range[1]) {
          [range[1], range[3]] = [range[3], range[1]];
        }
        for (let i = range[0]; i <= range[2]; i++) {
          for (let j = range[1]; j <= range[3]; j++) {
            let celldom = hot.getCell(i, j);
            let st = {};
            if (hot.getCellMeta(i, j).style) {
              let hotst = hot.getCellMeta(i, j).style
              st = JSON.parse(JSON.stringify(hotst))
              try {
                st.length === 0 ? st = {} : null
              } catch (e) {}
              origArr.push({ ...hotst })
            }
            if (font == '14' || font == 'Microsoft YaHei') {
              delete st[type]
            } else {
              st[type] = font
            }

            hot.setCellMeta(i, j, 'style', st);
            if (!!celldom) {
              celldom.style[type] = font;
            }
            newArr.push(st)
          }
        }
        origVal.push(origArr)
        newVal.push(newArr)
      })
      let history = {
        type: 'style',
        origVal: origVal,
        newVal: newVal,
        cells: cells
      }
      this.upHistoryData(history)
      HST.getCellStyle();
    },
    /** 合并单元格 */
    mergeCells(sign) {
      let mergeObj = this.hot.getPlugin("MergeCells"),
        cells = this.hot.getSelectedRange(),
        cellsSelect = this.hot.getSelected(),
        mergedCells = mergeObj.mergedCellsCollection.mergedCells

      //如果选中区域有合并单元格，再次合并则取消合并
      cellsSelect.map(cell => {
        let [row, col, rowEnd, colEnd] = cell
        if (row > rowEnd) {
          [row, rowEnd] = [rowEnd, row]
        }
        if (col > colEnd) {
          [col, colEnd] = [colEnd, col]
        }
        mergedCells.forEach(mergedData => {
          let [mrow, mrs, mcol, mcs] = [mergedData.row, mergedData.rowspan, mergedData.col, mergedData.colspan]
          if (mrow >= row && mrow + mrs - 1 <= rowEnd && mcol >= col && mcol + mcs - 1 <= colEnd) {
            sign = false
          }
        })
      })
      if (sign) {
        cells.map(cell => {
          mergeObj.mergeSelection(cell);
        })
      } else {
        cells.map(cell => {
          mergeObj.unmergeSelection(cell);
        })
      }
      let history = {
        type: 'merge',
        ismerge: sign,
        cells: cells
      }
      this.upHistoryData(history)
    },
    /** 设置背景色,字体颜色 */
    setColor(type) {
      const hot = this.hot,
        cells = hot.getSelected()
      let origVal = [], newVal = []
      cells.map(cell => {
        let range = cell, origArr = [], newArr = []
        if (range[2] < range[0]) {
          [range[0], range[2]] = [range[2], range[0]];
        }
        if (range[3] < range[1]) {
          [range[1], range[3]] = [range[3], range[1]];
        }
        for (let i = range[0]; i <= range[2]; i++) {
          for (let j = range[1]; j <= range[3]; j++) {
            let celldom = hot.getCell(i, j),
              st = {};
            if (hot.getCellMeta(i, j).style) {
              let hotst = hot.getCellMeta(i, j).style
              st = JSON.parse(JSON.stringify(hotst))
              try {
                st.length === 0 ? st = {} : null
              } catch (e) {}
              origArr.push({ ...hotst })
            }
            let color = this.bgColor
            if (type === 'color') {
              color = this.fontColor
            }
            if (color === 'transparent' || color === '#666666') {
              delete st[type]
            } else {
              st[type] = color
            }
            hot.setCellMeta(i, j, 'style', st);
            if (!!celldom) {
              celldom.style[type] = color
            }
            newArr.push(st)
          }
        }
        origVal.push(origArr)
        newVal.push(newArr)
      })
      let history = {
        type: 'style',
        origVal: origVal,
        newVal: newVal,
        cells: cells
      }
      this.upHistoryData(history)
      HST.getCellStyle();
    },
    /**展开,关闭色板 */
    dropColorPicker(ref, boolean) {
      if (boolean !== undefined) {
        this.$refs[ref].showPicker = boolean
        if (boolean) {
          this.subMenuShow = false
        }
      } else {
        this.$refs[ref].showPicker = true
        this.subMenuShow = false
      }
    },
    borderStyleOver() {
      this.subMenuShow = true
      this.dropColorPicker('bdPicker', false)
    },
    colorChange(val, type) {
      val = val.replace(/rgb\(|\)/g, '').split(',')
      let result = '';
      val.forEach(v => {
        result += `${parseInt(v).toString(16)}`
      })
      if (type === 'bg') {
        this.bgColor = `#${result.toUpperCase()}`
      } else if (type === 'font') {
        this.fontColor = `#${result.toUpperCase()}`
      } else if (type === 'bd') {
        this.borderColor = `#${result.toUpperCase()}`
      }
    },
    /** 设置边框
     * 'key:value'
     * type:边框
     * style:线型
     * color:边框颜色
     */
    setBorder(obj = {}, _i = -1) {
      const key = Object.keys(obj)[0],
        map = { 'border-left': ['border-right', 0, -1], 'border-top': ['border-bottom', -1, 0] }
      let origVal = [], newVal = []

      if (key === 'type') {
        this.borderType = obj[key]
        this.borderStyle = 'solid'
        this.bdMenuShow = false
        if (obj[key] === 'none') {
          this.borderStyle = 'none'
        }
        this.bdClass = `rh-bd-type-${_i}`
      } else if (key === 'style') {
        this.borderStyle = obj[key]
        this.bdMenuShow = false
        this.subMenuShow = false
      } else if (key === 'color') {
        document.querySelector('.bdMenu').style.display = 'none'
        this.bdMenuShow = false
      }
      let bdVal = ""
      let bs = this.borderStyle.replace(/double/g, 'solid')
      if (key !== 'style' && key !== undefined) {
        if (['all-border', 'border'].indexOf(this.borderType) > -1) {
          bdVal = `1px solid ${this.borderColor}`
        } else if (this.borderType === 'double') {
          bdVal = `2px solid ${this.borderColor}`
        } else if (this.borderType !== 'none' && this.borderType !== 'border') {
          bdVal = `1px ${bs} ${this.borderColor}`
        }
      } else {
        if (this.borderStyle !== 'none') {
          let bw = '1px'
          if (this.borderType === 'double' || this.borderStyle === 'double') {
            bw = '2px'
          }
          bdVal = `${bw} ${bs} ${this.borderColor}`
        }
      }

      const hot = this.hot,
        cells = hot.getSelected();//获取选中单元格
      cells.map(cell => {
        let range = cell, origArr = [], newArr = []
        if (range[2] < range[0]) {
          [range[0], range[2]] = [range[2], range[0]]
        }
        if (range[3] < range[1]) {
          [range[1], range[3]] = [range[3], range[1]]
        }
        if (this.borderType === 'border-top' || this.borderType === 'border-left') {
          range[0] += map[this.borderType][1]
          range[2] += map[this.borderType][1]
          range[1] += map[this.borderType][2]
          range[3] += map[this.borderType][2]
        } else if (['border-bottom', 'border-right'].indexOf(this.borderType) === -1) {
          range[0]--
          range[1]--
        }

        for (let i = range[0]; i <= range[2]; i++) {
          for (let j = range[1]; j <= range[3]; j++) {
            let celldom = hot.getCell(i, j), st = {};
            if (hot.getCellMeta(i, j).style) {
              let hotst = hot.getCellMeta(i, j).style;
              st = JSON.parse(JSON.stringify(hotst));
              try {
                st.length === 0 ? st = {} : null
              } catch (e) {}
              origArr.push({ ...st })
            }
            let temp = []
            if (['border-bottom', 'border-right'].indexOf(this.borderType) > -1) {
              temp = [this.borderType]
            } else if (['border-top', 'border-left'].indexOf(this.borderType) > -1) {
              temp = [map[this.borderType][0]]
            } else if (this.borderType === 'border') {
              if (j !== range[1] && (i === range[2] || i === range[0])) {
                temp.push('border-bottom')
              }
              if (i !== range[0] && (j === range[3] || j === range[1])) {
                temp.push('border-right')
              }
            } else if (i === range[0]) {
              if (j !== range[1]) {
                temp = ['border-bottom']
              }
            } else if (j === range[1]) {
              temp = ['border-right']
            } else {
              temp = ['border-right', 'border-bottom']
            }
            const bd = { 'border-right': 'borderRight', 'border-bottom': 'borderBottom' }
            temp.forEach(t => {
              if (!!celldom) {
                const t1 = bd[t]
                if ((key !== 'type' && key !== undefined) && celldom.style[t1] === '') {
                  return
                }
                celldom.style[t] = bdVal
              }
              if (this.borderType === 'none') {
                delete st[t]
              } else {
                st[t] = bdVal
              }
            });

            hot.setCellMeta(i, j, 'style', st);
            newArr.push(st)
          }
        }
        origVal.push(origArr)
        newVal.push(newArr)
      })
      let history = {
        type: 'style',
        origVal: origVal,
        newVal: newVal,
        cells: cells
      }
      this.upHistoryData(history)
      HST.getCellStyle();
    },
    setFormatPaint(sign) {
      if (sign === true) {
        this.upFmPainter(true)
        HST.formaterPainter(sign)
      } else {
        if (this.fmPainter === false) {
          this.upFmPainter(true)
          HST.formaterPainter()
        } else {
          this.upFmPainter(false)
          this.upFormatPainter({})
        }
      }
    },
    /** 复制,剪切 */
    copyEvent(sign = false) {
      HST.copyEvent(sign)
    },
    /** 粘贴 */
    pasteEvent(sign) {
      HST.pasteEvent(sign)
    },
    redoUndo(type) {
      HST.redoUndoClick = true
      if (this.historyData.length === 0 || (this.undoDisabled && type === 'undo') || (this.redoDisabled && type === 'redo')) {
        return
      }
      if (type === this.historyType) {
        this.upHistoryIndex(type)
      }
      this.upHistoryType(type)
      this.history()
    },
    handleCell(val, handle) {
      if (handle === 'insert') {
        if (val === 'row') {
          HST.rowAboveInsert()
        } else {
          HST.colLeftInsert()
        }
      } else {
        if (val === 'row') {
          HST.rowRemove()
        } else {
          HST.colRemove()
        }
      }
    },
    handleRowCol(val) {
      switch (val) {
        case 'row':
          HST.rowHeight();
          break;
        case 'col':
          HST.colWidth();
          break;
        case 'ruleSetting':
          this.propList.newRuleDialogVisible = true
          break;
        case 'ruleManage':
          this.propList.mngRuleDialogVisible = true
          break;
        default:
          break;
      }
    },
    handleValid(sign) {
      const id = document.querySelector('.el-tabs__nav.is-bottom').querySelector('.is-active').getAttribute('aria-controls')
      if (sign === 'delete') {
        this.handleRowDisabled = document.querySelector(`#${id}`).querySelector('.ht_clone_top').querySelector('.ht__active_highlight') !== null
        this.handleColDisabled = document.querySelector(`#${id}`).querySelector('.ht_clone_left').querySelector('.ht__active_highlight') !== null
      } else {
        this.handleRowDisabled = this.hot.countRows() >= this.maxRows || document.querySelector(`#${id}`).querySelector('.ht_clone_top').querySelector('.ht__active_highlight') !== null
        this.handleColDisabled = this.hot.countCols() >= this.maxCols || document.querySelector(`#${id}`).querySelector('.ht_clone_left').querySelector('.ht__active_highlight') !== null
      }
    },
    /** 数字格式化 */
    setNumFormater(command) {
      const index = HST.searchCurSheet().index
      let cells = this.hot.getSelected(), patten = '',
        numFormat = this.edcuiCompts[1].comptAttrs.tableList[index]['numericFormat'] || [],
        origVal = [...numFormat],
        newVal = []
      if (command === 'custom') {//打开弹窗
        this.dialogNumFml = true
      }
      let dot = 0.0.toFixed(this.numDot)
      if (command === 'numeric') {
        patten = dot
      } else if (command === 'percent') {
        patten = `${dot}%`
      }
      if (command !== 'custom') {
        if (cells.length > 0) {
          for (let i in cells) {
            numFormat.push({ cells: cells[i], type: 'numeric', patten: patten })
          }
        }
        newVal = [...numFormat]
        let history = {
          type: 'numFormat',
          cells,
          newVal,
          origVal
        }
        this.upHistoryData(history)
        HST.numFormatSetting(numFormat)

        // this.edcuiCompts[1].comptAttrs.tableList[index]['numericFormat'] = numFormat
      }
    },
    /** 数字类型单元格回填 */
    setCellFmtMapping() {
      const cells = this.hot.getSelected(),
        highlight = this.hot.getSelectedRangeLast().highlight,
        r = highlight.row, c = highlight.col

      // numericFormat: {pattern: "", culture: "en-US"}

      let pattern = new Set(), hlPattern = ""
      cells.map(cell => {
        if (cell[0] > cell[2]) {
          [cell[0], cell[2]] = [cell[2], cell[0]]
        }
        if (cell[1] > cell[3]) {
          [cell[1], cell[3]] = [cell[3], cell[1]]
        }
        for (let i = cell[0]; i <= cell[2]; i++) {
          for (let j = cell[1]; j <= cell[3]; j++) {
            let meta = this.hot.getCellMeta(i, j)
            try {
              let cellP = meta.numericFormat.pattern
              pattern.add(cellP)
              if (r === i && c === j) {
                hlPattern = cellP
              }
            } catch (e) {
              pattern.add('')
            }
          }
        }
      })

      if (pattern.size > 1) {
        pattern = new Set(hlPattern)
        this.multiFmt = true
      } else {
        this.multiFmt = false
      }
      try {
        let val = [...pattern][0]
        if (val === "") {
          this.numSettingClicked = 'common'
          this.numDot = 2
        } else {
          let dot = val.split('.')[1] || ""
          if (val.indexOf('%') > -1) {
            this.numSettingClicked = 'percent'
            this.numDot = dot.length - 1
          } else {
            this.numSettingClicked = 'numeric'
            this.numDot = dot.length
          }
        }
      } catch (e) { }
    },
    setCurFmt(args) {
      this.numSettingClicked = args.command
    },
    /*设置小数位数*/
    setDot(dot) {
      this.numDot = dot
    },
    cancelSet(args) {
      if (args === 'insertFunc') {
        this.upShowDialogInsertFunc(false)
      } else {
        this.dialogNumFml = false
      }
    },
    conditionSet() {
      this.dialogNumFml = false
      this.setNumFormater(this.numSettingClicked)
    },
    /** 插入函数- */
    setCustomFunc(args) {
      HST.redoUndoClick = false
      if (args === 'other') {
        this.upShowDialogInsertFunc(true)
        return
      }
      this.insertFunc(args)
    },
    /* 冻结窗格 */
    setFixedFunc(args) {
      HST.doFixed(args);
    },
    /* 插入图形 */
    async renderChart(args) {
      if(!this.hot.getSelected()){
        this.$message.warning('请先选择数据')
        return;
      }
      let range = this.hot.getSelected()[0];
      let tableData = this.hot.getData(...range);

      let param = {
        compType: args
      };
      let resp = await this.qryStyleAttrs(param);
      if (!resp) {
        return;
      } else {
        if (resp.status == 200 && resp.data.respResult == "1") {
          let data = resp.data.respData;
          let index = HST.searchCurSheet().index;
          let areaInfo = this.edcuiCompts[1].comptAttrs.tableList[index];
          if(!areaInfo.chartData){
            this.$set(areaInfo,'chartData',[]);
          }
          data.comptId = getUUID();
          data.compId = data.comptId;
          data.blockInfo.w = 400;
          data.blockInfo.h = 200;
          data.blockInfo.z = 1000;
          data.selectRange = range;
          let list = ['VeLine','VeLineArea','VeStackLineArea','VePercentStackLineArea','VeHistogram','VeStackHistogram','VePercentStackHistogram','VeBar','VeStackBar','VePercentStackBar'];
          if (list.includes(data.type)) {
            data.comptAttrs.extendSetting['xAxis.0.axisLine.show'] = true
            data.comptAttrs.extendSetting['yAxis.0.axisLine.show'] = true
          }
          // if(['VeLine','VeHistogram'].includes(data.type)) {
          //   data.comptAttrs.extendSetting['xAxis.0.axisLabel.interval'] = 0
          // }
          let params = {
            chartType: args,
            chartData: tableData,
            selectedRange: range,
            dimType: '1',
          }
          let dataResp = await this.getChartData(params);
          if (!dataResp) {
            return;
          } else {
            if (dataResp.status == 200 && dataResp.data.respResult == "1") {
              let result = dataResp.data.respData.chartData;
              data.comptData = result;
            }
          }
          areaInfo.chartData.push(data);
          this.hot.deselectCell();
        }
      }
    },

    toggleFixed() {
      let index = HST.searchCurSheet().index;
      let areaInfo = this.edcuiCompts[1].comptAttrs.tableList[index];
      if(areaInfo.fixedColumnsLeft > 0 || areaInfo.fixedRowsTop > 0) {
        this.showFixed = false;
      } else {
        this.showFixed = true;
      }
    },
    setShowFilter() {
      let index = HST.searchCurSheet().index;
      let areaInfo = this.edcuiCompts[1].comptAttrs.tableList[index];
      let showFilter = areaInfo.show_filter || false;
      areaInfo.show_filter = !showFilter;
      this.upShowFilter(!showFilter);
      this.hot.updateSettings({
        filters: !showFilter,
        dropdownMenu: !showFilter ? [ //下拉组件
          "filter_by_condition",
          "filter_by_value",
          "filter_action_bar"
        ] : false
      })
    },
    ...mapMutations({
      upQueryCriteria: "ReportMgt/upQueryCriteria",
      upActivedNum: "ReportMgt/upActivedNum",
      upFormatPainter: "ReportMgt/upFormatPainter",
      upFmPainter: "ReportMgt/upFmPainter",
      upCellText: "ReportMgt/upCellText",
      upShowDialogInsertFunc: "ReportMgt/upShowDialogInsertFunc",
      upHistoryData: "ReportMgt/upHistoryData",
      upHistoryIndex: "ReportMgt/upHistoryIndex",
      upHistoryType: "ReportMgt/upHistoryType",
      upCondiRuleList: 'ReportMgt/upCondiRuleList',
      upShowFilter: "ReportMgt/upShowFilter"
    }),
    ...mapActions({
      upFormatPainter: "ReportMgt/upFormatPainter",
      upFmPainter: "ReportMgt/upFmPainter",
      resizeWidth: "ReportMgt/resizeWidth",
      insertFunc: "ReportMgt/insertFunc",
      history: "ReportMgt/history",
      qryStyleAttrs: "PageDesign/qryStyleAttrs",
      getChartData: "ReportMgt/getChartData"
    })
  }
}
</script>
<style lang="scss" scoped>
$bdr-clr1: #c0c4cc;
$bg-clr1: #ebeef5;
$clr1: #606266;
$clr2: #666666;
$clr3: #409eff;
$hover-clr1: #c6e2ff;
$hover-clr2: #c6e2ff8c;
$disabled-clr: #999999;
$bg-clr2: #ecf5ff;
$clr3: #66b1ff;
.clearfix:after {
  display: block;
  content: "";
  visibility: hidden;
  clear: both;
  height: 0;
}
.rf-header {
  height: 66px;
  border-bottom: 1px solid $bdr-clr1;
  background-color: $bg-clr1;
  padding: 5px;
  span {
    cursor: pointer;
  }
  span[class^="icon-"] {
    font-size: 16px;
    color: $clr1;
  }
  .rh-h-left1 .el-col {
    text-align: center;
    padding-top: 3px;

    &.paste-copy {
      height: 22px;
      padding-top: 0;
      span {
        height: 22px;
        display: inline-block;
        padding-top: 3px;
        color: $clr1;
      }
      > span {
        padding: 0 3px;
        &:hover {
          background: $hover-clr1;
          // span:hover {
          //   background: $hover-clr1;
          // }
        }
      }

      .rf-down {
        line-height: 20px;
      }
    }
    &:not(.paste-copy) span {
      padding: 3px;
      color: $clr1;
      font-size: 16px;
      &:not(.disabled):hover {
        background: $hover-clr1;
      }
      &.disabled {
        color: $disabled-clr;
        cursor: not-allowed;
      }
    }
  }
  .maskbox {
    z-index: -1;
  }
  &.disabled {
    position: relative;
    .rf-h-left {
      /deep/.el-input__inner {
        color: $disabled-clr;
      }
      span {
        color: $disabled-clr !important;
        cursor: not-allowed;
        span:not(.rh-21-wrap) > em,
        em > i {
          background-color: $disabled-clr;
        }
      }
    }
    .rh-h-left4 span,
    .rf-right-1 span,
    .rf-right-1 div {
      color: $disabled-clr;
    }
    .rf-right-2 .rh-r-r21:not(.selected) {
      color: $disabled-clr;
      .el-dropdown {
        color: $disabled-clr;
      }
    }
    .maskbox {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      // right: calc(8.6% - 35px);
      bottom: 0;
      z-index: 2;
      display: inline-block;
      // &.xj {
      //   right: calc(22%);
      // }
    }
  }
}
.rf-right-2 .rh-format {
  font-size: 20px !important;
}
.rf-h-right .rf-right-2 > div.rh-r-r21 {
  font-size: 0;
  // width: 30px;
  padding-top: 3px;
  margin-top: -2px;
  span {
    width: 30px;
    display: block;
    margin: 0 auto;
    &:nth-child(2) {
      padding-top: 2px;
    }
    &:nth-child(3) {
      padding-top: 1px;
    }
  }
  > div {
    // width: 30px;
    width: 100%;
    margin: 0 auto;
  }
}
.rf-h-left {
  float: left;
  width: 49%;
  height: 100%;
  & > div {
    float: left;
    border-right: 1px solid $bdr-clr1;
    height: 100%;
  }
  .selected {
    background-color: $hover-clr1;
  }
}
.rf-h-right {
  float: left;
  width: 51%;
  color: $clr1;
  > div {
    height: 55px;
    float: left;
    padding: 3px 10px;
    &.rf-right-1 {
      width: 28%;
      border-right: 1px solid $bdr-clr1;
    }
    &.rf-right-2 {
      width: 64%;
      border-left: 1px solid $bdr-clr1;
    }
  }
  .rh-r-11 {
    float: left;
    width: 62%;
    // text-align: center;
    .rh-r-11-top {
      // padding-top: 2px;
    }
    .rh-r-11-top span {
      display: inline-block;
      vertical-align: top;
    }
    .rh-r-11-top > div {
      padding: 3px;
      &:hover {
        background: $hover-clr1;
      }
    }
    span.r-down {
      vertical-align: baseline;
    }
    .rh-r-txt {
      margin: 0 5px 0 10px;
    }
  }
  .rh-r-txt {
    font-size: 12px;
    cursor: pointer;
    display: inline-block;
  }
  .rh-r-12 {
    float: left;
    width: 38%;
    margin-top: -3px;
    > div {
      text-align: center;
      padding: 3px;
      &:hover {
        background-color: $hover-clr1;
      }
    }
    .rh-r-txt {
      font-size: 12px;
    }
    .r-down {
      font-size: 12px;
    }
  }
  .rh-format {
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
  }
  .rh-summa {
    height: 20px;
    padding-top: 2px;
    font-size: 16px;
  }
  .rf-right-2 {
    padding: 2px 10px;
    text-align: center;
    &.undo {
      border: none;
    }
    &.undo > div {
      cursor: default;
      color: $disabled-clr;
      display: none;
      &.rh-undo {
        color: $clr1;
        display: block;
        cursor: pointer;
      }
    }
    > div {
      width: 16%;
      float: left;
      cursor: pointer;
      &:hover,
      &.selected {
        background-color: $hover-clr1;
      }
      &.selected {
        position: relative;
        z-index: 3;
      }
    }
    .undo-mask {
      display: none;
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: calc(20% + 10px);
      z-index: 2;
      height: 100%;
      width: calc(80%);
      &:hover {
        background: none;
      }
      z-index: 2;
    }
  }
}
.rf-header [class*="icon-"].r-down {
  font-size: 12px;
  cursor: pointer;
}
.rh-h-left1 {
  width: 16%;
  & > .el-row {
    height: 27px;
  }
  .rh-1-col1 {
    border-right: 1px solid $bdr-clr1;
    height: 27px;
  }
  .rh-h-l2 {
    margin-top: 5px;
  }
  /*  .rh-l1-1 {
      width: 33%;
      float: left;
    } */
  .rh-l1-2 {
    /*    width: 39%;
      float: left; */
    .rf-down {
      font-size: 12px;
      // margin-left: 4px;
    }
  }
  /* .rh-l1-4 {
      width: 28%;
      float: left;
    } */
}
.rh-h-left2 {
  width: 38%;
  padding: 0 5px;
  .rh-sel1 {
    float: left;
    width: 69%;
    /deep/.el-input__inner {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      border-right: 0;
    }
  }
  .rh-sel2 {
    float: right;
    width: 30%;
    /deep/.el-input__inner {
      border-top-left-radius: 0;
      -bottom-left-radius: 0;
    }
  }
  .rh-h2-l2 {
    margin-top: 4px;
    > .el-col {
      float: left;
      font-size: 14px;
      margin-top: 2px;
      color: $clr1;
      padding: 0;
      height: 19px;
    }
    .rh-l2-1 {
      width: 42%;
      border-right: 1px solid $bdr-clr1;
      & > span {
        float: left;
        text-align: center;
      }
      .rh-l2-11 {
        width: 25%;
        font-weight: bold;
        span {
          width: 20px;
          display: inline-block;
          &:hover {
            background-color: $hover-clr1;
          }
        }
      }
      .rh-l2-12 {
        width: 25%;
        i {
          width: 20px;
          display: inline-block;
          &:hover {
            background-color: $hover-clr1;
          }
        }
      }
      .rh-l2-13 {
        width: 50%;
        /deep/.el-dropdown {
          padding: 0 3px;
          &:hover {
            background-color: $hover-clr1;
            > span > span:hover,
            .el-icon--right:hover {
              // background-color: $hover-clr1;
            }
          }
          > span > span {
            padding-right: 5px;
          }
          .el-icon--right {
            height: 19px;
            padding-top: 3px;
            margin-left: 0;
          }
        }
      }
    }
    .rh-l2-2 {
      width: 22%;
      border-right: 1px solid $bdr-clr1;
      padding: 0 5px;
      text-align: center;
      .rh-l2-21 {
        width: 40px;
        height: 19px;
        display: inline-block;
        padding-right: 3px;
        &:hover {
          background-color: $hover-clr1;
        }
        .rf-down {
          font-size: 12px;
          margin-left: 0;
          height: 19px;
          vertical-align: 5px;
          padding-top: 4px;
        }
        .el-dropdown-menu {
          width: 140px;
          top: 28px;
          left: 120px;
          z-index: 2005;
          text-align: left;
          .selected,
          li:hover {
            background-color: $bg-clr2;
            color: $clr3;
            > span > em,
            > span {
              border-color: $clr3 !important;
            }
          }
          .popper__arrow {
            top: -6px;
            left: 50%;
            margin-right: 3px;
            border-top-width: 0;
            border-bottom-color: #ebeef5;
            &::after {
              top: 1px;
              margin-left: -6px;
              border-top-width: 0;
              border-bottom-color: #ffffff;
            }
          }
        }
        .submenu {
          top: 318px;
          left: 137px;
          width: 100px;
          > li:not(:first-child) span {
            width: 100%;
            display: inline-block;
            border-top: 1px solid $clr2;
          }
          > li:last-child span {
            border-width: 2px;
          }
        }
      }
      .rh-l2-22 {
        float: left;
        width: 25%;
      }
    }
    .rh-l2-3 {
      width: 36%;
      padding: 0 0 0 5px;
      .el-col-12 {
        text-align: center;
        padding: 0 3px;
      }
      .rh-3-1-wrap,
      .rh-4-1-wrap {
        display: inline-block;
        text-align: center;
        vertical-align: top;
        // padding: 0 5px;
        height: 22px;
      }
      .rh-3-1 {
        .rh-3-11 {
          width: 16px;
          display: block;
          margin: 0 auto;
          font-size: 16px;
        }
        .rh-3-12 {
          width: 16px;
          display: block;
          margin: 0 auto;
          background: #ffc000;
          height: 3px;
        }
      }
      .rh-3-2 {
        font-size: 12px;
        display: inline-block;
        line-height: 24px;
        height: 22px;
      }
      .rh-4-1-outside {
        padding: 3px;
        &:hover {
          background: $hover-clr1;
        }
      }
      .rh-4-1 {
        .rh-4-11 {
          width: 16px;
          display: block;
          margin: 0 auto;
          height: 16px;
          line-height: 16px;
          text-align: center;
          font-size: 12px;
        }
        .rh-4-12 {
          width: 16px;
          display: block;
          margin: 0 auto;
          background: red;
          height: 3px;
        }
      }
      .rh-4-2 {
        font-size: 12px;
        display: inline-block;
        line-height: 24px;
        height: 22px;
      }
      .el-col-12 .rh-3-1-out {
        padding: 2px 3px;
        &:hover {
          background: $hover-clr1;
        }
      }
    }
    /deep/.el-color-picker {
      z-index: -1;
      position: absolute;
      height: 1px;
      bottom: -5px;
      > .el-color-picker__trigger {
        height: 1px;
        padding: 0;
        display: none;
      }
    }
    .bdPicker {
      bottom: 80px;
      left: 295px;
    }
  }
}

.rh-21-wrap {
  display: inline-block;
  width: 23px;
  height: 19px;
  padding: 3px 3px 0 3px;
  .e1 {
    float: left;
    width: 7px;
    height: 7px;
    border: 1px dotted $clr1;
  }
  .e2 {
    float: left;
    width: 6px;
    height: 7px;
    border: 1px dotted $clr1;
    border-left: none;
  }
  .e3 {
    float: left;
    width: 7px;
    height: 6px;
    border: 1px dotted $clr1;
    border-top: none;
  }
  .e4 {
    float: left;
    width: 6px;
    height: 6px;
    border: 1px dotted $clr1;
    border-top: none;
    border-left: none;
  }
  &.rh-bd-type-1 {
    .e1 {
      border-style: solid;
    }
    .e2 {
      border-style: solid solid solid none;
    }
    .e3 {
      border-style: none solid solid solid;
    }
    .e4 {
      border-style: none solid solid none;
    }
  }
  &.rh-bd-type-2 {
    .e1 {
      border-style: solid dotted dotted solid;
    }
    .e2 {
      border-style: solid solid dotted none;
    }
    .e3 {
      border-style: none dotted solid solid;
    }
    .e4 {
      border-style: none solid solid none;
    }
  }
  &.rh-bd-type-3 {
    .e3,
    .e4 {
      border-bottom-style: solid;
    }
  }
  &.rh-bd-type-4 {
    .e1,
    .e2 {
      border-top-style: solid;
    }
  }
  &.rh-bd-type-5 {
    .e1,
    .e3 {
      border-left-style: solid;
    }
  }
  &.rh-bd-type-6 {
    .e2,
    .e4 {
      border-right-style: solid;
    }
  }
  &.rh-bd-type-7 {
    .e1 {
      border-style: solid dotted dotted solid;
      border-width: 2px 1px 1px 2px;
    }
    .e2 {
      border-style: solid solid dotted none;
      border-width: 2px 2px 1px 0;
    }
    .e3 {
      border-style: none dotted solid solid;
      border-width: 0 1px 2px 2px;
    }
    .e4 {
      border-style: none solid solid none;
      border-width: 0 2px 2px 0;
    }
  }
}
ul {
  /deep/.el-dropdown-menu__item {
    > .rh-21-wrap {
      width: 18px;
      height: 13px;
      padding: 0;
      padding-right: 5px;
      &.rh-bd-type-1 {
        .e1 {
          border-style: solid;
        }
        .e2 {
          border-style: solid solid solid none;
        }
        .e3 {
          border-style: none solid solid solid;
        }
        .e4 {
          border-style: none solid solid none;
        }
      }
      &.rh-bd-type-2 {
        .e1 {
          border-style: solid dotted dotted solid;
        }
        .e2 {
          border-style: solid solid dotted none;
        }
        .e3 {
          border-style: none dotted solid solid;
        }
        .e4 {
          border-style: none solid solid none;
        }
      }
      &.rh-bd-type-3 {
        .e3,
        .e4 {
          border-bottom-style: solid;
        }
      }
      &.rh-bd-type-4 {
        .e1,
        .e2 {
          border-top-style: solid;
        }
      }
      &.rh-bd-type-5 {
        .e1,
        .e3 {
          border-left-style: solid;
        }
      }
      &.rh-bd-type-6 {
        .e2,
        .e4 {
          border-right-style: solid;
        }
      }
      &.rh-bd-type-7 {
        .e1 {
          border-style: solid dotted dotted solid;
          border-width: 2px 1px 1px 2px;
        }
        .e2 {
          border-style: solid solid dotted none;
          border-width: 2px 2px 1px 0;
        }
        .e3 {
          border-style: none dotted solid solid;
          border-width: 0 1px 2px 2px;
        }
        .e4 {
          border-style: none solid solid none;
          border-width: 0 2px 2px 0;
        }
      }
    }
    &:nth-child(9) {
      .e1 {
        width: 14px;
        height: 10px;
        border: 3px double $clr2;
        border-bottom-color: transparent;
      }
      .e2 {
        float: left;
        width: 14px;
        height: 2px;
        padding-top: 2px;
        background: red;
        border: none;
      }
    }
    &:nth-child(10) {
      .e1 {
        width: 14px;
        height: 14px;
      }
    }
    i {
      padding-left: 10px;
      margin-right: 0;
    }
    &.select {
      background-color: $bg-clr2;
      color: $clr3;
    }
  }
}
.rh-h-left3 {
  width: 15%;
  .el-row {
    padding: 0 5px;
    height: 27px;
  }
  .rh-v-wrap {
    text-align: center;
    font-size: 0;
    > span {
      padding: 4px;
      display: inline-block;
      &:hover {
        background: $hover-clr1;
      }
    }
    > span > span {
      display: table-cell;
      width: 14px;
      height: 14px;
      &.rh-v-top {
        vertical-align: top;
      }
      &.rh-v-middle {
        vertical-align: middle;
      }
      &.rh-v-bottom {
        vertical-align: bottom;
      }
      em {
        display: inline-block;
        text-align: center;
        margin-bottom: 2px;
        width: 100%;
        height: 1px;
        color: $clr1;
        i {
          background-color: $clr1;
          height: 1px;
          display: inline-block;
        }
        &.e3 {
          margin-bottom: 0;
        }
      }
      .e1 i {
        width: 100%;
      }
      .e2 i {
        width: 80%;
      }
      .e3 i {
        width: 100%;
      }
    }
  }
  .rh-h-bottom {
    padding-top: 5px;
  }
  .rh-bottom-wrap {
    text-align: center;
    font-size: 0;
    > span {
      padding: 4px;
      display: inline-block;
      &:hover {
        background: $hover-clr1;
      }
    }
    > span > span {
      display: table-cell;
      width: 14px;
      height: 14px;
      vertical-align: middle;
      color: $clr1;
      &.rh-h-align-left {
        text-align: left;
      }
      &.rh-h-align-center {
        text-align: center;
      }
      &.rh-h-align-right {
        text-align: right;
      }
      em {
        display: inline-block;
        text-align: center;
        margin-bottom: 2px;
        height: 1px;
        background-color: $clr1;
        height: 1px;
        display: inline-block;
        &.e4 {
          margin-bottom: 0;
        }
      }
      .e1 {
        width: 100%;
      }
      .e2 {
        width: 60%;
      }
      .e3 {
        width: 100%;
      }
      .e4 {
        width: 60%;
      }
    }
  }
}
.rh-h-left4 {
  width: 8%;
  padding: 5px;
  text-align: center;
  position: relative;
  &.undo {
    display: none;
    span {
      color: $disabled-clr;
    }
  }
  > div {
    height: 22px;
    &.rh-left4-bottom {
      padding-top: 8px;
    }
  }
  .undo-mask {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 2;
    height: 100%;
  }
}
.rh-h-left5 {
  width: 16%;
  font-size: 12px;
  padding: 3px;
  color: $clr1;
  > div {
    height: 22px;
    width: 100%;
    margin: 0 auto;
    .rh-left5-top-wrap,
    .rh-left5-bottom-wrap {
      padding: 3px;
      .rh-l5-txt {
        vertical-align: top;
      }
      &:hover {
        background-color: $hover-clr1;
      }
    }
    > span {
      display: inline-block;
      vertical-align: middle;
    }
  }
  .rh-left5-bottom {
    margin-top: 8px;
    padding: 0 5px;
  }
  .rh-left5-top {
    margin-top: -1px;
    padding: 0 5px;
  }
  .rh-l5-txt {
    margin-left: 5px;
  }
}
/deep/.num-aside {
  margin-top: 5px;
  border-right: 1px dashed #dcdfe6;
  li {
    padding: 5px;
    cursor: pointer;
    &.select {
      color: $clr3;
      background-color: $bg-clr2;
    }
  }
}

@media screen and (max-width: 1550px) {
  .rh-r-txt,
  .rf-h-right .rh-r-11 span.rh-r-txt,
  .rh-h-left5 > div > span.rh-l5-txt {
    display: none;
  }
  .rh-left5-bottom-wrap,.rh-left5-top-wrap{
    .rh-l5-txt{
      display: none;
    }
  }
  .rh-h-left2{
    width: 41%;
  }
  .rh-h-left5{
    width: 11%;
  }
  .rf-header .rh-h-left1 /deep/ .el-col.paste-copy > span {
    padding: 0;
  }
  .rf-h-left {
    width: 60%;
  }
  .rf-h-right {
    width: 40%;
    > div.rf-right-1 {
      width: 37%;
    }
    > div.rf-right-2 {
      width: 62%;
    }
  }
  .rf-h-right .rf-right-2 > div{
    width: 16%;
  }
}
body /deep/.el-select-dropdown .selected,
body /deep/.el-select-dropdown .hover,
body /deep/.el-select-dropdown .el-select-dropdown__item:hover {
  background-color: $bg-clr2;
  color: $clr3;
}
</style>
<style lang="scss">
$bg-clr2: #ecf5ff;
$clr3: #66b1ff;
body .el-select-dropdown .selected,
body .el-select-dropdown .hover,
body .el-select-dropdown .el-select-dropdown__item:hover {
  background-color: $bg-clr2;
  color: $clr3;
}
</style>
