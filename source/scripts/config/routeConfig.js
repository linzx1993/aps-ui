app.config(['$stateProvider','$urlRouterProvider', function($stateProvider,$urlRouterProvider) {

	//============================路由配置================================//
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
             controller: "displayController"
         })
         // 配置页-一级页面
         .state('config.workArea',{
             url:'/workArea',
             templateUrl:'view/template/workArea/displayFirstPage.html',
             controller : "firstPageController",
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
             controller: "planController",
			 // onExit: function () {
              //    //如果有临时创建的方案未保存退出，则给出提醒
				//  if(Number(sessionStorage.temporarySchemeLength) > 0){
				//      layer.confirm("你有未保存的临时方案，离开页面将会丢失数据，是否确定离开", {
				// 		 btn: ['确定','取消'] //按钮
				// 	 }, function(){
			 //
				// 	 }, function(){
				// 	     return '/scheme'
				// 	 })
              //    }
			 // }
         })
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
}]);
