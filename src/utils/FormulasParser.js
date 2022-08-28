
import store from '../plugins/store/store'
const FormulaParser = require('../../node_modules/hot-formula-parser').Parser
import * as finacial from "./financial/finacial";
var moment = require('moment');
let Parser = {
  setFunction (parser) {
    parser.setFunction('COUNT', function () {
      return utils.numbers(utils.flatten(arguments)).length
    })
    parser.setFunction('MAX', function () {
      const range = utils.numbers(utils.flatten(arguments))
      return (range.length === 0) ? 0 : Math.max.apply(Math, range)
    })
    parser.setFunction('MIN', function () {
      const range = utils.numbers(utils.flatten(arguments))
      return (range.length === 0) ? 0 : Math.min.apply(Math, range)
    })
    parser.setFunction('ABS', function (number) {
      number = utils.parseNumber(number[0])
      if (number instanceof Error) {
        return number
      }
      return Math.abs(number)
    })
    parser.setFunction('AVERAGE', function () {
      let range = utils.numbers(utils.flatten(arguments))
      let n = range.length
      let sum = 0
      let count = 0
      let result
      for (let i = 0; i < n; i++) {
        sum += range[i]
        count += 1
      }
      result = sum / count

      if (isNaN(result)) {
        result = error.num
      }
      return result
    })
    parser.setFunction('CHAR', function (number) {
      number = utils.parseNumber1(number[0])
      if (number > 255 || number < 1) {
        return error.value
      }
      if (number instanceof Error) {
        return number
      }
      return String.fromCharCode(number)
    })
    parser.setFunction('DATE', function () {
      let result
      let [year, month, day] = arguments[0]

      year = utils.parseNumber(year)
      month = utils.parseNumber(month)
      day = utils.parseNumber(day)

      if (utils.anyIsError(year, month, day)) {
        result = error.value
      } else if (year >= 10000 || year < 0) {
        return error.num
      } else {
        // <1900 年时用new Date('1,1,1')年份会出错，先用new Date(1,1,1)转换
        if (year >= 0 && year < 1900) {
          year += 1900
        }
        let date = new Date(`${year},1, 1`)
        let y
        let m = date.getMonth()
        let d = date.getDate()
        date.setMonth(m + month - 1)
        date.setDate(d + day - 1)
        y = date.getFullYear()
        m = date.getMonth() + 1
        d = date.getDate()
        if (y < 1900) {
          return error.num
        }
        result = `${y}/${m}/${d}`
      }

      return result
    })
    parser.setFunction('TIME', function () {
      let [hour, minute, second] = arguments[0]
      let result
      hour = utils.parseNumber(hour)
      minute = utils.parseNumber(minute)
      second = utils.parseNumber(second)
      if (utils.anyIsError(hour, minute, second)) {
        return error.value
      }
      if (hour < 0 || minute < 0 || second < 0) {
        return error.num
      }
      let timestap = (3600 * hour + 60 * minute + second) / 86400 % 1
      let h1 = timestap * 24
      let h = Math.floor(h1)
      let m1 = Math.floor((h1 % 1) * 60 + 1E-10)
      let m = m1.toString().padStart(2, '0')
      let unit = 'AM'
      if (timestap >= 0.5) {
        unit = 'PM'
        if (h > 12) {
          h -= 12
        }
      }
      result = `${h}:${m} ${unit}`
      return result
    })
    parser.setFunction('EXP', function (number) {
      if (arguments.length < 1) {
        return error.na
      }
      number = utils.parseNumber(number[0])
      if (number instanceof Error) {
        return number
      }
      return Math.exp(number)
    })
    parser.setFunction('FLOOR', function () {
      let [number, significance] = arguments[0]
      return utils.callParserFunc('FLOOR', number, significance);
    })
    parser.setFunction('INT', function (number) {
      number = utils.parseNumber(number[0])
      if (number instanceof Error) {
        return number
      }
      return Math.floor(number)
    })
    parser.setFunction('ROUND', function () {
      let [number, digits] = arguments[0]
      let result = utils.ROUND(number, digits)
      return result
    })
    parser.setFunction('LOG', function () {
      let [number, base] = arguments[0]
      number = utils.parseNumber(number)
      if (base !== undefined) {
        base = utils.parseNumber(base)
      }
      if (utils.anyIsError(number, base)) {
        return error.value
      }
      if (number <= 0 || base <= 0) {
        return error.num
      }
      base = (base === undefined) ? 10 : base
      return Math.log(number) / Math.log(base)
    })
    parser.setFunction('SUMSQ', function () {
      let numbers = utils.parseNumberArray(utils.flatten(arguments))
      if (numbers instanceof Error) {
        return numbers
      }
      let result = 0
      let length = numbers.length
      for (let i = 0; i < length; i++) {
        result += numbers[i] * numbers[i]
      }
      return result
    })
    parser.setFunction('SUMPRODUCT', function () {
      let number = arguments[0]
      if (!number || number.length === 0) {
        return error.value
      }
      let arrays = number.length + 1
      let result = 0; let product; let k; let _i; let _ij
      if (!(number[0] instanceof Array)) {
        result = 1
        for (let i = 0, len = number.length; i < len; i++) {
          if (number[i] instanceof Array) {
            return error.value
          }
          _i = utils.parseNumber3(number[i])
          if (_i instanceof Error) {
            return _i
          }
          result *= _i
        }
      } else {
        for (let i = 0; i < number[0].length; i++) {
          if (number[0][i] instanceof Array) {
            let j0 = number[0][i].length
            for (let j = 0; j < j0; j++) {
              product = 1
              for (k = 1; k < arrays; k++) {
                if ((number[k] && number[k - 1].length !== number[k].length) || j0 != number[k - 1][i].length) {
                  return error.value
                }
                _ij = utils.parseNumber2(number[k - 1][i][j])
                if (_ij instanceof Error) {
                  return _ij
                }
                product *= _ij
              }
              result += product
            }
          }
        }
      }
      return result
    })
    parser.setFunction('FIND', function () {
      let [find_text, within_text, position] = arguments[0]; let result = null

      if (arguments[0].length < 2) {
        return error.na
      }
      position = (position === undefined) ? 1 : position
      if (position < 1) {
        return error.value
      }
      if (within_text) {
        if (within_text.length < position) {
          return error.value
        }
        result = within_text.indexOf(find_text, position - 1) + 1
        if (result === 0) {
          return error.value
        }
      }
      return result
    })
    parser.setFunction('MID', function () {
      let [text, start, number] = arguments[0]
      start = utils.parseNumber(start)
      number = utils.parseNumber(number)
      if (utils.anyIsError(start, number)) {
        return number
      }
      if (start < 1 || number < 0) {
        return error.value
      }
      if (text === null || text === undefined || text === '' || start > text.toString().length) {
        return null
      }
      if (typeof text === 'boolean') {
        text = text.toString().toLocaleUpperCase()
      }
      let begin = start - 1; let end = begin + number
      return text.toString().substring(begin, end)
    })
    parser.setFunction('REPLACE', function () {
      let [text, position, length, new_text] = arguments[0]
      position = utils.parseNumber(position)
      length = utils.parseNumber(length)
      if (utils.anyIsError(position, length) || position < 1 || length < 0) {
        return error.value
      }
      text = (text === null || text === undefined) ? "" : text.toString()
      return text.substr(0, position - 1) + new_text + text.substr(position - 1 + length);
    });
    parser.setFunction('DMIN',function (){
      let minNum = 0;
      //先去database的首个值
      minNum = utils.getResult(arguments[0],'min',minNum);
      return minNum;
    });
    parser.setFunction('DSTDEV',function (){
      let disDevNum = 0;
      let averValue = 0;
      let total = 0;
      let total1 = 0;
      //先去database的首个值
      let disDevNumS = utils.getResult(arguments[0],'DSTDEV',0);
      for (let s = 0;s<disDevNumS.length;s++) {
        total+= disDevNumS[s];
      }
      averValue = total/(disDevNumS.length);
      for (let k=0;k<disDevNumS.length;k++) {
        total1+= Math.pow(disDevNumS[k] - averValue,2);
      }
      let total2 = total1/(disDevNumS.length-1);
      disDevNum = Math.sqrt(total2);
      if (disDevNum >=10) {
        disDevNum = Math.sqrt(total2).toFixed(8);
      }else {
        disDevNum = Math.sqrt(total2).toFixed(9);
      }
      return disDevNum;
    });
    parser.setFunction('DVAR',function (){
      let disDevNum = 0;
      let averValue = 0;
      let total = 0;
      let total1 = 0;
      //先去database的首个值
      let disDevNumS = utils.getResult(arguments[0],'DVAR',0);
      for (let s = 0;s<disDevNumS.length;s++) {
        total+= disDevNumS[s];
      }
      averValue = total/(disDevNumS.length);
      for (let k=0;k<disDevNumS.length;k++) {
        total1+= Math.pow(disDevNumS[k] - averValue,2);
      }
      disDevNum = total1/(disDevNumS.length-1);
      return disDevNum;
    });
    parser.setFunction('DSTDEVP',function (){
      let disDevPNum = 0;
      let averPValue = 0;
      let totalP = 0;
      let totalP1 = 0;
      //先去database的首个值
      let disDevPNumS = utils.getResult(arguments[0],'DSTDEVP',0);
      for (let s = 0;s<disDevPNumS.length;s++) {
        totalP+= disDevPNumS[s];
      }
      averPValue = totalP/(disDevPNumS.length);
      for (let k=0;k<disDevPNumS.length;k++) {
        totalP1+= Math.pow(disDevPNumS[k] - averPValue,2);
      }
      let totalP2 = totalP1/(disDevPNumS.length);
      disDevPNum = Math.sqrt(totalP2);
      if (disDevPNum >=10) {
        disDevPNum = Math.sqrt(totalP2).toFixed(8);
      }else {
        disDevPNum = Math.sqrt(totalP2).toFixed(9);
      }
      return disDevPNum;
    });
    parser.setFunction('DVARP',function (){
      let disDevDNum = 0;
      let averDValue = 0;
      let totalD = 0;
      let totalD1 = 0;
      //先去database的首个值
      let disDevDNumS = utils.getResult(arguments[0],'DVARP',0);
      for (let s = 0;s<disDevDNumS.length;s++) {
        totalD+= disDevDNumS[s];
      }
      averDValue = totalD/(disDevDNumS.length);
      for (let k=0;k<disDevDNumS.length;k++) {
        totalD1+= Math.pow(disDevDNumS[k] - averDValue,2);
      }
      disDevDNum = parseFloat(totalD1/(disDevDNumS.length)).toFixed(2);
      return disDevDNum;
    });
    parser.setFunction('DSUM',function (){
      let totalSum = 0;
      //先去database的首个值
      totalSum = utils.getResult(arguments[0],'DSUM',totalSum);
      return totalSum;
    });
    parser.setFunction('MINVERSE',function (){
      let [array] = arguments[0];
      let reg = /\d+/;
      if (array.length !== array[0].length) {
        return error.value;
      }
      for (let u =0;u<array.length;u++) {
        for (let v=0;v<array[0].length;v++) {
          if (!reg.test(array[u][v])) {
            return error.value;
          }
        }
      }
      if (array.length === 2) {
        //二阶行列式
        let secondArray = [];
        secondArray = utils.getSecondVal(array);
        return secondArray[0][0];
      }
      //求n阶矩阵的行列式值
      let Determinant = 0;
      let reduceValue;
      let plusValue;
      if (array.length>3) {
        Determinant = utils.recursion(array,Determinant);
      }else {
        reduceValue = utils.getReduceValue(array);
        plusValue = utils.getPlusValue(array);
        //行列式的值
        Determinant = reduceValue + plusValue;
      }
      //行列式不能为0
      if (Determinant === 0) {
        return error.num;
      }
      //求代数余子式
      let rArray = [];
      rArray = utils.getAllCofactor(array);
      for (let i=0;i<rArray.length;i++) {
        for (let j=0;j<rArray[0].length;j++) {
          rArray[i][j] = rArray[i][j]/Determinant;
        }
      }
      return rArray[0][0].toFixed(4);
    });
    parser.setFunction('DPRODUCT',function (){
      let dParr = utils.getResult(arguments[0],'DPRODUCT',0);
      let res = 1;
      //余数
      let numY = 0;
      //商
      let numS = 0;
      //位数
      let numW = 0;
      for (let d = 0;d<dParr.length;d++) {
        res = res * dParr[d];
      }
      //值超过1百万--用科学计数法
      if (Math.abs(res) > 1000000) {
        numY = (Math.abs(res)%1000000)/1000000;
        numS = (Math.abs(res)/1000000) -numY;
        numW = (Math.abs(res)/1000000 + '').length;
        if (numY >= 0.5) {
          numS = numS + 1;
          if (res > 0) {
            if (numW >= 10) {
              res = numS + 'E' + '+' + numW;
            }else {
              res = numS + 'E' + '+' + '0' + numW;
            }
          }else {
            if (numW >= 10) {
              res = numS + 'E' + '-' + numW;
            }else {
              res = numS + 'E' + '-' + '0' + numW;
            }
          }
        }else {
          if (res > 0) {
            if (numW >= 10) {
              res = numS + 'E' + '+' + numW;
            }else {
              res = numS + 'E' + '+' + '0' + numW;
            }
          }else {
            if (numW >= 10) {
              res = numS + 'E' + '-' + numW;
            }else {
              res = numS + 'E' + '-' + '0' + numW;
            }
          }
        }
      }
      //如果为空
      return res;
    });
    parser.setFunction('DGET',function (){
      let getNum = 0;
      getNum = utils.getResult(arguments[0],'DGET',getNum);
      if (getNum === null) {
        return error.num;
      }
      return getNum;
    });
    parser.setFunction('DCOUNTA',function (){
      let dCountANum = 0;
      //先去database的首个值
      dCountANum = utils.getResult(arguments[0],'DCOUNTA',dCountANum);
      return dCountANum;
    });
    parser.setFunction('DMAX',function (){
      let maxNum = 0;
      //先去database的首个值
      maxNum = utils.getResult(arguments[0],'max',maxNum);
      return maxNum;
    });
    parser.setFunction('DCOUNT',function (){
      let dCountNum = 0;
      dCountNum = utils.getResult(arguments[0],'DCOUNT',dCountNum);
      return dCountNum;
    });
    parser.setFunction('DAVERAGE',function (){
      let averArr = utils.getResult(arguments[0],'DAVERAGE',0);
      let sum = 0;
      for (let a= 0;a<averArr.length;a++) {
        sum = sum + parseFloat(averArr[a]);
      }
      return sum/averArr.length;
    });
    parser.setFunction('UPPER', function () {
      let text = arguments[0][0]
      if (text instanceof Array) {
        return error.value
      }
      if (text === null || text === undefined) {
        text = ''
      } else if (typeof text !== 'string') {
        text = text.toString()
      }
      return text.toUpperCase()
    })
    parser.setFunction('LOWER', function () {
      let text = arguments[0][0]
      if (text instanceof Array) {
        return error.value
      }
      if (text === null || text === undefined) {
        text = ''
      } else if (typeof text !== 'string') {
        text = text.toString()
      }
      return text.toLowerCase()
    })
    parser.setFunction('DAY', function () {
      let serial_number = arguments[0][0]
      let date = utils.parseDate(serial_number)
      if (date instanceof Error) {
        return date
      }
      if (date === 0) {
        return 0
      }

      return date.getDate()
    })
    parser.setFunction('HOUR', function () {
      let serial_number = arguments[0][0]
      let result = utils.HOUR(serial_number)
      return result
    })
    parser.setFunction('NOW', function () {
      let date = new Date()
      let y = date.getFullYear()
      let m = date.getMonth() + 1
      let d = date.getDate()
      let h = date.getHours()
      let mm = date.getMinutes()
      m = m.toString().padStart(2, '0')
      return `${y}/${m}/${d} ${h}:${mm}`
    })
    parser.setFunction('YEAR', function () {
      let serial_number = arguments[0][0]
      let date = utils.parseDate(serial_number)
      if (date instanceof Error) {
        // hh:mm:ss
        date = utils.HOUR(serial_number)
        if (!isNaN(date)) {
          return 1900
        }
        return date
      }
      if (date === -1) { // 日超出当月最大天数
        return error.value
      }
      if (date === 0) {
        return 1900
      }
      let y = date.getFullYear()
      if (y < 1900 || y > 9999) {
        if (!isNaN(serial_number)) {
          return 1900
        }
        y = error.value
      }
      return y
    })
    parser.setFunction('OR', function () {
      let args = utils.flatten(arguments)
      let result = false; let err = 0
      for (var i = 0; i < args.length; i++) {
        let sign = args[i]
        if (sign !== null && sign !== '') {
          if (['TRUE', 'FALSE'].indexOf(sign.toString().toUpperCase()) > -1) {
            sign = Boolean(sign)
          } else if (!isNaN(sign)) {
            sign = parseFloat(sign)
          } else if (typeof sign === 'string') {
            sign = false
            err++
          }
        } else {
          err++
        }
        if (sign) {
          result = true
        }
      }
      if (err === args.length) {
        return error.value
      }
      return result
    })

    parser.setFunction('DEGREES', function () {
      var val = arguments[0][0];
      if(val === "" || val ==null){
        return error.value;
      }
      if(!isNaN(val)){
        var result = (val * 180 / Math.PI);
        return result;
      }else{
        return error.value;
      }
    });

    parser.setFunction('MDETERM', function () {
      var square = arguments[0][0];
      return utils.det(square);

    });

    parser.setFunction('SERIESSUM', function () {
      var x = arguments[0][0];
      var n = arguments[0][1];
      var m = arguments[0][2];
      var c = arguments[0][3];
      var coefficients = [];
      if(utils.isNum(x) && utils.isNum(n) && utils.isNum(m)){
        if(c === "" || c ==null){
          return error.value;
        }
        if(!Array.isArray(c)){
          coefficients.push(c);
        }else{
          c.forEach(item => {
            coefficients = coefficients.concat(item);
          })
        }
        // var flag = true;
        // coefficients.some(item => {
        //   if(!utils.isNum(item)){
        //     flag = false;
        //     return true;
        //   }
        // })
        // if(!flag){
        //   return error.value;
        // }
        x = utils.parseNumber(x);
        n = utils.parseNumber(n);
        m = utils.parseNumber(m);
        coefficients = utils.parseNumberArray(coefficients);
        if (utils.anyIsError(x, n, m, coefficients)) {
          return error.value;
        }
        var result = coefficients[0] * Math.pow(x, n);
        for (var i = 1; i < coefficients.length; i++) {
          result += coefficients[i] * Math.pow(x, n + i * m);
        }
        return result;
      }else{
        return error.value;
      }
    });

    parser.setFunction('BINOM.INV', function () {
      var trials = arguments[0][0];
      var probability = arguments[0][1];
      var alpha = arguments[0][2];

      if(utils.isNum(trials) && utils.isNum(probability) && utils.isNum(alpha)){
        if(trials>=0 && 0<probability && probability<1 && 0<alpha && alpha<1){
          return utils.callParserFunc('BINOM.INV', trials, probability, alpha)
        }else{
          return error.num;
        }
      }else{
        return error.value;
      }
    })

    parser.setFunction('BINOM.DIST.RANGE', function () {
      var trials = arguments[0][0];
      var probability = arguments[0][1];
      var successes = arguments[0][2];
      var successes2 = arguments[0][3];

      if(utils.isNum(trials) && utils.isNum(probability) && utils.isNum(successes)){
        successes2 = (successes2 === undefined) ? successes : successes2;
        if(trials>=0 && 0<=probability && probability<=1 && 0<=successes && successes<=trials
          && successes<=successes2 && successes2<=trials){
          return utils.callParserFunc('BINOM.DIST.RANGE',trials, probability,successes,successes2)
        }else{
          return error.num;
        }
      }else{
        return error.value;
      }
    });

    parser.setFunction('CHISQ.DIST', function () {
      var x = arguments[0][0];
      var k = arguments[0][1];
      var cumulative = arguments[0][2];

      if(utils.isNum(x) && utils.isNum(k) && cumulative!=null){
        if(utils.isNum(cumulative)){
          if(0 !== cumulative){
            if(false === cumulative){
              cumulative = 0;
            }else{
              cumulative = 1;
            }
          }
        }else{
          return error.value;
        }
        if(x>=0 && 1<=k && k<=Math.pow(10,10)){
          return utils.callParserFunc('CHISQ.DIST', x, k, cumulative)
        }else{
          return error.num;
        }
      }else{
        return error.value;
      }
    })

    parser.setFunction('CHISQ.DIST.RT', function () {
      var x = arguments[0][0];
      var k = arguments[0][1];

      if(utils.isNum(x) && utils.isNum(k)){
        if(x>=0 && 1<=k && k<=Math.pow(10,10)){
          return utils.callParserFunc('CHISQ.DIST.RT', x, k)
        }else{
          return error.num;
        }
      }else{
        return error.value;
      }
    })

    parser.setFunction('CHISQ.INV', function () {
      var probability = arguments[0][0];
      var k = arguments[0][1];

      if(utils.isNum(probability) && utils.isNum(k)){
        if(probability>=0 && probability<1 && 1<=k && k<=Math.pow(10,10)){
          return utils.callParserFunc('CHISQ.INV', probability, k)
        }else{
          return error.num;
        }
      }else{
        return error.value;
      }
    })

    parser.setFunction('CHISQ.INV.RT', function () {
      var p = arguments[0][0];
      var k = arguments[0][1];

      if(utils.isNum(p) && utils.isNum(k)){
        if(p>0 && p<=1 && 1<=k && k<=Math.pow(10,10)){
          return utils.callParserFunc('CHISQ.INV.RT', p, k)
        }else{
          return error.num;
        }
      }else{
        return error.value;
      }
    })

    parser.setFunction('CHISQ.TEST', function () {
      return utils.chisqTest(arguments[0][0], arguments[0][1])
    })

    parser.setFunction('CONFIDENCE.NORM', function () {
      var alpha = arguments[0][0];
      var sd = arguments[0][1];
      var n = arguments[0][2];
      if(utils.isNum(alpha) && utils.isNum(sd) && utils.isNum(n)){
        if(alpha>0 && alpha<1 && 0<sd && 1<=n){
          return utils.callParserFunc('CONFIDENCE.NORM', alpha, sd,n)
        }else{
          return error.num;
        }
      }else{
        return error.value;
      }
    })


    parser.setFunction('CONFIDENCE.T', function () {
      var alpha = arguments[0][0];
      var sd = arguments[0][1];
      var n = arguments[0][2];
      if(utils.isNum(alpha) && utils.isNum(sd) && utils.isNum(n)){
        if(alpha>0 && alpha<1 && 0<sd && 1<n){
          return utils.callParserFunc('CONFIDENCE.T', alpha, sd,n)
        }else{
          if(n === 1){
            return error.div0;
          }
          return error.num;
        }
      }else{
        return error.value;
      }
    })

    parser.setFunction('F.DIST.RT', function () {
      var x = arguments[0][0];
      var d1 = arguments[0][1];
      var d2 = arguments[0][2];
      if(utils.isNum(x) && utils.isNum(d1) && utils.isNum(d2)){
        return utils.callParserFunc('F.DIST.RT', x, d1,d2)
      }else{
        return error.value;
      }
    })


    parser.setFunction('F.INV.RT', function () {
      var p = arguments[0][0];
      var d1 = arguments[0][1];
      var d2 = arguments[0][2];
      if(utils.isNum(p) && utils.isNum(d1) && utils.isNum(d2)){
        return utils.callParserFunc('F.INV.RT', p, d1,d2)
      }else{
        return error.value;
      }
    })


    parser.setFunction('GAMMA.DIST', function () {
      var value = arguments[0][0];
      var alpha = arguments[0][1];
      var beta = arguments[0][2];
      var cumulative = arguments[0][3];
      if(utils.isNum(value) && utils.isNum(alpha) && utils.isNum(beta) && cumulative!=null){
        if(utils.isNum(cumulative)){
          if(0 !== cumulative){
            if(false === cumulative){
              cumulative = 0;
            }else{
              cumulative = 1;
            }
          }
        }else{
          return error.value;
        }

        return utils.callParserFunc('GAMMA.DIST', value, alpha,beta,cumulative)
      }else{
        return error.value;
      }
    })

    parser.setFunction('GAMMA.INV', function () {
      var probability = arguments[0][0];
      var alpha = arguments[0][1];
      var beta = arguments[0][2];

      if(utils.isNum(probability) && utils.isNum(alpha) && utils.isNum(beta)){
        if(0<=probability && probability<1 && alpha>0 && beta>0){
          return utils.callParserFunc('GAMMA.INV', probability, alpha,beta)
        }else{
          return error.num;
        }
      }else{
        return error.value;
      }
    })

    parser.setFunction('GAMMALN.PRECISE', function () {
      var x = arguments[0][0];
      if(utils.isNum(x)){
          return utils.callParserFunc('GAMMALN.PRECISE', x)
      }else{
        return error.value;
      }
    })

    parser.setFunction('NEGBINOM.DIST', function () {
      var k = arguments[0][0];
      var r = arguments[0][1];
      var p = arguments[0][2];
      var cumulative = arguments[0][3];
      if(utils.isNum(k) && utils.isNum(r) && utils.isNum(p) && cumulative!=null){
        if(k>=0 && r>=1 && p>0 && p<1){
          if(utils.isNum(cumulative)){
            if(0 !== cumulative){
              if(false === cumulative){
                cumulative = 0;
              }else{
                cumulative = 1;
              }
            }
          }else{
            return error.num;
          }

        }else{
          return error.value;
        }

        return utils.callParserFunc('NEGBINOM.DIST', k, r,p,cumulative)
      }else{
        return error.value;
      }
    })


    parser.setFunction('T.DIST.2T', function () {
      var x = arguments[0][0];
      var df = arguments[0][1];

      if(utils.isNum(x) && utils.isNum(df)){
        if(x>=0 && df>=1){
          return utils.callParserFunc("T.DIST.2T", x,df)

        }else{
          return error.num;
        }
      }else{
        return error.value;
      }
    })


    parser.setFunction('T.DIST.RT', function () {
      var x = arguments[0][0];
      var df = arguments[0][1];

      if(utils.isNum(x) && utils.isNum(df)){
        if(df>=1){
          return utils.callParserFunc("T.DIST.RT", x,df)

        }else{
          return error.num;
        }
      }else{
        return error.value;
      }
    })

    parser.setFunction('T.INV.2T', function () {
      var probability = arguments[0][0];
      var df = arguments[0][1];

      if(utils.isNum(probability) && utils.isNum(df)){
        if(probability>0 && probability <=1 && df>=1){
          return utils.callParserFunc("T.INV.2T", probability,df)

        }else{
          return error.num;
        }
      }else{
        return error.value;
      }
    })

    parser.setFunction('Z.TEST', function () {
      return utils.zTest(arguments[0])
    })


    parser.setFunction('ACCRINTM', function () {
      var issue = arguments[0][0];
      var settlement = arguments[0][1];
      var rate = utils.parseNumber(arguments[0][2]);
      var par = utils.parseNumber(arguments[0][3]);
      var basis = utils.parseNumber(arguments[0][4]);

      //Microsoft Excel 可将日期存储为可用于计算的序列号。
      //默认情况下，1900 年 1 月 1 日的序列号是 1，而 2008 年 1 月 1 日的序列号是 39448，
      //这是因为它距 1900 年 1 月 1 日有 39448 天。
      if(utils.isNum(issue)){
        issue = moment("1900/01/01").add(issue,'d').format("YYYY/MM/DD");
      }

      if(utils.isNum(settlement)){
        settlement = moment("1900/01/01").add(settlement,'d').format("YYYY/MM/DD");
      }
      return finacial.ACCRINTM(issue, settlement, rate, par, basis);
    })

    parser.setFunction('AMORLINC', function () {
      var cost = utils.parseNumber(arguments[0][0]);
      var datePurchased = arguments[0][1];
      var firstPeriod = arguments[0][2];
      var salvage = utils.parseNumber(arguments[0][3]);
      var period = utils.parseNumber(arguments[0][4]);
      var rate = utils.parseNumber(arguments[0][5]);
      var basis = utils.parseNumber(arguments[0][6]);

      if(cost < salvage){
        return error.num;
      }

      if(utils.isNum(datePurchased)){
        datePurchased = moment("1900/01/01").add(datePurchased,'d').format("YYYY/MM/DD");
      }

      if(utils.isNum(firstPeriod)){
        firstPeriod = moment("1900/01/01").add(firstPeriod,'d').format("YYYY/MM/DD");
      }

      if(moment(datePurchased).isAfter(moment(firstPeriod))){
        return error.num;
      }
      return finacial.AMORLINC(cost, datePurchased, firstPeriod, salvage, period, rate, basis);
    })


    parser.setFunction('COUPDAYS', function () {
      var result = utils.formatFinacialObj(arguments[0][0],arguments[0][1],arguments[0][2],arguments[0][3]);

      return finacial.COUPDAYS(result.settlement, result.maturity, result.frequency, result.basis);
    })


    parser.setFunction('COUPDAYSNC', function () {
      var result = utils.formatFinacialObj(arguments[0][0],arguments[0][1],arguments[0][2],arguments[0][3]);

      return finacial.COUPDAYSNC(result.settlement, result.maturity, result.frequency, result.basis);
    })

    parser.setFunction('COUPNCD', function () {
      var result = utils.formatFinacialObj(arguments[0][0],arguments[0][1],arguments[0][2],arguments[0][3]);

      if(moment(result.settlement).isSameOrAfter(moment(result.maturity))){
        return error.num;
      }

      var r = finacial.COUPNCD(result.settlement, result.maturity, result.frequency, result.basis);

      var day = moment(r).diff(moment("1900/01/01"), 'day')+2;

      return day;
    })

    parser.setFunction('COUPNUM', function () {
      var result = utils.formatFinacialObj(arguments[0][0],arguments[0][1],arguments[0][2],arguments[0][3]);

      return finacial.COUPNUM(result.settlement, result.maturity, result.frequency, result.basis);
    })

    parser.setFunction('COUPPCD', function () {
      var result = utils.formatFinacialObj(arguments[0][0],arguments[0][1],arguments[0][2],arguments[0][3]);

      var r = finacial.COUPPCD(result.settlement, result.maturity, result.frequency, result.basis);

      var day = moment(r).diff(moment("1900/01/01"), 'day')+2;

      return day;
    })

    parser.setFunction('DISC', function () {
      var settlement = arguments[0][0];
      var maturity = arguments[0][1];
      var pr = utils.parseNumber(arguments[0][2]);
      var redemption = utils.parseNumber(arguments[0][3]);
      var basis = utils.parseNumber(arguments[0][4]);

      if(utils.isNum(settlement)){
        settlement = moment("1900/01/01").add(settlement,'d').format("YYYY/MM/DD");
      }

      if(utils.isNum(maturity)){
        maturity = moment("1900/01/01").add(maturity,'d').format("YYYY/MM/DD");
      }

      return finacial.DISC(settlement, maturity, pr, redemption, basis);
    })

    parser.setFunction('DURATION', function () {
      var settlement = arguments[0][0];
      var maturity = arguments[0][1];
      var coupon = utils.parseNumber(arguments[0][2]);
      var yld = utils.parseNumber(arguments[0][3]);
      var frequency = utils.parseNumber(arguments[0][4]);
      var basis = utils.parseNumber(arguments[0][5]);

      if(utils.isNum(settlement)){
        settlement = moment("1900/01/01").add(settlement,'d').format("YYYY/MM/DD");
      }

      if(utils.isNum(maturity)){
        maturity = moment("1900/01/01").add(maturity,'d').format("YYYY/MM/DD");
      }

      return finacial.DURATION(settlement, maturity, coupon, yld, frequency, basis);
    })


    parser.setFunction('INTRATE', function () {
      var settlement = arguments[0][0];
      var maturity = arguments[0][1];
      var investment = utils.parseNumber(arguments[0][2]);
      var redemption = utils.parseNumber(arguments[0][3]);
      var basis = utils.parseNumber(arguments[0][4]);

      if(utils.isNum(settlement)){
        settlement = moment("1900/01/01").add(settlement,'d').format("YYYY/MM/DD");
      }

      if(utils.isNum(maturity)){
        maturity = moment("1900/01/01").add(maturity,'d').format("YYYY/MM/DD");
      }

      return finacial.INTRATE(settlement, maturity, investment, redemption, basis);
    })

    parser.setFunction('MDURATION', function () {
      var settlement = arguments[0][0];
      var maturity = arguments[0][1];
      var coupon = utils.parseNumber(arguments[0][2]);
      var yld = utils.parseNumber(arguments[0][3]);
      var frequency = utils.parseNumber(arguments[0][4]);
      var basis = utils.parseNumber(arguments[0][5]);

      if(utils.isNum(settlement)){
        settlement = moment("1900/01/01").add(settlement,'d').format("YYYY/MM/DD");
      }

      if(utils.isNum(maturity)){
        maturity = moment("1900/01/01").add(maturity,'d').format("YYYY/MM/DD");
      }

      return finacial.MDURATION(settlement, maturity, coupon, yld, frequency, basis);
    })

    parser.setFunction('ODDFPRICE', function () {
      var settlement = arguments[0][0];
      var maturity = arguments[0][1];
      var issue = arguments[0][2];
      var firstCoupon = arguments[0][3];
      var rate = utils.parseNumber(arguments[0][4]);
      var yld = utils.parseNumber(arguments[0][5]);
      var redemption = utils.parseNumber(arguments[0][6]);
      var frequency = utils.parseNumber(arguments[0][7]);
      var basis = utils.parseNumber(arguments[0][8]);

      if(utils.isNum(settlement)){
        settlement = moment("1900/01/01").add(settlement,'d').format("YYYY/MM/DD");
      }

      if(utils.isNum(maturity)){
        maturity = moment("1900/01/01").add(maturity,'d').format("YYYY/MM/DD");
      }

      if(utils.isNum(issue)){
        issue = moment("1900/01/01").add(issue,'d').format("YYYY/MM/DD");
      }

      if(utils.isNum(firstCoupon)){
        firstCoupon = moment("1900/01/01").add(firstCoupon,'d').format("YYYY/MM/DD");
      }

      return finacial.ODDFPRICE(settlement, maturity, issue, firstCoupon, rate, yld, redemption, frequency, basis);
    })

    parser.setFunction('ODDFYIELD', function () {
      var settlement = arguments[0][0];
      var maturity = arguments[0][1];
      var issue = arguments[0][2];
      var firstCoupon = arguments[0][3];
      var rate = utils.parseNumber(arguments[0][4]);
      var pr = utils.parseNumber(arguments[0][5]);
      var redemption = utils.parseNumber(arguments[0][6]);
      var frequency = utils.parseNumber(arguments[0][7]);
      var basis = utils.parseNumber(arguments[0][8]);

      if(utils.isNum(settlement)){
        settlement = moment("1900/01/01").add(settlement,'d').format("YYYY/MM/DD");
      }

      if(utils.isNum(maturity)){
        maturity = moment("1900/01/01").add(maturity,'d').format("YYYY/MM/DD");
      }

      if(utils.isNum(issue)){
        issue = moment("1900/01/01").add(issue,'d').format("YYYY/MM/DD");
      }

      if(utils.isNum(firstCoupon)){
        firstCoupon = moment("1900/01/01").add(firstCoupon,'d').format("YYYY/MM/DD");
      }

      return finacial.ODDFYIELD(settlement, maturity, issue, firstCoupon, rate, pr, redemption, frequency, basis);
    })


    parser.setFunction('PRICE', function () {
      var settlement = arguments[0][0];
      var maturity = arguments[0][1];
      var rate = utils.parseNumber(arguments[0][2]);
      var yld = utils.parseNumber(arguments[0][3]);
      var redemption = utils.parseNumber(arguments[0][4]);
      var frequency = utils.parseNumber(arguments[0][5]);
      var basis = utils.parseNumber(arguments[0][6]);

      if(utils.isNum(settlement)){
        settlement = moment("1900/01/01").add(settlement,'d').format("YYYY/MM/DD");
      }

      if(utils.isNum(maturity)){
        maturity = moment("1900/01/01").add(maturity,'d').format("YYYY/MM/DD");
      }

      return finacial.PRICE(settlement, maturity, rate, yld, redemption, frequency, basis);
    })

    parser.setFunction('XNPV', function () {
      let [r, cfs, dates] = arguments[0];
      r = utils.parseNumber(r);
      cfs = utils.flatten(cfs);
      dates = utils.flatten(dates);
      return finacial.XNPV(r, cfs, dates);
    })

    parser.setFunction('YIELDDISC', function () {
      let [settlement, maturity, pr, redemption, basis] = arguments[0];
      pr = utils.parseNumber(pr);
      redemption = utils.parseNumber(redemption);
      basis = utils.parseNumber(basis);
      return finacial.YIELDDISC(settlement, maturity, pr, redemption, basis);
    })


    parser.setFunction('YIELDMAT', function () {
      let [settlement, maturity, issue, rate, pr, basis] = arguments[0];
      if (typeof rate === "string" && rate.indexOf("%") != "-1") {
        rate = parseFloat(rate) / 100;
      }
      pr = utils.parseNumber(pr);
      rate = utils.parseNumber(rate);
      basis = utils.parseNumber(basis);
      return finacial.YIELDMAT(settlement, maturity, issue, rate, pr, basis);
    })

    parser.setFunction('PRICEDISC', function () {
      var settlement = arguments[0][0];
      var maturity = arguments[0][1];
      var discount = utils.parseNumber(arguments[0][2]);
      var redemption = utils.parseNumber(arguments[0][3]);
      var basis = utils.parseNumber(arguments[0][4]);

      if(utils.isNum(settlement)){
        settlement = moment("1900/01/01").add(settlement,'d').format("YYYY/MM/DD");
      }

      if(utils.isNum(maturity)){
        maturity = moment("1900/01/01").add(maturity,'d').format("YYYY/MM/DD");
      }

      return finacial.PRICEDISC(settlement, maturity, discount, redemption, basis);
    })

    parser.setFunction('PRICEMAT', function () {
      var settlement = arguments[0][0];
      var maturity = arguments[0][1];
      var issue = arguments[0][2];
      var rate = utils.parseNumber(arguments[0][3]);
      var yld = utils.parseNumber(arguments[0][4]);
      var basis = utils.parseNumber(arguments[0][5]);

      if(utils.isNum(settlement)){
        settlement = moment("1900/01/01").add(settlement,'d').format("YYYY/MM/DD");
      }

      if(utils.isNum(maturity)){
        maturity = moment("1900/01/01").add(maturity,'d').format("YYYY/MM/DD");
      }

      if(utils.isNum(issue)){
        issue = moment("1900/01/01").add(issue,'d').format("YYYY/MM/DD");
      }

      return finacial.PRICEMAT(settlement, maturity, issue, rate, yld, basis);
    })

    parser.setFunction('RECEIVED', function () {
      var settlement = arguments[0][0];
      var maturity = arguments[0][1];
      var investment = utils.parseNumber(arguments[0][2]);
      var discount = utils.parseNumber(arguments[0][3]);
      var basis = utils.parseNumber(arguments[0][4]);

      if(utils.isNum(settlement)){
        settlement = moment("1900/01/01").add(settlement,'d').format("YYYY/MM/DD");
      }

      if(utils.isNum(maturity)){
        maturity = moment("1900/01/01").add(maturity,'d').format("YYYY/MM/DD");
      }


      return finacial.RECEIVED(settlement, maturity, investment, discount, basis);
    })


    parser.setFunction('RRI', function () {
      var periods = arguments[0][0];
      var present = arguments[0][1];
      var future = arguments[0][2];

      if(utils.isNum(periods) && utils.isNum(present) && utils.isNum(future)){
          return utils.callParserFunc("RRI", periods,present,future)
      }else{
        return error.value;
      }
    })

    parser.setFunction('SLN', function () {
      var cost = arguments[0][0];
      var salvage = arguments[0][1];
      var life = arguments[0][2];

      if(utils.isNum(cost) && utils.isNum(salvage) && utils.isNum(life)){
          return utils.callParserFunc("SLN", cost,salvage,life)
      }else{
        return error.value;
      }
    })

    parser.setFunction('SYD', function () {
      var cost = arguments[0][0];
      var salvage = arguments[0][1];
      var life = arguments[0][2];
      var period = arguments[0][2];


      if(utils.isNum(cost) && utils.isNum(salvage) && utils.isNum(life) && utils.isNum(period)){
          return utils.callParserFunc("SYD", cost, salvage, life, period)
      }else{
        return error.value;
      }
    })


    parser.setFunction('TBILLEQ', function () {
      var settlement = arguments[0][0];
      var maturity = arguments[0][1];
      var discount = utils.parseNumber(arguments[0][2]);

      if(utils.isNum(settlement)){
        settlement = moment("1900/01/01").add(settlement,'d').format("YYYY/MM/DD");
      }

      if(utils.isNum(maturity)){
        maturity = moment("1900/01/01").add(maturity,'d').format("YYYY/MM/DD");
      }


      return finacial.TBILLEQ(settlement, maturity, discount);
    })

    parser.setFunction('TBILLPRICE', function () {
      var settlement = arguments[0][0];
      var maturity = arguments[0][1];
      var discount = utils.parseNumber(arguments[0][2]);

      if(utils.isNum(settlement)){
        settlement = moment("1900/01/01").add(settlement,'d').format("YYYY/MM/DD");
      }

      if(utils.isNum(maturity)){
        maturity = moment("1900/01/01").add(maturity,'d').format("YYYY/MM/DD");
      }

      return finacial.TBILLPRICE(settlement, maturity, discount);
    })

    parser.setFunction('TBILLYIELD', function () {
      var settlement = arguments[0][0];
      var maturity = arguments[0][1];
      var pr = utils.parseNumber(arguments[0][2]);

      if(utils.isNum(settlement)){
        settlement = moment("1900/01/01").add(settlement,'d').format("YYYY/MM/DD");
      }

      if(utils.isNum(maturity)){
        maturity = moment("1900/01/01").add(maturity,'d').format("YYYY/MM/DD");
      }

      return finacial.TBILLYIELD(settlement, maturity, pr);
    })


    parser.setFunction('XIRR', function () {
      var cfs = arguments[0][0];
      var dates = arguments[0][1];
      var guess = utils.parseNumber(arguments[0][2]);
      var cfsArr = [];
      cfs.forEach(item=>{
        cfsArr = cfsArr.concat(item);
      })
      var datesArr = [];
      dates.forEach(item=>{
        datesArr = datesArr.concat(item);
      })
      var datesArrFormat = [];
      datesArr.forEach(item=>{
        if(utils.isNum(item)){
          item = moment("1900/01/01").add(item,'d').format("YYYY/MM/DD");
        }
        datesArrFormat.push(item);
      })

      return finacial.XIRR(cfsArr, datesArrFormat, guess);
    })


    parser.setFunction('AMORDEGRC', function () {
      var cost = utils.parseNumber(arguments[0][0]);
      var datePurchased = arguments[0][1];
      var firstPeriod = arguments[0][2];
      var salvage = utils.parseNumber(arguments[0][3]);
      var period = utils.parseNumber(arguments[0][4]);
      var rate = utils.parseNumber(arguments[0][5]);
      var basis = utils.parseNumber(arguments[0][6]);

      if(utils.isNum(datePurchased)){
        datePurchased = moment("1900/01/01").add(datePurchased,'d').format("YYYY/MM/DD");
      }

      if(utils.isNum(firstPeriod)){
        firstPeriod = moment("1900/01/01").add(firstPeriod,'d').format("YYYY/MM/DD");
      }

      return finacial.AMORDEGRC(cost, datePurchased, firstPeriod, salvage, period, rate, basis, true);
    })

    parser.setFunction('COUPDAYBS', function () {
      var settlement = arguments[0][0];
      var maturity = arguments[0][1];
      var frequency = utils.parseNumber(arguments[0][2]);
      var basis = utils.parseNumber(arguments[0][3]);


      if(utils.isNum(settlement)){
        settlement = moment("1900/01/01").add(settlement,'d').format("YYYY/MM/DD");
      }

      if(utils.isNum(maturity)){
        maturity = moment("1900/01/01").add(maturity,'d').format("YYYY/MM/DD");
      }

      return finacial.COUPDAYBS(settlement, maturity, frequency, basis);
    })

    parser.setFunction('ODDLPRICE', function () {
      var settlement = arguments[0][0];
      var maturity = arguments[0][1];
      var lastInterest = arguments[0][2];
      var rate = utils.parseNumber(arguments[0][3]);
      var yld = utils.parseNumber(arguments[0][4]);
      var redemption = utils.parseNumber(arguments[0][5]);
      var frequency = utils.parseNumber(arguments[0][6]);
      var basis = utils.parseNumber(arguments[0][7]);


      if(utils.isNum(settlement)){
        settlement = moment("1900/01/01").add(settlement,'d').format("YYYY/MM/DD");
      }

      if(utils.isNum(maturity)){
        maturity = moment("1900/01/01").add(maturity,'d').format("YYYY/MM/DD");
      }

      if(utils.isNum(lastInterest)){
        lastInterest = moment("1900/01/01").add(lastInterest,'d').format("YYYY/MM/DD");
      }

      return finacial.ODDLPRICE(settlement, maturity, lastInterest, rate, yld, redemption, frequency, basis);
    })


    parser.setFunction('ODDLYIELD', function () {
      var settlement = arguments[0][0];
      var maturity = arguments[0][1];
      var lastInterest = arguments[0][2];
      var rate = utils.parseNumber(arguments[0][3]);
      var pr = utils.parseNumber(arguments[0][4]);
      var redemption = utils.parseNumber(arguments[0][5]);
      var frequency = utils.parseNumber(arguments[0][6]);
      var basis = utils.parseNumber(arguments[0][7]);


      if(utils.isNum(settlement)){
        settlement = moment("1900/01/01").add(settlement,'d').format("YYYY/MM/DD");
      }

      if(utils.isNum(maturity)){
        maturity = moment("1900/01/01").add(maturity,'d').format("YYYY/MM/DD");
      }

      if(utils.isNum(lastInterest)){
        lastInterest = moment("1900/01/01").add(lastInterest,'d').format("YYYY/MM/DD");
      }

      return finacial.ODDLYIELD(settlement, maturity, lastInterest, rate, pr, redemption, frequency, basis);

    })





    parser.on('callFunction', function (name, params, done) {
      switch (name) {
        case 'PI':
        case 'RAND':
        case 'NOW':
        case 'NA':
          if (params.length > 0) {
            done(error.error)
            return error.error
          }
          break
        case 'INFO':
        case 'ERROR.TYPE':
        case 'ISREF':
        case 'ISBLANK':
        case 'ISERR':
        case 'ISFORMULA':
        case 'ISNA':
        case 'ISLOGICAL':
        case 'ISERROR':
        case 'ISNONTEXT':
        case 'ISNUMBER':
        case 'ISTEXT':
        case 'N':
        case 'TYPE':
        case 'DEGREES':
        case 'AREAS':
        case 'COLUMNS':
        case 'ROWS':
        case 'FORMULATEXT':
        case 'ERFC.PRECISE':
        case 'ERF.PRECISE':
          if (params.length !== 1) {
            done(error.error)
            return error.error
          }
          break
        case 'BESSELI':
        case 'BESSELJ':
        case 'BESSELK':
        case 'BESSELY':
        case 'CHIDIST':
        case 'CHIINV':
        case 'CHITEST':
        case 'COVAR':
        case 'FTEST':
        case 'PERCENTILE':
        case 'QUARTILE':
          if (params.length !== 2) {
            done(error.error)
            return error.error
          }
          break
        case 'DATEDIF':
        case 'CONFIDENCE':
        case 'CRITBINOM':
        case 'GAMMAINV':
        case 'LOGINV':
        case 'NEGBINOMDIST':
        case 'POISSON':
          if (params.length !== 3) {
            done(error.error)
            return error.error
          }
          break
        case 'GAMMADIST':
        case 'WEIBULL':
          if (params.length !== 4) {
            done(error.error)
            return error.error
          }
          break
        case 'IF':
          if (params.length == 1) {
            done(error.error)
            return error.error
          } else if (params.length == 2) {
            params.push('FALSE')
          }
          break
        default:
          break
      }
    })
    // web函数
    parser.setFunction('ENCODEURL', function () {
      const encodeData = encodeURIComponent(arguments[0][0])
      return utils.isLogical(arguments[0][0]) ? encodeData.toUpperCase() : encodeData
    })
    parser.setFunction('FILTERXML', function () {
      if (arguments[0].length !== 2) {
        return error.error
      }
      if (!utils.isText(arguments[0][0]) || !utils.isText(arguments[0][1])) {
        return error.value
      }
      const xmlDoc = utils.loadXML(arguments[0][0])
      if (!xmlDoc || xmlDoc.getElementsByTagName('parsererror')[0]) {
        return error.value
      }
      const ele = xmlDoc.getElementsByTagName(arguments[0][1])[0]
      if (!ele) {
        return error.value
      }
      return ele.innerHTML
    })
    // 日期与时间函数
    parser.setFunction('DATEDIF', function () {
      let startData
      let endData
      if (arguments[0][0].indexOf('-') || arguments[0][0].indexOf('/')) {
        if (!utils.isValidDate(arguments[0][0])) {
          return error.value
        }
        startData = new Date(arguments[0][0])
      } else {
        startData = utils.seqParseDate(arguments[0][0])
      }
      if (arguments[0][1].indexOf('-') || arguments[0][1].indexOf('/')) {
        if (!utils.isValidDate(arguments[0][1])) {
          return error.value
        }
        endData = new Date(arguments[0][1])
      } else {
        endData = utils.seqParseDate(arguments[0][1])
      }
      const unit = arguments[0][2].toLowerCase()
      if (endData.getTime() - startData.getTime() < 0) {
        return error.num
      }
      if (unit === 'y') {
        let betYear = endData.getFullYear() - startData.getFullYear()
        let betMonth = endData.getMonth() - startData.getMonth()
        let betDay = endData.getDate() - startData.getDate()
        if (betMonth > 0 || (betMonth === 0 && betDay >= 0)) {
          return betYear
        } else {
          return betYear - 1
        }
      } else if (unit === 'm') {
        let betDay = endData.getDate() - startData.getDate()
        let resMonth = (endData.getFullYear() - startData.getFullYear()) * 12 + endData.getMonth() - startData.getMonth()
        return betDay >= 0 ? resMonth : resMonth - 1
      } else if (unit === 'd') {
        return (endData.getTime() - startData.getTime()) / (1000 * 60 * 60 * 24)
      } else if (unit === 'md') {
        const newStartMonthIndex = endData.getDate() - startData.getDate() >= 0 ? endData.getMonth() : endData.getMonth() - 1
        const newStartData = new Date(endData.getFullYear(), newStartMonthIndex, startData.getDate())
        return ((endData.getTime() - newStartData.getTime()) / (1000 * 60 * 60 * 24))
      } else if (unit === 'ym') {
        let betYear = endData.getFullYear() - startData.getFullYear()
        let betMonth = endData.getMonth() - startData.getMonth()
        let betDay = endData.getDate() - startData.getDate()
        let resMonth
        if (!(betYear > 1 || (betYear === 1 && betMonth > 0) || (betYear === 1 && betMonth === 0 && betDay >= 0))) {
          resMonth = (endData.getFullYear() - startData.getFullYear()) * 12 + endData.getMonth() - startData.getMonth()
        } else {
          resMonth = endData.getMonth() - startData.getMonth()
        }
        return betDay >= 0 ? resMonth : resMonth - 1
      } else if (unit === 'yd') {
        const newStartData = new Date(endData.getFullYear(), startData.getMonth(), startData.getDate())
        return (endData.getTime() - newStartData.getTime()) / (1000 * 60 * 60 * 24)
      }
      return error.num
    })
    // 兼容性函数
    parser.setFunction('CHIDIST', function () {
      const x = utils.parseNumber(arguments[0][0])
      const degFreedom = utils.parseNumber(arguments[0][1])
      if (utils.anyIsError(x, degFreedom)) {
        return error.value;
      } else if (x < 0 || degFreedom <= 0) {
        return error.num
      } else if (x === 0) {
        return 1
      }
      return utils.callParserFunc('CHISQ.DIST.RT', x, degFreedom)
    })
    parser.setFunction('CHIINV', function () {
      const probability = utils.parseNumber(arguments[0][0])
      const degFreedom = utils.parseNumber(arguments[0][1])
      if (utils.anyIsError(probability, degFreedom)) {
        return error.value;
      } else if (probability <= 0 || probability > 1 || degFreedom <= 0) {
        return error.num
      }
      return utils.callParserFunc('CHISQ.INV.RT', probability, degFreedom)
    })
    parser.setFunction('CHITEST', function () {
      return utils.chisqTest(arguments[0][0], arguments[0][1])
    })
    parser.setFunction('CONFIDENCE', function () {
      const alpha = utils.parseNumber(arguments[0][0])
      const sd = utils.parseNumber(arguments[0][1])
      const n = utils.parseNumber(arguments[0][2])
      if (utils.anyIsError(alpha, sd, n)) {
        return error.value;
      } else if (alpha > 0 && alpha < 1 && sd > 0 && n >= 1) {
        return utils.callParserFunc('CONFIDENCE.NORM', alpha, sd, n)
      } else {
        return error.num
      }
    })
    parser.setFunction('COVAR', function () {
      return utils.callParserFunc1('COVARIANCE.P', arguments[0])
    })
    parser.setFunction('CRITBINOM', function () {
      const trials = utils.parseNumber(arguments[0][0])
      const probability = utils.parseNumber(arguments[0][1])
      const alpha = utils.parseNumber(arguments[0][2])
      if (utils.anyIsError(trials, probability, alpha)) {
        return error.value;
      } else if (trials < 0 || probability >= 1 || probability <= 0 || alpha >= 1 || probability <= 0) {
        return error.num
      }
      return utils.callParserFunc1('BINOM.INV', arguments[0])
    })
    // 不可用
    parser.setFunction('FTEST', function () {
      let array1 = arguments[0][0];
      let array2 = arguments[0][1]
      if (!array1 || !array2) {
          return error.na;
      }
      if (!(array1 instanceof Array) || !(array2 instanceof Array)) {
        return error.na;
      }
      if (array1.length < 2 || array2.length < 2) {
        return error.div0;
      }
      let org1 = utils.flatten(arguments[0][0]).filter(arg => !Number.isNaN(Number(arg)) && arg !== null && arg !== '')
      let org2 = utils.flatten(arguments[0][1]).filter(arg => !Number.isNaN(Number(arg)) && arg !== null && arg !== '')
      array1 = utils.parseNumberArray(org1);
      array2 = utils.parseNumberArray(org2);
      if (array1 instanceof Error || array2 instanceof Error) {
        return range;
      }
        var sumOfSquares = function(values, x3) {
          var sum3 = 0;
          for (var i = 0; i < values.length; i++) {
            sum3 +=Math.pow((values[i] - x3), 2);
          }
          return sum3;
        };

        var sum = function(arr) {
          var sum4 = 0;
          var i = arr.length;
          while (--i >= 0)
            sum4 += arr[i];
          return sum4;
        };
        var x1 = sum(array1) / array1.length;
        var x2 = sum(array2) / array2.length;
        var sum1 = sumOfSquares(array1, x1) / (array1.length - 1);
        var sum2 = sumOfSquares(array2, x2) / (array2.length - 1);
        console.info(sum1,sum2)
        return sum1 / sum2;
      // return utils.callParserFunc1('F.TEST', arguments[0])
    })
    // 不可用
    parser.setFunction('TTEST', function () {
      console.info(arguments[0])
      return utils.callParserFunc1('T.TEST', arguments[0])
    })
    parser.setFunction('GAMMADIST', function () {
      const x = utils.parseNumber(arguments[0][0])
      const alpha = utils.parseNumber(arguments[0][1])
      const beta = utils.parseNumber(arguments[0][2])
      if (utils.anyIsError(x, alpha, beta)) {
        return error.value;
      } else if (x < 0 || alpha <= 0 || beta <= 0) {
        return error.num
      } else if (!utils.isNum(arguments[0][3])) {
        return error.value;
      }
      return utils.callParserFunc1('GAMMA.DIST',arguments[0])
    })
    parser.setFunction('GAMMAINV', function () {
      const probability = utils.parseNumber(arguments[0][0])
      const alpha = utils.parseNumber(arguments[0][1])
      const beta = utils.parseNumber(arguments[0][2])
      if (utils.anyIsError(probability, alpha, beta)) {
        return error.value;
      }
      if (probability >= 1 || probability < 0 || alpha <= 0 || beta <= 0) {
        return error.num
      }
      return utils.callParserFunc1('GAMMA.INV',arguments[0])
    })
    parser.setFunction('LOGINV', function () {
      const probability = utils.parseNumber(arguments[0][0]);
      const sd = utils.parseNumber(arguments[0][2]);

      if (probability >= 1 || probability <= 0 || sd <= 0) {
        return error.num
      }
      return utils.callParserFunc1('LOGNORM.INV',arguments[0])
    })
    parser.setFunction('MODE', function () {
      if (arguments[0].length < 1 || arguments[0].length > 30) {
        return error.error;
      }
      let errInfo;
      arguments[0].forEach(param => {
        if (!Array.isArray(param) && Number.isNaN(Number(param))) {
          errInfo = error.value
          return true
        }
      })
      if (errInfo) {
        return errInfo;
      }
      let originRange = utils.flatten(arguments[0]).filter(arg => !Number.isNaN(Number(arg)) && arg !== null && arg !== '')
      let range = utils.parseNumberArray(originRange);
      if (range instanceof Error) {
        return range;
      }
      let isNa = false;
      let n = range.length;
      let count = {};
      let maxItems = [];
      let max = 0;
      let currentItem;
      for (let i = 0; i < n; i++) {
        currentItem = range[i];
        count[currentItem] = count[currentItem] ? count[currentItem] + 1 : 1;
        if (count[currentItem] > max) {
          max = count[currentItem];
          maxItems = [];
        }
        if (count[currentItem] === max) {
          maxItems[maxItems.length] = currentItem;
        }
      }
      Object.values(count).some(cnt=>{
        if (cnt > 1) {
          isNa = true;
          return true;
        }
      });
      if (!isNa) {
        return error.na;
      }
      return maxItems.sort(function(a, b) {
        return a - b;
      })[0];
    })
    parser.setFunction('NEGBINOMDIST', function () {
      const nf = utils.parseNumber(arguments[0][0]);
      const ns = utils.parseNumber(arguments[0][1]);
      const probability = utils.parseNumber(arguments[0][2]);
      if (probability >= 1 || probability <= 0 || nf < 0 || ns < 1) {
        return error.num
      }
      return utils.callParserFunc1('NEGBINOM.DIST',arguments[0])
    })
    parser.setFunction('PERCENTILE', function () {
      let array = arguments[0][0];
      const k = utils.parseNumber(arguments[0][1]);
      if (k > 1 || k < 0) {
        return error.num
      }
      let originArray = utils.flatten(array).filter(arg => !Number.isNaN(Number(arg)) && arg !== null && arg !== '')
      if (originArray.length === 0) {
        return error.num
      }
      array = utils.parseNumberArray(originArray);
      if (utils.anyIsError(array, k)) {
        return error.value;
      }
      let arrayResult = array.sort(function(a, b) {
        return a - b;
      });
      var n = arrayResult.length;
      var l = k * (n - 1);
      var fl = Math.floor(l);
      return utils.cleanFloat((l === fl) ? arrayResult[l] : arrayResult[fl] + (l - fl) * (arrayResult[fl + 1] - arrayResult[fl]));
    })
    parser.setFunction('PERCENTRANK', function () {
      if (arguments[0].length < 2 || arguments[0].length > 3) {
        return error.error;
      }
      const x = utils.parseNumber(arguments[0][1]);
      let originArray = utils.flatten(arguments[0][0]).filter(arg => !Number.isNaN(Number(arg)) && arg !== null && arg !== '')
      if (originArray.length === 0) {
        return error.num
      }
      if ( x > Math.max(...originArray) || x < Math.min(...originArray)) {
        return error.na
      }
      const sign = arguments[0].length === 3 ? utils.parseNumber(arguments[0][2]) : 3;
      if (utils.anyIsError(x, sign, originArray)) {
        return error.value;
      }
      let params = [];
      params[0] = originArray
      params[1] = x
      params[2] = sign
      if (sign >= 309) {
        return error.div0
      } else if (sign <= 0 ) {
        return error.num
      }
      return utils.callParserFunc1('PERCENTRANKINC',params)
    })
    parser.setFunction('POISSON', function () {
      const x = utils.parseNumber(arguments[0][0])
      const cumulative = utils.parseNumber(arguments[0][2])
      if (x < 0) {
        return error.num
      } else if (utils.anyIsError(x, cumulative)) {
        return error.value;
      }
      return utils.callParserFunc1('POISSON.DIST',arguments[0])
    })
    parser.setFunction('QUARTILE', function () {
      const quart = utils.parseNumber(arguments[0][1]);
      let originArray = utils.flatten(arguments[0][0]).filter(arg => !Number.isNaN(Number(arg)) && arg !== null && arg !== '')
      if (originArray.length === 0) {
        return error.num
      } else if (utils.anyIsError(quart, originArray)) {
        return error.value;
      }
      let params = [];
      if (quart === 0) {
        return Math.min(...originArray)
      } else if (quart === 4) {
        return Math.max(...originArray)
      }
      params[0] = originArray;
      params[1] = arguments[0][1];
      return utils.callParserFunc1('QUARTILE.INC',params)
    })
    parser.setFunction('RANK', function () {
      if (arguments[0].length < 2 || arguments[0].length > 3) {
        return error.error;
      }
      const number = utils.parseNumber(arguments[0][0]);
      let order = arguments[0].length === 3 ? utils.parseNumber(arguments[0][2]) : false;
      const originArray = utils.flatten(arguments[0][1]).filter(arg => !Number.isNaN(Number(arg)) && arg !== null && arg !== '')
      if (originArray.length === 0) {
        return error.num
      }
      let range = utils.parseNumberArray(originArray);
      if (utils.anyIsError(number, range, order)) {
        return error.value;
      }
      const sort = (order) ? function(a, b) {
        return a - b;
      } : function(a, b) {
        return b - a;
      };
      let rangeResult = range.sort(sort)
      let index = rangeResult.indexOf(number) + 1;
      return index === 0 ? error.na : index;
    })
    parser.setFunction('STDEV', function () {
      if (arguments[0].length < 1) {
        return error.error;
      }
      const originArray = utils.flatten(arguments[0]).filter(arg => !Number.isNaN(Number(arg)) && arg !== null && arg !== '')
      if (originArray.length === 0) {
        return error.num
      }
      let range = utils.numbers(originArray);
      let n = range.length;
      let sigma = 0;
      let mean = utils.callParserFunc('AVERAGE', range);
      for (let i = 0; i < n; i++) {
        sigma += Math.pow(range[i] - mean, 2);
      }
      return Math.sqrt(sigma / (n - 1));
    })
    parser.setFunction('VAR', function () {
      if (arguments[0].length < 1) {
        return error.error;
      }
      const originArray = utils.flatten(arguments[0]).filter(arg => !Number.isNaN(Number(arg)) && arg !== null && arg !== '')
      if (originArray.length === 0) {
        return error.num
      }
      let range = utils.numbers(utils.flatten(arguments));
      let n = range.length;
      let sigma = 0;
      let mean = utils.callParserFunc('AVERAGE', range);
      for (let i = 0; i < n; i++) {
        sigma += Math.pow(range[i] - mean, 2);
      }
      return sigma / (n - 1);
    })
    parser.setFunction('WEIBULL', function () {
      const x = utils.parseNumber(arguments[0][0])
      const alpha = utils.parseNumber(arguments[0][1])
      const beta = utils.parseNumber(arguments[0][2])
      const cumulative = utils.parseNumber(arguments[0][3])
      if (utils.anyIsError(x, alpha, beta, cumulative)) {
        return error.value;
      } else if (x < 0 || alpha <= 0 || beta <= 0) {
        return error.num
      }
      return utils.callParserFunc1('WEIBULL.DIST',arguments[0])
    })
    parser.setFunction('ZTEST', function () {
      return utils.zTest(arguments[0])
    })
    // 查找与引用函数
    parser.setFunction('ADDRESS', function () {
      if (arguments[0].length > 5 || arguments[0].length < 2) {
        return error.error
      }
      const row = utils.parseNumber(arguments[0][0]) - 1
      const col = utils.parseNumber(arguments[0][1]) - 1
      const abs = arguments[0].length >= 3 ? utils.parseNumber(arguments[0][2]) : 1
      const a1 = arguments[0].length >= 4 ? utils.parseNumber(arguments[0][3]) : 1
      let sheet = arguments[0].length === 5 ? arguments[0][4] || null : null
      if (utils.anyIsError(row, col, abs, a1) || row < 0 || col < 0 || !([1,2,3,4].includes(abs))) {
        return error.value
      }
      let address;
      if (a1 === 0) {
          switch (abs) {
            case 1:
              address = `R${col + 1}C${utils.rowIndexToLabel(row)}`
              break
            case 2:
              address = `R${col + 1}C[${utils.rowIndexToLabel(row)}]`
              break
            case 3:
              address = `R[${col + 1}]C${utils.rowIndexToLabel(row)}`
              break
            case 4:
              address = `R[${col + 1}]C[${utils.rowIndexToLabel(row)}]`
              break
          }
      } else {
          switch (abs) {
            case 1:
              address = `$${utils.columnIndexToLabel(col)}$${utils.rowIndexToLabel(row)}`
              break
            case 2:
              address = `${utils.columnIndexToLabel(col)}$${utils.rowIndexToLabel(row)}`
              break
            case 3:
              address = `$${utils.columnIndexToLabel(col)}${utils.rowIndexToLabel(row)}`
              break
            case 4:
              address = `${utils.columnIndexToLabel(col)}${utils.rowIndexToLabel(row)}`
              break
          }
      }
      if (sheet != null) {
        if (['0','1','2','3','4','5','6','7','8','9'].includes(sheet.charAt(0))) {
          sheet = `'${sheet}'!`
        } else {
          sheet = `${sheet}!`
        }
      }
      return `${sheet}${address}`
    })
    // 不支持接收多个区域 =AREAS((A1,A2,A1:A2,A1))
    parser.setFunction('AREAS', function () {
      const cellInfo = utils.getCellInfo();
      if (cellInfo['precedents'].length > 0) {
        return 1
      }
      return error.error;
    })
    parser.setFunction('CHOOSE', function () {
      let index = utils.parseNumber(arguments[0][0])
      if (arguments[0].length < 2) {
        return error.error
      } else if (utils.anyIsError(index) || index < 1 || index > arguments[0].length - 1) {
        return error.value;
      }
      index = utils.trunc(index, 0);
      let value = arguments[0][index]
      value = Array.isArray(value) ? value[0] : value
      if (value === '' || value === null) {
        return 0
      }
      return value
    })
    parser.setFunction('COLUMN', function () {
      const cellInfo = utils.getCellInfo();
      if (arguments[0].length > 1) {
        return error.error
      } else if (cellInfo['precedents'].length === 0 && arguments[0].length === 0) {
        return cellInfo['column'] + 1
      } else if (cellInfo['precedents'].length > 0) {
        return cellInfo['precedents'][0]['column'] + 1
      }
      return error.error;
    })
    parser.setFunction('COLUMNS', function () {
      const cellInfo = utils.getCellInfo();
      const array = arguments[0][0]
      if (cellInfo['precedents'].length === 0) {
        return error.error
      }
      // let columnList = [...new Set(cellInfo['precedents'].map(item => item.column))];
      return Array.isArray(array) ? array[0].length || 1 : 1
    })
    parser.setFunction('ROW', function () {
      const cellInfo = utils.getCellInfo();
      if (arguments[0].length > 1) {
        return error.error
      } else if (cellInfo['precedents'].length === 0 && arguments[0].length === 0) {
        return cellInfo['row'] + 1
      } else if (cellInfo['precedents'].length > 0) {
        return cellInfo['precedents'][0]['row'] + 1
      }
      return error.error;
    })
    parser.setFunction('ROWS', function () {
      const cellInfo = utils.getCellInfo();
      const array = arguments[0][0]
      if (cellInfo['precedents'].length === 0) {
        return error.error
      }
      // let rowList = [...new Set(cellInfo['precedents'].map(item => item.row))];
      return array.length || 1
    })
    parser.setFunction('FORMULATEXT', function () {
      const cellInfo = utils.getCellInfo();
      if (cellInfo['precedents'].length === 0) {
        return error.error
      }
      const row = cellInfo['precedents'][0]['row'];
      const col = cellInfo['precedents'][0]['column']
      let refData = store.state.ReportMgt.hot.getSourceDataAtCell(row, col);
      if (`${refData}`.charAt(0) !== '=') {
        return error.na
      }
      return `'${refData} `;
    })
    parser.setFunction('OFFSET', function () {
      const maxCol =store.state.ReportMgt.hot.countCols() - 1;
      const maxRow =store.state.ReportMgt.hot.countRows() - 1;
      if (arguments[0].length > 5 || arguments[0].length < 3) {
        return error.error
      }
      const cellInfo = utils.getCellInfo();
      if (cellInfo['precedents'].length === 0) {
        return error.error
      }
      const offRow = utils.trunc(utils.parseNumber(arguments[0][1]), 0)
      const offCol = utils.trunc(utils.parseNumber(arguments[0][2]), 0)
      const height = arguments[0].length >= 4 ? utils.trunc(utils.parseNumber(arguments[0][3]), 0) : 1
      const width = arguments[0].length === 5 ? utils.trunc(utils.parseNumber(arguments[0][4]), 0) : 1
      if (utils.anyIsError(offRow, offCol) || height > 1 || width > 1 || height <= 0 || width <= 0) {
        return error.value
      }
      const row = cellInfo['precedents'][0]['row'] + offRow
      const col = cellInfo['precedents'][0]['column'] + offCol
      if (row < 0 || col < 0 || row > maxRow || col > maxCol) {
        return error.ref
      }
      return store.state.ReportMgt.hot.getDataAtCell(row, col) || 0
    })
    parser.setFunction('INDIRECT', function () {
      if (arguments[0].length > 2 || arguments[0].length < 1) {
        return error.error
      }
      const maxCol =store.state.ReportMgt.hot.countCols() - 1;
      const maxRow =store.state.ReportMgt.hot.countRows() - 1;
      let row;
      let col;
      const ref = arguments[0][0]
      let isA = arguments[0].length === 2 ? arguments[0][1] : true
      if (isA === 'true') {
        isA = true
      } else if (isA === 'false') {
        isA = false
      } else if(utils.isText(isA)) {
        return error.value
      }
      if (isA) {
        let cellInfo = utils.extractLabel(ref)
        row = cellInfo[0].index
        col = cellInfo[1].index
      } else {
        let temp = ref.toLowerCase().replace('[','').replace(']','')
        let tempArray = temp.split('c')
        row = utils.parseNumber(tempArray[0].replace('r','')) -1
        col = utils.parseNumber(tempArray[1]) - 1
      }
      if (utils.anyIsError(row, col) ||  row < 0 || col < 0 || row > maxRow || col > maxCol) {
        return error.ref
      }
      return store.state.ReportMgt.hot.getDataAtCell(row, col) || 0
    })
    parser.setFunction('INDEX', function () {
      if (arguments[0].length > 3 || arguments[0].length < 2) {
        return error.error
      }
      let key1 = utils.parseNumber(arguments[0][1])
      let key2 = arguments[0].length ===3 ? utils.parseNumber(arguments[0][2]) : 1
      let array = arguments[0][0]
      if (utils.anyIsError(key1, key2) || (arguments[0].length === 3 && key2 < 1)) {
        return error.value
      }
      let row = utils.trunc(utils.parseNumber(arguments[0][1]) || 1, 0)
      let col = utils.trunc(arguments[0].length === 3 ? utils.parseNumber(arguments[0][2]) || 1 : 1, 0)
      if (!Array.isArray(array)) {
        array = []
        array[0] = []
        array[0][0] = arguments[0][0]
      }
      if (array.length === 1 && arguments[0].length === 2) {
        row = 1;
        col = utils.trunc(utils.parseNumber(arguments[0][1]) || 1, 0)
      }
      if (array.length < row || array[0].length < col || (array.length > 1 && array[0].length > 1 && arguments[0].length === 2)) {
        return error.ref
      }
      return array[row - 1][col - 1] || 0;
    })
    parser.setFunction('MATCH', function () {
      if (arguments[0].length < 2 || arguments[0].length > 3) {
        return error.error;
      }
      let lookupValue = arguments[0][0]
      let lookupArray = arguments[0][1]
      let matchType = arguments[0].length === 3 ? utils.trunc(utils.parseNumber(arguments[0][2]), 0) : 1
      if (matchType > 1) {
        matchType = 1
      }
      if (utils.anyIsError(matchType)) {
        return error.ref;
      }
      if (!Array.isArray(lookupArray)) {
        lookupArray[0] = arguments[0][1]
      } else if (lookupArray.length > 1 && lookupArray[0].length > 1) {
        return error.na
      } else if (lookupArray.length === 1) {
        lookupArray = lookupArray[0]
      } else if (lookupArray[0].length === 1) {
        lookupArray = lookupArray.map(item=>item[0])
      }
      if ((!lookupValue && !lookupArray) || matchType < -1) {
        return error.na;
      }
      if (!Number.isNaN(Number(lookupValue))) {
        lookupValue = utils.parseNumber(lookupValue);
      }
      lookupArray.forEach((item,indexs)=>{
        if (!Number.isNaN(Number(item))) {
          lookupArray[indexs] = utils.parseNumber(item);
        }
      })
      var index;
      var indexValue;
      for (var idx = 0; idx < lookupArray.length; idx++) {
        if (matchType === 1) {
          if (lookupArray[idx] === lookupValue) {
            index = idx + 1;
            return index
          } else if (lookupArray[idx] < lookupValue) {
            if (!(indexValue || indexValue === 0) || (lookupArray[idx] > indexValue)) {
              index = idx + 1;
              indexValue = lookupArray[idx];
            }
          }
        } else if (matchType === 0) {
          if (typeof lookupValue === 'string') {
            lookupValue = lookupValue.replace(/\?/g, '.');
            if (lookupArray[idx].toLowerCase().match(lookupValue.toLowerCase())) {
              index = idx + 1;
              return index
            }
          } else {
            if (lookupArray[idx] === lookupValue) {
              index = idx + 1;
              return index
            }
          }
        } else if (matchType === -1) {
          if (lookupArray[idx] === lookupValue) {
            index = idx + 1;
            return index
          } else if (lookupArray[idx] > lookupValue) {
            if (!(indexValue || indexValue === 0) || (lookupArray[idx] > indexValue)) {
              index = idx + 1;
              indexValue = lookupArray[idx];
            }
          }
        }
      }
      return index ? index : error.na;
    })
    parser.setFunction('LOOKUP', function () {
      if (arguments[0].length < 2 || arguments[0].length > 3) {
        return error.error;
      }
      let lookupValue = arguments[0][0]
      let lookupArray = arguments[0][1]
      let resultArray = arguments[0].length === 3 ? arguments[0][2] : [];
      if (arguments[0].length === 3 && (resultArray.length !== lookupArray.length || resultArray[0].length !== lookupArray[0].length)) {
        return error.na
      }
      if (!Array.isArray(lookupArray)) {
        lookupArray[0] = arguments[0][1]
      } else if (lookupArray.length > 1 && lookupArray[0].length > 1) {
        return error.na
      } else if (lookupArray.length === 1) {
        lookupArray = lookupArray[0]
        if (resultArray.length > 0) {
          resultArray = resultArray[0]
        }
      } else if (lookupArray[0].length === 1) {
        lookupArray = lookupArray.map(item=>item[0])
        if (resultArray.length > 0) {
          resultArray = resultArray.map(item=>item[0])
        }
      }
      if (!lookupValue && !lookupArray) {
        return error.na;
      }
      if (!Number.isNaN(Number(lookupValue))) {
        lookupValue = utils.parseNumber(lookupValue);
      }
      lookupArray.forEach((item,indexs)=>{
        if (!Number.isNaN(Number(item))) {
          lookupArray[indexs] = utils.parseNumber(item);
        }
      })
      var index;
      var indexValue;
      for (var idx = 0; idx < lookupArray.length; idx++) {
        if (lookupArray[idx] === lookupValue) {
          index = idx
          break
        } else if (lookupArray[idx] < lookupValue) {
          if (!(indexValue || indexValue === 0) || (lookupArray[idx] > indexValue)) {
            index = idx
            indexValue = lookupArray[idx];
          }
        }
      }
      if (resultArray.length > 0) {
        return resultArray[index] || 0
      }
      return index || index === 0 ? lookupArray[index] || 0   : error.na;
    })
    parser.setFunction('HLOOKUP', function () {
      if (arguments[0].length > 4 || arguments[0].length < 3) {
        return error.error
      }
      let needle = arguments[0][0]
      let table = arguments[0][1]
      let index = utils.trunc(utils.parseNumber(arguments[0][2]),0)
      let rangeLookup = arguments[0].length === 4 ? arguments[0][3] : true
      if (rangeLookup === 'true') {
        rangeLookup = true
      } else if (rangeLookup === 'false') {
        rangeLookup = false
      } else if(utils.isText(rangeLookup)) {
        return error.value
      }
      if (utils.anyIsError(index) || index < 1 || !Array.isArray(table)) {
        return error.value
      }
      if (!needle || !index) {
        return error.na;
      }
      if (!Number.isNaN(Number(needle))) {
        needle = utils.parseNumber(needle);
      }
      table.forEach((items, id1) => {
        items.forEach((item, id2) => {
          if (!Number.isNaN(Number(item))) {
            table[id1][id2] = utils.parseNumber(item);
          }
        })
      })
      var transposedTable = utils.transpose(table);
      for (var i = 0; i < transposedTable.length; i++) {
        var row = transposedTable[i];
        if ((!rangeLookup && row[0] === needle) ||
          ((row[0] === needle) ||
            (rangeLookup && typeof row[0] === "string" && row[0].toLowerCase().indexOf(needle.toLowerCase()) !== -1))) {
          return (index < (row.length + 1) ? row[index - 1] : error.ref);
        }
      }
      return error.na;
    })
    parser.setFunction('VLOOKUP', function () {
      if (arguments[0].length > 4 || arguments[0].length < 3) {
        return error.error
      }
      let needle = arguments[0][0]
      let table = arguments[0][1]
      let index = utils.trunc(utils.parseNumber(arguments[0][2]),0)
      let rangeLookup = arguments[0].length === 4 ? arguments[0][3] : true
      if (rangeLookup === 'true') {
        rangeLookup = true
      } else if (rangeLookup === 'false') {
        rangeLookup = false
      } else if(utils.isText(rangeLookup)) {
        return error.value
      }
      if (utils.anyIsError(index) || index < 1 || !Array.isArray(table)) {
        return error.value
      }
      if (!needle || !index) {
        return error.na;
      }
      if (!Number.isNaN(Number(needle))) {
        needle = utils.parseNumber(needle);
      }
      table.forEach((items, id1) => {
        items.forEach((item, id2) => {
          if (!Number.isNaN(Number(item))) {
            table[id1][id2] = utils.parseNumber(item);
          }
        })
      })
      for (var i = 0; i < table.length; i++) {
        var row = table[i];
        if ((!rangeLookup && row[0] === needle) ||
          ((row[0] === needle) ||
            (rangeLookup && typeof row[0] === "string" && row[0].toLowerCase().indexOf(needle.toLowerCase()) !== -1))) {
          return (index < (row.length + 1) ? row[index - 1] : error.ref);
        }
      }
      return error.na;
    })
    parser.setFunction('HYPERLINK', function () {
      if (arguments[0].length > 2 || arguments[0].length < 1) {
        return error.error
      }
      let link = arguments[0][0].replace('\\','//')
      let name = arguments[0].length === 2 ? arguments[0][1] : link
      if (link.includes('http')) {
        return `<a target="_blank" title="${name}" href="${link}">${name}</a>`
      } else if (link.charAt(0) === '#') {
        const maxCol =store.state.ReportMgt.hot.countCols() - 1;
        const maxRow =store.state.ReportMgt.hot.countRows() - 1;
        let cellInfo = utils.extractLabel(link.replace('#',''))
        let row = cellInfo[0].index
        let col = cellInfo[1].index
        if (row < 0 || col < 0 || row > maxRow || col > maxCol) {
          return error.ref
        }
        window.addEventListener('click', (e) => {
          if (e.target.className.indexOf('hyperlink') >= 0) {
            e.stopPropagation();
            let ht = store.state.ReportMgt.hot;
            let ids= e.target.id.split('-')
            ht.selectCell(utils.parseNumber(ids[0]), utils.parseNumber(ids[1]))
          }
        });
        return `<a href="javascript:void(0); title="${name}" id="${row}-${col}" class="hyperlink">${name}</a>`
      } else {
        return error.value
      }
    })
    // 工程函数
    parser.setFunction('BESSELI', function () {
      const errInfo = utils.besselError(arguments[0])
      return errInfo || utils.callParserFunc('BESSELI', arguments[0][0], arguments[0][1])
    })
    parser.setFunction('BESSELJ', function () {
      const errInfo = utils.besselError(arguments[0])
      return errInfo || utils.callParserFunc('BESSELJ', arguments[0][0], arguments[0][1])
    })
    parser.setFunction('BESSELK', function () {
      const errInfo = utils.besselError(arguments[0])
      return errInfo || utils.callParserFunc('BESSELK', arguments[0][0], arguments[0][1])
    })
    parser.setFunction('BESSELY', function () {
      const errInfo = utils.besselError(arguments[0])
      return errInfo || utils.callParserFunc('BESSELY', arguments[0][0], arguments[0][1])
    })
    parser.setFunction('ERF.PRECISE', function () {
      if (arguments[0][0] == 0 ) {
        return 0
      }
      return utils.callParserFunc('ERF', arguments[0][0])
    })
    parser.setFunction('ERFC.PRECISE', function () {
      if (arguments[0][0] == 0 ) {
        return 1
      }
      return utils.callParserFunc('ERFC', arguments[0][0])
    })
    // 信息函数
    parser.setFunction('CELL', function () {
      if (arguments[0].length < 1 || arguments[0].length > 2) {
        return error.error
      } else if (arguments[0].length === 1) {
        return error.value
      }
      const cellInfo = utils.getCellInfo()
      if (cellInfo['precedents'].length === 0) {
        return error.error;
      }
      const refRow = cellInfo['cellData'].includes('"') ? cellInfo['precedents'][0]['row'] : cellInfo['precedents'][1]['row']
      const refCol = cellInfo['cellData'].includes('"') ? cellInfo['precedents'][0]['column'] : cellInfo['precedents'][1]['column']
      switch (arguments[0][0].toLowerCase()) {
        case 'filename':
        case 'format':
          return error.value
          break
        case 'address':
          return `$${utils.columnIndexToLabel(refCol)}$${utils.rowIndexToLabel(refRow)}`
          break
        case 'protect':
        case 'parentheses':
        case 'color':
          return 0
          break
        case 'prefix':
          return ''
          break
        case 'col':
          return refCol + 1
          break
        case 'contents':
          return arguments[0][1]
          break
        case 'row':
          return refRow + 1
          break
        case 'type':
          if (arguments[0][1] === null) {
            return 'b'
          } else if (utils.isNumber(arguments[0][1]) || utils.isLogical(arguments[0][1])) {
            return 'v'
          } else if (utils.isText(arguments[0][1])) {
            return 'l'
          }
          break
        case 'width':
          return Math.round(store.state.ReportMgt.hot.getColWidth(refCol) / 10)
          break
      }
      return error.value
    })
    parser.setFunction('INFO', function () {
      switch (arguments[0][0].toLowerCase()) {
        case 'release':
        case 'directory':
        case 'origin':
        case 'osversion':
          return error.value
          break
        case 'numfile':
          return store.state.ReportMgt.edcuiCompts[1].comptAttrs.tableList.length
          break
        case 'recalc':
          return '自动'
          break
        case 'system':
          return navigator.userAgent.includes('Window') ? 'pcdos' : 'mac'
          break
      }
      return error.value
    })
    parser.setFunction('ERROR.TYPE', function () {
      switch (arguments[0][0]) {
        case error.nil: return 1
        case error.div0: return 2
        case error.value: return 3
        case error.ref: return 4
        case error.name: return 5
        case error.num: return 6
        case error.na: return 7
        case error.data: return 8
      }
      return error.na
    })
    parser.setFunction('ISBLANK', function () {
      return arguments[0][0] === null
    })
    parser.setFunction('ISREF', function () {
      const cellInfo = utils.getCellInfo();
      if (cellInfo['precedents'].length > 0) {
        return true
      }
      return false;
    })
    parser.setFunction('ISFORMULA', function () {
      const cellInfo = utils.getCellInfo()
      if (cellInfo['precedents'].length === 0) {
        return error.error;
      }
      const row = cellInfo['precedents'][0]['row'];
      const col = cellInfo['precedents'][0]['column']
      let refData = store.state.ReportMgt.hot.getSourceDataAtCell(row, col);
      if (`${refData}`.charAt(0) === '=') {
        return true
      }
      return false
    })
    parser.setFunction('ISERR', function () {
      return ([error.value, error.ref, error.div0, error.num, error.name, error.nil]).indexOf(arguments[0][0]) >= 0 ||
       (typeof value === 'number' && (isNaN(value) || !isFinite(value)))
    })
    parser.setFunction('ISERROR', function () {
      return ([error.value, error.ref, error.div0, error.num, error.name, error.na, error.nil]).indexOf(arguments[0][0]) >= 0 ||
       (typeof value === 'number' && (isNaN(value) || !isFinite(value)))
    })
    parser.setFunction('ISLOGICAL', function () {
      return utils.isLogical(arguments[0][0])
    })
    parser.setFunction('ISNA', function () {
      return arguments[0][0] === error.na
    })
    parser.setFunction('ISNONTEXT', function () {
      return !utils.isText(arguments[0][0])
    })
    parser.setFunction('ISNUMBER', function () {
      return utils.isNumber(arguments[0][0])
    })
    parser.setFunction('ISTEXT', function () {
      return utils.isText(arguments[0][0])
    })
    parser.setFunction('N', function () {
      if (arguments[0][0] === true) {
        return 1
      } else if (arguments[0][0] === false) {
        return 0
      } else if (utils.isNumber(arguments[0][0])) {
        return arguments[0][0]
      } else if (utils.isText(arguments[0][0]) && arguments[0][0].split('/').length === 3 && utils.isValidDate(arguments[0][0])) {
        return utils.dateParseSeq(arguments[0][0])
      } else {
        return 0
      }
    })
    parser.setFunction('NA', function () {
      return error.na
    })
    parser.setFunction('SHEET', function () {
      const sheetList = store.state.ReportMgt.edcuiCompts[1].comptAttrs.tableList
      if (arguments[0].length === 0) {
        return store.state.ReportMgt.sheetIndex
      } else if (arguments[0].length === 1) {
        const curSheet = sheetList.filter(sheet => sheet['sheet_name'].toLowerCase() === `${arguments[0]}`.toLowerCase())
        if (curSheet && curSheet.length > 0) {
          return curSheet[0]['sheet_index']
        } else {
          return error.na
        }
      } else {
        return error.error
      }
    })
    parser.setFunction('SHEETS', function () {
      const sheetList = store.state.ReportMgt.edcuiCompts[1].comptAttrs.tableList
      if (arguments[0].length === 0) {
        return sheetList.length
      } else if (arguments[0].length === 1) {
        if (utils.isNumber(arguments[0][0])) {
          return error.na
        } else if (typeof arguments[0][0] === 'boolean') {
          return error.value
        }
        return 1
      } else {
        return error.error
      }
    })
    parser.setFunction('TYPE', function () {
      if (utils.isNumber(arguments[0][0]) || arguments[0][0] === null) {
        return 1
      } else if (utils.isText(arguments[0][0])) {
        return 2
      } else if (utils.isLogical(arguments[0][0])) {
        return 4
      } else if (Array.isArray(arguments[0][0])) {
        return 64
      } else {
        return 16
      }
    })
    // 文本函数
    parser.setFunction('ASC', function () {
      let [str] = arguments[0];
      let tmp = "";
      for (var i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 65248 && str.charCodeAt(i) < 65375) {
          tmp += String.fromCharCode(str.charCodeAt(i) - 65248);
        }
        else {
          tmp += String.fromCharCode(str.charCodeAt(i));
        }
      }
      if (utils.isLogical(str)) {
        tmp = str ? "TRUE" : "FALSE";
      }
      return tmp;
    });
    parser.setFunction('DOLLAR', function () {
      let [num, decimals] = arguments[0];
      num = utils.parseNumber(num)
      if (!utils.isNumber(num)) {
        return error.name;
      }
      if (!decimals) {
        return "$" + utils.formatNum(num.toFixed(2));
      }
      if (parseInt(decimals) < 0) {
        num = JSON.stringify(Number(num)).split(".")[0]
        let rice = (parseFloat(parseInt(num) / Math.pow(10, Math.abs(decimals))).toFixed())
        num = rice * Math.pow(10, Math.abs(decimals))
        return "$" + utils.formatNum(num);
      }
      return "$" + utils.formatNum(num.toFixed(decimals));
    });
    parser.setFunction('FINDB', function () {
      let [find_text, within_text, start_num] = arguments[0];
      if (!find_text && !within_text) {
        return error.error;
      }
      if (!start_num) {
        let text1 = within_text.substr(0, within_text.indexOf(find_text));
        return utils.numBytes(text1) + 1;
      }
      if (start_num < 0 || start_num > within_text.length) {
        return error.value;
      }
      let text = within_text.substr(start_num, within_text.indexOf(find_text));
      return utils.numBytes(text) + 1;
    });
    parser.setFunction('LEFTB', function () {
      let [text, num_bytes] = arguments[0];
      if (!num_bytes) {
        return utils.reBytesStr(text, 1);
      }
      if (num_bytes < 0) {
        return error.value;
      }
      if (num_bytes > utils.numBytes(text)) {
        return text;
      }
      return utils.reBytesStr(text, num_bytes);
    });
    parser.setFunction('RIGHTB', function () {
      let [text, num_bytes] = arguments[0];
      if (!num_bytes) {
        return text.slice(-1);
      }
      if (num_bytes < 0) {
        return error.value;
      }
      if (num_bytes > utils.numBytes(text)) {
        return text;
      }
      return text.substring(utils.numBytes(text) - num_bytes);
    });
    parser.setFunction('LENB', function () {
      let [text] = arguments[0];
      return utils.numBytes(text);
    });
    parser.setFunction('PHONETIC', function () {
      let reference = arguments[0];
      reference += '';
      reference = reference.split(',');
      let text = ""
      for (var i = 0; i < reference.length; i++) {
        if (!Number(reference[i]) && reference[i] !== "true" && reference[i] !== "false") {
          text = text.concat(reference[i]);
        }
      }
      return text;
    });
    parser.setFunction('FIXED', function () {
      let [number, decimals, no_commas] = arguments[0];
      if (!number) {
        return error.error;
      }
      let num;
      if (parseInt(decimals) >= 0 && !no_commas) {
        number = parseFloat(Number(number)).toFixed(decimals)
        return utils.formatNum(number);
      }
      if (parseInt(decimals) < 0 && !no_commas) {
        num = JSON.stringify(Number(number)).split(".")[0]
        let rice = (parseFloat(parseInt(num) / Math.pow(10, Math.abs(decimals))).toFixed())
        num = rice * Math.pow(10, Math.abs(decimals))
        return utils.formatNum(num);
      }
      if (parseInt(decimals) >= 0 && no_commas) {
        number = parseFloat(Number(number)).toFixed(decimals)
        return (number);
      }
      if (parseInt(decimals) < 0 && no_commas) {
        num = JSON.stringify(Number(number)).split(".")[0]
        let rice = (parseFloat(parseInt(num) / Math.pow(10, Math.abs(decimals))).toFixed())
        num = rice * Math.pow(10, Math.abs(decimals))
        return (num)
      }
      number = parseFloat(Number(number)).toFixed(2);
      return utils.formatNum(number);
    });
    parser.setFunction('VALUE', function () {
      let [text] = arguments[0];
      if(text.indexOf(":") >= 1){
        let s,t;
        let hour = text.split(':')[0];
        let min = text.split(':')[1];
        let sec = text.split(':')[2]||0;
        s = Number(hour*3600) + Number(min*60) + Number(sec*60);
        t = 24*3600
        return (s/t);
      }
      else if(text.indexOf("/") >= 1 || text.indexOf("-") >= 1){
        return (utils.dateParseSeq(text));
      }
      else{
        return (Number(text.match(/\d+(.\d+)?/g)));
      }
    })
    parser.setFunction('MIDB', function () {
      let [text, start_num, num_bytes] = arguments[0];
      start_num = utils.parseNumber(start_num);
      num_bytes = utils.parseNumber(num_bytes);
      if (utils.anyIsError(start_num, num_bytes) || typeof text !== 'string') {
        return num_bytes;
      }
      if (start_num < 1|| num_bytes < 0) {
        return error.value
      }
      if (utils.numBytes(text) < start_num) {
        return "";
      }
      return utils.sliceByByte(text,start_num,(start_num+num_bytes-1));
    })
    parser.setFunction('REPLACEB', function () {
      let [text, position, length, new_text] = arguments[0];
      position = utils.parseNumber(position);
      length = utils.parseNumber(length);
      if (utils.anyIsError(position, length) ||
        typeof text !== 'string' ||
        typeof new_text !== 'string') {
        return error.value;
      }
      // return text.substr(0, position - 1) + new_text + text.substr(position - 1 + length);
      return utils.sliceByByte(text,0, position - 1) + new_text + utils.sliceByByte(text,position - 1 + length,utils.numBytes(text));
    })
    // 已有的函数计算错误重写
    parser.setFunction('AVERAGEA', function () {
      let sum = utils.reArr(arguments[0]).reduce((a, b) => Number(a) + Number(b))
      let result = sum / parseInt(utils.reArr(arguments[0]).length);
      if (isNaN(sum)) {
        result = error.value
      }
      return result;
    });
    parser.setFunction('VARPA', function () {
      let sum = utils.reArr(arguments[0]).reduce((a, b) => Number(a) + Number(b))
      let result = utils.variance(utils.reArr(arguments[0]));
      if (isNaN(sum)) {
        result = error.value
      }
      return result;
    });
    parser.setFunction('STDEVA', function () {
      let sum = utils.reArr(arguments[0]).reduce((a, b) => Number(a) + Number(b))
      let result = utils.deviation(utils.reArr(arguments[0]));
      if (isNaN(sum)) {
        result = error.value
      }
      return result;
    });
    parser.setFunction('MAXA', function () {
      let range = utils.arrayValuesToNumbers(utils.flatten(arguments));
      return (range.length === 0) ? 0 : Math.max.apply(Math, range);
    });
    parser.setFunction('VAR.S', function () {
      let range = utils.numbers(utils.flatten(arguments));
      let n = range.length;
      let sigma = 0;
      let mean = utils.callParserFunc('AVERAGE', range);
      for (let i = 0; i < n; i++) {
        sigma += Math.pow(range[i] - mean, 2);
      }
      return sigma / (n - 1);
    });
    parser.setFunction('STDEV.S', function () {
      let range = utils.numbers(utils.flatten(arguments));
      let n = range.length;
      let sigma = 0;
      let mean = utils.callParserFunc('AVERAGE', range);
      for (let i = 0; i < n; i++) {
        sigma += Math.pow(range[i] - mean, 2);
      }
      return Math.sqrt(sigma / (n - 1));
    });
    parser.setFunction('STDEVPA', function () {
      let sum = utils.reArr(arguments[0]).reduce((a, b) => Number(a) + Number(b))
      let result = Math.sqrt(utils.variance(utils.reArr(arguments[0])));
      if (isNaN(sum)) {
        result = error.value;
      }
      return result;
    })
    parser.setFunction('VAR.P', function () {
      var range = utils.numbers(utils.flatten(arguments));
      var n = range.length;
      var sigma = 0;
      var mean = utils.callParserFunc('AVERAGE', range);
      var result;
      for (var i = 0; i < n; i++) {
        sigma += Math.pow(range[i] - mean, 2);
      }
      result = sigma / n;
      if (isNaN(result)) {
        result = error.num;
      }
      return result;
    })
    parser.setFunction('VARP', function () {
      var range = utils.numbers(utils.flatten(arguments));
      var n = range.length;
      var sigma = 0;
      var mean = utils.callParserFunc('AVERAGE', range);
      var result;
      for (var i = 0; i < n; i++) {
        sigma += Math.pow(range[i] - mean, 2);
      }
      result = sigma / n;
      if (isNaN(result)) {
        result = error.num;
      }
      return result;
    })
    parser.setFunction('STDEV.P', function () {
      var range = utils.numbers(utils.flatten(arguments));
      var n = range.length;
      var sigma = 0;
      var mean = utils.callParserFunc('AVERAGE', range);
      var result;
      for (var i = 0; i < n; i++) {
        sigma += Math.pow(range[i] - mean, 2);
      }
      result = Math.sqrt(sigma / n);
      if (isNaN(result)) {
        result = error.num;
      }
      return result;
    })
    parser.setFunction('TODAY', function () {
      let date = new Date();
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      month = month < 10 ? ('0' + month) : month;
      let day = date.getDate();
      day = day < 10 ? ('0' + day) : day;
      return `${year}/${month}/${day}`;
    })
    parser.setFunction('LOGNORMDIST', function () {
      let [x, mean, sd] = arguments[0];
      x = utils.parseNumber(x);
      mean = utils.parseNumber(mean);
      sd = utils.parseNumber(sd);
      if (utils.anyIsError(x, mean, sd)) {
        return error.value;
      }
      if (x < 0) {
        return 0;
      }
      return 0.5 +
        (0.5 * utils.jStat_erf((Math.log(x) - mean) / Math.sqrt(2 * sd * sd)));
    })
    parser.setFunction('FDIST', function () {
      let [x, d1, d2] = arguments[0];
      x = utils.parseNumber(x);
      d1 = utils.parseNumber(d1);
      d2 = utils.parseNumber(d2);
      if (utils.anyIsError(x, d1, d2)) {
        return error.value;
      }
      if (x < 0)
        return 0;
      return utils.jStat_ibeta((d1 * x) / (d1 * x + d2), d1 / 2, d2 / 2);
    })
    parser.setFunction('F.DIST', function () {
      let [x, d1, d2, cumulative] = arguments[0];
      cumulative=cumulative.toLocaleUpperCase();
      return utils.callParserFunc('F.DIST', x, d1, d2, cumulative);
    })
    parser.setFunction('CUMPRINC', function () {
      let [rate, periods, value, start, end, type] = arguments[0];
      return utils.callParserFunc('CUMPRINC', rate, periods, value, start, end, type);
    })
    parser.setFunction('GROWTH', function () {
      let [known_y, known_x, new_x, use_const] = arguments[0];
      if (Array.isArray(arguments[0][0][0])) {
        known_y = utils.flatten(arguments[0][0])
        known_x = utils.flatten(arguments[0][1])
        new_x = utils.flatten(arguments[0][2])
      }
      known_y = utils.parseNumberArray(known_y);
      if (known_y instanceof Error) {
        return known_y;
      }
      var i;
      if (known_x === undefined) {
        known_x = [];
        for (i = 1; i <= known_y.length; i++) {
          known_x.push(i);
        }
      }
      if (new_x === undefined) {
        new_x = [];
        for (i = 1; i <= known_y.length; i++) {
          new_x.push(i);
        }
      }
      known_x = utils.parseNumberArray(known_x);
      new_x = utils.parseNumberArray(new_x);
      if (utils.anyIsError(known_x, new_x)) {
        return error.value;
      }
      if (use_const === undefined) {
        use_const = true;
      }
      var n = known_y.length;
      var avg_x = 0;
      var avg_y = 0;
      var avg_xy = 0;
      var avg_xx = 0;
      for (i = 0; i < n; i++) {
        var x = known_x[i];
        var y = Math.log(known_y[i]);
        avg_x += x;
        avg_y += y;
        avg_xy += x * y;
        avg_xx += x * x;
      }
      avg_x /= n;
      avg_y /= n;
      avg_xy /= n;
      avg_xx /= n;
      var beta;
      var alpha;
      if (use_const) {
        beta = (avg_xy - avg_x * avg_y) / (avg_xx - avg_x * avg_x);
        alpha = avg_y - beta * avg_x;
      } else {
        beta = avg_xy / avg_xx;
        alpha = 0;
      }
      var new_y = [];
      for (i = 0; i < new_x.length; i++) {
        new_y.push(Math.exp(alpha + beta * new_x[i]));
      }
      return new_y;
    })
    parser.setFunction('INTERCEPT', function () {
      let [known_y, known_x] = arguments[0];
      if (Array.isArray(arguments[0][0][0])) {
        known_y = utils.flatten(arguments[0][0])
        known_x = utils.flatten(arguments[0][1])
      }
      known_y = utils.parseNumberArray(known_y);
      known_x = utils.parseNumberArray(known_x);
      if (utils.anyIsError(known_y, known_x)) {
        return error.value;
      }
      if (known_y.length !== known_x.length) {
        return error.na;
      }
      let x = 0;
      let data_y = utils.parseNumberArray(utils.flatten(known_y));
      let data_x = utils.parseNumberArray(utils.flatten(known_x));
      if (utils.anyIsError(x, data_y, data_x)) {
        return error.value;
      }
      var xmean = utils.jStat_mean(data_x);
      var ymean = utils.jStat_mean(data_y);
      var n = data_x.length;
      var num = 0;
      var den = 0;
      for (var i = 0; i < n; i++) {
        num += (data_x[i] - xmean) * (data_y[i] - ymean);
        den += Math.pow(data_x[i] - xmean, 2);
      }
      var b = num / den;
      var a = ymean - b * xmean;
      return a + b * x;
    })
    parser.setFunction('ERFC', function () {
      let [x] = arguments[0];
      if (isNaN(x)) {
        return error.value;
      }
      return 1 - utils.jStat_erf(Number(x));
    })
    parser.setFunction('PERCENTRANK.INC', function () {
      return utils.callParserFunc1('PERCENTRANKINC', arguments[0])
    })
    parser.setFunction('PERCENTRANK.EXC', function () {
      return utils.callParserFunc1('PERCENTRANKEXC', arguments[0])
    })
    parser.setFunction('PERCENTILE.INC', function () {
      return utils.callParserFunc1('PERCENTILEINC', arguments[0])
    })
    parser.setFunction('PERCENTILE.EXC', function () {
      return utils.callParserFunc1('PERCENTILEEXC', arguments[0])
    })
    parser.setFunction('CEILING.PRECISE', function () {
      return utils.callParserFunc1('CEILING', arguments[0])
    })
    parser.setFunction('CEILING.MATH', function () {
      return utils.callParserFunc1('CEILING', arguments[0])
    })
    parser.setFunction('BINOM.DIST', function () {
      return utils.callParserFunc1('BINOMDIST', utils.reArr(arguments[0]))
    })
    parser.setFunction('STDEVP', function () {
      var range = utils.numbers(utils.flatten(arguments));
      var n = range.length;
      var sigma = 0;
      var mean = utils.callParserFunc('AVERAGE', range);
      var result;
      for (var k = 0; k < n; k++) {
        sigma += Math.pow(range[k] - mean, 2);
      }
      result = Math.sqrt(sigma / n);
      if (isNaN(result)) {
        result = error.num;
      }
      return result;
    })
    parser.setFunction('AVERAGEIFS', function () {
      let args;
      if (arguments[0][0][0].length>1) {
        let data = arguments[0];
        let dataOne = data.shift();
        for (var k = 0; k < data.length; k++) {
          if (Array.isArray(data[k])) {
            data[k] = utils.arrayChunk(data[k][0], 1)
          }
        }
        data.unshift(dataOne)
        args = utils.argsToArray(data);
      } else {
        args = utils.argsToArray(arguments[0]);
      }
      var criteriaLength = (args.length - 1) / 2;
      var range = utils.flatten(args[0]);
      var count = 0;
      var result = 0;
      for (var i = 0; i < range.length; i++) {
        var isMeetCondition = false;
        for (var j = 0; j < criteriaLength; j++) {
          var value = args[2 * j + 1][i];
          var criteria = args[2 * j + 2];
          var isWildcard = criteria === void 0 || criteria === '*';
          var computedResult = false;
          if (isWildcard) {
            computedResult = true;
          } else {
            var tokenizedCriteria = utils.analyzeTokens(utils.tokenizeExpression(criteria + ''));
            var tokens = [utils.createToken(value, 'literal')].concat(tokenizedCriteria);
            computedResult = utils.computeExpression(tokens)
          }

          if (!computedResult) {
            isMeetCondition = false;
            break;
          }

          isMeetCondition = true;
        }

        if (isMeetCondition) {
          result += Number(range[i]);
          count++;
        }
      }
      var average = result / count;
      if (isNaN(average)) {
        return 0;
      } else {
        return average;
      }
    })
    parser.setFunction('TDIST', function () {
      let [x,df,cumulative] = arguments[0]

      if(utils.isNum(x) && utils.isNum(df) && utils.isNum(cumulative)){
        if(x >= 0 && df >= 1 && cumulative === 1){
          return utils.callParserFunc("T.DIST.RT", x,df)

        }else if(x >= 0 && df >= 1 && cumulative === 2){
          return utils.callParserFunc("T.DIST.2T", x,df)

        }else {
          return error.num;
        }
      }else{
        return error.value;
      }
    })
    parser.setFunction('TINV', function () {
      var probability = arguments[0][0];
      var df = arguments[0][1];

      if(utils.isNum(probability) && utils.isNum(df)){
        if(probability>0 && probability <=1 && df>=1){
          return utils.callParserFunc("T.INV.2T", probability,df)

        }else{
          return error.num;
        }
      }else{
        return error.value;
      }
    })
    return parser
  }
}
let utils = {
  recursion(array,determinant){
    if (array.length === 3) {
      //一进来就是3阶行列式的情况
      determinant = utils.getPlusValue(array) + utils.getReduceValue(array);
      return determinant;
    }
    for (let i=0;i<array[0].length;i++) {
      let targetArray = [];
      targetArray = utils.getCofactor(array,0,i);
      if (targetArray.length === 3) {
        determinant+=parseFloat(array[0][i]) * Math.pow(-1,i) * (utils.getPlusValue(targetArray) + utils.getReduceValue(targetArray));
        continue;
      }else {
        determinant+=array[0][i] * Math.pow(-1,i) * utils.recursion(utils.getCofactor(array,0,i),0);
      }
    }
    return determinant;
  },
  //返回二阶行列式的逆矩阵
  getSecondVal(array) {
    let determinant;
    let returnArray = new Array(array.length);
    for (let i=0;i<array.length;i++) {
      returnArray[i] = new Array(array.length)
    }
    determinant = array[0][0]*array[1][1] - array[0][1]*array[1][0];
    if (determinant === 0) {
      return error.num;      
    }
    returnArray[0][0] = parseFloat(array[1][1])/determinant;
    returnArray[0][1] = parseFloat(array[0][1] * (-1))/determinant;
    returnArray[1][0] = parseFloat(array[1][0] * (-1))/determinant;
    returnArray[1][1] = parseFloat(array[0][0])/determinant;
    return returnArray;
  },
  //求每个数的代数余子式
  getAllCofactor(array) {
    let arr = [];
    let pVal = 0;
    let rvAL = 0;
    //伴随矩阵数组
    let dAarray = new Array(array.length);
    for (let d=0;d<array.length;d++) {
      dAarray[d] = new Array(array.length);
    }
    for (let i=0;i<array.length;i++) {
      for (let j=0;j<array[0].length;j++) {
        arr = utils.getCofactor(array,i,j);
        if (arr.length === 2) {
          let v1=0;
          let v2=0;
          let v3=0;
          let v4=0;
          v1 = parseFloat(arr[0][0]);
          v2 = parseFloat(arr[1][1]);
          v3 = parseFloat(arr[0][1]);
          v4 = parseFloat(arr[1][0]);
          pVal = v1 * v2;
          rvAL = v3 * v4 * (-1);
          dAarray[j][i] = Math.pow(-1,i+j)*(pVal+rvAL);
        }else if (array.length>3){
          //求3阶矩阵以上的行列式的值
          //recursion()方法需要新增一个3阶矩阵求行列式的方法
          let res = utils.recursion(arr,0);
          dAarray[j][i] = Math.pow(-1,i+j)*(res);
        }
      }
    }
    return dAarray;
  },
  //划掉i行j列后的数组矩阵
  getCofactor(array,r,c) {
    let k=0,v=0;
    // let returnArray = new Array[array.length-1][array.length-1];
    let returnArray = new Array(array.length-1);
    for (let d=0;d<array.length-1;d++) {
      returnArray[d] = new Array(array.length-1);
    }
    for (let i=0;i<array.length;i++) {
      v=0;
      for (let j=0;j<array[0].length;j++){
        if (i !== r && j !== c) {
          //说明该行不在限制范围内
          returnArray[k][v] = array[i][j];
          // if (returnArray[k] === array.length-1) {
          if (v === array.length-2) {
            ++k;
            break;
          }
          ++v;
        }
      }
      if (k>array.length) {
        break;
      }
    }
    return returnArray;
  },
  //获得行列式中需要做减法的数组
  getReduceValue(array) {
    // let rArray = [];
    let rValue = 0;
    for (let a=array.length-1;a>=0;a--) {
      let i=0;
      let j=a;
      // --a;
      let p = parseFloat(array[i][a]);
      ++i;
      j = ((--j) >= 0 ? j :array.length-1);
      for (let r=1;r<array.length;r++) {
        for (let c=array.length-1;c>=0;c--) {
          if (r===i && c===j) {
            p*= parseFloat(array[r][c]);
            ++i;
            j = ((--j) >= 0 ? j :array.length-1);
            break;
          }
        }
        if (i>=array.length) {
          // rArray.push(p * (-1));
          rValue += p * (-1);
          break;
        }
      }
    }
    return rValue;
  },
  getPlusValue(array) {
    // let plusArray = [];
    let plusValue = 0;
    for (let a=0;a<array[0].length;a++) {
      let i=0;
      let j=a;
      // ++a;
      let p = parseFloat(array[i][a]);
      ++i;
      j = ((++j) <= array.length-1 ? j :0);
      for (let r=1;r<array.length;r++) {
        for (let c=0;c<array.length;c++) {
          if (r===i && c===j) {
            p*= parseFloat(array[r][c]);
            ++i;
            j = ((++j) <= array.length-1 ? j :0);  
            break;
          }
        }
        if (i>=array.length) {
          // plusArray.push(p);
          plusValue += p;
          break;
        }
      }
    }
    //行列式加值处理
    return plusValue;
  },
  //数据库函数代码抽取
  getResult(args,type,numValue) {
    let [database, field , criteria] = args;
    let maxNum = numValue;
      //选中的列
      let column = '';
      //校验参数并且获取field
      column = utils.checkParams(database, field , criteria,type) !== '' ? utils.checkParams(database, field , criteria,type) :column;
      let FirstRow = [];
      //所选的限制条件的列标签在database中对应的列号
      let FirstMark = [];
      let satisfied = false;
      let columnNumber;
      //返回的DAVERAGE数组
      let averageArray = [];
      //返回DPRODUCT数组
      let dProductArray = [];
      //返回DETDEV数组
      let dstDEVARRAY = [];
      //返回DSTDEVP数组
      let dstDevPArray = [];
      //判断DGET函数找到值的个数-----如果没找到？？
      let markDGET = 0;
      for (let i = 0;i<database[0].length;i++) {
        FirstRow.push(database[0][i]);
      }
      //field 的列好
      // if (column !== '') {
      columnNumber = utils.getValueIndex(FirstRow,column);
      if(columnNumber === null && type === 'DCOUNT') {
        //空字符串不在所选的列表遣返回内
        return error.value;
      }
        // columnNumber = FirstRow.indexOf(column);
      // }
      for (let c=0;c<criteria[0].length;c++) {
        let number = FirstRow.indexOf(criteria[0][c]);
        FirstMark.push(number);
      }
      //检查限制条件是否包含首列
      let markr = utils.checkValueInArray(FirstMark,0);
      //标志首次获取满足条件的最小值
      let markMin = 0;
      for (let u = 1;u<database.length;u++) {
            //说明有匹配到首列
            for (let t = 1;t<criteria.length;t++) {
              satisfied = false;
              if (markr) {
                //首列包含在限制条件中
                if (database[u][0] === criteria[t][0]) {
                  satisfied = true;
                  for (let v=1;v<FirstMark.length;v++) {
                    satisfied=utils.compare(database[u][FirstMark[v]],criteria[t][v],satisfied);
                    if (satisfied === true) {
                      continue;
                    }else {
                      break;
                    }
                  }
                  if (satisfied === true) {
                    if (type === 'DCOUNT') {
                      let reg = /\d+/;
                      // if (column === '') {
                      //   for (let n= 0;n<database[0].length;n++) {
                      //     if (reg.test(database[u][n])) {
                      //       maxNum++;
                      //     }
                      //   }
                      // }else {
                        if (reg.test(database[u][columnNumber])) {
                          maxNum++;
                        }
                      // }
                    }
                    if (type === 'DCOUNTA') {
                      let reg = /[^\s]/;
                      if (database[u][columnNumber].trim() === '') {
                        database[u][columnNumber] = `“”`;
                      }
                        if (reg.test(database[u][columnNumber])) {
                          maxNum++;
                        }
                    }
                    if (type === 'DAVERAGE') {
                      averageArray.push(database[u][columnNumber]);
                    }
                    if (type === 'DSTDEV') {
                      dstDEVARRAY.push(parseFloat(database[u][columnNumber]));
                    }
                    if (type === 'DVAR') {
                      dstDEVARRAY.push(parseFloat(database[u][columnNumber]));
                    }
                    if (type === 'DSTDEVP') {
                      dstDevPArray.push(parseFloat(database[u][columnNumber]));
                    }
                    if (type === 'DVARP') {
                      dstDevPArray.push(parseFloat(database[u][columnNumber]));
                    }
                    if (type === 'DSUM') {
                      maxNum+= parseFloat(database[u][columnNumber]);
                    }
                    if (type === 'DPRODUCT') {
                      dProductArray.push(database[u][columnNumber]);
                    }
                    if (type === 'DGET') {
                      maxNum = database[u][columnNumber];
                      markDGET++;
                    }
                    if(type === 'min') {
                      if (maxNum >parseFloat(database[u][columnNumber])) {
                        maxNum = parseFloat(database[u][columnNumber]);
                      }
                      if (markMin === 0) {
                        maxNum = parseFloat(database[u][columnNumber]);
                        markMin++;
                      }
                    }
                    if (type === 'max') {
                      if (maxNum <parseFloat(database[u][columnNumber])) {
                        maxNum = parseFloat(database[u][columnNumber]);
                      }
                    }
                    break;
                  }else {
                    continue;
                  }
                }else {
                  continue;
                }
              }else {
                //首列不包含其中
                for (let v=0;v<FirstMark.length;v++) {
                  satisfied=utils.compare(database[u][FirstMark[v]],criteria[t][v],satisfied);
                  if (satisfied === true) {
                    continue;
                  }else {
                    break;
                  }
                }
                if (satisfied === true) {
                  if (type === 'DAVERAGE') {
                    averageArray.push(database[u][columnNumber]);
                  }
                  if (type === 'DPRODUCT') {
                    dProductArray.push(database[u][columnNumber]);
                  }
                  if (type === 'DSUM') {
                    maxNum+= parseFloat(database[u][columnNumber]);
                  }
                  if (type === 'DSTDEV') {
                    dstDEVARRAY.push(parseFloat(database[u][columnNumber]));
                  }
                  if (type === 'DVAR') {
                    dstDEVARRAY.push(parseFloat(database[u][columnNumber]));
                  }
                  if (type === 'DSTDEVP') {
                    dstDevPArray.push(parseFloat(database[u][columnNumber]));
                  }
                  if (type === 'DVARP') {
                    dstDevPArray.push(parseFloat(database[u][columnNumber]));
                  }
                  if (type === 'DCOUNT') {
                    //求满足限制条件的数字单元格个数
                    /**
                     * 分两种情况讨论
                     * 其一：选择某列(暂时按单列的走)，有需求则获取field的数组
                     * 其二:field为空遍历整行
                     */
                    let reg = /\d+/;
                    // if (column === '') {
                    //   //没选lie--遍历整行进行匹配
                    //   for (let n= 0;n<database[0].length;n++) {
                    //     if (reg.test(database[u][n])) {
                    //       maxNum++;
                    //     }
                    //   }
                    // }else {
                      if (reg.test(database[u][columnNumber])) {
                        maxNum++;
                      }
                    // }
                  }
                  if (type === 'DCOUNTA') {
                    let reg = /[^\s]/;
                    if (database[u][columnNumber].trim() === '') {
                      database[u][columnNumber] = `“”`;
                    }
                      if (reg.test(database[u][columnNumber])) {
                        maxNum++;
                      }
                  }
                  if (type === 'DGET') {
                    maxNum = database[u][columnNumber];
                    markDGET++;
                  }
                  if(type === 'min') {
                    if (maxNum >parseFloat(database[u][columnNumber])) {
                      maxNum = parseFloat(database[u][columnNumber]);
                    }
                    if (markMin === 0) {
                      maxNum = parseFloat(database[u][columnNumber]);
                      markMin++;
                    }
                  }
                  if (type === 'max') {
                    if (maxNum <parseFloat(database[u][columnNumber])) {
                      maxNum = parseFloat(database[u][columnNumber]);
                    }
                  }
                  break;
                }else {
                  continue;
                }
              }
            }
          }
        if (type === 'DAVERAGE') {
          return averageArray;
        }
        if (type === 'DPRODUCT') {
          return dProductArray;
        }
        if (type === 'DSTDEV' || type === 'DVAR') {
          return dstDEVARRAY;
        }
        if (type === 'DSTDEVP' || type === 'DVARP') {
          return dstDevPArray;
        }
        if (type === 'DGET' && markDGET >1) {
          return null;
        }
        return maxNum;
  },
  arrayValuesToNumbers(arr) {
    var n = arr.length;
    var el;
    while (n--) {
      el = arr[n];
      if (typeof el === 'number') {
        continue;
      }
      if (el === true) {
        arr[n] = 1;
        continue;
      }
      if (el === false) {
        arr[n] = 0;
        continue;
      }
      if (typeof el === 'string') {
        var number = this.parseNumber(el);
        if (number instanceof Error) {
          arr[n] = 0;
        } else {
          arr[n] = number;
        }
      }
    }
    return arr;
  },
  /**检查数组中是否存在某元素 */
  checkValueInArray(array,val) {
    let flag = false;
    for (let r = 0;r<array.length;r++) {
      if (array[r] === val) {
        flag = true;
      }
    }
    return flag;
  },
  getValueIndex(array,val) {
    let ind;
    let flag = false;
    for (let r = 0;r<array.length;r++) {
      if (array[r] === val) {
        flag = true;
        ind = r;
      }
    }
    if (flag === true) {
      return ind;
    }
    return null;
  },
  getCriteria(criteria) {
    for (let w = 0;w<criteria.length;w++) {
      for (let o = 0;o<criteria[0].length;o++) {
        if (criteria[w][o] === '') {
          criteria[w][o] = null;
        }
      }
    }
  },
  checkParams(database, field , criteria,type) {
    //首行所包含的列标签
    let firstRow = [];
    let returnField = '';
    let regNum = /\d+/;
    for (let i = 0;i<database[0].length;i++) {
      firstRow.push(database[0][i]);
    }
    // if (type === 'DCOUNT' && field.length === 0) {
    //   returnField = '';
    // }else {
      if (regNum.test(field)) {
        let order = parseInt(field) - 1;
        if (!firstRow[order]) {
          //说明所选的在列表第一行无标志项--提示？
          return;
        }
        returnField = firstRow[order];
      }else if(!utils.checkValueInArray(firstRow,field)){
      // }else if(firstRow.indexOf(field) === -1){
          return;
      }else {
        //既不是数字，也包含在首列内--即返回本身
        returnField = field;
      }
    // }
    if (typeof(criteria) === 'string') {
      //至少有一个列下方用于表示条件的单元格 --提示？
      return;
    }else {
      let markc = false;
      for (let c = 0;c<criteria[0].length;c++) {
        if (firstRow.indexOf(criteria[0][c] !== -1)) {
          console.log(criteria[0][c]);
          markc = true;
        }
      }
      if (markc === false) {
        //选中的列标志未包含在列表中 --提示？
        return;
      }
    }
    return returnField;
  },
  compare(val,compareValue,flag) {
    let arr = utils.judgeMark(compareValue);
    let reg = /\d+/;
    // let flag = false;
    if (val.trim() === '') {
      val = `“”`;
    }
    if(reg.test(val)){
      val = parseInt(val);
    }
    if (arr[0] === 1) {
      //<
      if(val<arr[1]) {
        flag = true;
      }else {
        flag = false;
      }
    }
    if (arr[0] === 2) {
      //>
      if (val>arr[1]) {
        flag = true;
      }else {
        flag = false;
      }
    }
    if (arr[0] === 3) {
      //<=
      if (val<=arr[1]) {
        flag = true;
      }else {
        flag = false;
      }
    }
    if (arr[0] === 4) {
      //>=
      if (val >= arr[1]) {
        flag = true;
      }else {
        flag = false;
      }
    }
    if (arr[0] === 5) {
      //>=
      if (val === `“”`) {
        flag = true;
      }else {
        flag = false;
      }
    }
    if (arr[0].toString() === '6') {
      if (val === arr[1]) {
        flag = true;
      }else {
        flag = false;
      }
    }
    return flag;
  },
  judgeMark(value) {
    let reg1 = /<+/;
    let reg2 = />+/;
    let reg3 = /(<=)+/;
    let reg4 = /(>=)+/;
    let mark = 0;
    let returnValue = [0,0];
    let num;
    if (value.trim() === '') {
      value = `“”`;
      mark = 5;
    }
    if(reg1.test(value)) {
      mark = 1;
    }
    if(reg2.test(value)) {
      mark = 2;
    }
    if(reg3.test(value)) {
      mark = 3;
    }
    if(reg4.test(value)) {
      mark = 4;
    }
    switch(mark){
      case 1:
        returnValue[0] = 1;
        num = value.substring(1);
        returnValue[1] = parseInt(num);
        break;
      case 2:
        returnValue[0] = 2;
        num = value.substring(1);
        returnValue[1] = parseInt(num);
        break;
      case 3:
        returnValue[0] = 3;
        num = value.substring(1);
        returnValue[1] = parseInt(num);
        break;
      case 4:
        returnValue[0] = 4;
        num = value.substring(1);
        returnValue[1] = parseInt(num);
      break;
      case 5:
        returnValue[0] = 5;
        break;
      default:
        //匹配非首列的名词
        returnValue[0] = '6';
        returnValue[1] = value;
        break;
    }
    return returnValue;
  },
  numbers() {
    let possibleNumbers = utils.flatten.apply(null, arguments), plusNum = []
    possibleNumbers.filter(function (el, index) {
      if (!!el && !isNaN(el) || el === 0) {
        if (typeof el === 'boolean') {
          let num = 0
          if (el.toString().toLocaleUpperCase() === 'TRUE') {
            num = 1
          }
          plusNum.push(num)
        } else {
          plusNum.push(parseFloat(el))
        }
      }
      return typeof el === 'number'
    })
    return plusNum
  },

  flatten () {
    let result = utils.argsToArray.apply(null, arguments)

    while (!utils.isFlat(result)) {
      result = utils.flattenShallow(result)
    }

    return result
  },

  trunc (number, digits) {
    digits = (digits === undefined) ? 0 : digits;
    number = utils.parseNumber(number);
    digits = utils.parseNumber(digits);
    if (utils.anyIsError(number, digits)) {
      return error.value;
    }
    var sign = (number > 0) ? 1 : -1;
    return sign * (Math.floor(Math.abs(number) * Math.pow(10, digits))) / Math.pow(10, digits);
  },

  cleanFloat (number) {
    const power = 1e14;
    return Math.round(number * power) / power;
  },

  argsToArray (args) {
    let result = []

    utils.arrayEach(args, function (value) {
      result.push(value)
    })

    return result
  },

  isFlat (array) {
    if (!array) {
      return false
    }

    for (let i = 0; i < array.length; ++i) {
      if (Array.isArray(array[i])) {
        return false
      }
    }

    return true
  },

  flattenShallow (array) {
    if (!array || !array.reduce) {
      return array
    }
    return array.reduce(function (a, b) {
      let aIsArray = Array.isArray(a)
      let bIsArray = Array.isArray(b)

      if (aIsArray && bIsArray) {
        return a.concat(b)
      }
      if (aIsArray) {
        a.push(b)

        return a
      }
      if (bIsArray) {
        return [a].concat(b)
      }

      return [a, b]
    })
  },
  arrayEach (array, iteratee) {
    let index = -1; let length = array.length

    while (++index < length) {
      if (iteratee(array[index], index, array) === false) {
        break
      }
    }

    return array
  },
  parseNumber (string) {
    if (string === undefined || string === null || string === '') {
      return 0
    } else if (typeof string === 'boolean' || (typeof string === 'string' && ['TRUE', 'FALSE'].indexOf(string.toLocaleUpperCase()) > -1)) {
      return string.toString().toLocaleUpperCase() === 'TRUE' ? 1 : 0
    }
    if (!isNaN(string)) {
      return parseFloat(string)
    }
    return error.value
  },
  /**
   * 使用范围：CHAR
   * true:转化为1；
   * false,null :error
   */
  parseNumber1 (string) {
    if ((typeof string === 'string' && string.toLocaleUpperCase() === 'TRUE') || (typeof string === 'boolean' && string)) {
      return 1
    }
    if (string === null || string === false) {
      return error.value
    }
    if (!isNaN(string)) {
      return parseFloat(string)
    }
    return error.value
  },
  /**
   * 非数值转化为0
   */
  parseNumber2 (string) {
    if (string === null || string === '' || string === false || string === true) {
      return 0
    }
    if (!isNaN(string)) {
      return parseFloat(string)
    } else {
      return 0
    }
  },
  /**
   * 非数值 返回#value!
   */
  parseNumber3 (string) {
    if (string === undefined || string === null || string === '' || string === false || string === true) {
      return error.value
    }
    if (!isNaN(string)) {
      return parseFloat(string)
    }
    return error.value
  },
  anyIsError () {
    let n = arguments.length
    while (n--) {
      if (arguments[n] instanceof Error) {
        return true
      }
    }
    return false
  },
  ROUND (number, digits) {
    number = utils.parseNumber(number)
    digits = utils.parseNumber(digits)
    if (utils.anyIsError(number, digits)) {
      return error.value
    }
    return Math.round(number * Math.pow(10, digits)) / Math.pow(10, digits)
  },
  parseNumberArray (arr) {
    let len
    if (!arr || (len = arr.length) === 0) {
      return error.value
    }
    let parsed
    while (len--) {
      parsed = utils.parseNumber2(arr[len])
      if (parsed === error.value) {
        return parsed
      }
      arr[len] = parsed
    }
    return arr
  },
  parseDate (date) {
    let d1900 = new Date(Date.UTC(1900, 0, 1))
    if (date === null || date === undefined || date === '' || date == 0) {
      return 0
    } else if (typeof date === 'boolean' || (typeof date === 'string' && ['TRUE', 'FALSE'].indexOf(date.toLocaleUpperCase()) > -1)) {
      let uc = date.toString().toLocaleUpperCase()
      if (uc === 'TRUE') {
        date = 1
      } else {
        return 0
      }
    }
    if (!isNaN(date)) {
      if (date instanceof Date) {
        return new Date(date)
      }
      let d = parseInt(date, 10)
      if (d < 0) {
        return error.num
      }
      if (d < 60) {
        return new Date(d1900.getTime() + (d - 1) * 86400000)
      }
      if (d == 60) {
        return new Date(1900, 2, 29)
      }
      return new Date(d1900.getTime() + (d - 2) * 86400000)
    }
    if (typeof date === 'string') {
      if (date.indexOf('/') > -1 || date.indexOf('-') > -1) {
        let arr = date.indexOf('/') > -1 ? date.split('/') : date.split('-')
        if (arr.length === 2 && arr[0] > 12 && arr[1] <= 12) {
          date = `${arr[1]}/${arr[0]}`
        } /* else if (arr.length === 3 && date.indexOf('/') > -1 && arr[0] <= 12) {//月/日/年
          date = `${arr[2]}/${arr[0]}/${arr[1]}`
        } */
      }
      let oldDate = date
      date = new Date(date)
      if (date != 'Invalid Date') {
        let y = date.getFullYear()
        let m = date.getMonth() + 1
        let d = date.getDate()
        let dateArr = [y, m, d]
        let ymd = oldDate.split(' ')[0]
        let flag = false; let str = ''
        if (ymd.indexOf('/') > -1 || ymd.indexOf('-') > -1) {
          let arr = ymd.indexOf('/') > -1 ? ymd.split('/') : ymd.split('-')
          if (arr.length === 3) {
            arr.map((item, index) => {
              str += item
              flag = dateArr[index] != item
            })
          } else if (arr.length === 2) {
            flag = (arr[1] != d || arr[0] != m)
            if (!flag) {
              date.setYear((new Date()).getFullYear())
            }
          }
          if (flag && str !== '1900229') {
            return -1
          }
        }
        if (!isNaN(date)) {
          return date
        }
      }
    }
    return error.value
  },
  HOUR (hour) {
    if (hour === null || hour === undefined || hour === '' || hour == 0) {
      return 0
    }

    if (!isNaN(hour)) {
      if (parseInt(hour) != hour) { // 小数
        return parseInt(hour % 1 * 24)
      } else { // 整数
        return 0
      }
    }
    // 包含 冒号(一个或者两个) 和am/pm(前面必须有空格)不能是全角空格/\u3000/
    let reg = /(.*?)([0-9]{1,2})[\:]([0-9]{1,2})(\:([0-9]{1,2}))?\s+([a|p]m)$/ig
    if (reg.test(hour)) {
      let d = RegExp.$1; let h = RegExp.$2; let m = RegExp.$3; let s = RegExp.$5; let unit = RegExp.$6.toUpperCase(); let p = 0
      if (d.trim() !== '') { // 包含 年月日
        d = new Date(d)
        if (isNaN(d) || /\u3000/.test(hour)) {
          return error.value
        }
      }
      if (h > 12 || m > 60 || (s > 60 && s !== '')) {
        return error.value
      }
      if (unit === 'PM') {
        p = 12
      }
      if (h == 12) {
        return p
      }
      return parseInt(h) + p
    }
    // 包含 冒号(一个或者两个) 不包含am/pm(前面必须有空格)
    reg = /(.*?)([0-9]+)[\:]([0-9]+)(\:([0-9]+))?\s?$/ig
    if (reg.test(hour)) {
      let d = RegExp.$1; let h = RegExp.$2; let m = RegExp.$3; let s = RegExp.$5
      let sign = (h >= 24 ? 1 : 0) + (m >= 60 ? 1 : 0) + (s >= 60 ? 1 : 0)

      if (d.trim() !== '') { // 包含 年月日
        d = new Date(d)
        if (isNaN(d) || /\u3000/.test(hour)) {
          return error.value
        }
      }

      if (sign > 1) {
        return error.value
      }
      if (s >= 60) {
        m = parseInt(m) + parseInt(s / 60)
      }
      if (m >= 60) {
        h = parseInt(h) + parseInt(m / 60)
      }
      return h % 24
    }
    // 日期 年月日
    try {
      hour = new Date(hour)
      if (!isNaN(hour)) {
        return 0
      }
    } catch (e) {
      return error.value
    }
    return error.value
  },
  // 校验传入的日期是否存在
  isValidDate (date) {
    if (['29', '30', '31'].includes(date.substring(date.length - 2)) && `${new Date(date).getDate()}` !== date.substring(date.length - 2)) {
      return false
    }
    return !isNaN(new Date(date).getTime())
  },
  // 判断是否为数值类型
  isNumber (value) {
    return typeof (value) === 'number' && !isNaN(value) && isFinite(value)
  },
  // 判断是否为逻辑类型
  isLogical (value) {
    return value === true || value === false
  },
  // 判断是否为文本类型
  isText (value) {
    return typeof (value) === 'string'
  },
  // 将序列号的日期类型转化为时间
  seqParseDate (date) {
    const d1900 = new Date(Date.UTC(1900, 0, 1))
    if (!isNaN(date)) {
      if (date instanceof Date) {
        return new Date(date)
      }
      var d = parseInt(date, 10)
      if (d < 0) {
        return error.num
      }
      if (d < 60) {
        return new Date(d1900.getTime() + (d - 1) * 86400000)
      }
      if (d == 60) {
        return new Date(1900, 2, 29)
      }
      return new Date(d1900.getTime() + (d - 2) * 86400000)
    }
    if (utils.isText(date)) {
      date = new Date(date)
      if (!isNaN(date)) {
        return date
      }
    }
    return error.value
  },
  // 将时间字符转换为序列号
  dateParseSeq (dateText) {
    const d1900 = new Date(Date.UTC(1900, 0, 1))
    let modifier = 2
    let date
    if (!utils.isText(dateText)) {
      return error.value
    }
    date = Date.parse(dateText)
    if (isNaN(date)) {
      return error.value
    }
    if (date <= -2203891200000) {
      modifier = 1
    }
    return Math.ceil((date - d1900) / 86400000) + modifier
  },
  transpose (matrix) {
    if(!matrix) {
      return error.value;
    }
    return matrix[0].map(function(col, i) {
      return matrix.map(function(row) {
        return row[i];
      });
    });
  },
  toLabel(row, column) {
    var rowLabel =  utils.rowIndexToLabel(row);
    var columnLabel = utils.columnIndexToLabel(column);
    return columnLabel + rowLabel;
  },
  extractLabel(label) {
    var LABEL_EXTRACT_REGEXP = /^([$])?([A-Za-z]+)([$])?([0-9]+)$/;
    if (typeof label !== 'string' || !LABEL_EXTRACT_REGEXP.test(label)) {
      return [];
    }
    var _label$toUpperCase$ma = label.toUpperCase().match(LABEL_EXTRACT_REGEXP),
        columnAbs = _label$toUpperCase$ma[1],
        column = _label$toUpperCase$ma[2],
        rowAbs = _label$toUpperCase$ma[3],
        row = _label$toUpperCase$ma[4];
    return [{
      index: utils.rowLabelToIndex(row),
      label: row,
      isAbsolute: rowAbs === '$'
    }, {
      index: utils.columnLabelToIndex(column),
      label: column,
      isAbsolute: columnAbs === '$'
    }];
  },
  rowLabelToIndex(label) {
    var result = parseInt(label, 10);
    if (isNaN(result)) {
      result = -1;
    } else {
      result = Math.max(result - 1, -1);
    }
    return result;
  },
  rowIndexToLabel(row) {
    var result = '';
    if (row >= 0) {
      result = '' + (row + 1);
    }
    return result;
  },
  columnLabelToIndex(label) {
    var result = 0;
    var COLUMN_LABEL_BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var COLUMN_LABEL_BASE_LENGTH = COLUMN_LABEL_BASE.length;
    if (typeof label === 'string') {
      label = label.toUpperCase();
      for (var i = 0, j = label.length - 1; i < label.length; i += 1, j -= 1) {
        result += Math.pow(COLUMN_LABEL_BASE_LENGTH, j) * (COLUMN_LABEL_BASE.indexOf(label[i]) + 1);
      }
    }
    --result;
    return result;
  },
  columnIndexToLabel (column) {
    var result = '';
    var COLUMN_LABEL_BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var COLUMN_LABEL_BASE_LENGTH = COLUMN_LABEL_BASE.length;
    while (column >= 0) {
      result = String.fromCharCode(column % COLUMN_LABEL_BASE_LENGTH + 97) + result;
      column = Math.floor(column / COLUMN_LABEL_BASE_LENGTH) - 1;
    }
    return result.toUpperCase();
  },
  // 获取当前被引用单元格信息
  getCellInfo () {
    const formulas = store.state.ReportMgt.hot.getPlugin('formulas');
    const curCell = formulas.undoRedoSnapshot.sheet._processingCell;
    const cellData = formulas.dataProvider.getRawDataAtCell(curCell['row'], curCell['column'])
    curCell['cellData'] = cellData;
    return curCell;
  },
  // 回调parser函数 -- 参数为数组该函数不可用
  callParserFunc (name, ...params) {
    const parser = new FormulaParser();
    return parser.parser.parse(`${name}(${params.join(',')})`)
  },
  // 通用回调parser函数
  callParserFunc1 (name, params) {
    const parser = new FormulaParser();
    return parser._callFunction(name,params);
  },
  // 将XML文本生成为XMLDOC对象
  loadXML (xmlString) {
    var xmlDoc = null
    // 判断浏览器的类型
    // 支持IE浏览器
    if (!window.DOMParser && window.ActiveXObject) { // window.DOMParser 判断是否是非ie浏览器
      var xmlDomVersions = ['MSXML.2.DOMDocument.6.0', 'MSXML.2.DOMDocument.3.0', 'Microsoft.XMLDOM']
      for (var i = 0; i < xmlDomVersions.length; i++) {
        try {
          xmlDoc = new ActiveXObject(xmlDomVersions[i])
          xmlDoc.async = false
          xmlDoc.loadXML(xmlString) // loadXML方法载入xml字符串
          break
        } catch (e) {
        }
      }
    }
    // 支持Mozilla浏览器
    else if (window.DOMParser && document.implementation && document.implementation.createDocument) {
      try {
        /* DOMParser 对象解析 XML 文本并返回一个 XML Document 对象。
                 * 要使用 DOMParser，使用不带参数的构造函数来实例化它，然后调用其 parseFromString() 方法
                 * parseFromString(text, contentType) 参数text:要解析的 XML 标记 参数contentType文本的内容类型
                 * 可能是 "text/xml" 、"application/xml" 或 "application/xhtml+xml" 中的一个。注意，不支持 "text/html"。
                 */
        let domParser = new DOMParser()
        xmlDoc = domParser.parseFromString(xmlString, 'text/xml')
      } catch (e) {
        console.info(e)
      }
    } else {
      return null
    }
    return xmlDoc
  },
  // 按照节点截取文本
  reBytesStr(str, len) {
    var num = 0;
    var str1 = str;
    var text = "";
    for (var i = 0, lens = str1.length; i < lens; i++) {
      num += ((str1.charCodeAt(i) > 255) ? 2 : 1);
      if (num > len) {
        break;
      } else {
        text = str1.substring(0, i + 1);
      }
    }
    return text;
  },
  // 计算文本节点长度
  numBytes(text) {
    let iLength = 0;
    for (let i = 0; i < text.length; i++) {
      if (text.charCodeAt(i) > 255) {
        iLength += 2;
      } else {
        iLength += 1;
      }
    }
    return iLength;
  },
  // 方差
  variance(arr) {
    let sum = 0;
    let s = 0;
    for (let i = 0; i < arr.length; i++) {
      sum += parseFloat(arr[i]);
    }
    let ave = parseFloat(sum) / arr.length;
    for (let j = 0; j < arr.length; j++) {
      s += Math.pow((ave - parseFloat(arr[j])), 2);
    }
    return parseFloat(s) / parseInt(arr.length);
  },
  // 标准偏差
  deviation(arr) {
    let sum = 0;
    let s = 0;
    for (let i = 0; i < arr.length; i++) {
      sum += parseFloat(arr[i]);
    }
    let ave = parseFloat(sum) / arr.length;
    for (let j = 0; j < arr.length; j++) {
      s += Math.pow((ave - parseFloat(arr[j])), 2);
    }
    return Math.sqrt(parseFloat(s) / (parseInt(arr.length) - 1));
  },
  // bessel函数报错信息重写
  besselError (params) {
    let errMsg
    params.some((param, index) => {
      if (Number.isNaN(Number(param))) {
        errMsg = error.value
        return true
      } else if (index === 1 && Number(param) < 0) {
        errMsg = error.num
        return true
      }
    })
    return errMsg
  },
  // z测试
  zTest () {
    if (arguments[0].length < 2 || arguments[0].length > 3) {
      return error.error;
    }
    let range = arguments[0][0]
    let x = utils.parseNumber(arguments[0][1])
    let sd = arguments[0].length === 3 ? arguments[0][2] : false;
    const originArray = utils.flatten(range).filter(arg => !Number.isNaN(Number(arg)) && arg !== null && arg !== '')
    range = utils.parseNumberArray(originArray);
    if (originArray.length === 0 || (arguments[0].length === 3 && sd <=0)) {
      return error.num
    } else if (utils.anyIsError(range, x)) {
      return error.value;
    }
    let param1 = []
    param1[0] = range;
    sd = sd || utils.callParserFunc1('STDEV.S',param1);
    var n = range.length;
    let param2 = [];
    let nParam = (utils.callParserFunc1('AVERAGE',param1) - x) / (sd / Math.sqrt(n))
    param2[0] = nParam
    param2[1] = true;
    return 1 - utils.callParserFunc1('NORM.S.DIST',param2);
  },
  // 卡方分布
  chisqTest (observed, expected) {
    if ((!(observed instanceof Array)) || (!(expected instanceof Array))) {
      return error.value
    }

    if (observed.length !== expected.length) {
      return error.value
    }

    if (observed[0] && expected[0] &&
        observed[0].length !== expected[0].length) {
      return error.value
    }
    var row = observed.length
    var tmp, i, j
    // Convert single-dimension array into two-dimension array
    for (i = 0; i < row; i++) {
      if (!(observed[i] instanceof Array)) {
        tmp = observed[i]
        observed[i] = []
        observed[i].push(tmp)
      }
      if (!(expected[i] instanceof Array)) {
        tmp = expected[i]
        expected[i] = []
        expected[i].push(tmp)
      }
    }
    var col = observed[0].length
    var dof = (col === 1) ? row - 1 : (row - 1) * (col - 1)
    var xsqr = 0
    for (i = 0; i < row; i++) {
      for (j = 0; j < col; j++) {
        xsqr += Math.pow((observed[i][j] - expected[i][j]), 2) / expected[i][j]
      }
    }
    return Math.round(utils.chiSq(xsqr, dof) * 1000000) / 1000000
  },
  // 卡方分布内嵌函数
  chiSq (xsqr, dof) {
    var Pi = Math.PI
    var p = Math.exp(-0.5 * xsqr)
    if ((dof % 2) === 1) {
      p = p * Math.sqrt(2 * xsqr / Pi)
    }
    var k = dof
    while (k >= 2) {
      p = p * xsqr / k
      k = k - 2
    }
    var t = p
    var a = dof
    while (t > 0.0000000001 * p) {
      a = a + 2
      t = t * xsqr / a
      p = p + t
    }
    return 1 - p
  },
  // 将数组空字符，false,true,等转为数字
  reArr(num) {
    let numArr = []
    if (!Array.isArray(num[0])) {
      for (let i = 0; i < num.length; i++) {
        numArr.push(utils.parseNumber(num[i]))
      }
    } else {
      num = utils.flatten(num);
      for (let j = 0; j < num.length; j++) {
        numArr.push(utils.parseNumber(num[j]))
      }
    }
    return numArr;
  },
  formatNum(num){
    // 将数字串转换成带逗号的显示方式
    if(!/^([+\-])?(\d+)(\.\d+)?$/.test(num)){
      return num;
    }
    let number;
    let a = RegExp.$1;
    let b = RegExp.$2;
    let c = RegExp.$3;
    number = new RegExp("(\\d)(\\d{3})(,|$)");
    if (number.test(b)) {
      b = b.replace(number,"$1,$2$3");
    }
    return (a +""+ b +""+ c);
  },
  sliceByByte(value,start,end){
    let bytes = 1;
    let result ='';
    for (let i = 0 ,n = value.length; i < n; i++) {
        let c = value.charCodeAt(i);
        if(bytes > end){
            break
        }
        if(bytes >= start ){
            result = result + value[i];
        }
        if (c > 255) {
            bytes += 2;
        } else {
            bytes += 1;
        }
    }
    return result;
  },
  computeExpression(tokens) {
    var values = [];
    var operator;

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];

      switch (token.type) {
        case "operator":
          operator = token.value;
        break;
        case "literal":
          values.push(token.value);
        break;
      }
    }
    return utils.evaluate(values, operator);
  },
  evaluate(values, operator) {
    var result = false;
    switch (operator) {
      case '>':
        result = values[0] > values[1];
        break;
      case '>=':
        result = values[0] >= values[1];
        break;
      case '<':
        result = values[0] < values[1];
        break;
      case '<=':
        result = values[0] <= values[1];
        break;
      case '=':
        result = values[0] == values[1];
        break;
      case '<>':
        result = values[0] != values[1];
        break;
    }
    return result;
  },
  tokenizeExpression(expression) {
    var expressionLength = expression.length;
    var tokens = [];
    var cursorIndex = 0;
    var processedValue = '';
    var processedSymbol = '';

    while (cursorIndex < expressionLength) {
      var char = expression.charAt(cursorIndex);

      switch (char) {
        case '>':
        case '<':
        case '=':
          processedSymbol = processedSymbol + char;

          if (processedValue.length > 0) {
            tokens.push(processedValue);
            processedValue = '';
          }
        break;
        default:
          if (processedSymbol.length > 0) {
            tokens.push(processedSymbol);
            processedSymbol = '';
          }

          processedValue = processedValue + char;
        break;
      }
      cursorIndex++;
    }

    if (processedValue.length > 0) {
      tokens.push(processedValue);
    }
    if (processedSymbol.length > 0) {
      tokens.push(processedSymbol);
    }

    return tokens;
  },
  analyzeTokens(tokens) {
    var literalValue = '';
    var analyzedTokens = [];

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];

      if (i === 0 && ['>', '>=', '<', '<=', '=', '<>'].indexOf(token) >= 0) {
        analyzedTokens.push(utils.createToken(token, 'operator'));
      } else {
        literalValue += token;
      }
    }

    if (literalValue.length > 0) {
      analyzedTokens.push(utils.createToken(utils.castValueToCorrectType(literalValue), 'literal'));
    }

    if (analyzedTokens.length > 0 && analyzedTokens[0].type !== 'operator') {
      analyzedTokens.unshift(utils.createToken('=', 'operator'));
    }

    return analyzedTokens;
  },
  createToken(value, type) {
    if (['operator', 'literal'].indexOf(type) === -1) {
      throw new Error('Unsupported token type: ' + type);
    }

    return {
      value: value,
      type: type,
    };
  },
  castValueToCorrectType(value) {
    if (typeof value !== 'string') {
      return value;
    }

    if (/^\d+(\.\d+)?$/.test(value)) {
      value = value.indexOf('.') === -1 ? parseInt(value, 10) : parseFloat(value);
    }

    return value;
  },
  // 数组分割
  arrayChunk(array, size){
    let data = []
    for (let i = 0; i < array.length; i += size) {
      data.push(array.slice(i, i + size))
    }
    return data
  },
  jStat_mean(arr) {
    var sum = 0;
    var i = arr.length;
    while (--i >= 0)
      sum += arr[i];
    return sum / arr.length;
  },
  jStat_erf(x) {
    var cof = [-1.3026537197817094, 6.4196979235649026e-1, 1.9476473204185836e-2,
               -9.561514786808631e-3, -9.46595344482036e-4, 3.66839497852761e-4,
               4.2523324806907e-5, -2.0278578112534e-5, -1.624290004647e-6,
               1.303655835580e-6, 1.5626441722e-8, -8.5238095915e-8,
               6.529054439e-9, 5.059343495e-9, -9.91364156e-10,
               -2.27365122e-10, 9.6467911e-11, 2.394038e-12,
               -6.886027e-12, 8.94487e-13, 3.13092e-13,
               -1.12708e-13, 3.81e-16, 7.106e-15,
               -1.523e-15, -9.4e-17, 1.21e-16,
               -2.8e-17];
    var j = cof.length - 1;
    var isneg = false;
    var d = 0;
    var dd = 0;
    var t, ty, tmp, res;

    if (x < 0) {
      x = -x;
      isneg = true;
    }

    t = 2 / (2 + x);
    ty = 4 * t - 2;

    for(; j > 0; j--) {
      tmp = d;
      d = ty * d - dd + cof[j];
      dd = tmp;
    }

    res = t * Math.exp(-x * x + 0.5 * (cof[0] + ty * d) - dd);
    return isneg ? res - 1 : 1 - res;
  },
  det(square){
    var length = square.length;
    var flag = true;
    square.some(sq => {
      if(length !== sq.length){
        flag = false;
        return true;
      }else {
        sq.some(val => {
          if(val === "" || val ==null){
            flag = false;
            return true;
    　　  }
          if(!isNaN(val)){
            //数值
      　　}else{
        　　flag = false;
            return true;
      　　}
        })
        if(!flag){
          return true;
        }
      }
    })
    if(!flag){
      throw error.value;
    }
    // 方阵阶数
    let n = square.length;

    let result = 0;
    if (n > 3) {
        // n 阶
        for (let column = 0; column < n; column++) {
            // 去掉第 0 行第 column 列的矩阵
            let matrix = new Array(n - 1).fill(0).map(arr => new Array(n - 1).fill(0));
            for (let i = 0; i < n - 1; i++) {
                for (let j = 0; j < n - 1; j++) {
                    if (j < column) {
                        matrix[i][j] = square[i + 1][j];
                    } else {
                        matrix[i][j] = square[i + 1][j + 1];
                    }
                }
            }
            result += square[0][column] * Math.pow(-1, 0 + column) * utils.det(matrix);
        }
    } else if (n === 3) {
        // 3 阶
        result = square[0][0] * square[1][1] * square[2][2] +
                square[0][1] * square[1][2] * square[2][0] +
                square[0][2] * square[1][0] * square[2][1] -
                square[0][2] * square[1][1] * square[2][0] -
                square[0][1] * square[1][0] * square[2][2] -
                square[0][0] * square[1][2] * square[2][1];
    } else if (n === 2) {
        // 2 阶
        result = square[0][0] * square[1][1] - square[0][1] * square[1][0];
    } else if (n === 1) {
        // 1 阶
        result = square[0][0];
    }
    return result;
  },
  formatFinacialObj(s,m,f,b){
    var result = {};
    var settlement = s;
    var maturity = m;
    var frequency = utils.parseNumber(f);
    var basis = utils.parseNumber(b);

    if(utils.isNum(settlement)){
      settlement = moment("1900/01/01").add(settlement,'d').format("YYYY/MM/DD");
    }

    if(utils.isNum(maturity)){
      maturity = moment("1900/01/01").add(maturity,'d').format("YYYY/MM/DD");
    }
    result.settlement = settlement;
    result.maturity = maturity;
    result.frequency = frequency;
    result.basis = basis;
    return result;
  },
  isNum(val){
  　if(val === "" || val ==null){
      return false;
　　 }
    return !isNaN(val)
  },
  jStat_ibeta(x, a, b) {
    // Factors in front of the continued fraction.
    var bt = (x === 0 || x === 1) ?  0 :
      Math.exp(utils.jStat_gammaln(a + b) - utils.jStat_gammaln(a) -
               utils.jStat_gammaln(b) + a * Math.log(x) + b *
               Math.log(1 - x));
    if (x < 0 || x > 1)
      return false;
    if (x < (a + 1) / (a + b + 2))
      // Use continued fraction directly.
      return bt * utils.jStat_betacf(x, a, b) / a;
    // else use continued fraction after making the symmetry transformation.
    return 1 - bt * utils.jStat_betacf(1 - x, b, a) / b;
  },
  jStat_gammaln(x) {
    var j = 0;
    var cof = [
      76.18009172947146, -86.50532032941677, 24.01409824083091,
      -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5
    ];
    var ser = 1.000000000190015;
    var xx, y, tmp;
    tmp = (y = xx = x) + 5.5;
    tmp -= (xx + 0.5) * Math.log(tmp);
    for (; j < 6; j++)
      ser += cof[j] / ++y;
    return Math.log(2.5066282746310005 * ser / xx) - tmp;
  },
  jStat_betacf(x, a, b) {
    var fpmin = 1e-30;
    var m = 1;
    var qab = a + b;
    var qap = a + 1;
    var qam = a - 1;
    var c = 1;
    var d = 1 - qab * x / qap;
    var m2, aa, del, h;

    // These q's will be used in factors that occur in the coefficients
    if (Math.abs(d) < fpmin)
      d = fpmin;
    d = 1 / d;
    h = d;

    for (; m <= 100; m++) {
      m2 = 2 * m;
      aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      // One step (the even one) of the recurrence
      d = 1 + aa * d;
      if (Math.abs(d) < fpmin)
        d = fpmin;
      c = 1 + aa / c;
      if (Math.abs(c) < fpmin)
        c = fpmin;
      d = 1 / d;
      h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      // Next step of the recurrence (the odd one)
      d = 1 + aa * d;
      if (Math.abs(d) < fpmin)
        d = fpmin;
      c = 1 + aa / c;
      if (Math.abs(c) < fpmin)
        c = fpmin;
      d = 1 / d;
      del = d * c;
      h *= del;
      if (Math.abs(del - 1.0) < 3e-7)
        break;
    }
    return h;
  }
}
let error = {
  nil: new Error('#NULL!'),
  div0: new Error('#DIV/0!'),
  value: new Error('#VALUE!'),
  ref: new Error('#REF!'),
  name: new Error('#NAME?'),
  num: new Error('#NUM!'),
  na: new Error('#N/A'),
  error: new Error('#ERROR!'),
  data: new Error('#GETTING_DATA')
}

export default Parser
