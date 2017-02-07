/**
 * version:1.0
 * changed by xujun on 2016/7/25.
 * name:schedule_table_json
 * created by xujun on 2016/7/25.
 * description: APS相关的前端数据，都统一放在这个文件夹内
 */

//排程前页面的表格数据
var test_schedule_table_preview_data = {
    "query": {
        "startTime": "2016-07-01",
        "endTime": "2016-07-07",
        "totalStartTime": "2016-06-20",
        "totalEndTime": "2016-07-20",
        "pool": [
            2,
            5,
            6
        ]
    },
    "time": [
        "2016-07-01",
        "2016-07-02",
        "2016-07-03",
        "2016-07-04",
        "2016-07-05",
        "2016-07-06",
        "2016-07-07"
    ],
    "pUnitId":[
        "5",
        "6",
        "7"

    ],
    "pUnit": {

        "5":{
            "pUnitName": "塑件线",
            "freezeDate":"2016-07-3",
            "pUnitTask": {
                "2016-07-01": [
                    {
                        "doCode":"D201607140001",
                        "taskNum": 1000,
                        "saleOrderCode": "14CF-JM/B42",
                        "materialName": "换挡罩",
                        "materialColor": "#FF4500",
                        "capabilityPercent": 0.4
                    },
                    {
                        "doCode":"D201607140002",
                        "pkId": 0,
                        "taskNum": 1000,
                        "saleOrderCode": "14CF-JM/B43",
                        "materialName": "后装饰条",
                        "materialColor": "#FF4500",
                        "capabilityPercent": 0.4
                    },
                    {
                        "pkId": 0,
                        "taskNum": 800,
                        "saleOrderCode": "14CF-JM/B43",
                        "materialName": "货箱右侧板",
                        "materialColor": "#000000",
                        "capabilityPercent": 0.2
                    }
                ],
                "2016-07-02": [
                    {
                        "pkId": 1,
                        "versionId": 1,
                        "taskNum": 2000,
                        "saleOrderCode": "14CF-JM/B43",
                        "materialName": "货箱右侧板",
                        "materialColor": "#B3EE3A",
                        "capabilityPercent": 1
                    }
                ],
                "2016-07-07": [
                    {
                        "doCode":"D201607140001",
                        "pkId": 14,
                        "taskNum": 2000,
                        "saleOrderCode": "14CF-JM/B43",
                        "materialName": "货箱右侧板",
                        "materialColor": "#B3EE3A",
                        "capabilityPercent": 1
                    }
                ]
            }
        }
        ,
        "6":{
            "pUnitName": "铝件线",
            "freezeDate":"2016-07-03",
            "pUnitTask": {
                "2016-07-01": [
                    {
                        "pkId": 21,
                        "taskNum": 1000,
                        "saleOrderCode": "14CF-JM/B42",
                        "materialName": "换挡罩",
                        "materialColor": "#B03060",
                        "capabilityPercent": 0.4
                    },
                    {
                        "pkId": 22,
                        "taskNum": 1000,
                        "saleOrderCode": "14CF-JM/B43",
                        "materialName": "后装饰条",
                        "materialColor": "#B03060",
                        "capabilityPercent": 0.4
                    }
                ],
                "2016-07-03": [
                    {
                        "doCode":"D201607140001",
                        "pkId": 23,
                        "taskNum": 2000,
                        "saleOrderCode": "14CF-JM/B43",
                        "materialName": "货箱右侧板",
                        "materialColor": "#171717",
                        "capabilityPercent": 1
                    }
                ]
            }
        },
        "7":{

            "pUnitName": "水转印",
            "freezeDate":"2016-07-03",
            "pUnitTask": {
                "2016-07-01": [
                    {
                        "pkId": 31,
                        "taskNum": 1000,
                        "saleOrderCode": "14CF-JM/B42",
                        "materialName": "换挡罩",
                        "materialColor": "#0000FF",
                        "capabilityPercent": 0.4
                    },
                    {
                        "pkId": 32,
                        "taskNum": 800,
                        "saleOrderCode": "14CF-JM/B43",
                        "materialName": "货箱右侧板",
                        "materialColor": "#0000FF",
                        "capabilityPercent": 0.2
                    }
                ],
                "2016-07-04": [
                    {
                        "pkId": 33,
                        "taskNum": 2000,
                        "saleOrderCode": "14CF-JM/B43",
                        "materialName": "货箱右侧板",
                        "materialColor": "#0000FF",
                        "capabilityPercent": 1
                    }
                ]
            }
        }
    }
}

//排程后页面的表格数据
var test_schedule_table_result_data = {
    "query": {
        "startTime": "2016-07-01",
        "endTime": "2016-07-07",
        "totalStartTime": "2016-06-20",
        "totalEndTime": "2016-07-20",
        "pool": [
            2,
            5,
            6
        ]
    },
    "time": [
        "2016-07-01",
        "2016-07-02",
        "2016-07-03",
        "2016-07-04",
        "2016-07-05",
        "2016-07-06",
        "2016-07-07"
    ],
    "pUnitId":[
        "5",
        "6",
        "7"

    ],
    "pUnit": {

        "5":{
            "pUnitName": "塑件线",
            "freezeDate":"2016-07-3",
            "pUnitTask": {
                "2016-07-01": [
                    {
                        "doCode":"D201607140001",
                        "taskNum": 1000,
                        "saleOrderCode": "14CF-JM/B42",
                        "materialName": "换挡罩",
                        "materialColor": "#FF4500",
                        "capabilityPercent": 0.4
                    },
                    {
                        "doCode":"D201607140002",
                        "pkId": 0,
                        "taskNum": 1000,
                        "saleOrderCode": "14CF-JM/B43",
                        "materialName": "后装饰条",
                        "materialColor": "#FF4500",
                        "capabilityPercent": 0.4
                    },
                    {
                        "pkId": 0,
                        "taskNum": 800,
                        "saleOrderCode": "14CF-JM/B43",
                        "materialName": "货箱右侧板",
                        "materialColor": "#000000",
                        "capabilityPercent": 0.2
                    }
                ],
                "2016-07-02": [
                    {
                        "pkId": 1,
                        "versionId": 1,
                        "taskNum": 2000,
                        "saleOrderCode": "14CF-JM/B43",
                        "materialName": "货箱右侧板",
                        "materialColor": "#B3EE3A",
                        "capabilityPercent": 1
                    }
                ],
                "2016-07-07": [
                    {
                        "doCode":"D201607140001",
                        "pkId": 14,
                        "taskNum": 2000,
                        "saleOrderCode": "14CF-JM/B43",
                        "materialName": "货箱右侧板",
                        "materialColor": "#B3EE3A",
                        "capabilityPercent": 1
                    }
                ]
            }
        }
        ,
        "6":{
            "pUnitName": "铝件线",
            "freezeDate":"2016-07-03",
            "pUnitTask": {
                "2016-07-01": [
                    {
                        "pkId": 21,
                        "taskNum": 1000,
                        "saleOrderCode": "14CF-JM/B42",
                        "materialName": "换挡罩",
                        "materialColor": "#B03060",
                        "capabilityPercent": 0.4
                    },
                    {
                        "pkId": 22,
                        "taskNum": 1000,
                        "saleOrderCode": "14CF-JM/B43",
                        "materialName": "后装饰条",
                        "materialColor": "#B03060",
                        "capabilityPercent": 0.4
                    }
                ],
                "2016-07-03": [
                    {
                        "doCode":"D201607140001",
                        "pkId": 23,
                        "taskNum": 2000,
                        "saleOrderCode": "14CF-JM/B43",
                        "materialName": "货箱右侧板",
                        "materialColor": "#171717",
                        "capabilityPercent": 1
                    }
                ]
            }
        },
        "7":{

            "pUnitName": "水转印",
            "freezeDate":"2016-07-03",
            "pUnitTask": {
                "2016-07-01": [
                    {
                        "pkId": 31,
                        "taskNum": 1000,
                        "saleOrderCode": "14CF-JM/B42",
                        "materialName": "换挡罩",
                        "materialColor": "#0000FF",
                        "capabilityPercent": 0.4
                    },
                    {
                        "pkId": 32,
                        "taskNum": 800,
                        "saleOrderCode": "14CF-JM/B43",
                        "materialName": "货箱右侧板",
                        "materialColor": "#0000FF",
                        "capabilityPercent": 0.2
                    }
                ],
                "2016-07-04": [
                    {
                        "pkId": 33,
                        "taskNum": 2000,
                        "saleOrderCode": "14CF-JM/B43",
                        "materialName": "货箱右侧板",
                        "materialColor": "#0000FF",
                        "capabilityPercent": 1
                    }
                ]
            }
        }
    }
}

//派工单的详细信息（实际工单）
var test_schedule_table_preview_detail_data = {"saleOrderCode":"TEST8002","moCode":"M20150809019642","doCode":"D201607140001","materialCode":"1.01.31.5280.5280-040101-0B30","materialName":"前挡泥板","materialSpec":"珍珠黑","materialUnit":"件","materialMnem":"5280-040101-0B30","processCode":"TZSJ","processName":"涂装塑件","startTime":"2016-07-14 00:00:00","endTime":"2016-07-14 00:20:21","taskNum":70.0}

//临时派工单的详细信息（临时工单）
var test_schedule_table_temp_detail_data = {"saleOrderCode":"TEST_temp8002","moCode":"M20150809019642","doCode":"D201607140001","materialCode":"1.01.31.5280.5280-040101-0B30","materialName":"前挡泥板","materialSpec":"珍珠黑","materialUnit":"件","materialMnem":"5280-040101-0B30","processCode":"TZSJ","processName":"涂装塑件","startTime":"2016-07-14 00:00:00","endTime":"2016-07-14 00:20:21","taskNum":70.0}