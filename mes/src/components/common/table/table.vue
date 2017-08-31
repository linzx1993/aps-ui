<template>
	<div class="aps-table">
		<div class="aps-table-function">
			<i class="aps-table-order"></i>
			<i class="aps-table-excel"></i>
			<i class="aps-table-print"></i>
		</div>
		<div class="aps-table-main" ref="tableScroll">
			<div class="aps-table-body">
				<table>
					<tbody>
						<tr v-for="(row,index) in bodyData">
							<td 
								v-if="selection"
								class="aps-table-selection"
								:style="{
									transform:'translateX(' + scrollX + 'px)'
								}">
								<label>
									<input type="text">
								</label>
							</td>
							<td
								:style="{
									transform:'translateX(' + scrollX + 'px)'
								}"
								class="aps-table-details"
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
								class="aps-table-selection"
								:style="{
									transform:'translateX('+ scrollX +'px)'
								}">
								<label>
									<input type="text">
								</label>
							</th>
							<th
								:style="{
									transform:'translateX('+ scrollX +'px)'
								}"
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
		<div class="aps-table-page">
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
			selection: false,
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
		headerData: Array,
		bodyData: Array,
		allNumber: Number,
		operation: {
			default: true
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
		}
	},
	
	mounted(){
		let thisM = this;
		//滚动联动
		this.$refs.tableScroll.addEventListener('scroll', function() {
			thisM.scrollY = this.scrollTop;
			thisM.scrollX = this.scrollLeft;
        });
	}
}
</script>

<style rel="stylesheet/scss" lang="scss">
@import "../../../styles/resetStyle.scss";

.aps-table{
	display: flex;
	width: 100%;
	height: 100%;
	overflow: hidden;
	flex-direction: column;
	
	.aps-table-function{
		flex: 0 0 20px;
//		display: flex;
		flex-direction:row-reverse;
		margin-bottom: 10px;
		display: none;
		
		i{
			flex: 0 0 20px;
			margin: 0 5px;
			height: 20px;
			background: url(../../../assets/table-function.png) #fff left top no-repeat;
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
						background: url(../../../assets/details.png) #fff left top no-repeat;
						cursor: pointer;
					}
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
					background:  url(../../../assets/cascader-state.png) #fff left center no-repeat;

					input{
						display: none
					}
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