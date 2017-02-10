/**
 * Created by yiend on 2017/1/14.
 */
'use strict';
app
    .controller("secondPageController",["$rootScope","$scope","$state",function($rootScope,$scope,$state){
        //显示正确的目录class-active
        $scope.configNav.activeNav = ".second";

        $state.go('config.second.column');//默认显示第一个tab

        $scope.secondPage = {
            title : "",//面包屑导航三级目录文字
        };
    }])
    .controller("columnController",["$rootScope","$scope","$http",function($rootScope,$scope,$http){
        //设置面包屑导航
        $scope.secondPage.showPageConfig = "显示排序项";

        /**
         *根据点击的车间树获得相应的车间ID,显示对应排序表的数据
         */
        let getColumnData = () =>{
            $http.get($rootScope.restful_api.column_content_config + $scope.locationId)
                .then((res) => {
                    //获得get到的数据，渲染页面
                    $scope.setDisplayGetData(res);
                }, () => {
                    $scope.info.fail("获取数据失败，请检查是否连上服务器")
                });
        };
        getColumnData();

        //获取数据，创造车间树
        $scope.createWorkshop(true,getColumnData);

        //初始化拖拽
        $scope.clickLiGetItem();

        /**列信息配置点击保存进行发送数据**/
        $scope.saveColumnContent = () => {
            let postData = $scope.getDisplayPostData("请至少选择一项显示");
            //检测数据是否正确
            if(!postData){
                return;
            }
            $http.put($rootScope.restful_api.column_content_config + $scope.locationId,postData)
                .then(function(response){
                    if(response.data === true){
                        $scope.info.success("数据保存成功");
                    }
                },function(){
                    $scope.info.fail("数据保存失败");
                })
        };

        /**列信息还原数据**/
        $scope.resetColumnConfig = () => {
            $http.delete($rootScope.restful_api.column_content_config + $scope.locationId)
                .then(function(res){
                    $("#all-item").find(".js-move").remove();
                    //获得get到的数据，渲染页面
                    $scope.setDisplayGetData(res);
                    $scope.info.success("还原配置成功");
                },function(){
                    $scope.info.fail("还原配置失败");
                })
        };
    }])
    .controller("sortController",["$rootScope","$scope","$http", "$window", "$location","$timeout","$q","$templateCache","scheduleTableViewModelService",function($rootScope,$scope,$http, $window, $location,$timeout,$q,$templateCache,scheduleTableViewModelService) {
        //设置面包屑导航
        $scope.secondPage.showPageConfig = "多列排序项";

        function getSortConfig(){
            $http.get($rootScope.restful_api.sort_content_config + $scope.locationId)
                .then((res) => {
                    //获得get到的数据，渲染页面
                    $scope.setDisplayGetData(res);
                }, () => {
                    $scope.info.fail("获取数据失败，请检查是否连上服务器")
                });
            //合并项
            $http.get($rootScope.restful_api.sort_combine_config + $scope.locationId)
                .then((res) => {
                    $scope.combineItem = $.extend({}, res.data);
                    $scope.combineObj = {
                        combine: scheduleTableViewModelService.combinecountItem($scope.combineItem),
                        combineDrag: true,
                        combineActive: false
                    }
                });
            //汇总项
            $http.get($rootScope.restful_api.sort_summary_config + $scope.locationId)
                .then((res) => {
                    $scope.summaryItem = $.extend({}, res.data);
                    $scope.summaryObj = {
                        summary: scheduleTableViewModelService.combinecountItem($scope.summaryItem),
                        summaryDrag: true,
                        summaryActive: true
                    }
                });
        }
        //创建车间树
        $scope.createWorkshop(true,getSortConfig);

        //渲染数据
        getSortConfig();

        //初始化拖拽
        $scope.clickLiGetItem();

        /**多列排序信息配置点击保存进行发送数据**/
        $scope.saveSortContent = () => {
            let postData = $scope.getDisplayPostData("请至少选择一项进行排序");
            //检测数据是否正确
            if(!postData){
                return;
            }
            $http.put($rootScope.restful_api.sort_content_config + $scope.locationId,postData)
                .then(function(response){
                    if(response.data === true){
                        $scope.info.success("数据保存成功");
                    }
                },function(){
                    $scope.info.fail("数据保存失败");
                });
            //合并项
            let combineP = document.getElementsByClassName("combine-item")[0].getElementsByTagName("span");
            $scope.combineItem.selectList = [];
            for(let i = 0;i < combineP.length;i ++){
                let value = combineP[i].getAttribute("data-value");
                $scope.combineItem.optionList.forEach(function(item){
                    if(item.valueContent == value){
                        $scope.combineItem.selectList.push(item);
                    }
                })
            }
            //空的情况下暂时使用还原功能
            if($scope.combineItem.selectList.length === 0){
                $scope.combineItem.selectList = null;
                $http.delete($rootScope.restful_api.sort_combine_config + $scope.locationId,$scope.combineItem)
                    .then(function(response){
                        //$scope.info.success("数据保存成功");
                    },function(res){
                        $scope.info.fail("合并项保存失败");
                    })
            }else{
                $http.put($rootScope.restful_api.sort_combine_config + $scope.locationId,$scope.combineItem)
                    .then(function(response){
                        //$scope.info.success("数据保存成功");
                    },function(){
                        $scope.info.fail("合并项保存失败");
                    })
            }
            //汇总项
            let summaryP = document.getElementsByClassName("Summary-item")[0].getElementsByTagName("span");
            $scope.summaryItem.selectList = [];
            for(let i = 0;i < summaryP.length;i ++){
                let value = summaryP[i].getAttribute("data-value");
                $scope.summaryItem.optionList.forEach(function(item){
                    if(item.valueContent == value){
                        $scope.summaryItem.selectList.push(item);
                    }
                })
            }
            //空的情况下暂时使用还原功能
            if($scope.summaryItem.selectList.length === 0){
                $scope.summaryItem.selectList = null;
                $http.delete($rootScope.restful_api.sort_summary_config + $scope.locationId,$scope.summaryItem)
                    .then(function(response){
                        //$scope.info.success("数据保存成功");
                    },function(res){
                        $scope.info.fail("汇总项保存失败");
                    })
            }else{
                $http.put($rootScope.restful_api.sort_summary_config + $scope.locationId,$scope.summaryItem)
                    .then(function(response){
                        //$scope.info.success("数据保存成功");
                    },function(res){
                        $scope.info.fail("汇总项保存失败");
                    })
            }
        };

        /**多列排序信息还原数据**/
        $scope.resetSortConfig = () => {
            $http.delete($rootScope.restful_api.sort_content_config + $scope.locationId)
                .then(function(res){
                    $("#all-item").find(".js-move").remove();
                    //获得get到的数据，渲染页面
                    $scope.setDisplayGetData(res);
                    $scope.info.success("还原配置成功");
                },function(){
                    $scope.info.fail("还原配置失败");
                });
            //还原合并项
            $http.delete($rootScope.restful_api.sort_combine_config + $scope.locationId,null)
                .then(function(response){
                    $scope.combineItem = $.extend({},response.data);
                    $scope.combineObj = {
                        combine : scheduleTableViewModelService.combinecountItem($scope.combineItem),
                        combineDrag : true,
                        combineActive : false
                    }
                },function(res){
                    $scope.info.fail("合并项保存失败");
                });
            //还原汇总项
            $http.delete($rootScope.restful_api.sort_summary_config + $scope.locationId,null)
                .then(function(response){
                    $scope.summaryItem = $.extend({},response.data);
                    $scope.summaryObj = {
                        summary : scheduleTableViewModelService.combinecountItem($scope.summaryItem),
                        summaryDrag : true,
                        summaryActive : true
                    }
                },function(res){
                    $scope.info.fail("汇总项保存失败");
                })
        };

        //删除||选中-合并和汇总项
        $scope.addItem = (data,$event) => {
            data.show = true;
            $event.stopPropagation();
        };
        $scope.deleteDragItem = (data,$event) =>{
            data.show = false;
            //$event.target.parentNode.parentNode;
            //console.log($event.target.parentNode.parentNode.nextElementSibling);
        };
    }]);