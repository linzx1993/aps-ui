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
						isFront = thisTd.hasClass("table-td-front"),
						thisOpacity = isFront ? 0 : 1,
						ry = 0,
						by = 0;
					
					thisTd.toggleClass("table-td-front");

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
	};

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

	/**
	 * desc : 分页加载
	 */
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
	};

	/**
	 *desc:点击左键出现的小目录
	 *time:2017-03-23
	 *@param: cell
	 *@param: event
	 *@param: page:"preview","result",判断是排程前页面还是排程后页面
	 *@return:
	 **/
	$scope.cacheInfo = [];
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
		if($scope.cacheInfo.length === 0){
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
				//不可选中
				$("body").css("user-select","none");
			});
			//结束位移
			$(document).on("mouseup.windowmove",function(event){
				$("body").css("user-select","auto");
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
	};

	//退出登录
	$scope.loginOut = function () {
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
	};

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
			//打开和收起右边栏
			.on("click", ".right-menu-switch", function () {
				let thisPositionX = $(this).css("background-position-x");
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
				} else {
					$(".search-box").show();
					$(this).addClass("search-btn-click");
				}
			})
			.on("click", ".search-box .close", function (e) {
				$(".search-btn").removeClass("search-btn-click");
				$(".search-box").hide();
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
			.on("click", ".to-fact-box,.layui-layer-shade", function (e) {
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
            .on("click", ".jleftLocationTree ul .tree-item", function () {
                if ($(this).siblings(".location-tree-ul").find("li").length === 0) {
                    return;
                } else {
                    $(this).toggleClass("active").toggleClass("open");
                    $(this).siblings(".location-tree-ul").toggle();
                }

                //改变按钮的位置
                $(".out-bg").width($(".location-choose").width());

            })
            .on("click", ".jleftLocationTree ul .select-status", function () {
                //配置排程规则的一级地点单选，其他子级车间多选
                let locationTreeParentDiv = $(this).parent().parent().parent();//获取地点树一级地点的包裹div
                //判断是否为一级地点，如果为一级地点，表现为单选，将其他的车间取消选中
                if(locationTreeParentDiv.hasClass("location-list")){
                    $(this).parents(".location-tree-ul").siblings().find("i").attr("class", "select-status unselect");
                }
                //获取到点击元素的一级车间
                let firstLevelLocation = getFirstLevelParentLocation($(this));
                firstLevelLocation.siblings("ul").find("i").attr("class", "select-status unselect");
                //改变点击地点的状态
                changeSelectStatus($(this));
            });

		$(document)
			.on("click", function () {
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

        function changeSelectStatus(thisSelect) {
            //本身及所有后代的改变
            if (!thisSelect.hasClass("active")) {
                thisSelect.parent("li").find(".select-status").attr("class", "select-status selected active");
            } else {
                thisSelect.parent("li").find(".select-status").attr("class", "select-status unselect");
            }
            //然后向上寻找所有的父元素判断是否需要改变状态
            thisSelect.parents("ul").each(function () {
                let thisTree = $(this);
                let thisStatus = thisTree.siblings(".select-status");
                //如果一个选中的(".selected")都没有
                if (thisTree.find(".selected").length < 1) {
                    thisStatus.attr("class", "select-status unselect");
                } else if (thisTree.find(".unselect").length < 1) {
					//如果一个未选中的(".unselect")都没有
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

		/************==============合并项==============***********/
		$(".page-wrapper")
		//点击出现下拉框
			.on("click",".combine-menu",function(e){
				$(this).addClass("active");
				$(this).children(".combine-drag").addClass("drag");
				e.stopPropagation();
				$(this).find("li").click(function(){
					$(".combine-menu").removeClass("active");
					$(".combine-menu").children("ul").removeClass("drag");
				})
			})
			//移出下拉框小时
			.on("mouseleave",".combine-menu",function(e){
				$(this).removeClass("active");
				$(this).children("ul").removeClass("drag");
			});

		/******************/
	});



});
