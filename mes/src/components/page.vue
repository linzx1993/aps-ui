<template>
  <div id="page">
      <header class="page-title"><img src="../assets/app-logo.png" alt="">RT-APS数据分析平台</header>
      <main>
          <nav>
              <ul>
                  <li class="page-select-li predict">
                      <router-link to="../predictionOEE">
                          <img src="../assets/predict.png" alt="">
                          预测设备利用率
                      </router-link>
                  </li>
                  <li class="page-select-li re-schedule">
                      <router-link to="../reScheduleReason">
                          <img src="../assets/re-schedule.png" alt="">
                          排程原因分析
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
  #page{
      position: absolute;
      top: 50%;
      transform: translateY(-100%);
      width: 100%;
      color: #fff;
      font-size: 20px;
      .page-title{
          margin: 0 auto 30px;
          display: flex;
          width: 1000px;
          align-items: center;
          img{
            margin-right: 30px;
            width: 184px;
            height: 50px;
          }
      }
      main{
          width: 1000px;
          margin: 0 auto;
          ul{
              display: flex;
              justify-content: space-between;
          }
      }
      .page-select-li{
          width: 280px;
          height: 200px;
          padding-top: 40px;
          text-align: center;
          box-sizing: border-box;
          a{
              color: inherit;
              font-size: inherit;
          }
          &.predict{
              background-color: #d9ac69;
           }
          &.re-schedule{
              background-color: #a7c8b9;
           }
          &.add{
               padding-top: 0;
               background-color: #ccc;
              a{
                font-size: 200px;
                line-height: 150px;
              }
          }
          img{
              display: block;
              margin: 0 auto 30px;
          }
      }
  }
</style>
