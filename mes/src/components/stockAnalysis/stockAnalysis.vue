<template>
    <div class="relative right-content-box prediction-oee" v-loading.body="loading">
        <!--===============查询所需配置start============-->
        <aps-query-condition-box>
            <div class="stock-config">
                <span class="ban-shou" @click="showStockTrendConfig" title="预测自制件库存走势"></span>
                <el-dialog
                    title="预测自制件库存走势"
                    :visible.sync="isShowSetStockTrend"
                    size="tiny">
                    <p>
                        当前日期前的未完工或未取消自制件计划 ：
                        <el-switch
                            v-model="isConsiderMoPlanBeforeTodayConfig"
                            on-color="#1E7CD9"
                            off-color="#bfcbd9">
                        </el-switch>
                    </p>
                    <p class="mt-20">
                        库存阈值未设置，关闭表格高亮显示 ：
                        <el-switch
                            v-model="isHighShowBySetStock"
                            on-color="#1E7CD9"
                            off-color="#bfcbd9">
                        </el-switch>
                    </p>
                </el-dialog>
            </div>
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
                    v-show="showSchemeList.length > 0 && showSchemeList.length < 5">
                    <span class="add-schedule mr-5" @click=""><i class="added mr-5"></i>新加方案</span>
                </el-button>
                <label class="ml-20 input-checkbox had-save-schedule" for="hadSavedScheduleResult">
                    <input
                        id="hadSavedScheduleResult"
                        type="checkbox"
                        v-model="hadSavedScheduleResult">
                    <span class="checkBox-inner"></span>
                    已保存排程结果
                </label>
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
                        <el-button type="primary" @click="addPlan">确 定</el-button>
                    </span>
                </el-dialog>
            </div>
            <p class="mt-5 mb-10 flex">
                查看类型 ：
                <label class="input-radio" for="day">
                    <input
                        id="day"
                        name="lookDate"
                        type="radio"
                        value="lookDate"
                        v-model="lookDate">
                    <span class="checkBox-inner"></span>
                    按天
                </label>
            </p>
            <date-select
                v-model='date'>
            </date-select>
            <div class="query-conditions-list">
                <location-cascader
                    class="mt-20"
                    :writelocation="schemeIdList"
                    v-model="selectLocationList">
                </location-cascader>
                <div class="query-conditions mt-20 mr-10">
                    <span>库存状态 ： </span>
                    <aps-dropdown
                        v-model="stockValue"
                        multiple>
                        <aps-option
                            v-for="item in stockList"
                            :value="item.key"
                            :label="item.label">
                        </aps-option>
                    </aps-dropdown>
                </div>
                <div class="query-conditions mt-20">
                    <span>物料编码 ：</span>
                    <aps-dropdown
                        v-model="materialCodeValue"
                        multiple
                        remote
                        @remoteQuery='getMaterialCode'>
                        <aps-option
                            v-for='item in materialCodeList'
                            :label='item.materialCode'
                            :value='item.materialCode'>
                      </aps-option>
                    </aps-dropdown>
                </div>
                <div class="query-conditions mt-20">
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
                <a  class="default-btn mt-20" href="javascript:void(0);" @click="searchTableData">
                    查看
                </a>
            </div>
        </aps-query-condition-box>
        <!--===============查询所需配置end============-->
        <p class="c-theme-color" v-show="!hasSearchTable">{{showTips}}</p>
        <!--===============物料编码表start============-->
        <div class="aps-table table-data" v-show="hasSearchTable">
            <!--功能菜单列表-->
            <div class="function-menu-list">
                <print-table :dom-data="tableDom" :printTitle="printTitle" self-class="ml-10"></print-table>
                <export-excel :dom-data="tableDom" self-class="ml-10"></export-excel>
                <div class="ml-10 function-menu-icon relative">
                    <i class='col-config-icon' title='列信息配置' @click='toggleShowColumnConfig'></i>
                    <div class="transfer-box" v-show="isShowColumnConfig">
                        <h6 class="transfer-box-title">列信息显示配置项 <span class="close-btn fr" @click.stop="toggleShowColumnConfig"><img src="../../asserts/cancel.png" title="关闭" alt="关闭"></span></h6>
                        <div class="transfer-box-body">
                            <aps-transfer
                              :move="true"
                              :data="colColumnList"
                              v-model="selectColumn"
                              :titles='["未显示项","已显示列"]'
                            ></aps-transfer>
                        </div>
                        <div class="tc transfer-box-footer">
                            <a class="default-btn" href="javascript:;" @click="saveColumnConfig">保存</a>
                        </div>
                    </div>
                </div>
                <div class="ml-10 function-menu-icon relative">
                    <span class="mr-10 function-menu-icon set-order" @click="toggleShowSortConfig" title="排序配置"></span>
                    <div class="transfer-box" v-show="isShowSortConfig">
                        <h6 class="transfer-box-title">多列排序配置项 <span class="close-btn fr" @click.stop="toggleShowSortConfig"><img src="../../asserts/cancel.png" title="关闭" alt="关闭"></span></h6>
                        <div class="transfer-box-body">
                            <aps-transfer
                                :data="sortColumnList"
                                v-model="selectOrderList"
                                :filterable="true"
                                :move="true"
                                :order="true"
                                :titles='["未配置项","已配置项"]'
                            ></aps-transfer>
                        </div>
                        <div class="tc transfer-box-footer">
                            <a class="default-btn" href="javascript:;" @click="saveSortConfig">保存</a>
                        </div>
                    </div>
                </div>
            </div>
            <table class="" ref="mainTable">
                <thead>
                    <tr>
                        <th rowspan="2" v-for="th in tableData.head">{{th}}</th>
                        <th colspan="2" v-for="scheme in tableData.schemeTitleList">{{scheme}}</th>
                    </tr>
                    <tr>
                        <th v-for="scheme in tableData.schemeTitleValueList">{{scheme}}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(materialCode,index) in tableData.body" @click="lookMaterialCodeDetail(index)">
                        <td v-for="data in materialCode" :class="data.className">{{data.text}}</td>
                    </tr>
                </tbody>
            </table>
            <el-pagination
                v-show="hasSearchTable"
                class="tc"
                @size-change="handleSizeChange"
                @current-change="changePage"
                :current-page.sync="currentPage"
                :page-sizes="[10, 20, 30, 40]"
                :page-size="pageSize"
                layout="total,prev, pager, next"
                :total="pageTotalNum">
            </el-pagination>
        </div>
        <!--===============物料编码表end============-->
        <!--===============单个物料详细数据图标分析start============:style="hasSearchTable ? {opacity : 1} : {opacity : 0}"-->
        <div class="stock-analysis"  v-show="hasSearchTable">
            <nav class="tab-menu-list">
                <ul class="flex">
                    <li :class="isStockTrendTableShow ? 'active' : ''" class="tab-stock-trend"  @click="toggleShowEChartsOrTable">库存走势</li>
                    <li :class="!isStockTrendTableShow ? 'active' : ''" class="tab-stock-detail"  @click="toggleShowEChartsOrTable">库存明细</li>
                </ul>
            </nav>
            <p class="current-material">
              <export-excel class="fr mt-5 ml-10" :dom-data="stockDetailTableDom" v-if="!isStockTrendTableShow"></export-excel>
              <print-table class="fr mt-5 ml-10" :dom-data="stockDetailTableDom" :printTitle="singlePrintTitle" v-if="!isStockTrendTableShow"></print-table>
              物料编码 ： <span class="c-theme-color mr-20"> {{currentMatreialCode}} </span>
              当前库存: <span class="red">{{currentStockNum}}</span>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <span :class="currentStockClass ? 'red' : 'yellow'">警戒：低于最低库存{{minStockNum}}或高于最高库存{{maxStockNum}}</span>
            </p>
            <div v-show="isStockTrendTableShow" id="canvas" class="canavs"></div>
            <div v-show="!isStockTrendTableShow" class="aps-table stock-detail-tabel mt-30">
                <table ref="detailTable">
                    <thead>
                        <tr>
                            <th v-for="data in stockDetailTable[0]">{{data.date}}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="scheme in stockDetailTable">
                            <td v-for="data in scheme" :class="data.className">{{data.text}}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <!--===============单个物料详细数据图标分析end============-->
    </div>
</template>


<script>
  /*type="text/ecmascript-6"*/

  export default {
      data() {
          return  {
              isShowQueryBox : Boolean,
              isShowSetStockTrend : false,  //预测自制件库存走势配置的弹出框
              showTips : '点击按钮查看自制件库存走势',
              isConsiderMoPlanBeforeTodayConfig : true,  //  是否开启当前日期前的未完工或未取消自制件计划
              isConsiderMoPlanBeforeTodayOption : {},  //  当前日期前的未完工或未取消自制件计划=>接受和发送的数据
              isHighShowBySetStock : true,  //  是否开启库存阙值未设置，表格则不高亮显示（变扭的双重否定）
              isHighShowBySetStockOption : {},  //  库存阙值未设置，表格则不高亮显示=>接受和发送的数据
              hadSavedScheduleResult: false, //已保存排程结果
              lookDate: 'lookDate', //选择从哪个维度查看（现在默认是时间维度）
              allSchemeList: [], //新增方案下拉列表数据
              showSchemeList: [], //展示方案列表
              schemeIdList: [], //保存传递的数据
              selectSchemeValue: "", //新增方案选中值
              dialogVisible: false, // 新增方案对话框是否出现
              quickTime: "", // 快速选择时间判断
              date: {
                  startTime: +new Date(),
                  endTime: +new Date() + 86400000,
                  quickSelect : ['currentWeek','nextWeek','currentMonth','nextMonth'],
                  pickerOptions : {
                      disabledDate(time) {
                          return time.getTime() < new Date() - 86400000;
                      }
                  },
                  pickerEndOptions : {
                      disabledDate(time) {
                          return time.getTime() < new Date() - 86400000;
                      }
                  }
              },
              selectLocationList: [], //级联下拉地点选中数据
              stockList : [{key : 'UNDER_MIN_NUM',label : '低于最低库存'},{key : 'UNDER_SAFE_NUM',label : '低于安全库存'},{key : 'ABOVE_MAX_NUM',label : '高于最高库存'},{key : 'NOT_SET_MIN_NUM',label : '未设置最低库存'},{key : 'NOT_SET_SAFE_NUM',label : '未设置安全库存'},{key : 'NOT_SET_MAX_NUM',label : '未设置最高库存'}], //库存状态下拉列表
              stockValue : [], //选中的库存状态
              materialNameList : [], //物料名称下拉列表
              materialNameValue : [], //选中的物料名称
              materialCodeList : [], //物料编码下拉列表
              materialCodeValue : [], //选中的物料编码
              resStockData : [], //请求获得的数据
              tableData: {},  //物料编码表格数据
              loading : false,  //点击查看查询数据时，加个loading显示
              myCharts: '',
              isShowColumnConfig : false,  // 是否出现列信息显示项配置
              columnOptionList : [],  //所有的列信息显示配置
              colColumnList : [], //  所有列信息显示项
              selectColumn : [], //  当前已选择的列信息显示项
              isShowSortConfig : false, //排序配置项是否出现
              sortColumnList : [],  //排序配置列表的所有配置项
              selectOrderList : [],  //已选中的排序配置项
              hasSearchTable : false, //是否出现物料编码table表格，点击查看按钮表示出现为true
              currentPage : 1, //当前查看页
              pageSize : 10,  //每页查看的条数
              pageTotalNum : 0,  //总共有几页
              isStockTrendTableShow : true,
              currentMatreialCode : String, //当前点击表格的物料编码
              currentStockNum : Number, //当前点击表格的物料编码
              minStockNum : Number, //当前物料的最低库存
              maxStockNum : Number, //当前物料的最高库存
              currentStockClass : String, //当前库存对比提示语句样式用的class
              stockDetailTable : [],  //渲染库存详细表格用的table
              tableDom: {},	//主表格的dom
              stockDetailTableDom: {},	//详细表格的dom
          }
      },
	  computed: {
		  singlePrintTitle(){
			  return this.currentMatreialCode + "-" + this.date.startTime + "~" + this.date.endTime + "库存明细";
		  },
		  printTitle(){
			  return this.date.startTime + "~" + this.date.endTime + "库存预测";
		  }
	  },
      watch: {
          isConsiderMoPlanBeforeTodayConfig(val){
              //更新=》是否开启当前日期前的未完工或未取消自制件计划
              this.isConsiderMoPlanBeforeTodayOption.selectList[0].valueContent = Number(this.isConsiderMoPlanBeforeTodayConfig);
              this.$http.put(this.url.consider_mo_plan,this.isConsiderMoPlanBeforeTodayOption).then(res => {
                  return res.data;
              });
          },
          isHighShowBySetStock(val){
          //更新=》是否开启库存阙值未设置，表格则不高亮显示
          this.isHighShowBySetStockOption.selectList[0].valueContent = Number(this.isHighShowBySetStock);
          this.$http.put(this.url.high_show_compare_Stock,this.isHighShowBySetStockOption).then(res => {
            //  如果为0 ，说明没有查询到任何物料编码数据，如果不为0，则开始正常处理数据表格
            if(this.pageTotalNum === 0){
              this.showTips = "当前未查询到任何数据";
              this.hasSearchTable = false; //没有数据，不出现表格
            }else{
              //获取渲染表格的数据
              this.tableData = this.packageTable();
              //获取所有的排序配置项
              this.sortColumnList = this.getAllSortConfig();
              this.hasSearchTable = true; //所有处理完毕，出现表格
              //设置配置项的选中
              this.selectOrderList = this.resStockData.selectOrderColumn;
            }
            return res.data;
          });
        },
          tableData(){
              this.$nextTick(()=>{
                  this.tableDom = $(this.$refs.mainTable);
              })
          },
          stockDetailTable(){
              this.$nextTick(()=>{
                  this.stockDetailTableDom = $(this.$refs.detailTable);
              })
          },
      },
      mounted() {
          this.$nextTick(() => {
              //等dom渲染完毕，初始化图表
              this.myCharts = this.echarts.init(document.getElementById('canvas'));
          });
          //获取所有方案
          this.$http.get(this.url.test_writable).then((res) => {
              this.allSchemeList = res.data;
              //从排程后页面进入，判断url里面是否带有方案参数，如果带有方案的话，则页面初始显示该方案
              let schemeId = t.getUrlParams('schemeId');
              this.showSchemeList = this.allSchemeList.filter((item) => {
                  return item.schemeId === schemeId;
              });
              this.getSchemeIdList();
          });
          //获取当前日期前的未完工或未取消自制件计划
          this.$http.get(this.url.consider_mo_plan).then(res => {
          	  //valueContent = 0表示false
              this.isConsiderMoPlanBeforeTodayOption = res.data;
              this.isConsiderMoPlanBeforeTodayConfig = this.isConsiderMoPlanBeforeTodayOption.selectList[0].valueContent !== "0";
          });
          //库存阙值未设置汇总表格高亮不显示
          this.$http.get(this.url.high_show_compare_Stock).then(res => {
              this.isHighShowBySetStockOption = res.data;
              this.isHighShowBySetStock = !(this.isHighShowBySetStockOption.selectList[0].valueContent === "0");
          });
          //获取所有的列信息配置项
          this.getAllColumnConfig();
          let _this = this;
          window.onresize = function(){
              setTimeout(_this.myCharts.resize,100);
          }
      },
      methods: {
      	  //出现右上角的配置框
          showStockTrendConfig(){
          	  this.isShowSetStockTrend = true;
          },
          /**
           * desc:弹出添加方案的对话框
           * time:2017-09-19
           * last : linzx
           **/
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
        /**
         * desc:获取所有选择方案的id
         * time:2017-09-19
         * last : linzx
         * @return: [id1,id2,id3]
         **/
          getSchemeIdList(){
              this.schemeIdList = [];
              this.showSchemeList.forEach((item) => {
                  this.schemeIdList.push(item.schemeId);
              });
          },
          /**
           * desc:删除当前点击的方案
           * time:2017-09-19
           * last : linzx
           * @param: data{string} ：删除方案的id
           **/
          deleteScheme(data) {
              this.showSchemeList = this.showSchemeList.filter((item) => {
                  return item.schemeId !== data.schemeId;
              });
              this.getSchemeIdList();
          },
          /**
           * desc:点击新增方案的确定按钮，增加所选方案
           * time:2017-09-19
           * last : linzx
           **/
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
          //获取已保存方案预测的数据
          getHadSavedSchedule(){
              const url = this.url.result_equipment_oee + `?startTime=${t.getCorrectDate(this.startTime)}&endTime=${t.getCorrectDate(this.endTime)}&equipmentTypeIdList=${this.equipmentTypeValue}&equipmentIdAndTypeList=${this.equipmentValue}&dimensionTypeEnum=EQUIPMENTTYPE&isCalculateUnusedEquip=1&locationIdList=${this.selectLocationList.join()}`;
              this.$http.get(url).then((res) => {
                  //修改为已保存的名字
                  res.data.longitudinalAxisData[0].schemeName = '已保存';
                  //如果之前没有任何查询，则直接是用户，如果有数据，则将y轴的值合进去
                  if (t.isEmptyObject(this.allSchemeCompareData.horizontalAxisData)) {
                      this.allSchemeCompareData = res.data;
                  } else {
                      this.allSchemeCompareData.longitudinalAxisData = this.allSchemeCompareData.longitudinalAxisData.concat(res.data.longitudinalAxisData);
                  }
                  this.packageECharts();
              })
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
          //前台根据表格的显示项获取所有的排序配置项
          getAllSortConfig(){
          	  const sortColumnList = [];
          	  //获取除方案外固定名字的显示项
              this.resStockData.optionOrderColumn.forEach((item,index) => {
                  sortColumnList.push({
                      value : item,
                      isSelected : false,
                      label : this.resStockData.optionOrderColumnAlias[index]
                  })
              });
              //因为后台排序如果是依据方案一（峰值/谷值）进行排序，需要专门方案对应的key值，
              // 所以需要根据请求方案ID数组去一一匹配表格数据里对应的key和text文案
              //先判断是否有已保存的方案
              let allMaterialData = this.resStockData.moInventoryPlanDtoList[0];
              if(this.hadSavedScheduleResult){
                  //已保存方案非常特殊，对应key值为scheme1Id
                  let key = "scheme1";
                  //输入峰值，谷值的配置项
                  sortColumnList.push({value : key + "MinNum",label : allMaterialData[key + "Name"] + "谷值"});
                  sortColumnList.push({value : key + "MaxNum",label : allMaterialData[key + "Name"] + "峰值"});
              }
              //再去获取所有的临时方案
              this.schemeIdList.forEach(schemeId => {
              	  for(let i in allMaterialData){
              	  	  //根据方案id相等获取到后台该方案对应的key,
                      //后面加个indexOf是为了避免有些value值与id一致
              	  	  if((schemeId === allMaterialData[i]) && (i.indexOf('scheme') > -1)){
              	  	  	  let key = i.replace("value","");
              	  	  	  //输入峰值，谷值的配置项
                          sortColumnList.push({value : key + "MinNum",label : allMaterialData[key + "Name"] + "谷值"});
                          sortColumnList.push({value : key + "MaxNum",label : allMaterialData[key + "Name"] + "峰值"});
                      }
                  }
              });

              return sortColumnList
          },
          //获取所有的列信息显示项配置信息
          getAllColumnConfig(){
          	  this.$http.get(this.url.stock_column_config).then((res) => {
          	  	  this.columnOptionList = res.data.optionList;
          	  	  this.colColumnList = this.columnOptionList.map(item => {
          	  	  	  return {
          	  	  	  	  value : item.valueContent,
                          label : item.valueAlias,
                          isSelected : false,
                      }
                  });
              })
          },
          //列信息显示配置项点击排序icon表格出现，再点击表格消失
          toggleShowColumnConfig(){
              this.isShowColumnConfig = !this.isShowColumnConfig;
              this.isShowSortConfig = false;
          },
          //保存显示哪一些列信息显示项
          saveColumnConfig(){
          	  const postData = {optionList : this.columnOptionList,selectList : []};
              this.selectColumn.forEach(selectItem => {
              	  const option = Object.assign({},this.columnOptionList.filter(item => {
              	  	  return selectItem === item.valueContent
                  })[0]);
              	  postData.selectList.push(option)
              });
              if(postData.selectList.length === 0){
                  this.$message.error("必需选择一项显示项");
              	  return;
              }
          	  this.$http.put(this.url.stock_column_config,postData).then((res) => {
                    this.isShowColumnConfig = false;
                    this.searchTableData();
              });
          },
          //排序配置项点击排序icon表格出现，再点击表格消失
          toggleShowSortConfig(){
              this.isShowSortConfig = !this.isShowSortConfig;
              this.isShowColumnConfig = false;
          },
        //存储当前配置项的排序规则，重新向后台申请数据
          saveSortConfig(){
              this.searchTableData();
              this.isShowSortConfig = false;
          },
          //点击查看按钮查询库存表的数据
          searchTableData(){
              const data = {
                  schemeIdList : this.schemeIdList,
                  startTime : t.getCorrectDate(this.date.startTime),
                  endTime : t.getCorrectDate(this.date.endTime),
                  isConsiderResultData : this.hadSavedScheduleResult,
                  considerMoPlanBeforeTodayConfig : this.isConsiderMoPlanBeforeTodayConfig,
                  locationFilterList : this.selectLocationList,
                  materialInventoryStateEnums : this.stockValue,  //库存状态
                  materialNameList : this.materialNameValue,
                  materialCodeList : this.materialCodeValue,
                  selectOrderList : this.selectOrderList
              };
              //如果用户没有选择方案,同时
              if (!this.hadSavedScheduleResult && this.schemeIdList.length === 0) {
                  this.$message.error('请至少选择一个方案查看');
                  return;
              }
              this.loading = true;
              this.$http.post(this.url.stock_analysis,data).then((res) => {
                  this.loading = false;
                  this.resStockData = res.data;
                  this.pageTotalNum = this.resStockData.moInventoryPlanDtoList.length;
                  //  如果为0 ，说明没有查询到任何物料编码数据，如果不为0，则开始正常处理数据表格
                  if(this.pageTotalNum === 0){
                      this.showTips = "当前未查询到任何数据";
                      this.hasSearchTable = false; //没有数据，不出现表格
                  }else{
                      //获取渲染表格的数据
                      this.tableData = this.packageTable();
                      //获取所有的排序配置项
                      this.sortColumnList = this.getAllSortConfig();
                      this.hasSearchTable = true; //所有处理完毕，出现表格
                      //设置配置项的选中
                      this.selectOrderList = this.resStockData.selectOrderColumn;
                  }
              },() => {
                this.loading = false;
                this.showTips = "查询数据失败，请检查服务器";
              })
          },
          //对表格数据处理的封装
          packageTable(){
          	  // 确定table的显示顺序
          	  this.selectColumn = this.resStockData.column;
          	  //  获得所有数据
          	  let totalData = this.resStockData.moInventoryPlanDtoList;

              //  根据分页代码，获得当前一页需要显示的数据
              let displayTableData = totalData.slice((this.currentPage - 1) * this.pageSize,this.currentPage * this.pageSize);

          	  let tableData = {
          	  	  head : this.resStockData.columnAlias,
                  schemeTitleList : [],
                  schemeTitleValueList : [],
                  body : []
              };

          	  // 物料编码表格的数据
              displayTableData[0].moInventorySchemeDtoList.forEach(scheme => {
                  //任务一：获取物料编码表格的数据
                  tableData.schemeTitleList.push(scheme.schemeName);
                  tableData.schemeTitleValueList.push("谷值");//方案谷值
                  tableData.schemeTitleValueList.push("峰值");//方案峰值
              });
              displayTableData.forEach(materialCode => {
          	  	  let tr = [];
                  //  根据列显示项的内容，去获取用于每一个tr中td的内容
                  this.selectColumn.forEach(item => {
                  	  if(item === 'maxInventoryNum' || item === 'minInventoryNum' || item === 'safeInventoryNum'){
                  	  	  //如果用户因为未设置参数，使值小于-1，则将数据改为0
                          tr.push({text : materialCode[item]});
                      }else{
                          tr.push({text : materialCode[item]});
                      }
                  });
                  let maxInventoryNum = materialCode.maxInventoryNum,
                      minInventoryNum = materialCode.minInventoryNum,
                      safeInventoryNum = materialCode.safeInventoryNum;

                  //  根据方案列表获取每一个方案里面的数据
                  materialCode.moInventorySchemeDtoList.forEach(scheme => {
                      //存储该方案的谷值，用于后面对比
                      let schemeMinInventoryNum = scheme.minInventoryNum,
                          minInventoryNumObj = {text: schemeMinInventoryNum};
                      //存储该方案的峰值，用于后面对比
                      let schemeMaxInventoryNum = scheme.maxInventoryNum,
                          maxInventoryNumObj = {text: schemeMaxInventoryNum};
                      //默认不显示
                      // 如果启动了（设置阈值显示高亮功能），同时最高，最低，安全库存有一个为-1，表示未设置，则不执行高亮显示代码
                      if(this.isHighShowBySetStock && !materialCode.inventoryNumIsSet) {
                      } else {
                          //每个方案的谷值与最低，安全
                          //小于最小库存，给出警告的样式
                          if (schemeMinInventoryNum <= minInventoryNum ) {
                              minInventoryNumObj.className = 'warning';
                          }
                          //大于最小库存 同时 小于安全库存,给予提醒的样式
                          else if (schemeMinInventoryNum > minInventoryNum && schemeMinInventoryNum < safeInventoryNum) {
                              minInventoryNumObj.className = 'info';
                          }

                          //每个方案的峰值与安全，最高库存做对比
                          //大于最高库存，给出警告的样式
                          if (schemeMaxInventoryNum >= maxInventoryNum) {
                              maxInventoryNumObj.className = 'warning';
                          }
                          //每个方案的谷值与安全，最低库存做对比
                          //小于安全库存,给予提醒的样式
                          else if (schemeMaxInventoryNum < safeInventoryNum) {
                              maxInventoryNumObj.className = 'info';
                          }
                      }
                      //  将值继续推送到表格渲染数据中
                      tr.push(minInventoryNumObj);
                      tr.push(maxInventoryNumObj);
                  });

                tableData.body.push(tr);
              });

          	  //显示库存详情表格的数据处理
          	  this.getStockDetailTable(0);
          	  //显示库存趋势图标的数据处理
              this.packageECharts(0);
              setTimeout(this.myCharts.resize,0);
          	  return tableData;
          },
          //点击其余页签展示对应的数据
          changePage(){
          	    this.tableData = this.packageTable();
          	    this.lookMaterialCodeDetail(0);
          },
          //改变每页显示条数
          handleSizeChange(val){
          	  this.pageSize = val;
          	  this.packageTable();
          },
          //根据表格点击的物料，获取详细的图表数据
          lookMaterialCodeDetail(index){
          	  //渲染表格
              this.getStockDetailTable(index);
              //渲染图形
              this.packageECharts(index);
          },
          //点击切换图详细数据和表详细数据
          toggleShowEChartsOrTable(){
          	  this.isStockTrendTableShow = !this.isStockTrendTableShow;
              setTimeout(this.myCharts.resize,0);
          },
          //获得物料详细数据表
          getStockDetailTable(index = 0){
          	  //点击的索引还要加上页签*每页数，才能正确获取在整个数据表的索引
          	  index = index + (this.currentPage - 1) * this.pageSize;
              let materialCode = this.resStockData.moInventoryPlanDtoList[index]; //获得当前点击的物料编码

          	  this.currentMatreialCode = materialCode.materialCode;

              let maxInventoryNum = materialCode.maxInventoryNum,
                  minInventoryNum = materialCode.minInventoryNum,
                  safeInventoryNum = materialCode.safeInventoryNum;

              //  渲染提醒语句，点击物料的当前库存，最低库存，最高库存
              this.currentStockNum = materialCode.stockNum;
              this.minStockNum = minInventoryNum;
              this.maxStockNum = maxInventoryNum;

            //  定义提醒的样式
          	  if(this.currentStockNum >= maxInventoryNum || this.currentStockNum <= minInventoryNum){
          	  	  this.currentStockClass = "warning";
              }else if(this.currentStockNum > minInventoryNum &&　this.currentStockNum < safeInventoryNum){
                  this.currentStockClass = "info";
              }

              //获取库存明细时间表的数据
              this.stockDetailTable = [];

              //  遍历每个方案下每天的库存数据
              materialCode.moInventorySchemeDtoList.forEach((scheme) => {
                  let stockList = [{text : scheme.schemeName}];  //新建数组存储每个方案的库存数据，第一项为方案名
                  for(let i in scheme.inventoryNumByDay){
                  	  let obj = {
                          date : i,
                          text : scheme.inventoryNumByDay[i]
                      };
                      //默认不显示
                      // 如果启动了（设置阙值显示高亮功能），同时最高，最低，安全库存有一个为-1，表示未设置，则不执行高亮显示代码
                      if(this.isHighShowBySetStock && !materialCode.inventoryNumIsSet) {

                      }else{
                          if(scheme.inventoryNumByDay[i] >= maxInventoryNum || scheme.inventoryNumByDay[i] <= minInventoryNum){
                              obj.className = "warning";
                          }else if(scheme.inventoryNumByDay[i] > minInventoryNum && scheme.inventoryNumByDay[i] < safeInventoryNum){
                              obj.className = "info";
                          }
                      }
                      stockList.push(obj)
                  }
                  this.stockDetailTable.push(stockList);
              });
          },
          //一级页面图表数据封装处理
          packageECharts(index){
              //点击的索引还要加上页签*每页数，才能正确获取在整个数据表的索引
              index = index + (this.currentPage - 1) * this.pageSize;
              let xAxisList = [],yAxisList = [];
              //获取该物料编码下的所有方案对比
              let schemeList = this.resStockData.moInventoryPlanDtoList[index].moInventorySchemeDtoList;
              //获得x轴的坐标
              // 因为各个方案对比的日期一致，所以取第一个方案的日期列表就好了
              for(let i in schemeList[0].inventoryNumByDay){
                  xAxisList.push(i);
              }
              schemeList.forEach((scheme) => {
              	  let schemeYAxisList = {
              	  	  name : scheme.schemeName,
                      valueList : []
                  }; //多个方案多个数组
                  for(let i in scheme.inventoryNumByDay){
                      schemeYAxisList.valueList.push(scheme.inventoryNumByDay[i]);
                  }
                  yAxisList.push(schemeYAxisList);
              });

              let option = this.dataProcess.getBarEChartsOption({
                  title : {y : "-12%"},
                  xAxisList : xAxisList,
                  yAxisList : yAxisList,
              });
              this.myCharts.setOption(option);
//              console.log(option);
          },
      }
  }

</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../../styles/resetStyle.scss";
    .ban-shou{
        width: 24px;
        height: 24px;
        background: url(../../asserts/banshou.png) no-repeat;
        background-size: 24px;
    }
    .stock-config{
        position: absolute;
        right: 20px;
        display: flex;
        flex-direction: row-reverse;
    }
    .function-menu-list{
        display: flex;
        flex-direction: row-reverse;
        height: 24px;
    }
    .tab-menu-list{
        border: 1px solid $borderColor;
        li{
            padding: 0 25px;
            min-width: 80px;
            height: 34px;
            line-height: 34px;
            text-align: center;
            color: #333;
            border-right: 1px solid $borderColor;
            cursor: pointer;
            &.active{
                color: #fff;
                background-color: #9a9da2;
            }
        }
    }
    .stock-analysis{
        position: relative;
        .stock-detail-tabel{
            width: 100%;
            max-height: 200px;
            overflow: auto;
        }
    }
    .current-material{
        position: absolute;
        width: 100%;
        line-height: 30px;
        font-weight: bold;
    }
    .col-config-icon{
        width: 16px;
        height: 16px;
        background: url(../../asserts/config.png) no-repeat;
        background-size:16px;
        cursor: pointer;
    }
    .warning{
        background-color: #f00;
        color: #fff;
    }
    .info{
        background-color: yellow;
    }
    .table-data{
      width: 100%;
    }
    //================
    .transfer-box{
        position: absolute;
        right : 15px;
        width: 550px;
        background-color: #fff;
        border: 1px solid $borderColor;
        z-index: 1;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
    }
    .transfer-box-title{
        padding:0 20px;
        height: 40px;
        line-height: 40px;
        border-bottom: 1px solid #ccc;
        background-color: #f0f0f0;
    }
    .transfer-box-body{
        padding: 10px 20px;
    }
    .transfer-box-footer{
        padding: 10px 0 ;
    }
</style>
