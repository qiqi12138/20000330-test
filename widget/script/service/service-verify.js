/********************************************************************************
 *正则验证
 *非空验证、正则验证、长度验证 fnVerify()
 *正则验证 fnRegularVerify()
 *toast提示封装 fnToast()
 *********************************************************************************/
var cardCity = { //身份证前两位的地区验证时，用到的参数。
    11: "北京",
    12: "天津",
    13: "河北",
    14: "山西",
    15: "内蒙古",
    21: "辽宁",
    22: "吉林",
    23: "黑龙江",
    31: "上海",
    32: "江苏",
    33: "浙江",
    34: "安徽",
    35: "福建",
    36: "江西",
    37: "山东",
    41: "河南",
    42: "湖北",
    43: "湖南",
    44: "广东",
    45: "广西",
    46: "海南",
    50: "重庆",
    51: "四川",
    52: "贵州",
    53: "云南",
    54: "西藏",
    61: "陕西",
    62: "甘肃",
    63: "青海",
    64: "宁夏",
    65: "新疆",
    71: "台湾",
    81: "香港",
    82: "澳门",
    91: "国外"
};
var verify = [{ //确保身份证号验证在最后一项
    type: "_telphone", //手机号的正则验证
    regular: /^[1][3,4,5,6,7,8,9][0-9]{9}$/
},{
    type: "_userName", //用户名的正则验证(数字或字母)
    regular: /^[\da-zA-Z0-9]+$/
}, {
    type: "_email", //邮箱的正则验证
    regular: /^[a-zA-Z0-9_-]+(\.|[a-zA-Z0-9_-]+)+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
}, {
    type: "_passwordAnd", //密码的正则验证(数字+字母)
    regular: /^(?![0-9]+$)(?![a-zA-Z]+$)[\da-zA-Z0-9]+$/
},{
    type: "_password", //密码的正则验证(数字或字母)
    regular: /^[\da-zA-Z0-9]+$/
}, {
    type: "_card", //身份证的正则验证
    regular: /^\d{17}([0-9]|X|x)$/
},{
    type: "_realName", //昵称的正则验证(汉字、数字、字母)
    regular:/^[a-zA-Z0-9\u4e00-\u9fa5]+$/
},{
    type: "_chinese", //真实姓名的正则验证(汉字)
    regular:/^[\u4e00-\u9fa5]+$/
},{
    type:"_code",//验证码
    regular:/^\d{6}$/
},{
    type:"_dutyCode",//税号
    regular:/^(\w{15}|\w{18}|\w{20})$/
},{
    type:"English_name",
    regular:/^[A-Za-z\s]+(·[\A-Za-z]+)*$/
},{
    type:"bank_card",//银行卡
    regular:/^([1-9]{1})(\d{14,18})$/,
},{
    type:"cardNo",
    regular:/^[\da-zA-Z0-9]+$/
},{
    type:"classHour",
    regular:/^([0]*[1-9]|[1-9])[0-9]*$/
},{
    type:"classPrice",
    regular:/((^[1-9]\d*)|^0)(\.\d{0,2}){0,1}$/
}]; //验证的类型和正则组成的JSON串


//非空验证、正则验证、长度验证
function fnVerify(fromDiv) { //获取需要表单验证的div元素
    console.log("进入验证");
    //fromDiv,包含所有input框的外部div标签的id。
    var _fromJson = []; //提交验证时的JSON
    var _input = document.getElementById(fromDiv).getElementsByTagName("input"); //获取指定的fromDiv元素中所有的input框
    //获取所有的input框 需要验证的类型
    for (var j = 0; j < _input.length; j++) {
        // data-verify 代表是否进行验证
        if (_input[j].dataset.verify == "true") { //true为验证，false为不验证
            console.log(_input[j].dataset.verify)
            var fromJson = {};
            //需要验证的input框的id value name
            fromJson.pId = _input[j].getAttribute("id");
            fromJson.pValue = _input[j].value;
            fromJson.pName = _input[j].getAttribute("name"); //主要用于后期提示
            //data-null 代表是否进行非空验证
            if (_input[j].dataset.null) {
                fromJson.isNull = JSON.parse(_input[j].dataset.null);
            } else {
                fromJson.isNull = false;
            }
            //data-regular 代表是否进行正则验证
            if (_input[j].dataset.regular == "true") { //正则验证
                fromJson.isReg = JSON.parse(_input[j].dataset.regular);
                //如果进行正则验证，则必须上传正则验证的类型
                if (_input[j].dataset.type) { //正则验证
                    fromJson.pType = _input[j].dataset.type;
                } else {
                    console.log(_input[j].getAttribute("name") + "未设置验证类型，无法正常完成正则验证")
                }
            } else {
                fromJson.isReg = false;
            }
            //需要验证的元素的长度由minlength、maxlength两属性决定
            fromJson.isLength = [];
            var _minLength = _input[j].getAttribute("minlength");
            var _maxLength = _input[j].getAttribute("maxlength")
            if (_minLength || _maxLength) { //正则验证
                fromJson.pId = _input[j].getAttribute("id");
                if (_minLength && _minLength != "") {
                    fromJson.isLength[0] = JSON.parse(_minLength);
                } else {
                    fromJson.isLength[0] = 0;
                }
                if (_maxLength && _maxLength != "") {
                    fromJson.isLength[1] = JSON.parse(_maxLength);
                } else {
                    fromJson.isLength[1] = 200;
                    //对于只设定最小长度，未设定最大长度的元素添加提示，同时默认设置最大长度为200
                    console.log(_input[j].getAttribute("name") + "未设置最大长度")
                }
            } else {
                fromJson.isLength = false;
            }
            _fromJson.push(fromJson);
        }
    }
    console.log(JSON.stringify(_fromJson)); //打印需要提交验证的json
    if (_fromJson && _fromJson.length > 0) {
        for (var j = 0; j < _fromJson.length; j++) {
            if (_fromJson[j].pValue == "") {
                if (_fromJson[j].isNull) { //是否验证非空
                    var msg = '请输入'+_fromJson[j].pName;
                    // if(_fromJson[j].pType=='_telphone'){
                    //     msg =
                    // }
                    fnToast(msg);
                    return;
                }
            } else if (_fromJson[j].pValue.replace(/\s+/g, "") == "") {
                if (_fromJson[j].isNull) { //是否验证非空
                    document.getElementById(fromDiv).getElementsByTagName("input")[j].value = "";
                    var msg = '您没有输入' + _fromJson[j].pName + '，请重新输入';
                    fnToast(msg);
                    return;
                }
            } else {
                if (_fromJson[j].isReg) { //是否验证正则
                    var state = fnRegularVerify(_fromJson[j].pType, _fromJson[j].pValue, _fromJson[j].pName);
                    console.log(state)
                    if (!state) { //state=false时，终止循环
                        return;
                    }
                }
                if (_fromJson[j].isLength) {
                    if (_fromJson[j].pValue.length < _fromJson[j].isLength[0] || _fromJson[j].pValue.length > _fromJson[j].isLength[1]) {
                        var msg = _fromJson[j].pName + '的长度应限制在' + _fromJson[j].isLength[0] + "-" + _fromJson[j].isLength[1] + "之间";
                        fnToast(msg);
                        return;
                    }
                    // else if (_fromJson[j].pValue.length > _fromJson[j].isLength[1]) {
                    //     var msg = _fromJson[j].pName + '的最大长度为' + _fromJson[j].isLength[1];
                    //     fnToast(msg);
                    //     return;
                    // }
                }
            }
        }
        return true;
    }else{
        return true;
    }
}


//正则验证
function fnRegularVerify(inputType, inputVal, inputName) {
    console.log("进入正则验证");
    inputType = inputType.split(",")
    console.log(inputType);
    var _verifyCard = "false";
    var _verifyType = "false";
    for (var z = 0; z < verify.length; z++) {
        for (var i = 0; i < inputType.length; i++) {
            if (inputType[i] == verify[z].type) {
                if (verify[z].regular.test(inputVal)) {
                    _verifyType = "true";
                    if (inputType[i] == "_card") { //对身份证号进行生日和区域的再次验证
                        _verifyType = "false";
                        _verifyCard = "true";
                    }
                }
            }
        }
    }
    console.log(_verifyType)
    if (_verifyType == "true") {
        return true;
    } else {
        if (_verifyCard == "true") { //对身份证号进行生日和区域的再次验证
            var birthday = inputVal.substr(6, 4) + "-" + Number(inputVal.substr(10, 2)) + "-" + Number(inputVal.substr(12, 2));
            var d = new Date(birthday.replace(/-/g, "/"));
            console.log(birthday)
            if (cardCity[parseInt(inputVal.substr(0, 2))] == null) {
                var msg = inputName + '格式错误';
                fnToast(msg);
                return false;
            }
            if (birthday != (d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate())) {
                console.log(d.getFullYear());
                var msg = inputName + '格式错误';
                fnToast(msg);
                return false;
            }
            return true;
        } else {
            var msg = inputName + '格式错误';
            if(inputType=='_telphone'){
                msg = '请输入正确的'+inputName;
            }else if(inputType=='cardNo'){
                msg = inputName+'由8-24位数字或字母组成';
            }
            fnToast(msg)
            return false;
        }

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
        global:true,
    });
}
