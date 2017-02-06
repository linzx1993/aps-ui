/**
 * Created by yiend on 2017/2/6.
 */
app.controller("versionController",["$rootScope","$scope","$http","$state","tool", function($rootScope,$scope,$http,$state,tool){
    $http.get($rootScope.restful_api.public_version_number)
        .then((res) => {
            $scope.versionNumer =res.data.version;
            // 版本页面
            $scope.browser = tool.getBrowser().browser;
            $scope.version = tool.getBrowser().version;
        },function(){
            layer.alert("获取系统版本失败，请检查服务器");
        });
}]);