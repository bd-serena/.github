import axios from 'axios';
import {service} from 'ngbd-utils'
import {getTimeFromOffset, objDeepCopy} from "../../../utils/comonFunc";

const QueryTable = {
  namespaced: true,
  state: {
    resetBtnShow: false,
    wrap: false,
    wordCount: 6,
    radioCycle: 'year',
    colValue: '',
    condiData: [],
    filterData: [],//过滤器数据
    hasTotaled: false,
    isTotal: false,
    tableCols: [],
    isChangeCalc: false,
    datasChange: false,
    filterCols: [],
    allTablesData: [],
    allColsData: [],
    orderList: [],
    loaderSign: false,//判断s_edcuiCompts是否加载完成
    batchDialogVisible: false,
    dimList: [],
    msuList: [],
    queryType: 'list',  //list-清单，summarize-汇总
    tabTag: 'false',
    historyData: [], //查询历史数据
    selectAf: '',
    totalChange: false,
    isTotalOnly: false, //是否只单独进行合计的查询而不一起坐表数据的查询
    exportType: '', //导出类型：1：无，2：excel，3：txt，5：csv
    selLoadCnt: 0 ,//即席下拉框组件下拉选项加载状态  要等下拉框数据都查回来再去掉遮罩
    dbName:''//数据库名称
  },
  getters: {
    getAllColsData(state, getters, rootState, rootGetters) {//字段信息
      const result = []
      return result
    },
    totalChange(state, getters, rootState, rootGetters) {
      return state.totalChange;
    },
    isChangeCalc(state, getters, rootState, rootGetters) {
      return state.isChangeCalc;
    },
    datasChange(state, getters, rootState, rootGetters) {
      return state.datasChange;
    },
    /**
     * param: '1003': 报表工具，其他：即席查询
     */
    condiCols: (state, getters, rootState, rootGetters) => param => {//查询条件字段
      let condiParam = rootState.compt.s_edcuiCompts[0].comptAttrs.fieldList
      if (!!param && param.type === '1003') {
        condiParam = param.condiParam
      }
      let rule_list = [], exp = [], index = 1
      for (var params of condiParam) {
        if (params.type == 'ElButton') {
          continue;
        }
        if (params.comptAttrs.is_import) {  //如果是导入字段
          if (params.comptAttrs.import_tabName != "" && params.comptAttrs.import_symbol != "") {
            var compt = params.comptAttrs;
            var colList = [{col_id: 'col'}];
            var ruleValue = {tab_sechema: state.dbName, tab_name: compt.import_tabName, col_list: colList};
            var temp = {
              "col_id": compt.col_id,
              "col_type": '2',
              "exp_id": "exp" + index + "$",
              "is_dim": "0",
              "symbol": compt.import_symbol,//100:包含，101:剔除
              "rule_value": JSON.stringify(ruleValue),
              "obj_id": compt.tab_id,
              "element_id": compt.element_id
            }
            var ex = "exp" + index + "$";
            rule_list.push(temp);
            index++;
            if (exp.length == 0) {
              exp.push(ex)
            } else {
              exp.push(" and " + ex)
            }
          }
          continue;
        }
        if (params.comptAttrs.m_value && (params.comptAttrs.m_value != '' || params.comptAttrs.m_value.length > 0) && params.comptAttrs.type != "ElNumber") {
          let temp = {}, ex = ""
          if (params.comptAttrs.type == "ElInput") {//模糊搜索
            let symbol = params.comptAttrs.symbol || '-1'
            if (symbol != -1) {
              var value = params.comptAttrs.m_value;
              // if (symbol == 9 || symbol == 21) {
              //   value = null;
              // }
              temp = {
                "col_id": params.comptAttrs.col_id,
                "col_type": '2',
                "exp_id": "exp" + index + "$",
                "is_dim": "0",
                "symbol": symbol,//10:like,11:not like,8in =,9 not in ,20 为空，21 不为空
                "rule_value": value,
                "obj_id": params.comptAttrs.tab_id,
                "element_id": params.comptAttrs.element_id
              }
              ex = "exp" + index + "$"
              rule_list.push(temp)
            }
          } else if (params.comptAttrs.type == "ElSelect") {//下拉树
            temp = {
              "col_id": params.comptAttrs.col_id,
              "col_type": '2',
              "exp_id": "exp" + i + "$",
              "is_dim": "1",
              "symbol": 3,//=
              "rule_value": params.comptAttrs.m_value,
              "obj_id": params.comptAttrs.tab_id,
              "element_id": params.comptAttrs.element_id
            }
            ex = "exp" + index + "$"
            rule_list.push(temp)
          } else if (params.comptAttrs.type == "ElDatePicker") {//日期
            //报表第一次加载时日期框组件还没加载完成，导致日期出错
            if (rootState.ReportMgt.firstLoad === true && !!param && param.type === '1003') {
              let item = params.comptAttrs;
              rootState.ReportMgt.firstLoad = false
              let suffix = "";
              let paramObj = [{type: 0, index: 0}]
              if (item.cycleType === "daterange") {
                paramObj = [{type: 1, index: 0}, {type: 1, index: 1}]
              }
              paramObj.forEach(obj => {
                if (obj.type == 1) {
                  suffix = obj.index == 0 ? "1" : "2";
                }
                let offset = 0;
                if ((item["timeOprCount" + suffix] || 0) != "") {
                  offset = item["timeOpr" + suffix] == 2 ? "-" + item["timeOprCount" + suffix] : item["timeOprCount" + suffix];
                  offset = parseInt(offset);
                }
                let time = getTimeFromOffset(item.show_format, offset);
                if (item.m_value[obj.index] || item.m_value[obj.index] === 0) {
                  item.m_value[obj.index] = time
                }
              })
            }
            if (params.comptAttrs.cycleType == 'daterange') {//区间  params.comptAttrs.m_value.length > 1
              value = params.comptAttrs.m_value[0]
              // value = value.substring(0,params.comptAttrs.show_format.length);
              // if (typeof (value) == "string") {
              //   value = value.replace(/-/g, '')
              // } else if (value) {
              //   try {
              //     value = value.toLocaleDateString().replace(/-/g, '')
              //   } catch (e) { }
              // }

              if (value) {
                temp = {
                  "col_id": params.comptAttrs.col_id,
                  "col_type": '2',
                  "exp_id": "exp" + index + "$",
                  "is_dim": "0",
                  "symbol": 5,//>=
                  "rule_value": value,
                  "obj_id": params.comptAttrs.tab_id,
                  "element_id": params.comptAttrs.element_id,
                  "format": params.comptAttrs.source_format,
                  "target_format": params.comptAttrs.show_format
                }
                //时间格式的查询,如果源时间格式非YYYY,YYYY格式的查询需要补月01传给后台，否则后台to_date('2019','YYYY')的时间为2019年当年月1号
                if (temp.format && temp.format.toLowerCase() != 'yyyy' && temp.target_format && temp.target_format.toLowerCase() === 'yyyy') {
                  let split = temp.format.indexOf("/") > -1 ? "/" : (temp.format.indexOf("-") > -1 ? "-" : "");
                  temp.target_format = 'yyyy' + split + 'MM';
                  temp.rule_value += (split + '01');
                }
                rule_list.push(temp)
                ex = "(exp" + index++ + "$ and exp" + index + "$)"
              }

              value = params.comptAttrs.m_value[1]
              // value = value.substring(0,params.comptAttrs.show_format.length);
              // if (typeof (value) == "string") {
              //   value = value.replace(/-/g, '')
              // } else if (value) {
              //   try {
              //     value = value.toLocaleDateString().replace(/-/g, '')
              //   } catch (e) { }
              // }
              // value.map(function(val,i){
              //   if(i == 0){
              //     value = val
              //   }else{
              //     value += val.padStart(2,"0")
              //   }
              // })
              if (value) {
                temp = {
                  "col_id": params.comptAttrs.col_id,
                  "col_type": '2',
                  "exp_id": "exp" + index + "$",
                  "is_dim": "0",
                  "symbol": 4,//<=
                  "rule_value": value,
                  "obj_id": params.comptAttrs.tab_id,
                  "element_id": params.comptAttrs.element_id,
                  "format": params.comptAttrs.source_format,
                  "target_format": params.comptAttrs.show_format
                }
                //时间格式的查询,如果源时间格式非YYYY,YYYY格式的查询需要补月01传给后台，否则后台to_date('2019','YYYY')的时间为2019年当年月1号
                if (temp.rule_value && temp.format !== temp.target_format) {
                  temp.rule_value = getTimeFromOffset(temp.target_format, 1, value)
                  temp.symbol = 1;//<
                  if (temp.format && temp.format.toLowerCase() != 'yyyy' && temp.target_format.toLowerCase() === 'yyyy') {
                    var split1 = temp.format.indexOf("/") > -1 ? "/" : (temp.format.indexOf("-") > -1 ? "-" : "");
                    temp.target_format = 'yyyy' + split1 + 'MM';
                    temp.rule_value += (split1 + '01');
                  }
                }
                if (ex == "") {
                  ex = "exp" + index + "$"
                }
                rule_list.push(temp)


              } else if (ex != '') {
                ex = "exp" + (index - 1) + "$"
              }
            } else {
              let value = params.comptAttrs.m_value[0];
              // value = value.substring(0,params.comptAttrs.show_format.length);
              // if (typeof (value) == "string") {
              //   value = value.replace(/-/g, '')
              // } else if (value) {
              //   try {
              //     value = value.toLocaleDateString().replace(/-/g, '')
              //   } catch (e) { }
              // }

              if (value) {
                temp = {
                  "col_id": params.comptAttrs.col_id,
                  "col_type": '2',
                  "exp_id": "exp" + index + "$",
                  "is_dim": "0",
                  "symbol": 3,//=
                  "rule_value": value,
                  "obj_id": params.comptAttrs.tab_id,
                  "element_id": params.comptAttrs.element_id,
                  "format": params.comptAttrs.source_format,
                  "target_format": params.comptAttrs.show_format
                }
                rule_list.push(temp)
                ex = "exp" + index + "$"
              }
              //非区间格式，如果是目标格式和源格式不一致则构造区间，大于等于第一个参数，小于第二个参数，第二个参数比第一个参数偏移量为1
              if (value && params.comptAttrs.source_format.length != params.comptAttrs.show_format.length) {
                rule_list[rule_list.length - 1].symbol = 5;
                ex = "(exp" + index++ + "$ and exp" + index + "$)"

                value = params.comptAttrs.m_value[0];
                value = getTimeFromOffset(params.comptAttrs.show_format, 1, value);
                if (value) {
                  temp = {
                    "col_id": params.comptAttrs.col_id,
                    "col_type": '2',
                    "exp_id": "exp" + index + "$",
                    "is_dim": "0",
                    "symbol": 1,//<
                    "rule_value": value,
                    "obj_id": params.comptAttrs.tab_id,
                    "element_id": params.comptAttrs.element_id,
                    "format": params.comptAttrs.source_format,
                    "target_format": params.comptAttrs.show_format
                  }
                  //时间格式的查询,如果源时间格式非YYYY,YYYY格式的查询需要补月01传给后台，否则后台to_date('2019','YYYY')的时间为2019年当年月1号
                  if (params.comptAttrs.source_format && params.comptAttrs.source_format.toLowerCase() != 'yyyy' && params.comptAttrs.show_format && params.comptAttrs.show_format.toLowerCase() === 'yyyy') {
                    var split = temp.format.indexOf("/") > -1 ? "/" : (temp.format.indexOf("-") > -1 ? "-" : "");
                    temp.target_format = 'yyyy' + split + 'MM';
                    temp.rule_value += (split + '01');
                    rule_list[rule_list.length - 1].target_format = 'yyyy' + split + 'MM';
                    rule_list[rule_list.length - 1].rule_value += (split + '01');
                  }
                  if (ex == "") {
                    ex = "exp" + index + "$"
                  }
                  rule_list.push(temp)
                } else if (ex != '') {
                  ex = "exp" + (index - 1) + "$"
                }
              }
            }
          } else if (params.comptAttrs.type == "ElCascader") {//维层
            let value = "";
            try {
              value = params.comptAttrs.m_value.join(",");
            } catch (e) {
            }
            temp = {
              "col_id": params.comptAttrs.col_id,
              "col_type": '2',
              "exp_id": "exp" + index + "$",
              "is_dim": "1",
              "symbol": 8,//in
              "rule_value": value,
              "obj_id": params.comptAttrs.tab_id,
              "element_id": params.comptAttrs.element_id
            }
            ex = "exp" + index + "$"
            rule_list.push(temp)
          }
          index++
          if (ex && ex != '') {
            if (exp.length == 0) {
              exp.push(ex)
            } else {
              exp.push("and " + ex)
            }
          }
        } else if (params.comptAttrs.numList && params.comptAttrs.type == "ElNumber") {//数字类型
          let label = -1
          if (params.comptAttrs.numList.length > 1) {//区间
            //radioCalcu and or
            let ex = "", radioCalcu = params.comptAttrs.radioCalcu || ""
            //两个条件都有
            if (params.comptAttrs.numList[0].label != undefined && params.comptAttrs.numList[1].label != undefined) {
              label = params.comptAttrs.numList[0].label
              if (label != -1) {
                let temp = {
                  "col_id": params.comptAttrs.col_id,
                  "col_type": '2',
                  "exp_id": "exp" + index + "$",
                  "is_dim": "0",
                  "symbol": label,
                  "rule_value": params.comptAttrs.numList[0].m_value,
                  "obj_id": params.comptAttrs.tab_id,
                  "element_id": params.comptAttrs.element_id
                }
                rule_list.push(temp)
              }
              label = params.comptAttrs.numList[1].label
              if (label != -1) {
                let temp = {
                  "col_id": params.comptAttrs.col_id,
                  "col_type": '2',
                  "exp_id": "exp" + (index + 1) + "$",
                  "is_dim": "0",
                  "symbol": label,
                  "rule_value": params.comptAttrs.numList[1].m_value,
                  "obj_id": params.comptAttrs.tab_id,
                  "element_id": params.comptAttrs.element_id
                }
                rule_list.push(temp)
              }
              ex = "(exp" + index++ + "$ " + radioCalcu + " exp" + index++ + "$)"
            } else if ((params.comptAttrs.numList[0].label != undefined && params.comptAttrs.numList[0].m_value != "") || (params.comptAttrs.numList[1].label != undefined && params.comptAttrs.numList[1].m_value != "")) {
              let i = 0
              //数字的第二项有选项且 input框有值
              if (params.comptAttrs.numList[1].label != undefined && params.comptAttrs.numList[1].m_value != "") {
                i = 1
              }
              label = params.comptAttrs.numList[i].label
              if (label != -1) {
                let temp = {
                  "col_id": params.comptAttrs.col_id,
                  "col_type": '2',
                  "exp_id": "exp" + index + "$",
                  "is_dim": "0",
                  "symbol": label,
                  "rule_value": params.comptAttrs.numList[i].m_value,
                  "obj_id": params.comptAttrs.tab_id,
                  "element_id": params.comptAttrs.element_id
                }
                // console.log("temp::",temp)
                rule_list.push(temp)
              }
              ex = "exp" + index++ + "$"
            }

            if (exp.length == 0) {
              exp.push(ex)
            } else {
              exp.push(" and " + ex)
            }

          } else {
            if (params.comptAttrs.numList[0].label != undefined)
              label = params.comptAttrs.numList[0].label
            if (label != -1) {
              let temp = {
                "col_id": params.comptAttrs.col_id,
                "col_type": '2',
                "exp_id": "exp" + index + "$",
                "is_dim": "0",
                "symbol": label,//
                "rule_value": params.comptAttrs.numList[0].m_value,
                "obj_id": params.comptAttrs.tab_id,
                "element_id": params.comptAttrs.element_id
              }
              //多个字段但是 数字类型 为且时
              rule_list.push(temp)
              if (exp.length == 0) {
                exp.push("exp" + index + "$")
              } else {
                exp.push(" and exp" + index + "$")
              }
              index++
            }
          }
        } else if (params.comptAttrs.symbol != -1) {
          if (params.comptAttrs.type == "ElInput") {//模糊搜索
            let symbol = params.comptAttrs.symbol || '-1'
            if (symbol != -1) {
              let value = params.comptAttrs.m_value;
              if (symbol == 21) {
                value = null;
              } else if (symbol == 20) {
                value = null;
              }
              let temp = {
                "col_id": params.comptAttrs.col_id,
                "col_type": '2',
                "exp_id": "exp" + index + "$",
                "is_dim": "0",
                "symbol": symbol,//10:like,11:not like,8in =,9 not in ,20 为空，21 不为空
                "rule_value": value,
                "obj_id": params.comptAttrs.tab_id,
                "element_id": params.comptAttrs.element_id
              }
              rule_list.push(temp)
              if (exp.length == 0) {
                exp.push("exp" + index + "$")
              } else {
                exp.push(" and exp" + index + "$")
              }
            }
            index++
          }
        }
      }
      exp = exp.join(" ")
      let where_bean = {
        "exp": exp,
        "rule_list": rule_list
      }
      return where_bean
    },
    /**
     * type: 1003 报表工具，其他：即席查询
     */
    datafilterCols: (state, getters, rootState, rootGetters) => param => {//过滤条件字段
      let condiParam = state.filterData,
        separator = ''
      if (param != undefined && param.type === '1003') {
        separator = param.separator || ''
        if (!!param.filterData) {
          condiParam = param.filterData
        } else {
          condiParam = rootState.ReportAttr.filterData;
        }
      }
      let rule_list = [], exp_ = [], index = 1;
      if (condiParam !== undefined && condiParam.length > 0) {
        condiParam.map(function (params) {
          if (params.type == 'ElButton') {
            return false
          }
          if (params.m_value && (params.m_value != '' || params.m_value.length > 0) && params.type != "ElNumber") {
            let temp = {}, ex = ""
            if (params.type == "ElInput") {//模糊搜索
              let symbol = params.symbol || '-1'
              if (symbol != -1) {
                var value = params.m_value;
                // if (symbol == 9 || symbol == 21) {
                //   value = null;
                // }
                temp = {
                  "col_id": params.col_id,
                  "col_type": '2',
                  "exp_id": "exp_" + separator + index + "$",
                  "is_dim": "0",
                  "symbol": symbol,//10:like,11:not like,8in =,9 not in ,20 为空，21 不为空
                  "rule_value": value,
                  "obj_id": params.tab_id,
                  "element_id": params.element_id
                }
                ex = "exp_" + separator + index + "$"
                rule_list.push(temp)
              }
            } else if (params.type == "ElSelect") {//下拉树
              temp = {
                "col_id": params.comptAttrs.col_id,
                "col_type": '2',
                "exp_id": "exp_" + separator + i + "$",
                "is_dim": "1",
                "symbol": 3,//=
                "rule_value": params.comptAttrs.m_value,
                "obj_id": params.comptAttrs.tab_id,
                "element_id": params.comptAttrs.element_id
              }
              ex = "exp_" + separator + index + "$"
              rule_list.push(temp)
            } else if (params.type == "ElDatePicker") {//日期
              if (params.isSetDefault) {
                let suffix = "";
                let paramObj = [{type: 1, index: 0}, {type: 1, index: 1}]
                paramObj.forEach(obj => {
                  if (obj.type == 1) {
                    suffix = obj.index == 0 ? "1" : "2";
                  }
                  let offset = 0;
                  if ((params["timeOprCount" + suffix] || 0) != "") {
                    offset = params["timeOpr" + suffix] == 2 ? "-" + params["timeOprCount" + suffix] : params["timeOprCount" + suffix];
                    offset = parseInt(offset);
                  }
                  let time = getTimeFromOffset(params.show_format, offset);
                  if (params.m_value[obj.index] || params.m_value[obj.index] === 0) {
                    params.m_value[obj.index] = time
                  }
                })
              }
              if (params.m_value.length > 1) {//区间
                value = params.m_value[0];
                if (value) {
                  temp = {
                    "col_id": params.col_id,
                    "col_type": '2',
                    "exp_id": "exp_" + separator + index + "$",
                    "is_dim": "0",
                    "symbol": 5,//>=
                    "rule_value": value,
                    "obj_id": params.tab_id,
                    "element_id": params.element_id,
                    "format": params.source_format,
                    "target_format": params.show_format
                  }
                  var splits = temp.format.indexOf('/') > -1 ? '/' : (temp.format.indexOf('-') > -1 ? '-' : '')
                  //时间格式的查询,如果源时间格式非YYYY,YYYY格式的查询需要补月传给后台，否则后台to_date('2019','YYYY')的时间为2019年当年月1号
                  if (params.source_format !== 'yyyy' && params.show_format === 'yyyy') {
                    temp.target_format = 'yyyy'+ splits +'MM';
                    temp.rule_value += (splits + '01');
                  }
                  rule_list.push(temp)
                  ex = "(exp_" + separator + index++ + "$ and exp_" + index + "$)"
                }
                value = params.m_value[1]
                if (value) {
                  temp = {
                    "col_id": params.col_id,
                    "col_type": '2',
                    "exp_id": "exp_" + separator + index + "$",
                    "is_dim": "0",
                    "symbol": 4,//<=
                    "rule_value": value,
                    "obj_id": params.tab_id,
                    "element_id": params.element_id,
                    "format": params.source_format,
                    "target_format": params.show_format
                  }
                  if (ex == "") {
                    ex = "exp_" + separator + index + "$"
                  }
                  //如果源时间格式和目标时间格式不一致，>= m_value[0] < m_value[0]+1
                  if(temp.rule_value && temp.format !== temp.target_format){
                    temp.rule_value = getTimeFromOffset(temp.target_format, 1, value)
                    temp.symbol = 1;//<
                    //时间格式的查询,如果源时间格式非YYYY,YYYY格式的查询需要补月传给后台，否则后台to_date('2019','YYYY')的时间为2019年当年月1号
                    if (temp.format !== 'yyyy' && temp.target_format === 'yyyy') {
                      let splits = temp.format.indexOf('/') > -1 ? '/' : (temp.format.indexOf('-') > -1 ? '-' : '')
                      temp.target_format = 'yyyy' + splits + 'MM';
                      temp.rule_value += (splits + '01');
                    }
                  }
                  rule_list.push(temp);
                } else if (ex != '') {
                  ex = "exp_" + separator + (index - 1) + "$"
                }
              } else {
                let value = params.m_value[0];
                // if (typeof (value) == "string") {
                //   value = value.replace(/-/g, '')
                // } else if (value) {
                //   try {
                //     value = value.toLocaleDateString().replace(/-/g, '')
                //   } catch (e) { }
                // }

                if (value) {
                  temp = {
                    "col_id": params.col_id,
                    "col_type": '2',
                    "exp_id": "exp_" + separator + index + "$",
                    "is_dim": "0",
                    // "symbol": 5,//>=
                    "symbol": 3,//= 时间类型部位区间，用等号
                    "rule_value": value,
                    "obj_id": params.tab_id,
                    "element_id": params.element_id,
                    "format": params.source_format,
                    "target_format": params.show_format
                  }
                  rule_list.push(temp);
                  ex = "exp_" + separator + index + "$"
                  //如果目标格式和原时间格式不一致，要构造区间
                  if(temp.rule_value && temp.format !== temp.target_format){
                    let temp2 = objDeepCopy(temp)
                    temp.symbol = 5;//>=
                    temp2.symbol = 1;//<
                    temp2.rule_value = getTimeFromOffset(temp.target_format, 1, temp.rule_value);
                    let exp2 = "exp_" + separator + (++index) + "$";
                    temp2.exp_id = exp2;
                    //时间格式的查询,如果源时间格式非YYYY,YYYY格式的查询需要补月传给后台，否则后台to_date('2019','YYYY')的时间为2019年当年月1号
                    if (params.source_format != 'yyyy' && params.show_format === 'yyyy') {
                      var split = temp.format.indexOf('/') > -1 ? '/' : (temp.format.indexOf('-') > -1 ? '-' : '')
                      temp2.target_format = 'yyyy' + split + 'MM'
                      temp2.rule_value  += (split + '01');
                      temp.target_format = 'yyyy' + split + 'MM'
                      temp.rule_value  += (split + '01');
                    }
                    rule_list.push(temp2);
                    ex = "(" + ex + " and " + exp2 + ")"
                  }

                }
              }
            } else if (params.type == "ElCascader") {//维层
              let value = "";
              try {
                value = params.m_value.join(",");
              } catch (e) {
              }
              temp = {
                "col_id": params.col_id,
                "col_type": '2',
                "exp_id": "exp_" + separator + index + "$",
                "is_dim": "1",
                "symbol": 8,//in
                "rule_value": value,
                "obj_id": params.tab_id,
                "element_id": params.element_id
              }
              ex = "exp_" + separator + index + "$"
              rule_list.push(temp)
            }
            index++
            if (ex && ex != '') {
              if (exp_.length == 0) {
                exp_.push(ex)
              } else {
                exp_.push("and " + ex)
              }
            }
          } else if (params.numList && params.type == "ElNumber") {//数字类型
            let label = -1
            // if (params.numList.length > 1) { //区间
            if (params.radioCalcu != '0') { //区间
              //radioCalcu and or
              let ex = "", radioCalcu = params.radioCalcu || ""
              //两个条件都有 // && params.numList[0].m_value != ""   && params.numList[1].m_value != ""
              if (params.numList[0].label != undefined && params.numList[1].label != undefined) {
                label = params.numList[0].label
                if (label != -1) {
                  let temp = {
                    "col_id": params.col_id,
                    "col_type": '2',
                    "exp_id": "exp_" + separator + index + "$",
                    "is_dim": "0",
                    "symbol": label,
                    "rule_value": params.numList[0].m_value,
                    "obj_id": params.tab_id,
                    "element_id": params.element_id
                  }
                  rule_list.push(temp)
                }
                label = params.numList[1].label
                if (label != -1) {
                  let temp = {
                    "col_id": params.col_id,
                    "col_type": '2',
                    "exp_id": "exp_" + separator + (index + 1) + "$",
                    "is_dim": "0",
                    "symbol": label,
                    "rule_value": params.numList[1].m_value,
                    "obj_id": params.tab_id,
                    "element_id": params.element_id
                  }
                  rule_list.push(temp)
                }
                ex = "(exp_" + separator + index++ + "$ " + radioCalcu + " exp_" + separator + index++ + "$)"
              // } else if ((params.numList[0].label != undefined && params.numList[0].m_value != "") || (params.numList[1].label != undefined && params.numList[1].m_value != "")) {
              } else if (params.numList[0].label != undefined || params.numList[1].label != undefined) {
                let i = 0
                if ((params.numList[1].label != undefined && params.numList[1].m_value != "") || (params.numList[1].label == 20 || params.numList[1].label == 21)) {
                  i = 1
                }
                label = params.numList[i].label
                if (label != -1) {
                  let temp = {
                    "col_id": params.col_id,
                    "col_type": '2',
                    "exp_id": "exp_" + separator + index + "$",
                    "is_dim": "0",
                    "symbol": label,
                    "rule_value": params.numList[i].m_value,
                    "obj_id": params.tab_id,
                    "element_id": params.element_id
                  }
                  rule_list.push(temp)
                }
                ex = "exp_" + separator + index++ + "$"
              }

              if (exp_.length == 0) {
                exp_.push(ex)
              } else {
                exp_.push(" and " + ex)
              }

            } else {
              if (params.numList[0].label != undefined)
                label = params.numList[0].label
              if (label != -1) {
                let temp = {
                  "col_id": params.col_id,
                  "col_type": '2',
                  "exp_id": "exp_" + separator + index + "$",
                  "is_dim": "0",
                  "symbol": label,//
                  "rule_value": params.numList[0].m_value,
                  "obj_id": params.tab_id,
                  "element_id": params.element_id
                }
                rule_list.push(temp)
                if (exp_.length == 0) {
                  exp_.push("exp_" + separator + index + "$")
                } else {
                  exp_.push(" and exp_" + separator + index + "$")
                }
                index++
              }
            }
          } else if (params.symbol != -1) {
            if (params.type == "ElInput") {//模糊搜索
              let symbol = params.symbol || '-1'
              if (symbol != -1) {
                let value = params.m_value;
                if (symbol == 21) {
                  value = null;
                } else if (symbol == 20) {
                  value = null;
                }
                var temp = {
                  "col_id": params.col_id,
                  "col_type": '2',
                  "exp_id": "exp_" + separator + index + "$",
                  "is_dim": "0",
                  "symbol": symbol,//10:like,11:not like,8in =,9 not in ,20 为空，21 不为空
                  "rule_value": value,
                  "obj_id": params.tab_id,
                  "element_id": params.element_id
                }
                rule_list.push(temp)
                if (exp_.length == 0) {
                  exp_.push("exp_" + separator + index + "$")
                } else {
                  exp_.push(" and exp_" + separator + index + "$")
                }
              }
              index++
            }
          }
        })
      }
      exp_ = exp_.join(" ")
      let where_bean = {
        "exp_": exp_,
        "rule_list": rule_list
      }
      return where_bean;
    },
    resultCols(state, getters, rootState, rootGetters) {//查询结果参数
      let resParam = [];
      let af_id = "", select_list = [], order_list = [];
      if (rootState.HomeBody.pageCache && rootState.HomeBody.pageCache.operation == "cpreview") {//直接预览
        console.info("222");
        resParam = rootState.compt.s_edcuiCompts[1].comptAttrs.columns
        resParam.map(function (params) {
          af_id = params.af_id
          let temp = {
            "col_id": params.prop,
            "nick_name": params.nick_name || params.label,
            "element_name": params.element_name,
            "element_type": params.element_type,
            "element_id": params.element_id,
            "obj_id": params.obj_id,
            "col_type": params.col_type,
            "align": params.align,
            "dot": params.dot,
            "numType": params.numType,
            "calcAttr": params.calcAttr,
            "sort": params.sort,
            "show_format": params.show_format,
            "width": params.width,
            "formatLevel": params.formatLevel,
            "isNewCol": params.isNewCol
          }
          select_list.push(temp)

          //排序参数
          if (params.sort) {
            order_list.push({
              "obj_id": params.obj_id,
              "col_id": params.prop,
              "order_type": params.sort,
              "element_id": params.element_id
            })
          }
        })
      } else {
        resParam = state.tableCols
        resParam.map(function (params) {
          af_id = params.af_id
          let temp = {
            "col_id": params.col_id || params.prop,
            "nick_name": params.nick_name || params.label,
            "element_name": params.element_name,
            "element_type": params.element_type,
            "element_id": params.element_id,
            "obj_id": params.tab_id || params.obj_id,
            "col_type": params.col_type,
            "align": params.align,
            "dot": params.dot,
            "numType": params.numType,
            "calcAttr": params.calcAttr,
            "sort": params.sort,
            "show_format": params.show_format,
            "width": params.width,
            "formatLevel": params.formatLevel,
            "isNewCol": params.isNewCol
          }
          if (params.col_type === 'dat') {
            temp['dgw_function'] = params.dgw_function;
            temp['dgw_fun_param'] = params.dgw_fun_param;
          }
          select_list.push(temp)

          //排序参数
          if (params.sort) {
            let orderTemp = {
              "obj_id": params.tab_id,
              "col_id": params.col_id,
              "order_type": params.sort,
              "element_id": params.element_id
            }
            if (params.col_type === 'dat') {
              orderTemp['dgw_function'] = params.dgw_function;
              orderTemp['dgw_fun_param'] = params.dgw_fun_param;
            }
            order_list.push(orderTemp);
          }
        })
      }

      let pageSize = 10
      let currentPage = 0
      if (rootState.compt.s_edcuiCompts[1].comptAttrs.pagination) {
        pageSize = rootState.compt.s_edcuiCompts[1].comptAttrs.pagination.pageSize
        currentPage = rootState.compt.s_edcuiCompts[1].comptAttrs.pagination.currentPage
      }
      let cols = {
        select_list: select_list,
        af_id: af_id,
        pageSize: pageSize,
        currentPage: currentPage,
        order_list: order_list
      }
      return cols
    },
    isTotal(state, getters, rootState, rootGetters) {
      return state.isTotal;
    },
    colValue(state, getters, rootState, rootGetters) {
      return state.colValue;
    },
    tableColumn(state, getters) {
      var column = [];
      var colList = [];
      if (state.queryType == 'list') {
        colList = getters.resultCols.select_list || [];
      } else if (state.queryType == 'summarize') {
        colList = getters.summarizeCols || [];
      }
      var afId = getters.resultCols.af_id;
      for (var i = 0; i < colList.length; i++) {
        var temp = {
          label: colList[i].nick_name,
          element_name: colList[i].element_name,
          element_id: colList[i].element_id,
          element_type: colList[i].element_type,
          prop: colList[i].col_id,
          dim_id: colList[i].dim_id,
          af_id: afId,
          obj_id: colList[i].obj_id,
          col_type: colList[i].col_type,
          align: colList[i].align,
          dot: colList[i].dot,
          numType: colList[i].numType,
          calcAttr:
            typeof (colList[i].calcAttr) != 'undefined' ? colList[i].calcAttr :
              (colList[i].element_type == '2' ? 2 : ""),
          calcAttrBak:
            typeof (colList[i].calcAttr) != 'undefined' ? colList[i].calcAttr :
              (colList[i].element_type == '2' ? 2 : ""),
          sort: colList[i].sort,
          show_type: colList[i].show_type,
          show_format: colList[i].show_format,
          "show-overflow-tooltip": true,
          width: colList[i].width,
          formatLevel: colList[i].formatLevel,
          isNewCol: colList[i].isNewCol
        };
        //为字段添加is_calcul属性
        for(let j=0;j<state.tableCols.length;j++) {
          if(colList[i].element_id == state.tableCols[j].element_id) {
            temp.is_calcul = state.tableCols[j].is_calcul;
            break;
          }
        }
        column.push(temp);
      }
      return column;
    },
    summarizeCols(state, getters) {
      var list = {}, result = [];
      state.dimList.forEach(function (val) {
        list[val.id] = val.fun_type == null ? "" : val.fun_type;
      });
      state.msuList.forEach(function (val) {
        list[val.id] = val.fun_type == null ? "" : val.fun_type;
      });
      var selectList = JSON.parse(JSON.stringify(getters.resultCols.select_list));
      selectList.forEach(function (val) {
        if (list[val.element_name] != null) {
          if (list[val.element_name] != "") {
            val["fun_type"] = list[val.element_name];
            // val.fun_type=list[val.element_name];
          }
          // 汇总状态列设置要重置为初始状态
          // val.nick_name = val.element_name;
          val.nick_name = val.nick_name;
          //汇总状态列对齐方式重置为默认的
          val.align =
            val.col_type == "No."
              ? (val.dim_id || "") != ""
              ? "left"
              : "right"
              : "left";
          // 如果度量的函数类型不是count,则小数点默认保留两位小数
          if (val.element_type == 2) {
            if (val.fun_type != "1" && val.fun_type != "6") {
              val.dot = 2;
              val.numType = 1;
            } else {
              val.dot = 0;
              val.numType = 0;
            }
          } else {
            val.dot = 0;
            val.numType = 0;
          }
          result.push(val);
        }
      })
      return result;
    },
    // 即席查询表格列非计算度量的字段
    noComputedTbCols(state, getters, rootState, rootGetters) {
      var eleIdArr = [];
      state.tableCols.forEach(item => {
        if (item.is_calcul == "1") {
          eleIdArr.push(item.element_id);
        }
      });
      if (eleIdArr.length == 0) {
        return rootState.compt.s_edcuiCompts[1].comptAttrs.columns;
      } else {
        return rootState.compt.s_edcuiCompts[1].comptAttrs.columns.filter(item => {
          return !eleIdArr.includes(item.element_id);
        });
      }
    },
    /**
     * 判断是否存在必填项为空
     */
    isQuery: (state, getters, rootState, rootGetters) => (type, param) => {//查询条件字段
      let condiParam = rootState.compt.s_edcuiCompts[0].comptAttrs.fieldList
      if (type === '1003') {
        if (param) {
          condiParam = param
        } else {
          condiParam = rootState.ReportMgt.edcuiCompts[0].comptAttrs.fieldList
        }
      }
      let isQuery = true;
      for (var params of condiParam) {
        if (params.type == 'ElButton') {
          continue;
        }
        if (params.comptAttrs.isSetRequired) {
          if (params.comptAttrs.is_import) {  //如果是导入字段
            if (params.comptAttrs.import_tabId == "" || params.comptAttrs.import_symbol == "") {
              isQuery = false;
              break;
            }
          } else if (params.type == 'ElDatePicker') {
            if ((params.comptAttrs.cycleType == "date" && (params.comptAttrs.m_value[0] == '' || params.comptAttrs.m_value[0] == null))
              || (params.comptAttrs.cycleType == "daterange" && (params.comptAttrs.m_value[0] == '' || params.comptAttrs.m_value[0] == null || params.comptAttrs.m_value[1] == '' || params.comptAttrs.m_value[1] == null))) {
              isQuery = false;
              break;
            }
          } else if (params.type == 'ElNumber') {
            params.comptAttrs.numList.forEach((item, i) => {
              if ((item.label !==20 && item.label !== 21) && (item.label == "" || item.m_value == "")) {
                isQuery = false;
              }
            });
            if (isQuery == false) {
              break;
            }
          } else {
            if ((params.comptAttrs.symbol !==20 && params.comptAttrs.symbol !== 21) && (params.comptAttrs.m_value == '' || params.comptAttrs.m_value.length <= 0)) {
              isQuery = false;
              break;
            }
          }

        }
      }
      return isQuery;
    }
  },
  mutations: {
    cancelFilterSet(state, val) {
      state.filterData = val
    },
    upCycle(state, type) {
      state.radioCycle = type
    },
    upColValue(state, colValue) {
      state.colValue = colValue
    },
    upHasTotaled(state, hasTotaled) {
      state.hasTotaled = hasTotaled;
    },
    upIsTotal(state, isTotal) {
      state.isTotal = isTotal;
    },
    upTotalChange(state, bool) {
      state.totalChange = bool
    },
    upColumns(state, columns) {
      state.columns = columns;
    },
    upIsChangeCalc(state, isChangeCalc) {
      state.isChangeCalc = isChangeCalc;
    },
    upCondiData(state, data) {
      if (data.type == 'add') {
        state.condiData.push(data.data)
      } else if (data.type == 'reset') {
        state.condiData = data.data
      }
    },
    upTableCols(state, data) {
      if (data.type == 'add') {
        state.tableCols.push(data.data)
      } else if (data.type == 'reset') {
        state.tableCols = data.data
      }
    },
    filterCols(state, data) {
      const value = data.value
      const _d = data.data
      state.allColsData = value ? _d.filter(item => item.label.toUpperCase().includes(value.toUpperCase())) : _d
    },
    upAllCols(state, data) {
      state.allColsData = data
    },
    upFilterData(state, data) {
      if (data.type == 'add') {
        state.filterData.push(data.data)
      } else if (data.type == 'reset') {
        state.filterData = data.data
      }
    },
    upOrderList(state, data) {
      if (data.type == 'add') {
        state.orderList.push(data.data)
      } else if (data.type == 'reset') {
        state.orderList = data.data
      }
    },
    upLoaderSign(state, data) {
      state.loaderSign = data
    },
    resetTableData(state, data) {
      state.allTablesData = data
    },
    upBatchDialog(state, bool) {
      state.batchDialogVisible = bool
    },
    upDatasChange(state, bool) {
      state.datasChange = bool
    },
    setDimList(state, val) {
      state.dimList = val;
    },
    setMsuList(state, val) {
      state.msuList = val;
    },
    setQueryType(state, val) {
      state.queryType = val;
    },
    setTabtag(state, val) {
      state.tabTag = val;
    },
    setSelectAf(state, val) {
      state.selectAf = val;
    },
    setIsTotalOnly(state, val) {
      state.isTotalOnly = val;
    },
    setExportType(state, val) {
      state.exportType = val;
    },
    setDbName(state, dbNameVal) {
      state.dbName = dbNameVal
    },
    setSelLoadCnt(state, param) {
      if (param.type == "set") {
        state.selLoadCnt = param.val;
      } else {
        state.selLoadCnt -= 1;
      }
    }
  },
  actions: {
    cancelFilterSet({state, commit, rootState}, val) { // 数据过滤点击取消不生效
      commit('cancelFilterSet', val);
    },
    upCycle({state, commit, rootState}, type) { // 更新日期查询类型
      commit('upCycle', type);
    },
    upColValue({state, commit, rootState}, value) { // 更新合计选中值
      commit('upColValue', value);
    },
    upHasTotaled({state, commit, rootState}, hasTotaled) { // 更新日期查询类型
      commit('upHasTotaled', hasTotaled);
    },
    upColumns({state, commit, rootState}, columns) { // 更新日期查询类型
      commit('upColumns', columns);
    },
    upIsChangeCalc({state, commit, rootState}, isChangeCalc) { // 更新日期查询类型
      commit('upIsChangeCalc', isChangeCalc);
    },
    upIsTotal({state, commit, rootState}, isTotal) { // 更新日期查询类型
      commit('upIsTotal', isTotal);
    },
    upCondiData({state, commit, rootState}, data) { //更新查询条件字段列表
      commit('upCondiData', data)
    },
    upTableCols({state, commit, rootState}, data) { //更新查询条件字段列表
      commit('upTableCols', data)
    },
    upTotalChange({state, commit, rootState}, isTotal) { // 更新日期查询类型
      commit('upTotalChange', isTotal);
    },
    filterCols({state, commit, rootState}, data) {
      commit('filterCols', data)
    },
    upAllCols({state, commit, rootState}, data) {
      commit('upAllCols', data)
    },
    upFilterData({state, commit, rootState}, data) { //更新数据过滤字段列表
      commit('upFilterData', data)
    },
    upOrderList(state, data) {//更新排序字段列表
      commit('upOrderList', data)
    },
    upLoaderSign({state, commit}, data) {
      commit('upLoaderSign', data)
    },
    upDatasChange({state, commit}, bool) {
      commit('upDatasChange', bool)
    },
    queryAfPropertyData({state, getters, commit, rootState}, {isNeedPaging, isExport, params} = {isNeedPaging: "1"}) {
      //条件参数
      let where_bean = getters.condiCols();
      let filter = getters.datafilterCols();
      let where_bean2 = {'exp': '', 'rule_list': []}

      if (filter.exp_ != '' && where_bean.exp != '') {
        where_bean2.exp = `(${where_bean.exp})and(${filter.exp_})`;
        where_bean2.rule_list = where_bean.rule_list.concat(filter.rule_list);
      } else if (filter.exp_ != '' && where_bean.exp == '') {
        where_bean2.exp = filter.exp_;
        where_bean2.rule_list = filter.rule_list;
      } else if (filter.exp_ == '' && where_bean.exp != '') {
        where_bean2.exp = where_bean.exp;
        where_bean2.rule_list = where_bean.rule_list;
      }

      //结果参数
      let select_list = [];
      if (state.queryType == 'list') {
        select_list = getters.resultCols.select_list;
      } else if (state.queryType == 'summarize') {
        select_list = getters.summarizeCols;
      }
      //排序参数
      let order_list = getters.resultCols.order_list
      let af_id = getters.resultCols.af_id
      //分页参数
      let pageCount = getters.resultCols.pageSize
      let start = getters.resultCols.currentPage
      var param = {
        "af_id": af_id,
        "begin_date": "",
        "head_bean": {
          "pageCount": pageCount,
          "start": start,
          "user_id": window.sessionStorage.getItem('user_id')
        },
        "is_need_log": 1,
        "is_need_paging": isNeedPaging,
        "is_need_permission": 1,
        "is_need_trans": 1,
        "query_type": "1",
        "select_list": select_list,
        "where_bean": where_bean2,
        "order_list": order_list,
        "isEdit": 0
      }
      if (isExport === true) {
        return param;
      }
      if (params) {
        param = {...param, ...params};
        if (param.head_bean != null) {
          param.head_bean.user_id = window.sessionStorage.getItem('user_id');
        }
      }
      // return axios.post(rootState.dgwMsUrl + '/dataAnlyFrameQuery/queryAfPropertyData', param)
      return service({
        maskOff: true,
        // url: rootState.dgwMsUrl + '/dataAnlyFrameQuery/queryAfPropertyData',
        url: rootState.renderEngine + '/dataAnlyFrameQuery/queryAfPropertyData',
        timeout: rootState.commonProperties.axiosTimeout,
        method: 'post',
        data: param
      })
    },
    exportTable({state, rootState}, param) {
      /*return service({
        maskOff: true,
        method: 'post',
        url: rootState.renderEngine + '/export/exportData',
        data: param,
        responseType: 'blob'
      })*/
      return axios({
        method: 'post',
        url: rootState.renderEngine + '/export/exportData',
        data: param,
        responseType: 'blob',
        headers: {
          "X-NG-SessionId": window.sessionStorage.getItem("X-NG-SessionId")
        }
      })
    },
    upIsTotalOnly({state, commit}, isTotalOnly) {
      commit('setIsTotalOnly', isTotalOnly)
    },
    asynReExportData({state, rootState}, param) {
      // return axios.post(rootState.contextUrl + '/export/asynReExportData', param)
      return service({
        maskOff: true,
        url: rootState.contextUrl + '/export/asynReExportData',
        method: 'post',
        data: param
      })
    },
    // 查询组件数据并进行格式化 dataType 1:图表 2:表格
    queryComptData({getters, rootState}, {params,computedData}) { //{ isNeedPaging, dataType, params } = { isNeedPaging: "1" }
      //条件参数

      var param = {
        "reqType": "1",
        "dataType": "0",//dataType
        "afQueryBean": {
          "isEdit": 0,
          "af_id": "",
          "begin_date": "",
          "head_bean": {
            "pageCount": 10, //图形不要分页,限制100条  表格要
            "start": ""
          },
          "is_need_log": 1,
          "is_need_paging": 0,
          "is_need_permission": 1,
          "is_need_trans": 1,
          "query_type": "1",
          "select_list": [],
          "where_bean": [], //where_bean2
          "order_list": []
        }
      }

      if (params) {
        param = {...param, ...params};
        param.afQueryBean.isEdit = 0;
      }
      // 页面添加计算字段构造element_list
      if (computedData && computedData.length>0) {
        let element_list = [];
        let select_list = [];
        for(let i=0;i<param.afQueryBean.select_list.length;i++){
          let item = param.afQueryBean.select_list[i];
          if(item.from_compt){
            for(let j=0; j<computedData.length; j++) {
              if(computedData[j].element_id === item.element_id) {
                let targ = computedData[j];
                let list = targ.related_fields;
                let {element_id,element_name,is_calcul,tab_id,col_fun_exp,tab_alias} = targ;
                element_list.push({element_id,element_name,is_calcul,tab_id,col_fun_exp,tab_alias});
                element_list = element_list.concat(list);
                select_list.push(item);
                break;
              }
            }
          } else {
            select_list.push(item)
          }
        }
        param.afQueryBean.select_list = select_list;
        param.afQueryBean.element_list = element_list;
      }
      if (param.dataType == 6) { //交叉表
        /*  return axios.post(rootState.renderEngine + '/refreshDataSet', param, {
           headers: {
             "X-UserId": window.sessionStorage.getItem("user_id"),
             "X-SystemId": rootState.defaultSystemId
           }
         }) */
        return service({
          maskOff: true,
          url: rootState.renderEngine + '/refreshDataSet',
          method: 'post',
          data: param,
          timeout: rootState.commonProperties.axiosTimeout,
          headers: {
            "X-UserId": window.sessionStorage.getItem("user_id"),
            "X-SystemId": rootState.defaultSystemId
          }
        })
      } else {
        /*  return axios.post(rootState.renderEngine + '/dataTrans/getData', param, {
           headers: {
             "X-UserId": window.sessionStorage.getItem("user_id"),
             "X-SystemId": rootState.defaultSystemId
           }
         }) */
        if (param.afQueryBean.order_list.length > 0) {
          var sels = param.afQueryBean.select_list;
          var colId = param.afQueryBean.order_list[0].col_id;

          //获取对应数据的fun_type
          for(var g = 0 ; g<sels.length ;g++){
              if(sels[g].col_id === colId){
                param.afQueryBean.order_list[0].fun_type = sels[g].fun_type;
              }
          }
        }


        return service({
          maskOff: true,
          url: rootState.renderEngine + '/dataTrans/getData',
          method: 'post',
          data: param,
          timeout: rootState.commonProperties.axiosTimeout,
          headers: {
            "X-UserId": window.sessionStorage.getItem("user_id"),
            "X-SystemId": rootState.defaultSystemId
          }
        })
      }
      // return axios.post(rootState.renderEngine + '/dataTrans/getData', param, {
      //   headers: {
      //     "X-UserId": window.sessionStorage.getItem("user_id"),
      //     "X-SystemId": rootState.defaultSystemId
      //   }
      // })
    },
    //查询定时取数
    queryTaskList({state, rootState}, param){
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/queryTask/queryTaskList',
        method: 'post',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId
        }
      })
    },
    //删除定时取数
    deleteTaskById({state, rootState}, id){
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/queryTask/' + id,
        method: 'delete',
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId
        }
      })
    },
    //新增定时取数
    addTask({state, rootState}, param){
      return service({
        maskOff: true,
        url: rootState.renderEngine + '/queryTask',
        method: 'post',
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id"),
          "X-SystemId": rootState.defaultSystemId
        }
      })
    }
  }
}

export default QueryTable
