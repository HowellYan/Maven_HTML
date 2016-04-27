define(["jquery","bestpay.lang","bestpay.http"],function(h,j,c){function k(q,r,o,n,p){this.inputId=q;this.btnClear=null;this.inputText=null;this.divWrap=null;this.value="";this.funcInput=o;this.funcClear=n;this.inputType=r;this.decimal=p;this.init();if(this.inputType=="password"){this.setPassword()}}k.prototype.init=function(){var n=this;n.inputText=document.getElementById(n.inputId);n.divWrap=n.inputText.parentNode.parentNode;n.btnClear=h(n.inputText.parentNode).next()[0];n.setFormat();n.btnClear.addEventListener("click",function(){n.inputText.value="";h(this).hide();if(j.isFunction(n.funcClear)){n.funcClear();console.log(" in lib clear")}});n.inputText.addEventListener("input",function(){if(config.isOpen==false){return}n.setInputType(n.inputText.value,this);n.value=h(this).val().toString();if(h(n.inputText).val().replace(/\s/g,"").length>0){h(n.btnClear).show()}else{h(n.btnClear).hide()}if(j.isFunction(n.funcInput)){n.funcInput(n.value)}},false);h(n.inputText).focus(function(){h(n.inputText).val(h(n.inputText).val().replace(/\s/g,""));n.divWrap.style.borderColor="#93bf53";if(h(n.inputText).val().replace(/\s/g,"").length>0){setTimeout(function(){h(n.btnClear).show()},500)}}).blur(function(){n.divWrap.style.borderColor="#DBDCDC";setTimeout(function(){h(n.btnClear).hide()},500)});if(this.inputType=="phone"){h(n.inputText.parentNode.parentNode).find(".btn-phone").click(function(){Bestpay.Contacts.openContacts(function(o){var p=o.replace(/[^0-9]+/g,"").replace(/\s/g,"");if(p.length!=11){Bestpay.Toast.makeText("请选择正确的手机号",Bestpay.Toast.LENGTH_SHORT);return}n.setValue(p.replace(/(\d{3})(\d{4})/g,"$1 $2 "));n.funcInput(p)},function(o){Bestpay.Dialog.alert(o)})})}if(this.inputType=="sanCode"){h(n.inputText).data("spanCode","");h(n.divWrap).find("div[class=scan-code]").click(function(){Bestpay.Scanner.getBarCode(function(o){h(n.inputText).data("spanCode",JSON.stringify(o).replace(/\"/g,""));h(n.inputText).val(JSON.stringify(o).replace(/\"/g,""));if(h(n.inputText).val().toString().trim()!=""){h(n.btnClear).show()}else{h(n.btnClear).hide()}})})}};k.prototype.getValue=function(){if(this.inputType=="password"){return PasswordKeyBoard.keyStr}return this.inputText.value};k.prototype.getToEmptyValue=function(){if(this.inputType=="password"){return PasswordKeyBoard.keyStr}return this.inputText.value.replace(/\s/g,"")};k.prototype.focus=function(n){if(typeof n=="function"&&n!=null){h(this.inputText).focus(n)}else{h(this.inputText).focus()}};k.prototype.blur=function(n){if(typeof n=="function"&&n!=null){h(this.inputText).blur(n)}else{h(this.inputText).blur()}};k.prototype.setValue=function(n){this.inputText.value=n;h(this.btnClear).show()};k.prototype.clearValue=function(){if(this.inputType=="password"){PasswordKeyBoard.keyStr=""}this.value="";this.inputText.value="";h(this.btnClear).hide()};k.prototype.setPlaceholder=function(n){this.inputText.setAttribute("placeholder",n)};k.prototype.setInputType=function(n,q){var p=this;if(p.inputType==null||p.inputType=="undefined"){return}switch(p.inputType){case"number":if(p.decimal==null||p.decimal==undefined){h(q).val(h(q).val().replace(/[^0-9]+/,""))}else{var o=h(q).val();if(o.indexOf(".")==0||(o.indexOf(".")>0&&(o.split(".").length>2||o.split(".")[1].length>p.decimal*1))){h(q).val(o.substring(0,o.length-1))}if(o.indexOf("0")==0&&o.length>1&&o.indexOf(".")!=1){h(q).val(o.substring(0,o.length-1))}h(q).val(h(q).val().replace(/[^0-9.]+/,""))}break;case"mobile":case"bankCard":case"phone":h(q).val(h(q).val().replace(/[^0-9]+/,""));break;case"IDCard":h(q).val(h(q).val().replace(/[^0-9Xx]+/,""));break;case"AlphaNumeric":h(q).val(h(q).val().replace(/[^0-9a-zA-Z]+/,""));break;case"sanCode":h(q).val(h(q).val().replace(/[^0-9a-zA-Z\.\-]+/,""));break;case"engineNumber":h(q).val(h(q).val().replace(/[^0-9a-zA-Z\_]+/,""));break;default:h(q).val(h(q).val().replace(/[^0-9]+/,""));break}};k.prototype.setFormat=function(){var n=this;if(n.inputType==null||n.inputType=="undefined"){return}var o=h(n.inputText);switch(n.inputType){case"mobile":o.blur(function(){o.val(o.val().replace(/\s/g,"").replace(/(\d{3})(\d{4})/g,"$1 $2 "))});break;case"phone":o.blur(function(){o.val(o.val().replace(/\s/g,"").replace(/(\d{3})(\d{4})/g,"$1 $2 "))});break;case"bankCard":o.blur(function(){o.val(o.val().replace(/\s/g,"").replace(/(\d{4})(?=\d)/g,"$1 "))});break}};k.prototype.setPassword=function(){var n=this;PasswordKeyBoard.initPwdId(n.inputId,function(o){if(j.isFunction(n.funcInput)){n.funcInput(o)}if(o.length>0){h(n.btnClear).show()}else{h(n.btnClear).hide()}n.btnClear.onclick=function(){var p=h(this);setTimeout(function(){n.inputText.value=""},300);setTimeout(function(){PasswordKeyBoard.keyStr=""},200);setTimeout(function(){p.hide()},100)}},12);document.getElementById(n.inputId).onclick=function(){PasswordKeyBoard.popPswKeyboard();PasswordKeyBoard.keyInputId=n.inputId}};k.prototype.getInputCheck=function(){var n=this;if(n.inputType==null||n.inputType=="undefined"){return}var o=h(n.inputText).val().replace(/\s/g,"");switch(n.inputType){case"mobile":if(!o.match("^((13[0-9])|(14[5,7,9])|(15[^4,\\D])|(18[0-9])|(17[5-9]))\\d{8}$")){return false}return true;break;case"EMail":if(!o.match("^\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$")){return false}return true;break;case"IDCard":if(!o.match("^[1-9]\\d{5}[1-9]\\d{3}((0\\d)|(1[0-2]))(([0|1|2]\\d)|3[0-1])\\d{3}(\\d|x|X)$")){return false}return true;break}};k.prototype.checkInputType=function(){var n=this;if(n.inputType==null||n.inputType=="undefined"){return}};function a(n,p,o){this.groupId=n;this.group=null;this.checkedItem=null;this.allItem=null;this.normalClassName="block-radio-normal";this.checkClassName="block-radio-checked";this.disabledClassName="block-radio-disabled";this.callback=o;this.defaultChecked=p;this.init();if(p!==null&&p!=="undefined"){this.setChecked(p)}}a.prototype.init=function(){var n=this;n.group=document.getElementById(n.groupId);n.allItem=h(n.group).children();for(var o=0;o<n.allItem.size();o++){n.allItem[o].onclick=function(){if(config.isOpen==false){return}n.setChecked(this);if(n.callback!=null&&n.callback!="undefined"){n.callback(h(this).data("value"),o,this)}n.defaultChecked=h(this).attr("id")}}};a.prototype.setChecked=function(o){var n=this;if(typeof o==="string"){o=document.getElementById(o)}if(n.checkedItem===o){return}if(n.checkedItem!==null){h(n.checkedItem).removeClass(n.checkClassName).addClass(n.normalClassName)}h(o).removeClass(n.normalClassName).addClass(n.checkClassName);n.checkedItem=o};a.prototype.setAllNormal=function(){if(this.checkedItem!==null){h(self.checkedItem).removeClass(self.checkClassName).addClass(self.normalClassName)}};a.prototype.getCheckedItem=function(){return this.checkedItem};a.prototype.getCheckedValue=function(){return h(this.checkedItem).data("value")};a.prototype.setDisabled=function(o,n){var p=this;if(o==false){p.init();for(var q=0;q<p.allItem.size();q++){h(p.allItem[q]).removeClass(p.disabledClassName).addClass(p.normalClassName)}h(p.defaultChecked).removeClass(p.normalClassName).addClass(p.checkClassName)}else{if(o==true){p.defaultChecked=p.checkedItem;if(n!=null){for(var q=0;n.length>q;q++){p.allItem[n[q]].onclick=function(){};h(p.allItem[n[q]]).removeClass(p.checkClassName).addClass(p.disabledClassName);h(p.allItem[n[q]]).removeClass(p.normalClassName).addClass(p.disabledClassName)}}else{for(var q=0;q<p.allItem.size();q++){p.allItem[q].onclick=function(){};h(p.allItem[q]).removeClass(p.checkClassName).addClass(p.disabledClassName);h(p.allItem[q]).removeClass(p.normalClassName).addClass(p.disabledClassName)}}}}};function l(){}l.prototype.template_OneToOne=function(r,n){var q=document.getElementById(r);var p=document.getElementById(r+"_show");var o=q.innerHTML.replace(/\$\w+\$/gi,function(t){var s=n[t.replace(/\$/g,"")];return(s+"")=="undefined"?"":s});p.innerHTML=o;window.lib.flexible.refreshRem()};l.prototype.template_MoreToOne=function(q,s,n){var t=document.getElementById(q);var p=document.getElementById(s);for(var r=0;n.length>r;r++){var o=t.innerHTML.replace(/\$\w+\$/gi,function(v){var u=n[r][v.replace(/\$/g,"")];return(u+"")=="undefined"?"":u});p.innerHTML+=o}window.lib.flexible.refreshRem()};function b(o,n,s,p,r,t,q){this.id=o;this.contJson=n;this.titleStr=s;this.btnJson=p;this.type=r;this.dialogClass_bg=null;this.contOutDiv=null;this.callBack=t;this.selectItemObj=q;if(h("#"+this.id).html().replace(/\s/g,"").length==0){this.init()}else{h("#"+this.id).show()}}b.prototype.init=function(){this.thisDom=document.getElementById(this.id);this.dialogClass_bg=document.createElement("div");this.dialogClass_bg.className="dialogClass-bg";var n=this;this.thisDom.appendChild(this.dialogClass_bg);this.contOutDiv=document.createElement("div");if(this.titleStr!=null){this.setTitle()}switch(this.type){case"dialog":this.contOutDiv.className="dialogClass-content";this.setContent();break;case"list":this.contOutDiv.className="dialogClass-list-content box box-ver";this.setListContent();break}if(this.btnJson!=null){this.setButton()}this.thisDom.appendChild(this.contOutDiv)};b.prototype.setTitle=function(){var n=document.createElement("pre");n.className="dialogClass-title";n.innerHTML=this.titleStr;this.contOutDiv.appendChild(n)};b.prototype.setTitlePublic=function(n){h("#"+this.id+" .dialogClass-title").html(n)};b.prototype.setContent=function(){this.itemOutDiv=document.createElement("div");this.itemOutDiv.className="dialogClass-div-item";for(var n in this.contJson){var o=document.createElement("div");o.className="dialogClass-item";o.innerHTML=n+":"+this.contJson[n];this.itemOutDiv.appendChild(o)}this.contOutDiv.appendChild(this.itemOutDiv)};b.prototype.setListContent=function(){var p=this;this.itemOutDiv=document.createElement("div");this.itemOutDiv.className="box-f1 dialogClass-item-out";for(var q in this.contJson){var n=document.createElement("div");n.className="dialogClass-list-item";n.innerHTML=q;n.setAttribute("data-val",p.contJson[q]);var o=document.createElement("div");o.className="dialogClass-list-img-off";if(p.selectItemObj==p.contJson[q]){o.className="dialogClass-list-img-on";p.selectItemObj=n}n.onclick=function(){if(p.selectItemObj!=null){h(p.selectItemObj).find("div").removeClass("dialogClass-list-img-on").addClass("dialogClass-list-img-off")}h(this).find("div").addClass("dialogClass-list-img-on");p.callBack(this.getAttribute("data-val"),this);p.selectItemObj=this};n.appendChild(o);this.itemOutDiv.appendChild(n)}this.contOutDiv.appendChild(this.itemOutDiv)};b.prototype.setButton=function(){var o=document.createElement("div");o.className="box dialogClass-div-btn";for(var n in this.btnJson){var p=document.createElement("div");p.className="box-f1 dialogClass-btn dialogClass-btn-goahead";p.innerHTML=n;p.onclick=this.btnJson[n];o.appendChild(p)}this.itemOutDiv.appendChild(o)};b.prototype.setButtonClass=function(o,n){h(".dialogClass-btn:eq("+[o-1]+")").addClass(n)};b.prototype.setItemClass=function(o,n){h(".dialogClass-item:eq("+[o-1]+")").addClass(n)};b.prototype.clearDialog=function(n){this.thisDom.innerHTML="";if(n!=null&&n!="undefined"){n()}};b.prototype.hideDialog=function(n){h("#"+this.id).hide();if(n!=null&&n!="undefined"){n()}};function e(o,n,r,q,p){this.id=o;this.thisObj=n;this.contJson=r;this.callBack=q;this.funcBoxBG=p;if(this.thisObj!=null){this.boxWidth=h(this.thisObj).width();this.boxHeight=h(this.thisObj).height();this.boxTopHeight=this.thisObj.offsetTop;this.boxLeft=this.thisObj.offsetLeft}h("#"+this.id).html("");this.init()}e.prototype.init=function(){var n=this;this.thisDom=document.getElementById(this.id);this.dropDownBox_bg=document.createElement("div");this.dropDownBox_bg.className="dropDownBox-bg";this.dropDownBox_bg.onclick=function(){n.funcBoxBG()};this.thisDom.appendChild(this.dropDownBox_bg);this.contOutDiv=document.createElement("div");this.contOutDiv.className="dropDownBox-list-content";h(this.contOutDiv).width(this.boxWidth+"px");this.contOutDiv.style.top=(this.boxTopHeight+this.boxHeight+3)+"px";this.contOutDiv.style.left=this.boxLeft+"px";console.log(JSON.stringify(this.contJson));this.setListContent();this.thisDom.appendChild(this.contOutDiv)};e.prototype.setListContent=function(){var p=this;this.itemOutDiv=document.createElement("div");for(var n in this.contJson){var o=document.createElement("div");o.className="dropDownBox-list-item";o.innerHTML=n;o.setAttribute("data-val",p.contJson[n]);o.onclick=function(){p.callBack(this.getAttribute("data-val"),this)};this.itemOutDiv.appendChild(o)}this.contOutDiv.appendChild(this.itemOutDiv)};e.prototype.clearDropDownBox=function(n){this.thisDom.innerHTML="";if(n!=null&&n!="undefined"){n()}};e.prototype.hideDropDownBox=function(n){h("#"+this.id).hide();if(n!=null&&n!="undefined"){n()}};var i=function(n,o,p){this.type=n;this.callBack=o;this.msgJson=p;this.init()};i.prototype.init=function(){var n=this;switch(this.type){case"showDateChoiceDialog":Bestpay.Dialog.showDateChoiceDialog(j.getDate_YYYY_MM_DD(),this.callBack);break;case"showDateModifyDialog":Bestpay.Dialog.showDateChoiceDialog(n.msgJson,this.callBack);break}};function m(o,n){this.htmlArray=o;this.listlength=o.length;this.doc=document;this.index=n;this.fragment=document.createDocumentFragment();this.paintHTML()}m.prototype.paintHTML=function(){var p=this;var o=[];for(var n=0;n<p.listlength;n++){o[n]=document.createElement("div");o[n].setAttribute("data-value",n);if(n==p.index){o[n].className="gridlist gridlist_active"}else{o[n].className="gridlist"}o[n].innerHTML=p.htmlArray[n];o[n].onclick=function(){for(var q=0;q<p.listlength;q++){document.getElementsByClassName("gridlist")[q].className="gridlist"}this.className="gridlist gridlist_active";p.index=this.getAttribute("data-value")};p.fragment.appendChild(o[n])}};m.prototype.getHTML=function(){return this.fragment};m.prototype.getIndex=function(){return this.index};function f(n){this.businessName=n.businessName||"";this.accountName=n.accountName||"";this.accouontValue=n.accouontValue||"0";this.rechargeMoney=n.rechargeMoney||"0";this.rewardType=n.rewardType||"reward";this.rewardMoney=n.rewardMoney||"0";this.jfyBalance=n.jfyBalance;this.tybBalance=n.tybBalance;this.enablePassword=n.enablePassword;this.userInfo=n.userInfo;this.callback=n.callback||function(){};this.payType="1";this.init()}f.prototype.init=function(){var n=this;n.payDetailHTML();n.balanceCheck();n.setRewardClick();n.setPayClick()};f.prototype.payDetailHTML=function(){var p=this;var t=h("#order_comfirm");var s="";var r="0";var o="";var q="";var u="";var n="";if(this.rewardType==="reward"){r=(this.rechargeMoney*1).toFixed(2);o="酬&emsp;&emsp;金";q=(this.rewardMoney*1).toFixed(2);n="元"}else{if(this.rewardType==="zhejia"){r=(this.rewardMoney*1).toFixed(2);o="折&emsp;&emsp;价";q=((this.rewardMoney*1)/(this.rechargeMoney*1))*100;n="折"}}s+='<div id="id_confirm_wrap" class="div-confirm-wrap">';s+='<div class="confirmTitle">';s+='<ul class="box">';s+='<li class="box-f1">'+this.accountName+"</li>";s+='<li class="box-f3">'+this.accouontValue+"</li>";s+="</ul>";s+="</div>";s+='<div id="confirm_template">';s+='<div id="rewardItems" class="new-payConfirmItem closeReward">';s+='<div class="confirm-item"><em>应收顾客</em><span class="pay_money fontWeight">'+(this.rechargeMoney*1).toFixed(2)+"</span> 元</div>";s+='<div class="confirm-item"><div class="confirm-item-sub">';s+="<em>支付金额</em>";s+='<span class="secret">*****</span>';s+='<span class="notsecret"><i class="pay_money">'+r+"</i> 元</span></div>";s+='<span id="id_confirm_eyes" class="confirm-eyes"></span>';s+="</div>";s+='<div class="confirm-item" id="reward_wrap" style="'+u+'">';s+="<em>"+o+"</em>";s+='<span class="secret">*****</span>';s+='<span id="reward" class="notsecret"><i class="pay_money">'+q+"</i>"+n+"</span>";s+="</div>";s+="</div>";s+="</div>";s+='<div class="confirmTitle">';s+='<ul class="box">';s+='<li class="box-f1">付款方式</li>';s+='<li class="box-f3">&emsp;&emsp;&emsp;&emsp;</li>';s+="</ul>";s+="</div>";s+='<div id="tianyibao_pay">';s+='<div class="box account-wrap" id="tyb_account_wrap">';s+='<div class="box-f3 box radioClick">';s+='<div class="box-f1 pay-radio pay-radio-off" id="tyb_radio"></div>';s+='<div class="box-f1 account-icon account-tyb"></div>';s+='<div class="box-f1 account-content">';s+="<div>添益宝</div>";s+="<div>￥"+(this.tybBalance*1).toFixed(2)+"</div>";s+="</div>";s+="</div>";s+='<div class="box-f1 account-recharge" id="tyb_charge">余额不足<em></em></div>';s+='<input type="hidden" id="tybBalance_val">';s+="</div>";s+='<div class="box account-wrap">';s+='<div class="box-f3 box radioClick">';s+='<div class="box-f1 pay-radio pay-radio-off" id="jfy_radio"></div>';s+='<div class="box-f1 account-icon account-jfy"></div>';s+='<div class="box-f1 account-content">';s+="<div>余&emsp;额</div>";s+="<div>￥"+(this.jfyBalance*1).toFixed(2)+"</div>";s+="</div>";s+="</div>";s+='<div class="box-f1 account-recharge" id="jfy_charge">余额不足<em></em></div>';s+='<input type="hidden" id="jfyBalance_val">';s+="</div></div>";s+='<div class="TOPplaceholder"></div>';s+='<div class="line-box-wrap confirm_botton">';s+='<div class="btn-common-wrap">';s+='<button id="confirm_botton">确 定</button>';s+='<div class="TOPplaceholder"></div>';s+="</div></div></div>";t.html(s)};f.prototype.setButtonAvailable=function(o){var n=this;var p=h("#confirm_botton");p.off("click");if(o){p.removeClass("unavailable");p.on("click",function(){n.itJudgeLocalStorage=new g();n.itJudgeLocalStorage.putLocalValue(n.accouontValue.replace(/\s/g,""),parseInt(n.rechargeMoney*100),c.getCurrentTime(),n.businessName);if(!n.enablePassword){console.log("=======免密======");config.payingBack=true;n.callback("");return}PasswordKeyBoard.initPwdUI3(function(q){config.payingBack=true;n.callback(q)});PasswordKeyBoard.popKeyboardUI3()})}else{p.addClass("unavailable")}};f.prototype.judgeNotFundsPut=function(o){var n=this;n.noFoudsTybOrJby=o;console.log("123self.noFoudsTybOrJby = "+n.noFoudsTybOrJby);n.jumpToRecharge()};f.prototype.setPayClick=function(){var q=this;var s=h(".radioClick");var o=s.eq(0);var n=s.eq(1);var p=h("#jfyBalance_val").val();var r=h("#tybBalance_val").val();n.off("click");o.off("click");h("#jfy_charge").off("click");h("#tyb_charge").off("click");if(p==="availalbe"){n.parent(".account-wrap").removeClass("account-noMoney");n.click(function(){console.log("交费易 click");q.setChoice("jfy");q.setButtonAvailable(true)})}else{if(p==="unavailalbe"){n.parent(".account-wrap").addClass("account-noMoney");n.on("click",function(){q.setChoice("jfy");q.setButtonAvailable(false)});h("#jfy_charge").on("click",function(){q.judgeNotFundsPut("jfyFunds")})}}if(r==="availalbe"){o.parent(".account-wrap").removeClass("account-noMoney");o.click(function(){console.log("添益宝 click");q.setChoice("tyb");q.setButtonAvailable(true)})}else{if(r==="unavailalbe"){o.parent(".account-wrap").addClass("account-noMoney");o.on("click",function(){q.setChoice("tyb");q.setButtonAvailable(false)});h("#tyb_charge").on("click",function(){q.judgeNotFundsPut("tybFunds")})}}};f.prototype.getPayType=function(){var n=this;return n.payType};f.prototype.setShowReward=function(n){if(n==="hide"){h("#rewardItems").addClass("closeReward");h("#id_confirm_eyes").removeClass("see-eyes")}if(n==="show"){h("#rewardItems").removeClass("closeReward");h("#id_confirm_eyes").addClass("see-eyes")}};f.prototype.setRewardClick=function(){var n=this;var o=true;h("#id_confirm_eyes").click(function(){if(h(this).hasClass("see-eyes")){n.setShowReward("hide")}else{n.setShowReward("show");if(o){Bestpay.TalkingData.onEventWithLabel("支付页面","点击酬金显示按钮");o=false}}})};f.prototype.setHiddenInput=function(r,n){var q=this;var o=h("#jfyBalance_val");var p=h("#tybBalance_val");if(r==="jfyBalance"){o.val(n)}else{if(r==="tybBalance"){p.val(n)}}};f.prototype.setChoice=function(o){var n=this;h(".pay-radio").removeClass("pay-radio-on");if(o==="jfy"){h("#jfy_radio").addClass("pay-radio-on");n.payType="0"}else{if(o==="tyb"){h("#tyb_radio").addClass("pay-radio-on");n.payType="1"}}};f.prototype.balanceCheck=function(){var p=this;var o=this.rechargeMoney*1;var n=this.jfyBalance*1;var q=this.tybBalance*1;console.log("this.jfyBalance=="+this.jfyBalance);console.log("this.tybBalance=="+this.tybBalance);if(!!this.tybBalance){p.setChoice("tyb");if(q>=o){p.setButtonAvailable(true);p.setHiddenInput("tybBalance","availalbe")}else{p.setButtonAvailable(false);p.setHiddenInput("tybBalance","unavailalbe")}if(!!this.jfyBalance&&n>=o){p.setHiddenInput("jfyBalance","availalbe")}else{p.setHiddenInput("jfyBalance","unavailalbe")}}else{h("#tyb_account_wrap").hide();p.setChoice("jfy");if(!!this.jfyBalance&&n>=o){p.setButtonAvailable(true);p.setHiddenInput("jfyBalance","availalbe")}else{p.setButtonAvailable(false);p.setHiddenInput("jfyBalance","unavailalbe")}}if(config.CARD_TYPE.BANK_MODE_FUND_POOL_MEMBER_CARD===this.userInfo.bankMode){p.setShowReward("hide");h("#reward_wrap").hide()}};f.prototype.jumpToRecharge=function(){var r=this;var p="?ENV="+config.ENV;var n;var q=location.origin;if(config.ENV==="PRODUCT"){n=q+"/2015UI/pluginRAB"}else{n=q+"/test/20160419/pluginRAB"}console.log("123 noFoudsTybOrJby = "+r.noFoudsTybOrJby);var o=n+"/reCharge.html"+p+"#JUDGE="+r.noFoudsTybOrJby;console.log(o+"============================URL RE");App.jumpToNewH5View(o,function(){back()})};f.prototype.jumpToAuthority=function(){var r=this;var p="?ENV="+config.ENV;var o;var q=location.origin;console.log("##origin ==== "+q);if(config.ENV==="PRODUCT"){o=q+"/online_h5/pluginRAB"}else{o=q+"/test/20160419/pluginRAB"}var n=o+"/authority.html"+p;console.log(n+"============================URL RE");App.jumpToNewH5View(n,function(){back()})};f.prototype.setOrderDisplay=function(n){var s=this;var x="";var t="../lib/img/receving.png";var w="交易已受理";var v="稍后请确认订单状态";var u="查看订单状态";var o="../lib/img/success.png";var q="交易成功";var p="预计10分钟内到账";var r="再来一次";PasswordKeyBoard.hideKeyboardUI3();if(n==="overtime"){x+='<div class="success-title-img">';x+='<br><img src="'+t+'"><br><br>';x+="<span>"+w+"</span>";x+='<em class="success-title-dz">'+v+"</em><br><br>";x+="</div>";x+='<div class="success-percent">';x+='<div class="box success-div-btn">';x+='<div id="checkOrder" class="box-f1 success-btn checkOrder">'+u+"</div>";x+="</div></div>";h("#floatPageContent").html(x);document.getElementById("checkOrder").onclick=function(){var z=JSON.parse(Bestpay.App.getDeviceInfo());var A=z.clientVersion;var y=z.systemType;A=A.replace(/\./g,"")*1;y=y.toLowerCase();if((y==="android"&&A>=329)||(y==="ios"&&A>=305)){Bestpay.Dialog.jumpToOrderQuery(config.TITLE.submited_title,config.MSG.msg_submited_content,"确定",config.TRADE_LIST_QUERY_TYPE,config.TRADE_LIST_QUERY_NUMBER);if(window.jqXHR.readyState>2){location.reload()}}else{Bestpay.Dialog.showAlertSynchroDialog(config.TITLE.submited_title,config.MSG.msg_submited_content,"确定",config.TRADE_LIST_QUERY_TYPE,config.TRADE_LIST_QUERY_NUMBER)}};config.isBack=function(){if(window.jqXHR.readyState>2){Bestpay.App.exitApp()}}}else{if(n==="success"){x+='<div class="success-title-img">';x+='<br><img src="'+o+'"><br><br>';x+="<span>"+q+"</span>";x+='<em class="success-title-dz">'+p+"</em><br><br>";x+="</div>";x+='<div class="success-percent">';x+='<div class="box success-div-btn">';x+='<div id="getback" class="box-f1 success-btn success-btn-goahead">返回大厅</div>';x+='<div id="onceAgain" class="box-f1 success-btn checkOrder">'+r+"</div>";x+="</div></div>";h("#floatPageContent").html(x);document.getElementById("getback").onclick=function(){if(window.jqXHR.readyState>2){Bestpay.TalkingData.onEventWithLabel("支付页面","返回大厅");Bestpay.App.exitApp()}};document.getElementById("onceAgain").onclick=function(){if(window.jqXHR.readyState>2){Bestpay.TalkingData.onEventWithLabel("支付页面","再来一次");location.reload()}}}}};var d=function(){var n=h("#btn_next");n.on("touchstart",function(){h(this).css({"background-color":"#EB7605"})});n.on("touchend touchmove touchcancel",function(){h(this).css({"background-color":"#ff7e00"})})};d();var g=function(){var n=this;var o=JSON.parse(Bestpay.App.getDeviceInfo());n.clientVersion=o.clientVersion;n.systemType=o.systemType;n.clientVersion=n.clientVersion.replace(/\./g,"")*1;n.systemType=n.systemType.toLowerCase()};g.prototype.putLocalValue=function(n,q,r,o){var p=this;this.number=n;this.amount=q;this.currentTime=r;this.businessName=o;if((p.systemType==="android"&&p.clientVersion>=406)||(p.systemType==="ios"&&p.clientVersion>=403)){Bestpay.Preference.put("Number",p.number,"");Bestpay.Preference.put("Amount",p.amount,"");Bestpay.Preference.put("CurrentTime",p.currentTime,"");Bestpay.Preference.put("BusinessName",p.businessName,"");console.log("put123==="+p.number);console.log("put123==="+p.amount);console.log("put123==="+p.currentTime);console.log("put123==="+p.businessName)}};g.prototype.getLocalValue=function(){var o=this;var n={};n.Number=Bestpay.Preference.get("Number","","");n.Amount=Bestpay.Preference.get("Amount","","");n.CurrentTime=Bestpay.Preference.get("CurrentTime","","");n.BusinessName=Bestpay.Preference.get("BusinessName","","");return n};g.prototype.checkOrder=function(n,s,t,q,o){var r=this;console.log("开始判断");if((r.systemType==="android"&&r.clientVersion>=406)||(r.systemType==="ios"&&r.clientVersion>=403)){var p=r.getLocalValue();console.log("123result过去 = "+JSON.stringify(p));console.log("123number当前 = "+n);console.log("123amount当前 = "+s*100);console.log("123currentTime当前 = "+t);console.log("123businessName当前 = "+o);if(n==p.Number&&s*100==p.Amount&&o==p.BusinessName){if(j.getTime_CONTRAST(p.CurrentTime,t,2)<=10){console.log("相同判断");r.InnerPing(q);return}}console.log("123不相同判断");q()}q()};g.prototype.InnerPing=function(p){var n=this;var q=h("#page_LocalHost");var o='<div class="floatParent"><div class="backblack"></div><div class="FloatCenter"><div class="alert_cet">该号码已有订单处理中，是否重复充值？</div><ul class="alert_U boxbox alertBtnTouch"><li id="InnerGoAhead">继续充值</li><li id="WatchOrder">查看订单</li></ul></div></div>';q.html(o);goTo(config.page.LocalHost);n.InnerBtnInit(p)};g.prototype.InnerBtnInit=function(o){var n=h(".alertBtnTouch li");n.on("touchstart",function(){h(this).addClass("itemHover")});n.on("touchend touchmove touchcancel",function(){h(this).removeClass("itemHover")});document.getElementById("InnerGoAhead").onclick=function(){back();o()};document.getElementById("WatchOrder").onclick=function(){back();Bestpay.Dialog.jumpToOrderQuery(config.TITLE.submited_title,config.MSG.msg_submited_content,"确定",config.TRADE_LIST_QUERY_TYPE,config.TRADE_LIST_QUERY_NUMBER)}};return{InputText:k,BlockRadioGroup:a,dropDownBox:e,DialogClass:b,showDialogClass:i,Template:l,paymentPlugin:f,GridList:m,JudgeLocalStorage:g}});