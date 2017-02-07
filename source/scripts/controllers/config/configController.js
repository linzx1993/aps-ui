/**
 * Created by lzx on 2016/8/30.
 */
'use strict';
$("body").on("click",".check-rule-nav .ruleLi,.check-rule-nav .schedulePlanLi",function(){
    $(this).addClass("active").siblings().removeClass("active");
})
    .on("click",".config-nav li",function(e){
        e.stopPropagation();
        if($(this).hasClass("drag")){
            $(this).removeClass("drag");
            return;
        }
        $(this).addClass("drag").siblings().removeClass("drag");
    });
app.controller("configController",["$rootScope","$scope","$http", "$window", "$location","$timeout","$q","$templateCache","$state","scheduleTableViewModelService","tool","dataService", function($rootScope,$scope,$http, $window, $location,$timeout,$q,$templateCache,$state,scheduleTableViewModelService,tool,dataService){
    //默认跳转初始版本页面
    $state.go('config.scheme');
    //目录li加上class-active
    $scope.activeNav = ".version";

    //添加目录class-active
    $scope.isActiveNav = function(val){
        return $scope.activeNav ==  val;
    };
    //***********************//
    //生成车间树,设置车间选中
    $scope.columnWorkshop = true;
    $scope.locationId = $scope.locationId || "01";

    // // 判断是否在当前页面==>是否重新发送请求 = 设置初始页面
    // $scope.currentPage = $scope.dataUrl="view/adminManage.html";
    // $timeout(function(){
    //     $scope.selectLi("view/version.html");
    // },0);
    //
    //自定义目录栏数据
    $scope.configLis = [
        {text : "VersionNav", url : "view/version.html","sref":".version"},
        {text : "displayConfiguration",url : "view/columnConfig.html", "sref":".display",
            children : [
                {text : "levelPage",url : "view/displayDays","sref":".first"},
                {text : "secondaryPage",url : "view/columnConfig.html","sref":".second",
                    // children : [
                    //         {text : "ColumnInformationConfiguration",url : "view/columnConfig.html","sref":".column"},
                    //         {text : "Multi-columnSortConfiguration",url : "view/sortConfig.html","sref":".sort"}
                    //     ]
                },
                // {text : "threePages",url : "view/sortConfig.html","sref":".three"},
            ]
        },
        {text : "ScheduleRuleSetting", url : "view/checkFrom.html","sref":".rule"},
        {text : "SchedulingSchemeSettings", url : "view/schedulePlan.html","sref":".scheme"},
        // {text : "PAPRuleSetting", url : "view/papRule.html","sref":".papRule"},
        {text : "AdministratorConfigurationItem",url : "view/adminProperty.html","sref":".admin",
            children : [
                // {text : "车间属性",url : "view/workshopProperty.html","sref":".workshopProperty"},
                {text : "默认显示项",url : "view/adminDisplay.html","sref":".defaultDisplay"}
            ]
        }
    ];

    //
    $scope.selectLi = (sref,event) => {
        //为li加上class-active
        $scope.activeNav = sref;
        $timeout(function(){
            $(".second-nav").css("pointer-events","auto").find(".active").css("pointer-events","none");
        });
        //每次第一次点进来默认点击车间树
        $timeout(() => {
            $(`.select-status[location-id=${$scope.locationId}]`).trigger("click");
        },100);
    };

    /**************=======================相关零散代码========================************/
    //清楚后端缓存
    $scope.clearCache = function(){
        $http.post($rootScope.restful_api.clearCatch)
            .success(function(res){
            })
            .error(function(error){
            })
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
                if(compareOptionText == selectValue[i].replace(":desc","")){
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
            var e = event || window.event;
            var target = e.target || e.srcElement;
            var id = target.getAttribute("location-id");
            var firstRule = $scope.ruleList[0];
            var containMenu = false; //点击车间是否由子车间已经被选择了
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
                // debugger;
                // console.log(target.className);
                // let repeatLocationId = target.className.includes("selected");
                // console.log(repeatLocationId);
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
                    secondToFirst(target);
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
        $scope.scheduleFrontData = scheduleTableViewModelService.validation_rules_from(res);//获得排程前需要的数据
        $scope.scheduleLaterData = scheduleTableViewModelService.validation_rules_later(res);//获得排程后需要的数据
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
        //当前日期前的车间计划
        if(!$scope.scheduleCheckData.isLoadOverduePoolTask) {
            $("input[name=overduePeriod]").attr("disabled", "disabled");
        }else{
            $("input[name=overduePeriod]").removeAttr("disabled");
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
        //为了存储树形数据，减少发送请求
        if(!$scope.folder){
            $http.get($rootScope.restful_api.get_new_location)
                .then((res) => {
                    $scope.resWorkshop = res.data;
                    $scope.folder = tool.getLocationTreeData($.extend({},$scope.resWorkshop))[0];//处理数据,并绑定到页面
                    // $scope.folder = {
                    //     children : tool.getLocationTreeData($.extend({},$scope.resWorkshop))
                    // }
                }, function(res){
                    layer.alert("读取车间失败，请检查服务器");
                })
                .then(() => {
                    $("[data-location-id=" + $scope.locationId + "]").addClass("active");
                })
        }
        var outerEle=$(".location-list");
        outerEle  //改变状态
            .on("click","ul span",function(){
                if($(this).next().find("ul li").length == 0){
                    return;
                }else{
                    $(this).toggleClass("active").toggleClass("open");
                    $(this).next().toggle();
                }
                //设置前面线的高度
                let thisUL = $(this).parents("ul");
                let thisB = thisUL.children("b");
                let thisLI = thisUL.children("li")
                let thisHeight = 0;
                for(var i = 0;i < thisLI.length-1;i++){
                    thisHeight += $(thisLI[i]).height();
                }
                thisB.height(thisHeight + 100);
                //改变按钮的位置
                var bgPosition=$(".location-choose").width();
                $(".out-bg").width(bgPosition);
            })
            .on("click","ul ul i",function(){  //点击第一级下面的选框
                //改变状态
                changeSelectStatus($(this));
                //第一级只能单选
                $(this).parents("li").last().siblings("li").children("i").attr("class","unselect");
                $(this).parents("li").last().siblings("li").find("i").attr("class","unselect");
            })
            .on("click","ul:eq(0)>li>i",function(){  //点击第一级选框
                changeSelectStatus($(this));
                //第一级点击操作
                $(this).parent().siblings("li").children("i").attr("class","unselect");
                $(this).parent().siblings("li").find("i").attr("class","unselect");
                // debugger;
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

    function changeSelectStatus(thisSelect){
        var thisSelect = thisSelect;
        //本身及所有后代的改变
        if(!thisSelect.hasClass("active")){
            thisSelect.removeClass("selectsome").removeClass("unselect").addClass("selected").addClass("active");
            thisSelect.parent("li").find("folder-tree i").removeClass("selectsome").removeClass("unselect").addClass("selected").addClass("active");
        }else{
        //     thisSelect.removeClass("selected").addClass("unselect").removeClass("active");
        //     thisSelect.parent("li").find("folder-tree i").removeClass("selected").addClass("unselect").removeClass("active");
        }
        //处于其影响范围内的祖先的改变
        thisSelect.parents("folder-tree").each(function(){
            var thisTree = $(this);
            var thisStatus = thisTree.siblings(".selcetstatus");
            if(thisTree.find(".selected").length<1){
                thisStatus.removeClass("selected").removeClass("active").removeClass("selectsome").addClass("unselect");
            }else if(thisTree.find(".unselect").length<1){
                thisStatus.removeClass("selectsome").removeClass("unselect").removeClass("selectsome").addClass("selected").addClass("active");
            }else{
                thisStatus.removeClass("unselect").removeClass("selected").removeClass("active").addClass("selectsome");
            }
        })
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
