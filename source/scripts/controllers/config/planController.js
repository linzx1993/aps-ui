/**
 * Created by yiend on 2017/1/16.
 */
app.controller("planController", ["$rootScope", "$scope", "$timeout","$q", "scheduleTableViewModelService", "tool", "http", function ($rootScope, $scope,$timeout,$q, scheduleTableViewModelService, tool, http) {

    $scope.$parent.showManage = false;//管理目录的垃圾桶删除按钮消失
    //显示正确的目录class-active
    $scope.configNav.activeNav = ".scheme";

    //初始化整棵车间树
    createPlanWorkshopTree();

    //创建车间树
    function createPlanWorkshopTree () {
        http.get({
            url: $rootScope.restful_api.get_new_location,
            successFn: (res) => {
                // $scope.resWorkshopTree = res.data;
                $scope.folder = {"children": [scheduleTableViewModelService.getData(res.data)[0]]};//处理数据,并绑定到页面
            },
            errorFn: function (res) {
                layer.alert("读取车间失败，请检查服务器");
            }
        })
            .then(function () {
                //获取车间计划列表
                http.get({
                    url: $rootScope.restful_api.all_schedule_plan,
                    successFn: (res) => {
                        $scope.planList = res.data;
                        //如果没有排序计划
                        if (!$scope.planList[0]) {
                            $scope.schemeId = 0;
                        } else {
                            $scope.currentPlan = $scope.planList[0];//当前规则
                            $scope.schemeId = $scope.currentPlan.schemeId;
                            //默认点击第一个
                            http.get({
                                url: $rootScope.restful_api.single_schedule_plan + $scope.schemeId,
                                successFn: (response) => {
                                    $scope.locationRuleList = response.data.locationRuleList;
                                    //渲染车间树样式
                                    $scope.setWorkshop();
                                }
                            })
                        }
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
                                $scope.ruleList = res;
                                //设置方案前，没有排程规则[];
                                if (!$scope.ruleList.length) {
                                    layer.alert("请先设置一个排程规则");
                                } else {
                                    $scope.ruleId = $scope.ruleList[0].ruleId;
                                }
                            },
                            errorFn: function (res) {
                            }
                        })
                    });
            })
            .then(() => {
                $timeout(function () {
                    //展开一级列表
                    let li = $("#jWorkshop").find("li");//获得最上级一级车间的li
                    li.eq(0).children("ul").show();
                    li.eq(0).children("span").addClass("active");

                    $("#jWorkshop").on("click", "ul span", function () {
                        $(this).toggleClass("active").toggleClass("open");
                        $(this).next().toggle();
                        //改变按钮的位置
                        let bgPosition = $(".location-choose").width();
                        $(".out-bg").width(bgPosition);
                        //判断是否为最后一个
                        //如果是最后一个则设置左线的高度,否则自适应
                        let li = $(this).parent(),
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
                        .on("click", ".select-status", function(event){
                            //改变父元素车间的选中状况
                            let e = event || window.event;
                            let target = e.target || e.srcElement;
                            let id = target.getAttribute("data-location-id");
                            let firstRule = $scope.ruleList[0];
                            //判断有没有排程规则
                            if (!firstRule) {
                                layer.alert("请先添加排程规则");
                            }
                            //选中状态下，点击后取消左侧菜单里本车间
                            //未选中状态下，点击一级之后取消左侧菜单里面所有的子级车间(有选中的二级情况下)==>主要是为了取消子级车间
                            //因为不管选不选中都要执行这一段代码，所以提取到了最头上
                            for (let i = $scope.locationRuleList.length - 1; i >= 0; i--) {
                                if ($scope.locationRuleList[i].locationId.slice(0, id.length) === id) {
                                    $scope.locationRuleList.splice(i, 1);
                                }
                            }

                            let parentLi = $(target).parent();//选中的i元素的所属于的li
                            //==========如果车间已被选中========
                            if ($(target).hasClass("active")) {
								//改变左边车间列表的展示情况
								changeParentLocationList(id);
                                //地点树代码
                                $(target).removeClass("active");
                                parentLi.find("i").attr("class", "select-status");
                            }
                            //==========如果车间没被选中========
                            else {
                                //所有子车间加上active的class
                                $(target).addClass("active");
                                $(target).siblings("ul").find(".select-status").each(function () {
                                    $(this).attr("class","select-status active")
                                });
                                //左侧菜单出现本车间的信息
                                $scope.locationRuleList.push({
                                    locationId: id,
                                    locationName: target.nextElementSibling.innerText,
                                    ruleName: "请选择排程规则",
                                    ruleId: ""
                                });
                            }
                            //根据点击，改变所有地点树父车间的显示状态
                            changeParentSelected($(target));
                            //强制刷新dom
                            $scope.$apply();
                        })
                })
            })
    }

    //**********妥协代码start*********//
    //执行拖拽
    $timeout(function () {
        $(".gridly").dragsort({
            dragSelector: "li", dragEnd: function () {
            }, dragBetween: false, placeHolderTemplate: "<li></li>"
        });
        let timeClick;
        $(".gridly").on("mousedown", "li .workshop-ruleNav", function (e) {
            timeClick = new Date();
            e.stopPropagation();
        }).on("mouseup", "li .workshop-ruleNav", function (e) {
            if (new Date() - timeClick > 300) {
            } else {
                e.stopPropagation();
            }
        });
    }, 1000);
    //**********妥协代码end*********//

    //初始化车间树==查看不同计划时调用，为选中车间加上active的class
    $scope.setWorkshop = () => {
        let workshopTree = $("#jWorkshop");
        // 清空痕迹
        workshopTree.find("i").removeClass("active select-some");
        workshopTree.find("ul ul span").removeClass("item-select");
        //为每个车间添加选中状态
        $timeout(function () {
            $scope.locationRuleList.forEach((item) => {
                let selectI = workshopTree.find("i[data-location-id=" + item.locationId + "]");
                //===为父元素添加相应的状态
                selectI.siblings("span").addClass("item-select");///本车间添加展开状态
                selectI.addClass("active");//本车间添加选中状态
                selectI.siblings("ul").find(".select-status").addClass("active");//点击车间下的所有子车间设置为选中状态
                changeParentSelected(selectI);
            });
        },0)
    };

    //根据子元素点击情况改变父元素状态
    let changeParentSelected = (elem) => {
        let parentLi = elem.parent();
        let parentUl = parentLi.parent();
        const childrenLiLength = parentUl.find("i").length;//所有input的数量
        const selectedLength = parentUl.find(".select-status.active").length;//选中input的数量
		//判断父元素操作权限，如果父元素没有则停止向上改变状态
		if(parentUl.siblings("i").attr("data-merge-location") === 'false'){
			return;
		}
        //如果全部选中，父元素也变为全部选中状态
        if(childrenLiLength === selectedLength){
            parentUl.siblings("i").attr("class","select-status active");
        }else{
            //如果全部未选中，父元素也变为未选中状态
            if(selectedLength === 0){
                parentUl.siblings("i").attr("class","select-status")
            }else{
                parentUl.siblings("i").attr("class","select-status select-some")
            }
        }
        //如果不是第一级，则继续循环递归
        if(!parentUl.parent().hasClass("location-list")){
            changeParentSelected(parentUl.siblings("i"));
        }
    };

    /**
     * desc:向上递归获取到真正的规则ID和规则名字
     * time:2017-06-02
     * last:linzx
     * @param: locationId :车间id，
     * @return: 包含规则id和名字的对象 {ruleId : "",ruleName : ""}
     **/
    let getRuleIdAndName = (locationId) => {
        let ruleObj = {ruleId : "",ruleName : ""};
        if(tool.typeObject($scope.locationRuleList) !== "Array"){
			//测试错误代码，2017-06-27，可随时删除
        	console.info($scope.locationRuleList,"$scope.locationRuleList为空转化为数组");
			$scope.locationRuleList = [];
		}
        $scope.locationRuleList.some((item) => {
            if(item.locationId === locationId){
                ruleObj.ruleId = item.ruleId;
                ruleObj.ruleName = item.ruleName;
                return true;
            }
        });
        if((ruleObj && ruleObj.ruleId) || (locationId === "01")){
            return ruleObj;
        }else{
            return getRuleIdAndName(locationId.slice(0,-2));
        }
    };

    /**
     * desc:根据点击车间，改变中间车间列表展示数据，需要展示哪些车间
     * time:2017-06-12
     * last:linzx
     * @param: locationId :车间id，
     **/
    let changeParentLocationList = (locationId) => {
        const parentLocationId = locationId.slice(0,-2);
        /*
         * 根据父车间是否选中来判断是否需要拆分左边列表，
         * 如果父车间没有选中，则无需做任何操作（isActive正确）
         * 如果父车间选中，则需要将左边的车间规则列表进行拆分，然后继续向上寻找是否需要继续拆分父车间
         */
        //判断父元素是否是选中状态，如果isActive是true：选中，false ：未选中
        const selectI = $("#jWorkshop").find("i[data-location-id=" + parentLocationId +"]");
        const isActive = selectI.hasClass("active");
        if(isActive){
            //在删除父车间前，获得父车间的规则名，用于下面出现的子车间继承
            const ruleObj = getRuleIdAndName(parentLocationId);
            //删除排程方案中父元素车间下的所有排程车间，在下面li中重新获取
            $scope.locationRuleList = $scope.locationRuleList.filter((item) => {
                //保留不符合的
                return item.locationId !== parentLocationId;
            });
            //父级车间取消，变为剩下的子级车间,将除点击之外的所有兄弟元素车间显示出来
            const allSiblingsLocation = selectI.siblings("ul").children("li");
            allSiblingsLocation.each(function () {
                let itemLocationId = $(this).children("i").attr("data-location-id");
                if(itemLocationId !== locationId){
                    //过滤当前列表是否出现重复车间
                    //测试情况：1级车间全选，然后取消某二级车间，再次点击，不选规则，再次取消,重复出现车间
                    let hasSameLocation = $scope.locationRuleList.some((item) => {
                        return item.locationId === itemLocationId;
                    });
                    if(!hasSameLocation){
                        $scope.locationRuleList.push({
                            locationId: $(this).children("i").attr("data-location-id"),
                            locationName: $(this).children("span").text(),
                            ruleName: ruleObj.ruleName ? ruleObj.ruleName : "请选择排程规则",
                            ruleId: ruleObj.ruleId
                        })
                    }
                }
            });
        }else{
            //父元素没有选中，则直接从规则列表中删除对应的车间
            $scope.locationRuleList = $scope.locationRuleList.filter((item) => {
                return item.locationId !== parentLocationId;
            });
        }
        //如果父元素车间不是最上级车间，则继续向上改变
        if(parentLocationId &&　parentLocationId !== "01"){
            changeParentLocationList(parentLocationId);
        }
    };

    /**排程方案保存进行发送数据**/
    $scope.saveSchedulePlan = () => {
		const planNameVal = $(".jPlanName input").val(),
            currentPlanLi = $(".schedulePlanLi.active"),
            locationLi = $("#workshopRule").children("ul").children("li");
		if (!planNameVal.length) {
			layer.alert("排程方案名不可以为空");
			return;
		}
        //如果保存方案中时没有车间，则给出提示
        if (locationLi.length <= 0) {
            layer.alert("请为排程方案至少选择一个车间");
            return;
        }
		//新建一个需要发送的post数据
		let postData = {
			"schemeId": currentPlanLi.attr("data-scheme-id"),
			"schemeName": planNameVal,
			"locationRuleList": []
		};
        let emptyRule = true;//用于后面判断
        //遍历所有的车间li用于获取车间顺序和相应的规则信息
        locationLi.each(function () {
            let item = $(this)[0];
            let locationA = item.firstElementChild;
            let ruleA = item.lastElementChild.firstElementChild;
            let obj = {
                "locationId": item.getAttribute("data-location-id"),
                "locationName": locationA.innerHTML,
                "ruleId": ruleA.getAttribute("data-rule-id"),
                "ruleName": ruleA.innerHTML,
            };
            if(ruleA.getAttribute("data-rule-id") === ""){
                emptyRule = false;
            }
            postData.locationRuleList.push(obj);
        });
		if(!emptyRule){
			layer.alert("请为每个排程车间配备排程规则");
			return;
		}
        /*判断是否是临时方案，如果是更新，不是则新建方案
         *true : 临时方案，执行新建操作；false ：已保存方案，执行更新
        */
        if (postData.schemeId.slice(0, 9) === "temporary") {
            delete postData.schemeId;
            http.post({
                url: $rootScope.restful_api.single_schedule_plan,
                data: postData,
                successFn: (res) => {
                    if (res.data) {
                        $scope.info.success("排程方案新建成功");
                        //将临时id替换成获得的方案id
                        currentPlanLi.attr("data-scheme-id",res.data);
                        $scope.currentPlan.schemeId = res.data;
                        $scope.schemeId = res.data;
                    }
                    /*
                     * 判断是否临时创建的方案，用于离开排程方案页面进行判断，
                     * 判断代码写在路由配置文件里routerConfig.js
                     */
					sessionStorage.temporarySchemeLength = Object.keys($scope.temporarySchemeData).length;
                },
                errorFn: function () {
                    $scope.info.fail("排程方案新建失败，请检查服务器");
                }
            });
        } else {
            http.put({
                url: $rootScope.restful_api.single_schedule_plan + $scope.schemeId,
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

    //创建临时方案数据库，存储临时创建但是未保存的方案，关闭或刷新页面数据库消失
    $scope.temporarySchemeData = {};
    //执行临时创建方法
    $scope.recordTemporaryPlan = () => {
        if (!$scope.newSchemeName) {  //输入框中已设置newSchemeName
            layer.msg("排程方案名不能为空");
            return false;
        }
        if (!tool.checkRepeatName($scope.newSchemeName, $scope.planList, "scheme")) {
            layer.msg("排程方案名重复，请重新输入");
            return false;
        }
        //清楚地点树中之前选中的痕迹
        $(".location-list").find("i").removeClass("active select-some");
        //临时方案设置为true
        //初始化页面内容,通过判断方案ID查看是否设置了复制方案
        let cloneSchemeId = $("#planSelect").val();
        if (cloneSchemeId> 0) {
            http.get({
                url: $rootScope.restful_api.single_schedule_plan + cloneSchemeId,
                successFn: function (res) {
                    $scope.locationRuleList = res.data.locationRuleList || [];
					$scope.schemeId = "temporary" + $scope.planList.length;
                    $scope.planList.push({
                        schemeName: $scope.newSchemeName,
                        schemeId: $scope.schemeId,
                        locationRuleList: $scope.locationRuleList
                    });
                    //点击目录选中最后一个li
                    $scope.temporarySchemeData["temporary" + ($scope.planList.length - 1)] = $scope.locationRuleList;
                    $timeout(function () {
                        $(".schedulePlanLi").last().trigger("click");
                    })
                }
            });
        } else {
            $scope.locationRuleList = [];
			$scope.schemeId = "temporary" + $scope.planList.length;
            $scope.planList.push({
                schemeName: $scope.newSchemeName,
                schemeId: $scope.schemeId,
                locationRuleList: $scope.locationRuleList
            });
            //点击目录选中最后一个li
            $scope.temporarySchemeData["temporary" + ($scope.planList.length - 1)] = $scope.locationRuleList;
            $timeout(function () {
                $(".schedulePlanLi").last().trigger("click");
            })
        }
        /*判断是否临时创建的方案，用于离开排程方案页面进行判断，
        * 判断代码写在路由配置文件里routerConfig.js
        */
        sessionStorage.temporarySchemeLength = Object.keys($scope.temporarySchemeData).length;
        layer.closeAll();
    };

    //查看方案
    $scope.lookPlan = (plan) => {
        $scope.currentPlan = plan;//当前规则
        $scope.schemeId = $scope.currentPlan.schemeId;
        //先判断是否是临时方案
        //获取临时方案的车间和规则
        if (($scope.schemeId + "").slice(0, 9) === "temporary") {
            $scope.locationRuleList = $scope.temporarySchemeData[plan.schemeId];
            $scope.setWorkshop();
        } else {
            //获取存储的车间和规则
            http.get({
                url: $rootScope.restful_api.single_schedule_plan + plan.schemeId,
                successFn: function (res) {
                    // $scope.schemeDate = res.data;
                    $scope.schemeId = plan.schemeId;
                    $scope.locationRuleList = res.data.locationRuleList;
                    $scope.setWorkshop();
                },
                errorFn: function () {
                    $scope.schemeId = null;
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
            if ((id + "").slice(0, 9) === "temporary") {
                $scope.locationRuleList = $scope.temporarySchemeData[id];
                //方案列表删除此方案
                $timeout(() => {
                    $scope.planList = $scope.planList.filter((item) => {
                        return item.schemeId !== id;
                    });
                    //没有方案时，不需要执行
                    if ($scope.planList.length !== 0) {
                        $scope.lookPlan($scope.planList[0]);
                    }
                })
            } else {
                let target = event.target || event.srcElement;
                let parentElement = target.parentNode;
                let schemeId = parentElement.getAttribute("data-scheme-id");
                http.delete({
                    url: $rootScope.restful_api.single_schedule_plan + schemeId,
                    successFn: () => {
                        $scope.planList.some(function (item, index) {
                            if (item.schemeId === Number(schemeId)) {
                                $scope.planList.splice(index, 1);
								$scope.info.success("删除排程方案成功");
								return true
							}
                        });
                        //删除完方案，跳转查看第一个方案没有方案时，不需要执行
                        if ($scope.planList.length !== 0) {
                            $scope.lookPlan($scope.planList[0]);
                        }
                    },
                    errorFn: (res) => {
                        if(res.data.error_response.code === 1004){
                            $scope.info.fail(res.data.error_response.text);
                        }else{
                            $scope.info.fail("删除方案失败，请检查服务器")
                        }
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
                $scope.renderRulePage(res.data);
                let lookRule = layer.open({
                    type: 1,
                    title: ruleName,
                    area: ["900px", "300px"],
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

    $("body")
    //排程方案中选择排程规则
        .on("click", ".workshop-ruleNav li", function(e) {
            e.stopPropagation();
            const locationId = $(this).parent().attr("data-location-id");
            $(this).parents(".workshop-ruleNav").removeClass("active");
			if(tool.typeObject($scope.locationRuleList) !== "Array"){
				//测试错误代码，2017-06-27，可随时删除
				console.info($scope.locationRuleList,"$scope.locationRuleList为空转化为数组");
				$scope.locationRuleList = [];
			}
            $scope.locationRuleList.some((item)=> {
                if(item.locationId === locationId){
                    item.ruleId = $(this).attr("data-rule-id") - 0;
                    item.ruleName = $(this).text();
                    return true;
                }
            });
            /**
             * desc : 所有兄弟车间被选中之后，如果这些车间规则一致，则将所有兄弟车间合并为上一级的父车间
			 * desc : 如果可以合并，查看父车间是否有权限可以进行合并，没有可写权限，则无法进行合并
             * desc : 如何判断是否选择了所有的车间：截取所选车间id前-2位，搜索车间树i[data-location-id=id]是否有一个active的class
             **/
            (function doAllSiblingsLocationToParentLocation(locationId) {
                const parentLocationId = locationId.slice(0,-2);
                //如果有这个active的class，表示车间已被全部选中
				const parentI = $("#jWorkshop").find("i[data-location-id=" + parentLocationId +"]");
                let isActive = parentI.hasClass("active");
                let isMerge = parentI.attr("data-merge-location") !== "false";//isMerge为true表示有可写权限，表示可以合并
                if (isMerge && isActive) {
                    //表现效果：同级列表全部选中时，如果所有车间的排程规则一致，则左侧所有同级车间变成父级车间
                    //表现效果：如果同级车间的排程规则不一致，则显示所有同级车间
                    let ruleId,ruleName;//遍历获得第一个兄弟车间的规则ID
                    $scope.locationRuleList.some((item) => {
                        if(item.locationId.indexOf(parentLocationId) > -1 && item.ruleId !== ""){
                            //获得第一个兄弟车间的规则ID，用于判断之后所有的兄弟车间(注意该规则不能为空)
                            ruleId = item.ruleId;
                            ruleName = item.ruleName;
                            return true;
                        }
                    });
                    let isSameRuleBySearchAllLocation = true;
                    $scope.locationRuleList.forEach((item) => {
                        if(item.locationId.indexOf(parentLocationId) > -1){
                            //获得某个兄弟车间的规则ID，用于判断所有兄弟车间规则是否一致
                            if(item.ruleId !== ruleId){
                                isSameRuleBySearchAllLocation = false;
                            }
                        }
                    });
                    //如果兄弟级车间规则一致则自动合并为上一级车间
                    if(isSameRuleBySearchAllLocation){
                        //先消除列表中所有的兄弟车间，然后展示他们父级车间和对应的规则
                        $scope.locationRuleList = $scope.locationRuleList.filter((item) => {
                            return item.locationId.indexOf(parentLocationId) === -1;
                        });
                        $scope.locationRuleList.push({
                            locationId: parentLocationId,
                            locationName: $("#jWorkshop").find("i[data-location-id=" + parentLocationId +"]").siblings("span").text(),
                            ruleName: ruleName,
                            ruleId: ruleId
                        });
                        //判断是否为第一级春风车间,不是则继续向上执行
                        if(parentLocationId !== "01"){
                            doAllSiblingsLocationToParentLocation(parentLocationId);
                        }else{
                            layer.msg("已合并为上一级车间", {time: 2000});
                        }
                    }
                }
            })(locationId);
            $scope.$apply();
        })
        .on("click", ".workshop-ruleNav", function(e) {
            e.stopPropagation();
            $(this).addClass("active");
        })
        .on("mouseleave", ".workshop-ruleNav", function() {
            $(this).removeClass("active");
        });
}]);
