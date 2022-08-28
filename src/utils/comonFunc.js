import pako from 'pako'   //压缩解压模块
import Vue from 'vue'
import { bdCommonFunc } from 'ngbd-utils'
let windowResizeTime = null;
let vm = new Vue();
const objDeepCopy = function (source) {
  var sourceCopy = source instanceof Array ? [] : {};
  for (var item in source) {
    if (source[item] == null) sourceCopy[item] = null;
    else {
      sourceCopy[item] =
        typeof source[item] === "object" ?
          objDeepCopy(source[item]) :
          source[item];
    }
  }
  return sourceCopy;
};

const setTimeFormat = function (show_format, type) { //type 1--format 2--valueformat
  show_format = (show_format || '' + '').toLocaleUpperCase().replace("24","");
  let format = "",
    dataCycle = "";
  switch (show_format) {
    case "YYYY":
      format = "yyyy";
      dataCycle = "year";
      break;
    case "YYYYMM":
      format = "yyyyMM";
      dataCycle = "month";
      break;
    case "YYYYMMDD":
      format = "yyyyMMdd";
      dataCycle = "date";
      break;
    case "YYYY-MM":
      format = "yyyy-MM";
      dataCycle = "month";
      break;
    // case "YYYY-MM-DD":
    //   format = "yyyy-MM-dd";
    //   dataCycle = "date";
    //   break;
    case "YYYY/MM":
      format = "yyyy/MM";
      dataCycle = "month";
      break;
    case "YYYY/MM/DD":
      format = "yyyy/MM/dd";
      dataCycle = "date";
      break;
    case "YYYYMMDDHH":
      format = "yyyyMMddHH";
      dataCycle = "datetime";
      break;
    case "YYYYMMDDHHMI":
      format = "yyyyMMddHHmm";
      dataCycle = "datetime";
      break;
    case "YYYYMMDDHHMISS":
      format = "yyyyMMddHHmmss";
      dataCycle = "datetime";
      break;
    case "YYYYMMDD HH:":
      format = "yyyyMMdd HH";
      dataCycle = "datetime";
      break;
    case "YYYYMMDD HH:MI":
      format = "yyyyMMdd HH:mm";
      dataCycle = "datetime";
      break;
    case "YYYYMMDD HH:MI:SS":
      format = "yyyyMMdd HH:mm:ss";
      dataCycle = "datetime";
      break;
    case "YYYY-MM-DD HH":
      format = "yyyy-MM-dd HH";
      dataCycle = "datetime";
      break;
    case "YYYY-MM-DD HH:MI":
      format = "yyyy-MM-dd HH:mm";
      dataCycle = "datetime";
      break;
    case "YYYY-MM-DD HH:MI:SS":
      format = "yyyy-MM-dd HH:mm:ss";
      dataCycle = "datetime";
      break;
    case "YYYY/MM/DD HH":
      format = "yyyy/MM/dd HH";
      dataCycle = "datetime";
      break;
    case "YYYY/MM/DD HH:MI":
      format = "yyyy/MM/dd HH:mm";
      dataCycle = "datetime";
      break;
    case "YYYY/MM/DD HH:MI:SS":
      format = "yyyy/MM/dd HH:mm:ss";
      dataCycle = "datetime";
      break;
    default:
      format = "yyyy-MM-dd";
      dataCycle = "date";
      break;
  }
  switch (type) {
    case 1:
      return format;
    case 2:
      return dataCycle;
  }
};
/**
 *
 * @param show_format 日期格式
 * @param offset 偏移量
 * @param source_date 需要偏移的的字符串日期（如：20200109），source_date为空则根据当前系统时间来进行偏移
 * @returns {string}
 */
// 从偏移量推时间
const getTimeFromOffset = function (show_format, offset, source_date) {
  show_format = show_format.toLocaleUpperCase().replace("24","");
  var currentDate = new Date();
  if(source_date != null){//source_date不为空时，先根据source_date的值转为日期格式的
    let newDate = source_date;
    //先把字符串格式化到秒，再转成日期。数据是年的不需要转换
    if(show_format.indexOf("HH") >= 0 || show_format.indexOf("MI") >= 0 || show_format.indexOf("SS") >= 0){
      //先把层级到时、分、秒的字符串格式化到秒
      newDate = dateFormatTrans({
        sourceFormat: show_format,
        targetFormat: "YYYY-MM-DD HH:MI:SS",
        source: source_date
      });
    }else if(show_format == 'YYYYMM' || show_format == 'YYYYMMDD'){
      //把YYYYMM和YYYYMMDD这两种数据转成YYYY-MM和YYYY-MM-DD，否则new Date();出来的日期是NAN
      newDate = show_format == 'YYYYMM' ? source_date.replace(/^(\d{4})(\d{2})$/,"$1-$2"): source_date.replace(/^(\d{4})(\d{2})(\d{2})$/,"$1-$2-$3");
    }
    currentDate = new Date(newDate);
  }
  var currentMonth = currentDate.getMonth() + 1,
    yearOff = 0,
    oriYear = 0,
    currentYear = currentDate.getFullYear(),
    oriMonth = 0,
    oriDay = 0,
    oriHours = 0,
    oriMinutes = 0,
    oriSeconds = 0,
    oldDate;
  var time = "",
    seperator = "",
    suffix = "";
  if (show_format.indexOf("/") > -1) {
    seperator = "/";
  } else if (show_format.indexOf("-") > -1) {
    seperator = "-";
  }
  switch (show_format) {
    case "YYYY":
      time = offset + currentYear;
      break;
    case "YYYYMM":
    case "YYYY-MM":
    case "YYYY/MM":
      if (offset < 0) {
        let year = (offset + currentMonth) / 12
        if (year <= 0) {
          yearOff = Math.ceil(year) - 1
        }
      } else {
        yearOff = Math.ceil((offset + currentMonth) / 12) - 1
      }
      oriYear = yearOff + currentYear;
      oriMonth = offset - yearOff * 12 + currentMonth;
      if (oriMonth < 0) {
        oriMonth = 12 + oriMonth
      }
      oriMonth = oriMonth > 9 ? oriMonth + "" : "0" + oriMonth;
      time = oriYear + seperator + oriMonth;
      break;
    case "YYYYMMDD":
    case "YYYYMMDDHH":
    case "YYYYMMDDHHMI":
    case "YYYYMMDDHHMISS":
    case "YYYYMMDD HH":
    case "YYYYMMDD HH:MI":
    case "YYYYMMDD HH:MI:SS":
    case "YYYY-MM-DD":
    case "YYYY/MM/DD":
    case "YYYY-MM-DD HH":
    case "YYYY-MM-DD HH:MI":
    case "YYYY-MM-DD HH:MI:SS":
    case "YYYY/MM/DD HH":
    case "YYYY/MM/DD HH:MI":
    case "YYYY/MM/DD HH:MI:SS":
      var oriDate = offset * 24 * 3600 * 1000;//按天偏移
      switch (show_format) {
        case "YYYYMMDDHH":
        case "YYYY-MM-DD HH":
        case "YYYY/MM/DD HH":
          oriDate = offset * 3600 * 1000;//按时偏移;
          break;
        case "YYYYMMDDHHMI":
        case "YYYY-MM-DD HH:MI":
        case "YYYY/MM/DD HH:MI":
          oriDate = offset * 60 * 1000;//按分偏移
          break;
        case "YYYYMMDDHHMISS":
        case "YYYY-MM-DD HH:MI:SS":
        case "YYYY/MM/DD HH:MI:SS":
          oriDate = offset * 1000;//按分偏移
          break;
        default:
          break;
      }
      var oriTime = currentDate.getTime() + oriDate;
      var tempTime = new Date();
      oldDate = tempTime.setTime(oriTime);
      oldDate = new Date(oldDate);
      oriYear = oldDate.getFullYear() + "";
      oriMonth = oldDate.getMonth() + 1;
      oriMonth = oriMonth > 9 ? oriMonth + "" : "0" + oriMonth;
      oriDay = oldDate.getDate();
      oriDay = oriDay > 9 ? oriDay + "" : "0" + oriDay;
      oriHours = oldDate.getHours();
      oriHours = oriHours > 9 ? oriHours + "" : "0" + oriHours;
      oriMinutes = oldDate.getMinutes();
      oriMinutes = oriMinutes > 9 ? oriMinutes + "" : "0" + oriMinutes;
      oriSeconds = oldDate.getSeconds();
      oriSeconds = oriSeconds > 9 ? oriSeconds + "" : "0" + oriSeconds;
      switch (show_format) {
        case "YYYYMMDDHH":
          suffix = oriHours;
          break;
        case "YYYYMMDDHHMI":
          suffix = ""+oriHours+oriMinutes;
          break;
        case "YYYYMMDDHHMISS":
          suffix = ""+oriHours+oriMinutes+oriSeconds;
          break;
        case "YYYYMMDD HH":
        case "YYYY/MM/DD HH":
        case "YYYY-MM-DD HH":
          suffix = " " + oriHours;
          break;
        case "YYYYMMDD HH:MI":
        case "YYYY/MM/DD HH:MI":
        case "YYYY-MM-DD HH:MI":
          suffix = " " + oriHours + ":" + oriMinutes;
          break;
        case "YYYYMMDD HH:MI:SS":
        case "YYYY/MM/DD HH:MI:SS":
        case "YYYY-MM-DD HH:MI:SS":
          suffix = " " + oriHours + ":" + oriMinutes + ":" + oriSeconds;
          break;
        default:
          break;
      }
      time = oriYear + seperator + oriMonth + seperator + oriDay + suffix;
      break;
    default:
      break;
  }
  time += "";
  return time;
};

const dealDataSetInfo = function (data, pageId, af_name, fieldTypeList, formatList) {
  formatList = formatList || [];//源时间格式集合
  // const date_type = response.data.respData.data_cycle; //1:日，2:月，6:年
  // var date_type = 1; // 1:日，2:月，6:年
  var allColsData = [];
  for (var i = 0; i < data.length; i++) {
    var item = data[i];
    item.af_name = af_name || "";
    item.is_import = false;
    // item.import_pageId = this.pageCache.pageId || "";
    item.import_pageId = pageId;
    item.import_symbol = "";
    item.import_tabName = "";
    item.import_tabId = "";
    // 表格列条件表达式
    item["col_condi_exp"] = [];
    if (item.is_show == 0) {
      continue;
    }
    let defc = {
      selected: false,
      dlselected: false
    };
    let col_type = item.col_type; // type
    let temp = {
      ...data[i],
      ...defc
    };
    temp.col_raw_type = temp.col_type || "";
    temp.col_type = temp.col_type || "";
    temp.col_type =
      fieldMatch(temp.col_type, fieldTypeList) == "number" ?
        "No." :
        fieldMatch(temp.col_type, fieldTypeList) == "date" ?
          "dat" :
          temp.col_type.substring(0, 3);
    temp.id = temp.element_id + temp.element_name;
    temp.element_name =
      (temp.element_name || "") == "" ?
        item.show_type == 1 ?
          item.col_name :
          item.col_chs_name :
        temp.element_name;
    temp.label = temp.element_name;
    temp["nick_name"] = temp.element_name;

    if (temp.element_type == 2) {
      //度量 加上fun_type，默认为2（sum）和小数点保留两位等设置
      temp["numType"] = 0;
      temp["dot"] = 0;
      temp["fun_type"] = 2;
      temp["total_fun_type"] = 2; //合计度量函数类型
      if(temp.is_calcul=='2'){  //聚合类设为0
        temp.fun_type = 0;
        temp.polymerFunType = 0;
      }
    }

    var dateTypeList = [];//用来存放，根据源时间格式衍生出的多个不同层级日期字段
    let show_format = temp.show_format || "";
    let source_format = temp.source_format || "";
    if ((show_format != "" || source_format != "") && temp.element_type == 1) {
      //如果原字段类型是数值或者字符串的，根据源格式转换获取的格式来判断当前是第几级（1表示年,2表示月,3表示日,4表示小时,5表示分钟,6表示秒）
      if(fieldMatch(col_type, fieldTypeList) == "number" || fieldMatch(col_type, fieldTypeList) == "char"){
        for(let i = 0; i < formatList.length; i++){
          //数据源中的源格式YYYYMMDDHHMISS更改成yyyyMMddhh24miss，所以得把格式变成大写且去掉24来匹配是否一致。
          //若一致，把YYYYMMDDHHMISS替换成yyyyMMddhh24miss
          if(formatList[i].formatStr.toLocaleUpperCase().replace("24","") == source_format.toLocaleUpperCase().replace("24","")){
            temp.formatLevel = formatList[i].formatLevel;
            temp.show_format = formatList[i].formatStr;
            temp.source_format = formatList[i].formatStr;
            break;
          }
        }
      }else if(fieldMatch(col_type, fieldTypeList) == "date"){
        //如果字段原类型是日期的，则默认展示到秒
        temp.formatLevel = 6;
        temp.show_format = "yyyy-MM-dd hh24:mi:ss"
        temp.source_format = "yyyy-MM-dd hh24:mi:ss";
      }
      col_type = "date";
      temp.col_type = "dat";
    }

    /** ***dim_id!='' && col_type == 'date' 设为维度********/
    if (item.dim_id != null && item.dim_id != "" && item.dim_id != "null") {
      // 有维度
      if (
        item.dim_level_id != null &&
        item.dim_level_id != "" &&
        item.dim_level_id != "null"
      ) {
        // 维层
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
          dlselected: false,
          m_value: [],
          treeSelVal:[]//存储下拉树复选框的值
        }
      };
    } else if (fieldMatch(col_type, fieldTypeList) == "number") {
      // temp.element_type = 2;
      temp.col_type = "No.";
      temp = {
        ...temp,
        ...{
          type: "ElNumber",
          labelWidth: "90px",
          numList: [{
            id: "0",
            m_value: "",
            label: 2
          }], // 前端构造，默认必须有
          defaultNumList: [{
            id: "0",
            m_value: "",
            label: 2
          }],
          radioCalcu: "0" // 前端构造，默认必须有
        }
      };
    } else if (fieldMatch(col_type, fieldTypeList) == "char") {
      // temp.element_type = 1;
      temp = {
        ...temp,
        ...{
          type: "ElInput",
          withSelect: true,
          labelWidth: "90px",
          selected: false,
          dlselected: false,
          m_value: "",
          symbol: 10,
          defaultSymbol: 10
        }
      };
    } else if (fieldMatch(col_type, fieldTypeList) == "date") {
      // temp.element_type = 1;
      // const date = new Date();
      // const year = date.getFullYear();
      // const month = date.getMonth();
      // const day = date.getDate();
      // var m_value;
      var split1 = "";
      if (show_format.indexOf("/") > -1) {
        split1 = "/";
      } else if (show_format.indexOf("-") > -1) {
        split1 = "-";
      }

      //1表示年,2表示月,3表示日,4表示小时,5表示分钟,6表示秒
      for(let i = 1; i <= temp.formatLevel; i++){
        let dateTemp = objDeepCopy(temp);
        dateTemp.element_type = Number(dateTemp.element_type);
        dateTemp.formatLevel = i;//日期字段的层级（1表示年,2表示月,3表示日,4表示小时,5表示分钟,6表示秒）
        dateTemp.isNewCol = true;//用来判断是否是日期字段新增加的日期层级字段
        let dateCycle = "year"
        if (i == 1) {
          //年
          dateCycle = "year";
          dateTemp.element_name = dateTemp.element_name + "(YYYY)";
          dateTemp.show_format = temp.show_format.substring(0,4);
        } else if (i == 2) {
          // 月
          dateCycle = "month";
          dateTemp.element_name = dateTemp.element_name + "(MM)";
          dateTemp.show_format = split1 == "" ? temp.show_format.substring(0,6):temp.show_format.substring(0,7);

        } else if (i == 3) {
          // 日
          dateCycle = "date";
          dateTemp.element_name = dateTemp.element_name + "(DD)";
          dateTemp.show_format = split1 == "" ? temp.show_format.substring(0,8):temp.show_format.substring(0,10);
        } else if (i == 4) {
          dateCycle = "datetime";
          dateTemp.element_name = dateTemp.element_name + "(HH)";
          let indx = temp.source_format.indexOf(":") > -1 ? 1:0;//是否存在冒号，截取是否要多截取一位
          dateTemp.show_format = temp.show_format.indexOf("mi") > -1 ? temp.show_format.substring(0,temp.show_format.indexOf("mi")-indx):temp.show_format;

        } else if (i == 5) {
          dateCycle = "datetime";
          dateTemp.element_name = dateTemp.element_name + "(MI)";
          let indx = temp.source_format.indexOf(":") > -1 ? 1:0;//是否存在冒号，截取是否要多截取一位
          dateTemp.show_format = temp.show_format.indexOf("ss") > -1 ? temp.show_format.substring(0,temp.show_format.indexOf("ss")-indx):temp.show_format;

        } else if (i == 6) {
          dateCycle = "datetime";
          dateTemp.element_name = dateTemp.element_name + "(SS)";
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
        }
        dateTemp.id = dateTemp.element_id + dateTemp.element_name
        // 加上聚合函数
        dateTemp = {
          ...dateTemp,
          ...initFuncDateParam(dateTemp, split1, fieldTypeList)
        }
        dateTypeList.push(dateTemp)
      }
      // 477-547临时释放
      // if (date_type == 1) {
      //   // m_value = year;
      //   temp = {
      //     ...temp,
      //     ...{
      //       type: "ElDatePicker",
      //       dateCycle: "year", // 前端构造，默认必须有
      //       cycleType: "date", // 前端构造，默认必须有
      //       // m_value: [m_value + ""],
      //       m_value: [],
      //       labelWidth: "90px",
      //       timeOpr: 2,
      //       selected: false,
      //       dlselected: false
      //     }
      //   };

      // } else if (date_type == 2) {
      //   // 月
      //   // m_value = year + split1 + (month + 1).toString().padStart(2, "0");
      //   temp = {
      //     ...temp,
      //     ...{
      //       type: "ElDatePicker",
      //       dateCycle: "month", // 前端构造，默认必须有
      //       cycleType: "date", // 前端构造，默认必须有
      //       //  m_value: [m_value],
      //       m_value: [],
      //       labelWidth: "90px",
      //       timeOpr1: 2,
      //       timeOpr2: 2,
      //       timeOprCount1: 0,
      //       timeOprCount2: 0,
      //       selected: false,
      //       dlselected: false
      //     }
      //   };
      // } else if (date_type == 6) {
      //   // 日
      //   // m_value = year + split1 + (month + 1).toString().padStart(2, "0") + split1 + day.toString().padStart(2, "0");
      //   // var fix = "";
      //   // if (show_format.toLocaleUpperCase().indexOf("HHMISS") > -1) {
      //   //   fix = "000000";
      //   // } else if (
      //   //   show_format.toLocaleUpperCase().indexOf("HH:MI:SS") > -1
      //   // ) {
      //   //   fix = " 00:00:00";
      //   // }
      //   // m_value += fix;
      //   temp = {
      //     ...temp,
      //     ...{
      //       type: "ElDatePicker",
      //       dateCycle: "date", // 前端构造，默认必须有
      //       cycleType: "date", // 前端构造，默认必须有
      //       // m_value: [m_value],
      //       m_value: [],
      //       labelWidth: "90px",
      //       timeOpr: 2,
      //       timeOprCount: 0,
      //       selected: false,
      //       dlselected: false
      //     }
      //   };
      // }
    }
    if (temp.element_type != 2) {
      temp.element_type = 1;
    }
    // 默认样式设置
    temp.align =
      temp.col_type == "No." ?
        (temp.dim_id || "") != "" ?
          "left" :
          "right" :
        "left";
    temp.col_type =
      temp.col_type.search(/No.|var|dat/) > -1 ? temp.col_type : "var";
    if(temp.is_calcul == "1"){
      temp.col_type = 'fx'
    } else if(temp.is_calcul == "2"){
      temp.col_type = 'gfx'
    }
    allColsData.push(temp);
    allColsData = allColsData.concat(dateTypeList);//把根据源时间格式衍生出的多个不同层级日期字段，加入到数据集维度字段列表中
  }
  return allColsData;
};

const constructList = function (data, datasetMap, computedData) {
  let res = {
    tranState: true,
    resultList: [],
    errMsg: ""
  };
  let fieldList = null;
  if(datasetMap && data.length>0) {
    fieldList = datasetMap[data[0].af_id];
  }

  if (!fieldList) {
    res.tranState = false;
    res.errMsg = "数据集不存在";
  } else if (fieldList.length == 0) {
    res.tranState = false;
    res.errMsg = "数据集字段为空";
  } else {
    for (let index = 0; index < data.length; index++) {
      fieldList = fieldList.concat(computedData || []);
      let field = fieldList.filter(item => {
        //日期分层级需要新增加两个判断条件（formatLevel、isNewCol）
        return item.element_id == data[index].element_id && item.formatLevel == data[index].formatLevel && item.isNewCol == data[index].isNewCol;
    })
      if (field.length == 0) {
        res.tranState = false;
        res.errMsg = "字段不存在";
        break;
      } else {
        // let item = {};
        // switch (param.type) {
        //   case 5:
        //     item = { ...field[0], ...param.data[index]}

        //     break;
        //   case 1: case 2: case 3: case 4:

        //     break;
        //   default:
        //     break;
        // }
        res.resultList.push({
          ...field[0],
          ...data[index]
        });
      }
    }
  }
  return res;
};

const genWhereBean = function (linkageCondi, oriWhereBean, isDrill) {
  let expName = "new_exp";
  let radioCalcu = 'and';
  let ruleId = 0;
  if (isDrill) {
    expName = "drill_exp";
  }
  let rule_list = oriWhereBean.rule_list || [],
    expression = "";
  // let exp_idx = rule_list.length;
  for (let index = 0; index < linkageCondi.length; index++) {
    let element = objDeepCopy(linkageCondi[index]);
    // exp_idx++;
    if (linkageCondi[index].rule_value || linkageCondi[index].symbol === 20 || linkageCondi[index].symbol === 21) {
      if (element.compt_type == 'ElNumber' && element.radioCalcu != null) { // 数值类型设为或且要构造()格式
        let radio = element.radioCalcu
        let exp_id1 = expName + (++ruleId) + '$'
        element.exp_id = exp_id1
        let idx = ++ruleId
        let element2 = objDeepCopy(linkageCondi[++index])
        let exp_id2 = expName + idx + '$'
        element2.exp_id = exp_id2
        rule_list.push(element)
        rule_list.push(element2)
        let dual = `(${exp_id1} ${radio} ${exp_id2})`
        if (expression.length == 0) {
          expression += dual;
        } else {
          expression += ' and ' + dual;
        }
      } else if (element.compt_type == 'ElDatePicker' && element.cycleType == 'daterange') { // 日期类型设为范围要构造()格式
        let exp_id1 = expName + (++ruleId) + '$'
        element.exp_id = exp_id1
        let idx = ++ruleId
        let element2 = objDeepCopy(linkageCondi[++index])
        let exp_id2 = expName + idx + '$'
        element2.exp_id = exp_id2
        // 时间格式的查询,如果源时间格式非YYYY,YYYY格式的查询需要补月01传给后台，否则后台to_date('2019','YYYY')的时间为2019年当年月1号
        if (element.format.toLowerCase() !== 'yyyy' && element.target_format === 'yyyy') {
          var split1 = element.format.indexOf('/') > -1 ? '/' : (element.format.indexOf('-') > -1 ? '-' : '')
          element2.rule_value = getTimeFromOffset(element2.target_format, 1, element.rule_value)
          element.target_format = 'yyyy' + split1 + 'MM'
          element2.target_format = 'yyyy' + split1 + 'MM'
          element2.symbol = 1;//<
          if (element.rule_value) {
            element.rule_value += (split1 + '01')
          }
          if (element2.rule_value) {
            element2.rule_value += (split1 + '01')
          }
        }
        rule_list.push(element)
        rule_list.push(element2)
        let dual = `(${exp_id1} ${radioCalcu} ${exp_id2})`
        if (expression.length == 0) {
          expression += dual;
        } else {
          expression += ' and ' + dual;
        }
      } else if (element.compt_type == 'ElDatePicker' && element.cycleType == 'date' && (element.m_value[0] || element.m_value[1])) {
        /**
         * 时间格式的传参规则:
         * （只要涉及日期格式的传参，都要符合这个规则)
         *
         * 1.区间
         *   1.1)如果源时间格式source_format != 目标时间格式 target_format,传参格式:
         *      >= value1 and < (value2 + 1) ;
         *      并且,如果target_format==='YYYY',此时target_format转成'YYYYMM',value补月01; !!!
         *   1.2)如果源时间格式source_format == 目标时间格式 target_format,传参格式:
         *     >= value1 and <= value2
         *
         * 2.非区间
         *  2.1)如果源时间格式source_format != 目标时间格式 target_format,传参格式:
         *     >= value1 and < (value2 + 1) ;
         *     并且,如果target_format==='YYYY',此时target_format转成'YYYYMM',value补月01; !!!
         *  2.2)如果源时间格式source_format == 目标时间格式 target_format,传参格式:
         *     = value
         *
         * ---2020/07/01 add by 宋景景
         */
        let exp_id1 = expName + (++ruleId) + '$'
        element.exp_id = exp_id1
        let element2 = objDeepCopy(element)
        let dual = `${exp_id1}`
        rule_list.push(element)
        // 非区间格式，如果是目标格式和源格式不一致则构造区间，大于等于第一个参数，小于第二个参数，第二个参数比第一个参数偏移量为1
        if (element2.m_value[0] != '' && element2.format.length != element2.target_format.length) {
          let idx = ++ruleId
          element.symbol = 5
          let value = element2.m_value[0]
          element2.rule_value = getTimeFromOffset(element2.target_format, 1, value)
          // 时间格式的查询,如果源时间格式非YYYY,YYYY格式的查询需要补月-1传给后台，否则后台to_date('2019','YYYY')的时间为2019年当年月1号
          if (element.format && element.format.toLowerCase() !== 'yyyy' && element.target_format && element.target_format.toLowerCase() === 'yyyy') {
            var split = element.format.indexOf('/') > -1 ? '/' : (element.format.indexOf('-') > -1 ? '-' : '')
            element.target_format = 'yyyy' + split + 'MM'
            element2.target_format = 'yyyy' + split + 'MM'
            if (element.rule_value) {
              element.rule_value += (split + '01')
              element2.rule_value += (split + '01')
            }
          }
          let exp_id2 = expName + idx + '$'
          element2.exp_id = exp_id2
          element2.symbol = 1
          rule_list.push(element2)
          dual = `(${exp_id1} ${radioCalcu} ${exp_id2})`
        }
        if (expression.length == 0) {
          expression += dual
        } else {
          expression += ' and ' + dual
        }
      } else {
        // //清空日期格式化
        // element.format="";
        // element.target_format="";
        // let exp_id = expName + (++ruleId) + "$";
        // element.exp_id = exp_id;
        // rule_list.push(element);
        // if (expression.length == 0) {
        //   expression += exp_id;
        // } else {
        //   expression += ` ${radioCalcu} ${exp_id}`;
        // }
        let exp_id = expName + (++ruleId) + '$'
        element.exp_id = exp_id
        // 时间格式的查询,如果源时间格式非YYYY,YYYY格式的查询需要补月-1传给后台，否则后台to_date('2019','YYYY')的时间为2019年当年月1号
        if (element.rule_value && element.format && element.format.length != element.target_format.length) {
          let element2 = objDeepCopy(element)
          element.symbol = 5 // >=
          element2.symbol = 1 // <
          let value = element2.rule_value
          element2.rule_value = getTimeFromOffset(element2.target_format, 1, value)
          if (element.format && element.col_type === 'dat' && element.format.toLowerCase() !== 'yyyy' && element.target_format && element.target_format.toLowerCase() === 'yyyy') {
            var splits = element.format.indexOf('/') > -1 ? '/' : (element.format.indexOf('-') > -1 ? '-' : '')
            element.target_format = 'yyyy' + splits + 'MM'
            element2.target_format = 'yyyy' + splits + 'MM'
            if (element.rule_value) {
              element.rule_value += (splits + '01')
              element2.rule_value += (splits + '01')
            }
          }
          let exp_id2 = expName + (++ruleId) + '$'
          element2.exp_id = exp_id2
          rule_list.push(element2)
          let dual = `(${exp_id} ${radioCalcu} ${exp_id2})`
          if (expression.length == 0) {
            expression += dual
          } else {
            expression += ' and ' + dual
          }
        } else {
          // 清空日期格式化
          element.format = ''
          element.target_format = ''
          if (expression.length == 0) {
            expression += exp_id
          } else {
            expression += ` ${radioCalcu} ${exp_id}`
          }
        }
        rule_list.push(element)
      }
    }
  }
  let newExp = expression.trim() == "" ? "" : `${radioCalcu}(${expression})`;
  return {
    exp: oriWhereBean.exp == "" ?
      expression : `(${oriWhereBean.exp})${newExp}`,
    rule_list: rule_list
  };
};

const getFieldFromDsMap = function (datasetMap, relInfo) {
  let fieldInfo = datasetMap[relInfo.af_id] || [],
    field = [];
  if (fieldInfo.length > 0) {
    field = fieldInfo.filter(item => {
      return item.element_id == relInfo.element_id;
  })
  }
  return field.length > 0 ? field[0] : {};
};

const getCurDimValu = function (label, data, key, type) {
  let value = "";
  let filterData = data.filter(item => {
    return item[key] === label;
  })
  if (JSON.stringify(filterData).indexOf("XXXXCODE") < 0) {//去层级关系的下钻，存在没有绑定维层的维度，则直接取label的值
    value = label;
  } else {
    if (type != "VeRadar") {
      for (let index = 0; index < data.length; index++) {
        if (data[index][key] == label) {
          value = data[index]["XXXXCODE"];
          break;
        }
      }
    } else {
      value = data[data.length - 1][label];
    }
  }
  return value;
};

const getOrderList = function (selectList) {
  let orderList = [];
  selectList.forEach(val => {
    if (val.sort != null) {
    let sortItem = {}
    sortItem.obj_id = val.tab_id
    sortItem.col_id = val.col_id
    sortItem.order_type = val.sort
    sortItem.element_id = val.element_id
    // 时间格式截取字段,网关需要加聚合函数
    if (val.isNewCol) {
      sortItem['dgw_fun_param'] = val.dgw_fun_param
      sortItem['dgw_function'] = val.dgw_function
    }
    orderList.push(sortItem)
  }
})
  return orderList;
};

const getCompTemp = function (allCompTemps, type) {
  let curCompTemp = {};
  for (let index = 0; index < allCompTemps.length; index++) {
    if (allCompTemps[index].type == type) {
      curCompTemp = allCompTemps[index];
      break;
    }
  }
  return curCompTemp;
};

const windowResize = function () {
  clearTimeout(windowResizeTime); //添加节流
  windowResizeTime = setTimeout(() => {
    let myEvent
    if (typeof (Event) === 'function') {
      myEvent = new Event('resize')
    } else {
      myEvent = document.createEvent('Event')
      myEvent.initEvent('resize', true, true)
    }
    window.dispatchEvent(myEvent)
    let bigScreen = document.querySelector(".big-scale-wrap");
    if(bigScreen) { //解决大屏移动出现残影问题
      let transform = bigScreen.style.transform;
      bigScreen.style.transform = '';
      setTimeout(() => {
        bigScreen.style.transform = transform;
      }, 100);
    }
  }, 100);
}

const getFilteredData = function (allData, key, value) {
  return allData.filter(item => {
    return item[key] == value;
})
};

// 处理查询所有页面的response
const handlePageList = function (pageList, classTypeId, operation) {
  //绑定数据集的各种组件的静态数据json
  // const comptData = require('@/../public/comptConfig/comptData.json');

  var afIds = [],
    drillFieldList = [],
    param = [];
  for (let page of pageList) {
    var temp = {};
    temp.pageId = page.pageId;
    temp.pageName = page.pageName;
    temp.parentId = page.parentId;
    temp.orderId = page.orderId;
    temp.layoutType = page.layoutType;
    temp.pageType = page.pageType + "";
    temp.bgClor = page.bgClor;
    temp.isWatermark = page.isWatermark + "";
    temp.bgImg = (page.pageSetting || {}).bgImg || "";
    temp.pageParams = (page.pageSetting || {}).pageParams || "";
    temp.bgEffects = (page.pageSetting || {}).specEffect || "";
    temp.bgImageName = ((page.pageSetting || {}).bgimgId || "") + "";
    temp.width = (page.pageSetting || {}).width || "800";
    temp.height = (page.pageSetting || {}).height || "500";
    temp.lineObj = JSON.parse((page.pageSetting || {}).gridLine || '{"oldRatio":1,"xlines":[],"ylines":[]}');
    if (temp.bgEffects != "") temp.bgEffects = parseInt(temp.bgEffects) || 0;
    temp.pageParams = JSON.parse(temp.pageParams || "[]");
    temp.pageDetail = [];
    temp["classTypeId"] = classTypeId;
    if (page.pageDetails != null && page.pageDetails.length > 0) {
      for (let detail of page.pageDetails) {
        let comp = {};
        comp.pageId = detail.pageId;
        comp.afId = detail.afId || "";
        comp.blockInfo = JSON.parse(detail.blockInfo);
        comp.comptAttrs = JSON.parse(detail.compAttrs);
        comp.comptId = detail.elementId;
        comp.orderId = detail.orderId;
        comp.type = detail.compType;
        comp.styleAttrs = JSON.parse(detail.styleAttrs);
        if (comp.blockInfo.i && comp.blockInfo.i != comp.comptId) { //解决列表上页面另存导致的blockifno中i和组件的comptid不一致的问题
          comp.blockInfo.i = comp.comptId;
        }
        if (classTypeId == "1005" && operation == "templateview") {//首页点击发布模板时，清空afId，展示静态数据
          comp.afId = "";
        }
        if (comp.afId == "") {//如果未绑定数据集则展示静态数据
          resetTemplateCompt(comp, operation);
        }
        // 处理过滤条件偏移量
        if (operation !== 'applyTemplate') {
          comp.comptAttrs = JSON.parse(detail.compAttrs)
        }
        setWhereBeantimeOffset(comp)
        //end
        temp.pageDetail.push(comp);
        if (
          comp.comptAttrs.drillData &&
          comp.comptAttrs.drillData.length > 0
        ) {
          drillFieldList.push(comp.comptAttrs.drillData[0]);
        }
      }
    }
    param.push(temp);
  }
  return {
    afIds: afIds,
    drillFieldList: drillFieldList,
    pages: param
  }
};

const addPageWhereBean = function (oriWhereBean, otherCondis, datasetMap) {
  let whereBean = objDeepCopy(oriWhereBean);
  let curExp = "",
    curRuleList = [],
    idx = 1;
  let expName = "page_exp";
  // if (['VeSankey', 'VeTree'].includes(param.vscompt.type) && param.label) {
  //   let clickCell_element = param.vscompt.comptData.rows.find(item => {
  //     return item[param.vscompt.comptData.columns[0]] === param.label;
  //   })
  //   linkData = getFilteredData(
  //     param.vscompt.comptAttrs.mainLinkageData,
  //     'rel_element_id',
  //     clickCell_element.element_id
  //   )
  // }
  for (const condi of otherCondis) {
    let dsFields = datasetMap[condi.af_id] || [];
    let field = dsFields.filter(item => {
      if (item.col_type === 'dat'
  ) {
      return item.element_id == condi.element_id && item.isNewCol === condi.isNewCol && condi.formatLevel === item.formatLevel
    }
    return item.element_id == condi.element_id
  })
    if (field.length > 0) {
      let exp_id = expName + idx;
      let item1 = {
        col_id: field[0].col_id,
        col_type: "2",
        exp_id: exp_id,
        is_dim: field[0].dim_level_id != undefined &&
        field[0].dim_level_id != null &&
        field[0].dim_level_id != "" ?
          1 : 0,
        symbol: 3, //=
        rule_value: condi.value,
        obj_id: field[0].tab_id,
        element_id: field[0].element_id,
        format: field[0].source_format, //condi.format为条件的源格式,被联动 取主联动查询条件的target_format 和  被联动组件的源时间格式
        target_format: condi.target_format
      };
      if (curExp.length == 0) {
        curExp += exp_id;
      } else {
        curExp += ` and ${exp_id}`;
      }
      // 时间格式的查询，如果format！=target_format 要传范围到后台，此处判断被联动组建的关联字段的格式类型是否为日期
      if (item1.rule_value && field[0].col_type === 'dat' && item1.format && item1.format !== item1.target_format) {
        let item2 = objDeepCopy(item1)
        item1.symbol = 5 // >=
        item2.symbol = 1 // <
        let value = item1.rule_value
        item2.rule_value = getTimeFromOffset(item2.target_format, 1, value)
        // 时间格式的查询,如果源时间格式非YYYY,YYYY格式的查询需要补月-1传给后台，否则后台to_date('2019','YYYY')的时间为2019年当年月1号
        if (item1.format && item1.format.toLowerCase() !== 'yyyy' && item1.target_format && item1.target_format.toLowerCase() === 'yyyy') {
          var split = item1.format.indexOf('/') > -1 ? '/' : (item1.format.indexOf('-') > -1 ? '-' : '')
          item1.target_format = 'yyyy' + split + 'MM'
          item2.target_format = 'yyyy' + split + 'MM'
          if (item1.rule_value) {
            item1.rule_value += (split + '01')
            item2.rule_value += (split + '01')
          }
        }
        let exp_id2 = expName + (++idx) + '$'
        item2.exp_id = exp_id2
        curExp += ` and ${exp_id2}`
        curRuleList.push(item2)
      }
      curRuleList.push(item1)
      idx++
    }
  }
  if (oriWhereBean.exp.trim() == "") {
    whereBean.exp = curExp;
    whereBean.rule_list = curRuleList;
  } else {
    whereBean.exp = `(${oriWhereBean.exp}) and (${curExp})`;
    whereBean.rule_list = oriWhereBean.rule_list.concat(curRuleList);
  }
  return whereBean;
};

// 把联动条件塞到当前组件内
const setCondiToCompt = function (comp, curPageCondi) {
  // 塞联动条件
  let condis = [];
  for (const condi of curPageCondi) {
    if (comp.type != "Query" && comp.type != "MobileQuery" && comp.afId != "" && comp.afId.indexOf(condi.af_id) > -1 && condi.comptId == comp.comptId) {
      condis.push({
        ...condi
      });
    }
  }
  return condis;
};

const isShowNameFunc = function (compt) {
  let result;
  let setting = compt.comptAttrs.extendSetting;
  if (setting == null) {
    result = false;
  } else {
    if (setting["comptName.show"] == true) {
      result = true;
    } else {
      result = false;
    }
  }
  return result;
};

// 构造组件内查询组件数据的请求参数
const getRequestParam = function ({
                                    param,
                                    vscompt,
                                    drillData,
                                    xAxisData,
                                    yAxis1Data,
                                    yAxis2Data,
                                    dataType,
                                    datasetMap
                                  }) {
  vscompt.comptAttrs.loading = true;
  if (datasetMap != null && vscompt.type !== 'DesicionTree') {
    if ((xAxisData == null || xAxisData.length == 0) && vscompt.comptAttrs.xAxisData != null && vscompt.comptAttrs.xAxisData.length > 0) {
      xAxisData = constructList(vscompt.comptAttrs.xAxisData, datasetMap, vscompt.comptAttrs.computedData || []).resultList || []
    }
    if ((yAxis1Data == null || yAxis1Data.length == 0) && vscompt.comptAttrs.yAxis1Data != null && vscompt.comptAttrs.yAxis1Data.length > 0) {
      yAxis1Data = constructList(vscompt.comptAttrs.yAxis1Data, datasetMap, vscompt.comptAttrs.computedData || []).resultList || []
    }
    if ((yAxis2Data == null || yAxis2Data.length == 0) && vscompt.comptAttrs.yAxis2Data != null && vscompt.comptAttrs.yAxis2Data.length > 0) {
      yAxis2Data = constructList(vscompt.comptAttrs.yAxis2Data, datasetMap, vscompt.comptAttrs.computedData || []).resultList || []
    }
    // if((drillData == null || drillData.length == 0) && vscompt.comptAttrs.drillData != null && vscompt.comptAttrs.drillData.length >0){
    //   drillData = constructList(vscompt.comptAttrs.drillData, datasetMap).resultList || [];
    // }
  }

  let selectList = [];
  let dim_value = "";
  let whereBean = objDeepCopy(vscompt.comptAttrs.whereBean);
  if (param != undefined && param.isUpDrill) {
    //钻取返回可返回到指定层，drillWBeanList删除指定层之后的数据
    vscompt.comptAttrs.drillWBeanList.splice(vscompt.comptAttrs.curDrillIdx, vscompt.comptAttrs.drillWBeanList.length - vscompt.comptAttrs.curDrillIdx);
    vscompt.comptAttrs.curDrillIdx--;
    let curDrillIdx = vscompt.comptAttrs.curDrillIdx;
    //下钻时，每层的下钻条件已经拼好，直接取就行了
    let wbRuleList = objDeepCopy(vscompt.comptAttrs.drillWBeanList[curDrillIdx].whereBean.rule_list) || [];
    let drillWBRule = wbRuleList.filter(item => {
      return item.exp_id.indexOf("drill_exp") > -1;
  });
    //下钻条件和whereBean拼接
    whereBean = genWhereBean(
      drillWBRule,
      whereBean,
      true
    );
    // if (vscompt.comptAttrs.curDrillIdx > 0) {
    //   let drillLevel = objDeepCopy(
    //     vscompt.comptAttrs.drillWBeanList[
    //       vscompt.comptAttrs.drillWBeanList.length - 1
    //     ]
    //   );
    //   whereBean = genWhereBean(
    //     [{
    //       col_id: drillLevel.item.col_id,
    //       col_type: "2",
    //       exp_id: "",
    //       is_dim: "1",
    //       symbol: 3,
    //       rule_value: drillLevel.value,
    //       obj_id: drillLevel.item.tab_id,
    //       element_id: drillLevel.item.element_id
    //     }],
    //     whereBean,
    //     true
    //   );
    // }
    // whereBean = vscompt.comptAttrs.drillWBeanList[
    //   vscompt.comptAttrs.drillWBeanList.length - 1
    // ].whereBean;
  } else if (param != undefined && param.isDownDrill) {
    vscompt.comptAttrs.curDrillIdx++;
    let curDrillIdx = vscompt.comptAttrs.curDrillIdx;
    //构造当前层级的rule
    dim_value = getCurDimValu(
      param.label,
      vscompt.comptData.rows,
      vscompt.comptData.columns[0],
      vscompt.type
    );
    let curField = drillData[curDrillIdx - 1];
    let curDrillWBRule = {
      col_id: curField.col_id,
      col_type: "2",
      exp_id: "",
      is_dim: "1",
      symbol: 3,
      rule_value: dim_value,
      obj_id: curField.tab_id,
      element_id: curField.element_id,
      format: curField.source_format,
      target_format: curField.show_format
    };
    //获取下钻当前层级的前一级的rule_list（下钻时，每层的下钻条件已经拼好，直接取就行了）
    let wbRuleList = objDeepCopy(vscompt.comptAttrs.drillWBeanList[curDrillIdx - 1].whereBean.rule_list) || [];
    let drillWBRule = wbRuleList.filter(item => {
      return item.exp_id.indexOf("drill_exp") > -1;
  });
    for (let index = 0; index < drillWBRule.length; index++) {
      drillWBRule[index].exp_id = "";
    }
    drillWBRule.push(curDrillWBRule);//所有下钻条件存在一起
    //所有下钻条件和whereBean拼接
    whereBean = genWhereBean(
      drillWBRule,
      whereBean,
      true
    );
    //把拼接好的所有下钻条件和whereBean存在当前下钻层级的drillWBeanList
    vscompt.comptAttrs.drillWBeanList.push({
      item: objDeepCopy(drillData[curDrillIdx]),
      whereBean: objDeepCopy(whereBean),
      label: param.label,
      value: dim_value
    });
  }

  // 还要判断当前是否在联动状态则应该返回联动的那个状态
  if (
    vscompt.comptAttrs["linkageCondi"] != undefined &&
    vscompt.comptAttrs["linkageCondi"].length > 0
  ) {
    whereBean = genWhereBean(
      vscompt.comptAttrs["linkageCondi"],
      objDeepCopy(whereBean)
    );
  }
  if (vscompt.comptAttrs.curDrillIdx == 0) {
    selectList = xAxisData;
  } else {
    // whereBean
    selectList = [drillData[vscompt.comptAttrs.curDrillIdx]];
  }
  selectList = getSelectList(selectList, yAxis1Data, yAxis2Data, vscompt.type);
  if (selectList.length == 0) {
    vscompt.comptAttrs.loading = false;
    return;
  }


  let orderList = getOrderList(selectList);
  let params = {
    reqType: "1",
    dataType: dataType,
    afQueryBean: {
      af_id: vscompt.afId,
      begin_date: "",
      head_bean: {
        pageCount: 100, //图形不要分页,限制100条  表格要
        start: "",
        user_id: window.sessionStorage.getItem("user_id")
      },
      is_need_log: 1,
      is_need_paging: 0,
      is_need_permission: 1,
      is_need_trans: 1,
      query_type: "1",
      select_list: selectList,
      order_list: orderList,
      where_bean: whereBean
    }
  }
  // 判断是否有图例维度， 增加colDimList和rowDimList
  const param1 = {
    xAxisData,
    selectList,
    yAxis1Data,
    yAxis2Data
  }
  let transParam = transposeParams(param1)
  if (transParam.trans) {
    params.afQueryBean.select_list = transParam.select_list
    params.colDimList = transParam.colDimList
    params.rowDimList = transParam.rowDimList
  }
  return params
}

const getSelectList = function (xAxisData, yAxis1Data, yAxis2Data, type) {
  let selectList = xAxisData.concat(yAxis1Data.concat(yAxis2Data));
  if (selectList.length > 0) {
    //图形 把有绑定维层的维度字段翻译一下
    let bindDimedItem = selectList.filter(item => {
      return (
        item.dim_id != "" && item.dim_id != null && item.element_type == 1
      );
    });
    if (bindDimedItem.length > 0) {
      if (['VeSankey','VeTree'].includes(type)) {
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
  return selectList;
};

const addPageCondis = function ({
                                  vscompt,
                                  params,
                                  datasetMap,
                                  pageParams,
                                  queryCompts,
                                  pageId
                                }) {
  // 补上公共参数
  params.afQueryBean.where_bean = addParamWBean(
    params.afQueryBean.where_bean,
    vscompt,
    datasetMap,
    pageParams,
    queryCompts,
    pageId
  );
  // 补上其他页面的联动设置
  if (
    vscompt.comptAttrs["otherPageCondi"] != undefined &&
    vscompt.comptAttrs["otherPageCondi"].length > 0
  ) {
    params.afQueryBean.where_bean = addPageWhereBean(
      params.afQueryBean.where_bean,
      vscompt.comptAttrs["otherPageCondi"],
      datasetMap
    );
  }
  return params;
};

const getLinkRequestParam = function ({
                                        linkageCondi,
                                        vscompt,
                                        xAxisData,
                                        yAxis1Data,
                                        yAxis2Data,
                                        dataType
                                      }) {
  vscompt.comptAttrs.loading = true;
  let whereBean = genWhereBean(
    linkageCondi,
    objDeepCopy(vscompt.comptAttrs.whereBean)
  );
  // 指标拆解树
  if (vscompt.type === 'DesicionTree' && xAxisData.length === vscompt.comptAttrs.xAxisData.length) {
    xAxisData = [];
  }
  let selectList = getSelectList(xAxisData, yAxis1Data, yAxis2Data, vscompt.type);
  // 还要判断当前是否在钻取状态，如果在钻取状态，钻取条件不能丢
  if (vscompt.comptAttrs.drillWBeanList.length > 1) {
    // let drillWhereBean1 = objDeepCopy(
    //   vscompt.comptAttrs.drillWBeanList[vscompt.comptAttrs.curDrillIdx]
    //   .whereBean.rule_list[0]
    // );
    // if (
    //   drillWhereBean1 != undefined &&
    //   drillWhereBean1["exp_id"] != undefined
    // ) {
    //   drillWhereBean1["exp_id"] = "";
    //   whereBean = genWhereBean(
    //     [drillWhereBean1],
    //     objDeepCopy(whereBean),
    //     true
    //   );
    // }
    let wbRuleList = objDeepCopy(vscompt.comptAttrs.drillWBeanList[vscompt.comptAttrs.curDrillIdx].whereBean.rule_list) || [];
    let drillWBRule = wbRuleList.filter(item => {
      return item.exp_id.indexOf("drill_exp") > -1;
  });
    whereBean = genWhereBean(drillWBRule, objDeepCopy(whereBean), true);
    selectList = getSelectList(
      [
        objDeepCopy(
          vscompt.comptAttrs.drillWBeanList[vscompt.comptAttrs.curDrillIdx]
            .item
        )
      ],
      yAxis1Data,
      yAxis2Data, vscompt.type
    );
  }
  let orderList = getOrderList(selectList);
  let params = {
    reqType: "1",
    dataType: dataType,
    afQueryBean: {
      af_id: vscompt.afId,
      begin_date: "",
      head_bean: {
        pageCount: 100, //图形不要分页,限制100条  表格要
        start: "",
        user_id: window.sessionStorage.getItem("user_id")
      },
      is_need_log: 1,
      is_need_paging: 0,
      is_need_permission: 1,
      is_need_trans: 1,
      query_type: "1",
      select_list: selectList,
      order_list: orderList,
      where_bean: whereBean
    }
  }

  // 判断是否有图例维度增加colDimList和rowDimList
  const param = {
    xAxisData,
    selectList,
    yAxis1Data,
    yAxis2Data
  }
  let transParam = transposeParams(param)
  if (transParam.trans) {
    params.afQueryBean.select_list = transParam.select_list
    params.colDimList = transParam.colDimList
    params.rowDimList = transParam.rowDimList
  }
  return params
}

// 根据一对的rel_af_id,rel_element_id,af_id获取匹配的element_id 没结果就为空
const getMatchedElementId = function ({
                                        pageParams,
                                        rel_af_id,
                                        rel_element_id,
                                        af_id
                                      }) {
  let res = "";
  pageParams = pageParams.filter(val=>{ //筛选出内部参数
    return (!val.type || val.type==='inner')
});
  for (const param of pageParams) {
    if (JSON.stringify(param.dsList || {}) != "{}") {
      if (param.dsList[af_id] && param.dsList[rel_af_id] && param.dsList[rel_af_id] == rel_element_id) {
        res = param.dsList[af_id];
        break;
      }
    }
  }
  return res;
};

// 获取外部参数的element_id,没结果就为空
const getOuterElementId = function ({
                                      pageOutParams,
                                      rel_af_id,
                                      rel_element_id,
                                      af_id
                                    }) {
  let res = [];
  pageOutParams = pageOutParams.filter(val=>{
    return val.type === 'outer'
  });
  if(pageOutParams.length > 0) {
    for (const param of pageOutParams) {
      if (JSON.stringify(param.dsList || {}) != "{}") {
        if (param.dsList[af_id] && param.dsList[rel_af_id] && param.dsList[rel_af_id] == rel_element_id) {
          let temp = {};
          temp.elementId = param.dsList[af_id];
          temp.key = param.name;
          res.push(temp);
        }
      }
    }
  }
  return res;
}

// 增加公共参数条件
// 子页面没有查询组件,但有设公共参数且前一页面有设查询条件 需根据公共参数将公共参数值传给
const addParamWBean = function (oriWhereBean1, comp, datasetMap, pageParams, queryCompts, pageId) {
  let oriWhereBean = objDeepCopy(oriWhereBean1);
  let queryCondis = getQueryCondi(pageId);
  /* 外部参数start */
  let outerParam = sessionStorage.getItem("outerParam");
  if(outerParam) {  //含有外部参数
    outerParam = JSON.parse(outerParam) || {};
    // let comptAxis = (comp.comptAttrs.xAxisData || []).concat(comp.comptAttrs.yAxis1Data || []).concat(comp.comptAttrs.yAxis2Data || []).concat(comp.comptAttrs.yAxisData || []);
    let comptAfId = comp.afId;
    let comptAxis = datasetMap[comptAfId] || [];
    let outerCondi=[];
    let op = sessionStorage.getItem('pageOutParams');
    let pageOutParams = JSON.parse(op) || [];
    for(let axis of comptAxis){
      let tempList = getOuterElementId({
        pageOutParams,
        rel_af_id: axis.af_id,
        rel_element_id: axis.element_id,
        af_id: comp.afId
      })
      if(tempList.length>0){
        tempList.forEach(temp=>{
          if (temp.elementId != null) {
          let res = getFieldFromDsMap(datasetMap, {
            element_id: temp.elementId,
            af_id: comp.afId
          });
          // let value = outerParam[temp.key];
          let urlParam = outerParam[temp.key];
          if(urlParam) {
            urlParam = decodeURIComponent(urlParam);  //先解码=?等特殊字符
            let value = Base64.decode(urlParam);  //再解密
            outerCondi.push({
              col_id: res.col_id,
              col_type: "2",
              exp_id: "",
              is_dim: res.type==="ElCascader"?1:0,
              symbol: 3, //=
              rule_value: value,
              obj_id: res.tab_id,
              element_id: res.element_id,
              rel_element_id: res.element_id
            });
          }
        }
      })
      }
    }
    if (outerCondi.length == 0) return oriWhereBean;
    let whereBean = objDeepCopy(oriWhereBean);
    let curExp = "",
      curRuleList = [],
      idx = 1;
    let expName = "outer_exp";
    for (let condi of outerCondi) {
      // 判断当前wherebean条件中有没有查询组件的条件，有的话从上一页传递的查询条件应该不要加进来
      let flag2 = oriWhereBean.rule_list.some(rule => {
        return rule.rel_element_id == condi.rel_element_id
      })
      if (!flag2) {
        let exp_id = expName + idx;
        condi.exp_id = exp_id;
        if (curExp.length == 0) {
          curExp += exp_id;
        } else {
          curExp += ` and ${exp_id}`;
        }
        curRuleList.push(condi);
        idx++;
      }

    }
    if (oriWhereBean.exp.trim() == "") {
      whereBean.exp = curExp;
      whereBean.rule_list = curRuleList;
    } else if (curExp != "") {
      whereBean.exp = `(${oriWhereBean.exp}) and (${curExp})`;
      whereBean.rule_list = oriWhereBean.rule_list.concat(curRuleList);
    }
    oriWhereBean = whereBean;
  }
  /* 外部参数end */
  if (queryCondis.length == 0) {
    return oriWhereBean; //上一页没有传递查询条件
  }
  if (queryCompts.length > 0) {
    return oriWhereBean; //子页面有查询条件
  }
  // 判断组件与查询组件是否有进行参数设置
  let otherCondis = [];
  for (const condi of queryCondis) {
    let elementId = getMatchedElementId({
      pageParams: pageParams,
      rel_af_id: condi.rel_af_id,
      rel_element_id: condi.rel_element_id,
      af_id: comp.afId
    });
    if (elementId != "") {
      let res = getFieldFromDsMap(datasetMap, {
        element_id: elementId,
        af_id: comp.afId
      });
      if (res.tab_id) {
        otherCondis.push({
          ...objDeepCopy(condi),
          ...{
            element_id: elementId,
            obj_id: res.tab_id || "",
            col_id: res.col_id || "",
            rel_element_id: condi.rel_element_id
          }
        });
      }
    }
  }
  if (otherCondis.length == 0) return oriWhereBean;

  let whereBean = objDeepCopy(oriWhereBean);
  let curExp = "",
    curRuleList = [],
    idx = 1;
  let expName = "param_exp";
  for (let condi of otherCondis) {
    // 判断当前wherebean条件中有没有查询组件的条件，有的话从上一页传递的查询条件应该不要加进来
    let flag2 = oriWhereBean.rule_list.some(rule => {
      return rule.isFromQuery && rule.rel_element_id == condi.rel_element_id
    })
    if (!flag2) {
      let exp_id = expName + idx;
      condi.exp_id = exp_id;
      if (curExp.length == 0) {
        curExp += exp_id;
      } else {
        curExp += ` and ${exp_id}`
      }
      curRuleList.push(condi)
      idx++
      // 当前whereBean条件为时间格式,如果当前查询组件的时间格式与源时间格式不一致,传范围到后台
      if (condi.cycleType === 'date' && condi.format && condi.format !== condi.target_format) {
        let condi2 = objDeepCopy(condi)
        condi.symbol = 5 // >=
        condi2.symbol = 1 // <
        let value = condi.rule_value
        condi2.rule_value = getTimeFromOffset(condi2.target_format, 1, value)
        if (condi.format && condi.format.toLowerCase() !== 'yyyy' && condi.target_format && condi.target_format.toLowerCase() === 'yyyy') {
          var splits = condi.format.indexOf('/') > -1 ? '/' : (condi.format.indexOf('-') > -1 ? '-' : '')
          condi.target_format = 'yyyy' + splits + 'MM'
          condi2.target_format = 'yyyy' + splits + 'MM'
          if (condi.rule_value) {
            condi.rule_value += (splits + '01')
            condi2.rule_value += (splits + '01')
          }
        }
        let exp_id2 = expName + idx + '$'
        condi2.exp_id = exp_id2
        curRuleList.push(condi2)
        curExp += ` and ${exp_id2}`
        idx++
      }
    }
  }
  if (oriWhereBean.exp.trim() == "") {
    whereBean.exp = curExp;
    whereBean.rule_list = curRuleList;
  } else if (curExp != "") {
    whereBean.exp = `(${oriWhereBean.exp}) and (${curExp})`;
    whereBean.rule_list = oriWhereBean.rule_list.concat(curRuleList);
  }
  return whereBean;
};

// 获取查询条件
const getQueryCondi = function (pageId1) {
  let qc = sessionStorage.getItem('queryCondis');
  let queryCondisObj = JSON.parse(qc || "{}") || {};
  let pc = sessionStorage.getItem('pageCache');
  let pageCache = JSON.parse(pc || "{}") || {};
  let pageId = pageCache.pageId || "";
  if (pageId1) {
    pageId = pageId1;
  }
  let queryCondis = queryCondisObj[pageId] || [];
  return queryCondis;
};

// 查询组件类型对应
const queryFieldMap = function (type) {
  const mapKey = {
    "ElCascader": {
      "key": "conArea",
      "condiKey": "conArea",
      "valueKey": [{
        "keyName": "m_value",
        "isDeepClone": true //是否需要深拷贝
      }]
    },
    "ElDatePicker": {
      "key": "cycleType",
      "condiKey": "cycleType",
      "valueKey": [{
        "keyName": "m_value",
        "isDeepClone": true
      }]
    },
    "ElNumber": {
      "key": "radioCalcu",
      "condiKey": "radioCalcu",
      "valueKey": [{
        "keyName": "numList",
        "isDeepClone": true
      }]
    },
    "ElInput": {
      "key": "symbol",
      "condiKey": "compt_symbol",
      "valueKey": [{
        "keyName": "m_value",
        "isDeepClone": false
      }]
    }
  };
  return mapKey[type] || {};
};
/**
 * 数值转化万、亿单位
 * 参数1：数值，参数2：小数点位数
 */
const transNumber = function (num, decimalDigit) {
  num = parseFloat(num) || 0;
  if (decimalDigit === null || decimalDigit === undefined) {
    decimalDigit = 3;
  }
  if (num >= 10000 && num < 100000000) {
    return (num / 10000).toFixed(decimalDigit) + "万";
  } else if (num >= 100000000) {
    return (num / 100000000).toFixed(decimalDigit) + "亿";
  } else {
    return num;
  }
};
/**
 * 数值转化万、亿单位并用逗号分隔
 * 参数1：数值，参数2：小数点位数
 */
const formatNumber = function (value, decimalDigit) {
  if (!decimalDigit) {
    decimalDigit = 0;
  }
  function toThousands(num) {
    let result = "", decimal = "", intNum = "";
    num = (num || 0).toString();
    if (num.indexOf(".") >= 0) {
      intNum = num.slice(0, num.indexOf("."));
      decimal = num.slice(num.indexOf("."));
    } else {
      intNum = num;
    }
    while (intNum.length > 3) {
      result = ',' + intNum.slice(-3) + result;
      intNum = intNum.slice(0, intNum.length - 3);
    }
    if (intNum) { result = intNum + result; }
    result = isNegative ? "-" + result : result;
    return result + decimal;
  }
  if ((typeof value === 'number' && !isNaN(value)) || (!isNaN(parseInt(value)) && value.indexOf('-') === -1)) {
    var isNegative = value < 0 ? true : false;
    value = Math.abs(value);
    if (value >= 10000 && value < 100000000) {
      return toThousands((value / 10000).toFixed(decimalDigit)) + "万";
    } else if (value >= 100000000) {
      return toThousands((value / 100000000).toFixed(decimalDigit)) + "亿";
    } else {
      return toThousands(value.toFixed(decimalDigit));
    }
  } else {
    return value;
  }
};
/**
 * 数值保留位数四舍五入
 * 参数1：数值，参数2：小数点位数
 */
const format45 = function (val, decimalDigit) {
  decimalDigit = Math.pow(10, decimalDigit)
  if (isNaN(val) || val == undefined) { return null; }
  return Math.round(val * decimalDigit) / decimalDigit;
};
/**
 * 过滤要传递的查询条件
 * param:{
 *  queryCondis:原查询条件
 * queryCompts：目标页面的查询组件
 * pageParams:公共参数设置
 * }
 */
const filterQueryCondis = function ({
                                      queryCondis,
                                      queryCompts,
                                      pageParams
                                    }) {
  let resultCondis = [];
  if (pageParams.length > 0 &&
    queryCondis.length > 0) {
    if (queryCompts.length > 0) { // 1.子页面有查询组件,且有设公共参数且前一页面有设查询条件
      // 如果主页面与子页面都有查询组件时，且两个查询组件对应的数据集，都已添加到公共参数中，在从主页面跳转到子页面，需要把主页面设置的查询条件默认带给子页面的查询条件，传递条件的前提是子页面中查询组件绑定的数据集参与了公共参数的设置
      for (const comp1 of queryCompts) {
        for (const field of comp1.comptAttrs.fieldList || []) {
          for (let condi of queryCondis) {
            if (condi.compt_type != field.type) continue;
            let elementId = getMatchedElementId({
              pageParams: pageParams,
              rel_af_id: condi.rel_af_id,
              rel_element_id: condi.rel_element_id,
              af_id: field.comptAttrs.af_id
            });
            let fieldMap1 = queryFieldMap(field.type);
            // elnumber 如果num_list数组长度只一个，没有radioCalcu，要手动补上
            if (field.type == "ElNumber" && (condi.numList || []).length == 1) condi[fieldMap1.condiKey] = "0";
            let isNeedAdd = true; //如果是空的，不要塞
            // 除elinput外，其他查询组件需要满足 类型一致
            switch (condi.compt_type) {
              case "ElNumber": //同且同或
                if ((condi.numList || []).join("").trim() == "" || field.comptAttrs[fieldMap1.key] !=
                  condi[fieldMap1.condiKey]) isNeedAdd = false;
                break;
              case "ElCascader": //同单选同复选
              case "ElDatePicker": //同daterange同date
                if ((condi.m_value || []).join("").trim() == "" || field.comptAttrs[fieldMap1.key] !=
                  condi[fieldMap1.condiKey]) isNeedAdd = false;
                break;
              case "ElInput":
                if ((condi.m_value || "").trim() == "") isNeedAdd = false;
                break;
              default:
                break;
            }
            if (
              elementId != "" &&
              elementId == field.comptAttrs.element_id &&
              JSON.stringify(fieldMap1) != "{}" && isNeedAdd
            ) {
              let copyCondi = objDeepCopy(condi);
              copyCondi.element_id = elementId;
              resultCondis.push(copyCondi);
            }
          }
        }
      }
    } else { //2.如果上一页有查询条件，下一页没查询条件 也要传查询条件
      resultCondis = objDeepCopy(queryCondis);
    }
  }
  return resultCondis;
};


/**
 * 时间格式转化
 * {
 * sourceFormat:源格式
 * targetFormat：目标格式
 * source：源数据
 * }
 */
const dateFormatTrans = function ({
                                    sourceFormat,
                                    targetFormat,
                                    source
                                  }) {
  let result = "";
  source = source + "";
  // const FORMAT_ARRAR = ["YYYY", "YYYYMM", "YYYYMMDD", "YYYY-MM", "YYYY-MM-DD", "YYYY/MM", "YYYY/MM/DD", "YYYYMMDDHHMISS", "YYYYMMDD HH:MI:SS", "YYYY-MM-DD HH:MI:SS", "YYYY/MM/DD HH:MI:SS"];
  if (source.trim() == "") return "";
  if (sourceFormat == targetFormat) return source;
  let sourceStr = source.replace(/[-:\/ ]/g, "").trim(); //先去除里面的空格等符号，只留数字
  result = targetFormat.toLocaleUpperCase();
  const FORMAT_ARRAR = [{
    "key": "YYYY",
    "start": 0
  }, {
    "key": "MM",
    "start": 4
  }, {
    "key": "DD",
    "start": 6
  }, {
    "key": "HH",
    "start": 8
  }, {
    "key": "MI",
    "start": 10
  }, {
    "key": "SS",
    "start": 12
  }];
  for (const item of FORMAT_ARRAR) {
    if (result.indexOf(item.key) > -1) {
      let len = item.key.length;
      if (sourceStr.length >= item.start + len) { //有数据就填数据，没数据补相应长度的0
        result = result.replace(item.key, sourceStr.substring(item.start, item.start + len));
      } else {
        result = result.replace(item.key, (new Array(len)).fill("0").join(""));
      }
    }
  }
  return result;
};

/**
 * 切换元素样式
 * 参数1：元素，参数2：样式类
 */
const toggleClass = function (el, className) {
  let classList = [...el.classList]
  if (classList.includes(className)) {
    el.classList.remove(className)
  } else {
    el.classList.add(className)
  }
};

// 交叉表表格数据处理 表头有空数据，表头单元格完全不做合并
/**
 * allData：请求回来数据
 * rowCount：表头行统计
 * dimFieldList:有绑定维层的维度字段
 */
const getNoMergeTableData = function (allData, rowCount, dimFieldList) {
  //rowCount-行数
  // 构造表头
  let tempArr = [];
  // 先对allData做单元格数据处理
  for (let index = 0; index < allData.length; index++) {
    let rowData1 = allData[index].data_list || [];
    for (let index2 = 0; index2 < rowData1.length; index2++) {
      let secRowData = rowData1[index2];
      let res = handleTbDimCell(secRowData.data_val || "", dimFieldList);
      let cellLabel = res.cellValue;
      secRowData.data_val = cellLabel;
      if (res.isDim) {
        secRowData["isDim"] = true;
        secRowData["dimInfo"] = res.dimInfo;
      }
    }
  }

  const rowlen = rowCount === -1 ? 0 : rowCount
  for (let index1 = 0; index1 <= rowlen; index1++) {
    const rowData1 = allData[index1].data_list || [];
    for (let index2 = 0; index2 < rowData1.length; index2++) {
      let prop = "";
      if (index1 == rowlen) {
        prop = "col" + index2;
      }
      let prevRowIdx = index1 - 1;
      let parent = `row-${prevRowIdx}-col-${index2}`;
      if (prevRowIdx == -1) {
        parent = "";
      }

      let rowItem = {
        label: rowData1[index2].data_val,
        parent: parent,
        pos: `row-${index1}-col-${index2}`,
        prop: prop
      };

      if (rowData1[index2].isDim) {
        rowItem["dimInfo"] = rowData1[index2].dimInfo;
      }
      if (allData[0].data_list[index2].align) {
        rowItem["align"] = allData[0].data_list[index2].align;
      }
      tempArr.push(rowItem);
    }
  }

  let tree = ArrayToTree2(tempArr, "");
  let tableData1 = [];
  for (let index1 = rowCount + 1; index1 < allData.length; index1++) {
    const rowData1 = allData[index1].data_list || [];
    let rowObj = {};
    for (let index2 = 0; index2 < rowData1.length; index2++) {
      rowObj["col" + index2] = rowData1[index2].data_val;
      rowObj[`col${index2}-condi`] = {
        condiSetSymbol: rowData1[index2]["condiSetSymbol"] || "",
        condiSetStyle: rowData1[index2]["condiSetStyle"] || {}
      };
      if (rowData1[index2].isDim) {
        rowObj[`col-${index2}-dimInfo`] = rowData1[index2].dimInfo;
      }
    }
    tableData1.push(rowObj);
  }
  return {
    rows: tableData1,
    columns: tree
  };
};

// 处理交叉表聚合表格单元格字段的数据
/**
 * dimFieldList:有绑定维层的维度字段
 */
const handleTbDimCell = function (dataVal, dimFieldList) {
  let result = {
    isDim: false,
    dimInfo: {},
    cellValue: "",
    dimElementId: ""
  };
  let oriVal = dataVal || "";
  if (oriVal.trim() == "") //oriVal == null ||
    return result;
  let regRes = oriVal.match(/drillHandle\(.+?\)(?='>)/g);
  // <a href='Javascript:void(0);' onclick='drillHandle("null","品牌", "11", "全球通")'>全球通</a>
  // drillHandle("null","用户流量档次名称", "(10,50M]", "(10,50M]") 兼容这两种 所以用引号分隔
  if (regRes != null) { //有绑定维层的字段要存储对应翻译信息
    let matchCont = regRes[0];
    // 用引号截取，不太稳定，万一数据里面有引号，结果就不对
    // let argumentsStr = matchCont.substring(13, matchCont.length - 2);
    // let subCont = (argumentsStr || "").split('"');
    // subCont = (subCont || []).filter(item=>{
    //   return item != "" && item.trim() != ","
    // });
    // for (let index = 0; index < subCont.length; index++) { //去除双引号
    //   subCont[index] = (subCont[index] || "").replace(/\"/g, "").trim();
    // }

    // 解决办法 模拟eval
    let argumentsStr = matchCont.substring(12, matchCont.length - 1);
    let subCont = evalMock("["+argumentsStr+"]");

    if ((subCont || []).length >= 4) {
      result.dimInfo = {
        dimFieldName: subCont[1], //维度字段名称
        dimCode: subCont[2], //维度对应编码
        dimValue: subCont[3], //维度对应值
        dimElementId: "" //维度字段element_id
      }
      result.cellValue = subCont[3];
      result.isDim = true;
      let field = dimFieldList.filter(item => {
        return item.label == subCont[1] //element_name  时间字段不同时间类型格式对应不同的element_name，接口只识别原来的时间字段element_name 所以改用label匹配
      });
      if (field.length > 0) {
        result.dimInfo.dimElementId = field[0].element_id;
      }
    } else {
      let cell = oriVal.match(/\>.+?\</g);
      result.cellValue = cell == null ? "" : (cell[0] || "").replace(/\"/g, "").trim(); //cell[0].substring(1, cell[0].length - 1)
    }
  } else {
    result.cellValue = oriVal;
  }
  return result;
}

// 模拟eval
const evalMock = function(str){
  return new Function('return '+str)()
};

// 线性数据转化为树。
const ArrayToTree2 = function (data, parent_id) {
  var tree = [];
  // var temp;
  for (var i = 0; i < data.length; i++) {
    let obj = {
      ...data[i],
      ...{
        children: []
      }
    };
    if (data[i].parent == parent_id) {
      let temp = ArrayToTree2(data, data[i].pos) || [];
      if (temp.length > 0) {
        obj.children = temp;
      }
      // if (
      //   !tree.some(item => {
      //     return item.label == obj.label;
      //   })
      // )
      tree.push(obj);
    }
  }
  return tree;
};

// 交叉表 聚合情况下 请求参数构造
const getTableReqParam = function ({
                                     params,
                                     yAxis1Data,
                                     polymerizeType,
                                     vscompt
                                   }) {
  //表格请求不太格式跟其他组件不一样
  //修复:时间字段不同时间类型格式对应不同的element_name已经为element_name+(时间格式)，label为element_name,将此段代码注释 ---add by songjj 2020-08-31
  // 时间字段不同时间类型格式对应不同的element_name，接口只识别原来的时间字段element_name 所以改用label匹配
//   (params.afQueryBean.select_list || []).forEach((item,index)=>{
//     params.afQueryBean.select_list[index].element_name = item.label;
// })
  let selectList = params.afQueryBean.select_list;

  params.dataType = 6;
  params.afQueryBean.head_bean.pageCount = -1;
  params.afQueryBean.head_bean.start = -1;
  params.afQueryBean.is_need_paging = 2;
  params.afQueryBean["is_force_group_by"] = 1;
  let colDimIds = [];
  yAxis1Data.forEach(item => {
    colDimIds.push(item.element_id);
})
  params["colDimList"] = selectList.filter(item => {
    if (colDimIds.includes(item.element_id) && item.nick_name.indexOf("_drill") == -1) {
    return item;
  }
})
  params["rowDimList"] = selectList.filter(item => { // && item.element_type == 1
    if (!colDimIds.includes(item.element_id) && item.nick_name.indexOf("_drill") == -1) {
    return item;
  }
});

  params["countDataField"] = "";
  params["needTitle"] = true;
  params["needTotal"] = false;
  params["query_type"] = polymerizeType; //1-聚合 2-明细
  params["hiddenDimList"] = [];
  params["drillDimList"] = [];
  params["autoMerge"] = true;

  if (polymerizeType == 1) {
    let index1 = -1
    let attrs = vscompt.styleAttrs[3].children || []
    attrs.some((atts,index) => {
      index1 = index
      return atts.enName === "subTotalCol"
    })
    if ( attrs[index1].value !=="") {
      params.countDataField = attrs[index1].value //总计、小计字段
      params["needTotal"] = attrs[index1+1].value; //总计
      params["needSubTotal"] = attrs[index1-1].value; //小计
    } else {
      params["needTotal"] = false;
      params["needSubTotal"] = false;
      attrs[0].value = false;
      attrs[2].value = false;
      vscompt.comptAttrs.extendSetting.subTotal = false;
      vscompt.comptAttrs.extendSetting.totalRow = false;
    }
  }
  setPolymerCrossTbCols({
    vscompt: vscompt,
    selectList: params.afQueryBean.select_list
  });

  // 因为要保证所有维度字段（不论有没有绑定维层）都可以点击，所以selectlist应该要包含所有维度字段的翻译
  let tempDrillArr = [],
    hasDrillArr = [];
  selectList.forEach(item1 => {
    if (item1.nick_name.indexOf("_drill") > -1) {
    hasDrillArr.push(item1.element_id);
  }
});
  for (let index = 0; index < selectList.length; index++) {
    let element1 = objDeepCopy(selectList[index]);
    if (element1.nick_name.indexOf("_drill") == -1 && !hasDrillArr.includes(element1.element_id) && element1.element_type == 1) {
      element1.nick_name = element1.nick_name + "_drill";
      tempDrillArr.push(element1);
    }
  }

  params.afQueryBean.select_list = selectList.concat(tempDrillArr);
  if(polymerizeType == 1){
    // 构造要翻译的维度字段
    let dimElementIds = [];
    params.afQueryBean.select_list.forEach(item => {
      if (item.nick_name.indexOf("_drill") > -1) {
      dimElementIds.push(item.element_id);
    }
  });
    let crossTableDrillList = params.afQueryBean.select_list.filter(
      item => {
      return (
        dimElementIds.includes(item.element_id) &&
        item.nick_name.indexOf("_drill") == -1
  );
  }
  );
    if (crossTableDrillList.length > 0) {
      params["drillDimList"] = crossTableDrillList;
    }
  }
  return params;
};

// 交叉表 聚合情况下 列设置
const setPolymerCrossTbCols = function ({
                                          vscompt,
                                          selectList
                                        }) {
  //聚合情况下要构造columns用于样式设置
  let allCols = objDeepCopy(selectList);
  allCols = allCols.filter(item => {
    return item.nick_name.indexOf("_drill") == -1;
});
  for (let index = 0; index < allCols.length; index++) {
    allCols[index]["prop"] = allCols[index].element_id;
  }
  vscompt.comptData.columns = allCols;
}

// 初始化组件名称
const initComptName = function (vscompt) {
  let setting = vscompt.comptAttrs.extendSetting;
  let attr = vscompt.comptAttrs;
  let compPrefixName = attr.name;
  if (vscompt.type === "HdVerTitle") { //椭圆标题 名称比较特殊
    compPrefixName = "椭圆标题";
  }
  let name = compPrefixName + vscompt.orderId;
  if (vscompt.type === "HdVerTitle") {
    vscompt.comptAttrs.extendSetting["titletext"] = name;
    vscompt.styleAttrs[0].children[0].value = name;
  }
  if (vscompt.type === "HdTitle") {
    vscompt.comptAttrs.extendSetting["titletext"] = name;
    vscompt.styleAttrs[0].children[2].value = name;
  }
  if (vscompt.type === "HdTitleShape") {
    vscompt.styleAttrs[0].children[0].value = name;
  }
  if (setting != null && setting["comptName.text"] == "") {
    setting["comptName.text"] = name;
    let style = vscompt.styleAttrs[0].children || [];
    for (let item of style) {
      if (item.enName == "comptName.text") {
        item.value = name;
        break;
      }
    }
  }
}

// 组件复制修改名称
const genComptName = function (compt, s_edcuicompts) {
  let newName = compt.comptAttrs.extendSetting['comptName.text'] + '_副本'; //修改组件名称
  let reg = new RegExp("(" + newName + "\\d+)", "g");
  let reg2 = /(\d+)$/g;
  let numList = [];
  for (let k = 0; k < s_edcuicompts.length; k++) {
    if (s_edcuicompts[k].comptAttrs.extendSetting['comptName.text'].match(reg)) {
      let num = s_edcuicompts[k].comptAttrs.extendSetting['comptName.text'].match(reg2)[0];
      numList.push(num);
    }
  }
  if (numList.length > 0) {
    let max = Math.max(...numList);
    newName = newName + (parseInt(max) + 1);
  } else {
    newName = newName + '1';
  }
  compt.comptAttrs.extendSetting['comptName.text'] = newName;
  let styleList = compt.styleAttrs[0].children || [];
  for (let i = 0; i < styleList.length; i++) {
    if (styleList[i].enName == 'comptName.text') {
      styleList[i].value = newName;
      break;
    }
  }
}

/**
 * 深拷贝对象 且将属性名称由下划线格式改为驼峰格式 eg：“tab_chs_name” --->tabChsName
 * type:1--“tab_chs_name” --->tabChsName
 *      2--tabChsName ---> “tab_chs_name”
 * defaultKeyMap: 修改key datasetId-> af_id
 *  */
const objClone = function (source, type, defaultKeyMap) {
  var sourceCopy = source instanceof Array ? [] : {};
  for (var item in source) {
    let keyName = "";
    // 将属性名称类似“tab_chs_name” 改为驼峰格式tabChsName
    if (type === 1) {
      keyName = item.replace(/_[a-zA-Z]/g, function (word) {
        return word.substring(1).toUpperCase();
      });
    } else { //将"tabChsName"改成"tab_chs_name"
      if (defaultKeyMap && defaultKeyMap[item]) {
        keyName = defaultKeyMap[item]
      } else {
        keyName = item.replace(/[A-Z]/g, function (word) {
          return "_" + word.toLowerCase();
        });
      }
    }
    if (source[item] == null) sourceCopy[keyName] = null;
    else {
      sourceCopy[keyName] =
        typeof source[item] === "object" ?
          objClone(source[item], type, defaultKeyMap) :
          source[item];
    }
  }
  return sourceCopy;
};

const dataInterval = function (s, fn, judge, param) {
  clearTimeout(judge.timer);
  let timeOut = (s, fn, param) => {
    judge.timer = setTimeout(() => {
      if (s > 0) {
      if (param) {
        fn(param)
      } else {
        fn();
      }
      timeOut(s, fn);
    } else {
      clearTimeout(judge.timer);
    }
  }, s)
  }
  timeOut(s, fn, param);
}

const fieldMatch = function (type, list) {
  /* let reg = null, result = false;
  switch(type){
    case 'number':
      reg = /number|tinyint|smallint|mediumint|int|bigint|integer|float|double|decimal|double precision|real|numeric/gi;
      result = reg.test(source);
      break;
    case 'character':
      reg = /char|string|varchar2|varchar|text/gi;
      result = reg.test(source);
      break;
    case 'date':
      reg = /date|timestamp|datetime|interval|time|tear/gi;
      result = reg.test(source);
      break;
    case 'other':
      reg = /clob|tinyblob|blob|boolean|binary|mediumblob|array|longblob|map|struct|uniontype/gi;
      result = reg.test(source);
      break;
  }
  return result; */

  type = (type || "").toLowerCase();
  //处理字段类型带括号如：timestamp(6)
  var reg = /\(\d+\)/;
  type = type.replace(reg, "");
  let result = '';
  let showType = (list[type] || {}).showType;
  if (showType) {
    switch (showType) {
      case '1':
        result = 'number';
        break;
      case '2':
        result = 'char';
        break;
      case '3':
        result = 'date';
        break;
    }
  } else {
    result = "null";
  }
  return result;
}


//静态模板清除各种联动
const resetTemplateCompt = function (comp, operation) {
  //替换静态数据
  const comptData = require('@/../public/comptConfig/comptData.json');
  let comptAttrs = comp.comptAttrs;
  let extendSetting = comptAttrs.extendSetting;
  let styleAttrs = comp.styleAttrs;

  if (comp.type == "ElTabs" || comp.type == "ElCarousel") {
    comptAttrs.editableTabs.forEach((item, i) => {
      item.comptList.forEach((tabCompt, j) => {
        //如果轮播和tab容器里面的组件数据集为空，则用静态数据
        if (tabCompt.afId == "" || operation == "templateview") {
      tabCompt.afId = "";
      resetTemplateCompt(tabCompt, operation);
    }
  });
  });
  }
  comptAttrs.colSetting = {};
  if (comp.comptAttrs.isBindData != undefined && comp.comptAttrs.isBindData == "1") {
    if (comp.type == "CrossTable" || comp.type == "ElDatagrid") {
      comp.comptData = comptData[comp.type].comptData;
      comptAttrs.colSetting = comptData[comp.type].colSetting;
    } else if (comp.type == "MobileQuery") {
      comptAttrs.fieldList[0].comptAttrs = comptData[comp.type].fieldList[0].comptAttrs;
    } else {
      comp.comptData = comptData[comp.type];
    }

    //组件特殊处理
    if (comp.type == 'ElDatagrid') {
      extendSetting['pagination.total'] = 10;
    } else if (comp.type == "CrossTable") {
      comptAttrs.polymerizeType = 2;
      extendSetting['pagination.total'] = 10;
    } else if (comp.type == 'HdKpiBlock' || comp.type == 'HdKpiBlock2') {
      extendSetting['series'][0].name = comp.comptData.columns[0];
    } else if (comp.type == 'HdKpiBlock3') {
      extendSetting['series'][0].name = comp.comptData.columns[0];
      // extendSetting['series'][1].name = comp.comptData.columns[1];
    }

    //删除多余系列和图例
    let maxYAxisLen = 1;
    if (comp.type == 'VeCombineChart' || comp.type == 'VeGauge' || comp.type == 'VeCombineStack') {
      maxYAxisLen = 2;
    }
    let keys = Object.keys(extendSetting)
    for (let key of keys) {
      //系列
      if (key.includes("series.")) {
        let inx = parseInt(key.split(".")[1]);
        if (inx > (maxYAxisLen - 1) && (typeof extendSetting[key] != 'object' || key.includes("barBorderRadius") || key.includes("barWidth") || key.includes("markPoint"))) {
          delete extendSetting[key];
        }
      }
      //图例
      if (key.includes("legend.data.")) {
        let inx = parseInt(key.split(".")[2]);
        if (inx > (maxYAxisLen - 1)) {
          delete extendSetting[key];
        }
      }
    }
    //重置样式中系列设置
    styleAttrs.forEach((styleAttr, i) => {
      if (styleAttr.enName == "seriesAttrs") {
      styleAttr.children.forEach((item, i) => {
        item.value = "";
      if (item.enName == "comptData") item.options = [];
    });
    }
  });
  }
}

/**
 * 对象指定一级属性的深拷贝
 * eg:partialDeepCopy(store,["contextUrl","defaultSystemId","commonProperties","HomeTree", "HomeBody"]);
 *  */
const partialDeepCopy = function (source, neededAttrArr) {
  let sourceCopy = source instanceof Array ? [] : {};
  for (let item in source) {
    if (neededAttrArr.includes(item)) {
      if (source[item] == null) sourceCopy[item] = null;
      else {
        sourceCopy[item] =
          typeof source[item] === "object" ?
            objDeepCopy(source[item]) :
            source[item];
      }
    }
  }
  return sourceCopy;
};

/**
 * 对象拷贝，修改部分键值
 * eg:
 * let oridiminfo = [{"dimValue":"0","dimValueDesc":"未知品牌","children":null,"parentDimValue":""},{"dimValue":"11","dimValueDesc":"全球通","children":null,"parentDimValue":""},{"dimValue":"12","dimValueDesc":"动感地带","children":null,"parentDimValue":""},{"dimValue":"13","dimValueDesc":"神州行","children":null,"parentDimValue":""}];
 * objDeepCopyAndChangeKey(oridiminfo,{"dimValue":"value","dimValueDesc":"label","parentDimValue":"parent_dim_value"})
 * 结果：[{"value":"0","label":"未知品牌","children":null,"parent_dim_value":""},{"value":"11","label":"全球通","children":null,"parent_dim_value":""},{"value":"12","label":"动感地带","children":null,"parent_dim_value":""},{"value":"13","label":"神州行","children":null,"parent_dim_value":""}]
 */
const objCloneByReplaceKey = function (source, keyMap) {
  var sourceCopy = source instanceof Array ? [] : {};
  for (var item in source) {
    let keyName = keyMap[item] || item;
    if (source[item] == null) sourceCopy[keyName] = null;
    else {
      sourceCopy[keyName] =
        typeof source[item] === "object" ?
          objCloneByReplaceKey(source[item], keyMap) :
          source[item];
    }
  }
  return sourceCopy;
};
/* 只输入正负数及小数 */
const inputNumber = function (val, type) {
  let reg = /^\-?(\d+\.)?\d*/
  let reg2 = /[^(\d|\.|\-|,)]/g
  let result = val.replace(reg2,'')
  try {
    if (type === 'mulit') { // 区间
      let res = result.split(',');
      let arr = []
      res.forEach(item=> {
        arr.push(reg.exec(item)[0])
      })
      result = arr.join().replace(/-,/g,'')
    } else {
      result = reg.exec(result)[0]
    }
  } catch(e) {}
  return result
}
/* 页面初始化时 计算时间偏移量 */
const setWhereBeantimeOffset = function (comp) {
  let rule_list = (comp.comptAttrs.whereBean||{}).rule_list ||[]
  rule_list.forEach( val => {
    if (val.isFromQuery !== true && !!val.format) {
    (comp.comptAttrs.filterData||[]).some(val1 => {
      let flag = false
      if (val.element_id === val1.element_id) {
      flag = true
      //偏移量设置
      if(val1.isSetDefault) {
        let suffix = "";
        let paramObj = [{type: 1, index: 0}, {type: 1, index: 1}]
        paramObj.forEach(obj => {
          if (obj.type == 1) {
          suffix = obj.index == 0 ? "1" : "2";
        }
        let offset = 0;
        if ((val1["timeOprCount" + suffix] || 0) != "") {
          offset = val1["timeOpr" + suffix] == 2 ? "-" + val1["timeOprCount" + suffix] : val1["timeOprCount" + suffix];
          offset = parseInt(offset);
        }
        let time = getTimeFromOffset(val.format, offset);
        if (val1.m_value[obj.index] || val1.m_value[obj.index] === 0) {
          val1.m_value[obj.index] = time
          if (val.symbol == 5 && obj.index == 0) {
            val.rule_value = time
          } else if (val.symbol == 4 && obj.index == 1) {
            val.rule_value = time
          }
        }
      })
      }
    }
    return flag
  })
  }
})
}
//base64加密解密
const Base64 = {
  _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  encode: function (e) {
    var t = "";
    var n, r, i, s, o, u, a;
    var f = 0;
    e = Base64._utf8_encode(e);
    while (f < e.length) {
      n = e.charCodeAt(f++);
      r = e.charCodeAt(f++);
      i = e.charCodeAt(f++);
      s = n >> 2;
      o = (n & 3) << 4 | r >> 4;
      u = (r & 15) << 2 | i >> 6;
      a = i & 63;
      if (isNaN(r)) {
        u = a = 64
      } else if (isNaN(i)) {
        a = 64
      }
      t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
    }
    return t
  },
  decode: function (e) {
    var t = "";
    var n, r, i;
    var s, o, u, a;
    var f = 0;
    e = e.replace(/[^A-Za-z0-9+/=]/g, "");
    while (f < e.length) {
      s = this._keyStr.indexOf(e.charAt(f++));
      o = this._keyStr.indexOf(e.charAt(f++));
      u = this._keyStr.indexOf(e.charAt(f++));
      a = this._keyStr.indexOf(e.charAt(f++));
      n = s << 2 | o >> 4;
      r = (o & 15) << 4 | u >> 2;
      i = (u & 3) << 6 | a;
      t = t + String.fromCharCode(n);
      if (u != 64) {
        t = t + String.fromCharCode(r)
      }
      if (a != 64) {
        t = t + String.fromCharCode(i)
      }
    }
    t = Base64._utf8_decode(t);
    return t
  },
  _utf8_encode: function(string) {
    string = string.replace(/\r\n/g,"\n");
    var utftext = "";
    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }

    }
    return utftext;
  },
  _utf8_decode: function(utftext) {
    var string = "", i = 0, c = 0, c2 = 0, c3 = 0;
    while ( i < utftext.length ) {
      c = utftext.charCodeAt(i);
      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      } else if((c > 191) && (c < 224)) {
        c2 = utftext.charCodeAt(i+1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        c2 = utftext.charCodeAt(i+1);
        c3 = utftext.charCodeAt(i+2);
        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }
    }
    if(string.includes('\u0000')){
      string = string.replace(/\u0000/g, "");
    }
    return string;
  }
}


const zip = function(str){
  if(!!window.ActiveXObject || "ActiveXObject" in window){  //ie不加密
    return str;
  } else {
    let res = pako.gzip(str,{to:'string'})
    return res;
  }
}

const unzip = function(str){
  if(!!window.ActiveXObject || "ActiveXObject" in window){  //ie不解密
    return str;
  } else {
    let res = pako.ungzip(str,{to:'string'})
    return res;
  }
}

const concatComputedData = function(af_id,allColsData,computedData) {
  let list = allColsData.map(val=>{
    return val.element_id;
})
  for(let item of computedData) {
    if(item.af_id !== af_id){
      break;
    } else {
      if(!list.includes(item.element_id)) {
        allColsData.push(item);
      }
    }
  }
}

const initFuncDateParam = function (item, split, fieldTypeList) {
  // 内置函数： 1字符截取，2日期转格式，3代表数字
  let dgwFunction = '2' // date
  // 1 3 :"dgw_fun_param":["1","4"], 2:date "dgw_function":["YYYY"]
  let dgwFunParam = []
  // 日期字段的层级（1表示年,2表示月,3表示日,4表示小时,5表示分钟,6表示秒）
  let formatLevel = item.formatLevel
  // 数字 varchar类型
  let colType = fieldMatch(item.col_raw_type.toLowerCase(), fieldTypeList);
  if (['number', 'char'].includes(colType)) {
    dgwFunction = colType === 'number' ? '3' : '1'
    switch (formatLevel) {
      case 1:
        // 年
        dgwFunParam = ['1', '4']
        break
      case 2:
        // 月
        dgwFunParam = split == '' ? ['1', '6'] : ['1', '7']
        break
      case 3:
        // 日
        dgwFunParam = split == '' ? ['1', '8'] : ['1', '10']
        break
      case 4:
        // 时
        dgwFunParam = split == '' ? ['1', '12'] : ['1', '15']
        break
      case 5:
        // 分
        dgwFunParam = split == '' ? ['1', '14'] : ['1', '18']
        break
      case 6:
        // 秒
        dgwFunParam = split == '' ? ['1', '16'] : ['1', '21']
        break
      default:
    }
  } else { // date类型
    dgwFunParam = [item.show_format]
  }
  return { 'dgw_function': dgwFunction, 'dgw_fun_param': dgwFunParam }
}

/* 图表-颜色图例colDimList和rowDimList 构造 */
const transposeParams = function (param) {
  let xAxisData = param.xAxisData || []
  let selectList = param.selectList || []
  let yAxis1Data = param.yAxis1Data || []
  let yAxis2Data = param.yAxis2Data || []
  let params = {}
  const _legend = xAxisData.filter(item => item.isNewSetting === '_legend')
  if (_legend.length > 0) {
    if (selectList[selectList.length - 1].nick_name === 'XXXXCODE') {
      selectList.splice(1, 0, selectList[selectList.length - 1])
      selectList.pop()
    }
    selectList = selectList.filter(item => item.isNewSetting !== '_legend')
    selectList.push(..._legend)
    const rowDimList = _legend
    const colDimList = [
      ...selectList.filter(item => item.element_type == 1 && item.isNewSetting !== '_legend'),
  ...yAxis1Data.filter(item => item.element_type == 2),
  ...yAxis2Data.filter(item => item.element_type == 2)
  ]
    params.select_list = selectList
    params.colDimList = colDimList.map(item => {
      return {
        'col_id': item.col_id,
        'nick_name': item.nick_name,
        'element_name': item.element_name,
        'element_type': item.element_type,
        'element_id': item.element_id,
        'obj_id': item.tab_id
      }
    })
    params.rowDimList = rowDimList.map(item => {
      let temp = {
        'col_id': item.col_id,
        'nick_name': item.nick_name,
        'element_name': item.element_name,
        'element_type': item.element_type,
        'element_id': item.element_id,
        'obj_id': item.tab_id
      }
      if (item.element_type == 2) {
      temp.fun_type = item.fun_type
    }
    return temp
  })
    params.trans = true
  }
  return params
}

/* 接口getDataSetInfo 替换key值映射关系修改*/
const mapDataSetInfoKey =(param) => {
  const defaultKeyMap = {
    datasetId: "af_id",
    datasetName: "af_name",
    datasetDesc: "af_desc",
    elementList: "anly_frame_elements"
  }

  return objClone(param, 2, defaultKeyMap)
}

/* 组件查询完数据将isLoadData状态置为true */
const loadDataDone = (vscompt) => {
  vscompt.comptAttrs.isLoadData = true;
}

/* 查询数据异常，将错误信息打印到组件上 */
const loadDataError  = (vscompt,msg) => {
  vscompt.comptAttrs.isLoadData =  false;
  vm.$set(vscompt.comptAttrs,'queryInfo',msg);
}

/* 查询数据前,对组件请求参数做下微调  */
const adjustQueryParams = ({ params, activedCompt }) => {
  let newParams = { ...params };
  const { type } = activedCompt;
  switch (type) {
    case 'PivotTable':
      // 透视表 select_list只要传第一个维度，其他维度都去掉
      let oriSelectList = newParams.afQueryBean.select_list;
      newParams.afQueryBean.select_list = oriSelectList.filter((item, index) => {
          return item.element_type === '2' || index === 0 || item.nick_name === `XXXXCODE_${oriSelectList[0].element_id}`
      });
      break;
    case 'SrcAndDest':
      // 排序优先级
        const priorityMap = {
          srcNode: 4,
          centerNode: 3,
          targetNode: 2,
          yMeasure: 1
        };
      // 来源去向图 selectlist按照 来源(维度)-中心(维度)-去向(维度)-度量字段 顺序排列
      newParams.afQueryBean.select_list.sort((field1, field2) => {
        return (priorityMap[field2.isNewSetting] || 0) - (priorityMap[field1.isNewSetting] || 0)
      });
      // 预防没有isNewSetting
      if (newParams.afQueryBean.select_list[0] && newParams.afQueryBean.select_list[0].isNewSetting === undefined) {
        const selList = newParams.afQueryBean.select_list;
        const centerNode = { ...selList[0] };
        const srcNode = { ...selList[1] };
        const targetNode = { ...selList[2] };
        const measure = selList[3] ? { ...selList[3] } : null;
        newParams.afQueryBean.select_list = [srcNode, centerNode, targetNode];
        if (measure) {
          newParams.afQueryBean.select_list.push(measure);
        }
      }
      // 要把selectlist中的翻译维度去掉 来源去向图没有联动功能
      newParams.afQueryBean.select_list = newParams.afQueryBean.select_list.filter(item => item.nick_name !== 'XXXXCODE');
      newParams.dataType = '11';
      break;
    default:
      break;
  }
  return newParams;
}

const isPC = bdCommonFunc.isPCTerminal

export {
  objDeepCopy,
  setTimeFormat,
  getTimeFromOffset,
  dealDataSetInfo,
  constructList,
  genWhereBean,
  getFieldFromDsMap,
  getCurDimValu,
  getOrderList,
  getCompTemp,
  windowResize,
  getFilteredData,
  handlePageList,
  addPageWhereBean,
  setCondiToCompt,
  isShowNameFunc,
  getRequestParam,
  getSelectList,
  addPageCondis,
  getLinkRequestParam,
  getQueryCondi,
  getMatchedElementId,
  queryFieldMap,
  transNumber,
  formatNumber,
  format45,
  filterQueryCondis,
  dateFormatTrans,
  toggleClass,
  getNoMergeTableData,
  getTableReqParam,
  setPolymerCrossTbCols,
  initComptName,
  genComptName,
  dataInterval,
  objClone,
  fieldMatch,
  resetTemplateCompt,
  partialDeepCopy,
  objCloneByReplaceKey,
  handleTbDimCell,
  inputNumber,
  setWhereBeantimeOffset,
  Base64,
  zip,
  unzip,
  concatComputedData,
  initFuncDateParam,
  mapDataSetInfoKey,
  loadDataDone,
  loadDataError,
  adjustQueryParams,
  isPC
}
