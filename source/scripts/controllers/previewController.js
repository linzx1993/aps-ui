/**
 * Created by xujun on 2016/7/1.
 */
'use strict'
app.controller('previewCtrl', function ($scope, $rootScope, $http, $window, $location, $timeout, scheduleTableViewModelService, tool, http) {
    $(".table-dialog-window").hide();
    //开始排程/再编辑
    var startApsType = "";
    //冻结期
    var fact_days = "";
    //初始化查询日期
    var today = new Date();
    //日历周期，目前设置为7天
    var offset = 6;
    //查询条件
    var startTime = tool.dateToString(today);
    var endTime = tool.dateToString(new Date(today.getDate() + offset));
    //通过json查询的对象声明
    var minStartTime, maxEndTime, queryObject, tableHeadViewModel, tableBodyViewModel;

    //设备
    var goEquipment = {};
    var goInfo = {};
    //sessionStorage-2017-03-28
    // $rootScope.current_location = sessionStorage.locationId_pre;
    //用户名
    $scope.userName = $rootScope.userName;

    //if($rootScope.daily_test){today.setFullYear(2016,10,1);}//测试用代码，用于日常环境每次打开显示的为7月1日而不是今天

    /**
    * desc:进入页面进行加载表格主题的方法
    * time:2017-03-28
    * author:linzx
    * @param:
    * @return:
    **/
    let initLoadingTableView = () =>{
        var defaultEle = $(".location-list").children("ul").children("li:eq(0)").children("i")
        var defaultId = defaultEle.attr("data-location-id");
        var defaultList = sessionStorage.locationFilterList_pre;
        $("i[data-location-id=" + sessionStorage.locationId_pre + "]").click();
        sessionStorage.userId = $rootScope.userId;  //存储当前用户Id
        $rootScope.getsessionStorage(sessionStorage.locationId_pre, sessionStorage.locationId_res, true);

        //获取合并规则
        http.get({
            url: $rootScope.restful_api.group_by,
            successFn: function (res) {
                var thisObj = res.data.selectList;
                $rootScope.showType = {
                    group_by: thisObj[0].valueContent,
                    cnName: "个" + thisObj[0].valueAlias
                };
            },
            errorFn: function (res) {
                $rootScope.showType = {
                    group_by: "processId",
                    cnName: "个工序"
                };
                layer.alert('获取合并规则错误,请联系技术人员', {
                    skin: 'layer-alert-themecolor' //样式类名
                });
            }
        });

        //获取默认翻转状态
        http.get({
            url: $rootScope.restful_api.front_back,
            successFn: function (res) {
                var info = res.data.selectList;
                $rootScope.frontBack = info[0].valueContent == 1 ? false : true;
            }
        });

        //获取显示天数
        http.get({
            url: $rootScope.restful_api.get_show_days,
            successFn: function (res) {
                var thisObj = res.data.selectList;
                offset = thisObj[0].valueContent - 1;
                startTime = tool.dateToString(today);//开始时间为今天
                endTime = tool.dateToString(new Date(today.setDate(today.getDate() + offset)));//结束时间为今天之后的7天
                preview_show_table(defaultId, defaultList);  //查询显示
            },
            errorFn: function (res) {
                offset = 6;
                startTime = tool.dateToString(today);//开始时间为今天
                endTime = tool.dateToString(new Date(today.setDate(today.getDate() + offset)));//结束时间为今天之后的7天
                preview_show_table(defaultId, defaultList);  //查询显示
                layer.alert('获取显示日期错误,请联系技术人员', {
                    skin: 'layer-alert-themecolor' //样式类名
                });
            }
        });

        //获取锁定期
        http.get({
            url: $rootScope.restful_api.get_lock_days,
            successFn: function (res) {
                var resData = res.data.lockDate; //锁定期
                fact_days = resData; //锁定期(可预排最大日期)
            },
            errorFn: function (res) {
                layer.alert('获取锁定期失败,请联系技术人员', {
                    skin: 'layer-alert-themecolor' //样式类名
                });
            }
        });

        //改变按钮位置
        $(".out-bg").animate({width: "64px"}, 0);
    };

    /**
     *    地点显示
     **/
    http.get({
        url: $rootScope.restful_api.aps_location_readable,
        successFn: function (res) {
            var resData = res.data;
            $scope.locationTreeData = res.data;
            $scope.folder = {"children": [scheduleTableViewModelService.getData($scope.locationTreeData)[0]]};//处理数据,并绑定到页面

            //获取上次登录的地点
            http.get({
                url: $rootScope.restful_api.view_last_location,
                successFn: function (res) {
                    let AllLocationIdArray = scheduleTableViewModelService.getAllLocationIdArray($scope.locationTreeData);
                    let lastLoginLocationTree = res.data.valueContent;
                    if (!lastLoginLocationTree && verifyContainLastLoginLocationId(AllLocationIdArray,lastLoginLocationTree.split(","))) {
                        //首次进入没有地点 || 上次登录地点与本次权限地点不匹配，强行选择
                        $(".location-choose,.out-bg,.point-click").addClass("active");
                    }else{
                        sessionStorage.locationFilterList_pre = res.data.valueContent;
                        //获取决定当前车间显示地点ID
                        sessionStorage.locationId_pre = tool.getCommonLocationId(sessionStorage.locationFilterList_pre);
                        //获取决定当前车间显示地点的名字,并存储到session避免手动微调页刷新页面丢失
                        sessionStorage.currentShowLocationName = $scope.currentShowLocationName = getLocationName("0104",$scope.locationTreeData);
                        //是否可以显示页面相关菜单，在preview页面上使用到
                        $scope.initLoadingShow = true;
                        $timeout(function () {
                            initLoadingTableView();
                        }, 200)
                    }
                },
            });
            //地点树相关操作函数
            var outerEle = $(".location-list");
            outerEle  //改变状态
                .on("click", "ul span", function () {
                    if ($(this).next().find("li").length === 0) {
                        return;
                    } else {
                        $(this).toggleClass("active").toggleClass("open");
                        $(this).next().toggle();
                    }
                    //改变按钮的位置
                    var bgPosition = $(".location-choose").width();
                    $(".out-bg").width(bgPosition);
                    //判断是否为最后一个
                    //如果是最后一个则设置左线的高度,否则自适应
                    var li = $(this).parent(),
                        index = li.index() + 1,
                        ul = li.parent(),
                        height = ul.height() - li.height();//设置线的高度为ul的高度减去li的高度
                    if (index === ul.children().length) {
                        ul.children("b").height(height + 50);
                    } else {
                        ul.children("b").height("auto");
                    }
                })
                .on("click", "ul ul i", function () {  //点击第一级后面的选框
                    //改变状态
                    changeSelectStatus($(this));
                    //第一级只能单选
                    $(this).parents("li").last().siblings("li").children("i").attr("class", "select-status unselect");
                    $(this).parents("li").last().siblings("li").find("i").attr("class", "select-status unselect");
                })
                .on("click", "ul:eq(0)>li>i", function () {  //点击第一级选框
                    changeSelectStatus($(this));
                    //第一级点击操作
                    $(this).parent().siblings("li").children("i").attr("class", "select-status unselect");
                    $(this).parent().siblings("li").find("i").attr("class", "select-status unselect");
                });
            $timeout(function () {
                //如果没有子地点 ,移除 s 标签
                var clickSpan = $(".location-list").find("span");
                clickSpan.each(function () {
                    if ($(this).next().find("li").length === 0) {
                        $(this).children("s").removeClass("open-btn");
                    } else {
                        $(this).children("s").addClass("open-btn");
                    }
                })
            },0);
        },
        errorFn: function (res) {
            layer.alert('获取数据失败，请联系技术人员处理', {
                skin: 'layer-alert-themecolor' //样式类名
            });
        }
    });

    /**
     * 显示正式派工单表的排程计划
     **/
    function preview_show_table(location, locationFilterList) {
        //API接口
            $scope.get_differall_num();

            //获取查询信息
            var saleOrder = tool.getFromInput(".sale-order"),
                materialName = tool.getFromInput(".material-name"),
                materialCode = tool.getFromInput(".material-code");

            //拼url
            var get_url = $rootScope.restful_api.preview_show_table + "?locationFilterList=" + locationFilterList
                + "&startTime=" + startTime
                + "&endTime=" + endTime;
            //获取和显示table数据
            http.get({
                url: get_url,
                successFn: function (response) {
                    //保存设备信息
                    goInfo = $.extend({}, response.data);
                    goEquipment = $.extend({}, response.data.punit);
                    //锁定期
                    response.data.freezeDate = fact_days;
                    //是否翻转状态
                    response.data.front = $rootScope.frontBack;
                    //json转viewModel对象
                    tableHeadViewModel = scheduleTableViewModelService.jsonToTableHeadViewModel(response.data);
                    //json转viewModel对象
                    tableBodyViewModel = scheduleTableViewModelService.jsonToTableBodyViewModelNew(response.data);

                    //有查询操作并且有查询成功的数据
                    if (tableBodyViewModel.searchSuccess == "success_search") {
                        layer.msg('根据您的查询条件，已高亮出查询结果，请查看', {time: 3500, icon: 1});
                    } else if (tableBodyViewModel.searchSuccess == "false_search") {
                        layer.msg('根据您的查询条件，未查询出结果', {time: 3500, icon: 2});
                    } else if (tableBodyViewModel.searchSuccess == "allUnitNull") {
                        layer.msg('当前无工单，无法查询', {time: 3500, icon: 2});
                    }

                    //查询时间
                    queryObject = scheduleTableViewModelService.jsonToQueryObject(response.data);
                    minStartTime = queryObject.minStartTime;
                    maxEndTime = queryObject.maxEndTime;
                    //绑定view层
                    $scope.tableHeadViewModel = tableHeadViewModel;
                    $scope.tableBodyData = tableBodyViewModel.tableBodyData;

                    $scope.last_page_button_style = {'display': 'inline-block'};
                    $scope.next_page_button_style = {'display': 'inline-block'};
                    $(".page-select").css("pointer-events", "auto");
                    $(".search-box").hide();
                    $(".search-btn").removeClass("search-btn-click");
                },
                errorFn: function (response) {
                    layer.alert('获取数据失败，请联系技术人员处理', {
                        skin: 'layer-alert-themecolor' //样式类名
                    });
                    $(".page-select").css("pointer-events", "auto");
                }
            });
        }

    //改变地点树的状态
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
     * 上一页按钮点击
     **/
    $scope.last_page = function () {
        $(".page-select").css("pointer-events", "none");
        var startTime_date = tool.stringToDate(startTime);
        var endTime_date = tool.stringToDate(endTime);
        startTime = tool.dateToString(new Date(startTime_date.setDate(startTime_date.getDate() - offset - 1)));//开始时间为周期后+1
        endTime = tool.dateToString(new Date(endTime_date.setDate(endTime_date.getDate() - offset - 1)));//结束时间为周期后+1
        //获取表格数据
        preview_show_table(sessionStorage.locationId_pre, sessionStorage.locationFilterList_pre);
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
        preview_show_table(sessionStorage.locationId_pre, sessionStorage.locationFilterList_pre);
    }

    /**
     * 开始排程
     **/
    $scope.start_aps = function () {

        var thisUrl = "",
            thisPath = "",
            thisText = "";

        if (startApsType == "apsStart") {
            thisUrl = $rootScope.restful_api.aps_trigger;
            thisPath = "/progress";
            thisText = "开始排程";
        } else if (startApsType == "editAgain") {
            thisUrl = $rootScope.restful_api.edit_again;
            thisPath = "/result";
            thisText = "再编辑";
        }

        var index = layer.confirm('确定' + thisText + '?', {
            btn: ['确定', '取消'] //按钮
        }, function () {
            //使用弹窗模块
            $scope.$apply();
            //API接口
            if ($rootScope.local_test) {
                /**
                 * 本地测试方法
                 */
                $location.path("/progress").replace();
            } else {
                //开始排程按钮
                http.post({
                    url: thisUrl,
                    data: $rootScope.start_data,
                    successFn: function (response) {
                        $location.path(thisPath).replace();
                    },
//						errorFn :   function(response){
//										layer.alert( thisText + '失败，请联系技术人员处理', {
//											skin: 'layer-alert-themecolor' //样式类名
//										});
//										console.debug("get json error: ");
//										console.debug(response.data);
//									}
                });
            }
            layer.closeAll();
        });
    };

    /**
     * 预排转实际
     * 打开预排转实际的弹窗
     **/

        //允许预排的天数
    var daysNum;
    $scope.open_tofact = function () {
        //获取设备信息
        var equipment = goInfo.punit,
            punitNameList = [];

        //初始化预排天数
        daysNum = 0;

        //将今天的日期取出
        var todayDate = new Date;
        todayDate.setHours(0);
        todayDate.setMinutes(0);
        todayDate.setSeconds(0, 0);

        //获取设备名，存入数组
        for (let i in equipment) {
            var punitName = equipment[i].punitName;
            punitNameList.push(punitName);
        }

        //显示到页面上
        $scope.punitNameList = punitNameList;

        //转换获取到的锁定期
        fact_days = tool.stringToDate(fact_days);

        //算今天到锁定期的相隔天数
        for (; todayDate.getTime() <= fact_days.getTime();) {
            todayDate = todayDate.setDate(todayDate.getDate() + 1);
            todayDate = new Date(todayDate);
            daysNum++;
        }

        //再次转换锁定期的日期格式
        fact_days = tool.dateToString(fact_days);

        //页面显示天数
        $scope.maxdays = daysNum;

        //控制输入框的输入，只允许输入固定范围内的数字
        $timeout(function () {
            var arrInput = $(".to-fact-box input");
            $(".to-fact-box input").each(function (i) {
                $(this).on("keyup", function () {
                    if (this.value.length == 1) {
                        this.value = this.value.replace(/[^0-9]/g, '')
                    } else {
                        this.value = this.value.replace(/\D/g, '')
                    }
                    if (this.value > daysNum) {
                        this.value = daysNum;
                    }
                })
            })

            //改变勾选的那行的输入框
            arrInput.eq(0).on("keyup", function () {
                var to_fact_days = arrInput.eq(0).val();
                $(".to-fact-box .each-pName-div").each(function (i) {
                    var checkVal = $(this).find("input[name = 'factPnameSingle']").is(':checked');
                    if (checkVal) {
                        $(this).find(".each_days_input").val(to_fact_days);
                    }
                })
            })
        }, 0);
    };

    /**
     * 确认预排转实际
     **/
    $scope.to_fact = function () {
        var daysList = [];
        var nullNum = 0;

        //得到所有输入框的值
        $(".to-fact-box .each-pName-div .each_days_input").each(function (i) {
            var each_pName_days = $(this).val() - 0;
            daysList.push(each_pName_days);
            if (!each_pName_days) {
                nullNum++;
            }
        })

        //若输入框的值都为空或者0,则不执行
        if (nullNum == daysList.length) {
            layer.alert('无法预排，请检查是否可排或检查是否输入了预排天数', {
                move: false,
                skin: 'layer-alert-themecolor' //样式类名
            });
            return;
        } else {
            layer.confirm('是否确认预排转实际？', {
                move: false,
                btn: ['确定', '取消'] //按钮
            }, function () {
                var equipment = goInfo.punit,
                    aList = [];

                //用于数组取值
                var temp = 0;
                for (var i in equipment) {

                    //今天日期
                    var nowDate = new Date;
                    nowDate.setHours(0);
                    nowDate.setMinutes(0);
                    nowDate.setSeconds(0, 0);

                    //对应的输入框有值
                    if (daysList[temp]) {

                        //设备ID
                        var equipmentId = i.substring(0, i.indexOf("_"));

                        var maxToFactDate,
                            dataList = [],
                            thisFreezeDate = tool.stringToDate(equipment[i].freezeDate);

                        //当前设备可预排的最大日期
                        maxToFactDate = nowDate.setDate(nowDate.getDate() + daysList[temp] - 1);
                        maxToFactDate = new Date(maxToFactDate);

                        //当天日期
                        var minDate = new Date;
                        minDate.setHours(0);
                        minDate.setMinutes(0);
                        minDate.setSeconds(0, 0);

                        //折算出从今天到最大日期间的所有日期
                        for (; minDate.getTime() <= maxToFactDate;) {
                            dataList.push(tool.dateToString(minDate));
                            minDate = minDate.setDate(minDate.getDate() + 1);
                            minDate = new Date(minDate);
                        }

                        //如果日期数组存在，则将设备信息，日期信息传给后台
                        if (dataList.length > 0) {
                            aList.push({
                                punitType: equipment[i].punitType,
                                punitId: equipmentId,
                                days: dataList
                            });
                        }

                        //下标加一
                        temp++;
                    } else {

                        //若当前设备预排天数为0,下标仍然加一,下次循环取下一个值
                        temp++;
                        continue;
                    }
                }

                if (aList.length > 0) {
                    aList = JSON.stringify(aList);
                    http.post({
                        url: $rootScope.restful_api.plan_to_fact,
                        data: aList,
                        successFn: function (res) {
                            layer.msg('预排转实际成功', {time: 3500, icon: 1});
                            $(".to-fact-box").hide();
                            $(".right-menu-button").removeClass("to-fact-click");
                        },
                        errorFn: function (res) {
                            layer.alert('预排转实际失败', {
                                move: false,
                                skin: 'layer-alert-themecolor' //样式类名
                            });
                        }
                    });
                } else {
                    layer.alert('锁定期内无单', {
                        move: false,
                        skin: 'layer-alert-themecolor' //样式类名
                    });
                }
            });
        }
    };

    /**
     * 此处是一些JQ事件
     **/
    $(function () {

        //预排转实际加减号
        $(".to-fact-box").on("click", ".add", function () {
            var va = $(this).parent().find(".each_days_input").val() - 0;
            if (va < daysNum && va >= 0) {
                $(this).parent().find(".sub").css("cursor", "pointer");
                $(this).css("cursor", "pointer");
                $(this).parent().find(".each_days_input").val(va + 1);
            }
            if (va >= daysNum - 1) {
                $(this).css("cursor", "default");
                $(this).parent().find(".sub").css("cursor", "pointer");
            }
        })
        $(".to-fact-box ").on("click", ".sub", function () {
            var va = $(this).parent().find(".each_days_input").val() - 0;
            if (va <= daysNum && va > 0) {
                $(this).parent().find(".each_days_input").val(va - 1);
                $(this).parent().find(".add").css("cursor", "pointer");
                $(this).css("cursor", "pointer");
            }
            if (va <= 1) {
                $(this).css("cursor", "default");
                $(this).parent().find(".add").css("cursor", "pointer");
            }
        })
    });

    /**
     * 获取外部差异条数
     **/

    var bodyData;	//表体数据
    var tabList;	//标签数据
    var differAllNum;//总条数
    var headData;//表头数据
    var tableList;//关键字
    $scope.get_differall_num = function () {
        /*拼接url开始*/
        var ex_diff_url = "";
        var locationFilterString = sessionStorage.locationFilterList_pre;
        var locationFilterArr = locationFilterString.split(",");
        var locationFilters = "";

        for (var i = 0; i < locationFilterArr.length; i++) {
            if (i === 0) {
                locationFilters += "locationFilterList=" + locationFilterArr[i];
            } else {
                locationFilters += "&" + "locationFilterList=" + locationFilterArr[i];
            }
        }
        ex_diff_url = $rootScope.restful_api.exter_differ + locationFilters;
        /*拼接url结束*/
        http.get({
            url: ex_diff_url,
            successFn: function (response) {
                var resData = response.data;
                var externalDifferViewModel = scheduleTableViewModelService.jsonToexternalDifferViewModel(resData);
                bodyData = externalDifferViewModel.bodyData;
                tabList = externalDifferViewModel.tabList;
                headData = externalDifferViewModel.headData;
                tableList = externalDifferViewModel.tableList;

                var poolTaskChangeList = resData.poolTaskChangeList;
                if (poolTaskChangeList.length) {
                    //计算总条数
                    differAllNum = 0;
                    for (var i = 0; i < tabList.length; i++) {
                        //每部分对应的条数
                        var each_differ_num = tabList[i].each_differ_num;
                        differAllNum += each_differ_num;
                    }
                    $scope.differAllNum = differAllNum;
                    if (differAllNum) {
                        //如果有值,则显示数字
                        $(".right-menu .external-diff-num").show();
                    } else {
                        $(".right-menu .external-diff-num").hide();
                    }
                } else {
                    $(".right-menu .external-diff-num").hide();
                }
            },
            errorFn: function (res) {
                layer.alert('"任务池"获取数据失败，请联系技术人员处理', {
                    skin: 'layer-alert-themecolor' //样式类名
                });
            }
        });
    };

    //本地测试方法代码
    // $scope.get_differall_num1 = function () {
    //     if ($rootScope.local_test) {
    //         var externalDifferViewModel = scheduleTableViewModelService.jsonToexternalDifferViewModel(exterDiffer);
    //         bodyData = externalDifferViewModel.bodyData;
    //         tabList = externalDifferViewModel.tabList;
    //         headData = externalDifferViewModel.headData;
    //         tableList = externalDifferViewModel.tableList;
    //
    //         differAllNum = 0;
    //         for (var i = 0; i < tabList.length; i++) {      //计算总条数
    //             var each_differ_num = tabList[i].each_differ_num;   //每部分对应的条数
    //             differAllNum += each_differ_num;
    //             $scope.differAllNum = differAllNum;
    //             if (differAllNum) {
    //                 $(".right-menu .external-diff-num").show();//如果有值,则显示数字
    //             }
    //         }
    //     }
    // };

    /**
     * 获取列下标
     **/
    $scope.find_column_index = function (tabType) {
        var columnIndex = {};
        columnIndex.rudt_index = -1,//未排数
            columnIndex.rtn_index = -1,//已排数
            columnIndex.ptt_index = -1,//车间计划时间
            columnIndex.nptt_index = -1;//新车间计划时间
        for (var i = 0; i < tableList.length; i++) {
            if (tableList[i] == "resultUnDoTaskNum") {
                columnIndex.rudt_index = i;
            }
            if (tableList[i] == "resultTaskNum") {
                columnIndex.rtn_index = i;
            }
            if (tableList[i] == "poolTaskTime") {
                columnIndex.ptt_index = i;
            }
            if (tableList[i] == "newPoolTaskTime") {
                columnIndex.nptt_index = i;
            }
        }

        if (tabType == "tim") {
            if (columnIndex.ptt_index !== -1) {
                $(".table-space table tbody").find("tr").each(function () {
                    $(this).find("td").eq(columnIndex.ptt_index).css("color", "#1E7CD9");//车间计划时间列高亮
//					console.log($(this).find("td"));
                })
            }
            if (columnIndex.nptt_index !== -1) {
                $(".table-space table tbody").find("tr").each(function () {
                    $(this).find("td").eq(columnIndex.nptt_index).css("color", "#1E7CD9");//新车间计划时间列高亮
//					console.log($(this).find("td"));
                })
            }
        } else if (tabType == "des" && columnIndex.rtn_index !== -1) {
            $(".table-space table tbody").find("tr").each(function () {
                $(this).find("td").eq(columnIndex.rtn_index).css("color", "#1E7CD9");//已排数列高亮
//				console.log($(this).find("td"));
            })
        } else if (columnIndex.rudt_index !== -1) {
            $(".table-space table tbody").find("tr").each(function () {
                $(this).find("td").eq(columnIndex.rudt_index).css("color", "#1E7CD9");//未排数列高亮
            })
        }
    }

    /**
     * 外部差异
     **/
    $scope.exter_differ = function () {
        $(".differ-tip").remove();
        var jDifferWindow = $(".exDiffer-window");
        jDifferWindow.show().animate({
            opacity: 1
        }).css("display", "flex"); //打开弹窗

        //打开遮罩层
        $(".cover").show();

        if (differAllNum) {
            //tab标签
            $scope.tabList = tabList;

            if (headData.toString().indexOf("新车间计划时间") > -1) {
                headData.pop();
            }
            if (tableList.toString().indexOf("newPoolTaskTime") > -1) {
                tableList.pop();
            }

            //表头
            var firstTab = tabList[0].changeType;
            if (firstTab == "tim") {
                headData.push("新车间计划时间");
                tableList.push("newPoolTaskTime");
            }

            $scope.headData = headData;

            //第一个tab标签的表格
            $scope.changedBodyData = bodyData[firstTab];
            $(".exDiffer-window .null-data").hide();

        } else {
            $(".exDiffer-window .null-data").show();
        }

        //表头
        $timeout(function () {
            tool.setTableHeadWidth($(".exDiffer-window"));

            //去除点击状态的tab样式
            $(".external-diff-tab").find("li").each(function () {
                if ($(this).hasClass("click-tab")) {
                    $(this).removeClass("click-tab");
                }
            });

            //第一个tab的样式有点击状态
            $(".external-diff-tab").children("li:first").not(".each-diff-num").addClass("click-tab");

            //小提示
            $("body").on("mouseover", ".help-span", function () {
                $(this).find(".help-box").show();
            }).on("mouseleave", ".help-span", function () {
                $(this).find(".help-box").hide();
            })

            $scope.find_column_index(firstTab);//高亮显示列

        }, 0);

        //resize
        $(window).on("resize", function () {
            tool.setTableHeadWidth($(".exDiffer-window"));
        });

        //关闭窗口
        jDifferWindow.find(".close-window").on("click", function () {
            jDifferWindow.hide();
            $(".cover").hide();
            $(".differ-tip").remove();
        })
    };

    /**
     * 点击外部差异tab
     **/
    $scope.exteriffer_tab = function (tabInfo, $event) {
        var jDifferWindow = $(".exDiffer-window");

        if (headData.toString().indexOf("新车间计划时间") > -1) {
            headData.pop();
        }
        if (tableList.toString().indexOf("newPoolTaskTime") > -1) {
            tableList.pop();
        }

        //获取当前点击的li对应的类型
        var changeType = tabInfo.changeType;
        if (changeType == "tim") {
            headData.push("新车间计划时间");
            tableList.push("newPoolTaskTime");
        }
        $scope.headData = headData;

        //根据tab重绘表格部分
        $scope.changedBodyData = bodyData[changeType];

        //表头
        $timeout(function () {
            tool.setTableHeadWidth($(".exDiffer-window"));

            //切换点击的tab的样式
            var thisLi = $event.target;
            $($event.target).not(".each-diff-num").addClass("click-tab").siblings().removeClass("click-tab");
            $(".exDiffer-window").on("click", ".each-diff-num", function () {
                $(this).parent().not(".each-diff-num").addClass("click-tab").siblings().removeClass("click-tab");
            })

            $scope.find_column_index(changeType);//高亮显示列

        }, 0);

        //resize
        $(window).on("resize", function () {
            tool.setTableHeadWidth($(".exDiffer-window"));
        });

        //关闭窗口
        jDifferWindow.find(".close-window").on("click", function () {
            jDifferWindow.hide();
            $(".cover").hide();
            $(".differ-tip").remove();
        })
    };

    /**
     * 点击查询，刷新页面。
     **/
    $scope.search = function () {
        preview_show_table(sessionStorage.locationId_pre, sessionStorage.locationFilterList_pre);
    };

    /**
     * 表格单元格点击
     **/
    $scope.unit_click = function (cell, clickLiType) {
        //如果没有cell【0】.type值，说明是头部，调用头部方法
        if (!cell[0]) {
            $scope.date_click(cell);
            return;
        }
        if (cell[0].type == 3) {
            layer.alert("未排入生产任务");
            return;
        }
        var thisInf = cell[0],
            thisDate = thisInf.date,
            thisStartDate = thisInf.s_date,
            thisEndDate = thisInf.e_date,
            thisEquipment = thisInf.equipment_id;

        if (!!thisDate) {
            thisStartDate = thisDate;
            thisEndDate = thisDate;
        }
        //查询条件
        var saleOrder = tool.getFromInput_nocode(".sale-order"),
            materialName = tool.getFromInput_nocode(".material-name"),
            materialCode = tool.getFromInput_nocode(".material-code");

        $scope.click_creat_window(thisStartDate, thisEndDate, thisEquipment, saleOrder, materialName, materialCode, clickLiType);
    };

    /**
     * 表头单元格点击
     **/
    $scope.date_click = function (date) {
        var thisData = date,
            thisStartDate = thisData.thisDate,
            thisEndDate = thisData.thisDate,
            thisEquipment = thisData.equipment;
        var saleOrder = tool.getFromInput_nocode(".sale-order"),
            materialName = tool.getFromInput_nocode(".material-name"),
            materialCode = tool.getFromInput_nocode(".material-code");
        $scope.click_creat_window(thisStartDate, thisEndDate, thisEquipment, saleOrder, materialName, materialCode);
    };

    $scope.click_creat_window = function (startTime, endTime, equipment, saleOrder, materialName, materialCode) {
        var thisStartTime = startTime,
            thisEndTime = endTime,
            thisEquipment = equipment + "",
            sUrl = "",
            thisEquipmentName = [],
            aEquipment = "";

        //拼接Url
        if (thisEquipment.indexOf(",") > -1) {
            aEquipment = thisEquipment.split(",");
        } else {
            aEquipment = [thisEquipment];
        }

            //查询二级页面数据

            var isArr = [];
            var isStr;

            for (var i in aEquipment) {
                var isObj = {};
                var newI = aEquipment[i].split("_");
                isObj.equipmentId = newI[0];
                isObj.equipmentType = newI[1];
                isArr.push(isObj);

                thisEquipmentName.push(goEquipment[aEquipment[i]].punitName);
            }

            //输入框有焦点状态下
            $(".window-search-box input").on("focus", function () {
                $(this).css("border", "1px solid #1E7CD9");
                if ($(this).hasClass("Wdate")) {
                    $(this).removeClass("Wdate").addClass("WdateActive");
                }
            });
            //输入框失去焦点
            $(".window-search-box input").on("blur", function () {
                $(this).css("border", "1px solid #BBBBBB");
                if ($(this).hasClass("WdateActive")) {
                    $(this).removeClass("WdateActive").addClass("Wdate");
                }
            });
            var body_data = {
                "startTime": thisStartTime,
                "endTime": thisEndTime,
                "materialName": materialName,
                "materialCode": materialCode,
                "saleOrderCode": saleOrder,
                "order": isStr,
                "equipments": isArr,
                "from": "preview"
            };
            sessionStorage.setItem("hrefPrameter", JSON.stringify(body_data));
            var href = "./view/secondPage.html";
            window.open(href);
            return;
    }

    /**
     * 点击确定，向后台传选中数据
     **/
    $scope.sure = function () {
        var allSelect = $(".selected");
        var locationList = [];
        var locationObj = {};

        allSelect.each(function () {
            var thisSelect = $(this),
                thisLocationId = thisSelect.attr("data-location-id");
            locationList.push(thisLocationId);
        });

        if (locationList.length == 0) {
            layer.alert('请选择要查看的地点', {
                skin: 'layer-alert-themecolor' //样式类名
            });
            return;
        }
        locationObj.locationIdList = locationList;

        var urlLocationid;
        var body_locationid = [];
        var allSelecteds = $(".select-some");
        //全勾中
        if (allSelecteds.length == 0) {
            for (var i = 0; i < locationList.length; i++) {
                if (locationList[i].length == 4) {
                    urlLocationid = locationList[i];
                } else {
                    body_locationid.push(locationList[i]);
                }
            }
        } else {    //半勾
            //取四位
            var id = [];
            var id2 = [];
            for (var i = 0; i < locationList.length; i++) {
                id.push(locationList[i].substring(0, 4));
            }
            for (var j = 0; j < id.length; j++) {
                if (id2.indexOf(id[j]) == -1) {
                    id2.push(id[j]);
                }
            }
            urlLocationid = id2.join();
            body_locationid = locationList;
        }

        //获取公共父元素车间ID,用于处理显示方案
        sessionStorage.locationId_pre = tool.getCommonLocationId(urlLocationid);
        //筛选出被选中的车间，如果子元素全选中，则选择父元素
        sessionStorage.locationFilterList_pre = body_locationid.join();
        $rootScope.urlLocationid = urlLocationid;
        // $rootScope.body_locationid = body_locationid.join();

        $rootScope.getsessionStorage(sessionStorage.locationId_pre, sessionStorage.locationId_res, true);
        //筛选出显示车间的名字
        sessionStorage.currentShowLocationName = $scope.currentShowLocationName = getLocationName("0104",$scope.locationTreeData);
        //获取合并规则
        http.get({
            url: $rootScope.restful_api.group_by,
            successFn: function (res) {
                var thisObj = res.data.selectList;
                $rootScope.showType = {
                    group_by: thisObj[0].valueContent,
                    cnName: "个" + thisObj[0].valueAlias
                };
            },
            errorFn: function (res) {
                layer.alert("获取数据失败!", {
                    skin: 'layer-alert-themecolor' //样式类名
                });
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
        });

        //获取显示天数
        http.get({
            url: $rootScope.restful_api.get_show_days,
            successFn: function (res) {
                var thisObj = res.data.selectList;
                offset = thisObj[0].valueContent - 1;
                preview_show_table(sessionStorage.locationId_pre, sessionStorage.locationFilterList_pre);  //查询显示
            },
            errorFn: function (res) {
                layer.alert("获取数据失败!", {
                    skin: 'layer-alert-themecolor' //样式类名
                });
            }
        });

        //获取锁定期
        http.get({
            url: $rootScope.restful_api.get_lock_days,
            successFn: function (res) {
                var resData = res.data.lockDate; //锁定期
                fact_days = resData; //锁定期(可预排最大日期)
            },
            errorFn: function (res) {
                layer.alert('获取锁定期失败,请联系技术人员', {
                    skin: 'layer-alert-themecolor' //样式类名
                });
            }
        });

        //保存用户本次所选地点所选地点
        http.put({
            "url": $rootScope.restful_api.view_last_location,
            "data":{
                "selectList": [
                    {
                        "configName": "",
                        "locationId": "",
                        "systemConfig": true,
                        "userId": sessionStorage.userId,
                        "valueAlias": "本次退出登录所选地点",
                        "valueContent": body_locationid.join()
                    }
                ]
            },
            successFn: function () {
            }
        });

        //更改为默认第一级展开状态,并将地点树隐藏
        $(".location-list span").removeClass("open").removeClass("active");
        var folderUl = $(".location-list").find("ul");
        for (var i = 1; i < folderUl.length; i++) {
            $(folderUl[i]).hide();
        }
        $(".location-choose").removeClass("active");
        $(".point-click").removeClass("active");
        $(".out-bg").animate({width: "64px"}, 300);
        //初始进来设置各大菜单栏为显示
        $scope.initLoadingShow = true;
        //设置前面线的高度
        var thisB = $(folderUl[0]).children("b");
        thisB.height($(folderUl[0]).height() - 30);

        $scope.get_differall_num();
    }

    /**
     * 选择方案 排程
     **/
    $scope.aps_schme = function () {
        http.get({
            url: $rootScope.restful_api.all_schedule_plan,
            successFn: function (res) {
                res = res.data;
                $(".case-header").empty();
                $(".case-header").text(res[0].schemeName).attr("data-schmeid", res[0].schemeId);//默认方案为第一个
                $scope.schemeName = res;
                $scope.schemeId = $scope.schemeName[0].schemeId;
                $rootScope.schemeId = $scope.schemeName[0].schemeId;
                sessionStorage.schemeId = $scope.schemeName[0].schemeId;

                var post_body = {     //开始排程往后台发送数据
                    "schemeId": $scope.schemeId,
                    "locationDtoList": []
                };
                $rootScope.start_data = post_body;
                $scope.case_btn($scope.schemeId);
            },
            errorFn: function (res) {
                layer.alert('获取方案列表失败,请联系技术人员', {
                    skin: 'layer-alert-themecolor' //样式类名
                });
            }
        });
        //选择方案
        $scope.case_btn = function (id) {
            $(".wrap-box").next("p").remove();    //移除提示
//			$(".case-header").empty();
            $rootScope.schemeId = id;
            sessionStorage.schemeId = id;
            http.get({
                url: $rootScope.restful_api.single_schedule_plan + id,
                successFn: function (res) {
                    res = res.data;
                    var locationRule = res.locationRuleList;
                    $scope.locationRule = res.locationRuleList;
                    var data_body = {     //取消排程 往后台发送数据
                        'schemeId': '',
                        'locationDtoList': []
                    };
                    for (var i = 0; i < locationRule.length; i++) {
                        var objLocation = {};
                        var locationDtoList = [];
                        objLocation.locationId = locationRule[i].locationId;
                        objLocation.locationFilterList = [];
                        data_body.locationDtoList.push(objLocation);
                        data_body.schemeId = id;
                    }
                    $rootScope.cancel_data = data_body;
                    sessionStorage.setItem("cancel_data", JSON.stringify(data_body));

                    var post_body = {     //开始排程往后台发送数据
                        "schemeId": id,
                        "locationDtoList": []
                    };
                    $rootScope.start_data = post_body;
                },
                errorFn: function (res) {
                    layer.alert('获取方案内容失败,请联系技术人员', {
                        skin: 'layer-alert-themecolor' //样式类名
                    });
                }
            });
            $timeout(function () {
                if ($(".case-header").children().length > 0) {
                    $(".aps-continue").show();
                    $(".wrap-box").after("<p style='position:absolute;top:110px;left:117px;color:#f00;text-align:center;font-size:12px;'>您有未保存的工单信息,点击确定查看!</p>");
                } else {
                    $(".aps-continue").hide();
                    $(".wrap-box").next("p").remove();    //移除提示
                }
            }, 10)
        }

        //判断是否有已经排过的订单
        $timeout(function () {
            http.get({
                url: $rootScope.restful_api.aps_location_writable,
                successFn: function (res) {
                    res = res.data;
                    $(".case-content").find("span").remove();  //清除上一次操作添加的元素
                    var schemeArr = [];
                    for (var i in res) {
                        var schemeIsHasEles = $(".aps-case").find(".case-content").children("li[data-schmeid=" + res[i].schemeId + "]");
                        schemeIsHasEles.append("<span style='color:#f00;'>*</span>");            //若有已排过的方案,增加 " * " 提示
                        schemeArr.push(res[i].schemeName);
                    }
                    if (schemeArr.indexOf($(".case-header").html()) > -1) {
                        $(".aps-continue").show();
                        $(".case-header").append("<span style='color:#f00;'>*</span>");
                        $(".wrap-box").after("<p style='position:absolute;top:110px;left:117px;color:#f00;text-align:center;font-size:12px;'>您有未保存的工单信息,点击确定查看!</p>");
                    } else {
                        $(".aps-continue").hide();
                        $(".wrap-box").next("p").remove();    //移除提示
                    }
                },
                errorFn: function (res) {
                    layer.alert('获取方案内容失败,请联系技术人员', {
                        skin: 'layer-alert-themecolor' //样式类名
                    });
                }
            });
        }, 10)
        //点击继续按钮  跳转
        $scope.aps_continue = function () {
            $location.path("/result").replace();
            layer.closeAll();
        }
    }

    /**
     * 排程方案选择下拉框
     **/
    $(".aps-case ")
        .on("click", "p.case-header", function () {
            if ($(this).next("ul").hasClass("select-li")) {
                $(this).next("ul").removeClass("select-li");
                $(this).removeClass("chosen");
            } else {
                $(this).next("ul").addClass("select-li");
                $(this).addClass("chosen");
            }
        })
        .on("click", ".case-content li", function () {
            $(".case-header").html($(this).html());
            $(".case-content").removeClass("select-li");
            $(this).parent().siblings(".case-header").removeClass("select-li");
            $(this).parent().siblings(".case-header").removeClass("chosen");
        })

    /**
     * 点击开始排程按钮
     **/
    $scope.aps_start = function () {
        $(".wrap-box").next("p").remove();    //移除提示
        //判断是否有已配置的方案
        http.get({
            url: $rootScope.restful_api.all_schedule_plan,
            successFn: function (res) {
                res = res.data;
                var sechemeLength = res.length;
                //若没有方案,弹窗提示
                if (sechemeLength == 0) {
                    layer.alert("您没有配置方案,无法排程!", {
                        skin: 'layer-alert-themecolor' //样式类名
                    });
                    return;
                } else {   //已配置方案,继续操作
                    startApsType = "apsStart";
                    $scope.aps_schme();
                    var index = layer.open({
                        type: 1,
                        title: false,
                        closeBtn: 0,
                        shadeClose: false,
                        area: ['400px', 'auto'],
                        skin: 'yourclass',
                        content: $(".aps-case"),
                        success: function () {
                            $(".aps-case").on("click", ".in-but", function () {
                                layer.close(index);
                                $(".case-content").removeClass("select-li");
                                $(".wrap-box").next("p").remove();
                            })
                        }
                    })
                }
            },
            errorFn: function (res) {
                layer.alert("请求方案数据错误,请联系技术人员处理!", {
                    skin: 'layer-alert-themecolor' //样式类名
                });
            }
        });
    }

    /**
     * 点击再编辑
     **/
    $scope.edit_again = function () {
        //判断是否有已配置的方案
        http.get({
            url: $rootScope.restful_api.all_schedule_plan,
            successFn: function (res) {
                res = res.data;
                var sechemeLength = res.length;
                //若没有方案,弹窗提示
                if (sechemeLength == 0) {
                    layer.alert("您没有配置方案,无法再编辑!", {
                        skin: 'layer-alert-themecolor' //样式类名
                    });
                    return;
                } else {    //已配置方案,继续操作
                    startApsType = "editAgain";
                    $scope.aps_schme();
                    $rootScope.index = layer.open({
                        type: 1,
                        title: false,
                        closeBtn: 0,
                        shadeClose: false,
                        area: ['400px', 'auto'],
                        skin: 'yourclass',
                        content: $(".aps-case"),
                        success: function () {
                            $(".aps-case").on("click", ".in-but", function () {
                                layer.close($rootScope.index);
                                $(".wrap-box").next("p").remove();
                            })
                        }
                    })
                }
            },
            errorFn: function (res) {
                layer.alert("请求方案数据错误,请联系技术人员处理!", {
                    skin: 'layer-alert-themecolor' //样式类名
                });
            }
        });
    };

    /**
     * desc:获取车间树所有的地点Id，存在一个数组里面
     * time:2017-03-16
     * author:linzx
     * @param: 获取到的地点树数据
     * @return 所有地点的数组
     **/
    $scope.childrenIdList = [];
    function getAllChildrenLocationId(obj,locationList) {
        for (let id in obj) {
            $scope.childrenIdList.push(id);
            if (obj[id]["nextLevelLocation"]) {
                getAllChildrenLocationId(obj[id]["nextLevelLocation"]);
            }
        }
    }

    /**
     * desc:验证本次地点树是否全部包含上次退出选择的地点ID,如没有全部包含，则需重新选择地点
     * time:2017-03-24
     * author:linzx
     * @params:locationTreeData: 本次地点树所有的地点ID，Array
     * @params:lastLoginData: 用户上次退出登录时记录的地点ID,Array
     * @return: boolean true: 本次地点树全部包含，false:未全部包含
     **/
    let verifyContainLastLoginLocationId = (locationTreeData, lastLoginData) => {
        //如果两棵树的地点数据为空，
        if(!locationTreeData || !lastLoginData){
            return false;
        }
        //验证是否为正确的数组
        locationTreeData = tool.typeObject(locationTreeData) !== "Array" ? locationTreeData.split(",") :locationTreeData;
        lastLoginData = tool.typeObject(lastLoginData) !== "Array" ? lastLoginData.split(",") :lastLoginData;
        return lastLoginData.every((item) => {
            return locationTreeData.includes(item)
        });
    };

    /**
    * desc:筛选出父子不冲突的的地点。1当有父元素地点ID时，没有子元素地点ID
    * time:2017-03-24
    * author:linzx
    * @param: locationTreeData,Array: 地点树点击选中的地点数组
    * @return: 父子元素不冲突的地点
    **/
    let selectUniqueLocationId = (locationIdList) => {
        if(tool.typeObject(locationIdList) !== "Array"){
            locationIdList = locationIdList.split(",");
        }
        // 如果只选择了一个车间，直接返回
        if(locationIdList.length === 1){
            return locationIdList
        }
        //将车间顺序改为由一级到底级
        locationIdList.sort((a,b) => {return a - b});
        //如果有一级车间直接返回
        // if(locationIdList[0] === "01"){
        //     return ["01"];
        // }
        for(let i = 0;i < locationIdList.length; i++){
            locationIdList = locationIdList.filter(function (item) {
                console.log((item.indexOf(locationIdList[i])>-1));
                //筛选规则：包含本次短地点ID但不等于 或 不包含本次短地点ID
                return (item.indexOf(locationIdList[i])>-1)&&item === locationIdList[i] || item.indexOf(locationIdList[i]) === -1;
            });
        }
        return locationIdList;
    };

    /**
    * desc:根据车间ID获得车间名字
    * time:2017-03-29
    * author:linzx
    * @param: locationId:需要获取地点名字的地点ID
    * @param: locationTree:传入的地点树数据
    * @return: 获得的地点名字
    **/
    let getLocationName = (locationId,locationTree) => {
        let locationName;
        //如果地点树数据为空或地点ID不对，直接返回
        if(tool.isEmptyObject(locationTree) || !locationId){
            return;
        }
        for(let id in locationTree){
            if(id === locationId){
                locationName =locationTree[id].locationName;
                return locationName;
            }else{
                locationName = getLocationName(locationId,locationTree[id]["nextLevelLocation"])
            }
        }
        return locationName;
    };
});
