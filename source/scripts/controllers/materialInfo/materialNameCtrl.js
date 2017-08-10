/**
 * Created by duww on 2017/2/14.
 */
app.controller('materialNameCtrl', function($scope, $rootScope, $http, $window, $location, $interval,$timeout,$q,tool,$state,http) {
//	if($scope.$parent.isDate){
//		$state.go("date");
//	}
	var deferred = $q.defer();
    var promise = deferred.promise;
	
	let materialNameList = [1],
		materialCodeList = [1],
		countNumList = [];
    
    promise
    	.then(function(){
			//根据初始条件查询数据
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
				searchType: 'materialName',
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
				firstName = dataList[0].materialName,
				firstCode = dataList[0].materialCode,
				materialName = [],
				countTrList = [1],
				materialNameColNum = 1,
				materialCodeColNum = 1,
				countTrNum = 1;
								
			countNumList = [];
			materialCodeList = [1];
			materialNameList = [1];
			//计算合并信息
			countNumList[0] = dataList[0].quantity;
			materialName.push(firstName);
			for(let i = 1 , l = dataList.length ; i < l ; i++){
				let thisName = dataList[i].materialName,
					thisCode = dataList[i].materialCode;

				//如果和前一个物料同名，与上一行合并
				if(firstName == thisName){
					materialNameColNum ++ ;

					//如果是最后一行
					if(i == l-1){
						materialNameList.push(materialNameList[materialNameList.length - 1] + materialNameColNum);
					}	
					//如果物料编码一样
					if(firstCode == thisCode){
						materialCodeColNum ++ ;
						countNumList[countNumList.length-1] += dataList[i].quantity;
						if(i == l-1){
							materialCodeList.push(materialCodeList[materialCodeList.length - 1] + materialCodeColNum);
						}
					}else{
						countTrNum ++;
						materialCodeList.push(materialCodeList[materialCodeList.length - 1] + materialCodeColNum);
						materialCodeColNum = 1;
						firstCode = dataList[i + 1].materialCode;
						countNumList.push(dataList[i].quantity);
					}		    				
				}else{
					countTrList.push(countTrList[countTrList.length - 1] + countTrNum);
					countTrNum = 1;
					materialNameList.push(materialNameList[materialNameList.length - 1] + materialNameColNum);
					materialNameColNum = 1;
					firstName = thisName;
					materialName.push(firstName);
					materialCodeList.push(materialCodeList[materialCodeList.length - 1] + materialCodeColNum);
					materialCodeColNum = 1;
					firstCode = thisCode;
					countNumList.push(dataList[i].quantity);
				}		
			};

				$rootScope.materialNameList = materialName;		
		}else{
			$timeout(function(){
				$scope.dataDown = true;
				tool.setTableHeadWidth($(".main"),0);
			},0)
		}
			
	}
	
	//开始合并单元格
	$scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
		var jTr = $("tbody").find("tr");
			for(var i = 0 , l = jTr.length ; i < l ; i++){
				var thisIndex = materialNameList.indexOf(i + 1);
				if(thisIndex > -1){
					var rowSpan = materialNameList[thisIndex + 1] - materialNameList[thisIndex];
					jTr.eq(i).find(".tr-materialName").attr("rowSpan" , rowSpan);
				}else{
					jTr.eq(i).find(".tr-materialName").remove();
				}
			}
			var isEdeeed = true;
			for(var i = 0 , l = jTr.length ; i < l ; i++){
				var thisIndex = materialCodeList.indexOf(i + 1);
				if(thisIndex > -1){
					isEdeeed = !isEdeeed;
					var rowSpan = materialCodeList[thisIndex + 1] - materialCodeList[thisIndex];
					jTr.eq(i).find(".tr-materialCode").attr("rowSpan" , rowSpan);
					jTr.eq(i).find(".tr-count").attr("rowSpan" , rowSpan).text(countNumList.shift());
				}else{
					jTr.eq(i).find(".tr-materialCode").remove();
					jTr.eq(i).find(".tr-count").remove();
				}
				jTr.eq(i).addClass(isEdeeed ? "tr-edeeed" : "tr-ffffff");
			}

			$scope.dataDown = true;
			tool.setTableHeadWidth($(".main"),0);
		});
});