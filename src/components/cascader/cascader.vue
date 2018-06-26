<template>
	<span
		class="aps-cascader"
		:class="{
			'cascader-avtive': menusShow
		}"
		v-clickoutside="handleClickoutside">
		<span
			class="aps-cascader-main"
			@click="showMenus()">
			<input
				class="aps-cascader-input"
				type="text"
				placeholder="请选择"
				v-model="checkedShow"
				:title="checkedShow"
				readonly>
		</span>
		<div
			class="aps-cascader-menus"
			v-show="menusShow">
			<div
				class="aps-cascader-placeholder"
				v-if="noData">
				暂无数据
			</div>
			<ul v-for="list in cascaderData">
				<li
					v-for="item in list"
					:nodeId="item.id"
					:title="item.showText"
					:class="{
						'cascader-li-disabled': item.disabled,
						'cascader-li-haschild': item.hasChild,
						'cascader-li-expansion': item.expansion
					}"
					@mouseenter="liHover(item)">
					<label>
						<i
							:class="{
								'select-some': item.selectState === 'selectSome',
								'select-no': item.selectState === 'selectNo'
							}"></i>
						<input
							type="checkbox"
							:disabled="item.disabled"
							v-model="item.checked"
							@change="liClick(item)">
						<span>{{item.showText}}</span>
					</label>
				</li>
			</ul>
		</div>
	</span>
</template>

<script>
import Clickoutside from 'element-ui/src/utils/clickoutside';

export default{
	name: 'apsCascader',

	directives: {
		Clickoutside
	},

	data () {
		return {
			cascaderData: [],
			allNodes: {},
			checkedNodeArr: [],
			menusShow: false,
			checkedShow: '',
			divPlaceholder: '暂无数据',
			noData: true
		}
	},

	props: [
		'options',
		'disabled',
		'showText',
		'id',
		'children'
	],

	watch: {
		'options': {
			handler: function (val, oldVal) {
				if(!val || $.isEmptyObject(val) || val.length === 0){
					this.noData = true;
					return;
				}else{
					this.noData = false;
				}
				//重置遍历对象
				this.cascaderData = [];
				/*构造下拉框数据*/
				let _this = this,
					thisOptions = val,
					allNodes = {},
					thisShowText = this.showText || 'showText',
					thisId = this.id || 'id',
					thisChildren = this.children || 'children',
					thisDisabled = this.disabled || 'disabled',
					repeatData = [],
					allCheckedShow = [],
					deepIndex = 0;
				//入口函数
				return (()=>{
					//遍历获取所有节点，及其下属节点
					getAllNodes(this.options, deepIndex);

					//显示选中
					this.checkedShow = allCheckedShow;

					//所有节点
					this.allNodes = allNodes;
					//获取第一层（打开时默认展示的内容）
					getFirstData(this.options);
				})();

				/**
				 * desc:遍历获取所有节点
				 * time:2017-06-26
				 * author:dww
				 * last:dww
				 * @param: nodes:节点
				 * @param: deep:深度
				 * @param: parentId:父节点id
				 **/
				function getAllNodes(nodes, deep, parentId){
					//深度
					let thisDeep = ++deep,
						selectAll = true,
						selectSome = false;
					//遍历当层节点
					for (let node in nodes){
						let thisNode = nodes[node];

						//增加遍历信息
						thisNode.showText = thisNode[thisShowText];
						thisNode.id = thisNode[thisId] || thisNode.showText;
						thisNode.disabled = thisNode[thisDisabled];
						thisNode.checked = !thisNode.disabled;
						thisNode.deepIndex = thisDeep;
						thisNode.parentId = parentId;

						if(thisNode.checked){
							allCheckedShow.push(thisNode.showText);
						}

						
						//保存到全部节点对象
						allNodes[thisNode[thisId]] = thisNode;
						repeatData.push(thisNode);

						//如果还有下一层
						if(!$.isEmptyObject(thisNode[thisChildren])){
							thisNode.hasChild = true;
							thisNode.children = thisNode[thisChildren];
							thisNode.selectState = getAllNodes(thisNode[thisChildren], thisDeep, thisNode.id)
						}else{
							thisNode.selectState = thisNode.checked ? '' : "selectNo";
						}
						
						selectAll = selectAll && !thisNode.selectState;
						selectSome = selectSome || thisNode.selectState !== "selectNo";
					}
					return selectAll ? "" : (selectSome ? "selectSome" : "selectNo");
				}

				/**
				 * desc:获取第一层
				 * time:2017-06-27
				 * author:dww
				 * last:dww
				 * @param: nodes:节点
				 **/
				function getFirstData(nodes){
					let firstData = [];

					//遍历
					for (let node in nodes){
						firstData.push(nodes[node]);
					}

					//绑定给页面
					_this.cascaderData.push(firstData);
				}
			},
		}
	},

	methods: {
		/**
		 * desc:li的hover，打开下一层
		 * time:2017-06-27
		 * author:dww
		 * last:dww
		 * @param: node:hover的节点
		 **/
		liHover: function(node) {
			let nextLeave = node.children,
				thisDeep = node.deepIndex,
				nextRepeat = [],
				repeatLength = this.cascaderData.length,
				allNodes = this.allNodes;

			//清除之后的展开情况
			for(let nodeId in allNodes){
				let thisNode = allNodes[nodeId];

				//深度比这个浅的，无操作
				if(thisNode.deepIndex < thisDeep){continue;}

				thisNode.expansion = false;
			}
			
			//如果该节点的深度小于cascaderData的长度
			if(thisDeep < repeatLength){
				this.cascaderData.splice(thisDeep,repeatLength);
			}

			//如果有下一级
			if(node.hasChild){
				//当前节点展开
				node.expansion = true;
				for(let i in nextLeave){
					nextRepeat.push(nextLeave[i]);
				}
				this.cascaderData.push(nextRepeat);
			}
		},

		/**
		 * desc:li的click，向上反选，向下全选或全不选
		 * time:2017-06-27
		 * author:dww
		 * last:dww
		 * @param: node:click的节点
		 **/
		liClick: function(node) {

			let	_this = this,
				thisNodeState = node.checked,
			 	thidNodeParentId = node.parentId,
				nextNodes = node.children;

			node.selectState = thisNodeState ? "" : "selectNo";

			//所有子孙节点统一状态
			changeChildrenState(nextNodes);

			//影响父祖节点
			changeParentsState(thidNodeParentId);

			function changeChildrenState(nodes){
				for(let nodeId in nodes){
					let thisNode = nodes[nodeId];
					if(!thisNode.disabled){
						thisNode.checked = thisNodeState;
						thisNode.selectState = thisNodeState ? "" : "selectNo";
					}
					//如果有子
					if(thisNode.children){
						changeChildrenState(thisNode.children);
					}
				}
			}

			//只需要检查直属父祖节点
			function changeParentsState(parentId){
				if(!parentId){
					return;
				}
				let thisParentNode = _this.allNodes[parentId],
					thisParentChildren = thisParentNode.children;

				//如果不可选，直接返回(暂时注释，状态可以帮助确认子节点的状态)
//				if(thisParentNode.disabled){
//					return;
//				}

				thisParentNode.checked = true;
				let selectAll = true,
					selectSome = false;
				//遍历
				for(let children in thisParentChildren){
					thisParentNode.checked = thisParentNode.checked && thisParentChildren[children].checked;
					selectAll = selectAll && !thisParentChildren[children].selectState;
					selectSome = selectSome || thisParentChildren[children].selectState !== "selectNo";
				}

				thisParentNode.selectState = selectAll ? "" : (selectSome ? "selectSome" : "selectNo");

				//如果还有父节点
				if(thisParentNode.parentId){
					changeParentsState(thisParentNode.parentId);
				}

				//v-model未更新，重调hover事件刷新下拉框
				_this.liHover(thisParentNode);
			}

			//v-model未更新，重调hover事件刷新下拉框
			this.liHover(node);

			//更新已选
			this.refreshCheckedNode();
		},

		/**
		 * desc:刷新已选，提交上级
		 * time:2017-06-28
		 * author:dww
		 * last:dww
		 **/
		refreshCheckedNode: function(){
			let allNodes = this.allNodes,
				allChecked = [],
				allCheckedShow = [];

			for(let nodeId in allNodes){
				if(allNodes[nodeId].checked && !allNodes[nodeId].disabled){
					allChecked.push(allNodes[nodeId].id);
					allCheckedShow.push(allNodes[nodeId].showText)
				}
			}
			this.checkedNodeArr = allChecked;
			this.checkedShow = allCheckedShow;
			this.$emit("input", this.checkedNodeArr);
		},

		/**
		 * desc:打开下拉框
		 * time:2017-06-28
		 * author:dww
		 * last:dww
		 **/
		showMenus: function(){
			this.menusShow = !this.menusShow;
		},

		/**
		 * desc:关闭下拉框
		 * time:2017-06-28
		 * author:dww
		 * last:dww
		 **/
		handleClickoutside() {
		  this.menusShow = false;
		},
	},

	mounted (){
	}
}
</script>

<style rel="stylesheet/scss" lang="scss">
</style>
