/**
 * ViewModel相关的函数
 * Created by duww on 2016/6/30.
 */

/**
 *  现阶段服务分为两块，数据处理(scheduleTableViewModelService)和封装的小方法(tool)
 *  注意:服务名和文件名对应
 * 
 */

//注释格式
/**方法功能
 * 
 * @param 入参
 * @return 返回值
 */

app
	.service('scheduleTableViewModelService', function($rootScope,tool) {
		
		
	    /**
	     * 获取json数据中，关于最大最小日期的数据
	     * @param json_object: schedule_table_json
	     * @return query字段相关的数据对象集合
	     */
	    this.jsonToQueryObject = function (json_object){
	        return json_object.query;
	    }
	
	    /**
	     * 把json格式转化为页面的ViewModel：排程页面表格头部的显示模型
	     * @param json_object: schedule_table_json
	     * @return tableHeadViewModel
	     */
	    this.jsonToTableHeadViewModel = function (json_object){
	    	var dateList = json_object.time,
	    		equipmentList = json_object.punit,
	    		returnData = [],
	    		allEquipment = [];
	    	
	    	for(var i in equipmentList){
				allEquipment.push(i);
	    	}
	    	allEquipment = allEquipment.join(",");
	    	
	    	for(var i in dateList){
	    		returnData.push({
	    			thisDate: dateList[i],
	    			equipment: allEquipment
	    		})
	    	}
	        return returnData;
	    }
			
		/**
	     * 把json格式转化为页面的ViewModel：排程页面表格显示模型
	     * @param json_object: schedule_table_json
	     * 
	     * @return table_object
	     */   
	    this.jsonToTableBodyViewModelNew = function (json_object){
	        var tableBodyViewModel = {};//viewModel对象，返回的结果集
	        var table_object = [];//viewModel对象里具体单元格的信息，用于显示表格

			
	        //填充：排程日期
	        var timeList = json_object.time;
	        //行数
	        let rowLength = -1;
	        //单位产能
	        var capabilityUnit = json_object.capabilityUnit;
	        //锁定期&冻结期
	        var freezeDate = json_object.freezeDate;
	        //是否翻转
	        var isFront = json_object.front;
	        //单元格工作时间
	        var workTimeMap = json_object.workTimeMap;
	        //获取查询条件
	        let S_saleOrder = $(".sale-order").find("input").val().trim(),
	            S_materialName = $(".material-name").find("input").val().trim(),
	            S_materialCode = $(".material-code").find("input").val().trim(),
	            isSearch = false;
	        if(S_saleOrder + S_materialName + S_materialCode){
	            isSearch = true;
				//初始为未搜到
				tableBodyViewModel.searchSuccess = "false_search"; 
	        }
	        //填充：设备&单元格&派工单
	        var punitIdList = json_object.punitId;//设备ID列表
	        var punitList = json_object.punit;//主体部分数据
	        if(!punitIdList){
	            layer.alert('数据获取接口有问题，请联系技术人员处理', {
	                skin: 'layer-alert-themecolor' //样式类名
	            });
	            return;
	        }
	        
	        //计算有多少空格子
	        var unitNull = 0;
	        
	        for(let i = 0 ; i < punitIdList.length ; i++){
	            //获取单行设备信息
	            let this_punitId = punitIdList[i];
	            let punit = punitList[this_punitId];
		
				//获取设备相关的单元格信息
		        var punitTaskObject = punit.punitTask;
		        
	            if(punitTaskObject == undefined){
	                continue;
	            }else{
	            	//单元格填充
		            rowLength += 1;
		            table_object[rowLength] = [];
		            //填充：设备列
		            table_object[rowLength][0] = {};
		            table_object[rowLength][0].front = [
		                {
		                    type : 1,
		                    text : punit.punitName,
		                    percent : "100%",
		                    x_coord : rowLength,
		                    y_coord : 0,
		                    freeze_date : freezeDate,
		                    equipment_id : this_punitId,
		                    s_date : timeList[0],//开始时间
		                    e_date : timeList[timeList.length-1],//结束时间
		                }
		            ];
		            table_object[rowLength][0].useData = {
		            	frontClass : "table-td-front",
		            	cursor : "pointer",
		            	isEmpty : true,
						isSearchEmpty : isSearch ? true : false
		            };
					
					
		            //填充：单元格	
		            for(var j = 0 ; j < timeList.length ; j++){
		            	//这个格子是否超产
		            	var isOver;
		                //获取当前日期（日历）
		                var time_str = timeList[j];
								
		                //获取当前日期的单元计划
		                var punitTaskDate = punitTaskObject[time_str];	
		                var isHighLight = false;
		                //根据当前日期填充单元格
		                if(punitTaskDate != undefined){//如果当前时间的对象不为空
		                	table_object[rowLength][0].useData.isEmpty = false;
		                	
		                	var groupObj = {};//合并后的对象
							var groupArr = [];//合并后的数组
							var realWorkTime = 0;//当天实际工作时间
							var sumNum = 0;//合计数
							var changeColor = false;//更换显示颜色用
							
		                    //总工作时间
		                    var totalWorkTime = punitTaskDate.totalWorkTime;
		                    var dispatchOrderList = punitTaskDate.dispatchOrderList;
							
							//遍历所有工单
		                    for(let i = 0 , l = dispatchOrderList.length ; i < l ; i++){
		                        var this_dispatchOrder = dispatchOrderList[i],
		                        	taskNum = this_dispatchOrder.taskNum,
		                        	saleOrderCode = this_dispatchOrder.saleOrderCode,
		                        	materialName = this_dispatchOrder.materialName,
		                        	materialCode = this_dispatchOrder.materialCode,
		                        	groupBy = this_dispatchOrder[$rootScope.showType.group_by],//按合并维度进行合并
		                        	thisTime = this_dispatchOrder.actualUseTime/3600;
		                        	
								//总时间和总数
		                    	realWorkTime += thisTime;
		                    	sumNum += taskNum;
		                    	
		                    	//去重汇总
		                    	if(groupObj[groupBy]){
		                    		groupObj[groupBy].time += thisTime;
		                    		groupObj[groupBy].num += taskNum;
		                    	}else{
		                    		groupObj[groupBy] = {
		                    			time : thisTime,
		                    			num : taskNum
		                    		}
		                    		groupArr.push(groupBy);
		                    	}     
		                    	
		                       //查询下，是否高亮
		                    	if(isSearch && !isHighLight){
		                    		if(
		                    			!((S_saleOrder && saleOrderCode.indexOf(S_saleOrder) < 0) ||
		                           		(S_materialName && materialName.indexOf(S_materialName) < 0) ||
		                           		(S_materialCode && materialCode.indexOf(S_materialCode) < 0))
		                    		){
		                    			isHighLight = true;
										table_object[rowLength][0].useData.isSearchEmpty = false;
		                    			tableBodyViewModel.searchSuccess = "success_search";
		                    		}else{
		                    		}
		                    	}
		                    }
		                    
		                    //本单元格中色块地数量
		                    var groupNum = groupArr.length;
		                    var thisOpacity = isSearch && !isHighLight ? 0.2 : 1;
		                    
		                    if(totalWorkTime > 0){
		              			var workTime = totalWorkTime-realWorkTime;
		              		}else{
		              			var workTime = (-1) * realWorkTime;
		              			totalWorkTime = realWorkTime;
		              		}
		
		                    //超产能、剩余产能
		                    let sWorkTime; 
							//已排时间
							let sRealWorkTime;
		                    if(workTime >= 0){
		                        sWorkTime = "剩余";
		                        var thisH = Math.floor(workTime);
								var thisM = ((workTime-thisH) * 60).toFixed()
		                        workTime = thisH + ":" + thisM;
		                        isOver = false;
//								console.log(thisM);
								sRealWorkTime = getTime(thisH,thisM);
		                    }else{
		                        workTime = workTime * (-1);
		                        var thisH = Math.floor(workTime);
		                        var thisM = ((workTime-thisH) * 60).toFixed();
		                        if(thisH == 0 && thisM <= 10){
		                            sWorkTime = "剩余";
		                            workTime = "00:00";
		                            isOver = false;
									sRealWorkTime = getTime(thisH,thisM);
		                        }else{
		                            sWorkTime = "超出";
		                            workTime = thisH + ":" + thisM;
		                            isOver = true;
									sRealWorkTime = getTime(thisH,thisM);
		                        }
		                    }
							
							//计算已排方法
							function getTime(hour,minute){
								let totalHour = Math.floor(totalWorkTime),
									totalMinute = ((totalWorkTime-totalHour) * 60).toFixed();
								
								let returnHour,
									returnMinute;
								if(isOver){
									if(minute + totalMinute >= 60){
										returnHour = hour + totalHour + 1;
										returnMinute = minute + totalMinute - 60;
									}else{
										returnHour = hour + totalHour;
										returnMinute = minute + totalMinute;
									}
								}else{
									if(totalMinute - minute < 0){
										returnHour = totalHour - hour - 1;
										returnMinute = totalMinute + 60 - minute;
									}else{
										returnHour = totalHour - hour;
										returnMinute = totalMinute - minute;
									}
								}
								return returnHour + ":" + returnMinute;
							}
		                    //补全小数位数
							
		                    workTime = completeDecimal(workTime);
							sRealWorkTime = completeDecimal(sRealWorkTime);
							
							//补全小数位数
							function completeDecimal(time){
								let workTime = time;
								if(workTime.indexOf(":")<0){
									workTime += ":00";
								}else{
									var aWorkTime = workTime.split(":");
									if(aWorkTime[1].length < 2){
										workTime += "0";
										workTime = aWorkTime[0] + ":0" + aWorkTime[1];
									}
								}
								return workTime;
							}
							
		                    sWorkTime += workTime;
							//计算百分比
							let workTimePercent = (realWorkTime / totalWorkTime * 100).toFixed(1);
							//front里存正面色块，back里存背面显示信息，useData里存页面渲染样式用的数据
							table_object[rowLength][1 + j] = {};
		                    table_object[rowLength][1 + j].front = [];
		                    table_object[rowLength][1 + j].back = [
								sWorkTime + " " + Math.abs(100 - workTimePercent).toFixed(1) + "%",
								"已排" + sRealWorkTime + " " + workTimePercent + "%",
		                    	"任务数合计" + sumNum,
		                    	groupNum + $rootScope.showType.cnName
		                    ];
		                    table_object[rowLength][1 + j].useData = {
	                        	cursor : "pointer",
	                        	opacity : thisOpacity,
	                        	dateId : time_str + "" + this_punitId,  
	                        	frontClass : isFront ? "table-td-front" : "table-td-back",
	                        	isLock : tool.stringToDate(freezeDate) >= tool.stringToDate(time_str) ? true : false,
	                        	isOver : isOver
	                        };
		
		                    //填充：派工单
		                    let m = 0;
		                    for(let i = 0 ; i < groupNum ; i++){
		                    	changeColor = !changeColor;
		                    	var thisCapabilityPercent = 0;	                    	
		                        var theMaterialColor;
		                    	//超产能比例计算
		                        if(realWorkTime > totalWorkTime){
		                        	thisCapabilityPercent = groupObj[groupArr[i]].time / realWorkTime;
		                        }else{
		                        	thisCapabilityPercent = groupObj[groupArr[i]].time / totalWorkTime;
		                        }
		
		                        
		                        if($rootScope.showType.group_by == "colorRgb"){
		                        	theMaterialColor = groupArr[i];
			                        //没有颜色的处理
			                        if(!theMaterialColor){
			                            theMaterialColor = "linear-gradient(90deg, #333 0%, #fff 20%,#333 40%, #fff 60%,#333 80%,#fff 100%)";
			                        }else{
			                            theMaterialColor = "#" + groupArr[i];
			                        }
		                        }else{
		                        	theMaterialColor = changeColor ? "#a8d6c9" : "#2b64a7";
		                        }
			                        
		                        /**
		                         *####关键代码####
		                         *把派工单数据转化为视图模型（ViewModel）
		                         */
		                        var u_color = theMaterialColor;
		                        var u_percent = thisCapabilityPercent;
		                        var u_freeze_date = freezeDate;
		                        var u_equipment_id = this_punitId;
		                        var u_date = time_str;
		//                      if( u_percent == undefined || u_percent == 0){continue;}//过滤产能百分比为0的情况
		
		                        table_object[rowLength][1 + j]["front"][m] = {
		                            type : 2,             
		                            x_coord : rowLength,
		                            y_coord : 1 + j,
		                        	color : u_color,
		                        	percent : parseFloat(u_percent) * 100 + "%",
		                            freeze_date : u_freeze_date,
		                            equipment_id : u_equipment_id,
		                            date : u_date,                                      
		                        };
		                        m++;//插入单元格的MV对象下标  
		                    }
		                }else{
		                	unitNull ++ ;
		                	//找出对应格子的工作时间
		                	var punitID_date = this_punitId + "_" + time_str;
		                	var dayWorktime = workTimeMap[punitID_date];
		                	dayWorktime = dayWorktime ? dayWorktime : 0;
		                	
		                	table_object[rowLength][1 + j] = {};
		                    table_object[rowLength][1 + j].front = [];
		                    table_object[rowLength][1 + j]["front"][0] = {
		                        type : 3,
		                        x_coord : rowLength,
		                        y_coord : 1 + j,
		                        date : time_str,
		                        equipment_id : this_punitId,	                                                
		                    };
		                    table_object[rowLength][1 + j].back = [
		                     	"工作时间 : " + dayWorktime + "h"
		                    ];
		                    table_object[rowLength][1 + j].useData = {
		                     	percent : "100%",	
		                        opacity : isSearch ? 0.2 : 1,
		                     	dateId : time_str + "" + this_punitId,
		                     	frontClass : isFront ? "table-td-front" : "table-td-back",
		                        totalWorkTimeIsZero : dayWorktime == 0 ? "td-front-non" : "",
		                        isLock : tool.stringToDate(freezeDate) >= tool.stringToDate(time_str) ? true : false,
		                    }
		                }
		            }            	
	            }
	            
	            //判断是否全是空格子
				if(((rowLength + 1) * j ==  unitNull) && isSearch){
					tableBodyViewModel.searchSuccess = "allUnitNull";
				}
	        }
	        tableBodyViewModel.tableBodyData = table_object;
	        return tableBodyViewModel;
	    }
	   
	    /**
	     * 差异化页面，把json格式转化为一级页面所需要的viewModel
	     * @param json_object：[jsonObj(form),jsonObj(now)]
	     *
	     * @return [tableHeadViewModel(form),tableHeadViewModel(now)]
	     */
	    this.jsonDifferTableBodyViewModel = function(json){
	
	        //1，先将接受数据转化为可用数据=>【object(from),object(now)】
	        for(var i = 0 ; i < json.length ; i ++){
	            json[i] = this.jsonToTableBodyViewModelNew(json[i]) //将获得到的数据转化为正常显示的
	        }
	        
	        //2再将数据转化为差异化可用格式
	        var newDifferArr = [];
	        for(var i = 0 , length = json[0].tableBodyData.length ; i < length ; i++){
	            //json[i].tableBodyData ==>4个数组
	            //var obj = {};
	            //obj.form = json[0].tableBodyData[i];
	            //obj.now = json[1].tableBodyData[i];
	            var arr = [];
	            arr.push(json[0].tableBodyData[i]);
	            arr.push(json[1].tableBodyData[i]);
	            newDifferArr.push(arr);
	        }
	        return newDifferArr;
	    }
	    
	    /**
	     * 把json格式转化为二级页面的的ViewModel：排程页面表格显示模型
	     * @param json_object: windowTableData
	     * 
	     * @return table_object
	     */
	    this.jsonToWindowTableView = function (windowTableData){
	    	var headList = windowTableData.columnAlias;//表头列表
			var tableList = windowTableData.column;		//表格数据顺序
			var query = windowTableData.query;	//筛选项
			var tableData = windowTableData.row; //表格数据
			var table_object = {};//返回的数据
			headList.push("操作");
			table_object.headData = headList;//表头数据
			var bodyData = [];
			
			//行
			for(var i in tableData){
				//本行数据
				bodyData[i] = [];
				var thisRowData = tableData[i];
				
				//按顺序填充单元格
				for(var j in tableList){
					var thisObj = {};
					//显示的文字
					if(tableList[j] == "poolTaskStartTime" || tableList[j] == "poolTaskEndTime"){
						thisObj.showText = thisRowData[tableList[j]] ? thisRowData[tableList[j]].substring(5,16) : "";
					}else if(tableList[j] == "startTime" || tableList[j] == "endTime"){
						thisObj.showText = thisRowData[tableList[j]] ? thisRowData[tableList[j]].substring(5,16) : "";
					}else{
						thisObj.showText = thisRowData[tableList[j]] == undefined ? "" : thisRowData[tableList[j]];
					}
					thisObj.pkId = thisRowData.pkId;
					thisObj.versionId = thisRowData.versionId;
					thisObj.processOrder = thisRowData.processOrder;
					thisObj.index = i;
					thisObj.startTime = thisRowData.startTime;
					thisObj.taskNum = thisRowData.taskNum;
					thisObj.pUnitName = thisRowData.pUnitName
					if(thisRowData.source == undefined){
						thisObj.source = "";
					}else{
						thisObj.source = thisRowData.source;
					}
					
					bodyData[i].push(thisObj);
				}
			}
			
			table_object.bodyData = bodyData;
			return table_object;
	    }
	    
		/**
	     * 把json格式转化为二级差异化页面的的ViewModel
	     * @param json_object: windowTableData
	     * 
	     * @return table_object
	     */
		this.jsonToDifferTable = function (windowTableData){
	    	var headList = windowTableData.columnAlias;//表头列表
			var tableList = windowTableData.column;		//表格数据顺序
			var query = windowTableData.query;	//筛选项
			var tableData = windowTableData.row; //表格数据
			var table_object = {};//返回的数据
			table_object.headData = headList;//表头数据
			var bodyData = [];
			var arrIndex = 0;
			//行
			for(var i in tableData){
				//本行数据
				bodyData[arrIndex] = [];
				var thisRowData = tableData[i];
				
				//按顺序填充单元格
				for(var j in tableList){
					var thisObj = {};
					//显示的文字
					if(tableList[j] == "poolTaskStartTime" || tableList[j] == "poolTaskEndTime"){
						thisObj.showText = thisRowData[tableList[j]].substring(0,13);
					}else if(tableList[j] == "startTime" || tableList[j] == "endTime"){
						thisObj.showText = thisRowData[tableList[j]].substring(0,13);
					}else{
						thisObj.showText = thisRowData[tableList[j]];
					}
					thisObj.pkId = thisRowData.pkId;
					thisObj.versionId = thisRowData.versionId;
					thisObj.processOrder = thisRowData.processOrder;
					thisObj.startTime = thisRowData.startTime;
					thisObj.taskNum = thisRowData.taskNum;
					thisObj.pUnitName = thisRowData.pUnitName;
					thisObj.rowNum = thisRowData.rowNum,
					thisObj.isHighLight = thisRowData.isHighLight,
					thisObj.saleOrderCode = thisRowData.saleOrderCode,
					thisObj.materialName = thisRowData.materialName,
					thisObj.poolTaskEndTime=thisRowData.poolTaskEndTime;
					bodyData[arrIndex].push(thisObj);
				}
				arrIndex++;
			}
			table_object.bodyData = bodyData;
			return table_object;
	    }
		
		/**
	     * 二级差异 把json原始格式转化为通用的的的ViewModel
	     * @param 工单维度判断是否有差异
	     * 
	     * @return oJson
	     */
	    this.rawJsonToGeneral_order = function (json){
	    	var oJson = {
	    		leftJson:{
	    			columnAlias: '',
	    			column: '',
	    			row: ''
	    		},
	    		rightJson:{
	    			columnAlias: '',
	    			column: '',
	    			row: ''
	    		}
	    	};
	    	
	    	var taskLeft = json.leftList,
				taskRight = json.rightList,
				taskCompare = json.compareList;
			
			for(var i in taskCompare){
				var rowNum;
				if(taskCompare[i].result == "true"){
					rowNum=taskCompare[i].rowNum;  //记录差异时的rowNum值,作高亮显示用
					for(var j in taskLeft){    //左侧表格是否高亮
						if(taskLeft[j].rowNum == rowNum){
							taskLeft[j].isHighLight = true;
						}
					}
					for(var j in taskRight){   //右侧表格是否高亮
						if(taskRight[j].rowNum == rowNum){
							taskRight[j].isHighLight = true;
						}
					}
				}		
			}
			
			oJson.leftJson.columnAlias = json.columnAlias;
			oJson.leftJson.column = json.column;
			oJson.leftJson.row = taskLeft;

			oJson.rightJson.columnAlias = json.columnAlias;
			oJson.rightJson.column = json.column;
			oJson.rightJson.row = taskRight;
			
			return oJson;
	    }
	    
	    /**
	     * 二级差异 把json原始格式转化为通用的的的ViewModel
	     * @param 车间计划维度判断是否有差异
	     * 
	     * @return oJson
	     */
	    this.rawJsonToGeneral_data = function (json){
	    	var oJson = {
	    		leftJson:{
	    			columnAlias: '',
	    			column: '',
	    			row: ''
	    		},
	    		rightJson:{
	    			columnAlias: '',
	    			column: '',
	    			row: ''
	    		}
	    	};
	    	
	    	var poolLeft = json.leftList,
				poolRight = json.rightList;
				
			//合并数据方法
			function handle(arr) {
				var obj = {};
				arr.forEach(function(val) {
					if (obj.hasOwnProperty(val.poolTaskId)) {
						obj[val.poolTaskId].taskNum += val.taskNum;
					} else {
						obj[val.poolTaskId] = {
							poolTaskId : val.poolTaskId,
							taskNum : val.taskNum,
							poolTaskStartTime : val.poolTaskStartTime,
							poolTaskEndTime : val.poolTaskEndTime,
							saleOrderCode : val.saleOrderCode,
							materialName : val.materialName
						};
					}
				});
				return obj;
			}
			poolLeft = handle(poolLeft);
			poolRight = handle(poolRight);
			
			//判断差异
			for(var i in poolRight){
				poolRight[i].isHighLight = false;
				for(var j in poolLeft){
					if( !poolLeft[j].isHighLight && poolRight[i].poolTaskId == poolLeft[j].poolTaskId && poolRight[i].taskNum == poolLeft[j].taskNum){
						poolRight[i].isHighLight = true;
						poolLeft[j].isHighLight = true;
						break;
					}
				}
			}
			
			
			oJson.leftJson.columnAlias = json.columnAlias;
			oJson.leftJson.column = json.column;
			oJson.leftJson.row = poolLeft;

			oJson.rightJson.columnAlias = json.columnAlias;
			oJson.rightJson.column = json.column;
			oJson.rightJson.row = poolRight;
			
			return oJson;
	    }
		
	    /**
	     * 列信息配置列表
	     * @param 可以判断是否选中的列信息配置列表
	     */
	    this.columnItem = function(json){
	        var optionList = json.optionList;
	        var selectList = json.selectList;
	        if(!selectList){
	            selectList = [];
	        }
	        for(var i = 0,length = optionList.length;i < length;i++ ){
	            for(var j = 0,len = selectList.length;j < len;j++) {
	                if(selectList[j].valueContent.replace(":desc","") == optionList[i].valueContent.replace(":desc","")){
	                    optionList[i].checked = true;
	                    break;
	                }
	            }
	        }
	        return optionList;
	    }
	    
	    /**
	     * 排序弹窗数据格式转换
	     * @param 排序列表需要接收的对象数据
	     */
	    this.sortItem = function(json){
	        var optionList = json.optionList;
	        var selectList = json.selectList;
	        var leftList = [];
	        if(!selectList){
	            selectList = [];
	        }
	        for(var i = 0,length = optionList.length;i < length;i++ ){
	            var select = true//无奈加的，优化可去
	            for(var j = 0,len = selectList.length;j < len;j++) {
	                if(selectList[j].valueContent.replace(":desc","") == optionList[i].valueContent.replace(":desc","")){
	                    select = false;
	                    break;
	                }
	            }
	            if(select){
	                leftList.push(optionList[i]);
	            }
	        }
	        return leftList;
	    }
	    
	    /**
	     * 排序弹窗数据格式转换
	     * @param 排序列表需要接收的对象数据
	     * return 排序列表右边需要显示的数据
	     */
	    this.sortSelectItem = function(json){
	        var selectList = json.selectList;
	        if(!selectList){
	            selectList = [];
	        }
	        for(var i =0 ; i < selectList.length ; i++){
	            if(selectList[i].valueContent.indexOf("desc") != "-1"){
	                selectList[i].order = "down";
	            }else{
	                selectList[i].order = "up";
	            }
	        }
	        return selectList
	    }
	
		/**
		 * 排序弹窗数据格式转换
		 * @param 汇总项和合并项接收的数据
		 * return 显示的数据和当前选中的数据
		 */
		this.combinecountItem = function(oldResObj){
			if(!oldResObj.optionList)return;
			var resObj = $.extend({},oldResObj);
			var optionList = [];
			resObj.optionList.forEach(function(optionItem){
				var obj = {};
				obj.text = optionItem.valueAlias;
				obj.value = optionItem.valueContent;
				obj.show = false;
				//进行判断该选项是否被选中，下拉列表是够显示
				if(resObj.selectList){
					resObj.selectList.forEach(function(selectItem,index){
						if(optionItem.valueAlias == selectItem.valueAlias){
							obj.show = true;
							//resObj.selectList.splice(index,1);//减少之后的遍历循环
							return false;
						}
					})
				}
				optionList.push(obj);
			});
			return optionList
		}
		
	    /**
	     * 排程前校验传入数据处理
	     * json 校验规则可配发送请求传入的数据
	     */
	    this.validation_rules_from = function(json){
            let resObj = json.preScheduleCheckMap;//传入的数据
            let returnObj = {};//创建返回的对象
	        for(let preCheckName in resObj){
	            returnObj[preCheckName] = {};
                returnObj[preCheckName].name = preCheckName;
                returnObj[preCheckName].select = resObj[preCheckName];
	            //后端么有中文名，暂时依靠前端意义一一对应
                returnObj[preCheckName].chinese = (function(englistname){
	                switch(englistname)
	                {
	                    case "SYSTEM_CONFIG_CHECKING":
	                        return "系统配置校验";
	                        break;
	                    case "SCHEDULE_STEP_CHECKING":
	                        return "排程步骤校验";
	                        break;
	                    case "MATERIAL_INFO_CHECKING":
	                        return "物料信息校验";
	                        break;
	                    case "ROUTING_INFO_CHECKING":
	                        return "工艺路线信息校验";
	                        break;
	                    case "CAPABILITY_INFO_CHECKING":
	                        return "产能校验";
	                        break;
	                    case "COLOR_INFO_CHECKING":
	                        return "颜色信息校验";
	                        break;
	                    case "SUITABLE_PRODUCT_INFO_CHECKING":
	                        return "适宜设备校验";
	                        break;
	                    case "CT_INFO_CHECKING":
	                        return "刀具信息校验";
	                        break;
	                    case "FIXTURE_INFO_CHECKING":
	                        return "夹具信息校验";
	                        break;
	                    case "PAP_INFO_CHECKING":
	                        return "PAP信息校验";
	                        break;
	                }
	            })(preCheckName)
	        }
	        return returnObj;
	    };
	
	    /**
	     * 排程后校验传入数据处理
	     * json 校验规则可配发送请求传入的数据
	     */
	    this.validation_rules_later = function(json){
	        let resObj = json.postScheduleCheckMap;//传入的数据
            let returnObj = {};//创建返回的对象
            for(let preCheckName in resObj){
                returnObj[preCheckName] = {};
                returnObj[preCheckName].name = preCheckName;
                returnObj[preCheckName].select = resObj[preCheckName];
	            //后端么有中文名，暂时依靠前端意义一一对应
                returnObj[preCheckName].chinese = (function(englistname){
	                switch(englistname)
	                {
	                    case "PROCESS_SEQ_CHECKING":
	                        return "物流疏通校验";
	                        break;
	                    case "POMO_SUIT_CHECKING":
	                        return "齐套性校验";
	                        break;
	                    case "ASSEMBLING_UNIT":
	                        return "组合件校验";
	                        break;
	                    case "CAPABILITY_OVER_CHECKING":
	                        return "超产能校验";
	                        break;
	                }
                })(preCheckName)
            }
            return returnObj;
	    }
	    
	    /**
	     * 任务池数据处理
	     */
	    this.jsonToexternalDifferViewModel = function (json_object){
	    	var headList = json_object.columnAlias,//表头列表(中文)
				tableList = json_object.column,		//表格数据顺序（key）
				poolTaskChangeList = json_object.poolTaskChangeList,
				table_object = {},//返回的数据
				allTableView = {},
				tabList = [];
			//定义原tab顺序
			var allTabList = ["CREATE_POOL_TASK","ADD_POOL_TASK_NUM","SUBTRACT_POOL_TASK_NUM","POOL_TASK_TIME_CHANGED","DELETE_POOL_TASK"];
			
			//表头数据
			table_object.headData = headList;
			
			//遍历所有的变化
			for(var n = 0;n < allTabList.length;n ++){
				for(var i = 0 ; i < poolTaskChangeList.length ; i ++){
					var poolTaskChange = poolTaskChangeList[i],
						changeType = poolTaskChange.changeType;	//变化的类型
					if(allTabList[n] == changeType){
						var	poolTaskListInResult = poolTaskChange.poolTaskListInResult,		//结果页的数据
							poolTaskListInOutside = poolTaskChange.poolTaskListInOutside;		//外部新增的数据
						if(changeType == "CREATE_POOL_TASK" || changeType == "ADD_POOL_TASK_NUM" || changeType == "SUBTRACT_POOL_TASK_NUM"||changeType == "POOL_TASK_TIME_CHANGED"){
							var each_differ_num = 0,
								tableRowList = [];
							
							//遍历派工单
							for(var j in poolTaskListInOutside){
								var pkInfo = poolTaskListInOutside[j];		//派工单信息
								var rowList = [];
								var rowObj = {};
								
								rowObj.saleOrderCode = pkInfo.saleOrderCode;//销售订单号
								rowObj.materialName = pkInfo.materialName;//物料名称
								rowObj.resultTaskNum = isEmptyObject(poolTaskListInResult) ? 0 : poolTaskListInResult[j].resultTaskNum;//已排数
								rowObj.unDoTaskNum = pkInfo.unDoTaskNum;//未派数
								rowObj.tempTaskNum = isEmptyObject(poolTaskListInResult) ? 0 : poolTaskListInResult[j].tempTaskNum;//未转实际数
								rowObj.resultUnDoTaskNum = rowObj.unDoTaskNum - rowObj.tempTaskNum;//未排数
								rowObj.doTaskNum = pkInfo.doTaskNum;//已派数
								rowObj.taskNum = pkInfo.taskNum;//车间计划总数
								
								var startTimes = pkInfo.startTime;
								startTimes = startTimes ? startTimes.substring(2,11) : "";
								var endTimes = pkInfo.endTime;
								endTimes = endTimes ? endTimes.substring(2,11) : "";
								rowObj.poolTaskTime = startTimes + "~ " + endTimes;
								
								if(changeType == "POOL_TASK_TIME_CHANGED"){
									var r_startTimes = poolTaskListInResult[j].startTime;
									r_startTimes = r_startTimes ? r_startTimes.substring(2,11) : "";
									var r_endTimes = poolTaskListInResult[j].endTime;
									r_endTimes = r_endTimes ? r_endTimes.substring(2,11) : "";
									rowObj.newPoolTaskTime = r_startTimes + "~ " + r_endTimes;							
								}
								
								for(var k = 0;k < tableList.length;k ++){
										rowList.push(rowObj[tableList[k]]);
								}
		
								if(changeType == "POOL_TASK_TIME_CHANGED"){
									rowList.push(rowObj.newPoolTaskTime);
								}
								
								tableRowList.push(rowList);	
								each_differ_num ++;
							}
							
							if(changeType == "CREATE_POOL_TASK"){
								var changeTypeCode = "add";
								//给tab标签创建对象
								var tabList_obj = {
									changeType : "add",
									changeTypeName : "新增加的任务",
									each_differ_num : each_differ_num
								}						
							}else if(changeType == "ADD_POOL_TASK_NUM"){
								var changeTypeCode = "numAdd";
								//给tab标签创建对象
								var tabList_obj = {
									changeType : "numAdd",
									changeTypeName : "进行中的任务",
									each_differ_num : each_differ_num
								}						
							}else if(changeType == "SUBTRACT_POOL_TASK_NUM"){
								var changeTypeCode = "numDes";
								//给tab标签创建对象
								var tabList_obj = {
									changeType : "numDes",
									changeTypeName : "数量减少任务",
									each_differ_num : each_differ_num
								}						
							}else if(changeType == "POOL_TASK_TIME_CHANGED"){
								var changeTypeCode = "tim";
								//给tab标签创建对象
								var tabList_obj = {
									changeType : "tim",
									changeTypeName : "时间变化任务",
									each_differ_num : each_differ_num
								}							
							}
							
							allTableView[changeTypeCode] = tableRowList;
							if(tabList_obj.changeType == "add" || tabList_obj.changeType == "numAdd"){
								tabList.unshift(tabList_obj);
							}else{
								tabList.push(tabList_obj);
							}
						}
						
						if(changeType == "DELETE_POOL_TASK"){
							var each_differ_num = 0,
								tableRowList = [];
								
							var changeTypeCode = "des";
							
							//遍历派工单
							for(var j in poolTaskListInResult){
								var pkInfo = poolTaskListInResult[j];		//派工单信息
								var rowList = [];
								var rowObj = {};
									
								rowObj.saleOrderCode = pkInfo.saleOrderCode;//销售订单号
								rowObj.materialName = pkInfo.materialName;//物料名称
								rowObj.resultTaskNum = pkInfo.resultTaskNum;//已排数
								rowObj.unDoTaskNum = isEmptyObject(poolTaskListInOutside) ? 0 : poolTaskListInOutside[j].unDoTaskNum;//未派数
								rowObj.tempTaskNum = pkInfo.tempTaskNum;//未转实际数
								rowObj.resultUnDoTaskNum = rowObj.unDoTaskNum - rowObj.tempTaskNum;//未排数
								rowObj.doTaskNum = isEmptyObject(poolTaskListInOutside) ? 0 : poolTaskListInOutside[j].doTaskNum;//已派数
								rowObj.taskNum = isEmptyObject(poolTaskListInOutside) ? 0 : poolTaskListInOutside[j].taskNum;//车间计划总数						
								
								var startTimes = pkInfo.startTime;
								startTimes = startTimes ? startTimes.substring(2,11) : "";
								var endTimes = pkInfo.endTime;
								endTimes = endTimes ? endTimes.substring(2,11) : "";
								rowObj.poolTaskTime = startTimes + "~ " + endTimes;
								
								for(var k = 0;k < tableList.length;k ++){
									rowList.push(rowObj[tableList[k]]);
								}
								
								tableRowList.push(rowList);	
								each_differ_num ++;
							}
							
							//给tab标签创建对象
							var tabList_obj = {
								changeType : "des",
								changeTypeName : "已删除的任务",
								each_differ_num : each_differ_num
							}
							allTableView[changeTypeCode] = tableRowList;
							if(tabList_obj.changeType == "add" || tabList_obj.changeType == "numAdd"){
								tabList.unshift(tabList_obj);
							}else{
								tabList.push(tabList_obj);
							}
							
						}						
					}

					
				}				
			}
			
			table_object.tabList = tabList;
			table_object.bodyData = allTableView
			table_object.tableList = tableList;
//			console.log(table_object);
			return table_object;
	    }; 

	    function isEmptyObject(obj){
		    for(var i in obj){
		        return false
		    }
		    return true
		}
        /**
         *desc:获得地点树所有地点的数组
         *time:2017-03-24
         *author:linzx
         *@param: locationData 获得地点树数据
         *@return:[Array] 可供渲染的地点树数据
         **/
        this.getAllLocationIdArray = function (locationData) {
            let allLocationIdArr = [];
            let _this = this;
            for(let name in locationData) {
                allLocationIdArr.push(name);
                if(!isEmptyObject(locationData[name]["nextLevelLocation"])) {
                    allLocationIdArr.push(_this.getAllLocationIdArray(locationData[name]["nextLevelLocation"]));
                }
            }
            return allLocationIdArr.toString().split(",");
        };

	    /**
		 * 排程前左侧地点树数据处理
		 * @param: 从后台获取的数据
		 * @returns 绑定页面的数据
		 */
		this.getData = function(locationData) {
		    let arr = [];
		    for(let name in locationData){
		        let obj = {
		            name : locationData[name].locationName,
		            "locationId" : locationData[name].locationId,
		        };
		        arr.push(obj);
		        if(!isEmptyObject(locationData[name]["nextLevelLocation"])){
		            obj.children = this.getData(locationData[name]["nextLevelLocation"]);
		        }
		    }
		    return arr;
		}
		
		/**
		 * 排程后左侧地点树数据处理
		 * @param 从后台获取的数据
		 * @returns 绑定页面的数据
		 */
		this.getData__result = function(locationData) {
		    let arr = [];
		    let newArr=[];
		    var obj={
		    	children : ""
		    };
		    for(let i in locationData){
		    	let newObj = {
		    		locationId : locationData[i].locationId,
		    		name : locationData[i].locationName
		    	};
		    	newArr.push(newObj);
		    }
		    obj.children = newArr;
		    arr.push(obj);
		    return arr;
		}
	});


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
//临时项的升序和降序
$("body")
	.on("click", ".sort-item .itemOrder", function (e) {
	var parent = $(this).parent()
	var attr = parent.attr("data-keyname");
	if ($(this).hasClass("desc")) {
		parent.attr("data-order", "up").attr("data-keyname",attr.replace(":desc",""));
	} else {
		parent.attr("data-order", "down").attr("data-keyname",attr+":desc");
	}
	$(this).toggleClass("desc");
	e.stopPropagation();
})
//排程方案下拉代码
	.on("click", ".workshop-ruleNav li", function(e) {
		$(this).parent().siblings("a").text($(this).text());
		$(this).parent().siblings("a").attr("data-rule-id", $(this).attr("data-rule-id"));
		$(this).parents(".workshop-ruleNav").removeClass("active");
		e.stopPropagation();
	})
	.on("click", ".workshop-ruleNav", function() {
		$(this).toggleClass("active");
	})
	.on("mouseleave", ".workshop-ruleNav.workshop-ruleNav", function() {
		$(this).removeClass("active");
	});
/************==============合并项==============***********/
$(".page-wrapper")
	//点击出现下拉框
	.on("click",".combine-menu",function(e){
//		console.log("3333");
		$(this).addClass("active");
		$(this).children(".combine-drag").addClass("drag");
		e.stopPropagation();
		$(this).find("li").click(function(){
			$(".combine-menu").removeClass("active");
			$(".combine-menu").children("ul").removeClass("drag");	
		})
	})
	//移出下拉框小时
	.on("mouseleave",".combine-menu",function(e){	
		$(this).removeClass("active");
		$(this).children("ul").removeClass("drag");
	});

/******************/
