/**
 * Created by xujun on 2016/7/1.
 */
app.controller('resultCtrl', function ($scope, $rootScope, $http, $window, $location, $interval, $timeout, $q, scheduleTableViewModelService, tool, http) {
    $(".table-dialog-window").hide();
    $(".cache-window").hide();
    //锁定期
    var fact_days;
    //日历周期，目前设置为7天
    var offset = 6;
    //通过json查询的对象声明
    var minStartTime, maxEndTime, queryObject, tableHeadViewModel, tableBodyViewModel;

    //微调是否有操作
    var hasChange = false;
    //设备
    var goEquipment = {};
    var goInfo = {};
    var goWindowTableData = {};

    //用户名
    // $scope.userName = $rootScope.userName;
    //本地存储的地点，避免用户刷新手动微调页面丢失数据
    $rootScope.current_location = sessionStorage.locationId_res;
    $rootScope.currentShowLocationName = sessionStorage.currentShowLocationName;
    //校验开关，默认关闭
    $scope.checkSwitch = false;
    //初始化查询日期
    var today = new Date();
    //查询条件
    var startTime;
    var endTime;
    //是否进行搜索提示操作
    var ifSearchMsg = false;
    //if($rootScope.daily_test){today.setFullYear(2016,10,1);}//测试用代码，用于日常环境每次打开显示的为7月1日而不是今天
//      startTime = xujun_tool.dateToString(today);//开始时间为今天
//      endTime =  xujun_tool.dateToString(new Date(today.setDate(today.getDate() + offset)));//结束时间为今天之后的7天

    /**************以下是本页实际执行的代码，上面都为函数和事件绑定****************/

    /**
     * 地点显示
     **/
    var thisUrl = $rootScope.restful_api.aps_location_writable;
    http.get({
        url: thisUrl,
        successFn: function (res) {
            var resData = res.data;
            $scope.resData = resData;
            var resData_body,
                arr_scheme = [];  //存方案
            for (var i = 0; i < resData.length; i++) {   //排程方案与显示地点匹配
                if (resData[i].schemeId == sessionStorage.schemeId) {
                    resData_body = resData[i].locationDtoList;
                    $(".scheme-select").text(resData[i].schemeName);   //显示方案名称
                }
            }

            //存储当前地点树的地点
            var defaultList_res = [];
            for (var i in resData_body) {
                defaultList_res.push(resData_body[i].locationId);
            }
            sessionStorage.defaultList_res = defaultList_res;

            //处理数据,并绑定到页面
            $scope.folder = scheduleTableViewModelService.getData__result(resData_body)[0];

            //获取决定显示方案的地点1先获取所有地点2然后获取共有父元素
            sessionStorage.locationId_res = $rootScope.locationId_res = tool.getCommonLocationId(getAllLocationId(resData_body));
            $rootScope.defaultLocation = [];

            var outerEle = $(".location-list");
            outerEle  //改变状态
                .on("click", "ul span", function () {
                    if ($(this).next().find("ul li").length == 0) {
                        return;
                    } else {
                        $(this).toggleClass("active").toggleClass("open");
                        $(this).next().toggle();
                    }

                    //设置前面线的高度
                    let thisB = $(this).parents("ul").children("b");
                    let thisLI = $(this).parents("ul").children("li");
                    let thisHeight = 0;
                    for (var i = 0; i < thisLI.length - 1; i++) {
                        thisHeight += $(thisLI[i]).height();
                    }
                    thisB.height(thisHeight + 100);

                    //改变按钮的位置
                    var bgPosition = $(".location-choose").width();
                    $(".out-bg").width(bgPosition);
                })
                .on("click", "ul i", function () {
                    //改变状态
                    changeSelectStatus($(this));
                    //单选操作
                    $(this).parent().siblings("li").children("i").attr("class", "select-status unselect");
                })

            // $timeout(function () {
                //移除 s 标记
                var clickSpan = $(".location-list").find("span");
                clickSpan.each(function () {
                    if ($(this).next().find("li").length == 0) {
                        $(this).children("s").removeClass("open-btn");
                    } else {
                        $(this).children("s").addClass("open-btn");
                    }
                })
            // }, 100)

            //选择方案显示
            $(".scheme-select").on("click", function () {
                if ($(".location-scheme-option").css("display") == "none") {
                    $(".location-scheme-option").slideDown(80);
                    $(this).addClass("select-li");
                    return;
                } else if ($(".location-scheme-option").css("display") == "block") {
                    $(".location-scheme-option").slideUp(80);
                    $(this).removeClass("select-li");
                    return;
                }
            })
            $(".location-scheme-option").on("click", "li", function () {
                $(".location-scheme-option").slideUp(80);
                $(".scheme-select").text($(this).text());

                //是否有子地点    没有则移除 s 标记
                var clickSpan = $(".location-list").find("span");
                clickSpan.each(function () {
                    if ($(this).next().find("li").length == 0) {
                        $(this).children("s").removeClass("open-btn");
                    } else {
                        $(this).children("s").addClass("open-btn");
                    }
                })
            })

        }
    });
    //默认勾中第一个
    $timeout(function () {
        var defaultEle = $(".location-list").children("ul").children("li:eq(0)").children("i")
        var defaultId = defaultEle.attr("data-location-id");
        if (sessionStorage.locationId_res && sessionStorage.defaultList_res.indexOf(sessionStorage.locationId_res) > -1) {
            //判断缓存是否为当前地点树的地点
            $("i[data-location-id=" + sessionStorage.locationId_res + "]").click();
            //为空时显示全部
            sessionStorage.locationFilterList_res = "";
        } else {
            $("i[data-location-id=" + defaultId + "]").click();
            // sessionStorage.locationId_res = $rootScope.locationId_res;
            sessionStorage.locationFilterList_res = [];
        }
        $rootScope.getsessionStorage(sessionStorage.locationId_pre, sessionStorage.locationId_res);
        //获取合并规则
        http.get({
            url: $rootScope.restful_api.group_by,
            successFn: function (res) {
                var thisObj = res.data.selectList;
                if (thisObj) {
                    $rootScope.showType = {
                        group_by: thisObj[0].valueContent,
                        cnName: "个" + thisObj[0].valueAlias
                    };
                } else {
                    $rootScope.showType = {
                        group_by: "processId",
                        cnName: "个工序"
                    };
                }

            },
            errorFn: function (res) {
                $rootScope.showType = {
                    group_by: "processId",
                    cnName: "个工序"
                };
            }
        });

        //获取默认翻转状态
        http.get({
            url: $rootScope.restful_api.front_back,
            successFn: function (res) {
                var info = res.data.selectList;
                $rootScope.frontBack = info[0].valueContent == 1 ? false : true;
            }
        })

        //获取显示天数
        http.get({
            url: $rootScope.restful_api.get_show_days,
            successFn: function (res) {
                var thisObj = res.data.selectList;
                offset = thisObj[0].valueContent - 1;
                startTime = tool.dateToString(today);//开始时间为今天
                endTime = tool.dateToString(new Date(today.setDate(today.getDate() + offset)));//结束时间为今天之后的7天
                result_show_table(sessionStorage.locationId_res, sessionStorage.locationFilterList_res);  //查询显示
            },
            errorFn: function (res) {
                offset = 6;
                startTime = tool.dateToString(today);//开始时间为今天
                endTime = tool.dateToString(new Date(today.setDate(today.getDate() + offset)));//结束时间为今天之后的7天
                result_show_table(sessionStorage.locationId_res, sessionStorage.locationFilterList_res);  //查询显示
            }
        });

        // 获取锁定期
        http.get({
            url: $rootScope.restful_api.get_freeze_days + "?schemeId=" + sessionStorage.schemeId,
            successFn: function (res) {
                var resData = res.data.lockDate; //锁定期
                if (resData) {
                    fact_days = resData; //锁定期(可预排最大日期)
                } else {
                    layer.alert('锁定期接口获取的数据发生错误,请联系技术人员', {
                        skin: 'layer-alert-themecolor' //样式类名
                    });
                }
            },
            errorFn: function (res) {
                layer.alert('获取锁定期失败,请联系技术人员', {
                    skin: 'layer-alert-themecolor' //样式类名
                });
            }
        });

        $(".out-bg").animate({width: "64px"}, 0);

        //pap相关接口body值
        var papBodyData = {
            "schemeId": parseInt(sessionStorage.schemeId),
            "locationDtoList": []
        };
        var papObj = {
            'locationId': sessionStorage.locationId_res,
            'locationFilterList': []
        };
        papBodyData.locationDtoList.push(papObj);
        sessionStorage.setItem("papBodyData", JSON.stringify(papBodyData));
    }, 50);
    // 初始化剩余条数
    $timeout(function () {
        var sUrl = $rootScope.restful_api.cache_info + "?schemeId=" + sessionStorage.schemeId;
        http.get({
            url: sUrl,
            successFn: function (res) {
                var cacheNum = res.data.row.length;
                if (cacheNum > 999) {
                    cacheNum = "999+";
                }
                if (cacheNum == 0) {
                    $(".cache-num").hide();
                    return;
                }
                $(".cache-num").show().text(cacheNum);
            },
            errorFn: function (res) {
            }
        });
        $scope.hideButton();//前拉后推按钮
    }, 60);

    //改变地点树状态方法
    function changeSelectStatus(thisSelect) {
        var thisSelect = thisSelect;
        //本身及所有后代的改变
        if (thisSelect.hasClass("select-some") || thisSelect.hasClass("unselect")) {
            thisSelect.attr("class", "select-status selected active");
            thisSelect.parent("li").find("ul i").attr("class", "select-status selected active");
        } else {
            thisSelect.attr("class", "select-status unselect");
            thisSelect.parent("li").find("ul i").attr("class", "select-status unselect");
        }
        //处于其影响范围内的祖先的改变
        thisSelect.parents("ul").each(function () {
            var thisTree = $(this);
            var thisStatus = thisTree.siblings(".select-status");
            if (thisTree.find(".selected").length < 1) {
                thisStatus.attr("class", "select-status unselect");
            } else if (thisTree.find(".unselect").length < 1) {
                thisStatus.attr("class", "select-status selected active");
            } else {
                thisStatus.attr("class", "select-status select-some");
            }
        })
    }

    /**
     * 显示临时派工单表的排程计划
     **/
    function result_show_table(location, locationFilterList) {
        //移除原有三级界面的jqueryUI dom    /* 2.7 modify */
//  		$("#do_detail_dialog").parent().remove();
        $rootScope.getsessionStorage(sessionStorage.locationId_pre, sessionStorage.locationId_res);

        //获取查询信息
        var saleOrder = tool.getFromInput(".sale-order"),
            materialName = tool.getFromInput(".material-name"),
            materialCode = tool.getFromInput(".material-code");

        var get_url = $rootScope.restful_api.result_show_table + "?locationFilterList=" + locationFilterList
            + "&startTime=" + startTime
            + "&endTime=" + endTime
            + "&schemeId=" + sessionStorage.schemeId;
        //获取和显示table数据

        http.get({
            url: get_url,
            successFn: function (response) {
                //保存数据供其他功能使用
                goEquipment = $.extend({}, response.data.punit);
                goInfo = $.extend({}, response.data);
                //冻结期
                response.data.freezeDate = fact_days;
                //是否翻转状态
                response.data.front = $rootScope.frontBack;
                //复制数据，差异化用
                $scope.later = $.extend({}, response.data);
                //json转viewModel对象
                tableHeadViewModel = scheduleTableViewModelService.jsonToTableHeadViewModel(response.data);

                //json转viewModel对象
                tableBodyViewModel = scheduleTableViewModelService.jsonToTableBodyViewModelNew(response.data);

                //有查询操作并且有查询成功的数据
                if (tableBodyViewModel.searchSuccess == "success_search" && ifSearchMsg) {
                    layer.msg('根据您的查询条件，已高亮出查询结果，请查看', {time: 3500, icon: 1});
                } else if (tableBodyViewModel.searchSuccess == "false_search" && ifSearchMsg) {
                    layer.msg('根据您的查询条件，未查询出结果', {time: 3500, icon: 2});
                } else if (tableBodyViewModel.searchSuccess == "allUnitNull" && ifSearchMsg) {
                    layer.msg('当前无工单，无法查询', {time: 3500, icon: 2});
                }

                //查询时间
                queryObject = scheduleTableViewModelService.jsonToQueryObject(response.data);
                if (queryObject == undefined) {
                    layer.alert('数据获取接口有问题，请联系技术人员处理', {
                        skin: 'layer-alert-themecolor' //样式类名
                    });
                    return;
                }
                minStartTime = queryObject.minStartTime;
                maxEndTime = queryObject.maxEndTime;

                //绑定view层
                $scope.tableHeadViewModel = tableHeadViewModel;
                $scope.tableBodyData = tableBodyViewModel.tableBodyData;
                //判断上一页下一页按钮是否能点
                checkQueryTime(startTime, endTime, today, maxEndTime);
                $(".page-select").css("pointer-events", "auto");
                $(".search-box").hide();
                $(".search-btn").removeClass("search-btn-click");
                //一级页面差异化
                if ($(".differ-btn").hasClass("active")) {
                    $scope.differentiation = [];
                    $(".differ-btn").toggleClass("active");
                    $scope.showDiffer();
                }
            },
            errorFn: function (response) {
                layer.alert('获取数据失败，请联系技术人员处理', {
                    skin: 'layer-alert-themecolor' //样式类名
                });
                $(".page-select").css("pointer-events", "auto");
            }
        });
    }

    //点击选择方案
    $scope.scheme_btn = function (id) {
        var resData_bodys;
        //排程方案与显示地点匹配
        for (var i = 0; i < resData.length; i++) {
            if (resData[i].schemeId == id) {
                resData_bodys = resData[i].locationDtoList;
            }
        }
        var defaultList_res = [];
        for (var i in resData_bodys) {
            defaultList_res.push(resData_bodys[i].locationId);
        }
        //存储当前地点树的地点
        sessionStorage.defaultList_res = defaultList_res;

        //绑定数据,显示
        $scope.folder = scheduleTableViewModelService.getData__result(resData_bodys)[0];

        //存储schemeId
        sessionStorage.schemeId = id;

        //默认值
        // $rootScope.locationId_res = resData_bodys[0].locationId;
        $rootScope.defaultLocation = [];

        //取消排程 往后台发送数据 (刷新新数据)
        var data_body = {
            'schemeId': '',
            'locationDtoList': []
        };
        for (var i = 0; i < defaultList_res.length; i++) {
            var objLocation = {};
            var locationDtoList = [];
            objLocation.locationId = defaultList_res[i];
            objLocation.locationFilterList = [];
            data_body.locationDtoList.push(objLocation);
            data_body.schemeId = id;
        }
        sessionStorage.setItem("cancel_data", JSON.stringify(data_body));

        //切换方案  默认勾中第一个地点
        $timeout(function () {
            var defaultEle = $(".location-list").children("ul").children("li:eq(0)").children("i");
            var defaultId = defaultEle.attr("data-location-id");

            $("i[data-location-id=" + defaultId + "]").click();
            $rootScope.getsessionStorage(sessionStorage.locationId_pre, sessionStorage.locationId_res);
            result_show_table(defaultId, '');  //查询显示
            //获取合并规则
            http.get({
                url: $rootScope.restful_api.group_by,
                successFn: function (res) {
                    var thisObj = res.data.selectList;
                    if (thisObj) {
                        $rootScope.showType = {
                            group_by: thisObj[0].valueContent,
                            cnName: "个" + thisObj[0].valueAlias
                        };
                    } else {
                        $rootScope.showType = {
                            group_by: "processId",
                            cnName: "个工序"
                        };
                    }
                },
                errorFn: function (res) {
                    $rootScope.showType = {
                        group_by: "processId",
                        cnName: "个工序"
                    };
                }
            });

            //获取默认翻转状态
            http.get({
                url: $rootScope.restful_api.front_back,
                successFn: function (res) {
                    var info = res.data.selectList;
                    $rootScope.frontBack = info[0].valueContent == 1 ? false : true;
                }
            })

            //获取显示天数
            http.get({
                url: $rootScope.restful_api.get_show_days,
                successFn: function (res) {
                    var thisObj = res.data.selectList;
                    offset = thisObj[0].valueContent - 1;
                    today = new Date();
                    startTime = tool.dateToString(today);//开始时间为今天
                    endTime = tool.dateToString(new Date(today.setDate(today.getDate() + offset)));//结束时间为今天之后的7天
                    ifSearchMsg = false;
                    result_show_table(sessionStorage.locationId_res, sessionStorage.locationFilterList_res);  //查询显示
                },
                errorFn: function (res) {
                }
            });
            //pap相关接口body值
            var papBodyData = {
                "schemeId": parseInt(sessionStorage.schemeId),
                "locationDtoList": []
            };
            var papObj = {
                'locationId': sessionStorage.locationId_res,
                'locationFilterList': []
            };
            papBodyData.locationDtoList.push(papObj);
            sessionStorage.setItem("papBodyData", JSON.stringify(papBodyData));

            //获取并改变点击按钮的位置
            var bgPosition = $(".location-choose").width();
            $(".out-bg").width(bgPosition);
            $(".location-title").width(bgPosition);
        }, 50)

        //重新获取锁定期
        http.get({
            url: $rootScope.restful_api.get_freeze_days + "?schemeId=" + sessionStorage.schemeId,
            successFn: function (res) {
                var resData = res.data.lockDate; //锁定期
                if (resData) {
                    fact_days = resData; //锁定期(可预排最大日期)
                } else {
                    layer.alert('锁定期接口获取的数据发生错误,请联系技术人员', {
                        skin: 'layer-alert-themecolor' //样式类名
                    });
                }
            },
            errorFn: function (res) {
                layer.alert('获取锁定期失败,请联系技术人员', {
                    skin: 'layer-alert-themecolor' //样式类名
                });
            }
        });

        //刷新暂存间
        $scope.cache_box_again = function () {
            var jCacheWindow = $(".cache-window");
            var jInfoShow = jCacheWindow.find(".info-show");
            var jInfoShowInput = jInfoShow.find("input");

            var inputList = tool.getFromInput(".cache-window .info-show"),
                saleOrderCode = inputList[0],
                materialName = inputList[1],
                materialCode = inputList[2];

            var sUrl = $rootScope.restful_api.cache_info + "?schemeId=" + sessionStorage.schemeId;
            http.get({
                url: sUrl,
                successFn: function (res) {
                    var cacheNum = res.data.row.length;
                    cacheNum > 0 ? $(".cache-num").show().text(cacheNum > 999 ? "999+" : cacheNum) : $(".cache-num").hide();
                    var windowTableData = scheduleTableViewModelService.jsonToWindowTableView(res.data);
                    $scope.cacheHeadDataView = windowTableData.headData;
                    $scope.cacheTableDataView = windowTableData.bodyData;
                    $timeout(function () {
                        tool.setTableHeadWidth($(".cache-window"));
                    }, 0);

                    //resize
                    $(window).on("resize", function () {
                        tool.setTableHeadWidth($(".cache-window"));
                    });

                    $timeout(function () {
                        //初始化复选框
                        $("input[name='StorageSingle'],input[name='StorageAll']").prop("checked", false);

                        //全选全不选
                        $("input[name=StorageAll]").on("click", function () {
                            var checkValue = $(this).is(':checked');
                            if (checkValue == true) {
                                $("input[name='StorageSingle']").prop("checked", true);
                            } else {
                                $("input[name='StorageSingle']").prop("checked", false);
                            }
                        });
                        /*复选框反选*/
                        $("body").on("click", "input[name='StorageSingle']", function () {
                            var chsub = $("input[name='StorageSingle']").length;
                            var checkedsub = $("input[name='StorageSingle']:checked").length;
                            if (chsub == checkedsub) {
                                $("input[name='StorageAll']").prop("checked", true);
                            } else {
                                $("input[name='StorageAll']").prop("checked", false);
                            }
                        });
                    }, 0);
                    //关闭暂存间
                    jCacheWindow.find(".close-window").on("click", function () {
                        jCacheWindow.hide();
                    })
                }
            });
        }
        $scope.cache_box_again();
        //提示
        layer.msg('方案已切换', {time: 3500, icon: 1});
    }

    $scope.differentiation = [];
	
	var ifDiffer = false;
	$scope.ifDiffer = false;
    $scope.showDiffer = function () {
        //获取查询信息
		$scope.ifDiffer = !$scope.ifDiffer;
        if ($scope.differentiation.length < 2) {
            var saleOrder = tool.getFromInput(".sale-order"),
                materialName = tool.getFromInput(".material-name"),
                materialCode = tool.getFromInput(".material-code");

            var front = $rootScope.restful_api.front_info + "?locationFilterList=" + sessionStorage.locationFilterList_res + "&startTime=" + startTime + "&endTime=" + endTime;
            //判断是否已存在差异化数据
            http.get({
                url: front,
                successFn: function (res) {
                    res = res.data;
                    //冻结期
                    res.freezeDate = fact_days;
                    //是否翻转状态
                    res.front = $rootScope.frontBack;

                    $scope.differentiation.push(res);
                    $scope.differentiation.push($scope.later);
                    http.get({
                        url: $rootScope.restful_api.differ_info + "?locationFilterList=" + sessionStorage.locationFilterList_res + "&schemeId=" + sessionStorage.schemeId + "&startTime=" + startTime + "&endTime=" + endTime,
                        successFn: function (respones) {
                            respones = respones.data;
                            $scope.dateId = [];

                            for (var i in respones) {
                                for (var j = 0; j < respones[i].length; j++) {
                                    var punitIdString = respones[i][j];
                                    $scope.dateId.push(i + "" + punitIdString);    //this_punitId.substring(0,this_punitId.indexOf("_"))
                                }
                            }
                            $scope.differTableBodyViewModel = scheduleTableViewModelService.jsonDifferTableBodyViewModel($scope.differentiation);

                            ifDiffer = true;
                            //判断对象是否为空
                            // function isEmptyObject(obj) {
                            //     for (var i in obj) {
                            //         return true;
                            //     }
                            //     return false;
                            // }

                            if (!tool.isEmptyObject(respones) && ifDiffer) {
                                layer.msg('差异化结果已高亮，请查看', {time: 3500, icon: 1});
                                ifDiffer = false;
                            } else if (tool.isEmptyObject(respones) && ifDiffer) {
                                layer.msg('无差异化结果', {time: 3500, icon: 2});
                                ifDiffer = false;
                            }

                            $timeout(function () {
                                $(".diffe-table .table-td").each(function () {
                                    var thisDataDateid = $(this).attr("data-dateid");
                                    if ($scope.dateId.indexOf(thisDataDateid) > -1) {
                                        $(this).addClass("jIsDifferent")
                                            .css({"opacity": 1, "cursor": "pointer"});
                                    } else {
                                        $(this).css({"opacity": 0.2, "cursor": "defult"});
                                    }
                                });
                                $(".diffe-table .first").css({"opacity": 1, "cursor": "defult"});
                            }, 0)
                        }
                    });
                }
            });
        } else {
            $scope.differentiation = [];
        }
        $scope.differ_close();
        $(".differ-btn").toggleClass("active");
    }

    /**
     * 取消APS结果
     **/
    $scope.cancel_aps = function () {
        var index = layer.confirm('确定要取消自动排程结果？', {
            btn: ['确定', '取消'] //按钮
        }, function () {
            $scope.$apply();
            //API接口
            if ($rootScope.local_test) {
                /**
                 * 本地测试方法
                 */
                $location.path("/preview").replace();
            } else {
                //点击取消排程按钮
                http.post({
                    url: $rootScope.restful_api.aps_cancel,
                    data: JSON.parse(sessionStorage.getItem("cancel_data")),
                    successFn: function (response) {
                        if (response.data == true) {
                            layer.msg('取消排程成功', {time: 3500, icon: 1});
                            $location.path("/preview").replace();
                        } else {
                            layer.alert('取消自动排程结果失败，返回参数错误，请联系技术人员处理', {
                                skin: 'layer-alert-themecolor' //样式类名
                            });
                        }
                    },
                    errorFn: function (response) {
                        layer.alert('取消自动排程结果失败，请联系技术人员处理', {
                            skin: 'layer-alert-themecolor' //样式类名
                        });
                    }
                });
            }
            layer.close(index);
        })
    }
    /**
     * 判断上一页下一页按钮是否能点
     * @param s_time 查询开始时间
     * @param e_time 查询结束时间
     * @param min_time 总开始时间
     * @param max_time 总结束时间
     */
    function checkQueryTime(s_time, e_time, min_time, max_time) {
        if (min_time == undefined || tool.stringToDate(s_time) <= min_time) {
            $scope.last_page_button_style = {'display': 'none'};
        } else {
            $scope.last_page_button_style = {'display': 'inline-block'};
        }
        $scope.next_page_button_style = {'display': 'inline-block'};
//      if(max_time == undefined || tool.stringToDate(e_time) >= tool.stringToDate(max_time)){
//          $scope.next_page_button_style = {'display':'none'};
//      }else{
//          $scope.next_page_button_style = {'display':'inline-block'};
//      }
    }

    /**
     * 上一页按钮点击
     **/
    $scope.last_page = function () {
        $(".page-select").css("pointer-events", "none");
        var startTime_date = tool.stringToDate(startTime);
        var endTime_date = tool.stringToDate(endTime);
        startTime = tool.dateToString(new Date(startTime_date.setDate(startTime_date.getDate() - offset - 1)));//开始时间为周期后+1
        endTime = tool.dateToString(new Date(endTime_date.setDate(endTime_date.getDate() - offset - 1)));//结束时间为周期后+1
        //获取表格数据
        result_show_table(sessionStorage.locationId_res, sessionStorage.locationFilterList_res);
        ifDiffer = true;
    }

    /**
     * 下一页按钮点击
     **/
    $scope.next_page = function () {
        $(".page-select").css("pointer-events", "none");
        var startTime_date = tool.stringToDate(startTime);
        var endTime_date = tool.stringToDate(endTime);
        startTime = tool.dateToString(new Date(startTime_date.setDate(startTime_date.getDate() + offset + 1)));//开始时间为周期后+1
        endTime = tool.dateToString(new Date(endTime_date.setDate(endTime_date.getDate() + offset + 1)));//结束时间为周期后+1
        //获取表格数据
        result_show_table(sessionStorage.locationId_res, sessionStorage.locationFilterList_res);
        ifDiffer = true;
    }

    /**
     * 删除前拉后推
     **/
    $scope.around_del = function () {
        http.post({
            url: $rootScope.restful_api.aps_rate_around_del_but,
            data: sessionStorage.papBodyData,
            successFn: function () {
                layer.msg('删除前拉后推完成', {time: 3500, icon: 1});
                ifSearchMsg = false;
                result_show_table(sessionStorage.locationId_res, sessionStorage.locationFilterList_res);
                /*刷新数据*/
            }
        });
    }

    /**
     * 前拉后推进度
     **/
    $scope.around = function () {
        var progressbar = $("#progressbar_one");
        $(".pbody-wrap").children(".pap-alert").show();
        progressbar.show().children("span").css("width", "0px").animate({"width": "40px"});//初始状态

        http.post({
            url: $rootScope.restful_api.aps_rate_ar_button,
            data: JSON.parse(sessionStorage.getItem("papBodyData")),
            successFn: function () {
                $scope.newprogressBar_post("#progressbar_one", "#progress-label_one", $rootScope.restful_api.aps_rate_around, JSON.parse(sessionStorage.getItem("papBodyData")), "前拉后推", function () {
                }, function (res) {
                    $timeout(function () {
                        var stateList = res.stateList;
                        if (res.rate == 100 && stateList.length == 0) {        /*9.19 modify by zh*/
                            stateList = undefined;
                            $scope.Lists = stateList;
                            $(".pap-alert").children("h3").after("<em style='position: absolute;left: 29%;top: 45%;'>暂时没有可以操作的工单信息!</em>");
                        } else {
                            $scope.Lists = stateList;

                            $timeout(function () {
                                for (var i = 0; i < stateList.length; i++) {
                                    if (stateList[i].state == "PAP_SUCCESS") {
                                        $(".pap-alert li:eq(" + i + ")").children("b").hide();     //如果成功，提示信息按钮将隐藏
                                    }
                                }
                            }, 0)
                        }
                    }, 0)
                    ifSearchMsg = false;
                    result_show_table(sessionStorage.locationId_res, sessionStorage.locationFilterList_res);
                    /*刷新数据*/
                });
            }
        });
        $(".cover").show();
    };

    /**
     * 针对PAP及删除PAP 进度的方法
     **/
    $scope.newprogressBar_post = function (elements1, elements2, url, data, text, fn, fun) {
        var progressbar = $(elements1),
            progressLabel = $(elements2);

        progressbar.show(); //进度条显示
        var i = 0; //循环次数
        function SetProgress() {
            var progressVal = 0;
            http.post({
                url: url,
                data: data,
                successFn: function (res) {
                    res = res.data;
                    fun(res);
                    progressVal = res.rate || 0;    //获取接口数据
                    var progWidth = 50 + progressVal / 100 * 360 - 10;
                    progressbar.children("span").animate({"width": progWidth + "px"});
                    if (progressVal < 10) {
                        progressVal = 10;
                    }
                    progressLabel.text(text + " " + progressVal + "%");

                    if (progressVal || progressVal == 0) { //数据正确
                        if (progressVal < 100) {
                            var j = setTimeout(SetProgress, 1000);
                            if (i > 360) {
                                layer.alert("进度失败，请联系技术人员处理");
                                clearTimeout(j);
                                progressLabel.text(text + "失败");
                                progressbar.hide(20); //进度条加载完成后隐藏
                            }
                        } else {
                            progressLabel.text(text + "完成");
                            $(".pro_bars span").removeClass("progressbar-gif").addClass("progressbar-static");
                            fn(); //参数
                        }
                    } else { //如果数据错误
                        layer.alert("进度失败，请联系技术人员处理");
                        progressbar.hide(20);
                    }
                }
            });
            i++;
        }

        SetProgress();//开始加载
    }

    /**
     * 提示信息 前拉后推
     **/
    $scope.pap_dialog = function (list, $event) {
        $event.stopPropagation();
        var thisInfo = list.info;
        $scope.lists = thisInfo;
        var indexLayer = layer.open({
            type: 1,
            title: "异常原因",
            shadeClose: true,
            skin: 'yourclass',
            content: $("#check_detail_dialog_pap"),
            success: function () {
                // 272是显示框正常宽度，450是高度
                $(".layui-layer").css({
                    "left": $event.pageX - 152,
                    "top": $event.pageY > (document.body.clientHeight - 350) ? document.body.clientHeight - 350 : $event.pageY
                })
            }
        })
    }

    /**
     * 关闭前拉后推 提示
     **/
    $scope.pap_close = function () {
        var j_pap_alert = $(".pap-alert");
        j_pap_alert.hide(50);
        $("#progressbar_one").hide(50);
        $(".cover").hide();

        //提示信息关闭
        j_pap_alert.find("em").remove();
        j_pap_alert.find(".pap-in-alert").hide();  //关闭提示信息
        j_pap_alert.find(".pap-alert-tri").hide();
    }

    /**
     * 隐藏PAP按钮
     **/
    $scope.hideButton = function () {
        http.post({
            url: $rootScope.restful_api.aps_config,
            data: JSON.parse(sessionStorage.getItem("papBodyData")),
            successFn: function (res) {
                var j_btn_foBa = $(".tab-fo-ba"),
                    j_btn_del_foBa = $(".tab-del-fo-ba");
                if (res.data) {
                    j_btn_foBa.show();
                    j_btn_del_foBa.show();
                } else {
                    j_btn_foBa.hide();
                    j_btn_del_foBa.hide();
                }
            },
            errorFn: function (res) {
            }
        });
    }

    /**
     * 撤销按钮
     **/
    $scope.rollback = function () {
        var post_data = {
            'schemeId': sessionStorage.schemeId,
            'locationDtoList': []
        };
        http.post({
            url: $rootScope.restful_api.aps_rollback,
            data: post_data,
            successFn: function (res) {
                if (res.data) {
                    ifSearchMsg = false;
                    result_show_table(sessionStorage.locationId_res, sessionStorage.locationFilterList_res);      //若为真，则重新获取数据
                    layer.msg('撤销成功', {time: 3500, icon: 1});

                    //刷新暂存区和二级页面
                    if ($(".table-dialog-window").css("display") == "flex") {
                        var thisQuery = goWindowTableData.query,
                            thisEquipmentId = thisQuery.equipments,
                            thisStartTime = thisQuery.startTime,
                            thisEndTime = thisQuery.endTime;
                        $scope.click_creat_window(thisStartTime, thisEndTime, thisEquipmentId[0].equipmentId + "_" + thisEquipmentId[0].equipmentType, '', '', '');
                    }
                    if ($(".cache-window").css("display") == "flex") {
                        $scope.cache_box();
                    } else {
                        var sUrl = $rootScope.restful_api.cache_info + "?schemeId=" + sessionStorage.schemeId;
                        http.get({
                            url: sUrl,
                            successFn: function (res) {
                                var cacheNum = res.data.row.length;
                                if (cacheNum > 999) {
                                    cacheNum = "999+";
                                }
                                if (cacheNum == 0) {
                                    $(".cache-num").hide();
                                    return;
                                }
                                $(".cache-num").show().text(cacheNum);
                            },
                            errorFn: function (res) {
                            }
                        });
                    }
                } else {
                    ifSearchMsg = false;
                    result_show_table(sessionStorage.locationId_res, sessionStorage.locationFilterList_res);
                    layer.msg('已经是最后一步！', {time: 3500, icon: 2});

                    //刷新暂存区和二级页面
                    if ($(".table-dialog-window").css("display") == "flex") {
                        var thisQuery = goWindowTableData.query,
                            thisEquipmentId = thisQuery.equipments,
                            thisStartTime = thisQuery.startTime,
                            thisEndTime = thisQuery.endTime;
                        $scope.click_creat_window(thisStartTime, thisEndTime, thisEquipmentId[0].equipmentId + "_" + thisEquipmentId[0].equipmentType, "", "", "");
                    }
                    if ($(".cache-window").css("display") == "flex") {
                        $scope.cache_box();
                    }
                }
            },
            errorFn: function (res) {
            }
        });
    }

    /**
     * 检验按钮 方法
     **/
    $scope.check_aps = function ($event) {
        ifSearchMsg = false;
        if ($event.target.className == "check-check-box") {
            $scope.checkSwitch = !$scope.checkSwitch;
            $(".jiaoyan-icon").parent().toggleClass("search-btn-click");
            return;
        }
        $(".check-btn-div").hide();
        $scope.confirm_check();
    }

    /**
     * 提示信息 校验
     **/
    $scope.confirm_dialog = function (checkRow, $event) {
        $event.stopPropagation();
        var thisInfo = checkRow.info;
        $scope.checkRows = thisInfo;
        var indexLayer = layer.open({
            type: 1,
            title: "异常原因",
            shadeClose: true,
            skin: 'yourclass',
            content: $("#check_detail_dialog"),
            success: function () {
                // 272是显示框正常宽度，450是高度
                $(".layui-layer").css({
                    "left": $event.pageX - 152,
                    "top": $event.pageY > (document.body.clientHeight - 450) ? document.body.clientHeight - 450 : $event.pageY
                })
                $("#check_detail_dialog").on("click", ".sure", function () {
                    layer.close(indexLayer);
                })
            }
        })
    }

    /**
     * 保存前校验 方法
     **/
    $scope.save_check_aps = function () {
        ifSearchMsg = false;
        $scope.confirm_check(function () {
            $(".check-btn-div").show(10);
        });

    }

    /**
     * 校验方法
     **/
    $scope.confirm_check = function (fn) {
        $scope.allSuccess = true;
        $(".wrap-alert .check-btn").hide();
        var progressbar = $("#progressbar_one"),
            progressLabel = $("#progress-label_one");
        progressLabel.text("校验中");
        progressbar.show();    //进度条
        $(".wrap-alert").show();           //提示信息
        $(".cover").show();
        progressbar.children("span").css("width", "0px");
        progressbar.children("span").animate({"width": "40px"});
        function progress() {
            http.post({
                url: $rootScope.restful_api.aps_check,
                data: JSON.parse(sessionStorage.getItem("cancel_data")),
                successFn: function (res) {
                    res = res.data;
                    var scheduleValidateMap = res.scheduleValidateMap;
                    var list1 = [];
                    for (var j in scheduleValidateMap) {
                        var data = {
                            'code': j,
                            'info': scheduleValidateMap[j]
                        };

                        if (scheduleValidateMap[j].length) {
                            list1.unshift(data)
                        } else {
                            list1.push(data);
                        }

                        $timeout(function () {     //异步进行
                            for (var i = 0; i < list1.length; i++) {
                                if (list1[i].info.length == 0) {
                                    $(".wrap-alert li:eq(" + i + ")").children("span:eq(3)").text("校验正常");
                                    $(".wrap-alert li:eq(" + i + ")").children("span:eq(2)").removeClass("class-false").addClass("class-true");
                                    $(".wrap-alert li:eq(" + i + ")").children("b").hide();     //如果没有异常，提示信息按钮将隐藏
                                } else {
                                    $(".wrap-alert li:eq(" + i + ")").children("span:eq(3)").text("校验存在异常");
                                    $(".wrap-alert li:eq(" + i + ")").children("span:eq(2)").removeClass("class-true").addClass("class-false");
                                    $(".wrap-alert li:eq(" + i + ")").children("b").show();     //如果有异常，提示信息按钮显示
                                }
                            }
                        }, 0)
                    }
                    $scope.listOne = list1;
                    if (res.status == 1) {
                        progressbar.children("span").animate({"width": "400px"});
                        progressLabel.text("校验完成");
                        $(".pro_bars span").removeClass("progressbar-gif").addClass("progressbar-static");
                        $(".wrap-alert .check-btn").show();
                        if (fn) {
                            fn();
                        }
                    }
                }
            });
        }

        setTimeout(progress, 1000);
        result_show_table(sessionStorage.locationId_res, sessionStorage.locationFilterList_res);
        /*刷新数据*/
    }

    /******===== 二级页面差异化 开始=====******/

    var index = 2;//锚点当前位置

    /**
     * 关闭一级差异化页面
     **/
    $scope.differ_close = function () {
        $(".differ-show-info").hide();
        $(".differ-show").find("table").empty();
        $(".table-dialog-differ").hide();

        //重置为默认锚点  默认位置
        index = 2;
        $("#J_point").css({"left": "50px"});
    }

    /**
     * 单击差异化单元格
     **/
    $scope.differ_unit_click = function (cell, $event) {
        //表头不能点击
        ifSearchMsg = false;
        if ($($event.target).parents(".table-td").hasClass("first") || !$($event.target).parents(".table-td").hasClass("jIsDifferent")) {
            return;
        }
        var thisInf = cell[0],
            thisDate = thisInf.date,
            thisEquipment = thisInf.equipment_id;
        $scope.differ_show(thisDate, thisEquipment);
    }

    /**
     * 表头宽度函数
     **/
    $scope.auto_width = function (a, b) {
        var lastLeft = 0;
        var jCoverHead = $(".table-dialog-differ").find(a),
            jShowTable = $(".table-dialog-differ").find(b).find("thead");
        jCoverHead.width(jShowTable.width());
        jCoverHead.height(jShowTable.height());
        var coverThs = jCoverHead.find("div");
        var headThs = jShowTable.find("th");
        var thNums = headThs.length;
        for (var i = 0; i < thNums; i++) {
            if (!!window.ActiveXObject || "ActiveXObject" in window) {
                if (i == thNums - 1) {
                    coverThs.eq(i).width(jShowTable.width() - headThs.eq(i).position().left - 2);
                } else {
                    var thisWidth = headThs.eq(i + 1).position().left - lastLeft - 2;
                    lastLeft = headThs.eq(i + 1).position().left
                    coverThs.eq(i).width(thisWidth);
                }
            } else {
                coverThs.eq(i).width(headThs.eq(i).width());
            }
        }
    }

    /**
     * 创建二级差异化页面
     **/
    $scope.differ_show = function (workDate, equipmentId) {
        var thisWorkDate = workDate,
            newId = equipmentId.split("_"),
            thisEquipmentId = equipmentId,
            thisEquipmentName = [],
            aEquipment = '',
            sUrl = '';
        aEquipment = [thisEquipmentId];

        for (var i in aEquipment) {
            thisEquipmentName.push(goEquipment[aEquipment[i]].punitName);
        }
        sUrl = $rootScope.restful_api.secondPage_differ + "workDate=" + thisWorkDate + "&equipmentId=" + newId[0] + "&equipmentType=" + newId[1] + "&schemeId=" + sessionStorage.schemeId;
        http.get({
            url: sUrl,
            successFn: function (res) {
                var res = res.data;
//				/*以工单为判断*/

                var oRawJsonToGeneral_order = scheduleTableViewModelService.rawJsonToGeneral_order(res);

                var leftDifferTableData = scheduleTableViewModelService.jsonToDifferTable(oRawJsonToGeneral_order.leftJson);
                var rightDifferTableData = scheduleTableViewModelService.jsonToDifferTable(oRawJsonToGeneral_order.rightJson);

                //表头
                var headDataView_left = leftDifferTableData.headData;
                //表格数据
                var tableDataView_left = leftDifferTableData.bodyData;     //第一个表
                $scope.headDataView_left = headDataView_left;
                $scope.tableDataView_left = tableDataView_left;

                var headDataView_right = rightDifferTableData.headData;
                var tableDataView_right = rightDifferTableData.bodyData;   //第二个表
                $scope.headDataView_right = headDataView_right;
                $scope.tableDataView_right = tableDataView_right;
                $timeout(function () {     //表头宽度函数
                    $scope.auto_width(".cover-heads_left", ".table-window-left");   //左侧列表
                    $scope.auto_width(".cover-heads_right", ".table-window-right"); //右侧列表
                })
            }
        });
        /*以工单为判断  end*/

        /*以车间计划为判断*/
        var poolUrl = $rootScope.restful_api.workshop_plan + "workDate=" + thisWorkDate + "&equipmentId=" + newId[0] + "&equipmentType=" + newId[1] + "&schemeId=" + sessionStorage.schemeId;
        http.get({
            url: poolUrl,
            successFn: function (res) {
                var res = res.data;

                var oRawJsonToGeneral_data = scheduleTableViewModelService.rawJsonToGeneral_data(res);

                var leftDifferTableData_pool = scheduleTableViewModelService.jsonToDifferTable(oRawJsonToGeneral_data.leftJson);
                var rightDifferTableData_pool = scheduleTableViewModelService.jsonToDifferTable(oRawJsonToGeneral_data.rightJson);
                //绑定页面
                var headDataView_leftPool = leftDifferTableData_pool.headData;
                var tableDataView_leftPool = leftDifferTableData_pool.bodyData;   //第一个表
                $scope.headDataView_leftPool = headDataView_leftPool;
                $scope.tableDataView_leftPool = tableDataView_leftPool;

                var headDataView_rightPool = rightDifferTableData_pool.headData;
                var tableDataView_rightPool = rightDifferTableData_pool.bodyData;   //第二个表
                $scope.headDataView_rightPool = headDataView_rightPool;
                $scope.tableDataView_rightPool = tableDataView_rightPool;
            }
        });
        /*以车间计划为判断end*/

        //高亮效果
        $scope.highL = {
            "background": "#fefaec",
            "color": "#333"
        };
        $timeout(function () {
            //保留差异 按钮
            $scope.differ_keep = function () {
                var hideTr = $(".table-dialog-differ").find("tbody").children("tr[isHighLight=true]");
                $(hideTr).toggle();
                //更新表头遮盖层列宽  ==工单
                $scope.auto_width(".cover-heads_left", ".table-window-left");   //左侧列表
                $scope.auto_width(".cover-heads_right", ".table-window-right"); //右侧列表
                //更新表头遮盖层列宽  ==车间计划
                $scope.auto_width(".cover-headsPool_left", ".tablePool_left");
                $scope.auto_width(".cover-headsPool_right", ".tablePool_right");
            }
        }, 0)
        //显示页面
        $(".table-dialog-differ").show();
        $(".differ-show").find("span").show();
        //滑块操作
        var bar_length = $("#J_sliderBar").width();//获取整个条的长度
        var n = 4;//分成几份
        var n_len = bar_length / n;  //每份的长度
        var len = n_len / 2;   //一半的长度
//		var index = 2;//锚点当前位置
        var x_start = $("#J_sliderBar").offset().left;
        $("#J_sliderBar").on("mousedown", function (e) {
            $("body").addClass("select-none");//禁止选中文字
            var _this = $(this);
            var lastX = null;  //初始值
            document.onmousemove = function (e) {
                var _cliX = e.clientX;
                if (lastX == null) { //判断鼠标的方向
                    lastX = _cliX;
                    return;
                }
                var _center = x_start + index * n_len + len;
                if (_cliX > lastX) {
                    if (_cliX > _center) {
                        if (index < 4) {
                            index = index + 1;
                            $("#J_point").css({"left": index * n_len + "px"});
                        }
                    }
                } else {
                    if (_cliX < x_start + index * n_len - len) {
                        if (index > 0) {
                            index = index - 1;
                            $("#J_point").css({"left": index * n_len + "px"});
                        }
                    }
                }
                lastX = _cliX;
            }
        })
        document.onmouseup = function () {
            //移动操作方法
            function move_range(left_range1, left1, left_range2, right_range1, left2, right_range2, boolean1, left3, boolean2, title_range1, m_left1, boolean3, title_range2, m_left2) {
                var table_left = $(".table-left"),
                    table_right = $(".table-right"),
                    differ_line = $(".differ-line"),
                    title_left = $(".title-left"),
                    title_right = $(".title-right");
                table_left.animate({"width": left_range1, "left": left1}, 60);
                table_left.find("table").animate({"width": left_range2}, 60);
                table_right.animate({"width": right_range1, "left": left2}, 60);
                table_right.find("table").animate({"width": right_range2}, 60);

                if (boolean1) {
                    differ_line.show().animate({"left": left3}, 60);
                } else {
                    differ_line.hide();
                }
                if (boolean2) {
                    title_left.show().animate({"width": title_range1, "margin-left": m_left1}, 60);
                } else {
                    title_left.hide();
                }
                if (boolean3) {
                    title_right.show().animate({"width": title_range2, "margin-left": m_left2}, 60);
                } else {
                    title_right.hide();
                }
            }

            if (index == 0) {
                move_range("0", "0", "100%", "1190px", "-635px", "1190px", false, "", false, "", "", true, "1190px", "-635px");
            } else if (index == 1) {
                move_range("230px", "0", "100%", "880px", "-320px", "100%", true, "314px", true, "230px", "0", true, "880px", "-320px");
            } else if (index == 2) {
                move_range("554px", "0", "100%", "554px", "0", "100%", true, "634px", true, "554px", "0", true, "554px", "0");
            } else if (index == 3) {
                move_range("880px", "0", "100%", "230px", "330px", "100%", true, "960px", true, "880px", "0", true, "230px", "330px");
            } else if (index == 4) {
                move_range("1190px", "0", "1190px", "0", "330px", "100%", false, "", true, "1190px", "0", false, "", "");
            }
            $timeout(function () {
                //更新表头遮盖层列宽  ==工单
                $scope.auto_width(".cover-heads_left", ".tableTask_left");   //左侧列表
                $scope.auto_width(".cover-heads_right", ".tableTask_right"); //右侧列表
                //更新表头遮盖层列宽  ==车间计划
                $scope.auto_width(".cover-headsPool_left", ".tablePool_left");
                $scope.auto_width(".cover-headsPool_right", ".tablePool_right");
            }, 200)
            $("body").removeClass("select-none");  //移除选中样式
            document.onmousemove = null;
        }
        //滚动条
        $(".differ-wrap-table").mouseover(function () {
            $(this).css("overflow", "auto");
        }).mouseleave(function () {
            $(this).css("overflow", "hidden");
        })
        //固定表头
        $(".differ-wrap-table").scroll(function () {
            var thisScrollTop = $(this).scrollTop();
            $(this).children("div").first().css("top", thisScrollTop);
        })
    }

    /**
     * 点击二级差异化表格行
     **/
    $scope.click_show = function ($event) {
        if ($(".isPooltaskId").css("display") == "block") {
            return;
        }
        $("#show").empty();  //清空
        $(".differ-show-info").show();

        //点击表格
        var thisTd = $($event.target).parent();
        var index = thisTd.index() + 1;
        var thisTr = $(".isTask").find(".table-space-differ").children("table").find("tr:eq(" + index + ")");
        var el_head = thisTd.parent().siblings();

        if (thisTd.parents("div").hasClass("table-window-left")) {
            $("#show").append(el_head.clone()).append(thisTr.clone());
        } else if (thisTd.parents("div").hasClass("table-window-right")) {
            if (thisTr.length == 1) {
                $("#show").append(el_head.clone()).append("<tr style='height:25px;border: 1px #ccc solid;'></tr>").append(thisTr.clone());
            } else {
                $("#show").append(el_head.clone()).append(thisTr.clone());
            }
        }
    }

    /**
     * 切换派工单维度还是车间计划维度（二级差异化界面）
     **/
    $(".isPoolBtn").on("click", function () {
        $(".isPooltaskId").show();
        $(".isTask").hide();
        $scope.auto_width(".cover-headsPool_left", ".tablePool_left");
        $scope.auto_width(".cover-headsPool_right", ".tablePool_right");
        $(this).addClass("switch-result");
        $(this).siblings("span").removeClass("switch-result");
    })
    $(".isTaskBtn").on("click", function () {
        $(".isPooltaskId").hide();
        $(".isTask").show();
        $scope.auto_width(".cover-heads_left", ".table-window-left");   //左侧列表
        $scope.auto_width(".cover-heads_right", ".table-window-right"); //右侧列表
        $(this).addClass("switch-result");
        $(this).siblings("span").removeClass("switch-result");
    })
    /******===== 二级页面差异化 结束=====******/

    /**
     * 打开暂存间
     **/
    $scope.cache_box = function () {
        var jTableDialogWindow = $(".table-dialog-window");
        var jCacheWindow = $(".cache-window");

        var inputList = tool.getFromInput(".cache-window .info-show"),
            saleOrderCode = inputList[0],
            materialName = inputList[1],
            materialCode = inputList[2];
        if ((saleOrderCode || materialName || materialCode) && cacheSearch) {
            var searchAct = true;
        }

        var sUrl = $rootScope.restful_api.cache_info + "?schemeId=" + sessionStorage.schemeId + "&saleOrderCode=" + saleOrderCode + "&materialName=" + materialName + "&materialCode=" + materialCode;
        http.get({
            url: sUrl,
            successFn: function (res) {
                //将二级页面靠左
                jTableDialogWindow.animate({left: "580px"});
                jCacheWindow.show().animate({opacity: 1});

                var cacheNum = res.data.row.length;
                cacheNum > 0 ? $(".cache-num").show().text(cacheNum > 999 ? "999+" : cacheNum) : $(".cache-num").hide();
                var windowTableData = scheduleTableViewModelService.jsonToWindowTableView(res.data);

                $scope.cacheHeadDataView = windowTableData.headData;
                $scope.cacheTableDataView = windowTableData.bodyData;

                if (searchAct && res.data.row.length) {
                    layer.msg('已查询，请在下方表格中查看查询结果', {time: 3500, icon: 1});
                    cacheSearch = false;
                } else if (searchAct && !(res.data.row.length)) {
                    layer.msg('未查询出结果', {time: 3500, icon: 2});
                    cacheSearch = false;
                }

                $timeout(function () {
                    tool.setTableHeadWidth($(".cache-window"));
                }, 0);

                //resize
                $(window).on("resize", function () {
                    tool.setTableHeadWidth($(".cache-window"));
                });
                $timeout(function () {
                    //初始化复选框
                    $("input[name='StorageSingle'],input[name='StorageAll']").prop("checked", false);

                    //全选全不选
                    $("input[name=StorageAll]").on("click", function () {
                        var checkValue = $(this).is(':checked');
                        if (checkValue == true) {
                            $("input[name='StorageSingle']").prop("checked", true);
                        } else {
                            $("input[name='StorageSingle']").prop("checked", false);
                        }
                    });
                    /*复选框反选*/
                    $("body").on("click", "input[name='StorageSingle']", function () {
                        var chsub = $("input[name='StorageSingle']").length;
                        var checkedsub = $("input[name='StorageSingle']:checked").length;
                        if (chsub == checkedsub) {
                            $("input[name='StorageAll']").prop("checked", true);
                        } else {
                            $("input[name='StorageAll']").prop("checked", false);
                        }
                    });
                }, 0);

                //关闭暂存间
                jCacheWindow.find(".close-window").on("click", function () {
                    jCacheWindow.hide();

                    //将二级页面居中
                    jTableDialogWindow.animate({left: "50%"});
                    jCacheWindow.animate({opacity: 0}, {
                        callback: function () {
                            jCacheWindow.hide();
                            $(".num-window").hide();
                        }
                    });
                })
            },
            errorFn: function (res) {
            }
        });
    }

    /**
     * 暂存间查询
     **/
    var cacheSearch = false;
    $scope.change_cache_window = function () {
        cacheSearch = true;
        $scope.cache_box();
    }

    /**
     * 移入暂存间
     **/
    $scope.move_to_cache = function () {
        var thisQuery = goWindowTableData.query,
            thisEquipmentId = thisQuery.equipments,
            thisStartTime = thisQuery.startTime,
            thisEndTime = thisQuery.endTime;

        //获取选中项
        var jTableDialogWindow = $(".table-dialog-window").find(".table-space"),
            jCheckedInput = jTableDialogWindow.find("input:checked");

        var thisObj = {};
        thisObj.tempList = [];

        if (jCheckedInput.length == 0) {
            layer.alert('请选择要操作的订单！', {
                skin: 'layer-alert-themecolor' //样式类名
            });
            return;
        } else {
            jCheckedInput.each(function () {
                var $this = $(this);
                var thisPkId = $this.parents("tr").attr("pk-id"),
                    thisVersionId = $this.parents("tr").attr("versionid");

                thisObj.tempList.push({
                    pkId: thisPkId,
                    versionId: thisVersionId
                });
            });
        }

        thisObj.locationIdList = $rootScope.locationIdList;
        thisObj.workDate = thisStartTime;
        thisObj.pUnitId = thisEquipmentId[0].equipmentId;
        thisObj.pUnitType = thisEquipmentId[0].equipmentType;
        thisObj.processOrder = jCheckedInput.eq(0).parents("tr").attr("processorder") - 1;
        thisObj.schemeId = sessionStorage.schemeId;
        var nUrl = $rootScope.restful_api.cache_movein;
        $scope.askRequest({
            _type: "post",
            _url: nUrl,
            _data: thisObj,
            _text: '移入暂存间'
        });
    }

    /**
     * 移出暂存间
     **/
    $scope.move_out_cache = function () {

        if ($(".table-dialog-window").css("display") == "none") {
            layer.alert('请打开要移入的位置!', {
                skin: 'layer-alert-themecolor' //样式类名
            });
            return;
        }
        var thisQuery = goWindowTableData.query,
            thisEquipmentId = thisQuery.equipments,
            thisStartTime = thisQuery.startTime,
            thisEndTime = thisQuery.endTime;

        //获取选中项
        var jCacheWindow = $(".cache-window").find(".table-space"),
            jCheckedInput = jCacheWindow.find("input:checked");

        var thisObj = {};
        thisObj.tempList = [];

        if (jCheckedInput.length == 0) {
            layer.alert('请选择要操作的订单！', {
                skin: 'layer-alert-themecolor' //样式类名
            });
            return;
        } else {
            jCheckedInput.each(function () {
                var $this = $(this);
                var thisPkId = $this.parents("tr").attr("pk-id"),
                    thisVersionId = $this.parents("tr").attr("versionid");

                thisObj.tempList.push({
                    pkId: thisPkId,
                    versionId: thisVersionId
                });
            });
        }

        thisObj.locationIdList = $rootScope.locationIdList;
        thisObj.workDate = thisStartTime;
        thisObj.pUnitId = thisEquipmentId[0].equipmentId;
        thisObj.pUnitType = thisEquipmentId[0].equipmentType;
        var nUrl = $rootScope.restful_api.cache_moveout;
        getProcessOrder(thisObj, nUrl);
    }

    /**
     * 部分移入暂存间
     **/
    $scope.part_move_in_cache = function (tableRow, $event) {
        $event.stopPropagation();
        var thisQuery = goWindowTableData.query,
            thisEquipmentId = thisQuery.equipments,
            thisStartTime = thisQuery.startTime,
            thisEndTime = thisQuery.endTime;

        tableRow = tableRow[0];
        var workDate = tableRow.startTime.substring(0, 10),
            thisEquipmentName = tableRow.pUnitName,
            thisNum = tableRow.taskNum - 0,
            thisProcessOrder = tableRow.index,
            thisPkId = tableRow.pkId,
            thisVersionId = tableRow.versionId;

        var thisX = $event.pageX + 10,
            thisY = $event.pageY - 58;
        $(".num-window").find("input").val(0);
        $(".num-window").show().css("left", thisX).css("top", thisY);

        $($event.target).css("color", "#1E7CD9");

        $(".num-window-sure").off("click");
        $(".num-window-sure").on("click", function () {
            var num = $(".num-window").find("input").val() + "";
            if (num.indexOf(".") > -1 || +num <= 0 || +num > thisNum) {
                layer.alert('请输入正确的数字！', {
                    skin: 'layer-alert-themecolor' //样式类名
                });
                return;
            }
            $(".num-window").hide(0, function () {
                $(".show-table .sale-order-change").css("color", "");
            });
            num = num - 0;

            var thisObj = {};
            var nUrl,
                _text;
            thisObj.locationIdList = $rootScope.locationIdList;
            thisObj.workDate = workDate;
            thisObj.pUnitId = thisEquipmentId[0].equipmentId;
            thisObj.pUnitType = thisEquipmentId[0].equipmentType;
            thisObj.processOrder = thisProcessOrder;
            thisObj.schemeId = sessionStorage.schemeId;

            if (num == thisNum) {
                thisObj.tempList = [];
                thisObj.tempList.push({
                    pkId: thisPkId,
                    versionId: thisVersionId
                });
                _text = '移入暂存间';
                nUrl = $rootScope.restful_api.cache_movein;
            } else {
                thisObj.taskNum = num;
                thisObj.partTemp = {
                    pkId: thisPkId,
                    versionId: thisVersionId
                };
                _text = '部分导入';
                nUrl = $rootScope.restful_api.cache_movein_part;
            }
            $scope.askRequest({
                _type: "post",
                _url: nUrl,
                _data: thisObj,
                _text: _text
            });
        });
    }

    /**
     * 关闭数量弹窗
     **/
    $(".close-num-window").on("click", function () {
        $(".num-window").hide(0, function () {
            $(".show-table .sale-order-change").css("color", "");
        });
    });

    /**
     * 部分移出暂存间
     **/
    $scope.part_move_out_cache = function (tableRow, $event) {
        if ($(".table-dialog-window").css("display") == "none") {
            layer.alert('请打开要移入的位置!', {
                skin: 'layer-alert-themecolor' //样式类名
            });
            return;
        }
        var thisQuery = goWindowTableData.query,
            thisEquipmentId = thisQuery.equipments,
            thisStartTime = thisQuery.startTime,
            thisEndTime = thisQuery.endTime;

        var tableRow = tableRow[0];
        var workDate = thisStartTime,
            thisNum = tableRow.taskNum - 0,
            thisPkId = tableRow.pkId,
            thisVersionId = tableRow.versionId;
        newI = thisEquipmentId[0].equipmentId;

        var thisX = $event.pageX - 150,
            thisY = $event.pageY - 58;
        $(".num-window").find("input").val(0);
        $(".num-window").show().css("left", thisX).css("top", thisY);

        $($event.target).css("color", "#1E7CD9");

        $(".num-window-sure").off("click");
        $(".num-window-sure").on("click", function () {
            var num = $(".num-window").find("input").val() + "";

            if (num.indexOf(".") > -1 || +num <= 0 || +num > thisNum) {
                layer.alert('请输入正确的数字', {
                    skin: 'layer-alert-themecolor' //样式类名
                });
                return;
            }

            $(".num-window").hide(0, function () {
                $(".show-table .sale-order-change").css("color", "");
            });
            num = num - 0;
            var thisObj = {};
            var nUrl;
            thisObj.locationIdList = $rootScope.locationIdList;
            thisObj.workDate = workDate;
            thisObj.pUnitId = thisEquipmentId[0].equipmentId;
            thisObj.pUnitType = thisEquipmentId[0].equipmentType;

            if (num == thisNum) {
                thisObj.tempList = [];
                thisObj.tempList.push({
                    pkId: thisPkId,
                    versionId: thisVersionId
                });
                nUrl = $rootScope.restful_api.cache_moveout;
            } else {
                thisObj.taskNum = num;
                thisObj.partTemp = {
                    pkId: thisPkId,
                    versionId: thisVersionId
                };
                nUrl = $rootScope.restful_api.cache_moveout_part;
            }

            getProcessOrder(thisObj, nUrl);
        });
    }

    /**
     * 获取插入位置，并传数据给后台
     **/
    function getProcessOrder(thisObj, url) {
        var thisQuery = goWindowTableData.query,
            thisEquipmentId = thisQuery.equipments,
            thisStartTime = thisQuery.startTime,
            thisEndTime = thisQuery.endTime;
        var jTableSpace = $(".table-dialog-window").find(".show-table");
        thisObj.schemeId = sessionStorage.schemeId;
        //清空二级页面查询条件和排序，进入编辑状态
        var nUrl = $rootScope.restful_api.res_sourceUrl;
        var isArr = [];
        for (var i in thisEquipmentId) {
            var isObj = {};
            isObj.equipmentType = thisEquipmentId[i].equipmentType;
            isObj.equipmentId = thisEquipmentId[i].equipmentId;
            isObj.freezeDate = goEquipment[isObj.equipmentId + "_" + isObj.equipmentType].freezeDate;
            isArr.push(isObj);
        }

        var body_data = {
            'startTime': thisStartTime,
            'endTime': thisEndTime,
            'materialName': '',
            'materialCode': '',
            'saleOrderCode': '',
            'schemeId': sessionStorage.schemeId,
            'equipments': isArr
        };
        http.post({
            url: nUrl,
            data: body_data,
            successFn: function (res) {
                var jTableDialogWindow = $(".table-dialog-window")
                jTableDialogWindow.show();
                $(".equipment-list").remove();
                var resData = res.data;
                var headList = res.columnAlias;//表头列表

                goWindowTableData = $.extend({}, resData);
                var windowTableData = scheduleTableViewModelService.jsonToWindowTableView(resData);

                //绑定页面
                $scope.headDataView = windowTableData.headData;
                $scope.tableDataView = windowTableData.bodyData;

                $timeout(function () {
                    //更新表头宽度
                    tool.setTableHeadWidth(jTableDialogWindow);
                }, 0);
            },
            errorFn: function (res) {
            }
        });
        if (jTableSpace.find("tr").length > 1) {
            layer.alert('请在左侧表格点击你要插入的位置。', {
                skin: 'layer-alert-themecolor' //样式类名
            });
            //显示取消按钮
            $(".cance-move").show();
            //二级页面不可修改
            $(".table-dialog-window").find(".sale-order-change").css("pointer-events", "none");
            $(".table-dialog-window").find("input").css("pointer-events", "none");
            if (!thisObj) {
                var thisObj = {};
            }

            var mouseText = $("<div class='mouse-text'>请点击要插入的位置...</div>");
            $("body").append(mouseText);

            jTableSpace.on("mouseenter", function () {
                $(".mouse-text").show();
            });
            jTableSpace.on("mouseleave", function () {
                $(".mouse-text").hide();
            });
            jTableSpace.on("mousemove", "*", function () {
                var event = arguments[0] || window.event,
                    $this = $(this);
                event.stopPropagation();
                var thisTr = $(this).parents("tr");

                var thisX = event.clientX + 20,
                    thisY = event.clientY + 20;
                thisLineX = event.offsetX;
                thisLineY = event.offsetY;
                $(".mouse-text").css("left", thisX).css("top", thisY);

                //在合适的地方插入空白行
                if ($(this).hasClass("tr-holder") || $(this).hasClass("table-space") || $(this).is("table") || $(this).parent("tr").attr("source")) {
                    if ($(".tr-holder").length > 0) {
                        return;
                    } else {
                        jTableSpace.find("tbody").append($("<tr class='tr-holder'></tr>"));
                        return;
                    }
                } else {
                    if (thisLineY > 15) {
                        if (!thisTr.next().hasClass("tr-holder")) {
                            //在此行之后插入一行
                            $(".tr-holder").remove();
                            var newLine = $("<tr class='tr-holder'></tr>");
                            newLine.insertAfter(thisTr);
                        }
                    } else {
                        if (!thisTr.prev().hasClass("tr-holder")) {
                            //在此行之后插入一行
                            $(".tr-holder").remove();
                            var newLine = $("<tr class='tr-holder'></tr>");
                            newLine.insertBefore(thisTr);
                        }
                    }
                }
            })
            jTableSpace.on("click", function () {
                if ($(".tr-holder").length == 0) {
                    return;
                } else {
                    if ($(".tr-holder").next().length > 0) {
                        thisObj.processOrder = $(".tr-holder").next().attr("index");
                    } else {
                        thisObj.processOrder = $(".tr-holder").prev().attr("index") - 0 + 1;
                    }
                    if (url) {
                        $scope.askRequest({
                            _type: "post",
                            _url: url,
                            _data: thisObj,
                            _text: '调整'
                        });
                        cleanE();
                    } else {
                        return thisObj.processOrder;
                        //清除事件
                        cleanE();
                    }
                }
            });
        } else {
            thisObj.processOrder = "0";
            $scope.askRequest({
                _type: "post",
                _url: url,
                _data: thisObj,
                _text: '调整'
            });
            cleanE();
        }

        //取消移动
        $(".cance-move,.close-dialog-window").on("click", function () {
            cleanE();
        });

        //清除事件
        function cleanE() {
            jTableSpace.off("click");
            jTableSpace.off("mouseenter");
            jTableSpace.off("mouseleave");
            jTableSpace.off("mousemove", "*");
            $(".tr-holder").remove();
            $(".mouse-text").remove();
            $(".table-dialog-window").find(".sale-order-change").css("pointer-events", "auto");
            $(".table-dialog-window").find("input").css("pointer-events", "auto");
            $(".cance-move").hide();
        }
    }

    /**
     * 暂存间功能用,接口调用方法
     * @param {Object} 参数对象,包括_type(请求类型),_url（接口地址),_data(数据对象),_text(显示文本)
     *
     *
     */
    $scope.askRequest = function (_obj) {
        var _data = _obj._data;
        http[_obj._type]({
            url: _obj._url,
            data: _data,
            successFn: function (res) {
                //刷新二级页面和暂存区
                $scope.cache_box();
                $scope.click_creat_window(_data.workDate, _data.workDate, _data.pUnitId + "_" + _data.pUnitType, "", "", "");
                hasChange = true;
                if ($scope.checkSwitch) {
                    $scope.confirm_check(function () {
                        if ($scope.allSuccess) {
                            for (let i = 0, l = $scope.listOne.length; i < l; i++) {
                                if ($scope.listOne[i].info.length) {
                                    return;
                                }
                            }
                            $scope.close();
                        }
                    });
                }
                layer.msg(_obj._text + '成功', {time: 3500, icon: 1});
            },
            errorFn: function (res) {
                layer.alert(_obj._text + "失败", {
                    skin: 'layer-alert-themecolor' //样式类名
                });
            }
        });
    }


    /**
     * 点击查询，刷新页面。
     **/
    $scope.search = function () {
        ifSearchMsg = true;
        result_show_table(sessionStorage.locationId_res, sessionStorage.locationFilterList_res);
    }

    /**
     * 表头单元格点击
     **/
    $scope.date_click = function (date) {
        //如果右键日期,不做处理.
        var thisData = date,
            thisStartDate = thisData.thisDate,
            thisEndDate = thisData.thisDate,
            thisEquipment = thisData.equipment;
        var saleOrder = tool.getFromInput_nocode(".sale-order"),
            materialName = tool.getFromInput_nocode(".material-name"),
            materialCode = tool.getFromInput_nocode(".material-code");
        $scope.click_creat_window(thisStartDate, thisEndDate, thisEquipment, saleOrder, materialName, materialCode, 1);
    }

    /**
     * 单元格鼠标点击事件
     **/
    $scope.unit_click = function (cell, clickLiType, $event) {
        //如果没有cell【0】.type值，说明是头部，调用头部方法
        if (!cell[0]) {
            $scope.date_click(cell);
            return;
        }
        ifSearchMsg = false;
        if ((cell[0].type == 1 && clickLiType === 3) || (cell[0].type == 3 && clickLiType === 1)) {
            return;
        }
        let thisInf = cell[0],
            thisDate = thisInf.date,
            thisStartDate = thisInf.s_date,
            thisEndDate = thisInf.e_date,
            thisEquipment = thisInf.equipment_id;
        if (!!thisDate) {
            thisStartDate = thisDate;
            thisEndDate = thisDate;
        }
        //查询条件
        let saleOrder = tool.getFromInput_nocode(".sale-order"),
            materialName = tool.getFromInput_nocode(".material-name"),
            materialCode = tool.getFromInput_nocode(".material-code");
        $scope.click_creat_window(thisStartDate, thisEndDate, thisEquipment, saleOrder, materialName, materialCode, clickLiType);
    };


    /**
     * 创建二级页面
     **/
    $scope.click_creat_window = function (startTime, endTime, equipment, saleOrder, materialName, materialCode, clickLiType) {
        // 工作单元AB统计
        if (clickLiType == 1) {
            $rootScope.clickTimes.report++;
        }
        //设备详情AB统计
        if (clickLiType == 3) {
            $rootScope.clickTimes.adjust++;
        }
        let thisStartTime = startTime,
            thisEndTime = endTime,
            thisEquipment = equipment + "",
            thisEquipmentName = [],
            aEquipment = "";

        //设备列表
        if (thisEquipment.indexOf(",") > -1) {
            aEquipment = thisEquipment.split(",");
        } else {
            aEquipment = [thisEquipment];
        }

        //查询二级页面数据
        var isArr = [];
        var isStr,
            newurl = $rootScope.restful_api.res_sourceUrl;
        var aPunitId = aEquipment;
        for (var i in aPunitId) {
            var isObj = {};
            var newI = aPunitId[i].split("_");

            isObj.freezeDate = goEquipment[aPunitId[i]].freezeDate;
            thisEquipmentName.push(goEquipment[aPunitId[i]].punitName);
            isObj.equipmentId = newI[0];
            isObj.equipmentType = newI[1];
            isArr.push(isObj);
        }
        var body_data = {    //向后台传送数据
            'startTime': thisStartTime,
            'endTime': thisEndTime,
            'materialName': materialName,
            'materialCode': materialCode,
            'saleOrderCode': saleOrder,
            'order': isStr,
            'equipments': isArr,
            'schemeId': sessionStorage.schemeId,
            "from": "result"
        };
        //根据点击的目录判断跳转哪个页面
        if (clickLiType == 1) {
            sessionStorage.setItem("hrefPrameter", JSON.stringify(body_data));
            window.open("./view/secondPage.html");
            return;
        } else if (clickLiType == 2) {
            //  换装页面
            sessionStorage.setItem("hrefPrameter", JSON.stringify(body_data));
            window.open("./view/secondChangePage.html");
            return;
        }
        http.post({
            url: newurl,
            data: body_data,
            successFn: function (response) {
                var jTableDialogWindow = $(".table-dialog-window");
                jTableDialogWindow.show();
                $(".equipment-list").remove();
                var resData = response.data;
                var headList = resData.columnAlias;//表头列表

                //保存数据
                goWindowTableData = $.extend({}, resData);
                var windowTableData = scheduleTableViewModelService.jsonToWindowTableView(resData);

                //绑定页面
                $scope.headDataView = windowTableData.headData;
                $scope.tableDataView = windowTableData.bodyData;

                if (windowSearch && resData.row.length) {
                    layer.msg('已查询，请在下方表格中查看查询结果', {time: 3500, icon: 1});
                    windowSearch = false;
                } else if (windowSearch && (!resData.row.length)) {
                    layer.msg('未查询出结果', {time: 3500, icon: 2});
                    windowSearch = false;
                }

//					console.log(resData);
//					console.log(windowTableData);

                $timeout(function () {
                    //更新表头宽度
                    tool.setTableHeadWidth(jTableDialogWindow);
                    //更新查询条件
                    var windowSearchBox = $(".table-dialog-window").find(".window-search-box");
                    windowSearchBox.eq(0).find("input").val(thisStartTime);
                    windowSearchBox.eq(1).find("input").val(thisEndTime);
                    windowSearchBox.eq(2).find("input").val(thisEquipmentName.join(","));
                    windowSearchBox.eq(3).find("input").val(decodeURIComponent(saleOrder));
                    windowSearchBox.eq(4).find("input").val(decodeURIComponent(materialName));
                    windowSearchBox.eq(5).find("input").val(decodeURIComponent(materialCode));

                    //初始化复选框
                    $("input[name='single'],input[name='all']").prop("checked", false);
                    $(".headCheckbox").css("pointerEvents", "auto");

                    //如果body部分复选框都不能点，那表头复选框也不能点
                    var clickableNum = 0;
                    var allSingleNum = $("input[name='single']").length;
                    $("input[name='single']").each(function () {
                        var pointerEvents = $(this).css("pointerEvents");
                        if (pointerEvents == "none") {
                            clickableNum++;
                        }
                    })
                    if (allSingleNum == clickableNum) {
                        $(".headCheckbox").css("pointerEvents", "none");
                    }

                    //预排过得单子字体颜色特殊处理
                    $(".show-table table tbody tr").each(function () {
                        var source = $(this).attr("source");
                        if (source) {
                            $(this).addClass("source-light");
                        } else {
                            $(this).removeClass("source-light");
                        }
                    });
                }, 0);

                //全选全不选
                $("input[name=all]").on("click", function () {
                    var checkValue = $(this).is(':checked');
                    if (checkValue == true) {
                        $("input[name='single']").each(function () {
                            var pointerEvents = $(this).css("pointerEvents");
                            if (pointerEvents == "none") {

                            } else {
                                $(this).prop("checked", true);
                            }
                        });

                    } else {
                        $("input[name='single']").prop("checked", false);
                    }
                });

                /*复选框反选*/
                $("body").on("click", "input[name='single']", function () {
                    var chsub = $("input[name='single']").length;
                    var checkedsub = $("input[name='single']:checked").length;
                    if (chsub == checkedsub) {
                        $("input[name='all']").prop("checked", true);
                    } else {
                        $("input[name='all']").prop("checked", false);
                    }
                });

                //关闭二级页面
                $(".close-dialog-window").off("click");
                $(".close-dialog-window").on("click", function () {
                    $(".table-dialog-window").hide();
                    $(".window-cover").hide();
                    //关闭微调数量弹窗
                    $(".num-window").hide();
                    //关闭排序弹窗
                    $scope.orderShow = false;
                    //清空临时配置项存储的临时变量,重新定义配置项
                    $scope.temporary = null;
                    //清除用户移动后未保存的项目
                    $("#all-item li").each(function () {
                        if ($(this).hasClass("js-move")) {
                            $(this).remove();
                        }
                    })

                    //是否微调
                    if (hasChange) {
                        //重新加载一级页面
                        ifSearchMsg = false;
                        result_show_table(sessionStorage.locationId_res, sessionStorage.locationFilterList_res);
                        hasChange = false;
                    }
                });
            },
            errorFn: function (response) {
                layer.alert('获取数据失败，请联系技术人员处理', {
                    skin: 'layer-alert-themecolor' //样式类名
                });
            }
        })
    }

    /**
     * 二级页面地点下拉框
     **/
    $scope.equipment_list = function ($event) {
        var j_equipment_list = $(".equipment-list"),
            j_equipment_input = $(".equipment-input");
        if (j_equipment_list.length > 0) {
            j_equipment_list.remove();
        } else {
            tool.dialogWindowEquipment(goEquipment, $event, true);
            j_equipment_input.css("border", "1px solid #1E7CD9");
        }
    }

    /**
     * 二级页面点击查看
     **/
    $scope.look_sale_order = function (thisRow, $event) {
        $event.stopPropagation()
        var pkId = thisRow[0].pkId;
        var versionId = thisRow[0].versionId;
        var sUrl = "";
        if (versionId == undefined) {
            sUrl = $rootScope.restful_api.preview_third + pkId;
            $(".do-code").show();
            $(".pk-id").hide();
            $(".version-id").hide();
        } else {
            sUrl = $rootScope.restful_api.result_third + pkId + "?versionId=" + versionId + "&schemeId=" + sessionStorage.schemeId;
            $(".do-code").hide();
            $(".pk-id").show();
            $(".version-id").show();
        }
        //弹窗
        var indexLayer = layer.open({
            type: 1,
            title: "派工单详细信息",
            // closeBtn: 0,
            shadeClose: true,
            skin: 'yourclass',
            content: $("#do_detail_dialog_1"),
            success: function () {
                $($event.target).css("color", "#1E7CD9");

                // 272是显示框正常宽度，450是高度
                $(".layui-layer").css({
                    "left": $event.pageX - 272,
                    "top": $event.pageY > (document.body.clientHeight - 450) ? document.body.clientHeight - 450 : $event.pageY
                })

                $("body").on("click", "#do_detail_dialog_1 .sure,.layui-layer-shade,.layui-layer-close", function () {
                    $(".show-table .sale-order-look").css("color", "");
                })

                $("#do_detail_dialog_1").on("click", ".sure", function () {
                    layer.close(indexLayer);
                })

            }
        })

        http.get({
            url: sUrl,
            successFn: function (res) {
                //json转viewModel对象
                var do_detail = res.data;
                //绑定view层
                $scope.do_detail = do_detail;
                //关闭加载中图标
            },
            errorFn: function (res) {
            }
        });
    }

    /**
     * 二级页面内查询,刷新二级页面
     **/
    $scope.change_window_table = function () {
        $scope.refreshDialogTable();
    }

    /**
     * 刷新二级页面
     **/
    var windowSearch = false;
    $scope.refreshDialogTable = function () {
        //获取查询条件
        var inputList = tool.getFromInput_nocode(".table-dialog-window .info-show");
        var thisStartTime = inputList[0],
            thisEndTime = inputList[0],
            thisEquipmentName = decodeURIComponent(inputList[2]),
            saleOrder = inputList[3],
            materialName = inputList[4],
            materialCode = inputList[5],
            aEquipmentId = [];
        var mouseType = 2;//本地二级页面新增确定鼠标点击类型
        //输入检测
        if (!thisStartTime) {
            layer.alert('请选择开始时间', {
                skin: 'layer-alert-themecolor' //样式类名
            });
            return;
        } else if (!thisEndTime) {
            layer.alert('请选择结束时间', {
                skin: 'layer-alert-themecolor' //样式类名
            })
            return;
        } else if (!thisEquipmentName) {
            layer.alert('请输入设备', {
                skin: 'layer-alert-themecolor' //样式类名
            });
            return;
        }

        //根据设备名获取设备ID
        var aEquipmentName = thisEquipmentName.split(",");
        var allEquipmentId = goInfo.punitId;
        var allEquipmentInfo = goInfo.punit;

        for (var i in allEquipmentInfo) {
            var thisName = allEquipmentInfo[i].punitName;
            for (var j in aEquipmentName) {
                if (aEquipmentName[j] == thisName) {
                    aEquipmentId.push(i);
                }
            }
        }
        if (aEquipmentId.length < 1) {
            layer.alert('请输入正确的设备名称!', {
                skin: 'layer-alert-themecolor' //样式类名
            });
            return;
        }
        if (thisStartTime || thisEndTime || aEquipmentId.length || saleOrder || materialName || materialCode) {
            windowSearch = true;
        } else {
            windowSearch = false;
        }

        $scope.click_creat_window(thisStartTime, thisEndTime, aEquipmentId.join(","), saleOrder, materialName, materialCode);
    }

    /**
     * 点击确定，向后台传选中数据
     **/
    $scope.sure = function () {
        var locationList = $(".selected"),
            thisLocationId = locationList.attr("data-location-id");
        if (locationList.length == 0) {
            layer.alert('请选择要查看的地点', {
                skin: 'layer-alert-themecolor' //样式类名
            });
            return;
        }
        //存储地点信息
        sessionStorage.locationId_res = thisLocationId;
        sessionStorage.locationFilterList_res = [];

        //pap相关接口body值
        var papBodyData = {
            "schemeId": parseInt(sessionStorage.schemeId),
            "locationDtoList": []
        };
        var papObj = {
            'locationId': sessionStorage.locationId_res,
            'locationFilterList': []
        };
        papBodyData.locationDtoList.push(papObj);
        sessionStorage.setItem("papBodyData", JSON.stringify(papBodyData));
        $rootScope.getsessionStorage(sessionStorage.locationId_pre, sessionStorage.locationId_res);
        //获取合并规则
        http.get({
            url: $rootScope.restful_api.group_by,
            successFn: function (res) {
                var thisObj = res.data.selectList;
                if (thisObj) {
                    $rootScope.showType = {
                        group_by: thisObj[0].valueContent,
                        cnName: "个" + thisObj[0].valueAlias
                    };
                } else {
                    $rootScope.showType = {
                        group_by: "processId",
                        cnName: "个工序"
                    };
                }
            },
            errorFn: function (res) {
                $rootScope.showType = {
                    group_by: "processId",
                    cnName: "个工序"
                };
            }
        });

        layer.msg('地点已修改', {time: 3500, icon: 1});

        //获取默认翻转状态
        http.get({
            url: $rootScope.restful_api.front_back,
            successFn: function (res) {
                var info = res.data.selectList;
                $rootScope.frontBack = info[0].valueContent == 1 ? false : true;
            }
        })

        //获取显示天数
        http.get({
            url: $rootScope.restful_api.get_show_days,
            successFn: function (res) {
                var thisObj = res.data.selectList;
                offset = thisObj[0].valueContent - 1;
                ifSearchMsg = false;
                result_show_table(sessionStorage.locationId_res, sessionStorage.locationFilterList_res);  //查询显示
            },
            errorFn: function (res) {
            }
        });

        //更改为默认状态,并将地点树隐藏
        $(".location-choose,.point-click").removeClass("active");
        $(".out-bg").animate({width: "64px"}, 400);
    }

    /**
     * desc:获取车间树所有的地点Id，存在一个数组里面,与设备详情页不同
     * time:2017-03-29
     * author:linzx
     * @param: locationTreeData:获取到的地点树数据
     * @return 所有地点的数组,Array
     **/
    let getAllLocationId = (locationTreeData) => {
        if(!locationTreeData &&!(tool.typeObject(locationTreeData) === "Array")){
            console.info("传入的地点树数据不对");
            return;
        }
        let alocationIdList = [];
        locationTreeData.forEach((item)=>{
            alocationIdList.push(item.locationId);
        })
        return alocationIdList;
    }
});