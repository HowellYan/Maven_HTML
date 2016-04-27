define(["jquery","bestpay.ui","bestpay.lang","bestpay.http"],function(a,d,f,c){var e=null;function b(){e=this;this.userInfo=JSON.parse(Bestpay.User.getSuccessLoginInfo());this.selectType=null;this.selectAmount=null;this.trafficType="电信话费充值卡";this.mTxnAmount="5000";this.orderPageJson={};this.successJson={};this.infProdCode="1001";this.infActionCode=config.BUS_CODE.ELE_CARD;this.payType="0";this.checkBillCheck=false;this.prepaidRechargeData={};this.productId="0030001";this.defferred=null;this.selectValue="1";this.idAcountItem="50";this.businessName="翼支付卡"}b.prototype.initApp=function(){config.TRADE_LIST_QUERY_TYPE=config.BUS_TYPE.BUS_TYPE_BESTPAY_CARD;var g=this;var h=function(i){console.log(i);console.log(JSON.stringify(i));g.selectValue=i;if(g.selectValue=="1"){a("#textTitleLeft").text("翼支付充值卡");a("#yingzhifuWarm").show();a("#huafeiWarm").hide();config.TRADE_LIST_QUERY_TYPE=config.BUS_TYPE.BUS_TYPE_BESTPAY_CARD;g.businessName="翼支付卡"}else{a("#textTitleLeft").text("电信话费充值卡");a("#yingzhifuWarm").hide();a("#huafeiWarm").show();config.TRADE_LIST_QUERY_TYPE=config.BUS_TYPE.BUS_TYPE_TEL_CARD;g.businessName="话费卡"}a("#AccountSpan").html("50元");g.idAcountHtml="50元";g.idAcountItem="50";console.log("self.selectValue = "+g.selectValue);console.log("textTitleLeft.text = "+a("#textTitleLeft").text())};goTo(config.page.main,function(){g.selectAmount=new d.BlockRadioGroup("brg_amount","item10",h);g.itMobile=new d.InputText("mobile","mobile");g.btnInit()})};b.prototype.btnInit=function(){var g=this;document.getElementById("btn_next").onclick=function(){g.checkBillCheck=false;g.validation()};document.getElementById("btn_Account_down").onclick=function(){goTo(config.page.id_Acount);console.log("self.selectValue = "+g.selectValue);var i={};if(g.selectValue=="1"){i={"10":"10","30":"30","50":"50","100":"100","300":"300"}}else{i={"30":"30","50":"50","100":"100"}}var h=new d.dropDownBox("page_id_Acount",this,i,function(k,j){h.hideDropDownBox();g.idAcountHtml=a(j).html();g.idAcountItem=k;a("#AccountSpan").html(g.idAcountHtml+"元");back()},function(){h.hideDropDownBox();back()})}};b.prototype.validation=function(){var g=this;this.mobile_val=this.itMobile.getToEmptyValue();if(this.mobile_val.length==""){Bestpay.Toast.makeText("请输入顾客手机号码",Bestpay.Toast.LENGTH_SHORT);return}else{if(this.mobile_val.length>=1&&this.mobile_val.length<11){Bestpay.Toast.makeText("请输入11位的顾客手机号码",Bestpay.Toast.LENGTH_SHORT);return}else{if(this.mobile_val.length==11&&!this.itMobile.getInputCheck()){Bestpay.Toast.makeText("您输入的手机号号码段不正确",Bestpay.Toast.LENGTH_SHORT);return}}}g.mTxnAmount=f.yuan2fen(g.idAcountItem);console.log("this.mobile_val = "+this.mobile_val);console.log("self.mTxnAmount = "+g.mTxnAmount);g.itJudgeLocalStorage=new d.JudgeLocalStorage();g.itJudgeLocalStorage.checkOrder(g.mobile_val,g.idAcountItem*1,c.getCurrentTime(),function(){g.queryStart();g.callQuickTradingQuery();g.defferred.done(g.goPayAnimation)},g.businessName)};b.prototype.queryStart=function(){var g=this;g.defferred=a.Deferred();showDialog()};b.prototype.queryEnd=function(){var g=this;g.textTitleLeft=a("#textTitleLeft").text();var h={businessName:g.businessName,accountName:"卡券购买",accouontValue:g.mobile_val,rechargeMoney:f.fen2yuan(g.mTxnAmount),rewardMoney:g.orderPageJson.reward,jfyBalance:g.orderPageJson.jfy_amount,tybBalance:g.orderPageJson.tyb_amount,enablePassword:g.noPwd,userInfo:g.userInfo,callback:g.gotoOrder};console.log("pluginParam = "+JSON.stringify(h));g.paymentPlugin=new d.paymentPlugin(h);dismissDialog();goTo(config.page.comfirm,function(){});g.defferred.resolve()};b.prototype.goPayAnimation=function(){console.log("done=========================");a("#order_comfirm").removeClass("backPayAnimation").addClass("goPayAnimation")};b.prototype.gotoOrder=function(g){c.getRandomServices(function(i){var h=i;if(i.code===config.RES.SUCCESS){e.random=i.randNum}if(e.selectValue=="1"){e.rechargeResp(g)}else{e.rechargeRespTCard(g)}},false)};b.prototype.callQuickTradingQuery=function(){var g=this;c.callCPSService({service:config.CPS.QUICK_TRADING_QUERY,params:g.quickTradingQueryParams(),showLoading:false,success:g.quickTradingQuerySuccessCallback})};b.prototype.quickTradingQueryParams=function(){var g=this;var h={};h=c.setCPSCommonParams(h);return h};b.prototype.quickTradingQuerySuccessCallback=function(g){if(g.code!==config.RES.SUCCESS){Bestpay.Dialog.showAlertDialog(config.TITLE.dialog_title,g.content,"确定",g.code);return}e.getPremium();e.quickTranInfo={perAmount:g.perAmount,allamount:g.allamount,alltransaction:g.alltransaction}};b.prototype.getPremium=function(){var g=this;c.getPremium(g.mTxnAmount,g.infActionCode,g.infProdCode,function(h){if(h.code!==config.RES.SUCCESS){Bestpay.Dialog.showAlertDialog(config.TITLE.dialog_title,h.content,"确定",h.code);return}e.orderPageJson.retFaceAmount=h.amount;e.orderPageJson.retPremium=h.concession;e.orderPageJson.account_amount_val=f.fen2yuan(h.amount*1+h.concession*1);e.handleIsneedpassword()},false)};b.prototype.getCommission=function(){var g=this;c.getCommission(config.BUS_TYPE.BUS_TYPE_TEL_CARD_TELECOM,config.BUS_CODE.ELE_CARD,config.BUS_CODE.ELE_CARD,(g.mTxnAmount*1)/100,function(i){var h=i;if(h.code!==config.RES.SUCCESS){console.log(h.content+"("+h.code+")")}if(i.code===config.RES.SUCCESS){h.commission=f.fen2yuan(i.reward)}else{if(i.code===config.CODE.COMMOSSION_ERROR){h.code=config.RES.SUCCESS;h.commission="0.00"}else{h.code=config.RES.UNKNOWN_ERROR;h.content=config.RES.UNKNOWN_ERROR_MSG}}e.orderPageJson.reward=h.commission;e.queryEnd()},false)};b.prototype.rechargeResp=function(h){var g=this;c.callCPSService({service:config.CPS.ELECTRONIC_SELL_CARD,params:g.rechargeParams(h),showLoading:true,success:g.rechargeSuccessCallback})};b.prototype.rechargeParams=function(h){var i=this;var j="";if(h!=null&&h!=""){j=h}var g={orderNo:c.getOrderSeq(),cardAmount:i.mTxnAmount,cardTypeCode:"2004",payType:"0",payPassword:Bestpay.Security.encryptPassword(i.userInfo.staffCode,j,i.random),tradeTime:f.getDate_YYYYMMDD()+""+f.getTime_HHMMSS(),phone:i.mobile_val};if(i.userInfo.hadEpt.toString()=="1"){g.costWay=i.paymentPlugin.getPayType();g.productId=i.productId;g.userId=i.orderPageJson.userId}g=c.setCPSCommonParams(g);return g};b.prototype.rechargeSuccessCallback=function(g){dismissDialog();PasswordKeyBoard.hideKeyboardUI3();if(g.code!==config.RES.SUCCESS){if(g.code===config.RES.MONEY_NOT_ENOUGH){Bestpay.Dialog.showAlertDialog(config.TITLE.no_repeat,config.RES.MONEY_NOT_ENOUGH_MSG,"确定",g.code,function(){e.itJudgeLocalStorage.putLocalValue("","","","")});return}if(g.code=="009002"||g.code=="006751"){console.log("in-------------------");e.paymentPlugin.setOrderDisplay("overtime");goTo(config.page.float_dia);return}if(g.code==config.RES.PASSWORD_ERROR_LOCKED_002136){Bestpay.Dialog.showAlertDialog(config.TITLE.no_repeat,g.content,"确定",g.code,function(h){App.exitCompleteApp();e.itJudgeLocalStorage.putLocalValue("","","","")})}Bestpay.Dialog.showAlertDialog(config.TITLE.dialog_title,g.content,"确定",g.code,function(){e.itJudgeLocalStorage.putLocalValue("","","","")});return}e.itJudgeLocalStorage.putLocalValue("","","","");c.sendSmsCertificate(g.transSeq,e.mobile_val,"");e.paymentPlugin.setOrderDisplay("success");goTo(config.page.float_dia);config.isBack=function(){if(window.jqXHR.readyState>2){Bestpay.App.exitApp()}}};b.prototype.rechargeRespTCard=function(h){var g=this;c.callCPSService({service:config.CPS.ELECTRONIC_SELL_CARD,params:g.rechargeRespTCardParams(h),showLoading:true,success:g.rechargeRespTCardSuccessCallback,error:g.rechargeRespTCardErrorCallback})};b.prototype.rechargeRespTCardParams=function(h){var i=this;var j="";if(h!=null&&h!=""){j=h}var g={orderNo:c.getOrderSeq(),payPassword:Bestpay.Security.encryptPassword(i.userInfo.staffCode,j,i.random),payType:"0",cardAmount:i.mTxnAmount,cardTypeCode:i.infProdCode,tradeTime:f.getDate_YYYYMMDD()+""+f.getTime_HHMMSS(),phone:i.mobile_val};if(i.userInfo.hadEpt.toString()=="1"){g.costWay=i.paymentPlugin.getPayType();g.productId=i.productId;g.userId=i.orderPageJson.userId}g=c.setCPSCommonParams(g);console.log("电子售卡接口 TCard001入参======="+JSON.stringify(g));return g};b.prototype.rechargeRespTCardSuccessCallback=function(g){dismissDialog();PasswordKeyBoard.hideKeyboardUI3();if(g.code!==config.RES.SUCCESS){if(g.code==config.RES.CARD_NOT_ENOUGH){Bestpay.Dialog.showAlertDialog("提醒",config.RES.CARD_NOT_ENOUGH_MSG,"确定",g.code,function(){e.itJudgeLocalStorage.putLocalValue("","","","")});return}if(g.code=="009002"||g.code=="006751"){console.log("in-------------------");e.paymentPlugin.setOrderDisplay("overtime");goTo(config.page.float_dia);return}if(g.code===config.RES.MONEY_NOT_ENOUGH){Bestpay.Dialog.showAlertDialog(config.TITLE.no_repeat,config.RES.MONEY_NOT_ENOUGH_MSG,"确定",g.code,function(){e.itJudgeLocalStorage.putLocalValue("","","","")});return}if(g.code==config.RES.PASSWORD_ERROR_LOCKED_002136){Bestpay.Dialog.showAlertDialog("提醒",g.content,"确定",g.code,function(){App.exitCompleteApp();e.itJudgeLocalStorage.putLocalValue("","","","")})}else{Bestpay.Dialog.showAlertDialog("提醒",g.content,"确定",g.code,function(){e.itJudgeLocalStorage.putLocalValue("","","","")})}return}e.itJudgeLocalStorage.putLocalValue("","","","");console.log("电子售卡接口 TCard001出参========"+JSON.stringify(g));c.sendSmsCertificate(g.transSeq,e.mobile_val,"");e.paymentPlugin.setOrderDisplay("success");goTo(config.page.float_dia);config.isBack=function(){if(window.jqXHR.readyState>2){Bestpay.App.exitApp()}}};b.prototype.rechargeRespTCardErrorCallback=function(g){if(g.code===config.RES.MONEY_NOT_ENOUGH){Bestpay.Dialog.showAlertDialog("提醒","余额不足","确定",config.RES.MONEY_NOT_ENOUGH,function(){e.itJudgeLocalStorage.putLocalValue("","","","")});return}};b.prototype.handleIsneedpassword=function(){var i=this;var h=this.quickTranInfo;var g=this.orderPageJson.retFaceAmount*1+this.orderPageJson.retPremium*1;var j=this.mTxnAmount;if(j*1==g*1){a("#id_premium_item").hide()}else{a("#id_premium_item").show()}console.log("amount : "+g);console.log("quickTranInfo : "+JSON.stringify(h));if(g*1<=1*h.perAmount&&(g*1+1*h.alltransaction)<=1*h.allamount){e.noPwd=false}else{e.noPwd=true}console.log("self.userInfo.authenStatus=="+i.userInfo.authenStatus);if(i.userInfo.authenStatus=="A02"){showDialog(config.MSG.loading);console.log("self.userInfo.hadEpt  "+i.userInfo.hadEpt);if(i.userInfo.hadEpt==1){i.getFinancialProducts()}else{i.fundAccountBalanceInquiry()}}else{i.fundAccountBalanceInquiry()}};b.prototype.getFinancialProducts=function(){var g=this;c.callCPSService({service:config.CPS.FINANCIAL_PRODUCTS,params:g.getFinancialProductsParams(),showLoading:false,success:g.getFinancialProductsSuccessCallback})};b.prototype.getFinancialProductsParams=function(){var g=this;var h={};h=c.setCPSCommonParams(h);return h};b.prototype.getFinancialProductsSuccessCallback=function(i){if(i.code!==config.RES.SUCCESS){if(i.code==="018888"){e.fundAccountBalanceInquiry();return}else{Bestpay.Dialog.showAlertDialog("提醒",i.content,"确定",i.code);return}}a("#payfortianyibao").show();var h=i.datas;for(var g=0;g<h.length;g++){e.orderPageJson.productId=h[g]["productId"];e.orderPageJson.userId=h[g]["userId"];e.orderPageJson.tyb_amount=f.fen2yuan(h[g]["balance"])}e.fundAccountBalanceInquiry()};b.prototype.fundAccountBalanceInquiry=function(){var g=this;c.callCPSService({service:config.CPS.CCOUNT_BALANCE_QUERY,params:g.fundAccountBalanceInquiryParams(),showLoading:false,success:g.fundAccountBalanceInquirySuccessCallback})};b.prototype.fundAccountBalanceInquiryParams=function(){var g=this;var h={bankMode:g.userInfo.bankMode};h=c.setCPSCommonParams(h);return h};b.prototype.fundAccountBalanceInquirySuccessCallback=function(l){if(l.code!==config.RES.SUCCESS){Bestpay.Dialog.showAlertDialog("提醒",l.content,"确定",l.code);return}console.log("资金账户余额查询 SAcc003出参======="+JSON.stringify(l));var o=l.dayLimit;var p=l.dayTotal;var r=o*1-p*1;var n=l.monthLimit;var i=l.monthTotal;var h=n*1-i*1;var k=l.motherBoard;var j=l.accountItems;for(var s=0;s<j.length;s++){var m=j[s]["acctType"];if(m!=null||m!="null"||m!="undefined"||m!=""){if("0007"==m){var q=j[s].activeBalance;e.orderPageJson.jfy_amount=f.fen2yuan(q);break}}}if(config.CARD_TYPE.BANK_MODE_FUND_POOL_MEMBER_CARD===e.userInfo.bankMode){var g="";if(o==="0"){g=k}else{if(k>r){g=r}else{g=k}}if(n==="0"){g=k}else{if(k>h){g=h}else{g=k}}e.orderPageJson.jfy_amount=f.fen2yuan(g);console.log("子卡＝＝＝＝prepaidRechargeSelf.orderPageJson['jfy_amount']=="+e.orderPageJson.jfy_amount)}e.getCommission()};return b});