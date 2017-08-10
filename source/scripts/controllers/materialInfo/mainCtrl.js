/**
 * Created by duww on 2017/4/11.
 */
app.controller('mainCtrl', function($scope, $rootScope, $http, $window, $location, $interval,$timeout,$q,$state,tool) {
//	console.log($location["$$url"]);
	if($location.$$url == "/date" || $location.$$url == ""){
		$scope.isDate = "active";
		$scope.isMaterialName = "";
	}else{
		$scope.isMaterialName = "active";	
		$scope.isDate = "";		
	}

	$scope.goDate = function(){
		$scope.isMaterialName = "";	
		$scope.isDate = "active";		
	}
	
	$scope.goMaterialName = function(){
		$scope.isMaterialName = "active";	
		$scope.isDate = "";		
	}
	
	$scope.showList = function(){
		$(".material-name-box").toggleClass("material-name-active");
		$(".material-name-box div").toggle();
	}
	
	$scope.$watch('inputname', function(newValue,oldValue){
		if(newValue != ""){
			$(".material-name-box li").each(function(index,thisLi){
		    	if($(this).text().indexOf(newValue) == -1){
		    		$(this).hide();
		    	}else{
		    		$(this).show();
		    	}
		    })
		}else{
			$(".material-name-box li").show();
		}
		    
	});
	
	//跳转到指定物料那一行
	$scope.jump = function(material){
		
		$(".material-name-box div").toggle();
		$(".material-name-box").toggleClass("material-name-active");
		
		$(".material-name-show").text(material).attr("title",material);
		
		$(".pbody").animate(
			{
	    		scrollTop: $(document.getElementById(material)).offset().top - 176 + $(".pbody").scrollTop() + "px"
	    	}, 
	    	{
	      		duration: 500,
	      		easing: "swing"
	    	});
	}
	
	$scope.start_time = sessionStorage.materialStart;
	$scope.end_time = sessionStorage.materialEnd;
	
	//日期筛选
	$scope.time_search = function(){
		$scope.toChildrenTime = {
			startTime: $("#startTime").val(),
			endTime: $("#endTime").val()
		}
		
		$scope.$broadcast('to-child', $scope.toChildrenTime);
	}
});
