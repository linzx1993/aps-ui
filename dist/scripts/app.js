/**
 * version:1.1
 * changed by xujun on 2016/7/1.
 * name:app.js
 * description:global namespace
 * Created by xujun on 2016/6/30.
 */
var loginOutUrl = "";
var app = angular.module('myApp', ['ui.router','pascalprecht.translate']).run(function($rootScope,$http){//全局配置
        //注意，这个页面内容稍后要移到单独的配置表里去

        /**
         * local     ：本地环境。连接本地的后端接口（127.0.0.1），用于本地测试。         【后端开发人员】、【测试人员】
         * local_test：本地调试。给前端人员本地调试代码用，使用模拟的json数据进行测试    【前端开发人员】
         * daily_ued ：日常环境（UED）。给前端使用的日常服务器接口【前端开发人员】       【前端开发人员】
         * daily     ：日常环境。连接日常服务器的接口                                    【配置员】
         * product   ：生产环境。用于正式上线时候，给客户用的配置                        【配置员】
         */
        $rootScope.active ="daily_ued";

        //配置项对应的后端接口
        if($rootScope.active == "product"){
            $rootScope.api_domain = "";//线上API端口，待配置
        }else if($rootScope.active == "daily_ued") {
            $rootScope.api_domain = "192.168.200.161:8080";
            $rootScope.daily_test = true;//日常服务器的标识
        }else if($rootScope.active == "daily") {
            $rootScope.api_domain = "192.168.200.170:8080";
            $rootScope.daily_test = true;//日常服务器的标识
        }else if($rootScope.active == "local_test") {
            $rootScope.api_domain = "";	
            $rootScope.local_test = true;//使用本地json测试的标识
        }else if($rootScope.active == "local") {
            $rootScope.api_domain = "127.0.0.1:8080";
        }else{
            alert("配置错误，请指定正确的运行环境");
        }
        
        //调试开关
        $rootScope.debug = true;
        //用户名
        $rootScope.userName = "";
        //默认翻转状态
        $rootScope.frontBack = true;
        //左右键点击次数
        $rootScope.clickTimes = {
        	adjust:0,
        	report:0
        }
        //打印日志
        if($rootScope.debug)console.log("log: global module has load, debug mode is on, log will print on screen.");
		
//		if(localStorage.getItem("from")){
//			thisUrl.replace("/home",localStorage.getItem("from"));
//			localStorage.removeItem("from");
//			window.location.href = thisUrl;
//		}

        //车间ID,地点信息，全局变量。具体到某个API时，可以取这个值的子集去传
        $rootScope.locationIdList = ["0104"];
        $rootScope.locationIdListOne = "0104";
		var currentLocation = $rootScope.current_location;
        //restful API,每个URL中带userId参数，以后放到authorization中去
        
		$rootScope.getsessionStorage = function(locationID_pre,locationID_res,fromPre){
			var locationID_pre = locationID_pre;
			var locationID_res = locationID_res;
			if(fromPre){
				var thisID = locationID_pre;
			}else{
				var thisID = locationID_res;
			}
			
			$rootScope.restful_api = {
				//一级页面结果页
				"preview_show_table":"http://"+$rootScope.api_domain+"/api/schedule/result/last/location/"+locationID_pre+"/packaged",
				//一级页面过程页
				"result_show_table":"http://"+$rootScope.api_domain+"/api/schedule/result/temp/location/"+locationID_res+"/packaged",
				//差异化之前信息
				"front_info":"http://"+$rootScope.api_domain+"/api/schedule/result/last/location/"+locationID_res+"/packaged",
				//差异信息
				"differ_info":"http://"+$rootScope.api_domain+"/api/aps/compare/location/"+locationID_res+"/order/list",
				//二级差异化
				"secondPage_differ":"http://"+$rootScope.api_domain+"/api/aps/compare/location/"+locationID_res+"/order?",
				//以车间计划判断
				"workshop_plan":"http://"+$rootScope.api_domain+"/api/aps/compare/location/"+locationID_res+"/order/data?",
				//暂存间
				"cache_info":"http://"+$rootScope.api_domain+"/api/manual/storage/temp/location/"+locationID_res+"/list",
				//移入暂存间
				"cache_movein":"http://"+$rootScope.api_domain+"/api/manual/storage/location/"+locationID_res+"/put",
				//移出暂存间
				"cache_moveout":"http://"+$rootScope.api_domain+"/api/manual/storage/location/"+locationID_res+"/remove",
				//部分移入暂存间
				"cache_movein_part":"http://"+$rootScope.api_domain+"/api/manual/storage/put/location/"+locationID_res+"/part",
				//部分移出暂存间
				"cache_moveout_part":"http://"+$rootScope.api_domain+"/api/manual/storage/remove/location/"+locationID_res+"/part",
				//结果页二级页面
				"pre_sourceUrl":"http://"+$rootScope.api_domain+"/api/schedule/result/last/location/"+locationID_pre+"/report",
				//结果页导出Excel
				"excel_pre":"http://"+$rootScope.api_domain+"/api/schedule/result/last/location/"+locationID_pre+"/report/excel",
				//微调页二级页面
				"res_sourceUrl":"http://"+$rootScope.api_domain+"/api/schedule/result/temp/location/"+locationID_res+"/report",
				//微调页导出Excel
				"excel_res":"http://"+$rootScope.api_domain+"/api/schedule/result/temp/location/"+locationID_res+"/report/excel",
	            //结果页三级界面
	            "preview_third":"http://"+$rootScope.api_domain+"/api/schedule/result/",
	            //微调页三级界面
	            "result_third":"http://"+$rootScope.api_domain+"/api/adjust/get/",
	            //开始排程
	            "aps_trigger" : "http://" + $rootScope.api_domain + "/api/schedule/trigger", 
	            //排程进度
	            "aps_rate" : "http://" + $rootScope.api_domain + "/api/schedule/rate",  //自动排程
	            //前拉后推进度
	            "aps_rate_around" : "http://" + $rootScope.api_domain + "/api/adjust/pap/rate",  
	            //前拉后推按钮
	            "aps_rate_ar_button" : "http://" + $rootScope.api_domain + "/api/adjust/pap/trigger/all",  
	            //删除前拉后推进度
	            "aps_rate_around_del" : "http://" + $rootScope.api_domain + "/api/adjust/pap/reverse/rate", 
	            //触发删除前拉后推
	            "aps_rate_around_del_but" : "http://" + $rootScope.api_domain + "/api/adjust/pap/reverse/all", 
	            //保存进度
	            "aps_rate_confirm" : "http://" + $rootScope.api_domain + "/api/adjust/confirm/rate",
	            //前拉后推按钮隐藏
	            "aps_config" : "http://" + $rootScope.api_domain + "/api/adjust/pap/config/judge",  
	            //校验
	            "aps_check" : "http://" + $rootScope.api_domain + "/api/schedule/validate", 
	            //微调回退
	            "aps_rollback" : "http://" + $rootScope.api_domain + "/api/adjust/rollback",     
	            //取消自动排程
	            "aps_cancel":"http://" + $rootScope.api_domain + "/api/adjust/cancel",
	            //自动排程结果保存
	            "aps_save":"http://" + $rootScope.api_domain + "/api/adjust/confirm",
	            //一级查询可读权限
	            "aps_location_readable":"http://" + $rootScope.api_domain + "/api/location/cache/readable",
	            //一级操作权限
	            "aps_location_writable":"http://" + $rootScope.api_domain + "/api/schedule/location",
	            //预排转实际
	            "plan_to_fact" : "http://" + $rootScope.api_domain + "/api/adjust/dispatchorder/preschedule/confirm",
	            //清除后端缓存
	            "clearCatch" : "http://" + $rootScope.api_domain + "/api/aps/cache/routing",
	            //列信息配置
	            "column_content_config" : "http://" + $rootScope.api_domain + "/api/aps/config/aps-view-report_column?locationId=",
	            //多列排序信息配置
	            "sort_content_config" : "http://" + $rootScope.api_domain + "/api/aps/config/aps-view-report_column_order?locationId=",
	            //合并项配置
	            "sort_combine_config" : "http://" + $rootScope.api_domain + "/api/aps/config/aps-view-report_column_merge?locationId=",
	            //汇总项配置
	            "sort_summary_config" : "http://" + $rootScope.api_domain + "/api/aps/config/aps-view-report_column_summary?locationId=",
	            //pap规则配置
	            "papRule_content_config" : "http://" + $rootScope.api_domain + "/api/aps/config/aps-pap-adjust_use_pap?locationId=",
	            //管理员配置页面
	            "admin_content_config" : "http://" + $rootScope.api_domain + "/api/admin/aps/config/aps-system-workshop_type?locationId=",	            
	        	//退出登录
	        	"login_out" : "http://" + $rootScope.api_domain + "/api/aps/login/loginOut",
	            //获取所有规则ID
	            "all_schedule_rule" : "http://" + $rootScope.api_domain + "/api/aps/rule/user/brief",
	            //删除，修改，创建单个排程规则
	            "single_schedule_rule" : "http://" + $rootScope.api_domain + "/api/aps/rule/",
	            //获取所有排程方案
	            "all_schedule_plan" : "http://" + $rootScope.api_domain + "/api/aps/scheme/user/brief",
	            //删除，修改，创建单个排程方案
	            "single_schedule_plan" : "http://" + $rootScope.api_domain + "/api/aps/scheme/",
	            //版本号
	            "public_version_number" : "http://" + $rootScope.api_domain + "/public/info/version",
	            //获取锁定期   
	            "get_lock_days" : "http://" + $rootScope.api_domain + "/api/aps/setting/location/" + locationID_pre +"/lockdate",
	            //获取冻结期
	            "get_freeze_days" : "http://" + $rootScope.api_domain + "/api/adjust/location/" + locationID_res + "/freezedate",
	            //配置页无修改地点树
	            "get_new_location" : "http://" + $rootScope.api_domain + "/api/location/cache/writable",
	            //显示项恢复默认配置
	            "reset_show_column":"http://" + $rootScope.api_domain + "/api/aps/config/admin/default/report/view/view-report-column?locationId=",
	            //再编辑
	            "edit_again" : "http://" + $rootScope.api_domain + "/api/adjust/reedit",
	            //用token查询用户信息
	            "user_info" : "http://" + $rootScope.api_domain + "/api/aps/login/getUserInfo",
	            //外部差异
	            "exter_differ" : "http://" + $rootScope.api_domain + "/api/aps/change/" + locationID_pre +"/pool_task/list?",
	            //默认翻转状态
	            "front_back" : "http://" + $rootScope.api_domain + "/api/aps/config/admin/default/primary/view/view-turn-over?locationId=sys",
	            //AB测试
	            "ABexperiment" : "http://" + $rootScope.api_domain + "/debug/abexperiment/adjustreport/usage/incr",
	            //获取AB测试
	            "getAB" : "http://" + $rootScope.api_domain + "/debug/abexperiment/adjustreport/usage",
	            //合并规则
	            "group_by" : "http://" + $rootScope.api_domain + "/api/aps/config/user/schedule/view/schedule-unit-type?locationId=" + thisID,
	            //获取显示天数
	            "get_show_days" : "http://" + $rootScope.api_domain + "/api/aps/config/user/schedule/view/schedule-day-number?locationId=" + thisID,
	       };
		}
		$rootScope.getsessionStorage();
		loginOutUrl = $rootScope.restful_api.login_out;
		
        $rootScope.clearCache = function(){
            $http.post($rootScope.restful_api.clearCatch)
                .success(function(res){
                })
				.error(function(error){
				})
        }
        //获取默认翻转状态
        $http.get($rootScope.restful_api.front_back).then(
    		function(res){
    			var info = res.data.selectList;
    			$rootScope.frontBack = info[0].valueContent == 1 ? false : true;
    		},
    		function(res){
    			
    		}
    	);
        
        $rootScope.userId = 1;  //单点登录暂时没有开启，没有userId，现统一设置为1 /* 开启之后即可删除  */
        
        // //使用token取用户信息
		// if(localStorage.getItem("token")){
		// 	$http.get($rootScope.restful_api.user_info).then(
		// 		function(res){
		// 			if(res.data){
		// 				$rootScope.userName = res.data.nickName;
		// 				$rootScope.userId = res.data.userId;
		// 			}else{
		// 				layer.alert('获取用户名失败！', {
		// 					skin: 'layer-alert-themecolor' //样式类名
		// 				});
		// 			}
		// 		},
		// 		function(res){
		// 			layer.alert('获取用户名失败！', {
		// 				skin: 'layer-alert-themecolor' //样式类名
		// 			});
		// 		}
		// 	);
		// }

//		$http.get($rootScope.restful_api.getAB).then(
//			function(res){
//				console.log(res);
//			},
//			function(res){
//				console.log(res);
//			}
//		);
		//离开页面时保存AB测试信息
		window.onbeforeunload = function(){
			if($rootScope.clickTimes.adjust > 0){
				$http.post($rootScope.restful_api.ABexperiment + "?op=adjust&num=" + $rootScope.clickTimes.adjust).then(
					function(res){
					},
					function(res){	
					}
				);
			}
			
			if($rootScope.clickTimes.report > 0){
				$http.post($rootScope.restful_api.ABexperiment + "?op=report&num=" + $rootScope.clickTimes.report).then(
					function(res){					
					},
					function(res){					
					}
				);
			}		
		}
		
    }
).config(function($httpProvider) {
	var thisUrl = window.location.href;
	if(thisUrl.indexOf("token")>-1){
		var tIndex = thisUrl.indexOf("token=");
		var thisToken = thisUrl.substring(tIndex+6,tIndex+22);
		
		if(thisToken.indexOf("token") == -1){
			localStorage.setItem("token",thisToken)
		}
	}
	
    $httpProvider.defaults.headers.common = { 'X-Requested-With' : 'XMLHttpRequest','Authorization':localStorage.getItem("token") || ""};
    $httpProvider.interceptors.push(['$rootScope', '$q', function ($rootScope, $q) {
      return {
        request: function (config) {

          config.headers = config.headers || {};
          var thisUrl = window.location.origin + window.location.pathname;
          var tokenIndex = thisUrl.indexOf("token=");
          thisUrl.replace(thisUrl.substring(tokenIndex,tokenIndex+22),"");
          config.headers.redirectUrl = thisUrl;
          
          return config;
        },

        response: function (response) {

	        if (response.status == 200 && response.data.error_response && response.data.error_response.code == 1) {
	            window.location.href = response.data.error_response.sub_msg;
	    		return response;
	        }
			
			if (response.status == 200 && response.data.success_response!=undefined){
				response.data = response.data.success_response;
			}
			
            return response || $q.when(response);
        },

        responseError: function (response) {
        
          return $q.reject(response);
        }
      }
    }])
});