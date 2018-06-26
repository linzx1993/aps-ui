/**
 * Created by linzx on 2017/12/8.
 */
const NODE_KEY = "$treeNodeId";

/**
 * desc : 获得所有子元素的checked状态，根据所有子元素的checked状态改变父元素checked状态
 * @param childNodes: 所有子元素组成的数组
 * @returns {{all: boolean, none: boolean, allWithoutDisable: boolean, half: boolean}}
 */
const getChildState = childNodes => {
    let all = true; //是否全选
    let none = true;  //是否全空
    let allWithoutDisable = true;
    //遍历该node下所有子node
    for(let i = 0; i < childNodes.length;i++){
        const n = childNodes[i];
        //如果有一个没有选中，则在函数里面设置all为false，
        if(n.checked !== true || n.indeterminate){
            all = false;
            //判断没有选中是否是因为disable
            if(!n.disabled){
                allWithoutDisable = false;
            }
        }
        //只要有一个选择，则设置none为false
        if(n.checked !== false || n.indeterminate){
            none = false;
        }
    }
    //增加一个half状态，依靠all和none进行判断
    return {all,none,allWithoutDisable,half : !all && !none}
};

/**
 * desc : 重新初始化选中node的checked状态
 * @param node:需要重新改变checked的node
 */
const reInitChecked = function(node) {
    if (node.childNodes.length === 0) return;

    const {all, none, half} = getChildState(node.childNodes);
    if (all) {
        node.checked = true;
        node.indeterminate = false;
    } else if (half) {
        node.checked = false;
        node.indeterminate = true;
    } else if (none) {
        node.checked = false;
        node.indeterminate = false;
    }

    const parent = node.parent;
    if (!parent || parent.level === 0) return;

    if (!node.store.checkStrictly) {
        reInitChecked(parent);
    }
};

const getPropertyFromData = function(node, prop) {
    const props = node.store.props;
    const data = node.data || {};
    const config = props[prop];

    if (typeof config === 'function') {
        return config(data, node);
    } else if (typeof config === 'string') {
        return data[config];
    } else if (typeof config === 'undefined') {
        const dataProp = data[prop];
        return dataProp === undefined ? '' : dataProp;
    }
};

const markNodeData = function(node, data) {
    if (data[NODE_KEY]) return;
    Object.defineProperty(data, NODE_KEY, {
        value: node.id,
        enumerable: false,
        configurable: false,
        writable: false
    });
};

let nodeIdSeed = 0;

export default class Node {
    constructor(options){
        this.id = nodeIdSeed ++;
        this.text = null;
        this.checked = false;
        this.indeterminate = false;
        this.data = null;
        this.expanded = false;
        this.parent = null;
        this.visible = true;

        for (let name in options) {
            if (options.hasOwnProperty(name)) {
                this[name] = options[name];
            }
        }

        this.childNodes = [];
        this.level = 0;

        if (this.parent) {
            this.level = this.parent.level + 1;
        }

        //在storeMap中注册根节点
        const store = this.store;
        if (!store) {
          throw new Error('[Node]store is required!');
        }
        store.registerNode(this);

        //是否展开
        if(this.level > 0 && store.defaultExpandAll){
            this.expand();
        }
        if(this.data){
            this.setData(this.data);
        }
    }

    get key(){
        const nodeKey = this.store.key;
        if(this.data) return this.data[nodeKey];
        return null;
    }

    get disabled() {
        return getPropertyFromData(this, 'disabled');
    }

  /**
   * 展开车间
   * @param callback
   * @param expandParent  在展开某个子元素时，是否要展开其父元素
   */
    expand(callback, expandParent){
        if(expandParent){
            let parent = this.parent;
            //为了初始打开默认选择的车间时，同时打开父元素车间
            while (parent.level > 0){
                parent.expanded = true;
                parent = parent.parent;
            }
        }
        this.expanded = true;
        if(callback) callback();
    }

    //收缩车间
    collapse(){
        this.expanded = false;
    }

    /**
     * 改变选中状态
     * @param value:改变后的值
     * @param deep:是否继续向下改变子元素,true：是，false:不是
     * @param recursion:是否向上影响递归影响父元素
     * @param passValue
     */
    setChecked(value, deep , recursion, passValue){
        this.indeterminate = value === 'half';
        this.checked = value === true;

        if (!deep) return;

        if(deep){
            const childNodes = this.childNodes;
            for(let i = 0; i < childNodes.length; i++){
                const child = childNodes[i];
                const isChecked = child.disabled ? child.checked : value;
                child.setChecked(isChecked,true);
            }
            const {all,half} = getChildState(childNodes);
            if(!all){
                this.checked = all;
                this.indeterminate = half;
            }
        }

        //影响父元素
        const parent = this.parent;
        if(!parent || parent.level === 0) return;
        if (!recursion) {
            reInitChecked(parent);
        }
    }

    setData(data){
        if(!Array.isArray(data)){
            markNodeData(this, data);
        }
        this.data = data;
        this.childNodes = [];

        let children;
        if(this.level === 0 && this.data instanceof Array){
            children = this.data;
        }else{
            children = getPropertyFromData(this, 'children') || [];
        }


        for (let i = 0, j = children.length; i < j; i++) {
            this.insertChild({ data: children[i] });
        }
    }

    insertChild(child,index){
        if (!child) throw new Error('insertChild error: child(params) is required.');

        if(!(child instanceof Node)){
            Object.assign(child,{
                parent : this,
                store : this.store
            });
            child = new Node(child);
        }

        child.level = this.level + 1;

        if(typeof index === 'undefined' || index < 0){
            this.childNodes.push(child);
        }else{
            this.childNodes.splice(index, 0, child);
        }
    }

    getChildren(){
        const data = this.data;
        if (!data) return null;

        const props = this.store.props;
        let children = 'children';

        if(props){
            children = props.children || 'children';
        }

        if(data[children] === undefined){
            data[children] = null;
        }

        return data[children];
    }

    //根据数据渲染新的子节点
    updateChildren(){
        const newData = this.getChildren() || [],
            oldData = this.childNodes.map(node => node.data);

        const newDataMap = {};
        const newNodes = [];

        newData.forEach((item,index) => {
            if(item[NODE_KEY]){
                newDataMap[item[NODE_KEY]] = {index,data : item};
            }else{
                newNodes.push({ index, data: item });
            }
        });

        //如果老的子对象数据中没有新对象
        oldData.forEach(item => {
            if (!newDataMap[item[NODE_KEY]]) this.removeChildByData(item);
        });

        newNodes.forEach(({ index, data }) => {
            this.insertChild({ data }, index);
        });

    }
}

