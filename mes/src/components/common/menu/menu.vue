<template>
    <ul
      class="aps-menu"
      :style="{ backgroundColor: backgroundColor || '' }"
    >
        <slot></slot>
    </ul>
</template>

<script>
  /**
   * desc : 组件采用map来记录各个菜单，
   * 对于当前选中的菜单用openMenus来记录，目前想到的一个好处，方便控制是否uniqueOpened
   */
  export default {
      name : "apsMenu",
      componentName : "apsMenu",
      props: {
          mode: {
              type: String,
              default: 'vertical'
          },
          defaultActive: {
              type: String,
              default: ''
          },
          defaultOpeneds: Array,
          uniqueOpened: {
              type : Boolean,
              default :false
          },
          router: Boolean,
          collapse: false,
          backgroundColor: String,
          hoverBackgroundColor : String,
          textColor: String,
          activeTextColor: String
      },
      data(){
          return {
              menu :true,
              items: {},  //用以记录一级菜单
              submenus: {},   //用以记录一级submenu
              activeIndex: this.defaultActive,
              openedMenus :this.defaultOpeneds ? this.defaultOpeneds.slice(0) : [],
          }
      },
      watch : {
          defaultActive(value) {
              const item = this.items[value];
              if (item) {
                  this.activeIndex = item.index;
                  this.initOpenedMenu();
              } else {
                  this.activeIndex = '';
              }
          },
      },
      methods : {
          initOpenedMenu(){
               const index = this.activeIndex;
               const activeItem = this.items[index];
               if(!activeItem) return;

               //获得该菜单项的路径上所有子菜单
               let indexPath = activeItem.indexPath;

              indexPath.forEach(index => {
                  let submenu = this.submenus[index];
                  submenu && this.openMenu(index,submenu.indexPath);
              })

          },
          openMenu(index,indexPath){
              if(this.openedMenus.indexOf(index) !== -1) return;

              if(this.uniqueOpened){
                  this.openedMenus = this.openedMenus.filter(index => {
                      return indexPath.indexOf(index) !== -1
                  })
              }

              this.openedMenus.push(index);
          },
          closeMenu(index) {
              const i = this.openedMenus.indexOf(index);
              if (i !== -1) {
                  this.openedMenus.splice(i, 1);
              }
          },
          handleSubmenuClick(submenu){
              const {index,indexPath} = submenu;
              let isOpened = this.openedMenus.indexOf(index) !== -1;
              if(isOpened){
                  this.closeMenu(index);
                  this.$emit('close', index, indexPath);
              }else{
                  this.openMenu(index,indexPath);
                  this.$emit('open', index, indexPath);
              }
          },
          handleItemClick(item){
              let { index, indexPath } = item;
              this.activeIndex = item.index;
              this.$emit('select', index, indexPath, item);

              if (this.mode === 'horizontal' || this.collapse) {
                  this.openedMenus = [];
              }

              if (this.router) {
                  this.routeToItem(item);
              }
          },
          routeToItem(item) {
              let route = item.route || item.index;
              try {
                  this.router.push(route);
              } catch (e) {
                  console.error(e);
              }
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
      },
      mounted(){
          this.initOpenedMenu();
          this.$on('item-click', this.handleItemClick);
          this.$on('submenu-click', this.handleSubmenuClick);
      }
    }
</script>
<style rel="stylesheet/scss" lang="scss">

</style>
