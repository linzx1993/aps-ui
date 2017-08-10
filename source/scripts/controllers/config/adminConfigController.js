/**
 * Created by yiend on 2017/1/16.
 */
app.controller("adminConfigController",["$rootScope","$scope","$timeout","scheduleTableViewModelService","http","tool",function($rootScope,$scope,$timeout,scheduleTableViewModelService,http,tool) {
    //显示正确的目录class-active
    $scope.configNav.activeNav = ".admin";
    $scope.adminController = {};
    let getColumnData = () =>{
		http.get({
			url: $rootScope.restful_api.reset_show_column + $scope.locationId,
			successFn: (res) => {
                //获得get到的数据，渲染页面
                $scope.setDisplayGetData(res);
            },
			errorFn: () => {
                $scope.info.fail("获取数据失败，请检查是否连上服务器")
            }
		})
    };
    getColumnData();

    //初始化拖拽
    $scope.clickLiGetItem();

    //根据点击不同的车间选择不同的显示项
    $("#columnWorkshop").on("click", ".select-status", (e) => {
        //根据点击的车间ID
        $scope.locationId = e.target.getAttribute("data-location-id");
        $(".select-status").removeClass("active");
        $(e.target).addClass("active");
        //移除临时拖拽项
        $(".js-move").remove();
        getColumnData();
    });

    /**保存数据**/
    $scope.saveAdminDefaultDisplay = () => {
        let postData = $scope.getDisplayPostData("请至少选择一项显示");
        //检测数据是否正确
        if(!postData){
            return;
        }
		http.put({
			url: $rootScope.restful_api.reset_show_column + $scope.locationId,
			data: postData,
			successFn: function(response){
                if(response.data === true){
                    $scope.info.success("默认显示项保存成功");
                }
            },
			errorFn: function(){
                $scope.info.fail("默认显示项保存失败");
            }
		});
    };
    /**
     * 创造车间树
     * @param singleSelect:车间树是否是单选，bool值，true为单选，false为多选用于排程计划
     * @param getConfigData:各个controller成功之后的回调函数（渲染函数）
     * @returns
     * author: linzx
     * Date 2017-02-07
     */
    $scope.createWorkshop = (singleSelect,getConfigData) => {
        //存储树形数据,如果有，则不发送请求
        if(!$scope.folder){
            http.get({
                url: $rootScope.restful_api.get_new_location,
                successFn: (res) => {
                    $scope.resWorkshop = res.data;
                    $scope.folder = {"children": [scheduleTableViewModelService.getData($scope.resWorkshop)[0]]};//处理数据,并绑定到页面
                    $timeout(function () {
                        $("[data-location-id=" + $scope.locationId + "]").addClass("active");
                        let li = $("#columnWorkshop").find("li");//获得最上级一级车间的li
                        li.eq(0).children("ul").show();
                        li.eq(0).children("span").addClass("active");
                    });
                },
                errorFn: function(res){
                    layer.alert("读取车间失败，请检查服务器");
                }
            });
        }
        //先点击默认地点
        $timeout(function(){
            $("[data-location-id=" + $scope.locationId + "]").addClass("active");
            let li = $("#columnWorkshop").find("li");//获得最上级一级车间的li
            li.eq(0).children("ul").show();
            li.eq(0).children("span").addClass("active");
        });
        var outerEle=$(".location-list");
        // let mainTreeHeight = $(".location-tree-ul").eq(0).height();
        outerEle  //改变状态
            .on("click","ul .title-open",function(){
                $(this).toggleClass("active").next().toggle();
                //设置前面线的高度
                let li = $(this).parent(),
                    index = li.index() + 1,
                    ul = li.parent(),
                    height = ul.height() - li.height(); //设置线的高度为ul的高度减去li的高度
                if (index === ul.children().length) {
                    ul.children("b").height(height + 50);
                } else {
                    ul.children("b").height("auto");
                }
            });

        //根据点击不同的车间选择不同的显示项
        if(singleSelect){
            $("#columnWorkshop").on("click", ".select-status", (e) => {
                //根据点击的车间ID
                $scope.locationId = e.target.getAttribute("data-location-id");
                $(".select-status").removeClass("active");
                $(e.target).addClass("active");
                //移除临时拖拽项
                $(".js-move").remove();
                getConfigData();
            });
        }
    };
    //创造车间地点树
    $scope.createWorkshop();
}]);