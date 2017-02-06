
app.controller('helpCtrl', function($scope, $rootScope, $interval, $location, $http,$timeout) {   
	
	//用户名
	$scope.userName = $rootScope.userName;
	
	$scope.helpLis = [
        {text : "关于excel导出", url : "view/a.html"},
        {text : "B",  url : "view/b.html"},
        {text : "C",  url : "view/c.html"},
        {text : "D", url : "view/d.html"},
        {text : "E", url : "view/e.html"},
        {text : "F",url : "view/f.html"}
    ];	

	$(".help-left").on("click","li",function(){
		$(this).addClass("click-back").siblings().removeClass("click-back");
	})
	ele2=$(".help-body");
	
	//点击
	$scope.click_li=function($event){
		ee=$($event.target).index()-1;
		$(ele2[ee]).show().siblings(".help-body").hide();
		
		if(ee==0){
			$(".help-p").html("关于excel导出");
		}else if(ee==1){
			$(".help-p").html("B类");
		}else if(ee==2){
			$(".help-p").html("C类");
		}else if(ee==3){
			$(".help-p").html("D类");
		}else if(ee==4){
			$(".help-p").html("E类");
		}else if(ee==5){
			$(".help-p").html("F类");
		}
		if(ee!==0){
			$(".help-left").children("li:first").removeClass("first");
		}
	}
	$timeout(function(){
			$(".help-left").children("li:first").addClass("first");
		},0)
	//搜索
	$scope.search_help=function(){
		var success_search = false;
		$(".help-left").find("b").remove();
		var val=$("#helpSearch").val();
		var allUL=$(".help-content");
		
		$(".help-right").find("span").css("color","#000");
		for(var i=0;i<allUL.length;i++){	
			var sTxt=$(allUL[i]).children("li:first");
			if(val==""){
				return;
			}else{
				if(sTxt.html().indexOf(val)>-1){
					var reg=new RegExp(val,"g");
					sTxt.html(sTxt.html().replace(reg,"<span style='color:#f00;'>"+val+"</span>"));
					success_search = true;
				}
				
			}		
		}
		var allDiv=$(".help-body");
		for(var j=0;j<allDiv.length;j++){
			var nTxt=$(allDiv[j]);
			if(nTxt.html().indexOf(val)>-1){
				$(".help-left").find("li:eq("+j+")").append("<b style='position:absolute;left:18%;color:#f00;'>*</b>");
				success_search = true;
			}
		}
		if(success_search){
			layer.msg('搜索成功，请查看标红数据', {time: 3500,icon: 1});
		}else{
			layer.msg('未搜索到相应内容', {time: 3500,icon: 2});
		}
	}
	//绑定enter按钮
	$(document).keydown(function(event){
		var e=event || window.event || arguments.caller.arguments[0];
		if(e && e.keyCode==13){
			$scope.search_help();
		}
//		alert(arguments.caller);
	})
})