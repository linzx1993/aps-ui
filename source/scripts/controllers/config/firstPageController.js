/**
 * Created by yiend on 2017/1/23.
 */
'use strict';
app
    .controller("firstPageController",["$rootScope","$scope","$http","$state", function($rootScope,$scope,$http,$state){
        //默认显示第一个tab---start
        $state.go('config.workArea.displayCombine');
        //显示正确的目录class-active
        $scope.configNav.activeNav = ".workArea";
        //默认显示第一个tab---end
        $scope.firstPage = {
            title : "",//面包屑导航三级目录文字
            showItemLists : [],//显示天数
            combineItemList : [],//显示合并项数组
        };
    }])
    .controller("displayCombineController",["$rootScope","$scope","$http","http", function($rootScope,$scope,$http,http){
        //设置面包屑导航
        $scope.firstPage.title = "显示合并项";

        /**
         *根据点击的车间树获得相应的车间ID,显示对应显示合并项的数据
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
                    layer.alert("获取显示合并项失败，请检查服务器");
                }
			});
        };
        getDisplayCombineData();

        // //创建车间树
        // $scope.createWorkshop(true,getDisplayCombineData);

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
                        $scope.info.success("数据保存成功")
                    }else{
                        $scope.info.fail("数据保存失败")
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
         *根据点击的车间树获得相应的车间ID,显示对应一级页面是否翻转
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
            console.log($scope.selectValue);
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
                        $scope.info.success("数据保存成功")
                    }else{
                        $scope.info.fail("数据保存失败")
                    }
                },
				errorFn: ()=>{
                    layer.alert("数据保存失败，请检查服务器");
                }
			})
        }

        // //创建车间树
        // $scope.createWorkshop(true,getDisplayFlipData);
    }]);
