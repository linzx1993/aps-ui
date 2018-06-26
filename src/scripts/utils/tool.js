/**
 * name : tool.js
 * version : 0.0.1
 * des : 公共小工具集合
 * Created by linzx on 2017/6/24.
 */
(function (w, u) {
  w.t = {
      init(){

      },
      /**
       * 判断传入对象的类型
       * *time:2017-03-24
       * @params object :待验证数据
       * @return 返回object的type  Boolean Number String Function Array Date RegExp Object Error,null,Undefined
       */
      typeObject: function (obj) {
        return Object.prototype.toString.call(obj).slice(8, -1);
      },

      /**
       * 判断是否为空对象
       * @return{Object} true：表示空对象，false不为空对象
       */
      isEmptyObject: function (obj) {
        if (this.typeObject(obj) === "Object") {
          for (let i in obj) {
            return false
          }
          return true
        } else {
          return false;
        }
      },
      /**
       * 获取url中各个参数的值
       * @param key ：获取的参数名
       * @return value 获取的参数值
       */
      getUrlParams(key){
        let url = window.location.search; //获取url中"?"符后的字串
        let theRequest = {};
        if (url.indexOf("?") !== -1) {
          const str = url.substr(1);
          const paramsList = str.split("&");
          for(let i = 0; i < paramsList.length; i ++) {
            theRequest[paramsList[i].split("=")[0]] = paramsList[i].split("=")[1];
          }
        }
        return theRequest[key];
      },
      /**
       * 传入任何时间格式或者错误日期（2017-06-45），将时间输出为2017-07-15的时间格式
       * time:2017-06-21
       * last : linzx
       * @param date
       * @returns string 2017-07-15
       */
      getCorrectDate(date) {
        const currentTime = date ? new Date(date) : new Date();
        const month = (currentTime.getMonth() + 1) < 10 ? "0" + (currentTime.getMonth() + 1) :(currentTime.getMonth() + 1);
        const day = currentTime.getDate() < 10 ? "0" + currentTime.getDate() :currentTime.getDate();
        return currentTime.getFullYear() + "-" + month + "-" + day;
      },

      /**
       * desc:查询某个月有几天
       * time:2017-06-21
       * last : linzx
       * @param: month ：查询的年月份
       * @return: number 查询那个月的天数 0-31
       **/
      getMonthDays(date) {
        const curDate = new Date(date || new Date());
        const curMonth = curDate.getMonth();
        curDate.setMonth(curMonth + 1);
        /* 将日期设置为0, 这里为什么要这样设置, 我不知道原因, 这是从网上学来的 */
        curDate.setDate(0);
        /* 返回当月的天数 */
        return curDate.getDate();
      },
      /**string转date
       *
       * @param 时间字符串（2016-01-01）
       * @returns 时间对象
       */
      stringToDate(str) {
          return str === undefined ? undefined : new Date(str.replace(/-/g, "/"));
      },
      /**date转string
       *
       * @param date:时间对象
       * @returns 时间字符串（2016-01-01）
       */
      dateToString(date) {
          date = new Date(date);
          var year = date.getFullYear();
          var month = date.getMonth() + 1;
          if(month < 10) {
              month = "0" + month;
          }
          var day = date.getDate();
          if(day < 10) {
              day = "0" + day;
          }
          return year + "-" + month + "-" + day;
      },
      /**
       * desc:小数转指定位数的百分数
       * time:2017-08-31
       * last : duww
       * @param: decimal ：需要进行操作的小数
       * @param: length ：保留的位数
       * @return: number 查询那个月的天数 0-31
       **/
      decimalToPercentage(decimal, length = 0){
          if(!decimal && decimal !== 0){
              return
          }
          return (decimal * 100).toFixed(length) + "%";
      },
      /**
       * desc:小数转指定位数的百分数
       * time:2017-08-31
       * last : duww
       * @param: decimal ：需要进行操作的小数
       * @param: length ：保留的位数
       * @return: number 查询那个月的天数 0-31
       **/
      decimalToPercentage(decimal, length = 0){
          if(!decimal && decimal !== 0){
              return
          }
          return (decimal * 100).toFixed(length) + "%";
      },
      /**
       * desc:表单序列化
       * time:2017-12-05
       * last : linzx
       * @param: elem ：表单序列化的form元素
       * @param: option ：{disabled : false}过滤选项
       * @return: {name : value}
       **/
      serializeObject(form,option = {}){
          let objFormData = {};
          [].forEach.call(form.elements,function (ele) {
              let type = ele.type.toLowerCase(),disabled = ele.disabled;
              let name = ele.name,value = encodeURIComponent(ele.value || "on");

            if(!name || !type || (/^reset|submit|image&/).test(type) || ((/^radio$/.test(type) && !ele.checked))) return;
              if(option.disabled && ele.disabled)return;  //是否要过滤disabled

              if(type === "checkbox"){
                  objFormData[name] = ele.checked;
              }else{
                  objFormData[name] = value;
              }
          });
          return objFormData;
      },
      /**
      * desc:根据传入的背景色，返回对应的字体颜色
      * time:2017-04-25
      * @return: 字体颜色
      **/
      getTextColor(backgroundColor){
          if(backgroundColor.length>10){
              return "#000000";
          }
          let threshold = 128;
          let r = parseInt(backgroundColor.substring(1,3),16) * 0.3;
          let g = parseInt(backgroundColor.substring(3,5),16) * 0.59;
          let b = parseInt(backgroundColor.substring(5,7),16) * 0.11;
          let rgb = r + g + b;
          if (rgb > threshold)
          {
              return "#000000";
          }else{
              return "#FFFFFF";
          }
      },
      /**
      * desc:返回一个随机色（有一定特殊性，不是全颜色随机）
      * time:2017-04-16
      * @return: 随机色
      **/
      getSpecialColor(){
          //R、G、B只取间隔值，保证颜色不相近
          let thisR = (Math.floor(Math.random()*8)*2).toString(16) + "",
              thisG = (Math.floor(Math.random()*8)*2).toString(16) + "",
              thisB = (Math.floor(Math.random()*8)*2).toString(16) + "",
              thisC = (Math.floor(Math.random()*16)).toString(16) + "";

          return "#"+thisR+thisC+thisG+thisC+thisB+thisC;
      },
      /**
       * 浏览器及其版本号检测方法
       *
       * @return{Object} 返回浏览器，和版本号组成的对象。
       */
      getBrowser(){
          let rMsie = /(msie\s|trident\/7)([\w\.]+)/;
          let rTrident = /(trident)\/([\w.]+)/;
          let rFirefox = /(firefox)\/([\w.]+)/;
          let rOpera = /(opera).+version\/([\w.]+)/;
          let rNewOpera = /(opr)\/(.+)/;
          let rChrome = /(chrome)\/([\w.]+)/;
          let rSafari = /version\/([\w.]+).*(safari)/;
          let ua = navigator.userAgent.toLowerCase();
          let matchBS, matchBS2;

          matchBS = rMsie.exec(ua);
          if(matchBS !== null) {
              if(matchBS[1].trim() === "msie") {
                  switch(matchBS[2]) {
                      case "10.0":
                          return {
                              browser: "IE",
                              version: "10"
                          };
                          break;
                      case "9.0":
                          return {
                              browser: "IE",
                              version: "9"
                          };
                          break;
                      case "8.0":
                          return {
                              browser: "IE",
                              version: "8"
                          };
                          break;
                      case "7.0":
                          return {
                              browser: "IE",
                              version: "7以下"
                          };
                      break;
                  }
              } else {
                  return {
                      browser: "IE",
                      version: "11"
                  }
              }
          }
          matchBS = rFirefox.exec(ua);
          if((matchBS !== null) && (!(window.attachEvent)) && (!(window.chrome)) && (!(window.opera))) {
            return {
              browser: matchBS[1] || "",
              version: matchBS[2] || "0"
            };
          }
          matchBS = rOpera.exec(ua);
          if((matchBS !== null) && (!(window.attachEvent))) {
            return {
              browser: matchBS[1] || "",
              version: matchBS[2] || "0"
            };
          }
          matchBS = rChrome.exec(ua);
          if((matchBS !== null) && (!!(window.chrome)) && (!(window.attachEvent))) {
            matchBS2 = rNewOpera.exec(ua);
            if(matchBS2 == null) {
              return {
                browser: matchBS[1] || "",
                version: matchBS[2] || "0"
              };
            } else {
              return {
                browser: "Opera",
                version: matchBS2[2] || "0"
              };
            }
          }
          matchBS = rSafari.exec(ua);
          if((matchBS !== null) && (!(window.attachEvent)) && (!(window.chrome)) && (!(window.opera))) {
            return {
              browser: matchBS[2] || "",
              version: matchBS[1] || "0"
            };
          }

      },
  };
  "Boolean|Number|String|Function|Array|Date|RegExp|Object|Error".split("|").forEach(function (item) {
    w.t["is" + item] = function (obj) {
          return {}.toString.call(obj) === "[object " + item + "]";
      }
  });
})(window);
