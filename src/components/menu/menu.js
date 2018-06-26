/**
 * Created by linzx on 2018/1/23.
 */
export default {
    computed: {
        //用于记录一系列父子submenu的index
        indexPath() {
            const path = [this.index];
            let parent = this.$parent;
            while (parent.$options.componentName !== 'apsMenu') {
                if (parent.index) {
                    path.unshift(parent.index);
                }
                parent = parent.$parent;
            }
            return path;
        },
        rootMenu(){
            let parent = this.$parent;
            while(parent && parent.$options.componentName !== 'apsMenu'){
                parent = parent.$parent;
            }
            return parent;
        },
        parentMenu() {
            let parent = this.$parent;
            while (parent && ['apsMenu', 'apsSubmenu'].indexOf(parent.$options.componentName) === -1) {
                parent = parent.$parent;
            }
            return parent;
        },
        paddingStyle() {
            if (this.rootMenu.mode !== 'vertical') return {};

            let padding = 20;
            let parent = this.$parent;

            if (this.rootMenu.collapse) {
              padding = 20;
            } else {
                while (parent && parent.$options.componentName !== 'apsMenu') {
                    if (parent.$options.componentName === 'apsSubmenu') {
                        padding += 20;
                    }
                    parent = parent.$parent;
                }
            }
            return {paddingLeft: padding + 'px'};
        }
    }
}
