<template>
    <div id="index">
        <div class="header">
            <img class="logo" src="../asserts/logo.png" alt="logo" title="浙江力太科技有限公司">
            <a class="sign-out" href="javascript:void(0);">退出</a>
        </div>
        <div class="mes-container relative">
            <div class="relative left-nav left-nav-expand" v-show="isExpand">
                <h3 class="left-nav-title"><router-link to="../pageSelect">数据分析</router-link></h3>
                <nav>
                    <ul>
                        <li :class="activeLi ==='predictionOEE' ? 'active' : ''"><router-link to="/predictionOEE">预测设备利用率</router-link></li>
                        <li v-if="devEnvironment" :class="activeLi ==='reScheduleReason' ? 'active' : ''"><router-link to="/reScheduleReason">排程原因分析</router-link></li>
                        <li v-if="devEnvironment" :class="activeLi ==='planRate' ? 'active' : ''"><router-link to="/planRate">计划执行进度</router-link></li>
                        <li v-if="devEnvironment" :class="activeLi ==='deliveryReply' ? 'active' : ''"><router-link to="/deliveryReply">交期答复</router-link></li>
                        <li v-if="devEnvironment" :class="activeLi ==='materialWarn' ? 'active' : ''"><router-link to="/materialWarn">缺料预警</router-link></li>
                        <li v-if="devEnvironment" :class="activeLi ==='stockAnalysis' ? 'active' : ''"><router-link to="/stockAnalysis">预测自制件库存走势</router-link></li>
                    </ul>
                </nav>
            </div>
          <div class="relative left-nav left-nav-collapse" v-show="!isExpand">
              <h3 class="left-nav-title" title="数据分析"><router-link to="../pageSelect"><i class="left-nav-icon icon-index"></i></router-link></h3>
              <nav>
                  <ul>
                      <li title="预测设备利用率" :class="activeLi ==='predictionOEE' ? 'active' : ''">
                          <!--<el-tooltip class="item" effect="dark" content="预测设备利用率" placement="right-start">-->
                              <router-link to="/predictionOEE"><i class="left-nav-icon icon-predict"></i></router-link>
                          <!--</el-tooltip>-->
                      </li>
                      <li title="排程原因分析" :class="activeLi ==='reScheduleReason' ? 'active' : ''">
                          <!--<el-tooltip class="item" effect="dark" content="排程原因分析" placement="right-start">-->
                              <router-link to="/reScheduleReason"><i class="left-nav-icon icon-re-schedule"></i></router-link>
                          <!--</el-tooltip>-->
                      </li>
                      <li title="计划执行进度" :class="activeLi ==='planRate' ? 'active' : ''"><router-link to="/planRate"><i class="left-nav-icon icon-plan-rate"></i></router-link></li>
                      <li title="交期答复" :class="activeLi ==='deliveryReply' ? 'active' : ''"><router-link to="/deliveryReply"><i class="left-nav-icon icon-delivery-reply"></i></router-link></li>
                      <li title="缺料预警" :class="activeLi ==='materialWarn' ? 'active' : ''"><router-link to="/materialWarn"><i class="left-nav-icon icon-material-warning"></i></router-link></li>
                      <li title="预测自制件库存走势" :class="activeLi ==='stockAnalysis' ? 'active' : ''"><router-link to="/stockAnalysis"><i class="left-nav-icon icon-stock-analysis"></i></router-link></li>
                  </ul>
              </nav>
          </div>
          <div class="toggle-expand-box">
              <span class="toggle-expand-btn collapse" v-show="isExpand" @click="collapseLeftNav"></span>
              <span class="toggle-expand-btn expand" v-show="!isExpand" @click="expandLeftNav"></span>
          </div>
          <div class="right-content">
              <router-view></router-view>
          </div>
        </div>
    </div>
</template>
<script>
    export default {
        data(){
            return {
                isExpand : false
            }
        },
        computed: {
            activeLi(){
                return this.$route.name;
            }
        },
        methods : {
            collapseLeftNav(){
                this.isExpand = false;
            },
            expandLeftNav(){
                this.isExpand = true;
            }
        }
    }
</script>
<style rel="stylesheet/scss" lang="scss">
      @import "../styles/resetStyle.scss";
      #index{
          height: 100%;
      }
      .mes-container{
          display: flex;
          height: calc(100% - 68px);
      }
      .right-content{
          flex : 1 0;
          padding: 20px;
          background-color: #eaedf1;
          box-sizing: border-box;
		  overflow: hidden;

          .el-breadcrumb{
                font-size: 16px;
          }
      }
      .right-content-box{
          padding: 20px;
          height: 100%;
          overflow: auto;
          background-color: #fff;
          border: 1px solid $borderColor;
          box-sizing: border-box;
      }
</style>
