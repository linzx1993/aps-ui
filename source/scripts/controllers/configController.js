"use strict";

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
        layer.msg('获取数据失败，请检查是否连上服务器', { time: 3000, icon: 2 });
      }
    });
  };
  getColumnData();

  //根据点击不同的车间选择不同的显示项
  $("#columnWorkshop").on("click", ".select-status", function (e) {
    //根据点击的车间ID
    $scope.locationId = e.target.getAttribute("data-location-id");
    $(".select-status").removeClass("active");
    $(e.target).addClass("active");
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
          layer.msg('默认显示项保存成功', { time: 3000, icon: 1 });
        }
      },
      errorFn: function errorFn() {
        layer.msg('默认显示项保存失败', { time: 3000, icon: 2 });
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
          layer.msg('读取车间失败，请检查服务器', { time: 3000, icon: 2 });
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
  //如果某些树没有权限则隐藏需要该权限的目录
  http.get({
    url: $rootScope.restful_api.get_new_location,
    successFn: function successFn(res) {
      //如果用户没有可写树权限，则隐藏管理员目录目录
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
    children: [{ text: "默认显示项", url: "view/adminDisplay.html", "sref": ".defaultDisplay", class: "adminNav" }, { text: "onlineConfig", url: "view/onlineConfig.html", "sref": ".onlineConfig" }]
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

  //实时监测
  $scope.$on("transferChecked", function (e, val) {
    $scope.selectItem = val;
  });
  /**
   * 保存显示项发送数据
   * @param str: 错误时提示
   * @return 发送的数据
   */
  $scope.getDisplayPostData = function (str) {
    //必须选择一项配置项
    if ($scope.selectItem.length <= 0) {
      layer.msg(str, { time: 3000, icon: 2 });
      return false;
    }
    var postData = { optionList: $scope.optionList, selectList: [] };
    //根据选中的数组值，从所有的optionList中筛选出选中的对象
    $scope.selectItem.forEach(function (selectItem) {
      var option = Object.assign({}, $scope.optionList.filter(function (item) {
        return selectItem.replace(":desc", "") === item.valueContent.replace(":desc", "");
      })[0]);
      option.valueContent = selectItem;
      postData.selectList.push(option);
    });
    return postData;
  };

  /**
   * 获得get到的数据，渲染页面
   * @param res: get到的数据
   * @return 页面渲染时的格式
   */
  $scope.setDisplayGetData = function (res) {
    //需要区分有没有配置项
    if (res.data.optionList === null) {
      $scope.allItemList = [];
      $scope.selectItem = [];
    } else {
      //获得所有的展示项
      $scope.optionList = res.data.optionList;
      $scope.allItemList = $scope.optionList.map(function (item) {
        return {
          id: item.valueContent,
          label: item.valueAlias,
          isSelected: false
        };
      });
      //获得选中的展示项
      $scope.selectItem = res.data.selectList.map(function (item) {
        return item.valueContent;
      });
    }
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
   * @param resData: 获得到的排程规则数据
   * @return 页面渲染所需数据
   */
  $scope.renderRulePage = function (resData) {
    $scope.scheduleCheckDataItemMap = resData.itemMap;

    //如果一个属性都没有，则直接消失
    if (!$scope.scheduleCheckDataItemMap) {
      return;
    }
    for (var name in $scope.scheduleCheckDataItemMap) {
      delete $scope.scheduleCheckDataItemMap[name].itemName;
      //转化成布尔值，以便angular状态的选中
      if ($scope.scheduleCheckDataItemMap[name].itemValue === "true") {
        $scope.scheduleCheckDataItemMap[name].itemValue = true;
      } else if ($scope.scheduleCheckDataItemMap[name].itemValue === "false") {
        $scope.scheduleCheckDataItemMap[name].itemValue = false;
      }
    }

    //排程前校验，排程后校验项，排程因子消失：底下所有校验项和规则全部没有
    //排程前
    $scope.preScheduleCheck = !!($scope.scheduleCheckDataItemMap['preScheduleCheck.PAP_INFO_CHECKING'] || $scope.scheduleCheckDataItemMap['preScheduleCheck.SUITABLE_PRODUCT_INFO_CHECKING'] || $scope.scheduleCheckDataItemMap['preScheduleCheck.CT_INFO_CHECKING'] || $scope.scheduleCheckDataItemMap['preScheduleCheck.CAPABILITY_INFO_CHECKING'] || $scope.scheduleCheckDataItemMap['preScheduleCheck.SYSTEM_CONFIG_CHECKING'] || $scope.scheduleCheckDataItemMap['preScheduleCheck.COLOR_INFO_CHECKING'] || $scope.scheduleCheckDataItemMap['preScheduleCheck.FIXTURE_INFO_CHECKING'] || $scope.scheduleCheckDataItemMap['preScheduleCheck.ROUTING_INFO_CHECKING'] || $scope.scheduleCheckDataItemMap['preScheduleCheck.MATERIAL_INFO_CHECKING']);

    //排程后
    $scope.postScheduleCheck = !!($scope.scheduleCheckDataItemMap['postScheduleCheck.PROCESS_SEQ_CHECKING'] || $scope.scheduleCheckDataItemMap['postScheduleCheck.POMO_SUIT_CHECKING'] || $scope.scheduleCheckDataItemMap['postScheduleCheck.ASSEMBLING_UNIT'] || $scope.scheduleCheckDataItemMap['postScheduleCheck.PRODUCTION_TIME_CHECKING'] || $scope.scheduleCheckDataItemMap['postScheduleCheck.CAPABILITY_OVER_CHECKING']);
    // // 高级设置
    // $scope.jAdvancedShowByAlgorithm = !!($scope.scheduleCheckDataItemMap.papType || $scope.scheduleCheckDataItemMap.isFrequencyOn || $scope.scheduleCheckDataItemMap.isEconomicOn ||$scope.scheduleCheckDataItemMap.isCombinationOn ||
    // $scope.scheduleCheckDataItemMap.isAheadOn ||$scope.scheduleCheckDataItemMap.isUseNotMassEqu ||$scope.scheduleCheckDataItemMap.scheduleInterval);
    //排程因子
    $scope.scheduleWeight = $scope.scheduleCheckDataItemMap['scheduleWeight.SAME_COLOR'] || $scope.scheduleCheckDataItemMap['scheduleWeight.SAME_CT'] || $scope.scheduleCheckDataItemMap['scheduleWeight.SAME_FIXTURE'] || $scope.scheduleCheckDataItemMap['scheduleWeight.SAME_MATERIAL'] || $scope.scheduleCheckDataItemMap['scheduleWeight.KEY_EQUIPMENT'] || $scope.scheduleCheckDataItemMap['scheduleWeight.MOST_USED_EQUIPMENT'] || $scope.scheduleCheckDataItemMap['scheduleWeight.SIMILAR_MATERIAL'];
    //专家配置
    // $scope.jExpertConfiguration = $scope.scheduleWeight;


    $scope.algorithmName = resData.algorithmName;
    //设置所有下拉框的选中值
    setTimeout(function () {
      //控制下拉列表
      $("dd.relative span").each(function () {
        // if($(this).hasClass("algorithm-name"))return;
        var ul = $(this).siblings("ul");
        ul.find("li[data-value=" + $(this).attr("data-value") + "]").trigger("click");
        var text = $(this).siblings("select").find("option:selected").text();
        $(this).text(text);
      });
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
  $scope.createWorkshop = function (singleSelect, getConfigData) {
    //存储树形数据,如果有，则不发送请求
    if (!$scope.folder) {
      http.get({
        url: $rootScope.restful_api.get_new_location,
        successFn: function successFn() {
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
    //本身及所有后代的改变
    if (thisSelect.hasClass("select-some") || thisSelect.hasClass("unselect")) {
      thisSelect.attr("class", "select-status active");
      thisSelect.parent("li").find("ul i").attr("class", "select-status active");
    } else {
      thisSelect.attr("class", "select-status");
      thisSelect.parent("li").find("ul i").attr("class", "select-status");
    }
  }
}]);

/**
 * Created by linzx on 2017/4/17.
 */
'use strict';
app.controller("displayController", ["$rootScope", "$scope", "$timeout", "tool", "http", "$state", function ($rootScope, $scope, $timeout, tool, http, $state) {
  //点击显示项配置时，路由默认默认跳转显示第一个tab---工作区域（原一级页面）
  $state.go('config.workArea');
}]);
/**
 * Created by yiend on 2017/1/23.
 * desc : 工作区域
 */
'use strict';
/*
 * desc :　firstPageController　： 工作区域（俗称一级页面）
 * desc :　displayCombineController　： 显示合并项
 * desc :　displayFlipController　： 显示翻转
 */
app.controller("firstPageController", ["$rootScope", "$scope", "$http", "$state", function ($rootScope, $scope, $http, $state) {
  //点击工作区域时，路由默认跳转显示第一个tab---显示合并项
  $state.go('config.workArea.displayCombine');
  //显示正确的目录class-active
  $scope.configNav.activeNav = ".workArea";
  //默认显示第一个tab---end
  $scope.firstPage = {
    title: "", //面包屑导航三级目录文字
    combineItemList: [], //显示合并项数组
    flipList: [] //显示翻转项数组
  };
}]).controller("displayCombineController", ["$rootScope", "$scope", "$http", "http", function ($rootScope, $scope, $http, http) {
  //设置面包屑导航
  $scope.firstPage.title = "显示合并项";

  /**
   *desc : 根据配置页面获取的车间地点，获取对应显示合并项的数据
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
        layer.alert("获取翻转显示项失败，请检查服务器");
      }
    });
  };
  getDisplayCombineData();

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
          layer.msg('保存成功', { time: 3000, icon: 1 });
        } else {
          layer.msg('保存失败', { time: 3000, icon: 2 });
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
   *根据配置页面获取的车间地点,显示对应一级页面是否翻转
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
          layer.msg('保存成功', { time: 3000, icon: 1 });
        } else {
          layer.msg('保存失败', { time: 3000, icon: 2 });
        }
      },
      errorFn: function errorFn() {
        $scope.info.fail("数据保存失败，请检查服务器");
      }
    });
  };
}]);

/**
 * Created by linzx on 2017/2/15.
 * desc : 工作菜单
 */
"use strict";
/*
 * desc :　functionModuleController　： 工作菜单（右侧菜单栏模块）
 * desc :　taskColumnController　： 任务池显示项
 * desc :　cacheRoomController　： 暂存间显示项
 */
app.controller("functionModuleController", ["$rootScope", "$scope", "$http", "$state", "http", function ($rootScope, $scope, $http, $state, http) {
  //默认显示第一个tab---start
  $state.go('config.workMenu.task');
  //显示正确的目录class-active
  $scope.configNav.activeNav = ".workMenu";
  //默认显示第一个tab---end
  $scope.functionPage = {
    title: "", //面包屑导航三级目录文字
    showItemLists: [], //显示天数
    combineItemList: [] //显示合并项数组
  };
}]).controller("taskColumnController", ["$rootScope", "$scope", "http", function ($rootScope, $scope, http) {
  //设置面包屑导航
  $scope.functionPage.showPageConfig = "任务池显示项";
  $scope.taskRoomDimension = "planDimension"; //进入页面默认显示计划维度
  var taskRoomUrl = $rootScope.restful_api.task_column_plan_config;

  $scope.$watch("taskRoomDimension", function (n, o) {
    if (n === "planDimension") {
      taskRoomUrl = $rootScope.restful_api.task_column_plan_config;
      $scope.getColumnData();
    } else if (n === 'orderDimension') {
      taskRoomUrl = $rootScope.restful_api.task_column_order_config;
      $scope.getColumnData();
    }
  });
  /**
   *根据点击的车间树获得相应的车间ID,显示对应排序表的数据
   */
  $scope.getColumnData = function () {
    http.get({
      url: taskRoomUrl + $scope.locationId,
      successFn: function successFn(res) {
        //如果请求到的数据有列信息，没有则给出提醒信息
        if (res.data.optionList && res.data.optionList.length) {
          //获得get到的数据，渲染页面
          $scope.setDisplayGetData(res);
        } else {
          $scope.setDisplayGetData(res);
          layer.msg('没有显示项需要配置', { time: 3000, icon: 2 });
        }
      },
      errorFn: function errorFn() {
        layer.msg('获取数据失败，请检查是否连上服务器', { time: 3000, icon: 2 });
      }
    });
  };

  /**列信息配置点击保存进行发送数据**/
  $scope.saveTaskColumn = function () {
    var postData = $scope.getDisplayPostData("请至少选择一项显示");
    //检测数据是否正确
    if (!postData) {
      return;
    }
    http.put({
      url: taskRoomUrl + $scope.locationId,
      data: postData,
      successFn: function successFn(response) {
        if (response.data === true) {
          layer.msg('保存成功', { time: 3000, icon: 1 });
        }
      },
      errorFn: function errorFn() {
        layer.msg('保存失败', { time: 3000, icon: 2 });
      }
    });
  };

  /**列信息还原数据**/
  $scope.resetTaskColumn = function () {
    http.delete({
      url: taskRoomUrl + $scope.locationId,
      successFn: function successFn(res) {
        //获得get到的数据，渲染页面
        $scope.setDisplayGetData(res);
        layer.msg('还原成功', { time: 3000, icon: 1 });
      },
      errorFn: function errorFn() {
        layer.msg('还原失败', { time: 3000, icon: 2 });
      }
    });
  };
}]).controller("cacheRoomController", ["$rootScope", "$scope", "http", function ($rootScope, $scope, http) {
  //设置面包屑导航
  $scope.functionPage.showPageConfig = "暂存间显示项";
  $scope.cacheRoomDimension = "planDimension"; //进入页面默认显示计划维度
  var cacheRoomUrl = $rootScope.restful_api.cache_room_plan_config;

  $scope.$watch("cacheRoomDimension", function (n, o) {
    if (n === "planDimension") {
      cacheRoomUrl = $rootScope.restful_api.cache_room_plan_config;
      $scope.getColumnData();
    } else if (n === 'orderDimension') {
      cacheRoomUrl = $rootScope.restful_api.cache_room_order_config;
      $scope.getColumnData();
    }
  });
  /**
   *根据点击的车间树获得相应的车间ID,显示对应排序表的数据
   */
  $scope.getColumnData = function () {
    http.get({
      url: cacheRoomUrl + $scope.locationId,
      successFn: function successFn(res) {
        //如果请求到的数据有列信息，没有则给出提醒信息
        if (!res.data.optionList || res.data.optionList.length === 0) {
          layer.msg('没有显示项需要配置', { time: 3000, icon: 2 });
        }
        //渲染数据
        $scope.setDisplayGetData(res);
      },
      errorFn: function errorFn() {
        layer.msg('获取数据失败，请检查是否连上服务器', { time: 3000, icon: 2 });
      }
    });
  };
  // getColumnData();

  /**列信息配置点击保存进行发送数据**/
  $scope.saveCacheRoom = function () {
    var postData = $scope.getDisplayPostData("请至少选择一项显示");
    //检测数据是否正确
    if (!postData) {
      return;
    }
    http.put({
      url: cacheRoomUrl + $scope.locationId,
      data: postData,
      successFn: function successFn(response) {
        if (response.data === true) {
          layer.msg('保存成功', { time: 3000, icon: 1 });
        }
      },
      errorFn: function errorFn() {
        layer.msg('还原失败', { time: 3000, icon: 2 });
      }
    });
  };

  /**列信息还原数据**/
  $scope.resetCacheRoom = function () {
    http.delete({
      url: cacheRoomUrl + $scope.locationId,
      successFn: function successFn(res) {
        //获得get到的数据，渲染页面
        $scope.setDisplayGetData(res);
        layer.msg('还原成功', { time: 3000, icon: 1 });
      },
      errorFn: function errorFn() {
        layer.msg('还原失败', { time: 3000, icon: 2 });
      }
    });
  };
}]);
/**
 * Created by linzx on 2017/8/17.
 * desc : 上线配置页面
 */
app.controller("onlineConfigController", ["$rootScope", "$scope", "$state", "tool", "$http", "http", "$timeout", "$q", function ($rootScope, $scope, $state, tool, $http, http, $timeout, $q) {
  //显示正确的目录class-active
  $scope.configNav.activeNav = ".onlineConfig";

  //获取所有的地点
  http.get({
    url: $rootScope.restful_api.aps_location_readable,
    successFn: function successFn(res) {
      $scope.location_data = {
        repeatData: res.data,
        showText: '地点',
        className: "location"
      };
    }
  });

  //获取所有设备类型
  $scope.equipmentSelectTypeZeroList = []; //离散设备的下拉列表
  $scope.selectEquipmentTypeZero = []; //选中的离散设备
  $scope.equipmentSelectTypeOneList = []; //生产单元的下拉列表
  $scope.selectEquipmentTypeOne = []; //选中的生产单元
  http.get({
    url: $rootScope.restful_api.get_equipment_type + "?startTime=" + tool.getCorrectDate(new Date()) + "&endTime=" + tool.getCorrectDate(new Date()),
    successFn: function successFn(res) {
      res.data.forEach(function (item) {
        item.id = item.modelId + "_" + item.modelType;
        if (item.modelType === 0) {
          $scope.equipmentSelectTypeZeroList.push(item);
        } else if (item.modelType === 1) {
          $scope.equipmentSelectTypeOneList.push(item);
        }
      });
    }
  });

  //获取所有设备
  $scope.equipmentList = [];
  //设备下拉列表选中设备的数据
  $scope.equipmentSelectList = [];

  http.post({
    url: $rootScope.restful_api.get_all_equipment,
    data: {
      startTime: tool.getCorrectDate(new Date()),
      endTime: tool.getCorrectDate(new Date()),
      searchType: 1,
      modelIdList: [],
      locationFilterList: []
    },
    successFn: function successFn(res) {
      $scope.equipmentList = getEquipmentList(res.data);
    }
  });

  /*
   * desc : 请求获取到的设备列表是个对象，然后将其转化成数组
   */
  function getEquipmentList(equipmentList) {
    var equipmentData = [];
    for (var i in equipmentList) {
      equipmentData.push({
        label: equipmentList[i].productUnitName,
        id: equipmentList[i].productUnitId + "_" + (equipmentList[i].type === "EQUIPMENT" ? 0 : 1),
        equipmentCode: equipmentList[i].productUnitCode
      });
    }
    return equipmentData;
  }

  /**
   * 根据输入的参数名和参数，对物料相关进行模糊查询
   * @param params : string 输入的参数名
   */
  $scope.getMaterialCodeBySearch = function () {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    return $http.get($rootScope.restful_api.search_material_code + params).then(function (res) {
      $scope.materialCodeList = res.data.slice(0, 100);
      $scope.materialCodeList.unshift({
        materialCode: "请选择",
        materialName: "请选择",
        materialId: ""
      });
      $scope.materialCodeList.forEach(function (item) {
        item.text = item.materialCode;
      });
    }, function () {
      layer.alert('获取物料编码数据失败,请联系技术人员');
    });
  };

  $scope.getMaterialNameBySearch = function () {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    $http.get($rootScope.restful_api.search_material_name + params).then(function (res) {
      $scope.materialNameList = res.data.slice(0, 100);
      $scope.materialNameList.unshift({
        materialCode: "请选择",
        materialName: "请选择",
        materialId: ""
      });
      $scope.materialNameList.forEach(function (item) {
        item.text = item.materialName;
      });
    }, function () {
      layer.alert('获取物料名称数据失败,请联系技术人员');
    });
  };
  $scope.getMaterialCodeBySearch();
  $scope.getMaterialNameBySearch();

  //==========================以上是初始进入页面所需执行代码----分割线================

  //根据改动条件，获得equipment设备列表
  $scope.getEquipment = function () {
    http.post({
      url: $rootScope.restful_api.get_all_equipment,
      data: {
        startTime: tool.getCorrectDate(new Date()),
        endTime: tool.getCorrectDate(new Date()),
        searchType: 1,
        modelIdList: $scope.selectEquipmentTypeZero.concat($scope.selectEquipmentTypeOne),
        locationFilterList: $scope.get_selected_location()
      },
      successFn: function successFn(res) {
        $scope.equipmentList = getEquipmentList(res.data);
      }
    });
  };

  $scope.searchOnlineConfig = function () {
    var postData = [];
    //创建好待会需要渲染表格的数组
    $scope.onlineConfigList = [];
    /*因为坑爹的后台数据没法一次提供所有需要的，
     所以要先从选中的设备列表里面，根据设备id_type，到整个设备列表去获得设备名，得出一个新数组$scope.onlineConfigList
     然后再去后台返回的数据里面，根据设备id_type去获取对应的物料信息，将获得到的物料信息合并到$scope.onlineConfigList
     */
    //	前台加个判断，如果设备不选，默认全部全选
    if ($scope.equipmentSelectList.length === 0) {
      for (var i in $scope.equipmentList) {
        var equipment = $scope.equipmentList[i].id.split("_");
        postData.push({
          "equipmentId": equipment[0],
          "produceUnitType": equipment[1]
        });
      }
    } else {
      $scope.equipmentSelectList.forEach(function (item) {
        var equipment = item.split("_");
        postData.push({
          "equipmentId": equipment[0],
          "produceUnitType": equipment[1]
        });
      });
    }
    //从选中的设备列表里面，根据设备id_type，到整个设备列表去获得设备名，得出一个新数组$scope.onlineConfigList
    postData.forEach(function (selectItem) {
      $scope.equipmentList.some(function (item) {
        if (item.id === selectItem.equipmentId + "_" + selectItem.produceUnitType) {
          $scope.onlineConfigList.push({
            equipmentName: item.label,
            equipmentCode: item.equipmentCode,
            equipmentId: selectItem.equipmentId,
            equipmentType: selectItem.produceUnitType
          });
          return true;
        }
      });
    });
    if (postData.length === 0) {
      layer.alert('没有设备可以配置');
      return;
    }
    // 请求获得数据里面根据设备id_type去获取对应的物料信息，将获得到的信息合并到$scope.onlineConfigList
    http.post({
      url: $rootScope.restful_api.search_online_config,
      data: postData,
      successFn: function successFn(res) {
        res.data.forEach(function (resItem) {
          //获得渲染表格所需要的数据
          $scope.onlineConfigList.forEach(function (onlineItem) {
            if (resItem.equipmentId + "_" + (resItem.produceUnitType === "EQUIPMENT" ? 0 : 1) === onlineItem.equipmentId + "_" + onlineItem.equipmentType) {
              onlineItem.materialCode = resItem.materialCode;
              onlineItem.materialId = resItem.materialId;
              onlineItem.materialName = resItem.materialName;
            }
          });
        });

        //出现table表格和按钮
        $scope.isShowSearchConfig = true;
      },
      errorFn: function errorFn(res) {
        //table表格和按钮消失
        $scope.isShowSearchConfig = false;
      }
    });
  };

  //当用户模糊查询物料编码
  $scope.$on("materialCodeParam", function (e, value) {
    $scope.getMaterialCodeBySearch(value);
  });

  //当用户模糊查询物料名称
  $scope.$on("materialNameParam", function (e, value) {
    $scope.getMaterialNameBySearch(value);
  });

  /**
   * desc： 物料下拉列表的联动，根据物料编码的选择，确定同行另外一个物料名称
   * @param data ： 用户选择的物料编码，所对应的对象
   */
  $scope.selectMaterialName = function (data) {
    $timeout(function () {
      var selectObj = $scope.materialCodeList.filter(function (item) {
        return item.materialCode === data.materialCode;
      });
      //设置选中的物料各个属性，在保存的时候获取
      data.materialName = selectObj[0].materialName;
      data.materialId = selectObj[0].materialId;
    });
  };

  /**
   * desc： 物料下拉列表的联动，根据者物料名称的选择，确定同行另外一个物料编码
   * @param data ： 用户选择的物料名称，所对应的对象
   */
  $scope.selectMaterialCode = function (data) {
    $timeout(function () {
      var selectObj = $scope.materialNameList.filter(function (item) {
        return item.materialName === data.materialName;
      });
      //设置选中的物料各个属性，在保存的时候获取
      data.materialCode = selectObj[0].materialCode;
      data.materialId = selectObj[0].materialId;
    });
  };

  //保存上线配置数据
  $scope.saveOnlineConfig = function () {
    var postData = [];
    //遍历渲染表格的list，获取需要发送的数据
    $scope.onlineConfigList.forEach(function (item) {
      postData.push({
        equipmentId: Number(item.equipmentId),
        produceUnitType: item.equipmentType,
        materialId: item.materialId
      });
    });
    http.post({
      url: $rootScope.restful_api.save_online_config,
      data: postData,
      successFn: function successFn() {
        layer.msg('保存成功', { time: 3000, icon: 1 });
      }
    });
  };

  //恢复上线配置数据
  $scope.resetOnlineConfig = function () {
    $scope.searchOnlineConfig();
  };

  $scope.fixedTableHead = function () {
    $(".online-content-table thead").css("transform", "translateY(" + $(".online-table-box").scrollTop() + "px)");
  };
}]);
/**
 * Created by yiend on 2017/1/16.
 */
app.controller("planController", ["$rootScope", "$scope", "$timeout", "$q", "scheduleTableViewModelService", "tool", "http", function ($rootScope, $scope, $timeout, $q, scheduleTableViewModelService, tool, http) {

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
        layer.msg('读取车间失败,请检查服务器', { time: 3000, icon: 2 });
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
        li.eq(0).children(".column-border").show();

        $("#jWorkshop").on("click", "ul span", function () {
          $(this).toggleClass("active").toggleClass("open");
          $(this).next().toggle();
          //改变按钮的位置
          var bgPosition = $(".location-choose").width();
          $(".out-bg").width(bgPosition);
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
            parentLi.find("i").removeClass("active");
          }
          //==========如果车间没被选中========
          else {
              //所有子车间加上active的class
              $(target).addClass("active");
              $(target).siblings(".select-status").addClass("active");
              $(target).siblings("ul").find(".select-status").each(function () {
                $(this).addClass("active");
              });

              //左侧菜单出现本车间的信息
              $scope.locationRuleList.push({
                locationId: id,
                locationName: $(target).siblings("span").text(),
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
      dragSelector: "li",
      dragEnd: function dragEnd() {},
      dragBetween: false,
      placeHolderTemplate: "<li></li>"
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

  /*根据子元素选中的数量来改变父元素的状态
   * 1.子元素全选中，则父元素显示为选中
   * 2子元素未全选中，则父元素显示为部分选中
   * 3子元素选中数量为0，则父元素显示为不选中
   */
  var changeParentSelected = function changeParentSelected(elem) {
    var parentLi = elem.parent();
    var parentUl = parentLi.parent();
    var childrenLiLength = parentUl.find(".select-status").length / 2; //所有选中框的数量
    var selectedLength = parentUl.find(".select-status.active").not(".jSchedulePlanEle").length; //选中input的数量
    //判断父元素操作权限，如果父元素没有则停止向上改变状态
    if (parentUl.siblings("i").attr("data-merge-location") === 'false') {
      return;
    }
    //如果全部选中，父元素也变为全部选中状态
    if (childrenLiLength === selectedLength) {
      parentUl.siblings("i").addClass("active").removeClass("select-some unselect");
    } else {
      //如果全部未选中，父元素也变为未选中状态
      if (selectedLength === 0) {
        parentUl.siblings("i").removeClass("active select-some").addClass("unselect");
      } else {
        // parentUl.siblings("i").attr("class","select-status select-some")
        parentUl.siblings("i").addClass("select-some").removeClass("active unselect");
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
      // console.info($scope.locationRuleList,"$scope.locationRuleList为空转化为数组");
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
   * @param: locationId :点击的车间id，
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
            layer.msg('排程方案新建成功', { time: 3000, icon: 1 });
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
          layer.msg('排程方案新建失败,请检查服务器', { time: 3000, icon: 2 });
        }
      });
    } else {
      http.put({
        url: $rootScope.restful_api.single_schedule_plan + $scope.schemeId,
        data: postData,
        successFn: function successFn(res) {
          layer.msg('排程方案更新成功', { time: 3000, icon: 1 });
        },
        errorFn: function errorFn() {
          layer.msg('排程方案更新失败', { time: 3000, icon: 2 });
        }
      });
    }
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
                layer.msg('删除排程方案成功', { time: 3000, icon: 1 });
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
              layer.msg(res.data.error_response.text, { time: 3000, icon: 2 });
            } else {
              layer.msg('删除方案失败，请检查服务器', { time: 3000, icon: 2 });
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
          area: ["900px", "50%"],
          skin: 'viewRuleBox',
          content: $(".layerBox"),
          success: function success() {
            $timeout(function () {
              $(".algorithm-name").text(res.data.algorithmName);
            });
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

  $scope.regex = {
    overduePeriod: /(^[1-9]$)|(^[1-8][0-9]$)|90$/,
    scheduleInterval: /(^[0-9]$)|(^[1-8][0-9]$)|90$/,
    freezePeriod: /(^[0-9]$)|(^[1-8][0-9]$)|90$/,
    colorTypes: /[^0-9]/g
  };

  //请求所有的算法名称
  http.get({
    url: $rootScope.restful_api.get_all_Algorithm,
    successFn: function successFn(res) {
      $scope.algorithmList = res.data;
    }
  });

  //获取所有规则
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
            $scope.currentRule = $scope.ruleList[0];
            $scope.scheduleCheckData = res.data;

            $scope.renderRulePage(res.data);

            //================表单验证及相关逻辑联动
            var scheduleWeightregex = /^(\d{1,2}(\.\d{1})?|100)$/; //只能输入大于0小于100的数字
            $(".jScheduleWeightMap input").each(function () {
              $(this).keyup(function () {
                if (!$(this).val()) {
                  $(this).addClass("error").siblings("b").show().text("输入项不能为空");
                } else if (!scheduleWeightregex.test($(this).val())) {
                  $(this).addClass("error").siblings("b").show().text("输入项不符合规则");
                } else {
                  $(this).removeClass("error").siblings("b").hide();
                }
              });
            });
          }
        });
      }
    },
    errorFn: function errorFn() {
      layer.msg('获取排程规则失败，请检查服务器', { time: 3000, icon: 2 });
      $scope.ruleList = [];
    }
  });

  //判断需要发送的数据要保存的属性
  function getRuleFromValue(postData, searchObj) {
    var itemMap = postData.itemMap;
    for (var name in searchObj) {
      if (searchObj[name] === "on") {
        itemMap[name].itemValue = true;
      }
      //为false，表示表单未选中
      else if (!searchObj[name]) {
          itemMap[name].itemValue = false;
        } else {

          itemMap[name].itemValue = searchObj[name];
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

  //修改算法改变规则列表
  $scope.changeAlgorithm = function (algorithm) {
    http.get({
      url: $rootScope.restful_api.single_schedule_rule + '/default/' + algorithm,
      successFn: function successFn(res) {
        //将排程规则的配置参数更新为选择算法给的配置参数，然后用于渲染
        $scope.scheduleCheckData.algorithmName = algorithm;
        // console.log(algorithm);
        $scope.scheduleCheckData.itemMap = res.data;
        $scope.renderRulePage($scope.scheduleCheckData);
      }
    });
  };

  //创建临时规则数据库，存储临时创建但是未保存的规则，刷新或者离开页面数据库消失，表示用户不想保存
  $scope.temporaryRuleData = {};
  //执行临时创建规则
  $scope.recordTemporaryRule = function () {
    //检测是否重名
    if (!$scope.newRuleName) {
      layer.msg('请输入正确的排程规则名');
      return false;
    }
    if (!tool.checkRepeatName($scope.newRuleName, $scope.ruleList, "rule")) {
      layer.msg('排程规则名重复，请重新输入');
      return;
    }
    layer.closeAll();
    // 判断用户是否选了规则,没选设置为默认规则，
    // 默认规则需要添加算法 2017-06-20
    var isSelectAlgorithm = $("#ruleSelect").val() === "0";
    $scope.ruleId = isSelectAlgorithm ? "default/" + $scope.algorithmList[0] : $("#ruleSelect").val();
    http.get({
      url: $rootScope.restful_api.single_schedule_rule + $scope.ruleId,
      successFn: function successFn(res) {
        //如果选默认的，后台的返回值是排程规则配置项的map数据，而请求规则时，返回的是一个完整的排程规则数据
        if (isSelectAlgorithm) {
          $scope.scheduleCheckData = {
            algorithmName: $scope.algorithmList[0],
            itemMap: res.data
          };
        } else {
          $scope.scheduleCheckData = res.data;
        }

        $scope.ruleId = "temporary" + new Date().getTime();
        $scope.currentRule = {
          "ruleId": $scope.ruleId,
          "ruleName": $scope.newRuleName
        };
        $scope.ruleList.push($scope.currentRule);
        $scope.temporaryRuleData[$scope.ruleId] = $scope.scheduleCheckData;

        $scope.renderRulePage($scope.scheduleCheckData);
        $scope.newRuleName = ""; //清空新建规则弹出框的规则名字，便于下次新建规则

        //最后一个li获得active的状态
        $timeout(function () {
          $(".check-rule-nav .rule-li").last().addClass("active").siblings().removeClass("active");
        }, 0);
      },
      errorFn: function errorFn() {
        layer.msg('获取排程规则失败，请检查服务器', { time: 3000, icon: 2 });
      }
    });
  };

  /**点击保存排程规则**/
  $scope.saveCheckConfig = function () {
    //排程规则名字不可为空
    var ruleName = $(".rule-name input").val();
    if (!ruleName) {
      layer.msg('排程规则名不可为空', { icon: 2 });
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

    //判断几个输入框是否符合正则----拉取当前车间计划天数
    if ($("#overduePeriod").val() !== undefined && !$scope.regex.overduePeriod.test($("#overduePeriod").val())) {
      layer.msg('请输入正确的拉取当前车间计划天数', { icon: 2 });
      return;
    }
    //判断几个输入框是否符合正则----拉取当前车间计划天数
    if ($("#scheduleInterval").val() !== undefined && !$scope.regex.scheduleInterval.test($("#scheduleInterval").val())) {
      layer.msg('请输入正确的排程间隔天数', { icon: 2 });
      return;
    }
    //判断几个输入框是否符合正则----拉取当前车间计划天数
    if ($("#freezePeriod").val() !== undefined && !$scope.regex.freezePeriod.test($("#freezePeriod").val())) {
      layer.msg('请输入正确的冻结期天数	', { icon: 2 });
      return;
    }
    //判断几个输入框是否符合正则----单台涂装支持的颜色种类
    if (!$("#colorTypes").val() || $scope.regex.colorTypes.test($("#colorTypes").val())) {
      layer.msg('请输入正确的单台涂装支持的颜色种类	', { icon: 2 });
      return;
    }

    //表单序列化获得需要发送的数据
    var post = getRuleFromValue($scope.scheduleCheckData, $("form").serializeObject());

    //获取规则名字,算法名字
    post.ruleName = ruleName;
    post.algorithmName = $scope.algorithmName;

    //判断是新建规则还是更新规则
    if (($scope.ruleId + "").slice(0, 9) === "temporary") {
      delete post.ruleId;
      //新建
      http.post({
        url: $rootScope.restful_api.single_schedule_rule,
        data: post,
        successFn: function successFn(res) {
          if (res.data.error_response) {
            layer.msg('创建排程规则失败,请检查服务器', { time: 3000, icon: 2 });
          } else {
            $scope.ruleId = $scope.currentRule.ruleId = res.data;
            layer.msg('创建排程规则成功', { time: 3000, icon: 1 });
          }
        },
        errorFn: function errorFn() {
          layer.msg('排程规则更新失败,请检查服务器', { time: 3000, icon: 2 });
        }
      });
    } else {
      //更新
      http.put({
        url: $rootScope.restful_api.single_schedule_rule + $scope.ruleId,
        data: post,
        successFn: function successFn(res) {
          if (res.data.error_response) {
            layer.msg('排程规则更新失败', { time: 3000, icon: 2 });
          } else {
            layer.msg('排程规则更新成功', { time: 3000, icon: 1 });
          }
        },
        errorFn: function errorFn() {
          layer.msg('排程规则更新失败,请检查服务器', { time: 3000, icon: 2 });
        }
      });
    }
  };

  //查看规则
  $scope.lookRule = function (rule) {
    $scope.currentRule = rule;
    $scope.ruleId = rule.ruleId;
    if ((rule.ruleId + "").slice(0, 9) === "temporary") {
      $scope.renderRulePage($scope.temporaryRuleData[rule.ruleId]);
    } else {
      http.get({
        url: $rootScope.restful_api.single_schedule_rule + rule.ruleId,
        successFn: function successFn(res) {
          //渲染规则页面数据
          $scope.scheduleCheckData = res.data;
          $scope.renderRulePage($scope.scheduleCheckData);
        }
      });
    }
  };

  //删除排程规则
  $scope.deleteRule = function (event) {
    event.stopPropagation();
    var deleteRule = layer.confirm('确定删除此排程规则？', {
      btn: ['确定', '取消'] //按钮
    }, function () {
      var ruleId = $(event.target).parent().attr("data-rule-id");
      layer.close(deleteRule);
      if ((ruleId + "").slice(0, 9) === "temporary") {
        $timeout(function () {
          delete $scope.temporaryRuleData[ruleId];
          $scope.ruleList = $scope.ruleList.filter(function (item) {
            return item.ruleId !== ruleId;
          });

          //删除成功，查看第一个排程规则，没有规则时，不需要执行
          if ($scope.ruleList.length !== 0) {
            $timeout(function () {
              $(".check-rule-nav .rule-li").first().addClass("active").siblings().removeClass("active");
            }, 0);
            $scope.lookRule($scope.ruleList[0]);
          }
        });
      } else {
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
              layer.msg('删除排程规则成功', { time: 3000, icon: 1 });
              //删除成功，查看第一个排程规则，没有规则时，不需要执行
              if ($scope.ruleList.length !== 0) {
                $timeout(function () {
                  $(".check-rule-nav .rule-li").first().addClass("active").siblings().removeClass("active");
                }, 0);
                $scope.lookRule($scope.ruleList[0]);
              }
            }
          },
          errorFn: function errorFn(res) {
            if (res.data.error_response.code === 102) {
              layer.msg('你没有权限删除此规则', { time: 3000, icon: 4 });
            } else if (res.data.error_response.code === 103) {
              layer.msg('此规则正在使用，无法删除', { time: 3000, icon: 4 });
            } else {
              layer.msg('删除规则失败，请检查服务器', { time: 3000, icon: 2 });
            }
          }
        });
      }
    }, function () {
      layer.close(deleteRule);
    });
  };

  //监听拉取当前车间计划天数
  $scope.testOverduePeriod = function (e) {
    var regex = /(^[1-9]$)|(^[1-8][0-9]$)|90$/;
    if (!regex.test($scope.scheduleCheckDataItemMap.overduePeriod.itemValue)) {
      layer.msg("请输入正确的拉取当前车间计划天数", { icon: 2 });
      // $(e.target).addClass("error");
    }
  };

  //监听冻结期的输入值是否符合标准
  $scope.testFreezePeriod = function (e) {
    var regex = /(^[0-9]$)|(^[1-8][0-9]$)|90$/;
    if (!regex.test($scope.scheduleCheckDataItemMap.freezePeriod.itemValue)) {
      layer.msg("请输入正确的排程间隔天数", { icon: 2 });
      // $(e.target).addClass("error");
    }
  };

  //监听排程间隔的输入值是否符合标准
  $scope.testScheduleInterval = function (e) {
    var regex = /(^[0-9]$)|(^[1-8][0-9]$)|90$/;
    if (!regex.test($scope.scheduleCheckDataItemMap.scheduleInterval.itemValue)) {
      layer.msg("请输入正确的冻结期天数", { icon: 2 });
      // $(e.target).addClass("error");
    }
  };

  //监听单台涂装支持的颜色种类的输入值是否符合标准
  $scope.testColorTypes = function () {
    $scope.scheduleCheckDataItemMap.colorTypes.itemValue = $scope.scheduleCheckDataItemMap.colorTypes.itemValue.replace(/[^0-9]/g, '');
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

  //显示隐藏高级规则，专家规则---start
  $rootScope.jExpertConfiguration = false;
  $scope.toggleAdvancedShow = function () {
    $scope.jAdvancedConfiguration = !$scope.jAdvancedConfiguration;
    return $scope.setCheckRuleHeight();
  };

  $scope.toggleExpertShow = function () {
    $scope.jExpertConfiguration = !$scope.jExpertConfiguration;
    return $scope.setCheckRuleHeight();
  };
  //显示隐藏高级规则,专家规则---end

  /*
   * 监测排程前校验中的pap选项，checkbox为false将pap类型下拉框设置为不启用，否则反之
   * 取消绑定，执行unbindWatchPap()
   */
  $scope.$watch("scheduleCheckDataItemMap['preScheduleCheck.PAP_INFO_CHECKING'].itemValue", function (newValue, oldValue) {
    if (!$scope.scheduleCheckDataItemMap || !$scope.scheduleCheckDataItemMap.papType) return;
    //设置为true，启用默认规则
    if (newValue === true) {
      if ($scope.scheduleCheckDataItemMap.papType.itemValue !== "1") {
        $scope.scheduleCheckDataItemMap.papType.itemValue = "2";
      }
    } else {
      $scope.scheduleCheckDataItemMap.papType.itemValue = "0";
    }
  });

  $scope.$watch("scheduleCheckDataItemMap.papType.itemValue", function (newValue, oldValue) {
    if (!$scope.scheduleCheckDataItemMap || !$scope.scheduleCheckDataItemMap.schedulePoint) return;
    //设置为true，启用默认规则
    if (newValue !== "0") {
      $scope.scheduleCheckDataItemMap['preScheduleCheck.PAP_INFO_CHECKING'].itemValue = true;
      if (newValue === "1") {
        $scope.scheduleCheckDataItemMap.schedulePoint.itemValue = "3";
      }
    } else {
      $scope.scheduleCheckDataItemMap['preScheduleCheck.PAP_INFO_CHECKING'].itemValue = false;
    }
    $scope.disabledByPapType = $scope.scheduleCheckDataItemMap.papType.itemValue === '0';
    $scope.disabledByPapTypeValue = $scope.scheduleCheckDataItemMap.papType.itemValue === '1';
  });

  //==========================上线配置相关代码---start-=================//
  //查看设备初始状态
  //获取所有的地点
  http.get({
    url: $rootScope.restful_api.aps_location_readable,
    successFn: function successFn(res) {
      $scope.location_data = {
        repeatData: res.data,
        showText: '地点',
        className: "location"
      };
    }
  });

  //获取所有设备类型
  $scope.equipmentSelectTypeZeroList = []; //离散设备的下拉列表
  $scope.selectEquipmentTypeZero = []; //选中的离散设备
  $scope.equipmentSelectTypeOneList = []; //生产单元的下拉列表
  $scope.selectEquipmentTypeOne = []; //选中的生产单元
  http.get({
    url: $rootScope.restful_api.get_equipment_type + "?startTime=" + tool.getCorrectDate(new Date()) + "&endTime=" + tool.getCorrectDate(new Date()),
    successFn: function successFn(res) {
      res.data.forEach(function (item) {
        item.id = item.modelId + "_" + item.modelType;
        if (item.modelType === 0) {
          $scope.equipmentSelectTypeZeroList.push(item);
        } else if (item.modelType === 1) {
          $scope.equipmentSelectTypeOneList.push(item);
        }
      });
    }
  });

  //获取所有设备
  $scope.equipmentList = [];
  //设备下拉列表选中设备的数据
  $scope.equipmentSelectList = [];
  http.post({
    url: $rootScope.restful_api.get_all_equipment,
    data: {
      startTime: tool.getCorrectDate(new Date()),
      endTime: tool.getCorrectDate(new Date()),
      searchType: 0,
      modelIdList: [],
      locationFilterList: []
    },
    successFn: function successFn(res) {
      $scope.equipmentList = getEquipmentList(res.data);
    }
  });

  /*
   * desc : 请求获取到的设备列表是个对象，然后将其转化成数组
   */
  function getEquipmentList(equipmentList) {
    var equipmentData = [];
    for (var i in equipmentList) {
      equipmentData.push({
        label: equipmentList[i].productUnitName,
        id: equipmentList[i].productUnitId + "_" + (equipmentList[i].type === "EQUIPMENT" ? 0 : 1),
        equipmentCode: equipmentList[i].productUnitCode,
        equipmentName: equipmentList[i].productUnitName
      });
    }
    return equipmentData;
  }

  //根据改动条件，获得equipment设备列表
  $scope.getEquipment = function () {
    http.post({
      url: $rootScope.restful_api.get_all_equipment,
      data: {
        startTime: tool.getCorrectDate(new Date()),
        endTime: tool.getCorrectDate(new Date()),
        searchType: 1,
        modelIdList: $scope.selectEquipmentTypeZero.concat($scope.selectEquipmentTypeOne),
        locationFilterList: $scope.get_selected_location()
      },
      successFn: function successFn(res) {
        $scope.equipmentList = getEquipmentList(res.data);
      }
    });
  };

  //打开查看详细的上限配置
  $scope.lookOnlineConfig = function () {
    layer.open({
      content: $(".jOnlineContent"),
      type: 1,
      title: "初始生产状态",
      area: ["600", "700px"],
      shadeClose: true,
      success: function success() {}
    });
    $scope.isShowSearchConfig = true;
  };

  $scope.searchOnlineConfig = function () {
    var postData = [];
    //创建好待会需要渲染表格的数组
    $scope.onlineConfigList = [];
    /*因为坑爹的后台数据没法一次提供所有需要的，
     所以要先从选中的设备列表里面，根据设备id_type，到整个设备列表去获得设备名，得出一个新数组$scope.onlineConfigList
     然后再去后台返回的数据里面，根据设备id_type去获取对应的物料信息，将获得到的物料信息合并到$scope.onlineConfigList
     */
    //	前台加个判断，如果设备不选，默认全部全选
    if ($scope.equipmentSelectList.length === 0) {
      for (var i in $scope.equipmentList) {
        var equipment = $scope.equipmentList[i].id.split("_");
        postData.push({
          "equipmentId": equipment[0],
          "produceUnitType": equipment[1]
        });
      }
    } else {
      $scope.equipmentSelectList.forEach(function (item) {
        var equipment = item.split("_");
        postData.push({
          "equipmentId": equipment[0],
          "produceUnitType": equipment[1]
        });
      });
    }
    //从选中的设备列表里面，根据设备id_type，到整个设备列表去获得设备名，得出一个新数组$scope.onlineConfigList
    postData.forEach(function (selectItem) {
      $scope.equipmentList.some(function (item) {
        if (selectItem.equipmentId + "_" + selectItem.produceUnitType === item.id) {
          $scope.onlineConfigList.push({
            equipmentName: item.label,
            equipmentCode: item.equipmentCode,
            equipmentId: selectItem.equipmentId,
            equipmentType: selectItem.produceUnitType
          });
          return true;
        }
      });
    });
    if (postData.length === 0) {
      layer.alert('没有设备可以配置');
      return;
    }
    // 请求获得数据里面根据设备id_type去获取对应的物料信息，将获得到的信息合并到$scope.onlineConfigList
    http.post({
      url: $rootScope.restful_api.search_online_config,
      data: postData,
      successFn: function successFn(res) {
        res.data.forEach(function (resItem) {
          //获得渲染表格所需要的数据
          $scope.onlineConfigList.forEach(function (onlineItem) {
            if (resItem.equipmentId + "_" + (resItem.produceUnitType === "EQUIPMENT" ? 0 : 1) === onlineItem.equipmentId + "_" + onlineItem.equipmentType) {
              onlineItem.materialCode = resItem.materialCode;
              onlineItem.materialId = resItem.materialId;
              onlineItem.materialName = resItem.materialName;
            }
          });
        });
        //出现table表格和按钮
        $scope.isShowSearchConfig = true;
      },
      errorFn: function errorFn(res) {
        //table表格和按钮消失
        $scope.isShowSearchConfig = false;
      }
    });
  };
  //==========================上线配置相关代码---end-=================//
}]);

/**
 * Created by yiend on 2017/1/14.
 * desc : 工作单元
 */
'use strict';
/*
 * desc :　secondPageController　： 工作单元（俗称二级页面）
 * desc :　columnController　： 显示项配置
 * desc :　sortController　： 多列排序项配置
 */
app.controller("secondPageController", ["$rootScope", "$scope", "$state", function ($rootScope, $scope, $state) {
  //显示正确的目录class-active
  $scope.configNav.activeNav = ".workUnit";

  $state.go('config.workUnit.column'); //默认显示第一个tab

  $scope.secondPage = {
    title: "" //面包屑导航三级目录文字
  };
}]).controller("columnController", ["$rootScope", "$scope", "http", function ($rootScope, $scope, http) {
  //设置面包屑导航
  $scope.secondPage.showPageConfig = "显示项";

  /**
   *根据配置页面获取的车间地点,显示对应排序表的数据
   */
  var getColumnData = function getColumnData() {
    http.get({
      url: $rootScope.restful_api.column_content_config + $scope.locationId,
      successFn: function successFn(res) {
        //获得get到的数据，渲染两个拖拽框
        $scope.setDisplayGetData(res);
      },
      errorFn: function errorFn() {
        layer.msg('获取数据失败，请检查服务器', { time: 3000, icon: 2 });
      }
    });
  };
  getColumnData();

  // //获取数据，创造车间树
  // $scope.createWorkshop(true,getColumnData);


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
          layer.msg('保存成功', { time: 3000, icon: 1 });
        }
      },
      errorFn: function errorFn() {
        layer.msg('保存失败', { time: 3000, icon: 2 });
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
        layer.msg('还原配置成功', { time: 3000, icon: 1 });
      },
      errorFn: function errorFn() {
        layer.msg('还原配置失败', { time: 3000, icon: 2 });
      }
    });
  };
}]).controller("sortController", ["$rootScope", "$scope", "scheduleTableViewModelService", "http", function ($rootScope, $scope, scheduleTableViewModelService, http) {
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
        layer.msg('获取数据失败，请检查是否连上服务器', { time: 3000, icon: 2 });
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

  //渲染数据
  getSortConfig();

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
          layer.msg('保存成功', { time: 3000, icon: 1 });
        }
      },
      errorFn: function errorFn() {
        layer.msg('数据保存失败', { time: 3000, icon: 2 });
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
          layer.msg('合并项保存失败', { time: 3000, icon: 2 });
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
          layer.msg('合并项保存失败', { time: 3000, icon: 2 });
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
          layer.msg('汇总项保存失败', { time: 3000, icon: 2 });
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
          layer.msg('汇总项保存失败', { time: 3000, icon: 2 });
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
        layer.msg('还原配置成功', { time: 3000, icon: 1 });
      },
      errorFn: function errorFn() {
        layer.msg('还原配置失败', { time: 3000, icon: 2 });
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
        layer.msg('合并项保存失败', { time: 3000, icon: 2 });
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
        layer.msg('汇总项保存失败', { time: 3000, icon: 2 });
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
  };
}]);
/**
 * Created by yiend on 2017/2/6.
 */
app.controller("versionController", ["$rootScope", "$scope", "$http", "$state", "tool", "http", function ($rootScope, $scope, $http, $state, tool, http) {
  //显示正确的目录class-active
  $scope.configNav.activeNav = ".version";

  //获取系统版本
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