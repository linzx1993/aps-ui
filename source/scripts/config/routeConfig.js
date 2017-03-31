/**
 * Created by xujun on 2016/7/1.
 */
app.config(['$stateProvider','$urlRouterProvider','$translateProvider', function($stateProvider,$urlRouterProvider,$translateProvider) {
    // 在这里定义路由
    $urlRouterProvider.otherwise('/preview');
    $urlRouterProvider.when("", "/preview");
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
             templateUrl:'view/template/workArea/displayFirstPage.html',
             controller: function($state){
                 $state.go('config.workArea.displayDays');//默认显示第一个tab
             }
         })
         // 配置页-一级页面
         .state('config.workArea',{
             url:'/workArea',
             templateUrl:'view/template/workArea/displayFirstPage.html',
             controller : "firstPageController",
         })
         // 配置页-一级页面-显示天数
        .state('config.workArea.displayDays',{
            url:'/displayDays',
            templateUrl:'view/template/workArea/displayDays.html',
        })
        // 配置页-一级页面-显示合并项
        .state('config.workArea.displayCombine',{
            url:'/displayCombine',
            templateUrl:'view/template/workArea/displayCombine.html',
        })
        // 配置页-一级页面-翻转显示
        .state('config.workArea.displayFlip',{
            url:'/flip',
            templateUrl:'view/template/workArea/displayFlip.html',
        })
         //配置页-二级页面
         .state('config.workUnit',{
             url:'/workUnit',
             templateUrl:'view/template/workUnit/displaySecondPage.html',
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
        .state('config.workUnit.column',{
            url:'/column',
            templateUrl:'view/template/workUnit/columnConfig.html',
            controller : "columnController",
        })
         //配置页-二级页面-多列排序
        .state('config.workUnit.sortColumn',{
            url:'/sortColumn',
            templateUrl:'view/template/workUnit/sortConfig.html',
            controller : "sortController"
        })
         //配置页-功能模块
         .state('config.workMenu',{
             url:'/function',
             templateUrl:'view/template/workMenu/functionPage.html',
             controller :　"functionModuleController",
         })
         //配置页-功能模块-任务池列信息
         .state('config.workMenu.task',{
             url:'/task',
             templateUrl:'view/template/workMenu/taskColumn.html',
             controller :　"taskColumnController",
         })
         //配置页-功能模块-暂存间信息
        .state('config.workMenu.cache',{
            url:'/task',
            templateUrl:'view/template/workMenu/cacheRoom.html',
            controller :　"cacheRoomController",
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