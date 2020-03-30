function SERVICE_AREA() {
    //城市列表数据源
    var _data = api.readFile({
        sync: true,
        path: 'widget://res/city.json'
    });

    _model = {}; // 模型对象

    /**
     * 根据id代码查找对应的JSON对象
     * @param  {Array} pArr    必填，待查找的数据源数组
     * @param  {String} pCode  必填，查找的关键词
     * @param  {Number} pLevel 可选，当前查找的层级 (1:省级 2:市级 3:区级)默认为1
     * @return {JSON}        查找结果对象，JSON格式，如果未找到着返回空字符串
     */
    function fnForEach(pArr,pCode,pLevel) {
        var tCode = pCode;
        var tArr = pArr;
        var tLevel = pLevel ? pLevel:1;
        var tLength = tLevel*2;
        var tStr = tCode.substr(0,tLength);
        for(var i=0;i<tArr.length;i++) {
            var tObj = tArr[i];
            if( tStr == tObj.id.substr(0,tLength)) {  //判断头2位 省级
                if (tCode == tObj.id) {
                    return prov;  //找到
                }
                else if('[object Array]' === Object.prototype.toString.call(tObj.sub)){
                    //在子集中查找
                    return arguments.calle(tObj.sub,tCode,tLevel+1);
                }
                else {
                    return '';  //没有找到
                }
            }
        }
    }

    _model.Get = function(pCode,pLevel) {
        var tResult = fnForEach(pArr,pCode,pLevel);
        return tResult;
    }
    return _model;
}
