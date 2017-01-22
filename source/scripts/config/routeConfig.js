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
            controller: 'configCtrl'
        })
//      //配置页-版本
//      .state('config.version',{
//          url:'/version',
//          templateUrl:'view/template/version.html',
//      })
//      // 配置页-显示
//      .state('config.display',{
//          url:'/display',
//          templateUrl:'view/template/columnConfig.html',
//      })
//      //配置页-一级页面
//      .state('config.first',{
//          url:'/first',
//          templateUrl:'view/template/sortConfig.html',
//      })
//      .state('config.second',{
//          url:'/second',
//          templateUrl:'view/template/sortConfig.html',
//      })
//      .state('config.three',{
//          url:'/three',
//          templateUrl:'view/template/columnConfig.html',
//      })
//      .state('config.rule',{
//          url:'/rule',
//          templateUrl:'view/template/scheduleRule.html',
//      })
//      .state('config.scheme',{
//          url:'/scheme',
//          templateUrl:'view/template/schedulePlan.html',
//      })
//      .state('config.papRule',{
//          url:'/papRule',
//          templateUrl:'view/template/papRule.html',
//          // controller: 'configCtrl'
//      })
//      .state('config.property',{
//          url:'/workshopProperty',
//          templateUrl:'view/template/workshopProperty.html',
//          // controller: 'configCtrl'
//      })
//      .state('config.defaultDisplay',{
//          url:'/defaultDisplay',
//          templateUrl:'view/template/adminDisplay.html',
//          // controller: 'configCtrl'
//      });

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