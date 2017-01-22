/**
 * Created by xujun on 2016/6/29.
 * �Զ���Ĺ��߿�
 * v1.0
 */

//����ռ�
var xujun_tool = {};

/**
 * ��stirngתΪdate����
 * @param str����ʽ��2016-06-28������ʽ
 * @returns date ����
 */
xujun_tool.stringToDate = function(str) {
	return str == undefined ? undefined : new Date(str.replace(/-/g, "/"));
}

/**
 * ��dateתΪstirng����
 * @param date ����
 * @returns {string}�����ַ��磬��ʽ��2016-06-28������ʽ
 */
xujun_tool.dateToString = function(date) {
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	if(month < 10) {
		month = "0" + month;
	}
	var day = date.getDate();
	if(day < 10) {
		day = "0" + day;
	}
	return year + "-" + month + "-" + day;
}

/**
 * ��ݱ���ɫ��ȡ��ɫ���ߺ�ɫ��
 * @param backgroundColor ������ɫֵ����#FFFFFF
 * @returns �ڻ�׵�RGBֵ
 */
xujun_tool.getTextColor = function(backgroundColor) {
	if(backgroundColor.length > 10) {
		return "#000000";
	}

	var threshold = 128; //��ֵ
	var r = parseInt(backgroundColor.substring(1, 3), 16) * 0.3;
	var g = parseInt(backgroundColor.substring(3, 5), 16) * 0.59;
	var b = parseInt(backgroundColor.substring(5, 7), 16) * 0.11;
	var rgb = r + g + b; //�Ȱ�ͼ��ҶȻ�
	if(rgb > threshold) //Ȼ��ĳһ��ֵ���ж�ֵ��
	{
		return "#000000";
	} else {
		return "#FFFFFF";
	}
}

/**
 * 从页面input标签内获取参数,转码后返回
 * @param {string} input或者其父元素的class
 *
 * @return{string} 包含从input中读取的、经过转码的参数的数组
 */
xujun_tool.getFromInput = function(className) {
	if(typeof(className) != "string") {
		return;
	} else {
		var thisEle = $(className);

		if(thisEle.is("input")) {
			return encodeURIComponent(thisEle.val().trim());
		} else if(thisEle.find("input").length == 1) {
			return encodeURIComponent(thisEle.find("input").val().trim());
		} else if(thisEle.find("input").length > 1) {
			var returnList = [];
			thisEle.find("input").each(function() {
				returnList.push(encodeURIComponent($(this).val().trim()));
			});
			return returnList;
		}
	}
}

/**
 * 从页面input标签内获取参数,不  转码后返回！！
 * @param {string} input或者其父元素的class
 *
 * @return{string} 包含从input中读取的参数的数组
 */
xujun_tool.getFromInput_nocode = function(className) {
	if(typeof(className) != "string") {
		return;
	} else {
		var thisEle = $(className);

		if(thisEle.is("input")) {
			return thisEle.val().trim();
		} else if(thisEle.find("input").length == 1) {
			return thisEle.find("input").val().trim();
		} else if(thisEle.find("input").length > 1) {
			var returnList = [];
			thisEle.find("input").each(function() {
				returnList.push($(this).val().trim());
			});
			return returnList;
		}
	}
}

/**
 * 简单提示信息弹窗控件
 * @param {string} 要显示的提示信息文本(必填)
 * @param {Boolean} false为alert弹窗，true为confirm弹窗，默认为false
 * @param {Function} 点击确定执行的函数
 * @return{Boolean} confirm弹窗会返回用户的选择
 */
//xujun_tool.changeDialog = function(text, dialogType, fn) {
//	//检测是否传入提示信息
//	if(!text) {
//		return;
//	}
//	//弹窗类型的检测
//	var typeOfDialog = typeof(dialogType);
//	if(typeOfDialog != "boolean" && typeOfDialog != "undefined") {
//		return;
//	}
//	var dialogText = text,
//		dialogType = !!dialogType,
//		oButtons = {},
//		bReturn = false,
//		jDialogWindow = $("#dialog-window"),
//		jP = jDialogWindow.find("p");
//
//	//构造2种不同的选项结构
//	if(dialogType) {
//		oButtons = {
//			"确定": function() {
//				fn();
//				$(this).dialog("close");
//			},
//			"取消": function() {
//				$(this).dialog("close");
//			}
//		}
//	} else {
//		oButtons = {
//			"确定": function() {
//				$(this).dialog("close");
//			}
//		}
//	}
//
//	jP.text(dialogText);
//	jDialogWindow.dialog({
//		resizable: false,
//		height: 140,
//		modal: true,
//		buttons: oButtons
//	});
//
//}

/**
 * 进度条
 * @param {elements1} 父元素(必填)
 * @param {elements2} 子元素，进度条(必填)
 * @param {url} 接口地址
 * @param {text} 进度条上显示文本
 * @return{fn} 当进度加载完成后执行的参数方法
 * 
 * @param {String} absUrl 当前的url
 */
xujun_tool.newprogressBar = function(elements1, elements2, url,text,fn, fn2, absUrl){
	var progressbar = $(elements1),
		progressLabel = $(elements2);
	progressbar.show(); //进度条显示
	var i = 0; //循环次数
    function SetProgress() { 
		var progressVal = 0;
			$.ajax({
				type: "get",
				url: url,
				success: function(result) {
					var res = result.success_response;
					fn2(res);
					progressVal = res.rate || 0;    //获取接口数据
					progressbar.children("span").css("width", progressVal + "%"); 
	   				progressLabel.text(text+" "+progressVal + "%");
					if(progressVal || progressVal == 0) { //数据正确
						if(progressVal < 100) {
							var j = setTimeout(SetProgress, 1000);
							if(i > 360) {  
								layer.alert("进度失败，请联系技术人员处理");
								clearTimeout(j);
								progressLabel.text(text+"失败");
							}
						} else {
							progressLabel.text(text+"完成");
							fn(); //参数
						}
					} else { //如果数据错误		      					      				
						layer.alert("进度失败，请联系技术人员处理");
						progressbar.hide(50); //进度条加载完成后隐藏
					}
				},
				headers: {
					"X-Requested-With": "XMLHttpRequest",
					"redirectUrl": absUrl,
					"Authorization":localStorage.getItem("token")||""
				}
			});
		i++;
		console.log(i);
    } 
    SetProgress();//开始加载
}

/**
 * 浏览器及其版本号检测方法
 * 
 * @return{Object} 返回浏览器，和版本号组成的对象。
 */
xujun_tool.getBrowser = function(){		
	var rMsie = /(msie\s|trident\/7)([\w\.]+)/;
    var rTrident = /(trident)\/([\w.]+)/;
    var rFirefox = /(firefox)\/([\w.]+)/; 
    var rOpera = /(opera).+version\/([\w.]+)/;
    var rNewOpera = /(opr)\/(.+)/;
    var rChrome = /(chrome)\/([\w.]+)/;
    var rSafari = /version\/([\w.]+).*(safari)/;
    var ua = navigator.userAgent.toLowerCase();
    var matchBS,matchBS2;
    
    matchBS = rMsie.exec(ua);
    if(matchBS != null){
    	if(matchBS[1].trim() == "msie"){
    		switch(matchBS[2]){
    			case "10.0" : return { browser : "IE", version : "10" };break;
    			case "9.0" : return { browser : "IE", version : "9" };break;
    			case "8.0" : return { browser : "IE", version : "8" };break;
    			case "7.0" : return { browser : "IE", version : "7以下" };break;
    		}
    	}else{
    		return { browser : "IE", version : "11" }
    	}
    }
    matchBS = rFirefox.exec(ua);  
    if ((matchBS != null)&&(!(window.attachEvent))&&(!(window.chrome))&&(!(window.opera))) {  
      return { browser : matchBS[1] || "", version : matchBS[2] || "0" };
    }
    matchBS = rOpera.exec(ua);         
    if ((matchBS != null)&&(!(window.attachEvent))) {     
      return { browser : matchBS[1] || "", version : matchBS[2] || "0" };
    }
    matchBS = rChrome.exec(ua);  
    if ((matchBS != null)&&(!!(window.chrome))&&(!(window.attachEvent))) {
      matchBS2 = rNewOpera.exec(ua);       
      if(matchBS2 == null){
        return { browser : matchBS[1] || "", version : matchBS[2] || "0" };
      }else{
        return { browser : "Opera", version : matchBS2[2] || "0" };
      }  
    }
    matchBS = rSafari.exec(ua);          
    if ((matchBS != null)&&(!(window.attachEvent))&&(!(window.chrome))&&(!(window.opera))) {   
      return { browser : matchBS[2] || "", version : matchBS[1] || "0" };
    }
    
}

function isEmptyObject(obj){
    for(var i in obj){
        return false
    }
    return true
}
//得到需求数据==处理地点树数据
function getData(locationData) {
    let arr = [];
    for(let name in locationData){
        let obj = {
            name : locationData[name].locationName,
            "locationId" : locationData[name].locationId,
        };
        arr.push(obj);
        if(!isEmptyObject(locationData[name]["nextLevelLocation"])){
            obj.children = getData(locationData[name]["nextLevelLocation"]);
        }
    }
    return arr;
}
//得到需求数据==处理地点树数据(排程后)
function getData_two(locationData) {
    let arr = [];
    let newArr=[];
    var obj={
    	children : ""
    };
    for(let i in locationData){
    	let newObj={
    		locationId : locationData[i].locationId,
    		name : locationData[i].locationName
    	};
    	newArr.push(newObj);
    }
    obj.children = newArr;
    arr.push(obj);
    return arr;
}