/**
 * ViewModel相关的函数
 * Created by xujun on 2016/6/30.
 */

/**
 *  把json转为viewModel的服务
 *  注意:服务名和文件名对应
 */
app.service('scheduleTableViewModelService', function($rootScope) {
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
     * @param {Boolean} isSearch   是否是查询
     * @return table_object
     */   
    this.jsonToTableBodyViewModelNew = function (json_object){
        var tableBodyViewModel = {};//viewModel对象，返回的结果集
        var table_object = [];//viewModel对象里具体单元格的信息，用于显示表格
        var table_tr_info = [];//存放每行的单元格信息相关信息，用于行展开功能的使用
        var table_tr_freeze_info =  [];//存放每行设备的锁定期信息，用于展现锁定期和排程起点
        var table_tr_over_capability = [];//存放每行超产能的信息
        //try{
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
        //获取查询条件
        let S_saleOrder = $(".sale-order").find("input").val().trim(),
            S_materialName = $(".material-name").find("input").val().trim(),
            S_materialCode = $(".material-code").find("input").val().trim(),
            isSearch = false;
        if(S_saleOrder+S_materialName+S_materialCode){
            isSearch = true;
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
        for(let i=0;i<punitIdList.length;i++){
            //获取单行设备信息
            let this_punitId = punitIdList[i];

            let punit = punitList[this_punitId];
            let realPunitId = this_punitId/*.substring(0,this_punitId.indexOf("_"))*/;//截取前面的punitId
            if(punit == undefined){
                continue;
            }
            rowLength += 1;
            table_tr_over_capability[rowLength] = [];//=
            table_object[rowLength] = [];
            table_tr_freeze_info[rowLength] = 0;
            //填充：设备
            table_object[rowLength][0] = [
                new Unit({
                    type:1,
                    text:punit.punitName,
                    percent:1,
                    cursor:"pointer",
                    x_coord:rowLength,
                    y_coord:0,
                    freeze_date:freezeDate,
                    equipment_id:realPunitId,
                    s_date:timeList[0],//开始时间
                    e_date:timeList[timeList.length-1],//结束时间
                    frontClass:"table-td-front"
                })];
            table_tr_info[rowLength] = {max_row:0, min_percent:1, is_detail_show:false};//max_row:最大行数，min_percent最小单元格比例,is_detail_show展示详细信息
            //获取设备相关的单元格信息
            var punitTaskObject = punit.punitTask;
            //填充：单元格

            for(var j = 0;j < timeList.length;j ++){
                //获取当前日期（日历）
                var time_str = timeList[j];
                //获取当前日期的单元计划
                var punitTaskDate = punitTaskObject[time_str];

                //锁定期：判断是否在锁定期内
                if(xujun_tool.stringToDate(freezeDate) >= xujun_tool.stringToDate(time_str) ){
                    table_tr_freeze_info[rowLength] = j+1;//待后端改好了，换成这行
                }
                var isHighLight = false;
                //根据当前日期填充单元格
                if(punitTaskDate != undefined){//如果当前时间的对象不为空
                	var groupObj = {};//合并后的对象
					var groupArr = [];//合并后的数组
					var realWorkTime = 0;//当天实际工作时间
					var sumNum = 0;
					var changeColor = false;
					
                    //总工作时间
                    var totalWorkTime = punitTaskDate.totalWorkTime;
                    var dispatchOrderList = punitTaskDate.dispatchOrderList;
					
					//遍历所有工单
                    for(let i = 0 , l = dispatchOrderList.length ; i < l ;i ++){
                        var this_dispatchOrder = dispatchOrderList[i],
                        	taskNum = this_dispatchOrder.taskNum,
                        	saleOrderCode = this_dispatchOrder.saleOrderCode,
                        	materialName = this_dispatchOrder.materialName,
                        	materialCode = this_dispatchOrder.materialCode,
                        	groupBy = this_dispatchOrder[$rootScope.showType.groupBy],//按合并维度进行合并
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
                    	
                       //是否高亮
                    	if(isSearch && !isHighLight){
                    		if(
                    			!((S_saleOrder && saleOrderCode.indexOf(S_saleOrder) < 0) ||
                           		(S_materialName && materialName.indexOf(S_materialName) < 0) ||
                           		(S_materialCode && materialCode.indexOf(S_materialCode) < 0))
                    		){
                    			isHighLight = true;
                    		}
                    	}
                    }
                    
                    //本单元格中色块地数量
                    var groupNum = groupArr.length;
                    
                    if(totalWorkTime > 0){
              			var workTime = totalWorkTime-realWorkTime;
              		}else{
              			var workTime = (-1)*realWorkTime;
              			totalWorkTime = realWorkTime;
              		}

                    //超产能、剩余产能
                    let sWorkTime; 
                    if(workTime>=0){
                        sWorkTime = "剩余";
                        var thisH = Math.floor(workTime);
                        workTime = thisH + ":" + ((workTime-thisH)*60).toFixed();
                        table_tr_over_capability[rowLength].push(false);
                    }else{
                        workTime = workTime*(-1);
                        var thisH = Math.floor(workTime);
                        var thisM = ((workTime-thisH)*60).toFixed();
                        if(thisH == 0 && thisM <= 10){
                            sWorkTime = "剩余";
                            workTime = "00:00";
                            table_tr_over_capability[rowLength].push(false);
                        }else{
                            sWorkTime = "超出";
                            workTime = thisH + ":" + thisM;
                            table_tr_over_capability[rowLength].push(true);
                        }
                    }
                    //补全小数位数
                    if(workTime.indexOf(":")<0){
                        workTime += ":00";
                    }else{
                        var aWorkTime = workTime.split(":");
                        if(aWorkTime[1].length < 2){
                            workTime += "0";
                            workTime = aWorkTime[0] + ":0" + aWorkTime[1];
                        }
                    }
                    sWorkTime += workTime;

                    table_object[rowLength][1+j] = [];

                    //填充：派工单
                    let m = 0;
                    for(let i = 0 ; i < groupNum ; i++){
                    	changeColor = !changeColor;
                    	var thisCapabilityPercent = 0
                    	//超产能比例计算
                        if(realWorkTime > totalWorkTime){
                        	thisCapabilityPercent = groupObj[groupArr[i]].time/realWorkTime;
                        }else{
                        	thisCapabilityPercent = groupObj[groupArr[i]].time/totalWorkTime;
                        }

                        var thisOpacity = 1;
                        thisOpacity = isSearch && !isHighLight ? 0.2 : 1;
                        var theMaterialColor;
                        if($rootScope.showType.groupBy == "colorRgb"){
                        	theMaterialColor = groupArr[i];
	                        //没有颜色的处理
	                        if(! theMaterialColor){
	                            theMaterialColor = "linear-gradient(90deg, #333 0%, #fff 20%,#333 40%, #fff 60%,#333 80%,#fff 100%)";
	                        }else{
	                            theMaterialColor = "#" + groupArr[i];
	                        }
                        }else{
                        	theMaterialColor = changeColor?"#a8d6c9":"#2b64a7";
                        }
	                        
                        /**
                         *####关键代码####
                         *把派工单数据转化为视图模型（ViewModel）
                         */
                        var u_text = "";
                        var u_color = theMaterialColor;
                        var u_percent = thisCapabilityPercent;
                        var u_number = sumNum;
                        var u_text_top = saleOrderCode;
                        var u_freeze_date = freezeDate;
                        var u_equipment_id = realPunitId;
                        var u_date = time_str;
                        var u_opacity = thisOpacity;
                        var u_change_odel_umber = groupNum + $rootScope.showType.cnName;
                        var u_cell_tasknum = "任务数合计" + sumNum;
                        var u_work_time = sWorkTime;
                        var u_front = isFront?"table-td-front":"table-td-back";
                        var u_time_percent = (realWorkTime/totalWorkTime*100).toFixed(1)+"%";
//                      if( u_percent == undefined || u_percent == 0){continue;}//过滤产能百分比为0的情况

                        table_object[rowLength][1 + j][m] = new Unit({
                            type: 2,
                            text: u_text,
                            color: u_color,
                            percent: u_percent,
                            text_number: u_number,
                            text_top: u_text_top,
                            cursor: "pointer",
                            x_coord: rowLength,
                            y_coord: 1 + j,
                            freeze_date: u_freeze_date,
                            equipment_id: u_equipment_id,
                            date: u_date,
                            opacity: u_opacity,
                            cell_tasknum : u_cell_tasknum,
                            changeModelNumber: u_change_odel_umber,
                            workTime: u_work_time,
                            dateId : u_date+""+u_equipment_id,
                            frontClass : u_front,
                            timePercent :　u_time_percent
                        });
                        m++;//插入单元格的MV对象下标  
                    }
                }else{
                    table_object[rowLength][1+j]=[];
                    table_object[rowLength][1+j][0] = new Unit({
                        type:3,
                        x_coord:rowLength,
                        y_coord:1+j,
                        opacity:isSearch?0.2:1,
                        date: time_str,
                        equipment_id:this_punitId,
                        percent:1,
                        frontClass:isFront?"table-td-front":"table-td-back"
                    });
                    table_tr_over_capability[rowLength].push(false);
                }
            }
        }

        //}catch(err){//增加try/catch代码块，可以屏蔽错误信息，使页面JS不会中断报错，提高用户体验
        //    //这条是给用户显示看的
        //    alert("日历数据解析失败，请联系技术人员处理");
        //    //下面是给技术员看的，输出在控制台。要看具体哪段代码报错了，可以注释try/catch，然后chrome可以定位到出错的行
        //    var txt="";
        //    txt="The function[jsonToViewModel_scheduleTable] was error.\n\n";
        //    txt+="Error description: " + err.message + "\n\n";
        //    txt+="Click OK to continue.\n\n";
        //    console.error(txt);
        //}
        tableBodyViewModel.tableBodyData = table_object;
        tableBodyViewModel.tableTrInfo = table_tr_info;
        tableBodyViewModel.tableTrFreezeInfo = table_tr_freeze_info;
        tableBodyViewModel.tableTrOverCapability = table_tr_over_capability;
        return tableBodyViewModel;
    }
   
   //====================================================================================================================================================

    /**
     * 差异化页面，把json格式转化为一级页面所需要的viewModel
     * @param json_object：[jsonObj(form),jsonObj(now)]
     *
     * @return [tableHeadViewModel(form),tableHeadViewModel(now)]
     */
    this.jsonDifferTableBodyViewModel = function(json){

        //1，先将接受数据转化为可用数据=>【object(from),object(now)】
        for(var i = 0;i < json.length;i ++){
            json[i] = this.jsonToTableBodyViewModelNew(json[i]) //将获得到的数据转化为正常显示的
        }
        
        //2再将数据转化为差异化可用格式
        var newDifferArr = [];

        for(var i = 0,length = json[0].tableBodyData.length;i < length;i++){
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
	//差异化页面
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
			arrIndex ++ ;
		}
		table_object.bodyData = bodyData;
		return table_object;
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
        for(var i =0 ;i<selectList.length;i++){
            if(selectList[i].valueContent.indexOf("desc") != "-1"){
                selectList[i].order = "down";
            }else{
                selectList[i].order = "up";
            }
        }
        return selectList
    }
    /**
     * 把某行内的所有单元格显示全部信息
     * @param tableTrData包含unit对象的集合
     */
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
    this.showAllInfoInTr = function (tableTrData){
        for(x in tableTrData){
            for(u in tableTrData[x]){
                if(!$.isEmptyObject(tableTrData[x][u])){//如果对象不为空
                    tableTrData[x][u].show_all();
                }
            }
        }
    }

    /**
     * 把某行内的所有单元格按百分比显示信息（缩略显示）
     * @param tableTrData包含unit对象的集合
     */
    this.showInfoByPercentInTr = function (tableTrData){
        for(x in tableTrData){
            for(u in tableTrData[x]){
                if(!$.isEmptyObject(tableTrData[x][u])){//如果对象不为空
                    tableTrData[x][u].show_by_percent();
                }
            }
        }
    }

    /**
     * 排程前校验传入数据处理
     * json 校验规则可配发送请求传入的数据
     */
    this.validation_rules_from = function(json){
        var resObj = json.preScheduleCheckMap;
        var arr = [];
        for(var name in resObj){
            var itemObj = {};
            itemObj.name = name;
            itemObj.select = resObj[name];
            //后端么有中文名，暂时依靠前端意义一一对应
            itemObj.chinese = (function(englistname){
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
            })(name)
            arr.push(itemObj)
        }
        return arr;
    };

    /**
     * 排程后校验传入数据处理
     * json 校验规则可配发送请求传入的数据
     */
    this.validation_rules_later = function(json){
        var resObj = json.postScheduleCheckMap;
        var arr = [];
        for(var name in resObj){
            var itemObj = {};
            itemObj.name = name;
            itemObj.select = resObj[name];
            //后端么有中文名，暂时依靠前端意义一一对应
            itemObj.chinese = (function(englistname){
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
            })(name)
            arr.push(itemObj)
        }
        return arr;
    }
    /**
     * 最小单元格的数据对象类型
     * @param args 参数对象，具体包含内容见下：
     * type（单元格类型）:1,设备名单元格 2，派工单单元格
     * text（主要文本）
     * percent（单元格百分比）
     * color（单元格颜色）
     * text_number（显示数字的文本）
     * text_top（显示在最顶端的文本）
     * do_code（派工单ID）
     * cursor(鼠标移到单元格上的时候的样式)
     * x_coord(x轴坐标)
     * y_coord(y轴坐标)
     */
    function Unit(args){
        if(args == undefined || args.percent == undefined){//排除了percent未定义或为0的情况
            return;
        }else{
            //储存参数列表
            this.args = args;
        }

        //是否全部显示的标记
        this.show_all_flag = false;

        //不根据percent而是直接显示全部的方法
        this.show_all = function(){
            this.text = this.args.text;
            this.text_top = this.args.text_top;
            this.text_number = this.args.text_number;
        }

        //根据percent显示单元格内容
//      this.show_by_percent = function(){
//          if( this.args.percent > 0.65){//只显示部分
//              this.text = this.args.text;
//              this.text_top = this.args.text_top;
//              this.text_number = this.args.text_number;
//          }else if( this.args.percent > 0.30){//只显示部分
//              this.text_number = this.args.text_number;
//              this.text = undefined;
//              this.text_top = undefined;
//          }else{
//              this.text_number = undefined;
//              this.text = undefined;
//              this.text_top = undefined;
//          }
//      }
 		this.show_by_percent = function(){
            if( this.args.percent > 0.22){//只显示部分
                this.text = this.args.text;
                this.text_number = this.args.text_number;
            }else{
                this.text_number = undefined;
                this.text = undefined;
            }
        }

        this.percent = parseFloat(this.args.percent)*100 + "%";//百分比相关
        this.type = this.args.type;
        this.color = this.args.color;
        this.do_code = this.args.do_code;
        this.cursor = this.args.cursor;
        this.x_coord = this.args.x_coord;
        this.y_coord = this.args.y_coord;
        this.pk_id = this.args.pk_id;
        this.version_id = this.args.version_id;
        this.is_freeze = (this.args.pk_id == undefined || this.args.pk_id == null || this.args.pk_id == 0);
        this.opacity = this.args.opacity;
        this.changeModelNumber = this.args.changeModelNumber;
        this.mocode_num = this.args.mocode_num;
        this.cell_tasknum = this.args.cell_tasknum;
        this.workTime = this.args.workTime;
        this.frontClass = this.args.frontClass;
        this.timePercent = this.args.timePercent;

        //定义字体颜色
        if(this.args.color != undefined){
            this.textColor = xujun_tool.getTextColor(this.args.color);
        }
        //初始化方法:根据percent显示
        this.show_by_percent();
    }
    
    this.jsonToexternalDifferViewModel = function (json_object){
    	var headList = json_object.columnAlias,//表头列表
			tableList = json_object.column,		//表格数据顺序
			poolTaskChangeList = json_object.poolTaskChangeList,
			table_object = {},//返回的数据
			allTableView = {},
			tabList = [];
		
		//表头数据
		table_object.headData = headList;
		
		/*行757-763是变化模块的变量*/
		var changedView_arr = [],  //表格及标签信息
			changedAfter_obj = {},  //tableView
			changeTableRowList = [],
			tabListChange_obj = {},
			allchange_differ_num = 0,
			changeFlag = false;
		
		//遍历所有的变化
		for(var i = 0;i < poolTaskChangeList.length;i ++){
			var poolTaskChange = poolTaskChangeList[i],
				changeType = poolTaskChange.changeType,		//变化的类型
				poolTaskListInResult = poolTaskChange.poolTaskListInResult,		//结果页的数据
				poolTaskListInOutside = poolTaskChange.poolTaskListInOutside;		//外部新增的数据
			if(changeType == "CREATE_POOL_TASK"){
				var each_differ_num = 0,
					tableRowList = [];
				
				//遍历派工单
				for(var j in poolTaskListInOutside){
					var pkInfo = poolTaskListInOutside[j];		//派工单信息
					var rowList = [];
					
					var startTimes = pkInfo.startTime;
					pkInfo.startTime = startTimes?startTimes.substring(0,11):"";
					var endTimes = pkInfo.endTime;
					pkInfo.endTime = endTimes?endTimes.substring(0,11):"";
					
					//遍历表头出现的那些列的信息数据old改变前数据,now改变后数据
					for(var k = 0;k < tableList.length;k ++){
						var coloum = tableList[k];
						var old_new_obj = {};
						old_new_obj.old = "";
						old_new_obj.now = pkInfo[coloum];							
						rowList.push(old_new_obj);
					}
					tableRowList.push(rowList);	
					each_differ_num ++;
				}
				
				//给tab标签创建对象
				var tabList_obj = {
					changeType : "add",
					changeTypeName : "新增订单",
					each_differ_num : each_differ_num
				}
				allTableView.add = tableRowList;
				tabList.push(tabList_obj);
			}
			if(changeType == "DELETE_POOL_TASK"){
				var each_differ_num = 0;
				var tableRowList = [];
				
				//遍历派工单
				for(var j in poolTaskListInResult){
					var pkInfo = poolTaskListInResult[j];//派工单信息
					var rowList = [];
					
					var startTimes = pkInfo.startTime;
					pkInfo.startTime = startTimes?startTimes.substring(0,11):"";
					var endTimes = pkInfo.endTime;
					pkInfo.endTime = endTimes?endTimes.substring(0,11):"";
					
					//遍历表头出现的那些列的信息数据old改变前数据,now改变后数据
					for(var k = 0;k < tableList.length;k ++){
						var old_new_obj = {};
						var coloum = tableList[k];
						old_new_obj.old = "";
						old_new_obj.now = pkInfo[coloum];							
						rowList.push(old_new_obj);
					}
					tableRowList.push(rowList);
					each_differ_num ++;
				}
				
				//给tab标签对象加入新变化方式
				var tabList_obj = {
					changeType : "desc",
					changeTypeName : "减少订单",
					each_differ_num : each_differ_num
				}				
				allTableView.desc = tableRowList;
				tabList.push(tabList_obj);
			}
			
			//变化目前是指派工单里数量变化和时间变化
			if(changeType == "ADD_POOL_TASK_NUM"||changeType == "SUBTRACT_POOL_TASK_NUM"||changeType == "POOL_TASK_TIME_CHANGED"){
				changeFlag = true;
				for(var j in poolTaskListInOutside){//poolTaskListInOutside里面的派工单
					var rowList = [];
					var pk_IO_Info = poolTaskListInOutside[j];		//新数据
					
					var startTime = pk_IO_Info.startTime;
					pk_IO_Info.startTime = startTime?startTime.substring(0,11):"";		
					var endTime = pk_IO_Info.endTime;
					pk_IO_Info.endTime = endTime?endTime.substring(0,11):"";
					
					for(var k = 0;k < tableList.length;k ++){		//表头列信息
						var old_new_obj = {};	//新数据旧数据对象
						var coloum = tableList[k];
						var pk_IR_Info = poolTaskListInResult[j];
						
						var startTimeNew = pk_IR_Info.startTime;
						pk_IR_Info.startTime = startTimeNew?startTimeNew.substring(0,11):"";
						var endTimeNew = pk_IR_Info.endTime;
						pk_IR_Info.endTime = endTimeNew?endTimeNew.substring(0,11):"";
						
						old_new_obj.old = pk_IR_Info[coloum];
						old_new_obj.now = pk_IO_Info[coloum];											
						rowList.push(old_new_obj);	//将数据对象push进数组
					}
					changeTableRowList.push(rowList);
					allTableView.change = changeTableRowList;
					allchange_differ_num ++;
				}
				
				//"变化"类型的tab信息
				tabListChange_obj.changeType = "change";
				tabListChange_obj.changeTypeName = "变化订单";
				tabListChange_obj.each_differ_num = allchange_differ_num;				
			}
		}
		
		//如果存在变化的类型,则加上变化的tab信息
		if(changeFlag){
			tabList.push(tabListChange_obj);
		}		
		table_object.tabList = tabList;
		table_object.bodyData = allTableView
		
		return table_object;
    };    
});

