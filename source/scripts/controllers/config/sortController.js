/**
 * Created by yiend on 2017/1/15.
 */
app.controller("sortController",["$rootScope","$scope","$http", "$window", "$location","$timeout","$q","$templateCache","scheduleTableViewModelService",function($rootScope,$scope,$http, $window, $location,$timeout,$q,$templateCache,scheduleTableViewModelService) {
    function getSortConfig(){
        $http.get($rootScope.restful_api.sort_content_config + $scope.locationId)
            .then((res) => {
                //获得get到的数据，渲染页面
                $scope.setDisplayGetData(res);
            }, () => {
                $scope.info.fail("获取数据失败，请检查是否连上服务器")
            });
        //合并项
        $http.get($rootScope.restful_api.sort_combine_config + $scope.locationId)
            .then((res) => {
                $scope.combineItem = $.extend({}, res.data);
                $scope.combineObj = {
                    combine: scheduleTableViewModelService.combinecountItem($scope.combineItem),
                    combineDrag: true,
                    combineActive: false
                }
            });
        //汇总项
        $http.get($rootScope.restful_api.sort_summary_config + $scope.locationId)
            .then((res) => {
                $scope.summaryItem = $.extend({}, res.data);
                $scope.summaryObj = {
                    summary: scheduleTableViewModelService.combinecountItem($scope.summaryItem),
                    summaryDrag: true,
                    summaryActive: true
                }
            });
    }
    //创建车间树
    $scope.createWorkshop();

    //渲染数据
    getSortConfig();

    //初始化拖拽
    $scope.clickLiGetItem();

    /**多列排序信息配置点击保存进行发送数据**/
    $scope.saveSortContent = () => {
        let postData = $scope.getDisplayPostData("请至少选择一项进行排序");
        //检测数据是否正确
        if(!postData){
            return;
        }
        $http.put($rootScope.restful_api.sort_content_config + $scope.locationId,postData)
            .then(function(response){
                if(response.data === true){
                    $scope.info.success("数据保存成功");
                }
            },function(){
                $scope.info.fail("数据保存失败");
            });
        //合并项
        let combineP = document.getElementsByClassName("combine-item")[0].getElementsByTagName("span");
        $scope.combineItem.selectList = [];
        for(let i = 0;i < combineP.length;i ++){
            let value = combineP[i].getAttribute("data-value");
            $scope.combineItem.optionList.forEach(function(item){
                if(item.valueContent == value){
                    $scope.combineItem.selectList.push(item);
                }
            })
        }
        //空的情况下暂时使用还原功能
        if($scope.combineItem.selectList.length === 0){
            $scope.combineItem.selectList = null;
            $http.delete($rootScope.restful_api.sort_combine_config + $scope.locationId,$scope.combineItem)
                .then(function(response){
                    //$scope.info.success("数据保存成功");
                },function(res){
                    $scope.info.fail("合并项保存失败");
                })
        }else{
            $http.put($rootScope.restful_api.sort_combine_config + $scope.locationId,$scope.combineItem)
                .then(function(response){
                    //$scope.info.success("数据保存成功");
                },function(){
                    $scope.info.fail("合并项保存失败");
                })
        }
        //汇总项
        let summaryP = document.getElementsByClassName("Summary-item")[0].getElementsByTagName("span");
        $scope.summaryItem.selectList = [];
        for(let i = 0;i < summaryP.length;i ++){
            let value = summaryP[i].getAttribute("data-value");
            $scope.summaryItem.optionList.forEach(function(item){
                if(item.valueContent == value){
                    $scope.summaryItem.selectList.push(item);
                }
            })
        }
        //空的情况下暂时使用还原功能
        if($scope.summaryItem.selectList.length === 0){
            $scope.summaryItem.selectList = null;
            $http.delete($rootScope.restful_api.sort_summary_config + $scope.locationId,$scope.summaryItem)
                .then(function(response){
                    //$scope.info.success("数据保存成功");
                },function(res){
                    $scope.info.fail("汇总项保存失败");
                })
        }else{
            $http.put($rootScope.restful_api.sort_summary_config + $scope.locationId,$scope.summaryItem)
                .then(function(response){
                    //$scope.info.success("数据保存成功");
                },function(res){
                    $scope.info.fail("汇总项保存失败");
                })
        }
    };

    /**多列排序信息还原数据**/
    $scope.resetSortConfig = () => {
        $http.delete($rootScope.restful_api.sort_content_config + $scope.locationId)
            .then(function(res){
                $("#all-item").find(".js-move").remove();
                //获得get到的数据，渲染页面
                $scope.setDisplayGetData(res);
                $scope.info.success("还原配置成功");
            },function(){
                $scope.info.fail("还原配置失败");
            });
        //还原合并项
        $http.delete($rootScope.restful_api.sort_combine_config + $scope.locationId,null)
            .then(function(response){
                $scope.combineItem = $.extend({},response.data);
                $scope.combineObj = {
                    combine : scheduleTableViewModelService.combinecountItem($scope.combineItem),
                    combineDrag : true,
                    combineActive : false
                }
            },function(res){
                $scope.info.fail("合并项保存失败");
            });
        //还原汇总项
        $http.delete($rootScope.restful_api.sort_summary_config + $scope.locationId,null)
            .then(function(response){
                $scope.summaryItem = $.extend({},response.data);
                $scope.summaryObj = {
                    summary : scheduleTableViewModelService.combinecountItem($scope.summaryItem),
                    summaryDrag : true,
                    summaryActive : true
                }
            },function(res){
                $scope.info.fail("汇总项保存失败");
            })
    };

    //删除||选中-合并和汇总项
    $scope.addItem = (data,$event) => {
        data.show = true;
        $event.stopPropagation();
    };
    $scope.deleteDragItem = (data,$event) =>{
        data.show = false;
        //$event.target.parentNode.parentNode;
        //console.log($event.target.parentNode.parentNode.nextElementSibling);
    };
    //根据点击不同的车间选择不同的显示项
    $("#columnWorkshop").on("click", ".select-status", (e) => {
        //根据点击的车间ID
        $scope.locationId = e.target.getAttribute("data-location-id");
        $(".select-status").removeClass("active");
        $(e.target).addClass("active");
        //移除临时拖拽项
        $(".js-move").remove();
        //根据不同的车间ID进行显示
        getSortConfig();
    });
}]);