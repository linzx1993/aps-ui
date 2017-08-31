/** * Created by linzx on 2017/5/31. */
<template>
    <div class="right-content-box prediction-oee">
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
            <label class="ml-20 input-checkbox" for="hadSavedScheduleResult">
              <input
                  id="hadSavedScheduleResult"
                  type="checkbox"
                  v-model="hadSavedScheduleResult">
                  <span></span>
                  已保存排程结果
              </label>
        </div>
        <p class="mt-5 mb-10 flex">
            查看类型 ：
            <label class="input-radio" for="equipment">
              <input
                id="equipment"
                name="equipment"
                type="radio"
                value="equipment"
                v-model="lookDimension">
              <span></span>
              设备类型
            </label>
        </p>
        <p class="time-condition">
            <span>时&#12288;&#12288;间 ：</span>
            <el-date-picker
                v-model="startTime"
                type="date"
                :picker-options="pickerOptions"
                placeholder="选择日期">
            </el-date-picker>
            &#12288;至&#12288;
            <el-date-picker
                v-model="endTime"
                type="date"
                :picker-options="pickerEndOptions"
                placeholder="选择日期">
            </el-date-picker>
            <a class="quick-time-condition" href="javascript:void(0);" :class="{active : quickTime === 'currentWeek'}" @click="quickSelectTime('currentWeek')">本周</a>
            <a class="quick-time-condition" href="javascript:void(0);" :class="{active : quickTime === 'nextWeek'}" @click="quickSelectTime('nextWeek')">下周</a>
            <a class="quick-time-condition" href="javascript:void(0);" :class="{active : quickTime === 'currentMonth'}" @click="quickSelectTime('currentMonth')">本月</a>
            <a class="quick-time-condition" href="javascript:void(0);" :class="{active : quickTime === 'nextMonth'}" @click="quickSelectTime('nextMonth')">下月</a>
        </p>
        <div class="query-conditions-list">
            <location-cascader class="mt-20 mr-10"
                :writelocation="schemeIdList"
                v-model="selectLocationList">
            </location-cascader>
            <div class="query-conditions mt-20 mr-10">
                <span>设备类型 ： </span>
                <aps-dropdown
                  v-model="equipmentTypeValue"
                  multiple>
                  <aps-option
                  	v-for="item in equipmentTypeList"
                  	:value="item.modelId"
                  	:label="item.modelName">
                  </aps-option>
                </aps-dropdown>
            </div>
            <div class="query-conditions mt-20">
                <span>设&#12288;&#12288;备 ： </span>
                <aps-dropdown
                    v-model="equipmentValue"
                    multiple>
                    <aps-option
                    	v-for="item in equipmentList"
                    	:value="item.productUnitId"
                    	:label="item.productUnitName">
                    </aps-option>
                </aps-dropdown>
            </div>
            <a  class="default-btn mt-20"
                href="javascript:void(0);"
                @click="searchOee()">
                查看
            </a>
        </div>
        <hr class="mt-10">
        <div style="height: 30px;">
            <a
                v-show="isShowReturnFirst"
                @click="returnFirstPageFromSecond"
                class="default-btn mt-20"
                href="javascript:void(0);">
                返回
            </a>
        </div>
        <div id="canvas" class="canavs"></div>
        <div class="predict-table jPredictTable" >
            <table
                class="compare-equipment"
                v-show="showTable">
                <thead>
                    <tr>
                        <th>设备</th>
                        <th
                            v-for="equipmentName in schemeCompareTable.equipmentNameList">
                            {{equipmentName.value}}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="row in schemeCompareTable.equipmentValueList">
                        <td
                            v-for="data in row"
                            :title="data">
                            {{data}}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
	/*type="text/ecmascript-6"*/
	import inputDropDown from "../Rubbish/inputDropDown.vue"
	import locationCascader from "../common/locationCascader.vue"
	export default {
      components: {
          "input-drop-down": inputDropDown,
          "location-cascader": locationCascader
      },
      data() {
          return {
              myCharts: '',
              hadSavedScheduleResult: false, //已保存排程结果
              lookDimension: 'equipment', //选择从哪个维度查看（现在默认是设备维度）
              allSchemeList: [], //新增方案下拉列表数据
              showSchemeList: [], //展示方案列表
              schemeIdList: [], //保存传递的数据
              selectSchemeValue: "", //新增方案选中值
              checked: false,
              dialogVisible: false, // 新增方案对话框是否出现
              quickTime: "", // 快速选择时间判断
              minTime : new Date(), // 请求后台获得该系统下方案对比的最小时间
              //设置日历插件的option
              pickerOptions : {
                  disabledDate(time) {
                      return time.getTime() < new Date() - 86400000;
                  }
              },
              pickerEndOptions : {
                  disabledDate(time) {
                      return time.getTime() < new Date() - 86400000;
                  }
              },
              startTime: new Date().getTime(), //选择开始时间
              endTime: new Date().getTime() + 86400000, //选择结束时间
              selectLocationList: [], //级联下拉地点选中数据
              equipmentTypeList: [], //设备类型下拉列表
              equipmentTypeValue: "", //设备类型选中值
              equipmentList: [], //设备下拉列表
              equipmentValue: "", //设备选中值
              writelocation: '',
              allSchemeCompareData: {
                  horizontalAxisData: {},
                  longitudinalAxisData: []
              }, //查询到所有设备的预测设备利用率
              schemeCompareTable: {}, //可供表格渲染的数据
              goSecondPageParams: "", //用于记录从二级页面返回一级页面，记录跳转到二级页面时原一级页面的url
              isShowReturnFirst: false, //是否出现点击图表由二级页面返回一级页面的按钮，还用来判断当前是否处于二级页面
              showTable: false, //是否出现table表格。如果没有数据，表格消失
          }
      },
      watch: {
          //监测是否已保存排程方案结果
          hadSavedScheduleResult(newValue, oldValue) {
          	  //如果处于二级页面，则发送二级页面的请求
          	  if(this.isShowReturnFirst){
          	  	  if(newValue){
          	  	  	  this.$http.get(this.url.result_equipmentList_by_equipmentType + this.goSecondPageParams).then((res) => {
          	  	  	  	  res.data.longitudinalAxisData[0].schemeName = "已保存";
                          this.allSchemeCompareData.longitudinalAxisData = this.allSchemeCompareData.longitudinalAxisData.concat(res.data.longitudinalAxisData);
                          this.packageECharts();
                      })
                  }else{
                      this.$http.get(this.url.temp_equipmentList_by_equipmentType + `?schemeIdList=${this.schemeIdList.join()}&startTime=${t.getCorrectDate(this.startTime)}&endTime=${t.getCorrectDate(this.endTime)}&equipmentTypeIdList=${this.equipmentTypeValue.join()}&equipmentIdAndTypeList=${this.equipmentValue}&dimensionTypeEnum=EQUIPMENTTYPE&isCalculateUnusedEquip=1&locationIdList=${this.selectLocationList.join()}`).then((res) => {
                          this.allSchemeCompareData.longitudinalAxisData.pop();
                          this.packageECharts();
                          this.showTable = this.allSchemeCompareData.longitudinalAxisData.length !== 0;
                      })
                  }
              }else{
                  if(newValue){
                      this.getHadSavedSchedule();//获取数据
                  }else{
                      /*
                       * 　删掉数组最后一组数据（也就是已保存的数据）,
                       *   因为添加'已保存'是通过concat添加上去的,所以必然是最后一组！！！
                       */
                      //判断最后一组数据是否是已保存，如果是则移出，不是不做任何操作
                      this.allSchemeCompareData.longitudinalAxisData.pop();
                      this.packageECharts();
                      //如果没有数据了，则表格消失
                      this.showTable = this.allSchemeCompareData.longitudinalAxisData.length !== 0;
                  }
              }
          },
          'startTime': {
              handler: function(val, oldVal) {
                  this.getAllEquipment();
              },
          },
          'endTime': {
              handler: function(val, oldVal) {
                  this.getAllEquipment();
              },
          },
          'selectLocationList': {
              handler: function(val, oldVal) {
                  this.getAllEquipment();
              },
          },
          equipmentTypeValue(){
              this.getAllEquipment();
          }
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
          //获取该系统下查看的最早时间
          this.$http.get(this.url.min_scheme_time).then((res) => {
              this.minTime = res.data;
          });
          //获取所有的设备类型
          this.getAllEquipmentType();
          this.getAllEquipment();
      },
      methods: {
          //弹出添加方案的对话框
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
          //获取方案id数组
          getSchemeIdList(){
              this.schemeIdList = [];
              this.showSchemeList.forEach((item) => {
                  this.schemeIdList.push(item.schemeId);
              });
          },
          //删除当前点击的方案
          deleteScheme(data) {
              this.showSchemeList = this.showSchemeList.filter((item) => {
                  return item.schemeId !== data.schemeId;
              });
              this.getSchemeIdList();
          },
          //点击确定添加方案
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
          //时间快速选择器
          quickSelectTime(timeName) {
              //为选中文字添加选中样式class-acitve
              this.quickTime = timeName;
              const year = new Date().getFullYear(),
                  month = new Date().getMonth() + 1,
                  weekDay = new Date().getDay() === 0 ? 7 : new Date().getDay(); //得到星期几,如果为0 ，表示星期天，转化为星期一
              //判断方案列表是否有方案，如果有方案的话为true，则选择开始时间最小为今天,没有为false,则为本周第一天
              let hasPlan = this.showSchemeList.length !== 0;
              if (timeName === "currentWeek") {
                  //获取周几，然后减去剩余的几天，再加一天
                  this.startTime = hasPlan ? new Date().getTime() : new Date().getTime() - (weekDay - 1) * 86400000;
                  this.endTime = hasPlan ? this.startTime + (7 - weekDay) * 86400000 : this.startTime + (7 - 1) * 86400000;
                  //如果结束时间大于本月最后一天的话
              } else if (timeName === "nextWeek") {
                  //获取周几，然后加上剩余的几天，再加一天
                  this.startTime = new Date().getTime() + (7 - weekDay + 1) * 86400000;
                  this.endTime = this.startTime + 6 * 86400000;
              }   else if (timeName === "currentMonth") {
                  //最后一天计算，本月第一天加上本月天数
                  this.startTime = this.minTime;
                  this.endTime = new Date(year + "-" + month + "-" + t.getMonthDays(year + "-" + month)).getTime();
              } else {
                  //来源本个月的最后一天加一天
                  this.startTime = new Date(year + "-" + month + "-01").getTime() + t.getMonthDays(year + "-" + month) * 86400000;
                  this.endTime = this.startTime + (t.getMonthDays(this.startTime) - 1) * 86400000;
              }
          },
          //获得所有的设备类型
          getAllEquipmentType() {
              const url = this.url.get_all_equipmentType;
              this.$http.get(url).then((res) => {
                    this.equipmentTypeList = res.data;
                    this.equipmentTypeList.map((item) => {
                        item.modelId = item.modelId + "_" + item.modelType;
                    })
              });
          },
          //获取所有的设备
          getAllEquipment() {
              let cacheTypeStr = [];
          	  if(!this.equipmentTypeValue){
                  this.equipmentTypeValue = "";
              }else{
          	  	  //如果不是数组，则将其转化为数组
          	  	  if(!Array.isArray(this.equipmentTypeValue)){
                      this.equipmentTypeValue = this.equipmentTypeValue.split(",");
                  }
                  this.equipmentTypeValue.forEach((item) => {
                      cacheTypeStr.push(item.split("_")[0]);
                  });
          	  }
              const url = this.url.get_all_equipment + `?startTime=${t.getCorrectDate(this.startTime)}&endTime=${t.getCorrectDate(this.endTime)}&searchType=1&modelIdList=${cacheTypeStr.join(",")}&locationFilterList=${this.selectLocationList.join()}`;
              this.$http.get(url).then((res) => {
                //将equipmentList处理成所需要的数据格式
                  this.equipmentList = this.dataProcess.processEquipmentList(res.data);
              });
          },
          //一级页面图表数据封装处理
          packageECharts(){
              //=========用于图表格式化的数据，同时用于后面点击跟踪
              let equipmentList = processEchartsData(this.allSchemeCompareData);
              this.myCharts.clear();//清楚echarts的数据缓存
              this.myCharts.setOption(getBarEChartsOption(equipmentList));
              //=========处理数据用于表格展示
              this.schemeCompareTable = this.dataProcess.showTableData(this.allSchemeCompareData);
              this.showTable = true;

              //添加图标点击事件
              this.myCharts.on('click', (params) => {
                  let equipmentList = processEchartsData(this.allSchemeCompareData);
                  //如果在二级页面，点击直接返回
                  if (this.isShowReturnFirst) {
                      return;
                  }
                  //判断点击的是哪个方案，获取点击的方案ID
                  const index = params.dataIndex,//通过点击的第几列进行判断点击的设备类型
                      clickEChartsType = params.componentSubType,//判断当前图案展示类型
                      equipmentType = equipmentList.xAxisList[index].key.split(":").reverse().join("_");//获得点击的设备类型
                  //将设备类型下拉框那里设置为点击选中的设备类型
                  //把key 0:001 获取成需要equipmentTypeValue的格式 001_1(id_type)
                  this.equipmentTypeValue = [equipmentType.split(":").reverse().join("_")];
                  //记录一级页面跳转到二级页面的参数（后期用于返回一级页面时用到，现在还没做2017-7-8）
                  this.goSecondPageParams = `?startTime=${t.getCorrectDate(this.startTime)}&endTime=${t.getCorrectDate(this.endTime)}&equipmentTypeIdList=${this.equipmentTypeValue.join(",")}&dimensionTypeEnum=EQUIPMENTTYPE&isCalculateUnusedEquip=1&locationIdList=${this.selectLocationList.join()}`;
                  this.searchEquipmentOee(this.equipmentTypeValue,clickEChartsType);
              });
          },
          //点击查看按钮查看设备利用率，分为一级页面和二级页面
          searchOee(){
              //如果用户选择的时间不对
              if((this.startTime + 86400000) < new Date()){
                  this.$alert('查看时间不能小于今天', '提示');
                  return;
              }
              //结束时间不能大于开始时间
              if(this.startTime > this.endTime){
                  this.$alert('开始时间不能大于结束时间', '提示');
                  return;
              }
              //如果为true，表示在二级页面，点击查看执行二级页面设备筛选功能，否则执行查看一级页面
              if(this.isShowReturnFirst){
                  this.searchEquipmentOee();
              }else{
                  this.searchEquipmentTypeOee();
              }
          },
          /**
           * desc:查询已经保存的设备类型的oee
           * time: 2017-06-28
           * last:linzx
           * @param: pageUrl :二级页面返回一级页面时记住的老路径，如果有，使用老路径
           **/
          searchEquipmentTypeOee() {
              //如果用户没有选择方案,同时
              if (this.schemeIdList.length === 0) {
                  if(this.hadSavedScheduleResult){
                  	  //为已排程方案初始化数据格式
                      this.allSchemeCompareData = {horizontalAxisData: {}, longitudinalAxisData: []};
                      this.getHadSavedSchedule();
                      return;
                  }else{
                      this.$alert('请至少选择一个方案查看', '提示');
                      return;
                  }
              }
              const PageUrlParams = `schemeIdList=${this.schemeIdList.join()}&startTime=${t.getCorrectDate(this.startTime)}&endTime=${t.getCorrectDate(this.endTime)}&equipmentTypeIdList=${this.equipmentTypeValue}&equipmentIdAndTypeList=${this.equipmentValue}&dimensionTypeEnum=EQUIPMENTTYPE&isCalculateUnusedEquip=1&locationIdList=${this.selectLocationList.join()}`;
              const firstPageUrl = this.url.temp_equipment_oee + '?' + PageUrlParams;
              this.$http.get(firstPageUrl).then((res) => {
                  this.allSchemeCompareData = res.data;
              }).then(() => {
                  if(this.hadSavedScheduleResult){
                      this.getHadSavedSchedule();//获取数据,渲染图标
                  }else{
                      this.packageECharts();
                  }
              })
          },
          /**
           * desc:根据筛选设备查看利用率
           * time: 2017-07-08
           * last:linzx
           * @params :equipmentType : 设备类型
           * @params :clickEChartsType 当前图标展示形式，线形图还是柱状图
           **/
          searchEquipmentOee(equipmentType = this.equipmentTypeValue,clickEChartsType = 'bar'){
              let secondPageUrl = this.url.temp_equipmentList_by_equipmentType + `?schemeIdList=${this.schemeIdList.join()}&startTime=${t.getCorrectDate(this.startTime)}&endTime=${t.getCorrectDate(this.endTime)}&equipmentTypeIdList=${equipmentType}&equipmentIdAndTypeList=${this.equipmentValue}&dimensionTypeEnum=EQUIPMENTTYPE&isCalculateUnusedEquip=1&locationIdList=${this.selectLocationList.join()}`;
              let secondPageCacheUrl = this.url.result_equipmentList_by_equipmentType + `?startTime=${t.getCorrectDate(this.startTime)}&endTime=${t.getCorrectDate(this.endTime)}&equipmentTypeIdList=${equipmentType}&equipmentIdAndTypeList=${this.equipmentValue}&dimensionTypeEnum=EQUIPMENTTYPE&isCalculateUnusedEquip=1&locationIdList=${this.selectLocationList.join()}`;
              //记录跳转过来的一级页面所带url的带参数，保证返回一级页面时是进入二级页面的数据（因为用户可能在查看二级页面时，修改条件）
              if(this.schemeIdList.length > 0){
                  this.$http.get(secondPageUrl).then((res) => {
                      this.allSchemeCompareData = res.data;
                  }).then(() =>{
                      if(this.hadSavedScheduleResult){
                          this.$http.get(secondPageCacheUrl).then((res) => {
                              //修改为已保存的名字
                              res.data.longitudinalAxisData[0].schemeName = '已保存';
                              //根据对应地点进行合并
                              this.allSchemeCompareData.longitudinalAxisData = this.allSchemeCompareData.longitudinalAxisData.concat(res.data.longitudinalAxisData);
                              //将数据处理echarts所需要的格式
                              const equipmentList = processEchartsData(this.allSchemeCompareData);
                              equipmentList.type = clickEChartsType;//设置展现的图标类型
                              this.myCharts.setOption(getBarEChartsOption(equipmentList));
                              //表格数据根据点击变化
                              this.schemeCompareTable = this.dataProcess.showTableData(this.allSchemeCompareData);
                          })
                      }else{
                          let equipmentList = processEchartsData(this.allSchemeCompareData);
                          equipmentList.type = clickEChartsType;
                          this.myCharts.setOption(getBarEChartsOption(equipmentList));
                          //表格数据根据点击变化
                          this.schemeCompareTable = this.dataProcess.showTableData(this.allSchemeCompareData);
                      }
                  });
              }else{
//                  if(this.hadSavedScheduleResult) {
                      this.$http.get(secondPageCacheUrl).then((res) => {
                          this.allSchemeCompareData = res.data;
                          const equipmentList = processEchartsData(this.allSchemeCompareData);
                          equipmentList.type = clickEChartsType;//设置展现的图标类型
                          this.myCharts.setOption(getBarEChartsOption(equipmentList));
                          //表格数据根据点击变化
                          this.schemeCompareTable = this.dataProcess.showTableData(this.allSchemeCompareData);
                      })
//                  }
              }
              //进入二级页面，出现返回按钮
              this.isShowReturnFirst = true;
          },
          //突变展示二级设备列表页面返回一级设备类型页面
          returnFirstPageFromSecond() {
          	  //清空选中的设备类型
              this.equipmentTypeValue = [];
          	  //如果没有选择任何方案，则不显示数据
              if(this.schemeIdList.length !== 0){
                  this.searchEquipmentTypeOee();
              }else{
                  this.allSchemeCompareData =  {
                      horizontalAxisData: {},
                      longitudinalAxisData: []
                  };
                  this.getHadSavedSchedule();
              }
              this.isShowReturnFirst = false;//返回一级页面按钮消失
          }
      }
	}


	/**
	 * desc :  返回一个图表x，y轴所需的数据
	 * time: 2017-06-21
	 * last:linzx
	 * @param: resData ： 请求设备直接拿到的数据
	 * @return: Object schemeTableData 初步处理用于echarts展示的数据
	 **/
	function processEchartsData(resData) {
      const horizontalAxisData = resData.horizontalAxisData,
          longitudinalAxisData = resData.longitudinalAxisData;
        //获取所有方案名
      const schemeTableData = {
          xAxisList: [],
          yAxisList: []
      };
      horizontalAxisData.forEach((item) => {
          const key = item.split("_")[0];
          const value = item.replace(key + "_","");
          const obj = {
              key : key,
              value : value,
          };
          schemeTableData.xAxisList.push(obj);
      });
      //获取y轴的坐标名对象
      longitudinalAxisData.forEach((item) => {
          const valueList = [];
          schemeTableData.xAxisList.forEach((equipmentName) => {
              if(item.oeeMap[equipmentName.key] === undefined){
                  item.oeeMap[equipmentName.key] = 0;
              }
              valueList.push({
                  key: equipmentName.key,
                  value: item.oeeMap[equipmentName.key].toFixed(3)
              });
          });
          schemeTableData.yAxisList.push({
              name: item.schemeName,
              schemeId: item.schemeId,
              valueList: valueList
          })
      });
      return schemeTableData
	}


	function getBarEChartsOption(optionData) {
      let option = {
          title: {
              text : optionData.title || '预测设备利用率',
              x : 'center',
              y : '0%'
          },
          //鼠标移到折线图上是否有数据提示
          tooltip: {
              trigger: 'axis'
          },
          //标题展示项
          legend: {
              data: [],
              top : '7%',
              left : 'center'
          },
          //标题小工具栏
          toolbox: { //可视化的工具箱
              right : '10%',
              show: true,
              feature: {
                  dataView: { //数据视图
                      show: false
                  },
                  restore: { //重置
                      show: false
                  },
                  dataZoom: { //数据缩放视图
                      show: false
                  },
                  saveAsImage: { //保存图片
                      show: true
                  },
                  magicType: { //动态类型切换
                      type: ['bar', 'line']
                  }
              }
          },
          calculable: true,
          dataZoom: [
              {startValue: '0'},
              {type: 'inside'},
              //y轴拉缩框
//              {
//                  type: 'slider',
//                  yAxisIndex: 0,
//                  filterMode: 'empty'
//              },
          ],
          xAxis: [{
              type: 'category',
//              axisLabel: {
//                  interval:0,//横轴信息全部显示
//                  rotate: 40,//60度角倾斜显示
//                  formatter:function(val) {
//                      return val.split("").join("\n"); //横轴信息文字竖直显示
//                  }
//              },
              data: []
          }],
          yAxis: [{
              type: 'value',
              interval : optionData.interval
          }],
          series: []
      };
        //如果y轴没有数据，直接返回，图标显示为空
      if (optionData.yAxisList.length === 0) {
          return option
      }
      //设置x轴坐标
      option.xAxis[0].data = optionData.xAxisList;
      //设置y轴坐标
      optionData.yAxisList.forEach((item) => {
          //设置图表toolbox,提示小格子
          option.legend.data.push(item.name);
          //设置x轴各项在y轴对应的值
          const obj = {
              name: item.name,
              id: item.schemeId,
              type: optionData.type || 'bar',
              //				barWidth: '20%',//宽度自适应
              data: [],
              markPoint : {
                  data : [
                      {type : 'max', name: '最大值'},
                      {type : 'min', name: '最小值'}
                  ]
              },
              markLine : {
                  data : [
                      {type : 'average', name: '平均值'}
                  ]
              }
          };
          item.valueList.forEach((valueItem) => {
              obj.data.push(valueItem.value);
          });
          option.series.push(obj);
      });
      return option;
	}
</script>
