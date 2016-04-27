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
            'title' : '卡券购买'
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
        'id_Acount' : {
            'id' : 'page_id_Acount',
            'title' : null,
            'prompt' : true
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
    }
});