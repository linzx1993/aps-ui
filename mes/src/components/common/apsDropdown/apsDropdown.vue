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
				:title="selectedLabel.join()"
				readonly>
		</span>
		<div
			class="aps-dropdown-menus"
			v-show="menusShow">
			<div
				class="aps-dropdown-placeholder"
				v-if="options.length === 0">
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
				v-if="searchable"
				class="aps-dropdown-search">
				<input 
					type="text"
					v-model="query"
					class="aps-dropdown-inner-input"
					placeholder="请输入">
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
		value: {
			required: true
		},
		searchable: {
			default: true
		}
	},

	watch: {
		value(val){
			
			this.setSelected()
			
			this.$emit('change',val);
			
			//更新全选状态
			if(this.value.length){
				this.checkedAll = true;
				this.broadcast('apsOption', 'queryChange', this.query.toLowerCase());
			}else{
				this.checkedAll = false;
			}
		},
		query(val){
			this.checkedAll = true;
          	this.broadcast('apsOption', 'queryChange', val.toLowerCase());
		}
	},

	methods: {
		/**
<<<<<<< HEAD
<<<<<<< HEAD
		 * desc:li的click，选中或者取消选中
		 * time:2017-06-29
		 * author:dww
		 * last:dww
		 * @param: node:click的节点
		 **/
		liClick: function(node){
			if(this.multiple){
				if(node.checked){
					this.checkedNodeArr.splice(this.checkedNodeArr.indexOf(node.id),1);
					this.checkedShow.splice(this.checkedShow.indexOf(node.showText),1);
					this.$set(node, 'checked', false);
				}else{
					this.checkedNodeArr.push(node.id);
					this.checkedShow.push(node.showText);
					this.$set(node, 'checked', true);
				}
			}else{
				this.checkedNodeArr = [];
				this.checkedShow = [];
				if(node.checked){
					this.$set(node, 'checked', false);
				}else{
					this.checkedNodeArr.push(node.id);
					this.checkedShow.push(node.showText);
					for(let i = 0,l = this.dropDownList.length ; i < l ; i++){
						if(this.dropDownList[i].checked){
							this.$set(this.dropDownList[i], 'checked', false);
							break;
						}
					}
					this.$set(node, 'checked', true)
				}
			}

			this.$emit("input", this.checkedNodeArr);

		},

		/**
=======
>>>>>>> ed042e48dff273501b52b1aeb0f8edde7163a06a
=======
		 * desc:刷新显示选中值
		 * time:2017-07-26
		 * author:dww
		 * last:dww
		 **/
		setSelected(){
			const result = [];	
			//传入值不是数组或者字符串
			if(!Array.isArray(this.value) && typeof(this.value) !== 'string'){
				return;
			}
			//在单选的情况下传入长度大于1的数组
			if(!this.multiple && Array.isArray(this.value) && this.value.length > 1){
				return;
			}
			//字符串转数组
			if(typeof(this.value) === 'string'){
				this.value = this.value ? this.value : [];
			}
			
			this.options.every(item =>{
				if(this.value.indexOf(item.value) > -1){
					result.push(item.label);
				}
				return true;
			});
			
			this.selectedLabel = result;
		},
		/**
>>>>>>> 392a97c5f36cd9074d65eb74d5758f3af182c3b7
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
				}else{
					value.push(option.value);
				}
				this.$emit('input', value);
			}else{
				if(this.value.indexOf(option.value) > -1){
					this.$emit('input', []);
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
			}
		}
	},

	created() {
		//初始选中的值
		this.$emit("input", this.initialValue);
		this.selectedLabel = this.initialLabel.slice();

		//监听li点击
		this.$on('handleOptionClick', this.handleOptionSelect);
		//监听销毁
		this.$on('onOptionDestroy', this.onOptionDestroy);
		//监听全选状态
		this.$on('visibleNotSelected', this.notSelectAll);
		//监听全选
		this.$on('selectAllOption', this.selectAllOption);
	}
}

</script>
