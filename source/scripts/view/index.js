/*
* 页面显示js控制（表格部分）。
*/
//点击事件
(function searchBox(){
	var body = $("body");
	//打开和关闭右边栏
	body.on("click",".right-menu-switch",function(){
		thisPositionX = $(this).css("background-position-x");
		if(!!window.ActiveXObject || "ActiveXObject" in window){
			var thisPosition = $(this).css("background-position").split(" ");
			thisPositionX = thisPosition[0];
		}
		$(".right-menu").stop(false,false);
		if(thisPositionX == "0px"){
			//向右移动隐藏
			$(".right-menu").css("overflow","hidden").animate({width:"0px"});
			$(this).css("background-position-x","-24px");
		}else{
			$(".right-menu").css("overflow","inherit").animate({width:"68px"});
			$(this).css("background-position-x","0");
		}
	})
	
	//配置页面，帮助页面返回功能
	$("body").on("click",".page-back",function(){
		console.log("1");
		history.back();
	});
	
	
	
	//点击移动,显示地点
	$("body").on("click",".point-click",function(){
		var widDiv=$(".location-choose").width();
		if($(this).css("background-position") == "-24px 0px"){
			$(".location-choose").animate({left:"-"+widDiv},500);
			$(this).css("background-position","0px 0px");
			$(".out-bg").animate({width:"64px"},500);
		}else{
			$(".location-choose").animate({left:"0px"},500);
			$(this).css("background-position","-24px 0px");
			$(".out-bg").animate({width:widDiv},500);
		}
	})
	
	//打开右边栏的搜索弹窗
	$("body").on("click",".search-btn",function(e){
		if($(this).hasClass("search-btn-click")) {
			$(".search-box").hide();
			$(this).removeClass("search-btn-click");
		}else{
			$(".search-box").show();
			$(".to-fact-box").hide();
			$(this).addClass("search-btn-click");
			$(".to-fact").removeClass("to-fact-click");
		}
		e.stopPropagation();
	});
	$(document).on("click",function(){
		//表格滚动
		$(".table-content").on("scroll",function(){
		    $(".table-head").children().css("margin-left",-1*$(this)[0].scrollLeft);
		});
		$(".search-box").hide();
		$(".search-btn").removeClass("search-btn-click");
		$(".to-fact-box").hide();
		$(".to-fact").removeClass("to-fact-click");		
	});
	body.on("click",".search-box",function(e){
		e.stopPropagation();
	});
	

	//打开预排转实际弹窗
	$("body").on("click",".to-fact",function(e){
		if($(this).hasClass("to-fact-click")) {
			$(".to-fact-box").hide();
			$(this).removeClass("to-fact-click");
		}else{
			$(".to-fact-box").show();
			$(".search-box").hide();
			$(this).addClass("to-fact-click");
			$(".search-btn").removeClass("search-btn-click");
		}
		e.stopPropagation();
	});
	body.on("click",".to-fact-box",function(e){
		e.stopPropagation();
	});
	

							//初始化复选框
	$("input[name='StorageSingle'],input[name='StorageAll']").prop("checked",false);
							
	
				            //全选全不选
	$("body").on("click","input[name='factPnameAll']",function(){
		var checkValue = $(this).is(':checked') ;
		if(checkValue == true){
			$("input[name='factPnameSingle']").prop("checked",true);
		}else{
			$("input[name='factPnameSingle']").prop("checked",false);
		}
	});
							/*复选框反选*/
	$("body").on("click","input[name='factPnameSingle']",function(){
		var chsub = $("input[name='factPnameSingle']").length;
		var checkedsub = $("input[name='factPnameSingle']:checked").length;
		if(chsub == checkedsub){
			$("input[name='factPnameAll']").prop("checked",true);
		}else{
			$("input[name='factPnameAll']").prop("checked",false);
		}
	});



}());

//退出

(function(){
	$("body").on("click",".out-login",function(){
		$.ajax({
			type:"post",
			url:loginOutUrl,
			data:{},
			dataType:"json",
			contentType:"application/json;charset=UTF-8",	
			success:function(res){
				if(res.success_response){
					localStorage.removeItem("token");
					window.location.href = res.success_response.loginUrl;
				}else{
					layer.alert('退出登录失败！', {
						skin: 'layer-alert-themecolor' //样式类名
					});
				}
			},
			error:function(res){
				layer.alert('退出登录失败！', {
					skin: 'layer-alert-themecolor' //样式类名
				});
			},	
			headers:{
				"X-Requested-With":"XMLHttpRequest",
				"redirectUrl":window.location.origin + window.location.pathname,
				"Authorization":localStorage.getItem("token")||""
			}
		});

	});
})();

//用户信息弹窗
(function(){
	var removeActive = 0;
	$("body").on("mouseenter",".user-info",function(e){
		clearTimeout(removeActive);
		$(this).addClass("active");
	}).on("mouseleave",".user-info",function(){
		var $this = $(this);
		removeActive = setTimeout(function(){
			$this.removeClass("active");
		},300)
	});
	
})();


//(function(){
//	var windowWidth = document.body.clientWidth ;
//	console.log(windowWidth);
//	setInterval(function(){
//		var windowWidth = document.body.clientWidth ;
//		if(windowWidth <= 1670){
//			$(".wrap-content .table .page-right").css({
//				"top":"-90px",
//				"right":"15px"
//			})
//			$(".wrap-content .table .page-left").css({
//				"top":"-90px",
//			})			
//		}else{
//			$(".wrap-content .table .page-right").css({
//				"top":"316px",
//				"right":"-185px"
//			})
//			$(".wrap-content .table .page-left").css({
//				"top":"316px",
//			})				
//		}
//	},1000);
//
//
//})();


//新版一级页面index，固定尺寸，所以原代码只保留锁定期
var view_js = {};

view_js.aps_freeze_draw = function(args,overs){
	var jPage = $(".page-wrapper"),
		jPbody = jPage.find(".pbody"),
		jPbodyWrap = jPbody.find(".pbody-wrap"),
		jContent = jPbodyWrap.find(".wrap-content"),
		jTableContent = jContent.find(".table-content"),
		jBodyTr = jTableContent.children(".table-tr");
	for(var i=0;i<jBodyTr.length;i++){
		var thisOvers = overs[i];
		//锁定期线
        //jBodyTr.eq(i).children("td").css("border-right","1px solid #CCCCCC");
		//jBodyTr.eq(i).children("td").eq(args[i]).css("border-right","5px solid #ff00ff");
		//锁定期外框
        //
        jBodyTr.eq(i).children(".table-td").find(".freeze_info").hide();
        jBodyTr.eq(i).children(".table-td").find(".over-Capability").hide();
		for(var j=0;j<thisOvers.length;j++){

			if(j<args[i]){
				jBodyTr.eq(i).children(".table-td").eq(j+1).find(".freeze_info").show();
			}

			if(thisOvers[j]){
				jBodyTr.eq(i).children(".table-td").eq(j+1).find(".over-Capability").show();
			}
		}

	}
}

//二级页面地点下拉
view_js.dialogWindowEquipment = function(equipmentInfo,thisInput,selectOne){
	var jTableDialogWindow = $(".table-dialog-window");
	var thisTarget = thisInput.target;
	var x = thisTarget.offsetLeft;
	var y = thisTarget.offsetTop + thisTarget.offsetHeight;
	var equipmentList = $("<div class='equipment-list'><ul></ul></div>");
	var equipmentInputVal = jTableDialogWindow.find(".equipment-input").val();
	
	
	for(var i in equipmentInfo){
		var thisText = equipmentInfo[i].punitName;
		if(equipmentInputVal.indexOf(thisText) >= 0){
			equipmentList.find("ul").append($("<li class='li-selected'></li>").text(thisText).attr("equipment-id",i));
		}else{
			equipmentList.find("ul").append($("<li></li>").text(thisText).attr("equipment-id",i));
		}
		
		
	}
	jTableDialogWindow.find(".info-show").append(equipmentList);
	$(".equipment-list").css("left",x);
	$(".equipment-list").css("top",y);
	
	$(".equipment-list").on("click","li",function(){
		var thisText = $(this).text();
		var inputVal = $(".equipment-input").val();
		
		if(selectOne){
			if($(this).hasClass("li-selected")){
				return;
			}else{
				$(".li-selected").removeClass("li-selected");
				$(this).addClass("li-selected");
				jTableDialogWindow.find(".equipment-input").val($(this).text());	
			}
		}else{
			$(this).toggleClass("li-selected");
			
			var jLiSelected = $(".li-selected");
			var newVal = [];
			for(var i = 0,l =jLiSelected.length; i < l ; i++ ){
				newVal.push(jLiSelected.eq(i).text());
			}
			jTableDialogWindow.find(".equipment-input").val(newVal.join(","));	
		}
			
	});
}


/*************=========================拖拽项目排序js=========================*************/
var $id = function (element) {
	return typeof element == "string" ? document.getElementById(element) : element;
}
var $find = function (parent, nodeName) {
	return parent.getElementsByTagName(nodeName);
}
//拖拽项目类
function DragNewItem() {
	this.init.apply(this, arguments);
}

//拖拽项目原型
DragNewItem.prototype = {
	_downX: 0,//鼠标按下时的x坐标
	_downY: 0,//鼠标按下时的y坐标
	_moveX: 0,//鼠标移动时的x坐标
	_moveY: 0,//鼠标移动时的y坐标
	_index: 0,//移动图标的下标
	//初始化方法
	init: function (mainDivId, myAppId, otherAppId, config) {
		this.mainDiv = $id(mainDivId);//获取最外面的div
		this.myApp = $id(myAppId);//获取第一个div
		this.otherApp = $id(otherAppId);//获取第二个div
		this.repeatTransfer()
		this.addItem().removeItem();
	},
	//局部刷新页面时每次需要重复确认操作的区域
	repeatTransfer : function(){
		this._OnApp(this.mainDiv);
		this._moveApp(this.myApp, this.otherApp);
		this._moveApp(this.otherApp, this.myApp);
		//
	},
	//鼠标移入移出图标
	_OnApp: function (mainDiv) {
		var _this = this;
		//鼠标移入可以移动的li时，加一个出现虚线的class
		mainDiv.onmouseover = function (event) {
			var e = event || window.event;//获取鼠标
			var t = e.target || e.srcElement;//获取鼠标触发源
			if (t.nodeName.toLowerCase == "li") {
				_this.addClass(t, "js-liBorderStyle");
			} else if (t.parentNode.nodeName.toLowerCase() == "li") {
				_this.addClass(t.parentNode, "js-liBorderStyle")
			}
		};
		//鼠标移入可以移动的li时，移除一个出现虚线的lcas
		mainDiv.onmouseout = function (event) {
			var e = event || window.event;//获取鼠标
			var t = e.target || e.srcElement;//获取鼠标触发源
			if (t.nodeName.toLowerCase == "li") {
				_this.removeClass(t, "js-liBorderStyle");
			} else if (t.parentNode.nodeName.toLowerCase() == "li") {
				_this.removeClass(t.parentNode, "js-liBorderStyle")
			}
		}
	},
	//拖动鼠标改变位置
	_moveApp: function (dragUl, otherUl) {
		var _this = this;
		dragUl.onmousedown = function () {
			var e = event || window.event;//获取鼠标
			var t = e.target || e.srcElement;//获取鼠标触发源
			_this.liList = [];//class不是js-liBorderStyle的li元素集合
			if (t.nodeName.toLowerCase() == "div" && t.className != "appDiv") {
				var oLi = t.parentNode;
				var oCopyLi = oLi.cloneNode(true);
				var oNewLi = oCopyLi.cloneNode(true);
				_this.removeClass(oNewLi, "js-liBorderStyle");
				_this.removeClass(oNewLi, "js-move");
				//oNewLi.innerHTML = oCopyLi.innerHTML;
				//                    var oSpan = $find(oCopyLi,"span")[0];

				document.body.appendChild(oCopyLi);
				_this.addClass(oCopyLi, "js-newLi");
				//                    oSpan.style.display = "none";
				oCopyLi.style.left = _this.offset(oLi).left + "px";
				oCopyLi.style.top = _this.offset(oLi).top + "px";

				oLi.parentNode.replaceChild(oNewLi, oLi);//新创建的li替代原来的li
				_this.addClass(oNewLi, "js-liBorderStyle");

				_this._downX = e.clientX;
				_this._downY = e.clientY;
				_this._offsetLeft = oCopyLi.offsetLeft;//鼠标按下时获取新生成的虚线li的坐标left
				_this._offsetTop = oCopyLi.offsetTop;//鼠标按下时获取新生成的虚线li的坐标top

				_this._liList = $find(_this.mainDiv, "li");//获取要拖拽下的ul里的所有li
				for (var i = 0, length = _this._liList.length; i < length; i++) {
					var li = _this._liList[i];
					if (li.className != "js-liBorderStyle") {//获取到class不是js-liBorderStyle的li
						_this.liList.push(li);
					}
				}
				//鼠标按下时移动图标的位置
				_this.getAppLocation(_this._offsetLeft + 80, _this._offsetTop + 80);


				document.onmousemove = function (event) {
					var e = event || window.event;//获取鼠标
					var t = e.target || e.srcElement;//获取鼠标触发源
					var _X = e.clientX, _Y = e.clientY;//获取鼠标的坐标值
					var _mLeft = _this._offsetLeft + _X - _this._downX,//获取图标移动时每一次坐标值
						_mTop = _this._offsetTop + _Y - _this._downY;
					var oSize = _this._overBorder(_mLeft, _mTop);//获取每次移动经过判断后（是否超过box范围）的坐标
					_mLeft = oSize.left ? oSize.left : _mLeft;
					_mTop = oSize.top ? oSize.top : _mTop;
					oCopyLi.style.left = _mLeft + "px";
					oCopyLi.style.top = _mTop + "px";
					var index = _this.getAppLocation(_mLeft, _mTop);//？？获取需要插入的li的下标
					_this._insertApp(_X, _Y, _this.liList[index], oNewLi, _this.myApp, _this.otherApp);
					_this._insertApp(_X, _Y, _this.liList[index], oNewLi, _this.myApp, _this.otherApp);
				}
				document.onmouseup = function (event) {
					var e = event || window.event;//获取鼠标
					var t = e.target || e.srcElement;//获取鼠标触发源
					var left = _this.offset(oNewLi).left;
					var top = _this.offset(oNewLi).top;
					//                        var oSpan2;
					_this.animate(oCopyLi, {left: left, top: top}, 100, function () {
						document.body.removeChild(oCopyLi);
						oNewLi.innerHTML = oCopyLi.innerHTML;
						//                            oSpan2 = $find(oNewLi,"span")[0];
						//                            oSpan2.style.display="block";
						_this.removeClass(oNewLi, "js-liBorderStyle");
						_this.addClass(oNewLi, "js-move");
						//                            var oLiSpan = $find(oNewLi,"span")[0];
						//                            var oPBtn = oNewLi.parentNode;
						//                            oPBtn = _this.myApp ?oLiSpan.className="minus":oLiSpan.className="plus";
					});
					document.onmousemove = null;
					document.onmouseup = null;
				}
			}
		}
	},
	//添加class
	addClass: function (node, className) {
		if (!node.className) {
			node.className = className;
		} else {
			node.className += " " + className;
		}
	},
	//删除class
	removeClass: function (node, className) {
		var string = node.className;
		if (string.indexOf(className) > 0) {
			node.className = string.replace(" " + className, "");
		} else if (string.indexOf(className) == 0) {//判断class是否在第一个class，进行删除
			if (string.indexOf(" ") < 0) {
				node.className = string.replace(className, "");
			} else {
				node.className = string.replace(className + "", "");
			}
		} else {
			return;
		}
	},
	//元素在文档中的位置
	offset: function (obj) {
		var _offset = {};
		var node = $id(obj);
		var left = node.offsetLeft;
		var top = node.offsetTop;
		var parent = node.offsetParent;
		//不断向上获取父元素的offsetLeft，知道获取到与页面的距离
		while (parent != null) {
			left += parent.offsetLeft;
			top += parent.offsetTop;
			parent = parent.offsetParent;
		}
		_offset.left = left;
		//!!!!!配置页减去对应的滚动条距离
		_offset.top = top -  $(".config-content").scrollTop();
		return _offset;
	},
	//计算移动图标所处的位置
	getAppLocation: function (x, y) {
		var liList = this.liList;
		var liW = liList[0].offsetWidth;//
		var liH = liList[0].offsetHeight//
		for (var i = 0, length = liList.length; i < length; i++) {
			var li = liList[i], left = this.offset(li).left, top = this.offset(li).top;
			if ((x > left - liW && x < left + liW) && (y > top - liH && y < top + liH)) {
				this._index = i;
				break;
			}
		}
		return this._index;
	},
	//图标超出边界处理
	_overBorder: function (left, top) {
		var x = 0, y = 0, mainDiv = this.mainDiv, oSize = {};
		var mainDivLeft = this.offset(document.getElementById("all-item")).left;//因为绝对定位的原因，所有需要通过获取点击按钮的offsetLeft计算出来offsetLeft
		var mainDivTop = this.offset(document.getElementById("all-item")).top;
		if (left < mainDivLeft) {
			x = mainDivLeft
		}
		if (left > mainDivLeft + mainDiv.offsetWidth) {
			x = mainDivLeft + mainDiv.offsetWidth;
		}
		if (top < mainDivTop) {
			y = mainDivTop
		}
		if (top > mainDivTop + mainDiv.offsetHeight) {
			y = mainDivTop + mainDiv.offsetHeight
		}
		oSize.left = x;
		oSize.top = y;
		return oSize;
	},
	//边框随鼠标移动改变位置,然后选择插入到哪个li后面
	_insertApp: function (x, y, oldElement, newElement,my, other) {
		var parent
		var liList = $id(parent, "li");
		//var lastLi = liList[liList.length - 1];
		var selectX =  this.offset(document.getElementsByClassName("middleBtn")[0]).left;
		///此段代码中的x大雨的值不同环境需要计算
		if (x > selectX) {
			parent = other;
		} else {
			parent = my;
		}
		//console.log(this.offset(parent).top - $(".config-content").scrollTop());
		if (y > this.offset(parent).top && y < this.offset(parent).top + parent.offsetHeight) {
			try {
				parent.insertBefore(newElement, oldElement);
			} catch (error) {
				parent.appendChild(newElement)
			}
		} else {
			parent.appendChild(newElement)
		}
	},
	//动画方法，
	animate: function (obj, params, time, handler) {
		var node = $id(obj), handlerFlag = true, _style = node.currentStyle ? node.currentStyle : window.getComputedStyle(node, null);
		time = document.all ? time * 0.6 : time * 0.9;
		for (var p in params) {
			(function (n) {
				n = p;
				if (n == "left" || n == "top") {
					var _old = parseInt(_style[n]), _new = parseInt(params[n]), _length = 0, _tt = 10;
					if (!isNaN(_old)) {
						var count = _old, length = _old <= _new ? (_new - _old) : (_old - _new), speed = length / time * _tt, flag = 0;
						var anim = setInterval(function () {
							node.style[n] = count + "px";
							count = _old <= _new ? count + speed : count - speed;
							flag += _tt;
							if (flag >= time) {
								node.style[n] = _new + "px";
								clearInterval(anim);
							}
						}, _tt);
					}
				}
			})(p);
		}

		var timeHandler = setTimeout(function () {
			if (handler && typeof handler == "function") {
				handler();
				clearTimeout(timeHandler);
			}
		}, time + 100);
	},
	//一次性添加所㓟可排序字段
	addItem: function () {
		$("body").on("click", ".addAllItem", function () {
			var elem = $("#provide-item li");
			for (var i = 0; i < elem.length; i++) {
				var cloneElem = $(elem[i]).clone().addClass("js-move");
				$(".sort-item ul").append(cloneElem);
				elem.remove();
			}
		})
		return this;
	},
	//一次性移除所有已排序字段
	removeItem: function () {
		$("body").on("click", ".removeAllItem", function () {
			var elem = $("#sort-item li");
			for (var i = 0; i < elem.length; i++) {
				var cloneElem = $(elem[i]).clone().addClass("js-move");
				$(".provide-item ul").append(cloneElem);
				elem.remove();
			}
		})
		return this;
	}
	//决定单个项目中的升序和降序
};

//拖拽区域进行初始化
function clickliGetItem(){
    //每次点击后目录蓝需要重新获取移动的li(配置项)
    setTimeout(function(){
        new DragNewItem('all-item','provide-item','sort-item',{});
        $("#sort-item").find("li").each(function(){
            let span = $(this).children(".itemOrder");
            span.addClass(span.attr("ng-class"));
        });
    },50);
    //清除用户移动后未保存的项目
    $("#all-item").find(".js-move").remove();
}

//临时项的升序和降序
$("body").on("click", ".sort-item .itemOrder", function (e) {
	var parent = $(this).parent();
	var attr = parent.attr("data-keyname");
	if ($(this).hasClass("desc")) {
		parent.attr("data-order", "up").attr("data-keyname",attr.replace(":desc",""));
	} else {
		parent.attr("data-order", "down").attr("data-keyname",attr+":desc");
	}
	$(this).toggleClass("desc");
	e.stopPropagation();
});
/************+++++++++++合并项+++++++++++***********/
$(".page-wrapper")
	//点击出现下拉框
	.on("click",".combine-menu",function(){
		$(this).addClass("active");
		$(this).children(".combine-drag").addClass("drag")
	})
	//移出下拉框小时
	.on("mouseleave",".combine-menu",function(e){
		$(this).removeClass("active");
		$(this).children("ul").removeClass("drag");
	})
