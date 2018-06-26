<template>
	<div class="query-conditions">
		<span @click="show(name)">地&#12288;&#12288;点：</span>
		<aps-cascader
			disabled="disabled"
			:options="options"
			id="locationId"
			showText="locationName"
			children="nextLevelLocation"
			@checked="checkedChange"
			v-model="checkedList">
		</aps-cascader>
	</div>
</template>

<script>
export default {
	name: 'locationCascader',

	props: [
		'writelocation',
    	'selectLocationList'
	],

	data () {
		return {
			options: [],
			name: '地点',
			checkedList: []
		}
	},

	watch: {
		'writelocation' :{
			handler: function (val, oldVal) {
				let thisSchemeId = t.typeObject(val) === 'Array' ? val[0] : val;

				//构造数据
				this.dataProcess(thisSchemeId);
			},
		},
		'checkedList' :{
			handler: function (val, oldVal) {

               this.$emit("input", val);
               this.$emit("change", val);
			},
		}
	},

	methods: {
		show: (name) => {
			name ="a"
			console.log(this)
		},
		checkedChange: function(val){
			this.selectLocationList = val;
		},
		/**
		 * desc:构造传给级联下拉框的数据
		 * time:2017-07-03
		 * author:dww
		 * last:dww
		 * @param: thisSchemeId:方案ID
		 **/
		dataProcess: function(thisSchemeId){
			/*构造地点级联数据传给级联下拉框*/
			//后台查数据
			this.$http.get(
				this.url.aps_location_readable
			).then(res =>{
				let allLocation = res.data;
				if(thisSchemeId){
					//查询方案下的地点
					this.$http.get(
						this.url.aps_schedule_scheme
					).then(res => {
						let allScheme = res.data,
							writeLocation = [],
							writeLocationId = [];
						for(let schemeId in allScheme){
							if(allScheme[schemeId].schemeId == thisSchemeId){
								writeLocation = allScheme[schemeId].locationDtoList;
								break;
							}
						}
						//遍历提取地点id
						writeLocation.every(item => {
							writeLocationId.push(item.locationId);
							return true;
						})

						//根据改方案下的地点，插入是否可写信息
						insertState(allLocation, writeLocationId, true);

						//绑定到级联组件
						this.options = allLocation;
					});
				}else{
					//绑定到级联组件
					this.options = allLocation;
				}
			});

			//插入是否可写信息，绑定选中状态
			function insertState(location, writeLocationId, parentDisabled){
				//遍历这一层的地点
				for (let item in location){
					let thisLocation = location[item],
						idIndex = writeLocationId.indexOf(thisLocation.locationId);
					if(parentDisabled && idIndex < 0){
						thisLocation.disabled = true;
					}else{
						//移出这一项
						writeLocationId.splice(idIndex,1);
					}
					//如果writeLocationId长度为0，返回
	//				if(writeLocationId.length === 0){
	//					return;
	//				}
					//如果还有下一层
					if(!$.isEmptyObject(thisLocation.nextLevelLocation)){
						insertState(thisLocation.nextLevelLocation, writeLocationId, thisLocation.disabled)
					}
				}
			}
		}
	},

	mounted (){
//		//初始
        this.dataProcess(this.writelocation);
	}
}
</script>
