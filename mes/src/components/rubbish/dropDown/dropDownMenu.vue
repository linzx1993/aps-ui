/**
* Created by linzx on 2017/6/21.
*/
<template>
  <ul class="drop-down-menu" v-show="isShowDropDownMenu">
    <!--<drop-down-item></drop-down-item>-->
    <li class="drag-down-li" v-for="data in dropDownList" :value="data.value">{{data.text}}</li>
  </ul>
</template>

<script type="text/ecmascript-6">
//  import DropDownItem from "./dropDownItem.vue"
    'use strict';
    export default {
      name : "dropDownMenu",
      data (){
          return{
            isShowDropDownMenu : false
          }
      },
      props : ['dropDownList'],
      components : {
//        'DropDownItem' : DropDownItem
      }
    }

</script>
<style rel="stylesheet/scss" lang="scss">

</style>
