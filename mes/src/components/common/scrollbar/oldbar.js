import { on, off } from '../../scripts/util';
import { renderThumbStyle, BAR_MAP } from './util';

export default {
    name : "bar",
    props : {
        vertical : Boolean,
        size : String,
        move : Number
    },
    computed : {
        bar(){
            return BAR_MAP[this.vertical ? 'vertical' : 'horizontal'];
        },
        wrap(){
            return this.$parent.wrap;
        }
    },
    render(h){
        const {size,move,bar} = this;

        return (
            <div
                class={['el-scrollbar__bar','is-' + bar.key]}
                onMousedown={ this.clickTrackHandle }
            >
                <div
                    ref="thumb"
                    class="el-scrollbar__thumb"
                    onMousedown={ this.clickThumbHandle }
                    style={renderThumbStyle({size,move,bar})}
                ></div>
            </div>
        )
        return h('div',{
          class : {
            'el-scrollbar__bar' : true,
            'is-vertical' : bar.key === 'vertical',
            'is-horizontal' : bar.key !== 'vertical',
          },
          on: {
            mousedown: this.clickTrackHandle
          }
        },[h('div',{
          class : {
            'el-scrollbar__thumb' : true
          },
          style : {
            [bar.size] : renderThumbStyle({size,move,bar}).size,
            transform : renderThumbStyle({size,move,bar}).transform
          },
          ref: 'thumb',
          on : {
            mousedown: this.clickThumbHandle
          }
        })])
    },
    methods : {
        //点击滚动条
        clickThumbHandle(e){
            alert(1);
            //开始拖动滚动条
            this.startDrag(e);
            //获得点击位置与滚动条底部之间的距离
            this[this.bar.axis] = e.currentTarget[this.bar.offset] - (e[this.bar.client] - e.currentTarget.getBoundingClientRect()[this.bar.direction]);
        },
        //将滚动条定位在点击滚动框的位置，并且鼠标处在滚动条中间
        clickTrackHandle(e){
            alert(2);
            //获得点击位置与滚动框顶部之间的距离
            const offset = Math.abs(e.target.getBoundingClientRect()[this.bar.direction] - e[this.bar.client])
            //获得滚动条高度的一半
            const thumbHalf = this.$refs.thumb[this.bar.offset] / 2;
            //计算出滚动条在滚动框的百分比位置
            const thumbPositionPercentage = (offset - thumbHalf) * 100 / this.$el[this.bar.offset];

            //计算出scrollTop的值，wrap？
            this.wrap[this.bar.scroll] = (thumbPositionPercentage * this.wrap[this.bar.scrollSize] / 100);
        },
        startDrag(e){
            e.stopImmediatePropagation();
            this.cursorDown = true;
            on(document,"mousemove",this.mouseMoveDocumentHandler)
            on(document,"mouseup",this.mouseUpDocumentHandler)

        },
        mouseMoveDocumentHandler(){
            if(this.cursorDown === false) return;
            const prevPage = this[this.bar.axis];

            if(!prevPage) return;

            //获得点击位置与 滚动框顶部 之间的距离
            const offset = (this.$el.getBoundingClientRect()[this.bar.direction] - e[this.bar.client]) * -1;

            //获得点击位置与 滚动条顶部 之间的距离
            const thumbClickPosition = (this.$refs.thumb[ths.bar.offset] - prevPage);
            //获得滚动条所处的百分比位置
            const thumbPositionPercentage = (offset - thumbClickPosition) * 100 / this.$el[this.bar.offset];

            //计算出滚动条应该在滚动框中所处的位置，scrollTop
            this.wrap[this.bar.scroll] = thumbPositionPercentage * this.wrap[this.bar.scrollSize] / 100;
        },
        mouseUpDocumentHandler(e){
            this.cursorDown = false;
            this[this.bar.axis] = 0;
            off(document,"mousemove",this.mouseMoveDocumentHandler);
            document.onselectstart = null;
        }
    },
    mounted(){
    },
    destoryed(){
        off(document,"mouseup",this.mouseUpDocumentHandle);
    }
}
