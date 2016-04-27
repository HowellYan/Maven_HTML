/**
 * Created by liuyun on 15/4/27.
 * Version 1.0
 * (C)Copyright www.bestpay.com.cn Corporation. 2015-20XX All rights reserved.
 */

define(['bestpay.lang'], function(Lang) {

    /**
     * @Description 获取本次服务的标识流水
     * @param tmnNum 终端号，需要分配
     * @return 20渠道号 + 四位完全的随机数 +时间（毫秒级）+ 五位完全的随机数 + keep序列号（01到99）
     */
    var getKeep = function () {//获取keep值
        var rand4 = Math.round(Math.random() * 8999 + 1000) + '';
        var rand5 = Math.round(Math.random() * 89999 + 10000);
        var rand2 = Math.round(Math.random() * 89 + 10);
        return '20' + rand4 + getOrderSeq() + '' + rand5 + '' + rand2;
    };

    var getParamsKeep =function() {
        var keep = '';
        var date = new Date();
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        m = m < 10 ? '0' + m : m;
        var d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        var h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
        var f = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
        var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
        var rand = Math.round(Math.random()*8999+1000);
        keep = y + '' + m + '' + d + '' + h + '' + f + '' + s + '' + rand;
        return keep;
    };

    var getOrderSeq = function () {
        var keep = '';
        var date = new Date();
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        m = m < 10 ? '0' + m : m;
        var d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        var h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
        var f = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
        var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
        var rand = Math.round(Math.random() * 899 + 100);
        keep = y + '' + m + '' + d + '' + h + '' + f + '' + s + '' + rand;
        return keep;
    };
    var getCurrentTime = function () {
        var keep = '';
        var date = new Date();
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        m = m < 10 ? '0' + m : m;
        var d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        var h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
        var f = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
        var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
        var rand = Math.round(Math.random() * 899 + 100);
        keep = y + '' + m + '' + d + '' + h + '' + f + '' + s ;
        return keep;
    };

    var getTmnNum = function() {
        var tmnNum = config.TMNNUM[config.ENV];
        if (typeof tmnNum !== 'string') {
            tmnNum = config.TMNNUM.DEFAULT;
        }
        return tmnNum;
    };

    var getMerId = function() {
        var merId = config.MERID[config.ENV];
        if (typeof tmnNum !== 'string') {
            merId = config.MERID.DEFAULT;
        }
        return merId;
    };

    /**
     *  获取用户手机号所在的地区
     */
     var getLocalName = function() {
        var AreaCode = Bestpay.User.getLocation();//获取用户地区码
        var ProCityName,
            localProCode = AreaCode.substring(0,2)+"0000",
            localCityCode = AreaCode.substring(0,4)+"00";
        var _provinceJson = Bestpay.DB_Data.getActionCode("getProvinceData", null);//获取全部的省份

        for(var i=0;i<_provinceJson.length;i++){
            if(_provinceJson[i].code==localProCode){
                ProCityName=_provinceJson[i].name;
            }
        }

        var param={"code":localProCode};
        var areaDate =  Bestpay.DB_Data.getActionCode("getCityData()",JSON.stringify(param));

        for(var i=0;i<areaDate.length;i++){
            if(areaDate[i].code==localCityCode){
                ProCityName+=areaDate[i].name;
            }
        }
        return ProCityName;
    };


    /**
     * 设置调用CPS服务时的公共入参并sign
     * @param params json
     */
    var setCPSCommonParams = function(params) {
        var userInfo = JSON.parse(Bestpay.User.getSuccessLoginInfo());
        params.custCode = userInfo.custCode;
        params.merId = userInfo.prtnCode;
        //params.merId = getMerId();
        params.tmnNum = getTmnNum();
        params.staffCode = userInfo.staffCode;
        params.bisChannel = config.bisChannel;
        params.keep = getKeep();
        params.channelCode = config.AppIdentity.CHANNEL_CODE;
        var deviceInfo = JSON.parse(Bestpay.App.getDeviceInfo());
        console.log(JSON.stringify(deviceInfo));
        params.clientVersion = deviceInfo.clientVersion;
        params.imei = deviceInfo.imei;
        params.imsi = deviceInfo.imsi;
        params.model = deviceInfo.model;
        params.systemType = deviceInfo.systemType;
        params.systemVersion = deviceInfo.systemVersion;
        params.vender = deviceInfo.vender;

        params.operationCode = deviceInfo.operationCode;
        params.isSucc = deviceInfo.isSucc;
        params.operCity = deviceInfo.operCity;
        params.prmotePort = deviceInfo.prmotePort;
        params.deviceName = deviceInfo.deviceName;
        params.mac = deviceInfo.mac;
        params.kernelVersion = deviceInfo.kernelVersion;
        params.aidentifier = deviceInfo.aidentifier;
        params.bestpayId = deviceInfo.bestpayId;
        params.cpuId = deviceInfo.cpuId;
        params.diskInfo = deviceInfo.diskInfo;

        params.softwareType = config.softwareType;
        params.signType = config.signType;
        params.sign = Bestpay.Security.getSign(params);

        params.signVer = config.signVer;
        return params;
    };



    /**
     * 酬金查询
     * @param busType       config.BUS_TYPE.
     * @param busiCode      config.BUS_CODE.
     * @param productCode   ''
     * @param amount
     * @param supplyCode
     * @param objCode   业务对象
     */
    var getCommission = function(busType, busiCode, productCode, amount, success ,showLoading, supplyCode, pecProductCode, objCode) {
        var self = this;
        amount = amount +'';
        // 资金池子卡不查酬金
        if (self.userInfo === config.CARD_TYPE.BANK_MODE_FUND_POOL_MEMBER_CARD) {
            return {
                'code' : config.RES.SUCCESS,
                'content' : config.RES.SUCCESS_MSG,
                'COMMISSION' : '0'
            };
        }

        var params = {};
        params.pecProductCode = pecProductCode || '';
        params.actionCode = busiCode;
        params.acctType = config.ACCOUNT_TYPE.KEY_ACCOUNT_IPOS;
        params.supplyCode = supplyCode || ''; //是否走智能路由

        params.objCode = objCode || '';


        if (busType === config.BUS_TYPE.BUS_TYPE_BESTPAY_CARD) {
            if ('10' === amount) {
                productCode = "05010100";
            } else if ('20' === amount) {
                productCode = "05010200";
            } else if ('30' === amount) {
                productCode = "05010300";
            } else if ('50' === amount) {
                productCode = "05010500";
            } else if ('100' === amount) {
                productCode = "05011100";
            } else if ('200' === amount) {
                productCode = "05011200";
            } else if ('300' === amount) {
                productCode = "05011300";
            } else if ('500' === amount) {
                productCode = "05011500";
            }
        } else if (busType === config.BUS_TYPE.BUS_TYPE_GAME_CARD) {
            if ('10' === amount) {
                productCode = "04020100";
            } else if ('30' === amount) {
                productCode = "04020300";
            } else if ('50' === amount) {
                productCode = "04020500";
            } else if ('100' === amount) {
                productCode = "04021100";
            }
        } else if (busType === config.BUS_TYPE.BUS_TYPE_TEL_CARD_TELECOM) {
            if ('30' === amount) {
                productCode = "01000300";
            } else if ('50' === amount) {
                productCode = "01020500";
            } else if ('100' === amount) {
                productCode = "01021100";
            }
        } else if (busType === config.BUS_TYPE.BUS_TYPE_TEL_CARD_UNICOM) {
            if ('30' === amount) {
                productCode = "03200300";
            } else if ('50' === amount) {
                productCode = "03200500";
            } else if ('100' === amount) {
                productCode = "03201100";
            }
        } else if (busType === config.BUS_TYPE.BUS_TYPE_QQ) {
            console.log("");
        }
        params.productCode = productCode;
        params.amount = Lang.yuan2fen(amount);
        params = setCPSCommonParams(params);
        if(showLoading == null){
            showLoading = true;
        }
        callCPSService({
            'service' : config.CPS.COMMISSION_QUERY,
            'params' : params,
            'showLoading' : showLoading,
            'success' : success
        });
    };

    /**
     *  随机数下发接口 MRdc001
     *  @param userInfo
     */
    var getRandomServices = function(success ,showLoading){
        var params = {};
        params.channelCode = config.AppIdentity.CHANNEL_CODE;
        params.keep = getKeep();
        params.tmnNum = getTmnNum();

        var deviceInfo = JSON.parse(Bestpay.App.getDeviceInfo());
        params.clientVersion = deviceInfo.clientVersion;
        params.imei = deviceInfo.imei;
        params.imsi = deviceInfo.imsi;
        params.model = deviceInfo.model;
        params.systemType = deviceInfo.systemType;
        params.systemVersion = deviceInfo.systemVersion;
        params.vender = deviceInfo.vender;
        params.softwareType = config.softwareType;
        params.bisChannel = config.bisChannel;
        callCPSService({
            'service' : config.CPS.RANDOM_GENERAT,
            'params' : params,
            'showLoading' : showLoading,
            'success' : success
        });
    };

    /**
     *  短信交易凭证接口
     *  @param transSeq : 交易流水号
     *  @param phone
     *  @param busyType
     *  @param dtd(Deferred对象)
     */
    var sendSmsCertificate = function(transSeq, phone, busyType){
        var params = {
            'transSeq' : transSeq,
            'phone' : phone,
            'busyType' : busyType,
            'signType' : config.signType
        };
        params = setCPSCommonParams(params);
        var success = function(result){
            //交易凭证已发送，请通知顾客查收短信！
            Bestpay.Toast.makeText('交易凭证已发送，请通知顾客查收短信！', Bestpay.Toast.LENGTH_SHORT);
            console.log('短信交易凭证下发成功');
        };
        callCPSService({
            'service' : config.CPS.SMS_TRADE_VERIFY,
            'params' : params,
            'showLoading' : false,
            'success' : success,
            'error' : function(result){
                console.log('error:'+JSON.stringify(result));
            }
        });
    };

    /**
     * 溢价查询接口
     * @param faceAmount 面值金额
     * @param actionCode 业务编码  03010008：全国电信直充, 05010005：全国移动直充, 04010003：全国联通直充, 09010001：电子售卡
     * @param prodCode 产品编码  1001：电信充值付费卡, 1002：联通一卡充, 2003：天下通卡, 2004：翼充卡
     */
    var getPremium = function (faceAmount, actionCode, prodCode, success, showLoading) {
        var params = {
            'actionCode' : actionCode,
            'faceAmount' : faceAmount,
            'prodCode' : prodCode
        };
        params = setCPSCommonParams(params);
        callCPSService({
            'service' : config.CPS.PREMIUM_QUERY,
            'params' : params,
            'showLoading' : showLoading,
            'success' : success
        });
    };

    /**
     * 判断账户是否开通理财
     * @param success
     * @param showLoading
     */
    var getMerchantStatus = function (success, showLoading){
        var params = {};
        params = setCPSCommonParams(params);
        callCPSService({
            'service' : config.CPS.MERCHANT_STATUS_CHECK,
            'params' : params,
            'showLoading' : showLoading,
            'success' : success
        });
    };

    /**
     * 企业理财用户理财产品列表查询
     * @param success
     * @param showLoading
     */
    var getFinancialProducts = function(success, showLoading,errorback){
        var params = {};
        params = setCPSCommonParams(params);
        callCPSService({
            'service' : config.CPS.FINANCIAL_PRODUCTS,
            'params' : params,
            'showLoading' : showLoading,
            'success' : success,
            'error' : errorback
        });
    };

    /**
     * 资金账户余额查询
     * @param success
     * @param showLoading
     */
    var getAccountBalanceInquiry = function(success, showLoading, bankMode){
        var params = {
            'bankMode' : bankMode
        };
        params = setCPSCommonParams(params);
        callCPSService({
            'service' : config.CPS.CCOUNT_BALANCE_QUERY,
            'params' : params,
            'showLoading' : showLoading,
            'success' : success
        });
    };

    /**
     * 企业理财产品信息接口
     * @param productId
     * @param success
     * @param showLoading
     */
    var getAccountInformation = function(productId, success, showLoading){
        var params = {
            'productId':productId
        };
        params = setCPSCommonParams(params);
        callCPSService({
            'service' : config.CPS.ENTERPRISE_PERSONAL_ACCOUNT_INFO,
            'params' : params,
            'showLoading' : showLoading,
            'success' : success
        });
    };


    /**
     * 调用CPS服务 Dummy模式
     * @param settings
     */
    var callCPSDummy = function (settings) {
        if (typeof settings.params === 'object') {
            settings.params = JSON.stringify(settings.params);
        }

        console.log('dummy service: ' + settings.service);
        console.log('request: ' + settings.params);
        require(['dummy/resp/' + settings.service], function(result) {
            dismissDialog();
            console.log('response: ' + JSON.stringify(result));
            settings.success(result);
        });
    };

    /*
	 * 跳到充值页面
	 */
	var getRechargeURL = function() { 
		var url;
		var origin = location.origin;
		if(config.ENV === 'PRODUCT'){ 
			//生产环境
            if(config.isOnline == false){
                origin = "http://183.63.191.7:9009";
            }
			url = origin + "/online_h5/pluginRAB";
		}else{ 
			//测试环境 
			url = origin + "/test/20160406/pluginRAB";
		} 
		return url;
	};

    /*
	 * 获取环境URL
	 */
	var getEnvironmentURL = function() { 
		var url;
		var origin = location.origin;
		if(config.ENV === 'PRODUCT'){ 
			//生产环境 
			url = origin + "/online_h5";
		}else{ 
			//测试环境 
			url = origin + "/web/20151203";
		} 
		return url;
	};

	/*
	 * 跳到超时页面
	 * @param type [resolve - 业务已受理, reject - 网络异常]
	 */
	var overTime = function(type) { 
		dismissDialog();
		var html = '';
		if(type === 'reject'){ 
		    //网络异常
		    Bestpay.App.setTitle("网络异常");

			html += '<div class="error651-box">';
			html += '<div class="error651-box-1">';
			html += '<strong style="">网络异常</strong><br>';
			html += '请稍后查看订单状态。';
			html += '</div>';
			html += '<div class="error651-box-2">';
			html += '<strong>温馨提示：</strong><br>';
			html += '商户请先确认订单状态，避免重复支付。';
			html += '</div>';
			html += '<div class="btn2-common-wrap" id="otCheckOrder">';
			html += '<button>点击查看订单状态</button>';
			html += '</div>';
			html += '</div>';
		}else if(type === 'resolve'){ 
			//业务已受理
			Bestpay.App.setTitle("业务已受理");

	        html += '<div class="error651-box">';
	        html += '<div class="error651-box-1" style="width:200px;height:50px;padding: 0;background: url(../lib/img/recharge_success.png) no-repeat;background-size: 100%;">';
	        html += '</div>';
			html += '<div class="error651-box-2">';
			html += '<strong>温馨提示：</strong><br>';
			html += '商户请先确认订单状态，避免重复支付。';
			html += '</div>';
			html += '<div class="btn2-common-wrap" id="otCheckOrder">';
			html += '<button>点击查看订单状态</button>';
			html += '</div>';
			html += '</div>';
		}

		console.log('init------------overtime');
		//创建页面
		var div_overTimePage = document.getElementById("overTimePage");
		if(!!div_overTimePage){ 
			div_overTimePage.innerHTML = html;
			div_overTimePage.style.display = 'block';
		}else{ 
			var OTNode = document.createElement('div');
			OTNode.id = 'overTimePage';
			OTNode.innerHTML = html;
			document.body.insertBefore(OTNode, document.body.childNodes[0]);
		}

		//加入网络异常页面
		window.pageStack.push("overTimePage");

		document.getElementById("otCheckOrder").onclick = function(){ 
			//删除网络异常页面
			Bestpay.Dialog.jumpToOrderQuery(config.TITLE.submited_title,config.MSG.msg_submited_content,'确定',
                config.TRADE_LIST_QUERY_TYPE,config.TRADE_LIST_QUERY_NUMBER);
			window.pageStack.pop();
			Bestpay.App.setTitle(window.pageStack[window.pageStack.length-1].title);
			document.getElementById("overTimePage").style.display = 'none';
			back();
		}
	};

    /**
     * 调用CPS服务
     * @param settings 字段：service, params, success, error, showLoading
     */
    config.isOpen = true;
    var callCPSService = function (settings) {
        if (settings.showLoading !== false) {
            showDialog(config.MSG.loading);
        }
        if (!!config.dummy) {
            callCPSDummy(settings);
            return;
        }

        if(settings.setTime == null){
            settings.setTime = 75000;
        }

        if (typeof settings.error !== 'function') {
            settings.error = function () {
                dismissDialog();
                Bestpay.Dialog.showAlertDialog('请求失败',config.MSG.networkFail2,'确定','');
                console.log("error 请求失败: " + url);
            }
        }
        var successCallBack = function(result) {
    
            if(config.isDialogBack == true){
                config.isDialogBack = false;
                return;
            }
            console.log('response: ' + JSON.stringify(result));

            if (settings.showLoading == true) {
                dismissDialog();
            }
            config.isOpen = true;

            //回签
            if(settings.service != config.noVerifySign[settings.service]){
                var resultMsg = Bestpay.Security.verifySign(result);
                console.log("resultMsg: -> " + resultMsg);
                if(resultMsg != null && resultMsg==="false") {
                    // Bestpay.Toast.makeText('验签失败',Bestpay.Toast.LENGTH_SHORT);
                        Bestpay.Dialog.showAlertTwoBtnDialog('验签失败', '您目前的网络可能存在安全隐患，请修改网络环境，如涉及交易，请联系客服查询订单状态。', '重新登录', '取消', '', function (code) {
                            Bestpay.User.login();
                        });
                    return;
                }
            }

            if(result.code == "010054"){
                if(typeof settings.isNoSuccess == 'function'){
                    settings.isNoSuccess(result);
                }
                Bestpay.Dialog.showAlertTwoBtnDialog('登录失效','请重新登录','重新登录','取消',result.code,function(code){
                    console.log(code);
                    if(code.toString() == '1'){
                        Bestpay.User.login();
                    }
                });
                return;
            }
            if(result.code == "011007"){
                if(pageStack != null && pageStack != "" && pageStack[pageStack.length - 1].goToRecords != null && pageStack[pageStack.length - 1].goToRecords == true){
                    console.log("goToRecords:"+pageStack[pageStack.length - 1].goToRecords+";"+"isOpen:"+config.isOpen);
                    console.log("TRADE_LIST_QUERY_TYPE:"+config.TRADE_LIST_QUERY_TYPE+";"+"TRADE_LIST_QUERY_NUMBER:"+config.TRADE_LIST_QUERY_NUMBER);
                    //隐藏键盘
                    PasswordKeyBoard.hideKeyboardUI3();

			        var deviceInfo = JSON.parse(Bestpay.App.getDeviceInfo());
			        var clientVersion = deviceInfo.clientVersion; //版本号
			        var systemType = deviceInfo.systemType; //系统系统类型
			        clientVersion = clientVersion.replace(/\./g,'') * 1;
			        systemType = systemType.toLowerCase();
			        if((systemType === 'android' && clientVersion >= 329) || (systemType === 'ios' && clientVersion >= 305)){ 
			        	console.log("overtime--------------------");
		        		//网络异常
		        		overTime('reject');
			        }else{ 
			        	Bestpay.Dialog.showAlertSynchroDialog(config.TITLE.submited_title,config.MSG.msg_submited_content,'确定',
                        config.TRADE_LIST_QUERY_TYPE,config.TRADE_LIST_QUERY_NUMBER);
                   	    back();
			        }

                    return;
                }
            }
            // 体验商户自动跳去认证页面
            if(result.code == "011142"){
                var deviceInfo = JSON.parse(Bestpay.App.getDeviceInfo());
                var clientVersion = deviceInfo.clientVersion; //版本号
                var systemType = deviceInfo.systemType; //系统系统类型
                clientVersion = clientVersion.replace(/\./g,'') * 1;
                systemType = systemType.toLowerCase();

                console.log("App Version = " + clientVersion + " System Type = " + systemType);

                if((systemType === 'android' && clientVersion >= 403) || (systemType === 'ios' && clientVersion >= 402)){
                    console.log("[return code = " + result.code + "] 体验商户自动跳去认证页面");
                    //隐藏键盘
                    PasswordKeyBoard.hideKeyboardUI3();
                    back();
                    Bestpay.Dialog.jumpToAuthorityDialog();
                    return;
                }else {
                    Bestpay.Dialog.showAlertDialog(config.TITLE.no_repeat,result.content,'确定',result.code,function(){
                        back();
                    });
                }
            }
            settings.success(result);
        };

        var errorCallBack = function(result){
            config.isOpen = true;
            //隐藏键盘
            PasswordKeyBoard.hideKeyboardUI3();
            console.log("----error----:"+JSON.stringify(result)+";pageStack:"+pageStack);
            dismissDialog();
            if(pageStack != null && pageStack != "" && pageStack[pageStack.length - 1].goToRecords != null && pageStack[pageStack.length - 1].goToRecords == true){
                console.log("goToRecords:"+pageStack[pageStack.length - 1].goToRecords+";"+"isOpen:"+config.isOpen);
                console.log("TRADE_LIST_QUERY_TYPE:"+config.TRADE_LIST_QUERY_TYPE+";"+"TRADE_LIST_QUERY_NUMBER:"+config.TRADE_LIST_QUERY_NUMBER);
                
            	var deviceInfo = JSON.parse(Bestpay.App.getDeviceInfo());
		        var clientVersion = deviceInfo.clientVersion; //版本号
		        var systemType = deviceInfo.systemType; //系统系统类型
		        clientVersion = clientVersion.replace(/\./g,'') * 1;
		        systemType = systemType.toLowerCase();
		        if((systemType === 'android' && clientVersion >= 329) || (systemType === 'ios' && clientVersion >= 305)){ 
		        	overTime('reject'); //网络异常
		        }else{ 
	                Bestpay.Dialog.showAlertSynchroDialog(config.TITLE.submited_title,config.MSG.msg_submited_content,'确定',
	                    config.TRADE_LIST_QUERY_TYPE,config.TRADE_LIST_QUERY_NUMBER);
	                back();
		        }
                return;
            }
            if(result.readyState == 0){
                Bestpay.Dialog.showAlertDialog(config.TITLE.no_repeat, config.MSG.networkFail1, '确定', '');
            }
            settings.error(result);
        };

        if (typeof settings.params === 'object') {
            settings.params = JSON.stringify(settings.params);
        }

        var suffix = '?ran' + Math.floor(Math.random() * 100 + 1) + '=' + Date.parse(new Date());
        var url_cps = config.NGINX_CPS[config.ENV];
        console.log('-----------ENV:'+config.ENV);
        if (typeof url_cps !== 'string') {
            url_cps = config.NGINX_CPS.PUBLIC;
        }else if(settings.isINF !== null && settings.isINF == true ){
            url_cps = config.NGINX_INF[config.ENV];
            if(typeof url_cps !== 'string'){
                url_cps = config.NGINX_INF.PUBLIC;
            }
        }
        //Offline Deployment
        if(config.isOnline == false){
            url_cps = config.URLCPS[config.ENV];
            if (typeof url_cps !== 'string') {
                url_cps = config.URLCPS.PUBLIC;
            }else if(settings.isINF !== null && settings.isINF == true ){
                url_cps = config.URLINF[config.ENV];
                if(typeof url_cps !== 'string'){
                    url_cps = config.URLINF.PUBLIC;
                }
            }
        }

        var url = url_cps + settings.service + suffix;
        if(settings.URL != null){
            url = settings.URL + settings.service + suffix;
        }
        if(settings.async == null){
            settings.async = true;
        }
        console.log('isOpen: ' + config.isOpen);
        if(config.isOpen == false){
            return;
        }else{
            config.isOpen = false;
        }
        console.log('url: ' + url);
        console.log('request: ' + settings.params);
        try {
            window.jqXHR = $.ajax({
                url: url,
                type: "POST",
                async: settings.async,
                data: settings.params,
                timeout: settings.setTime,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: successCallBack,
                error: errorCallBack
            });
        } catch (e) {
            config.isOpen = true;
            console.error(e.message);
            settings.error(result);
            if(pageStack[pageStack.length - 1].goToRecords == true){
                console.log("goToRecords:"+pageStack[pageStack.length - 1].goToRecords+";"+"isOpen:"+config.isOpen);
                console.log("TRADE_LIST_QUERY_TYPE:"+config.TRADE_LIST_QUERY_TYPE+";"+"TRADE_LIST_QUERY_NUMBER:"+config.TRADE_LIST_QUERY_NUMBER);
                dismissDialog();

            	var deviceInfo = JSON.parse(Bestpay.App.getDeviceInfo());
		        var clientVersion = deviceInfo.clientVersion; //版本号
		        var systemType = deviceInfo.systemType; //系统系统类型
		        clientVersion = clientVersion.replace(/\./g,'') * 1;
		        systemType = systemType.toLowerCase();
		        if((systemType === 'android' && clientVersion >= 329) || (systemType === 'ios' && clientVersion >= 305)){ 
		        	overTime('reject'); //网络异常
		        }else{ 
	                Bestpay.Dialog.showAlertSynchroDialog(config.TITLE.submited_title,config.MSG.msg_submited_content,'确定',
	                    config.TRADE_LIST_QUERY_TYPE,config.TRADE_LIST_QUERY_NUMBER);
	                back();
		        }
                return;
            }
            dismissDialog();
            Bestpay.Dialog.showAlertDialog('请求失败',config.MSG.networkFail1,'确定','');
        }
    };

    return {
        'getKeep' : getKeep,
        'getTmnNum' : getTmnNum,
        'getMerId' : getMerId,
        'getOrderSeq' : getOrderSeq,
        'getPremium' : getPremium,
        'getLocalName' : getLocalName,
        'getMerchantStatus' : getMerchantStatus,
        'getFinancialProducts' : getFinancialProducts,
        'getAccountBalanceInquiry' : getAccountBalanceInquiry,
        'setCPSCommonParams' : setCPSCommonParams,
        'callCPSService' : callCPSService,
        'getCommission' : getCommission,
        'getRandomServices' : getRandomServices,
        'sendSmsCertificate' : sendSmsCertificate,
        'getRechargeURL' : getRechargeURL,
        'overTime' : overTime,
        'getEnvironmentURL' : getEnvironmentURL,
        'getCurrentTime' : getCurrentTime
    };
});
