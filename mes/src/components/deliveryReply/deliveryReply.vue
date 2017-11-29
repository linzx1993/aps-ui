<template>
	<div class="right-content-box deliveryReply">
    <aps-query-condition-box>
			<!--选方案-->
			<div class="schedule-list">
				<a
					href="javascript:void(0);"
					class="info-noSchedule"
					v-show="!showSchemeList.length"
					@click="showAddPlanDialog">
					当前未选择方案,点击添加
				</a>
				<nav v-show="showSchemeList.length">
					<ul>
						<li v-for="data in showSchemeList">
							<span class="schedule-name" :title="data.schemeName">{{data.schemeName}}</span>
							<b class="delete-scheme" @click="deleteScheme(data)"></b>
						</li>
					</ul>
				</nav>
				<el-button
					type="text"
					@click="showAddPlanDialog"
					v-show="showSchemeList.length">
					<span
						class="add-schedule mr-5"
						@click="">
						<i class="added mr-5"></i>
						新加方案
					</span>
				</el-button>
				<el-dialog
					title="添加新方案"
					:visible.sync="dialogVisible"
					size="tiny">
					<el-select v-model="selectSchemeValue" placeholder="请选择">
						<el-option
							v-for="item in allSchemeList"
							:key="item.value"
							:label="item.schemeName"
							:title="item.schemeName"
							:disabled="item.disabled"
							:value="item.schemeId">
						</el-option>
					</el-select>
					<span slot="footer" class="dialog-footer">
						<el-button @click="dialogVisible = false">取 消</el-button>
						<el-button
							type="primary"
						  	@click="addPlan">
						 	确 定
						</el-button>
					</span>
				</el-dialog>
			</div>
			<!--选时间-->
			<date-select
				v-model='date'
				@change='getPlanCode'>
			</date-select>
			<!--其他查询条件-->
			<div class="query-conditions-list">
				<location-cascader
					:writelocation="schemeIdList"
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
    </aps-query-condition-box>
		<div class="delivery-reply-main">
			<!--选择显示的方案-->
			<div class="tab-list">
				<span
					:title='item.schemeName'
					:class='{
						"tab-list-selected": item.schemeId == selectedScheme
					}'
					v-for='item in showSchemeList'
					@click='searchScheme(item)'>
					{{item.schemeName}}
					<i
						title="删除方案"
						@click.stop='deleteScheme(item)'></i>
				</span>
			</div>
			<!--表格-->
			<aps-table
				:headerData='headerData'
				:bodyData='bodyData'
				:allNumber='allNumber'
				:printTitle='printTitle'
				excel
				print
				page
				v-show="headerData.length"
				@detailsRowInfo='detailsRowInfo'
				@pageChange='pageChange'>
				<i
					class='col-config-icon'
					title='列信息配置'
					v-show='showSchemeList.length'
					@click='colConfig'>
				</i>
			</aps-table>
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
import Emitter from 'element-ui/src/mixins/emitter';

export default{
	mixins: [Emitter],

	name: 'deliveryReply',

	data(){
		return{
			showSchemeList: [],
			selectSchemeValue: '',
			schemeIdList: [], //保存传递的数据
			allSchemeList: [],
			selectedScheme: '',
			dialogVisible: false,

			date: {
				startTime: +new Date(),
				endTime: +new Date() + 86400000,
        quickSelect : ['currentWeek','nextWeek','currentMonth','nextMonth'],
			},
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
			cnName: {
				moCode: '自制件计划号',
				orderCode: '主生产计划号',
				materialName: '物料名称',
				materialCode: '物料编码',
				taskNum: '数量',
				completeNum: '完成数量',
				poolMoRate: '自制件计划进度',
				poolOrderRate: '主生产计划进度',
				processRate: '完成度',
				poolMoSate: '自制件计划状态',
				poolOrderSate: '主生产计划状态',
				startTime: '开始时间',
				endTime: '结束时间',
				planStartTime: '计划开始时间',
				planEndTime: '计划结束时间',
				realStartTime: '实际开始时间',
				realEndTime: '实际结束时间',
				customerName: '客户名称'
			},
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
				materialCodeList: this.materialCodeValue,
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
				materialCodeList: this.materialCodeValue,
				orderCodeList: this.planCodeValue,
				moCodeList: this.planCodeValue,
				pageNum: this.currentPage,
				pageSize: this.pageSize,
				schemeId: this.selectedScheme || (this.showSchemeList[0] ? this.showSchemeList[0].schemeId : '')
			}
		},
		allUrl() {
			let url = {},
				_this = this;
			if(this.planTypeNameValue){
				if(this.planTypeNameValue === 1){
					url.tableUrl = this.url.order_delivery_reply;
					url.colConfigUrl = this.url.order_delivery_reply_colconfig;
					this.tableSearchBody.moCodeList = [];
				}
				if(this.planTypeNameValue === 2){
					url.tableUrl = this.url.mo_delivery_reply;
					url.colConfigUrl = this.url.mo_delivery_reply_colconfig;
					this.tableSearchBody.orderCodeList = [];
				}
			}else{
				if(this.playType == 2){
					url.tableUrl = this.url.order_delivery_reply;
					url.colConfigUrl = this.url.order_delivery_reply_colconfig;
					this.tableSearchBody.moCodeList = [];
				}
				if(this.playType == 3){
					url.tableUrl = this.url.mo_delivery_reply;
					url.colConfigUrl = this.url.mo_delivery_reply_colconfig;
					this.tableSearchBody.orderCodeList = [];
				}
			};
			return url;
		},
		printTitle() {
			const scheme = this.showSchemeList.filter(item =>{
					return item.schemeId === this.selectedScheme;
				});

			return scheme.length ? scheme[0].schemeName + '方案交期答复' : '无';
		}
	},

	methods: {
		//查询生产模式
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
		//打开方案选择弹窗
		showAddPlanDialog() {
			this.dialogVisible = true;
			//已经选过方案，方案列表不能再选
			this.allSchemeList.forEach((allSchemeItem) => {
				allSchemeItem.disabled = this.showSchemeList.some((showSchemeItem) => {
					//先判断两个方案的地点长度是否一致，如果不一致直接返回disabled为true
					if (showSchemeItem.locationDtoList.length !== allSchemeItem.locationDtoList.length) {
						return true
					}else{
						/*
						* 遍历一个方案所有地点，查看另外一个方案是否都有此地点
						* 如果返回遍历所有结果正确，则将disabled设置我false，反之则设为true。因为符合返回true，所以设置disable要加个！取反
						* */
						return !showSchemeItem.locationDtoList.every((showItem) => {
							//获得当前方案下的某个地点对象（showItem），和比较方案下的地点对象数组（allSchemeItem.locationDtoList）的每一个地点对象（allItem）进行比较
							return allSchemeItem.locationDtoList.some((allItem) => {
								//如果有一个allItem的地点id和showItem的地点id一致，则返回正确
								return showItem.locationId === allItem.locationId;
							})
						});
					}
				});
			})
		},
		//新增方案
		addPlan() {
			//如果没有选取任何值的话，直接返回
			if (!this.selectSchemeValue) {
				this.dialogVisible = false;
				return;
			}
			//如果选中的值已选中（elementUI的bug，第一个option为disabled仍可以选中）
			//后期优化为不符合的都不可以选中
			let isHasByInitSelected = this.showSchemeList.some((item) => {
				return item.schemeId === this.selectSchemeValue
			});
			if(isHasByInitSelected){
				this.dialogVisible = false;
				return;
			}
			//获得点击选中的方案对象
			const selectSchemeObj = this.allSchemeList.filter((item) => item.schemeId === this.selectSchemeValue)[0];
			this.showSchemeList.push(selectSchemeObj);
			this.dialogVisible = false;
			this.getSchemeIdList();
			//如果选择了方案，根据方案确定最小时间
			if (this.showSchemeList.length !== 0) {
				this.$http.get(this.url.min_scheme_time).then((res) => {
					this.startTime = res.data;
				})
			}
		},
		//删除选中方案
		deleteScheme(data) {
			this.showSchemeList = this.showSchemeList.filter((item) => {
				return item.schemeId !== data.schemeId;
			});
			this.getSchemeIdList();

			if(data.schemeId == this.selectedScheme){
				this.selectedScheme = '';
				if(this.showSchemeList.length){
					this.searchTable();
				}else{
					//重置
					this.headerData = [];
				}
			}
		},
		//获取方案id数组
	  	getSchemeIdList(){
			this.schemeIdList = [];
			this.showSchemeList.forEach((item) => {
				this.schemeIdList.push(item.schemeId);
		  	});
		},
		//查询表格数据
		searchTable(){
			if(this.showSchemeList.length === 0){
				this.$alert('请至少选择一个方案查看', '提示');
				return;
			}
			this.selectedScheme = this.selectedScheme || this.showSchemeList[0].schemeId;
			if(!this.showSchemeList.length){
				return;
			}
			this.$http.post(
				this.allUrl.tableUrl,
				this.tableSearchBody
			).then(res =>{
				this.allNumber = res.data.recordSize;
				this.dataProcessing(res.data);
			});
		},
		//表格数据处理
		dataProcessing(resData){
			const resHeadData = resData.column,
				  resCnHeadData = resData.columnAlias,
				  resBodyData = resData.dataList,
				  headData = [],
				  bodyData = [];

			//表格数据
			for(let i = 0, l = resBodyData.length; i < l; i++){
				const row = [],
					  rowData = resBodyData[i];
				for(let i = 0, l = resHeadData.length; i < l; i++){
					row.push(rowData[resHeadData[i]]);
				}
				bodyData.push(row);
			}

			this.headerData = resCnHeadData;
			this.bodyData = bodyData;
		},
		//查询物料名称
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
		//查询物料编码
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
		//查询计划编码
		getPlanCode(){
			if(!this.planCodeBody.searchType || this.planCodeBody.searchType.length === 0 || typeof(this.planCodeBody.startTime) === 'number' || typeof(this.planCodeBody.endTime) === 'number'){
				return;
			}
			this.planCodeValue = [];
			const _this = this;
			this.$http.post(
				this.url.get_plan_code,
				this.planCodeBody
			).then(res =>{
				_this.planCodeList = res.data;
			});
		},
		//查询用户
		getAllCustomer(){
			const _this = this;
			this.$http.get(
				this.url.get_all_customer
			).then(res =>{
				_this.customerList = res.data;
			});
		},
		//查询全部方案
		getAllScheme(){
			this.$http.get(this.url.test_writable).then((res) => {
				this.allSchemeList = res.data;
				//从排程后页面进入，判断url里面是否带有方案参数，如果带有方案的话，则页面初始显示该方案
				let schemeId = t.getUrlParams('schemeId');
				this.showSchemeList = this.allSchemeList.filter((item) => {
					return item.schemeId === schemeId;
				});
			});
		},
		detailsRowInfo(){},
		//表格翻页
		pageChange(pageInfo){
			this.currentPage = pageInfo.pageIndex;
			this.pageSize = pageInfo.pageSize;
			this.searchTable();
		},
		//切换查看的方案
		searchScheme(schemeInfo){
			this.selectedScheme = schemeInfo.schemeId;
			this.searchTable();
		},
		//配置列信息
		colConfig(){
			this.broadcast('colConfig', 'openColConfig');
		}
	},

	created(){
		//构造客户下拉框
		this.getAllCustomer();

//		this.$on('colChange',this.searchTable);
	},
	mounted(){
//		this.startTime = +new Date(); //选择开始时间
//		this.endTime = +new Date() + 86400000; //选择结束时间

		//获取计划调度模式
		this.getPlayType();

		//获取所有方案
		this.getAllScheme();
	}
}
</script>

<style rel="stylesheet/scss" lang="scss">
	@import "../../styles/resetStyle.scss";
	.deliveryReply{
		display: flex;
		flex-direction: column;

		.delivery-reply-main{
			flex: 1 1;
			display: flex;
			flex-direction: column;
			position: relative;

			.tab-list{
				flex: 0 0 30px;
				height: 30px;/*不知道为什么，span加了overflow: hidden;以后，这里的高度变成了37，加30的高度强制定高*/
				position: absolute;

				span{
					box-sizing: border-box;
					position: relative;
					width: 100px;
					height: 30px;
					line-height: 28px;
					padding: 0 20px 0 10px;
					border: 1px solid #999;
/*					border-bottom: none;*/
					border-radius: 6px 6px 0 0;
					color: #999;
					cursor: pointer;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;

					i{
						position: absolute;
						right: 6px;
						top: 11px;
						width: 8px;
						height: 8px;
						background: url(../../asserts/cancel.png) center center;
					}
				}
				.tab-list-selected{
					border-color: #b7b965;
					color: #b7b965;
					font-weight: 700;
					font-size: 14px;
					box-shadow: inset 0 0 0 1px #b7b965;
				}
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

		.col-config-icon{
			width: 20px;
			height: 20px;
			margin-left: 5px;
			background: url(../../asserts/config.png) center center;
			background-size: 100% 100%;
			cursor: pointer;
		}
		.col-config-dialog{
			position: absolute;
			top: -28px;
			right: 28px;
		}
	}
</style>
