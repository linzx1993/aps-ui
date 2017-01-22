/**
 * Created by yiend on 2017/1/16.
 */
app.controller("ruleController",["$rootScope","$scope","$http","$timeout","scheduleTableViewModelService","dataService","tool", function($rootScope,$scope,$http,$timeout,scheduleTableViewModelService,dataService,tool){
    $scope.columnWorkshop = false;
        $scope.disable = {
            schedulePointSelected : false,//pap排程规则下拉列表==>
            scheduleInterval : false//排程周期 ==>
        };
        $scope.notEdit = {
            schedulePointSelected : false,
            scheduleInterval:false
        };
    // $scope.ruleList = dataService.ruleList;
    $http.get($rootScope.restful_api.all_schedule_rule)
        .success((res) => {
            $scope.ruleList = $.extend([],res);
            //如果有规则，显示第一条排程规则
            if($scope.ruleList[0]){
                $scope.ruleId = $scope.ruleList[0].ruleId;
                $http.get($rootScope.restful_api.single_schedule_rule+$scope.ruleId)
                    .success((res) => {
                        $scope.setCheckData(res);
                    })
                    //表单初始化
                    .then(function () {
                        //设置pap排程规则
                        if($scope.scheduleCheckData.papType == "PAP_DISABLE"){
                            $scope.disable.schedulePointSelected = true;
                            $scope.notEdit.schedulePointSelected = true;
                        }else if($scope.scheduleCheckData.papType == "PAP_SCHEDULE_RULE"){
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
                        // document.getElementById("scheduleInterval").onkeyup = function () {
                        //     if (this.value.length == 1) {
                        //         this.value = this.value.replace(/[^0-9]/g, '')
                        //     } else {
                        //         this.value = this.value.replace(/\D/g, '')
                        //     }
                        //     if (this.value > 90) {
                        //         this.value = 90;
                        //     }
                        // };
                        // document.getElementById("freezePeriod").onkeyup = function () {
                        //     if (this.value.length == 1) {
                        //         this.value = this.value.replace(/[^1-9]/g, '')
                        //     } else {
                        //         this.value = this.value.replace(/\D/g, '')
                        //     }
                        //     if (this.value > 90) {
                        //         this.value = 90;
                        //     }
                        // };
                        //当前日期前的车间计划
                        if(!$scope.scheduleCheckData.isLoadOverduePoolTask) {
                            $("input[name=overduePeriod]").attr("disabled", "disabled");
                        }else{
                            $("input[name=overduePeriod]").removeAttr("disabled");
                        }
                    })
                    //表单验证及相关逻辑联动
                    .then(function(){
                        //用于修改点击label会触发input点击导致两次的bug
                        let a = 0;
                        $("label[for=isLoadOverduePoolTask]").on("click",function(){
                            a += 2;
                            if(a%4 === 0){
                                $("input[name=overduePeriod]").attr("disabled",!$("input[name=overduePeriod]").prop("disabled"))
                            }
                        });
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
        })
        .error(() => {
            info.fail("请求规则失败，请检查服务器");
            $scope.ruleList = [];
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
        var $radio = $('input[type=radio],input[type=checkbox]',this);
        $.each($radio,function(){
            if(!o.hasOwnProperty(this.name)){
                o[this.name] = false;
            }
        });
        return o;
    };

    /**排程前校验，排程后校验点击保存进行发送数据**/
    $scope.saveCheckConfig = () => {
        //=========先判断表单是否为空
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
        let post = getFromValue($scope.scheduleCheckData,$("form").serializeObject());
        //获取不到日历插件的值，手工获取
        post.minScheduleDay = $("#minScheduleDay").val();
        //发送数据
        $http.put($rootScope.restful_api.single_schedule_rule + $scope.ruleId,post)
            .then(function(response){
                if(response.data.error_response){
                    info.fail("数据保存失败");
                }else{
                    info.success("数据保存成功");
                }
            },function(){
                info.fail("数据保存失败,请检查服务器");
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
        $http.get($rootScope.restful_api.single_schedule_rule + $scope.ruleId)
            .success((res) => {
                $scope.scheduleCheckData = res;
            })
            .error(() => {layer.msg("创建新规则失败，请检查网络")})
            //再获得对应的数据,then create Rule
            .then(() => {
                //删除获取到的Id,post创建规则
                delete $scope.scheduleCheckData.ruleId;
                $scope.scheduleCheckData.ruleName = $scope.newRuleName;
                $http.post($rootScope.restful_api.single_schedule_rule,$scope.scheduleCheckData)
                    .success((res) => {
                        $scope.ruleId = res;
                        $scope.ruleList.push({
                            "ruleId" : res,
                            "ruleName" : $scope.scheduleCheckData.ruleName
                        });
                        $scope.setCheckData($scope.scheduleCheckData);
                        $scope.newRuleName = "";
                        layer.closeAll();
                    })
                    .error(() => {info.fail("创建规则失败-post");})
            })
    };

    //查看规则
    $scope.lookRule = (id) =>{
        $http.get($rootScope.restful_api.single_schedule_rule+id)
            .then((res) => {
                $scope.ruleId = id;
                $scope.setCheckData(res.data);
            })
    };

    //删除排程规则
    $scope.deleteRule = (event) =>{
        // event.stopPropagation();
        let deleteRule = layer.confirm('确定删除此排程规则？', {
            btn: ['确定','取消'] //按钮
        }, function(){
            let target = event.target || event.srcElement;
            let parentElement = target.parentNode
            let ruleId = parentElement.getAttribute("data-rule-id");
            layer.close(deleteRule);
            $http.delete($rootScope.restful_api.single_schedule_rule + ruleId)
                .then((res) => {
                    //成功返回
                    console.log(res.data);
                    if(res.data == "1"){
                        $scope.ruleList.forEach(function(item,index){
                            if(item.ruleId == ruleId){
                                $scope.ruleList.splice(index,1);
                            }
                        });
                        //没有规则时，不需要执行
                        if($scope.ruleList.length != 0){
                            $scope.lookRule($scope.ruleList[0].ruleId);
                        }
                    } else if(res.data.error_response.code == "102"){
                        info.fail("你没有权限删除此规则");
                        // return
                    } else if(res.data.error_response.code == "103"){
                        info.fail("此规则正在使用，无法删除");
                        // return
                    }
                },function(){
                    info.fail("删除规则失败，请检查服务器")
                })
        }, function(){
            layer.close(deleteRule);
        });

    };

    $rootScope.jExpertConfiguration = false;
    $scope.toggleAdvancedShow = function(){
        $scope.jAdvancedConfiguration = !$scope.jAdvancedConfiguration;
    };
    $scope.toggleExpertShow = function(){
        $scope.jExpertConfiguration = !$scope.jExpertConfiguration;
    };
    $scope.hideAdvancedConfig = function () {
        $scope.jExpertConfiguration = $scope.jAdvancedConfiguration = false;
    };
    $("body")
    //pap决定起排工序
        .on("click",".pap-type li",function(){
            if($(this).attr("data-value")=="PAP_DISABLE"){
                $timeout(function(){
                    $scope.disable.schedulePointSelected = true;
                    $scope.notEdit.schedulePointSelected = true;
                    $(".schedule-point li").eq(0).trigger("click");
                })
            }else if($(this).attr("data-value")=="PAP_SCHEDULE_RULE"){
                $timeout(function(){
                    $scope.disable.schedulePointSelected = false;
                    $scope.notEdit.schedulePointSelected = true;
                    $(".schedule-point li").eq(2).trigger("click");
                })
            }else{
                $timeout(function(){
                    $scope.disable.schedulePointSelected = false;
                    $scope.notEdit.schedulePointSelected = false;
                })
            }
        })
        //排程周期决定排程间隔
        .on("click",".schedulePeriod li",function(){
            if($(this).attr("data-value")=="BY_DAY"){
                $timeout(function(){
                    $scope.disable.scheduleInterval = false;
                    $scope.notEdit.scheduleInterval = false;
                })
            }else{
                $timeout(function(){
                    $scope.disable.scheduleInterval = true;
                    $scope.notEdit.scheduleInterval = true;
                })
            }
        })
}]);