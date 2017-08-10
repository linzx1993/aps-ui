<template>
	<div class="reschedule-dialog-main">
		<div class="reschedule-dialog-search">
			<span class="search-box" @click="openDataPick($event)">					
				<span>开始时间 ： </span>
				<el-date-picker 
					v-model="searchDefaultBody.startTime" 
					type="date" 
					placeholder="选择日期"
					@change="startDataChange">
				</el-date-picker>
			</span>
			<span class="search-box" @click="openDataPick($event)">	
				<span>结束时间 ： </span>
				<el-date-picker 
					v-model="searchDefaultBody.endTime"
					type="date" 
					placeholder="选择日期"
					@change="endDataChange">
				</el-date-picker>
			</span>
			<span class="search-box">
				<span>设备名称 ： </span>
				<aps-dropdown
					v-model="selectedEquipments"
					multiple>
					<aps-option
						v-for="(item,index) in equipmentList"
						:value="index"
                    	:label="item.productUnitName">
					</aps-option>
				</aps-dropdown>
			</span>
			<span class="search-box">	
				<span>订单编号 ： </span>
				<el-input
					v-model="searchDefaultBody.saleOrder">
				</el-input>
			</span>
			<span class="search-box">	
				<span>物料名称 ： </span>
				<el-input
					v-model="searchDefaultBody.materialName">
				</el-input>
			</span>
			<span class="search-box">	
				<span>物料编码 ： </span>
				<el-input
					v-model="searchDefaultBody.materialCode">
				</el-input>
			</span>
			<span class="search-button-box">
				<a 
					class="mr-30 default-btn" 
					href="javascript:void(0);"
					@click="ResetSearchBody">
					重置
				</a>
				<a 
					class="mr-30 default-btn" 
					href="javascript:void(0);"
					@click="getScheduleDetailInfo">
					查询
				</a>
			</span>
			
		</div>
		<div class="reschedule-dialog-show">
			<aps-table
				:headerData='headerData'
				:bodyData='bodyData'
				:allNumber='allNumber'
				@detailsRowInfo='detailsRowInfo'
				@pageChange='pageChange'>
			</aps-table>
		</div>
		
		<look-detail
			:detailInfo='detailInfo'
			:top='top'
			:left='left'
			:showDetail='showDetail'
			@clickoutside='clickoutside'>
		</look-detail>
	</div>
</template>

<script>
import lookDetail from './lookDetail'
	
export default{
	components: {
			"look-detail": lookDetail,
		},
	
	data() {
		return {
			searchDefaultBody: {
				reasonId: this.reasonId,
				year: this.thisScheduleTime.substring(0,4),
				startTime: '',
				endTime: '',
				saleOrderCode: null,
				materialName: null,
				materialCode: null,
				shiftNames: null,
				equipments: null,
				order: null,
				pageIndex: 1,
				pageSize: 100
			},
			headerData:[],
			bodyData:[],
			resTableData:[],
			detailInfo: [],
			cnName: {
				doCode: '派工单号',
				endTime: '结束时间',
				materialCode: '物料编码',
				materialMnem: '物料助记码',
				materialName: '物料名称',
				materialSpec: '物料规格',
				materialUnit: '物料单位',
				moCode: '自制件计划号',
				orderCode: null,
				processCode: '工序编码',
				processName: '工序名称',
				saleOrderCode: '销售订单',
				startTime: '开始时间',
				taskCode: null,
				taskNum: '计划数',
				dataPickIndex: 0
			},
			top: 0,
			left: 0,
			showDetail: false,
			equipmentList: {},
			selectedEquipments: [],
			allNumber: 0,
			startTime: '1900-01-01',
			endTime: '2900-01-01'
		}
	},
	props:{
		reasonId: Number,
		thisScheduleTime: String
	},
	watch:{
		reasonId(val, oldValue){
			this.ResetSearchBody();
			//原因ID改变时查询一次数据
			this.searchDefaultBody.reasonId = val;
			this.getScheduleDetailInfo();
		}
	},
	methods:{
		//时间选择器错位。临时方案，快速连续分别点击两个时间选择器还是会错位
		openDataPick($event){
			if($($event.target).parents(".el-input").length === 0){return};
			let thisDataPick = $(".el-date-picker").eq($(".el-date-picker").length - 1);
			thisDataPick.css("left",$($event.target).parents(".el-input").position().left + 0.05*window.innerWidth);
			console.log($($event.target).parents(".el-input").position());
		},
		ResetSearchBody(){
			this.selectedEquipments = [];
			this.searchDefaultBody.startTime = null;
			this.searchDefaultBody.endTime = null;
			this.searchDefaultBody.saleOrder = null;
			this.searchDefaultBody.materialName = null;
			this.searchDefaultBody.materialCode = null;
			this.searchDefaultBody.equipments = null;
		},
		getEquipment(){
			 const _this = this,
				   url = this.url.get_all_equipment + `?startTime=${this.searchDefaultBody.startTime || this.startTime}&endTime=${this.searchDefaultBody.endTime || this.endTime}&searchType=1`;
			this.$http.get(
				url
			).then(res =>{
				const resData = res.data;
				
				_this.equipmentList = resData;
			})
		},
		pageChange(val){
			this.searchDefaultBody.pageIndex = val.pageIndex;
			this.searchDefaultBody.pageSize = val.pageSize;
			this.getScheduleDetailInfo();
		},
		startDataChange(val){
			this.searchDefaultBody.startTime = val;
			this.getEquipment();
		},
		endDataChange(val){
			this.searchDefaultBody.endTime = val;
			this.getEquipment();
		},
		clickoutside(val){
			this.showDetail = val;
		},
		getScheduleDetailInfo(){
			let _this = this;
			if(this.selectedEquipments && this.selectedEquipments.length){
				const returnData = [];
				this.selectedEquipments.every(item =>{
					const equipmentInfo = item.split("_");
					returnData.push({
						equipmentId: equipmentInfo[0],
						equipmentType: equipmentInfo[1]
					})
					return true;
				});
				this.searchDefaultBody.equipments = returnData;
			}
			//获取数据
			this.$http.post(
				this.url.get_schedule_detail,
				this.searchDefaultBody
			).then(res =>{
				_this.resTableData = res.data.resultList;
				//绑定表头
				_this.headerData = res.data.columnAlias;
				//绑定表格数据
				_this.bodyData = _this.dataProcessing(res.data);
				//更新翻页
				_this.updataPage(res.data);
			})
		},
		updataPage(resData){
			this.allNumber = resData.resultList.length ? resData.resultList[0].recordCount : 0;
		},
		dataProcessing(resData){
			const columnOrder = resData.column,
				  columnData = resData.resultList,
				  returnData = [];
			
			//遍历行
			for(let i = 0, l =  columnData.length; i < l; i++){
				let thisRow = columnData[i],
					rowData = [];
				
				//遍历列顺序，生成表格数据
				for(let i = 0, l = columnOrder.length; i < l; i++){
					let thisItem = columnOrder[i];
					rowData.push(thisRow[thisItem]);
				}
				
				//推入本行数据
				returnData.push(rowData);
			}
			return returnData;
		},
		detailsRowInfo(emitInfo){
			let _this = this,
				thisPk = this.resTableData[emitInfo.rowIndex].pkId;
			
			this.$http.get(
				this.url.get_schedule_task_detail.join(thisPk) + '?year=' + this.thisScheduleTime.substring(0,4)
			).then(res =>{
				let realData = res.data,
					returnData = [];
				//三级页面数据处理
				for(let title in realData){
					returnData.push({
						title: _this.cnName[title] || title,
						content: realData[title]
					})
				}
				_this.detailInfo = returnData;
				_this.left = $(emitInfo.element.target).position().left + 10;
				_this.top = $(emitInfo.element.target).position().top + 5;
				_this.showDetail = true;
			})
		}
	},
	mounted(){
		//第一次打开的时候查一次数据
		this.getScheduleDetailInfo();
		this.getEquipment();
		
		$(window).resize(()=>{$(".el-date-picker").hide()})
	}
}
</script>

<style rel="stylesheet/scss" lang="scss">
.reschedule-dialog-main {
	display: flex;
	flex-direction: column;
	height: calc(100vh - 300px);
	background-color: #fff;
	
	.reschedule-dialog-header {
		flex: 0 0 40px;
		background-color: #ccc;
	}
	.reschedule-dialog-search {
		border-bottom: 1px solid #ccc;
		
		.search-box {
			margin: 0 10px 10px 0;
			
			.el-date-editor,
			.el-input {
				width: 140px;
				height: 30px;
				input {
					width: 140px;
					height: 30px;
				}
			}
		}
		.search-button-box {
			min-width: 218px;
		}
		.default-btn {
			margin-bottom: 10px;
		}
	}
	.reschedule-dialog-show {
		flex: 1 1;
		margin: 10px 0;
		overflow: hidden
	}
	.aps-dropdown {
		.aps-dropdown-main{
			.aps-dropdown-input {
				width: 140px;
			}
		}
	}
	.look-detail{
		position: absolute;
		max-height: 360px;
		overflow-y: auto;
		border: 1px solid #ccc;
		box-shadow: 0 0 20px #ccc;
		background-color: #fff;
		text-align: center;
		
		table{
			tr{
				border: 1px solid #ccc;
				td{
					max-width: 100px;
					padding: 0 4px;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
			}
		}
	}
}

</style>