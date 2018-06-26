<template>
    <div class="aps-tree"
    >
        <aps-tree-node
            v-for="child in root.childNodes"
            :key="getNodeKey(child)"
            :node="child"
            @node-expand="handleNodeExpand"
            @check-change="changeSelectLocation"
        ></aps-tree-node>
        <div class="aps-tree-empty-block" v-if="!data || data.length === 0">
            <span class="aps-tree-empty-text">{{emptyText}}</span>
        </div>
    </div>
</template>

<script>
    import apsTreeNode from "./apsTreeNode.vue"
    import TreeStore from "./treeStore.js"
    export default {
        name : "apsTree",
        components : {
            apsTreeNode
        },
        props : {
        	  data: Array,  //传入的整棵地点树的数据
            value : '',
            nodeKey: String,  //确认树节点唯一的标志
            emptyText: {
                type: String,
                default() {
                    return "无数据"
                }
            },
            checkStrictly : Boolean,  //是否父子联动
            defaultCheckedKeys: Array,  //默认选中
            defaultExpandedKeys: Array, //默认展开
            //展开子车间，是否要展开父车间
            autoExpandParent: {
              type: Boolean,
              default: true
            },
            //是否默认展开全部
            defaultExpandAll: {
              type: Boolean,
              default: false
            },
            props : {
        	  	  default(){
        	  	  	  return {
        	  	  	  	  children : 'children',
                        label: 'label',
                        icon: 'icon',
                        disabled: 'disabled'
                    }
                }
            }
        },
        data(){
            return {
                store : null,
                root : null,
            }
        },
        watch : {
            defaultCheckedKeys(n,o){
                this.store.setDefaultCheckedKey(n);
            },
            defaultExpandedKeys(n){
                this.store.defaultExpandedKeys = n;
                this.store.setDefaultExpandedKeys(n);
            },
            data(n){
            	  this.store.setData(n);
            },

        },
        methods : {
            changeSelectLocation(){
            },
            getNodeKey(node, index) {
                const nodeKey = this.nodeKey;
                if (nodeKey && node) {
//                	  console.log(node.data[nodeKey]);
                    return node.data[nodeKey];
                }
                return index;
            },
            handleNodeExpand(nodeData, node, instance){
                //该节点所对应的对象、节点对应的 Node、节点组件本身
                this.$emit('node-expand', nodeData, node, instance);
            },
            //设置单个节点
            setChecked(data,checked,deep){
                this.store.setChecked(data, checked, deep);
            },
            //批量设置节点
            setCheckedKeys(keys){
            	  if(!this.nodeKey) throw new Error("'[Tree] nodeKey is required in setCheckedKeys'");
            	  this.store.setCheckedKeys(keys);
            },
            //通过key值来获取节点
            getNode(key){
            	  return this.store.getNode({key : key});
            },
            getCheckedNodes(leafOnly) {
                return this.store.getCheckedNodes(leafOnly);
            },
            getCheckedKeys(leafOnly) {
                return this.store.getCheckedKeys(leafOnly);
            },
        },
        created(){
            // 确定根节点
            this.isTree = true;

            this.store = new TreeStore({
                key: this.nodeKey,
                data : this.data,
                props: this.props,
                checkStrictly: this.checkStrictly,
                defaultExpandedKeys: this.defaultExpandedKeys,
                defaultCheckedKeys: this.defaultCheckedKeys,
                autoExpandParent: this.autoExpandParent,
                defaultExpandAll: this.defaultExpandAll,
            });

            this.root = this.store.root;

            this.$on("check-change",function (data,checked) {
            	  if(this.checkStrictly){
                    this.$emit("input",data.locationId);
                    return;
                }
                let value = this.value.slice(0);
            	  let index = value.indexOf(data.locationId);
                if(index === -1){
                    value.push(data.locationId)
                } else {
                    value.splice(index,1)
                }
//                console.log(value);
                this.$emit("input",value);
            })
        },
    }
</script>
<style rel="stylesheet/scss" lang="scss">

</style>
