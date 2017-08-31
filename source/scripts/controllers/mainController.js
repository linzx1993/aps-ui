/**
 * Created by duww on 2017/1/9.
 */
app.controller('mainCtrl', function ($scope, $rootScope, $http, $window, $location, $interval, $timeout, $q, scheduleTableViewModelService, tool, http, $state) {
	/**
	 * 翻转
	 **/
	//默认翻转状态
	$rootScope.frontBack = true;
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
					//有空改css动画
					thisFront.animate({
						opacity: thisOpacity
					}, {
						step: function (n) {
							ry = (1 - n) * 180;
							by = n * 180;
							$(this).css("transform", "rotateY(" + ry + "deg)");
							thisBack.css("opacity", 1 - n);
							thisBack.css("transform", "rotateY(" + by + "deg)");
						},
						duration: 500,
					});
				}
			})
		});
	}

	/**
	 * 切换显示模型（大格子/小个子）
	 **/
//	$scope.change_model_text = "切换月计划";
	$scope.isSmall = true;
	$scope.change_model_text = $scope.isSmall ? "切换周计划" : "切换月计划";
	$scope.change_model = function () {
		$scope.isSmall = !$scope.isSmall;
		$scope.change_model_text = $scope.isSmall ? "切换周计划" : "切换月计划";
		
		//重新绑定滚动事件
		$timeout(function(){
			$(".table-content").on("scroll", function () {
				$(this).parents(".j-table").find(".table-equipment-head>div").css("margin-top", -1 * $(this)[0].scrollTop + 1);
			});	
		},0);
		//广播$scope.hide_empty变化
		$scope.$broadcast('modelOrTrEmpty', $scope.isSmall);
	};

	//根据是否显示空白项来决定table表显示的数据
	function showTableByHide_empty() {
        //绑定view层
        if($scope.hide_empty){
            $rootScope.tableBodyData = $rootScope.cacheTableBodyData.filter(function (item) {
                return !item[0].useData.isEmpty;
            }).slice(0,$rootScope.pageIndex * $rootScope.pageNumber);
        }else{
            $rootScope.tableBodyData = $rootScope.cacheTableBodyData.slice(0,$rootScope.pageIndex * $rootScope.pageNumber);
        }
    }

    //滚动加载的参数,受大格子，小格子的影响
    $rootScope.pageIndex = 1;//初始页面
    $rootScope.pageNumber = $scope.isSmall ? 40 : 20;//每次加载的条数
    $scope.myPagingFunction = () => {
        //如果所有数据加载完，则不执行
        if($rootScope.pageIndex > ($rootScope.cacheTableBodyData.length / 20)){
            return;
        }
        $rootScope.pageIndex ++;

        showTableByHide_empty();//根据是否显示空白项来决定table表显示的数据
        $scope.$apply();
    };

	/**
	 * 隐藏空白行
	 **/
	$scope.hide_empty = true; //默认隐藏空白行
	$scope.hide_empty_text = $scope.hide_empty ? "显示空白行" : "隐藏空白行";
	$scope.hide_tr = function () {
		$scope.hide_empty = !$scope.hide_empty;
        $scope.hide_empty_text = $scope.hide_empty ? "显示空白行" : "隐藏空白行";

		//广播$scope.hide_empty变化
		$scope.$broadcast('modelOrTrEmpty', $scope.hide_empty);
		
        showTableByHide_empty();//根据是否显示空白项来决定table表显示的数据
	};
	
	/**
	 * 隐藏物料名
	 **/
	$scope.hide_materialName_text = $scope.materialName_hide ? "隐藏物料名" : "显示物料名";
	$scope.hide_materialName = function () {
		//提供一次提醒
		let thisUserId = sessionStorage.userId,
			userBlockedList = localStorage.userBlockedList ? localStorage.userBlockedList.split(",") : [];
		if(userBlockedList.indexOf(thisUserId) === -1){
			layer.msg("仅可显示按物料合并的设备！");
			localStorage.userBlockedList = userBlockedList.push(thisUserId);
		}
		$scope.materialName_hide = !$scope.materialName_hide;
		$scope.hide_materialName_text = $scope.materialName_hide ? "隐藏物料名" : "显示物料名";
	};

	/**
	 * 关闭校验
	 **/
	$scope.confirm_close = function () {
		$('.wrap-alert').hide(50);
		$('#progressbar_one').hide(50);
		$('.cover').hide(50);
		$(".check-btn-div").hide();

		$('.progress-label_one').text("校验中");
		$('.pbody-wrap').find("ul li").empty(); //清空上一次操作
	};

	/**
	 * 确认保存APS结果
	 **/
    $scope.save_aps = function () {
        //检测的进度条消失
        $(".cover").hide();
        $("#progressbar_one").hide();

        let saveLoading = layer.msg('保存中', {
            icon: 16,
            shade: 0.3,
            time: 3000
        });
        //点击开始保存按钮
        http.post({
            url: $rootScope.restful_api.aps_save,
            data: JSON.parse(sessionStorage.getItem("cancel_data")),
            successFn: function (response) {
                // $(".cover").show();
                if (response.data) {
                } else {
                    layer.alert("保存排程结果失败，返回参数错误,请联系技术人员处理");
                }
            },
            errorFn: function (response) {
                layer.alert("保存排程结果失败，请联系技术人员处理");
            }
        });
        //进度部分
        var i = 1; //循环次数
        var timeCount;
        function progress() {
            var progressVal = 0;
            var sUrl = $rootScope.restful_api.aps_rate_confirm + "?schemeId=" + sessionStorage.schemeId;
            http.get({
                url: sUrl,
                successFn: function (res) {
                    res = res.data;
                    //获取接口数据
                    progressVal = res.rate || 0;
                    if (progressVal || progressVal == 0) { //数据正确
                        timeCount = setTimeout(progress, 1000);
                        if (progressVal == 100) {
                            // debugger;
                            layer.close(saveLoading);
                            clearTimeout(timeCount);

                            // $timeout(function () {
                                $location.path("/preview");
                            // });

                        } else {
                            clearTimeout(timeCount);
                            layer.alert("保存失败！");
                        }
                        //如果时间超过1小时，停止加载 ，弹框提示
                        if (i > 3600) {
                            layer.alert("进度查询超时，请联系技术人员处理");
                            clearTimeout(timeCount);
                        }
                    } else { //如果数据错误
                        layer.alert("进度失败，请联系技术人员处理");
                        // $(".cover").hide();
                    }
                }
            });
            i++; //循环加一
        }
        setTimeout(progress, 1000); //开始加载
    };

	/**
	 * 改变地点重新获取基础数据(锁定期、显示天数、合并规则、默认翻转)
	 **/
	$scope.refreshBaseInfo = function () {

	};

	/**
	 * 记录跳转路径（仅限参配和帮助页面）
	 **/
	$scope.historyUrl = false;
	$scope.refreshHistoryUrl = function () {
        $scope.historyUrl = true;
		let oldHistoryUrl = sessionStorage.getItem("historyUrl") ? sessionStorage.getItem("historyUrl").split(",") : [];

		oldHistoryUrl.push($location.$$url);
		sessionStorage.setItem("historyUrl",oldHistoryUrl.join());
	};

	/**
	 * 点击返回,删除历史记录最后一条并跳转
	 **/
	$scope.historyUrlBack = function () {
		let oldHistoryUrl = sessionStorage.getItem("historyUrl"),
			lastUrl;

		if(oldHistoryUrl){
			oldHistoryUrl = oldHistoryUrl.split(",");
			lastUrl = oldHistoryUrl.pop().split("/");
			lastUrl.shift();
			lastUrl = lastUrl.join(".");
			sessionStorage.setItem("historyUrl",oldHistoryUrl);
		}else{
			lastUrl = "preview";
		}
		$state.go(lastUrl);
	};


	/**
	 * 左键单元格选中
	 **/
	//存储选中的单元格的信息
	$scope.checkBoxArray = [];
	$scope.check_this = function (cell, $event) {
		console.log("click");
		if (cell[0].type == 1) {
			return;
		}
		let thisEle = $($event.target),
			thisTd = thisEle.hasClass("table-td") ? thisEle : thisEle.parents(".table-td"),
			thisInfo = cell[0],
			equipmentInfo = thisInfo.equipment_id.split("_");
		//选中新增，取消选中移出
		if (thisTd.hasClass("table-td-check")) {
			$scope.checkBoxArray = $scope.checkBoxArray.filter(function (item) {
				return !(item.date == thisInfo.date && item.equipmentId == equipmentInfo[0] && item.equipmentType == equipmentInfo[1]);
			});
			thisTd.removeClass("table-td-check");
		} else {
			$scope.checkBoxArray.push({
				date: thisInfo.date,
				equipmentId: equipmentInfo[0],
				equipmentType: equipmentInfo[1],
				id_type: thisInfo.equipment_id,
				restTime : thisInfo.restTime
			});
			thisTd.addClass("table-td-check");
		}
		// console.log($scope.checkBoxArray);
	};
	
	/**
	 *desc:清除选中
	 *time:2017-05-16
	 **/
	$scope.clean_check = function(){
		$scope.checkBoxArray = [];
		$(".table-td-check").removeClass("table-td-check");
	}

	/**
	 *desc:点击左键出现的小目录
	 *time:2017-03-23
	 *@param: cell
	 *@param: event
	 *@param: page:"preview","result",判断是排程前页面还是排程后页面
	 *@return:
	 **/
	$scope.showRightClickSmallNav = function (cell, event, page) {
        $scope.rightClickNavShow = true;//是否显示右键小目录
		$scope.rightClickNavLiShow = {
			"workUnit": true, // 工作单元==二级新页面
			"changeEquipment": false, // 换装页面
			"equipmentDetails": false, //设备详情页面===手动微调页
			"movein": false, //微调移入日程
			"moveout": false, //微调移出日程
			"cleanCheck": false, //清除选中
			"taskList": true //任务清单
		};

        //先判断传入数据
        if(cell.thisDate){
            $scope.selectCellFront = cell;
			$scope.rightClickNavLiShow.taskList = false;
        }else{
            $scope.selectCellFront = cell.front;
        }
		
		//判断是否显示清除选中按钮
		if($scope.checkBoxArray.length){
			$scope.rightClickNavLiShow.cleanCheck = true;
		}

		//判断这个格子是否被选中
		if ($(event.target).hasClass("table-td-check") || $(event.target).parents(".table-td-check").length > 0) {
			$scope.rightClickNavLiShow.moveout = true;
			$scope.rightClickNavLiShow.movein = true;
		}

		//判断是否在暂存区里选择了未派工单
		if($(".cache-window input:checked").parents("tr").length === 0){
			$scope.rightClickNavLiShow.movein = false;
		}

		//判断是否点击设备表头，点击表头有换装选项
		if ($scope.selectCellFront[0] && $scope.selectCellFront[0].type == 1) {
			$scope.rightClickNavLiShow.changeEquipment = true;
		}
		// 手动微调页同时处于表格主体，有手动微调选项出现
		if (page === "result" && $scope.selectCellFront[0] && $scope.selectCellFront[0].type != 1) {
			$scope.rightClickNavLiShow.equipmentDetails = true;
		}

        //如果不正确，表示是表头，则为默认显示；如果是表格主体搜索状态下，如果格子为半透明状态（即不是搜索结果项），则小目录不显示,
		if(cell &&　cell.useData && cell.useData.opacity === 0.2){
            $scope.rightClickNavShow = false;
		}
		// $scope.rightClickNavShow = cell.useData.opacity ? cell.useData.opacity === 1 : true;

		//定位小目录出现的位置
		let navX = event.pageX + document.body.scrollLeft,
			navY = event.pageY + document.body.scrollTop;
		//限定不超出可视区
		$timeout(function(){
			const jLeftClickNav = $("#jLeftClickNav");
			if(jLeftClickNav.width() + navX > window.innerWidth){
				navX = window.innerWidth - jLeftClickNav.width();
			}
			if(jLeftClickNav.height() + navY > window.innerHeight){
				navY = window.innerHeight - jLeftClickNav.height();
			}
			jLeftClickNav.show().css({
				left: navX,
				top: navY
			});
		},0);
		event.stopPropagation();
	};
	
	/**
	 *desc:二级页面点击，优先显示，如果点击的是头部，开启位移
	 *time:2017-07-17
	 **/
	$scope.baseIndex = 20;
	$scope.isMove = false;
	$scope.priorityDisplay = function($event){
		let thisTarget = $($event.target),
			parentWindow = thisTarget.parents(".table-window") || thisTarget;

		$(".jMovable").css("z-index",$scope.baseIndex);
		parentWindow.css("z-index",$scope.baseIndex + 1);
		
		//如果点击的是头部
		if(thisTarget.hasClass("dialog-window-head") || thisTarget.parents(".dialog-window-head").length){
			//位移
			$(document).on("mousemove.windowmove",function(event){
				let moveX = event.originalEvent.movementX,
					moveY = event.originalEvent.movementY,
					oldPosition = parentWindow.css('transform').replace(/[^0-9\-,]/g,'');//获取的初始格式为matrix(1, 0, 0, 1, 0, -44)，后两个为translateX和translateY
				if(oldPosition){
					moveX = (parentWindow.offset().left + moveX > 0 && parentWindow.offset().left + parentWindow.outerWidth() + moveX < $(window).width()) ? oldPosition.split(",")[4] - 0 + moveX : oldPosition.split(",")[4];
					moveY = (parentWindow.offset().top + moveY > 0 && parentWindow.offset().top + parentWindow.outerHeight() + moveY < $(window).height()) ? oldPosition.split(",")[5] - 0 + moveY : oldPosition.split(",")[5];
				}
				//限制不可移出可视区
				
				parentWindow.css("transform","translate(" + moveX + "px," + moveY + "px)");
			});
			//结束位移
			$(document).on("mouseup.windowmove",function(event){
				$(document).off("mousemove.windowmove");
				$(document).off("mouseup.windowmove");
			});
		}
		$event.stopPropagation();
	};
	/**
	 *desc:结束位移
	 *time:2017-07-17
	 **/
	$scope.stopWindowMove = function(){
		$scope.isMove = false;
		$(document).off("mousemove.windowmove");
	};

	/**
	 *desc:位移中
	 *time:2017-07-17
	 **/
//	$scope.windowMove = function($event){
//		let thisTarget = $($event.target),
//			parentWindow = thisTarget.parents(".table-window") || thisTarget,
//			moveX = $event.movementX,
//			moveY = $event.movementY,
//			oldPosition = parentWindow.css('transform').replace(/[^0-9\-,]/g,'');//获取的初始格式为matrix(1, 0, 0, 1, 0, -44)，后两个为translateX和translateY
//		if(oldPosition){
//			moveX = oldPosition.split(",")[4] - 0 + moveX;
//			moveY = oldPosition.split(",")[5] - 0 + moveY;
//		}
//		parentWindow.css("transform","translate(" + moveX + "px," + moveY + "px)");
//		$event.stopPropagation();
//	};

    //获得查询框中产线数据
    $scope.getProductLineSelectedData = (event) => {
		let thisLi = $(event.target),
			newText = [];
        thisLi.toggleClass("active");
		thisLi.parent().find(".active").each(function(){
			newText.push($(this).text());
		});
		$scope.productLineSelectedData = newText.join();
    };

	//离开页面时保存AB测试信息
	//左右键点击次数
	$rootScope.clickTimes = {
		adjust:0,
		report:0
	};
	window.onbeforeunload = function(){
		if($rootScope.clickTimes.adjust > 0){
			http.post({
				url : $rootScope.restful_api.ABexperiment + "?op=adjust&num=" + $rootScope.clickTimes.adjust,
				successFn : function(res){},
				errorFn : 	function(res){}
			});
		}

		if($rootScope.clickTimes.report > 0){
			http.post({
				url : $rootScope.restful_api.ABexperiment + "?op=report&num=" + $rootScope.clickTimes.report,
				successFn : function(res){},
				errorFn : 	function(res){}
			});
		}
	}

	//右边栏弹出小提示
	$(function () {
		let removeActive = 0;
		$("body")
			//右边栏提示信息打开
			.on("mouseenter", ".right-menu-button", function () {
				//
				$(this).find(".tip").stop().show().animate({
					left: "-120px",
					opacity: "1"
				}, 300);
			})
			//右边栏提示信息关闭
			.on("mouseleave", ".right-menu-button", function () {
				$(this).find(".tip").hide().animate({
					left: "-220px",
					opacity: "0.3"
				}, 0)
			})
			//用户信息打开
			.on("mouseenter", ".user-info", function (e) {
				clearTimeout(removeActive);
				$(this).addClass("active");
			})
			//用户信息关闭
			.on("mouseleave", ".user-info", function () {
				var $this = $(this);
				removeActive = setTimeout(function () {
					$this.removeClass("active");
				}, 300)
			})
			//退出登录
			.on("click", ".out-login", function () {
				$.ajax({
					type: "post",
					url: loginOutUrl,
					data: {},
					dataType: "json",
					contentType: "application/json;charset=UTF-8",
					success: function (res) {
						if (res.success_response) {
							localStorage.removeItem("token");
							window.location.href = res.success_response.loginUrl;
						} else if (res.error_response && res.error_response.code === 1){
							window.location.href = res.error_response.sub_msg;
						} else {
							layer.alert('退出登录失败！', {
								skin: 'layer-alert-themecolor' //样式类名
							});
						}
					},
					error: function (res) {
						layer.alert('退出登录失败！', {
							skin: 'layer-alert-themecolor' //样式类名
						});
					},
					headers: {
						"X-Requested-With": "XMLHttpRequest",
						"redirectUrl": window.location.origin + window.location.pathname,
						"Authorization": localStorage.getItem("token") || ""
					}
				});
			})
			//打开和收起右边栏
			.on("click", ".right-menu-switch", function () {
				let thisPositionX = $(this).css("background-position-x");
				// if(!!window.ActiveXObject || "ActiveXObject" in window){
				// 	var thisPosition = $(this).css("background-position").split(" ");
				// 	thisPositionX = thisPosition[0];
				// }
				$(".right-menu").stop(false, false);
				if (thisPositionX === "0px") {
					//向右移动隐藏
					$(".right-menu").css("overflow", "hidden").animate({
						width: "0px"
					});
					$(this).css("background-position-x", "-24px");
				} else {
					$(".right-menu").css("overflow", "inherit").animate({
						width: "68px"
					});
					$(this).css("background-position-x", "0");
				}
			})
			//打开和收起左边栏
			.on("click", ".point-click", function () {
				let widDiv = $(".location-choose").width();
				if ($(this).hasClass("active")) {
					$(".point-click").removeClass("active");
					$(".out-bg").animate({
						width: "64px"
					}, 500);
					$(".location-choose").animate({
						left: "-" + widDiv + "px"
					}, 500);
				} else {
					$(".point-click").addClass("active");
					$(".out-bg").animate({
						width: widDiv
					}, 500);
					$(".location-choose").animate({
						left: 0
					}, 500);
				}
			})
			//打开右边栏搜索弹窗
			.on("click", ".search-btn", function (e) {
				if ($(this).hasClass("search-btn-click")) {
					$(".search-box").hide();
					$(this).removeClass("search-btn-click");
				} else {
					$(".search-box").show();
					$(".to-fact-box").hide();
					$(this).addClass("search-btn-click");
					$(".to-fact").removeClass("to-fact-click");
				}
				e.stopPropagation();
			})
			//打开预排转实际弹窗
			.on("click", ".to-fact", function (e) {
				if ($(this).hasClass("to-fact-click")) {
					$(".to-fact-box").hide();
					$(this).removeClass("to-fact-click");
				} else {
					$(".to-fact-box").show();
					$(".search-box").hide();
					$(this).addClass("to-fact-click");
					$(".search-btn").removeClass("search-btn-click");
				}
				e.stopPropagation();
			})
			//阻止冒泡
			.on("click", ".search-box,.to-fact-box,.layui-layer,.layui-layer-shade,.equipment-list,.equipment-input", function (e) {
				e.stopPropagation();
			})
			//全选全不选
			.on("click", "input[name='factPnameAll']", function () {
				let checkValue = $(this).is(':checked') ;
				if (checkValue === true) {
					$("input[name='factPnameSingle']").prop("checked", true);
				} else {
					$("input[name='factPnameSingle']").prop("checked", false);
				}
			})
			//复选框反选
			.on("click", "input[name='factPnameSingle']", function () {
				let  chsub  =  $("input[name='factPnameSingle']").length;
				let  checkedsub  =  $("input[name='factPnameSingle']:checked").length;
				if (chsub === checkedsub) {
					$("input[name='factPnameAll']").prop("checked", true);
				} else {
					$("input[name='factPnameAll']").prop("checked", false);
				}
			})
			//地点树点击
            .on("click", ".jleftLocationTree ul span", function () {
                if ($(this).next().find("li").length === 0) {
                    return;
                } else {
                    $(this).toggleClass("active").toggleClass("open");
                    $(this).next().toggle();
                }

                //改变按钮的位置
                $(".out-bg").width($(".location-choose").width());

                //设置前面线的高度
                let li = $(this).parent(),
                    index = li.index() + 1,
                    ul = li.parent(),
                    height = ul.height() - li.height(); //设置线的高度为ul的高度减去li的高度
                if (index === ul.children().length) {
                    ul.children("b").height(height + 50);
                } else {
                    ul.children("b").height("auto");
                }
            })
            .on("click", ".jleftLocationTree ul i", function () {
                //配置排程规则的一级地点单选，其他子级车间多选
                let locationTreeParentDiv = $(this).parent().parent().parent();//获取地点树一级地点的包裹div
                //判断是否为一级地点，如果为一级地点，表现为单选，将其他的车间取消选中
                if(locationTreeParentDiv.hasClass("location-list")){
                    $(this).parents(".location-tree-ul").siblings().find("i").attr("class", "select-status unselect");
                }
                //获取到点击元素的一级车间
                let firstLevelLocation = getFirstLevelParentLocation($(this));
                firstLevelLocation.siblings("ul").find("i").attr("class", "select-status unselect");
                //改变状态
                changeSelectStatus($(this));
            });

        //改变地点树状态方法
        function changeSelectStatus(thisSelect) {
            //本身及所有后代的改变
            if (!thisSelect.hasClass("active")) {
                thisSelect.attr("class", "select-status selected active");
                thisSelect.parent("li").find("ul i").attr("class", "select-status selected active");
            } else {
                thisSelect.attr("class", "select-status unselect");
                thisSelect.parent("li").find("ul i").attr("class", "select-status unselect");
            }
            //处于其影响范围内的祖先的改变
            thisSelect.parents("ul").each(function () {
                let thisTree = $(this);
                let thisStatus = thisTree.siblings(".select-status");
                if (thisTree.find(".selected").length < 1) {
                    thisStatus.attr("class", "select-status unselect");
                } else if (thisTree.find(".unselect").length < 1) {
                    thisStatus.attr("class", "select-status selected active");
                } else {
                    thisStatus.attr("class", "select-status select-some");
                }
            })
        }

        //当点击为二三级车间，不断向上获取当前点击车间的父级车间，直至最高级车间
        let getFirstLevelParentLocation = (elem) => {
            let parentElem = elem.parent();//获取选中元素的父元素
            if(parentElem.hasClass("location-list")){
                return elem;
            }else{
                return getFirstLevelParentLocation(parentElem);
            }
        };

		$(document)
			.on("click", function () {
				//隐藏搜索弹窗
				$(".search-box").hide();
				$(".search-btn").removeClass("search-btn-click");
				//隐藏预排转实际弹窗
				$(".to-fact-box").hide();
				$(".to-fact").removeClass("to-fact-click");
				//隐藏设备下拉框
				$(".equipment-list").remove();
				$(".table-dialog-window .equipment-input").css("border", "1px solid #DEDEDE");
				//隐藏点击左键出现的目录
				$("#jLeftClickNav").hide();
			})
			.on("mousedown", function () {
				//表格滚动
				$(".table-content").on("scroll", function () {
					$(this).parents(".j-table").find(".table-equipment-head div").eq(0).css("margin-top", -1 * $(this)[0].scrollTop + 1);
				});

			});

        //所有一级页面全屏显示代码
        $scope.fixedDisplay = function () {
//            $(".header,.right-menu-switch,.out-bg,.right-menu,.page-select").hide();
			$scope.full_screen = true;
            $(".pbody-wrap").addClass("jFixed");
            $rootScope.tableBodyData = $rootScope.cacheTableBodyData;
            layer.msg("<p style='padding: 0 20px;'>按 &nbsp;&nbsp;<img style='vertical-align: -11px' src='./images/esc.png' alt=''> &nbsp;&nbsp;键退出全屏模式</p>", {
                anim: 0,
            });
			//广播$scope.full_screen变化
			$scope.$broadcast('fullScreen', $scope.full_screen);
        };

        $("body").keydown(function (e){
            if (e.which === 27) {
                $(".jFixed").removeClass("jFixed");
//                $(".header,.right-menu-switch,.out-bg,.right-menu,.page-select").show();
				$scope.full_screen = false;
				//广播$scope.full_screen变化
				$scope.$broadcast('fullScreen', $scope.full_screen);
                $timeout(function () {
                    $rootScope.tableBodyData = $rootScope.cacheTableBodyData.slice(0,$rootScope.pageIndex * $rootScope.pageNumber);
                })
            }
        })
	});

    /*************=========================拖拽项目排序js=========================*************/
    let $id = function (element) {
        return typeof element === "string" ? document.getElementById(element) : element;
    };
    let $find = function (parent, nodeName) {
        return parent.getElementsByTagName(nodeName);
    };
//拖拽项目类
    function DragNewItem() {
        this.init.apply(this, arguments);
    }

//拖拽项目原型
    DragNewItem.prototype = {
        _downX: 0,//鼠标按下时的x坐标
        _downY: 0,//鼠标按下时的y坐标
        _moveX: 0,//鼠标移动时的x坐标
        _moveY: 0,//鼠标移动时的y坐标
        _index: 0,//移动图标的下标
        //初始化方法
        init: function (mainDivId, myAppId, otherAppId, config) {
            this.mainDiv = $id(mainDivId);//获取最外面的div
            this.myApp = $id(myAppId);//获取第一个div
            this.otherApp = $id(otherAppId);//获取第二个div
            this.repeatTransfer();
            this.addItem().removeItem();
        },
        //局部刷新页面时每次需要重复确认操作的区域
        repeatTransfer : function(){
            this._OnApp(this.mainDiv);
            this._moveApp(this.myApp, this.otherApp);
            this._moveApp(this.otherApp, this.myApp);
            //
        },
        //鼠标移入移出图标
        _OnApp: function (mainDiv) {
            let _this = this;
            //鼠标移入可以移动的li时，加一个出现虚线的class
            mainDiv.onmouseover = function (event) {
                let e = event || window.event;//获取鼠标
                let t = e.target || e.srcElement;//获取鼠标触发源
                if (t.nodeName.toLowerCase === "li") {
                    _this.addClass(t, "js-liBorderStyle");
                } else if (t.parentNode.nodeName.toLowerCase() === "li") {
                    _this.addClass(t.parentNode, "js-liBorderStyle")
                }
            };
            //鼠标移出可以移动的li时，移除一个出现虚线的lcas
            mainDiv.onmouseout = function (event) {
                let e = event || window.event;//获取鼠标
                let t = e.target || e.srcElement;//获取鼠标触发源
                if (t.nodeName.toLowerCase === "li") {
                    _this.removeClass(t, "js-liBorderStyle");
                } else if (t.parentNode.nodeName.toLowerCase() === "li") {
                    _this.removeClass(t.parentNode, "js-liBorderStyle")
                }
            }
        },
        //拖动鼠标改变位置
        _moveApp: function (dragUl, otherUl) {
            let _this = this;
            dragUl.onmousedown = function () {
                let e = event || window.event;//获取鼠标
                let t = e.target || e.srcElement;//获取鼠标触发源
                _this.liList = [];//class不是js-liBorderStyle的li元素集合
                if (t.nodeName.toLowerCase() === "div" && t.className !== "appDiv") {
                    let oLi = t.parentNode;
                    let oCopyLi = oLi.cloneNode(true);
                    let scrollTop = $(t).parents("nav").scrollTop();
                    let oNewLi = oCopyLi.cloneNode(true);
                    _this.removeClass(oNewLi, "js-liBorderStyle");
                    _this.removeClass(oNewLi, "js-move");
                    //oNewLi.innerHTML = oCopyLi.innerHTML;
                    //                    var oSpan = $find(oCopyLi,"span")[0];

                    document.body.appendChild(oCopyLi);
                    _this.addClass(oCopyLi, "js-newLi");
                    //                    oSpan.style.display = "none";
                    oCopyLi.style.left = _this.offset(oLi).left + "px";
                    oCopyLi.style.top = _this.offset(oLi).top + "px";

                    oLi.parentNode.replaceChild(oNewLi, oLi);//新创建的li替代原来的li
                    _this.addClass(oNewLi, "js-liBorderStyle");

                    _this._downX = e.clientX;
                    _this._downY = e.clientY;
                    _this._offsetLeft = oCopyLi.offsetLeft;//鼠标按下时获取新生成的虚线li的坐标left
                    _this._offsetTop = oCopyLi.offsetTop;//鼠标按下时获取新生成的虚线li的坐标top

                    _this._liList = $find(_this.mainDiv, "li");//获取要拖拽下的ul里的所有li
                    for (let i = 0, length = _this._liList.length; i < length; i++) {
                        let li = _this._liList[i];
                        if (li.className !== "js-liBorderStyle") {//获取到class不是js-liBorderStyle的li
                            _this.liList.push(li);
                        }
                    }
                    //鼠标按下时移动图标的位置
                    _this.getAppLocation(_this._offsetLeft + 80, _this._offsetTop + 80);


                    document.onmousemove = function (event) {
                        let e = event || window.event;//获取鼠标
                        let t = e.target || e.srcElement;//获取鼠标触发源
                        let _X = e.clientX, _Y = e.clientY;//获取鼠标的坐标值
                        let _mLeft = _this._offsetLeft + _X - _this._downX,//获取图标移动时每一次坐标值
                            _mTop = _this._offsetTop + _Y - _this._downY;
                        let oSize = _this._overBorder(_mLeft, _mTop);//获取每次移动经过判断后（是否超过box范围）的坐标
                        _mLeft = oSize.left ? oSize.left : _mLeft;
                        _mTop = oSize.top ? oSize.top : _mTop;
                        oCopyLi.style.left = _mLeft + "px";
                        oCopyLi.style.top = _mTop - scrollTop + "px";
                        let index = _this.getAppLocation(_mLeft, _mTop);//？？获取需要插入的li的下标
                        _this._insertApp(_X, _Y, _this.liList[index], oNewLi, _this.myApp, _this.otherApp);
                        _this._insertApp(_X, _Y, _this.liList[index], oNewLi, _this.myApp, _this.otherApp);
                    };
                    document.onmouseup = function (event) {
                        let e = event || window.event;//获取鼠标
                        let t = e.target || e.srcElement;//获取鼠标触发源
                        let left = _this.offset(oNewLi).left;
                        let top = _this.offset(oNewLi).top;
                        //                        var oSpan2;
                        _this.animate(oCopyLi, {left: left, top: top}, 100, function () {
                            document.body.removeChild(oCopyLi);
                            oNewLi.innerHTML = oCopyLi.innerHTML;
                            _this.removeClass(oNewLi, "js-liBorderStyle");
                            _this.addClass(oNewLi, "js-move");
                            //修改bug，清楚暴力乱移时出现在页面上的元素
                            $("body").children(".js-liBorderStyle").remove();
                            $(".js-liBorderStyle").removeClass("js-liBorderStyle");
                        });
                        document.onmousemove = null;
                        document.onmouseup = null;
                    }
                }
            }
        },
        //添加class
        addClass: function (node, className) {
            if (!node.className) {
                node.className = className;
            } else {
                node.className += " " + className;
            }
        },
        //删除class
        removeClass: function (node, className) {
            var string = node.className;
            if (string.indexOf(className) > 0) {
                node.className = string.replace(" " + className, "");
            } else if (string.indexOf(className) === 0) {//判断class是否在第一个class，进行删除
                if (string.indexOf(" ") < 0) {
                    node.className = string.replace(className, "");
                } else {
                    node.className = string.replace(className + "", "");
                }
            } else {
                return;
            }
        },
        //元素在文档中的位置
        offset: function (obj) {
            let _offset = {};
            let node = $id(obj);
            let left = node.offsetLeft;
            let top = node.offsetTop;
            let parent = node.offsetParent;
            //不断向上获取父元素的offsetLeft，知道获取到与页面的距离
            while (parent != null) {
                left += parent.offsetLeft;
                top += parent.offsetTop;
                parent = parent.offsetParent;
            }
            _offset.left = left;
            //!!!!!配置页减去对应的滚动条距离
            _offset.top = top -  $(".config-content").scrollTop();
            return _offset;
        },
        //计算移动图标所处的位置
        getAppLocation: function (x, y) {
            let liList = this.liList;
            let liW = liList[0].offsetWidth;//
            let liH = liList[0].offsetHeight;//
            for (let i = 0, length = liList.length; i < length; i++) {
                let li = liList[i], left = this.offset(li).left, top = this.offset(li).top;
                if ((x > left - liW && x < left + liW) && (y > top - liH && y < top + liH)) {
                    this._index = i;
                    break;
                }
            }
            return this._index;
        },
        //图标超出边界处理
        _overBorder: function (left, top) {
            let x = 0, y = 0, mainDiv = this.mainDiv, oSize = {};
            let mainDivLeft = this.offset(document.getElementById("all-item")).left;//因为绝对定位的原因，所有需要通过获取点击按钮的offsetLeft计算出来offsetLeft
            let mainDivTop = this.offset(document.getElementById("all-item")).top;
            if (left < mainDivLeft) {
                x = mainDivLeft
            }
            if (left > mainDivLeft + mainDiv.offsetWidth) {
                x = mainDivLeft + mainDiv.offsetWidth;
            }
            if (top < mainDivTop) {
                y = mainDivTop
            }
            if (top > mainDivTop + mainDiv.offsetHeight) {
                y = mainDivTop + mainDiv.offsetHeight
            }
            oSize.left = x;
            oSize.top = y;
            return oSize;
        },
        //边框随鼠标移动改变位置,然后选择插入到哪个li后面
        _insertApp: function (x, y, oldElement, newElement,my, other) {
            let parent;
            let liList = $id(parent, "li");
            let selectX =  this.offset(document.getElementsByClassName("middleBtn")[0]).left;
            ///此段代码中的x大雨的值不同环境需要计算
            if (x > selectX) {
                parent = other;
            } else {
                parent = my;
            }
            //console.log(this.offset(parent).top - $(".config-content").scrollTop());
            if (y > this.offset(parent).top && y < this.offset(parent).top + parent.offsetHeight) {
                try {
                    parent.insertBefore(newElement, oldElement);
                } catch (error) {
                    parent.appendChild(newElement)
                }
            } else {
                parent.appendChild(newElement)
            }
        },
        //动画方法，
        animate: function (obj, params, time, handler) {
            let node = $id(obj), handlerFlag = true, _style = node.currentStyle ? node.currentStyle : window.getComputedStyle(node, null);
            time = document.all ? time * 0.6 : time * 0.9;
            for (let p in params) {
                (function (n) {
                    n = p;
                    if (n === "left" || n === "top") {
                        let _old = parseInt(_style[n]), _new = parseInt(params[n]), _length = 0, _tt = 10;
                        if (!isNaN(_old)) {
                            let count = _old, length = _old <= _new ? (_new - _old) : (_old - _new), speed = length / time * _tt, flag = 0;
                            let anim = setInterval(function () {
                                node.style[n] = count + "px";
                                count = _old <= _new ? count + speed : count - speed;
                                flag += _tt;
                                if (flag >= time) {
                                    node.style[n] = _new + "px";
                                    clearInterval(anim);
                                }
                            }, _tt);
                        }
                    }
                })(p);
            }

            let timeHandler = setTimeout(function () {
                if (handler && typeof handler === "function") {
                    handler();
                    clearTimeout(timeHandler);
                }
            }, time + 100);
        },
        //一次性添加所㓟可排序字段
        addItem: function () {
            $("body").on("click", ".addAllItem", function () {
                let elem = $("#provide-item li");
                for (let i = 0; i < elem.length; i++) {
                    let cloneElem = $(elem[i]).clone().addClass("js-move");
                    $(".sort-item ul").append(cloneElem);
                    elem.remove();
                }
            });
            return this;
        },
        //一次性移除所有已排序字段
        removeItem: function () {
            $("body").on("click", ".removeAllItem", function () {
                let elem = $("#sort-item li");
                for (let i = 0; i < elem.length; i++) {
                    let cloneElem = $(elem[i]).clone().addClass("js-move");
                    $(".provide-item ul").append(cloneElem);
                    elem.remove();
                }
            });
            return this;
        }
        //决定单个项目中的升序和降序
    };


});
