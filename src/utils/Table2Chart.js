const dataTrans = (data, type) => {
    console.log(data,type);
    let result = {};
    if(type === 'VeHistogram' || type === 'VeLine' || type === 'VePie' || type === 'VeRadar' || type === 'VeRosePie' || type === 'VeFunnel') {    //柱图
        result = typeBar(data)
    } else if(type === 'VeScatter') {
        result = typeScatter(data)
    } else if(type === 'VeGauge') {
        result = typeGauge(data)
    }
    return result;
}

const typeBar = (data) => {     //柱图类数据
    washData(data);
    let columns = [], rows = [], result = {};
    columns = data[0];
    for(let i=1; i<data.length; i++) {
        let item = data[i];
        let temp = {};
        for(let j=0; j<item.length; j++) {
            temp[columns[j]] = item[j];
        }
        rows.push(temp);
    }
    result = { columns, rows }
    return result;
}

const typeScatter = (data) => {  //散点图数据
    washData(data);
    let columns = [], rows = {}, result = {};
    columns = data[0];
    columns.splice(0,1);
    for(let i=1; i<data.length; i++) {
        let item = data[i];
        let dim = item.splice(0,1);
        rows[dim] = [];
        let temp = {};
        for(let j=0; j<item.length; j++) {
            temp[columns[j]] = item[j];
        }
        rows[dim].push(temp);
    }
    result = { columns, rows }
    return result;
}

const typeGauge = (data) => {   //仪表盘数据
    let columns = ['type','value'], rows = [], result = {};
    let item = data[0];
    rows.push({type:item[0],value:item[1]});
    result = { columns, rows }
    return result;
}


const washData = (data) => {
    // let chReg = /[\u4E00-\u9FA5]/;  //中文
    let numReg = /^(-)?(([0-9])|([1-9]([0-9]+)))(.[0-9]+)?$/;   //数值
    let numRow = [], strRow = [], nullRow = [];
    for(let i=0; i<data.length; i++) {
        let row = data[i], length = row.length, strSize = 0, numSize = 0, emptySize = 0;
        row.forEach(val => {
            if (numReg.test(val)) {
                numSize ++;  //数值个数
            } else if (!val || val.trim() === '') {
                emptySize ++;   //空白个数
                val = '';
            } else {
                strSize ++;
            }
        })
        if (numSize >= length/2) {  //数值为主
            numRow.push(i);
        }
        if(strSize >= length/2) {  //字符为主
            strRow.push(i);
        }
        if (emptySize >= length/2) {   //空白为主
            nullRow.push(i);
        }
    }
    if(numRow.length === data.length) { //全数字的情况
        let col = data[0].length;
        let top = [null];
        for(let i=0;i<col;i++) {
            top.push('系列'+(i+1));
        }
        data.unshift(top)
        for(let j=1;j<data.length;j++) {
            data[j].unshift(j);
        }

    }
    console.log('numRow:'+numRow+',strRow:'+strRow+',nullRow:'+nullRow);
}


export { dataTrans }
