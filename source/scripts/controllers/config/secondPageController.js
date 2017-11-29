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
app
    .controller("secondPageController",["$rootScope","$scope","$state",function($rootScope,$scope,$state){
        //显示正确的目录class-active
        $scope.configNav.activeNav = ".workUnit";

        $state.go('config.workUnit.column');//默认显示第一个tab

        $scope.secondPage = {
            title : "",//面包屑导航三级目录文字
        };
    }])
    .controller("columnController",["$rootScope","$scope","http",function($rootScope,$scope,http){
        //设置面包屑导航
        $scope.secondPage.showPageConfig = "显示项";

        /**
         *根据配置页面获取的车间地点,显示对应排序表的数据
         */
        let getColumnData = () =>{
			http.get({
				url: $rootScope.restful_api.column_content_config + $scope.locationId,
				successFn: (res) => {
                    //获得get到的数据，渲染两个拖拽框
                    $scope.setDisplayGetData(res);
                },
				errorFn: () => {
					layer.msg('获取数据失败，请检查服务器', {time: 3000, icon: 2});
                }
			});
        };
        getColumnData();

        // //获取数据，创造车间树
        // $scope.createWorkshop(true,getColumnData);


        /**列信息配置点击保存进行发送数据**/
        $scope.saveColumnContent = () => {
            let postData = $scope.getDisplayPostData("请至少选择一项显示");
            //检测数据是否正确
            if(!postData){
                return;
            }
			http.put({
				url: $rootScope.restful_api.column_content_config + $scope.locationId,
				data: postData,
				successFn: function(response){
                    if(response.data === true){
						layer.msg('保存成功', {time: 3000, icon: 1});
                    }
                },
				errorFn: function(){
					layer.msg('保存失败', {time: 3000, icon: 2});
                }
			});
        };

        /**列信息还原数据**/
        $scope.resetColumnConfig = () => {
			http.delete({
				url: $rootScope.restful_api.column_content_config + $scope.locationId,
				successFn: function(res){
                    $("#all-item").find(".js-move").remove();
                    //获得get到的数据，渲染页面
                    $scope.setDisplayGetData(res);
					layer.msg('还原配置成功', {time: 3000, icon: 1});
                },
				errorFn: function(){
					layer.msg('还原配置失败', {time: 3000, icon: 2});
                }
			});
        };
    }])
    .controller("sortController",["$rootScope","$scope","scheduleTableViewModelService","http",function($rootScope,$scope,scheduleTableViewModelService,http) {
        //设置面包屑导航
        $scope.secondPage.showPageConfig = "多列排序项";
        $scope.displayData = {leftDisplay : "可用配置项",rightDisplay : "已排序配置项"};

        function getSortConfig(){
			http.get({
				url: $rootScope.restful_api.sort_content_config + $scope.locationId,
				successFn: (res) => {
                    //获得get到的数据，渲染页面
                    $scope.setDisplayGetData(res);
                },
				errorFn: () => {
					layer.msg('获取数据失败，请检查是否连上服务器', {time: 3000, icon: 2});
                }
			});
            //合并项
			http.get({
				url: $rootScope.restful_api.sort_combine_config + $scope.locationId,
				successFn: (res) => {
                    $scope.combineItem = $.extend({}, res.data);
                    $scope.combineObj = {
                        combine: scheduleTableViewModelService.combinecountItem($scope.combineItem),
                        combineDrag: true,
                        combineActive: false
                    }
                }
			});
            //汇总项
			http.get({
				url: $rootScope.restful_api.sort_summary_config + $scope.locationId,
				successFn: (res) => {
                    $scope.summaryItem = $.extend({}, res.data);
                    $scope.summaryObj = {
                        summary: scheduleTableViewModelService.combinecountItem($scope.summaryItem),
                        summaryDrag: true,
                        summaryActive: true
                    }
                }
			});	
        }

        //渲染数据
        getSortConfig();


        /**多列排序信息配置点击保存进行发送数据**/
        $scope.saveSortContent = () => {
            let postData = $scope.getDisplayPostData("请至少选择一项进行排序");
            //检测数据是否正确
            if(!postData){
                return;
            }
			http.put({
				url: $rootScope.restful_api.sort_content_config + $scope.locationId,
				data: postData,
				successFn: function(response){
                    if(response.data === true){
						layer.msg('保存成功', {time: 3000, icon: 1});
                    }
                },
				errorFn: function(){
					layer.msg('数据保存失败', {time: 3000, icon: 2});
                }
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
				http.delete({
					url: $rootScope.restful_api.sort_combine_config + $scope.locationId,
					successFn: function(response){
                        //$scope.info.success("数据保存成功");
                    },
					errorFn: function(res){
						layer.msg('合并项保存失败', {time: 3000, icon: 2});
                    }
				});
            }else{
				http.put({
					url: $rootScope.restful_api.sort_combine_config + $scope.locationId,
					data: $scope.combineItem,
					successFn: function(response){
                        //$scope.info.success("数据保存成功");
                    },
					errorFn: function(){
						layer.msg('合并项保存失败', {time: 3000, icon: 2});
                    }
				});
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
				http.delete({
					url: $rootScope.restful_api.sort_summary_config + $scope.locationId,
					successFn: function(response){
                        //$scope.info.success("数据保存成功");
                    },
					errorFn: function(res){
						layer.msg('汇总项保存失败', {time: 3000, icon: 2});
                    }
				});
            }else{
				http.put({
					url: $rootScope.restful_api.sort_summary_config + $scope.locationId,
					data: $scope.summaryItem,
					successFn: function(response){
                        //$scope.info.success("数据保存成功");
                    },
					errorFn: function(res){
						layer.msg('汇总项保存失败', {time: 3000, icon: 2});
                    }
				});
            }
        };

        /**多列排序信息还原数据**/
        $scope.resetSortConfig = () => {
			http.delete({
				url: $rootScope.restful_api.sort_content_config + $scope.locationId,
				successFn:function(res){
                    $("#all-item").find(".js-move").remove();
                    //获得get到的数据，渲染页面
                    $scope.setDisplayGetData(res);
					layer.msg('还原配置成功', {time: 3000, icon: 1});
                },
				errorFn: function(){
					layer.msg('还原配置失败', {time: 3000, icon: 2});
                }
			});
            //还原合并项
			http.delete({
				url: $rootScope.restful_api.sort_combine_config + $scope.locationId,
				successFn: function(response){
                    $scope.combineItem = $.extend({},response.data);
                    $scope.combineObj = {
                        combine : scheduleTableViewModelService.combinecountItem($scope.combineItem),
                        combineDrag : true,
                        combineActive : false
                    }
                },
				errorFn:　function(res){
					layer.msg('合并项保存失败', {time: 3000, icon: 2});
                }
			});
            //还原汇总项
			http.delete({
				url: $rootScope.restful_api.sort_summary_config + $scope.locationId,
				successFn: function(response){
                    $scope.summaryItem = $.extend({},response.data);
                    $scope.summaryObj = {
                        summary : scheduleTableViewModelService.combinecountItem($scope.summaryItem),
                        summaryDrag : true,
                        summaryActive : true
                    }
                },
				errorFn: function(res){
					layer.msg('汇总项保存失败', {time: 3000, icon: 2});
                }
			});
        };

        //删除||选中-合并和汇总项
        $scope.addItem = (data,$event) => {
            data.show = true;
            $event.stopPropagation();
        };
        $scope.deleteDragItem = (data,$event) =>{
            data.show = false;
        };
    }]);