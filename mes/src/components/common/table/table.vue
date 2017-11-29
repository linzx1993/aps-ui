<template>
	<div class="aps-table" :class="className">
		<div class="aps-table-function">
			<i class="aps-table-order icon" v-if="order"></i>
			<export-excel :dom-data="tableDom" selfClass="ml-5" v-if="excel">
			</export-excel>
			<print-table :dom-data="tableDom" selfClass="ml-5" :printTitle="printTitle" v-if="print"></print-table>
			<slot>
				
			</slot>
		</div>
		<div class="aps-table-main" ref="tableScroll">
			<div class="aps-table-body">
				<table>
					<tbody>
						<tr v-for="(row,index) in bodyData">
							<td
								v-if="selection"
								class="aps-table-selection no-print tc"
								:style="{
									transform:'translateX(' + scrollX + 'px)'
								}">
								<label
									:class='{
										"aps-table-selected": value.indexOf(index) > -1
									}'>
									<input type="checkbox" @click="selectRow(index)">
								</label>
							</td>
							<td
								:style="{
									transform:'translateX(' + scrollX + 'px)'
								}"
								class="aps-table-details no-print tc"
								v-if="operation">
								<i
									class="aps-table-details"
									@click="detailsRowInfo(index,$event)">
								</i>
							</td>
							<td
								v-for="(cell,index) in row"
								:style="{
									transform:index < fixedNumber ? 'translateX('+ scrollX +'px)':''
								}">
								{{cell}}
							</td>
						</tr>
					</tbody>
					<thead
						:style="{
							transform: 'translateY('+ scrollY +'px)'
						}">
						<tr>
							<th
								v-if="selection"
								class="aps-table-selection no-print"
								:style="{
									transform:'translateX('+ scrollX +'px)'
								}">
								<label
									:class='{
										"aps-table-selected": value.length === bodyData.length
									}'>
									<input type="text" @click="selectAll">
								</label>
							</th>
							<th
								:style="{
									transform:'translateX('+ scrollX +'px)'
								}"
								class="no-print"
								v-if="operation">
								查看
							</th>
							<th
								v-for="(item,index) in headerData"
								:style="{
									transform:index < fixedNumber ? 'translateX('+ scrollX +'px)':''
								}">
								{{item}}
							</th>
						</tr>
					</thead>
				</table>
			</div>
		</div>
		<div class="aps-table-page" v-if="page">
			<el-pagination
				@current-change="pageIndexChange"
				@size-change="pageSizeChange"
				:page-sizes="[100, 200, 300, 400]"
			  	:page-size="pageInfo.pageSize"
			  	:current-page.sync="pageInfo.pageIndex"
			 	layout="total, sizes, prev, pager, next, jumper"
			 	:total="allNumber">
			</el-pagination>
		</div>
	</div>
</template>

<script>
export default{

	name: 'apsTable',

	data(){
		return{
			tableDom: {},
			scrollX: 0,
			scrollY: 0,
			fixedNumber: 0,
			pageInfo: {
				pageIndex: 1,
				pageSize: 100
			}
		}
	},

	props:{
		className: String,
		printTitle: String,
		headerData: Array,
		bodyData: Array,
		allNumber: Number,
		selection: Boolean,
		operation: Boolean,
		order: Boolean,
		excel: Boolean,
		print: Boolean,
		page: Boolean,
		value: Array
	},
	
	watch: {
		bodyData(n){
			this.$nextTick(()=>{
				this.tableDom = $(this.$refs.tableScroll);
			})
		}
	},

	methods: {
		pageIndexChange(val){
			this.$emit('pageChange', this.pageInfo)
		},
		pageSizeChange(val){
			this.pageInfo.pageSize = val;
			this.$emit('pageChange', this.pageInfo)
		},
		detailsRowInfo(rowInfo,thisEle){
			let emitInfo = {
				rowIndex: rowInfo,
				element: thisEle
			}
			this.$emit('detailsRowInfo', emitInfo);
		},
		selectRow(rowIndex){
			const index = this.value.indexOf(rowIndex),
				  value = this.value.slice();

			if(index > -1){
				value.splice(index,1);
			}else{
				value.push(rowIndex);
			}

			this.$emit('input', value);
		},
		selectAll(){
			const thisPageRowNum = this.bodyData.length,
				  value = [];

			if(this.value.length === thisPageRowNum){
				this.$emit('input', value);
			}else{
				for(let i = 0; i < thisPageRowNum; i++){
					value.push(i)
				}
				this.$emit('input', value);
			}

		}
	},

	mounted(){
		this.$nextTick(()=>{
			this.tableDom = $(this.$refs.tableScroll);
		})
		let thisM = this;
		//滚动联动
		this.$refs.tableScroll.addEventListener('scroll', function() {
			thisM.scrollY = this.scrollTop;
			thisM.scrollX = this.scrollLeft;
        });
	}
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "../../../styles/resetStyle.scss";

.aps-table{
	display: flex;
	width: 100%;
	height: 100%;
	overflow: hidden;
	flex-direction: column;

	.aps-table-function{
		display: flex;
		flex: 0 0 20px;
		justify-content: flex-end;
		margin-bottom: 5px;
		
		.icon{
			flex: 0 0 20px;
			margin-left: 5px;
			height: 20px;
			background: url(../../../asserts/table-function.png) #fff left top no-repeat;
			cursor: pointer;
		}
		.aps-table-order{
			background-position-x: 0;
		}
		.aps-table-excel{
			background-position-x: -20px;
		}
		.aps-table-print{
			background-position-x: -40px;
		}
	}
	.aps-table-main{
		border: 1px solid #ccc;
		overflow: auto;

		table{
			width: 100%;
			text-align: center;
			border-collapse: inherit;

			tr{
				th{
					padding: 0 4px;
					height: 36px;
					border: 1px solid #ccc;
					background-color: #1e7cd9;
					color: #fff;
					font-size: 14px;
					font-weight: normal;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
				td{
					padding: 0 4px;
					background-color: #fff;
					border: 1px solid #ccc;
					border-left: 0;
					border-top: 0;
					text-align: left;

					.aps-table-details{
						width: 12px;
						height: 12px;
						background: url(../../../asserts/details.png) #fff left top no-repeat;
						cursor: pointer;
					}
				}
				.tc{
					text-align: center;
				}
				&:nth-child(even){
					td{
						background-color: #f0f0f0;
					}
				}
			}
			.aps-table-selection{
				label{
					display: inline-block;
					width: 12px;
					height: 12px;
					background:  url(../../../asserts/cascader-state.png) #fff left center no-repeat;
					background-position: -24px 0;
					input{
						display: none
					}
				}
				.aps-table-selected{
					background-position: 0 0;
				}
			}
		}
	}
	.aps-table-page{
		margin-top: 10px;
		text-align: center;

		.el-input__inner{
			 width: 110px;
		}
	}
}
</style>
