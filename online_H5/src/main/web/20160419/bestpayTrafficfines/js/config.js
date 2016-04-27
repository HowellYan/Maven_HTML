/**
 * Created by liuyun on 15/4/26.
 * Version 1.0
 * (C)Copyright www.bestpay.com.cn Corporation. 2015-20XX All rights reserved.
 */
define({
    'dummy' : false,//真实数据false   true是本地的模似数据
    'debug' : true, //控制日志的开关log的开关 自动打印入参
    'browser' : false, //是不是在浏览器里面，只要在浏览器里，都是true

    'page' : {
        'main' : {
            'id' : 'page_main',
            'title' : '交通罚款'
        },
        'illegal':{
             'id':'page_illegal',
             'title':'交通罚款'
        },
        'selectPage':{
             'id':'page_selectPage',
            'title':'选择车牌'
        },
        'comfirm' : {
            'id' : 'order_comfirm',
            'title' : '付款详情',
            'goToRecords' : true
        },
        'mail' : {
            'id' : 'page_mail',
            'title' : '交通罚款'
        },
        'flatFee' : {
            'id' : 'id_flatFee_show',
            'title':null,
            'prompt' : true
        },
        'page_float' : {
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
    }
});