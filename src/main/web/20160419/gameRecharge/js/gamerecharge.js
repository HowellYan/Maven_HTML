define(['jquery', 'bestpay.ui', 'bestpay.lang', 'bestpay.http'], function($, UI, Lang, HTTP) {

	var GameRechargeSelf = null;
	var doc = document;

	function GameRecharge() {
		GameRechargeSelf = this;
		this.userInfo = JSON.parse(Bestpay.User.getSuccessLoginInfo());
		this.random = null; //随机数
		this.orderPageJson = {}; //订单值
		this.itMobile = null; //手机号码 input
		this.ipPassword = ''; //支付密码 input
		this.quickTranInfo = {};
		this.witchOrderPage = null; //判断哪个订单页面
		this.rewardParam = {}; //酬金参数              
		this.rechargeMoney = []; //充值金额
		this.successJson = {}; //订单充值成功的json
		this.supportGameList = {}; //游戏列表
		this.gameNameParam = {}; //游戏名称参数
		this.gameOrderJson = {
			"productCode" : null,
			"prodCode" : null,
			"gameId": null,
			"payMoney": null,
			"gameServer": null, //游戏大区
			"gameServerId": null, //游戏服务器
			"otherCount": false,
			"accountType": ''
		}; //订单页面的json
		this.gameServerParam = {}; //游戏区服查询参数
		this.gameCountParam = {}; //充值数量参数
		this.payTypeParam = {}; //充值方式参数
		this.gameServerList = {}; //游戏区服列表
		this.gameServerListParam = {}; //游戏区服参数
		this.serverListParam = {}; //游戏服务器参数
		this.dialogSelectDefult = {
				"gameName": 0,
				"gameServer": 0,
				"gameCount": 0
			}; //弹出框默认选择项
		this.gameAccount = null;
		this.zwAccount = null;	
		this.GameRechargeNUM = null;
		this.pay_other_count_val = null; //其它充值数量
		this.goType = 'zc';
        this.payType ='0';				 //选择支付方式  0是交费易   1是添益宝
        this.checkBillCheck = false;     //检查订单
   		this.GameRechargeData = {};         //交费易添益宝充值数据
   		this.productId = '0030001';     //添益宝productId
   		this.second = false;
   		this.deffered = null;
   		this.paymentPlugin = null;
		this.businessName = '游戏直充';
	};
	/**
	 * 初始化应用
	 */
	GameRecharge.prototype.initApp = function() {
		var self = this;
		self.itJudgeLocalStorage = new UI.JudgeLocalStorage();
		self.gameNameListQuery();
		goTo(config.page.main, function() {
			console.log('--------------start--------------');
			self.btnInit();
		});
	};

	/**
	 *  按钮onclick事件初始化
	 */
	GameRecharge.prototype.btnInit = function() {
		var self = this;
		self.itMobile = new UI.InputText('mobile_zc', 'mobile');
		self.itMobile_dk = new UI.InputText('mobile_dk', 'mobile');
		var selectCallBack=function(args){
                if(args=="zc"){ //游戏直充
                	//请求接口
					self.businessName = '游戏直充';
					self.goType = "zc";
					self.gameNameListQuery();
					$("#yxzc").show();
					$("#game_card_info").hide();
					$("#game_username_show").show();
					$("#cardType").hide();
					//$("#tip_zc").show();
					//$("#tip_dk").hide();

                }else
                if(args=="dk"){ //游戏点充
					self.businessName = '游戏点充';
					self.goType = "dk";
					self.resetCard(); //重置默认值
					$("#yxzc").hide();
					$("#game_card_info").show();
					$("#game_username_show").hide();
					$("#cardType").show();
					//$("#tip_zc").hide();
					//$("#tip_dk").show();
					self.itMobile_dk.clearValue();

                }
            };
		self.selectType = new UI.BlockRadioGroup('brg_amount', 'game_pay',selectCallBack);

		//游戏直充 下一步
		doc.getElementById('btn_next').onclick = function() {
			if (!self.gameOrderJson.prodCode) {
				Bestpay.Toast.makeText('请选择一个游戏', Bestpay.Toast.LENGTH_SHORT);
				return;
			} else if (!self.gameAccount.getToEmptyValue()) {
				Bestpay.Toast.makeText('请输入游戏账号', Bestpay.Toast.LENGTH_SHORT);
				return;
			}
			goTo(config.page.game_pay, function(){ 
				self.itMobile.clearValue();
			});
		};
		//游戏直充 确定付款
		doc.getElementById('paybill_zc').onclick = function() {
			self.validation();
		};


		//游戏点卡 确认购买 
		doc.getElementById('confirm_buy').onclick = function() {
			self.mobile_val = self.itMobile_dk.getToEmptyValue(); //"顾客手机号码：（选填）
			if (self.mobile_val.length >= 1 && self.mobile_val.length < 11) {
				Bestpay.Toast.makeText('请输入11位的顾客手机号码', Bestpay.Toast.LENGTH_SHORT);
				return;
			} else if (self.mobile_val.length == 11 && !self.itMobile_dk.getInputCheck()) {
				Bestpay.Toast.makeText('您输入的手机号号码段不正确', Bestpay.Toast.LENGTH_SHORT);
				return;
			}

			self.orderPageJson['game_name'] = '游戏点卡'; //[string] 充值账号名称
			self.orderPageJson['game_username'] = '天下通卡'; //[string] 充值账号值

			self.itJudgeLocalStorage.checkOrder(self.orderPageJson['game_username'],self.gameOrderJson['payMoney']*1,HTTP.getCurrentTime(),function(){
				self.gotoCardRecharge();
			},self.businessName)

		};

		

		doc.getElementById('card_pay_select_box').onclick = function() {
				goTo(config.page.card_pay_prompt,function(){ });
				
				var gameCardBox = new UI.dropDownBox('card_pay_select', this, {
					'10元': '10',
					'30元': '30',
					'50元': '50',
					'100元': '100'
				}, function(item, itemObj) {
					gameCardBox.hideDropDownBox();
					self.gameOrderJson['payMoney'] = item; //充值金额
					var cardName = $(itemObj).text();
					$('#card_pay_select_box_val').html(cardName);
					back();
				}, function() {
					gameCardBox.hideDropDownBox();
					back();
				});
			};
		
	};

	
	/*
	 * 进入游戏点卡订单
	 */
	GameRecharge.prototype.gotoCardRecharge = function() {
		showDialog(config.MSG.loading);
		config.TRADE_LIST_QUERY_TYPE = config.BUS_TYPE.BUS_TYPE_GAME_CARD;
		var self = this;
		self.witchOrderPage = 'card';

		//酬金参数--游戏点卡
		self.rewardParam['BUS_TYPE'] = config.BUS_TYPE.BUS_TYPE_GAME_CARD;
		self.rewardParam['BUS_CODE'] = config.BUS_CODE.ELE_CARD;
		GameRechargeSelf.rewardParam.productCode = "";

		//免密交易查询接口
		self.queryStart(); //查询开始
		self.callQuickTradingQuery(); 

		//成功的时候载入动画
		self.defferred.done(self.goPayAnimation);
	};

	/*
	 * 进入游戏充值页面 游戏账号、大区、服务器、充值数量
	 */
	GameRecharge.prototype.gotoGamePay = function() {

		config.TRADE_LIST_QUERY_TYPE = config.BUS_TYPE.BUS_TYPE_GAME_DIRECT;
		var self = this;
		self.witchOrderPage = 'recharge';
		dismissDialog();

		self.gameAccount = new UI.InputText('game_username_val',null,function(val){
            if(self.GameRechargeNUM == "03010100"){
                self.gameAccount.setValue(val.replace(/[^0-9]+/,''));
            }
        }); //游戏账号
		self.zwAccount = new UI.InputText('zw_val');
		var clearFun = function(){ 
			$('#pay_money').hide();
			$('#tip3').hide();
			self.gameOrderJson['payMoney'] = 0;
			self.gameOrderJson['input_val'] = ""
			console.log("self.gameOrderJson['payMoney']===="  + self.gameOrderJson['payMoney'] );
			console.log(" typeof===" + typeof self.gameOrderJson['payMoney']);
			console.log(" boolean===" + !!self.gameOrderJson['payMoney']);
		}
		var inputFunc = function(){};
		//其它充值数量
		self.pay_other_count_val = new UI.InputText('pay_other_count_val','number',inputFunc,clearFun);

		//设置默认选择项
		self.resetPage();

		self.dialogSelectDefult.gameName = 0;
		self.dialogSelectDefult.gameCount = 0;
		self.dialogSelectDefult.gameServer = 0;
		self.dialogSelectDefult.payType = 0;
		self.gamePayBtnInit();
		
	};

	/*
	 * 重置数据 -- 游戏直充
	 */
	GameRecharge.prototype.resetPage = function(val) {
		var self = this;
		var arg = val || '请选择';

		self.gameOrderJson = {};
		self.gameCountParam = {};
		self.payTypeParam = {};
		self.dialogSelectDefult.gameName = 0;
		self.gameServerParam['searchType'] = null;
		$('#game_name_val').html(arg);
		self.gameAccount.clearValue();
		self.zwAccount.clearValue();
		$('#game_area_val').html('请选择');
		$('#game_server_val').html('请选择');
		$('#pay_type_val').html('请选择');
		$('#game_area').hide();
		$('#pay_count_val').html('请选择');
		$('#pay_money').hide();
		$('#zw_username').hide();
		$('#game_server').hide();
		$('#pay_type').hide();
		$("#pay_other_count").hide();
		$("#pay_other_count_val").val("");
		GameRechargeSelf.fwq = null;
		$('#pay_money_val').html("0.00元");
		GameRechargeSelf.gameOrderJson['payMoney'] = 0;
		$("#tip3").hide();
		self.gameOrderJson['input_val'] = ""; //数量框置空
	};

	/*
	 * 重置数据 -- 游戏点卡
	 */
	GameRecharge.prototype.resetCard = function() {
		var self = this;
		self.gameOrderJson['payMoney'] = 50; //设置游戏点卡充值默认金额
		$('#card_pay_select_box_val').html('50元');
	};


	/*
	 * 游戏直充按钮初始化
	 */
	GameRecharge.prototype.gamePayBtnInit = function() {
		var self = this;
		doc.getElementById('game_name').onclick = function(event) {
			
			$('#page_select_bank').html('');
			goTo(config.page.select_bank);
			var gameNameDiaLog = new UI.dropDownBox(
				"page_select_bank",
				this,
				self.gameNameParam,
				function(key, obj) {
					//隐藏弹出框
					gameNameDiaLog.clearDropDownBox();

					var val = $(obj).text();
					GameRechargeSelf.GameRechargeNUM = null;
					GameRechargeSelf.qb = false;
					if(val == 'Q币' || val == '测试大小区服'){ 
						console.log(val+"=======================================")
						GameRechargeSelf.GameRechargeNUM = "03010100";
						if(val == 'Q币' ){ 
							GameRechargeSelf.qb = true;
						}
					}
					//if(val == "天涯明月刀" || val == "逆战" || val == "剑灵" || val == "QQ飞车"){ 
						//$("#tipQ").show();
					//}else{ 
						//$("#tipQ").hide();
					//}
					self.resetPage(val);

					//设置弹出框默认选择项
					self.dialogSelectDefult.gameName = key;
					self.dialogSelectDefult.gameCount = 0;
					self.dialogSelectDefult.gameServer = 0;

					//设置充值订单接口参数
					self.gameOrderJson['prodCode'] = self.supportGameList[key].productCode;
					self.gameOrderJson['gameId'] = self.supportGameList[key].gameId;

					//查询游戏详情接口
					GameRechargeSelf.gameDetailQuery();

					back();
				}, function() {
					gameNameDiaLog.hideDropDownBox();
					back();
				});
		};


		//选择数量弹出框
		doc.getElementById('pay_count').onclick = function() {
			if (!self.gameOrderJson['prodCode']) {
				Bestpay.Toast.makeText('请选择一个游戏', Bestpay.Toast.LENGTH_SHORT);
				return false;
			}
			$('#page_select_bank').html('');
			goTo(config.page.select_bank);
			var gameCountDiaLog = new UI.dropDownBox(
				"page_select_bank",
				this,
				self.gameCountParam,
				function(key, obj) {
					var money = GameRechargeSelf.rechargeMoney[key]; //充值金额
					var count = $(obj).text(); //充值数量

					$('#tip3').hide();

					//设置弹出框默认选择项
					self.dialogSelectDefult.gameCount = key;

					if(key == (GameRechargeSelf.gameCountParamLen + 1)){ 
						//重置一些值
						$("#pay_other_count").show();
						self.pay_other_count_val.clearValue();
						self.gameOrderJson['payMoney'] = 0;
						$('#pay_money').hide();
						self.gameOrderJson['otherCount'] = true; //其它数量

						//设置占位符提示语
						var times =  ', ' + self.gameOrderJson['errorInfo']+'的倍数';
						var placeholder_string = self.gameOrderJson['minAmount'] + '-' + self.gameOrderJson['maxAmount'] + times;
						doc.getElementById("pay_other_count_val").placeholder = placeholder_string;


						//输入时加载值
						$("#pay_other_count_val").on('input',function(){ 
							var val = !self.pay_other_count_val.getValue() ? 0 : self.pay_other_count_val.getValue();
							var val_file = null;

							$('#tip3').hide();

							self.gameOrderJson['payMoney'] = self.gameOrderJson['unitPrice'] * val;
							self.gameOrderJson['input_val'] = val;
							console.log(self.gameOrderJson['unitPrice']);
							console.log(val);
							console.log("payMoney===========" + self.gameOrderJson['payMoney']);
							console.log("input_val===========" + self.gameOrderJson['input_val']);
							console.log("%%=======" + self.gameOrderJson['input_val']%self.gameOrderJson['errorInfo'])

							val_file = self.gameOrderJson['payMoney'].toFixed(2);
							$('#pay_money_val').html(val_file);
							$('#pay_money').show();
						});
					}else{ 
						//设置充值订单接口参数
						self.gameOrderJson['otherCount'] = false; //其它数量
						self.gameOrderJson['payMoney'] = money;
						$('#pay_money_val').html(money + '.00');
						$("#pay_other_count").hide();
						$('#pay_money').show();
					}

					$('#pay_count_val').html(count);

					//隐藏弹出框
					gameCountDiaLog.clearDropDownBox();
					back();
				}, function() {
					gameCountDiaLog.hideDropDownBox();
					back();
				});
		};

		//选择充值方式
		doc.getElementById('pay_type').onclick = function() {
			$('#page_select_bank').html('');
			goTo(config.page.select_bank);
			var payTypeDiaLog = new UI.dropDownBox(
				"page_select_bank",
				this,
				self.payTypeParam,
				function(key, obj) {
					var val = $(obj).text();
					$('#pay_type_val').html(val);


					//设置弹出框默认选择项
					self.dialogSelectDefult.payType = key;

					//设置充值订单接口参数
					self.gameOrderJson['accountType'] = key*1 + 1;

					//隐藏弹出框
					payTypeDiaLog.clearDropDownBox();
					back();
				}, function() {
					payTypeDiaLog.hideDropDownBox();
					back();
				});
		};

	};

	/**
	 * 游戏列表查询接口
	 */
	GameRecharge.prototype.gameNameListQuery = function() {
		showDialog(config.MSG.loading);
		var self = this;
		HTTP.callCPSService({
			'service': config.CPS.GAME_LIST,
			'params': self.gameNameQueryParams(),
			'showLoading': false,
			'success': self.gameNameQuerySuccessCallback
		});
	};

	/**
	 * 游戏列表查询接口 构造请求参数
	 */
	GameRecharge.prototype.gameNameQueryParams = function() {
		var self = this;
		var params = {};
		params = HTTP.setCPSCommonParams(params);
		return params;
	};

	/**
	 * 游戏列表查询接口 成功回调函数
	 */
	GameRecharge.prototype.gameNameQuerySuccessCallback = function(result) {
		if (result.code !== config.RES.SUCCESS) {
			Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
			return;
		}

		GameRechargeSelf.supportGameList = result.supportGameList;

		result.supportGameList.forEach(function(gameList, i) {
			var gameName = gameList['gameName'];
			GameRechargeSelf.gameNameParam[gameName] = i;
		});

		GameRechargeSelf.gotoGamePay(); //进入选择框页面
	};



	/**
	 * 游戏详情查询接口
	 */
	GameRecharge.prototype.gameDetailQuery = function() {
		var self = this;
		HTTP.callCPSService({
			'service': config.CPS.GAME_INFO,
			'params': self.gameDetailQueryParams(),
			'showLoading': true,
			'success': self.gameDetailQuerySuccessCallback
		});
	};

	/**
	 * 游戏详情查询接口 构造请求参数
	 */
	GameRecharge.prototype.gameDetailQueryParams = function() {
		var self = this;
		var params = {
			"prodCode": self.gameOrderJson['prodCode']
		};
		params = HTTP.setCPSCommonParams(params);
		return params;
	};

	/**
	 * 游戏详情查询接口 成功回调函数
	 */
	GameRecharge.prototype.gameDetailQuerySuccessCallback = function(result) {
		if (result.code !== config.RES.SUCCESS) {
			Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
			return;
		}

		console.log('gameDetail:' + JSON.stringify(result));
		GameRechargeSelf.gameOrderJson['supplyCode'] = result.supplyCode;

		GameRechargeSelf.gameOrderJson['unitPrice'] = Lang.fen2yuan(result.unitPrice); //充值单价
		GameRechargeSelf.gameOrderJson['minAmount'] = result.minAmount; //最小充值份数
		GameRechargeSelf.gameOrderJson['maxAmount'] = result.maxAmount; //最大充值份数
		GameRechargeSelf.gameOrderJson['errorInfo'] = result.errorInfo; //输入错误提示
		GameRechargeSelf.gameOrderJson['valInput'] = result.valInput; //校验用户输入

		//设置选择数量
		var rechargeQuantity = result.rechargeQuantity.split(',');
		rechargeQuantity.forEach(function(quant, i) {
			GameRechargeSelf.gameCountParam[quant] = i;
			GameRechargeSelf.gameCountParamLen = i;
		});
		GameRechargeSelf.gameCountParam["其他数量"] = GameRechargeSelf.gameCountParamLen + 1;
		console.log(JSON.stringify(GameRechargeSelf.gameCountParam));

		//设置选择充值金额
		GameRechargeSelf.rechargeMoney = result.rechargeMoney.split(',');

		$('#game_area').hide();
		$('#orderServer_comfirm').hide();


		console.log("prodCode="+ GameRechargeSelf.gameOrderJson['prodCode']);
		if(GameRechargeSelf.gameOrderJson['prodCode'] === '00000017'){ //魔兽
			$('#zw_username').show(); //显示网站账号
		}

		if(!!result.rechargeType){ //充值方式 -- 网易
			$('#pay_type').show(); //显示充值方式
			GameRechargeSelf.gameOrderJson.isPayType = true;
			//设置充值方式参数
			var payTypeQuantity = result.rechargeType.split(',');
			for(var i = 0,len= payTypeQuantity.length; i<len; i++){ 
				var text = payTypeQuantity[i].split(':');
				GameRechargeSelf.payTypeParam[text[1]] = i;
			}
			console.log("payTypeParam=="+JSON.stringify(GameRechargeSelf.payTypeParam))
			//payTypeQuantity.forEach(function(quant, i) {
				//var quant = quant.split(':');
				//quant = quant[1];
				//GameRechargeSelf.payTypeParam[quant] = i;
			//});
		}

		GameRechargeSelf.gameType = result.gameType;

		//查询游戏区服类型判断
		if (result.gameType == 2) {
			//查询游戏区服
			GameRechargeSelf.gameServerParam['searchType'] = 1;
			GameRechargeSelf.gameServerQuery();
			$('#game_area').show(); //显示大区
		}
		if (result.gameType == 3) {
			GameRechargeSelf.gameServerParam['searchType'] = 2;
			//查询游戏区服
			GameRechargeSelf.gameServerQuery();
			$('#game_area').show(); //显示大区
			$('#game_server').show(); //显示服务器
		}
	};



	/**
	 * 游戏区服查询接口
	 */
	GameRecharge.prototype.gameServerQuery = function() {
		var self = this;
		HTTP.callCPSService({
			'service': config.CPS.GAME_SERVER,
			'params': self.gameServerQueryParams(),
			'showLoading': true,
			'success': self.gameServerQuerySuccessCallback
		});
	};

	/**
	 * 游戏区服查询接口 构造请求参数
	 */
	GameRecharge.prototype.gameServerQueryParams = function() {
		var self = this;
		var params = {
			"prodCode": self.gameOrderJson['prodCode'],
			"gameServerId": self.gameOrderJson['gameServer'],
			"searchType": self.gameServerParam['searchType'],
			"supplyCode": self.gameOrderJson['supplyCode']
		};
		params = HTTP.setCPSCommonParams(params);
		return params;
	};

	/**
	 * 游戏区服查询接口 成功回调函数
	 */
	GameRecharge.prototype.gameServerQuerySuccessCallback = function(result) {
		if (result.code !== config.RES.SUCCESS) {
			Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
			return;
		}

		console.log('serverQuery:' + JSON.stringify(result));

		GameRechargeSelf.gameServerList = result.gameServerList;
		GameRechargeSelf.gameServerListParam = {};
		result.gameServerList.forEach(function(gameServer, i) {
			var gameServerName = gameServer['gameServerName'];
			GameRechargeSelf.gameServerListParam[gameServerName] = i;
		});

		if(GameRechargeSelf.second){ 
			//游戏服务器
			GameRechargeSelf.gameServerListParam_xiao = {};
			result.gameServerList.forEach(function(gameServer, i) {
				var gameServerName = gameServer['gameServerName'];
				var gameServerValue = gameServer['gameServerValue'];
				GameRechargeSelf.gameServerListParam_xiao[gameServerName] = gameServerValue;
			});
		}else { 
			//游戏大区
			GameRechargeSelf.gameServerListParam_da = GameRechargeSelf.gameServerListParam;
			GameRechargeSelf.gameServerList_da = result.gameServerList;
		}

		console.log('游戏区服查询接口 出参' + JSON.stringify(GameRechargeSelf.gameServerList))

		//选择区服弹出框
		doc.getElementById('game_area').onclick = function() {

			$('#page_select_bank').html('');
			goTo(config.page.select_bank);
			var gameServerDiaLog = new UI.dropDownBox(
				"page_select_bank",
				this,
				GameRechargeSelf.gameServerListParam_da,
				function(key, obj) {
					var val = $(obj).text();
					$('#game_area_val').html(val);

					GameRechargeSelf.gameOrderJson['gameServer'] = GameRechargeSelf.gameServerList_da[key].gameServerValue;

					//如果有服务器信息
					if(GameRechargeSelf.gameServerParam['searchType'] == 2) { 
						
						var serverName = val.replace('区','号服务器');
						 
						GameRechargeSelf.gameServerQuery(); //查询游戏服务器
						GameRechargeSelf.gameOrderJson['gameServerId'] = null;
						$("#game_server_val").html("请选择");
						GameRechargeSelf.second = true;
					}

					//隐藏弹出框
					gameServerDiaLog.clearDropDownBox();
					back();
				}, function() {
					gameServerDiaLog.hideDropDownBox();
					back();
				});
		};

		//选择服务器
		doc.getElementById('game_server').onclick = function() {
			if(!!GameRechargeSelf.gameServerParam['searchType'] && !GameRechargeSelf.gameOrderJson['gameServer']){ 
				Bestpay.Toast.makeText('请选择一个大区', Bestpay.Toast.LENGTH_SHORT);
				return;
			}
			$('#page_select_bank').html('');
			goTo(config.page.select_bank);
			var serverDiaLog = new UI.dropDownBox(
				"page_select_bank",
				this,
				GameRechargeSelf.gameServerListParam_xiao,
				function(key, obj) {
					var val = $(obj).text();
					$('#game_server_val,#game_area_order_server').html(val);
					GameRechargeSelf.gameOrderJson['gameServerId'] = key;
					console.error(' gameServerId:' + GameRechargeSelf.gameOrderJson['gameServerId']);
					GameRechargeSelf.fwq = true;
					//隐藏弹出框
					serverDiaLog.clearDropDownBox();
					back();
				}, function() {
					serverDiaLog.hideDropDownBox();
					back();
				});
		};
	};


	/**
	 * 游戏直充 确定付款
	 */
	GameRecharge.prototype.validation = function() {
		var self = this;
		if(GameRechargeSelf.qb && (self.gameAccount.getToEmptyValue().length < 5)){
			Bestpay.Toast.makeText('请检查输入的充值号码', Bestpay.Toast.LENGTH_SHORT);
			return;
		} else if (self.gameOrderJson.isPayType && !self.gameOrderJson['accountType']) {
			Bestpay.Toast.makeText('请选择充值方式', Bestpay.Toast.LENGTH_SHORT);
			return;
		}else if (!!self.gameServerParam['searchType'] && !self.gameOrderJson['gameServer']) {
			Bestpay.Toast.makeText('请选择一个大区', Bestpay.Toast.LENGTH_SHORT);
			return;
		}else if(self.gameType == '3' && !self.gameOrderJson['gameServerId']){
			Bestpay.Toast.makeText('请选择游戏服务器', Bestpay.Toast.LENGTH_SHORT);
			return;
		}else if(self.gameOrderJson['prodCode'] == '00000017'&&!self.zwAccount.getValue()){
			Bestpay.Toast.makeText('请输入网战账号', Bestpay.Toast.LENGTH_SHORT);
			return;
		}else if (!self.gameOrderJson['otherCount'] && !(self.gameOrderJson['payMoney']*1)) {
			Bestpay.Toast.makeText('请选择充值数量', Bestpay.Toast.LENGTH_SHORT);
			return;
		}else if (self.gameOrderJson['otherCount'] && !self.gameOrderJson['input_val']) {
			Bestpay.Toast.makeText('请填写充值数量', Bestpay.Toast.LENGTH_SHORT);
			return;
		}else if(self.gameOrderJson['otherCount'] && (self.gameOrderJson['input_val']*1 < self.gameOrderJson['minAmount']*1 || self.gameOrderJson['input_val']*1 > self.gameOrderJson['maxAmount']*1)){ 
			console.log("范围不对");
			$("#tip3").show();
			return;
		}else if(self.gameOrderJson['otherCount'] && ((self.gameOrderJson['input_val']%self.gameOrderJson['errorInfo']) > 0)){ 
			console.log("倍数不对");
			$("#tip3").show();
			return;
		}



		//顾客手机号码：（选填）
		self.mobile_val = self.itMobile.getToEmptyValue(); 
		if (self.mobile_val.length >= 1 && self.mobile_val.length < 11) {
			Bestpay.Toast.makeText('请输入11位的顾客手机号码', Bestpay.Toast.LENGTH_SHORT);
			return;
		} else if (self.mobile_val.length == 11 && !self.itMobile.getInputCheck()) {
			Bestpay.Toast.makeText('您输入的手机号号码段不正确', Bestpay.Toast.LENGTH_SHORT);
			return;
		}

		//酬金参数 -- 游戏直充
		self.rewardParam['BUS_TYPE'] = config.BUS_TYPE.BUS_TYPE_GAME_DIRECT;
		self.rewardParam['BUS_CODE'] = config.BUS_CODE.GAME_DIRECT;

		self.initConfirm();
	};


	/**
	 * 初始化确定订单界面
	 */
	GameRecharge.prototype.initConfirm = function() {
		var self = this;
		
		if (GameRechargeSelf.witchOrderPage == 'recharge') {

			if(self.gameOrderJson['prodCode'] == '00000017'){ //魔兽
				//魔兽世界 
				//一级账号 = 战网账号
				//二级账号 = 游戏账号
				self.gameOrderJson['account'] = self.zwAccount.getValue();
				self.gameOrderJson['subAccount'] = self.gameAccount.getToEmptyValue();
			}else{ 
				//其它游戏 
				//一级账号 = 游戏账号
				//二级账号 = 战网账号
				self.gameOrderJson['account'] = self.gameAccount.getToEmptyValue();
				self.gameOrderJson['subAccount'] = self.zwAccount.getValue();
			}

			GameRechargeSelf.orderPageJson['game_name'] = $('#game_name_val').html(); //游戏名称
			GameRechargeSelf.orderPageJson['game_username'] = self.gameAccount.getToEmptyValue(); //游戏账号
			GameRechargeSelf.orderPageJson['game_area'] = $('#game_area_val').html(); //游戏大区
			if(GameRechargeSelf.gameOrderJson['otherCount']){ 
				GameRechargeSelf.orderPageJson['pay_count'] = GameRechargeSelf.gameOrderJson['input_val']; //充值数量
			}else{ 
				GameRechargeSelf.orderPageJson['pay_count'] = $('#pay_count_val').html(); //充值数量
			} 
			GameRechargeSelf.orderPageJson['pay_money'] = $('#pay_money_val').html(); //充值金额
			console.log("订单:"+JSON.stringify(GameRechargeSelf.orderPageJson));

		}

		self.itJudgeLocalStorage.checkOrder(self.gameOrderJson['account'],self.orderPageJson['pay_money']*1,HTTP.getCurrentTime(),function(){
			//免密交易查询接口
			self.queryStart(); //查询开始
			self.callQuickTradingQuery();
			//成功的时候载入动画
			self.defferred.done(self.goPayAnimation);
		},self.businessName);
	};

	GameRecharge.prototype.gotoOrder = function(val) { 
		HTTP.getRandomServices(function(result){
            var retJson = result;
            //未找到酬金结算方式，不进行酬金计算, 也当做成功了，酬金为零
            if (result.code === config.RES.SUCCESS) {
                GameRechargeSelf.random = result.randNum;
            }
            GameRechargeSelf.gotoRecharge(val);
        },false);
	}

	/*
	 * 查询开始
	 */
	GameRecharge.prototype.queryStart = function(){ 
		var self = this;

		//新建一个延迟对象
		self.defferred = $.Deferred();
		showDialog();
	};


	/*
	 * 查询结束
	 * 去订单页面
	 */
	GameRecharge.prototype.queryEnd = function(){ 
		var self = this;
		var pluginParam = {
			businessName:self.businessName,
			accountName: '游戏充值', //[string] 充值账号名称
			accouontValue: self.orderPageJson['game_username'], //[string] 充值账号值
			rechargeMoney: self.gameOrderJson['payMoney'], //[string] 充值金额(元)
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
		//self.payType = self.paymentPlugin.getPayType();
		//console.log("支付方式==" + self.payType)

		//成功
		dismissDialog();
		goTo(config.page.comfirm,function(){});
		self.defferred.resolve();
	};

	/*
	 * 显示订单页面动画
	 */
	GameRecharge.prototype.goPayAnimation = function() { 
		console.log("done=========================")
		$("#order_comfirm").removeClass("backPayAnimation").addClass('goPayAnimation');
	};

	/**
	 * 酬金查询
	 */
	GameRecharge.prototype.getCommission = function() {
		var self = this;
		console.error('payMoney:' + self.gameOrderJson.payMoney);
		HTTP.getCommission(GameRechargeSelf.rewardParam['BUS_TYPE'], GameRechargeSelf.rewardParam['BUS_CODE'], GameRechargeSelf.gameOrderJson['prodCode'], self.gameOrderJson.payMoney, function(result) {
			var retJson = result;
			console.error('result:' + JSON.stringify(result));
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
			GameRechargeSelf.gameOrderJson['supplyCode'] = retJson.supplyCode;
			GameRechargeSelf.orderPageJson['reward'] = retJson.commission;
			GameRechargeSelf.orderPageJson['rewardType'] = 'reward';

			//成功
			GameRechargeSelf.queryEnd();
		}, false);
	};

	/**
	 * 折价查询接口
	 */
	GameRecharge.prototype.SDiscQuery = function() {
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
	GameRecharge.prototype.SDiscQueryParams = function() {
		var self = this;
		var params = { 
			'rechAmount': Lang.yuan2fen(self.gameOrderJson['payMoney']),   //订单金额
			'pecProduct': self.gameOrderJson['prodCode'],
			'supplyCode': self.gameOrderJson['supplyCode'] || ''
		};
		params = HTTP.setCPSCommonParams(params);
		console.log("折价查询SDISCQUERY 入参==");

		return params;
	};

	/**
	 * 折价查询接口 成功回调函数
	 */
	GameRecharge.prototype.SDiscQuerySuccessCallback = function(result) {
		if (result.code !== config.RES.SUCCESS) {
			Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
			return;
		}
		GameRechargeSelf.gameOrderJson['supplyCode'] = result.supplyCode;
		GameRechargeSelf.orderPageJson['reward'] = Lang.fen2yuan(result.discAmount); //酬金
		GameRechargeSelf.orderPageJson['rewardType'] = 'zhejia';
		//成功
		GameRechargeSelf.queryEnd();
	};


	/**
	 * 免密交易查询接口
	 */
	GameRecharge.prototype.callQuickTradingQuery = function() {
		var self = this;
		HTTP.callCPSService({
			'service': config.CPS.QUICK_TRADING_QUERY,
			'params': self.quickTradingQueryParams(),
			'showLoading': false,
			'success': self.quickTradingQuerySuccessCallback
		});
	};

	/**
	 * 免密交易查询接口 构造请求参数
	 */
	GameRecharge.prototype.quickTradingQueryParams = function() {
		var self = this;
		var params = {};
		params = HTTP.setCPSCommonParams(params);
		return params;
	};

	/**
	 * 免密交易查询接口 成功回调函数
	 */
	GameRecharge.prototype.quickTradingQuerySuccessCallback = function(result) {
		if (result.code !== config.RES.SUCCESS) {
			Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
			return;
		}
		GameRechargeSelf.quickTranInfo = {
			'perAmount': result.perAmount, // 单笔限额
			'allamount': result.allamount, // 累积限额
			'alltransaction': result.alltransaction // 累积消费
		};
		GameRechargeSelf.handleIsneedpassword();
	};


	/**
	 * 判断要不要输入密码    要传递的信息passMap  put进一个是否需要输入密码的值
	 * @param amount 要充值的金额（以元为单位）
	 */
	GameRecharge.prototype.handleIsneedpassword = function() {
		var self = this;

		var quickTranInfo = GameRechargeSelf.quickTranInfo;
		var amount = Lang.yuan2fen(self.gameOrderJson.payMoney);
		console.log("amount : " + amount);
		console.log("quickTranInfo : " + JSON.stringify(quickTranInfo));
		if (amount * 1 <= 1 * quickTranInfo.perAmount && (amount * 1 + 1 * quickTranInfo.alltransaction) <= 1 * quickTranInfo.allamount) {
			//	免密
			GameRechargeSelf.noPwd = false;
		} else {
			//	加密
			GameRechargeSelf.noPwd = true;
		}
		console.log('self.userInfo.authenStatus==' + self.userInfo.authenStatus);
        if(self.userInfo.authenStatus == 'A02'){
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
    GameRecharge.prototype.getFinancialProducts = function(){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.FINANCIAL_PRODUCTS,
            'params' : self.getFinancialProductsParams(),
            'showLoading' : false,
            'success' : self.getFinancialProductsSuccessCallback
        });
    };

    /*企业理财用户理财产品列表查询 请求参数*/
    GameRecharge.prototype.getFinancialProductsParams = function () {
        var self = this;
        var params = {};
        params = HTTP.setCPSCommonParams(params);
        return params;
    };

    /**
     * 企业理财用户理财产品列表查询 成功回调函数
     */
    GameRecharge.prototype.getFinancialProductsSuccessCallback = function (result) {
		if (result.code !== config.RES.SUCCESS) {
			if(result.code === '018888'){ 
				GameRechargeSelf.fundAccountBalanceInquiry(); //资金账户余额查询 SAcc003
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
            GameRechargeSelf.orderPageJson['productId'] =list[i]['productId']; //产品ID
            GameRechargeSelf.orderPageJson['userId'] =list[i]['userId']; //userId
            GameRechargeSelf.orderPageJson['tyb_amount'] = Lang.fen2yuan(list[i]['balance']); //添益宝余额
        }

        GameRechargeSelf.fundAccountBalanceInquiry();     //资金账户余额查询 SAcc003
    };
    

    /**
     * 42) 资金账户余额查询 SAcc003
     */
    GameRecharge.prototype.fundAccountBalanceInquiry = function(){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.CCOUNT_BALANCE_QUERY,
            'params' : self.fundAccountBalanceInquiryParams(),
            'showLoading' : false,
            'success' : self.fundAccountBalanceInquirySuccessCallback
        });
    };

    /*资金账户余额查询 请求参数*/
    GameRecharge.prototype.fundAccountBalanceInquiryParams = function () {
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
    GameRecharge.prototype.fundAccountBalanceInquirySuccessCallback = function (result) {
    	var self = this;
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
                    GameRechargeSelf.orderPageJson['jfy_amount'] =  Lang.fen2yuan(activeBalance);
                    break;
                }
            }
        }
        if(config.CARD_TYPE.BANK_MODE_FUND_POOL_MEMBER_CARD === GameRechargeSelf.userInfo.bankMode){
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
			
            GameRechargeSelf.orderPageJson['jfy_amount'] = Lang.fen2yuan(sub_bankMode);
            console.log("子卡==GameRechargeSelf.orderPageJson['jfy_amount']=="+GameRechargeSelf.orderPageJson['jfy_amount']);
        }
        console.log(GameRechargeSelf.goType )
        if(GameRechargeSelf.goType === "zc"){ 
        	//折价查询
			GameRechargeSelf.SDiscQuery(); 
		}else if(GameRechargeSelf.goType === "dk"){
		 	//酬金查询
			GameRechargeSelf.getCommission(); 
		}
    };



	/**
	 * 触发立即充值
	 */
	GameRecharge.prototype.gotoRecharge = function(val) {
		HTTP.getRandomServices(function(result) {
			var retJson = result;
			//未找到酬金结算方式，不进行酬金计算, 也当做成功了，酬金为零
			if (result.code === config.RES.SUCCESS) {
				GameRechargeSelf.random = result.randNum;
			}

			console.log("witchOrderPage== " + GameRechargeSelf.witchOrderPage );
			if(GameRechargeSelf.witchOrderPage == 'recharge') {
			 	GameRechargeSelf.rechargeResp(val); //游戏直充
			}
			if(GameRechargeSelf.witchOrderPage == 'card') { 
				GameRechargeSelf.cardResp(val); //点卡充值
			}
		}, false);
	};


	/**
	 *  游戏点卡 -- 充值
	 */
	GameRecharge.prototype.cardResp = function(val) {
        config.isBack = function(){
          back();
        };
		var self = this;
		HTTP.callCPSService({
			'service': config.CPS.ELECTRONIC_SELL_CARD,
			'params': self.cardParams(val),
			'showLoading': true,
			'success': self.cardSuccessCallback,
			'error': self.cardErrorCallback
		});
	};

	/**
	 * 游戏点卡充值 构造请求参数
	 */
	GameRecharge.prototype.cardParams = function(val) {
		var self = this;
		var valStr = "";
        if(val != null && val != ""){
            valStr = val;
        }
		var params = {
			'payPassword' : Bestpay.Security.encryptPassword(self.userInfo.staffCode,valStr,self.random),
			'cardAmount': Lang.yuan2fen(self.gameOrderJson['payMoney']),
			"cardTypeCode": "2003",
			"payType": "0",
			'tradeTime' : Lang.getDate_YYYYMMDD() + '' + Lang.getTime_HHMMSS(),
			'orderNo':  Lang.getDate_YYYYMMDD() + '' + Lang.getTime_HHMMSS() + '' + new Date().getMilliseconds()
		};
		if (self.mobile_val.length>0){
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
	 * 游戏点卡充值 成功回调函数
	 */
	GameRecharge.prototype.cardSuccessCallback = function(result) {
        //dismissDialog();
		if (result.code !== config.RES.SUCCESS) {
			if (result.code == config.RES.MONEY_NOT_ENOUGH) {
				Bestpay.Dialog.showAlertDialog('提醒', '余额不足' ,'确定', result.code, function() {
					back();
					GameRechargeSelf.itJudgeLocalStorage.putLocalValue("","","","");
				});
				return;
			}
			if(result.code == "009002" || result.code == "006751") { 
				GameRechargeSelf.paymentPlugin.setOrderDisplay('overtime'); //超时
				goTo(config.page.page_float);
				return;
			}
			if (result.code == '006914') {
				Bestpay.Dialog.showAlertDialog('提醒', '卡库存不足' ,'确定', result.code, function(){ 
					back();
					GameRechargeSelf.itJudgeLocalStorage.putLocalValue("","","","");
				});
				return;
			}
			if (result.code == config.RES.PASSWORD_ERROR_LOCKED_002136) { //输入密码错误次数超过三次，退出app
				Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code, function() { 
					App.exitCompleteApp();
					GameRechargeSelf.itJudgeLocalStorage.putLocalValue("","","","");
				});
			}else{ 
				Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code, function(){ 
					back();
					GameRechargeSelf.itJudgeLocalStorage.putLocalValue("","","","");
				});
			}
			return;
		}

		GameRechargeSelf.itJudgeLocalStorage.putLocalValue("","","","");
		if (GameRechargeSelf.mobile_val.length > 0) {
			HTTP.sendSmsCertificate(result.transSeq, GameRechargeSelf.mobile_val, ''); //交易凭证短信下发
		};

        GameRechargeSelf.paymentPlugin.setOrderDisplay('success'); //成功
		goTo(config.page.page_float);
        config.isBack = function(){
            if(window.jqXHR.readyState > 2) {   //window.jqXHR.readyState 判断请求有没有发出去
                Bestpay.App.exitApp();
            }
        };
	};

	/**
	 * 游戏点卡充值 失败回调函数
	 */
	GameRecharge.prototype.cardErrorCallback = function(result) {
		if (result.code == config.RES.MONEY_NOT_ENOUGH) {
			Bestpay.Dialog.showAlertDialog('提醒', '余额不足' ,'确定', result.code, function() {
				GameRechargeSelf.itJudgeLocalStorage.putLocalValue("","","","");
			});
			return;
		}
	};

	/**
	 *  游戏直充 -- 充值
	 */
	GameRecharge.prototype.rechargeResp = function(val) {
		var self = this;
		//showDialog(config.MSG.loading);
        config.TRADE_LIST_QUERY_NUMBER = self.gameAccount.getToEmptyValue();
        config.isBack = function(){
          back();
        };
		HTTP.callCPSService({
			'service': config.CPS.GAME_RECHARGE,
			'params': self.rechargeParams(val),
			'showLoading': true,
			'success': self.rechargeSuccessCallback,
			'error': self.rechargeErrorCallback
		});
	};

	/**
	 * 充值接口 构造请求参数
	 */
	GameRecharge.prototype.rechargeParams = function(val) {
		var self = this;
		var valStr = "";
        if(val != null && val != ""){
            valStr = val;
        }
		var params = {
			'account': self.gameOrderJson['account'],
			'prodCode' : self.gameOrderJson['prodCode'],
			'gameId' : self.gameOrderJson['gameId'],
			'time' : +new Date(),
			'rechargeNum': self.orderPageJson['pay_count'],
			'rechargeProduct' : self.gameOrderJson['gameValue'],
			'amount': Lang.yuan2fen(self.gameOrderJson['payMoney']),
			'password' : Bestpay.Security.encryptPassword(self.userInfo.staffCode,valStr,self.random),
			'subAccount': self.gameOrderJson['subAccount'],
			'gameZone' : self.gameOrderJson['gameServer'],
			'gameServer' : self.gameOrderJson['gameServerId'],
			'accountType' : self.gameOrderJson['accountType'],
			'rechargeType' : self.gameOrderJson['accountType'],
			'supplyCode': self.gameOrderJson['supplyCode']
		};
		if (self.mobile_val.length>0){
			params['phone']=self.mobile_val;//客户手机号
		}else{
			params['phone']='';
		}
		if(self.userInfo.hadEpt.toString()== '1'){
            params.costWay = self.paymentPlugin.getPayType();
            params.productId = self.productId;
            params.userId =self.orderPageJson['userId'];
        }
		console.error("----"+JSON.stringify(params));
		params = HTTP.setCPSCommonParams(params);
		return params;
	};

	/**
	 * 充值接口 成功回调函数
	 */
	GameRecharge.prototype.rechargeSuccessCallback = function(result) {
		dismissDialog();
		if (result.code !== config.RES.SUCCESS) {
			if (result.code == config.RES.MONEY_NOT_ENOUGH) {
				Bestpay.Dialog.showAlertDialog('提醒', '余额不足' ,'确定', result.code, function() {
					back();
					GameRechargeSelf.itJudgeLocalStorage.putLocalValue("","","","");
				});
				return;
			}
			if(result.code == "009002" || result.code == "006751") { 
				GameRechargeSelf.paymentPlugin.setOrderDisplay('overtime'); //超时
				goTo(config.page.page_float);
				return;
			}
			
			if (result.code == config.RES.PASSWORD_ERROR_LOCKED_002136) { //输入密码错误次数超过三次，退出app
				Bestpay.Dialog.showAlertDialog('提醒',result.content, '确定', result.code, function() { 
					App.exitCompleteApp();
					GameRechargeSelf.itJudgeLocalStorage.putLocalValue("","","","");
				});
			}else{ 
				Bestpay.Dialog.showAlertDialog('提醒',result.content, '确定', result.code, function(){ 
					back();
					GameRechargeSelf.itJudgeLocalStorage.putLocalValue("","","","");
				});
			}
			return;
		}
		GameRechargeSelf.itJudgeLocalStorage.putLocalValue("","","","");

		if (GameRechargeSelf.mobile_val.length > 0) {
			HTTP.sendSmsCertificate(result.orderId, GameRechargeSelf.mobile_val, ''); //交易凭证短信下发
		}

        GameRechargeSelf.paymentPlugin.setOrderDisplay('success'); //成功
		goTo(config.page.page_float);

        config.isBack = function(){
            if(window.jqXHR.readyState > 2) {   //window.jqXHR.readyState 判断请求有没有发出去
                Bestpay.App.exitApp();
            }
        };
	};

	/**
	 * 充值接口 失败回调函数
	 */
	GameRecharge.prototype.rechargeErrorCallback = function(result) {
		if (result.code == config.RES.MONEY_NOT_ENOUGH) {
			Bestpay.Dialog.showAlertDialog('提醒', '余额不足' ,'确定', result.code, function() {
				GameRechargeSelf.itJudgeLocalStorage.putLocalValue("","","","");
			});
			return;
		}
	};

	return GameRecharge;
});