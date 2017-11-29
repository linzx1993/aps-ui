<template>
    <p class="time-condition">
        <span>时&#12288;&#12288;间 ：</span>
        <el-date-picker
            v-model="value.startTime"
            type="date"
            :picker-options="value.pickerOptions"
            @change='changeStartTime'
            placeholder="选择日期">
        </el-date-picker>
        &#12288;至&#12288;
        <el-date-picker
            v-model="value.endTime"
            type="date"
            :picker-options="value.pickerEndOptions"
            @change='changeEndTime'
            placeholder="选择日期">
        </el-date-picker>
        <a v-show="previousMonth" class="quick-time-condition" href="javascript:void(0);" @click="quickSelectTime('previousMonth')">上月</a>
        <a v-show="previousWeek" class="quick-time-condition" href="javascript:void(0);" @click="quickSelectTime('previousWeek')">上周</a>
        <a v-show="currentWeek" class="quick-time-condition" href="javascript:void(0);" @click="quickSelectTime('currentWeek')">本周</a>
        <a v-show="nextWeek" class="quick-time-condition" href="javascript:void(0);" @click="quickSelectTime('nextWeek')">下周</a>
        <a v-show="currentMonth" class="quick-time-condition" href="javascript:void(0);" @click="quickSelectTime('currentMonth')">本月</a>
        <a v-show="nextMonth" class="quick-time-condition" href="javascript:void(0);" @click="quickSelectTime('nextMonth')">下月</a>
    </p>
</template>

<script>
export default{

	  name: 'dateSelect',

	  componentName: 'dateSelect',

	  data(){
	  	  return{
	  	  	  quickTime: '',
	  	  }
	  },

	  props: {
	  	  value: {
	  	  	  required: true,
	  	  	  default: {
	  	  	  	  startTime: '',
	  	  	  	  endTime: '',
                quickSelect : [],
                pickerOptions : {},
                pickerEndOptions : {}
	  	  	  }
	  	  },
	  },
    computed :{
            previousMonth(){ return this.value.quickSelect.indexOf("previousMonth") > -1},
            previousWeek(){ return this.value.quickSelect.indexOf("previousWeek") > -1},
            currentWeek(){ return this.value.quickSelect.indexOf("currentWeek") > -1},
            nextWeek(){ return this.value.quickSelect.indexOf("nextWeek") > -1},
            currentMonth(){ return this.value.quickSelect.indexOf("currentMonth") > -1},
            nextMonth(){ return this.value.quickSelect.indexOf("nextMonth") > -1},
    },

	  methods: {
	  	  changeStartTime(startTime){
	  	  	  this.value.startTime = startTime;
	  	  	  this.$emit('input', this.value);
	  	  	  this.$emit('change', this.value);
	  	  },
	  	  changeEndTime(endTime){
	  	  	  this.value.endTime = endTime;
	  	  	  this.$emit('input', this.value);
	  	  	  this.$emit('change', this.value);
	  	  },
	  	  quickSelectTime(timeName) {
	  	  	  console.log(this.value.pickerOptions.disabledDate(new Date()));
            //为选中文字添加选中样式class-acitve
            this.quickTime = timeName;
            const time = new Date();

	  		    let newStartTime,
	  			      newEndTime;

	  		    //  判断方案列表是否有方案，如果有方案的话为true，则选择开始时间最小为今天,没有为false,则为本周第一天
            if (timeName === "previousWeek") {
                //获取周几，然后加上剩余的几天，再加一天
                //后来人请记住哦,setDate这个api是会修改time值的
                newStartTime = time.setDate(time.getDate() - time.getDay() - 7);
                newEndTime = time.setDate(time.getDate() + 7);
            } else if (timeName === "currentWeek") {
	  		    	  //本周，+1是为了从周一开始
	  		    	  newStartTime = time.setDate(time.getDate() - time.getDay() + 1);
	  		    	  newEndTime = time.setDate(time.getDate() - time.getDay() + 7);
	  		    } else if (timeName === "nextWeek") {
	  		    	  //下周
	  		    	  newStartTime = time.setDate(time.getDate() - time.getDay() + 8);
	  		    	  newEndTime = time.setDate(time.getDate() - time.getDay() + 7);
	  		    } else if(timeName === "previousMonth"){
              //先获得上个月的最后一天，
              newEndTime = time.setDate(0);
              //然后newEndTime变为上个月，再setDate(1)变为第一天
              newStartTime = new Date(newEndTime).setDate(1);
            } else if (timeName === "currentMonth") {
	  		    	  //最后一天计算，本月第一天加上本月天数
	  		    	  newStartTime = time.setDate(1);
	  		    	  newEndTime = new Date(time.setMonth(time.getMonth() + 1)).setDate(0);
	  		    } else if (timeName === "nextMonth"){
	  		    	  //来源本个月的最后一天加一天
	  		    	  time.setDate(15);//设为本月15号   防止本月有31号而下月没有导致变成下下月的1号
	  		    	  newStartTime = new Date(time.setMonth(time.getMonth() + 1)).setDate(1);
	  		    	  newEndTime = new Date(time.setMonth(time.getMonth() + 1)).setDate(0);
	  		    }

            if(new Date(newStartTime).toLocaleDateString() !== new Date(this.value.startTime).toLocaleDateString()){
	  		    	  this.value.startTime = newStartTime;
	  		    }
	  		    if(new Date(newEndTime).toLocaleDateString() !== new Date(this.value.endTime).toLocaleDateString()){
	  		    	  this.value.endTime = newEndTime;
	  		    }
	  	  },
	  },
	  mounted(){
	  	  //根据用户输入，出现哪些快速选择时间功能
	  	  if(this.value.startTime){
	  	  	  let defaultTime = new Date(this.value.startTime).toLocaleDateString().split("/");
	  	  	  if(defaultTime[1].length === 1){
	  	  	  	  defaultTime[1] = '0' + defaultTime[1];
	  	  	  }
	  	  	  if(defaultTime[2].length === 1){
	  	  	  	  defaultTime[2] = '0' + defaultTime[2];
	  	  	  }
	  	  	  this.changeStartTime(defaultTime.join("-"));
	  	  }
	  	  if(this.value.endTime){
	  	  	  let defaultTime = new Date(this.value.endTime).toLocaleDateString().split("/");
	  	  	  if(defaultTime[1].length === 1){
	  	  	  	  defaultTime[1] = '0' + defaultTime[1];
	  	  	  }
	  	  	  if(defaultTime[2].length === 1){
	  	  	  	  defaultTime[2] = '0' + defaultTime[2];
	  	  	  }
	  	  	  this.changeEndTime(defaultTime.join("-"));
	  	  }
	  }
}
</script>
