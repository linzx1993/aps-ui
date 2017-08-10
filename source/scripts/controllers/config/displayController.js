/**
 * Created by linzx on 2017/4/17.
 */
'use strict';
app.controller("displayController",["$rootScope","$scope","$timeout","tool","http","$state", function($rootScope,$scope,$timeout,tool,http,$state){
    //默认显示第一个tab---工作区域
    $state.go('config.workArea');
}]);