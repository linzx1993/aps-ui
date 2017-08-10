/**
* Created by linzx on 2017/6/21.
*/
<template>
    <label class="input-radio">
        <input
            class="el-radio__original"
            type="radio"
            :value="label"
            :name="name"
            v-model="model">
        <span :class="{
            'is-checked': model === label
            }"
        ></span>
        <slot></slot>
    </label>
</template>

<script type="text/ecmascript-6">
  export default {
  	  name : "radio",
      props : {
          value : {},
      	  label : {},
//          isDisabled: Boolean,
          name: String,
          model : ''
      },
      data (){
          return {
//              showText : "",  //显示的文案
              isChecked : false, //默认是否选中
//              isDisabled : false,
          }
      },
//      computed : {
//          model : {
//              get(){
//                  return this.value;
//              },
//              set() {
//              }
//          },
//          isDisabled() {
//              return this.isDisabled;
//          }
//      }
  }
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../../styles/resetStyle.scss";
    .input-radio{
        display: flex;
        align-items: center;
        cursor: pointer;
        input{display: none;}
        span{
            position: relative;
            display: inline-block;
            margin-right: 5px;
            width: 14px;
            height: 14px;
            border: 1px solid #bfcbd9;
            border-radius: 50%;
            box-sizing: border-box;
            transition: border-color .25s cubic-bezier(.71,-.46,.29,1.46),background-color .25s cubic-bezier(.71,-.46,.29,1.46);
            &:after{
                content: "";
                position: absolute;
                top: 3px;
                left: 3px;
                width: 6px;
                height: 6px;
                background-color: $themeColor;
                border-radius: 50%;
                transform: scaleY(0);;
                transition: transform .15s cubic-bezier(.71,-.46,.88,.6) .05s;
            }
            .is-disabled{
                background-color: $dropDownBorderColor;
                &:after{
                    background-color: $dropDownBorderColor;
                }
            }
        }
        input:checked + span,.is-checked{
            border: 1px solid $themeColor;
            transition: border-color .25s cubic-bezier(.71,-.46,.29,1.46),background-color .25s cubic-bezier(.71,-.46,.29,1.46);
            &:after{
                transform: scaleY(1);
                transition: transform .15s cubic-bezier(.71,-.46,.88,.6) .05s;
            }
        }
    }
</style>
