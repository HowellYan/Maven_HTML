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
            'title' : '游戏充值'
        },
        'game_pay' : {
            'id' : 'game_pay_info',
            'title' : '游戏充值'
        },
        'comfirm' : {
            'id' : 'order_comfirm',
            'title' : '付款详情',
            'goToRecords' : true
        },
        'page_float' : {
            'id' : 'page_float_dia',
            'title' : '付款详情',
            'togo' : true
//            'prompt' : true,
//            'isDisable':true
        },
        'select_bank' : { 
			'id' : 'page_select_bank',
            'title' : '游戏充值',
            'prompt' : true
        },
        'card_pay_prompt' : { 
			'id' : 'card_pay_select',
            'title' : '游戏点卡',
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