/**
 * Created by yiend on 2017/1/23.
 */
'use strict';
app
    .controller("firstPageController",["$rootScope","$scope","$http","$state", function($rootScope,$scope,$http,$state){
        //默认显示第一个tab---start
        $state.go('config.first.displayDays');

        //默认显示第一个tab---end
        $scope.firstPage = {};
    }])
    .controller("displayDaysController",["$rootScope","$scope","$http", function($rootScope,$scope,$http){
        //设置面包屑导航
        $scope.showPageConfig = "显示天数";
        
        $http.get($rootScope.restful_api.firstPage_display_days + $scope.locationId)
            .then(function(res){
                $scope.firstPage.showItemLists = res.data.selectList;
                $scope.firstPage.showItemLists.map((item)=>{
                    item.valueContent = Number(item.valueContent);
                });
                $scope.selectValue = $scope.firstPage.showItemLists[0].valueContent;
            },function () {
                layer.alert("获取一级页面显示天数，请检查服务器");
            });

        //显示输入数字范围
        $scope.validateNum = (val) =>{
            if (val.length == 1) {
                val = val.replace(/[^1-9]/g, '')
            } else {
                val = val.replace(/\D/g, '')
            }
            if (val > 90) {
                val = 30;
            }
            $scope.selectValue = val;
        };
        //保存数据
        $scope.saveDisplayDays = () => {
            let postData = {
                "selectList" : []
            };
            $scope.firstPage.showItemLists.forEach(function(item){
                let obj = {};
                obj.valueContent = $(".input-text-box").val();
                obj.valueAlias = item.valueAlias;
                postData.selectList.push(obj);
            });
            $http.put($rootScope.restful_api.firstPage_display_days + $scope.locationId,postData)
                .then((res)=>{
                    if(res.data){
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
        //设置面包屑导航
        $scope.showPageConfig = "显示合并项";
        $http.get($rootScope.restful_api.firstPage_display_combine + $scope.locationId)
            .then(function(res){
                $scope.firstPage.combineItemList = res.data.optionList;
                $scope.selectValue = res.data.selectList[0].valueContent;
            })

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
            console.log(selectObj);
            let postData = {
                "selectList" : [{
                    valueContent : selectObj.valueContent,
                    valueAlias : selectObj.valueAlias
                }]
            };
            $http.put($rootScope.restful_api.firstPage_display_combine + $scope.locationId,postData)
                .then((res)=>{
                    if(res.data){
                        $scope.info.success("数据保存成功")
                    }else{
                        $scope.info.fail("数据保存失败")
                    }
                },()=>{
                    layer.alert("数据保存失败，请检查服务器");
                });
        }
    }]);