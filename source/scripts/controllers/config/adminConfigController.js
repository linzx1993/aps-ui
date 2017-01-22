/**
 * Created by yiend on 2017/1/16.
 */
app.controller("adminConfigController",["$rootScope","$scope","$http", "$window", "$location","$timeout","$q","$templateCache","scheduleTableViewModelService",function($rootScope,$scope,$http, $window, $location,$timeout,$q,$templateCache,scheduleTableViewModelService) {
    console.log("adminConfigController");
    $http.get($rootScope.restful_api.reset_show_column + $scope.locationId)
        .then((res) => {
            //获得get到的数据，渲染页面
            $scope.setDisplayGetData(res);
        },() => {
            info.fail("获取数据失败，请检查是否连上服务器")
        });
    //添加异步==>需要等待树形渲染完成
    $timeout(function(){
        //创造车间树
        $scope.createWorkshop();
        //根据点击不同的车间选择不同的显示项
        $("#columnWorkshop").on("click",".select-status",(e) => {
            //根据点击的车间ID
            $scope.locationId = $scope.getLocationId(e);
            $http.get($rootScope.restful_api.reset_show_column + $scope.locationId)
                .then((res) => {
                    //获得get到的数据，渲染页面
                    $scope.setDisplayGetData(res);
                },() => {
                    info.fail("获取数据失败，请检查是否连上服务器")
                })
        })
    });
    //初始化拖拽
    $scope.clickLiGetItem();

    $scope.saveAdminDefaultDisplay = () => {
        let postData = getDisplayPostData("请至少选择一项显示");
        //检测数据是否正确
        if(!postData){
            return;
        }
        $http.put($rootScope.restful_api.reset_show_column + $scope.locationId,postData)
            .then(function(response){
                if(response.data === true){
                    info.success("默认显示项保存成功");
                }
            },function(){
                info.fail("默认显示项保存失败");
            })
    };

    /**系统管理员页面还原数据**/
    $scope.resetAdminConfig = () => {
        $http.delete($rootScope.restful_api.admin_content_config + $scope.locationId)
            .then(function(res){
                $scope.adminOptionList = res.data.optionList;
                $scope.adminSelectList = res.data.selectList[0];
                $scope.carHouseSelected = $scope.adminSelectList.valueContent;
                info.success("还原配置成功");
            },function(){
                info.fail("还原配置失败");
            })
    };
}]);