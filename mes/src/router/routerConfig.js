import Vue from 'vue'
import Router from 'vue-router'
import index from "../components/index.vue"
import pageSelect from "../components/page.vue"
import predictionOEE from "../components/predictionOEE/predictionOEE.vue"
import reScheduleReason from "../components/reScheduleReason/reScheduleReason.vue"
import planRate from "../components/planRate/planRate.vue"
import deliveryReply from "../components/deliveryReply/deliveryReply.vue"
import materialWarn from "../components/materialWarn/materialWarn.vue"
import stockAnalysis from "../components/stockAnalysis/stockAnalysis.vue"

Vue.use(Router);

export default new Router({
  routes: [
      {
          path: '/',
          name: 'pageSelect',
          component: pageSelect,
      },
      {
          path: '/pageSelect',
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
              {//预测OEE
                  path: '/predictionOEE',
                  name: 'predictionOEE',
                  component: predictionOEE
              },
              {//历史排程
                  path: '/reScheduleReason',
                  name: 'reScheduleReason',
                  component: reScheduleReason
              },
              {//计划执行进度
                  path: '/planRate',
                  name: 'planRate',
                  component: planRate
              },
              {//交期答复
                  path: '/deliveryReply',
                  name: 'deliveryReply',
                  component: deliveryReply
              },
              {//缺料预警
                  path: '/materialWarn',
                  name: 'materialWarn',
                  component: materialWarn
              },
              {
                  path: '/stockAnalysis',
                  name: 'stockAnalysis',
                  component: stockAnalysis
              }
          ]
      },
  ]
})
