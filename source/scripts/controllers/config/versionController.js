/**
 * Created by yiend on 2017/2/6.
 */
app.controller("versionController",["$rootScope","$scope","$http","$state","tool","http", function($rootScope,$scope,$http,$state,tool,http){
    //显示正确的目录class-active
    $scope.configNav.activeNav = ".version";

    //获取系统版本
	http.get({
		url: $rootScope.restful_api.public_version_number,
		successFn: (res) => {
            $scope.versionNumer =res.data.version;
            // 版本页面
            $scope.browser = tool.getBrowser().browser;
            $scope.version = tool.getBrowser().version;
        },
		errorFn: function(){
            layer.alert("获取系统版本失败，请检查服务器");
        }
	});

    //清楚后端缓存
    $scope.clearCache = () =>{
        http.post({
            url: $rootScope.restful_api.clearCatch,
            successFn: function(res){
                layer.msg('已清除后端缓存');
            },
            errorFn: function(res){
                layer.msg('清除后端缓存失败，请检查服务器');
            },
        });
    };
}]);