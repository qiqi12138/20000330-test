localStorage.font_status = localStorage.font_status || 0; //0简体 1繁体
localStorage.isCourse = localStorage.isCourse || "0";
localStorage.isParty = localStorage.isParty || "0";
localStorage.isLifePhoto = localStorage.isLifePhoto || "0";
localStorage.telephone = localStorage.telephone || "";
localStorage.userName = localStorage.userName || "";
localStorage.avatar = localStorage.avatar || "";

var dutyIDReg = /^(\w{15}|\w{18}|\w{20})$/;
var PhoneRes = /^1\d{10}$/;
var EmailReg = /^[a-zA-Z0-9_-]+(\.|[a-zA-Z0-9_-]+)+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;

function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}

/*
 * 格式化时间为 2018/07/30 12:08:08
 */
function formatTime(date, type) {
    if (!date) return '';
    if (typeof date == 'string' && (date.indexOf('-') != -1 || date.indexOf('.') != -1)) {
        date = date.replace(/-/g, '/');
        date = date.replace(/\./g, '/');
    }
    if (type == 'nextYear') {
        date = new Date();
    }
    if (date && parseInt(date) == date) {
        date = parseInt(date);
    }
    date = date ? new Date(date) : new Date();
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds();
    if (type == 'day') {
        return day;
    }
    if (type == 'month') {
        return month;
    }
    if (type == 'year') {
        return year;
    }
    if (type == 'nextYear') {
        year = year * 1 + 1;
    }
    if (type == 'monthDay') {
        return [month, day].map(formatNumber).join('.');
    }
    if (type == 'date') {
        return [year, month, day].map(formatNumber).join('-');
    }
    if (type == 'dateC') {
        return year + "年" + formatNumber(month) + "月" + formatNumber(day) + "日";
    }
    if (type == 'point_data') {
        return [year, month, day].map(formatNumber).join('.') + ' ' + [hour, minute, second].map(formatNumber).join(':');
    }
    return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formateTime(timeStr) {
    timeStr = formatTime(timeStr)
    if (!timeStr) return '';
    timeStr = timeStr.replace(/-/g, '/');
    var now = (new Date()).getTime();
    var nowYear = new Date().getFullYear();
    var time = (new Date(timeStr)).getTime();
    var timeYear = new Date(timeStr).getFullYear();
    var cha = now - time;
    if (cha < 1000 * 60 * 10) {
        return '刚刚';
    } else if (cha < 1000 * 60 * 60) { // 分钟数
        min = parseInt(cha / 1000 / 60);
        return min + "分钟前";
    } else if (cha > 1000 * 60 * 60 * 24 && nowYear == timeYear) {
        return timeStr.substr(5, 11).replace(/\//g, '-');
    } else if (cha > 1000 * 60 * 60 * 24 && nowYear != timeYear) {
        return timeStr.substr(0, 10).replace(/\//g, '-');
    } else { // 小时数
        var hour = parseInt(cha / 1000 / 60 / 60);
        return hour + "小时前";
    }
}

function fnSecToMin(pSec) { //秒数变分钟数
    var min = Math.floor(pSec / 60),
        second = Math.floor(pSec % 60),
        hour, newMin, time;
    if (min > 60) {
        hour = Math.floor(min / 60);
        newMin = min % 60;
        if (newMin < 10) {
            newMin = '0' + newMin;
        }
    }
    if (second < 10) {
        second = '0' + second;
    }
    if (min < 10) {
        min = '0' + min;
    }
    return time = hour ? (hour + ':' + newMin + ':' + second) : (min + ':' + second);
}
//计算两个时间差
function fnTimeDiff(date) { //sDate1和sDate2是2002-12-18格式
    //获取给定时间的年月
    if (!date) return '';
    newDate = Date.parse(new Date());
    // console.log(new Date())
    var time_difference = date - newDate;
    if (time_difference >= 0) {
        time_difference = new Date(time_difference) / 1000;
        var hour = parseInt(time_difference / 60 / 60);
        var minute = parseInt(time_difference / 60 - hour * 60);
        var second = parseInt(time_difference - hour * 60 * 60 - minute * 60);
        return formatNumber(hour) + "时" + formatNumber(minute) + "分" + formatNumber(second) + "秒";
    } else {
        return "";
    }

}

/**
 * 距离今天{days}时间的日期
 *
 * @param {days} number
 * @returns
 */
function formateDateZT(str) {
    if (!str) {
        return "刚刚";
    }
    str = str.replace(/\-/g, "/");
    var today = (new Date()).getTime();
    var before = (new Date(str)).getTime();
    var cha = today - before;
    if (cha <= 1000 * 60 * 60) {
        return "刚刚";
    } else {
        var hours = cha / (1000 * 60 * 60);
        if (hours < 24) {
            return parseInt(hours) + "小时前";
        } else if (hours < 24 * 30) {
            return parseInt(hours / 24) + "天前";
        } else {
            return parseInt(hours / (24 * 30)) + "月前";
        }
    }
}
//计算空间大小
function fnBytesToSize(bytes, type) {
    if (bytes == 0) {
        if (type == 'unit') {
            return 'B';
        } else if (type == 'val') {
            return '0';
        }
        return '0B';
    }
    var k = 1024;
    sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    i = Math.floor(Math.log(bytes) / Math.log(k));
    var _size = bytes / Math.pow(k, i);
    if (parseInt(_size) != _size) {
        _size = _size.toFixed(2);
    }
    if (type == 'unit') {
        return sizes[i];
    } else if (type == 'val') {
        return _size;
    }
    return _size + '' + sizes[i];
}
var code_timer;

function fnVerifyTime(time, el) {
    //time 倒计时的时间,当前的vue， sendBtnText 文本字段 isSendCode 发送按钮是否可用字段
    console.log("开启倒计时")
    var _time;
    if (time && time != "") {
        _time = time;
    } else {
        _time = 60;
    }
    if (code_timer) {
        clearInterval(code_timer);
        el.sendBtnText = _time;
    }
    code_timer = setInterval(function() {
        if (_time > 0) {
            _time--;
            el.sendBtnText = "重新获取" + _time + "s";
        } else {
            clearInterval(code_timer);
            el.isSendCode = true;
            el.sendBtnText = '重新获取';
        }
    }, "1000");
    if (api.systemType == "ios") {
        var _data1;
        api.addEventListener({
            name: 'pause'
        }, function(ret, err) {
            _data1 = Date.parse(new Date());
        });
        api.addEventListener({
            name: 'resume'
        }, function(ret, err) {
            var _data2 = Date.parse(new Date());
            var _data = _data2 - _data1;
            _data = _data / 1000;
            _time = _time - _data;
        });
    }
}

//移除数组中的某个元素
Array.prototype.indexOf = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    }
    return -1;
};
Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};
//toast提示封装
function fnToast(msg, date, loca) {
    var duration = 2000;
    var location = 'bottom';
    if (date && date != "") {
        duration = date;
    }
    if (loca && loca != "") {
        location = loca;
    }
    api.toast({
        msg: msg,
        duration: duration,
        location: location,
        global: true,
    });
}

//收起键盘
function fnKeyboard() {
    var _inputLen = $api.domAll("input");
    if (_inputLen && _inputLen.length > 0) {
        for (var i = 0; i < _inputLen.length; i++) {
            _inputLen[i].blur();
        }
    }
    var _textLen = $api.domAll("textarea");
    if (_textLen && _textLen.length > 0) {
        for (var i = 0; i < _textLen.length; i++) {
            _textLen[i].blur();
        }
    }
}

//打开公共头部
function fnOpenPublicWin(title, name, parameter) {
    //title 页面标题；name 页面名称，作为页面跳转的name和url；parameter 参数。
    parameter = parameter || {};
    parameter.title = title || "";
    parameter.name = name;
    parameter.type = parameter.type || ""; //页面类型，标题，
    if (title != "" && parameter.type == "") {
        parameter.type = "title"
    }
    console.log(parameter.isBack + "----")
    parameter.isSlidBack = parameter.isSlidBack == undefined ? true : parameter.isSlidBack; //是否有返回按钮 默认true
    parameter.isBack = parameter.isBack == undefined ? true : parameter.isBack; //是否有返回按钮 默认true
    parameter.isLine = parameter.isLine == undefined ? true : parameter.isLine; //header底部是否有线 默认true
    console.log(parameter.isBack + "----")
    parameter.backType = parameter.backType || ""; //返回按钮 title img 默认img
    parameter.backName = parameter.backName || ""; //返回按钮文字
    parameter.isBtn = parameter.isBtn || false; //是否有按钮
    parameter.btnType = parameter.btnType || ""; //按钮类型 title img
    parameter.btnName = parameter.btnName || ""; //按钮显示文字，图片
    parameter.btnColor = parameter.btnColor || "rgba(25,149,248,1)"; //按钮文字的颜色
    parameter.bgColor = parameter.bgColor || "#fff"; //header的背景颜色
    parameter.headerFn = parameter.headerFn || ""; //顶部方法
    if (name == 'mine/about_us' || name == 'mine/message_list' || name == 'index/book_detail' || name == 'index/my_task') {
        parameter.isHeaderBottom = '1';
    } else {
        parameter.isHeaderBottom = '0';
    }
    var tParam = {
        name: name + "_win",
        url: 'widget://html/public_header_win.html',
        allowEdit: false,
        slidBackEnabled: parameter.isSlidBack,
        pageParam: parameter
    }
    fnOpenWin(tParam)
}
//api方法修改
var fnApiCloud = function(name) {
    this.htmlElementsArray = [];
    if (typeof name !== 'string' && typeof name !== 'object') {
        throw new Error('Name must be a string or a object!');
    } else {
        var nameList = name.split(" ");
        var _elName = "";
        for (var y = 0; y < nameList.length; y++) {
            if (/#/.test(nameList[y])) {
                _elName = $api.byId(nameList[y].substr(1));
            } else {
                if (_elName == "") {
                    _elName = $api.domAll(nameList[y]);
                    if (_elName.length == "1") {
                        _elName = $api.dom(nameList[y]);
                    }
                } else {
                    if (_elName.length) {
                        for (var i = 0; i < _elName.length; i++) {
                            var _elItem = $api.domAll(_elName[i], nameList[y]);
                            if (_elItem.length == "1") {
                                _elItem = $api.dom(_elName[i], nameList[y]);
                            }
                            if (_elItem.length > 0) {
                                _elName = _elItem;
                            }
                        }
                    } else {
                        _elName = $api.domAll(_elName, nameList[y]);
                        if (_elName.length == "1") {
                            _elName = $api.dom(_elName, nameList[y]);
                        }
                    }
                }
            }
        }
        if (_elName.length) {
            for (var i = 0, len = _elName.length; i < len; i++) {
                this.htmlElementsArray.push(_elName[i]);
            }
        } else if (_elName && _elName != "") {
            this.htmlElementsArray.push(_elName);
        }
    }
    this.length = this.htmlElementsArray.length;
};

fnApiCloud.prototype = {
    each: function(fn) {
        for (var i = 0, len = this.htmlElementsArray.length; i < len; i++) {
            fn.call(this, this.htmlElementsArray[i]);
        }
        return this;
    },
    css: function(value) {
        this.each(function(ele) {
            $api.css(ele, value);
        });
        return this;
    },
    attr: function attr(type, value) {
        var el;
        this.each(function(ele) {
            el = ele
            if (value) {
                $api.attr(ele, type, value);
            } else {
                $api.attr(ele, type);
            }
        });
        if (value) {
            return this;
        } else {
            return $api.attr(el, type);
        }
    },
    text: function text(value) {
        var el;
        this.each(function(ele) {
            el = ele;
            if (value) {
                $api.text(ele, value);
            }
        });
        if (value) {
            return this;
        } else {
            return $api.text(el);
        }
    },
    offsetT: function offsetT() {
        var oTop;
        this.each(function(ele) {
            oTop = $api.offset(ele).t;
        });
        return oTop;
    },
    offsetH: function offsetH() {
        var oHeight;
        this.each(function(ele) {
            oHeight = $api.offset(ele).h;
        });
        return oHeight;
    },
    removeCls: function removeCls(cls) {
        this.each(function(ele) {
            el = ele;
            $api.removeCls(ele, cls);
        });
    }

};


function AD(name) {
    return new fnApiCloud(name);
}



//保存用户信息
function fnWhenLoginSucess(pUserData) {
    // alert(JSON.stringify(pUserData))
    if (!pUserData) {
        console.log('错误：登录成功后，用户信息缺失');
        return;
    }
    //登录成功,获取用户的基本信息
    USER.Set(pUserData);
}

//修改个人信息显示
function fnExitUserInfo() {
    api.execScript({
        name: 'main',
        frameName: 'tab_index',
        script: 'fnSetUserName();'
    });
}

// 今天，昨天，年月日时分
function fnFormateTodayDate(date) {
    if (!date) return '';
    if (typeof date == 'string' && date.indexOf('-') != -1) {
        date = date.replace(/-/g, '/');
    }
    date = new Date(date);
    var dateTime = date.getTime();
    var now = new Date();
    var nowTime = now.getTime();
    var cha = nowTime - dateTime;
    if (cha <= 60 * 60 * 24 * 1000 && date.getDate() == now.getDate()) {
        return '今天';
    } else if (cha < 60 * 60 * 24 * 1000 * 2 && now.getDate() - date.getDate() == 1) {
        return '昨天';
    } else {
        return fnContentTime(dateTime, 'dateC');
        // .substr(5, 11)
    }
}

function fnContentTime(_date, type) {
    date = _date ? new Date(_date) : new Date();
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()
    if (type == 'date') {
        return [year, month, day].map(formatNumber).join('-');
    }
    if (type == 'dateC') {
        return year + "年" + formatNumber(month) + "月" + formatNumber(day) + "日";
    }
    return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute].map(formatNumber).join(':')
}
//照片详情的时间展示
function fnForamtePicTime(date, type) {
    if (date == null) {
        return '';
    }
    if (typeof date === 'string') {
        date = date.replace(/-/g, '/');
    }
    date = date ? new Date(date) : new Date();
    var sec_one = '', // 6月10日
        sec_two = '', // 星期日
        sec_three = ''; // 17:29
    if (type && type == 'year') {
        sec_one = formatNumber(date.getFullYear()) + "年" + formatNumber(date.getMonth() + 1) + "月" + formatNumber(date.getDate()) + "日";
    } else {
        sec_one = formatNumber(date.getMonth() + 1) + "月" + formatNumber(date.getDate()) + "日";
    }
    sec_two = "星期" + fnGetWeek(date.getDay() - 1);
    sec_three = formatNumber(date.getHours()) + ":" + formatNumber(date.getMinutes());

    return sec_one + '  ' + sec_two + '  ' + sec_three;
}
//发布的时间显示规则


// 中文星期几
var _CHDAY = ['一', '二', '三', '四', '五', '六', '日'];

function fnGetWeek(num) {
    if (num == -1) {
        return _CHDAY[_CHDAY.length - 1];
    }
    return _CHDAY[num];
}

function fnReleaseTime(date, type) {
    if (!date) return '';
    if (typeof date == 'string' && date.indexOf('-') != -1) {
        date = date.replace(/-/g, '/');
    }
    date = new Date(date);
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds();
    // return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')

    var dateTime = date.getTime();
    var now = new Date();
    var nowTime = now.getTime();
    var cha = nowTime - dateTime;
    var monday = nowTime - ((now.getDay() - 1) * 24 * 60 * 60 * 1000) //周一
    if (type == 'activity') {
        return [year, month, day].map(formatNumber).join('-') + " " + "星期" + fnGetWeek(date.getDay() - 1);
    } else if (cha <= 1000 * 60 * 3) {
        return '刚刚';
    } else if (cha <= 1000 * 60 * 60 * 24 && date.getDate() == now.getDate()) {
        return '今天' + ' ' + [hour, minute].map(formatNumber).join(':');
    } else if (cha <= 1000 * 60 * 60 * 24 * 2 && now.getDate() - date.getDate() == 1) {
        return '昨天' + ' ' + [hour, minute].map(formatNumber).join(':');
    } else if (cha <= 1000 * 60 * 60 * 24 * 7 && date.getDate() >= new Date(monday).getDate()) {
        return "星期" + fnGetWeek(date.getDay() - 1) + ' ' + [hour, minute].map(formatNumber).join(':');
    } else if (date.getFullYear() != now.getFullYear()) {
        return [year, month, day].map(formatNumber).join('-');
    } else {
        return [month, day].map(formatNumber).join('-') + " " + "星期" + fnGetWeek(date.getDay() - 1);
    }

}


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
    return typeof obj;
} : function(obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

//判断是否为空
function isEmpty(data) {
    if (isEmpty1(data) || isEmpty2(data)) {
        return true;
    }
    return false;
};

function isEmpty1(data) {
    if (data === undefined || data === null || data === "" || data === 'NULL' || data === false || data === 'false') {
        return true;
    }
    return false;
};

function isEmpty2(v) {
    switch (typeof v === "undefined" ? "undefined" : _typeof(v)) {
        case 'undefined':
            return true;
        case 'boolean':
            if (!v) return true;
            break;
        case 'number':
            if (0 === v) return true;
            break;
        case 'object':
            if (null === v) return true;
            if (undefined !== v.length && v.length == 0) return true;
            for (var k in v) {
                return false;
            }
            return true;
            break;
    }
    return false;
};



function fnOpenAlert(pageData) {
    pageData.winName = api.winName;
    pageData.frameName = api.frameName;
    pageData.cancelFn = pageData.cancelFn || "";
    pageData.alertConfirmFn = pageData.alertConfirmFn || "";
    pageData.cancelText = pageData.cancelText || "取消";
    pageData.confirmText = pageData.confirmText || "确定";
    var tParam = {
        name: "alert",
        url: 'widget://html/alert.html',
        useWKWebView: true,
        bgColor: 'rgba(0,0,0,0)',
        rect: {
            x: 0,
            y: 0,
            w: "auto",
            h: "auto"
        },
        pageParam: pageData
    }
    fnOpenFrame(tParam);
}

function fnOpenBottomAlert(pageData) {
    pageData.winName = api.winName;
    pageData.frameName = api.frameName;
    var tParam = {
        name: "bottom_alert",
        url: 'widget://html/bottom_alert.html',
        useWKWebView: true,
        bgColor: 'rgba(0,0,0,0)',
        rect: {
            x: 0,
            y: 0,
            w: "auto",
            h: "auto"
        },
        pageParam: pageData
    }
    fnOpenFrame(tParam);
}

function fnAdaptationContent(content) {
    var _contentDom = $api.byId(content);
    $api.css(_contentDom, 'width: 100% !important');
    $api.css(_contentDom, 'overflow:hidden !important');
    var contInfo = $api.domAll(_contentDom, "*");
    if (contInfo && contInfo.length > 0) {
        for (var i = 0; i < contInfo.length; i++) {
            $api.css(contInfo[i], 'max-width: 100% !important');
            $api.css(contInfo[i], 'width: auto !important');
            $api.css(contInfo[i], 'margin-left: 0 !important');
            $api.css(contInfo[i], 'margin-right: 0 !important');
            $api.css(contInfo[i], 'transform: inherit');
            $api.css(contInfo[i], 'word-break: break-all !important');
        }
    }
    var contSpan = $api.domAll(_contentDom, "span");
    if (contSpan && contSpan.length > 0) {
        for (var i = 0; i < contSpan.length; i++) {
            $api.css(contSpan[i], 'display: inline');
        }
    }
    var contStrong = $api.domAll(_contentDom, "strong");
    if (contStrong && contStrong.length > 0) {
        for (var i = 0; i < contStrong.length; i++) {
            $api.css(contStrong[i], 'display: inline');
        }
    }
    var contImg = $api.domAll(_contentDom, "img");
    if (contImg && contImg.length > 0) {
        for (var i = 0; i < contImg.length; i++) {
            $api.css(contImg[i], 'width:100% !important;');
            $api.attr(contImg[i], 'width', '100% !important');
            $api.css(contImg[i], 'height:auto !important;');
            $api.attr(contImg[i], 'height', 'auto !important');
            $api.attr(contImg[i], 'alt', '');
        }
    }
    var comTable = $api.domAll(_contentDom, "table");
    if (comTable && comTable.length > 0) {
        for (var i = 0; i < comTable.length; i++) {
            $api.css(comTable[i], 'width:100% !important;');
            $api.attr(comTable[i], 'width', '100% !important');
        }
    }

    var comTd = $api.domAll(_contentDom, "td");
    if (comTd && comTd.length > 0) {
        for (var i = 0; i < comTd.length; i++) {
            $api.css(comTd[i], 'word-wrap: break-word;');
        }
    }
    var comTh = $api.domAll(_contentDom, "th");
    if (comTh && comTh.length > 0) {
        for (var i = 0; i < comTh.length; i++) {
            $api.css(comTh[i], 'word-wrap: break-word;');
        }
    }
}


function fnCheckIsOpenLogin(isOpen) {
    var tCustId = USER.Get('custId', true);
    if (tCustId) {
        console.log(tCustId + "登录状态")
        return true;
    } else {
        console.log("未登录状态");
        if (isOpen == '1') {
            var param = {
                name: 'login',
                url: 'widget://html/login/login.html',
            }
            fnOpenWin(param)
        }
        return false;
    }
}

//放大图片
function fnOpenBigImg(el, i, picList) {
    if (el && el.stopPropagation) {
        el.stopPropagation();
    } else {
        window.event.cancelBubble = true;
    };
    if (picList.length > 0) {
        var tParam = {
            name: 'big_image_win',
            url: '../big_image_win.html',
            pageParam: {
                val: i,
                pic: picList
            }
        }
        fnOpenWin(tParam)
    }
}

function fnVideoEndDom() {

}
function openShareFrame() {
      api.openFrame({
          name: 'share_frm',
          url: '../message/share_frm.html',
          rect: {
              x: 0,
              y: 0,
              w: 'auto',
              h: 'auto'
          },
          bgColor: 'rgba(0,0,0,0.5)' // 设置Frame的透明度

      });
  }
function openNavTabWin() {
    var param = {
        name: 'nav-tab',
        title: 'nav-tab',
        bgColor: '#fff',
        slidBackEnabled: false,
        navigationBar: {
            hideBackButton: false,
            shadow: '#fff',
            leftButtons: [{
                iconPath: 'widget://image/index/back.png'
            }]
        },
        tabBar: {
            height: 49,
            scrollEnabled: false,
            selectedColor: '#2C3540',
            fontWeight: '400',
            background: '#fff',

            animated: true,
            color: '#979EA6',
            fontSize: 10,
            textOffset: 3,
            list: [{
                text: "店内信息",
                iconPath: "widget://image/index/store_tab1.png",
                selectedIconPath: "widget://image/index/store_tab1_sel.png"
            }, {
                text: "课程",
                iconPath: "widget://image/index/store_tab2.png",
                selectedIconPath: "widget://image/index/store_tab2_sel.png"
            }, {
                text: "试听课",
                iconPath: "widget://image/index/store_tab3.png",
                selectedIconPath: "widget://image/index/store_tab3_sel.png"
            }, {
                text: "外教汇",
                iconPath: "widget://image/index/store_tab4.png",
                selectedIconPath: "widget://image/index/store_tab4_sel.png"
            }, {
                text: "品牌形象",
                iconPath: "widget://image/index/store_tab5.png",
                selectedIconPath: "widget://image/index/store_tab5_sel.png"
            }],
            frames: [{
                title: "店铺详情",
                name: "tab_frm_1",
                url: "widget://html/index/store_detail.html"
            }, {
                title: "课程",
                name: "tab_frm_2",
                url: "widget://html/index/store_lession.html"
            }, {
                title: "试听课",
                name: "tab_frm_3",
                url: "widget://html/index/store_audition.html"
            }, {
                title: "外教汇",
                name: "tab_frm_4",
                url: "widget://html/index/store_teachers.html"
            }, {
                title: "品牌形象",
                name: "tab_frm_5",
                url: "widget://html/index/store_image.html"
            }]
        }
    }
    api.openTabLayout(param);

}
