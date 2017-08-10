/*!
 * by zhangxinxu(.com) 2017-05-18
 * 新版上线时候的黑色半透明镂空遮罩指引效果实现jQuery小插件
 * 兼容到IE8+
 * MIT使用协议，使用时候保留版权
 * 更多原理和使用说明参见：http://www.zhangxinxu.com/wordpress/?p=6171
 */

$.guide = function (options) {
    var defaults = {
        selector: '',  // 页面提示元素选择器物，会使用匹配的第一个元素
        content: '',  // 提示内容可是是字符串，也可以是jQuery包装器对象
        align: 'center', // center, right,
        offset: {
            x: 0,
            y: 0
        }
    };
    // options格式
    /* [{
     selector: '',
     content: '',
     align: 'left',
     offset: {
     x: 0,
     y: 0
     }
     }]

     */

    var urlRoot = location.href.split('#')[0].replace(/\W/g, '') + 'Guide';

    // 如果要调试，最后的== '1'改成'2'就好了
    if (!window.localStorage || !options || !$.isArray(options) || localStorage[urlRoot] == '2') {
        return;
    }

    // 创建层
    var elGuideOverlay = $('#guideOverlay');
    var elGuideShut = $('#guideShut');
    var elGuide = $('#guideOverlap');

    var start = 0;

    var remove = function () {
        elGuideOverlay.remove();
        elGuideShut.remove();
        elGuide.remove();
        // 键盘事件移除
        $(document).off('keydown.guide');
        $(window).off('resize.guide');
    };
    var goto = function (change) {
        console.log(1);
        start = start + change;
        if (start < 0) {
            start = 0;
        }
        if (!options[start]) {
            remove();
            return;
        }

        var data = $.extend({}, defaults, options[start]);

        // 获取元素
        var elTrigger = $(data.selector).eq(0);
        if (elTrigger.length === 0 && change) {
            goto(change);
            return;
        }

        // 装载对应提示内容
        elGuide.empty();

        var elGuideContent = $('<div></div>').css({
            display: 'none',
            position: 'absolute'
        }).append(data.content);

        elGuide.append(elGuideContent);

        // 定位
        elGuide.css({
            width: elTrigger.outerWidth(),
            height: elTrigger.outerHeight(),
            left: elTrigger.offset().left,
            top: elTrigger.offset().top
        });

        // 提示内容定位
        elGuideContent.css({
            top: elTrigger.outerHeight() - 5 + data.offset.y
        });

        if (data.align == 'left') {
            elGuideContent.css({
                left: data.offset.x
            });
        } else if (data.align == 'right') {
            elGuideContent.css({
                right: data.offset.x
            });
        } else {
            elGuideContent.css({
                left: (elTrigger.outerWidth() - elGuideContent.width()) / 2 + data.offset.x
            });
        }

        setTimeout(function () {
            elGuideContent.show();
        }, history.pushState? 100: 0);
    };

    if (!elGuideOverlay.length) {
        elGuideOverlay = $('<a id="guideOverlay" href="javascript:" role="button"></a>').css({
            position: 'fixed',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            background: 'url(about:blank)',
            zIndex: 99,
            outline: 'none'
        });

        if (history.pushState) {
            elGuideOverlay.css('background', 'linear-gradient(to top, transparent, transparent)');
        }

        elGuideShut = $('<a href="javascript:" id="guideShut" role="button">关闭</a>').css({
            position: 'fixed',
            top: 10,
            right: 10,
            color: '#fff',
            zIndex: 100
        });

        elGuide = $('<div id="guideOverlap"></div>').css({
            position: 'absolute',
            transition: 'all .3s',
            boxShadow: '0 0 0 9999px rgba(0,0,0,.65)',
            // 如果想支持圆角，下面的注释
            borderRadius: '50%',
            background:'rgba(255,255,255,.5)',
            zIndex: 100
        });

        if (![].map) {
            // IE8浏览器
            elGuide.css('outline', '9999px solid #000').css('filter', 'alpha(opacity=75)');
        }

        $(document.body).append(elGuideOverlay).append(elGuide).append(elGuideShut);

        // 事件
        elGuideShut.on('click', function () {
            remove();
        });

        // 翻页
        elGuideOverlay.on({
            click: function () {
                goto(1);
            }
        });

        $(document).on('keydown.guide', function (event) {
            var keycode = {
                37: 'left',
                38: 'up',
                39: 'right',
                40: 'down',
                27: 'esc'
            };

            switch (keycode[event.keyCode]) {
                case 'esc': {
                    remove();
                    break;
                }
                case 'up': case 'left': {
                goto(-1);
                event.preventDefault();
                break;
            }
                case 'right': case 'down': {
                goto(1);
                event.preventDefault();
                break;
            }
            }
        });

        $(window).on('resize.guide', function () {
            goto(0);
        });
    }

    goto(0);

    elGuideOverlay[0].focus();

    localStorage[urlRoot] = '1';
};
// $.guide([{
//     selector: '.top-right-button',
//     content: '<img src="images/guide-4.png"  width="102" height="100px">',
//     align: 'center'
// },{
//     selector: '.edit-again',
//     content: '<img src="images/guide-4.png" width="102" height="100px">',
//     align: 'right'
// },{
//     selector: '.search-btn',
//     content: '<img src="images/guide-4.png" width="102" height="100px">',
//     align: 'rightee'
// }]);