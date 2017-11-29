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
   * 将处理后得到的数据传进来转换成echarts所需要的option
   * @param optionData
   * @returns {{title: {text, show: boolean, x: string, y: string}, tooltip: {trigger: string}, legend: {data: Array, top: string, left: string}, toolbox: {top: string, right: string, show: boolean, feature: {dataView: {show: boolean}, restore: {show: boolean}, dataZoom: {show: boolean}, saveAsImage: {show: boolean}, magicType: {type: [string,string]}}}, calculable: boolean, dataZoom: [*,*], xAxis: [*], yAxis: [*], series: Array}}
   */
    getBarEChartsOption(optionData) {
        //		  console.log(optionData);
        let option = {
            title: {
                text : optionData.title.text,
                show : !!optionData.title,
                x : optionData.title.x || 'center',
                y : optionData.title.y || '0%'
            },
            //鼠标移到折线图上是否有数据提示
            tooltip: {
                trigger: 'axis'
            },
            //标题展示项
            legend: {
                data: [],
                top : '7%',
                left : 'center'
            },
            //标题小工具栏
            toolbox: { //可视化的工具箱
                top : "0%",
                right : '10%',
                show: true,
                feature: {
                    //数据视图
                    dataView: {show: false},
                    //重置
                    restore: {show: false},
                    //数据缩放视图
                    dataZoom: {show: false},
                    //保存图片
                    saveAsImage: {show: true},
                    //动态类型切换
                    magicType: {type: ['bar', 'line']}
                }
            },
            calculable: true,
            dataZoom: [
                {startValue: '0'},
                {type: 'inside'},
              //y轴拉缩框
      //                {
      //                    type: 'slider',
      //                    yAxisIndex: 0,
      //                    filterMode: 'empty'
      //                },
            ],
            xAxis: [{
                type: 'category',
      //                  axisLabel: {
      //                      interval:0,//横轴信息全部显示
      //                      rotate: 40,//60度角倾斜显示
      //                      formatter:function(val) {
      //                          return val.split("").join("\n"); //横轴信息文字竖直显示
      //                      }
      //                  },
                data: []
            }],
            yAxis: [{
                type: 'value',
                interval : optionData.interval
            }],
            series: []
        };
        //如果y轴没有数据，直接返回，图标显示为空
        if (optionData.yAxisList.length === 0) {
            return option
        }
        //设置x轴坐标
        option.xAxis[0].data = optionData.xAxisList;
        //设置y轴坐标
        optionData.yAxisList.forEach((item) => {
            //设置图表toolbox,提示小格子
            option.legend.data.push(item.name);
            //设置x轴各项在y轴对应的值
            const obj = {
                name: item.name,
                type: optionData.type || 'bar',
                data: item.valueList,
                markPoint : {
                    data : [
                        {type : 'max', name: '最大值'},
                        {type : 'min', name: '最小值'}
                    ]
                },
                markLine : {
                    data : [
                        {type : 'average', name: '平均值'}
                    ]
                }
            };
            option.series.push(obj);
        });
        return option;
    },
}
