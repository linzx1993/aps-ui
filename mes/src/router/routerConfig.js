import Vue from 'vue'
import Router from 'vue-router'
import index from "../components/index.vue"
import pageSelect from "../components/page.vue"
import predictionOEE from "../components/predictionOEE/predictionOEE.vue"
import reScheduleReason from "../components/reScheduleReason/reScheduleReason.vue"

Vue.use(Router);

export default new Router({
  routes: [
      {
          path: '/',
          name: 'pageSelect',
          component: pageSelect,
      },
      {
          path: '/index/:id',
          name: 'index',
          component: index,
          children :[
              {
                path: '/',
                name: 'predictionOEE',
                component: predictionOEE
              },
              {
                  path: '/predictionOEE',
                  name: 'predictionOEE',
                  component: predictionOEE
              },
              {
                  path: '/reScheduleReason',
                  name: 'reScheduleReason',
                  component: reScheduleReason
              }
          ]
      },
  ]
})
