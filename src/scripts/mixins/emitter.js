/**
 * Created by linzx on 2018/3/24.
 */
function broadcast(componentName, eventName, params) {
    this.$children.forEach(component => {
        if(component.$options.name === componentName) {
            component.$emit.apply(child,)
        } else {
            broadcast.apply(component,[componentName, eventName, params])
        }
    })
}

export default {
    methods: {
        dispatch(componentName, eventName, params){
            let parent = this.$parent || this.$root
            let name = parent.$options.componentName

            while (parent && (!name && name !== componentName)) {
                parent = parent.$parent
            }
        }
    }
}