/**
 * Created by yiend on 2017/1/23.
 */
'use strict';
app
    .controller("firstPageController",["$rootScope","$scope","$http","$state", function($rootScope,$scope,$http,$state){
        $state.go('config.first.displayCombine');//默认显示第一个tab
        $scope.firstPage = {};
    }])
    .controller("displayDaysController",["$rootScope","$scope","$http", function($rootScope,$scope,$http){
            $http.get($rootScope.restful_api.firstPage_display_days + $scope.locationId)
        .then(function(res){
            $scope.firstPage.showItemLists = res.data.selectList;
            $scope.firstPage.showItemLists.map((item)=>{
                item.valueContent = Number(item.valueContent);
            });
            // $scope.selectValue = $scope.firstPage.showItemLists[0].valueContent;
        },function () {
            layer.alert("获取一级页面显示天数，请检查服务器");
        });

    $scope.saveDisplayDays = () => {
        let postData = {
            "selectList" : $scope.selectValue
        };
        console.log($scope.selectValue);
        $http.put($rootScope.restful_api.firstPage_display_days + $scope.locationId,postData)
            .then((res)=>{
                if(res.data.success_response){
                    $scope.info.success("数据保存成功")
                }else{
                    $scope.info.fail("数据保存失败")
                }
            },()=>{
                layer.alert("数据保存失败，请检查服务器");
            });
    }
    }])
    .controller("displayCombineController",["$rootScope","$scope","$http", function($rootScope,$scope,$http){
        $http.get($rootScope.restful_api.firstPage_display_combine + $scope.locationId)
            .then(function(res){
                $scope.firstPage.combineItemList = res.data.optionList;
                $scope.selectDisplayCombineItem = res.data.selectList;
                $scope.selectValue = res.data.selectList.valueContent;
            })

        //保存数据
        $scope.saveDisplayCombine = () =>{
            console.log($scope.selectValue);
            // let postData =
            // $http.put($rootScope.restful_api.firstPage_display_combine + $scope.locationId,)
        }
    }]);