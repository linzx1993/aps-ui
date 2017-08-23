/**
 * Created by linzx on 2017/8/17.
 */
app.controller("onlineConfigController",["$rootScope","$scope","$state","tool","$http","http","$timeout","$q", function($rootScope,$scope,$state,tool,$http,http,$timeout,$q){
	//显示正确的目录class-active
	$scope.configNav.activeNav = ".onlineConfig";

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
	//设备类型下拉列表数据
	$scope.equipmentSelectTypeList = [];
	$scope.equipmentTypeData = {
		showText : "设备类型",
		value : "",
		repeatData : [],
	};
	http.get({
		url : $rootScope.restful_api.get_equipment_type + "?startTime=" + tool.getCorrectDate(new Date) + "&endTime=" + tool.getCorrectDate(new Date),
		successFn : function (res) {
			res.data.forEach((item) => {
				$scope.equipmentTypeData.repeatData.push({
					dragItemText : item.modelName,
					id : item.modelId
				});
			});
		}
	});

	//获取所有设备
	//设备下拉列表数据
	$scope.equipmentList = {};
	$scope.equipmentSelectList = [];
	$scope.equipmentData = {
		showText : "设备",
		value : "",
		repeatData : [],
	};
	http.get({
		url : $rootScope.restful_api.get_all_equipment + "?startTime=" + tool.getCorrectDate(new Date)
		+ "&endTime=" + tool.getCorrectDate(new Date)
		+ "&searchType=1"
		+ "&modelIdList="
		+ "&locationFilterList=" ,
		successFn : function (res) {
			$scope.equipmentList = res.data;
			let equipmentList = [];
			for(let i in $scope.equipmentList){
				equipmentList.push({
					dragItemText : $scope.equipmentList[i].productUnitName,
					id : $scope.equipmentList[i].productUnitId + "_" + $scope.equipmentList[i].type,
					equipmentCode : $scope.equipmentList[i].productUnitCode
				});
			}
			$scope.equipmentData.repeatData = equipmentList;
		}
	});

	/**
	 * 根据输入的参数名和参数，对物料相关进行模糊查询
	 * @param params : string 输入的参数名
	 */
	$scope.getMaterialCodeBySearch = function (params = '') {
		return $http.get($rootScope.restful_api.search_material_code + params).then((function (res) {
			$scope.materialCodeList = res.data.slice(0,100);
			$scope.materialCodeList.forEach((item) => {
				item.text = item.materialCode;
			});
		}),function () {
			layer.alert('获取物料编码数据失败,请联系技术人员');
		});
	};

	$scope.getMaterialNameBySearch = function (params = '') {
		$http.get($rootScope.restful_api.search_material_name + params).then((function (res) {
			$scope.materialNameList = res.data.slice(0,100);
			$scope.materialNameList.forEach((item) => {
				item.text = item.materialName;
			});
		}),function () {
			layer.alert('获取物料名称数据失败,请联系技术人员');
		});
	};
	$scope.getMaterialCodeBySearch();
	$scope.getMaterialNameBySearch();

	//==========================以上是初始进入页面所需执行代码----分割线================

	//根据改动条件，获得equipment设备列表
	$scope.getEquipment = function () {
		console.log($scope.equipmentSelectTypeList);
		http.get({
			url : $rootScope.restful_api.get_all_equipment + "?startTime=" + tool.getCorrectDate(new Date)
			+ "&endTime=" + tool.getCorrectDate(new Date)
			+ "&searchType=1"
			+ "&modelIdList=" + $scope.equipmentSelectTypeList.join(",")
			+ "&locationFilterList=" + $scope.get_selected_location().join(","),
			successFn : function (res) {
				let productUnit = res.data;
				let equipmentList = [];
				for(let i in productUnit){
					equipmentList.push({
						dragItemText : productUnit[i].productUnitName,
						id : productUnit[i].productUnitId + "_" + (productUnit[i].type === "PRODUCTION_UNIT" ? 1 : 0)
					});
				}
				$scope.equipmentData.repeatData = equipmentList;
			}
		});
	};

	$scope.searchOnlineConfig = function () {
		let postData = [];
		//创建好待会需要渲染表格的数组
		$scope.onlineConfigList = [];
		//坑爹的后台数据，前台加个判断，如果设备不选，默认全部全选
		if($scope.equipmentSelectList.length === 0){
			for(let i in $scope.equipmentList){
				postData.push({
					"equipmentId":$scope.equipmentList[i].productUnitId,
					"produceUnitType":$scope.equipmentList[i].type
				})
			}
			//坑爹的后台数据，又要从设备列表列表里面再去获得一次设备名
			postData.forEach((selectItem) => {
				$scope.equipmentData.repeatData.some((item) => {
					if(item.id === (selectItem.equipmentId + "_" + selectItem.produceUnitType)){
						$scope.onlineConfigList.push({
							equipmentName : item.dragItemText,
							equipmentCode : item.equipmentCode,
							equipmentId:selectItem.equipmentId,
							equipmentType:selectItem.produceUnitType,
						});
						return true;
					}
				});
			});
		}else{
			$scope.equipmentSelectList.forEach((item) => {
				let arr = item.split("_");
				postData.push({
					"equipmentId":arr[0],
					"produceUnitType":arr[1]
				})
			});
			//坑爹的后台数据，又要从设备列表列表里面再去获得一次设备名
			$scope.equipmentSelectList.forEach((selectItem) => {
				$scope.equipmentData.repeatData.some((item) => {
					if(item.id === selectItem){
						$scope.onlineConfigList.push({
							equipmentName : item.dragItemText,
							equipmentCode : item.equipmentCode,
							equipmentId:selectItem.equipmentId,
							equipmentType:selectItem.produceUnitType,
						});
						return true;
					}
				});
			});
		}
		http.post({
			url : $rootScope.restful_api.search_online_config,
			data : postData,
			successFn : function (res) {
				res.data.forEach((resItem) => {
					//获得渲染表格所需要的数据
					$scope.onlineConfigList.forEach((onlineItem) => {
						if(resItem.equipmentId + "_" + resItem.produceUnitType  === onlineItem.equipmentId + "_" + onlineItem.equipmentType){
							// ({
							// 	materialCode:onlineItem.materialCode,
							// 	materialId:onlineItem.materialId,
							// 	materialName:onlineItem.materialName
							// } = resItem);
							onlineItem.materialCode = resItem.materialCode;
							onlineItem.materialId = resItem.materialId;
							onlineItem.materialName = resItem.materialName;
						}
						// //获得生产物料模糊搜索需要的下拉列表数据
						// onlineItem.materialCodeList = $scope.materialCodeList;
						// onlineItem.materialNameList = $scope.materialNameList;
					});
				});

				//出现table表格和按钮
				$scope.isShowSearchConfig = true;
			},
		})
	};

	//当用户模糊查询物料编码
	$scope.$on("materialCodeParam", function(e, value) {
		$scope.getMaterialCodeBySearch(value);
	});

	//当用户模糊查询物料名称
	$scope.$on("materialNameParam", function(e, value) {
		$scope.getMaterialNameBySearch(value);
	});

	//物料下拉列表的联动，根据物料编码或者物料名称的选择，确定另外一个
	/**
	 * @param data
	 */
	$scope.selectMaterialName = function (data) {
		$timeout(function () {
			let selectObj = $scope.materialCodeList.filter((item) => {
				return item.materialCode === data.materialCode;
			});
			//设置选中的物料各个属性，在保存的时候获取
			data.materialName = selectObj[0].materialName;
			data.materialId = selectObj[0].materialId;
		})
	};

	$scope.selectMaterialCode = function (data) {
		$timeout(function () {
			let selectObj = $scope.materialNameList.filter((item) => {
				return item.materialName === data.materialName;
			});
			//设置选中的物料各个属性，在保存的时候获取
			data.materialCode = selectObj[0].materialCode;
			data.materialId = selectObj[0].materialId;
		})
	};

	//保存上线配置数据
	$scope.saveOnlineConfig = function () {
		let postData = [];
		$scope.onlineConfigList.forEach((item) => {
			if(item.materialId){
				postData.push({
					equipmentId : Number(item.equipmentId),
					produceUnitType : item.equipmentType,
					materialId : item.materialId,
				})
			}
		});
		http.post({
			url :$rootScope.restful_api.save_online_config,
			data : postData,
			successFn : function (res) {
				$scope.info.success("保存成功");
			}
		})
	};

	//恢复上线配置数据
	$scope.resetOnlineConfig = function () {
		$scope.searchOnlineConfig();
	};

}]);