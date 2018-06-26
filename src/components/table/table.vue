<template>
	<div class="aps-table" :class="className">
		<div class="aps-table-function" v-if="apsTableFunctionShow">
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
						<tr 
						    v-for="(row,rowIndex) in bodyData"
						    :class="getRowClass(rowIndex)">
							<td
								v-if="selection"
								class="aps-table-selection no-print tc"
								:style="{
									transform:'translateX(' + scrollX + 'px)'
								}">
								<label
									:class='{
										"aps-table-selected": value.indexOf(rowIndex) > -1
									}'>
									<input type="checkbox" @click="selectRow(rowIndex)">
								</label>
							</td>
							<td
								:style="{
									transform:'translateX(' + scrollX + 'px)'
								}"
								class="aps-table-details no-print tc"
								v-if="showOperation">
								<i
									class="aps-table-details"
									@click="detailsRowInfo(rowIndex,$event)"
									v-if="operation">
								</i>
								<i
									class="aps-table-edit"
									@click="rowEditClick(rowIndex,$event)"
									v-if="rowEdit">
								</i>
								<i
									class="aps-table-change"
									@click="rowChangeClick(rowIndex,$event)"
									v-if="rowChange">
								</i>
							</td>
							<td
								v-for="(cell,index) in row"
								:style="{
									transform:index < fixedNumber ? 'translateX('+ scrollX +'px)':''
								}"
								:colspan="cell.col || 1"
								:rowspan="cell.row || 1">
								{{cell.label === undefined ? cell : cell.label}}
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
									}'
									v-if="!single">
									<input type="text" @click="selectAll">
								</label>
							</th>
							<th
								:style="{
									transform:'translateX('+ scrollX +'px)'
								}"
								class="no-print"
								v-if="showOperation">
								操作
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
		className: String,    //自定义类名
		printTitle: String,   //打印的标题
		headerData: Array,    //表头数据
		bodyData: Array,      //表格数据
		allNumber: Number,    //总数（分页）
		selection: Boolean,   //可选择
        single: Boolean,      //是否单选
		operation: Boolean,   //查看（这个及下面两个暂放，用jsx或者其他方法进一步实现）
        rowEdit: Boolean,     //修改工单开始时间
        rowChange: Boolean,   //微调
		order: Boolean,       //索引列
		excel: Boolean,       //开启导出excel
		print: Boolean,       //开启打印
		page: Boolean,        //开启分页
		value: Array,         //选中的行号
        rowClassName: Function//自定义行类名
	},
    
    computed:{
        apsTableFunctionShow(){
            return this.excel || this.print || !t.isEmptyObject(this.$slots)
        },
        showOperation(){
            return this.operation || this.rowEdit || this.rowChange;
        }
    },

	watch: {
		bodyData(n){
			this.$nextTick(()=>{
				this.tableDom = $(this.$refs.tableScroll);
			})
		},
        single(n){
            if(n){
                this.$emit('input', []);
            }
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
        rowEditClick(rowInfo,thisEle){
            let emitInfo = {
				rowIndex: rowInfo,
				element: thisEle
			}
			this.$emit('rowEdit', emitInfo);
        },
        rowChangeClick(rowInfo,thisEle){
            let emitInfo = {
				rowIndex: rowInfo,
				element: thisEle
			}
			this.$emit('rowChange', emitInfo);
        },
		selectRow(rowIndex){
			const index = this.value.indexOf(rowIndex),
				  value = this.value.slice();
            
            //如果是单选
            if(this.single){
                //提交一次改变   
                if(index > -1){
                    //提交一次改变
                    this.$emit('singleSelect', '');    
                    this.$emit('input', []);
                }else{
                    //提交一次改变
                    this.$emit('singleSelect', rowIndex);   
                    this.$emit('input', [rowIndex]);
                }
                return;
            }

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
		},
        getRowClass(rowIndex){
            if(this.rowClassName){
                return this.rowClassName(rowIndex);
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
@import "../../styles/resetStyle.scss";

.aps-table{
	display: flex;
	width: 100%;
	height: 100%;
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
			background: url(../../assets/table-function.png) #fff left top no-repeat;
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
                    white-space: nowrap;
                    
                    i{
                        width: 14px;
						height: 14px;
                        margin: 0 5px;
						background: url(../../assets/table-operation-icon.png) #fff no-repeat;
                        cursor: pointer;
                        &:hover{
                            background-position-y: 0;
                        }
                    }
					.aps-table-details{
						background-position: 0 -14px;
					}
					.aps-table-edit{
						background-position: -28px -14px;
					}
					.aps-table-change{
						background-position: -14px -14px;
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
					background:  url(../../assets/cascader-state.png) #fff left center no-repeat;
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
