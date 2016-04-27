/**
 * Created by liuyun on 15/4/26.
 * Version 1.0
 * (C)Copyright www.bestpay.com.cn Corporation. 2015-20XX All rights reserved.
 */
define(['jquery', 'bestpay.ui', 'bestpay.lang', 'bestpay.http'], function($, UI, Lang, HTTP) {
	var trafficfinesSelf = null;

	function Trafficfines() {
		trafficfinesSelf = this;
		this.userInfo = JSON.parse(Bestpay.User.getSuccessLoginInfo());
		console.log("userInfo=============" + JSON.stringify(userInfo));
        this.selectCityCode = this.userInfo.areaCode;
        console.log("-----------selectCityCode:"+this.selectCityCode);
		this.brgAmount = null;
		this.cardAmount = '10'; //按钮的充值金额
		this.quickTranInfo = {};
		this.itemValue = '02'; //车辆类型
		this.random = null; //随机数
		this.itMobile = null; //手机号码 input
		this.ipPassword = null; //支付密码 input
		this.mailRecept = null; //收件人
		this.mailMobile = null; //收件人手机号码
		this.mailAddress = null; //收件人地址
		this.violationRecord = null; //违章单列表
		this.violationRecordJson = {}; //违章单返回JSON
		this.orderPageJson = {}; //订单页面的json
		this.successJson = {}; //订单充值成功的json
		this.canProcess = false; //可否代办
		this.hzTips = false; //是否有回执提示
		this.arrRecordJson = []; //罚单数组
		this.sureOrder = {}; //确认订单
		this.sureOrderPage = {}; //确认订单页面
		this.isPost = 'false'; //是否邮寄地址
		this.systemNo = null; //系统参考号
		this.payType ='0';				 //选择支付方式  0是交费易   1是添益宝
        this.checkBillCheck = false;     //检查订单
   		this.TrafficfinesData = {};         //交费易添益宝充值数据
   		this.productId = '0030001';     //添益宝productId
   		this.deffered = null;
   		this.paymentPlugin = null;
		this.businessName = '交通罚款';
	}
	/**
	 * 初始化应用
	 */
	Trafficfines.prototype.initApp = function() {
		config.TRADE_LIST_QUERY_TYPE = config.BUS_TYPE.BUS_TYPE_TRAFFIC_FINES;
		var self = this;
		goTo(config.page.main, function() {

		});
		self.car_number = new UI.InputText('car_number', 'AlphaNumeric'); //请输入车牌号
		self.chassis_number = new UI.InputText('chassis_number', 'AlphaNumeric'); //车架号
		self.engine_number = new UI.InputText('engine_number', 'engineNumber'); //发动机号
		self.car_number.clearValue();
		self.chassis_number.clearValue();
		self.engine_number.clearValue();
		self.mailRecept = new UI.InputText('mail_recept'); //收件人
		self.mailMobile = new UI.InputText('mail_moblie', 'mobile'); //收件人手机号码
		self.mailAddress = new UI.InputText('mail_address'); //邮寄地址

		self.btnInit();
	};



	/**
	 *  按钮onclick事件初始化
	 */
	Trafficfines.prototype.btnInit = function() {
		var self = this;

		self.getCarCode();
		//选择省市
		$("#city,#cardNum").on('click',function(){ 
			self.accepCityName = ""; //清空数据
			goTo(config.page.selectPage, function() {
				//self.accepProvinceCode = "";
				//$("#id_optionsBoxLeft").hide();
				//$("#id_optionsBoxRight").hide();
				self.getAreaInfo();
			});
		});
		//选择城市
		document.getElementById('id_selectProBtn').onclick = function() {
			if (self.accepCityName == "") {
				Bestpay.Toast.makeText('请选择车牌', Bestpay.Toast.LENGTH_SHORT);
				return;
			}
			
			trafficfinesSelf.accepCityCode = trafficfinesSelf.accepCityCode_data;
			trafficfinesSelf.accepProvinceCode = trafficfinesSelf.accepCityCode.slice(0,2);
			trafficfinesSelf.carNumberPrefix = trafficfinesSelf.carNumberPrefix_data;
			console.log(trafficfinesSelf.accepProvinceCode + ' ' +trafficfinesSelf.accepCityCode);
			$('#cardNum').html(trafficfinesSelf.carNumberPrefix);
			$('#city').html(trafficfinesSelf.city);
			back();
		};
		document.getElementById('btn_next').onclick = function() { //违章查询 跳到违章页面
			self.checkBillCheck = false;
			self.fine_Query();
		};

		//document.getElementById('btn_buy').onclick = function() { //立即购买
		//	self.gotoRecharge();
		//};

	};

	/**
	 * 选择省市页面 获取开通的省市接口
	 */
	Trafficfines.prototype.getAreaInfo = function() {
		var self = this;
		var provinces = Bestpay.DB_Data.getTrafficProvinces();
		console.log(JSON.stringify(provinces));
		self.areaInfoSuccessCallback(provinces);
	};

	/**
	 * 获取开通的省市接口 成功回调
	 * @param result
	 */
	Trafficfines.prototype.areaInfoSuccessCallback = function(result) {
		var orders = result;
		var optionsBoxLeftHTML = "";
		for (var i = 0, len = orders.length; i < len; i++) {
			var objJson = orders[i];
			optionsBoxLeftHTML += '<span id="'+objJson.code+'" data-code="' + objJson.code + '">' + objJson.prefix + '（' + objJson.name + '）</span>';
		}
		//if (trafficfinesSelf.accepProvinceCode == "") {
			$("#id_optionsBoxLeft").html('').append(optionsBoxLeftHTML);
			$("#id_optionsBoxLeft span").css('height','auto');
			$('#'+trafficfinesSelf.accepProvinceCode).addClass('selectSpan');
			$("#id_optionsBoxLeft").show();
			$("#id_optionsBoxRight").html('').show();
			trafficfinesSelf.getProvinceCode();
		//}
	};

	/*
	 * 获取车牌代号
	 */
	Trafficfines.prototype.getCarCode = function(){ 
		var self = this;
		var provinceCode = self.selectCityCode.slice(0, 2); //省份代号
		var cityCode = self.selectCityCode.slice(0, 4); //城市代号
		var cityList = Bestpay.DB_Data.getTrafficCitiesByProvinceId(provinceCode);
		var regexp = new RegExp('\{[^}]*'+cityCode+'[^}]*\}',"g");
		cityList = JSON.stringify(cityList);
		console.log("cityList="+ cityList);
		var cityArray = cityList.match(regexp);
		console.log("234cityArray=" + cityArray);
		cityArray = JSON.parse(cityArray);

		if(!cityArray){ //如果没有匹配到城市  默认省会
			cityArray =  JSON.parse(cityList)[0];
		}
		console.log("cityArray=" + cityArray);
		
		self.accepProvinceCode = provinceCode;
		self.accepCityCode = cityArray.cityID;
		self.carCodeLen = cityArray.carCodeLen;
		self.carEngineLen = cityArray.carEngineLen;
		console.log('self.carEngineLen == ' + self.carEngineLen);
		self.accepCityName = cityArray.name;
		self.carNumberPrefix = cityArray.carNumberPrefix;

		$("#cardNum").html(self.carNumberPrefix);
		$("#city").html(self.accepCityName);
		self.provinceCheck(); //设置车架号 和 发动机号
		self.carTypeClick(); //选择大小车类型 02:小车  01：大车
	};

	/**
	 * 省份列表事件
	 */
	Trafficfines.prototype.getProvinceCode = function() {
		var self = this;
		trafficfinesSelf.getCityCode(Bestpay.DB_Data.getTrafficCitiesByProvinceId(self.accepProvinceCode));
		$("#id_optionsBoxLeft span").each(function() {
			$(this).on("click", function() {
				trafficfinesSelf.accepProvinceCode_data = $(this).data('code'); //省份代号
				var city = Bestpay.DB_Data.getTrafficCitiesByProvinceId(trafficfinesSelf.accepProvinceCode_data);
				console.log(JSON.stringify(city));

				trafficfinesSelf.accepProvinceName = $(this).html();
				Bestpay.App.setTitle(trafficfinesSelf.accepProvinceName);
				$("#id_optionsBoxLeft .selectSpan").removeClass("selectSpan");
				$(this).addClass("selectSpan");
				trafficfinesSelf.getCityCode(city);
			});
		});
	};

	/**
	 * 城市列表事件
	 */
	Trafficfines.prototype.getCityCode = function(city) {
		var self = this;
		var cityList = city;
		var optionsBoxRightHTML = "";
		for (var i = 0, len = cityList.length; i < len; i++) {
			var cityListObj = cityList[i];
			optionsBoxRightHTML += '<span id="' + cityListObj.cityID + '" data-code="' + cityListObj.carCodeLen + ':' + cityListObj.carEngineLen + '" data-city="' + cityListObj.name + '" title="' + cityListObj.carNumberPrefix + '">' + cityListObj.carNumberPrefix + '（' + cityListObj.name + '）</span>';
		}
		$("#id_optionsBoxRight").html('').append(optionsBoxRightHTML);
		$("#id_optionsBoxRight span").css('height','auto');
		$("#id_optionsBoxRight").show();

		$("#id_optionsBoxRight span").each(function() {
			$(this).on("click", function() {
				var carID = $(this).data('code').split(':');
				trafficfinesSelf.accepCityCode_data = $(this).attr('id');
				trafficfinesSelf.carCodeLen = carID[0];
				trafficfinesSelf.carEngineLen = carID[1];
				trafficfinesSelf.accepCityName = $(this).html();
				trafficfinesSelf.city = $(this).data('city');
				trafficfinesSelf.carNumberPrefix_data = $(this).attr('title');
				Bestpay.App.setTitle(trafficfinesSelf.accepCityName);
				$("#id_optionsBoxRight .selectSpan").removeClass("selectSpan");
				$(this).addClass("selectSpan");


				trafficfinesSelf.accepCityCode = trafficfinesSelf.accepCityCode_data;
				trafficfinesSelf.accepProvinceCode = trafficfinesSelf.accepCityCode.slice(0,2);
				trafficfinesSelf.carNumberPrefix = trafficfinesSelf.carNumberPrefix_data;
				console.log(trafficfinesSelf.accepProvinceCode + ' ' +trafficfinesSelf.accepCityCode);
				$('#cardNum').html(trafficfinesSelf.carNumberPrefix);
				$('#city').html(trafficfinesSelf.city);
				back();


			});
		});
	};

	//车辆类型选择
	Trafficfines.prototype.carTypeClick = function(){ 
		$('#carType div').on("click", function(){ 
			$(this).addClass('raido-on').removeClass('raido-off');
			$(this).siblings().addClass('raido-off').removeClass('raido-on');
			trafficfinesSelf.itemValue = $(this).attr('title');
		})
	}

	//获取到省份后执行
	Trafficfines.prototype.provinceCheck = function() {
		if (trafficfinesSelf.carCodeLen === '0') {
			$("#chassis_number").attr('placeholder', '不用输入车架号');
		} else if (trafficfinesSelf.carCodeLen === '99') {
			$("#chassis_number").attr('placeholder', '请输入完整车架号');
		} else {
			$("#chassis_number").attr('placeholder', '车架号后' + trafficfinesSelf.carCodeLen + '位');
		}

		if (trafficfinesSelf.carEngineLen === '0') {
			$("#engine_number").attr('placeholder', '不用输入发动机号');
		} else if (trafficfinesSelf.carEngineLen === '99') {
			$("#engine_number").attr('placeholder', '请输入完整发动机号');
		} else {
			$("#engine_number").attr('placeholder', '发动机号后' + trafficfinesSelf.carEngineLen + '位');
		}
	};

	/**
	 * 点击“违章查询”按钮，
	 */
	Trafficfines.prototype.fine_Query = function() {
		this.car_number_val = this.car_number.getToEmptyValue();
		this.chassis_number_val = this.chassis_number.getToEmptyValue();
		this.engine_number_val = this.engine_number.getToEmptyValue();
		var self = this;

		if (this.car_number_val == null || this.car_number_val.length == 0) {
			Bestpay.Toast.makeText('请输入车牌号', Bestpay.Toast.LENGTH_SHORT);
			return;
		} else if (trafficfinesSelf.carCodeLen !== '0' && (this.chassis_number_val == null || this.chassis_number_val.length == 0)) {
			Bestpay.Toast.makeText('请填写车身架号', Bestpay.Toast.LENGTH_SHORT);
			return;
		} else if (trafficfinesSelf.carEngineLen !== '0' && (this.engine_number_val == null || this.engine_number_val.length == 0)) {
			Bestpay.Toast.makeText('请填发动机号', Bestpay.Toast.LENGTH_SHORT);
			return;
		}
		self.orderPageJson = {};
		self.orderPageJson['car_number_val'] = trafficfinesSelf.carNumberPrefix + '' + this.car_number_val;
		self.orderPageJson['chassis_number_val'] = this.chassis_number_val;
		self.orderPageJson['engine_number_val'] = this.engine_number_val;

		trafficfinesSelf.mailRecept.clearValue(); //清空收件人
		trafficfinesSelf.mailMobile.clearValue(); //清空收件人手机号码
		trafficfinesSelf.mailAddress.clearValue(); //清空邮寄地址

		showDialog(config.MSG.loading);
		self.stpyque(); //52) 交通罚款查询 STpy001
	};


	/**
	 *   52) 交通罚款查询 STpy001
	 */
	Trafficfines.prototype.stpyque = function() {

		var self = this;
		HTTP.callCPSService({
			'service': config.CPS.STPYQUE,
			'params': self.stpyqueParams(),
			'showLoading': false,
			'success': self.stpyqueSuccessCallback,
			'error': self.stpyqueErrorCallback
		});
	};

	/**
	 *52) 交通罚款查询 STpy001 构造请求参数
	 */
	Trafficfines.prototype.stpyqueParams = function() {
		var self = this;
		var params = {
			'searchNo': self.orderPageJson['car_number_val'], //违章车牌号
			'carType': trafficfinesSelf.itemValue, //车辆类型    02:小车       01：大车
			'carCode': self.orderPageJson['chassis_number_val'], //	违章车架号
			'carDriveNum': self.orderPageJson['engine_number_val'], //违章发动机号
			'provinceId': trafficfinesSelf.accepProvinceCode, //违章省份编码
			'cityId': trafficfinesSelf.accepCityCode, //违章城市编码
			'carOwner': "" //违章车辆所有人
		};
		
				/*var params = {
					'searchNo': '粤L9H401', //违章车牌号
					'carType': '02', //车辆类型    02:小车       01：大车
					'carCode': '644599', //	违章车架号
					'carDriveNum': '3968', //违章发动机号
					'provinceId': 44, //违章省份编码
					'cityId': 4413, //违章城市编码
					'carOwner': "" //违章车辆所有人
				};*/
		params = HTTP.setCPSCommonParams(params);
		console.log("交通罚款查询 STpy001 入参=======" + JSON.stringify(params));
		return params;
	};
	//
	//    /**
	//     * 52) 交通罚款查询 STpy001 成功回调函数
	//     */
	Trafficfines.prototype.stpyqueSuccessCallback = function(result) {
		if (result.code !== config.RES.SUCCESS) {
			if (result.code == config.RES.MONEY_NOT_ENOUGH) {
				Bestpay.Dialog.showAlertDialog('提醒', '余额不足' ,'确定', result.code, function() {
				});
				//back();
				return;
			}

			if (result.code == config.RES.PASSWORD_ERROR_LOCKED_002136) { 
				Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code, function() { 
					App.exitCompleteApp();
				});
			}else{ 
				Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
			}
			return;
		}
		console.log("交通罚款查询 STpy001出参========" + JSON.stringify(result));

		trafficfinesSelf.sureOrder.carOwner = result.carOwner == null ? '' : result.carOwner; //车辆所有人
		trafficfinesSelf.sureOrderPage = {}; //清空订单信息

		trafficfinesSelf.violationRecord = JSON.parse(result.violationRecord.replace('\"', '"'));
		trafficfinesSelf.systemNo = result.systemNo; //系统参考号

		//未查到违章记录
		if (!trafficfinesSelf.violationRecord.length) {
			dismissDialog();
			Bestpay.Dialog.showAlertDialog('查询结果', '恭喜！未查到违章记录。', '确定', '');
			return;
		}

		$('#carOwner').html(trafficfinesSelf.sureOrder.carOwner); //车主姓名
		$('#orderCount').html(trafficfinesSelf.violationRecord.length); //违章数量

		console.error("systemNo:===============================" + trafficfinesSelf.systemNo)

		//trafficfinesSelf.accepProvinceCode = 44; //--------------------------------删掉
		trafficfinesSelf.arrRecordJson = []; //清空数据
		$("#id_confirm_wrap_illegal").html(''); //清空模板
		trafficfinesSelf.canProcess = false; //重置数据 可否办理
		trafficfinesSelf.violationRecord.forEach(function(record, i) {
			trafficfinesSelf.arrRecordJson[i] = {};
			var arrRecordJson = trafficfinesSelf.arrRecordJson[i];
			var time = record['time'].split(' ');
			arrRecordJson['punish_number'] = record['archive']; //违章项文书编号
			arrRecordJson['violation_day'] = time[0]; //违章时间
			arrRecordJson['violation_hour'] = time[1]; //违章时间
			arrRecordJson['illegal_place'] = record['location']; //违章地点
			arrRecordJson['illegal_reasons'] = record['reason']; //违章原因
			arrRecordJson['license_points'] = record['degree']; //违章扣分
			arrRecordJson['penal_sum'] = parseFloat(record['count']).toFixed(2); //违章罚款金额
			arrRecordJson['overdue_fine'] = parseFloat(record['latefine']).toFixed(2); //滞纳金
			arrRecordJson['agency_fee'] = parseFloat(record['cooperPoundge'] * 1 + 5).toFixed(2); //手续费

			//酬金 = 违章罚款金额 + 滞纳金 + 手续费
            trafficfinesSelf.rewardself = trafficfinesSelf.arrRecordJson[i]['reward'] =  record['count']*1 + record['latefine']*1 + (record['cooperPoundge'] * 1 + 5);
            console.log('手续费' + arrRecordJson['agency_fee']);
            console.log('count' + record['count']);
            console.log('latefine' + record['latefine']);
            console.log('cooperPoundge' + (record['cooperPoundge'] * 1 + 5));
            console.log('酬金 = 违章罚款金额 + 滞纳金 + 手续费' + trafficfinesSelf.rewardself);
			

			//是否可以代办

			if (record['canProcess'] === "0") {
				arrRecordJson['handling_state'] = '不可办理';
				//arrRecordJson['bl_check'] = 'notCleck';
				arrRecordJson['hz_display'] = 'none';
			} else if (record['canProcess'] === "1") {
				console.log(trafficfinesSelf.accepProvinceCode + '-------------------------')
				if (trafficfinesSelf.accepProvinceCode == '44') {
					//trafficfinesSelf.hzTips = true;
					$("#need_receipt").show(); //回执
				} else {
					$("#need_receipt").hide(); //回执
				}
				arrRecordJson['handling_state'] = '可办理';
				arrRecordJson['bl_check'] = i; //勾选办理
				arrRecordJson['hz_display'] = 'block';
				trafficfinesSelf.canProcess = true;
			}
		});
		console.error(JSON.stringify(trafficfinesSelf.arrRecordJson))
		var recodTemplate = new UI.Template();
		recodTemplate.template_MoreToOne("illegal_JSON", "id_confirm_wrap_illegal", trafficfinesSelf.arrRecordJson);

		dismissDialog();
		goTo(config.page.illegal, function() {
			//if (trafficfinesSelf.hzTips) {
				//$('#hztips').show();
			//}

			//勾选办理
			var bl_code = null;
			var hz_code = [];
			$('.bl_check').on('click', function() {
				var code = $(this).data('code');
				console.error('code: ' + code);
				if ($(this).hasClass('raido-on')) {
					$(this).removeClass('raido-on');
					bl_code = null;
				} else {
					$('.bl_check').removeClass('raido-on');
					$(this).addClass('raido-on');
					bl_code = code;
					console.error("arrRecordJson==========================" + JSON.stringify(trafficfinesSelf.arrRecordJson[bl_code]))
					trafficfinesSelf.sureOrder['penal_sum'] = parseInt(trafficfinesSelf.arrRecordJson[bl_code]['penal_sum']);
					trafficfinesSelf.sureOrder['orderSeq'] = trafficfinesSelf.arrRecordJson[bl_code]['punish_number']; //订单号
					trafficfinesSelf.sureOrder['TempID'] = trafficfinesSelf.violationRecord[bl_code]['secondaryUniqueCode']; //违章记录详情		
					trafficfinesSelf.sureOrder['cooperPoundge'] = parseInt(trafficfinesSelf.arrRecordJson[bl_code]['agency_fee']); //代办费
					trafficfinesSelf.sureOrderPage['Name'] = ''; //收件人
					trafficfinesSelf.sureOrderPage['Phone'] = ''; //收件人手机
					trafficfinesSelf.sureOrderPage['Address'] = ''; //邮寄地址

					console.error('orderSeq=============' + trafficfinesSelf.arrRecordJson[bl_code]['punish_number']);
				}
			});

			//勾选回执
			$('#need_receipt').on('click', function() {
				var hzcode = trafficfinesSelf.arrRecordJson.bl_code;
				if ($(this).hasClass('raido-on')) {
					$(this).removeClass('raido-on').addClass('raido-off');
					$("#sendPost_id").removeClass('sendPostShow');
					$("#hz_or_not").val("no");
				} else {
					$(this).addClass('raido-on').removeClass('raido-off');;
					$("#sendPost_id").addClass('sendPostShow');
					$("#hz_or_not").val("yes");
				}
			});

			//下拉菜单事件
			$(".illegal_list").on("click",function(){ 
				var subItem = $(this).parent().next(".sub-item");
				if($(this).hasClass("action-up")){ 
					$(this).removeClass('action-up');
					subItem.removeClass('show-sub-item');
				}else{ 
					$(this).addClass('action-up');
					subItem.addClass('show-sub-item');
				}
			});


			document.getElementById('btn_sure').onclick = function() { //违章确定  下一步
				if (!trafficfinesSelf.canProcess) {
					Bestpay.Dialog.showAlertDialog('温馨提示', '当前没有可缴费的记录！', '确定', '', function() {
						back();
					});
					return;
				}
				if (bl_code === null) {
					Bestpay.Toast.makeText('请选择一张订单', Bestpay.Toast.LENGTH_SHORT);
					return;
				}

				if ($("#hz_or_not").val() === 'yes') {
					trafficfinesSelf.isPost = 'true';
					//去填回执地址
					var mailMobile_val = trafficfinesSelf.mailMobile.getToEmptyValue();
					if (!trafficfinesSelf.mailRecept.getValue()) {
						Bestpay.Toast.makeText('请填写收件人', Bestpay.Toast.LENGTH_SHORT);
						return;
					} else if (!mailMobile_val) {
						Bestpay.Toast.makeText('请填写收件人电话号码', Bestpay.Toast.LENGTH_SHORT);
						return;
					}else if(mailMobile_val.length > 0 && (mailMobile_val.length < 11 || mailMobile_val.length > 11)){
						Bestpay.Toast.makeText("您输入的手机号码长度错误！", Bestpay.Toast.LENGTH_SHORT);
						return;
					}else if (!trafficfinesSelf.mailAddress.getValue()) {
						Bestpay.Toast.makeText('请填写收件人地址', Bestpay.Toast.LENGTH_SHORT);
						return;
					}

					trafficfinesSelf.sureOrderPage['Name'] = trafficfinesSelf.mailRecept.getValue(); //收件人
					trafficfinesSelf.sureOrderPage['Phone'] = trafficfinesSelf.mailMobile.getValue(); //收件人手机
					trafficfinesSelf.sureOrderPage['Address'] = trafficfinesSelf.mailAddress.getValue(); //邮寄地址
				} 

				console.log('=================go to 酬金 ==================');
				console.log("sureOrderPage==" + JSON.stringify(trafficfinesSelf.sureOrderPage));
				trafficfinesSelf.itJudgeLocalStorage = new UI.JudgeLocalStorage();
				trafficfinesSelf.itJudgeLocalStorage.checkOrder( trafficfinesSelf.sureOrderPage['searchNo'], trafficfinesSelf.sureOrderPage['amount_val']*1,HTTP.getCurrentTime(),function(){
					trafficfinesSelf.queryStart(); //查询开始
					trafficfinesSelf.callQuickTradingQuery(); //免密查询

					//成功的时候载入动画
					trafficfinesSelf.defferred.done(trafficfinesSelf.goPayAnimation);
				},trafficfinesSelf.businessName);
			};
		});
	};


	Trafficfines.prototype.gotoOrder = function(val) { 
		HTTP.getRandomServices(function(result){
            var retJson = result;
            //未找到酬金结算方式，不进行酬金计算, 也当做成功了，酬金为零
            if (result.code === config.RES.SUCCESS) {
                trafficfinesSelf.random = result.randNum;
            }
            trafficfinesSelf.gotoRecharge(val);
        },false);
	}

	/*
	 * 查询开始
	 */
	Trafficfines.prototype.queryStart = function(){ 
		var self = this;

		//新建一个延迟对象
		self.defferred = $.Deferred();
		showDialog();
	};


	/*
	 * 查询结束
	 * 去订单页面
	 */
	Trafficfines.prototype.queryEnd = function(){ 
		var self = this;
		var pluginParam = {
			businessName:self.businessName,
			accountName: '交通罚款', //[string] 充值账号名称
			accouontValue: self.sureOrderPage['searchNo'], //[string] 充值账号值
			rechargeMoney: self.sureOrderPage['amount_val'], //[string] 充值金额(元)
			rewardMoney: self.sureOrderPage['reward'], //[string] 酬金查询/折价查询 的金额
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
	Trafficfines.prototype.goPayAnimation = function() { 
		console.log("done=========================")
		$("#order_comfirm").removeClass("backPayAnimation").addClass('goPayAnimation');
	};




	//
	//    /**
	//     * 52) 交通罚款查询 STpy001 失败回调函数
	//     */
	Trafficfines.prototype.stpyqueErrorCallback = function(result) {
		if (result.code === config.RES.MONEY_NOT_ENOUGH) {
			Bestpay.Dialog.showAlertDialog('提醒', '余额不足', '确定', result.code,function() {
			});
			return;
		}
	};



	//交通罚款违章订单查询
	Trafficfines.prototype.stpyOrderQuery = function() {
		var self = this;
		HTTP.callCPSService({
			'service': config.CPS.STPY_ORDER,
			'params': trafficfinesSelf.stpyOrderqueParams(),
			'showLoading': false,
			'success': trafficfinesSelf.stpyOrderqueSuccessCallback,
			'error': trafficfinesSelf.stpyOrderqueErrorCallback
		});
	};

	//交通罚款违章订单查询  请求参数
	Trafficfines.prototype.stpyOrderqueParams = function() {
		var self = this;
		var params = {
			"searchNo": trafficfinesSelf.orderPageJson['car_number_val'], //违章车牌号
			"searchTime": Lang.getDate_YYYYMMDD() + '' + Lang.getTime_HHMMSS() //查询时间
		};
		params = HTTP.setCPSCommonParams(params);
		console.log("交通罚款违章订单查询 STpy002 入参=======" + JSON.stringify(params));
		return params;
	};

	//交通罚款违章订单查询  成功回调函数
	Trafficfines.prototype.stpyOrderqueSuccessCallback = function(result) {
		if (result.code !== config.RES.SUCCESS) {
			//Bestpay.Dialog.alert(result.content + '(' + result.code + ')');
			Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
		}
		console.log("交通罚款违章订单查询 STpy002出参========" + JSON.stringify(result));
	};


	/**
	 * 免密交易查询接口                            免密的接口
	 */
	Trafficfines.prototype.callQuickTradingQuery = function() {
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
	Trafficfines.prototype.quickTradingQueryParams = function() {
		var self = this;
		var params = {};
		params = HTTP.setCPSCommonParams(params);
		console.log("免密交易查询接口入参" + JSON.stringify(params));
		// alert("免密的入参");
		return params;
	};

	/**
	 * 免密交易查询接口 成功回调函数               免密的回调函数callback
	 */
	Trafficfines.prototype.quickTradingQuerySuccessCallback = function(result) {
		console.log("=======免密交易查询成功=======");

		if (result.code !== config.RES.SUCCESS) {
			Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
			return;
		}
		//返回值成功 000000

		console.log("免密交易查询接口出参" + JSON.stringify(result));
		trafficfinesSelf.quickTranInfo = {
			'perAmount': result.perAmount,
			'allAmount': result.allamount,
			'allTransAction': result.alltransaction
		};
		trafficfinesSelf.handleIsneedpassword();
	};

	/**
	 * 判断要不要输入密码    要传递的信息passMap  put进一个是否需要输入密码的值
	 * @param amount 要充值的金额（以元为单位）
	 */

	Trafficfines.prototype.handleIsneedpassword = function() {
		var self = this;
		//  alert("免密判断是否输入密码");
		var quickTranInfo = trafficfinesSelf.quickTranInfo;
		var amount = Lang.yuan2fen(trafficfinesSelf.sureOrder['penal_sum'] + trafficfinesSelf.sureOrder['cooperPoundge']);
		console.log("amount : " + amount);
		console.log("quickTranInfo : " + JSON.stringify(quickTranInfo));
		if (amount * 1 <= 1 * quickTranInfo.perAmount && (amount * 1 + 1 * quickTranInfo.allTransAction) <= 1 * quickTranInfo.allAmount) {
			//	免密
			trafficfinesSelf.noPwd = false;
		} else {
			//	加密
			trafficfinesSelf.noPwd = true;
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
    Trafficfines.prototype.getFinancialProducts = function(){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.FINANCIAL_PRODUCTS,
            'params' : self.getFinancialProductsParams(),
            'showLoading' : false,
            'success' : self.getFinancialProductsSuccessCallback
        });
    };

    /*企业理财用户理财产品列表查询 请求参数*/
    Trafficfines.prototype.getFinancialProductsParams = function () {
        var self = this;
        var params = {};
        params = HTTP.setCPSCommonParams(params);
        return params;
    };

    /**
     * 企业理财用户理财产品列表查询 成功回调函数
     */
    Trafficfines.prototype.getFinancialProductsSuccessCallback = function (result) {
		if (result.code !== config.RES.SUCCESS) {
			if(result.code === '018888'){ 
				trafficfinesSelf.fundAccountBalanceInquiry(); //资金账户余额查询 SAcc003
				return;
			}else{ 
				Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
				return;
			}
		}
        var list = result['datas'];//用户产品列表
        for(var i=0;i<list.length;i++)
        {
            trafficfinesSelf.orderPageJson['productId'] =list[i]['productId']; //产品ID
            trafficfinesSelf.orderPageJson['userId'] =list[i]['userId']; //userId
            trafficfinesSelf.orderPageJson['tyb_amount'] = Lang.fen2yuan(list[i]['balance']); //添益宝余额
        }

        trafficfinesSelf.fundAccountBalanceInquiry();     //资金账户余额查询 SAcc003
    };
    

    /**
     * 42) 资金账户余额查询 SAcc003
     */
    Trafficfines.prototype.fundAccountBalanceInquiry = function(){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.CCOUNT_BALANCE_QUERY,
            'params' : self.fundAccountBalanceInquiryParams(),
            'showLoading' : false,
            'success' : self.fundAccountBalanceInquirySuccessCallback
        });
    };

    /*资金账户余额查询 请求参数*/
    Trafficfines.prototype.fundAccountBalanceInquiryParams = function () {
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
    Trafficfines.prototype.fundAccountBalanceInquirySuccessCallback = function (result) {
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
                    trafficfinesSelf.orderPageJson['jfy_amount'] =  Lang.fen2yuan(activeBalance);
                    break;
                }
            }
        }
        if(config.CARD_TYPE.BANK_MODE_FUND_POOL_MEMBER_CARD === trafficfinesSelf.userInfo.bankMode){
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
			
            trafficfinesSelf.orderPageJson['jfy_amount'] = Lang.fen2yuan(sub_bankMode);
            console.log("子卡＝＝＝＝trafficfinesSelf.orderPageJson['jfy_amount']=="+trafficfinesSelf.orderPageJson['jfy_amount']);
        }

        trafficfinesSelf.getCommission(); //酬金查询接口
    };






	/**
	 * 点击“下一步”按钮， 酬金查询
	 */
	Trafficfines.prototype.getCommission = function() {
		var self = this;
		console.log("酬金查询金额：" + Lang.yuan2fen(trafficfinesSelf.sureOrder['penal_sum']));
        console.log('酬金 = 违章罚款金额 + 滞纳金 + 手续费' + trafficfinesSelf.rewardself);
		HTTP.getCommission(config.BUS_TYPE.BUS_TYPE_TRAFFIC_FINES, config.BUS_CODE.TRAFFIC_FINES, config.BUS_CODE.TRAFFIC_FINES,trafficfinesSelf.rewardself, function(result) {
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
			trafficfinesSelf.reward = retJson.commission;
			console.log('commission=================' + retJson.commission);
			showDialog(config.MSG.loading);

			trafficfinesSelf.initConfirm(); //订单初始化界面
		}, false);
	};


	/**
	 * 初始化确定订单界面
	 */
	Trafficfines.prototype.initConfirm = function() {
		var self = this;
		console.log("订单页面初始化");

		$('#mailAddress').hide();

		trafficfinesSelf.sureOrderPage['searchNo'] = (trafficfinesSelf.orderPageJson['car_number_val']).toUpperCase();
		trafficfinesSelf.sureOrderPage['carOwner'] = trafficfinesSelf.sureOrder['carOwner'];
		trafficfinesSelf.sureOrderPage['amount_val'] = trafficfinesSelf.sureOrder['penal_sum'] + trafficfinesSelf.sureOrder['cooperPoundge'];
		trafficfinesSelf.sureOrderPage['reward'] = trafficfinesSelf.reward;

		if (!!trafficfinesSelf.sureOrderPage['Address']) {
			$('#mailAddress').show();
		}

		console.log(JSON.stringify(trafficfinesSelf.sureOrderPage))

		//成功
		self.queryEnd();
	};

	/**
	 * 触发立即充值
	 */
	Trafficfines.prototype.gotoRecharge = function(val) {
		var self = this;
		/*self.mobile_val = trafficfinesSelf.itMobile.getToEmptyValue(); //请输入11位的顾客手机号码
		if (trafficfinesSelf.mobile_val.length >= 1 && trafficfinesSelf.mobile_val.length < 11) {
			Bestpay.Toast.makeText('请输入11位的顾客手机号码', Bestpay.Toast.LENGTH_SHORT);
			return;
		} else if (trafficfinesSelf.mobile_val.length == 11 && Lang.getPhoneOperators(trafficfinesSelf.mobile_val) == '') {
			Bestpay.Toast.makeText('您输入的手机号号码段不正确', Bestpay.Toast.LENGTH_SHORT);
			return;
		}*/

        config.TRADE_LIST_QUERY_NUMBER = self.orderPageJson['car_number_val'];
        config.isBack = function(){
          back();
        };
		HTTP.getRandomServices(function(result) {
			var retJson = result;
			//未找到酬金结算方式，不进行酬金计算, 也当做成功了，酬金为零
			if (result.code === config.RES.SUCCESS) {
				trafficfinesSelf.random = result.randNum;
			}
			trafficfinesSelf.transportationFinesPayment(val); // 48) 交通罚款缴费 TTpy003
		}, false);

	};

	/**
	 *  48) 交通罚款缴费 TTpy003
	 */
	Trafficfines.prototype.transportationFinesPayment = function(val) {

		var self = this;
		HTTP.callCPSService({
			'service': config.CPS.TRANSPORTATION_FINES_PAYMENT,
			'params': trafficfinesSelf.transportationFinesPaymentParams(val),
			'showLoading': true,
			'success': trafficfinesSelf.transportationFinesPaymentSuccessCallback,
			'error': trafficfinesSelf.transportationFinesPaymentErrorCallback
		});
	};
	/**
	 *交通罚款缴费 TTpy003 构造请求参数
	 */
	Trafficfines.prototype.transportationFinesPaymentParams = function(val) {
		var self = this;
		var valStr = "";
        if(val != null && val != ""){
            valStr = val;
        }
		console.log('trafficfinesSelf.carEngineLen == ' + trafficfinesSelf.carEngineLen);
		var params = {
			'passWord': Bestpay.Security.encryptPassword(self.userInfo.staffCode,valStr,self.random), //支付卡密码
			'payAmount': Lang.yuan2fen(trafficfinesSelf.sureOrderPage['amount_val']), //支付金额
			'systemNo': trafficfinesSelf['systemNo'], //系统参考号
			'payCardCode': self.orderPageJson['car_number_val'], //违章车牌号
			'carEngine': self.orderPageJson['engine_number_val'], //违章发动机号
			'carCode': self.orderPageJson['chassis_number_val'], //	违章车架号
			'isPost': trafficfinesSelf.isPost, //是否为邮寄地址
			'orderConfig': "{\"Name\":\"" + trafficfinesSelf.sureOrderPage['Name'] + "\",\"Phone\":\"" + trafficfinesSelf.sureOrderPage['Phone'] + "\",\"CardNo\":\"\",\"Address\":\"" + trafficfinesSelf.sureOrderPage['Address'] + "\"}", //上门代收及回执邮寄详情
			'preOrderDetails':"[{\"TempID\":\"" + trafficfinesSelf.sureOrder['TempID'] + "\"}]", //违章记录详情
			'orderSeq': Lang.getDate_YYYYMMDD() + '' + Lang.getTime_HHMMSS(), //订单号
			'payTime': Lang.getDate_YYYYMMDD() + '' + Lang.getTime_HHMMSS() //缴费时间
		};
	
		params['phone']='';
		
		if(self.userInfo.hadEpt.toString()== '1'){
            params.costWay = self.paymentPlugin.getPayType();;
            params.productId = self.productId;
            params.userId =self.orderPageJson['userId'] ;
        }
		params = HTTP.setCPSCommonParams(params);
		params['preOrderDetails'] = ["{\"TempID\":\"" + trafficfinesSelf.sureOrder['TempID'] + "\"}"];
		//'preOrderDetails': [{"TempID": trafficfinesSelf.sureOrder['TempID']}]
		
		console.log("交通罚款缴费 TTpy003 入参=======" + JSON.stringify(params));
		trafficfinesSelf.sureOrderPage['orderSeq'] = params['orderSeq'];
		return params;
	};
	//
	//    /**
	//     * 交通罚款缴费 TTpy003 成功回调函数
	//     */
	Trafficfines.prototype.transportationFinesPaymentSuccessCallback = function(result) {
		console.log("result===========" + JSON.stringify(result));

		//隐藏键盘
		PasswordKeyBoard.hideKeyboardUI3();

		if (result.code !== config.RES.SUCCESS) {
			if (result.code == config.RES.MONEY_NOT_ENOUGH) {
				Bestpay.Dialog.showAlertDialog('提醒', '余额不足' ,'确定', result.code,function(){
					trafficfinesSelf.itJudgeLocalStorage.putLocalValue("","","","");
				});
				return;
			}
			if(result.code == "009002" || result.code == "006751") { 
				trafficfinesSelf.paymentPlugin.setOrderDisplay('overtime'); //超时
				goTo(config.page.page_float);
				return;
			}
			if (result.code == '019998') {
				Bestpay.Dialog.showAlertDialog('交易结果', '系统处理失败，请稍后再试' ,'确定', result.code, function(){ 
					back();
					trafficfinesSelf.itJudgeLocalStorage.putLocalValue("","","","");
				});
				return;
			}
			if(result.code == config.RES.PASSWORD_ERROR_LOCKED_002136){ //输入密码错误次数超过三次，退出app
				Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code, function() {
					App.exitCompleteApp();
					trafficfinesSelf.itJudgeLocalStorage.putLocalValue("","","","");
				});
			}else{
				Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code,function(){
					back();
					trafficfinesSelf.itJudgeLocalStorage.putLocalValue("","","","");
				});
			}
			return;
		}
		//if (trafficfinesSelf.mobile_val.length > 0) {
			//HTTP.sendSmsCertificate(result.transSeq, trafficfinesSelf.mobile_val, ''); //交易凭证短信下发
		//}
		trafficfinesSelf.itJudgeLocalStorage.putLocalValue("","","","");
		trafficfinesSelf.paymentPlugin.setOrderDisplay('success'); //成功
		goTo(config.page.page_float);

        config.isBack = function(){
            if(window.jqXHR.readyState > 2) {   //window.jqXHR.readyState 判断请求有没有发出去
                Bestpay.App.exitApp();
            }
        };

	};
	//
	//    /**
	//     * 交通罚款缴费 TTpy003  失败回调函数
	//     */
	Trafficfines.prototype.transportationFinesPaymentErrorCallback = function(result) {
		console.log("result error===========" + JSON.stringify(result))
		if (result.code === config.RES.MONEY_NOT_ENOUGH) {
			trafficfinesSelf.itJudgeLocalStorage.putLocalValue("","","","");
			//Bestpay.Dialog.alert(config.RES.MONEY_NOT_ENOUGH_MSG);
			Bestpay.Dialog.showAlertDialog('提醒', '余额不足', '确定', result.code, function() {
			});
			return;
		}
	};
	return Trafficfines;
});