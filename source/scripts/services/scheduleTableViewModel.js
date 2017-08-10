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
	    };

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
            //获取各个查询条件的下拉列表数据
            var searchItemDropDownList = {
                materialNameList : {},//物料名
                materialCodeList : {},//物料编码
                processNameList : {},//工序名称
                processCodeList : {},//工序编码
                punitCodeList : [],//设备编码
                punitNameList : [],//设备名称
                saleOrderList : {},//订单号
                productLineList : {}// 产线
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
                S_productLine  = $(".product-line").find("input").val(),//设备生产线
				// S_productLineValue = S_productLine.toString().trim(),
	            isSearch = false;//初始为未搜索
	        if(S_saleOrder + S_materialName + S_materialCode + S_processName + S_processCode){
	            isSearch = true;//有搜索值
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
				}
				
				//产线信息去重，保存，生成产线下拉框
				if(thisProductLineInfo){
					if(!productLineObj[thisProductLineInfo.productionLineId]){
						productLineList.push(thisProductLineInfo);
						productLineNameList.push(thisProductLineInfo.productionLineName)
						productLineObj[thisProductLineInfo.productionLineId] = true;
					}

					//如果有做产线筛选,但是不在筛选范围内，跳过这台设备
					if(S_productLine && S_productLine.indexOf(thisProductLineInfo.productionLineName) < 0){
						continue;
					}
				}else{
					if(S_productLine){
						continue;
					}
				}

				//生成设备下拉框(设备编码暂时拿不到，等改动一级界面接口）
				punit.punitName ? searchItemDropDownList.punitNameList.push(punit.punitName) : "";
				punit.punitCode ? searchItemDropDownList.punitCodeList.push(punit.punitCode) : "";

				//如果有做设备筛选,但是不在筛选范围内，跳过这台设备
				if(S_punitName && S_punitName.indexOf(punit.punitName) < 0 ||
					S_punitCode && S_punitCode.indexOf(punit.punitCode) < 0){
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

								//总时间和总数
		                    	realWorkTime += thisTime;
		                    	sumNum += taskNum;

		                       //查询下，是否高亮
		                    	if(isSearch){
		                    		if(
		                    			!((S_saleOrder && S_saleOrder.indexOf(saleOrderCode) < 0) ||
		                           		(S_materialName && S_materialName.indexOf(materialName) < 0) ||
                                            (S_materialCode && S_materialCode.indexOf(materialCode) < 0) ||
                                            (S_processName && S_processName.indexOf(processName) < 0) ||
                                            (S_processCode && S_processCode.indexOf(processCode) < 0) ||
                                            (S_punitCode && S_punitCode.indexOf(punitCode) < 0)
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
		                    if(workTime >= 0){
		                        sWorkTime = "剩余";
		                        var thisH = Math.floor(workTime);
								var thisM = ((workTime-thisH) * 60).toFixed()
								sRealWorkTime = getTime(thisH,thisM);
								thisH = thisH > 99 ? 99 : thisH;
		                        workTime = thisH + ":" + thisM;
		                        isOver = false;
		                    }else{
		                        workTime = workTime * (-1);
		                        var thisH = Math.floor(workTime);
		                        var thisM = ((workTime-thisH) * 60).toFixed();
								sRealWorkTime = getTime(thisH,thisM);
								thisH = thisH > 99 ? 99 : thisH;
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

								//取色且避免重复
								function getDifferentColor(){
									let thisColor = tool.getSpecialColor();
									if(allColor.indexOf(thisColor) > -1){
										thisColor = getDifferentColor();
									}
									
									return(thisColor);
									
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
	    this.jsonToWindowTableView = function (windowTableData){
	    	var headList = windowTableData.columnAlias;//表头列表
			var tableList = windowTableData.column;		//表格数据顺序
			var query = windowTableData.query;	//筛选项
			var tableData = windowTableData.row; //表格数据
			var table_object = {};//返回的数据
			// headList.unshift("操作");
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
					thisRowInfo = {
						repeatData: [],
						infoData: {}
					};
				
				//先构造遍历数据
				for(let i = 0, l = headList.length; i < l; i++){
					//类型的特殊处理
					if(headList[i] === "workTaskType"){
						thisRowInfo.repeatData.push(cnName[thisRow.workTaskType]);
						continue;
					}
					thisRowInfo.repeatData.push(thisRow[headList[i]]);
				}
				
				//信息数据
				thisRowInfo.infoData = {
					isChange: thisRow.workTaskType != 0,
					id: thisRow.workTaskId
				}
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
	     * 列信息配置列表
	     * @param json:可以判断是否选中的列信息配置列表
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
	    };

	    /**
	     * 排序弹窗数据格式转换
	     * @param json:排序列表需要接收的对象数据
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
	    };

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
					if(allTabList[n] === changeType){
						var	poolTaskListInResult = poolTaskChange.poolTaskListInResult,		//结果页的数据
							poolTaskListInOutside = poolTaskChange.poolTaskListInOutside;		//外部新增的数据
						//新增任务、数量增加任务、数量减少任务、时间改变任务
						if(changeType === "CREATE_POOL_TASK" || changeType === "ADD_POOL_TASK_NUM" || changeType === "SUBTRACT_POOL_TASK_NUM"||changeType === "POOL_TASK_TIME_CHANGED"){
							var each_differ_num = 0,
								tableRowList = [];//行

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

						if(changeType === "DELETE_POOL_TASK"){
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
                allLocationIdArr.push(locationData[name].locationId);
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
        this.getData = function (locationData) {
            let arr = [];
            for (let name in locationData) {
                let obj = {
                    name: locationData[name].locationName,
                    "locationId": locationData[name].locationId,
					'chooseAble' : locationData[name].chooseAble,
                };
                if (!isEmptyObject(locationData[name]["nextLevelLocation"])) {
                    obj.children = this.getData(locationData[name]["nextLevelLocation"]);
                }
                arr.push(obj);
            }
            return arr;
        };

		/**
		 * 排程后左侧地点树数据处理
		 * @param locationData:从后台获取的数据
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
		};

		/**
		* desc: 检验出现异常是，渲染二级页面数据
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
                //=========此段代码为了兼容老版检验而存在==========//
                if((checkErrorData.type !== 5) || (checkErrorData.type !== 4) || (checkErrorData.type !== 3)){
                	obj.checkInfo = checkErrorData.checkInfo;
                	// return;
				}
                //=========此段代码为了兼容老版检验而存在==========//
                //如果有数据，执行判断，输出报表
                if(checkErrorData.checkInfo.length){
                    obj.checkResult = false;
                    // 根据type类别判断处于哪个检验，5=生产时间校验,4，超产校验，3组合件校验
					// 全部写完再封成函数式吧，封不动了（读liao）
                    if(checkErrorData.type === 5){
                        //	前台设置列信息的展现顺序
                        let HeadDataOrderArray = ["saleOrderCode","materialName","equipmentName","taskNum","startTime","endTime","poolTaskStartTime","poolTaskEndTime","materialMnem"];
                        obj.checkItemTableHeadData = [];//头部文字渲染数组
                        obj.checkItemTableBodyData = [];//主体内容渲染数组
                        HeadDataOrderArray.forEach((englishKey)=>{
                            obj.checkItemTableHeadData.push({"showText" : getChineseNameByEnglishKey(englishKey)});
                        });
                        checkErrorData.validateModes.forEach(function (tableCellItem) {
                            let checkItemTableRow = [];
                            HeadDataOrderArray.forEach((englishKey)=>{
                            	if(englishKey === "startTime"){
                                    let startTime = tableCellItem[englishKey];
                                    let endTime = tableCellItem["endTime"];
                                    let timeObj = {"showText" : tableCellItem[englishKey].substr(5,11),};
                                    //开始时间不对,小于计划开始时间，大于计划结束时间，大于结束时间
                                    if(startTime < tableCellItem["poolTaskStartTime"] || startTime > tableCellItem["poolTaskEndTime"] || startTime > endTime){
                                        timeObj["errorClass"] = true;
									}
                                    checkItemTableRow.push(timeObj);
								}else if(englishKey === "endTime"){
                                    let endTime = tableCellItem[englishKey];
                                    let timeObj = {"showText" : tableCellItem[englishKey].substr(5,11),};
                                    //结束时间不对
                                    if(endTime > tableCellItem["poolTaskEndTime"] || endTime < tableCellItem["poolTaskStartTime"]){
                                        timeObj["errorClass"] = true;
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
                        obj.checkItemTableHeadData = [];//头部文字渲染数组
                        obj.checkItemTableBodyData = [];//主体内容渲染数组
                        HeadDataOrderArray.forEach((englishKey)=>{
                            obj.checkItemTableHeadData.push({"showText" : getChineseNameByEnglishKey(englishKey)});
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
											"errorClass" : true
                                        });
                                        let remarkTime = tableCellItem["actualPUnitWorkTime"] - tableCellItem["workTime"] * 3600;
                                        tableCellItem["remarks"] = "超产" + Math.floor(remarkTime / 3600) + "时" + Math.floor((remarkTime % 3600) / 60) + "分" + Math.ceil((remarkTime % 60)) + "秒";//显示【超产6时6分6秒】
									}else{
                                        checkItemTableRow.push({
                                            "showText" : Math.floor(tableCellItem[englishKey] / 3600) + "时" + Math.floor((tableCellItem[englishKey]%3600) / 60) + "分",
                                        });
									}
								}else if(englishKey === "workTime"){
									//如果传过来的时间为空，则设施为0
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
                        obj.checkItemTableHeadData = [];//头部文字渲染数组
                        obj.checkItemTableBodyData = [];//主体内容渲染数组
                        HeadDataOrderArray.forEach((englishKey)=>{
                            obj.checkItemTableHeadData.push({"showText" : getChineseNameByEnglishKey(englishKey)});
                        });
                        checkErrorData.validateModes.forEach(function (tableCellItem,index) {
							let length = tableCellItem.taskCodeList.length;
                            let firstShow = true;//表格多行合并使用
							for(let i = 0;i < length;i ++){
                                let checkItemTableRow = [];//每行显示的信息
                                HeadDataOrderArray.forEach(function (englishKey) {
                                	if(englishKey === "saleOrderCode"){
                                		if(firstShow){
                                            firstShow = false;
                                            checkItemTableRow.push({"showText" : index + 1,"rowNum" : length});//组合件专门自带的序号
                                            checkItemTableRow.push({
                                                "showText" : tableCellItem[englishKey],
                                                "rowNum" : length
                                            })
										}
									}else{
                                        checkItemTableRow.push({
                                            "showText" : tableCellItem[englishKey][i],
                                        })
									}
                                });
                                obj.checkItemTableBodyData.push(checkItemTableRow);
                                console.log(obj.checkItemTableBodyData);
							}
                        })
					}
                }else{
                    obj.checkResult = true;
				}
                checkItemArrayList.push(obj);
			}
			return checkItemArrayList;
        };

        /**
        * desc:
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
				"assemblingUnitInfoList" : "组合件"
			};
			return chineseNameObj[englishKey];
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
		//鼠标移出可以移动的li时，移除一个出现虚线的lcas
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
				let scrollTop = $(t).parents("nav").scrollTop();
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
					oCopyLi.style.top = _mTop - scrollTop + "px";
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
						_this.removeClass(oNewLi, "js-liBorderStyle");
						_this.addClass(oNewLi, "js-move");
                        //修改bug，清楚暴力乱移时出现在页面上的元素
                        $("body").children(".js-liBorderStyle").remove();
                        $(".js-liBorderStyle").removeClass("js-liBorderStyle");
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
		var liH = liList[0].offsetHeight;//
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
			// y = mainDivTop + mainDiv.offsetHeight
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

/*************=========================排程后页面拉框选中元素方法---微调多选一=========================*************/
function Pointer(x, y) {
    this.x = x ;
    this.y = y ;
}
function Position(left, top) {
    this.left = left ;
    this.top = top ;
}
function Direction(horizontal, vertical) {
    this.horizontal = horizontal ;
    this.vertical = vertical ;
}
let oldPointer = new Pointer() ;
let oldPosition = new Position() ;
let direction = new Direction("Right","") ;
let isDown = true;
let isMouseUp = true;//判断mouseup事件中框距离小于一定值时，不执行事件

let div = $("<div></div>").css({
    background : "#1e7cd9",
    position  : "absolute",
    opacity : "0.2"
}).appendTo($("body")) ;

$(document)
    .on("mousedown",function (e) {
    	if($(".jResultPage").length !== 0){
            isMouseUp = true;
            isDown = true ;
            oldPointer.x = e.clientX ;
            oldPointer.y = e.clientY ;
            oldPosition.left = e.clientX;
            oldPosition.top = e.clientY;
            div.css({
                left : e.clientX,
                top : e.clientY
            }) ;
            div.extend({
                checkC : function() {
                    let $this = this ;
                    // if($scope.resultPage){
                    $(".jResultContent .table-td").each(function() {
                        if(
                            $this.offset().left + $this.width() > $(this).offset().left &&
                            $this.offset().left < $(this).offset().left + $(this).width()
                            && $this.offset().top + $this.height() > $(this).offset().top
                            && $this.offset().top < $(this).offset().top + $(this).height()
                        ) {
                            //为每一个符合条件的选中临时的class cache-check
                            if($(this).hasClass("cache-check")){
                                $(this).removeClass("cache-check");
                            }else{
                                $(this).addClass("cache-check");
                            }
                        }
                    });
                    // }
                }
            });
		}
    })
    .on("mousemove",function (e) {
        if($(".jResultPage").length !== 0){
            if(!isDown) return isDown ;
            // console.log(isDown + "---move");
            if(e.clientX > oldPointer.x) {
                direction.horizontal = "Right" ;
            } else if(e.clientX < oldPointer.x) {
                direction.horizontal = "Left" ;
            } else {
                direction.horizontal = "1" ;
            }
            if(e.clientY > oldPointer.y) {
                direction.vertical = "Down" ;
            } else if(e.clientY < oldPointer.y) {
                direction.vertical = "Up" ;
            } else {
                direction.vertical = "1" ;
            }
            if(direction.horizontal === direction.vertical){direction.vertical = direction.horizontal = "11";}
            let directionOperation = {
                none : function () {
                },
                LeftUp : function() {
                    div.css({
                        width : Math.abs(e.clientX - oldPointer.x),
                        height : Math.abs(e.clientY - oldPointer.y),
                        top : oldPosition.top - Math.abs(e.clientY - oldPointer.y) ,
                        left : oldPosition.left - Math.abs(e.clientX - oldPointer.x)
                    }) ;
                },
                LeftDown : function() {
                    div.css({
                        width : Math.abs(e.clientX - oldPointer.x),
                        height : Math.abs(e.clientY - oldPointer.y),
                        left : oldPosition.left - Math.abs(e.clientX - oldPointer.x)
                    }) ;
                },
                Left1 : function() {
                    div.css({
                        width : Math.abs(e.clientX - oldPointer.x),
                        height : 1,
                        left : oldPosition.left - Math.abs(e.clientX - oldPointer.x)
                    }) ;
                },
                RightDown : function() {
                    div.css({
                        width : Math.abs(e.clientX - oldPointer.x),
                        height : Math.abs(e.clientY - oldPointer.y)
                    }) ;
                },
                RightUp : function() {
                    div.css({
                        width : Math.abs(e.clientX - oldPointer.x),
                        height : Math.abs(e.clientY - oldPointer.y),
                        top : oldPosition.top - Math.abs(e.clientY - oldPointer.y)
                    }) ;
                },
                Right1 : function() {
                    div.css({
                        width : Math.abs(e.clientX - oldPointer.x),
                        height : 1
                    }) ;
                },
                "1Down" : function() {
                    div.css({
                        width : 1,
                        height : Math.abs(e.clientY - oldPointer.y)
                    }) ;
                },
                "1Up" : function() {
                    div.css({
                        width : 1,
                        height : Math.abs(e.clientY - oldPointer.y),
                        top : oldPosition.top - Math.abs(e.clientY - oldPointer.y)
                    }) ;
                },
                "1111" : function () {
                    //针对先左键后右键的的报错
                }
            };
            directionOperation[direction.horizontal + direction.vertical]() ;
		}
    })
    .on("mouseup",function (e) {
        if($(".jResultPage").length !== 0){
            if(!isDown) return isDown;
            isDown = false;
            // if(div[0].releaseCapture) {
            //     div[0].releaseCapture(true) ;
            // }
            // //如果移动距离小于10像素，则不执行方法
            // //没有想通为什么别的页面点击会失效
            if((Math.abs(e.clientX - oldPointer.x) < 10 || Math.abs(e.clientY- oldPointer.y) < 10)){
                isMouseUp = false;
            }
            div.checkC();
            div.width(0).height(0);
            $(".cache-check").each(function () {
                if(isMouseUp){
                    // debugger;
                    $(this).trigger("click");
                }
            })
            //将效果优先呈现出来，再移除class
                .removeClass("cache-check");
            // }
		}
    });

//临时项的升序和降序
$("body")
	.on("click", ".sort-item .itemOrder", function (e) {
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

/************==============合并项==============***********/
$(".page-wrapper")
	//点击出现下拉框
	.on("click",".combine-menu",function(e){
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
