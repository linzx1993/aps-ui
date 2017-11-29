<template>
  <div id="page">
      <header class="page-title">
        <img src="../asserts/app-logo.png" alt="">
        <h1>RT-APS数据分析平台</h1>
      </header>
      <main>
          <nav>
              <ul>
                  <li class="page-select-li predict">
                      <router-link to="../predictionOEE">
                          <img src="../asserts/predict.png" alt="">
                          <span class="page-select-li-words">预测设备利用率</span>
                      </router-link>
                  </li>
                  <li class="page-select-li re-schedule">
                      <router-link to="../reScheduleReason">
                          <img src="../asserts/re-schedule.png" alt="">
                          <span class="page-select-li-words">排程原因分析</span>
                      </router-link>
                  </li>
                  <li class="page-select-li plan-rate">
                      <router-link to="../planRate">
                          <img src="../asserts/planRate.png" alt="">
                          <span class="page-select-li-words">计划执行进度</span>
                      </router-link>
                  </li>
                  <li class="page-select-li delivery-reply">
                      <router-link to="../deliveryReply">
                          <img src="../asserts/deliveryReply.png" alt="">
                          <span class="page-select-li-words">交期答复</span>
                      </router-link>
                  </li>
                  <li class="page-select-li material-warning">
                      <router-link to="../materialWarn">
                          <img src="../asserts/material-warning.png" alt="">
                          <span class="page-select-li-words">缺料预警</span>
                      </router-link>
                  </li>
                  <li class="page-select-li stock-analysis">
                      <router-link to="../stockAnalysis">
                          <img src="../asserts/stock-analysis.png" alt="">
                          <span class="page-select-li-words">预测自制件库存走势</span>
                      </router-link>
                  </li>
                  <li class="page-select-li add">
                      <a href="javascript:void (0);">+</a>
                  </li>
              </ul>
          </nav>
      </main>
  </div>
</template>

<script>
</script>
<style rel="stylesheet/scss" lang="scss">
@import "../styles/resetStyle.scss";

header {
  display: flex;
  align-items: center;
  img{
    margin: 2.5% 30px 0 2.5%;
  }
  h1{
    color: #fff;
    font-size: 16px;
  }
}

.page-select-li{
  a{
      padding: 20px 0;
      color: inherit;
      font-size: inherit;
  }
  &.predict{
      background-color: #d9ac69;
  }
  &.re-schedule{
      background-color: #a7c8b9;
  }
  &.plan-rate{
      background-color: #9ecbda;
  }
  &.delivery-reply{
      background-color: #e99e7f;
  }
  &.material-warning{
      background-color: #88abda;
  }
  &.stock-analysis{
      background-color: #c4ba9a;
  }
  &.add{
      padding-top: 0;
      background-color: #ccc;
      a{
          font-size: 200px;
          line-height: 100px;
      }
  }
  img{
      display: block;
      margin: 0 auto;
  }
  .page-select-li-words{
      margin-top: 20px;
  }
}
@media (min-width : 768px) {
    #page{
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 100%;
        color: #fff;
        font-size: 20px;
    }
    .page-title{
        margin: 0 auto 30px;
        display: flex;
        width: 70%;
        align-items: center;
    }
    main{
        width: 70%;
        margin: 0 auto;
        ul{
            display: flex;
            justify-content: flex-start;
            flex-wrap : wrap;
        }
    }
    .page-select-li{
        margin: 0 2.5% 80px;
        width: 20%;
        max-width: 270px;
        text-align: center;
        box-sizing: border-box;
    }
}

@media (max-width : 768px) {
    .page-select-li{
        width: 45%;
        margin: 2.5%;
        text-align: center;
        color: #fff;
    }
    #page ul{
        display: flex;
        flex-wrap: wrap;
    }
}
</style>
