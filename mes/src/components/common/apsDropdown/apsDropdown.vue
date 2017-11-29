<template>
	<span
		class="aps-dropdown"
		:class="{
			'aps-dropdown-active':menusShow
		}"
		v-clickoutside="handleClickoutside">
		<span
			class="aps-dropdown-main"
			@click="showMenus()">
			<input
				type="text"
				class="aps-dropdown-input"
				placeholder="请选择"
				v-model="selectedLabel"
				:title="selectedTitle"
				readonly>
			<i 
				class="aps-dropdown-clean"
				v-if='showClean'
				title='清除选中'
				@click='clean'>
			</i>
		</span>
		<div
			class="aps-dropdown-menus"
			v-show="menusShow">
			<div
				class="aps-dropdown-placeholder"
				v-if="options.length === 0  && !remote">
				暂无数据
			</div>
			<div
				v-if="multiple"
				class="aps-dropdown-all"
				:class="{
					'aps-dropdown-all-checked': checkedAll
				}"
				@click="checkAll()">
				全部
			</div>
			<div
				v-if="searchable || remote"
				class="aps-dropdown-search">
				<input 
					type="text"
					v-model="query"
					class="aps-dropdown-inner-input"
					:placeholder="placeholder">
			</div>
			<ul>
				<slot></slot>
			</ul>
		</div>
	</span>
</template>

<script>
import Clickoutside from 'element-ui/src/utils/clickoutside';
import Emitter from 'element-ui/src/mixins/emitter';

export default{
	mixins: [Emitter],
	
	name: 'apsDropdown',

	componentName: 'apsDropdown',

	directives: {
		Clickoutside
	},

	data (){
		return {
			options: [],
			menusShow: false,
			checkedAll: false,
			isSelect: true,
			initialValue: [],
			initialLabel: [],
			selectedLabel: [],
			query: ''
		}
	},

	props: {
		multiple: Boolean,
		remote: Boolean,
		value: {
			required: true
		},
		searchable: {
			default: true
		},
		placeholder: {
			default: '请输入关键字'
		}
	},

	computed: {
		selectedTitle(){
			return Array.isArray(this.selectedLabel) ? this.selectedLabel.join(',') : this.selectedLabel;
		},
		showClean(){
			return !!this.selectedTitle
		}
	},
	
	watch: {
		options(){
			this.checkedAll = true;
			this.broadcast('apsOption', 'queryChange', this.query.toLowerCase());
			this.setSelected();
		},
		value(val){
			
			this.setSelected()
			
			this.$emit('change',this.value);
			
			//更新全选状态
			if(typeof(this.value) === 'number' || this.value.length){
				this.checkedAll = true;
				this.broadcast('apsOption', 'queryChange', this.query.toLowerCase());
			}else{
				this.checkedAll = false;
			}
		},
		query(val){
			if(this.remote){
				this.$emit('remoteQuery',val);
				return;
			}
			this.checkedAll = true;
          	this.broadcast('apsOption', 'queryChange', val.toLowerCase());
		}
	},

	methods: {
		/**
		 * desc:刷新显示选中值
		 * time:2017-07-26
		 * author:dww
		 * last:dww
		 **/
		setSelected(){
			const result = [];	
			//传入值不是数组或者字符串
			if(!Array.isArray(this.value) && typeof(this.value) !== 'string' && typeof(this.value) !== 'number'){
				this.$emit('input',this.multiple ? [] : '')
				return;
			}
			//多选
			if(this.multiple){
				//传入字符串或者数字
				if(typeof(this.value) === 'string' || typeof(this.value) === 'number'){
					this.$emit('input',[this.value])
				}
				this.options.every(item =>{
					if(this.value.indexOf(item.value) > -1){
						result.push(item.label);
					}
					return true;
				});
				if(this.remote){
					for(let i = 0,l = result.length; i < l; i++){
						if(this.selectedLabel.indexOf(result[i]) === -1){
							this.selectedLabel.push(result[i]);
						}
					}
					return;
				}
				this.selectedLabel = result;
				return;
			}
			
			if(Array.isArray(this.value)){
				this.$emit('input',this.value.length ? this.value[0] : '')
				return;
			}
			this.selectedLabel = '';
			this.options.every(item =>{
				if(this.value === item.value){
					this.selectedLabel = item.label;
					return false;
				}
				return true;
			});
		},
		/**
		 * desc:全选全不选
		 * time:2017-06-29
		 * author:dww
		 * last:dww
		 **/
		checkAll: function(){
			this.checkedAll = !this.checkedAll;
			this.broadcast('apsOption', 'selectAll',this.checkedAll);
		},

		/**
		 * desc:打开下拉框
		 * time:2017-06-29
		 * author:dww
		 * last:dww
		 **/
		showMenus: function(){
			this.menusShow = !this.menusShow;
		},

		/**
		 * desc:下拉框点击事件
		 * time:2017-07-19
		 * author:dww
		 * last:dww
		 **/
		handleOptionSelect(option){
			//如果是多选
			if(this.multiple){
				const value = this.value.slice(),
					  optionIndex = value.indexOf(option.value);
				if(optionIndex > -1){
					value.splice(optionIndex, 1);
					if(this.remote){
						this.selectedLabel.splice(this.selectedLabel.indexOf(option.label),1);
					}
				}else{
					value.push(option.value);
				}
				this.$emit('input', value);
			}else{
				if(this.value == option.value){
					this.$emit('input', '');
					return;
				}
				this.$emit('input', option.value);
//				this.selectedLabel = [option.label];
				this.menusShow = false;
			}
		},

		/**
		 * desc:关闭下拉框
		 * time:2017-06-29
		 * author:dww
		 * last:dww
		 **/
		handleClickoutside() {
			this.menusShow = false;
		},
		/**
		 * desc:option被销毁时，移除这一项
		 * time:2017-07-28
		 * author:dww
		 * last:dww
		 **/
		onOptionDestroy(option) {
			let index = this.options.indexOf(option);	
			if (index > -1) {
			  this.options.splice(index, 1);
			}
			if(this.remote){
				return;
			}
			this.$emit("input", []);
		},
		/**
		 * desc:option内改变全选状态
		 * time:2017-07-28
		 * author:dww
		 * last:dww
		 **/
		notSelectAll(state){
			this.checkedAll = state;
		},
		/**
		 * desc:全选/全不选时，改变状态不一致的option的状态
		 * time:2017-07-28
		 * author:dww
		 * last:dww
		 **/
		selectAllOption(option){
			if(this.checkedAll){
				this.value.push(option.value);
			}else{
				this.value.splice(this.value.indexOf(option.value),1);
				if(this.remote){
					this.selectedLabel.splice(this.selectedLabel.indexOf(option.label),1);
				}
			}
		},
		/**
		 * desc:清除选中
		 * time:2017-07-28
		 * author:dww
		 * last:dww
		 **/
		clean(){
			this.$emit('input', this.multiple ? [] : '');
			this.selectedLabel = [];
		}
	},

	created() {
		//初始选中的值
//		this.$emit("input", this.initialValue);
//		this.selectedLabel = this.initialLabel.slice();

		//监听li点击
		this.$on('handleOptionClick', this.handleOptionSelect);
		//监听销毁
		this.$on('onOptionDestroy', this.onOptionDestroy);
		//监听全选状态
		this.$on('visibleNotSelected', this.notSelectAll);
		//监听全选
		this.$on('selectAllOption', this.selectAllOption);
		
		if(this.value.length === 0 || this.value === ''){
			this.$emit('input', this.multiple ? [] : '');
		}
		setTimeout(() =>{
			this.setSelected();
		},0);
	}
}

</script>
