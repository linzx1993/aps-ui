/**
 * Created by duww on 2017/4/11.
 */
app.directive('onFinishRenderFilters', function ($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function() {
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    };
});
app.controller('dateCtrl', function($scope, $rootScope, $http, $window, $location, $interval,$timeout,$q,tool,http) {

	var deferred = $q.defer();
    var promise = deferred.promise;
	
	let colList = [1];
    
    promise
    	.then(function(){  	
			//查询初始数据
			if($scope.$parent.toChildrenTime){
				$scope.getData($scope.$parent.toChildrenTime.startTime,$scope.$parent.toChildrenTime.endTime);
			}else{
				$scope.getData(sessionStorage.materialStart,sessionStorage.materialEnd);
			}
    	});
    deferred.resolve();
	//resize
	$(window).on("resize",function(){
		tool.setTableHeadWidth($(".main"),0);
	});
	
	//父级数据变化
	$scope.$on('to-child', function(e, newDate) {
		$scope.getData(newDate.startTime,newDate.endTime);
	});
	
	/**
	 *desc:查询数据
	 *time:2017-04-24
	 *author:dww
	 *@param: startTime 开始时间
	 *@param: endTime 结束时间 
	 **/
	$scope.getData = function(startTime,endTime){
		let postData = {
				searchType: 'time',
				startTime: startTime,
				endTime: endTime
			},
			postUrl = $rootScope.restful_api.material_info;
		//查询数据
		http.post({
			url: postUrl,
			data: postData,
			successFn: function(res){
				$scope.renderPaper(res.data);
			}
		})
	}
	
	/**
	 *desc:渲染页面
	 *time:2017-04-24
	 *author:dww
	 *@param: renderData 从后台获取的渲染数据
	 **/
	$scope.renderPaper = function(renderData){
		//先将数据渲染到页面
		$scope.tableBody = renderData;
		
		//合并单元格
		$scope.countCell(renderData);
	}
	
	/**
	 *desc:合并单元格
	 *time:2017-04-24
	 *author:dww
	 *@param: renderData 从后台获取的渲染数据
	 **/
	$scope.countCell = function(renderData){
		if(renderData.length){
			let dataList = renderData,
				firstDate = dataList[0].datetime,
				colNum = 1;
			
			colList = [1];
			//计算合并信息
			for(let i = 1 , l = dataList.length ; i < l ; i++){
				let thisDate = dataList[i].datetime;
				if(firstDate == thisDate){
					colNum ++ ;
					if(i == l-1){
						colList.push(colList[colList.length - 1] + colNum);
					}
				}else{
					colList.push(colList[colList.length - 1] + colNum);
					colNum = 1;
					firstDate = thisDate;
				}
			};

		}else{
			$timeout(function(){
				$scope.dataDown = true;
				tool.setTableHeadWidth($(".main"),0);
			},0)
		}
			
	}
	
	//页面进行合并
	$scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {

		var jTr = $("tbody").find("tr");
		for(var i = 0 , l = jTr.length ; i < l ; i++){
			var thisIndex = colList.indexOf(i + 1);
			if(thisIndex > -1){
				var rowSpan = colList[thisIndex + 1] - colList[thisIndex];
				jTr.eq(i).find(".tr-date").attr("rowSpan" , rowSpan);
			}else{
				jTr.eq(i).find(".tr-date").remove();
			}
		}
		$scope.dataDown = true;
		tool.setTableHeadWidth($(".main"),0);
	});
	
});