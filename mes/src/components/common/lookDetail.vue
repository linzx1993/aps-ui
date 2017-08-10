<template>
	<div 
		class="look-detail"
		:style="{
			top: top + 'px',
			left: left + 'px'
		}"
		v-clickoutside="handleClickoutside"
		v-show="showDetail">
		<table>
			<tr
				v-for='item in detailInfo'>
				<td>{{item.title}}</td>
				<td>：</td>
				<td>{{item.content}}</td>
			</tr>
		</table>
	</div>
</template>

<script>
	
import Clickoutside from 'element-ui/src/utils/clickoutside';
	
export default{
	name: 'lookDetail',
	
	directives: {
		Clickoutside
	},
	
	props: {
		detailInfo: Array,
		top: Number,
		left: Number,
		showDetail: {
			default: false
		}
	},
	
	methods:{
		handleClickoutside(){
			this.$emit('clickoutside', false)
		}
	}
}
</script>