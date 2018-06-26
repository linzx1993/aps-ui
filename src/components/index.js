/**
 * Created by linzx on 2018/5/30.
 */
'use strict'
import apsSelect from "./apsSelect/apsSelect.vue"
// import cascader from  "./components/cascader/cascader.vue"
// import table from  "./components/table/table.vue"
// import tree from  "./components/tree/tree.vue"
// import scrollbar from  "./components/scrollbar/bar.vue"

// import Message from '../packages/message/index.js'

const components = [apsSelect]

const install = function (Vue, opts = {}) {
    components.map(component => {
        Vue.component(component.name, component)
    })

    // Vue.prototype.$message = Message
}

if( typeof window !== undefined && window.Vue) {
    install(window.Vue)
}

export default {
    version: '0.0.1',
    install,
    apsSelect,
}