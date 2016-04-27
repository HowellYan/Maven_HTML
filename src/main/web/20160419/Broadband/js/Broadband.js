
define(['jquery','bestpay.ui','bestpay.lang','bestpay.http'],function($,UI, Lang, HTTP) {
    var broadbandSelf=null;

    function Broadband() {
        broadbandSelf=this;
        this.userInfo = JSON.parse(Bestpay.User.getSuccessLoginInfo());
        this.selectType = null;
        this.random = null;                 //随机数
        this.BROADBANDNUM = "03010100";     //判断切换固话或宽带：固话:03010100 宽带:03010200
        this.pecProductCode = '00000007';           //判断切换固话或宽带：固话:00000007 宽带:00000006
        this.phone_area = null;             //区号 input
        this.phone_number = null;           //号码 input
        this.phone_amount = null;           //充值金额 input
        this.isReload = true;               //重新获取账号信息


        this.itMobile = null;               //手机号码 input
        this.ipPassword = null;             //支付密码 input
        this.orderPageJson = {};          //订单页面的json
        this.successJson = {};            //订单充值成功的json
        this.payType ='0';				 //选择支付方式  0是交费易   1是添益宝
        this.checkBillCheck = false;     //检查订单
   		this.BroadbandData = {};         //交费易添益宝充值数据
   		this.productId = '0030001';     //添益宝productId
        this.paymentPlugin = null;
        this.businessName = '电信固话';
    };
    /**
     * 初始化应用
     */
    Broadband.prototype.initApp = function() {
        config.TRADE_LIST_QUERY_TYPE = config.BUS_TYPE.BUS_TYPE_FIXEDPHONEBROADBAND;
        var self = this;
        goTo(config.page.main, function() {
            console.log('--------------start--------------');
            var selectCallBack=function(args){
                if(self.BROADBANDNUM != args ){
                    self.hideMagDiv();
                    self.phone_area.clearValue();
                    self.phone_number.clearValue();
                }
                self.BROADBANDNUM=args;
                if(args=="03010100"){
                    $("#phone_number").attr("placeholder","固话号码");
                    $("#phone_number").attr("type","tel");
                    $(".fixed-line").show(); //卡充
                    self.businessName = '电信固话';
                }else
                if(args=="03010200"){
                    $("#phone_number").attr("placeholder","宽带号码");
                    $("#phone_number").attr("type","text");
                    $(".fixed-line").hide(); //卡充
                    self.businessName = '电信宽带';
                }
            };
            self.selectType = new UI.BlockRadioGroup('brg_amount', 'item03010100',selectCallBack);
            self.phone_area = new UI.InputText('phone_area','number',function(){
                self.hideMagDiv();
            },function(){
                self.hideMagDiv();
            });        //区号
            self.phone_number = new UI.InputText('phone_number',null,function(val){
                //self.hideMagDiv();
                $('#id_confirm_amount').hide();
                $('#id_confirm_name').hide();
                if(self.BROADBANDNUM == "03010100"){
                    self.phone_number.setValue(val.replace(/[^0-9]+/,''));
                    val = self.phone_number.getToEmptyValue();
                    if (val.length == 0 ) {
                        $(self.phone_number.btnClear).hide();
                    }
                }
            },function(){
                //self.hideMagDiv();
                $('#id_confirm_amount').hide();
                $('#id_confirm_name').hide();
            });    //号码

            self.phone_number.blur(function(){
                setTimeout(function() {
                    if (self.validaForm() == false) {
                        return;
                    }
                    if(self.isReload == true){
                       // self.getVerifyResp();
                    }
                    self.extractsClientName();
                },11);
            });
            self.phone_area.blur(function(){
               $("#id_confirm_amount").hide();
                setTimeout(function() {
                    if(self.phone_number_val !=null && self.phone_number_val.length >= 5){
                        self.phone_area_val= self.phone_area.getToEmptyValue();
                        if (self.phone_area_val == null || self.phone_area_val.length==0) {
                            Bestpay.Toast.makeText('请输入区号', Bestpay.Toast.LENGTH_SHORT);
                            return false;
                        }else if(self.phone_area_val.length<3 || self.phone_area_val.length>5){
                            Bestpay.Toast.makeText('请输入正确的区号', Bestpay.Toast.LENGTH_SHORT);
                            return false;
                        }
                        if(self.isReload == true){
                          //self.getVerifyResp();
                            self.extractsClientName();
                        }
                    }
                    config.isOpen=true;
                    self.extractsTheArea();
                },11);
            });
            self.phone_amount = new UI.InputText('phone_amount','number');    //充值金额
            //self.phone_amount = new UI.BlockRadioGroup('phone_amount', 'item10'); //开始选中的值

            self.itMobile = new UI.InputText('mobile','mobile');
            //self.ipPassword = new UI.InputText('pwd','password');
            self.btnInit();
        });
    };

    /**
     *  按钮onclick事件初始化
     */
    Broadband.prototype.btnInit = function(){
        var self = this;
        document.getElementById('btn_next').onclick = function () {
        	self.checkBillCheck = false;
            self.validation();
        };
    };

    /**
     * 获取区域名称
     */
    Broadband.prototype.extractsTheArea = function(){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.ExtractsTheArea,
            'params' : self.extractsTheAreaParams(),
            'showLoading' : false,
            'success' : self.extractsTheAreaSuccessCallback
        });
    };
    Broadband.prototype.extractsTheAreaParams = function(){
        var self = this;
        var params = {};
        params['areaCode'] = self.phone_area.getToEmptyValue();
        params = HTTP.setCPSCommonParams(params);
        return params;
    };
    Broadband.prototype.extractsTheAreaSuccessCallback = function(result){
        if (result.code !== config.RES.SUCCESS) {
            Bestpay.Toast.makeText(result.content+'('+result.code+')', Bestpay.Toast.LENGTH_SHORT);
            return;
        }
        if(result.provinceName == null || result.cityName == null || result.provinceName == 'null' || result.cityName == 'null'){
            return;
        }
        broadbandSelf.orderPageJson['content'] = result.provinceName+"-"+result.cityName;
        broadbandSelf.orderPageJson['provinceCode'] = result.provinceCode;
        var template = new UI.Template();
        template.template_OneToOne("id_msg" ,broadbandSelf.orderPageJson);
        broadbandSelf.showMagDiv();

        if(broadbandSelf.orderPageJson['amount_val'] == "" || broadbandSelf.orderPageJson['amount_val'] == null){
            $('#id_confirm_amount').hide();
            $('#id_confirm_name').hide();
        }
    };

    /**
     * 获取客户名称
     */
    Broadband.prototype.extractsClientName = function(){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.ExtractsClientName,
            'params' : self.extractsClientNameParams(),
            'showLoading' : false,
            'success' : self.extractsClientNameSuccessCallback
        });
    };
    Broadband.prototype.extractsClientNameParams = function(){
        var self = this;
        var params = {};
        params['telNum'] = self.phone_area.getToEmptyValue()+''+self.phone_number.getToEmptyValue();

        if(self.BROADBANDNUM=="03010100"){
            //固话号码
            params['type'] = "3";
        }else if(self.BROADBANDNUM=="03010200"){
            //宽带号码
            params['type'] = "2";
        }

        params = HTTP.setCPSCommonParams(params);
        return params;
    };
    Broadband.prototype.extractsClientNameSuccessCallback = function(result){
        if (result.code !== config.RES.SUCCESS) {
            Bestpay.Toast.makeText(result.content+'('+result.code+')', Bestpay.Toast.LENGTH_SHORT);
            return;
        }
        if(result.custName == null || result.balance == null || result.custName == 'null' || result.balance == 'null'){
            return;
        }


        broadbandSelf.orderPageJson['custName_val'] = result.custName;
        broadbandSelf.orderPageJson['amount_val'] = result.balance;
        var template = new UI.Template();
        template.template_OneToOne("id_msg" ,broadbandSelf.orderPageJson);
        broadbandSelf.showMagDiv();
        $('#id_confirm_amount').show();
        $('#id_confirm_name').show();
        if(broadbandSelf.orderPageJson['provinceCode'] != null && broadbandSelf.orderPageJson['provinceCode'] != "510000"){
            $('#id_confirm_amount').hide();
            $('#id_confirm_name').hide();
        }
    };
    /**
     * 免密交易查询接口
     */
    Broadband.prototype.callQuickTradingQuery = function() {
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
    Broadband.prototype.quickTradingQueryParams = function () {
        var self = this;
        var params = {};
        params = HTTP.setCPSCommonParams(params);
        return params;
    };

    /**
     * 免密交易查询接口 成功回调函数
     */
    Broadband.prototype.quickTradingQuerySuccessCallback = function (result) {
        if (result.code !== config.RES.SUCCESS) {
            //if (result.code == '006781') {
            //    Bestpay.Dialog.showAlertDialog(config.TITLE.dialog_title, '账户异常，请确认后再试', '确定', result.code);
            //    return;
            //}
            Bestpay.Dialog.showAlertDialog(config.TITLE.dialog_title, result.content, '确定', result.code);
            return;
        }
        broadbandSelf.quickTranInfo = {
            'perAmount' : result.perAmount,             // 单笔限额
            'allamount' : result.allamount,             // 累积限额
            'alltransaction' : result.alltransaction    // 累积消费
        };
        broadbandSelf.handleIsneedpassword();
    };

    /**
     * 判断要不要输入密码    要传递的信息passMap  put进一个是否需要输入密码的值
     * @param amount 要充值的金额（以元为单位）
     */
    Broadband.prototype.handleIsneedpassword = function(){
    	var self = this;
        var quickTranInfo = this.quickTranInfo;
        var amount = Lang.yuan2fen(this.phone_amount_val);
        console.log("amount : "+amount);
        console.log("quickTranInfo : "+JSON.stringify(quickTranInfo));
        if(amount*1 <= 1*quickTranInfo.perAmount && (amount*1 + 1*quickTranInfo.alltransaction) <= 1*quickTranInfo.allamount){
            //	免密
            $("#id_pwd_wrap").hide();
            broadbandSelf.noPwd = false;
        }else{
            //	加密
            broadbandSelf.noPwd = true ;
            $("#id_pwd_wrap").show();
        }
        console.log('self.userInfo.authenStatus==' + self.userInfo.authenStatus);
        if(self.userInfo.authenStatus == 'A02'){
            //showDialog(config.MSG.loading);
            console.log('self.userInfo.hadEpt  '+self.userInfo.hadEpt);
            if (self.userInfo.hadEpt == 1) {
                $("#tianyibao_pay").show();
                self.getFinancialProducts();   //企业理财用户理财产品列表接口(SEpt012)
            } else {
                $("#tianyibao_pay").hide();
                self.fundAccountBalanceInquiry();     //资金账户余额查询 SAcc003
            }
        } else {
            $("#tianyibao_pay").hide();
            self.fundAccountBalanceInquiry();     //资金账户余额查询 SAcc003
        }
    };

	/**
     * 3.13企业理财用户理财产品列表查询(SEpt012)
     */
    Broadband.prototype.getFinancialProducts = function(){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.FINANCIAL_PRODUCTS,
            'params' : self.getFinancialProductsParams(),
            'showLoading' : false,
            'success' : self.getFinancialProductsSuccessCallback
        });
    };

    /*企业理财用户理财产品列表查询 请求参数*/
    Broadband.prototype.getFinancialProductsParams = function () {
        var self = this;
        var params = {};
        params = HTTP.setCPSCommonParams(params);
        return params;
    };

    /**
     * 企业理财用户理财产品列表查询 成功回调函数
     */
    Broadband.prototype.getFinancialProductsSuccessCallback = function (result) {
		if (result.code !== config.RES.SUCCESS) {
			if(result.code === '018888'){ 
				broadbandSelf.fundAccountBalanceInquiry(); //资金账户余额查询 SAcc003
				return;
			}else{ 
				Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
				return;
			}
		}
		$('#payfortianyibao').show();
        var list = result['datas'];//用户产品列表
        for(var i=0;i<list.length;i++) {
            broadbandSelf.orderPageJson['productId'] =list[i]['productId']; //产品ID
            broadbandSelf.orderPageJson['userId'] =list[i]['userId']; //userId
            broadbandSelf.orderPageJson['tyb_amount'] = Lang.fen2yuan(list[i]['balance']); //添益宝余额
        }

        broadbandSelf.checkBill(broadbandSelf.orderPageJson['tyb_amount'], 'tyb', 1); //检查账户余额
       	if(broadbandSelf.checkBillCheck){ return};
        broadbandSelf.fundAccountBalanceInquiry();     //资金账户余额查询 SAcc003
    };
    

    /**
     * 42) 资金账户余额查询 SAcc003
     */
    Broadband.prototype.fundAccountBalanceInquiry = function(){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.CCOUNT_BALANCE_QUERY,
            'params' : self.fundAccountBalanceInquiryParams(),
            'showLoading' : false,
            'success' : self.fundAccountBalanceInquirySuccessCallback
        });
    };

    /*资金账户余额查询 请求参数*/
    Broadband.prototype.fundAccountBalanceInquiryParams = function () {
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
    Broadband.prototype.fundAccountBalanceInquirySuccessCallback = function (result) {
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
                    broadbandSelf.orderPageJson['jfy_amount'] =  Lang.fen2yuan(activeBalance);
                    break;
                }
            }
        }
        if(config.CARD_TYPE.BANK_MODE_FUND_POOL_MEMBER_CARD === broadbandSelf.userInfo.bankMode){
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
			
            broadbandSelf.orderPageJson['jfy_amount'] = Lang.fen2yuan(sub_bankMode);
            console.log("子卡＝＝＝＝broadbandSelf.orderPageJson['jfy_amount']=="+broadbandSelf.orderPageJson['jfy_amount']);
        }
        broadbandSelf.checkBill(broadbandSelf.orderPageJson['jfy_amount'], 'jfy', 0); //检查账户余额
        if(broadbandSelf.checkBillCheck){ return };

       // broadbandSelf.getVerifyResp(); //账号验证
        broadbandSelf.getCommission();
    };


	/*
	 * 去选择支付方式页面
	 */
	Broadband.prototype.gotoChosePay = function() {
		var self = this;

		showDialog(config.MSG.loading);
		self.resetChoseData(); //重置数据
		goTo(config.page.pay, function(){ 
			dismissDialog();
			//选择支付方式
			$('.main_wrap').each(function() {
				$(this).on('click', function() {
					var me = $(this).children('.radio_off');
					if(me.hasClass('radio_refresh') || me.hasClass('radio_loading')){ return };

					$('.radio_on').removeClass('radio_on');
					me.addClass('radio_on');
					self.setChoseData(me.attr('data-value'));
				});
			});
		});
	};

	/*
	 * 重置充值数据
	 */
	Broadband.prototype.resetChoseData = function() { 
		var self = this;
		var me = null;
		self.BroadbandData = {}; //重置数据

		$(".radio_off").removeClass("radio_on");
		if(broadbandSelf.payType == "0"){ 
			me = $(".radio_off").eq(0);
			if(me.hasClass('radio_refresh') || me.hasClass('radio_loading')){ return };
			$(".radio_off").eq(0).addClass("radio_on");
		}else if(broadbandSelf.payType == "1"){ 
			me = $(".radio_off").eq(1);
			if(me.hasClass('radio_refresh') || me.hasClass('radio_loading')){ return };
			$(".radio_off").eq(1).addClass("radio_on");
		}
	};

	/*
	 * 设置充值数据
	 */
	 Broadband.prototype.setChoseData = function(value) { 
	 	var self = this;

	 	if(value == '0') { 
	 		self.BroadbandData['payType'] = '0';
	 		self.BroadbandData['font'] = '余额付款';
	 	}else if(value == '1') { 
	 		self.BroadbandData['payType'] = '1';
	 		self.BroadbandData['font'] = '添益宝账户余额付款';
	 	} 
	 };

	 /*
	  * 确定选择充值类型
	  */
	 Broadband.prototype.sureData = function() { 
	 	var self = this;
	 	if(self.BroadbandData['payType'] == '0' || self.BroadbandData['payType'] == '1') { 
	 		broadbandSelf.payType = self.BroadbandData['payType'];
	 		$(".chosebill span").html(self.BroadbandData['font']);
	 	}
	 	console.log("payType========================="+broadbandSelf.payType)
	 	back();
	 };


	/*
	 * 检查账户余额加载是否成功
	 * param 账户 ,  类型(jfy/tyb) ， 数字(0交费易、1添益宝)
	 */
	Broadband.prototype.checkBill = function(account, type , num) {
		var self = this; 

	};



    /**
     * 点击“下一步”按钮，
     */
    Broadband.prototype.validation = function() {
        this.phone_area_val= this.phone_area.getToEmptyValue();
        this.phone_number_val= this.phone_number.getToEmptyValue();
        this.mobile_val = this.itMobile.getToEmptyValue(); //"顾客手机号码：（选填）
        this.phone_amount_val= this.phone_amount.getToEmptyValue();
        var self = this;
        if (self.validaForm() == false) {
            return;
        }
        else if(this.phone_amount_val == null || this.phone_amount_val.length==0){
            Bestpay.Toast.makeText('请输入充值金额', Bestpay.Toast.LENGTH_SHORT);
            return;
        }else if(this.phone_amount_val*1<5 || this.phone_amount_val*1>2000){
            Bestpay.Toast.makeText('请输入5到2000元的整数金额', Bestpay.Toast.LENGTH_SHORT);
            return;
        }

        if(this.mobile_val.length >= 1 && this.mobile_val.length < 11){
            Bestpay.Toast.makeText('请输入11位的顾客手机号码', Bestpay.Toast.LENGTH_SHORT);
            return;
        }
        /**
         * 没有获取获取账号信息
         */
        if(self.isReload == true){
            Bestpay.Toast.makeText('请重新填写固话/宽带号码', Bestpay.Toast.LENGTH_SHORT);
            return;
        }

        self.orderPageJson['phone_area_val'] = this.phone_area_val;
        self.orderPageJson['phone_number_val'] = this.phone_number_val;
        self.orderPageJson['phone_amount_val'] = (this.phone_amount_val*1).toFixed(2);

        if(self.BROADBANDNUM=="03010100"){
            self.orderPageJson['ServiceName'] = "固话号码";
        }else
        if(self.BROADBANDNUM=="03010200"){
            self.orderPageJson['ServiceName'] = "宽带号码";
        }
        self.itJudgeLocalStorage = new UI.JudgeLocalStorage();
        self.itJudgeLocalStorage.checkOrder(self.phone_area_val + '-' + self.phone_number_val, self.phone_amount_val*1,HTTP.getCurrentTime(),function(){

            showDialog(config.MSG.loading);
            //新建一个延迟对象
            broadbandSelf.defferred = $.Deferred();
            broadbandSelf.defferred.done(self.goPayAnimation);
            //self.callQuickTradingQuery(); //免密交易查询接口
            broadbandSelf.getVerifyResp();
        },self.businessName);

    };

    Broadband.prototype.validaForm = function(){
         var self = this;
         self.phone_area_val= self.phone_area.getToEmptyValue();
         self.phone_number_val= self.phone_number.getToEmptyValue();
        config.isOpen=true;
         if (self.phone_area_val == null || self.phone_area_val.length==0) {
             Bestpay.Toast.makeText('请输入区号', Bestpay.Toast.LENGTH_SHORT);
             return false;
         }else if(self.phone_area_val.length<3 || self.phone_area_val.length>5){
             Bestpay.Toast.makeText('请输入正确的区号', Bestpay.Toast.LENGTH_SHORT);
             return false;
         }else if(self.phone_number_val == null || self.phone_number_val.length==0){
             Bestpay.Toast.makeText('请输入号码', Bestpay.Toast.LENGTH_SHORT);
             return false;
         }else if((self.phone_area_val + '' + self.phone_number_val).length>64){
             Bestpay.Toast.makeText('充值号码长度不能大于64位', Bestpay.Toast.LENGTH_SHORT);
             return false;
         }else if(self.phone_number_val.length<5){
             Bestpay.Toast.makeText('请输入正确固话/宽带号', Bestpay.Toast.LENGTH_SHORT);
             return false;
         }
        return true;
     };

    /**
     * 初始化确定订单界面
     */
    Broadband.prototype.initConfirm = function(){
        var self = this;
        var custName = self.orderPageJson['custName_val'];
        var amount = self.orderPageJson['amount_val'];
        var ifrefush = self.orderPageJson['ifrefush'];
        var queryType = self.orderPageJson['queryType'];

        if(queryType == 'Y'){
            if(ifrefush == 'Y'){
                $('#payName_parent_img').show();
                //$('#payamout_parent_img').show();
            }else{
                $('#payName_parent_img').hide();
                //$('#payamout_parent_img').hide();
            }
        }else{
            $('#id_confirm_name').hide();
        }


        $('#payName_parent_img').on('click',function(){
            self.getVerifyResp();  //重新调账号验证
        });
        self.queryEnd();

    };

    /**
     * 账号验证
     */
    Broadband.prototype.getVerifyResp = function(){

        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.RECHARE_ACCOUNT_VERIFY,
            'params' : self.getVerifyRespParams(),
            'showLoading' : false,
            'success' : self.getVerifyRespSuccessCallback
        });
    };

    /**
     * 账号验证接口 构造请求参数
     * veriType 验证号码类型    0:个人账户 1：3G流量充值   2: 全国电信宽带充值   3：全国电信固话充值
     * this.BROADBANDNUM    固话:03010100 宽带:03010200
     */
    Broadband.prototype.getVerifyRespParams = function () {
        this.phone_area_val= this.phone_area.getToEmptyValue();
        this.phone_number_val= this.phone_number.getToEmptyValue();
        var verify=3;
        if(this.BROADBANDNUM == "03010100"){
        	self.pecProductCode = '00000007';
            verify=3;
        }else if(this.BROADBANDNUM == "03010200"){
        	self.pecProductCode = '00000006';
            verify=2;
        }
        var params = {
            'verify' : verify,                //鉴权类型
            'isQryUserInfo' : 'Y',            //默认传Y
            'queryQuantity' : '1',            //查询次数标识，当查询次数为2的时候，CPS就不调用业务网关做鉴权，直接查询姓名、余额信息
            'accepTareaCode' : this.phone_area_val, //受理区域编码
            'acctCode' : this.phone_area_val + '' + this.phone_number_val, //验证号码（加受理区域编码）
            'reamount' : 0,//Lang.yuan2fen(this.phone_amount_val), //充值金额
            'acceptDate' : Lang.getDate_YYYYMMDD(), //受理日期
            'acceptTime' : Lang.getTime_HHMMSS()    //受理时间
        };
        params = HTTP.setCPSCommonParams(params);
        return params;
    };

    /**
     * 账号验证接口 成功回调函数
     */
    Broadband.prototype.getVerifyRespSuccessCallback = function (result) {
        //$('#payName_parent_img').attr('src','../lib/img/ic_refresh.png');
        $('#payamout_parent_img').attr('src','../lib/img/ic_refresh.png');
        if (result.code !== config.RES.SUCCESS) {
            //if (result.code == '006781') {
            //    Bestpay.Dialog.showAlertDialog(config.TITLE.dialog_title, '账户异常，请确认后再试', '确定', result.code);
            //    return;
            //}
            Bestpay.Dialog.showAlertDialog(config.TITLE.dialog_title, result.content + '(' + result.code + ')','确定','');
            return;
        }
        //broadbandSelf.orderPageJson = {};
        //broadbandSelf.orderPageJson['content'] = result.content; //所在城市
        broadbandSelf.orderPageJson['systemNo'] = result.systemNo;
        broadbandSelf.orderPageJson['tradeSeq'] = result.tradeSeq;
        broadbandSelf.orderPageJson['flag'] = result.flag;
        //broadbandSelf.orderPageJson['custName'] = result.custName;
        //broadbandSelf.orderPageJson['amount'] = result.amount;
        broadbandSelf.orderPageJson['queryType'] = result.queryType;
        broadbandSelf.orderPageJson['reward'] = '0.00';
        broadbandSelf.orderPageJson['custName_val'] = result.custName;
        broadbandSelf.orderPageJson['amount_val'] = result.amount;
        broadbandSelf.orderPageJson['ifrefush'] = result.ifrefush; //判断是否显示刷新
        //var template = new UI.Template();
        //template.template_OneToOne("id_msg" ,broadbandSelf.orderPageJson);

        var ifrefush = result.ifrefush;
        var queryType = result.queryType;
        console.log('ifrefush==' + ifrefush);
        console.log('ifrefush==' + queryType);

        //if(queryType == 'Y'){
        //    $('#id_confirm_amount').show();
        //    if(ifrefush == 'Y'){
        //        $('#payName_parent_img').show();
        //    }else{
        //        $('#payName_parent_img').hide();
        //    }
        //}else{
        //    $('#id_confirm_name').hide();
        //    $('#id_confirm_amount').hide();
        //}
        //
        //broadbandSelf.showMagDiv();
        //$('#payName_parent_img').on('click',function(){
        //    $("#img_posting").show();
        //    broadbandSelf.getVerifyResp();  //重新调账号验证
        //});

        //broadbandSelf.getCommission();
        broadbandSelf.callQuickTradingQuery();
    };


    /*
     * 查询结束
     * 订单页面
     */
    Broadband.prototype.queryEnd = function(){
        var self = this;
        var pluginParam = {
            businessName:self.businessName,
            accountName : '固话宽带', //[string] 充值账号名称
            accouontValue: self.orderPageJson['phone_area_val'] + '-' +self.orderPageJson['phone_number_val'], //[string] 充值账号值
            rechargeMoney: self.orderPageJson['phone_amount_val'], //[string] 充值金额(元)
            rewardType: self.orderPageJson['rewardType'], //[string] @param value[reward/zhejia] 酬金查询/折价查询的类型（默认酬金查询）
            rewardMoney: self.orderPageJson['reward'], //[string] 酬金查询/折价查询 的金额
            jfyBalance: self.orderPageJson['jfy_amount'], //[string] 交费易余额
            tybBalance: self.orderPageJson['tyb_amount'], //[string] 添益宝余额
            enablePassword: self.noPwd, //[boolean] @param value[true/false] 是否免密
            userInfo: self.userInfo, //登录信息
            callback: self.gotoOrder //按确定后调用的方法
        };
        console.log("pluginParam = " + JSON.stringify(pluginParam));
        //paymentPlugin
        self.paymentPlugin = new UI.paymentPlugin(pluginParam);


        //支付方式 0交费易 1添益宝
        self.payType = self.paymentPlugin.getPayType();
        console.log("支付方式==" + self.payType);

        //成功
        dismissDialog();
        goTo(config.page.comfirm,function(){});
        self.defferred.resolve();
    };


    /*
     * 显示订单页面动画
     */
    Broadband.prototype.goPayAnimation = function() {
        console.log("done=========================")
        $("#order_comfirm").removeClass("backPayAnimation").addClass('goPayAnimation');
    };

    Broadband.prototype.gotoOrder = function(val) {
        
        config.TRADE_LIST_QUERY_NUMBER = broadbandSelf.orderPageJson['phone_area_val'] + '' + broadbandSelf.orderPageJson['phone_number_val'];
        HTTP.getRandomServices(function(result){
            var retJson = result;
            //未找到酬金结算方式，不进行酬金计算, 也当做成功了，酬金为零
            if (result.code === config.RES.SUCCESS) {
                broadbandSelf.random = result.randNum;
            }
            broadbandSelf.rechargeResp(val);
        },false);

        //goTo(config.page.page_float)
    };

    Broadband.prototype.showMagDiv = function(){
        $("#id_msg_show").show();
        $("#img_posting").hide();
        var self = broadbandSelf;
        self.isReload = false;
        //broadbandSelf.callQuickTradingQuery();
    };

    Broadband.prototype.hideMagDiv = function(){
        $("#id_msg_show").hide();
        $("#img_posting").hide();
        var self = broadbandSelf;
        self.orderPageJson['custName_val'] = "";
        self.orderPageJson['amount_val'] = "";
        self.phone_amount.clearValue();
        self.isReload = true;
    };

    /**
     * 酬金查询
     */
    Broadband.prototype.getCommission = function(){
        var self=this;
        var objCode =  broadbandSelf.orderPageJson['phone_area_val'] + '' + broadbandSelf.orderPageJson['phone_number_val'];
        HTTP.getCommission(config.BUS_TYPE.BUS_TYPE_FIXEDPHONEBROADBAND, self.BROADBANDNUM, self.BROADBANDNUM, self.phone_amount_val, function(result) {
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
            broadbandSelf.orderPageJson['reward'] = retJson.commission;
            broadbandSelf.orderPageJson['rewardType'] = 'reward';
            broadbandSelf.orderPageJson['supplyCode'] = retJson.supplyCode;

            broadbandSelf.initConfirm(); //订单页面初始化
        }, false, '', self.pecProductCode, objCode);
    };

    /**
     * 触发立即充值
     */
    Broadband.prototype.gotoRecharge = function (){
        this.mobile_val = this.itMobile.getToEmptyValue(); //"顾客手机号码：（选填）
        if(this.mobile_val.length >= 1 && this.mobile_val.length < 11){
            Bestpay.Toast.makeText('请输入11位的顾客手机号码', Bestpay.Toast.LENGTH_SHORT);
            return;
        }else if(this.mobile_val.length == 11 && !this.itMobile.getInputCheck()){
            Bestpay.Toast.makeText('您输入的手机号号码段不正确', Bestpay.Toast.LENGTH_SHORT);
            return;
        }
        if(this.noPwd){
            Bestpay.Toast.makeText('请输入您的支付密码', Bestpay.Toast.LENGTH_SHORT);
            //if (this.ipPassword_val == null || this.ipPassword_val.length == 0) {
            //    Bestpay.Toast.makeText('请输入您的支付密码', Bestpay.Toast.LENGTH_SHORT);
            //    return;
            //}else if(this.ipPassword_val.length<6) {
            //    Bestpay.Toast.makeText('请输入6~12位支付密码', Bestpay.Toast.LENGTH_SHORT);
            //    return;
            //}
        }
        showDialog(config.MSG.loading);
        config.TRADE_LIST_QUERY_NUMBER = broadbandSelf.orderPageJson['phone_area_val'] + '' + broadbandSelf.orderPageJson['phone_number_val'];
        config.isBack = function(){
          back();
        };
        HTTP.getRandomServices(function(result){
            var retJson = result;
            //未找到酬金结算方式，不进行酬金计算, 也当做成功了，酬金为零
            if (result.code === config.RES.SUCCESS) {
                broadbandSelf.random = result.randNum;
            }
            broadbandSelf.rechargeResp();
        },false);
    };

    /**
     *  充值
     */
    Broadband.prototype.rechargeResp = function(val){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.TBRB_CHARGE,
            'params' : self.rechargeParams(val),
            'showLoading' : true,
            'success' : self.rechargeSuccessCallback
        });
    };

    /**
     * 充值接口 构造请求参数
     */
    Broadband.prototype.rechargeParams = function (val) {
        var self = this;
        var valStr = "";
        if(val != null && val != ""){
            valStr = val;
        }
        var params = {
            'acceptAreaCode' : self.orderPageJson.phone_area_val,
            'acctCode' : self.orderPageJson.phone_area_val + '' +self.orderPageJson.phone_number_val,
            'busiCode' : self.BROADBANDNUM,
            'orderSeq' : self.orderPageJson.tradeSeq,
            'payPassWord' : Bestpay.Security.encryptPassword(self.userInfo.staffCode,valStr,self.random),
            'systemNo' : self.orderPageJson.systemNo,
            'tradeTime' : Lang.getDate_YYYYMMDD() + '' + Lang.getTime_HHMMSS(),
            'txnAmount' : Lang.yuan2fen(self.orderPageJson.phone_amount_val),
            'supplyCode': self.orderPageJson['supplyCode']
        };
        if (self.mobile_val != null && self.mobile_val.length>0){
            params['phone']=self.mobile_val;//客户手机号
        }else{
            params['phone']='';
        }
        if(self.userInfo.hadEpt.toString()== '1'){
            params.costWay = self.paymentPlugin.getPayType();
            params.productId = self.productId;
            params.userId =self.orderPageJson['userId'] ;
        }
        params = HTTP.setCPSCommonParams(params);
        return params;
    };

    /**
     * 充值接口 成功回调函数
     */
    Broadband.prototype.rechargeSuccessCallback = function (result) {
        //隐藏键盘
        PasswordKeyBoard.hideKeyboardUI3();
        if (result.code !== config.RES.SUCCESS) {
            //broadbandSelf.ipPassword.clearValue();
            if(result.code === config.RES.MONEY_NOT_ENOUGH){
                Bestpay.Dialog.showAlertDialog(config.TITLE.no_repeat,config.RES.MONEY_NOT_ENOUGH_MSG,'确定',result.code,function(code){
                    back();
                    broadbandSelf.itJudgeLocalStorage.putLocalValue("","","","");
                });
                return;
            }
            if(result.code == "009002" || result.code == "006751") {
                broadbandSelf.paymentPlugin.setOrderDisplay('overtime');
                goTo(config.page.float_dia);
                return;
            }
            if(result.code == config.RES.PASSWORD_ERROR_LOCKED_002136){ //输入密码错误次数超过三次，退出app
                Bestpay.Dialog.showAlertDialog(config.TITLE.no_repeat, result.content,'确定',result.code,function(code){
                    App.exitCompleteApp();
                    broadbandSelf.itJudgeLocalStorage.putLocalValue("","","","");
                });
                return;
            }
            Bestpay.Dialog.showAlertDialog(config.TITLE.dialog_title, result.content,'确定',result.code,function(code){
                back();
                broadbandSelf.itJudgeLocalStorage.putLocalValue("","","","");
            });
            console.log("-----------:"+ result.content );
            return;
        }

        broadbandSelf.itJudgeLocalStorage.putLocalValue("","","","");
        broadbandSelf.successJson['transSeq'] = result.transSeq; //交易流水号
        broadbandSelf.successJson['txnAmount'] = Lang.fen2yuan(result.txnAmount); //交易金额
        broadbandSelf.successJson['amount'] = broadbandSelf.orderPageJson['phone_amount_val'];//充值金额
        broadbandSelf.successJson['contact'] = broadbandSelf.orderPageJson['phone_area_val'] + '-' + broadbandSelf.orderPageJson['phone_number_val'];
        //var template = new UI.Template();
        //template.template_OneToOne("id_success_item" ,broadbandSelf.successJson);
        if (broadbandSelf.mobile_val.length>0){
            HTTP.sendSmsCertificate(result.transSeq, broadbandSelf.mobile_val, '');//交易凭证短信下发
        }

        broadbandSelf.paymentPlugin.setOrderDisplay('success');
        goTo(config.page.float_dia);
        dismissDialog();
        config.isBack = function(){
            if(window.jqXHR.readyState > 2) {   //window.jqXHR.readyState 判断请求有没有发出去
                Bestpay.App.exitApp();
            }
        };
    };

    return Broadband;
});