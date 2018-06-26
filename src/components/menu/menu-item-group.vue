<template>
    <li class="aps-menu-item-group">
        <div class="aps-menu-item-group-title" v-show="$slots.title">
            <slot name="title"></slot>
        </div>
        <ul>
            <slot></slot>
        </ul>
    </li>
</template>

<script>
    export default {
    	  name : "apsMenuItemGroup",
        props: {
            title: {
                type: String
            }
        },
        data(){
            return {
                paddingLeft: 20
            }
        },
    }
</script>
<style rel="stylesheet/scss" lang="scss">

</style>
