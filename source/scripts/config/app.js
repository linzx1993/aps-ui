/**
 * version:1.1
 * changed by linzx on 2017/8/1.
 * name:app.js
 * description:global namespace
 * Created by xujun on 2016/6/30.
 */
let loginOutUrl = "";
var app = angular.module('myApp', ['ui.router','pascalprecht.translate','ngTouch']).run(function($rootScope,$http,http){
	//全局配置

	//与mes项目协调配合一个全局的配置文件,用于测试，后台，实施人员配置调试
	$rootScope.api_domain = window.api_domain;

	//调试开关
	$rootScope.debug = false;
	//用户名
	$rootScope.userName = "";

	//打印日志
	if($rootScope.debug)console.log("log: global module has load, debug mode is on, log will print on screen.");

	//错误码对象
	$rootScope.errorCode = {
		0 : "系统异常：未知错误",
		50 : "系统异常：参数为空",
		51 : "系统异常：参数格式错误",
		52 : "系统异常：参数范围错误",
		101 : "系统异常：资源请求无效",
		102 : "系统异常：无资源访问权限",
		103 : "系统异常：资源已被占用，无法删除",
		1004 : "该方案正在排程中",
		1005 : "该方案下的地点正在排程中",
		2001 : "该设备不允许加工此物料"
	};

	$rootScope.getsessionStorage = function(locationID_pre,locationID_res,fromPre){

		let thisID = fromPre ? locationID_pre : locationID_res;

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
			//设备结果页二级页面-换装接口/api/schedule/result/last/location/0104/retool
			"pre_sourceUrl_retool":"http://"+$rootScope.api_domain+"/api/schedule/result/last/location/"+locationID_pre+"/retool",
			//手动微调页二级页面-换装接口/api/schedule/result/temp/location/010401/retool
			"res_sourceUrl_retool":"http://"+$rootScope.api_domain+"/api/schedule/result/temp/location/"+locationID_res+"/retool",
			//设备作业页二级页面
			"pre_sourceUrl":"http://"+$rootScope.api_domain+"/api/schedule/result/last/location/"+locationID_pre+"/report",
			//设备作业页导出Excel
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
			//开始排程时，排程原因的下拉列表
			"schedule_reason_list" : "http://" + $rootScope.api_domain + "/api/schedule/reason",
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
			//版本号
			"public_version_number" : "http://" + $rootScope.api_domain + "/public/info/version",
			//一级页面显示天数
			"firstPage_display_days" : "http://" + $rootScope.api_domain + "/api/aps/config/user/schedule/view/schedule-day-number?locationId=",
			//一级页面合并项选择
			"firstPage_display_combine" : "http://" + $rootScope.api_domain + "/api/aps/config/user/schedule/view/schedule-unit-type?locationId=",
			//一级页面翻转项
			"firstPage_display_flip" : "http://" + $rootScope.api_domain + "/api/aps/config/admin/default/primary/view/view-turn-over?locationId=",
			//二级页面列信息配置
			"column_content_config" : "http://" + $rootScope.api_domain + "/api/aps/config/user/report/view/report-column?locationId=",
			//多列排序信息配置
			"sort_content_config" : "http://" + $rootScope.api_domain + "/api/aps/config/user/report/view/report-column-order?locationId=",
			//合并项配置
			"sort_combine_config" : "http://" + $rootScope.api_domain + "/api/aps/config/user/report/view/report-column-merge?locationId=",
			//汇总项配置
			"sort_summary_config" : "http://" + $rootScope.api_domain + "/api/aps/config/user/report/view/report-column-summary?locationId=",
			//任务池计划进度列信息
			"task_column_plan_config" : "http://" + $rootScope.api_domain + "/api/aps/config/user/pool-task-change/view/column?locationId=",
			//任务池订单维度列信息
			"task_column_order_config" : "http://" + $rootScope.api_domain + "/api/aps/config/user/pool-task-change/view/order/column?locationId=",
			//暂存间显示项
			"cache_room_plan_config" : "http://" + $rootScope.api_domain + "/api/aps/config/user/report/view/storage/report-column?locationId=",
			//暂存间订单维度显示项
			"cache_room_order_config" : "http://" + $rootScope.api_domain + "/api/aps/config/user/report/view/storage/by/order/report-column?locationId=",
			//管理员配置页面
			"admin_content_config" : "http://" + $rootScope.api_domain + "/api/admin/aps/config/aps-system-workshop_type?locationId=",
			//获取所有规则ID
			"all_schedule_rule" : "http://" + $rootScope.api_domain + "/api/aps/rule/user/brief",
			//删除，修改，创建单个排程规则
			"single_schedule_rule" : "http://" + $rootScope.api_domain + "/api/aps/rule/",
			//删除，修改，创建单个排程方案
			"single_schedule_plan" : "http://" + $rootScope.api_domain + "/api/aps/scheme/",
			//获取所有排程方案
			"all_schedule_plan" : "http://" + $rootScope.api_domain + "/api/aps/scheme/user/brief",
			//退出登录
			"login_out" : "http://" + $rootScope.api_domain + "/api/aps/login/loginOut",
			//获取锁定期
			"get_lock_days" : "http://" + $rootScope.api_domain + "/api/aps/setting/location/" + locationID_pre +"/lockdate",
			//获取冻结期
			"get_freeze_days" : "http://" + $rootScope.api_domain + "/api/adjust/location/" + locationID_res + "/freezedate",
			//配置页无修改地点树
			"get_new_location" : "http://" + $rootScope.api_domain + "/api/location/cache/writable",
			//获取用户最后一次登录地点获取
			"view_last_location" : "http://" + $rootScope.api_domain + "/api/aps/config/user/lastLocation/view-last-location",
			//显示项恢复默认配置
			"reset_show_column":"http://" + $rootScope.api_domain + "/api/aps/config/admin/default/report/view/view-report-column?locationId=",
			//再编辑
			"edit_again" : "http://" + $rootScope.api_domain + "/api/adjust/reedit",
			//用token查询用户信息
			"user_info" : "http://" + $rootScope.api_domain + "/api/aps/login/getUserInfo",
			//外部差异
			"exter_differ" : "http://" + $rootScope.api_domain + "/api/aps/change/" + locationID_pre +"/pool_task/list",
			//默认翻转状态
			"front_back" : "http://" + $rootScope.api_domain + "/api/aps/config/admin/default/primary/view/view-turn-over?locationId=" + thisID,
			//AB测试
			"ABexperiment" : "http://" + $rootScope.api_domain + "/debug/abexperiment/adjustreport/usage/incr",
			//获取AB测试
			"getAB" : "http://" + $rootScope.api_domain + "/debug/abexperiment/adjustreport/usage",
			//合并规则
			"group_by" : "http://" + $rootScope.api_domain + "/api/aps/config/user/schedule/view/schedule-unit-type?locationId=" + thisID,
			//获取显示天数
			"get_show_days" : "http://" + $rootScope.api_domain + "/api/aps/config/user/schedule/view/schedule-day-number?locationId=" + thisID,
			//查询产能
			"get_capability" : "http://" + $rootScope.api_domain + "/api/manual/capability/location/" + locationID_res + "/list",
			//一级界面移入暂存区
			"first_moveto_cache" :　"http://" + $rootScope.api_domain + "/api/manual/storage/schedule/location/" + locationID_res + "/put",
			//一级界面移出暂存区
			"first_moveto_work" :　"http://" + $rootScope.api_domain + "/api/manual/storage/schedule/remove/location/" + locationID_res + "/part",
			//物料信息页接口
			"material_info" : "http://" + $rootScope.api_domain + "/api/procurement/requirements",
			//微调提示
			"cache_tip" : "http://" + $rootScope.api_domain + "/api/manual//suggest/location/" + locationID_res + "/list",
			//获取时间偏移量
			"get_deviation" : "http://" + $rootScope.api_domain + "/api/aps/setting/day_sec",
			//校验时对多方案排程进行校验
			"result_version_validate" : "http://" + $rootScope.api_domain + "/api/schedule/result-version-validate?schemeId=",
			//全部设备查询
			"get_all_equipment" : "http://" + $rootScope.api_domain + "/api/production/getProductionUnit",
			//获取所有的设备类型
			"get_equipment_type" : "http://" + $rootScope.api_domain + "/api/equipmentType/getAllEquipmentType",
			//微调修改开始时间
			"order_change_start_time" : "http://" + $rootScope.api_domain + "/api/manual/update/dispatchOrderAdjustTmp/startTime",
			//查询班次
			"get_shift" : "http://" + $rootScope.api_domain + "/api/shift/type/name",
			//一级页面单元格类型
			"display_Info" : "http://" + $rootScope.api_domain + "/api/aps/display/scheme/schedule?displaySchemeId=1&locationId=" + thisID,
			//暂存间订单维度
			"cache_info_order" : "http://" + $rootScope.api_domain + "/api/manual/storage/temp/location/" + locationID_res + "/list/order",
			//任务池订单维度
			"exter_differ_order" : "http://" + $rootScope.api_domain + "/api/aps/change/" + locationID_pre + "/pool_task/list/order",
			//A换B（结果表）
			"a_to_b_preview" : "http://" + $rootScope.api_domain + "/api/schedule/retool/result/location/" + locationID_pre + "/report",
			//A换B（临时表）
			"a_to_b_result" : "http://" + $rootScope.api_domain + "/api/schedule/retool/temp/location/" + locationID_res + "/report",
			//任务清单（结果表）
			"task_list_preview" : "http://" + $rootScope.api_domain + "/api/schedule/task/result/location/" + locationID_pre + "/report",
			//任务清单（临时表）
			"task_list_result" : "http://" + $rootScope.api_domain + "/api/schedule/task/temp/location/" + locationID_res + "/report",
			//任务清单，换模，三级页面（结果表）
			"tasklist_change_preview" : "http://"+$rootScope.api_domain+"/api/schedule/retool/result/detail/",
			//任务清单，换模，三级页面（临时表）
			"tasklist_change_result" : "http://"+$rootScope.api_domain+"/api/schedule/retool/temp/detail/",
			//查询上线配置
			"search_online_config" : "http://"+$rootScope.api_domain+"/api/aps/config/admin/default/launching/get/launch/config",
			//保存上线配置
			"save_online_config" : "http://"+$rootScope.api_domain+"/api/aps/config/admin/default/launching/update/launch/config",
			//上线配置-模糊查询物料编码
			"search_material_code" : "http://"+$rootScope.api_domain+"/api/aps/material/find/material/by/code?materialCode=",
			//上线配置-模糊查询物料名称
			"search_material_name" : "http://"+$rootScope.api_domain+"/api/aps/material/find/material/by/name?materialName=",
			//排程规则
			"get_all_Algorithm" : "http://"+$rootScope.api_domain+"/api/aps/rule/availableAlgorithm",
		};
	};
	$rootScope.getsessionStorage();
	loginOutUrl = $rootScope.restful_api.login_out;

	$rootScope.userId = 1;  //单点登录暂时没有开启，没有userId，现统一设置为1 /* 开启之后即可删除  */

	//使用token取用户信息
	if(localStorage.getItem("token")){
		http.get({
			url : $rootScope.restful_api.user_info,
			successFn : function(res){
				$rootScope.userName = res.data.nickName;
				$rootScope.userId = res.data.userId;
			},
			errorFn : 	function(res){
				layer.alert('获取用户名失败！', {
					skin: 'layer-alert-themecolor' //样式类名
				});
			}
		});
	}
})
	.config(['$httpProvider',function ($httpProvider) {
	//============================过滤器配置================================//
	const thisUrl = window.location.href;
	if(thisUrl.indexOf("token")>-1){
		const tIndex = thisUrl.indexOf("token=");
		const thisToken = thisUrl.substring(tIndex+6,tIndex+22);

		if(thisToken.indexOf("token") === -1){
			localStorage.setItem("token",thisToken)
		}
	}
	$httpProvider.defaults.headers.common = { 'X-Requested-With' : 'XMLHttpRequest','Authorization':localStorage.getItem("token") || ""};
	$httpProvider.interceptors.push(['$rootScope', '$q', function ($rootScope, $q) {

		return {
			request: function (config) {
				config.headers = config.headers || {};
				let thisUrl = window.location.origin + window.location.pathname;
				let tokenIndex = thisUrl.indexOf("token=");
				thisUrl.replace(thisUrl.substring(tokenIndex,tokenIndex+22),"");
				config.headers.redirectUrl = thisUrl;

				return config;
			},

			response: function (response) {
				if (response.status === 200 && response.data.error_response) {
					//错误码为1，未登录，跳转到登录界面；其他情况则返回错误信息，并增加错误标识
					if(response.data.error_response.code == 1){
						//跳转前清空旧缓存
						sessionStorage.clear();
						window.location.href = response.data.error_response.sub_msg;
						return response;
					}else{
						response.data.error_response.text = $rootScope.errorCode[response.data.error_response.code];
					}

				}

				if (response.status === 200 && response.data.success_response !== undefined){
					response.data = response.data.success_response;
				}

				return response || $q.when(response);
			},

			responseError: function (response) {
				return $q.reject(response);
			}
		}
	}])
}])
	.config(['$translateProvider',function ($translateProvider) {
		//============================多语言================================//
		//指明加载哪些语言配置文件
		$translateProvider.useStaticFilesLoader({
			prefix: './language/',//指定文件前缀.
			suffix: '.json'// 指定文件后缀.
		});
		var lang = 'zh-cn';//设置默认的语言
		// var lang = 'en-us';//设置默认的语言
		// var lang = window.localStorage.lang||'en-us';//设置默认的语言
		$translateProvider.preferredLanguage(lang); //加载默认已注册的语言
	}]);