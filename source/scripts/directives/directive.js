//排程前页面专用的地点树
app.directive("folderTree", function() {
    return {
        restrict: "E",
        scope: {
            currentFolder: '='
        },
        replace : true,
        transclude : true,
        templateUrl: 'view/template/tree.html',
    };
});

//配置页专用的地点树
app.directive("configFolderTree", function() {
    return {
        restrict: "E",
        replace : true,
        transclude : true,
        template: '' +
        '<div id="columnWorkshop" class="location-list fl location-show">'+
            '<h6 class="tc mb-5 mt-20">{{"selectWorkShop" | translate}} <span style="color: #808080" class="fs-12">（{{"selectWorkShopTip" | translate}}）</span></h6>'+
            '<ul>'+
                '<li class="all-location">'+
                '<i class="select-status" data-location-id="01"></i>'+
                '<span class="ml-10 title-open">'+
                '<s class="open-btn mr-10"></s>'+
                '春风车间'+
                '</span>'+
                '<folder-tree current-folder="folder"></folder-tree>'+
                '</li>'+
            '</ul>'+
        '</div>',
        link : function () {
            // $("#columnWorkshop i").addClass("active");
        }
    };
});
//排程结果页面右键事件
app.directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
});

//设备作业页 手动微调页点击左键出现目录
app.directive("rightClickNav", function() {
    return {
        restrict: "E",
        scope: false,
        replace : true,
        transclude : true,
        template:'' +
        '<div style="display: none;" id="jLeftClickNav" class="left-click-nav">' +
            '<ul>' +
                '<li ng-if="leftNavLiShow.workUnit" ng-click="unit_click(selectCellFront,1,$event)">工作单元</li>' +
                '<li ng-if="leftNavLiShow.changeEquipment" ng-click="unit_click(selectCellFront,2,$event)">换装计划</li>' +
                '<li ng-if="leftNavLiShow.equipmentDetails" ng-click="unit_click(selectCellFront,3,$event)">设备详情</li>' +
            '</ul>' +
        '</div>',
    };
});
