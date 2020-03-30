// 选择图片，以及上传华为云
var UIAlbumBrowser;
//拍照或者选择照片
var _newImgType = "";

function fnOpenPhoto(newImgType, max) {
    var resultList = api.hasPermission({
        list: ['camera', 'photos']
    });
    if (!resultList[0]['granted']) {
        api.requestPermission({
            list: ['camera', 'photos']
        }, function(ret) {
            if (ret && ret.list) {
                console.log(JSON.stringify(ret))
                if (!ret.list[0]['granted'] || !ret.list[1]['granted']) {
                    fnToast('您没有允许相关权限，请允许后继续');
                    return;
                }
            }
        })
    }
    _newImgType = newImgType;
    api.actionSheet({
        title: '',
        cancelTitle: '取消',
        destructiveTitle: '',
        buttons: ['拍照', '从相册获取']
    }, function(ret, err) {
        if (ret) {
            fnOpenSelPhoto(ret.buttonIndex, max)
        }
    });
}

function fnOpenSelPhoto(type, max) {
    if (type == '1') {
        fnOpenCamera();
    } else if (type == '2') {
        UIAlbumBrowser = api.require('UIAlbumBrowser');
        if (api.systemType == 'ios') {
            UIAlbumBrowser.requestAlbumPermissions({}, function(ret, err) {
                if (ret.isAccessPermissions) {
                    fnOpenSelectPhoto(max);
                } else {
                    fnToast("相册权限未开启")
                }
            });
        } else {
            fnOpenSelectPhoto(max);
        }
    }
}

function fnOpenCamera() {
    api.getPicture({
        sourceType: 'camera',
        encodingType: 'jpg',
        mediaValue: 'pic',
        destinationType: 'url',
        allowEdit: true,
        quality: 100,
        // targetWidth: 100,
        // targetHeight: 100,
        saveToPhotoAlbum: false
    }, function(ret, err) {
        if (ret && ret.data != '') {
            var _imgUrl = [];
            imgURLItem = {
                "path": ret.data
            };
            _imgUrl.push(imgURLItem);
            api.sendEvent({
                name: 'imgURL',
                extra: {
                    type: _newImgType,
                    imgURL: _imgUrl
                }
            });
        }
    });
}



function fnOpenSelectPhoto(max) {
    UIAlbumBrowser = api.require('UIAlbumBrowser');
    UIAlbumBrowser.open({
        max: max,
        styles: {
            bg: '#fff',
            mark: {
                icon: '',
                position: 'bottom_left',
                size: 20
            },
            nav: {
                bg: 'rgba(0,0,0,0.6)',
                titleColor: '#fff',
                titleSize: 18,
                cancelColor: '#fff',
                cancelSize: 16,
                finishColor: '#fff',
                finishSize: 16
            }
        },
        rotation: true
    }, function(ret) {
        if (ret) {
            if (ret.eventType == 'confirm') {
                if (ret.list.length > 0) {
                    fnRecursionPic(ret.list, '0')
                }
            }
        }
    });
}
var _submitImg = [];

function fnRecursionPic(imgArr, key) {
    if (key == '0') {
        _submitImg = [];
    }
    UIAlbumBrowser.transPath({
        path: imgArr[key].path
    }, function(ret, err) {
        if (ret) {
            key = parseInt(key) + 1;
            var _imgItem = {
                path: ret.path
            }
            _submitImg.push(_imgItem)
            if (key == imgArr.length) {
                api.sendEvent({
                    name: 'imgURL',
                    extra: {
                        type: _newImgType,
                        imgURL: _submitImg
                    }
                });
            } else {
                fnRecursionPic(imgArr, key)
            }
        }
    });
}

function fnOpenClipPic(url) {
    var tParam = {
        name: 'clip_pic_win',
        url: 'widget://html/clip_pic_win.html',
        pageParam: {
            picUrl: url
        }
    }
    fnOpenWin(tParam);
}
//上传到本地服务器
function fnUploadFileToServer(fileurl, pCallBack) {
    if (fileurl.indexOf('http') >= 0) {
        pCallBack(fileurl);
    } else {
        var postData = {
            files: {
                file: fileurl
            }
        }
        $S.POST("apiTbAppMostMaterial/newUploadFile", postData, function(ret, err) {
            if (ret && ret.status == '200') {
                console.log(JSON.stringify(ret));
                pImg = ret.data.url;
                pCallBack(pImg);
            } else {
                fnToast("上传图片失败");
            }
            $S.CloseProgress();
        });
    }
}
