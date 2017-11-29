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
app
    .controller("functionModuleController",["$rootScope","$scope","$http","$state","http", function($rootScope,$scope,$http,$state,http){
        //默认显示第一个tab---start
        $state.go('config.workMenu.task');
        //显示正确的目录class-active
        $scope.configNav.activeNav = ".workMenu";
        //默认显示第一个tab---end
        $scope.functionPage = {
            title : "",//面包屑导航三级目录文字
            showItemLists : [],//显示天数
            combineItemList : [],//显示合并项数组
        };
    }])
    .controller("taskColumnController",["$rootScope","$scope","http",function($rootScope,$scope,http){
		//设置面包屑导航
		$scope.functionPage.showPageConfig = "任务池显示项";
		$scope.taskRoomDimension = "planDimension";    //进入页面默认显示计划维度
        let taskRoomUrl = $rootScope.restful_api.task_column_plan_config;

        $scope.$watch("taskRoomDimension",function (n, o) {
            if(n === "planDimension"){
				taskRoomUrl = $rootScope.restful_api.task_column_plan_config;
				$scope.getColumnData();
            }else if(n === 'orderDimension'){
				taskRoomUrl = $rootScope.restful_api.task_column_order_config;
				$scope.getColumnData();
            }
		});
        /**
         *根据点击的车间树获得相应的车间ID,显示对应排序表的数据
         */
		$scope.getColumnData = () =>{
            http.get({
                url: taskRoomUrl + $scope.locationId,
                successFn: (res) => {
                    //如果请求到的数据有列信息，没有则给出提醒信息
                    if(res.data.optionList && res.data.optionList.length){
                        //获得get到的数据，渲染页面
						$scope.setDisplayGetData(res);
                    }else{
						$scope.setDisplayGetData(res);
                        layer.msg('没有显示项需要配置', {time: 3000, icon: 2});
                    }
                },
                errorFn: () => {
					layer.msg('获取数据失败，请检查是否连上服务器', {time: 3000, icon: 2});
                }
            })
        };

        /**列信息配置点击保存进行发送数据**/
        $scope.saveTaskColumn = () => {
            let postData = $scope.getDisplayPostData("请至少选择一项显示");
            //检测数据是否正确
            if(!postData){
                return;
            }
            http.put({
                url: taskRoomUrl + $scope.locationId,
                data: postData,
                successFn: function(response){
                    if(response.data === true){
						layer.msg('保存成功', {time: 3000, icon: 1});
                    }
                },
                errorFn: function(){
					layer.msg('保存失败', {time: 3000, icon: 2});
                }
            })
        };

        /**列信息还原数据**/
        $scope.resetTaskColumn = () => {
            http.delete({
                url: taskRoomUrl + $scope.locationId,
                successFn: function(res){
                    //获得get到的数据，渲染页面
                    $scope.setDisplayGetData(res);
					layer.msg('还原成功', {time: 3000, icon: 1});
                },
                errorFn: function(){
					layer.msg('还原失败', {time: 3000, icon: 2});
                }
            });
        };
    }])
    .controller("cacheRoomController",["$rootScope","$scope","http",function($rootScope,$scope,http){
        //设置面包屑导航
        $scope.functionPage.showPageConfig = "暂存间显示项";
		$scope.cacheRoomDimension = "planDimension";    //进入页面默认显示计划维度
		let cacheRoomUrl = $rootScope.restful_api.cache_room_plan_config;

		$scope.$watch("cacheRoomDimension",function (n, o) {
			if(n === "planDimension"){
				cacheRoomUrl = $rootScope.restful_api.cache_room_plan_config;
				$scope.getColumnData();
			}else if(n === 'orderDimension'){
				cacheRoomUrl = $rootScope.restful_api.cache_room_order_config;
				$scope.getColumnData();
			}
		});
        /**
         *根据点击的车间树获得相应的车间ID,显示对应排序表的数据
         */
        $scope.getColumnData = () =>{
            http.get({
                url: cacheRoomUrl + $scope.locationId,
                successFn: (res) => {
                    //如果请求到的数据有列信息，没有则给出提醒信息
					if(!res.data.optionList || res.data.optionList.length === 0){
						layer.msg('没有显示项需要配置', {time: 3000, icon: 2});
					}
					//渲染数据
					$scope.setDisplayGetData(res);
                },
                errorFn: () => {
					layer.msg('获取数据失败，请检查是否连上服务器', {time: 3000, icon: 2});
                }
            });
        };
		// getColumnData();

        /**列信息配置点击保存进行发送数据**/
        $scope.saveCacheRoom = () => {
            let postData = $scope.getDisplayPostData("请至少选择一项显示");
            //检测数据是否正确
            if(!postData){
                return;
            }
            http.put({
                url: cacheRoomUrl + $scope.locationId,
                data: postData,
                successFn: function(response){
                    if(response.data === true){
						layer.msg('保存成功', {time: 3000, icon: 1});
                    }
                },
                errorFn: function(){
					layer.msg('还原失败', {time: 3000, icon: 2});
                }
            })
        };

        /**列信息还原数据**/
        $scope.resetCacheRoom = () => {
            http.delete({
                url: cacheRoomUrl + $scope.locationId,
                successFn: function(res){
                    //获得get到的数据，渲染页面
                    $scope.setDisplayGetData(res);
					layer.msg('还原成功', {time: 3000, icon: 1});
                },
                errorFn: function(){
					layer.msg('还原失败', {time: 3000, icon: 2});
                }
            });
        };
    }]);