function fnInitPlay() {
    fnInit();
    fnSetPrefs();
    //是否显示frm
    api.addEventListener({
        name: 'isShowPlayFrm'
    }, function(ret, err) {
        if (ret) {
            if (!(ret.value.isShow)) {
                fnVideoPlay('0');
            }
        }
    });
    //播放/暂停
    api.addEventListener({
        name: 'setIsPlay'
    }, function(ret, err) {
        if (ret) {
            if (vm.playId != '') {
                if (ret.value.isClearPrefs) {
                    fnVideoPlay('0');
                    fnSetPrefs();
                } else if (ret.value.isPlay) {
                    fnVideoPlay(ret.value.isPlay);
                }
            }
        }
    });
    //设置播放第几个
    api.addEventListener({
        name: 'setCatalogIndex'
    }, function(ret, err) {
        if (ret) {
            if (vm.playMode == '2' && (vm.catalog.length - 1) == vm.catalogIndex) {
                fnToast("已经是最后一节了哦~");
            } else {
                var _catalogIndex;
                if (vm.catalog.length - 1 == vm.catalogIndex) {
                    _catalogIndex = 0;
                } else {
                    _catalogIndex = vm.catalogIndex + 1;
                };
                fnSetCatalog(_catalogIndex, '1')
            }
        }
    });

    //当前播放的信息
    api.addEventListener({
        name: 'setPlayPrefs'
    }, function(ret, err) {
        if (ret) {
            console.log(JSON.stringify(ret))
            vm.catalog = ret.value.catalog || [];
            vm.catalogIndex = ret.value.catalogIndex || 0;
            vm.playMode = ret.value.playMode || "";
            if (ret.value.isPlay == '1' && ret.value.playType == '1' && ret.value.playUrlType == '1') {
                fnSetHeaderAudioListen(ret.value.playId)
            }
            api.setPrefs({
                key: 'isPlay',
                value: ret.value.isPlay || "1"
            });
            api.setPrefs({
                key: 'playType',
                value: ret.value.playType || ""
            });
            api.setPrefs({
                key: 'playUrlType',
                value: ret.value.playUrlType || ""
            });
            api.setPrefs({
                key: 'playId',
                value: ret.value.playId || ""
            });
            api.setPrefs({
                key: 'playCover',
                value: ret.value.playCover || ""
            });
            api.setPrefs({
                key: 'playUrl',
                value: ret.value.playUrl || ""
            });
            api.setPrefs({
                key: 'currentTime',
                value: ret.value.currentTime || "0"
            });
            setTimeout(function() {
                fnGetPrefs();
            }, 300)
        }
    });

}


function fnInit() {
    vm = new Vue({
        el: ".vueApp",
        data: {
            isPlay: "0", //1播放
            playType: "1", //1点心 2课程
            playUrlType: "1", //1音频 2视频
            playId: "",
            playCover: "",
            catalogIndex: "",
            playMode: "", //1循环播放 2全部播放
            catalog: [],
            playUrl: "",
            currentTime: "0",
        },
        mounted: {

        },
        methods: {

        }
    })
}

function fnVideoPlay(key) {
    _playProject = document.getElementById("play_project");
    vm.isPlay = key;
    api.setPrefs({
        key: 'isPlay',
        value: vm.isPlay
    });
    if (key == '1') { //播放
        _playProject.currentTime = vm.currentTime;
        _playProject.play();
        vm.isPlayed = true;
        // vm.duration = _playProject.duration && _playProject.duration > 0 ? _playProject.duration : 0;
        fnEvevtVideo();
    } else { //暂停
        _playProject.pause();
    }
    api.sendEvent({
        name: 'changePlayInfo',
        extra: {
            isPlay: vm.isPlay,
            playType: vm.playType,
            playCover: vm.playCover
        }
    });
}



function fnEvevtVideo() {
    _playProject = document.getElementById("play_project");
    _playProject.addEventListener("timeupdate", function() {
        vm.currentTime = _playProject.currentTime;
        api.setPrefs({
            key: 'currentTime',
            value: vm.currentTime
        });
        // vm.duration = _playProject.duration && _playProject.duration > 0 ? _playProject.duration : 0;
    });

    _playProject.addEventListener('ended', fnEnd, false);
}

function fnEnd() {
    vm.courseCatalog[vm.catalogIndex].endLookTime = parseInt(_playProject.currentTime);
    if (!(vm.courseCatalog[vm.catalogIndex].matterTime > vm.courseCatalog[vm.catalogIndex].endLookTime)) {
        vm.courseCatalog[vm.catalogIndex].status = '1';
    }
    // fnSetEndLookTime();
    fnVideoEnd();
    console.log(new Date());
    _playProject.removeEventListener("ended", fnEnd, false);
}

function fnVideoEnd() {
    vm.isPlay = '0';
    if (vm.playType == '1') {
        api.sendEvent({
            name: 'setIsPlay',
            extra: {
                isPlay: '0',
                isClearPrefs: true
            }
        });
    } else {
        if (vm.catalog.length > 0) {
            if (vm.playMode == '2' && (vm.catalog.length - 1) == vm.catalogIndex) {
                fnSetCatalog("", '0');
                setTimeout(function() {
                    api.sendEvent({
                        name: 'setIsPlay',
                        extra: {
                            isPlay: '0',
                            isClearPrefs: true
                        }
                    });
                }, 500)
            } else {
                var _catalogIndex;
                if (vm.catalog.length - 1 == vm.catalogIndex) {
                    _catalogIndex = 0;
                } else {
                    _catalogIndex = vm.catalogIndex + 1;
                };
                fnSetCatalog(_catalogIndex, '1')
            }
        }else{
            api.sendEvent({
                name: 'setIsPlay',
                extra: {
                    isPlay: '0',
                    isClearPrefs: true
                }
            });
        }
    }
}

function fnSetPrefs() {
    api.setPrefs({
        key: 'isPlay',
        value: "0"
    });
    api.setPrefs({
        key: 'playType',
        value: ""
    });
    api.setPrefs({
        key: 'playUrlType',
        value: ""
    });
    api.setPrefs({
        key: 'playId',
        value: ""
    });
    api.setPrefs({
        key: 'playCover',
        value: ""
    });
    api.setPrefs({
        key: 'playUrl',
        value: ""
    });
    api.setPrefs({
        key: 'currentTime',
        value: 0
    });

    vm.catalog = [];
    vm.catalogIndex = "";
    vm.playMode = "";
    setTimeout(function() {
        fnGetPrefs();
    }, 300)
}

function fnGetPrefs() {
    vm.isPlay = api.getPrefs({
        sync: true,
        key: 'isPlay'
    }) || "";
    vm.playType = api.getPrefs({
        sync: true,
        key: 'playType'
    }) || "";
    vm.playUrlType = api.getPrefs({
        sync: true,
        key: 'playUrlType'
    }) || "";
    vm.playId = api.getPrefs({
        sync: true,
        key: 'playId'
    }) || "";
    vm.playCover = api.getPrefs({
        sync: true,
        key: 'playCover'
    }) || "";
    vm.playUrl = api.getPrefs({
        sync: true,
        key: 'playUrl'
    }) || "";
    vm.currentTime = api.getPrefs({
        sync: true,
        key: 'currentTime'
    }) || 0;
    vm.$nextTick(function() {
        if (vm.isPlay == '1') {
            fnVideoPlay('1');
            api.sendEvent({
                name: 'isShowPlayFrm',
                extra: {
                    isShow: true,
                }
            });
        }
        api.sendEvent({
            name: 'playId',
            extra: {
                playType: vm.playType,
                playId: vm.playId
            }
        });
    })
}

function fnSetCatalog(index, isNextPlay) {
    fnSetEndLookTime();
    if (isNextPlay == '1') {
        vm.catalogIndex = index;
        console.log(JSON.stringify(vm.catalog) + "----" + vm.catalogIndex)
        _currentTime = vm.catalog[vm.catalogIndex].endLookTime == "" ? 0 : vm.catalog[vm.catalogIndex].endLookTime;
        _duration = vm.catalog[vm.catalogIndex].matterTime;
        api.sendEvent({
            name: 'setPlayPrefs',
            extra: {
                isPlay: "1",
                playType: "2", //1点心 2课程
                playId: vm.playId || "",
                playUrlType: vm.playUrlType, //1音频 2视频
                playCover: vm.playCover || "",
                catalog: vm.catalog,
                playUrl: vm.catalog[vm.catalogIndex].url,
                catalogIndex: vm.catalogIndex,
                playMode: vm.playMode, //1循环播放 2全部播放
                currentTime: (_currentTime / _duration) > 0.98 ? 0 : _currentTime,
            }
        });
    }
}

function fnSetEndLookTime() {
    console.log(JSON.stringify(vm.catalog) + "----" + vm.catalogIndex)
    var postData = {
        matterId: vm.catalog[vm.catalogIndex].id,
        endLookTime: vm.currentTime,
        courseId: vm.playId
    }
    $S.POST("apiCrouse/saveMatterRecord", postData, function(ret, err) {
        if (ret && ret.status == '200') {
            // fnCourseCatalog();
            for (var i = 0; i < vm.catalog.length; i++) {
                if (vm.catalog[i].id == postData.matterId) {
                    vm.catalog[i].endLookTime = parseInt(postData.endLookTime);
                }
            }
        }
        // vm.isSubmitEndLookTime = false;
    })
}


function fnSetHeaderAudioListen(playId) {
    var postData = {
        id: playId
    }
    $S.POST("newAddInterface/updatePastryListenNum", postData, function(ret, err) {
        if (ret && ret.status == '200') {

        }
    })
}
