<template>
	<div class="right-content-box plan-rate">
		<div class="query-area">
			<!--选时间-->
			<date-select
				v-model='date'
				@change='getPlanCode'>
			</date-select>
			<div class="query-conditions-list">
				<location-cascader
					v-model="selectLocationList">
				</location-cascader>
				<div class="query-conditions">
					<span>客&#12288;&#12288;户 ：</span>
					<aps-dropdown
						v-model="customerValue"
						@change="getPlanCode"
						multiple>
						<aps-option
							v-for='customer in customerList'
							:label='customer.customerName'
							:value='customer.customerId'>
						</aps-option>
					</aps-dropdown>
				</div>
				<div class="query-conditions">
					<span>物料名称 ：</span>
					<aps-dropdown
						v-model="materialNameValue"
						multiple
						remote
						@remoteQuery='getMaterialName'
						@change="getPlanCode">
						<aps-option
							v-for='item in materialNameList'
							:label='item.materialName'
							:value='item.materialName'>
						</aps-option>
					</aps-dropdown>
				</div>
				<div class="query-conditions">
					<span>物料编码 ：</span>
					<aps-dropdown
						v-model="materialCodeValue"
						multiple
						remote
						@remoteQuery='getMaterialCode'
						@change="getPlanCode">
						<aps-option
							v-for='item in materialCodeList'
							:label='item.materialCode'
							:value='item.materialCode'>
						</aps-option>
					</aps-dropdown>
				</div>
				<div class="query-conditions">
					<span>计划类型 ：</span>
					<aps-dropdown
						v-model="planTypeNameValue"
						@change="getPlanCode">
						<aps-option
							v-for='planType in planTypeList'
							:label='planType.planTypeName'
							:value='planType.planTypeId'
							:checked='planType.checked'>
						</aps-option>
					</aps-dropdown>
				</div>
				<div class="query-conditions">
					<span>计划编号 ：</span>
					<!--时间、地点、客户、物料名称、物料编码、类型的ID-->
					<aps-dropdown
						v-model="planCodeValue"
						multiple>
						<aps-option
							v-for='planCode in planCodeList'
							:label='planCode'
							:value='planCode'>
						</aps-option>
					</aps-dropdown>
				</div>
				<a  class="default-btn mt-20"
					href="javascript:void(0);"
					@click="searchTable">
					查看
				</a>
			</div>
		</div>
		<hr>
		<div class="plan-rate-main" v-show="headerData.length">
			<aps-table
				:headerData='headerData'
				:bodyData='bodyData'
				:allNumber='allNumber'
				:operation=false
				@detailsRowInfo='detailsRowInfo'
				@pageChange='pageChange'>
			</aps-table>
			<i
				class='col-config-icon'
				title='列信息配置'
				@click='colConfig'>
			</i>
			<div class="col-config-dialog">
				<col-config
					:configUrl='allUrl.colConfigUrl'
					@colChange='searchTable'>
				</col-config>
			</div>
		</div>
	</div>
</template>

<script>
import locationCascader from "../common/locationCascader.vue"	
import Emitter from 'element-ui/src/mixins/emitter';
	
export default{
	mixins: [Emitter],
	
	name: 'planRate',
	
	components: {
	  	"location-cascader": locationCascader
  	},
	
	data(){
		return{
			date: {
				startTime: +new Date(),	
				endTime: +new Date() + 86400000
			},
			quickTime: '', //快速选择时间判断
			selectLocationList: [], //级联下拉地点选中数据
			customerList: [],  //客户名称下拉框
			customerValue: [],  //选中的客户
			materialNameList: [],  //物料名称下拉框
			materialCodeList: [],  //物料编码下拉框
			materialNameValue: [],  //选中的物料名称
			materialCodeValue: [],  //选中的物料编码
			planCodeList: [],  //计划编码下拉框
			planCodeValue: [],  //选中的计划编码
			planTypeNameValue: [],  //选中的计划类型
			planTypeList: [  //计划类型下拉框
				{
					planTypeName: '主生产计划',
					planTypeId: 1
				},
				{
					planTypeName: '自制件计划',
					planTypeId: 2
				},
//				{
//					planTypeName: '车间计划',
//					planTypeId: 3
//				},
//				{
//					planTypeName: '派工单',
//					planTypeId: 4
//				},
			],
			playType: '',  //生产模式
			allNumber: 0, //表格数据总条数
			currentPage: 1, //表格当前页码
			pageSize: 100, //表格每页数据数量
			headerData: [], //表格头部数据
			bodyData: [],  //表格内容数据
			orderStateName: {
				0: '未审核',
				1: '已审核',
				3: 'BOM已分解',
				4: '自制件确认',
				5: '工艺已分解',
				6: '生产中',
				7: '已取消',
				9: '完工'
			},
			moStateName: {
				0: '未确认',
				3: '已确认',
				5: '工艺已分解',
				6: '生产中',
				7: '已取消',
				9: '完工'
			}
		}
	},
	
	computed: {
		planCodeBody() {
			return {
				startTime: this.date.startTime,
				endTime: this.date.endTime,
				locationIdList: this.selectLocationList,
				customerIdList: this.customerValue,
				materialNameList: this.materialNameValue,
				materialCodeList: this.materialCodeList,
				searchType: this.planTypeNameValue
			}
		},
		tableSearchBody() {
			return {
				startTime: this.date.startTime,
				endTime: this.date.endTime,
				locationIdList: this.selectLocationList,
				customerIdList: this.customerValue,
				materialNameList: this.materialNameValue,
				materialCodeList: this.materialCodeList,
				orderCodeList: this.planCodeValue,
				moCodeList: this.planCodeValue,
				pageNum: this.currentPage,
				pageSize: this.pageSize
			}
		},
		allUrl() {
			let url = {},
				_this = this;
			if(this.planTypeNameValue){
				if(this.planTypeNameValue === 1){
					url.tableUrl = this.url.get_order_rate;
					url.colConfigUrl = this.url.order_plan_rate_colconfig;
					this.tableSearchBody.moCodeList = [];
				}
				if(this.planTypeNameValue === 2){
					url.tableUrl = this.url.get_mo_rate;
					url.colConfigUrl = this.url.mo_plan_rate_colconfig;
					this.tableSearchBody.orderCodeList = [];
				}
			}else{
				if(this.playType == 2){
					url.tableUrl = this.url.get_order_rate;
					url.colConfigUrl = this.url.order_plan_rate_colconfig;
					this.tableSearchBody.moCodeList = [];
				}
				if(this.playType == 3){
					url.tableUrl = this.url.get_mo_rate;
					url.colConfigUrl = this.url.mo_plan_rate_colconfig;
					this.tableSearchBody.orderCodeList = [];
				}
			};
			
			return url;
		}
	},
	
	methods: {
		colConfig(){
			this.broadcast('colConfig', 'openColConfig');
		},
		getPlayType(){
			let _this = this,
				nameValue = 1;
			this.$http.get(
				this.url.get_play_type
			).then(res =>{
				_this.playType = res.data.playType;
				if(_this.playType == 3){
					_this.planTypeList.shift();
					nameValue = 2;
				}
			}).then(() =>{
				this.planTypeNameValue = nameValue;
			});
		},
		changeStartTime(startTime){
			this.date.startTime = startTime;
			this.getPlanCode();
		},
		changeEndTime(endTime){
			this.date.endTime = endTime;
			this.getPlanCode();
		},
		getAllCustomer(){
			const _this = this;
			this.$http.get(
				this.url.get_all_customer
			).then(res =>{
				_this.customerList = res.data;
			});
		},
		getMaterialName(query){
			query = query.replace(/\s/g,'');
			if(query === ''){
				this.materialNameList = [];
				return;
			}
			
			const _this = this;
			this.$http.get(
				this.url.get_material_name + '?materialName=' + query
			).then(res =>{
				_this.materialNameList = res.data.splice(0,1000);
			});
		},
		getMaterialCode(query){
			query = query.replace(/\s/g,'');
			if(query === ''){
				this.materialCodeList = [];
				return;
			}
			
			const _this = this;
			this.$http.get(
				this.url.get_material_code + '?materialCode=' + query
			).then(res =>{
				_this.materialCodeList = res.data.splice(0,1000);
			});
		},
		getPlanCode(){
			if(!this.planCodeBody.searchType || this.planCodeBody.searchType.length === 0 || typeof(this.planCodeBody.startTime) === 'number' || typeof(this.planCodeBody.endTime) === 'number'){
				return;
			}
			const _this = this;
			this.$http.post(
				this.url.get_plan_code,
				this.planCodeBody
			).then(res =>{
				_this.planCodeList = res.data;
			});
		},
		searchTable(){
			this.$http.post(
				this.allUrl.tableUrl,
				this.tableSearchBody
			).then(res =>{
				const resData = res.data;
				
				//总条数
				this.allNumber = resData.recordSize;
				
				//处理处表格数据
				this.dataProcessing(resData);
			});
		},
		dataProcessing(resData){
			const resHeaderData = resData.column,
				  resCnHeaderData = resData.columnAlias,
				  resBodyData = resData.dataList,
				  headerData = [],
				  bodyData = [];
			
			//表格数据
			resBodyData.every(row =>{
				let rowData = [];
				resHeaderData.every(cell =>{
					if(cell === "poolMoState"){
						rowData.push(this.moStateName[row[cell]]);
						return true;
					}
					if(cell === "poolOrderState"){
						rowData.push(this.orderStateName[row[cell]]);
						return true;
					}
					rowData.push(row[cell]);
					return true;
				});
				bodyData.push(rowData);
				return true;
			});
			
			this.headerData = resCnHeaderData;
			this.bodyData = bodyData;
		},
		pageChange(pageInfo){
			this.currentPage = pageInfo.pageIndex;
			this.pageSize = pageInfo.pageSize;
			this.searchTable();
		},
		detailsRowInfo(){
			
		},
		colConfig(){
			this.broadcast('colConfig', 'openColConfig');
		}
	},
	
	created(){
		//构造客户下拉框
		this.getAllCustomer();
		
	},
	mounted(){
		
		//获取计划调度模式
		this.getPlayType();
		
	}
}
</script>

<style rel="stylesheet/scss" lang="scss">
	.plan-rate{
		display: flex;
		flex-direction: column;
		height: calc(100vh - 148px);
		
		.plan-rate-main{
			flex: 1 1;
			display: flex;
			flex-direction: column;
			position: relative;
			width: calc(100vw - 260px);
			
			.col-config-icon{
				width: 14px;
				height: 14px;
				position: absolute;
				top: -17px;
				right: 0;
				background: url(../../assets/config.png) center center;
				background-size: 100% 100%;
				cursor: pointer;
			}
			.col-config-dialog{
				position: absolute;
				top: -28px;
				right: 28px;
			}
		}
		
		//查询条件筛选
		.query-conditions-list{
			display: flex;
			flex-wrap: wrap;
			.query-conditions{
				margin-top: 20px;
				flex :0 1 265px;
				margin-right: 30px;
			}
		}
	}
</style>
