/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	"use strict";

	/**
	 * Created by xujun on 2016/7/1.
	 */
	app.controller('previewCtrl', function ($scope, $rootScope, $http, $window, $location, $timeout, scheduleTableViewModelService) {
		$(".table-dialog-window").hide();
		//查询条件
		var startTime;
		var endTime;
		//开始排程/再编辑
		var startApsType = "";
		//冻结期
		var fact_days = "";
		//日历周期，目前设置为7天
		var offset = 6;
		//通过json查询的对象声明
		var minStartTime, maxEndTime, queryObject, tableHeadViewModel, tableBodyViewModel;

		//设备
		var goEquipment = {};
		var goInfo = {};
		var goWindowTableData = {};
		//sessionStorage
		$rootScope.current_location = sessionStorage.locationId_pre;
		//用户名
		$scope.userName = $rootScope.userName;

		//初始化查询日期
		var today = new Date();
		if ($rootScope.daily_test) {
			today.setFullYear(2016, 10, 1);
		} //测试用代码，用于日常环境每次打开显示的为7月1日而不是今天
		startTime = xujun_tool.dateToString(today); //开始时间为今天
		endTime = xujun_tool.dateToString(new Date(today.setDate(today.getDate() + offset))); //结束时间为今天之后的7天

		//测试时间
		//startTime = "2016-07-07";
		//endTime = "2016-07-08";

		//接口还没好，暂时先注释掉
		$http.get($rootScope.restful_api.get_lock_days).then(function (res) {
			var resData = res.data.lockDate; //锁定期
			if (resData) {
				fact_days = resData; //锁定期(可预排最大日期)
			} else {
				layer.alert('锁定期接口获取的数据发生错误,请联系技术人员', {
					skin: 'layer-alert-themecolor' //样式类名
				});
			}
		}, function (res) {
			layer.alert('获取锁定期失败,请联系技术人员', {
				skin: 'layer-alert-themecolor' //样式类名
			});
		});

		/**
	  * 显示正式派工单表的排程计划
	  **/
		function preview_show_table(location, locationFilterList) {
			//API接口
			if ($rootScope.local_test) {
				/**
	    * 本地测试方法
	    */
				//保存设备信息
				goEquipment = $.extend({}, showTable.punit);
				goInfo = $.extend({}, showTable);
				//json转viewModel对象
				tableHeadViewModel = scheduleTableViewModelService.jsonToTableHeadViewModel(showTable);
				tableBodyViewModel = scheduleTableViewModelService.jsonToTableBodyViewModel(showTable);
				//绑定view层
				$scope.tableHeadViewModel = tableHeadViewModel;
				$scope.tableBodyData = tableBodyViewModel.tableBodyData;
				//查询时间
				queryObject = scheduleTableViewModelService.jsonToQueryObject(showTable);
				minStartTime = queryObject.minStartTime;
				maxEndTime = queryObject.maxEndTime;
				//判断上一页下一页按钮是否能点
				//			checkQueryTime(startTime, endTime, today, maxEndTime);
			} else {
				$rootScope.getsessionStorage(sessionStorage.locationId_pre, sessionStorage.urlId_res);
				$scope.get_differall_num();

				$("#do_detail_dialog_1").parent().remove();
				//获取查询信息			
				var saleOrder = xujun_tool.getFromInput(".sale-order"),
				    materialName = xujun_tool.getFromInput(".material-name"),
				    materialCode = xujun_tool.getFromInput(".material-code");

				//拼url
				var get_url = $rootScope.restful_api.preview_show_table + "?locationFilterList=" + locationFilterList + "&startTime=" + startTime + "&endTime=" + endTime;
				//获取和显示table数据
				$http.get(get_url).then(
				//成功
				function (response) {
					var isSearch = false;
					if (saleOrder + materialName + materialCode) {
						isSearch = true;
					}

					//保存设备信息
					goInfo = $.extend({}, response.data);
					goEquipment = $.extend({}, response.data.punit);
					//是否查询
					response.data.isSearch = isSearch;
					//锁定期
					response.data.freezeDate = fact_days;
					//是否翻转状态
					response.data.front = $rootScope.frontBack;
					//json转viewModel对象
					tableHeadViewModel = scheduleTableViewModelService.jsonToTableHeadViewModel(response.data);
					//检查返回内容是否正确（目前只判断time是否存在）
					if (tableHeadViewModel == undefined) {
						layer.alert('数据请求发送成功，数据内容解析失败，请联系技术人员处理', {
							skin: 'layer-alert-themecolor' //样式类名
						});
						console.log("get json success, but format error, result :");
						console.log(response.data);
						return;
					}

					//json转viewModel对象
					tableBodyViewModel = scheduleTableViewModelService.jsonToTableBodyViewModelNew(response.data);

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

					$scope.last_page_button_style = { 'display': 'inline-block' };
					$scope.next_page_button_style = { 'display': 'inline-block' };
					$(".page-select").css("pointer-events", "auto");
					//页面显示表格,by jquery
					jqueryDraw();
				},
				//失败
				function (response) {
					layer.alert('获取数据失败，请联系技术人员处理', {
						skin: 'layer-alert-themecolor' //样式类名
					});
					$(".page-select").css("pointer-events", "auto");
				});
			}
		}
		/**
	  * 搜索框输入检测
	  **/
		function checkSearchData(thisStartTime, thisEndTime, aEquipmentId) {
			if (!thisStartTime) {
				layer.alert('请选择开始时间', {
					skin: 'layer-alert-themecolor' //样式类名
				});
				return false;
			} else if (!thisEndTime) {
				layer.alert('请选择结束时间', {
					skin: 'layer-alert-themecolor' //样式类名
				});
				return false;
			} else if (!thisEquipmentName) {
				layer.alert('请输入设备', {
					skin: 'layer-alert-themecolor' //样式类名
				});
				return false;
			}
			if (aEquipmentId.length < 1) {
				layer.alert('请输入正确的设备名称', {
					skin: 'layer-alert-themecolor' //样式类名
				});
				return false;
			}
			return true;
		}

		/**
	  * 上一页按钮点击
	  **/
		$scope.last_page = function () {
			$(".page-select").css("pointer-events", "none");
			var startTime_date = xujun_tool.stringToDate(startTime);
			var endTime_date = xujun_tool.stringToDate(endTime);
			startTime = xujun_tool.dateToString(new Date(startTime_date.setDate(startTime_date.getDate() - offset - 1))); //开始时间为周期后+1
			endTime = xujun_tool.dateToString(new Date(endTime_date.setDate(endTime_date.getDate() - offset - 1))); //结束时间为周期后+1
			//获取表格数据
			preview_show_table(sessionStorage.locationId_pre, sessionStorage.locationFilterList_pre);
		};

		/**
	  * 下一页按钮点击
	  **/
		$scope.next_page = function () {
			$(".page-select").css("pointer-events", "none");
			var startTime_date = xujun_tool.stringToDate(startTime);
			var endTime_date = xujun_tool.stringToDate(endTime);
			startTime = xujun_tool.dateToString(new Date(startTime_date.setDate(startTime_date.getDate() + offset + 1))); //开始时间为周期后+1
			endTime = xujun_tool.dateToString(new Date(endTime_date.setDate(endTime_date.getDate() + offset + 1))); //结束时间为周期后+1
			//获取表格数据
			preview_show_table(sessionStorage.locationId_pre, sessionStorage.locationFilterList_pre);
		};

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

			var index = layer.confirm('确定要开始' + thisText + '?', {
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
					$http.post(thisUrl, $rootScope.start_data).then(
					//成功
					function (response) {
						if (response.data == true) {
							$location.path(thisPath).replace();
						} else {
							layer.alert(thisText + '失败，返回参数错误，请联系技术人员处理', {
								skin: 'layer-alert-themecolor' //样式类名
							});
							console.debug("get json error: ");
							console.debug(response.data);
						}
					},
					//失败
					function (response) {
						layer.alert(thisText + '失败，请联系技术人员处理', {
							skin: 'layer-alert-themecolor' //样式类名
						});
						console.debug("get json error: ");
						console.debug(response.data);
					});
				}
				layer.closeAll();
			});
		};

		/**
	  * 翻转
	  **/
		$scope.turn_to_back = function () {
			//判断往那边转
			var thisOpacity = 1;
			if ($rootScope.frontBack) {
				$rootScope.frontBack = false;
				thisOpacity = 0;
			} else {
				$rootScope.frontBack = true;
			}

			$(".table-tr").each(function (a) {
				var thisTr = $(this),
				    TdList = thisTr.find(".table-td");
				TdList.each(function (index) {

					if (index == 0) {
						return;
					} else {
						var thisTd = $(this),
						    thisFront = thisTd.find(".td-front"),
						    thisBack = thisTd.find(".td-back"),
						    ry = 0,
						    by = 0;

						//连点终止之前的动画。
						thisFront.stop(false, false);

						//调用jquery动画函数
						thisFront.animate({ opacity: thisOpacity }, {
							step: function step(n) {
								ry = (1 - n) * 180;
								by = n * 180;
								$(this).css("transform", "rotateY(" + ry + "deg)");
								thisBack.css("opacity", 1 - n);
								thisBack.css("transform", "rotateY(" + by + "deg)");
							},
							duration: 500
						});
					}
				});
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
			var todayDate = new Date();
			todayDate.setHours(0);
			todayDate.setMinutes(0);
			todayDate.setSeconds(0, 0);

			//获取设备名，存入数组
			for (i in equipment) {
				var punitName = equipment[i].punitName;
				punitNameList.push(punitName);
			}

			//显示到页面上
			$scope.punitNameList = punitNameList;

			//转换获取到的锁定期	
			fact_days = xujun_tool.stringToDate(fact_days);

			//算今天到锁定期的相隔天数
			for (; todayDate.getTime() <= fact_days.getTime();) {
				todayDate = todayDate.setDate(todayDate.getDate() + 1);
				todayDate = new Date(todayDate);
				daysNum++;
			}

			//再次转换锁定期的日期格式
			fact_days = xujun_tool.dateToString(fact_days);

			//页面显示天数
			$scope.maxdays = daysNum;

			//控制输入框的输入，只允许输入固定范围内的数字
			$timeout(function () {
				var arrInput = $(".to-fact-box input");
				$(".to-fact-box input").each(function (i) {
					$(this).on("keyup", function () {
						if (this.value.length == 1) {
							this.value = this.value.replace(/[^0-9]/g, '');
						} else {
							this.value = this.value.replace(/\D/g, '');
						}
						if (this.value > daysNum) {
							this.value = daysNum;
						}
					});
				});

				//改变勾选的那行的输入框	
				arrInput.eq(0).on("keyup", function () {
					var to_fact_days = arrInput.eq(0).val();
					$(".to-fact-box .each-pName-div").each(function (i) {
						var checkVal = $(this).find("input[name = 'factPnameSingle']").is(':checked');
						if (checkVal) {
							$(this).find(".each_days_input").val(to_fact_days);
						}
					});
				});
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
			});

			//若输入框的值都为空或者0,则不执行
			if (nullNum == daysList.length) {
				layer.alert('无法预排，请检查是否可排或检查是否输入了预排天数', {
					skin: 'layer-alert-themecolor' //样式类名
				});
				return;
			} else {
				layer.confirm('是否确认预排转实际？', {
					btn: ['确定', '取消'] //按钮
				}, function () {
					var equipment = goInfo.punit,
					    aList = [];

					//用于数组取值
					var temp = 0;
					for (var i in equipment) {

						//今天日期
						var nowDate = new Date();
						nowDate.setHours(0);
						nowDate.setMinutes(0);
						nowDate.setSeconds(0, 0);

						//对应的输入框有值
						if (daysList[temp]) {

							//设备ID
							var equipmentId = i.substring(0, i.indexOf("_"));

							var maxToFactDate,
							    dataList = [],
							    thisFreezeDate = xujun_tool.stringToDate(equipment[i].freezeDate);

							//当前设备可预排的最大日期
							maxToFactDate = nowDate.setDate(nowDate.getDate() + daysList[temp] - 1);
							maxToFactDate = new Date(maxToFactDate);

							//当天日期
							var minDate = new Date();
							minDate.setHours(0);
							minDate.setMinutes(0);
							minDate.setSeconds(0, 0);

							//折算出从今天到最大日期间的所有日期
							for (; minDate.getTime() <= maxToFactDate;) {
								dataList.push(xujun_tool.dateToString(minDate));
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
						$http.post($rootScope.restful_api.plan_to_fact, aList).then(function (res) {
							if (res.data == true) {
								layer.alert('预排转实际成功', {
									skin: 'layer-alert-themecolor' //样式类名
								});
							} else {
								layer.alert('预排转实际失败', {
									skin: 'layer-alert-themecolor' //样式类名
								});
							}
						}, function (res) {
							layer.alert('连接失败', {
								skin: 'layer-alert-themecolor' //样式类名
							});
						});
					} else {
						layer.alert('锁定期内无单', {
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

			//右边栏弹出小提示
			var arrEle = $(".right-menu-button");
			for (var i = 0; i < arrEle.length; i++) {
				$(arrEle[i]).mouseover(function () {
					$(this).find(".tip").stop().show().animate({
						left: "-120px",
						opacity: "1"
					}, 300);
				});
				$(arrEle[i]).mouseleave(function () {
					$(this).find(".tip").hide().animate({
						left: "-220px",
						opacity: "0.3"
					}, 0);
				});
			}

			//预排转实际加减号
			$(".to-fact-box").on("click", ".add", function () {
				var va = $(this).parent().find(".each_days_input").val() - 0;
				//			var va = va - 0 ;
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
				//			var va = va - 0 ;
				if (va <= daysNum && va > 0) {
					$(this).parent().find(".each_days_input").val(va - 1);
					$(this).parent().find(".add").css("cursor", "pointer");
					$(this).css("cursor", "pointer");
				}
				if (va <= 1) {
					$(this).css("cursor", "default");
					$(this).parent().find(".add").css("cursor", "pointer");
				}
			});

			//排程方案选择下拉框
			$(".aps-case ").on("click", "p.case-header", function () {
				if ($(this).next("ul").hasClass("select-li")) {
					$(this).next("ul").removeClass("select-li");
					$(this).removeClass("chosen");
				} else {
					$(this).next("ul").addClass("select-li");
					$(this).addClass("chosen");
				}
			}).on("click", ".case-content li", function () {
				$(".case-header").html($(this).html());
				$(".case-content").removeClass("select-li");
				$(this).parent().siblings(".case-header").removeClass("select-li");
				$(this).parent().siblings(".case-header").removeClass("chosen");
			});
		});

		/**
	  * 表头
	  **/
		function setTableHeadWidth(parentNodes) {
			var lastLeft = 0;
			var jCoverHead = parentNodes.find(".cover-head"),
			    jShowTable = parentNodes.find(".show-table thead");
			jCoverHead.width(jShowTable.width());
			jCoverHead.height(jShowTable.height());
			var jCoverTh = jCoverHead.find("div");
			var jHeadTh = jShowTable.find("th");
			var thNum = jHeadTh.length;
			for (var i = 0; i < thNum; i++) {

				if (!!window.ActiveXObject || "ActiveXObject" in window) {
					if (i == thNum - 1) {
						jCoverTh.eq(i).width(jShowTable.width() - jHeadTh.eq(i).position().left - 2);
					} else {
						var thisWidth = jHeadTh.eq(i + 1).position().left - lastLeft - 2;
						lastLeft = jHeadTh.eq(i + 1).position().left;
						jCoverTh.eq(i).width(thisWidth);
					}
				} else {
					jCoverTh.eq(i).width(jHeadTh.eq(i).width());
				}
			}
		};

		/**
	  * 获取外部差异条数
	  **/

		var bodyData; //表体数据
		var tabList; //标签数据
		var headData; //表头数据
		$scope.get_differall_num = function () {
			/*拼接url开始*/
			var ex_diff_url = "";
			var locationFilterString = sessionStorage.locationFilterList_pre;
			var locationFilterArr = locationFilterString.split(",");
			var locationFilters = "";

			for (var i = 0; i < locationFilterArr.length; i++) {
				if (i == 0) {
					locationFilters += "locationFilterList=" + locationFilterArr[i];
				} else {
					locationFilters += "&" + "locationFilterList=" + locationFilterArr[i];
				}
			}
			ex_diff_url = $rootScope.restful_api.exter_differ + locationFilters;
			/*拼接url结束*/

			$http.get(ex_diff_url).then(function (response) {
				if (response.data) {
					var resData = response.data;
					var externalDifferViewModel = scheduleTableViewModelService.jsonToexternalDifferViewModel(resData);
					bodyData = externalDifferViewModel.bodyData;
					tabList = externalDifferViewModel.tabList;
					headData = externalDifferViewModel.headData;

					//计算总条数
					differAllNum = 0;
					for (var i = 0; i < tabList.length; i++) {

						//每部分对应的条数
						var each_differ_num = tabList[i].each_differ_num;
						differAllNum += each_differ_num;
						$scope.differAllNum = differAllNum;
						if (differAllNum) {

							//如果有值,则显示数字
							$(".right-menu .external-diff-num").show();
						}
					}
				} else {
					layer.alert('"外部差异"接口数据有问题，请联系技术人员处理', {
						skin: 'layer-alert-themecolor' //样式类名
					});
				}
			}, function (res) {
				layer.alert('"外部差异"获取数据失败，请联系技术人员处理', {
					skin: 'layer-alert-themecolor' //样式类名
				});
			});
		};

		//本地测试方法代码
		$scope.get_differall_num1 = function () {
			if ($rootScope.local_test) {
				var externalDifferViewModel = scheduleTableViewModelService.jsonToexternalDifferViewModel(exterDiffer);
				bodyData = externalDifferViewModel.bodyData;
				tabList = externalDifferViewModel.tabList;
				headData = externalDifferViewModel.headData;
				differAllNum = 0;
				for (var i = 0; i < tabList.length; i++) {
					//计算总条数
					var each_differ_num = tabList[i].each_differ_num; //每部分对应的条数
					differAllNum += each_differ_num;
					$scope.differAllNum = differAllNum;
					if (differAllNum) {
						$(".right-menu .external-diff-num").show(); //如果有值,则显示数字
					}
				}
			}
		};

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

			//表头
			$scope.headData = headData;
			if (tabList.length) {

				//tab标签
				$scope.tabList = tabList;

				//第一个tab标签的表格
				var changeType = tabList[0].changeType;
				$scope.changedBodyData = bodyData[changeType];
				$(".exDiffer-window .null-data").hide();
			} else {
				$(".exDiffer-window .null-data").show();
			}

			//表头
			$timeout(function () {
				setTableHeadWidth($(".exDiffer-window"));
			}, 0);

			//resize
			$(window).on("resize", function () {
				setTableHeadWidth($(".exDiffer-window"));
			});

			$timeout(function () {

				//第一个tab的样式有点击状态
				$(".external-diff-tab").children("li:first").not(".each-diff-num").addClass("click-tab");
				var Litype = $(".external-diff-tab").children("li:first").attr("type");

				//如果此时是"变化"的情况则给弹窗加上class,主要是为了下面的功能 红色 字体的显示
				if (Litype == "change") {
					$(".pbody .exDiffer-window").addClass("exDiffer");
				} else if (Litype == "add" || Litype == "desc") {
					//如果不是"变化"的情况,去掉弹窗的class
					$(".pbody .exDiffer-window").removeClass("exDiffer");
				}

				//红色字体的格子会显示变化前的数据
				if (Litype == "change") {
					$("body").on("mouseenter", ".exDiffer .brightColor", function () {
						$(".differ-tip").remove();
						var tdWidth = $(this).width();
						var tdHeight = $(this).height();
						var tdLeft = $(this).offset().left;
						var tdTop = $(this).offset().top;
						var oldData = $(this).attr("data-old");
						var oldDataTip = layer.open({
							type: 4,
							content: "变化前 : " + oldData, //数组第二项即吸附元素选择器或者DOM
							tips: 1,
							skin: "differ-tip",
							time: 3000,
							closeBtn: 0,
							shade: 0,
							success: function success() {
								$(".pbody .external-diff-tab li").click(function () {
									layer.close(oldDataTip);
								});
								$(".differ-tip").css({
									"left": tdLeft + tdWidth / 2,
									"top": tdTop + tdHeight + 12
								});
							}
						});
					});
				}
			}, 0);

			//关闭窗口
			jDifferWindow.find(".close-window").on("click", function () {
				jDifferWindow.hide();
				$(".cover").hide();
				$(".differ-tip").remove();
			});
		};

		/**
	  * 点击外部差异tab
	  **/
		$scope.exteriffer_tab = function (tabInfo, $event) {

			//获取当前点击的li对应的类型
			var changeType = tabInfo.changeType;
			var jDifferWindow = $(".exDiffer-window");

			//根据tab重绘表格部分
			$scope.changedBodyData = bodyData[changeType];

			//表头
			$timeout(function () {
				setTableHeadWidth($(".exDiffer-window"));
			}, 0);

			//resize
			$(window).on("resize", function () {
				setTableHeadWidth($(".exDiffer-window"));
			});

			//切换点击的tab的样式
			var thisLi = $event.target;
			$($event.target).not(".each-diff-num").addClass("click-tab").siblings().removeClass("click-tab");
			$(".exDiffer-window").on("click", ".each-diff-num", function () {
				$(this).parent().not(".each-diff-num").addClass("click-tab").siblings().removeClass("click-tab");
			});

			$timeout(function () {
				var Litype = $($event.target).attr("type") || $($event.target).parent().attr("type");

				//如果不是"变化"的情况,去掉弹窗的class
				if (Litype == "add" || Litype == "desc") {
					$(".pbody .exDiffer-window").removeClass("exDiffer");
				} else if (Litype == "change") {
					$(".pbody .exDiffer-window").addClass("exDiffer");
				}

				//红色字体的格子会显示变化前的数据
				if (Litype == "change") {
					$("body").on("mouseenter", ".exDiffer .brightColor", function () {
						$(".differ-tip").remove();
						var tdWidth = $(this).width();
						var tdHeight = $(this).height();
						var tdLeft = $(this).offset().left;
						var tdTop = $(this).offset().top;
						var oldData = $(this).attr("data-old");
						var oldDataTip = layer.open({
							type: 4,
							content: "变化前 : " + oldData, //数组第二项即吸附元素选择器或者DOM
							tips: 1,
							skin: "differ-tip",
							time: 3000,
							closeBtn: 0,
							shade: 0,
							success: function success() {
								$(".pbody .external-diff-tab li").click(function () {
									layer.close(oldDataTip);
								});
								$(".differ-tip").css({
									"left": tdLeft + tdWidth / 2,
									"top": tdTop + tdHeight + 12
								});
							}
						});
					});
				}
			}, 0);

			//关闭窗口
			jDifferWindow.find(".close-window").on("click", function () {
				jDifferWindow.hide();
				$(".cover").hide();
				$(".differ-tip").remove();
			});
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
		$scope.unit_click = function (cell) {
			if (cell[0].type == 3) {
				return;
			}
			var thisInf = cell[0].args,
			    thisDate = thisInf.date,
			    thisStartDate = thisInf.s_date,
			    thisEndDate = thisInf.e_date,
			    thisEquipment = thisInf.equipment_id;

			if (!!thisDate) {
				thisStartDate = thisDate;
				thisEndDate = thisDate;
			}
			//查询条件
			var saleOrder = xujun_tool.getFromInput_nocode(".sale-order");
			materialName = xujun_tool.getFromInput_nocode(".material-name");
			materialCode = xujun_tool.getFromInput_nocode(".material-code");

			$scope.click_creat_window(thisStartDate, thisEndDate, thisEquipment, saleOrder, materialName, materialCode);
		};

		/**
	  * 表头单元格点击
	  **/
		$scope.date_click = function (date, a) {
			var thisData = date,
			    thisStartDate = thisData.thisDate,
			    thisEndDate = thisData.thisDate,
			    thisEquipment = thisData.equipment;
			var saleOrder = xujun_tool.getFromInput_nocode(".sale-order"),
			    materialName = xujun_tool.getFromInput_nocode(".material-name"),
			    materialCode = xujun_tool.getFromInput_nocode(".material-code");
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

			if ($rootScope.local_test) {
				/**
	    * 本地测试方法
	    */
				var resData = test_dialog_table;
				var headList = resData.columnAlias; //表头列表
				var tableList = resData.column; //表格数据顺序
				var query = resData.query; //筛选项
				var tableData = resData.row; //表格数据

				var jHtml = "";
				jHtml += '<div class="table-dialog-window"><div class="dialog-window-head"><i class="close-window"></i></div><div class="dialog-window-body"><div class="info-show">';

				//筛选项
				jHtml += '<span>开始时间：' + thisStartTime + '</span><span>结束时间：' + thisEndTime + '</span><span>设备：' + query.equipment.join(",") + '</span></div><div class="show-table"><div><table><thead><tr>';

				//表头
				for (var i in headList) {
					jHtml += '<th>' + headList[i] + '</th>';
				}
				jHtml += '</tr></thead><tbody>';

				//表格内容
				for (var i in tableData) {
					var thisTr = tableData[i];

					jHtml += '<tr>';
					for (var j in tableList) {
						jHtml += '<td>' + thisTr[tableList[j]] + '</td>';
					}
					jHtml += '</tr>';
				}
				jHtml += '</tbody></table></div></div></div></div>';

				$(".table-dialog-window").remove();
				$(".wrap-content").append($(jHtml));
				$(".close-window").on("click", function () {
					$(".table-dialog-window").remove();
				});
			} else {
				//查询二级页面数据
				//			var URL=$rootScope.restful_api.last_get_dialog_window;
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
					"equipments": isArr
				};
				localStorage.setItem("hrefPrameter", JSON.stringify(body_data));
				var href = "./view/secondPage.html?preview";
				window.open(href);
				return;
			}
		};

		//jquery控制表格显示样式，需要采用这种异步的方式调用
		function jqueryDraw() {
			$timeout(function () {
				//          view_js.autoResize();
				$(".search-box").hide();
				$(".search-btn").removeClass("search-btn-click");
				//页面渲染绘制锁定期相关的信息：锁定期线，以后会扩展更多
				if (tableBodyViewModel) view_js.aps_freeze_draw(tableBodyViewModel.tableTrFreezeInfo, tableBodyViewModel.tableTrOverCapability);
			}, 0);
		}

		/**************以下是本页实际执行的代码，上面都为函数和事件绑定****************/

		/**
	  *    地点显示 
	  **/
		var thisUrl = $rootScope.restful_api.aps_location_readable; //地点信息
		$http.get(thisUrl).then(function (res) {
			var resData = res.data;
			$scope.folder = getData(res.data)[0]; //处理数据,并绑定到页面

			//存储第一个车间下的子地点
			var resData_body;
			for (var i in resData) {
				resData_body = resData[i].nextLevelLocation;
			}
			var first_locationList = [];
			var defaultList_pre = [];
			for (var j in resData_body) {
				first_locationList.push(resData_body[j].nextLevelLocation);
				defaultList_pre.push(j);
			}
			sessionStorage.defaultList_pre = defaultList_pre; //存储默认值
			$rootScope.defaultList_pre = defaultList_pre[0];
			var first_locationChildList = [];
			for (var m in first_locationList[0]) {
				first_locationChildList.push(m);
			}
			//第一级下的地点
			$rootScope.defaultList = first_locationChildList.join();

			var outerEle = $(".location-list");
			outerEle //改变状态
			.on("click", "ul span", function () {
				if ($(this).next().find("ul li").length == 0) {
					return;
				} else {
					$(this).toggleClass("active").toggleClass("open");
					$(this).next().toggle();
				}
				//设置前面线的高度
				var thisUL = $(this).parents("ul");
				var thisB = $(this).parents("ul").children("b");
				var thisLI = $(this).parents("ul").children("li");
				var thisHeight = 0;
				for (var i = 0; i < thisLI.length - 1; i++) {
					thisHeight += $(thisLI[i]).height();
				}
				thisB.height(thisHeight + 100);
				//改变按钮的位置
				var bgPosition = $(".location-choose").width();
				$(".out-bg").width(bgPosition);
			}).on("click", "ul ul i", function () {
				//点击第一级下面的选框
				//改变状态
				changeSelectStatus($(this));
				//第一级只能单选
				$(this).parents("li").last().siblings("li").children("i").removeClass("active").removeClass("selected").removeClass("selectsome").addClass("unselect");
				$(this).parents("li").last().siblings("li").find("i").removeClass("active").removeClass("selected").removeClass("selectsome").addClass("unselect");
			}).on("click", "ul:eq(0)>li>i", function () {
				//点击第一级选框
				changeSelectStatus($(this));
				//第一级点击操作
				$(this).parent().siblings("li").children("i").removeClass("active").removeClass("selected").removeClass("selectsome").addClass("unselect");
				$(this).parent().siblings("li").find("i").removeClass("active").removeClass("selected").removeClass("selectsome").addClass("unselect");
			});
			$timeout(function () {
				//如果没有子地点 ,移除 s 标签
				var clickSpan = $(".location-list").find("span");
				clickSpan.each(function () {
					if ($(this).next().find("li").length == 0) {
						$(this).children("s").removeClass("open-btn");
					} else {
						$(this).children("s").addClass("open-btn");
					}
				});
			});

			//改变状态
			function changeSelectStatus(thisSelect) {
				var thisSelect = thisSelect;
				//本身及所有后代的改变
				if (thisSelect.hasClass("selectsome") || thisSelect.hasClass("unselect")) {
					thisSelect.removeClass("selectsome").removeClass("unselect").addClass("selected").addClass("active");
					thisSelect.parent("li").find("folder-tree i").removeClass("selectsome").removeClass("unselect").addClass("selected").addClass("active");
				} else {
					thisSelect.removeClass("selected").addClass("unselect").removeClass("active");
					thisSelect.parent("li").find("folder-tree i").removeClass("selected").addClass("unselect").removeClass("active");
				}
				//处于其影响范围内的祖先的改变
				thisSelect.parents("folder-tree").each(function () {
					var thisTree = $(this);
					var thisStatus = thisTree.siblings(".selcetstatus");
					if (thisTree.find(".selected").length < 1) {
						thisStatus.removeClass("selected").removeClass("active").removeClass("selectsome").addClass("unselect");
					} else if (thisTree.find(".unselect").length < 1) {
						thisStatus.removeClass("selectsome").removeClass("unselect").removeClass("selectsome").addClass("selected").addClass("active");
					} else {
						thisStatus.removeClass("unselect").removeClass("selected").removeClass("active").addClass("selectsome");
					}
				});
			}
		});

		/**
	  * 判断是否有缓存,有则取缓存,没有则默认显示第一个
	  **/
		$timeout(function () {
			var defaultEle = $(".location-list").children("folder-tree").children("ul").children("li:eq(0)").children("i");
			var defaultId = defaultEle.attr("location-id");

			//是否有上一次的缓存
			if (sessionStorage.locationId_pre) {
				//			if(sessionStorage.defaultList_pre.indexOf(sessionStorage.locationId_pre) > -1) {    
				//				preview_show_table(sessionStorage.locationId_pre,sessionStorage.locationFilterList_pre);  //查询显示
				//				jqueryDraw();          //页面显示表格
				//				$("i[location-id="+sessionStorage.locationId_pre+"]").click();
				//			} else {
				//				defaultEle.click();
				//				sessionStorage.locationId_pre = defaultId;
				//	    		sessionStorage.locationFilterList_pre = $rootScope.defaultList;
				//	    		preview_show_table(defaultId,$rootScope.defaultList);
				//				jqueryDraw();  
				//			}
				//第一次登陆,判断是否有用户id缓存
				if (sessionStorage.userId) {
					//判断上一次的缓存是否对该用户有权限
					if ($rootScope.userId == sessionStorage.userId) {
						preview_show_table(sessionStorage.locationId_pre, sessionStorage.locationFilterList_pre); //查询显示
						jqueryDraw(); //页面显示表格
						$("i[location-id=" + sessionStorage.locationId_pre + "]").click();
						sessionStorage.userId = $rootScope.userId; //存储当前用户Id
					} else {
						defaultEle.click();
						sessionStorage.locationId_pre = defaultId;
						sessionStorage.locationFilterList_pre = $rootScope.defaultList;
						preview_show_table(defaultId, $rootScope.defaultList);
						jqueryDraw();
						sessionStorage.userId = $rootScope.userId;
					}
				} else {
					defaultEle.click();
					sessionStorage.locationId_pre = defaultId;
					sessionStorage.locationFilterList_pre = $rootScope.defaultList;
					preview_show_table(defaultId, $rootScope.defaultList);
					jqueryDraw();
					sessionStorage.userId = $rootScope.userId;
				}
			} else {
				defaultEle.click();
				sessionStorage.locationId_pre = defaultId;
				sessionStorage.locationFilterList_pre = $rootScope.defaultList;
				preview_show_table(defaultId, $rootScope.defaultList);
				jqueryDraw();
				sessionStorage.userId = $rootScope.userId;
			}

			//改变按钮位置
			$(".out-bg").animate({ width: "64px" }, 0);
		}, 200);

		/**
	  * 点击确定，向后台传选中数据
	  **/
		$scope.sure = function () {
			var allSelect = $(".selected");
			var locationList = [];
			var locationObj = {};

			allSelect.each(function () {
				var thisSelect = $(this),
				    thisLocationId = thisSelect.attr("location-id");
				locationList.push(thisLocationId);
			});

			if (locationList.length == 0) {
				layer.alert('请选择要查看的地点', {
					skin: 'layer-alert-themecolor' //样式类名
				});
				return;
			}
			locationObj.locationIdList = locationList;
			locationObj = JSON.stringify(locationObj);

			var urlLocationid;
			var body_locationid = [];
			var allSelecteds = $(".selectsome");
			//全勾中
			if (allSelecteds.length == 0) {
				for (var i = 0; i < locationList.length; i++) {
					if (locationList[i].length == 4) {
						urlLocationid = locationList[i];
					} else {
						body_locationid.push(locationList[i]);
					}
				}
			} else {
				//半勾
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
			sessionStorage.locationId_pre = urlLocationid;
			sessionStorage.locationFilterList_pre = body_locationid.join();
			$rootScope.urlLocationid = urlLocationid;
			$rootScope.body_locationid = body_locationid.join();

			preview_show_table(sessionStorage.locationId_pre, sessionStorage.locationFilterList_pre); //查询显示
			jqueryDraw(); //页面显示表格
			$rootScope.getsessionStorage(sessionStorage.locationId_pre, sessionStorage.urlId_res);

			//更改为默认第一级展开状态,并将地点树隐藏
			$(".location-list span").removeClass("open").removeClass("active");
			var folderTree = $(".location-list").find("folder-tree");
			for (var i = 1; i < folderTree.length; i++) {
				$(folderTree[i]).hide();
			}
			$(".location-choose").animate({ left: "-280px" }, 300);
			$(".point-click").css("background-position", "0px 0px");
			$(".out-bg").animate({ width: "64px" }, 300);
			//设置前面线的高度
			var thisB = $(folderTree[0]).children("ul").children("b");
			thisB.height($(folderTree[0]).children("ul").height() - 30);
		};

		/**
	 * 选择方案 排程
	 **/
		$scope.aps_schme = function () {
			$http.get($rootScope.restful_api.all_schedule_plan).success(function (res) {
				$(".case-header").empty();
				$(".case-header").text(res[0].schemeName); //默认方案为第一个
				$scope.schemeName = res;
				$scope.schemeId = $scope.schemeName[0].schemeId;
				$rootScope.schemeId = $scope.schemeName[0].schemeId;
				sessionStorage.schemeId = $scope.schemeName[0].schemeId;

				//判断是否有正在排程的方案/* start */
				$http.get($rootScope.restful_api.aps_location_writable).success(function (res) {
					$(".wrap-box").next("p").remove();
					$(".case-header").children("span").remove(); //清除上一次操作添加的元素
					var schedulingName = [];
					for (var i in res) {
						schedulingName.push(res[i].schemeName);
					}
					var text = $(".case-header").html(); //根据显示的方案名称判断,当前选择的方案是否匹配接口返回的排程方案,若是,则加以标示
					if (schedulingName.indexOf(text) > -1) {
						$(".aps-continue").show();
						$(".case-header").append("<span style='color:#f00;'>*</span>");
						$(".wrap-box").after("<p style='position:absolute;top:110px;left:117px;color:#f00;text-align:center;font-size:12px;'>您有未保存的工单信息,点击确定查看!</p>");
					} else {
						$(".aps-continue").hide();
						$(".wrap-box").next("p").remove(); //移除提示
					}
				}); /*  end  */

				var post_body = { //开始排程往后台发送数据
					"schemeId": $scope.schemeId,
					"locationDtoList": []
				};
				$rootScope.start_data = post_body;
			}).error(function (res) {}).then(function () {
				$http.get($rootScope.restful_api.single_schedule_plan + $scope.schemeId).success(function (res) {
					var locationRule = res.locationRuleList;
					$scope.locationRule = res.locationRuleList;

					var data_body = { //取消排程 往后台发送数据
						"schemeId": "",
						"locationDtoList": []
					};
					for (var i = 0; i < locationRule.length; i++) {
						var objLocation = {};
						var locationDtoList = [];
						objLocation.locationId = locationRule[i].locationId;
						objLocation.locationFilterList = [];
						data_body.locationDtoList.push(objLocation);
						data_body.schemeId = $scope.schemeId;
					}
					$rootScope.cancel_data = data_body;
					sessionStorage.cancel_data = data_body;
					sessionStorage.setItem("cancel_data", JSON.stringify(data_body));
				});
			});
			//选择方案
			$scope.case_btn = function (id) {
				$(".wrap-box").next("p").remove(); //移除提示
				$(".case-header").empty();
				$rootScope.schemeId = id;
				sessionStorage.schemeId = id;
				$http.get($rootScope.restful_api.single_schedule_plan + id).success(function (res) {
					var locationRule = res.locationRuleList;
					$scope.locationRule = res.locationRuleList;
					var data_body = { //取消排程 往后台发送数据
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
					//				sessionStorage.cancel_data = data_body;
					sessionStorage.setItem("cancel_data", JSON.stringify(data_body));

					var post_body = { //开始排程往后台发送数据
						"schemeId": id,
						"locationDtoList": []
					};
					$rootScope.start_data = post_body;
				});
				$timeout(function () {
					if ($(".case-header").children().length > 0) {
						$(".aps-continue").show();
						$(".wrap-box").after("<p style='position:absolute;top:110px;left:117px;color:#f00;text-align:center;font-size:12px;'>您有未保存的工单信息,点击确定查看!</p>");
					} else {
						$(".aps-continue").hide();
						$(".wrap-box").next("p").remove(); //移除提示
					}
				}, 10);
			};

			//判断是否有已经排过的订单
			$timeout(function () {
				$http.get($rootScope.restful_api.aps_location_writable).success(function (res) {
					$(".case-content").find("span").remove(); //清除上一次操作添加的元素
					var schemeArr = [];
					for (var i in res) {
						schemeArr.push(res[i].schemeId);
					}
					for (var j in schemeArr) {
						var schemeIsHasEles = $(".aps-case").find(".case-content").children("li[data-schmeid=" + schemeArr[j] + "]");
						schemeIsHasEles.append("<span style='color:#f00;'>*</span>"); //若有已排过的方案,增加 " * " 提示
					}
				});
			}, 10);
			//点击继续按钮  跳转
			$scope.aps_continue = function () {
				$location.path("/result").replace();
				layer.closeAll();
			};
		};

		/**
	  * 点击开始排程按钮
	  **/
		$scope.aps_start = function () {
			//		$(".wrap-box").next("p").remove();
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
				success: function success() {
					$(".aps-case").on("click", ".in-but", function () {
						layer.close(index);
						$(".case-content").removeClass("select-li");
					});
				}
			});
		};

		/**
	  * 点击再编辑
	  **/
		$scope.edit_again = function () {
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
				success: function success() {
					$(".aps-case").on("click", ".in-but", function () {
						layer.close($rootScope.index);
					});
				}
			});
		};
	});

/***/ }
/******/ ]);