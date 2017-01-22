app.directive("folderTree", function() {
    return {
        restrict: "E",
        scope: {
            currentFolder: '='
        },
        repalce : true,
        transclude : true,
        templateUrl: 'template/tree.html',
    };
});