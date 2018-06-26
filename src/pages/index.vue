<template>
    <div id="app">
		<div>
			测试scss,css3前缀,css图片引入:
			<span class="test mt-10">indexindexindexindexindexindexindexindexindexindexindexindexindex</span>
		</div>
		<br/>

		<div>
			测试svg：<img src="@/assets/svg/window.svg" width="60" /><img src="../assets/svg/button.svg" width="60" /><br/>
		</div>
		<br/>
		<div>
			测试font图标：<i class="iconfont icon-sousuo"></i>
		</div>
		<br/>
		<div>js引用图片: <img :src="test" alt=""></div><br/>
		<div>img直接引用图片：<img src="@/assets/logo.png" alt=""></div><br/>
		<div style="position: relative">
			<div id="test" @click="del">测试vue功能,bug:删除v-for继承html属性</div><br/>
			<div class="abc"  v-for="(data,index) in arr" :style="{top:data.y,left:data.x}" :key="index">
				y:{{data.y}}   ;x:{{data.x}}
			</div>
		</div>
		<div>测试引入自定义的vue组件:<transfer :data="transferData1" v-model="transferSelect1"></transfer></div>
	</div>
</template>

<script>
'use strict'
import transfer from '@/components/transfer/transfer.vue'
export default {
    name : 'index',
	mounted () {
        console.log("start mounted")
		console.log(t)

		$http.get("http://localhost:8080/api/location/noCalendar").then(res => {
		    alert("代理成功")
		})
		setTimeout(function () {
		    Array.prototype.forEach.call(document.getElementsByClassName("abc"),function (item,index) {
                item.setAttribute("id","fsdfds" + index)
            })
//			document.getElementsByClassName("abc")[1].setAttribute("fsdfds","fsdfds")
        },2000)
	},
	components: {
        transfer
	},
	data(){
        return {
            test: require("@/assets/details.png"),
            arr: [
				{x:"100px",y:"30px"},
				{x:"200px",y:"60px"},
				{x:"300px",y:"90px"},
			],
            transferData1 : [
                {value : "1" , label : "1" , isSelected:false,disabled : true},
                {value : "2" , label : "2" , isSelected:false},
                {value : "3" , label : "3" , isSelected:false},
                {value : "4" , label : "4" , isSelected:false},
                {value : "5" , label : "5" , isSelected:false},
                {value : "6" , label : "6" , isSelected:false}
            ],
            transferSelect1 : ["2","3","4"],
		}
	},
	methods : {
	    del(){
	        this.arr.splice(1,1)
		}
	}
}

</script>
<style rel="stylesheet/scss" lang="scss">
	.abc{
		position: absolute;
	}
</style>
