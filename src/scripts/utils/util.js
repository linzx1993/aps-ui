/**
 * Created by linzx on 2018/1/2.
 */
export const generateId = function() {
  return Math.floor(Math.random() * 10000);
};

export const inBrowser = typeof window !== undefined;
const ieVersion =  Number(document.documentMode);
const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
const MOZ_HACK_REGEXP = /^moz([A-Z])/;

export const on = (function () {
  if(document.addEventListener){
      return function (element, event, handler) {
          if(element && event && handler){
              element.addEventListener(event,handler,false)
          }
      }
  }else{
      return function (element, event, handler) {
          if(element && event && handler){
              element.attachEvent(event,handler,false)
          }
      }
  }
})();

export const off = (function() {
    if (document.removeEventListener) {
        return function(element, event, handler) {
            if (element && event) {
                element.removeEventListener(event, handler, false);
            }
        };
    } else {
        return function(element, event, handler) {
            if (element && event) {
                element.detachEvent('on' + event, handler);
            }
        };
    }
})();

export const once = function (el, event, fn) {
    const listen = function () {
        if(fn){
            fn.apply(this,arguments);
        }
        off(el, event, fn)
    }
    on(el, event, fn);
};

const trim = function (string) {
    return string.replace(/^[\s\uFEFF]+ | [\s\uFEFF]+$/g,'')
};

export function hasClass(el,cls){
    if(!el || !cls) return;
    if(cls.indexOf(" ") !== -1) throw new Error('className should not contain space.');
    if(el.classList){
        return el.classList.contains(cls)
    }else{
        return el.className.indexOf(cls) !== -1;
    }
}

export function addClass(el,cls) {
    if (!el) return;
    let curClass = el.className;
    let classes = (cls || '').split(' ');

    for(let i = 0; i < classes.length; i++){
        let className = classes[i];
        if(!className) return;
        if(el.classList){
            el.classList.add(className);
        } else if(!hasClass(el,className)){
            curClass += " " + className;
        }
    }

    if(!el.classList) el.className = curClass;
}

export function removeClass(el,cls) {
    if(!el || !cls) return;
    let classes = cls.split(" ");
    let curClass = ' ' + el.className + ' ';

    for(let i = 0; i < classes.length; i++){
        let className = classes[i];
        if(el.classList){
            el.classList.remove(className);
        }else if(hasClass(el,className)){
            curClass = curClass.replace(' ' + clsName + ' ', ' ')
        }
    }

    if (!el.classList) {
        el.className = trim(curClass);
    }
}

//将横杆转化为驼峰命名
const camelCase = function(name) {
    return name.replace(SPECIAL_CHARS_REGEXP, function(_, separator, letter, offset) {
        return offset ? letter.toUpperCase() : letter;
    }).replace(MOZ_HACK_REGEXP, 'Moz$1');
};

export const getStyle = ieVersion < 9 ? function(element, styleName) {
    if(!inBrowser) return;
    if (!element || !styleName) return null;
    styleName = camelCase(styleName);
    if (styleName === 'float') {
        styleName = 'styleFloat';
    }
    try {
        switch (styleName){
          case 'opacity' :
            try {
                return element.filters.item('alpha').opacity / 100;
            } catch (e){
                return 1.0;
            }
        }
    } catch (e){
        return element.style[styleName]
    }
} : function (element, styleName) {
    if (isServer) return;
    if (!element || !styleName) return null;
    styleName = camelCase(styleName);
    if (styleName === 'float') {
        styleName = 'cssFloat';
    }

    try {
        let computed = document.defaultView.getComputedStyle(element, '');
        return element.style[styleName] || computed ? computed[styleName] : null;
    } catch(e) {
        return element.style[styleName];
    }
};

export const setStyle = function (element, styleName, value) {
    if (!element || !styleName) return;

    if(typeof styleName === 'object'){
        for(var prop in styleName){
            if (styleName.hasOwnProperty(prop)) {
                setStyle(element, prop, styleName[prop]);
            }
        }
    }else{
        styleName = camelCase(styleName);
        if (styleName === 'opacity' && ieVersion < 9) {
            element.style.filter = isNaN(value) ? '' : 'alpha(opacity=' + value * 100 + ')';
        } else {
            element.style[styleName] = value;
        }
    }
}

function extend(to, _from) {
  for (let key in _from) {
    to[key] = _from[key];
  }
  return to;
}

export function toObject(arr) {
  let res = {};
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i]);
    }
  }
  return res;
}

export const addResizeListener = function (element, fn) {
    if(document.attachEvent){
        element.attachEvent("onresize",fn)
    }else{

    }
}
