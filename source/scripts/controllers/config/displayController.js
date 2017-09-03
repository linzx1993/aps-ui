/**
 * Created by linzx on 2017/4/17.
 */
'use strict';
app.controller("displayController",["$rootScope","$scope","$timeout","tool","http","$state", function($rootScope,$scope,$timeout,tool,http,$state){
    //点击显示项配置时，路由默认默认跳转显示第一个tab---工作区域（原一级页面）
    $state.go('config.workArea');
}]);