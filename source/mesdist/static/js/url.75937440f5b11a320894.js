webpackJsonp([3],{

/***/ "nmOl":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });

var active = "daily_ued";
var api_domain = void 0,
    daily_test = void 0,
    local_test = void 0;

if (active === "product") {
   api_domain = "";
} else if (active === "daily_ued") {
   api_domain = "192.168.200.161:8080";


   daily_test = true;
} else if (active === "daily") {
   api_domain = "192.168.200.170:8080";
   daily_test = true;
} else if (active === "local_test") {
   api_domain = "";
   local_test = true;
} else if (active === "local") {
   api_domain = "127.0.0.1:8080";
} else {
   alert("配置错误，请指定正确的运行环境");
}
api_domain = window.api_domain || api_domain;

var url = {
   login_out: 'http://' + api_domain + '/api/aps/login/loginOut',

   'all_schedule_list': "http://" + api_domain + '/api/data/analysis/scheme/getAllSchemeInfo',

   'get_all_equipmentType': "http://" + api_domain + '/api/equipmentType/getAllEquipmentType',

   'get_all_equipment': "http://" + api_domain + "/api/production/getProductionUnit",

   'result_equipment_oee': "http://" + api_domain + '/api/data/analysis/forecastOEE/result',

   'temp_equipment_oee': "http://" + api_domain + '/api/data/analysis/forecastOEE/temp',

   'temp_equipmentList_by_equipmentType': "http://" + api_domain + '/api/data/analysis/forecastOEE/tmp/info',

   'result_equipmentList_by_equipmentType': "http://" + api_domain + '/api/data/analysis/forecastOEE/result/info',

   readable_location: 'http://' + api_domain + '/api/location/cache/readable',

   test_writable: 'http://' + api_domain + '/api/schedule/location',

   min_scheme_time: 'http://' + api_domain + '/api/data/analysis/TimeLine/get/time/line',

   get_all_schedule_person: 'http://' + api_domain + '/api/history/user/list',

   get_history_list: 'http://' + api_domain + '/api/history/reason/list',

   get_schedule_detail: 'http://' + api_domain + '/api/history/schedule/list',

   get_schedule_task_detail: ['http://' + api_domain + '/api/history/schedule/', '/detail'],

   get_play_type: 'http://' + api_domain + '/api/aps/setting/play_type',

   get_all_customer: 'http://' + api_domain + '/api/aps/customer/find/all/customer',

   get_material_name: 'http://' + api_domain + '/api/aps/material/find/material/by/name',

   get_material_code: 'http://' + api_domain + '/api/aps/material/find/material/by/code',

   get_plan_code: 'http://' + api_domain + '/api/aps/plan/rate/find/pool/code',

   get_order_rate: 'http://' + api_domain + '/api/aps/plan/rate/pool/order/rate',

   get_mo_rate: 'http://' + api_domain + '/api/aps/plan/rate/pool/mo/rate',

   order_delivery_reply: 'http://' + api_domain + '/api/aps/plan/rate/pool/order/plan/tmp/rate',

   mo_delivery_reply: 'http://' + api_domain + '/api/aps/plan/rate/pool/mo/plan/tmp/rate',

   mo_delivery_reply_colconfig: 'http://' + api_domain + '/api/aps/config/data/analysis/user/view/delivery/reply/pool/mo/report-column',

   order_delivery_reply_colconfig: 'http://' + api_domain + '/api/aps/config/data/analysis/user/view/delivery/reply/pool/order/report-column',

   mo_plan_rate_colconfig: 'http://' + api_domain + '/api/aps/config/data/analysis/user/view/plan/rate/pool/mo/report-column',

   order_plan_rate_colconfig: 'http://' + api_domain + '/api/aps/config/data/analysis/user/view/plan/rate/pool/order/report-column',

   material_warn_material: 'http://' + api_domain + '/api/data/analysis/material/warn/get/warn/by/material',

   material_warn_material_col_config: 'http://' + api_domain + '/api/aps/config/date/analysis/material/requirement/get/warn/by/material',

   material_warn_material_day: 'http://' + api_domain + '/api/data/analysis/material/warn/get/warn/material/by/day',

   material_warn_material_day_col_config: 'http://' + api_domain + '/api/aps/config/date/analysis/material/requirement/get/warn/material/by/day',

   material_warn_order: 'http://' + api_domain + '/api/data/analysis/material/warn/get/warn/material/num/by/order',

   material_warn_order_col_config: 'http://' + api_domain + '/api/aps/config/date/analysis/material/requirement/get/warn/material/num/by/order',

   material_warn_order_order: 'http://' + api_domain + '/api/data/analysis/material/warn/get/warn/by/order',

   material_warn_order_order_col_config: 'http://' + api_domain + '/api/aps/config/date/analysis/material/requirement/get/warn/by/order',

   material_warn_order_day: 'http://' + api_domain + '/api/data/analysis/material/warn/get/warn/order/by/day',

   material_warn_order_day_col_config: 'http://' + api_domain + '/api/aps/config/date/analysis/material/requirement/get/warn/order/by/day',

   set_material_concern: 'http://' + api_domain + '/api/data/analysis/material/warn/update/warn/level',

   delete_material_concern: 'http://' + api_domain + '/api/data/analysis/material/warn/delete/warn/level',

   set_warn_time: 'http://' + api_domain + '/api/data/analysis/material/warn/update/warn/time',

   search_warn_time: 'http://' + api_domain + '/api/data/analysis/material/warn/get/warn/time',

   delete_warn_time: 'http://' + api_domain + '/api/data/analysis/material/warn/delete/warn/time',

   get_excel_url: 'http://' + api_domain + '/api/aps/excel/post/excel/info',

   export_excel: 'http://' + api_domain + '/api/aps/excel/get/excel/by',

   delete_excel: 'http://' + api_domain + '/api/aps/excel/delete/excel/cache/by/',

   stock_analysis: 'http://' + api_domain + '/api/data/analysis/mo/inventory/plan/get/inventory/info',

   stock_column_config: 'http://' + api_domain + '/api/aps/config/data/analysis/user/view/mo/inventory/report-column',

   consider_mo_plan: 'http://' + api_domain + '/api/aps/config/date/analysis/mo/inventory/plan/consider/mo/plan/before/today',

   high_show_compare_Stock: 'http://' + api_domain + '/api/aps/config/date/analysis/mo/inventory/plan/mo/plan/show/config'
};

/* harmony default export */ __webpack_exports__["default"] = (url);

/***/ })

},["nmOl"]);
//# sourceMappingURL=url.75937440f5b11a320894.js.map