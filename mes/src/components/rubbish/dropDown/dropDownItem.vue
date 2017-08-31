/**
* Created by linzx on 2017/6/21.
*/
<template>
  <li class="drag-down-li" v-for="data in dropDownList"
      :class="{
            'active' : isActive,
            'disabled' : isDisabled
          }"
      :value="data.value"
      @click="handleClick"
  >
    <slot></slot>
  </li>
</template>

<script type="text/ecmascript-6">
    'use strict';
    export default {
      name : "dropDownItem",
      props : [],
      data (){
          return {
            isActive : Boolean,
            isDisabled : Boolean
          }
      },
      methods: {
        handleClick(e) {
        }
      }
    }

</script>
<style rel="stylesheet/scss" lang="scss">

</style>
