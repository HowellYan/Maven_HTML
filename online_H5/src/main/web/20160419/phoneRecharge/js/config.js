/**
 * Created by liuyun on 15/4/26.
 * Version 1.0
 * (C)Copyright www.bestpay.com.cn Corporation. 2015-20XX All rights reserved.
 */
define({
    'dummy' : false,
    'debug' : true,
    'browser' : false,

    'page' : {
        'main' : {
            'id' : 'page_main',
            'title' : '手机充值'
        },
        'pay' : {
            'id' : 'page_select_pay',
            'title' : '付款详情'
        },
        'comfirm' : {
            'id' : 'order_comfirm',
            'title' : '付款详情',
            'goToRecords' : true
        },
        'float_dia' : {
            'id' : 'page_float_dia',
            'title' : '付款详情',
            'togo' : true
//            'prompt' : true,
//            'isDisable':true
        },

        'kaotongfloat' : {             //是否认证
            'id' : 'page_kaotongfloat',
            'title' : '认证',
            'prompt' : true
        },
        'select_money' : {             //是否认证
            'id' : 'page_select_money',
            'title' : '选择金额',
            'prompt' : true
        },
        'select_type': {             //是否认证
            'id': 'page_select_type',
            'title': '选择流量卡',
            'prompt': true
        },
        'LocalHost' : {
            'id' : 'page_LocalHost',
            'title' : null,
            'prompt' : true,
            'isDisable':true
        }
    },

    'CARDTYPECODE' : '2004',

    'CODE' : {
        'COMMOSSION_ERROR' : '004010'
    },
    'ResultMSG' : {
        '006791' : '系统处理失败，请稍后再试'
    }
});