webpackJsonp([4],{

/***/ 256:
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

  get_schedule_task_detail: ['http://' + api_domain + '/api/history/schedule/', '/detail']

};

/* harmony default export */ __webpack_exports__["default"] = (url);

/***/ })

},[256]);
//# sourceMappingURL=url.1424f74b7f8daf530e9f.js.map