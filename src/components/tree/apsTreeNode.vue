<template>
    <div class="aps-tree-node"
        :class="{
	          'is-expanded': expanded,
	          'is-checked': !node.disabled && node.checked
        }"
        @click.stop="handleClick"
    >
        <div class="aps-tree-node-content">
            <el-checkbox
              v-model="node.checked"
              :disabled="!!node.data.disabled"
              :indeterminate="node.indeterminate"
              @change="handleCheckChange"
            ></el-checkbox>
            <span class="aps-tree-node-label"
                  @click="handleExpandIconClick">
                <i v-if="node.childNodes.length" class="aps-tree-node-icon"></i>{{node.data.label}}
            </span>
            <aps-tree-node
                v-for="child in node.childNodes"
                :key="getNodeKey(child)"
                :node="child"
                @node-expand="handleChildNodeExpand"
            ></aps-tree-node>
        </div>
    </div>
</template>

<script>
    export default {
        name : "apsTreeNode",
        props : {
            node: {
                default() {
                    return {};
                }
            },
        },
        data(){
        	  return {
                showCheckbox : true,
                checked : false,  //选中
                expanded : false,  //选中
                indeterminate : false,  //半选状态
            }
        },
        computed : {
            disabled(){
            	  return !!this.node.disabled;
            },
        },
        watch : {
            'node.checked'(val){
            	  this.handleSelectChange(val, this.node.indeterminate);
            }
        },
        methods : {
        	  /**
             * desc : 点击某个节点(该节点的任何位置)触发的回调
             **/
            handleClick(){
                const store = this.tree.store;
                store.setCurrentNode(this.node);
                this.tree.currentNode = this;
            	  this.tree.$emit("current-change",store.currentNode.data,store.currentNode)
            },
        	  /**
             * desc :监测到checked改变时，
             **/
            handleSelectChange(checked,indeterminate){
            	  if(this.oldChecked !== checked && this.oldIndeterminate !== indeterminate){
            	  	  this.tree.$emit("check-change",this.node.data,checked,indeterminate);
                }
            	  this.oldChecked = checked;
            	  this.indeterminate = indeterminate;
            },
            /**
             * desc :通过点击checked，发生状态发生触发的回调
             */
            handleCheckChange(value, ev){
            	  this.tree.$emit("current-checked",this.node.data,this.node);
            	  this.node.setChecked(ev.target.checked, !this.tree.checkStrictly);
            },
            setChecked(value, deep){
            	  if(deep){
            	  	  let children = this.children;
                    children.forEach(item => {
                    	  item.checked = value;
                    })
                }
            },
            handleExpandIconClick() {
                if (this.expanded) {
                    this.$emit('node-collapse', this.node.data, this.node, this);
                    this.expanded = false;
                } else {
                    this.expanded = true;
                    this.$emit('node-expand', this.node.data, this.node, this);
                }
            },
            handleChildNodeExpand(nodeData, node, instance){
              this.$emit('node-expand', nodeData, node, instance);
            },
            //
            getNodeKey(node, index){
            	  const nodeKey = this.nodeKey;
//                console.log(this.key);
//            	  if(nodeKey && node){
//            	  	  return node.data[nodeKey];
//                }
//            	  return index
            }
        },
        created(){
        	  //获得根元素，tree组件
        	  const parent = this.$parent;
        	  if(parent.isTree){
        	  	  this.tree = parent;
            }else{
                this.tree = parent.tree;
            }

            if (!this.tree) {
                console.warn('Can not find node\'s tree.');
            }

            //监测到子元素的数据发生变化，则更新地点树
            const props = this.tree.props || {};
            const childrenKey = props['children'] || 'children';
            this.$watch(`node.data.${childrenKey}`,function () {
                this.node.updateChildren();
            });

            if (this.node.expanded) {
                this.expanded = true;
            }
        },
        mounted(){
//          console.log(this.node);
//          console.log(this.key);
//          console.log(this.data);
        },
    }
</script>
<style rel="stylesheet/scss" lang="scss">

</style>
