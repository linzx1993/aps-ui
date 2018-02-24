//排程页面专用的地点树
app.directive("folderTree", function () {
	return {
		restrict: "E",
		scope: {
			currentFolder: '='
		},
		replace: true,
		transclude: true,
		templateUrl: 'view/template/tree.html',
	};
});

//排程结果页面右键事件
app.directive('ngRightClick', function ($parse) {
	return function (scope, element, attrs) {
		var fn = $parse(attrs.ngRightClick);
		element.bind('contextmenu', function (event) {
			scope.$apply(function () {
				event.preventDefault();
				fn(scope, {
					$event: event
				});
			});
		});
	};
});

//设备作业页 手动微调页点击右键出现目录
app.directive("rightClickNav", function () {
	return {
		restrict: "E",
		scope: false,
		replace: true,
		transclude: true,
		template: '' +
			'<div style="display: none;" id="jLeftClickNav" class="left-click-nav" ng-show="rightClickNavShow">' +
			'<ul>' +
			'<li ng-if="rightClickNavLiShow.workUnit" ng-click="unit_click(selectCellFront,1,$event)">工作单元</li>' +
			'<li ng-if="rightClickNavLiShow.changeEquipment" ng-click="unit_click(selectCellFront,2,$event)">换装计划</li>' +
			'<li ng-if="rightClickNavLiShow.taskList" ng-click="unit_click(selectCellFront,4,$event)">任务清单</li>' +
			'<li ng-if="rightClickNavLiShow.equipmentDetails" ng-click="unit_click(selectCellFront,3,$event)">设备详情</li>' +
			'<li ng-if="rightClickNavLiShow.moveout" ng-click="moveToCache(selectCellFront,$event)">移出</li>' +
			'<li ng-if="rightClickNavLiShow.movein" ng-click="getCapability(selectCellFront,$event)">移入</li>' +
			'<li ng-if="rightClickNavLiShow.cleanCheck" ng-click="clean_check()">清除选中</li>' +
			'</ul>' +
			'</div>',
	};
});

/*
 * desc : 自定义滚动条
 */
app.directive("apsScrollBar",['$timeout',function ($timeout) {
	return {
		replace: true,
		transclude : true,
		template : '<div class="aps-scroll-box" >' +
		'<div class="aps-scroll-wrap"  ng-scroll="handleScroll" ng-transclude></div>' +
		'<div class="aps-scroll-bar is-horizontal"><span class="aps-scrollbar-thumb"></span></div>' +
		'<div class="aps-scroll-bar is-vertical"><span class="aps-scrollbar-thumb"></span></div>' +
		'</div>',
		link : function (scope, elem, attr) {
			$timeout(function () {
				debugger;
				let scrollBox = elem[0].getElementsByClassName("aps-scroll-wrap")[0];
				console.log(scrollBox.clientHeight);
				scope.thumbHeight = (scrollBox.clientHeight /scrollBox.firstElementChild.clientHeight) * scrollBox.clientHeight;
				console.log(scope.thumbHeight);
			})

			scope.handleScroll = function (e,a) {
				let wrap = e[0];
				let moveY = wrap.scrollTop *100 / wrap.firstElementChild.clientHeight;
				let moveX = wrap.scrollLeft *100 / wrap.firstElementChild.clientWidth;
				console.log(moveY,moveX);
			};

			scope.update = function () {

			}
		}
	}
}]);

/*
 * desc : 下拉框为分组标签名写的
 */
app.directive("apsOptionGroup",function () {
	return {
		restrict : "E",
		replace : true,
		transclude: true,
		template : '<ul ng-show="visible">' +
			'<li class="option-group-title">{{label}}</li>' +
			'<li>' +
				'<ul ng-transclude></ul>' +
			'</li>' +
		'</ul>',
		scope : {
			label : '@',
			value : '@',
		},
		link : function (scope, elem, attrs) {
			scope.visible = true;
			scope.optionList = [];

			//初始化获得所有的option数据
			scope.$on("collectAllOption",function (e,option) {
				scope.optionList.push(option);
			});

			//如果该标签组下 没有选项 或者 所有选项被过滤 了，则隐藏标签名
			scope.$on("optionGroup",function () {
				scope.visible = scope.optionList.length && scope.optionList.some(item => {
					return item.isFilterable;
				});
			})
		}
	}
});

/*
 * desc : 下拉框
 */
app.directive("apsSelect",["$timeout",function ($timeout) {
	return {
		restrict : "E",
		replace : true,
		transclude: true,
		template : '' +
		'<div class="aps-select" ng-class="!hasValue ? \'has-value\' : \'\'">' +
			'<div ng-click="showOptionList($event)">' +
				'<em class="clean-value" ng-show="hasValue" ng-click="clearSelectValue($event)"></em>' +
				'<input type="text" class="search-input" ng-model="currentText" ng-style="style" title={{currentText}} placeholder={{placeholder}} disabled="disabled"/>' +
				'<div class="drop-down-list" ng-show="showOption">' +
					'<p class="select-all" ng-show="multiple" ng-click="handleAllChecked()" ng-class="allChecked ? \'active\' : \'\'">全部</p>' +
					'<input class="filter-input" type="text" class="ml-10" ng-model="searchValue" ng-show="filterable">' +
					'<p class="empty-text" ng-show="!optionList.length">{{emptyText}}</p>' +
					// '<aps-scroll-bar>' +
						'<ul class="select-box" ng-show="optionList.length" ng-transclude>' +
						'</ul>' +
					// '</aps-scroll-bar>' +
				'</div>' +
			'</div>' +
		'</div>',
		scope:{
			ngModel : "=",	//下拉列表选中输出给外面的值
			placeholder: "@",	//input未填写时的占位符
			style : "=",	//控制input的样式，要写成对象格式{'width' : '235px'}
			multiple : "@",	//是否提供多选功能
			onChange : "&",	//点击下拉列表执行的事件
			filterable : "@",	//是否提供模糊搜索框功能
			query : "=",	//是否采用远程搜索，提供就采用远程查询
			emptyText : "@",	//没有下拉栏的时候，显示的数据
		},
		link : function (scope,elem) {
			scope.hasValue = false;	//	显示input框内是否有值
			scope.filterable = scope.filterable === "true";	//提供搜索功能才展现模糊搜索的input框
			scope.optionList = [];//获得下拉列表所有值
			scope.ngModel = scope.ngModel || (scope.multiple ? [] : '');//根据单选还是多选设置默认值
			scope.emptyText = scope.emptyText || "没有数据";	//下拉没有数据时，给用户的提醒
			scope.placeholder = scope.placeholder || "请选择";
			scope.currentText = "";	//当前点击的文字
			scope.allChecked = false;

			//初始化获得所有的option数据
			scope.$on("collectAllOption",function (e,option) {
				scope.optionList.push(option);
			});

			//初始化获得所有的option数据
			scope.$on("removeOption",function (e,value) {
				let index = scope.optionList.findIndex(option => option.value === value);
				if (index > -1) {
					scope.optionList.splice(index, 1);
				}
			});

			//根据子组件传递上来的值进行改变父组件的值
			scope.$on('optionClick', function (event, value) {
				//如果是多选的话
				if(scope.multiple){
					let index = scope.ngModel.indexOf(value);
					if(index === -1){
						scope.ngModel.push(value)
					}else{
						scope.ngModel.splice(index,1);
					}
				}else{
					scope.ngModel = value;
					scope.showOption = false;
				}
				scope.setSelected();
			});

			//监测每次上传option时，实时监测哪些option被选中了scope.setSelected
			scope.$watch("optionList.length",function (n,o) {
				//为了应对初始化的情况下
				scope.setSelected();
			});

			scope.$watch("ngModel.length",function (n,o) {
				//数组长度多过滤多选；单选的话，长度一样，再通过是否字符串一样进行筛选
				if(n === o) return;
				scope.setSelected();
				//执行外面引入点击的回调
				if(scope.onChange && typeof scope.onChange === "function"){
					scope.onChange();
				}
			});

			//根据是否提供远程查询的方法来决定是否调用远程查询，搜索不区分大小写
			scope.$watch("searchValue", function(n, o) {
				if (n === o) return;
				//如果传入了参数，表示是采用远程搜索功能,将输入的参数传递出去,否则执行本地过滤
				if(scope.query){
					scope.$emit(scope.query, n)
				}else{
					scope.$broadcast("filter",n);
				}
				scope.setSelected();
			});

			//根据最新的ngModel值，设置哪个option选中
			scope.setSelected = function () {
				if(scope.multiple){
					//新建一个数组存储显示额文案
					let newText = [];
					//遍历选中的model，获取每个id对应的文案
					scope.optionList.forEach((item) => {
						if(scope.ngModel.includes(item.value)){
							newText.push(item.label);
							item.isActive = true;
						}else{
							item.isActive = false;
						}
					});
					scope.currentText = newText.join();	// 当前显示的文案
					scope.hasValue = !!scope.ngModel.length;	//是否有选中值
					//是否处于全选状态，根据是否等于全部显示项是否被选中来判断
					let filterOptionList = scope.optionList.filter(item => item.isFilterable === true);
					scope.allChecked = filterOptionList.length && filterOptionList.every(item => item.isActive);
				}else {
					scope.optionList.forEach((item) => {
						if(item.value === scope.ngModel){
							scope.currentText = item.label;
							item.isActive = true;
						}else{
							item.isActive = false;
						}
					});
					scope.hasValue = !!scope.ngModel
				}
			};

			//只有多选，才启用此功能，点击全选按钮，选中所有“显示项”(因为会有其他项被过滤了)
			scope.handleAllChecked = function () {
				if(!scope.allChecked){
					scope.optionList.forEach(item => {
						//显示出来的项才选中
						if(item.isFilterable){
							//如果此时显示项已经有被选中的，则跳过，push所有未选中的显示项
							if(!scope.ngModel.includes(item.value)){
								scope.ngModel.push(item.value);
							}
						}
					});
				}else{
					scope.ngModel = [];
				}
			};

			//点击input出现搜索下拉框
			scope.showOptionList = (e) => {
				scope.showOption = true;
			};

			//点击别处下拉框消失
			document.addEventListener("click",function (e) {
				$timeout(() => {
					if(elem[0].contains(e.target)){
						scope.showOption = true;
					}else{
						scope.showOption = false
					}
				})
			});

			//清除所有选中的值
			scope.clearSelectValue = function () {
				if(scope.multiple){
					scope.allChecked = false;	//同时清除全部选中的状态
					scope.ngModel = [];
				}else{
					scope.ngModel = "";
				}
				scope.currentText = "";
				//清空下拉列表的选中状态
				scope.optionList.forEach(function (item) {
					item.isActive = false;
				});
			};
		}
	}
}]);

app.directive("apsOption",function () {
	return {
		restrict : "E",
		replace : true,
		transclude: true,
		template : `
			<li class="aps-select-option textover" 
			    title={{label}} 
			    ng-show="isFilterable"
				ng-class="((isActive === true)) ? 'active': ''"  
				ng-click="listLiCheck($event)">{{label}}
				</li>`,
		scope : {
			value : '@',
			label : '@',
			isActive : '@',
			disabled : '=',
			onClick : '&',
		},
		link : function (scope,element) {
			scope.isFilterable = true;
			//根据父组件传递进来的数据，实时改变各个子组件的选中
			//如果选中值包含这个option的话，
			scope.$emit("collectAllOption",scope);

			scope.listLiCheck = function (e) {
				scope.$emit('optionClick', scope.value);
				e.stopPropagation();
			};

			//	根据过滤参数来决定是否显示此项,参数无视大小写
			scope.$on('filter', function (filter,val) {
				if(scope.label.toLowerCase().includes(val.toLowerCase())){
					scope.isFilterable = true;
				}else{
					scope.isFilterable = false;
				}

				//影响分组标签，需等待设置完后，重新上传
				scope.$emit("optionGroup")
			});

			element.on('$destroy', function () {
				scope.$emit('removeOption', scope.value);
			});
		}
	}
});


//一级页面时间控件
app.directive("dateController",function(tool,$timeout){
	return {
		restrict: "E",
		replace: true,
		transclude: true,
		scope: {
			controllerDate: "=",
			isSmall: "=",
			changeModel: "&",
			refreshMarginLeft: "="
		},
		template: ''+
		'<div class="scrollbar" ng-mousemove="move($event)" ng-style="isSmall ? {marginLeft:\'82px\'} : {marginLeft:\'160px\'}" ng-mouseleave="stop_move()" ng-mouseup="stop_move()" ng-touchmove="move($event)" ng-touchend="stop_move()">' +
			'<div class="scrollbar-thumb" ng-style="isSmall ? {width:controllerDate.smallScrollbarThumbWidth,marginLeft:smallMarginLeft} : {width:controllerDate.bigScrollbarThumbWidth,marginLeft:bigMarginLeft}" ng-mousedown="start_move($event)" ng-touchstart="mobile_start_move($event)">' +
				/*'<div style="width:20%;height:100%;background:red" ng-click="changeModel()"></div>' +*/
			'</div>' +
			'<div class="scrollbar-dateSelect">' +
				'<div class="scrollbar-date-select scrollbar-min-startdate">' +
					'<span class="scrollbar-span" ng-click="changeMinStartDate(-1)" title="向前一天"></span>' +
					'<input type="text" class="Wdate minStartDate" onclick="WdatePicker({isShowClear:false})" ng-model="controllerDate.minStartDate" readonly>' +
					'<span class="scrollbar-span scrollbar-right-span" ng-click="changeMinStartDate(1)" title="向后一天"></span>' +
				'</div>' +
				'<span class="scrollbar-dateSelect-between"></span>' +
				'<div class="scrollbar-date-select scrollbar-max-enddate">' +
					'<span class="scrollbar-span" ng-click="changeMaxEndDateOneDay(-1)" title="向前一天"></span>' +
					'<input type="text" class="Wdate maxEndDate" onclick="WdatePicker({isShowClear:false})" ng-model="controllerDate.maxEndDate" readonly>' +
					'<span class="scrollbar-span scrollbar-right-span" ng-click="changeMaxEndDateOneDay(1)" title="向后一天"></span>' +
				'</div>' +
				'<span class="quickTime" ng-click="setQuickTime(\'thisWeek\')">本周</span>' +
				'<span class="quickTime" ng-click="setQuickTime(\'nextWeek\')">下周</span>' +
				'<span class="quickTime" ng-click="setQuickTime(\'thisMonth\')">本月</span>' +
				'<span class="quickTime" ng-click="setQuickTime(\'nextMonth\')">下月</span>' +
			'</div>' +
		'</div>',
		link: function(scope){
			let smallThumbMarginLeftNum = 0;
			let bigThumbMarginLeftNum = 0;
			let lastMove = 0;
			scope.smallMarginLeft = smallThumbMarginLeftNum + "px";
			scope.bigMarginLeft = bigThumbMarginLeftNum + "px";
			//改变最小开始时间
			scope.changeMinStartDate = function(dayNum){
				scope.controllerDate.minStartDate = tool.dateToString(tool.dateChange(dayNum,scope.controllerDate.minStartDate));
			};
			//改变最大结束时间
			scope.changeMaxEndDateOneDay = function(dayNum){
				scope.controllerDate.maxEndDate = tool.dateToString(tool.dateChange(dayNum,scope.controllerDate.maxEndDate));
			};
			//开始移动
			scope.start_move = function($event){
				//阻止触发全局绑定的框选事件
				$event.stopPropagation();
				if($event.targetTouches){
					lastMove = $event.targetTouches[0].clientX;
				}
				scope.in_move = true;
			};
			//移动端开始移动
			scope.mobile_start_move = function($event){
				lastMove = $event.targetTouches[0].clientX;
				scope.in_move = true;
			};
			//移动中
			scope.move = function($event){
				$event.stopPropagation();
				let moveX;
				//非移动状态，返回
				if(!scope.in_move){
					return;
				}
				
				//触碰和PC
				if($event.targetTouches){
					const newX = $event.targetTouches[0].clientX
					//移动距离
					moveX = newX - lastMove;
					//更新最后位置
					lastMove = newX
				}else{
					moveX = $event.movementX;
				}
				
				//大小格子两套
				if(scope.isSmall){
					smallThumbMarginLeftNum += moveX;
					smallThumbMarginLeftNum = smallThumbMarginLeftNum < 0 ? 0 : smallThumbMarginLeftNum;
					if(scope.controllerDate.smallScrollWidth < 0){
						scope.smallMarginLeft = 0;
						scope.controllerDate.smallTableMarginLeft = 0;
					}else{
						if(smallThumbMarginLeftNum > scope.controllerDate.smallScrollbarWidth - scope.controllerDate.smallScrollbarThumb - 4){
							smallThumbMarginLeftNum = scope.controllerDate.smallScrollbarWidth-scope.controllerDate.smallScrollbarThumb-4;
							scope.controllerDate.smallTableMarginLeft = -scope.controllerDate.smallScrollWidth + "px";
							scope.smallMarginLeft = smallThumbMarginLeftNum + "px";
						}else{
							scope.smallMarginLeft = smallThumbMarginLeftNum + "px";
							scope.controllerDate.smallTableMarginLeft = -scope.controllerDate.smallScrollWidth*smallThumbMarginLeftNum / (scope.controllerDate.smallScrollbarWidth-scope.controllerDate.smallScrollbarThumb) + "px";
						}
					}
				}else{
					bigThumbMarginLeftNum += moveX;
					bigThumbMarginLeftNum = bigThumbMarginLeftNum < 0 ? 0 : bigThumbMarginLeftNum;
					if(scope.controllerDate.bigScrollWidth < 0){
						scope.bigMarginLeft = 0;
						scope.controllerDate.bigScrollWidth = 0;
					}else{
						if(bigThumbMarginLeftNum > scope.controllerDate.bigScrollbarWidth - scope.controllerDate.bigScrollbarThumb - 4){
							bigThumbMarginLeftNum = scope.controllerDate.bigScrollbarWidth-scope.controllerDate.bigScrollbarThumb-4;
							scope.controllerDate.bigTableMarginLeft = -scope.controllerDate.bigScrollWidth + "px";
							scope.bigMarginLeft = bigThumbMarginLeftNum + "px";
						}else{
							scope.bigMarginLeft = bigThumbMarginLeftNum + "px";
							scope.controllerDate.bigTableMarginLeft = -scope.controllerDate.bigScrollWidth*bigThumbMarginLeftNum/(scope.controllerDate.bigScrollbarWidth-scope.controllerDate.bigScrollbarThumb) + "px";
						}
					}
				}
			}
			//结束移动
			scope.stop_move = function(){
				scope.in_move = false;
			};
			//刷新右边距
			scope.refreshMarginLeft = function(){
				smallThumbMarginLeftNum = smallThumbMarginLeftNum < 0 ? 0 : smallThumbMarginLeftNum;
				if(scope.controllerDate.smallScrollWidth < 0){
					scope.smallMarginLeft = 0;
					scope.controllerDate.smallTableMarginLeft = 0;
				}else if(scope.controllerDate.bigScrollWidth < 0){
					scope.bigMarginLeft = 0;
					scope.controllerDate.bigTableMarginLeft = 0;
				}else{
					if(smallThumbMarginLeftNum > scope.controllerDate.smallScrollbarWidth - scope.controllerDate.smallScrollbarThumb - 4){
						smallThumbMarginLeftNum = scope.controllerDate.smallScrollbarWidth-scope.controllerDate.smallScrollbarThumb-4;
						scope.controllerDate.smallTableMarginLeft = -scope.controllerDate.smallScrollWidth + "px";
						scope.smallMarginLeft = smallThumbMarginLeftNum + "px";
					}else{
						scope.smallMarginLeft = smallThumbMarginLeftNum + "px";
						scope.controllerDate.smallTableMarginLeft = -scope.controllerDate.smallScrollWidth*smallThumbMarginLeftNum / (scope.controllerDate.smallScrollbarWidth-scope.controllerDate.smallScrollbarThumb) + "px";
					}

					bigThumbMarginLeftNum = bigThumbMarginLeftNum < 0 ? 0 : bigThumbMarginLeftNum;
					if(bigThumbMarginLeftNum > scope.controllerDate.bigScrollbarWidth - scope.controllerDate.bigScrollbarThumb - 4){
						bigThumbMarginLeftNum = scope.controllerDate.bigScrollbarWidth-scope.controllerDate.bigScrollbarThumb-4;
						scope.controllerDate.bigTableMarginLeft = -scope.controllerDate.bigScrollWidth + "px";
						scope.bigMarginLeft = bigThumbMarginLeftNum + "px";
					}else{
						scope.bigMarginLeft = bigThumbMarginLeftNum + "px";
						scope.controllerDate.bigTableMarginLeft = -scope.controllerDate.bigScrollWidth*bigThumbMarginLeftNum/(scope.controllerDate.scrollbarWidth-scope.controllerDate.bigScrollbarThumb) + "px";
					}
				}
			};
			//快捷时间
			scope.setQuickTime = function(quickType){
				const time = new Date();
			
				//判断方案列表是否有方案，如果有方案的话为true，则选择开始时间最小为今天,没有为false,则为本周第一天
				if (quickType === "thisWeek") {
					//本周，+1是为了从周一开始
					scope.controllerDate.minStartDate = tool.dateToString(time.setDate(time.getDate() - time.getDay() + 1));
					scope.controllerDate.maxEndDate = tool.dateToString(time.setDate(time.getDate() - time.getDay() + 7));
				} else if (quickType === "nextWeek") {
					//下周
					scope.controllerDate.minStartDate = tool.dateToString(time.setDate(time.getDate() - time.getDay() + 8));
					scope.controllerDate.maxEndDate = tool.dateToString(time.setDate(time.getDate() - time.getDay() + 7));
				} else if (quickType === "thisMonth") {
					//最后一天计算，本月第一天加上本月天数
					scope.controllerDate.minStartDate = tool.dateToString(time.setDate(1));
					scope.controllerDate.maxEndDate = tool.dateToString(new Date(time.setMonth(time.getMonth() + 1)).setDate(0));
				} else {
					//来源本个月的最后一天加一天
					time.setDate(15);//设为本月15号   防止本月有31号而下月没有导致变成下下月的1号
					scope.controllerDate.minStartDate = tool.dateToString(new Date(time.setMonth(time.getMonth() + 1)).setDate(1));
					scope.controllerDate.maxEndDate = tool.dateToString(new Date(time.setMonth(time.getMonth() + 1)).setDate(0));
				}
			}
			//此处为兼容my97时间插件(使用focus是因为my97在改变时间时，会让input获取焦点)
			$("input").on("focus",function(){
				$timeout(function(){
					scope.controllerDate.minStartDate = $(".minStartDate").val();
					scope.controllerDate.maxEndDate = $(".maxEndDate").val();
				},200)
			})
		}
	}
});

//级联下拉框
app.directive("cascader",function(){
	return {
		restrict: "E",
		replace: true,
		transclude: true,
		scope: {
			cascaderData: "=",
			getSelectedLocation: "=",
			onChange: "&"
		},
		template: ''+
		'<span class="cascader-dialog" ng-mouseleave="mouse_leave()" ng-click="hide_select_box=true">' +
			'<span class="search-item-name">{{cascaderData.showText}}：</span>' +
			'<input type="text" class="search-input" disabled="disabled" ng-model="selected" title={{selected}} />' +
//			'<div>' + 
//				'<input class="cascader-search-input" type="text" placeholder="请输入查询字符串" />' +
//			'</div>' +
			'<div class="cascader-select-box" ng-show="hide_select_box">' +
				'<ul ng-repeat="list in repeatData">' +
					'<li ng-if="$index === 0" ng-click="check_all(check.check_all_state)">' +
						'<label>' +
							'<input type="checkbox" ng-model="check.check_all_state"/>' +
							'<span>所有</span>' +
						'</label>' +
					'</li>' +
					'<li ng-repeat="listitem in list" ng-click="li_click(listitem,$event)" ng-mouseenter="li_mouseenter(listitem)" ng-mouseleave="li_mouseleave(listitem)" ng-class={"active":listitem.active,"has-next":listitem.hasNext}>' +
						'<label>' +
							'<input type="checkbox" ng-model="listitem.checked" ng-disabled="!listitem.writable"/>' +
							'<span>{{listitem.locationName}}</span>' +
						'</label>' +
					'</li>' +
				'</ul>' +
			'</div>' +
		'</span>',
		link: function(scope){
			//深度
			let deepIndex = 0;
			//渲染下拉框的数据
			scope.AllData = {};
			scope.repeatData = [];
			scope.check = {
				check_all_state: true
			};
			//初始数据
			scope.firstData;
			
			//获取所有节点及其子信息
			scope.getAllLocation = function(repeatData,deep,parentId,writalbe){
				//深度+1
				let thisDeep = ++deep;
				//遍历当层
				for(let location in repeatData){
					let thisLocation = repeatData[location],
						thisId = thisLocation.locationId;
					//添加深度参数，从0开始
					thisLocation.deepIndex = thisDeep;
					//初始状态是被选中
					thisLocation.checked = true;
					//是否可操作
					if(writalbe || scope.writable.indexOf(thisId) > -1){
						thisLocation.writable = true;
					}else{
						thisLocation.checked = false;
					}
					//父节点ID
					thisLocation.parentId = parentId || "";
					//如果还有子
					if(!$.isEmptyObject(thisLocation.nextLevelLocation)){
						thisLocation.hasNext = true;
						scope.getAllLocation(thisLocation.nextLevelLocation,thisDeep,thisId,thisLocation.writable);
					}
					//推入所有信息
					scope.AllData[thisLocation["locationId"]] = thisLocation;
				}
			}
			
			//构造渲染数据
			scope.creatFirstRepeatData = function(repeatData){
				let thisRepeatData = [];
				for(let location in repeatData){
					let thisLocation = repeatData[location];
					//推入所有信息
					thisRepeatData.push(thisLocation);						
				}
				//绑定页面
				scope.firstData = thisRepeatData;
				scope.repeatData = [];
				scope.repeatData.push(thisRepeatData);
			}
			
			//改变父祖节点的状态
			scope.changeParentsState = function(parentId){
				//如果没有父节点了
				if(parentId === ""){
					//改变全选按钮状态,只需要遍历第一层scope.firstData
					for(let i = 0,l = scope.firstData.length ; i < l ; i++){
						if(!scope.firstData[i].checked){
							scope.check.check_all_state = false;
							return;
						}
					}
					scope.check.check_all_state = true;
					return;
				}
				
				let thisLocation = scope.AllData[parentId],
					thisParentId = thisLocation.parentId,
					thisChildren = thisLocation.nextLevelLocation;
				
				//如果都选中
				thisLocation.checked = true;
				//遍历子节点，有一个未选中，则父节点未选中
				for(let child in thisChildren){
					if(thisChildren[child].checked === false){
						thisLocation.checked = false;
						break;
					}
				}
				//向上改变父节点
				scope.changeParentsState(thisParentId);
			}
			
			scope.$watch("cascaderData.repeatData",function () {
				if(scope.cascaderData){
					//默认所有
					scope.check_all_state = true;
					//可操作列表
					scope.writable = scope.cascaderData.writable;
					//遍历出所有的节点，并添加深度参数
					scope.getAllLocation(scope.cascaderData.repeatData,deepIndex,"",scope.writable?"":true);
					//获取第一层
					scope.creatFirstRepeatData(scope.cascaderData.repeatData);
					//刷新选中显示文本
					scope.refreshShowText(); 
				}
            });
			
			//鼠标移入li，打开下一层,此节点选中
			scope.li_mouseenter = function(thisLi){
				let thisId = thisLi.locationId,
					parentId = thisLi.parentId,
					thisLocation = scope.AllData[thisId].nextLevelLocation,
					thisDeepIndex = thisLi.deepIndex,
					thisList = [];
				
				//兄弟节点、子节点样式移除
				let parentLocation = parentId ? scope.AllData[parentId].nextLevelLocation : scope.firstData;
				for(let location in parentLocation){
					parentLocation[location].active = false;
				}
				for(let locationId in scope.AllData){
					if(locationId.indexOf(thisId) === 0){
						scope.AllData[locationId].active = false;
					}
				}
				//此节点选中
				thisLi.active = true;
				//如果还有下一层
				if(!$.isEmptyObject(thisLocation)){
					//遍历构成下一层
					for(let i in thisLocation){
						thisList.push(thisLocation[i]);
					}
					//重新构造当前层之后的层
					scope.repeatData.splice(thisDeepIndex,scope.repeatData.length,thisList);
				}
			}
			
			//点击li，向后全选，向前反选
			scope.li_click = function(thisLi,$event){
				if($event.target.localName !== "input"){
					return;
				}
				let thisId = thisLi.locationId,
					thisCheckState = thisLi.checked,
					thisParentId = thisLi.parentId,
					thisLocation = scope.AllData[thisId].nextLevelLocation,
					thisDeepIndex = thisLi.deepIndex;
				
				//向后全选
				//遍历所有节点
				for(let locationId in scope.AllData){
					//如果是这个节点的子节点，状态统一
					if(locationId.indexOf(thisId) === 0){
						scope.AllData[locationId].checked = thisCheckState;
					}
				}
				//向前反选
				//只影响直属父祖节点的状态
				scope.changeParentsState(thisParentId);
				
				//刷新选中显示文本
				scope.refreshShowText(); 
				
				//刷新设备
				scope.onChange();
			}
			
			// 全选/全不选
			scope.check_all = function(checkAllState){
				//遍历所有节点，统一状态
				for(let location in scope.AllData){
					if(scope.AllData[location].writable){
						scope.AllData[location].checked = checkAllState;
					}
				}
				
				//刷新选中显示文本
				scope.refreshShowText(); 
				
				//刷新设备
				scope.onChange();
			}
			
			//鼠标离开选区
			scope.mouse_leave = function(){
				//下拉框不可见
				scope.hide_select_box = false;
				//数据恢复第一层
				scope.repeatData = [];
				scope.repeatData.push(scope.firstData);
			}
			
			//刷新选中显示文本
			scope.refreshShowText = function(){
				let textArr = [];
				//遍历全部节点，返回选中的节点的数组
				for(let locationId in scope.AllData){
					if(scope.AllData[locationId].checked){
						textArr.push(scope.AllData[locationId].locationName);
					}
				}
				scope.selected = textArr.join(",");
			}
			
			//获取选中的地点
			scope.getSelectedLocation = function(){
				let returnArr = [];
				//遍历全部节点，返回选中的节点的数组
				for(let locationId in scope.AllData){
					if(scope.AllData[locationId].checked){
						returnArr.push(locationId);
					}
				}
				return returnArr;
			}
		}
	}
});

//渲染结束后执行的回调
app.directive("onFinishRender",['$timeout',function ($timeout) {
	return {
        "restrict": 'A',
		link : function (scope, elem, attr) {
            if (scope.$last !== true) {
            } else {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished'); //事件通知
                    // scope.$eval(attr.onFinishRender);
                    let fun = scope.$eval(attr.onFinishRender);
                    if(fun && typeof(fun)=='function'){
                        fun(elem);  //回调函数
                    }
                });
            }
        }
	}
}]);

/**
* desc:通用表格组件(不存在合并情况)
* time:2017-09-20
* @param:
* @return:
**/
app.directive('apsBaseTable', ['$timeout',function($timeout){
	return {
		restrict: "E",
		replace: true,
		scope: {
			headData: "=", //表头数据
			bodyData: "=",  //表格内容
			ngModel: "=",  //选中的行
			onChange: "=",  //选中行改变时
			rowDetails: "=",  //行详细信息
			rowEdit: "=",  //行编辑
			rowChange: "=",  //行改变
			rowClassName: "=", //行样式
			selectable: "=",	//单选是radio，多选是multiple，不传是没有选
			indexes: "@"	//索引列
		},
		template: '' +
		'<div class="aps-table" ng-scroll="tableScroll">' +
			'<table>' +
				'<tbody>' +
					'<tr ng-repeat="row in bodyData track by $index" class={{getRowClass($index)}} index="{{$index}}">' +
						'<td ng-style="bodyMoveLeft" ng-if="indexes">{{$index + 1}}</td>' +
						'<td ng-style="bodyMoveLeft" class="aps-table-selection aps-table-fixed" ng-if="selectable">' +
							'<label ng-class="ngModel.indexOf($index)>-1? \'aps-table-selected\' : \'\'">' +
								'<input type="text" ng-click="selectRow($index)">' +
							'</label>' +
						'</td>' +
						'<td ng-style="bodyMoveLeft" class="operation aps-table-fixed"  ng-if="operationWidth">' +
							'<i class="aps-table-details" ng-if="rowDetails" ng-click="rowDetails($index,$event)"></i>' +
							'<i class="aps-table-edit" ng-if="rowEdit" ng-click="rowEdit($index)"></i>' +
							'<i class="aps-table-change" ng-if="rowChange" ng-click="rowChange($index,$event)"></i>' +
						'</td>' +
						'<td ng-repeat="cell in row track by $index">{{cell}}</td>' +
					'</tr>' +
				'</tbody>' +
				'<thead id="aps-table-head" ng-style="headMoveTop">' +
					'<tr>' +
						'<th ng-style="bodyMoveLeft" ng-if="indexes">序号</th>' +
						'<th ng-style="bodyMoveLeft" class="aps-table-selection" ng-if="selectable">' +
							'<label ng-class="ngModel.length === bodyData.length? \'aps-table-selected\' : \'\'"  ng-if="selectable === \'multiple\'">' +
								'<input type="text" ng-click="selectAll()">' +
							'</label>' +
						'</th>' +
						'<th ng-style="bodyMoveLeft" style="width: {{operationWidth+ \'px\'}}  " ng-if="operationWidth">操作</th>' +
						'<th ng-repeat="cell in headData track by $index" on-finish-render="tableScroll">{{cell}}</th>' +
					'</tr>' +
				'</thead>' +
			'</table>' +
		'</div>',
		link: function(scope,ele){
			//确定操作列的宽度
			function setOperationWidth(){
				let allOperation = [scope.rowDetails,scope.rowEdit,scope.rowChange],
					num = 0;
				
				for(let i = 0, l = allOperation.length; i < l; i++){
					if(allOperation[i]){
						num ++;
					}
				}
				scope.operationWidth = num * 50;
			}
			
			setOperationWidth();
			
			//监听渲染数据的改变
			scope.$watch("rowDetails",(newVaule, oldValue) =>{
				setOperationWidth()
			})
			
			//监听渲染数据的改变
			scope.$watch("rowEdit",(newVaule, oldValue) =>{
				setOperationWidth()
			})
			
			//监听渲染数据的改变
			scope.$watch("rowChange",(newVaule, oldValue) =>{
				setOperationWidth()
			})
			
			//监听渲染数据的改变
			scope.$watch("bodyData",(newVaule, oldValue) =>{
				scope.ngModel = [];
			})
			
			//首行及前两列固定
			scope.tableScroll = function(){
				const $Element = $(ele),
					  scrollBar = ele[0].scrollWidth > ele[0].clientWidth ? 8 : 0,
					  top = $Element.scrollTop(),
					  left = $Element.scrollLeft(),
					  height = $Element.children("table").height() - $Element.height() - top + scrollBar;
				
				scope.headMoveTop = {
					"transform": "translateY(" + top + "px)"
				};
				scope.bodyMoveLeft = {
					"transform": "translateX(" + left + "px)"
				};
			};
			
			//表格选中单行
			scope.selectRow = function(rowIndex){
				let value = scope.ngModel.slice(),
					index = value.indexOf(rowIndex);
				
				//如果是单选
				if(scope.selectable === "radio"){
					if(index > -1){
						value = [];
					}else{
						value = [rowIndex];
					}
				}else{
					if(index > -1){
						value.splice(index, 1);
					}else{
						value.push(rowIndex);
					}
				}
				scope.ngModel = value;
				if(scope.onChange && typeof scope.onChange === "function"){
					scope.onChange(value);
				}
			};
			
			//表格全选
			scope.selectAll = function(){
				let value = [];
				
				if(scope.ngModel.length !== scope.bodyData.length){
					for(let i = 0, l = scope.bodyData.length; i < l; i++){
						value.push(i);
					}
				}
				scope.ngModel = value;
				
				if(scope.onChange && typeof scope.onChange === "function"){
					scope.onChange(value);
				}
			};
			
			//表格行样式
			scope.getRowClass = function(index){
				if(scope.rowClassName && typeof scope.rowClassName === "function"){
					return scope.rowClassName(index);
				}
				return '';
			};
		}
	}
}]);

/**
* desc:通用表格组件(合并)
* time:2017-09-20
* @param:
* @return:
**/
app.directive('apsMergeTable', ['$timeout',function($timeout){
	return {
		restrict: "E",
		replace: true,
		scope: {
			headData: "=", //表头数据
			bodyData: "=",  //表格内容
			rowDetails: "=",  //行详细信息
			rowEdit: "=",  //行编辑
			rowChange: "=",  //行改变
			rowClassName: "=", //行样式
			textName: "@",	//显示变量名
			indexes: "@",	//索引列
			countData: "="	//汇总行
		},
		template: '' +
		'<div class="aps-table" ng-scroll="tableScroll">' +
			'<table>' +
				'<tbody>' +
					'<tr ng-repeat="row in bodyData track by $index" class={{getRowClass($index)}} index="{{$index}}">' +
						'<td ng-style="bodyMoveLeft" ng-if="indexes">{{$index + 1}}</td>' +
						'<td ng-style="bodyMoveLeft" class="operation aps-table-fixed"  ng-if="operationWidth">' +
							'<i class="aps-table-details" ng-if="rowDetails" ng-click="rowDetails($index,$event)"></i>' +
							'<i class="aps-table-edit" ng-if="rowEdit" ng-click="rowEdit($index)"></i>' +
							'<i class="aps-table-change" ng-if="rowChange" ng-click="rowChange($index,$event)"></i>' +
						'</td>' +
						'<td ng-repeat="cell in row track by $index" rowspan="{{cell.rowspan || 1}}" colspan="{{cell.colspan || 1}}" class="{{cell.class}}" ng-class="rowSpanColIndex.indexOf($index) > -1 ? \'bgc-white\' : \'\'">{{cell[labelName]}}</td>' +
					'</tr>' +
					'<tr ng-if="countData && countData.length" ng-style="countMove" class="count-tr">' +
						'<td ng-style="bodyMoveLeft" ng-if="indexes"></td>' +
						'<td ng-style="bodyMoveLeft" ng-if="operationWidth"></td>' +
						'<td ng-repeat="cell in countData track by $index">{{cell}}</td>' +
					'</tr>' +
				'</tbody>' +
				'<thead id="aps-table-head" ng-style="headMoveTop">' +
					'<tr>' +
						'<th ng-style="bodyMoveLeft" ng-if="indexes">序号</th>' +
						'<th ng-style="bodyMoveLeft" style="width: {{operationWidth+ \'px\'}}  " ng-if="operationWidth">操作</th>' +
						'<th ng-repeat="cell in headData track by $index"  on-finish-render="tableScroll">{{cell}}</th>' +
					'</tr>' +
				'</thead>' +
			'</table>' +
		'</div>',
		link: function(scope,ele){
			
			//显示的名称
			if(scope.textName){
				scope.labelName = scope.textName;
			}else{
				scope.labelName = "label";
			}
			
			//确认合计数列号
			scope.rowSpanColIndex = [];
			if(scope.headData){
				for(let i = 0, l = scope.headData.length; i < l; i++){
					if(scope.headData[i] === "合计数"){
						scope.rowSpanColIndex.push(i);
					}
				}
			}
			
			//确定操作列的宽度
			function setOperationWidth(){
				let allOperation = [scope.rowDetails,scope.rowEdit,scope.rowChange],
					num = 0;
				
				for(let i = 0, l = allOperation.length; i < l; i++){
					if(allOperation[i]){
						num ++;
					}
				}
				scope.operationWidth = num * 50;
			}
			
			setOperationWidth();
			
			//监听渲染数据的改变
			scope.$watch("rowDetails",(newVaule, oldValue) =>{
				setOperationWidth()
			})
			
			//监听渲染数据的改变
			scope.$watch("rowEdit",(newVaule, oldValue) =>{
				setOperationWidth()
			})
			
			//监听渲染数据的改变
			scope.$watch("rowChange",(newVaule, oldValue) =>{
				setOperationWidth()
			})
			
			//监听渲染数据的改变
			scope.$watch("bodyData",(newVaule, oldValue) =>{
				scope.ngModel = [];
			})
			
			//监听渲染数据的改变
			scope.$watch("headData",(newVaule, oldValue) =>{
				if(newVaule){
					for(let i = 0, l = newVaule.length; i < l; i++){
						if(newVaule[i] === "合计数"){
							scope.rowSpanColIndex.push(i);
						}
					};
					//on-finish-render只执行一次，无奈用timeout
					$timeout(()=>{scope.tableScroll()},200);
				}
			})
			
			//首行及前两列固定
			scope.tableScroll = function(){
				const $Element = $(ele),
					  scrollBar = ele[0].scrollWidth > ele[0].clientWidth ? 10 : 1,
					  top = $Element.scrollTop(),
					  left = $Element.scrollLeft(),
					  height = $Element.children("table").height() - $Element.height() - top + scrollBar;
				
				scope.headMoveTop = {
					"transform": "translateY(" + top + "px)"
				};
				scope.bodyMoveLeft = {
					"transform": "translateX(" + left + "px)"
				};
				scope.countMove = {
					"transform": "translateY(" + -height + "px)"
				}
			};
			
			//resize
			$(window).on("resize",function(){
				$timeout(function(){
					scope.tableScroll();
				},0);
			});
			
			//表格行样式
			scope.getRowClass = function(index){
				if(scope.rowClassName && typeof scope.rowClassName === "function"){
					return scope.rowClassName(index);
				}
				return '';
			};
		}
	}
}]);

/**
* desc:滚动事件
* last:2017-08-02
* @param:
* @return:
**/
app.directive('ngScroll', ['$timeout', function() {
        return {
            restrict: 'A',
            link: function(scope, iElement, attrs) {
				const $Element = $(iElement);
                $Element.scroll(function() {
                	//当距离底部200px的时候，进行监测滚动加载
					let fun = scope.$eval(attrs.ngScroll);
//						top = $Element.scrollTop(),
//						left = $Element.scrollLeft();
					scope.$apply(function(){
							fun(iElement);
						});
                });
            }
        };
    }
]);
/**
* desc:一级页面滚动加载
* last:2017-08-02
* @param:
* @return:
**/
app.directive('pagescroll', ['$timeout', function() {
        return {
            restrict: 'A',
            link: function(scope, iElement, attrs) {
                const $Element = $(iElement);
                $Element.scroll(function() {
                	//当距离底部200px的时候，进行监测滚动加载
                    if ($Element.scrollTop() + $Element.innerHeight() >= $Element[0].scrollHeight - 200) {
                        scope.myPagingFunction();
                    }
                });
            }
        };
    }]);

/**
 * desc:穿梭框
 * last:2017-08-02
 * @param:
 * @return:
 **/
app.directive('transfer',function () {
	return {
		"restrict" : "E",
		replace : true,
		template :
		'<div class="aps-transfer">' +
			'<transfer-panel id="provide-item" class="provide-item" show-item-list="leftItemList" checked="leftChecked" ng-title="title[0]"></transfer-panel>' +
			'<div class="middleBtn">' +
				'<span class="toggleBtn addAllItem" ng-click="addToRight()"></span>' +
				'<span class="toggleBtn removeAllItem" ng-click="addToLeft()"></span>' +
			'</div>' +
			'<transfer-panel id="sort-item" class="sort-item" show-item-list="rightItemList" checked="rightChecked" select-item="true" move="move" order="order" ng-title="title[1]"></transfer-panel>' +
		'</div>',
		scope : {
			data : "=",	//传入展示的数据
			value : "=",	//传入哪些值默认选中
			ngTitle : "=",	//左右穿梭框顶头显示的文案
			move : "@",	//是否提供移动功能
			order : "@",	//是否提供升序降序功能
		},
		link : function (scope) {
			scope.title = scope.ngTitle || ["未显示项","已显示项"];
			//左边的展示项
			scope.leftItemList = [];
			//右边的展示项
			scope.rightItemList = [];
			//左边选中哪些项
			scope.leftChecked = [];
			//右边选中哪些项
			scope.rightChecked = [];


			//监测传进来的所有配置项的数据，主要是初始化
			scope.$watch("data",function (n, o) {
				if(o === undefined && n !== undefined){
					scope.getSelectItem()
				}
				if(scope.value){
					scope.getSelectItem();
				}
			});

			//监听实时选中的值
			scope.$watch("value.length",function (n, o) {
				if(o !== undefined && n !== undefined){
					scope.getSelectItem()
				}
				scope.$emit("transferChecked",scope.value)
			},true);

			//监测因为升序降序造成的改变
			scope.$on("transferOrder",function (e, val) {
				let index = scope.value.findIndex(item => item.replace(":desc","") === val.replace(":desc",""))
				scope.value[index] = val;
			});

			//监测因为上下移动造成的改变
			scope.$on("changeValue",function (e, val) {
				scope.value = val;
				scope.$emit("transferChecked",scope.value);
			});

			//根据选中的值，拆分所有的配置项为左边和右边的展示项
			scope.getSelectItem = function () {
				//清空之前所有显示项
				scope.leftItemList = [];
				scope.rightItemList = new Array(scope.value.length);
				//根据所有配置项和已经选择的配置项，筛选出左右两边展示栏
				scope.data.forEach(item => {
					let cacheId;  //  记录一个临时id用来获得选中的配置项
					//这边因为右边选中项需要排序功能，所以才需要使用index，
					const index = scope.value.findIndex((selectItem) => {
						cacheId = selectItem;
						return item.id.replace(":desc","") === selectItem.replace(":desc","");
					});
					if(index > -1){
						item.id = cacheId;
						scope.rightItemList[index] = item;
					}else{
						scope.leftItemList.push(item)
					}
				});
			};

			//将某一项移动到左边
			scope.addToLeft = function () {
				scope.rightChecked.forEach(checkItem => {
					const index = scope.value.findIndex(valueItem => checkItem.replace(":desc","") === valueItem.replace(":desc",""))
					if(index > -1){
						scope.value.splice(index,1);
					}
				});
				scope.cancelSelectStatus(scope.rightChecked);
				// scope.$emit('input', scope.value);
				//向外提供一个改变时的回调方法，提供三个参数,
				//currentValue:右边选中的值，方向，此时传递选中了哪些数据
				// scope.$emit("change",scope.value,"left",scope.rightChecked.slice(0));
				//同步子组件已选中的长度
				scope.rightChecked = [];
			};
			//将某一项移动到右边
			scope.addToRight = function () {
				scope.leftChecked.forEach(item => {
					if(scope.value.indexOf(item) === -1){
						scope.value.push(item)
					}
				});
				//取消移动配置项的选中状态
				scope.cancelSelectStatus(scope.leftChecked);
				// scope.$emit('input', scope.value);
				// //向外提供一个改变时的回调方法，提供三个参数
				// scope.$emit("change",scope.value,"right",scope.leftChecked.slice(0));
				//同步子组件已选中的长度
				scope.leftChecked = [];
			};
			//取消所有的选中状态
			scope.cancelSelectStatus = function (thisCheck) {
				thisCheck.forEach(selectItem => {
					scope.data.some(item => {
						if(selectItem === item.id){
							item.isSelected = false;
							return true;
						}
					})
				});
			}
		}
	}
});

app.directive("transferPanel",function () {
	return {
		restrict : "E",
		replace : "true",
		template : '<div class="transfer-panel">' +
			'<h6 class="transfer-title">' +
				'{{ngTitle}}' +
				'<span class="aps-arrow up" ng-show="selectItem && move" ng-click="upSortItem()"></span>' +
				'<span class="aps-arrow down" ng-show="selectItem && move" ng-click="downSortItem()"></span>' +
			'</h6>' +
			'<nav>' +
				'<ul>' +
					'<li ng-repeat="data in showItemList track by $index" class="normal mt-5" title={{data.label}}>' +
						'<label  class="input-checkbox textover" ng-click="toggleChecked(data,$event)">' +
							'<input type="checkbox" name="data.id" ng-model="data.isSelected">' +
							'<span class="checkBox-inner"></span>' +
							'<span class="textover aps-transfer-label">{{data.label}}</span>' +
						'</label>' +
						'<span class="item-order" ng-show="selectItem && order" ng-class="data.id.includes(\'desc\') ? \'desc\' : \'\'" ng-click="toggleOrder(data)"></span>' +
					'</li>' +
				'</ul>' +
			'</nav>' +
			'<div class="aps-transfer-panel-footer">' +
				'<label class="input-checkbox" ng-click="handleAllCheckedChange($event)">' +
					'<input type="checkbox" name="allChecked" ng-model="allChecked">' +
					'<span class="checkBox-inner"></span>' +
					'<em class="ml-5" style="display: inline-block" ng-show="selectCount !== 0"><em>已选择 {{selectCount}} / </em>{{showItemList.length}}</em>' +
					'<em class="ml-5" style="display: inline-block" ng-show="selectCount === 0">共 {{showItemList.length}} 项</em>' +
				'</label>' +
			'</div>' +
		'</div>',
		scope : {
			showItemList : "=",	//传入的展示数据
			checked : "=",	//传进来的所有配置项的id数组
			ngTitle : '=',
			move : "=",	//是否提供移动功能
			order : "=",	//是否提供升序降序功能
			selectItem : "=",	//是否为右边选中栏
		},
		link : function (scope, elem) {
			scope.allChecked = false;	//全选

			//实时监测当前的选中项
			scope.$watch("checked",function (n,o) {
				if(scope.checked.length === 0){
					scope.showItemList.forEach(item => item.isSelectd = false);
				}
				// alert(scope.checked);
				scope.selectCount = scope.checked.length;
				//根据当前点击，是否更新全选按钮的状态
				scope.allChecked = scope.selectCount > 0 &&　scope.selectCount === scope.showItemList.length
			});

			scope.handleAllCheckedChange = function(e){
				//避免误点
				if(e.target.tagName === "LABEL"){
					return;
				}
				if(scope.allChecked){
					scope.checked = scope.showItemList.map(item => {
						item.isSelected = true;
						return item.id
					})
				}else{
					scope.checked = [];
					scope.showItemList.forEach(item => {
						item.isSelected = false;
					});
				}
			};
			//点击某个配置项，表示是否选中
			scope.toggleChecked = function(data,e){
				//避免误点
				if((e.target.tagName === "LABEL") || (e.target.tagName === "SPAN")){
					return;
				}
				const checked = [];
				scope.showItemList.forEach(item => {
					if(item.isSelected){
						checked.push(item.id);
					}
				});
				//传出选中的配置项。因为传进来用的是"="号，所以数据双向绑定，
				scope.checked = checked;
			};

			//设置配置项的升序和降序
			scope.toggleOrder = function(item){
				if(item.id.includes(":desc")){
					item.id = item.id.replace(":desc","");
				}else{
					item.id += ":desc";
				}
				scope.$emit("transferOrder",item.id)
			};
			//排序项向上升
			scope.upSortItem = function(){
				const checked = [];
				scope.checked.forEach(checkItem => {
					const index = scope.showItemList.findIndex(item => item.id === checkItem);
					if(index === 0)return;
					[scope.showItemList[index - 1],scope.showItemList[index]] = [scope.showItemList[index],scope.showItemList[index - 1]]
				});
				scope.showItemList.forEach(showItem => {
					checked.push(showItem.id);
				});
				scope.$emit("changeValue",checked);
			};
			//排序项向下升
			scope.downSortItem = function(){
				const checked = [];
				//加一个倒序的处理是为了避免两个配置项相邻的bug
				scope.checked.reverse().forEach(checkItem => {
					const index = scope.showItemList.findIndex(item => item.id === checkItem);
					if(index === (scope.showItemList.length - 1))return;
					[scope.showItemList[index],scope.showItemList[index + 1]] = [scope.showItemList[index + 1],scope.showItemList[index]]
				});
				//根据新的顺序去获取选中值的数组
				scope.showItemList.forEach(showItem => {
					checked.push(showItem.id);
				});
				scope.$emit("changeValue",checked);
			};
		}
	}
});

/**
 * desc:表单多选框组件---针对分组全选实现
 * last:2017-11-16
 * @param:
 * @return:
 **/
app.directive("apsCheckboxGroup",function () {
	return {
		restrict : "E",
		transclude : true,
		replace : true,
		template : `<div class="aps-checkbox-group" ng-transclude></div>`,
		scope : {
			ngModel : "=",
			onChange : '&'
		},
		link(scope,elem,attr){
			scope.a = scope.ngModel;
			scope.$watch("ngModel.length",function (n, o) {
				scope.$broadcast("model",scope.ngModel);
			})
		}
	}
});

/**
 * desc:表单多选框组件 checkbox
 * last:2017-11-16
 * @param:
 * @return:
 **/
app.directive("apsCheckbox",function () {
	return {
		restrict : "E",
		transclude : true,
		replace : true,
		require:"?apsCheckboxGroup",
		template : `<label class="aps-checkbox">
		<span class="aps-input-checkbox" ng-class="{
			'is-disabled': disabled,
			'is-checked': ngModel === true,
			}"></span>
			<span class="aps-input-text" ng-transclude></span>
			<input type="checkbox" 
				ng-model="ngModel"
				name={{name}}
				ng-disabled="disabled"
				>
		</label>`,
		scope : {
			name : "=",
			ngModel : "=",
			disabled : "=",
			value : "=",
			onChange : '&'
		},
		link(scope,elem,attr){
			scope.$on("model",function (e,v) {
				console.log(e,v);
			});
			scope.$watch("ngModel",function (n, o) {
				if(scope.onChange && typeof scope.onChange === "function"){
					scope.onChange({n:n,o:o});
				}
			})
		}
	}
});

/**
 * desc:表单单选框组件Radio
 * last:2017-11-16
 * @param:
 * @return:
 **/
app.directive("apsRadio",function () {
	return {
		restrict : "E",
		transclude : true,
		replace : true,
		template : `<label class="aps-radio">
		<span class="aps-input-radio" ng-class="{
			'is-disabled': disabled,
			'is-checked': ngModel === value,
			}"></span>
			<span class="aps-input-text" ng-transclude></span>
			<input type="radio" ng-model="ngModel" value={{value}} name={{name}} ng-disabled="disabled">
		</label>`,
		scope : {
			name : "=",
			ngModel : "=",
			disabled : "=",
			value : "=",
			onChange : '&'
		},
		link(scope,elem,attr){
			scope.$watch("ngModel",function (n, o) {
				scope.onChange({n:n,o:o});
			})
		}
	}
});

/**
 * desc:表单单选框组件Switch
 * last:2017-11-16
 * @param:
 * @return:
 **/
app.directive("apsSwitch",function () {
	return {
		restrict : "E",
		transclude : true,
		replace : true,
		template : `<label class="aps-switch" ng-class="{
				'is-disabled': disabled,
				'is-checked': ngModel === true,
			}">
			<span class="aps-button-switch"></span>
			<input type="checkbox" ng-model="ngModel" name={{name}} ng-disabled="disabled">
		</label>`,
		scope : {
			name : "=",
			ngModel : "=",
			disabled : "=",
			onChange : '&'
		},
		link(scope,elem,attr){
			scope.$watch("ngModel",function (n, o) {
				if(scope.onChange && typeof scope.onChange === "function"){
					scope.onChange({n:n,o:o});
				}
			})
		}
	}
});

app.directive("apsSlide",["$timeout",function ($timeout) {
	return {
		restrict : "E",
		transclude : true,
		replace : true,
		template : `<div class="aps-slide">
			<div class="aps-slide-way" ng-class="disabled ? 'is-disabled' : ''" ng-click="onSliderClick($event)">
				<div class="aps-slide-way-inner"></div>
				<div class="aps-slide-button" ng-click="onSliderClick($event)" ng-mousedown="onDragStart($event)">
					<span class="aps-slide-button-inner"></span>
				</div>
			</div>
			<!--<input type="text">-->
		</div>`,
		scope : {
			ngModel : "=",
			onChange : "&",
			disabled : "="
		},
		link : function (scope,elem,attr) {
			let dragging = false;
			let startX;
			let slideInner = elem[0].getElementsByClassName("aps-slide-way-inner")[0];
			let slideBtn = elem[0].getElementsByClassName("aps-slide-button")[0];
			let sliderWidth = elem[0].clientWidth;
			let sliderOffsetLeft = elem[0].getBoundingClientRect().left;

			scope.$watch("ngModel",function (n, o) {
				scope.setPosition(n / sliderWidth);
			});

			//	根据百分比来确定定位
			scope.setPosition = function (percent) {
				percent = percent > 1 ? 1 : percent;
				percent = percent < 0 ? 0 : percent;
				slideInner.style.width = percent  * sliderWidth + "px";
				slideBtn.style.left = percent * 100 + "%";

				if(scope.onChange && typeof scope.onChange() === "function"){
					scope.onChange();
				}
			};

			//根据在slide条上点击的位置跳动到指定的距离
			scope.onSliderClick = function (e) {
				if(scope.disabled) return;
				let sliderOffsetLeft = e.target.getBoundingClientRect().left;//获取slide条在页面中距离左边的距离,
				scope.ngModel = e.clientX - sliderOffsetLeft;	//计算出在slide条中的距离
			};

			scope.onDragStart = function (e) {
				if(scope.disabled) return;
				e.preventDefault();
				dragging = true;
				startX = e.clientX;

				window.addEventListener('mousemove', scope.onDragging);
				window.addEventListener('mouseup', scope.onDragEnd);
				window.addEventListener('contextmenu', this.onDragEnd);
			};

			scope.onDragging = function (e) {
				if(dragging){
					let diff = e.clientX - startX;
					$timeout(function () {
						scope.ngModel = startX - sliderOffsetLeft +  diff;
					})
				}
			};

			scope.onDragEnd = function () {
				dragging = false;

				window.removeEventListener('mousemove', this.onDragging);
				window.removeEventListener('mouseup', this.onDragEnd);
				window.removeEventListener('contextmenu', this.onDragEnd);
			}
		}
	}
}])

