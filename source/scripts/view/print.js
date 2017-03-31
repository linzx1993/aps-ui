/**
 * Created by duww on 2016/12/12.
 * 
 */
(function(){
	console.log("a");
	var $body = $("body");

	//默认纵向
	creatPrint(creatPrint);
	
	
	$body.on("click","button",function(){
        var printType;
		var thisWidth = "";
		if($(this).hasClass("transverse")){
			printType = "transverse";
		}else if($(this).hasClass("vertical")){
			printType = "vertical";
		}else{
			$(".printBox").last().removeClass("nextpage");
			document.close();
			window.print();
			return;
		}
		creatPrint(printType);		
	});
	
	//更加传入的宽度来分割表格
	 function creatPrint(printType){
	 	$(".printBody").show();
		$(".newPrint").remove();
	 	//一页高度
	 	var thisHeight = 0;
	 	var thisWidth = 0;
	 	var thisPageHeight = 0;
	 	var sumcel = 0;
	 	var isIE = !!window.ActiveXObject || "ActiveXObject" in window;//是否是IE浏览器
	 	
	 	if(isIE){
	 		if(printType == "transverse"){
	 			thisWidth = 1026;
	 			thisHeight = 680;
	 		}else{
	 			thisWidth = 680;
	 			thisHeight = 1026
	 		}
	 	}else{
	 		if(printType == "transverse"){
	 			thisWidth = 1036;
	 			thisHeight = 700;
	 		}else{
	 			thisWidth = 700;
	 			thisHeight = 1036;
	 		}
	 	}
	 	$body.width(thisWidth);
	 	$("h1").width(thisWidth);
	 	
	 	//首页获取标题
	 	var thisPageHeight = $(".printBody h1").outerHeight(true);
	 	var tableTr = $("tr");
	 	var newPrint = $("<div class='newPrint' style='text-align:center;vertical-align:middle'></div>");
	 	var printBox = $("<div class='printBox nextpage'><table style='width:100%;text-align:center;border-collapse:collapse'></table></div>");
	 	$(".printBody h1").clone().insertBefore(printBox.find("table"));
	 	
	 	//插入页面
	 	$body.append(newPrint);
	 	$(".newPrint").append(printBox);
	 	
	 	
	 	//最后一页
	 	var lastPrintBox = $(".printBox");
	 	
	 	//保存单元格宽度
	 	var thead = tableTr.eq(0);
	 	var th = tableTr.find("th");
	 	var thWidth = [];
	 	var lastLeft = 0;
	 	var celNum = th.length;
	 	var changeSum = false;
	 	for(var i = 0 ; i < celNum ; i++){   
	 		//获取合计数的列数
	 		if(th.eq(i).text().trim() == "合计数"){
	 			sumcel = i;
	 		}
	 		
	 		//保存每列宽度
	 		if(isIE){
				if(i == celNum-1){
					thWidth.push(thead.width()-th.eq(i).position().left-2);
				}else{
					var thisWidth = th.eq(i+1).position().left-lastLeft-2;
					lastLeft = th.eq(i+1).position().left
					thWidth.push(thisWidth);
				}
			}else{
				thWidth.push(th.eq(i).width());
			}  
			console.log(thWidth);
	 	};
	 	
	 	for(var i = 0 , l = tableTr.length ; i < l ; i++){
	 		var thisTr = tableTr.eq(i);
	 		var trClone = thisTr.clone();
	 		var thisTrHeight = thisTr.outerHeight(true);
	 		console.log(lastPrintBox.height() < thisHeight);
	 		if(lastPrintBox.height() < thisHeight){
		
	 			if(changeSum){
	 				if(thisTr.find("td").length < celNum){
	 					
	 					$("<td style='padding:4px';border:1px solid rgb(204,204,204)'></td>").insertAfter(trClone.find("td").eq(sumcel-1));
	 				}else{
	 					changeSum = false;
	 				}
	 			}
	 			lastPrintBox.find("table").append(trClone);
	 			if(lastPrintBox.height() > thisHeight){
	 				lastPrintBox.find("tr").last().remove();
	 				lastPrintBox.height(thisHeight);
	 				i--;
	 			}
	 			if(i == 0){
	 				var thisBoxTd = $(".printBox").find("tr").eq(0).find("th");			
		 			for(let i = 0 , l = thWidth.length ; i < l ; i++){
		 				thisBoxTd.eq(i).width(thWidth[i]);
		 			}
	 			}
	 		}else{
	 			//设置单元格宽度
	 			var thisBoxTd;
	 			if(printBox.find("th").length>0){
	 				thisBoxTd = printBox.find("tr").eq(0).find("th");
	 			}else{
	 				thisBoxTd = printBox.find("tr").eq(0).find("td");
	 			}
	 			
	 			for(let i = 0 , l = thWidth.length ; i < l ; i++){
	 				thisBoxTd.eq(i).width(thWidth[i]);
	 			}
	 			
	 			//开始下一页
	 			thisPageHeight = thisTrHeight;
	 			printBox = $("<div class='printBox nextpage'><table style='width:100%;text-align:center;border-collapse:collapse'></table></div>");
	 			newPrint.append(printBox);
	 			lastPrintBox = $(".printBox").last();
	 			
	 			if(thisTr.find("td").length < celNum){
	 				$("<td style='padding:4px'></td>").insertAfter(trClone.find("td").eq(sumcel-1));
	 				changeSum = true;
	 			}
	 			lastPrintBox.find("table").append(trClone);
	 			var thisBoxTd = lastPrintBox.find("tr").eq(0).find("td");			
	 			for(let i = 0 , l = thWidth.length ; i < l ; i++){
	 				thisBoxTd.eq(i).width(thWidth[i]);
	 			}
	 		}
	 	}
	 	
//	 	document.write(newPrint.html());

		$(".printBody").hide();
	 }
	
})();
