/**
 * Created by liuyun on 15/4/26.
 * Version 1.0
 * (C)Copyright www.bestpay.com.cn Corporation. 2015-20XX All rights reserved.
 */

//模块级别的文件
define({
    'dummy' : false,//接口真实数据false       true是本地自已写的模似数据
    'debug' : true, //控制日志的开e关log的开关    false是关掉日志 ，true是开启日志
    'browser' : false, //是不是在浏览器里面，只要在浏览器里，都是true，  true是自已写的模拟数据    false是直接调接口的数据

    'page' : {   //整个应用里面的所有页面  class 是page  id是 page_  开头
        'application':{
          'id':'page_application',  //没开户的首页
          'title':'添益宝'
//          'isGoToMain':true
        },
        'customer_info':{
            'id':'page_customer_info',  //没开户的信息校验
            'title':'添益宝'
        },
        'record_father':{             //协议
            'id':'page_record_father',
            'title':'协议'
        },
        'record':{             //协议1
            'id':'page_record',
            'title':'添益宝业务（企业版）服务声明'
        },
        'know':{             //协议2
            'id':'page_know',
            'title':'基金直销电子交易服务协议'
        },
        'fuwu':{             //协议3
            'id':'page_fuwu',
            'title':'证券投资基金投资人权益须知'
        },
        'open_success':{             //开户成功
            'id':'page_open_success',
            'title':'开通成功',
            'togo': true
        },
        'main_first':{
            'id':'page_main_first',   //开户后的首页
            'title':'首页'
//            'isGoToMain':true
        },
        'changeover_Pay_easy':{             //转入页面  银行卡与交费易转入切换页面
            'id':'page_changeover_Pay_easy',
            'title':'转入'
            //'togo' : true
        },
        'change_can_pay':{               //转入页面  支付密码页面
            'id':'page_change_can_pay',
            'title':'支付密码',
            'goToRecords' : true
        },
        'zhuangrusuccess':{             //转入页面    成功后的页面
            'id':'page_zhuangrusuccess',
            'title':'转入成功',
            'togo': true
        },
        'roll_out_Pay_easy':{               //转出页面  银行卡与交费易转出切换页面
            'id':'page_roll_out_Pay_easy',
            'title':'转出'
        },
        'roll_out_info':{                 //转出页面  支付密码页面
            'id':'page_roll_out_info',
            'title':'支付密码',
            'goToRecords' : true
        },
        'roll_out_success':{             //转出页面  成功后的页面
            'id':'page_roll_out_success',
            'title':'转出成功',
            'togo': true
        },
        'income_in':{             //7.0添益宝收支查询 转入 四排
            'id':'page_income_in',
            'title':'收支'
        },
        'accumulated_in':{             //7.2添益宝收益查询（累计收益 双排）
            'id':'page_accumulated_in',
            'title':'收益'
        },
        'service_center':{             //服务中心  公告消息 常见问题
            'id':'page_service_center',
            'title':'服务中心',
            'togo' : true
        },
        'kaotongfloat' : {             //是否认证
            'id' : 'page_kaotongfloat',
            'title' : '认证',
            'prompt' : true,
            'isGoToMain' : true
        },
        'kaotongfloat_unbind' : {             //是否解绑
            'id' : 'page_kaotongfloat_unbind',
            'title' : '解绑',
            'prompt' : true
        },
        'token_value' : {             //是否token失效
            'id' : 'page_token_value',
            'title' : 'token失效',
            'prompt' : true
        },
        'id_shouzhifour_show':{  //收支查询
            'id':'page_id_shouzhifour_show',
            'title':null,
            'prompt' : true,
            'prompt_show_back' : true
        },
        'id_shouyitwo_show':{  //收支查询
            'id':'page_id_shouyitwo_show',
            'title':null,
            'prompt' : true,
            'prompt_show_back' : true
        },
        'AutomaticNew' : {
            'id':'page_AutomaticNew',
            'title':'余额自动转入'
        }
    },
    'CARDTYPECODE' : '2004',  //请求接口的常量
    'CODE' : {    //接口的返回码
        'COMMOSSION_ERROR' : '004010'
    },
    'man':{
        'manageM' : null,
        'manageMOpenAnAccount' : null,
        'otherInterfaces' : null

    },
    'logoList' : {                            //银行卡的logo图片
        "866000" : "images/bank/yzyh.png",//中国邮政储蓄银行
        "866100" : "images/bank/zgyh.png",//中国银行
        "866200" : "images/bank/gsyh.png",//中国工商银行
        "866300" : "images/bank/nyyh.png",//中国农业银行
        "866400" : "images/bank/jtyh.png",//交通银行
        "866500" : "images/bank/jsyh.png",//中国建设银行
        "866600" : "images/bank/msyh.png",//中国民生银行
        "866700" : "images/bank/hxyh.png",//华夏银行
        "866800" : "images/bank/gfyh.png",//广发银行
        "866900" : "images/bank/zsyh.png",//招商银行
        "867000" : "images/bank/gzyh.png",//广州银行
        "867200" : "images/bank/gdyh.png",//光大银行
        "867400" : "images/bank/zxyh.png",//中信银行
        "867600" : "images/bank/xyyh.png",//兴业银行
        "865700" : "images/bank/payh.png",//平安银行
        "865500" : "images/bank/shyh.png"//上海银行
    }

});