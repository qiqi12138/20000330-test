var arrData = [];
(function() {
    var newData = new Date();
    for (var y = 100; y > 0; y--) {
        var year = newData.getFullYear() + 1 - y+"年";
        var _dataJson = {};
        _dataJson.name = year;
        _dataJson.children = [];
        if (parseInt(year) == newData.getFullYear()) {
            for (var m = 0; m < newData.getMonth() + 1; m++) {
                var month = fnZero(parseInt(m) + 1)+"月";
                var monthData = {};
                monthData.name = month;
                monthData.children = [];
                var dataLength = 28;
                if (parseInt(month) == newData.getMonth() + 1) {
                    dataLength = newData.getDate();
                } else if (month == "04月" || month == "06月" || month == "09月" || month == "11月") { //1 3 5 7 8 10 11
                    dataLength = 30;
                } else if (month == "01月" || month == "03月" || month == "05月" || month == "07月" || month == "08月" || month == "10月" || month == "12月") {
                    dataLength = 31;
                } else if ((parseInt(year) % 4 == 0) && (parseInt(year) % 100 != 0 || parseInt(year) % 400 == 0) && (month == "02月")) {
                    dataLength = 29;
                }
                for (var d = 0; d < dataLength; d++) {
                    var data = fnZero(parseInt(d) + 1)+"日";
                    var dataData = {};
                    dataData.name = data;
                    monthData.children.push(dataData)
                }

                _dataJson.children.push(monthData)
            }
        } else {
            for (var m = 0; m < 12; m++) {
                var month = fnZero(parseInt(m) + 1)+"月";
                var monthData = {};
                monthData.name = month;
                monthData.children = [];
                var dataLength = 28;
                if (month == "04月" || month == "06月" || month == "09月" || month == "11月") { //1 3 5 7 8 10 11
                    dataLength = 30;
                } else if (month == "01月" || month == "03月" || month == "05月" || month == "07月" || month == "08月" || month == "10月" || month == "12月") {
                    dataLength = 31;
                } else if ((parseInt(year) % 4 == 0) && (parseInt(year) % 100 != 0 || parseInt(year) % 400 == 0) && (month == "02月")) {
                    dataLength = 29;
                }
                for (var d = 0; d < dataLength; d++) {
                    var data = fnZero(parseInt(d) + 1)+"日";
                    var dataData = {};
                    dataData.name = data;
                    monthData.children.push(dataData)
                }

                _dataJson.children.push(monthData)
            }
        }
        arrData.push(_dataJson)
    }
})();

function fnZero(num) {
    return num >= 10 ? num : '0' + num;
}
