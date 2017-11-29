/**
 * Created by xujun on 2016/7/1.
 */
'use strict';
app.controller('previewCtrl', function ($scope, $rootScope, $http, $window, $location, $timeout, scheduleTableViewModelService, tool, http,$q) {
    $(".table-dialog-window").hide();   // 二级页面（此处二级页面暂时预留，等待AB测试结果，可删）
    //开始排程/再编辑
    let startApsType = "";
    //冻结期
    let fact_days = "";
    //初始化查询日期   注意！这个变量不要改! 时间操作另行赋值
    let today;
    //日历周期，目前设置为7天
    let offset = 6;
    //查询条件
    //通过json查询的对象声明
    let minStartTime, maxEndTime, queryObject, tableHeadViewModel, tableBodyViewModel;
	
	$scope.placeholderaaa = [];
    //设备
    let goEquipment = {};
    let goInfo = {};
    //用户名
    $scope.userName = $rootScope.userName;
    //获得来源页面(手动微调页面需要)
    $rootScope.lastSourcePage = $location.$$url;
	
	$scope.small_margin_left = 0; 
	//传入一级界面时间控制器的初始数据
	$scope.getDateChangeWidth = function(){
		let time = new Date(new Date(today).setDate(15)),
			smallWidth = 62,
			bigWidth = 160,
			minStartDate = tool.dateToString(new Date(today)),
			maxEndDate = tool.dateToString(new Date(time.setMonth(time.getMonth() + 2)).setDate(0)),
			defaultDay = (tool.stringToDate(maxEndDate) - tool.stringToDate(minStartDate))/86400000 + 1,  //86400000是一天的毫秒数
			smallTableMarginLeft = 0,
			bigTableMarginLeft = 0;
		
		//如果不是第一次
		if($scope.controllerDate){
			defaultDay = (tool.stringToDate($scope.searchEnd) - tool.stringToDate($scope.searchStart))/86400000 + 1;
			minStartDate = $scope.controllerDate.minStartDate;
			maxEndDate = $scope.controllerDate.maxEndDate;
			smallTableMarginLeft = $scope.controllerDate.smallTableMarginLeft;
			bigTableMarginLeft = $scope.controllerDate.bigTableMarginLeft;
		}
	
		let	tableWidth = $(".wrap-content").width(),
			smallTableWidth = tableWidth - 82,
			bigTableWidth = tableWidth - 160,
			scrollbarWidth = $(".scrollbar").width(),
			smallScrollbarWidth = smallTableWidth,
			bigScrollbarWidth = bigTableWidth,
			smallTotleWidth = smallWidth*defaultDay,
			smallScrollWidth = smallTotleWidth - smallTableWidth,
			bigTotleWidth = bigWidth*defaultDay,
			bigScrollWidth = bigTotleWidth - bigTableWidth,
			smallScrollbarThumbWidth = scrollbarWidth * smallTableWidth/smallTotleWidth,
			bigScrollbarThumbWidth = scrollbarWidth * bigTableWidth/bigTotleWidth;
		
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
		};
		
		$timeout(function(){
			$scope.refresh_margin_left();
		})
	};

    /**
    * desc:进入页面进行加载表格主题的方法
    * time:2017-03-28
    * @param:
    * @return:
    **/
    let initLoadingTableView = () =>{
        let defaultEle = $(".location-list").children("ul").children("li:eq(0)").children("i");
        let defaultId = defaultEle.attr("data-location-id");
        let defaultList = $scope.locationFilterList_pre;

        sessionStorage.userId = $rootScope.userId;  //存储当前用户Id
        $rootScope.getsessionStorage($scope.locationId_pre, $scope.locationId_res, true);

        //一级页面单元格类型
        http.get({
            url: $rootScope.restful_api.display_Info,
            successFn: function (res) {
                $rootScope.display_Info = res.data.displayConfigByLocationId;
				preview_show_table(defaultId, defaultList);  //查询显示
            }
        });

        //获取锁定期
        http.get({
            url: $rootScope.restful_api.get_lock_days,
            successFn: function (res) {
                fact_days = res.data.lockDate; //锁定期(可预排最大日期)
            },
            errorFn: function () {
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
            $rootScope.locationTreeData = res.data;
            $scope.folder = {"children": [scheduleTableViewModelService.getData($rootScope.locationTreeData)[0]]};//处理数据,并绑定到页面

			//如果用户进来没有一个车间可供操作，直接给出提醒，跳出
			if(tool.isEmptyObject($rootScope.locationTreeData)){
				layer.alert("当前账户未配置地点权限，请联系管理员");
				return;
			}

            //获取上次登录的地点
            http.get({
                url: $rootScope.restful_api.view_last_location,
                successFn: function (res) {
                    let AllLocationIdArray = scheduleTableViewModelService.getAllLocationIdArray($rootScope.locationTreeData);
                    let lastLoginLocationTree = res.data.valueContent;
                    //首次进入没有地点 || 上次登录地点与本次权限地点不匹配，强行选择
					
					//获取偏移时间，返回偏移操作后的时间
					$scope.getRealToday = (function(){
						//先获取偏移时间
						let getDeviationUrl = $rootScope.restful_api.get_deviation;

						http.get({
							url: getDeviationUrl,
							successFn: function(res){
								today = new Date(+new Date() - res.data.daySec * 1000);

								//确定时间控件滑块的宽度(大格子和小格子)
								$scope.getDateChangeWidth();

								//发起一次请求
//								 preview_show_table(defaultId, defaultList);  //查询显示
							}
						});
					})();

                    if (!lastLoginLocationTree || !verifyContainLastLoginLocationId(AllLocationIdArray,lastLoginLocationTree.split(","))) {
                        $(".location-choose,.out-bg,.point-click").addClass("active");
                    }else{
                        //获取决定当前车间显示地点ID
                        sessionStorage.locationId_pre = $scope.locationId_pre = tool.getCommonLocationId(lastLoginLocationTree);
                        //筛选出显示车间的名字，用于配置页面显示
                        sessionStorage.currentShowLocationName = tool.getLocationName($scope.locationId_pre,$rootScope.locationTreeData);

                        let lastLoginLocationTreeArr = lastLoginLocationTree.split(",");//地点id的数组
                        //为地点树添加选中样式
                        lastLoginLocationTreeArr.forEach(function (item) {
                            let selectI = $("i[data-location-id=" + item + "]");
                            selectI.attr("class","select-status selected active");
                            changeParentSelected(selectI);
                        });
                        //如果显示车间id和查询车间最大父车间id一致，则查询车间列表为空，减小发送请求的数据量
                        if(lastLoginLocationTreeArr[0] === $scope.locationId_pre){
                            sessionStorage.locationFilterList_pre = $scope.locationFilterList_pre = ""
                        }else{
                            sessionStorage.locationFilterList_pre = $scope.locationFilterList_pre = lastLoginLocationTree;
                        }
                        //获取决定当前车间显示地点的名字,并存储到session避免手动微调页刷新页面丢失
                        // sessionStorage.currentShowLocationName = $scope.currentShowLocationName = tool.getLocationName(sessionStorage.locationId_pre,$rootScope.locationTreeData);
                        //是否可以显示页面相关菜单，在preview页面上使用到
                        $scope.initLoadingShow = true;
                        $timeout(function () {
                            initLoadingTableView();
                        }, 200)
                    }
                },
            });
        },
        errorFn: function () {
            layer.alert('获取数据失败，请联系技术人员处理', {
                skin: 'layer-alert-themecolor' //样式类名
            });
        }
    });

    //显示父元素的选中状态
    let changeParentSelected = (elem) => {
        let parentLi = elem.parent();
        let parentUl = parentLi.parent();
        const childrenLiLength = parentUl.find("i").length;//所有input的数量
        const selectedLength = parentUl.find(".active").length;//选中input的数量
        if(childrenLiLength === selectedLength){
            parentUl.siblings("i").attr("class","select-status active");
        }else{
            parentUl.siblings("i").attr("class","select-status select-some")
        }
        //如果不是第一级，则继续循环
        if(parentUl.parent().length && !parentUl.parent().hasClass("location-list")){
            changeParentSelected(parentUl.siblings("i"));
        }
    };

    //下拉框初始值设置，选中值初始全部为空
	$scope.selectMaterialCode = [];
	$scope.selectMaterialName = [];
	$scope.selectProcessCode = [];
	$scope.selectProcessName = [];
	$scope.selectPunitCode = [];
	$scope.selectPunitName = [];
	$scope.selectSaleOrder = [];
	$scope.selectOrderCode = [];

    /**
     * 显示正式派工单表的排程计划
     **/
    function preview_show_table(location, locationFilterList) {
        //API接口
            $scope.get_differall_num();
		
			//新逻辑：若查询时间未满一月，取一月的数据
			$scope.searchStart = tool.dateToString(new Date($scope.controllerDate.minStartDate));
			$scope.searchEnd = tool.dateToString(new Date($scope.controllerDate.maxEndDate));
			let searchDays = (tool.stringToDate($scope.controllerDate.maxEndDate) - tool.stringToDate($scope.controllerDate.minStartDate)) / 86400000 + 1;
			//少于28天，补足
			if(searchDays < 28){
				$scope.searchEnd = tool.dateToString(new Date(+tool.stringToDate($scope.searchStart) + 30 * 86400000));
			}
		
            //拼url
            let get_url = $rootScope.restful_api.preview_show_table + "?locationFilterList=" + locationFilterList
                + "&startTime=" + $scope.searchStart
                + "&endTime=" + $scope.searchEnd;
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
                    tableHeadViewModel = scheduleTableViewModelService.jsonToTableHeadViewModel(response.data, searchDays);
                    tableBodyViewModel = scheduleTableViewModelService.jsonToTableBodyViewModelNew(response.data);
					
				
					//下拉框数据
					let searchItemDropDownList = tableBodyViewModel.searchItemDropDownList;
                    //实时更新搜索下拉目录的数据
                    $scope.materialCodeList = Object.keys(searchItemDropDownList.materialCodeList).map(item => {
                    	return {text : item, value : item,isActive : $scope.selectMaterialCode.includes(item)};
					});

				$scope.materialNameList = Object.keys(searchItemDropDownList.materialNameList).map(item => {
					return {text : item, value : item,isActive : $scope.selectMaterialName.includes(item)};
				});

				$scope.processCodeList = Object.keys(searchItemDropDownList.processCodeList).map(item => {
					return {text : item, value : item,isActive : $scope.selectProcessCode.includes(item)};
				});

				$scope.processNameList = Object.keys(searchItemDropDownList.processNameList).map(item => {
					return {text : item, value : item,isActive : $scope.selectProcessName.includes(item)};
				});

				$scope.punitCodeList = searchItemDropDownList.punitCodeList.map(item => {
					return {text : item, value : item,isActive : $scope.selectPunitCode.includes(item)};
				});

				$scope.punitNameList = searchItemDropDownList.punitNameList.map(item => {
					return {text : item, value : item,isActive : $scope.selectPunitName.includes(item)};
				});

				$scope.saleOrderList = Object.keys(searchItemDropDownList.saleOrderList).map(item => {
					return {text : item, value : item,isActive : $scope.selectSaleOrder.includes(item)};
				});

				$scope.orderCodeList = Object.keys(searchItemDropDownList.orderCodeList).map(item => {
					return {text : item, value : item,isActive : $scope.selectOrderCode.includes(item)};
				});

				//有查询操作并且有查询成功的数据
				if (tableBodyViewModel.searchSuccess === "success_search") {
					layer.msg('根据您的查询条件，已高亮出查询结果，请查看', {time: 3500, icon: 1});
				} else if (tableBodyViewModel.searchSuccess === "false_search") {
					layer.msg('根据您的查询条件，未查询出结果', {time: 3500, icon: 2});
				} else if (tableBodyViewModel.searchSuccess === "allUnitNull") {
					layer.msg('当前无工单，无法查询', {time: 3500, icon: 2});
				}

				//查询时间
				queryObject = scheduleTableViewModelService.jsonToQueryObject(response.data);
				minStartTime = queryObject.minStartTime;
				maxEndTime = queryObject.maxEndTime;
				//绑定view层
				$scope.tableHeadViewModel = tableHeadViewModel;
				// 前端实现分页滚动，先获取所有数据缓存在本地，然后进行切分
				$rootScope.cacheTableBodyData = tableBodyViewModel.tableBodyData;
				//根据是否显示空白项来决定table表显示的数据的多少
				if($scope.$parent.hide_empty){
					$rootScope.tableBodyData = $rootScope.cacheTableBodyData.filter(function (item) {
						return !item[0].useData.isEmpty;
					}).slice(0,$rootScope.pageIndex * $rootScope.pageNumber);
				}else{
					$rootScope.tableBodyData = $rootScope.cacheTableBodyData.slice(0,$rootScope.pageIndex * $rootScope.pageNumber);
				}

				$(".table-content").on("scroll", function () {
					$(this).parents(".j-table").find(".table-equipment-head>div").css("margin-top", -1 * $(this)[0].scrollTop + 1);
				});

				//针对移动端所需要的操作
				//1.移动端设备表头禁止选择
				if(isMobile){
					$timeout(() => {
						$(".table-equipment-head .table-td").attr("onselectstart","return false");
					})
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


    /**
     * 物料信息
     * 
     **/	
	$scope.material_info = function(){
		sessionStorage.materialStart = $scope.controllerDate.minStartDate;
		sessionStorage.materialEnd = $scope.controllerDate.maxEndDate;
		window.open("./view/materialInfo.html");
	};

    /**
     * 预排转实际
     * 打开预排转实际的弹窗
     **/

        //允许预排的天数
    var daysNum;
    $scope.open_tofact = function () {
        //获取设备信息
        let equipment = goInfo.punit;

        //初始化预排天数
        daysNum = 0;

        //将今天的日期取出
		let todayDate = new Date;
        todayDate.setHours(0);
        todayDate.setMinutes(0);
        todayDate.setSeconds(0, 0);

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
            let arrInput = $(".to-fact-box input");
			arrInput.each(function (i) {
                $(this).on("keyup", function () {
                    if (this.value.length === 1) {
                        this.value = this.value.replace(/[^0-9]/g, '')
                    } else {
                        this.value = this.value.replace(/\D/g, '')
                    }
                    if (this.value > daysNum) {
                        this.value = daysNum;
                    }
                })
            });

            //改变勾选的那行的输入框
            arrInput.eq(0).on("keyup", function () {
				let to_fact_days = arrInput.eq(0).val();
                $(".to-fact-box .each-pName-div").each(function (i) {
					let checkVal = $(this).find("input[name = 'factPnameSingle']").is(':checked');
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
		let daysList = [];
		let nullNum = 0;

        //得到所有输入框的值
        $(".to-fact-box .each-pName-div .each_days_input").each(function (i) {
			let each_pName_days = $(this).val() - 0;
            daysList.push(each_pName_days);
            if (!each_pName_days) {
                nullNum++;
            }
        });

        //若输入框的值都为空或者0,则不执行
        if (nullNum === daysList.length) {
            layer.alert('无法预排，请检查是否可排或检查是否输入了预排天数', {
                move: false,
                skin: 'layer-alert-themecolor' //样式类名
            });
        } else {
            layer.confirm('是否确认预排转实际？', {
                move: false,
                btn: ['确定', '取消'] //按钮
            }, function () {
				let equipment = goInfo.punit,
                    aList = [];

                //用于数组取值
				let temp = 0;
                let punitIdList = goInfo.punitId;
				for(let i = 0, l = $scope.punitNameList.length; i < l; i++) {

                    //今天日期
					let nowDate = new Date(),
						punit = $scope.punitNameList[i];
                    nowDate.setHours(0);
                    nowDate.setMinutes(0);
                    nowDate.setSeconds(0, 0);

                    //对应的输入框有值
                    if (daysList[i]) {

                        //设备ID
						let equipmentIdType = punitIdList[i].split("_");

						let maxToFactDate,
                            dataList = [];

                        //当前设备可预排的最大日期
                        maxToFactDate = nowDate.setDate(nowDate.getDate() + daysList[i] - 1);
                        maxToFactDate = new Date(maxToFactDate);

                        //当天日期
						let minDate = new Date();
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
							if($(".to-fact-box .each-pName-div").eq(i).find(".single_label input").prop("checked")){
								aList.push({
									punitType: equipmentIdType[1],
									punitId: equipmentIdType[0],
									days: dataList
								});
							}
                        }
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
        });
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
     * 任务池切换维度
     **/
	$scope.exter_differ_dimension_text = "切换到订单维度"
	$scope.exter_differ_dimension = function(){
		$scope.exter_differ_dimension_text = $scope.exter_differ_dimension_text === "切换到订单维度" ? "切换到计划维度" : "切换到订单维度";
		$scope.get_differall_num($scope.exter_differ);
	};
	
    /**
     * 获取外部差异条数
     **/
    $scope.get_differall_num = function (fn) {
        /*拼接url开始*/
        const thisUrl = $scope.exter_differ_dimension_text === "切换到订单维度" ? "exter_differ" : "exter_differ_order",
			  url = $rootScope.restful_api[thisUrl] + "?locationFilterList=" + $scope.locationFilterList_pre;
		
        http.get({
            url:  url,
            successFn: function (res) {
                const resData = res.data,
					  externalDifferViewModel = scheduleTableViewModelService.jsonToexternalDifferViewModel(resData);
				
				$scope.allTableData = externalDifferViewModel.allTableData;	//表格数据
				$scope.tabData = externalDifferViewModel.tabData;	//页签数据
				$scope.differAllNum = externalDifferViewModel.allNum;	//总条数
				$(".right-menu .external-diff-num").show();

				//数据更新后执行传入的方法
				if(fn){fn()};
            },
            errorFn: function (res) {
                layer.alert('"任务池"获取数据失败，请联系技术人员处理', {
                    skin: 'layer-alert-themecolor' //样式类名
                });
            }
        });
    };

    /**
     * 获取列下标(暂留，高亮的逻辑)
     **/
    $scope.find_column_index = function (tabType) {
        var columnIndex = {
            rudt_index : -1,//未排数
            rtn_index : -1,//已排数
            ptt_index : -1,//车间计划时间
            nptt_index : -1,//新车间计划时间
        };
        for (var i = 0; i < tableList.length; i++) {
            if (tableList[i] === "resultUnDoTaskNum") {
                columnIndex.rudt_index = i;
            }else if (tableList[i] === "resultTaskNum") {
                columnIndex.rtn_index = i;
            }else if (tableList[i] === "poolTaskTime") {
                columnIndex.ptt_index = i;
            }else if (tableList[i] === "newPoolTaskTime") {
                columnIndex.nptt_index = i;
            }
        }

        if (tabType === "tim") {
            if (columnIndex.ptt_index !== -1) {
                $(".table-space table tbody").find("tr").each(function () {
                    $(this).find("td").eq(columnIndex.ptt_index).css("color", "#1E7CD9");//车间计划时间列高亮
                })
            }
            if (columnIndex.nptt_index !== -1) {
                $(".table-space table tbody").find("tr").each(function () {
                    $(this).find("td").eq(columnIndex.nptt_index).css("color", "#1E7CD9");//新车间计划时间列高亮
                })
            }
        } else if (tabType === "des" && columnIndex.rtn_index !== -1) {
            $(".table-space table tbody").find("tr").each(function () {
                $(this).find("td").eq(columnIndex.rtn_index).css("color", "#1E7CD9");//已排数列高亮
            })
        } else if (columnIndex.rudt_index !== -1) {
            $(".table-space table tbody").find("tr").each(function () {
                $(this).find("td").eq(columnIndex.rudt_index).css("color", "#1E7CD9");//未排数列高亮
            })
        }
    };

    /**
     * 外部差异
     **/
    $scope.exter_differ = function (tabIndex = 0) {
        let jDifferWindow = $(".exDiffer-window"),
			firstTab;

        if ($scope.differAllNum) {
            //tab标签
            $scope.tabList = $scope.tabData;
			
			//数据
			const thisTabData = $scope.allTableData[tabIndex];
			
			//绑定页面
            $scope.exterHeadData = thisTabData.headData;
			$scope.exterBodyData = thisTabData.bodyData;
        } else {
            $scope.changedBodyData = [];
            $scope.tabList = [];
        }
		
		$scope.selectTabIndex = tabIndex;
    };
	
	//小提示
	$("body").on("mouseover", ".help-span", function () {
		$(this).find(".help-box").show();
	}).on("mouseleave", ".help-span", function () {
		$(this).find(".help-box").hide();
	});

    $scope.exter_differ_show = function () {
        const jDifferWindow = $(".exDiffer-window");
        jDifferWindow.show().animate({
            opacity: 1
        }).css("display", "flex"); //打开弹窗
        $scope.exter_differ();
    };
	
	$scope.exter_differ_hide = function(){
		const jDifferWindow = $(".exDiffer-window");
        jDifferWindow.animate({
            opacity: 0
        },function(){
			jDifferWindow.hide();
		}); //打开弹窗
	}
	
	//resize
	$(window).on("resize", function () {
		$scope.getDateChangeWidth();
		$scope.$apply();
	});
	
	//切换全屏时
	$scope.$on("fullScreen",function(allInfo,newState){
		$timeout(function(){
			$scope.getDateChangeWidth();
		});
		//切换到全屏，有一个自动的$apply()，取消全屏没有
		if(!newState){
			$scope.$apply();			
		}
	});

    /**
     * 点击查询，刷新页面。
     **/
    $scope.search = function () {
        preview_show_table($scope.locationId_pre, $scope.locationFilterList_pre);

        $(".search-box").hide();
        $(".search-btn").removeClass("search-btn-click");
    };

    /**
     * 表格单元格点击
     **/
    $scope.unit_click = function (cell, clickLiType) {
        //如果没有cell【0】.type值，说明是头部，调用头部方法
        if (!cell[0]) {
            $scope.date_click(cell,clickLiType);
            return;
        }
        if (cell[0].type === 3) {
            layer.alert("未排入生产任务");
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
     * 表头单元格点击
     * @param date:数据;
     * @param clickLiType:小目录点击的位置
     **/
    $scope.date_click = function (date,clickLiType) {
        let thisData = date,
            thisStartDate = thisData.thisDate,
            thisEndDate = thisData.thisDate,
            thisEquipment = thisData.equipment,
            saleOrder = tool.getFromInput_nocode(".sale-order"),
            materialName = tool.getFromInput_nocode(".material-name"),
            materialCode = tool.getFromInput_nocode(".material-code");
        $scope.click_creat_window(thisStartDate, thisEndDate, thisEquipment, saleOrder, materialName, materialCode,clickLiType);
    };

    $scope.click_creat_window = function (startTime, endTime, equipment, saleOrder, materialName, materialCode,clickLiType) {
        let thisStartTime = startTime,
            thisEndTime = endTime,
            thisEquipment = equipment + "",
            // sUrl = "",
            thisEquipmentName = [],
            aEquipment = "";

        //拼接Url
        if (thisEquipment.indexOf(",") > -1) {
            aEquipment = thisEquipment.split(",");
        } else {
            aEquipment = [thisEquipment];
        }

            //查询二级页面数据

		let isArr = [];

        for (let i in aEquipment) {
			let equipmentObj = {};
			let newI = aEquipment[i].split("_");
            equipmentObj.equipmentId = newI[0];
            equipmentObj.equipmentType = newI[1];
            isArr.push(equipmentObj);

            thisEquipmentName.push(goEquipment[aEquipment[i]].punitName);
        }

		let body_data = {
            "startTime": thisStartTime,
            "endTime": thisEndTime,
//            "materialName": materialName,
//            "materialCode": materialCode,
//            "saleOrderCode": saleOrder,
            "equipments": isArr,
            "from": "preview",
        };
        //根据点击的目录判断跳转哪个页面
        sessionStorage.setItem("hrefPrameter", JSON.stringify(body_data));
        if (clickLiType === 1) {
            window.open("./view/secondPage.html");
        } else if (clickLiType === 2) {
            //  换装页面
            window.open("./view/changeAToB.html");
        } else if (clickLiType === 4) {
            //  任务清单
            window.open("./view/taskList.html");
        }
		//输入框有焦点状态下
		$(".window-search-box input").on("focus", function () {
			$(this).css("border", "1px solid #1E7CD9");
			if ($(this).hasClass("Wdate")) {
				$(this).removeClass("Wdate").addClass("WdateActive");
			}
		})
		//输入框失去焦点
			.on("blur", function () {
				$(this).css("border", "1px solid #BBBBBB");
				if ($(this).hasClass("WdateActive")) {
					$(this).removeClass("WdateActive").addClass("Wdate");
				}
			});
    };

    /**
     * 点击确定，向后台传选中数据
     **/
    $scope.sure = function () {
        let selected = $(".jleftLocationTree .selected");
        let locationList = [];

        selected.each(function () {
            locationList.push($(this).attr("data-location-id"));
        });
        locationList.sort((a,b)=>{return a.length-b.length;});

        if (selected.length === 0) {
            layer.alert('请选择要查看的车间');
            return;
        }

        //获取公共父元素车间ID,用于处理显示方案
        sessionStorage.locationId_pre = $rootScope.locationId_pre = tool.getCommonLocationId(locationList);
        //筛选出被选中的车间，如果子元素全选中，则选择父元素,
        //如果显示地点ID恰好等于最短地点ID时，则减少传送数据设置FilterList为空
        if(locationList[0] === $rootScope.locationId_pre){
            $scope.locationFilterList_pre = ""
        }else{
            $scope.locationFilterList_pre = locationList.join();
        }
        $rootScope.getsessionStorage($rootScope.locationId_pre, sessionStorage.locationId_res, true);

        //筛选出显示车间的名字，用于配置页面显示
        sessionStorage.currentShowLocationName = tool.getLocationName($rootScope.locationId_pre,$rootScope.locationTreeData);

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
        layer.msg('地点已修改', {time: 3500, icon: 1});
		
		//查询显示
		 preview_show_table($scope.locationId_pre, $scope.locationFilterList_pre);  

        //获取锁定期
        http.get({
            url: $rootScope.restful_api.get_lock_days,
            successFn: function (res) {
                fact_days = res.data.lockDate; //锁定期(可预排最大日期)
            },
            errorFn: function () {
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
                        "valueContent": locationList.join()
                    }
                ]
            },
            successFn: function () {
            }
        });

        //更改为默认第一级展开状态,并将地点树隐藏
        $(".location-list span").removeClass("open").removeClass("active");
		let folderUl = $(".location-list").find("ul");
        for (let i = 1; i < folderUl.length; i++) {
            $(folderUl[i]).hide();
        }
        $(".point-click").removeClass("active");
        $(".out-bg").animate({width: "64px"}, 300);
            $(".location-choose").animate({left:"-" + $(".location-choose").width() + "px"},300);
        //用户初始进来没有设置地点，不给展示信息，只有选了地点点击确定之后，各大菜单栏为显示
        $scope.initLoadingShow = true;
        //设置前面线的高度
        let thisB = $(folderUl[0]).children("b");
        thisB.height($(folderUl[0]).height() - 30);

        $scope.get_differall_num();
    };

    /**
     * 排程方案选择下拉框
     **/
    $(".aps-case").on("click", ".case-header", function () {
		let j_head = $(this);
        j_head.children("ul").toggleClass("select-li");
        j_head.toggleClass("chosen");
    });

	/**
	 * 判断是否有已排程的方案,如果已经有方案排程了，则在方案下拉目录里出现红星
	 **/
	$scope.isHadScheduleScheme = function () {
		//获得哪些方案已经排程
		function getHadScheduleScheme() {
			return $http.get($rootScope.restful_api.aps_location_writable).then((function (res) {
				return res.data;
			}),function () {
				layer.alert('获取方案内容失败,请联系技术人员');
			});
		}
		$q.all([getHadScheduleScheme()]).then(function (res) {
			const selectScheme = res[0];
			//根据获取的已选择方案，添加所有方案列表一个是否选择的参数
			$scope.allSchedulePlan.forEach((item) => {
			    //判断该方案是否被选中
				item.isSelected = selectScheme.some((selectItem) => {
				    return item.schemeId === selectItem.schemeId
                });
            });
            //初始设置第一个方案为展示方案
			$scope.selectLiScheme($scope.allSchedulePlan[0]);
		});
	};

    /**
     * 点击开始排程按钮
     **/
    $scope.startApsSchedule = function () {
        $(".wrap-box").next("p").remove();    //移除提示
        //判断是否有已配置的方案
        http.get({
            url: $rootScope.restful_api.all_schedule_plan,
            successFn: function (res) {
				$scope.allSchedulePlan = res.data;
                //若没有方案,弹窗提示
                if ($scope.allSchedulePlan.length === 0) {
                    layer.alert("您没有配置方案,无法排程!");
                } else {   //已配置方案,继续操作
                    startApsType = "apsStart";
                    $scope.isHadScheduleScheme();
                    const index = layer.open({
                        type: 1,
                        title: false,
                        closeBtn: 0,
                        shadeClose: false,
                        area: ['400px', 'auto'],
                        content: $(".aps-case"),
                        success: function () {
                            $(".aps-case").on("click", ".in-but", function () {
                                layer.close(index);
                                $(".case-content").removeClass("select-li");
                                $(".case-header").removeClass("chosen");
                                $(".wrap-box").next("p").remove();
                            })
                        }
                    })
                }
            },
            errorFn: function () {
                layer.alert("请求方案数据错误,请联系技术人员处理!");
            }
        });
        //获取排程原因的下拉列表
        http.get({
            url : $rootScope.restful_api.schedule_reason_list,
            successFn : function (res) {
                //将数组转化成组件所需要的数据
				$scope.scheduleReasonList = res.data;
			},errorFn : function (res) {
				layer.msg("获取排程原因数据失败，请联系技术人员",{icon : 2});
			}
        });
    };

	//点击下拉目录的li选择方案
	$scope.selectLiScheme = function (scheme) {
		sessionStorage.schemeId = $scope.schemeId = scheme.schemeId;
		http.get({
			url: $rootScope.restful_api.single_schedule_plan + scheme.schemeId,
			successFn: function (res) {
				$scope.locationRuleList = res.data.locationRuleList;
				let data_body = {     //取消排程 往后台发送数据
					'schemeId': '',
					'locationDtoList': []
				};
				for (let i = 0,length = $scope.locationRuleList.length; i < length; i ++) {
					let objLocation = {};
					objLocation.locationId = $scope.locationRuleList[i].locationId;
					objLocation.locationFilterList = [];
					data_body.locationDtoList.push(objLocation);
					data_body.schemeId = scheme.schemeId;
				}
				sessionStorage.setItem("cancel_data", JSON.stringify(data_body));

				//如果开始排程时，返回数据有给出提示启用上线配置的话，则直接赋值
				if(res.data.loadLaunchConfigMessage){
				    $scope.isOnLineConfig = true;
				    $scope.onlineWords = res.data.loadLaunchConfigMessage;
                }else{
					$scope.isOnLineConfig = false;
                }

				//成功赋值
				$(".case-content").removeClass("select-li");//下拉框消失
				//点击已经选中的方案，提示出现，出现直接跳往排程后的那个按钮
				$scope.chooseScheme = scheme;
				$scope.isHadScheduleShow = scheme.isSelected;

			},
			errorFn: function () {
				layer.alert('获取方案内容失败,请联系技术人员', {
					skin: 'layer-alert-themecolor' //样式类名
				});
			}
		});

	};

    /**
     * 点击再编辑
     **/
    $scope.edit_again = function () {
		//获取排程原因的下拉列表
		http.get({
			url : $rootScope.restful_api.schedule_reason_list,
			successFn : function (res) {
				// const scheduleReasonList = res.data;
				//将数组转化成组件所需要的数据
				$scope.scheduleReasonList = res.data.map((item) => {
					item.text = item.reason;
					item.value = item.id;
					item.isActive = false;
					return item;
				});
			},errorFn : function (res) {
				layer.msg("获取排程原因数据失败，请联系技术人员",{icon : 2});
			}
		});
        //判断是否有已配置的方案
        http.get({
            url: $rootScope.restful_api.all_schedule_plan,
            successFn: function (res) {
                $scope.allSchedulePlan = res.data;
                //若没有方案,弹窗提示
                if ($scope.allSchedulePlan.length === 0) {
                    layer.alert("您没有配置方案,无法再编辑!");
                } else {    //已配置方案,继续操作
					//如果已经有了配置方案，则直接跳转页面，不需要填写排程原因
                    startApsType = "editAgain";

                    $scope.isHadScheduleScheme();

                    let index = layer.open({
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

	//点击继续按钮,跳转进行再编辑
	$scope.aps_continue = function () {
		//对于未保存的方法进行再编辑，直接跳过，不需要写排程原因
		//隐藏排程原因选择框
		$location.path("/result").replace();
		layer.closeAll();
	};

	/**
	 * 点击确定按钮开始排程
	 **/
	$scope.sureGoStartSchedule = function () {
		let thisUrl = "",
			thisPath = "",
			thisText = "";
		if (startApsType === "apsStart") {
			thisUrl = $rootScope.restful_api.aps_trigger;
			thisPath = "/progress";
			thisText = "开始排程";
		} else if (startApsType === "editAgain") {
			thisUrl = $rootScope.restful_api.edit_again;
			thisPath = "/result";
			thisText = "再编辑";
		}
		//用户必选选择排程原因
		if(!$scope.selectScheduleReasonList.length){
		    layer.msg("请选择一个排程原因");
		    return;
        }
		//用户必须填写详情描述
		if(!$("#reScheduleDescription").val()){
		    layer.msg("请填写详情描述");
		    return;
        }
		//如果处于再编辑一个新的排程，则加一个loading状态提示，同时避免用户乱点
		if(startApsType === "editAgain"){
			//因为重编辑等待时间太久，避免用户乱点击操作，加个全局loading挡住,进入到排程后页面消失
			layer.msg('正在重新编辑中', {
				icon: 16,
				shade: 0.01,
				time : 100000000
			});
		}
		http.post({
			url: thisUrl,
			data: {
				schemeId : $scope.schemeId,
				locationDtoList : [],
				reasonType : $scope.selectScheduleReasonList.join(),
				reasonDesr : $("#reScheduleDescription").val(),
			},
			successFn: function (response) {
				$location.path(thisPath).replace();
				// if(startApsType !== "editAgain"){
				layer.closeAll();
				// }
			},
		});
	};


    /**
     * desc:验证本次地点树是否全部包含上次退出选择的地点ID,如没有全部包含，则需重新选择地点
     * last:2017-03-24
     * @params:locationTreeData: 本次地点树所有的地点ID，Array
     * @params:lastLoginData: 用户上次退出登录时记录的地点ID,Array
     * @return: boolean true: 本次地点树全部包含,符合条件，正常使用，false:未全部包含，不符合条件，需重新挑选
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
    * desc:筛选出所有车间的公共父元素车间id。1当有父元素地点ID时，没有子元素地点ID
    * last:2017-03-24
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
        for(let i = 0;i < locationIdList.length; i++){
            locationIdList = locationIdList.filter(function (item) {
                //筛选规则：包含本次短地点ID但不等于 或 不包含本次短地点ID
                return (item.indexOf(locationIdList[i])>-1)&&item === locationIdList[i] || item.indexOf(locationIdList[i]) === -1;
            });
        }
        return locationIdList;
    };
	
	
	let startDateIndex = 0,
		endDateIndex = 0,
		spanIndex = 0;
	//当时间跨度改变时(起始时间)
	$scope.$watch("controllerDate.minStartDate",function(newStartDate,oldStartDate){			
		//转成时间对象
		let newStart = tool.stringToDate(newStartDate),
			oldStart = tool.stringToDate(oldStartDate);
		if(oldStartDate){
			//开始时间大于结束时间，无操作
			if(newStart > tool.stringToDate($scope.controllerDate.maxEndDate)){
				if(startDateIndex === 0 || endDateIndex !== 0){
					layer.close(endDateIndex);
					endDateIndex = 0;
					startDateIndex = layer.tips('请设置开始时间不晚于结束时间。', $(".scrollbar-min-startdate"), {
					  tips: [1, '#3595CC'],
					  time: 0
					});
				}
				return;
			}
			
			//限制时间跨度
			if((tool.stringToDate($scope.controllerDate.maxEndDate) - newStart)/86400000 > 89){
				if(spanIndex !== 0){
					return;
				}
				spanIndex = layer.tips('请设置时间跨度小于90天。', $(".scrollbar-min-startdate"), {
				  tips: [1, '#3595CC'],
				  time: 0
				});
				return;
			}
			
			layer.close(startDateIndex);
			startDateIndex = 0;
			layer.close(endDateIndex);
			endDateIndex = 0;
			layer.close(spanIndex);
			spanIndex = 0;
//			//起始时间前移，查询新起始时间到原起始时间之间的数据
//			if(newStart < oldStart){
//				preview_show_table($scope.locationId_pre, $scope.locationFilterList_pre);  
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
			preview_show_table($scope.locationId_pre, $scope.locationFilterList_pre); 
			//刷新时间控件滚动条
			$scope.getDateChangeWidth();
		}
			
	});
	//当时间跨度改变时(结束时间)
	$scope.$watch("controllerDate.maxEndDate",function(newEndDate,oldEndDate){
		//转成时间对象
		let newEnd = tool.stringToDate(newEndDate),
			oldEnd = tool.stringToDate(oldEndDate);
		if(oldEndDate){
			//结束时间小于开始时间，无操作
			if(newEnd < tool.stringToDate($scope.controllerDate.minStartDate)){
				if(endDateIndex === 0 || startDateIndex !== 0){
					layer.close(startDateIndex);
					startDateIndex = 0;
					endDateIndex = layer.tips('请设置结束时间不早于开始时间。', $(".scrollbar-max-enddate"), {
					  tips: [1, '#3595CC'],
					  time: 0
					});
				}
				return;
			}
			
			//限制时间跨度
			if((newEnd - tool.stringToDate($scope.controllerDate.minStartDate))/86400000 > 89){
				if(spanIndex !== 0){
					return;
				}
				spanIndex = layer.tips('请设置时间跨度小于90天。', $(".scrollbar-max-enddate"), {
				  tips: [1, '#3595CC'],
				  time: 0
				});
				return;
			}
			layer.close(startDateIndex);
			startDateIndex = 0;
			layer.close(endDateIndex);
			endDateIndex = 0;
			layer.close(spanIndex);
			spanIndex = 0;
//			//结束时间后延，查询原结束时间到新结束时间之间的数据
//			if(newEnd > oldEnd){
//				preview_show_table($scope.locationId_pre, $scope.locationFilterList_pre);  
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
			preview_show_table($scope.locationId_pre, $scope.locationFilterList_pre);  
			//刷新时间控件滚动条
			$scope.getDateChangeWidth();
		}
	})

});
