/**
 * Created by yiend on 2017/1/16.
 */
app.controller("planController",["$rootScope","$scope","$http", "$window", "$location","$timeout","$q","$templateCache","scheduleTableViewModelService","dataService","tool", function($rootScope,$scope,$http, $window, $location,$timeout,$q,$templateCache,scheduleTableViewModelService,dataService,tool){
    $scope.ruleList = dataService.ruleList;
    $scope.columnWorkshop = false;

    //获取车间计划列表
    $http.get($rootScope.restful_api.all_schedule_plan)
        .then((res) => {
            $scope.planList = res.data;
            //如果没哟排序计划
            if($scope.planList.error_response){
                $scope.planList = [];
                $scope.planId = 0;
            }else{
                $scope.planId = $scope.planList[0].schemeId;
            }
            //默认点击第一个
            $http.get($rootScope.restful_api.single_schedule_plan + $scope.planId)
                .then((response) => {
                    $scope.locationRuleList = response.data.locationRuleList;
                    //渲染车间树样式
                    $scope.setWorkshop();
                })
        },function(res){
            //获取服务器数据失败的情况下
            $scope.planList = [];
        })
        //获取规则列表
        .then(function(){
            //没有规则列表时请求获得
            if(dataService.ruleList.length){
                return;
            }else{
                $http.get($rootScope.restful_api.all_schedule_rule)
                    .success(function(res){
                        $scope.ruleList = dataService.ruleList = res;
                        //设置方案前，没有排程规则[];
                        if(!dataService.ruleList.length){
                            layer.alert("请先设置一个排程规则");
                        }else{
                            $scope.ruleId = dataService.ruleList[0].ruleId;
                        }
                        console.log(dataService.ruleList);
                    })
                    .error(function (res) {
                        dataService.ruleList = [];
                        console.log(res);
                    })
                    .then(function () {
                        console.log($scope.ruleList);
                    })
            }
        });
    //执行拖拽
    $timeout(function(){
        $(".gridly").dragsort({ dragSelector: "li", dragEnd: function() { }, dragBetween: false, placeHolderTemplate: "<li></li>" });
    });

    //初始化车间树==查看不同计划时调用
    $scope.setWorkshop = () => {
        let workshopTree = $("#jWorkshop");
        //清空痕迹
        workshopTree.find("i").attr("class","select-status");
        workshopTree.find("ul ul span").removeClass("item-select");
        //第一次进入，没有数据
        if(!$scope.locationRuleList){
        }else{
            $scope.locationRuleList.forEach((item) => {
                let selectI =  workshopTree.find("i[data-location-id=" + item.locationId + "]");
                selectI.siblings("span").addClass("item-select");
                selectI.addClass("active");
                //子地点全部选中，且设置为disable不可更改
                selectI.siblings("folder-tree").find("select-status").addClass("active disabled")
            })
        }


    };

    /**排程方案保存进行发送数据**/
    $scope.saveSchedulePlan = () => {
        let postData = {
            "schemeId" : $(".schedulePlanLi.active").attr("data-scheme-id"),
            "schemeName": $(".schedulePlanLi.active span").text(),
            "locationRuleList" : [
            ]
        };
        Array.prototype.forEach.call($("#workshopRule>ul>li"),(item,index) => {
            let locationA = item.firstElementChild;
            let ruleA = item.lastElementChild.firstElementChild;
            let obj = {
                "locationId": locationA.getAttribute("data-locationid"),
                "locationName": locationA.innerHTML,
                "ruleId": ruleA.getAttribute("data-rule-id"),
                "ruleName": ruleA.innerHTML,
            };
            postData.locationRuleList.push(obj);
        });
        //方案中车间为空给出提示
        if(postData.locationRuleList.length <= 0){
            layer.alert("请为方案至少选择一个车间");
            return;
        }
        //planId正确更新，错误新建
        if(postData.schemeId.slice(0,7) == "tempory"){
            delete postData.schemeId;
            $http.post($rootScope.restful_api.single_schedule_plan,postData)
                .then((res) =>{
                    if(res.data){
                        $scope.info.success("新排程方案保存成功");
                    }else{
                        $scope.info.fail("新排程方案保存失败");
                    }
                },function(){
                    $scope.info.fail("新排程方案保存失败");
                })
        }else{
            $http.put($rootScope.restful_api.single_schedule_plan + $scope.planId,postData)
                .then((res) => {
                    $scope.info.success("排程方案更新成功");
                },function(){
                    $scope.info.fail("排程方案更新失败");
                });
        }
    };

    //新建方案窗口
    $scope.openPlanWindow = () =>{
        let index = layer.open({
            type: 1,
            title: false,
            closeBtn: 0,
            shadeClose: true,
            skin: 'yourclass',
            content: $(".addNewPlan"),
            success : function(){
                $(".planName").focus();
                $(".layui-layer-content").on("click",".close,.cancal",function(){
                    layer.close(index);
                });
            }
        })
    };

    //临时添加方案，创建临时方案数据库，存储临时创建但是未保存的方案，关闭或刷新页面数据库消失
    $scope.temporySchemeData = {};
    $scope.recordTemporaryPlan = () =>{
        if(!$scope.newSchemeName){  //输入框中已设置newSchemeName
            layer.msg("排程方案名不能为空");
            return false;
        }
        if(!tool.checkRepeatName($scope.newSchemeName,$scope.planList,"scheme")){
            layer.msg("排程方案名重复，请重新输入");
            return false;
        }
        $scope.index = $scope.planList.length - 1;
        //临时方案设置为true
        //初始化页面内容,通过判断方案ID查看是否设置了复制方案
        let cloneSchemeId = $("#planSelect").val();
        if((cloneSchemeId - 0)>0){
            $http.get($rootScope.restful_api.single_schedule_plan + cloneSchemeId)
                .then(function(res){
                    $scope.locationRuleList = res.data.locationRuleList || [];
                    $scope.planList.push({
                        schemeName : $scope.newSchemeName,
                        schemeId : "tempory" + $scope.planList.length,
                        locationRuleList : $scope.locationRuleList
                    });
                    $scope.planId = "tempory" + $scope.planList.length;
                    // $scope.newSchemeName = "";
                    //点击目录选中最后一个li
                    $scope.temporySchemeData["tempory" + ($scope.planList.length-1)] = $scope.locationRuleList;
                    $timeout(function(){
                        $(".schedulePlanLi").last().trigger("click");
                    })
                });
        }else{
            $scope.locationRuleList = [];
            $scope.planList.push({
                schemeName : $scope.newSchemeName,
                schemeId : "tempory" + $scope.planList.length,
                locationRuleList : $scope.locationRuleList
            });
            $scope.planId = "tempory" + $scope.planList.length;
            //点击目录选中最后一个li
            $scope.temporySchemeData["tempory" + ($scope.planList.length-1)] = $scope.locationRuleList;
            $timeout(function(){
                $(".schedulePlanLi").last().trigger("click");
            })
        }
        layer.closeAll();
    };

    //查看方案
    $scope.lookPlan = (id) => {
        //先判断是否是临时方案
        //获取临时方案的车间和规则
        if((id+"").slice(0,7) == "tempory"){
            $scope.locationRuleList = $scope.temporySchemeData[id];
            $scope.setWorkshop();
        }else{
            //获取存储的车间和规则
            $http.get($rootScope.restful_api.single_schedule_plan+id)
                .then(function(res){
                    $scope.schemeDate = res.data;
                    $scope.planId = id;
                    $scope.locationRuleList = res.data.locationRuleList;
                    $scope.setWorkshop();
                },function(){
                    $scope.planId = null;
                })
        }
    };

    //删除方案
    $scope.deletePlan = (id,event) => {
        //获取临时方案的车间和规则
        console.log(id);
        if((id+"").slice(0,7) == "tempory"){
            $scope.locationRuleList = $scope.temporySchemeData[id];
            delete $scope.planList[id];
        }else{
            let deletePlan = layer.confirm('确定删除此排程方案', {
                btn: ['确定','取消'] //按钮
            }, function(){
                let target = event.target || event.srcElement;
                let parentElement = target.parentNode;
                let schemeId = parentElement.getAttribute("data-scheme-id");
                layer.close(deletePlan);
                $http.delete($rootScope.restful_api.single_schedule_plan + schemeId)
                    .then(() => {
                        $scope.planList.forEach(function(item,index){
                            if(item.schemeId == schemeId){
                                $scope.planList.splice(index,1);
                            }
                        });
                        //没有方案时，不需要执行
                        if($scope.planList.length != 0){
                            $scope.lookPlan($scope.planList[0].schemeId);
                        }
                    },() => {
                        $scope.info.fail("删除方案失败，请检查服务器")
                    })
            }, function(){
                layer.close(deletePlan);
            });
        }
    };

    /**
     * 排程方案界面 选择规则目录下拉选择查看排程规则
     * @param ruleId,: 规则ID
     * @param ruleName: 规则名字
     * @param event:  event
     * @return 页面渲染所需数据
     */
    $scope.viewRule = (ruleId,ruleName,event) => {
        $http.get($rootScope.restful_api.single_schedule_rule + ruleId)
            .then(function(res){
                $scope.setCheckData(res.data);
                let lookRule = layer.open({
                    type: 1,
                    title : ruleName,
                    area : ["900px","750px"],
                    skin: 'viewRuleBox',
                    content :$(".layerBox"),
                    success : function(){
                        // $(".viewRuleBox .layui-layer-close1").hide();
                        $scope.viewRuleShow = true;
                        $(".viewRuleBox").click((e) => {
                            // e.preventDefault();
                            // return false;
                        });
                        $("body").on("click",".save-sort",function(){
                            layer.close(lookRule);
                            $timeout(function(){
                                $scope.viewRuleShow = false;
                            });
                        })
                    }
                });
            });
        event.stopPropagation();
    };


    $timeout(function(){
        $("#jWorkshop")
        //选择添加/删除车间
            .on("click",".select-status",(event) => {
                let e = event || window.event;
                let target = e.target || e.srcElement;
                let id = target.getAttribute("data-location-id");
                let firstRule = dataService.ruleList[0];
                //判断有没有排程规则
                if(!firstRule){
                    layer.alert("请先添加排程规则");
                }
                //子列表变为不可编辑状态
                //临时代码===判断是否为二级树===原因：树的结构一开始设计的不对
                // if(id.length <= 4){
                //     $(target).siblings("folder-tree").find("i").addClass("disabled");
                // }
                //开始添加,先判断是否有车间,没有车间直接添加
                if(!$scope.locationRuleList.length){
                    $scope.locationRuleList.push({
                        locationId : id,
                        locationName : target.nextElementSibling.innerText,
                        ruleName : firstRule ? firstRule.ruleName : "请选择排程规则",
                        ruleId : firstRule ? firstRule.ruleId : ""
                    });
                }
                else{
                    //车间已被选中，则子列表变为可点击，未选中的状态
                    if($(target).hasClass("active")){
                        $(target).parent().find("i").removeClass("disabled active");
                    }
                    //==========如果车间没被选中========
                    else {
                        //点击一级之后取消所有二级(有选中的二级情况下)
                        for(let i = $scope.locationRuleList.length-1;i >= 0;i --){
                            if($scope.locationRuleList[i].locationId.slice(0,id.length) === id){
                                $scope.locationRuleList.splice(i,1);
                            }
                        }
                        //====================（没有选中的二级情况下）
                        $scope.locationRuleList.push({
                            locationId : id,
                            locationName : target.nextElementSibling.innerText,
                            ruleName : firstRule ? firstRule.ruleName : "请选择排程规则",
                            ruleId : firstRule ? firstRule.ruleId : ""
                        });
                        //=========二级菜单合并为一级菜单--start===========
                        //同级列表全部选中时，左侧列变为父级一个出现，移除所有同级的车间展示
                        $(target).addClass("active");
                        let parentUl = $(target).parent().parent();
                        //如果全部选中，父级变为选中，左侧列表只显示父级
                        //active的个数等于所有个数则表示选中所有父级
                        if (parentUl.find(".active").length === parentUl.find(".select-status").length){
                            //设置为不选，。然后点击调用方法，全部选中
                            //判断是否为第一级春风车间,不是则继续执行
                            console.log(parentUl.parent().prev().length);
                            if(parentUl.parent().prev().length){
                                parentUl.parent().siblings(".select-status").attr("class","select-status unselect");
                                parentUl.parent().siblings(".select-status").trigger("click");
                                //偷懒，先父级选中，所有子级不可选中
                                Array.prototype.forEach.call(parentUl.find(".select-status"),function(item){
                                    item.className = "select-status active disabled";
                                });
                            }
                            layer.msg("已合并为上一级车间",{time : 2000});
                            // let id = parentUl.previousElementSibling.firstElementChild.getAttribute("location-id");
                        }
                        //=========二级菜单合并为一级菜单--end===========

                        //如果该元素有子集列表,该元素的子列表变为不可点击
                        $(target).siblings("folder-tree").find("select-status").addClass("active disabled")
                    }
                }
                //强制刷新dom
                $scope.$apply();
            })
            .on("click","disabled",() =>{
                return false;
            })
    },1000);

    $scope.createPlanWorkshopTree = () =>{
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
                $timeout(function () {
                    $("[data-location-id=" + $scope.locationId + "]").addClass("active");
                    $("#jWorkshop").on("click","ul span",function(){
                        if($(this).next().find("ul li").length == 0){
                            return;
                        }else{
                            $(this).toggleClass("active").toggleClass("open");
                            $(this).next().toggle();
                        }
                        //设置前面线的高度
                        let thisUL = $(this).parents("ul");
                        let thisLI = thisUL.children("li")
                        let thisHeight = 0;
                        for(var i = 0;i < thisLI.length-1;i++){
                            thisHeight += $(thisLI[i]).height();
                        }
                        //改变按钮的位置
                        var bgPosition=$(".location-choose").width();
                        $(".out-bg").width(bgPosition);
                    })
                })
            })
    };
    $scope.createPlanWorkshopTree();
}]);