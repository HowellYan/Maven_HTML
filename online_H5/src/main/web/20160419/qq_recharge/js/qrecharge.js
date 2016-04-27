
define(['jquery','bestpay.ui','bestpay.lang','bestpay.http'],function($,UI, Lang, HTTP) {

    var rechargeSelf = null ;

    function Recharge(){
        rechargeSelf = this ;
        /**
         * false 需要密码 ；true 不需要密码
         */
        this.noPwd = false;
        this.qqNum=""  ;
        this.userInfo = JSON.parse(Bestpay.User.getSuccessLoginInfo());
        this.itemValue="1015";//productCode产品编码
        this.quanlitynum=50;//Q币金额
        this.qbInputNum = "";
        this.buyMoney = ""; //交易金额
        this._pName="10";
        this.userId = "";
        this.ipPassword = null;             //支付密码 input
        this.orderPageJson = {};          //订单页面的json
        this.successJson = {};            //订单充值成功的json
        this.userPhone = "";    //顾客手机号码
        this.payType ='0';               //选择支付方式  0是交费易   1是添益宝
        this.checkBillCheck = false;     //检查订单
   		this.rechargeData = {};         //交费易添益宝充值数据
        this.productId = '0030001';     //添益宝productId

        this.selectBuyNumList = null;     //buy num drop down list data
        this.select_buy_num_fun = null ;    //buy num drop down list function
        this.defferred = null  ;   //order slide obj
        this.businessName = 'QQ充值';
    }

    /**
     * 初始化应用
     */
    Recharge.prototype.initApp = function (){
        var self = this ;
        config.TRADE_LIST_QUERY_TYPE = config.BUS_TYPE.BUS_TYPE_QQ;
        goTo(config.page.main,function(){
            self.qqNum = new UI.InputText('QQnumber','number');        //QQ号码
            document.getElementById('id_resource').onclick = function() {  //选择商品类型
                goTo(config.page.select_bank,function(){});
                var flatFeeBox = new UI.dropDownBox('id_resource_list', this, {
                    'Q币' : '1015',
                    'QQ会员' : '1013',
                    'QQ堂(紫钻)' : '1012',
                    'QQ秀(红钻)' : '1011',
                    'QQ游戏(蓝钻)' : '1010',
                    'QQ空间(黄钻)' : '1014'
                }, function(item, itemObj) {
                    flatFeeBox.hideDropDownBox();
                    rechargeSelf.itemObjHtml = $(itemObj).html();
                    rechargeSelf.itemValue = item;
                    $("#resource_show").html(rechargeSelf.itemObjHtml);
                    self.loadSelectItem(item);
                    self.qbInputNum.clearValue(); //清空输入
                    back();
                    setTimeout(function(){
                        $("#select_buy_num").trigger("click");
                    },200)
                }, function() {
                    flatFeeBox.hideDropDownBox();
                    back();
                });
            };

            self.qbInputNum = new UI.InputText('quantity','number',function(args){
                if($("#id_buyNum_list").css("display") != 'none') {
                    self.flatFeeBox.hideDropDownBox();
                    back();
                }
                //if(args == null || args == ""){
                //    document.getElementById('select_buy_num').onclick = self.select_buy_num_fun;
                //}

            },function(){
                document.getElementById('select_buy_num').onclick = self.select_buy_num_fun;
            });        //充值金额

            self.userPhone = new UI.InputText('userPhone','mobile');
            self.userPhone.clearValue();
            //默认加载Q币充值
            self.loadSelectItem("1015");
            self.btnInit();
        });
    }

    Recharge.prototype.btnInit = function(){
        var self = this;
        self.select_buy_num_fun = function() {  //选择商品类型
            $("#id_buyNum_list").html("");
            goTo(config.page.select_buy_num,function(){ });
            self.flatFeeBox = new UI.dropDownBox('id_buyNum_list', this, self.selectBuyNumList, function(item, itemObj) {
                self.flatFeeBox.hideDropDownBox();
                if(item == '0'){
                    $("#select_buy_num_list").hide();
                    $("#quantity").show();
                    document.getElementById('select_buy_num').onclick = null;
                    back();
                    return ;
                }
                $("#select_buy_num_list").show();
                $("#quantity").hide();
                rechargeSelf.itemObjHtml_ = $(itemObj).html();
                rechargeSelf.quanlitynum = item;
                $("#select_buy_num_val").html(rechargeSelf.itemObjHtml_);
                back();
            }, function() {
                self.flatFeeBox.hideDropDownBox();
                back();
            });
        };
        document.getElementById('select_buy_num').onclick = self.select_buy_num_fun;



        document.getElementById('btn_next').onclick = function () {   //下一步
            self.checkBillCheck = false;
            self.initClick(); //酬金查询接口
        };
    };

    /**
     * 加载选择的产品对应的金额（月份）选择
     * @param quanlitynum  对应的金额（月份）选择 items
     */
    Recharge.prototype.loadSelectItem = function (quanlitynum){
        var self = this ;
        if(quanlitynum=='1015'){self.selectBuyNumList = config.selectItem.qb;;$("#buyQbNum").show()}
        else   {self.selectBuyNumList = config.selectItem.other;$("#buyQbNum").hide()}
        document.getElementById('select_buy_num').onclick = self.select_buy_num_fun;
        for(var item in self.selectBuyNumList){
            if( self.selectBuyNumList[item] == '50'  || item =='1个月') {
                $("#select_buy_num_val").text(item);
                self.quanlitynum = self.selectBuyNumList[item];
                $("#select_buy_num_list").show();
                $("#quantity").hide();
                return;
            }
        }
    }

    Recharge.prototype.initClick = function(){
        var self = this ;
            var QQnumber = self.qqNum.getToEmptyValue() ;
            var qbInputNum  = self.qbInputNum.getToEmptyValue() ;
            if(QQnumber.length<5){
                Bestpay.Toast.makeText('请输入正确的QQ号码', Bestpay.Toast.LENGTH_SHORT);
                return;
            }
            if(qbInputNum!= ""&& parseInt(qbInputNum) <5){
                Bestpay.Toast.makeText('充值Q币单笔不能小于5个', Bestpay.Toast.LENGTH_SHORT);
                return;
            }
            if(qbInputNum!= "" && parseInt(qbInputNum) >500){
                Bestpay.Toast.makeText('充值Q币单笔不能超过500个', Bestpay.Toast.LENGTH_SHORT);
                return;
            }
            this.mobile_val = self.userPhone.getToEmptyValue().replace(' ',''); //"顾客手机号码：（选填）
            if(this.mobile_val!= null && this.mobile_val != ""){
                if(this.mobile_val.length >11 || this.mobile_val.length < 11){
                    Bestpay.Toast.makeText('请输入11位的顾客手机号码', Bestpay.Toast.LENGTH_SHORT);
                    return;
                }else if(this.mobile_val.length != 11 || !this.userPhone.getInputCheck()){
                    Bestpay.Toast.makeText('您输入的手机号号码段不正确', Bestpay.Toast.LENGTH_SHORT);
                    return;
                }
            }
        self.buyMoney = self.qbInputNum.getToEmptyValue()!=null&&self.qbInputNum.getToEmptyValue()!=""?self.qbInputNum.getToEmptyValue(): self.quanlitynum;
        self.itJudgeLocalStorage = new UI.JudgeLocalStorage();
        self.itJudgeLocalStorage.checkOrder(QQnumber, self.buyMoney*1,HTTP.getCurrentTime(),function(){
            //查询开始
            self.queryStart();
            //折价查询
            self.SDiscQuery();
            //成功的时候载入动画
            self.defferred.done(self.goPayAnimation);

        },self.businessName);
       

    };


    /**
     * 折价查询接口
     */
    Recharge.prototype.SDiscQuery = function() {
        var self = this;
        HTTP.callCPSService({
            'service': config.CPS.SDISCQUERY,
            'params': self.SDiscQueryParams(),
            'showLoading': false,
            'success': self.SDiscQuerySuccessCallback
        });
    };
    /**
     * 折价查询接口 构造请求参数
     */
    Recharge.prototype.SDiscQueryParams = function() {
        var self = this;
        var params = { 
            'rechAmount': Lang.yuan2fen(self.buyMoney),   //订单金额
            'pecProduct': config.QQproductCode[self.itemValue]
        };
        params = HTTP.setCPSCommonParams(params);
        console.log("折价查询SDISCQUERY 入参==");

        return params;
    };

    /**
     * 折价查询接口 成功回调函数
     */
    Recharge.prototype.SDiscQuerySuccessCallback = function(result) {
        if (result.code !== config.RES.SUCCESS) {
            Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
            return;
        }
        console.log("折价查询SDISCQUERY 出参==" + JSON.stringify(result));
        rechargeSelf.orderPageJson = {};
        rechargeSelf.orderPageJson['rewardType'] = 'zhejia';
        rechargeSelf.orderPageJson['reward'] = Lang.fen2yuan(result.discAmount);
        rechargeSelf.orderPageJson['contact'] = rechargeSelf.qqNum.getToEmptyValue(); //输入翼支付账户
        rechargeSelf.orderPageJson['cardAmount'] = (rechargeSelf.buyMoney*1).toFixed(2);//充值金额 10.00
        rechargeSelf.orderPageJson['supplyCode'] = result.supplyCode;
        rechargeSelf.orderPageJson.buyTypeName =  rechargeSelf.itemValue == '1015'?'充值数据':'充值时长';
        rechargeSelf.orderPageJson.buyProductName =  config.productName[rechargeSelf.itemValue ];
        rechargeSelf.orderPageJson.buyProductCode = config.QQproductCode[rechargeSelf.itemValue];
        rechargeSelf.orderPageJson.buyNum =  rechargeSelf.itemValue == '1015'?(rechargeSelf.buyMoney*1)+'Q币': parseInt(rechargeSelf.buyMoney*1).toString().replace("0","")+"个月";

        rechargeSelf.callQuickTradingQuery(); //免密交易查询接口
    };



    /**
     * 酬金查询
     *
    Recharge.prototype.getCommission = function(){
        var self=this;
        HTTP.getCommission(config.BUS_TYPE.BUS_TYPE_QQ, config.BUS_CODE.QQ_GL,   rechargeSelf.itemValue,self.buyMoney , function(result) {
            console.log(JSON.stringify(result)+"______________________---");

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
            self.orderPageJson = {};
            self.orderPageJson['reward'] = retJson.commission;
            self.orderPageJson['contact'] = self.qqNum.getToEmptyValue(); //输入翼支付账户
            self.orderPageJson['cardAmount'] = (self.buyMoney*1).toFixed(2);//充值金额 10.00
            self.orderPageJson['supplyCode'] = retJson.supplyCode;
            self.orderPageJson.buyTypeName =  rechargeSelf.itemValue == '1015'?'充值数据':'充值时长';
            self.orderPageJson.buyProductName =  config.productName[rechargeSelf.itemValue ];
            self.orderPageJson.buyProductCode = config.QQproductCode[rechargeSelf.itemValue];
            self.orderPageJson.buyNum =  rechargeSelf.itemValue == '1015'?(self.buyMoney*1)+'Q币': parseInt(self.buyMoney*1).toString().replace("0","")+"个月";

            //self.callQuickTradingQuery(); //免密交易查询接口

        }, false, '', config.QQproductCode[rechargeSelf.itemValue]);
    };*/

    /**
     * 免密交易查询接口
     */
    Recharge.prototype.callQuickTradingQuery = function() {
        //showDialog(config.MSG.loading);
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
    Recharge.prototype.quickTradingQueryParams = function () {
        var self = this
        var params = {};
        params = HTTP.setCPSCommonParams(params);
        return params;
    };

    /**
     * 免密交易查询接口 成功回调函数
     */
    Recharge.prototype.quickTradingQuerySuccessCallback = function (result) {
        if (result.code !== config.RES.SUCCESS) {
            if (result.code == '006781') {
                Bestpay.Dialog.showAlertDialog(config.TITLE.dialog_title, '账户异常，请确认后再试', '确定', result.code);
                return;
            }
            Bestpay.Dialog.showAlertDialog(config.TITLE.dialog_title, result.content, '确定', result.code);
            return;
        }
        rechargeSelf.quickTranInfo = {
            'perAmount' : result.perAmount,             // 单笔限额
            'allamount' : result.allamount,             // 累积限额
            'alltransaction' : result.alltransaction    // 累积消费
        };
        rechargeSelf.handleIsneedpassword();
    };

    /**
     * 判断要不要输入密码    要传递的信息passMap  put进一个是否需要输入密码的值
     * @param amount 要充值的金额（以元为单位）
     */
    Recharge.prototype.handleIsneedpassword = function(){
        var quickTranInfo = this.quickTranInfo;
        var amount = Lang.yuan2fen(this.buyMoney);
        console.log("amount : "+amount);
        console.log("quickTranInfo : "+JSON.stringify(quickTranInfo));
        if(amount*1 <= 1*quickTranInfo.perAmount && (amount*1 + 1*quickTranInfo.alltransaction) <= 1*quickTranInfo.allamount){
            //	免密
            rechargeSelf.noPwd = false;
        }else{
            //	加密
            rechargeSelf.noPwd = true ;
        }
        console.log('rechargeSelf.userInfo.authenStatus==' + rechargeSelf.userInfo.authenStatus);
        if(rechargeSelf.userInfo.authenStatus == 'A02'){
            //showDialog(config.MSG.loading);
            console.log('rechargeSelf.userInfo.hadEpt  '+rechargeSelf.userInfo.hadEpt);
            if (rechargeSelf.userInfo.hadEpt == 1) {
                rechargeSelf.getFinancialProducts();   //企业理财用户理财产品列表接口(SEpt012)
            } else {
                rechargeSelf.fundAccountBalanceInquiry();     //资金账户余额查询 SAcc003
            }
        }else{
            rechargeSelf.fundAccountBalanceInquiry();     //资金账户余额查询 SAcc003
        }
    };


    /**
     * 3.13企业理财用户理财产品列表查询(SEpt012)
     */
    Recharge.prototype.getFinancialProducts = function(){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.FINANCIAL_PRODUCTS,
            'params' : self.getFinancialProductsParams(),
            'showLoading' : false,
            'success' : self.getFinancialProductsSuccessCallback
        });
    };

    /*企业理财用户理财产品列表查询 请求参数*/
    Recharge.prototype.getFinancialProductsParams = function () {
        var self = this;
        var params = {};
        params = HTTP.setCPSCommonParams(params);
        return params;
    };

    /**
     * 企业理财用户理财产品列表查询 成功回调函数
     */
    Recharge.prototype.getFinancialProductsSuccessCallback = function (result) {
		if (result.code !== config.RES.SUCCESS) {
			if(result.code === '018888'){ 
				rechargeSelf.fundAccountBalanceInquiry(); //资金账户余额查询 SAcc003
				return;
			}else{ 
				Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
				return;
			}
		}
        var list = result['datas'];//用户产品列表
        for(var i=0;i<list.length;i++)
        {
            rechargeSelf.orderPageJson['productId'] =list[i]['productId']; //产品ID
            rechargeSelf.orderPageJson['userId'] =list[i]['userId']; //userId
            rechargeSelf.orderPageJson['tyb_amount'] = Lang.fen2yuan(list[i]['balance']); //添益宝余额
        }

        rechargeSelf.fundAccountBalanceInquiry();     //资金账户余额查询 SAcc003
    };
    

    /**
     * 42) 资金账户余额查询 SAcc003
     */
    Recharge.prototype.fundAccountBalanceInquiry = function(){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.CCOUNT_BALANCE_QUERY,
            'params' : self.fundAccountBalanceInquiryParams(),
            'showLoading' : false,
            'success' : self.fundAccountBalanceInquirySuccessCallback
        });
    };

    /*资金账户余额查询 请求参数*/
    Recharge.prototype.fundAccountBalanceInquiryParams = function () {
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
    Recharge.prototype.fundAccountBalanceInquirySuccessCallback = function (result) {
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
                    rechargeSelf.orderPageJson['jfy_amount'] =  Lang.fen2yuan(activeBalance);
                    break;
                }
            }
        }
        if(config.CARD_TYPE.BANK_MODE_FUND_POOL_MEMBER_CARD === rechargeSelf.userInfo.bankMode){
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
			
            rechargeSelf.orderPageJson['jfy_amount'] = Lang.fen2yuan(sub_bankMode);
            console.log("子卡＝＝"+rechargeSelf.orderPageJson['jfy_amount']);
        }
        
        rechargeSelf.queryEnd(); //订单页面初始化
    };

	/*
	 * 设置订单显示内容
	 * @param type [normal- 显示订单号, overtime-业务受理]
	 */
	Recharge.prototype.setOrderDisplay = function(type){ 
		var self = this;
		var code009002 = document.getElementById("code009002");
		if(type === 'overtime'){ 
			code009002.style.display = "block";

			rechargeSelf.successJson['acctCode'] = self.orderPageJson['contact'];
        	rechargeSelf.successJson['txnAmount'] = (self.buyMoney*1).toFixed(2); //交易金额

			var template2 = new UI.Template();
			template2.template_OneToOne("id_success_item_overtime", self.successJson);

			goTo(config.page.float_dia);

	        dismissDialog();
	        console.log('self.payType==' + self.payType);
	        if(self.payType == "1"){
	            App.updateTybRereshFlag();
	        }
	        config.isBack = function(){
	            if(window.jqXHR.readyState > 2) {   //window.jqXHR.readyState 判断请求有没有发出去
	                Bestpay.App.exitApp();
	            }
	        };
		}
		if(type === 'normal'){ 
			code009002.style.display = "none";
		}
	};



    /**
     * 触发立即充值
     */
    Recharge.prototype.gotoOrder = function (val){
        HTTP.getRandomServices(function(result){
            var retJson = result;
            //未找到酬金结算方式，不进行酬金计算, 也当做成功了，酬金为零
            if (result.code === config.RES.SUCCESS) {
                rechargeSelf.random = result.randNum;
            }
            rechargeSelf.rechargeResp(val);
        },false);
    };

    /**
     *  充值
     */
    Recharge.prototype.rechargeResp = function(val){
        var self = this;

        HTTP.callCPSService({
            'service' : config.CPS.TTQQ003,
            'params' : self.rechargeParams(val),
            'showLoading' : true,
            'success' : self.rechargeSuccessCallback
        });
    };

    /**
     * 充值接口 构造请求参数
     */
    Recharge.prototype.rechargeParams = function (val) {
        var self = this;

        var valStr = "";
        if(val != null && val != ""){
            valStr = val;
        }
        self.orderPageJson.buyNum = parseInt(self.orderPageJson.buyNum);
        var params = {
            "phone":(self.mobile_val.replace(/\s/g,"")),
            "orderSeq":HTTP.getOrderSeq() ,//订单号
            "rechQuantity":self.orderPageJson.buyNum,//充值数量
            "rechAmount":(self.buyMoney*100).toFixed(0),  //充值金额 toFixed为小数点的个数, 0为不要小数点
            "productCode":self.orderPageJson.buyProductCode,//产品编码
            "acctCode":self.orderPageJson['contact'], //账户号码
            "tradeTime":HTTP.getOrderSeq(), //受理时间
            "supplyCode":self.orderPageJson['supplyCode']
        };

        if(rechargeSelf.userInfo.hadEpt.toString()== '1'){
            params.costWay = self.paymentPlugin.getPayType();
            params.productId = self.productId;
            params.userId =rechargeSelf.orderPageJson['userId'] ;
        }

		console.log("充值接口出参== " + JSON.stringify(params));

        //没有免密的时候传密码，免密的时候就不传密码，true为加密
        if(rechargeSelf.noPwd == true){
            params.password =  Bestpay.Security.encryptPassword(self.userInfo.staffCode,valStr,self.random); ////交易密码
        }
        params = HTTP.setCPSCommonParams(params);
        return params;
    };

    /**
     * 充值接口 成功回调函数
     */
    Recharge.prototype.rechargeSuccessCallback = function (result) {
        if (result.code !== config.RES.SUCCESS) {
        	if(result.code == "009002" || result.code == "006751") {
                rechargeSelf.paymentPlugin.setOrderDisplay('overtime');
                goTo(config.page.float_dia);
				return;
			}
            if(result.code === config.RES.MONEY_NOT_ENOUGH){
                Bestpay.Dialog.showAlertDialog(config.TITLE.no_repeat,config.RES.MONEY_NOT_ENOUGH_MSG,'确定',result.code,function(code){
                    back();
                    rechargeSelf.itJudgeLocalStorage.putLocalValue("","","","");
                });
                return;
            }else if(result.code == config.RES.PASSWORD_ERROR_LOCKED_002136){ //输入密码错误次数超过三次，退出app
                Bestpay.Dialog.showAlertDialog(config.TITLE.no_repeat, result.content,'确定',result.code,function(){
                    App.exitCompleteApp();
                    rechargeSelf.itJudgeLocalStorage.putLocalValue("","","","");
                });
            }else{
                Bestpay.Dialog.showAlertDialog(config.TITLE.no_repeat,result.content,'确定',result.code,function(){
                    back();
                    rechargeSelf.itJudgeLocalStorage.putLocalValue("","","","");
                });
            }
            return;
        }
        rechargeSelf.itJudgeLocalStorage.putLocalValue("","","","");

        if (rechargeSelf.mobile_val.length>0){
            HTTP.sendSmsCertificate(result.transSeq, rechargeSelf.mobile_val, '');//交易凭证短信下发
        }

        rechargeSelf.paymentPlugin.setOrderDisplay('success');
        goTo(config.page.float_dia);

        config.isBack = function(){
            if(window.jqXHR.readyState > 2) {   //window.jqXHR.readyState 判断请求有没有发出去
                Bestpay.App.exitApp();
            }
        };
    };

    /*
     * 查询开始
     */
    Recharge.prototype.queryStart = function(){
        var self = this;
        //新建一个延迟对象
        self.defferred = $.Deferred();
        showDialog();
    };

    /*
     * 查询结束
     * 去订单页面
     */
    Recharge.prototype.queryEnd = function(){
        var self = this;
        console.log(JSON.stringify(self.orderPageJson));
        var pluginParam = {
            businessName:self.businessName,
            accountName: 'QQ充值', //[string] 充值账号名称
            accouontValue: self.orderPageJson['contact'], //[string] 充值账号值
            rechargeMoney:  self.buyMoney, //[string] 充值金额(元)
            rewardType: self.orderPageJson['rewardType'], //[string] @param value[reward/zhejia] 酬金查询/折价查询的类型（默认酬金查询）
            rewardMoney: self.orderPageJson['reward'], //[string] 酬金查询/折价查询 的金额
            jfyBalance: self.orderPageJson['jfy_amount'], //[string] 交费易余额
            tybBalance: self.orderPageJson['tyb_amount'], //[string] 添益宝余额
            enablePassword: self.noPwd, //[boolean] @param value[true/false] 是否免密
            userInfo: self.userInfo, //登录信息
            callback: self.gotoOrder //按确定后调用的方法
        }

        console.log("pluginParam = " + JSON.stringify(pluginParam));
        //paymentPlugin
        self.paymentPlugin = new UI.paymentPlugin(pluginParam);


        //成功
        dismissDialog();
        goTo(config.page.comfirm,function(){});
        self.defferred.resolve();
    };

    /*
     * 显示订单页面动画
     */
    Recharge.prototype.goPayAnimation = function() {
        console.log("done=========================")
        $("#order_comfirm").removeClass("backPayAnimation").addClass('goPayAnimation');
    };

    return Recharge;
});