import store from '../plugins/store/store'
import Handsontable from "handsontable"
import Clipboard from "clipboard"
import { Message } from 'element-ui'
import formulasUtils from '../utils/FormulasParser'
import { objDeepCopy } from "../utils/comonFunc.js";
const FormulaParser = require('../../node_modules/hot-formula-parser').Parser,
  formulasData = require("../../public/comptConfig/formulas.json")
let _PARAM = {
  autofill: '',
  commentVal: null,
  comment: {
    val: null,
    cell: []
  },
  copyableText: '', // 获取合并单元格内容时 getdata 有问题
}
let HST = {
  showHide:true,//右键是否展示隐藏菜单
  showCancleHide:true,//右键是否展示取消隐藏菜单
  cellSite: '',//活动编辑单元格位置
  formulasFlag: false,//编辑单元格是否输入公式
  selectionRange: [0, 0],//活动光标起始位置
  formulasValue: '',
  mouseIn: 'textarea',
  firstFocus: true,//是否第一次点击fx-input框
  dbl: false,
  _areaList: {},
  rendered: null,
  isMerge: false,
  textAreaClick: false,
  redoUndoClick: false,//记录是否点击了redo undo 按钮-为ht钩子监听使用
  commentsType: '', //新建,编辑
  /**hot 钩子事件 */
  initEvent() {
    let hot = store.state.ReportMgt.hot;
    store.state.ReportMgt.hot.selectCell(0, 0);
    HST.getCellArea()
    _PARAM.report = store.state.commonProperties.report
    //渲染表格
    Handsontable.hooks.add("afterRenderer", HST.afterRenderer, hot);
    Handsontable.hooks.add("afterRender", HST.afterRender, hot);
    //选中后事件
    Handsontable.hooks.add("afterSelectionByProp", HST.afterSelectionByProp, hot);
    Handsontable.hooks.add("afterSelectionEnd", HST.afterSelectionEnd, hot);
    Handsontable.hooks.add("afterSelectionEndByProp", HST.afterSelectionEndByProp, hot);
    //当一个或多个单元格被选中后调用
    Handsontable.hooks.add("afterSelection", HST.afterSelection, hot);
    // 键盘事件
    Handsontable.hooks.add("beforeKeyDown", HST.beforeKeyDown, hot);
    Handsontable.hooks.add("afterBeginEditing", HST.afterBeginEditing, hot);
    Handsontable.hooks.add("beforeAutofill", HST.beforeAutofill, hot);
    Handsontable.hooks.add("beforeAutofillInsidePopulate", HST.beforeAutofillInsidePopulate, hot);
    //滚动
    Handsontable.hooks.add("afterScrollHorizontally", HST.afterScrollHorizontally, hot);
    Handsontable.hooks.add("afterScrollVertically", HST.afterScrollVertically, hot);

    Handsontable.hooks.add("beforeOnCellMouseDown", HST.beforeOnCellMouseDown, hot);
    Handsontable.hooks.add("afterColumnResize", HST.afterColumnResize, hot);
    Handsontable.hooks.add("afterRowResize", HST.afterRowResize, hot);
    Handsontable.hooks.add("afterChange", HST.afterChange, hot);
    Handsontable.hooks.add("beforeChange", HST.beforeChange, hot);
    Handsontable.hooks.add("beforeContextMenuShow", HST.beforeContextMenuShow, hot);
    Handsontable.hooks.add("afterContextMenuShow", HST.afterContextMenuShow, hot);
    //公式组件重写
    HST.rewriteParser()
  },
  /** 重写部分公式函数 ：MAX,MIN,SUMIF.. */
  rewriteParser() {
    if (_PARAM.report.formula !== '0') {
      let parser = new FormulaParser(),
        hot = store.state.ReportMgt.hot,
        sheetParser = hot.getPlugin('formulas').sheet.parser
      parser.e = sheetParser.e
      formulasUtils.setFunction(parser)
      hot.getPlugin('formulas').sheet.parser = parser
    }
  },
  /**
   * 表格渲染完成 - 加载条件规则
   */
  afterRender() {
    if (_PARAM.report.cellCondFormat !== '0') {
      HST.condiRuleClass()
    }
  },
  afterRenderer(td, r, c, prop, value, cellProperties) {
    HST.hotafterRenderer(td, r, c, prop, value, cellProperties)
  },
	/**
	 * 过滤html标签
	 * allowed 为允许的标签
	 * 如'<em><b><strong><a><big>'
	 */
  strip_tags(input, allowed) {
    let tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
      commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;

    // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');

    return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
      return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
  },
  hotafterRenderer(td, r, c, prop, value, cellProperties) {
    if (!!value && typeof value != 'number' && value.toString().indexOf('\n') > -1) {
      if (!!cellProperties.style) {
        cellProperties.style['overflow-wrap'] = 'break-word'
      } else {
        cellProperties['style'] = { 'overflow-wrap': 'break-word' }
      }
    }

    let style = JSON.parse(JSON.stringify(cellProperties.style || {}))
    for (let key in style) {
      let k = key.replace("_", "-")
      if (key == 'overflow-wrap' && style[key] == 'break-word') {
        td.style['white-space'] = 'pre-line'
      }
      td.style[k] = style[key]
    }

    if (!!value && value.toString().indexOf('<a') == 0) {
      td.innerHTML = HST.strip_tags(value, '<a>');
    }
  },
  /**当一个或多个单元格被选中后调用 */
  afterSelection(r, c, r2, c2) {
    HST.showHide = true;
    HST.showCancleHide = true;
    if (r === r2 && c === c2) {
      //证明选中单元格
      HST.showHide = false;
      HST.showCancleHide = false;
    }
    //当行列全部隐藏时--即50 26 50 26，右击左上角空白处保留取消隐藏菜单
    if (r === r2 && r === 50 && c === c2 && c === 26) {
      HST.showCancleHide = true;
    }
    if (r === r2 && r === 50 && c === c2 && c === 0) {
      HST.showCancleHide = true;
    }
    if (r === r2 && r === 0 && c === c2 && c === 0) {
      HST.showCancleHide = true;
    }
  },
  afterSelectionByProp(r, c, r2, c2) {
    const mgt = store.state.ReportMgt
    let history = {}

    if (_PARAM.autofill) {
      try {
        history = {
          type: 'autoFill',
          cells: mgt.fillInfo.cells,
          origVal: mgt.fillInfo.beforeFillData
        }
      } catch (e) { }
    }

    if (!!mgt.direction) {
      const info = mgt.fillInfo || {},
        rr = info.cells[0], cc = info.cells[1],
        rr2 = info.cells[2], cc2 = info.cells[3]
      let range = 0, data = [], num = 1, ordernum = 0, drl, dcl, infoData = info.data, oldData
      data = mgt.hot.getSourceData(rr, cc, rr2, cc2)
      try {
        drl = infoData.length
        dcl = infoData[0].length
      } catch (e) {
        drl = 1
        dcl = 1
      }
      switch (mgt.direction) {
        case "down":
          range = rr - r
          for (let i = rr; i <= rr2; i++) {
            let sign = false
            for (let j = cc; j <= cc2; j++) {
              let dr = (i - rr) % drl, dc = (j - cc) % dcl,
                sData = infoData[dr][dc]
              if (!!sData && sData.toString().indexOf("=") === 0) {
                sData = sData.replace(/(\$?[A-Za-z]+\$?[0-9]+)/g, function (match) {
                  let col = match.replace(/\$?[0-9]+/, '').toLocaleUpperCase(),
                    reg = /\$?[0-9]+$/,
                    row = reg.exec(match)[0]
                  if (! /^\W/.test(row)) {
                    row = parseFloat(row) + parseFloat(range * num)
                  }
                  if (row.toString().replace(/\$/g, '') <= 0) {
                    sign = true
                  } else {
                    match = col + row
                  }
                  return match
                })
                if (sign) {
                  if (sData.toString().indexOf('(') > -1) {
                    sData = `${sData.split('(')[0]}(#REF!)`
                  } else {
                    sData = '#REF!'
                  }
                }
                data[i - rr][j - cc] = sData
              }
            }
            ordernum++
            if (Math.abs(range) == ordernum) {
              ordernum = 0
              num++
            }
          }
          oldData = mgt.hot.getSourceData(rr, cc, rr2, cc2)
          mgt.hot.populateFromArray(rr, cc, data)
          if (JSON.stringify(oldData) === JSON.stringify(data)) {
            mgt.direction = undefined
            mgt.hot.getPlugin('formulas').recalculateFull()
          }
          break;
        case "right":
          range = cc - c
          for (let j = cc; j <= cc2; j++) {
            let sign = false
            for (let i = rr; i <= rr2; i++) {
              let dr = (i - rr) % drl, dc = (j - cc) % dcl,
                sData = infoData[dr][dc]
              if (!!sData && sData.toString().indexOf("=") === 0) {
                sData = sData.replace(/(\$?[A-Za-z]+\$?[0-9]+)/g, function (match) {
                  let col = match.replace(/\$?[0-9]+/, '').toLocaleUpperCase(),
                    reg = /\$?[0-9]+$/,
                    row = reg.exec(match)[0],
                    newCol = col
                  if (! /^\W/.test(col)) {
                    newCol = HST.numToChar(HST.charToNum(col) + parseFloat((range * num)))
                  }
                  if (newCol.replace(/\W/g, '').charCodeAt() < 65) {
                    sign = true
                  } else {
                    match = newCol + row
                  }
                  return match
                })
                if (sign) {
                  if (sData.toString().indexOf('(') > -1) {
                    sData = `${sData.split('(')[0]}(#REF!)`
                  } else {
                    sData = '#REF!'
                  }
                }
                data[i - rr][j - cc] = sData
              }
            }
            ordernum++
            if (Math.abs(range) == ordernum) {
              ordernum = 0
              num++
            }
          }
          oldData = mgt.hot.getSourceData(rr, cc, rr2, cc2)
          mgt.hot.populateFromArray(rr, cc, data)
          if (JSON.stringify(oldData) === JSON.stringify(data)) {
            mgt.direction = undefined
            mgt.hot.getPlugin('formulas').recalculateFull()
          }
          break;
        case "up":
          range = rr2 - r2
          for (let i = rr2; i >= rr; i--) {
            let sign = false
            for (let j = cc; j <= cc2; j++) {
              let dr = (i - rr) % drl, dc = (j - cc) % dcl,
                sData = infoData[dr][dc]
              if (!!sData && sData.toString().indexOf("=") === 0) {
                sData = sData.replace(/(\$?[A-Za-z]+\$?[0-9]+)/g, function (match) {
                  let col = match.replace(/\$?[0-9]+/, '').toLocaleUpperCase(),
                    reg = /\$?[0-9]+$/,
                    row = reg.exec(match)[0]
                  if (! /^\W/.test(row)) {
                    row = parseFloat(row) + parseFloat(range * num)
                  }
                  if (row.toString().replace(/\$/g, '') <= 0) {
                    sign = true
                  } else {
                    match = col + row
                  }
                  return match
                })
                if (sign) {
                  if (sData.toString().indexOf('(') > -1) {
                    sData = `${sData.split('(')[0]}(#REF!)`
                  } else {
                    sData = '#REF!'
                  }
                }
                data[i - rr][j - cc] = sData
              }
            }
            ordernum++
            if (Math.abs(range) == ordernum) {
              ordernum = 0
              num++
            }
          }
          oldData = mgt.hot.getSourceData(rr, cc, rr2, cc2)
          mgt.hot.populateFromArray(rr, cc, data)
          if (JSON.stringify(oldData) === JSON.stringify(data)) {
            mgt.direction = undefined
            mgt.hot.getPlugin('formulas').recalculateFull()
          }
          break;
        case "left":
          range = cc2 - c2
          for (let j = cc; j <= cc2; j++) {
            let sign = false
            for (let i = rr; i <= rr2; i++) {
              let dr = (i - rr) % drl, dc = (j - cc) % dcl,
                sData = infoData[dr][dc]
              if (!!sData && sData.toString().indexOf("=") === 0) {
                sData = sData.replace(/(\$?[A-Za-z]+\$?[0-9]+)/g, function (match) {
                  let col = match.replace(/\$?[0-9]+/, '').toLocaleUpperCase(),
                    reg = /\$?[0-9]+$/,
                    row = reg.exec(match)[0],
                    newCol = col, tempCol
                  if (! /^\W/.test(col)) {
                    newCol = HST.numToChar(HST.charToNum(col) + parseFloat((range * num)))
                  }
                  tempCol = newCol.replace(/\W/g, '')
                  if (tempCol == '' || tempCol.charCodeAt() < 65) {
                    sign = true
                  } else {
                    match = newCol + row
                  }
                  return match
                })
                if (sign) {
                  if (sData.toString().indexOf('(') > -1) {
                    sData = `${sData.split('(')[0]}(#REF!)`
                  } else {
                    sData = '#REF!'
                  }
                }

                data[i - rr][j - cc] = sData
              }
            }
            ordernum--
            if (range == ordernum) {
              ordernum = 0
              num++
            }
          }
          oldData = mgt.hot.getSourceData(rr, cc, rr2, cc2)
          mgt.hot.populateFromArray(rr, cc, data)
          if (JSON.stringify(oldData) === JSON.stringify(data)) {
            mgt.direction = undefined
            mgt.hot.getPlugin('formulas').recalculateFull()
          }
          break;
      }
    }
    if (_PARAM.autofill) {
      HST.cornerFillStylus().then(res => {
        const stylusHis = res
        history.newVal = mgt.hot.getSourceData(...mgt.fillInfo.cells)
        history.stylus = stylusHis
        HST.upHisData(history)
        _PARAM.autofill = false
      })
    }
  },
  afterSelectionEnd(r, c, r2, c2, preventScrolling, selectionLayerLevel) {
    HST.commentsEditHistory(r, c)
    HST.hotafterSelection(r, c, r2, c2, preventScrolling, selectionLayerLevel);
    HST.getCellStyle()
    HST.getMergeCells()
    HST.getCellArea()
    const mgt = store.state.ReportMgt
    if (!mgt.leaveTab && Object.keys(mgt.formatPainter).length !== 0 && mgt.formatPainter.sign) {
      HST.fmPainerEvent()
    }
    if (mgt.leaveTab) {
      mgt.leaveTab = !mgt.leaveTab
    }
    if (_PARAM.report.formula !== '0') {
      if (HST.randFunc) {
        mgt.hot.getPlugin('formulas').recalculateFull()
        HST.randFunc = false
      }
      HST.fmlMapping()
    }
  },
  afterSelectionEndByProp(r, c, r2, c2, preventScrolling, selectionLayerLevel) {
    HST.hotafterSelection(r, c, r2, c2, preventScrolling, selectionLayerLevel);
    const mgt = store.state.ReportMgt
    if (mgt.direction) {
      mgt.direction = ""
    }
    //单元格映射
    if (!!store.state.HomeBody.pageCache && store.state.HomeBody.pageCache.operation == 'design') {
      HST.setCellMapping()
    }
  },
  hotafterSelection() {
    //快捷键输入日期'ctrl' + ';'
    document.onkeydown = (event) => {
      const e = event || window.event,
        keyCode = e.keyCode || e.which || e.charCode,
        ctrlKey = e.ctrlKey || e.metaKey;
      if (keyCode == 186 && ctrlKey) {//'ctrl' + ';'
        const cells = store.state.ReportMgt.hot.getSelected(),
          myDate = new Date(),
          curDate = myDate.getFullYear() + "/" + (myDate.getMonth() + 1) + "/" + myDate.getDate();
        store.state.ReportMgt.hot.setDataAtCell(cells[0][0], cells[0][1], curDate)
      }
    };
    //end
  },
  beforeKeyDown(KeyboardEvent) {
    const mgt = store.state.ReportMgt
    let active = mgt.hot.getActiveEditor() || {}
    mgt.fmPainter = false
    mgt.formatPainter = {}
    if (KeyboardEvent.ctrlKey && KeyboardEvent.keyCode == 67) {//CTRL+C
      if (KeyboardEvent.realTarget.className == 'handsontableInput') {
        KeyboardEvent.stopImmediatePropagation()
        HST.copyEvent()
      }
    }
    if (KeyboardEvent.ctrlKey && KeyboardEvent.keyCode == 88) {//CTRL+X
      KeyboardEvent.stopImmediatePropagation()
      HST.copyEvent(true)
    }
    if (KeyboardEvent.ctrlKey && KeyboardEvent.keyCode == 86) {//CTRL+V
      const id = document.querySelector('.el-tabs__nav.is-bottom').querySelector('.is-active').getAttribute('aria-controls'),
        htElement = document.querySelector(`#${id}`)

      if (htElement.querySelector('.ht_clone_top').querySelector('.ht__active_highlight') !== null || htElement.querySelector('.ht_clone_left').querySelector('.ht__active_highlight') !== null) {
        KeyboardEvent.stopImmediatePropagation()
        HST.pasteEvent()
      }

      /* if (KeyboardEvent.realTarget.className == 'handsontableInput') {
        KeyboardEvent.stopImmediatePropagation()
        HST.pasteEvent()
      } */
    }
    if (KeyboardEvent.ctrlKey && (KeyboardEvent.keyCode == 89 || KeyboardEvent.keyCode == 90)) {//CTRL+Y CTRL+Z
      const active = store.state.ReportMgt.hot.getActiveEditor()
      KeyboardEvent.stopImmediatePropagation()
      if(active.state !== "STATE_EDITING") {
        if (KeyboardEvent.keyCode == 90) {
          document.querySelector('.icon-A10652_cancel').click()
        } else {
          document.querySelector('.icon-A10653_recover').click()
        }
      }
    }

    if (['htCommentTextArea',"el-input__inner"].includes(KeyboardEvent.realTarget.className)) {
      KeyboardEvent.stopImmediatePropagation()
    }
    //解决输入公式时方向键和单元格冲突
    /* if (mgt.fmlPanelShow) {
      if (KeyboardEvent.key == "ArrowUp" || KeyboardEvent.key == "ArrowDown") {
        KeyboardEvent.stopImmediatePropagation()
      }
    } */
    // 解决按方向键单元格值消失问题
    if (/(ArrowLeft|ArrowRight|ArrowUp|ArrowDown)/.test(KeyboardEvent.key)){
      let row = active.row;
      let col = active.col;
      let value = active.TEXTAREA.value;
      if(!!value.trim()){
        setTimeout(() => {
          store.state.ReportMgt.hot.setDataAtCell(row,col,value);
        }, 0);
      }
    }
    //解决输入公式时左右方向键和单元格冲突
    if (!/ht_editor_hidden/.test((KeyboardEvent.realTarget.offsetParent || '').classList) || KeyboardEvent.realTarget.tagName == 'BODY') {
      if (/(ArrowLeft|ArrowRight|ArrowUp|ArrowDown)/.test(KeyboardEvent.key)) {//Backspace
        if (HST.textAreaClick) {
          KeyboardEvent.stopImmediatePropagation()
        } else {
          if (active.state !== 'STATE_VIRGIN') {
            active.state = 'STATE_EDITING'
            active._fullEditMode = false
            active._opened = false
            mgt.fmlPanelShow = false
            mgt.fmlPopoverShow = false
          }
        }
      }
    }
    //Backspace 屏蔽退格键删除内容
    if (/(Backspace)/.test(KeyboardEvent.key) && active.state === 'STATE_WAITING') {
      KeyboardEvent.stopImmediatePropagation()
    }
    if (/(Enter)/.test(KeyboardEvent.key)) {
      mgt.fmlPanelShow = false
      mgt.fmlPopoverShow = false
      let active = mgt.hot.getActiveEditor()

      active.TEXTAREA.removeAttribute('readOnly')
      if (active.state !== 'STATE_VIRGIN') {
        active.state = 'STATE_EDITING'
      }
      delete active.fml
      HST.formulasFlag = false
      window.fmlSourcePage()
    }
    //解决中文状态“= ， 、 -” 无法输入
    if (KeyboardEvent.key === 'Process') {
      if (!['htCommentTextArea'].includes(KeyboardEvent.realTarget.className)) {
        active.state = 'STATE_EDITING'
      }
      active._fullEditMode = true
      active._opened = true
      active.TEXTAREA_PARENT.hidden = false
      active.TEXTAREA_PARENT.classList.remove('ht_editor_hidden')
      active.TEXTAREA_PARENT.classList.add('ht_clone_master')
      active.TEXTAREA_PARENT.style.opacity = 1
    }
  },
  afterBeginEditing(r, c) {
    HST.redoUndoClick = false
    let text = store.state.ReportMgt.hot.getSourceData(r, c, r, c)[0][0] || ''
    const sheet = HST.searchCurSheet().sheetIndex,
      active = store.state.ReportMgt.hot.getActiveEditor(),
      obj1 = document.querySelector(`#pane-${sheet}`)
    if (!!store.state.HomeBody.pageCache && store.state.HomeBody.pageCache.operation !== 'design') {
      let regex = /<a.*?>(.*?)<\/a>/ig
      text = text.toString().replace(regex, '$1')
      obj1.querySelector('.handsontableDivClone').innerHTML = text

      let h = active.TD.offsetHeight,
        w = active.TD.offsetWidth,
        bg = active.TEXTAREA.style['background-color'],
        wid = obj1.querySelector('.handsontableDivClone').offsetWidth,
        cssText = `height:${h}px;min-width:${w}px;width:${wid + 10}px;background-color:${bg};display:block;`
      obj1.querySelector('.handsontableDiv').style.cssText = cssText
      obj1.querySelector('.handsontableDiv').innerHTML = text
    } else {
      if (!!active.TEXTAREA.getAttribute('readOnly')) {
        active.TEXTAREA.value = text
      }
      if (_PARAM.report.formula === '0') {
        return
      }
      if (HST.dbl === 'dbl') {
        HST.textAreaClick = true
        HST.setFormulasInCell('dbldown')
      }
      active.TEXTAREA.style.display = 'block'
      active.TEXTAREA_PARENT.hidden = false
      active._fullEditMode = true
      active.TEXTAREA.focus()
      delete active.wait
      document.querySelector(".formulas-wrap").style.top = '1px'
      if (active.originalValue == '=RAND()') {
        HST.randFunc = true
      }
    }
  },
  beforeAutofill(start, end) {
    const mgt = store.state.ReportMgt,
      cell = mgt.hot.getSelected(),
      sourceData = mgt.hot.getSourceData(cell[0][0], cell[0][1], cell[0][2], cell[0][3]),
      beforeFillData = mgt.hot.getSourceData(start.row, start.col, end.row, end.col),
      mergeCells = JSON.parse(JSON.stringify(mgt.hot.getPlugin('MergeCells').mergedCellsCollection.mergedCells))
    mgt.fillInfo = {
      cell: cell,
      cells: [start.row, start.col, end.row, end.col],
      data: sourceData,
      beforeFillData,
      mergeCells
    }
    // mgt.hot.populateFromArray(start.row, start.col, sourceData, end.row, end.col)
  },
  beforeAutofillInsidePopulate(index, direction, input, deltas) {
    const mgt = store.state.ReportMgt
    mgt.direction = direction
    _PARAM.autofill = direction
    const cell = mgt.hot.getSelected(),
      sourceData = mgt.hot.getSourceData(cell[0][0], cell[0][1], cell[0][2], cell[0][3]),
      data = mgt.hot.getData(cell[0][0], cell[0][1], cell[0][2], cell[0][3])
    if (JSON.stringify(sourceData) == JSON.stringify(data)) {
      mgt.direction = null
    }
  },
  afterScrollHorizontally() {
    if ((store.state.HomeBody.pageCache || '').operation != 'design') {
      const curSheet = HST.searchCurSheet()
      try {
        document.querySelector(`#pane-${curSheet.sheetIndex}`).querySelector('.handsontableDiv').style.display = 'none'
      } catch (e) { }
    }
    HST.commentAdd()
    store.state.ReportMgt.fmlPanelShow = false
    store.state.ReportMgt.fmlPopoverShow = false
  },
  afterScrollVertically() {
    if ((store.state.HomeBody.pageCache || '').operation != 'design') {
      const curSheet = HST.searchCurSheet()
      try {
        document.querySelector(`#pane-${curSheet.sheetIndex}`).querySelector('.handsontableDiv').style.display = 'none'
      } catch (e) { }
    }
    HST.commentAdd()
    store.state.ReportMgt.fmlPanelShow = false
    store.state.ReportMgt.fmlPopoverShow = false
  },
  beforeOnCellMouseDown() {
    //计算公式-选中单元格填入位置编号
    if (_PARAM.report.formula !== '0' && (store.state.HomeBody.pageCache || '').operation === 'design') {
      HST.formulasMouseDown(arguments[1])
    }
  },
  afterColumnResize(col, newWidth) {
    let mgt = store.state.ReportMgt, w = 80
    if (!!mgt.manualColWidths[col] || mgt.manualColWidths[col] == 0) {
      w = mgt.manualColWidths[col]
    }
    let history = {
      type: 'resizeColWidth',
      origVal: [[w]],
      newVal: newWidth,
      cells: [[0, col, 0, col]]
    }
    mgt.manualColWidths = []
    HST.upHisData(history)
  },
  afterRowResize(row, newHeight) {
    let mgt = store.state.ReportMgt, h = 22
    if (!!mgt.manualRowHeights[row] || mgt.manualRowHeights[row] == 0) {
      h = mgt.manualRowHeights[row]
    }
    let history = {
      type: 'resizeRowHeight',
      origVal: [[h]],
      newVal: newHeight,
      cells: [[row, 0, row, 0]]
    }
    mgt.manualRowHeights = []
    HST.upHisData(history)
  },
  beforeChange(changes, source) {
    if (source === 'MergeCells' && (_PARAM.autofill||HST.redoUndoClick)) {
      return false
    }
  },
  afterChange(changes, source) {
    const mgt = store.state.ReportMgt;
    if (mgt.direction === '') {
      if ( source !== 'Autofill.fill') {
        if (source === 'populateFromArray') {
          mgt.direction = undefined
        }
        mgt.hot.getPlugin('formulas').recalculateFull()
      }
    }
    if (source === 'Autofill.fill') {
      let [r1, c1] = changes[0]
      let [r2, c2] = changes[changes.length - 1]
      if (mgt.historyData.length > 0 && mgt.historyData[mgt.historyData.length-1].type === "autoFill") {
        mgt.historyData[mgt.historyData.length-1].newVal = mgt.hot.getSourceData(r1, c1, r2, c2)
      }
    }
    // // 记录当前正在编辑公式的sheet
    // let changedVal = changes[0][3];
    // // && [',', '+', '-', '*', '/'].includes(oriValue.substr(oriValue.length - 2, 1))
    // if (changedVal && changedVal.indexOf('=') === 0) {
    //   window.formularing = true;
    //   window.formularValue = changedVal;
    //   window.formularSheet = HST.searchCurSheet().sheetIndex;
    // } else {
    //   window.formularing = false;
    //   window.formularValue = undefined;
    //   window.formularSheet = undefined;
    // }
    // // 记录当前正在编辑公式的sheet

   // 判断是否有绑定图形，更新图形数据
    let index = HST.searchCurSheet().index
    let chartData = mgt.edcuiCompts[1].comptAttrs.tableList[index].chartData || [];
    for(let chart of chartData) {
      let range = chart.selectRange || [];
      let [r1,c1,r2,c2] = range;
      let flag = false;
      if(source === 'edit') {
        let [row, col] = changes[0];
        if(row >= r1 && row <= r2 && col >= c1 && col <= c2) {  //修改的数据在图形范围内
          flag = true;
        }
      } else if(source !== 'edit' && changes.length>1) {
        flag = true;
      }
      if(flag) {
        let type = chart.type;
        let data = mgt.hot.getData(...range);
        let params = {
          chartType: type,
          chartData: data,
          selectedRange: range,
          dimType: '1',
        }
        store.dispatch('ReportMgt/getChartData', params).then(dataResp => {
          if (dataResp.status == 200 && dataResp.data.respResult == "1") {
            let result = dataResp.data.respData.chartData;
            chart.comptData = result;
          }
        }).catch(err=>{})
      }
    }


    // changes:row, prop, oldVal, newVal
    /***
     * source:
     * 第一次加载时： edit 0，0 单元格,
     * 粘贴时： populateFromArray,CopyPaste.paste
     * 增加区域时： 4次 populateFromArray
     *  前三次都是0，0 单元格
     *
     * 判断 oldVal和newVal 是否一致，一致则不插入historyData
     *
     * 合并单元格：MergeCells
     */
    let history = {}
    if (source === 'populateFromArray' || source === 'edit') {
      if (changes.length === 1) {
        let [row, col, origVal, newVal] = changes[0]
        if (origVal === newVal && row === col && row === 0) {
          return
        } else {//手动输入变化
          if (origVal !== newVal) {
            history = {
              type: 'edit',
              cells: [row, col],
              origVal,
              newVal
            }
          }
        }
        if (origVal !== newVal && source === 'edit' && store.state.ReportMgt.historyIndex === 0) {
          HST.redoUndoClick = false
        }
      }
    }
    if (Object.keys(history).length > 0 && HST.redoUndoClick !== true) {
      HST.upHisData(history)
      HST.redoUndoClick = false
    }
  },
  beforeContextMenuShow() {
    const hot = store.state.ReportMgt.hot
    let [row,col] = hot.getSelectedLast()
    let cells = hot.getSelected()
    let comments = hot.getPlugin('Comments')
    let commentsVal = comments.getCommentAtCell(row,col)
    let [r1,c1,r2,c2] = cells[0]
    if (cells.length > 1 || r1 !== r2 || c1 !== c2) {
      let index = HST.searchCurSheet().sheetIndex
      let htTable = document.querySelector(`#htTable${index}`)
      if (htTable.querySelector('.htCommentCell.highlight') === null) {
        HST.commentsType = 'new'
      } else if (comments.getCommentAtCell(r1,c1) !== undefined && comments.getCommentAtCell(r1,c1) !== '') {
        HST.commentsType = 'multiEdit'
      } else {
        HST.commentsType = 'multiNew'
      }
      return
    }
    if (commentsVal !== undefined && commentsVal !== '') {
      HST.commentsType = 'edit'
    } else {
      HST.commentsType = 'new'
    }
  },
  afterContextMenuShow() {
    if (['edit','multiEdit','multiNew'].includes(HST.commentsType)) { //commentsVal !== undefined
      try {
        document.querySelector('.comments-edit').parentNode.parentNode.parentNode.style.display = 'table-row'
      } catch(e) {}
    } else {
      try {
        document.querySelector('.comments-edit').parentNode.parentNode.parentNode.style.display = 'none'
      } catch(e) {}
    }
  },
  //end
  /**右键菜单回调函数 */
  rowAboveInsert() {
    const hot = store.state.ReportMgt.hot,
      cells = hot.getSelected()
    let insertArr = [], coords = []
    cells.map(cell => {
      let [c0, c1, c2, c3] = cell,
        value = Math.abs(c2 - c0) + 1,
        amount = Math.min(c0, c2)
      hot.alter("insert_row", amount, value)
      insertArr.push([amount, value])
      coords.push([c0 + value, c1, c2 + value, c3])
    })
    let history = {
      type: 'insertRow',
      alterCell: insertArr,
      coords
    }
    HST.upHisData(history)

    hot.selectCells(coords, false)
  },
  colLeftInsert() {
    const hot = store.state.ReportMgt.hot,
      cells = hot.getSelected()
    let insertArr = [], coords = []
    cells.map(cell => {
      let [c0, c1, c2, c3] = cell,
        value = Math.abs(c3 - c1) + 1,
        amount = Math.min(c1, c3)
      hot.alter("insert_col", amount, value)
      insertArr.push([amount, value])
      coords.push([c0, c1 + value, c2, c3 + value])
    })
    let history = {
      type: 'insertCol',
      alterCell: insertArr,
      coords
    }
    HST.upHisData(history)
    hot.selectCells(coords, false);
  },
  colRemove() {
    const hot = store.state.ReportMgt.hot,
      cells = hot.getSelected(),
      mergedCells = hot.getPlugin("MergeCells").mergedCellsCollection.mergedCells
    let [r1,,r3,] = cells[0]
    const countRows = hot.countRows()
    if (r3 - r1 < countRows - 1) {
      cells[0][0] = 0
      cells[0][2] = countRows - 1
    }
    let removeArr = [],
      //记录数据，样式，数据格式
      fmStyleObj = {
        origVal: {}
      },
      fmData = [],
      commentsObj = {
        cells: [],
        origVal: [],
        newVal: []
      },
      delTotal = 0

    cells.map(cell => {
      let value = Math.abs(cell[3] - cell[1]) + 1,
        [c0, c1, c2, c3] = cell,
        amount = Math.min(cell[1], cell[3]),
        i = 0, j = 0//, origArr = {}

      removeArr.push([amount, value])
      delTotal += value
      fmData.push(hot.getSourceData(...cell))
      for (j = c1; j <= c3; j++) {
        for (i = c0; i <= c2; i++) {
          let meta = hot.getCellMeta(i, j)
          if (meta.style) {
            let hotst = hot.getCellMeta(i, j).style
            fmStyleObj.origVal[`${i}.${j}`] = { ...hotst }
          }
          if (meta.comment) {
            commentsObj.cells.push([i, j])
            commentsObj.origVal.push(meta.comment)
          }
        }
      }
    })

    let flag = false,
      fmMergeObj = {
        origCell: [],
        newCell: []
      }
    mergedCells.map(c => {
      cells.map(cell => {
        let [, c1, , c3] = cell
        if (c1 >= c.col && c3 < c.col + c.colspan) {
          flag = true
        }
      })
    })
    if (flag) {//记录合并单元格
      fmMergeObj.origCell = objDeepCopy(mergedCells)
    }
    if (flag) {
      fmMergeObj.newCell = [...mergedCells]
    }

    let history = {
      type: 'removeCol',
      cells,
      alterCell: removeArr
    }
    if (fmMergeObj.origCell.length > 0) {
      history.fmMergeObj = fmMergeObj
    }
    if (Object.keys(fmStyleObj.origVal).length > 0) {
      history.fmStyleObj = fmStyleObj
    }
    if (fmData.join().replace(/\,|\s/g, '') !== "") {
      history.fmData = fmData
    }
    if (commentsObj.cells.length > 0) {
      history.commentsObj = commentsObj
    }
    HST.upHisData(history)
    if (hot.countCols() > 26) {
      let mincol = hot.countCols() - delTotal
      removeArr.foreach
      if(mincol < 26) {
        mincol = 26
      }
      hot.updateSettings({
				minCols: mincol
			})
    }
    hot.alter("remove_col", removeArr)
  },
  rowRemove() {
    const hot = store.state.ReportMgt.hot,
      cells = hot.getSelected(),
      mergedCells = hot.getPlugin("MergeCells").mergedCellsCollection.mergedCells
    let [,r2,,r4] = cells[0]
    const countCols = hot.countCols()
    if (r4 - r2 < countCols - 1) {
      cells[0][1] = 0
      cells[0][3] = countCols - 1
    }
    let removeArr = [],
      //记录数据，样式，数据格式
      fmStyleObj = {
        origVal: {}
      },
      fmData = [],
      commentsObj = {
        cells: [],
        origVal: [],
        newVal: []
      },
      delTotal = 0

    cells.map(cell => {
      let value = Math.abs(cell[2] - cell[0]) + 1,
        [c0, c1, c2, c3] = cell,
        amount = Math.min(cell[0], cell[2]),
        i = 0, j = 0
      removeArr.push([amount, value])
      delTotal += value
      fmData.push(hot.getSourceData(...cell))
      for (j = c1; j <= c3; j++) {
        for (i = c0; i <= c2; i++) {
          let meta = hot.getCellMeta(i, j)
          if (meta.style) {
            let hotst = hot.getCellMeta(i, j).style
            fmStyleObj.origVal[`${i}.${j}`] = { ...hotst }
          }
          if (meta.comment) {
            commentsObj.cells.push([i, j])
            commentsObj.origVal.push(meta.comment)
          }
        }
      }
    })

    let flag = false,
      fmMergeObj = { origCell: [], newCell: [] }
    mergedCells.map(c => {
      cells.map(cell => {
        let [, c1, , c3] = cell
        if (c1 >= c.col && c3 < c.col + c.colspan) {
          flag = true
        }
      })

    })
    if (flag) {//记录合并单元格
      fmMergeObj.origCell = objDeepCopy(mergedCells)
      fmMergeObj.newCell = [...mergedCells]
    }

    let history = {
      type: 'removeRow',
      cells,
      alterCell: removeArr
    }
    if (fmMergeObj.origCell.length > 0) {
      history.fmMergeObj = fmMergeObj
    }
    if (Object.keys(fmStyleObj.origVal).length > 0) {
      history.fmStyleObj = fmStyleObj
    }
    if (fmData.join().replace(/\,|\s/g, '') !== "") {
      history.fmData = fmData
    }
    if (commentsObj.cells.length > 0) {
      history.commentsObj = commentsObj
    }
    HST.upHisData(history)
    if (hot.countRows() > 50) {
      let minrow = hot.countRows() - delTotal
      removeArr.foreach
      if(minrow < 50) {
        minrow = 500
      }
      hot.updateSettings({
				minRows: minrow
			})
    }
    hot.alter("remove_row", removeArr)
  },
  setTextAlign(align) {
    align = align.replace(/alignment:/ig, '')
    const mgt = store.state.ReportMgt,
      hot = mgt.hot,
      cells = hot.getSelected()
    let origVal = [], newVal = []
    cells.map(cell => {
      let range = cell, origArr = [], newArr = []
      if (range[2] < range[0]) {
        [range[0], range[2]] = [range[2], range[0]]
      }
      if (range[3] < range[1]) {
        [range[1], range[3]] = [range[3], range[1]]
      }
      for (let i = range[0]; i <= range[2]; i++) {
        for (let j = range[1]; j <= range[3]; j++) {
          let celldom = hot.getCell(i, j), st = {}
          if (hot.getCellMeta(i, j).style) {
            let hotst = hot.getCellMeta(i, j).style
            st = JSON.parse(JSON.stringify(hotst))
            origArr.push({ ...hotst })
          }
          st['text-align'] = align
          hot.setCellMeta(i, j, 'style', st)
          if (!!celldom) {
            celldom.style["text-align"] = align
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
    HST.upHisData(history)
    HST.getCellStyle()
  },
  setVerticalAlign(align) {
    align = align.replace(/alignment:/ig, '')
    const mgt = store.state.ReportMgt,
      hot = mgt.hot,
      cells = hot.getSelected()
    let origVal = [], newVal = []
    cells.map(cell => {
      let range = cell, origArr = [], newArr = []
      if (range[2] < range[0]) {
        [range[0], range[2]] = [range[2], range[0]]
      }
      if (range[3] < range[1]) {
        [range[1], range[3]] = [range[3], range[1]]
      }
      for (let i = range[0]; i <= range[2]; i++) {
        for (let j = range[1]; j <= range[3]; j++) {
          let celldom = hot.getCell(i, j), st = {}
          if (hot.getCellMeta(i, j).style) {
            let hotst = hot.getCellMeta(i, j).style
            st = JSON.parse(JSON.stringify(hotst))
            origArr.push({ ...hotst })
          }
          st['vertical-align'] = align
          hot.setCellMeta(i, j, 'style', st)
          if (!!celldom) {
            celldom.style["vertical-align"] = align
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
    HST.upHisData(history)
    HST.getCellStyle()
  },
  upHisData(data) {
    const mgt = store.state.ReportMgt
    if (mgt.historyIndex !== mgt.historyData.length - 1) {
      mgt.historyData.length = mgt.historyIndex
    }
    if (mgt.historyData.length >= 20) {
      mgt.historyData.shift()
    }
    mgt.historyData.push(data)
    mgt.historyIndex = mgt.historyData.length - 1
    mgt.historyType = ''
  },
  rowHeight() {
    store.state.ReportMgt.rowHeightSet = true;
    const mgt = store.state.ReportMgt,
      cells = mgt.hot.getSelected(),
      cur_row = cells[0][0];
    mgt.rowHeight = mgt.hot.getRowHeight(cur_row);
  },
  colWidth() {
    store.state.ReportMgt.colWidthSet = true;
    const mgt = store.state.ReportMgt,
      cells = mgt.hot.getSelected(),
      cur_col = cells[0][1]
    mgt.colWidth = mgt.hot.getColWidth(cur_col);
  },
  setRowHeight(height) {
    const mgt = store.state.ReportMgt,
      cells = mgt.hot.getSelected()

    let setRowHeightInstance = mgt.hot.getPlugin('ManualRowResize'),
      history = {
        type: 'resizeRowHeight',
        origVal: [],
        newVal: height
      }
    cells.map(cell => {
      if (cell[0] > cell[2]) {
        [cell[0], cell[2]] = [cell[2], cell[0]]
      }
      let [cur_row, , end] = cell,
        origArr = []
      for (let i = cur_row; i <= end; i++) {
        origArr.push(mgt.hot.getRowHeight(i))
        setRowHeightInstance.setManualSize(i, height);
      }
      history.origVal.push(origArr)
    })
    history.cells = cells
    HST.upHisData(history)

    setTimeout(function () {
      mgt.hot.render();
    }, 0);
    mgt.rowHeightSet = false;
  },
  setColWidth(width) {
    const mgt = store.state.ReportMgt,
      cells = mgt.hot.getSelected();

    let setColWidthInstance = mgt.hot.getPlugin('ManualColumnResize'),
      history = {
        type: 'resizeColWidth',
        origVal: [],
        newVal: width
      }
    cells.map(cell => {
      if (cell[1] > cell[3]) {
        [cell[3], cell[1]] = [cell[1], cell[3]]
      }
      let [, cur_col, , end] = cell, origArr = []
      for (let i = cur_col; i <= end; i++) {
        origArr.push(mgt.hot.getColWidth(i))
        setColWidthInstance.setManualSize(i, width);
      }
      history.origVal.push(origArr)
    })

    history.cells = cells
    HST.upHisData(history)
    setTimeout(function () {
      mgt.hot.render();
    }, 0);
    mgt.colWidthSet = false;
  },
  /* 添加,编辑批注 */
  commentsAddEdit() {
    const hot = store.state.ReportMgt.hot
    let comments = hot.getPlugin('Comments')
    let [r,c] = hot.getSelectedLast()
    if (!['edit','multiEdit'].includes(HST.commentsType)) {
      let history = {
        type: 'commentsAdd',
        cells: [r,c]
      }
      comments.setCommentAtCell(r,c, '')
      _PARAM.comment = {
        val: {value:''}, //,style:{height:90, width:215}
        cell: [r, c]
      }
      HST.upHisData(history)
    } else {
      _PARAM.comment = {
        val: hot.getCellMeta(r, c).comment,
        cell: [r, c]
      }
    }
    comments.showAtCell(r,c)
    document.querySelector('.htCommentTextArea').focus();
    setTimeout(() => {
      document.querySelector('.htComments').style.display = 'block'
      document.querySelector('.htCommentTextArea').focus();
    }, 500);
  },
  commentsRemove() {
    const hot = store.state.ReportMgt.hot
    let comments = hot.getPlugin('Comments')
    let cells = hot.getSelected()
    let index = HST.searchCurSheet().sheetIndex
    let htTable = document.querySelector(`#htTable${index}`)
    let cmsLen = htTable.querySelectorAll('.htCommentCell.highlight').length
    if(cmsLen === 0) {return }
    let history = {
      type: 'commentsRemove',
      cells: [],
      origVal: [],
      newVal: []
    }
    for (let cell of cells) {
      let [r1,c1,r2,c2] = cell
      if (r1 > r2) {
        [r1, r2] = [r2, r1]
      }
      if (c1 > c2) {
        [c1, c2] = [c2, c1]
      }
      for (let i = r1; i<= r2; i++) {
        for (let j  = c1; j<= c2; j++) {
          let comment = comments.getCommentAtCell(i, j)
          if (comment !== undefined) {
            history.cells.push([i, j])
            history.origVal.push(hot.getCellMeta(i, j).comment)
            comments.removeCommentAtCell(i, j)
            cmsLen--
          }
          if (cmsLen === 0) {
            break
          }
        }
        if (cmsLen === 0) {
          break
        }
      }
      if (cmsLen === 0) {
        break
      }
    }
    HST.upHisData(history)
  },
  //end

  /**单元格回显 */
  setCellMapping() {
    const mgt = store.state.ReportMgt
    let cells = mgt.hot.getSelectedRangeLast(), cellInput, cellText,
      cur_row = cells.highlight.row, cur_col = cells.highlight.col, row
    // 列转化为字母
    row = HST.numToChar(cur_col);
    //防止隐藏所有行列后点击空白处或左上角单元格报错
    cellInput = row + (cur_row + 1)
    if (cur_row === 50) {
      return;
    }
    cellText = mgt.hot.getSourceData(cur_row, cur_col, cur_row, cur_col)[0][0]
    const active = mgt.hot.getActiveEditor() || {}
    if (HST.formulasFlag || HST.mouseIn === 'input') {
      cellText = document.querySelector('#cellInput').value
      if (active.wait === false) {
        HST.formulasFlag = false
        HST.mouseIn = 'textarea'
        delete active.wait
      }
    }
    mgt.cellText = cellText
    mgt.cellInput = cellInput
  },
  /**sheet页切换单元格回显 */
  changeTabCellMapping() {
    const mgt = store.state.ReportMgt
    if(!mgt.hot.getSelected()){
      return;
    }
    let cells = mgt.hot.getSelected(),
      cur_row = cells[0][0],
      cur_col = cells[0][1],
      row = HST.numToChar(cur_col), cellInput = row + (cur_row + 1)
    mgt.cellInput = cellInput
    mgt.cellText = mgt.hot.getData(cur_row, cur_col, cur_row, cur_col)[0][0]
    HST.getCellStyle();
  },
  /**列转化为字母 */
  numToChar(cur_col) {
    let row1 = parseInt(cur_col), row2, row
    if (row1 > 25) {
      row2 = row1 % 26
      row1 = parseInt(row1 / 26) - 1
      row = String.fromCharCode(row1 + 65) + '' + String.fromCharCode(row2 + 65)
    } else {
      row = String.fromCharCode(row1 + 65)
    }
    return row;
  },
  /** 字母转化为数字 */
  charToNum(cur_char) {
    let array = cur_char.toLocaleUpperCase().split(''),
      num = array.length,
      result = 0
    array.forEach(val => {
      if (num == 1) {
        result += val.charCodeAt() - 65
      } else {
        result += (val.charCodeAt() - 64) * (26 * (num - 1))
      }
      num--
    })
    return result
  },
  /** 获取单元格样式 */
  getCellStyle() {
    const mgt = store.state.ReportMgt
    let cells = mgt.hot.getSelected(),
      i = cells[0][0], j = cells[0][1],
      style = mgt.hot.getCellMeta(i, j).style || []
    mgt.curCellStyle = {
      textAlign: style['text-align'] || 'left',
      verticalAlign: style['vertical-align'] || 'top',
      textDecoration: style['text-decoration'] || 'none',
      bold: style['font-weight'] || 'none',
      italic: style['font-style'] || 'none',
      fontFamily: style['font-family'] || '微软雅黑体',
      fontSize: style['font-size'] || '11',
      wrapCol: style['overflow-wrap'] || 'normal'
    }
  },
  /** 获取单元格合并与否 */
  getMergeCells() {
    const hot = store.state.ReportMgt.hot,
      cells = hot.getSelected(),
      mergeObj = hot.getPlugin("MergeCells"),
      mergedCells = (mergeObj.mergedCellsCollection || []).mergedCells//获取合并单元格
    store.state.ReportMgt.mergeCell = false
    mergedCells.map((cell) => {
      if (cell.row == cells[0][0] && cell.col == cells[0][1]) {
        store.state.ReportMgt.mergeCell = true
        return
      }
    })
  },
  /** 设置单元格内容 */
  setCellText() {
    let cells = store.state.ReportMgt.hot.getSelectedRangeLast(),
      row = cells.highlight.row, col = cells.highlight.col
    store.state.ReportMgt.hot.setDataAtCell(row, col, store.state.ReportMgt.cellText)
  },
  /** 填充区域 */
  setAreaData(row, col, data, rowEnd, colEnd, isNull) {
    const mgt = store.state.ReportMgt
    if (_PARAM.report.formula !== '0') {//isNull === 'isNull' ||
      data = data.slice(0, mgt.maxRows)
     /*  data = data.map(vals => {
        vals = vals.map(val => {
          if (!!val && val.trim() !== "" && !isNaN(val)) {
            val = parseFloat(val)
          }
          return val
        })
        return vals
      }) */
    }

    mgt.hot.populateFromArray(row, col, data, rowEnd, colEnd)
  },
  /** 合并单元格 */
  mergeCells(row, col, mergeList, rowEnd, colEnd) {
    const mgt = store.state.ReportMgt
    let newMergedCells = [],
      mergedCells = mgt.hot.getPlugin("MergeCells").mergedCellsCollection.mergedCells;
    mergedCells.forEach(mergedData => {
      if (mergedData.row + mergedData.rowspan - 1 < row || mergedData.row > rowEnd || mergedData.col + mergedData.colspan - 1 < col || mergedData.col > colEnd) {
        newMergedCells.push(mergedData)
      }
    })
    mergeList.forEach(data => {
      let mergedData = JSON.parse(data)
      mergedData.row += row
      mergedData.col += col
      if (mergedData.row <= mgt.maxRows - 1) {
        if (mergedData.row + mergedData.rowspan > mgt.maxRows) {
          mergedData.rowspan = mgt.maxRows - mergedData.row
        }
        newMergedCells.push(mergedData)
      }
    })
    if (newMergedCells.length === 0) {
      HST.isMerge = false
    } else {
      HST.isMerge = true
    }
    // return newMergedCells
    let settings = {
      mergeCells: newMergedCells
    }
    mgt.hot.updateSettings(settings)
  },
  /** 获取当前选中单元格所属区域 */
  getCellArea() {
    if (store.state.ReportMgt.asideSign) {
      return
    }
    const cells = store.state.ReportMgt.hot.getSelected(),
      row = cells[0][0], col = cells[0][1],
      curSheet = HST.searchCurSheet(),
      index = curSheet.index,
      ReportAttr = store.state.ReportAttr
    let sign = -1, newAreaName = '未定义';
    if (index != -1) {
      const areaInfo = [...store.state.ReportMgt.edcuiCompts[1].comptAttrs.tableList[index].area_info].reverse()
      areaInfo.some((info, i) => {
        let start_x = info.start_x,
          start_y = info.start_y,
          end_x = info.end_x,
          end_y = info.end_y
        if (start_x <= row && row <= end_x && start_y <= col && col <= end_y) {
          sign++
          if (ReportAttr.areaInfo.area_name != info.area_name) {
            ReportAttr.areaInfo = { area_name: info.area_name, area_id: info.area_id, sheet_index: curSheet.sheetIndex }
          }
          ReportAttr.updataSign++
          newAreaName = ReportAttr.areaInfo.area_name
          return true
        }
      })
    }
    if (sign == -1 && newAreaName == '未定义' && !!ReportAttr.areaInfo.area_name && newAreaName != ReportAttr.areaInfo.area_name) {
      ReportAttr.areaInfo = [];
      ReportAttr.tableCols = [];
      ReportAttr.filterData = [];
      ReportAttr.updataSign++
    }
  },
  /** 获取当前所处sheet页位置 */
  searchCurSheet() {
    const arr = store.state.ReportMgt.edcuiCompts[1].comptAttrs.tableList
    let cur_sheet_name = ''
    try {
      cur_sheet_name = document.querySelector(".el-tabs__item.is-active").innerText.trim()
    } catch (e) { }
    let sheetArray = { index: 0, sheetIndex: 1, sheetId: '' }
    arr.some((res, index) => {
      if (res.sheet_name == cur_sheet_name) {
        sheetArray = {
          index: index,
          sheetIndex: res.sheet_index,
          sheetId: res.sheet_id || '',
          sheetName: cur_sheet_name
        }
        return true
      }
    })
    return sheetArray
  },
  /** 获取当前所处区域 */
  searchCurArea(index) {
    const arr = store.state.ReportMgt.edcuiCompts[1].comptAttrs.tableList[index].area_info,
      area_name = store.state.ReportAttr.areaInfo.area_name
    let sign = -1
    arr.map((res, i) => {
      if (res.area_name == area_name) {
        sign = i
      }
    })
    return sign
  },
  /** 清空某区域数据 */
  resetCellsData(cells) {
    let row, col, rowEnd, colEnd, data
    const mgt = store.state.ReportMgt

    data = mgt.hot.getSourceData()
    cells.map(item => {
      let [r, c, r2, c2] = item
      for (let i = r; i <= r2; i++) {
        for (let j = c; j <= c2; j++) {
          if (data[i] && data[i][j] !== null) {
            data[i][j] = null
          }
        }
      }
      // return
    })

    //清空合并样式
    let mergedCells = mgt.hot.getPlugin("MergeCells").mergedCellsCollection.mergedCells;
    let newMergedCells = [];
    mergedCells.forEach(mergedData => {
      cells.map(item => {
        [row, col, rowEnd, colEnd] = item
        if (mergedData.row + mergedData.rowspan - 1 < row || mergedData.row > rowEnd ||
          mergedData.col + mergedData.colspan - 1 < col || mergedData.col > colEnd
        ) {
          newMergedCells.push(mergedData)
        }
        return item
      })

    })
    let settings = {
      mergeCells: newMergedCells,
      // data: data
    }
    mgt.hot.updateSettings(settings)
    HST.cellOnClass()
    mgt.hot.getPlugin('formulas').recalculateFull()
  },
  /** 复制,剪切 */
  copyEvent(sign) {
    const mgt = store.state.ReportMgt,
      cell = mgt.hot.getSelectedLast(),
      active = mgt.hot.getActiveEditor()

    if (cell[2] < cell[0]) {
      [cell[0], cell[2]] = [cell[2], cell[0]];
    }
    if (cell[3] < cell[1]) {
      [cell[1], cell[3]] = [cell[3], cell[1]];
    }

    let index = HST.searchCurSheet().sheetIndex,
      htTable = document.querySelector(`#htTable${index}`),
      hidden = htTable.querySelector('.ht_editor_hidden'),
      zIndex = htTable.querySelector('.handsontableInputHolder').style['z-index']
    if (zIndex != -1 && !!!hidden) {
      let start = active.TEXTAREA.selectionStart,
        end = active.TEXTAREA.selectionEnd,
        val = active.TEXTAREA.value.substring(start, end)
      mgt.copyText = val
      mgt.copySourceText = {}
      mgt.copyStyle = {}
      return
    }

    //防止出现无法粘贴现象
    if (active.state !== 'STATE_EDITING') {
      active._fullEditMode = false
      active._opened = false
    }

    // mgt.copyText = mgt.hot.getCopyableText(cell[0], cell[1], cell[2], cell[3])
    let [c0, c1, c2, c3] = cell
    mgt.copyText = mgt.hot.getData(c0, c1, c2, c3)
    _PARAM.copyableText = [mgt.hot.getCopyableText(c0, c1, c2, c3).split('	')]
    let rowData = [], data = []
    if (typeof mgt.copyText !== 'object') {
      rowData = mgt.copyText.split('\n')
      rowData.forEach((r, i) => {
        const rarray = r.split('	')
        data.push(rarray)
      })
      mgt.copyText = data
    }
    mgt.copySourceText = mgt.hot.getSourceData(c0, c1, c2, c3)
    //判断复制内容是否有公式
    if (_PARAM.report.formula !== '0') {
      let flag = mgt.copySourceText.some(stext => {
        return (stext.some(val => {
          return !!val && val.toString().indexOf('=') == 0 && val.length > 1
        }))
      })
      if (!flag) {
        mgt.copySourceText = []
      }
    }
    let clipboard = new Clipboard("#text-copy")
    clipboard.on("success", e => {
      clipboard.destroy();
    });
    clipboard.on("error", e => {
      // 不支持复制
      Message({
        message: "该浏览器不支持自动复制",
        type: "warning"
      });
      clipboard.destroy();
    });

    mgt.copyStyle = HST.getCellStyleMerge('comment')//获取样式
    mgt.copyStyle.cut = sign
    mgt.cutCell = cell
    if (sign) {//剪切
      let history = {
        type: 'cut',
        cells: [cell],
        data: {
          newVal: [],
          origVal: [mgt.hot.getSourceData(c0, c1, c2, c3)]
        },
        styleObj: {
          origVal: [(mgt.copyStyle.styleList).reduce((cur,next)=>[...cur,...next], [])],
          newVal: []
        },
        mergeObj: {
          origCell: [],
          newCell: []
        },
        commentObj: mgt.copyStyle.commentsList
      }
      mgt.cutCell = cell
      if (mgt.cutCell.length > 0) {
        let range = mgt.cutCell//, origArr = [], newArr = []
        HST.resetCellsData([range])
        for (let i = c0 - 1; i <= c2; i++) {
          for (let j = c1 - 1; j <= c3; j++) {
            let celldom = mgt.hot.getCell(i, j),
              cs = mgt.hot.getCellMeta(i, j).style,
              cstyle = {}
            if (i === c0 - 1 && j === c1 - 1) {
              cstyle = { ...cs }
            } else if (i === c0 - 1) {
              cstyle = { ...cs }
              let keys = Object.keys(cstyle)
              if (keys.length == 1 && keys.indexOf('border-bottom') > -1) {
                celldom.style['borderBottom'] = ''
              }
              delete cstyle['border-bottom']
            } else if (j === c1 - 1) {
              cstyle = { ...cs }
              let keys = Object.keys(cstyle)
              if (keys.length == 1 && keys.indexOf('border-right') > -1) {
                celldom.style['borderRight'] = ''
              }
              delete cstyle['border-right']
            } else {
              // const keys = Object.keys(celldom.style)
              // keys.forEach(k => {
              //   delete celldom.style[k]
              // })
              celldom.setAttribute('style', '')
            }
            mgt.hot.setCellMeta(i, j, 'style', cstyle);
            mgt.hot.getCell(i, j, 'style', cstyle);
            // origArr.push(cstyle || {})
          }
        }
        HST.getCellStyle();
        //取消合并单元格
        let mergeObj = mgt.hot.getPlugin("MergeCells");
        mgt.copyStyle.mergeCell.forEach(val => {
          let startRow = c0 + val[0],
            startColumn = c1 + val[1],
            endRow = startRow + val[2] - 1,
            endColumn = startColumn + val[3] - 1
          mergeObj.unmerge(startRow, startColumn, endRow, endColumn)
          history.mergeObj.origCell.push([startRow, startColumn, endRow, endColumn])
        })
        const cellCondFormat = _PARAM.report.cellCondFormat !== '0'
        if (cellCondFormat) {
          let condiRuleArr = JSON.parse(JSON.stringify((mgt.condiRuleList[`sheet${index}`] || [])))
          HST.ruleCellReBuild([cell])
          HST.condiRuleClass({type:'edit',data: condiRuleArr})
          let newVal = JSON.parse(JSON.stringify((mgt.condiRuleList[`sheet${index}`] || [])))
          history.ruleObj ={ origVal: condiRuleArr, newVal, sheet: index }
        }

        HST.upHisData(history)
      }
      if (mgt.copyStyle.commentsList && mgt.copyStyle.commentsList.cells.length > 0) {
        let comments = mgt.hot.getPlugin('Comments')
				mgt.copyStyle.commentsList.cells.forEach(val => {
					let [i, j] = val
					comments.removeCommentAtCell(i, j)
				})
      }
    }
  },
  /** 粘贴 */
  pasteEvent(sign) {
    HST.redoUndoClick = true
    const mgt = store.state.ReportMgt
    let pasteValid = true,
      rowData = [], data = [], endrow = 0, endcol = 0, copyData = mgt.copyText
    if ((sign === undefined || sign === "false" || sign === 'formulas') && mgt.copySourceText.length !== 0) {
      copyData = mgt.copySourceText
    }
    if (typeof copyData !== 'object') {
      rowData = copyData.split('\n')
      endrow = rowData.length - 1
      rowData.forEach((r, i) => {
        const rarray = r.split('	')
        data.push(rarray)
        endcol = rarray.length - 1
      })
    } else {
      copyData.forEach(val => {
        data.push([...val])
      })
      endrow = data.length - 1
      endcol = data[0].length - 1
    }

    const cells = mgt.hot.getSelected(),
      endR = endrow, endC = endcol
    let merge_list = [], list = []
    if (mgt.hot.getPlugin('MergeCells').mergedCellsCollection !== null) {
      merge_list = mgt.hot.getPlugin('MergeCells').mergedCellsCollection.mergedCells;
    }
    let flag = cells.every(cell => {
      if (cell[2] < cell[0]) {
        [cell[0], cell[2]] = [cell[2], cell[0]];
      }
      if (cell[3] < cell[1]) {
        [cell[1], cell[3]] = [cell[3], cell[1]];
      }

      const [c0, c1, c2, c3] = cell
      let rlen = c2 - c0 + 1, clen = c3 - c1 + 1,
        id = document.querySelector('.el-tabs__nav.is-bottom').querySelector('.is-active').getAttribute('aria-controls'),
        htElement = document.querySelector(`#${id}`),
        result = true

      if (htElement.querySelector('.ht_clone_top').querySelector('.ht__active_highlight') === null && htElement.querySelector('.ht_clone_left').querySelector('.ht__active_highlight') === null) {
        if (rlen === clen && clen !== 1) {
          result = !!rlen && rlen % (endrow + 1) === 0 && clen % (endcol + 1) === 0
        }
      }
      if (!result) {
        Message.warning(`无法粘贴信息，原因是复制区域与粘贴区域形状不同。`)
      }
      /** 判断欲粘贴区域是否存在合并单元格 */
      merge_list.forEach(val => {
        const rowEnd = val.row + val.rowspan - 1,
          colEnd = val.col + val.colspan - 1
        if (((val.row >= c0 && val.row <= c0 + endrow) || (rowEnd >= c0 && rowEnd <= c0 + endrow)) && ((val.col >= c1 && val.col <= c1 + endcol) || (colEnd >= c1 && colEnd <= c1 + endcol))) {
          const beginrow = val.row - c0, beigincol = val.col - c1,
            temp = [beginrow, beigincol, val.rowspan, val.colspan]
          list.push(temp)
        }
      })
      if (list.length > 0 && JSON.stringify(list) != JSON.stringify(mgt.copyStyle.mergeCell)) {
        Message.warning(`不能对合并单元格作部分修改`)
        pasteValid = false
      }
      return pasteValid && result
    })
    if (!flag) {
      return
    }
    let history = {
      type: 'paste',
      cells: [],
      data: {
        newVal: [],
        origVal: []
      },
      styleObj: {
        origVal: [],
        newVal: []
      },
      mergeObj: {
        origCell: list,
        newCell: []
      },
      numFormatObj: {}
    }
    const sheet = HST.searchCurSheet().sheetIndex
    let condiRuleArr =  JSON.parse(JSON.stringify(mgt.condiRuleList[`sheet${sheet}`] || []))
    let commentObj = { newVal:[], origVal:[], origCells: [], newCells: [] }
    // let ruleObj = { newVal: [], origVal: condiRuleArr, origCells: [], newCells: [] }
    // let pasteCells = []
    cells.forEach(cell => {
      let [c0, c1] = cell
      list.forEach(val => {
        let startRow = c0 + val[0],
          startColumn = c1 + val[1],
          endRow = startRow + val[2] - 1,
          endColumn = startColumn + val[3] - 1
        history.mergeObj.origCell.push([startRow, startColumn, endRow, endColumn])
      })
    })
    const styleList = mgt.copyStyle.styleList,
      numFmList = mgt.copyStyle.numFmList,
      index = HST.searchCurSheet().index,
      numFormat = mgt.edcuiCompts[1].comptAttrs.tableList[index]['numericFormat'] || [],
      commentsList = mgt.copyStyle.commentsList || [],
      ruleList = mgt.copyStyle.ruleList || []
    history.numFormatObj.origVal = [...numFormat]
    let newRuleCell = []
    let newCells = []
    const reg = /(allRed|allYellow|allGreen|redBg|redText)(\d)/g
    cells.forEach(cell => {
      newRuleCell.unshift({})
      const [c0, c1, c2, c3] = cell
      let rlen = c2 - c0 + 1, clen = c3 - c1 + 1,
        id = document.querySelector('.el-tabs__nav.is-bottom').querySelector('.is-active').getAttribute('aria-controls'),
        htElement = document.querySelector(`#${id}`)

      if (htElement.querySelector('.ht_clone_top').querySelector('.ht__active_highlight') === null && htElement.querySelector('.ht_clone_left').querySelector('.ht__active_highlight') === null) {
        !!rlen && rlen % (endR + 1) === 0 ? endrow = rlen - 1 : '';
        !!clen && clen % (endC + 1) === 0 ? endcol = clen - 1 : ''
      }
      // pasteCells.push([c0, c1, c0 + endrow, c1 + endcol])
      if (pasteValid) {
        if (sign === undefined || sign === "false" || sign === "style") {
          /** 设置样式 */
          let mergeObj = mgt.hot.getPlugin("MergeCells");
          (mgt.copyStyle.mergeCell || []).forEach(val => {
            let startRow = c0 + val[0],
              startColumn = c1 + val[1],
              endRow = startRow + val[2] - 1,
              endColumn = startColumn + val[3] - 1
            mergeObj.merge(startRow, startColumn, endRow, endColumn)
            history.mergeObj.newCell.push([startRow, startColumn, endRow, endColumn])
          })

          if (!!styleList && styleList.length > 0) {
            let x = 0, y = 0, xlen = styleList.length, ylen = styleList[0].length,
              origArr = [], newArr = []
            for (let i = c0 - 1; i <= c0 + endrow; i++) {
              y = 0
              for (let j = c1 - 1; j <= c1 + endcol; j++) {
                let celldom = mgt.hot.getCell(i, j),
                  oldStyle = mgt.hot.getCellMeta(i, j).style,
                  cstyle = { ...styleList[x][y] },
                  sign = true
                origArr.push(oldStyle || {})
                newArr.push({ ...oldStyle, ...cstyle })

                if (i === c0 - 1 && j === c1 - 1) {
                  sign = false
                } else if (i === c0 - 1 || j === c1 - 1) {
                  cstyle = { ...oldStyle, ...cstyle }
                  // } else if (j === c1 - 1) {
                  //   cstyle = { ...oldStyle, ...cstyle }
                } else {
                  if(mgt.hot.getCellMeta(i, j).comment && mgt.hot.getPlugin('Comments').getCommentAtCell(i, j) !== '') {
                    commentObj.origCells.push([i, j])
                    commentObj.origVal.push(mgt.hot.getCellMeta(i, j).comment)
                    mgt.hot.getPlugin('Comments').removeCommentAtCell(i, j)
                  }
                }
                if (sign) {
                  mgt.hot.setCellMeta(i, j, 'style', cstyle)
                  if (!!celldom) {
                    const ks = Object.keys(cstyle)
                    ks.forEach(val => {
                      celldom.style[val] = cstyle[val]
                    })
                  }
                }
                //刷 数据样式
                if (i !== c0 - 1 && j !== c1 - 1) {
                  let temp = numFmList[x][y]
                  if (temp.length === 0) {
                    temp = {
                      patten: "",
                      type: "numeric"
                    }
                  }
                  numFormat.push({ cells: [i, j, i, j], ...temp })
                }

                y = y === ylen - 1 ? 1 : y + 1
              }
              x = x === xlen - 1 ? 1 : x + 1
            }
            history.numFormatObj.newVal = [...numFormat]
            history.styleObj.origVal.push(origArr)
            history.styleObj.newVal.push(newArr)
            HST.numFormatSetting(numFormat)
            HST.getCellStyle();
          }
          // 设置批注
          if (commentsList.cells && commentsList.cells.length > 0) {
            for(let item of Object.entries(commentsList.cells)) {
              let [cellIndex, [row, col]] = item
              let val = commentsList.origVal[cellIndex]
              let [iRow, iCol] = commentsList.origCell
              let [nRow, nCol] = [c0 + row - iRow, c1 + col - iCol]
              let comments = mgt.hot.getPlugin('Comments')

              comments.setCommentAtCell(nRow, nCol, val.value)
              comments.updateCommentMeta(nRow, nCol, val)

              commentObj.newCells.push([nRow, nCol])
              commentObj.newVal.push(mgt.hot.getCellMeta(nRow, nCol).comment)
            }
          }
          // 设置条件规则
          if (ruleList.cells && ruleList.cells.length > 0) {
            for(let item of Object.entries(ruleList.cells)) {
              let [cellIndex, [row, col]] = item
              let origVal = ruleList.origVal[cellIndex] || []
              let [iRow, iCol] = ruleList.origCell
              let [nRow, nCol] = [c0 + row - iRow, c1 + col - iCol]
              for (let val of origVal) {
                val = val.replace(reg, ($, $0, $1) => {
                  return `rule${$1}`
                })
                if (newRuleCell[0][val]) {
                  let last = newRuleCell[0][val].length - 1
                  let [r0, r1, r2, r3] = newRuleCell[0][val][last]
                  // if (r0 === nRow && r1 + 1 === nCol) {
                  if ((r1 === r3 && nCol === r1 && r2 + 1 === nRow) || (r0 === r2 && nCol === r3 + 1 && r2 === nRow)) {
                    newRuleCell[0][val][last] = [r0, r1, nRow, nCol]
                  } else {
                    newRuleCell[0][val].push([nRow, nCol, nRow, nCol])
                  }
                } else {
                  newRuleCell[0][val] = [[nRow, nCol, nRow, nCol]]
                }
              }
            }
          }
        }
        /**end */
        if (sign !== 'style') {
          if (!mgt.copyStyle.cut) {
            const showFormula = _PARAM.report.formula !== '0'
            data.forEach((val, index) => {
              val.forEach((sub_val, sub_index) => {
                if (showFormula && !!sub_val && sub_val.toString().indexOf("=") === 0 && sub_val.length > 1) {
                  let xshift = c0 - mgt.cutCell[0] || 0,
                    yshift = c1 - mgt.cutCell[1] || 0,
                    newVal = sub_val,
                    flag = false

                  newVal = newVal.replace(/(\$?[A-Za-z]+\$?[0-9]+)/g, function (match) {
                    let col = match.replace(/\$?[0-9]+/, '').toLocaleUpperCase(),
                      reg = /\$?[0-9]+$/,
                      row = reg.exec(match)[0],
                      newCol = col, tempCol
                    if (! /^\W/.test(row)) {
                      row = parseFloat(row) + parseFloat(xshift)
                    }
                    if (! /^\W/.test(col)) {
                      newCol = HST.numToChar(HST.charToNum(col) + yshift)
                    }
                    tempCol = newCol.replace(/\W/g, '')
                    if (tempCol == '' || tempCol.charCodeAt() < 65 || row.toString().replace(/\$/g, '') <= 0) {
                      flag = true
                    } else {
                      match = newCol + row
                    }
                    return match
                  })
                  if (flag) {
                    if (sub_val.toString().indexOf('(') > -1) {
                      sub_val = sub_val.split('(')[0] + '(#REF!)'
                    } else {
                      sub_val = '#REF!'
                    }
                  } else {
                    sub_val = newVal
                  }
                  data[index][sub_index] = sub_val
                }
              })
            })
          }
          if (c0 + endrow >= mgt.hot.countRows()) {
            mgt.hot.alter("insert_row", mgt.hot.countRows() - 1, endrow + 5)
          }
          if (c1 + endcol >= mgt.hot.countCols()) {
            mgt.hot.alter("insert_col", mgt.hot.countCols() - 1, endcol + 5)
          }
          history.data.newVal.push(data)
          history.data.origVal.push(mgt.hot.getSourceData(c0, c1, c0 + endrow, c1 + endcol))
          history.cells.push([c0, c1, c0 + endrow, c1 + endcol])
          mgt.hot.populateFromArray(c0, c1, data, c0 + endrow, c1 + endcol)
        }
        mgt.hot.selectCell(c0, c1, c0 + endrow, c1 + endcol)
        newCells.push([c0, c1, c0 + endrow, c1 + endcol])
      }
    })
    if (mgt.copyStyle.cut === true) {
      mgt.copyStyle = { cut: true }
    }
    if (commentObj.origCells.length + commentObj.newCells.length > 0) {
      commentObj.type = 'paste'
      history.commentObj = commentObj
    }
    let pasteType = 'copy'
    const oldSheet = mgt.copyStyle.sheet
    if (mgt.copyStyle.cut === true) {
      pasteType = 'cut'
    }
    // 粘贴区域删除旧规则，增加新规则
    if (_PARAM.report.cellCondFormat !== '0') {
      HST.ruleCellReBuild(newCells)
      HST.ruleCellAdd(newRuleCell, pasteType, oldSheet)

      let newVal = JSON.parse(JSON.stringify(mgt.condiRuleList[`sheet${sheet}`] || []))
      let ruleObj = {
        newVal,
        origVal: condiRuleArr,
        sheet
      }
      history.ruleObj = ruleObj
    }
    HST.upHisData(history)
  },
  /** 格式刷 */
  formaterPainter(sign) {
    const mgt = store.state.ReportMgt
    const style = HST.getCellStyleMerge()
    mgt.formatPainter = style
    mgt.formatPainter.multi = sign
    mgt.formatPainter.sign = true
  },
  fmPainerEvent() {
    const mgt = store.state.ReportMgt,
      cell = (mgt.hot.getSelected())[0],
      oldCell = mgt.formatPainter.cell,
      endrow = oldCell[2] - oldCell[0] + 1,
      endcol = oldCell[3] - oldCell[1] + 1

    if (cell[0] > cell[2]) {
      [cell[0], cell[2]] = [cell[2], cell[0]]
    }
    if (cell[1] > cell[3]) {
      [cell[1], cell[3]] = [cell[3], cell[1]]
    }
    if (cell[0] === cell[2] && cell[1] === cell[3]) {
      cell[2] = cell[0] + endrow - 1
      cell[3] = cell[1] + endcol - 1
    }
    if (mgt.fmPainter === false) {
      return
    }

    let [c0, c1, c2, c3] = cell
    // mgt.hot.selectCell(c0, c1, c2, c3)
    let param = {
      ...mgt.formatPainter,
      newCell: cell,
      oldCell
    }
    let stylus = {}
    HST.fillStylus(param, 'fmPainer').then(sty => {
      stylus = sty
      let history = {
        ...stylus,
        // fmMergeObj,
        type: 'fmPainer',
        cells: [[c0 - 1, c1 - 1, c2, c3]]
      }
      HST.upHisData(history)
      mgt.formatPainter.sign = true
      if (mgt.formatPainter.multi != true) {
        mgt.fmPainter = false
      }
    })
  },
  /**
   * 获取选中区域样式及合并单元格, 批注
   * type : comment 需要获取批注，---复制和剪切时
   * cell: 传入选中单元格---右下角加号时使用
   * */
  getCellStyleMerge(type, cell) {
    const mgt = store.state.ReportMgt
    let reg = /(allRed|allYellow|allGreen|redBg|redText|redBorder|rule)(\d)/
    let style = {}
    if (cell === undefined) {
      cell = mgt.hot.getSelectedLast()
    }
    if (cell[2] < cell[0]) {
      [cell[0], cell[2]] = [cell[2], cell[0]];
    }
    if (cell[3] < cell[1]) {
      [cell[1], cell[3]] = [cell[3], cell[1]];
    }
    style.cell = cell
    if (mgt.hot.getPlugin('MergeCells').mergedCellsCollection !== null) {
      let merge_list = mgt.hot.getPlugin('MergeCells').mergedCellsCollection.mergedCells;//获取合并项目
      let mergeCell = []
      merge_list.forEach(val => {
        if (val.row >= cell[0] && val.row <= cell[2] && val.col <= cell[3] && val.col >= cell[1]) {
          const beginrow = val.row - cell[0], beigincol = val.col - cell[1]
          const temp = [beginrow, beigincol, val.rowspan, val.colspan]
          mergeCell.push(temp)
        }
      })
      style.mergeCell = mergeCell
    }
    let styleList = []
    let numFmList = []
    let commentsList = {cells: [],origVal: [],newVal: []}
    let ruleList = {cells: [],origVal: [],newVal: []}
    for (let row = cell[0] - 1; row <= cell[2]; row++) {
      let colStyle = [], colNumFm = []
      for (let col = cell[1] - 1; col <= cell[3]; col++) {
        let cell1 = mgt.hot.getCellMeta(row, col);
        if (cell1.style != undefined) {
          let cstyle = { ...cell1.style }
          if (row === cell[0] - 1 && col === cell[1] - 1) {
            cstyle = {}
          } else if (row === cell[0] - 1) {
            cstyle = {}
            if (!!cell1.style['border-bottom']) {
              cstyle['border-bottom'] = cell1.style['border-bottom']
            }
          } else if (col === cell[1] - 1) {
            cstyle = {}
            if (!!cell1.style['border-right']) {
              cstyle['border-right'] = cell1.style['border-right']
            }
          }
          colStyle.push(cstyle);
        } else {
          colStyle.push([])
        }
        /* 设置批注、条件规则 */
        if (row > cell[0] - 1 && col > cell[1] - 1) {
          if (type === 'comment' && cell1.comment) {
            commentsList.cells.push([row, col])
            commentsList.origVal.push(cell1.comment)
          }
          let cellTd = mgt.hot.getCell(row, col) || {}
          let classList = []
          if(cellTd.classList) {
            classList = [ ...cellTd.classList]
          }
          let clazz = classList.filter(clazz => reg.test(clazz))
          if (clazz.length > 0) {
            ruleList.cells.push([row, col])
            ruleList.origVal.push(clazz)
          }
        }
        if (cell1.numericFormat && cell1.numericFormat.pattern != '') {
          colNumFm.push({ type: cell1.type, patten: cell1.numericFormat.pattern })
        } else {
          colNumFm.push([])
        }
      }
      styleList.push(colStyle)
      numFmList.push(colNumFm)
      // commentsList.push(colComment)
    }
    style.styleList = styleList
    style.numFmList = numFmList
    if (commentsList.cells.length > 0) {
      commentsList.type = 'cut'
      commentsList.origCell = [cell[0], cell[1]]
      style.commentsList = commentsList
    }
    if (ruleList.cells.length > 0) {
      ruleList.origCell = cell
      style.ruleList = ruleList
    }
    style.sheet = HST.searchCurSheet().sheetIndex
    return style
  },
  /** 区域管理 */
  areaShade(bool) {
    if ((store.state.HomeBody.pageCache || '').operation != 'design') {
      return {}
    }
    const mgt = store.state.ReportMgt
    if (mgt.asideSign || bool) {
      //展示区域阴影
      const index = HST.searchCurSheet().index
      const areaInfo = mgt.edcuiCompts[1].comptAttrs.tableList[index].area_info
      let repeatArray = {}, cellList = {}
      let areaBgObj = {}//, areaStartSite = []
      // if (!!mgt.hot.getPlugin('Comments').range.from) {
      //   mgt.hot.getPlugin('Comments').removeComment()
      // }
      areaInfo.forEach(val => {
        const r = val.start_x, c = val.start_y, r2 = val.end_x, c2 = val.end_y
        if (!!val.cellList && val.cellList.length > 0) {
          cellList[`${val.area_id}&${val.area_id}`] = val.cellList
        }
        for (let i = r; i <= r2; i++) {
          for (let j = c; j <= c2; j++) {
            if (i === r && j === c) {
              mgt.hot.getPlugin('Comments').setCommentAtCell(i, j, val.area_name)
            }
            if (!!areaBgObj[`${i},${j}`]) {
              let bobj = areaBgObj[`${i},${j}`].split(' ')
              bobj = bobj.filter(val => val && val.trim() && val.search('beat') === -1)
              let num = bobj.length
              let reg = /(beat\-(a[0-9])+)/ig
              areaBgObj[`${i},${j}`].replace(reg, '$2')
              let k = RegExp.$2
              if (!!repeatArray[k]) {
                repeatArray[k].push(`${i},${j}`)
              } else {
                repeatArray[k] = [`${i},${j}`]
              }

              areaBgObj[`${i},${j}`] += ` abg-${num} beat-${val.area_id}`
            } else {
              areaBgObj[`${i},${j}`] = ` abg beat-${val.area_id}`
            }
          }
        }
      })
      let ks = Object.keys(repeatArray)
      let list = {}
      ks.forEach(val => {
        let cell = cellList[`${val}&${val}`] || []
        cell.forEach(val2 => {
          val2 = JSON.parse(val2)
          let r = parseInt(val2.row), c = parseInt(val2.col), rs = parseInt(val2.rowspan), cs = parseInt(val2.colspan)
          for (let i = 0; i < cs; i++) {
            for (let j = 0; j < rs; j++) {
              let cl = `${r + j},${c + i}`
              list[val] = list[val] || []
              if (repeatArray[val].indexOf(cl) > -1) {
                list[val].push(cl)
              }
            }
          }
        })
      })
      HST.commentAdd()
      return areaBgObj
    }
  },
  /** 区域管理-添加标注 */
  commentAdd() {
    let areaStartSite = []
    let mgt = store.state.ReportMgt
    if (mgt.asideSign) {
      const index = HST.searchCurSheet().index
      const areaInfo = mgt.edcuiCompts[1].comptAttrs.tableList[index].area_info
      areaInfo.forEach(val => {
        const r = val.start_x, c = val.start_y
        areaStartSite.push({ r: r, c: c, comment: val.area_name })
      })

      let curTabs = mgt.editableTabs,
        title = HST.searchCurSheet().sheetName, name = ''
      curTabs.some(val => {
        if (val.title === title) {
          name = val.name
          return true
        }
      })
      const obj = document.getElementById(`htTable${name}`)
      // if (!!window.top.document.querySelector('.htCommentsContainer')) {
      //   window.top.document.querySelector('.htCommentsContainer').remove()
      // }
      if (obj && !!obj.querySelector(".wtHider") && !!!obj.querySelector(".CommentsContain")) {
        let para = document.createElement('div')
        para.className = 'CommentsContain'
        obj.querySelector(".wtHider").appendChild(para)
      }
      let objLen = obj.getElementsByClassName('comment-item').length
      if (objLen > 0) {
        for (let i = 0; i < objLen; i++) {
          obj.querySelector(".CommentsContain").removeChild(obj.getElementsByClassName('comment-item')[i])
          objLen--
          i--
        }
      }
      areaStartSite.forEach(site => {
        let element
        if (!!mgt.hot.getCell(site.r, site.c)) {
          element = mgt.hot.getCell(site.r, site.c)
          const left = element.offsetLeft + element.offsetWidth,
            top = element.offsetTop - element.offsetHeight / element.rowSpan - 8
          let parenttop = parseFloat((obj.querySelector('.wtSpreader').style.top || '0').replace(/[a-z]/ig, ''))
          let parentleft = parseFloat((obj.querySelector('.wtSpreader').style.left || '0').replace(/[a-z]/ig, ''))

          // let style = `left:${left + parentleft}px;top:${top + parenttop}px`
          let para = document.createElement('div')
          let node = ''
          try {
            let value = site.comment
            node = document.createTextNode(value)
            para.appendChild(node)
            // ie style 不能直接赋值。。
            para.style.left = `${left + parentleft}px`
            para.style.top = `${top + parenttop}px`
            // para.style = style
            // para.setAttribute('style', style)

            para.className = `comment-item comment-item${site.r}.${site.c}`
            obj.querySelector(".CommentsContain").appendChild(para)
          } catch (e) { }
        }

      })
    }
  },
  /* 区域管理-删除标注 */
  removeAreaComments() {
    const mgt = store.state.ReportMgt
    const index = HST.searchCurSheet().index
    const areaInfo = mgt.edcuiCompts[1].comptAttrs.tableList[index].area_info
    areaInfo.forEach(val => {
      const {start_x, start_y} = val
      mgt.hot.getPlugin('Comments').removeCommentAtCell(start_x, start_y)
    })
  },
  /** 需添加class单元格 */
  cellOnClass(curName, flag) {
    let repeatArr = HST.areaRepeat(), areaBgObjs = {}, bgObj = {}, cells = [], totalStyleObj = {}

    const index = HST.searchCurSheet().index,
      mgt = store.state.ReportMgt
    let areaInfo = [...mgt.edcuiCompts[1].comptAttrs.tableList[index].area_info],
      len = areaInfo.length - 1,
      areaSite = []//区域起始位置

    if (curName != undefined) {//非全部刷新
      if (HST._areaList.index == index) {
        let l = HST._areaList.areaInfo.length,
          info = HST._areaList.areaInfo
        if (l < areaInfo.length) {
          areaInfo.forEach((val, vi) => {
            let flag = -1
            info.forEach((inf, i) => {
              if (val.area_id == inf.area_id) {
                info[i] = val
                flag = i
              }
            })
            if (flag == -1) {
              info.push(val)
            }
          })
        } else {
          for (let i = 0; i < info.length; i++) {
            let inf = info[i]
            let flag = -1
            areaInfo.forEach((val, vi) => {
              if (val.area_id == inf.area_id) {
                info[i] = val
                flag = i
              }
            })
            if (flag == -1) {
              info.splice(i, 1)
              i--
            }
          }
        }
        areaInfo = info
        HST._areaList.areaInfo = info
      } else {
        HST._areaList.index = index
        HST._areaList.areaInfo = areaInfo
      }

    } else {
      HST._areaList.index = index
      HST._areaList.areaInfo = areaInfo
    }
    areaInfo.some((val, ai) => {
      if (val.area_name == curName && ai != len) {
        areaInfo.push(...areaInfo.splice(ai, 1));
        return true
      }
    })
    /** 区域管理 各区域样式 */
    if (mgt.asideSign) {
      bgObj = HST.areaShade()
    }
    /** end */

    /** 小计合计样式,区域边框 */
    const dataBorder = store.state.commonProperties.report.dataBorder !== '0'
    areaInfo.forEach(val => {
      areaSite[`${val.area_name}`] = { start_x: val.start_x, start_y: val.start_y, end_x: val.end_x, end_y: val.end_y }
      let areaBgObj = {}
      const r = val.start_x, c = val.start_y, r2 = val.end_x, c2 = val.end_y, mgt = store.state.ReportMgt
      //区域边框
      if (dataBorder && val.needBorder) {
        for (let i = r - 1; i <= r2; i++) {
          if (i > mgt.maxRows) {
            break
          }
          for (let j = c - 1; j <= c2; j++) {
            if (j > mgt.maxCols) {
              break
            }
            if (i == r - 1 && j == c - 1) {
              continue
            } else if (i == r - 1) {
              areaBgObj[`${i},${j}`] = `b-bottom `
            } else if (j == c - 1) {
              areaBgObj[`${i},${j}`] = `b-right `
            } else {
              areaBgObj[`${i},${j}`] = `b-right b-bottom `
            }
          }
        }
      }
      if (!!val.cellList && val.cellList.length > 0) {
        val.cellList.forEach(val2 => {
          val2 = JSON.parse(val2)
          let style = val.subStyleList
          let clazz = `align-${style['align'] || 'align-center'} w-${style['weight'] || 'w-bold'} `
          for (let i = val2.row + r; i < val2.row + r + val2.rowspan; i++) {
            if (i > mgt.maxRows) {
              break
            }
            for (let j = val2.col + c; j < val2.col + c + val2.colspan; j++) {
              if (j > mgt.maxCols) {
                break
              }
              if (dataBorder && val.needBorder) {
                areaBgObj[`${i},${j}`] += `${clazz}`
              } else {
                areaBgObj[`${i},${j}`] = `${clazz}`
              }
            }
          }
        })
      }
      if (Object.keys(areaBgObj).length > 0) {
        areaBgObjs[val.area_name] = areaBgObj
      }
      repeatArr.forEach(arr => {
        let index = arr.split(',').indexOf(val.area_name)
        if (index > -1) {
          arr.split(',').forEach(a => {
            if (a == val.area_name) { return }
            let curArea = areaBgObjs[a]
            if (!!curArea) {
              let key = Object.keys(curArea)
              key.forEach(k => {
                let karr = k.split(','),
                  ki = parseInt(karr[0]), kj = parseInt(karr[1])
                if (ki >= r && ki <= r2 && kj >= c && kj <= c2) {
                  if (areaBgObjs[a][k].search(/b-right|b-bottom/) > -1 && (ki == r2 || kj == c2)) {
                    if (ki == r2) {
                      if (/b-bottom/.test(areaBgObjs[a][k])) {
                        areaBgObjs[a][k] = 'b-bottom '
                      } else {
                        delete areaBgObjs[a][k]
                      }
                    } else if (kj == c2) {
                      if (areaSite[a].end_y == c2 || !/b-right/.test(areaBgObjs[a][k])) {
                        delete areaBgObjs[a][k]
                      } else {
                        areaBgObjs[a][k] = 'b-right '
                      }
                    }
                  } else {
                    delete areaBgObjs[a][k]
                  }
                } else if (ki == r - 1 && r == areaSite[a].start_x && kj >= c && kj <= c2) {
                  if (areaBgObjs[a][k].search(/b-right|b-bottom/) > -1) {
                    areaBgObjs[a][k] = areaBgObjs[a][k].replace(/b-bottom/ig, '')
                  }
                }
              })
            }
          })
        }
      })
    })
    let key = Object.keys(areaBgObjs)
    key.forEach(v => {
      let okey = Object.keys(areaBgObjs[v])
      okey.map(subKey => {
        if (totalStyleObj[subKey]) {
          if (areaBgObjs[v][subKey].trim().split(' ').length > 1) {
            totalStyleObj[subKey] = areaBgObjs[v][subKey]
          } else if (totalStyleObj[subKey].trim().split(' ').length <= 1) {
            totalStyleObj[subKey] += ` ${areaBgObjs[v][subKey]}`
          }
        } else {
          totalStyleObj[subKey] = areaBgObjs[v][subKey]
        }
        return subKey
      })
    })
    /**end */

    let bkey = Object.keys(bgObj)
    if (bkey.length > 0) {
      bkey.forEach(b => {
        let i = b.split(',')[0],
          j = b.split(',')[1],
          clazz = `${bgObj[b]} ${totalStyleObj[b] || ''}`
        delete totalStyleObj[b]
        cells.push({ row: i, col: j, className: clazz })
      })
      let skey = Object.keys(totalStyleObj), len = skey.length
      if (len > 0) {
        for (let m = 0; m < len; m++) {
          let k = skey[m].split(','),
            i = k[0],
            j = k[1]
          cells.push({ row: i, col: j, className: totalStyleObj[skey[m]] })
        }
      }
    } else {
      let o = Object.keys(totalStyleObj)
      o.forEach(cell => {
        let i = cell.split(',')[0],
          j = cell.split(',')[1],
          clazz = totalStyleObj[cell]
        cells.push({ row: i, col: j, className: clazz })
      })
    }

    let cellMeta = mgt.hot.getCellsMeta()
    cellMeta = cellMeta.filter(cm => {
      if (!!cm) {
        delete cm.className
        return cm
      }
    })

    const hot = mgt.hot,
      mergeObj = hot.getPlugin("MergeCells"),
      newMergedCells = (mergeObj.mergedCellsCollection || []).mergedCells
    let mergeCells = []
    newMergedCells.map(mc => {
      mergeCells.push({ ...mc })
    })
    let settings = {
      cell: [...cellMeta, ...cells],
      mergeCells
    }
    if (flag !== true) {
      mgt.hot.updateSettings(settings)
      mgt.hot.getPlugin('formulas').recalculateFull()
    }
    return settings
  },
  /** 区域重叠信息 */
  areaRepeat() {
    const mgt = store.state.ReportMgt,
      index = HST.searchCurSheet().index,
      areaInfo = mgt.edcuiCompts[1].comptAttrs.tableList[index].area_info
    let areaObj = {}
    areaInfo.forEach(element => {
      let r = element.start_x, c = element.start_y,
        r2 = element.end_x, c2 = element.end_y
      for (let i = r; i <= r2; i++) {
        for (let j = c; j <= c2; j++) {
          if (!!areaObj[`${i},${j}`]) {
            areaObj[`${i},${j}`].push(element.area_name)
          } else {
            areaObj[`${i},${j}`] = [element.area_name]
          }
        }
      }
    })
    const keys = Object.keys(areaObj)
    let result = {}
    keys.forEach(key => {
      if (areaObj[key].length > 1) {
        if (!!result[areaObj[key]]) {
          result[areaObj[key]].push(areaObj[key])
        } else {
          result[areaObj[key]] = [areaObj[key]]
        }
      }
    })

    let resKeys = Object.keys(result), klen = resKeys.length
    if (resKeys.length > 0) {
      for (let i = 0; i < klen; i++) {
        for (let j = i + 1; j < klen; j++) {
          let keyi = resKeys[i].split(','), keyj = resKeys[j].split(',')
          let key = keyi.filter(arr => keyj.indexOf(arr) > -1);
          if (key.length == keyi.length) {
            resKeys.splice(i, 1)
            klen--
            j--
          } else if (key.length === keyj.length) {
            resKeys.splice(j, 1)
            klen--
            i--
            break
          }
        }
      }
    }
    return resKeys
  },
  /** 计算公式 - 选中单元格自动填入位置 */
  formulasMouseDown(CellCoords) {
    let newCell = `${CellCoords.row},${CellCoords.col}`
    //双击单元格
    if (!HST.dbl) {
      HST.dbl = newCell
      setTimeout(() => {
        HST.dbl = false;
      }, 500);
    } else {
      if (HST.dbl == newCell) {
        // HST.formulasFlag = true;//双击单元格时会复制公式内容
        HST.dbl = 'dbl';
      }
      clearTimeout(HST.dbl);
    }
    if (HST.cellSite == newCell) {
      return
    }

    let active = store.state.ReportMgt.hot.getActiveEditor() || {}

    const index = HST.searchCurSheet().sheetIndex
    let obj = document.querySelector(`#htTable${index}`)
    if ((obj.querySelector('.handsontableInput').style.display == 'none' || obj.querySelector('.ht_editor_hidden')) && active.site === 'input') {//在上方input框编辑时选择单元格
      if (active.state === 'STATE_WAITING') {
        active.state = 'STATE_VIRGIN'
      }
      obj = document.querySelector('#cellInput')
      HST.mouseIn = 'input'
    } else {
      if (active.state !== 'STATE_VIRGIN') {
        obj = obj.querySelector('.handsontableInput')
        HST.mouseIn = 'textarea'
      }
    }
    if ((obj.value || '').toString().indexOf('=') == 0 && obj.parentElement.style.opacity == 1) {
      //当前单元格输入计算公式
      let sstart = obj.selectionStart
      HST.selectionRange = [sstart, obj.selectionEnd]
      if (['=', ',', ':', '+', '-', '*', '/', '>', '<', '('].indexOf(obj.value[sstart - 1]) > -1) {//可以填入单元格
        active.state = 'STATE_WAITING'
        active.fml = true
        HST.formulasFlag = true
        HST.formulasValue = obj.value
      } else {
        if (active.state === 'STATE_WAITING') {
          active.state = 'STATE_EDITING'
        }
        HST.cellSite = newCell
        HST.selectionRange = [0, 0]
        HST.formulasValue = ''
        delete active.fml
        HST.mouseIn = 'textarea'
        HST.textAreaClick = false
        delete active.site
      }
    } else {
      HST.cellSite = newCell
      HST.formulasFlag = false
      HST.mouseIn = 'textarea'
      HST.textAreaClick = false
      delete active.site
    }
  },
  /** 计算公式 - 选中单元格自动填入位置 */
  setFormulasInCell(type) {
    if (_PARAM.report.formula === '0') {
      return
    }
    let mgt = store.state.ReportMgt
    if (HST.formulasFlag) {// || !!type
      let active = mgt.hot.getActiveEditor() || {},
        cell = mgt.hot.getSelected(), cells = [...cell]
      if (HST.cellSite === '') {
        HST.cellSite = `${active.row},${active.col}`
      }
      // const index = HST.searchCurSheet().sheetIndex
      let curCell = HST.cellSite.split(','),
        value = '', str = '', sstart = HST.selectionRange[0], send = HST.selectionRange[1],
        r, c,
        obj = active.TEXTAREA,
        //obj = document.querySelector(`#htTable${index}`).querySelector('.handsontableInput'),
        inputObj = document.querySelector('#cellInput')
      if (type != undefined) {
        r = cell[0][0]
        c = cell[0][1]
        let cur = mgt.hot.getSelectedRangeLast()
        cells = [[cur.from.row, cur.from.col, cur.to.row, cur.to.col]]
        if (type == 'inputkeydown') {
          value = inputObj.value
          sstart = inputObj.selectionStart
          send = inputObj.selectionEnd
          if (HST.firstFocus && sstart === 0) {
            sstart = send = value.length
          }
          if (HST.mouseIn == 'input') {
            try {
              r = parseInt(curCell[0])
              c = parseInt(curCell[1])
            } catch (e) { }
            if (JSON.stringify(cells).indexOf(JSON.stringify([r, c, r, c])) === -1) {
              cells.push([r, c, r, c])
            }
          }
        } else {
          sstart = obj.selectionStart
          send = obj.selectionEnd
          if (obj.value.trim() == '') {
            if (!!HST.formulasValue || HST.formulasValue != 0) {
              value = HST.formulasValue
            } else {
              try {
                value = active.originalValue
                sstart = send = value.length
              } catch (e) { }
            }
          } else {
            value = obj.value
          }
        }
        HST.selectionRange = [sstart, send]
      } else {
        try {
          r = parseInt(curCell[0])
          c = parseInt(curCell[1])
        } catch (e) { }
        cells.push([r, c, r, c])
        value = HST.formulasValue
      }
      if ((value || '').toString().trim().indexOf('=') !== 0) {
        return
      }
      let reg = /\$?[a-zA-Z]+\$?\d+(\:\$?[a-zA-Z]+\$?\d+)?/g, res, result = [],
        temp = send - sstart == 0 ? value : (`${value.substring(0, sstart)}${value.substring(send)}`)
      while ((res = reg.exec(temp)) != null) {
        let item = res[0].toLocaleUpperCase()
        if (/(A[A-Z]{1})|(^[A-Z]{1})(:[A[A-Z]{1}|(^[A-Z]{1}$]))?/.test(item.replace(/[\d|\$]+/g, ''))) {
          result.push(item.replace(/\$+/g, ''))
        }
      }
      result.forEach(rs => {
        let numReg = /\d+$/, charReg = /^[a-zA-Z]+/, r1, r2, c1, c2
        if (rs.indexOf(':') > -1) {//区间
          let rsList = rs.split(":")
          try {
            r1 = parseInt(numReg.exec(rsList[0])[0]) - 1
            c1 = parseInt(HST.charToNum(charReg.exec(rsList[0])[0]))
            r2 = parseInt(numReg.exec(rsList[1])[0]) - 1
            c2 = parseInt(HST.charToNum(charReg.exec(rsList[1])[0]))
            cells.unshift([r1, c1, r2, c2])
          } catch (e) { }
        } else {
          r1 = parseInt(numReg.exec(rs)[0]) - 1
          c1 = parseInt(HST.charToNum(charReg.exec(rs)[0]))
          cells.unshift([r1, c1, r1, c1])
        }
      })
      let tvalue = value.substring(0, sstart)
      if (type == 'inputkeydown') {
        tvalue = value
      }

      try {
        let r1 = cell[0][0] + 1, c1 = cell[0][1], r2 = cell[0][2] + 1, c2 = cell[0][3]
        if (r1 === r2 && c1 === c2) {
          str = `${HST.numToChar(c1)}${r1}`
        } else {
          r1 > r2 ? ([r1, r2] = [r2, r1]) : null
          c1 > c2 ? ([c1, c2] = [c2, c1]) : null
          str = `${HST.numToChar(c1)}${r1}:${HST.numToChar(c2)}${r2}`
        }
        if (!!!type || type == 'keydown' || (type == 'inputkeydown' && HST.mouseIn == 'input')) {
          if (curCell[0] != r1 - 1 || curCell[1] != c1) {
            // 判断公式的参数是否能够重复添加同一单元格
            // if (value.toLocaleUpperCase().indexOf(str) === -1) {//type !== 'keydown' || (type == 'keydown' &&
              let temp = value.split(''),
                reg = /[=\:\+\-*\/\>\<\(\,]{1}/
              if (reg.test(temp[sstart - 1])) {
                temp.splice(sstart, send - sstart, str)
                value = temp.join('')
                send += str.length
              }
            // }
          } else {
            HST.firstFocus = true
          }
        }
      } catch (e) { }
      setTimeout(() => {
        HST.formulasValue = value
        mgt.cellText = value
        let reg2 = /^=(.*)([a-zA-Z]+\d+)/g,
          change = reg2.test(tvalue)
        if (change || type != 'keydown') {
          active.wait = cells.length - 1
          if (active.wait === 0) {
            delete active.wait
          }
          active.fml = true
          if (type !== 'inputkeydown') {
            active.state = 'STATE_WAITING'
          }
          mgt.hot.selectCells(cells)
        } else if (type == 'keydown') {
          return
        }

        if (type == 'inputkeydown') {
          HST.firstFocus = false
          mgt.cellText = HST.formulasValue
          if (inputObj.setSelectionRange) {//设置光标位置
            inputObj.setSelectionRange(send, send)
          }
          inputObj.focus()
        } else {
          active.TEXTAREA.value = HST.formulasValue
          active.state = 'STATE_EDITING'
          active._opened = true
          active._fullEditMode = true
          active.TEXTAREA_PARENT.hidden = false
          active.TEXTAREA.focus()
          if (active.TEXTAREA.setSelectionRange) {//设置光标位置
            active.TEXTAREA.setSelectionRange(send, send)
          }
        }
        if (type != 'inputkeydown') {
          HST.firstFocus = true
          HST.formulasFlag = false
          if (type == 'dbldown') {
            HST.dbl = false
          }
        }
      }, 0);
    } else {
      HST.firstFocus = true
    }
  },
  /** 计算公式 - 模拟键盘事件 */
  fireKeyEvent(el, evtType, keyCode) {
    let evtObj;
    if (document.createEvent) {
      if (window.KeyEvent) {//firefox 浏览器下模拟事件
        evtObj = document.createEvent('KeyEvents');
        evtObj.initKeyEvent(evtType, true, true, window, true, false, false, false, keyCode, 0);
      } else {//chrome 浏览器下模拟事件
        evtObj = document.createEvent('UIEvents');
        evtObj.initUIEvent(evtType, true, true, window, 1);

        delete evtObj.keyCode;
        if (typeof evtObj.keyCode === "undefined") {//为了模拟keycode
          Object.defineProperty(evtObj, "keyCode", { value: keyCode });
        } else {
          evtObj.key = String.fromCharCode(keyCode);
        }
      }
      el.dispatchEvent(evtObj);

    } else if (document.createEventObject) {//IE 浏览器下模拟事件
      evtObj = document.createEventObject();
      evtObj.keyCode = keyCode
      el.fireEvent('on' + evtType, evtObj);
    }
  },
  /** 计算公式 - 展开下拉面板 */
  fmlFunc(type, param) {
    const mgt = store.state.ReportMgt
    let ele, value, sEnd = 0, data = []
    const index = HST.searchCurSheet().sheetIndex
    let obj = document.querySelector(`#htTable${index}`).querySelector('.handsontableInputHolder')

    if (type == 'textarea') {
      ele = obj.querySelector('.handsontableInput')
    } else {
      ele = document.querySelector('#cellInput')
    }
    sEnd = ele.selectionEnd
    value = (ele.value || '').substring(0, sEnd)

    if (!!!value) return

    let reg = /(<=[=\:\+\-*\/\>\<\(\)\,])?([^[=\:\+\-*\/\>\<\(\)\,]+)/g
    let result, res = '', i = -1
    while (value.length > 1 && (result = reg.exec(value)) != null) {
      if (result.input[result.index + result[2].length] != '(') {
        res = result[0]
        i = result.index
      }
    }
    if (!!param) {
      data = formulasData.filter(val => val.label.toLowerCase() == param.toLowerCase())
    } else if (res.length + i == value.length) {
      //返回res，匹配res 对应的函数
      formulasData.forEach(fmldata => {
        let lbl = fmldata.label.toLowerCase()
        if (lbl.indexOf(res.toLowerCase()) == 0) {
          data.push(fmldata)
        }
      })
    }
    if (value.indexOf('=') == 0 && data.length > 0) {
      if (!!param) {
        mgt.fmlPanelShow = false
      } else {
        mgt.fmlPanelShow = true
      }
      mgt.fmlPopoverShow = true
      let t = obj.style.top,
        left = obj.style.left,
        htInputEle = obj.querySelector('.handsontableInput'),
        h = htInputEle.style.height,
        w = parseFloat(htInputEle.style.width),
        top = parseFloat(t) + parseFloat(h) + 5
      if (type == 'input') {
        left = '170px'
        top = 0
      }
      let tableEle = document.querySelector('.table-wrap'),
        maxh = tableEle.offsetHeight - top - 10,
        ow = tableEle.offsetWidth,
        cssText = '',
        dl = 34 * data.length + 10,
        popoverEle = document.querySelector("#fm-popover")
      dl > 210 ? dl = 210 : null
      if (maxh < 35 || maxh < dl) {
        let templ = parseFloat(left)
        if (templ + 480 > ow) {
          left = templ - 510
          popoverEle.style.float = "left"
          popoverEle.setAttribute("x-placement", "left")
        } else {
          left = templ + w + 15
          popoverEle.style.float = "right"
          popoverEle.setAttribute("x-placement", "right")
        }
        cssText = `bottom:10px;left:${left}px;`
      } else {
        let templ = parseFloat(left)
        if (templ + 480 > ow) {
          left = templ + w - 480
          popoverEle.style.float = "left"
          popoverEle.setAttribute("x-placement", "left")
        } else {
          left = templ + 5
          popoverEle.style.float = "right"
          popoverEle.setAttribute("x-placement", "right")
        }
        cssText = `top:${top}px;left:${left}px;`
      }
      document.querySelector(".formulas-wrap").style.cssText = cssText
      popoverEle.style['margin-top'] = 0
    } else if (data.length == 0) {
      mgt.fmlPanelShow = false
      mgt.fmlPopoverShow = false
    }
    return data
  },
  /** 计算公式 - 公式中单元格映射 */
  fmlMapping() {
    const mgt = store.state.ReportMgt
    if ((store.state.HomeBody.pageCache || '').operation === 'design') {
      let type
      HST.mouseIn == 'input' ? type = 'inputkeydown' : (HST.dbl == 'dbl' ? type = 'dbldown' : null)
      let active = mgt.hot.getActiveEditor() || {}
      active.isfocus = true
      if (HST.dbl !== 'dbl' && HST.mouseIn === 'textarea') {
        if (active.wait === false) {
          delete active.wait
          HST.formulasFlag = true
          return
        }
        const value = (active.TEXTAREA || {}).value
        if (!!value && value.indexOf('=') === 0) {
          HST.formulasFlag = true
        } else {
          HST.formulasFlag = false
        }
        if (active.state === 'STATE_WAITING' && active.fml !== true && !!!active.wait) {
          active.state = 'STATE_VIRGIN'
          // active.originalValue = active.TEXTAREA.value
          // mgt.hot.destroyEditor(false, false)
          active._opened = false
          active._fullEditMode = false
          // active.TEXTAREA_PARENT.hidden = true // ie会报错。。
          delete active.wait
        } else {
          if (active.fml !== true) {
            (active.TEXTAREA_PARENT || {}).hidden = false
            HST.firstFocus = true
            delete active.wait
          } else if (active.state === 'STATE_WAITING' && !!!active.wait) {
            HST.setFormulasInCell(type)
            active._fullEditMode = true
          } else if (!!active.wait) {
            active._opened = true
            active._fullEditMode = true
            active.TEXTAREA_PARENT.hidden = false
            active.wait--
          }
          if (!!!active.wait) {
            delete active.fml
          }
        }
      } else if (HST.mouseIn === 'input') {
        const value = active.originalValue
        if (!!value && value.toString().indexOf('=') === 0 && value.length > 1) {
          HST.formulasFlag = true
        }
        if (active.fml && active.wait == undefined && HST.formulasFlag) {
          HST.setFormulasInCell(type)
        } else if (active.wait !== undefined) {
          if (active.wait === 0) {
            delete active.fml
            delete active.wait
            let inputObj = document.querySelector('#cellInput')
            HST.firstFocus = false
            mgt.cellText = HST.formulasValue
            inputObj.value = mgt.cellText
            active.TD.innerHTML = mgt.cellText
            active.state = 'STATE_WAITING'
            if (inputObj.setSelectionRange) {//设置光标位置
              inputObj.setSelectionRange(HST.selectionRange[0], HST.selectionRange[0])
            }
            inputObj.focus()
          } else if (active.wait !== false) {
            active.wait--
          }
        }
      }
    }
  },
  /** 数字格式化填充 */
  numFormatSetting(data = [], flag = false, undoCells = []) {
    if (store.state.commonProperties.report.dataSetting === '0') {
      return
    }
    let result = {}

    undoCells.map(cell => {
      if (cell[0] > cell[2]) {
        [cell[0], cell[2]] = [cell[2], cell[0]]
      }
      if (cell[1] > cell[3]) {
        [cell[1], cell[3]] = [cell[3], cell[1]]
      }
      for (let i = cell[0]; i <= cell[2]; i++) {
        for (let j = cell[1]; j <= cell[3]; j++) {
          result[`${i},${j}`] = { type: 'numeric', patten: '' }
        }
      }
      return result
    })

    data.map((args) => {
      let cell = args.cells
      if (cell[0] > cell[2]) {
        [cell[0], cell[2]] = [cell[2], cell[0]]
      }
      if (cell[1] > cell[3]) {
        [cell[1], cell[3]] = [cell[3], cell[1]]
      }
      for (let i = cell[0]; i <= cell[2]; i++) {
        for (let j = cell[1]; j <= cell[3]; j++) {
          result[`${i},${j}`] = { type: args.type, patten: args.patten }
        }
      }
      return result
    })

    let func = function (row, col) {
      let cellProperties = {},
        args = result[`${row},${col}`]
      if (!!args && args.command != 'common') {
        cellProperties.type = args.type
        cellProperties.numericFormat = {
          pattern: args.patten,
          culture: 'en-US'
        }
      }
      if (Object.keys(cellProperties).length > 0)
        return cellProperties
    }
    if (flag !== 'noRun') {
      const { cell, mergeCells } = HST.cellOnClass(undefined, true)
      store.state.ReportMgt.hot.updateSettings({
        cells: func,
        cell,
        mergeCells
      })

      const index = HST.searchCurSheet().index
      store.state.ReportMgt.edcuiCompts[1].comptAttrs.tableList[index]['numericFormat'] = data
    } else {
      return func
    }
  },
  commentsEditHistory(r,c) {
    let hot = store.state.ReportMgt.hot
    let comments = hot.getPlugin('Comments')
    let {row, col} = {...comments.range.from}
    try {
      if(r===row && c === col) {
        if(hot.getCellMeta(r, c).comment && hot.getPlugin('comments').getCommentAtCell(r, c) !== '') {
          comments.showAtCell(r, c)
          document.querySelector('.htComments').style.display = 'block'
        }
      }
    } catch (e) {}
    if ( ['edit', 'new', 'multiEdit'].includes(HST.commentsType) && _PARAM.comment.val !== null) {
      let [r1, c1] =_PARAM.comment.cell
      let comment = hot.getCellMeta(r1, c1).comment//comments.getComment()
      try {
        if (JSON.stringify(_PARAM.comment.val) !== JSON.stringify(comment)) {
          if (row === r1 && col === c1) {
            let history = {
              type: 'commentEdit',
              cells: [r1, c1],
              commentObj: {
                origVal: _PARAM.comment.val,
                newVal: comment
              }
            }
            HST.upHisData(history)
          }
        }
      } catch(e) {
        console.error(e);
      }
    }
    _PARAM.comment.val = null
    HST.commentsType = ''
  },
  /* 条件格式样式 */
  condiRuleClass(param) {
    let {type='new', data=[]} = param||{}
    const sheet = HST.searchCurSheet().sheetIndex
    const mgt = store.state.ReportMgt
    let condiRuleArr =  mgt.condiRuleList[`sheet${sheet}`] || []
    let reg = /(allRed|allYellow|allGreen|redBg|redText)(\d)/g
    if (type === 'edit') { //删除旧格式
      data.forEach((arr) => {
        for(let cell of arr.cells) {
          let [r1, c1, r2, c2] = cell
          r1 > r2 ? [r1, r2] = [r2, r1] : ''
          c1 > c2 ? [c1, c2] = [c2, c1] : ''
          for(let m = r1; m <= r2; m++) {
            for(let n = c1; n <= c2; n++) {
              let cellTd = mgt.hot.getCell(m, n)
              if (cellTd === null) {
                continue
              }
              cellTd.classList.remove(`${arr.style}${arr.index}`)
              cellTd.classList.remove(`rule${arr.index}`)
              if (arr.style === 'redBorder') {
                try {
                  mgt.hot.getCell(m - 1, n).classList.remove(`redBdBottom${arr.index}`)
                  mgt.hot.getCell(m, n - 1).classList.remove(`redBdRight${arr.index}`)
                } catch (e) {}
              }
            }
          }
        }
      })
    }
    condiRuleArr.forEach((arr) => {
      for(let cell of arr.cells) {
        let [r1, c1, r2, c2] = cell
        r1 > r2 ? [r1, r2] = [r2, r1] : ''
        c1 > c2 ? [c1, c2] = [c2, c1] : ''
        for(let m = r1; m <= r2; m++) {
          for(let n = c1; n <= c2; n++) {
            let val = mgt.hot.getDataAtCell(m, n)
            let flag = false
            const cellTd = mgt.hot.getCell(m, n)
            if (cellTd === null) {
              continue
            }
            cellTd.classList.remove(`${arr.style}${arr.index}`)
            if (val === '' || val === null) {
              val = 0
              if (cellTd.innerText) {
                val = cellTd.innerText
              }
            }
            if (isNaN(val) || (!!val && (val).toString().trim() === '')) {
              if (['>', '>=','!='].includes(arr.symbol)) {
                flag = true
              } else {
                let classList = cellTd.classList
                classList.add(`rule${arr.index}`)
                // cellTd.classList = classList
                continue
              }
            }
            if (typeof val === 'string') {
              val = val.replace(/\s/g,'')
            }
            if (flag || (val !== '' && arr.mValue !== '' && eval(`${val} ${arr.symbol} ${arr.mValue}`))) {
              let className = cellTd.className
              if (!['redBorder', 'redText', 'redBg'].includes(arr.style)) {
                className = className.replace(reg, function($,$0,$1) {
                 return `rule${$1}`
                })
              }
              cellTd.className = className
              let classList = cellTd.classList
              classList.add(`${arr.style}${arr.index}`)
              // cellTd.classList = classList
              if (arr.style === 'redBorder') {
                try {
                  mgt.hot.getCell(m - 1, n).className = mgt.hot.getCell(m - 1, n).className.replace(/redBdBottom\d/g,'')
                  mgt.hot.getCell(m, n - 1).className = mgt.hot.getCell(m, n - 1).className.replace(/redBdRight\d/g,'')
                  mgt.hot.getCell(m - 1, n).classList.add(`redBdBottom${arr.index}`)
                  mgt.hot.getCell(m, n - 1).classList.add(`redBdRight${arr.index}`)
                } catch (e) {}
              }
            } else {
              let classList = cellTd.classList
              classList.add(`rule${arr.index}`)
              // cellTd.classList = classList
            }
          }
        }
      }
    })
  },
  /**
   *单元格拆分重组计算
   **/
  ruleCellReBuild(cells) {
    const mgt = store.state.ReportMgt
    const sheet = HST.searchCurSheet().sheetIndex
    let condiRuleArr =  mgt.condiRuleList[`sheet${sheet}`] || []
    condiRuleArr.forEach((rule, index) => {
      let ruleScatter = []
      for (let cell of rule.cells) {
        let [r1, c1, r2, c2] = cell
        r1 > r2 ? [r1, r2] = [r2, r1] : ''
        for (let cell1 of cells) {
          let [r11, c11, r22, c22] = cell1
          r11 > r22 ? [r11, r22] = [r22, r11] : ''
          if (c22 >= c1 && c11 <= c2 && r22 >= r1 && r11 <= r2) {
            for (let j = c1; j <= c2; j++) {
              let ruleC = [[]]
              for (let i = r1; i <= r2; i++) {
                if (i < r11 || i > r22 || j < c11 || j > c22) {
                  if (ruleC[0].length === 0) {
                    ruleC[0].push(i, j, i, j)
                  } else {
                    ruleC[0][2] = i
                    ruleC[0][3] = j
                  }
                } else if (ruleC[0].length > 0) {
                  ruleC.unshift([])
                }
              }
              if (ruleC[0].length === 0) {
                ruleC.shift()
              }
              ruleScatter.push([...ruleC].reverse())
            }
          } else {
            ruleScatter.push([cell])
          }
        }
      }
      if (ruleScatter.length > 0) {
        ruleScatter = ruleScatter.reduce((cur, next) => ([...cur, ...next]), [])
        // ruleScatter = ruleScatter.flat()
        let len = ruleScatter.length

        for (let i = 0; i < len; i++) {
          for(let j = i + 1; j < len; j++) {
            let rule = ruleScatter[i]
            let [r1, c1, r2, c2] = rule
            let rule1 = ruleScatter[j]
            let [r11, c11, r22, c22] = rule1
            if ((2 * c2 - c1 === c11 || c1 + 1 === c11) && c2 + 1 === c22 && r1 == r11 && r2 === r22) {
              ruleScatter[i] = [r1, c1, r22, c22]
              ruleScatter.splice(j, 1)
              len--
              j--
            }
          }
        }
        rule.cells = ruleScatter
      }
    })
  },
  /**
   *  cut->paste 原先规则添加
   *  autoFill 原先规则添加
   *  copy->paste 新增规则
   *  painer 新增规则
   **/
  ruleCellAdd(cells, type, sheet) {
    const mgt = store.state.ReportMgt
    let newSheet = HST.searchCurSheet().sheetIndex
    if (sheet === undefined) {
      sheet = newSheet
    }
    let condiRuleArr =  mgt.condiRuleList[`sheet${sheet}`] || []
    if (condiRuleArr.length === 0) {
      return
    }
    for (let scatter of cells) {
      let keys = Object.keys(scatter)
      for(let k of keys) {
        let cell = scatter[k]
        let len = cell.length
        for (let i = 0; i < len; i++) {
          for(let j = i + 1; j < len; j++) {
            let rule = cell[i]
            let [r1, c1, r2, c2] = rule
            let rule1 = cell[j]
            let [r11, c11, r22, c22] = rule1
            if (
              (c1 === c11 && c2 === c22 && (r2 + 1 === r11 || r1 - 1 === r22)) ||
              (r1 === r11 && r2 === r22 && (c2 + 1 === c11 || c1 - 1 === c22)) ||
              (c1 >= c11 && c2 <= c22 && r1 >= r11 && r2 <= r22) ||
              (c1 <= c11 && c2 >= c22 && r1 <= r11 && r2 >= r22)
            ) {
              if (r1 - 1 === r22 || c1 - 1 === c22) {
                cell[i] = [r11, c11, r2, c2]
              } else if (c1 >= c11 && c2 <= c22 && r1 >= r11 && r2 <= r22) { // [i]包含于[j]
                cell.splice(i, 1)
                --len
                --i
                break
              } else if (c1 <= c11 && c2 >= c22 && r1 <= r11 && r2 >= r22) { // [i]包含[j]
                cell.splice(j, 1)
                --len
                --i
                break
              } else {
                cell[i] = [r1, c1, r22, c22]
              }
              cell.splice(j, 1)
              len--
              j = i
            }
          }
        }
      }
    }

    for (const cellObj of cells) {
      let keys = Object.keys(cellObj)
      for(let k of keys) {
        let index = k.replace(/[^\d]/g,'')
        let cell = cellObj[k]

        let indexKey = (condiRuleArr[index]||{}).index
        let len1 = condiRuleArr.length
        while (indexKey != index && len1 >= 0) {
          indexKey = (condiRuleArr[len1]||{}).index
          len1--
        }
        len1 = len1 === condiRuleArr.length ? indexKey : len1 + 1
        if (['cut', 'autoFill'].includes(type) && sheet === newSheet) {
          condiRuleArr[len1].cells.unshift(...cell)
          let cellsArr = condiRuleArr[len1].cells
          let len = condiRuleArr[len1].cells.length
          for (let i = 0; i < len; i++) {
            for(let j = 0; j < len; j++) {
              let rule = cellsArr[i]
              let [r1, c1, r2, c2] = rule
              if (i === j) {
                continue
              }
              let rule1 = cellsArr[j]
              let [r11, c11, r22, c22] = rule1
              if (r2 + 1 === r11 && c1 == c11 && c2 === c22) {
                cellsArr[i] = [r1, c1, r22, c22]
                cellsArr.splice(j, 1)
                len--
                j < 1 ? j = 0 : j--
              }
            }
          }
          condiRuleArr[len1].cells = cellsArr
        } else {
          let newRule = JSON.parse(JSON.stringify(condiRuleArr[len1]))
          newRule.cells = cell
          newRule.index = ++mgt.ruleIndex
          if (sheet !== newSheet) {
            if (mgt.condiRuleList[`sheet${newSheet}`]) {
              mgt.condiRuleList[`sheet${newSheet}`].push(newRule)
            } else {
              mgt.condiRuleList[`sheet${newSheet}`] = newRule
            }
          } else {
            condiRuleArr.push(newRule)
          }
        }
      }
    }
  },
  /**
   * 右下角加号拖动样式
  */
  async cornerFillStylus() {
    const mgt = store.state.ReportMgt
    let {cell: oldCell,cells: newCell} = mgt.fillInfo
    const stylus = HST.getCellStyleMerge('', ...oldCell)
    stylus.oldCell = oldCell[0]
    stylus.newCell = newCell
    let history = await HST.fillStylus(stylus, 'autoFill')
    return history
  },
  async fillStylus(stylus, type) {
    const mgt = store.state.ReportMgt
    const {oldCell, newCell} = stylus
    const endrow = oldCell[2] - oldCell[0] + 1
    const endcol = oldCell[3] - oldCell[1] + 1
    let [c0, c1, c2, c3] = newCell
    let fmMergeObj = { origCell: [], newCell: [] }

    let history = await HST.setStylus(stylus, type)
    if (history === false) {
      return false
    }
    fmMergeObj = history.fmMergeObj
    /** 设置样式 */
    let mergeCell = stylus.mergeCell,
      mergeObj = mgt.hot.getPlugin("MergeCells");
    if (type !== 'autoFill') {
      mergeObj.unmergeSelection()
    }
    const num = Math.ceil((c2 - c0 + 1) / (endrow)),
      num2 = Math.ceil((c3 - c1 + 1) / (endcol))
    mergeCell.forEach(val => {
      let startRow, startColumn, endRow, endColumn
      for (let z = 0; z < num; z++) {
        for (let j = 0; j < num2; j++) {
          startRow = c0 + endrow * z + val[0]
          startColumn = c1 + endcol * j + val[1]
          endRow = startRow + val[2] - 1
          endColumn = startColumn + val[3] - 1
          endRow > c2 ? endRow = c2 : null
          endColumn > c3 ? endColumn = c3 : null
          mergeObj.merge(startRow, startColumn, endRow, endColumn)
          fmMergeObj.newCell.push([startRow, startColumn, endRow, endColumn])
        }
      }
    })
    /**end */
    // let history = {
    //   type,
    //   cells: [[c0 - 1, c1 - 1, c2, c3]]
    // }
    if (fmMergeObj.newCell.length > 0 || fmMergeObj.origCell.length > 0) {
      history.fmMergeObj = fmMergeObj
    }
    // if (fmStyleObj.newVal.length > 0 || fmStyleObj.origVal.length > 0) {
    //   history.fmStyleObj = fmStyleObj
    // }
    // if (fmNumFormatObj.newVal.length > 0 || fmNumFormatObj.origVal.length > 0) {
    //   history.fmNumFormatObj = fmNumFormatObj
    // }
    // history.ruleObj = ruleObj
    return history
  },
  setStylus(stylus, type) {
    const mgt = store.state.ReportMgt
    const index = HST.searchCurSheet().index
    const {styleList, numFmList, ruleList, oldCell, newCell} = stylus
    const endrow = oldCell[2] - oldCell[0] + 1
    const endcol = oldCell[3] - oldCell[1] + 1
    let flag = true
    let numFormat = mgt.edcuiCompts[1].comptAttrs.tableList[index]['numericFormat'] || []
    let newRuleCell = [{}]
    const sheet = HST.searchCurSheet().sheetIndex
    let condiRuleArr =  JSON.parse(JSON.stringify(mgt.condiRuleList[`sheet${sheet}`] || []))
    const reg = /(allRed|allYellow|allGreen|redBg|redText)(\d)/g
    let [c0, c1, c2, c3] = newCell
    let fmMergeObj = { origCell: [], newCell: [] }
    let fmStyleObj = { origVal: [], newVal: [] }
    let fmNumFormatObj = { origVal: [], newVal: [] }
    let pasteValid = true

    fmNumFormatObj.origVal = [...numFormat]

    if (mgt.hot.getPlugin('MergeCells').mergedCellsCollection !== null) {
      let merge_list
      if (type === 'autoFill') {
        merge_list = mgt.fillInfo.mergeCells || []
      } else {
        merge_list = mgt.hot.getPlugin('MergeCells').mergedCellsCollection.mergedCells;
      }
      merge_list.forEach(val => {
        const rowEnd = val.row + val.rowspan - 1,
          colEnd = val.col + val.colspan - 1
        if (((val.row >= c0 && val.row <= c2) || (rowEnd >= c0 && rowEnd <= c2)) && ((val.col >= c1 && val.col <= c3) || (colEnd >= c1 && colEnd <= c3))) {
          if (!(val.row >= c0 && val.row <= c2 && rowEnd >= c0 && rowEnd <= c2 && val.col >= c1 && val.col <= c3 && colEnd >= c1 && colEnd <= c3)) {
            if ((val.row !== c0 || val.col !== c1) && type !== 'autoFill') {
              Message.warning(`不能对合并单元格作部分修改`)
              pasteValid = false
            }
          } else {
            fmMergeObj.origCell.push(val)
          }
        }
      })
    }
    if (!pasteValid && type === 'fmPainer') {
      return false
    }
    if (type === 'fmPainer') {
      mgt.formatPainter.sign = false
      if (mgt.hot.getActiveEditor().state == "STATE_EDITING") {
        mgt.fmPainter = false
        return
      }
      mgt.hot.selectCell(c0, c1, c2, c3)
    }
    /**
     * 刷条件规则
     * 如果只选中一个单元格，刷 点格式刷时选中的单元格个数
     * 如果选中多个，则按照当前选中个数刷
    */
    if (ruleList && ruleList.origVal.length > 0) {
    const flag = (c0 !== c2 || c1 !== c3)
    let [iRow, iCol, iRow2, iCol2] = ruleList.origCell
    if (ruleList.cells && ruleList.cells.length > 0) {
      let clen = iCol2 - iCol + 1
      let rlen = iRow2 - iRow + 1
      for(let item of Object.entries(ruleList.cells)) {
        let [cellIndex, [row, col]] = item
        let origVal = ruleList.origVal[cellIndex] || []
        let [nRow, nCol] = [c0 + row - iRow, c1 + col - iCol]
        if (flag && (nRow > c2 || nCol > c3)) {
          continue
        }
        do {
          for (let val of origVal) {
            val = val.replace(reg, ($, $0, $1) => {
              return `rule${$1}`
            })
            if (newRuleCell[0][val]) {
              let last = newRuleCell[0][val].length - 1
              let [r0, r1, r2, r3] = newRuleCell[0][val][last]
              /* if (r0 === nRow && r3 + 1 === nCol) {
                newRuleCell[0][val][last] = [r0, r1, nRow, nCol]
              } else  */if ((r1 === r3 && nCol === r1 && r2 + 1 === nRow) || (r0 === r2 && nCol === r3 + 1 && r2 === nRow)) {
                newRuleCell[0][val][last] = [r0, r1, nRow, nCol]
              } else {
                newRuleCell[0][val].push([nRow, nCol, nRow, nCol])
              }
            } else {
              newRuleCell[0][val] = [[nRow, nCol, nRow, nCol]]
            }
          }
          nCol += clen
          if (nCol > c3 && nRow < c2) {
            nCol = c1 + col - iCol
            nRow += rlen
          }
        } while (nCol <= c3 && nRow <= c2)
      }
    }
    }
    // 格式刷区域删除旧规则，增加新规则，手动触发样式填充
    // corner下拉区域删除旧规则，增加新规则，手动触发样式填充
    // if(type === 'autoFill') {
    // }
    let history = {}
    if (_PARAM.report.cellCondFormat !== '0') {
      HST.ruleCellReBuild([newCell])
      HST.ruleCellAdd(newRuleCell, type, stylus.sheet)
      HST.condiRuleClass({type:'edit',data: condiRuleArr})
      let newVal = JSON.parse(JSON.stringify(mgt.condiRuleList[`sheet${sheet}`] || []))
      let ruleObj = {
        newVal,
        origVal: condiRuleArr,
        sheet
      }
      history.ruleObj = ruleObj
    }

    //如果只选中一格进行格式刷，直接刷数据样式
    if (type === 'fmPainer' && oldCell[0] === oldCell[2] && oldCell[1] === oldCell[3]) {
      numFormat.forEach(f => {
        let [r, c, r2, c22] = f.cells
        let temp = numFmList[1][1]
        if (!!!temp && c0 >= r && c0 <= r2 && c1 >= c && c1 <= c22) {
          temp = {
            patten: "",
            type: "numeric"
          }
        }
        if (!!temp) {
          numFormat.push({ cells: newCell, ...temp })
        }
      })
      flag = false
      fmNumFormatObj.newVal = [...numFormat]
    }
    if (styleList.length > 0) {
      [oldCell,newCell].forEach((cell1,index) => {
        let x = 0, y = 0, origArr = [], newArr = []
        let [cr0, cr1, cr2, cr3] = cell1
        for (let i = cr0 - 1; i <= cr2; i++) {
          y = 0
          for (let j = cr1 - 1; j <= cr3; j++) {
            let celldom = mgt.hot.getCell(i, j),
              oldStyle = mgt.hot.getCellMeta(i, j).style,
              stl = {}
            if (styleList[x].length > 0) {
              stl = styleList[x][y]
            }
            origArr.push(oldStyle || {})

            let sign = true
            if (i === cr0 - 1 && j === cr1 - 1) {
              sign = false
            } else if (i === cr0 - 1) {
              stl = { ...oldStyle, ...stl }
            } else if (j === cr1 - 1) {
              stl = { ...oldStyle, ...stl }
            } else if ((y === styleList[x].length - 1 && j !== cr3) || (x === styleList.length - 1 && i !== cr2)) {
              if (y === styleList[x].length - 1 && j !== cr3) {
                stl = { ...stl, ...styleList[x][0] }
              }
              if (x === styleList.length - 1 && i !== cr2) {
                stl = { ...stl, ...styleList[0][y] }
              }
            } else if (i >= cr0 + endrow || j >= cr1 + endcol) {
              if (x === 1 && y === 1) {
                stl = styleList[x][y]
                if (!!styleList[x][y]['border-bottom']) {
                  stl['border-bottom'] = styleList[x][y]['border-bottom']
                }
                if (!!styleList[x][y]['border-right']) {
                  stl['border-right'] = styleList[x][y]['border-right']
                }
              } else if (x === 1) {
                stl = styleList[x][y]
                if (!!styleList[x][y]['border-bottom']) {
                  stl['border-bottom'] = styleList[x][y]['border-bottom']
                }
              } else if (y === 1) {
                stl = styleList[x][y]
                if (!!styleList[x][y]['border-right']) {
                  stl['border-right'] = styleList[x][y]['border-right']
                }
              }
            }
            if (sign) {
              mgt.hot.setCellMeta(i, j, 'style', stl)
              if (!!celldom) {
                // celldom.style = {} // ie11 下不能直接修改style
                const ks = Object.keys(stl)
                ks.forEach(val => {
                  celldom.style[val] = stl[val]
                })
              }
            }
            newArr.push(stl)

            //刷 数据样式
            if (index === 1 && flag && i !== cr0 - 1 && j !== cr1 - 1) {
              let temp = numFmList[x][y]
              if (temp.length === 0) {
                temp = {
                  patten: "",
                  type: "numeric"
                }
              }
              numFormat.push({ cells: [i, j, i, j], ...temp })
            }
            y >= styleList[x].length - 1 ? y = 1 : y++
          }
          x >= styleList.length - 1 ? x = 1 : x++
        }
        if (index === 1) {
          fmStyleObj.origVal.push(origArr)
          fmStyleObj.newVal.push(newArr)
        }
      })
      fmNumFormatObj.newVal = [...numFormat]
      HST.numFormatSetting(numFormat)
      HST.getCellStyle()
    }
    history = {
      ...history,
      type,
      cells: [[c0 - 1, c1 - 1, c2, c3]]
    }
    if (fmStyleObj.newVal.length > 0 || fmStyleObj.origVal.length > 0) {
      history.fmStyleObj = fmStyleObj
    }
    if (fmNumFormatObj.newVal.length > 0 || fmNumFormatObj.origVal.length > 0) {
      history.fmNumFormatObj = fmNumFormatObj
    }
    history.fmMergeObj = fmMergeObj
    return history
  },
  /** 隐藏 */
  hiddenColumnsHide() {
    const hot = store.state.ReportMgt.hot;
    let selectedCols = [];
    let selectedRows = [];
    let cellsSelect = hot.getSelected();
    //首先获取隐藏的行列数
    let hiddenRow = hot.getPlugin('hiddenRows');
    let hiddenCol = hot.getPlugin('hiddenColumns');
    let lastCol = this.judgeCols(hiddenCol.hiddenColumns);
    let lastRow = this.judgeRows(hiddenRow.hiddenRows);
    let firstCol = this.findFirstCol(hiddenCol.hiddenColumns);
    let firstRow = this.findFirstRow(hiddenRow.hiddenRows);
    cellsSelect.forEach(select => {
      //作一次转换，相当于从前往后拖
      if (select[1] > select[3]) {
        let temp = select[1];
        select[1] = select[3];
        select[3] = temp;
      }
      if (select[0] > select[2]) {
        let temp = select[0];
        select[0] = select[2];
        select[2] = temp;
      }
      //直接拖列
      if (select[1] === select[3] || (select[0] === firstRow && select[2] === lastRow && select[0] !== select[2]) || (select[0] === 0 && select[2] === lastRow && select[1] === firstCol && select[3] === lastCol)) { // 选中列
        let startCol = select[1];
        let endCol = select[3];
        let selectCols;
        if (endCol - startCol > 0) {
          selectCols = Array.from({ length: endCol - startCol + 1 }, (v, k) => k + startCol);
        }else {
          selectCols = Array.from({ length: Math.abs(endCol - startCol) + 1 }, (v, k) => k + endCol);
        }
        selectedCols.push(...selectCols);
      }
      if (select[0] === select[2] || (select[1] === firstCol && select[3] === lastCol && select[1] !== select[3]) || (select[1] === 0 && select[3] === lastCol && select[0] === firstRow && select[2] === lastRow)) { // 选中行
        let startRow = select[0];
        let endRow = select[2];
        let selectRows;
        if (endRow - startRow > 0) {
          selectRows = Array.from({ length: endRow - startRow + 1 }, (v, k) => k + startRow);
        }else {
          selectRows = Array.from({ length: Math.abs(endRow - startRow) + 1 }, (v, k) => k + endRow);
        }
        selectedRows.push(...selectRows);
      }
    });
    selectedRows = this.newArray(selectedRows);
    selectedCols = this.newArray(selectedCols);
    let hiddenObj = hot.getPlugin('hiddenColumns');
    let history = {};
    if (selectedCols.length !== 0) {
    // if (selectedCols.length === 0) {
      //columns
      hiddenObj.hideColumns(selectedCols);
      history = {
        type: 'hidecol',
        origVal: selectedCols,
        cells: cellsSelect
      }
    }
    if (selectedRows.length !== 0) {
      //rows
      hiddenObj = hot.getPlugin('hiddenRows');
      hiddenObj.hideRows(selectedRows);
      history = {
        type: 'hiderow',
        origVal: selectedRows,
        cells: cellsSelect
      }
    }
    HST.upHisData(history);
    // hot.updateSettings(settings);
    hot.render();
  },
  judgeCols(cols) {
    //找出当前自主报表内尾列并返回
    let lastCol = 25;
    let flag = false;
    if (cols.length === 0 || cols.length === 26) {
      lastCol = 25;
      return lastCol;
    }
    for (let i=25;i>=0;i--) {
      flag = false;
      for (let j=0;j<cols.length;j++) {
        if (i === cols[j]) {
          flag = true;
        }
      }
      if(flag === false) {
        lastCol = i;
        break;
      }
    }
    return lastCol;
  },
  findFirstCol(cols) {
    let firstCol = undefined;
    let flag = false;
    if (cols.length === 0) {
      firstCol = 0;
      return firstCol;
    }
    for (let i=0;i<=25;i++) {
      flag = false;
      for (let j=0;j<cols.length;j++) {
        if (i === cols[j]) {
          flag = true;
        }
      }
      if(flag === false) {
        firstCol = i;
        break;
      }
    }
    return firstCol;
  },
  judgeRows(rows) {
    let lastRow = undefined;
    let flag = false;
    if (rows.length === 0 || rows.length === 50) {
      lastRow = 49;
      return lastRow;
    }
    for (let i=49;i>=0;i--) {
      flag = false;
      for (let j=0;j<rows.length;j++) {
        if (i === rows[j]) {
          flag = true;
        }
      }
      if(flag === false) {
        lastRow = i;
        break;
      }
    }
    return lastRow;
  },
  findFirstRow(rows) {
    let firstRow = undefined;
    let flag = false;
    // if (rows.length === 0 || rows.length === 50) {
    //   lastRow = 49;
    //   return lastRow;
    // }
    if (rows.length === 0) {
      firstRow = 0;
      return firstRow;
    }
    for (let i=0;i<=49;i++) {
      flag = false;
      for (let j=0;j<rows.length;j++) {
        if (i === rows[j]) {
          flag = true;
        }
      }
      if(flag === false) {
        firstRow = i;
        break;
      }
    }
    return firstRow;
  },
  newArray(array) {
    let arr = [];
    for (let i = 0;i<array.length;i++) {
      if (arr.indexOf(array[i]) === -1) {
        arr.push(array[i]);
      }
    }
    return arr;
  },
  handleSelect(select) {
    select[0] = 0;
    select[1] = 0;
    select[2] = 49;
    select[3] = 25;
  },
  /** 取消隐藏 */
  hiddenColumnsShow() {
    const hot = store.state.ReportMgt.hot;
    let selectedCols = [];
    let selectedRows = [];
    let cellsSelect = hot.getSelected();
    let hiddenC = hot.getPlugin('hiddenColumns');
    let hiddenR = hot.getPlugin('hiddenRows');
    let hiddenCs = hiddenC.hiddenColumns;
    let hiddenRs = hiddenR.hiddenRows;
    let lastCol = this.judgeCols(hiddenCs);
    let lastRow = this.judgeRows(hiddenRs);
    cellsSelect.forEach(select => {
      //鼠标拖选所有列或所有行
      if(select[0] === 50 && select[1] === 0 && select[2] === 50 && select[3] === 0) {
        this.handleSelect(select);
      }
      if(select[0] === 50 && select[1] === 26 && select[2] === 50 && select[3] === 26) {
        this.handleSelect(select);
      }
      if(select[0] === 0 && select[1] === 0 && select[2] === 0 && select[3] === 0) {
        this.handleSelect(select);
      }
      if (select[0] === 1 && select[1] === 1 && select[2] === 1 && select[3] === 1) {
        select[0] = 0;
        select[1] = 0;
      }
      if (select[0] === 0 || select[2] === lastRow || (select[2] === lastRow && select[1] === select[3])) {
        if (select[2] === lastRow && select[1] === select[3]) {
          select[1] = 0;
        }
        let startCol = select[1];
        let endCol = select[3];
        let selectCols = [];
        if (endCol - startCol > 0) {
          selectCols = Array.from({ length: Math.abs(endCol - startCol) + 1 }, (v, k) => k + startCol);
        }else {
          selectCols = Array.from({ length: Math.abs(endCol - startCol) + 1 }, (v, k) => k + endCol);
        }
        selectedCols.push(...selectCols);
      }
      if (select[1] === 0 || select[3] === lastCol || (select[3] === lastCol && select[0] === select[2])) {
        // 选中行
        if (select[3] === lastCol && select[0] === select[2]) {
          select[0] = 0;
        }
        let startRow = select[0];
        let endRow = select[2];
        let selectRows = [];
        //进行一个判断--如果是从上往下选就要以endRow开始
        if (endRow - startRow > 0) {
          selectRows = Array.from({ length: Math.abs(endRow - startRow) + 1 }, (v, k) => k + startRow);
        }else {
          selectRows = Array.from({ length: Math.abs(endRow - startRow) + 1 }, (v, k) => k + endRow);
        }
        selectedRows.push(...selectRows);
      }
    });
    let hiddenObj = {};
    let hiddens = [];
    // let hiddenObj = hot.getPlugin('hiddenColumns');
    // let hiddens = hiddenObj.hiddenColumns;
    let selectedHiddens = [];
    let type = '';
    if (selectedRows.length !== 0) {
      hiddenObj = hot.getPlugin('hiddenRows');
      hiddens = hiddenObj.hiddenRows;
      selectedHiddens = selectedRows.filter(item => hiddens.indexOf(item) > -1);
      hiddenObj.showRows(selectedHiddens);
      type = 'showrow';
    }
    if (selectedCols.length !== 0) {
      let hiddenObj = hot.getPlugin('hiddenColumns');
      let hiddens = hiddenObj.hiddenColumns;
      selectedHiddens = selectedCols.filter(item => hiddens.indexOf(item) > -1);
      hiddenObj.showColumns(selectedHiddens);
      type = 'showcol';
    }
    let history = {
      type,
      origVal: selectedHiddens,
      cells: cellsSelect
    }
    HST.upHisData(history);
    // hot.updateSettings(settings);
    // setTimeout(() => {hot.render();},1000);
    hot.render();
  },
  /** handsonTable 默认数据 */
  htData: {
    language: "zh-CN",
    mergeCells: [],
    minCols: 26,
    minRows: 500,
    maxCols: 50,
    maxRows: 500,
    allowEmpty: true,
    rowHeaders: true,
    colHeaders: true, //自定义列表头or 布尔值,
    colWidths: 80, //默认宽度
    rowHeights: 22, //默认高度
    outsideClickDeselects: false, //鼠标离开表格保持高亮
    manualRowResize: true, //手动调整行高
    manualColumnResize: true, //手动调整列宽
    autoWrapCol: false, //自动换行：false
    autoWrapRow: false,
    persistentState: true,
    minSpareRows: 2,
    minSpareCols: 2,
    width: "100%",
    height: "100%",
    undo: false,
    redo: false,
    formulas: true,//计算公式 默认值在vue页面赋值
    comments: true,//批注
    enterBeginsEditing: false,
    licenseKey: "non-commercial-and-evaluation",
    hiddenColumns: {
      copyPasteEnabled: true,
      indicators: true,
      columns: []
    },
    hiddenRows: {
      copyPasteEnabled: true,
      indicators: true,
      rows: []
    },
    contextMenu: {
      items: {
        commentsAdd: {
          key: 'commentsAddEdit',
          name: '新建批注',//function() {return HST.commentsNameFunc()},//,'插入批注',
          callback(key, options) { HST.commentsAddEdit() },
          hidden: function() {
            const hide = store.state.commonProperties.report.newComment === '0'
            if (hide) {
              return true
            }
            return ['edit', 'multiEdit', 'multiNew'].includes(HST.commentsType)
          }
        },
        comments: {
          key: 'comments',
          name: function () {
            return '<span class="comments-edit">批注选项</span>';
          },
          submenu: {
            items: [{
              key: 'comments:commentsAddEdit',
              name: function() {return ['edit', 'multiEdit'].includes(HST.commentsType) ? '编辑批注': '新建批注'},
              callback(key, options) { HST.commentsAddEdit() }
            },{
              key: 'comments:commentsRemove',
              name: '删除批注',
              callback(key, options) { HST.commentsRemove() }
            }],
          },
          hidden: function() {
            return store.state.commonProperties.report.newComment === '0'
          }
        },
        hsep3: "---------",
        insert: {
          name: "插入",
          submenu: {
            items: [{
              key: 'insert:rowAboveInsert',
              name: '插入整行',
              callback(key, options) { HST.rowAboveInsert() },
              disabled: function () {
                const id = document.querySelector('.el-tabs__nav.is-bottom').querySelector('.is-active').getAttribute('aria-controls')
                return store.state.ReportMgt.hot.countRows() >= store.state.ReportMgt.maxRows || document.querySelector(`#${id}`).querySelector('.ht_clone_top').querySelector('.ht__active_highlight') !== null
              }
            }, {
              key: 'insert:colLeftInsert',
              name: '插入整列',
              callback(key, options) { HST.colLeftInsert() },
              disabled: function () {
                const id = document.querySelector('.el-tabs__nav.is-bottom').querySelector('.is-active').getAttribute('aria-controls')
                return store.state.ReportMgt.hot.countCols() >= store.state.ReportMgt.maxCols || document.querySelector(`#${id}`).querySelector('.ht_clone_left').querySelector('.ht__active_highlight') !== null
              }
            }]
          }
        },
        remove: {
          name: "删除",
          submenu: {
            items: [{
              key: 'remove:rowRemove',
              name: '删除整行',
              callback(key, options) { HST.rowRemove() },
              disabled: function () {
                const id = document.querySelector('.el-tabs__nav.is-bottom').querySelector('.is-active').getAttribute('aria-controls')
                return document.querySelector(`#${id}`).querySelector('.ht_clone_top').querySelector('.ht__active_highlight') !== null
              }
            }, {
              key: 'remove:colRemove',
              name: '删除整列',
              callback(key, options) { HST.colRemove() },
              disabled: function () {
                const id = document.querySelector('.el-tabs__nav.is-bottom').querySelector('.is-active').getAttribute('aria-controls')
                return document.querySelector(`#${id}`).querySelector('.ht_clone_left').querySelector('.ht__active_highlight') !== null
              }
            }]
          }
        },
        hsep4: "---------",
        rowHeight: {
          key: 'rowHeight',
          name: '行高',
          callback(key, options) { HST.rowHeight() },
          hidden: function () {
            const id = document.querySelector('.el-tabs__nav.is-bottom').querySelector('.is-active').getAttribute('aria-controls')
            return document.querySelector(`#${id}`).querySelector('.ht_clone_left').querySelector('.ht__active_highlight') === null
          }
        },
        colWidth: {
          key: 'colWidth',
          name: '列宽',
          callback(key, options) { HST.colWidth() },
          hidden: function () {
            const id = document.querySelector('.el-tabs__nav.is-bottom').querySelector('.is-active').getAttribute('aria-controls')
            return document.querySelector(`#${id}`).querySelector('.ht_clone_top').querySelector('.ht__active_highlight') === null
          }
        },
        hsep5: "---------",
        copy: { key: 'copy', name: "复制", callback(key, options) { HST.copyEvent() } },
        cut: { key: 'cut', name: "剪切", callback(key, options) { HST.copyEvent(true) } },
        paste: {
          key: 'paste', name: "粘贴选项", submenu: {
            items: [{
              key: 'paste:pasteAll',
              name: '全部',
              callback(key, options) { HST.pasteEvent() }
            }, {
              key: 'paste:pasteText',
              name: '值',
              callback(key, options) { HST.pasteEvent('true') }
            }, {
              key: 'paste:pasteStyle',
              name: '样式',
              callback(key, options) { HST.pasteEvent('style') }
            }, {
              key: 'paste:pasteFormulas',
              name: '公式',
              callback(key, options) { HST.pasteEvent('formulas') },
              disabled: function () {
                return store.state.ReportMgt.copySourceText.length == 0
              },
              hidden: ()=> {
                return _PARAM.report.formula === '0'
              }
            }
            ]
          }
        },
        showSql: {
          key: 'showSql',
          name: '展示sql',
          callback(key, options) {store.state.ReportMgt.showReportSqlDialog = true;  },
          hidden: function() {  //0-隐藏sql    1-显示sql
            const hide = store.state.commonProperties.report.showSql === '0';
            if(hide){
                return true;
            }
          }
        },
        hiddenColumnsHide: {
          key: 'hiddenColumnsHide',
          name: '隐藏',
          callback(key, options) { HST.hiddenColumnsHide(); },
          hidden: function () {
            let index = HST.searchCurSheet().sheetIndex;
            let htTable = document.querySelector(`#htTable${index}`)
            let dom = htTable.querySelector(".ht__highlight");
            // let dom = htTable.querySelector(".ht__active_highlight");
            if (!HST.showHide) {
              dom = null;
              return !dom;
            }
            if (dom === null) {
              return dom;
            }
            return !dom;
            // let dom = htTable.querySelector(".ht__active_highlight");
            // const hot = store.state.ReportMgt.hot
            // let hiddenObj = hot.getPlugin('hiddenColumns');
            // let hiddenColumns = hiddenObj.hiddenColumns;
            // let selectedCols = [];
            // let cellsSelect = hot.getSelected();
            // cellsSelect.forEach(select => {
            //   if (select[0] === 0) {
            //     let startCol = select[1];
            //     let endCol = select[3];
            //     let selectCols = Array.from({ length: endCol - startCol + 1 }, (v, k) => k + startCol);
            //     selectedCols.push(...selectCols);
            //   }
            // });
            // let selectedHiddenColumns = selectedCols.filter(item => hiddenColumns.indexOf(item) > -1);
            // return selectedHiddenColumns.length > 0;
          }
        },
        hiddenColumnsShow: {
          key: 'hiddenColumnsShow',
          name: '取消隐藏',
          callback(key, options) { HST.hiddenColumnsShow(); },
          hidden: function () {
            let index = HST.searchCurSheet().sheetIndex;
            let htTable = document.querySelector(`#htTable${index}`)
            let dom = htTable.querySelector(".ht__highlight");
            if (!HST.showCancleHide) {
              dom = null;
              return !dom;
            }
            if (dom === null) {
              return dom;
            }
            // let dom = htTable.querySelector(".ht__active_highlight");
            return !dom;
            // const hot = store.state.ReportMgt.hot
            // let hiddenObj = hot.getPlugin('hiddenColumns');
            // let hiddenColumns = hiddenObj.hiddenColumns;
            // let selectedCols = [];
            // let cellsSelect = hot.getSelected();
            // cellsSelect.forEach(select => {
            //   if (select[0] === 0) {
            //     let startCol = select[1];
            //     let endCol = select[3];
            //     let selectCols = Array.from({ length: endCol - startCol + 1 }, (v, k) => k + startCol);
            //     selectedCols.push(...selectCols);
            //   }
            // });
            // let selectedHiddenColumns = selectedCols.filter(item => hiddenColumns.indexOf(item) > -1);
            // return selectedHiddenColumns.length === 0;
          }

        }
      }
    },
    invalidCellClassName: '',
    beforePaste: function (data) {
      const mgt = store.state.ReportMgt
      if (mgt.copyStyle.cut === true && Object.keys(mgt.copyStyle).length === 1) {
        return false
      }
      if (mgt.copyStyle.cut
        || JSON.stringify(data).replace(/\"/ig, '') == JSON.stringify(mgt.copyText).replace(/\"|null/ig, '')
        || JSON.stringify(data).replace(/\"/ig, '') == JSON.stringify(_PARAM.copyableText).replace(/\"|null/ig, '')
        || JSON.stringify(mgt.copySourceText).replace(/\"/ig, '') == JSON.stringify(data).replace(/\"/ig, '')
      ) {
        HST.pasteEvent()
        return false
      } else {
        mgt.copyText = data
        mgt.copySourceText = []
        mgt.copyStyle = {}
        HST.pasteEvent()
      }
    }
  },
  /** handsonTable 预览页面默认配置 */
  preHtData: {
    language: "zh-CN",
    mergeCells: [],
    minCols: 26,
    minRows: 50,
    maxCols: 50,
    maxRows: 500,
    allowEmpty: true,
    rowHeaders: true,
    colHeaders: true,
    colWidths: 80, //默认宽度
    rowHeights: 22, //默认行高
    manualColumnFreeze: true, //手动固定某列
    manualRowResize: true, //手动调整行高
    manualColumnResize: true, //手动调整列宽
    autoWrapCol: false, //自动换行：false
    autoWrapRow: false,
    minSpareRows: 2,
    minSpareCols: 2,
    width: "100%",
    height: "100%",
    undo: false,
    redo: false,
    comments: true,//批注
    formulas: true,//计算公式 默认值在vue页面赋值
    licenseKey: "non-commercial-and-evaluation",
    beforeCopy(data) {
      data.forEach((val, index) => {
        val.forEach((subVal, subIndex) => {
          if (!!subVal && subVal.toString().indexOf("'>") > -1) {
            let link = subVal.split("'>")[1].replace('</a>', '')
            data[index][subIndex] = link
          }
        })
      })
    },
    beforePaste() {
      return false
    },
    invalidCellClassName: ''
  },
  doFixed(args) {
    let mgt = store.state.ReportMgt;
    let range = mgt.hot.getSelected();
    let [r1,c1,r2,c2] = range[0];
    let dom = document.querySelector(".ht__active_highlight");  //判断是否选中行或列
    let fixedRowsTop = 0, fixedColumnsLeft = 0;
    let index = HST.searchCurSheet().index;
    let tableList = mgt.edcuiCompts[1].comptAttrs.tableList[index];
    if (args === 'fixed') {
      if (dom) {
        if (r1 === 0 && c1 === c2) { //选中列
          fixedColumnsLeft = c1;
        } else if (c1 === 0 && r1 === r2) { //选择行
          fixedRowsTop = r1;
        }
      } else {
        if (r1 === 0 && c1 ===0 && r2 === 0 && c2 === 0) { //原点

        } else {
          fixedRowsTop = r1;
          fixedColumnsLeft = c1;
        }
      }
    }
    if (args === 'fixedLine') {
      fixedRowsTop = 1;
      fixedColumnsLeft = 0;
    }
    if (args === 'fixedColumn') {
      fixedRowsTop = 0;
      fixedColumnsLeft = 1;
    }
    let history = {
      type: 'fixed',
      origVal: {
        fixedRowsTop: tableList.fixedRowsTop,
        fixedColumnsLeft: tableList.fixedColumnsLeft
      },
      newVal: {
        fixedRowsTop,
        fixedColumnsLeft
      }
    }
    HST.upHisData(history)
    mgt.hot.updateSettings({
      fixedRowsTop,
      fixedColumnsLeft
    })
    tableList.fixedRowsTop = fixedRowsTop;
    tableList.fixedColumnsLeft = fixedColumnsLeft;
  }
}
// export default HST;
export { HST }
