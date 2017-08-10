/**
 * Created by linzx on 2017/6/24.
 */
export default {
    /**
     * desc : 预测设备利用率页面，将数据替换成设备下拉列表所需要的数据
     * @param equipmentObject
     * @returns {Array}
     */
    processEquipmentList(equipmentObject){
        const equipmentList = [];
        for(let equipment in equipmentObject){
            const obj = {
                productUnitName :  equipmentObject[equipment].productUnitName,
                productUnitId : equipment
            };
            equipmentList.push(obj);
        }
        return equipmentList;
    },
    //将数据处理成展现表格所需要的形式
    showTableData(resData) {
        //获取所有方案名
        const schemeTableData = {
            equipmentNameList: [],
            equipmentValueList: []
        };
        const horizontalAxisData = resData.horizontalAxisData,
            longitudinalAxisData = resData.longitudinalAxisData;
        //获取表格x方向所有的设备名字,并确定顺序
        horizontalAxisData.forEach((item) => {
            const key = item.split("_")[0];
            const value = item.replace(key + "_","");
            const obj = {
                key : key,
                value : value,
            };
          schemeTableData.equipmentNameList.push(obj);
        });
        //获取y轴方向的每一行各个方案对应设备的值
        longitudinalAxisData.forEach((longitudinalAxis) => {
            const schemeRowData = [];
            schemeRowData.push(longitudinalAxis.schemeName);
            schemeTableData.equipmentNameList.forEach((item) => {
                if(longitudinalAxis.oeeMap[item.key] === undefined){
                    longitudinalAxis.oeeMap[item.key] = 0;
                }
                schemeRowData.push(longitudinalAxis.oeeMap[item.key].toFixed(3));
            });
            schemeTableData.equipmentValueList.push(schemeRowData);
        });
        return schemeTableData;
    },
  /**
   * desc : 返回一个eCharts双饼图所需的数据格式
   * @param resData
   * @returns {{reasonPieCharts: {nameList: Array, valueList: Array}, locationPieCharts: {nameList: Array, valueList: Array}}}
   */
    getHistorySchedulePieCharts(resData){
        //新建一个对象，同时包含地点分布和原因分布饼图所需的数据
        const pieChartsData = {
            reasonPieCharts : {
                name : '重排原因',
                nameList : [],
                valueList :[]
            },
            locationPieCharts : {
                name : '重排车间',
                nameList : [],
                valueList :[]
            },
        };
        //遍历原因分布列表的数据
        for(let reason in resData.caclReasonData){
            if(resData.caclReasonData.hasOwnProperty(reason)){
                pieChartsData.reasonPieCharts.nameList.push(reason);
                //eCharts饼图所需的数据格式
                pieChartsData.reasonPieCharts.valueList.push({
                    value : resData.caclReasonData[reason],
                    name : reason
                });
            }
        }
        //遍历地点分布列表的数据
        for(let location in resData.caclLocationData){
            if(resData.caclLocationData.hasOwnProperty(location)) {
                pieChartsData.locationPieCharts.nameList.push(location);
                //eCharts饼图所需的数据格式
                pieChartsData.locationPieCharts.valueList.push({
                  value: resData.caclLocationData[location],
                  name: location
                });
            }
        }
        return pieChartsData
    },
  /**
   *  desc :根据数据获取重排原因页面的柱形图，主要展示每个日期的重排次数，点击图需要在表需要展现每个日期的重排信息
   * @param resData
   */
    toHistoryECharts(resData){
        //统计每天的重排次数
        const timeCountObj = {};
        const xAxisList = [];
        for(let i in resData.reasonDtoList){
            //如果没有当前日期，则记录下来,初始次数为1
            const time = resData.reasonDtoList[i].scheduleTime.slice(0,10);
            if(!timeCountObj[time]){
                timeCountObj[time] = 1;
                xAxisList.push(time);
            }else{
                timeCountObj[time] ++;
            }
        }
        //根据顺序去获得每个时间对应的重排值
        const yAxisList = [{
            name : "历史排程次数",
            valueList : []
        }];
        xAxisList.forEach((item) => {
            yAxisList[0].valueList.push(timeCountObj[item]);
        });
        //返回一个可以直接给option调用的值
        return {
            xAxisList : xAxisList,
            yAxisList : yAxisList,
        }
    },
}
