define(['utils','jquery','jquery-jtemplates'],function(Utils,$,jtemplates){
	var productNo = User.getProduct();
    var custCode = useInfoIOS.custCode;
    var staffCode = useInfoIOS.staffCode;
    var merId = useInfoIOS.prtnCode;
    var ornotagreement = '1';
    var agreement = '2';
    var merchantType = 0;
    var authStatA01 ="";
    var hadEptinfo = useInfoIOS.hadEpt;
    var bankMode = useInfoIOS.bankMode;//子卡
    var productType = useInfoIOS.productType;//交费易类型
    var prinType = useInfoIOS.prinType; //是否代理商
    var WHEATHERTHREEINONE = false; //是否三证合一(是：ture; 否：false)
    var HAVE31ID = false; //是否上传了三证合一
    var LOG_ID = null;
    var areaCode_val = null;
	var authChannel = ''; //认证通道（A01:普通  A02:人脸识别）
	var authApplyer = ''; //认证申请人
	var authAppCertNo = ''; //认证申请人身份证号
	var appCertNoEffSD = ''; //认证申请人身份证有效起始日
	var appCertNoEffED = ''; //认证申请人身份证有效结束日
	var authLegal = ''; //认证法人
	var authLegalCertNo = ''; //认证法人身份证号
	var legalCertNoEffSD = ''; //认证法定代表人身份证有效起始日
	var legalCertNoEffED = ''; //认证法定代表人身份证有效结束日
	var legalAddress = ''; //认证法人居住地
	var goContinual = "2"; //企业商户冻结提示
	var prtnCode = ''; //企业代码（商家编码）
	var custName = ''; //企业名称（商家名称）
	var prtnName = null; //商户名称
	var urlParameters = Utils.urlParameters();//员工认证参数
	var josnDLS = true;
	var djDLS = false;
	var statesTips = '';

    //隐藏loading图片
    $("#loading").hide();

    console.log("hadEptinfo===============" + hadEptinfo)

    console.log("useInfoIOS=="+JSON.stringify(useInfoIOS));
    console.log("hadEptinfo===" + hadEptinfo);
    console.log("bankMode===" + bankMode);
    console.log("productType===" + productType);

    
    console.log("urlParameters===" + JSON.stringify(urlParameters));

    if(hadEptinfo == "1"){
        console.log("8888888已经认22证和开通添益宝了-------");
        $("#showapplicantname").unbind();  //申请人姓名
        $("#authapplyname").attr('readonly',"true"); //经营者
        $("#authIdNo").attr('readonly',"true"); //身份证号
//        $("[name = merchantTypeChoose]").unbind();// 切换个体与企业
        $("#tybTips").show();
        console.log("8888888已经认证和开通333222222222添益宝了-------");
		gotoYanZheng('0', true); //进入商户认证页面 0 个体商户

    }else{ 
    	if(urlParameters.worker_recetification==='worker'){ 
    		//人脸走过来的员工认证
    		gotoYanZheng('2', true);
    	}else{ 
	    	$("#choseShop").show(); //显示首页
	    	$("#tybTips").hide();
			App.setTitle("选择认证类型");
    	}
    }

    console.log("this showDialog");
    listenImgBtn();
    ListenInput(); //输入框事件监听

	//选择商户类型
	$(".main_rz").on('click', gotoYanZheng);


	function gotoYanZheng(type,switchs){ 
		//1是企业商户   0是个体商户
		console.log("pageIds===========" + JSON.stringify(Utils.pageIds));
		merchantType = $(this).data('code');
		console.log("merchantType1= "+ merchantType);
		console.log("merchantType typeof= "+  typeof merchantType);
		if(switchs){ 
			merchantType = type;
		}
		console.log("进来了："+" "+merchantType+" "+goContinual);
		if(merchantType == "1" && goContinual === "2"){ 
			Dialog.showAlertTwoBtnDialog('提醒', '商户认证为企业商户，酬金为月度结算，商户需自行前往当地税务局，开具种类为“服务费”或“酬金”的税务发票寄回支付公司，支付公司审核后可发放。', '知道了', '取消','', function(code){
				goContinual = code;
				console.log("goContinual================" + goContinual);
				if(goContinual === "1"){ 
					gotoYanZheng(merchantType,true);
				}
			});	
			return;
		}

		$("#licenceNomber").show(); //显示营业执照号

		//console.log("merchantType====" + merchantType + "type===" + arguments[0])
		shopType(merchantType); //判断商户类型
		console.log("merchantType======="+ merchantType);

		console.log("info:page authority onLoad ");
		$("#autoNextTwoButton").on('click',personalAuth);
		
		//无纸化查询(SAut102)
		getAuthRegisterInfo(); //正在查询信息

		$("#showapplicantname").off('click');
		//申请人姓名绑定事件
		$("#showapplicantname").on('click',showapplicantname_click);

		merchantType += '';
	    //设置标题    1是企业商户   0是个体商户
		if(merchantType === '1'){ 
			document.title ="企业商户认证";
			App.setTitle("企业商户认证");
			$("#setTitle").val(1);

			setTitle("modify_shopName","商户名称");
			setTitle("modify_shopAddress","企业地址");
			setPlaceholder("modify_shopAddress","请填写公司企业地址");
			setTitle("modify_jyz","代理人");
			setPlaceholder("modify_jyz","请填写代理申请人姓名");
			setPlaceholder("authIdNo","代理申请人身份证号码", 'me');
			setPlaceholder("authemail","请填写代理申请人联系邮箱", 'me');
			$("#gerenShow").hide();
			$("#qiyeShow").show();
			$("#showShoptype").hide(); //商铺类型
			$(".yzrz").show(); //员工认证以外的框
			$("#yarz2").show(); //员工认证以外的框
			$("#ygrz_next_Btn").hide(); //员工认证下一步按钮

			console.log("企业商户认证=================")
		}else if(merchantType === '0'){ 
			document.title ="个体商户认证";
			App.setTitle("个体商户认证");
			$("#setTitle").val(0);

			setTitle("modify_shopName","商铺名称");
			setTitle("modify_shopAddress","商铺地址");
			setPlaceholder("modify_shopAddress","请填写商铺地址");
			setTitle("modify_jyz","经营者");
			setPlaceholder("modify_jyz","营业执照负责人一栏");
			setPlaceholder("authIdNo","经营者身份证号码", 'me');
			setPlaceholder("authemail","请填写有效联系邮箱", 'me');
			$("#gerenShow").show();
			$("#qiyeShow").hide();
			$("#showShoptype").show(); //商铺类型
			$(".yzrz").show(); //员工认证以外的框
			$("#yarz2").show(); //员工认证以外的框
			$("#ygrz_next_Btn").hide(); //员工认证下一步按钮

			console.log("个体商户认证=================")
		}else if(merchantType === '2'){ 
			//员工认证
			document.title ="员工认证";
			App.setTitle("员工认证");
			$("#setTitle").val(2);
			setTitle("modify_jyz","申请人姓名");
			setPlaceholder("modify_jyz","请填写");
			$(".yzrz").hide(); //员工认证以外的框
			$("#yarz2").hide(); //员工认证以外的框
			$("#ygrz_next_Btn").show(); //员工认证下一步按钮

			//申请人姓名绑定事件
			$("#showapplicantname").off('click');
		}
	};

    //勾选是否选添益宝
    $(".ornotagreement").on('click',function(){
        $('.ornotagreement').toggleClass("c_sub_bg");
        $('.showxieyi').toggleClass("hidexieyi");
        if($('.ornotagreement').is('.c_sub_bg')){
            ornotagreement = '0';
            agreement = '0';
            console.log("ornotagreement=="+ornotagreement);
        }else{
            ornotagreement = '1';
            agreement = '2';
            $('.agreement').removeClass("c_sub_bg");
            console.log("ornotagreement=="+ornotagreement);
        }
    });

    $(".agreement").on('click',function(){
        $('.agreement').toggleClass("c_sub_bg");
        if($('.agreement').is('.c_sub_bg')){
            agreement = '0';
            console.log("agreement=="+agreement);
        }else{
            agreement = '2';
            console.log("agreement=="+agreement);
        }
    });

    $('#business_record').on('click',function(){
        console.log("111111");
        agreement_info('page_record','page_know','page_fuwu','file/tyb.html');
    });
    document.getElementById("business_know").onclick=function(){//证券投资基金投资人权益须知
        console.log("22222");
        agreement_info('page_know','page_record','page_fuwu','file/jjxy.html');
    };
    document.getElementById("business_fuwu").onclick=function(){//基金直销电子交易服务协议
        console.log("333333");
        agreement_info('page_fuwu','page_record','page_know','file/zjtz.html');
    };
    document.getElementById("fat_btn").onclick=function(){
        Utils.back();
    };

    //企业编码查询
	function checkCompanyCode() { 
		Utils.dismissDialog();
		Utils.showDialog("正在查询你的信息，请稍等..");
		var params = {
			"staffCode": staffCode,
			"channelCode": "20",
			"custCode": custCode,
			"merId": merId,
			"tmnNum": "440106014113",
			"keep":Utils.getKeep(),
			"bisChannel" : bisChannel,
			"prtnCode": prtnCode
		};
		Utils.getDeviceInfo(params);
		var sign = Security.getSign(params);
		params.sign = sign;
		params.signVer= "2";
		console.log("企业编码查询SAut004 入参："+JSON.stringify((params)));
		var checkCompanyCode_callback = function(JSONResult){
			console.log("企业编码查询SAut004 出参： Result --> "+JSON.stringify(JSONResult));
			document.title ="所属企业";
			App.setTitle("所属企业");
			Utils.dismissDialog();
			if (JSONResult.code == TOKENLOST ){
				var back = function(){
					User.login(productNo);
				}
				Utils.alert(  "⊙_⊙,为了您的账户安全，请您重新登录。",back);
				return;
			}else if(JSONResult.code != "000000"){
				if(JSONResult.code == '011053'){ 
				    Utils.alert( "商户编码有误，请重新输入！");
				}
				return ;
			}

			//商户状态提示 S0A：有效 S0F：冻结 S0G：销户 S0X：无效
			var states = '';
			var shopPass = false;
			djDLS = false;
			josnDLS = true;
			if(JSONResult.operFlag === 'S0F'){ 
				states = '已冻结';
			}else if(JSONResult.operFlag === 'S0G'){ 
				states = '已销户';
			}else if(JSONResult.operFlag === 'S0X'){ 
				states = '无效';
			}else if(JSONResult.operFlag === 'S0A'){ 
				if(JSONResult.lastapprStat === 'S0V'){ 
					states = '待审核';
				}else if(JSONResult.lastapprStat === 'S0F'){ 
					states = '审核不通过';
				}else if(JSONResult.lastapprStat === 'S0A'){ 
					//审核通过
					shopPass = true;
				}
			}else{ 
				states = '无效';
			}

			if(!shopPass){ 
				//商户状态禁止下一步
				Utils.toNextPage("company_chackout");
				statesTips = "您的账号"+states+",请返回再试!";
				//Utils.alert(statesTips);
				djDLS = true;
				//return;
			}

			console.log("JSONResult.prntCode==========="+ JSONResult.prntCode)
			if(!JSONResult.prntCode){ 
				//没有商家名称
				josnDLS = false;
				Utils.alert("亲，您所查询的商家不存在！");
				return;
			}

			prtnCode = JSONResult.prntCode || prtnCode; //企业代码（商家编码）
			custName = JSONResult.custName || "未能查到商家名称"; //企业名称（商家名称）

			console.log("prtnCode============"+ prtnCode);
			$("#SAut004_val").html(custName);
			
			Utils.toNextPage("company_chackout");

			if(urlParameters.worker_recetification==='worker'){ 
				//人脸员工认证
				Utils.pageIds.shift();
			}

			
		}
		Utils.sendPostRequest(URL+Method.SAut004,params,checkCompanyCode_callback,null);
	};

	$("#company_next").on('click', function(){ 
		if(!Utils.notEmptyVail("company_code_val","请输入企业代码")){
			verifyFocus('company_code_val');
			return;
		}
		prtnCode = $("#company_code_val").val();
		//企业编码查询SAut004
		checkCompanyCode();
		//Utils.toNextPage("authorityPage");
	});

	//企业编码查询成功 下一步
	$("#company_chackout_next").on('click',function(){ 
		console.log("prinType===="+prinType)
		console.log("josnDLS========"+josnDLS)
		if(!josnDLS && prinType !== 'Pt901'){
			//不是代理商 
			Utils.alert("很抱歉，您不是代理商，没有操作权限！");
			return;
		}
		if(djDLS){ 
			Utils.alert(statesTips);
			return;
		}
		Utils.toNextPage("authorityPage");
	});

    //协议的方法
    function agreement_info(id,id_inner1,id_inner2,subfolder){
        console.log("协议");
        Utils.toNextPage("page_record_father");//跳到协议界面
        var billListElt = document.getElementById(id);
        console.log('xieyi');
        billListElt.innerHTML = "";
        document.getElementById(id_inner1).innerHTML="";
        document.getElementById(id_inner2).innerHTML="";
        var bill_item_container = $(billListElt).setTemplateURL(subfolder);
        bill_item_container.processTemplate(null);
    }
	
	/**
	 * 输入框事件监听
	 */
	function ListenInput(){
		
		inputChange("authIdNo"); //身份证号
		inputChange("authemail"); //电子邮箱
		inputChange("company_code_val");//申请企业代码
		//inputChange("merchantName");//商户名称
		//inputChange("applicantName");//输入申请人姓名
		//inputChange("authapplyname"); //经营者
		//inputChange("authdizhi"); //商铺地址
	}
	function inputChange(id){
		$("#"+id).on("input",function(){
			var thisValLi=$(this).val();
			var clearBtn = $(this).siblings(".clearInfo");
			if(thisValLi.length>0){
				clearBtn.show();
				clearBtn.click(function(){
					clearBtn.hide();
					$("#"+id).val("");
				});
			}else{
				clearBtn.hide();
			}
			if(id == "authIdNo"){ 
				$(this).val(thisValLi.replace(/[^\dXx.]/g,""));
			}
			//if(id =="merchantName" || id == "authdizhi" || id == "authapplyname" || id == "applicantName") { 
				//$(this).val(thisValLi.replace(/[`~!#\$%\^\&\*\(\)_\+<>\?:"\{\},\.\\\/;'\[\]]/g,""));
			//}
		});
	}
	
	//设置栏目名称 和 占位符
	function setTitle(id, title) { 
		$('#'+id).html(title);
	}
	function setPlaceholder(id, placeholder , me ) { 
		if(me === 'me'){ 
			$('#'+id).attr('placeholder', placeholder);
		}else{ 
			$('#'+id).siblings('input').attr('placeholder', placeholder);
		}
		
	}

	/**
	 * 查询注册信息，协助认证
	 * 认证，除代理商除外 ，都可以修改认证 
	 * A00认证中，A01未认证，A02已认证，A99认证失败 A03待生效
	 */
	function infoInit(){
		var params = {
			"staffCode": staffCode,
			"channelCode": "20",
			"custCode": custCode,
			"merId": merId,
			"tmnNum": "440106014113",
			"bisChannel" : bisChannel,
			"keep":Utils.getKeep()
		};
		Utils.getDeviceInfo(params);
		var sign = Security.getSign(params);
		params.sign = sign;
		params.signVer= "2";
		$("#kaotong_agreement").show();
		console.log("infoInit() 入参："+JSON.stringify((params)));
		var infoInit_callback = function(JSONResult){
			console.log("info:Method:SReg003  出参： Result --> "+JSON.stringify(JSONResult));
			Utils.dismissDialog();
			document.title ="修改认证";
			App.setTitle("修改认证");
			if (JSONResult.code == TOKENLOST ) {
				var back = function(){
					User.login(productNo);
				};
				Utils.alert(  "⊙_⊙,为了您的账户安全，请您重新登录。",back);
				return;
			}else if(JSONResult.code != "000000"){
				Utils.alert( "亲,获取您的基本信息失败，"+JSONResult.content);
				return ;
			};
			if(JSONResult.authStat == "A00") {
				var back = function(){
					Utils.back();
				};
				Utils.alert(  "您的认证信息还在审核中，请耐心等候... ...",back);
				return;
			}else if(JSONResult.authStat == "A01"){
                console.log("merchantType==="+merchantType);
                console.log("bankMode==="+bankMode);
                console.log("productType==="+productType);
                if(merchantType*1 == 0){      //1是企业商户   0是个体商户
                    if(productType == '2'){  //2为手机交费易
                        //资金管理模式（BT1001：普通卡，BT1002：子母卡，BT1013：资金池母卡，BT1014：资金池子卡）
                        if(bankMode == "BT1001" || bankMode == 'BT1013'){
                            $("#kaotong_agreement").show();
                        } else {
                            $("#kaotong_agreement").hide();
                        }
                    } else {
                        $("#kaotong_agreement").hide();
                    }
                }else{
                    $("#kaotong_agreement").hide();
                }
                console.log('JSONResult.authStat == "A01"' + JSONResult.authStat);
            }
            else if(JSONResult.authStat == "A02"||JSONResult.authStat == "A99"){
                console.log("JSONResult.authStat=="+JSONResult.authStat);
				document.title ="修改认证";
				App.setTitle("修改认证");
				//rzType="1";
                console.log("params.authStat=="+params.authStat);
                console.log("hadEptinfo==="+hadEptinfo);

                if(params.authStat == 'A02' && hadEptinfo == '1'){
                    console.log("已经认证和开通添益宝了-------");
                    $("#showapplicantname").unbind();  //申请人姓名
                    $("#showapplicantname_bggray").addClass('gray_bg');//申请人的背景
                    $("#showapplicantname_bggray #authapplyname").addClass('gray_bg');//申请人的文本的背景
                    $("#authIdNo").attr('readonly',"true"); //身份证号
                    $("#show_creditcard").addClass('gray_bg');
                    $("#show_creditcard #authIdNo").addClass('gray_bg');
                    $("[name = merchantTypeChoose]").unbind();
                    console.log("已经认证和开通222222222添益宝了-------");
                }
			}else if(JSONResult.authStat == "A03"){
				var back = function(){
					Utils.back();
				};
				Utils.alert(  "您已经认证...",back);
				return;
			}
		    console.log("SReg003出参000000" + JSON.stringify(JSONResult));
			$("#authshanghum").val(JSONResult.prtnName);	//商户号称
			$("#merchantName").val(JSONResult.prtnName);
			$("#authapplyname").val(JSONResult.applyer);	//申请人
			$("#applicantName").val(JSONResult.applyer);
			$("#authIdNo").val(JSONResult.appCertNo);	//申请人身份证号码	
			areaNo = JSONResult.areaCode;
			var args={"code":areaNo};
			var areaDate =  DB_Data.getProCityDistric(areaNo);
			$("#authareas").val(areaDate.ProvinceName+"-"+areaDate.CityName+"-"+areaDate.CountyName);
		}
		Utils.sendPostRequest(URL+Method.SReg003,params,infoInit_callback,null);
	}

	$("[name=textInput]").click(function(){
		$(this).children("div").children("div").children("input").onfocus();
	});



	//图片上传
	$("[name=upImage]").click(function(){
		console.log("------click------");
		var thisId = $(this).attr('id');
		var typeNum = parseInt($(this).text());

		var params = {
			"LOGID": $("#" + thisId + "LogId").text(),
			"TYPE":typeNum,
			"WHEATHERTHREEINONE" : WHEATHERTHREEINONE
		}
		console.log("上传图片入参--> " +JSON.stringify(params));
		//$(this).css("display","none")
		Scanner.handlerVerifyPhoto(params,function(JSONResult) {
			var logId = JSON.stringify(JSONResult);
			logId = logId.substring(1, logId.length - 1);

			console.log("JSONResult=====================" + logId);
			console.log("id============================="+ thisId);
			if(thisId === 'image12' && !!logId) {
				//三证合一上传成功后
				$("#imageLogId").text(logId);
				$("#image3LogId").text(logId);
				$("#image4LogId").text(logId);

				WHEATHERTHREEINONE = true;
				HAVE31ID = true;
				$("#okImg").show(); //三证合一上传成功后 营业执照显示成功
				$("#noneImg").hide();
				$("#okImg3").show(); //三证合一上传成功后 组织机构代码证显示成功
				$("#noneImg3").hide();
				$("#okImg4").show(); //三证合一上传成功后 税务登记证显示成功
				$("#noneImg4").hide();
			}
			if(thisId === 'image' || thisId === 'image3' || thisId === 'image4') { 
				WHEATHERTHREEINONE = false;
				HAVE31ID = false;
			}
			$("#" + thisId + "LogId").text(logId);

			console.log("logId11111111============================="+ logId);

			function clickGo() {
				console.log("显示图片！！");
				var param = {
					"LOGID": $("#" + thisId + "LogId").text(),
					"TYPE": typeNum,
					"WHEATHERTHREEINONE" : WHEATHERTHREEINONE
				}
				Scanner.handlerVerifyPhoto(param, function (JSONResult) {
					var logId = JSON.stringify(JSONResult);
					logId = logId.substring(1, logId.length - 1);

					if(thisId === 'image12' && !!logId) {
						//三证合一上传成功后
						$("#imageLogId").text(logId);
						$("#image3LogId").text(logId);
						$("#image4LogId").text(logId);
					}

					$("#" + thisId + "LogId").text(logId);

					console.log("logId2222222222============================="+ logId);

				}, function () {
					Toast.makeText("取消上传！",LENGTHLONG)
				});
			}
			var indexNum=thisId.replace("image","");
			$("#okImg"+indexNum).show();
			$("#noneImg"+indexNum).hide();
			$('#showImgTitle'+indexNum).unbind(); 
			$("#showImgTitle"+indexNum).click(clickGo);
		},function(){
			Toast.makeText("取消上传！",LENGTHLONG);
		});
	});

	function listenImgBtn(){
		for(var i=1;i<=18;i++){
			$('#showImgTitle'+i).click(imgUpdate);
		}
		$('#showImgTitle').click(imgUpdate);
	}
	
	
	function imgUpdate(){
		var imageId="image";
		var thisId = $(this).attr('id');
		imageId+=thisId.replace("showImgTitle","");
		$("#"+imageId).click();
	}


	var valOldauthyingyezhizhhm = '';
	/**
	 * 营业执照编号页面显示
	 */
	$("#showImgTitle_y").click(function(){
		$("#authyingyezhizhhm_back").blur();
		$("#authyingyezhizhhm_back").val("");
		$("#id_clearauthyingyezhizhhm_back").hide();
		$("#authyingyezhizhhm_back").on("input",function(){
			var thisVal = $(this).val();
			if(valOldauthyingyezhizhhm.length < thisVal.length  && thisVal.replace(valOldauthyingyezhizhhm,'').length > 1){
				$(this).val(valOldauthyingyezhizhhm);
			};
			$("#authyingyezhizhhm_back").val($("#authyingyezhizhhm_back").val().replace(/[^a-zA-Z0-9]+/,''));
			valOldauthyingyezhizhhm = $("#authyingyezhizhhm_back").val();
			var thisValLi=$(this).val();
			if(thisValLi.length>0){
				$("#id_clearauthyingyezhizhhm_back").show();
				$("#id_clearauthyingyezhizhhm_back").click(function(){
					$("#authyingyezhizhhm_back").val("");
					$("#id_clearauthyingyezhizhhm_back").hide();
				});
			}else{
				$("#id_clearauthyingyezhizhhm_back").hide();
			}
		});
		Utils.toNextPage("yingYeNoPicDiv");
		//$(this).blur();
		//$("#authyingyezhizhhm_back").focus();
	});

	/**
	 * 营业执照编号页面隐藏
	 */
	$("#autoNextTwoButton_back").click(function(){
		var authyingyezhizhhm_val=$("#authyingyezhizhhm_back").val();
		if(authyingyezhizhhm_val.length<11){
			Toast.makeText("请输入11位至18位的营业执照编号！",LENGTHLONG);
		}else{
			$("#authyingyezhizhhm").val(authyingyezhizhhm_val);
			$("#y_okImg").show();
			$("#y_noneImg").hide();
			Utils.back();
		}
	});

	//员工认证下一步
	$("#ygrz_next_Btn").on('click', function(){ 
		var authemailVal=$("#authemail").attr("hide_date");//电子邮箱
		var authIdNoVal=$("#authIdNo").attr("hide_date");//身份证号
		var appCertNo = $("#authIdNo").val(); //身份证号码
		
		if((/\*/g).test(appCertNo)){ 
			appCertNo = authAppCertNo;
		}

		 if(!Utils.notEmptyVail("authapplyname","请填写申请人姓名")){ 
			return;
		 }else if(!Utils.notEmptyVail("authIdNo","请填写身份证号码")){ 
		 	return;
		 }else if(!Utils.notEmptyVail("authemail","请填写电子邮箱")){ 
		    return;
		 }
		if(authIdNoVal==null||authIdNoVal==""|| !!$("#authIdNo").val()){
			if($("#authIdNo").val().indexOf('*') < 0) { 
				if(!Utils.idCardVail("authIdNo")){
					verifyFocus('authIdNo');
					return;
				}
			}
		}
		if(authemailVal==null||authemailVal==""|| !!$("#authemail").val()){
			if(!Utils.emailVail("authemail")){
				verifyFocus('authemail');
				return;
			}
		}

		$("#yuangongConfirm").click(function(){
			yuangong_vail();
		});

		cms0112Service_appCertNo(appCertNo);
	});

	//个人、企业下一步
	$("#authorityNextStepBtn").on('click', function(){
		console.log("next click----------------------------------")
		var authemailVal=$("#authemail").attr("hide_date");//电子邮箱
		var authIdNoVal=$("#authIdNo").attr("hide_date");//身份证号
		var authdizhiVal=$("#authdizhi").attr("hide_date");//联系地址
		var prtnName = $("#authshanghum").val(); //商户名称
		var licence = $("#authyingyezhizhhm").val(); //营业执照号码
		var appCertNo = $("#authIdNo").val(); //身份证号码


		
		if((/\*/g).test(appCertNo)){ 
			appCertNo = authAppCertNo;
		}
				
		if(!Utils.notEmptyVail("ahthHangYeId","请选择您的行业")){ 
			return;
		}else if(!Utils.notEmptyVail("authshanghum",ERROR.authShangHuNameEmptyError)){
			return;	
		}

		if(SHOPTYPE_Z == '01') { 
			if(!Utils.notEmptyVail("authyingyezhizhhm","请输入您的营业执照号")){ 
				return;
			}
		}

		if(areaNo == null || areaNo == "" || areaNo == undefined){
			Toast.makeText("请选择完整的地区！",LENGTHLONG);
			return ;
		}else if(!Utils.notEmptyVail("authdizhi","请填写地址")){
			verifyFocus('authdizhi');
			return;
		}else if(!Utils.notEmptyVail("authapplyname",ERROR.authapplyNameEmptyError)){ 
			return;
		}else if(authIdNoVal==null||authIdNoVal==""||$("#authIdNo").val()!=""){
			if($("#authIdNo").val().indexOf('*') < 0) { 
				if(!Utils.idCardVail("authIdNo")){
					verifyFocus('authIdNo');
					return;
				}
			}
		}

		if(authemailVal==null||authemailVal==""||$("#authemail").val()!=""){
			if(!Utils.emailVail("authemail")){
				verifyFocus('authemail');
				return;
			}
		}

		if((/[`~!#\$%\^\&\*\(\)_\+<>\?:"\{\},\.\\\/;'\[\]]/g).test($("#merchantName").val())){ 
			//商户名称
			Toast.makeText("商铺名称/商户名称不能包含特殊字符!",LENGTHLONG);
			return ;
		}else if((/[`~!#\$%\^\&\*\(\)_\+<>\?:"\{\},\.\\\/;'\[\]]/g).test($("#applicantName").val())){ 
			//输入申请人姓名
			Toast.makeText("经营者/代理人不能包含特殊字符!",LENGTHLONG);
			return ;
		}else if((/[`~!#\$%\^\&\*\(\)_\+<>\?:"\{\},\.\\\/;'\[\]]/g).test($("#authdizhi").val())){ 
			//商铺地址
			Toast.makeText("商铺地址/企业地址不能包含特殊字符!",LENGTHLONG);
			return ;
		}

		cms0112Service_prtnName(prtnName,licence,appCertNo);
	});

	//认证信息校验接口 - 商户名称 prtnName
	function cms0112Service_prtnName(prtnName,licence,appCertNo) { 
		Utils.showDialog("请稍等..");
		var params = {
			"staffCode": staffCode,
			"channelCode": "20",
			"custCode": custCode,
			"merId": merId,
			"tmnNum": "440106014113",
			"keep":Utils.getKeep(),
			"bisChannel" : bisChannel,
			"checkType": "prtnName", //商户名称
			"checkValue": prtnName
		};
		Utils.getDeviceInfo(params);
		var sign = Security.getSign(params);
		params.sign = sign;
		params.signVer= "2";
		console.log("MAut005 入参："+JSON.stringify((params)));
		var cms0112Service_callback = function(JSONResult){
			console.log("MAut005 出参： Result --> "+JSON.stringify(JSONResult));
			Utils.dismissDialog();
			if (JSONResult.code == TOKENLOST ){
				var back = function(){
					User.login(productNo);
				}
				Utils.alert(  "⊙_⊙,为了您的账户安全，请您重新登录。",back);
				return;
			}else if(JSONResult.code != "000000"){
				Utils.alert(JSONResult.content);
				return ;
			}

			if(SHOPTYPE_Z == '01'){ 
				//有无营业执照  01(有) 02(无)
				cms0112Service_licence(licence,appCertNo);
			}else{ 
				cms0112Service_appCertNo(appCertNo);
			}
		}
		Utils.sendPostRequest(URL+Method.MAut005,params,cms0112Service_callback,null);
	};

	//认证信息校验接口 - 营业执照号码 licence
	function cms0112Service_licence(licence,appCertNo) { 
		Utils.showDialog("请稍等..");
		var params = {
			"staffCode": staffCode,
			"channelCode": "20",
			"custCode": custCode,
			"merId": merId,
			"tmnNum": "440106014113",
			"keep":Utils.getKeep(),
			"bisChannel" : bisChannel,
			"checkType": "licence", //营业执照号码
			"checkValue": licence
		};
		Utils.getDeviceInfo(params);
		var sign = Security.getSign(params);
		params.sign = sign;
		params.signVer= "2";
		console.log("MAut005 入参："+JSON.stringify((params)));
		var cms0112Service_callback = function(JSONResult){
			console.log("MAut005 出参： Result --> "+JSON.stringify(JSONResult));
			Utils.dismissDialog();
			if (JSONResult.code == TOKENLOST ){
				var back = function(){
					User.login(productNo);
				}
				Utils.alert(  "⊙_⊙,为了您的账户安全，请您重新登录。",back);
				return;
			}else if(JSONResult.code != "000000"){
				Utils.alert(JSONResult.content);
				return ;
			}

			cms0112Service_appCertNo(appCertNo);
		}
		Utils.sendPostRequest(URL+Method.MAut005,params,cms0112Service_callback,null);
	};

	//认证信息校验接口 - 申请人身份证 appCertNo
	function cms0112Service_appCertNo(appCertNo) { 
		Utils.showDialog("请稍等..");
		var params = {
			"staffCode": staffCode,
			"channelCode": "20",
			"custCode": custCode,
			"merId": merId,
			"tmnNum": "440106014113",
			"keep":Utils.getKeep(),
			"bisChannel" : bisChannel,
			"checkType": "appCertNo", //申请人
			"checkValue": appCertNo
		};
		Utils.getDeviceInfo(params);
		var sign = Security.getSign(params);
		params.sign = sign;
		params.signVer= "2";
		console.log("MAut005 入参："+JSON.stringify((params)));
		var cms0112Service_callback = function(JSONResult){
			console.log("MAut005 出参： Result --> "+JSON.stringify(JSONResult));
			Utils.dismissDialog();
			if (JSONResult.code == TOKENLOST ){
				var back = function(){
					User.login(productNo);
				}
				Utils.alert(  "⊙_⊙,为了您的账户安全，请您重新登录。",back);
				return;
			}else if(JSONResult.code != "000000"){
				Utils.alert(JSONResult.content);
				return ;
			}

			Utils.toNextPage("nextAuthorityPage");
		}
		Utils.sendPostRequest(URL+Method.MAut005,params,cms0112Service_callback,null);
	};

	$("#autoNextThreeButton").click(function(){
		if(Utils.conditionNotEmptyVail("imageLogId","请上传您的营业执照副本")&&
			Utils.conditionNotEmptyVail("image3LogId","请上传您的组织机构代码证照片")&&
			Utils.conditionNotEmptyVail("image4LogId","请上传您的税务登记证照片")) {
				
			Utils.toNextPage("nextQiYeAuthorityPage");
		}
	});


	$("#qiyeRenZhengConfirm").click(function(){
		enterpriseAuth();
	});

	//所在有效地区选择框
	$("#authareasShow").click(
		function(){
			confirmCityId = "authareas";
			selectArea("authprovice","getProvinceData","provice",null,true);
		});


	var areaNo ;	//城市编号
	var areaName ={} ; 	//选择地区的完整名称
	/**
	 *  获取地区
	 * @param appendId  当前需要追加数据的div的id
	 * @param action	 获取数据的类型（省、市、县）
	 * @param appendClass  省、市、县 不同的class（用于绑定单击事件）
	 * @param param	编号
	 * @param flag	是否初次加载 boolean
	 */
	function selectArea(appendId,action,appendClass,param,flag){
		var appendHtml ="";
		console.log(flag);
		if(!flag) {	//保留初次加载数据
			//清空下一级数据
			$("#" + appendId).html(appendHtml);
			$("#authdistrict").html(appendHtml);
			//areaNo = "";
		}
		console.log("-----"+action+"-----");
		if(param !=null )
			console.log("地区入参 --> "+JSON.stringify(param) );
		var areaDate =  DB_Data.getActionCode(action,JSON.stringify(param));
		console.log("地区出参 --> "+JSON.stringify(areaDate));

		for(var i = 0 ; i < areaDate.length;i++){
			appendHtml+="<div style = 'padding: 2px 0px 2px 0px;text-align:center;width:100%;border-bottom:1px solid #e4d9d9 ; margin:0px;' class='proviceCity "+appendClass+"'>"+areaDate[i].name+"<span style='display:none;'>"+areaDate[i].code+"</span></div>";
		}
		$("#"+appendId).html(appendHtml);
		$("."+appendClass).click(
			function(){
				if(appendId!="authdistrict") {//县区不用追加查询下一级事件
					selectArea(appendId == "authcity" ? "authdistrict" : "authcity",
						action == "getCityData()" ? "getDistrictData" : "getCityData()",
						appendClass == "city" ? "district" : "city",
						{"code":$(this).children("span").text()},false);
				}
				var thisName = $(this).text().replace(  $(this).children("span").text(),"");
					
					
					
					
				//获取完整地区名称
				if(appendId=="authprovice"){ 
					areaName.proviceName = thisName;
					document.title =thisName;
					App.setTitle(thisName);
				}
				else if(appendId=="authcity"){ 
					areaName.cityName = thisName;
					document.title =areaName.proviceName+thisName;
					App.setTitle(areaName.proviceName+thisName);
				}
				else{ 
					areaName.districtName = thisName;
					document.title =areaName.proviceName+areaName.cityName+thisName;
					App.setTitle(areaName.proviceName+areaName.cityName+thisName);
				}
				if(appendId == "authdistrict"){ 
					areaCode_val = $(this).children("span").text();
				}
				console.log("areaNo====================================" + areaNo);
				$(this).css({"background":"#0A3350","color":"#FFF"});
				$(this).siblings().css({"background":"#ECECEC","color":"#000"});
				console.log("地区选择"+areaNo + "  || "+areaName.proviceName+"-"+areaName.cityName+"-"+areaName.districtName);
			});
		if(appendId == "authprovice"){
			Utils.toNextPage("authselectdizPage");
			$("#authcity").html("");
			$("#authdistrict").html("");
		}
}


	var confirmCityId ;
	//确认省市县区的确认事件
	$("#confirmCity").click(function(){
		console.log("areaNo1====================================" + areaNo);
		if(!areaCode_val){
			Toast.makeText("请选择完整的地区！",LENGTHLONG);
			return ;
		}
		areaNo = areaCode_val;
		console.log("areaNo2====================================" + areaNo);
		$("#"+confirmCityId).val(areaName.proviceName+"-"+areaName.cityName+"-"+areaName.districtName);
		Utils.back();

	});

$("#authshanghumShow").off('click');
//商户名称输入框
$("#authshanghumShow").on('click',function(){
	$("#merchantName").val("");
	$("#id_clearmerchantName").hide();
	Utils.toNextPage("merchantNamePage");
	//$("#merchantName").focus();
});

/*//商户名称输入框
$("#merchantName").on('input', function(){
	$(this).val($(this).val().replace(/\|+/,''));
});*/

//申请人姓名输入框
function showapplicantname_click(){
	$("#applicantName").val("");
	$("#id_clearapplicantName").hide();

	//有无营业执照  01(有) 02(无)
	if(SHOPTYPE_Z == '01'){ 
		Utils.toNextPage("applicantNamePage");
	}
}

//商户名称非空验证
$("#confirmMerchantName").click(function(){
	Utils.notEmptyVail("authshanghum",ERROR.authShangHuNameEmptyError,"merchantName");
	var scrollWidthVal=document.getElementById("authshanghum").scrollWidth;
	var clientWidthVal=document.getElementById("authshanghum").clientWidth;
	if(scrollWidthVal>clientWidthVal){
		$("#id_showauthshanghum").show();
	}else{
		$("#id_showauthshanghum").hide();
	}
});

//申请人非空验证
$("#confirmApplicantName").click(function(){
	Utils.notEmptyVail("authapplyname",ERROR.authapplyNameEmptyError,"applicantName");
	var scrollWidthVal=document.getElementById("authapplyname").scrollWidth;
	var clientWidthVal=document.getElementById("authapplyname").clientWidth;
	if(scrollWidthVal>clientWidthVal){
		$("#id_authapplyname").show();
	}else{
		$("#id_authapplyname").hide();
	}
});

/*
 * 判断商户类型
 * @param type 1是企业商户   0是个体商户
 */
function shopType(type){
	if(type == "0"){ 
	    //个体
	    console.log(" 个体------------------ ")
		$("#geRen").show();
		$("#qiYe").hide();
		$("#yuangong").hide();
		$("#autoNextTwoButton").show(); //个体申请认证按钮
		$("#qiyeRenZhengConfirm").hide(); //企业申请认证按钮
		$("#yuangongConfirm").hide(); //员工认证按钮
	}else if(type == "1"){ 
	   //企业
	    console.log(" 企业------------------ ")
	    $("#geRen").hide();
		$("#qiYe").show();
		$("#yuangong").hide();
		$("#autoNextTwoButton").hide(); //个体申请认证按钮
		$("#qiyeRenZhengConfirm").show(); //企业申请认证按钮
		$("#yuangongConfirm").hide(); //员工认证按钮
	}else if(type == "2"){ 
		//员工
		console.log(" 员工------------------ ")
		$("#geRen").hide();
		$("#qiYe").hide();
		$("#yuangong").show();
		$("#autoNextTwoButton").hide(); //个体申请认证按钮
		$("#qiyeRenZhengConfirm").hide(); //企业申请认证按钮
		$("#yuangongConfirm").show(); //员工认证按钮
	}
}


	//选择所属行业 page
	$("#showSelectProfession").click(function(){
		var professionName = $("#ahthHangYe").val();
		var professionList = $("#professionItems").children("[class=authBorder]");
		for(var i = 0 ; i < professionList.length ; i ++){
			$($(professionList[i]).children().children("img")).attr("src","images/btn_radio_off_pressed.png");
			if($(professionList[i]).text().trim() == professionName)
				$($(professionList[i]).children().children("img")).attr("src","images/btn_radio_on.png");
		}
		Utils.toNextPage("auth_profession");
	});

	//选择有无营业执照 page
	$("#showShoptype").click(function(){
		var ShoptypeName = $("#shoptype").val();
		var ShoptypeList = $("#haveLicenseItems").children("[class=authBorder]");
		for(var i = 0 ; i < ShoptypeList.length ; i ++){
			$($(ShoptypeList[i]).children().children("img")).attr("src","images/btn_radio_off_pressed.png");
			if($(ShoptypeList[i]).text().trim() == ShoptypeName)
				$($(ShoptypeList[i]).children().children("img")).attr("src","images/btn_radio_on.png");
		}
		Utils.toNextPage("haveLicense");
	});

	$("#set321").on('click',  is3to1.showAlertBox); //显示三证合一
	$("#alert_3to1_yes").on('click',  function(){ //三证合一 “是”按钮
		is3to1.is321();
		is3to1.hideAlertBox();
		if(!HAVE31ID){ 
			WHEATHERTHREEINONE = true;
		}
		//console.log("HAVE31ID===="+HAVE31ID+";  WHEATHERTHREEINONE============" + WHEATHERTHREEINONE);
	});
	$("#alert_3to1_no").on('click',  function(){  //三证合一 “否”按钮
		is3to1.not321();
		is3to1.hideAlertBox();
		if(!HAVE31ID){ 
			WHEATHERTHREEINONE = false;
		}
		//console.log("HAVE31ID===="+HAVE31ID+";  WHEATHERTHREEINONE============" + WHEATHERTHREEINONE);
	});

	/**
	 * 个人认证的方法
	 */
	function personalAuth(){
        console.log("个人认证开头＝＝＝＝＝");
	    if(SHOPTYPE_Z == '02') { 
			//无营业执照
			if(!Utils.conditionNotEmptyVail("image14LogId","请上传商铺照片")){ 
				return;
			}
		}else if(SHOPTYPE_Z == '01'){ 
			//有营业执照
			if(!Utils.conditionNotEmptyVail("image11LogId","请上传营业执照")){ 
				return;
			}
		}

		if(!Utils.conditionNotEmptyVail("image1LogId","请上传经营者手持身份证正面")){ 
			return;
		}else if(!Utils.conditionNotEmptyVail("image13LogId","请上传经营者身份证正面")){ 
			return;
		}else if(!Utils.conditionNotEmptyVail("image2LogId","请输入经营者身份证反面")){ 
			return;
		}else{

            console.log("个人认证开头222＝＝＝＝＝");
            if(ornotagreement == 1 && agreement == 0){
                console.log("ornotagreement=="+ornotagreement+"==agreement=="+agreement);
                Toast.makeText("请同意勾选协议", null);
                return;
            }
            console.log("个人认证开头＝＝＝＝＝333");
			//upLoadImage($("#image"));
			//return ;

			var prtnName =$("#authshanghum").val();//商户名称
			var appCertNo =$("#authIdNo").val(); //申请人身份证号
			var applyer = $("#authapplyname").val();
			//var appCertNoId=$("#authshanghum").val();//身份证正面photo id
			//var appCertNoRvId=$("#authshanghum").val();//反面photo id
			var areaCode=areaNo; //有效地区code
			var trade=$("#ahthHangYeId").val(); //行业id
			
			//营业执照编号
			if(SHOPTYPE_Z == '01') { 
				//有营业执照
				licence = $("#authyingyezhizhhm").val();
			}else if(SHOPTYPE_Z == '02'){ 
				//无营业执照
				licence = '000000000000000';
			}

			console.log("licence====================="+licence);

			var licenceId;
			//SHOPTYPE = '02'; //无营业执照
			//SHOPTYPE = '01'; //有营业执照
			if(SHOPTYPE_Z == '01'){ 
				licenceId = $("#image11LogId").text();	//营业执照 photo id
			}else if(SHOPTYPE_Z == '02'){ 
				licenceId = $("#image14LogId").text();	//营业执照 photo id
			}
			
			var address=$("#authdizhi").val();	//联系地址
			var email=$("#authemail").val();	//email

			if(email==""){
				email=$("#authemail").attr("hide_date");//电子邮箱
			}
			if(appCertNo==""){
				appCertNo=$("#authIdNo").attr("hide_date");//身份证号
			}
			if(address==""){
				address=$("#authdizhi").attr("hide_date");//联系地址
			}

			console.log("licenceId =================" + licenceId)

			var appCertNoId =$("#image13LogId").text();	//申请人身份证正面id
			var appCertNoRvId = $("#image2LogId").text();	//申请人身份证反面id
			var appCertNoHandId = $("#image1LogId").text(); //手持申请人（代理人）身份证图片ID
            console.log("个人认证开头＝＝＝＝＝4444");
			var params = {
				regType:"PRT1001",//PRT1001，个体商户，PRT1002企业商户
				prtnName:prtnName,
				applyer:applyer,
				appCertNo:appCertNo,
				appCertNoId:appCertNoId,
				appCertNoRvId:appCertNoRvId,
				areaCode:areaCode,
				trade:trade,
				licence:licence,
				licenceId:licenceId,
				address:address ,
				email:email,
				orgCode:"",
				orgCodeId:"",
				reveNbr:"",
				revenbrId:"",
				legal:"",
				legalCertNo:"",
				legalCertNoId:"",
				legalCertNoRvId:"",
				appCertNoHandId:appCertNoHandId,  //手持申请人（代理人）身份证图片ID
                openFlag : agreement,   //agreement 为2的时候，一键开通添益宝， 为其他为不开通
                authType : "", //默认：空 员工认证：01
                agentCode : ""//代理商商家编码
			};
			//alert(JSON.stringify(params));
			authRegister(params);
		}
	}

	/**
	 * 企业认证的方法
	 */
	function enterpriseAuth(){
		//是否三证合一 (是：true; 否：false)
		if(WHEATHERTHREEINONE){ 
			if(!Utils.conditionNotEmptyVail("image12LogId","请上传三证合一")){ 
				return;
			}
		}else{ 
			if(!Utils.conditionNotEmptyVail("imageLogId","请上传营业执照")){ 
				return;
			}else if(!Utils.conditionNotEmptyVail("image3LogId","请上传组织机构代码证")){ 
				return;
			}else if(!Utils.conditionNotEmptyVail("image4LogId","请上传税务登记证")){ 
				return;
			}
		}

		if(
			Utils.conditionNotEmptyVail("image5LogId","请上传法人身份证正面")&&
			Utils.conditionNotEmptyVail("image6LogId","请上传法人身份证反面")&&
			Utils.conditionNotEmptyVail("image10LogId","请上传代理人身份证正面")&&
			Utils.conditionNotEmptyVail("image8LogId","请上传代理人身份证反面")&&
			Utils.conditionNotEmptyVail("image7LogId","请上传代理人手持身份证正面")
			) {

			////upLoadImage($("#image"));
			//return ;


			var  prtnName =$("#authshanghum").val();//商户名称
			var appCertNo =$("#authIdNo").val(); //申请人身份证号
			var applyer = $("#authapplyname").val();
			//var appCertNoId=$("#authshanghum").val();//身份证正面photo id
			//var appCertNoRvId=$("#authshanghum").val();//反面photo id
			//测试
			var areaCode=areaNo; //有效地区code
			var trade=$("#ahthHangYeId").val();		//行业id
			var licence=$("#authyingyezhizhhm").val();	//营业执照编号
			var address=$("#authdizhi").val();	//联系地址
			var email=$("#authemail").val();	//email
			var licenceId=$("#imageLogId").text();	//营业执照 photo id
			var orgCodeId =$("#image3LogId").text();	//组织机构id
			var revenbrId = $("#image4LogId").text();	//税务id
			var legalCertNoId =$("#image5LogId").text();	//企业法人身份证图片ID
			var legalCertNoRvId = $("#image6LogId").text();	//企业法人身份证反面图片ID
			var appCertNoId =$("#image10LogId").text();	//代理人身份证正面id
			var appCertNoRvId = $("#image8LogId").text();	//代理人身份证反面图片ID
			var appCertNoHandId = $("#image7LogId").text();	//代理人手持身份证id

			var legalCertNo ="";
			if(email==""){
				email=$("#authemail").attr("hide_date");//电子邮箱
			}
			if(appCertNo==""){
				appCertNo=$("#authIdNo").attr("hide_date");//身份证号
			}
			if(address==""){
				address=$("#authdizhi").attr("hide_date");//联系地址
			}

			var params = {
				regType:"PRT1002",//PRT1001，个体商户，PRT1002企业商户
				prtnName:prtnName,
				applyer:applyer,
				appCertNo:appCertNo,
				appCertNoId:appCertNoId,
				appCertNoRvId:appCertNoRvId,
				areaCode:areaCode,
				trade:trade,
				licence:licence,
				licenceId:licenceId,
				address:address ,
				email:email,
				orgCode:"",
				orgCodeId:orgCodeId,
				reveNbr:"",
				revenbrId:revenbrId,
				legal:"",
				legalCertNo:legalCertNo,
				legalCertNoId:legalCertNoId,
				legalCertNoRvId:legalCertNoRvId,
				appCertNoHandId:appCertNoHandId , //手持申请人身份证图片ID
                openFlag : "",   //agreement 为2的时候，一键开通添益宝， 为其他为不开通
                authType : "", //默认：空 员工认证：01
                agentCode : ""//代理商商家编码
			};
			//alert(JSON.stringify(params));
			authRegister(params);
		}
	}

	/*
	 * 员工认证方法
	 */
	function yuangong_vail(){ 
		if(!Utils.conditionNotEmptyVail("image15LogId","请上传工作证明")){ 
			return;
		}else if(!Utils.conditionNotEmptyVail("image16LogId","请上传手持身份证正面")){ 
			return;
		}else if(!Utils.conditionNotEmptyVail("image17LogId","请上传身份证正面")){ 
			return;
		}else if(!Utils.conditionNotEmptyVail("image18LogId","请上传身份证反面")){ 
			return;
		}

		var applyer = $("#authapplyname").val(); //申请人姓名
		var email=$("#authemail").val();	//email
		var appCertNo =$("#authIdNo").val(); //身份证号

		if(email==""){
			email=$("#authemail").attr("hide_date");//电子邮箱
		}
		if(appCertNo==""){
			appCertNo=$("#authIdNo").attr("hide_date");//身份证号
		}

		var licenceId = $("#image15LogId").text(); //营业执照图片ID
		var appCertNoHandId = $("#image16LogId").text(); //手持申请人身份证图片ID
		var appCertNoId =$("#image17LogId").text();	//申请人身份证正面id
		var appCertNoRvId = $("#image18LogId").text(); //申请人身份证反面id

		var params = {
				regType:"PRT1001",//PRT1001，个体商户，PRT1002企业商户
				prtnName:"0",
				applyer:applyer,
				appCertNo:appCertNo,
				appCertNoId:appCertNoId,
				appCertNoRvId:appCertNoRvId,
				areaCode:"0",
				trade:"0",
				licence:"",
				licenceId:licenceId,
				address:"0",
				email:email,
				orgCode:"",
				orgCodeId:"",
				reveNbr:"",
				revenbrId:"",
				legal:"",
				legalCertNo:"",
				legalCertNoId:"",
				legalCertNoRvId:"",
				appCertNoHandId:appCertNoHandId,  //手持申请人（代理人）身份证图片ID
                openFlag : agreement,   //agreement 为2的时候，一键开通添益宝， 为其他为不开通
                authType : "01", //默认：空 员工认证：01
                agentCode : prtnCode //代理商商家编码
			};
			console.log("员工认证出参== " + JSON.stringify(params));
			authRegister(params);
	}


	/**
	 * 认证的方法
	 * @param params 已经填充部分的参数
	 */
	function authRegister(params) {
		params.custCode = custCode;
		params.staffCode = staffCode;
		params.channelCode = "20";

		params.bisChannel = bisChannel;
		params.clientVersion = deviceInfo.clientVersion;
		params.softwareType =  deviceInfo.systemType;



		params.merId = merId;
		params.tmnNum = "440106003094";
		params.keep = Utils.getKeep();
		params.shopType = SHOPTYPE_Z;
		//是否三证合一WHEATHERTHREEINONE true - 1  / false - 0
		params.threeInOne = WHEATHERTHREEINONE ?  1 : 0 ; 

		params.authChannel = "A01";// authChannel; //认证通道（A01:普通  A02:人脸识别）
		params.appCertNoEffSD = appCertNoEffSD; //认证申请人身份证有效起始日
		params.appCertNoEffED = appCertNoEffED; //认证申请人身份证有效结束日
//		params.authLegal = authLegal; //认证法人
//		params.authLegalCertNo = authLegalCertNo; //认证法人身份证号
		params.legalCertNoEffSD = legalCertNoEffSD; //认证法定代表人身份证有效起始日
		params.legalCertNoEffED = legalCertNoEffED; //认证法定代表人身份证有效结束日
		params.legalAddress = legalAddress; //认证法人居住地

		Utils.getDeviceInfo(params);
		var sign = Security.getSign(params);
		params.sign = sign;
		params.signVer= "2";
		console.log("info:Method:MAut101 入参 -->" +JSON.stringify(params));
		Utils.showDialog("信息提交中，请稍等..");
		var authRegister_callback = function (JSONResult) {
			console.log("info:Method:MAut101  出参： Result --> " + JSON.stringify(JSONResult));
			Utils.dismissDialog();
			if (JSONResult.code == TOKENLOST) {
				var back = function(){
					User.login(productNo);
				};
				Utils.alert(  "亲,为了您的账户安全，请您重新登录。",back);
				return;
			} else if (JSONResult.code != "000000") {
				if (JSONResult.code == "011053") {
					return;
				}else{ 
					Utils.alert( "亲,提交失败，"+JSONResult.content);
				}
				return;
			} else {
				Utils.alert(  "提交成功，工作人员将在1个工作日内完成认证，请静候",function(){
					App.exitApp();
				});
				return;
			}
		};
		Utils.sendPostRequest(URL + Method.MAut101, params, authRegister_callback);
	}

	
	/**
	 * 认证资料查询
	 * @param params 已经填充部分的参数
	 */
	function getAuthRegisterInfo(){
		Utils.showDialog("正在查询你的信息，请稍等..");
		var params = {
			"staffCode": staffCode,
			"channelCode": "20",
			"custCode": custCode,
			"merId": merId,
			"tmnNum": "440106014113",
			"bisChannel" : bisChannel,
			"keep":Utils.getKeep()
		};
		Utils.getDeviceInfo(params);
		var sign = Security.getSign(params);
		params.sign = sign;
		params.signVer= "2";
		console.log("SAut102   入参："+JSON.stringify(params));
		var RegisterInfo_callback=function(params){
            console.log("merchantType==="+merchantType);
			console.log("SAut102   出参："+JSON.stringify(params));
            Utils.dismissDialog();
			if(params.code=="000000"){
				var regTypeOut=params.regType;//注册类型 //PRT1001，个体商户，PRT1002企业商户
				var prtnName=params.prtnName;//商户名称
				var applyer=params.applyer;//申请人
				var appCertNo=params.appCertNo;//申请人身份证
				var appCertNoId=params.appCertNoId;	//申请人身份证图片ID
				var appCertNoRvId=params.appCertNoRvId; //申请人身份证反面图片ID
			    var appCertNoHandId=params.appCertNoHandId; //手持申请人身份证图片ID
				var trade=params.trade;	//行业
				var tradeName=params.tradeName;	//行业名称
				var licence=params.licence;//营业执照
				var licenceId=params.licenceId;//营业执照图片ID
				var address=params.address;//地址
				var email=params.email;//EMAIL
				var orgCode=params.orgCode;//组织机构
				var orgCodeId=params.orgCodeId;//组织机构图片ID
				var reveNbr=params.reveNbr;//税务登记证
				var revenbrId=params.revenbrId;//税务登记证图片ID
				var legal=params.legal;//企业法人
				var legalCertNo=params.legalCertNo;//企业法人身份证
				var legalCertNoId=params.legalCertNoId;//企业法人身份证图片ID
				var legalCertNoRvId=params.legalCertNoRvId;//企业法人身份证反面图片ID
				var noAuth=params.noAuth;//认证未通过字段
                authStatA01 = params.authStat;
				var authStat=params.authStat; //A00认证中，A01未认证，A02已认证，A99认证失败 A03待生效
				var agentCode = params.agentCode; //商户编码
				prtnName = params.prtnName; //商户名称

				authChannel = params.authChannel; //认证通道（A01:普通  A02:人脸识别）
				authApplyer = params.authApplyer; //认证申请人
				authAppCertNo = params.authAppCertNo; //认证申请人身份证号
				appCertNoEffSD = params.appCertNoEffSD; //认证申请人身份证有效起始日
				appCertNoEffED = params.appCertNoEffED; //认证申请人身份证有效结束日
				authLegal = params.authLegal; //认证法人
				authLegalCertNo = params.authLegalCertNo; //认证法人身份证号
				legalCertNoEffSD = params.legalCertNoEffSD; //认证法定代表人身份证有效起始日
				legalCertNoEffED = params.legalCertNoEffED; //认证法定代表人身份证有效结束日
				legalAddress = params.legalAddress; //认证法人居住地

				if (params.code == TOKENLOST ) {
					var back = function(){
						User.login(productNo);
					}
					Utils.alert(  "⊙_⊙,为了您的账户安全，请您重新登录。",back);
					return;
				}else if(params.code != "000000"){
					Utils.alert( "亲,获取您的基本信息失败，"+params.content);
					return ;
				}

                console.log("bankMode==="+bankMode);
                console.log("useInfoIOS.regType==="+useInfoIOS.regType);
                console.log("typeof regType==="+ typeof useInfoIOS.regType);
                console.log("productType==="+productType);
                console.log("hadEptinfo==="+hadEptinfo);
                console.log("typeof hadEptinfo==="+ typeof hadEptinfo);
                if(useInfoIOS.regType !== '1'){
                    if(productType == '2'){  //2为手机交费易
                        //资金管理模式（BT1001：普通卡，BT1002：子母卡，BT1013：资金池母卡，BT1014：资金池子卡）
                        //hadEptinfo 1 已开通添益宝
                        if((bankMode == "BT1001" || bankMode == 'BT1013') && hadEptinfo != '1'){
                        	$("#kaotong_agreement").show();
                        }else{
                            $("#kaotong_agreement").hide();
                        }
                    }else{
                        $("#kaotong_agreement").hide();
                    }
                }else{
                    $("#kaotong_agreement").hide();
                }

				if(params.authStat == "A00") { //A00认证中，A01未认证，A02已认证，A99认证失败 A03待生效

					var back = function(){
						Utils.back();
					}
					Utils.alert(  "您的认证信息还在审核中，请耐心等候... ...",back);
					return;
				}else if(params.authStat == "A01"){
                   

                }else if(params.authStat == "A02"||params.authStat == "A99"){
                    console.log("已经认证了");
                    console.log("merchantType==="+merchantType);

					
					//rzType="1";
                    console.log("params.authStat=="+params.authStat);
                    console.log("hadEptinfo==="+hadEptinfo);
                    if(params.authStat == 'A02' && hadEptinfo == '1'){
                        console.log("已经认证和开通添益宝了-------");
                        $("#showapplicantname").unbind();  //申请人姓名
                        $("#showapplicantname_bggray").addClass('gray_bg');//申请人的背景
                        $("#showapplicantname_bggray #authapplyname").addClass('gray_bg');//申请人的文本的背景
                        $("#authIdNo").attr('readonly',"true"); //身份证号
                        $("#show_creditcard").addClass('gray_bg');
                        $("#show_creditcard #authIdNo").addClass('gray_bg');
                        $("[name = merchantTypeChoose]").unbind();
                        console.log("已经认证和开通222222222添益宝了-------");
                    }

                }else if(params.authStat == "A03"){
                   
					var back = function(){
						Utils.back();
					}
					Utils.alert(  "您已经认证...",back);
					return;
				}
				$("#authshanghum").val(prtnName);	//商户号称

				console.log("merchantType= "+ merchantType);
				console.log("merchantType= "+  typeof merchantType);
				//跳转下一步
				if(merchantType === '0' || merchantType === '1') { 
					console.log("setpe111111111111111111111111111111111");
					console.log("merchantType= "+ merchantType);
					Utils.dismissDialog();
					console.log("Utils.pageIds111111111111===" + JSON.stringify(Utils.pageIds));
					Utils.toNextPage("authorityPage");
					if(params.authStat == 'A02' && hadEptinfo == '1'){ 
						//已开通添益宝 按返回时返回大厅
						Utils.pageIds.shift();
					}
				}else if(merchantType === '2'){ 
					console.log("merchantType ========================== " + merchantType)
					console.log("prtnName ======================== " + prtnName)
					if(!agentCode) { 
						//没有商户编码 显示填写商家代码页面
						Utils.toNextPage("company_code");
						Utils.dismissDialog();
						if(urlParameters.worker_recetification==='worker'){ 
							//人脸员工认证
							Utils.pageIds.shift();
						}
					}else{ 
						//有商家名称 到企业商家页面
						console.log("agentCode====================="+ agentCode)
						prtnCode = agentCode;
						checkCompanyCode();
						//Utils.toNextPage("company_chackout");
					}
				}

				if(prtnName!=""){
					$("#noneImg_hum").hide();
					$("#okImg_hum").show();
				}
				//$("#merchantName").val(prtnName);
				$("#authapplyname").val(applyer);	//申请人
				if(applyer!=""){
					$("#noneImg_name").hide();
					$("#okImg_name").show();
				}
				//$("#applicantName").val(applyer);
				$("#authIdNo").attr("hide_date",appCertNo);	//申请人身份证号码
				$("#authIdNo").val(appCertNo);
				
				areaNo = params.areaCode;
				var args={"code":areaNo};

				var areaDate =  DB_Data.getProCityDistric(areaNo);

				$("#authareas").val(areaDate.ProvinceName+"-"+areaDate.CityName+"-"+areaDate.CountyName);
				
				if(address!=""&&address!=null&&address!="null"){
					//$("#authdizhi").val(address);
					$("#authdizhi").attr("hide_date",address).val(address);//联系地址：
				}
				if(email!=""&&email!=null&&email!="null"){
					//$("#authemail").val(email);
					$("#authemail").attr("hide_date",email).val(email);//电子邮箱：
				}
				$("#ahthHangYe").val($("#"+trade).text());
				$("#ahthHangYeId").val(trade) ;

				

				//无营业执照
				if(licence == '000000000000000'){ 
					$("#licenceNomber").hide(); //隐藏营业执照号
					SHOPTYPE_Z = '02'; //有无营业执照  01(有) 02(无)
					$("#shoptype").val("无营业执照");
					$("#licencePIC").hide(); //上传营业执照
					$("#shopPIC").show(); //上传商铺照片
				}else{ 
					//有营业执照的时候填充营业执照号
					$("#authyingyezhizhhm").val(licence);
				}
				
				if(authStat=="A01"){
					Utils.dismissDialog();
					return;
				}

				console.log("licenceId==================" + licenceId);
				console.log("appCertNoId==================" + appCertNoId);
				
				
				if(licenceId!=""){
					$("#image11LogId").text(licenceId);	//营业执照 photo id
					showDate("11");
				}

				if(appCertNoId!=""){
					$("#image13LogId").text(appCertNoId);	//申请人身份证正面id
					showDate("13");
				}
				
				if(appCertNoHandId!=""){
					$("#image1LogId").text(appCertNoHandId);	//申请人手持身份证正面id
					showDate("1");
				}
				if(appCertNoRvId!=""){
					$("#image2LogId").text(appCertNoRvId);      //申请人身份证反面id
					showDate("2");
				}
				if(appCertNoHandId!=""){
					$("#image7LogId").text(appCertNoHandId);	//代理人手持身份证正面id appCertNoHandId
					showDate("7");
				}
				if(appCertNoRvId!=""){//appCertNoHandId 
					$("#image8LogId").text(appCertNoRvId);	    //代理人身份证反面id
					showDate("8");
				}
				if(appCertNoId!=""){//appCertNoHandId 
					$("#image10LogId").text(appCertNoId);	    //代理人身份证正面id
					showDate("10");
				}
				
				if(regTypeOut=="PRT1001"){ //个人
					//selectRegTypeOut("个体商户");
					
				}else 
				if(regTypeOut=="PRT1002"){//企业
					//selectRegTypeOut("企业商户");
					if(licenceId!=""){
						$("#imageLogId").text(licenceId);	//营业执照 photo id
						$("#okImg").show();
						$("#noneImg").hide();
					}

					if(orgCodeId!=""){
						$("#image3LogId").text(orgCodeId);	//组织机构id
						showDate("3");
					}
					if(revenbrId!=""){
						$("#image4LogId").text(revenbrId);	//税务id
						showDate("4");
					}
					if(legalCertNoId!=""){
						$("#image5LogId").text(legalCertNoId);	//法人手持身份证正面id
						showDate("5");
					}
					if(legalCertNoRvId!=""){
						$("#image6LogId").text(legalCertNoRvId);	//法人手持身份证反面id
						showDate("6");
					}

				}
				
				function showDate(indexNum){
					$("#okImg"+indexNum).show();
					$("#noneImg"+indexNum).hide();
				}
				
				function selectRegTypeOut(inputType){
					console.log("------------"+inputType);
					if(inputType != '企业商户') {
						$("#oneMerchantTypeDiv div:first").click();
					}else {
						$("#authorityNextStepBtn").click();
					}
				}
				
				function clickGo(thisId,num) {
					console.log("显示图片！！");
					var param = {
						"LOGID": $("#" + thisId + "LogId").text(),
						"TYPE": num
					}
					console.log("   入参："+JSON.stringify(param));
					Scanner.handlerVerifyPhoto(param, function (JSONResult) {
						var logId = JSON.stringify(JSONResult);
						logId = logId.substring(1, logId.length - 1);
						$("#" + thisId + "LogId").text(logId);
					}, function () {
						Toast.makeText("取消上传！",LENGTHLONG)
					});
				}
				
			}else{
				
			}

		};
		Utils.sendPostRequest(URL + Method.SAut102, params, RegisterInfo_callback);
	}

	function getRandom(){
		var params = {
			"bisChannel" : bisChannel,
			"channelCode" : "20",
			"clientVersion" : deviceInfo.clientVersion,
			"imei" : "",
			"imsi" : "",
			"keep" : Utils.getKeep(),
			"merId" : merId,
			"model" : "MRdc001",
			"signVer" : "2",
			"softwareType" : "8.1",
			"tmnNum" : "440106003094",
			"vender" : "Android"
		};
		var callback = function(result){
			alert(JSON.stringify(JSON.stringify(result)));
			Utils.dismissMDialog("ch_dialog");
		};
		Utils.sendPostRequest(URL+Method.MRdcMake,params,callback,null,"ch_alert","chalertmsg","chAlertBtn","ch_dialog");
	}
});
function selectProfession(id,name){
	$("#ahthHangYeId").val(id) ;
	$("#ahthHangYe").val(name) ;
	Utils.back();
};

function selectShoptype(id,name){
	console.log("id=----------------------"+id)
	if(id === '02'){ 
		//无营业执照
		$("#licenceNomber").hide();
		$("#licencePIC").hide(); //上传营业执照
		$("#shopPIC").show(); //上传商铺照片

		$("#merchantNameInfo_img").show();
		$("#merchantNameInfo").show();
		$("#merchantNameInfo2_img").hide();
		$("#merchantNameInfo2").hide();
		

		SHOPTYPE_Z = '02';
		console.log("SHOPTYPE_Z----------------------" + SHOPTYPE_Z)
	}else if(id === '01'){ 
		//有营业执照
		$("#licenceNomber").show();
		$("#licencePIC").show(); //上传营业执照
		$("#shopPIC").hide(); //上传商铺照片

		$("#merchantNameInfo_img").hide();
		$("#merchantNameInfo").hide();
		$("#merchantNameInfo2_img").show();
		$("#merchantNameInfo2").show();

		SHOPTYPE_Z = '01';
		console.log("SHOPTYPE_Z++++++++------------------" + SHOPTYPE_Z)
	}
	$("#shoptypeId").val(id) ;
	$("#shoptype").val(name) ;
	Utils.back();
};


/*
 * 验证错误时自动获得焦点
 */
function verifyFocus(id){ 
	$('#'+id).focus();
};

/*
 * 弹出框 是否三证合一
 */
var is3to1 = {
	alertBoxID : $('#alert_3to1'),
	Item_is321_ID : $('#ture_321'),
	Item_not321_ID : $('#false_321'),
	field: $("#set321_val"),
	showAlertBox : function(){ 
		$('#alert_3to1').show();
		show321 = true;
	},
	hideAlertBox : function(){ 
		this.alertBoxID.hide();
		show321 = false;
	},
	is321 : function(){ 
		this.Item_is321_ID.show();
		this.Item_not321_ID.hide();
		this.field.text("是");
	},
	not321 : function(){ 
		this.Item_is321_ID.hide();
		this.Item_not321_ID.show();
		this.field.text("否");
	}
};

