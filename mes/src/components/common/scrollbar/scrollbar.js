/**
 * Created by linzx on 2018/1/30.
 */
import { addResizeListener, removeResizeListener } from './resize-event';
import scrollbarWidth from './scrollbar-width';
import toObject from '../../scripts/util';
import Bar from './bar.vue';

export default {
    name : "apsScrollbar",
    props : {
        wrapStyle : {},
        viewClass : {},
        viewStyle: {},
        native : Boolean,
        noresize : {
          type : Boolean,
          default : false
        },
        tag : {
            type : String,
            default : "div"
        }
    },
    data() {
        return {
            sizeWidth: '0',
            sizeHeight: '0',
            moveX: 0,
            moveY: 0
        };
    },
    components : {
        Bar
    },
    computed: {
        wrap() {
            return this.$refs.wrap;
        }
    },
    render(h){
        let gutter = scrollbarWidth();
        let style = this.wrapStyle;

        if(gutter) {
            const gutterWidth= `-${gutter}px`;
            const gutterStyle = `margin-bottom : ${gutterWidth};margin-right : ${gutterWidth}`;

            if(Array.isArray(this.wrapStyle)){
                style = toObject(this.wrapStyle);
                style.marginRight = style.marginBottom = gutterWidth;
            } else if(typeof this.wrapStyle === 'string'){
                style += gutterStyle;
            } else {
                style = gutterStyle;
            }
        }

        const view = h(this.tag,{
            class : ['scrollbar__view',this.viewClass],
            style : this.viewStyle,
            ref : 'resize',
        },this.$slots.default);

        const wrap = (
            <div
                ref="wrap"
                style={style}
                onScroll={this.handleScroll}
                class={[this.wrapClass, 'scrollbar__wrap', gutter ? '' : 'scrollbar__wrap--hidden-default']}>
                {[view]}
            </div>
        );

        let nodes;

        if(!this.native){
            nodes = ([wrap,
                <Bar
                    move={this.moveX}
                    size={this.sizeWidth}
                ></Bar>,
                <Bar
                    vertical
                    move={ this.moveY }
                    size={ this.sizeHeight}
                ></Bar>])
        } else {
            nodes = ([
                <div
                    ref="wrap"
                    class={[this.wrapClass,'scrollbar__wrap']}
                    style={style}
                >{[view]}</div>])
        }
        return h('div',{class:'scrollbar'},nodes)
    },
    methods : {
        handleScroll(){
            const wrap = this.wrap;

            this.moveX = (wrap.scrollLeft *100 / wrap.clientWidth);
            this.moveY = (wrap.scrollTop *100 / wrap.clientHeight);
        },
        update(){
          console.log(1111111111);
            let heightPercentage, widthPercentage;
            const wrap = this.wrap;
            if(!wrap) return;

            heightPercentage = (wrap.clientHeight * 100 / wrap.scrollHeight);
            widthPercentage = (wrap.clientWidth * 100 / wrap.scrollWidth);
            console.log(wrap.clientHeight,wrap.scrollHeight);

            this.sizeHeight = (heightPercentage < 100) ? (heightPercentage + '%') : '';
            this.sizeWidth = (widthPercentage < 100) ? (widthPercentage + '%') : '';
        }
    },
    mounted(){
        if(this.native) return;
        this.$nextTick(this.update);
        !this.noresize && addResizeListener(this.$refs.resize, this.update);
    },
    beforeDestroy(){
        if (this.native) return;
        !this.noresize && removeResizeListener(this.$refs.resize, this.update);
    }
}
