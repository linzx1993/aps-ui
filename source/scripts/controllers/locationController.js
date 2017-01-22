/**
 * Created by duww on 2016/8/23.
 */
app.controller('locationCtrl', function($scope, $rootScope, $http, $window, $location, $timeout, scheduleTableViewModelService) {
	
	$("#do_detail_dialog_1").parent().remove();
	$("#do_detail_dialog").parent().remove();
	
	//地点信息
	var locationInfo;
	//dom结构
	var optionHtml = '<select id="test-select" multiple="multiple">';
	var ulHtml = '<ul class="root">';
	
	//选中状态
	var UNSELECT = "unselect",
		SELECTED = "selected",
		SELECTSOME = "select-some",
		SELECTSTATUS = "select-status";
	
    //API接口
    if($rootScope.local_test){
    	
    	//本地方法
    	locationInfo = location_info;
    	creatUl(locationInfo)
    	for(var i in locationInfo){
    		var nextLevelLocation = locationInfo[i].nextLevelLocation;
	    	var locationName = locationInfo[i].locationName;
	    	creatOption(nextLevelLocation,locationName);
    	}
	    	
    	
    }else{
    	//非本地方法
    	var thisUrl = $rootScope.restful_api.get_location_info;
    	$http.get(thisUrl).then(
    		function(res){
    			var resData = res.data;
    			creatUl(resData);
    			
				//添加到DOM
			    $(".ul-box").append($(ulHtml));
			    
				//打开和收起
				$(".title span").on("click",function(){
					if($(this).parent().next().css("display") == "block"){
						$(this).parent().next().hide();
						$(this).removeClass("title-close").addClass("title-open");
					}else{
						$(this).parent().next().show();
						$(this).removeClass("title-open").addClass("title-close");
					}
					
				});
				//只打开第一级
				$(".title span").click();
				$(".root").children(".title").find("span").click();
				//刷新节点的选择状态
				$(".title").each(function(){
					var thisTitle = $(this);
					var thisUl = thisTitle.next();
					
		    		if(thisUl.find("."+SELECTED).length < 1){
		    			thisTitle.find("."+SELECTSTATUS).removeClass(SELECTSOME).removeClass(SELECTED).addClass(UNSELECT);
		    		}else if(thisUl.find("."+UNSELECT).length < 1){
		    			thisTitle.find("."+SELECTSTATUS).removeClass(SELECTSOME).removeClass(UNSELECT).addClass(SELECTED);
		    		}else{
		    			thisTitle.find("."+SELECTSTATUS).removeClass(UNSELECT).removeClass(SELECTED).addClass(SELECTSOME);
		    		}
				});
				$(".item").each(function(){
					var thisItem = $(this);
					if(thisItem.find("."+SELECTED).length > 0){
						thisItem.find(".location-name").addClass("item-select");
					}
				});
				
				
				
				//绑定选择事件
				var rootUl = $(".root");
		    	rootUl.on("click","."+SELECTSTATUS,function(){
		    		var thisSelect = $(this);
		    		selectStatusChange(thisSelect);	
		    	});
    		},
    		function(res){
    			
    		}
    	);
    	
    	
    }
    

    /**
	 * 创建树状图
	 * @param {Object} 后台的JSON数据
	 * 
	 * 
	 */
    function creatUl(obj,fatherRule){
    	for(var i in obj){
    		var thisOption = obj[i],
    			hasApsRule = thisOption.hasApsRule,
    			isChosen = thisOption.isChosen,
    			locationId = thisOption.locationId,
    			locationName = thisOption.locationName,
    			nextLevelLocation = thisOption.nextLevelLocation;
    		
    		var choose = "";
    		var hasRule = "";
    		//是否已选择
    		if(isChosen){
    			choose = SELECTED;
    		}else{
    			choose = UNSELECT;
    		}
    		//若父级有排程规则，则子级必定可操作
    		if(fatherRule){
    			hasApsRule = true;
    		}
    		//是否有排程规则
    		if(!hasApsRule){
    			hasRule = " disabled";
    		}
    		
    		if($.isEmptyObject(nextLevelLocation)){
    			ulHtml += '<li class="item"><i class="select-status '+choose+hasRule+'" location-id="'+locationId+'"></i><span class="location-name">'+locationName+'</span></li>';
    		}else{
    			ulHtml += '<li class="title"><i class="select-status '+choose+hasRule+'" location-id="'+locationId+'"></i><span class="location-name title-close">'+locationName+'</span></li><ul>';
    			creatUl(nextLevelLocation,hasApsRule);
    		}
    		
    	}
    	
    	ulHtml += '</ul>';
    }
    
    /**
	 * 更新选择状态
	 * @param {} 当前点击的项
	 * 
	 * 
	 */
    function selectStatusChange(thisSelect){
    	var thisSelect = thisSelect;
    	var thisFatherUl = thisSelect.parents("ul");
    	
    	var thisNextUl = thisSelect.parent().next("ul");
    	
    	//本身及所有后代的改变
    	if(thisSelect.hasClass(UNSELECT) || thisSelect.hasClass(SELECTSOME)){
    		thisSelect.removeClass(UNSELECT).removeClass(SELECTSOME).addClass(SELECTED);
    		if(thisSelect.parent().hasClass("item")){
    			thisSelect.next().addClass("item-select");
    		}
    		thisNextUl.find("."+SELECTSTATUS).removeClass(UNSELECT).removeClass(SELECTSOME).addClass(SELECTED);
    		thisNextUl.find(".item span").addClass("item-select");
    	}else{
    		thisSelect.removeClass(SELECTED).addClass(UNSELECT);
    		if(thisSelect.parent().hasClass("item")){
    			thisSelect.next().removeClass("item-select");
    		}
    		thisNextUl.find("."+SELECTSTATUS).removeClass(SELECTED).addClass(UNSELECT);
    		thisNextUl.find(".item span").removeClass("item-select");
    	}
    	
    	//处于其影响范围内的祖先的改变
    	thisSelect.parents("ul").each(function(){
    		var thisUl = $(this);
    		var thisUlPrev = thisUl.prev().find("."+SELECTSTATUS);
    		
    		if(thisUl.find("."+SELECTED).length < 1){
    			thisUlPrev.removeClass(SELECTSOME).removeClass(SELECTED).addClass(UNSELECT);
    		}else if(thisUl.find("."+UNSELECT).length < 1){
    			thisUlPrev.removeClass(SELECTSOME).removeClass(UNSELECT).addClass(SELECTED);
    		}else{
    			thisUlPrev.removeClass(UNSELECT).removeClass(SELECTED).addClass(SELECTSOME);
    		}
    		
    	});
    }
    
    //点击确定，向后台传选中数据
    $scope.sure = function(){
    	var allSelect = $("."+SELECTED);
    	var locationList = [];
    	var locationObj = {}
//  	var allSelecteds=$(".select-some");
    	
//  	allSelecteds.each(function(){
//  		var thisI=$(this);
//  		var locationid2=thisI.attr("location-id");
//  		locationList.push(locationid2);
//  	})   	
    	
    	allSelect.each(function(){
    		var thisSelect = $(this),
    			thisLocationId = thisSelect.attr("location-id");
    		locationList.push(thisLocationId);
    	});
    	
    	if(locationList.length == 0){
			layer.alert('请选择要排程的地点', {
				skin: 'layer-alert-themecolor' //样式类名
			});
    		return;
    	}
    	
    	locationObj.locationIdList = locationList;

    	locationObj = JSON.stringify(locationObj);
    	
    	$http.post($rootScope.restful_api.save_location_info,locationObj,locationObj).then(
    		function(res){
				$location.path("/preview").replace();
    		},
    		function(res){
				layer.alert('地点配置错误', {
					skin: 'layer-alert-themecolor' //样式类名
				});
    		}
    	);
    }
        
});