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
//下拉款多选
app.directive("multipleDropDownList",function () {
	return {
		restrict: "E",
		scope:{
			dropDownData: "=",
			dropStyle : "="
		},
		replace: true,
		template : '' +
		'<div class="search-item" ng-class="hasDragClass ? \'drag-item\' : \'\'">' +
			'<span style="color:#000;"><span style="color:#f00;">*</span>{{dropDownData.showText}}：</span>' +
			'<div class="search-input-item" ng-click="showInputDragDownList($event)" ng-mouseleave="hideInputDragDownList($event)">' +
				'<input type="text" class="search-input" ng-model="dropDownData.selectText" ng-style="dropStyle" title={{dropDownData.selectText}} disabled />' +
				'<input type="hidden" class="search-input" ng-model="dropDownData.value" ng-value="dropDownData.value"/>' +
				'<em class="clear-value cancal-search-value jCancalSearchValue" ng-show="hasValue" ng-click="clearSelectValue($event)"></em>' +
				'<div class="drop-down-list">' +
					'<ul>' +
						'<li class="textover" ng-class="item.isActive ? \'active\' : \'\'" ng-repeat="item in searchDragList track by $index"  title={{item.dragItemText}} ng-click="listLiCheck(item,$event)">{{item.dragItemText}}</li>' +
					'</ul>' +
				'</div>' +
			'</div>' +
		'</div>',
		link: function(scope){
			scope.hasValue = false;//第一个input框内是否有值
			scope.hasDragClass = true;//初始drag-item的class是否出现
			//监测是为了获得数据进行初始化
			scope.$watch("dropDownData",function (newValue,oldValue) {
				if(scope.dropDownData === undefined) return;
				scope.searchDragList = scope.dropDownData.repeatData;
			});

			//根据下拉输入框里的值进行筛选下拉框的内容
			scope.getSearchValue = function (searchValue) {
				scope.searchDragList = scope.searchData.repeatData.filter((item)=>{
					return item.showName.indexOf(searchValue) > -1;
				});
			};

			//监测输入框里的值，如果根据输入框里的值icon发生相应的变化
			scope.$watch("dropDownData.value",function (newValue) {
				//如果输入框没有值，则icon变为下拉选项
				scope.hasValue = !!newValue;
				scope.hasDragClass = !scope.hasValue;
			});

			//点击input出现搜索下拉框
			scope.showInputDragDownList = (e) => {
				$(e.target).parents(".search-item").addClass("active");
			};

			//离开input搜索下拉框消失
			scope.hideInputDragDownList = (e) => {
				$(e.target).parents(".search-item").removeClass("active");
			};

			//点击下拉的li，搜索框出现选中的内容
			scope.listLiCheck = function (item,e) {
				let newText = [],newValue = [];
				//加上判断为了处理初始没有值的情况下，使用join会出现一个逗号
				if(scope.hasValue){
					newValue = newValue.concat(scope.dropDownData.value.split(","));
					newText = newText.concat(scope.dropDownData.selectText.split(","));
				}
				//如果是已经选中的，则取消选中
				if(item.isActive){
					const index = newText.indexOf(item.dragItemText);
					newText.splice(index,1);
					newValue.splice(index,1);
				}else{
					newText.push(item.dragItemText);
					newValue.push(item.value);
				}
				item.isActive = !item.isActive;
				scope.dropDownData.selectText = newText.length > 0 ? newText.join() : "请选择排程原因";
				scope.dropDownData.value = newValue.join();
			};
			//清除选中的值
			scope.clearSelectValue = function (e) {
				scope.dropDownData.value = undefined;//清空值
				scope.dropDownData.selectText = "请选择排程原因";//清空值
				//清空下拉列表的选中状态
				scope.searchDragList.forEach(function (item) {
					item.isActive = false;
				});
				$(e.target).parents(".search-item").addClass("drag-item");
			}
		}
	}
})

//搜索框下面出现的下拉框
app.directive("searchDropDownList",function ($timeout) {
    return {
        restrict : "E",
        replace : true,
        transclude: true,
        scope:{
            searchData: "=",
            style : "="
        },
        template : '' +
        '<div class="{{searchData.className}} search-item" ng-class="hasDragClass ? \'drag-item\' : \'\'">' +
            '<span class="search-item-name">{{searchData.showText}}：</span>' +
			'<div class="search-input-item" ng-click="showInputDragDownList($event)" ng-mouseleave="hideInputDragDownList($event)">' +
				'<em class="clear-value cancal-search-value jCancalSearchValue" ng-show="hasValue" ng-click="clearSelectValue($event)"></em>' +
				'<input type="text" class="search-input" ng-model="searchData.value" ng-style="style" title={{searchData.value}} disabled="disabled"/>' +
				'<div class="drop-down-list">' +
					'<input type="text" class="mt-10 mb-10 ml-10" ng-keyup="getSearchValue(searchValue)" ng-model="searchValue">' +
					'<ul>' +
						'<li class="textover" ng-class="item.isActive ? \'active\' : \'\'" ng-repeat="item in searchDragList track by $index"  title={{item.dragItemText}} ng-click="listLiCheck(item,$event)">{{item.dragItemText}}</li>' +
					'</ul>' +
				'</div>' +
            '</div>' +
        '</div>',
        link: function(scope){
            scope.hasValue = false;//第一个input框内是否有值
            scope.hasDragClass = true;//初始drag-item的class是否出现
			
			//监测是为了获得数据进行初始化
            scope.$watch("searchData.repeatData",function (newValue,oldValue) {
                if(scope.searchData === undefined) return;
                scope.searchDragList = scope.searchData.repeatData;
                //只有初始进来的情况下执行
                if(oldValue === undefined && newValue !== undefined){
                	const valueArr = [];
                    scope.searchData.repeatData.forEach((item) => {
                    	if(item.isActive){
                            valueArr.push(item.dragItemText);
						}
					});
                    scope.searchData.value = valueArr.join(",");
                }
            });

            //监测输入框里的值，如果根据输入框里的值icon发生相应的变化
            scope.$watch("searchData.value",function (newValue) {
                //如果输入框没有值，则icon变为下拉选项
                scope.hasValue = !!newValue;
                scope.hasDragClass = !scope.hasValue;
            });

            //根据下拉输入框里的值进行筛选下拉框的内容
            scope.getSearchValue = function (searchValue) {
                scope.searchDragList = scope.searchData.repeatData.filter((item)=>{
                    return item.dragItemText.indexOf(searchValue) > -1;
                });
            };

            //点击input出现搜索下拉框
            scope.showInputDragDownList = (e) => {
                $(e.target).parents(".search-item").addClass("active");
            };

            //离开input搜索下拉框消失
            scope.hideInputDragDownList = (e) => {
                $(e.target).parents(".search-item").removeClass("active");
            };

            //点击下拉的li，搜索框出现选中的内容
            scope.listLiCheck = function (item,e) {
                let newText = [];
                let inputValue = $(e.target).parents(".drop-down-list").siblings("input").val();
                //加上判断为了处理初始没有值的情况下，使用join会出现一个逗号
                if(!!inputValue){
                    newText = newText.concat(inputValue.split(","));
                }
                //如果是已经选中的，则取消选中
                if(item.isActive){
                    const index = newText.indexOf(item.dragItemText);
                    newText.splice(index,1);
                }else{
                    newText.push(item.dragItemText);
                }
                item.isActive = !item.isActive;
                scope.searchData.value = newText.join();
            };
            //清除选中的值
            scope.clearSelectValue = function (e) {
                scope.searchData.value = [].join("");//清空值
                //清空下拉列表的选中状态
                scope.searchDragList.forEach(function (item) {
                    item.isActive = false;
                });
                $(e.target).parents(".search-item").addClass("drag-item");
            }
        }
    }
});

//搜索框下面出现的下拉框(带ID)
app.directive("searchDropDownListWithId",function () {
    return {
        restrict : "E",
        replace : true,
        transclude: true,
        scope:{
            searchData: "=",
        },
        template : '' +
        '<span class="{{searchData.className}} search-item-with-id">' +
        '<span class="search-item-name">{{searchData.showText}}：</span>' +
        '<span class="search-input-item" ng-click="showInputDragDownList($event)" ng-mouseleave="hideInputDragDownList($event)">' +
        '<input type="text" class="search-input" disabled="disabled"/>' +
        '<div class="drop-down-list">' +
        '<input type="text" class="mt-10 mb-10 ml-10" ng-keyup="getSearchValue(searchValue)" ng-model="searchValue">' +
        '<ul>' +
        '<li class="textover" ng-repeat="item in searchDragList track by $index" item_id={{item.id}} title={{item.showName}} ng-click="listLiCheck($event)">{{item.showName}}</li>' +
        '</ul>' +
        '</div>' +
        '</span>' +
        '</span>',
        link: function(scope){
            //监测是为了获得数据进行初始化
            scope.$watch("searchData.repeatData",function () {
				if(scope.searchData){
					scope.searchDragList = scope.searchData.repeatData;	
				}
            });
            //根据下拉输入框里的值进行筛选下拉框的内容
            scope.getSearchValue = function (searchValue) {
                scope.searchDragList = scope.searchData.repeatData.filter((item)=>{
                    return item.showName.indexOf(searchValue) > -1;
                });
            };
            //点击input出现搜索下拉框
            scope.showInputDragDownList = (e) => {
                $(e.target).parents(".search-item-with-id").addClass("active");
            };
            //离开input搜索下拉框消失
            scope.hideInputDragDownList = (e) => {
                $(e.target).parents(".search-item-with-id").removeClass("active");
            };
            //点击下拉的li，搜索框出现选中的内容
            scope.listLiCheck = function (e) {
                const targetLi = $(e.target);
                targetLi.toggleClass("active");
                let newText = [],
					newCheckIdList = [];
                targetLi.parent().find(".active").each(function(){
                    newText.push($(this).text());
					newCheckIdList.push($(this).attr("item_id"))
                });
                targetLi.parents(".drop-down-list").prev().val(newText.join());
				targetLi.parents(".drop-down-list").prev().attr("check_id",newCheckIdList.join());
				targetLi.parents(".drop-down-list").prev().attr("title",newText.join());
            }
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
		'<div class="scrollbar" ng-mousemove="move($event)" ng-style="isSmall ? {marginLeft:\'82px\'} : {marginLeft:\'160px\'}" ng-mouseleave="stop_move()" ng-mouseup="stop_move()">' +
			'<div class="scrollbar-thumb" ng-style="isSmall ? {width:controllerDate.smallScrollbarThumbWidth,marginLeft:smallMarginLeft} : {width:controllerDate.bigScrollbarThumbWidth,marginLeft:bigMarginLeft}" ng-mousedown="start_move($event)"  >' +
				/*'<div style="width:20%;height:100%;background:red" ng-click="changeModel()"></div>' +*/
			'</div>' +
			'<div class="scrollbar-date-select scrollbar-min-startdate">' +
				'<span class="scrollbar-span" ng-click="changeMinStartDate(-1)"></span>' +
				'<input type="text" class="Wdate minStartDate" onclick="WdatePicker({isShowClear:false})" ng-model="controllerDate.minStartDate" readonly>' +
				'<span class="scrollbar-span scrollbar-right-span" ng-click="changeMinStartDate(1)"></span>' +
			'</div>' +
			'<div class="scrollbar-date-select">' +
				'<span class="scrollbar-span" ng-click="changeMaxEndDateOneDay(-1)"></span>' +
				'<input type="text" class="Wdate maxEndDate" onclick="WdatePicker({isShowClear:false})" ng-model="controllerDate.maxEndDate" readonly>' +
				'<span class="scrollbar-span scrollbar-right-span" ng-click="changeMaxEndDateOneDay(1)"></span>' +
			'</div>' +
		'</div>',
		link: function(scope){
			let smallThumbMarginLeftNum = 0;
			let bigThumbMarginLeftNum = 0;
			scope.smallMarginLeft = smallThumbMarginLeftNum + "px";
			scope.bigMarginLeft = bigThumbMarginLeftNum + "px";
			//改变最小开始时间
			scope.changeMinStartDate = function(dayNum){
				scope.controllerDate.minStartDate = tool.dateToString(tool.dateChange(dayNum,scope.controllerDate.minStartDate));
			}
			//改变最大结束时间
			scope.changeMaxEndDateOneDay = function(dayNum){
				scope.controllerDate.maxEndDate = tool.dateToString(tool.dateChange(dayNum,scope.controllerDate.maxEndDate));
			}
			//开始移动
			scope.start_move = function($event){
				//阻止触发全局绑定的框选事件
				$event.stopPropagation();
				scope.in_move = true;
			}
			//移动中
			scope.move = function($event){
				//非移动状态，返回
				if(!scope.in_move){
					return;
				}
				//大小格子两套
				if(scope.isSmall){
					smallThumbMarginLeftNum += $event.movementX;
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
					bigThumbMarginLeftNum += $event.movementX;
					bigThumbMarginLeftNum = bigThumbMarginLeftNum < 0 ? 0 : bigThumbMarginLeftNum;
					if(scope.controllerDate.smallScrollWidth < 0){
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
			}
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
})

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
				console.log(scope.AllData);
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
})

//渲染结束后执行的回调
app.directive("onFinishRender",['$timeout', '$parse', function ($timeout, $parse) {
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
                        fun();  //回调函数
                    }
                });
            }
        }
	}
}]);

/**
* desc:配置页中拖拽显示模板
* time:2017-05-16
* @param:
* @return:
**/
app.directive("dragSelectItem",['$timeout',function ($timeout) {
	return {
		"restrict" : "E",
		replace : true,
		scope : {
		    displayData : "=",//原来写死在html里的定制文案
			isSort : "=",//用来判断显示列表还是排序列表
            userConfigData : "=",//列表左侧所有的数据
            userSelectConfigData : "=",//列表右侧所有数据
		},
		template : '' +
        '<div id="all-item" class="table-sort-itemList" onselectstart="return false">' +
			'<div class="provide-item">' +
				'<h6 class="sort-title">{{displayData.leftDisplay}}</h6>' +
				'<nav>' +
					'<ul id="provide-item">' +
						'<li ng-repeat="data in userConfigData" class="normal mt-5" data-select="option" data-keyname={{data.valueContent.replace(":desc","")}} data-order="up">' +
							// '<div>{{ data.valueAlias }}</div><span ng-class={{data.valueContent.slice(-4)}} ng-class="itemOrder"></span>' +
        					'<div>{{ data.valueAlias }}</div><span ng-class="{\'itemOrder\' : isSort,\'desc\' : data.valueContent.slice(-4)=== \'desc\'}"></span>' +
						'</li>' +
					'</ul>' +
				'</nav>' +
			'</div>' +
			'<div class="middleBtn">' +
				'<span class="toggleBtn addAllItem"></span>' +
				'<span class="toggleBtn removeAllItem"></span>' +
			'</div>' +
			'<div class="sort-item">' +
				'<h6 class="sort-title">{{displayData.rightDisplay}} <span class="order up-order"></span><span class="order down-order"></span></h6>' +
				'<nav>' +
					'<ul id="sort-item">' +
						'<li ng-repeat="data in userSelectConfigData" data-select="select" class="normal mt-5" data-keyname={{data.valueContent.replace(":desc","")}} data-order={{data.order}}>' +
							'<div>{{ data.valueAlias }}</div><span ng-class="{\'itemOrder\' : isSort,\'desc\' : data.valueContent.slice(-4)=== \'desc\'}"></span>' +
						'</li>' +
					'</ul>' +
				'</nav>' +
			'</div>' +
        '</div>',
	}
}]);


/**
* desc:一级页面滚动加载
* last:2017-08-02
* @param:
* @return:
**/
app.directive('pagescroll', ['$timeout', function($timeout) {
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
    }
]);

