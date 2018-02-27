<template>
    <li
        :class="{'aps-submenu': true,
        'is-active': active,
        'is-opened': opened}"
    >
        <div
            ref="submenu-title"
            :style="titleStyle"
            @click="handleClick"
            class="aps-submenu-title"
        >
            <slot name="title"></slot>
            <i :class="{
                'el-submenu__icon-arrow': true,
                'el-icon-arrow-down': rootMenu.mode === 'horizontal' || rootMenu.mode === 'vertical' && !rootMenu.collapse,
                'el-icon-arrow-right': rootMenu.mode === 'vertical' && rootMenu.collapse
                }">
            </i>
        </div>
        <transition
            @before-enter="beforeEnter"
            @enter="enter"
            @after-enter="afterEnter"
            @before-leave="beforeLeave"
            @leave="leave"
            @after-leave="afterLeave"
        >
            <ul class="aps-menu" v-show="opened"><slot></slot></ul>
        </transition>
    </li>
</template>

<script>
    import Menu from './menu';
    import { addClass, removeClass } from '../../scripts/util';
    export default {
        name : "apsSubmenu",
        componentName : "apsSubmenu",
        mixins : [Menu],
        props: {
            index: {
                type: String,
                required: true
            }
        },
        data() {
            return {
                timeout: null,
                items: {},
                submenus: {}
            };
        },
        computed : {
            opened() {
                return this.rootMenu.openedMenus.indexOf(this.index) > -1;
            },
            active(){
                let isActive = false;
                const submenus = this.submenus;
                const items = this.items;

                //监测每个子菜单，只要有一个是打开，则作为父菜单也打开
                Object.keys(items).forEach(index => {
                    if (items[index].active) {
                        isActive = true;
                    }
                });

                Object.keys(submenus).forEach(index => {
                    if (submenus[index].active) {
                        isActive = true;
                    }
                });

                return isActive;
            },
            backgroundColor() {
                return this.rootMenu.backgroundColor || '';
            },
            activeTextColor() {
                return this.rootMenu.activeTextColor || '';
            },
            textColor() {
                return this.rootMenu.textColor || '';
            },
            titleStyle(){
                return {
                    color: this.active ? this.activeTextColor : this.textColor
                }
            }
        },
        methods : {
            beforeEnter(el) {
              addClass(el, 'collapse-transition');
              if (!el.dataset) el.dataset = {};


              el.dataset.oldPaddingTop = el.style.paddingTop;
              el.dataset.oldPaddingBottom = el.style.paddingBottom;

              el.style.height = '0';
              el.style.paddingTop = 0;
              el.style.paddingBottom = 0;
            },

            enter(el) {
              el.dataset.oldOverflow = el.style.overflow;
              if (el.scrollHeight !== 0) {
                el.style.height = el.scrollHeight + 'px';
                el.style.paddingTop = el.dataset.oldPaddingTop;
                el.style.paddingBottom = el.dataset.oldPaddingBottom;
              } else {
                el.style.height = '';
                el.style.paddingTop = el.dataset.oldPaddingTop;
                el.style.paddingBottom = el.dataset.oldPaddingBottom;
              }

              el.style.overflow = 'hidden';
            },

            afterEnter(el) {
              // for safari: remove class then reset height is necessary
              removeClass(el, 'collapse-transition');
              el.style.height = '';
              el.style.overflow = el.dataset.oldOverflow;
            },

            beforeLeave(el) {
              if (!el.dataset) el.dataset = {};
              el.dataset.oldPaddingTop = el.style.paddingTop;
              el.dataset.oldPaddingBottom = el.style.paddingBottom;
              el.dataset.oldOverflow = el.style.overflow;

              el.style.height = el.scrollHeight + 'px';
              el.style.overflow = 'hidden';
            },

            leave(el) {
              if (el.scrollHeight !== 0) {
                // for safari: add class after set height, or it will jump to zero height suddenly, weired
                addClass(el, 'collapse-transition');
                el.style.height = 0;
                el.style.paddingTop = 0;
                el.style.paddingBottom = 0;
              }
            },
            afterLeave(el) {
              removeClass(el, 'collapse-transition');
              el.style.height = '';
              el.style.overflow = el.dataset.oldOverflow;
              el.style.paddingTop = el.dataset.oldPaddingTop;
              el.style.paddingBottom = el.dataset.oldPaddingBottom;
            },

            addItem(item) {
                this.$set(this.items, item.index, item);
            },
            removeItem(item) {
                delete this.items[item.index];
            },
            addSubmenu(item) {
                this.$set(this.submenus, item.index, item);
            },
            removeSubmenu(item) {
                delete this.submenus[item.index];
            },
            handleClick(){
                this.rootMenu.$emit('submenu-click', this);
            }
        },
        created() {
            this.rootMenu.addSubmenu(this);
        },
        beforeDestroy() {
            this.rootMenu.removeSubmenu(this);
        }
    }
</script>
<style rel="stylesheet/scss" lang="scss">
    /*.my-enter-leave-active{*/
        /*transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);*/
    /*}*/
</style>
