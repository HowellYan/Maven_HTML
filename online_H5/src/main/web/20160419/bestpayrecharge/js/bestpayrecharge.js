/**
 * Created by liuyun on 15/4/26.
 * Version 1.0
 * (C)Copyright www.bestpay.com.cn Corporation. 2015-20XX All rights reserved.
 */
define(['bestpay.ui', 'bestpay.lang', 'bestpay.http'], function(UI, Lang, HTTP) {
    var BestpayCardSelf=null;
    function BestpayCard() {
        BestpayCardSelf=this;
        this.userInfo = JSON.parse(Bestpay.User.getSuccessLoginInfo());
        console.log("userInfo============="+JSON.stringify(userInfo));
        this.brgAmount = null;
        this.cardAmount = '50';              //按钮的充值金额
        this.idAcountItem ='50';
        this.quickTranInfo = {};
        this.payType="0";                    //0是交费易     1是添益宝
        this.selectType = null;
        this.random = null;                 //随机数
        this.phone_amount = null;           //充值金额 input
        this.itMobile = null;               //手机号码 input
        this.ipPassword = null;             //支付密码 input
        this.orderPageJson = {};          //订单页面的json
        this.successJson = {};            //订单充值成功的json
        this.checkPhome = false;         //校验充值账号
        this.rechargeData = {};         //交费易添益宝充值数据
        this.productId = '0030001';
        this.defferred = null;
        this.paymentPlugin = '';
        this.noPwd ='';
        this.businessName = '翼支付充值';
    }

    /**
     * 初始化应用
     */
    BestpayCard.prototype.initApp = function() {
        config.TRADE_LIST_QUERY_TYPE = config.BUS_TYPE.BUS_TYPE_PERSON_ACCOUNT;
        var self = this;
        goTo(config.page.main, function() {
            var inputing = function(str) {
                if (str.length == 11) {
                    var input = document.getElementById('Mobile');
                    var val = input.value;
                    input.focus();
                    input.value = '';
                    input.value = val;
                    BestpayCardSelf.phoneNumber = str;
                    BestpayCardSelf.phonetrueoffalse = false;

                    //户名查询
                    BestpayCardSelf.getVerifyResp(); //账号验证
                }else{
                    $('#custNameDiv').hide();
                }
            };
            var moblieClear = function() {
                self.brgAmount.setDisabled(false);
                self.phoneNumber = null;
                self.other_money = null;
            };
             self.itMobile = new UI.InputText('Mobile', 'phone', inputing, moblieClear); //输入翼支付账户
            self.btnInit();
        });
    };

    /**
     *  按钮onclick事件初始化
     */
    BestpayCard.prototype.btnInit = function(){
        var self = this;
        document.getElementById('btn_next').onclick = function () {   //下一步
            self.getCommission(); //酬金查询接口
        };

        self.selectMoney = function(){//选择金额
            var thisObj = this;
            goTo(config.page.id_Acount);
            var dropDown_loanMoney = {
                '10' :'10',
                '30' : '30',
                '50' : '50',
                '100' : '100',
                '200' : '200',
                '其他金额':'0'
            };
            var flatFeeBox = new UI.dropDownBox('page_id_Acount',
                this, dropDown_loanMoney,function(item, itemObj){
                    self.idAcountItem = item;
                    if(item == '0'){
                        $("#select_amount_list").hide();
                        $("#phone_amount").show();
                        back();
                        thisObj.onclick=null;
                        return;
                    }
                    $("#select_amount_list").show();
                    $("#phone_amount").hide();
                    self.phone_amount.clearValue();
                    flatFeeBox.hideDropDownBox();
                    self.idAcountHtml=$(itemObj).html();

                    $("#AccountSpan").html(self.idAcountHtml + '元');
                    back();
                },function(){
                    flatFeeBox.hideDropDownBox();
                    back();
                });
        };

        self.phone_amount = new UI.InputText('phone_amount','number',function(val){
            if(val.length == 0){
                document.getElementById('btn_Account_down').onclick = self.selectMoney;
                document.getElementById('btn_Account_down').onclick();
            }
        },function(){
            document.getElementById('btn_Account_down').onclick = self.selectMoney;
        });//充值5-2000金额

        document.getElementById('btn_Account_down').onclick = self.selectMoney;

    };

    /**
     * 免密交易查询接口
     */
    BestpayCard.prototype.callQuickTradingQuery = function() {
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.QUICK_TRADING_QUERY,
            'params' : self.quickTradingQueryParams(),
            'showLoading' : false,     //原生的dialog
            'success' : self.quickTradingQuerySuccessCallback
        });
    };

    /**
     * 免密交易查询接口 构造请求参数
     */
    BestpayCard.prototype.quickTradingQueryParams = function () {
        var self = this;
        var params = {};
        params = HTTP.setCPSCommonParams(params);
        return params;
    };

    /**
     * 免密交易查询接口 成功回调函数
     */
    BestpayCard.prototype.quickTradingQuerySuccessCallback = function (result) {
        if (result.code !== config.RES.SUCCESS) {
            Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
            return;
        };        
        BestpayCardSelf.quickTranInfo = {
            'perAmount' : result.perAmount,
            'allAmount' : result.allamount,
            'allTransAction' : result.alltransaction
        };
        BestpayCardSelf.handleIsneedpassword();
    };

    /**
     * 判断要不要输入密码    要传递的信息passMap  put进一个是否需要输入密码的值
     * @param amount 要充值的金额（以元为单位）
     */
    BestpayCard.prototype.handleIsneedpassword = function(){
        var quickTranInfo = this.quickTranInfo;
        var amount = Lang.yuan2fen(this.cardAmount);
        console.log("amount : "+amount);
        console.log("quickTranInfo : "+JSON.stringify(quickTranInfo));
        if(amount*1 <= 1*quickTranInfo.perAmount && (amount*1 + 1*quickTranInfo.allTransAction) <= 1*quickTranInfo.allAmount){
            //	免密
            BestpayCardSelf.noPwd = false;
        }else{
            //	加密
            BestpayCardSelf.noPwd = true ;
        }

        console.log("BestpayCardSelf.userInfo.authenStatus=="+BestpayCardSelf.userInfo.authenStatus);
        if(BestpayCardSelf.userInfo.authenStatus == 'A02'){

            console.log('BestpayCardSelf.userInfo.hadEpt  '+BestpayCardSelf.userInfo.hadEpt);
            if (BestpayCardSelf.userInfo.hadEpt == 1) {

                BestpayCardSelf.getFinancialProducts();   //企业理财用户理财产品列表接口(SEpt012)
            } else {

                BestpayCardSelf.fundAccountBalanceInquiry();     //资金账户余额查询 SAcc003
            }
        }else{

            BestpayCardSelf.fundAccountBalanceInquiry();     //资金账户余额查询 SAcc003
        }
    };

    /**
     * 账号验证
     */
    BestpayCard.prototype.getVerifyResp = function(){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.RECHARE_ACCOUNT_VERIFY,
            'params' : self.getVerifyRespParams(),
            'showLoading' : true,
            'success': self.getVerifyRespSuccessCallback
        });
    };

    /**
     * 账号验证接口 构造请求参数
     * veriType 验证号码类型    0:个人账户 1：3G流量充值   2: 全国电信宽带充值   3：全国电信固话充值
     * this.BROADBANDNUM    固话:03010100 宽带:03010200
     */
    BestpayCard.prototype.getVerifyRespParams = function () {
        var self = this;
        var verify=0;
        var params = {
            'verify' : verify,          //鉴权类型
            'acctCode':self.phoneNumber,//验证号码
            'isQryUserInfo':'Y',
            'reamount' : Lang.yuan2fen(this.cardAmount), //充值金额
            'acceptDate' : Lang.getDate_YYYYMMDD(), //受理日期
            'acceptTime' : Lang.getTime_HHMMSS()    //受理时间
        };
        params = HTTP.setCPSCommonParams(params);
        return params;
    };

    /**
     * 账号验证接口 成功回调函数
     */
    BestpayCard.prototype.getVerifyRespSuccessCallback = function (result) {
        if (result.code !== config.RES.SUCCESS) {
            if(result.code == '006792'){
                result.content = config.CODE.VAL0_006792;
            }
            Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
            BestpayCardSelf.checkPhome = false;
            return;
        }
        BestpayCardSelf.checkPhome = true;
        BestpayCardSelf.orderPageJson['content'] = result.content; //所在城市
        BestpayCardSelf.orderPageJson['systemNo'] = result.systemNo;
        BestpayCardSelf.orderPageJson['_tradeSeq'] = result.tradeSeq;
        BestpayCardSelf.orderPageJson['flag'] = result.flag;
        BestpayCardSelf.orderPageJson['custName'] = result.custName;
        BestpayCardSelf.orderPageJson['amount'] = result.amount;
        BestpayCardSelf.orderPageJson['queryType'] = result.queryType;
        BestpayCardSelf.orderPageJson['ifrefush'] = result.ifrefush; //判断是否显示刷新

        if(!result.custName){
            $('#custNameDiv').hide();
            $('#custNameitemGray').text('');//用户名
        }else{
            $('#custNameDiv').show();
            $('#custNameitemGray').text(result.custName);//用户名
        }
    };

    /**
     * 3.13企业理财用户理财产品列表查询(SEpt012)
     */
    BestpayCard.prototype.getFinancialProducts = function(){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.FINANCIAL_PRODUCTS,
            'params' : self.getFinancialProductsParams(),
            'showLoading' : false,
            'success' : self.getFinancialProductsSuccessCallback
        });
    };

    /*企业理财用户理财产品列表查询 请求参数*/
    BestpayCard.prototype.getFinancialProductsParams = function () {
        var self = this;
        var params = {};
        params = HTTP.setCPSCommonParams(params);
        return params;
    };

    /**
     * 企业理财用户理财产品列表查询 成功回调函数
     */
    BestpayCard.prototype.getFinancialProductsSuccessCallback = function (result) {
        if (result.code !== config.RES.SUCCESS) {
            if(result.code === '018888'){
                BestpayCardSelf.fundAccountBalanceInquiry(); //资金账户余额查询 SAcc003
                return;
            }else{
                Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
                return;
            }
        }

        var list = result['datas'];//用户产品列表
        for(var i=0;i<list.length;i++)
        {
            BestpayCardSelf.orderPageJson['productId'] =list[i]['productId']; //产品ID
            BestpayCardSelf.orderPageJson['userId'] =list[i]['userId']; //userId
            BestpayCardSelf.orderPageJson['tyb_amount'] =  Lang.fen2yuan(list[i]['balance']); //添益宝余额
        }

        BestpayCardSelf.fundAccountBalanceInquiry();     //资金账户余额查询 SAcc003
    };


    /**
     * 42) 资金账户余额查询 SAcc003
     */
    BestpayCard.prototype.fundAccountBalanceInquiry = function(){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.CCOUNT_BALANCE_QUERY,
            'params' : self.fundAccountBalanceInquiryParams(),
            'showLoading' : false,
            'success' : self.fundAccountBalanceInquirySuccessCallback
        });
    };

    /*资金账户余额查询 请求参数*/
    BestpayCard.prototype.fundAccountBalanceInquiryParams = function () {
        var self = this;
        var params = {
            'bankMode' : self.userInfo.bankMode
        };
        params = HTTP.setCPSCommonParams(params);
        console.log("资金账户余额查询 SAcc003入参======="+JSON.stringify(params));
        return params;
    };

    /**
     * 资金账户余额查询 成功回调函数
     */
    BestpayCard.prototype.fundAccountBalanceInquirySuccessCallback = function (result) {
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
                    BestpayCardSelf.orderPageJson['jfy_amount'] =  Lang.fen2yuan(activeBalance);
                    console.log("普通卡＝＝BestpayCardSelf.orderPageJson['jfy_amount']=="+BestpayCardSelf.orderPageJson['jfy_amount']);
                    break;
                }
            }
        }
        if(config.CARD_TYPE.BANK_MODE_FUND_POOL_MEMBER_CARD === BestpayCardSelf.userInfo.bankMode){
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

            BestpayCardSelf.orderPageJson['jfy_amount'] = Lang.fen2yuan(sub_bankMode);
            console.log("子卡＝＝＝＝"+BestpayCardSelf.orderPageJson['jfy_amount']);
        }

        //成功
        BestpayCardSelf.queryEnd();
    };

    /**
     * 点击“下一步”按钮， 酬金查询
     */
    BestpayCard.prototype.getCommission = function() {
        var self = this;
        self.cardAmount = self.idAcountItem;//获取选中的值

        this.mobile_val = this.itMobile.getToEmptyValue(); //"翼支付充值卡
        if(this.mobile_val ==""){
            Bestpay.Toast.makeText('请输入手机号码', Bestpay.Toast.LENGTH_SHORT);
            return;
        }else if(this.mobile_val.length >= 1 && this.mobile_val.length < 11){
            Bestpay.Toast.makeText('请输入11位的顾客手机号码', Bestpay.Toast.LENGTH_SHORT);
            return;
        }else if(BestpayCardSelf.checkPhome == false){
            Bestpay.Toast.makeText('请重新输入手机号码', Bestpay.Toast.LENGTH_SHORT);
            return;
        }
        /*else if(this.mobile_val.length == 11&& Lang.getPhoneOperators(this.mobile_val) == ''){
            Bestpay.Toast.makeText('您输入的手机号号码段不正确', Bestpay.Toast.LENGTH_SHORT);
            return;
        }*/
        if(self.idAcountItem == '0'){
            self.cardAmount = self.phone_amount.getToEmptyValue();
            if(self.phone_amount.getToEmptyValue().length == 0 || self.phone_amount.getToEmptyValue()<5 || self.phone_amount.getToEmptyValue()>1000){
                Bestpay.Toast.makeText('请输入5到1000元的整数金额', Bestpay.Toast.LENGTH_SHORT);
                return;
            }
        }
        console.log("酬金查询");
        self.itJudgeLocalStorage = new UI.JudgeLocalStorage();
        self.itJudgeLocalStorage.checkOrder( self.mobile_val, self.cardAmount*1,HTTP.getCurrentTime(),function(){
           console.log(' self.mobile_val = ' +  self.mobile_val);
           console.log(' self.cardAmount = ' +  self.cardAmount);

           self.queryStart(); //查询开始
           //成功的时候载入动画
           self.defferred.done(self.goPayAnimation);
           self.orderPageJson['contact'] = self.mobile_val.replace(/(\d{3})(\d{4})/g,"$1 $2 "); //输入翼支付账户
           self.orderPageJson['cardAmount'] = (self.cardAmount*1).toFixed(2);//充值金额 10.00


           // 'BUS_TYPE_BESTPAY_CARD' : '翼支付卡',
           //'ELE_CARD' : '09010001',    // 电子售卡 包括话费充值卡，游戏点卡，翼支付卡
           HTTP.getCommission(config.BUS_TYPE.BUS_TYPE_PERSON_ACCOUNT, config.BUS_CODE.PERSON_ACCOUNT, config.BUS_CODE.PERSON_ACCOUNT, self.cardAmount, function(result) {
               var retJson = result;
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
               self.orderPageJson['reward'] = retJson.commission;
               BestpayCardSelf.callQuickTradingQuery(); //免密交易查询接口
           },false);

       },self.businessName);
    };

    /*
     * 查询开始
     */
    BestpayCard.prototype.queryStart = function(){
        var self = this;
        //新建一个延迟对象
        self.defferred = $.Deferred();
        showDialog();
    };
    BestpayCard.prototype.queryEnd = function(){
        var self = this;
        console.log("self.noPwd="+self.noPwd);
        var pluginParam = {
            businessName:self.businessName,
            accountName: '翼支付充值', //[string] 充值账号名称
            accouontValue:self.mobile_val, //[string] 充值账号值
            rechargeMoney: self.cardAmount, //[string] 充值金额(元)
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
    BestpayCard.prototype.goPayAnimation = function() {
        $("#order_comfirm").removeClass("backPayAnimation").addClass('goPayAnimation');
    };

    BestpayCard.prototype.gotoOrder = function(val) {
        HTTP.getRandomServices(function(result){
            var retJson = result;
            //未找到酬金结算方式，不进行酬金计算, 也当做成功了，酬金为零
            if (result.code === config.RES.SUCCESS) {
                BestpayCardSelf.random = result.randNum;
            }
            BestpayCardSelf.rechargeResp(val);//翼支付充值
        },false);
    };


    /**
     *   52) 翼支付充值 TTrdAcc003
     */
    BestpayCard.prototype.rechargeResp = function(val){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.TACCCHARGE,
            'params' : self.rechargeParams(val),
            'showLoading' : true,
            'success' : self.rechargeSuccessCallback,
            'error' : self.rechargeErrorCallback
        });
    };

    /**
     * 翼支付充值 TTrdAcc003 构造请求参数
     */
    BestpayCard.prototype.rechargeParams = function (val) {
        var self = this;
        var valStr = "";
        if(val != null && val != ""){
            valStr = val;
        }

        //支付方式 0交费易 1添益宝
        var params = {
            'costWay':self.paymentPlugin.getPayType(),//* 消费方式 0：交费易账户（默认）      1：添益宝
            'orderSeq':BestpayCardSelf.orderPageJson['_tradeSeq'],  //订单号
            'acctCode':self.mobile_val,//账户号码
            'txnAmount':Lang.yuan2fen(self.orderPageJson.cardAmount),//交易金额
            'systemNO':self.orderPageJson.systemNo,//系统参考号
            'acceptDate':Lang.getDate_YYYYMMDD() + '' + Lang.getTime_HHMMSS(),//受理时间
            'payType':'0', //支付方式   `  0.企业账户  1.POS
            'operUser':self.userInfo.staffCode,//企业账户操作员
            'operPassword':Bestpay.Security.encryptPassword(self.userInfo.staffCode,valStr,self.random)//支付卡密码
        };
        console.log('self.payType' + self.payType);
        console.log('self.orderPageJson[userId] 666 ' + self.orderPageJson['userId'] );
        if(self.userInfo.hadEpt.toString()== '1') {
            params['productId']=self.productId;
            params['userId']=self.orderPageJson['userId'];
            console.log('self.orderPageJson[userId] 666 xxxx' + self.orderPageJson['userId'] );
        }
        params = HTTP.setCPSCommonParams(params);
        console.log("翼支付充值 TTrdAcc003入参======="+JSON.stringify(params));
        return params;
    };

    /*
     * 翼支付充值 TTrdAcc003 成功回调函数
     */
    BestpayCard.prototype.rechargeSuccessCallback = function (result) {
        //隐藏键盘
        PasswordKeyBoard.hideKeyboardUI3();
        if (result.code !== config.RES.SUCCESS) {
            if(result.code == "009002" || result.code == "006751") {
                BestpayCardSelf.paymentPlugin.setOrderDisplay('overtime');
                goTo(config.page.float_dia);
                return;
            }
            if(result.code == config.RES.PASSWORD_ERROR_LOCKED_002136){ //输入密码错误次数超过三次，退出app
                Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code, function() {
                    App.exitCompleteApp();
                    BestpayCardSelf.itJudgeLocalStorage.putLocalValue("","","","");
                });
            }else{
                Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code,function(){
                    back();
                    BestpayCardSelf.itJudgeLocalStorage.putLocalValue("","","","");
                });
            }
            return;
        }

        BestpayCardSelf.itJudgeLocalStorage.putLocalValue("","","","");


        console.log("翼支付充值 TTrdAcc003出参========"+JSON.stringify(result));
        HTTP.sendSmsCertificate(result.transSeq, BestpayCardSelf.mobile_val, '');//交易凭证短信下发
        //regType;注册类型  0个体商户，    2企业商户
        
        BestpayCardSelf.paymentPlugin.setOrderDisplay('success');
        goTo(config.page.float_dia);
        config.isBack = function(){
        	//window.jqXHR.readyState 判断请求有没有发出去
            if(window.jqXHR.readyState > 2) {
                Bestpay.App.exitApp();
            }
        };

    };

    /**
     * 翼支付充值 TTrdAcc003 失败回调函数
     */
    BestpayCard.prototype.rechargeErrorCallback = function (result){
        if(result.code === config.RES.MONEY_NOT_ENOUGH){
            Bestpay.Dialog.showAlertDialog('提醒', '余额不足', '确定', config.RES.MONEY_NOT_ENOUGH_MSG,function() {
                back();
                BestpayCardSelf.itJudgeLocalStorage.putLocalValue("","","","");
            });
            return;
        }
    };
    return BestpayCard;
});
