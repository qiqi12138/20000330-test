/********************************************************************************
 *增加db模块
 *增加了DB2()函数方法
 *********************************************************************************/
/**
 * [DB 本地缓存封装对象]
 * @param {[Dom元素]} pListEl       [选填，列表的外部HTML容器]
 * @param {[Dom元素]} pTemplateEl [选填，单元格的DOT模版容器]
 * 说明：1.List的形参不为空，则实例化时，自动进行内部赋值，否则，需手动调用SetUI和SetTemplate方法赋值；
 * 		2.在使用刷新、加载方法前，必须先定义列表的外部HTML容器和单元格的DOT模版容器；
 */

function STORAGE() {
    var _DBKEY = 'news'; //数据库默认名字
    var _DBMODULE = api.require('db'); //数据库模块

    function _init() { //初始化 1.添加db模块 2.打开数据库，没有则新建 3.新建数据库的同时新建未登录状态下的表
        var ret = _DBMODULE.openDatabaseSync({
            name: _DBKEY
        })
    }

    function _decide(tableName, pCallback) { //判断表是否存在
        var sql = "SELECT count(*) as 'dbName' FROM sqlite_master WHERE type='table' AND name='" + tableName + "'"
        var ret = _DBMODULE.selectSqlSync({
            name: _DBKEY,
            sql: sql
        });
        console.log(JSON.stringify(ret))
        pCallback(ret);
    }

    function _creatTable(sql, pCallback) { //创建表
        // var exeSql = 'CREATE TABLE collTable(userId varchar(32), Id_P varchar(32),title varchar(200), pic varchar(300), readDate varchar(50),readDate1 varchar(50))'
        var ret = _DBMODULE.executeSqlSync({
            name: _DBKEY,
            sql: sql
        });
        console.log(JSON.stringify(ret))
        pCallback(ret);
    }


    function _save(sql,pCallback) { //添加数据
        //  var sql="insert into collTable (userId,Id_P,title,pic,readDate) VALUES('111','222','3333','4444','5555')"
        var ret = _DBMODULE.executeSqlSync({
            name: _DBKEY,
            sql: sql
        });
        console.log(JSON.stringify(ret))
        pCallback(ret);

    }

    function _selectSql(sql, pCallback) { //查询操作
        // var sql = "SELECT * FROM collTable where userId='" + pUserKey + "'" + "order by readDate1 desc"
        var ret = _DBMODULE.selectSqlSync({
            name: _DBKEY,
            sql: sql
        });
        console.log(JSON.stringify(ret))
        pCallback(ret);
    }

    _init();
    var _obj = {
        decide: function(tableName, pCallback) {
            _decide(tableName, pCallback)
        },
        creatTable: function(sql, pCallback) {
            _creatTable(sql, pCallback);
        },

        save: function(sql, pCallback) {
            _save(sql, pCallback);
        },
        selectSql: function(sql, pCallback) {
            _selectSql(sql, pCallback);
        },

    }
    return _obj;
}
