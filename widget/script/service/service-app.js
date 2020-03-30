/********************************************************************************
* writer: SDJ
* create date: 2017-7-15
* description:基础服务类，封装了APP常用的公共方法。如日志打印、AJAX请求、状态提示等
* rewriter: SDJ
* rewrite date: 2017-7-21
* description:
*   1.SERVICE封装中增加了MD5,SHA1 同步加密方法;
*   2.修改了fixStatusBar()中修改对象为header标签;
* rewrite date: 2017-8-5
* description:
*   1.增加图片缓存懒加载方法 fnCacheImage(pEl);

*********************************************************************************/

var _baseIp = 'http://192.168.20.23:8020/cosco-crew';
// var _baseIp = 'http://192.168.20.132:8010/HeartSpace';
// var _baseIp = "http://2b28995n33.iok.la:43490/HeartSpace";
// var _baseIp = "http://192.168.20.23:8010/HeartSpace";
// var _baseIp = "http://52.80.15.168:8081/HeartSpace";


//相机相册权限
function fnHasPermission(callback) {
    var resultList = api.hasPermission({
        list: ['camera', 'photos', 'microphone']
    });
    var result = [];
    for (var i = 0; i < resultList.length; i++) {
        if (!resultList[i]['granted']) {
            result.push(resultList[i]['name']);
        }
    }
    if (result.length > 0) {
        api.requestPermission({
            list: result
        }, function(ret) {
            if (ret && ret.list) {
                var cancle = []
                for (var i = 0; i < ret.list.length; i++) {
                    if (!ret.list[i]['granted']) {
                        cancle.push(ret.list[i]['name']);
                    }
                }
                if (cancle.length > 0) {
                    fnToast('您没有允许相关权限，请允许后继续');
                }
            }
        })
    } else {
        callback && callback();
    }
}

/******************************************
                对象操作方法
******************************************/
//从其他JSON对象中获取JSON对象的属性增加给目标对象（p）

function fnAddAttributesFromOtherObj(pObj, pOtherObj) {
    var tObj = pObj;
    if ('[object Object]' !== Object.prototype.toString.call(pObj) || '[object Object]' !== Object.prototype.toString.call(pOtherObj)) {
        console.log('fnAddAttributesFromOtherObj函数 输入参数类型错误')
        return;
    }
    for (var key in pOtherObj) {
        var tValue = pOtherObj[key];
        if ('[object Object]' === Object.prototype.toString.call(tValue) && '[object Object]' === Object.prototype.toString.call(pObj[key])) {
            tObj[key] = arguments.callee(tObj[key], tValue);
        } else {
            tObj[key] = tValue;
        }
    }
    return tObj;
}

//数组
//获取对象在数组中的索引位置，对象不存在，则返回-1，可间接判断一个对象是否为数组成员
function isInArray(pObj, pArray) {
    if ('[object Array]' !== Object.prototype.toString.call(pArray)) {
        return;
    }
    for (var i = 0; i < pArray.length; i++) {
        if (pObj == self[i]) {
            return i;
        }
    }
    return -1;
}
/******************************************
                UI界面类方法
******************************************/
// });


//修复沉浸式头部高度
function fixStatusBar() {
    var el = document.querySelectorAll('header');
    if (!el) {
        return;
    }
    for (var i = 0; i < el.length; i++) {
        $api.css(el[i], 'padding-top:' + localStorage.safeTop + 'px;');
        // window.headerHeight = el[i].offsetHeight; // 获取header高度
        // window.paddingTop = localStorage.safeTop;
    }

}
//修复沉浸式底部高度
function fixFooterBtn() {
    var el = document.querySelectorAll('footer');
    if (!el) {
        return;
    }
    // localStorage.safeBottom=20;
    for (var i = 0; i < el.length; i++) {
        // var curH = $api.offset(el[i]).h;
        $api.css(el[i], 'padding-bottom:' + localStorage.safeBottom + 'px;');
        // el[i].style.paddingBottom = localStorage.safeBottom + 'px';
    }
}

//窗口加载处理
window.onload = function() {
    fixStatusBar();
    fixFooterBtn();
};
// 获取元素相对于屏幕的rect;
/**
 * 获取元素相对于屏幕的rect;
 * @param  {HTMLElement} pEl    目标元素
 * @param  {HTMLElement} pStopEl [可选，终止条件元素，当遍历父元素与终止条件元素相同是，结束循环]
 * @return {JSON}         元素相对屏幕的rectJSON对象  {x: 10, y: 20, w: 200, h: 100};
 */
function fnGetElRect(pEl, pStopEl) {
    var tEl_x = 0,
        tEl_y = 0,
        tEl_w, tEl_h;
    var tObj = pEl;
    tEl_w = tObj.offsetWidth;
    tEl_h = tObj.offsetHeight;
    while (tObj && tObj != pStopEl) {
        console.log(tObj.nodeName + '----tObj.offsetTop==' + tObj.offsetTop);
        if (tObj.offsetLeft) {
            tEl_x += tObj.offsetLeft;
        }
        if (tObj.offsetTop) {
            tEl_y += tObj.offsetTop;
        }
        tObj = tObj.parentNode;
    }
    return {
        x: tEl_x,
        y: tEl_y,
        w: tEl_w,
        h: tEl_h
    };
}

/**
 * 图片懒加载缓存处理
 * @param  {Object} pEl 页面图片img元素
 * 说明: 在img元素的src路径设置默认的图片，将真正的图片url放入img元素的data-src属性中，同在在img元素中增加onload="fnCacheImage(this);"事件
 *    如 <img onload="fnCacheImage(this);" data-src="{{=it.imgsrc}}" src="../image/defaults/default.jpg" alt="">
 */
function fnCacheImage(pEl) {
    if (!pEl) {
        return;
    }
    var tEl = pEl;
    var tSrc = tEl.dataset.src;
    // LOG('fnCacheImage src=='+tSrc);
    if (!tSrc || tSrc == 'null' || tSrc == 'undefined') {
        return;
    }
    api.imageCache({
        url: tSrc,
        thumbnail: false,
    }, function(ret, err) {
        tEl.src = ret.url;
        tEl.onload = null;
    });

}

function fnCacheImg(el, tSrc) {
    // $api.css(_domImg, 'background-image:url(../../image/page/video.png);');
    if (!tSrc) {
        return;
    }
    api.imageCache({
        url: tSrc,
        thumbnail: false,
    }, function(ret, err) {
        var _domImg = $api.closest(el, '.loadCImg');
        $api.css(_domImg, 'background-image:url(' + ret.url + ') !important;');
    });

}


// 等待状态提示
function Loading() {
    var _UILoading = api.require("UILoading");
    var _id;
    var _content = [];
    for (var i = 1; i < 30; i++) {
        var tPath = 'widget://image/loading/' + i + '.png';
        _content.push({
            'frame': tPath
        });
    }
    this.Show = function() { //自定义动画
        _UILoading.keyFrame({
            rect: {
                w: 80,
                h: 80
            },
            styles: {
                bg: 'rgba(169,169,169,0)',
                corner: 0,
                interval: 40,
                frame: {
                    w: 80,
                    h: 80
                }
            },
            content: _content,
            mask: 'rgba(0,0,0,0)'
        }, function(ret) {

        });
    };
    this.Close = function() {
        _UILoading.closeKeyFrame();
    }
}
// 系统提示框
function fnAlert(pParamJSON, pCallBack) {
    if ('[object Object]' !== Object.prototype.toString.call(pParamJSON)) {
        return;
    }
    var tTitle = pParamJSON.title ? pParamJSON.title : '系统提示';
    var tMsg = pParamJSON.msg ? pParamJSON.msg : '';

    api.alert({
        title: tTitle,
        msg: tMsg,
    }, function(ret, err) {
        if ('function' == typeof pCallBack) {
            pCallBack();
        }
    });
}

// 下载刷新方法封装（使用UIPullRefreshFlash模块）
function fnAddHeaderRefreshingEvent(pCallBack) {
    console.log(22)
    var _content = [];
    for (var i = 1; i < 30; i++) {
        var tPath = 'widget://image/loading/' + i + '.png';
        _content.push(tPath);
    }
    var _loadContent = _content.reverse()
    api.setCustomRefreshHeaderInfo({
        bgColor: 'rgba(0,0,0,0)',
        image: {
            pull: _content,
            load: _loadContent
        }
    }, function(ret, err) {
        if ('function' === typeof pCallBack) {
            pCallBack();
        }
    });
}

function fnAddHeaderRefreshingEventIndex(pCallBack) {
    console.log(22)
    var _content = [];
    for (var i = 1; i < 36; i++) {
        var tPath = 'widget://image/loading/' + i + '.png';
        _content.push(tPath);
    }
    var _loadContent = _content.reverse()
    api.setCustomRefreshHeaderInfo({
        bgColor: 'rgba(0,0,0,0)',
        image: {
            pull: _content,
            load: _loadContent
        }
    }, function(ret, err) {
        if ('function' === typeof pCallBack) {
            pCallBack();
        }
    });
}
// 上拉加载方法封装
function fnAddFooterLoadingEvent(pCallBack) {
    api.addEventListener({
        name: 'scrolltobottom',
        extra: {
            threshold: 100 //设置距离底部多少距离时触发，默认值为0，数字类型
        }
    }, function(ret, err) {
        if ('function' === typeof pCallBack) {
            pCallBack();
        }
    });
}

var DURATION = 300; //窗口动画持续时间

function fnOpenWin(pParamJSON) {
    var _conf = {
        scrollToTop: false,
        vScrollBarEnabled: false,
        hScrollBarEnabled: false,
        slidBackEnabled: true,
        useWKWebView: true,
        bounces: false,
        animation: {
            type: "none",
            subType: "from_right",
            duration: DURATION
        },
        delay: 0,
        reload: true,
        slidBackType: 'edge'
    };
    if ('[object Object]' == Object.prototype.toString.call(pParamJSON)) {
        fnAddAttributesFromOtherObj(_conf, pParamJSON);
    }
    api.openWin(_conf);
}

function fnOpenFrame(pParamJSON) {
    var frameY = 0;
    if (window.headerHeight) {
        frameY = window.headerHeight;
    }
    var _conf = {
        rect: {
            x: 0,
            y: frameY,
            w: 'auto',
            h: 'auto'
        },
        scrollToTop: false,
        vScrollBarEnabled: false,
        hScrollBarEnabled: false,
        bounces: false,
        useWKWebView: true,
        animation: {
            type: "none",
            subType: "from_right",
            duration: DURATION,
        },
        delay: 0,
        reload: true
    };
    if ('[object Object]' == Object.prototype.toString.call(pParamJSON)) {
        // LOG('fnOpenUniversalWin=>fnOpenWin====3');
        fnAddAttributesFromOtherObj(_conf, pParamJSON);
    }
    // LOG('fnOpenUniversalWin=>fnOpenWin====4  conf===='+JSON.stringify(_conf));
    api.openFrame(_conf);
}

function fnOpenFrameGroup(pParamJSON, pCallback) {
    var frameY = 0;
    if (window.headerHeight) {
        frameY = window.headerHeight;
    }
    var _conf = {
        scrollEnabled: true,
        rect: {
            x: 0,
            y: frameY,
            w: 'auto',
            h: 'auto'
        },
        index: 0,
    };
    if ('[object Object]' == Object.prototype.toString.call(pParamJSON)) {
        fnAddAttributesFromOtherObj(_conf, pParamJSON);
    }
    LOG('fnOpenFrameGroup _conf==' + JSON.stringify(_conf));
    api.openFrameGroup(_conf, function(ret, err) {
        if ('function' === typeof pCallback) {
            pCallback(ret, err);
        }
    });
}
/**
 * 以默认的通用Win模版方式打开Win
 * @param  {JSON} pParamJSON  必填，打开默认win需要的配置参数
 *                pParamJSON = {
 *                    name: 'login',           //Win名称,默认‘default_win’
 *                    title: '登录',            //Win 导航条中间页面标题
 *                    // Win打开Frame时，需要额外设置的openFrame属性
                      url: './login_frame.html',  //Win启动后打开的Frame地址,默认 './'+api.winName+'_frame.html'
 *                    slidBackEnabled: false,
 *                    reload: true,
 *
 *                }
 */
function fnOpenUniversalWin(pParamJSON) {
    if ('[object Object]' !== Object.prototype.toString.call(pParamJSON)) {
        return;
    }
    var tName = pParamJSON.winName ? pParamJSON.winName : 'default_win';
    var tParam = {
        name: tName,
        url: 'widget://html/default_win.html',
        pageParam: {
            title: pParamJSON.title,
            attributes: pParamJSON
        }
    }
    fnOpenWin(tParam);
}
// 延迟1000秒关闭win窗口
function fnDelayCloseWin(pDelayTime, pName) {
    var tName = pName;
    var tDuration = 0;
    if ('number' === typeof pDelayTime) {
        tDuration = pDelayTime;
    }
    setTimeout(function() {
        api.closeWin({
            name: tName,
            animation: {
                type: 'none'
            }
        });

    }, tDuration);
}

function fnDelayCloseFrame(pName, pDelayTime) {
    var tName = pName;
    var tDuration = 0;
    if ('number' === typeof pDelayTime) {
        tDuration = pDelayTime;
    }
    setTimeout(function() {
        api.closeFrame({
            name: tName,
            animation: {
                type: 'none'
            }
        });

    }, tDuration);
}

/**
 * 以frame方式打开sheet模版
 * @param  {JSON} pParamJSON  必填，打开默认win需要的配置参数
 *                pParamJSON = {
 *                    title: '登录',               //选填，字符串，sheet标题栏标题
                      buttons: ['男'，'女'],       //必填，数组格式，sheet按钮区按钮内容
                      name: 'select_frame',       //选填，打开的frameName
                      cb_win: api.winName,        //选填，字符串，回调函数所在win
                      cb_frm: api.frameName,      //选填，字符串，回调函数所在frame
                      cb_fun: 'fnSheetCallback'   //必填，字符串，回调函数的函数名称.fnSheetCallback(pIndex);
                                                            // index     //按钮点击返回值，数组对应按钮点击事件,0对应数组按钮的0
 *                    default: 0,     //选填，数值，启动后默认高亮的按钮
 *                }
 */
function fnOpenSheet(pParamJSON) {
    var tName = pParamJSON.name ? pParamJSON.name : 'sheet';
    api.openFrame({
        name: tName,
        url: 'widget://html/template_sheet.html',
        bgColor: 'rgba(0,0,0,0)',
        animation: {
            type: 'movein',
            subType: 'from_bottom'
        },
        pageParam: pParamJSON
    });
}
/**
 * 以frame方式打开日期选择器模版
 * @param  {JSON} pParamJSON  必填，打开默认win需要的配置参数
 *                pParamJSON = {
 *                    title: '登录',               //选填，字符串，日期选择器页面标题栏标题
 *                    name: 'data_selector',      //选填，字符串，日期选择器页面frame名
                      cb_win: api.winName,        //回调函数所在win;
                      cb_frm: api.frameName,      //回调函数所在frame
                      cb_fun: 'fnSelectedCallback'             //必填，字符串，回调函数的函数名称.fnSelectedCallback(year,month,date);
                                                               // index     //按钮点击返回值，数组对应按钮点击事件,0对应数组按钮的0
 *                    default: '2017-08-21',      //选填，字符串，默认的选择日期
 *                    minNum: '1999-12-14',       //选填，字符串，限制的最小日期数值
 *                    maxNum: '2017-08-21',       //选填，字符串，限制的最大日期数值
 *                }
 */
function fnOpenDateSelector(pParamJSON) {
    var tName = pParamJSON.name ? pParamJSON.name : 'data_selector';
    api.openFrame({
        name: tName,
        url: 'widget://html/template_selector_date.html',
        bgColor: 'rgba(0,0,0,0)',
        animation: {
            type: 'movein',
            subType: 'from_bottom'
        },
        pageParam: pParamJSON
    });
}

/******************************************
                底层服务类方法
******************************************/

//服务API
var DEBUG = true;
//日志函数
function LOG(pString) {
    if (DEBUG) {
        console.log('【' + api.winName + '__' + api.frameName + '】:' + pString);
    }
}

//安卓keyBack 快速点击二次退出APP
function ExitAppByKeyBack2() {
    var BACKSTATUS = false;
    api.addEventListener({
        name: 'keyback'
    }, function(ret, err) {
        if (BACKSTATUS) {
            api.closeWidget({
                silent: true
            });
        } else {
            BACKSTATUS = true;
            api.toast({
                msg: '再按一次退出APP',
                duration: 1500,
                location: 'bottom',
                global: true,
            });
        }
        setTimeout(function() {
            BACKSTATUS = false;
        }, 1500);
    });
}

//AJAX请求封装
function SERVICE(_def) {
    if (_def != '0') {
        addNaviNotification();
    }
    //内部作用域内全局变量
    var _service = {};
    // var tBaseUrl = api.getPrefs({
    //     key: 'baseUrl',
    //     sync: true
    // var _baseUrl = "http://" + _baseIp + "/travel-background/api/";
    var _baseUrl = _baseIp + "/sp/";


    //加密模块
    var _mSignature = api.require('signature');
    //设备信息
    // var _reqID = api.loadSecureValue({ key: 'appId' , sync: true });
    // var _reqKey = api.loadSecureValue({ key: 'appKey' , sync: true });
    var _reqID = 'A6064348222570';
    var _reqKey = '38AED176-67A5-6BCB-CE60-AB0C011DE017';
    var _custId = ""

    /*  进度状态显示  */
    var _loading = new Loading();
    _service.ShowProgress = function() {
        _loading.Show();
    }
    _service.CloseProgress = function() {
        _loading.Close();
    }

    /**
     * [save 保存数据到本地缓存]
     * @param  {[String]} pkey  [键名]
     * @param  {[JSON/String]} pData [键值，JSON格式或字符串格式]
     * @return {[无]}       [返回值：无]
     */
    _service.Save = function(pkey, pData) {
        var tData = pData;
        if ('object' === typeof pData) {
            tData = JSON.stringify(pData)
        }
        api.setPrefs({
            key: pkey,
            value: tData
        });
    }

    /**
     * [Load 从本地缓存读取数据]
     * @param  {[String]} pkey [数据缓存时的键名]
     * @return {[JSON]}      [JSON格式的数据对象或空字符串]
     */
    _service.Load = function(pkey) {
        var tDataStr = api.getPrefs({
            sync: true,
            key: pkey
        });
        var tData = '';
        if (tDataStr) {
            tData = JSON.parse(tDataStr);
        }
        return tData;
    }

    _service.SHA1 = function(pValue) {
        if ('string' != typeof pValue) {
            return '';
        } else {
            var tEncryptStr = _mSignature.sha1Sync({
                data: pValue
            });
            return tEncryptStr;
        }
    }

    _service.MD5 = function(pValue) {
            if ('string' != typeof pValue) {
                return '';
            } else {
                var tEncryptStr = _mSignature.md5Sync({
                    data: pValue
                });
                return tEncryptStr;
            }
        }
        //MD5小写加密
    _service.MD5S = function(pValue) {
        if ('string' != typeof pValue) {
            return '';
        } else {
            var tEncryptStr = _mSignature.md5Sync({
                data: pValue,
                uppercase: false
            });
            return tEncryptStr;
        }
    }

    //网络请求服务部分

    //获取请求头
    function _getHeaders(pHeader) {
        _custId = USER.Get("custId", true) || '';
        var tNow = new Date().getTime() + '';
        var tReqKeyStr = _reqID + 'UZ' + _reqKey + 'UZ' + tNow;
        //通用接口加密key
        var tReqKey = _mSignature.sha1Sync({
            data: tReqKeyStr,
            uppercase: true
        });

        // LOG('加密前str==' + tReqKeyStr +'____加密后 str==' + tReqKey);

        var tHeaders = {
            "reqID": _reqID,
            "reqDate": tNow,
            "reqKey": tReqKey,
            'custId': _custId,
            'userType': '2',
            'Content-Type': 'application/json',
            'termId': api.deviceId
        };
        // api.deviceId ||
        // var _str = Math.floor(Math.random() * 1000 + 1) + '';
        var tUser = api.getPrefs({
            key: 'userInfo',
            sync: true
        });
        if (tUser) {
            var tUserJSON = JSON.parse(tUser);
            var tUID = tUserJSON.custId;
            var tToken = tUserJSON.tokenId;
            var tTokenStr = tUID + 'UZ' + tToken + 'UZ' + tNow;
            var tTokenKey = _mSignature.sha1Sync({
                data: tTokenStr
            });
            tHeaders.UID = tUID;
            tHeaders.Token = tTokenKey;
        }

        return tHeaders;
    }

    //响应参数统一异常处理
    function _exceptionHanding(ret, err, pCallback) {
        var _callback = function() {};
        if ('function' === typeof pCallback) {
            _callback = pCallback;
        }
        //首先判断请求成功或失败
        if (ret) {
            if (ret.errcode) {
                if (ret.errcode == '5001' || ret.errcode == '888') {
                    ret.status = "200";
                    ret.data = {
                        errorStatus: ret.errcode,
                    }
                } else {
                    fnToast(ret.errmsg);
                    _callback(ret, err);
                }
            }
            var tStatus = ret.status;
            if ('object' !== typeof(ret.data)) {
                ret.data = {};
            }
            var first_reboot = api.getPrefs({
                key: 'first_reboot',
                sync: true
            });
            if (tStatus == "200" && ret.data.errorStatus && ret.data.errorStatus == '109') {
                ret.status = ret.data.errorStatus;
                _callback(ret, err);
                return;
            }
            if (tStatus == "200" && ret.data.errorStatus && ret.data.errorStatus !== '888' && ret.data.errorStatus !== '5001') {
                ret.status = "";
                fnToast(ret.data.errorMessage);
                _callback(ret, err);
                return;
            }
            if (ret.data && (ret.data.errorStatus == '888' || ret.data.errorStatus == '5001')) {
                ret.status = "";
                tStatus = ret.data.errorStatus;
            }
            switch (tStatus) {
                case '200': // 请求成功
                    _callback(ret, err);
                    break;
                case '400': // 请求失败
                    _callback(ret, err); //服务器成功响应（正确或错误的回调）
                    break;
                case '404': // 权限认证失败
                case '4001': // token失效
                    _callback(); //无响应参数回调，仅供回调方法执行一些需要回调触发的逻辑，如关闭progress，按钮点击状态等
                    if (USER.Get('custId', true) && first_reboot == '1') {
                        api.setPrefs({
                            key: 'first_reboot',
                            value: '0'
                        });
                        USER.Clear();
                        api.alert({
                            title: '系统提示',
                            msg: '需重新登录',
                        }, function(ret, err) {
                            if (ret) {
                                //退出
                                USER.Clear();

                                // api.rebootApp();
                                var tParam = {
                                    name: 'login',
                                    url: 'widget://html/login/login.html',
                                    allowEdit: true,
                                }
                                fnOpenWin(tParam);
                            } else {
                                console.log(JSON.stringify(err));
                            }
                        });
                    }
                    break;
                case '888': // 封禁用户
                    // _callback(); //无响应参数回调，仅供回调方法执行一些需要回调触发的逻辑，如关闭progress，按钮点击状态等
                    if (first_reboot == '1') {
                        api.setPrefs({
                            key: 'first_reboot',
                            value: '0'
                        });
                        api.alert({
                            title: '系统提示',
                            msg: ret.data.errorMessage || '该账号已被封禁，请联系平台',
                        }, function(ret, err) {
                            if (ret) {
                                //退出
                                if (api.winName != 'quick_login' || api.winName != 'login') {
                                    USER.Clear();
                                    api.rebootApp();
                                }
                            } else {
                                console.log(JSON.stringify(err));
                            }
                        });
                    }
                    break;
                case '5001': // 封禁用户
                    // _callback(); //无响应参数回调，仅供回调方法执行一些需要回调触发的逻辑，如关闭progress，按钮点击状态等
                    if (first_reboot == '1') {
                        api.setPrefs({
                            key: 'first_reboot',
                            value: '0'
                        });
                        api.alert({
                            title: '系统提示',
                            msg: '账号在另一处登录',
                        }, function(ret, err) {
                            if (ret) {
                                //退出
                                USER.Clear();
                                api.rebootApp();
                                // var winName = deepCopy(api.winName);
                                // setTimeout(function() {
                                //     api.closeWin({
                                //         name: winName
                                //     });
                                // });
                                var tParam = {
                                    name: 'login',
                                    url: 'widget://html/login/login.html',
                                    allowEdit: true,
                                }
                                fnOpenWin(tParam);
                            } else {
                                console.log(JSON.stringify(err));
                            }
                        });
                    }
                    break;
                case '4002': // token失效
                    _callback(); //无响应参数回调，仅供回调方法执行一些需要回调触发的逻辑，如关闭progress，按钮点击状态等
                    if (USER.Get('custId', true)) {
                        USER.Clear();
                        api.alert({
                            title: '系统提示',
                            msg: '需重新登录',
                        }, function(ret, err) {
                            if (ret) {
                                //退出
                                USER.Clear();

                                api.rebootApp();
                            } else {
                                console.log(JSON.stringify(err));
                            }
                        });
                    }
                    break;
                case '500':
                    ret.data.errorStatus = '500';
                    ret.data.errorMessage = '服务器错误，请稍后再试';
                    _callback(ret, err);
                    break;
                default:
                    //其他未知错误
                    ret.data.errorStatus = tStatus;
                    ret.data.errorMessage = '本次请求失败，请稍后再试';
                    _callback(ret, err);
                    break;
            }
        } else {
            _callback(ret, err); //回调方法中无须再对err错误进行解析，再本函数方法中统一执行，仅执行一些需要回调触发的逻辑，如关闭progress，按钮点击状态等即可
            var errMsg = !!(err && err.msg) ? err.msg : '请求失败，请稍后再试';
            if (err) {
                if (err.code == 0) {
                    api.toast({
                        msg: "网络无法连接，请检查网络配置",
                        duration: 2000,
                        location: 'bottom',
                        global: true,
                    });
                } else {
                    api.toast({
                        msg: "网络不稳定，请稍后再试",
                        duration: 2000,
                        location: 'bottom',
                        global: true,
                    });
                }
            }
            var $S = SERVICE();
            $S.CloseProgress();
            api.refreshHeaderLoadDone();

        }
    }

    //基础通用请求方法封装
    function fnRequestData(pPartUrl, pHeaders, pMethod, pData, pCallback) {
        var tUrl = _baseUrl + pPartUrl;
        var tHeaders = pHeaders ? pHeaders : _getHeaders();
        var tAjax = {
            url: tUrl,
            method: pMethod,
            headers: tHeaders,
            data: pData,
            timeout: 15
        }

        // LOG('AJAX' + pMethod + '请求：URL=' + tUrl + '____headers=' + JSON.stringify(tHeaders) + '____data=');
        var tCode = api.ajax(tAjax, function(ret, err) {
            LOG('AJAX请求:\n' + JSON.stringify(tAjax) + '\n返回结果:' + '\n成功响应数据:' + JSON.stringify(ret) + '\n失败响应数据:' + JSON.stringify(err));
            _exceptionHanding(ret, err, pCallback);
        });
    }

    /**
     * [POST POST方法,不发送文件]
     * @param {[type]} pPartUrl  [必填，部分请求路径]
     * @param {[type]} pValues   [选填，请求参数对象]
     * @param {[type]} pCallback [选填，回调函数]
     * @param {[type]} pSet      [选填，补充请求设置参数]
     */
    _service.POST = function(pPartUrl, pValues, pCallback) {
        //请求参数
        var tData = '';
        if (pValues != "") {
            pValues = JSON.stringify(pValues)
        }
        if ('object' == typeof pValues) {
            // tData = {
            //     values: pValues
            // }
            tData = pValues;
        } else if ('string' == typeof pValues && pValues.length) {
            tData = {
                body: pValues
            };
        }

        fnRequestData(pPartUrl, '', 'post', tData, pCallback)
    }

    /**
     * [POST POST方法,含发送文件]
     * @param {[type]} pPartUrl  [必填，部分请求路径]
     * @param {[type]} pValues   [选填，请求参数对象]
     * @param {[type]} pCallback [选填，回调函数]
     * @param {[type]} pSet      [选填，补充请求设置参数]
     */
    _service.POSTFiles = function(pPartUrl, url, pCallback, pSet) {
        //请求参数
        var tData = {};

        tData = {
            // body: JSON.stringify(pValues),
            files: {
                file: url
            }
        };
        fnRequestData2(pPartUrl, '', 'post', tData, pCallback, pSet);
        //上传图片请求
        function fnRequestData2(pPartUrl, pMethod, pData, pCallback, pSet) {
            var tUrl = _baseUrl + pPartUrl;
            var tHeaders = _getHeaders();
            delete tHeaders["content-Type"];
            var tAjax = {
                    url: tUrl,
                    method: pMethod,
                    headers: tHeaders,
                    data: pData,
                    timeout: 45
                }
                //自定义AJAX请求设置（JSON格式）
            if (pSet) {
                for (var key in pSet) {
                    tAjax[key] = pSet[key];
                }
            }
            LOG("tAjax====" + JSON.stringify(tAjax));
            // LOG('AJAX' + pMethod + '请求：URL=' + tUrl + '____headers=' + JSON.stringify(tHeaders) + '____data=');
            var tCode = api.ajax(tAjax, function(ret, err) {
                api.hideProgress();
                LOG('AJAX' + pMethod + '请求：URL=' + tUrl + '返回结果:' + '__ret=' + JSON.stringify(ret) + '__err' + JSON.stringify(err));
                _exceptionHanding(ret, err, tAjax, pCallback);
            });
        }
    }


    /*
     * [POST 便利GET方法]
     * @param {[String]} pPartUrl  [必填，部分请求路径]
     * @param {[Function]} pCallback [回调函数function(ret,err){}]
     */
    _service.GET = function(pPartUrl, pCallback) {
        fnRequestData(pPartUrl, '', 'get', '', pCallback);
    }
    return _service;
}

function dotList(element, dotelement, datainner) {
    console.log(JSON.stringify(datainner))
        //获取容器元素
    var elements = document.getElementById(element);
    //获取dot script元素
    var dots = document.getElementById(dotelement);

    var interText = doT.template($api.html(dots));
    $api.append(elements, interText(datainner))
}

//修改状态栏样式
function fixStatusBarStyle() {
    api.setStatusBarStyle({
        style: 'dark',
        color: 'rgba(0,0,0,0)',
    });
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


 

//匹配图片尺寸
function fnImg(cla, w, h, type) {
    var _image = $api.domAll("." + cla);
    if (type == "1") { //通过宽设置高
        if (_image.length > 0) {
            var _width = $api.offset(_image[0]).w;
            var _height = Math.round(_width * 1 / w * h)
            console.log(_width + "----")
            console.log(_height + "----")
            for (var i = 0; i < _image.length; i++) {
                $api.css(_image[i], 'height:' + _height + 'px;');
            }
        }
    } else if (type == "2") { //通过高设置宽

        if (_image.length > 0) {
            var _height = $api.offset(_image[0]).h;
            var _width = Math.round(_height * 1 / h * w)
            console.log(_width)
            for (var i = 0; i < _image.length; i++) {
                $api.css(_image[i], 'width:' + _width + 'px;');
                $api.attr(_image[i], 'src');

                //       if(ret.url.indexOf("lvyoujia")!="-1"){
                //         tEl.src = ret.url+"?x-oss-process=image/resize,m_fill,h_540,w_720,limit_0";
                // }
            }
        }
    }


}
//倒计时
function fnVerifyTimeJs(el, way, time) {
    console.log("开启倒计时")
    var _time;
    if (time && time != "") {
        _time = time;
    } else {
        _time = 60;
    }
    var timer = setInterval(function() {
        if (_time > 0) {
            _time--;
            $api.text(el, "重新获取" + _time + "s");
        } else {
            clearInterval(timer);
            $api.attr(el, 'onclick', way);
            $api.text(el, '重新获取');
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
//获取input框的val值
function fnInputVal(id) {
    var _val = $api.val($api.byId(id));

    return _val;
}


//判断是否登录
function fnCheckUserStatus() {

    var tCustId = USER.Get('custId', true);
    if (tCustId) {
        console.log(tCustId + "登录状态")
        return true;
    } else {
        console.log("未登录状态")
        return false;
    }
}

function fnCheckIsLogin() {
    if (fnCheckUserStatus()) {
        return true;
    } else {
        // fnToast("您还未登录");
        return false;
    }
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



//调取相册
function uploadPicture(max, pCallback) {
    var UIAlbumBrowser = api.require('UIAlbumBrowser');
    if (api.systemType == "ios") {
        UIAlbumBrowser.requestAlbumPermissions({}, function(ret1, err) {
            if (ret1.isAccessPermissions) {
                UIAlbumBrowser.open({
                    max: max,
                    type: "image",
                    isOpenPreview: false,
                    classify: false,
                    styles: {
                        bg: '#fff',
                        mark: {
                            icon: 'widget://image/yxz.png',
                            position: 'top_right',
                            size: 16
                        },
                        nav: {
                            bg: '#fff',
                            titleColor: '#000',
                            titleSize: 18,
                            cancelColor: '#000',
                            cancelSize: 16,
                            finishColor: '#000',
                            finishSize: 16
                        },
                        bottomTabBar: {
                            bg: '#fff',
                        }
                    },
                    rotation: true
                }, function(ret) {
                    if (ret.eventType == "confirm") {
                        pCallback(ret);
                    }
                });
            }
        });
    } else {
        UIAlbumBrowser.open({
            max: max,
            type: "image",
            isOpenPreview: false,
            classify: false,
            styles: {
                bg: '#fff',
                mark: {
                    icon: 'widget://image/yxz.png',
                    position: 'top_right',
                    size: 16
                },
                nav: {
                    bg: '#fff',
                    titleColor: '#000',
                    titleSize: 18,
                    cancelColor: '#000',
                    cancelSize: 16,
                    finishColor: '#000',
                    finishSize: 16
                }
            },
            rotation: true
        }, function(ret) {
            if (ret.eventType == "confirm") {
                pCallback(ret);
            }
        });
    }
};


//调取相册
function uploadVideo(max, pCallback) {
    var UIAlbumBrowser = api.require('UIAlbumBrowser');
    if (api.systemType == "ios") {
        UIAlbumBrowser.requestAlbumPermissions({}, function(ret1, err) {
            if (ret1.isAccessPermissions) {
                UIAlbumBrowser.open({
                    max: max,
                    type: "video",
                    isOpenPreview: false,
                    classify: false,
                    styles: {
                        bg: '#fff',
                        mark: {
                            icon: 'widget://image/yxz.png',
                            position: 'top_right',
                            size: 16
                        },
                        nav: {
                            bg: '#fff',
                            titleColor: '#000',
                            titleSize: 18,
                            cancelColor: '#000',
                            cancelSize: 16,
                            finishColor: '#000',
                            finishSize: 16
                        }
                    },
                    rotation: true
                }, function(ret) {
                    if (ret.eventType == "confirm") {
                        pCallback(ret);
                    }
                });
            }
        });
    } else {
        UIAlbumBrowser.open({
            max: max,
            type: "video",
            isOpenPreview: false,
            classify: false,
            styles: {
                bg: '#fff',
                mark: {
                    icon: 'widget://image/yxz.png',
                    position: 'top_right',
                    size: 16
                },
                nav: {
                    bg: '#fff',
                    titleColor: '#000',
                    titleSize: 18,
                    cancelColor: '#000',
                    cancelSize: 16,
                    finishColor: '#000',
                    finishSize: 16
                }
            },
            rotation: true
        }, function(ret) {
            if (ret.eventType == "confirm") {
                pCallback(ret);
            }
        });
    }
};


//图片路径转换（ios专用）
function fnQiniuTrashPath(pList, pCallback) {
    var $S = SERVICE();
    $S.ShowProgress()
    var UIAlbumBrowser = api.require('UIAlbumBrowser');
    var PHOTO = [];
    for (var i = 0; i < pList.length; i++) {
        console.log(JSON.stringify(pList))
        UIAlbumBrowser.transPath({
            path: pList[i].path
        }, function(ret, err) {
            console.log(JSON.stringify(ret))
            if (ret) {
                console.log(JSON.stringify(pList))
                PHOTO.push({
                    path: ret.path
                });
                console.log(JSON.stringify(PHOTO));
                if (PHOTO.length == pList.length) {
                    $S.CloseProgress();
                    pCallback(PHOTO);
                }
            } else {
                console.log('图片路径转换失败')
            }
        });
    }
}

//压缩图片
function fnCompress(imgs, pCallBack) {
    // pCallBack(imgs);
    imgs = imgs.split(",");

    var locationArr = [];
    var _imgPic = [];
    var _imagePic = [];
    for (var i = 0; i < imgs.length; i++) {
        if (imgs[i].indexOf('http') >= 0) {
            var key = {
                i: i,
                path: imgs[i]
            }
            locationArr.push(key);
            _imgPic.push(imgs[i])
        } else {
            var fs = api.require('fs');
            var imgSizeJson = fs.getAttributeSync({
                path: imgs[i]
            });
            var imgSize = imgSizeJson.attribute.size;
            if (imgSize < (2 * 1024 * 1024)) {
                var key = {
                    i: i,
                    path: imgs[i]
                }
                locationArr.push(key);
                _imgPic.push(imgs[i])
            } else {
                _imagePic.push(imgs[i])
            }
        }
    }
    var pic;
    if (_imagePic.length > 0) {
        var compactPicture = api.require('compactPicture');
        compactPicture.HittingPic({
            picpatharray: _imagePic,
            size: 5
        }, function(ret) {
            for (var i = 0; i < locationArr.length; i++) {
                ret.states.splice(locationArr[i].i, 0, locationArr[i].path);
            }
            pic = ret.states.toString();
            console.log(imgs + "----" + pic);
            pCallBack(pic)
        });
    } else {
        pic = _imgPic.toString();
        pCallBack(pic)
    }


}

function fnCompressAvatar(imgs, pCallBack) {
    imgs = imgs.split(",");

    var locationArr = [];
    var _imgPic = [];
    var _imagePic = [];
    for (var i = 0; i < imgs.length; i++) {
        if (imgs[i].indexOf('http') >= 0) {
            var key = {
                i: i,
                path: imgs[i]
            }
            locationArr.push(key);
            _imgPic.push(imgs[i])
        } else {
            _imagePic.push(imgs[i])
        }
    }
    var pic;
    if (_imagePic.length > 0) {
        var compactPicture = api.require('compactPicture');
        compactPicture.HittingPic({
            picpatharray: _imagePic,
            size: 6
        }, function(ret) {
            for (var i = 0; i < locationArr.length; i++) {
                ret.states.splice(locationArr[i].i, 0, locationArr[i].path);
            }
            pic = ret.states.toString();
            console.log(imgs + "----" + pic);
            pCallBack(pic)
        });
    } else {
        pic = _imgPic.toString();
        pCallBack(pic)
    }


}


function fnIsCurDate(commentTime) {
    var tDate = new Date();
    var year = tDate.getFullYear();
    var month = tDate.getMonth() + 1;
    var day = tDate.getDate();
    if (month < 10) {
        month = '0' + month;
    }
    var curDate = year + '-' + month + '-' + day;
    if (commentTime.substr(0, 10) == curDate)
        return '今天' + commentTime.substr(10);
    else
        return commentTime.substr(0, 10);
}
///n换br
function fnReplaceBr(val) {
    var _val = val.replace(/<br\/>/g, "");
    return _val.replace(/(\r\n)|(\n)/g, "<br/>")
}



function fnOpenFrameA(href) {
    var urlHref = /^((ht|f)tps?):\/\/([\w\-]+(\.[\w\-]+)*\/)*[\w\-]+(\.[\w\-]+)*\/?(\?([\w\-\.,@?^=%&:\/~\+#]*)+)?/;
    if (href == "" && !urlHref.test(href)) {
        return;
    }
    var tParam = {
        name: 'advert_win',
        url: './advert_win.html',
        delay: 300,
        pageParam: {
            title: "",
            href: href
        },
        useWKWebView: true,
        progress: {
            type: "default",
        }
    }
    fnOpenWin(tParam)
}

/**
 * [POST POST方法,不发送文件]
 * @param {[string]} api_name  [必填，部分请求路径]
 * @param {[object]} params   [选填，请求参数对象]
 * @param {[function]} callback [选填，回调函数]
 * @param {[function]} error [选填，是否统一异常处理]
 */
function POST(api_name, params, callback, error) {
    // $S.ShowProgress();
    var _callback = function(res) {
        // try {
        var statusCode = res.errcode || res.status;
        res.status = statusCode;
        $S.CloseProgress();
        if (statusCode == 200) {
            callback(res.data);
        } else {
            var errorMsg = res.errmsg || res.errorMessage || null;
            res.errorMsg = errorMsg;
            if (error) {
                error(res);
            } else {
                if (errorMsg && errorMsg.indexOf("java") == -1 && errorMsg.indexOf("参数") == -1) {
                    appToast(errorMsg);
                }
            }
        }
        // } catch (e) {
        //     appToast('系统繁忙');
        //     $S.CloseProgress();
        // }
    }
    $S.POST(api_name, (params || {}), _callback);
}

//delay toast提示，且关闭当前window
function appToast(errorMsg, delay) {
    api.toast({
        msg: errorMsg,
        duration: 1800,
        location: 'bottom',
        global: true,
    });
    if (delay) {
        setTimeout(function() {
            api.closeWin();
        }, delay)
    }
}

// 阻止事件冒泡和默认行为
function fnStopPropagation(e) {
    if (!e) return;
    // 冒泡
    window.event ? window.event.cancelBubble = true : e.stopPropagation();
    // 默认行为
    if (typeof e.preventDefault === 'function') {
        // 非IE
        e.preventDefault();
    } else { // IE
        e.returnValue = false;
    }
}

// 是否为空
function isEmpty(sender) {
    var result = false;
    if (sender === null || sender === undefined || sender === '') {
        result = true;
    }
    return result;
}

// 简单深拷贝
function deepCopy(sender) {
    var result;
    if (typeof sender === 'object') {
        result = JSON.parse(JSON.stringify(sender));
    } else if (typeof sender === 'string') {
        result = sender + '';
    } else {
        result = sender;
    }
    return result;
}

// 去除空项
function cleanEmpty(sender) {
    var temp = deepCopy(sender || []);
    var data = [];
    for (var i = 0; i < temp.length; i++) {
        var item = temp[i];
        if (item !== null && item !== undefined && item !== '' && item != 'null' && item != 'undefined') {
            data.push(item);
        }
    }
    return data;
}

// 给listmap批量设置属性值
function setPropertyInArray(array, key, value) {
    array = deepCopy(array || []);
    if (key) {
        value = value !== undefined ? value : '';
        for (var i = array.length - 1; i >= 0; i--) {
            array[i][key] = value;
        }
    }
    return array;
}
// 批量获取array的值
function getValueInArray(array, key, joinSign) {
    array = deepCopy(array || []);
    joinSign = joinSign !== undefined ? joinSign : ',';
    var result = [];
    if (key) {
        for (var i = array.length - 1; i >= 0; i--) {
            result.push(array[i][key]);
        }
    }
    return result.join(joinSign);
}

function findIndexInArray(array, key, value) {
    var index = -1;
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] == value) {
            index = i;
            break;
        }
    }
    return index;
}

// share 分享 option 三个点
var rightBtnMap = {
    'share': {
        iconPath: 'widget://image/nav_share.png'
    },
    'option': {
        text: '', //（可选项）按钮标题文字，可以和icon同时存在，字符串类型
        color: '', //（可选项）按钮标题文字颜色，默认值#000，字符串类型
        fontSize: '', //（可选项）按钮标题字体大小。默认值17，数字类型
        iconPath: 'widget://image/nav_option.png', //（可选项）按钮icon图标路径，可以和text同时存在，图片尺寸需要为4倍图，例如设备上面期望显示的图标尺寸为25*25，则图片实际尺寸需要为100*100，字符串类型
    }
};
/*
 * 打开自带导航栏的页面
 *
 * @param url      [必选,string] 页面在HTML文件夹中路径,如：tabs/tab_index.html
 * @param title    [可选,string] 导航栏中间的文本
 * @param params   [可选,map]    页面参数
 * @param rightBtn [可选,string] 右侧按钮的类型或者按钮文本, default: ''
 * @param backBtn  [可选,bool]   是否自定义返回时间，default: false,若为true，则不可以左滑返回
 */
// rightBtn 参数若不为空，会从rightBtnMap取右侧的按钮，若没有则只是文本按钮
// 新的类型可以在rightBtnMap中添加，注意图片必须是4倍图
// 监听导航栏点击事件  右侧:'app_rightBtn_' + api.winName 左侧:'app_leftBtn_' + api.winName
function fnOpenNavWin(url, title, params, rightBtn, backBtn) {
    console.log(url + '=====');
    // 打开只有navigationBar的页面
    if (backBtn == '') {
        backBtn = false;
    }
    backBtn = !!backBtn;
    params = params || {};

    var rightButtons = [],
        leftButtons = [{
            iconPath: 'widget://image/nav_back.png'
        }];

    if (!isEmpty(rightBtn)) {
        var right = rightBtnMap[rightBtn];
        if (!right) {
            right = {
                text: rightBtn,
                color: '#E6E6E8',
                fontSize: 15
            }
        }
        rightButtons.push(right);
    }
    params._backBtn = backBtn;
    api.openTabLayout({
        name: url,
        url: 'widget://html/' + url + '.html',
        title: title,
        hideNavigationBar: false,
        slidBackEnabled: !backBtn,
        reload: true,
        navigationBar: {
            background: '#fff',
            color: '#222224',
            fontSize: '18',
            shadow: '#fff',
            leftButtons: leftButtons,
            rightButtons: rightButtons
        },
        pageParam: params
    });
}

// 监听导航栏事件
function addNaviNotification() {
    api.addEventListener({
        name: 'navitembtn'
    }, function(ret, err) {
        // alert(JSON.stringify(ret)+'==ret');
        // alert(JSON.stringify(err)+'==err');
        if (ret) {
            // ret.index 第几个按钮
            if (ret.type == 'right') {
                // 右侧按钮
                api.sendEvent({
                    name: 'app_rightBtn_' + api.winName
                });
            } else if (ret.type == 'left') {
                // 左侧按钮
                if (!api.pageParam._backBtn) {
                    // 返回
                    fnDelayCloseWin(0);
                } else {
                    // 自定义返回
                    api.sendEvent({
                        name: 'app_leftBtn_' + api.winName
                    });
                }
            }
        }
    });
}
