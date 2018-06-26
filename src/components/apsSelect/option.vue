<template>
	<li
		@click.stop="liClick"
		:title="label"
		:value="value"
		v-show="visible"
		class="aps-option-li"
		:class="{
			'dropdown-li-disabled': disabled,
			'dropdown-li-checked': itemSelected,
		}">
		<slot>
		    {{label}}
		</slot>
	</li>
</template>

<script>
import Emitter from 'element-ui/src/mixins/emitter';

export default{
	mixins: [Emitter],

	name: 'apsOption',

	componentName: 'apsOption',

	props: {
		label: [String, Number],
		value: [String, Number, null],
		disabled: {
			type: Boolean,
        	default: false
		},
		checked: {
			type: Boolean,
        	default: false
		}
	},

	data (){
		return {
			visible: true
		}
	},

	computed: {
		//找到下拉框组件
		parent() {
			let result = this.$parent;
			while (!result.isSelect) {
				result = result.$parent;
			}
			return result;
		},
		//当前节点的选中状态
		itemSelected() {
			//如果是多选
			if(this.parent.multiple){
				return this.parent.value.indexOf(this.value) > -1;
			}else{
				return this.value == this.parent.value;
			}
		}
	},

	methods: {
		liClick(){
			if (this.disabled !== true && this.groupDisabled !== true) {
				this.dispatch('apsSelect', 'handleOptionClick', this);
			}
		},
		queryChange(query){
			this.visible = (this.label + '').toLowerCase().indexOf(query) > -1;
			//当前节点显示，且未被选中
			if(this.visible && !this.itemSelected){
				this.dispatch('apsSelect', 'visibleNotSelected', false);
			}
		},
		selectAll(checkedAllState){
			if(this.visible && (!this.itemSelected === checkedAllState)){
				this.dispatch('apsSelect', 'selectAllOption', this);
			}
		}
	},

	created() {
		//将这一项推入下拉框组件
		this.parent.options.push(this);
//		if(this.checked){
//			this.parent.initialValue.push(this.value)
//			this.parent.initialLabel.push(this.label)
//		}
		
		this.$on('queryChange', this.queryChange);
		this.$on('selectAll', this.selectAll);
//		this.parent.cachedOptions.push(this);
//		this.parent.optionsCount++;
//		this.parent.filteredOptionsCount++;
//		this.index = this.parent.options.indexOf(this);
    },
	
	beforeDestroy() {
      this.dispatch('apsSelect', 'onOptionDestroy', this);
    }
}
</script>
