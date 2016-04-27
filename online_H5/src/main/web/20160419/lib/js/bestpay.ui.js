/**
 * Created by liuyun on 15/4/26.
 * Version 1.0
 * (C)Copyright www.bestpay.com.cn Corporation. liuyun 2015-20XX All rights reserved.
 */

define(['jquery', 'bestpay.lang', 'bestpay.http'], function ($, Lang,HTTP) {

    /**
     *
     * @param inputId
     * @param inputType (number|password|mobile|bankCard|IDCard|EMail|phone|AlphaNumeric|sanCode)
     * @param funcInput
     * @param funcClear
     * @param decimal (inputType is number,the number after the decimal point)
     * @constructor
     */
    function InputText (inputId, inputType, funcInput, funcClear, decimal) {
        this.inputId = inputId;
        this.btnClear = null;
        this.inputText = null;
        this.divWrap = null;
        this.value = "";
        this.funcInput = funcInput;
        this.funcClear = funcClear;
        this.inputType = inputType;
        this.decimal = decimal;
        this.init();

        if(this.inputType == 'password'){
            this.setPassword();
        }
    }

    InputText.prototype.init = function() {
        var self = this;
        self.inputText = document.getElementById(self.inputId);
        self.divWrap = self.inputText.parentNode.parentNode;
        self.btnClear = $(self.inputText.parentNode).next()[0];
        self.setFormat();

        /*self.btnClear.onclick = function () {
            self.inputText.value = '';
            $(this).hide();
            if (Lang.isFunction(self.funcClear)) {
                self.funcClear();
                console.log(" in lib clear");
            }
        };*/
        self.btnClear.addEventListener('click',function () {
            self.inputText.value = '';
            $(this).hide();
            if (Lang.isFunction(self.funcClear)) {
                self.funcClear();
                console.log(" in lib clear");
            }
        });
        self.inputText.addEventListener('input', function() {
            if(config.isOpen == false){
                return;
            }
            self.setInputType(self.inputText.value,this);
            self.value = $(this).val().toString();
            if ($(self.inputText).val().replace(/\s/g,'').length > 0 ) {
                $(self.btnClear).show();
            } else {
                $(self.btnClear).hide();
            }
            if (Lang.isFunction(self.funcInput)) {
                self.funcInput(self.value);
            }
        }, false);

        $(self.inputText).focus(function () {
            $(self.inputText).val($(self.inputText).val().replace(/\s/g,''));
            self.divWrap.style.borderColor = '#93bf53';
            if($(self.inputText).val().replace(/\s/g,'').length > 0) {
                setTimeout(function() {
                    $(self.btnClear).show();
                },500);
            }
        }).blur(function () {
            self.divWrap.style.borderColor = '#DBDCDC';
            setTimeout(function(){
                $(self.btnClear).hide();
            },500);
        });

        if(this.inputType == 'phone'){
            $(self.inputText.parentNode.parentNode).find('.btn-phone').click(function(){
                Bestpay.Contacts.openContacts(function (phone_no) {
                    var phone_val = phone_no.replace(/[^0-9]+/g,'').replace(/\s/g,'');
                    if(phone_val.length != 11){
                        Bestpay.Toast.makeText('请选择正确的手机号', Bestpay.Toast.LENGTH_SHORT);
                        return;
                    }
                    self.setValue(phone_val.replace(/(\d{3})(\d{4})/g,"$1 $2 "));
                    self.funcInput(phone_val);
                }, function (error) {
                    Bestpay.Dialog.alert(error);
                });
            });
        }

        if(this.inputType == "sanCode"){
            $(self.inputText).data("spanCode","");
            $(self.divWrap).find("div[class=scan-code]").click(function(){
                Bestpay.Scanner.getBarCode(function(resultData){
                    $(self.inputText).data("spanCode",JSON.stringify(resultData).replace(/\"/g,''));
                    $(self.inputText).val(JSON.stringify(resultData).replace(/\"/g,''));
                    if( $(self.inputText).val().toString().trim() != "")
                         $(self.btnClear).show();
                    else
                        $(self.btnClear).hide();
                });
            });
        }

    };

    InputText.prototype.getValue = function() {
        if(this.inputType == 'password'){
            return PasswordKeyBoard.keyStr;
        }
        return this.inputText.value;
    };

    InputText.prototype.getToEmptyValue = function() {
        if(this.inputType == 'password'){
            return PasswordKeyBoard.keyStr;
        }
        return this.inputText.value.replace(/\s/g,'');
    };

    InputText.prototype.focus = function(fun){
        if(typeof fun == 'function' && fun != null){
            $(this.inputText).focus(fun);
        }else{
            $(this.inputText).focus();
        }
    };

    InputText.prototype.blur = function(fun){
        if(typeof fun == 'function' && fun != null){
            $(this.inputText).blur(fun);
        }else{
            $(this.inputText).blur();
        }
    };

    InputText.prototype.setValue = function(value) {
        this.inputText.value = value;
        $(this.btnClear).show();
    };

    InputText.prototype.clearValue = function(){
        if(this.inputType == 'password'){
            PasswordKeyBoard.keyStr = '';
        }
        this.value = "";
        this.inputText.value = "";
        $(this.btnClear).hide();
    };

    InputText.prototype.setPlaceholder = function(ph) {
        this.inputText.setAttribute('placeholder', ph);
    };

    /**
     * Restricted content
     * @param val : input value
     * @param valObj : input DOM object
     */
    InputText.prototype.setInputType = function(val,valObj){
        var self = this;
        if (self.inputType == null || self.inputType == 'undefined') {
            return;
        }
        switch(self.inputType){
            case 'number':
                if(self.decimal == null || self.decimal == undefined){
                    $(valObj).val($(valObj).val().replace(/[^0-9]+/,''));
                } else {
                    var thisVal = $(valObj).val();
                    if(thisVal.indexOf('.') == 0 || (thisVal.indexOf('.') >0 && (thisVal.split('.').length > 2 || thisVal.split('.')[1].length > self.decimal*1)) ){
                        $(valObj).val(thisVal.substring(0,thisVal.length-1));
                    }
                    if(thisVal.indexOf('0') == 0 && thisVal.length > 1 && thisVal.indexOf('.') != 1){
                        $(valObj).val(thisVal.substring(0,thisVal.length-1));
                    }
                    $(valObj).val($(valObj).val().replace(/[^0-9.]+/,''));
                }
                break;
            case 'mobile':
            case 'bankCard':
            case 'phone':
                $(valObj).val($(valObj).val().replace(/[^0-9]+/,''));
                break;
            case 'IDCard':
                $(valObj).val($(valObj).val().replace(/[^0-9Xx]+/,""));
                break;
            case 'AlphaNumeric':
                $(valObj).val($(valObj).val().replace(/[^0-9a-zA-Z]+/,""));
                break;
            case 'sanCode':
                $(valObj).val($(valObj).val().replace(/[^0-9a-zA-Z\.\-]+/,""));
                break;
            case 'engineNumber':
                $(valObj).val($(valObj).val().replace(/[^0-9a-zA-Z\_]+/,""));
                break;
            default :
                $(valObj).val($(valObj).val().replace(/[^0-9]+/,''));
                break;
        }
    };

    /**
     * According to the type of formatted content
     */
    InputText.prototype.setFormat = function(){
        var self = this;
        if (self.inputType == null || self.inputType == 'undefined') {
            return;
        }
        var inputObj = $(self.inputText);
        switch(self.inputType){
            case 'mobile':
                inputObj.blur(function(){
                    inputObj.val(inputObj.val().replace(/\s/g,'').replace(/(\d{3})(\d{4})/g,"$1 $2 "));
                });
                break;
            case 'phone':
                inputObj.blur(function(){
                    inputObj.val(inputObj.val().replace(/\s/g,'').replace(/(\d{3})(\d{4})/g,"$1 $2 "));
                });
                break;
            case 'bankCard':
                inputObj.blur(function(){
                    inputObj.val(inputObj.val().replace(/\s/g,'').replace(/(\d{4})(?=\d)/g,"$1 "));
                });
                break;
        }
    };

    /**
     * init native PINpad
     */
    InputText.prototype.setPassword = function(){
        var self = this;
        PasswordKeyBoard.initPwdId(self.inputId, function(result){
            if (Lang.isFunction(self.funcInput)) {
                self.funcInput(result);
            }
            if(result.length>0){
                $(self.btnClear).show();
            }else{
                $(self.btnClear).hide();
            }
            
            self.btnClear.onclick = function () {
            	var me = $(this);
            	setTimeout(function(){ 
	                self.inputText.value = '';
            	}, 300);
                setTimeout(function(){
                    PasswordKeyBoard.keyStr = '';
                }, 200);
                setTimeout(function(){
                    me.hide();
                }, 100);
            };

        }, 12);//初始化密码键盘；
        document.getElementById(self.inputId).onclick = function(){
            PasswordKeyBoard.popPswKeyboard();
            PasswordKeyBoard.keyInputId = self.inputId;
        };
    };

    /**
     *  Calibration values
     * @returns {boolean}
     */
    InputText.prototype.getInputCheck = function(){
        var self = this;
        if (self.inputType == null || self.inputType == 'undefined') {
            return;
        }
        var inputVal = $(self.inputText).val().replace(/\s/g,'');
        switch(self.inputType){
            case 'mobile':
                if(!inputVal.match("^((13[0-9])|(14[5,7,9])|(15[^4,\\D])|(18[0-9])|(17[5-9]))\\d{8}$")){
                    return false;
                }
                return true;
                break;
            case 'EMail':
                if(!inputVal.match("^\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$")){
                    return false;
                }
                return true;
                break;
            case 'IDCard':
                if(!inputVal.match("^[1-9]\\d{5}[1-9]\\d{3}((0\\d)|(1[0-2]))(([0|1|2]\\d)|3[0-1])\\d{3}(\\d|x|X)$")){
                    return false;
                }
                return true;
                break;
        }
    };

    InputText.prototype.checkInputType = function(){
        var self = this;
        if (self.inputType == null || self.inputType == 'undefined') {
            return;
        }
    };

    //
    function BlockRadioGroup(groupId, defaultChecked, callback) {
        this.groupId = groupId;
        this.group = null;
        this.checkedItem = null;
        this.allItem = null;
        this.normalClassName = 'block-radio-normal';
        this.checkClassName = 'block-radio-checked';
        this.disabledClassName = 'block-radio-disabled';
        this.callback = callback;
        this.defaultChecked = defaultChecked;
        this.init();
        if (defaultChecked !== null && defaultChecked !== 'undefined') {
            this.setChecked(defaultChecked);
        }
    }

    BlockRadioGroup.prototype.init = function() {
        var self = this;
        self.group = document.getElementById(self.groupId);
        self.allItem = $(self.group).children();

        // 为每个item绑定点击事件
        for (var i = 0; i < self.allItem.size(); i ++) {
            self.allItem[i].onclick = function() {
                if(config.isOpen == false){
                    return;
                }
                self.setChecked(this);
                if (self.callback!= null && self.callback!= 'undefined') {
                    self.callback($(this).data('value'),i,this);
                }
                self.defaultChecked = $(this).attr('id');
            };
        }
    };
    BlockRadioGroup.prototype.setChecked = function(elt) {
        var self = this;
        if (typeof elt === 'string') {
            elt = document.getElementById(elt);
        }
        if (self.checkedItem === elt) {
            return;
        }
        if (self.checkedItem !== null) {
            $(self.checkedItem).removeClass(self.checkClassName).addClass(self.normalClassName);
        }
        $(elt).removeClass(self.normalClassName).addClass(self.checkClassName);
        self.checkedItem = elt;
    };
    BlockRadioGroup.prototype.setAllNormal = function() {
        if (this.checkedItem !== null) {
            $(self.checkedItem).removeClass(self.checkClassName).addClass(self.normalClassName);
        }
    };
    BlockRadioGroup.prototype.getCheckedItem = function() {
        return this.checkedItem;
    };
    BlockRadioGroup.prototype.getCheckedValue = function() {
        return $(this.checkedItem).data('value');
    };
    BlockRadioGroup.prototype.setDisabled = function(val, selectArray) {
        var self = this;
        if(val == false){
            self.init();
            for (var i = 0; i < self.allItem.size(); i ++) {
                $(self.allItem[i]).removeClass(self.disabledClassName).addClass(self.normalClassName);
            }
            $(self.defaultChecked).removeClass(self.normalClassName).addClass(self.checkClassName);
        }else if(val == true){
            self.defaultChecked = self.checkedItem;
            if(selectArray != null){
                for(var i=0; selectArray.length > i; i++){
                    self.allItem[selectArray[i]].onclick = function () {};
                    $(self.allItem[selectArray[i]]).removeClass(self.checkClassName).addClass(self.disabledClassName);
                    $(self.allItem[selectArray[i]]).removeClass(self.normalClassName).addClass(self.disabledClassName);
                }
            }else {
                // 为每个item绑定点击事件
                for (var i = 0; i < self.allItem.size(); i++) {
                    self.allItem[i].onclick = function () {};
                    $(self.allItem[i]).removeClass(self.checkClassName).addClass(self.disabledClassName);
                    $(self.allItem[i]).removeClass(self.normalClassName).addClass(self.disabledClassName);
                }
            }
        }
    };

    /**
     * html 模板
     */
    function Template(){}

    /**
     * one to one template
     * @param template_id : object id
     * @param data : JSONObject
     */
    Template.prototype.template_OneToOne=function(template_id, data){
        var tempObj = document.getElementById(template_id);
        var tempObj_show = document.getElementById(template_id+"_show");
        var newHTML = tempObj.innerHTML.replace(/\$\w+\$/gi, function(matchs) {
            var returns = data[matchs.replace(/\$/g, "")];
            return (returns + "") == "undefined"? "": returns;
        });
        tempObj_show.innerHTML = newHTML;
        window['lib'].flexible.refreshRem();
    };

    /**
     * more to one template
     * @param from_id : object id
     * @param to_id : object id
     * @param array_data : JSONObject Array
     */
    Template.prototype.template_MoreToOne = function(from_id, to_id, array_data) {
        var from_Obj = document.getElementById(from_id);
        var to_obj = document.getElementById(to_id);
        for(var i=0;array_data.length>i;i++){
            var newHTML = from_Obj.innerHTML.replace(/\$\w+\$/gi, function(matchs) {
                var returns = array_data[i][matchs.replace(/\$/g, "")];
                return (returns + "") == "undefined"? "": returns;
            });
            to_obj.innerHTML += newHTML;
            
        }
        window['lib'].flexible.refreshRem();
    };

    /**
     * @param id String
     * @param contJson {key : string,}
     * @param titleStr String
     * @param btnJson {key : func,}
     * @param type String （dialog|list）
     * @param callBack func
     * @param selectItemObj String
     * @constructor
     */
    function DialogClass(id, contJson, titleStr ,btnJson ,type ,callBack,selectItemObj) {
        this.id = id;
        this.contJson = contJson;
        this.titleStr = titleStr;
        this.btnJson = btnJson;
        this.type = type;
        this.dialogClass_bg = null;
        this.contOutDiv = null;
        this.callBack = callBack;
        this.selectItemObj = selectItemObj;
        if($('#' + this.id).html().replace(/\s/g,'').length == 0){
            this.init();
        }else{
            $('#' + this.id).show();
        }
    };

    DialogClass.prototype.init = function() {
        this.thisDom = document.getElementById(this.id);
        this.dialogClass_bg = document.createElement("div");
        this.dialogClass_bg.className = "dialogClass-bg";
        var self = this;
    
        //Add Transparent background
        this.thisDom.appendChild(this.dialogClass_bg);
        this.contOutDiv = document.createElement("div");
        //set title
        if(this.titleStr != null){
            this.setTitle();
        }
        //Add content
        switch (this.type){
            case 'dialog':
                this.contOutDiv.className = "dialogClass-content";
                this.setContent();
                break;
            case 'list':
                this.contOutDiv.className = "dialogClass-list-content box box-ver";
                this.setListContent();
                break;
        };
        //Add button
        if(this.btnJson != null){
            this.setButton();
        }
        //Adding outside content div
        this.thisDom.appendChild(this.contOutDiv);
    };
    DialogClass.prototype.setTitle = function() {
        var titleDiv = document.createElement("pre");
        titleDiv.className = "dialogClass-title";
        titleDiv.innerHTML = this.titleStr;
        this.contOutDiv.appendChild(titleDiv);
    };

    DialogClass.prototype.setTitlePublic = function(biogTitle) {
        $('#' + this.id +' .dialogClass-title').html(biogTitle);
    };

    DialogClass.prototype.setContent = function() {
        this.itemOutDiv = document.createElement("div");
        this.itemOutDiv.className = "dialogClass-div-item";
        for(var i in this.contJson){
            var itemDiv = document.createElement("div");
            itemDiv.className = "dialogClass-item";
            itemDiv.innerHTML = i +":"+ this.contJson[i];
            this.itemOutDiv.appendChild(itemDiv);
        }
        this.contOutDiv.appendChild(this.itemOutDiv);
    };

    DialogClass.prototype.setListContent = function(){
        var self = this;
        this.itemOutDiv = document.createElement("div");
        this.itemOutDiv.className = "box-f1 dialogClass-item-out";
        for(var i in this.contJson){
            var itemDiv = document.createElement("div");
            itemDiv.className = "dialogClass-list-item";
            itemDiv.innerHTML = i;
            itemDiv.setAttribute("data-val",self.contJson[i]);
            var itemImg = document.createElement("div");
            itemImg.className = "dialogClass-list-img-off";

            if(self.selectItemObj == self.contJson[i]){
                itemImg.className = "dialogClass-list-img-on";
                self.selectItemObj = itemDiv;
            }
            itemDiv.onclick = function(){
                if(self.selectItemObj != null){
                    $(self.selectItemObj).find('div').removeClass("dialogClass-list-img-on").addClass("dialogClass-list-img-off");
                }

                $(this).find('div').addClass("dialogClass-list-img-on");
                self.callBack(this.getAttribute("data-val"),this);
                self.selectItemObj = this;
            };
            itemDiv.appendChild(itemImg);
            this.itemOutDiv.appendChild(itemDiv);
        }
        this.contOutDiv.appendChild(this.itemOutDiv);
    };

    DialogClass.prototype.setButton = function() {
        var btnOutDiv = document.createElement("div");
        btnOutDiv.className = "box dialogClass-div-btn";
        for(var i in this.btnJson){
            var btnDiv = document.createElement("div");
            btnDiv.className = "box-f1 dialogClass-btn dialogClass-btn-goahead";
            btnDiv.innerHTML = i ;
            btnDiv.onclick = this.btnJson[i];
            btnOutDiv.appendChild(btnDiv);
        }
        this.itemOutDiv.appendChild(btnOutDiv);
    };

    DialogClass.prototype.setButtonClass = function(item ,className) {
        $(".dialogClass-btn:eq("+ [item-1] +")").addClass(className);
    };

    DialogClass.prototype.setItemClass = function(item ,className){
        $(".dialogClass-item:eq("+ [item-1] +")").addClass(className);
    };

    DialogClass.prototype.clearDialog = function(callBack) {
        this.thisDom.innerHTML = "";
        if(callBack != null && callBack != 'undefined'){
            callBack();
        }
    };

    DialogClass.prototype.hideDialog = function(callBack) {
        $('#' + this.id).hide();
        if(callBack != null && callBack != 'undefined'){
            callBack();
        }
    };

    /**
     * Drop Down
     * @param id String
     * @param thisObj obj
     * @param conJson JSON
     * @param callBack  Func
     * @param funcBoxBG Func
     */
    function dropDownBox(id, thisObj, conJson, callBack, funcBoxBG){
        this.id = id;
        this.thisObj = thisObj;
        this.contJson = conJson;
        this.callBack = callBack;
        this.funcBoxBG = funcBoxBG;
        if(this.thisObj != null){
            this.boxWidth = $(this.thisObj).width();
            this.boxHeight = $(this.thisObj).height();
            this.boxTopHeight = this.thisObj.offsetTop;
            this.boxLeft = this.thisObj.offsetLeft;
        }

        $('#' + this.id).html("") ;
        this.init();
    }

    dropDownBox.prototype.init = function(){
        var self =this;
        this.thisDom = document.getElementById(this.id);
        this.dropDownBox_bg = document.createElement("div");
        this.dropDownBox_bg.className = "dropDownBox-bg";
        this.dropDownBox_bg.onclick = function(){
            self.funcBoxBG();
        };
        //Add Transparent background
        this.thisDom.appendChild(this.dropDownBox_bg);
        this.contOutDiv  = document.createElement("div");
        this.contOutDiv.className = "dropDownBox-list-content";
        $(this.contOutDiv).width(this.boxWidth + 'px');
        this.contOutDiv.style.top = (this.boxTopHeight + this.boxHeight + 3) + 'px';
        this.contOutDiv.style.left = this.boxLeft + 'px';
        console.log(JSON.stringify(this.contJson));
        this.setListContent();
        this.thisDom.appendChild(this.contOutDiv);
    };

    dropDownBox.prototype.setListContent = function(){
        var self = this;
        this.itemOutDiv = document.createElement("div");
        for(var i in this.contJson){
            var itemDiv = document.createElement("div");
            itemDiv.className = "dropDownBox-list-item";
            itemDiv.innerHTML = i;
            itemDiv.setAttribute("data-val",self.contJson[i]);
            itemDiv.onclick = function(){
                self.callBack(this.getAttribute("data-val"),this);
            };
            this.itemOutDiv.appendChild(itemDiv);
        }
        this.contOutDiv.appendChild(this.itemOutDiv);
    };


    dropDownBox.prototype.clearDropDownBox = function(callBack) {
        this.thisDom.innerHTML = "";
        if(callBack != null && callBack != 'undefined'){
            callBack();
        }
    };

    dropDownBox.prototype.hideDropDownBox = function(callBack) {
        $('#' + this.id).hide();
        if(callBack != null && callBack != 'undefined'){
            callBack();
        }
    };

    var showDialogClass = function(type, callBack, msgJson) {
        this.type = type;
        this.callBack = callBack;
        this.msgJson = msgJson;
        this.init();
    };

    showDialogClass.prototype.init = function() {
    	var self = this;
        switch (this.type){
            case 'showDateChoiceDialog':
                Bestpay.Dialog.showDateChoiceDialog(Lang.getDate_YYYY_MM_DD(),this.callBack);
                break;
            case 'showDateModifyDialog':
                Bestpay.Dialog.showDateChoiceDialog(self.msgJson,this.callBack);
                break;
        }
    };

    /*
     * 网格列表
     * @param htmlArray [array] //每个列表里的HTML数组
     * @param index [number] //默认选择项
     */
    function GridList(htmlArray, index) { 
    	this.htmlArray = htmlArray; //array
    	this.listlength = htmlArray.length; 
    	this.doc = document;
    	this.index = index;
    	this.fragment = document.createDocumentFragment();

    	this.paintHTML();
    };

    GridList.prototype.paintHTML = function() { 
    	var self = this;
    	var HTML = [];
    	for(var i = 0; i < self.listlength; i++){ 
			HTML[i] = document.createElement("div");
			
			HTML[i].setAttribute("data-value", i);
			if(i == self.index){ 
				HTML[i].className = "gridlist gridlist_active";
			}else{ 
				HTML[i].className = "gridlist";
			}
			HTML[i].innerHTML = self.htmlArray[i];
			HTML[i].onclick = function(){
				for(var i = 0; i < self.listlength; i++){ 
					document.getElementsByClassName("gridlist")[i].className = "gridlist";
				}
				this.className = "gridlist gridlist_active";
				self.index = this.getAttribute("data-value");
			}
			self.fragment.appendChild(HTML[i]);
    	}
    };

    GridList.prototype.getHTML = function() { 
    	return this.fragment;
    };

    GridList.prototype.getIndex = function() { 
    	return this.index;
    };
    
    /*
     * 支付插件
     * @param args [object]
     * @param args{ 
     *   accountName: value, //[string] 充值账号名称
     *   accouontValue: value, //[string] 充值账号值
     *   rechargeMoney: value, //[string] 充值金额(元)
     *   rewardType: value, //[string] @param value[reward/zhejia] 酬金查询/折价查询的类型（默认酬金查询）
     *   rewardMoney: value, //[string] 酬金查询/折价查询 的金额
     *   jfyBalance: value, //[string] 交费易余额
     *   tybBalance: value, //[string] 添益宝余额
     *   enablePassword: value, //[boolean] @param value[true/false] 是否免密
     *   userInfo: userInfo, //登录信息
     *   callback: function //按确定后调用的方法
     * }
     */
    function paymentPlugin(args) {
        this.businessName = args.businessName || '';
    	this.accountName = args.accountName || '';
    	this.accouontValue = args.accouontValue || '0';
    	this.rechargeMoney = args.rechargeMoney || '0';
    	this.rewardType = args.rewardType || 'reward';
    	this.rewardMoney = args.rewardMoney || '0';
    	this.jfyBalance = args.jfyBalance;
    	this.tybBalance = args.tybBalance;
    	this.enablePassword = args.enablePassword;
    	this.userInfo = args.userInfo;
    	this.callback = args.callback || function(){};
    	this.payType = '1'; //默认付款方式 1-添益宝

    	this.init();
    }

    paymentPlugin.prototype.init = function(){ 
    	var self = this;
    	self.payDetailHTML(); //写入HTML
    	self.balanceCheck(); //判断余额
    	self.setRewardClick(); //酬金按钮
    	self.setPayClick(); //设置选择付款方式事件
    };

    paymentPlugin.prototype.payDetailHTML = function() { 
    	var self = this;
    	var orderPage = $("#order_comfirm"); //订单页面
    	var html = '';
    	var payMoney = '0'; //支付金额
    	var rewardText = '';
    	var _rewardMoney = '';
    	var display = '';
        var yuan_zhejia = '';

    	//酬金还是折价查询
    	if(this.rewardType === 'reward') { 
    		//酬金
    		payMoney = (this.rechargeMoney*1).toFixed(2);
    		rewardText = '酬&emsp;&emsp;金';
    		_rewardMoney = (this.rewardMoney*1).toFixed(2);
            yuan_zhejia = "元";
    	}else if (this.rewardType === 'zhejia') {
			//折价
			payMoney = (this.rewardMoney*1).toFixed(2);
			//rewardText = '建议售价';
            rewardText = '折&emsp;&emsp;价';
			//_rewardMoney = (this.rewardMoney*1).toFixed(2);
            _rewardMoney = ((this.rewardMoney*1)/(this.rechargeMoney*1))*100;
			//display = 'display:none';
            yuan_zhejia = "折";
    	}

		html += '<div id="id_confirm_wrap" class="div-confirm-wrap">';
		html += '<div class="confirmTitle">';
		html += '<ul class="box">';
		html += '<li class="box-f1">' + this.accountName + '</li>';
		html += '<li class="box-f3">' + this.accouontValue + '</li>';
		html += '</ul>';
		html += '</div>';
		html += '<div id="confirm_template">';
		html += '<div id="rewardItems" class="new-payConfirmItem closeReward">';
		html += '<div class="confirm-item"><em>应收顾客</em><span class="pay_money fontWeight">' + (this.rechargeMoney*1).toFixed(2) + '</span> 元</div>';
		html += '<div class="confirm-item"><div class="confirm-item-sub">';
		html += '<em>支付金额</em>';
		html += '<span class="secret">*****</span>';
		html += '<span class="notsecret"><i class="pay_money">' + payMoney + '</i> 元</span></div>';
		html += '<span id="id_confirm_eyes" class="confirm-eyes"></span>';
		html += '</div>';
		html += '<div class="confirm-item" id="reward_wrap" style="' + display + '">';
		html += '<em>' + rewardText + '</em>';
		html += '<span class="secret">*****</span>';
		html += '<span id="reward" class="notsecret"><i class="pay_money">' + _rewardMoney + '</i>'+ yuan_zhejia +'</span>';
		html += '</div>';
		html += '</div>';
		html += '</div>';
		html += '<div class="confirmTitle">';
		html += '<ul class="box">';
		html += '<li class="box-f1">付款方式</li>';
		html += '<li class="box-f3">&emsp;&emsp;&emsp;&emsp;</li>';
		html += '</ul>';
		html += '</div>';
		html += '<div id="tianyibao_pay">';
		html += '<div class="box account-wrap" id="tyb_account_wrap">';
		html += '<div class="box-f3 box radioClick">';
		html += '<div class="box-f1 pay-radio pay-radio-off" id="tyb_radio"></div>';
		html += '<div class="box-f1 account-icon account-tyb"></div>';
		html += '<div class="box-f1 account-content">';
		html += '<div>添益宝</div>';
		html += '<div>￥' + (this.tybBalance*1).toFixed(2) + '</div>';
		html += '</div>';
		html += '</div>';
		html += '<div class="box-f1 account-recharge" id="tyb_charge">余额不足<em></em></div>';
		html += '<input type="hidden" id="tybBalance_val">';
		html += '</div>';
		html += '<div class="box account-wrap">';
		html += '<div class="box-f3 box radioClick">';
		html += '<div class="box-f1 pay-radio pay-radio-off" id="jfy_radio"></div>';
		html += '<div class="box-f1 account-icon account-jfy"></div>';
		html += '<div class="box-f1 account-content">';
		html += '<div>余&emsp;额</div>';
		html += '<div>￥' + (this.jfyBalance*1).toFixed(2) + '</div>';
		html += '</div>';
		html += '</div>';
		html += '<div class="box-f1 account-recharge" id="jfy_charge">余额不足<em></em></div>';
		html += '<input type="hidden" id="jfyBalance_val">';
		html += '</div></div>';
		html += '<div class="TOPplaceholder"></div>';
		html += '<div class="line-box-wrap confirm_botton">';
		html += '<div class="btn-common-wrap">';
		html += '<button id="confirm_botton">确 定</button>';
		html += '<div class="TOPplaceholder"></div>';
		html += '</div></div></div>';

	    orderPage.html(html);
    };

    /*
     * 设置按钮是否可用
     * @param true 可用
     * @param false 不可用
     */
    paymentPlugin.prototype.setButtonAvailable = function(val) { 
    	var self = this;
    	var botton = $('#confirm_botton');
    	botton.off('click');

    	if(val){ 
    		//可用
    		botton.removeClass('unavailable');
    		botton.on('click', function(){
                self.itJudgeLocalStorage = new JudgeLocalStorage();
                self.itJudgeLocalStorage.putLocalValue(self.accouontValue.replace(/\s/g,''),parseInt(self.rechargeMoney*100),HTTP.getCurrentTime(),self.businessName);

    			if(!self.enablePassword){ //免密
    				console.log("=======免密======");
    				config.payingBack = true;
    				self.callback('');
    				return;
    			}
                PasswordKeyBoard.initPwdUI3(function(val){
                	config.payingBack = true;
                    self.callback(val);
                });
                PasswordKeyBoard.popKeyboardUI3();
            });
    	}else{ 
    		//不可用
    		botton.addClass('unavailable');
    	}
    };

    /*
     * 设置支付方式 click 事件
     */
    paymentPlugin.prototype.judgeNotFundsPut = function(notFunds){
        var self = this;
        self.noFoudsTybOrJby = notFunds;
        console.log("123self.noFoudsTybOrJby = " + self.noFoudsTybOrJby);
        //跳转充值页面
        self.jumpToRecharge();
    };
    //paymentPlugin.prototype.judgeNotFundsSet = function(){
    //    Bestpay.Preference.get('notSufficientFunds','','')
    //};


    paymentPlugin.prototype.setPayClick = function() { 
    	var self = this;
    	var accountWrap = $(".radioClick");
    	var tyb_btn = accountWrap.eq(0); //添益宝余额按钮
    	var jfy_btn = accountWrap.eq(1); //交费易余额按钮
    	var jfy_val = $("#jfyBalance_val").val();
    	var tyb_val = $("#tybBalance_val").val();

    	jfy_btn.off('click');
    	tyb_btn.off('click');
    	$("#jfy_charge").off('click');
    	$("#tyb_charge").off('click');

    	if(jfy_val === 'availalbe'){ 
    		//交费易余额可用
    		jfy_btn.parent('.account-wrap').removeClass('account-noMoney');
    		jfy_btn.click(function(){ 
    			console.log("交费易 click");
    			self.setChoice('jfy');
    			self.setButtonAvailable(true); //设置确定按钮可用
    		});
    	}else if(jfy_val === 'unavailalbe'){ 
    		//交费易余额不足
    		jfy_btn.parent('.account-wrap').addClass('account-noMoney');
    		jfy_btn.on('click', function(){ 
    			self.setChoice('jfy');
    			self.setButtonAvailable(false); //置灰按钮
    			
    		});
    		$("#jfy_charge").on('click', function(){
                //跳转充值页面
                self.judgeNotFundsPut('jfyFunds');
    		});
    	}

    	if(tyb_val === 'availalbe'){ 
    		tyb_btn.parent('.account-wrap').removeClass('account-noMoney');
    		tyb_btn.click(function(){ 
    			console.log("添益宝 click");
    			self.setChoice('tyb');
    			self.setButtonAvailable(true); //设置确定按钮可用
    		});
    	}else if(tyb_val === 'unavailalbe'){ 
    		tyb_btn.parent('.account-wrap').addClass('account-noMoney');
    		tyb_btn.on('click', function(){ 
    			self.setChoice('tyb');
    			self.setButtonAvailable(false); //置灰按钮
    		});
    		$("#tyb_charge").on('click', function(){ 
    			//跳转到添益宝
    			//App.jumpToNewTianyibao();  20160419修改
                //跳转充值页面
                self.judgeNotFundsPut('tybFunds');
    		});
    	}
    };

    /*
     * 返回支付方式
     * 0是交费易  1是添益宝
     */
    paymentPlugin.prototype.getPayType = function(){ 
    	var self = this;
    	 return self.payType;
    };

    /*
     * 显示酬金
     */
    paymentPlugin.prototype.setShowReward = function(val){ 
    	if(val === 'hide'){ 
    		$("#rewardItems").addClass('closeReward');
    		$("#id_confirm_eyes").removeClass('see-eyes');
    	}if(val === 'show'){ 
    		$("#rewardItems").removeClass('closeReward');
    		$("#id_confirm_eyes").addClass('see-eyes');
    	}
    };

    /*
     * 显示酬金事件
     */
    paymentPlugin.prototype.setRewardClick = function(){ 
    	var self = this;
        var isOne = true;
    	$("#id_confirm_eyes").click(function() {
    		if($(this).hasClass('see-eyes')){ 
    			self.setShowReward('hide');
    		}else{ 
				self.setShowReward('show');
                if(isOne){
                    Bestpay.TalkingData.onEventWithLabel('支付页面','点击酬金显示按钮');
                    isOne = false;
                }
            }
    	})
    };


    /*
     * 设置余额是否充足
     * @param type - jfyBalance 交费易余额
     * @param type - tybBalance 添益宝余额
     * @param val - availalbe 充足
     * @param val - unavailalbe 不足
     */
    paymentPlugin.prototype.setHiddenInput = function(type,val) { 
    	var self = this;
    	var jfyBalance = $("#jfyBalance_val");
    	var tybBalance = $("#tybBalance_val");

    	if(type === 'jfyBalance'){
 			jfyBalance.val(val);
    	}else if(type === 'tybBalance') { 
    		tybBalance.val(val);
    	}
    };

    /*
     * 勾选交费易或者添益宝
     */
    paymentPlugin.prototype.setChoice = function(which){ 
    	var self = this;
    	$(".pay-radio").removeClass('pay-radio-on');
    	if(which === 'jfy'){ 
    		$('#jfy_radio').addClass('pay-radio-on');
    		self.payType = '0'; //支付方式  0是交费易
    	}else if(which === 'tyb'){ 
    		$('#tyb_radio').addClass('pay-radio-on');
    		self.payType = '1'; //支付方式  1是添益宝
    	}
    	
    };

    /*
	 * 判断交费易/添益宝 支付方式
	 */
	paymentPlugin.prototype.balanceCheck = function() {
		var self = this;
		var rechargeMoney_number = this.rechargeMoney * 1; //充值金额
		var jfyBalance_number = this.jfyBalance * 1; //交费易余额
		var tybBalance_number = this.tybBalance * 1; //添益宝余额
		
		console.log("this.jfyBalance=="+this.jfyBalance);
		console.log("this.tybBalance=="+this.tybBalance);

		if(!!this.tybBalance) { 
			//有开通添益宝
			//勾选添益宝
			self.setChoice('tyb');

			if(tybBalance_number >= rechargeMoney_number){ 
				//添益宝 余额充足
				//设置隐藏input为 true
				self.setButtonAvailable(true);
				self.setHiddenInput('tybBalance', 'availalbe');
			}else{ 
				//添益宝余额不足
				//设置隐藏input为 false
				self.setButtonAvailable(false);
				self.setHiddenInput('tybBalance', 'unavailalbe');
			}

			if(!!this.jfyBalance && jfyBalance_number >= rechargeMoney_number) { 
				//交费易付款 余额充足
				self.setHiddenInput('jfyBalance', 'availalbe');
			}else{ 
				//交费易余额不足
				//设置隐藏input为 false
				self.setHiddenInput('jfyBalance', 'unavailalbe');
			}
		}else{ 
			//没开通添益宝
			//隐藏添益宝整栏
			$("#tyb_account_wrap").hide();
			//勾选交费易
			self.setChoice('jfy');

			if(!!this.jfyBalance && jfyBalance_number >= rechargeMoney_number) { 
				//交费易付款 余额充足
				//设置隐藏input为 true
				self.setButtonAvailable(true);
				self.setHiddenInput('jfyBalance', 'availalbe');
			}else{ 
				//交费易余额不足
				//付款按钮置灰

				self.setButtonAvailable(false);
				//设置隐藏input为 false
				self.setHiddenInput('jfyBalance', 'unavailalbe');
			}
		}
			
		if(config.CARD_TYPE.BANK_MODE_FUND_POOL_MEMBER_CARD === this.userInfo.bankMode){ 
			//子卡登录按钮置灰
            //self.setButtonAvailable(false); //YangHH
			self.setShowReward('hide');
			$("#reward_wrap").hide();
		}
	};

	/*
	 * 跳到充值页面
	 */
	paymentPlugin.prototype.jumpToRecharge = function() { 
		var self = this;
        var urlEnd = "?ENV="+config.ENV;
		var url;
		var origin = location.origin;

		if(config.ENV === 'PRODUCT'){ 
			//生产环境 
			url = origin + "/2015UI/pluginRAB";
		}else{ 
			//测试环境 
			//url = origin + "/test/20160406/pluginRAB";

            url = origin + "/test/20160419/pluginRAB";
		}

        console.log('123 noFoudsTybOrJby = ' + self.noFoudsTybOrJby);
        var rechargeURL = url + '/reCharge.html'+urlEnd + "#JUDGE=" + self.noFoudsTybOrJby; //跳到充值页面地址
		console.log(rechargeURL+"============================URL RE");
		//跳到充值页面  
		App.jumpToNewH5View(rechargeURL, function(){ 
            back();
		});     
	};

    /*
     * 跳到认证页面
     */
    paymentPlugin.prototype.jumpToAuthority = function() {
        var self = this;
        var urlEnd = "?ENV="+config.ENV;
        var url;
        var origin = location.origin;
        console.log("##origin ==== " + origin);

        if(config.ENV === 'PRODUCT'){
            //生产环境
            url = origin + "/online_h5/pluginRAB";
        }else{
            //测试环境
            url = origin + "/test/20160419/pluginRAB";
        }

        var authorityURL = url + '/authority.html'+urlEnd; //跳到认证页面地址
        console.log(authorityURL + "============================URL RE");
        //跳到充值页面
        App.jumpToNewH5View(authorityURL, function(){
            back();
        });
    };

	/*
	 * 设置订单显示内容
	 * @param type [success- 成功, overtime-业务受理]
	 */
	paymentPlugin.prototype.setOrderDisplay = function(type){ 
		var self = this;
		var html = '';
		var overtimeIMG = '../lib/img/receving.png';
		var overtimeH1 = '交易已受理';
		var overtimeH2 = '稍后请确认订单状态';
		var overtimeBottonText = '查看订单状态';

		var successIMG = '../lib/img/success.png';
		var successH1 = '交易成功';
		var successH2 = '预计10分钟内到账';
		var successBottonText = '再来一次';

		PasswordKeyBoard.hideKeyboardUI3(); //隐藏密码键盘

		if(type === 'overtime'){ 
			html += '<div class="success-title-img">';
           	html += '<br><img src="' + overtimeIMG + '"><br><br>';
			html += '<span>' + overtimeH1 + '</span>';
			html += '<em class="success-title-dz">' + overtimeH2 + '</em><br><br>';
            html += '</div>';
            html += '<div class="success-percent">';
            html += '<div class="box success-div-btn">';
            html += '<div id="checkOrder" class="box-f1 success-btn checkOrder">' + overtimeBottonText + '</div>';
            html += '</div></div>';

            $("#floatPageContent").html(html);
	        document.getElementById('checkOrder').onclick = function() { //订单查询
				var deviceInfo = JSON.parse(Bestpay.App.getDeviceInfo());
		        var clientVersion = deviceInfo.clientVersion; //版本号
		        var systemType = deviceInfo.systemType; //系统系统类型
		        clientVersion = clientVersion.replace(/\./g,'') * 1;
		        systemType = systemType.toLowerCase();
		        if((systemType === 'android' && clientVersion >= 329) || (systemType === 'ios' && clientVersion >= 305)){ 
		        	Bestpay.Dialog.jumpToOrderQuery(config.TITLE.submited_title,config.MSG.msg_submited_content,'确定',
	                config.TRADE_LIST_QUERY_TYPE,config.TRADE_LIST_QUERY_NUMBER);
		            if(window.jqXHR.readyState > 2){
						location.reload();
					}
		        }else{ 
		        	Bestpay.Dialog.showAlertSynchroDialog(config.TITLE.submited_title,config.MSG.msg_submited_content,'确定',
	                config.TRADE_LIST_QUERY_TYPE,config.TRADE_LIST_QUERY_NUMBER);
		        }
			};
			config.isBack = function(){
	            if(window.jqXHR.readyState > 2) {   //window.jqXHR.readyState 判断请求有没有发出去
	                Bestpay.App.exitApp();
	            }
	        };
		}else if(type === 'success') { 
			html += '<div class="success-title-img">';
           	html += '<br><img src="' + successIMG + '"><br><br>';
			html += '<span>' + successH1 + '</span>';
			html += '<em class="success-title-dz">' + successH2 + '</em><br><br>';
            html += '</div>';
            html += '<div class="success-percent">';
            html += '<div class="box success-div-btn">';
            html += '<div id="getback" class="box-f1 success-btn success-btn-goahead">返回大厅</div>';
            html += '<div id="onceAgain" class="box-f1 success-btn checkOrder">' + successBottonText + '</div>';
            html += '</div></div>';

            $("#floatPageContent").html(html);
            document.getElementById('getback').onclick = function(){   //返回
	            if(window.jqXHR.readyState > 2) {
	            	Bestpay.TalkingData.onEventWithLabel('支付页面','返回大厅');
	            	Bestpay.App.exitApp();
	            }
	        };
	        document.getElementById('onceAgain').onclick = function(){   //再来一次
	            if(window.jqXHR.readyState > 2) {
	            	Bestpay.TalkingData.onEventWithLabel('支付页面','再来一次');
	            	location.reload();
	            }
	        };
		}
	}

    //点击事件的触模事件
    var clickBtnNext = function(){
        //手指按向按钮
        var cont_btn=$("#btn_next");
        cont_btn.on("touchstart",function(){
            $(this).css({'background-color' : '#EB7605'})
        });
        cont_btn.on("touchend touchmove touchcancel",function(){
            $(this).css({'background-color' : '#ff7e00'})
        });
    };
    clickBtnNext();

    var JudgeLocalStorage = function(){
        var self = this;
        var deviceInfo = JSON.parse(Bestpay.App.getDeviceInfo());
        self.clientVersion = deviceInfo.clientVersion; //版本号
        self.systemType = deviceInfo.systemType; //系统系统类型
        self.clientVersion = self.clientVersion.replace(/\./g,'') * 1;
        self.systemType = self.systemType.toLowerCase();
    };
    JudgeLocalStorage.prototype.putLocalValue = function(number,amount,currentTime,businessName){
        var self = this;
        this.number = number;
        this.amount = amount;
        this.currentTime = currentTime;
        this.businessName = businessName;
        //保存
        //手机号码，Number
        //金额，Amount
        //时间，CurrentTime
        //业务名称,BusinessName
        if((self.systemType === 'android' && self.clientVersion >= 406) || (self.systemType === 'ios' && self.clientVersion >= 403)){
            Bestpay.Preference.put('Number',self.number,'');
            Bestpay.Preference.put('Amount',self.amount,'');
            Bestpay.Preference.put('CurrentTime',self.currentTime,'');
            Bestpay.Preference.put('BusinessName',self.businessName,'');
            console.log('put123===' + self.number);
            console.log('put123===' + self.amount);
            console.log('put123===' + self.currentTime);
            console.log('put123===' + self.businessName);
        }
    };
    JudgeLocalStorage.prototype.getLocalValue = function(){
        var self = this;
        //获取
        //手机号码，Number
        //金额，Amount
        //时间，CurrentTime
        //业务名称，BusinessName
        var result = {};
        result.Number=  Bestpay.Preference.get('Number','','');
        result.Amount=  Bestpay.Preference.get('Amount','','');
        result.CurrentTime=  Bestpay.Preference.get('CurrentTime','','');
        result.BusinessName=  Bestpay.Preference.get('BusinessName','','');
        return result ;
    };

    JudgeLocalStorage.prototype.checkOrder = function(number,amount,currentTime,callFun,businessName){
        var self = this;
        //获取
        //手机号码，Number
        //金额，Amount
        //时间，CurrentTime
        //业务名称，BusinessName
        console.log('开始判断');
        if((self.systemType === 'android' && self.clientVersion >= 406) || (self.systemType === 'ios' && self.clientVersion >= 403)){
            var result = self.getLocalValue();
            console.log('123result过去 = ' + JSON.stringify(result));
            console.log('123number当前 = ' + number);
            console.log('123amount当前 = ' + amount*100);
            console.log('123currentTime当前 = ' + currentTime);
            console.log('123businessName当前 = ' + businessName);
            if(number == result.Number && amount*100 == result.Amount&& businessName == result.BusinessName){
                if(Lang.getTime_CONTRAST(result.CurrentTime,currentTime,2)<=10){
                    console.log('相同判断');
                    self.InnerPing(callFun);
                    return ;
                }
            }
            console.log('123不相同判断');
            callFun();
        }
        callFun();
    };
    JudgeLocalStorage.prototype.InnerPing = function(callFun){
        var self = this;
        var page_LocalHost =  $("#page_LocalHost");
        var ObjHtml = '<div class="floatParent">'+
            '<div class="backblack"></div>'+
            '<div class="FloatCenter">'+
            '<div class="alert_cet">'+'该号码已有订单处理中，是否重复充值？'+'</div>'+
            '<ul class="alert_U boxbox alertBtnTouch">'+
            '<li id="InnerGoAhead">'+'继续充值'+'</li>'+
            '<li id="WatchOrder">'+'查看订单'+'</li>'+
            '</ul>'+
            '</div></div>';
        page_LocalHost.html(ObjHtml);
        goTo(config.page.LocalHost);
        self.InnerBtnInit(callFun);
    };
    JudgeLocalStorage.prototype.InnerBtnInit = function(callFun){
        //手指按向按钮
        var cont_btn=$(".alertBtnTouch li");
        cont_btn.on("touchstart",function(){
            $(this).addClass("itemHover");
        });
        cont_btn.on("touchend touchmove touchcancel",function(){
            $(this).removeClass("itemHover");
        });
        document.getElementById('InnerGoAhead').onclick = function(){
            back();
            callFun();
        };
        document.getElementById('WatchOrder').onclick = function(){
            back();
            Bestpay.Dialog.jumpToOrderQuery(config.TITLE.submited_title,config.MSG.msg_submited_content,'确定',
                config.TRADE_LIST_QUERY_TYPE,config.TRADE_LIST_QUERY_NUMBER);
        }
    };



    return {
        'InputText' : InputText,
        'BlockRadioGroup' : BlockRadioGroup,
        'dropDownBox' : dropDownBox,
        'DialogClass' : DialogClass,
        'showDialogClass' : showDialogClass,
        'Template':Template,
        'paymentPlugin' : paymentPlugin,
        'GridList' : GridList,
        'JudgeLocalStorage' : JudgeLocalStorage
    };
});