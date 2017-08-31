<template>
	<p class="time-condition">
		<span>时&#12288;&#12288;间 ：</span>
		<el-date-picker
			v-model="value.startTime"
			type="date"
			@change='changeStartTime'
			placeholder="选择日期">
		</el-date-picker>
		&#12288;至&#12288;
		<el-date-picker
			v-model="value.endTime"
			type="date"
			@change='changeEndTime'
			placeholder="选择日期">
		</el-date-picker>
		<a class="quick-time-condition" href="javascript:void(0);" @click="quickSelectTime('currentWeek')">本周</a>
		<a class="quick-time-condition" href="javascript:void(0);" @click="quickSelectTime('nextWeek')">下周</a>
		<a class="quick-time-condition" href="javascript:void(0);" @click="quickSelectTime('currentMonth')">本月</a>
		<a class="quick-time-condition" href="javascript:void(0);" @click="quickSelectTime('nextMonth')">下月</a>
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
				endTime: ''
			}
		}, 
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
	  		//为选中文字添加选中样式class-acitve
	  		this.quickTime = timeName;
	  		const time = new Date();
			
			//判断方案列表是否有方案，如果有方案的话为true，则选择开始时间最小为今天,没有为false,则为本周第一天
			if (timeName === "currentWeek") {
				//本周，+1是为了从周一开始
				this.value.startTime = time.setDate(time.getDate() - time.getDay() + 1);
				this.value.endTime = time.setDate(time.getDate() - time.getDay() + 7);
			} else if (timeName === "nextWeek") {
				//下周
				this.value.startTime = time.setDate(time.getDate() - time.getDay() + 8);
				this.value.endTime = time.setDate(time.getDate() - time.getDay() + 14);
			} else if (timeName === "currentMonth") {
				//最后一天计算，本月第一天加上本月天数
				this.value.startTime = time.setDate(1);
				this.value.endTime = new Date(time.setMonth(time.getMonth() + 1)).setDate(0);
			} else {
				//来源本个月的最后一天加一天
				this.value.startTime = new Date(time.setMonth(time.getMonth() + 1)).setDate(1);
				this.value.endTime = new Date(time.setMonth(time.getMonth() + 1)).setDate(0);
			}
		},
	},
	mounted(){
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
		console.log(this.value);
	}
}
</script>