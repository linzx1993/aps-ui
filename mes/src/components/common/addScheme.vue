<template>
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
            <span class="add-schedule mr-5" @click=""><i class="added mr-5"></i>新加方案</span>
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
                <el-button type="primary" @click="addPlan">确 定</el-button>
            </span>
        </el-dialog>
        <slot></slot>
    </div>
</template>

<script>
  export default {
      name: 'addScheme',
      componentName: 'addScheme',
      data(){
          return{
              showSchemeList: [], //展示方案列表
              selectSchemeValue: "", //新增方案选中值
              dialogVisible: false, // 新增方案对话框是否出现
          }
      },
      props: {
          value: {
              required: true,
              default(){
              	  return []
              }
          },
          allSchemeList: {
              required: true,
              default(){
                  return []
              }
          },
      },
      watch : {
      	  value(){
      	  	  this.$emit("change",this.value)
          }
      },
      methods: {
          /**
             * desc:弹出添加方案的对话框
             * time:2017-09-19
             * last : linzx
           **/
          showAddPlanDialog() {
              this.dialogVisible = true;
              //已经选了一个方案下，如果其余方案与该方案下的地点不一致时，则无法选择，设置当前方案为disable
              this.allSchemeList.forEach((allSchemeItem) => {
                  //再加一个disable的逻辑，如果有些方案已经被选择了，则该方案设置为disable
                  if(this.value.includes(allSchemeItem.schemeId)){
                      allSchemeItem.disabled = true;
                      return;
                  }
                  let currentSelectScheme = this.showSchemeList[0];
                  //首次进入选择方案则直接return出去
                  if(!currentSelectScheme){
                  	  return;
                  }
                  if(currentSelectScheme.locationDtoList.length !== allSchemeItem.locationDtoList.length){
                      allSchemeItem.disabled = true;
                  }else{
                    /*
                     * 遍历一个当前选择方案的所有地点，查看另外一个方案是否都有此地点
                     * 如果返回遍历所有地点都一致，则该方案可以选择，将disabled设置为false(所以加了一个！号)，反之则设为true。
                     * 因为符合返回true，所以设置disable要加个！取反
                     * */
                      allSchemeItem.disabled = !currentSelectScheme.locationDtoList.every(selectItem => {
                          //获得当前方案下的每个地点对象（selectItem），和比较方案下的地点对象数组（allSchemeItem.locationDtoList）的每一个地点对象（allItem）进行比较
                      	  return allSchemeItem.locationDtoList.some(allItem => {
                              //如果有一个allItem的地点id和showItem的地点id一致，则返回正确
                              return selectItem.locationId === allItem.locationId;
                          })
                      })
                  }
              })

          },
          /**
            * desc:删除当前点击的方案
            * time:2017-09-19
            * last : linzx
            * @param: data{string} ：删除方案的id
            **/
          deleteScheme(data) {
          	  let index = this.value.findIndex(item => item === data.schemeId);
              this.showSchemeList = this.showSchemeList.filter((item) => {
                  return item.schemeId !== data.schemeId;
              });
              this.value.splice(index,1);
          },
          /**
             * desc:点击新增方案的确定按钮，增加所选方案
             * time:2017-09-19
             * last : linzx
           **/
          addPlan() {
          	  //关闭弹窗
              this.dialogVisible = false;
              //如果没有选取任何值的话，直接返回
              if (!this.selectSchemeValue) {
                  return;
              }
              //如果选中的值已选中（elementUI的bug，第一个option为disabled仍可以选中）
              //后期优化为不符合的都不可以选中
              if(this.value.includes(this.selectSchemeValue)){
                  return;
              }
              //获得点击选中的方案对象
              const selectSchemeObj = this.allSchemeList.filter((item) => item.schemeId === this.selectSchemeValue)[0];
              this.showSchemeList.push(selectSchemeObj);
              this.value.push(this.selectSchemeValue);
          },
      },
  }
</script>
