<template>
	<div 
		class="col-config"
		v-show="showConfigDialop"
		v-clickoutside="cancelDialog">
		<div class="col-config-head">
			列信息配置
			<div class="icon-zoom">
				<i 
					class="col-config-reset"
					title="恢复默认"
					@click='colConfigReset'>
				</i>
<!--
				<i 
					class="col-config-revoke"
					title="撤销本次修改">
				</i>
-->
				<i 
					class="col-config-cancel"
					title="关闭"
					@click='cancelDialog'>
				</i>
			</div>
		</div>
		<div class="col-config-main">
			<el-transfer 
				v-model="selected" 
				:data="data"
				:props="{
				  	key: 'valueContent',
				  	label: 'valueAlias'
				}"
				:titles='transferTitle'
				@change='selectedChange'>
			</el-transfer>
		</div>
	</div>
</template>

<script>
import Clickoutside from 'element-ui/src/utils/clickoutside';
import Emitter from 'element-ui/src/mixins/emitter';
	
export default{
	mixins: [Emitter],
	
	name: 'colConfig',
	
	componentName: 'colConfig',
	
	directives: {
		Clickoutside
	},
	
	data(){
		return{
			selected: [],
			data: [],
			showConfigDialop: false,
			cacheUrl: '',
			transferTitle: ['候选列','已选列']
		}
	},
	
	props: {
		configUrl: String
	},
	
	methods:{
		dialog(){
			this.showConfigDialop = !this.showConfigDialop;
			
			//url未变不重新获取
			if(this.cacheUrl === this.configUrl){
				return;
			}
			//获取列信息
			this.$http.get(
				this.configUrl
			).then(res =>{
				let selected = [];
				
				this.data = res.data.optionList;
				
				//遍历已选中显示的项
				for(let i = 0, l = res.data.selectList.length; i < l; i++){
					selected.push(res.data.selectList[i].valueContent);
				}
				
				this.selected = selected;
				
				this.cacheUrl = this.configUrl
			});
		},
		cancelDialog(){
			//关闭页面
			this.showConfigDialop = false;
		},
		selectedChange(){
			const requestData = this.data.filter(item =>{
				return this.selected.indexOf(item.valueContent) > -1;
			});
			
			if(requestData.length === 0){
				return
			}
			
			this.$http.put(
				this.configUrl,
				{
					selectList: requestData
				}
			).then(res =>{
				this.$emit('colChange');
			})
		},
		colConfigReset(){
			this.$http.delete(
				this.configUrl
			).then(res =>{
				let selected = [];
				
				this.data = res.data.optionList;
				
				//遍历已选中显示的项
				for(let i = 0, l = res.data.selectList.length; i < l; i++){
					selected.push(res.data.selectList[i].valueContent);
				}
				
				this.selected = selected;
				
				this.$emit('colChange');
			});
		}
	},
	
	created(){
		this.$on('openColConfig',this.dialog)
	}
}
</script>

<style rel="stylesheet/scss" lang="scss">
	.col-config{
		position: relative;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		padding: 0 20px 20px;
		width: 500px;
		border: 1px solid #ccc;
		box-shadow: -2px 2px 5px #ccc;
		background-color: #fff;
		
		.col-config-head{
			flex: 0 0 40px;
			line-height: 40px;
			font-size: 16px;
			font-weight: 700;
			
			.icon-zoom{
				position: absolute;
				top: 0;
				right: 20px;
				
				i{
					width: 14px;
					height: 14px;
					margin-left: 4px;
					cursor: pointer;
				}
				.col-config-reset{
					background: url(../../assets/reset.png);
				}
				.col-config-revoke{
					background: url(../../assets/revoke.png);
				}
				.col-config-cancel{
					background: url(../../assets/cancel.png);
				}
			}
		}
		&:after{
			content: '';
			display: block;
			position: absolute;
			top: 10px;
			right: -8px;
			width: 14px;
			height: 14px;
			background-color: #fff;
			border-top: 1px solid #ccc;
			border-right: 1px solid #ccc;
			transform: rotate(45deg);
		}
	}
</style>