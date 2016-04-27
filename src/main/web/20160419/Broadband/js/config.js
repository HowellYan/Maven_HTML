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
            'title' : '固话宽带'
        },
        'comfirm' : {
            'id' : 'order_comfirm',
            'title' : '付款详情',
            'goToRecords' : true
        },
        'pay' : {
            'id' : 'page_select_pay',
            'title' : '选择付款方式'
        },
        'float_dia' : {
            'id' : 'page_float_dia',
            'title' : '付款详情',
            'togo' : true
//            'prompt' : true,
//            'isDisable':true
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
        '006781' : '查询不到该号码的状态，请确认号码无误或稍后再试'
    }
});