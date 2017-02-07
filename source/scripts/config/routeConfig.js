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
            templateUrl:'view/home.html'
        })
        //排程前页
        .state('preview',{
            url:'/preview',
            templateUrl:'view/preview.html',
            controller: 'previewCtrl'
        })
        //排程过程中页
        .state('progress',{
            url:'/progress',
            templateUrl:'view/progress.html',
            controller: 'progressCtrl'
        })
        //排程后页
        .state('result',{
            url:'/result',
            templateUrl:'view/result.html',
            controller: 'resultCtrl'
        })
        //帮助页
        .state('help',{
            url:'/help',
            templateUrl:'view/help.html',
            controller: 'helpCtrl'
        })
        //配置页
        .state('config',{
            url:'/config',
            templateUrl:'view/config.html',
            controller: 'configController'
        })
         //配置页-版本
         .state('config.version',{
             url:'/version',
             templateUrl:'view/template/version.html',
             // views:{
             //    "first" : {
             //        templateUrl:'view/template/sortConfig.html',
             //    },
             //     "second" : {
             //         templateUrl:'view/template/displaySecondPage.html',
             //     },
             //     "three" : {
             //         templateUrl:'view/template/columnConfig.html',
             //     }
             // }
             controller : "versionController",
         })
         // // 配置页-显示
         .state('config.display',{
             url:'/display',
             templateUrl:'view/template/displaySecondPage.html',
             controller: function($state){
                 $state.go('config.first.displayDays');//默认显示第一个tab
             }
         })
         // 配置页-一级页面
         .state('config.first',{
             url:'/first',
             templateUrl:'view/template/displayFirstPage.html',
             controller : "firstPageController",
         })
         // 配置页-一级页面-显示天数
        .state('config.first.displayDays',{
            url:'/displayDays',
            templateUrl:'view/template/displayDays.html',
        })
        // 配置页-一级页面-显示合并项
        .state('config.first.displayCombine',{
            url:'/displayCombine',
            templateUrl:'view/template/displayCombine.html',
        })
        // 配置页-一级页面-翻转显示
        .state('config.first.displayFlip',{
            url:'/flip',
            templateUrl:'view/template/displayFlip.html',
        })
         //配置页-二级页面
         .state('config.second',{
             url:'/second',
             templateUrl:'view/template/displaySecondPage.html',
             controller: "secondPageController",
             // abstract:true
             // views: {
             //     'column': {
             //         templateUrl: 'view/template/columnConfig.html',
             //     },
             //     'sortColumn': {
             //         templateUrl: 'view/template/sortConfig.html',
             //     },
             // }
         })
         //配置页-二级页面-显示排序
        .state('config.second.column',{
            url:'/column',
            templateUrl:'view/template/columnConfig.html',
            controller : "columnController",
        })
         //配置页-二级页面-多列排序
        .state('config.second.sortColumn',{
            url:'/sortColumn',
            templateUrl:'view/template/sortConfig.html',
            controller : "sortController"
        })
         //配置页-三级页面
         .state('config.three',{
             url:'/three',
             templateUrl:'view/template/columnConfig.html',
         })
         .state('config.rule',{
             url:'/rule',
             templateUrl:'view/template/scheduleRule.html',
             controller : "ruleController"
         })
         .state('config.scheme',{
             url:'/scheme',
             templateUrl:'view/template/schedulePlan.html',
             controller: "planController"
         })
         // .state('config.papRule',{
         //     url:'/papRule',
         //     templateUrl:'view/template/papRule.html',
         //     controller: 'papRuleController'
         // })
         .state('config.admin',{
             url:'/admin',
             templateUrl:'view/template/adminDisplay.html',
             controller: function($state){
                 $state.go('config.defaultDisplay')
             }
         })
         .state('config.defaultDisplay',{
             url:'/defaultDisplay',
             templateUrl:'view/template/adminDisplay.html',
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