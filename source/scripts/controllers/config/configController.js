/**
 * Created by lzx on 2016/8/30.
 */
'use strict';
$("body").on("click",".check-rule-nav .ruleLi,.check-rule-nav .schedulePlanLi",function(){
    $(this).addClass("active").siblings().removeClass("active");
});
app.controller("configController",["$rootScope","$scope","$http", "$window", "$location","$timeout","$q","$templateCache","$state","scheduleTableViewModelService","tool","http", function($rootScope,$scope,$http, $window, $location,$timeout,$q,$templateCache,$state,scheduleTableViewModelService,tool,http){
    //默认跳转初始版本页面
    $state.go('config.version');
    $scope.configNav = {};
    //获取跳转过来的地点ID,去除最后的生产线
    $scope.historyUrl.reverse().every((item)=>{
        if(item === "/result"){
            $scope.locationId = sessionStorage.getItem("locationId_res");
            return true
        }else if(item === "/preview"){
            $scope.locationId = (sessionStorage.getItem("locationId_pre"));
            return true
        }else{
            return false;
        }
    });
    //添加目录class-active
    $scope.isActiveNav = function(val){
        return $scope.configNav.activeNav ===  val;
    };
    //***********************//
    //生成车间树,设置车间选中
    $scope.columnWorkshop = true;
    $scope.locationId = $scope.locationId || "01";
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
                {text : "默认显示项",url : "view/adminDisplay.html","sref":".defaultDisplay"}
            ]
        }
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
    //清楚后端缓存
    $scope.clearCache = () =>{
		http.post({
			url: $rootScope.restful_api.clearCatch,
			successFn: function(res){},
			errorFn: function(res){},
		});
    };
    //保存和还原弹出提示框
    $scope.infoObj = {
        mask : false,
        errorInfo : false,
        text  : ""
    };
    class Info{
        common(str){
            $scope.infoObj.mask = true;
            $scope.infoObj.text = str
            $timeout(function(){
                $scope.infoObj.mask = false;
            },2500)
        }
        msg(str){
            this.common(str);
            //
        }
        success(str){
            this.common(str);
            $scope.infoObj.errorInfo = false;
        }
        fail(str){
            this.common(str);
            $scope.infoObj.errorInfo = true;
        }
        hide(){
            $scope.infoObj.mask = false;
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
        console.log(resData);
        console.log(selectValue);
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
                    if($(".sort-item li").eq(i).attr("data-order") == "down"){
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
    //选择添加/删除车间
        .on("click", "#workshop .select-status", function(event) {
            let e = event || window.event;
            let target = e.target || e.srcElement;
            let id = target.getAttribute("location-id");
            let firstRule = $scope.ruleList[0];
            let containMenu = false; //点击车间是否由子车间已经被选择了
            //判断有没有排程规则
            if(!firstRule) {
                layer.alert("请先添加排程规则");
            }
            //子列表变为不可编辑状态
            //临时代码===判断是否为二级树===原因：树的结构一开始设计的不对
            if(id.length <= 4) {
                $(target).parent().next().find("i").addClass("disabled");
            }
            //开始添加,先判断是否有车间,没有车间直接添加
            if(!$scope.locationRuleList.length) {
                $scope.locationRuleList.push({
                    locationId: id,
                    locationName: target.nextElementSibling.innerHTML,
                    ruleName: firstRule ? firstRule.ruleName : "请选择排程规则",
                    ruleId: firstRule ? firstRule.ruleId : ""
                });
            } else {
                //=====判断点击车间是够已经被选择
                var repeatLocationId = $scope.locationRuleList.every(function(item, index, arr) {
                    if(item.locationId == id) {
                        arr.splice(index, 1);
                    }
                    return item.locationId != id;
                });
                //======
                //车间没被选中
                if(repeatLocationId) {
                    //点击一级之后取消所有二级(有选中的二级情况下)
                    for(var i = $scope.locationRuleList.length - 1; i >= 0; i--) {
                        if($scope.locationRuleList[i].locationId.slice(0, id.length) == id) {
                            containMenu = true;
                            $scope.locationRuleList.splice(i, 1);
                        }
                    }
                    //====================（没有选中的二级情况下）
                    $scope.locationRuleList.push({
                        locationId: id,
                        locationName: target.nextElementSibling.innerHTML,
                        ruleName: firstRule ? firstRule.ruleName : "请选择排程规则",
                        ruleId: firstRule ? firstRule.ruleId : ""
                    });
                    // secondToFirst(target);
                    //如果该元素有子集列表,该元素的子列表变为不可点击
                    console.log(target.parentNode.nextElementSibling);
                    if(target.parentNode.nextElementSibling && target.parentNode.nextElementSibling.nodeName === "UL") {
                        Array.prototype.forEach.call(target.parentNode.nextElementSibling.getElementsByClassName("select-status"), function(item, index) {
                            item.className += " disabled";
                        });
                    }
                }
                //车间已被选中
                else {
                    //子列表变为可点击
                    $(target).parent().next().find("i").removeClass("disabled");
                }
            }
            //强制刷新dom
            $scope.$apply();
        })
        //合并项下拉代码
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
     * 根据排程数据渲染页面
     * @param res: 获得到的排程规则数据
     * @return 页面渲染所需数据
     */
    $scope.setCheckData = (res) => {
        $scope.scheduleCheckData = $.extend({}, res);
        //设定排程前的顺序 === [颜色信息校验,刀具信息校验,夹具信息校验,产能校验,物料信息校验,PAP信息校验,工艺路线信息校验,排程步骤校验,适宜设备校验,系统配置校验]
        $scope.scheduleFrontData = [];
        let frontData = scheduleTableViewModelService.validation_rules_from(res);//获得排程前需要的数据
        let scheduleFrontData = ["COLOR_INFO_CHECKING","CT_INFO_CHECKING","FIXTURE_INFO_CHECKING","CAPABILITY_INFO_CHECKING","MATERIAL_INFO_CHECKING",
        "PAP_INFO_CHECKING","ROUTING_INFO_CHECKING","SCHEDULE_STEP_CHECKING","SUITABLE_PRODUCT_INFO_CHECKING","SYSTEM_CONFIG_CHECKING"];
        scheduleFrontData.forEach((item)=>{
            $scope.scheduleFrontData.push(frontData[item]);
        });
        //设定排程后的顺序 === [物流疏通校验,齐套性校验,组合件校验,超产能校验]
        $scope.scheduleLaterData = [];
        let laterData = scheduleTableViewModelService.validation_rules_later(res);//获得排程后需要的数据
        let scheduleLaterData = ["PROCESS_SEQ_CHECKING","POMO_SUIT_CHECKING","ASSEMBLING_UNIT","CAPABILITY_OVER_CHECKING"];
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
                var text = $(item).siblings("select").find("option:selected").text();
                $(item).text(text);
            });
            //控制选中状态
        }, 0);
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
				successFn: (res) => {
                    $scope.resWorkshop = res.data;
                    $scope.folder = tool.getLocationTreeData($.extend({},$scope.resWorkshop))[0];//处理数据,并绑定到页面
                    // $scope.folder = {
                    //     children : tool.getLocationTreeData($.extend({},$scope.resWorkshop))
                    // }
                },
				errorFn: function(res){
                    layer.alert("读取车间失败，请检查服务器");
                }
			});
        }
        //先点击默认地点
        $timeout(function(){
            $("[data-location-id=" + $scope.locationId + "]").addClass("active");
            $(".all-location span").eq(0).trigger("click");
        });
        var outerEle=$(".location-list");
        let mainTreeHeight = $(".location-tree-ul").eq(0).height();
        outerEle  //改变状态
            .on("click","ul .title-open",function(){
                $(this).toggleClass("active").next().toggle();
                //设置前面线的高度
                // let thisUL = $(this).parents("ul");
                // let thisB = thisUL.children("b");
                // let thisLI = thisUL.children("li");
                // let thisHeight = 0;
                // for(var i = 0;i < thisLI.length-1;i++){
                //     thisHeight += $(thisLI[i]).height();
                // }
                // thisB.height(thisHeight + 120);
                // if(!$(this).parents("li").eq(0).next().length){
                //     let ul= $(".location-tree-ul");
                //     let mainTreeHeight = ul.eq(0).height();
                //     console.log(mainTreeHeight);
                //     console.log(ul.last().height());
                //     ul.eq(0).height(mainTreeHeight - ul.last().height());
                // }
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
        var thisSelect = thisSelect;
        //本身及所有后代的改变
        if(thisSelect.hasClass("select-some") || thisSelect.hasClass("unselect")){
            thisSelect.attr("class","select-status active");
            thisSelect.parent("li").find("ul i").attr("class","select-status active");
        }else{
            thisSelect.attr("class","select-status");
            thisSelect.parent("li").find("ul i").attr("class","select-status");
        }
        // //处于其影响范围内的祖先的改变
        // thisSelect.parents("ul").each(function(){
        //     var thisTree = $(this);
        //     var thisStatus = thisTree.siblings(".select-status");
        //     if(thisTree.find(".selected").length < 1){
        //         thisStatus.attr("class","select-status")
        //     }else if(thisTree.find(".unselect").length < 1){
        //         thisStatus.attr("class","select-status active")
        //     }else{
        //         thisStatus.attr("class","select-status select-some")
        //     }
        // })
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
