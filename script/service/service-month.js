var arrData = [];
(function() {
    var newData = new Date();
    var _minYear = 2019;
    var _maxYear = newData.getFullYear()-_minYear + 3
    for (var y = 0; y < _maxYear; y++) {
        var year = _minYear + y + "年";
        var _dataJson = {};
        _dataJson.name = year;
        _dataJson.children = [];
        for (var m = 0; m < 12; m++) {
            var month = fnZero(parseInt(m) + 1) + "月";
            var monthData = {};
            monthData.name = month;
            monthData.children = [];
            _dataJson.children.push(monthData)
        }

        arrData.push(_dataJson)
    }
})();

function fnZero(num) {
    return num >= 10 ? num : '0' + num;
}
