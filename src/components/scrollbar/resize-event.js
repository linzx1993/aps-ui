const isServer = typeof window === 'undefined';

const attachEvent = isServer ? {} : document.attachEvent;
/**
 * Created by linzx on 2018/1/30.
 */
const requestFrame = (function () {
    if(isServer) return;
    const raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
        function (fn) {
            return window.setTimeout(fn,20);
        };

    return function (fn) {
        return raf(fn);
    }

})();
function raf(){
    return raf()
}

const cancelFrame = (function () {
    if (isServer) return;
    const cancel = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.clearTimeout;

    return function (id) {
        return cancel(id)
    }
})();

const resetTrigger = function (element) {
    console.log(45678);
    const trigger = element.__resizeTrigger__;
    const expand = trigger.firstElementChild;
    const contract = trigger.lastElementChild;
    const expandChild = expand.firstElementChild;

    contract.scrollLeft = contract.offsetWidth;
    contract.scrollTop = contract.offsetHeight;
    expandChild.style.width = expand.offsetWidth + 1 + 'px';
    expandChild.style.height = expand.offsetHeight + 'px';
    expand.scrollLeft = expand.scrollWidth;
    expand.scrollTop = expand.scrollHeight;
};

const checkTrigger = function (element) {
    return element.offsetWidth !== element.__resizeLast__.width || element.offsetHeight !== element.__resizeLast__.height;
};

const scrollListener = function (event) {
  console.log(99999999);
    resetTrigger(this);
    if (this.__resizeRAF__) cancelFrame(this.__resizeRAF__);
    this.__resizeRAF__ = requestFrame(() => {
        if(checkTrigger(this)){
            this.__resizeLast__.width = this.offsetWidth;
            this.__resizeLast__.height = this.offsetHeight;
            this.__resizeListeners__.forEach(fn => {
                fn.call(this,event);
            })
        }
    })
}

export const addResizeListener = function (element, fn) {
    if(isServer) return;
    if(attachEvent){
        element.attachEvent("onresize",fn);
    } else {
        if(!element.__resizeTrigger__){
            if(getComputedStyle(element).position === 'static'){
                element.style.position = "relative";
            }

            element.__resizeLast__ = {};
            element.__resizeListeners__ = [];

            const resizeTrigger = element.__resizeTrigger__ = document.createElement("div");
            resizeTrigger.className = "resize-triggers";
            resizeTrigger.innerHTML = '<div class="expand-trigger"><div></div></div><div class="contract-trigger"></div>';
            element.appendChild(resizeTrigger);

            resetTrigger(element);
            element.addEventListener("scroll",scrollListener,true);
        }
        element.__resizeListeners__.push(fn);
    }
};
