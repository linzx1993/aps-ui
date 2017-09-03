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

    /**
     * 保存显示项发送数据
     * @param str: 错误时提示
     * @return 发送的数据
     */
    $scope.getDisplayPostData = (str) => {
        let resData = $scope.columnContentData;
        let selectValue = [];
        //获得选中的li
        $("#sort-item").find("li").each(function(){
            let attr = $(this).attr("data-keyname");
            selectValue.push(attr);
        });
        if(selectValue.length <= 0){
            $scope.info.fail(str);
            return false;
        }
        //新建一个需要发送的数据
        let postData = {};
        postData.optionList = resData.optionList;
        postData.selectList = [];
        for(let i = 0,length = selectValue.length;i < length; i++){
            for(let j = 0,len = resData.optionList.length;j < len; j ++){
                let compareOptionText = resData.optionList[j].valueContent.replace(":desc","");
                // console.log(compareOptionText);
                // console.log(selectValue[i].replace(":desc",""));
                // console.log(compareOptionText === selectValue[i].replace(":desc",""));
                if(compareOptionText === selectValue[i].replace(":desc","")){
                    if($(".sort-item li").eq(i).attr("data-order") === "down"){
                        compareOptionText += ":desc";
                        resData.optionList[j].valueContent = compareOptionText;
                    }
                    postData.selectList.push(resData.optionList[j]);
                    break;
                }
            }
        }
        return postData;
    };

    /**
     * 获得get到的数据，渲染页面
     * @param res: get到的数据
     * @return 页面渲染时的格式
     */
    $scope.setDisplayGetData = (res) => {
        $scope.columnContentData = res.data;
        $scope.userConfigData = scheduleTableViewModelService.sortItem($scope.columnContentData);//获得返回到左边显示的项目
        $scope.userSelectConfigData = scheduleTableViewModelService.sortSelectItem($scope.columnContentData);//获得返回到右边显示的项目
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
     * @param res: 获得到的排程规则数据
     * @return 页面渲染所需数据
     */
    $scope.renderRulePage = (res) => {
        $scope.scheduleCheckData = $.extend({}, res);
        // $scope.ruleName = $scope.scheduleCheckData.ruleName;
        //前端设定排程前检验项的显示顺序 === [颜色信息校验,刀具信息校验,夹具信息校验,产能校验,物料信息校验,PAP信息校验,工艺路线信息校验,排程步骤校验,适宜设备校验,系统配置校验]
        $scope.scheduleFrontData = [];
        let frontData = scheduleTableViewModelService.validation_rules_from(res);//获得排程前需要的数据
        //"CT_INFO_CHECKING","FIXTURE_INFO_CHECKING","PAP_INFO_CHECKING",
        let scheduleFrontData = ["COLOR_INFO_CHECKING","CAPABILITY_INFO_CHECKING","MATERIAL_INFO_CHECKING",
            "ROUTING_INFO_CHECKING","SUITABLE_PRODUCT_INFO_CHECKING","SYSTEM_CONFIG_CHECKING"];
        scheduleFrontData.forEach((item,index)=>{
            $scope.scheduleFrontData.push(frontData[item]);
        });

        //前端设定排程后检验项的显示顺序 === [物流疏通校验,齐套性校验,组合件校验,超产能校验,生产时间校验]
        $scope.scheduleLaterData = [];
        let laterData = scheduleTableViewModelService.validation_rules_later(res);//获得排程后需要的数据
        //"PROCESS_SEQ_CHECKING","POMO_SUIT_CHECKING","ASSEMBLING_UNIT",
        let scheduleLaterData = ["CAPABILITY_OVER_CHECKING","PRODUCTION_TIME_CHECKING"];
        scheduleLaterData.forEach((item)=>{
            $scope.scheduleLaterData.push(laterData[item]);
        });

        //设置选中的option
        $scope.schedulePointSelected = $scope.scheduleCheckData.schedulePoint;
        $scope.papTypeSelected = $scope.scheduleCheckData.papType;
        $scope.schedulePeriodSelected = $scope.scheduleCheckData.schedulePeriod;
        setTimeout(function () {
            //控制下拉列表
            Array.prototype.forEach.call($("dd.relative span"), function (item) {
                let select = $(item).siblings("select");
                let ul = $(item).siblings("ul");
                ul.find("li[data-value=" + $(item).attr("data-value") +"]").trigger("click");
                let text = $(item).siblings("select").find("option:selected").text();
                $(item).text(text);
            });
            //控制选中状态
        }, 0);
    };
    //根据此模块设置各个排程规则项的是否要展示
    $scope.scheduleRuleItemShow = {
        isLoadOverduePoolTask : true,   //当前日期前的车间计划 ：
        overduePeriod : true,   //拉取当前车间计划天数
        schedulePeriodSelected : true,  //排程周期
        scheduleInterval : true,    //排程间隔
        minScheduleDay : true,  //最早起排日期
        freezePeriod : true,    //冻结期
        //排程前校验
        preScheduleCheckMap : {
            CAPABILITY_INFO_CHECKING : false,    //产能校验
            COLOR_INFO_CHECKING : false,         //颜色信息校验
            CT_INFO_CHECKING : true,            //刀具信息校验
            FIXTURE_INFO_CHECKING : true,       //夹具信息校验
            MATERIAL_INFO_CHECKING : false,      //物料信息校验
            PAP_INFO_CHECKING : true,           //PAP信息校验
            ROUTING_INFO_CHECKING : false,       //排程步骤校验
            SUITABLE_PRODUCT_INFO_CHECKING : false,  //适宜设备校验
            SYSTEM_CONFIG_CHECKING : false,      //系统配置校验
        },
        //排程后校验
        postScheduleCheckMap : {
            ASSEMBLING_UNIT : true,             //组合件校验
            CAPABILITY_OVER_CHECKING : false,    //超产能校验
            POMO_SUIT_CHECKING : true,          //齐套性校验
            PROCESS_SEQ_CHECKING : true,        //物流疏通校验
            PRODUCTION_TIME_CHECKING : false,    //生产时间校验

        },
        papTypeSelected : true,
        schedulePointSelected : true,   //起排工序
        isAheadOn: true,   //启用延迟生产
        isCombinationOn: true, //启用组合件
        isEconomicOn: true,    //启用经济批量
        isFrequencyOn: true,   //启用生产频度
        isUseNotMassEqu: true, //使用非批量设备
        //排程因子权重
        scheduleWeightMap : {
            KEY_EQUIPMENT : true,       //关键设备
            MOST_USED_EQUIPMENT : true, //高负荷设备
            SAME_COLOR : true,          //相同颜色
            SAME_CT : true,             //相同刀具
            SAME_FIXTURE : true,        //相同物料
            SAME_MATERIAL : true,       //相似物料
            SIMILAR_MATERIAL : true,    //相似物料
        }
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

    //拖拽区域进行初始化
    $scope.clickLiGetItem = function () {
        //每次点击后目录蓝需要重新获取移动的li(配置项)
        setTimeout(function(){
            new DragNewItem('all-item','provide-item','sort-item',{});
            $("#sort-item").find("li").each(function(){
                let span = $(this).children(".itemOrder");
                span.addClass(span.attr("ng-class"));
            });
        },50);
        //清除用户移动后未保存的项目
        $("#all-item").find(".js-move").remove();
    };

}]);
