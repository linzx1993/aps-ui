/**
 * Created by linzx on 2017/8/17.
 * desc : 上线配置页面
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
	$scope.equipmentSelectTypeListZero = []; //选中的离散设备
	$scope.equipmentSelectTypeListOne = [];	//选中的生产单元
	//获取设备类型的下拉数据
	$scope.equipmentTypeDataZero = {
		showText : "离散设备",
		value : "",
		repeatData : [],
	};
	$scope.equipmentTypeDataOne = {
		showText : "生产单元",
		value : "",
		repeatData : [],
	};
	http.get({
		url : $rootScope.restful_api.get_equipment_type + "?startTime=" + tool.getCorrectDate(new Date) + "&endTime=" + tool.getCorrectDate(new Date),
		successFn : function (res) {
			res.data.forEach((item) => {
				if(item.modelType === 0){
					$scope.equipmentTypeDataZero.repeatData.push({
						dragItemText : item.modelName,
						id : item.modelId
					});
				}
				if(item.modelType === 1){
					$scope.equipmentTypeDataOne.repeatData.push({
						dragItemText : item.modelName,
						id : item.modelId
					});
				}
			});
		}
	});

	//获取所有设备
	$scope.equipmentSelectList = [];//设备下拉列表选中设备的数据
	//获取设备下拉列表数据
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
			$scope.equipmentData.repeatData = getEquipmentList($scope.equipmentList);
		}
	});

	/*
	 * desc : 请求获取到的设备列表是个对象，然后将其转化成数组
	 */
	function getEquipmentList(equipmentData) {
		let equipmentList = [];
		for(let i in equipmentData){
			equipmentList.push({
				dragItemText : equipmentData[i].productUnitName,
				id : equipmentData[i].productUnitId + "_" + equipmentData[i].type,
				equipmentCode : equipmentData[i].productUnitCode
			});
		}
		return equipmentList
	}

	/**
	 * 根据输入的参数名和参数，对物料相关进行模糊查询
	 * @param params : string 输入的参数名
	 */
	$scope.getMaterialCodeBySearch = function (params = '') {
		return $http.get($rootScope.restful_api.search_material_code + params).then((function (res) {
			$scope.materialCodeList = res.data.slice(0,100);
			$scope.materialCodeList.unshift({
				materialCode : "请选择",
				materialName : "请选择",
				materialId : "",
			});
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
			$scope.materialNameList.unshift({
				materialCode : "请选择",
				materialName : "请选择",
				materialId : "",
			});
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
		http.get({
			url : $rootScope.restful_api.get_all_equipment + "?startTime=" + tool.getCorrectDate(new Date)
			+ "&endTime=" + tool.getCorrectDate(new Date)
			+ "&searchType=1"
			+ "&modelIdList=" + $scope.equipmentSelectTypeListZero.concat($scope.equipmentSelectTypeListOne).join(",")
			+ "&locationFilterList=" + $scope.get_selected_location().join(","),
			successFn : function (res) {
				$scope.equipmentList = res.data;
				$scope.equipmentData.repeatData = getEquipmentList($scope.equipmentList);
			}
		});
	};

	$scope.searchOnlineConfig = function () {
		let postData = [];
		//创建好待会需要渲染表格的数组
		$scope.onlineConfigList = [];
		/*因为坑爹的后台数据没法一次提供所有需要的，
		 所以要先从选中的设备列表里面，根据设备id_type，到整个设备列表去获得设备名，得出一个新数组$scope.onlineConfigList
		 然后再去到请求获得数据里面根据设备id_type去获取对应的物料信息，将获得到的信息合并到$scope.onlineConfigList
		 */
		//	前台加个判断，如果设备不选，默认全部全选
		if($scope.equipmentSelectList.length === 0){
			for(let i in $scope.equipmentList){
				postData.push({
					"equipmentId":$scope.equipmentList[i].productUnitId,
					"produceUnitType":$scope.equipmentList[i].type
				})
			}
		}else{
			$scope.equipmentSelectList.forEach((item) => {
				let arr = item.split("_");
				postData.push({
					"equipmentId":arr[0],
					"produceUnitType":item.replace(arr[0] + "_","")
				})
			});
		}
		//从选中的设备列表里面，根据设备id_type，到整个设备列表去获得设备名，得出一个新数组$scope.onlineConfigList
		postData.forEach((selectItem) => {
			$scope.equipmentData.repeatData.some((item) => {
				if(item.id === (selectItem.equipmentId + "_" + selectItem.produceUnitType)){
					$scope.onlineConfigList.push({
						equipmentName : item.dragItemText,
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
						if(resItem.equipmentId + "_" + resItem.produceUnitType  === onlineItem.equipmentId + "_" + onlineItem.equipmentType){
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

	//当用户模糊查询物料编码
	$scope.$on("materialCodeParam", function(e, value) {
		$scope.getMaterialCodeBySearch(value);
	});

	//当用户模糊查询物料名称
	$scope.$on("materialNameParam", function(e, value) {
		$scope.getMaterialNameBySearch(value);
	});

	/**
	 * desc： 物料下拉列表的联动，根据物料编码或者物料名称的选择，确定另外一个
	 * @param data ： 用户选择的物料编码，所对应的对象
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

	/**
	 * desc： 物料下拉列表的联动，根据者物料名称的选择，确定同行另外一个物料编码
	 * @param data ： 用户选择的物料名称，所对应的对象
	 */
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
		//遍历渲染表格的list，获取需要发送的数据
		$scope.onlineConfigList.forEach((item) => {
			postData.push({
				equipmentId : Number(item.equipmentId),
				produceUnitType : item.equipmentType,
				materialId : item.materialId,
			})
		});
		http.post({
			url :$rootScope.restful_api.save_online_config,
			data : postData,
			successFn : function () {
				$scope.info.success("保存成功");
			}
		})
	};

	//恢复上线配置数据
	$scope.resetOnlineConfig = function () {
		$scope.searchOnlineConfig();
	};

}]);