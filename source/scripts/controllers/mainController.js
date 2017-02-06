/**
 * Created by duww on 2017/1/9.
 */
app.controller('mainCtrl', function($scope, $rootScope, $http, $window, $location, $interval,$timeout,$q,scheduleTableViewModelService,tool) {
	/**
	 * 翻转
	 **/
	$scope.turn_to_back = function(){
		//判断往那边转
		var thisOpacity = 1;
		if($rootScope.frontBack){
			$rootScope.frontBack = false;
			thisOpacity = 0;
		}else{
			$rootScope.frontBack = true;
		}

		$(".table-tr").each(function(a){
			var thisTr = $(this),
				TdList = thisTr.find(".table-td");
			TdList.each(function(index){

				if(index == 0){
					return;
				}else{
					var thisTd = $(this),
						thisFront = thisTd.find(".td-front"),
						thisBack = thisTd.find(".td-back"),
						ry = 0,
						by = 0;

					//连点终止之前的动画。
					thisFront.stop(false,false);

					//调用jquery动画函数
					thisFront.animate({opacity:thisOpacity},{
						step: function(n){
							ry = (1-n)*180;
							by = n*180;
							$(this).css("transform","rotateY("+ry+"deg)");
							thisBack.css("opacity",1-n);
							thisBack.css("transform","rotateY("+by+"deg)");
						},
						duration:500,
					});
				}
			})
		});
	}
	
	/**
	 * 隐藏空白行
	 **/
	$scope.hide_tr = function(){
		$scope.hide_empty = !$scope.hide_empty;
	}
	
	/**
	 * 关闭校验
	 **/
	$scope.confirm_close=function(){
		$('.wrap-alert').hide(50);
		$('#progressbar_one').hide(50);
		$('.cover').hide(50);
		
		$('.progress-label_one').text("校验中");
		$('.pbody-wrap').find("ul li").empty();   //清空上一次操作
	}
	
	/**
	 * 确认保存APS结果
	 **/
    $scope.save_aps = function(){
    	var progressbar = $("#progressbar_one"),
			progressLabel = $("#progress-label_one");
		progressLabel.text("保存 0%");
        if($rootScope.local_test){
            /**
             * 本地测试方法
             */
            $location.path("/preview").replace();
        }else{
            var sta = false;   //状态变量
            //点击开始保存按钮
            $http.post($rootScope.restful_api.aps_save, JSON.parse(sessionStorage.getItem("cancel_data"))).then(
                //成功
                function(response){
                	 $(".cover").show();
                    if(response.data){ 
                        sta = true;
                    }else{
                        layer.alert("保存排程结果失败，返回参数错误,请联系技术人员处理");
                    }
                },
                //失败
                function(response){
                    layer.alert("保存排程结果失败，请联系技术人员处理");
                    progressbar.hide();
                    $(".cover").hide();
                }
            );
			//进度部分         
			$(function(){
			 	var i=1;    //循环次数
			    function progress(){							
					var progressVal = 0;
					var sUrl=$rootScope.restful_api.aps_rate_confirm+"?schemeId="+sessionStorage.schemeId;
					$http.get(sUrl).success(function(res){
						//获取接口数据
						progressVal = res.rate || 0;
						progressbar.children("span").css("width", progressVal + "%");
						progressLabel.text("保存"+" "+progressVal + "%");
						if(progressVal){    //数据正确
		        			var j=setTimeout(progress, 1000);
		        			if(sta){
								progressbar.children("span").css("width","100%");
								progressLabel.text( "保存完成" );
								progressbar.hide(20);
								clearTimeout(j);
								$(".cover").hide();
								$location.path("/preview");
							}else{
								clearTimeout(j);
								progressbar.hide(20);
								layer.alert("保存失败！");
								$(".cover").hide();
							}
							//如果时间超过1小时，停止加载 ，弹框提示
							if(i > 3600){
								layer.alert("进度失败，请联系技术人员处理");
								clearTimeout(j);
								progressbar.hide(20);   
								$(".cover").hide();            	
					    	}
		      			}else{         //如果数据错误		      					      				
		      				layer.alert("进度失败，请联系技术人员处理");
		      				$(".cover").hide();
		      				progressbar.hide(20);   //进度条加载完成后隐藏
		      			}
					});
					i++;   //循环加一
				}	    		
			    setTimeout( progress,1000);	 //开始加载
			})	
        }
   }
	
	
	//右边栏弹出小提示	
	$(function(){
		var removeActive = 0;
		$("body")
			//右边栏提示信息打开
			.on("mouseenter",".right-menu-button",function(){
				//
				$(this).find(".tip").stop().show().animate({
					left:"-120px",
					opacity:"1"
				},300);
			})
			//右边栏提示信息关闭
			.on("mouseleave",".right-menu-button",function(){
				$(this).find(".tip").hide().animate({
					left:"-220px",
					opacity:"0.3"
				},0)
			})
			//用户信息打开
			.on("mouseenter",".user-info",function(e){
				clearTimeout(removeActive);
				$(this).addClass("active");
			})
			//用户信息关闭
			.on("mouseleave",".user-info",function(){
				var $this = $(this);
				removeActive = setTimeout(function(){
					$this.removeClass("active");
				},300)
			})
			//退出登录
			.on("click",".out-login",function(){
				$.ajax({
					type:"post",
					url:loginOutUrl,
					data:{},
					dataType:"json",
					contentType:"application/json;charset=UTF-8",	
					success:function(res){
						if(res.success_response){
							localStorage.removeItem("token");
							window.location.href = res.success_response.loginUrl;
						}else{
							layer.alert('退出登录失败！', {
								skin: 'layer-alert-themecolor' //样式类名
							});
						}
					},
					error:function(res){
						layer.alert('退出登录失败！', {
							skin: 'layer-alert-themecolor' //样式类名
						});
					},	
					headers:{
						"X-Requested-With":"XMLHttpRequest",
						"redirectUrl":window.location.origin + window.location.pathname,
						"Authorization":localStorage.getItem("token")||""
					}
				});		
			})
			//打开和收起右边栏
			.on("click",".right-menu-switch",function(){
				thisPositionX = $(this).css("background-position-x");
				if(!!window.ActiveXObject || "ActiveXObject" in window){
					var thisPosition = $(this).css("background-position").split(" ");
					thisPositionX = thisPosition[0];
				}
				$(".right-menu").stop(false,false);
				if(thisPositionX == "0px"){
					//向右移动隐藏
					$(".right-menu").css("overflow","hidden").animate({width:"0px"});
					$(this).css("background-position-x","-24px");
				}else{
					$(".right-menu").css("overflow","inherit").animate({width:"68px"});
					$(this).css("background-position-x","0");
				}
			})
			//后退
			.on("click",".page-back",function(){
				history.back();
			})
			//打开和收起左边栏
			.on("click",".point-click",function(){
				var widDiv=$(".location-choose").width();
				if($(this).css("background-position") == "-24px 0px"){
					$(".location-choose").animate({left:"-"+widDiv},500);
					$(this).css("background-position","0px 0px");
					$(".out-bg").animate({width:"64px"},500);
				}else{
					$(".location-choose").animate({left:"0px"},500);
					$(this).css("background-position","-24px 0px");
					$(".out-bg").animate({width:widDiv},500);
				}
			})
			//打开右边栏搜索弹窗
			.on("click",".search-btn",function(e){
				if($(this).hasClass("search-btn-click")) {
					$(".search-box").hide();
					$(this).removeClass("search-btn-click");
				}else{
					$(".search-box").show();
					$(".to-fact-box").hide();
					$(this).addClass("search-btn-click");
					$(".to-fact").removeClass("to-fact-click");
				}
				e.stopPropagation();
			})			
			//打开预排转实际弹窗
			.on("click",".to-fact",function(e){
				if($(this).hasClass("to-fact-click")) {
					$(".to-fact-box").hide();
					$(this).removeClass("to-fact-click");
				}else{
					$(".to-fact-box").show();
					$(".search-box").hide();
					$(this).addClass("to-fact-click");
					$(".search-btn").removeClass("search-btn-click");
				}
				e.stopPropagation();
			})
			//阻止冒泡
			.on("click",".search-box,.to-fact-box,.layui-layer,.layui-layer-shade,.equipment-list,.equipment-input",function(e){
				e.stopPropagation();
			})
			//全选全不选
			.on("click","input[name='factPnameAll']",function(){
				var checkValue = $(this).is(':checked') ;
				if(checkValue == true){
					$("input[name='factPnameSingle']").prop("checked",true);
				}else{
					$("input[name='factPnameSingle']").prop("checked",false);
				}
			})
			//复选框反选
			.on("click","input[name='factPnameSingle']",function(){
				var chsub = $("input[name='factPnameSingle']").length;
				var checkedsub = $("input[name='factPnameSingle']:checked").length;
				if(chsub == checkedsub){
					$("input[name='factPnameAll']").prop("checked",true);
				}else{
					$("input[name='factPnameAll']").prop("checked",false);
				}
			})
			//确认保存校验弹窗确定按钮
			.on("click",".check-confirm",function(){
				$scope.save_aps();
//				$("#progressbar_one").show();
				$(".wrap-alert").hide(50);
//				$("#progressbar_one").hide();
				$(".cover").hide();
				
				//重置为初始状态
				$(".progress-label_one").text("校验中");
				$('.pbody-wrap').find("ul li").empty();
			})
			//确认保存校验弹窗取消按钮		
			.on("click",".check-cancel",function(){
				$scope.confirm_close();
			});
			
		
		$(document).on("click",function(){
			//表格滚动
			$(".table-content").on("scroll",function(){
			    $(".table-head").children().css("margin-left",-1*$(this)[0].scrollLeft);
			});
			//隐藏搜索弹窗
			$(".search-box").hide();
			$(".search-btn").removeClass("search-btn-click");
			//隐藏预排转实际弹窗
			$(".to-fact-box").hide();
			$(".to-fact").removeClass("to-fact-click");
			//隐藏设备下拉框
			$(".equipment-list").remove();
			$(".table-dialog-window .equipment-input").css("border","1px solid #DEDEDE");
		});
	});
	
	

})
