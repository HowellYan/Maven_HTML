
define(['jquery','bestpay.ui','bestpay.lang','bestpay.http','jtemplates'],function($,UI, Lang, HTTP,jtemp) {
    function $_id(id){
        return document.getElementById(id);
    }
    var openanaccountSelf = new OpenAnAccount();

    function OpenAnAccount() {
        openanaccountSelf = this;
        this.manageM = config.man.manageM;
        this.productId = '0030001';                       //产品ID
        this.userId = null;                          //用户ID
        this.fundCode = null;                        //基金代码
        this.productName = null;                     //产品名称
        this.orderPageJson = {};                     //页面的模板值
        this.anountcementisBack = '0';
        this.nullgonggao = null;                         //判断公告有无值

    }
    OpenAnAccount.prototype.authenStatusA02 = function(){
        var self = this;
        console.log('111');
//        App.setpopWindwonGone();//非首页时不显示标题导航条右上角的按钮
//    }else{
//        App.setpopWindwonVisible(); //在首页时显示标题导航条右上角的按钮
        if (this.manageM.userInfo.hadEpt == 1){
            console.log('222');
           // showDialog(config.MSG.loading);
            $('#show_time_charming').hide();
            //App.setpopWindwonVisible(); //在首页时显示标题导航条右上角的按钮
            self.accountInformationInterface();   //企业理财账户信息接口(SEpt006)  //跳到添益宝首页
        }else {
            goTo(config.page.application); //没开户的首页
            App.setpopWindwonGone();//非首页时不显示标题导航条右上角的按钮
            $('#show_time_charming').hide();
        }
    };
    //3.3企业理财信息校验接口(MEpt010) 要判断是否认证
    OpenAnAccount.prototype.informationVerification  = function(){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.INFORMATION_VERIFICATION,
            'params' : self.informationVerificationParams(),
            'showLoading' : true,
            'success' : self.informationVerificationSuccessCallback
        });
    };
    /*.3企业理财信息校验接口(MEpt010) 请求参数*/
    OpenAnAccount.prototype.informationVerificationParams = function () {
        var self = this;
        var params = {
        };
        params = HTTP.setCPSCommonParams(params);
        console.log("企业理财账户信息接口(MEpt010)入参======="+JSON.stringify(params));
        return params;
    };
    //3企业理财信息校验接口(MEpt010) 成功回调函数
    OpenAnAccount.prototype.informationVerificationSuccessCallback = function (result) {
        var self=this;
        dismissDialog();
        if (result.code !== config.RES.SUCCESS) {
            if(result['code'] === "010001"){//解绑
                goTo(config.page.kaotongfloat_unbind); //解绑
                $('#mask_id').show();
                $_id("unbindBank").onclick=function(){
                    back();
                    App.jumpToUnBindCard();
                    $('#mask_id').hide();
                }
                $_id("unbindBankCancel").onclick=function(){
                    back();
                    $('#mask_id').hide();
                };
            }
            else if(result['code'] === "010004"){//认证状态异常
                goTo(config.page.kaotongfloat); //认证
                $('#mask_id').show();
                $_id("kai_authrity").onclick=function(){
                    back();
                    App.jumpToRecertify();//跳转认证的入口
                    $('#mask_id').hide();
                };
                $_id("kai_cancel").onclick=function(){
                    back();
                    $('#mask_id').hide();
                }
            }
            else if(result['code'] === "010006"){//商户资料不全
                goTo(config.page.kaotongfloat); //认证
                $('#mask_id').show();
                $_id("kai_authrity").onclick=function(){
                    back();
                    App.jumpToRecertify();//跳转认证的入口
                    $('#mask_id').hide();
                };
                $_id("kai_cancel").onclick=function(){
                    back();
                    $('#mask_id').hide();
                }
            }
            else if(result['code'] === "010007"){// 未认证  要开户一定要认证,不一定要绑卡
                goTo(config.page.kaotongfloat);  //认证
                $('#mask_id').show();
                $_id("kai_authrity").onclick=function(){
                    back();
                    App.jumpToRecertify();//跳转认证的入口
                    $('#mask_id').hide();
                };
                $_id("kai_cancel").onclick=function(){
                    back();
                    $('#mask_id').hide();
                }
            }
            else if(result['code'] === "010008"){//用户名验证失败，请重新绑卡   //解绑
                goTo(config.page.kaotongfloat_unbind); //解绑
                $('#mask_id').show();
                $(".alert_W_unbind h2").html("解绑");
                $(".alert_W_unbind .alert_cet").html("用户名验证失败，请重新绑卡");
                $_id("unbindBankCancel").onclick=function(){
                    back();
                    $('#mask_id').hide();
                };
                $_id("unbindBank").onclick=function(){
                    back();
                    App.jumpToUnBindCard();
                    $('#mask_id').hide();
                }
            }
            else {
                Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
            }
            return;
        };
        openanaccountSelf.kaihuPassword = new UI.InputText('kaihuPassword','password',null);//开户支付密码
        openanaccountSelf.kaihuPassword.clearValue(); //开户支付密码清空
        openanaccountSelf.manageM.recomand.clearValue(); //推荐人清空
        console.log("企业理财账户信息接口(MEpt010)出参======="+JSON.stringify(result));
        var list = result['productItems'];
        for(var i=0;i<list.length;i++){
            openanaccountSelf.productId=list[i]['productId'];
            openanaccountSelf.fundCode=list[i]['fundCode'];
            openanaccountSelf.userId=list[i]['userId'];
            openanaccountSelf.productName=list[i]['productName'];
        }
        openanaccountSelf.orderPageJson['user_name'] = openanaccountSelf.manageM.userInfo.staffCode;//账户名称
        openanaccountSelf.orderPageJson['certificateName']=result.certificateName;//开户账户名
        openanaccountSelf.orderPageJson['productName']= openanaccountSelf.productName;//理财产品名称
        openanaccountSelf.orderPageJson['certificateNo']=result.certificateNo;//开户证件号
        var template = new UI.Template();
        template.template_OneToOne("id_open_info" ,openanaccountSelf.orderPageJson);
        goTo(config.page.customer_info);//跳到1.3开户（信息确认1）页面
    };
    //开户页面支付密码页面,去到开户成功的页面
    OpenAnAccount.prototype.gotoOpen = function (){
        var self=this;
        //this.kaihuPassword_val = this.kaihuPassword.getValue();
        this.recomand_val = this.manageM.recomand.getToEmptyValue();//推荐人
        //if (this.kaihuPassword_val == null || this.kaihuPassword_val.length == 0) {
        //    Bestpay.Toast.makeText('请输入密码', Bestpay.Toast.LENGTH_SHORT);
        //    return;
        //}else if(this.kaihuPassword_val.length<6){
        //    Bestpay.Toast.makeText('请输入6~12位支付密码', Bestpay.Toast.LENGTH_SHORT);
        //    return;
        //}
        if(this.agreement == 0){
            Bestpay.Toast.makeText('请勾选协议', Bestpay.Toast.LENGTH_SHORT);
            return;
        }
        PasswordKeyBoard.initPwdUI3(function(val){
            HTTP.getRandomServices(function(result){ //随机加密接口
                var retJson = result;
                //未找到酬金结算方式，不进行酬金计算, 也当做成功了，酬金为零
                if (result.code === config.RES.SUCCESS) {
                    openanaccountSelf.random = result.randNum;
                }
                self.enterpriseFinancialOpening(val);
            },false);

        });
        PasswordKeyBoard.popKeyboardUI3();
    };
    //3.1企业理财开户(MEpt001)
    OpenAnAccount.prototype.enterpriseFinancialOpening = function(val){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.ENTERPRISE_FINANCIAL_OPENING,
            'params' : self.enterpriseFinancialOpeningParams(val),
            'showLoading' : true,
            'success' : self.enterpriseFinancialOpeningSuccessCallback
        });
    };
    // 3.企业理财开户(MEpt001)  构造请求参数
    OpenAnAccount.prototype.enterpriseFinancialOpeningParams = function (val) {
        var self = this;
        var params = {
            "eptProduct":self.productId,// 理财产品为产品ID
            "eptProductCode":self.fundCode,
            "certificateName": self.orderPageJson['certificateName'],//开户账户名
            "certificateNo":self.orderPageJson['certificateNo'],//开户证件号
            'payPassword': Bestpay.Security.encryptPassword(self.manageM.userInfo.staffCode,val,self.random),//开户密码
            "recommendCustCode":self.recomand_val
        };
        params = HTTP.setCPSCommonParams(params);
        return params;
    };
    // 3.企业理财开户(MEpt001)  成功回调函数
    OpenAnAccount.prototype.enterpriseFinancialOpeningSuccessCallback = function (result) {
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
            }
            else{
                Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
            }
            return;
        }
        var hadEpt = {
            "hadEpt":"1"
        };
        goTo(config.page.open_success,function(){
            Bestpay.App.updateTybOpenStat(JSON.stringify(hadEpt));
        });  //开通成功的页面
        config.isBack = function(){
            location.reload();
        }
    };
    // 企业理财账户信息接口(SEpt006)
    OpenAnAccount.prototype.accountInformationInterface = function(){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.ENTERPRISE_PERSONAL_ACCOUNT_INFO,
            'params' : self.accountInformationInterfaceParams(),
            'showLoading' : false,
            'success' : self.accountInformationInterfaceSuccessCallback,
            'error' : self.accountInformationInterfaceErrorCallback
        });
    };
    /* 企业理财账户信息接口(SEpt006) 请求参数*/
    OpenAnAccount.prototype.accountInformationInterfaceParams = function () {
        var self = this;
        var params = {
            "productId":self.productId
        };
        params = HTTP.setCPSCommonParams(params);
        console.log("企业理财账户信息接口(SEpt006)入参======="+JSON.stringify(params));
        return params;
    };
    //日期显示
    OpenAnAccount.prototype.dateSquareday = function(){
        var now= new Date();
        var date = now.getDate();
        //$_id("date_square").innerHTML = date ;
    };
    // 企业理财账户信息接口(SEpt006) 成功回调函数
    OpenAnAccount.prototype.accountInformationInterfaceSuccessCallback = function (result) {
        $('#netword_failure').hide();
        if (result.code !== config.RES.SUCCESS) {
            Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code,function(){
                Bestpay.App.jumpToMain();   //退出大厅
            });
            return;
        }
        console.log("企业理财账户信息接口(SEpt006)出参======="+JSON.stringify(result));
        openanaccountSelf.orderPageJson={};
        openanaccountSelf.userId = result['userId'];//用户产品列表
        openanaccountSelf.orderPageJson['yesterdayIncome'] = Lang.fen2yuan(result.yesterdayIncome);//昨日收益
        openanaccountSelf.orderPageJson['balanceNoneDou'] = Lang.fen2yuan(result.balance);//余额总额
        openanaccountSelf.orderPageJson['balance'] = Lang.getThausand(Lang.fen2yuan(result.balance),1);//余额总额
        openanaccountSelf.orderPageJson['income'] = Lang.fen2yuan(result.income);//累计收益
        openanaccountSelf.orderPageJson['shareIncome'] = (result.shareIncome/100).toFixed(4);//万分收益
        openanaccountSelf.orderPageJson['weekIncomeRate'] = (result.weekIncomeRate/100).toFixed(4);//七日年化收益率
        openanaccountSelf.orderPageJson['weekIncome'] = Lang.fen2yuan(result.weekIncome);//近一周收益
        openanaccountSelf.orderPageJson['confirmWorkDay'] = result.confirmWorkDay; //收益日期
        openanaccountSelf.orderPageJson['confirmWorkWeek'] = result.confirmWorkWeek;//收益星期
        var template = new UI.Template();
        template.template_OneToOne("id_main_first" ,openanaccountSelf.orderPageJson);
        $("#yes_up").on('click',function(){//点击昨日收益文本按钮
            config.man.manageM.shouyitwo = 0;
            $("#id_shouyitwo_down #lj_span").html("累计收益");
            $('#leijyId').text('累计收益(元)');
            config.man.otherInterfaces.financialIncomeinterface();   //跳到累计收益页面  3.11企业理财收益查询接口(SEpt007)
        });
        $("#total_acount").on('click',function(){//点击账户总额按钮
            config.man.manageM.currentPage = 1; //页数
            config.man.manageM.shouzhifour = 0;
            $("#btn_shouzhifour_down #zr_span").html("转入");
            $("#time_date").empty();
            $("#change_type").empty();
            $("#money_balance").empty();
            $("#type_type").empty();
            config.man.otherInterfaces.financialRevenueAndExpenditureinterface();   //跳到收支页面 3.12企业理财收支查询接口(SEpt008)
        });
        $("#leiji_shouyi").on('click',function(){//点击累计收益(元)按钮
            config.man.manageM.shouyitwo = 0;
            $("#id_shouyitwo_down #lj_span").html("累计收益");
            $('#leijyId').text('累计收益(元)');
            config.man.otherInterfaces.financialIncomeinterface();   //跳到累计收益页面 3.11企业理财收益查询接口(SEpt007)
        });
        $("#thousand_account").on('click',function(){ //点击万份收益按钮
            $("#get_money").hide();
            $('#Noget_leiji_page').hide();
            config.man.manageM.shouyitwo = 2;
            $("#id_shouyitwo_down #lj_span").html("万份收益");
            config.man.otherInterfaces.financialIncomeinterface();   //跳到3.15企业理财万份收益和七日年转化率(SEpt014)
        });
        $("#seven_day_account").on('click',function(){ //点击七日年化收益率按钮
            $("#get_money").hide();
            $('#Noget_leiji_page').hide();
            config.man.manageM.shouyitwo = 3;
            $("#id_shouyitwo_down #lj_span").html("七日年化收益率");
            config.man.otherInterfaces.financialIncomeinterface();   //跳到3.15企业理财万份收益和七日年转化率(SEpt014)
        });
        $('#up_help_service_center').on('click',function(){ //常见问题和公告消息
            openanaccountSelf.anountcementisBack = 0;
            config.man.otherInterfaces.financialProblemQuery();//常见问题和公告消息
        });
        //1
//        //近一周收益的点击事件
//        $('#weekend_shouyi').on('click',function(){
//            openanaccountSelf.accountAutomaticTurnIn();
//        });
        $("#weekend_shouyi").on('click',function(){//近一周收益的点击事件按钮
            config.man.manageM.shouyitwo = 1;
            $("#id_shouyitwo_down #lj_span").html("近一周收益");
            $('#leijyId').text('近一周收益(元)');
            config.man.otherInterfaces.financialIncomeinterface();   //跳到近一周收益页面 3.11企业理财收益查询接口(SEpt007)
        });

        //开户后的首页的累计收益类的按钮
//        $('#thousand_shouyi div,.total_acount,.yesterday').on('touchstart',function(){
//            $(this).addClass('confirm-item_g_s');
//        });
        $('#thousand_shouyi div').on('touchstart',function(){
            $(this).addClass('confirm-item_g_s');
        });
//        $('#thousand_shouyi div,.total_acount,.yesterday').on('touchend touchmove touchcancel',function(){
//            $(this).removeClass('confirm-item_g_s');
//        });
        $('#thousand_shouyi div').on('touchend touchmove touchcancel',function(){
            $(this).removeClass('confirm-item_g_s');
        });
        goTo(config.page.main_first,function(){
            openanaccountSelf.dateSquareday();//显示日期
            config.isBack = function(){
                location.reload();
            }
        }); //开户成功的首页
        openanaccountSelf.messageAnnouncement();//常用问题与公告信息的接口016;
    };
    //企业理财账户信息接口(SEpt006) 失败回调函数
    OpenAnAccount.prototype.accountInformationInterfaceErrorCallback = function (){
        dismissDialog();
        $('#netword_failure').show();
        Bestpay.Dialog.showAlertDialog('提醒', config.MSG.networkFail, '确定', "",function(){
            Bestpay.App.jumpToMain();   //退出大厅
        });
        return;
    };
   //消息公告接口(SEpt016)
    OpenAnAccount.prototype.messageAnnouncement = function(){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.MESSAGE_ANNOUNCEMENT,
            'params' : self.messageAnnouncementParams(),
            'showLoading' : false,
            'success' : self.messageAnnouncementSuccessCallback,
            'error' : self.messageAnnouncementErrorCallback
        });
    };
    //消息公告接口(SEpt016)  构造请求参数
    OpenAnAccount.prototype.messageAnnouncementParams = function () {
        var self = this;
        var params = {
            "producttypeId":'01'   // 01活期理财    02定期理财
        };
        params = HTTP.setCPSCommonParams(params);
        console.log("消息公告接口(SEpt016)=====入参===" + JSON.stringify(params));
        return params;
    };
    //消息公告接口(SEpt016)  成功回调函数
    OpenAnAccount.prototype.messageAnnouncementSuccessCallback = function (result) {
        dismissDialog();
        console.log('消息公告接口(SEpt016)===出参===' + JSON.stringify(result));
        if (result.code !== config.RES.SUCCESS) {
            Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
            return;
        }
        $('#brg_amount_question').show();
        $("#id_anountmentBoxLeft").show();
        $("#id_anountmentBoxRight").hide();
        openanaccountSelf.DATASTwo = result.datas;
        var title = '';
        var title_first = '';
        var contents = '';
        var contents_first = '';
        var ObjHTML_Left = '';
        if(openanaccountSelf.DATASTwo !== null && openanaccountSelf.DATASTwo !== 'null' && openanaccountSelf.DATASTwo !== '' && openanaccountSelf.DATASTwo.length !== 0 &&openanaccountSelf.DATASTwo !=='undefined' && typeof openanaccountSelf.DATASTwo !== 'undefined'){
            openanaccountSelf.nullgonggao = 1;
//            $('#gongkao_information').show();
            for(var i = 0; i < openanaccountSelf.DATASTwo.length; i++){
                title_first = openanaccountSelf.DATASTwo[0]['title'];
                contents_first = openanaccountSelf.DATASTwo[0]['contents'];
                var ObjJson = openanaccountSelf.DATASTwo[i];
                ObjHTML_Left += '<div class="confirm_anount boxbox" data-anountcode=' + i + '>' + '<div class="six_all boxbox">' + '<div class="six_title">' + ObjJson.title + '</div>' + '<div class="six_contents">' + ObjJson.noticeDate + '</div>' + '</div>' + '</div>';
            }
            $("#id_anountmentBoxLeft").html(ObjHTML_Left);
            openanaccountSelf.anountLeft();
            var ObjHTML_first = '<span>' + title_first +'</span>';
//            var ObjHTML_first = '<span>' + title_first +'</span>' + ':' + '<span class="huanghang">' + contents_first +'</span>';
            $('#first_anouncement').show();
            $('#announcement').addClass('announcement_show'); //首页的公告
            //$('#announcement').addClass('announcement_show').html(ObjHTML_first); //首页的公告
//            $('.announcement_show').css({
//                'animation': 'myfirst 5s linear infinite normal'
//            });
            var marqu = '<marquee direction="left" behavior="scroll" scrollamount="10" loop="-1" width="98%" height="auto" hspace="10" vspace="10">' + ObjHTML_first + '</marquee>';
            //            指整个Marquee对齐方式; (2)behavior:设置滚动的方式: scroll:表示由一端滚动到另一端,会重复,缺陷是不能无缝滚动。 slide:表示由一段滚动到另一端,不会重复...

            $('.announcement_show').html(marqu);

            openanaccountSelf.acceptanountcode = true;
            console.log('openanaccountSelf.acceptanountcode=true===' + openanaccountSelf.acceptanountcode);
            openanaccountSelf.manageM.percenthundred(); //显示公告
            openanaccountSelf.anountright_first = '<div class="anount_title">' + title_first + '</div>' + '<div class="anount_contents">' + contents_first + '</div>';
        }else{
            openanaccountSelf.nullgonggao = 0;
            console.log('irtyuijhgffghjkkjhgfghnjm,');
            $('#first_anouncement').hide();
            $('#gongkao_information').hide();
            openanaccountSelf.acceptanountcode = false;
            console.log('openanaccountSelf.acceptanountcode=false===' + openanaccountSelf.acceptanountcode);
        }
        console.log(config.man.manageMOpenAnAccount.nullgonggao + '===公告016==config.man.manageMOpenAnAccount.nullgonggao==');

    };
    OpenAnAccount.prototype.anountLeft = function(){
        var self = this;
        $('.confirm_anount').each(function(){
            $(this).on('click',function(){
                self.anountcode_title = openanaccountSelf.DATASTwo[$(this).data('anountcode')].title;
                self.anountcode_contents = openanaccountSelf.DATASTwo[$(this).data('anountcode')].contents;
                self.anountRight = '<div class="anount_title">' + self.anountcode_title + '</div>' + '<div class="anount_contents">' + self.anountcode_contents + '</div>';
                $('#brg_amount_question').hide();
                $("#id_anountmentBoxLeft").hide();
                $("#id_anountmentBoxRight").show();
                Bestpay.App.setTitle('公告消息');
                $('#id_anountmentBoxRight').html(self.anountRight);
                config.isBack = function() {
                    Bestpay.App.setTitle('服务中心');
                    $('#id_anountmentBoxLeft').show();
                    $('#id_anountmentBoxRight').hide();
                    $('#brg_amount_question').show();
                };
            })
        })
    };
    //点击首页的第一条公告按钮
    OpenAnAccount.prototype.anountcement = function(){
        var self = this;
        goTo(config.page.service_center);
        $('#brg_amount_question').hide();
        $('#changjian_question').hide();
        $('#gongkao_information').show();
        $('#id_anountmentBoxLeft').hide();
        $('#id_anountmentBoxRight').show();
        Bestpay.App.setTitle('公告信息');
        $('#id_anountmentBoxRight').html(self.anountright_first);
        config.isBack = function(){
            self.anountcementisBack = 1;
            config.man.otherInterfaces.financialProblemQuery();  //015
        }
    }
    //消息公告接口(SEpt016) 失败回调函数
    OpenAnAccount.prototype.messageAnnouncementErrorCallback = function (){
        dismissDialog();
        Bestpay.Dialog.showAlertDialog('提醒', config.MSG.networkFail, '确定', "",function(){
            Bestpay.App.jumpToMain();   //退出大厅
        });
        return;
    };


    // 企业理财账户信息接口(SEpt006)
    OpenAnAccount.prototype.RefreshaccountInformationInterface = function(){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.ENTERPRISE_PERSONAL_ACCOUNT_INFO,
            'params' : self.RefreshaccountInformationInterfaceParams(),
            'showLoading' : false,
            'success' : self.RefreshaccountInformationInterfaceSuccessCallback,
            'error' : self.RefreshaccountInformationInterfaceErrorCallback
        });
    };
    /* 企业理财账户信息接口(SEpt006) 请求参数*/
    OpenAnAccount.prototype.RefreshaccountInformationInterfaceParams = function () {
        var self = this;
        var params = {
            "productId":self.productId
        };
        params = HTTP.setCPSCommonParams(params);
        console.log("企业理财账户信息接口(SEpt006)入参======="+JSON.stringify(params));
        return params;
    };
    // 企业理财账户信息接口(SEpt006) 成功回调函数
    OpenAnAccount.prototype.RefreshaccountInformationInterfaceSuccessCallback = function (result) {
        if (result.code !== config.RES.SUCCESS) {
            Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code,function(){
                Bestpay.App.jumpToMain();   //退出大厅
            });
            return;
        }
        if(pageStack[pageStack.length-1].id !=''&&pageStack[pageStack.length-1].id !=null &&pageStack[pageStack.length-1].id == 'page_main_first'){
            console.log('back显示CCCC');
            App.setpopWindwonVisible();//在首页时显示标题导航条右上角的按钮
        }else{
            App.setpopWindwonGone();//非首页时不显示标题导航条右上角的按钮
        }


        //initPage(config.page.main_first,'goto');
        console.log("企业理财账户信息接口(SEpt006)出参======="+JSON.stringify(result));
        openanaccountSelf.orderPageJson={};
        openanaccountSelf.userId = result['userId'];//用户产品列表
        openanaccountSelf.orderPageJson['yesterdayIncome'] = Lang.fen2yuan(result.yesterdayIncome);//昨日收益
        openanaccountSelf.orderPageJson['balanceNoneDou'] = Lang.fen2yuan(result.balance);//余额总额
        openanaccountSelf.orderPageJson['balance'] = Lang.getThausand(Lang.fen2yuan(result.balance),1);//余额总额

        openanaccountSelf.orderPageJson['income'] = Lang.fen2yuan(result.income);//累计收益
        openanaccountSelf.orderPageJson['shareIncome'] = (result.shareIncome/100).toFixed(4);//万分收益
        openanaccountSelf.orderPageJson['weekIncomeRate'] = (result.weekIncomeRate/100).toFixed(4);//七日年化收益率
        openanaccountSelf.orderPageJson['weekIncome'] = Lang.fen2yuan(result.weekIncome);//近一周收益
        openanaccountSelf.orderPageJson['confirmWorkDay'] = result.confirmWorkDay; //收益日期
        openanaccountSelf.orderPageJson['confirmWorkWeek'] = result.confirmWorkWeek;//收益星期
        var template = new UI.Template();
        template.template_OneToOne("id_main_first" ,openanaccountSelf.orderPageJson);
        $("#yes_up").on('click',function(){//点击昨日收益文本按钮
            config.man.manageM.shouyitwo = 0;
            $("#id_shouyitwo_down #lj_span").html("累计收益");
            $('#leijyId').text('累计收益(元)');
            config.man.otherInterfaces.financialIncomeinterface();   //跳到累计收益页面  3.11企业理财收益查询接口(SEpt007)
        });
        $("#total_acount").on('click',function(){//点击账户总额按钮
            config.man.manageM.currentPage = 1; //页数
            config.man.manageM.shouzhifour = 0;
            $("#btn_shouzhifour_down #zr_span").html("转入");
            $("#time_date").empty();
            $("#change_type").empty();
            $("#money_balance").empty();
            $("#type_type").empty();
            config.man.otherInterfaces.financialRevenueAndExpenditureinterface();   //跳到收支页面 3.12企业理财收支查询接口(SEpt008)
        });
        $("#leiji_shouyi").on('click',function(){//点击累计收益(元)按钮
            config.man.manageM.shouyitwo = 0;
            $("#id_shouyitwo_down #lj_span").html("累计收益");
            $('#leijyId').text('累计收益(元)');
            config.man.otherInterfaces.financialIncomeinterface();   //跳到累计收益页面 3.11企业理财收益查询接口(SEpt007)
        });
        $("#thousand_account").on('click',function(){ //点击万份收益按钮
            $("#get_money").hide();
            $('#Noget_leiji_page').hide();
            config.man.manageM.shouyitwo = 2;
            $("#id_shouyitwo_down #lj_span").html("万份收益");
            config.man.otherInterfaces.financialIncomeinterface();   //跳到3.15企业理财万份收益和七日年转化率(SEpt014)
        });
        $("#seven_day_account").on('click',function(){ //点击七日年化收益率按钮
            $("#get_money").hide();
            $('#Noget_leiji_page').hide();
            config.man.manageM.shouyitwo = 3;
            $("#id_shouyitwo_down #lj_span").html("七日年化收益率");
            config.man.otherInterfaces.financialIncomeinterface();   //跳到3.15企业理财万份收益和七日年转化率(SEpt014)
        });
        $('#up_help_service_center').on('click',function(){ //常见问题和公告消息
            openanaccountSelf.anountcementisBack = 0;
            config.man.otherInterfaces.financialProblemQuery();//常见问题和公告消息
        });
//        //累计收益的点击事件
//        //近一周收益的点击事件
//        $('#weekend_shouyi').on('click',function(){
//            openanaccountSelf.accountAutomaticTurnIn();
//        });
        $("#weekend_shouyi").on('click',function(){//近一周收益的点击事件按钮
            config.man.manageM.shouyitwo = 1;
            $("#id_shouyitwo_down #lj_span").html("近一周收益");
            $('#leijyId').text('近一周收益(元)');
            config.man.otherInterfaces.financialIncomeinterface();   //跳到近一周收益页面 3.11企业理财收益查询接口(SEpt007)
        });


        //开户后的首页的累计收益类的按钮
//        $('#thousand_shouyi div,.total_acount,.yesterday').on('touchstart',function(){
//            $(this).addClass('confirm-item_g_s');
//        });
        $('#thousand_shouyi div').on('touchstart',function(){
            $(this).addClass('confirm-item_g_s');
        });
//        $('#thousand_shouyi div,.total_acount,.yesterday').on('touchend touchmove touchcancel',function(){
//            $(this).removeClass('confirm-item_g_s');
//        });
        $('#thousand_shouyi div').on('touchend touchmove touchcancel',function(){
            $(this).removeClass('confirm-item_g_s');
        });


    };
    //企业理财账户信息接口(SEpt006) 失败回调函数
    OpenAnAccount.prototype.RefreshaccountInformationInterfaceErrorCallback = function (){
        dismissDialog();
        Bestpay.Dialog.showAlertDialog('提醒', config.MSG.networkFail, '确定', "",function(){
            Bestpay.App.jumpToMain();   //退出大厅
        });
        return;
    };


    //余额自动转入
    OpenAnAccount.prototype.accountAutomaticTurnIn = function(){
        var self = this;
        //交费易余额查询 自动转入先调交费易余额查询
        HTTP.getAccountBalanceInquiry(config.man.otherInterfaces.getAutomaticSuccessCallback,false);
    };
    //1.3自动转入添益宝-查询配置(SArc003) 判断是否开通自动转入
    OpenAnAccount.prototype.autoCheckSettingInterface = function(){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.AUTOCHECKACCOUNT,
            'params' : self.autoCheckSettingInterfaceParams(),
            'showLoading' : true,
            'success' : self.autoCheckSettingInterfaceSuccessCallback
        });
    };
    /*1.3自动转入添益宝-查询配置(SArc003) 请求参数*/
    OpenAnAccount.prototype.autoCheckSettingInterfaceParams = function () {
        var self = this;
        var params = {};
        params = HTTP.setCPSCommonParams(params);
        console.log("1.3自动转入添益宝-查询配置(SArc003) 入参======="+JSON.stringify(params));
        return params;
    };
    //1.3自动转入添益宝-查询配置(SArc003) 成功回调函数
    OpenAnAccount.prototype.autoCheckSettingInterfaceSuccessCallback = function (result) {
        console.log("1.3自动转入添益宝-查询配置(SArc003) 出参======="+JSON.stringify(result));
        if (result.code !== config.RES.SUCCESS) {
            if(result.code == '000011'){
                //openanaccountSelf.remindAcount_passWord = new UI.InputText('remindAcount_passWord','password');//转入支付密码
                //openanaccountSelf.remindAcount_passWord.clearValue(); //转入支付密码框
                //config.man.manageM.remindAcount_text.clearValue(); //金额清空
                goTo(config.page.AutomaticNew);
                $('#noAutoSetting').show();//没有开通的
                $('#yeahAutoSetting').hide();//有开通的
                $('#Automaticgreement').show();
                $('#autotongYi').show();
                $('.AutoRight').removeClass('AutoRightAdd');
                $('#remindAcount_text').val('0');
                return;
            }else{
                Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
                return;
            }
        }
        openanaccountSelf.actionCode = result.actionCode;  //业务编码
        openanaccountSelf.prodCode = result.prodCode;  //产品编码
        openanaccountSelf.amountAuto = result.amount;  //自动保留的金额
        openanaccountSelf.stat = result.stat;  //状态  000：开启  001：关闭
        //openanaccountSelf.remindAcount_passWord = new UI.InputText('remindAcount_passWord','password');//转入支付密码
        //openanaccountSelf.remindAcount_passWord.clearValue(); //转入支付密码框
        if(openanaccountSelf.stat == '000'){  //000：开启
            $('#noAutoSetting').hide();//没有开通的
            $('#yeahAutoSetting').show();//有开通的
            $('#Automaticgreement').hide();
            $('#autotongYi').hide();
            $('.AutoRight').addClass('AutoRightAdd');
            $('#remindAcount_text').val(Lang.fen2yuan(result.amount));
        }else{                                 //001：关闭
            config.man.manageM.remindAcount_text.clearValue(); //金额清空
            $('#noAutoSetting').show();//没有开通的
            $('#yeahAutoSetting').hide();//有开通的
            $('#Automaticgreement').show();
            $('#autotongYi').show();
            $('.AutoRight').removeClass('AutoRightAdd');
            $('#remindAcount_text').val('0');
        }
        goTo(config.page.AutomaticNew);
    };
    OpenAnAccount.prototype.AutomaticBtnInformation = function(){
        var self = this;
        this.remindAcount_text_val = config.man.manageM.remindAcount_text.getToEmptyValue();
       // this.remindAcount_passWord_val = this.remindAcount_passWord.getValue();
        //self.AutoSetTing未开通自动转入1   取消自动转入2   保留设置余额3
        if(config.man.manageM.AutoSetTing == '1'){ //未开通自动转入1
            if(this.remindAcount_text_val == null || this.remindAcount_text_val.length == 0){
                Bestpay.Toast.makeText('金额不能为空', Bestpay.Toast.LENGTH_SHORT);
                return;
            }else if(config.man.manageM.Automaticgreement != true){
                Bestpay.Toast.makeText('请同意服务协议', Bestpay.Toast.LENGTH_SHORT);
                return;
            }
        }else if(config.man.manageM.AutoSetTing == '3'){ //保留设置余额3
            if(this.remindAcount_text_val == null || this.remindAcount_text_val.length == 0){
                Bestpay.Toast.makeText('金额不能为空', Bestpay.Toast.LENGTH_SHORT);
                return;
            }
        }
        /*if (this.remindAcount_passWord_val == null || this.remindAcount_passWord_val.length == 0) {
            Bestpay.Toast.makeText('请输入密码', Bestpay.Toast.LENGTH_SHORT);
            return;
        }else if(this.remindAcount_passWord_val.length < 6){
            Bestpay.Toast.makeText('请输入6~12位支付密码', Bestpay.Toast.LENGTH_SHORT);
            return;
        }*/

		PasswordKeyBoard.initPwdUI3(function(val){
            self.goSetting(val);
        });
        PasswordKeyBoard.popKeyboardUI3();
    };

    OpenAnAccount.prototype.goSetting = function(val) { 
    	var self = this;
    	HTTP.getRandomServices(function(result){ //随机加密接口
            //未找到酬金结算方式，不进行酬金计算, 也当做成功了，酬金为零
            if (result.code === config.RES.SUCCESS) {
                openanaccountSelf.random = result.randNum;
            }
            //self.AutoSetTing未开通自动转入1   取消自动转入2   保留设置余额3

            if(config.man.manageM.AutoSetTing == '1'){ //未开通自动转入1
                self.pullIntoTYBNewSetting(val);//新增配置接口
            }else if(config.man.manageM.AutoSetTing == '2'){  //取消自动转入2
                self.autoColseSettingInterface(val); //关闭配置接口
            }else if(config.man.manageM.AutoSetTing == '3'){  //保留设置余额3
                self.autoRemindSettingInterface(val); //修改配置接口
            }
	        config.isBack = function(){
	            back();
	            return;
	        }
        },false);
    };

    //1.1自动转入添益宝-新增配置(MArc001)
    OpenAnAccount.prototype.pullIntoTYBNewSetting = function(val){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.AUTOTYBNEW,
            'params' : self.pullIntoTYBNewSettingParams(val),
            'showLoading' : true,
            'success' : self.pullIntoTYBNewSettingSuccessCallback
        });
    };
    /*1.1自动转入添益宝-新增配置(MArc001) 请求参数*/
    OpenAnAccount.prototype.pullIntoTYBNewSettingParams = function (val) {
        var self = this;
        var valStr = "";
        if(val != null && val != ""){
            valStr = val;
        }
        var params = {
            "actionCode":'01010145', //业务编码
            "prodCode":'00000069', //产品编码
            "amount":Lang.yuan2fen(self.remindAcount_text_val), //金额
            "payPassword":Bestpay.Security.encryptPassword(self.manageM.userInfo.staffCode,valStr,self.random)//支付密码
        };
        params = HTTP.setCPSCommonParams(params);
        console.log("自动转入添益宝-新增配置(MArc001)入参======="+JSON.stringify(params));
        return params;
    };
    //1.1自动转入添益宝-新增配置(MArc001) 成功回调函数
    OpenAnAccount.prototype.pullIntoTYBNewSettingSuccessCallback = function (result) {
        console.log("自动转入添益宝-新增配置(MArc001)出参======="+JSON.stringify(result));
        PasswordKeyBoard.hideKeyboardUI3(); //隐藏密码键盘
        if (result.code !== config.RES.SUCCESS) {
        	if(result.code == config.RES.PASSWORD_ERROR_LOCKED_002136){ //输入密码错误次数超过三次，退出app
                Bestpay.Dialog.showAlertDialog(config.TITLE.no_repeat, result.content,'确定',result.code,function(code){
                    App.exitCompleteApp();
                });
                return;
            }
            Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
            return;
        }

        Bestpay.Dialog.showAlertDialog('提醒', '已开通成功', '确定', '');
        $('#noAutoSetting').hide();//没有开通的
        $('#yeahAutoSetting').show();//有开通的
        $('#Automaticgreement').hide();
        $('#autotongYi').hide();
        $('.AutoRight').addClass('AutoRightAdd');
        //openanaccountSelf.remindAcount_passWord.clearValue(); //转入支付密码框
        //config.man.manageM.remindAcount_text.clearValue(); //金额清空
    };

    //1.2自动转入添益宝-修改配置(MArc002)
    OpenAnAccount.prototype.autoRemindSettingInterface = function(val){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.AUTOREMINDSETTING,
            'params' : self.autoRemindSettingInterfaceParams(val),
            'showLoading' : true,
            'success' : self.autoRemindSettingInterfaceSuccessCallback
        });
    };
    /*1.2自动转入添益宝-修改配置(MArc002) 请求参数*/
    OpenAnAccount.prototype.autoRemindSettingInterfaceParams = function (val) {
        var self = this;
        var valStr = "";
        if(val != null && val != ""){
            valStr = val;
        }
        var params = {
            'payPassword': Bestpay.Security.encryptPassword(self.manageM.userInfo.staffCode,valStr,self.random),//支付密码
            'amount' : Lang.yuan2fen(self.remindAcount_text_val)   //以分为单位，空表示全额转入
        };
        params = HTTP.setCPSCommonParams(params);
        console.log("1.2自动转入添益宝-修改配置(MArc002) 入参======="+JSON.stringify(params));
        return params;
    };
    //1.2自动转入添益宝-修改配置(MArc002) 成功回调函数
    OpenAnAccount.prototype.autoRemindSettingInterfaceSuccessCallback = function (result) {
        console.log("1.2自动转入添益宝-修改配置(MArc002) 出参======="+JSON.stringify(result));
        PasswordKeyBoard.hideKeyboardUI3(); //隐藏密码键盘
        if (result.code !== config.RES.SUCCESS) {
        	if(result.code == config.RES.PASSWORD_ERROR_LOCKED_002136){ //输入密码错误次数超过三次，退出app
                Bestpay.Dialog.showAlertDialog(config.TITLE.no_repeat, result.content,'确定',result.code,function(code){
                    App.exitCompleteApp();
                });
                return;
            }
            Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
            return;
        }

        Bestpay.Dialog.showAlertDialog('提醒', '保留金额设置成功', '确定', '');
        //openanaccountSelf.remindAcount_passWord.clearValue(); //转入支付密码框
       // config.man.manageM.remindAcount_text.clearValue(); //金额清空
    };

    //1.4自动转入添益宝-关闭配置(MArc004)
    OpenAnAccount.prototype.autoColseSettingInterface = function(val){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.AUTOCLOSESETTING,
            'params' : self.autoColseSettingInterfaceParams(val),
            'showLoading' : true,
            'success' : self.autoColseSettingInterfaceSuccessCallback
        });
    };
    /*1.4自动转入添益宝-关闭配置(MArc004) 请求参数*/
    OpenAnAccount.prototype.autoColseSettingInterfaceParams = function (val) {
        var self = this;
        var valStr = "";
        if(val != null && val != ""){
            valStr = val;
        }
        var params = {
            'payPassword': Bestpay.Security.encryptPassword(self.manageM.userInfo.staffCode,valStr,self.random)//支付密码
        };
        params = HTTP.setCPSCommonParams(params);
        console.log("1.4自动转入添益宝-关闭配置(MArc004) 入参======="+JSON.stringify(params));
        return params;
    };
    //1.4自动转入添益宝-关闭配置(MArc004) 成功回调函数
    OpenAnAccount.prototype.autoColseSettingInterfaceSuccessCallback = function (result) {
        console.log("1.4自动转入添益宝-关闭配置(MArc004) 出参======="+JSON.stringify(result));
        PasswordKeyBoard.hideKeyboardUI3(); //隐藏密码键盘
        if (result.code !== config.RES.SUCCESS) {
            Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
            return;
        }

        Bestpay.Dialog.showAlertDialog('提醒', '取消自动转入成功', '确定', '');
        $('#noAutoSetting').show();//没有开通的
        $('#yeahAutoSetting').hide();//有开通的
        //openanaccountSelf.remindAcount_passWord.clearValue(); //转入支付密码框
        $('#remindAcount_text').val('0');
        //config.man.manageM.remindAcount_text.clearValue(); //金额清空
        $('#Automaticgreement').show();
        $('#autotongYi').show();
        $('.AutoRight').removeClass('AutoRightAdd');
        $('#Automaticgreement').removeClass("Automatic_c_sub_bg_current");
        config.man.manageM.Automaticgreement = false;
    };
    return OpenAnAccount;
});
