/**
 * Created by liuyun on 15/4/26.
 * Version 1.0
 * (C)Copyright www.bestpay.com.cn Corporation. 2015-20XX All rights reserved.
 */
define({
    'dummy' : false,
    'debug' : true,
    'browser' : false,

    'isOpen' : true,
    'payingBack': false,
    'isDialogBack' : false,     //showDialog 时,触发物理返回按钮
    'isBack' : function(){},    //触发物理返回按钮时，调用的事件
    'startPage' : function(pageObj,type){},
    'otherEvent' : function(){},
    'showCommonProblem' : function(){},    //触发物理返回按钮时，调用的事件

    'TRADE_LIST_QUERY_TYPE' : '', //（需要查询交易的类型）
    'TRADE_LIST_QUERY_NUMBER' : '',//（需要查询的号码）

    'AppIdentity' : {
        'CHANNEL_CODE' : '20',
        'CHANNEL_ID' : '002019',
        'CHANNEL_TYPE' : '2_4'
    },
    'softwareType' : '交费易',
    'bisChannel' : '01',    //01：Android客户端 02：iOS客户端
    'signType' : 'RSA',
    'signVer' : '2',
    /**
     * PRODUCT 		= 0;//生产环境
     * PRE_PRODUCT 	= 1;//准生产环境
     * PUBLIC 		= 2;//42，常规版环境
     * PRIVATE 		= 3;//87.4，开发环境
     * ENV44		= 4;//44环境，紧急版测试环境
     * ENV_REFINE	= 5;//重构环境
     * ENV46		= 6;//46环境，紧急版测试环境
     * ENV60        = 7;//60环境
     * ENV66
     */
    'ENV' : '${online_ENV}',   //接口请求环境变量
    'isOnline' : '${project.isOnline.version}',  //是否在线部署  false就是离线的  true就是在线的

    /** Below is CPS Service name config */
    'CPS' : {
        'ACCOUNT_BIND_CARD_STATE' : 'SBinCrd004',       // 4) 绑卡查询查询接口 SBinCrd004
        'ACCOUNT_BANK_INFO' : 'SCbk001',                // 6) 账户银行信息查询接口 SCbk001
        'ACCOUNT_BANK_UNBUND' : 'MBinCrd005',                    // 7) 银行解绑
        'SMS_SEND' : 'MSms001',                         // 9) 短信下发接口 MSms001
        'SMS_TRADE_VERIFY' : 'MSms002',                 // 10) 短信交易凭证接口 MSms002
        'ELECTRONIC_SELL_CARD' : 'TCard001',            // 13) 电子售卡接口 TCard001
        'QUICK_TRADING_QUERY' : 'SQtran003',            // 31) 该叫免密交易查询接口 SQtran003
        'RANDOM_GENERAT' : 'MRdc001',                   // 34) 随机数下发接口 MRdc001
        'ExtractsTheArea' :'STrdAcc006',                // 35) 获取区域名称
        'ExtractsClientName':"STrdAcc007",              // 40) 获取客户名称

        'RECHARE_ACCOUNT_VERIFY' : 'MTrdAcc001',        // 36) 充值账户校验接口 MTrdAcc001

        'PREMIUM_QUERY' : 'SPrm001',                    // 45) 溢价查询 SPrm001
        'SDM_PARTNER_LIST' : 'SWeg002',                 // 53) 水电煤地市(本地业务)查询 SWeg002
        'SDM_BILL_QUERY' : 'SWeg001',                   // 54) 水电煤账单查询 SWeg001
        'SDM_PAY_BILL' : 'TWeg003',                     // 55)水电煤缴费接口 TWeg003
        'FLOW_3G_CARD' : 'TTrdAcc004',                  // 56) 3G流量卡充值 TTrdAcc004
        'TBRB_CHARGE' : 'TTrdAcc002',                   // 62) 全国固话宽带充值接口 TTrdAcc002
        'COMMISSION_QUERY' : 'SRwd002',                 // 68) 酬金查询接口  SRwd002
        'COALWATERINFO_QUERY' : 'SWeg003',              // 69) 水电煤查询接口  SWeg003

        'FINANCIAL_PRODUCTS':'SEpt012',                 // 3.13企业理财用户理财产品列表查询(SEpt012)
        'TACCCHARGE':'TTrdAcc003',                      // 52) 翼支付充值 TTrdAcc003
        'CCOUNT_BALANCE_QUERY':'SAcc003',               // 42) 资金账户余额查询 SAcc003
        'ENTERPRISE_PERSONAL_ACCOUNT_INFO':'SEpt006',   // 企业理财账户信息接口(SEpt006)
        'MERCHANT_STATUS_CHECK':'MEpt009',              // 3.2企业理财商户状态校验接口（MEpt009）
        'INFORMATION_VERIFICATION':'MEpt010',           // 3.3企业理财信息校验接口(MEpt010）
        'ENTERPRISE_FINANCIAL_OPENING':'MEpt001',        // 3.1企业理财开户(MEpt001)
	'GAME_LIST':'SUntx001',                         //游戏列表查询接口
        'GAME_INFO':'SUntx002',                         //游戏详情查询接口
        'GAME_SERVER':'SUntx003',                       //游戏区服查询接口
        'GAME_RECHARGE':'TUntx004',                      //游戏充值接口
    	'STPYQUE':'STpy001',				//交通罚款违章查询
    	'STPY_ORDER':'STpy002', 			//交通罚款违章订单查询
    	'TRANSPORTATION_FINES_PAYMENT':'TTpy003',         //交通罚款缴费        							 
        'ORANGE_LOAN_PRODUCT_LIST' : 'SLoa005',             //甜橙贷产品列表接口(SLoa005)
        'SUPPLIER_ROUTING' : 'SLoa007',
        'QUERY_SUPPLIER_ROUTING' : 'SLoa008',                 //供应商路由查询功能接口
        'CITY_LISTING_INTERFACE' : 'SLoa004',                 //城市列表接口查询(SLoa004)
        'REMUNERATION_LIST_QUERY' : 'SLoa003',              //酬金列表查询接口(SLoa003)
	'ORDER_DETAILS_QUERY' : 'SLoa002',                   //订单详情查询接口(SLoa002)
        'ORDER_LIST_INTERFACE' : 'SLoa001',                 //订单列表接口(SLoa001)
        'ORDER_GENERATING_INTERFACE' : 'MLoa001',            //订单生成接口(MLoa001)
        'PRODUCT_CONFIG_OBTAIN' : 'SLoa009',            //产品配置获取接口(SLoa009)
        'NEW_SUBMIT_ORDER': 'MLoa010',            //新版本生成订单接口(MLoa010)



        "PURCHASE_AND_VERIFICATION" : "MEpt002",             //3.5企业理财申购预校验(MEpt002)
        "FINANCIAL_PURCHASE" : "TEpt004",                  //3.6企业理财申购 (TEpt004)  立即支付后调的接口
        "REDEMPTION_OF_PRE_CHECK" : "MEpt003",               //3.5企业理财赎回预校验(MEpt003)   验证文本的金额
        "FINANCIAL_REDEMPTION" : "TEpt005",                  //3.7企业理财赎回(TEpt005) 立即支付后调的接口
        "FINANCIAL_INCOME_QUERY" : "SEpt007",                 //3.11企业理财收益查询接口(SEpt007)
        "FINANCIAL_REVENUE_AND_EXPENDITURE_QUERY" : "SEpt008", //3.12企业理财收支查询接口(SEpt008)
        "MILLION_COPIES_OF_REVENUE" : "SEpt014",                //3.15企业理财万份收益和七日年转化率(SEpt014)
        "PHONE_AREA":"SPhn004",
        "TTQQ003":"TTqq003",
	"PHONE_CHARGE":"TPhn001",						//千行手机充值接口 TPhn001

        'FINANCIAL_PROBLEM_QUERY':'SEpt015',                   //理财问题查询接口（SEpt015）
        'MESSAGE_ANNOUNCEMENT':'SEpt016',                       //消息公告接口(SEpt016)
        'SDISCQUERY':'SDiscQuery001',	 				//折价查询接口
        'REWARDMONEY': 'SRwd003',                        //奖励金查询
        'AUTOCHECKACCOUNT' : 'SArc003',   //1.3自动转入添益宝-查询配置(SArc003)
        'AUTOREMINDSETTING' : 'MArc002',   //1.2自动转入添益宝-修改配置(MArc002)
        'AUTOTYBNEW' : 'MArc001',          //1.1自动转入添益宝-新增配置(MArc001)
        'AUTOCLOSESETTING' : 'MArc004',          //1.4自动转入添益宝-关闭配置(MArc004)
        'FLOW_RECHARGE' : 'TTrdAcc008'                  // 流量包充值(TTrdAcc008)
        },

    /**
     *
     */
        'noVerifySign' : {
            'MRdc001' : 'MRdc001'
        },
        'URLCPS' : {
            'PRODUCT' : 'https://enterprise.bestpay.com.cn:4443/',
            'PRE_PRODUCT' : '',
            'PUBLIC' : '',
            'PRIVATE' : '',
            'ENV44' : '',
            'ENV_REFINE' : '',
            'ENV46' : '',
            'ENV60' : '',
            'ENV66' : ''  

        },
    'URLINF' : {
        'PRODUCT' : 'https://enterprise.bestpay.com.cn/',
        'PRE_PRODUCT' : '',
        'PUBLIC' : '',
        'PRIVATE' : '',
        'ENV44' : '',
        'ENV_REFINE' : '',
        'ENV60' : '',
        'ENV46' : ''
    },

        'TMNNUM' : {
            'PRODUCT' : '440106014022',
            'PRE_PRODUCT' : '440106014022',
            'PUBLIC' : '440106003094',
            'ENV44' : '440106003094',
            'ENV46' : '440106003094',
            'DEFAULT' : '440106014021'
        },
        'MERID' : {
            'PRODUCT' : '8613052900079605',
            'PRE_PRODUCT' : '8604400000143100',
            'PUBLIC' : '8613052900079605',
            'ENV44' : '8613052900079605',
            'ENV46' : '8613051700001006',
            'DEFAULT' : '8613052900079605'
        },
        'NGINX_CPS' : {
            'PUBLIC' : '/cps/',
            'ENV44' : '/NewCps44/',// /NewCps44/ -> http://172.26.13.104:8383/
            //Old : /cps44/
            'ENV46' : '/NewCps46/', //NewCps46 , cps46
            'PRODUCT' : '/cps_product/',
            'ENV66' : '/cps66/',
            'ENV60' : '/NewCps60/'
        },
        'NGINX_INF' : {
            'PUBLIC' : '/zijcps/',
            'ENV44' : '/zijcps44/',
            'ENV46' : '/zijcps46/',
            'ENV60' : '/zijcps60/',
            'PRODUCT' : '/zijcps_product/'
        },
        'MSG': {
            'loading': '处理中...',
            'networkFail': '⊙_⊙网络不给力哦，请检查后再试哈',
            'networkFail1':'网络连接失败（091106）',
            'networkFail2':'系统处理失败，请稍后再试',
            'msg_submited_content' : '请点击“确认”键核实订单状态，若订单已生成且状态不为“失败”，即可收取顾客款项。充值一般10分钟内到账，最晚24小时。如有延误敬请耐心等待，或通过“在线客服”和4008011888客服热线查询。'

        },
        'TITLE': {
            'no_repeat': '交易提示',
            'submited_title': '交易已受理',
            'dialog_title' : '处理失败'
            },
        'RES': {
            'SUCCESS': '000000',
            'SUCCESS_MSG': '操作成功',

            'UNKNOWN_ERROR': '091102',
            'UNKNOWN_ERROR_MSG': '未知错误',

            'MONEY_NOT_ENOUGH': '006016',
            'MONEY_NOT_ENOUGH_MSG': '余额不足',

            'TOKEN_DISABLE' : '010054',
            'TOKEN_DISABLE_MSG' : '请重新登录',

            'CARD_NOT_ENOUGH' : '006914',
            'CARD_NOT_ENOUGH_MSG' : '卡库存不足',

            'PASSWORD_ERROR_LOCKED_002136' : '002136',  //输入密码错误次数超过三次，账户被锁定
            'PASSWORD_ERROR_LOCKED_002136_MSG' : '支付密码错误3次，账号已被锁定3小时后自动解锁，如需帮助请拨打客服4008011888',  //输入密码错误次数超过三次，账户被锁定

            'PASSWORD_ERROR_LOCKED_020004' : '020004'  //输入密码被锁定

        },
        'CARD_TYPE' : {
            'BANK_MODE_COMMON_CARD': 'BT1001',                      // 普通卡
            'BANK_MODE_FUND_POOL_MASTER_CARD': 'BT1013',            // 资金池母卡
            'BANK_MODE_FUND_POOL_MEMBER_CARD' : 'BT1014',           // 资金池子卡
            'BANK_MODE_FUND_POOL_MEMBER_MASTER_CARD' : 'BT1002'     // 资金池子母卡
        },
        'BUS_CODE' : {
            'QQ_GL' : '01010130',       // 广璐QQ
            'QQ_TEN' : '07010002',      // 腾讯直连QQ（现在已经不用）
            'QQ' : this.QQ_GL + "_" + this.QQ_TEN,// QQ业务综合
            'TEL_MOBILE_QX' : '04010011',   // 手机充值移动 千行
            'TEL_UNICOM_QX' : '04010010',   // 手机充值联通 千行
            'TEL_TELECOM' : '03010008',     // 手机充值电信
            'TEL_MOBILE_XS' : '05010005',   // 手机充值移动 向上（现在已经不用）
            'TEL_UNICOM_XS' : '04010003',   // 手机充值联通向上（现在已经不用）
            // 手机充值业务综合
            'TEL' : this.TEL_MOBILE_QX + "_" + this.TEL_UNICOM_QX + "_" + this.TEL_TELECOM + "_" + this.TEL_MOBILE_XS + "_" + this.TEL_UNICOM_XS,
            'ELE_CARD' : '09010001',    // 电子售卡 包括话费充值卡，游戏点卡，翼支付卡
            'GAME_DIRECT' : '16010002', // 游戏直充
            'THREE_G' : '03010020',     // 3G流量卡
            'PERSON_ACCOUNT' : '03010010',  // 翼支付充值
            'SDM' : '11010001',         // 水电煤
            'FIXEDPHONE' : '03010100',  // 固话
            'BROADBAND' : '03010200',   // 宽带
            'TRAFFIC_FINES' : '08010002',   // 交通罚款
            'BESTPAY_TOUCH' : '01010131',   // 天翼碰碰
            // 收支查询消费综合业务
            'IPOS_CONSUME' : this.QQ + "_" + this.TEL + "_" + this.ELE_CARD + "_" + this.GAME_DIRECT + "_" + this.THREE_G + "_" +
                this.PERSON_ACCOUNT + "_" + this.FIXEDPHONE + "_" + this.BROADBAND + "_" + this.TRAFFIC_FINES + "_" + this.SDM + "_" + this.BESTPAY_TOUCH,
            'FUND_DEPOSIT' : '01020003',        // 资金账户提现
            'TRANSFER' : '01030001',            // 普通转账
            'IPOS_AGENT_WITHDRAWAL' : '11900001',   // 交费易账户IPOS代理商提现
            'POUNDAGE' : '01050001',        // 手续费
            'BESTCARDRECHAR' : '18010209',  // 翼支付卡充值交费易
            'BANKRECHAR' : '01010001'       // 授权银行卡充值
        },
        'PRODUCT_CODE':{ 
        	'BESTPAY_CARD':'00000029',
        	'TIANXIATONG_CARD':'00000030',
        	'TELECOM_CARD':'00000032'
        },
        'BUS_TYPE' : {
            'BUS_TYPE_TEL' : '手机充值',
            'BUS_TYPE_QQ' : 'QQ充值',
            'BUS_TYPE_TEL_CARD' : '话费充值卡',
            'BUS_TYPE_TEL_CARD_TELECOM' : '1001',   //电信
            'BUS_TYPE_TEL_CARD_UNICOM' : '1002',    // 联通
            'BUS_TYPE_GAME_DIRECT' : '游戏直充',
            'BUS_TYPE_GAME_CARD' : '游戏点卡',
            'BUS_TYPE_SDM' : '水电煤',
            'BUS_TYPE_3G' : '3G流量卡',
            'BUS_TYPE_PERSON_ACCOUNT' : '翼支付充值',
            'BUS_TYPE_FIXEDPHONEBROADBAND' : "固话宽带充值",
            'BUS_TYPE_BESTPAY_CARD' : '翼支付卡',
            'BUS_TYPE_TRAFFIC_FINES' : '交通罚款',
            'BUS_TYPE_BESTPAY_TOUCH' : '天翼碰碰',
            'BUS_TYPE_COMMON' : '订单详情公共信息',
            'BUS_TYPE_TIANYIBAO' : '添益宝'
        },
        'ACCOUNT_TYPE' : {
            'KEY_ACCOUNT_FUND' : '0001',            // 资金账户
            'KEY_ACCOUNT_CLEAR' : '0300',           // [BestPay20140415001] 添加“待结算账户”	 0300
            'KEY_ACCOUNT_IPOS' : '0007',            // 交费易账户
            'KEY_ACCOUNT_REWARD' : '0110'          // 酬金账户
        }
});