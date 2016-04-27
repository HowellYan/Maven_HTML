/**
 * Created by Administrator on 2015/5/28.
 */
define(['jquery','bestpay.ui','bestpay.lang','bestpay.http'],function($,UI, Lang, HTTP) {
    var SDMpaySelf = null;
    var GZ_ELECTRIC_CODE = "4400004401002001";//广州电费编码 4400004401002001
    var WATER_BUSCODE = "001";//水费
    var ELECTRIC_BUSCODE = "002";//电费
    var GASFARE_BUSCODE = "003";//煤气费
    var HEATFARE_BUSCODE = "004";//燃气费
    var REQUESTCODE = 1;
    var REQUEST_CODE_ONE_TIME_PAYMENT = 10;//一次性帐单
    var REQUEST_CODE_SEVERAL_PAYMENT = 20;//多期帐单

    function SDMpay() {
        SDMpaySelf = this;
        this.userInfo = JSON.parse(Bestpay.User.getSuccessLoginInfo());
        this.selectCityCode = this.userInfo.areaCode;
        console.log("-----------selectCityCode:"+this.selectCityCode);
        this.selectCityName = HTTP.getLocalName();
        this.isMoney = null;                //缴费输入 input
        this.ipPassword = null;             //支付密码 input
        this.ipPassword_val = '';
        this.selectTypeVal = '0';           //"1":水费缴费编码 "2":电费缴费编码 "3":煤气缴费编码 "4":燃气缴费编码
        this.orderPageJson = {};            //订单页面的json
        this.successJson = {};              //订单充值成功的json
        this.accepProvinceCode = "";        // 省编码
        this.accepProvinceName = "";        // 省名称
        this.accepCityCode = "";            // 市编码
        this.accepCityName = "";            // 市名称
        this.flatFee = null;
        this.userNumber = null;
        this.tollCompanyJSON = {};             // 水电煤缴费公司
        this.tollCompanyArray = new Array();   // 水电煤缴费公司
        this.billInfo_selectType = "001";       //001:用户号,002:条形码
        this.billInfo_selectPaymentName = '';   //选择的收费单位的Name
        this.billInfo_selectPaymentCode = '';   //选择的收费单位的Code
        this.billInfo_stored = '';              //选择的收费单位的stored  0:不支持预存则隐藏, 1:支持预存则显示
        this.billInfo_Month = '' ;              //广州电费编码 选择时间
        this.oldVal = null;                     //金额输入框
		this.selectDateInit = false;            //是否第一次选择日期
		this.selectDate_arg = null;             //选择日期存储数据
        this.payType ='0';				 //选择支付方式  0是交费易   1是添益宝
        this.checkBillCheck = false;     //检查订单
   		this.SDMpayData = {};         //交费易添益宝充值数据
   		this.productId = '0030001';     //添益宝productId
        this.userAmountInput = null;
        this.userAmountInput_val = "";
        this.noPwd = null;
        /**
         * 销账单号类型
         * 0-条码
         * 1-缴费单号, 暂时仅只支持 "1", 缴费单号
         */
        this.cashType = "1";
        this.noInputMoney = false;
        this.deffered = null;
   		this.paymentPlugin = null;
        this.businessName = '';
    }

    SDMpay.prototype.initApp = function() {
    	config.TRADE_LIST_QUERY_TYPE = config.BUS_TYPE.BUS_TYPE_SDM;
        var self = this;
        goTo(config.page.main, function () {
            self.btnInit();

            var firstBox = true;
            //选择业务
            $(".eachBlock").one('click', function(){
            	var args = $(this).data('value');
            	var id = '#item'+args;
            	$(this).addClass('eachhover');
            	$(id).trigger('click');
                if(args == '1'){
                    self.businessName = '水费';
                }else if(args == '2'){
                    self.businessName = '电费';
                }else if(args == '3') {
                    self.businessName = '天然气';
                }else if(args == '4'){
                    self.businessName = '煤气';
                }
            	firstBox = false; 
            });

            var selectObj = null;
            var selectCallBack=function(args,item,obj){
                self.goToBillQueries();
                self.selectTypeVal = args;
                if(args == '1'){
                    self.businessName = '水费';
                }else if(args == '2'){
                    self.businessName = '电费';
                }else if(args == '4') {
                    self.businessName = '天然气';
                }else if(args == '3'){
                    self.businessName = '煤气';
                }

                var imgObj = $(obj).find("img");
                if(selectObj != null){
                    selectObj.attr("src",selectObj.attr("src").replace("_on","_off"));
                }
                selectObj = imgObj;
                imgObj.attr("src",imgObj.attr("src").replace("_off","_on"));

                if(firstBox){ 
                	console.log("== hide first page ==");
                	$("#firstPage_id").addClass('firstPagehide');
	            	setTimeout(function(){ 
	            		$("#firstPage_id").hide();
	            	},800);
                }

                //重新查询
                self.reCheck();
            };
            self.selectType = new UI.BlockRadioGroup('brg_amount', null , selectCallBack);
            self.itMobile = new UI.InputText('mobile','mobile');
            self.isMoney = new UI.InputText('id_money', 'number', function(val){
                if(val.replace(/\s/g, '').length == 0){
                    //$("#id_reward").html(self.orderPageJson.reward+ '元');
                    self.noPwd = true;
                    //$("#id_pwd_wrap").show();
                    self.oldVal = null;
                }else {
                    if(self.quickTranInfo == null || self.quickTranInfo == undefined){
                        self.callQuickTradingQuery();
                    }
                    if(!self.noPwd && self.IsNeedPassWord(Lang.yuan2fen(val))){
                        //Bestpay.Toast.makeText('交易金额大于免密设置金额，请输入支付密码', Bestpay.Toast.LENGTH_SHORT);
                        self.noPwd = true;
                        //$("#id_pwd_wrap").show();
                    }else if(self.noPwd && !self.IsNeedPassWord(Lang.yuan2fen(val))){
                        self.noPwd = false;
                        //$("#id_pwd_wrap").hide();
                    }
                }
            },function(){
                //$("#id_reward").html(self.orderPageJson.reward+ '元');
                self.noPwd = true;
                //$("#id_pwd_wrap").show();
                self.oldVal = null;
            },2);
        });
    };

	//重新查询
	SDMpay.prototype.reCheck = function(){ 
		$("#btn_billInfo_wrap").show();
        $("#billShow").hide();
        $("#id_bills_show").html('');
	};

	SDMpay.prototype.gotoOrder = function(val) { 
		HTTP.getRandomServices(function(result){
            var retJson = result;
            //未找到酬金结算方式，不进行酬金计算, 也当做成功了，酬金为零
            if (result.code === config.RES.SUCCESS) {
                SDMpaySelf.random = result.randNum;
            }
            SDMpaySelf.getSDMRecharge(val);
        },false);
	};

	/*
	 * 查询开始
	 */
	SDMpay.prototype.queryStart = function(){ 
		var self = this;

		//新建一个延迟对象
		self.defferred = $.Deferred();
		showDialog();
	};


	/*
	 * 查询结束
	 * 去订单页面
	 */
	SDMpay.prototype.queryEnd = function(){ 
		var self = this;
		var pluginParam = {
            businessName:self.businessName,
			accountName: '水电煤', //[string] 充值账号名称
			accouontValue: self.orderPageJson['customerName'], //[string] 充值账号值
			rechargeMoney: self.orderPageJson['amount'], //[string] 充值金额(元)
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

		//成功
		dismissDialog();
		goTo(config.page.comfirm,function(){});
		self.defferred.resolve();
	};

	/*
	 * 显示订单页面动画
	 */
	SDMpay.prototype.goPayAnimation = function() { 
		console.log("done=========================")
		$("#order_comfirm").removeClass("backPayAnimation").addClass('goPayAnimation');
	};
	/*
	 * 去付款按钮事件点击
	 */
	SDMpay.prototype.gotobuy = function() { 
		var self = this;
		self.mobile_val = self.itMobile.getToEmptyValue(); //"顾客手机号码：（选填）
        if(self.mobile_val.length >= 1 && self.mobile_val.length < 11){
            Bestpay.Toast.makeText('请输入11位的顾客手机号码', Bestpay.Toast.LENGTH_SHORT);
            return;
        }else if(self.mobile_val.length == 11 && !self.itMobile.getInputCheck()){
            Bestpay.Toast.makeText('您输入的手机号号码段不正确', Bestpay.Toast.LENGTH_SHORT);
            return;
        }

        if(this.orderPageJson.amount.length == 0){
            Bestpay.Toast.makeText('请选择一期账单', Bestpay.Toast.LENGTH_SHORT);
            return;
        }

        if(this.noInputMoney && this.isMoney.getToEmptyValue().length >= 1){
            if(this.isMoney.getToEmptyValue()*1 == 0 ){
                Bestpay.Toast.makeText('预存金额不能输入0，请输入大于0的金额', Bestpay.Toast.LENGTH_SHORT);
                return;
            }else if(this.isMoney.getToEmptyValue()*1 < this.orderPageJson.amount*1){
                Bestpay.Toast.makeText('输入的金额不能小于应付金额', Bestpay.Toast.LENGTH_SHORT);
                return;
            }else{ 
            	//预存金额
            	self.orderPageJson.amount = self.isMoney.getToEmptyValue();
            }
        }

        if(this.orderPageJson.amount*1 == 0 && this.billInfo_stored+'' == '0'){
            Bestpay.Toast.makeText('应付金额为0时不能提交！', Bestpay.Toast.LENGTH_SHORT);
            return;
        }

        self.itJudgeLocalStorage = new UI.JudgeLocalStorage();
        self.itJudgeLocalStorage.checkOrder(self.orderPageJson['customerName'], self.orderPageJson.amount*1,HTTP.getCurrentTime(),function(){
            self.queryStart(); //查询开始
            //var total_amount = (($("#bills_total_amount").html())*1);
            var total_amount = self.orderPageJson.amount * 1;
            console.log("total_amount == " + total_amount);
            self.getCommission(total_amount, null);

            //成功的时候载入动画
            self.defferred.done(self.goPayAnimation);
        },self.businessName)
	 };

    /**
     *  按钮onclick事件初始化
     */
    SDMpay.prototype.setBottomAblely = function(able){
        var self = this;
        var btn_buy = $('#btn_buy');
        if(!!able){
            console.log("ablezzz");
            btn_buy.removeClass('btn_buyGray').addClass('btn_buyBlue');
            btn_buy.on('click',function() { //立即购买
            	console.log('gotobuy click!!!');
                self.gotobuy();
            });
        }else{
            console.log("unablezzz");
            btn_buy.removeClass('btn_buyBlue').addClass('btn_buyGray');
            btn_buy.off('click');
        }
    };

    SDMpay.prototype.btnInit = function(){
        var self = this;
        this.selectType();

        console.log("btnInit -------------")

        //选择城市
        document.getElementById('selectArea').onclick = function() {
            self.accepCityName = ""; //清空数据
            goTo(config.page.selectPage, function() {
                self.accepProvinceCode = "";
                $("#id_optionsBoxLeft").hide();
                $("#id_optionsBoxRight").hide();
                self.getAreaInfo();
            });
            if(self.selectCityName!==''){
                Bestpay.App.setTitle(self.selectCityName);
            }
        };
        //选择城市确定按钮
        document.getElementById('id_selectProBtn').onclick = function() {
            if(self.accepCityName == "") {
                Bestpay.Toast.makeText('请选择完整的所在地区', Bestpay.Toast.LENGTH_SHORT);
                return;
            }
            self.selectCityName = self.accepProvinceName + '' + self.accepCityName;
            self.selectCityCode = self.accepCityCode;
            //重新查询
            self.reCheck();
            back();
            self.getPartnerList();
        };
        //选择时间
        document.getElementById('id_select_data').onclick = function() {
            if(self.selectDateInit) { 
            	self.selectData = new UI.showDialogClass('showDateChoiceDialog', function(ager){
                	self.selectDate_arg = ager;
                	$("#id_show_calendar").html(ager);
                	self.selectDateInit = false;
                	//重新查询
                	self.reCheck();
            	});
            }else{ 
            	self.selectData = new UI.showDialogClass('showDateModifyDialog', function(ager){
            		self.selectDate_arg = ager;
            		$("#id_show_calendar").html(ager);
            		//重新查询
                	self.reCheck();
            	}, self.selectDate_arg);
            }
        };
        //账单查询按钮
        document.getElementById('btn_billInfo').onclick = function() {
        	self.checkBillCheck = false;
            self.billInfo_selectType =  $("#id_userNumber").data("spanCode")!=""&&$("#id_userNumber").data("spanCode")==$("#id_userNumber").val()?"002":"001";
            if(self.userNumber.getToEmptyValue().length == 0){
                Bestpay.Toast.makeText("请输入用户号", Bestpay.Toast.LENGTH_SHORT);
                return;
            }
            if(self.billInfo_selectPaymentCode == '' || self.billInfo_selectPaymentCode == null){
                Bestpay.Toast.makeText("请选择城市", Bestpay.Toast.LENGTH_SHORT);
                return;
            }
            if(self.selectCityName.indexOf("上海市") >= 0){
                self.userAmountInput_val = self.userAmountInput.getToEmptyValue();
                if(self.userAmountInput_val.length == 0){
                    Bestpay.Toast.makeText("请输入缴费金额!", Bestpay.Toast.LENGTH_SHORT);
                    return;
                }
            }

            showDialog(config.MSG.loading);
            self.getBillInfo();
        };
        /*$("#id_money").blur(function(){
            console.log("id_money is blur");
            if(config.CARD_TYPE.BANK_MODE_FUND_POOL_MEMBER_CARD !== self.userInfo.bankMode && $(this).val().replace(/\s/g,'').length != 0){
                var thisVal = $(this).val();
                if(thisVal != self.oldVal){
                    showDialog(config.MSG.loading);
                    self.getCommission(thisVal, function(val){
                        SDMpaySelf.orderPageJson['reward'] = val;
                        dismissDialog();
                    });
                    self.oldVal = thisVal;
                }
            }
        });*/
        //支付按钮
        document.getElementById('btn_buy').onclick = function(){
            self.gotobuy();
       };

    };

    /**
     * 选择缴费类型
     */
    SDMpay.prototype.selectType = function() {
        var self = this;
        var typeObj = document.getElementById('brg_Type');
        var allItem = $(typeObj).children();
        for(var i = 0; i < allItem.size(); i ++){
            allItem[i].onclick = function() {
                self.selectTypeVal = $(this).data('value')+'';
                console.log( 'select type :' + self.selectTypeVal);
                self.selectCityCode = self.userInfo.areaCode;
                self.selectCityName = HTTP.getLocalName();
                self.goToBillQueries();
            }
        }
    };

    /**
     * 跳到账单查询页面
     */
    SDMpay.prototype.goToBillQueries = function() {
        var self = this;
        if(self.userNumber == null)
        	var inputFunc = function(val){ 
        		if(!val.length){ 
					//重新查询
                	self.reCheck();
        		}
        	};
        	var funcClear = function() { 
        		//重新查询
                self.reCheck();
        	};
            self.userNumber = new UI.InputText('id_userNumber',"sanCode",inputFunc,funcClear);

        //切换水、电、煤  清空用户的历史操作数据
        self.selectCityCode = this.userInfo.areaCode;
        self.selectCityName = HTTP.getLocalName();
        self.billInfo_selectPaymentName = '';   //选择的收费单位的Name
        self.billInfo_selectPaymentCode = '';   //选择的收费单位的Code

        self.userAmountInput = new UI.InputText("id_userAmount","number",null,null,2);
        self.userAmountInput.clearValue();
        $("#id_Area").html("");
        var flatFeeObj = document.getElementById('id_flatFee');
        $(flatFeeObj).find('.item-out').html('<div>缴费单位 </div><div class="textIndent box-f1"></div>');
        self.getPartnerList();
        $("#id_show_calendar").html(Lang.getDate_YYYY_MM_DD());
        self.selectDateInit = true;
        //goTo(config.page.bill_queries,function(){
        //    self.userNumber.clearValue();
	     //   self.selectDateInit = true; //是否第一次选择日期
        //});
    };

    /**
     * 水电煤地市(本地业务) 查询接口
     */
    SDMpay.prototype.getPartnerList = function() {
        var self = this;
        //清空数据
        self.tollCompanyArray = new Array();
        self.tollCompanyJSON = {};
        self.userNumber.clearValue();
        if(self.flatFee != null){
            self.flatFee.clearDropDownBox();
        }
        HTTP.callCPSService({
            //'async' : true,
            'service' : config.CPS.SDM_PARTNER_LIST,
            'params' : self.partnerListParams(),
            'showLoading' : true,
            'success' : self.partnerListSuccessCallback
        });
    };

    /**
     * 水电煤地市(本地业务) 查询接口请求参数
     * @returns {{accepTareaCode: string, acceptDate: string}}
     */
    SDMpay.prototype.partnerListParams = function() {
        var customAreaCode = this.selectCityCode + '';
        //上海市崇明县会以3102开头，作特殊处理
        //北京市延庆县以1102开头，作特殊处理
        //天津市县级以1202开头，作特殊处理
        //重庆市县级以5002开头，作特殊处理
        if(customAreaCode.length == 6 && customAreaCode.indexOf("310") == 0 || customAreaCode.indexOf("110") == 0
             || customAreaCode.indexOf("120") == 0){ //|| customAreaCode.indexOf("500") == 0
            customAreaCode = customAreaCode.substring(0, 3) + "100";
        } else {
            //保存在userInfo中的区域编码是精确到区的，所以最后两位去掉加"00",精确到市即可
            if(customAreaCode.length == 6){
                customAreaCode = customAreaCode.substring(0, 4) + "00";
            }
        }
        var params = {
            "accepTareaCode" : customAreaCode,
            "acceptDate" : Lang.getDate_YYYYMMDD() + '' +Lang.getTime_HHMMSS()
        };
        params = HTTP.setCPSCommonParams(params);
        return params;
    };

    /**
     * 水电煤地市(本地业务) 查询接口成功回调
     * @param result
     */
    SDMpay.prototype.partnerListSuccessCallback = function(result) {
        if (result.code !== config.RES.SUCCESS) {
            Bestpay.Dialog.showAlertDialog('查询地市信息失败',result.content,'确定',result.code);
            return;
        }
        var paymentCompanyList = result.cities;
        var isGZ_Code = 0;
        if(paymentCompanyList.length > 0) {
            for(var i = 0; i < paymentCompanyList.length; i++){
                var busCode = paymentCompanyList[i].busCode;//获取类型编码
                var paymentName = paymentCompanyList[i].paymentName;//获取公司名称
                var paymentCode = paymentCompanyList[i].paymentCode;//缴费完整编码
                //过滤水电煤缴费公司
                if(busCode == WATER_BUSCODE && SDMpaySelf.selectTypeVal == '1') {
                    SDMpaySelf.tollCompanyArray.push(paymentCompanyList[i]);
                    SDMpaySelf.tollCompanyJSON[paymentName] = paymentCode;
                } else if(busCode == ELECTRIC_BUSCODE && SDMpaySelf.selectTypeVal == '2') {
                    SDMpaySelf.tollCompanyArray.push(paymentCompanyList[i]);
                    SDMpaySelf.tollCompanyJSON[paymentName] = paymentCode;
                    if(paymentCode+'' == GZ_ELECTRIC_CODE) { //广州电费特殊处理 (编码 4400004401002001)
                        isGZ_Code++;
                    }
                } else if(busCode == GASFARE_BUSCODE && SDMpaySelf.selectTypeVal == '3') {
                    SDMpaySelf.tollCompanyArray.push(paymentCompanyList[i]);
                    SDMpaySelf.tollCompanyJSON[paymentName] = paymentCode;
                } else if(busCode == HEATFARE_BUSCODE && SDMpaySelf.selectTypeVal == '4') {
                    SDMpaySelf.tollCompanyArray.push(paymentCompanyList[i]);
                    SDMpaySelf.tollCompanyJSON[paymentName] = paymentCode;
                }
            }
        }

        console.log("selectCityCode==" + SDMpaySelf.selectCityCode);

        //广州电费特殊处理 （编码 4400004401002001)
        if(isGZ_Code > 0 || SDMpaySelf.selectCityCode.toString().slice(0,4) == '5201'){
            $("#id_select_data").show();
        }else{
            $("#id_select_data").hide();
        }
        SDMpaySelf.initBillQueries();
    };

    /**
     * 初始化账单页面
     */
    SDMpay.prototype.initBillQueries = function(){
        $("#id_Area").html(this.selectCityName);

        var flatFeeObj = document.getElementById('id_flatFee');

        if(SDMpaySelf.tollCompanyArray.length > 1){
            flatFeeObj.onclick = function() {
                goTo(config.page.flatFee);
                SDMpaySelf.flatFee =new UI.dropDownBox('id_flatFee_show',this,SDMpaySelf.tollCompanyJSON,function(item,itemObj){
                    SDMpaySelf.billInfo_selectPaymentCode = item;
                    SDMpaySelf.billInfo_selectPaymentName = $(itemObj).html();
                    for(var i = 0; i < SDMpaySelf.tollCompanyArray.length; i++){
                        if(SDMpaySelf.tollCompanyArray[i].paymentCode == item){
                            SDMpaySelf.billInfo_stored = SDMpaySelf.tollCompanyArray[i].stored;
                        }
                    }
                    $(flatFeeObj).find('.item-out').html('<div>'+SDMpaySelf.billInfo_selectPaymentName+'</div>');
                    //重新查询
                	SDMpaySelf.reCheck();
                    SDMpaySelf.flatFee.clearDropDownBox();
                    back();
                },function(){
                    SDMpaySelf.flatFee.clearDropDownBox();
                    back();
                });
            };
            $(flatFeeObj).find('.btn-down').show();
            $(flatFeeObj).find('.item-out').html('<div>'+SDMpaySelf.tollCompanyArray[0].paymentName+'</div>');
        } else if(SDMpaySelf.tollCompanyArray.length ==1) {
            flatFeeObj.onclick = function() {};
            $(flatFeeObj).find('.btn-down').hide();
            $(flatFeeObj).find('.item-out').html('<div>缴费单位</div><div class="textIndent box-f1">' + SDMpaySelf.tollCompanyArray[0].paymentName + '</div>');
        } else {
            var message = "亲，很抱歉!" + this.selectCityName + "的" + config.page.bill_queries.title + "业务暂未开通，敬请期待哟!";
            Bestpay.Dialog.showAlertTwoBtnDialog('查询地市信息失败',message,'切换城市','取消','',function(code){
                console.log(code);
                if(code.toString() == '1'){
                    $("#selectArea").click();
                }else if(code.toString() == '2'){
                    back();
                }
            });
            return;
        }

        if(this.selectCityName.indexOf("上海市") >= 0){
            $("#id_userAmount_div").show();
            $("#id_div_tips_wrap").show();
        } else {
            $("#id_userAmount_div").hide();
            $("#id_div_tips_wrap").hide();
        }
        this.userAmountInput_val="";
        SDMpaySelf.billInfo_selectPaymentCode = SDMpaySelf.tollCompanyArray[0].paymentCode;
        SDMpaySelf.billInfo_selectPaymentName = SDMpaySelf.tollCompanyArray[0].paymentName;
        SDMpaySelf.billInfo_stored = SDMpaySelf.tollCompanyArray[0].stored;

    };

    /**
     * 水电煤账单查询接口
     */
    SDMpay.prototype.getBillInfo = function() {
        var self = this;
        HTTP.callCPSService({
            'async' : false,
            'service' : config.CPS.SDM_BILL_QUERY,
            'params' : self.billInfoParams(),
            'showLoading' : false,
            'success' : self.billInfoSuccessCallback
        });
    };

    /**
     * 水电煤账单查询接口 请求入参
     * @returns params JSON
     */
    SDMpay.prototype.billInfoParams = function() {
        var self =this;
        var acceptAreaCode = self.billInfo_selectPaymentCode.substring(6, 12);
        if(self.billInfo_selectPaymentCode == GZ_ELECTRIC_CODE || self.selectCityCode.toString().slice(0,4) == '5201'){
            self.billInfo_Month = $("#id_show_calendar").html().replace('-','');
        }else{
            self.billInfo_Month = '';
        }
        var params = {
            'acceptAreaCode' : acceptAreaCode,
            'acceptDate' : Lang.getDate_YYYYMMDD() + '' + Lang.getTime_HHMMSS(),
            'additem1' : self.billInfo_selectPaymentCode,
            'additem2' : self.userAmountInput_val,
            'billMonth' : self.billInfo_Month,
            'orderSeq' : HTTP.getOrderSeq,
            'selectType' : self.billInfo_selectType,
            'selectValue' : self.userNumber.getToEmptyValue()

        };
        params = HTTP.setCPSCommonParams(params);
        return params;
    };

    /**
     * 水电煤账单查询接口 成功回调
     */
    SDMpay.prototype.billInfoSuccessCallback = function(result) {
        if (result.code !== config.RES.SUCCESS) {
            if(result.code == "006913"){
                Bestpay.Dialog.showAlertDialog('处理失败',"该地市暂不支持水电煤缴费",'确定',result.code);
                return;
            }
            Bestpay.Dialog.showAlertDialog(config.TITLE.dialog_title, result.content,'确定',result.code);
            return;
        }

        SDMpaySelf.itMobile.clearValue();
        SDMpaySelf.isMoney.clearValue();

        SDMpaySelf.orderPageJson['paymentName'] = SDMpaySelf.billInfo_selectPaymentName;
        SDMpaySelf.orderPageJson['totalCount'] =  result.totalCount;
        SDMpaySelf.orderPageJson['systemNo'] =  result.systemNo;
        SDMpaySelf.orderPageJson['billStat'] =  result.billStat;

        if(result.bills.length  <= 0){
            var content = '没有查到交易记录';
            var code = '091124';
            Bestpay.Dialog.showAlertDialog('处理失败',content,'确定',code);
            return;
        }
        SDMpaySelf.orderPageJson['bills'] =  result.bills;
        //SDMpaySelf.orderPageJson['number'] =  result.bills.length;
        SDMpaySelf.orderPageJson['customerName'] =  result.bills[0].customerName;// 客户名称
        SDMpaySelf.orderPageJson['billNo'] =  result.bills[0].billNo;// 缴费单号
        var balance = result.bills[0].balance;
        if(balance*1 > 0){
            //$("#id_balance_item").show();
            SDMpaySelf.orderPageJson['balance'] = Lang.fen2yuan(balance);// 余额
        } else {
            //$("#id_balance_item").hide();
            SDMpaySelf.orderPageJson['balance'] =  "";// 余额
        }
        var billStat = result.billStat+'';
        /*if(billStat == '0' || billStat == '2' || billStat == '3'){
            //SDMpaySelf.orderPageJson['feePayment'] =  result.bills[0].billMonth;// 账期
        } else if(billStat == '1'){
        	var feePayment_billMonth = [];
        	for(var i = 0, len = result.bills.length; i<len; i++){ 
        		feePayment_billMonth.push(result.bills[i].billMonth);
        	}
            SDMpaySelf.orderPageJson['feePayment'] =  feePayment_billMonth.join("|");// 账期
            console.log("显示多笔一次缴完==" + SDMpaySelf.orderPageJson['feePayment']);
        }*/
        if(billStat == '0' || billStat == '1'){         //一次性缴费帐单状态
            REQUESTCODE = REQUEST_CODE_ONE_TIME_PAYMENT;
        }else if(billStat == '2' || billStat == '3'){   //多期帐单
            REQUESTCODE = REQUEST_CODE_SEVERAL_PAYMENT;
        }

        SDMpaySelf.initConfirm();
        //SDMpaySelf.openInitConfirm = true; //开启初始化确定订单界面流程
       // SDMpaySelf.orderPageJson['amount'] = Lang.fen2yuan(SDMpaySelf.getAmount());
		//SDMpaySelf.getCommission(Lang.fen2yuan(SDMpaySelf.getAmount()), null);
    };

    /**
     * 酬金查询
     */
    SDMpay.prototype.getCommission = function(amountVal, callback){
        HTTP.getCommission(config.BUS_TYPE.BUS_TYPE_SDM, config.BUS_CODE.SDM, config.BUS_CODE.SDM, amountVal, function(result) {
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

            if(callback != null){
                callback(retJson.commission);
            }else{
                SDMpaySelf.orderPageJson['reward'] = retJson.commission;
                

                	//走流程
			         console.log('SDMpaySelf.userInfo.authenStatus==' + SDMpaySelf.userInfo.authenStatus);
			        if(SDMpaySelf.userInfo.authenStatus == 'A02'){
			            //showDialog(config.MSG.loading);
			            console.log('SDMpaySelf.userInfo.hadEpt  '+SDMpaySelf.userInfo.hadEpt);
			            if (SDMpaySelf.userInfo.hadEpt == 1) {

			                SDMpaySelf.getFinancialProducts();   //企业理财用户理财产品列表接口(SEpt012)
			            } else {

			                SDMpaySelf.fundAccountBalanceInquiry();     //资金账户余额查询 SAcc003
			            }
			        }else{

			            SDMpaySelf.fundAccountBalanceInquiry();     //资金账户余额查询 SAcc003
			        }
                 
            }

        }, false);
    };

    /**
     * 获取 应付金额
     * @returns {string}
     */
    SDMpay.prototype.getAmount = function() {
        var txnAmount ="";
        var billStat = this.orderPageJson['billStat']+'';
        var bills = this.orderPageJson['bills'];
        if(billStat == "0" || billStat == "1"){
            var amount =0;
            for(var i = 0; i < bills.length; i++){
                amount = amount +  bills[i].billAmount*1 + bills[i].billDelay*1;
            }
            txnAmount = amount;
        }else if(billStat == "2"){
            txnAmount = bills[0].billAmount*1 + bills[0].billDelay*1;
        }else if(billStat == "3"){ 
        	txnAmount = bills[0].billAmount*1 + bills[0].billDelay*1;
        }
        console.log('酬金查询 总金额:' + txnAmount);
        return txnAmount;
    };

    /**
     * 初始化确定订单界面
     */
    SDMpay.prototype.initConfirm = function() {
    	var self = this;
        var billStat = this.orderPageJson['billStat']+'';
        /*if(billStat == "2" || billStat == "3"){
            $("#id_title_item").show();
            $("#id_fee_payment").show();
        }else if(billStat == "1"){
        	//显示多笔，一次缴完
        	$("#id_bills .confirm-option").css("visibility","hidden");
            $("#id_title_item").show();
            $("#id_fee_payment").hide();
        }else if(billStat == "0"){
            $("#id_title_item").hide();
            $("#id_fee_payment").hide();
        }*/

        //设置账期缴费类型
        //self.setBillStat(billStat);

        console.log("initConfirm==============");

    	var bills = this.orderPageJson['bills'];

    	$("#customerName").html(bills[0].customerName);// 客户名称
    	$("#number").html(bills.length+'个');

        for(var i = 0; i < bills.length; i++){
            bills[i].billAmount = Lang.fen2yuan(bills[i].billAmount);
            bills[i].billDelay = Lang.fen2yuan(bills[i].billDelay);
            bills[i].totalAmount = bills[i].billAmount*1 + bills[i].billDelay*1;
            bills[i].index = i;
        }
        var template = new UI.Template();
     	template.template_MoreToOne("id_bills", "id_bills_show" ,bills);

     	console.log("template成功")

        //设置账期缴费类型
        self.setBillStat(billStat);
        console.log("dismissDialog")

        self.setStored();
        SDMpaySelf.callQuickTradingQuery(); //免密交易查询接口
        dismissDialog();
        $("#btn_billInfo_wrap").hide();
        $("#billShow").show();
    };

    /*
     * 设置账期缴费类型
     */
    SDMpay.prototype.setBillStat = function(type){ 
    	var self = this;
    	if(type === '0'){ 
    		//单账单
    		//默认选中，用户可选择
    		self.setBillSelect('default');
    		self.setBillClick(true);

    	}else if(type === '1'){ 
    		//显示多笔，一次缴完
    		//全部选中，用户不可选择
    		self.setBillSelect('all');
    		self.setBillClick(false);
    		
    	}else if(type === "2"){
    		//显示多笔，按月缴费 
    		//默认选中，用户不可选择
    		self.setBillSelect('default');
    		self.setBillClick(false);
    			
    	}else if(type === "3"){ 
    		//显示多笔，随机缴费
    		//不选中，用户可选择
    		self.setBillSelect('none');
    		self.setBillClick(true);
    	}
    };

    /*
     * 设置选中账期
     * @param all - 全部选中
     * @param none -  不选中
     * @param default - 默认选中第一项
     */
    SDMpay.prototype.setBillSelect = function(type){ 
    	var self = this;
    	console.log("到选择项")
    	if(type === 'all'){ 
    		//全部选中
    		$(".radio").addClass('radio-on');
    		self.setAllBills();
    	}else if(type === 'none'){ 
    		//全部不选中
    		$(".radio").removeClass('radio-on');
    		self.orderPageJson['feePayment'] = '';
    		self.orderPageJson['amount'] = '';
    	}else if(type === 'default'){ 
    		//默认选中
    		$(".radio").removeClass('radio-on');
    		$(".radio").eq(0).addClass('radio-on');
    		self.setSingleBill(0);
    	}
    	console.log("选择成功")
    };

    /*
     * 选择账期事件
     * @param true - 可选择
     * @param false - 不可选择
     */
	SDMpay.prototype.setBillClick = function(type){ 
		var self = this;
		var index;
		if(type){ 
			//可选择
			$(".radio").on('click', function(){ 
				if($(this).hasClass('radio-on')){ return; }
				$(".radio").removeClass('radio-on');
				$(this).addClass('radio-on');
				index = $(this).data('code');
				self.setSingleBill(index);
			});
		}else{ 
			//不可选择
			$(".radio").off('click');
		}
	};

	/*
	 * 设置单个账期信息
	 * @index 账期的顺序
	 */
	SDMpay.prototype.setSingleBill = function(index){
		var self = this;
		var bills = this.orderPageJson['bills'];
		var index = index*1; 
		console.log("index==="+index) 
		var billMonth = bills[index].billMonth; //账期
		var billAmount = bills[index].billAmount; //欠费金额
		var billDelay = bills[index].billDelay; //滞纳金

		console.log('billAmount=='+billAmount)
		console.log('billDelay=='+billDelay)
		var totalAmount = billAmount*1 + billDelay*1;
		console.log('totalAmount=='+totalAmount)

		self.orderPageJson['feePayment'] = billMonth; //账期
		self.orderPageJson['amount'] = totalAmount; //应付金额(单位:元)
		$("#bills_total_amount").html(totalAmount.toFixed(2));

		console.log('feePayment==' + self.orderPageJson['feePayment']);
		console.log('amount==' + self.orderPageJson['amount']);
	};

	/*
	 * 设置全部账期信息
	 */
	SDMpay.prototype.setAllBills = function(){ 
		var self = this;
        var bills = this.orderPageJson['bills'];
        var totalAmount =0;

        for(var i = 0; i < bills.length; i++){
            totalAmount = totalAmount +  bills[i].billAmount*1 + bills[i].billDelay*1;
        }

        var feePayment_billMonth = [];
    	for(var i = 0, len = bills.length; i<len; i++){ 
    		feePayment_billMonth.push(bills[i].billMonth);
    	}
        self.orderPageJson['feePayment'] = feePayment_billMonth.join("|");// 账期
        self.orderPageJson['amount'] = totalAmount; //应付金额(单位:元)
        console.log("显示多笔一次缴完==" + self.orderPageJson['feePayment']);

        $("#bills_total_amount").html(totalAmount.toFixed(2));
	};


    //SDMpay.prototype.setSeeBtn = function(){
       // $("#id_confirm_eyes").click(function(){                 //显示酬金
           // $("#id_commission_item").toggleClass("show");
            //$(this).toggleClass("see-eyes");
        //});
        //$("#id_confirm_bills").click(function(){                //显示账期
            //$("#id_bills_show").toggleClass("show");
            //$(this).toggleClass("confirm-up");
        //});
    //};

    /**
     * 判断显示金额输入框
     */
    SDMpay.prototype.setStored = function(){
        if(this.billInfo_stored+'' == '0'){
            $("#id_money_out").hide();
            this.noInputMoney = false;
        }else{
            if(this.orderPageJson['amount']*1>0){
                $("#id_money").attr("placeholder", "缴纳金额:请输入");
            }else{
                $("#id_money").attr("placeholder", "预存金额:请输入");
            }
            $("#id_money_out").show();
            this.noInputMoney = true;
            this.callQuickTradingQuery();
        }
    };

    /**
     * 免密交易查询接口
     */
    SDMpay.prototype.callQuickTradingQuery = function() {
        var self = this;
        HTTP.callCPSService({
            'async' : false,
            'service' : config.CPS.QUICK_TRADING_QUERY,
            'params' : self.quickTradingQueryParams(),
            'showLoading' : true,
            'success' : self.quickTradingQuerySuccessCallback
        });
    };

    /**
     * 免密交易查询接口 构造请求参数
     */
    SDMpay.prototype.quickTradingQueryParams = function () {
        var params = {};
        params = HTTP.setCPSCommonParams(params);
        return params;
    };

    /**
     * 免密交易查询接口 成功回调函数
     */
    SDMpay.prototype.quickTradingQuerySuccessCallback = function (result) {
        if (result.code !== config.RES.SUCCESS) {
            Bestpay.Dialog.showAlertDialog('处理失败',result.content,'确定',result.code);
            return;
        }
        SDMpaySelf.quickTranInfo = {
            'perAmount' : result.perAmount,             // 单笔限额
            'allamount' : result.allamount,             // 累积限额
            'alltransaction' : result.alltransaction    // 累积消费
        };
        if(SDMpaySelf.IsNeedPassWord(Lang.yuan2fen(SDMpaySelf.orderPageJson.amount))){
            SDMpaySelf.noPwd = true;
        }else{
            SDMpaySelf.noPwd = false;
        }
    };


    SDMpay.prototype.IsNeedPassWord = function(amount) {
        var quickTranInfo = this.quickTranInfo;
        var self = this;
        console.log("amount : "+amount);
        console.log("quickTranInfo : "+JSON.stringify(quickTranInfo));
        if(amount*1 <= 1*quickTranInfo.perAmount && (amount*1 + 1*quickTranInfo.alltransaction) <= 1*quickTranInfo.allamount){
            //	免密
            console.log('免密');
            return false;
        } else {
            //	加密
            console.log('加密');
            return true ;
        }
    };

    /**
     * 3.13企业理财用户理财产品列表查询(SEpt012)
     */
    SDMpay.prototype.getFinancialProducts = function(){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.FINANCIAL_PRODUCTS,
            'params' : self.getFinancialProductsParams(),
            'showLoading' : false,
            'success' : self.getFinancialProductsSuccessCallback
        });
    };

    /*企业理财用户理财产品列表查询 请求参数*/
    SDMpay.prototype.getFinancialProductsParams = function () {
        var self = this;
        var params = {};
        params = HTTP.setCPSCommonParams(params);
        return params;
    };

    /**
     * 企业理财用户理财产品列表查询 成功回调函数
     */
    SDMpay.prototype.getFinancialProductsSuccessCallback = function (result) {
		if (result.code !== config.RES.SUCCESS) {
			if(result.code === '018888'){ 
				SDMpaySelf.fundAccountBalanceInquiry(); //资金账户余额查询 SAcc003
				return;
			}else{ 
				Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
				return;
			}
		}
        var list = result['datas'];//用户产品列表
        for(var i=0;i<list.length;i++)
        {
            SDMpaySelf.orderPageJson['productId'] =list[i]['productId']; //产品ID
            SDMpaySelf.orderPageJson['userId'] =list[i]['userId']; //userId
            SDMpaySelf.orderPageJson['tyb_amount'] = Lang.fen2yuan(list[i]['balance']); //添益宝余额
        }

        SDMpaySelf.fundAccountBalanceInquiry();     //资金账户余额查询 SAcc003
    };
    

    /**
     * 42) 资金账户余额查询 SAcc003
     */
    SDMpay.prototype.fundAccountBalanceInquiry = function(){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.CCOUNT_BALANCE_QUERY,
            'params' : self.fundAccountBalanceInquiryParams(),
            'showLoading' : false,
            'success' : self.fundAccountBalanceInquirySuccessCallback
        });
    };

    /*资金账户余额查询 请求参数*/
    SDMpay.prototype.fundAccountBalanceInquiryParams = function () {
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
    SDMpay.prototype.fundAccountBalanceInquirySuccessCallback = function (result) {
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
                    SDMpaySelf.orderPageJson['jfy_amount'] =  Lang.fen2yuan(activeBalance);
                    break;
                }
            }
        }
        if(config.CARD_TYPE.BANK_MODE_FUND_POOL_MEMBER_CARD === SDMpaySelf.userInfo.bankMode){
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
			
            SDMpaySelf.orderPageJson['jfy_amount'] = Lang.fen2yuan(sub_bankMode);
            console.log("子卡＝＝＝＝SDMpaySelf.orderPageJson['jfy_amount']=="+SDMpaySelf.orderPageJson['jfy_amount']);
        }

       //成功
	   SDMpaySelf.queryEnd();
    };




    /**
     * 立即支付按钮事件
     */
    /*SDMpay.prototype.gotoRecharge = function(){
        var self = this;
        config.isBack = function(){
          back();
        };
        HTTP.getRandomServices(function(result){
            var retJson = result;
            //未找到酬金结算方式，不进行酬金计算, 也当做成功了，酬金为零
            if (result.code === config.RES.SUCCESS) {
                SDMpaySelf.random = result.randNum;
                SDMpaySelf.setBottomAblely(false);// 支付按钮可用true   支付按钮不可用false
            }else{
                SDMpaySelf.setBottomAblely(true);// 支付按钮可用true   支付按钮不可用false
            }
            SDMpaySelf.getSDMRecharge();
        },false);
    };*/

    /**
     * 支付接口
     */
    SDMpay.prototype.getSDMRecharge = function(val) {
        var self = this;
        HTTP.callCPSService({
            'async' : false,
            'service' : config.CPS.SDM_PAY_BILL,
            'params' : self.SDMRechargeParams(val),
            'showLoading' : true,
            'success' : self.SDMRechargeSuccessCallback
        });
    };

    /**
     * 支付接口 请求参数
     */
    SDMpay.prototype.SDMRechargeParams = function(val) {
        var self =this;
        var valStr = "";
        if(val != null && val != ""){
            valStr = val;
        }
        var params = {
            'systemNo' : self.orderPageJson.systemNo,
            'orderSeq' : HTTP.getOrderSeq(),
            'acceptDate' : Lang.getDate_YYYYMMDD() + '' +Lang.getTime_HHMMSS(),
            'operPassword' : Bestpay.Security.encryptPassword(self.userInfo.staffCode,valStr,self.random),
            'cashOrder' : self.orderPageJson.feePayment,
            'cashType' : self.cashType,
            'cashNumber' : self.orderPageJson.billNo,
            'operUser' : self.userInfo.staffCode
        };
        var storedAmount = self.isMoney.getToEmptyValue();
        if(self.billInfo_stored == '0'){
            params['txnAmount'] = Lang.yuan2fen(self.orderPageJson.amount);
        }else if(self.billInfo_stored == '1' && storedAmount.length > 0){
            params['txnAmount'] = Lang.yuan2fen(storedAmount);
        }else if(self.billInfo_stored == '1' && storedAmount.length == 0){
            params['txnAmount'] = Lang.yuan2fen(self.orderPageJson.amount);
        }
        if(self.userInfo.hadEpt.toString()== '1'){
            params.costWay = self.paymentPlugin.getPayType();
            params.productId = self.productId;
            params.userId =self.orderPageJson['userId'] ;
        }
        console.log("支付接口 出参 == " + JSON.stringify(params));
        params = HTTP.setCPSCommonParams(params);
        return params;
    };

    /**
     *  支付接口 请求成功出参
     */
    SDMpay.prototype.SDMRechargeSuccessCallback = function(result) {
        if (result.code !== config.RES.SUCCESS) {
            if(result.code === config.RES.MONEY_NOT_ENOUGH){
                Bestpay.Dialog.showAlertDialog(config.TITLE.no_repeat,config.RES.MONEY_NOT_ENOUGH_MSG,'确定',result.code,function(code){
                    back();
                    SDMpaySelf.itJudgeLocalStorage.putLocalValue("","","","");
                });
                return;
            }
            if(result.code == "009002" || result.code == "006751") { 
            	SDMpaySelf.paymentPlugin.setOrderDisplay('overtime'); //超时
				goTo(config.page.page_float);
				return;
			}
            if(result.code == config.RES.PASSWORD_ERROR_LOCKED_002136){ //输入密码错误次数超过三次，退出app
                Bestpay.Dialog.showAlertDialog(config.TITLE.no_repeat, result.content,'确定',result.code,function(code){
                    App.exitCompleteApp();
                    SDMpaySelf.itJudgeLocalStorage.putLocalValue("","","","");
                });
            }
            Bestpay.Dialog.showAlertDialog(config.TITLE.dialog_title, result.content,'确定',result.code,function(code){
                back();
                SDMpaySelf.itJudgeLocalStorage.putLocalValue("","","","");
            });
            return;
        }

        SDMpaySelf.itJudgeLocalStorage.putLocalValue("","","","");

        var mobile_val = SDMpaySelf.itMobile.getToEmptyValue();
        if (mobile_val.length > 0){
            HTTP.sendSmsCertificate(result.content, mobile_val, '');//交易凭证短信下发
        }

        SDMpaySelf.paymentPlugin.setOrderDisplay('success'); //成功
        goTo(config.page.float_dia);

        config.isBack = function(){
            if(window.jqXHR.readyState > 2) {   //window.jqXHR.readyState 判断请求有没有发出去
                Bestpay.App.exitApp();
            }
        };
    };

    /**
     * 选择省市页面 获取开通的省市接口
     */
    SDMpay.prototype.getAreaInfo = function() {
        var self = this;
        HTTP.callCPSService({
            'async' : false,
            'service' : config.CPS.COALWATERINFO_QUERY,
            'params' : self.areaInfoParams(),
            'showLoading' : true,
            'success' : self.areaInfoSuccessCallback
        });
    };

    /**
     * 获取开通的省市接口 请求入参
     * @returns {{areaCode: (String), payType: (String)}}
     */
    SDMpay.prototype.areaInfoParams = function() {
        var params = {
            "areaCode" : SDMpaySelf.accepProvinceCode,
            "payType" : SDMpaySelf.selectTypeVal
        };
        params = HTTP.setCPSCommonParams(params);
        return params;
    };

    /**
     * 获取开通的省市接口 成功回调
     * @param result
     */
    SDMpay.prototype.areaInfoSuccessCallback = function(result) {
        if (result.code !== config.RES.SUCCESS) {
            Bestpay.Toast.makeText(result.content + '(' + result.code + ')', Bestpay.Toast.LENGTH_SHORT);
            return;
        }
        var orders=result.orders;
        var optionsBoxLeftHTML="";
        for(var i=0;i<orders.length;i++){
            var objJson=orders[i];
            optionsBoxLeftHTML+='<span data-code="'+objJson.areaCode+'">'+objJson.areaName+'</span>';
        }
        if(SDMpaySelf.accepProvinceCode == "") {
            $("#id_optionsBoxLeft").html(optionsBoxLeftHTML);
            $("#id_optionsBoxLeft").show();
            SDMpaySelf.getProvinceCode();
        } else {
            $("#id_optionsBoxRight").html(optionsBoxLeftHTML);
            $("#id_optionsBoxRight").show();
            SDMpaySelf.getCityCode();
        }
    };

    /**
     * 省份列表事件
     */
    SDMpay.prototype.getProvinceCode = function() {
        $("#id_optionsBoxLeft span").each(function() {
            $(this).on("click",function(){
                SDMpaySelf.accepProvinceCode = $(this).data('code');
                SDMpaySelf.accepProvinceName = $(this).html();
                Bestpay.App.setTitle(SDMpaySelf.accepProvinceName);
                $("#id_optionsBoxLeft .selectSpan").removeClass("selectSpan");
                $(this).addClass("selectSpan");
                SDMpaySelf.getAreaInfo();
            });
        });
    };

    /**
     * 城市列表事件
     */
    SDMpay.prototype.getCityCode = function() {
        var self = this;
        $("#id_optionsBoxRight span").each(function() {
            $(this).on("click",function(){
                SDMpaySelf.accepCityCode = $(this).data('code');
                SDMpaySelf.accepCityName = $(this).html();
                Bestpay.App.setTitle(SDMpaySelf.accepProvinceName + SDMpaySelf.accepCityName);
                $("#id_optionsBoxRight .selectSpan").removeClass("selectSpan");
                $(this).addClass("selectSpan");


                self.selectCityName = self.accepProvinceName + '' + self.accepCityName;
                self.selectCityCode = self.accepCityCode;
                //重新查询
                self.reCheck();
                back();
                self.getPartnerList();


            });
        });
    };

    return SDMpay;
});