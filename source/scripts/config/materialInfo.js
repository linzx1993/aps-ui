/**
 * 物料信息页的路由
 * Created by dww on 2017/4/11.
 */

app.config(['$stateProvider','$urlRouterProvider', function($stateProvider,$urlRouterProvider) {
    // 在这里定义路由
       $urlRouterProvider.otherwise('/date');
    // $urlRouterProvider.when("", "/home");
    $stateProvider
    	//时间页
        .state('date',{
            url:'/date',
            templateUrl:'template/materialInfo/date.html',
            controller: 'dateCtrl'
        })
        //物料页
        .state('materialName',{
            url:'/materialName',
            templateUrl:'template/materialInfo/materialName.html',
            controller: 'materialNameCtrl'
        });
}]);