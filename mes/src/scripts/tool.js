/**
 * Created by linzx on 2017/6/24.
 */
export default {
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
        return currentTime.getFullYear() + "-" + (currentTime.getMonth() + 1) + "-" + currentTime.getDate();
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
    }
}
