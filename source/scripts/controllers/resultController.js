/**
 * Created by xujun on 2016/7/1.
 */
app.directive('ngRightClick', function($parse) {
	return function(scope, element, attrs) {
		var fn = $parse(attrs.ngRightClick);
		element.bind('contextmenu', function(event) {
			scope.$apply(function() {
				event.preventDefault();
				fn(scope, {$event:event});
			});
		});
	};
});
app.controller('resultCtrl', function($scope, $rootScope, $http, $window, $location, $interval,$timeout,$q,scheduleTableViewModelService) {
		$(".table-dialog-window").hide();
		$(".cache-window").hide();
        //查询条件
        var startTime;
        var endTime;
		//锁定期
		var fact_days ;
        //日历周期，目前设置为7天
        var offset = 6;
        //通过json查询的对象声明
        var minStartTime,maxEndTime,queryObject,tableHeadViewModel,tableBodyViewModel;
		
		//微调是否有操作
		var hasChange = false;
		//设备
   		var goEquipment = {};
    	var goInfo = {};
    	var goWindowTableData = {};
    	
    	//用户名
		$scope.userName = $rootScope.userName;
		//本地存储的地点
		$rootScope.current_location = sessionStorage.locationId_res;
		//校验开关，默认关闭
		$scope.checkSwitch = false;
        //初始化查询日期
        var today = new Date();
        if($rootScope.daily_test){today.setFullYear(2016,10,1);}//测试用代码，用于日常环境每次打开显示的为7月1日而不是今天
        startTime = xujun_tool.dateToString(today);//开始时间为今天
        endTime =  xujun_tool.dateToString(new Date(today.setDate(today.getDate() + offset)));//结束时间为今天之后的7天

	//合并时设置头部宽度
	function setTableHeadWidth(parentNodes){
		var lastLeft = 0;
		var jCoverHead = parentNodes.find(".cover-head"),
			jShowTable = parentNodes.find(".show-table thead");
		jCoverHead.width(jShowTable.width());
		jCoverHead.height(jShowTable.height());
		var jCoverTh = jCoverHead.find("div");
		var jHeadTh = jShowTable.find("th");
		var thNum = jHeadTh.length;
		for(var i = 0; i < thNum ; i++){
			if(!!window.ActiveXObject || "ActiveXObject" in window){
				if(i == thNum-1){
					jCoverTh.eq(i).width(jShowTable.width()-jHeadTh.eq(i).position().left-2);
				}else{
					var thisWidth = jHeadTh.eq(i+1).position().left-lastLeft-2;
					lastLeft = jHeadTh.eq(i+1).position().left
					jCoverTh.eq(i).width(thisWidth);
				}
			}else{
				jCoverTh.eq(i).width(jHeadTh.eq(i).width());
			}
		}
	};
	
	/**
	 * 获取锁定期
	 **/
	$http.get($rootScope.restful_api.get_freeze_days +　"?schemeId=" + sessionStorage.schemeId).then(
		function(res) {
			var resData = res.data.lockDate; //锁定期
			if(resData){
				fact_days = resData; //锁定期(可预排最大日期)
			}else{
				layer.alert('锁定期接口获取的数据发生错误,请联系技术人员', {
					skin: 'layer-alert-themecolor' //样式类名
				});
			}
		},
		function(res) {
			layer.alert('获取锁定期失败,请联系技术人员', {
				skin: 'layer-alert-themecolor' //样式类名
			});
		});

        /**
         * 显示临时派工单表的排程计划
         **/
    function result_show_table(location,locationFilterList) {
        //API接口
        if($rootScope.local_test){
            /**
             * 本地测试方法
             */
            //json转viewModel对象
            goEquipment = $.extend({},showTable.punit);
            goInfo = $.extend({},showTable);
            tableHeadViewModel = scheduleTableViewModelService.jsonToTableHeadViewModel(resultTable);
            tableBodyViewModel = scheduleTableViewModelService.jsonToTableBodyViewModel(resultTable);
            //绑定view层
            $scope.tableHeadViewModel=tableHeadViewModel;
            $scope.tableBodyData = tableBodyViewModel.tableBodyData;
            //查询时间
            
            queryObject = scheduleTableViewModelService.jsonToQueryObject(showTable);
            minStartTime = queryObject.minStartTime;
            maxEndTime = queryObject.maxEndTime;
            //判断上一页下一页按钮是否能点
            checkQueryTime(startTime, endTime, today, maxEndTime);
        }else{
    		//移除原有三级界面的jqueryUI dom
    		$("#do_detail_dialog").parent().remove();
    		
    		$rootScope.getsessionStorage(sessionStorage.locationId_pre,sessionStorage.locationId_res);
    		
        	//获取查询信息
        	var saleOrder = xujun_tool.getFromInput(".sale-order"),
				materialName = xujun_tool.getFromInput(".material-name"),
				materialCode = xujun_tool.getFromInput(".material-code");	
    		
			var get_url = "http://"+$rootScope.api_domain+"/api/schedule/result/temp/location/"+location+"/packaged"+"?locationFilterList="+locationFilterList+ "&startTime="+ startTime + "&endTime="+ endTime+"&schemeId="+sessionStorage.schemeId;	
            //获取和显示table数据
            $http.get(get_url).then(
                //成功
                function(response){
                	//是否存在查询条件
                	var isSearch = false;
                	if(saleOrder+materialName+materialCode){
		        		isSearch = true;
		        	}
					//保存数据供其他功能使用
					goEquipment = $.extend({},response.data.punit);
					goInfo = $.extend({},response.data);
					$scope.later = goInfo;
					//是否搜索
					response.data.isSearch = isSearch;
					//冻结期
					response.data.freezeDate = fact_days;
					//是否翻转
					response.data.front = $rootScope.frontBack;
                    //json转viewModel对象
                    tableHeadViewModel = scheduleTableViewModelService.jsonToTableHeadViewModel(response.data);

                    //检查返回内容是否正确（目前只判断time是否存在）
                    if(tableHeadViewModel == undefined){
						layer.alert('数据请求发送成功，数据内容解析失败，请联系技术人员处理', {
							skin: 'layer-alert-themecolor' //样式类名
						});                        	
                        return;
                    }

                    //json转viewModel对象
                    tableBodyViewModel = scheduleTableViewModelService.jsonToTableBodyViewModelNew(response.data);

                    //查询时间
                    queryObject = scheduleTableViewModelService.jsonToQueryObject(response.data);
					if(queryObject == undefined){
						layer.alert('数据获取接口有问题，请联系技术人员处理33', {
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
                    $(".page-select").css("pointer-events","auto");
					//一级页面差异化
					//var getFrontUrl =  $rootScope.restful_api.preview_table_json + "&startDate="+ startTime + "&endDate="+ endTime+"&saleOrderCode="+saleOrder+"&materialName="+materialName+"&materialCode="+materialCode;
					if($(".differ-btn").hasClass("active")){
						$scope.differentiation = [];
						$(".table").toggle();
						$(".differ-btn").toggleClass("active");
						$scope.showDiffer();
					}
                    //页面显示表格,by jquery
                    jqueryDraw();
                },
                //失败
                function(response){
					layer.alert('获取数据失败，请联系技术人员处理', {
						skin: 'layer-alert-themecolor' //样式类名
					});  	                	
                    $(".page-select").css("pointer-events","auto");
                }
            );
        }
    }
	$scope.differentiation = [];
	
	$scope.showDiffer = function() {
		//获取查询信息
		if ($scope.differentiation.length < 2) {
			var saleOrder = xujun_tool.getFromInput(".sale-order"),
				materialName = xujun_tool.getFromInput(".material-name"),
				materialCode = xujun_tool.getFromInput(".material-code");

			var front=$rootScope.restful_api.front_info+"?locationFilterList="+sessionStorage.locationFilterList_res+ "&startTime="+ startTime + "&endTime="+ endTime;
			//判断是否已存在差异化数据
			$http.get(front).success(function (res) {
				$scope.differentiation.push(res);
				$scope.differentiation.push($scope.later);
				$http.get($rootScope.restful_api.differ_info+"?locationFilterList="+sessionStorage.locationFilterList_res+"&schemeId="+sessionStorage.schemeId+ "&startTime="+ startTime + "&endTime="+ endTime).success(function (respones) {
					$scope.dateId = [];
					for (var i in respones) {
//						for(var j = 0;j<respones[i].length;j++){
//							$scope.dateId.push(i + "" + respones[i][j]);
//						}
						for(var j = 0;j<respones[i].length;j++){
							var punitIdString = respones[i][j];
//							punitIdString.split("_");
//							punitId = punitIdString[0];
//							punitId = punitIdString.substring(0,punitIdString.indexOf("_"));
							$scope.dateId.push(i + "" + punitIdString);    //this_punitId.substring(0,this_punitId.indexOf("_"))
						}
						
					}
					$scope.differTableBodyViewModel = scheduleTableViewModelService.jsonDifferTableBodyViewModel($scope.differentiation);
					$timeout(function () {
						$(".diffe-table .table-td.second").css({"opacity" : 0.2});
						$(".diffe-table .table-td.second").each(function () {
							for(var i = 0; i < $scope.dateId.length; i++) {
								if ($(this).attr("data-dateid") == $scope.dateId[i]) {
									$(this).css({"opacity" : 1});
									break;
								} else {
									$(this).css({"opacity" : 0.2});
								}
							}
						})
						$(".table-content").show();
					}, 0)
				})
					.then(function(){
						$(".table-content").hide();
					});
			});
		}else{
			$scope.differentiation = [];
		}
		$scope.differ_close();
		$(".table").toggle();
		$(".differ-btn").toggleClass("active");
	}
	
    /**
	 * 确认保存APS结果
	 **/
    $scope.save_aps = function(){
		$("#progress-label_two").text("保存 0%");
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
                    $("#progressbar_two").hide();
                }
            );
			//进度部分         
			$(function(){
				var progressbar = $("#progressbar_two"),
			    progressLabel = $("#progress-label_two");
			 	var i=1;    //循环次数
			    function progress(){							
					var progressVal=0;
					var sUrl=$rootScope.restful_api.aps_rate_confirm+"?schemeId="+sessionStorage.schemeId;
					$http.get(sUrl).success(function(res){
						//获取接口数据
						progressVal=res.rate || 0;
						progressbar.children("span").css("width", progressVal + "%");
						progressLabel.text("保存"+" "+progressVal + "%");
						if(progressVal){    //数据正确
		        			var j=setTimeout(progress, 1000);
		        			if(sta){
								progressbar.children("span").css("width","100%");
								progressLabel.text( "保存完成" );
								$("#progressbar_two").hide(20);
								clearTimeout(j);
								$(".cover").hide();
								$location.path("/preview");
							}else{
								clearTimeout(j);
								$("#progressbar_two").hide(20);
								layer.alert("保存失败！");
								$(".cover").hide();
							}
							//如果时间超过1小时，停止加载 ，弹框提示
							if(i > 3600){
								layer.alert("进度失败，请联系技术人员处理");
								clearTimeout(j);
								progressbar.hide(20);   //进度条加载完成后隐藏
								$(".cover").hide();             //遮盖层隐藏	
					    	}
		      			}else{                                    //如果数据错误		      					      				
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
    
    /**
	 * 取消APS结果
	 **/
    $scope.cancel_aps = function(){
 		var index = layer.confirm('确定要取消自动排程结果？', {
			btn: ['确定','取消'] //按钮
		}, function(){
			$scope.$apply();
			//API接口
            if($rootScope.local_test){
                /**
                 * 本地测试方法
                 */
                $location.path("/preview").replace();
            }else{
                //点击取消排程按钮
                $http.post($rootScope.restful_api.aps_cancel, JSON.parse(sessionStorage.getItem("cancel_data"))).then(
                    //成功
                    function(response){
                        if(response.data == true){
                            $location.path("/preview").replace();
                        }else{
							layer.alert('取消自动排程结果失败，返回参数错误，请联系技术人员处理', {
								skin: 'layer-alert-themecolor' //样式类名
							});
                        }
                    },
                    //失败
                    function(response){										
 						layer.alert('取消自动排程结果失败，请联系技术人员处理', {
							skin: 'layer-alert-themecolor' //样式类名
						}); 
                    }
                );
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
    function checkQueryTime(s_time, e_time, min_time, max_time){
        if(min_time == undefined || xujun_tool.stringToDate(s_time) <= min_time){
            $scope.last_page_button_style = {'display':'none'};
        }else{
            $scope.last_page_button_style = {'display':'inline-block'};
        }
        $scope.next_page_button_style = {'display':'inline-block'};
//      if(max_time == undefined || xujun_tool.stringToDate(e_time) >= xujun_tool.stringToDate(max_time)){
//          $scope.next_page_button_style = {'display':'none'};
//      }else{
//          $scope.next_page_button_style = {'display':'inline-block'};
//      }
    }

    /**
	 * 上一页按钮点击
	 **/
    $scope.last_page = function(){
    		$(".page-select").css("pointer-events","none");
            var startTime_date = xujun_tool.stringToDate(startTime);
            var endTime_date = xujun_tool.stringToDate(endTime);
            startTime = xujun_tool.dateToString(new Date(startTime_date.setDate(startTime_date.getDate() - offset - 1)));//开始时间为周期后+1
            endTime =  xujun_tool.dateToString(new Date(endTime_date.setDate(endTime_date.getDate() - offset - 1)));//结束时间为周期后+1
            //获取表格数据
            result_show_table(sessionStorage.locationId_res,sessionStorage.locationFilterList_res);
    }

    /**
	 * 下一页按钮点击
	 **/
    $scope.next_page = function(){
    		$(".page-select").css("pointer-events","none");
            var startTime_date = xujun_tool.stringToDate(startTime);
            var endTime_date = xujun_tool.stringToDate(endTime);
            startTime = xujun_tool.dateToString(new Date(startTime_date.setDate(startTime_date.getDate() + offset + 1)));//开始时间为周期后+1
            endTime =  xujun_tool.dateToString(new Date(endTime_date.setDate(endTime_date.getDate() + offset + 1)));//结束时间为周期后+1
            //获取表格数据
            result_show_table(sessionStorage.locationId_res,sessionStorage.locationFilterList_res);
    }

	/**
	 * 删除前拉后推
	 **/
	$scope.around_del =function(){
		$http.post($rootScope.restful_api.aps_rate_around_del_but,sessionStorage.papBodyData).success(function(){
			$scope.newprogressBar_post("#progressbar_four","#progress-label_four",$rootScope.restful_api.aps_rate_around_del,sessionStorage.papBodyData,"删除前拉后推",function(){
				layer.alert("删除前拉后推完成");
				$('#progressbar_four').hide();   //隐藏进度
			},function(){});
			result_show_table(sessionStorage.locationId_res,sessionStorage.locationFilterList_res);  /*刷新数据*/
		})
		result_show_table(sessionStorage.locationId_res,sessionStorage.locationFilterList_res);  /*刷新数据*/
	}
	
	/**
	 * 前拉后推进度
	 **/
	$scope.around =function(){
		$(".pbody-wrap").children(".pap-alert").show();
		$http.post($rootScope.restful_api.aps_rate_ar_button,JSON.parse(sessionStorage.getItem("papBodyData"))).success(function(){
			$scope.newprogressBar_post("#progressbar_one","#progress-label_one",$rootScope.restful_api.aps_rate_around,JSON.parse(sessionStorage.getItem("papBodyData")),"前拉后推",function(){
			},function(res){
				$timeout(function(){
					var stateList=res.stateList;
					if(res.rate == 100 && stateList.length == 0){        /*9.19 modify by zh*/
						stateList = undefined;
						$scope.Lists = stateList;
						$(".pap-alert").children("h3").after("<em style='position: absolute;left: 29%;top: 45%;'>暂时没有可以操作的工单信息!</em>");
					}else{
						$scope.Lists=stateList;
					
						$timeout(function(){
							for(var i = 0;i < stateList.length;i++){
								if(stateList[i].state == "PAP_SUCCESS"){
									$(".pap-alert li:eq("+i+")").children("b").hide();     //如果成功，提示信息按钮将隐藏
								}
							}
						},0)
					}	
				},0)
			result_show_table(sessionStorage.locationId_res,sessionStorage.locationFilterList_res);	
			});
		})
		$(".cover").show(50);
		result_show_table(sessionStorage.locationId_res,sessionStorage.locationFilterList_res);  /*刷新数据*/
	}
	
	/**
	 * 针对PAP及删除PAP 进度的方法
	 **/
	$scope.newprogressBar_post=function(elements1, elements2, url,data,text,fn, fun){
		var progressbar = $(elements1),
			progressLabel = $(elements2);
	
		progressbar.show(); //进度条显示
		var i = 0; //循环次数
	    function SetProgress() { 
			var progressVal = 0;
				$http.post(url,data).success(function(res){
					fun(res);
					progressVal = res.rate || 0;    //获取接口数据
					progressbar.children("span").css("width", progressVal + "%"); 
	   				progressLabel.text(text+" "+progressVal + "%");
					if(progressVal || progressVal == 0) { //数据正确
						if(progressVal < 100) {
							var j = setTimeout(SetProgress, 1000);
							if(i > 360) {  
								layer.alert("进度失败，请联系技术人员处理");
								clearTimeout(j);
								progressLabel.text(text+"失败");
								progressbar.hide(30); //进度条加载完成后隐藏
							}
						} else {
							progressLabel.text(text+"完成");
							fn(); //参数
						}
					} else { //如果数据错误		      					      				
						layer.alert("进度失败，请联系技术人员处理");
						progressbar.hide(30); //进度条加载完成后隐藏
					}
				});
			i++;
			console.log(i);
	    } 
	    SetProgress();//开始加载
	}
	
	/**
	 * 提示信息 前拉后推
	 **/
	var p_info = $(".pap-alert");
	p_info.on("click","b",function(){
		$(this).next("p").toggle();
		$(this).siblings(".pap-alert-tri").toggle();
		$(this).parent().siblings().find("p").hide();
	});
	
	/**
	 * 关闭前拉后推 提示
	 **/
	$scope.pap_close = function(){
		$(".pap-alert").hide(50);
		$("#progressbar_one").hide(50);
		$(".cover").hide(50);
		$(".pap-alert").find("em").remove();
		$(".pap-alert").find(".pap-in-alert").hide();  //关闭提示信息
		$(".pap-alert").find(".pap-alert-tri").hide();
	}
	
	/**
	 * 隐藏PAP按钮
	 **/
	$scope.hideButton = function(){
		$http.post($rootScope.restful_api.aps_config,JSON.parse(sessionStorage.getItem("papBodyData"))).then(
			function(res){
				if(res.data){
					$(".tab-fo-ba").show();
					$(".tab-del-fo-ba").show();
				}else{
					$(".tab-fo-ba").hide();
					$(".tab-del-fo-ba").hide();
				}
			},
			function(res){}
		);
	}
	
	/**
	 * 撤销按钮
	 **/
	$scope.rollback=function(){
		var post_data={
			"schemeId":sessionStorage.schemeId,
			"locationDtoList":[]
		};
		$http.post($rootScope.restful_api.aps_rollback,post_data).then(
			function(res){
				if(res.data){
					result_show_table(sessionStorage.locationId_res,sessionStorage.locationFilterList_res);      //若为真，则重新获取数据
					layer.alert("撤销成功");
					//刷新暂存区和二级页面
					if($(".table-dialog-window").css("display") == "flex"){
						var thisQuery = goWindowTableData.query,
							thisEquipmentId = thisQuery.equipments,
							thisStartTime = thisQuery.startTime,
							thisEndTime = thisQuery.endTime;
						$scope.click_creat_window(thisStartTime,thisEndTime,thisEquipmentId[0].equipmentId+"_"+thisEquipmentId[0].equipmentType,"","","");
					}
					if($(".cache-window").css("display") == "flex"){
						$scope.cache_box();
					}else{
						var sUrl=$rootScope.restful_api.cache_info+"?schemeId="+sessionStorage.schemeId;
						$http.get(sUrl).then(
							function(res){
								var cacheNum = res.data.row.length;
								if(cacheNum > 999){
									cacheNum = "999+";
								}
								if(cacheNum == 0){
									$(".cache-num").hide();
									return;
								}
								$(".cache-num").show().text(cacheNum);
							},
							function(res){
								
							}
						);
					}
				}else{
					result_show_table(sessionStorage.locationId_res,sessionStorage.locationFilterList_res);
					layer.alert("撤销失败");
					//刷新暂存区和二级页面
					if($(".table-dialog-window").css("display")=="flex"){
						var thisQuery = goWindowTableData.query,
							thisEquipmentId = thisQuery.equipments,
							thisStartTime = thisQuery.startTime,
							thisEndTime = thisQuery.endTime;
						$scope.click_creat_window(thisStartTime,thisEndTime,thisEquipmentId[0].equipmentId+"_"+thisEquipmentId[0].equipmentType,"","","");
					}
					if($(".cache-window").css("display")=="flex"){
						$scope.cache_box();
					}
				}
			},
			function(res){
			}
		);
	}
	
	/**
	 * 检验按钮 方法
	 **/
	$scope.check_aps=function($event){
		if($event.target.className == "check-check-box"){
			$scope.checkSwitch = !$scope.checkSwitch;
			$(".jiaoyan-icon").parent().toggleClass("search-btn-click");
			return;
		}
		$scope.confirm_check(function(){});
	}
	
	/**
	 * 提示信息 校验
	 **/
	$scope.confirm_dialog=function(checkRow,$event){
//		$("#check_detail_dialog").children("table").remove();
		$event.stopPropagation();
		var thisInfo=checkRow.info;
		$scope.checkRows = thisInfo;
		var indexLayer = layer.open({
              type: 1,
              title: "异常原因",
              shadeClose: true,
              skin: 'yourclass',
              content : $("#check_detail_dialog"),
              success : function(){
                    // 272是显示框正常宽度，450是高度
                    $(".layui-layer").css({
                        "left" : $event.pageX - 152,
                        "top" : $event.pageY >(document.body.clientHeight - 450) ? document.body.clientHeight - 450 : $event.pageY
                    })
                    $("#check_detail_dialog").on("click",".sure",function(){
                        layer.close(indexLayer);
                    })
              }
        })
	}
	
	/**
	 * 保存前校验 方法
	 **/
	$scope.save_check_aps=function(){
		$scope.confirm_check(function(){
	 		var index = layer.confirm('校验结束。若无误，点确认保存排程；若有误，点取消查看校验结果。', {
				btn: ['确定','取消'] //按钮
			}, function(){
				$scope.save_aps();
				$(".wrap-alert").hide(50);
				$("#progressbar_three").hide();
				layer.close(index);
				$(".progress-label_three").text("校验中");
				$('.pbody-wrap').find("ul li").empty();
				$(".cover").hide();
			 });
		});
	}
	
	/**
	 * 校验方法
	 **/
	$scope.confirm_check=function(fn){
		$scope.allSuccess = true;
		var progressbar = $("#progressbar_three"),
		    progressLabel = $("#progress-label_three");
		progressLabel.text("校验中");
		progressbar.show();    //进度条
		$(".wrap-alert").show();           //提示信息
		$(".cover").show();
		
		progressbar.children("span").css("width", 0 + "%");
		function progress(){
			$http.post($rootScope.restful_api.aps_check,JSON.parse(sessionStorage.getItem("cancel_data"))).success(function(res) {				
				var scheduleValidateMap=res.scheduleValidateMap;
				var list1 = [];
//				var list2 = [];	
				for(var j in scheduleValidateMap){
					var data = {
					  	  'code':j,
					  	  'info':scheduleValidateMap[j]
					    };
					list1.push(data);	 
					$timeout(function() {     //异步进行
						for(var i = 0;i < list1.length;i++) {
							if(list1[i].info.length==0){
								$(".wrap-alert li:eq("+i+")").children("span:eq(3)").text("校验正常");
								$(".wrap-alert li:eq("+i+")").children("span:eq(2)").removeClass("class-false").addClass("class-true");
								$(".wrap-alert li:eq("+i+")").children("b").hide();     //如果没有异常，提示信息按钮将隐藏
							}else{
								$(".wrap-alert li:eq("+i+")").children("span:eq(3)").text("校验存在异常");
								$(".wrap-alert li:eq("+i+")").children("span:eq(2)").removeClass("class-true").addClass("class-false");
							}
						}	
					},0)
				}	
				$scope.listOne = list1;
				if(res.status == 1){
					progressbar.children("span").css("width", 100 + "%"); 
	   				progressLabel.text("校验完成");
	   				if(fn){
	   					fn();          //参数
	   				}
				}
			})
		}
		setTimeout(progress,1000);
		result_show_table(sessionStorage.locationId_res,sessionStorage.locationFilterList_res);  /*刷新数据*/
	}
		
	/**
	 * 关闭校验
	 **/
	$scope.confirm_close=function(){
		$(".wrap-alert").hide(50);
		$("#progressbar_three").hide(50);
		$(".cover").hide(50);
		
		$(".progress-label_three").text("校验中");
		$('.pbody-wrap').find("ul li").empty();   //清空上一次操作
		result_show_table(sessionStorage.locationId_res,sessionStorage.locationFilterList_res);
	}
	
	/******===== 二级页面差异化 开始=====******/
	
	var index = 2;//锚点当前位置
	
	/**
	 * 关闭页面
	 **/
	$scope.differ_close=function(){
		$("#show").css("background","#fff");
		$(".differ-show-info").hide();
		$(".differ-show").find("table").empty();
//		$(".table-dialog-differ").children(".table-window-right").find("table").children("tbody").children("tr").children("td").removeClass("differ-highlight");
		$(".table-dialog-differ").hide();
		index = 2;    //重置为默认锚点  默认位置
		$("#J_point").css({"left":"50px"});  
	}
	
	/**
	 * 单击单元格
	 **/
	$scope.differ_unit_click = function(cell,$event) {
		//表头不能点击
		if($($event.target).parents(".table-td").hasClass("first")){
			return;
		}
    	if(!cell[0].args){
    		return;
    	}
        var thisInf = cell[0].args,
    		thisDate = thisInf.date,
    		thisEquipment = thisInf.equipment_id;
        $scope.differ_show(thisDate,thisEquipment);
    }
	
	/**
	 * 表头宽度函数
	 **/
	$scope.auto_width=function(a,b){
		var lastLeft = 0;
		var jCoverHead = $(".table-dialog-differ").find(a),
            jShowTable = $(".table-dialog-differ").find(b).find("thead");
		jCoverHead.width(jShowTable.width());
		jCoverHead.height(jShowTable.height());
		var coverThs = jCoverHead.find("div");
		var headThs = jShowTable.find("th");
		var thNums = headThs.length;
		for(var i = 0; i < thNums ; i++){
			if(!!window.ActiveXObject || "ActiveXObject" in window){
				if(i == thNums-1){
					coverThs.eq(i).width(jShowTable.width()-headThs.eq(i).position().left-2);
				}else{
					var thisWidth = headThs.eq(i+1).position().left-lastLeft-2;
					lastLeft = headThs.eq(i+1).position().left
					coverThs.eq(i).width(thisWidth);	
				}
			}else{
				coverThs.eq(i).width(headThs.eq(i).width());
			}    		
		}		
	}
	
	/**
	 * 创建二级差异化页面
	 **/
	$scope.differ_show=function(workDate,equipmentId){
		var thisWorkDate = workDate,
			newId=equipmentId.split("_"),
			thisEquipmentId = equipmentId,
			thisEquipmentName = [],
			aEquipment = '',
			sUrl = '';
		aEquipment = [thisEquipmentId];

		for(var i in aEquipment){
        	thisEquipmentName.push(goEquipment[aEquipment[i]].punitName); 
       }
		sUrl = $rootScope.restful_api.secondPage_differ+"workDate=" + thisWorkDate + "&equipmentId=" + newId[0]+"&equipmentType="+newId[1]+"&schemeId="+sessionStorage.schemeId;		
		$http.get(sUrl).success(function(res){	
		/*以工单为判断*/   
			var taskLeft=res.leftList,
				taskRight=res.rightList,
				taskCompare=res.compareList;
	
			for(var i in taskCompare){
				var rowNum;
				if(taskCompare[i].result == "true"){
					rowNum=taskCompare[i].rowNum;  //记录差异时的rowNum值,作高亮显示用
					for(var j in taskLeft){    //左侧表格是否高亮
						if(taskLeft[j].rowNum == rowNum){
							taskLeft[j].isHighLight = true;
						}
					}
					for(var j in taskRight){   //右侧表格是否高亮
						if(taskRight[j].rowNum == rowNum){
							taskRight[j].isHighLight = true;
						}
					}
				}		
			}
		//处理数据
			var headList=res.columnAlias;    //表头列表
			    leftList=taskLeft,
			    rightList=taskRight,
			    cpList=res.compareList;
			
			//处理json格式
			var leftJson={},
			    rightJson={};
			leftJson.columnAlias = res.columnAlias;
			leftJson.column = res.column;
			leftJson.row = taskLeft;
			leftJson.query = res.query;
		
			rightJson.columnAlias = res.columnAlias;
			rightJson.column = res.column;
			rightJson.row = taskRight;
			rightJson.query = res.query;
			var leftDifferTableData = scheduleTableViewModelService.jsonToDifferTable(leftJson);
			var rightDifferTableData = scheduleTableViewModelService.jsonToDifferTable(rightJson); 
		//绑定页面
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
		    $timeout(function(){     //表头宽度函数
		    	$scope.auto_width(".cover-heads_left",".table-window-left");   //左侧列表
				$scope.auto_width(".cover-heads_right",".table-window-right"); //右侧列表
		    })
		})
		/*以工单为判断  end*/
			
		/*以车间计划为判断*/
		var poolUrl=$rootScope.restful_api.workshop_plan+"workDate=" + thisWorkDate + "&equipmentId=" + newId[0]+"&equipmentType="+newId[1]+"&schemeId="+sessionStorage.schemeId;
		$http.get(poolUrl).success(function(res){
			var poolLeft = res.leftList,
				poolRight = res.rightList;
			//合并数据方法
			function handle(arr) {
			    var obj = {};
			    arr.forEach(function(val) {
			        if (obj.hasOwnProperty(val.poolTaskId)) {
			            obj[val.poolTaskId].taskNum += val.taskNum;
			        } else {
			            obj[val.poolTaskId] = {
			                poolTaskId: val.poolTaskId,
			                taskNum: val.taskNum,
			                poolTaskStartTime:val.poolTaskStartTime,
			                poolTaskEndTime:val.poolTaskEndTime,
			                saleOrderCode:val.saleOrderCode,
			                materialName:val.materialName
			            };
			        }
			    });
			    return obj;
			}
			poolLeft = handle(poolLeft);
			poolRight = handle(poolRight);
			//判断差异
			for(var i in poolRight){
				poolRight[i].isHighLight=false;
				for(var j in poolLeft){
					if( !poolLeft[j].isHighLight && poolRight[i].poolTaskId == poolLeft[j].poolTaskId && poolRight[i].taskNum == poolLeft[j].taskNum){
						poolRight[i].isHighLight = true;
						poolLeft[j].isHighLight = true;
						break;
					}
				}
			}
		/*对数据进行处理*/
			var leftJson_pool={};
			var rightJson_pool={};
			leftJson_pool.columnAlias = res.columnAlias;
			leftJson_pool.column = res.column;
			leftJson_pool.row = poolLeft;
			leftJson_pool.query = res.query;

			rightJson_pool.columnAlias = res.columnAlias;
			rightJson_pool.column = res.column;
			rightJson_pool.row = poolRight;
			rightJson_pool.query = res.query;
			var leftDifferTableData_pool = scheduleTableViewModelService.jsonToDifferTable(leftJson_pool);
			var rightDifferTableData_pool = scheduleTableViewModelService.jsonToDifferTable(rightJson_pool); 
		//绑定页面
		   	var headDataView_leftPool = leftDifferTableData_pool.headData;
		    var tableDataView_leftPool = leftDifferTableData_pool.bodyData;   //第一个表
	    	$scope.headDataView_leftPool = headDataView_leftPool;
		    $scope.tableDataView_leftPool = tableDataView_leftPool;

			var headDataView_rightPool = rightDifferTableData_pool.headData;
		    var tableDataView_rightPool = rightDifferTableData_pool.bodyData;   //第二个表
	    	$scope.headDataView_rightPool = headDataView_rightPool;
		    $scope.tableDataView_rightPool = tableDataView_rightPool;		
		})
		/*以车间计划为判断end*/
		$scope.highL = {           //高亮效果
		    	"background":"#fefaec",
		    	"color": "#333"
		   };		
	    $timeout(function(){
			//保留差异 按钮
			$scope.differ_keep=function(){
				var hideTr = $(".table-dialog-differ").find("tbody").children("tr[isHighLight=true]");
				$(hideTr).toggle();
				//更新表头遮盖层列宽  ==工单
				$scope.auto_width(".cover-heads_left",".table-window-left");   //左侧列表
				$scope.auto_width(".cover-heads_right",".table-window-right"); //右侧列表
				//更新表头遮盖层列宽  ==车间计划
				$scope.auto_width(".cover-headsPool_left",".tablePool_left");
				$scope.auto_width(".cover-headsPool_right",".tablePool_right");
			}
		},0)
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
//		console.log(bar_length,n_len,len,x_start);
		$("#J_sliderBar").on("mousedown",function(e){
			$("body").addClass("select-none");//禁止选中文字
			var _this = $(this);
			var lastX = null;  //初始值
			document.onmousemove = function(e){
				var _cliX = e.clientX;
	            if(lastX == null){ //判断鼠标的方向
	                lastX = _cliX;
	                return ;
	            }
	            var _center = x_start + index * n_len + len;
	            if(_cliX > lastX){
	                if(_cliX > _center){
	                    if(index < 4){
	                        index = index + 1;
	                     $("#J_point").css({"left":index*n_len +"px"});
	                    }
	                }
	            }else{
	                if(_cliX < x_start + index * n_len - len){
	                    if(index > 0){
	                        index = index - 1;
	                         $("#J_point").css({"left":index*n_len +"px"});
	                    }
	                }
	            }
	            lastX = _cliX;
			}
		})
		document.onmouseup = function(e){
			if(index == 0){
				$(".table-left").animate({"width":"0px"},100);
				$(".table-left").find("table").animate({"width":"100%"},100);
				$(".table-right").animate({"width":"1190px","left":"-635px"},100);
				$(".table-right").find("table").animate({"width":"1190px"},100);
				$(".differ-line").hide();
				$(".title-left").animate({"width":"0px"},100).hide();
				$(".title-right").show().animate({"width":"1190px","margin-left":"-635px"},100);
			}else if(index == 1){
				$(".table-left").show().animate({"width":"230px","left":"0"},100);
				$(".table-left").find("table").animate({"width":"100%"},100);
				$(".table-right").show().animate({"width":"880px","left":"-320px"},100);
				$(".table-right").find("table").animate({"width":"100%"},100);
				$(".differ-line").show().animate({"left":"314px"},100);
				$(".title-left").show().animate({"width":"230px","margin-left":"0"},100);
				$(".title-right").show().animate({"width":"880px","margin-left":"-320px"},100);
			}else if(index == 2){
				$(".table-left").show().animate({"width":"554px","left":"0"},100);
				$(".table-left").find("table").animate({"width":"100%"},100);
				$(".table-right").show().animate({"width":"554px","left":"0"},100);
				$(".table-right").find("table").animate({"width":"100%"},100);
				$(".differ-line").show().animate({"left":"634px"},100);
				$(".title-left").show().animate({"width":"554px","margin-left":"0"},100);
				$(".title-right").show().animate({"width":"554px","margin-left":"0"},100);
			}else if(index == 3){
				$(".table-left").show().animate({"width":"880px","left":"0"},100);
				$(".table-left").find("table").animate({"width":"100%"},100);
				$(".table-right").show().animate({"width":"230px","left":"330px"},100);
				$(".table-right").find("table").animate({"width":"100%"},100);
				$(".differ-line").show().animate({"left":"960px"},100);
				$(".title-left").show().animate({"width":"880px","margin-left":"0"},100);
				$(".title-right").show().animate({"width":"230px","margin-left":"330px"},100);
			}else if(index == 4){
				$(".table-left").animate({"width":"1190px","left":"0px"},100);
				$(".table-left").find("table").animate({"width":"1190px"},100);
				$(".table-right").show().animate({"width":"0px","left":"330px"},100);
				$(".differ-line").hide(100);
				$(".title-left").show().animate({"width":"1190px","margin-left":"0px"},100);
				$(".title-right").hide();
			}
			$timeout(function(){
			//更新表头遮盖层列宽  ==工单
				$scope.auto_width(".cover-heads_left",".tableTask_left");   //左侧列表
				$scope.auto_width(".cover-heads_right",".tableTask_right"); //右侧列表
			//更新表头遮盖层列宽  ==车间计划
				$scope.auto_width(".cover-headsPool_left",".tablePool_left");
				$scope.auto_width(".cover-headsPool_right",".tablePool_right");
			},200)
			$("body").removeClass("selct-none");  //移除选中样式
		    document.onmousemove = null;
		}
		//滚动条
		$(".differ-wrap-table").mouseover(function(){  
			$(this).css("overflow","auto");
		}).mouseleave(function(){
			$(this).css("overflow","hidden");
		})
		$(".differ-wrap-table").scroll(function(){
			var thisScrollTop=$(this).scrollTop();
			$(this).children("div").first().css("top",thisScrollTop);
		})
	}
	
	/**
	 * 点击表格
	 **/
	$scope.click_show=function($event){
		if($(".isPooltaskId").css("display") == "block"){
			return;
		}
		$("#show").empty();  //清空
		$("#show").css("background","#fff");
		$(".differ-show-info").show();
		
		//点击表格
		var thisTd=$($event.target).parent();
		var index=thisTd.index()+1;
		var thisTr=$(".isTask").find(".table-space-differ").children("table").find("tr:eq("+index+")");
		var el_head=thisTd.parent().siblings();

		if(thisTd.parents("div").hasClass("table-window-left")){
			$("#show").append(el_head.clone()).append(thisTr.clone());
		}else if(thisTd.parents("div").hasClass("table-window-right")){
			if(thisTr.length == 1){
				$("#show").append(el_head.clone()).append("<tr style='height:25px;border: 1px #ccc solid;'></tr>").append(thisTr.clone());
			}else{
				$("#show").append(el_head.clone()).append(thisTr.clone());
			}
		}
		if(thisTr.hasClass("differ-highlight")){
			$("#show").css("background","#fefaec");
		}	
	}
	
	/**
	 * 切换
	 **/
	$(".isPoolBtn").on("click",function(){
		$(".isPooltaskId").show();
		$(".isTask").hide();
		$scope.auto_width(".cover-headsPool_left",".tablePool_left");
		$scope.auto_width(".cover-headsPool_right",".tablePool_right");
		$(this).addClass("switch-result");
		$(this).siblings("span").removeClass("switch-result");
	})
	$(".isTaskBtn").on("click",function(){
		$(".isPooltaskId").hide();
		$(".isTask").show();
		$scope.auto_width(".cover-heads_left",".table-window-left");   //左侧列表
		$scope.auto_width(".cover-heads_right",".table-window-right"); //右侧列表
		$(this).addClass("switch-result");
		$(this).siblings("span").removeClass("switch-result");
	})
	/******===== 二级页面差异化 结束=====******/
	//右边栏弹出小提示	
	$(function(){
		var arrEle=$(".right-menu-button");
		for(var i = 0;i < arrEle.length;i++){
			$(arrEle[i]).mouseover(function(){
				$(this).find(".tip").stop().show().animate({
					left:"-120px",
					opacity:"1"
				},300);
			});
			$(arrEle[i]).mouseleave(function(){
				$(this).find(".tip").hide().animate({
					left:"-220px",
					opacity:"0.3"
				},0)
			});
		}	
	});
	
	/**
	 * 打开暂存间
	 **/
	$scope.cache_box = function(){
		var jTableDialogWindow = $(".table-dialog-window");
		var jCacheWindow = $(".cache-window");	
		
		var inputList = xujun_tool.getFromInput(".cache-window .info-show"),
			saleOrderCode = inputList[0],
			materialName = inputList[1],
			materialCode = inputList[2];
		
        var sUrl = $rootScope.restful_api.cache_info+"?schemeId="+sessionStorage.schemeId;
        $http.get(sUrl).then(
        	function(res){
        		//将二级页面靠左
				jTableDialogWindow.animate({left:"580px"});
				jCacheWindow.show().animate({opacity:1});
				
				var cacheNum = res.data.row.length;
				cacheNum>0 ? $(".cache-num").show().text(cacheNum>999?"999+":cacheNum) : $(".cache-num").hide();
        		var windowTableData = scheduleTableViewModelService.jsonToWindowTableView(res.data);
        	
        		$scope.cacheHeadDataView = windowTableData.headData;
        		$scope.cacheTableDataView = windowTableData.bodyData;
				
				$timeout(function(){setTableHeadWidth($(".cache-window"))},0);
				
				//resize
				$(window).on("resize",function(){
					setTableHeadWidth($(".cache-window"));
				});
				$timeout(function(){
					//初始化复选框
            		$("input[name='StorageSingle'],input[name='StorageAll']").prop("checked",false);
				
		            //全选全不选
		            $("input[name=StorageAll]").on("click",function(){
		            	var checkValue = $(this).is(':checked') ;
		            	if(checkValue == true){
							$("input[name='StorageSingle']").prop("checked",true);		
		            	}else{
		            		$("input[name='StorageSingle']").prop("checked",false);
		            	}
		            });
					/*复选框反选*/
					 $("body").on("click","input[name='StorageSingle']",function(){
					 	var chsub = $("input[name='StorageSingle']").length;
					 	var checkedsub = $("input[name='StorageSingle']:checked").length;
							if(chsub == checkedsub){
								$("input[name='StorageAll']").prop("checked",true);
							}else{
								$("input[name='StorageAll']").prop("checked",false);
							}
					 });       
				},0);
				
				//关闭暂存间
				jCacheWindow.find(".close-window").on("click",function(){
					jCacheWindow.hide();
					
					//将二级页面居中
					jTableDialogWindow.animate({left:"50%"});
					jCacheWindow.animate({opacity:0},{
						callback:function(){
							jCacheWindow.hide();
							$(".num-window").hide();
						}
					});
				})
        	},
        	function(res){
        		
        	}
      );
	}
		
	/**
	 * 暂存间查询
	 **/
	$scope.change_cache_window = function(){
		$scope.cache_box();
	}
	
	/**
	 * 移入暂存间
	 **/
	$scope.move_to_cache = function(){			
		var thisQuery = goWindowTableData.query,
			thisEquipmentId = thisQuery.equipments,
			thisStartTime = thisQuery.startTime,
			thisEndTime = thisQuery.endTime;
			
		//获取选中项
		var jTableDialogWindow = $(".table-dialog-window").find(".table-space"),
			jCheckedInput = jTableDialogWindow.find("input:checked");
			
		var thisObj = {};			
		thisObj.tempList = [];
				
		if(jCheckedInput.length == 0){
			layer.alert('请选择要操作的订单！', {
				skin: 'layer-alert-themecolor' //样式类名
			}); 
			return;
		}else{
			jCheckedInput.each(function(){
				var $this = $(this);
				var thisPkId = $this.parents("tr").attr("pk-id"),
					thisVersionId = $this.parents("tr").attr("versionid");
					
				thisObj.tempList.push({
					pkId : thisPkId,
					versionId : thisVersionId
				});
			});
		}

		thisObj.locationIdList = $rootScope.locationIdList;
		thisObj.workDate = thisStartTime;
		thisObj.pUnitId = thisEquipmentId[0].equipmentId;
		thisObj.pUnitType = thisEquipmentId[0].equipmentType;
		thisObj.processOrder = jCheckedInput.eq(0).parents("tr").attr("processorder")-1;
		thisObj.schemeId=sessionStorage.schemeId;
		var nUrl = $rootScope.restful_api.cache_movein;
		$scope.askRequest({
			_type:"post",
			_url:nUrl,
			_data:thisObj,
			_text:'移入暂存间失败！'
		});
	}
	
	/**
	 * 移出暂存间
	 **/
	$scope.move_out_cache = function(){	
		
		if($(".table-dialog-window").css("display")=="none"){
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
			
		if(jCheckedInput.length == 0){
 			layer.alert('请选择要操作的订单！', {
				skin: 'layer-alert-themecolor' //样式类名
			});
			return;
		}else{
			jCheckedInput.each(function(){
				var $this = $(this);
				var thisPkId = $this.parents("tr").attr("pk-id"),
					thisVersionId = $this.parents("tr").attr("versionid");
					
				thisObj.tempList.push({
					pkId : thisPkId,
					versionId : thisVersionId
				});
			});
		}

		thisObj.locationIdList = $rootScope.locationIdList;
		thisObj.workDate = thisStartTime;
		thisObj.pUnitId = thisEquipmentId[0].equipmentId;
		thisObj.pUnitType = thisEquipmentId[0].equipmentType;
		var nUrl=$rootScope.restful_api.cache_moveout;
		getProcessOrder(thisObj,nUrl);			
	}
		
	/**
	 * 部分移入暂存间
	 **/
	$scope.part_move_in_cache = function(tableRow,$event){
		$event.stopPropagation();
		var thisQuery = goWindowTableData.query,
			thisEquipmentId = thisQuery.equipments,
			thisStartTime = thisQuery.startTime,
			thisEndTime = thisQuery.endTime;
		
		tableRow = tableRow[0];
		var workDate = tableRow.startTime.substring(0,10),
			thisEquipmentName = tableRow.pUnitName,
			thisNum = tableRow.taskNum-0,
			thisProcessOrder = tableRow.index,
			thisPkId = tableRow.pkId,
			thisVersionId = tableRow.versionId;
		
		var thisX = $event.pageX+10,
			thisY = $event.pageY-58;	
		$(".num-window").find("input").val(0);
		$(".num-window").show().css("left",thisX).css("top",thisY);			
		
		$(".num-window-sure").off("click");
		$(".num-window-sure").on("click",function(){
			var num = $(".num-window").find("input").val()+"";
			console.log(num.indexOf("."));
			if(num.indexOf(".")>-1 || +num <= 0 || +num > thisNum){
 				layer.alert('请输入正确的数字！', {
					skin: 'layer-alert-themecolor' //样式类名
				});
				return;
			}
			$(".num-window").hide();
			num = num-0;
			
			var thisObj = {};
			var nUrl,
				_text;
			thisObj.locationIdList = $rootScope.locationIdList;
			thisObj.workDate = workDate;
			thisObj.pUnitId = thisEquipmentId[0].equipmentId;
			thisObj.pUnitType = thisEquipmentId[0].equipmentType;
			thisObj.processOrder = thisProcessOrder;
			thisObj.schemeId=sessionStorage.schemeId;
			
			if(num == thisNum){	
				thisObj.tempList = [];
				thisObj.tempList.push({
					pkId : thisPkId,
					versionId : thisVersionId
				});
				_text = '移入暂存间失败！';
				nUrl=$rootScope.restful_api.cache_movein_part_v;			
			}else{
				thisObj.taskNum = num;
				thisObj.partTemp = {
					pkId : thisPkId,
					versionId : thisVersionId
				};
				_text = '部分导入失败！';
				nUrl=$rootScope.restful_api.cache_movein_part;
			}
			$scope.askRequest({
				_type:"post",
				_url:nUrl,
				_data:thisObj,
				_text:_text
			});
		});
	}
		
	/**
	 * 关闭数量弹窗
	 **/
	$(".close-num-window").on("click",function(){
		$(".num-window").hide();
	});
				
	/**
	 * 部分移出暂存间
	 **/
	$scope.part_move_out_cache = function(tableRow,$event){
		if($(".table-dialog-window").css("display")=="none"){
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
			thisNum = tableRow.taskNum-0,
			thisPkId = tableRow.pkId,
			thisVersionId = tableRow.versionId;
			newI=thisEquipmentId[0].equipmentId;
		
		var thisX = $event.pageX-150,
			thisY = $event.pageY-58;			
		$(".num-window").find("input").val(0);
		$(".num-window").show().css("left",thisX).css("top",thisY);
		
		$(".num-window-sure").off("click");
		$(".num-window-sure").on("click",function(){
			var num = $(".num-window").find("input").val()+"";
			
			if(num.indexOf(".")>-1 || +num<=0 || +num>thisNum){
				layer.alert('请输入正确的数字', {
					skin: 'layer-alert-themecolor' //样式类名
				});
				return;
			}
			
			$(".num-window").hide();
			num = num-0;
			var thisObj = {};
			var nUrl
			thisObj.locationIdList = $rootScope.locationIdList;
			thisObj.workDate = workDate;
			thisObj.pUnitId = thisEquipmentId[0].equipmentId;
			thisObj.pUnitType = thisEquipmentId[0].equipmentType;
			
			if(num == thisNum){
				thisObj.tempList = [];
				thisObj.tempList.push({
					pkId : thisPkId,
					versionId : thisVersionId
				});									
				nUrl=$rootScope.restful_api.cache_moveout_part_v;		
			}else{
				thisObj.taskNum = num;			
				thisObj.partTemp = {
					pkId : thisPkId,
					versionId : thisVersionId
				};
				nUrl=$rootScope.restful_api.cache_moveout_part;	
			}
			
			getProcessOrder(thisObj,nUrl);
		});
	}
		
	/**
	 * 获取插入位置，并传数据给后台
	 **/
	function getProcessOrder(thisObj,url){	
		var thisQuery = goWindowTableData.query,
			thisEquipmentId = thisQuery.equipments,
			thisStartTime = thisQuery.startTime,
			thisEndTime = thisQuery.endTime;
		var  jTableSpace = $(".table-dialog-window").find(".show-table");
		thisObj.schemeId=sessionStorage.schemeId;
		//清空二级页面查询条件和排序，进入编辑状态
		var URL=$rootScope.restful_api.get_processOrder;
        var isArr=[];
        for(var i in thisEquipmentId){
        	var isObj={};          	
        	isObj.equipmentType = thisEquipmentId[i].equipmentType;
        	isObj.equipmentId = thisEquipmentId[i].equipmentId;
        	isObj.freezeDate = goEquipment[isObj.equipmentId + "_" + isObj.equipmentType].freezeDate;
        	isArr.push(isObj);
        }
        
		var body_data={
			"startTime":thisStartTime,
			"endTime":thisEndTime,
			"materialName":"",
			"materialCode":"",
			"saleOrderCode":"",
			"schemeId":sessionStorage.schemeId,
			"equipments":isArr
		};				
        $http.post(URL,body_data).then(
        	function(res){
            	var jTableDialogWindow = $(".table-dialog-window")
            	jTableDialogWindow.show();	                	
				$(".equipment-list").remove();
            	var resData = res.data;
            	var headList = res.columnAlias;//表头列表						
				
				goWindowTableData = $.extend({},resData);
            	var windowTableData = scheduleTableViewModelService.jsonToWindowTableView(resData);
            			            	
            	//绑定页面
		    	$scope.headDataView = windowTableData.headData;
			    $scope.tableDataView = windowTableData.bodyData;

        		$timeout(function(){
        			//更新表头宽度
					setTableHeadWidth(jTableDialogWindow)
				},0);              	
        	},
        	function(res){
        		
        	}
        );
		if(jTableSpace.find("tr").length > 1){
			layer.alert('请在左侧表格点击你要插入的位置。', {
				skin: 'layer-alert-themecolor' //样式类名
			});
			//显示取消按钮
			$(".cance-move").show();
			//二级页面不可修改
			$(".table-dialog-window").find(".sale-order-change").css("pointer-events","none");
			$(".table-dialog-window").find("input").css("pointer-events","none");
			if(!thisObj){
				var thisObj = {};
			}
			
			var mouseText = $("<div class='mouse-text'>请点击要插入的位置...</div>");
			$("body").append(mouseText);
			
			jTableSpace.on("mouseenter",function(){
				$(".mouse-text").show();
			});
			jTableSpace.on("mouseleave",function(){
				$(".mouse-text").hide();
			});
			jTableSpace.on("mousemove","*",function(){
				var event = arguments[0] || window.event,
					$this = $(this);
				event.stopPropagation();							
				var thisTr = $(this).parents("tr");
				
				var thisX = event.clientX+20,
					thisY = event.clientY+20;
					thisLineX = event.offsetX;
					thisLineY = event.offsetY;							
				$(".mouse-text").css("left",thisX).css("top",thisY);
				
				//在合适的地方插入空白行
				if($(this).hasClass("tr-holder") || $(this).hasClass("table-space") || $(this).is("table") || $(this).parent("tr").attr("source")){
					if($(".tr-holder").length > 0){
						return;
					}else{
						jTableSpace.find("tbody").append($("<tr class='tr-holder'></tr>"));
						return;
					}						
				}else{
					if(thisLineY>15){
						if(!thisTr.next().hasClass("tr-holder")){
							//在此行之后插入一行
							$(".tr-holder").remove();
							var newLine = $("<tr class='tr-holder'></tr>");
							newLine.insertAfter(thisTr);
						}								
					}else{
						if(!thisTr.prev().hasClass("tr-holder")){
							//在此行之后插入一行
							$(".tr-holder").remove();
							var newLine = $("<tr class='tr-holder'></tr>");
							newLine.insertBefore(thisTr);
						}
					}
				}
			})
			jTableSpace.on("click",function(){
				if($(".tr-holder").length == 0){
					return;
				}else{
					if($(".tr-holder").next().length>0){
						thisObj.processOrder = $(".tr-holder").next().attr("index");
					}else{
						thisObj.processOrder = $(".tr-holder").prev().attr("index")-0+1;
					}
					if(url){
						$scope.askRequest({
							_type:"post",
							_url:url,
							_data:thisObj,
							_text:'调整失败！'
						});
						cleanE();
					}else{
						return thisObj.processOrder;
						//清除事件
						cleanE();
					}		
				}		
			});
		}else{
			thisObj.processOrder = "0";
			$scope.askRequest({
				_type:"post",
				_url:url,
				_data:thisObj,
				_text:'调整失败！'
			});
			cleanE();
		}
		
		//取消移动
		$(".cance-move,.close-dialog-window").on("click",function(){
			cleanE();
		});
		
		//清除事件
		function cleanE(){
			jTableSpace.off("click");
			jTableSpace.off("mouseenter");
			jTableSpace.off("mouseleave");
			jTableSpace.off("mousemove","*");
			$(".tr-holder").remove();
			$(".mouse-text").remove();
			$(".table-dialog-window").find(".sale-order-change").css("pointer-events","auto");
			$(".table-dialog-window").find("input").css("pointer-events","auto");
			$(".cance-move").hide();
		}
	}
	
	/**
	 * 暂存间功能用,接口调用方法
	 * @param {Object} 参数对象,包括_type(请求类型),_url（接口地址),_data(数据对象),_text(显示文本)
	 *
	 *
	 */
	$scope.askRequest = function(_obj){
		var _data = _obj._data;
		$http[_obj._type](_obj._url,_data).then(
			function(res){
				//刷新二级页面和暂存区
				$scope.cache_box();
				$scope.click_creat_window(_data.workDate,_data.workDate,_data.pUnitId+"_"+_data.pUnitType,"","","");
				hasChange = true;
				if($scope.checkSwitch){
					$scope.check(function(){
						if($scope.allSuccess){
							for(let i = 0 , l = $scope.listOne.length ; i < l ; i++){
								if($scope.listOne[i].info.length){
									return;
								}
							}
							$scope.close();
						}
					});
				}	
			},
			function(res){
				layer.alert(_obj._text, {
					skin: 'layer-alert-themecolor' //样式类名
				});
			}
		)
	}
	
		
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
	 * 点击查询，刷新页面。
	 **/
	$scope.search = function(){
		result_show_table(sessionStorage.locationId_res,sessionStorage.locationFilterList_res);
	}
        
    /**
	 * 表头单元格点击
	 **/
    $scope.date_click = function(date,$event) {
    	var mouseType = $event.button;
	    	//如果右键日期,不做处理.
	    	if(mouseType == 2){
	    		return;
	    	}
    	var thisData = date,
    		thisStartDate = thisData.thisDate,
    		thisEndDate = thisData.thisDate,
    		thisEquipment = thisData.equipment;
        var saleOrder = xujun_tool.getFromInput_nocode(".sale-order"),
			materialName = xujun_tool.getFromInput_nocode(".material-name"),
			materialCode = xujun_tool.getFromInput_nocode(".material-code");	
   		$scope.click_creat_window(thisStartDate,thisEndDate,thisEquipment,saleOrder,materialName,materialCode,mouseType);
    }
        
    /**
	 * 单元格鼠标点击事件
	 **/
    $scope.unit_click = function(cell,$event) {
    	var mouseType = $event.button;
        	if((cell[0].type == 1 && mouseType == 2) || (cell[0].type == 3 && mouseType == 0)){
	    		return;
	    	}		
        var thisInf = cell[0].args,
    		thisDate = thisInf.date,
    		thisStartDate = thisInf.s_date,
    		thisEndDate = thisInf.e_date,
    		thisEquipment = thisInf.equipment_id;
    	if(!!thisDate){
    		thisStartDate = thisDate;
    		thisEndDate = thisDate;
    	}
       //查询条件
		var saleOrder = xujun_tool.getFromInput_nocode(".sale-order"),
			materialName = xujun_tool.getFromInput_nocode(".material-name"),
			materialCode = xujun_tool.getFromInput_nocode(".material-code");	
		$scope.click_creat_window(thisStartDate,thisEndDate,thisEquipment,saleOrder,materialName,materialCode,mouseType);
    }
        
    
    /**
	 * 创建二级页面
	 **/
    $scope.click_creat_window = function(startTime,endTime,equipment,saleOrder,materialName,materialCode,mouseType){
    	if(mouseType == 0){
    		$rootScope.clickTimes.report ++ ;
    	}
    	if(mouseType == 2){
    		$rootScope.clickTimes.adjust ++ ;
    	}
		var thisStartTime = startTime,
			thisEndTime = endTime,
			thisEquipment = equipment+"",
			newurl="",
			thisEquipmentName = [],
			aEquipment = "";
			
		//设备列表
		if(thisEquipment.indexOf(",")>-1){
			aEquipment = thisEquipment.split(",");
		}else{
			aEquipment = [thisEquipment];
		}
		if($rootScope.local_test){
            /**
             * 本地测试方法
             */
            	var resData = test_dialog_table;
            	var headList = resData.columnAlias;//表头列表
            	var tableList = resData.column;		//表格数据顺序
            	var query = resData.query	//筛选项
            	var tableData = resData.row //表格数据
            	
            	var jHtml = "";
            	//添加一个固定遮挡表头
            	var coverHeadHtml = '<div class="cover-head">'
            	jHtml += '<div class="table-dialog-window"><div class="dialog-window-head"><i class="close-window"></i></div><div class="dialog-window-body"><div class="info-show">';
            	
            	//筛选项
            	jHtml += '<span>开始时间：'+thisStartTime+'</span><span>结束时间：'+thisEndTime+'</span><span>设备：'+query.equipment.join(",")+'</span></div><div class="show-table"><div class="table-space"><table><thead><tr>';
            	
            	//表头
            	for(var i in headList){
            		jHtml += '<th>'+headList[i]+'</th>';
            	}
            	jHtml += '</tr></thead><tbody>';
            	
            	//表格内容
            	for(var i in tableData){
            		var thisTr = tableData[i];
            		
            		jHtml += '<tr>';
            		for(var j in tableList){
            			jHtml += '<td>'+thisTr[tableList[j]]+'</td>';
            		}
            		jHtml += '</tr>';
            	}
            	jHtml += '</tbody></table></div></div></div></div>';
            	
            	$(".table-dialog-window").remove();
            	$(".wrap-content").append($(jHtml));
            	$(".close-window").on("click",function(){
					$(".table-dialog-window").remove();
				});
        }else{
            //查询二级页面数据
            var isArr=[];
			var isStr,
			newurl=$rootScope.restful_api.creat_secondPage;
			var aPunitId=aEquipment;
            for(var i in aPunitId){
            	var isObj={};
            	var newI=aPunitId[i].split("_");
            	
                isObj.freezeDate=goEquipment[aPunitId[i]].freezeDate;
                thisEquipmentName.push(goEquipment[aPunitId[i]].punitName);    
				isObj.equipmentId=newI[0];
            	isObj.equipmentType=newI[1];
            	isArr.push(isObj);
           }
			var body_data={    //向后台传送数据
				"startTime":thisStartTime,
				"endTime":thisEndTime,
				"materialName":materialName,
				"materialCode":materialCode,
				"saleOrderCode":saleOrder,
				"order":isStr,
				"equipments":isArr,
				"schemeId":sessionStorage.schemeId
			};
			//若为左键点击,跳转打开新页面
			if(mouseType == 0){
				var href = "./view/secondPage.html?result";
				localStorage.setItem("hrefPrameter",JSON.stringify(body_data))
				window.open(href);
				return;
			}
	        $http.post(newurl,body_data).then(
                //成功
                function(response){
                	var jTableDialogWindow = $(".table-dialog-window")
                	jTableDialogWindow.show();	                	
					$(".equipment-list").remove();
                	var resData = response.data;
	            	var headList = resData.columnAlias;//表头列表

					//保存数据
	            	goWindowTableData = $.extend({},resData);
	            	var windowTableData = scheduleTableViewModelService.jsonToWindowTableView(resData);
	            			            	
	            	//绑定页面
			    	$scope.headDataView = windowTableData.headData;
				    $scope.tableDataView = windowTableData.bodyData;
	
            		$timeout(function(){
            			//更新表头宽度
						setTableHeadWidth(jTableDialogWindow)
						//更新查询条件
						var windowSearchBox = $(".table-dialog-window").find(".window-search-box");
						windowSearchBox.eq(0).find("input").val(thisStartTime);
						windowSearchBox.eq(1).find("input").val(thisEndTime);
						windowSearchBox.eq(2).find("input").val(thisEquipmentName.join(","));
						windowSearchBox.eq(3).find("input").val(decodeURIComponent(saleOrder));
						windowSearchBox.eq(4).find("input").val(decodeURIComponent(materialName));
						windowSearchBox.eq(5).find("input").val(decodeURIComponent(materialCode));

						//初始化复选框
	            		$("input[name='single'],input[name='all']").prop("checked",false);
	            		$(".headCheckbox").css("pointerEvents","auto");
						
						//如果body部分复选框都不能点，那表头复选框也不能点
			            var clickableNum = 0;
			            var allSingleNum = $("input[name='single']").length;			            
			            $("input[name='single']").each(function(){
			            	var pointerEvents = $(this).css("pointerEvents");
			            	if(pointerEvents == "none"){
			            		clickableNum ++ ;
			            	}
			            })
			            if(allSingleNum == clickableNum){
			            	$(".headCheckbox").css("pointerEvents","none");
			            }
            		
            		},0);
					
		            //全选全不选
		            $("input[name=all]").on("click",function(){
		            	var checkValue = $(this).is(':checked') ;
		            	if(checkValue == true){
			            	$("input[name='single']").each(function(){
    							var pointerEvents = $(this).css("pointerEvents");
    							if(pointerEvents == "none"){
    								
    							}else{
    								$(this).prop("checked",true);
    							}
 							});			            		
		            		
		            	}else{
		            		$("input[name='single']").prop("checked",false);
		            	}
		            });
		            
					/*复选框反选*/
					 $("body").on("click","input[name='single']",function(){
					 	var chsub = $("input[name='single']").length;
					 	var checkedsub = $("input[name='single']:checked").length;
							if(chsub == checkedsub){
								$("input[name='all']").prop("checked",true);
							}else{
								$("input[name='all']").prop("checked",false);
							}
					 });

            		//关闭二级页面
            		$(".close-dialog-window").off("click");
            		$(".close-dialog-window").on("click",function(){
						$(".table-dialog-window").hide();
						$(".window-cover").hide();
						//关闭微调数量弹窗
						$(".num-window").hide();
						//关闭排序弹窗
						$scope.orderShow = false;
						//清空临时配置项存储的临时变量,重新定义配置项
						$scope.temporary = null;
						//清除用户移动后未保存的项目
						$("#all-item li").each(function(){
							if($(this).hasClass("js-move")){
								$(this).remove();
							}
						})
						
						//是否微调
						if(hasChange){
							//重新加载一级页面
							result_show_table(sessionStorage.locationId_res,sessionStorage.locationFilterList_res);
							hasChange = false;
						}
					});
                },
                //失败
                function(response){
					layer.alert('获取数据失败，请联系技术人员处理', {
						skin: 'layer-alert-themecolor' //样式类名
					});
                }
            );
        }	
    }
    
    /**
	 * 二级页面地点下拉框
	 **/
    $scope.equipment_list = function($event){
    	if($(".equipment-list").length > 0){
    		$(".equipment-list").remove();
    		$(".equipment-input").css("border","");
    	}else{
    		view_js.dialogWindowEquipment(goEquipment,$event,true);
    		$(".equipment-input").css("border","1px solid #1E7CD9");
    	}
    	$timeout(function(){
    		$(".equipment-list").on("click","li",function(){
    			$(".equipment-list").remove();
    		})
    		$(document).click(function(){
				$(".equipment-list").remove();
			});
			$(".equipment-list,.equipment-input").click(function(event){
   				 event.stopPropagation();
			});	
			
    	},0)
    }
    
    /**
	 * 二级页面点击查看
	 **/
	$scope.look_sale_order = function(thisRow,$event){
		$event.stopPropagation()
		var pkId = thisRow[0].pkId;
		var versionId = thisRow[0].versionId;
		var sUrl = "";
		if(versionId ==undefined){     
            sUrl="http://"+$rootScope.api_domain+"/api/schedule/result/"+pkId;
            $(".do-code").show();
            $(".pk-id").hide();
            $(".version-id").hide();
        }else{
			sUrl="http://"+$rootScope.api_domain+"/api/adjust/get/"+pkId+ "?versionId="+versionId;
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
			content : $("#do_detail_dialog_1"),
			success : function(){
				// 272是显示框正常宽度，450是高度
				$(".layui-layer").css({
					"left" : $event.pageX - 272,
					"top" : $event.pageY >(document.body.clientHeight - 450) ? document.body.clientHeight - 450 : $event.pageY
				})
				$("#do_detail_dialog_1").on("click",".sure",function(){
					layer.close(indexLayer);
				})
			}
		})
		
		$http.get(sUrl).then(
			function(res){
				//json转viewModel对象
                var do_detail = res.data;
                //绑定view层
                $scope.do_detail = do_detail;
                //关闭加载中图标
			},
			function(res){
				
			}
		);	
	}
	
	/**
	 * 二级页面内查询,刷新二级页面
	 **/
	$scope.change_window_table = function(){
		$scope.refreshDialogTable();
	}
	
	/**
	 * 刷新二级页面
	 **/
	$scope.refreshDialogTable = function(){
		//获取查询条件
		var inputList = xujun_tool.getFromInput_nocode(".table-dialog-window .info-show");
		var thisStartTime = inputList[0],
			thisEndTime = inputList[0],
			thisEquipmentName = decodeURIComponent(inputList[2]),
			saleOrder = inputList[3],
			materialName = inputList[4],
			materialCode = inputList[5],
			aEquipmentId = [];
		var mouseType = 2;//本地二级页面新增确定鼠标点击类型
		//输入检测
		if(!thisStartTime){
					layer.alert('请选择开始时间', {
						skin: 'layer-alert-themecolor' //样式类名
					});
			return;
		}else if(!thisEndTime){
					layer.alert('请选择结束时间', {
						skin: 'layer-alert-themecolor' //样式类名
					})
			return;
		}else if(!thisEquipmentName){
					layer.alert('请输入设备', {
						skin: 'layer-alert-themecolor' //样式类名
					}); 
			return;
		}
		
		//根据设备名获取设备ID
		var aEquipmentName = thisEquipmentName.split(",");
		var allEquipmentId = goInfo.punitId;
		var allEquipmentInfo = goInfo.punit;
		
		for(var i in allEquipmentInfo){
			var thisName = allEquipmentInfo[i].punitName;
			for(var j in aEquipmentName){
				if(aEquipmentName[j] == thisName){
					aEquipmentId.push(i);
				}
			}
		}
		if(aEquipmentId.length < 1){
			layer.alert('请输入正确的设备名称!', {
				skin: 'layer-alert-themecolor' //样式类名
			});
			return;
		}
		$scope.click_creat_window(thisStartTime,thisEndTime,aEquipmentId.join(","),saleOrder,materialName,materialCode);
	}
        //jquery控制表格显示样式，需要采用这种异步的方式调用
        function jqueryDraw(){
                $timeout(function() {
//                  view_js.autoResize();
					$(".search-box").hide();
					$(".search-btn").removeClass("search-btn-click");
                    //页面渲染绘制锁定期相关的信息：锁定期线，以后会扩展更多
                    if(tableBodyViewModel)view_js.aps_freeze_draw(tableBodyViewModel.tableTrFreezeInfo,tableBodyViewModel.tableTrOverCapability);
                }, 0)
        }
        /**************以下是本页实际执行的代码，上面都为函数和事件绑定****************/
        
	/**
	 * 地点显示
	 **/
    var thisUrl = $rootScope.restful_api.aps_location_writable;
	$http.get(thisUrl).then(
		function(res){
			var resData = res.data;
			$scope.resData=resData;
			var resData_body,
				arr_scheme = [];  //存方案
			for(var i = 0;i < resData.length;i++){   //排程方案与显示地点匹配
				if(resData[i].schemeId == sessionStorage.schemeId){
					resData_body=resData[i].locationDtoList;
					$(".location-scheme-select").text(resData[i].schemeName);   //显示方案名称
				}
			}
			var defaultList_res = [];
			for(var i in resData_body){
				defaultList_res.push(resData_body[i].locationId);
			}
			sessionStorage.defaultList_res = defaultList_res;  //存储当前地点树的地点
			$scope.folder = getData_two(resData_body)[0];
			/* ***默认值*** */
			$rootScope.locationId_res = resData_body[0].locationId;
			$rootScope.defaultLocation = []; 
			
			var outerEle = $(".location-list");
            outerEle  //改变状态
                .on("click","ul span",function(){
                	if($(this).next().find("ul li").length == 0){
                		return;
                	}else{
                		$(this).toggleClass("active").toggleClass("open");
                		$(this).next().toggle();
                	}
                	//设置前面线的高度
					let thisUL=$(this).parents("ul");
					let thisB=$(this).parents("ul").children("b");
					let thisLI=$(this).parents("ul").children("li")
					let thisHeight=0;
                	for(var i = 0;i < thisLI.length-1;i++){
						thisHeight += $(thisLI[i]).height();
                	}
                	thisB.height(thisHeight + 100);
                	//改变按钮的位置
                	var bgPosition = $(".location-choose").width();
					$(".out-bg").width(bgPosition);
                })
            	.on("click","ul i",function(){
            		//改变状态
                	changeSelectStatus($(this));  
                	//单选操作
                	$(this).parent().siblings("li").children("i").removeClass("active").removeClass("selected").addClass("unselect");
                })
            	
        	$timeout(function(){ 
                //移除span
                var clickSpan=$(".location-list").find("span");
                clickSpan.each(function(){
                	if($(this).next().find("li").length==0){
                		$(this).children("s").removeClass("open-btn");
                	}else{
                		$(this).children("s").addClass("open-btn");
                	}
                })
        	})
        	
        	//改变状态 方法
            function changeSelectStatus(thisSelect){   
            	var thisSelect = thisSelect;
            	//本身及所有后代的改变
            	if(thisSelect.hasClass("selectsome") || thisSelect.hasClass("unselect")){
            		thisSelect.removeClass("selectsome").removeClass("unselect").addClass("selected").addClass("active");
            		thisSelect.parent("li").find("folder-tree i").removeClass("selectsome").removeClass("unselect").addClass("selected").addClass("active");
            	}else{
            		thisSelect.removeClass("selected").addClass("unselect").removeClass("active");
            		thisSelect.parent("li").find("folder-tree i").removeClass("selected").addClass("unselect").removeClass("active");
            	}
            	//处于其影响范围内的祖先的改变
            	thisSelect.parents("folder-tree").each(function(){
            		var thisTree = $(this);
            		var thisStatus = thisTree.siblings(".selcetstatus");
            		if(thisTree.find(".selected").length < 1){
            			thisStatus.removeClass("selected").removeClass("active").removeClass("selectsome").addClass("unselect");
            		}else if(thisTree.find(".unselect").length < 1){
            			thisStatus.removeClass("selectsome").removeClass("unselect").removeClass("selectsome").addClass("selected").addClass("active");
            		}else{
            			thisStatus.removeClass("unselect").removeClass("selected").removeClass("active").addClass("selectsome");
            		}
            	})
            }
            
            //选择方案显示
		    $("body")
		    	.on("click",".location-scheme-select",function(){
					if($(".location-scheme-option").css("display") == "none") {
						$(".location-scheme-option").slideDown(80);
						$(this).addClass("select-li");
					} else if($(".location-scheme-option").css("display") == "block"){
						$(".location-scheme-option").slideUp(80);
						$(this).removeClass("select-li");
					}
			    })
		    	.on("click",".location-scheme-option li",function(){
		    		$(".location-scheme-option").slideUp(80);
		    		$(".location-scheme-select").text($(this).text());
		    	})
		    	
		    //点击选择方案
		    $scope.scheme_btn=function(id){
		    	var resData_bodys;
		    	//排程方案与显示地点匹配
		    	for(var i = 0;i < resData.length;i++){   
					if(resData[i].schemeId == id){
						resData_bodys=resData[i].locationDtoList;
					}
				}
				var defaultList_res=[];
				for(var i in resData_bodys){
					defaultList_res.push(resData_bodys[i].locationId);
				}
				//存储当前地点树的地点
				sessionStorage.defaultList_res=defaultList_res;
				//绑定数据,显示
				$scope.folder = getData_two(resData_bodys)[0];
				//存储schemeId
			    sessionStorage.schemeId = id;  
				//默认值
				$rootScope.locationId_res = resData_bodys[0].locationId;
				$rootScope.defaultLocation=[];
				
				//取消排程 往后台发送数据 (刷新新数据)
				var data_body={     
					"schemeId":"",
					"locationDtoList":[]
				};
				for(var i = 0;i < defaultList_res.length;i++){
					var objLocation={};
				    var locationDtoList=[];
					objLocation.locationId = defaultList_res[i];
					objLocation.locationFilterList = [];
					data_body.locationDtoList.push(objLocation);
					data_body.schemeId=id;
				}
				sessionStorage.setItem("cancel_data",JSON.stringify(data_body));
				
				//默认勾中第一个
			    $timeout(function(){
					var defaultEle = $(".location-list").children("folder-tree").children("ul").children("li:eq(0)").children("i")
					var defaultId = defaultEle.attr("location-id");
					if(sessionStorage.locationId_res){
						//判断缓存是否为当前地点树的地点
						if(sessionStorage.defaultList_res.indexOf(sessionStorage.locationId_res)>-1){   
							$("i[location-id="+sessionStorage.locationId_res+"]").click();
							result_show_table(sessionStorage.locationId_res,sessionStorage.locationFilterList_res);  //查询显示
							jqueryDraw();          //页面显示表格
						}else{
							$("i[location-id="+defaultId+"]").click();
				    		sessionStorage.locationId_res=$rootScope.locationId_res;
				    		sessionStorage.locationFilterList_res=[];
				    		result_show_table($rootScope.locationId_res,$rootScope.defaultLocation);  
							jqueryDraw(); 
						}
					}else{
			    		$("i[location-id="+defaultId+"]").click();
			    		sessionStorage.locationId_res=$rootScope.locationId_res;
			    		sessionStorage.locationFilterList_res = [];
			    		result_show_table($rootScope.locationId_res,$rootScope.defaultLocation);  
						jqueryDraw();
					}
					
					//pap相关接口body值
					var papBodyData = {      
						"schemeId":parseInt(sessionStorage.schemeId),
						"locationDtoList":[]
					}; 
					var papObj = {
						"locationId":"",
						"locationFilterList":[]
					};
					papObj.locationId=sessionStorage.locationId_res;
					papObj.locationFilterList=[];
					papBodyData.locationDtoList.push(papObj);
					sessionStorage.setItem("papBodyData",JSON.stringify(papBodyData));
					
					//获取并改变点击按钮的位置
					var bgPosition=$(".location-choose").width(); 
					$(".out-bg").width(bgPosition); 
					$(".location-title").width(bgPosition);
				},50)
			    
			    //重新获取锁定期
			    $http.get($rootScope.restful_api.get_freeze_days +　"?schemeId=" + sessionStorage.schemeId).then(
					function(res) {
						var resData = res.data.lockDate; //锁定期
						if(resData){
							fact_days = resData; //锁定期(可预排最大日期)
						}else{
							layer.alert('锁定期接口获取的数据发生错误,请联系技术人员', {
								skin: 'layer-alert-themecolor' //样式类名
							});
						}
					},
					function(res) {
						layer.alert('获取锁定期失败,请联系技术人员', {
							skin: 'layer-alert-themecolor' //样式类名
						});
					});
					
				//刷新暂存间
				$scope.cache_box_again = function(){
					var jCacheWindow = $(".cache-window");	
					var jInfoShow = jCacheWindow.find(".info-show");
					var jInfoShowInput = jInfoShow.find("input");
					
					var inputList = xujun_tool.getFromInput(".cache-window .info-show"),
						saleOrderCode = inputList[0],
						materialName = inputList[1],
						materialCode = inputList[2];
					
			        var sUrl=$rootScope.restful_api.cache_info+"?schemeId="+sessionStorage.schemeId;
			        $http.get(sUrl).then(
			        	function(res){
							var cacheNum = res.data.row.length;
							cacheNum>0 ? $(".cache-num").show().text(cacheNum>999?"999+":cacheNum) : $(".cache-num").hide();
			        		var windowTableData = scheduleTableViewModelService.jsonToWindowTableView(res.data);
			        		$scope.cacheHeadDataView = windowTableData.headData;
			        		$scope.cacheTableDataView = windowTableData.bodyData;
							$timeout(function(){setTableHeadWidth($(".cache-window"))},0);
							
							//resize
							$(window).on("resize",function(){
								setTableHeadWidth($(".cache-window"));
							});
							
							$timeout(function(){
								//初始化复选框
			            		$("input[name='StorageSingle'],input[name='StorageAll']").prop("checked",false);
							
					            //全选全不选
					            $("input[name=StorageAll]").on("click",function(){
					            	var checkValue = $(this).is(':checked') ;
					            	if(checkValue == true){
										$("input[name='StorageSingle']").prop("checked",true);		
					            	}else{
					            		$("input[name='StorageSingle']").prop("checked",false);
					            	}
					            });
								/*复选框反选*/
								 $("body").on("click","input[name='StorageSingle']",function(){
								 	var chsub = $("input[name='StorageSingle']").length;
								 	var checkedsub = $("input[name='StorageSingle']:checked").length;
										if(chsub == checkedsub){
											$("input[name='StorageAll']").prop("checked",true);
										}else{
											$("input[name='StorageAll']").prop("checked",false);
										}
								 });       
							},0);
							//关闭暂存间
							jCacheWindow.find(".close-window").on("click",function(){
								jCacheWindow.hide();
							})
			        	}
			      );
				}
				$scope.cache_box_again();
		    }
		}
    );
   
    /**
	 * 默认勾中第一个
	 **/
    $timeout(function(){
    	var defaultEle = $(".location-list").children("folder-tree").children("ul").children("li:eq(0)").children("i")
		var defaultId = defaultEle.attr("location-id");
		if(sessionStorage.locationId_res){
			//判断缓存是否为当前地点树的地点
			if(sessionStorage.defaultList_res.indexOf(sessionStorage.locationId_res) > -1){   
				$("i[location-id="+sessionStorage.locationId_res+"]").click();
				result_show_table(sessionStorage.locationId_res,sessionStorage.locationFilterList_res);  //查询显示
				jqueryDraw();          //页面显示表格
			}else{
				$("i[location-id="+defaultId+"]").click();
	    		sessionStorage.locationId_res = $rootScope.locationId_res;
	    		sessionStorage.locationFilterList_res=[];
	    		result_show_table($rootScope.locationId_res,$rootScope.defaultLocation);  //查询显示
				jqueryDraw(); 
			}
		}else{
    		$("i[location-id="+defaultId+"]").click();
    		sessionStorage.locationId_res = $rootScope.locationId_res;
    		sessionStorage.locationFilterList_res = [];
    		result_show_table($rootScope.locationId_res,$rootScope.defaultLocation);  
			jqueryDraw(); 
		}
		$(".out-bg").animate({width:"64px"},0);
		
		//pap相关接口body值
		var papBodyData = {      
			"schemeId":parseInt(sessionStorage.schemeId),
			"locationDtoList":[]
		}; 
		var papObj = {
			"locationId":"",
			"locationFilterList":[]
		};
		papObj.locationId = sessionStorage.locationId_res;
		papObj.locationFilterList = [];
		papBodyData.locationDtoList.push(papObj);
		sessionStorage.setItem("papBodyData",JSON.stringify(papBodyData));
	},50)
    
	/**
	 * 点击确定，向后台传选中数据
	 **/
    $scope.sure = function(){
    	var locationList = $(".selected"),
    		thisLocationId = locationList.attr("location-id");
		if(locationList.length == 0){
			layer.alert('请选择要查看的地点', {
				skin: 'layer-alert-themecolor' //样式类名
			});
    		return;
    	}
    	sessionStorage.locationId_res = thisLocationId;
    	sessionStorage.locationFilterList_res = [];
		var papBodyData = {      //pap相关接口body值
			"schemeId":parseInt(sessionStorage.schemeId),
			"locationDtoList":[]
		}; 
		var papObj = {
			"locationId":"",
			"locationFilterList":[]
		};    //pap相关body数据
		papObj.locationId = sessionStorage.locationId_res;
		papObj.locationFilterList = [];
		papBodyData.locationDtoList.push(papObj);
		sessionStorage.setItem("papBodyData",JSON.stringify(papBodyData));
		$rootScope.getsessionStorage(sessionStorage.locationId_pre,sessionStorage.locationId_res);
        result_show_table(sessionStorage.locationId_res,sessionStorage.locationFilterList_res);  //获取表格数据
        jqueryDraw();   //显示表格
		//更改为默认第一级展开状态,并将地点树隐藏
		$(".title span").removeClass("title-close").addClass("title-open");
		$(".root").find("ul").hide();
		$(".location-choose").animate({left:"-280px"},400);
		$(".point-click").css("background-position","0px 0px");
		$(".out-bg").animate({width:"64px"},400);
    }
    
    /**
	 * 初始化剩余条数
	 **/
	$timeout(function(){
        var sUrl=$rootScope.restful_api.cache_info+"?schemeId="+sessionStorage.schemeId;
		$http.get(sUrl).then(
			function(res){
				var cacheNum = res.data.row.length;
				if(cacheNum > 999){
					cacheNum = "999+";
				}
				if(cacheNum == 0){
					$(".cache-num").hide();
					return;
				}
				$(".cache-num").show().text(cacheNum);
			},
			function(res){
				
			}
		);
		$scope.hideButton();//前拉后推按钮
	},60)
	
});