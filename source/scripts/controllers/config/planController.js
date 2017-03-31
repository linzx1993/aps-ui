/**
 * Created by yiend on 2017/1/16.
 */
app.controller("planController", ["$rootScope", "$scope", "$http", "$window", "$location", "$timeout", "$q", "$templateCache", "scheduleTableViewModelService", "dataService", "tool", "http", function ($rootScope, $scope, $http, $window, $location, $timeout, $q, $templateCache, scheduleTableViewModelService, dataService, tool, http) {
    $scope.ruleList = dataService.ruleList;
    $scope.$parent.showManage = false;//管理目录的垃圾桶删除按钮消失
    //显示正确的目录class-active
    $scope.configNav.activeNav = ".scheme";

    //获取车间计划列表
    http.get({
        url: $rootScope.restful_api.all_schedule_plan,
        successFn: (res) => {
            $scope.planList = res.data;
            //如果没哟排序计划
            if ($scope.planList.error_response) {
                $scope.planList = [];
                $scope.planId = 0;
            } else {
                $scope.planId = $scope.planList[0].schemeId;
            }
            //默认点击第一个
            http.get({
                url: $rootScope.restful_api.single_schedule_plan + $scope.planId,
                successFn: (response) => {
                    $scope.locationRuleList = response.data.locationRuleList;
                    //渲染车间树样式
                    $scope.setWorkshop();
                }
            });
        },
        errorFn: () => {
            //获取服务器数据失败的情况下
            $scope.planList = [];
        }
    })
    //获取规则列表
        .then(function () {
            http.get({
                url: $rootScope.restful_api.all_schedule_rule,
                successFn: function (res) {
                    res = res.data;
                    $scope.ruleList = dataService.ruleList = res;
                    //设置方案前，没有排程规则[];
                    if (!dataService.ruleList.length) {
                        layer.alert("请先设置一个排程规则");
                    } else {
                        $scope.ruleId = dataService.ruleList[0].ruleId;
                    }
                    console.log(dataService.ruleList);
                },
                errorFn: function (res) {
                    res = res.data;
                    dataService.ruleList = [];
                    console.log(res);
                }
            })
                .then(function () {
                    console.log($scope.ruleList);
                });
        });

    //**********妥协代码start*********//
    //执行拖拽
    $timeout(function () {
        $(".gridly").dragsort({
            dragSelector: "li", dragEnd: function () {
            }, dragBetween: false, placeHolderTemplate: "<li></li>"
        });
        var timeClick;
        $(".gridly li").on("mousedown", ".workshop-ruleNav", function (e) {
            timeClick = new Date();
            e.stopPropagation();
        }).on("mouseup", ".workshop-ruleNav", function (e) {

            if (new Date() - timeClick > 300) {
            } else {
                e.stopPropagation();
            }
        });
    }, 1000);
    //**********妥协代码end*********//
    //初始化车间树==查看不同计划时调用
    $scope.setWorkshop = () => {
        let workshopTree = $("#jWorkshop");
        //清空痕迹
        workshopTree.find("i").attr("class", "select-status");
        workshopTree.find("ul ul span").removeClass("item-select");
        //第一次进入，没有数据
        if ($scope.locationRuleList) {
            $scope.locationRuleList.forEach((item) => {
                let selectI = workshopTree.find("i[data-location-id=" + item.locationId + "]");
                selectI.siblings("span").addClass("item-select");
                selectI.addClass("active");
                //子地点全部选中，且设置为disable不可更改
                selectI.siblings("ul").find("select-status").addClass("active")
            })
        }
    };

    /**排程方案保存进行发送数据**/
    $scope.saveSchedulePlan = () => {
        let postData = {
            "schemeId": $(".schedulePlanLi.active").attr("data-scheme-id"),
            "schemeName": $(".schedulePlanLi.active span").text(),
            "locationRuleList": []
        };
        Array.prototype.forEach.call($("#workshopRule>ul>li"), (item, index) => {
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
        if (postData.locationRuleList.length <= 0) {
            layer.alert("请为方案至少选择一个车间");
            return;
        }
        //planId正确更新，错误新建
        if (postData.schemeId.slice(0, 7) == "tempory") {
            delete postData.schemeId;
            http.post({
                url: $rootScope.restful_api.single_schedule_plan,
                data: postData,
                successFn: (res) => {
                    if (res.data) {
                        $scope.info.success("新排程方案保存成功");
                    } else {
                        $scope.info.fail("新排程方案保存失败");
                    }
                },
                errorFn: function () {
                    $scope.info.fail("新排程方案保存失败");
                }
            });
        } else {
            http.put({
                url: $rootScope.restful_api.single_schedule_plan + $scope.planId,
                data: postData,
                successFn: (res) => {
                    $scope.info.success("排程方案更新成功");
                },
                errorFn: function () {
                    $scope.info.fail("排程方案更新失败");
                }
            });
        }
    };

    //新建方案窗口
    $scope.openPlanWindow = () => {
        let index = layer.open({
            type: 1,
            title: false,
            closeBtn: 0,
            shadeClose: true,
            skin: 'yourclass',
            content: $(".addNewPlan"),
            success: function () {
                $(".planName").focus();
                $(".layui-layer-content").on("click", ".close,.cancal", function () {
                    layer.close(index);
                });
            }
        })
    };

    //临时添加方案，创建临时方案数据库，存储临时创建但是未保存的方案，关闭或刷新页面数据库消失
    $scope.temporySchemeData = {};
    $scope.recordTemporaryPlan = () => {
        if (!$scope.newSchemeName) {  //输入框中已设置newSchemeName
            layer.msg("排程方案名不能为空");
            return false;
        }
        if (!tool.checkRepeatName($scope.newSchemeName, $scope.planList, "scheme")) {
            layer.msg("排程方案名重复，请重新输入");
            return false;
        }
        $scope.index = $scope.planList.length - 1;
        //临时方案设置为true
        //初始化页面内容,通过判断方案ID查看是否设置了复制方案
        let cloneSchemeId = $("#planSelect").val();
        if ((cloneSchemeId - 0) > 0) {
            http.get({
                url: $rootScope.restful_api.single_schedule_plan + cloneSchemeId,
                successFn: function (res) {
                    $scope.locationRuleList = res.data.locationRuleList || [];
                    $scope.planList.push({
                        schemeName: $scope.newSchemeName,
                        schemeId: "tempory" + $scope.planList.length,
                        locationRuleList: $scope.locationRuleList
                    });
                    $scope.planId = "tempory" + $scope.planList.length;
                    // $scope.newSchemeName = "";
                    //点击目录选中最后一个li
                    $scope.temporySchemeData["tempory" + ($scope.planList.length - 1)] = $scope.locationRuleList;
                    $timeout(function () {
                        $(".schedulePlanLi").last().trigger("click");
                    })
                }
            });
        } else {
            $scope.locationRuleList = [];
            $scope.planList.push({
                schemeName: $scope.newSchemeName,
                schemeId: "tempory" + $scope.planList.length,
                locationRuleList: $scope.locationRuleList
            });
            $scope.planId = "tempory" + $scope.planList.length;
            //点击目录选中最后一个li
            $scope.temporySchemeData["tempory" + ($scope.planList.length - 1)] = $scope.locationRuleList;
            $timeout(function () {
                $(".schedulePlanLi").last().trigger("click");
            })
        }
        layer.closeAll();
    };

    //查看方案
    $scope.lookPlan = (id) => {
        //先判断是否是临时方案
        //获取临时方案的车间和规则
        if ((id + "").slice(0, 7) == "tempory") {
            $scope.locationRuleList = $scope.temporySchemeData[id];
            $scope.setWorkshop();
        } else {
            //获取存储的车间和规则
            http.get({
                url: $rootScope.restful_api.single_schedule_plan + id,
                successFn: function (res) {
                    $scope.schemeDate = res.data;
                    $scope.planId = id;
                    $scope.locationRuleList = res.data.locationRuleList;
                    $scope.setWorkshop();
                },
                errorFn: function () {
                    $scope.planId = null;
                }
            });
        }
    };


    //删除方案
    $scope.deletePlan = (id, event) => {
        event.stopPropagation();
        //获取临时方案的车间和规则
        let deletePlan = layer.confirm('确定删除此排程方案', {
            btn: ['确定', '取消'] //按钮
        }, function () {
            if ((id + "").slice(0, 7) == "tempory") {
                $scope.locationRuleList = $scope.temporySchemeData[id];
                //方案列表删除此方案
                $timeout(() => {
                    $scope.planList = $scope.planList.filter((item) => {
                        return item.schemeId !== id;
                    });
                })
            } else {
                let target = event.target || event.srcElement;
                let parentElement = target.parentNode;
                let schemeId = parentElement.getAttribute("data-scheme-id");
                http.delete({
                    url: $rootScope.restful_api.single_schedule_plan + schemeId,
                    successFn: () => {
                        $scope.planList.forEach(function (item, index) {
                            if (item.schemeId == schemeId) {
                                $scope.planList.splice(index, 1);
                            }
                            $scope.info.success("删除排程方案成功")
                        });
                        //没有方案时，不需要执行
                        if ($scope.planList.length != 0) {
                            $scope.lookPlan($scope.planList[0].schemeId);
                        }
                    },
                    errorFn: () => {
                        $scope.info.fail("删除方案失败，请检查服务器")
                    }
                });
            }
            layer.close(deletePlan);
        }, function () {
            layer.close(deletePlan);
        });
    };

    /**
     * 排程方案界面 选择规则目录下拉选择查看排程规则
     * @param ruleId,: 规则ID
     * @param ruleName: 规则名字
     * @param event:  event
     * @return 页面渲染所需数据
     */
    $scope.viewRule = (ruleId, ruleName, event) => {
        http.get({
            url: $rootScope.restful_api.single_schedule_rule + ruleId,
            successFn: function (res) {
                $scope.setCheckData(res.data);
                let lookRule = layer.open({
                    type: 1,
                    title: ruleName,
                    area: ["900px", "750px"],
                    skin: 'viewRuleBox',
                    content: $(".layerBox"),
                    success: function () {
                        // $(".viewRuleBox .layui-layer-close1").hide();
                        $scope.viewRuleShow = true;
                        $(".viewRuleBox").click((e) => {
                            // e.preventDefault();
                            // return false;
                        });
                        $("body").on("click", ".save-sort,.viewRuleBox .layui-layer-close", function () {
                            layer.close(lookRule);
                            $timeout(function () {
                                $scope.viewRuleShow = false;
                            });
                        })
                    }
                });
            }
        });
        event.stopPropagation();
    };
    //显示隐藏高级规则---start
    $rootScope.jExpertConfiguration = false;
    $scope.toggleAdvancedShow = function () {
        $scope.jAdvancedConfiguration = !$scope.jAdvancedConfiguration;
    };
    $scope.toggleExpertShow = function () {
        $scope.jExpertConfiguration = !$scope.jExpertConfiguration;
    };
    $scope.hideAdvancedConfig = function () {
        $scope.jExpertConfiguration = $scope.jAdvancedConfiguration = false;
    };
    //显示隐藏高级规则---end


    $scope.createPlanWorkshopTree = () => {
        http.get({
            url: $rootScope.restful_api.get_new_location,
            successFn: (res) => {
                $scope.resWorkshop = res.data;
                $scope.folder = {"children": [scheduleTableViewModelService.getData(res.data)[0]]};//处理数据,并绑定到页面
            },
            errorFn: function (res) {
                layer.alert("读取车间失败，请检查服务器");
            }
        })
            .then(() => {
                $timeout(function () {
                    //展开一级列表
                    $(".all-location span").eq(0).next().show();
                    //显示选中的车间
                    $("[data-location-id=" + $scope.locationId + "]").addClass("active");

                    $("#jWorkshop").on("click", "ul span", function () {
                        $(this).toggleClass("active").toggleClass("open");
                        $(this).next().toggle();
                        //改变按钮的位置
                        var bgPosition = $(".location-choose").width();
                        $(".out-bg").width(bgPosition);
                        //判断是否为最后一个
                        //如果是最后一个则设置左线的高度,否则自适应
                        var li = $(this).parent(),
                            index = li.index() + 1,
                            ul = li.parent(),
                            height = ul.height() - li.height();//设置线的高度为ul的高度减去li的高度
                        if (index === ul.children().length) {
                            ul.children("b").height(height + 50);
                        } else {
                            ul.children("b").height("auto");
                        }
                    })
                    //选择添加/删除车间
                        .on("click", ".select-status", (event) => {
                            let e = event || window.event;
                            let target = e.target || e.srcElement;
                            let id = target.getAttribute("data-location-id");
                            let firstRule = dataService.ruleList[0];
                            //判断有没有排程规则
                            if (!firstRule) {
                                layer.alert("请先添加排程规则");
                                // return;
                            }
                            //子列表变为不可编辑状态
                            //选中状态下，取消左侧菜单里本车间
                            //未选中状态下，点击一级之后取消左侧菜单里面所有的子级车间(有选中的二级情况下)==>主要是为了取消子级车间
                            //因为不管选不选中都要执行这一段代码，所以提取到了最头上
                            for (let i = $scope.locationRuleList.length - 1; i >= 0; i--) {
                                if ($scope.locationRuleList[i].locationId.slice(0, id.length) === id) {
                                    $scope.locationRuleList.splice(i, 1);
                                }
                            }

                            let parentLi = $(target).parent();
                            let parentUl = parentLi.parent();
                            let activeLiLength;//所有选中的子车间的长度
                            let selectStatusLength = parentUl.find(".select-status").length;//所有子车间的长度
                            let parentSelectStatus = parentUl.siblings(".select-status");//父车间的checkbox（i标签）

                            //车间已被选中，则子列表变为可点击，未选中的状态
                            if ($(target).hasClass("active")) {
                                if (parentSelectStatus.hasClass("active")) {
                                    $scope.locationRuleList = $scope.locationRuleList.filter((item) => {
                                        return item.locationId !== id.slice(0, id.length - 2);
                                    });
                                    //一级车间取消，变为剩下的二级车间
                                    Array.prototype.forEach.call(parentLi.siblings("li"), (item) => {
                                        let liItem = $(item);
                                        $scope.locationRuleList.push({
                                            locationId: liItem.children("i").attr("data-location-id"),
                                            locationName: liItem.children("span").text(),
                                            ruleName: firstRule ? firstRule.ruleName : "请选择排程规则",
                                            ruleId: firstRule ? firstRule.ruleId : ""
                                        })
                                    })
                                }

                                //==========class的变化--start========
                                $(target).parent().find("i").attr("class", "select-status");
                                activeLiLength = parentUl.find(".active").length;
                                if (activeLiLength === 0) {
                                    parentSelectStatus.attr("class", "select-status");
                                    //继续向上查找，查看爷车间是否需要变化
                                } else {
                                    parentSelectStatus.attr("class", "select-status select-some");
                                }
                                //==========class的变化--end========

                            }
                            //==========如果车间没被选中========
                            else {
                                //所有子车间加上active的class
                                $(target).addClass("active");
                                Array.prototype.forEach.call($(target).siblings("ul").find(".select-status"), function (item) {
                                    item.className = "select-status active";
                                });
                                activeLiLength = parentUl.find(".active").length;

                                //左侧菜单出现本车间的信息
                                $scope.locationRuleList.push({
                                    locationId: id,
                                    locationName: target.nextElementSibling.innerText,
                                    ruleName: firstRule ? firstRule.ruleName : "请选择排程规则",
                                    ruleId: firstRule ? firstRule.ruleId : ""
                                });
                                //=========二级菜单合并为一级菜单--start===========
                                //同级列表全部选中时，左侧列变为父级一个出现，移除所有同级的车间展示
                                //如果全部选中，父级变为选中，左侧列表只显示父级
                                //active的个数等于所有个数则表示选中所有父级，
                                console.log(activeLiLength);
                                console.log(selectStatusLength);
                                if (activeLiLength === selectStatusLength) {
                                    //设置为不选，。然后点击调用方法，全部选中
                                    //判断是否为第一级春风车间,不是则继续执行
                                    console.log(parentSelectStatus);
                                    parentSelectStatus.attr("class", "select-status");
                                    parentSelectStatus.trigger("click");
                                    //偷懒，先父级选中，所有子级不可选中
                                    // Array.prototype.forEach.call(parentUl.find(".select-status"),function(item){
                                    // });
                                    layer.msg("已合并为上一级车间", {time: 2000});
                                } else if (activeLiLength !== 0) {
                                    //没有全部选中，添加class->select-some
                                    parentSelectStatus.attr("class", "select-status select-some");
                                } else {
                                    parentSelectStatus.attr("class", "select-status");
                                }
                                //=========二级菜单合并为一级菜单--end===========
                            }
                            //强制刷新dom
                            $scope.$apply();
                        })
                })
            })
    };
    $scope.createPlanWorkshopTree();
}]);