<template>
    <div>
        <section v-show="isShowBox">
            <slot></slot>
        </section>
        <p  :class="isShowBox ? 'folder-up' : 'unfolded'" class="mt-5 tc folder-box">
            <i title="点击收起" class="icon-arrow el-icon-arrow-up" v-show="isShowBox" @click="hideBox"></i>
            <i title="点击展开" class="icon-arrow el-icon-arrow-down" v-show="!isShowBox" @click="showBox"></i>
        </p>
    </div>
</template>

<script>
    export default {
        name : "apsQueryConditionBox",
        data(){
            return {
                isShowBox : true
            }
        },
        methods : {
        	  hideBox(){
        	  	  this.isShowBox = false;
            },
            showBox(){
                this.isShowBox = true;
            }
        }
    }
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../../../styles/resetStyle.scss";
    .folder-box{
        position: relative;
        border-top: 1px solid $borderColor;
        color: $borderColor;
        height: 20px;
    }
    .icon-arrow{
        cursor: pointer;
    }
    .unfolded .icon-arrow{
        position: absolute;

    }
</style>
