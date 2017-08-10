"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by yiend on 2017/1/16.
 */
app.controller("adminConfigController", ["$rootScope", "$scope", "$timeout", "scheduleTableViewModelService", "http", "tool", function ($rootScope, $scope, $timeout, scheduleTableViewModelService, http, tool) {
    //显示正确的目录class-active
    $scope.configNav.activeNav = ".admin";
    $scope.adminController = {};
    var getColumnData = function getColumnData() {
        http.get({
            url: $rootScope.restful_api.reset_show_column + $scope.locationId,
            successFn: function successFn(res) {
                //获得get到的数据，渲染页面
                $scope.setDisplayGetData(res);
            },
            errorFn: function errorFn() {
                $scope.info.fail("获取数据失败，请检查是否连上服务器");
            }
        });
    };
    getColumnData();

    //初始化拖拽
    $scope.clickLiGetItem();

    //根据点击不同的车间选择不同的显示项
    $("#columnWorkshop").on("click", ".select-status", function (e) {
        //根据点击的车间ID
        $scope.locationId = e.target.getAttribute("data-location-id");
        $(".select-status").removeClass("active");
        $(e.target).addClass("active");
        //移除临时拖拽项
        $(".js-move").remove();
        getColumnData();
    });

    /**保存数据**/
    $scope.saveAdminDefaultDisplay = function () {
        var postData = $scope.getDisplayPostData("请至少选择一项显示");
        //检测数据是否正确
        if (!postData) {
            return;
        }
        http.put({
            url: $rootScope.restful_api.reset_show_column + $scope.locationId,
            data: postData,
            successFn: function successFn(response) {
                if (response.data === true) {
                    $scope.info.success("默认显示项保存成功");
                }
            },
            errorFn: function errorFn() {
                $scope.info.fail("默认显示项保存失败");
            }
        });
    };
    /**
     * 创造车间树
     * @param singleSelect:车间树是否是单选，bool值，true为单选，false为多选用于排程计划
     * @param getConfigData:各个controller成功之后的回调函数（渲染函数）
     * @returns
     * author: linzx
     * Date 2017-02-07
     */
    $scope.createWorkshop = function (singleSelect, getConfigData) {
        //存储树形数据,如果有，则不发送请求
        if (!$scope.folder) {
            http.get({
                url: $rootScope.restful_api.get_new_location,
                successFn: function successFn(res) {
                    $scope.resWorkshop = res.data;
                    $scope.folder = { "children": [scheduleTableViewModelService.getData($scope.resWorkshop)[0]] }; //处理数据,并绑定到页面
                    $timeout(function () {
                        $("[data-location-id=" + $scope.locationId + "]").addClass("active");
                        var li = $("#columnWorkshop").find("li"); //获得最上级一级车间的li
                        li.eq(0).children("ul").show();
                        li.eq(0).children("span").addClass("active");
                    });
                },
                errorFn: function errorFn(res) {
                    layer.alert("读取车间失败，请检查服务器");
                }
            });
        }
        //先点击默认地点
        $timeout(function () {
            $("[data-location-id=" + $scope.locationId + "]").addClass("active");
            var li = $("#columnWorkshop").find("li"); //获得最上级一级车间的li
            li.eq(0).children("ul").show();
            li.eq(0).children("span").addClass("active");
        });
        var outerEle = $(".location-list");
        // let mainTreeHeight = $(".location-tree-ul").eq(0).height();
        outerEle //改变状态
        .on("click", "ul .title-open", function () {
            $(this).toggleClass("active").next().toggle();
            //设置前面线的高度
            var li = $(this).parent(),
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
        if (singleSelect) {
            $("#columnWorkshop").on("click", ".select-status", function (e) {
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
    //创造车间地点树
    $scope.createWorkshop();
}]);
/**
 * Created by lzx on 2016/8/30.
 */
'use strict';
$("body").on("click", ".check-rule-nav .rule-li,.check-rule-nav .schedulePlanLi", function () {
    $(this).addClass("active").siblings().removeClass("active");
});
app.controller("configController", ["$rootScope", "$scope", "$http", "$location", "$timeout", "$state", "scheduleTableViewModelService", "tool", "http", function ($rootScope, $scope, $http, $location, $timeout, $state, scheduleTableViewModelService, tool, http) {
    //如果某些树没有权限则隐藏需要可写树的目录
    http.get({
        url: $rootScope.restful_api.get_new_location,
        successFn: function successFn(res) {
            //没有可写树权限，删除管理员目录目录
            if (tool.isEmptyObject(res.data)) {
                // $scope.adminController.adminNav = false;
                $("a[ui-sref='.admin'],a[ui-sref='.scheme']").parent().hide();
            }
        },
        errorFn: function errorFn() {
            $("a[ui-sref='.admin'],a[ui-sref='.scheme']").parent().hide();
        }
    });

    var historyUrl = sessionStorage.getItem("historyUrl") ? sessionStorage.getItem("historyUrl").split(",") : [];
    //如果由设备详情页，手动微调页，帮助页跳过来，默认到版本页，否则刷新仍然停留在原页面
    if ($scope.historyUrl) {
        $state.go('config.version');
    }

    //获得来源页面(手动微调页面需要)
    $rootScope.lastSourcePage = $location.$$url;

    //配置页面一级对象
    $scope.configNav = {};

    //获取跳转过来的地点ID,去除最后的生产线
    historyUrl.reverse().every(function (item) {
        if (item === "/result") {
            $scope.locationId = sessionStorage.getItem("locationId_res") || "01";
            return true;
        } else if (item === "/preview") {
            $scope.locationId = sessionStorage.getItem("locationId_pre") || "01";
            return true;
        } else {
            return false;
        }
    });

    //获得来源页面(手动微调页面需要)
    $rootScope.lastSourcePage = $location.$$url;

    //如果由设备详情页，手动微调页，帮助页跳过来，默认到版本页，否则刷新仍然停留在原页面
    //根据来源页面获得车间ID和车间名字进行显示
    if ($scope.historyUrl) {
        $state.go('config.version');
    }

    $scope.currentShowLocationName = sessionStorage.currentShowLocationName; //刷新直接使用缓存的车间名字
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
    $scope.isActiveNav = function (val) {
        return $scope.configNav.activeNav === val;
    };

    //自定义目录栏数据
    $scope.configLis = [{ text: "VersionNav", url: "view/version.html", "sref": ".version" }, { text: "displayConfiguration", url: "view/columnConfig.html", "sref": ".display",
        children: [{ text: "WorkArea", url: "view/displayDays", "sref": ".workArea" }, //原名为一级页面
        { text: "WorkUnit", url: "view/columnConfig.html", "sref": ".workUnit" }, //原名为二级页面
        { text: "WorkMenu", url: "view/displayDays", "sref": ".workMenu" }]
    }, { text: "ScheduleRuleSetting", url: "view/checkFrom.html", "sref": ".rule" }, { text: "SchedulingSchemeSettings", url: "view/schedulePlan.html", "sref": ".scheme" }, { text: "AdministratorConfigurationItem", url: "view/adminProperty.html", "sref": ".admin",
        children: [{ text: "默认显示项", url: "view/adminDisplay.html", "sref": ".defaultDisplay", class: "adminNav" }]
    }];

    /**
     * 1.点击目录跳转加上class-active;
     * @param sref:对应标志
     * @param event:
     * @returns
     * author: linzx
     */
    $scope.selectLi = function (sref, event) {
        //为li加上class-active
        $scope.configNav.activeNav = sref;
        //下拉代码
        var Li = $(event.target).parent();
        if (Li.hasClass("disabled")) {
            return false;
        }
        if (Li.hasClass("drag")) {
            Li.removeClass("drag");
            return;
        }
        Li.addClass("drag").siblings().removeClass("drag");
        event.stopPropagation();
    };

    /**************=======================相关零散代码========================************/
    //保存和还原弹出提示框
    $scope.infoObj = {
        mask: false,
        errorInfo: false,
        text: ""
    };

    var Info = function () {
        function Info() {
            _classCallCheck(this, Info);
        }

        _createClass(Info, [{
            key: "common",
            value: function common(str) {
                $scope.infoObj.mask = true;
                $scope.infoObj.text = str;
                $timeout(function () {
                    $scope.infoObj.mask = false;
                }, 2500);
            }
        }, {
            key: "msg",
            value: function msg(str) {
                this.common(str);
            }
        }, {
            key: "success",
            value: function success(str) {
                this.common(str);
                $scope.infoObj.errorInfo = false;
            }
        }, {
            key: "fail",
            value: function fail(str) {
                this.common(str);
                $scope.infoObj.errorInfo = true;
            }
        }]);

        return Info;
    }();

    $scope.info = new Info();

    //管理删除
    $scope.startMange = function () {
        $scope.showManage = !$scope.showManage;
        $timeout(function () {
            if ($scope.showManage) {
                var input = $(".check-rule-nav li").eq(1).children("input")[0];
                input.select();
                input.focus();
                $(".nav-manage").text("保存");
            } else {
                $(".nav-manage").text("编辑");
            }
        }, 0);
    };

    /**
     * 保存显示项发送数据
     * @param str: 错误时提示
     * @return 发送的数据
     */
    $scope.getDisplayPostData = function (str) {
        var resData = $scope.columnContentData;
        var selectValue = [];
        //获得选中的li
        $("#sort-item").find("li").each(function () {
            var attr = $(this).attr("data-keyname");
            selectValue.push(attr);
        });
        if (selectValue.length <= 0) {
            $scope.info.fail(str);
            return false;
        }
        //新建一个需要发送的数据
        var postData = {};
        postData.optionList = resData.optionList;
        postData.selectList = [];
        for (var i = 0, length = selectValue.length; i < length; i++) {
            for (var j = 0, len = resData.optionList.length; j < len; j++) {
                var compareOptionText = resData.optionList[j].valueContent.replace(":desc", "");
                // console.log(compareOptionText);
                // console.log(selectValue[i].replace(":desc",""));
                // console.log(compareOptionText === selectValue[i].replace(":desc",""));
                if (compareOptionText === selectValue[i].replace(":desc", "")) {
                    if ($(".sort-item li").eq(i).attr("data-order") == "down") {
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
    $scope.setDisplayGetData = function (res) {
        $scope.columnContentData = res.data;
        $scope.userConfigData = scheduleTableViewModelService.sortItem($scope.columnContentData); //获得返回到左边显示的项目
        $scope.userSelectConfigData = scheduleTableViewModelService.sortSelectItem($scope.columnContentData); //获得返回到右边显示的项目
    };

    $("body")
    //配置页所有下拉列表代码
    .on("click", "dd.relative", function () {
        //判断是否可编辑，是否生效
        if ($(this).hasClass("not-edit")) {
            return;
        }
        $(".scheduleDrag").removeClass("draw");
        $(this).children(".scheduleDrag").toggleClass("draw");
    }).on("mouseleave", "dd.relative", function () {
        $(this).children(".scheduleDrag").removeClass("draw");
    }).on("click", "dd.relative li", function (e) {
        var index = $(this).index();
        $(this).parent().siblings("span").text($(this).text());
        var opts = $(this).parent().siblings("select")[0];
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
    $scope.renderRulePage = function (res) {
        $scope.scheduleCheckData = $.extend({}, res);
        // $scope.ruleName = $scope.scheduleCheckData.ruleName;
        //设定排程前的顺序 === [颜色信息校验,刀具信息校验,夹具信息校验,产能校验,物料信息校验,PAP信息校验,工艺路线信息校验,排程步骤校验,适宜设备校验,系统配置校验]
        $scope.scheduleFrontData = [];
        var frontData = scheduleTableViewModelService.validation_rules_from(res); //获得排程前需要的数据
        //"CT_INFO_CHECKING","FIXTURE_INFO_CHECKING","PAP_INFO_CHECKING",
        var scheduleFrontData = ["COLOR_INFO_CHECKING", "CAPABILITY_INFO_CHECKING", "MATERIAL_INFO_CHECKING", "ROUTING_INFO_CHECKING", "SUITABLE_PRODUCT_INFO_CHECKING", "SYSTEM_CONFIG_CHECKING"];
        scheduleFrontData.forEach(function (item, index) {
            $scope.scheduleFrontData.push(frontData[item]);
        });

        //设定排程后的顺序 === [物流疏通校验,齐套性校验,组合件校验,超产能校验,生产时间校验]
        $scope.scheduleLaterData = [];
        var laterData = scheduleTableViewModelService.validation_rules_later(res); //获得排程后需要的数据
        //"PROCESS_SEQ_CHECKING","POMO_SUIT_CHECKING","ASSEMBLING_UNIT",
        var scheduleLaterData = ["CAPABILITY_OVER_CHECKING", "PRODUCTION_TIME_CHECKING"];
        scheduleLaterData.forEach(function (item) {
            $scope.scheduleLaterData.push(laterData[item]);
        });

        //设置选中的option
        $scope.schedulePointSelected = $scope.scheduleCheckData.schedulePoint;
        $scope.papTypeSelected = $scope.scheduleCheckData.papType;
        $scope.schedulePeriodSelected = $scope.scheduleCheckData.schedulePeriod;
        setTimeout(function () {
            //控制下拉列表
            Array.prototype.forEach.call($("dd.relative span"), function (item) {
                var select = $(item).siblings("select");
                var ul = $(item).siblings("ul");
                ul.find("li[data-value=" + $(item).attr("data-value") + "]").trigger("click");
                var text = $(item).siblings("select").find("option:selected").text();
                $(item).text(text);
            });
            //控制选中状态
        }, 0);
    };
    //根据此模块设置各个排程规则项的是否要展示
    $scope.scheduleRuleItemShow = {
        isLoadOverduePoolTask: true, //当前日期前的车间计划 ：
        overduePeriod: true, //拉取当前车间计划天数
        schedulePeriodSelected: true, //排程周期
        scheduleInterval: true, //排程间隔
        minScheduleDay: true, //最早起排日期
        freezePeriod: true, //冻结期
        //排程前校验
        preScheduleCheckMap: {
            CAPABILITY_INFO_CHECKING: false, //产能校验
            COLOR_INFO_CHECKING: false, //颜色信息校验
            CT_INFO_CHECKING: true, //刀具信息校验
            FIXTURE_INFO_CHECKING: true, //夹具信息校验
            MATERIAL_INFO_CHECKING: false, //物料信息校验
            PAP_INFO_CHECKING: true, //PAP信息校验
            ROUTING_INFO_CHECKING: false, //排程步骤校验
            SUITABLE_PRODUCT_INFO_CHECKING: false, //适宜设备校验
            SYSTEM_CONFIG_CHECKING: false },
        //排程后校验
        postScheduleCheckMap: {
            ASSEMBLING_UNIT: true, //组合件校验
            CAPABILITY_OVER_CHECKING: false, //超产能校验
            POMO_SUIT_CHECKING: true, //齐套性校验
            PROCESS_SEQ_CHECKING: true, //物流疏通校验
            PRODUCTION_TIME_CHECKING: false },
        papTypeSelected: true,
        schedulePointSelected: true, //起排工序
        isAheadOn: true, //启用延迟生产
        isCombinationOn: true, //启用组合件
        isEconomicOn: true, //启用经济批量
        isFrequencyOn: true, //启用生产频度
        isUseNotMassEqu: true, //使用非批量设备
        //排程因子权重
        scheduleWeightMap: {
            KEY_EQUIPMENT: true, //关键设备
            MOST_USED_EQUIPMENT: true, //高负荷设备
            SAME_COLOR: true, //相同颜色
            SAME_CT: true, //相同刀具
            SAME_FIXTURE: true, //相同物料
            SAME_MATERIAL: true, //相似物料
            SIMILAR_MATERIAL: true }
    };

    /**
     * 创造车间树
     * @param singleSelect:车间树是否是单选，bool值，true为单选，false为多选用于排程计划
     * @param getConfigData:各个controller成功之后的回调函数（渲染函数）
     * @returns
     * author: linzx
     * Date 2017-02-07
     */
    $scope.createWorkshop = function (singleSelect, getConfigData) {
        //存储树形数据,如果有，则不发送请求
        if (!$scope.folder) {
            http.get({
                url: $rootScope.restful_api.get_new_location,
                successFn: function successFn(res) {
                    $scope.folder = { "children": [scheduleTableViewModelService.getData($scope.resWorkshop)[0]] }; //处理数据,并绑定到页面
                    $timeout(function () {
                        $("[data-location-id=" + $scope.locationId + "]").addClass("active");
                        var li = $("#columnWorkshop").find("li"); //获得最上级一级车间的li
                        li.eq(0).children("ul").show();
                        li.eq(0).children("span").addClass("active");
                    });
                },
                errorFn: function errorFn(res) {
                    layer.alert("读取车间失败，请检查服务器");
                }
            });
        }
        //先点击默认地点
        $timeout(function () {
            $("[data-location-id=" + $scope.locationId + "]").addClass("active");
            var li = $("#columnWorkshop").find("li"); //获得最上级一级车间的li
            li.eq(0).children("ul").show();
            li.eq(0).children("span").addClass("active");
        });
        var outerEle = $(".location-list");
        outerEle //改变状态
        .on("click", "ul .title-open", function () {
            $(this).toggleClass("active").next().toggle();
            //设置前面线的高度
            var li = $(this).parent(),
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
        if (singleSelect) {
            $("#columnWorkshop").on("click", ".select-status", function (e) {
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
    function changeSelectStatus(thisSelect) {
        var thisSelect = thisSelect;
        //本身及所有后代的改变
        if (thisSelect.hasClass("select-some") || thisSelect.hasClass("unselect")) {
            thisSelect.attr("class", "select-status active");
            thisSelect.parent("li").find("ul i").attr("class", "select-status active");
        } else {
            thisSelect.attr("class", "select-status");
            thisSelect.parent("li").find("ul i").attr("class", "select-status");
        }
    }

    //拖拽区域进行初始化
    $scope.clickLiGetItem = function () {
        //每次点击后目录蓝需要重新获取移动的li(配置项)
        setTimeout(function () {
            new DragNewItem('all-item', 'provide-item', 'sort-item', {});
            $("#sort-item").find("li").each(function () {
                var span = $(this).children(".itemOrder");
                span.addClass(span.attr("ng-class"));
            });
        }, 50);
        //清除用户移动后未保存的项目
        $("#all-item").find(".js-move").remove();
    };
}]);

/**
 * Created by linzx on 2017/4/17.
 */
'use strict';
app.controller("displayController", ["$rootScope", "$scope", "$timeout", "tool", "http", "$state", function ($rootScope, $scope, $timeout, tool, http, $state) {
    //默认显示第一个tab---工作区域
    $state.go('config.workArea');
}]);
/**
 * Created by yiend on 2017/1/23.
 */
'use strict';
app.controller("firstPageController", ["$rootScope", "$scope", "$http", "$state", function ($rootScope, $scope, $http, $state) {
    //默认显示第一个tab---start
    $state.go('config.workArea.displayCombine');
    //显示正确的目录class-active
    $scope.configNav.activeNav = ".workArea";
    //默认显示第一个tab---end
    $scope.firstPage = {
        title: "", //面包屑导航三级目录文字
        showItemLists: [], //显示天数
        combineItemList: [] };
}]).controller("displayCombineController", ["$rootScope", "$scope", "$http", "http", function ($rootScope, $scope, $http, http) {
    //设置面包屑导航
    $scope.firstPage.title = "显示合并项";

    /**
     *根据点击的车间树获得相应的车间ID,显示对应显示合并项的数据
     */
    var getDisplayCombineData = function getDisplayCombineData() {
        http.get({
            url: $rootScope.restful_api.firstPage_display_combine + $scope.locationId,
            successFn: function successFn(res) {
                //获得get到的数据，渲染页面
                $scope.firstPage.combineItemList = res.data.optionList;
                $scope.selectValue = res.data.selectList[0].valueContent;
            },
            errorFn: function errorFn() {
                layer.alert("获取显示合并项失败，请检查服务器");
            }
        });
    };
    getDisplayCombineData();

    // //创建车间树
    // $scope.createWorkshop(true,getDisplayCombineData);

    //保存数据
    $scope.saveDisplayCombine = function () {
        //第一次进入页面没有选择
        if (!$scope.selectValue) {
            layer.alert("请选择一个一级页面合并规则");
            return;
        }
        var selectObj = $scope.firstPage.combineItemList.filter(function (item) {
            return item.valueContent === $scope.selectValue;
        })[0];
        var postData = {
            "selectList": [{
                valueContent: selectObj.valueContent,
                valueAlias: selectObj.valueAlias
            }]
        };
        http.put({
            url: $rootScope.restful_api.firstPage_display_combine + $scope.locationId,
            data: postData,
            successFn: function successFn(res) {
                if (res.data) {
                    $scope.info.success("数据保存成功");
                } else {
                    $scope.info.fail("数据保存失败");
                }
            },
            errorFn: function errorFn() {
                layer.alert("数据保存失败，请检查服务器");
            }
        });
    };
}]).controller("displayFlipController", ["$rootScope", "$scope", "$http", "http", function ($rootScope, $scope, $http, http) {
    $scope.firstPage.title = "显示翻转";
    /**
     *根据点击的车间树获得相应的车间ID,显示对应一级页面是否翻转
     */
    var getDisplayFlipData = function getDisplayFlipData() {
        http.get({
            url: $rootScope.restful_api.firstPage_display_flip + $scope.locationId,
            successFn: function successFn(res) {
                //获得get到的数据，渲染页面
                $scope.firstPage.flipList = res.data.optionList;
                $scope.selectValue = res.data.selectList[0].valueContent || 0; //默认不翻转
            },
            errorFn: function errorFn() {
                layer.alert("获取显示翻转数据失败，请检查服务器");
            }
        });
    };
    getDisplayFlipData();

    //保存数据
    $scope.saveDisplayFlip = function () {
        console.log($scope.selectValue);
        var selectObj = $scope.firstPage.flipList.filter(function (item) {
            return item.valueContent === $scope.selectValue;
        })[0];
        var postData = {
            "selectList": [{
                valueContent: selectObj.valueContent,
                valueAlias: selectObj.valueAlias
            }]
        };
        http.put({
            url: $rootScope.restful_api.firstPage_display_flip + $scope.locationId,
            data: postData,
            successFn: function successFn(res) {
                if (res.data) {
                    $scope.info.success("数据保存成功");
                } else {
                    $scope.info.fail("数据保存失败");
                }
            },
            errorFn: function errorFn() {
                layer.alert("数据保存失败，请检查服务器");
            }
        });
    };

    // //创建车间树
    // $scope.createWorkshop(true,getDisplayFlipData);
}]);

/**
 * Created by yiend on 2017/2/15.
 */
"use strict";
app.controller("functionModuleController", ["$rootScope", "$scope", "$http", "$state", "http", function ($rootScope, $scope, $http, $state, http) {
    //默认显示第一个tab---start
    $state.go('config.workMenu.task');
    //显示正确的目录class-active
    $scope.configNav.activeNav = ".workMenu";
    //默认显示第一个tab---end
    $scope.functionPage = {
        title: "", //面包屑导航三级目录文字
        showItemLists: [], //显示天数
        combineItemList: [] };

    //======================taskController========================//
    //设置面包屑导航
    $scope.functionPage.showPageConfig = "任务池显示项";

    //获取数据，创造车间树
    // $scope.createWorkshop(true,getColumnData);
}]).controller("taskColumnController", ["$rootScope", "$scope", "http", function ($rootScope, $scope, http) {
    /**
     *根据点击的车间树获得相应的车间ID,显示对应排序表的数据
     */
    var getColumnData = function getColumnData() {
        http.get({
            url: $rootScope.restful_api.task_column_config + $scope.locationId,
            successFn: function successFn(res) {
                //如果请求到的数据有列信息，没有则给出提醒信息
                if (res.data.optionList.length) {
                    //获得get到的数据，渲染页面
                    $scope.setDisplayGetData(res);
                    $scope.displayData = { leftDisplay: "未显示项", rightDisplay: "已显示项" };
                } else {
                    $scope.info.fail("没有显示信息需要配置");
                }
            },
            errorFn: function errorFn() {
                $scope.info.fail("获取数据失败，请检查是否连上服务器");
            }
        });
    };
    getColumnData();

    //初始化拖拽
    $scope.clickLiGetItem();

    /**列信息配置点击保存进行发送数据**/
    $scope.saveTaskColumn = function () {
        var postData = $scope.getDisplayPostData("请至少选择一项显示");
        //检测数据是否正确
        if (!postData) {
            return;
        }
        http.put({
            url: $rootScope.restful_api.task_column_config + $scope.locationId,
            data: postData,
            successFn: function successFn(response) {
                if (response.data === true) {
                    $scope.info.success("数据保存成功");
                }
            },
            errorFn: function errorFn() {
                $scope.info.fail("数据保存失败");
            }
        });
    };

    /**列信息还原数据**/
    $scope.resetTaskColumn = function () {
        http.delete({
            url: $rootScope.restful_api.task_column_config + $scope.locationId,
            successFn: function successFn(res) {
                $(".js-move").remove();
                //获得get到的数据，渲染页面
                $scope.setDisplayGetData(res);
                $scope.info.success("还原配置成功");
            },
            errorFn: function errorFn() {
                $scope.info.fail("还原配置失败");
            }
        });
    };
}]).controller("cacheRoomController", ["$rootScope", "$scope", "http", function ($rootScope, $scope, http) {
    //设置面包屑导航
    $scope.functionPage.showPageConfig = "暂存间显示项";
    /**
     *根据点击的车间树获得相应的车间ID,显示对应排序表的数据
     */
    var getColumnData = function getColumnData() {
        http.get({
            url: $rootScope.restful_api.cache_room_config + $scope.locationId,
            successFn: function successFn(res) {
                //如果请求到的数据有列信息，没有则给出提醒信息
                if (res.data.optionList.length) {
                    //获得get到的数据，渲染页面
                    $scope.setDisplayGetData(res);
                    $scope.displayData = { leftDisplay: "未显示项", rightDisplay: "已显示项" };
                } else {
                    $scope.info.fail("没有显示信息需要配置");
                }
            },
            errorFn: function errorFn() {
                $scope.info.fail("获取数据失败，请检查是否连上服务器");
            }
        });
    };
    getColumnData();

    //初始化拖拽
    $scope.clickLiGetItem();

    /**列信息配置点击保存进行发送数据**/
    $scope.saveCacheRoom = function () {
        var postData = $scope.getDisplayPostData("请至少选择一项显示");
        //检测数据是否正确
        if (!postData) {
            return;
        }
        http.put({
            url: $rootScope.restful_api.cache_room_config + $scope.locationId,
            data: postData,
            successFn: function successFn(response) {
                if (response.data === true) {
                    $scope.info.success("数据保存成功");
                }
            },
            errorFn: function errorFn() {
                $scope.info.fail("数据保存失败");
            }
        });
    };

    /**列信息还原数据**/
    $scope.resetCacheRoom = function () {
        http.delete({
            url: $rootScope.restful_api.cache_room_config + $scope.locationId,
            successFn: function successFn(res) {
                $(".js-move").remove();
                //获得get到的数据，渲染页面
                $scope.setDisplayGetData(res);
                $scope.info.success("还原配置成功");
            },
            errorFn: function errorFn() {
                $scope.info.fail("还原配置失败");
            }
        });
    };
}]);
/**
 * Created by yiend on 2017/1/16.
 */
app.controller("planController", ["$rootScope", "$scope", "$timeout", "$q", "scheduleTableViewModelService", "tool", "http", function ($rootScope, $scope, $timeout, $q, scheduleTableViewModelService, tool, http) {

    $scope.$parent.showManage = false; //管理目录的垃圾桶删除按钮消失
    //显示正确的目录class-active
    $scope.configNav.activeNav = ".scheme";

    //初始化整棵车间树
    createPlanWorkshopTree();

    //创建车间树
    function createPlanWorkshopTree() {
        http.get({
            url: $rootScope.restful_api.get_new_location,
            successFn: function successFn(res) {
                // $scope.resWorkshopTree = res.data;
                $scope.folder = { "children": [scheduleTableViewModelService.getData(res.data)[0]] }; //处理数据,并绑定到页面
            },
            errorFn: function errorFn(res) {
                layer.alert("读取车间失败，请检查服务器");
            }
        }).then(function () {
            //获取车间计划列表
            http.get({
                url: $rootScope.restful_api.all_schedule_plan,
                successFn: function successFn(res) {
                    $scope.planList = res.data;
                    //如果没有排序计划
                    if (!$scope.planList[0]) {
                        $scope.schemeId = 0;
                    } else {
                        $scope.currentPlan = $scope.planList[0]; //当前规则
                        $scope.schemeId = $scope.currentPlan.schemeId;
                        //默认点击第一个
                        http.get({
                            url: $rootScope.restful_api.single_schedule_plan + $scope.schemeId,
                            successFn: function successFn(response) {
                                $scope.locationRuleList = response.data.locationRuleList;
                                //渲染车间树样式
                                $scope.setWorkshop();
                            }
                        });
                    }
                },
                errorFn: function errorFn() {
                    //获取服务器数据失败的情况下
                    $scope.planList = [];
                }
            })
            //获取规则列表
            .then(function () {
                http.get({
                    url: $rootScope.restful_api.all_schedule_rule,
                    successFn: function successFn(res) {
                        res = res.data;
                        $scope.ruleList = res;
                        //设置方案前，没有排程规则[];
                        if (!$scope.ruleList.length) {
                            layer.alert("请先设置一个排程规则");
                        } else {
                            $scope.ruleId = $scope.ruleList[0].ruleId;
                        }
                    },
                    errorFn: function errorFn(res) {}
                });
            });
        }).then(function () {
            $timeout(function () {
                //展开一级列表
                var li = $("#jWorkshop").find("li"); //获得最上级一级车间的li
                li.eq(0).children("ul").show();
                li.eq(0).children("span").addClass("active");

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
                        height = ul.height() - li.height(); //设置线的高度为ul的高度减去li的高度
                    if (index === ul.children().length) {
                        ul.children("b").height(height + 50);
                    } else {
                        ul.children("b").height("auto");
                    }
                })
                //选择添加/删除车间
                .on("click", ".select-status", function (event) {
                    //改变父元素车间的选中状况
                    var e = event || window.event;
                    var target = e.target || e.srcElement;
                    var id = target.getAttribute("data-location-id");
                    var firstRule = $scope.ruleList[0];
                    //判断有没有排程规则
                    if (!firstRule) {
                        layer.alert("请先添加排程规则");
                    }
                    //选中状态下，点击后取消左侧菜单里本车间
                    //未选中状态下，点击一级之后取消左侧菜单里面所有的子级车间(有选中的二级情况下)==>主要是为了取消子级车间
                    //因为不管选不选中都要执行这一段代码，所以提取到了最头上
                    for (var i = $scope.locationRuleList.length - 1; i >= 0; i--) {
                        if ($scope.locationRuleList[i].locationId.slice(0, id.length) === id) {
                            $scope.locationRuleList.splice(i, 1);
                        }
                    }

                    var parentLi = $(target).parent(); //选中的i元素的所属于的li
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
                                $(this).attr("class", "select-status active");
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
                });
            });
        });
    }

    //**********妥协代码start*********//
    //执行拖拽
    $timeout(function () {
        $(".gridly").dragsort({
            dragSelector: "li", dragEnd: function dragEnd() {}, dragBetween: false, placeHolderTemplate: "<li></li>"
        });
        var timeClick = void 0;
        $(".gridly").on("mousedown", "li .workshop-ruleNav", function (e) {
            timeClick = new Date();
            e.stopPropagation();
        }).on("mouseup", "li .workshop-ruleNav", function (e) {
            if (new Date() - timeClick > 300) {} else {
                e.stopPropagation();
            }
        });
    }, 1000);
    //**********妥协代码end*********//

    //初始化车间树==查看不同计划时调用，为选中车间加上active的class
    $scope.setWorkshop = function () {
        var workshopTree = $("#jWorkshop");
        // 清空痕迹
        workshopTree.find("i").removeClass("active select-some");
        workshopTree.find("ul ul span").removeClass("item-select");
        //为每个车间添加选中状态
        $timeout(function () {
            $scope.locationRuleList.forEach(function (item) {
                var selectI = workshopTree.find("i[data-location-id=" + item.locationId + "]");
                //===为父元素添加相应的状态
                selectI.siblings("span").addClass("item-select"); ///本车间添加展开状态
                selectI.addClass("active"); //本车间添加选中状态
                selectI.siblings("ul").find(".select-status").addClass("active"); //点击车间下的所有子车间设置为选中状态
                changeParentSelected(selectI);
            });
        }, 0);
    };

    //根据子元素点击情况改变父元素状态
    var changeParentSelected = function changeParentSelected(elem) {
        var parentLi = elem.parent();
        var parentUl = parentLi.parent();
        var childrenLiLength = parentUl.find("i").length; //所有input的数量
        var selectedLength = parentUl.find(".select-status.active").length; //选中input的数量
        //判断父元素操作权限，如果父元素没有则停止向上改变状态
        if (parentUl.siblings("i").attr("data-merge-location") === 'false') {
            return;
        }
        //如果全部选中，父元素也变为全部选中状态
        if (childrenLiLength === selectedLength) {
            parentUl.siblings("i").attr("class", "select-status active");
        } else {
            //如果全部未选中，父元素也变为未选中状态
            if (selectedLength === 0) {
                parentUl.siblings("i").attr("class", "select-status");
            } else {
                parentUl.siblings("i").attr("class", "select-status select-some");
            }
        }
        //如果不是第一级，则继续循环递归
        if (!parentUl.parent().hasClass("location-list")) {
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
    var getRuleIdAndName = function getRuleIdAndName(locationId) {
        var ruleObj = { ruleId: "", ruleName: "" };
        if (tool.typeObject($scope.locationRuleList) !== "Array") {
            //测试错误代码，2017-06-27，可随时删除
            console.info($scope.locationRuleList, "$scope.locationRuleList为空转化为数组");
            $scope.locationRuleList = [];
        }
        $scope.locationRuleList.some(function (item) {
            if (item.locationId === locationId) {
                ruleObj.ruleId = item.ruleId;
                ruleObj.ruleName = item.ruleName;
                return true;
            }
        });
        if (ruleObj && ruleObj.ruleId || locationId === "01") {
            return ruleObj;
        } else {
            return getRuleIdAndName(locationId.slice(0, -2));
        }
    };

    /**
     * desc:根据点击车间，改变中间车间列表展示数据，需要展示哪些车间
     * time:2017-06-12
     * last:linzx
     * @param: locationId :车间id，
     **/
    var changeParentLocationList = function changeParentLocationList(locationId) {
        var parentLocationId = locationId.slice(0, -2);
        /*
         * 根据父车间是否选中来判断是否需要拆分左边列表，
         * 如果父车间没有选中，则无需做任何操作（isActive正确）
         * 如果父车间选中，则需要将左边的车间规则列表进行拆分，然后继续向上寻找是否需要继续拆分父车间
         */
        //判断父元素是否是选中状态，如果isActive是true：选中，false ：未选中
        var selectI = $("#jWorkshop").find("i[data-location-id=" + parentLocationId + "]");
        var isActive = selectI.hasClass("active");
        if (isActive) {
            //在删除父车间前，获得父车间的规则名，用于下面出现的子车间继承
            var ruleObj = getRuleIdAndName(parentLocationId);
            //删除排程方案中父元素车间下的所有排程车间，在下面li中重新获取
            $scope.locationRuleList = $scope.locationRuleList.filter(function (item) {
                //保留不符合的
                return item.locationId !== parentLocationId;
            });
            //父级车间取消，变为剩下的子级车间,将除点击之外的所有兄弟元素车间显示出来
            var allSiblingsLocation = selectI.siblings("ul").children("li");
            allSiblingsLocation.each(function () {
                var itemLocationId = $(this).children("i").attr("data-location-id");
                if (itemLocationId !== locationId) {
                    //过滤当前列表是否出现重复车间
                    //测试情况：1级车间全选，然后取消某二级车间，再次点击，不选规则，再次取消,重复出现车间
                    var hasSameLocation = $scope.locationRuleList.some(function (item) {
                        return item.locationId === itemLocationId;
                    });
                    if (!hasSameLocation) {
                        $scope.locationRuleList.push({
                            locationId: $(this).children("i").attr("data-location-id"),
                            locationName: $(this).children("span").text(),
                            ruleName: ruleObj.ruleName ? ruleObj.ruleName : "请选择排程规则",
                            ruleId: ruleObj.ruleId
                        });
                    }
                }
            });
        } else {
            //父元素没有选中，则直接从规则列表中删除对应的车间
            $scope.locationRuleList = $scope.locationRuleList.filter(function (item) {
                return item.locationId !== parentLocationId;
            });
        }
        //如果父元素车间不是最上级车间，则继续向上改变
        if (parentLocationId && parentLocationId !== "01") {
            changeParentLocationList(parentLocationId);
        }
    };

    /**排程方案保存进行发送数据**/
    $scope.saveSchedulePlan = function () {
        var planNameVal = $(".jPlanName input").val(),
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
        var postData = {
            "schemeId": currentPlanLi.attr("data-scheme-id"),
            "schemeName": planNameVal,
            "locationRuleList": []
        };
        var emptyRule = true; //用于后面判断
        //遍历所有的车间li用于获取车间顺序和相应的规则信息
        locationLi.each(function () {
            var item = $(this)[0];
            var locationA = item.firstElementChild;
            var ruleA = item.lastElementChild.firstElementChild;
            var obj = {
                "locationId": item.getAttribute("data-location-id"),
                "locationName": locationA.innerHTML,
                "ruleId": ruleA.getAttribute("data-rule-id"),
                "ruleName": ruleA.innerHTML
            };
            if (ruleA.getAttribute("data-rule-id") === "") {
                emptyRule = false;
            }
            postData.locationRuleList.push(obj);
        });
        if (!emptyRule) {
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
                successFn: function successFn(res) {
                    if (res.data) {
                        $scope.info.success("排程方案新建成功");
                        //将临时id替换成获得的方案id
                        currentPlanLi.attr("data-scheme-id", res.data);
                        $scope.currentPlan.schemeId = res.data;
                        $scope.schemeId = res.data;
                    }
                    /*
                     * 判断是否临时创建的方案，用于离开排程方案页面进行判断，
                     * 判断代码写在路由配置文件里routerConfig.js
                     */
                    sessionStorage.temporarySchemeLength = Object.keys($scope.temporarySchemeData).length;
                },
                errorFn: function errorFn() {
                    $scope.info.fail("排程方案新建失败，请检查服务器");
                }
            });
        } else {
            http.put({
                url: $rootScope.restful_api.single_schedule_plan + $scope.schemeId,
                data: postData,
                successFn: function successFn(res) {
                    $scope.info.success("排程方案更新成功");
                },
                errorFn: function errorFn() {
                    $scope.info.fail("排程方案更新失败");
                }
            });
        }
    };

    //新建方案窗口
    $scope.openPlanWindow = function () {
        var index = layer.open({
            type: 1,
            title: false,
            closeBtn: 0,
            shadeClose: true,
            skin: 'yourclass',
            content: $(".addNewPlan"),
            success: function success() {
                $(".planName").focus();
                $(".layui-layer-content").on("click", ".close,.cancal", function () {
                    layer.close(index);
                });
            }
        });
    };

    //创建临时方案数据库，存储临时创建但是未保存的方案，关闭或刷新页面数据库消失
    $scope.temporarySchemeData = {};
    //执行临时创建方法
    $scope.recordTemporaryPlan = function () {
        if (!$scope.newSchemeName) {
            //输入框中已设置newSchemeName
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
        var cloneSchemeId = $("#planSelect").val();
        if (cloneSchemeId > 0) {
            http.get({
                url: $rootScope.restful_api.single_schedule_plan + cloneSchemeId,
                successFn: function successFn(res) {
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
                    });
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
            });
        }
        /*判断是否临时创建的方案，用于离开排程方案页面进行判断，
        * 判断代码写在路由配置文件里routerConfig.js
        */
        sessionStorage.temporarySchemeLength = Object.keys($scope.temporarySchemeData).length;
        layer.closeAll();
    };

    //查看方案
    $scope.lookPlan = function (plan) {
        $scope.currentPlan = plan; //当前规则
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
                successFn: function successFn(res) {
                    // $scope.schemeDate = res.data;
                    $scope.schemeId = plan.schemeId;
                    $scope.locationRuleList = res.data.locationRuleList;
                    $scope.setWorkshop();
                },
                errorFn: function errorFn() {
                    $scope.schemeId = null;
                }
            });
        }
    };

    //删除方案
    $scope.deletePlan = function (id, event) {
        event.stopPropagation();
        //获取临时方案的车间和规则
        var deletePlan = layer.confirm('确定删除此排程方案', {
            btn: ['确定', '取消'] //按钮
        }, function () {
            if ((id + "").slice(0, 9) === "temporary") {
                $scope.locationRuleList = $scope.temporarySchemeData[id];
                //方案列表删除此方案
                $timeout(function () {
                    $scope.planList = $scope.planList.filter(function (item) {
                        return item.schemeId !== id;
                    });
                    //没有方案时，不需要执行
                    if ($scope.planList.length !== 0) {
                        $scope.lookPlan($scope.planList[0]);
                    }
                });
            } else {
                var target = event.target || event.srcElement;
                var parentElement = target.parentNode;
                var schemeId = parentElement.getAttribute("data-scheme-id");
                http.delete({
                    url: $rootScope.restful_api.single_schedule_plan + schemeId,
                    successFn: function successFn() {
                        $scope.planList.some(function (item, index) {
                            if (item.schemeId === Number(schemeId)) {
                                $scope.planList.splice(index, 1);
                                $scope.info.success("删除排程方案成功");
                                return true;
                            }
                        });
                        //删除完方案，跳转查看第一个方案没有方案时，不需要执行
                        if ($scope.planList.length !== 0) {
                            $scope.lookPlan($scope.planList[0]);
                        }
                    },
                    errorFn: function errorFn(res) {
                        if (res.data.error_response.code === 1004) {
                            $scope.info.fail(res.data.error_response.text);
                        } else {
                            $scope.info.fail("删除方案失败，请检查服务器");
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
    $scope.viewRule = function (ruleId, ruleName, event) {
        http.get({
            url: $rootScope.restful_api.single_schedule_rule + ruleId,
            successFn: function successFn(res) {
                $scope.renderRulePage(res.data);
                var lookRule = layer.open({
                    type: 1,
                    title: ruleName,
                    area: ["900px", "300px"],
                    skin: 'viewRuleBox',
                    content: $(".layerBox"),
                    success: function success() {
                        // $(".viewRuleBox .layui-layer-close1").hide();
                        $scope.viewRuleShow = true;
                        $(".viewRuleBox").click(function (e) {
                            // e.preventDefault();
                            // return false;
                        });
                        $("body").on("click", ".save-sort,.viewRuleBox .layui-layer-close", function () {
                            layer.close(lookRule);
                            $timeout(function () {
                                $scope.viewRuleShow = false;
                            });
                        });
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
    .on("click", ".workshop-ruleNav li", function (e) {
        var _this = this;

        e.stopPropagation();
        var locationId = $(this).parent().attr("data-location-id");
        $(this).parents(".workshop-ruleNav").removeClass("active");
        if (tool.typeObject($scope.locationRuleList) !== "Array") {
            //测试错误代码，2017-06-27，可随时删除
            console.info($scope.locationRuleList, "$scope.locationRuleList为空转化为数组");
            $scope.locationRuleList = [];
        }
        $scope.locationRuleList.some(function (item) {
            if (item.locationId === locationId) {
                item.ruleId = $(_this).attr("data-rule-id") - 0;
                item.ruleName = $(_this).text();
                return true;
            }
        });
        /**
         * desc : 所有兄弟车间被选中之后，如果这些车间规则一致，则将所有兄弟车间合并为上一级的父车间
        * desc : 如果可以合并，查看父车间是否有权限可以进行合并，没有可写权限，则无法进行合并
         * desc : 如何判断是否选择了所有的车间：截取所选车间id前-2位，搜索车间树i[data-location-id=id]是否有一个active的class
         **/
        (function doAllSiblingsLocationToParentLocation(locationId) {
            var parentLocationId = locationId.slice(0, -2);
            //如果有这个active的class，表示车间已被全部选中
            var parentI = $("#jWorkshop").find("i[data-location-id=" + parentLocationId + "]");
            var isActive = parentI.hasClass("active");
            var isMerge = parentI.attr("data-merge-location") !== "false"; //isMerge为true表示有可写权限，表示可以合并
            if (isMerge && isActive) {
                //表现效果：同级列表全部选中时，如果所有车间的排程规则一致，则左侧所有同级车间变成父级车间
                //表现效果：如果同级车间的排程规则不一致，则显示所有同级车间
                var ruleId = void 0,
                    ruleName = void 0; //遍历获得第一个兄弟车间的规则ID
                $scope.locationRuleList.some(function (item) {
                    if (item.locationId.indexOf(parentLocationId) > -1 && item.ruleId !== "") {
                        //获得第一个兄弟车间的规则ID，用于判断之后所有的兄弟车间(注意该规则不能为空)
                        ruleId = item.ruleId;
                        ruleName = item.ruleName;
                        return true;
                    }
                });
                var isSameRuleBySearchAllLocation = true;
                $scope.locationRuleList.forEach(function (item) {
                    if (item.locationId.indexOf(parentLocationId) > -1) {
                        //获得某个兄弟车间的规则ID，用于判断所有兄弟车间规则是否一致
                        if (item.ruleId !== ruleId) {
                            isSameRuleBySearchAllLocation = false;
                        }
                    }
                });
                //如果兄弟级车间规则一致则自动合并为上一级车间
                if (isSameRuleBySearchAllLocation) {
                    //先消除列表中所有的兄弟车间，然后展示他们父级车间和对应的规则
                    $scope.locationRuleList = $scope.locationRuleList.filter(function (item) {
                        return item.locationId.indexOf(parentLocationId) === -1;
                    });
                    $scope.locationRuleList.push({
                        locationId: parentLocationId,
                        locationName: $("#jWorkshop").find("i[data-location-id=" + parentLocationId + "]").siblings("span").text(),
                        ruleName: ruleName,
                        ruleId: ruleId
                    });
                    //判断是否为第一级春风车间,不是则继续向上执行
                    if (parentLocationId !== "01") {
                        doAllSiblingsLocationToParentLocation(parentLocationId);
                    } else {
                        layer.msg("已合并为上一级车间", { time: 2000 });
                    }
                }
            }
        })(locationId);
        $scope.$apply();
    }).on("click", ".workshop-ruleNav", function (e) {
        e.stopPropagation();
        $(this).addClass("active");
    }).on("mouseleave", ".workshop-ruleNav", function () {
        $(this).removeClass("active");
    });
}]);
/**
 * Created by yiend on 2017/1/16.
 */
app.controller("ruleController", ["$rootScope", "$scope", "$http", "$timeout", "scheduleTableViewModelService", "tool", "http", function ($rootScope, $scope, $http, $timeout, scheduleTableViewModelService, tool, http) {
    //-----本页面相关初始化操作-----
    $scope.configNav.activeNav = ".rule"; //配置选项栏设置active的class
    $scope.$parent.showManage = false; //管理目录的垃圾桶删除按钮消失

    $scope.disable = {
        schedulePointSelected: false, //pap排程规则下拉列表==>
        scheduleInterval: false //排程周期 ==>
    };
    $scope.notEdit = {
        schedulePointSelected: false,
        scheduleInterval: false
    };
    //-----本页面相关初始化操作-----

    http.get({
        url: $rootScope.restful_api.all_schedule_rule,
        successFn: function successFn(res) {
            res = res.data;
            $scope.ruleList = $.extend([], res);
            //如果有规则，显示第一条排程规则
            if ($scope.ruleList[0]) {
                $scope.ruleId = $scope.ruleList[0].ruleId;
                http.get({
                    url: $rootScope.restful_api.single_schedule_rule + $scope.ruleId,
                    successFn: function successFn(res) {
                        $scope.rule = $scope.ruleList[0];
                        $scope.renderRulePage(res.data);
                    }
                })
                //表单初始化
                .then(function () {
                    //设置pap排程规则
                    if ($scope.scheduleCheckData.papType === "PAP_DISABLE") {
                        $scope.disable.schedulePointSelected = true;
                        $scope.notEdit.schedulePointSelected = true;
                    } else if ($scope.scheduleCheckData.papType === "PAP_SCHEDULE_RULE") {
                        $scope.disable.schedulePointSelected = false;
                        $scope.notEdit.schedulePointSelected = true;
                    }
                    //设置下拉选中值,初始化时间框
                    setTimeout(function () {
                        Array.prototype.forEach.call($("dd.relative span"), function (item) {
                            var text = $(item).siblings("select").find("option:selected").text();
                            $(item).text(text);
                        });
                    }, 0);
                    $("#freezePeriod,#scheduleInterval").keyup(function () {
                        if (this.value.length === 1) {
                            this.value = this.value.replace(/[^0-9]/g, '');
                        } else {
                            this.value = this.value.replace(/\D/g, '');
                        }
                        if (this.value > 90) {
                            this.value = 90;
                        }
                    }).blur(function () {
                        if (!this.value) {
                            this.value = 0;
                        }
                    });

                    var regex = /(^[1-8][0-9]$)|(^[1-9]$)$/;
                    $("#overduePeriod").keyup(function () {
                        if (this.value.length === 1) {
                            this.value = this.value.replace(/[^1-9]/g, '');
                        } else {
                            this.value = this.value.replace(/\D/g, '');
                        }
                        if (this.value > 90) {
                            this.value = 90;
                        }
                    }).blur(function () {
                        if (!this.value) {
                            this.value = 1;
                        }
                    });
                })
                //表单验证及相关逻辑联动
                .then(function () {
                    var regex = /^(\d{1,2}(\.\d{1})?|100)$/; //只能输入大于0小于100的数字
                    $(".jScheduleWeightMap input").each(function () {
                        $(this).keyup(function () {
                            if (!$(this).val()) {
                                $(this).addClass("error").siblings("b").show().text("输入项不能为空");
                            } else if (!regex.test($(this).val())) {
                                $(this).addClass("error").siblings("b").show().text("输入项不符合规则");
                            } else {
                                $(this).removeClass("error").siblings("b").hide();
                            }
                        });
                    });
                });
            }
        },
        errorFn: function errorFn() {
            $scope.info.fail("请求规则失败，请检查服务器");
            $scope.ruleList = [];
        }
    });

    //判断需要发送的数据要保存的属性
    function getFromValue(postData, searchObj) {
        for (var name in postData) {
            //如果这个属性是对象的话
            if (_typeof(postData[name]) === "object") {
                getFromValue(postData[name], searchObj);
            } else {
                //如果序列化结果没有这个属性的话，例如userId,ruleId
                if (searchObj[name] === undefined) {} else {
                    //boolean属性判断,on或者ng-checked表示选中
                    if (searchObj[name] === "on" || searchObj[name] === "ng-checked") {
                        postData[name] = true;
                    }
                    //为false，表示表单未选中
                    else if (!searchObj[name]) {
                            postData[name] = false;
                        } else {
                            postData[name] = searchObj[name];
                        }
                }
            }
        }
        return postData;
    }

    //表单序列化
    $.fn.serializeObject = function () {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function () {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });

        var $radio = $('input[type=radio],input[type=checkbox]', this);
        $.each($radio, function () {
            if (!o.hasOwnProperty(this.name)) {
                o[this.name] = false;
            }
        });
        return o;
    };

    //排程规则栏为点击的规则添加选中的active
    $scope.isRuleActive = function (val) {
        return $scope.ruleNav.active === val;
    };

    /**点击保存排程规则**/
    $scope.saveCheckConfig = function () {
        //排程规则名字不可为空
        var ruleName = $(".rule-name input").val();
        if (!ruleName) {
            layer.alert("排程规则名不可为空");
            return;
        }
        //=========判断表单是否为空
        var validata = true;
        //执行判断
        (function () {
            var regex = /^(\d{1,2}(\.\d{1})?|100)$/; //只能输入大于0小于100的数字
            //foreach无法跳出循环,每项都显示
            Array.prototype.forEach.call(document.getElementsByClassName("jScheduleWeightMap")[0].getElementsByClassName("require"), function (item, index) {
                //如果没填写
                if (!item.value) {
                    $(item).addClass("error").siblings("b").show().text("输入项不能为空");
                    //获取提示文字，去除文字和冒号
                    // let tipWord = item.parentNode.previousElementSibling.innerText.slice(1,-2);
                    validata = false;
                } else {
                    //如果输入项不符合规则的话
                    if (regex.test(item.value)) {
                        $(item).removeClass("error").siblings("b").hide();
                    } else {
                        //如果填写不正确
                        validata = false;
                        $(item).addClass("error").siblings("b").show().text("输入项不符合规则");
                    }
                }
            });
        })();
        //如果有错直接返回
        if (!validata) {
            return false;
        }
        //表单序列化获得需要发送的数据
        var post = getFromValue($scope.scheduleCheckData, $("form").serializeObject());
        //表单序列化获取不到日历插件的值，手工获取
        post.minScheduleDay = $("#minScheduleDay").val();
        //获取规则名字
        post.ruleName = ruleName;
        //发送数据
        http.put({
            url: $rootScope.restful_api.single_schedule_rule + $scope.ruleId,
            data: post,
            successFn: function successFn(res) {
                if (res.data.error_response) {
                    $scope.info.fail("数据保存失败");
                } else {
                    $scope.info.success("数据保存成功");
                }
            },
            errorFn: function errorFn() {
                $scope.info.fail("数据保存失败,请检查服务器");
            }
        });
    };

    //弹出新建排程规则窗口
    $scope.openRuleWindow = function () {
        var index = layer.open({
            type: 1,
            title: false,
            closeBtn: 0,
            shadeClose: true,
            skin: 'yourclass',
            content: $(".addNewRule"),
            success: function success() {
                $(".addNewRule").on("click", ".close,.cancal", function () {
                    layer.close(index);
                });
            }
        });
    };

    //发送新建规则请求
    $scope.postNewRule = function () {
        //检测是否重名
        if (!$scope.newRuleName) {
            layer.msg('请输入正确的排程规则名');
            return false;
        }
        if (!tool.checkRepeatName($scope.newRuleName, $scope.ruleList, "rule")) {
            layer.msg('排程规则名重复，请重新输入');
            return;
        }
        //判断用户是否选了规则,没选设置为默认规则
        $scope.ruleId = $("#ruleSelect").val() === "0" ? "default" : $("#ruleSelect").val();
        http.get({
            url: $rootScope.restful_api.single_schedule_rule + $scope.ruleId,
            successFn: function successFn(res) {
                $scope.scheduleCheckData = res.data;
                $scope.info.success("创建排程规则成功");
            },
            errorFn: function errorFn() {
                $scope.info.fail("创建排程规则失败，请检查网络");
            }
        })
        //再获得对应的数据,then create Rule
        .then(function () {
            //删除获取到的Id,post创建规则
            delete $scope.scheduleCheckData.ruleId;
            $scope.scheduleCheckData.ruleName = $scope.newRuleName;
            http.post({
                url: $rootScope.restful_api.single_schedule_rule,
                data: $scope.scheduleCheckData,
                successFn: function successFn(res) {
                    res = res.data;
                    $scope.ruleId = res;
                    $scope.ruleList.push({
                        "ruleId": res,
                        "ruleName": $scope.scheduleCheckData.ruleName
                    });
                    $scope.renderRulePage($scope.scheduleCheckData);
                    $scope.newRuleName = "";
                    layer.closeAll();
                    //最后一个li获得actice的状态
                    $timeout(function () {
                        $scope.lookRule($scope.ruleList[$scope.ruleList.length - 1]);
                        $(".check-rule-nav .rule-li").last().addClass("active").siblings().removeClass("active");
                    }, 0);
                },
                errorFn: function errorFn() {
                    $scope.info.fail("创建规则失败-post");
                }
            });
        });
    };

    //查看规则
    $scope.lookRule = function (rule) {
        $scope.rule = rule;
        http.get({
            url: $rootScope.restful_api.single_schedule_rule + rule.ruleId,
            successFn: function successFn(res) {
                $scope.ruleId = rule.ruleId;
                //渲染规则页面数据
                $scope.renderRulePage(res.data);
            }
        });
    };

    //删除排程规则
    $scope.deleteRule = function (event) {
        event.stopPropagation();
        var deleteRule = layer.confirm('确定删除此排程规则？', {
            btn: ['确定', '取消'] //按钮
        }, function () {
            var target = event.target || event.srcElement;
            var parentElement = target.parentNode;
            var ruleId = parentElement.getAttribute("data-rule-id");
            layer.close(deleteRule);
            http.delete({
                url: $rootScope.restful_api.single_schedule_rule + ruleId,
                successFn: function successFn(res) {
                    //成功返回
                    if (res.data == "1") {
                        $scope.ruleList.forEach(function (item, index) {
                            if (item.ruleId == ruleId) {
                                $scope.ruleList.splice(index, 1);
                            }
                        });
                        $scope.info.success("删除排程规则成功");
                        //删除成功，查看第一个排程规则，没有规则时，不需要执行
                        if ($scope.ruleList.length != 0) {
                            $timeout(function () {
                                $(".check-rule-nav .rule-li").first().addClass("active").siblings().removeClass("active");
                            }, 0);
                            $scope.lookRule($scope.ruleList[0]);
                        }
                    }
                },
                errorFn: function errorFn(res) {
                    if (res.data.error_response.code === 102) {
                        $scope.info.fail("你没有权限删除此规则");
                        // return
                    } else if (res.data.error_response.code === 103) {
                        $scope.info.fail("此规则正在使用，无法删除");
                        // return
                    } else {
                        $scope.info.fail("删除规则失败，请检查服务器");
                    }
                }
            });
        }, function () {
            layer.close(deleteRule);
        });
    };

    //显示规则时，js设置目录栏高度,使左边目录栏的高度可以撑满整个div
    //展开规则时，实时获取规则高度设置，收起时，保证不小于规则最小区域
    $scope.setCheckRuleHeight = function () {
        $timeout(function () {
            var checkContentHeight = $(".checkContent").height();
            var configFormHeight = $(".config-form").height();
            $(".check-rule-nav").height(configFormHeight <= checkContentHeight ? checkContentHeight - $(".config-content-title").height() : configFormHeight);
        });
    };

    //显示隐藏高级规则---start
    $rootScope.jExpertConfiguration = false;
    $scope.toggleAdvancedShow = function () {
        $scope.jAdvancedConfiguration = !$scope.jAdvancedConfiguration;
        return $scope.setCheckRuleHeight();
    };

    $scope.toggleExpertShow = function () {
        $scope.jExpertConfiguration = !$scope.jExpertConfiguration;
        return $scope.setCheckRuleHeight();
    };
    $scope.hideAdvancedConfig = function () {
        $scope.jExpertConfiguration = $scope.jAdvancedConfiguration = false;
        return $scope.setCheckRuleHeight();
    };
    //显示隐藏高级规则---end

    // //取消绑定，执行unbindWatchPap()
    // let unbindWatchPap = $scope.$watch("scheduleFrontData[5].select",function (newValue,oldValue) {
    //     //设置为true，启用默认规则
    //     if(newValue === true){
    //         $scope.disable.schedulePointSelected = false;
    //         $scope.notEdit.schedulePointSelected = true;
    //         $(".pap-type .scheduleDrag li").eq(2).trigger("click");
    //     }else {
    //         //设置为false，下拉选项设置为不启用
    //         $scope.disable.schedulePointSelected = true;
    //         $scope.notEdit.schedulePointSelected = true;
    //         $(".pap-type .scheduleDrag li").eq(0).trigger("click");
    //     }
    // });
    // $("body")
    // //点击pap类型决定起排工序,和影响排程前校验中的pap检验项
    //     .on("click",".pap-type li",function(){
    //         if($(this).attr("data-value")=="PAP_DISABLE"){
    //             //不启用
    //             $timeout(function(){
    //                 $scope.disable.schedulePointSelected = true;
    //                 $scope.notEdit.schedulePointSelected = true;
    //                 $scope.scheduleFrontData[5].select = false;//联动排程前校验的pap
    //                 $(".schedule-point li").eq(0).trigger("click");
    //             })
    //         }else if($(this).attr("data-value")=="PAP_SCHEDULE_RULE"){
    //             $timeout(function(){
    //                 $scope.disable.schedulePointSelected = false;
    //                 $scope.notEdit.schedulePointSelected = true;
    //                 $scope.scheduleFrontData[5].select = true;//联动排程前校验的pap
    //                 $(".schedule-point li").eq(2).trigger("click");
    //             })
    //         }else{
    //             $timeout(function(){
    //                 $scope.disable.schedulePointSelected = false;
    //                 $scope.notEdit.schedulePointSelected = false;
    //                 $scope.scheduleFrontData[5].select = true;//联动排程前校验的pap
    //             })
    //         }
    //     })
    //     //排程周期决定排程间隔
    //     .on("click",".schedulePeriod li",function(){
    //         if($(this).attr("data-value")=="BY_DAY"){
    //             $timeout(function(){
    //                 $scope.disable.scheduleInterval = false;
    //                 $scope.notEdit.scheduleInterval = false;
    //             })
    //         }else{
    //             $timeout(function(){
    //                 $scope.disable.scheduleInterval = true;
    //                 $scope.notEdit.scheduleInterval = true;
    //             })
    //         }
    //     })
}]);

/**
 * Created by yiend on 2017/1/14.
 */
'use strict';
app.controller("secondPageController", ["$rootScope", "$scope", "$state", function ($rootScope, $scope, $state) {
    //显示正确的目录class-active
    $scope.configNav.activeNav = ".workUnit";

    $state.go('config.workUnit.column'); //默认显示第一个tab

    $scope.secondPage = {
        title: "" };
}]).controller("columnController", ["$rootScope", "$scope", "$http", "http", function ($rootScope, $scope, $http, http) {
    //设置面包屑导航
    $scope.secondPage.showPageConfig = "显示项";

    /**
     *根据点击的车间树获得相应的车间ID,显示对应排序表的数据
     */
    var getColumnData = function getColumnData() {
        http.get({
            url: $rootScope.restful_api.column_content_config + $scope.locationId,
            successFn: function successFn(res) {
                //获得get到的数据，渲染页面
                $scope.setDisplayGetData(res);
                $scope.displayData = { leftDisplay: "未显示项", rightDisplay: "已显示项" };
            },
            errorFn: function errorFn() {
                $scope.info.fail("获取数据失败，请检查是否连上服务器");
            }
        });
    };
    getColumnData();

    // //获取数据，创造车间树
    // $scope.createWorkshop(true,getColumnData);

    //初始化拖拽
    $scope.clickLiGetItem();

    /**列信息配置点击保存进行发送数据**/
    $scope.saveColumnContent = function () {
        var postData = $scope.getDisplayPostData("请至少选择一项显示");
        //检测数据是否正确
        if (!postData) {
            return;
        }
        http.put({
            url: $rootScope.restful_api.column_content_config + $scope.locationId,
            data: postData,
            successFn: function successFn(response) {
                if (response.data === true) {
                    $scope.info.success("数据保存成功");
                }
            },
            errorFn: function errorFn() {
                $scope.info.fail("数据保存失败");
            }
        });
    };

    /**列信息还原数据**/
    $scope.resetColumnConfig = function () {
        http.delete({
            url: $rootScope.restful_api.column_content_config + $scope.locationId,
            successFn: function successFn(res) {
                $("#all-item").find(".js-move").remove();
                //获得get到的数据，渲染页面
                $scope.setDisplayGetData(res);
                $scope.info.success("还原配置成功");
            },
            errorFn: function errorFn() {
                $scope.info.fail("还原配置失败");
            }
        });
    };
}]).controller("sortController", ["$rootScope", "$scope", "$http", "$window", "$location", "$timeout", "$q", "$templateCache", "scheduleTableViewModelService", "http", function ($rootScope, $scope, $http, $window, $location, $timeout, $q, $templateCache, scheduleTableViewModelService, http) {
    //设置面包屑导航
    $scope.secondPage.showPageConfig = "多列排序项";
    $scope.displayData = { leftDisplay: "可用配置项", rightDisplay: "已排序配置项" };

    function getSortConfig() {
        http.get({
            url: $rootScope.restful_api.sort_content_config + $scope.locationId,
            successFn: function successFn(res) {
                //获得get到的数据，渲染页面
                $scope.setDisplayGetData(res);
            },
            errorFn: function errorFn() {
                $scope.info.fail("获取数据失败，请检查是否连上服务器");
            }
        });
        //合并项
        http.get({
            url: $rootScope.restful_api.sort_combine_config + $scope.locationId,
            successFn: function successFn(res) {
                $scope.combineItem = $.extend({}, res.data);
                $scope.combineObj = {
                    combine: scheduleTableViewModelService.combinecountItem($scope.combineItem),
                    combineDrag: true,
                    combineActive: false
                };
            }
        });
        //汇总项
        http.get({
            url: $rootScope.restful_api.sort_summary_config + $scope.locationId,
            successFn: function successFn(res) {
                $scope.summaryItem = $.extend({}, res.data);
                $scope.summaryObj = {
                    summary: scheduleTableViewModelService.combinecountItem($scope.summaryItem),
                    summaryDrag: true,
                    summaryActive: true
                };
            }
        });
    }
    // //创建车间树
    // $scope.createWorkshop(true,getSortConfig);

    //渲染数据
    getSortConfig();

    //初始化拖拽
    $scope.clickLiGetItem();

    /**多列排序信息配置点击保存进行发送数据**/
    $scope.saveSortContent = function () {
        var postData = $scope.getDisplayPostData("请至少选择一项进行排序");
        //检测数据是否正确
        if (!postData) {
            return;
        }
        http.put({
            url: $rootScope.restful_api.sort_content_config + $scope.locationId,
            data: postData,
            successFn: function successFn(response) {
                if (response.data === true) {
                    $scope.info.success("数据保存成功");
                }
            },
            errorFn: function errorFn() {
                $scope.info.fail("数据保存失败");
            }
        });
        //合并项
        var combineP = document.getElementsByClassName("combine-item")[0].getElementsByTagName("span");
        $scope.combineItem.selectList = [];

        var _loop = function _loop(i) {
            var value = combineP[i].getAttribute("data-value");
            $scope.combineItem.optionList.forEach(function (item) {
                if (item.valueContent == value) {
                    $scope.combineItem.selectList.push(item);
                }
            });
        };

        for (var i = 0; i < combineP.length; i++) {
            _loop(i);
        }
        //空的情况下暂时使用还原功能
        if ($scope.combineItem.selectList.length === 0) {
            $scope.combineItem.selectList = null;
            http.delete({
                url: $rootScope.restful_api.sort_combine_config + $scope.locationId,
                successFn: function successFn(response) {
                    //$scope.info.success("数据保存成功");
                },
                errorFn: function errorFn(res) {
                    $scope.info.fail("合并项保存失败");
                }
            });
        } else {
            http.put({
                url: $rootScope.restful_api.sort_combine_config + $scope.locationId,
                data: $scope.combineItem,
                successFn: function successFn(response) {
                    //$scope.info.success("数据保存成功");
                },
                errorFn: function errorFn() {
                    $scope.info.fail("合并项保存失败");
                }
            });
        }
        //汇总项
        var summaryP = document.getElementsByClassName("Summary-item")[0].getElementsByTagName("span");
        $scope.summaryItem.selectList = [];

        var _loop2 = function _loop2(i) {
            var value = summaryP[i].getAttribute("data-value");
            $scope.summaryItem.optionList.forEach(function (item) {
                if (item.valueContent == value) {
                    $scope.summaryItem.selectList.push(item);
                }
            });
        };

        for (var i = 0; i < summaryP.length; i++) {
            _loop2(i);
        }
        //空的情况下暂时使用还原功能
        if ($scope.summaryItem.selectList.length === 0) {
            $scope.summaryItem.selectList = null;
            http.delete({
                url: $rootScope.restful_api.sort_summary_config + $scope.locationId,
                successFn: function successFn(response) {
                    //$scope.info.success("数据保存成功");
                },
                errorFn: function errorFn(res) {
                    $scope.info.fail("汇总项保存失败");
                }
            });
        } else {
            http.put({
                url: $rootScope.restful_api.sort_summary_config + $scope.locationId,
                data: $scope.summaryItem,
                successFn: function successFn(response) {
                    //$scope.info.success("数据保存成功");
                },
                errorFn: function errorFn(res) {
                    $scope.info.fail("汇总项保存失败");
                }
            });
        }
    };

    /**多列排序信息还原数据**/
    $scope.resetSortConfig = function () {
        http.delete({
            url: $rootScope.restful_api.sort_content_config + $scope.locationId,
            successFn: function successFn(res) {
                $("#all-item").find(".js-move").remove();
                //获得get到的数据，渲染页面
                $scope.setDisplayGetData(res);
                $scope.info.success("还原配置成功");
            },
            errorFn: function errorFn() {
                $scope.info.fail("还原配置失败");
            }
        });
        //还原合并项
        http.delete({
            url: $rootScope.restful_api.sort_combine_config + $scope.locationId,
            successFn: function successFn(response) {
                $scope.combineItem = $.extend({}, response.data);
                $scope.combineObj = {
                    combine: scheduleTableViewModelService.combinecountItem($scope.combineItem),
                    combineDrag: true,
                    combineActive: false
                };
            },
            errorFn: function errorFn(res) {
                $scope.info.fail("合并项保存失败");
            }
        });
        //还原汇总项
        http.delete({
            url: $rootScope.restful_api.sort_summary_config + $scope.locationId,
            successFn: function successFn(response) {
                $scope.summaryItem = $.extend({}, response.data);
                $scope.summaryObj = {
                    summary: scheduleTableViewModelService.combinecountItem($scope.summaryItem),
                    summaryDrag: true,
                    summaryActive: true
                };
            },
            errorFn: function errorFn(res) {
                $scope.info.fail("汇总项保存失败");
            }
        });
    };

    //删除||选中-合并和汇总项
    $scope.addItem = function (data, $event) {
        data.show = true;
        $event.stopPropagation();
    };
    $scope.deleteDragItem = function (data, $event) {
        data.show = false;
        //$event.target.parentNode.parentNode;
        //console.log($event.target.parentNode.parentNode.nextElementSibling);
    };
}]);
/**
 * Created by yiend on 2017/2/6.
 */
app.controller("versionController", ["$rootScope", "$scope", "$http", "$state", "tool", "http", function ($rootScope, $scope, $http, $state, tool, http) {
    //显示正确的目录class-active
    $scope.configNav.activeNav = ".version";

    http.get({
        url: $rootScope.restful_api.public_version_number,
        successFn: function successFn(res) {
            $scope.versionNumer = res.data.version;
            // 版本页面
            $scope.browser = tool.getBrowser().browser;
            $scope.version = tool.getBrowser().version;
        },
        errorFn: function errorFn() {
            layer.alert("获取系统版本失败，请检查服务器");
        }
    });

    //清楚后端缓存
    $scope.clearCache = function () {
        http.post({
            url: $rootScope.restful_api.clearCatch,
            successFn: function successFn(res) {
                layer.msg('已清除后端缓存');
            },
            errorFn: function errorFn(res) {
                layer.msg('清除后端缓存失败，请检查服务器');
            }
        });
    };
}]);