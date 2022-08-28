import { HST } from "../../../utils/HandsTable.js";
import { Message } from 'element-ui'
import getUUID from "../../../utils/UUID.js"
import { objDeepCopy } from "../../../utils/comonFunc.js";
import { service } from 'ngbd-utils'

const ReportMgt = {
	namespaced: true,
	state: {
		exportReportHisDialog: false,
		exportReportDialog: false,
		exportReportFile: false,
		/** 头部样式部分 */
		curCellStyle: {},//当前单元格样式
		mergeCell: false,//当前单元格是否合并
		/** handsontable 部分 */
		hot: "",//handsontable 对象
		hotObj: {},//所有sheet handsontable 实例对象数组
		queryCriteria: false,//查询条件是否展示
		asideSign: false,//区域 是否展示
		loaderSign: false,//判断edcuiCompts是否加载完成
		firstLoad: false, // 页面第一次加载
		editableTabs: [],//tab页数据
		tabIndex: 1,//标签页index
		sheetIndex: 1,//当前所处sheet页sheet_index
		activedNum: 1,//当前活动区-条件区，结果区
		rowHeightSet: false, // 行高对话框打开开关
		colWidthSet: false, // 列宽对话框打开开关
		rowHeight: 0,
		colWidth: 0,
		cellInput: 'A1',//单元格所处位置
    cellText: '',//单元格文字
    isMailTask: false, // 是否打开邮件推送页面
    emailTaskDialogVis: false, // 是否显示taskDialog
    mailTaskParam: {}, // 导出参数
		tableListTemplate: [{
			sheet_id: "",
			sheet_index: '1',
			sheet_name: "sheet1",
			area_info: [],
			static_data_list: [[]],
			style_list: [],
			merge_list: [],
			fixedRowsTop: 0,
			fixedColumnsLeft: 0,
			hidden_col_list: [],
			hidden_row_list: [],
			chartData: [],
			show_filter: false
		}],
		warnInfo: "",
		messageSign: false,
		warnMessage: {},
		tempData: [],
		edcuiCompts: [
			{
				afId: "",
				comptSort: 0,
				type: "Jixi",
				comptAttrs: {
					"fieldList": [
						{
							"comptSort": 0,
							"type": "ElButton",
							"comptAttrs": {
								"btnType": "primary",
								// "shape": "plain",
								"label": "查询",
								"methods": {
									"clickHandle": 'this.queryReportInfo()'
								}
							}
						}, {
							"comptSort": 1,
							"type": "ElButton",
							"comptAttrs": {
								"btnType": "primary",
								// "shape": "plain",
								"label": "导出",
								"methods": {
									"clickHandle": 'this.exportReportInfo()'
								}
							}
						}
					]
				},
				needSms: ""
			}, {
				comptSort: 1,
				type: "HsTable",
				comptAttrs: {
					tableList: [
						{
							sheet_id: "",
							sheet_name: "",
							area_info: [
								{
									area_id: "",
									area_name: "",
									af_Id: "",
									sheet_id: "",
									start_x: "",
									start_y: "",
									order_id: "",
									af_col: [],
									af_row: [],
									where_filter: [],
									aggregate_type: [],
									drillData: {},//钻取条件
									drillParam: {}//钻取参数
								}
							],
							static_data_list: [],
							style_list: [],
							merge_list: [],
							fixedRowsTop: 0,
							fixedColumnsLeft: 0,
							hidden_col_list: [],
							hidden_row_list: [],
							chartData: [],
							show_filter: false
						},
					],

				}
			}],
		reportLoading: true,//加载中。。。
		maxCols: 50,
		maxRows: 500,
		copyText: '',//复制的文本
		copySourceText: '',//复制的文本-带公式
		cutCell: [],//剪切单元格范围
		copyStyle: {},//复制区域样式及合并单元格
		formatPainter: {},//格式刷-选中区域样式
		fmPainter: false,//格式刷选中
		tempPageDetails: {},//PageDetails临时数据
		leaveTab: false,
		pageNameFocus: false,
		breadcrumb: {},
		refreshNum: -1,//刷新区域个数
		tempRefreshNum: 0, //刷新区域个数计数
		clearList: [],//欲清除区域
		areaList: [],//欲填充数据区域
		mergeList: [],//与合并单元格
		fmlPanelShow: false,//公式提示面板
		fmlPopoverShow: false,//公式解释提示面板
		loadingEnd: false,
		showDialogInsertFunc: false,//插入函数-弹窗
		insertFunc: false,
		historyData: [], //存放历史数据
		historyIndex: -1, //撤销或者恢复指针位置
		historyType: '', //redo undo
		historyDataList: {}, //	多sheet
		historyIndexList: {},
		historyTypeList: {},
		manualRowHeights: [],
		manualColWidths: [],
		areaChangeFlag: {}, // 记录区域管理变化-位置信息，层级信息-撤销操作使用
		exportParam: {}, // 导出类型
		condiRuleList: {},
		condiRule: true,
		ruleIndex: 0,
		showReportSqlDialog: false, //展示sql弹窗
		showFilter: false
	},
	getters: {
		getActivedCompt(state) {
			var result = {};
			if (state.activedNum !== '') {
				var cpts = state.edcuiCompts;
				for (var i = 0; i < cpts.length; i++) {
					if (cpts[i].comptSort == state.activedNum) {
						result = cpts[i];
						break;
					}
				}
			} else if (state.comptNum != null) {
				if (state.comptNum == 0) {
					result = state.edcuiCompts[state.comptNum] || {};
				} else {
					result = state.edcuiCompts[state.comptNum - 1];
				}
			}
			state.activedCompt = result;
			return result;
		},
		getCurSheetId(state, getters, rootState) {
			let index = HST.searchCurSheet().index
			let sheetId = (state.edcuiCompts[1].comptAttrs.tableList[index] || {}).sheet_id
			return sheetId
		},
		getWhereBean: (state, getters, rootState, rootGetters) => (filterData, condiParam, afId) => {
			let where_bean = { exp: '', rule_list: [] }, where_bean1 = [], where_bean2 = []
			const pm = {
				type: '1003',
				filterData: filterData
			}
			if (state.edcuiCompts[0].afId !== '') {
				let condiNum = 0
				state.edcuiCompts[1].comptAttrs.tableList.forEach(val => {
					val.area_info.forEach(item => {
						if (item.af_Id === state.edcuiCompts[0].afId) {
							if (val.sheet_index === condiParam.sheet && item.area_id === condiParam.area) {
								if (afId === item.af_Id) {
									condiNum++
								}
							} else {
								condiNum++
							}
						}
					})
				})
				if (condiNum === 0) {
					state.edcuiCompts[0].afId = ""
					rootState.ReportAttr.condiData = []
					state.edcuiCompts[0].datasets = []
				}
			}

			let field = [], fieldData = []
			if (condiParam) {
				if (!!condiParam.sheet && !!condiParam.area) {
					const dataset = state.edcuiCompts[0].datasets || []
					let whereBean = dataset.filter(val => Object.keys(val.field || {}).length > 0 && val.area_id == condiParam.area && val.sheet_index == condiParam.sheet)
					let firstInit = true
					if (whereBean.length == 0) {//同源
						dataset.some((val, index) => {
							if (condiParam.sheet === val.sheet_index && condiParam.area === val.area_id) {
								if (afId === val.af_Id) {//判断当前区域数据集是否发生变化
									if (val.af_Id === state.edcuiCompts[0].afId) {
										let fieldList = state.edcuiCompts[0].comptAttrs.fieldList
										for (let params of fieldList) {
											if (params.type == 'ElButton') {
												continue;
											}
											const attr = params.comptAttrs
											let id = `${attr.col_id}&${attr.element_name}&${val.sheet_index}&${val.area_id}`
											try {
												if (val[id] !== undefined) {
													firstInit = false
													if (val[id]) {
														fieldData.push(params)
													}
												} else {
													const list = [...state.edcuiCompts[1].comptAttrs.tableList]
													const defData = (list.filter(val => val.sheet_index === condiParam.sheet))[0].area_info
													defData.some(val1 => {
														if (condiParam.area === val1.area_id && val1.af_Id === afId && val1.af_Id === state.edcuiCompts[0].afId) {
															fieldData.push(params)
															return true
														}
													})
												}
											} catch (e) { }
										}
										return true
									}
								} else {
									dataset.splice(index, 1)
								}
							}
						})
						if (firstInit) {
							const list = [...state.edcuiCompts[1].comptAttrs.tableList]
							const defData = list.filter(val => val.sheet_index === condiParam.sheet)
							if (defData.length > 0) {
								const firstData = defData[0].area_info
								firstData.some(val => {
									if (condiParam.area === val.area_id && val.af_Id === afId && val.af_Id === state.edcuiCompts[0].afId) {
										let fieldList = state.edcuiCompts[0].comptAttrs.fieldList
										for (let params of fieldList) {
											if (params.type == 'ElButton') {
												continue;
											}
											fieldData.push(params)
										}
										return true
									}
								})
							}
						}

					} else if (whereBean.length > 0) {//非同源
						field = whereBean[0].field
						let fieldList = state.edcuiCompts[0].comptAttrs.fieldList
						if (afId === whereBean[0].af_Id) {
							for (let params of fieldList) {
								if (params.type == 'ElButton') {
									continue;
								}
								const attr = params.comptAttrs
								let id = `${attr.col_id}&${attr.element_name}`
								if (!!field[id]) {
									field[id].isSetRequired = attr.isSetRequired
									if (attr.type == 'ElCascader' || attr.col_type == 'dat') {
										field[id].m_value = attr.m_value
										field[id].type = attr.type
										field[id].show_format = attr.show_format
										field[id].cycleType = attr.cycleType
										// field[id].source_format = attr.source_format
										field[id].timeOpr = attr.timeOpr
										field[id].timeOpr1 = attr.timeOpr1
										field[id].timeOpr2 = attr.timeOpr2
										field[id].timeOprCount = attr.timeOprCount
										field[id].timeOprCount1 = attr.timeOprCount1
										field[id].timeOprCount2 = attr.timeOprCount2
									} else if (attr.col_type == 'No.') {
										field[id].numList = attr.numList
										field[id].type = attr.type
										field[id].radioCalcu = attr.radioCalcu
									} else if (attr.col_type == 'var') {
										field[id].m_value = attr.m_value
										field[id].type = attr.type
										field[id].symbol = attr.symbol
									}
									const temp = {
										comptAttrs: field[id],
										comptSort: params.comptSort,
										type: params.type
									}
									fieldData.push(temp)
								}
							}
						} else {
							state.edcuiCompts[0].datasets.some((val, ind) => {
								if (JSON.stringify(val) == JSON.stringify(whereBean[0])) {
									state.edcuiCompts[0].datasets.splice(ind, 1)
									return true
								}
							})
						}
					}
				} else if (condiParam.area === undefined) {
					if (afId === state.edcuiCompts[0].afId) {
						let fieldList = state.edcuiCompts[0].comptAttrs.fieldList
						for (let params of fieldList) {
							if (params.type == 'ElButton') {
								continue;
							}
							fieldData.push(params)
						}
					}
				}
			}
			const cm = { type: '1003', condiParam: fieldData }
			let isQuery = rootGetters['QueryTable/isQuery']('1003', fieldData)
			try {
				state.tempData[state.tempData.length - 1].params.isQuery = isQuery
			} catch (e) {
				state.tempData[0] = {
					params: {
						isQuery
					}
				}
				if (isQuery === false) {
					Message.warning("必填字段不能为空");
					state.reportLoading = false;
				}
			}

			where_bean1 = rootGetters['QueryTable/condiCols'](cm)

			where_bean2 = rootGetters['QueryTable/datafilterCols'](pm)

			if (!!where_bean2.exp_ && !!where_bean1.exp && where_bean2.exp_ != '' && where_bean1.exp != '') {
				where_bean.exp = `(${where_bean1.exp})and(${where_bean2.exp_})`;
				where_bean.rule_list = where_bean1.rule_list.concat(where_bean2.rule_list);
			} else if (where_bean2.exp_ && where_bean2.exp_ != '') {
				where_bean.exp = where_bean2.exp_;
				where_bean.rule_list = where_bean2.rule_list;
			} else if (!!where_bean1.exp && where_bean1.exp != '') {
				where_bean.exp = where_bean1.exp;
				where_bean.rule_list = where_bean1.rule_list;
			}

			return where_bean
		},
		getPageDetails: (state, getters, rootState, rootGetters) => (flag) => {
			let param = [];
			let PageCompAfRels = [];
			let tableList = state.edcuiCompts[1].comptAttrs.tableList;
			let pageId = rootState.HomeBody.pageCache.pageId;
			let message = {}, params = {};
			for (let index in state.editableTabs) {
				let ket = state.editableTabs[index].name
				let hot = state.hotObj[ket];
				let temp = {};
				temp.pageId = pageId;
				temp.compType = "Sheet";
				let sheetId = ''
				try {
					sheetId = tableList[index].sheet_id;
				} catch (e) {
				}
				if (sheetId == null || sheetId == '') {
					sheetId = getUUID();
					// tableList[index].sheet_id = sheetId;
				}
				temp.elementId = sheetId;

				if (hot == undefined || hot == null) {
					let tableData = JSON.parse(JSON.stringify(tableList[index]));
					delete tableData.sheet_id

					//去除ElCascader 下拉数据
					tableData.area_info.forEach(info => {
						if (info.filterData) {
							info.filterData.forEach(fd => {
								if (fd.type === 'ElCascader') {
									fd.dfAreaSels = []
									fd.options = []
									delete fd.options2
								}
							})
						}
						if (info.drillData) {
							info.drillData.forEach(drill => {
								let d1 = drill.filterData || [], d2 = drill.subDrill || []
								d1.forEach(fd => {
									if (fd.type === 'ElCascader') {
										fd.dfAreaSels = []
										fd.options = []
										delete fd.options2
									}
								})
								d2.forEach(subDrill => {
									let d3 = subDrill.filterData || []
									d3.forEach(fd => {
										if (fd.type === 'ElCascader') {
											fd.dfAreaSels = []
											fd.options = []
											delete fd.options2
										}
									})
								})
							})
						}
					})

					temp.compAttrs = JSON.stringify(tableData);
				} else {
					let detail = {};
					detail.sheet_id = sheetId;
					detail.sheet_name = tableList[index].sheet_name;
					detail.sheet_index = tableList[index].sheet_index;
					detail.static_data_list = objDeepCopy(hot.getSourceData())//获取所有值
					detail.numericFormat = tableList[index].numericFormat;
					detail.merge_list = [];
					detail.condiRuleList = [];
					detail.hidden_col_list = [];
					detail.hidden_row_list = [];

					//公式错误提示
					let commonData = hot.getData()
					if (JSON.stringify(commonData) !== JSON.stringify(detail.static_data_list)) {
						for (let i in detail.static_data_list) {
							if (Object.keys(message).length > 0) { break }
							let list = detail.static_data_list[i]
							for (let j in list) {
								if (typeof list[j] === 'string' && list[j].indexOf('=') === 0 ) {
									list[j]=list[j].replace(/\'/ig, "\"");
								}
								if (typeof list[j] === 'string' && list[j].indexOf('=') === 0 && typeof commonData[i][j] === 'string' && commonData[i][j].indexOf('#') === 0) {
									message.sheetName = state.editableTabs[index].title
									message.row = parseInt(i) + 1
									try {
										message.col = HST.numToChar(j) || ''
									} catch (e) {
										message.col = `[${j},`
										message.row = `${i}]`
									}
									break
								}
							}
						}
					}
					if (Object.keys(message).length > 0) {
						if (flag !== 'preview') {
							Message.error(`${message.sheetName}的${message.col}${message.row}单元格公式存在错误，请修改`)
							return false
						} else {
							params.message = message
						}
					}

					if (hot.getPlugin('MergeCells').mergedCellsCollection !== null) {
						detail.merge_list = hot.getPlugin('MergeCells').mergedCellsCollection.mergedCells;//获取合并项目
					}

					//冻结信息
					detail.fixedColumnsLeft = tableList[index].fixedColumnsLeft;
					detail.fixedRowsTop = tableList[index].fixedRowsTop;

					//筛选信息
					detail.show_filter = tableList[index].show_filter;

					// 保存图形数据
					let chartData = objDeepCopy(tableList[index].chartData);
					if (chartData.length>0) {
						chartData.forEach(val => {
							val.comptData = {
								columns: [],
								rows: []
							}
						})
					}
					detail.chartData = chartData;

					// 获取隐藏列表
					detail.hidden_col_list = hot.getPlugin('hiddenColumns').hiddenColumns;
					detail.hidden_row_list = hot.getPlugin('hiddenRows').hiddenRows;

					let PersistentState = hot.getPlugin('PersistentState');
					//获取行高
					let ManualRowResize = hot.getPlugin('ManualRowResize');
					ManualRowResize.enablePlugin();
					ManualRowResize.saveManualRowHeights();
					let rowHeights = ManualRowResize.loadManualRowHeights();
					PersistentState.resetValue('manualRowHeights')
					detail.row_heights = rowHeights;

					//获取列宽
					let ManualColumnResize = hot.getPlugin('ManualColumnResize');
					ManualColumnResize.enablePlugin();
					ManualColumnResize.saveManualColumnWidths();
					let columnWidths = ManualColumnResize.loadManualColumnWidths();
					PersistentState.resetValue('manualColumnWidths')
					detail.column_widths = columnWidths;

					//获取样式,批注
					detail.style_list = [];
					detail.comments_list = [];
					let countCols = hot.countCols();
					let countRows = hot.countRows();
					for (let row = 0; row < countRows; row++) {
						for (let col = 0; col < countCols; col++) {
							let cell = hot.getCellMeta(row, col);
							let tempCell = {};
							if (cell.style != undefined && cell.style.length == undefined && Object.keys(cell.style).length > 0) {
								tempCell.row = cell.row;
								tempCell.col = cell.col;
								tempCell.style = cell.style;
							}
							if (cell.comment != undefined && hot.getPlugin('Comments').getCommentAtCell(row, col) !== '') {
								tempCell.row = cell.row;
								tempCell.col = cell.col;
								tempCell.comment = cell.comment;
								if (tempCell.comment.style) {
									let {height, width} = tempCell.comment.style
									if (height == 90 && width == 215) {
										delete tempCell.comment.style
									}
									// tempCell.comment.style = {
									// 	"width": 215,
									// 	"height": 90
									// }
								}
							}
							if (Object.keys(tempCell).length > 0) {
								detail.style_list.push(tempCell);
							}
						}
					}

					// 获取表格条件格式
					detail.condiRuleList = state.condiRuleList[`sheet${ket}`]

					//去除数据集数据
					let area_info = tableList[index].area_info;
					for (let i = 0, length = area_info.length; i < length; i++) {
						let info = { ...area_info[i] },
							end_x = info.end_x >= state.maxRows ? state.maxRows - 1 : info.end_x,
							end_y = info.end_y >= state.maxCols ? state.maxCols - 1 : info.end_y
						delete info['cellList']
						for (let x = info.start_x; x <= end_x; x++) {
							for (let y = info.start_y; y <= end_y; y++) {
								detail.static_data_list[x][y] = null;
							}
						}
						let newMergedCells = [];
						detail.merge_list.forEach(mergedData => {
							if (mergedData.row + mergedData.rowspan - 1 < info.start_x ||
								mergedData.row > end_x ||
								mergedData.col + mergedData.colspan - 1 < info.start_y ||
								mergedData.col > end_y
							) {
								newMergedCells.push(mergedData)
							}
						})
						detail.merge_list = newMergedCells;
						let isExis = PageCompAfRels.some(data => {
							if (data.elementId == sheetId && data.afId == info.af_Id) {
								return true
							}
						})
						if (!isExis) {
							let PageCompAfRel = {};
							PageCompAfRel.pageId = pageId;
							PageCompAfRel.elementId = sheetId;
							PageCompAfRel.afId = info.af_Id;
							PageCompAfRels.push(PageCompAfRel);
						}
					}

					//去除ElCascader 下拉数据
					area_info.forEach(info => {
						if (info.filterData) {
							info.filterData.forEach(fd => {
								if (fd.type === 'ElCascader') {
									fd.dfAreaSels = []
									fd.options = []
									delete fd.options2
								}
							})
						}
						if (info.drillData) {
							info.drillData.forEach(drill => {
								let d1 = drill.filterData || [], d2 = drill.subDrill || []
								d1.forEach(fd => {
									if (fd.type === 'ElCascader') {
										fd.dfAreaSels = []
										fd.options = []
										delete fd.options2
									}
								})
								d2.forEach(subDrill => {
									let d3 = subDrill.filterData || []
									d3.forEach(fd => {
										if (fd.type === 'ElCascader') {
											fd.dfAreaSels = []
											fd.options = []
											delete fd.options2
										}
									})
								})

							})
						}
					})
					detail.area_info = area_info;
					let detailcp = objDeepCopy(detail);
					delete detailcp.chartData;
					tableList[index] = { ...tableList[index], ...detailcp }
					delete detail.sheet_id
					temp.compAttrs = JSON.stringify(detail);
				}
				param.push(temp);
			}

			params.details = param;
			params.relative = PageCompAfRels;

			const details = params.details;

			//查询参数设置
			let temp = {};
			temp.pageId = pageId;
			temp.compType = "QuerySetting";
			let elementId = getUUID();
			temp.elementId = elementId;
			//清除报表条件数据
			let detail = JSON.parse(JSON.stringify(state.edcuiCompts[0]))
			let fieldList = detail.comptAttrs.fieldList;
			for (var k = 0; k < fieldList.length; k++) {
				delete fieldList[k].comptAttrs.switchFields
				let comptAttrs = fieldList[k].comptAttrs
				if (fieldList[k].type == "ElInput") {
					comptAttrs.m_value = comptAttrs.isSetDefault ? comptAttrs.default_value : ''
					comptAttrs.symbol = comptAttrs.defaultSymbol
				} else if (fieldList[k].type == "ElNumber") {
					let initList = (comptAttrs.numList || []).length === 2 ? [{ id: "0", m_value: "", label: 2 }, { id: "1", m_value: "", label: 2 }] : [{ id: "0", m_value: "", label: 2 }]
					let defList = comptAttrs.defaultNumList || initList
					comptAttrs.numList = comptAttrs.isSetDefault ? defList : initList
				} else if (fieldList[k].type == "ElCascader") {
					comptAttrs.m_value = comptAttrs.isSetDefault ? comptAttrs.default_value : [];
					comptAttrs["treeSelVal"] = [];//树形下拉框值清空
					delete comptAttrs.dfAreaSels
					comptAttrs.options = []
					delete comptAttrs.options2
				} else if (fieldList[k].type == "ElDatePicker") {
					let defVal = comptAttrs.cycleType == "daterange" ? comptAttrs.m_value : [(comptAttrs.m_value || [''])[0]];
					if (comptAttrs.isSetDefault == undefined || comptAttrs.isSetDefault == false) {
						defVal = comptAttrs.cycleType == "daterange" ? ["", ""] : [""];
						// comptAttrs.m_value = comptAttrs.cycleType == "daterange" ? ["", ""] : [""];
					}
					comptAttrs.m_value = defVal
				}
			}
			temp.compAttrs = JSON.stringify(detail);
			details.push(temp);
			params.details = details;
			return params;
		},
		activedArea(state) {
			let index = HST.searchCurSheet().index;
			let sub_index = HST.searchCurArea(index);
			let areaInfo = state.edcuiCompts[1].comptAttrs.tableList[index].area_info;
			return areaInfo[sub_index] || {};
		}
	},
	mutations: {
		upWarnInfo(state, data) {
			state.warnInfo = data
		},
		upWarnMessage(state, data) {
			state.warnMessage = data
		},
		upPageNameFocus(state, data) {
			state.pageNameFocus = data
		},
		upTempPageDetails(state, data) {
			state.tempPageDetails = data
		},
		upEdcuiCompts0(state, data) {
			state.edcuiCompts[0].comptAttrs = data.comptAttrs
			state.edcuiCompts[0].afId = data.afId
			state.edcuiCompts[0].datasets = data.datasets
			state.edcuiCompts[0].needSms = data.needSms
			// state.edcuiCompts[0] = data;
    },
    upIsMailTask(state, data) {
      state.isMailTask = data;
    },
    setEmailTaskDialogVis(state, data) {
      state.emailTaskDialogVis = data;
    },
    upMailTaskParam(state, data) {
      state.mailTaskParam = data;
    },
		upExportReportHisDialog(state, data) {
			state.exportReportHisDialog = data;
		},
		upExportReportDialog(state, data) {
			state.exportReportDialog = data;
		},
		upExportReportFile(state, data) {
			state.exportReportFile = data;
		},
		upRowHeightSet(state, isOpen) {
			state.rowHeightSet = isOpen;
		},
		upColWidthSet(state, isOpen) {
			state.colWidthSet = isOpen;
		},
		upRowHeight(state, data) {
			state.rowHeight = data;
		},
		upColWidth(state, data) {
			state.colWidth = data;
		},
		upQueryCriteria(state, data) {
			state.queryCriteria = data;
		},
		upAsideSign(state, data) {
			state.asideSign = data;
		},
		upHot(state, obj) {
			state.hot = obj;
		},
		upHotObj(state, obj) {
			if (obj.type == 'add') {
				state.hotObj = { ...state.hotObj, ...obj.data };
			} else if (obj.type == 'delete') {
				delete state.hotObj[obj.data]
			}
			// 多sheet，公式源码处引用
			window.hotObj = state.hotObj;
		},
		upActivedNum(state, num) {
			state.activedNum = num;
		},
		upTabIndex(state, index) {
			state.tabIndex = index;
		},
		upEditableTabs(state, data) {
			state.editableTabs = data;
			// 多sheet，公式源码处引用
			window.sheetObj = data;
		},
		upCellInput(state, data) {
			state.cellInput = data;
		},
		upCellText(state, data) {
			state.cellText = data;
		},
		upTableList(state, data) {
			state.edcuiCompts[1].comptAttrs.tableList = data;
		},
		resetTableList(state) {
			state.edcuiCompts[1].comptAttrs.tableList = state.tableListTemplate;
		},
		upLoaderSign(state, data) {
			state.loaderSign = data
		},
		upFirstLoad(state, data) {
			state.firstLoad = data
		},
		resetReportLoading(state, data) {
			state.reportLoading = data;
		},
		upSheetIndex(state, data) {
			state.sheetIndex = data
		},
		upFormatPainter(state, data) {
			state.formatPainter = data
		},
		upFmPainter(state, data) {
			state.fmPainter = data
		},
		upLeaveTab(state, data) {
			state.leaveTab = data
		},
		upBreadcrumb(state, data) {
			state.breadcrumb = data
		},
		upRefreshNum(state, data) {
			state.refreshNum = data
			state.tempRefreshNum = 0
		},
		upTempData(state, data) {
			state.tempData = data
		},
		upTempRefreshNum(state, data) {
			state.tempRefreshNum = data
		},
		upLoadingEnd(state, data) {
			state.loadingEnd = data
		},
		upShowDialogInsertFunc(state, data) {
			state.showDialogInsertFunc = data
		},
		upInsertFunc(state, data) {
			state.insertFunc = data
		},
		upHistoryData(state, data) {
			if (data.type === 'delete') {
				state.historyData.pop();
				return
			}
			//historyIndex 位置不在最后
			if (state.historyIndex !== state.historyData.length - 1) {
				state.historyData.length = state.historyIndex
			}
			if (state.historyData.length >= 20) {
				state.historyData.shift()
			}
			state.historyData.push(data)
			state.historyIndex = state.historyData.length - 1
			state.historyType = ''
		},
		upHistoryIndex(state, param) {
			if (param === 'redo') {
				state.historyIndex++
			} else {
				state.historyIndex--
			}
		},
		upHistoryType(state, data) {
			state.historyType = data
		},
		upHistoryInfoList(state, param) {
			if (param.type === 'del') {
				delete state.historyDataList[param.key]
				delete state.historyIndexList[param.key]
				delete state.historyTypeList[param.key]
				if (param.isCur) {//如果是删除当前sheet，则删除data 和index
					state.historyData = []
					state.historyIndex = -1
					state.historyType = ''
				}
			} else if (state.historyData.length > 0) {
				state.historyDataList[param.key] = state.historyData
				state.historyIndexList[param.key] = state.historyIndex
				state.historyTypeList[param.key] = state.historyType
			}
		},
		upHistoryInfo(state, key) {
			state.historyData = state.historyDataList[key] || []
			state.historyType = state.historyTypeList[key] || ''
			state.historyIndex = state.historyIndexList[key]
			if (state.historyIndexList[key] === undefined) {
				state.historyIndex = -1
			}
		},
		upManualRowHeights(state, data) {
			state.manualRowHeights = data
		},
		upManualColWidths(state, data) {
			state.manualColWidths = data
		},
		upExportParam(state, data) {
			state.exportParam = data
		},
		upMaxCols(state, data) {
			state.maxCols = data
		},
		upMaxRows(state, data) {
			state.maxRows = data
		},
		upCondiRuleList(state, param) {
			if (param.type === 'add') {
				if (!state.condiRuleList[`sheet${param.sheet}`]) {
					state.condiRuleList[`sheet${param.sheet}`] = []
				}
				state.condiRuleList[`sheet${param.sheet}`].push(param.data)
				state.condiRule = !state.condiRule
			} else if (param.type === 'reset') {
				if (param.sheet) {
					state.condiRuleList[`sheet${param.sheet}`] = param.data
				} else {
					state.condiRuleList = param.data
				}
			}
		},
		upRuleIndex(state, data) {
			state.ruleIndex = data
		},
		upShowReportSqlDialog(state, data){
			state.showReportSqlDialog = data;
		},
		upShowFilter(state, data) {
			state.showFilter = data;
		}
	},
	actions: {
		upLoaderSign({ state, commit }, data) {
			commit('upLoaderSign', data)
		},
		upFirstLoad({ state, commit }, data) {
			commit('upFirstLoad', data)
		},
		upRowHeightSet({ state, commit }, data) {
			commit('upRowHeightSet', data);
		},
		upColWidthSet({ state, commit }, data) {
			commit('upColWidthSet', data);
		},
		upRowHeight({ state, commit }, data) {
			commit('upRowHeight', data);
		},
		upColWidth({ state, commit }, data) {
			commit('upColWidth', data);
		},
		resetReportLoading({ state, commit }, data) {
			commit('resetReportLoading', data)
		},
		upFormatPainter({ commit }, data) {
			commit('upFormatPainter', data)
		},
		upFmPainter({ commit }, data) {
			commit('upFmPainter', data)
		},
		/**
		 * condiParam:条件参数字段
		 * colParam, rowParam: 结果参数字段
		 * filterParam： 数据过滤字段
		 */
		queryUpdataTable({ state, rootState, getters, dispatch }, params) { // 更新操作
			let condiParam = params.condiParam, colParam = params.colParam, rowParam = params.rowParam, needTitle = params.needTitle,
				filterData = [...(params.filterData || [])], query_type = params.query_type, hiddenDimList = params.hiddenDimList,
				drillData = params.drillData, drillParam = params.drillParam, areaId = params.areaId, autoMerge = params.autoMerge
			let col_list = [], row_list = [], order_list = []
			let af_id = ''
			colParam.map((params) => {
				af_id = params.af_id
				let temp = {
					"col_id": params.col_id,
					"nick_name": params.nick_name || params.label,
          			"element_name": params.element_name,
					"element_type": params.element_type,
					"element_id": params.element_id,
					"obj_id": params.tab_id,
					"fun_type": params.calc || params.fun_type,
					"is_calcul": params.is_calcul,
					"from_compt": params.from_compt
				}
				//日期类型字段做聚合
				if(params &&params.col_type === 'dat'){
					temp["dgw_function"] = params.dgw_function;
					temp["dgw_fun_param"] = params.dgw_fun_param;
				}
				col_list.push(temp)
				if (params.sort) {
					let order = {
						"col_id": params.col_id,
						"nick_name": params.nick_name || params.label,
						"element_id": params.element_id,
						"obj_id": params.tab_id,
						"order_type": params.sort
					}
					//日期类型字段做聚合,order也要加上聚合函数
					if(params &&params.col_type === 'dat'){
						order["dgw_function"] = params.dgw_function;
						order["dgw_fun_param"] = params.dgw_fun_param;
					}
					order_list.push(order)
				}
			})
			rowParam.map((params) => {
				af_id = params.af_id
				let temp = {
					"col_id": params.col_id,
					"nick_name": params.nick_name || params.label,
					"element_name": params.element_name,
					"element_type": params.element_type,
					"element_id": params.element_id,
					"obj_id": params.tab_id,
					"fun_type": params.calc,
					"from_compt": params.from_compt
				}
				//日期类型字段做聚合
				if(params && params.col_type === 'dat'){
					temp["dgw_function"] = params.dgw_function;
					temp["dgw_fun_param"] = params.dgw_fun_param;
				}
				row_list.push(temp)
				if (params.sort) {
					let order = {
						"col_id": params.col_id,
						"nick_name": params.nick_name || params.label,
						"element_id": params.element_id,
						"obj_id": params.tab_id,
						"order_type": params.sort
					}
					//日期类型字段做聚合,order也要加上聚合函数
					if(params && params.col_type === 'dat'){
						order["dgw_function"] = params.dgw_function;
						order["dgw_fun_param"] = params.dgw_fun_param;
					}
					order_list.push(order)
				}
			})

			//钻取参数
			let drill_list = [],
				drillDimList = [];
			if (drillData != undefined) {
				if (drillParam != undefined && drillParam.values != null && drillParam.values.length > 0) {
					//子层
					filterData = JSON.parse(JSON.stringify(filterData));
					let drillFilter = JSON.parse(JSON.stringify(drillData)),
						values = drillParam.values,
						length = values.length,
						dfData = drillFilter || [],
						index

					for (index in values) {
						let tempFilter = drillFilter,
							val = values[index].value;
						if (index != 0) {
							tempFilter = drillFilter.subDrill[index - 1]
						}
						if (tempFilter.type == "ElInput" || tempFilter.type == "ElSelect") {
							tempFilter.m_value = val
							tempFilter.symbol = 3
						} else if (tempFilter.type == "ElNumber") {
							tempFilter.numList = [{ id: "0", m_value: val, label: 3 }]
							tempFilter.symbol = 3
						} else if (tempFilter.type == "ElCascader" || tempFilter.type == "ElDatePicker") {
							tempFilter.m_value = [val]
							tempFilter.symbol = 3
						}
						filterData.push(tempFilter)
					}
					//添加下钻字段包含的过滤条件--add by yxh 20191219
					if (length != 0) {
						dfData = (dfData.subDrill[length - 1] || '').filterData || []
					} else {
						dfData = dfData.filterData || []
					}
					dfData.map(d => {
						filterData.push(d)
						return d
					})

					const doubNextData = drillData.subDrill[length];
					let nextData = {};
					for (let index = 0; index < length; index++) {
						nextData = drillData.subDrill[index] || {};
						let isExistsNextData = col_list.some(data => {
							return data.element_id == nextData.element_id
						})
						if (!isExistsNextData) {
							isExistsNextData = row_list.some(data => {
								return data.element_id == nextData.element_id
							})
						}

						const currData = values[index];
						let rowIndex, colIndex
						for (let i = 0; i < row_list.length; i++) {
							if (row_list[i].element_id == currData.element_id) {
								rowIndex = i;
								break;
							}
						}
						if (rowIndex == undefined) {
							for (let i = 0; i < col_list.length; i++) {
								if (col_list[i].element_id == currData.element_id) {
									colIndex = i;
									break;
								}
							}
						}
						if (isExistsNextData) {
							if (rowIndex != undefined) {
								row_list.splice(rowIndex, 1);
							} else if (colIndex != undefined) {
								col_list.splice(colIndex, 1);
							}
						} else {
							let temp = {
								"col_id": nextData.col_id,
								"nick_name": nextData.nick_name || nextData.label,
								"element_name": nextData.label,
								"element_type": nextData.element_type,
								"element_id": nextData.element_id,
								"obj_id": nextData.tab_id,
								"fun_type": nextData.calc
							}
							//日期类型字段做聚合
							if(nextData && nextData.col_type === 'dat'){
								temp["dgw_function"] = nextData.dgw_function;
								temp["dgw_fun_param"] = nextData.dgw_fun_param;
							}
							if (rowIndex != undefined) {
								row_list[rowIndex] = temp;
							} else if (colIndex != undefined) {
								col_list[colIndex] = temp;
							}
						}

						//删除orader
						let isExistsNextOrder = order_list.some(data => {
							return data.element_id == nextData.element_id
						})
						for (let index in order_list) {
							if (order_list[index].element_id == currData.element_id) {
								if (isExistsNextOrder) {
									order_list.splice(index, 1);
								} else {
									order_list[index].col_id = nextData.col_id;
									order_list[index].nick_name = nextData.nick_name;
									order_list[index].element_id = nextData.element_id;
									order_list[index].obj_id = nextData.obj_id;
									//日期类型字段做聚合
									if(nextData && nextData.col_type === 'dat'){
										order_list[index]["dgw_function"] = nextData.dgw_function;
										order_list[index]["dgw_fun_param"] = nextData.dgw_fun_param;
									}
								}
								break;
							}
						}
					}

					if (!!doubNextData) {
						let temp = {
							"is_translate": "0",
							"col_id": nextData.col_id,
							"nick_name": nextData.label + '_drill',
							"element_name": nextData.label + '_drill',
							"element_type": nextData.element_type,
							"element_id": nextData.element_id,
							"obj_id": nextData.tab_id
						}
						//日期类型字段做聚合
						if(nextData && nextData.col_type === 'dat'){
							temp["dgw_function"] = nextData.dgw_function;
							temp["dgw_fun_param"] = nextData.dgw_fun_param;
						}
						drill_list.push(temp);
						drillDimList.push(objDeepCopy(nextData));
					}
				} else {
					//顶层
					let keys = Object.keys(drillData);
					keys.forEach(key => {
						let data = drillData[key]
						if (data.subDrill.length > 0) {
							let temp = {
								"is_translate": "0",
								"col_id": data.col_id,
								"nick_name": data.label + '_drill',
								"element_name": data.label + '_drill',
								"element_type": data.element_type,
								"element_id": data.element_id,
								"obj_id": data.tab_id
							}
							//日期类型字段做聚合
							if(data && data.col_type === 'dat'){
								temp["dgw_function"] = data.dgw_function;
								temp["dgw_fun_param"] = data.dgw_fun_param;
							}
							drillDimList.push(objDeepCopy(data));
							drill_list.push(temp)
						}
						//添加下钻字段包含的过滤条件--add by yxh 20191219
						let dfData = data.filterData || []
						dfData.map(d => {
							return filterData.push(d)
						})
					});

				}
			}
			if (drillDimList.length > 0 && drillDimList[0].type == "ElDatePicker" && drillDimList[0].isNewCol) {//日期分层字段，需要将element_name后的括号及括号里的内容去掉
				// let cha = "(";
				// let element_name = drillDimList[0].element_name;
				// console.log(element_name);
				// drillDimList[0].element_name = element_name.substring(0,element_name.lastIndexOf(cha));
				drillDimList[0].element_name = drillDimList[0].label;
			}

			let whereBean = getters['getWhereBean'](filterData, condiParam, af_id)
			let param = {
				afQueryBean: {
					"af_id": af_id,
					"begin_date": "",
					"head_bean": {
						"pageCount": query_type == 1 ? -1 : state.maxRows,
						"start": query_type == 1 ? -1 : 1,
						"user_id": window.sessionStorage.getItem('user_id')
					},
					"is_need_log": 1,
					"is_need_paging": query_type == 1 ? 2 : 1,
					"is_force_group_by": query_type == 1 ? 1 : '',
					"is_need_permission": 1,
					"is_need_trans": 1,
					"select_list": objDeepCopy([...col_list, ...row_list, ...drill_list]),
					"where_bean": whereBean,
					"order_list": order_list,
					"isEdit": 0
				},
				needTitle: needTitle,
				query_type: query_type,
				colDimList: col_list,
				rowDimList: row_list,
				hiddenDimList: hiddenDimList,
				drillDimList: drillDimList,
				areaId: areaId,
				autoMerge: autoMerge,
				countDataField: params.countDataField,
				needTotal: params.needTotal,
				needSubTotal: params.needSubTotal,
				autofill: params.autofill,
				rename: params.rename
			}
			if (rootState.HomeBody.pageCache.operation == 'design') {
				param.drillDimList = []
			}

			let element_list = [];
			param.afQueryBean.select_list.forEach(val=>{
				val.nick_name = val.element_name;
				if(val.from_compt){
					for(let i=0;i<params.computedData.length;i++) {
						if(val.element_id == params.computedData[i].element_id) {
							let item = params.computedData[i];
							let list = item.related_fields;
							let {element_id,element_name,is_calcul,tab_id,col_fun_exp,tab_alias} = item;
							element_list.push({element_id,element_name,is_calcul,tab_id,col_fun_exp,tab_alias});
							element_list = element_list.concat(list);
						}
					}
					if(params.query_type === 2) {	//明细需要清除fun_type
						delete val.fun_type;
					}
				}
			})
			param.afQueryBean.element_list = element_list;

			// return axios.post(rootState.renderEngine + '/refreshDataSet', param)
			try {
				if (state.tempData[state.tempData.length - 1].params.isQuery === false) {
					return []
				}
			} catch (e) { }
			return service({
				maskOff: true,
				url: rootState.renderEngine + '/refreshDataSet',
				method: 'post',
				data: param
			})
		},
		setAreaData({ state, rootState, commit, dispatch }, param = {}) {
			let mesShow = true
			//获取该区域起始坐标
			let row, col, isNull = false, err = false, errMessage = '', areaName = '', areaId = ''
			if (param.start_x != undefined && param.start_y != undefined) {
				row = param.start_x
				col = param.start_y
			} else {
				let cells = state.hot.getSelected()
				row = cells[0][0]
				col = cells[0][1]
			}
			let message = ''
			let rowEnd, colEnd, columns = [], data = [],
				response = [], af_id = '', mergeList, cellList,
				dorun = (state.tempRefreshNum == 0 || state.tempRefreshNum != state.refreshNum.length)
			try {
				columns = [...param.af_col, ...param.af_row]
				response = param.response
				af_id = columns[0].af_id
			} catch (e) { }
			if (!!!param || (param.response || []).length === 0) {
				// commit('resetReportLoading', false)
				// return
				if (state.refreshNum !== -1) {
					if (state.refreshNum.length === 0 || state.refreshNum.length === state.tempRefreshNum + 1) {
						mesShow = true
						state.refreshNum = -1
						state.tempRefreshNum = 0
					} else {
						state.tempRefreshNum++
						mesShow = false
					}
				}
			} else {
				if (response.data.respResult == 1 && response.status == 200) {
					const respData = response.data.respData;
					let dataList = [], titleList = [];
					try {
						dataList = respData.result_data_list || [];
						titleList = respData.result_col_list || [];
						mergeList = respData.result_merge_list || [];
						cellList = respData.result_style_list || [];
					} catch (e) { }
					//解决无数据时度量表头不显示
					if (dataList.length === 1 && param.needTitle === true) {
						let title = []
						titleList.map(t => {
							title.push(t.col_desc)
						})
						data.push(title)
					} else {
						dataList.map(list => {
							let sub_data = []
							list.data_list.map(val => {
								sub_data.push(val.data_val)
							})
							data.push(sub_data)
						})
					}

				} else {//报错
					if (param.index != undefined) {
						//数据集全部刷新
						const index = param.index, sub_index = param.areaIndex
						if (rootState.HomeBody.pageCache.operation != 'preview') {
							state.warnInfo = `${state.warnInfo}"${state.edcuiCompts[1].comptAttrs.tableList[index].area_info[sub_index].area_name}"${response.data.respErrorDesc}`
						} else {
							state.warnInfo = `${state.warnInfo}${response.data.respErrorDesc}`
						}
						dispatch('upMessageSign')
						commit('resetReportLoading', false)
						commit('upLoadingEnd', true)
						state.warnMessage = {
							type: 'error',
							message: state.warnInfo
						}
						state.tempRefreshNum = 0
					} else {
						//数据集单个刷新
						Message.error(response.data.respErrorDesc)
						commit('resetReportLoading', false)
						commit('upLoadingEnd', true)
					}
					return
				}

				try {
					rowEnd = data.length - 1 + row
					colEnd = data[0].length - 1 + col
				} catch (e) {
					isNull = true
					rowEnd = row
					colEnd = col
				}

				let oldRow = row, oldCol = col, oldRowEnd, oldColEnd
				if (param.index != undefined) {
					//传递参数更新
					let index = param.index
					const arr = state.edcuiCompts[1].comptAttrs.tableList
					let sub_index = param.areaIndex

					//判断是否超出范围
					if (colEnd > state.maxCols - 1) {
						let val = arr[param.index].area_info[param.areaIndex]
						if (row != val.start_x || col != val.start_y) {
							state.hot.selectCell(val.start_x, val.start_y)
						}
						errMessage = "更新失败，数据区域超过设计范围"
						state.tempRefreshNum = state.refreshNum.length || 0
						err = true
					} else {
						let val = arr[index].area_info[sub_index]
						oldRow = val.start_x
						oldCol = val.start_y
						oldRowEnd = val.end_x
						oldColEnd = val.end_y
						areaId = val.area_id
						areaName = val.area_name
						state.clearList.push([oldRow, oldCol, oldRowEnd, oldColEnd])

						arr[index].area_info[sub_index].start_x = row
						arr[index].area_info[sub_index].start_y = col
						arr[index].area_info[sub_index].end_x = rowEnd
						arr[index].area_info[sub_index].end_y = colEnd
						arr[index].area_info[sub_index].cellList = cellList
						arr[index].area_info[sub_index].sql = param.response.data.respData.sql
						arr[index].area_info[sub_index].rename = param.rename || false
						state.edcuiCompts[1].comptAttrs.tableList = arr
						if (rootState.HomeBody.pageCache.operation != 'preview') {
							if (isNull) {
								state.warnInfo = state.warnInfo + `"${arr[index].area_info[sub_index].area_name}"无记录<br>`
							}
							if (param.query_type == '1') {
								if (rowEnd > state.maxRows - 1 || colEnd > state.maxCols - 1) {
									state.warnInfo = state.warnInfo + `"${arr[index].area_info[sub_index].area_name}"预览未显示全部聚合数据<br>`
								}
							} else {
								if (rowEnd > state.maxRows - 1) {
									state.warnInfo = state.warnInfo + `"${arr[index].area_info[sub_index].area_name}"共${state.maxRows - row}条，预览未显示全部数据<br>`
								}
							}
						}
					}
				} else if (dorun) {
					let sheetArray = HST.searchCurSheet()
					let index = sheetArray.index
					const arr = state.edcuiCompts[1].comptAttrs.tableList
					let val = {}
					if (index != -1) {
						let sub_index = HST.searchCurArea(index)
						if (sub_index != -1) {
							try {
								val = (arr[index] || {}).area_info[sub_index]
								row = val.start_x
								col = val.start_y
								oldRowEnd = val.end_x
								oldColEnd = val.end_y
								rowEnd = data.length - 1 + row
								colEnd = data[0].length - 1 + col
							} catch (e) {
								isNull = true
								rowEnd = row
								colEnd = col
							}
						}
					}
					//判断是否超出范围
					if (colEnd > state.maxCols - 1) {
						errMessage = "更新失败，数据区域超过设计范围"
						state.tempRefreshNum = state.refreshNum.length || 0
						err = true
					} else if (dorun) {
						if (Object.keys(val).length > 0) {
							oldRow = val.start_x
							oldCol = val.start_y
							oldRowEnd = val.end_x
							oldColEnd = val.end_y
							areaName = val.area_name
							areaId = val.area_id
							state.clearList.push([oldRow, oldCol, oldRowEnd, oldColEnd])
						}

						//选中区域更新
						if (rootState.ReportAttr.areaInfo.area_name == undefined && columns.length != 0 && param.index == undefined) {
							dispatch('validAreaName')
							rootState.ReportAttr.areaInfo = {
								'area_id': `a${rootState.ReportAttr.areaNum}`,
								'area_name': `区域${rootState.ReportAttr.areaNum}`,
								'sheet_index': sheetArray.sheetIndex
							}
							state.historyData[state.historyData.length - 1].newVal.area_id = rootState.ReportAttr.areaInfo.area_id
							state.historyData[state.historyData.length - 1].newVal.area_name = rootState.ReportAttr.areaInfo.area_name
							state.historyData[state.historyData.length - 1].newVal.af_Id = af_id
							state.historyData[state.historyData.length - 1].newVal.start_x = param.start_x || row
							state.historyData[state.historyData.length - 1].newVal.start_y = param.start_y || col
						}
						if (rootState.HomeBody.pageCache.operation != 'preview') {
							if (isNull) {
								state.warnInfo = `"${rootState.ReportAttr.areaInfo.area_name}"无记录`
							}
							if (rowEnd > state.maxRows - 1) {
								if (param.query_type == '1') {
									state.warnInfo = `"${rootState.ReportAttr.areaInfo.area_name}"预览未显示全部聚合数据`
								} else {
									state.warnInfo = `"${rootState.ReportAttr.areaInfo.area_name}"共${state.maxRows - row}条，预览未显示全部数据`
								}
							}
						}

						if (index != -1) {
							let sub_index = HST.searchCurArea(index)
							let area_info = rootState.ReportAttr.areaInfo
							if (sub_index == -1) {
								sub_index = arr[index].area_info.length
								oldRowEnd = rowEnd
								oldColEnd = colEnd
							}
							arr[index].area_info[sub_index] = {
								...area_info, ...{
									"start_x": row,
									"start_y": col,
									"end_x": rowEnd,
									"end_y": colEnd,
									"af_Id": af_id,
									"needTitle": param.needTitle,
									"af_col": param.af_col,
									"af_row": param.af_row,
									"where_bean": param.where_bean,
									"filterData": param.filterData,
									"query_type": param.query_type,
									"hideDim": param.hideDim,
									"drillData": param.drillData,
									'countDataField': param.countDataField,
									'selectCount': param.selectCount,
									'needTotal': param.needTotal,
									'autoMerge': param.autoMerge,
									"hiddenDimList": param.hiddenDimList,
									"subStyleList": param.subStyleList,
									"cellList": cellList,
									"needBorder": param.needBorder,
									"autofill": param.autofill,
									"computedData": param.computedData,
									"sql": param.response.data.respData.sql,
									"rename": param.rename || false
								}
							}
						}
						state.edcuiCompts[1].comptAttrs.tableList = arr
					}

				}
				if (!err && dorun) {
					const cols = state.hot.countCols(), rows = state.hot.countRows()
					if (rowEnd > rows) {
						if (rowEnd > state.maxRows) {
							rowEnd = state.maxRows
						}
						let p = {
							insert: 'insert_row',
							begin: rows - 1,
							number: rowEnd - rows + 5,
							totalRow: rowEnd,
							totalCol: colEnd
						}
						dispatch('insertCell', p)
					}
					if (colEnd <= state.maxCols && colEnd > cols) {
						let p = {
							insert: 'insert_col',
							begin: rows - 1,
							number: colEnd - cols + 5,
							totalRow: rowEnd,
							totalCol: colEnd
						}
						dispatch('insertCell', p)
					}
					if (!isNull) {
						let p = {
							row: row,
							col: col,
							data: data,
							rowEnd: rowEnd,
							colEnd: colEnd,
							aId: areaId,
							aName: areaName,
							curAName: param.cur_areaName,
							cellList: cellList,
							subStyleList: param.subStyleList,
							sql: param.response.data.respData.sql,
							rename: param.rename || false
						}
						state.areaList.push(p)
						state.mergeList.push([row, col, mergeList, rowEnd, colEnd, areaName == param.cur_areaName])
					} else {
						state.hot.render()
					}
				}

				let repeatArea = HST.areaRepeat()
				if (rootState.HomeBody.pageCache.operation != 'preview' && repeatArea.length > 0) {
					repeatArea.forEach(val => {
						if (message == '') {
							message += `"${val.replace(/,/ig, '"和"')}"交叠`
						} else {
							message += `<br>"${val.replace(/,/ig, '”和"')}"交叠`
						}
					})
				}
				if (param.index != undefined) {//多个区域刷新
					if (state.refreshNum !== -1) {
						if (state.refreshNum.length === 0 || state.refreshNum.length === state.tempRefreshNum + 1) {
							mesShow = true
							state.refreshNum = -1
							state.tempRefreshNum = 0
						} else {
							state.tempRefreshNum++
							mesShow = false
						}
					} else {
						let len = (state.edcuiCompts[1].comptAttrs.tableList[param.index] || {}).area_info.length - 1
						if (len !== param.areaIndex && !param.resume) {
							mesShow = false
						}
						if (param.resume) {
							state.hot.selectCell(...state.hot.getSelected()[0])
						}
					}
				}
			}
			if (mesShow || err) {
				dispatch('resertArea')
				dispatch('upMessageSign')
				if (err) {
					state.warnInfo = `${errMessage}`
					state.warnMessage = {
						type: 'error',
						message: state.warnInfo
					}
					state.tempRefreshNum = 0
				} else {
					if (message != '') {
						if (state.warnInfo != '') {
							state.warnInfo += `<br>${message}`
						} else {
							state.warnInfo += `${message}`
						}
					}
					state.warnMessage = {
						type: 'warning',
						dangerouslyUseHTMLString: true,
						message: state.warnInfo
					}
				}

			}
		},
		//重新渲染数据/合并单元格等
		resertArea({ state }) {
			let curArea

			//清除旧数据
			let params = []
			state.clearList.forEach(val => {
				params.push([val[0], val[1], val[2], val[3]])
			})
			if (params.length > 0) {
				HST.resetCellsData(params)
			}
			state.clearList = []

			//合并单元格
			let lastMergeIndex = -1
			state.mergeList.forEach((val, index) => {
				if (!val[5]) {
					HST.mergeCells(val[0], val[1], val[2], val[3], val[4])
				} else {
					lastMergeIndex = index
				}
			})
			if (lastMergeIndex != -1) {
				let val = state.mergeList[lastMergeIndex]
				HST.mergeCells(val[0], val[1], val[2], val[3], val[4])
			}
			state.mergeList = []

			//填充数据
			let index = HST.searchCurSheet().index
			let ainfo = (state.edcuiCompts[1].comptAttrs.tableList[index] || {}).area_info

			let areaInfo = []
			if (state.areaList.length > 1) {
				areaInfo = ainfo
			}
			let nameList = state.areaList.map(val => {
				if (!!val.curAName) {
					curArea = val.curAName
				}
				return val.aName
			})

			HST.cellOnClass(curArea)

			//填充数据
			let index1 = -1
			if (areaInfo.length == 0) {
				state.areaList.forEach((val, idx) => {
					if (val.aName != val.curAName) {
						HST.setAreaData(val.row, val.col, val.data, val.rowEnd, val.colEnd)
					} else {
						index1 = idx
					}
				})

			} else {
				areaInfo.forEach(ele => {
					let index = nameList.indexOf(ele.area_name)
					if (index > -1) {
						let val = state.areaList[index]
						if (val.aName != val.curAName) {
							HST.setAreaData(val.row, val.col, val.data, val.rowEnd, val.colEnd)
						} else {
							index1 = index
						}
					}
				})
			}
			if (index1 != -1) {
				let val = state.areaList[index1]
				HST.setAreaData(val.row, val.col, val.data, val.rowEnd, val.colEnd)
			}
			state.areaList = []
			state.reportLoading = false
		},
		//区域名称同名校验
		validAreaName({ state, rootState }) {
			const arr = state.edcuiCompts[1].comptAttrs.tableList
			const index = HST.searchCurSheet().index
			const info = (arr[index] || {}).area_info
			let areaNum = 1
			let areaArry = [];
			info.forEach((fo) => {
				if (fo.area_id.indexOf('a') > -1) {
					const num = parseInt(fo.area_id.replace(/a/g, ''))
					areaArry.push(num)
				}
			})
			if (areaArry.length > 0) {
				areaNum = Math.max(...areaArry) + 1
			}
			rootState.ReportAttr.areaNum = areaNum
		},
		//区域清除
		deleteArea({ state, rootState }, { index, sub_index }) {
			if (index != -1) {
				let row, col, rowEnd, colEnd,
					arr = state.edcuiCompts[1].comptAttrs.tableList,
					datas = state.edcuiCompts[0].datasets || [],
					areaInfo = arr[index].area_info[sub_index]
				if (!!!areaInfo) {
					return
				}
				const sheetName = areaInfo.sheet_name, areaName = areaInfo.area_name
				try {
					row = areaInfo.start_x
					col = areaInfo.start_y
					rowEnd = areaInfo.end_x
					colEnd = areaInfo.end_y
				} catch (e) {
					colEnd = col = rowEnd = row = -1
				}
				arr[index].area_info.splice(sub_index, 1)
				state.edcuiCompts[1].comptAttrs.tableList = arr
				HST.resetCellsData([[row, col, rowEnd, colEnd]])
				if (state.asideSign) {
					state.hot.getPlugin('Comments').removeCommentAtCell(row, col)
				}
				datas.forEach((val, i) => {
					if (val.sheet_name === sheetName && val.area_name === areaName) {
						datas.splice(i, 1)
					}
				})
			}
			rootState.ReportAttr.areaInfo = []
			rootState.ReportAttr.tableCols = []
			rootState.ReportAttr.updataSign++
		},
		updateSheetDataSet({ state, rootState, commit, dispatch }, index) {
			let sheetData = state.edcuiCompts[1].comptAttrs.tableList[index];
			if (!!sheetData && sheetData.area_info.length > 0) {
				commit('upRefreshNum', -1)
				const nullAutoFill = rootState.commonProperties.report.nullAutoFill !== '0'
				for (let i = 0, len = sheetData.area_info.length; i < len; i++) {
					state.tempData[i] = { params: { flag: false } };
				}
				for (let i = 0, len = sheetData.area_info.length; i < len; i++) {
					if (i == 0) {
						commit('resetReportLoading', true)
					}
					let hideDim = sheetData.area_info[i].hideDim == undefined ? false : sheetData.area_info[i].hideDim
					let drillData = sheetData.area_info[i].drillData
					let autofill = sheetData.area_info[i].autofill
					autofill.show = !!(nullAutoFill && autofill.show)
					sheetData.area_info[i].drillParam = {};
					let param = {
						colParam: sheetData.area_info[i].af_col,
						rowParam: sheetData.area_info[i].af_row,
						needTitle: sheetData.area_info[i].needTitle,
						filterData: [...sheetData.area_info[i].filterData],
						query_type: sheetData.area_info[i].query_type,
						hiddenDimList: hideDim ? sheetData.area_info[i].hiddenDimList : [],
						condiParam: { sheet: sheetData.sheet_index, area: sheetData.area_info[i].area_id },
						drillData: drillData,
						areaId: sheetData.area_info[i].area_id,
						autoMerge: sheetData.area_info[i].autoMerge,
						countDataField: sheetData.area_info[i].countDataField || '',
						needTotal: sheetData.area_info[i].needTotal,
						needSubTotal: sheetData.area_info[i].selectCount,
						autofill: sheetData.area_info[i].autofill,
						computedData: sheetData.area_info[i].computedData || [],
						rename: sheetData.area_info[i].rename || false,
					};
					dispatch('queryUpdataTable', param)
						.then(response => {
							let params = {
								flag: true,
								index: index,
								areaIndex: i,
								start_x: sheetData.area_info[i].start_x,
								start_y: sheetData.area_info[i].start_y,
								af_col: sheetData.area_info[i].af_col,
								af_row: sheetData.area_info[i].af_row,
								query_type: sheetData.area_info[i].query_type,
								hideDim: hideDim,
								hiddenDimList: sheetData.area_info[i].hiddenDimList || [],
								autoMerge: sheetData.area_info[i].autoMerge,
								countDataField: sheetData.area_info[i].countDataField,
								needTotal: sheetData.area_info[i].needTotal,
								selectCount: sheetData.area_info[i].selectCount,
								needTitle: sheetData.area_info[i].needTitle,
								needBorder: sheetData.area_info[i].needBorder,
								subStyleList: sheetData.area_info[i].subStyleList,
								autofill: sheetData.area_info[i].autofill,
								response: response,
								computedData: sheetData.area_info[i].computedData || [],
								rename: sheetData.area_info[i].rename || false
							}
							state.tempData[i].params = params;
							let resData = state.tempData.filter(data => {
								return !data.params.flag
							})
							//全部执行完
							if (resData == null || resData.length == 0) {
								for (let i = 0, len = state.tempData.length; i < len; i++) {
									dispatch('setAreaData', state.tempData[i].params)
								}
								state.tempData = []
								commit('upLoadingEnd', true)
							}
						})
						.catch((e) => {
							console.error("queryUpdataTable", e)
							state.tempData[i].params.flag = true;
							let resData = state.tempData.filter(data => {
								return !data.params.flag
							})
							//全部执行完
							if (resData == null || resData.length == 0) {
								for (let i = 0, len = state.tempData.length; i < len; i++) {
									dispatch('setAreaData', state.tempData[i].params)
								}
								state.tempData = []
								commit('upLoadingEnd', true)
								if (state.warnInfo !== '') {
									dispatch('upMessageSign')
									state.warnMessage = {
										type: 'warning',
										dangerouslyUseHTMLString: true,
										message: state.warnInfo
									}
									state.warnInfo = "";
								}
							}
						})
				}
			} else {
				setTimeout(() => {
					state.hot.render()
					//纯静态数据时，打开页面公式展示为ht默认的方法，不会调用改写的函数
					state.hot.getPlugin('formulas').recalculateFull()
					let value = state.hot.getSourceDataAtCell(0, 0)
					state.hot.setDataAtCell(0, 0, value)
					//end
					commit('resetReportLoading', false)
				}, 500);
			}
		},
		resizeRowColumn({ state }, index) {
			let sheetData = state.edcuiCompts[1].comptAttrs.tableList[index];
			let rowHeights = (sheetData || {}).row_heights || [];
			let columnWidths = (sheetData || {}).column_widths || [];
			let ManualRowResize = state.hot.getPlugin('ManualRowResize');
			let ManualColumnResize = state.hot.getPlugin('ManualColumnResize');
			let PersistentState = state.hot.getPlugin('PersistentState');
			let oldRowHeights = ManualRowResize.loadManualRowHeights();
			let oleColumnWidths = ManualColumnResize.loadManualColumnWidths();
			if (oldRowHeights !== undefined) {
				for (let row in oldRowHeights) {
					if (oldRowHeights[row] != null) {
						ManualRowResize.setManualSize(row, 22)
					}
				}
				PersistentState.resetValue('manualRowHeights');
			}
			if (oleColumnWidths !== undefined) {
				for (let col in oleColumnWidths) {
					if (oleColumnWidths[col] != null) {
						ManualColumnResize.setManualSize(col, 80)
					}
				}
				PersistentState.resetValue('manualColumnWidths');
			}
			for (let row = 0, length = rowHeights.length; row < length; row++) {
				if (rowHeights[row] !== null) {
					ManualRowResize.setManualSize(row, rowHeights[row])
				}
			}
			for (let col = 0, length = columnWidths.length; col < length; col++) {
				if (columnWidths[col] !== null) {
					ManualColumnResize.setManualSize(col, columnWidths[col])
				}
			}
			state.hot.render();
		},
		/**
		 *
		 * @param {
			 * insert:insert_row 插入 行、insert_col 插入列
			 * begin:插入开始位置
			 * number:插入列/行 数
			 * totalRow:最小总行数
			 * totalCol:最小总列数
			 *
			 * }
		 */
		insertCell({ state }, param) {
			state.hot.alter(param.insert, param.begin, param.number)
			state.hot.updateSettings({
				minRows: param.totalRow,
				minCols: param.totalCol
			})
		},
		upMessageSign({ state }) {
			state.messageSign = !state.messageSign
		},
		upFmlPanelShow({ state }, data) {
			state.fmlPanelShow = data
		},
		upFmlPopoverShow({ state }, data) {
			state.fmlPopoverShow = data
		},
		doExportReport({ state, rootState, getters, rootGetters, commit }, params) {
			let tableList = state.edcuiCompts[1].comptAttrs.tableList
			// let ifDrill = tableList.some(tl => {
			// 	return tl.area_info.some(af => af.drillData && af.drillData.length > 0 && af.drillData[0].subDrill && af.drillData[0].subDrill.length > 0);
			// });
			// if (ifDrill && state.exportParam.type !== 'drill') {
			// 	commit('upExportReportDialog', true)
			// 	commit('upExportReportFile', true)
			// 	return
			// }

			commit('resetReportLoading', true)
			let whereBeans = [];
			let currSheetId = HST.searchCurSheet().sheetId;
			if (state.exportParam.radio != 1) {
				tableList = tableList.filter(data => {
					return data.sheet_id == currSheetId;
				})
			}
			for (let index = 0, length = tableList.length; index < length; index++) {
				let sheetId = tableList[index].sheet_id;
				let area_info = tableList[index].area_info;
				for (let i = 0, length = area_info.length; i < length; i++) {
					let condiParam = {
						sheet: tableList[index].sheet_index,
						area: area_info[i].area_id
					};


					//add by yxh 20191219
					let drillData = area_info[i].drillData || [],
						drillFilterData = [],// subDfData,
						drill_where_list = [],
						where_bean = {},
						where_bean1 = {}
					if (drillData.length === 0) {

						// where_bean = this.getWhereBean()(area_info[i].filterData, condiParam, area_info[i].af_Id)
						where_bean = getters['getWhereBean'](area_info[i].filterData, condiParam, area_info[i].af_Id)
						where_bean1 = { ...where_bean }
					} else {
						drillData.map(d => {
							drillFilterData = d.filterData || []
							where_bean = getters['getWhereBean']([...area_info[i].filterData, ...drillFilterData], condiParam, area_info[i].af_Id)
							if (d.subDrill) {
								d.subDrill.map(sd => {
									const pm = { type: '1003', filterData: [...(sd.filterData || [])], separator: 'df' },
										where_bean2 = rootGetters['QueryTable/datafilterCols'](pm) || [],
										drill_where_bean = { ...where_bean1 }
									if (!!where_bean2.exp_ && !!drill_where_bean.exp && where_bean2.exp_ != '' && drill_where_bean.exp != '') {
										drill_where_bean.exp = `(${drill_where_bean.exp})and(${where_bean2.exp_})`;
										drill_where_bean.rule_list = drill_where_bean.rule_list.concat(where_bean2.rule_list);
									} else if (where_bean2.exp_ && where_bean2.exp_ != '') {
										drill_where_bean.exp = where_bean2.exp_;
										drill_where_bean.rule_list = where_bean2.rule_list;
									} else if (!!drill_where_bean.exp && drill_where_bean.exp != '') {
										drill_where_bean.exp = drill_where_bean.exp;
										drill_where_bean.rule_list = drill_where_bean.rule_list;
									}
									drill_where_list.push(drill_where_bean)
								})
							}
							return drillFilterData
						})
					}

					whereBeans.push({
						sheetId: sheetId,
						afId: area_info[i].af_Id,
						areaId: area_info[i].area_id,
						WhereBean: where_bean,
						drillParam: area_info[i].drillParam,
						drillWhereList: drill_where_list
					});
				}
			}

			let queryWhere = {
				export_info: {
					export_type: state.exportParam.radio,
					export_sheet_id: currSheetId
				},
				WhereInfoList: whereBeans
			};
			let param = {
				pageId: rootState.HomeBody.pageCache.pageId,
				queryWhere: JSON.stringify(queryWhere),
				srlId: rootState.compt.smsId
			};
			if (params) {
				param.smsInfo = params
      }
      if (state.isMailTask) {
        state.mailTaskParam = param;
        state.emailTaskDialogVis = true;
        // rootState.compt.exportDialog = false
        commit('resetReportLoading', false)
        return;
      }
			service({
				maskOff: true,
				url: rootState.renderEngine + "/pageExport/addReportExportInfo",
				method: "post",
				data: param,
				headers: {
					"X-UserId": window.sessionStorage.getItem("user_id")
					// "X-SystemId": this.defaultSystemId
				}
			}).then(val => {
				commit('resetReportLoading', false)
				if (val.status === 200 && val.data.respResult === "1") {
					commit('upExportReportHisDialog', true)
					Message.success("页面导出请求成功");
					rootState.compt.exportDialog = false
				} else {
					Message.error("导出失败:" + val.data.respErrorDesc);
				}
			})
				.catch(err => {
					commit('resetReportLoading', false)
					// Message.error("导出失败");
				});
		},
		/** resize handsontableInput width */
		resizeWidth({ state }, value) {
			const active = state.hot.getActiveEditor()
			let spanObj = active.TEXTAREA_PARENT.querySelector('.htSpan')

			if (spanObj !== null) {
				spanObj.innerText = value
			} else {
				let node = document.createTextNode(value),
					para = document.createElement('span')
				para.appendChild(node)
				para.style.height = 0
				para.style.opacity = 0
				para.className = 'htSpan'
				active.TEXTAREA_PARENT.appendChild(para)
				spanObj = para
			}
			let width = spanObj.offsetWidth,
				args = active.TEXTAREA.value
			active.TEXTAREA.style.width = `${width + 5}px`
			active.TEXTAREA.style.display = 'block'
			active.state = "STATE_WAITING"
			active.TEXTAREA.focus()
			active.TEXTAREA.setSelectionRange(args.length - 1, args.length - 1)
		},
		insertFunc({ state, commit, dispatch }, args) {
			const active = state.hot.getActiveEditor()
			active.state = "STATE_EDITING"
			if (Array.from(active.TEXTAREA_PARENT.classList).indexOf('ht_editor_hidden') > -1 && active.fml !== true && active.isfocus !== false) {
				active.TEXTAREA.removeAttribute('readOnly')
				// HST.fireKeyEvent(active.TD, "keydown", 32);
				// HST.fireKeyEvent(active.TD, "keypress", 32);
				// HST.fireKeyEvent(active.TD, "keyup", 32);
				active.TEXTAREA_PARENT.hidden = false
				active.TEXTAREA_PARENT.classList.remove('ht_editor_hidden')
				active.TEXTAREA_PARENT.classList.add('ht_clone_master')
				active.TEXTAREA_PARENT.style.opacity = 1
				active.TEXTAREA.style.width = 'auto'
				active.TEXTAREA.innerText = args
				active.TEXTAREA.value = args
				active.TEXTAREA.focus()
				active.TEXTAREA.setSelectionRange(args.length - 1, args.length - 1)
				active.originalValue = args
				active._fullEditMode = true
				active._opened = true
				active.state = "STATE_EDITING"
				active.TEXTAREA_PARENT.parentElement.querySelector('.wtBorder.current.corner').style.display = 'none'
				dispatch('resizeWidth', args)
				commit('upCellText', args)
				dispatch('upFmlPopoverShow', true)
				commit('upInsertFunc', true)
			} else {
				if (active.TEXTAREA.innerText.indexOf('=') !== 0 && active.TEXTAREA.value.indexOf('=') !== 0 && active.isfocus !== false) {
					active.TEXTAREA.style.display = "block"
					active.TEXTAREA.removeAttribute('readOnly')
					active.TEXTAREA.style.width = 'auto'
					active.TEXTAREA.innerText = args
					active.TEXTAREA.value = args
					active.TEXTAREA.focus()
					active.TEXTAREA.setSelectionRange(args.length - 1, args.length - 1)
					dispatch('resizeWidth', args)
					commit('upCellText', args)
					commit('upInsertFunc', true)
				} else {
					active.TEXTAREA.value = state.cellText
					active.TD.innerText = state.cellText
					state.hot.selectCell(active.row, active.col)
					dispatch('upFmlPopoverShow', false)
					dispatch('upFmlPanelShow', false)
				}
			}
		},
		/** redo undo */
		history({ state, dispatch }) {
			let data = state.historyData[state.historyIndex] || {}
			switch (data.type) {
				case 'style':
					dispatch('historyStyle', data)
					break;
				case 'merge':
					dispatch('historyMerge', data)
					break;
				case 'fmPainer':
					dispatch('historyFmPainer', data)
					break;
				case 'numFormat':
					dispatch('historyNumFormat', data)
					break;
				case 'removeCol':
				case 'removeRow':
					dispatch('historyRemoveCell', data)
					break;
				case 'insertCol':
				case 'insertRow':
					dispatch('historyInsertCell', data)
					break;
				case 'resizeRowHeight':
				case 'resizeColWidth':
					dispatch('historyResizeCell', data)
					break;
				case 'resetSite':
					dispatch('historyResetSite', data)
					break;
				case 'reorder':
					dispatch('historyReOrderArea', data)
					break;
				case 'dropArea':
					dispatch('historyDropArea', data)
					break;
				case 'updateArea':
					dispatch('historyUpdateArea', data)
					break;
				case 'edit':
					dispatch('historyCellEdit', data)
					break;
				case 'paste':
					dispatch('historyPaste', data)
					break;
				case 'cut':
					dispatch('historyCut', data)
					break;
				case 'autoFill':
					dispatch('historyAutoFill', data)
					break;
				case 'commentsRemove':
				case 'commentsAdd':
					dispatch('historyComments', data)
					break;
				case 'commentEdit':
					dispatch('historyCommentEdit', data)
					break;
				case 'condiRule':
					dispatch('historyCondiRule', data)
					break;
				case 'fixed':
					dispatch('historyFixed', data)
					break;
                case 'hiderow':
                    dispatch('historyHideRow', data)
                    break;
                case 'hidecol':
                    dispatch('historyHideCol', data)
                    break;
                case 'showrow':
                    dispatch('historyShowRow', data)
                    break;
                case 'showcol':
                    dispatch('historyShowCol', data)
					break;
				case 'dragresize':
					dispatch('historyDragResize', data)
					break;
				default:
					break;
			}
		},
		historyStyle({ state }, data) {
			const hot = state.hot,
				cells = data.cells,
				styleObj = state.historyType === 'redo' ? data.newVal : data.origVal

			cells.map((cell, index) => {
				let range = cell, ilen = 0, jlen = 0

				if (range[2] < range[0]) {
					[range[0], range[2]] = [range[2], range[0]];
				}
				if (range[3] < range[1]) {
					[range[1], range[3]] = [range[3], range[1]];
				}
				ilen = range[2] - range[0]
				jlen = range[3] - range[1]
				for (let i = 0; i <= ilen; i++) {
					for (let j = 0; j <= jlen; j++) {
						let sty = {}
						try {
							if (data.type === 'cut') {
								let oldStyle = hot.getCellMeta(range[0] + i, range[1] + j).style
								sty = styleObj[index][i * (jlen + 1) + j] || {}
								if (i === 0 || j === 0) {
									sty = { ...oldStyle, ...sty }
								}
							} else {
								sty = styleObj[index][i * (jlen + 1) + j] || {}
							}
							hot.setCellMeta(range[0] + i, range[1] + j, 'style', sty)
							let keys = Object.keys(sty), cssText = ''
							keys.map(k => {
								cssText += `${k}:${sty[k]};`
							})
							hot.getCell(range[0] + i, range[1] + j).style.cssText = cssText
						} catch (e) { }
					}
				}
			})
			HST.getCellStyle();
		},
		historyMerge({ state }, data) {
			const cells = data.cells
			let ismerge = state.historyType === 'redo' ? data.ismerge : !data.ismerge
			if (data.type === 'paste') {
				ismerge = data.ismerge
			}
			let mergeObj = state.hot.getPlugin("MergeCells")
			if (data.type === 'merge') {
				if (ismerge) {
					cells.map(cell => {
						mergeObj.mergeSelection(cell);
					})
				} else {
					cells.map(cell => {
						mergeObj.unmergeSelection(cell);
					})
				}
			} else if (data.type === 'paste') {
				let merCell = state.hot.getSelectedRangeLast()
				if (ismerge) {
					cells.map(cell => {
						let [r1, c1, r2, c2] = cell
						merCell.from.row = r1
						merCell.from.col = c1
						merCell.highlight.row = r1
						merCell.highlight.col = c1
						merCell.to.row = r2
						merCell.to.col = c2
						mergeObj.mergeSelection(merCell);
					})
				} else {
					cells.map(cell => {
						let [r1, c1, r2, c2] = cell
						merCell.from.row = r1
						merCell.from.col = c1
						merCell.highlight.row = r1
						merCell.highlight.col = c1
						merCell.to.row = r2
						merCell.to.col = c2
						mergeObj.unmergeSelection(merCell);
					})
				}

			} else { // 格式刷,刪除行列...
				let mergeCell = (state.historyType === 'undo' ? data.origCell : data.newCell)
				if (['fmPainer','autoFill'].includes(data.type)) {
					let [r1, c1, r2, c2] = cells[0],
						unmerCell = { from: { row: r1 + 1, col: c1 + 1 }, to: { row: r2, col: c2 } }
					mergeObj.unmergeSelection(unmerCell);
				}
				(mergeCell || []).forEach(cell => {
					const	merCell = state.hot.getSelectedRangeLast()
					let { col, colspan, row, rowspan } = cell
					try {
						if ([] instanceof Array) {
							[row, col, rowspan, colspan] = cell
							rowspan = rowspan - row + 1
							colspan = colspan - col + 1
						}
					} catch(e) { }
					merCell.from.row = row
					merCell.from.col = col
					merCell.highlight.row = row
					merCell.highlight.col = col
					merCell.to.row = row + rowspan - 1
					merCell.to.col = col + colspan - 1
					mergeObj.mergeSelection(merCell);
				})
			}

		},
		historyNumFormat({ state }, data) {
			let formatObj = data.origVal, cells = data.cells
			if (state.historyType === 'redo') {
				formatObj = data.newVal
				cells = []
			}
			HST.numFormatSetting(formatObj, false, cells)
		},
		historyFmPainer({ dispatch }, data) {
			if (!!data.fmMergeObj) {
				const param = { ...data.fmMergeObj, cells: data.cells, type: data.type }
				dispatch('historyMerge', param)
			}
			if (!!data.fmStyleObj) {
				const param = {
					...data.fmStyleObj,
					cells: data.cells
				}
				dispatch('historyStyle', param)
			}
			if (!!data.fmNumFormatObj) {
				const param = { ...data.fmNumFormatObj, cells: data.cells }
				dispatch('historyNumFormat', param)
			}
			if (!!data.ruleObj) {
				dispatch('historyCondiRule',data.ruleObj)
			}
		},
		historyRemoveCell({ state, dispatch }, data) {
			const alterCell = data.alterCell
			let redoAction = 'remove_col',
				undoAction = 'insert_col'
			if (['insertRow', 'removeRow'].includes(data.type)) {
				redoAction = 'remove_row'
				undoAction = 'insert_row'
			}
			if (state.historyType === 'redo') {
				//刪除行列
				state.hot.alter(redoAction, alterCell)
			} else {
				//插入行列
				alterCell.map(cell => {
					state.hot.alter(undoAction, ...cell)
				})

				if (!!data.fmStyleObj) {
					dispatch('historyRemoveCellStyle', data.fmStyleObj.origVal)
				}
				if (!!data.fmMergeObj) {
					const param = {
						...data.fmMergeObj,
						cells: data.cells
					}
					dispatch('historyMerge', param)
				}
				if (!!data.fmData) {
					let param = {
						data: data.fmData,
						cells: data.cells
					}
					dispatch('historySetData', param)
				}
				if (!!data.commentsObj) {
					dispatch('historyComments', data.commentsObj)
				}
			}
		},
		historyRemoveCellStyle({ state }, styleObj) {
			const keys = Object.keys(styleObj)
			keys.forEach(k => {
				let [i, j] = k.split('.'), sty = {}
				try {
					sty = styleObj[k] || {}
				} catch (e) { }
				state.hot.setCellMeta(i, j, 'style', sty)
				let ks = Object.keys(sty), cssText = ''
				ks.map(k => {
					cssText += `${k}:${sty[k]};`
				})
				if (!!state.hot.getCell(i, j)) {
					state.hot.getCell(i, j).style.cssText = cssText
				}
			})
			HST.getCellStyle();
		},
		historySetData({ state }, param) {
			const { data, cells } = param
			data.map((d, index) => {
				if (d.join().replace(/\,|\s/g, '') !== "") {
					let [rr, cc] = cells[index]
					state.hot.populateFromArray(rr, cc, d)
				}
			})
		},
		historyInsertCell({ state }, param) {
			let alterCell = param.alterCell,
				undoAction = 'remove_col',
				redoAction = 'insert_col'
			if (param.type === 'insertRow') {
				undoAction = 'remove_row'
				redoAction = 'insert_row'
			}
			if (state.historyType === 'undo') {
				state.hot.alter(undoAction, alterCell)
			} else {
				alterCell.map(cell => {
					state.hot.alter(redoAction, ...cell)
				})
				state.hot.selectCells(param.coords, false);
			}
		},
		historyResizeCell({ state }, param) {
			let size = state.historyType === 'undo' ? param.origVal : param.newVal,
				cells = param.cells,
				manualResize = 'ManualColumnResize'
			if (param.type === 'resizeRowHeight') {
				manualResize = 'ManualRowResize'
			}
			let manualInstance = state.hot.getPlugin(manualResize)
			if (state.historyType === 'undo') {
				cells.map((cell, index) => {
					let cur_col, end
					if (param.type === 'resizeRowHeight') {
						[cur_col, , end] = cell
					} else {
						[, cur_col, , end] = cell
					}
					for (let i = cur_col, j = 0; i <= end; i++ , j++) {
						manualInstance.setManualSize(i, size[index][j]);

					}
				})
			} else {
				cells.map(cell => {
					let cur_col, end
					if (param.type === 'resizeRowHeight') {
						[cur_col, , end] = cell
					} else {
						[, cur_col, , end] = cell
					}
					for (let i = cur_col; i <= end; i++) {
						manualInstance.setManualSize(i, size);
					}
				})
			}
			setTimeout(function () {
				state.hot.render();
			}, 0);
		},
		//区域位置移动
		historyResetSite({ state, dispatch }, data) {
			let [newVal, origVal] = [data.newSite, data.origSite]
			if (state.historyType === 'undo') {
				//合并单元格操作
				if (!!data.origCell) {
					const param = {
						origCell: data.origCell,
						cells: [],
						type: data.type
					}
					dispatch('historyMerge', param)
				}
				[newVal, origVal] = [data.origSite, data.newSite]
			}
			//调用main.vue 移动区域方法
			const param = {
				type: data.type,
				name: data.areaName,
				newVal,
				origVal
			}
			state.areaChangeFlag = param
		},
		//区域层级
		historyReOrderArea({ state }, data) {
			let param = { ...data }
			if (state.historyType === 'undo') {
				param.sort = param.sort === 'lower' ? 'up' : 'lower'
			} else {
				if (param.sort === 'lower') {
					param.index--
				} else {
					param.index++
				}
			}
			//调用main.vue 移动区域层级方法
			state.areaChangeFlag = param
		},
		historyDropArea({ state, dispatch }, data) {
			let condiData, datasets
			if (state.historyType === 'undo') {
				condiData = data.condiData.origVal
				datasets = data.datasets.origVal
			} else {
				condiData = data.condiData.newVal
				datasets = data.datasets.newVal
			}
			if (!!condiData && condiData.length > 2) {
				state.edcuiCompts[0].comptAttrs.fieldList = objDeepCopy(condiData)
				state.edcuiCompts[0].afId = condiData[2].comptAttrs.af_id
			} else if (state.edcuiCompts[0].comptAttrs.fieldList.length > 2) {
				state.edcuiCompts[0].comptAttrs.fieldList.splice(2)
			}
			if (datasets.length > 0) {
				state.edcuiCompts[0].datasets = objDeepCopy(datasets)
			} else {
				delete state.edcuiCompts[0].datasets
			}
			if (state.historyType === 'undo') {
				state.areaChangeFlag = data
			} else {
				let { index, sub_index } = data
				dispatch('deleteArea', { index, sub_index })
				state.areaChangeFlag = {}
			}
		},
		historyUpdateArea({ state, dispatch }, data) {
			let { index, sub_index } = data
			if (sub_index === undefined) {
				sub_index = state.edcuiCompts[1].comptAttrs.tableList[index].area_info.length - 1
				sub_index === -1 ? sub_index = 0 : ''
			}
			let param = {
				index: index,
				sub_index: sub_index,
				type: data.type
			}, condiData, datasets
			let c = []
			if (state.historyType === 'undo') {
				param.areaInfo = data.origVal
				condiData = data.condiData.origVal
				datasets = data.datasets.origVal
				let val = data.newVal
				c = [val.start_x, val.start_y, val.end_x, val.end_y]
			} else {
				param.areaInfo = data.newVal
				condiData = data.condiData.newVal
				datasets = data.datasets.newVal
				let val = data.origVal || {}
				c = [val.start_x, val.start_y, val.end_x, val.end_y]
			}
			//清除数据
			if (data.origVal !== undefined) {
				dispatch('clearCellData', c)
			}
			if (!!condiData && condiData.length > 2) {
				state.edcuiCompts[0].afId = condiData[2].comptAttrs.af_id
				state.edcuiCompts[0].comptAttrs.fieldList = objDeepCopy(condiData)
				state.edcuiCompts[0].datasets = objDeepCopy(datasets)
			} else if (state.edcuiCompts[0].comptAttrs.fieldList.length > 2) {
				state.edcuiCompts[0].comptAttrs.fieldList.splice(2)
				delete state.edcuiCompts[0].datasets
			}
			if (param.areaInfo === undefined) {
				dispatch('deleteArea', { index, sub_index })
				state.areaChangeFlag = {}
			} else {
				// dispatch('deleteArea', { index, sub_index })
				state.edcuiCompts[1].comptAttrs.tableList[index].area_info[sub_index] = objDeepCopy(param.areaInfo)
				state.areaChangeFlag = param
			}
			if (state.historyType === 'undo' && !!data.cells) {
				let p = {
					data: data.staticData,
					cells: data.cells
				}
				dispatch('historySetData', p)
			}
		},
		historyCellEdit({ state, dispatch }, data) {
			let arr = state.historyType === 'undo' ? data.origVal : data.newVal,
				[row, col] = data.cells
			state.hot.populateFromArray(row, col, [[arr]])
		},
		historyPaste({ state, dispatch }, param) {
			//数据
			let arr = state.historyType === 'undo' ? param.data.origVal : param.data.newVal, parm = {}
			param.cells.forEach((cell, index) => {
				const [row, col] = cell
				state.hot.populateFromArray(row, col, arr[index])
			})

			//样式 param.styleObj
			let cls = []
			cls = param.cells.map(c => {
				let [c0, c1, c2, c3] = c
				c0--
				c1--
				return [c0, c1, c2, c3]
			})
			parm = {
				type: param.type,
				...param.styleObj,
				cells: cls
			}
			dispatch('historyStyle', parm)

			//合并单元格 param.mergeObj
			let mergeObj = state.historyType === 'undo' ? param.mergeObj.origCell : param.mergeObj.newCell,
				ismerge = true
			if (mergeObj.length === 0 && state.historyType === 'undo') {
				mergeObj = param.mergeObj.newCell
				ismerge = false
			}
			parm = { cells: mergeObj, ismerge, type: param.type }
			dispatch('historyMerge', parm)

			//数据格式 param.numFormatObj
			parm = {
				...param.numFormatObj,
				cells: []
			}
			dispatch('historyNumFormat', parm)
			if (!!param.commentObj) {
				dispatch('historyComments',param.commentObj)
			}
			if (!!param.ruleObj) {
				dispatch('historyCondiRule',param.ruleObj)
			}
		},
		historyCut({ state, dispatch }, param) {
			//数据
			if (state.historyType === 'undo') {
				let arr = param.data.origVal
				param.cells.forEach((cell, index) => {
					const [row, col] = cell
					state.hot.populateFromArray(row, col, arr[index])
				})
			}

			//样式 param.styleObj, redo 时处理数据
			let cls = [], newVal = []
			cls = param.cells.map((c, i) => {
				let [c0, c1, c2, c3] = c,
					index = (c2 - c0 + 1) * (c3 - c1 + 1),
					str = '{},'
				str = '[' + str.repeat(index).replace(/\,$/, '') + ']';
				newVal.push(JSON.parse(str));
				//空数据构造
				if (state.historyType === 'redo') {
					dispatch('clearCellData', c)
				}
				c0--
				c1--
				return [c0, c1, c2, c3]
			})
			let parm = {
				type: param.type,
				...param.styleObj,
				newVal,
				cells: cls
			}
			dispatch('historyStyle', parm)

			//合并单元格 param.mergeObj
			let mergeObj = param.mergeObj.origCell,
				ismerge = true
			if (state.historyType === 'redo') {
				ismerge = false
			}
			parm = { cells: mergeObj, ismerge, type: 'paste' }
			dispatch('historyMerge', parm)
			// 批注
			if (!!param.commentObj) {
				dispatch('historyComments',param.commentObj)
			}
			if (!!param.ruleObj) {
				dispatch('historyCondiRule',param.ruleObj)
			}
		},
		historyAutoFill({ state, dispatch }, param) {
			const data = state.historyType === 'undo' ? param.origVal:param.newVal
			let	[c0, c1, c2, c3] = param.cells

			/* 样式 */
			const stylus = param.stylus
			Promise.resolve().then(val => {
				if (!!stylus.fmStyleObj) {
					const param = {
						...stylus.fmStyleObj,
						cells: stylus.cells
					}
					dispatch('historyStyle', param)
				}
				if (!!stylus.fmNumFormatObj) {
					const param = { ...stylus.fmNumFormatObj, cells: stylus.cells }
					dispatch('historyNumFormat', param)
				}
				if (!!stylus.ruleObj) {
					dispatch('historyCondiRule',stylus.ruleObj)
				}
			}).then(val => {
				if (!!stylus.fmMergeObj) {
					const param = { ...stylus.fmMergeObj, cells: stylus.cells, type: stylus.type }
					dispatch('historyMerge', param)
				}
			}).then(() => {
				state.hot.populateFromArray(c0, c1, data, c2, c3)
			})
			/* end */
		},
		historyComments({ state, dispatch }, param) {
			if (param.type === 'commentsAdd') {
				let comments = state.hot.getPlugin('Comments')
				if (state.historyType === 'undo') {
					comments.removeCommentAtCell(...param.cells)
				} else {
					comments.setCommentAtCell(...param.cells, '')
				}
			} else {
				let data, cells, data2,cells2
				if(param.type === 'paste') {
					data = param.newVal
					cells = param.newCells
					data2 = param.origVal
					cells2 = param.origCells
					if(state.historyType === 'undo') {
						[data, cells, data2, cells2] = [data2, cells2, data, cells]
					}
				} else {
					if(state.historyType === 'undo') {
						data = param.origVal
						cells = param.cells
						cells2 = []
					} else {
						data = param.newVal
						cells2 = param.cells
					}
				}
				let comments = state.hot.getPlugin('Comments')
					cells2.forEach(val => {
						let [i, j] = val
						comments.removeCommentAtCell(i, j)
					})
					data.forEach((val, i) => {
						let [row, col] = cells[i]
						comments.setCommentAtCell(row, col, val.value)
						comments.updateCommentMeta(row, col, val)
					})
			}
		},
		historyCommentEdit({ state, dispatch }, param) {
			let comments = state.hot.getPlugin('Comments')
			let val = state.historyType === 'undo' ? param.commentObj.origVal: param.commentObj.newVal
			let [row, col] = param.cells
			comments.setCommentAtCell(row, col, val.value)
			comments.updateCommentMeta(row, col, val)
		},
		historyCondiRule({ state, commit }, param) {
			param = JSON.parse(JSON.stringify(param))
			const {origVal, newVal, sheet} = param
			let [data1, data2] = [[...origVal], [...newVal]]
			if (state.historyType === 'redo') {
				[data1, data2] = [data2, data1]
			}
			let data = {
				type: 'reset',
				sheet: sheet,
				data: data1
			}
			commit('upCondiRuleList', data)
			HST.condiRuleClass({type: 'edit',data: data2})
		},
		historyFixed({ state, dispatch }, param) {
			let index = HST.searchCurSheet().index
			let tableList = (state.edcuiCompts[1].comptAttrs.tableList[index] || {});
			state.hot.updateSettings({
				fixedRowsTop: param.origVal.fixedRowsTop,
				fixedColumnsLeft: param.origVal.fixedColumnsLeft
			})
			tableList.fixedRowsTop = param.origVal.fixedRowsTop;
			tableList.fixedColumnsLeft = param.origVal.fixedColumnsLeft;
		},
		clearCellData({ state }, cell) {
			let [c0, c1, c2, c3] = cell
			let str = 'null,'
			str = '[' + str.repeat(c3 - c1 + 1).replace(/\,$/, '') + '],';
			str = '[' + str.repeat(c2 - c0 + 1).replace(/\,$/, '') + ']';
			state.hot.populateFromArray(c0, c1, JSON.parse(str))
		},
		historyHideRow({ state }, data) {
			state.hot.getPlugin('hiddenRows').showRows(data.origVal);
			state.hot.render();
		},
		historyHideCol({ state }, data) {
			state.hot.getPlugin('hiddenColumns').showColumns(data.origVal);
			state.hot.render();
		},
		historyShowRow({ state }, data) {
			state.hot.getPlugin('hiddenRows').hideRows(data.origVal);
			state.hot.render();
		},
		historyShowCol({ state }, data) {
			state.hot.getPlugin('hiddenColumns').hideColumns(data.origVal);
			state.hot.render();
		},
		historyDragResize({state}, data) {
			let list = JSON.parse(data.origVal.str);
			let index = HST.searchCurSheet().index;
			let charts = state.edcuiCompts[1].comptAttrs.tableList[index].chartData;
			if(charts.length>0) {
				charts.forEach(val => {
					for(let i=0; i<list.length; i++) {
						if(val.comptId === list[i].comptId) {
							val.blockInfo = list[i].blockInfo;
							break;
						}
					}
				})
			}
		},
		getChartData({rootState}, param) {
			return service({
				maskOff: true,
				url: rootState.renderEngine + '/dataTrans/reportData',
				method: 'post',
				data: param
			})
		}
	},
}
export default ReportMgt
