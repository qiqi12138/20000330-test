var END_POINT = 'https://oss-cn-beijing.aliyuncs.com'; //阿里云OSS服务在各个区域的地址
var ACCESS_KEY_ID = 'LTAIh2rf1rRn4dQab'; //从阿里云获取的accessKeyId
var ACCESS_KEY_SECRET = 'jEBz102dFQNyv3QisN0JVsZmN5biPyq'; //从阿里云获取的accessKeySecret
var BASE_URL = 'http://jylf.oss-cn-beijing.aliyuncs.com'; //文件对外的域名，去掉了前面的http,因为在fnCacheImage()函数中会添加：http://paekdusan.oss-cn-beijing.aliyuncs.com
var BUCKET_NAME = "j1ylf"; //Bucket名称
var FOLDER = 'j1ylf/'; //Folder名称

/**
 * 阿里云OSS初始化：支持明文模式和自签名模式 。移动终端是一个不受信任的环境，如果把AccessKeyId和AccessKeySecret
 * 直接保存在终端本地用来加签请求，存在极高的风险。明文模式鉴权必须设置accessKeyId和accessKeySecret，此方式建议
 * 只在测试时使用。正式环境请使用自签名模式，此模式serverUrl为必须。
 * 目前使用的是明文模式。
 */
var aliyunOSS;

function fnTencentCos() {
    aliyunOSS = api.require('tencentCos');
    aliyunOSS.init();
}


function fnUploadToTencentCos(fileurl, pCallBack) {
    if (fileurl.indexOf('http') >= 0) {
        pCallBack(fileurl);
    } else {
        var timestamp = new Date().getTime() + Math.ceil(Math.random() * 1000);
        var s = fileurl;
        console.log(fileurl)
        var photoSrc = s.split("/");
        var photoName = timestamp + photoSrc[photoSrc.length - 1];
        console.log("上传文件名为：" + photoName);
        aliyunOSS.putObject({
            url: fileurl,
            object: photoName
        }, function(ret, err) {
            console.log(JSON.stringify(ret));
            console.log(JSON.stringify(err));
            if (ret) {
                // || ret.currentSize == ret.totalSize
                if (ret.eventType == "onComplete") {
                    var pImg = ret.location;
                    if(pImg.indexOf('http') == -1) {
                        pImg = 'http://' + pImg;
                    }
                    // if(!ret.location) {
                    //     pImg = 'http://xingluo-1259320911.cos.ap-beijing.myqcloud.com/' + photoName;
                    // }
                    console.log(pImg+'===pImg');
                    pCallBack && pCallBack(pImg, ret);
                    pCallBack = null;
                }
            } else {
                fnUploadToAliYunOss(fileurl,pCallBack)
            }
        });
    }
}
