/**
 * Created by xujun on 2016/7/1.
 */
app.config(['$stateProvider','$urlRouterProvider','$translateProvider', function($stateProvider,$urlRouterProvider,$translateProvider) {
    // 在这里定义路由
    // $urlRouterProvider.otherwise('/home');
    // $urlRouterProvider.when("", "/home");
    $stateProvider
        .state('home',{
            url:'/home',
            templateUrl:'dist/view/home.html'
        })
        //排程前页
        .state('preview',{
            url:'/preview',
            templateUrl:'dist/view/preview.html',
            controller: 'previewCtrl'
        })
        //排程过程中页
        .state('progress',{
            url:'/progress',
            templateUrl:'dist/view/progress.html',
            controller: 'progressCtrl'
        })
        //排程后页
        .state('result',{
            url:'/result',
            templateUrl:'dist/view/result.html',
            controller: 'resultCtrl'
        })
        //帮助页
        .state('help',{
            url:'/help',
            templateUrl:'dist/view/help.html',
            controller: 'helpCtrl'
        })
        //配置页
        .state('config',{
            url:'/config',
            templateUrl:'dist/view/config.html',
            controller: 'configController'
        })
         //配置页-版本
         .state('config.version',{
             url:'/version',
             templateUrl:'dist/view/template/version.html',
             // views:{
             //    "first" : {
             //        templateUrl:'dist/view/template/sortConfig.html',
             //    },
             //     "second" : {
             //         templateUrl:'dist/view/template/displaySecondPage.html',
             //     },
             //     "three" : {
             //         templateUrl:'dist/view/template/columnConfig.html',
             //     }
             // }

         })
         // // 配置页-显示
         .state('config.display',{
             url:'/display',
             templateUrl:'dist/view/template/displaySecondPage.html',
             controller: function($state){
                 $state.go('config.first');//默认显示第一个tab
             }
         })
         // 配置页-一级页面
         .state('config.first',{
             url:'/first',
             templateUrl:'dist/view/template/displayFirstPage.html',
             controller : "firstPageController"
         })
         // 配置页-一级页面-显示天数
        .state('config.first.displayDays',{
            url:'/displayDays',
            templateUrl:'dist/view/template/displayDays.html',
        })
        // 配置页-一级页面-显示合并项
        .state('config.first.displayCombine',{
            url:'/displayCombine',
            templateUrl:'dist/view/template/displayCombine.html',
        })
         //配置页-二级页面
         .state('config.second',{
             url:'/second',
             templateUrl:'dist/view/template/displaySecondPage.html',
             controller: function($scope,$state){
                 $state.go('config.second.column');//默认显示第一个tab
             }
             // abstract:true
             // views: {
             //     'column': {
             //         templateUrl: 'dist/view/template/columnConfig.html',
             //     },
             //     'sortColumn': {
             //         templateUrl: 'dist/view/template/sortConfig.html',
             //     },
             // }
         })
         //配置页-二级页面-显示排序
        .state('config.second.column',{
            url:'/column',
            templateUrl:'dist/view/template/columnConfig.html',
            controller : "columnController",
        })
         //配置页-二级页面-多列排序
        .state('config.second.sortColumn',{
            url:'/sortColumn',
            templateUrl:'dist/view/template/sortConfig.html',
            controller : "sortController"
        })
         //配置页-三级页面
         .state('config.three',{
             url:'/three',
             templateUrl:'dist/view/template/columnConfig.html',
         })
         .state('config.rule',{
             url:'/rule',
             templateUrl:'dist/view/template/scheduleRule.html',
             controller : "ruleController"
         })
         .state('config.scheme',{
             url:'/scheme',
             templateUrl:'dist/view/template/schedulePlan.html',
             controller: "planController"
         })
         .state('config.papRule',{
             url:'/papRule',
             templateUrl:'dist/view/template/papRule.html',
             controller: 'papRuleController'
         })
         .state('config.admin',{
             url:'/admin',
             templateUrl:'dist/view/template/adminDisplay.html',
             controller: function($state){
                 $state.go('config.defaultDisplay')
             }
         })
         .state('config.defaultDisplay',{
             url:'/defaultDisplay',
             templateUrl:'dist/view/template/adminDisplay.html',
             controller: 'adminConfigController'
         });

    //============================多语言================================//
    //指明加载哪些语言配置文件
    $translateProvider.useStaticFilesLoader({
        prefix: './language/',//指定文件前缀.
        suffix: '.json'// 指定文件后缀.
    });
    var lang = 'zh-cn';//设置默认的语言
    // var lang = 'en-us';//设置默认的语言
    // var lang = window.localStorage.lang||'en-us';//设置默认的语言
    $translateProvider.preferredLanguage(lang); //加载默认已注册的语言
}]);