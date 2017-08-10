/**
* Created by linzx on 2017/6/21.
*/
<template>
  <label class="input-checkbox" for="isSaveSchedule">
    <input id="isSaveSchedule" type="checkbox"><span></span>设备
  </label>
</template>

<script type="text/ecmascript-6">
    export default {
        data (){
            return {
              showText : "",  //显示的文案
              isChecked : false //默认是否选中
            }
        }
    }
</script>
<style rel="stylesheet/scss" lang="scss">
  @import "../../styles/resetStyle.scss";
  .input-checkbox{
    display: flex;
    align-items: center;
    cursor: pointer;
    input{display: none;}
    span{
      position: relative;
      display: inline-block;
      margin-right: 5px;
      width: 16px;
      height: 16px;
      border: 1px solid #bfcbd9;
      border-radius: 4px;
      box-sizing: border-box;
      transition: border-color .25s cubic-bezier(.71,-.46,.29,1.46),background-color .25s cubic-bezier(.71,-.46,.29,1.46);
    &:after{
       content: "";
       position: absolute;
       top: 1px;
       left: 5px;
       width: 3px;
       height: 7px;
       border: 2px solid $themeColor;
       border-left: none;
       border-top: none;
       transform: rotate(45deg) scaleY(0);;
       transition: transform .15s cubic-bezier(.71,-.46,.88,.6) .05s;
     }
    }
    input:checked + span{
      border: 1px solid $themeColor;
      transition: border-color .25s cubic-bezier(.71,-.46,.29,1.46),background-color .25s cubic-bezier(.71,-.46,.29,1.46);
    &:after{
       transform: rotate(45deg) scaleY(1);
       transition: transform .15s cubic-bezier(.71,-.46,.88,.6) .05s;
     }
    }
  }
</style>
