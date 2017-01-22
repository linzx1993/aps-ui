/**
 * version:1.5
 * changed by xujun on 2016/6/30.
 * name:schedule_table_json
 * created by xujun on 2016/6/28.

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
    "pUnit": [
        {
            "pUnitId": 5,
            "pUnitName": "塑件线",
            "pUnitTask": {
                "2016-07-01": [
                    {
                        "doId": 11,
                        "taskNum": 1000,
                        "saleOrderCode": "14CF-JM/B42",
                        "materialName": "换挡罩",
                        "materialColor": "#FF4500",
                        "capabilityPercent": 0.4
                    },
                    {
                        "doId": 12,
                        "taskNum": 1000,
                        "saleOrderCode": "14CF-JM/B43",
                        "materialName": "后装饰条",
                        "materialColor": "#FF4500",
                        "capabilityPercent": 0.4
                    },
                    {
                        "doId": 13,
                        "taskNum": 800,
                        "saleOrderCode": "14CF-JM/B43",
                        "materialName": "货箱右侧板",
                        "materialColor": "#BCD2EE",
                        "capabilityPercent": 0.2
                    }
                ],
                "2016-07-02": [
                    {
                        "doId": 14,
                        "taskNum": 2000,
                        "saleOrderCode": "14CF-JM/B43",
                        "materialName": "货箱右侧板",
                        "materialColor": "#B3EE3A",
                        "capabilityPercent": 1
                    }
                ]
            }
        },
        {
            "pUnitId": 6,
            "pUnitName": "铝件线",
            "pUnitTask": {
                "2016-07-01": [
                    {
                        "doId": 21,
                        "taskNum": 1000,
                        "saleOrderCode": "14CF-JM/B42",
                        "materialName": "换挡罩",
                        "materialColor": "#B03060",
                        "capabilityPercent": 0.4
                    },
                    {
                        "doId": 22,
                        "taskNum": 1000,
                        "saleOrderCode": "14CF-JM/B43",
                        "materialName": "后装饰条",
                        "materialColor": "#B03060",
                        "capabilityPercent": 0.4
                    }
                ],
                "2016-07-03": [
                    {
                        "doId": 23,
                        "taskNum": 2000,
                        "saleOrderCode": "14CF-JM/B43",
                        "materialName": "货箱右侧板",
                        "materialColor": "#171717",
                        "capabilityPercent": 1
                    }
                ]
            }
        },
        {
            "pUnitId": 7,
            "pUnitName": "水转印",
            "pUnitTask": {
                "2016-07-01": [
                    {
                        "doId": 31,
                        "taskNum": 1000,
                        "saleOrderCode": "14CF-JM/B42",
                        "materialName": "换挡罩",
                        "materialColor": "#0000FF",
                        "capabilityPercent": 0.4
                    },
                    {
                        "doId": 32,
                        "taskNum": 800,
                        "saleOrderCode": "14CF-JM/B43",
                        "materialName": "货箱右侧板",
                        "materialColor": "#0000FF",
                        "capabilityPercent": 0.2
                    }
                ],
                "2016-07-04": [
                    {
                        "doId": 33,
                        "taskNum": 2000,
                        "saleOrderCode": "14CF-JM/B43",
                        "materialName": "货箱右侧板",
                        "materialColor": "#0000FF",
                        "capabilityPercent": 1
                    }
                ]
            }
        }
    ]
}