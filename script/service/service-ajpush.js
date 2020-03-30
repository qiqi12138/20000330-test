/********************************************************************************
* writer: vico
* create date: 2018-11-18
* description:封装极光推送ajpush  使用前需在控制台添加该模块后再使用
* 暴露三个方法 fnStartAJPush  fnStopAJPush   fnChangeBindTags
*********************************************************************************/


(function(window){
  "user strict";

  var ajpush = function(){
    this._init();
  }

  var _ajpush;
  ajpush.prototype = {
    _init:function(params){//初始化极光推送模块
      _ajpush = api.require('ajpush');
    },
    _fnInitAJPush:function(pCallBack){//init 极光推送，安卓端
      console.log("_fnInitAJPush")
      _ajpush.init(
          function(ret) {
                 console.log("_fnInitAJPush"+JSON.stringify(ret))
                 pCallBack(ret)
          }
      );
    },
    _fnCheckIsStopedPush:function(pCallBack1,pCallBack2){//查询是否停止了推送
      console.log("_fnCheckIsStopedPush")
      _ajpush.isPushStopped(function(ret) {
          if (ret && ret.isStopped == 1) {
              console.log("【绑定状态未绑定】" + JSON.stringify(ret));
              pCallBack1();//未绑定状态下逻辑
          } else { //未绑定状态，重新绑定
              console.log("【绑定状态已绑定】" + JSON.stringify(ret))
              pCallBack2();//已绑定状态下逻辑
          }
      });
    },
    _fnResumePush:function(pCallBack){//恢复推送
      _ajpush.resumePush(function(ret) {
          if (ret && ret.status) {
              pCallBack();
          }else{
              console.log('【恢复推送失败】'+ JSON.stringify(ret))
          }
      });
    },
    _fnBindTags:function(pParams,pCallBack){//绑定别名
      console.log('_fnBindTags')
      var tParam = {
          alias: pParams.alias,
          tags:  pParams.tags
      }
      _ajpush.bindAliasAndTags(tParam, function(ret) {
          if (ret) {
              console.log('_fnBindTags'+JSON.stringify(ret))
              pCallBack()
          }else{
              console.log('【绑定别名失败】'+JSON.stringify(ret))
          }
      })
    },
    _fnBindAndListen:function(pParam,pCallBack){ //绑定别名并设置监听
       console.log('fnBindAndListen')
       var self = this
       this._fnBindTags(pParam,function(){

           _ajpush.setListener(
               function(ret) {
                   pCallBack(ret);
               }
           )
       })
    },
    /**
     * 设置item的对象属性参数
     * @param  {Object} pParam   绑定别名需要得参数
     *  例：tParam = {
            alias: USER.Get('custId', true),
            tags: ['tag1', 'tag2']
        }
     * @param  {callback} pCallBack  绑定别名成功后回调
     *
     */
    fnStartAJPush:function(pParam,pCallBack){  //开始极光推送
       var tSystemType = api.systemType;
       var self = this;
       if (tSystemType == 'ios') {
           self._fnCheckIsStopedPush(
             function(){
                  self._fnResumePush(function(){
                  self._fnBindAndListen(pParam,pCallBack);
                  })
             },function(){
                  self._fnBindAndListen(pParam,pCallBack);
             }
           )
       } else {
           //初始化
           console.log('anzhuo')
           self._fnInitAJPush(function(ret,err){
                console.log(JSON.stringify(ret));
                if(ret && ret.status){
                  console.log("init")
                  self._fnCheckIsStopedPush(
                    function(){
                         self._fnResumePush(function(){
                         self._fnBindAndListen(pParam,pCallBack);
                         })
                    },function(){
                         console.log('推送未被停止，开始绑定')
                         self._fnBindAndListen(pParam,pCallBack);
                    }
                  )
                }
           })
       }
    },
    fnStopAJPush:function(){//停止极光推送
      if (_ajpush) {
          _ajpush.stopPush(function(ret) {
              if (ret && ret.status) {
                  console.log('【推送停止了】'+JSON.stringify(ret))
              }
          });
      } else {
          console.log('【没有开启推送】'+JSON.stringify(ret))
      }
    },
    /**
     * 换绑
     * @param  {Object} pParam   绑定别名需要得参数
     *  例：tParam = {
            alias: USER.Get('custId', true),
            tags: ['tag1', 'tag2']
        }
     * @param  {callback} pCallBack  绑定别名成功后回调
     *
     */
    fnChangeBindTags:function(pParam,pCallBack){ //更换绑定的别名
      _ajpush.bindAliasAndTags(pParam, function(ret) {
          console.log('【换绑定成功】'+JSON.stringify(ret))
          if (pCallBack) {
              pCallBack()
          };
      });
    }
  }
  window.ajpush = ajpush;

})(window)
