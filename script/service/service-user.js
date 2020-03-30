/********************************************************************************
* writer: SDJ
* create date: 2017-7-15
* rewriter: SDJ
* rewrite date: 2017-7-15
* description:封装了USER (用户类) LIST(列表类)，及表单验证等相关方法
* * rewriter: SDJ
* rewrite date: 2017-7-27
* description:增加了时间函数方法
* rewrite date: 2017-8-12
* description: 重构了USER()函数方法，重构了对外接口，支持直接调用
*********************************************************************************/
function USER() {
    "use strict"
    //定义常量
    var _USERKEY = 'userInfo';  //默认用户本地缓存变量名
    var _EVENT = 'userEvent';   //默认用户监听事件名称
    var _user = {};  // 内部保存私有用户数据对象
    /*******定义类方法********/

    function _load() {  // 读取用户本地缓存数据
        return api.getPrefs({key: _USERKEY , sync: true});
    }

    function _save() {  // 保存本地缓存用户数据
        api.setPrefs({
            key: _USERKEY,
            value: JSON.stringify(_user),
        });
    }

    function _clear() {  // 清除本地用户缓存数据
        _user = {};
        api.removePrefs({
            key: _USERKEY
        });
    }
    function _init() {  // 初始化内部模型对象
        var tUser = _load();
        if( tUser){
            _user = JSON.parse(tUser);
        }
        else {
            // 初始化
            _user = {};
        };
    }

    /**
     * 获取用户属性或内部用户对象
     * @param  {String} pPropertyKey 用户属性名
     * @return {[type]}      [description]
     */
    function _get(pPropertyKey, pIsReload) {
        if(pIsReload) {
            _init();
        }
        if('string' == typeof pPropertyKey) {
            return _user[pPropertyKey];
        }
        else {
            return _user;
        }
    }
    /**
     * 设置用户属性
     * @param  {Object} pProperty  待保存的用户属性(key-value键值对形式的JSON对象)
     *  当用户属性值改变是，会同步发出用户change事件
     */
    function _set(pProperty) {
        if('object' !== typeof pProperty){
            console.log('【'+api.winName+'】-【'+api.frameName+'】-【User.set()】参数格式错误！【pProperty='+pProperty+'】');
            return;
        }
        var tIsChanged = false;
        for(var key in pProperty) {
            if(tIsChanged){
                _user[key] = pProperty[key];
            }
            else{
                var tUserValue = _user[key];
                var tObjValue = pProperty[key];
                if(!tUserValue || Object.prototype.toString.call(tUserValue) !== Object.prototype.toString.call(tObjValue)) {
                    _user[key] = tObjValue;
                    tIsChanged = true;
                }
                else {
                    if('object' === typeof tObjValue) {  // 对象类型，采用JSON序列化比较
                        if(JSON.stringify(tUserValue) !== JSON.stringify(tObjValue)) {
                            _user[key] = tObjValue;
                            tIsChanged = true;
                        }
                    }
                    else if(tUserValue !== tObjValue){  // 非对象类型，直接比较
                        _user[key] = tObjValue;
                        tIsChanged = true;
                    }
                }
            }
        }
        if(tIsChanged) {  // 内部对象属性改变，更新本地缓存
            _save();
        }
    }
    _init();  // 自动初始化
    // 封装对方接口对象
    var _obj = {
        Clear: function() {  //清除本地用户缓存信息
            _clear();
        },
        Init: function() {  // 初始化用户内部对象
            _init();
        },
        Set: function(pProperty) {  // 设置用户属性并自动更新本地缓存
            _set(pProperty);
        },
        Get: function(pPropertyKey, pIsReload) {  // 读取用户属性或用户对象
            return _get(pPropertyKey, pIsReload);
        },
    }
    return _obj;
}


  /**
   * [LIST 列表封装对象]
   * @param {[Dom元素]} pListEl       [选填，列表的外部HTML容器]
   * @param {[Dom元素]} pTemplateEl [选填，单元格的DOT模版容器]
   * 说明：1.List的形参不为空，则实例化时，自动进行内部赋值，否则，需手动调用SetUI和SetTemplate方法赋值；
   * 		2.在使用刷新、加载方法前，必须先定义列表的外部HTML容器和单元格的DOT模版容器；
   */
  function LIST(pListEl, pTemplateEl) {
    //定义作用域内变量
    var _list = new Object();

    var _listEl; //静态页面HTML容器元素对象
    var _templateEl,
      _dot; //静态模版容器对象；

    var _dataSource = new Array(); //数据源数组对象
    var _index = 0; // 单元格索引值记录对象
    var _lastData; //缓存比较对象


    /**
     * [SetUI 设置列表容器方法]
     * @param {[Dom元素]} pEl [列表容器的HTML元素对象]
     */
    _list.SetUI = function(pEl) {
      if (!(pEl && 1 == pEl.nodeType)) {
          return;
      }
      _listEl = pEl;
    }

    /**
     * [SetTemplate 设置模版元素对象]
     * @param {[Dom元素]} pTEl [单元格模版，HTML元素对象]
     */
    _list.SetTemplate = function(pTEl) {
      if (pTEl) {
        _templateEl = pTEl;
        _dot = doT.template(_templateEl.innerHTML);
      }
    }

    /**
     * [Refresh 列表执行刷新方法]
     * @param {[Array]} pData [刷新数据数组]
     */
    _list.Refresh = function(pData) {
      if ('[object Array]' !== Object.prototype.toString.call(pData) || 0 == pData.length) {
          _index = 0;
          _dataSource = [];
          _listEl.innerHTML = "";
          return;
      }

      //缓存优化，两次刷新数据未更新，则不执行数据；
      var _tempData = JSON.stringify(pData);
      if (0 == _index && _lastData && _lastData == _tempData) {
          console.log('无数据变化，不执行刷新！');
          return;
      } else {
        _lastData = _tempData;
      }
      //重置参数对象
      _index = 0;
      _dataSource = [];
      _listEl.innerHTML = "";
      //页面数据处理并执行页面加载
      _fnInitCell(pData);
      // api.refreshHeaderLoadDone();
    }

    /**
     * [Load 列表执行加载方法]
     * @param {[type]} pData [description]
     */
    _list.Load = function(pData) {
      if ('[object Array]' !== Object.prototype.toString.call(pData) || pData.length == 0) {
        api.toast({
          msg: '没有更多了！',
          duration: 2000,
          location: 'bottom',
          global:true,
        });
        return;
      }
      _fnInitCell(pData);
    }

    var _defaultModel; //模型默认值模型

    /**
     * [setDefaultModel 设置模型默认值]
     * @param {[JSON]} pModel [必填，JSON对象，设置默认值的模型对象]
     *                        var tModel={'name':'姓名未填','details':'啥也没有'};
     *                        var list=LIST();
     *                        var list.SetDefaultModel(tModel);
     */
    _list.SetDefaultModel = function(pModel) {
      if (!pModel || 'object' != typeof pModel) {
        return;
      }
      _defaultModel = pModel
    }
    var _cellDataHandling; //单元数据处理方法；
    _list.HandingCell = function(pFun) {
      if ('function' != typeof pFun) {
        return;
      }
      _cellDataHandling = pFun;
    }

    //创建单元格
    function _fnInitCell(pData, pModel) {
      console.log('fnInitCell beginning...')
      var tHTML = '';
      for (var i = 0; i < pData.length; i++) {
        var tObj = pData[i];
        tObj.index = _index + i;
        if (_defaultModel) {
          for (var tKey in _defaultModel) {  //空参数使用默认值
            if (!tObj[tKey]) {
              tObj[tKey] = _defaultModel[tKey];
            }
          }
        }
        if (_cellDataHandling) { //执行用户自定义方法
          tObj = _cellDataHandling(tObj);
        }

        _dataSource.push(tObj);
        tHTML += _dot(tObj);
      }
      //获取当前单元格数量
      _index = _dataSource.length;
      //执行页面加载
      if(_listEl) {
          _listEl.insertAdjacentHTML('beforeend', tHTML);
      }
      else {
          console.log('列表元素未定义');
      }
      //按钮点击优化
      // api.parseTapmode();
    }

    _list.index = function() {
      return _index;
    }

    _list.dataSource = function(pIndex) {
      if ('number' !== typeof pIndex) {
        return _dataSource;
      }
      return _dataSource[pIndex];
    }

    _list.SetUI(pListEl);
    _list.SetTemplate(pTemplateEl);
    return _list;
}

/*
 *表单验证(电话验证)
 */
function fnCheckPhone(pStr) {
    var tMsg = '请输入正确的手机号码';
    var tResult = false;
    if(!pStr) {
        tMsg = '请输入手机号码';
    }
    else {
        var reg = /1\d{10}/g;
        tResult = reg.test(pStr);
    }
    if(!tResult) {
        api.toast({
            msg: tMsg,
            duration: 2000,
            location: 'bottom',
            global:true,
        });
    }
    return tResult;
};

/*
 *表单验证(密码验证)
 */
function fnCheckPwd(pStr) {
    var tMsg = '密码格式应为6-16位数字、字母或组合';
    var tResult = false;
    if(!pStr) {
        tMsg = '请输入密码';
    }
    else {
        var reg = /^[0-9a-zA-Z]{6,16}$/g;
        tResult = reg.test(pStr);
    }

    if(!tResult) {
        api.toast({
            msg: tMsg,
            duration: 2000,
            location: 'bottom',
            global:true,
        });
    }
    return tResult;
};
/*
 *验证邮箱
 */
function fnCheckEmail(pStr){
    var tMsg = '输入Email格式错误';
    var tResult = false;
    if(!pStr) {
        tMsg = '请输入Email';
    }
    else {
        var reg = /^[\w]([\w\.-]+)@([a-zA-Z\d][\w\.-]+)\.([a-zA-Z]{2,6})$/ig;
        tResult = reg.test(pStr);
    }

    if(!tResult) {
        api.toast({
            msg: tMsg,
            duration: 2000,
            location: 'bottom',
            global:true,
        });
    }
    return tResult;
}
/*
 *表单验证(手机验证码)
 */
function fnCheckCode(pStr) {
    var tMsg = '请输入手机验证码';
    var reg = /^[\d]{6}$/g;
    var tResult = reg.test(pStr);
    if(!tResult) {
        api.toast({
            msg: tMsg,
            duration: 2000,
            location: 'bottom',
            global:true,
        });
    }
    return tResult;
};
/*
 *表单验证(身份证号码格式验证)
 */
function fnCheckIDCard(pStr) {
      var tMsg = '请输入正确的身份证号码';
      var tResult = false;
      if(!pStr) {
          tMsg = '请输入身份证号码';
      }
      else {
          var reg = /^[0-9]{17}[\d|x]$/g;
          tResult = reg.test(pStr);
      }
      if(!tResult) {
          api.toast({
              msg: tMsg,
              duration: 2000,
              location: 'bottom',
              global:true,
          });
      }
      return tResult;
};


// 读取缓存用户位置信息
function fnLoadLocationInfo() {
    var tUserLocation = api.getPrefs({key:'locationInfo', sync: true});
    if (tUserLocation) {
      tUserLocation = JSON.parse(tUserLocation);
    }
    return tUserLocation;
}

// 保存用户位置信息
function fnCacheLocationInfo(pParam) {
    var tUserLocation = fnLoadLocationInfo();
    if (!tUserLocation) {
        tUserLocation = {};
    }
    if('[object Object]' === Object.prototype.toString.call(pParam)) {
        for(var tKey in pParam) {
            tUserLocation[tKey] = pParam[tKey];
        }
    }
    api.setPrefs({
        key: 'locationInfo',
        value: JSON.stringify(tUserLocation)
    });
    console.log('User location===='+JSON.stringify(tUserLocation));
}

/******************************************
                Date对象扩展方法
******************************************/


/**
 * 闰年判断
 * @param       {Number} pYear 4位数字组成的年份值
 * @constructor
 */
Date.prototype.isLeapYear = function(pYear) {
    var self = this;
    var tYear = 'number' === typeof pYear ? pYear:self.getFullYear();
    return (tYear % 4 == 0) && (tYear % 100 != 0 || tYear % 400 == 0);
}
/**
 * 获取查询月份的天数
 * @param  {Number} pMonth 可选，指定月份，默认当前月份 0-11
 * @param  {Number} pYear  可选，指定年份，默认当前年份，要求完整年格式，如1992
 * @return {Number}        返回月份的日期天数
 */
Date.prototype.getMonthDays = function(pMonth,pYear) {
    var self = this;
    var tMonth = 'number' === typeof pMonth ? pMonth:(self.getMonth());
    switch (tMonth+1) {
        case 1:
        case 3:
        case 5:
        case 7:
        case 8:
        case 10:
        case 12:
            return 31;
            break;
        case 2:
            if(self.isLeapYear(pYear)){
                return 29;
            }
            else {
                return 28;
            }
        default:
            return 30;
    }
}
/**
 * 获取指定日期的星期数
 * @param  {Number} pYear  可选，指定年份，默认当前时间年份，要求完整年格式，如1992
 * @param  {Number} pMonth 可选，指定月份，默认当前时间月份 0-11
 * @param  {Number} pDay   可选，指定日期，默认当前时间日期，要求完整年格式，如1992
 * @return {Number}        返回星期数值
 */
Date.prototype.getWeekNumber = function(pYear,pMonth,pDay) {
    var self = this;
    var tYear = 'number' === typeof pYear ? pYear:self.getFullYear();
    var tMonth = 'number' === typeof pMonth ? pMonth:self.getMonth();
    var tDay = 'number' === typeof pDay ? pDay:self.getDate();
    self.setFullYear(tYear, tMonth, tDay);
    return self.getDay();
}

Date.prototype.getDayString = function (prefixStr) {
    var tNum = this.getDay();
    var tPrefixStr = prefixStr ? prefixStr:'星期';
    var tObjStr;
    switch (tNum) {
      case 0:
        tObjStr = '日';
        break;
      case 1:
        tObjStr = '一';
        break;
      case 2:
        tObjStr = '二';
        break;
      case 3:
        tObjStr = '三';
        break;
      case 4:
        tObjStr = '四';
        break;
      case 5:
        tObjStr = '五';
        break;
      case 6:
        tObjStr = '六';
        break;
      default:
        return;
    }
    return tPrefixStr + tObjStr;
}

Date.prototype.getString = function(pType,pSymbol) {
    var _self = this;
    var _year=_self.getFullYear();
    var _month=_self.getMonth()+1;
    if(_month<10){
        _month = '0'+_month;
    }
    var _date=_self.getDate();
    if(_date<10){
        _date = '0'+_date;
    }
    var _hour=_self.getHours();
    if(_hour<10){
        _hour = '0'+_hour;
    }
    var _minute=_self.getMinutes();
    if(_minute<10){
        _minute = '0'+_minute;
    }
    var _second=_self.getSeconds();
    if(_second<10){
        _second = '0'+_second;
    }
    var tSymbol = 'string' === typeof pSymbol ? pSymbol:'-';
    var tDateStr = _year+tSymbol+_month+tSymbol+_date;
    var tTimeStr = _hour+":"+_minute+":"+_second;
    if( 'date' == pType ) {
        return tDateStr;
    }
    else if('time' == pType) {
        return tTimeStr;
    }
    else {
        return tDateStr + ' ' + tTimeStr;
    }
}

/******************************************
        针对项目的业务逻辑通用方法
******************************************/

// //检查用户登录状态
// function fnCheckUserStatus() {
//     if(USER().Get('operId')) {
//         return true;
//     }
//     else {
//         api.execScript({
//             name: 'root',
//             script: 'fnOpenLoginPage();'
//         });
//         return false;
//     }
// }

/******************************************
          支付业务
******************************************/

// // 微信支付
// function fnWxPay(pData,pCallback) {
//     console.log('开始微信支付  data=='+JSON.stringify(pData));
//     var wxPay = api.require("wxPay");
//     wxPay.payOrder({
//         apiKey: pData.appid,
//         mchId: pData.partnerid,
//         orderId: pData.prepayid,
//         package: 'Sign=WXPay',
//         nonceStr: pData.noncestr,
//         timeStamp: pData.timestamp,
//         sign: pData.sign
//     }, function(ret, err) {
//         console.log('微信支付结果=='+JSON.stringify(ret));
//         if('function' === typeof pCallback) {
//             pCallback(ret,err);
//         }
//     });
// }
