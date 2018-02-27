<template>
    <li class="aps-menu-item"
        :class="{'active': active,'is-disabled': disabled}"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
        :style="[itemStyle, { backgroundColor }]"
        @click="handleClick"
    >
        <slot></slot>
        <slot name="title"></slot>
    </li>
</template>

<script>
    import Menu from './menu';
    export default {
        name : "apsMenuItem",
        componentName : "apsMenuItem",
        mixins : [Menu],
        props: {
            index: {
                type: String,
                required: true
            },
            route: {
                type: [String, Object],
                required: false
            },
            disabled: {
                type: Boolean,
                required: false
            }
        },
        computed : {
            hoverBackgroundColor() {
                return this.rootMenu.hoverBackgroundColor;
            },
            backgroundColor() {
                return this.rootMenu.backgroundColor || '';
            },
            active() {
                return this.index === this.rootMenu.activeIndex;
            },
            textColor() {
                return this.rootMenu.textColor || '';
            },
            activeTextColor() {
                return this.rootMenu.activeTextColor || '';
            },
            itemStyle(){
            	  return {
                    color: this.active ? this.activeTextColor : this.textColor
                }
            }
        },
        methods : {
            onMouseEnter() {
                if (!this.rootMenu.hoverBackgroundColor) return;
                this.$el.style.backgroundColor = this.hoverBackgroundColor;
            },
            onMouseLeave() {
                if (!this.rootMenu.backgroundColor) return;
                this.$el.style.backgroundColor = this.backgroundColor;
            },
            handleClick(){
              this.rootMenu.$emit('item-click', this);
              this.rootMenu.$emit('click', this);
            }
        },
        created(){
            this.rootMenu.addItem(this);
        },
        beforeDestroy() {
          this.rootMenu.removeItem(this);
        }
    }
</script>
<style rel="stylesheet/scss" lang="scss">

</style>
