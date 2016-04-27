define(['utils'],function(Utils){
	var RZPassWordType="";//校验认证、绑卡的
	/**
	 * false 开起阀值 true 修改阀值
	 * @type Boolean
	 */
	var openOrModify = false;
	/**
	 * ZJ 资金归集
	 * JCK 翼充卡点击充值时获取溢价
	 * JFY 交费易
	 * ReC 翼充卡确认界面点击支付
	 * JB 解绑
	 * @return {TypeName}
	 */
	var COMEFROM = {
		'ZJ' : '0',
		'JCK' : '1',
		'JFY' : '2',
		'ReC' : '3',
		'JB' : '4',
		'RZ' : '5',
		"AF":'6',
		"CF":'7',
		"SF" :'8',
        'TYB' : '9'
	};
	/**
	 * 判断金额是否满足要求
	 * true 满足要求 反之false
	 * @return {TypeName}
	 */
	var trueFlag = new Array();

    var submitOpen = true; //提交订单
	/**
	 * 阀值验证的结果
	 */
	var faZhiVailResult = new Array() ;
	
	/**
	 * 单笔 单位分
	 */
	var ONEFAZHI = 500000;
	/**
	 * 累计阀值 单位分
	 */
	var MONTHFAZHI = 1000000;

	var bankNum = null;

	console.log("orderSeq------------------->"+Utils.getOrderSeq());
    var info = "";
    if(androidOrIos == "ios"){
    	info = User.getSuccessLoginInfo();
    }else{
    	info = JSON.parse(User.getSuccessLoginInfo());
    }

	if(info.prtnCode != null){
		merId = info.prtnCode;
	}
	var productNo = User.getProduct();
    var custCode = info.custCode;
    var staffCode = info.staffCode;
	/**
	 * 商户类型 代理商 Pt901 其他普通商户
	 */
	var prinType = info['prinType'];
    var hadEpt = info['hadEpt'];  //判断添益宝是否开户 0为未开户   1为开户
    var regType = info['regType']; //判断是个体商户还是企业商户   0是个体商户   1是企业商户
	var bankMode = info['bankMode'];//资金管理模式（BT1001：普通卡，BT1002：资金子母卡，BT1013：资金池母卡，BT1014：资金池子卡）
	var set1="";
	var accId="";
    var indexTianyibaoValue = '1' ; //充入银行卡为1    充入添益宝为2
    var productId = '0030001';    //添益宝产品Id
    var userId = '' ;  //添益宝的userId
    var zhuangru_true = false;    //银行卡转入添益宝的判断
    var zhuanru_money_text_val = '' ;  //添益宝银行卡的充值金额输入框
    var zhuanru_passWord = '' ;  //添益宝支付密码输入框
    var balance = '';   //添益宝的余额总额
    var confirmWorkDay = ''; //收益日期
    var confirmWorkWeek = ''; //收益星期
    var otherSelfrMaxvalue = '';
    var otherSelfsingleMaxvalue = '';
    var otherSelfyMaxvalue = '';
    var otherSelfactiveBalance = '';
	var notSufficientFunds = '';


    $(function(){

		//tybFunds添益宝    jfyFunds交费易
		var GetNotSufficientFunds = function (){
			var urlFunds = location.href;
			notSufficientFunds = urlFunds.substr(urlFunds.lastIndexOf("JUDGE=")+6,8);
			console.log("123 urlFunds" + urlFunds);
			console.log("123 notSufficientFunds = " + notSufficientFunds);
			if(notSufficientFunds =="tybFunds"){
				console.log("添益宝charge 123 = notSufficientFunds= tybFunds = " + notSufficientFunds);
				indexTianyibaoValue = '2' ; //充入银行卡为1    充入添益宝为2
				$('.block-radioCom:eq(1)').addClass('block-radio-checked');
				$('.block-radioCom:eq(0)').removeClass('block-radio-checked');
				$('#re_money_One_Parent_JFY_input').hide();   //交费易文本框
				$('#re_money_One_Parent_TYB_input').show();   //添益宝文本框
				$("#nextStepBtn").html("下一步");
			}else{
				console.log("交费易charge 123 = notSufficientFunds= jfyFunds = " + notSufficientFunds);
				indexTianyibaoValue = '1' ; //充入银行卡为1    充入添益宝为2
				$('.block-radioCom:eq(0)').addClass('block-radio-checked');
				$('.block-radioCom:eq(1)').removeClass('block-radio-checked');
				$('#re_money_One_Parent_JFY_input').show();   //交费易文本框
				$('#re_money_One_Parent_TYB_input').hide();   //添益宝文本框
				$("#nextStepBtn").html("确定");
			}
			console.log('123indexTianyibaoValue tybFunds= ' + indexTianyibaoValue);
		};

        //切换充值入交费易和添益宝的tab键
        $('.block-radioCom').click(function(){
            var indexTianyibaoCom = $('.block-radioCom').index($(this));
            indexTianyibaoValue = $(this).data('value');
            console.log(indexTianyibaoValue + ' = indexTianyibaoValue');
            $('.block-radioCom').removeClass('block-radio-checked').eq(indexTianyibaoCom).addClass('block-radio-checked');
            console.error('indexTianyibaoValue = ' + indexTianyibaoValue);
            comparefour();
            $_id('re_money_1').value = '';
            $_id('re_money_TYB').value = '';
			$_id("id_Handling_Charge").innerHTML ="0";//手续费
            $('.bank_span').html('');  //添益宝输入金额下面的红色提示文字
            if(indexTianyibaoValue == '1'){    //1为交费易
                $('#re_money_One_Parent_JFY_input').show();   //交费易文本框
                $('#re_money_One_Parent_TYB_input').hide();   //添益宝文本框
				$("#nextStepBtn").html("确定");

            }else{
                $('#re_money_One_Parent_JFY_input').hide();   //交费易文本框
                $('#re_money_One_Parent_TYB_input').show();   //添益宝文本框
				$("#nextStepBtn").html("下一步");

            }
        });
        if(hadEpt == '1'){
            //indexTianyibaoValue = '1' ; //充入银行卡为1    充入添益宝为2
            $('.block-radioCom:eq(0)').addClass('block-radio-checked').css({
                'width' : '50%'
            });
            $('.block-radioCom:eq(1)').removeClass('block-radio-checked').css({
                'width' : '50%',
                'display' : 'block'
            });
			GetNotSufficientFunds();////tybFunds添益宝    jfyFunds交费易

        }else{
            indexTianyibaoValue = '1' ; //充入银行卡为1    充入添益宝为2
            $('.block-radioCom:eq(0)').addClass('block-radio-checked').css({
                'width' : '100%'
            });
            $('.block-radioCom:eq(1)').removeClass('block-radio-checked').css({
                'display' : 'none'
            })
        }
        console.error('indexTianyibaoValue = ' + indexTianyibaoValue);

		$("#re_money_1").blur(function(){
			handlingCharge();
		});

		console.log("prinType = "+prinType);
		//if(prinType == "PT901"){//代理商不支持 翼充卡转账
		//	$("#outertabchange").hide();
		//	$("#onlyBankRecharge").show();
		//}else{
			$("#onlyBankRecharge").hide();
			$("#outertabchange").show();
		//}

		window.threshold_recharge = function (){

			$_id("fazDelBtn").className = "del";
			$("#paypwdUpdateZhiFu").blur();
			selectFaZhi();

            App.setFinishIconHidden(); //右上角的阀值的完成按钮隐藏
		};

    	/**
	     * productType  0:不支持产品线；1:资金归集；2：手机交费易；3双产品线（资金归集、手机交费易）
	     */

		console.log("info  ---------------->"+JSON.stringify(info));
		productType = info['productType'];
		console.log("productType--------------------->"+productType);
		if("0" == productType){
			Dialog.showAlertDialog('提醒',  ERROR['noProduct'], '确定', '');
	        //Dialog.alert( ERROR['noProduct']);
	        return;
	    }else if("1" == productType){
			Utils.pageIds.push("page0");
			getAccount();//调用余额查询，查看账户余额；
		}else if("2" == productType){//手机交费易
			Utils.pageIds.push("page0");
		   // Utils.tabChange("tabchange","bankRecharge","yiChKRecharge");
			getAccount();//调用余额查询，查看账户余额；
		}else if("3" == productType){
			Utils.pageIds.push("page0");
			$("#brg_amount").hide();
			getAccount();//调用余额查询，查看账户余额；

			//Utils.pageIds.push("accountTypePage");
			//初始化界面
			//$("#accountTypePage").show();
			//initRechargeUi();
	    }

		//UI3.0
		//资金管理模式（BT1001：普通卡，BT1002：资金子母卡，BT1013：资金池母卡，BT1014：资金池子卡）
		if(bankMode == 'BT1001' || bankMode == 'BT1013'){
			$("#brg_amount").show();
		} else {
			$("#brg_amount").hide();
		}
		if(prinType == "PT901"){
			$("#brg_amount").hide();
		}

        $_id('open_tianyibao_btn').onclick = function(){   //点击去开通添益宝按钮
            //跳到跳到添益宝页面
            console.log('jumpToNewTianyibao ABC');
            App.jumpToNewTianyibao();
            console.log('jumpToNewTianyibao ABC2222');
        };
        var cont_btn=$(".open_tianyibao_btn");
        cont_btn.on("touchstart",function(){
            $(this).addClass("cont_hover");
        });
        cont_btn.on("touchend touchmove touchcancel",function(){
            $(this).removeClass("cont_hover");
        });


	    
		$("#jiaofyReClick").click(function(){
			getAccount();//调用余额查询，查看账户余额；
			initRechargeUi();
		});
		//资金充值按钮
		$_id("zijReClick").onclick = function(){
			hiddenDelBtns();
			getBindCardState(COMEFROM['ZJ']);
		};
		$_id("yizfRechargeBtn").onclick = function(){
			if(trueFlag['errorNotice2']){
				appreciationQuery();
			}else{
				Toast.makeText(ERROR['moneyError1'],LENGTHLONG);
			}

		}
		//关闭阀值
		$("#closeFaZhi").click(function () {

			PasswordKeyBoard.initPwdUI3(function(val){
				getRandom(COMEFROM['CF'],val);
			});
			PasswordKeyBoard.popKeyboardUI3();
			//if (PasswordKeyBoard.keyStr == "" || PasswordKeyBoard.keyStr.length == 0) {
			//	Toast.makeText("请输入支付密码！",LENGTHLONG);
			//	return;
			//}
			//if (PasswordKeyBoard.keyStr.length < 6) {
			//	Toast.makeText("请输入正确的6-12位支付密码！",LENGTHLONG);
			//	return;
			//}
			//getRandom(COMEFROM['CF']);
		});
		//2016.03.16
		//$_id("bindCardList").onclick = setT;//解绑

		$_id("re_money_1").addEventListener('input',inputVerifyMoney,false);//交费易银行充值
		$_id("re_money_2").addEventListener('input',inputVerifyMoney,false);//交费易翼充卡充值
		$_id("cardPwd").addEventListener('input',inputVerify,false);//
		$_id("cardNo").addEventListener('input',inputVerify,false);//
		$_id("re_money_3").addEventListener('input',inputVerifyMoney,false);//资金归集充值
		///////////////////////input border style change start/////////////////////////////
		$("#re_money_3").focus(function(){
			$("#zijPwdInput").removeClass("containterborderall-select").addClass("containterborderall");
			$("#zijRecInput").removeClass("containterborderall").addClass("containterborderall-select");
		});
		
		$("#quickBankPrePhone").focus(function(){
			$("#bankPwdLine").removeClass("containterborderall-select").addClass("containterborderall");
		});
		$("#msgVerifyCode").focus(function(){
			$("#bankPwdLine").removeClass("containterborderall-select").addClass("containterborderall");
		});
		$("#oneFaZhi").focus(function(){
			$("#setFzhPwd").removeClass("containterborderall-select").addClass("containterborderall");
		});
		$("#dayFaZhi").focus(function(){
			$("#setFzhPwd").removeClass("containterborderall-select").addClass("containterborderall");
		});
		///////////////////////input border style change end/////////////////////////////
		/**
		 * 密码校验
		 */
		$_id("goRenZheng").onclick = function(){
			//getRandom(COMEFROM['RZ']);
			PasswordKeyBoard.initPwdUI3(
				function(val){
					getRandom(COMEFROM['RZ'],val);
				}
			);
			PasswordKeyBoard.popKeyboardUI3();
		}
		//开启阀值
		$("#addFaZhi").click(function () {
			var one  = $("#oneFaZhi").val();
			var day  = $("#dayFaZhi").val();
			if(one == ""){
				Toast.makeText("单笔限额不能为空",LENGTHLONG);
				return ;
			}
			if(day == ""){
				Toast.makeText("累积限额不能为空",LENGTHLONG);
				return ;
			}

			if($("#oneFaZhi").val() > (ONEFAZHI * 1 / 100) ){
				Toast.makeText('单笔限额最高只能设置为' + (ONEFAZHI * 1 / 100)  + "元",LENGTHLONG);
				return ;
			}
			if($("#dayFaZhi").val() > (MONTHFAZHI * 1 / 100) ){
				Toast.makeText('累积限额最高只能设置为' + (MONTHFAZHI * 1 / 100) + "元",LENGTHLONG);
				return ;
			}
			//if (PasswordKeyBoard.keyStr == "" || PasswordKeyBoard.keyStr.length == 0) {
			//	Toast.makeText("请输入支付密码！",LENGTHLONG);
			//	return;
			//}
			//if (PasswordKeyBoard.keyStr.length < 6) {
			//	Toast.makeText("请输入正确的6-12位支付密码！",LENGTHLONG)
			//	return;
			//}
			PasswordKeyBoard.initPwdUI3(function(val){
				getRandom(COMEFROM['AF'],val);
			});
			PasswordKeyBoard.popKeyboardUI3();

		});
		
		//修改阀值
		$("#updateFaZhi").click(function () {
			$("#oneFaZhi").attr("placeholder","单笔阀值:最高可设置为"+(parseInt(ONEFAZHI) / 100) + "元");
			$("#dayFaZhi").attr("placeholder","累计阀值:最高可设置为" + (parseInt(MONTHFAZHI) / 100) + "元");
			PasswordKeyBoard.initPwdId("paypwdAddZhiFu");
			$("#oneFaZhi").val("");
			$("#dayFaZhi").val("");
			$_id("fazhkDelBtn").className = "del";
			Utils.toNextPage("addFaZhiPage");
		});



		$("#goBalanQuery").click(function(){
			App.goBalanQuery();
		});
		initKeyBord();
    });
    /**
     * hidden behind of input del button
     */
    function hiddenDelBtns(){
		$(".containterborderall .del_1").removeClass("del_1").addClass("del");
		$(".containterborderall-select .del_1").removeClass("del_1").addClass("del");
    }
    function initRechargeUi(){
    	//默认显示银行卡充值，翼充卡隐藏
    	$("#bankRecharge").show();
    	$("#yiChKRecharge").hide();
    	
    	//Utils.tabChange("tabchange","bankRecharge","yiChKRecharge");
    	$("#re_money_1").val("");
    	$("#cardNo").val("");
    	$("#cardPwd").val("");
    	$("#re_money_2").val("");
    	$("#re_money_3").val("");
    	$("#zijpwd").val("");
    	hiddenDelBtns();
    }
	/**
	 * 初始化原生键盘
	 */
	function initKeyBord(){
		$("#paypwdUpdateZhiFu").click(function () {
			PasswordKeyBoard.keyInputId="paypwdUpdateZhiFu";
			PasswordKeyBoard.popPswKeyboard();
		});
		$("#paypwdAddZhiFu").click(function () {
			$("#setFzhPwd").removeClass("containterborderall").addClass("containterborderall-select");
			PasswordKeyBoard.keyInputId="paypwdAddZhiFu";
			PasswordKeyBoard.popPswKeyboard();
		});
		$("#paypwd").click(
			function () {
				$("#bankPwdLine").removeClass("containterborderall").addClass("containterborderall-select");
				PasswordKeyBoard.keyInputId="paypwd";
				PasswordKeyBoard.popPswKeyboard();
			});
		$("#paypwdRenZheng").click(
			function () {
				PasswordKeyBoard.keyInputId="paypwdRenZheng";
				PasswordKeyBoard.popPswKeyboard();
			});


		$("#zijpwd").click(
			function () {
				$("#zijRecInput").removeClass("containterborderall-select").addClass("containterborderall");
				$("#zijPwdInput").removeClass("containterborderall").addClass("containterborderall-select");
				PasswordKeyBoard.popPswKeyboard();
				PasswordKeyBoard.keyInputId="zijpwd";
			});
		$("#passwordPlaceholder").click(
			function () {
				PasswordKeyBoard.popPswKeyboard();
				PasswordKeyBoard.keyInputId="passwordPlaceholder";
			});
	}
	
	/**
	 * 密码校验
	 */
	function pswVail(psw,JSONResult2){

		var params = {
		 "bisChannel": bisChannel,
		 "bluemac": "",
		 "channelCode": "20",
		 "clientVersion": deviceInfo.clientVersion,
		 "custCode":custCode,
		 "imei":"",
		 "keep":Utils.getKeep(),
		 "password":psw,
		 "staffCode":staffCode,//登陆账号
		 "tmnNum": "440106003094",
		 "merId":merId,
		 "vender": "Android",
		 "verifyLevel": "001",
		 "verifyType": "0001",
		 "wifimac": ""
	}
		Utils.getDeviceInfo(params);
		var sign = Security.getSign(params);
		params["sign"] = sign;
		params["signVer"] = "2";

		var psw_call_back = function(JSONResult){
			PasswordKeyBoard.hideKeyboardUI3();
			Utils.dismissDialog();
			console.log("outprint:"+JSON.stringify(JSONResult));
			if(JSONResult.code == "000000"){
				//PasswordKeyBoard.initPwdId("paypwdRenZheng");
				$("#paypwdRenZheng").val("");
				//Utils.back();
				if(prinType == "PT901"){//代理商不支持 翼充卡转账
					console.log("走向绑卡界面");
					//RZPassWordType="";
					var loadingCb=function(JResult){
						 console.log("刷新------------------------");
						 if(JResult=="2"){
						    App.exitApp();
						 }else if(JResult=="1"){
						 	location.reload();
						 }
					}
					App.jumpToNewH5View(BK_URl,loadingCb);
				}else 
				if(RZPassWordType=="A01"){
					console.log("走向认证界面");
					//RZPassWordType="";
					var loadingCb=function(JResult){
						location.reload();
						//Utils.back();
					}
					App.jumpToNewH5View(RZ_Url,loadingCb);

				}else if(RZPassWordType=="A02"){
					console.log("走向绑卡界面");
					//RZPassWordType="";
					var loadingCb=function(JResult){
						 console.log("刷新------------------------"+JResult);
						 if(JResult=="2"){
						    App.exitApp();
						 }else if(JResult=="1"){
						 	location.reload();
						 }
					}
					App.jumpToNewH5View(BK_URl,loadingCb);
				}else{
					goAddFaZhi(JSONResult2);
				}
//					if(JSONResult == null){
//						//App.jumpToNewH5View(RZ_Url);
//					}else{
//						goAddFaZhi(JSONResult2);
//					}
			}else{
				vailPsw =  false ;
				if(JSONResult.code == "002136"){
					Dialog.showAlertDialog('提醒', JSONResult.content, '确定', '', function(){
						App.exitCompleteApp();
				    	return;
					});
				}else{ 
					Dialog.showAlertDialog('提醒', JSONResult.content, '确定', '');
				}
			}
		}
	Utils.showDialog("请稍候...");
	Utils.sendPostRequest(URL+"MLgn001", params, psw_call_back,null);
}

function inputVerifyMoney(){
	var patrn=/^(([1-9]{1}\d*)|([0]{1}))(\.(\d){1,2})?$/;
	this.value=this.value.replace(/[^\d.]/g,'');
	var id = this.id;
	id = id.substring(id.length-1,id.length);
	var errorId = "errorNotice" + id;
	if(this.value.indexOf(".") !=-1){
		this.value = this.value.substring(0,this.value.indexOf('.')+3);
	}
	var va = this.value;
	if(patrn.test(va)){
		errorNotice(errorId,true);
	}else{
		errorNotice(errorId,false);
	}
}
function inputVerify(){
	this.value=this.value.replace(/[^\d]/g,'');
	var patrn=/^(([1-9]{1}\d*)|([0]{1}))(\.(\d){1,2})?$/;
		var id = this.id;
		id = id.substring(id.length-1,id.length);
		var errorId = "errorNotice" + id;
		var va = this.value;
//		if(patrn.test(va)){
			errorNotice(errorId,true);
			if(this.id=="cardPwd" && this.value.length>6){
				this.value = this.value.substring(0,6);
			}else if(this.id=="cardNo" &&  this.value.length>16 ){
				this.value = this.value.substring(0,16);
			}
//		}else{
//			errorNotice(errorId,false);
//			$("#"+this.id).val("");
//		}
	}
	function errorNotice(id,flag){
		trueFlag[id] = flag;
		if(flag){
			$("#"+id).hide();
		}else{
			$("#"+id).show();
		}
	}

	/**
	 * 绑卡状态查询
	 * JFY 交费易 ZJ资金归集
	 * @return {TypeName}
	 */
	function getBindCardState(from){
		var params = {
			"merId" : merId,
			"channelCode" : "20",
			"tmnNum" : tmnNum,
			"keep" : Utils.getKeep(),
			"bisChannel" : bisChannel,
			"staffCode": staffCode,
			"custCode" : custCode
		};
		Utils.getDeviceInfo(params);
		var sign = Security.getSign(params);
		//alert("sign="+sign);
		console.log("sign---------------- = "+sign);
		params["sign"] = sign;
		params["signVer"] = "2";
		var callback = function(json) {
			//Utils.dismissDialog();
			console.log("绑卡状态查询 出参：" + JSON.stringify(json));
			if (json == "null" || json == null || json == '') {
				Dialog.showAlertDialog('提醒', ERROR['fail'], '确定', '');
				//Dialog.alert( ERROR['fail']);
				return;
			}
			faZhState = false;
			bindBankState = false;
			App.setThresholdBtnIsVisable(false);//显示阀值按钮true 显示
			
			if (json.code == "000000") {//查询成功，返回上一页面
				Utils.dismissDialog();
				var bindStat = json['bindStat'];
				
				if(from == COMEFROM['JFY']){
					if(bindStat =="0"){//0未绑卡 1绑卡成功 2绑卡中
						$("#outertabchange").hide();
						hasOrNoBankChange("hasBank","hasnoBank");
						$("#bindCardState").html("未绑卡");
						Utils.toNextPage("jiaoFeiYiRechargePage");
						document.title ="绑卡";
						App.setTitle('绑卡');
						//$("#jiaoFeiYiRechargePage").show();
						$("#bindCardNowBtn").click(function(){
							bindCard(from);
						});
					}else if(bindStat =="1"){
						bindBankState = true;
						faZhState = true;
						//调用客户银行信息查询
						getUserBankInfo(from);
					}else{
						$("#outertabchange").hide();
						hasOrNoBankChange("hasBank","hasnoBank");
						$("#zijbindCardState").html("绑卡中");
						$("#bindCardNowBtn").click(function(){
							Dialog.showAlertDialog('提醒', json.content, '确定', '');
							//Dialog.alert( json.content);
						});
						Dialog.showAlertDialog('提醒', '绑卡中', '确定', '');
						//Dialog.alert( "绑卡中");
					}
				}else if(from == COMEFROM['ZJ']){
					if(bindStat =="0"){//0未绑卡 1绑卡成功 2绑卡中
						hasOrNoBankChange("haszijBank","hasnozijBank");
						$("#zijbindCardState").html("未绑卡");
						Utils.toNextPage("zijRchargePage");
						//$("#zijRchargePage").show();
						$("#zijbindCardNowBtn").click(function(){
							if(info['productType'] == "3"){
								RZPassWordType="A02";
								PasswordKeyBoard.initPwdId("paypwdRenZheng");
								$("#paypwdRenZheng").val("");
								//Utils.toNextPage("passVailPage");
								PasswordKeyBoard.initPwdUI3(
									function(val){
										getRandom(COMEFROM['RZ'],val);
									}
								);
								PasswordKeyBoard.popKeyboardUI3();
								console.log("绑卡");
							}else{
								bindCard(from);
							}
						});
					}else if(bindStat =="1"){
						bindBankState = true;
						faZhState = true;
						//调用客户银行信息查询
						getUserBankInfo(from);
					}else{
						Dialog.showAlertDialog('提醒', '绑卡中', '确定', '');
						//Dialog.alert( "绑卡中");
					}
				}
			}else if(json.code == TOKENLOST){//token失效
				Utils.dismissDialog();
				var back = function(){
					User.login(productNo);
				}
				var back2 = function(){
					App.exitCompleteApp();
				}

				Dialog.showAlertTwoBtnDialog("登录失效",ERROR['tokenLost'],"确定","取消","",function(result){
					if(result == '1')
						back();
					else
						back2();
				});

				//Utils.alertNewDoubleBtn("ch_alert1","chalertmsg1","chAlertBtn1","chAlertBackBtn",ERROR['tokenLost'],"确定",back,"notice_title",back2,"登陆失效","取消");
			}else if(json.code == '011006'){ 
				console.log(json.code+ "-------------------")
				Dialog.showAlertDialog('提醒', json.content, '确定', json.code, function(){ 
					App.exitApp();
				});
			} else {
				Utils.dismissDialog();
				Dialog.showAlertDialog('提醒', json.content, '确定', json.code);
				//Dialog.alert( json.content + "(" + json.code + ")");
			}
			return;
		}
		console.log("绑卡状态查询 入参：" + JSON.stringify(params));

		Utils.showDialog("请稍候...");
		Utils.sendPostRequest(URL+Method['SBinCrd004'], params, callback,null);
	}
	/**
	 * 绑卡
	 */
	function bindCard(from){
		//先查看用户信息，判断是否认证，未认证需先认证，认证后方可绑卡

		 if(prinType == "PT901"){
			RZPassWordType="A01";
			//PasswordKeyBoard.initPwdId("paypwdRenZheng");
			$("#paypwdRenZheng").val("");
			//Utils.toNextPage("passVailPage");
			 PasswordKeyBoard.initPwdUI3(
				 function(val){
					 getRandom(COMEFROM['RZ'],val);
				 }
			 );
			 PasswordKeyBoard.popKeyboardUI3();
			console.log("认证");
		}else{
			getUserInfo(from);
		}
	}


	var vailPsw  = false ;
	/**
	 * 查询阀值
	 */
	function selectFaZhi(){
		var params = {
			"staffCode":staffCode,
			"channelCode":"20",
			"custCode":custCode,
			"merId":merId,
			"tmnNum":tmnNum,
			"bisChannel" : bisChannel,
			"keep":Utils.getKeep()
		}
		Utils.getDeviceInfo(params);
		var sign = Security.getSign(params);
		console.log("sign---------------- = "+sign);
		params["sign"] = sign;
		params["signVer"] = "2";

		var faZhiSelect_vall_back = function(JSONResult){
			Utils.dismissDialog();
			console.log("查询阀值------------>"+JSON.stringify(JSONResult));
			if(JSONResult.code == "000000") {
				ONEFAZHI = JSONResult['oneMaxOfLevel'];
				MONTHFAZHI = JSONResult['dayMaxOfLevel'];
				
				if (JSONResult.chkCode == "0") {
					openOrModify = true;//true modify fazhi
					$("#selectOneFaZhi").val("单笔限额 : " + (parseInt(JSONResult.oneMax) / 100) + "元");
					$("#selectDayFaZhi").val("累积限额 : " + (parseInt(JSONResult.dayMax) / 100) + "元");
					
					App.setThresholdBtnIsVisable(false);//显示阀值按钮true 显示
					
					PasswordKeyBoard.initPwdId("paypwdUpdateZhiFu");
					Utils.toNextPage("updateFaZhiPage");
				} else {
					App.setThresholdBtnIsVisable(false);//显示阀值按钮true 显示
					openOrModify = false;//false open fazhi
					goAddFaZhi(JSONResult);
				}
			} else if(JSONResult.code == TOKENLOST){
					var back = function(){
						User.login(productNo);
					}
					var back2 = function(){
						App.exitCompleteApp();
					}
				Dialog.showAlertTwoBtnDialog("登录失效",ERROR['tokenLost'],"确定","取消","",function(result){
					if(result == '1')
						back();
					else
						back2();
				});

				//Utils.alertNewDoubleBtn("ch_alert1","chalertmsg1","chAlertBtn1","chAlertBackBtn",ERROR['tokenLost'],"确定",back,"notice_title",back2,"登陆失效","取消");

				}else{
					Dialog.showAlertDialog('提醒', JSONResult.content, '确定', JSONResult['code']);
					//Dialog.alert(JSONResult.content+"("+JSONResult['code']+")");
				}

		}
		Utils.showDialog("请稍候...");
		Utils.sendPostRequest(URL+"SThm005", params, faZhiSelect_vall_back,null);
	}

	var str ='' ;
	function addFaZhiEveInput(input_id,max){

		$_id(input_id).addEventListener('input',function(){

			var patrn=/^(([1-9]{1}\d*)|([0]{1}))(\.(\d){1,2})?$/;
			var va = this.value;

			if(patrn.test(va)){
				if(parseInt(va) > max && input_id == "oneFaZhi"){
					Toast.makeText('单笔限额最高只能设置为' + max + "元",LENGTHLONG);
				}else if(parseInt(va) > max && input_id == "dayFaZhi"){
					Toast.makeText('累积限额最高只能设置为' + max + "元",LENGTHLONG);
				}
				str = va ;
			}else if(va!=''){
				$("#"+this.id).val(str);
			}
		},false);//交费易银行充值
	}

	/**
	 * 进入设置阀值页面
	 * @param JSONResult
	 */
	function goAddFaZhi(JSONResult){
		var oneMaxOfLevel = JSONResult.oneMaxOfLevel;
		var dayMaxOfLevel = JSONResult.dayMaxOfLevel;
		ONEFAZHI = oneMaxOfLevel;
		MONTHFAZHI = dayMaxOfLevel;
		$("#oneFaZhi").attr('placeholder', '单笔阀值：最高可设置为' + (oneMaxOfLevel * 1 / 100) + "元");
		$("#dayFaZhi").attr('placeholder', '累积阀值：最高可设置为' + (dayMaxOfLevel * 1 / 100) + "元");
		
		addFaZhiEveInput("oneFaZhi",(oneMaxOfLevel * 1 / 100));
		addFaZhiEveInput("dayFaZhi",(dayMaxOfLevel * 1 / 100));
		
		//PasswordKeyBoard.initPwdId("paypwdAddZhiFu");
		Utils.toNextPage("addFaZhiPage");

	}

	/**
	 * 设置阀值
	 * @param random
	 */
	function addFaZhi(random,val){
		var pwd = Security.encryptPassword(productNo,val,random);
		var oneFaZhi = $("#oneFaZhi").val();
		var dayFaZhi = $("#dayFaZhi").val();

		var params = {

			"staffCode":staffCode,
			"channelCode":"20",
			"custCode": custCode,
			"oneMax": parseInt(oneFaZhi*100),
			"dayMax": parseInt(dayFaZhi*100),
			"keep": Utils.getKeep(),
			"payPassword":pwd,
			"merId": merId,
			"bisChannel" : bisChannel,
			"tmnNum": tmnNum

		}
		Utils.getDeviceInfo(params);
		var sign = Security.getSign(params);
		params["sign"] = sign;
		params["signVer"] = "2";
		console.log("打开阀值入参："+JSON.stringify(params));
		var openFaZhi_call_back = function(JSONResult){
			console.log("打开阀值出参："+JSON.stringify(JSONResult));
			PasswordKeyBoard.hideKeyboardUI3();
			Utils.dismissDialog();
			if(JSONResult.code == "000000"){
				var back ;
				if(openOrModify){//true modify fazhi
					back = function (){
						console.log("modify fazhi------------------two back")
						hiddenDelBtns();
						Utils.back();
						Utils.back();
					}
				}else{//false open fazhi
					back = function (){
						console.log("open fazhi------------------one back")
						hiddenDelBtns();
						Utils.back();
					}
				}
				$("#paypwdUpdateZhiFu").val("");
				$("#oneFaZhi").val("");
				$("#dayFaZhi").val("");
				$("#paypwdAddZhiFu").val("");
				Utils.alert("单 笔 限 额："+oneFaZhi+"元\n日累积限额："+dayFaZhi+"元",back);
			}else if(JSONResult.code == TOKENLOST){
				var back = function(){
					User.login(productNo);
				}
				var back2 = function(){
					App.exitCompleteApp();
				}

				Dialog.showAlertTwoBtnDialog("登录失效",ERROR['tokenLost'],"确定","取消","",function(result){
					if(result == '1')
						back();
					else
						back2();
				});
				//Utils.alertNewDoubleBtn("ch_alert1","chalertmsg1","chAlertBtn1","chAlertBackBtn",ERROR['tokenLost'],"确定",back,"notice_title",back2,"登陆失效","取消");
			
			}else if(JSONResult['code'] == LockPed){
				Dialog.showAlertDialog('提醒', JSONResult['content'], '确定', JSONResult['code'], function(){ 
					App.exitCompleteApp();
				});
				//Dialog.alert(JSONResult['content']+"("+JSONResult['code']+")");
			}
			else{
				Dialog.showAlertDialog('提醒', JSONResult.content, '确定', JSONResult.code);
				//Dialog.alert("查询您当前限额失败，"+JSONResult.content);
			}
		}
		Utils.showDialog("请稍候...");
		Utils.sendPostRequest(URL+"MThm001", params, openFaZhi_call_back,null);


	}

	/**
	 * 关闭阀值
	 * @param random
	 */
	function closeFaZhi(random,val){
		var pwd = Security.encryptPassword(productNo,val,random);
		var params = {
			"staffCode":staffCode,
			"channelCode": "20",
			"custCode": custCode,
			"merId": merId,
			"tmnNum": tmnNum,
			"keep": Utils.getKeep(),
			"bisChannel" : bisChannel,
			"payPassword":pwd
		}
		Utils.getDeviceInfo(params);
		var sign = Security.getSign(params);
		//alert("sign="+sign);
		console.log("sign---------------- = "+sign);
		params["sign"] = sign;
		params["signVer"] = "2";
		console.log("关闭阀值入参："+JSON.stringify(params));
		var closeFaZhi_call_back = function(JSONResult){
			console.log("关闭阀值出参："+JSON.stringify(JSONResult));
			//隐藏键盘
			PasswordKeyBoard.hideKeyboardUI3();
			Utils.dismissDialog();
			if(JSONResult.code == "000000"){
				Dialog.showAlertDialog('提醒', '进行充值时不需要输入短信验证码', '确定', '', function(){ 
					Utils.back();
				});
				//Dialog.alert("进行充值时不需要输入短信验证码",Utils.back());
			}else if(JSONResult.code == TOKENLOST){
				var back = function(){
					User.login(productNo);
				}
				var back2 = function(){
					App.exitCompleteApp();
				}
				Dialog.showAlertTwoBtnDialog("登录失效",ERROR['tokenLost'],"确定","取消","",function(result){
					if(result == '1')
						back();
					else
						back2();
				});

				//Utils.alertNewDoubleBtn("ch_alert1","chalertmsg1","chAlertBtn1","chAlertBackBtn",ERROR['tokenLost'],"确定",back,"notice_title",back2,"登陆失效","取消");
			
			}else if(JSONResult['code'] == ErrorPwd){
				Dialog.showAlertDialog('提醒', JSONResult['content'], '确定', JSONResult['code']);
				return ;
			}else if(JSONResult['code'] == LockPed){
				Dialog.showAlertDialog('提醒', JSONResult['content'], '确定', JSONResult['code'], function(){ 
					App.exitCompleteApp();
				});
			}
			else{
				Dialog.showAlertDialog('提醒', JSONResult['content'], '确定', JSONResult['code']);
			}
		}
		Utils.showDialog("请稍候...");
		Utils.sendPostRequest(URL+"MThm002", params, closeFaZhi_call_back,null);
	}

	/**
	 * 判断阀值
	 */
	function faZhiVail(bankCode){
		var rechargeMoney = $("#re_money_1").val();
		var params = {
			"staffCode":staffCode,
			"channelCode":"20",
			"custCode":custCode,
			"merId":merId,
			"tmnNum":tmnNum,
			"keep":Utils.getKeep(),
			"bisChannel" : bisChannel,
			"rechargeMoney":yuan2fen(rechargeMoney),
			"bankCode":bankCode
		}
		Utils.getDeviceInfo(params);
		var sign = Security.getSign(params);
		console.log("sign---------------- = "+sign);
		params["sign"] = sign;
		params["signVer"] = "2";
		console.log("判断阀值- params -------------->"+JSON.stringify(params));
		var faZhiVail_vall_back = function(JSONResult){
			Utils.dismissDialog();
			console.log("判断阀值------------------>"+JSON.stringify(JSONResult));
			if(JSONResult.code == "000000"){
				var code = JSONResult.chkCode;
				//获取阀值验证的结果
				faZhiVailResult["chkCode"] = code ;
				faZhiVailResult["bankMobile"] = JSONResult.bankMobile;

				//0 未超过，直接支付；1银行卡不支持快捷（一定有手机号，短信下发）；2提示短信下发；3填写预留手机；4已关闭
				if(code  == "0" || code == "4"){
					$("#faZhiPhone").hide();
					$("#faZhiMsm").hide();
				}else if(code == "3"){
					$("#faZhiPhone").show();
					$("#faZhiMsm").show();
				}else if(code == "1" || code == "2"){
					$("#faZhiPhone").hide();
					$("#faZhiMsm").show();
				}
				
				nextStepBtn();
			}else if(JSONResult.code == TOKENLOST){
				$("#con_yan_zheng_ma").text("获取验证码");
				var back = function(){
					User.login(productNo);
				}
				var back2 = function(){
					App.exitCompleteApp();
				}
				Dialog.showAlertTwoBtnDialog("登录失效",ERROR['tokenLost'],"确定","取消","",function(result){
					if(result == '1')
						back();
					else
						back2();
				});
				//Utils.alertNewDoubleBtn("ch_alert1","chalertmsg1","chAlertBtn1","chAlertBackBtn",ERROR['tokenLost'],"确定",back,"notice_title",back2,"登陆失效","取消");
			
			}else{
				Dialog.showAlertDialog('提醒', JSONResult['content'], '确定', JSONResult['code']);
				//Dialog.alert(JSONResult.content+"("+JSONResult['code']+")");
			}
		}
		Utils.showDialog("请稍候...");
		Utils.sendPostRequest(URL+Method['SThm003'], params, faZhiVail_vall_back,null);
	}

	/**
	 * 获取银行卡绑定信息
	 */
	function getUserBankInfo(from){
        var params ={
        	"merId" : merId,
			"channelCode" : "20",
			"tmnNum" : tmnNum,
			"keep" : Utils.getKeep(),
			"staffCode": staffCode,
			"bisChannel" : bisChannel,
			"custCode" : custCode
		};
		Utils.getDeviceInfo(params);
		var sign = Security.getSign(params);
		params["sign"] = sign;
		params["signVer"] = "2";
		var callback = function(json) {
			Utils.dismissDialog();
			console.log("银行卡绑定信息 出参：" + JSON.stringify(json));
			if (json == "null" || json == null || json == '') {
				Dialog.showAlertDialog('提醒', ERROR['fail'], '确定', '');
				//Dialog.alert( ERROR['fail']);
				return;
			}

			if (json.code == "000000") {
				bankNum = json['bankCode']; //银行卡类型
				var bankNo = json['bankAcctNbr'];
				accId = json['accId'];
				if(from == COMEFROM['JFY']){//交费易
					//UI3.0
					if(bankNum == BANK.bankInfo.zgbank.bankNum ||
						bankNum == BANK.bankInfo.nybank.bankNum ||
						bankNum == BANK.bankInfo.jsbank.bankNum ||
						bankNum == BANK.bankInfo.yzbank.bankNum ||
						bankNum == BANK.bankInfo.gfbank.bankNum){
						$("#re_money_1").attr("placeholder", "500元以上免手续费");
					}
                    //$("#re_money_1").attr("placeholder", "充值金额:（以元位单位）");
                    if(hadEpt == '1'){
                        accountInformationInterface(); // 企业理财账户信息接口(SEpt006)
                    }
					Utils.logoToBank("bankLogo",json['bankCode']);
					$_id("bankName").innerHTML = json['bankName'];//银行名称
					$_id("bankCardNo").innerHTML = bankNo.substr(bankNo.length-4,4);//银行卡号
					var name = json['bankAcctName'];
					name = "*"+name.substring(1,name.length);
					$_id("userName").innerHTML = name;//姓名
					$("#re_money_1").val("");
					App.setThresholdBtnIsVisable(true);//显示阀值按钮true 显示
					Utils.toNextPage("jiaoFeiYiRechargePage");
					//$("#jiaoFeiYiRechargePage").show();
                   // var indexTianyibaoValue = '1' ; //充入银行卡为1    充入添益宝为2
                    $_id("nextStepBtn").onclick = function(){//确认充值
                        if(indexTianyibaoValue == '1'){   //充入银行卡为1
                            if(!submitOpen){ return; };
                            if(trueFlag['errorNotice1']){
                                if(!Utils.isNumber($("#re_money_1").val(),100000,10)){
                                    Toast.makeText(ERROR['moneyError2'],LENGTHLONG);
                                    return;
                                }
                                //判断阀值
                                faZhiVail(json['bankCode']);
                            }else{
                                Toast.makeText( ERROR['moneyError2'],LENGTHLONG);
                            }
                        }
                    }
				}else{
					Utils.logoToBank("zijbankLogo",json['bankCode']);
					$_id("zijbankName").innerHTML = json['bankName'];//银行名称
					$_id("zijbankCardNo").innerHTML = bankNo.substr(bankNo.length-4,4);//银行卡号
					var name = json['bankAcctName'];
					name = name.substring(1,name.length);
					$_id("zijuserName").innerHTML = "*"+name;//姓名
					hasOrNoBankChange("hasnozijBank","haszijBank");
					
					//初始化键盘，清空输入框
					PasswordKeyBoard.initPwdId("zijpwd");
					$("#re_money_3").val("");
					
					Utils.toNextPage("zijRchargePage");
					//$("#zijRchargePage").show();
					$_id("zijRechargeBtn").onclick = function(){//充值
						var money = $("#re_money_3").val();
						var pwd = PasswordKeyBoard.keyStr;
						if(money == ""){
							Toast.makeText( ERROR['moneyError3'],LENGTHLONG);
							return;
						}
						if(pwd.length<6){
							Toast.makeText( ERROR['pwdError'],LENGTHLONG);
							return;
						}
						if(trueFlag['errorNotice3']){
							getRandom(COMEFROM['ZJ']);
						}else{
							Toast.makeText( ERROR['moneyError2'],LENGTHLONG);
						}

					}
				}
			}else if(json.code == TOKENLOST){//token失效
				var back = function(){
					User.login(productNo);
				}
				var back2 = function(){
					App.exitCompleteApp();
				}

				Dialog.showAlertTwoBtnDialog("登录失效",ERROR['tokenLost'],"确定","取消","",function(result){
					if(result == '1')
						back();
					else
						back2();
				});
				//Utils.alertNewDoubleBtn("ch_alert1","chalertmsg1","chAlertBtn1","chAlertBackBtn",ERROR['tokenLost'],"确定",back,"notice_title",back2,"登陆失效","取消");
			
			}
			else {
				Dialog.showAlertDialog('提醒', json.content, '确定', json.code);
				//Dialog.alert( json.content + "(" + json.code + ")");
			}
			return;
		}
		console.log("银行卡绑定信息 入参：" + JSON.stringify(params));
		Utils.showDialog("请稍候...");
		Utils.sendPostRequest(URL+Method['SCbk001'], params, callback,null);
	}
    function textT(id,text){
        $(id).html(text);
    };
    function sortNumber(a,b){
        return a-b;
    };
    function comparefour(){
        var more_value_zu = "";
        var arrbank = [otherSelfrMaxvalue, otherSelfsingleMaxvalue, otherSelfyMaxvalue];
        arrbank.sort(sortNumber);
       // var indexTianyibaoValue = '1' ; //充入银行卡为1    充入添益宝为2
        if(indexTianyibaoValue == 1){
            //more_value_zu = arr[0];

			//UI3.0
            //$("#re_money_1").attr("placeholder", "充值金额:（以元位单位）");
        }else{
            more_value_zu = arrbank[0];
            $("#re_money_TYB").attr("placeholder", "最多可转入" + getThausand(fen2yuan(more_value_zu),1) + "元");
        }
    };
    String.prototype.startWith = function (s) {
        if (s == null || s == "" || this.length == 0 || s.length > this.length)
            return false;
        if (this.substr(0, s.length) == s)
            return true;
        else
            return false; 
    };
    function fen2yuan(fen){
        fen = fen + '';
        if(fen==null ||fen.length<1){
            return '0.00';
        }else if(fen.length==1){
            return '0.0'+fen;
        }else if(fen.length==2){
            return '0.'+fen;
        }else {
            var f = fen.substring(fen.length - 2);
            var y = fen.substring(0, fen.length - 2);
            return y + "." + f;
        }
    }
    function yuan2fen(yuan){
        var yuanStr = yuan+'';
        if (yuanStr.startWith('.')) {
            yuanStr = '0' + yuanStr;
        }
        yuan = new Number(yuanStr).toFixed(2);
        var currency = Math.round((yuan*100)*1000)/1000;
        if ((currency+"").indexOf(".") > 0) {
            currency = currency.substring(0, currency.indexOf("."));
        }
        return currency;
    }
    $("#re_money_One_Parent_TYB_input").after("<div class='bank_span' style='color: red;margin:20px 0'></div>");//转入的金额文本框
    $('#nextStepBtn').on('click',function(){
        if(indexTianyibaoValue == 2){ //添益宝
            getapplyforBuySecretInterface(); //转入支付密码页面初始化
        }
    });
    //银行卡充值到添益宝  3.5企业理财申购预校验(MEpt002)
    function purchaseAndVerification(){
        var params ={
            "merId" : merId,
            "channelCode" : "20",
            "tmnNum" : tmnNum,
            "keep" : Utils.getKeep(),
            "staffCode": staffCode,
			"bisChannel" : bisChannel,
            "custCode" : custCode,
            "productId" : productId
        };
		Utils.getDeviceInfo(params);
        var sign = Security.getSign(params);
        params["sign"] = sign;
        params["signVer"] = "2";
        var callback = function(json) {
            Utils.dismissDialog();
            console.log("5企业理财申购预校验 出参：" + JSON.stringify(json));
            if (json == "null" || json == null || json == '') {
                Dialog.showAlertDialog('提醒', ERROR['fail'], '确定', '');
                return;
            }
            if (json.code == "000000") {
                zhuanru_money_text_val = document.getElementById('re_money_TYB').value;//转入金额
                var rMaxvalue = json.rMaxvalue;	   //单日最高金额
                var rMax = json.rMax;       //单日最大笔数
                var singleLimitvalue=json.singleLimitvalue;	//单笔最低金额
                var singleMaxvalue =json.singleMaxvalue;  //单笔最高金额
                var yMaxvalue=json.yMaxvalue;   //月最高金额
                var yMax=json.yMax;    	//月最大笔数
                otherSelfrMaxvalue = json.rMaxvalue;
                otherSelfsingleMaxvalue = json.singleMaxvalue;
                otherSelfyMaxvalue = json.yMaxvalue;
                if (singleMaxvalue == null || singleMaxvalue == "" || singleMaxvalue == 'undefined' || (typeof singleLimitvalue === 'undefined')||rMaxvalue == null || rMaxvalue == "" || rMaxvalue == 'undefined' || (typeof rMaxvalue === 'undefined')||yMaxvalue == null || yMaxvalue == "" || yMaxvalue == 'undefined' || (typeof yMaxvalue === 'undefined')) {
                    // var indexTianyibaoValue = '1' ; //银行卡充入交费易为1    银行卡充入添益宝为2
                    if(indexTianyibaoValue == 1){
                        $("#re_money_1").attr("placeholder", "充值金额:（以元位单位）");
                    }else{
                        $("#re_money_TYB").attr("placeholder", "");
                    }
                } else {
                    comparefour();
                };
                console.log("002接口" + indexTianyibaoValue);
                function bank_text() {
                    zhuangru_true = false;
                    zhuanru_money_text_val = document.getElementById('re_money_TYB').value; //- document.getElementById('id_Handling_Charge').innerHTML;//转入金额
                    zhuanru_money_text_val = yuan2fen(zhuanru_money_text_val);
                    if(zhuanru_money_text_val != null||zhuanru_money_text_val.length != 0){
                        $('#jy_btn_show').addClass("cont_btn_blue");
                    }else{
                        $('#jy_btn_show').addClass("cont_btn_gray").removeClass("cont_btn_blue");
                    }
                    if(zhuanru_money_text_val*1 == 0){
                        textT(".bank_span","输入金额不能为0");
                        return;
                    }
                    if(rMax != null && rMax != "" && rMax!= undefined ){
                        if(rMax > 0){//单日最大笔数
                            textT(".bank_span","");
                        }else{
                            textT(".bank_span","转入次数已超过单日最大笔数");
                            return;
                        }
                    }
                    if(yMax!=null&&yMax!=""&&yMax!=undefined){
                        if(yMax > 0){//月最大笔数
                            textT(".bank_span","");
                        }else{
                            textT(".bank_span","当月最大笔数转入次数超限");
                            return;
                        }
                    }
                    if(singleMaxvalue!=null&&singleMaxvalue!=""&&singleMaxvalue!=undefined){
                        if(zhuanru_money_text_val*1 > singleMaxvalue){//单笔最高金额
                            textT(".bank_span","单笔最高金额超过有效数");
                            return;
                        }else{
                            textT(".bank_span","");
                        }
                    }
                    if(rMaxvalue != null && rMaxvalue !="" && rMaxvalue != undefined){
                        if(zhuanru_money_text_val*1 > rMaxvalue){
                            textT(".bank_span","转入金额超过单日最高金额，请重新输入");
                            return;
                        }else{
                            textT(".bank_span","");
                        }
                    }
                    if(yMaxvalue != null && yMaxvalue !="" && yMaxvalue != undefined){
                        if(zhuanru_money_text_val*1 > yMaxvalue){//大于单月最高金额
                            textT(".bank_span","转入金额超过月最高金额");
                            return;
                        }else{
                            textT(".bank_span","");
                        }
                    }
                    if(singleLimitvalue!=null&&singleLimitvalue!=""&&singleLimitvalue!=undefined){
                        if(zhuanru_money_text_val*1 < singleLimitvalue){
                            textT(".bank_span","单笔最低金额必须大于"+(singleLimitvalue/100).toFixed(0)+"元");
                            return;
                        }else{
                            textT(".bank_span","");
                        };
                    }
                    zhuangru_true = true;
                }
                $_id("re_money_TYB").addEventListener("input", bank_text);
            }else if(json.code == TOKENLOST){//token失效
                var back = function(){
                    User.login(productNo);
                };
                var back2 = function(){
                    App.exitCompleteApp();
                };
				Dialog.showAlertTwoBtnDialog("登录失效",ERROR['tokenLost'],"确定","取消","",function(result){
					if(result == '1')
						back();
					else
						back2();
				});
				//Utils.alertNewDoubleBtn("ch_alert1","chalertmsg1","chAlertBtn1","chAlertBackBtn",ERROR['tokenLost'],"确定",back,"notice_title",back2,"登陆失效","取消");
            }
            else {
                Dialog.showAlertDialog('提醒', json.content, '确定', json.code);
            }
            return;
        };
        console.log("5企业理财申购预校验 入参：" + JSON.stringify(params));
        Utils.showDialog("请稍候...");
        Utils.sendPostRequest(URL+Method['MEpt002'], params, callback,null);
    }
    $_id('pay_soon').onclick = function(){
       // PasswordKeyBoard.hideKeyboard("");
		PasswordKeyBoard.initPwdUI3(function(val){
			//getRandom(COMEFROM['JFY'],val);
			getapplyforBuySuccess(val);  //跳到转入的支付成功页面 applyforBuy
		});
		PasswordKeyBoard.popKeyboardUI3();

    };
    //跳到转入的支付密码页面 applyforBuy
    function getapplyforBuySecretInterface(){
    	zhuanru_money_text_val += '';
        if(!zhuanru_money_text_val){
            Toast.makeText("金额不能为空",LENGTHLONG);
            return;
        };
        if(zhuangru_true != true){
            return;
        }
        var re_money_TYB = $_id('re_money_TYB').value + '';
        if(!re_money_TYB){
            Toast.makeText("金额不能为空",LENGTHLONG);
            return;
        }
//        $('.cont_btn_gray_a').removeClass('cont_btn_blue_a');
//        var clearzhuanru = function(){
//            $('.cont_btn_gray_a').removeClass('cont_btn_blue_a');
//        };

        $_id('txnAmountRuBankTYB').innerHTML = getThausand(fen2yuan(zhuanru_money_text_val),1);
        var confirmWorkDayStr =  confirmWorkDay;
        var confirmWorkWeekStr = confirmWorkWeek;
        var year = confirmWorkDayStr.substring(0,4);
        var month = confirmWorkDayStr.substring(4,6);
        var day = confirmWorkDayStr.substring(confirmWorkDayStr.length-2);
        var week = confirmWorkWeekStr.substring(confirmWorkWeekStr.length-1);
        $_id('WorkDayAndWorkWeek').innerHTML = year + '-' + month + '-' + day + '(周' + week + ')';
        PasswordKeyBoard.initPwdId("zhuanru_passWord");
        Utils.toNextPage('page_change_can_pay');//跳到转入支付密码的页面
        App.setThresholdBtnIsVisable(false);//显示阀值按钮true 显示
    };
    $_id("zhuanru_passWord").onclick=function(){//点击支付密码文本框调安全键盘
        PasswordKeyBoard.popPswKeyboard();
        PasswordKeyBoard.keyInputId = "zhuanru_passWord";};

    //跳到转入的支付成功页面 applyforBuy
    function getapplyforBuySuccess(val){
        zhuanru_passWord =val; //document.getElementById('zhuanru_passWord').value;//转入支付密码
        //if (zhuanru_passWord == null || zhuanru_passWord.length == 0) {
        //    Toast.makeText("请输入密码",LENGTHLONG);
        //    return;
        //}else if(zhuanru_passWord.length<6){
        //    Toast.makeText("请输入6~12位支付密码",LENGTHLONG);
        //    return;
        //}
       // showDialog();
        getRandom(COMEFROM['TYB'],val);
    };


    //3.6企业理财申购 (TEpt004)
    function financialPurchase(random,val){
        //var pwd = PasswordKeyBoard.keyStr;
		var pwd = Security.encryptPassword(productNo,val,random);
        var params ={
            "merId" : merId,
            "channelCode" : "20",
            "bisChannel": bisChannel,
            "tmnNum" : tmnNum,
            "keep" : Utils.getKeep(),
            "staffCode": staffCode,
            "custCode" : custCode,
            'payPassword': pwd,//开户密码
            "txnAmount":zhuanru_money_text_val,//以分为单位
            "txnType":'1', //1:银行卡  2:交费易  默认使用交费易账户
            "productId":productId,
            "userId":userId
        };
		Utils.getDeviceInfo(params);
        var sign = Security.getSign(params);
        params["sign"] = sign;
        params["signVer"] = "2";
        var callback = function(json) {
			PasswordKeyBoard.hideKeyboardUI3();
            Utils.dismissDialog();
            console.log("企业理财申购 (TEpt004) 出参：" + JSON.stringify(json));
            if (json == "null" || json == null || json == '') {
                Dialog.showAlertDialog('提醒', ERROR['fail'], '确定', '');
                return;
            }
            if (json.code == "000000") {
                console.log("3.6企业理财申购 (TEpt004)出参===="+JSON.stringify(json));
                $_id('transSeq').innerHTML = json.transSeq;
                $_id('txnAmountZRU').innerHTML = $_id('txnAmountRuBankTYB').innerHTML;
                $_id('interestDate').innerHTML = json.interestDate + "(" + json.interestWeek + ")"; //日期 + 星期;
                Utils.toNextPage('page_zhuangrusuccess');
				document.title = "充值成功";
				App.setTitle("充值成功");
                //App.setFinishIcon();//所有应用支付成功之后，右上角有个完成，左上角的返回按钮去掉
            }else if(json.code == TOKENLOST){//token失效
                var back = function(){
                    User.login(productNo);
                }
                var back2 = function(){
                    App.exitCompleteApp();
                }
				Dialog.showAlertTwoBtnDialog("登录失效",ERROR['tokenLost'],"确定","取消","",function(result){
					if(result == '1')
						back();
					else
						back2();
				});
				//Utils.alertNewDoubleBtn("ch_alert1","chalertmsg1","chAlertBtn1","chAlertBackBtn",ERROR['tokenLost'],"确定",back,"notice_title",back2,"登陆失效","取消");

            }else if(json.code == "002135"){//密码错误
                var back = function(){
                    $("#ch_alert1").hide();
                }
                var back2 = function(){
                    App.exitApp();
                }

				Dialog.showAlertTwoBtnDialog("交易结果",json['content'],"继续","取消",json['code'],function(result){
					if(result == '1')
						back();
					else
						back2();
				});
                //Utils.alertNewDoubleBtn("ch_alert1","chalertmsg1","chAlertBtn1","chAlertBackBtn",json['content']+"("+json['code']+")","继续",back,"notice_title",back2,"交易结果");
            }else if(json.code == "002136"){//密码被锁
                Dialog.showAlertDialog('提醒',  json.content, '确定',  json.code, function(){
                    App.exitCompleteApp();
                });
            }else if(json.code == "010054"){//无效签名
                Dialog.showAlertDialog('提醒',  '登录失效', '确定',  json.code);
            }else{
                Dialog.showAlertDialog('提醒',  json.content, '确定',  json.code);
                //Dialog.alert( json.content + "(" + json.code + ")");
            }
            return;
        };
        console.log("企业理财申购 (TEpt004) 入参：" + JSON.stringify(params));
        Utils.showDialog("请稍候...");
        Utils.sendPostRequest(URL+Method['TEpt004'], params, callback,null);
    }
    function getThausand(s,type){
        if (/[^0-9\.]/.test(s)) return "0";
        if (s == null || s == "") return "0";
        s = s.toString().replace(/^(\d*)$/, "$1.");
        s = (s + "00").replace(/(\d*\.\d\d)\d*/, "$1");
        s = s.replace(".", ",");
        var re = /(\d)(\d{3},)/;
        while (re.test(s))
            s = s.replace(re, "$1,$2");
        s = s.replace(/,(\d\d)$/, ".$1");
        if (type == 0) {// 不带小数位(默认是有小数位)
            var a = s.split(".");
            if (a[1] == "00") {
                s = a[0];
            }
        }
        return s;
    }
    // 企业理财账户信息接口(SEpt006)
    function accountInformationInterface() {
        var params ={
            "merId" : merId,
            "channelCode" : "20",
            "tmnNum" : tmnNum,
            "keep" : Utils.getKeep(),
            "staffCode": staffCode,
			"bisChannel" : bisChannel,
            "custCode" : custCode,
            "productId":productId
        };
		Utils.getDeviceInfo(params);
        var sign = Security.getSign(params);
        params["sign"] = sign;
        params["signVer"] = "2";
        var callback = function(json) {
            Utils.dismissDialog();
            console.log("企业理财申购 (SEpt006) 出参：" + JSON.stringify(json));
            if (json == "null" || json == null || json == '') {
                Dialog.showAlertDialog('提醒', ERROR['fail'], '确定', '');
                return;
            }
            if (json.code == "000000") {
                userId = json['userId'];//用户产品列表
                balance = getThausand(fen2yuan(json.balance),1);//余额总额
                confirmWorkDay = json.confirmWorkDay; //收益日期
                confirmWorkWeek = json.confirmWorkWeek;//收益星期
                purchaseAndVerification();   //银行卡充值到添益宝  3.5企业理财申购预校验(MEpt002)

            }else if(json.code == TOKENLOST){//token失效
                var back = function(){
                    User.login(productNo);
                };
                var back2 = function(){
                    App.exitCompleteApp();
                };
				Dialog.showAlertTwoBtnDialog("登录失效",ERROR['tokenLost'],"确定","取消","",function(result){
					if(result == '1')
						back();
					else
						back2();
				});
                //Utils.alertNewDoubleBtn("ch_alert1","chalertmsg1","chAlertBtn1","chAlertBackBtn",ERROR['tokenLost'],"确定",back,"notice_title",back2,"登陆失效","取消");
            }
            else {
                Dialog.showAlertDialog('提醒', json.content, '确定', json.code);
            }
            return;
        };
        console.log("企业理财申购 (SEpt006) 入参：" + JSON.stringify(params));
        Utils.showDialog("请稍候...");
        Utils.sendPostRequest(URL+Method['SEpt006'], params, callback,null);
    }

	/*
	 * 账户手续费充值
	 */
	function handlingCharge(){ 
		var txnAmount = $_id("re_money_1").value;
		$_id("rechargeAcc").innerHTML =(txnAmount*1).toFixed(2);//充值金额

		var params = {
			"staffCode":staffCode,
			"channelCode":"20",
			"custCode":custCode,
			"bisChannel" : bisChannel,
			"merId":merId,
			"tmnNum":tmnNum,
			"keep":Utils.getKeep(),
			"txnAmount":(txnAmount*100).toFixed(0), //金额
			"acctType": "0007" //企业账户：0001;交费易账户：0007
		}
		Utils.getDeviceInfo(params);
		var sign = Security.getSign(params);
		console.log("sign---------------- = "+sign);
		params["sign"] = sign;
		params["signVer"] = "2";
		console.log("账户手续费充值- params -------------->"+JSON.stringify(params));
		var callback = function(json) {
			Utils.dismissDialog();
			console.log("账户手续费充值 出参：" + JSON.stringify(json));
			if (json == "null" || json == null || json == '') {
				Dialog.showAlertDialog('提醒', ERROR['fail'], '确定', '');
				return;
			}

			if (json.code == "000000") {
				$_id("fees").innerHTML = json.poundage/100;//手续费
				$_id("id_Handling_Charge").innerHTML = json.poundage/100;//手续费
				var chargeAmount = (json.txnAmount-json.poundage)/100;
				$_id("getAcc").innerHTML = chargeAmount.toFixed(2);
			}else{
				$_id("id_Handling_Charge").innerHTML ="0";//手续费
			}
		}

		Utils.showDialog("请稍候...");
		Utils.sendPostRequest(URL+Method['SAcc009'], params, callback,null);
	}


	/**
	 * 下一步
	 */
	function nextStepBtn(){
		
		/*var re = $_id("re_money_1").value;
		$_id("rechargeAcc").innerHTML =(re*1).toFixed(2);//充值金额

		if(($_id("re_money_1").value)*1 <500){//到账金额
			if(bankNum == BANK.bankInfo.zgbank.bankNum || 
			   bankNum == BANK.bankInfo.nybank.bankNum || 
			   bankNum == BANK.bankInfo.jsbank.bankNum || 
			   bankNum == BANK.bankInfo.yzbank.bankNum || 
			   bankNum == BANK.bankInfo.gfbank.bankNum){ 
				console.log("bankName==="+ bankName+";  bankNum==="+bankNum);
				$_id("fees").innerHTML ="0.5";//手续费
				$_id("getAcc").innerHTML = (re - 0.5).toFixed(2);
			}else{ 
				console.log("bankName==="+ bankName+";  bankNum==="+bankNum);
				$_id("fees").innerHTML ="1";//手续费
				$_id("getAcc").innerHTML = (re - 1).toFixed(2);
			}
		}else{
			$_id("fees").innerHTML ="0.00";//手续费
			$_id("getAcc").innerHTML = re;
		}*/

		//UI3.0
		//handlingCharge(); //账户充值手续费查询(SAcc009)


		$("#bankPwdLine").hide();
		$("#rechargeNo").hide();
		$_id("rechargeWay").innerHTML ="银行账户";
		
		PasswordKeyBoard.initPwdId("paypwd");
		App.setThresholdBtnIsVisable(false);//显示阀值按钮true 显示
		
		msgShowTime = 30;
		$("#con_yan_zheng_ma").text("获取验证码");
		clearInterval(stopMsgVail);
		
		$("#msgVerifyCode").val("");
		$("#quickBankPrePhone").val("");
		$_id("confdel1").className = "del";
		$_id("confdel2").className = "del";

		$("#shouxuFees").hide(); //隐藏手续费
		$("#toAccount").hide(); //隐藏到账金额
		Utils.toNextPage("rechargeConfirmPage");
		$_id("rechargeNow").onclick = rechargeNow;
	}

    function rechargeNow(){
		console.log("-----------------交费易 bank------------------");
		//0 未超过，直接支付；1银行卡不支持快捷（一定有手机号，短信下发）；2提示短信下发；3填写预留手机；4已关闭
		var code = faZhiVailResult.chkCode;
		if(code == "3"){
			if(!Utils.phoneNumVail("quickBankPrePhone"))  return ;
		}
		if(code != "0" && code !="4"){
			if($("#msgVerifyCode").val() == '' || $("#msgVerifyCode").val().length != 6 ) {
				Toast.makeText("请输入正确的验证码！",LENGTHLONG);
				return;
			}
		}
		//var pwd = PasswordKeyBoard.keyStr;
		//if(pwd.length<6){
		//	Toast.makeText(ERROR['pwdError'],LENGTHLONG);
		//	return;
		//}
		if(!submitOpen){ return; };


		PasswordKeyBoard.initPwdUI3(function(val){
			getRandom(COMEFROM['JFY'],val);
		});
		PasswordKeyBoard.popKeyboardUI3();



		
	}

	var msgShowTime = 30;   //验证码的有效时长
	//获取短信验证码的click事件
	$("#con_yan_zheng_ma").click(function(){
		getVailNo();
	});

	var stopMsgVail;
	/**
	 * 获取短信验证码
	 */
	function getVailNo(){
		var phoneNum;
		if(faZhiVailResult.bankMobile == null ){
			if(!Utils.phoneNumVail("quickBankPrePhone",ERROR.openBankPhoneEmptyError)) return ;    //银行开户手机号
			phoneNum = $("#quickBankPrePhone").val(); //获取手机号码
		}else{
			phoneNum = faZhiVailResult.bankMobile; //获取手机号码
		}
		if(msgShowTime !=30){
			Toast.makeText("短信已下发，若30秒没收到，请重新点击获取！",LENGTHLONG);
			return ;
		}
		console.log("000000000000000000= "+phoneNum);
		//$("#con_yan_zheng_ma").text("获取验证码");
		clearInterval(stopMsgVail);
		var params = {
			"bisChannel": bisChannel,
			"clientVersion":deviceInfo.clientVersion,
			"sendType":6,
			"staffCode":staffCode,
			"custCode" : custCode,
			"phone":phoneNum,
			"channelCode":"20",
			"merId":merId,
			"keep":Utils.getKeep(),
			"serviceType":"PAYEAST_HTML5_BANK_RECHARGE",
			"tmnNum": tmnNum
		};
		Utils.getDeviceInfo(params);
		var sign = Security.getSign(params);
		params['sign'] = sign;
		params.signVer =  "2";

		var sendMsg_callback = function(JSONResult) {
			Utils.dismissDialog();
			console.log("info:Method:Sreg003  出参： Result --> " + JSON.stringify(JSONResult));
			if(JSONResult.code == TOKENLOST){
				$("#con_yan_zheng_ma").text("获取验证码");
				clearInterval(stopMsgVail);
				msgShowTime = 30;
				var back = function(){
					User.login(productNo);
				}
				var back2 = function(){
					App.exitCompleteApp();
				}
				Dialog.showAlertTwoBtnDialog("登录失效",ERROR['tokenLost'],"确定","取消","",function(result){
					if(result == '1')
						back();
					else
						back2();
				});
				//Utils.alertNewDoubleBtn("ch_alert1","chalertmsg1","chAlertBtn1","chAlertBackBtn",ERROR['tokenLost'],"确定",back,"notice_title",back2,"登陆失效","取消");
				return;
			}else if(JSONResult.code != "000000"){
				Dialog.showAlertDialog('提醒', JSONResult.content, '确定', JSONResult['code']);
				//Dialog.alert(JSONResult.content+"("+JSONResult['code']+")");
				$("#con_yan_zheng_ma").text("获取验证码");
				clearInterval(stopMsgVail);
				msgShowTime = 30;
				return ;
			}

			Toast.makeText("验证码已成功下发到尾数为"+phoneNum.substring((phoneNum.length-4) ,phoneNum.length )+"的手机号码上！",LENGTHLONG);
			stopMsgVail = setInterval(function () {
				$("#con_yan_zheng_ma").text(msgShowTime + "秒");
				msgShowTime--;
				if (msgShowTime < 0) {
					$("#con_yan_zheng_ma").text("获取验证码");
					clearInterval(stopMsgVail);
					msgShowTime = 30;
				}
			}, 1000);
		}
		Utils.showDialog("获取短信中...");
		Utils.sendPostRequest(URL+"MSms001",params,sendMsg_callback,null)
	}




	/**
	 * 银行账户充值
	 */
	function reChargeByBank(random,val){
		var pwd = "";
		var txnAmount = $_id("rechargeAcc").innerHTML;

		pwd = Security.encryptPassword(productNo,val,random);
		var orderSeq = Utils.getOrderSeq();
		var params = {
			"bisChannel": bisChannel,
			"merId" : merId,
			"channelCode" : "20",
			"tmnNum" : tmnNum,
			"keep" : Utils.getKeep(),
			"staffCode": staffCode,
			"custCode" : custCode,
			"operType" : "1",//操作类型 充值：1 ;提现：2
			"txnAmount" : (txnAmount*100).toFixed(0),
			"orderSeq" : orderSeq,//订单号
			"password" : pwd,
			"acctType" : "0007" //企业账户：0001;交费易账户：0007
		};
		console.log("faZhiVailResult.bankMobile===="+faZhiVailResult.bankMobile)
		console.log("faZhiVailResult.chkCode=========="+faZhiVailResult.chkCode+" ;typeof======"+ typeof faZhiVailResult.chkCode)
		//0 未超过，直接支付；1银行卡不支持快捷（一定有手机号，短信下发）；2提示短信下发；3填写预留手机；4已关闭
		
		console.log("chkCode------------------>" + faZhiVailResult.chkCode)
		if(faZhiVailResult.chkCode == "3"){
			params["bankMobile"] = $("#quickBankPrePhone").val();
		}

		if(faZhiVailResult.chkCode == "1" || faZhiVailResult.chkCode == "2" || faZhiVailResult.chkCode == "3") { 
			if(faZhiVailResult.chkCode == "1" || faZhiVailResult.chkCode == "2") { 
				params["phone"] = faZhiVailResult.bankMobile;
			}else{ 
				params["phone"] = $("#quickBankPrePhone").val();
			}

			var msgVerifyCodeVal = $("#msgVerifyCode").val();
				console.log("verifyCodeEncrypt1："+msgVerifyCodeVal);
			var Vcode = App.verifyCodeEncrypt(msgVerifyCodeVal);
				console.log("verifyCodeEncrypt2："+Vcode);
			params["verifyCode"] = Vcode;
			params["serviceType"] = "PAYEAST_HTML5_BANK_RECHARGE";
	    }
		Utils.getDeviceInfo(params);
		var sign = Security.getSign(params);
		params["sign"] = sign;
		params["signVer"] = "2";
		//params["test"] = "true";

		var callback = function(json){
			//隐藏键盘
			PasswordKeyBoard.hideKeyboardUI3();
			Utils.dismissDialog();
			console.log("银行账户充值 出参：" + JSON.stringify(json));
			if (json == "null" || json == null || json == '') {
				Dialog.showAlertDialog('提醒',  ERROR['fail'], '确定', '');
				//Dialog.alert( ERROR['fail']);
				submitOpen = true;
				return;
			}

			if (json.code == "000000") {
				var handleAmount;
				if(!json['handleAmount']){ 
					handleAmount = json['tradeAmount'] - json['tradeAmount'];
					handleAmount = (handleAmount/100).toFixed(2);
				}else { 
					handleAmount = (json['handleAmount']/100).toFixed(2);
				}

				$_id("orderNumber").innerHTML = json['transSeq'];
				$_id("toTheAccount").innerHTML = (json['txnAmount']/100).toFixed(2);
				$_id("tradeMoney").innerHTML = (json['tradeAmount']/100).toFixed(2);
				$_id("handingCharge").innerHTML = handleAmount;
				Utils.toNextPage("rechargeSuccessPage");
				document.title = "充值成功";
				App.setTitle("充值成功");
                //regType;注册类型  0个体商户，    2企业商户
                console.log('hadEpt==ABC==' + hadEpt);
                console.log('regType==ABC==' + regType);
                console.log('productType==' + productType);
                if(hadEpt == '0' && (regType == '0' || regType == '-1') && productType != '3'){
                    $('#kaotong_tianyibao').show();
                }else{
                    $('#kaotong_tianyibao').hide();
                }
				//UI3.0
              	// App.setFinishIcon();//所有应用支付成功之后，右上角有个完成，左上角的返回按钮去掉
//				$("#rechargeConfirmPage").hide();
//				$("#rechargeSuccessPage").show();
				//充值确认界面按钮初始化
				$("#btnContinue").click(function(){
					$("#rechargeSuccessPage").hide();
					hiddenDelBtns();
					//Utils.back();
					console.log("Utils.pageIds====================="+JSON.stringify(Utils.pageIds))
					Utils.back();
					console.log("Utils.pageIds====================="+JSON.stringify(Utils.pageIds))
					//清楚输入框内容
					$("#re_money_1").val("");
					$("#paypwd").val("");
					//Utils.tabChange("tabchange","bankRecharge","yiChKRecharge");
					getAccount();//调用余额查询，查看账户余额；
				});
				$("#btnBack").click(function(){
					//App.exitCompleteApp();
					App.exitApp();
				});
			}else if(json.code == TOKENLOST){//token失效
				var back = function(){
					User.login(productNo);
				}
				var back2 = function(){
					App.exitCompleteApp();
				}
				Dialog.showAlertTwoBtnDialog("登录失效",ERROR['tokenLost'],"确定","取消","",function(result){
					if(result == '1')
						back();
					else
						back2();
				});
				//Utils.alertNewDoubleBtn("ch_alert1","chalertmsg1","chAlertBtn1","chAlertBackBtn",ERROR['tokenLost'],"确定",back,"notice_title",back2,"登陆失效","取消");
				submitOpen=true;
			}else if(json.code == "002135"){//密码错误
				var back = function(){
					//重新绑定立即充值事件
					$_id("rechargeNow").onclick = rechargeNow;
					$("#ch_alert1").hide();
				}
				var back2 = function(){
					App.exitApp();
				}

				Dialog.showAlertTwoBtnDialog("交易结果",json['content'],"继续","取消",json['code'],function(result){
					if(result == '1')
						back();
					else
						back2();
				});
				submitOpen=true;
				//Utils.alertNewDoubleBtn("ch_alert1","chalertmsg1","chAlertBtn1","chAlertBackBtn",json['content']+"("+json['code']+")","继续",back,"notice_title",back2,"交易结果");
			}else if(json.code == "002136"){//密码被锁
				Dialog.showAlertDialog('提醒',  json.content, '确定',  json.code, function(){ 
					App.exitCompleteApp();
				});
				submitOpen=true;
			}else if(json.code == "010054"){//无效签名
				Dialog.showAlertDialog('提醒',  '登录失效', '确定',  json.code);
				submitOpen=true;
			}else{
				Dialog.showAlertDialog('提醒',  json.content, '确定',  json.code);
				submitOpen=true;
				//Dialog.alert( json.content + "(" + json.code + ")");
			}
		};
		console.log("银行账户充值 入参：" + JSON.stringify(params));
		//
		//Utils.showDialog("正在充值中...");
		Utils.sendPostRequest(URL+Method['TAcc002'], params, callback,null);
	}
	/**
	 * 账户余额
	 */
	function getAccount(){
		var params = {
			"merId" : merId,
			"channelCode" : "20",
			"tmnNum" : tmnNum,
			"keep" : Utils.getKeep(),
			"staffCode": staffCode,
			"custCode" : custCode,
			"bisChannel" : bisChannel,
			"bankMode" : "BT1001"
		};
		Utils.getDeviceInfo(params);
		var sign = Security.getSign(params);
		params["sign"] = sign;
		params["signVer"] = "2";
		//params["test"] = "true";
		var callback = function(json){
			console.log("账户余额 出参：" + JSON.stringify(json));
			if (json == "null" || json == null || json == '') {
				Dialog.showAlertDialog('提醒',  ERROR['fail'], '确定', '');
				//Dialog.alert( ERROR['fail']);
				return;
			}

			if (json.code == "000000") {
				var list = json['accountItems'];
				for(var i=0;i<list.length;i++){
					var acct = list[i]['acctType'];
					if(acct != null || acct != "null" || acct != "undefined" || acct !=""){
						if("0007" == acct){//0001：基本账户;0007：IPOS账户;0110：酬金账户
							var balance = list[i].balance;//账户余额
							$_id("accountYue").innerHTML = (balance/100).toFixed(2);
							break;
						}
					}else{
						$_id("accountYue").innerHTML = "暂无查询到余额";
					}
				}
			}else if(json.code == TOKENLOST){//token失效
				Utils.dismissDialog();
				var back = function(){
					User.login(productNo);
				}
				var back2 = function(){
					App.exitCompleteApp();
				}
				Dialog.showAlertTwoBtnDialog("登录失效",ERROR['tokenLost'],"确定","取消","",function(result){
					if(result == '1')
						back();
					else
						back2();
				});
				//Utils.alertNewDoubleBtn("ch_alert1","chalertmsg1","chAlertBtn1","chAlertBackBtn",ERROR['tokenLost'],"确定",back,"notice_title",back2,"登陆失效","取消");
			
			}else{
				Utils.dismissDialog();
				//Dialog.alert( json.content + "(" + json.code + ")");
				$_id("accountYue").innerHTML = "暂无查询到余额";
			}
			getBindCardState(COMEFROM['JFY']);//查询绑卡状态
		};
		console.log("账户余额 入参：" + JSON.stringify(params));
		Utils.showDialog("请稍等..");
		Utils.sendPostRequest(URL+Method['SAcc003'], params, callback,null);

	}
	/**
	 * 用户信息查询
	 */
	function getUserInfo(from){
		var params = {
            "staffCode": staffCode,
            "channelCode": "20",
            "custCode": custCode,
            "merId": merId,
            "tmnNum" : tmnNum,
			"bisChannel" : bisChannel,
            "keep": Utils.getKeep()
        };
		Utils.getDeviceInfo(params);
		var sign = Security.getSign(params);
		params['sign'] = sign;
        params.signVer =  "2";
        //params['test'] = "true";
        console.log("账户信息查询接口 入参：" + JSON.stringify((params)));
        var callback = function (json) {
			Utils.dismissDialog();
            console.log("账户信息查询接口 出参： Result --> " + JSON.stringify(json));
			if (json == "null" || json == null || json == '') {
				Dialog.showAlertDialog('提醒',  ERROR['fail'], '确定', '');
				//Dialog.alert( ERROR['fail']);
				return;
			}

			if (json.code == "000000") {// A00 认证中 ,  A01 未认证 , A02, 已认证, A03待生效,A99 认证失败
				if(from == COMEFROM['JFY']){
					console.log("交费易绑卡-----------》from = "+COMEFROM['JFY']);
				}else if(from == COMEFROM['ZJ']){
					console.log("资金归集绑卡-----------》from = "+COMEFROM['ZJ']);
				}else{
					console.log("------------------解绑流程----------------");
					set1 = json['authenStatus'];
					if(set1=="A02" || set1 == 'A03'){
						PasswordKeyBoard.initPwdId("passwordPlaceholder");
						hiddenDelBtns();
						
						$("#bankLogo1").attr("src",$("#bankLogo").attr("src"));
						$("#bankName1").html($("#bankName").html());
						$("#bankCardNo1").html($("#bankCardNo").html());
						$("#userName1").html($("#userName").html());
						App.setThresholdBtnIsVisable(false);//显示阀值按钮true 显示

						if(prinType == "PT901"){
							//Dialog.alert("代理商信息修改请联系代理商Q群312912075.");
							Toast.makeText("代理商信息修改请联系代理商Q群312912075.",LENGTHLONG);
							return;
						}
			        	Utils.toNextPage("unbundling");

			        }else{
						var back = function(){
							Utils.back();
						}
						Dialog.showAlertDialog('提醒',  "体验商户不支持解绑功能！", '确定', '' ,function(){ 
							back();
						});
			        	//Dialog.alert( "体验商户不支持解绑功能！",back);
			        }
					return;
				}

				if(json['authenStatus'] == "A01"){

					if(prinType == "PT901"){
						RZPassWordType="A01";
						PasswordKeyBoard.initPwdId("paypwdRenZheng");
						$("#paypwdRenZheng").val("");
						//Utils.toNextPage("passVailPage");
						PasswordKeyBoard.initPwdUI3(
							function(val){
								getRandom(COMEFROM['RZ'],val);
							}
						);
						PasswordKeyBoard.popKeyboardUI3();

						console.log("认证");
						return;
					}

					var cb = function(result){
						if(result == '1'){
							RZPassWordType="A01";
							PasswordKeyBoard.initPwdId("paypwdRenZheng");
							$("#paypwdRenZheng").val("");
							//Utils.toNextPage("passVailPage");

							PasswordKeyBoard.initPwdUI3(
								function(val){
									getRandom(COMEFROM['RZ'],val);
								}
							);
							PasswordKeyBoard.popKeyboardUI3();
							console.log("认证");
							/*						 loadToNewUrl("Auth");
							 App.jumpToNewH5View(RZ_Url);*/
							return ;
						}
					}
					//showAlertTwoBtnDialog : function(title, content,  okBtn, cancelBtn, code, callback){
					Dialog.showAlertTwoBtnDialog("您好",ERROR['authState1'],"立即认证","返回","",cb);
					//Utils.alertDoubleBtn("ch_alert1","chalertmsg1","chAlertBtn1","chAlertBackBtn",ERROR['authState1'],"立即认证",cb);

				}else if(json['authenStatus'] == "A02" || json['authenStatus'] == "A03"){//已认证，跳转到绑卡界面
					RZPassWordType="A02";
					PasswordKeyBoard.initPwdId("paypwdRenZheng");
					$("#paypwdRenZheng").val("");
					//Utils.toNextPage("passVailPage");

					PasswordKeyBoard.initPwdUI3(
						function(val){
							getRandom(COMEFROM['RZ'],val);
						}
					);
					PasswordKeyBoard.popKeyboardUI3();

/*					var back = function(){
						Utils.toNextPage("passVailPage");	
						console.log("走向绑卡界面");
						App.jumpToNewH5View(BK_URl);
					};
					Utils.alertDoubleBtn("ch_alert1","chalertmsg1","chAlertBtn1","chAlertBackBtn",ERROR['authState1'],"立即绑卡",back);
*/
				}else if(json['authenStatus'] =="A99"){//A99 认证失败
					Dialog.showAlertDialog('提醒',  ERROR['authState3'], '确定', '');
					//Dialog.alert( ERROR['authState3']);
				}else if(json['authenStatus'] =="A00"){//认证中
					Dialog.showAlertDialog('提醒',  ERROR['authState2'], '确定', '');
					//Dialog.alert( ERROR['authState2']);
				}else{
                    console.log('666666');
					Dialog.showAlertDialog('提醒', '您当前认证状态为认证中，暂不能绑卡，请联系客服解除认证状态。', '确定', '');
					//Dialog.alert('认证状态未知');
				}
			}else if(json.code == TOKENLOST){//token失效
				var back = function(){
					User.login(productNo);
				}
				var back2 = function(){
					App.exitCompleteApp();
				}
				Dialog.showAlertTwoBtnDialog("登录失效",ERROR['tokenLost'],"确定","取消","",function(result){
					if(result == '1')
						back();
					else
						back2();
				});
				//Utils.alertNewDoubleBtn("ch_alert1","chalertmsg1","chAlertBtn1","chAlertBackBtn",ERROR['tokenLost'],"确定",back,"notice_title",back2,"登陆失效","取消");
			
			}else{
				Dialog.showAlertDialog('提醒', json.content, '确定', json.code);
				//Dialog.alert( json.content + "(" + json.code + ")");
			}

        }

		Utils.showDialog("请稍等..");
        Utils.sendPostRequest(URL + Method.SAcc001, params, callback, null);
	}
	/**
	 * 跳转到绑卡界面
	 */
	function loadToNewUrl(from){
		if(from == "Auth"){
			App.jumpToNewH5View(RZ_Url);
		}else if(from == "bindBank"){
			App.jumpToNewH5View(BK_URl);
		}
	}
	/**
	 * 确认解绑按钮
	 */

	$("#sure_unbundling").click(function(){
		//var value = PasswordKeyBoard.keyStr;
		//if(value.length <6){
		//	Toast.makeText(ERROR['pwdError'],LENGTHLONG);
		//	return;
		//}
		if(hadEpt == '1'){
			Dialog.showAlertDialog('提醒', '已开通添益宝无法解绑', '确定', '');
			return;
		}
		PasswordKeyBoard.initPwdUI3(function(val){
			//getRandom(COMEFROM['CF'],val);
			getRandom(COMEFROM["JB"],val);
		});
		PasswordKeyBoard.popKeyboardUI3();

	});
	/**
	 * 获取随机数
	 * @return {TypeName}
	 */
	function getRandom(from,JSONResult1){
		submitOpen = false;

		var callback = function(json){
			Utils.dismissDialog();
			submitOpen = true;
			console.log("获取随机数 出参：" + JSON.stringify(json));
			if(json['code'] == "000000"){
				var random = json['randNum'];
				if(COMEFROM['ZJ'] == from){//资金归集
					zijRecharge(random);
				}
//				else if(COMEFROM['JCK'] == from){//翼充卡点击充值时获取溢价
//					//reChargeByCard(random);
//					appreciationQuery();
//				}
				else if(COMEFROM['JFY'] == from){//交费易
					$_id("rechargeNow").onclick = function(){};
					reChargeByBank(random,JSONResult1);
				}else if(COMEFROM['TYB'] == from){//添益宝转入银行卡  3.6企业理财申购 (TEpt004)
                    financialPurchase(random,JSONResult1);
                }else if(COMEFROM["ReC"] == from){//翼充卡确认界面点击支付
					reChargeByCard(random);
				}else if(COMEFROM["JB"] == from){//解绑
					setTInfo(random,JSONResult1);
				}else if(COMEFROM["RZ"] == from){	//认证验证支付密码
					//var pwd = PasswordKeyBoard.keyStr;
					//if(pwd.length == "" || pwd.toString().trim().length == 0   ){
					//	Toast.makeText("请输入正确的支付密码！",LENGTHLONG);
					//	return ;
					//}
					Utils.showDialog("请稍候...");
					var pwsMD = Security.encryptPassword(productNo,JSONResult1,random);
					pswVail(pwsMD);
				}else if(COMEFROM["AF"] == from){
					addFaZhi(random,JSONResult1);
				}
//				else if(COMEFROM["SF"] == from){
//					var pwd = PasswordKeyBoard.keyStr;
//					Utils.showDialog("请稍候...");
//					var pwsMD = Security.encryptPassword(productNo,pwd,random);
//					pswVail(pwsMD,JSONResult1);
//				}
				else if(COMEFROM["CF"] == from){
					closeFaZhi(random,JSONResult1);
				}
			}else{
				Dialog.showAlertDialog('提醒', json.content, '确定', json.code);
				//Dialog.alert( json.content + "(" + json.code + ")");
			}
		};
		console.log("获取随机数 入参：" + JSON.stringify(Utils.getRandomParams()));
		var Params = Utils.getRandomParams();
		Params["signType"] = "RSA";
		Utils.showDialog("请稍等....");
		Utils.sendPostRequest(URL+Method['MRdcMake'], Params, callback,null);
	}
	/**
	 * 翼充卡充值
	 */
	function reChargeByCard(random){
		var cardNo = $_id("cardNo").value;
		var cardPwd = $_id("cardPwd").value;

		cardPwd = Security.encryptPassword(productNo,cardPwd,random);

		var txnAmount = $_id("rechargeAcc").innerHTML;//充值金额
		var getAcc = $_id("getAcc").innerHTML;//到账金额
		var orderSeq = Utils.getOrderSeq();
		var params = {
			"merId" : merId,
			"bisChannel" : bisChannel,
			"channelCode" : "20",
			"tmnNum" : tmnNum,
			"keep" : Utils.getKeep(),
			"staffCode": staffCode,
			"custCode" : custCode,
			"txnAmount" : (txnAmount*100).toFixed(0),//交易金额
			"orderSeq" : orderSeq,//订单号 发起方流水号
			"payPassword" : cardPwd,
			"cardNo" : cardNo,//翼充卡的卡号
			"sPayAmount" : (getAcc*100).toFixed(0) //应付金额
		};
		Utils.getDeviceInfo(params);
		var sign = Security.getSign(params);
		params["sign"] = sign;
		params["signVer"] = "2";
		//params["test"] = "true";

		var callback = function(json){
			Utils.dismissDialog();
			console.log("翼充卡充值 出参：" + JSON.stringify(json));
			if (json == "null" || json == null || json == '') {
				Dialog.showAlertDialog('提醒', ERROR['fail'], '确定', '');
				//Dialog.alert( ERROR['fail']);
				return;
			}
			if (json.code == "000000") {
				if(json['transseq'] != 'undefined' || json['transseq'] != undefined){
					Dialog.showAlertDialog('提醒', "交易处理中，为避免损失，请到收支查询确认", '确定', '', function(){ 
						App.exitApp();
					});
					//Dialog.alert("交易处理中，为避免损失，请到收支查询确认");
					return;
				}
				$_id("orderNumber").innerHTML = json['transseq'];
				$_id("tradeMoney").innerHTML = (json['txnAmount']/100).toFixed(2);
				$_id("toTheAccount").innerHTML = (json['sPayAmount']/100).toFixed(2);
				$_id("handingCharge").innerHTML = ((json['txnAmount']-json['sPayAmount'])/100).toFixed(2);

                //regType;注册类型  0个体商户，    2企业商户
                console.log('hadEpt==ABC==' + hadEpt);
                console.log('regType==ABC==' + regType);
                console.log('productType==' + productType);
                if(hadEpt == '0' && (regType == '0' || regType == '-1') && productType != '3'){
                    $('#kaotong_tianyibao').show();
                }else{
                    $('#kaotong_tianyibao').hide();
                }
				//UI3.0
               // App.setFinishIcon();//所有应用支付成功之后，右上角有个完成，左上角的返回按钮去掉
                Utils.toNextPage("rechargeSuccessPage");

				//充值确认界面按钮初始化
				$("#btnContinue").click(function(){
					$("#rechargeSuccessPage").hide();
					App.setThresholdBtnIsVisable(false);//显示阀值按钮true 显示
					hiddenDelBtns();
					//Utils.back();
					Utils.back();
					$("#cardNo").val("");
					$("#cardPwd").val("");
					$("#re_money_2").val("");
					//Utils.tabChange("tabchange","bankRecharge","yiChKRecharge");
					getAccount();//调用余额查询，查看账户余额；
				});
				$("#btnBack").click(function(){
					App.exitApp();
				});
			}else if(json.code == TOKENLOST){//token失效
				var back = function(){
					User.login(productNo);
				}
				var back2 = function(){
					App.exitCompleteApp();
				}
				Dialog.showAlertTwoBtnDialog("登录失效",ERROR['tokenLost'],"确定","取消","",function(result){
					if(result == '1')
						back();
					else
						back2();
				});
				//Utils.alertNewDoubleBtn("ch_alert1","chalertmsg1","chAlertBtn1","chAlertBackBtn",ERROR['tokenLost'],"确定",back,"notice_title",back2,"登陆失效","取消");
			
			}else{
				Dialog.showAlertDialog('提醒', json.content, '确定', json.code);
				//Dialog.alert( json.content + "(" + json.code + ")");
			}
		};
		console.log("翼充卡充值 入参：" + JSON.stringify(params));
		//
		Utils.showDialog("请稍等..");
		Utils.sendPostRequest(URL+Method['TCard002'], params, callback,null);
	}
	/**
	 * 溢价查询
	 */
	function appreciationQuery(){
		var account = $_id("re_money_2").value;
		var cardNo = $_id("cardNo").value;
		var cardPwd = $_id("cardPwd").value;
		console.log("cardNo.length = "+cardNo.length);
		console.log("cardNo.length = "+(cardNo.length !=16));
		console.log("cardNo.length = "+(cardNo.length !=12));
		
		if(cardNo.length !=16 && cardNo.length !=12){
			Toast.makeText(ERROR['cardNoError'],LENGTHLONG);
			return;
		}
		if(cardPwd.length<6){
			Toast.makeText(ERROR['cardPwdError'],LENGTHLONG);
			return;
		}
		if(!Utils.isNumber(account,1000,1)){
			Toast.makeText(ERROR['moneyError1'],LENGTHLONG);
			return;
		}

		var params = {
			"merId" : merId,
			"channelCode" : "20",
			"tmnNum" : tmnNum,
			"keep" : Utils.getKeep(),
			"staffCode": staffCode,
			"bisChannel" : bisChannel,
			"custCode" : custCode,
			"actionCode" : "18010209",//03010008：全国电信直充;05010005：全国移动直充;04010003：全国联通直充;09010001：电子售卡
			"prodCode" : "2004",//1001：电信充值付费卡;1002：联通一卡充;2003：天下通卡;2004：翼充卡
			"faceAmount" : (account*100).toFixed(0)
			//"" : ,
		};
		Utils.getDeviceInfo(params);
		var sign = Security.getSign(params);
		params["sign"] = sign;
		params["signVer"] = "2";
		var callback = function(json){
			Utils.dismissDialog();
			console.log("溢价查询 出参：" + JSON.stringify(json));
			if (json == "null" || json == null || json == '') {
				Dialog.showAlertDialog('提醒', ERROR['fail'], '确定', '');
				//Dialog.alert( ERROR['fail']);
				return;
			}

			if (json.code == "000000") {
				//var concession = json['concession'];
				var m = $_id("re_money_2").value;
				$_id("rechargeAcc").innerHTML = (m*1).toFixed(2);//充值金额

				$("#rechargeNo").show();
				$("#rechCardNo").html($("#cardNo").val());
				$("#bankPwdLine").hide();
				
				$("#faZhiPhone").hide();
				$("#faZhiMsm").css("display","none");
				$_id("rechargeWay").innerHTML ="翼支付卡";
				//$_id("fees").innerHTML = (concession/100).toFixed(2);

				$_id("getAcc").innerHTML = (m-(concession/100).toFixed(2)).toFixed(2);//到账金额
				
				App.setThresholdBtnIsVisable(false);//显示阀值按钮true 显示
				$("#shouxuFees").show(); //显示手续费
				$("#toAccount").show(); //到账金额
				Utils.toNextPage("rechargeConfirmPage");
				$_id("rechargeNow").onclick = function(){
					getRandom(COMEFROM["ReC"]);
				}
			}else if(json.code == TOKENLOST){//token失效
				var back = function(){
					User.login(productNo);
				}
				var back2 = function(){
					App.exitCompleteApp();
				}
				Dialog.showAlertTwoBtnDialog("登录失效",ERROR['tokenLost'],"确定","取消","",function(result){
					if(result == '1')
						back();
					else
						back2();
				});
				//Utils.alertNewDoubleBtn("ch_alert1","chalertmsg1","chAlertBtn1","chAlertBackBtn",ERROR['tokenLost'],"确定",back,"notice_title",back2,"登陆失效","取消");
			
			}else{
				Dialog.showAlertDialog('提醒', json.content, '确定',  json.code );
				//Dialog.alert( json.content + "(" + json.code + ")");
			}
		}
		console.log("溢价查询 入参：" + JSON.stringify(params));

		Utils.showDialog("请稍等..");
		Utils.sendPostRequest(URL+Method['SPrm001'], params, callback,null);
	}
	/**
	 * 资金充值接口
	 * @param {Object} random
	 * @return {TypeName}
	 */
	function zijRecharge(random){
		var money = $_id("re_money_3").value;
		var pwd = PasswordKeyBoard.keyStr;
		pwd = Security.encryptPassword(productNo,pwd,random);

		Utils.showDialog("请稍候...");
		sendPetTypes(pwd,money);
	}
	    function setT() {
	    	getUserInfo();
    }
    function setTInfo(random,val){
    	//var pwd = $_id("password").value;
		//PasswordKeyBoard.keyStr;

		var pwd = Security.encryptPassword(productNo,val,random);
        var params = {
            "merId" : merId,
			"channelCode" : "20",
			"bisChannel" : bisChannel,
			"tmnNum" : tmnNum,
			"keep" : Utils.getKeep(),
			"staffCode": staffCode,
			"custCode" : custCode,
            "payPassWord":pwd,
             "accId":accId

        };
		Utils.getDeviceInfo(params);
        var sign = Security.getSign(params);
        params['sign'] = sign;
        params.signVer =  "2";
        //params['test'] = "true";
        console.log("解绑 入参：" + JSON.stringify((params)));
        var callback = function (json) {
			PasswordKeyBoard.hideKeyboardUI3();
        	$_id("unlockDelBtn").className = "del";
			PasswordKeyBoard.initPwdId("passwordPlaceholder");
			Utils.dismissDialog();
            console.log("解绑接口 出参： Result --> " + JSON.stringify(json));
            if (json == "null" || json == null || json == '') {
            	Dialog.showAlertDialog('提醒',  ERROR['fail'], '确定', '' );
                //Dialog.alert( ERROR['fail']);
                return;
            }

            if (json.code == "000000") {// A00 认证中 ,  A01 未认证 , A02, 已认证, A03待生效,A99 认证失败
            	App.updateUserInfo("0"); //更新用户信息
                Dialog.showAlertDialog('提醒', "您成功解绑了尾号为"+$_id("bankCardNo1").innerHTML+"的银行卡！", '确定', '' , function() { 
        			App.exitApp();
                });
                //Dialog.alert("您成功解绑了尾号为"+$_id("bankCardNo1").innerHTML+"的银行卡！");
            }else if(json.code == TOKENLOST){//token失效
            	var back = function(){
					User.login(productNo);
				}
				var back2 = function(){
					App.exitCompleteApp();
				}
				Dialog.showAlertTwoBtnDialog("登录失效",ERROR['tokenLost'],"确定","取消","",function(result){
					if(result == '1')
						back();
					else
						back2();
				});
				//Utils.alertNewDoubleBtn("ch_alert1","chalertmsg1","chAlertBtn1","chAlertBackBtn",ERROR['tokenLost'],"确定",back,"notice_title",back2,"登陆失效","取消");
			
            }else if(json.code == "020004"){//密码被锁
            	Dialog.showAlertDialog('提醒',  json.content, '确定', json.code, function(){ 
					App.exitCompleteApp();
            	});
				//Dialog.alert( json.content + "(" + json.code + ")");
			}else{
            	var back = function(){
					$("#ch_alert1").hide();
					hiddenDelBtns();
					PasswordKeyBoard.initPwdId("passwordPlaceholder");
				}
				var back2 = function(){
					Utils.back();
				}

				Dialog.showAlertTwoBtnDialog("解绑失败",json.content,"确定","返回",json['code'],function(result){
					if(result == '1')
						back();
					else
						back2();
				});

				//Utils.alertNewDoubleBtn("ch_alert1","chalertmsg1","chAlertBtn1","chAlertBackBtn",json.content+"("+json['code']+")","确定",back,"notice_title",back2,"解绑失败","返回");
            }

        }

		Utils.showDialog("请稍等..");
        Utils.sendPostRequest(URL + Method.MBinCrd005, params, callback, null);
    }
	function hasOrNoBankChange(id1,id2){
		$_id(id1).style.display="none";
		$_id(id2).style.display="block";
	}
	function createXML(pwd,money) {//创建XML文本字符串
		var keep = Utils.getKeep();
		var requesttime = Utils.getTime();
		var alltime = Utils.getOrderSeq();
		var token = info['tokenCode'];
		var zjMerId = info['prtnCode'];//机构编码
		var params = {
				"ACCTTYPE" : "0001",
				"AGENTCODE" : productNo,
				"OPERTYPE" : "1",
				"KEEP" : keep,
				"ORDERSEQ" : alltime,
				"REQUESTTIME" : requesttime,
				"PASSWORD" : pwd,
				"STAFFCODE" : productNo,
				"TXNAMOUNT" : (money*100).toFixed(0),
			    "KEY" : token,
				"WEBSVRNAME" : "账户管理接口",
				"WEBSVRCODE" : "01_004"
		};
		var sign = Security.getSignINF(params);
		var xml = '<?xml version="1.0" encoding="utf-8"?>'+
			'<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:impl="http://impl.websvc">'+
			  '<soapenv:Header/>'+
			  '<soapenv:Body>'+
			   ' <impl:dispatchCommandEXT soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">'+
			      '<in0 xmlns:soapenc="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance" xsi:type="soapenc:string" xs:type="type:string">01_004|440000-BestPayEEClient_V2.9.2-292-127.0.0.1|292|127.0.0.1|</in0>'+
			      '<in1 xmlns:soapenc="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance" xsi:type="soapenc:string" xs:type="type:string"><![CDATA[<?xml version="1.0" encoding="UTF-8"?><Request><VerifyParameter><CER></CER><CHANNELCODE>20</CHANNELCODE><MERID>'+zjMerId+'</MERID><SIGN>'+sign+'</SIGN><TMNNUM>'+zjTmnNum+'</TMNNUM></VerifyParameter><PayPlatRequestParameter><CTRL-INFO APPFROM="440000-BestPayEEClient_V2.9.2-292-127.0.0.1" KEEP="'+keep+'" REQUESTTIME="'+requesttime+'" WEBSVRCODE="01_004" WEBSVRNAME="账户管理接口"/><PARAMETERS><ACCTTYPE>0001</ACCTTYPE><AGENTCODE>'+productNo+'</AGENTCODE><OPERTYPE>1</OPERTYPE><ORDERSEQ>'+alltime+'</ORDERSEQ><PASSWORD>'+pwd+'</PASSWORD><STAFFCODE>'+productNo+'</STAFFCODE><TXNAMOUNT>'+(money*100).toFixed(0)+'</TXNAMOUNT></PARAMETERS></PayPlatRequestParameter></Request>]]></in1>'+
			    '</impl:dispatchCommandEXT>'+
			    '<in0 xmlns:xs="http://www.w3.org/2000/XMLSchema-instance" xs:type="type:string"></in0>'+
			    '<in1 xmlns:xs="http://www.w3.org/2000/XMLSchema-instance" xs:type="type:string"></in1>'+
			  '</soapenv:Body>'+
			'</soapenv:Envelope>';
		return xml;
	}
	function sendPetTypes(pwd,money) {//发送请求
		var xml = createXML(pwd,money);
		console.log("xml params------------------------>"+xml);
		var url = ZjUrl;
		var callback = function(xml) {//XMLHttpRequest回调函数XMLHttpRequest.responseText
			Utils.dismissDialog();
			xml = xml.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
			console.log("xml------------------------>"+xml);
			var responsecode = xml.substring(xml.indexOf("<RESPONSECODE>")+14,xml.indexOf("</RESPONSECODE>"));
			var responsecontent = xml.substring(xml.indexOf("<RESPONSECONTENT>")+17,xml.indexOf("</RESPONSECONTENT>"));
			responsecontent = eval("'" + responsecontent.replace(/&#x/g,"\\u").replace(/\;/g,"") + "'");
			responsecontent = unescape(responsecontent.replace(/\\u/g, "%u"));
			if(responsecode == "000000"){
				var transseq = xml.substring(xml.indexOf("<TRANSSEQ>")+10,xml.indexOf("</TRANSSEQ>"));
				var txnamount = xml.substring(xml.indexOf("<TXNAMOUNT>")+11,xml.indexOf("</TXNAMOUNT>"));
				var tradeamount = xml.substring(xml.indexOf("<TRADEAMOUNT>")+13,xml.indexOf("</TRADEAMOUNT>"));
				var shouxu = txnamount - tradeamount;
				console.log("txnamount----------------->"+txnamount);
				console.log("transseq----------------->"+transseq);
				console.log("shouxu----------------->"+shouxu);
				$_id("orderNumber").innerHTML = transseq;
				$_id("tradeMoney").innerHTML = (tradeamount/100).toFixed(2);
				$_id("toTheAccount").innerHTML = (txnamount/100).toFixed(2);
				$_id("handingCharge").innerHTML = (shouxu/100).toFixed(2);
				$("#zijRchargePage").hide();
				$("#rechargeSuccessPage").show();
				//充值确认界面按钮初始化
				$("#btnContinue").click(function(){
					$("#rechargeSuccessPage").hide();
					hiddenDelBtns();
					PasswordKeyBoard.initPwdId("zijpwd");
					$("#re_money_3").val("");
				});
				$("#btnBack").click(function(){
					App.exitApp();
				});
			}else{
				Dialog.showAlertDialog('提醒', responsecontent, '确定', responsecode);
				//Dialog.alert(responsecontent+ "("+responsecode+")");
			}
		};
		Utils.sendPostXmlRequest(url+"bppf_inf/services/DealProcessor",xml,callback,null);
    }
});