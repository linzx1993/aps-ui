/**
 * Created by linzx on 2017/12/8.
 */
import Node from "./node";

export default class TreeStore{
    constructor(options){
        this.currentNode = null;
        this.currentNodeKey = null;

        for(let option in options){
            this[option] = options[option];
        }

        this.nodesMap = {};

        this.root = new Node({
            data : this.data,
            store : this
        });

        this._initDefaultCheckedNodes();
    }

    _initDefaultCheckedNodes(){
        const defaultCheckedKeys = this.defaultCheckedKeys || [];
        const nodesMaps = this.nodesMap;
        defaultCheckedKeys.forEach(key => {
            const node = nodesMaps[key];
            if(node){
                node.setChecked(true,!this.checkStrictly)
            }
        })
    }

    //监测到初始选中地点改变，重新渲染
    setDefaultCheckedKey(newVal){
        // if(newVal !== this.defaultCheckedKeys){
            this.defaultCheckedKeys = newVal;
            this._initDefaultCheckedNodes();
        // }
    }

    //初始展开地点树
    setDefaultExpandedKeys(keys){
        keys = keys || [];
        this.defaultExpandedKeys = keys;

        keys.forEach(key => {
            const node = this.getNode(key);
            if(node) node.expand(null,this.autoExpandParent);
        })
    }

    //注册
    registerNode(node){
        const key = this.key;
        if(!key || !node || !node.data) return;

        const nodeKey = node.key;
        if(nodeKey !== undefined) this.nodesMap[nodeKey] = node;
    }

    //注销
    deregisterNode(node){
        const key = this.key;
        if(!key || !node || !node.data) return;

        const childNodes = node.childNodes;
        for(let i = 0; i < childNodes.length; i++){
            const child = childNodes[i];
            this.deregisterNode(child);
        }

        //删除所有的子节点
        delete this.nodesMap[node.key];
    }

    //获取
    getNode(data){
        const key = typeof data === "object" ? data.key : data;
        return this.nodesMap[key];
    }

    //获取所有的节点
    _getAllNodes(){
        const allNodes = [];
        const nodesMap = this.nodesMap;
        for(let nodeKey in nodesMap){
            if(nodesMap.hasOwnProperty(nodeKey)){
              allNodes.push(nodesMap[nodeKey]);
            }
        }

        return allNodes;
    }

    //重新设置整棵地点树的数据
    setData(newVal){
        const rootChange = newVal !== this.root.data;
        this.root.setData(newVal);
        if(rootChange){
            this._initDefaultCheckedNodes();
        }
    }

    getCurrentNode() {
      return this.currentNode;
    }

    setCurrentNode(node) {
      this.currentNode = node;
    }

    //批量设置节点是否选中
    setCheckedKeys(keys){
        this.defaultCheckedKeys = keys;
        const key = this.key;
        const checkedKeys = {};
        keys.forEach(key => {
            checkedKeys[key] = true;
        });

        this._setCheckedKeys(key,checkedKeys)
    }

    //批量设置节点是否选中
    _setCheckedKeys(key,checkedKeys){
        const allNodes = this._getAllNodes().sort((a,b) => b.level - a.level);
        const cache = Object.create(null);
        const keys = Object.keys(checkedKeys);
        allNodes.forEach(node => node.setChecked(false, false));
        for(let i = 0,j = allNodes.length; i < j;i++){
            const node = allNodes[i];
            const nodeKey = node.data[key].toString();
            let checked = keys.indexOf(nodeKey) > -1;
            if(!checked){
                if(node.checked && cache[nodeKey]){
                    node.setChecked(false,false)
                }
                continue;
            }

            let parent = node.parent;
            while (parent && parent.level > 0) {
                cache[parent.data[key]] = true;
                parent = parent.parent;
            }
        }
    }

    //获得所有选中节点的key
    getCheckedKeys(leafOnly = false){
        const key = this.key;
        const allNodes = this._getAllNodes();
        const keys = [];
        allNodes.forEach(node => {
            if (node.checked) {
                keys.push((node.data || {})[key]);
            }
        });
        return keys;
    }

    //获得所有选中节点的Node层数据
    getCheckedNodes(){
        const checkedNodes = [];

        const traverse = function (node) {
            const childNodes = node.root ? node.root.childNodes : node.childNodes;

            childNodes.forEach(node => {
                if(node.checked){
                    checkedNodes.push(child.data);
                }

                traverse(node);
            })
        };

        traverse(this);
        return checkedNodes;
    }
}
