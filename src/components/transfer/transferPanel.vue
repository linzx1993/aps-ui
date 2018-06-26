<template>
    <div class="aps-transfer-panel">
        <h6 class="aps-transfer-panel-header">
            {{title}}
            <span class="aps-arrow" v-show="selectItem && move" @click="upSortItem"><i class="el-icon-arrow-up"></i></span>
            <span class="aps-arrow" v-show="selectItem && move" @click="downSortItem"><i class="el-icon-arrow-down"></i></span>
        </h6>
        <div class="aps-transfer-panel-box" :class="filterable ? 'is-filterable' : ''">
            <p class="aps-transfer-input" v-show="filterable">
                <i class="el-input__icon el-icon-search"></i>
                <input type="text" class="aps-input" v-model="query">
            </p>
            <ul class="aps-transfer-panel-body" v-show="optionList.length !== 0">
                <li class="relative" v-for="data in filterDataList" :title="data.label" :class="data.disabled ? 'is-disabled' : ''">
                    <label class="input-checkbox">
                        <input
                            type="checkbox"
                            :name="data.value"
                            @change="toggleChecked"
                            v-model="data.isSelected">
                        <span class="checkBox-inner"></span>
                        {{data.label}}
                    </label>
                    <span class="item-order" v-show="selectItem && order" :class="data.value.includes('desc') ? 'desc' : ''" @click="toggleOrder(data)"></span>
                </li>
            </ul>
            <p class="aps-transfer-panel-empty" v-show="optionList.length === 0">无数据</p>
        </div>
        <div class="aps-transfer-panel-footer">
            <label class="input-checkbox">
                <input
                    name="allChecked"
                    type="checkbox"
                    v-model="allChecked"
                    @change="handleAllCheckedChange"
                >
                <span class="checkBox-inner"></span>
                <span class="ml-5" style="display: inline-block" v-show="selectCount !== 0"><em >已选择 {{selectCount}} / </em>{{optionList.length}}</span>
                <span class="ml-5" style="display: inline-block" v-show="selectCount === 0">共 {{optionList.length}} 项</span>
            </label>
        </div>
    </div>
</template>

<script>
    export default {
    	  name : "transferPanel",
        props : ["title","optionList","checked","move","order","filterable","selectItem"],
        data(){
    	  	  return {
                allChecked : false,   //是否全选
                query : ""  //搜索框查询参数
            }
        },
        watch : {
        	  //每次选中值时，查看是否触发全选更新
            checked(){
            	  this.updateAllChecked();
            },
            //根据搜索值实时显示列表更新
            query(n,o){

            }
        },
        computed : {
            selectCount(){
            	  return this.checked.length;
            },
            //经过过滤之后，所有配置项的list
            filterDataList(){
            	  return this.optionList.filter(item => item.label.includes(this.query))
            }
        },
        methods : {
        	  //每次点击某个配置项时，是否更新全选按钮
            updateAllChecked(){
                //全选的判断标准 ： 除disabled外的所有配置项都被选中，同时至少一个选中
                this.allChecked = this.optionList.every(item => {
                    return item.isSelected || item.disabled
                }) && this.checked.length !== 0;
            },
            //点击之后的改变
            handleAllCheckedChange(){
                if(this.allChecked){
                    this.allCheckedItem = [];
                    this.optionList.forEach(item => {
                        item.isSelected = !item.disabled;
                        if(item.isSelected){
                            this.allCheckedItem.push(item.value)
                        }
                    });
                }else{
                    this.optionList.forEach(item => {
                        item.isSelected = false;
                    });
                    this.allCheckedItem = [];
                }
                this.$emit("changeChecked",this.allCheckedItem);
            },
        	  //将本次选择的数据上传到父组件，父组件改变后将结果仍然通过prop回传到子组件来
            toggleChecked(){
                const checked = [];
                this.optionList.forEach(item => {
                    if(item.disabled){
                    }else{
                        if(item.isSelected){
                        checked.push(item.value);
                      }
                    }
                });
            	  this.$emit("changeChecked",checked)
            },
            //设置配置项的升序和降序
            toggleOrder(item){
            	  if(item.value.includes(":desc")){
                    item.value = item.value.replace(":desc","");
                }else{
                    item.value += ":desc";
                }
                const select = this.optionList.map(item => {
                	 return item.value;
                });
                this.$emit("changeChecked",undefined,undefined,select)
            },
            //排序项向上升
            upSortItem(){
            	  const checked = [];
                this.optionList.forEach(checkItem => {
                    if(checkItem.isSelected){
                        checked.push(checkItem.value);
                    }
                });
                this.$emit("changeChecked",checked,"up");
            },
            //排序项向下升
            downSortItem(){
                const checked = [];
                this.optionList.forEach(checkItem => {
                    if(checkItem.isSelected){
                        checked.push(checkItem.value);
                    }
                });
                this.$emit("changeChecked",checked,"down");
            },
        }
    }
</script>
<style rel="stylesheet/scss" lang="scss">
</style>
