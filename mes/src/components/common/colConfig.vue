<template>
	<div
		class="col-config"
		v-show="showConfigDialop"
		v-clickoutside="cancelDialog">
		<div class="col-config-head">
			列信息配置
			<div class="icon-zoom">
<!--
				<i
					class="col-config-reset"
					title="恢复默认"
					@click='colConfigReset'>
				</i>
-->
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
			<aps-transfer
			  	v-model="selected"
				:move="true"
				:data="data"
			  	:titles='transferTitle'>
			</aps-transfer>
		</div>
		<div class="col-config-function">
			 <a class="default-btn ml-5 mr-5" href="javascript:;" @click="selectedChange">保存</a>
			 <a class="default-btn ml-5 mr-5" href="javascript:;" @click="colConfigReset">还原</a>
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
			columnOptionList: [],
			showConfigDialop: false,
			cacheUrl: '',
			transferTitle: ['未显示项','已显示列']
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
				const selected = [],
					  data = [];

				this.columnOptionList = res.data.optionList;
				this.dataToTransfer(res.data);

				this.cacheUrl = this.configUrl
			});
		},
		cancelDialog(){
			//关闭页面
			this.showConfigDialop = false;
		},
		selectedChange(){
			const requestData = [];

		 	this.selected.forEach(selectItem => {
				const option = Object.assign({},this.columnOptionList.filter(item => {
					return selectItem === item.valueContent
			  	})[0]);
			  	requestData.push(option)
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
				this.columnOptionList = res.data.optionList;
				this.dataToTransfer(res.data);

				this.$emit('colChange');
			});
		},
		dataToTransfer(data){
			const selected = [],
				  transferData = [];

			//valueContent和valueAlias改成value和label
			for(let i = 0, l = data.optionList.length; i < l; i++){
				transferData.push({
					value: data.optionList[i].valueContent,
					label: data.optionList[i].valueAlias
				});
			}

			//遍历已选中显示的项
			for(let i = 0, l = data.selectList.length; i < l; i++){
				selected.push(data.selectList[i].valueContent);
			}

			this.data = transferData;
			this.selected = selected;
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
		width: 550px;
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
					background: url(../../asserts/reset.png);
				}
				.col-config-revoke{
					background: url(../../asserts/revoke.png);
				}
				.col-config-cancel{
					background: url(../../asserts/cancel.png);
				}
			}
		}

		.col-config-function{
			margin-top: 20px;
			text-align: center;
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
