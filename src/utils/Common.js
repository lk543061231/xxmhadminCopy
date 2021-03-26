export default {
  numAdd: function (num1, num2) {
  var baseNum, baseNum1, baseNum2;
  try {
    baseNum1 = num1.toString().split(".")[1].length;
  } catch (e) {
    baseNum1 = 0;
  }
  try {
    baseNum2 = num2.toString().split(".")[1].length;
  } catch (e) {
    baseNum2 = 0;
  }
  baseNum = Math.pow(10, Math.max(baseNum1, baseNum2));
  return (num1 * baseNum + num2 * baseNum) / baseNum;
},
  sumColums:function(col,list){

    let total=0;
    for(let i in list){
      total= this.numAdd(total,list[i][col])
    }
    return isNaN(total)?"":total;

  },

  makeTotal:function(data,list) {
    let tem = {};

    for(let key in data){
      if(key == "createTime" || key == "id" || key=='orderRate' || key=='contentTitle' || key=='contentTitle' || key=='linkName' || key=='userAccount' || key =="profitShare" || key=="accountBalance") {
        tem[key] = ""
        continue;
      }


      tem[key] = this.sumColums(key,list)
    }
    tem.id=new Date().getTime();
    tem.createTime = "合计"
    if(tem["orderSuccess"]>=0 && tem['orderFail']>=0){
      try {
        let t = tem["orderSuccess"] *1+ tem['orderFail'] *1;
        let d = tem["orderSuccess"]*1 / t *100;
        tem['orderRate'] = d.toFixed(2)


      }catch (e) {
        console.log(e)
        return tem;
      }


    }
    return tem;
  },

  getColName:function(cols,name) {
    for(let i in cols){
      if(cols[i].dataIndex == name)
        return cols[i].title;
    }
    return "";
  }
}