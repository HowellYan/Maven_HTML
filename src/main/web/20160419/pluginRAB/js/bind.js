define(['utils','jquery'],function(Utils,$) {
    var productNo = User.getProduct();
    var userInfo=User.getSuccessLoginInfo();

    if(androidOrIos == "ios"){
        userInfo = User.getSuccessLoginInfo();
    }else{
        userInfo = JSON.parse(User.getSuccessLoginInfo());
    }
    var staffCode = userInfo.staffCode;
    var custCode = userInfo.custCode;
    var merId = userInfo.prtnCode;

    var deviceInfo = Utils.getUtilParams();
    var clientVersion = deviceInfo.clientVersion; //版本号
    var systemType = deviceInfo.systemType; //系统系统类型
    console.log('111clientVersion  = ' + clientVersion);
    console.log('111systemType = ' + systemType);
    clientVersion = clientVersion.replace(/\./g,'') * 1;
    systemType = systemType.toLowerCase();
    console.log('111clientVersion  = ' + clientVersion);
    console.log('111systemType = ' + systemType);

    var getCodeBtnClick=false; //下发短信验证码的判斷
    if(userInfo["bindCard"]=="1"){
    	Toast.makeText("该账户已经绑卡",1000);
    	App.exitApp();
    	return;
    }

    var SUPPORTED = '1'; //支持绑卡标识 1：支持 0：不支持
    var supportBankList = new Array();

    $(function(){
        Utils.showDialog("请稍等..");
	    getBankList(); //获取支持的银行列表
	
        //单击事件初始化
        console.log("click init");
        clickInit();
        setTimeout(function(){
            Utils.dismissDialog();
        },2000);        
        ListenInput();
    });
    
    /**
     * 输入框监听事件
     */
    function ListenInput(){
		$(":input").each(function(){
			$(this).focus(function(){
				$(this.parentNode.parentNode.parentNode).addClass("selectInputDiv");
				$(this.parentNode.parentNode.parentNode).removeClass("noselectInputDiv");
			});
			$(this).blur(function(){
				$(this.parentNode.parentNode.parentNode).removeClass("selectInputDiv");
				$(this.parentNode.parentNode.parentNode).addClass("noselectInputDiv");
			});
		});
		
		$("#quickBankPrePhone").on("input",function(){
			var inputVal=$(this).val();
			$(this).val($(this).val().replace(/[^0-9]+/,''));
            /*if(/[^0-9]+/.test(inputVal)){
            	$('#quickBankPrePhone').val($('#quickBankPrePhone').val().substring(0,$('#quickBankPrePhone').val().length-1));
                return;
            }*/
			if(inputVal.length>0){
				$("#id_clearPhone").show();
				$("#id_clearPhone").click(function(){
					$(this).hide();
					$("#quickBankPrePhone").val("");
				});
			}else{
				$("#id_clearPhone").hide();
			}
		});
		$("#bangBankPrePhone").on("input",function(){
			var inputVal=$(this).val();
			$(this).val($(this).val().replace(/[^0-9]+/,''));
            /*if(/[^0-9]+/.test(inputVal)){
            	$('#bangBankPrePhone').val($('#bangBankPrePhone').val().substring(0,$('#bangBankPrePhone').val().length-1));
                return;
            }*/
            if(inputVal.length>0){
				$("#id_clearbangBankPrePhone").show();
				$("#id_clearbangBankPrePhone").click(function(){
					$(this).hide();
					$("#bangBankPrePhone").val("");
				});
			}else{
				$("#id_clearbangBankPrePhone").hide();
			}
		});
		$("#msgVerifyCode").on("input",function(){
			var inputVal=$(this).val();
            $(this).val($(this).val().replace(/[^0-9]+/,''));
			if(inputVal.length>0){
				$("#id_verifyCodePhone").show();
				$("#id_verifyCodePhone").click(function(){
					$(this).hide();
					$("#msgVerifyCode").val("");
				});
			}else{
				$("#id_verifyCodePhone").hide();
			}
		});
		$("#openBankBranchInfo").on("input",function(){
			var inputVal=$(this).val();
			if(inputVal.length>0){
				$("#id_clearopenBankBranchInfo").show();
				$("#id_clearopenBankBranchInfo").click(function(){
					$(this).hide();
					$("#openBankBranchInfo").val("");
				});
			}else{
				$("#id_clearopenBankBranchInfo").hide();
			}
		});
		$("#startBankCode").blur(function(){
			var thisVal=$(this).val();
			if(!isNaN(thisVal.replace(/\s/g,""))){
				$(this).val(thisVal.replace(/\s/g,'').replace(/(\d{4})(?=\d)/g,"$1 "));
			}

		});
        $("#startBankCode").focus(function(){
            var thisVal=$(this).val();
            $(this).val(thisVal.replace(/\s/g,""));
        });
	}
    
    function clickInit(){
        var bankCodeLength = 0 ;    //记录已经输入的银行卡的位数
        //银行卡号输入时格式化

        $("#selectBankDiv").width(($("#id_open_outDiv").width()+2) + 'px');

        document.getElementById('startBankCode').addEventListener("input", function(){
        	console.log("------------------"+$('#startBankCode').val());
            var inputChar = $('#startBankCode').val().substring($('#startBankCode').val().length - 1,$('#startBankCode').val().length);
            var bankCode =  $('#startBankCode').val();
            bankCode = bankCode.replace(/\s+/g,"");
            bankCodeLength = $('#startBankCode').val().length;
            //存在英文字母，空
            if(/^[a-zA-Z]+$/.test(bankCode)){
                $('#startBankCode').val("");
                bankCodeLength = 0
                return;
            }
            //汉字，空
            if(/[\u4E00-\u9FA5]/g.test(bankCode)) {
                $('#startBankCode').val("");
                bankCodeLength = 0
                return;
            }
            //非数字，清空最后一个字符
            if(/[^0-9]+/.test(inputChar) || bankCodeLength > 19 ){
                $('#startBankCode').val($('#startBankCode').val().substring(0,$('#startBankCode').val().length-1));
                bankCodeLength -=1;
                return;
            }
            if(bankCode.length>0){
                $(this).next("img").css("display","block");
                $(this).next("img").click(function(){

                    $('#startBankCode').val("");
                    $(this).css("display","none");
                });
            }else
                $(this).next("img").css("display","none");
            //var formatNum = (bankCode.length)/4;    //记录该格式化几个空格
            //if(formatNum > 1 ){
            //    var formatBankCode = "";
            //    for(var i = 1 ; i < formatNum; i++){
            //        if(i==1){ formatBankCode+=bankCode.substring((i-1)*4,i*4);}
            //        formatBankCode+=" "+bankCode.substring(i*4,(i+1)*4);
            //    }
            //    $('#startBankCode').val(formatBankCode);
            //}

            //将光标移动到最后
        },false);

        $("#showBankNoHelp").click(function(){
            Utils.alert("银行预留手机号是办理该银行卡时所填写的手机号码，没有预留、忘记预留手机号、手机已停用，请联系银行客服",function(){},"知道了");
        });
        $("#showBankNoHelp2").click(function(){
            Utils.alert("银行预留手机号是办理该银行卡时所填写的手机号码，没有预留、忘记预留手机号、手机已停用，请联系银行客服",function(){},"知道了");
        });


        /**
         * 银行卡号的图片显示
         */
        //$("#showBankNoPic").click(function(){
        //    //Utils.toNextPage("bankCardPicDiv");
        //    //$("#bindCardPage").css("display","block");
        //    console.log('TalkingData = ');
        //   // console.log('TalkingData.trackEventWithLabel = ' + TalkingData.trackEventWithLabel);
        //    //TalkingData.trackEventWithLabel();////调用摄像头的时候，统计点击率
        //});
        document.getElementById('showBankNoPicParent').onclick = function(){
            console.log('TalkingData = ');
            if((systemType === 'ios'&& clientVersion >= 403) ||(systemType === 'android' && clientVersion >= 406)){
                TalkingData.onEventWithLabel('添加银行卡',"OCR识别银行卡");////调用摄像头的时候，统计点击率
                Scanner.bankOCR(function(resultData){
                    console.log("bankOCR resultData:"+resultData);
                    $('#startBankCode').val(JSON.stringify(resultData).replace(/\"/g,''));
                    if( $('#startBankCode').val().toString().trim() != "") {
                        $("#bankCodeImg").show();
                    }
                    else {
                        $("#bankCodeImg").hide();
                    }
                    $('#bottomText').show();


                    var bankCode = $("#startBankCode").val().replace(/\s+/g,"");   //获取银行卡号
                    var bankName = $("#startBankName").val();   //获取选择的银行卡名称
                    var param={};
                    param.code =$("#selectBankNo").val().trim();
                    //卡Bin验证
                    binList = Utils.getSQLiteData("CardList", "queryRelevant",param);
                    console.log("BankNoBinList --> "+JSON.stringify(binList));

                    if(!check_bank(binList,bankCode, $("#selectBankNo").val())) return ;//


                });
            }

        };


        //UI3.0
        $("#selectBank_background").click(function(){
            Utils.back();
        });

        /**
         * 银行卡号的图片隐藏
         */
        $("#bankCardPicDiv").click(function(){
            Utils.back();
        });


        //所在有效地区选择框
        $("#authareasShow").click(
            function() {
                console.log("选择地区！！");
                confirmCityId = "openBankPosition";
                selectArea("authprovice", "getProvinceData", "provice", null, true);
            })

        //服务协议按钮的多选框
        $("[name=confirmFuWu]").click(function(){
            var num = $(this).children("span").html();
            console.log("-------------"+num);
            if(num == "0" ) {
                $(this).css("background", "url(images/check_ok.png)");
                $(this).css("background-size","contain");
                $(this).children("span").html("1");
                console.log("ok");
            }else {
                $(this).css("background", "url(images/check_no.png)");
                $(this).css("background-size","contain");
                $(this).children("span").html("0");
                console.log("on");
            }
        });
    };

    /**
     * 获取支持绑卡的银行列表
     */

    function getBankList(){
        var params = Utils.getUtilParams();
        params.channelCode = "20";
        params.staffCode = staffCode;
        params.custCode = custCode;
        params.bisChannel = bisChannel;
        params.merId = merId;
        params.keep = Utils.getKeep();

        var sign = Security.getSign(params);
        params['sign'] = sign;
        params.signVer =  "2";
        console.log('#########获取支持绑卡的银行列表入参=' + JSON.stringify(params));

        Utils.showDialog("加载中..");

        var getBankList_callBack = function(JSONResult){
            console.log('#########获取支持绑卡的银行列出参' + JSON.stringify(JSONResult));
            Utils.dismissDialog();

            if(JSONResult.code == "012109"){
                Utils.alert(  "亲，为了您的账户安全，请先进行认证或等候认证完成！");
                return ;
            }else if(JSONResult.code == TOKENLOST){
                var back = function(){
                    User.login(productNo);
                };
                Utils.alert( "亲，为了您的账户安全，请重新进行登录！",back);
                return ;
            }else if(JSONResult.code != "000000"){
                Utils.alert(JSONResult.content + " (" + JSONResult.code + ")");
                return ;
            }

            var bankCounts = JSONResult.bankCardList.length;
            for(var i = 0; i < bankCounts; i++){
                var stat = JSONResult.bankCardList[i].stat;  //是否支持绑卡 1:支持 0:不支持
                if(stat === SUPPORTED){ //SUPPORTED==1 支持绑卡标识 1：支持 0：不支持
                    supportBankList[i] = {
                        'bankCode': JSONResult.bankCardList[i].bankCode,
                        'bankName': JSONResult.bankCardList[i].bankName
                    };


                }
            }
            initBankList();
        };

        Utils.sendPostRequest(URL + Method.SCbk002, params, getBankList_callBack, null);
    }

    /**
     * 初始化支持绑卡的银行列表
     */
    function initBankList(){
        var bankListSelect = document.getElementById('selectBankDiv');
        console.log("supportBankList" + JSON.stringify(supportBankList));

        for(var j = 0; j < supportBankList.length; j++){
            var bankDiv = document.createElement('div');
            bankDiv.className = 'containterborderall btop-none';
            bankListSelect.appendChild(bankDiv);

            var subBankDiv = document.createElement('div');
            subBankDiv.className = 'ub line';
            subBankDiv.setAttribute("bankCode",supportBankList[j].bankCode);
            subBankDiv.setAttribute("bankName",supportBankList[j].bankName);
            subBankDiv.innerHTML = supportBankList[j].bankName;
            subBankDiv.onclick = function(){
                $('#startBankCode').val('');
                selectBankFun($(this).attr("bankCode"), $(this).attr("bankName"));
            };
            bankDiv.appendChild(subBankDiv);
        }
    }

    var areaNo ;	//城市编号
    var areaName ={} ; 	//选择地区的完整名称
    /**
     *  获取地区
     * @param appendId  当前需要追加数据的div的id
     * @param action	 获取数据的类型（省、市）
     * @param appendClass  省、市 不同的class（用于绑定单击事件）
     * @param param	编号
     * @param flag	是否初次加载 boolean
     */
    var proIndex = null;
    function selectArea(appendId,action,appendClass,param,flag){
        var appendHtml = "";
        console.log(flag);
        if(!flag) {	//保留初次加载数据
            //清空下一级数据
            $("#authdistrict").html(appendHtml);
            areaNo = "";
        }
        var areaDate =  DB_Data.getActionCode(action,JSON.stringify(param));
        console.log("地区出参 --> "+JSON.stringify(areaDate));

        for(var i = 0 ; i < areaDate.length;i++){
            appendHtml+="<div style = 'text-align:center;width:100%;border:1px solid #e4d9d9 ; margin:0px;' class='proviceCity "+appendClass+"'>"+areaDate[i].name+"<span style='display:none;'>"+areaDate[i].code+"</span></div>";
        }
        $("#"+appendId).html(appendHtml);
        if(flag && proIndex !== null){ 
        	$("#"+appendId).children().eq(proIndex).css({"background":"#F0801E","color":"#FFF"});
        }
        $("."+appendClass).click(
            function(){
                if(appendId!="authcity") //县区不用追加查询下一级事件
                    selectArea("authcity",  "getCityData()", "city",{"code": $(this).children("span").text()},false);

                var thisName = $(this).text().replace(  $(this).children("span").text(),"");

                //获取完整地区名称
                if(appendId=="authprovice"){
                	areaName.proviceName = thisName;
                	document.title =thisName;
                    App.setTitle(thisName);
                }else{
                	areaName.cityName = thisName;
                	document.title =areaName.proviceName+thisName;
                    App.setTitle(areaName.proviceName+thisName);
                }
                if(appendId == "authcity")
                    areaNo =  $(this).children("span").text();
                if(flag){ 
					proIndex = $(this).index();
                }
                $(this).css({"background":"#F0801E","color":"#FFF"});
                $(this).siblings().css({"background":"#ECECEC","color":"#000"});
                console.log("地区选择"+areaNo + "  || "+areaName.proviceName+"-"+areaName.cityName);
            });
        if(appendId == "authprovice"){
            Utils.toNextPage("authselectdizPage");
        	//areaName.proviceName="";
        	//areaName.cityName ="";
        	//$("#authcity").html("");
        }
    }


    var confirmCityId ;
    //确认省市县区的确认事件
    $("#confirmCity").click(function(){
        if(areaNo == null || areaNo == "" || areaNo == undefined){
            Toast.makeText("请选择完整的地区！",LENGTHLONG);
            return ;
        }
        $("#"+confirmCityId).val(areaName.proviceName+"-"+areaName.cityName );
        Utils.back();

    });

    //var paramxx={};
    //paramxx.code ='866500';
    //var binListvv = Utils.getSQLiteData("CardList", "queryRelevant",paramxx);
    //console.log("BankNoBinList --> "+JSON.stringify(binListvv));

    var binList =null;//用于存放银行卡Bin的集合
//page one 下一步 button click
    $("#bindCardPageNext").click(function () {
        //Dialog.nextLoadingShow("拼命加载中...");

        if(!Utils.notEmptyVail("startBankName",ERROR.bankNameEmptyError,null)) return;
        if(!Utils.bankNoVail("startBankCode")) return;
        var bankCode = $("#startBankCode").val().replace(/\s+/g,"");   //获取银行卡号
        var bankName = $("#startBankName").val();   //获取选择的银行卡名称
        var param={};
        param.code =$("#selectBankNo").val().trim();



        //卡Bin验证
        binList = Utils.getSQLiteData("CardList", "queryRelevant",param);
        console.log("BankNoBinList --> "+JSON.stringify(binList));
        if(!check_bank(binList,bankCode, $("#selectBankNo").val())) return ;//

        // if(productName == undefined || productIdCard == undefined || productName.length ==0||  productIdCard.length ==0) {
        var params = {
            "staffCode": staffCode,
            "channelCode": "20",
            "bisChannel" : bisChannel,
            "custCode": custCode,
            "merId": merId,
            "tmnNum" : "440106003094",
            "keep": Utils.getKeep()
        };
        Utils.getDeviceInfo(params);
        var sign = Security.getSign(params);
        params['sign'] = sign;
        params.signVer =  "2";
        console.log("infoInit() 入参：" + JSON.stringify((params)));

        Utils.showDialog("加载中..");
        var infoInit_callback = function (JSONResult) {
            console.log("info:Method:Sreg003  出参： Result --> " + JSON.stringify(JSONResult));

            if (JSONResult.code == TOKENLOST ) {
                var back = function(){
                    User.login(productNo);
                }
                Utils.alert(  "⊙_⊙,为了您的账户安全，请您重新登录。",back);
                Utils.dismissMDialog("ch_dialog");
                return;
            }else if (JSONResult.code != "000000") {
                Utils.alert(  "⊙_⊙网络不给力哦，请检查后再试哈");
                Utils.dismissMDialog("ch_dialog");
                return;
            }
            Utils.dismissDialog();
            console.log("------------------------prinType:+"+userInfo['prinType']);
            if(userInfo['prinType'] == "PT901"){
                // 代理商 Pt901
                showBindNextNameAndIdCard(JSONResult.staffName,JSONResult.certNbr,bankName,bankCode);
                return;
            }
            var back = function(){
                Utils.back();
            }

            var info = "";
		    if(androidOrIos == "ios"){
		    	info = User.getSuccessLoginInfo();
		    }else{
		    	info = JSON.parse(User.getSuccessLoginInfo());
		    }
            productType = info['productType'];
            console.log("authenStatus=================" + JSONResult.authenStatus);
            console.log("productType=================" + productType);
            
            //productType为3时 双产品线用户 不用认证也可以绑卡
            if(JSONResult.authenStatus == "A01" && productType != '3'){
                Utils.alert( "⊙_⊙无法绑卡,您还未认证！请先进行认证！",back);
                //return ;
            }else if(JSONResult.authenStatus == "A00"){
               // Utils.alert(  "⊙_⊙无法绑卡,还在认证中，请耐心等待",back);
                //return ;
            }else if(JSONResult.authenStatus == "A99" && productType != '3'){
                Utils.alert( "⊙_⊙无法绑卡,认证失败！请尝试再次认证或联系客服！",back);
                // return ;
            }
            showBindNextNameAndIdCard(JSONResult.staffName,JSONResult.certNbr,bankName,bankCode);
        }
        Utils.sendPostRequest(URL + Method.SAcc001, params, infoInit_callback, null)
        //  }


    });


    var bin_equle=[];//存储卡宾相等的记录
    var bin_xiangshi=[];//存储卡宾模糊匹配记录
    /**
     *
     * @param cardRecordsSQL cardBinList  银行列表
     * @param string_end     CodeNo   银行卡号
     * @returns {boolean}   user input Yes Or no 银行卡的CODE值
     */
    function check_bank(cardRecordsSQL,string_end,code){
        console.log("---------------------code:"+code);
        bin_equle.length=0;
        bin_xiangshi.length=0;
        var _bin_card="";//并以前10位卡宾的值
        if(string_end.length <= 10){
            _bin_card=string_end;
        }else{
            _bin_card=string_end.substr(0,10);//截取卡宾

        }
        var _bin_xs=cardRecordsSQL;//缩小检索范围
        var _bin_eq=[];//记录输入变长时有新的卡bin相等，则用新的判断
        for(var i=3;i<=_bin_card.length;i++){
            bin_xiangshi.length=0;
            _bin_eq.length=0;
            for(var j=0;j<_bin_xs.length;j++){
                //console.log(_bin_xs[j].BANK_CODE+" "+bankCode);
                if(_bin_card.indexOf(_bin_xs[j].CARD_BIN.toString().substr(0,i))==0 ){//存在
                    bin_xiangshi.push(_bin_xs[j]);
                    console.log('777(_bin_xs[j].CARD_BIN ==' + (_bin_xs[j].CARD_BIN));
                    console.log('777 _bin_card' + _bin_card.toString().substr(0,i));
                    if(_bin_xs[j].CARD_BIN == _bin_card.toString().substr(0,i) ){
                        _bin_eq.push(_bin_xs[j]);//放进数组中
                    }
                    console.log('777 BANK_NAME ==' + _bin_xs[j].BANK_NAME);
                    //if(code == ""){
                    //    $('#startBankName').val(_bin_xs[j].BANK_NAME);
                    //}

                    $('#startBankName').val(_bin_xs[j].BANK_NAME);
                    code =_bin_xs[j].BANK_CODE;

                }
            }
            _bin_xs = bin_xiangshi.concat();//数组赋值给另外一个数组

            console.log("sunte consolog"+_bin_eq.length);
            if(_bin_eq.length>0){
                bin_equle.length=0;
                bin_equle=_bin_eq.concat();
            }
        }

        //如果模糊匹配记录为0,提示不支持
        if(bin_xiangshi.length == 0  && bin_equle.length==0 ){
            $('#startBankName').val("");
            if(code == ""){
                Toast.makeText("",LENGTHLONG);
            }else{
                Toast.makeText("您输入的银行帐号与开户银行不匹配",LENGTHLONG);
            }
            BankIsRight = false;
            return false ;
            // Utils.alert("alertDialog","alertMessage","alertButton","");
        }
        else if(bin_equle.length==1){
            if(code == ""){
                $("#selectBankNo").val(bin_equle[0].BANK_CODE);
                console.log('999 = ' + $("#selectBankNo").val());
                code = bin_equle[0].BANK_CODE ;
            }
            if(code !== bin_equle[0].BANK_CODE){
                BankIsRight = false;
                Toast.makeText("您的卡号输入有误",LENGTHLONG);
                return false ;
            }
            if(string_end.length == bin_equle[0].card_bit){//卡号输入正确
                //goOrStop();
                $("#selectBankNo").val(bin_equle[0].BANK_CODE);
                console.log('999 = ' + $("#selectBankNo").val());
                code = bin_equle[0].BANK_CODE ;

                BankIsRight = true;
                return true ;
            }else{
                BankIsRight = false;
                Toast.makeText("您的卡号输入有误",LENGTHLONG);
                // Utils.alert("alertDialog","alertMessage","alertButton","您的卡号输入有误");
                return false ;
            }
        }else if(bin_equle.length>1){//若多条数据，使用卡bin和卡号长度一起作校验；
            var flag = false;
            for(var i=0;i<bin_equle.length;i++){
                var bin_card =bin_equle[i].CARD_BIN;
                var card_bit = bin_equle[i].card_bit;//卡长度
                if(string_end.substr(0,bin_card.length) == bin_card &&
                    string_end.length == card_bit){//卡号输入正确
                    if(code !== bin_equle[i].BANK_CODE){
                        BankIsRight = false;
                        Toast.makeText("您的卡号输入有误",LENGTHLONG);
                        return false ;
                    }
                    //goOrStop();
                    BankIsRight = true;
                    flag = true;
                    break;
                }
            }
            if(!flag){
                BankIsRight = false;
                Toast.makeText("您的卡号输入有误",LENGTHLONG);
                // Utils.alert("alertDialog","alertMessage","alertButton","您的卡号输入有误");
            }
            return flag;
        }
    }

    /**
     * show bindCard two view（显示绑卡第二步操作）
     * @param name    持卡人姓名
     * @param idCard  持卡人身份证号码
     * @param bankName  银行名称
     * @param bankCode  银行卡号
     */
    function showBindNextNameAndIdCard(name,idCard,bankName,bankCode) {
        ////‘*’化处理
        //name = name.length > 2 ? "**" + name.substring(2, name.length) : "*" + name.substring(1, name.length);
        //idCard = idCard.substring(0, 5) + "********" + idCard.substring(13, idCard.length);
        $_id("yzPayMoney").style.display = "none";
        if (checkBindBankType(bankName) == "0" || checkBindBankType(bankName) == 1) { //是否为快捷支付
            $_id("quickConfirmBindCardButton").innerHTML = "确定";
            if (checkBindBankType(bankName) == 1) {  //是否需要帮付通手续费
                //Utils.alert(  "亲，请先确认是否已开通银联在线无卡支付功能。", function(){});
                Dialog.showAlertTwoBtnDialog('提醒', '"亲，请先确认是否已开通银联在线无卡支付功能。', '确定', '取消', '', function(code){ 
                	console.log("code");
                	if(code == '1'){ 
 						gotonext();
                	}
                });
                $_id("yzPayMoney").style.display = "block";
            }else{ 
            	gotonext();
            }

            function gotonext(){ 
	           // $("#quickBankName").html(bankName);
                $("#quickBankName").html($("#startBankName").val());
	            $("#quickBankAccount").html(bankCode);
	            $("#quickCardholderName").html(name);	//申请人
	            $("#quickIdentityCardNum").html(idCard);	//申请人身份证号码
				
				$("#id_clearPhone").click();
				$("#id_verifyCodePhone").click();
	            
	            Utils.toNextPage("quickBindCardPage");
	            clearInterval(stopMsgVail);
	            msgShowTime=30;
	            $("#con_yan_zheng_ma").text("发送短信");
	            getCodeBtnClick=false;
            }

        } else {  //帮付通支付
            $("#bangBankName").val(bankName);
            $("#bangBankAccount").val(bankCode);
            $("#bangCardholderName").val(name);	//申请人
            $("#bangIdentityCardNum").val(idCard);	//申请人身份证号码
            
            $("#openBankPosition").val("");
            $("#openBankBranchInfo").val("");
            $("#bangBankPrePhone").val("");
            $("#id_clearbangBankPrePhone").hide();
            $("#id_clearopenBankBranchInfo").hide();
            
            Utils.toNextPage("bangFuTongBindCardPage");
            $_id("quickConfirmBindCardButton").innerHTML = "下一步";
        }
    }


    /**
     * 快捷绑卡（立即绑卡按钮） -->  上海绑卡
     */
    $("#quickConfirmBindCardButton").click(function(){
        if(!Utils.phoneNumVail("quickBankPrePhone",ERROR.openBankPhoneEmptyError)) return ;    //银行开户手机号
        if(!getCodeBtnClick){
        	Toast.makeText("请先下发短信验证码！",LENGTHLONG);
        	return;
        }
        if(!Utils.notEmptyVail("msgVerifyCode","请输入短信验证码！")) return ;    //银行开户手机号

        if( $("#quickConfirmFuWu").children("span").html() == "0" ) {Toast.makeText("请先阅读并同意服务协议！",LENGTHLONG);return }
        var msgVerifyCode  = $("#msgVerifyCode").val();
        var phoneNum = $_id("quickBankPrePhone").value; //获取手机号码（快捷绑卡）

        var bankCode =   $("#selectBankNo").val() ;
        var bankAcc =  $('#startBankCode').val();
        bankAcc = bankAcc.replace(/\s+/g,"");

        var params = {
            "staffCode": staffCode,
            "operType": "1",
            "veriCode": msgVerifyCode,
            "custCode": custCode,
            "bankAcc": bankAcc,
            "bankAddr": "",
            "bankCode": bankCode,
            // "openBank": "",
            "phoneNum": phoneNum,
            "channelCode": "20",
            "merId": merId,
            "tmnNum" : "440106003094",
            "bisChannel" : bisChannel,
            "keep": Utils.getKeep()
        };
        Utils.getDeviceInfo(params);
        var sign = Security.getSign(params);
        params['sign'] = sign;
        params.signVer =  "2";
   
        console.log("快捷绑卡 入参 --> "+JSON.stringify(params));

        Utils.showDialog("正在提交您的信息..");
        var queryBindCard_callback = function (JSONResult){
            console.log("快捷绑卡 出参 --> "+JSON.stringify(JSONResult));
            Utils.dismissDialog();
            if(JSONResult.code == "012109"){
                Utils.alert(  "亲，为了您的账户安全，请先进行认证或等候认证完成！");
                return ;
            }else  if(JSONResult.code == TOKENLOST){
                var back = function(){
                    User.login(productNo);
                }
                Utils.alert(  "亲，为了您的账户安全，请重新进行登录！",back);
                return ;
            }else if(JSONResult.code != "000000"){
                //Utils.alert(  "亲,"+JSONResult.content);
            	Utils.alert(JSONResult.content+" ("+JSONResult.code+")");
                return ;
            }
			//充值
            var cb = function(){
                //App.jumpToNewH5View(CZ_URl);
                App.exitAppFromBandCard("1");
            };
            //确定
            var outCB=function(){
            	//App.exitApp();
            	App.exitAppFromBandCard("2");
    			return;
            };
            console.log("------------bankAcc------- "+bankAcc.substring(bankAcc.length-4 , bankAcc.length));
           // $("#ch_title").html("签约绑卡成功");
            App.updateUserInfo("1"); //更新用户信息
          //  Dialog.showAlertDialog('签约绑卡成功', "恭喜您成功绑定尾号为"+bankAcc.substring(bankAcc.length-4 , bankAcc.length)+"的银行卡！", '立即充值', '', function(){
              //  App.exitAppFromBandCard("1");
           // });
            Utils.toNextPage('bandKaSuccess');//绑卡成功
        };
        Utils.sendPostRequest(URL+Method.MBinCrd002,params,queryBindCard_callback,null)
    });
    document.getElementById('bangKaRecharge').onclick = function(){
        App.exitAppFromBandCard("1");
    };


    /**
     * 帮付通 第二步 -->  page
     */
    $("#bangNextPayBtn").click(function(){
        if(!Utils.notEmptyVail("openBankBranchInfo",ERROR.openBankZhiHangInfoEmptyError)) return ;   //开户银行支行信息
        if(!Utils.phoneNumVail("bangBankPrePhone",ERROR.bankReservePhoneEmptyError)) return ;    //银行预留手机号
        if(areaNo == null || areaNo == "" || areaNo == undefined){
            Toast.makeText("请选择完整的地区！",LENGTHLONG);
            return ;
        }
        if( $("#bangConfirmFuWu").children("span").text() ==  "0"  ) {Toast.makeText("请先阅读并同意服务协议！",LENGTHLONG);return }
        var openBankBranchInfo = $("#openBankBranchInfo").val();
        var bangBankPrePhone = $("#bangBankPrePhone").val();
        var bangBankPrePhone = $("#bangBankPrePhone").val();
        //测试
        var areaCode=areaNo; //有效地区code
        var orderNo = Utils.getKeep().substring(10,16);
        var bankCode =   $("#selectBankNo").val() ;
        var bankAcc =  $('#startBankCode').val();
        bankAcc = bankAcc.replace(/\s+/g,"");

		var params = Utils.getUtilParams();
		params.verifyType="000";
        params.orderNo=Utils.getOrderSeq();
        params.staffCode=staffCode;
        params.custCode=custCode;
        params.areaCode=areaCode;
        params.phone=bangBankPrePhone;
        params.openBank=openBankBranchInfo;
        params.bankCode=bankCode;
        params.bankAcct=bankAcc;
        params.channelCode="20";
        params.bisChannel = bisChannel;
		params.keep=Utils.getKeep();
		
       /* var params = {
            verifyType:"000",
            orderNo:Utils.getOrderSeq(),
            "staffCode":staffCode,
            "custCode":custCode,
            "areaCode":areaCode,
            "phone":bangBankPrePhone,
            "openBank":openBankBranchInfo,
            "bankCode":bankCode,
            "bankAcct":bankAcc,
            "channelCode":"20",
            "merId":merId,
            "tmnNum":"440106003094",
            "keep":Utils.getKeep()
        };*/
        Utils.getDeviceInfo(params);
        var sign = Security.getSign(params);
        params['sign'] = sign;
        params.signVer =  "2";
        console.log("帮付通绑卡验证 入参 -->:"+JSON.stringify(params));

        Utils.showDialog("正在跳转，请稍等..");
        var bangPayVail_callback = function (JSONResult){
            console.log("帮付通绑卡验证 出参 -->:"+JSON.stringify(JSONResult));
            Utils.dismissDialog();
            if(JSONResult.code == "012109"){
                Utils.alert(  "亲，为了您的账户安全，请先进行认证或等候认证完成！");
                return ;
            }else  if(JSONResult.code == TOKENLOST){
                var back = function(){
                    User.login(productNo);
                }
                Utils.alert( "亲，为了您的账户安全，请重新进行登录！",back);
                return ;
            }else if(JSONResult.code != "000000"){
                //Utils.alert("ch_alert", "chalertmsg", "chAlertBtn", "亲,"+JSONResult.content);
            	Utils.alert(JSONResult.content+" ("+JSONResult.code+")");
                return ;
            }
            //App.overrideBackPressed(false);
            
            var forwardUrl=JSONResult.forwardUrl;
            var orderNo=JSONResult.orderNo;
            var bankAcct=bankAcc;
            var callback=function(){
            };
            App.startBangfutongActivity(forwardUrl,orderNo,bankAcct);
            //location.href = JSONResult.forwardUrl;
        };
        Utils.sendPostRequest(URL+Method.MBinCrd001,params,bangPayVail_callback,null)

        //if(!Utils.notEmptyVail("openBankPosition",ERROR.selectOpenBankCityEmptyError)) return ;  //选择省市
        //Utils.toNextPage("bangPaymentPage");
    });

    $("[name = paymentServiceAgreement]").click(function () {
        var userAgreement_container = $("#serviceProtocalPage").setTemplateURL("tpl/WithholdingAgreement_v1.0.html");
        userAgreement_container.processTemplate({});
        Utils.toNextPage("serviceProtocalPage");

    });

    //查看银行列表 -- (已废弃不用)
    $("#showSupportBankListButton").click(function(){
        Utils.toNextPage("supportBankListPage");
    });

    //选择开户银行 page
    $("#selectStartBankName").click(function(){
        /*
        var bankName = $("#startBankName").val();
        var bankList = $("#selectBankDiv").children("[class=containterborderall]");
        for(var i = 0 ; i < bankList.length ; i ++){
            $($(bankList[i]).children().children("img")).attr("src","images/btn_radio_off_pressed.png");
            if($(bankList[i]).text().trim() == bankName)
                $($(bankList[i]).children().children("img")).attr("src","images/btn_radio_on.png");
        }
        Utils.toNextPage("selectBankDiv");
        $("#startBankCode").val("");
        */

        Utils.toNextPage("selectBankDiv");
        App.setTitle('请选择开户银行');
    });

    var msgShowTime = 30;   //验证码的有效时长

    //获取短信验证码的click事件
    $("#con_yan_zheng_ma").click(function(){
        //MBinCrd002
        getBankPhoneVailNo();
    });

    var stopMsgVail;
    /**
     * 获取短信验证码
     */
    function getBankPhoneVailNo(){
        if(!Utils.phoneNumVail("quickBankPrePhone",ERROR.openBankPhoneEmptyError)) return ;    //银行开户手机号
        if(msgShowTime !=30 || $("#con_yan_zheng_ma").text() == '获取中...'){
            Toast.makeText("请稍等...",LENGTHLONG);
            return ;
        }
        $("#con_yan_zheng_ma").text("获取中...");
        clearInterval(stopMsgVail);

        var phoneNum = $_id("quickBankPrePhone").value; //获取手机号码（快捷绑卡）
        var bankCode =   $("#selectBankNo").val() ;
        var bankAcc =  $('#startBankCode').val();
        bankAcc = bankAcc.replace(/\s+/g,"");

        console.log("------------bankAcc------- "+bankAcc.substring(bankAcc.length-4 , bankAcc.length));

        console.log('999 = ' + bankCode);
        console.log('999 = ' + $("#selectBankNo").val());
        var params = {
            "staffCode" : staffCode,
            "operType" : "0",
            //"bankCode" : bankCode,
            "bankCode" : $("#selectBankNo").val(),
            "custCode" : custCode,
            "bankAcc" : bankAcc,
            "phoneNum" : phoneNum,
            "channelCode":"20",
            "merId":merId,
            "keep":Utils.getKeep(),
            "bisChannel" : bisChannel,
            "tmnNum": "440106003094"
        };
        Utils.getDeviceInfo(params);
        var sign = Security.getSign(params);
        params['sign'] = sign;
        params.signVer =  "2";
        console.log("#########绑卡获取短信验证码入参：" + JSON.stringify(params));

        Utils.showDialog("发送中...");
        var sendMsg_callback = function(JSONResult) {
            console.log("info:Method:Sreg003  出参： Result --> " + JSON.stringify(JSONResult));
            Utils.dismissDialog();
            if(JSONResult.code == TOKENLOST){
                var back = function(){
                    User.login(productNo);
                }
                Utils.alert( "亲，为了您的账户安全，请重新进行登录！",back);
                $("#con_yan_zheng_ma").text("发送短信");
                return ;
            }else if(JSONResult.code != "000000"){
                Utils.alert(  "亲,验证码获取失败,"+JSONResult.content);
                $("#con_yan_zheng_ma").text("发送短信");//再次获取
                return ;
            }
            getCodeBtnClick=true;
            Toast.makeText("验证码已成功下发!",LENGTHLONG);
           // $("#con_yan_zheng_ma").css("background","#807e7e");
            stopMsgVail = setInterval(function () {
                $("#con_yan_zheng_ma").text(msgShowTime + "秒");
                msgShowTime--;
                if (msgShowTime < 0) {
                    $("#con_yan_zheng_ma").text("发送短信");//再次获取
                    clearInterval(stopMsgVail);
                    msgShowTime = 30;
                  //  $("#con_yan_zheng_ma").css("background","#0097FE");
                }
            }, 1000);
        }
        var fall_callback=function(JSONResult){
            Utils.dismissDialog();
        	$("#con_yan_zheng_ma").text("发送短信");
        }
        Utils.sendPostRequest(URL+Method.MBinCrd002,params,sendMsg_callback,fall_callback,"")
    }

    /**
     * 检查绑卡类型
     * @param bankName
     * return num 0:支持快捷支付  1:快捷支付（帮付通） 2：帮付通付款
     */
    function checkBindBankType(bankName){

        if(bankName == BANK.bankInfo.yzbank.bankName) return 1 ;
        //bankName == BANK.bankInfo.nybank.bankName||
        else if( bankName == BANK.bankInfo.msbank.bankName
            || bankName == BANK.bankInfo.gfbank.bankName
        ) return 2 ;
        else return 0 ;
    }
    
    /**
     * 记录用户选择的银行卡
     * @param id
     * @param name
     */
    function selectBankFun(id,name){
        $("#selectBankNo").val(id);
        $("#startBankName").val(name);
        Utils.back();
    }

});


