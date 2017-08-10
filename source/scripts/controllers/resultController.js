/**
 * Created by xujun on 2016/7/1.
 */
'use strict';
app.controller('resultCtrl', function ($scope, $rootScope, $http, $window, $location, $interval, $timeout, $q, scheduleTableViewModelService, tool, http) {
//    $(".table-dialog-window").hide();
    $scope.$parent.checkBoxArray = [];//修复从别的页面过来仍然保留之前存储的信息
    $(".cache-window").hide();
    layer.closeAll();//关闭从排程页面跳过来的layer黑幕
    //锁定期
    var fact_days;
    //日历周期，目前设置为7天
    var offset = 6;
    //通过json查询的对象声明
    var queryObject, tableHeadViewModel, tableBodyViewModel;

    //微调是否有操作
    var hasChange = false;
    //设备
    var goEquipment = {};
    var goInfo = {};
    var goWindowTableData = {};

    //暂存间选中信息
    var cacheCheckInfo = {};
	
	
	$scope.isByPk = true;
    //用户名
    // $scope.userName = $rootScope.userName;
    //本地存储的地点，避免用户刷新手动微调页面丢失数据
    $rootScope.current_location = sessionStorage.locationId_res;
    // $rootScope.currentShowLocationName = sessionStorage.currentShowLocationName;
    //校验开关，默认关闭
    $scope.checkSwitch = false;
    //进入排程后页面
    $scope.resultPage = true;
    //初始化查询日期  注意！这个变量不要改! 时间操作另行赋值
    let today;
    //是否进行搜索提示操作
    var ifSearchMsg = false;

    /**************以下是本页实际执行的代码，上面都为函数和事件绑定****************/
	//传入一级界面时间控制器的初始数据
	$scope.getDateChangeWidth = function(){
		let smallWidth = 62,
			defaultDay = 60,
			minStartDate = tool.dateToString(today),
			maxEndDate = tool.dateToString(tool.dateChange(defaultDay-1),today),
			smallTableMarginLeft = 0,
			bigTableMarginLeft = 0;
		
		//如果不是第一次
		if($scope.controllerDate){
			defaultDay = (tool.stringToDate($scope.controllerDate.maxEndDate) - tool.stringToDate($scope.controllerDate.minStartDate))/86400000 + 1;
			minStartDate = $scope.controllerDate.minStartDate;
			maxEndDate = $scope.controllerDate.maxEndDate;
			smallTableMarginLeft = $scope.controllerDate.smallTableMarginLeft;
			bigTableMarginLeft = $scope.controllerDate.bigTableMarginLeft;
		}
					
		let	bigWidth = 160,
			tableWidth = $(".wrap-content").width(),
			smallTableWidth = tableWidth - 82,
			bigTableWidth = tableWidth - 160,
			scrollbarWidth = $(".scrollbar").width(),
			smallScrollbarWidth = smallTableWidth,
			bigScrollbarWidth = bigTableWidth,
			smallTotleWidth = smallWidth*defaultDay,
			smallScrollWidth = smallTotleWidth - smallTableWidth,
			bigTotleWidth = bigWidth*defaultDay,
			bigScrollWidth = bigTotleWidth - bigTableWidth,
			smallScrollbarThumbWidth = smallScrollbarWidth * smallTableWidth/smallTotleWidth,
			bigScrollbarThumbWidth = bigScrollbarWidth * bigTableWidth/bigTotleWidth;
		
		//滑块最长不超过滑道
		smallScrollbarThumbWidth = smallScrollbarThumbWidth > smallScrollbarWidth - 4 ?  smallScrollbarWidth - 4 : smallScrollbarThumbWidth;
		bigScrollbarThumbWidth = bigScrollbarThumbWidth > bigScrollbarWidth - 4 ?  bigScrollbarWidth - 4 : bigScrollbarThumbWidth;
		
		
		$scope.controllerDate={
			today : today,
			minStartDate : minStartDate,
			maxEndDate : maxEndDate,
			smallScrollbarThumbWidth : smallScrollbarThumbWidth + "px",
			smallScrollbarThumb : smallScrollbarThumbWidth,
			bigScrollbarThumbWidth : bigScrollbarThumbWidth + "px",
			bigScrollbarThumb : bigScrollbarThumbWidth,
			scrollbarWidth: scrollbarWidth,
			smallScrollbarWidth: smallScrollbarWidth,
			bigScrollbarWidth: bigScrollbarWidth,
			smallTableMarginLeft: smallTableMarginLeft,
			bigTableMarginLeft: bigTableMarginLeft,
			smallScrollWidth: smallScrollWidth,
			bigScrollWidth: bigScrollWidth
		}
		
		//刷新滚动
		$timeout(function(){
			$scope.refresh_margin_left();
		})
	};

    /**
     * 获取该方案显示地点
     **/
    http.get({
        url: $rootScope.restful_api.aps_location_writable,
        successFn: function (res) {
            const resData = res.data;
            $scope.schemeList = resData;
            // arr_scheme = [];  //存方案
            for (let i = 0; i < resData.length; i++) {   //排程方案与显示地点匹配
                if (resData[i].schemeId === Number(sessionStorage.schemeId)) {
                    $scope.resultlocationTreeData = resData[i].locationDtoList;//获得当前方案的给出的地点Id对象
                    $(".scheme-select").text(resData[i].schemeName);   //显示方案名称
                    $scope.schemeId = sessionStorage.schemeId;
                }
            }
			
            //如果用户因为页面刷新导致缺失整棵地点树数据，,则重新获取
            if (!$rootScope.locationTreeData) {
                http.get({
                    url: $rootScope.restful_api.aps_location_readable,
                    successFn: function (res) {
                        $rootScope.locationTreeData = res.data;
                        initShowTable();
                    }
                })
            } else {
                initShowTable();
            }

            //选择方案显示
            $(".scheme-select").on("click", function () {
                if ($(".location-scheme-option").css("display") === "none") {
                    $(".location-scheme-option").slideDown(80);
                    $(this).addClass("select-li");
                } else {
                    $(".location-scheme-option").slideUp(80);
                    $(this).removeClass("select-li");
                }
            });
            $(".location-scheme-option").on("click", "li", function () {
                $(".location-scheme-option").slideUp(80);
                $(".scheme-select").text($(this).text());
            });

            function initShowTable() {
                //筛选出各级地点生成的地点树=>getAllLocationTreeByLocationId
                $scope.locationTreeList = getAllLocationTreeByLocationId($scope.resultlocationTreeData, $rootScope.locationTreeData);
                $scope.locationTreeList = $scope.locationTreeList.map((locationItem) => {
                    return {"children": [scheduleTableViewModelService.getData(locationItem)[0]]};
                });

                //获取存储显示的地点
                $scope.locationFilterList_res = [];

                //根据来源页面判断，取默认点击第一个地点还是用户已选择地点
                if($rootScope.lastSourcePage && $rootScope.lastSourcePage.indexOf("config")>0 && sessionStorage.locationFilterList_res){
                    $scope.locationFilterList_res = sessionStorage.locationFilterList_res;
                    $rootScope.locationId_res = tool.getCommonLocationId($scope.locationFilterList_res);
                    console.log($rootScope.locationId_res);
                }else{
                    //获取决定显示方案的地点,1.先获取所有地点;2.然后获取共有父元素
                    sessionStorage.locationId_res = $rootScope.locationId_res = tool.getCommonLocationId(getAllResultLocationId($scope.resultlocationTreeData));
                    sessionStorage.currentShowLocationName = tool.getLocationName(sessionStorage.locationId_res,$rootScope.locationTreeData);

                    //获取排程方案下所有的地点树，并且返回可以渲染的数据格式
                    let locationIdList = getAllLocationTreeByLocationId($scope.resultlocationTreeData, $scope.locationTreeData);//得到所有的地点树
                    //得到第一棵地点树的所有地点id,返回到$scope.locationFilterList_res
                    getAllChildrenLocationId(locationIdList[0], $scope.locationFilterList_res);
                    //获得筛选查询出来的地点信息,并按级别顺序进行排列
                    sessionStorage.locationFilterList_res = $scope.locationFilterList_res = $scope.locationFilterList_res.sort((a,b)=>{return a.length - b.length}).join();
                }

                $timeout(function () {
                    //等待渲染完成为地点树添加样式
                    sessionStorage.locationFilterList_res.split(",").forEach((item) => {
                        $(".location-list").children("ul").find("i[data-location-id=" + item + "]").attr("class", "select-status selected active");
                    })
                }, 100);


                $rootScope.getsessionStorage(sessionStorage.locationId_pre, sessionStorage.locationId_res);
  
				//一级页面单元格类型
				http.get({
					url: $rootScope.restful_api.display_Info,
					successFn: function (res) {
						$rootScope.display_Info = res.data.displayConfigByLocationId;
					}/*,
					errorFn: function () {
						$rootScope.showType = {
							group_by: "processId",
							cnName: "个工序"
						};
						layer.alert('获取合并规则错误,请联系技术人员', {
							skin: 'layer-alert-themecolor' //样式类名
						});
					}*/
				});
					
				//获取偏移时间，返回偏移操作后的时间
				$scope.getRealToday = (function(){
					//先获取偏移时间
					let getDeviationUrl = $rootScope.restful_api.get_deviation;

					http.get({
						url: getDeviationUrl,
						successFn: function(res){
							today = new Date(+new Date()-res.data.daySec*1000);
	
							//确定时间控件滑块的宽度(大格子和小格子)
							$scope.getDateChangeWidth();
							
							//发起一次请求
							result_show_table($rootScope.locationId_res, sessionStorage.locationFilterList_res);
						}
					});
				})();

                // 获取锁定期
                http.get({
                    url: $rootScope.restful_api.get_freeze_days + "?schemeId=" + sessionStorage.schemeId,
                    successFn: function (res) {
                        const resData = res.data.lockDate; //锁定期
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
                let papBodyData = {
                    "schemeId": parseInt(sessionStorage.schemeId),
                    "locationDtoList": []
                };
                let papObj = {
                    'locationId': sessionStorage.locationId_res,
                    'locationFilterList': []
                };
                papBodyData.locationDtoList.push(papObj);
                sessionStorage.setItem("papBodyData", JSON.stringify(papBodyData));
            }
        }
    }).then(function () {
        // 加载页面时显示暂存间有多少条数据
        var sUrl = $rootScope.restful_api.cache_info + "?schemeId=" + sessionStorage.schemeId;
        http.get({
            url: sUrl,
            successFn: function (res) {
                let cacheNum = res.data.row.length, cacheNumSpan = $(".cache-num");
                if (cacheNum > 999) {
                    cacheNum = "999+";
                } else if (cacheNum == 0) {
                    cacheNumSpan.hide();
                    return;
                }
                cacheNumSpan.show().text(cacheNum);
            },
            errorFn: function (res) {
            }
        });
        $scope.hideButton();//前拉后推按钮

    });

    $scope.materialCode = {showText : "物料编码", className : "material-code",value:""};
    $scope.materialName = {showText : "物料名称", className : "material-name",value:""};
    $scope.processCode = {showText : "工序编码", className : "process-code",value:""};
    $scope.processName = {showText : "工序名称", className : "process-name",value:""};
    $scope.punitCode = {showText : "设备编码", className : "punit-code",value:""};
    $scope.punitName = {showText : "设备名称", className : "punit-name",value:""};
    $scope.saleOrder = {showText : "订单号", className : "sale-order",value:""};
    $scope.productLineName = {showText : "产线", className : "product-line",value:""};
    $scope.searchDataList = [$scope.materialCode,$scope.materialName,$scope.processCode,$scope.processName,$scope.punitCode,$scope.punitName,$scope.saleOrder,$scope.productLineName];

    /**
     * 显示临时派工单表的排程计划
     **/
    function result_show_table(locationId, locationFilterList) {
        $rootScope.getsessionStorage(sessionStorage.locationId_pre, locationId);
		
		$scope.$parent.checkBoxArray = [];

        let get_url = $rootScope.restful_api.result_show_table + "?locationFilterList=" + locationFilterList
            + "&startTime=" + $scope.controllerDate.minStartDate
            + "&endTime=" + $scope.controllerDate.maxEndDate
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

                //下拉框数据
                let searchItemDropDownList = tableBodyViewModel.searchItemDropDownList;
                //js设置顺序强关联（将HTML的顺序功能迁移到了js）

                //实时更新搜索下拉目录的数据
                $scope.materialCode.repeatData = Object.keys(searchItemDropDownList.materialCodeList);
                $scope.materialName.repeatData = Object.keys(searchItemDropDownList.materialNameList);
                $scope.processCode.repeatData = Object.keys(searchItemDropDownList.processCodeList);
                $scope.processName.repeatData = Object.keys(searchItemDropDownList.processNameList);
                $scope.punitCode.repeatData = searchItemDropDownList.punitCodeList;
                $scope.punitName.repeatData = searchItemDropDownList.punitNameList;
                $scope.saleOrder.repeatData = Object.keys(searchItemDropDownList.saleOrderList);
                $scope.productLineName.repeatData = tableBodyViewModel.productLineNameList;

                //用来判断某些下拉值初始状态选中
                $scope.searchDataList.forEach((searchItemList) => {
                    const isClassActiveList = [];
                    const valueList = searchItemList.value.split(",");
                    searchItemList.repeatData.forEach((repeatDataItem) => {
                        isClassActiveList.push({
                            'dragItemText' : repeatDataItem,
                            'isActive' : valueList.includes(repeatDataItem)
                        })
                    });
                    searchItemList.repeatData = isClassActiveList;
                });

                //有查询操作并且有查询成功的数据
                if (tableBodyViewModel.searchSuccess === "success_search" && ifSearchMsg) {
                    layer.msg('根据您的查询条件，已高亮出查询结果，请查看', {time: 3500, icon: 1});
                } else if (tableBodyViewModel.searchSuccess === "false_search" && ifSearchMsg) {
                    layer.msg('根据您的查询条件，未查询出结果', {time: 3500, icon: 2});
                } else if (tableBodyViewModel.searchSuccess === "allUnitNull" && ifSearchMsg) {
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
				
                //绑定view层
                $scope.tableHeadViewModel = tableHeadViewModel;
                // $scope.tableBodyData = tableBodyViewModel.tableBodyData;
                $rootScope.cacheTableBodyData = tableBodyViewModel.tableBodyData;
                //根据是否显示空白项来决定table表显示的数据，的多少
                if($scope.$parent.hide_empty){
                    $rootScope.tableBodyData = $rootScope.cacheTableBodyData.filter(function (item) {
                        return !item[0].useData.isEmpty;
                    }).slice(0,$rootScope.pageIndex * $rootScope.pageNumber);
                }else{
                    $rootScope.tableBodyData = $rootScope.cacheTableBodyData.slice(0,$rootScope.pageIndex * $rootScope.pageNumber);
                }

                $(".page-select").css("pointer-events", "auto");
                $(".search-box").hide();
                $(".search-btn").removeClass("search-btn-click");
                //一级页面差异化
                if ($(".differ-btn").hasClass("active")) {
                    $scope.differentiation = [];
                    $(".differ-btn").toggleClass("active");
                    $scope.ifDiffer = !$scope.ifDiffer;
                    $scope.showDiffer();
                }
                $(".table-content").on("scroll", function () {
                    $(this).parents(".j-table").find(".table-equipment-head>div").css("margin-top", -1 * $(this)[0].scrollTop + 1);
                });
				//微调提示
				$scope.getTipFromService();
				//清除选中信息
            },
            errorFn: function () {
                layer.alert('获取数据失败，请联系技术人员处理', {
                    skin: 'layer-alert-themecolor' //样式类名
                });
                $(".page-select").css("pointer-events", "auto");
            }
        });
    }

    //点击选择方案
    $scope.scheme_btn = function (id) {
        let resData_bodys;
        //排程方案与显示地点匹配
        for (let i = 0; i < $scope.schemeList.length; i++) {
            if ($scope.schemeList[i].schemeId == id) {
                resData_bodys = $scope.schemeList[i].locationDtoList;
            }
        }
        let defaultList_res = [];
        for (let i in resData_bodys) {
            defaultList_res.push(resData_bodys[i].locationId);
        }
        //存储当前地点树的地点
        //sessionStorage.defaultList_res = defaultList_res;

        //得出地点树的数据
        $scope.locationTreeList = getAllLocationTreeByLocationId(resData_bodys, $rootScope.locationTreeData);
        $scope.locationTreeList = $scope.locationTreeList.map((locationItem) => {
            return {"children": [scheduleTableViewModelService.getData(locationItem)[0]]};
        });

        //存储schemeId
        sessionStorage.schemeId = id;

        //获取第一个地点树下所有的地点ID，显示出来
        $timeout(function () {
            $(".location-list").children("ul").eq(0).find("i").attr("class", "select-status selected active");
        });

        //存储取消排程时，往后台需要发送的数据 (刷新新数据)
        let data_body = {
            'schemeId': '',
            'locationDtoList': []
        };
        for (let i = 0; i < defaultList_res.length; i++) {
            let objLocation = {};
            objLocation.locationId = defaultList_res[i];
            objLocation.locationFilterList = [];
            data_body.locationDtoList.push(objLocation);
            data_body.schemeId = id;
        }
        sessionStorage.setItem("cancel_data", JSON.stringify(data_body));
    };

    $scope.differentiation = [];

    var ifDiffer = false;
    $scope.ifDiffer = false;
    $scope.showDiffer = function () {
        //获取查询信息
        $scope.ifDiffer = !$scope.ifDiffer;
        if ($scope.differentiation.length < 2) {
            // var saleOrder = tool.getFromInput(".search-box .sale-order"),
            //     materialName = tool.getFromInput(".search-box .material-name"),
            //     materialCode = tool.getFromInput(".search-box .material-code");

            //判断是否已存在差异化数据
            http.get({
                url: $rootScope.restful_api.front_info + "?locationFilterList=" + sessionStorage.locationFilterList_res + "&startTime=" + $scope.controllerDate.minStartDate + "&endTime=" + $scope.controllerDate.maxEndDate,
                successFn: function (res) {
                    res = res.data;
                    //冻结期
                    res.freezeDate = fact_days;
                    //是否翻转状态
                    res.front = $rootScope.frontBack;

                    $scope.differentiation.push(res);
                    $scope.differentiation.push($scope.later);
                    http.get({
                        url: $rootScope.restful_api.differ_info + "?locationFilterList=" + sessionStorage.locationFilterList_res + "&schemeId=" + sessionStorage.schemeId + "&startTime=" + $scope.controllerDate.minStartDate + "&endTime=" + $scope.controllerDate.maxEndDateTime,
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
							
							//一级差异化页面高亮处理
 							$scope.differPageChange();
                        }
                    });
                }
            });
        } else {
            $scope.differentiation = [];
        }
        $(".differ-btn").toggleClass("active");
    };
	
	//一级差异化页面操作
	$scope.differPageChange = function(){
		$timeout(function(){
			$(".diffe-table .table-content .table-td").each(function () {
				var thisDataDateid = $(this).attr("data-dateId");
				if ($scope.dateId.indexOf(thisDataDateid) > -1) {
					$(this).addClass("jIsDifferent")
				}
			});
			$(".diffe-table .first").css({"opacity": 1, "cursor": "defult"});
		},0);	
	};

	//点击按钮返回排程前页面
    $scope.returnPreviewPage = () => {
        $location.path("/preview").replace();
    };

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
    };

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
    };

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
                                        $(".pap-alert li:eq(" + i + ")").children(".in-true").removeClass("class-false").addClass("class-true");
                                        $(".pap-alert li:eq(" + i + ")").children(".pap-info").text("pap成功");
                                        $(".pap-alert li:eq(" + i + ")").children("b").hide();     //如果成功，提示信息按钮将隐藏
                                    } else {
                                        $(".pap-alert li:eq(" + i + ")").children(".in-true").removeClass("class-true").addClass("class-false");
                                        $(".pap-alert li:eq(" + i + ")").children(".pap-info").text("pap失败");
                                        $(".pap-alert li:eq(" + i + ")").children("b").show();
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
    };

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
    };

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
    };

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
    };

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
				//为真撤销成功，为假已经是最后一步
                if (res.data) {
                    ifSearchMsg = false;
                    result_show_table(sessionStorage.locationId_res, sessionStorage.locationFilterList_res);      //若为真，则重新获取数据
					
					//清空暂存间选中
					cacheCheckInfo = {};
                    layer.msg('撤销成功', {time: 3500, icon: 1});

                    //刷新暂存区和二级页面
                    if ($(".jPunitDetail").css("display") == "flex") {
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
					//最后一步无修改，不需要做任何刷新
                    layer.msg('已经是最后一步！', {time: 3500, icon: 2});
                }
            },
            errorFn: function (res) {
            }
        });
    };

    /**
     * 检验按钮 方法
     **/
    $scope.check_aps = function ($event) {
        $('.cover').hide();
        ifSearchMsg = false;
		
        if ($event.target.className === "check-check-box") {
            $scope.checkSwitch = !$scope.checkSwitch;
            $(".jiaoyan-icon").parent().toggleClass("search-btn-click");
            return;
        }
        $(".check-btn-div").hide();
        $scope.confirm_check();
    };

    /**
     * 保存前校验 方法
     **/
    $scope.save_check_aps = function () {
        ifSearchMsg = false;
        $scope.confirm_check(function () {
            $(".check-btn-div").show(10);
        });
    };

    /**
     * 老版的提示信息校验，所有新版校验改动完成，删除老版
     **/
    $scope.confirm_dialog_old = function (checkRow, $event) {
        $event.stopPropagation();
        $scope.checkRows = checkRow.checkInfo;
        var indexLayer = layer.open({
            type: 1,
            title: "异常原因",
            shadeClose: true,
            skin: 'yourclass',
            content: $("#check_detail_dialog"),
            success: function () {
                // 272是显示框正常宽度，450是高度
                $(".layui-layer").css({
                    "left": $event.pageX - $("#check_detail_dialog").width(),
                    "top": $event.pageY > (document.body.clientHeight - 450) ? document.body.clientHeight - 450 : $event.pageY
                })
                $("#check_detail_dialog").on("click", ".sure", function () {
                    layer.close(indexLayer);
                })
            }
        })
    };

    //新版的提示信息校验，所有新版校验改动完成，删除老版
    $scope.confirm_dialog = function (checkRow, $event) {
        if ((checkRow.checkErrorType === 5) || (checkRow.checkErrorType === 4) || (checkRow.checkErrorType === 3)) {
            $scope.checkSchedule = true;
            $scope.checkErrorType = checkRow.checkErrorType;//校验类型
            $scope.checkItemTableHeadData = checkRow.checkItemTableHeadData;//头部数组
            $scope.checkItemTableBodyData = checkRow.checkItemTableBodyData;//头部数组
            $timeout(function () {
                tool.setTableHeadWidth($(".jcheckError"));
            });
        } else {
            $scope.confirm_dialog_old(checkRow, $event)
        }

    };

    /**
     * 校验后  点击'确定' 保存方法
     **/
    $scope.confirm_save = function () {
        $scope.save_aps();
        $(".wrap-alert").hide(50);
    };

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
        $(".cover,.wrap-alert").show();	//提示信息
        progressbar.children("span").css("width", "0px");
        progressbar.children("span").animate({"width": "40px"});
        function progress() {
            http.post({
                url: $rootScope.restful_api.aps_check,
                data: JSON.parse(sessionStorage.getItem("cancel_data")),
                successFn: function (res) {
                    $scope.checkList = scheduleTableViewModelService.displayCheckErrorTable(res.data.scheduleValidateMap);
                    if (res.data.status == 1) {
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

        //多方案排程影响检验
        http.get({
            url : $rootScope.restful_api.result_version_validate + $scope.schemeId,
            successFn:function (res) {
                //是否出现多方案排程的提示
                //res.data : 为boolean值
                $scope.allSchemeValidate = !res.data;
            },
            errorFn:function (res) {
                if(typeof res.data !== "boolean"){
                    layer.alert("多方案排程验证失败")
                }
            }
        });

        setTimeout(progress, 1000);
        result_show_table(sessionStorage.locationId_res, sessionStorage.locationFilterList_res);
        /*刷新数据*/
    };

    /******===== 二级页面差异化 开始=====******/

    var index = 2;//锚点当前位置

    /**
     * 单击差异化单元格
     **/
    $scope.differ_unit_click = function (cell, $event) {
        //表头不能点击
        ifSearchMsg = false;
        if (!$($event.target).hasClass("jIsDifferent") && !$($event.target).parents(".jIsDifferent").length) {
            return;
        }
        const thisInf = cell[0],
            thisDate = thisInf.date,
            thisEquipment = thisInf.equipment_id;
        $scope.differ_show(thisDate, thisEquipment);
    };

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
    };

    /**
     * 创建二级差异化页面
     **/
    $scope.differ_show = function (workDate, equipmentId) {
		//显示页面
		// $(".table-dialog-differ").show();
		//弹窗
		const secondPageDifferLayer = layer.open({
			type: 1,
			title: false,
			shadeClose: true,
			closeBtn : 0,
			content : $(".table-dialog-differ"),
            area : ['1280px','720px'],
			success : function(){
			}
		});
		$(".differ-show").find("span").show();
        let thisWorkDate = workDate,
            newId = equipmentId.split("_");
        http.get({
            url: $rootScope.restful_api.secondPage_differ + "workDate=" + thisWorkDate + "&equipmentId=" + newId[0] + "&equipmentType=" + newId[1] + "&schemeId=" + sessionStorage.schemeId,
            successFn: function (res) {
                res = res.data;
//				/*以工单为判断*/
                const oRawJsonToGeneral_order = scheduleTableViewModelService.rawJsonToGeneral_order(res);

                const leftDifferTableData = scheduleTableViewModelService.jsonToDifferTable(oRawJsonToGeneral_order.leftJson);
                const rightDifferTableData = scheduleTableViewModelService.jsonToDifferTable(oRawJsonToGeneral_order.rightJson);

                //第一个表
                $scope.headDataView_left = leftDifferTableData.headData;//表头
                $scope.tableDataView_left = leftDifferTableData.bodyData;//表格数据

                //第二个表
                $scope.headDataView_right = rightDifferTableData.headData;
                $scope.tableDataView_right = rightDifferTableData.bodyData;
                $timeout(function () {     //表头宽度函数
                    $scope.auto_width(".cover-heads_left", ".table-window-left");   //左侧列表
                    $scope.auto_width(".cover-heads_right", ".table-window-right"); //右侧列表
                })
            }
        });
        /*以工单为判断  end*/

        /*以车间计划为判断*/
        http.get({
            url: $rootScope.restful_api.workshop_plan + "workDate=" + thisWorkDate + "&equipmentId=" + newId[0] + "&equipmentType=" + newId[1] + "&schemeId=" + sessionStorage.schemeId,
            successFn: function (res) {
                const oRawJsonToGeneral_data = scheduleTableViewModelService.rawJsonToGeneral_data(res.data);
                const leftDifferTableData_pool = scheduleTableViewModelService.jsonToDifferTable(oRawJsonToGeneral_data.leftJson);
                const rightDifferTableData_pool = scheduleTableViewModelService.jsonToDifferTable(oRawJsonToGeneral_data.rightJson);
                //绑定页面
                //第一个表-左边
                $scope.headDataView_leftPool = leftDifferTableData_pool.headData;
                $scope.tableDataView_leftPool = leftDifferTableData_pool.bodyData;

                //第二个表-右边
                $scope.headDataView_rightPool = rightDifferTableData_pool.headData;
                $scope.tableDataView_rightPool = rightDifferTableData_pool.bodyData;
            }
        });
        /*以车间计划为判断end*/

        // //高亮效果
        // $scope.highL = {
        //     "background": "#fefaec",
        //     "color": "#333"
        // };
        // $timeout(function () {
        //保留差异 按钮
        $scope.differ_keep = function () {
            const hideTr = $(".table-dialog-differ").find("tbody").children("tr[isHighLight=true]");
            hideTr.toggle();
            // console.log(hideTr);
            // //更新表头遮盖层列宽  ==工单
            // $scope.auto_width(".cover-heads_left", ".table-window-left");   //左侧列表
            // $scope.auto_width(".cover-heads_right", ".table-window-right"); //右侧列表
            // //更新表头遮盖层列宽  ==车间计划
            // $scope.auto_width(".cover-headsPool_left", ".tablePool_left");
            // $scope.auto_width(".cover-headsPool_right", ".tablePool_right");
        };
        // }, 0);
        //滑块操作
        const J_sliderBar = $("#J_sliderBar"),
            bar_length = J_sliderBar.width(),//获取整个条的长度
            n = 4,//分成几份
            n_len = bar_length / n,  //每份的长度
            len = n_len / 2,   //一半的长度
            x_start = J_sliderBar.offset().left;
        J_sliderBar.on("mousedown", function (e) {
            $("body").addClass("select-none");//禁止选中文字
            let lastX = null;  //初始值
            document.onmousemove = function (e) {
                const _cliX = e.clientX;
                if (lastX == null) { //判断鼠标的方向
                    lastX = _cliX;
                    return;
                }
                const _center = x_start + index * n_len + len;
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
        });
        document.onmouseup = function () {
            //移动操作方法
            function move_range(left_range1, left1, left_range2, right_range1, left2, right_range2, boolean1, left3, boolean2, title_range1, m_left1, boolean3, title_range2, m_left2) {
                var table_left = $(".table-left"),
                    table_right = $(".table-right"),
                    differ_line = $(".differ-line"),
                    title_left = $(".title-left"),
                    title_right = $(".title-right");
                table_left.animate({"width": left_range1, "left": left1}, 60);
                // table_left.find("table").animate({"width": left_range2}, 60);
                table_right.animate({"width": right_range1, "left": left2}, 60);
                // table_right.find("table").animate({"width": right_range2}, 60);

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
            // $timeout(function () {
            //     //更新表头遮盖层列宽  ==工单
            //     $scope.auto_width(".cover-heads_left", ".tableTask_left");   //左侧列表
            //     $scope.auto_width(".cover-heads_right", ".tableTask_right"); //右侧列表
            //     //更新表头遮盖层列宽  ==车间计划
            //     $scope.auto_width(".cover-headsPool_left", ".tablePool_left");
            //     $scope.auto_width(".cover-headsPool_right", ".tablePool_right");
            // }, 200);
            $("body").removeClass("select-none");  //移除选中样式
            document.onmousemove = null;
        };
        //滚动条
        $(".differ-wrap-table").mouseover(function () {
            $(this).css("overflow", "auto");
        }).mouseleave(function () {
            $(this).css("overflow", "hidden");
        })
        //固定表头
            .scroll(function () {
                const thisScrollTop = $(this).scrollTop();
                $(this).children("div").first().css("top", thisScrollTop);
            })

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
			layer.close(secondPageDifferLayer);
		};
    };

    $scope.testOnFinishEnd = function () {
        // console.log(122342342343);
    };

    /**
     * 点击二级差异化表格行
     **/
    $scope.click_show = function ($event) {
        if ($(".isPooltaskId").css("display") == "block") {
            return;
        }
        const showDiv = $("#show");
        showDiv.empty();  //清空
        $(".differ-show-info").show();

        //点击表格
        const thisTd = $($event.target).parent();
        const index = thisTd.index() + 1;
        const thisTr = $(".isTask").find(".table-space-differ").children("table").find("tr:eq(" + index + ")");
        const el_head = thisTd.parent().siblings();
        const cloneHead = el_head.clone();
        if (thisTd.parents("div").hasClass("table-window-left")) {
            showDiv.append(cloneHead).append(thisTr.clone());
        } else if (thisTd.parents("div").hasClass("table-window-right")) {
            if (thisTr.length == 1) {
                showDiv.append(cloneHead).append("<tr style='height:25px;border: 1px #ccc solid;'></tr>").append(thisTr.clone());
            } else {
                showDiv.append(cloneHead).append(thisTr.clone());
            }
        }
        let tdLength = cloneHead.children().children().length;
        cloneHead.parent().width(tdLength * 100);
    };

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
    });
    $(".isTaskBtn").on("click", function () {
        $(".isPooltaskId").hide();
        $(".isTask").show();
        $scope.auto_width(".cover-heads_left", ".table-window-left");   //左侧列表
        $scope.auto_width(".cover-heads_right", ".table-window-right"); //右侧列表
        $(this).addClass("switch-result");
        $(this).siblings("span").removeClass("switch-result");
    });
    /******===== 二级页面差异化 结束=====******/
	//resize
	$(window).on("resize", function () {
		tool.setTableHeadWidth($(".cache-window"),2);
		tool.setTableHeadWidth($(".jPunitDetail"),2);
		tool.setTableHeadWidth($(".jcheckError"));
		$scope.getDateChangeWidth();
		$scope.$apply();
	});
    /**
     * 打开暂存间
     **/
    $scope.cache_box = function () {
        const jTableDialogWindow = $(".jPunitDetail");
        const jCacheWindow = $(".cache-window");
        const thisDateUrl = $scope.isByPk ? $rootScope.restful_api.cache_info : $rootScope.restful_api.cache_info_order;

        //调用此方法是为了转码可能输入的的文字
        let materialCode = tool.getFromInput(".cache-window .jMaterialCode"),
            materialName = tool.getFromInput(".cache-window .jMaterialName"),
            processName = tool.getFromInput(".cache-window .jProcessName"),
            processCode = tool.getFromInput(".cache-window .jProcessCode"),
            saleOrderCode = tool.getFromInput(".cache-window .jSaleOrder");
        if ((saleOrderCode || materialName || materialCode || processCode || processName) && cacheSearch) {
            var searchAct = true;
        }

        let sUrl = thisDateUrl + "" +
            "?schemeId=" + sessionStorage.schemeId + "&saleOrderCode=" + saleOrderCode + "&materialName=" + materialName + "&materialCode=" + materialCode
            + "&processCode=" + processCode + "&processName=" + processName;

        http.get({
            url: sUrl,
            successFn: function (res) {
                //将二级页面靠左
//                jTableDialogWindow.animate({left: "580px"});
                jCacheWindow.show().css({opacity: 1});
				
				//如果是订单维度，需要一点特殊处理
				if(!$scope.isByPk){
					let newArr = [],
						newObj = {},
						returnRow = res.data.row;
					for(let i = 0, l = returnRow.length; i < l; i++){
						if(newObj[returnRow[i].poolTaskId]){
							newArr[newObj[returnRow[i].poolTaskId].index].taskNum += returnRow[i].taskNum;
						}else{
							newObj[returnRow[i].poolTaskId] = {
								index: newArr.length
							};
							newArr.push(returnRow[i]);
						}
					}
					res.data.row = newArr;
				}
				
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

                //滚动条监听顶部固定栏监听
                $timeout(function () {
                    tool.setTableHeadWidth($(".cache-window"),$scope.isByPk ? 2 : 0);
                    $(".cache-window .table-space").on("scroll", function () {
                        let coverHead = $(".cache-window").find(".cover-head");
                        let scrollLeft = $(this).scrollLeft();
                        let scrollTop = $(this).scrollTop();
                        $(".cache-window").find(".fix-table-column table").css("top", -scrollTop);
                        coverHead.css("left", -scrollLeft);
                        //根据滚动条绝对定位固定列的位置
                        coverHead.children().eq(0).css("left",scrollLeft);
                        coverHead.children().eq(1).css("left",scrollLeft + coverHead.children().eq(0).width());
                    });
                }, 0);

                $timeout(function () {
                    //初始化复选框
                    $("input[name='StorageSingle'],input[name='StorageAll']").prop("checked", false);

                    //全选全不选
                    $("input[name=StorageAll]").on("click", function () {
                        const checkValue = $(this).is(':checked');
                        if (checkValue === true) {
                            $("input[name='StorageSingle']").prop("checked", true);
                        } else {
                            $("input[name='StorageSingle']").prop("checked", false);
                        }
                    });
                    /*复选框反选*/
                    $("body").on("click", "input[name='StorageSingle']", function () {
                        const chsub = $("input[name='StorageSingle']").length;
                        const checkedsub = $("input[name='StorageSingle']:checked").length;
                        if (chsub === checkedsub) {
                            $("input[name='StorageAll']").prop("checked", true);
                        } else {
                            $("input[name='StorageAll']").prop("checked", false);
                        }
                    });

                    if (cacheCheckInfo.pkId) {
                        $(".cache-window").find("tr[pk-id=" + cacheCheckInfo.pkId + "][versionid=" + cacheCheckInfo.versionId + "]").find("input").prop("checked", true);
                    }
                }, 0);

                //关闭暂存间
                jCacheWindow.find(".close-window").on("click", function () {
                    jCacheWindow.hide();

                    //将二级页面居中
//                    jTableDialogWindow.animate({left: "50%"});
//                    jCacheWindow.animate({opacity: 0}, {
//                        callback: function () {
//                            
//                        }
//                    });
					jCacheWindow.hide();
                    $(".num-window").hide();
                })
            },
            errorFn: function (res) {
            }
        });
    };

    /**
     * 暂存间查询
     **/
    var cacheSearch = false;
    $scope.change_cache_window = function () {
        cacheSearch = true;
        $scope.cache_box();
    };
	
    /**
     * 暂存间切换显示维度
     **/
	$scope.cache_box_type = "切换订单"
    $scope.cache_window_type = function () {
		$scope.isByPk = !$scope.isByPk;
		$scope.cache_box_type = $scope.isByPk ? "切换订单" : "切换计划";
		$scope.cache_box();
    };

    /**
     * 微调提示
     **/
    $scope.cache_tip = function (tableRow, $event) {
        let thisTr = $($event.target).parents("tr"),
            pkId = thisTr.attr("pk-id"),
            versionId = thisTr.attr("versionid");

        if (thisTr.find("input").prop("checked")) {
            $(".table-td-suit").removeClass("table-td-suit");
            cacheCheckInfo = {};
            return;
        }

        cacheCheckInfo.pkId = pkId;
        cacheCheckInfo.versionId = versionId;

        //二级界面未打开，是一级微调或者微调提示，限制单选
        if ($(".jPunitDetail").is(":hidden")) {
            thisTr.siblings().find("input").prop("checked", false);
            //清除前一步的适宜选中
            $(".table-td-suit").removeClass("table-td-suit");
        } else {
            return;
        }

		$scope.getTipFromService();
    };
	
	//切换大小格子时、隐藏空白行
	$scope.$on("modelOrTrEmpty",function(){
		//微调提示
		$scope.getTipFromService();
		//一级差异化
		$scope.differPageChange();
	});
	
	//切换全屏时
	$scope.$on("fullScreen",function(allInfo,newState){
		$timeout(function(){
			$scope.getDateChangeWidth();
		})
		//切换到全屏，有一个自动的$apply()，取消全屏没有
		if(!newState){
			$scope.$apply();			
		}
	});
	
	//从后台拿微调提示数据
	$scope.getTipFromService = function(){
		//如果没有勾选，返回
		if(cacheCheckInfo.pkId){
			let thisUrl = $rootScope.restful_api.cache_tip;
			
			//请求数据
			http.post({
				url: thisUrl,
				data: {
					schemeId: sessionStorage.schemeId,
					queryList: [
						{
							pkId: cacheCheckInfo.pkId,
							versionId: cacheCheckInfo.versionId
						}
					],
					startTime: $scope.controllerDate.minStartDate,
					endTime: $scope.controllerDate.maxEndDate
				},
				successFn: function (res) {
					//获取微调提示信息数据，调用计算方法
					$scope.showMoveInfo(res.data.equipmentUnit);
				}
			})
		}
	};

    /**
     * 微调提示页面处理
     **/
    $scope.showMoveInfo = function (moveInfo) {

        let equipmentList = Object.keys(moveInfo),
//			jTable = $(".j-table").not(".j-table:hidden"),
            jTable = $(".j-cache-table"),
			
            //获取显示的设备详情
            equipmentInfo = $(".table-equipment-head .table-td");

        for (let i = 0, l = equipmentInfo.length; i < l; i++) {
			//这一行的设备ID
			let thisEquipmentId = equipmentInfo.eq(i).attr("equipment-id");
            //如果是适宜设备进行操作
            if (equipmentList.indexOf(thisEquipmentId) > -1) {
                let thisTrIndex = i,
                    //计算这一行哪些格子可以移入（日期转索引）
                    dateList = Object.keys(moveInfo[thisEquipmentId].time),
                    tdIndex = $scope.dateToIndex(dateList, $scope.controllerDate.minStartDate);

                for (let i = 0, l = tdIndex.length; i < l; i++) {
                    jTable.each(function () {
                        let jTr = $(this).find(".table-tr").eq(thisTrIndex),
                            tdList = jTr.find(".table-td");

                        tdList.eq(tdIndex[i] + 1).addClass("table-td-suit");
                    })

                }
            }
        }
    };

    /**
     *根据传入的时间数组，开始时间，计算偏移天数
     *
     *param 时间数组 开始时间
     *return 偏移天数的数组
     **/
    $scope.dateToIndex = function (dateList, startTime) {
        let indexArr = [];
        for (let i = 0, l = dateList.length; i < l; i++) {
            //86400000是一天的毫秒数
            indexArr.push((tool.stringToDate(dateList[i]) - tool.stringToDate(startTime)) / 86400000);
        }
        return indexArr;
    };

    /**
     * 移入暂存间
     **/
    $scope.move_to_cache = function () {
        var thisQuery = goWindowTableData.query,
            thisEquipmentId = thisQuery.equipments,
            thisStartTime = thisQuery.startTime;
            // thisEndTime = thisQuery.endTime;

        //获取选中项
        var jTableDialogWindow = $(".jPunitDetail").find(".fix-table tbody"),
            jCheckedInput = jTableDialogWindow.find("input:checked");

        var thisObj = {};
        thisObj.tempList = [];

        if (jCheckedInput.length === 0) {
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
        if ($(".jPunitDetail").css("display") === "none") {
            layer.alert('请打开要移入的位置!', {
                skin: 'layer-alert-themecolor' //样式类名
            });
            return;
        }
        var thisQuery = goWindowTableData.query,
            thisEquipmentId = thisQuery.equipments,
            thisStartTime = thisQuery.startTime;
            // thisEndTime = thisQuery.endTime;

        //获取选中项
        const jCheckedInput =  $(".cache-window").find(".fix-table tbody").find("input:checked");

        var thisObj = {};
        thisObj.tempList = [];

        if (jCheckedInput.length === 0) {
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
        getProcessOrder(thisObj, $rootScope.restful_api.cache_moveout);
    };

    /**
     * 部分移入暂存间
     **/
    $scope.part_move_in_cache = function (tableRow, $event) {
		$scope.numWindowState = "移入暂存间";
        $event.stopPropagation();
        var thisQuery = goWindowTableData.query,
            thisEquipmentId = thisQuery.equipments;

        tableRow = tableRow[0];
        var workDate = tableRow.startTime.substring(0, 10),
            thisEquipmentName = tableRow.pUnitName,
            thisNum = tableRow.taskNum - 0,
            thisProcessOrder = tableRow.index,
            thisPkId = tableRow.pkId,
            thisVersionId = tableRow.versionId;

        var thisX = $event.pageX + 10,
            thisY = $event.pageY - 58;
        const numWindow = $(".num-window");
        numWindow.find("input").val(0);
        numWindow.show().css("left", thisX).css("top", thisY);

        $($event.target).css("color", "#1E7CD9");

        $(".num-window-sure").off("click").on("click", function () {
            let num = numWindow.find("input").val() + "";
            if (num.indexOf(".") > -1 || +num <= 0 || +num > thisNum) {
                layer.alert('请输入正确的数字！', {
                    skin: 'layer-alert-themecolor' //样式类名
                });
                return;
            }
            numWindow.hide(0, function () {
                $(".show-table .sale-order-change").css("color", "");
            });
            num = num - 0;

            let thisObj = {};
            let nUrl,
                _text;
            thisObj.locationIdList = $rootScope.locationIdList;
            thisObj.workDate = workDate;
            thisObj.pUnitId = thisEquipmentId[0].equipmentId;
            thisObj.pUnitType = thisEquipmentId[0].equipmentType;
            thisObj.processOrder = thisProcessOrder;
            thisObj.schemeId = sessionStorage.schemeId;

            if (num === thisNum) {
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
    };

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
		$scope.numWindowState = "移出暂存间";
        if ($(".jPunitDetail").css("display") === "none") {
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
            thisVersionId = tableRow.versionId,
            newI = thisEquipmentId[0].equipmentId;

        var thisX = $event.pageX - 150,
            thisY = $event.pageY - 58;
        const numWindow = $(".num-window");
        numWindow.find("input").val(0);
        numWindow.show().css("left", thisX).css("top", thisY);

        $($event.target).css("color", "#1E7CD9");

        $(".num-window-sure").off("click").on("click", function () {
            let num = numWindow.find("input").val() + "";

            if (num.indexOf(".") > -1 || +num <= 0 || +num > thisNum) {
                layer.alert('请输入正确的数字', {
                    skin: 'layer-alert-themecolor' //样式类名
                });
                return;
            }

            numWindow.hide(0, function () {
                $(".show-table .sale-order-change").css("color", "");
            });
            num = num - 0;
            let thisObj = {};
            let nUrl;
            thisObj.locationIdList = $rootScope.locationIdList;
            thisObj.workDate = workDate;
            thisObj.pUnitId = thisEquipmentId[0].equipmentId;
            thisObj.pUnitType = thisEquipmentId[0].equipmentType;

            if (num === thisNum) {
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
     * 产能查询
     * 此处为一级页面移出暂存间，需要先查询产能，再由前端计算移入数量
     **/
    $scope.getCapability = function (cell, $event) {
        let thisData = {
                schemeId: sessionStorage.schemeId,
                capabilityList: []
            },
            cacheCheckInfo = $(".cache-window .fix-table input:checked").parents("tr"),
            checkBoxInfo = $scope.$parent.checkBoxArray,
            newCheckBoxInfo = [],
            _checkBoxArray = {};

        if (checkBoxInfo.length === 0) {
            layer.alert("请单击选中要移入的单元格！");
            return;
        }

        //选中格子，设备维度去重
        for (let i = 0, l = checkBoxInfo.length; i < l; i++) {
            if (!_checkBoxArray[checkBoxInfo[i].id_type]) {
                newCheckBoxInfo.push(checkBoxInfo[i]);
                _checkBoxArray[checkBoxInfo[i].id_type] = true;
            }
        }

        //构造查询条件
        cacheCheckInfo.each(function () {
            for (let i = 0, l = newCheckBoxInfo.length; i < l; i++) {
                thisData.capabilityList.push({
                    temp: {
                        pkId: $(this).attr("pk-id"),
                        versionId: $(this).attr("versionid")
                    },
                    equipmentId: checkBoxInfo[i].equipmentId,
                    equipmentType: checkBoxInfo[i].equipmentType
                });
            }
        });

        //查询产能
        http.post({
            url: $rootScope.restful_api.get_capability,
            data: thisData,
            successFn: function (res) {
                $scope.moveToWork(res, checkBoxInfo);
            }
        })
    }

    /**
     * 一级页面移出暂存间（移入日程)//构造完成，等待徐俊接口联调
     **/
    $scope.moveToWork = function (resData, checkBox) {
        let moveData = $scope.getMoveToWorkData(resData.data, checkBox),
            thisUrl = $rootScope.restful_api.first_moveto_work;
        //构造完成，等待徐俊接口联调
        console.log(moveData);

        if (moveData.removeList.length === 0) {
            layer.alert("剩余产能不足");
            return;
        }

        http.post({
            url: thisUrl,
            data: moveData,
            successFn: function () {
                //成功刷新一级页面,暂存间
                result_show_table(sessionStorage.locationId_res, sessionStorage.locationFilterList_res);
                $scope.cache_box();

                //清空选中格子
                $scope.$parent.checkBoxArray = [];
				
				//自动校验
				if ($scope.checkSwitch) {
                    $scope.confirm_check(function () {
                        if ($scope.allSuccess) {
                            for (let i = 0, l = $scope.checkList.length; i < l; i++) {
                                if (!$scope.checkList[i].checkResult) {
                                    return;
                                }
                            }
                            $scope.$parent.confirm_close();
                        }
                    });
                }
				
				//情况暂存间选中信息
				cacheCheckInfo = {};
            }
        })

    }

    /**
     * 计算每个格子排入个数
     **/
    $scope.getMoveToWorkData = function (capability, checkBox) {
        let capabilityList = capability.capabilityList,
            capabilityListLength = capabilityList.length - 1,
            unitTime = capabilityList[capabilityListLength].unitTime,
            thisOrderNum = capabilityList[capabilityListLength].temp.taskNum,
            thisPkId = capabilityList[capabilityListLength].temp.pkId,
            thisVersionId = capabilityList[capabilityListLength].temp.versionId,
            returnData = {
                schemeId: sessionStorage.schemeId,
                partTemp: {
                    pkId: thisPkId,
                    versionId: thisVersionId
                },
                removeList: []
            };

//        if (capabilityList.length > 1) {
//            layer.alert("当前只移入选中的第一条！");
//        }

        //将这个计划按照点击的顺序排入日程（主要计算数量）
        for (let i = 0, l = checkBox.length; i < l; i++) {
            let thisRestTime = checkBox[i].restTime,
                thisNum = 0;

            //如果剩余时间少于单位产能，跳过
            if (thisRestTime < unitTime) {
                continue;
            }

            //推入计算的个数
            thisNum = Math.floor(thisRestTime / unitTime);

            returnData.removeList.push({
                workDate: checkBox[i].date,
                pUnitId: checkBox[i].equipmentId,
                pUnitType: checkBox[i].equipmentType,
                taskNum: thisOrderNum > thisNum ? thisNum : thisOrderNum
            });

            thisOrderNum -= thisNum;
            if (thisOrderNum <= 0) {
                break;
            }
        }

        return returnData;
    }

    /**
     * 一级页面移入暂存间（移出日程)
     **/
    $scope.moveToCache = function (cell, $event) {
        let thisData = {
                schemeId: sessionStorage.schemeId,
                removeList: []
            },
            checkBoxInfo = $scope.$parent.checkBoxArray,
            thisUrl = $rootScope.restful_api.first_moveto_cache;

        for (let i = 0, l = checkBoxInfo.length; i < l; i++) {
            let thisCheckBox = checkBoxInfo[i];
            thisData.removeList.push({
                workDate: thisCheckBox.date,
                pUnitId: thisCheckBox.equipmentId,
                pUnitType: thisCheckBox.equipmentType
            })
        }

        http.post({
            url: thisUrl,
            data: thisData,
            successFn: function () {
                //成功刷新一级页面,暂存间
                result_show_table(sessionStorage.locationId_res, sessionStorage.locationFilterList_res);
                $scope.cache_box();

                //清空选中格子
                $scope.$parent.checkBoxArray = [];
				
				//自动校验
				if ($scope.checkSwitch) {
                    $scope.confirm_check(function () {
                        if ($scope.allSuccess) {
                            for (let i = 0, l = $scope.checkList.length; i < l; i++) {
                                if (!$scope.checkList[i].checkResult) {
                                    return;
                                }
                            }
                            $scope.$parent.confirm_close();
                        }
                    });
                }
            }
        })

    }

    /**
     * 获取插入位置，并传数据给后台
     **/
    function getProcessOrder(thisObj, url) {
        var thisQuery = goWindowTableData.query,
            thisEquipmentId = thisQuery.equipments,
            thisStartTime = thisQuery.startTime,
            thisEndTime = thisQuery.endTime;
        var jTableSpace = $(".jPunitDetail").find(".show-table");
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
                var jTableDialogWindow = $(".jPunitDetail");
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
                    tool.setTableHeadWidth(jTableDialogWindow,2);
                }, 0);
            },
            errorFn: function (res) {
            }
        });
        if (jTableSpace.find(".table-space").children("table").find("tr").length > 1) {
            layer.alert('请在左侧表格点击你要插入的位置。', {
                skin: 'layer-alert-themecolor' //样式类名
            });
            //显示取消按钮
            $(".cance-move").show();
            //二级页面不可修改
            $(".jPunitDetail").find(".sale-order-change").css("pointer-events", "none");
            $(".jPunitDetail").find("input").css("pointer-events", "none");
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
                var thisTr = $(this).parents("tr"),
					thisIndex = thisTr.attr("index");

                var thisX = event.clientX + 20,
                    thisY = event.clientY + 20,
                    thisLineX = event.offsetX,
                    thisLineY = event.offsetY;
                $(".mouse-text").css("left", thisX).css("top", thisY);

                //在合适的地方插入空白行（判断条件可以改为父节点没有li）
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
                            newLine.clone().insertAfter($(".table-space tbody tr").eq(thisIndex));
                            newLine.insertAfter($(".fix-table-column tbody tr").eq(thisIndex));
                        }
                    } else {
                        if (!thisTr.prev().hasClass("tr-holder")) {
                            //在此行之后插入一行
                            $(".tr-holder").remove();
                            var newLine = $("<tr class='tr-holder'></tr>");
							newLine.clone().insertBefore($(".table-space tbody tr").eq(thisIndex));
                            newLine.insertBefore($(".fix-table-column tbody tr").eq(thisIndex));
                        }
                    }
                }
            });
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
            $(".jPunitDetail").find(".sale-order-change").css("pointer-events", "auto");
            $(".jPunitDetail").find("input").css("pointer-events", "auto");
            $(".cance-move").hide();
        }
    }

    /**
     * 暂存间功能用,接口调用方法
     * @param _obj : 参数对象,包括_type(请求类型),_url（接口地址),_data(数据对象),_text(显示文本);
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
                            for (let i = 0, l = $scope.checkList.length; i < l; i++) {
                                if (!$scope.checkList[i].checkResult) {
                                    return;
                                }
                            }
                            $scope.$parent.confirm_close();
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
    };


    /**
     * 点击查询，刷新页面。
     **/
    $scope.search = function () {
        ifSearchMsg = true;
        result_show_table(sessionStorage.locationId_res, sessionStorage.locationFilterList_res);
    };


    /**
     * 表头单元格点击
     **/
    $scope.date_click = function (date, clickLiType) {
        //如果右键日期,不做处理.
        let thisData = date,
            thisStartDate = thisData.thisDate,
            thisEndDate = thisData.thisDate,
            thisEquipment = thisData.equipment;
        let saleOrder = tool.getFromInput_nocode(".search-box .sale-order"),
            materialName = tool.getFromInput_nocode(".search-box .material-name"),
            materialCode = tool.getFromInput_nocode(".search-box .material-code");
        $scope.click_creat_window(thisStartDate, thisEndDate, thisEquipment, saleOrder, materialName, materialCode, clickLiType);
    };

    /**
     * 单元格鼠标点击事件
     **/
    $scope.unit_click = function (cell, clickLiType, $event) {
        //如果没有cell值，说明是头部，调用头部方法，1是设备列表;2是有内容的格子，3是没内容的格子
        if (!cell[0]) {
            $scope.date_click(cell, clickLiType);
            return;
        }
        ifSearchMsg = false;
        //当日没有生产
        if (cell[0].type === 3 && clickLiType === 1) {
            layer.alert("未排入生产任务");
            return;
        }
        // if ((cell[0].type == 1 && clickLiType === 3)) {
        // }
        let thisInf = cell[0],
            thisDate = thisInf.date,
            thisStartDate = thisInf.s_date,
            thisEndDate = thisInf.e_date,
            thisEquipment = thisInf.equipment_id;
        if (!!thisDate) {
            thisStartDate = thisDate;
            thisEndDate = thisDate;
        }
		
		//构造班次下拉框
//		http.get({
//			url: $rootScope.restful_api.get_shift,
//			successFn: function(res){
//				let shiftData = res.data,
//					repeatData = [];
//
//				$scope.shiftData = {
//					showText: "查询班次",
//					className: "jShiftName",
//					value: ""
//				};
//				//循环构造下拉框数据
//				for(let i = 0, l = shiftData.length ; i < l ; i++){
//					let thisData = shiftData[i];
//					repeatData.push({
//						showName: thisData.shiftName,
//						id: thisData.shiftId
//					})
//				}
//				//传入组件
//				$scope.shiftData.repeatData = repeatData;
//			}
//		})
		
        //查询条件
        let saleOrder = tool.getFromInput_nocode(".search-box .sale-order"),
            materialName = tool.getFromInput_nocode(".search-box .material-name"),
            materialCode = tool.getFromInput_nocode(".search-box .material-code");
        $scope.click_creat_window(thisStartDate, thisEndDate, thisEquipment, saleOrder, materialName, materialCode, clickLiType, cell);
    };


    /**
     * 创建二级页面
     * @params clickLiType:右键小目录点击li获得html中华设定的type值
     **/
    $scope.click_creat_window = function (startTime, endTime, equipment, saleOrder, materialName, materialCode, clickLiType, cell) {
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
            aEquipment = "",
			shiftId = $(".jShiftName input").attr("check_id");;

        //设备列表
        if (thisEquipment.indexOf(",") > -1) {
            aEquipment = thisEquipment.split(",");
        } else {
            aEquipment = [thisEquipment];
        }

        //查询二级页面数据
        var isArr = [];
        for (var i in aEquipment) {
            var isObj = {};
            var newI = aEquipment[i].split("_");

            isObj.freezeDate = goEquipment[aEquipment[i]].freezeDate;
            thisEquipmentName.push(goEquipment[aEquipment[i]].punitName);
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
            // 'order': isStr,
            'equipments': isArr,
			'shiftId':shiftId,
            'schemeId': sessionStorage.schemeId,
            "from": "result"
        };

        //根据点击的目录判断跳转哪个页面
        if (clickLiType == 1) {
            // if (cell[0].type === 3) {
            //     layer.alert("未排入生产任务");
            //     return;
            // }
            sessionStorage.setItem("hrefPrameter", JSON.stringify(body_data));
            window.open("./view/secondPage.html");
            return;
        } else if (clickLiType == 2) {
            //  换装页面
            sessionStorage.setItem("hrefPrameter", JSON.stringify(body_data));
//            window.open("./view/secondChangePage.html");
            window.open("./view/changeAToB.html");
            return;
        } else if (clickLiType == 4) {
            //  任务清单
            sessionStorage.setItem("hrefPrameter", JSON.stringify(body_data));
//            window.open("./view/secondChangePage.html");
            window.open("./view/taskList.html");
            return;
        }
        http.post({
            url: $rootScope.restful_api.res_sourceUrl,
            data: body_data,
            successFn: function (response) {
                const jTableDialogWindow = $(".jPunitDetail");
                $(".equipment-list").remove();
                let resData = response.data;
                // var headList = resData.columnAlias;//表头列表

                //保存数据
                goWindowTableData = $.extend({}, resData);
                const windowTableData = scheduleTableViewModelService.jsonToWindowTableView(resData);			

                //绑定页面
                $scope.headDataView = windowTableData.headData;
                $scope.tableDataView = windowTableData.bodyData;

                //显示二级页面
                $scope.table_dialog_window_show = true;

                if (windowSearch && resData.row.length) {
                    layer.msg('已查询，请在下方表格中查看查询结果', {time: 3500, icon: 1});
                    windowSearch = false;
                } else if (windowSearch && (!resData.row.length)) {
                    layer.msg('未查询出结果', {time: 3500, icon: 2});
                    windowSearch = false;
                }

                $timeout(function () {
                    //更新表头宽度
                    tool.setTableHeadWidth(jTableDialogWindow,2);
                    //=========为了二级页面头部固定而写的sb代码2017-05-03-start======
                    let tableSpace = $(".jPunitDetail .table-space");
                    tableSpace.on("scroll", function () {
                        let coverHead = $(".jPunitDetail .cover-head");
                        let scrollLeft = tableSpace.scrollLeft();
						$(".jPunitDetail .fix-table-column table").css({
							"top" : -tableSpace.scrollTop()
						});
						coverHead.css("left", -scrollLeft);
                        coverHead.children().eq(0).css("left",scrollLeft);
                        coverHead.children().eq(1).css("left",scrollLeft + coverHead.children().eq(0).width());
                    });
                    //=========为了二级页面头部固定而写的sb代码2017-05-03-end=========
                    //更新查询条件
                    let windowSearchBox = $(".jPunitDetail").find(".window-search-box");
                    windowSearchBox.eq(0).find("input").val(thisStartTime);
                    windowSearchBox.eq(1).find("input").val(thisEndTime);
                    windowSearchBox.eq(2).find("input").val(thisEquipmentName.join(","));
                    windowSearchBox.eq(3).find("input").val(decodeURIComponent(saleOrder));
                    windowSearchBox.eq(4).find("input").val(decodeURIComponent(materialName));
                    windowSearchBox.eq(5).find("input").val(decodeURIComponent(materialCode));

                    //初始化复选框
                    $("input[name='single'],input[name='all']").prop("checked", false);
                    $(".headCheckbox").css("pointerEvents", "auto");

                    let singleInput = $("input[name='single']");
                    //全选全不选，预排转实际的全选也无法选中
                    $("input[name=all]").on("click", function () {
                        var checkValue = $(this).prop("checked");
                        if (checkValue == true) {
                            singleInput.each(function () {
                                if(!($(this).attr("disabled") === "disabled")){
                                    $(this).prop("checked", true);
                                }
                            });
                        } else {
                            singleInput.prop("checked", false);
                        }
                    });
                }, 0);


                /*复选框反选*/
                $("body").on("click", "input[name='single']", function () {
                    const chsub = $("input[name='single']").length;
                    const checkedsub = $("input[name='single']:checked").length;
                    if (chsub === checkedsub) {
                        $("input[name='all']").prop("checked", true);
                    } else {
                        $("input[name='all']").prop("checked", false);
                    }
                });

                //关闭二级页面
                $(".close-dialog-window").off("click");
                $(".close-dialog-window").on("click", function () {

                });
            },
            errorFn: function (response) {
                layer.alert('获取数据失败，请联系技术人员处理', {
                    skin: 'layer-alert-themecolor' //样式类名
                });
            }
        })
    };

    /**
     * 关闭二级页面
     **/
    $scope.close_dialog_window = function () {
        $scope.table_dialog_window_show = false;
        $(".window-cover").hide();
        //关闭微调数量弹窗
        $(".num-window").hide();
        //关闭排序弹窗
        $scope.orderShow = false;
        //清空临时配置项存储的临时变量,重新定义配置项
        $scope.temporary = null;
        //清除用户移动后未保存的项目
        $("#all-item").find("li").each(function () {
            if ($(this).hasClass("js-move")) {
                $(this).remove();
            }
        });

        $("input[name='StorageSingle'],input[name='StorageAll']").prop("checked", false);
		
		//清空暂存间选中信息
		cacheCheckInfo = {};

        //是否微调
        if (hasChange) {
            //重新加载一级页面
            ifSearchMsg = false;
            result_show_table(sessionStorage.locationId_res, sessionStorage.locationFilterList_res);
            hasChange = false;
        }
    };

    /**
     * 二级页面地点下拉框
     **/
    $scope.equipment_list = function ($event) {
        const j_equipment_list = $(".equipment-list"),
            j_equipment_input = $(".equipment-input");
        if (j_equipment_list.length > 0) {
            j_equipment_list.remove();
        } else {
            tool.dialogWindowEquipment(goInfo, $event, true);
            j_equipment_input.css("border", "1px solid #1E7CD9");
        }
    };

    /**
     * 二级页面点击查看
     **/
    $scope.look_sale_order = function (thisRow, $event) {
        $event.stopPropagation();
        let pkId = thisRow[0].pkId;
        let versionId = thisRow[0].versionId;
        let sUrl = "";
        if (versionId === undefined) {
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
        const indexLayer = layer.open({
            type: 1,
            title: "派工单详细信息",
            shadeClose: true,
            content: $("#do_detail_dialog_1"),
            success: function () {
                $($event.target).css("color", "#1E7CD9");

                // 272是显示框正常宽度，450是高度
                $(".layui-layer").css({
                    "left": $event.pageX,
                    "top": $event.pageY > (document.body.clientHeight - 450) ? document.body.clientHeight - 450 : $event.pageY
                });

                $("body").on("click", "#do_detail_dialog_1 .sure,.layui-layer-shade,.layui-layer-close", function () {
                    $(".show-table .sale-order-look").css("color", "");
                });

                $("#do_detail_dialog_1").on("click", ".sure", function () {
                    layer.close(indexLayer);
                })

            }
        });

        http.get({
            url: sUrl,
            successFn: function (res) {
                //json转viewModel对象
                //绑定view层
                $scope.do_detail = res.data;
                //关闭加载中图标
            },
        });
    };
	
	/**
     * 二级页面点击修改开始时间
     **/
	$scope.edit_start_time = function (thisRow, $event) {
		//因为显示列里面可能没有开始时间，所以必须以弹窗的方式进行修改
		$scope.orderOldInfo = thisRow[0];
		//构造修改弹窗
		let changeWindow = layer.open({
		  type: 1,
		  title: "修改开始时间",
		  closeBtn: 1,
		  shadeClose: true,
		  skin: '',
		  content: '' +
//			'<div class="edit_start_time_window">' +
//				'<div>' +
//					'<span>原开始时间：</span>' + 
//					'<span>' + thisRow[0].startTime  + '</span>' + 
//				'</div>' +
//				'<div>' +
//					'<span>修改为：</span>' + 
//					'<input type="time">' +
//				'</div>' +
//				'<span>确定</span>' +
//			'</div>'	
			'<table class="edit_start_time_window">' + 
				'<tr>' +
					'<td>原开始时间</td>' +
					'<td>：</td>' +
					'<td>' + thisRow[0].startTime +'</td>' +
				'</tr>' +
				'<tr>' +
					'<td>修改为</td>' +
					'<td>：</td>' +
					'<td><input id="windowStartTime" class="Wdate jOrderNewStartTime" type="text" onClick="WdatePicker({dateFmt:\'H:mm\'})" value="' + thisRow[0].startTime.substring(11,16) + '"></td>' +
//					'<td><input type="time" class="jOrderNewStartTime" value="' + thisRow[0].startTime.substring(11,16) +'"></td>' +
				'</tr>' +
				'<tr>' +
					'<td colspan="3"><span class="jOrderNewStartTimeSure">确定</span></td>' +
				'</tr>' +
			'</table>'				
		});
		
		$(".jOrderNewStartTimeSure").on("click",function(){
			let inputTime = $(".jOrderNewStartTime").val(),
				newTime;
			console.log($scope.orderOldInfo);
			if(inputTime){
				newTime = $scope.orderOldInfo.startTime.substring(0,11) + inputTime + ":00";
				let changeData = {
					isEnforce: false,
					pkId: $scope.orderOldInfo.pkId,
					schemeId: sessionStorage.schemeId,
					startTime: newTime,
					versionId: $scope.orderOldInfo.versionId
				}
				http.post({
					url: $rootScope.restful_api.order_change_start_time,
					data: changeData,
					successFn: function(res){
						let thisData = res.data;
						console.log(thisData);
						if(thisData.isSuccess){
							layer.msg("修改成功");
							//刷新二级界面
							$scope.change_window_table(true);
							layer.close(changeWindow);
							hasChange = true;
						}else{
							layer.confirm("新设置的开始时间会造成设备超产能，请确定是否强制保存",{
								btn: ["确定","取消"],
								shade: false
							},function(){
								changeData.isEnforce = true;
								http.post({
									url: $rootScope.restful_api.order_change_start_time,
									data: changeData,
									successFn: function(res){
										layer.msg("修改成功");
										//刷新二级界面
										$scope.change_window_table(true);
										layer.close(changeWindow);
										hasChange = true;
									}
								});
							},function(){
								layer.closeAll();
							});
						}
					}
				});
				console.log(newTime);
			}else{
				layer.msg("请输入时间!");
			}
		});
	}
	
//	$scope.order_new_start_time_sure = function(){
//		let newTime = $(".jOrderNewStartTime").val();
//		console.log(newTime);
//	}

    /**
     * 点击二级页面查询按钮，
     **/
    var windowSearch = false;
    $scope.change_window_table = function (showSuccess) {
        //获取查询条件
        let thisStartTime = tool.getFromInput_nocode(".jPunitDetail .jStartTime"),
            thisEndTime = thisStartTime,//单天，结束时间同开始时间
            thisEquipmentName = decodeURIComponent(tool.getFromInput_nocode(".jPunitDetail .jPunitName")),
            saleOrder = tool.getFromInput_nocode(".jPunitDetail .jSaleOrder"),
            materialName = tool.getFromInput_nocode(".jPunitDetail .jMaterialName"),
            materialCode = tool.getFromInput_nocode(".jPunitDetail .jMaterialCode"),
            aEquipmentId = [];
        // var mouseType = 2;//本地二级页面新增确定鼠标点击类型
        //输入检测
        if (!thisStartTime) {
            layer.alert('请选择开始时间', {
                skin: 'layer-alert-themecolor' //样式类名
            });
            return;
        } else if (!thisEndTime) {
            layer.alert('请选择结束时间', {
                skin: 'layer-alert-themecolor' //样式类名
            });
            return;
        } else if (!thisEquipmentName) {
            layer.alert('请输入设备', {
                skin: 'layer-alert-themecolor' //样式类名
            });
            return;
        }

        //根据设备名获取设备ID
        let aEquipmentName = thisEquipmentName.split(",");
        // let allEquipmentId = goInfo.punitId;
        let allEquipmentInfo = goInfo.punit;

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
        if (!showSuccess && (thisStartTime || thisEndTime || aEquipmentId.length || saleOrder || materialName || materialCode)) {
            windowSearch = true;
        } else {
            windowSearch = false;
        }

        $scope.click_creat_window(thisStartTime, thisEndTime, aEquipmentId.join(","), saleOrder, materialName, materialCode);
    };

    /**
     * 点击确定，向后台传选中数据
     **/
    $scope.sure = function () {
        let locationList = $(".selected");
        if (locationList.length === 0) {
            layer.alert('请选择要查看的地点', {
                skin: 'layer-alert-themecolor' //样式类名
            });
            return;
        }
        //存储所有选中的地点信息
        $scope.locationFilterList_res = [];
        locationList.each(function () {
            $scope.locationFilterList_res.push($(this).attr("data-location-id"));
        });
        sessionStorage.locationFilterList_res = $scope.locationFilterList_res;

        //获取显示车间ID和车间名
        sessionStorage.locationId_res = $scope.locationId_res = tool.getCommonLocationId($scope.locationFilterList_res);
        sessionStorage.currentShowLocationName = tool.getLocationName(sessionStorage.locationId_res,$rootScope.locationTreeData);

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
        $rootScope.getsessionStorage(sessionStorage.locationId_pre, $scope.locationId_res);
		
		//一级页面单元格类型
        http.get({
            url: $rootScope.restful_api.display_Info,
            successFn: function (res) {
                $rootScope.display_Info = res.data.displayConfigByLocationId;
            }/*,
            errorFn: function () {
                $rootScope.showType = {
                    group_by: "processId",
                    cnName: "个工序"
                };
                layer.alert('获取合并规则错误,请联系技术人员', {
                    skin: 'layer-alert-themecolor' //样式类名
                });
            }*/
        });
		
		result_show_table(sessionStorage.locationId_res, sessionStorage.locationFilterList_res);

        //判断是否变换方案,如果变化了，则发送请求，
        if (sessionStorage.schemeId !== $scope.schemeId) {
            $scope.schemeId = sessionStorage.schemeId;//重新赋值，用于下次变化
            //重新获取锁定期
            http.get({
                url: $rootScope.restful_api.get_freeze_days + "?schemeId=" + sessionStorage.schemeId,
                successFn: function (res) {
                    const resData = res.data.lockDate; //锁定期
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

            //方案变化才刷新暂存间
            $scope.cache_box_again = (function () {
                const jCacheWindow = $(".cache-window");
                http.get({
                    url: $rootScope.restful_api.cache_info + "?schemeId=" + sessionStorage.schemeId,
                    successFn: function (res) {
                        var cacheNum = res.data.row.length;
                        cacheNum > 0 ? $(".cache-num").show().text(cacheNum > 999 ? "999+" : cacheNum) : $(".cache-num").hide();
                        var windowTableData = scheduleTableViewModelService.jsonToWindowTableView(res.data);
                        $scope.cacheHeadDataView = windowTableData.headData;
                        $scope.cacheTableDataView = windowTableData.bodyData;
                        $timeout(function () {
                            tool.setTableHeadWidth($(".cache-window"),2);
                        }, 0);

                        //resize
                        $(window).on("resize", function () {
                            tool.setTableHeadWidth($(".cache-window"),2);
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
            })();
            layer.msg('方案已切换', {time: 3500, icon: 1});
        } else {
            //避免瞬间跳两个提示框，不好，不信你试试
            layer.msg('地点已修改', {time: 3500, icon: 1});
        }

        //更改为默认状态,并将地点树隐藏
        $(".location-choose,.point-click").removeClass("active");
        $(".out-bg").animate({width: "64px"}, 400);
        $(".location-choose").animate({left: "-" + $(".location-choose").width() + "px"}, 300);
    };

    /**
     * desc:获取手动微调页车间树所有的地点Id，存在一个数组里面
     * desc:,与设备详情页不同，因为两页面获得的地点树格式完全不一致,所以方法不一致
     * time:2017-03-29
     * author:linzx
     * @param: locationTreeData:获取到的地点树数据
     * @return 所有地点的数组,Array
     **/
    let getAllResultLocationId = (locationTreeData) => {
        if (!locationTreeData && !(tool.typeObject(locationTreeData) === "Array")) {
            console.info("初始传入手动微调页的地点树数据不对");
            return;
        }
        let alocationIdList = [];
        locationTreeData.forEach((item) => {
            alocationIdList.push(item.locationId);
        });
        return alocationIdList;
    };

    /**
     * desc:根据排程方案下每个一级地点，根据此一级地点形成各自的地点树
     * time:2017-04-05
     * author:linzx
     * @param: resultLocationIdObjList:排程方案下每个选择的一级地点
     * @param: locationTree：整棵地点树数据
     * @return: 每个排程方案一级地点下的地点树，数组，【树1-Obj，树2-Obj，树3-Obj】
     **/
    let getAllLocationTreeByLocationId = (resultLocationIdObjList, locationTree) => {
        if (!resultLocationIdObjList) {
            console.info("排程方案地点树数据不对");
            return;
        }
        if (!locationTree) {
            console.info("总地点树不对");
            return;
        }
        let locationTreeList = [];

        function getLocationTreeBySchemeLocationId(locationTree, locationIdByScheme) {
            for (let locationId in locationTree) {
                if (locationTree[locationId].locationId === locationIdByScheme) {
                    let obj = {};
                    obj[locationId] = locationTree[locationId];
                    locationTreeList.push(obj);
                } else {
                    if (!tool.isEmptyObject(locationTree[locationId].nextLevelLocation)) {
                        getLocationTreeBySchemeLocationId(locationTree[locationId].nextLevelLocation, locationIdByScheme)
                    }
                }
            }
        }

        resultLocationIdObjList.forEach(function (item) {
            //获得筛选出的一级地点，根据此地点选出地点树
            let locationId = item.locationId;
            getLocationTreeBySchemeLocationId(locationTree, locationId)
        });
        return locationTreeList;
    };

    /**
     * desc:获取车间树所有的地点Id，存在一个数组里面
     * time:2017-03-16
     * author:linzx
     * @param: 获取到的地点树数据
     * @param: 返回的空数组，需在函数外定义好
     * @return 所有地点的数组
     **/
    function getAllChildrenLocationId(obj, childrenIdList) {
        for (let id in obj) {
            childrenIdList.push(obj[id].locationId);
            if (obj[id]["nextLevelLocation"]) {
                getAllChildrenLocationId(obj[id]["nextLevelLocation"], childrenIdList);
            }
        }
    }
	
	//当时间跨度改变时(起始时间)
	$scope.$watch("controllerDate.minStartDate",function(newStartDate,oldStartDate){			
		//转成时间对象
		let newStart = tool.stringToDate(newStartDate),
			oldStart = tool.stringToDate(oldStartDate);
		if(oldStartDate){
			//开始时间大于结束时间，无操作
			if(newStart > tool.stringToDate($scope.controllerDate.maxEndDate)){
				return;
			}
//			//起始时间前移，查询新起始时间到原起始时间之间的数据
//			if(newStart < oldStart){
//				result_show_table($rootScope.locationId_res, sessionStorage.locationFilterList_res);
//			}else{
//				//起始时间后延，切割数据保留新起始时间-结束时间（起始时间不能大于结束时间）
//				let moveDay = (newStart - oldStart)/86400000;
//				
//				//切割数据
//				$rootScope.cacheTableBodyData.forEach(function(thisItem){
//					thisItem.splice(1,moveDay);
//				});
//				//切割时间头
//				$scope.tableHeadViewModel.splice(0,moveDay);
//			}
			result_show_table($rootScope.locationId_res, sessionStorage.locationFilterList_res);
			//刷新时间控件滚动条
			$scope.getDateChangeWidth();
		}
			
	})
	//当时间跨度改变时(结束时间)
	$scope.$watch("controllerDate.maxEndDate",function(newEndDate,oldEndDate){
		//转成时间对象
		let newEnd = tool.stringToDate(newEndDate),
			oldEnd = tool.stringToDate(oldEndDate);
		if(oldEndDate){
			//结束时间小于开始时间，无操作
			if(newEnd < tool.stringToDate($scope.controllerDate.minStartDate)){
				return;
			}
			
			//结束时间后延，查询原结束时间到新结束时间之间的数据
//			if(newEnd > oldEnd){
//				result_show_table($rootScope.locationId_res, sessionStorage.locationFilterList_res);
//			}else{
//				//结束时间前移，切割数据保留新起始时间-结束时间（起始时间不能大于结束时间）
//				let moveDay = (oldEnd - newEnd)/86400000;
//
//				//切割数据
//				$rootScope.cacheTableBodyData.forEach(function(thisItem){
//					thisItem.splice(-moveDay,moveDay);
//				});
//				//切割时间头
//				$scope.tableHeadViewModel.splice(-moveDay,moveDay);
//			}
			result_show_table($rootScope.locationId_res, sessionStorage.locationFilterList_res);
			//刷新时间控件滚动条
			$scope.getDateChangeWidth();
		}
	})
	
	//设备与班次联动
//	$("body").on("click",".equipment-list",function(){
//		let thisEquipmentName = decodeURIComponent(tool.getFromInput_nocode(".jPunitName input")),
//			aEquipmentId = [];
//
//		//根据设备名获取设备ID
//		let aEquipmentName = thisEquipmentName.split(","),
//			allEquipmentInfo = goInfo.punit;
//
//		for(var i in allEquipmentInfo){
//			var thisName = allEquipmentInfo[i].punitName;
//			for(var j in aEquipmentName){
//				if(aEquipmentName[j] == thisName){
//					aEquipmentId.push(i);
//				}
//			}
//		}
//		console.log(aEquipmentId);
//		http.get({
//			url: $rootScope.restful_api.get_shift,
//			successFn: function(res){
//				let shiftData = res.data,
//					repeatData = [];
//
//				//循环构造下拉框数据
//				for(let i = 0, l = shiftData.length ; i < l ; i++){
//					let thisData = shiftData[i];
//					repeatData.push({
//						showName: thisData.shiftName,
//						id: thisData.shiftId
//					})
//				}
//				//传入组件
//				$scope.shiftData.repeatData = repeatData;
//			}
//		})
//	});
});