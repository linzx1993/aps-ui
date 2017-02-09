webpackJsonp([5,7],[
/* 0 */
/***/ function(module, exports) {

	"use strict";

	/**
	 * Created by xujun on 2016/7/1.
	 */
	app.controller('progressCtrl', function ($scope, $rootScope, $interval, $location, $http, $timeout, tool) {
		//用户名
		$scope.userName = $rootScope.userName;
		tool.newprogressBar("#progressbar", "#progress-label", $rootScope.restful_api.aps_rate + "?schemeId=" + sessionStorage.schemeId, "自动排程", function () {
			$scope.failAlert = false;
			$scope.successAlert = true;
			$timeout(function () {
				var lastText = $(".pbody-wrap .wrap-info ul").find("li:last-child").find("span").eq(1).text();
				if (lastText == "自动排程完成") {
					$(".pbody-wrap .wrap-info ul").find("li:last-child").find(".in-state-icon-success").show();
				} else if (lastText == "自动排程失败") {
					$(".pbody-wrap .wrap-info ul").find("li:last-child").find(".in-state-icon-fail").show();
				}
				// 遍历
				$(".pbody-wrap .wrap-info ul").find("li").each(function () {
					var stateText = $(this).find("span").eq(1).text();
					if (stateText == "自动排程失败") {
						$scope.failAlert = true;
						$scope.successAlert = false;
					}
				});
			}, 50);
			$scope.btnShow = true;
		}, function (res) {
			var mapState = res.mapState;
			var listState = []; //定义数组
			for (var i in mapState) {
				mapState[i].equipment = i; //定义键名称
				listState.push(mapState[i]); //把遍历对象存入数组中

				$timeout(function () {
					for (var j = 0; j < listState.length; j++) {

						switch (listState[j].state) {
							case "INIT":
								return listState[j].state = "准备";break;
							case "LOADING":
								return listState[j].state = "加载数据";break;
							case "SYSTEM_CONFIG_CHECKING":
								return listState[j].state = "系统配置校验";break;
							case "SCHEDULE_STEP_CHECKING":
								return listState[j].state = "排程步骤校验";break;
							case "MATERIAL_INFO_CHECKING":
								return listState[j].state = "物料信息校验";break;
							case "ROUTING_INFO_CHECKING":
								return listState[j].state = "工艺路线信息校验";break;
							case "CAPABILITY_INFO_CHECKING":
								return listState[j].state = "产能校验";break;
							case "COLOR_INFO_CHECKING":
								return listState[j].state = "颜色信息校验";break;
							case "SUITABLE_PRODUCT_INFO_CHECKING":
								return listState[j].state = "适宜设备校验";break;
							case "CT_INFO_CHECKIN":
								return listState[j].state = "刀具信息校验";break;
							case "FIXTURE_INFO_CHECKING":
								return listState[j].state = "夹具信息校验";break;
							case "PAP_INFO_CHECKING":
								return listState[j].state = "PAP信息校验";break;
							case "SCHEDULING":
								return listState[j].state = "排程中";break;
							case "UPLOADING":
								return listState[j].state = "排程中";break;
							case "AUTOSCH_SUCCESS":
								return listState[j].state = "自动排程完成";break;
							case "AUTOSCH_FAILED":
								return listState[j].state = "自动排程失败";break;
							case "ADJUSTING":
								return listState[j].state = "微调中";break;
							case "CONFIRMSCH_DOING":
								return listState[j].state = "排程确认中";break;
							case "CONFIRMSCH_SUCCESS":
								return listState[j].state = "排程确认成功";break;
							case "CONFIRMSCH_FAILED":
								return listState[j].state = "排程确认失败";break;
						}
						if (listState[j].state == "自动排程完成") {
							listState[j].icons = true;
						}

						$(".pbody-wrap .wrap-info ul").find("li").each(function () {
							var stateText = $(this).find("span").eq(1).text();
							if (stateText == "自动排程完成") {
								$(this).find(".in-state-icon-success").show();
							} else if (stateText == "自动排程失败") {
								$(this).find(".in-state-icon-fail").show();
							}
						});
					}
				}, 0);
			}
			$scope.states = listState;
			console.log(listState);
		}, $location.$$absUrl);
		//提示信息操作
		var ele = $(".wrap-content");
		ele.on("click", "b", function () {
			$(this).next("p").toggle().next("i").toggle();
			$(this).parent().siblings().find("p").hide().end().find("i").hide();
		});

		$(".prompt_msg i").click(function () {
			$(".prompt_msg").hide();
			$(".pbody-wrap .wrap-info li b").removeClass("click-detail");
		});
		//按钮
		$scope.wrap_back = function () {
			$location.path("/preview");
		};
		$scope.wrap_forward = function () {
			$location.path("/result");
		};
		//提示
		$scope.alertMsg = function (x, $event) {
			$event.stopPropagation();
			var briefInfoMap = x.briefInfoMap;
			$scope.doTaskNum = briefInfoMap.doTaskNum;
			$scope.undoTaskNum = briefInfoMap.undoTaskNum;
			$scope.totalTaskNum = briefInfoMap.totalTaskNum;
			$scope.useTime = briefInfoMap.useTime;

			$(".pbody-wrap .wrap-info li b").removeClass("click-detail");
			$($event.target).addClass("click-detail");

			$(".prompt_msg").show(0, function () {
				//			var d_left = $($event.target).offset().left + 56;
				//			var d_top = $($event.target).offset().top - 71;
				var body = $("body");
				var scrollTop = $(document).scrollTop(),
				    scrollLeft = $(document).scrollLeft();
				var d_left = $($event.target).offset().left + 56 + scrollLeft;
				var d_top = $($event.target).offset().top - 71 + scrollTop;
				var targetHeight = $($event.target).css("top").split("px");
				var targetParentHeight = $($event.target).parent().parent().parent().css("top").split("px");
				$(".prompt_msg").css({
					"left": d_left,
					"top": d_top > document.body.clientHeight - 100 ? document.body.clientHeight - 100 : d_top
				});
			});
			//		var msgLayer = layer.open({
			//          type: 1,
			//          title: "提示信息",
			//          shadeClose: true,
			//          skin: 'yourclass',
			//          content : $("#prompt_msg"),
			//          success : function(){
			//              // 272是显示框正常宽度，450是高度
			//              $(".layui-layer").css({
			//                    "left" : $event.pageX - 152,
			//                    "top" : $event.pageY >(document.body.clientHeight - 450) ? document.body.clientHeight - 450 : $event.pageY
			//              })
			//              $("#prompt_msg").on("click",".sure",function(){
			//                    layer.close(msgLayer);
			//              })
			//            }
			//      })
		};
	});

/***/ }
]);