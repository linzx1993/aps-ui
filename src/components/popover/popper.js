/**
 * Created by linzx on 2018/1/3.
 */
export default {
    props : {
        placement : {
            type : String,
            default : 'bottom'
        },
        offset : {
            default: 0
        },
        appendToBody : {
            type : Boolean,
            default : true
        }
    },
    data(){
        return {
            showPopper: false,
            currentPlacement: ''
        }
    },
    watch : {
        showPopper(val) {
            val ? this.updatePopper() : this.destroyPopper();
            this.$emit('input', val);
        }
    },
    methods : {
        createPopper(){
            this.currentPlacement = this.currentPlacement || this.placement;
            if(!(/^(top|bottom|left|right)-(start|end)?$/g).test(this.currentPlacement))return;

            let popper = this.popperElm = this.this.popperElm || this.popper || this.$refs.popper;
            let reference = this.referenceElm = this.referenceElm || this.reference || this.$refs.reference;
            if (!reference && this.$slots.reference && this.$slots.reference[0]) {
              reference = this.referenceElm = this.$slots.reference[0].elm;
            }

            if (!popper || !reference) return;
            if (this.visibleArrow) this.appendArrow(popper);
            if(this.appendToBody) document.body.appendChild(this.popperElm);
        },
        appendArrow(element){
            const arrow = document.createElement("div");
            arrow.className = "popper-arrow";
            element.appendChild(arrow);
        },
        updatePopper() {
            this.popperJS ? this.popperJS.update() : this.createPopper();
        },
        destroyPopper(){

        }
    }
}
