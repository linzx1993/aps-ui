/**
 * Created by yiend on 2017/1/16.
 */
app.controller("ruleController",["$rootScope","$scope","$http","$timeout","scheduleTableViewModelService","tool","http", function($rootScope,$scope,$http,$timeout,scheduleTableViewModelService,tool,http){
    //-----本页面相关初始化操作-----
    $scope.configNav.activeNav = ".rule";//配置选项栏设置active的class

	$scope.regex = {
		overduePeriod : /(^[1-9]$)|(^[1-8][0-9]$)|90$/,
		scheduleInterval : /(^[0-9]$)|(^[1-8][0-9]$)|90$/,
		freezePeriod : /(^[0-9]$)|(^[1-8][0-9]$)|90$/,
		colorTypes :　/[^0-9]/g
	};

    //请求所有的算法名称
    http.get({
        url: $rootScope.restful_api.get_all_Algorithm,
        successFn : (res) => {
            $scope.algorithmList = res.data;
        },
    });

    //获取所有规则
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
						$scope.currentRule = $scope.ruleList[0];
                        $scope.scheduleCheckData = res.data;

                        $scope.renderRulePage(res.data);

                        //================表单验证及相关逻辑联动
                        let scheduleWeightregex = /^(\d{1,2}(\.\d{1})?|100)$/;//只能输入大于0小于100的数字
                        $(".jScheduleWeightMap input").each(function(){
                            $(this).keyup(function(){
                                if(!$(this).val()){
                                    $(this).addClass("error").siblings("b").show().text("输入项不能为空");
                                } else if(!scheduleWeightregex.test($(this).val())){
                                    $(this).addClass("error").siblings("b").show().text("输入项不符合规则");
                                } else {
                                    $(this).removeClass("error").siblings("b").hide();
                                }
                            })
                        })
                    }
                })
            }
        },
        errorFn: () => {
			layer.msg('获取排程规则失败，请检查服务器', {time: 3000, icon: 2})
            $scope.ruleList = [];
        }
    });

    //判断需要发送的数据要保存的属性
    function getRuleFromValue(postData,searchObj){
        const itemMap = postData.itemMap;
        for(let name in searchObj){
            if(searchObj[name] === "on"){
                itemMap[name].itemValue = true;
            }
            //为false，表示表单未选中
            else if(!searchObj[name]){
                itemMap[name].itemValue = false;
            }else{

                itemMap[name].itemValue = searchObj[name];
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

    //修改算法改变规则列表
    $scope.changeAlgorithm = function (algorithm) {
		http.get({
			url: $rootScope.restful_api.single_schedule_rule + '/default/' + algorithm,
			successFn: function (res) {
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
	$scope.recordTemporaryRule = () => {
		//检测是否重名
		if(!$scope.newRuleName){
			layer.msg('请输入正确的排程规则名');
			return false;
		}
		if(!tool.checkRepeatName($scope.newRuleName,$scope.ruleList,"rule")){
			layer.msg('排程规则名重复，请重新输入');
			return;
		}
		layer.closeAll();
		// 判断用户是否选了规则,没选设置为默认规则，
		// 默认规则需要添加算法 2017-06-20
		let isSelectAlgorithm = $("#ruleSelect").val() === "0";
		$scope.ruleId = isSelectAlgorithm ? "default/" + $scope.algorithmList[0] : $("#ruleSelect").val();
		http.get({
			url: $rootScope.restful_api.single_schedule_rule + $scope.ruleId,
			successFn: (res) => {
				//如果选默认的，后台的返回值是排程规则配置项的map数据，而请求规则时，返回的是一个完整的排程规则数据
				if(isSelectAlgorithm){
					$scope.scheduleCheckData = {
						algorithmName : $scope.algorithmList[0],
						itemMap : res.data
					};
				}else{
					$scope.scheduleCheckData = res.data;
				}

				$scope.ruleId = "temporary" + new Date().getTime();
				$scope.currentRule = {
					"ruleId" : $scope.ruleId,
					"ruleName" : $scope.newRuleName
				};
				$scope.ruleList.push($scope.currentRule);
				$scope.temporaryRuleData[$scope.ruleId] = $scope.scheduleCheckData;

				$scope.renderRulePage($scope.scheduleCheckData);
				$scope.newRuleName = "";//清空新建规则弹出框的规则名字，便于下次新建规则

				//最后一个li获得active的状态
				$timeout(function () {
					$(".check-rule-nav .rule-li").last().addClass("active").siblings().removeClass("active");
				},0);
			},
			errorFn: () => {layer.msg('获取排程规则失败，请检查服务器', {time: 3000, icon: 2})}
		})
	};

	/**点击保存排程规则**/
	$scope.saveCheckConfig = () => {
		//排程规则名字不可为空
		let ruleName = $(".rule-name input").val();
		if(!ruleName){
			layer.msg('排程规则名不可为空',{icon : 2});
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

		//判断几个输入框是否符合正则----拉取当前车间计划天数
		if($("#overduePeriod").val() !== undefined && !$scope.regex.overduePeriod.test($("#overduePeriod").val())){
			layer.msg('请输入正确的拉取当前车间计划天数',{icon : 2});
			return;
		}
		//判断几个输入框是否符合正则----拉取当前车间计划天数
		if($("#scheduleInterval").val() !== undefined && !$scope.regex.scheduleInterval.test($("#scheduleInterval").val())){
			layer.msg('请输入正确的排程间隔天数',{icon : 2});
			return;
		}
		//判断几个输入框是否符合正则----拉取当前车间计划天数
		if($("#freezePeriod").val() !== undefined && !$scope.regex.freezePeriod.test($("#freezePeriod").val())){
			layer.msg('请输入正确的冻结期天数	',{icon : 2});
			return;
		}
		//判断几个输入框是否符合正则----单台涂装支持的颜色种类
		if(!$("#colorTypes").val() || $scope.regex.colorTypes.test($("#colorTypes").val())){
			layer.msg('请输入正确的单台涂装支持的颜色种类	',{icon : 2});
			return;
		}

		//表单序列化获得需要发送的数据
		let post = getRuleFromValue($scope.scheduleCheckData,$("form").serializeObject());

		//获取规则名字,算法名字
		post.ruleName = ruleName;
		post.algorithmName = $scope.algorithmName;

		//判断是新建规则还是更新规则
		if(($scope.ruleId + "").slice(0,9) === "temporary"){
			delete post.ruleId;
			//新建
			http.post({
				url: $rootScope.restful_api.single_schedule_rule,
				data: post,
				successFn: function(res){
					if(res.data.error_response){
						layer.msg('创建排程规则失败,请检查服务器', {time: 3000, icon: 2});
					}else{
						$scope.ruleId = $scope.currentRule.ruleId = res.data;
						layer.msg('创建排程规则成功', {time: 3000, icon: 1});
					}
				},
				errorFn: function(){
					layer.msg('排程规则更新失败,请检查服务器', {time: 3000, icon: 2});
				}
			});

		}else{
			//更新
			http.put({
				url: $rootScope.restful_api.single_schedule_rule + $scope.ruleId,
				data: post,
				successFn: function(res){
					if(res.data.error_response){
						layer.msg('排程规则更新失败', {time: 3000, icon: 2});
					}else{
						layer.msg('排程规则更新成功', {time: 3000, icon: 1});
					}
				},
				errorFn: function(){
					layer.msg('排程规则更新失败,请检查服务器', {time: 3000, icon: 2});
				}
			});
		}
	};

    //查看规则
    $scope.lookRule = (rule) => {
        $scope.currentRule = rule;
        $scope.ruleId = rule.ruleId;
        if((rule.ruleId + "").slice(0, 9) === "temporary"){
			$scope.renderRulePage($scope.temporaryRuleData[rule.ruleId]);
		}else{
			http.get({
				url: $rootScope.restful_api.single_schedule_rule + rule.ruleId,
				successFn: (res) => {
					//渲染规则页面数据
					$scope.scheduleCheckData = res.data;
					$scope.renderRulePage($scope.scheduleCheckData);
				}
			});
		}
    };

    //删除排程规则
    $scope.deleteRule = (event) =>{
        event.stopPropagation();
        let deleteRule = layer.confirm('确定删除此排程规则？', {
            btn: ['确定','取消'] //按钮
        }, function(){
            let ruleId = $(event.target).parent().attr("data-rule-id");
            layer.close(deleteRule);
            if((ruleId + "").slice(0, 9) === "temporary"){
				$timeout(() => {
					delete $scope.temporaryRuleData[ruleId];
					$scope.ruleList = $scope.ruleList.filter((item) => {
						return item.ruleId !== ruleId;
					});

					//删除成功，查看第一个排程规则，没有规则时，不需要执行
					if($scope.ruleList.length !== 0){
						$timeout(function () {
							$(".check-rule-nav .rule-li").first().addClass("active").siblings().removeClass("active");
						},0);
						$scope.lookRule($scope.ruleList[0]);
					}
				})
			}else{
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
							layer.msg('删除排程规则成功', {time: 3000, icon: 1});
							//删除成功，查看第一个排程规则，没有规则时，不需要执行
							if($scope.ruleList.length !== 0){
								$timeout(function () {
									$(".check-rule-nav .rule-li").first().addClass("active").siblings().removeClass("active");
								},0);
								$scope.lookRule($scope.ruleList[0]);
							}
						}
					},
					errorFn: function(res){
						if(res.data.error_response.code === 102){
							layer.msg('你没有权限删除此规则', {time: 3000, icon: 4});
						} else if(res.data.error_response.code === 103){
							layer.msg('此规则正在使用，无法删除', {time: 3000, icon: 4});
						}else{
							layer.msg('删除规则失败，请检查服务器', {time: 3000, icon: 2});
						}
					}
				});
			}
        }, function(){
            layer.close(deleteRule);
        });
    };

	//监听拉取当前车间计划天数
	$scope.testOverduePeriod = function (e) {
		let regex = /(^[1-9]$)|(^[1-8][0-9]$)|90$/;
		if(!regex.test($scope.scheduleCheckDataItemMap.overduePeriod.itemValue)){
			layer.msg("请输入正确的拉取当前车间计划天数",{icon : 2});
			// $(e.target).addClass("error");
		}
	};

    //监听冻结期的输入值是否符合标准
    $scope.testFreezePeriod = function (e) {
		let regex = /(^[0-9]$)|(^[1-8][0-9]$)|90$/;
		if(!regex.test($scope.scheduleCheckDataItemMap.freezePeriod.itemValue)){
			layer.msg("请输入正确的排程间隔天数",{icon : 2});
			// $(e.target).addClass("error");
		}
	};


    //监听排程间隔的输入值是否符合标准
    $scope.testScheduleInterval = function (e) {
		let regex = /(^[0-9]$)|(^[1-8][0-9]$)|90$/;
		if(!regex.test($scope.scheduleCheckDataItemMap.scheduleInterval.itemValue)){
			layer.msg("请输入正确的冻结期天数",{icon : 2});
			// $(e.target).addClass("error");
		}
	};


	//监听单台涂装支持的颜色种类的输入值是否符合标准
    $scope.testColorTypes = function () {
		$scope.scheduleCheckDataItemMap.colorTypes.itemValue = $scope.scheduleCheckDataItemMap.colorTypes.itemValue.replace(/[^0-9]/g, '')
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

	//显示隐藏高级规则，专家规则---start
	$rootScope.jExpertConfiguration = false;
	$scope.toggleAdvancedShow = function(){
		$scope.jAdvancedConfiguration = !$scope.jAdvancedConfiguration;
		return $scope.setCheckRuleHeight()
	};

	$scope.toggleExpertShow = function(){
		$scope.jExpertConfiguration = !$scope.jExpertConfiguration;
		return $scope.setCheckRuleHeight()
	};
	//显示隐藏高级规则,专家规则---end

	/*
	 * 监测排程前校验中的pap选项，checkbox为false将pap类型下拉框设置为不启用，否则反之
	 * 取消绑定，执行unbindWatchPap()
	 */
	$scope.$watch("scheduleCheckDataItemMap['preScheduleCheck.PAP_INFO_CHECKING'].itemValue",function (newValue,oldValue) {
		if(!$scope.scheduleCheckDataItemMap || !$scope.scheduleCheckDataItemMap.papType)return;
		//设置为true，启用默认规则
		if(newValue === true){
			if($scope.scheduleCheckDataItemMap.papType.itemValue !== "1"){
				$scope.scheduleCheckDataItemMap.papType.itemValue = "2";
			}
		}else {
			$scope.scheduleCheckDataItemMap.papType.itemValue = "0";
		}
	});

	$scope.$watch("scheduleCheckDataItemMap.papType.itemValue",function (newValue,oldValue) {
		if(!$scope.scheduleCheckDataItemMap || !$scope.scheduleCheckDataItemMap.schedulePoint)return;
		//设置为true，启用默认规则
		if(newValue !== "0"){
			$scope.scheduleCheckDataItemMap['preScheduleCheck.PAP_INFO_CHECKING'].itemValue = true;
			if(newValue === "1"){
				$scope.scheduleCheckDataItemMap.schedulePoint.itemValue = "3";
			}
		}else {
			$scope.scheduleCheckDataItemMap['preScheduleCheck.PAP_INFO_CHECKING'].itemValue = false;
		}
		$scope.disabledByPapType = $scope.scheduleCheckDataItemMap.papType.itemValue === '0';
		$scope.disabledByPapTypeValue = $scope.scheduleCheckDataItemMap.papType.itemValue === '1';
	});

    //==========================上线配置相关代码---start-=================//
    //查看设备初始状态
	//获取所有的地点
	http.get({
		url : $rootScope.restful_api.aps_location_readable,
		successFn : function (res) {
			$scope.location_data = {
				repeatData : res.data,
				showText : '地点',
				className : "location"
			}
		}
	});

	//获取所有设备类型
	$scope.equipmentSelectTypeZeroList = []; //离散设备的下拉列表
	$scope.selectEquipmentTypeZero = []; //选中的离散设备
	$scope.equipmentSelectTypeOneList = [];	//生产单元的下拉列表
	$scope.selectEquipmentTypeOne = [];	//选中的生产单元
	http.get({
		url : $rootScope.restful_api.get_equipment_type + "?startTime=" + tool.getCorrectDate(new Date) + "&endTime=" + tool.getCorrectDate(new Date),
		successFn : function (res) {
			res.data.forEach((item) => {
				item.id = item.modelId + "_" + item.modelType;
				if(item.modelType === 0){
					$scope.equipmentSelectTypeZeroList.push(item);
				} else if(item.modelType === 1){
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
		url : $rootScope.restful_api.get_all_equipment,
		data : {
			startTime : tool.getCorrectDate(new Date),
			endTime : tool.getCorrectDate(new Date),
			searchType : 0,
			modelIdList : [],
			locationFilterList : []
		},
		successFn : function (res) {
			$scope.equipmentList = getEquipmentList(res.data);
		}
	});

	/*
	 * desc : 请求获取到的设备列表是个对象，然后将其转化成数组
	 */
	function getEquipmentList(equipmentList) {
		let equipmentData = [];
		for(let i in equipmentList){
			equipmentData.push({
				label : equipmentList[i].productUnitName,
				id : equipmentList[i].productUnitId + "_" + (equipmentList[i].type === "EQUIPMENT" ? 0 : 1),
				equipmentCode : equipmentList[i].productUnitCode,
				equipmentName : equipmentList[i].productUnitName,
			});
		}
		return equipmentData
	}

	//根据改动条件，获得equipment设备列表
	$scope.getEquipment = function () {
		http.post({
			url : $rootScope.restful_api.get_all_equipment,
			data : {
				startTime : tool.getCorrectDate(new Date),
				endTime : tool.getCorrectDate(new Date),
				searchType : 1,
				modelIdList : $scope.selectEquipmentTypeZero.concat($scope.selectEquipmentTypeOne),
				locationFilterList : $scope.get_selected_location()
			},
			successFn : function (res) {
				$scope.equipmentList = getEquipmentList(res.data);
			}
		});
	};

	//打开查看详细的上限配置
	$scope.lookOnlineConfig = function () {
		layer.open({
			content : $(".jOnlineContent"),
			type: 1,
			title: "初始生产状态",
			area : ["600","700px"],
			shadeClose: true,
			success : ()=> {

			}
		});
		$scope.isShowSearchConfig = true;
	};

	$scope.searchOnlineConfig = function () {
		let postData = [];
		//创建好待会需要渲染表格的数组
		$scope.onlineConfigList = [];
		/*因为坑爹的后台数据没法一次提供所有需要的，
		 所以要先从选中的设备列表里面，根据设备id_type，到整个设备列表去获得设备名，得出一个新数组$scope.onlineConfigList
		 然后再去后台返回的数据里面，根据设备id_type去获取对应的物料信息，将获得到的物料信息合并到$scope.onlineConfigList
		 */
		//	前台加个判断，如果设备不选，默认全部全选
		if($scope.equipmentSelectList.length === 0){
			for(let i in $scope.equipmentList){
				let equipment = $scope.equipmentList[i].id.split("_");
				postData.push({
					"equipmentId":equipment[0],
					"produceUnitType":equipment[1]
				})
			}
		}else{
			$scope.equipmentSelectList.forEach((item) => {
				let equipment = item.split("_");
				postData.push({
					"equipmentId":equipment[0],
					"produceUnitType":equipment[1]
				})
			});
		}
		//从选中的设备列表里面，根据设备id_type，到整个设备列表去获得设备名，得出一个新数组$scope.onlineConfigList
		postData.forEach((selectItem) => {
			$scope.equipmentList.some((item) => {
				if((selectItem.equipmentId + "_" + selectItem.produceUnitType) === item.id){
					$scope.onlineConfigList.push({
						equipmentName : item.label,
						equipmentCode : item.equipmentCode,
						equipmentId : selectItem.equipmentId,
						equipmentType : selectItem.produceUnitType,
					});
					return true;
				}
			});
		});
		if(postData.length === 0){
			layer.alert('没有设备可以配置');
			return;
		}
		// 请求获得数据里面根据设备id_type去获取对应的物料信息，将获得到的信息合并到$scope.onlineConfigList
		http.post({
			url : $rootScope.restful_api.search_online_config,
			data : postData,
			successFn : function (res) {
				res.data.forEach((resItem) => {
					//获得渲染表格所需要的数据
					$scope.onlineConfigList.forEach((onlineItem) => {
						if(resItem.equipmentId + "_" + (resItem.produceUnitType === "EQUIPMENT" ? 0 : 1) === onlineItem.equipmentId + "_" + onlineItem.equipmentType){
							({
								materialCode:onlineItem.materialCode,
								materialId:onlineItem.materialId,
								materialName:onlineItem.materialName
							} = resItem);
						}
					});
				});
				//出现table表格和按钮
				$scope.isShowSearchConfig = true;
			},
			errorFn : function (res) {
				//table表格和按钮消失
				$scope.isShowSearchConfig = false;
			}
		})
	};
	//==========================上线配置相关代码---end-=================//
}]);
