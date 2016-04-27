/**
 * Created by Administrator on 2015/5/29.
 */
define(['jquery','bestpay.ui','bestpay.lang','bestpay.http'],function($,UI, Lang, HTTP) {

    var unbundSelf = null;

    function unbund () {
        unbundSelf = this;
        this.inputPassword = null;
        this.ipPassword_val = null;
        this.cardInfoJson = {};
        this.userInfo = JSON.parse(Bestpay.User.getSuccessLoginInfo());
        this.hadEpt = this.userInfo.hadEpt;////判断添益宝是否开户 0为未开户   1为开户
        this.logoList = {
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
    }

    unbund.prototype.initApp = function(){
        var self = this;
        showDialog(config.MSG.loading);
        console.log(self.userInfo);
        this.getBindingCardStatus();
        //解绑 btn click事件
        document.getElementById('btn_confirm').onclick = function () {

            if(self.hadEpt == '1'){
                Bestpay.Dialog.showAlertDialog('提醒', '已开通添益宝无法解绑', '确定', '');
                return;
            }

            PasswordKeyBoard.initPwdUI3(function(val){
                    self.confirm(val);
                });
            PasswordKeyBoard.popKeyboardUI3();
        };
    };

    /**
     * 账户绑卡查询接口
     */
    unbund.prototype.getBindingCardStatus = function(){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.ACCOUNT_BIND_CARD_STATE,
            'params' : self.bindingCardStatusParams(),
            'showLoading' : false,
            'success' : self.bindingCardStatusSuccessCallback
        });
    };

    /**
     * 账户绑卡查询接口 构造请求参数
     */
    unbund.prototype.bindingCardStatusParams = function(){
        var params = {};
        params = HTTP.setCPSCommonParams(params);
        return params;
    };

    /**
     *账户绑卡查询接口 成功回调函数
     */
    unbund.prototype.bindingCardStatusSuccessCallback = function(result){
        if (result.code !== config.RES.SUCCESS) {
        	Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
            //Bestpay.Dialog.alert(result.content + '(' + result.code + ')');
            return;
        }
        var bindStat = result.bindStat;
        if(bindStat == '1'){
            unbundSelf.getBankInfoQuery();
        }else{
            App.updateUserInfo("0"); //更新用户信息
        	Bestpay.Dialog.showAlertDialog('提醒', '未绑卡', '确定', '', function(){
            	Bestpay.App.exitApp();
        	});
            //Bestpay.Dialog.alert('未绑卡');
        }
    };

    /**
     *查询账户银行接口
     */
    unbund.prototype.getBankInfoQuery = function(){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.ACCOUNT_BANK_INFO,
            'params' : self.bankInfoQueryParams(),
            'showLoading' : false,
            'success' : self.bankInfoQuerySuccessCallback
        });
    };

    /**
     * 账户绑卡查询接口 构造请求参数
     */
    unbund.prototype.bankInfoQueryParams = function(){
        var params = {};
        params = HTTP.setCPSCommonParams(params);
        return params;
    };

    /**
     *账户绑卡查询接口 成功回调函数
     */
    unbund.prototype.bankInfoQuerySuccessCallback = function(result){
        dismissDialog();
        if (result.code !== config.RES.SUCCESS) {
        	Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
            //Bestpay.Dialog.alert(result.content + '(' + result.code + ')');
            return;
        }

        unbundSelf.cardInfoJson['bankAcctNbr'] = result.bankAcctNbr;    //卡号
        unbundSelf.cardInfoJson['bankName'] = result.bankName;          //开户银行名称
        unbundSelf.cardInfoJson['bankCode'] = result.bankCode;          //开户银行Code
        unbundSelf.cardInfoJson['bankAcctName'] = result.bankAcctName;  //开户人名称
        unbundSelf.cardInfoJson['privateflag'] = result.privateflag;
        unbundSelf.cardInfoJson['accId'] = result.accId;
        var bankNo = result.bankAcctNbr,name = result.bankAcctName;
        name = "*"+name.substring(1,name.length);
        unbundSelf.cardInfoJson['img_src'] = unbundSelf.logoList[result.bankCode];
        unbundSelf.cardInfoJson['bank_card'] = bankNo.substr(bankNo.length-4,4);
        unbundSelf.cardInfoJson['user_name'] = name;

        goTo(config.page.unbund_main,function(){
            var template = new UI.Template();
            template.template_OneToOne("id_cardInfo" ,unbundSelf.cardInfoJson);
            unbundSelf.inputPassword = new UI.InputText('pwd','password');
        });
    };

    //  触发btn click事件
    unbund.prototype.confirm = function(val){
        this.ipPassword_val = this.inputPassword.getValue();
        //if (this.ipPassword_val == null || this.ipPassword_val.length == 0) {
        //    Bestpay.Toast.makeText('请输入密码', Bestpay.Toast.LENGTH_SHORT);
        //    return;
        //}else if(this.ipPassword_val.length<6){
        //    Bestpay.Toast.makeText('请输入6~12位支付密码', Bestpay.Toast.LENGTH_SHORT);
        //    return;
        //}
        // 获取加密随机数
        HTTP.getRandomServices(function(result){
            if (result.code === config.RES.SUCCESS) {
                unbundSelf.random = result.randNum;
            }
            unbundSelf.getUnbund(val);
        },false);
    };

    /**
     *解绑银行卡接口
     */
    unbund.prototype.getUnbund = function(val){
        var self = this;
        HTTP.callCPSService({
            'service' : config.CPS.ACCOUNT_BANK_UNBUND,
            'params' : self.unbundParams(val),
            'showLoading' : true,
            'success' : self.unbundSuccessCallback
        });
    };

    /**
     * 账户绑卡查询接口 构造请求参数
     */
    unbund.prototype.unbundParams = function(val){
        var self = this;
        var params = {};
        params['payPassWord'] = Bestpay.Security.encryptPassword(self.userInfo.staffCode,val,self.random);
        params['accId'] = self.cardInfoJson.accId;
        params = HTTP.setCPSCommonParams(params);
        return params;
    };

    /**
     *账户绑卡查询接口 成功回调函数
     */
    unbund.prototype.unbundSuccessCallback = function(result){
        //隐藏键盘
        PasswordKeyBoard.hideKeyboardUI3();
        if (result.code !== config.RES.SUCCESS) {
            //Bestpay.Dialog.alert(result.content + '(' + result.code + ')');
            if(result.code == config.RES.PASSWORD_ERROR_LOCKED_002136){ //输入密码错误次数超过三次，退出app
               	Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code, function() {
                    Bestpay.App.exitCompleteApp();
               	});
            }else{ 
            	Bestpay.Dialog.showAlertDialog('提醒', result.content, '确定', result.code);
            }
            return;
        }
        Bestpay.Dialog.showAlertDialog('提醒', "您成功解绑了尾号为"+unbundSelf.cardInfoJson.bank_card+"的银行卡！", '确定', '', function() {
            App.updateUserInfo("0"); //更新用户信息
            Bestpay.App.exitApp();
        });
        //Bestpay.Dialog.alert("您成功解绑了尾号为"+unbundSelf.cardInfoJson.bank_card+"的银行卡！");
    };
    return unbund;
});