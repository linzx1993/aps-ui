/** * Created by linzx on 2017/7/17. */
<template>
    <div class="right-content-box re-schedule-reason">
        <div class="search-box">
            <p class="time-condition">
                <span>时间 ： </span>
                <el-date-picker
                    v-model="startTime"
                    type="date"
                    placeholder="选择日期">
                </el-date-picker>
                &#12288;至&#12288;
                <el-date-picker
                    v-model="endTime"
                    type="date"
                    placeholder="选择日期">
                </el-date-picker>
                <a class="quick-time-condition" href="javascript:void(0);" :class="{active : quickTime === 'currentWeek'}" @click="quickSelectTime('currentWeek')">本周</a>
                <a class="quick-time-condition" href="javascript:void(0);" :class="{active : quickTime === 'nextWeek'}" @click="quickSelectTime('previousWeek')">上周</a>
                <a class="quick-time-condition" href="javascript:void(0);" :class="{active : quickTime === 'currentMonth'}" @click="quickSelectTime('currentMonth')">本月</a>
                <a class="quick-time-condition" href="javascript:void(0);" :class="{active : quickTime === 'nextMonth'}" @click="quickSelectTime('previousMonth')">上月</a>
            </p>
            <div class="mt-20 query-conditions" v-show="schedulePersonList.length > 1">
                <span>人员 ： </span>
                <el-select v-model="schedulePerson" placeholder="请选择">
                    <el-option
                        v-for="item in schedulePersonList"
                        :key="item.userId"
                        :label="item.userName"
                        :value="item.userId">
                    </el-option>
                </el-select>
            </div>
            <a class="mt-20 default-btn" href="javascript:void(0);" @click="getHistoryList">查看</a>
        </div>
        <hr class="mt-20 mb-20">
        <p v-show="!showEChartAndTable" class="c-theme-color">{{showTips}}</p>
        <div>
            <div class="re-schedule-canvas-box mb-40">
                <div id="historyCount" class="canvas"></div>
                <hr style="background-color: #d9d9d9;width: 1px;height: 400px;margin-top: 0;">
                <div id="countAll" class="canvas"></div>
            </div>
            <table class="compare-equipment" v-show="showEChartAndTable">
                <thead>
                <tr>
                    <th style="width: 160px">时间</th>
                    <th>排程方案</th>
                    <th>排程地点</th>
                    <th>排程原因</th>
                    <th>详情</th>
                    <th>历史查询</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="row in historyScheduleTableList">
                    <td>{{row.scheduleTime}}</td>
                    <td>{{row.schemeName}}</td>
                    <td>{{row.location}}</td>
                    <td>{{row.reason}}</td>
                    <td>{{row.detail}}</td>
                    <td><a style="color: #1d7ed8" href="javascript:void(0);" @click="historyScheduleReason(row)">详情</a></td>
                </tr>
                </tbody>
            </table>
        </div>
        <el-dialog
            title="详情"
            :visible.sync="historyScheduleReasonShow"
            size="large">
            <reschedule-dialog
              :reasonId="thisRowId"
              :thisScheduleTime="thisRowTime">
            </reschedule-dialog>
        </el-dialog>
    </div>
</template>
<script>

	  import reScheduleDialog from '../common/reScheduleDialog'
    export default {
        components: {
            "reschedule-dialog": reScheduleDialog,
        },
    	  data() {
    	  	  return {
    	  	  	  showTips : '点击按钮查看历史排程原因分析',
                quickTime: "", //快速选择时间判断
                startTime: new Date().getTime(), //选择开始时间
                endTime: new Date().getTime() + 86400000, //选择结束时间
                schedulePersonList :  [],  //排程人员下拉列表
                schedulePerson : '',  //选择哪位排程人员
                showEChartAndTable : false,  //是否展现图表
                historyScheduleData: {
                    "caclReasonData": {},
                    "caclLocationData": {},
                    "reasonDtoList": []
                },
                historyScheduleTableList : [], //历史排程结果列表
                showSecond: true,
                dialogTableVisible:false,
                historyScheduleReasonShow:false,
                thisRowId:0,
                thisRowTime:'',
            }
        },
        mounted() {
            this.$nextTick(() => {
                //等dom渲染完毕，初始化图表
                this.myChartsHistoryCount = this.echarts.init(document.getElementById('historyCount'));
//                //========
                this.myChartsCountAll = this.echarts.init(document.getElementById('countAll'));
            });
//            //获取所有人员列表
            this.$http.get(this.url.get_all_schedule_person).then((res) => {
            	  this.schedulePersonList = res.data;
            },(res)=>{
              this.schedulePersonList = []
            });
            this.historyScheduleTableList = this.historyScheduleData.reasonDtoList;
        },
        methods : {
            //时间快速选择器
            quickSelectTime(timeName) {
                //为选中文字添加选中样式class-acitve
                this.quickTime = timeName;
                const year = new Date().getFullYear(),
                    month = new Date().getMonth() + 1,
                    date = new Date().getDate(),
                    weekDay = new Date().getDay() === 0 ? 7 : new Date().getDay(); //得到星期几,如果为0 ，表示星期天，转化为星期一
                //判断方案列表是否有方案，如果有方案的话为true，则选择开始时间最小为今天,没有为false,则为本周第一天
                if (timeName === "currentWeek") {
                    //获取周几，然后减去剩余的几天，再加一天
                    this.endTime = new Date();
                    this.startTime = new Date().getTime() - (weekDay - 1) * 86400000;
                    //如果结束时间大于本月最后一天的话
                } else if (timeName === "previousWeek") {
                    //获取周几，然后加上剩余的几天，再加一天
                    this.endTime = new Date().getTime() - weekDay * 86400000;
                    this.startTime = this.endTime - 6 * 86400000;
                }   else if (timeName === "currentMonth") {
                    //最后一天计算，本月第一天加上本月天数
                    this.endTime = new Date();
                    this.startTime = new Date(year + "-" + month + "-01").getTime();
                } else {
                    //来源本个月的最后一天加一天
                    this.endTime = new Date(year + "-" + month + "-01").getTime() - 86400000;
                    this.startTime = this.endTime - (getMonthDays(this.endTime) - 1) * 86400000;
                }
            },
            //根据查询条件，查看时间,获取所有的历史排程信息
            getHistoryList(){
                //结束时间不能大于开始时间
                if(this.startTime > this.endTime){
                    this.$alert('开始时间不能大于结束时间', '提示');
                    return;
                }
                const obj = {
                    startTime : t.getMonthDays(this.startTime),
                    endTime : t.getMonthDays(this.endTime),
                    userId : this.schedulePerson
                };
                this.$http.post(this.url.get_history_list,obj).then((res) => {
                    //获得表格渲染的数据如果没有数据，则图表不显示
                	  if(!res.data.reasonDtoList || res.data.reasonDtoList.length === 0){
                	  	  this.showTips = "本次查询数据为空";
                        this.showEChartAndTable = false;//表格消失
                        //图形消失
                        this.myChartsHistoryCount.clear();
                        this.myChartsCountAll.clear();
                        return;
                    }
                    //获得渲染图形的初始数据
                    this.historyScheduleData = res.data;
                    //获得表格渲染的数据
                    this.historyScheduleTableList = this.historyScheduleData.reasonDtoList;
                    this.showEChartAndTable = true;
                    this.packageECharts();
                },(res) => {
                    res.data = {
                        "caclReasonData": {},
                        "caclLocationData": {},
                        "reasonDtoList": []
                    };
                    this.$alert('请检查服务器', '提示')
                });
            },
            packageECharts(){
            	  //如果有正确的数据的话,则渲染图表
                if(this.historyScheduleData.reasonDtoList && this.historyScheduleData.reasonDtoList.length){
                    //====历史排程次数代码====
                    const historyTimeCount = this.dataProcess.toHistoryECharts(this.historyScheduleData);
                    const optionData = $.extend({},getBarEChartsOption(historyTimeCount),{interval : 1});//设置值的间隔为2
                    this.myChartsHistoryCount.setOption(optionData);
                    //点击图表的柱子，筛选出对应日期所有的重排数据,前台筛选
                    this.myChartsHistoryCount.on("click",(params) => {
                        const time = params.name;
                        this.historyScheduleTableList = this.historyScheduleData.reasonDtoList.filter((item) => {
                              return item.scheduleTime.slice(0,10) === time;
                        })
                    });
                    //======饼图代码======
                    const historyScheduleList = this.dataProcess.getHistorySchedulePieCharts(this.historyScheduleData);
                    this.myChartsCountAll.setOption(getPieEChartsOption(historyScheduleList));
                }
            },
            historyScheduleReason(rowInfo){
                this.thisRowId = rowInfo.id;
                this.thisRowTime = rowInfo.scheduleTime;
                this.historyScheduleReasonShow = !this.historyScheduleReasonShow;
            }
        }
    }
    function getBarEChartsOption(optionData) {
        let option = {
            title : {
                text: optionData.title || '历史重排查询',
                x : 'center',
                y : '0%'
            },
            tooltip : {
                trigger: 'axis'
            },
            legend: {
                data:[]
            },
            toolbox: { //可视化的工具箱
                right : '10%',
                show: true,
                feature: {
                    dataView: { //数据视图
                        show: false
                    },
                    restore: { //重置
                        show: false
                    },
                    dataZoom: { //数据缩放视图
                        show: false
                    },
                    saveAsImage: { //保存图片
                        show: true
                    },
                    magicType: { //动态类型切换
                        type: ['bar', 'line']
                    }
                }
            },
            grid : {
                left: '0%',
                right: '0%',
                bottom: '0%',
                containLabel: true
            },
            xAxis :  {
                type: 'category',
                data: []
            },
            yAxis : {
                type : 'value',
                interval : optionData.interval
            },
            series : []
        };
        option.xAxis.data = optionData.xAxisList;
        optionData.yAxisList.forEach((item) => {
            const obj = {
                name:item.name,
                type: optionData.type || 'bar',
                barWidth :optionData.barWidth,
                data:item.valueList
            };
            option.series.push(obj);
        });
        return option
    }
    function getPieEChartsOption (optionData) {
        let option = {
            title : {
                text: optionData.title || '数据汇总',
                x:'center'
            },
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            animationThreshold : false,//关闭移到饼图上的动画
            legend: {
                x : 'center',
                y : '10%',
            },
            toolbox: {
                show : false,
                feature : {
                    mark : {show: true},
                    dataView : {show: false, readOnly: false},
                    magicType : {
                        show: true,
                        type: ['pie', 'funnel']
                    },
                    restore : {show: true},
                    saveAsImage : {show: true}
                }
            },
            calculable : true,
            series : [
            ]
        };

        const pieNumber = Object.getOwnPropertyNames(optionData).length;
        let count = 1;//根据数量去确定每个饼图所在的位置
        for(let index in optionData){
            let basePie = {
                type:'pie',
                radius : [0, 80],
                center : ['0%', '50%'],
            };
            basePie.name = optionData[index].name;
            basePie.data = optionData[index].valueList;
            basePie.center[0] = (count / (pieNumber * 2) * 100) + '%';
            option.series.push(basePie);
            count += 2;
        }
        return option;
    }

</script>
