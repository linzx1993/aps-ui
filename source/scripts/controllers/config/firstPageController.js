/**
 * Created by yiend on 2017/1/23.
 * desc : 工作区域
 */
'use strict';
/*
 * desc :　firstPageController　： 工作区域（俗称一级页面）
 * desc :　displayCombineController　： 显示合并项
 * desc :　displayFlipController　： 显示翻转
 */
app
    .controller("firstPageController",["$rootScope","$scope","$http","$state", function($rootScope,$scope,$http,$state){
        //点击工作区域时，路由默认跳转显示第一个tab---显示合并项
        $state.go('config.workArea.displayCombine');
        //显示正确的目录class-active
        $scope.configNav.activeNav = ".workArea";
        //默认显示第一个tab---end
        $scope.firstPage = {
            title : "",//面包屑导航三级目录文字
            combineItemList : [],//显示合并项数组
			flipList : [],//显示翻转项数组
        };
    }])
    .controller("displayCombineController",["$rootScope","$scope","$http","http", function($rootScope,$scope,$http,http){
        //设置面包屑导航
        $scope.firstPage.title = "显示合并项";

        /**
         *desc : 根据配置页面获取的车间地点，获取对应显示合并项的数据
         */
        let getDisplayCombineData = () =>{
			http.get({
				url: $rootScope.restful_api.firstPage_display_combine + $scope.locationId,
				successFn: (res) => {
                    //获得get到的数据，渲染页面
                    $scope.firstPage.combineItemList = res.data.optionList;
                    $scope.selectValue = res.data.selectList[0].valueContent;
                },
				errorFn: () => {
                    layer.alert("获取翻转显示项失败，请检查服务器");
                }
			});
        };
        getDisplayCombineData();


        //保存数据
        $scope.saveDisplayCombine = () =>{
            //第一次进入页面没有选择
            if(!$scope.selectValue){
                layer.alert("请选择一个一级页面合并规则");
                return;
            }
            let selectObj = $scope.firstPage.combineItemList.filter((item)=>{
                return item.valueContent === $scope.selectValue;
            })[0];
            let postData = {
                "selectList" : [{
                    valueContent : selectObj.valueContent,
                    valueAlias : selectObj.valueAlias
                }]
            };
			http.put({
				url: $rootScope.restful_api.firstPage_display_combine + $scope.locationId,
                data:postData,
				successFn: (res)=>{
                    if(res.data){
						layer.msg('保存成功', {time: 3000, icon: 1});
                    }else{
						layer.msg('保存失败', {time: 3000, icon: 2});
                    }
                },
				errorFn: ()=>{
                    layer.alert("数据保存失败，请检查服务器");
                }
			});
        }
    }])
    .controller("displayFlipController",["$rootScope","$scope","$http","http", function($rootScope,$scope,$http,http){
        $scope.firstPage.title = "显示翻转";
        /**
         *根据配置页面获取的车间地点,显示对应一级页面是否翻转
         */
        let getDisplayFlipData = () =>{
			http.get({
				url: $rootScope.restful_api.firstPage_display_flip + $scope.locationId,
				successFn: (res) => {
                    //获得get到的数据，渲染页面
                    $scope.firstPage.flipList = res.data.optionList;
                    $scope.selectValue = res.data.selectList[0].valueContent || 0;//默认不翻转
                },
				errorFn: () => {
                    layer.alert("获取显示翻转数据失败，请检查服务器");
                }
			});
        };
        getDisplayFlipData();

        //保存数据
        $scope.saveDisplayFlip = () =>{
            let selectObj = $scope.firstPage.flipList.filter((item)=>{
                return item.valueContent === $scope.selectValue;
            })[0];
            let postData = {
                "selectList" : [{
                    valueContent : selectObj.valueContent,
                    valueAlias : selectObj.valueAlias
                }]
            };
			http.put({
				url: $rootScope.restful_api.firstPage_display_flip + $scope.locationId,
				data: postData,
				successFn: (res)=>{
					if(res.data){
						layer.msg('保存成功', {time: 3000, icon: 1});
					}else{
						layer.msg('保存失败', {time: 3000, icon: 2});
					}
                },
				errorFn: ()=>{
					$scope.info.fail("数据保存失败，请检查服务器");
                }
			})
        }

}]);
