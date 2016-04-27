
define(['jquery','bestpay.ui','bestpay.lang','bestpay.http','jtemplates'],function($,UI, Lang, HTTP,jtemp) {
    var manageSelf=null;
    function $_id(id){
        return document.getElementById(id);
    };
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
    function Manage() {
        manageSelf=this;
        this.userInfo = JSON.parse(Bestpay.User.getSuccessLoginInfo());
        console.log("userInfo=="+JSON.stringify(userInfo));
        this.selectType = null;
        this.applyatoneGet = null;                   //转入是1，转出是0
        this.zhuanruApplybuy = '1';                  //1是银行卡转入   2是交费易转入
        this.zhuangchuatonefor = '1';                //1是银行卡转出   2是交费易转出
        this.questionandinformation = '1';           //1是常见问题     2是公告消息
        this.kaihuPassword = null;                   //开户支付密码 input
        this.orderPageJson = {};                     //订单页面的result
        this.agreement = false;                      //勾选协议
        this.config_togo = true;                     //切换公告时判断返回键
        this.currentPage = 1;                        //收支的页数 four
        this.shouyitwo = "0";                        //累计收益0
        this.shouzhifour = "0";                      //收支 转入0
        this.kaohu_zhuangru_immediately = '0';       //在开户那里点击立即转入按钮，返回时判断到首页
        this.Automaticgreement = false;              //  true为勾选  false为不勾选
    }
    /**
     * 初始化应用
     */
    Manage.prototype.initApp = function() { //优化内存 单独一个对象，引用到的时候才会用到，否则不会加载到内存里面
        var self = this;
        config.man.manageM = this;
        config.TRADE_LIST_QUERY_TYPE = config.BUS_TYPE.BUS_TYPE_TIANYIBAO;
        config.startPage = function(pageObj,type){ //全局判断首页与其他页，只有在goto和back的时候执行
            if(type == 'goto'){
                if(pageObj.id == 'page_main_first'){
                    console.log('显示CCCC');
                    App.setpopWindwonVisible();//在首页时显示标题导航条右上角的按钮
                } else {
                    console.log('不显示CCCC');
                    App.setpopWindwonGone();//非首页时不显示标题导航条右上角的按钮
                }
            } else if(type == 'back') {
                if(pageStack.length >=2 && pageStack[pageStack.length - 2].id !=null && pageStack[pageStack.length - 2].id !='' &&pageStack[pageStack.length - 2].id == 'page_main_first'){
                    console.log('back显示CCCC');
                    App.setpopWindwonVisible();//在首页时显示标题导航条右上角的按钮
                }
            }
        };
        config.otherEvent = function(type) {
            if(type == "status"){
                if(config.page.id_shouzhifour_show.prompt_show_back == false){
                    back();
                }
                if(pageStack[pageStack.length - 1].id != 'page_service_center'){
                    config.man.manageMOpenAnAccount.anountcementisBack = 0;
                    config.man.otherInterfaces.financialProblemQuery();//常见问题和公告消息
                }
            } else if(type == "status_newtianyibao"){
                console.log('status_newtianyibaoABC');
                config.man.manageMOpenAnAccount.RefreshaccountInformationInterface();//企业理财账户信息接口(SEpt006)  //跳到添益宝首页
            } else if(type == "balanceAutomaticallyTransferred"){ //余额自动转入按钮，原生调的方法
                console.log('isBack = accountAutomaticTurnIn');
                config.man.manageMOpenAnAccount.accountAutomaticTurnIn();
            }else if(type == "transactionQuery"){ //交易查询008，原生调的方法
                console.log('isBack = transactionQuery'); //收支界面  3.12企业理财收支查询接口(SEpt008)
                config.man.otherInterfaces.financialRevenueAndExpenditureinterface();
            }else if(type == "questionAndHelp"){ // 问题与公告，原生调的方法
                console.log('isBack = questionAndHelp');
                if(config.page.id_shouzhifour_show.prompt_show_back == false){
                    back();
                }
                if(pageStack[pageStack.length - 1].id != 'page_service_center'){
                    config.man.manageMOpenAnAccount.anountcementisBack = 0;
                    config.man.otherInterfaces.financialProblemQuery();//常见问题和公告消息
                }
            }
        };
        /**
         * status : // 问题与帮助，原生调的方法（无用）
         * status_newtianyibao : 点击添益宝tab键时，调006的接口
         * balanceAutomaticallyTransferred : 余额自动转入按钮，原生调的方法
         * transactionQuery : 交易查询008，原生调的方法
         * questionAndHelp : 问题与帮助，原生调的方法
         */

        //config.isBackStatus = function(type) {
        //    if(config.page.id_shouzhifour_show.prompt_show_back == false){
        //        back();
        //    }
        //    if(pageStack[pageStack.length - 1].id != 'page_service_center'){
        //         config.man.manageMOpenAnAccount.anountcementisBack = 0;
        //         config.man.otherInterfaces.financialProblemQuery();//常见问题和公告消息
        //    }
        //};
        //config.isBack_newtianyibao = function(type){
        //    config.man.manageMOpenAnAccount.RefreshaccountInformationInterface();//企业理财账户信息接口(SEpt006)  //跳到添益宝首页
        //    console.log('isBack_newtianyibaosdfghjklkjhgfds3456789098ABC');
        //};



//        config.isBack_AutomaticallyTransferred = function(type){//余额自动转入
//            console.log('isBack = accountAutomaticTurnIn');
//            config.man.manageMOpenAnAccount.accountAutomaticTurnIn();
//        };
//        config.isBack_transactionQuery = function(type){//收支界面  3.12企业理财收支查询接口(SEpt008)
//            console.log('isBack = transactionQuery');
//            config.man.otherInterfaces.financialRevenueAndExpenditureinterface();
//        };
//        config.isBack_questionAndHelp = function(type){//问题与帮助，原生调的方法
//            console.log('isBack = questionAndHelp');
//            if(config.page.id_shouzhifour_show.prompt_show_back == false){
//                back();
//            }
//            if(pageStack[pageStack.length - 1].id != 'page_service_center'){
//                config.man.manageMOpenAnAccount.anountcementisBack = 0;
//                config.man.otherInterfaces.financialProblemQuery();//常见问题和公告消息
//            }
//        };


        config.isBack = function() {
            Bestpay.App.jumpToMain();
        };
        self.recomand = new UI.InputText('recomand',null); //推荐人
        self.zhuanru_money_text = new UI.InputText('zhuanru_money_text','number',null,function(){
            config.man.otherInterfaces.zhuanru_money_text_val = "";
            $('#jy_btn_show').addClass("cont_btn_gray").removeClass("cont_btn_blue");
            manageSelf.textT(".bank_span","");
        },2);//转入输入金额
        self.zhuanchu_money_text = new UI.InputText('zhuanchu_money_text','number',null,function(){
            config.man.otherInterfaces.zhuanchu_money_text_val = "";
            $('#jf_btn_show').addClass("cont_btn_gray").removeClass("cont_btn_blue");
            manageSelf.textT(".bank_span","");
        },2);//转出输入金额
        self.remindAcount_text = new UI.InputText('remindAcount_text','number',null,function(){
            config.man.manageMOpenAnAccount.remindAcount_text_val = "";
           //$('#jy_btn_show').addClass("cont_btn_gray").removeClass("cont_btn_blue");
            manageSelf.textT(".bank_span","");
        },2);//自动转入的输入金额

        var selectCallBack=function(args){
                self.zhuanruApplybuy = args;
                self.zhuanru_money_text.clearValue(); //转入输入金额框清空
                config.man.otherInterfaces.zhuanru_money_text_val = ""; //转入输入金额框清空文本框
        //        config.man.otherInterfaces.zhuanru_passWord.clearValue(); //转出支付密码框
              //  config.man.zhuanru_passWord_val = '';// 支付密码文本框清空
            $('#jy_btn_show').addClass("cont_btn_gray").removeClass("cont_btn_blue");
                self.textT(".bank_span","");
                config.man.otherInterfaces.comparefour();
            if(self.zhuanruApplybuy*1 == 1){
                $("#help_cont_ZU1").show();
                $("#help_cont_ZU2").hide();
                self.bindCardZhuanru(); //判断是否绑卡转入
            }else{
                $("#help_cont_ZU1").hide();
                $("#help_cont_ZU2").show();
                $("#jy_btn_show").show(); //确认按钮
                $("#input-wrap_zru_wrap").show(); //金额文本框
                $('#rumaxAmount').show();//该卡最多可转入的span
                config.man.otherInterfaces.WorkDayAndWorkWeekShow();//预计收益到账时间
                $('#zhuanruWorkDayAndWorkWeek').show(); //转入的输入密码框与收益时间显示
            }
        };
        var selectCallBack_chu=function(args){
            self.zhuangchuatonefor = args;
            self.zhuanchu_money_text.clearValue(); //转出输入金额框清空
            config.man.otherInterfaces.zhuanchu_money_text_val = "";//转出输入金额框清空文本框
            //config.man.otherInterfaces.zhuangchu_password.clearValue(); //转出支付密码框
            //config.man.zhuangchu_password_val = '';// 支付密码文本框清空
            $('#jf_btn_show').addClass("cont_btn_gray").removeClass("cont_btn_blue");
            self.textT(".bank_span","");
            config.man.otherInterfaces.compareZhuangCHU();
            if(self.zhuangchuatonefor*1 == 1){
                $("#help_cont_CHU1").show();
                $("#help_cont_CHU2").hide();
                self.bindCardZhuanchu();//判断是否绑卡转出
            }else{
                $("#help_cont_CHU1").hide();
                $("#help_cont_CHU2").show();
                $("#input-wrap_zchu_wrap").show(); //金额输入框
                $("#jf_btn_show").show(); //转出按钮
                $('#chumaxAmount').show(); //该卡最多可转出
                $('.rmaxbank_span').show();  //转出最大笔数
                $('#zhuanchuPayPassword').show();//转出切换框中的支付密码框
                $("#shuhui_tips").html("即时到账");
            }
        };
        self.selectType = new UI.BlockRadioGroup('brg_amount', 'item10',selectCallBack);
        self.selectType_chu = new UI.BlockRadioGroup('brg_amount_chu', 'item10_chu',selectCallBack_chu);
        var selectCallBack_question = function(args){
            self.questionandinformation = args;
            if(self.questionandinformation*1 == 1){
                $('#changjian_question').show();
                $('#gongkao_information').hide();
                if(self.config_togo == true){
                    config.isBack = function() {
                        console.log(self.questionandinformation + '111===questionandinformation');
                        console.log(self.config_togo + '111====config_togo');
                        $('#id_optionsBoxLeft').show();
                        $('#id_optionsBoxRight').hide();
                        $('#brg_amount_question').show();
                    };
                }
            }else{
                $('#changjian_question').hide();
                console.log(config.man.manageMOpenAnAccount.nullgonggao + 'config.man.manageMOpenAnAccount.nullgonggao');
                if(config.man.manageMOpenAnAccount.nullgonggao == 1){
                    $('#gongkao_information').show();
                }else{
                    $('#gongkao_information').hide();
                }

                config.isBack = function(){
                    if(self.config_togo == true){
                        console.log(self.questionandinformation + '222===questionandinformation');
                        console.log(self.config_togo + '222====config_togo');
                        back();
                        $('#id_optionsBoxLeft').show();
                        $('#id_optionsBoxRight').hide();
                        $('#brg_amount_question').show();
                    }else{
                        back();
                    }

                }
            }
        }
        self.selectType_question = new UI.BlockRadioGroup('brg_amount_question', 'item10_question',selectCallBack_question);
        self.btnInit();
        require(['manageMOpenAnAccount','otherInterfaces'], function (manageMOpenAnAccount,otherInterfaces) {
            config.man.manageMOpenAnAccount = new manageMOpenAnAccount();
            config.man.otherInterfaces = new otherInterfaces();
            config.man.manageMOpenAnAccount.authenStatusA02();
        });


    };
    Manage.prototype.textT = function(id,text){
        $(id).html(text);
    };
   //  按钮onclick事件初始化
    Manage.prototype.btnInit = function(){
        var self = this;
        $('#refreshxxx').on('click',function(){
            location.reload();
        });
        $("#agreement").on('click',function(){
            $('#agreement').toggleClass("c_sub_bg_current");
            $(".cont_A").toggleClass("hide");
            $(".cont_B").toggleClass("show");
            if($('#agreement').is('.c_sub_bg_current')){
                self.agreement = "1";
            }else{
                self.agreement = "0";
            }
        });
        $("#Automaticgreement").on('click',function(){
            $('#Automaticgreement').toggleClass("Automatic_c_sub_bg_current");
//            $(".cont_A").toggleClass("hide");
//            $(".cont_B").toggleClass("show");
            if($('#Automaticgreement').is('.Automatic_c_sub_bg_current')){
                self.Automaticgreement = true;  //Automaticgreement   true为勾选  false为不勾选
            }else{
                self.Automaticgreement = false;
            }
        });

        $_id("business_record").onclick=function(){//《添益宝业务（企业版）服务声明》
                                //显示的ID      隐藏的id     隐藏的id     调用的文件
            self.agreement_info('page_record','page_know','page_fuwu','page_Automatic','file/tyb.html');
        };
        $_id("business_know").onclick=function(){//证券投资基金投资人权益须知
            self.agreement_info('page_know','page_record','page_fuwu','page_Automatic','file/jjxy.html');
        };
        $_id("business_fuwu").onclick=function(){//基金直销电子交易服务协议
            self.agreement_info('page_fuwu','page_record','page_know','page_Automatic','file/zjtz.html');
        };
        $_id("fat_btn").onclick=function(){
            back();
        };
        $('.business_Automatic').on('click',function(){
            //显示的ID      隐藏的id     隐藏的id     调用的文件
            self.agreement_info('page_Automatic','page_record','page_know','page_fuwu','file/automatic.html');
        })

        $_id('kaitong').onclick = function () {  //点击申请开户页面按钮
            //A00认证中，A01未认证，A02已认证，A99认证失败 A03待生效
            if (self.userInfo.authenStatus == 'A02') {
                config.man.manageMOpenAnAccount.informationVerification();  //3.3企业理财信息校验接口(MEpt010)
            }
            else {
                goTo(config.page.kaotongfloat); //认证
                $('#mask_id').show();
                document.getElementById("kai_authrity").onclick = function () {
                    App.jumpToRecertify();//跳转认证的入口
                   //$('#mask_id').hide();
                    return;
                };
                document.getElementById("kai_cancel").onclick = function () {
                    Bestpay.App.jumpToMain();   //退出大厅
                    //$('#mask_id').hide();
                    return;
                };

            }

        };
        $_id("info_confirm").onclick=function(){  //预校验开户信息页面按钮
            config.man.manageMOpenAnAccount.gotoOpen();  //点击确认开通;密码校验
        };
        $_id('open_sure').onclick = function () {  //开通成功的页面按钮
              location.reload();
        };
        $_id('open_sure_zhuangru').onclick = function(){  //开通成功的立即转入按钮,
            manageSelf.applyatoneGet = '1';
            manageSelf.kaohu_zhuangru_immediately = '1';
            showDialog();
            $('#jy_btn_show').addClass("cont_btn_gray").removeClass("cont_btn_blue");
            self.bindCardZhuanru(); //
            config.man.otherInterfaces.accountBankInfo();//获取银行卡信息接口
        }
        $_id('change_over_to').onclick = function () {  //点击转入按钮
            showDialog();
            config.TRADE_LIST_QUERY_NUMBER = '1'; //1是申购 2是赎回
            manageSelf.applyatoneGet = '1';
            manageSelf.kaohu_zhuangru_immediately = '0';
            $('#jy_btn_show').addClass("cont_btn_gray").removeClass("cont_btn_blue");
            self.bindCardZhuanru(); //
             config.man.otherInterfaces.accountBankInfo();//获取银行卡信息接口
        };
        $_id('goahead_getmoney').onclick = function(){   //累计收益页面的开始赚钱吧按钮,跳到转入页面
            manageSelf.applyatoneGet = '1';
            showDialog();
            $('#jy_btn_show').addClass("cont_btn_gray").removeClass("cont_btn_blue");
            self.bindCardZhuanru(); //
             config.man.otherInterfaces.accountBankInfo();//获取银行卡信息接口
        };
        $_id('goahead_getmoney_shouzhifour').onclick = function(){   //转入收支页面的立即体验按钮,跳到转入页面
            manageSelf.applyatoneGet = '1';
            showDialog();
            $('#jy_btn_show').addClass("cont_btn_gray").removeClass("cont_btn_blue");
            self.bindCardZhuanru(); //
            config.man.otherInterfaces.accountBankInfo();//获取银行卡信息接口
        };

        $_id('roll_out').onclick = function () {  //点击转出按钮
            manageSelf.applyatoneGet = '0';
            config.TRADE_LIST_QUERY_NUMBER = '2'; //1是申购 2是赎回
            showDialog();
            $('#jf_btn_show').addClass("cont_btn_gray").removeClass("cont_btn_blue");
            self.bindCardZhuanchu();//判断是否绑卡转出
             config.man.otherInterfaces.accountBankInfo();//获取银行卡信息接口
        };
        $_id('pay_easy_show').onclick = function(){ //跳到转入的支付密码页面
            if(config.man.otherInterfaces.zhuangru_true == true){
                PasswordKeyBoard.initPwdUI3(function(val){
                    config.man.otherInterfaces.getapplyforBuySecretInterface(val); //转入支付密码页面初始化
                });
                PasswordKeyBoard.popKeyboardUI3();
            }
        };
//        $_id('pay_soon').onclick = function(){ // 跳到转入的支付成功页面
//            config.man.otherInterfaces.getapplyforBuySuccess(); //跳到转入的支付成功页面
//        };
        $_id('zhuangrusuccess_sure').onclick = function(){ // 转入成功跳到首页
            location.reload();
        };
        $_id('roll_out_jfy').onclick = function(){ //跳到转出的支付页面
            if(config.man.otherInterfaces.zhuangchu_true == true){
                PasswordKeyBoard.initPwdUI3(function(val){
                    config.man.otherInterfaces.getatoneForSecretInterface(val); //转出支付页面初始化
                });
                PasswordKeyBoard.popKeyboardUI3();
            }
        };
//        $_id('roll_out_soon_jfy').onclick = function(){ // 跳到转出的支付成功页面
//            config.man.otherInterfaces.getatoneForSuccess(); //跳到转出的支付成功页面
//        };
        $_id('roll_out_make_sure').onclick = function(){ // 转出成功跳到首页
            location.reload();
        };
        $_id('announcement').onclick = function(){    //点击首页的第一条公告按钮
            config.man.manageMOpenAnAccount.anountcement();
        };
        $_id('btn_shouzhifour_down').onclick=function(){//收支四排
            goTo(config.page.id_shouzhifour_show);
            var dropDown_loanMoney = {
                    '转入' :'0',
                    '转出' : '1',
                    '消费' : '2',
                    '收益' : '3',
                    '自动转入' : '7'
            };
            config.page.id_shouzhifour_show.prompt_show_back = false;
            var flatFeeBox = new UI.dropDownBox('page_id_shouzhifour_show',
                this, dropDown_loanMoney,function(item, itemObj){
                    flatFeeBox.hideDropDownBox();
                    self.shouzhifourHTMl=$(itemObj).html();
                    self.shouzhifour = item;
                    $("#btn_shouzhifour_down #zr_span").html(self.shouzhifourHTMl);
                    self.currentPage = 1;//页数为1
                    $("#time_date").empty();
                    $("#change_type").empty();
                    $("#money_balance").empty();
                    $("#type_type").empty();

                    $("#check_text_shouzhi").hide();//时间 操作 金额 状态
                    $(".page_current").hide();//点击更多按钮
                    $('#shouzhi_null_text').hide(); //出现立即体验的按钮
                    $('#shouyi_null_text').hide();  //出现 暂无收益记录 文本
                    config.man.otherInterfaces.financialRevenueAndExpenditureQuery();  //3.12企业理财收支查询接口(SEpt008)
                    back();
                    config.page.id_shouzhifour_show.prompt_show_back = true;
                },function(){
                    flatFeeBox.hideDropDownBox();
                    back();
                    config.page.id_shouzhifour_show.prompt_show_back = true;
                });
        };
        $_id('id_shouyitwo_down').onclick=function(){//收益双排
            goTo(config.page.id_shouyitwo_show);
            var dropDown_loanMoney = {
                '累计收益' :'0',
                '近一周收益' : '1',
                '万份收益' : '2',
                '七日年化收益率' : '3'
            };
            config.page.id_shouzhifour_show.prompt_show_back = false;
            var flatFeeBox = new UI.dropDownBox('page_id_shouyitwo_show',
                this, dropDown_loanMoney,function(item, itemObj){
                    flatFeeBox.hideDropDownBox();
                    self.shouyitwoHTMl=$(itemObj).html();
                    self.shouyitwo=item;
                    $("#id_shouyitwo_down #lj_span").html(self.shouyitwoHTMl);
                    if(self.shouyitwo == 2 || self.shouyitwo == 3){
                        $("#get_money").hide();
                        $('#Noget_leiji_page').hide();
                        config.man.otherInterfaces.millionCopiesOfRevenue();  //3.15企业理财万份收益和七日年转化率(SEpt014)
                    }else{
                        if(self.shouyitwo == 0){
                            $('#leijyId').text('累计收益(元)');
                        }else if(self.shouyitwo == 1){
                            $('#leijyId').text('近一周收益(元)');
                        }
                        $("#get_money").hide();
                        $('#Noget_leiji_page').hide();
                        config.man.otherInterfaces.financialIncomeQuery();  //3.11企业理财收益查询接口(SEpt007)
                    }
                    back();
                    config.page.id_shouzhifour_show.prompt_show_back = true;
                },function(){
                    flatFeeBox.hideDropDownBox();
                    back();
                    config.page.id_shouzhifour_show.prompt_show_back = true;
                });
        };
        //收支更多按钮
        $("#page_current_A").on('click',function(){
            self.currentPage ++ ;
            config.man.otherInterfaces.financialRevenueAndExpenditureQuery();  //3.12企业理财收支查询接口(SEpt008)
        });
        //手指按向按钮
        var cont_btn=$(".cont_btn a,.cont_a_btn a");
        cont_btn.on("touchstart",function(){
            $(this).addClass("cont_hover");
        });
        cont_btn.on("touchend touchmove touchcancel",function(){
            $(this).removeClass("cont_hover");
        });
        document.getElementById('netword_failure_img').onclick = function(){
            console.log('netword_failure_img==ABC==failure');
            location.reload();
            ///config.man.manageMOpenAnAccount.accountInformationInterface();   //企业理财账户信息接口(SEpt006)  //在网络失败，调不进来接口的时候重新刷新
            console.log('netword_failure_img==ABC==failure1234567');
        };
        document.getElementById('contactCustome').onclick = function(){
            App.jumpToCustomerService();
        };
        $('.skillbar').each(function(){
            $(this).find('.skill-right').animate({
                width:$(this).attr('data-percent')
            },1000);
        });
        $('#AddAutomaticBtn').on('click',function(){  //自动转入的按钮
            self.AutoSetTing = '1'; //self.AutoSetTing未开通自动转入1   取消自动转入2   保留设置余额3
            config.man.manageMOpenAnAccount.AutomaticBtnInformation(); //判断自动转入的信息
        });
        $('#cancelautoTurnIn').on('click',function(){ //取消自动转入的按钮
            self.AutoSetTing = '2'; //取消自动转入
            config.man.manageMOpenAnAccount.AutomaticBtnInformation(); //判断自动转入的信息
        });
        $('#remindSettingAccount').on('click',function(){  //保留设置余额按钮
            self.AutoSetTing = '3'; //保留设置余额
            config.man.manageMOpenAnAccount.AutomaticBtnInformation(); //判断自动转入的信息
        })
    };
    //协议的方法
    Manage.prototype.agreement_info = function(id,id_inner1,id_inner2,id_inner3,subfolder){
        goTo(config.page.record_father);//跳到协议界面
        var billListElt = $_id(id);  //显示的ID
        billListElt.innerHTML = "";
        $_id(id_inner1).innerHTML="";//隐藏的ID
        $_id(id_inner2).innerHTML="";//隐藏的ID
        $_id(id_inner3).innerHTML="";//隐藏的ID
        var bill_item_container = $(billListElt).setTemplateURL(subfolder);
        bill_item_container.processTemplate(null);
    };
    //判断是否绑卡信息   银行卡转入
    Manage.prototype.bindCardZhuanru = function(){
        var bindCard = manageSelf.userInfo['bindCard'];
        if(bindCard == "0")//0是未绑卡
        {
            $("#binding_none").show();  //未绑卡页面
            $("#zhuangru").hide();  //银行卡转入页面
            $("#jy_btn_show").hide(); //确认按钮
            $("#input-wrap_zru_wrap").hide(); //金额文本框
            $('#rumaxAmount').hide();//该卡最多可转入的span
            $('#zhuanruWorkDayAndWorkWeek').hide(); //转入的输入密码框与收益时间显示
            $_id("bind_soon").onclick=function()
            {
                App.jumpToBindCard(function(result) {
                    if (result == "0") {
                        manageSelf.userInfo = JSON.parse(Bestpay.User.getSuccessLoginInfo());
                        bindCard = manageSelf.userInfo['bindCard'];
                        if (bindCard == "1"){//1是绑上成功
                            $("#binding_none").hide();
                            $("#zhuangru").show();  //银行卡转入页面
                            $("#jy_btn_show").show(); //确认按钮
                            $('#rumaxAmount').show();//该卡最多可转入的span
                            $("#input-wrap_zru_wrap").show(); //金额文本框
                            $('#zhuanruWorkDayAndWorkWeek').show(); //转入的输入密码框与收益时间显示
                            config.man.otherInterfaces.WorkDayAndWorkWeekShow();//预计收益到账时间
                            config.man.otherInterfaces.accountBankInfo();//获取银行卡信息接口
                        }
                    }
                })
            };
        }else if(bindCard=="1"){//1是绑卡成功
            $("#binding_none").hide();
            $("#zhuangru").show();  //银行卡转入页面
            $("#jy_btn_show").show(); //确认按钮
            $('#rumaxAmount').show();//该卡最多可转入的span
            $('#zhuanruWorkDayAndWorkWeek').show(); //转入的输入密码框与收益时间显示
            config.man.otherInterfaces.WorkDayAndWorkWeekShow();//预计收益到账时间
            $("#input-wrap_zru_wrap").show(); //金额文本框
        }
    };
    //判断是否绑卡信息   银行卡转出
    Manage.prototype.bindCardZhuanchu = function(){
        var self = this;
        var bindCard = manageSelf.userInfo['bindCard'];
        if(bindCard=="0"){//0是未绑卡
            $("#binding_none_rollout").show();  //未绑卡页面
            $("#zhuangchu").hide();  //银行卡转入页面
            $("#input-wrap_zchu_wrap").hide(); //金额输入框
            $("#jf_btn_show").hide(); //转入按钮
            $('#chumaxAmount').hide(); //该卡最多可转出
            $('.rmaxbank_span').hide();  //转出最大笔数
            $('#zhuanchuPayPassword').hide();//转出切换框中的支付密码框
            $_id("bind_soon_rollout").onclick=function(){
                App.jumpToBindCard(function(result) {
                    if (result == "0") {
                        manageSelf.userInfo = JSON.parse(Bestpay.User.getSuccessLoginInfo());
                        bindCard = manageSelf.userInfo['bindCard'];
                        if (bindCard == "1"){//1是绑上成功
                            $("#binding_none_rollout").hide();  //未绑卡页面
                            $("#zhuangchu").show();  //银行卡转出页面
                            $("#input-wrap_zchu_wrap").show(); //金额输入框
                            $("#jf_btn_show").show();
                            $('#chumaxAmount').show(); //该卡最多可转出
                            $('.rmaxbank_span').show();  //转出最大笔数
                            config.man.otherInterfaces.accountBankInfo();//获取银行卡信息接口
                            $('#zhuanchuPayPassword').show();//转出切换框中的支付密码框
                            $("#shuhui_tips").html('预计到账时间 ' + '<span class="orange">' + Date_FinancialRedemption() + '</span>');
                        }
                    }
                })
            }
        }
        else if(bindCard == "1"){//1是绑上成功
            $("#binding_none_rollout").hide();  //未绑卡页面
            $("#zhuangchu").show();  //银行卡转出页面
            $("#input-wrap_zchu_wrap").show(); //金额输入框
            $("#jf_btn_show").show(); //转出按钮
            $('#chumaxAmount').show(); //该卡最多可转出
            $('.rmaxbank_span').show();  //转出最大笔数
            $('#zhuanchuPayPassword').show();//转出切换框中的支付密码框
            $("#shuhui_tips").html('预计到账时间 ' + '<span class="orange">' + Date_FinancialRedemption() + '</span>');
        }
    };
    $("#input-wrap_zru_wrap").after("<span class='bank_span'></span>");//转入的金额文本框
    $("#input-wrap_zchu_wrap").after("<span class='bank_span'></span>");//转出的金额文本框
    $("#input-wrap_zchu_wrap").before("<span class='rmaxbank_span maxAmountParent'></span>");//笔数的金额文本框

    //显示公告
    Manage.prototype.percenthundred = function(){
        var sunFun = setInterval(function(){
           $("#first_anouncement").hide();
        },10000);
    };

    return Manage;
});