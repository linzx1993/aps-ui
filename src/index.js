/**
 * Created by linzx on 2018/5/29.
 */

'use strict'
import Vue from "vue"
import apsui from '@/components/index.js'
Vue.use(apsui)

// import引入scss 在打包阶段没有引入成功，推荐使用require来引入
require("@/styles/component.scss")
require("@/styles/reset.scss")
require("@/assets/fonts/icon.css")

import $http from "axios"
window.$http = $http

require("./components/index.js")

import index from "./pages/index.vue"

new Vue({
    el: "#app",
    template: '<index/>',
    components: {index },
})

