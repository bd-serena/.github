const dateToString = function (date) {
  var yy = date.getFullYear(); //年
  var mm = date.getMonth() + 1; //月
  var dd = date.getDate(); //日
  var hh = date.getHours(); //时
  var ii = date.getMinutes(); //分
  var ss = date.getSeconds(); //秒
  var clock = yy + "-";
  if (mm < 10) clock += "0";
  clock += mm + "-";
  if (dd < 10) clock += "0";
  clock += dd + " ";
  if (hh < 10) clock += "0";
  clock += hh + ":";
  if (ii < 10) clock += '0';
  clock += ii + ":";
  if (ss < 10) clock += '0';
  clock += ss;
  return clock;
}

const dateToYYYYMMDD = function (date, dateType) {
  var yy = date.getFullYear(); //年
  var mm = date.getMonth() + 1; //月
  var dd = date.getDate(); //日
  var clock = yy + "";
  switch (dateType) {
    case "year":
      break;
    case "year-month":
      if (mm < 10) clock += "0";
      clock += mm + "";
      break;
    case "date":
      if (mm < 10) clock += "0";
      clock += mm + "";
      if (dd < 10) clock += "0";
      clock += dd + "";
      break;
  }
  return clock;
}

/**
 * 把selectedText日期数组转为show_format的格式，如yyyy-MM-dd hh24:mi:ss
 * @param {*} show_format
 * @param {*} selectedText
 */
const dateToFormat = function(show_format, selectedText){
  let val = "";
  let seperator = "",seperator1 = "",seperator2 = "";
  //年月日的时间分隔符
  if (show_format.indexOf("/") > -1) {
    seperator = "/";
  } else if (show_format.indexOf("-") > -1) {
    seperator = "-";
  }
  //日和时之间的分隔符
  if (show_format.indexOf(" ") > -1) {
    seperator1 = " ";
  }
  //时分秒之间的分隔符
  if (show_format.indexOf(":") > -1) {
    seperator2 = ":";
  }

  selectedText.forEach((item, i) => {
    if(i == 1 || i == 2){
      val += seperator + item;
    }else if(i == 3){
      val += seperator1 + item;
    }else if(i == 4 || i == 5){
      val += seperator2 + item;
    }else{
      val += item;
    }
  });
  return val;
}

export {
  dateToString,
  dateToYYYYMMDD,
  dateToFormat
}
