(function(window) {
    'use strict'
    var SHARE;
    var vSystem;
    // shareData{
    //   apiKey
    //   title
    //   description
    //   text//
    //   shareType: 1：微信好友 2：微信朋友圈 3：qq好友 4：qq朋友圈 5：新浪微博 6：钉钉
    //   thumb
    //   contentUrl
    //   //thumbIsNet：允许所带图片是网络图片，有些比如微信sharewebpage不允许网络图片，而有时不同新闻分享要求右侧图片动态不同，此时若
    //   //thumbIsNet变量为true，则自动将网络图片下载存储到本地进行分享展示。
    //   thumbIsNet
    //   thumbLocalSavePath
    // }
    var oShare = function() {
        this.system = api.systemType;
        this.wx = {};
        this.qq = {};
        this.weibo = {};
        this.dingding = {};
    }
    oShare.prototype = {
        _sysIsIos: function() {
            var self = this;
            if (self.system == "IOS") return true;
        },
        _sysIsAndroid: function() {
            var self = this;
            if (self.system == "Android") return true;
        },
        _isNull: function(pData) { //检查是否为空
            if (pData == "" || pData == undefined || pData == null) {
                return false
            }
            return true
        },
        _getStrLength: function(val) {
            if (varIfNull(val)) return 0;
            var len = 0;
            for (var i = 0; i < val.length; i++) {
                var length = val.charCodeAt(i);
                if (length >= 0 && length <= 128) {
                    len += 1;
                } else {
                    len += 2;
                }
            }
            return len;
        },
        /**错误代码翻译
        platKind:1、微信 2qq 3新浪微博
        shareKind(wx/qq/wb)：1、text 2 image 3 music 4 video  5 webpage/news/webpage 6:program(小程序)
        codeOrDesc：返回平台自定义错误码还是中文描述内容
        **/
        _getErrorCodeTrans: function(platKind, errorCodeNum, codeOrDesc) {
            var errorDesc;
            var errorCode;
            var newPlatKind;
            var self = this;
            if (platKind == 1 || platKind == 2) newPlatKind = 1;
            if (platKind == 3 || platKind == 4) newPlatKind = 2;
            if (platKind == 5) newPlatKind = 3;
            switch (platKind) {
                case 1:
                    errorCode = self._wxToPlatErrorCode[errorCodeNum];
                    errorDesc = self._platErrorCode[errorCode];
                    console.log(errorCode + "----" + errorDesc);
                    break;
                case 2:
                    errorCode = self._qqToPlatErrorCode[errorCodeNum];
                    errorDesc = self._platErrorCode[errorCode];
                    break;
                case 3:
                    errorCode = self._xlToPlatErrorCode[errorCodeNum];
                    errorDesc = self._platErrorCode[errorCode];
                    break;
                default:
                    errorCode = 100;
                    errorDesc = '无法定位问题';
            }
            if (codeOrDesc) {
                return errorCode;
            } else {
                return errorDesc;
            }

        },
        //平台错误码变量
        _platErrorCode: {
            0: '未知错误',
            1: '成功',
            2: '发送失败',
            3: 'apiKey非法',
            4: '用户取消',
            5: '授权拒绝(失败)',
            6: '不支持的请求',
            7: '注册SDK失败',
            8: '未安装客户端',
            9: '消息类型不合法',
            10: '消息类型为空',
            11: '消息内容不合法',
            12: 'APP未注册',
            13: '分享未同步',
            14: 'qzone分享不支持TEXT类型',
            15: 'qzone分享不支持image类型'

        },
        _wxToPlatErrorCode: {
            '-1': 0,
            0: 1,
            3: 2,
            1: 3,
            2: 4,
            4: 5,
            5: 6,
            7: 7
        },
        _qqToPlatErrorCode: {
            0: 1,
            '-1': 2,
            '-4': 4,
            2: 6,
            1: 8,
            3: 9,
            4: 10,
            5: 11,
            6: 12,
            7: 13,
            10000: 14,
            10001: 15,
            10009: 8
        },
        _xlToPlatErrorCode: {
            5: 0,
            2: 2,
            '-1': 3,
            '-2': 16,
            1: 4,
            3: 5,
            4: 6
        },
        _checkIsInstall: function(shareType, type, pCallBack) { //检查分享目标app是否下载
            var self = this;
            if (!self._isNull(shareType)) {
                console.log('【错误】---- shareType字段不能为空')
                return
            }
            // var callBackParam = [pShareData, pCallBack];
            var destCilentFunction;
            var dyanMsg;
            if (shareType == 1 || shareType == 2) {
                destCilentFunction = api.require('wxPlus').isInstalled;
                dyanMsg = "微信";
            }
            if (shareType == 3 || shareType == 4) {
                destCilentFunction = api.require('QQPlus').installed;
                dyanMsg = "qq";
            }
            if (shareType == 5) {
                destCilentFunction = api.require('weiboPlus').isInstalled;
                dyanMsg = "新浪微博";
            }
            if (shareType == 6) {
                destCilentFunction = api.require('dingding').isInstalled;
                dyanMsg = "钉钉";
            }
            var tIsInstall = true;
            destCilentFunction(function(ret, err) {
                var insTallStatus = ret.status;
                if (shareType == 1 || shareType == 2 || shareType == 6) {
                    insTallStatus = ret.installed;
                }
                tIsInstall = insTallStatus;
                if (!insTallStatus) {
                    if (type == "share" || type == "login") {
                        api.toast({
                            msg: '当前设备未安装' + dyanMsg + '客户端',
                            duration: 2000,
                            location: 'bottom',
                            global:true,
                        });
                    }
                }
                pCallBack(tIsInstall);
            });
        },
        _auth: function(shareType, pCallback) { //登录授权
            var self = this;
            if (!self._isNull(shareType)) {
                console.log('【错误】---- shareType字段不能为空')
                return;
            }
            //判断是否安装
            self._checkIsInstall(shareType, "login", function(iType) {
                if (!iType) {
                    return errorCode;
                } else {

                    // var callBackParam = [pShareData, pCallBack];
                    var destCilentFunction;
                    var dyanMsg;
                    if (shareType == 1 || shareType == 2) {
                        destCilentFunction = api.require('wxPlus').auth;
                        dyanMsg = "微信";
                    }
                    if (shareType == 3 || shareType == 4) {
                        destCilentFunction = api.require('QQPlus').login;
                        dyanMsg = "qq";
                    }
                    if (shareType == 5) {
                        destCilentFunction = api.require('weiboPlus').auth;
                        dyanMsg = "新浪微博";
                    }
                    var authData = "";
                    destCilentFunction(function(ret, err) {
                        var tIsAuth = ret.status;
                        authData = ret;
                        if (!tIsAuth) {
                            api.toast({
                                msg: dyanMsg + '登录授权失败',
                                duration: 2000,
                                location: 'bottom',
                                global:true,
                            });
                        }
                        //微信登录获取token
                        if (tIsAuth && shareType == 1 || shareType == 2) {
                            api.require('wxPlus').getToken({
                                code: ret.code
                            }, function(ret1, err1) {
                                authData = ret1;
                                if (!ret1.status) {
                                    api.toast({
                                        msg: dyanMsg + '登录授权失败',
                                        duration: 2000,
                                        location: 'bottom',
                                        global:true,
                                    });
                                }
                                pCallback(authData);
                            });
                        } else {
                            pCallback(authData);
                        }
                    });
                }
            })
        },
        _getUserInfo: function(shareType, pCallback) {
            var self = this;
            if (!self._isNull(shareType)) {
                console.log('【错误】---- shareType字段不能为空')
                return;
            }
            var tokenData = "";
            self._auth(shareType, function(tData) {
                console.log(JSON.stringify(tData))
                if (tData) {
                    tokenData = tData;
                }
                var destCilentFunction;
                var dyanMsg;
                var _TokenpostData;
                var _param;
                if (shareType == 1 || shareType == 2) {
                    destCilentFunction = api.require('wxPlus').getUserInfo;
                    dyanMsg = "微信";
                    _TokenpostData = {
                        accessToken: tokenData.accessToken,
                        openId: tokenData.openId
                    };
                    _param = _TokenpostData;
                }
                if (shareType == 3 || shareType == 4) {
                    destCilentFunction = api.require('QQPlus').getUserInfo;
                    dyanMsg = "qq";
                    _TokenpostData = "";
                    _param = {
                        accessToken: tokenData.accessToken,
                        openId: tokenData.openId
                    }
                }
                if (shareType == 5) {
                    destCilentFunction = api.require('weiboPlus').getUserInfo;
                    dyanMsg = "新浪微博";
                    _TokenpostData = {
                        "token": tokenData.token,
                        "userId": tokenData.userId
                    };
                    _param = _TokenpostData;
                }
                var authData = "";
                destCilentFunction(_TokenpostData, function(ret, err) {
                    pCallback(_param, ret, err)
                });
            });
        },
        _shareResult: function(ret, err, shareType, callBackFunction) {
            console.log(JSON.stringify(ret))
            console.log(JSON.stringify(err))

            callBackFunction(ret, err);
        },
        _checkFileSize: function(thumbUrl, maxImgSize) {
            var self = this;
            var errorCode = 101;
            if (!self._isNull(thumbUrl)) {
                console.log("thumbUrl不能为空");
                return 100;
            }
            var fs = api.require('fs');
            fs.exist({
                    path: thumbUrl
                },
                function(ret, err) {
                    if (!ret.exist) {
                        errorCode = 23;
                        return errorCode;
                    } else {
                        fs.getAttribute({
                            path: thumbUrl
                        }, function(ret, err) {
                            if (ret.status) {
                                if (ret.size > 1024 * maxImgSize) {
                                    errorCode = 22;
                                    return errorCode;
                                }
                            } else {
                                errorCode = 23;
                                return errorCode;
                            }
                        });
                    }
                });
            return errorCode;
        },
        _checkFileFix: function(pUrl) { //检查是否为图片文件
            var pic = ["jpg", "png", "gif"];
            var indx = pUrl.lastIndexOf(".");
            var ext = pUrl.substr(indx + 1);
            var ifvalidate = false;
            for (var a = 0; a < pic.length; a++) {
                if (ext == pic[a]) {
                    ifvalidate = true;
                    break;
                }
            }
            return ifvalidate;
        },
        _checkUrlIsLocal: function(pUrl) {
            var self = this;
            if (!self._isNull(pUrl)) {
                console.log("【错误】----  pUrl不能为空")
                return false
            }
            if (pUrl.indexOf("fs:") >= 0 || pUrl.indexOf("widget:") >= 0) {
                return true
            } else {
                return false
            }
        },
        _weiboIosDealText: function(pShareData) {
            var self = this;
            var tText = pShareData.text;
            if (self._sysIsIos()) {
                tText = tText + shareData.contentUrl;
            }
            return tText;
        },
        _weiboIosThumbConvert: function(pShareData) {
            var self = this;
            var thumbUrl = pShareData.thumb;
            if (self._sysIsIos() && thumbUrl.indexOf("widget:") >= 0) {
                thumbUrl = self._widgetPathCopyToFs(thumbUrl);
            }
            return thumbUrl;
        },
        _widgetPathCopyToFs: function(pUrl) {
            var tNewUrl = pUrl.replace('widget', 'fs');
            return tNewUrl
        },
        _checkImageRule: function(pShareData) {
            var self = this;
            var tThumbUrl = pShareData.thumb;
            var errorCode;
            if (self._checkUrlIsLocal(tThumbUrl)) {
                if (!self._checkFileFix(tThumbUrl)) {
                    errorCode = 20;
                } else {
                    if (pShareData.shareType == 1 || pShareData.shareType == 2 || pShareData.shareType == 5) { //微信、新浪图片会限制大小

                        var judgefilesizeR = self._checkFileSize(tThumbUrl, 32);
                        if (judgefilesizeR != 101) {
                            errorCode = judgefilesizeR;
                        }
                    }
                    if (pShareData.shareType == 4 && self.system == "Android") { //type 为 QZone 则本参数在 Android 上仅支持网络图片
                        console.log("Android的qZone分享只能使用网络图片");
                        errorCode = 21;
                    }
                }
            } else {
                if (pShareData.shareType == 1 || pShareData.shareType == 2 || pShareData.shareType == 5) { //微信，如果允许网络图片，由程序下载存储到本地
                    if (!pShareData.thumbIsNet) { //微信分享没有显示的 指定可以使用网络地址
                        errorCode = 21;
                    }
                }
            }
            return errorCode;
        },
        //判断分享中除了图片外的其他规则，主要是新浪微博的字符大小限制
        _checkTextSize: function(pShareData) {
            var self = this;
            var errorCode = 101;
            if (!self._isNull(pShareData.contentUrl)) {
                console.log("contentUrl不能为空");
                errorCode = 100;
                return errorCode;
            }
            if (pShareData.shareType == 5) {
                var textLength = self._getStrLength(pShareData.text);
                if (textLength >= 280) {
                    errorCode = 100;
                    console.log("text大于280");
                }
                var titleLength = self._getStrLength(pShareData.title);
                if (titleLength == 0 || titleLength >= 1024) {
                    console.log("title大于1k或者为空");
                    errorCode = 100;
                }
                var descriptionLength = self._getStrLength(pShareData.description);
                if (descriptionLength >= 1024) {
                    console.log("description大于1k");
                    errorCode = 100;
                }
                var contentUrlLength = self._getStrLength(pShareData.contentUrl);
                if (contentUrlLength == 0 || contentUrlLength >= 255) {
                    console.log("contentUrl大于255或者为空");
                    errorCode = 100;
                }
            }

            return errorCode;
        },
        _findPathAndNameByUrl: function(url, nameOrPath) {
            var destc;
            var self = this;
            if (!self._isNull(url)) {
                console.log("文件对应url为空");
                return destc;
            }
            if (nameOrPath) {
                destc = url.substr(url.lastIndexOf('/') + 1);
            } else {
                destc = substring(0, url.lastIndexOf('/'));
            }
            //console.log(destc);
            return destc;
        },
        //有些比如微信sharewebpage不允许网络图片，而有时不同新闻分享要求右侧图片动态不同，此时若
        //自动将网络图片下载存储到本地并压缩至指定的大小。
        //最大size，单位为kb
        _imgNetToLocalAndCompress: function(pShareData, maxImgSize, callBackFunction) {
            var self = this;
            var finalImgPath = pShareData.thumbLocalSavePath + "/" + this._findPathAndNameByUrl(pShareData.thumb, true);
            console.log("finalImgPath:" + finalImgPath);
            var downImg;
            api.download({
                    url: pShareData.thumb,
                    savePath: finalImgPath,
                    cache: true,
                    allowResume: true
                },
                function(ret, err) {
                    if (ret.state == 1) {
                        downImg = finalImgPath;
                        if (ret.fileSize > 1024 * maxImgSize) { //压缩
                            var imageFilter = api.require('imageFilter');
                            imageFilter.compress({
                                img: ret.savePath,
                                quality: 0.8,
                                size: {
                                    w: 100, //压缩后的图片的宽，数字类型，无默认值
                                    h: 100 //压缩后的图片的高，数字类型，无默认值
                                },
                                save: {
                                    imgPath: "fs://res/",
                                    imgName: self._findPathAndNameByUrl(pShareData.thumb, true)
                                }
                            }, function(ret, err) {
                                console.log(JSON.stringify(ret))
                                console.log(JSON.stringify(err))
                                var tLarge;
                                imageFilter.getAttr({ //检查一下大小是否合适，不合适提醒一下
                                        path: "fs://res/" + self._findPathAndNameByUrl(pShareData.thumb, true)
                                    },
                                    function(ret, err) {
                                        tLarge = ret.size;
                                        if (tLarge > 1024 * maxImgSize) {
                                            console.log("图片过大···")
                                            // api.toast({
                                            //     msg: '图片过大···',
                                            //     duration: 2000,
                                            //     location: 'bottom'
                                            // });
                                        }
                                    }
                                )
                                if (ret.status) {
                                    console.log("jinruzhele:");
                                    callBackFunction(ret, err, "fs://res/" + self._findPathAndNameByUrl(pShareData.thumb, true));
                                } else {
                                    api.toast({
                                        msg: '分享图片压缩失败',
                                        duration: 2000,
                                        location: 'bottom',
                                        global:true,
                                    });
                                }
                            });

                        } else {
                            callBackFunction(ret, err, finalImgPath);
                        }
                    } else {
                        api.toast({
                            msg: '分享图片下载失败',
                            duration: 2000,
                            location: 'bottom',
                            global:true,
                        });
                    }
                });

        },
        //根据平台自定义的类型，获取调用apicloud分享时对应的类型
        _findScene: function(shareType) {
            var shareTypeLoacl;
            var self = this;
            switch (shareType) {
                case 1:
                    shareTypeLoacl = 'session';
                    break;
                case 2:
                    shareTypeLoacl = 'timeline';
                    break;
                case 3:
                    shareTypeLoacl = 'QFriend';
                    break;
                case 4:
                    shareTypeLoacl = 'QZone';
                    break;
                case 5:
                    shareTypeLoacl = 'timeline';
                    break;
                default:

            }
            if (!self._isNull(shareTypeLoacl)) {
                console.log('找不到分享类型shareType');
            }
            return shareTypeLoacl;
        },
        fnShareText: function(pShareData, pCallBack) { //分享文字
            var self = this;
            var errorCode = 101;
            self._checkIsInstall(pShareData.shareType, "share", function(iType) {
                if (!iType) {
                    return;
                } else {
                    // if (!self._checkIsInstall(pShareData)) {
                    //     return errorCode;
                    // }

                    if (pShareData.shareType == 1 || pShareData.shareType == 2) { //只能分享到朋友圈
                        var wx = api.require('wxPlus');
                        wx.shareText({
                            text: pShareData.text
                        }, self._shareResult(ret, err, pShareData.shareType, pCallBack));
                    }
                    if (pShareData.shareType == 3 || pShareData.shareType == 4) { //只能分享到好友
                        var qq = api.require('QQPlus');
                        qq.shareText({
                            text: pShareData.text
                        }, self._shareResult(ret, err, pShareData.shareType, pCallBack));
                        if (self._sysIsAndroid()) {
                            console.log("android系统不支持qq文本分享的函数" + pCallBack + "回调");
                        }
                    }
                    if (pShareData.shareType == 5) { //分享到新浪微博
                        var textLength = getStrLength(pShareData.text);
                        if (textLength >= 280) {
                            errorCode = 100;
                            console.log("新浪微博分享文本长度不能大于140个汉字");
                        }
                    }
                }
            });

        },
        fnShareWebPage: function(pShareData, pCallBack) {
            var self = this;
            var errorCode = 101;

            self._checkIsInstall(pShareData.shareType, "share", function(iType) {
                if (!iType) {
                    return;
                } else {
                    //判断图片限制
                    var tImgRuleNum = self._checkImageRule(pShareData);

                    if (tImgRuleNum > 19) {
                        console.log("jia");
                        console.log(tImgRuleNum)
                        return;
                    }

                    // var dataRuleNum=judgeShareWebpageDataRule(pShareData);//判断文本限制
                    // if(dataRuleNum==100)return dataRuleNum;
                    if (pShareData.shareType == 1 || pShareData.shareType == 2) {
                        if (!pShareData.thumbIsNet) {
                            var wx = api.require('wxPlus');
                            wx.shareWebpage({
                                apiKey: '',
                                scene: self._findScene(pShareData.shareType),
                                title: pShareData.title,
                                description: pShareData.description,
                                thumb: pShareData.thumb,
                                contentUrl: pShareData.contentUrl
                            }, function(ret, err) {
                                self._shareResult(ret, err, pShareData.shareType, pCallBack)
                            });
                        } else { //使用网络图片进行微信分享

                            var netWxShareWebpage = function(ret, err, finalImgPath) {
                                var wx = api.require('wxPlus');
                                wx.shareWebpage({
                                    scene: self._findScene(pShareData.shareType),
                                    title: pShareData.title,
                                    description: pShareData.description,
                                    thumb: finalImgPath,
                                    contentUrl: pShareData.contentUrl
                                }, function(ret, err) {
                                    self._shareResult(ret, err, pShareData.shareType, pCallBack)
                                });
                            };
                            self._imgNetToLocalAndCompress(pShareData, 20, netWxShareWebpage);
                        }
                    }
                    if (pShareData.shareType == 3 || pShareData.shareType == 4) {
                        var qq = api.require('QQPlus');
                        qq.shareNews({
                            url: pShareData.contentUrl,
                            title: pShareData.title,
                            type: self._findScene(pShareData.shareType),
                            description: pShareData.description,
                            imgUrl: pShareData.thumb
                        }, function(ret, err) {
                            self._shareResult(ret, err, pShareData.shareType, pCallBack)
                        });
                    }
                    if (pShareData.shareType == 5) { //微博分享
                        if (!pShareData.thumbIsNet) {
                            var weibo = api.require('weiboPlus');
                            weibo.shareWebPage({
                                text: self._weiboIosDealText(pShareData),
                                title: pShareData.title,
                                description: pShareData.description,
                                thumb: self._weiboIosThumbConvert(pShareData),
                                contentUrl: pShareData.contentUrl
                            }, function(ret, err) {
                                self._shareResult(ret, err, pShareData.shareType, pCallBack)
                            });

                        } else { //使用网络图片进行微信分享
                            var netweiboShareWebpage = function(ret, err, finalImgPath) {
                                var weibo = api.require('weiboPlus');
                                weibo.shareWebPage({
                                    text: self._weiboIosDealText(pShareData),
                                    title: pShareData.title,
                                    description: pShareData.description,
                                    thumb: finalImgPath,
                                    contentUrl: pShareData.contentUrl
                                }, function(ret, err) {

                                    self._shareResult(ret, err, pShareData.shareType, pCallBack)
                                });
                            };
                            self._imgNetToLocalAndCompress(pShareData, 20, function(ret, err, imgUrl) {
                                netweiboShareWebpage(ret, err, imgUrl);
                            });
                        }
                    }
                    if (pShareData.shareType == 6) {
                        var dingding = api.require('dingding');
                        dingding.shareWebpage({
                            appId: 'dingoavwgjoaehswl3qust',
                            title: pShareData.title,
                            description: pShareData.description,
                            thumurl: pShareData.thumb,
                            url: pShareData.contentUrl
                        }, function(ret, err) {
                            self._shareResult(ret, err, pShareData.shareType, pCallBack)
                        });
                    }

                }
            });
        },
        fnShareImage: function(pShareData, pCallBack) {
            var self = this;
            var errorCode = 101;

            self._checkIsInstall(pShareData.shareType, "share", function(iType) {
                if (!iType) {
                    return;
                } else {
                    //判断图片限制
                    // var tImgRuleNum = self._checkImageRule(pShareData);
                    //
                    // if (tImgRuleNum > 19) {
                    //     console.log("jia");
                    //     console.log(tImgRuleNum)
                    //     return;
                    // }

                    // var dataRuleNum=judgeShareWebpageDataRule(pShareData);//判断文本限制
                    // if(dataRuleNum==100)return dataRuleNum;
                    if (pShareData.shareType == 1 || pShareData.shareType == 2) {

                        api.imageCache({
                            url: pShareData.contentUrl
                        }, function(ret, err) {
                            var _thumb = ret.url;

                            var _url = ret.savePath;
                            var wx = api.require('wxPlus');
                            // console.log(finalImgPath+"---"+downImage)
                            wx.shareImage({
                                scene: self._findScene(pShareData.shareType),
                                // thumb: _thumb,
                                contentUrl: _thumb
                            }, function(ret, err) {
                                self._shareResult(ret, err, pShareData.shareType, pCallBack)
                            });

                        });
                        // var netWxShareImage = function(ret, err, finalImgPath) {
                        //
                        // };
                        // self._imgNetToLocalAndCompress(pShareData, 3000, netWxShareImage);

                    }
                }
            });
        }

    }
    window.SHARE = oShare;
})(window)
