/**
 * version:1.8
 * changed by xujun on 2016/7/7.
 * name:schedule_table_json
 * created by xujun on 2016/7/7.
 * description: v1.8去除了isFreeze和doId字段，增加pkId
 */
var test_data = {
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
                        "pkId": 0,
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
                        "doCode":"D201607140001",
                        "pkId": 14,
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