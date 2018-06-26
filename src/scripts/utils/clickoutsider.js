import Vue from "vue"
/**
 * Created by linzx on 2018/3/23.
 */
import { on } from './dom'

const nodeList = []
const ctx = '@@clickoutsideContext';

let startClick
let seed = 0

!Vue.prototype.$isServer && on(document, 'mousedown', e => (startClick = e));
!Vue.prototype.$isServer && on(document, 'mouseup', e => {
    nodeList.forEach(node => node[ctx].documentHandler(e,startClick));
});

function createDocumentHandle(el, binding, vnode) {
    return function (mouseup = {}, mousedown = {}) {
        if (
            !mouseup.target ||
            !mousedown.target ||
            !el.contains(mouseup.target) ||
            !el.contains(mousedown.target) ||
            el === mouseup.target
        ) return

        if(binding.expression && el[ctx.methodName] && vnode.context[el[ctx].methodName]){
            vnode.context[el[ctx].methodName]()
        } else {
            el[ctx].bindingFn && el[ctx].bindingFn()
        }
    }
}

export default {
    //vue提供的钩子的参数
    bind(el, binding, vnode){
        nodeList.push(el);
        const id = seed ++
        el[ctx] = {
            id,
            documentHandler: createDocumentHandle(el, binding, vnode),
            methodName: binding.expression,
            bindingFn: binding.value
        }
    },
    update(el, binding, vnode) {
        el[ctx].documentHandler = createDocumentHandle(el, binding, vnode)
        el[ctx].methodName = binding.expression
        el[ctx].bindingFn = binding.value
    },
    unbind (el) {
        let len = nodeList.length

        for(let i = 0; i < len; i++) {
            if(nodeList[i][ctx].id === el[ctx].id) {
                nodeList.splice(i,1)
                break
            }
        }
        delete el[ctx]
    }
};