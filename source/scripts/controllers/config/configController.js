/**
 * Created by lzx on 2016/8/30.
 */
'use strict';
$("body").on("click",".check-rule-nav .rule-li,.check-rule-nav .schedulePlanLi",function(){
    $(this).addClass("active").siblings().removeClass("active");
});
app.controller("configController",["$rootScope","$scope","$http","$location","$timeout","$state","scheduleTableViewModelService","tool","http", function($rootScope,$scope,$http,$location,$timeout,$state,scheduleTableViewModelService,tool,http){
    //如果某些树没有权限则隐藏需要该权限的目录
    http.get({
        url: $rootScope.restful_api.get_new_location,
        successFn: (res) => {
            //如果用户没有可写树权限，则隐藏管理员目录目录
            if(tool.isEmptyObject(res.data)){
                // $scope.adminController.adminNav = false;
                $("a[ui-sref='.admin'],a[ui-sref='.scheme']").parent().hide();
            }
        },
        errorFn : () =>{
            $("a[ui-sref='.admin'],a[ui-sref='.scheme']").parent().hide();
        }
    });


    let historyUrl = sessionStorage.getItem("historyUrl") ? sessionStorage.getItem("historyUrl").split(",") : [];
    //如果由设备详情页，手动微调页，帮助页跳过来，默认到版本页，否则刷新仍然停留在原页面
    if($scope.historyUrl){
        $state.go('config.version');
    }

    //获得来源页面(手动微调页面需要)
    $rootScope.lastSourcePage = $location.$$url;

    //配置页面一级对象
    $scope.configNav = {};

    //获取跳转过来的地点ID,去除最后的生产线
    historyUrl.reverse().every((item)=>{
        if(item === "/result"){
            $scope.locationId = sessionStorage.getItem("locationId_res") || "01";
            return true
        }else if(item === "/preview"){
            $scope.locationId = sessionStorage.getItem("locationId_pre") || "01";
            return true
        }else{
            return false;
        }
    });

    //获得来源页面(手动微调页面需要)
    $rootScope.lastSourcePage = $location.$$url;

    //如果由设备详情页，手动微调页，帮助页跳过来，默认到版本页，否则刷新仍然停留在原页面
    //根据来源页面获得车间ID和车间名字进行显示
    if($scope.historyUrl){
        $state.go('config.version');
    }

    $scope.currentShowLocationName = sessionStorage.currentShowLocationName;//刷新直接使用缓存的车间名字
    //***********************//
    //获取显示地点ID，以及地点名字
    // if(sessionStorage.currentShowLocationName){
    //     $scope.currentShowLocationName = sessionStorage.currentShowLocationName;
    // }else{
    // sessionStorage.currentShowLocationName = $scope.currentShowLocationName = tool.getLocationName($scope.locationId,$rootScope.locationTreeData);

    // }

    //配置页面一级对象
    $scope.configNav = {};

    //添加目录class-active
    $scope.isActiveNav = function(val){
        return $scope.configNav.activeNav ===  val;
    };

    //自定义目录栏数据
    $scope.configLis = [
        {text : "VersionNav", url : "view/version.html","sref":".version"},
        {text : "displayConfiguration",url : "view/columnConfig.html", "sref":".display",
            children : [
                {text : "WorkArea",url : "view/displayDays","sref":".workArea"},//原名为一级页面
                {text : "WorkUnit",url : "view/columnConfig.html","sref":".workUnit",},//原名为二级页面
                {text : "WorkMenu",url : "view/displayDays","sref":".workMenu"},//原名为功能模块
            ]
        },
        {text : "ScheduleRuleSetting", url : "view/checkFrom.html","sref":".rule"},
        {text : "SchedulingSchemeSettings", url : "view/schedulePlan.html","sref":".scheme"},
        {text : "AdministratorConfigurationItem",url : "view/adminProperty.html","sref":".admin",
            children : [
                {text : "默认显示项",url : "view/adminDisplay.html","sref":".defaultDisplay",class : "adminNav"},
				{text : "onlineConfig", url : "view/onlineConfig.html","sref":".onlineConfig"},
            ]
        },
    ];


    /**
     * 1.点击目录跳转加上class-active;
     * @param sref:对应标志
     * @param event:
     * @returns
     * author: linzx
     */
    $scope.selectLi = (sref,event) => {
        //为li加上class-active
        $scope.configNav.activeNav = sref;
        //下拉代码
        let Li = $(event.target).parent();
        if(Li.hasClass("disabled")){
            return false;
        }
        if(Li.hasClass("drag")){
            Li.removeClass("drag");
            return;
        }
        Li.addClass("drag").siblings().removeClass("drag");
        event.stopPropagation();
    };

    /**************=======================相关零散代码========================************/
    //保存和还原弹出提示框
    $scope.infoObj = {
        mask : false,
        errorInfo : false,
        text  : ""
    };
    class Info{
        common(str){
            $scope.infoObj.mask = true;
            $scope.infoObj.text = str;
            $timeout(function(){
                $scope.infoObj.mask = false;
            },2500)
        }
        msg(str){
            this.common(str);
        }
        success(str){
            this.common(str);
            $scope.infoObj.errorInfo = false;
        }
        fail(str){
            this.common(str);
            $scope.infoObj.errorInfo = true;
        }
    }
    $scope.info = new Info();

    //管理删除
    $scope.startMange = () =>{
        $scope.showManage = !$scope.showManage;
        $timeout(function () {
            if($scope.showManage){
                let input = $(".check-rule-nav li").eq(1).children("input")[0];
                input.select();
                input.focus();
                $(".nav-manage").text("保存");
            }else {
                $(".nav-manage").text("编辑");
            }
        },0)
    };

    //实时监测
    $scope.$on("transferChecked",function (e,val) {
		$scope.selectItem = val;
	});
    /**
     * 保存显示项发送数据
     * @param str: 错误时提示
     * @return 发送的数据
     */
    $scope.getDisplayPostData = (str) => {
        //必须选择一项配置项
        if($scope.selectItem.length <= 0){
			layer.msg(str, {time: 3000, icon: 2});
            return false;
        }
        const postData = {optionList : $scope.optionList,selectList  : []};
        //根据选中的数组值，从所有的optionList中筛选出选中的对象
		$scope.selectItem.forEach(selectItem => {
			const option = Object.assign({},$scope.optionList.filter(item => {
				return selectItem.replace(":desc","") === item.valueContent.replace(":desc","")
			})[0]);
			option.valueContent = selectItem;
			postData.selectList.push(option)
		});
		return postData;
    };

    /**
     * 获得get到的数据，渲染页面
     * @param res: get到的数据
     * @return 页面渲染时的格式
     */
    $scope.setDisplayGetData = (res) => {
        //需要区分有没有配置项
        if(res.data.optionList === null){
			$scope.allItemList = [];
			$scope.selectItem = []
        }else{
			//获得所有的展示项
			$scope.optionList = res.data.optionList;
			$scope.allItemList = $scope.optionList.map(item => {
				return {
					id : item.valueContent,
					label : item.valueAlias,
					isSelected : false,
				}
			});
			//获得选中的展示项
			$scope.selectItem = res.data.selectList.map(item => item.valueContent);
        }
    };

    $("body")
        //配置页所有下拉列表代码
        .on("click","dd.relative",function(){
            //判断是否可编辑，是否生效
            if($(this).hasClass("not-edit")){
                return;
            }
            $(".scheduleDrag").removeClass("draw");
            $(this).children(".scheduleDrag").toggleClass("draw");
        })
        .on("mouseleave","dd.relative",function(){
            $(this).children(".scheduleDrag").removeClass("draw");
        })
        .on("click","dd.relative li",function(e){
            let index = $(this).index();
            $(this).parent().siblings("span").text($(this).text());
            let opts = $(this).parent().siblings("select")[0];
            opts.options[index].selected = "selected";
            $(this).parent().removeClass("draw");
            e.stopPropagation();
        });

    /**
     * 根据获得的排程规则数据渲染页面
     * 放在configController而不是ruleController是因为排程方案页面也需要展示排程规则
     * @param resData: 获得到的排程规则数据
     * @return 页面渲染所需数据
     */
    $scope.renderRulePage = (resData) => {
        $scope.scheduleCheckDataItemMap = resData.itemMap;

        //如果一个属性都没有，则直接消失
        if(!$scope.scheduleCheckDataItemMap){
            return;
        }
        for(let name in $scope.scheduleCheckDataItemMap){
            delete $scope.scheduleCheckDataItemMap[name].itemName;
            //转化成布尔值，以便angular状态的选中
            if($scope.scheduleCheckDataItemMap[name].itemValue === "true"){
                $scope.scheduleCheckDataItemMap[name].itemValue = true;
            }else if($scope.scheduleCheckDataItemMap[name].itemValue === "false"){
                $scope.scheduleCheckDataItemMap[name].itemValue = false;
            }
        }

        //排程前校验，排程后校验项，排程因子消失：底下所有校验项和规则全部没有
        //排程前
        $scope.preScheduleCheck = !!($scope.scheduleCheckDataItemMap['preScheduleCheck.PAP_INFO_CHECKING'] ||$scope.scheduleCheckDataItemMap['preScheduleCheck.SUITABLE_PRODUCT_INFO_CHECKING'] || $scope.scheduleCheckDataItemMap['preScheduleCheck.CT_INFO_CHECKING']
            || $scope.scheduleCheckDataItemMap['preScheduleCheck.CAPABILITY_INFO_CHECKING'] || $scope.scheduleCheckDataItemMap['preScheduleCheck.SYSTEM_CONFIG_CHECKING'] || $scope.scheduleCheckDataItemMap['preScheduleCheck.COLOR_INFO_CHECKING']
            || $scope.scheduleCheckDataItemMap['preScheduleCheck.FIXTURE_INFO_CHECKING'] || $scope.scheduleCheckDataItemMap['preScheduleCheck.ROUTING_INFO_CHECKING'] || $scope.scheduleCheckDataItemMap['preScheduleCheck.MATERIAL_INFO_CHECKING']);

        //排程后
        $scope.postScheduleCheck = !!($scope.scheduleCheckDataItemMap['postScheduleCheck.PROCESS_SEQ_CHECKING'] ||$scope.scheduleCheckDataItemMap['postScheduleCheck.POMO_SUIT_CHECKING'] || $scope.scheduleCheckDataItemMap['postScheduleCheck.ASSEMBLING_UNIT']
            || $scope.scheduleCheckDataItemMap['postScheduleCheck.PRODUCTION_TIME_CHECKING'] || $scope.scheduleCheckDataItemMap['postScheduleCheck.CAPABILITY_OVER_CHECKING']);
		// // 高级设置
		// $scope.jAdvancedShowByAlgorithm = !!($scope.scheduleCheckDataItemMap.papType || $scope.scheduleCheckDataItemMap.isFrequencyOn || $scope.scheduleCheckDataItemMap.isEconomicOn ||$scope.scheduleCheckDataItemMap.isCombinationOn ||
		// $scope.scheduleCheckDataItemMap.isAheadOn ||$scope.scheduleCheckDataItemMap.isUseNotMassEqu ||$scope.scheduleCheckDataItemMap.scheduleInterval);
        //排程因子
        $scope.scheduleWeight = ($scope.scheduleCheckDataItemMap['scheduleWeight.SAME_COLOR'] ||$scope.scheduleCheckDataItemMap['scheduleWeight.SAME_CT'] ||$scope.scheduleCheckDataItemMap['scheduleWeight.SAME_FIXTURE']
            ||$scope.scheduleCheckDataItemMap['scheduleWeight.SAME_MATERIAL'] ||$scope.scheduleCheckDataItemMap['scheduleWeight.KEY_EQUIPMENT'] ||$scope.scheduleCheckDataItemMap['scheduleWeight.MOST_USED_EQUIPMENT']
            ||$scope.scheduleCheckDataItemMap['scheduleWeight.SIMILAR_MATERIAL']);
        //专家配置
        // $scope.jExpertConfiguration = $scope.scheduleWeight;


		$scope.algorithmName = resData.algorithmName;
		//设置所有下拉框的选中值
        setTimeout(function(){
			//控制下拉列表
            $("dd.relative span").each(function () {
                // if($(this).hasClass("algorithm-name"))return;
				let ul = $(this).siblings("ul");
				ul.find("li[data-value=" + $(this).attr("data-value") + "]").trigger("click");
				let text = $(this).siblings("select").find("option:selected").text();
				$(this).text(text);
            });
        },0);
    };


    /**
     * 创造车间树
     * @param singleSelect:车间树是否是单选，bool值，true为单选，false为多选用于排程计划
     * @param getConfigData:各个controller成功之后的回调函数（渲染函数）
     * @returns
     * author: linzx
     * Date 2017-02-07
     */
    $scope.createWorkshop = (singleSelect,getConfigData) => {
        //存储树形数据,如果有，则不发送请求
        if(!$scope.folder){
			http.get({
				url: $rootScope.restful_api.get_new_location,
				successFn: () => {
                    $scope.folder = {"children": [scheduleTableViewModelService.getData($scope.resWorkshop)[0]]};//处理数据,并绑定到页面
                    $timeout(function () {
                        $("[data-location-id=" + $scope.locationId + "]").addClass("active");
                        let li = $("#columnWorkshop").find("li");//获得最上级一级车间的li
                        li.eq(0).children("ul").show();
                        li.eq(0).children("span").addClass("active");
                    })
                },
				errorFn: function(res){
                    layer.alert("读取车间失败，请检查服务器");
                }
			});
        }
        //先点击默认地点
        $timeout(function(){
            $("[data-location-id=" + $scope.locationId + "]").addClass("active");
            let li = $("#columnWorkshop").find("li");//获得最上级一级车间的li
            li.eq(0).children("ul").show();
            li.eq(0).children("span").addClass("active");
        });
        var outerEle=$(".location-list");
        outerEle  //改变状态
            .on("click","ul .title-open",function(){
                $(this).toggleClass("active").next().toggle();
            });

        //根据点击不同的车间选择不同的显示项
        if(singleSelect){
            $("#columnWorkshop").on("click", ".select-status", (e) => {
                //根据点击的车间ID
                $scope.locationId = e.target.getAttribute("data-location-id");
                $(".select-status").removeClass("active");
                $(e.target).addClass("active");
                //移除临时拖拽项
                $(".js-move").remove();
                getConfigData();
            });
        }
    };

    //改变状态
    function changeSelectStatus(thisSelect){
        //本身及所有后代的改变
        if(thisSelect.hasClass("select-some") || thisSelect.hasClass("unselect")){
            thisSelect.attr("class","select-status active");
            thisSelect.parent("li").find("ul i").attr("class","select-status active");
        }else{
            thisSelect.attr("class","select-status");
            thisSelect.parent("li").find("ul i").attr("class","select-status");
        }
    }

}]);
