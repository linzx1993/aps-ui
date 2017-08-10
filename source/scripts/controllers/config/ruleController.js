/**
 * Created by yiend on 2017/1/16.
 */
app.controller("ruleController",["$rootScope","$scope","$http","$timeout","scheduleTableViewModelService","tool","http", function($rootScope,$scope,$http,$timeout,scheduleTableViewModelService,tool,http){
    //-----本页面相关初始化操作-----
    $scope.configNav.activeNav = ".rule";//配置选项栏设置active的class
    $scope.$parent.showManage = false;//管理目录的垃圾桶删除按钮消失

    $scope.disable = {
        schedulePointSelected : false,//pap排程规则下拉列表==>
        scheduleInterval : false//排程周期 ==>
    };
    $scope.notEdit = {
        schedulePointSelected : false,
        scheduleInterval:false
    };
    //-----本页面相关初始化操作-----

    http.get({
        url: $rootScope.restful_api.all_schedule_rule,
        successFn: (res) => {
            res = res.data;
            $scope.ruleList = $.extend([],res);
            //如果有规则，显示第一条排程规则
            if($scope.ruleList[0]){
                $scope.ruleId = $scope.ruleList[0].ruleId;
                http.get({
                    url: $rootScope.restful_api.single_schedule_rule+$scope.ruleId,
                    successFn: (res) => {
                        $scope.rule = $scope.ruleList[0];
                        $scope.renderRulePage(res.data);
                    }
                })
                //表单初始化
                    .then(function () {
                        //设置pap排程规则
                        if($scope.scheduleCheckData.papType === "PAP_DISABLE"){
                            $scope.disable.schedulePointSelected = true;
                            $scope.notEdit.schedulePointSelected = true;
                        }else if($scope.scheduleCheckData.papType === "PAP_SCHEDULE_RULE"){
                            $scope.disable.schedulePointSelected = false;
                            $scope.notEdit.schedulePointSelected = true;
                        }
                        //设置下拉选中值,初始化时间框
                        setTimeout(function(){
                            Array.prototype.forEach.call($("dd.relative span"),function(item){
                                let text = $(item).siblings("select").find("option:selected").text();
                                $(item).text(text);
                            })
                        },0);
                        $("#freezePeriod,#scheduleInterval")
                            .keyup(function () {
                                if (this.value.length === 1) {
                                    this.value = this.value.replace(/[^0-9]/g, '')
                                } else {
                                    this.value = this.value.replace(/\D/g, '')
                                }
                                if (this.value > 90) {
                                    this.value = 90;
                                }
                            })
                            .blur(function(){
                                if(!this.value){
                                    this.value = 0;
                                }
                            });

                        let regex = /(^[1-8][0-9]$)|(^[1-9]$)$/;
                        $("#overduePeriod")
                            .keyup(function () {
                                if (this.value.length === 1) {
                                    this.value = this.value.replace(/[^1-9]/g, '')
                                } else {
                                    this.value = this.value.replace(/\D/g, '')
                                }
                                if (this.value > 90) {
                                    this.value = 90;
                                }
                            })
                            .blur(function(){
                                if(!this.value){
                                    this.value = 1;
                                }
                            });
                    })
                    //表单验证及相关逻辑联动
                    .then(function(){
                        let regex = /^(\d{1,2}(\.\d{1})?|100)$/;//只能输入大于0小于100的数字
                        $(".jScheduleWeightMap input").each(function(){
                            $(this).keyup(function(){
                                if(!$(this).val()){
                                    $(this).addClass("error").siblings("b").show().text("输入项不能为空");
                                } else if(!regex.test($(this).val())){
                                    $(this).addClass("error").siblings("b").show().text("输入项不符合规则");
                                } else {
                                    $(this).removeClass("error").siblings("b").hide();
                                }
                            })
                        })
                    })
            }
        },
        errorFn: () => {
            $scope.info.fail("请求规则失败，请检查服务器");
            $scope.ruleList = [];
        }
    });


    //判断需要发送的数据要保存的属性
    function getFromValue(postData,searchObj){
        for(let name in postData){
            //如果这个属性是对象的话
            if(typeof postData[name] === "object"){
                getFromValue(postData[name],searchObj)
            }else{
                //如果序列化结果没有这个属性的话，例如userId,ruleId
                if(searchObj[name] === undefined){
                }else{
                    //boolean属性判断,on或者ng-checked表示选中
                    if(searchObj[name] === "on" || searchObj[name] === "ng-checked"){
                        postData[name] = true;
                    }
                    //为false，表示表单未选中
                    else if(!searchObj[name]){
                        postData[name] = false;
                    }else{
                        postData[name] = searchObj[name];
                    }
                }
            }
        }
        return postData;
    }

    //表单序列化
    $.fn.serializeObject = function () {
        let o = {};
        let a = this.serializeArray();
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

        let $radio = $('input[type=radio],input[type=checkbox]',this);
        $.each($radio,function(){
            if(!o.hasOwnProperty(this.name)){
                o[this.name] = false;
            }
        });
        return o;
    };

    //排程规则栏为点击的规则添加选中的active
    $scope.isRuleActive = function(val){
        return $scope.ruleNav.active ===  val;
    };

    /**点击保存排程规则**/
    $scope.saveCheckConfig = () => {
        //排程规则名字不可为空
        let ruleName = $(".rule-name input").val();
        if(!ruleName){
            layer.alert("排程规则名不可为空");
            return;
        }
        //=========判断表单是否为空
        let validata = true;
        //执行判断
        (function (){
            let regex = /^(\d{1,2}(\.\d{1})?|100)$/;//只能输入大于0小于100的数字
            //foreach无法跳出循环,每项都显示
            Array.prototype.forEach.call(document.getElementsByClassName("jScheduleWeightMap")[0].getElementsByClassName("require"),function(item,index){
                //如果没填写
                if(!item.value){
                    $(item).addClass("error").siblings("b").show().text("输入项不能为空");
                    //获取提示文字，去除文字和冒号
                    // let tipWord = item.parentNode.previousElementSibling.innerText.slice(1,-2);
                    validata = false;
                }else{
                    //如果输入项不符合规则的话
                    if(regex.test(item.value)){
                        $(item).removeClass("error").siblings("b").hide();
                    }else{
                        //如果填写不正确
                        validata = false;
                        $(item).addClass("error").siblings("b").show().text("输入项不符合规则");
                    }
                }
            });
        }());
        //如果有错直接返回
        if(!validata){
            return false;
        }
        //表单序列化获得需要发送的数据
        let post = getFromValue($scope.scheduleCheckData,$("form").serializeObject());
        //表单序列化获取不到日历插件的值，手工获取
        post.minScheduleDay = $("#minScheduleDay").val();
        //获取规则名字
        post.ruleName = ruleName;
        //发送数据
        http.put({
            url: $rootScope.restful_api.single_schedule_rule + $scope.ruleId,
            data: post,
            successFn: function(res){
                if(res.data.error_response){
                    $scope.info.fail("数据保存失败");
                }else{
                    $scope.info.success("数据保存成功");
                }
            },
            errorFn: function(){
                $scope.info.fail("数据保存失败,请检查服务器");
            }
        });
    };

    //弹出新建排程规则窗口
    $scope.openRuleWindow = () =>{
        let index = layer.open({
            type: 1,
            title: false,
            closeBtn: 0,
            shadeClose: true,
            skin: 'yourclass',
            content: $(".addNewRule"),
            success : ()=> {
                $(".addNewRule").on("click",".close,.cancal",function(){
                    layer.close(index);
                })
            }
        })
    };

    //发送新建规则请求
    $scope.postNewRule = () =>{
        //检测是否重名
        if(!$scope.newRuleName){
            layer.msg('请输入正确的排程规则名');
            return false;
        }
        if(!tool.checkRepeatName($scope.newRuleName,$scope.ruleList,"rule")){
            layer.msg('排程规则名重复，请重新输入');
            return;
        }
        //判断用户是否选了规则,没选设置为默认规则
        $scope.ruleId = $("#ruleSelect").val() === "0" ? "default" : $("#ruleSelect").val();
        http.get({
            url: $rootScope.restful_api.single_schedule_rule + $scope.ruleId,
            successFn: (res) => {
                $scope.scheduleCheckData = res.data;
                $scope.info.success("创建排程规则成功")
            },
            errorFn: () => {$scope.info.fail("创建排程规则失败，请检查网络")}
        })
        //再获得对应的数据,then create Rule
            .then(() => {
                //删除获取到的Id,post创建规则
                delete $scope.scheduleCheckData.ruleId;
                $scope.scheduleCheckData.ruleName = $scope.newRuleName;
                http.post({
                    url: $rootScope.restful_api.single_schedule_rule,
                    data: $scope.scheduleCheckData,
                    successFn: (res) => {
                        res = res.data;
                        $scope.ruleId = res;
                        $scope.ruleList.push({
                            "ruleId" : res,
                            "ruleName" : $scope.scheduleCheckData.ruleName
                        });
                        $scope.renderRulePage($scope.scheduleCheckData);
                        $scope.newRuleName = "";
                        layer.closeAll();
                        //最后一个li获得actice的状态
                        $timeout(function () {
                            $scope.lookRule($scope.ruleList[$scope.ruleList.length - 1]);
                            $(".check-rule-nav .rule-li").last().addClass("active").siblings().removeClass("active");
                        },0);
                    },
                    errorFn: () => {$scope.info.fail("创建规则失败-post");}
                });
            })
    };

    //查看规则
    $scope.lookRule = (rule) => {
        $scope.rule = rule;
        http.get({
            url: $rootScope.restful_api.single_schedule_rule + rule.ruleId,
            successFn: (res) => {
                $scope.ruleId = rule.ruleId;
                //渲染规则页面数据
                $scope.renderRulePage(res.data);
            }
        });
    };

    //删除排程规则
    $scope.deleteRule = (event) =>{
        event.stopPropagation();
        let deleteRule = layer.confirm('确定删除此排程规则？', {
            btn: ['确定','取消'] //按钮
        }, function(){
            let target = event.target || event.srcElement;
            let parentElement = target.parentNode;
            let ruleId = parentElement.getAttribute("data-rule-id");
            layer.close(deleteRule);
            http.delete({
                url: $rootScope.restful_api.single_schedule_rule + ruleId,
                successFn: (res) => {
                    //成功返回
                    if(res.data == "1"){
                        $scope.ruleList.forEach(function(item,index){
                            if(item.ruleId == ruleId){
                                $scope.ruleList.splice(index,1);
                            }
                        });
                        $scope.info.success("删除排程规则成功");
                        //删除成功，查看第一个排程规则，没有规则时，不需要执行
                        if($scope.ruleList.length != 0){
                            $timeout(function () {
                                $(".check-rule-nav .rule-li").first().addClass("active").siblings().removeClass("active");
                            },0);
                            $scope.lookRule($scope.ruleList[0]);
                        }
                    }
                },
                errorFn: function(res){
                    if(res.data.error_response.code === 102){
                        $scope.info.fail("你没有权限删除此规则");
                        // return
                    } else if(res.data.error_response.code === 103){
                        $scope.info.fail("此规则正在使用，无法删除");
                        // return
                    }else{
                        $scope.info.fail("删除规则失败，请检查服务器")
                    }
                }
            });
        }, function(){
            layer.close(deleteRule);
        });

    };

    //显示规则时，js设置目录栏高度,使左边目录栏的高度可以撑满整个div
    //展开规则时，实时获取规则高度设置，收起时，保证不小于规则最小区域
    $scope.setCheckRuleHeight = function () {
        $timeout(function () {
            let checkContentHeight = $(".checkContent").height();
            let configFormHeight = $(".config-form").height();
            $(".check-rule-nav").height(configFormHeight <= checkContentHeight ? checkContentHeight - $(".config-content-title").height() : configFormHeight);
        })
    };

    //显示隐藏高级规则---start
    $rootScope.jExpertConfiguration = false;
    $scope.toggleAdvancedShow = function(){
        $scope.jAdvancedConfiguration = !$scope.jAdvancedConfiguration;
        return $scope.setCheckRuleHeight()
    };

    $scope.toggleExpertShow = function(){
        $scope.jExpertConfiguration = !$scope.jExpertConfiguration;
        return $scope.setCheckRuleHeight()
    };
    $scope.hideAdvancedConfig = function () {
        $scope.jExpertConfiguration = $scope.jAdvancedConfiguration = false;
        return $scope.setCheckRuleHeight()
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
