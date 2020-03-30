/********************************************************************************
 * writer: SDJ
 * create date: 2017-7-15
 * rewriter: SDJ
 * rewrite date: 2017-7-15
 * description:封装了引导页相关功能，包括是否显示引导页判断，引导页显示、关闭等方法
 * 注意：
 *   1.本方法使用了UIScrollPicture、UIButton模块，使用前需在控制台添加响应模块；
 *********************************************************************************/

//判断程序是否第一次启动
function fnIsFirstLaunch() {
    var tResult = api.getPrefs({
        key: 'isFirst',
        sync: true
    });
    console.log('isFirst  ====' + JSON.stringify(tResult));
    return !(tResult && tResult == api.appId);
}

//记录已启动状态
function fnSetLaunchedStatus() {
    api.setPrefs({
        key: 'isFirst',
        value: api.appId
    });
}

//移除已启动状态记录（一般用于测试时使用）
function fnRemoveLaunchedStatus() {
    api.removePrefs({
        key: 'isFirst'
    });
}


//显示引导页
function GUIDE(pCallBack) {
    var _guide = {};

    var _btnId, _button = api.require('UIButton'); //按钮模块对象ID和按钮模块对象
    var _TouchedAction; //末页按钮点击事件执行方法
    //显示进入APP按钮
    function fnShowStartBtn() {

        if ('[object Number]' !== Object.prototype.toString.call(_btnId)) {
            _button.open({
                rect: {
                    x: api.winWidth/4,
                    y: api.winHeight - 150,
                    w: api.winWidth/2,
                    h: 50
                },
                corner: 25,
                bg: {
                    normal: 'rgba(217,39,39,1)',
                    highlight: 'rgba(217,39,39,1)',
                    active: 'rgba(217,39,39,1)'
                },
                title: {
                    size: 18,
                    highlight: '立即进入',
                    active: '立即进入',
                    normal: '立即进入',
                    highlightColor: '#fff',
                    activeColor: '#fff',
                    normalColor: '#fff',
                    alignment: 'center'
                },
                fixed: true,
                move: false
            }, function(ret, err) {
                if ('show' == ret.eventType) {
                    _btnId = ret.id;
                }
                if ('click' == ret.eventType) {
                    //关闭引导页，进入主页面
                    if (_TouchedAction) {
                        _TouchedAction();
                    }
                }
            });
        } else {
            _button.show({
                id: _btnId
            });
        }
    }

    //隐藏进入按钮
    function fnHideStartBtn() {
        if (_button) {
            _button.hide({
                id: _btnId
            });
        }
    }

    var _sp = api.require('UIScrollPicture');
    //轮播图默认图片
    var _paths = [
        'widget://image/guide/guide1.png',
        'widget://image/guide/guide2.png',
        'widget://image/guide/guide3.png',
    ];
    //UIScrollPicture 模块初始化参数
    var _params = {
        rect: {
            x: 0,
            y: 0,
            w: 'auto',
            h: 'auto'
        },
        data: {
            paths: _paths,
        },
        styles: {
            indicator: {
                dot: { // （可选项）JSON对象；指示器小圆点样式；不传则使用系统默认小圆点样式
                    w: 0, //（必选项）数字类型；小圆点宽度
                    h: 0, //（必选项）数字类型；小圆点高度
                    r: 0, //（必选项）数字类型；corner 页面控制器指示标记（矩形）的圆角大小
                    margin: 0 //（必选项）数字类型；小圆点间距
                },
                align: 'center',
                color: 'rgba(0,0,0,0)',
                activeColor: 'rgba(0,0,0,0)'
            }
        },
        contentMode: 'scaleToFill',
        auto: false,
        loop: false,
    };

    //显示引导页
    _guide.Show = function() {
        _sp.open(_params, function(ret, err) {
            if (ret) {
                if ('show' == ret.eventType) {
                    _sp.addEventListener({
                        name: 'scroll'
                    }, function(ret, err) {
                        if (ret.status) {
                            if (ret.index == (_paths.length - 1)) {
                                //显示进入按钮
                                fnShowStartBtn();
                            } else {
                                //隐藏进入按钮
                                fnHideStartBtn();
                            }
                        }
                    });
                }

            }
        });
    }

    /**
     * 引导页关闭方法
     * @param  {Function} pCallBack [关闭引导页]
     */
    _guide.Close = function() {
        _button.close();
        _sp.close();
        _guide = null;
    }

    _guide.AddEvent = function(pCallBack) {
        if ('[object Function]' === Object.prototype.toString.call(pCallBack)) {
            _TouchedAction = pCallBack;
        }
    }

    //便利化构造
    if ('[object Function]' === Object.prototype.toString.call(pCallBack)) {
        _TouchedAction = pCallBack;
    }

    return _guide;
}
