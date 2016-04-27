define(['jquery-jtemplates',"static"],function(jtemplates,Static){



	/************************************************************************************
	 * Location2.db的操作
	 * <br>2、省市代码相关方法：GetProviceCode、GetCityCode、isCityOnly、getProvinces、getProvince
	 ***********************************************************************************/
	var ReadDataBase = {
		DBName : "location.db",
		DBName1:"cardlist.sqlite"
	};

	/**
	 * execute data sql
	 * @param service
	 * @param action
	 * @param args   参数
	 * @returns {*}
	 */
	var exec_transfer = function(service,action,args) {
		var json = {
			"service": service,
			"action": action
		};
		//console.log(" ~~~~~~~~~~~~~~~~ " +JSON.stringify(args)+"   "+JSON.parse(args));
		var result_str = prompt(JSON.stringify(json), JSON.stringify(args));
		var result;
		try {
			result = JSON.parse(result_str);
		} catch (e) {
			console.error(e.message);
		}

		var status = result.status;
		var message = result.message;

		if (status == 0) {

			return message;
		} else {
			console.error("service:" + service + " action:" + action + " error:" + message);
		}
	}

	/**
	 * 原生对话框ID
	 */
	var dialogId = 0;
	var pageIds = new Array();
	var bankCodeLength = 0;
	var removeOnback = false; //返回按钮是否可用
	function switchPageId(id, obj) {
		if(rzType=="1"&&id=="choseShop"){
			document.title ="选择认证类型";
		}

		if(id === 'authorityPage') { 
			var title = $("#setTitle").val() + '';
		    //设置标题    1是企业商户   0是个体商户 2员工认证
			if(title === "1"){ 
				document.title ="企业商户认证";
			}else if(title === "0"){ 
				document.title ="个体商户认证";
			}else if(title === "2"){ 
				document.title ="员工认证";
			}
		}
	}
	function toNextPage(id, obj) {

		PasswordKeyBoard.hideKeyboardUI3();//隐藏键盘
		var element = document.getElementById(pageIds[pageIds.length - 1]);

		if(id!="selectBankDiv"){
			element.style.display = 'none';
		}else{
			$("#selectBank_background").show();
		}
		
		document.getElementById(id).style.display = 'block';
		scroll(0, 0);
		var len = pageIds.length;
		pageIds[len] = id;
		if(!titleName[id+"_title"]){
			document.title = "翼支付+";
			App.setTitle("翼支付+");
		}else{
			document.title =  titleName[id+"_title"];
			App.setTitle(titleName[id+"_title"]);
		}
		//console.log("document.title--------------------"+document.title);
		//switchPageId(id, obj);
		console.log("pageIds.length=================="+pageIds.length)
	}

	function back() {
		console.log("back()------->"+pageIds.length);
		if($("#rechargeSuccessPage") !='undefined' && $("#rechargeSuccessPage") != undefined){
			$("#rechargeSuccessPage").hide();//	
		}
		//如果三证合一框在显示状态就隐藏
		if(show321){ 
			$('#alert_3to1').hide();
			show321 = false;
			return;
		}

		PasswordKeyBoard.hideKeyboardUI3();//隐藏键盘
		var len = pageIds.length;
		if (len == 1) {
			App.exitApp();
			return;
		}
		// 
		var oldId = pageIds.pop();

		var element = document.getElementById(oldId);
		element.style.display = 'none';
		if(oldId=="selectBankDiv"){
			$("#selectBank_background").hide();
		}
        if(oldId=="rechargeSuccessPage"){ //交费易银行卡转入成功页面
            App.exitApp();
        }
        if(oldId=="page_zhuangrusuccess"){  //添益宝银行卡转入成功页面
            App.exitApp();
        }
		onPageClose(oldId);

		//
		len = pageIds.length;
		var id = pageIds[len - 1];
		if(id == "page0"){
			App.exitApp();
			return;
		}

		//console.log("id------------>"+id);
		if(faZhState==true && id=="jiaoFeiYiRechargePage"){
			App.setThresholdBtnIsVisable(true);//显示阀值按钮true 显示
		}else{
			App.setThresholdBtnIsVisable(false);//显示阀值按钮true 显示
		}
		
		if(!titleName[id+"_title"]){
			document.title = "翼支付+";
			App.setTitle("翼支付+");
		}else{
			document.title =  titleName[id+"_title"];
			App.setTitle(titleName[id+"_title"]);
		}
		element = document.getElementById(id);
		window.scroll(0,0);
		element.style.display = 'block';
		switchPageId(id);
	}
	function onPageClose(id){
	}
	/**
	 *
	 */
	function onback(event) {
		
		if(removeOnback){ return; } //移除返回事件

		if (event == "backpress") {
			back();
		}
	}

	/*
	 * 设置是否屏蔽返回按钮
	 */
	var disableOnback = { 
		disable: function(){ 
			removeOnback = true;
		},
		able: function() { 
			removeOnback = false;
		}
	};

	var titleName = {
		"accountTypePage_title" : "选择账户",
		"jiaoFeiYiRechargePage_title":"充值",
		"zijRchargePage_title":"资金充值",
		"rechargeConfirmPage_title":"订单确认",
		"rechargeSuccessPage_title":"订单确认",
		"unbundling_title" : "银行卡解绑",
		"unbund_dialog_title":"解绑成功",
		"unbund_dialog2_title":"解绑失败",
		"updateAuthPage_title":"修改认证",
		"geRenAuthPage_title":"个人认证",
		"qiYeAuthPage_title":"企业认证",
		"bindCardPage_title":"添加银行卡",
		"updateFaZhiPage_title":"充值安全设置",
		"addFaZhiPage_title":"充值安全阀值设置",
		"quickBindCardPage_title":"安全验证",//"快捷绑卡",
		'bandKaSuccess_title' : '绑卡成功',
		"bangFuTongBindCardPage_title":"帮付通绑卡",
		"authselectdizPage_title":"选择地区",
		"selectBankDiv_title":"添加银行卡",
		"supportBankListPage_title":"支持银行列表",
		"merchantNamePage_title":"商户名称",
		"applicantNamePage_title":"申请人姓名",
		"choseShop_title":"选择认证类型",
		"authorityPage_title":"修改认证",
		"nextAuthorityPage_title":"证件上传",
		"nextQiYeAuthorityPage_title":"企业认证",
		"serviceProtocalPage_title":"代扣协议",
		"passVailPage_title":"密码校验",
		"yingYeNoPicDiv_title":"营业执照",
		"auth_profession_title":"修改认证",
		"company_code_title":"填写所属公司",
		"company_chackout_title":"所属企业",
        "page_change_can_pay_title" : "支付密码",
        "page_zhuangrusuccess_title" : "转入成功"
	};
	var Utils ={
		logoList : {
			"866000" : "images/bank/yzyh.png",//中国邮政储蓄银行
			"866100" : "images/bank/zgyh.png",//中国银行
			"866200" : "images/bank/gsyh.png",//中国工商银行
			"866300" : "images/bank/nyyh.png",//中国农业银行
			"866400" : "images/bank/jtyh.png",//交通银行
			"866500" : "images/bank/jsyh.png",//中国建设银行
			"866600" : "images/bank/msyh.png",//中国民生银行
			"866700" : "images/bank/hxyh.png",//华夏银行
			"866800" : "images/bank/gfyh.png",//广发银行
			"866900" : "images/bank/zsyh.png",//招商银行
			"867000" : "images/bank/gzyh.png",//广州银行
			"867200" : "images/bank/gdyh.png",//光大银行
			"867400" : "images/bank/zxyh.png",//中信银行
			"867600" : "images/bank/xyyh.png",//兴业银行
			"865700" : "images/bank/payh.png",//平安银行
			"865500" : "images/bank/shyh.png",//上海银行
			"867100" : "images/bank/pfyh.png" //浦发
		},
		showDialog : function(msg) {
			if (dialogId != 0) {
				this.dismissDialog();
			}
			if (msg == null || msg == "") {
				msg = "正在提交订单,请稍候...";
			}
			dialogId = Dialog.showProgressDialog("", msg);
		},

		dismissDialog : function() {
			if (dialogId == 0) {
				return;
			}
			Dialog.dismissDialog(dialogId);
			dialogId = 0;
		},
		getKeep : function(){//获取keep值
			var keep = "";
			var date = new Date();
			var y = date.getFullYear();
			var m = date.getMonth()+1;
			m = m<10 ? "0" + m : m;
			var d = date.getDate() < 10 ? "0"+date.getDate() : date.getDate();
			var h = date.getHours() < 10 ? "0"+date.getHours() : date.getHours();
			var f = date.getMinutes() < 10 ? "0"+date.getMinutes() : date.getMinutes();
			var s = date.getSeconds() < 10 ? "0"+date.getSeconds() : date.getSeconds();
			var rand = Math.round(Math.random()*8999+1000);
			keep = "440106003094"+y+""+m+""+d+""+h+""+f+""+s+""+rand;
			return keep;
		},
		//获取时间
		getOrderSeq : function(){
			var keep = "";
			var date = new Date();
			var y = date.getFullYear();
			var m = date.getMonth()+1;
			m = m<10 ? "0" + m : m;
			var d = date.getDate() < 10 ? "0"+date.getDate() : date.getDate();
			var h = date.getHours() < 10 ? "0"+date.getHours() : date.getHours();
			var f = date.getMinutes() < 10 ? "0"+date.getMinutes() : date.getMinutes();  
			var s = date.getSeconds() < 10 ? "0"+date.getSeconds() : date.getSeconds();
			var rand = Math.round(Math.random()*899+100);
			keep = y+""+m+""+d+""+h+""+f+""+s+""+rand;
			return keep;
		},
		getTime : function(){
			var time = "";
			var date = new Date();
			var y = date.getFullYear();
			var m = date.getMonth()+1;
			m = m<10 ? "0" + m : m;
			var d = date.getDate() < 10 ? "0"+date.getDate() : date.getDate();
			var h = date.getHours() < 10 ? "0"+date.getHours() : date.getHours();
			var f = date.getMinutes() < 10 ? "0"+date.getMinutes() : date.getMinutes();  
			var s = date.getSeconds() < 10 ? "0"+date.getSeconds() : date.getSeconds();
			time = y+""+m+""+d+""+h+""+f+""+s;
			return time;
		},
		getRandomParams : function(){
			var params = {
				"bisChannel" : bisChannel,
				"clientVersion" : deviceInfo.clientVersion,
				"imei" : "",
				"imsi" : "",
				"merId" : "8613052900079605",
				"model" : deviceInfo.model,
				"signVer" : "2",
				"channelCode" : "20",
				"softwareType" : deviceInfo.systemType,
				"vender" : deviceInfo.vender,
				"tmnNum" : Utils.getTmnNumber(),
				"keep" : Utils.getKeep()
			};
			return params;
		},
		
		getUtilParams : function(){
			var deviceInfo ;
			if(androidOrIos == 'ios'){
				deviceInfo = App.getDeviceInfo();
			}else{
				deviceInfo = JSON.parse(App.getDeviceInfo());
			}
			var params = {
				"bisChannel" : bisChannel, //  业务渠道  01：Android客户端   02：iOS客户端
  				"clientVersion" :  deviceInfo.clientVersion, // 客户端版本号
  				"imei" : '868033018056319',//deviceInfo.imei,  //硬件IMEI
        		"imsi" : '460016981605425',//deviceInfo.imsi, //手机卡
        		"model": deviceInfo.model,
				"signType": "RSA",
				"softwareType": "翼支付+",
				"systemType": deviceInfo.systemType,
				"systemVersion": deviceInfo.systemVersion,
				"vender" : deviceInfo.vender,
				"tmnNum":Utils.getTmnNumber(),
				"merId":"8613052900079605"//Utils.getMerId()
			};
			return params;
		},

		getDeviceInfo:function(params){
			var deviceInfo = "";
			if(androidOrIos == 'ios'){
				deviceInfo = App.getDeviceInfo();
			}else{
				deviceInfo = JSON.parse(App.getDeviceInfo());
			}
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

			params["signType"] = "RSA";
			return params;
		},
		urlParameters : function(urlParame){
			var url;
			if(urlParame==null){
				url=document.URL;
			}else{
				url=urlParame;
			}
			if (url.lastIndexOf("#") != -1) {
				url = url.substring(0, url.lastIndexOf("#"));
			}
			var para = "";
			var retJson={};
			if (url.lastIndexOf("?") > 0) {
				para = url.substring(url.lastIndexOf("?") + 1, url.length);
				var arr = para.split("&");
				para = "";
				for (var i = 0; i < arr.length; i++) {
					retJson[arr[i].split("=")[0]]=arr[i].split("=")[1];
				}
				console.log("url-------------"+JSON.stringify(retJson));
			} else {
				console.log("没有参数!");
			}
			return retJson;
		},
		/**
		 * 终端号
		 */
		getTmnNumber : function(){
			var tmnNum = "";
				switch(ENV){
				case PRODUCT:
				case PRE_PRODUCT:
					tmnNum = "440106014022";
					break;
				case PUBLIC:
				case ENV44:
				case ENV46:
					tmnNum = "440106003094";
					break;
				default:
					tmnNum = "440106014021";			
				}
			return tmnNum;		
		},
		/**
		 * 接入机构编码
		 * @return
		 */
	 getMerId:function() {
		var  merId = "";
			switch(ENV){
			case PRODUCT:
			case PRE_PRODUCT:
				merId = "8604400000143100";
				break;
			case PUBLIC:
			case ENV44:
			case ENV46:
				merId = "8613051700001006";
				break;
			default:
				merId = "8613052900079605";			
			}
		return merId;//8613101200002508
	},
		
		
		alert : function(msg,callback,btn){
			//Dialog.alert(msg);
			if(btn == null){
				btn = "确定";
			}
			Dialog.showAlertDialog('提醒', msg, btn, '', callback);
				/*if(callback!= null && callback != undefined)
					callback();*/
		},
		alertDoubleBtn : function(id1,id2,id3,id4,msg,msg1,callback){
			document.getElementById(id1).style.display="block";
			document.getElementById(id2).innerHTML = msg;
			document.getElementById(id3).innerHTML = msg1;
			document.getElementById(id3).onclick = function(){
				if(callback!= null && callback != undefined){
					callback();
				}
				document.getElementById(id1).style.display="none";
				//撤销屏蔽返回键
				disableOnback.able();
			}
			document.getElementById(id4).onclick = function(){
				document.getElementById(id1).style.display="none";
				//撤销屏蔽返回键
				disableOnback.able();
			}
			//屏蔽返回键
			disableOnback.disable();
		},
		alertNewDoubleBtn : function(id1,id2,id3,id4,msg,msg1,callback,id5,callback2,msg2,msg3){
			if(msg3 != null && msg3 != undefined){
				document.getElementById(id3).innerHTML = msg3;
			}
			document.getElementById(id1).style.display="block";
			document.getElementById(id2).innerHTML = msg;
			document.getElementById(id3).innerHTML = msg1;
			document.getElementById(id5).innerHTML = msg2;
			document.getElementById(id3).onclick = function(){
				if(callback!= null && callback != undefined){
					callback();
				}
				document.getElementById(id1).style.display="none";
				//撤销屏蔽返回键
				disableOnback.able();
			}
			document.getElementById(id4).onclick = function(){
				console.log("--------------------------"+callback2);
				document.getElementById(id1).style.display="none";
				if(callback!= null && callback != undefined){
					console.log("--------------------------");
					callback2();
				}
				//撤销屏蔽返回键
				disableOnback.able();
			}
			//屏蔽返回键
			disableOnback.disable();
		},
		logoToBank : function(id,bankCode){
			document.getElementById(id).src = Utils.logoList[bankCode];
		},
		/**
		 * tab 切换
		 * @param {Object} id0 父元素
		 * @param {Object} id1 子元素1
		 * @param {Object} id2 子元素2
		 * @memberOf {TypeName} 
		 */
		tabChange : function(id0,id1,id2){
			var tabs = $("#"+id0).children();
			Utils.hiddenElt(id1,id2);
			//var id = this.id;
			Utils.tab1Show(tabs[0]);
			Utils.tab2Show(tabs[1]);
//			$(tabs[0].children[0]).css("margin-left","20px").css("color","#ffffff");
//			$(tabs[0].children[1]).css("display","block");
//			$(tabs[0]).css("background-color","#0097FE");
			
			$(tabs[1]).css("background-color","#ffffff");
			$(tabs[1].children[0]).css("margin-left","0px").css("color","#000000");
			$(tabs[1].children[1]).css("display","none");
			tabs.each(function(){
				this.onclick =function(){
					var id = this.id;
					$(this.children[0]).css("margin-left","20px").css("color","#ffffff");
					$(this.children[1]).css("display","block");
					$(this).css("background-color","#0097FE");
					if("tab1" == id){
//						$(tabs[1]).css("background-color","#ffffff");
//						$(tabs[1].children[0]).css("margin-left","0px").css("color","#000000");
//						$(tabs[1].children[1]).css("display","none");
						Utils.tab2Show(tabs[1]);
						Utils.hiddenElt(id1,id2);
						faZhState = true;
						if(bindBankState){
							App.setThresholdBtnIsVisable(true);//显示阀值按钮true 显示
						}
					}else if("tab2" == id){
//						$(tabs[0]).css("background-color","#ffffff");
//						$(tabs[0].children[0]).css("margin-left","0px").css("color","#000000");
//						$(tabs[0].children[1]).css("display","none");
						Utils.tab2Show(tabs[0]);
						Utils.hiddenElt(id2,id1);
						faZhState = false;
						App.setThresholdBtnIsVisable(false);//显示阀值按钮true 显示
					}
				};
			});
		},
		tab1Show : function(elt){
			$(elt.children[0]).css("margin-left","20px").css("color","#ffffff");
			$(elt.children[1]).css("display","block");
			$(elt).css("background-color","#0097FE");
			
		},
		tab2Show : function(elt){
			$(elt).css("background-color","#ffffff");
			$(elt.children[0]).css("margin-left","0px").css("color","#000000");
			$(elt.children[1]).css("display","none");
		},
		hiddenElt : function(id1,id2){
			document.getElementById(id1).style.display="block";
			document.getElementById(id2).style.display="none";
		},
		isNumber : function(number,maxNo,minNo){
			if(number == "" || isNaN(number)==true){
				return false;
			}
			if(number > maxNo || number < minNo){
				return false;
			}
			return true;
		},
		sendPostRequest : function(requesturl, params, success_callback,error_callback) {
			var name = "ran" + Math.floor(Math.random() * 100 + 1);
			var value = Date.parse(new Date());
			requesturl = requesturl + "?" + name + "=" + value;
			console.log("requesturl:"+requesturl);
			// console.log("params:"+JSON.stringify(params));
			if(error_callback == null || error_callback == "undefined"){
				error_callback = function(XMLHttpRequest,textStatus,errorThrown) {
					//隐藏键盘
					PasswordKeyBoard.hideKeyboardUI3();
					console.log(XMLHttpRequest.status +" "+XMLHttpRequest.readyState+"   textStatus:"+textStatus+" \n errorThrow"+errorThrown);
					Utils.dismissDialog();

					Dialog.showAlertDialog('提醒', "⊙_⊙网络不给力哦，请检查后再试哈", '确定', '');
					//Dialog.alert( "⊙_⊙网络不给力哦，请检查后再试哈");
					//console.error("请求失败:" + requesturl);
				}
			}
			var successCallback = function(result){
				var resultMsg = Security.verifySign(result);
				if(resultMsg != null && resultMsg==="false") {
					// Bestpay.Toast.makeText('验签失败',Bestpay.Toast.LENGTH_SHORT);
						Dialog.showAlertTwoBtnDialog('验签失败', '您目前的网络可能存在安全隐患，请修改网络环境，如涉及交易，请联系客服查询订单状态。', '重新登录', '取消', '', function (code) {
						User.login();
					});
					return;
				}
				success_callback(result);
			};

			try {
				$.ajax({
					url : requesturl,
					type : "POST",
					data : JSON.stringify(params),
					timeout : 1000000,
					contentType : "application/json; charset=utf-8",
					dataType : "json",
					success : successCallback,
					error : error_callback
				});
			} catch (e) {
				console.error(e.message);
				Utils.dismissDialog();
				Dialog.showAlertDialog('提醒', "⊙_⊙网络不给力哦，请检查后再试哈", '确定', '');
				//Dialog.alert( "⊙_⊙网络不给力哦，请检查后再试哈");
			}
		},
		sendPostXmlRequest : function(requesturl, params, success_callback,error_callback,id1,id2,id3,id4) {
			console.log("requesturl------>"+requesturl);
			if(error_callback == null || error_callback == "undefined"){
				error_callback = function(XMLHttpRequest,textStatus,errorThrown) {
					Utils.dismissDialog();
					console.log(XMLHttpRequest.responseText+"---------"+XMLHttpRequest.status+"-------------"+textStatus);
				}
			}

		try {
				$.ajax({
					url : requesturl,
					type : "POST",
					data :params,
					timeout : 600000,
					beforeSend: function(xhr) {
			           xhr.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/sharepoint/soap/GetAttachmentCollection");
			        },
					contentType : "text/xml;charset=utf-8",
					dataType : "text",
					success : success_callback,
					error : error_callback
				});
			} catch (e) {
				console.error(e.message);
				Utils.dismissDialog();
			}
		},
		getSQLiteData: function getSQLiteData() {//数据库查询
				var result = DB_Data.getCardList();
				console.log("CardList-- result:" + JSON.stringify(result));
				var bankinfoJson = result;
				return bankinfoJson;
		},
		loadXml : function(xml){
			var oParser = new DOMParser();
			var xmlDoc = oParser.parseFromString(xml, "text/xml");
			return xmlDoc;
		},
		/**
		 * 非空验证
		 * @param input_0  待输入的文本框的id
		 * @param info     提示的消息
		 * @param input_1  转接的文本输入框id(可选)
		 */
		notEmptyVail:function(input_0,info,input_1){
			if(input_1 == null || input_1 == undefined){
				if($("#"+input_0).val().trim().length == 0 ){
					$("#"+input_0).val("");
					Toast.makeText(info,LENGTHLONG);
					return false;
				}
				$("#"+input_0).val($("#"+input_0).val().trim());
				return true ;
			}else{
				if($("#"+input_1).val().trim().length == 0 ){
					$("#"+input_1).val("");
					Toast.makeText(info,LENGTHLONG);
					return;
				}
				$("#"+input_0).val($("#"+input_1).val().trim());
				$("#"+input_1).val($("#"+input_1).val().trim());
				back();
			}
		},
			conditionNotEmptyVail:function(inputId,info){
				if($("#"+inputId).text().trim().length == 0 ){
					$("#"+inputId).text("");
					Toast.makeText(info,LENGTHLONG);
					return false;
				}
				$("#"+inputId).text($("#"+inputId).text().trim());
				return true ;
			}
		,
		emailVail:function emailVail(input_id){
			if(input_id != null &&  input_id != undefined) {
				//邮箱要进行格式验证  /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
				var reCat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
				if ($("#" + input_id).val().trim().length == 0 || !reCat.test($("#" + input_id).val().trim())) {
					Toast.makeText("请填写有效联系邮箱",LENGTHLONG);
					return false;
				}
				return true;
			}
			Toast.makeText("请输入正确的申请人邮箱地址",LENGTHLONG);
		},
		idCardVail:function idCardVail(input_id){
			if(input_id != null &&  input_id != undefined) {
				//身份证号码要进行格式验证   /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
				var reCat = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
				if ($("#" + input_id).val().trim().length == 0 || !reCat.test($("#" + input_id).val().trim())) {
					Toast.makeText("请输入正确的身份证号码",LENGTHLONG);
					return false;
				}
				return true;
			}
			Toast.makeText("请输入正确的身份证号码",LENGTHLONG);
		},
		bankNoVail:function bankNoVail(input_id) {
			if (input_id != null && input_id != undefined) {
				//银行卡号要进行格式验证    /^\d{16}|\d{19}$/;
				var bankNo =  $("#" + input_id).val().replace(/\s+/g,"");
				var reCat = /^\d{16}|\d{19}$/;
				if(bankNo.toString().trim().length == 0 ){
					Toast.makeText("请输入银行账号",LENGTHLONG);
					return false;
				}
				if (!reCat.test(bankNo.toString().trim())) {
					Toast.makeText("您请输入的银行账号长度有误",LENGTHLONG);
					//Toast.makeText("请输入正确的银行卡号",LENGTHLONG);
					return false;
				}
				return true;
			}
			Toast.makeText("请输入银行账号",LENGTHLONG);
		},
		phoneNumVail:function phoneNumVail(input_id){
			if (input_id != null && input_id != undefined) {
				//电话号码要进行格式验证    /1[3|5|7|8|][0-9]{9}$/;
				var bankNo =  $("#" + input_id).val().replace(/\s+/g,"");
				var reCat = /^1[3|5|7|8|][0-9]{9}$/;
				if (bankNo.toString().trim().length == 0 || !reCat.test(bankNo.toString().trim())) {
					Toast.makeText("请输入正确的手机号码",LENGTHLONG);
					return false;
				}
				return true;
			}
			Toast.makeText("请输入正确的手机号码",LENGTHLONG);
		}
	};
    //点击事件的触模事件
    var clickBtnNext = function(){
        //手指按向按钮
        var cont_btn=$(".btn-common-out");
        cont_btn.on("touchstart",function(){
            $(this).css({'background-color' : '#e27100'})
        });
        cont_btn.on("touchend touchmove touchcancel",function(){
            $(this).css({'background-color' : '#ff7f00'})
        });
    };
    clickBtnNext();

	
	
	return{
		pageIds : pageIds,
		toNextPage : toNextPage,
		onback : onback,
		back : back,
		sendPostRequest : Utils.sendPostRequest,
		sendPostXmlRequest : Utils.sendPostXmlRequest,
		showDialog : Utils.showDialog,
		dismissDialog : Utils.dismissDialog,
		getKeep : Utils.getKeep,
		getUtilParams : Utils.getUtilParams,
		alert : Utils.alert,
		logoToBank : Utils.logoToBank,
		loadXml : Utils.loadXml,
		getTime : Utils.getTime,
		tabChange : Utils.tabChange,
		getOrderSeq : Utils.getOrderSeq,
		isNumber : Utils.isNumber,
		alertDoubleBtn : Utils.alertDoubleBtn,
		alertNewDoubleBtn :Utils.alertNewDoubleBtn,
		getRandomParams : Utils.getRandomParams,
		getRandom : Utils.getRandom,
		notEmptyVail:Utils.notEmptyVail,	//add —  author:Rg  文本框非空验证
		conditionNotEmptyVail:Utils.conditionNotEmptyVail, //add - author:Rg  非文本框非空验证
		ReadDataBase:ReadDataBase,//add —  author:Rg			 本地访问数据库文件
		getSQLiteData:Utils.getSQLiteData,
		emailVail:Utils.emailVail,//add —  author:Rg			 email格式验证
		idCardVail:Utils.idCardVail, // add — author:Rg		 身份证号验证
		bankNoVail:Utils.bankNoVail, //add — author：Rg		 银行卡号验证
		phoneNumVail:Utils.phoneNumVail,	//add — author：Rg  手机号码验证
		exec_transfer:exec_transfer,
		getDeviceInfo:Utils.getDeviceInfo,
		urlParameters: Utils.urlParameters
	};
});