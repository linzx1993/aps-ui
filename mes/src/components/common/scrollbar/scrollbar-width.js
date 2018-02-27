/**
 * Created by linzx on 2018/1/30.
 */
let scrollBarWidth;

export default function () {
    const outer = document.createElement("div");
    outer.className = "el-scrollbar__wrap";
    outer.style.width = '100px';
    outer.style.visibility = "hidden";
    outer.style.position = "absolute";
    outer.style.top = "-9999px";
    document.body.appendChild(outer);

    const widthNoScroll = outer.offsetWidth;
    outer.style.overflow = "scroll";

    const inner = document.createElement("div");
    inner.style.width = "100%";
    outer.appendChild(inner);

    const widthWithScroll = inner.offsetWidth;
    outer.parentNode.removeChild(outer);
    scrollBarWidth = widthNoScroll - widthWithScroll;

    return scrollBarWidth;
}
