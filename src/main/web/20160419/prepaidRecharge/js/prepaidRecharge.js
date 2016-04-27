/**
 * Created by Administrator on 2015/5/26.
 */
define(['jquery','bestpay.ui','bestpay.lang','bestpay.http'],function($,UI, Lang, HTTP) {

    var prepaidRechargeSelf = null;

    function prepaidRecharge() {
        prepaidRechargeSelf = this;
        this.userInfo = JSON.parse(Bestpay.User.getSuccessLoginInfo());
        this.selectType = null;
        this.selectAmount = null;
        this.trafficType = '电信话费充值卡';
        this.mTxnAmount = '5000';
        this.orderPageJson = {};          //订单页面的json
        this.successJson = {};            //订单充值成功的json
        this.infProdCode = '1001';        //产品编码
        this.infActionCode = config.BUS_CODE.ELE_CARD;            //业务编码
        this.payType ='0';				 //选择支付方式  0是交费易   1是添益宝
        this.checkBillCheck = false;     //检查订单
   		this.prepaidRechargeData = {};         //交费易添益宝充值数据
   		this.productId = '0030001';     //添益宝productId
        this.defferred = null;
        this.selectValue = '1'; //self.selectValue == '1为翼支付卡  2为话费卡
        this.idAcountItem = '50';
        this.businessName = '翼支付卡';
    }

    prepaidRecharge.prototype.initApp = function(){
        config.TRADE_LIST_QUERY_TYPE = config.BUS_TYPE.BUS_TYPE_BESTPAY_CARD;
        var self = this;

        var selectCallBack = function(args) {
            console.log(args);
            console.log(JSON.stringify(args));
            self.selectValue = args;
            if(self.selectValue == '1'){  //self.selectValue == '1为翼支付卡  2为话费卡
                $('#textTitleLeft').text('翼支付充值卡');
                $('#yingzhifuWarm').show();
                $('#huafeiWarm').hide();
                config.TRADE_LIST_QUERY_TYPE = config.BUS_TYPE.BUS_TYPE_BESTPAY_CARD;
                self.businessName = '翼支付卡';
            }else{
                $('#textTitleLeft').text('电信话费充值卡') ;
                $('#yingzhifuWarm').hide();
                $('#huafeiWarm').show();
                config.TRADE_LIST_QUERY_TYPE = config.BUS_TYPE.BUS_TYPE_TEL_CARD;
                self.businessName = '话费卡';
            }
            $("#AccountSpan").html('50元');
            self.idAcountHtml = '50元';
            self.idAcountItem = '50';
            console.log('self.selectValue = ' + self.selectValue);
            console.log('textTitleLeft.text = ' + $('#textTitleLeft').text());
        };

        goTo(config.page.main, function() {
           // self.selectType = new UI.BlockRadioGroup('brg_type', 'id_telecom');
            self.selectAmount = new UI.BlockRadioGroup('brg_amount', 'item10',selectCallBack);
            self.itMobile = new UI.InputText('mobile','mobile');
            //self.ipPassword = new UI.InputText('pwd','password');

            self.btnInit();
        });
    };

    /**
     * 选择不同 tab 对应的 value
     * @param checkedId
     */
    /**
     *  按钮onclick事件初始化
     */

    prepaidRecharge.prototype.btnInit = function(){
        var self = this;
        document.getElementById('btn_next').onclick = function () {
        	self.checkBillCheck = false;
            self.validation();
        };

        document.getElementById('btn_Account_down').onclick = function(){//选择金额
            goTo(config.page.id_Acount);
            console.log("self.selectValue = " + self.selectValue);
            var dropDown_loanMoney = {};
            //self.selectValue == '1为翼支付卡  2为话费卡
            if(self.selectValue == '1'){
                dropDown_loanMoney = {
                    '10' :'10',
                    '30' : '30',
                    '50' : '50',
                    '100' : '100',
                    '300' : '300'
                };
            }else{
                dropDown_loanMoney = {
                    '30' : '30',
                    '50' : '50',
                    '100' : '100'
                };
            }
            var flatFeeBox = new UI.dropDownBox('page_id_Acount',
                this, dropDown_loanMoney,function(item, itemObj){
                    flatFeeBox.hideDropDownBox();
                    self.idAcountHtml=$(itemObj).html();
                    self.idAcountItem = item;
                    $("#AccountSpan").html(self.idAcountHtml + '元');
                    back();
                },function(){
                    flatFeeBox.hideDropDownBox();
                    back();
                });
        };

    };

    /**
     * 点击“下一步”按钮，
     */
    prepaidRecharge.prototype.validation = function(){
        var self = this;
        this.mobile_val = this.itMobile.getToEmptyValue(); //"顾客手机号码：（选填）
        if(this.mobile_val.length == ''){
            Bestpay.Toast.makeText('请输入顾客手机号码', Bestpay.Toast.LENGTH_SHORT);
            return;
        }
        else if(this.mobile_val.length >= 1 && this.mobile_val.length < 11){
            Bestpay.Toast.makeText('请输入11位的顾客手机号码', Bestpay.Toast.LENGTH_SHORT);
            return;
        }else if(this.mobile_val.length == 11 && !this.itMobile.getInputCheck()){
            Bestpay.Toast.makeText('您输入的手机号号码段不正确', Bestpay.Toast.LENGTH_SHORT);
            return;
        }
        self.mTxnAmount = Lang.yuan2fen(self.idAcountItem);
        console.log('this.mobile_val = ' + this.mobile_val);
        console.log("self.mTxnAmount = " + self.mTxnAmount);

        self.itJudgeLocalStorage = new UI.JudgeLocalStorage();
        self.itJudgeLocalStorage.checkOrder( self.mobile_val, self.idAcountItem*1,HTTP.getCurrentTime(),function(){
            self.queryStart(); //查询开始
            self.callQuickTradingQuery(); //免密交易查询接口
            //成功的时候载入动画
            self.defferred.done(self.goPayAnimation);
        },self.businessName);
    };
    /*
     * 查询开始
     */
    prepaidRecharge.prototype.queryStart = function(){
        var self = this;

        //新建一个延迟对象
        self.defferred = $.Deferred();
        showDialog();
    };
    prepaidRecharge.prototype.queryEnd = function(){
        var self = this;
        self.textTitleLeft = $('#textTitleLeft').text();
        var pluginParam = {
            businessName:self.businessName,
            accountName: '卡券购买', //[string] 充值账号名称
            accouontValue: self.mobile_val, //[string] 充值账号值
            rechargeMoney: Lang.fen2yuan(self.mTxnAmount), //[string] 充值金额(元)
//            rewardType: self.orderPageJson['rewardType'], //[string] @param value[reward/zhejia] 酬金查询/折价查询的类型（默认酬金查询）
            rewardMoney: self.orderPageJson['reward'], //[string] 酬金查询/折价查询 的金额
            jfyBalance: self.orderPageJson['jfy_amount'], //[string] 交费易余额
            tybBalance: self.orderPageJson['tyb_amount'], //[string] 添益宝余额
            enablePassword: self.noPwd, //[boolean] @param value[true/false] 是否免密
            userInfo: self.userInfo, //登录信息
            callback: self.gotoOrder //按确定后调用的方法
        };
        console.log("pluginParam = " + JSON.stringify(pluginParam));
        self.paymentPlugin = new UI.paymentPlugin(pluginParam);
        //成功
        dismissDialog();
        goTo(config.page.comfirm,function(){});
        self.defferred.resolve();
    };
    /*
     * 显示订单页面动画
     */
    prepaidRecharge.prototype.goPayAnimation = function() {
        console.log("done=========================")
        $("#order_comfirm").removeClass("backPayAnimation").addClass('goPayAnimation');
    };

    prepaidRecharge.prototype.gotoOrder = function(val) {
        HTTP.getRandomServices(function(result){
            var retJson = result;
            //未找到酬金结算方式，不进行酬金计算, 也当做成功了，酬金为零
            if (result.code === config.RES.SUCCESS) {
                prepaidRechargeSelf.random = result.randNum;
            }
           //self.selectValue == '1为翼支付卡  2为话费卡
            if(prepaidRechargeSelf.selectValue == '1'){
                prepaidRechargeSelf.rechargeResp(val);//翼支付卡充值
            }else{
                prepaidRechargeSelf.rechargeRespTCard(val); //话费卡充值
            }
        },false);
    };
    /**
     * 免密交易查询接口
     */
    prepaidRecharge.prototype.callQuickTradingQuery = function() {
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.QUICK_TRADING_QUERY,
            'params' : self.quickTradingQueryParams(),
            'showLoading' : false,
            'success' : self.quickTradingQuerySuccessCallback
        });
    };

    /**
     * 免密交易查询接口 构造请求参数
     */
    prepaidRecharge.prototype.quickTradingQueryParams = function () {
        var self = this;
        var params = {};
        params = HTTP.setCPSCommonParams(params);
        return params;
    };

    /**
     * 免密交易查询接口 成功回调函数
     */
    prepaidRecharge.prototype.quickTradingQuerySuccessCallback = function (result) {
        if (result.code !== config.RES.SUCCESS) {
            Bestpay.Dialog.showAlertDialog(config.TITLE.dialog_title, result.content, '确定', result.code);
            return;
        }
        prepaidRechargeSelf.getPremium(); //溢价查询
        prepaidRechargeSelf.quickTranInfo = {
            'perAmount' : result.perAmount,             // 单笔限额
            'allamount' : result.allamount,             // 累积限额
            'alltransaction' : result.alltransaction    // 累积消费
        };
    };

    /**
     * 溢价查询接口
     */
    prepaidRecharge.prototype.getPremium = function(){
        var self = this;
        HTTP.getPremium(self.mTxnAmount, self.infActionCode, self.infProdCode, function(result){
            if (result.code !== config.RES.SUCCESS) {
                Bestpay.Dialog.showAlertDialog(config.TITLE.dialog_title, result.content, '确定', result.code);
                return;
            }
            prepaidRechargeSelf.orderPageJson['retFaceAmount'] = result.amount;
            prepaidRechargeSelf.orderPageJson['retPremium'] = result.concession;
            prepaidRechargeSelf.orderPageJson['account_amount_val'] = Lang.fen2yuan(result.amount*1+result.concession*1);
            prepaidRechargeSelf.handleIsneedpassword(); //是否显示密码输入框
        }, false);
    };



    /**
     * 酬金查询
     */
    prepaidRecharge.prototype.getCommission = function(){
        var self = this;
        HTTP.getCommission(config.BUS_TYPE.BUS_TYPE_TEL_CARD_TELECOM, config.BUS_CODE.ELE_CARD, config.BUS_CODE.ELE_CARD, (self.mTxnAmount*1)/100, function(result) {
            var retJson = result;
            if (retJson.code !== config.RES.SUCCESS) {
                //Bestpay.Dialog.alert(retJson.content + '(' + retJson.code + ')');
                console.log(retJson.content + '(' + retJson.code + ')');
            }
            //未找到酬金结算方式，不进行酬金计算, 也当做成功了，酬金为零
            if (result.code === config.RES.SUCCESS) {
                retJson.commission = Lang.fen2yuan(result.reward);

            } else if (result.code === config.CODE.COMMOSSION_ERROR) {
                retJson.code = config.RES.SUCCESS;
                retJson.commission = '0.00';
            } else {
                retJson.code = config.RES.UNKNOWN_ERROR;
                retJson.content = config.RES.UNKNOWN_ERROR_MSG;
            }
            prepaidRechargeSelf.orderPageJson['reward'] = retJson.commission;
            //成功
            prepaidRechargeSelf.queryEnd();
            //prepaidRechargeSelf.initConfirm(); //订单页面初始化
        }, false);
    };

    /**
     *  翼支付卡充值
     */
    prepaidRecharge.prototype.rechargeResp = function(val){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.ELECTRONIC_SELL_CARD,
            'params' : self.rechargeParams(val),
            'showLoading' : true,
            'success' : self.rechargeSuccessCallback
        });
    };

    /**
     * 翼支付卡充值 构造请求参数
     */
    prepaidRecharge.prototype.rechargeParams = function (val) {
        var self = this;
        var valStr = "";
        if(val != null && val != ""){
            valStr = val;
        }
        //支付方式 0交费易 1添益宝
//        self.payType = self.paymentPlugin.getPayType();
//        console.log("支付方式==" + self.payType);
        var params = {
            'orderNo' : HTTP.getOrderSeq(),
            'cardAmount' : self.mTxnAmount,
            'cardTypeCode' :'2004',
            'payType' : '0',  //0：其它, 9：纯业务
            'payPassword' : Bestpay.Security.encryptPassword(self.userInfo.staffCode,valStr,self.random),
            'tradeTime' : Lang.getDate_YYYYMMDD() + '' + Lang.getTime_HHMMSS(),
            'phone' : self.mobile_val //客户手机号
        };
        if(self.userInfo.hadEpt.toString()== '1'){
            params.costWay = self.paymentPlugin.getPayType();
            params.productId = self.productId;
            params.userId =self.orderPageJson['userId'];
        }
        params = HTTP.setCPSCommonParams(params);
        return params;
    };

    /**
     * 翼支付卡充值 成功回调函数
     */
    prepaidRecharge.prototype.rechargeSuccessCallback = function (result) {
        dismissDialog();
       // prepaidRechargeSelf.setOrderDisplay('normal');
        //隐藏键盘
        PasswordKeyBoard.hideKeyboardUI3();

        if (result.code !== config.RES.SUCCESS) {
            if(result.code === config.RES.MONEY_NOT_ENOUGH){
                Bestpay.Dialog.showAlertDialog(config.TITLE.no_repeat,config.RES.MONEY_NOT_ENOUGH_MSG,'确定',result.code,function(){
                    prepaidRechargeSelf.itJudgeLocalStorage.putLocalValue("","","","");
                });
                return;
            }
            if(result.code == "009002" || result.code == "006751") {
				console.log("in-------------------")
				//prepaidRechargeSelf.setOrderDisplay('overtime');
                prepaidRechargeSelf.paymentPlugin.setOrderDisplay('overtime');
                goTo(config.page.float_dia);
				return;
			}
            if(result.code == config.RES.PASSWORD_ERROR_LOCKED_002136){ //输入密码错误次数超过三次，退出app
                Bestpay.Dialog.showAlertDialog(config.TITLE.no_repeat, result.content,'确定',result.code,function(code){
                    App.exitCompleteApp();
                    prepaidRechargeSelf.itJudgeLocalStorage.putLocalValue("","","","");
                });
            }
            Bestpay.Dialog.showAlertDialog(config.TITLE.dialog_title, result.content, '确定', result.code,function(){
                prepaidRechargeSelf.itJudgeLocalStorage.putLocalValue("","","","");
            });
            return;
        }
        prepaidRechargeSelf.itJudgeLocalStorage.putLocalValue("","","","");
//        prepaidRechargeSelf.successJson['transSeq'] = result.transSeq; //交易流水号
//        prepaidRechargeSelf.successJson['contact'] = prepaidRechargeSelf.trafficType; //业务类型
//        prepaidRechargeSelf.successJson['cardMount'] = Lang.fen2yuan(result.cardMount);//面    值
//        prepaidRechargeSelf.successJson['cardNo'] = result.cardNo;//序 列 号
//        prepaidRechargeSelf.successJson['cardPassword'] = result.cardPassword;//密    码
//        prepaidRechargeSelf.successJson['expDdate'] = result.expDdate;//有 效 期
//        var template = new UI.Template();
//        template.template_OneToOne("id_success_item" ,prepaidRechargeSelf.successJson);

        HTTP.sendSmsCertificate(result.transSeq, prepaidRechargeSelf.mobile_val, '');//交易凭证短信下发
//        if (prepaidRechargeSelf.mobile_val.length>0){
//            HTTP.sendSmsCertificate(result.transSeq, prepaidRechargeSelf.mobile_val, '');//交易凭证短信下发
//        }


        prepaidRechargeSelf.paymentPlugin.setOrderDisplay('success');
        goTo(config.page.float_dia);
        config.isBack = function(){
            if(window.jqXHR.readyState > 2) {   //window.jqXHR.readyState 判断请求有没有发出去
                Bestpay.App.exitApp();
            }
        };
    };

    /**
     *  话费卡充值 TCard001
     */
    prepaidRecharge.prototype.rechargeRespTCard = function(val){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.ELECTRONIC_SELL_CARD,
            'params' : self.rechargeRespTCardParams(val),
            'showLoading' : true,
            'success' : self.rechargeRespTCardSuccessCallback,
            'error' : self.rechargeRespTCardErrorCallback
        });
    };

    /**
     * 话费卡充值 TCard001 构造请求参数
     */
    prepaidRecharge.prototype.rechargeRespTCardParams = function (val) {
        var self = this;
        var valStr = "";
        if(val != null && val != ""){
            valStr = val;
        }
        //支付方式 0交费易 1添益宝
//        self.payType = self.paymentPlugin.getPayType();
//        console.log("支付方式==" + self.payType);
        var params = {
            'orderNo': HTTP.getOrderSeq(),
            'payPassword': Bestpay.Security.encryptPassword(self.userInfo.staffCode,valStr,self.random),
            'payType':'0',
            'cardAmount':self.mTxnAmount,
            'cardTypeCode':self.infProdCode,
            'tradeTime':Lang.getDate_YYYYMMDD() + '' + Lang.getTime_HHMMSS(),
            'phone' : self.mobile_val//客户手机号
        };
        if(self.userInfo.hadEpt.toString()== '1'){
            params.costWay = self.paymentPlugin.getPayType();
            params.productId = self.productId;
            params.userId =self.orderPageJson['userId'] ;
        }
        params = HTTP.setCPSCommonParams(params);
        console.log("电子售卡接口 TCard001入参======="+JSON.stringify(params));
        return params;
    };
//
//    /**
//     * 话费卡充值 TCard001 成功回调函数
//     */
    prepaidRecharge.prototype.rechargeRespTCardSuccessCallback = function (result) {
        dismissDialog();
        //prepaidRechargeSelf.setOrderDisplay('normal');
        //隐藏键盘
        PasswordKeyBoard.hideKeyboardUI3();
        if (result.code !== config.RES.SUCCESS) {
            if(result.code == config.RES.CARD_NOT_ENOUGH){ //卡库存不足
                Bestpay.Dialog.showAlertDialog('提醒', config.RES.CARD_NOT_ENOUGH_MSG ,'确定', result.code,function(){
                    prepaidRechargeSelf.itJudgeLocalStorage.putLocalValue("","","","");
                });
                return;
            }
            if(result.code == "009002" || result.code == "006751") {
                console.log("in-------------------");
                //prepaidRechargeSelf.setOrderDisplay('overtime');
                prepaidRechargeSelf.paymentPlugin.setOrderDisplay('overtime');
                goTo(config.page.float_dia);
                return;
            }
            if(result.code === config.RES.MONEY_NOT_ENOUGH){
                Bestpay.Dialog.showAlertDialog(config.TITLE.no_repeat,config.RES.MONEY_NOT_ENOUGH_MSG,'确定',result.code,function(){
                    prepaidRechargeSelf.itJudgeLocalStorage.putLocalValue("","","","");
                });
                return;
            }
            if(result.code == config.RES.PASSWORD_ERROR_LOCKED_002136){ //输入密码错误次数超过三次，退出app
                Bestpay.Dialog.showAlertDialog('提醒', result.content ,'确定', result.code, function() {
                    App.exitCompleteApp();
                    prepaidRechargeSelf.itJudgeLocalStorage.putLocalValue("","","","");
                });
            }else{
                Bestpay.Dialog.showAlertDialog('提醒', result.content ,'确定', result.code,function(){
                    prepaidRechargeSelf.itJudgeLocalStorage.putLocalValue("","","","");
                });
            }
            return;
        }

        prepaidRechargeSelf.itJudgeLocalStorage.putLocalValue("","","","");
        console.log("电子售卡接口 TCard001出参========"+JSON.stringify(result));
//        prepaidRechargeSelf.successJson['transSeq'] = result.transSeq; //交易流水号
//        prepaidRechargeSelf.successJson['cardMount'] = Lang.fen2yuan(result.cardMount); //面值
//        prepaidRechargeSelf.successJson['cardNo'] = result.cardNo; //序列号
//        prepaidRechargeSelf.successJson['cardPassword'] = result.cardPassword;//卡密码
//        prepaidRechargeSelf.successJson['expDdate'] = result.expDdate; //日期
//        var template = new UI.Template();
//        template.template_OneToOne("id_success_item" ,prepaidRechargeSelf.successJson);
        HTTP.sendSmsCertificate(result.transSeq, prepaidRechargeSelf.mobile_val, '');//交易凭证短信下发

        prepaidRechargeSelf.paymentPlugin.setOrderDisplay('success');
        goTo(config.page.float_dia);
        config.isBack = function(){
            if(window.jqXHR.readyState > 2) {   //window.jqXHR.readyState 判断请求有没有发出去
                Bestpay.App.exitApp();
            }
        };

    };
//
//    /**
//     * 电子售卡接口 TCard001 失败回调函数
//     */
    prepaidRecharge.prototype.rechargeRespTCardErrorCallback = function (result){
        if(result.code === config.RES.MONEY_NOT_ENOUGH){
            Bestpay.Dialog.showAlertDialog('提醒', '余额不足' ,'确定', config.RES.MONEY_NOT_ENOUGH, function(){
                prepaidRechargeSelf.itJudgeLocalStorage.putLocalValue("","","","");
            });
            return;
        }
    };



    /**
     * 判断要不要输入密码    要传递的信息passMap  put进一个是否需要输入密码的值
     * @param amount 要充值的金额（以元为单位）
     */
    prepaidRecharge.prototype.handleIsneedpassword = function(){
    	var self = this;
        var quickTranInfo = this.quickTranInfo;
        var amount = this.orderPageJson.retFaceAmount*1 + this.orderPageJson.retPremium*1; //应收金额
        var mTxnAmount = this.mTxnAmount;    //充值金额
        //是否显示溢价提示语
        if(mTxnAmount*1 == amount*1) {
            $("#id_premium_item").hide();
        } else {
            $("#id_premium_item").show();
        }

        console.log("amount : "+amount);
        console.log("quickTranInfo : "+JSON.stringify(quickTranInfo));
        //是否显示密码框
        if(amount*1 <= 1*quickTranInfo.perAmount && (amount*1 + 1*quickTranInfo.alltransaction) <= 1*quickTranInfo.allamount){
            //	免密
            prepaidRechargeSelf.noPwd = false;
        }else{
            //	加密
            prepaidRechargeSelf.noPwd = true ;
        }
        console.log('self.userInfo.authenStatus==' + self.userInfo.authenStatus);
        if(self.userInfo.authenStatus == 'A02'){
            showDialog(config.MSG.loading);
            console.log('self.userInfo.hadEpt  '+self.userInfo.hadEpt);
            if (self.userInfo.hadEpt == 1) {
                self.getFinancialProducts();   //企业理财用户理财产品列表接口(SEpt012)
            } else {
                self.fundAccountBalanceInquiry();     //资金账户余额查询 SAcc003
            }
        }else{
            self.fundAccountBalanceInquiry();     //资金账户余额查询 SAcc003
        }
    };

    /**
     * 3.13企业理财用户理财产品列表查询(SEpt012)
     */
    prepaidRecharge.prototype.getFinancialProducts = function(){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.FINANCIAL_PRODUCTS,
            'params' : self.getFinancialProductsParams(),
            'showLoading' : false,
            'success' : self.getFinancialProductsSuccessCallback
        });
    };

    /*企业理财用户理财产品列表查询 请求参数*/
    prepaidRecharge.prototype.getFinancialProductsParams = function () {
        var self = this;
        var params = {};
        params = HTTP.setCPSCommonParams(params);
        return params;
    };

    /**
     * 企业理财用户理财产品列表查询 成功回调函数
     */
    prepaidRecharge.prototype.getFinancialProductsSuccessCallback = function (result) {
		if (result.code !== config.RES.SUCCESS) {
			if(result.code === '018888'){ 
				prepaidRechargeSelf.fundAccountBalanceInquiry(); //资金账户余额查询 SAcc003
				return;
			}else{ 
				Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
				return;
			}
		}
		$('#payfortianyibao').show();
        var list = result['datas'];//用户产品列表
        for(var i=0;i<list.length;i++)
        {
            prepaidRechargeSelf.orderPageJson['productId'] =list[i]['productId']; //产品ID
            prepaidRechargeSelf.orderPageJson['userId'] =list[i]['userId']; //userId
            prepaidRechargeSelf.orderPageJson['tyb_amount'] = Lang.fen2yuan(list[i]['balance']); //添益宝余额
        }
        prepaidRechargeSelf.fundAccountBalanceInquiry();     //资金账户余额查询 SAcc003
    };
    

    /**
     * 42) 资金账户余额查询 SAcc003
     */
    prepaidRecharge.prototype.fundAccountBalanceInquiry = function(){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.CCOUNT_BALANCE_QUERY,
            'params' : self.fundAccountBalanceInquiryParams(),
            'showLoading' : false,
            'success' : self.fundAccountBalanceInquirySuccessCallback
        });
    };

    /*资金账户余额查询 请求参数*/
    prepaidRecharge.prototype.fundAccountBalanceInquiryParams = function () {
        var self = this;
        var params = {
			'bankMode': self.userInfo.bankMode
		};
        params = HTTP.setCPSCommonParams(params);
        return params;
    };

    /**
     * 资金账户余额查询 成功回调函数
     */
    prepaidRecharge.prototype.fundAccountBalanceInquirySuccessCallback = function (result) {
        if (result.code !== config.RES.SUCCESS) {
            Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
            return;
        }
        console.log("资金账户余额查询 SAcc003出参======="+JSON.stringify(result));
		var dayLimit = result['dayLimit']; //日限额
		var dayTotal = result['dayTotal']; //日总额
		var dayLimit_dayTotal = dayLimit * 1 - dayTotal * 1; //当日限额 - 当日累积
		var monthLimit = result['monthLimit']; //月限额
		var monthTotal = result['monthTotal'];
		var monthLimit_monthTotal = monthLimit * 1 - monthTotal * 1; //当月限额 - 当月累积
		var motherBoard = result['motherBoard']; //母卡余额
        var list = result['accountItems'];
        for(var i=0;i<list.length;i++){
            var acct = list[i]['acctType'];
            if(acct != null || acct != "null" || acct != "undefined" || acct !=""){
                if("0007" == acct){//0001：基本账户;0007：IPOS账户;0110：酬金账户
                    var activeBalance = list[i].activeBalance;//账户可用余额
                    prepaidRechargeSelf.orderPageJson['jfy_amount'] =  Lang.fen2yuan(activeBalance);
                    break;
                }
            }
        }
        if(config.CARD_TYPE.BANK_MODE_FUND_POOL_MEMBER_CARD === prepaidRechargeSelf.userInfo.bankMode){
        	var sub_bankMode = '';
			if(dayLimit === '0'){ 
				sub_bankMode = motherBoard;
			}else if(motherBoard > dayLimit_dayTotal){ //母卡余额 > (当日限额 - 当日累积)
				sub_bankMode = dayLimit_dayTotal;
			}else{  //母卡余额 < (当日限额 - 当日累积)
				sub_bankMode = motherBoard;
			}

			if(monthLimit === '0'){ 
				sub_bankMode = motherBoard;
			}else if(motherBoard > monthLimit_monthTotal){ //母卡余额 > (当月限额 - 当月累积)
				sub_bankMode = monthLimit_monthTotal;
			}else{ //母卡余额 < (当月限额 - 当月累积)
				sub_bankMode = motherBoard;
			}
			
            prepaidRechargeSelf.orderPageJson['jfy_amount'] = Lang.fen2yuan(sub_bankMode);
            console.log("子卡＝＝＝＝prepaidRechargeSelf.orderPageJson['jfy_amount']=="+prepaidRechargeSelf.orderPageJson['jfy_amount']);
        }
        prepaidRechargeSelf.getCommission(); //酬金查询
    };
    return prepaidRecharge;
});