define(['jquery', 'bestpay.ui', 'bestpay.lang', 'bestpay.http'], function($, UI, Lang, HTTP) {

	var phoneRechareSelf = null;
	var doc = document;

	function PhoneRechare() {
		phoneRechareSelf = this;
		this.userInfo = JSON.parse(Bestpay.User.getSuccessLoginInfo());
		console.log("userInfo=============" + JSON.stringify(userInfo));
		this.payType = "0"; //0是交费易     1是添益宝
		this.random = null; //随机数
		this.itMobile = null; //手机号码 input
		this.phoneNumber = null;
		this.phoneNumber3G = null; //3G
		this.random = null; //随机数
		this.Recharge_Money = null; //充值金额
		this.other_money = null; //其他充值金额
		this.isInputOther = null; //判断输入框的显示
		this.actionCode = null;
		this.quickTranInfo = {};
		this.SPhn004custName = ""; //四川归属地的 custName
		this.SPhn004amount = ""; //四川归属地的 amount
        this.ifrefush = "";
		this.ErrorNotice = {
			"notice": "未能查询到运营商",
			"tokenLost": "请您重新登陆",
			"errorPwd": "请输入6-12位支付密码",
			"noPwd": "请输入您的支付密码"
		};
		this.ErrorPhone = false; //充话费 手机号
		this.flow_ErrorPhone = false; //充 流量 手机号
		this.needPwd = true; //是否需要输入支付密码
		this.YYS_FLAG = false; //查询到运营商标示 false 未能 true 查到
        this.phonetrueoffalse = true;
		/**
		 * 充值号码类型
		 * 03010008 手机充值电信
		 * 04010011 手机充值移动
		 * 04010010 手机充值联通
		 * @param {Object} event
		 */
		this.RECHARGETYPE = "";
		this.BusiCode = {
			"TEL_TELECOM": "03010008", //手机充值电信
			"TEL_MOBILE_QX": "04010011", //手机充值移动
			"TEL_UNICOM_QX": "04010010" //手机充值联通
		};
		this.orderPageJson = {}; //订单页面JSON
		this.successJson = {}; //成功订单JSON
		this.rechargeAmount = null; //充值应该收的金额溢价
		this.quickTranInfo =null;
		this.checkBillCheck = false;     //检查订单
		this.rechargeData = {};         //交费易添益宝充值数据
        this.productId = '0030001';
        this.temrefush = false;
		this.selectMoney = null ;
		this.defferred = null;
		this.selectPayType = '0';	//  手机充值 0       流量充值 1
		this.selectPhoneMoneyList = null ;
		this.businessName = '充话费';

		//流量充值  参数
		this.phone_number = null ;
		this.phone_number_val = null ;
		this.mRechargeFlow = "300";
		this.pecProductCode = '';
		this.deviceInfo = JSON.parse(Bestpay.App.getDeviceInfo());
        this.clientVersion = this.deviceInfo.clientVersion.replace(/\./g,'') * 1; //版本号
        this.systemType = this.deviceInfo.systemType.toLowerCase(); //系统系统类型
        this.flow_Data = null; 
        this.ChinaTelecom_Data = [
        	{'M':'10M', 'Y':'2元', 'V':'10'},
        	{'M':'30M', 'Y':'5元', 'V':'30'},
        	{'M':'60M', 'Y':'10元', 'V':'60'},
        	{'M':'100M', 'Y':'10元', 'V':'100'},
        	{'M':'150M', 'Y':'20元', 'V':'150'},
        	{'M':'200M', 'Y':'15元', 'V':'200'},
        	{'M':'300M', 'Y':'30元', 'V':'300'},
        	{'M':'500M', 'Y':'30元', 'V':'500'},
        	{'M':'1G', 'Y':'50元', 'V':'1024'}
        ];
        this.ChinaMobile_Data = [
        	{'M':'10M', 'Y':'3元', 'V':'10'},
        	{'M':'30M', 'Y':'5元', 'V':'30'},
        	{'M':'70M', 'Y':'10元', 'V':'70'},
        	{'M':'500M', 'Y':'30元', 'V':'500'},
        	{'M':'1G', 'Y':'50元', 'V':'1024'},
        	{'M':'2G', 'Y':'70元', 'V':'2048'},
        	{'M':'3G', 'Y':'100元', 'V':'3072'},
        	{'M':'4G', 'Y':'130元', 'V':'4096'},
        	{'M':'6G', 'Y':'180元', 'V':'6144'}
        ];
        this.ChinaUnicom_Data = [
        	{'M':'20M', 'Y':'3元', 'V':'20'},
        	{'M':'50M', 'Y':'6元', 'V':'50'},
        	{'M':'100M', 'Y':'10元', 'V':'100'},
        	{'M':'200M', 'Y':'15元', 'V':'200'},
        	{'M':'500M', 'Y':'30元', 'V':'500'}
        ];
        this.GridList = null; //流量包选择列表
        this.verify = null; //权监类型
        this.actionName = null;
        this.mTxnAmount = null;
        this.provinceCode = null; //号码归属
	};

	/**
	 * 初始化应用
	 */
	PhoneRechare.prototype.initApp = function() {
		config.TRADE_LIST_QUERY_TYPE = config.BUS_TYPE.BUS_TYPE_TEL;
		var self = this;
		self.itJudgeLocalStorage = new UI.JudgeLocalStorage();
		goTo(config.page.main, function() {
			var inputFunc = function(val) {
				
				console.log("ronggang = "+val + " "+ val.length);
				if (val.length > 0) {
					//doc.getElementById('brg_amount').onclick =function() {
					//		Bestpay.Toast.makeText('输入其他金额时无法选择', Bestpay.Toast.LENGTH_SHORT);
					//};

					//self.brgAmount.setDisabled(true);
					self.other_money = val;
					//console.log(self.other_money + "==========================")
				} else {
					doc.getElementById('brg_amount').onclick =  self.selectMoney;
					//self.brgAmount.setDisabled(false);
					self.other_money = null;
				}
			}
			var funcClear = function() {
				//self.brgAmount.setDisabled(false);
				doc.getElementById('brg_amount').onclick =  self.selectMoney;
				self.other_money = null;
			};
			var inputing = function(str) {
				if (str.length == 11) {
//			    	$("#Mobile").blur();
                    var input = document.getElementById('Mobile');
                    var val = input.value;
                    input.focus();
                    input.value = '';
                    input.value = val;
					phoneRechareSelf.phoneNumber = str;
                    $("#contactInfo").html('').hide();
                    $('#loading_phone').show(); //小小的loading，手机归属地的位置
                    phoneRechareSelf.phonetrueoffalse = false;
                    console.log('33333'); 
					doc.getElementById('brg_amount').onclick =self.selectMoney;
					//查询手机归属地
					phoneRechareSelf.getMobileNoTrack(str);
				}else{
					$("#payName_amount_parent55").hide();
					//moblieClear();
				}
			};
			var moblieClear = function(val) {
				$("#payName_amount_parent55").hide();
				$("#contactInfo").html('').hide();
				//self.brgAmount.setDisabled(false);
				doc.getElementById('brg_amount').onclick =self.selectMoney;

				self.phone_amount.clearValue();
				$("#selfNet").hide();
				self.phoneNumber = null;
				self.other_money = null;
				if((self.systemType === 'android' && self.clientVersion >= 403) || (self.systemType === 'ios' && self.clientVersion >= 402)){
					if(val == null){
						NumberKeyBoard.keyNum = "";
					}
				}
			};

			var inputing_g = function(str){
				if (str.length == 11) {
                    var input = document.getElementById('phone_number');
                    var val = input.value;
                    input.focus();
                    input.value = '';
                    input.value = val;
                    //置空流量包列表
					
                    $("#contactInfo_g").html('').hide();
                    $('#loading_phone_g').show(); //小小的loading，手机归属地的位置

					phoneRechareSelf.phoneNumber3G = str;

					//查询手机归属地
					phoneRechareSelf.getMobileNoTrack(str);
				}
			};

			var moblieClear_g = function(val) {
				$("#contactInfo_g").html('').hide();
				//隐藏流量充值按钮
				$("#flowbtn").hide();
				if(!!self.GridList){ 
					//置空流量包列表
					$("#flow_list_wrap").html('');
					//清空提示
					$("#tip_change").html('');
				}
				if((self.systemType === 'android' && self.clientVersion >= 403) || (self.systemType === 'ios' && self.clientVersion >= 402)){
					if(val == null){
						NumberKeyBoard.keyNum = "";
					}
				}
			};

			self.phone_amount = new UI.InputText('phone_amount', 'number', inputFunc, funcClear); //充值5-500金额  直冲
			self.itMobile = new UI.InputText('Mobile', 'phone', inputing, moblieClear); //输入手机号码
			self.phone_number = new UI.InputText('phone_number', 'phone', inputing_g, moblieClear_g);
			

			
			console.log("clientVersion=="+self.clientVersion)
            if((self.systemType === 'android' && self.clientVersion >= 403) || (self.systemType === 'ios' && self.clientVersion >= 402)){
            	//数字键盘
				$("#Mobile").on('click',function(){ 
					NumberKeyBoard.initPwdId("Mobile", inputing, moblieClear , 11 , 'close');
					NumberKeyBoard.InitnumKeyboard();
				});

				$("#phone_number").click(function(){ 
					NumberKeyBoard.initPwdId("phone_number", inputing_g, moblieClear_g, 11 , 'close');
					NumberKeyBoard.InitnumKeyboard();
				});
            }


			self.selectPhoneMoneyList = {
				//'10元':'10',
				'30元':'30',
				'50元':'50',
				'100元':'100',
				//'200元':'200',
				'300元':'300',
				'500元':'500'
			}
			self.btnInit();
		});
	};

	/**
	 *  按钮onclick事件初始化
	 */
	PhoneRechare.prototype.btnInit = function() {
		var self = this;

		//切换 手机 流量 充值
		self.selectType = new UI.BlockRadioGroup('select_pay', 'full_phone',function(param){
			self.selectPayType = param ; //  手机充值 0       流量充值 1
			if((self.systemType === 'android' && self.clientVersion >= 403) || (self.systemType === 'ios' && self.clientVersion >= 402)){
				NumberKeyBoard.HidenumKeyboard();
			}
			if(param == '0'){
				$("#phone_type").show();
				$("#flow_type").hide();
				self.businessName = '充话费';
			}else{
				$("#phone_type").hide();
				$("#flow_type").show();
				self.businessName = '充流量';
			}
		});

		/*document.getElementById('brg_amount_g').onclick =function(){
			$('#page_select_type').html('');
			goTo(config.page.select_type);
			var phoneRechareDiaLog =  new UI.dropDownBox(
				"page_select_type",
				this,
				{
					'60M':'MB60',
					'150M':'MB150',
					'300M':'MB300'
				},
				function(key, obj) {
					//隐藏弹出框
					phoneRechareDiaLog.clearDropDownBox();
					var val = $(obj).text();
					$('#brg_amount_val_g').html(val);
					self.initDatas(key);
					back();
				}, function() {
					back();
				});
		};*/

		self.brgAmount = '50';

		//选择手机充值金额
		self.selectMoney =  function() {
			var thisObj = this;
			$('#page_select_money').html('');
			goTo(config.page.select_money);
			self.phoneRechareDiaLog =  new UI.dropDownBox(
				"page_select_money",
				this,
				self.selectPhoneMoneyList,
				function(key, obj) {
					//隐藏弹出框
					self.phoneRechareDiaLog.clearDropDownBox();
					if(key == '0'){
						$("#select_amount_list").hide();
						$("#phone_amount").show();
						back();
						self.isInputOther = true;
						thisObj.onclick=null;

						return ;
					}
					self.isInputOther = false;
					$("#select_amount_list").show();
					$("#phone_amount").hide();
					var val = $(obj).text();
					$('#brg_amount_val').html(val);
					self.brgAmount = key ;
					back();
				}, function() {
					back();
				});
		};

		doc.getElementById('brg_amount').onclick =self.selectMoney;


		document.getElementById('btn_next_g').onclick = function () {
			self.checkBillCheck = false;
			self.validation();
		};

		document.getElementById('btn_next').onclick = function() { //下一步
            if(phoneRechareSelf.phonetrueoffalse == true){
                self.checkBillCheck = false;
                self.temrefush = false; //姓名余额刷新
                self.verdify(); //验证手机充值金额
            }
		};
	};

	/**
	 *  手机归属地查询 SPhn004
	 */
	PhoneRechare.prototype.getMobileNoTrack = function(str) {
		var self = this ;

		//置空流量包列表
		$("#flow_list_wrap").html('');
		
		if(self.selectPayType == '0'){
			$('#Mobile').attr('readonly',true);
		}else{
			$('#phone_number').attr('readonly',true);
		}

		if((self.systemType === 'android' && self.clientVersion >= 403) || (self.systemType === 'ios' && self.clientVersion >= 402)){
        	//隐藏键盘
			NumberKeyBoard.HidenumKeyboard();
        }

		HTTP.callCPSService({
			'service': config.CPS.PHONE_AREA,
			'params': self.mobileNoTrackParams(),
			'showLoading': false,
            'isNoSuccess':self.rmobileNoTrackisNoSuccessCallback,
	        'setTime': 600000,
			'success': self.rmobileNoTrackSuccessCallback,
			'error': self.mobileNoTrackErrorCallback
		});
	};
	/**
	 * 手机归属地查询 SPhn004 构造请求参数
	 */
	PhoneRechare.prototype.mobileNoTrackParams = function() {
		var self = this;
		var params = {
			"type": "50",  //1:固话；3:宽带；50:手机；
            "isQryUserInfo": "Y"  //Y：查询  ，其他都不查询
		};

		if(self.selectPayType == '0')
			params.phone = self.phoneNumber;
		else
			params.phone = self.phoneNumber3G;
			//params.phone = self.phone_number.getToEmptyValue();
		params = HTTP.setCPSCommonParams(params);
		console.log("手机归属地查询 SPhn004入参=======" + JSON.stringify(params));
		return params;
	};
	//
	//    /**
	//     * 手机归属地查询 SPhn004 成功回调函数
	//     */
    PhoneRechare.prototype.rmobileNoTrackisNoSuccessCallback = function(result){
		if(phoneRechareSelf.selectPayType == '0' ){
			$('#loading_phone').hide(); //小小的loading，手机归属地的位置
			$('#Mobile').attr('readonly',false);
		} else {
			$('#loading_phone_g').hide(); //小小的loading，手机归属地的位置
			$('#phone_number').attr('readonly', false);
		}
    }

    PhoneRechare.prototype.rmobileNoTrackSuccessCallback = function(result) {
		console.log("手机归属地查询 SPhn004出参========" + JSON.stringify(result));
        $('#loading_phone').hide(); //小小的loading，手机归属地的位置
		$('#loading_phone_g').hide(); //小小的loading，手机归属地的位置
        $('#payName_parent_img').attr('src','../lib/img/ic_refresh2.png');
        $('#payamout_parent_img').hide();
        $('#Mobile').attr('readonly',false);
		$('#phone_number').attr('readonly', false);

		if (result.code === '000000') {
			phoneRechareSelf.actionName = result.actionName;
			phoneRechareSelf.provinceCode = result.actionCode;
			phoneRechareSelf.SPhn004custName = result.custName;
			phoneRechareSelf.SPhn004amount = result.amount;
            phoneRechareSelf.ifrefush = result.ifrefush;
            phoneRechareSelf.queryType = result.queryType;

            if(phoneRechareSelf.selectPayType == '1') {
            	//do 流量包 function
            	$("#contactInfo_g").show();
            	if (!phoneRechareSelf.actionName) {
					$("#contactInfo_g").html(phoneRechareSelf.ErrorNotice['notice']);
					phoneRechareSelf.flow_ErrorPhone = false;
					return ;
            	}else{ 
					$("#contactInfo_g").html(result.provinceName + result.cityName + phoneRechareSelf.actionName);
					//显示流量充值按钮
					$("#flowbtn").show();
					phoneRechareSelf.flow_ErrorPhone = true;
					
            		if('1000' === phoneRechareSelf.provinceCode){ //电信号码

            			phoneRechareSelf.flow_Data = phoneRechareSelf.ChinaTelecom_Data;
            			phoneRechareSelf.orderPageJson['prodCode'] = '00000098';  //电信流量
            			phoneRechareSelf.orderPageJson['rechargeType_flow'] = 1;
            			$("#tip_change").html('提示 ：<br>1.即时生效，当月结束后失效。<br>2.其中60M、150M、300M自充值之日起90天内有效。');

            		}else if('3000' === phoneRechareSelf.provinceCode){ //移动号码

            			phoneRechareSelf.flow_Data = phoneRechareSelf.ChinaMobile_Data;
            			phoneRechareSelf.orderPageJson['prodCode'] = '00000100';  //移动流量
            			phoneRechareSelf.orderPageJson['rechargeType_flow'] = 2;
            			$("#tip_change").html('提示 ：<br>即时生效，当月结束后失效。');

            		}else if('2000' === phoneRechareSelf.provinceCode){  //联通号码

            			phoneRechareSelf.flow_Data = phoneRechareSelf.ChinaUnicom_Data;
            			phoneRechareSelf.orderPageJson['prodCode'] = '00000099';  //联通流量
            			phoneRechareSelf.orderPageJson['rechargeType_flow'] = 3;
            			$("#tip_change").html('提示 ：<br>即时生效，当月结束后失效。');

            		}

            		var html = [];
            		for(var i = 0,len = phoneRechareSelf.flow_Data.length; i < len; i++){ 
        				html[i] = '';
        				html[i] += '<div>' + phoneRechareSelf.flow_Data[i].M + '</div>';
        				html[i] += '<div class="font14">' + phoneRechareSelf.flow_Data[i].Y + '</div>';
        			}

	            	phoneRechareSelf.GridList = new UI.GridList(html, 2);
					var GridList_html = phoneRechareSelf.GridList.getHTML();
					document.getElementById("flow_list_wrap").appendChild(GridList_html);
				}

            }else{ 
            	//do 手机充值 function
            	$("#contactInfo").show();
            	if (!phoneRechareSelf.actionName) {
					$("#contactInfo").html(phoneRechareSelf.ErrorNotice['notice']);
					phoneRechareSelf.ErrorPhone = false;
	           	    phoneRechareSelf.phonetrueoffalse = false;
            	}else{ 
					$("#contactInfo").html(result.provinceName + result.cityName + phoneRechareSelf.actionName);
					phoneRechareSelf.ErrorPhone = true;
	           	    phoneRechareSelf.phonetrueoffalse = true;
            	}

                $("#payName_parent").find("span").html(phoneRechareSelf.SPhn004custName); //刷新显示姓名
				$("#payamout_parent").find("span").html(phoneRechareSelf.SPhn004amount); //刷新显示余额

				//显示余额姓名
				if(phoneRechareSelf.SPhn004custName && phoneRechareSelf.SPhn004amount && (phoneRechareSelf.actionName.indexOf('电信') > 0) ){
					$("#payName_amount_parent55").show();
				}else{
					$("#payName_amount_parent55").hide();
				}
				phoneRechareSelf.phone_amount.clearValue(); //清空其他金额


				//$('#brg_amount_val').html("50元");

				
				console.log("provinceCode==" + phoneRechareSelf.provinceCode);
				phoneRechareSelf.selectPhoneMoneyList = {
				//'10元':'10',
					'30元':'30',
					'50元':'50',
					'100元':'100',
				//'200元':'200',
					'300元':'300',
					'500元':'500'
				}

				if ('1000' === phoneRechareSelf.provinceCode) { //返回的结果为电信号码则显示其他输入金额
					phoneRechareSelf.selectPhoneMoneyList = {
					//'10元':'10',
						'30元':'30',
						'50元':'50',
						'100元':'100',
					//'200元':'200',
						'300元':'300',
						'500元':'500',
						'其他金额':"0"
					}
					phoneRechareSelf.phone_amount.clearValue(); //清空其他金额
					phoneRechareSelf.RECHARGETYPE = phoneRechareSelf.BusiCode['TEL_TELECOM'];
					phoneRechareSelf.pecProductCode = '00000008';
				} else if ('3000' === phoneRechareSelf.provinceCode) { //返回的结果为移动号码

					phoneRechareSelf.phone_amount.clearValue(); //清空其他金额
					phoneRechareSelf.RECHARGETYPE = phoneRechareSelf.BusiCode['TEL_MOBILE_QX'];
					phoneRechareSelf.pecProductCode = '00000009';

					$("#select_amount_list").show();
					$("#phone_amount").hide();
				} else if ('2000' === phoneRechareSelf.provinceCode) { //返回的结果为联通号码

					phoneRechareSelf.selectPhoneMoneyList = {
					//'10元':'10',
						'30元':'30',
						'50元':'50',
						'100元':'100',
					//'200元':'200',
						'300元':'300',
						'500元':'500'
					}
					phoneRechareSelf.phone_amount.clearValue(); //清空其他金额
					phoneRechareSelf.RECHARGETYPE = phoneRechareSelf.BusiCode['TEL_UNICOM_QX'];
					phoneRechareSelf.pecProductCode = '00000010';

					$("#select_amount_list").show();
					$("#phone_amount").hide();
				} else {
					phoneRechareSelf.phone_amount.clearValue(); //清空其他金额
					$("#contactInfo").html(phoneRechareSelf.ErrorNotice['notice']);
					$("#select_amount_list").show();
					$("#phone_amount").hide();
					return;
				}
            }

			
		} else {
            $('#loading_phone').hide(); //小小的loading，手机归属地的位置
			$('#loading_phone_g').hide(); //小小的loading，手机归属地的位置
            console.log('ddeeeeeeeeeee');
			if(phoneRechareSelf.selectPayType == '0') {
				$("#contactInfo").show();
				$("#contactInfo").html(phoneRechareSelf.ErrorNotice['notice']);
			}else{
				$("#contactInfo_g").show();
				$("#contactInfo_g").html(phoneRechareSelf.ErrorNotice['notice']);
			}
		}
	};

	/**
	 * 手机归属地查询 SPhn004 失败回调函数
	 */
	PhoneRechare.prototype.mobileNoTrackErrorCallback = function(result) {
		if(phoneRechareSelf.selectPayType == '0') {
			$('#loading_phone').hide(); //小小的loading，手机归属地的位置
			$("#contactInfo").show();
			$("#contactInfo").html(phoneRechareSelf.ErrorNotice['notice']);
			$('#Mobile').attr('readonly', false);
		}else{
			$('#loading_phone_g').hide(); //小小的loading，手机归属地的位置
			$("#contactInfo_g").show();
			$("#contactInfo_g").html(phoneRechareSelf.ErrorNotice['notice']);
			$('#phone_number').attr('readonly', false);
		}
	};

	/*
	 * 弹出框
	 */
	PhoneRechare.prototype.alertDoubleBtn = function(id1, id2, id3, id4, msg, msg1, callback1, callback2) {
		document.getElementById(id1).style.display = "block";
		document.getElementById(id2).innerHTML = msg;
		document.getElementById(id3).innerHTML = msg1;
		document.getElementById(id3).onclick = function() {
			callback1();
		}
		document.getElementById(id4).onclick = function() {
			callback2();
		}
	};

	/**
	 * 跳转到登陆界面
	 */
	PhoneRechare.prototype.back1 = function() {
		Bestpay.User.login();
	}

	/**
	 * 退出客户端
	 */
	PhoneRechare.prototype.back2 = function() {
		Bestpay.App.exitCompleteApp();
	}

	/*
	 * 验证手机 充值金额
	 */
	PhoneRechare.prototype.verdify = function() {
		var self = this;
		var actionCode = null;
        var moblie = self.itMobile.getToEmptyValue();

		console.log("phoneRechareSelf.ErrorPhone==========================="+phoneRechareSelf.ErrorPhone)
		if (moblie == null || moblie.length == 0) {
			Bestpay.Toast.makeText('请输入手机号码', Bestpay.Toast.LENGTH_SHORT);
			return;
		} else if (moblie.length >= 1 && moblie.length < 11) {
			Bestpay.Toast.makeText('您输入的手机号码长度错误', Bestpay.Toast.LENGTH_SHORT);
			return;
		} else if (!phoneRechareSelf.ErrorPhone) {
			Bestpay.Toast.makeText('请输入正确的手机号码', Bestpay.Toast.LENGTH_SHORT);
			return;
		}

		//获取充值金额
		self.Recharge_Money = self.brgAmount;
		if(self.isInputOther == true && self.phone_amount.getToEmptyValue().length == 0 ){
			Bestpay.Toast.makeText('请输入5—500元的整数充值金额', Bestpay.Toast.LENGTH_SHORT);
			return;
		}
		if (self.other_money && $("#phone_amount").val().length > 0 ) {
			if(self.other_money < 5 || self.other_money > 500){ 
				Bestpay.Toast.makeText('请输入5—500元的整数充值金额', Bestpay.Toast.LENGTH_SHORT);
				return;
			}
			//获取其他充值金额
			self.Recharge_Money = self.other_money;
		}


		self.itJudgeLocalStorage.checkOrder(self.itMobile.getToEmptyValue(), self.Recharge_Money ,HTTP.getCurrentTime(),function(){
			console.log('123moblie = ' + moblie);
			console.log('123self.Recharge_Money = ' + self.Recharge_Money);
			console.log('123self.getCurrentTime  = ' + HTTP.getCurrentTime());

			if (self.RECHARGETYPE == self.BusiCode['TEL_TELECOM']) {
				self.actionCode = self.BusiCode['TEL_TELECOM'];
			} else {
				self.actionCode = self.phoneNumber;
			}
			//溢价查询
			self.getPremium();
		},self.businessName);
	};


	/**
	 * 溢价查询               
	 */
	PhoneRechare.prototype.getPremium = function() {
		//showDialog(config.MSG.loading);

		var self = this;
        HTTP.callCPSService({
			'service': config.CPS.PREMIUM_QUERY,
			'params': self.getPremiumQueryParams(),
			'showLoading': false,
			'success': self.getPremiumQuerySuccessCallback
		});
	};

	/**
	 * 溢价查询 构造请求参数     
	 */
	PhoneRechare.prototype.getPremiumQueryParams = function() {
		var self = this;
		var params = {
			"actionCode": self.actionCode,
            "faceAmount": Lang.yuan2fen(self.Recharge_Money),
            "phone": self.phoneNumber,
            "prodCode": "003"
		};
		params = HTTP.setCPSCommonParams(params);
		console.log("溢价查询" + JSON.stringify(params));
		return params;
	};

	/**
	 * 溢价查询 成功回调函数            
	 */
	PhoneRechare.prototype.getPremiumQuerySuccessCallback = function(resJson) {

		console.log("溢价查询回调----------------->" + JSON.stringify(resJson));
		//快捷交易查询start
		if ('000000' == resJson.code) {
			var retFaceAmount = resJson.amount;
			var retPremium = resJson.concession;
			phoneRechareSelf.rechargeAmount = retFaceAmount * 1 + retPremium * 1; //充值应该收的金额溢价之后
			console.log("rechargeAmount------------->" + phoneRechareSelf.rechargeAmount);

			//免密交易信息没有查好，先执行免密交易信息
			phoneRechareSelf.queryStart(); //查询开始
			phoneRechareSelf.callQuickTradingQuery();
			//成功的时候载入动画
			phoneRechareSelf.defferred.done(phoneRechareSelf.goPayAnimation);
		} else if (config.RES.TOKEN_DISABLE == resJson['code']) { //token lost
			dismissDialog();
			phoneRechareSelf.alertDoubleBtn("ch_alert", "chalertmsg", "chAlertBtn", "chAlertBackBtn1",
				phoneRechareSelf.ErrorNotice['tokenLost'], "确定", phoneRechareSelf.back1, phoneRechareSelf.back2);
			return;
		} else {
			dismissDialog();
			Bestpay.Dialog.showAlertDialog('提醒', resJson.content, '确定', resJson.code, function() {
				App.exitApp();
			});
		}
	};


	/**
	 * 免密交易查询接口                            免密的接口
	 */
	PhoneRechare.prototype.callQuickTradingQuery = function() {
		// alert("免密");
		var self = this;
		HTTP.callCPSService({
			'service': config.CPS.QUICK_TRADING_QUERY, //接口名称 免密交易查询接口 SQtran003
			'params': self.quickTradingQueryParams(), //接口的入参
			'showLoading': false, //是否显示dialog框
			'success': self.quickTradingQuerySuccessCallback
		});
	};

	/**
	 * 免密交易查询接口 构造请求参数                免密的入参
	 */
	PhoneRechare.prototype.quickTradingQueryParams = function() {
		var self = this;
		self.userInfo = JSON.parse(Bestpay.User.getSuccessLoginInfo());
		var params = {};
		params = HTTP.setCPSCommonParams(params);
		console.log("免密交易查询接口入参" + JSON.stringify(params));
		// alert("免密的入参");
		return params;
	};

	/**
	 * 免密交易查询接口 成功回调函数               免密的回调函数callback
	 */
	PhoneRechare.prototype.quickTradingQuerySuccessCallback = function(result) {
		if (result.code !== config.RES.SUCCESS) {
			Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
			return;
		}
		//返回值成功 000000
		console.log("免密交易查询接口出参" + JSON.stringify(result));
		phoneRechareSelf.quickTranInfo = {
			'perAmount': result.perAmount,
			'allAmount': result.allamount,
			'allTransAction': result.alltransaction
		};
		phoneRechareSelf.handleIsneedpassword();
	};

	/**
	 * 判断要不要输入密码    要传递的信息passMap  put进一个是否需要输入密码的值
	 * @param amount 要充值的金额（以元为单位）
	 */
	PhoneRechare.prototype.handleIsneedpassword = function() {
		var self = this;

		//  alert("免密判断是否输入密码");
		var quickTranInfo = self.quickTranInfo;

		var amount = Lang.yuan2fen(self.Recharge_Money);
		
		console.log("amount : " + amount);
		console.log("quickTranInfo : " + JSON.stringify(quickTranInfo));
		if (amount * 1 <= 1 * quickTranInfo.perAmount && (amount * 1 + 1 * quickTranInfo.allTransAction) <= 1 * quickTranInfo.allAmount) {
			//	免密
			phoneRechareSelf.noPwd = false;
		} else {
			//	加密
			phoneRechareSelf.noPwd = true;
		}

		//酬金查询（流量包也走酬金）
		phoneRechareSelf.getCommission();
	
	};

	/**
	 *  酬金查询
	 */
	PhoneRechare.prototype.getCommission = function() {
		var self = this;
		var productCode = "";
		var objCode = "";
		var actionCode = "";

		if(self.selectPayType == '1'){ //流量充值
			if(self.verify == 1){ 
				//3G流量卡
				actionCode = '03010020';
				productCode = '0042';
				self.pecProductCode = '00000033';
			}else{ 
				//新流量包
				actionCode = '01010165';
				if(self.verify == 4){ //电信
					productCode = '001250';
					self.pecProductCode = '00000098';
				}else if(self.verify == 5){ //联通
					productCode = '001251';
					self.pecProductCode = '00000099';
				}else if(self.verify == 6){ //移动
					productCode = '001252';
					self.pecProductCode = '00000100';
				}
			}

			objCode = self.phone_number.getToEmptyValue();
		}else{ //手机充值
			if(self.RECHARGETYPE == self.BusiCode['TEL_TELECOM']){
				productCode = self.BusiCode['TEL_TELECOM']
			}else{
				productCode = self.phoneNumber;
			}
			actionCode = self.RECHARGETYPE;
			objCode = self.phoneNumber;
		}

		console.log("---酬金查询---");
		HTTP.getCommission(config.BUS_TYPE.BUS_TYPE_TEL, actionCode, productCode, self.Recharge_Money, function(result) {
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
			self.orderPageJson['supplyCode'] = retJson.supplyCode;
			phoneRechareSelf.orderPageJson['rewardType'] = 'reward';

	        if(phoneRechareSelf.userInfo.authenStatus == 'A02'){
	            if (phoneRechareSelf.userInfo.hadEpt == 1) {
	                phoneRechareSelf.getFinancialProducts(); //企业理财用户理财产品列表接口(SEpt012)
	            } else {
	                phoneRechareSelf.fundAccountBalanceInquiry(); //资金账户余额查询 SAcc003
	            }
	        }else{
	            phoneRechareSelf.fundAccountBalanceInquiry(); //资金账户余额查询 SAcc003
	        }

		}, false, '', phoneRechareSelf.pecProductCode, objCode);
	};




	/**
	 * 折价查询接口
	 */
	PhoneRechare.prototype.SDiscQuery = function() {
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
	PhoneRechare.prototype.SDiscQueryParams = function() {
		var self = this;
		var params = { 
			'rechAmount': Lang.yuan2fen(self.mTxnAmount),   //订单金额
			'pecProduct': self.orderPageJson['prodCode']
		};
		params = HTTP.setCPSCommonParams(params);
		console.log("折价查询SDISCQUERY 入参==");

		return params;
	};

	/**
	 * 折价查询接口 成功回调函数
	 */
	PhoneRechare.prototype.SDiscQuerySuccessCallback = function(result) {
		if (result.code !== config.RES.SUCCESS) {
			Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
			return;
		}
		phoneRechareSelf.orderPageJson['supplyCode'] = result.supplyCode;
		phoneRechareSelf.orderPageJson['reward'] = Lang.fen2yuan(result.discAmount); //酬金
		phoneRechareSelf.orderPageJson['rewardType'] = 'zhejia';
		
		if(phoneRechareSelf.userInfo.authenStatus == 'A02'){
            if (phoneRechareSelf.userInfo.hadEpt == 1) {
                phoneRechareSelf.getFinancialProducts(); //企业理财用户理财产品列表接口(SEpt012)
            } else {
                phoneRechareSelf.fundAccountBalanceInquiry(); //资金账户余额查询 SAcc003
            }
        }else{
            phoneRechareSelf.fundAccountBalanceInquiry(); //资金账户余额查询 SAcc003
        }
	};

	
	/**
	 * 3.13企业理财用户理财产品列表查询(SEpt012)
	 */
	PhoneRechare.prototype.getFinancialProducts = function() {
		var self = this;
		HTTP.callCPSService({
			'service': config.CPS.FINANCIAL_PRODUCTS,
			'params': self.getFinancialProductsParams(),
			'showLoading': false,
			'success': self.getFinancialProductsSuccessCallback
		});
	};

	/*企业理财用户理财产品列表查询 请求参数*/
	PhoneRechare.prototype.getFinancialProductsParams = function() {
		var self = this;
		var params = {};
		params = HTTP.setCPSCommonParams(params);
		return params;
	};

	/**
	 * 企业理财用户理财产品列表查询 成功回调函数
	 */
	PhoneRechare.prototype.getFinancialProductsSuccessCallback = function(result) {
		console.log('012进来-------------');
        //dismissDialog();
		if (result.code !== config.RES.SUCCESS) {
			if(result.code === '018888'){ 
				phoneRechareSelf.fundAccountBalanceInquiry(); //资金账户余额查询 SAcc003
				return;
			}else{ 
				Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
				return;
			}
		}
		console.log('012成功 show  bbb');
        $("#payfortianyibao").show();
		console.log("企业理财用户理财产品列表 出参===" + JSON.stringify(result));
		var list = result['datas']; //用户产品列表
		for (var i = 0; i < list.length; i++) {
			phoneRechareSelf.orderPageJson['productId'] = list[i]['productId']; //产品ID
			phoneRechareSelf.orderPageJson['userId'] = list[i]['userId']; //userId
			phoneRechareSelf.orderPageJson['tyb_amount'] = Lang.fen2yuan(list[i]['balance']); //添益宝余额
		}

		phoneRechareSelf.fundAccountBalanceInquiry(); //资金账户余额查询 SAcc003
	};


	/**
	 * 42) 资金账户余额查询 SAcc003
	 */
	PhoneRechare.prototype.fundAccountBalanceInquiry = function() {
		var self = this;
		HTTP.callCPSService({
			'service': config.CPS.CCOUNT_BALANCE_QUERY,
			'params': self.fundAccountBalanceInquiryParams(),
			'showLoading': false,
			'success': self.fundAccountBalanceInquirySuccessCallback
		});
	};

	/*资金账户余额查询 请求参数*/
	PhoneRechare.prototype.fundAccountBalanceInquiryParams = function() {
		var self = this;
		var params = {
			'bankMode': self.userInfo.bankMode
		};
		params = HTTP.setCPSCommonParams(params);
		console.log("资金账户余额查询 SAcc003入参=======" + JSON.stringify(params));
		return params;
	};

	/**
	 * 资金账户余额查询 成功回调函数
	 */
	PhoneRechare.prototype.fundAccountBalanceInquirySuccessCallback = function(result) {
		if (result.code !== config.RES.SUCCESS) {
			Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
			return;
		}
		console.log("资金账户余额查询 SAcc003出参=======" + JSON.stringify(result));
		var dayLimit = result['dayLimit']; //日限额
		var dayTotal = result['dayTotal']; //日总额
		var dayLimit_dayTotal = dayLimit * 1 - dayTotal * 1; //当日限额 - 当日累积
		var monthLimit = result['monthLimit']; //月限额
		var monthTotal = result['monthTotal'];
		var monthLimit_monthTotal = monthLimit * 1 - monthTotal * 1; //当月限额 - 当月累积
		var motherBoard = result['motherBoard']; //母卡余额
		var list = result['accountItems'];
		for (var i = 0; i < list.length; i++) {
			var acct = list[i]['acctType'];
			if (acct != null || acct != "null" || acct != "undefined" || acct != "") {
				if ("0007" == acct) { //0001：基本账户;0007：IPOS账户;0110：酬金账户
					var activeBalance = list[i].activeBalance; //账户可用余额
					phoneRechareSelf.orderPageJson['jfy_amount'] = Lang.fen2yuan(activeBalance);
					console.log("普通卡＝＝phoneRechareSelf.orderPageJson['jfy_amount']==" + phoneRechareSelf.orderPageJson['jfy_amount']);
					break;
				}
			}
		}
		if (config.CARD_TYPE.BANK_MODE_FUND_POOL_MEMBER_CARD === phoneRechareSelf.userInfo.bankMode) {
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

			phoneRechareSelf.orderPageJson['jfy_amount'] = Lang.fen2yuan(sub_bankMode);
			console.log("子卡＝＝＝＝phoneRechareSelf.orderPageJson['jfy_amount']==" + phoneRechareSelf.orderPageJson['jfy_amount']);
		}
		console.log("啊＝＝＝＝phoneRechareSelf.orderPageJson['jfy_amount']==" + phoneRechareSelf.orderPageJson['jfy_amount']);


		if(phoneRechareSelf.selectPayType == '0') {
			phoneRechareSelf.initConfirm(); //订单初始化
			phoneRechareSelf.queryEnd();
		}else{
			phoneRechareSelf.getVerifyResp(); //账号验证
		}
	};



	/*
	 * 查询开始
	 */
	PhoneRechare.prototype.queryStart = function(){
		var self = this;
		//新建一个延迟对象
		self.defferred = $.Deferred();
		showDialog(config.MSG.loading);
	};

	/*
	 * 查询结束
	 * 去订单页面
	 */
	PhoneRechare.prototype.queryEnd = function(){
		var self = this;
		console.log(JSON.stringify(self.orderPageJson));
		var pluginParam = {
			businessName:self.businessName,
			accountName: '手机充值', //[string] 充值账号名称
			accouontValue: self.orderPageJson['phone'], //[string] 充值账号值
			rechargeMoney:  self.orderPageJson['rechargeMoney'], //[string] 充值金额(元)
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
		//var paymentPlugin = new UI.paymentPlugin(pluginParam);
		//支付方式 0交费易 1添益宝
		self.paymentPlugin = new UI.paymentPlugin(pluginParam);
		//成功
		dismissDialog();
		goTo(config.page.comfirm,function(){});
		self.defferred.resolve();
	};

	/*
	 * 显示订单页面动画
	 */
	PhoneRechare.prototype.goPayAnimation = function() {
		console.log("done=========================")
		$("#order_comfirm").removeClass("backPayAnimation").addClass('goPayAnimation');
	};

	/**
	 * 初始化确定订单界面
	 */
	PhoneRechare.prototype.initConfirm = function() {
		var self = this;
		//===
		console.log("订单页面初始化");
		self.orderPageJson['phone'] = self.itMobile.getValue();
		var custName = self.SPhn004custName;
		var amount = self.SPhn004amount;
		var ifrefush = self.ifrefush;
		var queryType = self.queryType;

		console.log("custName==" + custName);
		console.log('amount==' + amount);

		self.orderPageJson['name'] = self.SPhn004custName;
		self.orderPageJson['bill'] = self.SPhn004amount;
		if (self.selectPayType == '0') {
			self.orderPageJson['rechargeMoney'] = (self.Recharge_Money * 1).toFixed(2);
		} else {
			//===
			console.log("订单页面初始化");
			self.orderPageJson['phone_number'] = self.phone_number.getToEmptyValue();
			self.orderPageJson['phone'] = self.phone_number.getValue();
			var custName = self.SPhn004custName;
			var amount = self.SPhn004amount;
			var ifrefush = self.ifrefush;
			var queryType = self.queryType;


			self.orderPageJson['rechargeMoney'] = (self.mTxnAmount*1).toFixed(2);
		}
		self.orderPageJson['gather'] = (self.rechargeAmount / 100).toFixed(2);
	};

	/**
	 * 触发立即充值
	 */
	PhoneRechare.prototype.gotoOrder = function(val) {
		var self = this ;
		HTTP.getRandomServices(function(result) {
			var retJson = result;
			//未找到酬金结算方式，不进行酬金计算, 也当做成功了，酬金为零
			if (result.code === config.RES.SUCCESS) {
				phoneRechareSelf.random = result.randNum;
			}
			if(phoneRechareSelf.selectPayType == '0'){
				phoneRechareSelf.rechargeResp(val); //千行手机充值接口
			}else if(phoneRechareSelf.selectPayType == '1'){
				console.log("verify=================" + phoneRechareSelf.verify)
				if(phoneRechareSelf.verify >= 4){ 
					//流量包充值
					phoneRechareSelf.flowRecharge(val);
				}else{
					//3G流量卡 
					phoneRechareSelf.rechargeResp_g(val);
				}
			}
		}, false);
	};

	/**
	 *  千行手机充值接口
	 */
	PhoneRechare.prototype.rechargeResp = function(val) {

		var self = this;
		HTTP.callCPSService({
			'service': config.CPS.PHONE_CHARGE,
			'params': self.rechargeParams(val),
			'showLoading': true,
			'success': self.rechargeSuccessCallback,
			'error': self.rechargeErrorCallback
		});
	};

	/**
	 * 千行手机充值接口 构造请求参数
	 */
	PhoneRechare.prototype.rechargeParams = function(val) {
		var self = this;
		var valStr = "";
		if(val != null && val != ""){
			valStr = val;
		}
		var params = {
			"payPassword": Bestpay.Security.encryptPassword(self.userInfo.staffCode,valStr,self.random),
			"phone": self.phoneNumber,
			"rechargeAmount": Lang.yuan2fen(self.Recharge_Money),
			"rechargeType": self.RECHARGETYPE,
			"tradeTime": Lang.getDate_YYYYMMDD() + '' + Lang.getTime_HHMMSS(),
			"txnAmount": self.rechargeAmount,
			"supplyCode": self.orderPageJson['supplyCode']
		};
		if(phoneRechareSelf.userInfo.hadEpt == 1){
			params.costWay = self.paymentPlugin.getPayType();
			params.productId = self.productId;
			params.userId = self.orderPageJson['userId'];
            console.log("self.orderPageJson['userId']" + self.orderPageJson['userId']);
		}
		params = HTTP.setCPSCommonParams(params);
		console.log("千行手机充值接口 入参=======" + JSON.stringify(params));
		return params;
	};

	/**
	 * 千行手机充值接口 成功回调函数
	 */
	PhoneRechare.prototype.rechargeSuccessCallback = function(result) {
		if (result.code !== config.RES.SUCCESS) {
			if (result.code == config.RES.MONEY_NOT_ENOUGH) {
				Bestpay.Dialog.showAlertDialog(config.TITLE.no_repeat,config.RES.MONEY_NOT_ENOUGH_MSG,'确定',result.code,function(code){
					back();
				});
				return;
			}
			if(result.code == "009002" || result.code == "006751") {
				phoneRechareSelf.paymentPlugin.setOrderDisplay('overtime');
				goTo(config.page.float_dia);
				return;
			}
			if(config.ResultMSG[result.code] != null){
				Bestpay.Dialog.showAlertDialog('处理失败',config.ResultMSG[result.code],'确定',result.code,function(){
					back();
                });
				return;
			}
			if (result.code == config.RES.PASSWORD_ERROR_LOCKED_002136) { //输入密码错误次数超过三次，退出app
				Bestpay.Dialog.showAlertDialog(config.TITLE.no_repeat, result.content,'确定',result.code,function(){
					App.exitCompleteApp();
				});
			} else {
				Bestpay.Dialog.showAlertDialog(config.TITLE.no_repeat,result.content,'确定',result.code,function(){
					back();
				});
			}
			return;
		}
		if (phoneRechareSelf.phoneNumber.length > 0) {
			 HTTP.sendSmsCertificate(result.transSeq, phoneRechareSelf.phoneNumber, ''); //交易凭证短信下发
		}


		phoneRechareSelf.paymentPlugin.setOrderDisplay('success');
		goTo(config.page.float_dia);

        console.log('phoneRechareSelf.payType==' + phoneRechareSelf.payType);
        if(phoneRechareSelf.payType == "1"){
            console.log('tianyibao pay ABC');
            App.updateTybRereshFlag();
            console.log('tianyibao pay ABC222');
        }
        config.isBack = function(){
            if(window.jqXHR.readyState > 2) {   //window.jqXHR.readyState 判断请求有没有发出去
                Bestpay.App.exitApp();
            }
        };
	};

	/**
	 * 千行手机充值接口 失败回调函数
	 */
	PhoneRechare.prototype.rechargeErrorCallback = function(result) {
		if (result.code === config.RES.MONEY_NOT_ENOUGH) {
			Bestpay.Dialog.showAlertDialog('提醒', '账号余额不足', '确定', config.RES.MONEY_NOT_ENOUGH, function() {
              back();
			});
			return;
		}
	};


	/**
	 * 选择不同 tab 对应的 value
	 * @param checkedId
	 
	PhoneRechare.prototype.initDatas = function(checkedId) {
		var self = this;
		switch (checkedId) {
			case 'MB60':
				self.mRechargeFlow = "60";
				self.mTxnAmount = "10";
				break;
			case'MB150':
				self.mRechargeFlow = "150";
				self.mTxnAmount = "20";
				break;
			case 'MB300':
				self.mRechargeFlow = "300";
				self.mTxnAmount = "30";
				break;
		}
	};*/

	/**
	 * 点击“下一步”按钮，
	 */
	PhoneRechare.prototype.validation = function(){
		var self = this;
		var phone_val = this.phone_number.getToEmptyValue();
		var phoneStr = Lang.getPhoneOperators(phone_val);

		console.log("phone_val=="+phone_val);
		if(phone_val.length == 0){
			Bestpay.Toast.makeText("手机号不能为空！", Bestpay.Toast.LENGTH_SHORT);
			return;
		} else if(phone_val.length > 0 && (phone_val.length < 11 || phone_val.length > 11)){
			Bestpay.Toast.makeText("您输入的手机号码长度错误！", Bestpay.Toast.LENGTH_SHORT);
			return;
		} else if (!phoneRechareSelf.flow_ErrorPhone) {
			Bestpay.Toast.makeText('请输入正确的手机号码', Bestpay.Toast.LENGTH_SHORT);
			return;
		}
		var index = self.GridList.getIndex();
		//权监类型 0:个人账户 1：3G流量充值   2: 全国电信宽带充值   3：全国电信固话充值   4: 流量包；
		if('1000' === self.provinceCode){ //电信
			if(index == '2' || index == '4' || index == '6'){
				self.verify = 1;
			}else{
				self.verify = 4;
			}
		}else if('3000' === self.provinceCode){ //移动
			self.verify = 6;
		}else if('2000' === self.provinceCode){ //联通
			self.verify = 5;
		}
		console.log("index========" + index)
		console.log("provinceCode========" + self.provinceCode)
		console.log("verify========" + self.verify)
		//流量包充值金额
		self.mTxnAmount = (self.flow_Data[index].Y).replace("元","");
		self.Recharge_Money = self.mTxnAmount;

		self.itJudgeLocalStorage.checkOrder(phone_val,self.Recharge_Money,HTTP.getCurrentTime(),function(){
			self.queryStart(); //查询开始
			self.callQuickTradingQuery(); //免密交易查询接口
			phoneRechareSelf.defferred.done(phoneRechareSelf.goPayAnimation);
		},self.businessName);
	};

	/**
	 * 账号验证
	 */
	PhoneRechare.prototype.getVerifyResp = function(){
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
	 * veriType 验证号码类型    0:个人账户 1：3G流量充值   2: 全国电信宽带充值   3：全国电信固话充值   4: 流量包；
	 * this.trafficCardNUM    固话:03010100 宽带:03010200
	 */
	PhoneRechare.prototype.getVerifyRespParams = function () {
		var self = this;
		var params = {
			'verify' : self.verify,               //鉴权类型
			'acctCode' : this.phone_number.getToEmptyValue(), //验证号码（加受理区域编码）
			'reamount' : Lang.yuan2fen(this.mTxnAmount), //充值金额
			'acceptDate' : Lang.getDate_YYYYMMDD(), //受理日期
			'acceptTime' : Lang.getTime_HHMMSS()    //受理时间
		};
		params = HTTP.setCPSCommonParams(params);
		console.log("账号验证 入参=======" + JSON.stringify(params));
		return params;
	};

	/**
	 * 账号验证接口 成功回调函数
	 */
	PhoneRechare.prototype.getVerifyRespSuccessCallback = function (result) {
		if (result.code !== config.RES.SUCCESS) {
			Bestpay.Dialog.showAlertDialog(config.TITLE.dialog_title, result.content,'确定',result.code);
			return;
		}

		var index = phoneRechareSelf.GridList.getIndex();

		phoneRechareSelf.orderPageJson['content'] = result.content; //所在城市
		phoneRechareSelf.orderPageJson['systemNo'] = result.systemNo;
		phoneRechareSelf.orderPageJson['tradeSeq'] = result.tradeSeq;
		phoneRechareSelf.orderPageJson['flag'] = result.flag;
		phoneRechareSelf.orderPageJson['custName'] = result.custName;
		phoneRechareSelf.orderPageJson['amount'] = result.amount;
		phoneRechareSelf.orderPageJson['queryType'] = result.queryType;
		phoneRechareSelf.orderPageJson['flow'] = phoneRechareSelf.flow_Data[index].V;
		phoneRechareSelf.orderPageJson['mTxnAmount'] = (phoneRechareSelf.mTxnAmount*1).toFixed(2);
		phoneRechareSelf.orderPageJson['phone_number'] = phoneRechareSelf.phone_number.getToEmptyValue();
		phoneRechareSelf.initConfirm(); //订单初始化
		phoneRechareSelf.queryEnd();
	};




	/**
	 *  充值接口
	 */
	PhoneRechare.prototype.rechargeResp_g = function(val){
		var self = this;
		HTTP.callCPSService({
			'service' : config.CPS.FLOW_3G_CARD,
			'params' : self.rechargeParams_g(val),
			'showLoading' : true,
			'success' : self.rechargeSuccessCallback_g
		});
	};

	/**
	 * 充值接口 构造请求参数
	 */
	PhoneRechare.prototype.rechargeParams_g = function (val) {
		var self = this;

		var valStr = "";
		if(val != null && val != ""){
			valStr = val;
		}
		// rechareType 和 verify 都是默认值
		var params = {
			'orderNo' : HTTP.getOrderSeq(),
			'phone' : self.orderPageJson.phone_number,
			'rechargeFlow' : self.orderPageJson.flow,
			'rechargeType' : '001', // 001 ：直冲
			'verify' : '01',
			'payPassword' :Bestpay.Security.encryptPassword(self.userInfo.staffCode,valStr,self.random),
			'systemNO' : self.orderPageJson.systemNo,
			'tradeTime' : Lang.getDate_YYYYMMDD() + '' + Lang.getTime_HHMMSS(),
			'txnAmount' : Lang.yuan2fen(self.orderPageJson.mTxnAmount)
		};
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
	PhoneRechare.prototype.rechargeSuccessCallback_g = function (result) {
		if (result.code !== config.RES.SUCCESS) {
			if(result.code === config.RES.MONEY_NOT_ENOUGH){
				Bestpay.Dialog.showAlertDialog(config.TITLE.no_repeat,config.RES.MONEY_NOT_ENOUGH_MSG,'确定',result.code,function(code){
					back();
					phoneRechareSelf.itJudgeLocalStorage.putLocalValue("","","","");
				});
				return;
			}
			if(result.code == "009002" || result.code == "006751") {
				phoneRechareSelf.paymentPlugin.setOrderDisplay('overtime');
				goTo(config.page.float_dia);
				return;
			}

			if(result.code == config.RES.PASSWORD_ERROR_LOCKED_002136){ //输入密码错误次数超过三次，退出app
				Bestpay.Dialog.showAlertDialog(config.TITLE.no_repeat, result.content,'确定',result.code,function(){
					App.exitCompleteApp();
					phoneRechareSelf.itJudgeLocalStorage.putLocalValue("","","","");
				});
			}
			Bestpay.Dialog.showAlertDialog(config.TITLE.no_repeat, result.content,'确定',result.code,function(){
				back();
				phoneRechareSelf.itJudgeLocalStorage.putLocalValue("","","","");
			});
			return;
		}

		phoneRechareSelf.itJudgeLocalStorage.putLocalValue("","","","");
		HTTP.sendSmsCertificate(result.transSeq, phoneRechareSelf.orderPageJson['phone_number'], '');//交易凭证短信下发
		phoneRechareSelf.paymentPlugin.setOrderDisplay('success');
		goTo(config.page.float_dia);
		config.isBack = function(){
			if(window.jqXHR.readyState > 2) {   //window.jqXHR.readyState 判断请求有没有发出去
				Bestpay.App.exitApp();
			}
		};
	};






	/**
	 *  流量包充值
	 */
	PhoneRechare.prototype.flowRecharge = function(val){
		var self = this;
		HTTP.callCPSService({
			'service' : config.CPS.FLOW_RECHARGE,
			'params' : self.flowRechargeParams(val),
			'showLoading' : true,
			'success' : self.flowRechargeSuccessCallback
		});
	};

	/**
	 * 流量包充值 构造请求参数
	 */
	PhoneRechare.prototype.flowRechargeParams = function (val) {
		var self = this;

		var valStr = "";
		if(val != null && val != ""){
			valStr = val;
		}

		var params = {
			'orderNo' : HTTP.getOrderSeq(),
			'phone' : self.orderPageJson.phone_number,
			'rechargeFlow' : self.orderPageJson.flow,
			'rechargeType' : self.orderPageJson['rechargeType_flow'], // 1：电信 2：移动 3：联通
			'payPassword' :Bestpay.Security.encryptPassword(self.userInfo.staffCode,valStr,self.random),
			'systemNO' : self.orderPageJson.systemNo,
			'tradeTime' : Lang.getDate_YYYYMMDD() + '' + Lang.getTime_HHMMSS(),
			'txnAmount' : Lang.yuan2fen(self.orderPageJson.mTxnAmount),
			'prodCode' : self.orderPageJson['prodCode'],
			'actionCode' : '01010165', 
			'supplyCode': self.orderPageJson['supplyCode']
		};
		if(self.userInfo.hadEpt.toString()== '1'){
			params.costWay = self.paymentPlugin.getPayType();
			params.productId = self.productId;
			params.userId =self.orderPageJson['userId'] ;
		}
		params = HTTP.setCPSCommonParams(params);
		return params;
	};

	/**
	 * 流量包充值 成功回调函数
	 */
	PhoneRechare.prototype.flowRechargeSuccessCallback = function (result) {
		if (result.code !== config.RES.SUCCESS) {
			if(result.code === config.RES.MONEY_NOT_ENOUGH){
				Bestpay.Dialog.showAlertDialog(config.TITLE.no_repeat,config.RES.MONEY_NOT_ENOUGH_MSG,'确定',result.code,function(code){
					back();
					phoneRechareSelf.itJudgeLocalStorage.putLocalValue("","","","");
				});
				return;
			}
			if(result.code == "009002" || result.code == "006751") {
				phoneRechareSelf.paymentPlugin.setOrderDisplay('overtime');
				goTo(config.page.float_dia);
				return;
			}

			if(result.code == config.RES.PASSWORD_ERROR_LOCKED_002136){ //输入密码错误次数超过三次，退出app
				Bestpay.Dialog.showAlertDialog(config.TITLE.no_repeat, result.content,'确定',result.code,function(){
					App.exitCompleteApp();
					phoneRechareSelf.itJudgeLocalStorage.putLocalValue("","","","");
				});
			}
			Bestpay.Dialog.showAlertDialog(config.TITLE.no_repeat, result.content,'确定',result.code,function(){
				back();
				phoneRechareSelf.itJudgeLocalStorage.putLocalValue("","","","");
			});
			return;
		}
		phoneRechareSelf.itJudgeLocalStorage.putLocalValue("","","","");
		HTTP.sendSmsCertificate(result.transSeq, phoneRechareSelf.orderPageJson['phone_number'], '');//交易凭证短信下发

		phoneRechareSelf.paymentPlugin.setOrderDisplay('success');
		goTo(config.page.float_dia);
		config.isBack = function(){
			if(window.jqXHR.readyState > 2) {   //window.jqXHR.readyState 判断请求有没有发出去
				Bestpay.App.exitApp();
			}
		};
	};



	return PhoneRechare;
});