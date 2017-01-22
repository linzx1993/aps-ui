/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	/**
	 * Created by yiend on 2017/1/14.
	 */
	__webpack_require__(1);
	__webpack_require__(2);

/***/ },
/* 1 */
/***/ function(module, exports) {

	/**
	 * Created by yiend on 2017/1/14.
	 */
	'use strict';

	app.controller("columnController", ["$rootScope", "$scope", "$http", "$window", "$location", "$timeout", "$q", "$templateCache", "scheduleTableViewModelService", function ($rootScope, $scope, $http, $window, $location, $timeout, $q, $templateCache, scheduleTableViewModelService) {
	  console.log(1);
	}]);

/***/ },
/* 2 */
/***/ function(module, exports) {

	/**
	 * Created by lzx on 2016/8/30.
	 */
	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	$("body").on("click", ".check-rule-nav .ruleLi,.check-rule-nav .schedulePlanLi", function () {
	    $(this).addClass("active").siblings().removeClass("active");
	}).on("click", ".config-nav li", function (e) {
	    e.stopPropagation();
	    $(".config-nav li").removeClass("active");
	    $(this).addClass("active");
	    if ($(this).hasClass("drag")) {
	        $(this).removeClass("drag");
	        return;
	    }
	    $(this).addClass("active drag").siblings().removeClass("active drag");
	});
	// app.directive("folderTree", function() {
	//     return {
	//         restrict: "E",
	//         scope: {
	//             currentFolder: '='
	//         },
	//         repalce : true,
	//         transclude : true,
	//         templateUrl: 'template/tree.html',
	//     };
	// });
	app.controller("configController", ["$rootScope", "$scope", "$http", "$window", "$location", "$timeout", "$q", "$templateCache", "scheduleTableViewModelService", function ($rootScope, $scope, $http, $window, $location, $timeout, $q, $templateCache, scheduleTableViewModelService) {
	    //杜伟伟设置的代码，未知bug修正
	    $("#do_detail_dialog_1").parent().remove();
	    $("#do_detail_dialog").parent().remove();
	    //生成车间树,设置车间选中
	    $scope.columnWorkshop = true;
	    $scope.locationId = $scope.locationId || "01";
	    //判断是否在当前页面==>是否重新发送请求 = 设置初始页面
	    $scope.currentPage = $scope.dataUrl = "view/adminManage.html";
	    $timeout(function () {
	        $scope.selectLi("view/version.html");
	    }, 0);
	    //自定义目录栏数据
	    $scope.configLis = [{ text: "VersionNav", url: "view/version.html", "sref": ".version" }, { text: "displayConfiguration", url: "view/columnConfig.html", "sref": ".display",
	        children: [{ text: "levelPage", url: "", "sref": ".first" }, { text: "secondaryPage", url: "view/columnConfig.html", "sref": ".second"
	        }, { text: "threePages", url: "view/sortConfig.html", "sref": ".three" }]
	    }, { text: "ScheduleRuleSetting", url: "view/checkFrom.html", "sref": ".rule" }, { text: "SchedulingSchemeSettings", url: "view/schedulePlan.html", "sref": ".scheme" }, { text: "PAPRuleSetting", url: "view/papRule.html", "sref": ".papRule" }, { text: "AdministratorConfigurationItem", url: "view/adminProperty.html", "sref": ".property",
	        children: [{ text: "车间属性", url: "view/workshopProperty.html", "sref": ".workshopProperty" }, { text: "默认显示项", url: "view/adminDisplay.html", "sref": ".defaultDisplay" }]
	    }];
	    //点击li获得跳转的url进行局部刷新
	    $scope.selectLi = function (gourl, event) {
	        $timeout(function () {
	            $scope.dataUrl = gourl;
	        });
	        //判断是否在当前页,是=>不变
	        if ($scope.currentPage == gourl) {
	            return;
	        } else {
	            // if($scope.currentPage == "view/schedulePlan.html"){
	            // let move = layer.confirm('方案未保存，确定离开此界面', {
	            //     btn: ['确定','取消'] //按钮
	            // }, function(){
	            //     layer.close(move);
	            //     $scope.currentPage = gourl;
	            // }, function(){
	            //     layer.close(move);
	            //     return;
	            // });
	            // }else{
	            $scope.currentPage = gourl;
	            // }
	        }
	        switch (gourl) {
	            //版本号配置
	            case "view/version.html":
	                (function () {
	                    $scope.columnWorkshop = false;
	                    $http.get($rootScope.restful_api.public_version_number).then(function (res) {
	                        $scope.versionNumer = res.data.version;
	                    }, function (res) {});
	                })();
	                break;
	            //列信息配置
	            case "view/columnConfig.html":
	                (function () {
	                    //异步原因：因为执行完selectLi这个方法之后才开始刷新ng-include的页面，
	                    // 如果不异步，则先执行这里的代码，添加内容，// 然后执行ng-include刷新页面，刚添加的内容全部消除了
	                    $timeout(function () {
	                        createWorlshop();
	                        //根据点击不同的车间选择不同的显示项
	                        $("#columnWorkshop").on("click", ".select-status", function (e) {
	                            //根据点击的车间ID
	                            $scope.locationId = getLocationId(e);
	                            $http.get($rootScope.restful_api.column_content_config + $scope.locationId).then(function (res) {
	                                //获得get到的数据，渲染页面
	                                setDisplayGetData(res);
	                            }, function () {
	                                info.fail("获取数据失败，请检查是否连上服务器");
	                            });
	                        });
	                    });
	                    //初始化拖拽
	                    clickliGetItem();
	                })();
	                break;
	            //多列排序配置
	            case "view/sortConfig.html":
	                (function () {
	                    $timeout(function () {
	                        createWorlshop();
	                        //根据点击不同的车间选择不同的显示项
	                        $("#columnWorkshop").on("click", ".select-status", function (e) {
	                            //根据点击的车间ID
	                            $scope.locationId = getLocationId(e);
	                            //根据不同的车间ID进行显示
	                            $http.get($rootScope.restful_api.sort_content_config + $scope.locationId).then(function (res) {
	                                //获得get到的数据，渲染页面
	                                setDisplayGetData(res);
	                            }, function () {
	                                info.fail("获取数据失败，请检查是否连上服务器");
	                            });
	                            //合并项
	                            $http.get($rootScope.restful_api.sort_combine_config + $scope.locationId).then(function (res) {
	                                $scope.combineItem = $.extend({}, res.data);
	                                $scope.combineObj = {
	                                    combine: scheduleTableViewModelService.combinecountItem($scope.combineItem),
	                                    combineDrag: true,
	                                    combineActive: false
	                                };
	                            });
	                            //汇总项
	                            $http.get($rootScope.restful_api.sort_summary_config + $scope.locationId).then(function (res) {
	                                $scope.summaryItem = $.extend({}, res.data);
	                                $scope.summaryObj = {
	                                    summary: scheduleTableViewModelService.combinecountItem($scope.summaryItem),
	                                    summaryDrag: true,
	                                    summaryActive: true
	                                };
	                            });
	                        });
	                    }, 0);
	                    clickliGetItem();
	                })();
	                break;
	            //排程规则配置
	            case "view/checkFrom.html":
	                (function () {
	                    $scope.columnWorkshop = false;
	                    $http.get($rootScope.restful_api.all_schedule_rule).success(function (res) {
	                        $scope.ruleList = res;
	                        //如果有规则，显示第一条排程规则
	                        if ($scope.ruleList[0]) {
	                            $scope.ruleId = $scope.ruleList[0].ruleId;
	                            $http.get($rootScope.restful_api.single_schedule_rule + $scope.ruleId).success(function (res) {
	                                $scope.setCheckData(res);
	                            })
	                            //表单初始化
	                            .then(function () {
	                                //设置pap排程规则
	                                $scope.disable = {};
	                                $scope.notEdit = {};
	                                if ($scope.scheduleCheckData.papType == "PAP_DISABLE") {
	                                    $scope.disable.schedulePointSelected = true;
	                                    $scope.notEdit.schedulePointSelected = true;
	                                } else if ($scope.scheduleCheckData.papType == "PAP_SCHEDULE_RULE") {
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
	                                document.getElementById("scheduleInterval").onkeyup = function () {
	                                    if (this.value.length == 1) {
	                                        this.value = this.value.replace(/[^0-9]/g, '');
	                                    } else {
	                                        this.value = this.value.replace(/\D/g, '');
	                                    }
	                                    if (this.value > 90) {
	                                        this.value = 90;
	                                    }
	                                };
	                                document.getElementById("freezePeriod").onkeyup = function () {
	                                    if (this.value.length == 1) {
	                                        this.value = this.value.replace(/[^1-9]/g, '');
	                                    } else {
	                                        this.value = this.value.replace(/\D/g, '');
	                                    }
	                                    if (this.value > 90) {
	                                        this.value = 90;
	                                    }
	                                };
	                                //当前日期前的车间计划
	                                if (!$scope.scheduleCheckData.isLoadOverduePoolTask) {
	                                    $("input[name=overduePeriod]").attr("disabled", "disabled");
	                                } else {
	                                    $("input[name=overduePeriod]").removeAttr("disabled");
	                                }
	                            })
	                            //表单验证及相关逻辑联动
	                            .then(function () {
	                                //用于修改点击label会触发input点击导致两次的bug
	                                var a = 0;
	                                $("label[for=isLoadOverduePoolTask]").on("click", function () {
	                                    a += 2;
	                                    if (a % 4 === 0) {
	                                        $("input[name=overduePeriod]").attr("disabled", !$("input[name=overduePeriod]").prop("disabled"));
	                                    }
	                                });
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
	                    }).error(function () {
	                        info.fail("请求规则失败，请检查服务器");
	                        $scope.ruleList = [];
	                    });
	                })();
	                break;
	            //排程计划配置
	            case "view/schedulePlan.html":
	                (function () {
	                    $scope.columnWorkshop = false;
	                    $http.get($rootScope.restful_api.all_schedule_plan).then(function (res) {
	                        $scope.planList = res.data;
	                        if ($scope.planList.error_response) {
	                            $scope.planList = [];
	                            $scope.planId = 0;
	                        } else {
	                            $scope.planId = $scope.planList[0].schemeId;
	                        }
	                        //默认点击第一个
	                        $http.get($rootScope.restful_api.single_schedule_plan + $scope.planId).then(function (response) {
	                            $scope.locationRuleList = response.data.locationRuleList;
	                            //生成车间树,设置车间选中
	                            ulHtml = '<ul class="root">';
	                            $http.get($rootScope.restful_api.get_new_location).then(function (res) {
	                                creatUl(res.data);
	                                //添加到DOM
	                                $("#workshop.ul-box").append($(ulHtml));
	                                //打开和收起
	                                $("#workshop").on("click", ".title span", function () {
	                                    if ($(this).parent().next().css("display") == "block") {
	                                        $(this).parent().next().hide();
	                                        $(this).removeClass("title-close").addClass("title-open");
	                                    } else {
	                                        $(this).parent().next().show();
	                                        $(this).removeClass("title-open").addClass("title-close");
	                                    }
	                                })
	                                //打开第一级
	                                .find(".title span").click();
	                                //绑定选择事件
	                                $("#workshop .root").on("click", ".select-status", function () {
	                                    var thisSelect = $(this);
	                                    selectStatusChange(thisSelect);
	                                }).children(".title").find("span").click();
	                            }, function (res) {})
	                            //渲染车间树样式
	                            .then(function () {
	                                $scope.setWorkshop();
	                            });
	                        });
	                    }, function (res) {
	                        //获取服务器数据失败的情况下
	                        $scope.planList = [];
	                    })
	                    //获取规则列表
	                    .then(function () {
	                        if ($scope.ruleList) {
	                            return;
	                        } else {
	                            $http.get($rootScope.restful_api.all_schedule_rule).success(function (res) {
	                                $scope.ruleList = res;
	                                //设置方案前，没有排程规则[];
	                                if (!$scope.ruleList.length) {
	                                    layer.alert("请先设置一个排程规则");
	                                } else {
	                                    $scope.ruleId = $scope.ruleList[0].ruleId;
	                                }
	                            }).error(function (res) {
	                                $scope.ruleList = [];
	                                console.log(res);
	                            });
	                        }
	                    });
	                    //执行拖拽
	                    $timeout(function () {
	                        $(".gridly").dragsort({ dragSelector: "li", dragEnd: function dragEnd() {}, dragBetween: false, placeHolderTemplate: "<li></li>" });
	                    });
	                })();
	                break;
	            //pap排程规则
	            case "view/papRule.html":
	                (function () {
	                    $timeout(function () {
	                        createWorlshop();
	                        //根据点击不同的车间选择不同的显示项
	                        $("#columnWorkshop").on("click", ".select-status", function (e) {
	                            //根据点击的车间ID
	                            $scope.locationId = getLocationId(e);
	                            $http.get($rootScope.restful_api.papRule_content_config + $scope.locationId).success(function (res) {
	                                $scope.papOptionList = res.optionList;
	                                $scope.papSelectList = res.selectList;
	                            });
	                        });
	                    });
	                })();
	                break;
	            //管理员配置项
	            case "view/adminManage.html":
	                (function () {
	                    //创造车间树
	                    $timeout(function () {
	                        createWorlshop();
	                        //根据点击不同的车间选择不同的显示项
	                        $("#columnWorkshop").on("click", ".select-status", function (e) {
	                            //根据点击的车间ID
	                            $scope.locationId = getLocationId(e);
	                            $http.get($rootScope.restful_api.admin_content_config + $scope.locationId).success(function (res) {
	                                $scope.adminOptionList = res.optionList;
	                                $scope.adminSelectList = res.selectList[0];
	                                $scope.carHouseSelected = $scope.adminSelectList.valueContent;
	                                //设置下拉选中值
	                                setTimeout(function () {
	                                    Array.prototype.forEach.call($("dd.relative span"), function (item, index) {
	                                        var text = $(item).siblings("select").find("option:selected").text();
	                                        $(item).text(text);
	                                    });
	                                }, 0);
	                            });
	                        });
	                    });
	                })();
	                break;
	            //默认显示项配置
	            case "view/adminManageHtmlDisplay.html":
	                (function () {
	                    //添加异步==>需要等待树形渲染完成
	                    $timeout(function () {
	                        //创造车间树
	                        createWorlshop();
	                        //根据点击不同的车间选择不同的显示项
	                        $("#columnWorkshop").on("click", ".select-status", function (e) {
	                            //根据点击的车间ID
	                            $scope.locationId = getLocationId(e);
	                            $http.get($rootScope.restful_api.reset_show_column + $scope.locationId).then(function (res) {
	                                //获得get到的数据，渲染页面
	                                setDisplayGetData(res);
	                            }, function () {
	                                info.fail("获取数据失败，请检查是否连上服务器");
	                            });
	                        });
	                    });
	                    clickliGetItem();
	                })();
	                break;
	            default:
	                break;
	        }
	        //每次第一次点进来默认点击车间树
	        if (gourl !== "view/checkFrom.html" && gourl !== "view/schedulePlan.html") {
	            $timeout(function () {
	                $(".select-status[location-id=" + $scope.locationId + "]").trigger("click");
	            }, 100);
	        }
	    };
	    //版本页面
	    $scope.browser = xujun_tool.getBrowser().browser;
	    $scope.version = xujun_tool.getBrowser().version;
	    /**************=======================各配置页面=保存数据========================************/
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
	    /**排程前校验，排程后校验点击保存进行发送数据**/
	    $scope.saveCheckConfig = function () {
	        //=========先判断表单是否为空
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
	        var post = getFromValue($scope.scheduleCheckData, $("form").serializeObject());
	        //获取不到日历插件的值，手工获取
	        post.minScheduleDay = $("#minScheduleDay").val();
	        console.log(post);
	        //发送数据
	        $http.put($rootScope.restful_api.single_schedule_rule + $scope.ruleId, post).then(function (response) {
	            if (response.data.error_response) {
	                info.fail("数据保存失败");
	            } else {
	                info.success("数据保存成功");
	            }
	        }, function () {
	            info.fail("数据保存失败,请检查服务器");
	        });
	    };
	    /**列信息配置点击保存进行发送数据**/
	    $scope.saveColummContent = function () {
	        var postData = getDisplayPostData("请至少选择一项显示");
	        //检测数据是否正确
	        if (!postData) {
	            return;
	        }
	        $http.put($rootScope.restful_api.column_content_config + $scope.locationId, postData).then(function (response) {
	            if (response.data === true) {
	                info.success("数据保存成功");
	            }
	        }, function () {
	            info.fail("数据保存失败");
	        });
	    };
	    /**多列排序信息配置点击保存进行发送数据**/
	    $scope.saveSortContent = function () {
	        var postData = getDisplayPostData("请至少选择一项进行排序");
	        //检测数据是否正确
	        if (!postData) {
	            return;
	        }
	        $http.put($rootScope.restful_api.sort_content_config + $scope.locationId, postData).then(function (response) {
	            if (response.data === true) {
	                info.success("数据保存成功");
	            }
	        }, function () {
	            info.fail("数据保存失败");
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
	            $http.delete($rootScope.restful_api.sort_combine_config + $scope.locationId, $scope.combineItem).then(function (response) {
	                //info.success("数据保存成功");
	            }, function (res) {
	                info.fail("合并项保存失败");
	            });
	        } else {
	            $http.put($rootScope.restful_api.sort_combine_config + $scope.locationId, $scope.combineItem).then(function (response) {
	                //info.success("数据保存成功");
	            }, function () {
	                info.fail("合并项保存失败");
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
	            $http.delete($rootScope.restful_api.sort_summary_config + $scope.locationId, $scope.summaryItem).then(function (response) {
	                //info.success("数据保存成功");
	            }, function (res) {
	                info.fail("汇总项保存失败");
	            });
	        } else {
	            $http.put($rootScope.restful_api.sort_summary_config + $scope.locationId, $scope.summaryItem).then(function (response) {
	                //info.success("数据保存成功");
	            }, function (res) {
	                info.fail("汇总项保存失败");
	            });
	        }
	    };
	    /**pap规则页面保存进行发送数据**/
	    $scope.savePapConfig = function () {
	        var postData = {};
	        postData.selectList = [];
	        var input = document.getElementsByClassName("papRuleContent")[0].getElementsByTagName("input");
	        for (var i = 0, length = input.length; i < length; i++) {
	            if (input[i].checked) {
	                var obj = {};
	                var thisInput = input[i];
	                obj.valueContent = thisInput.getAttribute("data-valueContent");
	                obj.valueAlias = thisInput.getAttribute("data-valueAlias");
	                postData.selectList.push(obj);
	            }
	        }
	        $http.put($rootScope.restful_api.papRule_content_config + $scope.locationId, postData).then(function (response) {
	            info.success("数据保存成功");
	        }, function () {
	            info.fail("数据保存失败");
	        });
	    };
	    /**系统管理员页面保存进行发送数据**/
	    $scope.saveAdminConfig = function () {
	        var postData = {};
	        postData.selectList = [];
	        var select = document.getElementsByClassName("carHouse")[0];
	        var obj = {};
	        obj.valueContent = select.value;
	        obj.valueAlias = select.options[select.options.selectedIndex].text;
	        postData.selectList.push(obj);
	        $http.put($rootScope.restful_api.admin_content_config + $scope.locationId, postData).then(function (response) {
	            info.fail("车间属性保存成功");
	        }, function () {
	            info.fail("车间属性保存失败");
	        });
	    };
	    $scope.saveAdminDefaultDisplay = function () {
	        var postData = getDisplayPostData("请至少选择一项显示");
	        //检测数据是否正确
	        if (!postData) {
	            return;
	        }
	        $http.put($rootScope.restful_api.reset_show_column + $scope.locationId, postData).then(function (response) {
	            if (response.data === true) {
	                info.success("默认显示项保存成功");
	            }
	        }, function () {
	            info.fail("默认显示项保存失败");
	        });
	    };
	    /**排程方案保存进行发送数据**/
	    $scope.saveSchedulePlan = function () {
	        var postData = {
	            "schemeId": $(".schedulePlanLi.active").attr("data-scheme-id"),
	            "schemeName": $(".schedulePlanLi.active span").text(),
	            "locationRuleList": []
	        };
	        Array.prototype.forEach.call($("#workshopRule>ul>li"), function (item, index) {
	            var locationA = item.firstElementChild;
	            var ruleA = item.lastElementChild.firstElementChild;
	            var obj = {
	                "locationId": locationA.getAttribute("data-locationid"),
	                "locationName": locationA.innerHTML,
	                "ruleId": ruleA.getAttribute("data-rule-id"),
	                "ruleName": ruleA.innerHTML
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
	            $http.post($rootScope.restful_api.single_schedule_plan, postData).then(function (res) {
	                if (res.data) {
	                    info.success("新排程方案保存成功");
	                } else {
	                    info.fail("新排程方案保存失败");
	                }
	            }, function () {
	                info.fail("新排程方案保存失败");
	            });
	        } else {
	            $http.put($rootScope.restful_api.single_schedule_plan + $scope.planId, postData).then(function (res) {
	                info.success("排程方案更新成功");
	            }, function () {
	                info.fail("排程方案更新失败");
	            });
	        }
	    };
	    /**************=======================各配置页面=还原配置初始化数据========================************/
	    /**列信息还原数据**/
	    $scope.resetColumnConfig = function () {
	        $http.delete($rootScope.restful_api.column_content_config + $scope.locationId).then(function (res) {
	            $("#all-item").find(".js-move").remove();
	            //获得get到的数据，渲染页面
	            setDisplayGetData(res);
	            info.success("还原配置成功");
	        }, function () {
	            info.fail("还原配置失败");
	        });
	    };
	    /**多列排序信息还原数据**/
	    $scope.resetSortConfig = function () {
	        $http.delete($rootScope.restful_api.sort_content_config + $scope.locationId).then(function (res) {
	            $("#all-item").find(".js-move").remove();
	            //获得get到的数据，渲染页面
	            setDisplayGetData(res);
	            info.success("还原配置成功");
	        }, function () {
	            info.fail("还原配置失败");
	        });
	        //还原合并项
	        $http.delete($rootScope.restful_api.sort_combine_config + $scope.locationId, null).then(function (response) {
	            $scope.combineItem = $.extend({}, response.data);
	            $scope.combineObj = {
	                combine: scheduleTableViewModelService.combinecountItem($scope.combineItem),
	                combineDrag: true,
	                combineActive: false
	            };
	        }, function (res) {
	            info.fail("合并项保存失败");
	        });
	        //还原汇总项
	        $http.delete($rootScope.restful_api.sort_summary_config + $scope.locationId, null).then(function (response) {
	            $scope.summaryItem = $.extend({}, response.data);
	            $scope.summaryObj = {
	                summary: scheduleTableViewModelService.combinecountItem($scope.summaryItem),
	                summaryDrag: true,
	                summaryActive: true
	            };
	        }, function (res) {
	            info.fail("汇总项保存失败");
	        });
	    };
	    /**pap规则页面还原数据**/
	    $scope.resetPapConfig = function () {
	        $http.delete($rootScope.restful_api.papRule_content_config + $scope.locationId).then(function (res) {
	            $scope.papOptionList = res.data.optionList;
	            $scope.papSelectList = res.data.selectList;
	            info.success("还原配置成功");
	        }, function () {
	            info.fail("还原配置失败");
	        });
	    };
	    /**系统管理员页面还原数据**/
	    $scope.resetAdminConfig = function () {
	        $http.delete($rootScope.restful_api.admin_content_config + $scope.locationId).then(function (res) {
	            $scope.adminOptionList = res.data.optionList;
	            $scope.adminSelectList = res.data.selectList[0];
	            $scope.carHouseSelected = $scope.adminSelectList.valueContent;
	            info.success("还原配置成功");
	        }, function () {
	            info.fail("还原配置失败");
	        });
	    };
	    /**************=======================相关零散代码========================************/
	    //清楚后端缓存
	    $scope.clearCache = function () {
	        $http.post($rootScope.restful_api.clearCatch).success(function (res) {}).error(function (error) {});
	    };
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
	                //
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
	        }, {
	            key: "hide",
	            value: function hide() {
	                $scope.infoObj.mask = false;
	            }
	        }]);

	        return Info;
	    }();

	    var info = new Info();
	    // $scope.hideInfo = () =>{
	    //     $scope.infoObj.mask = false;
	    // };

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

	    /**
	     * 检查新创建规则和方案时是否重名
	     * @param newName,nameList,type: 新名字 已有名字列表 方案名还是规则名
	     * @return 新名字 或者 错误
	     */
	    function checkRepeatName(newName, nameList, type) {
	        if (!nameList || !nameList.length) {
	            return newName;
	        }
	        var result = void 0;
	        if (type === "rule") {
	            result = nameList.every(function (item) {
	                return item.ruleName != newName;
	            });
	        } else {
	            result = nameList.every(function (item) {
	                return item.schemeName != newName;
	            });
	        }
	        return result ? newName : false;
	    }

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
	        if (!checkRepeatName($scope.newRuleName, $scope.ruleList, "rule")) {
	            layer.msg('排程规则名重复，请重新输入');
	            return;
	        }
	        //判断用户是否选了规则,没选设置为默认规则
	        $scope.ruleId = $("#ruleSelect").val() === "0" ? "default" : $("#ruleSelect").val();
	        $http.get($rootScope.restful_api.single_schedule_rule + $scope.ruleId).success(function (res) {
	            $scope.scheduleCheckData = res;
	        }).error(function () {
	            layer.msg("创建新规则失败，请检查网络");
	        })
	        //再获得对应的数据,then create Rule
	        .then(function () {
	            //删除获取到的Id,post创建规则
	            delete $scope.scheduleCheckData.ruleId;
	            $scope.scheduleCheckData.ruleName = $scope.newRuleName;
	            $http.post($rootScope.restful_api.single_schedule_rule, $scope.scheduleCheckData).success(function (res) {
	                $scope.ruleId = res;
	                $scope.ruleList.push({
	                    "ruleId": res,
	                    "ruleName": $scope.scheduleCheckData.ruleName
	                });
	                $scope.setCheckData($scope.scheduleCheckData);
	                $scope.newRuleName = "";
	                layer.closeAll();
	            }).error(function () {
	                info.fail("创建规则失败-post");
	            });
	        });
	    };

	    //查看规则
	    $scope.lookRule = function (id) {
	        $http.get($rootScope.restful_api.single_schedule_rule + id).then(function (res) {
	            $scope.ruleId = id;
	            $scope.setCheckData(res.data);
	        });
	    };

	    //管理删除
	    $scope.startMange = function () {
	        $scope.showManage = !$scope.showManage;
	    };

	    //删除排程规则
	    $scope.deleteRule = function (event) {
	        var deleteRule = layer.confirm('确定删除此排程规则？', {
	            btn: ['确定', '取消'] //按钮
	        }, function () {
	            var target = event.target || event.srcElement;
	            var parentElement = target.parentNode;
	            var ruleId = parentElement.getAttribute("data-rule-id");
	            layer.close(deleteRule);
	            $http.delete($rootScope.restful_api.single_schedule_rule + ruleId).then(function (res) {
	                //成功返回
	                if (res.data == "1") {
	                    $scope.ruleList.forEach(function (item, index) {
	                        if (item.ruleId == ruleId) {
	                            $scope.ruleList.splice(index, 1);
	                            console.log(1);
	                        }
	                    });
	                    //没有规则时，不需要执行
	                    if ($scope.ruleList.length != 0) {
	                        $scope.lookRule($scope.ruleList[0].ruleId);
	                    }
	                } else if (res.data.error_response.code == "102") {
	                    info.fail("你没有权限删除此规则");
	                    // return
	                } else if (res.data.error_response.code == "103") {
	                    info.fail("此规则正在使用，无法删除");
	                    // return
	                }
	            }, function () {
	                info.fail("删除规则失败，请检查服务器");
	            });
	        }, function () {
	            layer.close(deleteRule);
	        });
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

	    //临时添加方案，创建临时方案数据库，存储临时创建但是未保存的方案，关闭或刷新页面数据库消失
	    $scope.temporySchemeData = {};
	    $scope.recordTemporyPlan = function () {
	        if (!$scope.newSchemeName) {
	            //输入框中已设置newSchemeName
	            layer.msg("排程方案名不能为空");
	            return false;
	        }
	        if (!checkRepeatName($scope.newSchemeName, $scope.planList, "scheme")) {
	            layer.msg("排程方案名重复，请重新输入");
	            return false;
	        }
	        $scope.index = $scope.planList.length - 1;
	        //临时方案设置为true
	        //初始化页面内容,通过判断方案ID查看是否设置了复制方案
	        var cloneSchemeId = $("#planSelect").val();
	        if (cloneSchemeId - 0 > 0) {
	            $http.get($rootScope.restful_api.single_schedule_plan + cloneSchemeId).then(function (res) {
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
	                });
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
	            });
	        }
	        layer.closeAll();
	    };

	    //查看方案
	    $scope.lookPlan = function (id) {
	        //先判断是否是临时方案
	        //获取临时方案的车间和规则
	        if ((id + "").slice(0, 7) == "tempory") {
	            $scope.locationRuleList = $scope.temporySchemeData[id];
	            $scope.setWorkshop();
	        } else {
	            //获取存储的车间和规则
	            $http.get($rootScope.restful_api.single_schedule_plan + id).then(function (res) {
	                $scope.schemeDate = res.data;
	                $scope.planId = id;
	                $scope.locationRuleList = res.data.locationRuleList;
	                $scope.setWorkshop();
	            }, function () {
	                $scope.planId = null;
	            });
	        }
	    };

	    //删除方案
	    $scope.deletePlan = function (id, event) {
	        //获取临时方案的车间和规则
	        console.log(id);
	        if ((id + "").slice(0, 7) == "tempory") {
	            $scope.locationRuleList = $scope.temporySchemeData[id];
	            delete $scope.planList[id];
	        } else {
	            (function () {
	                var deletePlan = layer.confirm('确定删除此排程方案', {
	                    btn: ['确定', '取消'] //按钮
	                }, function () {
	                    var target = event.target || event.srcElement;
	                    var parentElement = target.parentNode;
	                    var schemeId = parentElement.getAttribute("data-scheme-id");
	                    layer.close(deletePlan);
	                    $http.delete($rootScope.restful_api.single_schedule_plan + schemeId).then(function () {
	                        $scope.planList.forEach(function (item, index) {
	                            if (item.schemeId == schemeId) {
	                                $scope.planList.splice(index, 1);
	                            }
	                        });
	                        //没有方案时，不需要执行
	                        if ($scope.planList.length != 0) {
	                            $scope.lookPlan($scope.planList[0].schemeId);
	                        }
	                    }, function () {
	                        info.fail("删除方案失败，请检查服务器");
	                    });
	                }, function () {
	                    layer.close(deletePlan);
	                });
	            })();
	        }
	    };

	    /**
	     * 排程方案界面 选择规则目录下拉选择查看排程规则
	     * @param ruleId,ruleName,event: 规则ID 规则名字 event
	     * @return 页面渲染所需数据
	     */
	    $scope.viewRule = function (ruleId, ruleName, event) {
	        $http.get($rootScope.restful_api.single_schedule_rule + ruleId).then(function (res) {
	            $scope.setCheckData(res.data);
	            var lookRule = layer.open({
	                type: 1,
	                title: ruleName,
	                area: ["900px", "750px"],
	                skin: 'viewRuleBox',
	                content: $(".layerBox"),
	                success: function success() {
	                    $(".viewRuleBox .layui-layer-close1").hide();
	                    $scope.viewRuleShow = true;
	                    $(".viewRuleBox").click(function (e) {
	                        // e.preventDefault();
	                        // return false;
	                    });
	                    $("body").on("click", ".save-sort", function () {
	                        layer.close(lookRule);
	                        $timeout(function () {
	                            $scope.viewRuleShow = false;
	                        });
	                    });
	                }
	            });
	        });
	        event.stopPropagation();
	    };

	    /**
	     * 根据排程数据渲染页面
	     * @param res: 获得到的排程规则数据
	     * @return 页面渲染所需数据
	     */
	    $scope.setCheckData = function (res) {
	        $scope.scheduleCheckData = $.extend({}, res);
	        $scope.scheduleFrontData = scheduleTableViewModelService.validation_rules_from(res); //获得排程前需要的数据
	        $scope.scheduleLaterData = scheduleTableViewModelService.validation_rules_later(res); //获得排程后需要的数据
	        //设置选中的option
	        $scope.schedulePointSelected = $scope.scheduleCheckData.schedulePoint;
	        $scope.papTypeSelected = $scope.scheduleCheckData.papType;
	        $scope.schedulePeriodSelected = $scope.scheduleCheckData.schedulePeriod;
	        setTimeout(function () {
	            Array.prototype.forEach.call($("dd.relative span"), function (item) {
	                var text = $(item).siblings("select").find("option:selected").text();
	                $(item).text(text);
	            });
	        }, 0);
	        //当前日期前的车间计划
	        if (!$scope.scheduleCheckData.isLoadOverduePoolTask) {
	            $("input[name=overduePeriod]").attr("disabled", "disabled");
	        } else {
	            $("input[name=overduePeriod]").removeAttr("disabled");
	        }
	    };

	    //初始化车间树==查看不同计划时调用
	    $scope.setWorkshop = function () {
	        //清空痕迹
	        $("#workshop").find("i").attr("class", "select-status unselect");
	        $("#workshop").find("ul ul span").removeClass("item-select");
	        //第一次进入，没有数据
	        if (!$scope.locationRuleList) {
	            return;
	        }
	        $scope.locationRuleList.forEach(function (item) {
	            var selectI = $("#workshop").find("i[location-id=" + item.locationId + "]");
	            selectI.siblings("span").addClass("item-select");
	            selectI.attr("class", "select-status selected").parent().parent().prev().children("i").addClass("select-some");
	            if (item.locationId.length == 4) {
	                selectI.parent().next().find("i").attr("class", "select-status selected disabled");
	            }
	        });
	    };

	    /**
	     * 保存显示项发送数据
	     * @param str: 错误时提示
	     * @return 发送的数据
	     */
	    var getDisplayPostData = function getDisplayPostData(str) {
	        var resData = $scope.columnContentData;
	        var selectValue = [];
	        //获得选中的li
	        $("#sort-item").find("li").each(function () {
	            var attr = $(this).attr("data-keyname");
	            selectValue.push(attr);
	        });
	        if (selectValue.length <= 0) {
	            info.fail(str);
	            return false;
	        }
	        //新建一个需要发送的数据
	        var postData = {};
	        postData.optionList = resData.optionList;
	        postData.selectList = [];
	        for (var i = 0, length = selectValue.length; i < length; i++) {
	            for (var j = 0, len = resData.optionList.length; j < len; j++) {
	                var compareOptionText = resData.optionList[j].valueContent.replace(":desc", "");
	                if (compareOptionText == selectValue[i].replace(":desc", "")) {
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
	    var setDisplayGetData = function setDisplayGetData(res) {
	        $scope.columnContentData = res.data;
	        $scope.userConfigData = scheduleTableViewModelService.sortItem($scope.columnContentData); //获得返回到左边显示的项目
	        $scope.userSelectConfigData = scheduleTableViewModelService.sortSelectItem($scope.columnContentData); //获得返回到右边显示的项目
	    };

	    /**
	     * 同级列表全部选中时，左侧列变为父级一个出现，移除所有同级的车间展示
	     * @param target: 点击的元素
	     * @return
	     */
	    var secondToFirst = function secondToFirst(target) {
	        var parentUl = target.parentNode.parentNode;
	        var unSelected = parentUl.getElementsByClassName("unselect");
	        //如果全部选中，父级变为选中，左侧列表只显示父级
	        if (unSelected.length <= 0) {
	            //设置为不选，。然后点击调用方法，全部选中
	            //判断是否为第一级春风车间
	            if (parentUl.previousElementSibling) {
	                parentUl.previousElementSibling.firstElementChild.className = "select-status unselect";
	                parentUl.previousElementSibling.firstElementChild.click();
	                Array.prototype.forEach.call(parentUl.getElementsByTagName("i"), function (item, index) {
	                    item.className += " disabled";
	                });
	            }
	            layer.msg("已合并为上一级车间", { time: 2000 });
	            // let id = parentUl.previousElementSibling.firstElementChild.getAttribute("location-id");
	        }
	    };
	    $("body")
	    //选择添加/删除车间
	    .on("click", "#workshop .select-status", function (event) {
	        var e = event || window.event;
	        var target = e.target || e.srcElement;
	        var id = target.getAttribute("location-id");
	        var firstRule = $scope.ruleList[0];
	        var containMenu = false; //点击车间是否由子车间已经被选择了
	        //判断有没有排程规则
	        if (!firstRule) {
	            layer.alert("请先添加排程规则");
	        }
	        //子列表变为不可编辑状态
	        //临时代码===判断是否为二级树===原因：树的结构一开始设计的不对
	        if (id.length <= 4) {
	            $(target).parent().next().find("i").addClass("disabled");
	        }
	        //开始添加,先判断是否有车间,没有车间直接添加
	        if (!$scope.locationRuleList.length) {
	            $scope.locationRuleList.push({
	                locationId: id,
	                locationName: target.nextElementSibling.innerHTML,
	                ruleName: firstRule ? firstRule.ruleName : "请选择排程规则",
	                ruleId: firstRule ? firstRule.ruleId : ""
	            });
	        } else {
	            //=====判断点击车间是够已经被选择
	            var repeatLocationId = $scope.locationRuleList.every(function (item, index, arr) {
	                if (item.locationId == id) {
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
	            if (repeatLocationId) {
	                //点击一级之后取消所有二级(有选中的二级情况下)
	                for (var i = $scope.locationRuleList.length - 1; i >= 0; i--) {
	                    if ($scope.locationRuleList[i].locationId.slice(0, id.length) == id) {
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
	                if (target.parentNode.nextElementSibling && target.parentNode.nextElementSibling.nodeName === "UL") {
	                    Array.prototype.forEach.call(target.parentNode.nextElementSibling.getElementsByClassName("select-status"), function (item, index) {
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
	    //pap决定起排工序
	    .on("click", ".pap-type li", function () {
	        if ($(this).attr("data-value") == "PAP_DISABLE") {
	            $timeout(function () {
	                // $scope.disable.schedulePointSelected = true;
	                $scope.notEdit.schedulePointSelected = true;
	                $(".schedule-point li").eq(0).trigger("click");
	            });
	        } else if ($(this).attr("data-value") == "PAP_SCHEDULE_RULE") {
	            $timeout(function () {
	                // $scope.disable.schedulePointSelected = false;
	                $scope.notEdit.schedulePointSelected = true;
	                $(".schedule-point li").eq(2).trigger("click");
	            });
	        } else {
	            $timeout(function () {
	                $scope.disable.schedulePointSelected = false;
	                $scope.notEdit.schedulePointSelected = false;
	            });
	        }
	    })
	    //合并项下拉代码
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
	    })
	    //排程方案下拉代码
	    .on("click", ".workshop-ruleNav li", function (e) {
	        $(this).parent().siblings("a").text($(this).text());
	        $(this).parent().siblings("a").attr("data-rule-id", $(this).attr("data-rule-id"));
	        $(this).parents(".workshop-ruleNav").removeClass("active");
	        e.stopPropagation();
	    }).on("click", ".workshop-ruleNav", function () {
	        $(this).toggleClass("active");
	    }).on("mouseleave", ".workshop-ruleNav.workshop-ruleNav", function () {
	        $(this).removeClass("active");
	    });

	    var createWorlshop = function createWorlshop() {
	        ulHtml = '<ul class="root">';
	        //为了存储树形数据，减少发送请求
	        //因为angular中的http代码异步排在最后，所以不得不再写一份在http里，如果不写，会先执行操作，然后最后发送http
	        if (!$scope.resWorkshop) {
	            $http.get($rootScope.restful_api.get_new_location).then(function (res) {
	                $scope.resWorkshop = res.data;
	                creatUl($scope.resWorkshop);
	                //添加到DOM
	                $(".ul-box").append($(ulHtml));
	                //打开和收起
	                $(".title span").on("click", function () {
	                    if ($(this).parent().next().css("display") == "block") {
	                        $(this).parent().next().hide();
	                        $(this).removeClass("title-close").addClass("title-open");
	                    } else {
	                        $(this).parent().next().show();
	                        $(this).removeClass("title-open").addClass("title-close");
	                    }
	                })
	                //打开第一级
	                .click();
	                $(".root").children(".title").find("span").click();
	            }, function (res) {
	                layer.alert("读取车间失败，请检查服务器");
	            });
	        } else {
	            creatUl($scope.resWorkshop);
	            //添加到DOM
	            $(".ul-box").append($(ulHtml));
	            //打开和收起
	            $(".title span").on("click", function () {
	                if ($(this).parent().next().css("display") == "block") {
	                    $(this).parent().next().hide();
	                    $(this).removeClass("title-close").addClass("title-open");
	                } else {
	                    $(this).parent().next().show();
	                    $(this).removeClass("title-open").addClass("title-close");
	                }
	            })
	            //打开第一级
	            .click();
	            $(".root").children(".title").find("span").click();
	        }
	    };
	    /**
	     *根据点击的车间树获得相应的车间ID
	     * @param e: 点击的事件源
	     * @return 车间ID
	     */
	    var getLocationId = function getLocationId(e) {
	        $(".js-move").remove();
	        var target = e.target;
	        Array.prototype.forEach.call(document.querySelectorAll(".select-status"), function (item) {
	            item.className = "select-status unselect";
	        });
	        target.className = "select-status selected";
	        return target.getAttribute("location-id");
	    };

	    //拖拽区域进行初始化
	    function clickliGetItem() {
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
	    }
	}]);
	//判断是否为空对象
	function isEmptyObject(obj) {
	    for (var i in obj) {
	        return false;
	    }
	    return true;
	}
	//得到需求数据
	function getData(locationData) {
	    var arr = [];
	    for (var name in locationData) {
	        var obj = {
	            name: locationData[name].locationName,
	            "locationId": locationData[name].locationId
	        };
	        arr.push(obj);
	        if (!isEmptyObject(locationData[name]["nextLevelLocation"])) {
	            obj.children = getData(locationData[name]["nextLevelLocation"]);
	        }
	    }
	    return arr;
	}
	/**
	 * 创建树状图
	 * @param {Object} 后台的JSON数据
	 */
	//地点信息
	// var locationInfo;
	//dom结构
	// var optionHtml = '<select id="test-select" multiple="multiple">';
	var ulHtml;
	//选中状态
	var UNSELECT = "unselect",
	    SELECTED = "selected",
	    SELECTSOME = "select-some",
	    SELECTSTATUS = "select-status";
	function creatUl(obj, fatherRule) {
	    for (var i in obj) {
	        var thisOption = obj[i],
	            hasApsRule = thisOption.hasApsRule,
	            isChosen = thisOption.isChosen,
	            locationId = thisOption.locationId,
	            locationName = thisOption.locationName,
	            nextLevelLocation = thisOption.nextLevelLocation;

	        var choose = "";
	        var hasRule = "";
	        //是否已选择
	        if (isChosen) {
	            choose = SELECTED;
	        } else {
	            choose = UNSELECT;
	        }
	        //若父级有排程规则，则子级必定可操作
	        if (fatherRule) {
	            hasApsRule = true;
	        }
	        //是否有排程规则
	        if (!hasApsRule) {
	            //hasRule = " disabled";
	        }

	        if ($.isEmptyObject(nextLevelLocation)) {
	            ulHtml += '<li class="item"><i class="select-status ' + choose + hasRule + '" location-id="' + locationId + '"></i><span class="location-name">' + locationName + '</span></li>';
	        } else {
	            ulHtml += '<li class="title"><i class="select-status ' + choose + hasRule + '" location-id="' + locationId + '"></i><span class="location-name title-close">' + locationName + '</span></li><ul>';
	            creatUl(nextLevelLocation, hasApsRule);
	        }
	    }
	    ulHtml += '</ul>';
	}

	/**
	 * 更新选择状态
	 * @param thisSelect 当前点击的项
	 */
	function selectStatusChange(thisSelect) {
	    // let thisSelect = thisSelect;
	    // let thisFatherUl = thisSelect.parents("ul");

	    var thisNextUl = thisSelect.parent().next("ul");

	    //本身及所有后代的改变
	    if (thisSelect.hasClass(UNSELECT) || thisSelect.hasClass(SELECTSOME)) {
	        thisSelect.removeClass(UNSELECT).removeClass(SELECTSOME).addClass(SELECTED);
	        if (thisSelect.parent().hasClass("item")) {
	            thisSelect.next().addClass("item-select");
	        }
	        thisNextUl.find("." + SELECTSTATUS).removeClass(UNSELECT).removeClass(SELECTSOME).addClass(SELECTED);
	        thisNextUl.find(".item span").addClass("item-select");
	    } else {
	        thisSelect.removeClass(SELECTED).addClass(UNSELECT);
	        if (thisSelect.parent().hasClass("item")) {
	            thisSelect.next().removeClass("item-select");
	        }
	        thisNextUl.find("." + SELECTSTATUS).removeClass(SELECTED).addClass(UNSELECT);
	        thisNextUl.find(".item span").removeClass("item-select");
	    }

	    //处于其影响范围内的祖先的改变
	    thisSelect.parents("ul").each(function () {
	        var thisUl = $(this);
	        var thisUlPrev = thisUl.prev().find("." + SELECTSTATUS);

	        if (thisUl.find("." + SELECTED).length < 1) {
	            thisUlPrev.removeClass(SELECTSOME).removeClass(SELECTED).addClass(UNSELECT);
	        } else if (thisUl.find("." + UNSELECT).length < 1) {
	            thisUlPrev.removeClass(SELECTSOME).removeClass(UNSELECT).addClass(SELECTED);
	        } else {
	            thisUlPrev.removeClass(UNSELECT).removeClass(SELECTED).addClass(SELECTSOME);
	        }
	    });
	}

/***/ }
/******/ ]);