/**
 * Created by yiend on 2017/1/16.
 */
app.controller("papRuleController",["$rootScope","$scope","$http", "$window", "$location","$timeout","$q","$templateCache","scheduleTableViewModelService",function($rootScope,$scope,$http, $window, $location,$timeout,$q,$templateCache,scheduleTableViewModelService) {
    $scope.createWorkshop();
    $scope.locationId = $scope.locationId || "01";
    $http.get($rootScope.restful_api.papRule_content_config + $scope.locationId).success(function (res) {
        $scope.papOptionList = res.optionList;
        $scope.papSelectList = res.selectList;
    });
    //根据点击不同的车间选择不同的显示项
    $("#columnWorkshop").on("click", ".select-status", function (e) {
        //根据点击的车间ID
        $scope.locationId = e.target.getAttribute("data-location-id");
        $(".select-status").removeClass("active");
        $(e.target).addClass("active");
        $http.get($rootScope.restful_api.papRule_content_config + $scope.locationId).success(function (res) {
            $scope.papOptionList = res.optionList;
            $scope.papSelectList = res.selectList;
        });
    });

   /**pap规则页面还原数据**/
   $scope.resetPapConfig = () => {
      $http.delete($rootScope.restful_api.papRule_content_config + $scope.locationId)
          .then(function(res){
             $scope.papOptionList = res.data.optionList;
             $scope.papSelectList = res.data.selectList;
             $scope.info.success("还原配置成功");
          },function(){
             $scope.info.fail("还原配置失败");
          })
   };

   /**pap规则页面保存进行发送数据**/
   $scope.savePapConfig = () => {
      let postData = {};
      postData.selectList = [];
      let input = document.getElementsByClassName("papRuleContent")[0].getElementsByTagName("input");
      for(let i = 0,length = input.length;i<length;i++){
         if(input[i].checked){
            let obj = {};
            let thisInput = input[i];
            obj.valueContent = thisInput.getAttribute("data-valueContent");
            obj.valueAlias = thisInput.getAttribute("data-valueAlias");
            postData.selectList.push(obj);
         }
      }
      $http.put($rootScope.restful_api.papRule_content_config + $scope.locationId,postData)
          .then(function(response){
             $scope.info.success("数据保存成功");
          },function(){
             $scope.info.fail("数据保存失败");
          })
   };
}]);