<template>
	<div class="right-content-box material-warn">
    <aps-query-condition-box>
			<!--查看维度-->
			<p class="mt-5 mb-10 flex">
				查看类型 ：
				<label class="input-radio" for="materialDimension">
				  <input
					id="materialDimension"
					name="materialDimension"
					type="radio"
					value="materialDimension"
					v-model="lookDimension">
				  <span></span>
				  物料维度
				</label>
				<label class="input-radio" for="orderDimension">
				  <input
					id="orderDimension"
					name="orderDimension"
					type="radio"
					value="orderDimension"
					v-model="lookDimension">
				  <span></span>
				  订单维度
				</label>
			</p>
			<!--选时间-->
			<date-select
				v-model='date'>
			</date-select>
			<div class="query-conditions-list">
				<!--地点选择组件-->
				<location-cascader
					v-model="selectLocationList"
					v-show="isMaterialDimension">
				</location-cascader>
				<!--物料关心度-->
				<div class="query-conditions" v-show="isMaterialDimension">
					<span>物料关心：</span>
					<aps-dropdown
						v-model="materialConcern"
						multiple>
						<aps-option
							v-for='materialConcern in materialConcernList'
							:label='materialConcern.label'
							:value='materialConcern.value'>
						</aps-option>
					</aps-dropdown>
				</div>
				<div class="query-conditions" v-show="isMaterialDimension">
					<span>物料名称 ：</span>
					<aps-dropdown
						v-model="materialNameValue"
						multiple
						remote
						@remoteQuery='getMaterialName'>
						<aps-option
							v-for='item in materialNameList'
							:label='item.materialName'
							:value='item.materialName'>
						</aps-option>
					</aps-dropdown>
				</div>
				<label class="ml-20 material-warn-checkbox" for="onlyWarn" v-show="isMaterialDimension">
					<input
						   id="onlyWarn"
						   type="checkbox"
						   v-model="onlyWarn">
					<span></span>
					仅显示缺料
				</label>
				<a  class="default-btn mt-20"
					href="javascript:void(0);"
					@click="searchTable()">
					查看
				</a>
				<a  class="default-btn mt-20"
					href="javascript:void(0);"
					@click="viewDetails()"
					v-show="(isMaterialDimension && materialRepeat.length === 1) || (isOrderDimension && orderRepeat.length < 3 && orderRepeat.length > 0)">
					查看明细
				</a>
				<el-dropdown
					@command="setMaterialConcern"
					trigger="click"
					v-show="isMaterialDimension && materialRepeat.length === 1">
					<el-button
						type="primary">
						设置物料关心
						<i class="el-icon-caret-bottom el-icon--right"></i>
					</el-button>
					<el-dropdown-menu slot="dropdown" >
						<el-dropdown-item command="CARE">关心</el-dropdown-item>
						<el-dropdown-item command="NORMAL">默认</el-dropdown-item>
						<el-dropdown-item command="NOT_CARE">忽略</el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown>
				<a  class="default-btn mt-20"
					href="javascript:void(0);"
					@click="changeWarnTime()"
					v-show="isMaterialDimension && materialRepeat.length === 1">
					延迟预警
				</a>
				<a  class="default-btn mt-20"
					href="javascript:void(0);"
					@click="detailsWarnTime()"
					v-show="isMaterialDimension">
					延迟详情
				</a>
			</div>
    	</aps-query-condition-box>
		<div class="material-warn-main">
			<!--订单维度一级筛选-->
			<div class="query-conditions" v-show="isOrderDimension && orderRepeat.length === 1">
				<span>销售订单：</span>
				<aps-dropdown
					v-model="saleOrderCodeValue"
					@change="screenOrderFirstTable"
					multiple>
					<aps-option
						v-for='saleOrderCode in saleOrderCodeList'
						:label='saleOrderCode'
						:value='saleOrderCode'>
					</aps-option>
				</aps-dropdown>
			</div>
			<div class="query-conditions" v-show="isOrderDimension && orderRepeat.length === 1">
				<span>主生产号：</span>
				<aps-dropdown
					v-model="orderCodeValue"
					@change="screenOrderFirstTable"
					multiple>
					<aps-option
						v-for='orderCode in orderCodeList'
						:label='orderCode'
						:value='orderCode'>
					</aps-option>
				</aps-dropdown>
			</div>
			<!--订单维度二级筛选-->
			<location-cascader
				v-model="screenSelectLocationList"
				v-show="isOrderDimension && orderRepeat.length === 2"
				@change="screenSecondFirstTable">
			</location-cascader>
			<!--物料关心度-->
			<div class="query-conditions" v-show="isOrderDimension && orderRepeat.length === 2">
				<span>物料关心：</span>
				<aps-dropdown
					v-model="screenMaterialConcern"
					@change="screenSecondFirstTable"
					multiple>
					<aps-option
						v-for='materialConcern in materialConcernList'
						:label='materialConcern.label'
						:value='materialConcern.value'>
					</aps-option>
				</aps-dropdown>
			</div>
			<div class="query-conditions" v-show="isOrderDimension && orderRepeat.length === 2">
				<span>物料名称 ：</span>
				<aps-dropdown
					v-model="screenMaterialNameValue"
					@change="screenSecondFirstTable"
					multiple>
					<aps-option
						v-for='materialName in screenMaterialNameList'
						:label='materialName'
						:value='materialName'>
					</aps-option>
				</aps-dropdown>
			</div>
			<a  v-if="materialRepeat.length > 1 || orderRepeat.length > 1"
				class="default-btn mb-10"
				href="javascript:void(0);"
				@click="tableReturn">
				返回
			</a>
			<!--物料维度表格群-->
			<div v-show="isMaterialDimension">
				<aps-table
					v-for="(item,index) in materialRepeat"
					v-show="index === materialRepeat.length - 1"
					v-model="item.tableSelectIndexValue"
					:headerData='item.headerData'
					:bodyData='item.bodyData'
					:allNumber='item.allNumber'
					:operation='item.operation'
					:selection='item.selection'
					:printTitle='item.printTitle'
					excel
					print
					page
					@detailsRowInfo='item.detailsRowInfo'
					@pageChange='item.pageChange'>
					<i
						class="col-config-icon"
						title="列信息配置"
						@click='colConfig'>
					</i>
				</aps-table>
			</div>
			<!--订单维度表格群-->
			<div v-show="isOrderDimension">
				<aps-table
					v-for="(item,index) in orderRepeat"
					v-show="index === orderRepeat.length - 1"
					v-model="item.tableSelectIndexValue"
					:headerData='item.headerData'
					:bodyData='item.bodyData'
					:allNumber='item.allNumber'
					:operation='item.operation'
					:selection='item.selection'
					:printTitle='item.printTitle'
					excel
					print
					page
					@detailsRowInfo='item.detailsRowInfo'
					@pageChange='item.pageChange'>
					<i
						class="col-config-icon"
						title="列信息配置"
						@click='colConfig'>
					</i>
				</aps-table>
			</div>
			<div class="col-config-dialog">
				<col-config
					:configUrl='colConfigUrl'
					@colChange='colChange'>
				</col-config>
			</div>
		</div>
		<!--延迟预警选择时间弹窗-->
		<el-dialog
	  		title="延迟预警"
	  		:visible.sync="changeWarnTimeDialogShow"
	  		top="30%"
	  		custom-class="changeWarnTimeDialog">
		  	<div class="timeBox">
		  		<span>延迟至</span>
		  		<el-date-picker
				  	v-model="newWarnTime"
				  	type="datetime"
			  		placeholder="选择日期时间"
			  		@change="getNewWarnTime">
				</el-date-picker>
		  	</div>
		  	<div slot="footer" class="dialog-footer">
				<el-button @click="changeWarnTimeDialogShow = false">取 消</el-button>
				<el-button type="primary" @click="changeWarnTimeSure">确 定</el-button>
		  	</div>
		</el-dialog>
		<!--延迟详情-->
		<el-dialog
	  		title="延迟详情"
	  		:visible.sync="detailsWarnTimeDialogShow"
	  		size="large"
	  		top="50%">
	  		<div class="detail-warn-time-dialog-main">
				<div class="query-conditions-list">
					<div class="query-conditions">
						<span>物料关心：</span>
						<aps-dropdown
							v-model="dialogMaterialConcern"
							multiple>
							<aps-option
								v-for='materialConcern in materialConcernList'
								:label='materialConcern.label'
								:value='materialConcern.value'>
							</aps-option>
						</aps-dropdown>
					</div>
					<div class="query-conditions">
						<span>物料名称 ：</span>
						<aps-dropdown
							v-model="dialogMaterialNameValue"
							multiple
							remote
							@remoteQuery='dialogGetMaterialName'>
							<aps-option
								v-for='item in dialogMaterialNameList'
								:label='item.materialName'
								:value='item.materialName'>
							</aps-option>
						</aps-dropdown>
					</div>
					<div class="query-conditions">
						<span>延迟状态 ：</span>
						<aps-dropdown
							v-model="warnTimeStateValue"
							multiple>
							<aps-option
								v-for='item in warnTimeStateList'
								:label='item.label'
								:value='item.value'>
							</aps-option>
						</aps-dropdown>
					</div>
					<a  class="default-btn mb-20"
						href="javascript:void(0);"
						@click="getDetailsWarnTimeInfo">
						查询
					</a>
					<a  class="default-btn mb-20"
						href="javascript:void(0);"
						@click="deleteWarnTime">
						删除延迟
					</a>
					<a  class="default-btn mb-20"
						href="javascript:void(0);"
						@click="changeWarnTime('isDialog')">
						修改
					</a>
				</div>
				<div class="warn-time-dialog-main">
					<aps-table
						v-model="dialogSelectedIndex"
						:headerData='dialogHeaderData'
						:bodyData='dialogBodyData'
						:allNumber='dialogAllNumber'
						selection
						page
						@pageChange='dialogPageChange'>
						<i class="col-config-icon" title="列信息配置"></i>
					</aps-table>
				</div>
	  		</div>
		</el-dialog>
	</div>
</template>

<script>
import locationCascader from "../common/locationCascader.vue"
import Emitter from 'element-ui/src/mixins/emitter';

export default{
	mixins: [Emitter],

	name: 'materialWarn',

	components: {
	  	"location-cascader": locationCascader
  	},

	data(){
		return{
			lookDimension: 'materialDimension', //观察维度，默认物料维度
			date: {//时间选择器
				startTime: +new Date(),
				endTime: +new Date() + 86400000,
        quickSelect : ['currentWeek','nextWeek','currentMonth','nextMonth'],
			},
			selectLocationList: [], //级联下拉地点选中数据
			materialConcern: ['CARE','NORMAL'],
			materialConcernList:[
				{
					label: '关心',
					value: 'CARE'
				},
				{
					label: '普通',
					value: 'NORMAL'
				},
				{
					label: '忽略',
					value: 'NOT_CARE'
				},
			],
			materialConcernCnName: {
				'CARE': '关心',
				'NORMAL': '普通',
				'NOT_CARE': '忽略',
			},
			materialNameValue: [],  //选中的物料名称
			materialNameList: [],  //物料名称下拉框
			orderCodeValue: [],   //选中的主生产计划号
			orderCodeList: [],   //主生产计划号下拉框
			saleOrderCodeValue: [],   //选中的销售订单号
			saleOrderCodeList: [],   //销售订单号下拉框
			onlyWarn: true,   //只显示缺料
			pageInfo: {
				pageIndex: 1,
				pageSize: 100
			},
			dialogPageInfo: {
				pageIndex: 1,
				pageSize: 100
			},
			materialRepeat: [],  //物料维度的几个表格
			orderRepeat: [],  //订单维度的几个表格
			newWarnTime: "",
			changeWarnTimeDialogShow: false,
			detailsWarnTimeDialogShow: false,
			dialogMaterialConcern: [],
			dialogMaterialNameValue: [],
			dialogMaterialNameList: [],
			warnTimeStateValue: [],
			warnTimeStateList: [
				{
					label: '已到期',
					value: 'EXPIRED_TIME'
				},
				{
					label: '未到期',
					value: 'NOT_EXPIRED_TIME'
				}
			],
			dialogHeaderData: [],
			dialogBodyData: [],
			dialogAllNumber: 0,
			dialogSelectedIndex: [],
			setNewWarnTimeData: [],
			dialogRealData: [],
			resData: {},
			screenSelectLocationList: [], //筛选里的地点
			screenMaterialConcern: [], //筛选里的物料关心度
			screenMaterialNameValue: [], //筛选里的物料名称
			screenMaterialNameList: [], //筛选里的物料名称列表
			lastIdList: [],	//最后一次查询的id集合（物料id或者订单id）
		}
	},

	computed: {
		//是否是物料维度
		isMaterialDimension() {
			return 	this.lookDimension === 'materialDimension'
		},
		//是否是订单维度
		isOrderDimension() {
			return 	this.lookDimension === 'orderDimension'
		},
		//点击查询按钮要用的数据
		searchBtnData() {
//			let returnData = {};

			//如果是物料维度
//			if(this.lookDimension === 'materialDimension'){
				return{
					startTime: this.date.startTime,
					endTime: this.date.endTime,
					locationFilterList: this.selectLocationList,
					materialWarnLevelList: this.materialConcern.length ? this.materialConcern : null,
					materialNameList: this.materialNameValue.length ? this.materialNameValue : null,
					isOnlyShowLack: this.onlyWarn,
					orderCodeList: null,
					saleOrderCodeList: null,
					materialIdList: null
				}
//			};

			//如果是订单维度
//			if(this.lookDimension === 'orderDimension'){
//				return{
//
//				}
//			};
		},
		//点击查询按钮要用的接口
		searchBtnUrl() {
			//物料维度
			if(this.lookDimension === 'materialDimension'){
				return this.url.material_warn_material;
			}
			//订单维度
			if(this.lookDimension === 'orderDimension'){
				return this.url.material_warn_order;
			}
		},
		//列配置接口
		colConfigUrl() {
			//物料维度
			if(this.isMaterialDimension){
				const materialRepeatLength = this.materialRepeat.length;
				//第一级
				if(materialRepeatLength === 1){
					return this.url.material_warn_material_col_config;
				}
				//第二级
				if(materialRepeatLength === 2){
					return this.url.material_warn_material_day_col_config;
				}
			}
			//订单维度
			if(this.isOrderDimension){
				const orderRepeatLength = this.orderRepeat.length;
				//第一级
				if(orderRepeatLength === 1){
					return this.url.material_warn_order_col_config;
				}
				//第二级
				if(orderRepeatLength === 2){
					return this.url.material_warn_order_order_col_config;
				}
				//第三级
				if(orderRepeatLength === 3){
					return this.url.material_warn_order_day_col_config;
				}
			}
		}
	},

	methods: {
		//打开列信息配置
		colConfig(){
			this.broadcast('colConfig', 'openColConfig');
		},
		//当前表格的列信息改变时
		colChange(){
			//物料维度
			if(this.isMaterialDimension){
				const materialRepeatLength = this.materialRepeat.length;
				//移除旧的
				this.materialRepeat.pop();
				//第一级
				if(materialRepeatLength === 1){
					this.searchTable("设置列信息成功！");
				}
				//第二级
				if(materialRepeatLength === 2){
					this.rowInfoPage(this.lastIdList);;
				}
			}
			//订单维度
			if(this.isOrderDimension){
				const orderRepeatLength = this.orderRepeat.length;
				//移除旧的
				this.orderRepeat.pop();
				//第一级
				if(orderRepeatLength === 1){
					this.searchTable("设置列信息成功！");
				}
				//第二级
				if(orderRepeatLength === 2){
					this.orderRowInfoPage(this.lastIdList);
				}
				//第三级
				if(orderRepeatLength === 3){
					this.orderSecondRowInfoPage(this.lastIdList);
				}
			}
		},
		//远程查询物料名称
		getMaterialName(query){
			query = query.replace(/\s/g,'');
			if(query === ''){
				this.materialNameList = [];
				return;
			}

			const _this = this;
			this.$http.get(
				this.url.get_material_name + '?materialName=' + query
			).then(
				res =>{
					_this.materialNameList = res.data.splice(0,1000);
				},
				res =>{
					this.$message.error('物料名称查询失败！请检查！');
				}
			);
		},
		//弹窗远程查询物料名称
		dialogGetMaterialName(query){
			query = query.replace(/\s/g,'');
			if(query === ''){
				this.dialogMaterialNameList = [];
				return;
			}

			const _this = this;
			this.$http.get(
				this.url.get_material_name + '?materialName=' + query
			).then(
				res =>{
					_this.dialogMaterialNameList = res.data.splice(0,1000);
				},
				res =>{
					this.$message.error('物料名称查询失败！请检查！');
				}
			);
		},
		//设置物料关心度
		setMaterialConcern(materialConcern){
			let setData = [],
				indexArr = this.materialRepeat[0].tableSelectIndexValue,
				pageData = this.materialRepeat[0].allData;

			for(let i = 0, l = indexArr.length; i < l; i++){
				setData.push({
					materialId: pageData[indexArr[i]].materialId,
					materialWarnLevel: materialConcern
				})
			}

			this.$http.post(
				this.url.set_material_concern,
				setData
			).then(
				res =>{
					this.searchTable('设置物料关心度成功！');
				},
				res =>{
					this.$message.error('设置物料关心度失败！请检查！');
				}
			);
		},
		//物料维度单行下钻
		detailsRowInfo(rowInfo){
			let rowIndex = rowInfo.rowIndex,
				pageData = this.materialRepeat[0].allData,
				materialId = [pageData[rowIndex].materialId];

			this.rowInfoPage(materialId);
		},
		//订单维度单行下钻
		orderDetailsRowInfo(rowInfo){
			let rowIndex = rowInfo.rowIndex,
				allData = this.orderRepeat.slice().pop().allData,
				orderCode = [allData[rowIndex].orderCode];

			this.orderRowInfoPage(orderCode);
		},
		//物料维度多行下钻
		multipleDetailsRowInfo(){
			let materialId = [],
				indexArr = this.materialRepeat[0].tableSelectIndexValue,
				pageData = this.materialRepeat[0].allData;

			for(let i = 0, l = indexArr.length; i < l; i++){
				materialId.push(
					pageData[indexArr[i]].materialId
				)
			}

			this.rowInfoPage(materialId);
		},
		//订单维度多行下钻
		multipleOrderDetailsRowInfo(){
			let allData = this.orderRepeat.slice().pop().allData,
				indexArr = this.orderRepeat[0].tableSelectIndexValue,
				orderCode = [];

			for(let i = 0, l = indexArr.length; i < l; i++){
				orderCode.push(
					allData[indexArr[i]].orderCode
				)
			}

			this.orderRowInfoPage(orderCode);
		},
		//物料维度行下钻页面处理
		rowInfoPage(materialId){
			if(materialId.length === 0){
				this.$message.error('请在表格中选中至少一条！');
				return;
			}
			this.$http.post(
				this.url.material_warn_material_day,
				{
					startTime: this.date.startTime,
					endTime: this.date.endTime,
					locationFilterList: this.selectLocationList,
					isOnlyShowLack: this.onlyWarn,
					materialIdList: materialId
				}
			).then(
				res =>{
					let resData = res.data,
						column = resData.column,
						columnAlias = resData.columnAlias,
						realData = resData.materialRequirementInfoDtoList,
						returnData = [];

					//更新最后一次啊查询数据
					this.lastIdList = materialId;

					//保留原始数据和筛选后的数据
					this.resData[this.lookDimension].push({
						resData: resData,
						screenData: $.extend({},resData)
					});

					for(let i = 0, l = realData.length; i < l; i++){
						let thisRow = realData[i],
							returnRow = [];
						for(let i = 0, l = column.length; i < l; i++){
							if(column[i] === 'materialWarnLevel'){
								returnRow.push(this.materialConcernCnName[thisRow[column[i]]]);
								continue;
							}
							returnRow.push(thisRow[column[i]]);
						}
						returnData.push(returnRow);
					}
					this.materialRepeat.push({
						headerData: columnAlias,
						bodyData: returnData,
						allNumber: returnData.length,
						printTitle: '日缺料明细',
						operation: false,
						selection: false,
						detailsRowInfo: ()=>{},
						pageChange: this.pageChange
					});
					this.$message.success('查询成功！');
				},
				res =>{
					this.$message.error('查询失败！');
				}
			)
		},
		//订单维度行下钻页面处理
		orderRowInfoPage(orderCode){
			if(orderCode.length === 0){
				this.$message.error('请在表格中选中至少一条！');
				return;
			}
			this.$http.post(
				this.url.material_warn_order_order,
				{
					startTime: this.date.startTime,
					endTime: this.date.endTime,
					isOnlyShowLack: this.onlyWarn,
					orderCodeList: orderCode
				}
			).then(
				res =>{
					let resData = res.data,
						realData = resData.materialRequirementInfoDtoList,
						screenMaterialNameList = [];

					//更新最后一次查询数据
					this.lastIdList = orderCode;

					//保留原始数据和筛选后的数据
					this.resData[this.lookDimension].push({
						resData: resData,
						screenData: $.extend({},resData)
					});

					this.resToSecondTableData();

					//筛选里的物料名称下拉框
					for(let i = 0, l = realData.length; i < l; i++){
						let thisName = realData[i].materialName;
						if(screenMaterialNameList.indexOf(thisName) < 0){
							screenMaterialNameList.push(thisName);
						}
					}
					this.screenMaterialNameList = screenMaterialNameList;
				},
				res =>{
					this.$message.error('查询失败！');
				}
			)
		},
		//订单维度第二次单行下钻
		orderSecondDetailsRowInfo(rowInfo){
			let rowIndex = rowInfo.rowIndex,
				allData = this.orderRepeat.slice().pop().allData,
				searchData = [{
					locationId: allData[rowIndex].locationId,
					materialId: allData[rowIndex].materialId,
					orderCode: allData[rowIndex].orderCode,
				}];

			this.orderSecondRowInfoPage(searchData);
		},
		//订单维度第二次多行下钻
		multipleOrderSecondDetailsRowInfo(){
			let allData = this.orderRepeat.slice().pop().allData,
				indexArr = this.orderRepeat[1].tableSelectIndexValue,
				searchData = [];

			for(let i = 0, l = indexArr.length; i < l; i++){
				let thisIndex = indexArr;
				searchData.push({
					locationId: allData[thisIndex].locationId,
					materialId: allData[thisIndex].materialId,
					orderCode: allData[thisIndex].orderCode,
				});
			}

			this.orderSecondRowInfoPage(searchData);
		},
		//订单维度第二次行下钻处理
		orderSecondRowInfoPage(searchData){
			if(searchData.length === 0){
				this.$message.error('请在表格中选中至少一条！');
				return;
			}
			this.$http.post(
				this.url.material_warn_order_day,
				{
					startTime: this.date.startTime,
					endTime: this.date.endTime,
					orderCodeQueryDtoList: searchData
				}
			).then(
				res =>{
					let resData = res.data,
						column = resData.column,
						columnAlias = resData.columnAlias,
						realData = resData.materialRequirementInfoDtoList,
						pageData = realData.slice().splice(this.pageInfo.pageSize * (this.pageInfo.pageIndex - 1), this.pageInfo.pageSize * this.pageInfo.pageIndex - 1),
						returnData = [];

					//更新最后一次查询条件
					this.lastIdList = searchData;

					for(let i = 0, l = pageData.length; i < l; i++){
						let thisRow = pageData[i],
							returnRow = [];
						for(let i = 0, l = column.length; i < l; i++){
							if(column[i] === 'materialWarnLevel'){
								returnRow.push(this.materialConcernCnName[thisRow[column[i]]]);
								continue;
							}
							returnRow.push(thisRow[column[i]]);
						}
						returnData.push(returnRow);
					};
					this.orderRepeat.push({
						tableSelectIndexValue: [],
						headerData: columnAlias,
						bodyData: returnData,
						allNumber: realData.length,
						printTitle: '订单日缺料明细',
						allData: pageData,
						operation: false,
						selection: false,
						detailsRowInfo: ()=>{},
						pageChange: this.pageChange
					});
					this.$message.success('查询成功！');
				},
				res =>{
					this.$message.error('查询失败！');
				}
			);
		},
		//第一层的翻页（包括物料维度和订单维度）
		pageChange(val){
			this.pageInfo = val;
			this.resToTableData();
		},
		//查询表格数据
		searchTable(msgText = "查询成功!"){
			this.$http.post(
				this.searchBtnUrl,
				this.searchBtnData
			).then(
				res =>{
					this.resData[this.lookDimension] = [{
						resData: res.data,
						screenData: $.extend({},res.data)
					}];

					//订单维度遍历出主生产号和自制件号下拉框
					if(this.isOrderDimension){
						let realData = res.data.materialWarnInfoByOrderDtoList,
							orderCode = [],
							saleOrderCode = [];

						for(let i = 0, l = realData.length; i < l; i++){
							let thisOrderCode = realData[i].orderCode,
								thisSaleOrderCode = realData[i].saleOrderCode;

							//主生产计划号
							if(orderCode.indexOf(thisOrderCode) < 0){
								orderCode.push(thisOrderCode);
							}
							//销售订单号
							if(saleOrderCode.indexOf(thisSaleOrderCode) < 0){
								saleOrderCode.push(thisSaleOrderCode);
							}
						}
						//下拉框绑定页面
						this.saleOrderCodeList = saleOrderCode;
						this.orderCodeList = orderCode;
					}

					if(this.isMaterialDimension){
						this.materialRepeat.length = 1;
					}
					if(this.isOrderDimension){
						this.orderRepeat.length = 1;
					}

					this.resToTableData();
					this.$message.success(msgText);
				},
				res =>{
					this.$message.error('查询失败！');
				}
			)
		},
		//查询数据=>渲染数据
		resToTableData(){
			let resData = this.resData[this.lookDimension].slice().pop().screenData,
				column = resData.column,
				columnAlias = resData.columnAlias,
				realData = this.isMaterialDimension ? resData.materialRequirementInfoDtoList : resData.materialWarnInfoByOrderDtoList,
				pageData = realData.slice().splice(this.pageInfo.pageSize * (this.pageInfo.pageIndex - 1), this.pageInfo.pageSize * this.pageInfo.pageIndex - 1),
				bodyData = [];

			//构造这一页的表格数据
			for(let i = 0, l = pageData.length; i < l; i++){
				let thisRow = pageData[i],
					returnRow = [];
				for(let i = 0, l = column.length; i < l; i++){
					if(column[i] === 'materialWarnLevel'){
						returnRow.push(this.materialConcernCnName[thisRow[column[i]]]);
						continue;
					}
					returnRow.push(thisRow[column[i]]);
				}
				bodyData.push(returnRow);
			}

			if(this.isMaterialDimension){
				this.materialRepeat.pop();
				this.materialRepeat.push({
					tableSelectIndexValue: [],
					headerData: columnAlias,
					bodyData: bodyData,
					allNumber: realData.length,
					printTitle: '缺料汇总',
					allData: pageData,
					operation: true,
					selection: true,
					detailsRowInfo: this.detailsRowInfo,
					pageChange: this.pageChange
				});
				console.log(this.materialRepeat);
				return;
			}
			if(this.isOrderDimension){
				this.orderRepeat.pop();
				this.orderRepeat.push({
					tableSelectIndexValue: [],
					headerData: columnAlias,
					bodyData: bodyData,
					allNumber: realData.length,
					printTitle: '订单缺料详情',
					allData: pageData,
					operation: true,
					selection: true,
					detailsRowInfo: this.orderDetailsRowInfo,
					pageChange: this.pageChange
				});
				return;
			}
		},
		//查看明细
		viewDetails(){
			if(this.isMaterialDimension){
				this.multipleDetailsRowInfo();
				return;
			}
			if(this.isOrderDimension){
				if(this.orderRepeat.length === 1){
					this.multipleOrderDetailsRowInfo();
					return;
				};

				if(this.orderRepeat.length === 2){
					this.multipleOrderSecondDetailsRowInfo();
					return;
				};
			}
		},
		//表格下钻后的返回
		tableReturn(){
			this.resData[this.lookDimension].pop();
			if(this.isMaterialDimension){
				this.materialRepeat.pop();
				return;
			}
			if(this.isOrderDimension){
				this.orderRepeat.pop();
				return;
			}
		},
		//延迟预警(并且计算物料id)
		changeWarnTime(from){
			if(from === 'isDialog'){
				if(this.dialogSelectedIndex.length === 0){
					this.$message.error('请至少选择一条！');
					return;
				}

				this.setNewWarnTimeData = [];

				for(let i = 0, l = this.dialogSelectedIndex.length; i < l; i++){
					this.setNewWarnTimeData.push(this.dialogRealData[this.dialogSelectedIndex[i]].materialId);
				}

			}else{
				let thisTableData = this.materialRepeat.slice().pop(),
					thisIndexArr = thisTableData.tableSelectIndexValue,
					thisAllData = thisTableData.allData.slice().splice((this.pageInfo.pageIndex - 1) * this.pageInfo.pageSize, this.pageInfo.pageIndex * this.pageInfo.pageSize - 1);
				if(thisIndexArr.length === 0){
					this.$message.error('请至少选择一条！');
					return;
				}

				this.setNewWarnTimeData = [];

				for(let i = 0, l = thisIndexArr.length; i < l; i++){
					this.setNewWarnTimeData.push(thisAllData[thisIndexArr[i]].materialId);
				}
			}

			this.changeWarnTimeDialogShow = true;
		},
		//打开延迟详情
		detailsWarnTime(){
			this.getDetailsWarnTimeInfo();
			this.detailsWarnTimeDialogShow = true;
		},
		//查询延迟详情表格数据
		getDetailsWarnTimeInfo(){
			this.$http.post(
				this.url.search_warn_time,
				{
					apsMaterialWarnLevelEnumList: this.dialogMaterialConcern,
					apsMaterialWarnTimeEnumList: this.warnTimeStateValue,
					materialNameList: this.dialogMaterialNameValue,
					pageNum: this.dialogPageInfo.pageIndex,
					pageSize: this.dialogPageInfo.pageSize
				}
			).then(
				res =>{
					const resData = res.data,
						  column = ['apsMaterialWarnLevelEnum','materialCode','materialName','materialUnit','materialSpec','warnTime'],
						  columnAlias = ['物料关心度','物料编号','物料名','单位','规格','延迟时间'],
						  realData = resData.dataList,
						  returnData = [];

					for(let i = 0, l = realData.length; i < l; i++){
						let rowData = realData[i],
							returnRowData = [];

						for(let i = 0, l = column.length; i < l; i++){
							if(column[i] === 'apsMaterialWarnLevelEnum'){
								returnRowData.push(this.materialConcernCnName[rowData[column[i]]]);
								continue;
							}

							returnRowData.push(rowData[column[i]]);
						}

						returnData.push(returnRowData);
					}

					this.dialogAllNumber = realData.length;
					this.dialogRealData = realData;
					this.dialogHeaderData = columnAlias;
					this.dialogBodyData = returnData;
				},
				res =>{
					this.$message.error('查询失败！');
				}
			)
		},
		//删除延迟预警
		deleteWarnTime(){
			let setBody = [];

			if(this.dialogSelectedIndex.length === 0){
				return;
			}

			for(let i = 0, l = this.dialogSelectedIndex.length; i < l; i++){
				setBody.push({
					materialId: this.dialogRealData[this.dialogSelectedIndex[i]].materialId
				});
			}

			this.$http.post(
				this.url.delete_warn_time,
				setBody
			).then(
				res =>{
					this.$message.success('操作成功！');
					this.getDetailsWarnTimeInfo();
				},
				res =>{
					this.$message.error('操作失败！');
				}
			)
		},
		//延迟预警-确定
		changeWarnTimeSure(){
			let setBody = [];

			for(let i = 0, l = this.setNewWarnTimeData.length; i < l; i++){
				setBody.push({
					materialId: this.setNewWarnTimeData[i],
					warnTime: this.newWarnTime
				})
			}

			this.$http.post(
				this.url.set_warn_time,
				setBody
			).then(
				res =>{
					if(res.data === true){
						this.changeWarnTimeDialogShow = false;
						if(this.detailsWarnTimeDialogShow){
							this.getDetailsWarnTimeInfo();
						}else{
							//看情况要不要刷新物料表格
							this.searchTable('延迟预警成功！');
						}

					}else{
						//提示，但是不关弹窗
						this.$message.error('操作失败！');
					}
				},
				res =>{
					this.$message.error('操作失败！');
				}
			)
		},
		//获取延迟预警时间
		getNewWarnTime(val){
			this.newWarnTime = val
		},
		//延迟详情表格翻页
		dialogPageChange(newPageInfo){
			this.dialogPageInfo.pageIndex = newPageInfo.pageIndex;
			this.dialogPageInfo.pageSize = newPageInfo.pageSize;

			this.getDetailsWarnTimeInfo();
		},
		//订单维度一级界面筛选
		screenOrderFirstTable(){
			if(!this.resData[this.lookDimension]){
				return;
			}
			//一级表格的原始数据
			let resData = this.resData[this.lookDimension].slice().pop().resData,
				orderCode = this.orderCodeValue,
				saleOrderCode = this.saleOrderCodeValue,
				//遍历除符合要求的数据
				newResData = resData.materialWarnInfoByOrderDtoList.filter(item =>{
					return (orderCode.length === 0 || orderCode.indexOf(item.orderCode) > -1)
							&&
						   (saleOrderCode.length === 0 || saleOrderCode.indexOf(item.saleOrderCode) > -1)
				});
			this.resData[this.lookDimension][0].screenData.materialWarnInfoByOrderDtoList = newResData;
//			this.$message.success('筛选成功！');
			this.resToTableData();
		},
		//订单维度二级界面筛选
		screenSecondFirstTable(){
			if(!this.resData[this.lookDimension]){
				return;
			}
			//二级表格的原始数据
			let resData = this.resData[this.lookDimension].slice().pop().resData,
				locationId = this.screenSelectLocationList,
				materialConcern = this.screenMaterialConcern,
				materialNameValue = this.screenMaterialNameValue,
				//遍历除符合要求的数据
				newResData = resData.materialRequirementInfoDtoList.filter(item =>{
					return (locationId.length === 0 || locationId.indexOf(item.locationId) > -1)
							&&
						   (materialConcern.length === 0 || materialConcern.indexOf(item.materialWarnLevel) > -1)
							&&
						   (materialNameValue.length === 0 || materialNameValue.indexOf(item.materialName) > -1)
				});
			this.resData[this.lookDimension][1].screenData.materialRequirementInfoDtoList = newResData;
//			this.$message.success('筛选成功！');
			this.resToSecondTableData();
		},
		//订单维度二级表格页面渲染
		resToSecondTableData(){
			let resData = this.resData[this.lookDimension].slice().pop().screenData,
				column = resData.column,
				columnAlias = resData.columnAlias,
				realData = resData.materialRequirementInfoDtoList,
				pageData = realData.slice().splice(this.pageInfo.pageSize * (this.pageInfo.pageIndex - 1), this.pageInfo.pageSize * this.pageInfo.pageIndex - 1),
				returnData = [];

			for(let i = 0, l = pageData.length; i < l; i++){
				let thisRow = pageData[i],
					returnRow = [];
				for(let i = 0, l = column.length; i < l; i++){
					if(column[i] === 'materialWarnLevel'){
						returnRow.push(this.materialConcernCnName[thisRow[column[i]]]);
						continue;
					}
					returnRow.push(thisRow[column[i]]);
				}
				returnData.push(returnRow);
			}

			if(this.orderRepeat.length > 1){
				this.orderRepeat.pop();
			}
			this.orderRepeat.push({
				tableSelectIndexValue: [],
				headerData: columnAlias,
				bodyData: returnData,
				allNumber: realData.length,
				printTitle: '订单缺料汇总',
				allData: pageData,
				operation: true,
				selection: true,
				detailsRowInfo: this.orderSecondDetailsRowInfo,
				pageChange: this.pageChange
			})
		}
	},
	mounted(){

	}
}
</script>

<style rel="stylesheet/scss" lang="scss">

	.input-radio{
		margin-right: 10px;
	}

	.material-warn{
		.material-warn-checkbox{
			margin: 20px 30px 0 0;
		}
		//查询条件筛选
		.query-conditions-list{
			display: flex;
			flex-wrap: wrap;

			.query-conditions{
				margin: 20px 30px 0 0;
				flex :0 1 265px;
			}
		}

		.el-dropdown{
			margin: 20px 10px 0 0;

			.el-button{
				line-height: 30px;
				border: none;
				padding: 0 15px;
				background-color: #1E7CD9;
			}
		}

		.default-btn{
			margin-right: 10px;
		}

		.changeWarnTimeDialog{
			width: 320px;

			.el-dialog__body{
				padding: 30px 20px 10px;
				text-align: center;
			}
			.el-date-editor{
				margin-left: 10px;
			}
		}

		.el-dialog{
			transform: translate(-50%,-50%);
		}

		.detail-warn-time-dialog-main{
			display: flex;
			flex-direction: column;
			max-height: calc(90vh - 100px);
			background-color: #fff;

			.query-conditions{
				margin: 0 30px 20px 0;
			}

			.warn-time-dialog-main{
				flex: 1 1;
				overflow: hidden;
			}
		}

		.material-warn-main{
			position: relative;

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
				top: -8px;
				right: 30px;
			}
			.query-conditions{
				margin: 0 30px 10px 0;
				flex :0 1 265px;
			}
		}
	}

</style>
