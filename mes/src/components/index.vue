<template>
    <div id="index">
        <div class="header">
            <img class="logo" src="../assets/logo.png" alt="logo" title="浙江力太科技有限公司">
            <a class="sign-out" href="javascript:void(0);">退出</a>
        </div>
        <div class="mes-container">
            <div class="left-nav">
                <!--<h3 class="left-nav-title">数据分析</h3>-->
                <h3 class="left-nav-title"><router-link to="../">数据分析</router-link></h3>
                <!--<el-row class="tac">-->
                <!--<el-col :span="24">-->
                <!--<el-menu default-active="2" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose" router>-->
                <!--<el-menu-item index="/predictionOEE"><i class="el-icon-message"></i>预测OEE</el-menu-item>-->
                <!--<el-menu-item index="2"><i class="el-icon-menu"></i>订单达成率</el-menu-item>-->
                <!--<el-menu-item index="3"><i class="el-icon-setting"></i>资源负荷率</el-menu-item>-->
                <!--</el-menu>-->
                <!--</el-col>-->
                <!--</el-row>-->
                <nav>
                    <ul>
                        <li><router-link to="/predictionOEE">预测设备利用率</router-link></li>
                      <!--<li><router-link to="/reScheduleReason">排程原因分析</router-link></li>-->
				  </ul>
			  </nav>
		  </div>
		<div class="right-content">
			<router-view></router-view>
		</div>
	  </div>
  </div>
</template>

<script>
</script>
