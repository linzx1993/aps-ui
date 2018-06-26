<template>
  <div class="aps-transfer">
      <transfer-panel
          class="all-item"
          :move="move"
          :order = "order"
          :filterable="filterable"
          :selectItem = "false"
          :title="titles[0] || '列表1'"
          :optionList="leftItemList"
          :checked="leftChecked"
          @changeChecked="changeLeftChecked"
      ></transfer-panel>
      <div class="aps-transfer-buttons">
          <button type="button" class="aps-button aps-button-primary" :class="rightChecked.length === 0 ? 'is-disabled' : ''" @click="addToLeft">
              <span>
                  <i class="el-icon-arrow-left"></i>
                  <span v-if="buttonTexts[0] !== undefined">{{ buttonTexts[0] }}</span>
              </span>
          </button>
          <button type="button" class="aps-button aps-button-primary" :class="leftChecked.length === 0 ? 'is-disabled' : ''" @click="addToRight">
              <span>
                  <span v-if="buttonTexts[1] !== undefined">{{ buttonTexts[1] }}</span>
                  <i class="el-icon-arrow-right"></i>
              </span>
          </button>
      </div>
      <transfer-panel
          :move="move"
          :order = "order"
          :filterable="filterable"
          :selectItem = "true"
          class="select-item"
          :title="titles[1] || '列表2'"
          :optionList="rightItemList"
          :checked="rightChecked"
          @changeChecked="changeRightChecked"
      ></transfer-panel>
  </div>
</template>

<script>
import transferPanel from './transferPanel.vue';
export default {
    name : "apsTransfer",
    components : {
        transferPanel
    },
    props : {
        move :{type :false},  //是否提供上下移动功能，默认不提供
        order :{type :false},  //是否提供升序降序功能，默认不提供
        filterable :{type :false},  //是否提供过滤功能，默认不提供
        data: {
            type: Array,
            default() {
                return [];
            }
        },
        value: {
            type: Array,
            default() {
                return [];
            }
        },
        titles: {
            type: Array,
            default() {
                return [];
            }
        },
        buttonTexts: {
            type: Array,
            default() {
                return [];
            }
        },
    },
    data(){
        return {
            //判断是左边框还是右边框，有边框不提供  上下移动和升序降序 功能
            selectItem : Boolean,
            //拿到的所有显示项数据
            allSortConfig : [],
            //左边传进来选中哪些显示项数据
            selectSortConfig : [],
            //左边的展示项
            leftItemList : [],
            //右边的展示项
            rightItemList : [],
            //左边选中哪些项
            leftChecked : [],
            //右边选中哪些项
            rightChecked : [],
        }
    },
    mounted(){
        //根据传入的所有配置项数据和选中配置项数据筛选出左右两边的条目
        this.getSelectItem();
    },
    watch : {
        data() {
            this.getSelectItem();
        },
        //监测选中值
        value() {
            this.getSelectItem();
        },
    },
    methods : {
        //  筛选出哪些选中项
        getSelectItem(){
            //清空之前所有显示项
            this.leftItemList = [];
            this.rightItemList = new Array(this.value.length);
            //根据所有配置项和已经选择的配置项，筛选出左右两边展示栏
            this.data.forEach(item => {
                let cacheId;  //  记录一个临时id用来获得选中的配置项
                const index = this.value.findIndex((selectItem) => {
                    cacheId = selectItem;
                    return item.value.replace(":desc","") === selectItem.replace(":desc","");
                });
                item.isSelected = !!item.isSelected;

                if(index > -1){
                    item.value = cacheId;
                    this.rightItemList[index] = item;
                }else{
                    this.leftItemList.push(item)
                }
            })
        },
        changeLeftChecked(val){
            this.leftChecked = val;
        },
      /**
       *
       * @param val :传上来选中的配置项
       * @param changeOrder  ： 决定启动配置项的降序和升序功能
       * @param input  ： 传出给外面的value值
       */
        changeRightChecked(val,changeOrder,input){
            //为了兼容升序降序作的判断
            if(val){
                this.rightChecked = val;
            }
            if(input){
                this.$emit("input",input);
            }
            //如果有传进第二个参数，表示启动配置上下排序降序功能
            if(changeOrder){
                if(changeOrder === "up"){
                    this.rightChecked.forEach(checkItem => {
                        const index = this.value.findIndex(item => item === checkItem);
                        if(index === 0)return;
                        [this.value[index - 1],this.value[index]] = [this.value[index],this.value[index - 1]]
                    })
                }else{
                    //加一个倒序的处理是为了避免两个配置项相邻的bug
                    this.rightChecked.reverse().forEach(checkItem => {
                        const index = this.value.findIndex(item => item === checkItem);
                        if(index === (this.value.length - 1))return;
                        [this.value[index],this.value[index + 1]] = [this.value[index + 1],this.value[index]]
                    })
                }
            }
            this.getSelectItem();
        },
        //将某一项移动到左边
        addToLeft(){
            this.rightChecked.forEach(checkItem => {
                const index = this.value.findIndex(valueItem => checkItem.replace(":desc","") === valueItem.replace(":desc",""))
                if(index > -1){
                    this.value.splice(index,1);
                }
            });
            this.cancelSelectStatus(this.rightChecked);
            this.$emit('input', this.value);
            //向外提供一个改变时的回调方法，提供三个参数,
            //currentValue:右边选中的值，方向，此时传递选中了哪些数据
            this.$emit("change",this.value,"left",this.rightChecked.slice(0));
            //同步子组件已选中的长度
            this.rightChecked = [];
        },
        //将某一项移动到右边
        addToRight(){
            this.leftChecked.forEach(item => {
                if(this.value.indexOf(item) === -1){
                    this.value.push(item)
                }
            });
            //取消移动配置项的选中状态
            this.cancelSelectStatus(this.leftChecked);
            this.$emit('input', this.value);
            //向外提供一个改变时的回调方法，提供三个参数
            this.$emit("change",this.value,"right",this.leftChecked.slice(0));
            //同步子组件已选中的长度
            this.leftChecked = [];
        },
        //取消移动的配置项的选中状态
        cancelSelectStatus(thisCheck){
            thisCheck.forEach(selectItem => {
                this.data.some(item => {
                    if(selectItem === item.value){
                        item.isSelected = false;
                        return true;
                    }
                })
            })
        }
    },

}
</script>
<style rel="stylesheet/scss" lang="scss">
</style>
