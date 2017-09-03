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


        //======================taskController========================//
        //设置面包屑导航
        $scope.functionPage.showPageConfig = "任务池显示项";

        //获取数据，创造车间树
        // $scope.createWorkshop(true,getColumnData);
    }])
    .controller("taskColumnController",["$rootScope","$scope","http",function($rootScope,$scope,http){
        /**
         *根据点击的车间树获得相应的车间ID,显示对应排序表的数据
         */
        let getColumnData = () =>{
            http.get({
                url: $rootScope.restful_api.task_column_config + $scope.locationId,
                successFn: (res) => {
                    //如果请求到的数据有列信息，没有则给出提醒信息
                    if(res.data.optionList.length){
                        //获得get到的数据，渲染页面
                        $scope.setDisplayGetData(res);
                        $scope.displayData = {leftDisplay : "未显示项",rightDisplay : "已显示项"};
                    }else{
                        $scope.info.fail("没有显示信息需要配置")
                    }
                },
                errorFn: () => {
                    $scope.info.fail("获取数据失败，请检查是否连上服务器")
                }
            })
        };
        getColumnData();

        //初始化拖拽
        $scope.clickLiGetItem();

        /**列信息配置点击保存进行发送数据**/
        $scope.saveTaskColumn = () => {
            let postData = $scope.getDisplayPostData("请至少选择一项显示");
            //检测数据是否正确
            if(!postData){
                return;
            }
            http.put({
                url: $rootScope.restful_api.task_column_config + $scope.locationId,
                data: postData,
                successFn: function(response){
                    if(response.data === true){
                        $scope.info.success("数据保存成功");
                    }
                },
                errorFn: function(){
                    $scope.info.fail("数据保存失败");
                }
            })
        };

        /**列信息还原数据**/
        $scope.resetTaskColumn = () => {
            http.delete({
                url: $rootScope.restful_api.task_column_config + $scope.locationId,
                successFn: function(res){
                    $(".js-move").remove();
                    //获得get到的数据，渲染页面
                    $scope.setDisplayGetData(res);
                    $scope.info.success("还原配置成功");
                },
                errorFn: function(){
                    $scope.info.fail("还原配置失败");
                }
            });
        };
    }])
    .controller("cacheRoomController",["$rootScope","$scope","http",function($rootScope,$scope,http){
        //设置面包屑导航
        $scope.functionPage.showPageConfig = "暂存间显示项";
        /**
         *根据点击的车间树获得相应的车间ID,显示对应排序表的数据
         */
        let getColumnData = () =>{
            http.get({
                url: $rootScope.restful_api.cache_room_config + $scope.locationId,
                successFn: (res) => {
                    //如果请求到的数据有列信息，没有则给出提醒信息
                    if(res.data.optionList.length){
                        //获得get到的数据，渲染页面
                        $scope.setDisplayGetData(res);
                        $scope.displayData = {leftDisplay : "未显示项",rightDisplay : "已显示项"};
                    }else{
                        $scope.info.fail("没有显示信息需要配置")
                    }
                },
                errorFn: () => {
                    $scope.info.fail("获取数据失败，请检查是否连上服务器")
                }
            })
        };
        getColumnData();

        //初始化拖拽
        $scope.clickLiGetItem();

        /**列信息配置点击保存进行发送数据**/
        $scope.saveCacheRoom = () => {
            let postData = $scope.getDisplayPostData("请至少选择一项显示");
            //检测数据是否正确
            if(!postData){
                return;
            }
            http.put({
                url: $rootScope.restful_api.cache_room_config + $scope.locationId,
                data: postData,
                successFn: function(response){
                    if(response.data === true){
                        $scope.info.success("数据保存成功");
                    }
                },
                errorFn: function(){
                    $scope.info.fail("数据保存失败");
                }
            })
        };

        /**列信息还原数据**/
        $scope.resetCacheRoom = () => {
            http.delete({
                url: $rootScope.restful_api.cache_room_config + $scope.locationId,
                successFn: function(res){
                    $(".js-move").remove();
                    //获得get到的数据，渲染页面
                    $scope.setDisplayGetData(res);
                    $scope.info.success("还原配置成功");
                },
                errorFn: function(){
                    $scope.info.fail("还原配置失败");
                }
            });
        };
    }]);