app.directive("folderTree", function() {
    return {
        restrict: "E",
        scope: {
            currentFolder: '='
        },
        replace : true,
        transclude : true,
        templateUrl: 'view/template/tree.html',
        link : function ($scope,elem,attr) {
            // console.log($scope);
            // $scope.addId = function (data) {
            //     // alert(1);
            //     // console.log(data);
            // }
        }
    };
});

