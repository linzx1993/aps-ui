<template>
    <div>
        <div class="aps-popover"
            ref="popper"
            v-show="!disabled && showPopper"
             :id="tooltipId"
             :style="{ width: width + 'px' }"
        >
            <h6 class=""></h6>
            <slot>{{ content }}</slot>
        </div>
        <slot name="reference"></slot>
    </div>
</template>

<script>
    import Popper from './popper.js';
    import { generateId } from '../../scripts/util';
    import { on,off } from '../../scripts/util';
    export default {
    	  name : "apsPopover",
        mixins : [Popper],
        props : {
            trigger : {
            	  type : String,
                default : 'hover',
                validator : value => ['click', 'focus', 'hover'].indexOf(value) > -1
            },
            openDelay: {
                type: Number,
                default: 0
            },
            width: {},
            title: String,
            disabled: Boolean,
            content: String,
            popperClass: String,
        },
        computed : {
    	  	  tooltipId(){
    	  	  	  return `aps-popover-${generateId()}`;
            }
        },
        watch : {
            showPopper(n){
                n ? this.$emit("show") : this.$emit("hide")
            }
        },
        data(){
    	  	  return {
            }
        },
        methods : {
            doToggle() {
                this.showPopper = !this.showPopper;
            },
            doShow() {
                this.showPopper = true;
            },
            doClose() {
                this.showPopper = false;
            },
            //
            handleDocumentClick(e){
            	  let reference = this.reference || this.$refs.reference;
            	  let popper = this.popper || this.$refs.popper;

            	  if(!reference && this.$slots.reference && this.$slots.reference[0]){
            	  	  reference = this.referenceElm = this.$slots.reference[0].elm;
                }

                if(!this.$el || !this.reference ||
                  this.$el.contain(e.target) ||
                    reference.contains(e.target) ||
                  !popper || popper.contains(e.target))return;

            	  this.showPopper = false;
            },
            handleMouseEnter(){
                clearTimeout(this._timer);
                if (this.openDelay) {
                    this._timer = setTimeout(() => {
                        this.showPopper = true;
                    }, this.openDelay);
                } else {
                    this.showPopper = true;
                }
            },
            handleMouseLeave() {
                clearTimeout(this._timer);
                this._timer = setTimeout(() => {
                    this.showPopper = false;
                }, 200);
            },
        },
        mounted(){
            let reference = this.referenceElm = this.reference || this.$refs.reference;
            let popper = this.popper || this.$refs.popper;

            if (!reference && this.$slots.reference && this.$slots.reference[0]) {
                reference = this.referenceElm = this.$slots.reference[0].elm;
            }

            if(reference){
                on(reference, 'mouseenter', this.handleMouseEnter);
                on(popper, 'mouseenter', this.handleMouseEnter);
            }
            if(this.trigger === 'click'){
                on(reference, 'click', this.doToggle);
                on(document, 'click', this.handleDocumentClick);
            }else if(this.trigger === 'hover'){
                on(reference, 'mouseenter', this.handleMouseEnter);
                on(popper, 'mouseenter', this.handleMouseEnter);
                on(reference, 'mouseleave', this.handleMouseLeave);
                on(popper, 'mouseleave', this.handleMouseLeave);
            }
        },
        destroyed(){
        	  let reference = this.reference;
            off(reference, 'click', this.doToggle);
            off(reference, 'mouseleave', this.handleMouseLeave);
            off(reference, 'mouseenter', this.handleMouseEnter);
            off(document, 'click', this.handleDocumentClick);
        }
    }
</script>
<style rel="stylesheet/scss" lang="scss">

</style>
