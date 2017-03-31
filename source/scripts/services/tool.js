/**
 * 小方法相关的函数
 * Created by dww on 2017/2/9.
 */

app.service('tool', function($rootScope) {

	/**
	 * 设置表格头部宽度
	 */
	this.setTableHeadWidth = function(parentNodes) {
		var lastLeft = 0;
		var jCoverHead = parentNodes.find(".cover-head"),
			jShowTable = parentNodes.find(".show-table thead");
		jCoverHead.width(jShowTable.width());
		jCoverHead.height(jShowTable.height());
		var jCoverTh = jCoverHead.find("div");
		var jHeadTh = jShowTable.find("th");
		var thNum = jHeadTh.length;
		for(var i = 0; i < thNum; i++) {

			if(!!window.ActiveXObject || "ActiveXObject" in window) {
				if(i == thNum - 1) {
					jCoverTh.eq(i).width(jShowTable.width() - jHeadTh.eq(i).position().left - 2);
				} else {
					var thisWidth = jHeadTh.eq(i + 1).position().left - lastLeft - 2;
					lastLeft = jHeadTh.eq(i + 1).position().left
					jCoverTh.eq(i).width(thisWidth);
				}
			} else {
				jCoverTh.eq(i).width(jHeadTh.eq(i).width());
			}
		}
	};

	/**二级页面地点下拉框（有时间可封装成共有的下拉框组件）
	 * 
	 * @param 所有地点对象
	 * @param 当前input对象
	 * @param 是否单选
	 * 
	 */
	this.dialogWindowEquipment = function(equipmentInfo, thisInput, selectOne) {
		var jTableDialogWindow = $(".table-dialog-window");
		var thisTarget = thisInput.target;
		var x = thisTarget.offsetLeft;
		var y = thisTarget.offsetTop + thisTarget.offsetHeight;
		var equipmentList = $("<div class='equipment-list'><ul></ul></div>");
		var equipmentInputVal = jTableDialogWindow.find(".equipment-input").val().split(",");

		for(var i in equipmentInfo) {
			var thisText = equipmentInfo[i].punitName;
			if(equipmentInputVal.indexOf(thisText) >= 0) {
				equipmentList.find("ul").append($("<li class='li-selected'></li>").text(thisText).attr("equipment-id", i));
			} else {
				equipmentList.find("ul").append($("<li></li>").text(thisText).attr("equipment-id", i));
			}

		}
		jTableDialogWindow.find(".info-show").append(equipmentList);
		$(".equipment-list").css("left", x);
		$(".equipment-list").css("top", y);

		$(".equipment-list").on("click", "li", function() {
			var thisText = $(this).text();
			var inputVal = $(".equipment-input").val();

			if(selectOne) {
				if($(this).hasClass("li-selected")) {
					return;
				} else {
					$(".li-selected").removeClass("li-selected");
					$(this).addClass("li-selected");
					jTableDialogWindow.find(".equipment-input").val($(this).text());
				}
				$(".equipment-list").remove();
			} else {
				$(this).toggleClass("li-selected");

				var jLiSelected = $(".li-selected");
				var newVal = [];
				for(var i = 0, l = jLiSelected.length; i < l; i++) {
					newVal.push(jLiSelected.eq(i).text());
				}
				jTableDialogWindow.find(".equipment-input").val(newVal.join(","));
			}

		});
	}

	/**string转date
	 * 
	 * @param 时间字符串（2016-01-01）
	 * @returns 时间对象
	 */
	this.stringToDate = function(str) {
		return str == undefined ? undefined : new Date(str.replace(/-/g, "/"));
	}

	/**date转string
	 * 
	 * @param 时间对象
	 * @returns 时间字符串（2016-01-01）
	 */
	this.dateToString = function(date) {
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		if(month < 10) {
			month = "0" + month;
		}
		var day = date.getDate();
		if(day < 10) {
			day = "0" + day;
		}
		return year + "-" + month + "-" + day;
	}

	/**
	 * 从页面input标签内获取参数,转码后返回
	 * @param {string} input或者其父元素的class
	 *
	 * @return{string} 包含从input中读取的、经过转码的参数的数组
	 */
	this.getFromInput = function(className) {
		if(typeof(className) != "string") {
			return;
		} else {
			var thisEle = $(className);

			if(thisEle.is("input")) {
				return encodeURIComponent(thisEle.val().trim());
			} else if(thisEle.find("input").length == 1) {
				return encodeURIComponent(thisEle.find("input").val().trim());
			} else if(thisEle.find("input").length > 1) {
				var returnList = [];
				thisEle.find("input").each(function() {
					returnList.push(encodeURIComponent($(this).val().trim()));
				});
				return returnList;
			}
		}
	}

	/**
	 * 从页面input标签内获取参数,不  转码后返回！！
	 * @param {string} input或者其父元素的class
	 *
	 * @return{string} 包含从input中读取的参数的数组
	 */
	this.getFromInput_nocode = function(className) {
		if(typeof(className) != "string") {
			return;
		} else {
			var thisEle = $(className);

			if(thisEle.is("input")) {
				return thisEle.val().trim();
			} else if(thisEle.find("input").length == 1) {
				return thisEle.find("input").val().trim();
			} else if(thisEle.find("input").length > 1) {
				var returnList = [];
				thisEle.find("input").each(function() {
					returnList.push($(this).val().trim());
				});
				return returnList;
			}
		}
	}

	/**
	 * 浏览器及其版本号检测方法
	 * 
	 * @return{Object} 返回浏览器，和版本号组成的对象。
	 */
	this.getBrowser = function() {
		var rMsie = /(msie\s|trident\/7)([\w\.]+)/;
		var rTrident = /(trident)\/([\w.]+)/;
		var rFirefox = /(firefox)\/([\w.]+)/;
		var rOpera = /(opera).+version\/([\w.]+)/;
		var rNewOpera = /(opr)\/(.+)/;
		var rChrome = /(chrome)\/([\w.]+)/;
		var rSafari = /version\/([\w.]+).*(safari)/;
		var ua = navigator.userAgent.toLowerCase();
		var matchBS, matchBS2;

		matchBS = rMsie.exec(ua);
		if(matchBS != null) {
			if(matchBS[1].trim() == "msie") {
				switch(matchBS[2]) {
					case "10.0":
						return {
							browser: "IE",
							version: "10"
						};
						break;
					case "9.0":
						return {
							browser: "IE",
							version: "9"
						};
						break;
					case "8.0":
						return {
							browser: "IE",
							version: "8"
						};
						break;
					case "7.0":
						return {
							browser: "IE",
							version: "7以下"
						};
						break;
				}
			} else {
				return {
					browser: "IE",
					version: "11"
				}
			}
		}
		matchBS = rFirefox.exec(ua);
		if((matchBS != null) && (!(window.attachEvent)) && (!(window.chrome)) && (!(window.opera))) {
			return {
				browser: matchBS[1] || "",
				version: matchBS[2] || "0"
			};
		}
		matchBS = rOpera.exec(ua);
		if((matchBS != null) && (!(window.attachEvent))) {
			return {
				browser: matchBS[1] || "",
				version: matchBS[2] || "0"
			};
		}
		matchBS = rChrome.exec(ua);
		if((matchBS != null) && (!!(window.chrome)) && (!(window.attachEvent))) {
			matchBS2 = rNewOpera.exec(ua);
			if(matchBS2 == null) {
				return {
					browser: matchBS[1] || "",
					version: matchBS[2] || "0"
				};
			} else {
				return {
					browser: "Opera",
					version: matchBS2[2] || "0"
				};
			}
		}
		matchBS = rSafari.exec(ua);
		if((matchBS != null) && (!(window.attachEvent)) && (!(window.chrome)) && (!(window.opera))) {
			return {
				browser: matchBS[2] || "",
				version: matchBS[1] || "0"
			};
		}

	}

	/**
	 * 进度条
	 * @param {elements1} 父元素(必填)
	 * @param {elements2} 子元素，进度条(必填)
	 * @param {url} 接口地址
	 * @param {text} 进度条上显示文本
	 * @return{fn} 当进度加载完成后执行的参数方法
	 * 
	 * @param {String} absUrl 当前的url
	 */
	this.newprogressBar = function(elements1, elements2, url, text, fn, ff, absUrl) {
		var progressbar = $(elements1),
			progressLabel = $(elements2);
		progressbar.show(); //进度条显示
		var i = 0; //循环次数
		function SetProgress() {
			var progressVal = 0;
			$.ajax({
				type: "get",
				url: url,
				success: function(result) {
					var res = result.success_response;
					ff(res);
					progressVal = res.rate || 0; //获取接口数据
					var progWidth = 40 + progressVal / 100 * 360;
					//							progressbar.children("span").css("width", progWidth + "px"); 
					progressbar.children("span").animate({
						"width": progWidth + "px"
					});

					//							progressbar.children("span").css("width", progressVal + "%");
					if(progressVal < 10) {
						progressVal = 10;
					}
					progressLabel.text(progressVal + "%");
					progressbar.find(".process-label").html(text + "处理中，请稍后……" + progressVal + "%");
					if(progressVal || progressVal == 0) { //数据正确
						if(progressVal < 100) {
							var j = setTimeout(SetProgress, 1000);
							if(i > 360) {
								layer.alert("进度失败，请联系技术人员处理");
								clearTimeout(j);
								progressLabel.text(text + "失败");
							}
						} else {
							//									progressLabel.text(text+"完成");
							progressLabel.text("100%")
							progressbar.find(".process-label").html(text + "完成" + progressVal + "%");
							fn(); //参数
						}
					} else { //如果数据错误		      					      				
						layer.alert("进度失败，请联系技术人员处理");
						progressbar.hide(50); //进度条加载完成后隐藏
					}
				},
				headers: {
					"X-Requested-With": "XMLHttpRequest",
					"redirectUrl": absUrl,
					"Authorization": localStorage.getItem("token") || ""
				}
			});
			i++;
		}
		SetProgress(); //开始加载
	}

	/**
	 *渲染的地点树的数据
	 * * @param locationData 获得地点树数据
	 * @return{Object} 可供渲染的地点树数据。
	 */
	this.getLocationTreeData = function(locationData) {
		let arr = [];
		let _this = this;
		for(let name in locationData) {
			let obj = {
				name: locationData[name].locationName,
				"locationId": locationData[name].locationId,
			};
			arr.push(obj);
			if(!_this.isEmptyObject(locationData[name]["nextLevelLocation"])) {
				obj.children = _this.getLocationTreeData(locationData[name]["nextLevelLocation"]);
			}
		}
		return arr;
	};

	/**
	 * 判断是否为空对象
	 * @return{Object} true：表示空对象，false不为空对象
	 */
	this.isEmptyObject = function(obj) {
		for(var i in obj) {
			return false
		}
		return true
	}

	/**
	 * 检查新创建规则和方案时是否重名
	 * @param newName,nameList,type: 新名字 已有名字列表 方案名还是规则名
	 * @return 新名字 或者 错误
	 */
	this.checkRepeatName = function(newName, nameList, type) {
		if(!nameList || !nameList.length) {
			return newName
		}
		let result;
		if(type === "rule") {
			result = nameList.every((item) => {
				return item.ruleName != newName;
			})
		} else {
			result = nameList.every((item) => {
				return item.schemeName != newName;
			})
		}
		return result ? newName : false
	}

	/**
	*desc:1.获取点击元素位于相对于某个父元素的offset属性2.没有设置父元素直接获取相对页面3.想获取最近父元素直接获取，不需要调用此方法
	*time:2017-03-20
	*author:linzx
	*@param: 点击的dom元素或者dom元素的ID
	*@param: 需要获取相对距离的父元素,如不需要设置为null
	*@param: 获得相对元素的滚动条滚动距离
	*@return:{offsetLeft：left，offsetTop:top}
	**/
	this.getOffset = function (obj,parentObj,scrollParent) {
        let _offset = {};
        let node = typeof obj == "string" ? document.getElementById(obj) : obj;
        parentObj = parentObj ? (typeof obj == "string" ?document.getElementById(parentObj) : parentObj) : null;
        let left = node.offsetLeft;
        let top = node.offsetTop;
        let parent = node.offsetParent;
        //不断向上获取父元素的offsetLeft，知道获取到与页面的距离
        while (parent != parentObj) {
            left += parent.offsetLeft;
            top += parent.offsetTop;
            parent = parent.offsetParent;
        }
        //获得相对于页面主体的滚动条滚动距离
		console.log(document.querySelectorAll(scrollParent));
        let scrollParentLeft = scrollParent ? document.querySelectorAll(scrollParent)[0].scrollLeft : 0;
        console.log(scrollParentLeft);
        _offset.left = left - scrollParentLeft;
        //!!!!!配置页减去对应的滚动条距离
        _offset.top = top;
        return _offset;
    };

    /**
     * 但会传入对象的类型
	 * *time:2017-03-24
     * author:linzx
     * @params object :待验证数据
     * @return 返回object的type
     */
    this.typeObject = function (obj) {
        return Object.prototype.toString.call(obj).slice(8,-1);
    };

    /**
     * 一维数组去重
	 * *time:2017-03-24
     * author:linzx
     * @author:linzx
     * @params Array
     * @return 返回Array,返回数组乱序
     */
    this.uniqueArray = function (array) {
        if(!this.typeObject(array) === "Array"){
            return;
        }
        array.filter(function (item, index) {
            return array.indexOf(item) !== index;
        })
    };

    /**
     * 获取选中车间的公有父车间
     * author：dww,
     * date : 2017-03-18,
     * 输入多个地点ID，属于同一车间下取此车间，不同车间下，取共有的父车间;
     * @param locationList:车间地点数组
     *@return location_pre
     */
    this.getCommonLocationId = function(locationList) {
        let commonParentId;
        if (!locationList) {
            layer.alert("请选择一个正确的车间");
            return;
        }
        let locationListType = this.typeObject(locationList);
        if(locationListType !== "Array"){
        	if(locationListType === "Object"){
                locationList = Array.prototype.slice.call(locationList);
			}
			if(locationListType === "String"){
                locationList = locationList.split(",");
			}
        }
        //	1.如果只有一个车间直接返回
        //	2.如果传进车间开头不对，直接返回一级车间
        //	3.将数组长度顺序从小到大排列，
        if (locationList.length == 1) {
            commonParentId = locationList[0];
        } else if (locationList.indexOf("01") > -1) {
            commonParentId = "01";
        } else {
            locationList.sort(function (a, b) {
                return a.length - b.length;
            });
            commonParentId = getCommonInArray(locationList);
        }
        return commonParentId;

        //返回数组中每一项的公共部分（从头开始）
        function getCommonInArray(sourceArray, testItem) {
            let _testItem = testItem ? testItem : sourceArray[0], returnId;

            //检测第一项(或传入项)是否在每一项中都存在，若存在则返回，否则调用本身
            let commonLocationId = sourceArray.every(function (item) {
                return item.indexOf(_testItem) > -1;
            });
            if (commonLocationId) {
                returnId = _testItem;
            } else {
                returnId = getCommonInArray(sourceArray, _testItem.slice(0, -2));
            }
            return returnId;
        }
    }
});