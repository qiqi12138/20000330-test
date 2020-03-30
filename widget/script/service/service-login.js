//loginType 1:微信登录; 2:QQ登录; 3:微博登录
//登录
function fnLoginType(loginType, pCallback) {
    if (loginType == "1") { //微信登录
        var wx = WX();
        wx.isInstalled(function(status) {
            if (status) {
                console.log(status)
                wx.auth(function(code) {
                    console.log(code)
                    if (code) {
                        wx.getToken(code, function(openId, token) {
                            if (openId && token) {
                                wx.getUserInfo(token, openId, function(ret, err) {
                                    console.log(JSON.stringify(ret));
                                    var _param = {
                                        "token": token,
                                        "openId": openId
                                    }
                                    pCallback(_param, ret, err);
                                })
                            }
                        })
                    }
                })
            }
        });
    } else if (loginType == "2") { //QQ登录
        var qq = QQ();
        qq.installed(function(status) {
            if (status) {
                qq.login(function(openId) {
                    if (openId) {
                        qq.getUserInfo(function(ret, err) {
                            console.log(JSON.stringify(ret));
                            var _param = {
                                "openId": openId
                            }
                            pCallback(_param, ret, err);
                        })
                    }
                })
            }
        });

    } else if (loginType == "3") { //微博登录
        var weibo = WEIBO();
        weibo.isInstalled(function(status) {
            if (status) {
                weibo.auth(function(userId, token) {
                    if (userId && token) {
                        weibo.getUserInfo(token, userId, function(ret, err) {
                            console.log(JSON.stringify(ret));
                            var _param = {
                                "token": token,
                                "openId": userId
                            }
                            pCallback(_param, ret, err);
                        })
                    }
                });
            }else{
                $S.CloseProgress();
            }
        });
    }
}


//微信模块
function WX() {
    var _wx;

    function _init() { //初始化
        _wx = api.require('wxPlus');
    }
    //判断当前设备是否安装微信客户端
    function _isInstalled(pCallback) {
        _wx.isInstalled(function(ret, err) {
            console.log(JSON.stringify(ret));
            console.log(JSON.stringify(err));
            if (ret.installed) {
                pCallback(true);
            } else {
                var msg = '当前设备未安装微信客户端';
                $S.CloseProgress();
                console.log(msg);
            }
        })
    };
    //登录授权
    function _auth(pCallback) {
        _wx.auth(function(ret, err) {
            console.log(JSON.stringify(ret));
            console.log(JSON.stringify(err));
            if (ret.status) {
                pCallback(ret.code);
            } else {
                var msg = '登录授权失败';
                $S.CloseProgress();
                fnToast(msg);
            }
        })
    };
    //获取授权 accessToken(需要登录授权成功)
    function _getToken(code, pCallback) { //code  登录授权之后，返回的code值
        _wx.getToken({
            code: code
        }, function(ret, err) {
            console.log(JSON.stringify(ret));
            console.log(JSON.stringify(err));
            if (ret.status) {
                pCallback(ret.openId, ret.accessToken)
            } else {
                var msg = '获取Token失败';
                $S.CloseProgress();
                fnToast(msg);
            }
        })
    }
    //获取个人信息(需要获取 accessToken 成功)
    function _getUserInfo(token, openId, pCallback) { //token 授权accessToken成功之后返回的accessToken，openId 授权accessToken成功之后返回的openId
        _wx.getUserInfo({
            accessToken: token,
            openId: openId
        }, function(ret, err) {
            console.log(JSON.stringify(ret));
            console.log(JSON.stringify(err));
            pCallback(ret, err);
        });
    }

    _init(); //初始化
    var _wxModel = {
        isInstalled: function(pCallback) {
            _isInstalled(pCallback)
        },
        auth: function(pCallback) {
            _auth(pCallback)
        },
        getToken: function(code, pCallback) {
            _getToken(code, pCallback)
        },
        getUserInfo: function(token, openId, pCallback) {
            _getUserInfo(token, openId, pCallback)
        }
    }
    return _wxModel;
}

//qq模块
function QQ() {
    var _qq;

    function _init() { //初始化
        _qq = api.require('QQPlus');
    }
    //判断当前设备是否安装QQ客户端
    function _installed(pCallback) {
        _qq.installed(function(ret, err) {
            console.log(JSON.stringify(ret));
            console.log(JSON.stringify(err));
            if (ret.status) {
                pCallback(true);
            } else {
                var msg = '当前设备未安装QQ客户端';
                console.log(msg);
            }
        })
    };
    //登录授权
    function _login(pCallback) {
        _qq.login(function(ret, err) {
            console.log(JSON.stringify(ret));
            console.log(JSON.stringify(err));
            if (ret.status) {
                pCallback(ret.openId)
            } else {
                var msg = '登录授权失败';
                $S.CloseProgress();
                fnToast(msg);
            }
        })
    }
    //获取个人信息
    function _getUserInfo(pCallback) {
        _qq.getUserInfo(function(ret, err) {
            console.log(JSON.stringify(ret));
            console.log(JSON.stringify(err));
            pCallback(ret, err);
        });
    }

    _init(); //初始化
    var _qqModel = {
        installed: function(pCallback) {
            _installed(pCallback)
        },
        login: function(pCallback) {
            _login(pCallback)
        },
        getUserInfo: function(pCallback) {
            _getUserInfo(pCallback)
        }
    }
    return _qqModel;
}

//weibo 模块
function WEIBO() {
    var _weibo;

    function _init() { //初始化
        _weibo = api.require('weiboPlus');
    }
    //判断当前设备是否安装微博客户端
    function _isInstalled(pCallback) {
        _weibo.isInstalled(function(ret, err) {
            console.log(JSON.stringify(ret));
            console.log(JSON.stringify(err));
            if (ret.status) {
                pCallback(true);
            } else {
                var msg = '当前设备未安装微博客户端';
                console.log(msg);
            }
        })
    };
    //登录授权
    function _auth(pCallback) {
        _weibo.auth(function(ret, err) {
            console.log(JSON.stringify(ret));
            console.log(JSON.stringify(err));
            if (ret.status) {
                pCallback(ret.userId, ret.token)
            } else {
                var msg = '登录授权失败';
                $S.CloseProgress();
                fnToast(msg);
            }
        })
    }
    //获取个人信息
    function _getUserInfo(token, userId, pCallback) { //token 登录授权成功之后返回的Token，userId 登录授权成功之后返回的userId
        _weibo.getUserInfo({
            token: token,
            userId: userId
        }, function(ret, err) {
            console.log(JSON.stringify(ret));
            console.log(JSON.stringify(err));
            pCallback(ret, err);
        });
    }

    _init(); //初始化
    var _weiboModel = {
        isInstalled: function(pCallback) {
            _isInstalled(pCallback)
        },
        auth: function(pCallback) {
            _auth(pCallback)
        },
        getUserInfo: function(token, userId, pCallback) {
            _getUserInfo(token, userId, pCallback)
        },
    }
    return _weiboModel;
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
        global:true,
    });
}
