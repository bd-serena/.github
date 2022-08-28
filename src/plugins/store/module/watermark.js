let watermark = {}
let waterId
let waterInterval
let waterDiv

/***
 * t：距离头部距离 默认60
 * l：距离左边距离 20 
 * ew：拓展宽度 负数为增加宽度 0
 * eh：拓展高度
 * forDialogTb:针对弹窗 不采取绝对定位 用id为obj的div包裹表格，使水印撑满表格区域 true/false
 * ***/
let setWatermark = (obj,t,l,ew,eh,forDialogTb) => {
  let id = '1.23452384164.123412416';
  t = t||60;
  l = l||20;
  ew = ew||0;

  if (document.getElementById(id) !== null) {
    try{
      document.getElementById(obj).removeChild(document.getElementById(id));
    }catch(e){}
  }

  //创建一个画布
  let can = document.createElement('canvas');
  //设置画布的长宽
  can.width = 300;
  can.height = 150;
  let cans = can.getContext('2d');
  //旋转角度
  cans.rotate(-15 * Math.PI / 150);
  cans.font = '16px Vedana';
  //设置填充绘画的颜色、渐变或者模式
  cans.fillStyle = 'rgba(200, 200, 200, 0.40)';
  //设置文本内容的当前对齐方式
  cans.textAlign = 'left';
  //设置在绘制文本时使用的当前文本基线
  cans.textBaseline = 'Middle';
  //在画布上绘制填色的文本（输出的文本，开始绘制文本的X坐标位置，开始绘制文本的Y坐标位置）
  let str = [window.sessionStorage.getItem('user_id')||'',window.sessionStorage.getItem("user_name")||"",(new Date()).toLocaleDateString() + " " + (new Date()).toTimeString().split(' ')[0]]
  cans.fillText(str[0], 0, 40);
  cans.fillText(str[1], 0, 60);
  cans.fillText(str[2], 0, 80);
  let div = document.createElement('div');
  div.id = id;
  div.style.pointerEvents = 'none';
  // div.style.top = t + 'px';
  // div.style.left = l + 'px';
  div.style.top = '0px';
  div.style.left = '0px';
  div.style.bottom = '0px';
  // div.style.position = 'fixed';
  div.style.position = 'absolute';
  div.style.zIndex = '99';
  try{
    document.getElementById(obj).style.position="relative";
    div.style.width = document.getElementById(obj).clientWidth + 'px';
    // div.style.width = document.getElementById(obj).clientWidth - ew + 'px';
    if(eh){
      // div.style.height = document.getElementById(obj).clientHeight - eh + 'px';
    }
  }catch(e){}

try {
  if (forDialogTb){ //针对弹窗内的预览水印
    div.style.position = "absolute";
    div.style.top = '0px';
    div.style.left = '0px';
    div.style.bottom = '0px';
    div.style.right = '0px';
    div.style.width = 'unset';
    div.style.height = 'unset';
  }
} catch (error) {
  
}

  div.style.background = 'url(' + can.toDataURL('image/png') + ') left top repeat';
  document.getElementById(obj).appendChild(div);
  waterId = document.getElementById(id).cloneNode(true);
  waterDiv = document.getElementById(id);
  return id;
}

// 该方法只允许调用一次
watermark.set = (obj, t, l, ew, eh, forDialogTb) => {
  
  let id = setWatermark(obj, t, l, ew, eh, forDialogTb);
  
  waterInterval=setInterval(() => {
    let eq = false;
    try{
      eq = document.getElementById(id).isEqualNode(waterId)
    }catch(e){}
    if (document.getElementById(obj) != null && !eq) {
      id = setWatermark(obj, t, l, ew, eh, forDialogTb);
    }
  }, 500);
    window.onresize = () => {
      if(waterDiv){
        setWatermark(obj, t, l, ew, eh, forDialogTb);
      }
    };
}

watermark.unset = ()=>{
  clearInterval(waterInterval);
  if(waterDiv){
    waterDiv.remove();
    waterDiv=null;
  }
}

export default watermark;
