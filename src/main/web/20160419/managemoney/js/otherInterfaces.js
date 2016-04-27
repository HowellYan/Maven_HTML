
define(['jquery','bestpay.ui','bestpay.lang','bestpay.http','jtemplates'],function($,UI, Lang, HTTP,jtemp) {
    function $_id(id){
        return document.getElementById(id);
    }
    function Date_FinancialRedemption(){
        var myDate = new Date();
        var Year = myDate.getFullYear(); //获取当前年
        var Month = myDate.getMonth()+1; //获取当前月份(0-11,0代表1月)
        var getDate = myDate.getDate()+1; //获取当前日(1-31)
        Month = Month < 10 ? '0' + Month : Month;
        getDate = getDate < 10 ? '0' + getDate : getDate;
        var getDay = myDate.getDay() + 1; //获取当前星期X(0-6,0代表星期天)
        var getDay_Array = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
        getDay = getDay_Array[getDay];
        var allDay = Year + '-' + Month + '-' + getDate + '(' + getDay + ')';
        return (allDay);
    }
    var otherSelf = new Other();
    function Other() {
        otherSelf = this;
        this.twoJsonArray = new Array();
        this.manageM = config.man.manageM;
        this.manageMOpenAnAccount = config.man.manageMOpenAnAccount;
        this.zhuangru_true = false;                  //转入的判断
        this.zhuangchu_true = false;                 //转出的判断
        this.logoList = {                            //银行卡的logo图片
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
            "865500" : "images/bank/shyh.png"//上海银行
        };
        this.orderPageJson = {};                     //订单页面的result
        this.random = null;                          //随机数
        this.zhuanru_passWord = null;                //转入支付密码
        this.zhuangchu_password = null;               //转出支付密码
        this.iAdd = '0';                            //万分收益的平均值
        this.iAddyield = '0';                        //平均收益率的平均值

    }
    //理财问题查询接口（SEpt015）
    Other.prototype.financialProblemQuery = function(){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.FINANCIAL_PROBLEM_QUERY,
            'params' : otherSelf.financialProblemQueryParams(),
            'showLoading' : true,
            'success' : otherSelf.financialProblemQuerySuccessCallback
        });
    };
    //理财问题查询接口（SEpt015）  构造请求参数
    Other.prototype.financialProblemQueryParams = function () {
        var self = this;
        var params = {
            "producttypeId":'01'   // 01活期理财    02定期理财
        };
        params = HTTP.setCPSCommonParams(params);
        console.log('理财问题查询接口（SEpt015）====入参===' + JSON.stringify(params));
        return params;
    };
    //理财问题查询接口（SEpt015）  成功回调函数
    Other.prototype.financialProblemQuerySuccessCallback = function (result) {
        config.page.id_shouzhifour_show.prompt_show_back = true;
        console.log(config.page.id_shouzhifour_show.prompt_show_back + 'config.page.id_shouzhifour_show.prompt_show_back = true;  ABC 015');
        console.log('理财问题查询接口（SEpt015)=====出参====' + JSON.stringify(result));
        if (result.code !== config.RES.SUCCESS) {
            Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
            return;
        }
        config.man.manageMOpenAnAccount.messageAnnouncement();//常用问题与公告信息的接口016;
        Bestpay.App.setTitle('服务中心');
        if(otherSelf.manageMOpenAnAccount.anountcementisBack*1 == 1){
            $('#brg_amount_question').show();
            otherSelf.manageM.selectType_question.setChecked('anount_question');
            otherSelf.manageM.questionandinformation = 2;
            $('#changjian_question').hide();
            $('#gongkao_information').show();
            $('#id_anountmentBoxLeft').show();
            $('#id_anountmentBoxRight').hide();
            console.log('gong111');
            back();
        }
        otherSelf.DATAS = result.datas;
        var objHtml = '';
        var problemtypeName = '';
        if(otherSelf.DATAS !== null && otherSelf.DATAS !== 'null' && otherSelf.DATAS !== '' && otherSelf.DATAS.length !== 0 &&otherSelf.DATAS !=='undefined' && typeof otherSelf.DATAS !== 'undefined'){
            if(otherSelf.manageM.questionandinformation == 1){
                console.log("otherSelf.manageM.questionandinformation==" + otherSelf.manageM.questionandinformation);
                $('#gongkao_information').hide();
                $('#changjian_question').show();
            }else{
                $('#gongkao_information').show();
                $('#changjian_question').hide();
            }
            for(var i=0;i<otherSelf.DATAS.length;i++){
                var objJson=otherSelf.DATAS[i];
                problemtypeName = objJson['problemtypeName'];
                otherSelf.twoJsonArray[i] = objJson['temfProblemList'];
                objHtml += '<div class ="confirm-item_g question_item" data-code = ' + i + '>' + problemtypeName + '</div>';
            };
            $('#id_optionsBoxLeft').html(objHtml);
            otherSelf.getProblemtypeId();
            otherSelf.manageM.config_togo = false;
        }else{
            $('#changjian_question').hide();
        }
        goTo(config.page.service_center);  //常见问题和公告消息页面
        config.isBack = function(){
            console.log('AAA');
            back();
            $('#first_anouncement').hide();
        }
    };
    Other.prototype.getProblemtypeId = function() {
        var self=this;
        $('.question_item').each(function(){
            $(this).on('click',function(){
                $('#id_optionsBoxLeft').hide();
                $('#id_optionsBoxRight').show();
                $('#brg_amount_question').hide();
                otherSelf.manageM.config_togo = true;
                var ListrightHTML= " " ,item = $(this).data('code'),objJson = otherSelf.twoJsonArray[item];
                for(var j = 0 ; j < objJson.length ; j ++ ){
                    var temfProblemList = objJson[j];
                    ListrightHTML += '<div class="con">' + '<div class="confirm_item_title confirm-item_g">' + temfProblemList.title + '</div>' + '<div class="item_menu">' +temfProblemList.contents+ '</div>' + '</div>'
                }
                $('#id_optionsBoxRight').html(ListrightHTML);
                otherSelf.getcodeHTML();
            })
        });
    };
    Other.prototype.getcodeHTML = function() {
        var self = this;
        $('.item_menu:first').show();
        $('.confirm_item_title:first').removeClass('confirm-item_g_s').addClass('confirm-item_g_s');
        $('.confirm_item_title').each(function(){
            $(this).on('click',function(){
                var index = $('.confirm_item_title').index($(this));
//                $('.item_menu').hide().eq(index).show();
                $(this).siblings(".item_menu").toggle();
                $(this).parent().siblings().children('.item_menu').hide();
                $(this).toggleClass('confirm-item_g_s');
                $(this).parent().siblings().children('.confirm_item_title').removeClass('confirm-item_g_s');
//                $('.confirm_second .confirm-item_g').removeClass('confirm-item_g_s').eq(index).addClass('confirm-item_g_s');
            })
        });

        config.isBack = function() {
            $('#id_optionsBoxLeft').show();
            $('#id_optionsBoxRight').hide();
            $('#brg_amount_question').show();
        };
    };
    // 账户银行信息查询接口 SCbk001
    Other.prototype.accountBankInfo = function(){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.ACCOUNT_BANK_INFO,
            'params' : self.accountBankInfoParams(),
            'showLoading' : false,
            'success' : self.accountBankInfoSuccessCallback
        });
    };
    /* 账户银行信息查询接口 SCbk001 请求参数*/
    Other.prototype.accountBankInfoParams = function () {
        var self = this;
        var params = {
        };
        params = HTTP.setCPSCommonParams(params);
        console.log("账户银行信息查询接口 SCbk001入参======="+JSON.stringify(params));
        return params;
    };
    //账户银行信息查询接口 SCbk001 成功回调函数
    Other.prototype.accountBankInfoSuccessCallback = function (result) {
        if (result.code !== config.RES.SUCCESS) {
            Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
            return;
        }
        console.log("账户银行信息查询接口 SCbk001出参=======" + JSON.stringify(result));
        console.log("123123:"+config.logoList[result.bankCode]);
        otherSelf.orderPageJson['bankName'] = result['bankName'];//开户银行名称
        otherSelf.orderPageJson['img_src'] = config.logoList[result.bankCode];//银行logo
        otherSelf.orderPageJson['bankAcctNbr'] = result['bankAcctNbr'].substr(result['bankAcctNbr'].length-4,4);//银行后四位卡号
        otherSelf.orderPageJson['bankAcctName'] = "*"+result['bankAcctName'].substring(1,result['bankAcctName'].length);//姓名
        //交费易余额
        HTTP.getAccountBalanceInquiry(otherSelf.getAccountBalanceInquirySuccessCallback,false);
    };
    Other.prototype.WorkDayAndWorkWeekShow = function(){
        var confirmWorkDay =  config.man.manageMOpenAnAccount.orderPageJson['confirmWorkDay'];
        var confirmWorkWeek = config.man.manageMOpenAnAccount.orderPageJson['confirmWorkWeek'];
        var year = confirmWorkDay.substring(0,4);
        var month = confirmWorkDay.substring(4,6);
        var day = confirmWorkDay.substring(confirmWorkDay.length-2);
        var week = confirmWorkWeek.substring(confirmWorkWeek.length-1);
        $('#WorkDayAndWorkWeek').html(year + '-' + month + '-' + day + '(星期' + week + ')');
    }
    //交费易余额查询
    Other.prototype.getAccountBalanceInquirySuccessCallback=function(result){
        if (result.code !== config.RES.SUCCESS) {
            Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
            return;
        }
        var list = result['accountItems'];
        for(var i=0;i<list.length;i++){
            var acct = list[i]['acctType'];
            if(acct != null || acct != "null" || acct != "undefined" || acct !=""){
                if("0007" == acct){//0001：基本账户;0007：IPOS账户;0110：酬金账户
                    var activeBalance = list[i].activeBalance;//账户可用余额
                    otherSelf.orderPageJson['activeBalance'] =  Lang.getThausand(Lang.fen2yuan(activeBalance),1);
                    otherSelf.orderPageJson['activeBalanceNoDou'] =  Lang.fen2yuan(activeBalance);
                    $('#autoActiveBalance').html(Lang.getThausand(Lang.fen2yuan(activeBalance),1)); //自动转入的交费易余额
                    break;
                }
            }
        }
        otherSelf.manageM.zhuanru_money_text.clearValue(); //转入输入金额框清空
        otherSelf.manageM.zhuanchu_money_text.clearValue(); //转出输入金额框清空
        otherSelf.textT(".bank_span","");
        otherSelf.orderPageJson['balance'] =  otherSelf.manageMOpenAnAccount.orderPageJson['balance'];
        if(otherSelf.manageM.applyatoneGet == '1'){  //1是转入   0是转出
            var templateru = new UI.Template();
            templateru.template_OneToOne("id_zhuangru_wrap" ,otherSelf.orderPageJson);
            if(otherSelf.manageM.zhuanruApplybuy*1 == 1){  //银行卡转入
                $("#help_cont_ZU1").show();
                $("#help_cont_ZU2").hide();
                otherSelf.manageM.bindCardZhuanru(); //判断是否绑卡转入
            }
            else{                                                ////交费易转入
                $("#help_cont_ZU1").hide();
                $("#help_cont_ZU2").show();
                $("#jy_btn_show").show(); //确认按钮
                $("#input-wrap_zru_wrap").show(); //金额文本框
                otherSelf.WorkDayAndWorkWeekShow();//预计收益到账时间
            }
            goTo(config.page.changeover_Pay_easy); //跳到转入页面
            $('.cont_btn_gray_a').removeClass('cont_btn_blue_a');
//            var inputzhuanru = function(val){
//                if(val.length >= 6){
//                    console.log('1111');
//                    $('.cont_btn_gray_a').addClass('cont_btn_blue_a');
//                }else{
//                    console.log('2222');
//                    $('.cont_btn_gray_a').removeClass('cont_btn_blue_a');
//                }
//            };
//            var clearzhuanru = function(){
//                $('.cont_btn_gray_a').removeClass('cont_btn_blue_a');
//            };
//            otherSelf.zhuanru_passWord = new UI.InputText('zhuanru_passWord','password',inputzhuanru,clearzhuanru);//转入支付密码
//            otherSelf.zhuanru_passWord.clearValue(); //转入支付密码框
            otherSelf.purchaseAndVerification();//申购预校验接口  3.5企业理财申购预校验(MEpt002)
            config.isBack = function(){
                console.log('otherSelf.manageM.kaohu_zhuangru_immediately=='+otherSelf.manageM.kaohu_zhuangru_immediately);
                if(otherSelf.manageM.kaohu_zhuangru_immediately == 1){
                    location.reload()
                }else{
                    back();
                }
            }
        }else{
            var template = new UI.Template();
            template.template_OneToOne("id_zhuangchu_wrap" ,otherSelf.orderPageJson);
            if(otherSelf.manageM.zhuangchuatonefor*1 == 1){
                $("#help_cont_CHU1").show();
                $("#help_cont_CHU2").hide();
                otherSelf.manageM.bindCardZhuanchu();
            }else{
                $("#help_cont_CHU1").hide();
                $("#help_cont_CHU2").show();
                $("#input-wrap_zchu_wrap").show(); //金额输入框
                $("#jf_btn_show").show(); //转入按钮
            }
            goTo(config.page.roll_out_Pay_easy); //跳到转出页面
            $('.cont_btn_gray_a').removeClass('cont_btn_blue_a');
            var inputzhuanchu = function(val){
                if(val.length >= 6 ){
                    console.log('3333');
                    $('.cont_btn_gray_a').addClass('cont_btn_blue_a');
                }else{
                    console.log('4444');
                    $('.cont_btn_gray_a').removeClass('cont_btn_blue_a');
                }
            };
            var clearzhuanchu = function(){
                $('.cont_btn_gray_a').removeClass('cont_btn_blue_a');
            };
            //otherSelf.zhuangchu_password = new UI.InputText('zhuangchu_password','password',inputzhuanchu,clearzhuanchu);//转出支付密码
            //otherSelf.zhuangchu_password.clearValue(); //转出支付密码框
            otherSelf.redemptionOfPreCheck();    //赎回预校验接口  3.5企业理财赎回预校验(MEpt003)
        }
    };
    //交费易余额查询 自动转入先调交费易余额查询
    Other.prototype.getAutomaticSuccessCallback=function(result){
        console.log("余额查询 自动转入先调交费易余额查询 出参======="+JSON.stringify(result));
        if (result.code !== config.RES.SUCCESS) {
            Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
            return;
        }
        var list = result['accountItems'];
        for(var i=0;i<list.length;i++){
            var acct = list[i]['acctType'];
            if(acct != null || acct != "null" || acct != "undefined" || acct !=""){
                if("0007" == acct){//0001：基本账户;0007：IPOS账户;0110：酬金账户
                    var activeBalance = list[i].activeBalance;//账户可用余额
                    $('#autoActiveBalance').html(Lang.getThausand(Lang.fen2yuan(activeBalance),1)); //自动转入的交费易余额
                    break;
                }
            }
        }
        config.man.manageMOpenAnAccount.autoCheckSettingInterface(); //1.3自动转入添益宝-查询配置(SArc003) 判断是否开通自动转入
    };
    Other.prototype.sortNumber = function(a,b){
        return a-b;
    };
    Other.prototype.comparefour = function(){
        var self = this;
        self.more_value_zu = "";
        var arr = [otherSelf.rMaxvalue, otherSelf.singleMaxvalue, otherSelf.yMaxvalue, otherSelf.activeBalance];
        var arrbank = [otherSelf.rMaxvalue, otherSelf.singleMaxvalue, otherSelf.yMaxvalue];
        arr.sort(self.sortNumber);
        arrbank.sort(self.sortNumber);
        if(otherSelf.manageM.zhuanruApplybuy*1 === 2){
            self.more_value_zu = arr[0];
            $("#zhuanru_money_text").attr("placeholder", "最多" + Lang.getThausand(Lang.fen2yuan(self.more_value_zu),1) + "元");
            //$('#rumaxAmount').text('');
            $('#rumaxAmount').text('本次最多可转入' + Lang.getThausand(Lang.fen2yuan(self.more_value_zu),1) + '元');
        }else{
            self.more_value_zu = arrbank[0];
            self.more_value_zuThansoud = '1000';
//            $("#zhuanru_money_text").attr("placeholder", "至少转入" + Lang.getThausand(Lang.fen2yuan(self.more_value_zuThansoud),1) + "元以上");
            $("#zhuanru_money_text").attr("placeholder", "至少转入" + self.more_value_zuThansoud + "元");

            //$('#rumaxAmount').text('');
            $('#rumaxAmount').text('该卡本次最多可转入' + Lang.getThausand(Lang.fen2yuan(self.more_value_zu),1) + '元');
        }

    };
    //转出的切换数据判断
    Other.prototype.compareZhuangCHU = function(){
        var self = this;
        var more_value="";
        var arr=[otherSelf.rMaxvalueChu,otherSelf.singleMaxvalueChu,otherSelf.yMaxvalueChu,otherSelf.balanceChu];
        arr.sort(otherSelf.sortNumber);
        more_value = arr[0];
        if(otherSelf.manageM.zhuangchuatonefor*1 == 1){
            $('#chumaxAmount').text('');
            //$('#chumaxAmount').text('该卡最多可转出' + Lang.getThausand(Lang.fen2yuan(more_value),1) + '元');
        }else{
            $('#chumaxAmount').text('');
            //$('#chumaxAmount').text('本次最多可转出' + Lang.getThausand(Lang.fen2yuan(more_value),1) + '元');
        };
        $("#zhuanchu_money_text").attr("placeholder", "最多" + Lang.getThausand(Lang.fen2yuan(more_value),1) + "元");
    };

    Other.prototype.textT = function(id,text){
        $(id).html(text);
    };
    // 3.5企业理财申购预校验(MEpt002)
    Other.prototype.purchaseAndVerification = function(){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.PURCHASE_AND_VERIFICATION,
            'params' : self.purchaseAndVerificationParams(),
            'showLoading' : false,
            'success' : self.purchaseAndVerificationSuccessCallback
        });
    };
    /* 3.5企业理财申购预校验(MEpt002) 请求参数*/
    Other.prototype.purchaseAndVerificationParams = function () {
        var self = this;
        var params = {
            "productId":self.manageMOpenAnAccount.productId
        };
        params = HTTP.setCPSCommonParams(params);
        console.log("3.5企业理财申购预校验(MEpt002)入参======="+JSON.stringify(params));
        return params;
    };
    // 3.5企业理财申购预校验(MEpt002) 成功回调函数
    Other.prototype.purchaseAndVerificationSuccessCallback = function (result) {
        var self=this;
        dismissDialog();
        if (result.code !== config.RES.SUCCESS) {
            Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
            return;
        }
        console.log("3.5企业理财申购预校验(MEpt002)出参======="+JSON.stringify(result));
        otherSelf.zhuanru_money_text_val = otherSelf.manageM.zhuanru_money_text.getToEmptyValue();//转入金额
        var rMaxvalue = result.rMaxvalue;	   //单日最高金额
        var rMax = result.rMax;       //单日最大笔数
        var singleLimitvalue=result.singleLimitvalue;	//单笔最低金额
        var singleMaxvalue =result.singleMaxvalue;  //单笔最高金额
        var yMaxvalue=result.yMaxvalue;   //月最高金额
        var yMax=result.yMax;    	//月最大笔数
        otherSelf.rMaxvalue = result.rMaxvalue;
        otherSelf.singleMaxvalue = result.singleMaxvalue;
        otherSelf.yMaxvalue = result.yMaxvalue;
        otherSelf.activeBalance = Lang.yuan2fen(otherSelf.orderPageJson['activeBalanceNoDou']);
        if (singleMaxvalue == null || singleMaxvalue == "" || singleMaxvalue == 'undefined' || (typeof singleLimitvalue === 'undefined')||rMaxvalue == null || rMaxvalue == "" || rMaxvalue == 'undefined' || (typeof rMaxvalue === 'undefined')||yMaxvalue == null || yMaxvalue == "" || yMaxvalue == 'undefined' || (typeof yMaxvalue === 'undefined')) {
            $('#rumaxAmount').text('');
            $("#zhuanru_money_text").attr("placeholder", "");
            otherSelf.comparefour();
        } else {
          //  alert('34567')
            otherSelf.comparefour();
        };
        function bank_text() {
            otherSelf.zhuangru_true = false;
            otherSelf.zhuanru_money_text_val = otherSelf.manageM.zhuanru_money_text.getToEmptyValue();//转入金额
            otherSelf.zhuanru_money_text_val = Lang.yuan2fen(otherSelf.zhuanru_money_text_val);
            if(otherSelf.zhuanru_money_text_val != null||self.zhuanru_money_text_val.length != 0){
                $('#jy_btn_show').addClass("cont_btn_blue");
            }else{
                $('#jy_btn_show').addClass("cont_btn_gray").removeClass("cont_btn_blue");
            }
            if(otherSelf.zhuanru_money_text_val*1 == 0){
                otherSelf.textT(".bank_span","输入金额不能为0");
                return;
            }
            if(rMax != null && rMax != "" && rMax!= undefined ){
                if(rMax > 0){//单日最大笔数
                    otherSelf.textT(".bank_span","");
                }else{
                    otherSelf.textT(".bank_span","转入次数已超过单日最大笔数");
                    return;
                }
            }
            if(yMax!=null&&yMax!=""&&yMax!=undefined){
                if(yMax > 0){//月最大笔数
                    otherSelf.textT(".bank_span","");
                }else{
                    otherSelf.textT(".bank_span","当月最大笔数转入次数超限");
                    return;
                }
            }
            if(singleMaxvalue!=null&&singleMaxvalue!=""&&singleMaxvalue!=undefined){
                if(otherSelf.zhuanru_money_text_val*1 > singleMaxvalue){//单笔最高金额
                    otherSelf.textT(".bank_span","单笔最高金额超过有效数");
                    return;
                }else{
                    otherSelf.textT(".bank_span","");
                }
            }
            if(rMaxvalue != null && rMaxvalue !="" && rMaxvalue != undefined){
                if(otherSelf.zhuanru_money_text_val*1 > rMaxvalue){
                    otherSelf.textT(".bank_span","转入金额超过单日最高金额，请重新输入");
                    return;
                }else{
                    otherSelf.textT(".bank_span","");
                }
            }
            if(yMaxvalue != null && yMaxvalue !="" && yMaxvalue != undefined){
                if(otherSelf.zhuanru_money_text_val*1 > yMaxvalue){//大于单月最高金额
                    otherSelf.textT(".bank_span","转入金额超过月最高金额");
                    return;
                }else{
                    otherSelf.textT(".bank_span","");
                }
            }
            if(otherSelf.manageM.zhuanruApplybuy*1 == 1)
            {
                if(otherSelf.zhuanru_money_text_val*1 < 100000){
                    otherSelf.textT(".bank_span","单笔最低金额必须大于1000元");
                    return;
                }else{
                    otherSelf.textT(".bank_span","");
                }
            }else{
                if(singleLimitvalue!=null&&singleLimitvalue!=""&&singleLimitvalue!=undefined){
                    if(otherSelf.zhuanru_money_text_val*1 < singleLimitvalue){
                        otherSelf.textT(".bank_span","单笔最低金额必须大于"+(singleLimitvalue/100).toFixed(0)+"元");
                        return;
                    }else{
                        otherSelf.textT(".bank_span","");
                    }
                }
                if(otherSelf.zhuanru_money_text_val*1 > otherSelf.activeBalance*1){
                    otherSelf.textT(".bank_span","转入金额超出账户余额");
                    return;
                }else{
                    otherSelf.textT(".bank_span","");
                }
            }
            otherSelf.zhuangru_true = true;
        }
        $_id("zhuanru_money_text").addEventListener("input",bank_text);
    };
    //跳到转入的支付密码页面 applyforBuy
    Other.prototype.getapplyforBuySecretInterface=function(val){
        var self=this;
//        if(this.zhuanru_money_text_val == null || this.zhuanru_money_text_val.length == 0){
//            Bestpay.Toast.makeText('金额不能为空', Bestpay.Toast.LENGTH_SHORT);
//            return;
//        };
//        this.zhuanru_passWord_val = this.zhuanru_passWord.getValue();
//        if (this.zhuanru_passWord_val == null || this.zhuanru_passWord_val.length == 0) {
//            Bestpay.Toast.makeText('请输入密码', Bestpay.Toast.LENGTH_SHORT);
//            return;
//        }else if(this.zhuanru_passWord_val.length<6){
//            Bestpay.Toast.makeText('请输入6~12位支付密码', Bestpay.Toast.LENGTH_SHORT);
//            return;
//        }
//        showDialog();
        otherSelf.orderPageJson['txnAmount']= Lang.getThausand(Lang.fen2yuan(this.zhuanru_money_text_val),1);
//        var confirmWorkDay =  config.man.manageMOpenAnAccount.orderPageJson['confirmWorkDay'];
//        var confirmWorkWeek = config.man.manageMOpenAnAccount.orderPageJson['confirmWorkWeek'];
//        var year = confirmWorkDay.substring(0,4);
//        var month = confirmWorkDay.substring(4,6);
//        var day = confirmWorkDay.substring(confirmWorkDay.length-2);
//        var week = confirmWorkWeek.substring(confirmWorkWeek.length-1);
//        $('#WorkDayAndWorkWeek').html(year + '-' + month + '-' + day + '(周' + week + ')');
//        // otherSelf.orderPageJson['WorkDayAndWorkWeek'] = year + '-' + month + '-' + day + '(周' + week + ')';
        var template = new UI.Template();
        template.template_OneToOne("id_applyBuysceret" ,otherSelf.orderPageJson);
        HTTP.getRandomServices(function(result){ //随机加密接口
            var retJson = result;
            //未找到酬金结算方式，不进行酬金计算, 也当做成功了，酬金为零
            if (result.code === config.RES.SUCCESS) {
                otherSelf.random = result.randNum;
            }
            otherSelf.financialPurchase(val);
            config.isBack = function(){
                back();
                return;
            }
        },false);



        // goTo(config.page.change_can_pay); //跳到转入支付密码的页面
//        $('.cont_btn_gray_a').removeClass('cont_btn_blue_a');
//        var inputzhuanru = function(val){
//            if(val.length >= 6){
//                console.log('1111');
//                $('.cont_btn_gray_a').addClass('cont_btn_blue_a');
//            }else{
//                console.log('2222');
//                $('.cont_btn_gray_a').removeClass('cont_btn_blue_a');
//            }
//        };
//        var clearzhuanru = function(){
//            $('.cont_btn_gray_a').removeClass('cont_btn_blue_a');
//        }
//        otherSelf.zhuanru_passWord = new UI.InputText('zhuanru_passWord','password',inputzhuanru,clearzhuanru);//转入支付密码
//        otherSelf.zhuanru_passWord.clearValue(); //转入支付密码框

    };
    //跳到转入的支付成功页面 applyforBuy
    Other.prototype.getapplyforBuySuccess=function(){
        var self=this;
//        this.zhuanru_passWord_val = this.zhuanru_passWord.getValue();
//        if (this.zhuanru_passWord_val == null || this.zhuanru_passWord_val.length == 0) {
////            Bestpay.Toast.makeText('请输入密码', Bestpay.Toast.LENGTH_SHORT);
//            return;
//        }else if(this.zhuanru_passWord_val.length<6){
////            Bestpay.Toast.makeText('请输入6~12位支付密码', Bestpay.Toast.LENGTH_SHORT);
//            return;
//        }
//        showDialog();
//        HTTP.getRandomServices(function(result){ //随机加密接口
//            var retJson = result;
//            //未找到酬金结算方式，不进行酬金计算, 也当做成功了，酬金为零
//            if (result.code === config.RES.SUCCESS) {
//                otherSelf.random = result.randNum;
//            }
//            self.financialPurchase();
//            config.isBack = function(){
//                back();
//                return;
//            }
//        },false);
    };
    //3.6企业理财申购 (TEpt004)
    Other.prototype.financialPurchase = function(val){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.FINANCIAL_PURCHASE,
            'params' : self.financialPurchaseParams(val),
            'showLoading' : true,
            'success' : self.financialPurchaseSuccessCallback
        });
    };
    // 3.6企业理财申购 (TEpt004)  构造请求参数
    Other.prototype.financialPurchaseParams = function (val) {
        var self = this;
        var valStr = "";
        if(val != null && val != ""){
            valStr = val;
        }
        var params = {
            'payPassword': Bestpay.Security.encryptPassword(self.manageM.userInfo.staffCode,valStr,self.random),//开户密码
            "txnAmount":this.zhuanru_money_text_val,//以分为单位
            "txnType":self.manageM.zhuanruApplybuy, //1:银行卡  2:交费易  默认使用交费易账户
            "productId":self.manageMOpenAnAccount.productId,
            "userId":self.manageMOpenAnAccount.userId
        };
        params = HTTP.setCPSCommonParams(params);
        console.log("3.6企业理财申购 (TEpt004)入参===="+JSON.stringify(params));
        return params;
    };
    // 3.6企业理财申购 (TEpt004)  成功回调函数
    Other.prototype.financialPurchaseSuccessCallback = function (result) {
        dismissDialog();
        PasswordKeyBoard.hideKeyboardUI3();
        if (result.code !== config.RES.SUCCESS) {
            if(result.code == config.RES.PASSWORD_ERROR_LOCKED_002136){ //输入密码错误次数超过三次，退出app
                Bestpay.Dialog.showAlertDialog('提醒', config.RES.PASSWORD_ERROR_LOCKED_002136_MSG, '确定', result.code,function(){
                    App.exitCompleteApp();
                });

            }else if(result.code == config.RES.PASSWORD_ERROR_LOCKED_020004){ //输入密码被锁，退出app
                Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code,function(){
                    App.exitCompleteApp();
                });

            }else{
                Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
            }
            return;
        }
        if(otherSelf.manageM.zhuanruApplybuy*1 == 2){
            App.queryBalance();//原生同步首页交费易余额
        };
        console.log("3.6企业理财申购 (TEpt004)出参===="+JSON.stringify(result));
        otherSelf.orderPageJson['transSeq'] = result.transSeq;
        otherSelf.orderPageJson['txnAmountZRU'] = otherSelf.orderPageJson['txnAmount'];
        otherSelf.orderPageJson['interestDate'] = result.interestDate + "(" + result.interestWeek + ")"; //日期 + 星期
        var template = new UI.Template();
        template.template_OneToOne("id_zhuangru_success" ,otherSelf.orderPageJson);
        goTo(config.page.zhuangrusuccess);
        config.isBack = function(){
            location.reload();
        }

    };
    // 3.5企业理财赎回预校验(MEpt003)
    Other.prototype.redemptionOfPreCheck = function(){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.REDEMPTION_OF_PRE_CHECK,
            'params' : self.redemptionOfPreCheckParams(),
            'showLoading' : false,
            'success' : self.redemptionOfPreCheckSuccessCallback
        });
    };
    /* 3.5企业理财赎回预校验(MEpt003) 请求参数*/
    Other.prototype.redemptionOfPreCheckParams = function () {
        var self = this;
        var params = {
            "productId":self.manageMOpenAnAccount.productId
        };
        params = HTTP.setCPSCommonParams(params);
        console.log("3.5企业理财申购预校验(MEpt003)入参======="+JSON.stringify(params));
        return params;
    };
    // 3.5企业理财赎回预校验(MEpt003) 成功回调函数
    Other.prototype.redemptionOfPreCheckSuccessCallback = function (result) {
        var self=this;
        dismissDialog();
        if (result.code !== config.RES.SUCCESS) {
            Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
            return;
        }
        console.log("3.5企业理财申购预校验(MEpt003)出参======="+JSON.stringify(result));
        otherSelf.zhuanchu_money_text_val = otherSelf.manageM.zhuanchu_money_text.getToEmptyValue();//转入金额
        var rMaxvalue=result.rMaxvalue;	   //单日最高金额
        var rMax=result.rMax;       //单日最大笔数
        var singleLimitvalue=result.singleLimitvalue;	//单笔最低金额
        var singleMaxvalue =result.singleMaxvalue;  //单笔最高金额
        var yMaxvalue=result.yMaxvalue;   //月最高金额
        var yMax=result.yMax;    	//月最大笔数
        //rMaxvalue,singleMaxvalue,yMaxvalue,balance
        otherSelf.rMaxChu=result.rMax;       //单日最大笔数
        otherSelf.rMaxvalueChu=result.rMaxvalue;	   //单日最高金额
        otherSelf.singleMaxvalueChu =result.singleMaxvalue;  //单笔最高金额
        otherSelf.yMaxvalueChu=result.yMaxvalue;   //月最高金额
        otherSelf.balanceChu = Lang.yuan2fen(otherSelf.manageMOpenAnAccount.orderPageJson['balanceNoneDou']);
        var balance = Lang.yuan2fen(otherSelf.manageMOpenAnAccount.orderPageJson['balanceNoneDou']);
        if (singleMaxvalue == null || singleMaxvalue == "" || singleMaxvalue == 'undefined' || (typeof singleLimitvalue === 'undefined')||rMaxvalue == null || rMaxvalue == "" || rMaxvalue == 'undefined' || (typeof rMaxvalue === 'undefined')||yMaxvalue == null || yMaxvalue == "" || yMaxvalue == 'undefined' || (typeof yMaxvalue === 'undefined')) {
            $('#chumaxAmount').text('');
            $("#zhuanchu_money_text").attr("placeholder", "");
            otherSelf.compareZhuangCHU();
        } else {
            otherSelf.compareZhuangCHU();
//            var more_value="";
//            var arr=[rMaxvalue,singleMaxvalue,yMaxvalue,balance];
//            arr.sort(otherSelf.sortNumber);
//            more_value = arr[0];
//            if(otherSelf.manageM.zhuangchuatonefor*1 == 1){
//                $('#chumaxAmount').text('该卡最多可转出' + Lang.getThausand(Lang.fen2yuan(more_value),1) + '元');
//            }else{
//                $('#chumaxAmount').text('本次最多可转出' + Lang.getThausand(Lang.fen2yuan(more_value),1) + '元');
//            };
//            $("#zhuanchu_money_text").attr("placeholder", "本次最多可转出" + Lang.getThausand(Lang.fen2yuan(more_value),1) + "元");
        };
        otherSelf.textT(".rmaxbank_span","今天还可以转出" + '<span class="orange">'+ otherSelf.rMaxChu + '</span>' + '次');
        function bank_text() {
//            otherSelf.textT(".rmaxbank_span","");
            otherSelf.zhuangchu_true = false;
            otherSelf.zhuanchu_money_text_val = otherSelf.manageM.zhuanchu_money_text.getToEmptyValue();//转入金额
            otherSelf.zhuanchu_money_text_val = Lang.yuan2fen(otherSelf.zhuanchu_money_text_val);
            if(otherSelf.zhuanchu_money_text_val != null||self.zhuanchu_money_text_val.length != 0){
                $('#jf_btn_show').addClass("cont_btn_blue");
            }else{
                $('#jf_btn_show').addClass("cont_btn_gray").removeClass("cont_btn_blue");
            }

            if(otherSelf.zhuanchu_money_text_val*1 == 0){
                otherSelf.textT(".bank_span","输入金额不能为0");
                return;
            }
            if(rMax!=null&&rMax!=""&&rMax!=undefined)
            {
                if(rMax > 0){//单日最大笔数
                    otherSelf.textT(".bank_span","");
                }else{
                    otherSelf.textT(".bank_span","转出次数已超过单日最大笔数");
                    return;
                }
            }
            if(yMax!=null&&yMax!=""&&yMax!=undefined)
            {
                if(yMax > 0){//月最大笔数
                    otherSelf.textT(".bank_span","");
                }else{
                    otherSelf.textT(".bank_span","当月最大笔数转出次数超限");
                    return;
                }
            }
            if(singleMaxvalue!=null&&singleMaxvalue!=""&&singleMaxvalue!=undefined)
            {
                if(otherSelf.zhuanchu_money_text_val*1 > singleMaxvalue){//单笔最高金额
                    otherSelf.textT(".bank_span","单笔最高金额超过有效数");
                    return;
                }else{
                    otherSelf.textT(".bank_span","");
                }
            }
            if(singleLimitvalue!=null&&singleLimitvalue!=""&&singleLimitvalue!=undefined)
            {
                if(otherSelf.zhuanchu_money_text_val*1 < singleLimitvalue){
                    otherSelf.textT(".bank_span","单笔最低金额必须大于"+(singleLimitvalue/100).toFixed(0)+"元");
                    return;
                }else{
                    otherSelf.textT(".bank_span","");
                }
            }
            if(rMaxvalue!=null&&rMaxvalue!=""&&rMaxvalue!=undefined)
            {
                if(otherSelf.zhuanchu_money_text_val*1 > rMaxvalue){
                    otherSelf.textT(".bank_span","转出金额超过单日最高金额，请重新输入");
                    return;
                }else{
                    otherSelf.textT(".bank_span","");
                }
            }
            if(yMaxvalue!=null&&yMaxvalue!=""&&yMaxvalue!=undefined)
            {
                if(otherSelf.zhuanchu_money_text_val*1 > yMaxvalue){//大于单月最高金额
                    otherSelf.textT(".bank_span","转出金额超过月最高金额");
                    return;
                }else{
                    otherSelf.textT(".bank_span","");
                }
            }
            if(otherSelf.zhuanchu_money_text_val*1 > balance*1){
                otherSelf.textT(".bank_span","转出金额超出添益宝账户余额");
                return;
            }else{
                otherSelf.textT(".bank_span","");
            }
            otherSelf.zhuangchu_true = true;
        }
        $_id("zhuanchu_money_text").addEventListener("input",bank_text);
    };
    //判断金额是否为空 atoneFor
    Other.prototype.getatoneForSecretInterface=function(val){
        var self=this;
//        if(this.zhuanchu_money_text_val == null || this.zhuanchu_money_text_val.length == 0){
//            Bestpay.Toast.makeText('金额不能为空', Bestpay.Toast.LENGTH_SHORT);
//            return;
//        };
//        this.zhuangchu_password_val=this.zhuangchu_password.getValue();
//        if (this.zhuangchu_password_val == null || this.zhuangchu_password_val.length == 0) {
//           Bestpay.Toast.makeText('请输入密码', Bestpay.Toast.LENGTH_SHORT);
//            return;
//        }else if(this.zhuangchu_password_val.length<6){
//           Bestpay.Toast.makeText('请输入6~12位支付密码', Bestpay.Toast.LENGTH_SHORT);
//            return;
//        }
        otherSelf.orderPageJson['txnAmountchu'] = Lang.getThausand(Lang.fen2yuan(self.zhuanchu_money_text_val),1);
        //self.getatoneForSuccess();   //转出的支付密码页面 atoneFor
        if(otherSelf.manageM.zhuangchuatonefor*1 == 1){     //1为银行卡  2为交费易
            otherSelf.orderPageJson['bankAcctNbrBR']=otherSelf.orderPageJson['bankName']+'('+otherSelf.orderPageJson['bankAcctNbr']+')';//银行卡名称+卡号
//            $("#shuhui_tips").html('预计资金到账时间 ' + '<span class="red">' + Date_FinancialRedemption() + '</span>');
            $("#bank_cont_success").show();
            $("#jfy_cont_success").hide();
        }else{
            otherSelf.orderPageJson['bankAcctNbrBR'] = "账户";
            //$("#shuhui_tips").html("即时到账");
            $("#bank_cont_success").hide();
            $("#jfy_cont_success").show();
        }
        var template = new UI.Template();
        template.template_OneToOne("id_atoneforsecret" ,otherSelf.orderPageJson);
        // goTo(config.page.roll_out_info);
        HTTP.getRandomServices(function(result){ //随机加密接口
            var retJson = result;
            //未找到酬金结算方式，不进行酬金计算, 也当做成功了，酬金为零
            if (result.code === config.RES.SUCCESS) {
                otherSelf.random = result.randNum;
            }
            self.financialRedemption(val);  //3.7企业理财赎回(TEpt005)
            config.isBack = function(){
                back();
                return;
            }
        },false);
    };
    //跳到转出的支付成功页面 atoneFor
    Other.prototype.getatoneForSuccess=function(){
       // var self=this;
//        this.zhuangchu_password_val=this.zhuangchu_password.getValue();
//        if (this.zhuangchu_password_val == null || this.zhuangchu_password_val.length == 0) {
////            Bestpay.Toast.makeText('请输入密码', Bestpay.Toast.LENGTH_SHORT);
//            return;
//        }else if(this.zhuangchu_password_val.length<6){
////            Bestpay.Toast.makeText('请输入6~12位支付密码', Bestpay.Toast.LENGTH_SHORT);
//            return;
//        }
//        showDialog();
//        HTTP.getRandomServices(function(result){ //随机加密接口
//            var retJson = result;
//            //未找到酬金结算方式，不进行酬金计算, 也当做成功了，酬金为零
//            if (result.code === config.RES.SUCCESS) {
//                otherSelf.random = result.randNum;
//            }
//            self.financialRedemption();  //3.7企业理财赎回(TEpt005)
//            config.isBack = function(){
//                back();
//                return;
//            }
//        },false);
    };
    //3.7企业理财赎回(TEpt005)
    Other.prototype.financialRedemption = function(val){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.FINANCIAL_REDEMPTION,
            'params' : self.financialRedemptionParams(val),
            'showLoading' : true,
            'success' : self.financialRedemptionSuccessCallback
        });
    };
    // 3.7企业理财赎回(TEpt005)  构造请求参数
    Other.prototype.financialRedemptionParams = function (val) {
        var self = this;
        var valStr = "";
        if(val != null && val != ""){
            valStr = val;
        }
        var params = {
            'payPassword': Bestpay.Security.encryptPassword(self.manageM.userInfo.staffCode,valStr,self.random),//开户密码
            "txnAmount":this.zhuanchu_money_text_val,//以分为单位
            "txnType":self.manageM.zhuangchuatonefor, //1:银行卡  2:交费易  默认使用交费易账户
            "productId":self.manageMOpenAnAccount.productId,
            "userId":self.manageMOpenAnAccount.userId
        };
        params = HTTP.setCPSCommonParams(params);
        return params;
    };
    // 3.7企业理财赎回(TEpt005)  成功回调函数
    Other.prototype.financialRedemptionSuccessCallback = function (result) {
        PasswordKeyBoard.hideKeyboardUI3();
        dismissDialog();
        if (result.code !== config.RES.SUCCESS) {
            if(result.code == config.RES.PASSWORD_ERROR_LOCKED_002136){ //输入密码错误次数超过三次，退出app
                Bestpay.Dialog.showAlertDialog('提醒', config.RES.PASSWORD_ERROR_LOCKED_002136_MSG, '确定', result.code,function(){
                    App.exitCompleteApp();
                });

            }else if(result.code == config.RES.PASSWORD_ERROR_LOCKED_020004){ //输入密码被锁，退出app
                Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code,function(){
                    App.exitCompleteApp();
                });

            }else{
                Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
            }
            return;
        }
        otherSelf.orderPageJson['txnAmountZCHU']=otherSelf.orderPageJson['txnAmountchu'];
        if(otherSelf.manageM.zhuangchuatonefor*1 == 1) {     //1为银行卡  2为交费易
            otherSelf.orderPageJson['bankAcctNbr'] = otherSelf.orderPageJson['bankAcctNbr'];//银行卡卡号
        }else{
            App.queryBalance();//原生同步首页交费易余额
        }
        var template = new UI.Template();
        template.template_OneToOne("id_atonefor_success_bank" ,otherSelf.orderPageJson);
        goTo(config.page.roll_out_success);
        config.isBack = function(){
            location.reload();
        }
    };
    //累计收益界面
    Other.prototype.financialIncomeinterface = function(){
        var self=this;
        goTo(config.page.accumulated_in); //收益界面双排
        if(self.manageM.shouyitwo == 2 || self.manageM.shouyitwo == 3){
            self.millionCopiesOfRevenue();  //3.15企业理财万份收益和七日年转化率(SEpt014)
        }else{
            self.financialIncomeQuery();  //3.11企业理财收益查询接口(SEpt007)
        }
    };
    //3.11企业理财收益查询接口(SEpt007)
    Other.prototype.financialIncomeQuery = function(){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.FINANCIAL_INCOME_QUERY,
            'params' : self.financialIncomeQueryParams(),
            'showLoading' : true,
            'success' : self.financialIncomeQuerySuccessCallback
        });
    };
    //3.11企业理财收益查询接口(SEpt007)  构造请求参数
    Other.prototype.financialIncomeQueryParams = function () {
        var self = this;
        var params = {
            "selectType":self.manageM.shouyitwo,    //收益布局双排
            "userId":self.manageMOpenAnAccount.userId
//            "fundCode" : self.manageMOpenAnAccount.fundCode
        };
        params = HTTP.setCPSCommonParams(params);
        console.log("企业理财收益查询接口(SEpt007)"+JSON.stringify(params));
        return params;
    };

    //3.11企业理财收益查询接口(SEpt007)  成功回调函数
    Other.prototype.financialIncomeQuerySuccessCallback = function (result) {
        if (result.code !== config.RES.SUCCESS) {
            Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
            return;
        }
        $("#check_text_T").html('');
        console.log("企业理财收益查询接口(SEpt007)"+JSON.stringify(result));
        $("#get_money").show();
        $('#Noget_leiji_page').hide();
        $('#leijyImg').attr('src','images/get_math.png');
        $('#leijyImg').removeClass('leijyImg_s').addClass('leijyImg');

        otherSelf.orderPageJson['income']=Lang.getThausand(Lang.fen2yuan(result['income']),1);//累计收益
        var template = new UI.Template();
        template.template_OneToOne("id_income_wrap" ,otherSelf.orderPageJson);
        var list=result['datas'];

        otherSelf.arrDIVSeven = new Array();
        otherSelf.arrDIVSevenDays = new Array();
        var objList = '';
        if(list==null||list==""||list.length<=0||list=="undefined"){
            $("#check_text_T").hide();
            $('#Noget_leiji_page').show();
        }else{
            $("#check_text_T").show();
            $('#Noget_leiji_page').hide();
            for(var i=0;i<list.length;i++){
                otherSelf.transactioncfmDate7=list[i]['transactioncfmDate'];   //交易确认日期
                otherSelf.dividendVol7=list[i]['dividendVol'];   //转投份额
                otherSelf.arrDIVSeven[otherSelf.arrDIVSeven.length] = list[i]['dividendVol']*1; //金额
                otherSelf.arrDIVSevenDays[otherSelf.arrDIVSevenDays.length] = list[i]['transactioncfmDate']; //日期
            };
            otherSelf.maxarrSeven = getMaximin(otherSelf.arrDIVSeven,'max');
            console.log(otherSelf.maxarrSeven + '= otherSelf.maxarrSeven CCC');
            for(var j = 0; j<otherSelf.arrDIVSeven.length; j++){
                otherSelf.percentMaxSeven = otherSelf.arrDIVSeven[j]*1/otherSelf.maxarrSeven*1;
                if(otherSelf.percentMaxSeven*1 < 0.16){
                    otherSelf.percentMaxSeven = 0.16;
                }
                otherSelf.percentMaxSevenPerfouth = otherSelf.percentMaxSeven*100 + '%';
                console.log(otherSelf.arrDIVSeven[j] + ' = 当前值CCC');
                console.log(otherSelf.percentMaxSeven + ' = 得出的百分比CCC');

                objList += '<div class="skillbar" data-percent='+otherSelf.percentMaxSevenPerfouth+'>'+
                    '<div class="skillbar-bar">'+
                        '<div class="skill-left" style="background: #ff9b26">'+otherSelf.arrDIVSevenDays[j]+'</div>'+
                        '<div class="skillR">'+
                            '<div class="skill-right" style="background: #ff9b26">'+"+"+(otherSelf.arrDIVSeven[j]/100).toFixed(2)+'</div>'+
                        '</div>'+
                    '</div>'+
                '</div>';
            }
            $("#check_text_T").html(objList);
            $('.skillbar').each(function(){
                $(this).find('.skill-right').animate({
                    width:$(this).attr('data-percent')
                },1000);
            });
        }
    };
    Other.prototype.floatAdd = function(arg1,arg2){
        var r1,r2,m;
        try{r1=arg1.toString().split(".")[1].length}catch(e){r1=0}
        try{r2=arg2.toString().split(".")[1].length}catch(e){r2=0}
        m=Math.pow(10,Math.max(r1,r2));
        return (arg1*m+arg2*m)/m
    };
    //3.15企业理财万份收益和七日年转化率(SEpt014)
    Other.prototype.millionCopiesOfRevenue = function(){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.MILLION_COPIES_OF_REVENUE,
            'params' : self.millionCopiesOfRevenueParams(),
            'showLoading' : true,
            'success' : self.millionCopiesOfRevenueSuccessCallback
        });
    };
    //3.15企业理财万份收益和七日年转化率(SEpt014)  构造请求参数
    Other.prototype.millionCopiesOfRevenueParams = function () {
        var self = this;
        var params = {
            "productId":self.manageMOpenAnAccount.productId
        };
        params = HTTP.setCPSCommonParams(params);
        return params;
    };
    function getMaximin (arr,maximin) {
        if (maximin == "max") {
            return Math.max.apply(Math, arr);
        }else if (maximin == "min") {
            return Math.min.apply(Math, arr);
        }
    }
    //3.15企业理财万份收益和七日年转化率(SEpt014)  成功回调函数
    Other.prototype.millionCopiesOfRevenueSuccessCallback = function (result) {
        if (result.code !== config.RES.SUCCESS) {
            Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
            return;
        }
        $("#check_text_T").html('');
        otherSelf.iAdd = '0';
        otherSelf.iAddyield = '0';
        $("#get_money").show();
        $('#leijyImg').attr('src','images/get_thousand.png');
        $('#leijyImg').addClass('leijyImg_s');
        var list=result['datas'];
        otherSelf.arrDIVfouth = new Array();
        otherSelf.arrDIVDaysfouth = new Array();
        var objList = '';

        var ul_shouyi_first = $("#ul_shouyi_first").empty().append( $("<li></li>").html("日期"));
        if(list==null||list==""||list.length<=0||list=="undefined"){
            $("#check_text_T").hide();
        }else{
            $("#check_text_T").show();
            if(otherSelf.manageM.shouyitwo==2){
                $('#leijyId').text('近一月平均万份收益(元)');
                for(var i=0;i<list.length;i++){
                    otherSelf.navDatefouth=list[i]['navDate'];//净值日期
                    var navDate=list[i]['navDate'];//净值日期
                    otherSelf.fundIncome14 = parseInt(list[i]['fundIncome']);   //判断大小，不要小数点
                    otherSelf.fundIncomefouth = list[i]['fundIncome'];
                    var fundIncome = (list[i]['fundIncome']/100).toFixed(4);   //货币基金万份收益4位数
                    var fundincomeFlag = list[i]['fundincomeFlag'];   //货币基金万份收益正负
                    otherSelf.iAdd = otherSelf.floatAdd(otherSelf.iAdd ,Number(fundIncome));
                    otherSelf.orderPageJson['income'] = (otherSelf.iAdd/i).toFixed(4);
                    otherSelf.arrDIVfouth[otherSelf.arrDIVfouth.length] = otherSelf.fundIncomefouth*1; //金额
                    otherSelf.arrDIVDaysfouth[otherSelf.arrDIVDaysfouth.length] = otherSelf.navDatefouth; //日期
                };
                otherSelf.maxarrfouth = getMaximin(otherSelf.arrDIVfouth,'max');
                console.log(otherSelf.maxarrfouth + '= otherSelf.maxarrfouth CCC');
                for(var j = 0; j<otherSelf.arrDIVfouth.length; j++){
                    otherSelf.percentMaxfouth = otherSelf.arrDIVfouth[j]*1/otherSelf.maxarrfouth*1;
                    otherSelf.percentMaxPerfouth = otherSelf.percentMaxfouth*100 + '%';
                    console.log(otherSelf.arrDIVfouth[j] + ' = 当前值CCC');
                    console.log(otherSelf.percentMaxfouth + ' = 得出的百分比CCC');
                    objList += '<div class="skillbar" data-percent='+otherSelf.percentMaxPerfouth+'>'+
                        '<div class="skillbar-bar">'+
                        '<div class="skill-left" style="background: #ff9b26">'+otherSelf.arrDIVDaysfouth[j]+'</div>'+
                        '<div class="skillR">'+
                        '<div class="skill-right" style="background: #ff9b26">'+(otherSelf.arrDIVfouth[j]/100).toFixed(4)+'</div>'+
                        '</div>'+
                        '</div>'+
                        '</div>';
                }

            }else{
                $('#leijyId').text('近一月平均收益率');
                for(var i=0;i<list.length;i++)
                {
                    otherSelf.navDatefouth=list[i]['navDate'];//净值日期
                    var navDate=list[i]['navDate'];//净值日期
                    otherSelf.yyieldfourh =list[i]['yield'];
                    var yyield = (list[i]['yield']/100).toFixed(4);   //货币基金七日年化收益率
                    var yieldFlag=list[i]['yieldFlag'];   //货币基金七日年化收益率正负
                    otherSelf.iAddyield = otherSelf.floatAdd(otherSelf.iAddyield ,Number(yyield));
                    otherSelf.orderPageJson['income'] = (otherSelf.iAddyield/i).toFixed(4) + '%';
                    otherSelf.arrDIVfouth[otherSelf.arrDIVfouth.length] = otherSelf.yyieldfourh*1; //金额
                    otherSelf.arrDIVDaysfouth[otherSelf.arrDIVDaysfouth.length] = otherSelf.navDatefouth; //日期
                };

                otherSelf.maxarrfouth = getMaximin(otherSelf.arrDIVfouth,'max');
                console.log(otherSelf.maxarrfouth + '= otherSelf.maxarrfouth CCC');
                for(var j = 0; j<otherSelf.arrDIVfouth.length; j++){
                    otherSelf.percentMaxfouth = otherSelf.arrDIVfouth[j]*1/otherSelf.maxarrfouth*1;
                    otherSelf.percentMaxPerfouth = otherSelf.percentMaxfouth*100 + '%';
                    console.log(otherSelf.arrDIVfouth[j] + ' = 当前值CCC');
                    console.log(otherSelf.percentMaxfouth + ' = 得出的百分比CCC');
                    objList += '<div class="skillbar" data-percent='+otherSelf.percentMaxPerfouth+'>'+
                        '<div class="skillbar-bar">'+
                        '<div class="skill-left" style="background: #ff9b26">'+otherSelf.arrDIVDaysfouth[j]+'</div>'+
                        '<div class="skillR">'+
                        '<div class="skill-right" style="background: #ff9b26">'+"+"+(otherSelf.arrDIVfouth[j]/100).toFixed(4)+ '%' + '</div>'+
                        '</div>'+
                        '</div>'+
                        '</div>';
                }

            }
        }
        $('#check_text_T').html(objList);
        $('.skillbar').each(function(){
            $(this).find('.skill-right').animate({
                width:$(this).attr('data-percent')
            },1000);
        });
        var template = new UI.Template();
        template.template_OneToOne("id_income_wrap" ,otherSelf.orderPageJson);
    };
    //收支界面
    Other.prototype.financialRevenueAndExpenditureinterface=function(){
        var self=this;
        $("#check_text_shouzhi").hide();//时间 操作 金额 状态
        $(".page_current").hide();//点击更多按钮
        $('#shouzhi_null_text').hide(); //出现立即体验的按钮
        $('#shouyi_null_text').hide();  //出现 暂无收益记录 文本
        goTo(config.page.income_in); //收支界面四排
        self.financialRevenueAndExpenditureQuery();  //3.12企业理财收支查询接口(SEpt008)
    };
    //3.12企业理财收支查询接口(SEpt008)
    Other.prototype.financialRevenueAndExpenditureQuery = function(){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.FINANCIAL_REVENUE_AND_EXPENDITURE_QUERY,
            'params' : self.financialRevenueAndExpenditureQueryParams(),
            'showLoading' : true,
            'success' : self.financialRevenueAndExpenditureQuerySuccessCallback
        });
    };
    //3.12企业理财收支查询接口(SEpt008)  构造请求参数
    Other.prototype.financialRevenueAndExpenditureQueryParams = function () {
        var self = this;
        var params = {
            "orderType":self.manageM.shouzhifour,//查询类型
            "userId":self.manageMOpenAnAccount.userId,
            "pageSize":"30",
            "currentPage":self.manageM.currentPage  //页数
        };
        params = HTTP.setCPSCommonParams(params);
        return params;
    };
    //3.12企业理财收支查询接口(SEpt008)  成功回调函数
    Other.prototype.financialRevenueAndExpenditureQuerySuccessCallback = function (result) {
        if (result.code !== config.RES.SUCCESS) {
            Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
            return;
        }
        $("#time_date").html('');
        $("#change_type").html('');
        $("#money_balance").html('');
        $("#type_type").html('');
        var list=result['datas'];
        if(list==null||list==""||list.length<=0||list=="undefined"){
            if (otherSelf.manageM.currentPage == 1) {
                $("#check_text_shouzhi").hide();
                $(".page_current").hide();
                if(otherSelf.manageM.shouzhifour == 0){   //转入   只有转入才有立即体验的按钮
                    $('#shouzhi_null_text').show(); //出现立即体验的按钮
                }else{
                    $('#shouzhi_null_text').hide(); //出现立即体验的按钮
                }
                // '转入' :'0','转出' : '1',消费' : '2','收益' : '3'
                if(otherSelf.manageM.shouzhifour == 3 || otherSelf.manageM.shouzhifour == 2 || otherSelf.manageM.shouzhifour == 1 || otherSelf.manageM.shouzhifour == 7){//收益和消费
                    $('#shouyi_null_text').show();  //出现 暂无记录 文本
                }else{
                    $('#shouyi_null_text').hide();
                }
            }else{
                $(".page_current").hide();
                return;
            }
        }else {
            $(".page_current").show();
            $("#check_text_shouzhi").show();
            $('#shouzhi_null_text').hide(); //出现立即体验的按钮
            $('#shouyi_null_text').hide();  //出现 暂无收益记录 文本
            /*var time_date = $("#time_date"), time_date_val = time_date.html();
            var change_type = $("#change_type"), change_type_val = change_type.html();
            var money_balance = $("#money_balance"), money_balance_val = money_balance.html();
            var type_type = $("#type_type"), type_type_val = type_type.html();
            for (var i = 0; i < list.length; i++) {
                time_date_val += '<span class="time_bottom">' + list[i].accDate+"</span>";//交易时间
                change_type_val += '<span class="time_bottom">' + list[i].typeName+"</span>";////交易名称
                if (otherSelf.manageM.shouzhifour == 0 || otherSelf.manageM.shouzhifour == 3 || otherSelf.manageM.shouzhifour == 7) {
                    money_balance_val += '<span class="time_bottom">' + "+" + Lang.getThausand(Lang.fen2yuan(list[i].amount),1) + "</span>";//交易金额
                } else if (otherSelf.manageM.shouzhifour == 1 || otherSelf.manageM.shouzhifour == 2) {
                    money_balance_val += '<span class="time_bottom">' + "-" + Lang.getThausand(Lang.fen2yuan(list[i].amount),1) + "</span>"; //交易金额
                }
                type_type_val += '<span class="time_bottom">' + "成功" + "</span>";
            }
            time_date.html(time_date_val);
            change_type.html(change_type_val);
            money_balance.html(money_balance_val);
            type_type.html(type_type_val);*/

            var yesterday;
            var time;
            var html = '';
            for (var i = 0, len = list.length; i < len; i++) { 
            	time = list[i].accDate.split(' ');
            	if(time[0] !== yesterday){ 
            		//不同一日
            		html += '<div class="time-line">'+ time[0] +'</div>';
            	}
            	yesterday = time[0];
            	html += '<div class="income-list">';
            	html += '<div class="box income-list-top">';
            	if (otherSelf.manageM.shouzhifour == 0 || otherSelf.manageM.shouzhifour == 3 || otherSelf.manageM.shouzhifour == 7) {
                    html += '<div class="box-f1">'+ list[i].typeName +'</div><div class="box-f1 incolor">+'+ Lang.getThausand(Lang.fen2yuan(list[i].amount),1) +'</div>'; //交易金额
                } else if (otherSelf.manageM.shouzhifour == 1 || otherSelf.manageM.shouzhifour == 2) {
                    html += '<div class="box-f1">'+ list[i].typeName +'</div><div class="box-f1 outcolor">-'+ Lang.getThausand(Lang.fen2yuan(list[i].amount),1) +'</div>'; //交易金额
                }
            	html += '</div>';
            	html += '<div class="box income-list-bottom">';
            	html += '<div class="box-f1">'+ time[1] +'</div><div class="box-f1">成功</div>';
            	html += '</div></div>';
            }

            $("#check_text_shouzhi").html(html);
            if(list.length<30){
                $(".page_current").hide();
            }
        }
    };

    return Other;
});