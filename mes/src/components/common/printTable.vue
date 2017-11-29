<template>
	<a href="javasript:" class="aps-print-table" :class="selfClass" title="打印" @click="printTable">
		<slot>
			<i class="aps-print-table-default"></i>
		</slot>
	</a>
</template>

<script>
export default {
	name: "printTable",
	
	props: [
		'domData',	//表格dom
		'selfClass',	//外部定义的样式
		'printTitle'	//打印标题和页面title
	],
	
	data (){
		return{
			
		}
	},
	
	methods: {
		printTable(){
			const dom = this.domData,
				  importDom = dom.is("table") ? dom : dom.find("table"),
				  tableDom = importDom.length === 1 ? importDom.clone() : importDom.eq(0).clone(),
				  printDom = tableDom.find(".no-print").remove(),
				  thead = tableDom.find("tbody").insertAfter(tableDom.find("thead")),
				  allTrs = tableDom.find("tr"),
				  printTitle = this.printTitle || "通知单";
			
			allTrs.css("transform","translateY(0)");
			allTrs.css("transform","translateX(0)");
			
			allTrs.each(function(){
				$(this).find("td").css("transform","translateY(0)");
				$(this).find("td").css("transform","translateX(0)");
				$(this).find("th").css("transform","translateY(0)");
				$(this).find("th").css("transform","translateX(0)");
			});
			
			tableDom.css({"width":"100%","text-align":"center","border-collapse":"collapse"});
			tableDom.find("td").css({"border":"1px solid #ccc","padding":"4px","font-size":"12px","vertical-align":"middle"});
			tableDom.find("th").css({"border":"1px solid #ccc","padding":"4px","font-size":"14px","font-weight":"bold"});
			let printBody = $("<div class='printBody'></div>");
			let b = $("<div></div>");
			printBody.append(tableDom);
			b.append(printBody);
			let newWindow = window.open("","_blank");
			newWindow.document.write('<meta charset="utf-8" />');
			newWindow.document.write('<title>'+ printTitle +'</title>');
			newWindow.document.write('<style type="text/css">@media print {.noprint,.printBody { display: none } .nextpage {page-break-after:always;}}button{margin:4px;}</style>');
			newWindow.document.write('<button class="transverse noprint">横向</button><button class="vertical noprint">纵向</button><button class="noprint">打印</button>');
			newWindow.document.write(b.html());
			newWindow.document.write('<style rel="stylesheet" href="../styles/print.css"></style>');
			newWindow.document.write('<script src="../scripts/lib/jquery.js"></'+'script>');
			newWindow.document.write('<script src="../scripts/view/print.js?t=14" charset="UTF-8"></'+'script>')
//          newWindow.focus();
//          newWindow.document.close();
//          newWindow.print();
//          newWindow.close();
		}
	}
}
</script>

<style rel="stylesheet/scss" lang="scss">
	.aps-print-table{
		.aps-print-table-default{
			width: 20px;
			height: 20px;
			background: url(../../asserts/print.png) no-repeat center center;
		}
	}
</style>
