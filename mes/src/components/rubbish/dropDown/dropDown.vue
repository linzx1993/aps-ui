/**
* Created by linzx on 2017/6/21.
*/
<template>
  <div class="drag-down-list">
    <ul>
      <li class="drag-down-li" v-for="data in dropDownList" :value="data.value" @click="getValue(data)">{{data.text}}</li>
      <!--<li class="drag-down-li" v-for="data in dropDownList"-->
          <!--:class="{-->
            <!--'active' : isActive,-->
            <!--'disabled' : isDisabled-->
          <!--}"-->
          <!--:value="data.value">-->
        <!--<slot></slot>-->
      <!--</li>-->
    </ul>
  </div>
</template>

<script type="text/ecmascript-6">
    'use strict';
    export default {
      name : "dropDown",
      props : ["dropDownList"],
      mounted (){
      },
      methods : {
        getValue (data){
          this.$store.state.equipmentValue = data.value
        }
      }
    }

</script>
<style rel="stylesheet/scss" lang="scss">
</style>
