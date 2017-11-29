/**
 * ViewModel相关的函数
 * Created by duww on 2016/6/30.
 */

/**
 *  现阶段服务分为两块，数据处理(scheduleTableViewModelService)
 *  注意:服务名和文件名对应
 *
 */

//注释格式
/**方法功能
 *
 * @param 入参
 * @return 返回值
 */
'use strict';
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
	     * @param searchDays: 实际要看的天数
	     * @return tableHeadViewModel
	     */
	    this.jsonToTableHeadViewModel = function (json_object, searchDays = 0){
	    	var dateList = json_object.time,
	    		equipmentList = json_object.punit,
	    		returnData = [],
	    		allEquipment = [];

	    	for(var i in equipmentList){
				allEquipment.push(i);
	    	}
	    	allEquipment = allEquipment.join(",");

	    	for(let i = 0, l = dateList.length; i < l; i++){
	    		returnData.push({
	    			thisDate: dateList[i],
	    			equipment: allEquipment,
					color: i < searchDays ? "#f8c314" : ""
	    		})
	    	}
	        return returnData;
	    };

		/**
	     * 把json格式转化为页面的ViewModel：排程页面表格显示模型
	     * @param json_object: schedule_table_json
	     *
	     * @return table_object
	     */
	    this.jsonToTableBodyViewModelNew = function (json_object){
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

				//超出99小时只显示99
				return (returnHour > 99 ? 99 : returnHour) + ":" + returnMinute;
			}

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

			//取色且避免重复
			function getDifferentColor(){
				let thisColor = tool.getSpecialColor();
				if(allColor.indexOf(thisColor) > -1){
					thisColor = getDifferentColor();
				}

				return(thisColor);

			}
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
            //获取各个查询条件的下拉列表数据
            var searchItemDropDownList = {
                materialNameList : {},//物料名
                materialCodeList : {},//物料编码
                processNameList : {},//工序名称
                processCodeList : {},//工序编码
                punitCodeList : [],//设备编码
                punitNameList : [],//设备名称
                saleOrderList : {},//订单号
                productLineList : {},// 产线
                orderCodeList : {}// 主生产计划
			};
			//存储产线信息
			var productLineList = [],
			 	productLineNameList = [],//暂时用产线名称
			//产线信息去重用
				productLineObj = [],
			//已分配的颜色
				allColorObj = sessionStorage.allColorObj ? JSON.parse(sessionStorage.allColorObj) : {},
			//所有已有的颜色
			 	allColor = sessionStorage.allColor ? sessionStorage.allColor.split(",") : ["#f5837c","#51CAFE","#F89107","#FEFE00","#0000F7","#CCA200","#35E934","#FC01FD","#006600","#FA6800","#FDAdFF","#660000","#7E00FE","#cc0066","#0961FC","#60EFC1","#553302","#A48D64","#FF4500","#66009F","#9bb999","#fdcdab","#EEE676","#6c5c7e","#3aada8","#ec4860","#c374ad"];
	        //获取查询条件
	        let S_saleOrder = $(".sale-order").find("input").val(),//订单号
	            S_materialName = $(".material-name").find("input").val(),//物料名
	            S_materialCode = $(".material-code").find("input").val(),//物料编码
	            S_processName = $(".process-name").find("input").val(),//工序名称
	            S_processCode = $(".process-code").find("input").val(),//工序编码
	            S_punitCode = $(".punit-code").find("input").val(),//设备编码
                S_punitName  = $(".punit-name").find("input").val(),//设备名称
                S_orderCode  = $(".order-code").find("input").val(),//设备生产线
				// S_productLineValue = S_productLine.toString().trim(),
	            isSearch = false;//初始为未搜索
	        if(S_saleOrder + S_materialName + S_materialCode + S_processName + S_processCode + S_orderCode){
	            isSearch = true;//有搜索值
				tableBodyViewModel.searchSuccess = "false_search";
	        }
			S_saleOrder = S_saleOrder ? S_saleOrder.split(",") : [];
			S_materialName = S_materialName ? S_materialName.split(",") : [];
			S_materialCode = S_materialCode ? S_materialCode.split(",") : [];
			S_processName = S_processName ? S_processName.split(",") : [];
			S_processCode = S_processCode ? S_processCode.split(",") : [];
			S_punitCode = S_punitCode ? S_punitCode.split(",") : [];
			S_punitName = S_punitName ? S_punitName.split(",") : [];
			S_orderCode = S_orderCode ? S_orderCode.split(",") : [];
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
	            let this_punitId = punitIdList[i],
					punit = punitList[this_punitId],
					thisLocation = punit.locationId,
					thisProductLineInfo = punit.productionLineDto,
					thisDisplayInfo,
					thisGroupBy,
					thisFrontBack;
				
				//显示方案
				if($rootScope.display_Info[thisLocation]){
					thisDisplayInfo = $rootScope.display_Info[thisLocation];
					thisGroupBy = thisDisplayInfo["aps-view-schedule_unit_type"][0];
					thisFrontBack = thisDisplayInfo["aps-view_is_turn_over"][0].valueContent !== "1";
				}else{
					thisDisplayInfo = $rootScope.display_Info.default;	
					thisGroupBy = thisDisplayInfo["aps-view-schedule_unit_type"][0];
					thisFrontBack = thisDisplayInfo["aps-view_is_turn_over"][0].valueContent !== "1";
				}
				
				//产线信息去重，保存，生成产线下拉框
//				if(thisProductLineInfo){
//					if(!productLineObj[thisProductLineInfo.productionLineId]){
//						productLineList.push(thisProductLineInfo);
//						productLineNameList.push(thisProductLineInfo.productionLineName)
//						productLineObj[thisProductLineInfo.productionLineId] = true;
//					}
//
//					//如果有做产线筛选,但是不在筛选范围内，跳过这台设备
//					if(S_productLine && S_productLine.indexOf(thisProductLineInfo.productionLineName) < 0){
//						continue;
//					}
//				}else{
//					if(S_productLine){
//						continue;
//					}
//				}

				//生成设备下拉框(设备编码暂时拿不到，等改动一级界面接口）
				punit.punitName ? searchItemDropDownList.punitNameList.push(punit.punitName) : "";
				punit.punitCode ? searchItemDropDownList.punitCodeList.push(punit.punitCode) : "";

				//如果有做设备筛选,但是不在筛选范围内，跳过这台设备
				if(S_punitName.length && S_punitName.indexOf(punit.punitName) < 0 ||
					S_punitCode.length && S_punitCode.indexOf(punit.punitCode) < 0){
					continue;
				}

				//获取设备相关的单元格信息
		        var punitTaskObject = punit.punitTask;

	            if(punitTaskObject === undefined){
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
						bigBoxColor: "linear-gradient(180deg,rgba(255,255,255,0.2) 0%,rgba(255,255,255,0.2) 100%)",
						smallBoxColor: "linear-gradient(90deg,rgba(255,255,255,0.2) 0%,rgba(255,255,255,0.2) 100%)",
		            };

		            //填充：单元格
		            for(var j = 0 ; j < timeList.length ; j++){
		            	//这个格子是否超产
		            	var isOver;
		                //获取当前日期（日历）
		                var time_str = timeList[j];

		                //获取当前日期的单元计划
		                var punitTaskDate = punitTaskObject[time_str];
                        //是否高亮显示
		                var isHighLight = false;
		                //根据当前日期填充单元格
		                if(punitTaskDate !== undefined){//如果当前时间的对象不为空

		                	var groupObj = {};//合并后的对象
							var groupArr = [];//合并后的数组
							var realWorkTime = 0;//当天实际工作时间
							var sumNum = 0;//合计数
							var changeColor = false;//更换显示颜色用
							var showMaterialName;

		                    //总工作时间
		                    var totalWorkTime = punitTaskDate.totalWorkTime;
		                    var dispatchOrderList = punitTaskDate.dispatchOrderList;

							//遍历所有工单
		                    for(let i = 0 , l = dispatchOrderList.length ; i < l ; i++){
		                        var this_dispatchOrder = dispatchOrderList[i],
		                        	taskNum = this_dispatchOrder.taskNum,
		                        	saleOrderCode = this_dispatchOrder.saleOrderCode,//订单号
		                        	orderCode = this_dispatchOrder.orderCode,//主生产计划号
		                        	materialName = this_dispatchOrder.materialName,//物料名
		                        	materialCode = this_dispatchOrder.materialCode,//物料编码
                                    processName = this_dispatchOrder.processName,//工序名称
                                    processCode = this_dispatchOrder.processCode,//工序编码
                                    punitCode = this_dispatchOrder.punitCode,//设备编码
                                    punitName = this_dispatchOrder.punitName,//设备名称
		                        	groupBy = this_dispatchOrder[thisGroupBy.valueContent],//按合并维度进行合并
		                        	thisTime = this_dispatchOrder.actualUseTime/3600;

		                        //存储搜索框内各个下拉列表的渲染数据，用对象不用数组存储为了去重，避免[物料A，物料B，物料C，物料A，物料B]
								searchItemDropDownList.materialNameList[materialName] = true;
								searchItemDropDownList.materialCodeList[materialCode] = true;
								searchItemDropDownList.processNameList[processName] = true;
								searchItemDropDownList.processCodeList[processCode] = true;
								//已在外层取得 searchItemDropDownList.punitCodeList[punitCode] = true;
								//已在外层取得 searchItemDropDownList.punitNameList[punitName] = true;
								searchItemDropDownList.saleOrderList[saleOrderCode] = true;
								searchItemDropDownList.orderCodeList[orderCode] = true;

								//总时间和总数
		                    	realWorkTime += thisTime;
		                    	sumNum += taskNum;

		                       //查询下，是否高亮
		                    	if(isSearch){
		                    		//如果所有搜索条件都符合的话
		                    		if(
		                    			!((S_saleOrder.length && S_saleOrder.indexOf(saleOrderCode) < 0) ||
											(S_orderCode.length && S_orderCode.indexOf(orderCode) < 0) ||
											(S_materialName.length && S_materialName.indexOf(materialName) < 0) ||
											(S_materialCode.length && S_materialCode.indexOf(materialCode) < 0) ||
                                            (S_processName.length && S_processName.indexOf(processName) < 0) ||
                                            (S_processCode.length && S_processCode.indexOf(processCode) < 0) ||
                                            (S_punitCode.length && S_punitCode.indexOf(punitCode) < 0)
										)
		                    		){
		                    			isHighLight = true;
										table_object[rowLength][0].useData.isEmpty = false;
		                    			tableBodyViewModel.searchSuccess = "success_search";
										showMaterialName = materialName;
		                    		}else{
										continue;
		                    		}
		                    	}else{
									table_object[rowLength][0].useData.isEmpty = false;
								}
								
		                    	//去重汇总
		                    	if(groupObj[groupBy]){
		                    		groupObj[groupBy].time += thisTime;
		                    		groupObj[groupBy].num += taskNum;
		                    	}else{
		                    		groupObj[groupBy] = {
		                    			time : thisTime,
		                    			num : taskNum
		                    		};
		                    		groupArr.push(groupBy);
		                    	}
		                    }

		                    //本单元格中色块地数量
		                    var groupNum = groupArr.length;
		                    var thisOpacity = isSearch && !isHighLight ? 0.2 : 1;
		                    var workTime;
		                    if(totalWorkTime > 0){
		              			workTime = totalWorkTime-realWorkTime;
		              		}else{
		              			workTime = (-1) * realWorkTime;
		              			totalWorkTime = realWorkTime;
		              		}
							var restTime = workTime;
		                    //超产能、剩余产能
		                    let sWorkTime;
							//已排时间
							let sRealWorkTime;
							var thisH = Math.floor(workTime);
							var thisM = ((workTime-thisH) * 60).toFixed();
							sRealWorkTime = getTime(thisH,thisM);
							thisH = thisH > 99 ? 99 : thisH;
		                    if(workTime >= 0){
		                        sWorkTime = "剩余";
		                        workTime = thisH + ":" + thisM;
		                        isOver = false;
		                    }else{
		                        workTime = workTime * (-1);
		                        if(thisH == 0 && thisM <= 10){
		                            sWorkTime = "剩余";
		                            workTime = "00:00";
		                            isOver = false;
		                        }else{
		                            sWorkTime = "超出";
		                            workTime = thisH + ":" + thisM;
		                            isOver = true;
		                        }
		                    }

		                    //补全小数位数

		                    workTime = completeDecimal(workTime);
							sRealWorkTime = completeDecimal(sRealWorkTime);



		                    sWorkTime += workTime;
							//计算百分比
							let workTimePercent = (realWorkTime / totalWorkTime * 100).toFixed(1),
								restTimePercent = Math.abs(100 - workTimePercent).toFixed(1);
							//front里存正面色块，back里存背面显示信息，useData里存页面渲染样式用的数据
							table_object[rowLength][1 + j] = {};
		                    table_object[rowLength][1 + j].front = [];
		                    table_object[rowLength][1 + j].back = [
								sWorkTime + " " + (restTimePercent > 99 ? "99+" : restTimePercent) + "%",
								"已排" + sRealWorkTime + " " + (workTimePercent > 99 ? "99+" : workTimePercent) + "%",
		                    	"任务数合计" + sumNum,
		                    	groupNum + "个" + thisGroupBy.valueAlias
		                    ];
		                    table_object[rowLength][1 + j].useData = {
	                        	cursor : "pointer",
	                        	opacity : thisOpacity,
	                        	dateId : time_str + "" + this_punitId,
	                        	frontClass : thisFrontBack ? "table-td-front" : "table-td-back",
	                        	isLock : tool.stringToDate(freezeDate) >= tool.stringToDate(time_str) ? true : false,
	                        	isOver : isOver,
								bigBoxColor: "linear-gradient(180deg",
								smallBoxColor: "linear-gradient(90deg"
	                        };

		                    //填充：派工单
		                    let m = 0;
							let backgroundColorText = "",
								backgroundPercent = 0,
								theMaterialColor;
		                    for(let i = 0 ; i < groupNum ; i++){
		                    	changeColor = !changeColor;
		                    	var thisCapabilityPercent = 0;
		                    	//超产能比例计算
		                        if(realWorkTime > totalWorkTime){
		                        	thisCapabilityPercent = groupObj[groupArr[i]].time / realWorkTime;
		                        }else{
		                        	thisCapabilityPercent = groupObj[groupArr[i]].time / totalWorkTime;
		                        }


								//如果是按颜色合并（比如涂装），显示表面颜色。
								//按其他条件合并，代码随机给色保证不重复
		                        if(thisGroupBy.valueContent === "colorRgb"){
		                        	theMaterialColor = groupArr[i];
			                        //没有颜色的处理
			                        if(!theMaterialColor){
										let colorOne = "#333",
											colorTwo = "#fff",//间隔色
											step = thisCapabilityPercent/5;
					
										theMaterialColor = "";
										for(let i = 0 ; i < 5 ; i++){
											let colorIndex = i;
											theMaterialColor += "," + (colorIndex%2? colorTwo : colorOne) + " " + parseFloat(backgroundPercent) * 100 + "%";
											backgroundPercent += step;
										}
//			                            theMaterialColor = "linear-gradient(90deg, #333 0%, #fff 20%,#333 40%, #fff 60%,#333 80%,#fff 100%)";
			                        }else{
			                            theMaterialColor = "#" + theMaterialColor;
			                        }
		                        }else{
									let thisColorCache = allColorObj[thisGroupBy.valueContent];
									//有这个合并规则的记录则继续，没有先创建
									if(thisColorCache){
										//有这个内容的记录则取值，否则else
										if(thisColorCache.cacheObj[groupArr[i]] > -1){
											theMaterialColor = allColor[thisColorCache.cacheObj[groupArr[i]]]
										}else{
											//所有颜色中还有未分配的颜色，赋值，否则调用随机函数取色
											if(thisColorCache.index + 1 < allColor.length) {
												theMaterialColor = allColor[thisColorCache.index + 1];
											}else{
												theMaterialColor = getDifferentColor();
												allColor.push(theMaterialColor);
											}

											thisColorCache.index += 1;
											thisColorCache.cacheObj[groupArr[i]] = thisColorCache.index;
										}

									}else{
										allColorObj[thisGroupBy.valueContent] = {
											index: 0,
											cacheObj: {}
										}
										allColorObj[thisGroupBy.valueContent].cacheObj[groupArr[i]] = 0;

										//所有颜色中还有未分配的颜色，赋值，否则调用随机函数取色
										if(allColor.length > 0) {
											theMaterialColor = allColor[0];
										}else{
											theMaterialColor = getDifferentColor();
											allColor.push(theMaterialColor);
										}

									}
//		                        	theMaterialColor = changeColor ? "#a8d6c9" : "#2b64a7";
		                        }

								//改进(dww):这里的+=用的不好，改成数组push
								if(theMaterialColor.length > 7){
									backgroundColorText += theMaterialColor;
								}else{
									backgroundColorText += "," + theMaterialColor + " " + parseFloat(backgroundPercent) * 100 + "%";
									backgroundPercent += thisCapabilityPercent;
									backgroundColorText += "," + theMaterialColor + " " + parseFloat(backgroundPercent) * 100 + "%";
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
									restTime : restTime > 0 ? restTime*3600 : 0
		                        };
		                        m++;//插入单元格的MV对象下标
		                    }

							//如果这个格子只有一种颜色
							if(groupNum == 1 && thisGroupBy.valueContent === "materialName") {
								table_object[rowLength][1 + j].useData.materialName = showMaterialName || materialName;
								table_object[rowLength][1 + j].useData.materialNameTextColor = tool.getTextColor(theMaterialColor);
							}

							table_object[rowLength][1 + j].useData.bigBoxColor += backgroundColorText + ",rgba(255,255,255,0.2)" + " " + parseFloat(backgroundPercent) * 100 + "%" + ",rgba(255,255,255,0.2)" + " " + "100%)";
							table_object[rowLength][1 + j].useData.smallBoxColor += backgroundColorText + ",rgba(255,255,255,0.2)" + " " + parseFloat(backgroundPercent) * 100 + "%" + ",rgba(255,255,255,0.2)" + " " + "100%)";

		                }else{
		                	unitNull ++ ;
		                	//找出对应格子的工作时间
		                	var punitID_date = this_punitId + "_" + time_str;
		                	var dayWorktime = workTimeMap[punitID_date];
		                	dayWorktime = dayWorktime ? dayWorktime : 0;
							let showDayWorktime = tool.hourToHourMinute(dayWorktime);

		                	table_object[rowLength][1 + j] = {};
		                    table_object[rowLength][1 + j].front = [];
		                    table_object[rowLength][1 + j]["front"][0] = {
		                        type : 3,
		                        x_coord : rowLength,
		                        y_coord : 1 + j,
		                        date : time_str,
		                        equipment_id : this_punitId,
								restTime : dayWorktime*3600
		                    };
		                    table_object[rowLength][1 + j].back = [
		                     	"工作时间 : " + showDayWorktime
		                    ];
		                    table_object[rowLength][1 + j].useData = {
		                     	percent : "100%",
		                        opacity : isSearch ? 0.2 : 1,
		                     	dateId : time_str + "" + this_punitId,
		                     	frontClass : thisFrontBack ? "table-td-front" : "table-td-back",
		                        totalWorkTimeIsZero : dayWorktime == 0 ? "td-front-non" : "",
		                        isLock : tool.stringToDate(freezeDate) >= tool.stringToDate(time_str) ? true : false,
								bigBoxColor: dayWorktime == 0 ? "" : "linear-gradient(180deg,rgba(255,255,255,0.2) 0%,rgba(255,255,255,0.2) 100%)",
								smallBoxColor: dayWorktime == 0 ? "" : "linear-gradient(90deg,rgba(255,255,255,0.2) 0%,rgba(255,255,255,0.2) 100%)"
		                    }
		                }
		            }
	            }

	            //判断是否全是空格子
				if(((rowLength + 1) * j ==  unitNull) && isSearch){
					tableBodyViewModel.searchSuccess = "allUnitNull";
				}
	        }

			//保留颜色
			sessionStorage.allColorObj = JSON.stringify(allColorObj);
			//所有已有的颜色
			sessionStorage.allColor = allColor.join();

	        tableBodyViewModel.tableBodyData = table_object;
			tableBodyViewModel.searchItemDropDownList = searchItemDropDownList;
			tableBodyViewModel.productLineNameList = productLineNameList;
	        return tableBodyViewModel;
	    };

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
	    this.jsonToWindowTableView = function (windowTableData,combineItem,columnSelectList,countInfo){
	    	let headList = windowTableData.columnAlias,	//表头列表
				tableList = windowTableData.column,	//表格数据顺序
				query = windowTableData.query,	//筛选项
				tableData = windowTableData.row,	//表格数据
				table_object = {},	//返回的数据
				combineCondition = [],	//合并条件
				countCondition = {},	//汇总条件
				returnCount = [],	//汇总行
				lastCondition = "",
				lastIndex = 0,
				bodyData = [];
			
			//表头改造
			if(combineItem && combineItem.length){
				for(let i = 0, l = combineItem.length; i < l; i++){
					const thisCombine = combineItem[i].value,
						  headIndex = tableList.indexOf(thisCombine);
					
					//表头插入这一列
					if(combineItem[i].show && headIndex > -1){
						headList.splice(headIndex + 1, 0, "合计数");
						tableList.splice(headIndex + 1, 0, "j_count");
					}
				}
			}
			
			//合并条件
			for(let i = 0, l = columnSelectList.length; i < l; i++){
				combineCondition.push(columnSelectList[i].replace(":desc",""))
			}
			
			//汇总信息
			if(countInfo && countInfo.length){
				for(let i = 0, l = countInfo.length; i < l; i++){
					const thisCount = countInfo[i];
					
					if(thisCount.show){
						countCondition[thisCount.value] = 0;
					}
				}
			}
			
			//构造条件
			function getCondition(data){
				const condition = [];
				
				for(let i = 0, l = combineCondition.length; i < l; i++){
					condition.push(data[combineCondition[i]]);
				}
				
				return condition.join(",");
			}
			
			//遍历行数据
			for(let i = 0, l = tableData.length; i < l; i++){
				const thisRow = tableData[i],	//本行的原始数据
					  rowIndex = i,	//行数
					  thisCondition = getCondition(thisRow),	//本行的合并条件
					  returnRow = [];	//本行的渲染数据
				
				//遍历单元格数据
				for(let i = 0, l = tableList.length; i < l; i++){
					const thisCell = tableList[i],
						  thisObj = {};

					//如果是合计数列
					if(thisCell === "j_count"){
						const lastNum = thisRow[tableList[i - 1]];
						
						//如果和上一个合并条件相同
						if(thisCondition === lastCondition){
							//数量叠加，不加单元格
							bodyData[lastIndex][i].label += lastNum;
							bodyData[lastIndex][i].rowspan ++;
						}else{
							//新开一个合并单元格
							returnRow.push({
								label: lastNum,
								rowspan: 1
							});
							//更新最后的信息
							lastCondition = thisCondition;
							lastIndex = rowIndex;
						}
						continue;
					}
					
					const cellData = thisRow[thisCell];
					
					
					//如果有汇总
					if(countCondition[thisCell] !== undefined){
						countCondition[thisCell] += cellData;
					}
					
					//填充其他信息
					if(thisCell === "poolTaskStartTime" || thisCell === "poolTaskEndTime"){
						thisObj.label = cellData ? cellData.substring(5,16) : "";
					}else if(thisCell === "startTime" || thisCell === "endTime"){
						thisObj.label = cellData ? cellData.substring(5,16) : "";
					}else{
						thisObj.label = cellData === undefined ? "" : cellData;
					}
					
					returnRow.push(thisObj);
				}
				
				bodyData.push(returnRow);
			}
			
			//汇总行
			returnCount = new Array();
//			returnCount[0] = "汇总数";
			for(let item in countCondition){
				const index = tableList.indexOf(item);
				
				returnCount[index] = countCondition[item];
			}
			
			//如果非空，那么填充剩余的长度
			if(returnCount.length){
				returnCount.length = tableList.length;
			}
			
			table_object.headData = headList;
			table_object.bodyData = bodyData;
			table_object.countData = returnCount;
			return table_object;
	    }
		
		/**
	     * 把json格式转化为二级页面的的ViewModel：排程页面表格显示模型
	     * @param json_object: windowTableData
	     *
	     * @return table_object
	     */
	    this.jsonToWindowTableViewNew = function (windowTableData){
			const headList = windowTableData.columnAlias,	//表头列表
				  tableList = windowTableData.column,		//表格数据顺序
				  tableData = windowTableData.row,			//表格数据
				  table_object = {},						//返回的数据
				  bodyData = [];							//返回的表格内容
			
			//行
			for(let i = 0, l = tableData.length; i < l; i++){
				const thisRow = tableData[i],
					  rowData = [];
				
				//单元格
				for(let i = 0, l = tableList.length; i < l; i++){
					const cellType = tableList[i],
						  cellText = thisRow[cellType];
					
					//显示的文字
					if(cellType === "poolTaskStartTime" || cellType === "poolTaskEndTime"){
						rowData.push(cellText ? cellText.substring(5,16) : "");
					}else if(cellType === "startTime" || cellType === "endTime"){
						rowData.push(cellText ? cellText.substring(5,16) : "");
					}else{
						rowData.push(cellText === undefined ? "" : cellText);
					}
				}
				
				bodyData.push(rowData);
			}
			
			table_object.headData = headList;
			table_object.bodyData = bodyData;
			return table_object;
		};
		
		/**
	     * 把json格式转化为换装页面的的ViewModel
	     * @param windowTableData: windowTableData
	     *
	     * @return table_object
	     */
		this.jsonToSecondChange = function(secondChangeData){
			let returnData = {},//返回的数据
				headShowList = secondChangeData.columnAlias,
				headList = secondChangeData.column,
				headListLength = headList.length,
				rowList = secondChangeData.row;
			
			returnData.rowInfo = [];
			
			//补齐表头
			headShowList.push("换装类型","换装前","换装后");
			
			//循环构造换装表格
			for(let i = 0, l = rowList.length ; i < l ; i++){
				let thisReturnRowData = [],
					thisRowData = rowList[i],
					changeInfo = thisRowData.content,
					thisRowNum = 0;//横跨几行
				//推入确定的项
				for(let i = 0 ; i < headListLength ; i++){
					thisReturnRowData.push(thisRowData[headList[i]]);
				}
				//拼接剩余的项，同时计算合并单元格
				for(var j in changeInfo){
					thisRowNum ++;
					let thisChangeType = j,
						changeLastList = changeInfo[j].last,
						changeLast = [],
						changeCurrentList = changeInfo[j].current,
						changeCurrent = [];
					
					if(thisChangeType === "颜色"){
						//换装前
						changeLast.push(changeLastList);
						//换装后
						changeCurrent.push(changeCurrentList);
					}else{
						//换装前
						for(let i = 0, l = changeLastList ? changeLastList.length : 0 ; i < l ; i++){
							changeLast.push(changeLastList[i].name + "*" + changeLastList[i].num);
						}
						//换装后
						for(let i = 0, l = changeCurrentList ? changeCurrentList.length : 0 ; i < l ; i++){
							changeCurrent.push(changeCurrentList[i].name + "*" + changeCurrentList[i].num);
						}
					}
					
					thisReturnRowData.push(thisChangeType,changeLast.join(","),changeCurrent.join(","));
					returnData.rowInfo.push({
						repeatData:thisReturnRowData,
						useData: thisRowNum == 1 ? Object.keys(changeInfo).length : 1,
					});
					thisReturnRowData = [];
				}
			}
			
			returnData.headInfo = headShowList
			return returnData;
		}
		
		/**
	     * 把json格式转化任务清单页面的的ViewModel
	     * @param taskListData: taskListData
	     *
	     * @return table_object
	     */
		this.jsonToChangeTaskList = function(taskListData){
			let returnData = {},//返回的数据
				headShowList = taskListData.columnAlias,
				headList = taskListData.column,
				rowList = taskListData.row,
				rowInfo = [],
				cnName = {
					0: '派工单',
					1: '换装',
					2: '保养换装'
				};
			
			//遍历行信息
			for(let i = 0, l = rowList.length; i < l; i++){
				let thisRow = rowList[i],
					thisRowInfo = [];
				
				//先构造遍历数据
				for(let i = 0, l = headList.length; i < l; i++){
					//类型的特殊处理
					if(headList[i] === "workTaskType"){
						thisRowInfo.push(cnName[thisRow.workTaskType]);
						continue;
					}
					thisRowInfo.push(thisRow[headList[i]]);
				}
				
				//信息数据
//				thisRowInfo.infoData = {
//					isChange: thisRow.workTaskType != 0,
//					id: thisRow.workTaskId
//				}
				rowInfo.push(thisRowInfo);
			}
			
			//返回的数据
			returnData.headInfo = headShowList;
			returnData.rowInfo = rowInfo;
			return returnData;
		}
		
		/**
	     * 把json格式转化为A换B页面的的ViewModel
	     * @param changeAToBData: changeAToBData
	     *
	     * @return table_object
	     */
		this.jsonToChangeAToB = function(changeAToBData){
			let returnData = {},//返回的数据
				headShowList = changeAToBData.columnAlias,
				headList = changeAToBData.column,
				headListLength = headList.length,
				rowList = changeAToBData.resultList || [changeAToBData],
				rowInfo = [],
				cnName = ["派工单","换装","保养换装"];
			
			//遍历行信息
			for(let i = 0, l = rowList.length; i < l ; i++){
				let thisRow = rowList[i],
					childrenRow = thisRow.contentList,
					rowspanNum = childrenRow.length,
					isFirstChild = true;
				
				//如果有子行
				if(childrenRow.length){
					//遍历子行信息
					for(let i = 0, l = childrenRow.length; i < l ; i++){
						let thisChildRow = childrenRow[i],
							thisRowData = [];

						//遍历列信息
						for(let i = 0, l = headList.length; i < l ; i++){
							let thisItem = headList[i];

							//首行多查一份总数据
							if(isFirstChild){
								//是公共数据，可能进行合并行单元格
								if(thisRow[thisItem] !== undefined){
									let pushText = thisItem === "retoolType" ? cnName[thisRow[thisItem]] : thisRow[thisItem];
									thisRowData.push({
										showText: pushText,
										rowspan: rowspanNum
									})
								}else{
									thisRowData.push({
										showText: thisChildRow[thisItem] !== undefined ? thisChildRow[thisItem] : "",
										rowspan: 1
									})
								}
							}else{
								if(i < 5){
									continue;
								}
								thisRowData.push({
									showText: thisChildRow[thisItem] !== undefined ? thisChildRow[thisItem] : "",
									rowspan: 1
								})
							}
						}
						//下一个子行不是首个字行
						isFirstChild = false;
						//推入本行数据
						rowInfo.push(thisRowData);
					}
				}else{
					let thisRowData = [];
					//遍历列信息
					for(let i = 0, l = headList.length; i < l ; i++){
						let thisItem = headList[i],
							thisText = thisRow[thisItem] !== undefined ? thisRow[thisItem] : "",
							pushText = thisItem === "retoolType" ? cnName[thisText] : thisText;
						thisRowData.push({
							showText: pushText,
							rowspan: 1
						});
					}
					//推入本行数据
					rowInfo.push(thisRowData);
				}
			}
			returnData.headInfo = headShowList;
			returnData.rowInfo = rowInfo;
			console.log(returnData);
			return returnData;
		}

		/**
	     * 把json格式转化为二级差异化页面的的ViewModel
	     * @param windowTableData: windowTableData
	     *
	     * @return table_object
	     */
		this.jsonToDifferTable = function (windowTableData){
            let headList = windowTableData.columnAlias;//表头列表
            let tableList = windowTableData.column;		//表格数据顺序
			// var query = windowTableData.query;	//筛选项
            let tableData = windowTableData.row; //表格数据
            let table_object = {};//返回的数据
			table_object.headData = headList;//表头数据
            let bodyData = [];
            let arrIndex = 0;
			//行
			for(let i in tableData){
				//本行数据
				bodyData[arrIndex] = [];
				const thisRowData = tableData[i];

				//按顺序填充单元格
				for(let j in tableList){
					let thisObj = {
                        pkId : thisRowData.pkId,
						versionId : thisRowData.versionId,
						processOrder : thisRowData.processOrder,
						startTime : thisRowData.startTime,
						taskNum : thisRowData.taskNum,
						pUnitName : thisRowData.pUnitName,
						rowNum:  thisRowData.rowNum,
						isHighLight : thisRowData.isHighLight,
						saleOrderCode : thisRowData.saleOrderCode,
						materialName : thisRowData.materialName,
						poolTaskEndTim: thisRowData.poolTaskEndTime,
					};
                    //显示的文字
                    if(tableList[j] === "poolTaskStartTime" || tableList[j] === "poolTaskEndTime"){
                        thisObj.showText = thisRowData[tableList[j]].substring(0,13);
                    }else if(tableList[j] === "startTime" || tableList[j] === "endTime"){
                        thisObj.showText = thisRowData[tableList[j]].substring(0,13);
                    }else{
                        thisObj.showText = thisRowData[tableList[j]];
                    }

					bodyData[arrIndex].push(thisObj);
				}
				arrIndex++;
			}
			table_object.bodyData = bodyData;
			return table_object;
	    };

		/**
	     * 二级差异 把json原始格式转化为通用的的的ViewModel
	     * @param json 工单维度判断是否有差异
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
	    };


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
                returnObj[preCheckName].chinese = (function(englishName){
	                switch(englishName)
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
	                    case "PRODUCTION_TIME_CHECKING":
	                        return "生产时间校验";
	                        break;
	                }
                })(preCheckName)
            }
            return returnObj;
	    };

		/**
	     * 任务池数据处理
	     */
		this.jsonToexternalDifferViewModel = function (json_object){
			const headData = json_object.columnAlias,	//表头列表(中文)
				  headDataOrder = json_object.column,	//表格数据顺序（key）
				  poolTaskChangeList = json_object.poolTaskChangeList,
				  table_object = {},	//返回的数据
				  allTableView = [],	//表格体数据
				  tabList = [],			//左侧页签数据		
				  tabCnName = {
					  CREATE_POOL_TASK: "新增加的任务",
					  ADD_POOL_TASK_NUM: "进行中的任务",
					  SUBTRACT_POOL_TASK_NUM: "数量减少任务",
					  POOL_TASK_TIME_CHANGED: "时间变化任务",
					  DELETE_POOL_TASK: "已删除的任务"
				  },
				  defaultTabOrder = [
					  "CREATE_POOL_TASK",
					  "ADD_POOL_TASK_NUM",
					  "SUBTRACT_POOL_TASK_NUM",
					  "POOL_TASK_TIME_CHANGED",
					  "DELETE_POOL_TASK"
				  ]; //tab顺序
			
			let allNum = 0;	//总条数
			//顺序
			poolTaskChangeList.sort((a,b)=>{
				return defaultTabOrder.indexOf(a.changeType) - defaultTabOrder.indexOf(b.changeType);
			});
			
			//循环
			for(let i = 0, l = poolTaskChangeList.length; i < l; i++){
				const changeTypeData = poolTaskChangeList[i],
					  changeType = changeTypeData.changeType,
					  outsideData = changeTypeData.poolTaskListInOutside,
					  resultData = changeTypeData.poolTaskListInResult,
					  thisHeadData = headData.slice(),
					  thisHeadDataOrder = headDataOrder.slice(),
					  thisTabData = [];

				let ergodicData = outsideData;
				
				//如果是删除的任务
				if(changeType === "DELETE_POOL_TASK"){
					ergodicData = resultData;
				}
				
				//如果是时间改变
				if(changeType === "POOL_TASK_TIME_CHANGED"){
					const insertIndex = thisHeadDataOrder.indexOf("poolTaskTime");
					
					thisHeadData.splice(insertIndex + 1, 0, "新车间计划时间");
					thisHeadDataOrder.splice(insertIndex + 1, 0, "newPoolTaskTime");
				}
				
				//构造行数据
				for(let poolTaskId in ergodicData){
					const thisOutside = outsideData[poolTaskId],
						  thisResult = resultData[poolTaskId],
						  thisData = ergodicData[poolTaskId],
						  rowData = [],
						  //获取数据方法
						  getDataFunction = {
							  //销售订单号
							  saleOrderCode: function(){
								  return thisOutside.saleOrderCode;
							  },
							  //物料名称
							  materialName: function(){
								  return thisOutside.materialName;
							  },
							  //已排数
							  resultTaskNum: function(){
								  return thisResult.resultTaskNum;
							  },
							  //未派数
							  unDoTaskNum: function(){
								  return thisOutside.unDoTaskNum;
							  },
							  //未转实际数
							  tempTaskNum: function(){
								  return thisResult.tempTaskNum;
							  },
							  //未排数
							  resultUnDoTaskNum: function(){
								 return thisOutside.unDoTaskNum - thisResult.tempTaskNum; 
							  },
							  //已派数
							  doTaskNum: function(){
								  return thisOutside.doTaskNum;
							  },
							  //车间计划总数
							  taskNum: function(){
								  return thisOutside.taskNum;
							  },
							  //计划时间
							  poolTaskTime: function(){
								  return thisData.startTime.substring(2,11) + "~ " + thisData.endTime.substring(2,11);
							  },
							  //新计划时间
							  newPoolTaskTime: function(){
								  return thisOutside.startTime.substring(2,11) + "~ " + thisOutside.endTime.substring(2,11);
							  }
						  };
					
					for(let i = 0, l = thisHeadDataOrder.length; i < l; i++){
						rowData.push(getDataFunction[thisHeadDataOrder[i]]());
					};
					
					thisTabData.push(rowData);
				}
				
				allTableView.push({
					bodyData: thisTabData,
					headData: thisHeadData
				});
				
				//更新总条数
				allNum += thisTabData.length;
				
				//构成左侧目录
				tabList.push({
					showText: tabCnName[changeType],
					num: thisTabData.length
				});
			}
			
			//构造返回的数据
			table_object.allTableData = allTableView;	//表体
			table_object.tabData = tabList	//页签数据
			table_object.allNum = allNum	//总条数
			
			//返回的数据
			return table_object;
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
                allLocationIdArr.push(locationData[name].locationId);
                if(!tool.isEmptyObject(locationData[name]["nextLevelLocation"])) {
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
        this.getData = function (locationData) {
            let arr = [];
            for (let name in locationData) {
                let obj = {
                    name: locationData[name].locationName,
                    "locationId": locationData[name].locationId,
					'chooseAble' : locationData[name].chooseAble,
                };
                if (!tool.isEmptyObject(locationData[name]["nextLevelLocation"])) {
                    obj.children = this.getData(locationData[name]["nextLevelLocation"]);
                }
                arr.push(obj);
            }
            return arr;
        };


		/**
		 * desc: 用于新版的排程前检验，检验出现异常，用二级页面数据给出提示,
		 * time:2017-04-20
		 * @param: scheduleValidateMap：传入所有的校验结果
		 * @return: checkItemList:返回遍历渲染的数组
		 **/
		this.displayCheckBeforeSchedule = function (detailInfoObject) {
			let checkItemTableData = {};
			checkItemTableData.checkItemTableHeadData = {};//头部文字渲染对象，因为只有一行，所以直接用对象
			checkItemTableData.checkItemTableBodyData = [];//主体内容渲染数组
			let HeadDataOrderArray = detailInfoObject.column;
			HeadDataOrderArray.forEach((key,index)=>{
				checkItemTableData.checkItemTableHeadData[key] = detailInfoObject.columnAlias[index];	//这么写是因为传进来的column和columnAlias都是数组
			});
			detailInfoObject.row.forEach((item) => {
				HeadDataOrderArray.forEach((key) => {
					let obj = {};
					obj[key] = item[key];
					checkItemTableData.checkItemTableBodyData.push(obj);
				});
			});
			return checkItemTableData;
		};

		/**
		* desc: 检验出现异常是，渲染二级页面数据,用于新版的排程后检验，
		 * 判断是否为老类型，如果是，则直接展示checkInfo，如果不是则根据不同的错误类型，去执行各自的方法
		* time:2017-04-20
		* @param: scheduleValidateMap：传入所有的校验结果
		* @return: checkItemList:返回遍历渲染的数组
		**/
		this.displayCheckErrorTable = function (scheduleValidateMap) {
			let checkItemArrayList = [];
			for(let checkItem in scheduleValidateMap){
				let obj = {};
				let checkErrorData = scheduleValidateMap[checkItem];
                obj.checkErrorType = checkErrorData.type;
                obj.checkItemChineseName = checkItem;
                //=========此段代码为了兼容老版检验而存在，如果不是这几个排程后校验，则直接使用给出的提示start==========//
                if((checkErrorData.type !== 5) || (checkErrorData.type !== 4) || (checkErrorData.type !== 3)){
                	obj.checkInfo = checkErrorData.checkInfo;
				}
                //=========此段代码为了兼容老版检验而存在end==========//
                //如果有数据，执行判断，输出报表
                if(checkErrorData.checkInfo && checkErrorData.checkInfo.length){
                    obj.checkResult = false;
                    // 根据type类别判断处于哪个检验，5=生产时间校验,4，超产校验，3组合件校验
					// 全部写完再封成函数式吧，封不动了(liao,第一声）
					obj.checkItemTableHeadData = [];//头部文字渲染数组
					obj.checkItemTableBodyData = [];//主体内容渲染数组
                    if(checkErrorData.type === 5){
                        //	前台设置列信息的展现顺序
                        let HeadDataOrderArray = ["saleOrderCode","materialName","equipmentName","taskNum","startTime","endTime","poolTaskStartTime","poolTaskEndTime","materialMnem"];
                        HeadDataOrderArray.forEach((englishKey)=>{
                            obj.checkItemTableHeadData.push(getChineseNameByEnglishKey(englishKey));
                        });
                        checkErrorData.validateModes.forEach(function (tableCellItem) {
                            let checkItemTableRow = [];
                            HeadDataOrderArray.forEach((englishKey)=>{
                            	if(englishKey === "startTime"){
                                    let startTime = tableCellItem[englishKey];
                                    let endTime = tableCellItem["endTime"];
                                    let timeObj = {"showText" : tableCellItem[englishKey].substr(5,11),};
                                    //开始时间不对,1.小于计划开始时间，2.大于计划结束时间，3.大于结束时间
                                    if(startTime < tableCellItem["poolTaskStartTime"] || startTime > tableCellItem["poolTaskEndTime"] || startTime > endTime){
                                        timeObj["class"] = 'red';
									}
                                    checkItemTableRow.push(timeObj);
								}else if(englishKey === "endTime"){
                                    let endTime = tableCellItem[englishKey];
                                    let timeObj = {"showText" : tableCellItem[englishKey].substr(5,11),};
                                    //结束时间不对,1.大于计划结束时间，2.大于计划开始时间
                                    if(endTime > tableCellItem["poolTaskEndTime"] || endTime < tableCellItem["poolTaskStartTime"]){
                                        timeObj["class"] = 'red';
                                    }
                                    checkItemTableRow.push(timeObj);
								}else{
									//转换时间
									if(englishKey === "startTime" ||englishKey === "endTime" ||englishKey === "poolTaskStartTime" ||englishKey === "poolTaskEndTime"){
                                        checkItemTableRow.push({"showText" : tableCellItem[englishKey].substr(5,11)});
									}else{
                                        checkItemTableRow.push({"showText" : tableCellItem[englishKey]});
									}
								}
                            });
                            obj.checkItemTableBodyData.push(checkItemTableRow);
                        })
                    }else if(checkErrorData.type === 4){
                        let HeadDataOrderArray = ["workDate","punitName","punitCode","taskNum","actualPUnitWorkTime","workTime","remarks"];
                        HeadDataOrderArray.forEach((englishKey)=>{
                            obj.checkItemTableHeadData.push(getChineseNameByEnglishKey(englishKey));
                        });
                        checkErrorData.validateModes.forEach(function (tableCellItem) {
                            let checkItemTableRow = [];
                            HeadDataOrderArray.forEach((englishKey)=>{
                            	//1.转换时间格式2.判断报错
								if(englishKey === "workDate"){
									checkItemTableRow.push({"showText" : tableCellItem[englishKey].substr(5,11)});//转换时间格式
								}else if(englishKey === "actualPUnitWorkTime"){
									if(tableCellItem["actualPUnitWorkTime"] > (tableCellItem["workTime"] * 3600)){
										//将毫秒数转化为时间【21时26分】这种格式
                                        checkItemTableRow.push({
                                        	"showText" : Math.floor(tableCellItem[englishKey] / 3600) + "时" + Math.floor((tableCellItem[englishKey]%3600) / 60) + "分",
											"class" : 'red'
                                        });
                                        let remarkTime = tableCellItem["actualPUnitWorkTime"] - tableCellItem["workTime"] * 3600;
                                        tableCellItem["remarks"] = "超产" + Math.floor(remarkTime / 3600) + "时" + Math.floor((remarkTime % 3600) / 60) + "分" + Math.ceil((remarkTime % 60)) + "秒";//显示【超产6时6分6秒】
									}else{
                                        checkItemTableRow.push({
                                            "showText" : Math.floor(tableCellItem[englishKey] / 3600) + "时" + Math.floor((tableCellItem[englishKey]%3600) / 60) + "分",
                                        });
									}
								}else if(englishKey === "workTime"){
									//如果传过来的时间为空，则设施为默认为0
									if(tableCellItem[englishKey]){
										let jWorkTime = tableCellItem[englishKey];
                                        checkItemTableRow.push({"showText" : parseInt(jWorkTime) + "时" + parseInt((jWorkTime - parseInt(jWorkTime))*60) + "分"});
									}else{
                                        checkItemTableRow.push({"showText" : ""});
									}
								} else{
                                    checkItemTableRow.push({"showText" : tableCellItem[englishKey]});
								}
                            });
                            obj.checkItemTableBodyData.push(checkItemTableRow);
                        })
					}else if(checkErrorData.type === 3){
                        let HeadDataOrderArray = ["saleOrderCode","assemblingUnitInfoList","taskCodeList"];
                        HeadDataOrderArray.forEach((englishKey)=>{
                            obj.checkItemTableHeadData.push(getChineseNameByEnglishKey(englishKey));
                        });
						obj.checkItemTableHeadData.unshift("序号");
                        checkErrorData.validateModes.forEach(function (tableCellItem,index) {
							let length = tableCellItem.taskCodeList.length;
                            let firstShow = true;//表格多行合并使用
							for(let i = 0;i < length;i ++){
                                let checkItemTableRow = [];//每行显示的信息
                                HeadDataOrderArray.forEach(function (englishKey) {
                                	if(englishKey === "saleOrderCode"){
                                		if(firstShow){
                                            firstShow = false;
                                            checkItemTableRow.push({"showText" : index + 1,"rowspan" : length});//组合件专门自带的序号
                                            checkItemTableRow.push({
                                                "showText" : tableCellItem[englishKey],
                                                "rowspan" : length
                                            })
										}
									}else{
                                        checkItemTableRow.push({
                                            "showText" : tableCellItem[englishKey][i],
                                        })
									}
                                });
                                obj.checkItemTableBodyData.push(checkItemTableRow);
							}
                        })
					}
                }else{
                    obj.checkResult = true;
				}
				//如果没有配置检验项type = -1
				// 或者没有数据需要校验type = 0,无需校验，
				if(checkErrorData.type === 0 || checkErrorData.type === -1){
					obj.checkResult = true;
				}
                checkItemArrayList.push(obj);
			}
			return checkItemArrayList;
        };

        /**
        * desc:	一些二级页面表格显示项的中午名，因为后台只传了英文名
        * time:
        * @param: englishKey：传入的英文key值
        * @return: 对应的中文名
        **/
        let getChineseNameByEnglishKey = function (englishKey) {
			const chineseNameObj = {
				"serialNumber" : "序号",
                "saleOrderCode" : "销售订单号",
				"materialName" : "物料名称",
                "equipmentName" : "设备",
                "taskNum" : "数量",
                "startTime" : "开始时间",
                "endTime" : "结束时间",
				"poolTaskStartTime" : "车间计划开始",
				"poolTaskEndTime" : "车间计划结束",
                "materialMnem" : "助记码",
				"workDate" : "日期",
				"punitName" : "设备名称",
				"punitCode" : "设备编码",
				"actualPUnitWorkTime" : "实际生产时间",
				"workTime" : "设备有效时间",
				"remarks" : "备注",
				"taskCodeList" : "车间计划号",
				"assemblingUnitInfoList" : "组合件",
				"materialId" : "物料ID",
				"processId" : "工序ID",
				"pUnitType" : "设备类型",
				"pUnitId" : "设备ID",
			};
			return chineseNameObj[englishKey];
        }
	});

