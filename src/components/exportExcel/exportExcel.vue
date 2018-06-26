<template>
	<a :href="excelUrl" target="_blank" class="export-excel" :class="selfClass" v-show="key" title="导出excel">
		<slot>
			<i class="export-excel-default"></i>
		</slot>
	</a>
</template>

<script>
export default {
	name: "exportExcel",

	props: [
		'excelData',	//可以直接传给后台的excel数据
		'tableData',	//用来渲染table的数据
		'domData',		//表格dom节点
		'selfClass'		//外部定义的样式
	],

	data (){
		return {
			key: "",
			creatTableData: {
				"sheetName": "测试标签",	//excel页签
				"title": "APS",				//表格题
				"column": [],	////表格内容[[]]
				"mergecellsInfos": [] //单元格合并信息[{}]
			}
		}
	},

	computed: {
		//生成excel的地址
		excelUrl (){
			return this.url.export_excel + "/" + this.key;
		}
	},

	watch: {
		excelData(n, o){
			//刷新excel地址
			this.refreshExcelUrl(n);
		},
		tableData(n, o){
			//当前的table是双层数组，暂时不支持合并单元格，所以直接加就行了
			this.creatTableData.column = n;
			this.creatTableData.mergecellsInfos = [];

			this.refreshExcelUrl(this.creatTableData);
		},
		domData(n, o){
			this.getExcelDataFromDom(n);
		}
	},

	methods: {
		//向后台发数据生产excel文件
		refreshExcelUrl(excelData){
			this.$http.post(
				this.url.get_excel_url,
				excelData
			).then(res =>{
				//成功生成新的excel文件后，删除上一个excel文件
				if(this.key){
					this.deleteCacheExcel();
				}
				this.key = res.data;
			})
		},
		//从table数据中计算出excel数据
		getExcelDataFromTableData(){

		},
		//从Dom中遍历出excel数据
		getExcelDataFromDom(dom){
			//jquery对象 or dom对象
			if(dom.tagName){}else{}

			//这里使用原生jQuery对象进行操作
			const importDom = dom.is("table") ? dom : dom.find("table"),
				  tableDom = importDom.length === 1 ? importDom.clone() : importDom.eq(0).clone(),
				  excelDom = tableDom.find(".no-print").remove(),
				  thead = tableDom.find("tbody").insertAfter(tableDom.find("thead")),
				  allTrs = tableDom.find("tr"),
				  tableData = [],
				  excelData = [],
				  mergecellsInfos = [],
				  completInfo = [];

			let colNum = 0;	//列数


			//后台excel接口不分表头和表格内容，可以合在一起处理
			//没有就直接返回
			if(allTrs.length === 0){
				return;
			}

			//获取总列数
			const firstTrTds = allTrs.eq(0).children();
			firstTrTds.each((index, item) =>{
				colNum += +(firstTrTds.eq(index).attr("colspan")) || 1;
			});

			//遍历所有的行
			allTrs.each((trIndex, tr) =>{
				const tds = allTrs.eq(trIndex).children(),	//包括了td和th
					  excelTr = new Array(colNum);

				//填充合并行
				for(let i = completInfo.length - 1; i > -1; i--){
					const complet = completInfo[i],
						  restRow = complet.restRow,
						  startCol = complet.startCol,
						  mergeColNum = complet.mergeColNum,
						  text = complet.text;

					//清除失效的合并行信息
					if(restRow === 1){
						completInfo.splice(i, 1);
						continue;
					}else{
						completInfo[i].restRow = restRow - 1;
					}

					//把之前的合并行填入对应的列
					for(let i = 0; i < mergeColNum; i++){
						excelTr[startCol + i] = text
					}
				};

				//填充本行的信息
				tds.each((tdIndex, td) =>{
					const $td = $(td),
						  colspan = +($td.attr("colspan")) || 1,
						  rowspan = +($td.attr("rowspan")) || 1,
						  text = $td.text().trim();

					let startIndex = tdIndex;

					for(let i = 0; i < colspan; i++){
						if(excelTr[startIndex + i] !== undefined){
							startIndex++;
							i--;
						}else{
							excelTr[startIndex + i] = text;
						}

					};

					//存在合并
					if(rowspan > 1 || colspan > 1){
						mergecellsInfos.push({
							startRow: trIndex + 1,
							endRow: trIndex + rowspan,
							startColumn: startIndex,
							endColumn: startIndex + colspan - 1
						});
					}

					//推入本行开始的合并行信息
					if(rowspan > 1){
						completInfo.push({
							restRow: rowspan,
							startCol: startIndex,
							mergeColNum: colspan,
							text: text
						});
					}
				});

				excelData.push(excelTr);
			});

			this.creatTableData.column = excelData;
			this.creatTableData.mergecellsInfos = mergecellsInfos;

			this.refreshExcelUrl(this.creatTableData);
		},
		deleteCacheExcel(){
			this.$http.get(
				this.url.delete_excel + "/" + this.key
			);
		},
		//初始执行
		initUrl(){
			//按优先级执行
			if(this.excelData){
				this.refreshExcelUrl(this.excelData);
				return;
			}
			if(this.tableData){
				this.creatTableData.column = this.tableData;
				this.refreshExcelUrl(this.creatTableData);
				return;
			}
			if(this.domData && this.domData.length){
				this.getExcelDataFromDom(this.domData);
				return;
			}
		}
	},

	mounted (){
		//初始执行
		this.initUrl();
	}
}
</script>

<style rel="stylesheet/scss" lang="scss">
	.export-excel{
		.export-excel-default{
			width: 20px;
			height: 20px;
			background: url(./assets/excel.png) no-repeat center center;
		}
	}
</style>
