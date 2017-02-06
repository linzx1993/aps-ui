/**
 * Created by yiend on 2017/1/14.
 */
'use strict';
app.controller("columnController",["$rootScope","$scope","$http",function($rootScope,$scope,$http){
    //设置面包屑导航
    $scope.showPageConfig = "显示排序项";

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
    $scope.createWorkshop();

    //根据点击不同的车间选择不同的显示项
    $("#columnWorkshop").on("click", ".select-status", (e) => {
        //根据点击的车间ID
        $scope.locationId = e.target.getAttribute("data-location-id");
        $(".select-status").removeClass("active");
        $(e.target).addClass("active");
        //移除临时拖拽项
        $(".js-move").remove();
        getColumnData();
    });

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
}]);
