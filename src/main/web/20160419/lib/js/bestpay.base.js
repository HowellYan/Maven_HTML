/**
 * Created by liuyun on 15/4/26.
 * Version 1.0
 * (C)Copyright www.bestpay.com.cn Corporation. 2015-20XX All rights reserved.
 */

var urlAll = window.location.href,url, isRecords,isMin=false;
url = urlAll.substring(urlAll.lastIndexOf('/') + 1, urlAll.lastIndexOf('.html'));
if(url.indexOf(".min") > 0){
    isMin = true;
    url = url.substring(0, url.lastIndexOf('.min'));
}

//flexible
!function(a,b){function c(){console.log("base:flexible1");var b=f.getBoundingClientRect().width;b/i>540&&(b=540*i);var c=b/9;f.style.fontSize=c+"px",k.rem=a.rem=c;console.log("base:flexible2");}var d,e=a.document,f=e.documentElement,g=e.querySelector('meta[name="viewport"]'),h=e.querySelector('meta[name="flexible"]'),i=0,j=0,k=b.flexible||(b.flexible={});if(g){console.warn("将根据已有的meta标签来设置缩放比例");var l=g.getAttribute("content").match(/initial\-scale=([\d\.]+)/);l&&(j=parseFloat(l[1]),i=parseInt(1/j))}else if(h){var m=h.getAttribute("content");if(m){var n=m.match(/initial\-dpr=([\d\.]+)/),o=m.match(/maximum\-dpr=([\d\.]+)/);n&&(i=parseFloat(n[1]),j=parseFloat((1/i).toFixed(2))),o&&(i=parseFloat(o[1]),j=parseFloat((1/i).toFixed(2)))}}if(!i&&!j){var p=a.navigator.userAgent,q=(!!p.match(/android/gi),!!p.match(/iphone/gi)),r=q&&!!p.match(/OS 9_3/),s=a.devicePixelRatio;i=q&&!r?s>=3&&(!i||i>=3)?3:s>=2&&(!i||i>=2)?2:1:1,j=1/i}if(f.setAttribute("data-dpr",i),!g)if(g=e.createElement("meta"),g.setAttribute("name","viewport"),g.setAttribute("content","initial-scale="+j+", maximum-scale="+j+", minimum-scale="+j+", user-scalable=no"),f.firstElementChild)f.firstElementChild.appendChild(g);else{var t=e.createElement("div");t.appendChild(g),e.write(t.innerHTML)}a.addEventListener("resize",function(){clearTimeout(d),d=setTimeout(c,300)},!1),a.addEventListener("pageshow",function(a){a.persisted&&(clearTimeout(d),d=setTimeout(c,300))},!1),"complete"===e.readyState?e.body.style.fontSize=12*i+"px":e.addEventListener("DOMContentLoaded",function(){e.body.style.fontSize=12*i+"px"},!1),c(),k.dpr=a.dpr=i,k.refreshRem=c,k.rem2px=function(a){var b=parseFloat(a)*this.rem;return"string"==typeof a&&a.match(/rem$/)&&(b+="px"),b},k.px2rem=function(a){var b=parseFloat(a)/this.rem;return"string"==typeof a&&a.match(/px$/)&&(b+="rem"),b}}(window,window.lib||(window.lib={}));


var eObj=document.getElementById('page_main');if(!!eObj){eObj.style.display='block';};


;(function() {
    /*Construct the FastButton with a reference to the element and click handler.*/
    this.FastButton = function(element, handler) {
        console.log('fastbutton init');
        this.element = element;
        this.handler = handler;
        console.log(this);
        element.addEventListener('touchstart', this, false);
        element.addEventListener('click', this, false);
    };

    /*acts as an event dispatcher*/
    this.FastButton.prototype.handleEvent = function(event) {
        console.log(event);
        switch (event.type) {
            case 'touchstart': this.onTouchStart(event); break;
            case 'touchmove': this.onTouchMove(event); break;
            case 'touchend': this.onClick(event); break;
            case 'click': this.onClick(event); break;
        }
    };

    /*Save a reference to the touchstart coordinate and start listening to touchmove and
     touchend events. Calling stopPropagation guarantees that other behaviors don’t get a
     chance to handle the same click event. This is executed at the beginning of touch.*/
    this.FastButton.prototype.onTouchStart = function(event) {
        event.stopPropagation();
        this.element.addEventListener('touchend', this, false);
        document.body.addEventListener('touchmove', this, false);
        this.startX = event.touches[0].clientX;
        this.startY = event.touches[0].clientY;
    };

    /*When /if touchmove event is invoked, check if the user has dragged past the threshold of 10px.*/
    this.FastButton.prototype.onTouchMove = function(event) {
        if (Math.abs(event.touches[0].clientX - this.startX) > 10 ||
            Math.abs(event.touches[0].clientY - this.startY) > 10) {
            this.reset(); //if he did, then cancel the touch event
        }
    };

    /*Invoke the actual click handler and prevent ghost clicks if this was a touchend event.*/
    this.FastButton.prototype.onClick = function(event) {
        event.stopPropagation();
        this.reset();
        this.handler(event);
        if (event.type == 'touchend') {
            console.log('touchend');
            //clickbuster.preventGhostClick(this.startX, this.startY);
        }
    };

    this.FastButton.prototype.reset = function() {
        this.element.removeEventListener('touchend', this, false);
        document.body.removeEventListener('touchmove', this, false);
    };

    this.clickbuster = function() {
        console.log('init clickbuster');
    }
    /*Call preventGhostClick to bust all click events that happen within 25px of
     the provided x, y coordinates in the next 2.5s.*/
    this.clickbuster.preventGhostClick = function(x, y) {
        clickbuster.coordinates.push(x, y);
        window.setTimeout(this.clickbuster.pop, 2500);
    };

    this.clickbuster.pop = function() {
        this.clickbuster.coordinates.splice(0, 2);
    };
    /*If we catch a click event inside the given radius and time threshold then we call
     stopPropagation and preventDefault. Calling preventDefault will stop links
     from being activated.*/
    this.clickbuster.onClick = function(event) {
        for (var i = 0; i < clickbuster.coordinates.length; i += 2) {
            console.log(this);
            var x = clickbuster.coordinates[i];
            var y = clickbuster.coordinates[i + 1];
            if (Math.abs(event.clientX - x) < 25 && Math.abs(event.clientY - y) < 25) {
                event.stopPropagation();
                event.preventDefault();
            }
        }
    };

})(this);

function urlParameters(urlParame) {
    var url;
    if(urlParame==null){
        url=document.URL;
    }else{
        url=urlParame;
    }
    if (url.lastIndexOf("#") != -1) {
        url = url.substring(0, url.lastIndexOf("#"));
    }
    var para = "";
    var retJson={};
    if (url.lastIndexOf("?") > 0) {
        para = url.substring(url.lastIndexOf("?") + 1, url.length);
        var arr = para.split("&");
        para = "";
        for (var i = 0; i < arr.length; i++) {
            retJson[arr[i].split("=")[0]]=arr[i].split("=")[1];
        }
        console.log(JSON.stringify(retJson));
    } else {
        console.log("没有参数!");
    }
    return retJson;
}

document.addEventListener('click', clickbuster.onClick, true);
clickbuster.coordinates = [];
var baseUrl = "../../lib/js/",minStr = "";
if(isMin){
    minStr = "min.";
    baseUrl = "../../lib/js/"+minStr;
}

require.config({
    baseUrl : "js",
    waitSeconds: 0,
    paths : {
        // 底层库
        'jquery' :          '../../lib/js/jquery-1.10.2.min',
        'android':          '../../lib/js/android',
        'ios' :             '../../lib/js/ios',
        'browser' :         '../../lib/js/browser',
        'bestpay.lang' :    baseUrl+'bestpay.lang',
        'bestpay.ui' :      baseUrl+'bestpay.ui',
        'bestpay.http' :    baseUrl+'bestpay.http',
        'global' :          baseUrl+'global',
        'bestpay.base' :    baseUrl+'bestpay.base',
        'jtemplates' :      '../../lib/js/jquery-jtemplates',
        'dummy' :           '../../dummy',

        // 子应用特有
        'subconfig' : minStr+'config',
        'subclass'  : minStr+url
    },
    shim: {
        'jtemplates' : ['jquery']
    }
    //,
    //,urlArgs : "bust=" + (new Date()).getTime()
    ,urlArgs : "bust=${online_version}"  //上线就改成这个
});


require(['global', 'subconfig'], function (config, subconfig) {
    // 将模块中的配置覆盖全局配置
    for (var prop in subconfig) {
        config[prop] = subconfig[prop];
    }

    window.config = config;
    window.dialogId = 0;

    var urlJSON = urlParameters(urlAll);
    if(urlJSON.ENV != null){
        config.ENV = urlJSON.ENV;
    }
    if (!config.debug || config.ENV === 'PRODUCT') {
        console.log = function () {};
        console.info = function () {};
        console.error = function() {};
    }

    var bridgePath = '';
    if (!!config.browser) {
        bridgePath = 'browser/'+minStr+'bestpay.html5';
        config.dummy = true;
    } else {
        if((/android/gi).test(navigator.appVersion)) {
            bridgePath = 'android/'+minStr+'bestpay.html5';
            config.bisChannel = '01';
        } else {
            bridgePath = 'ios/bestpay.html5';
            config.bisChannel = '02';
        }
    }
    console.log('loading ' + bridgePath);

    window.showDialog = function(msg) {
        if (dialogId !== 0) {
            dismissDialog();
        }
        if (msg == null || msg == "") {
            msg = config.MSG.loading;
        }
        dialogId = Bestpay.Dialog.showProgressDialog("", msg);
    };

    window.dismissDialog = function () {
        if (dialogId === 0) {
            return;
        }
        Bestpay.Dialog.dismissDialog(dialogId);
        dialogId = 0;
    };

    window.pageStack = new Array();

    window.goTo = function(pageObj, callback) {
        console.log("----------goTo page--------- : "+pageObj.title);
        initPage(pageObj,'goto');
        if (typeof callback === 'function') {
            callback();
        }
        if(config.isDialogBack == true){
            config.isDialogBack = false;
            return;
        }
        if(isRecords == true){
            isRecords = false;
            return;
        }
        if(pageObj.prompt != true){
            var len = pageStack.length;
            if (len > 0) {
                var lastObj = pageStack[pageStack.length - 1];
                document.getElementById(lastObj.id).style.display = 'none';
                if(pageObj.goToRecords != null && pageObj.goToRecords ==true){ 
                	document.getElementById(lastObj.id).style.display = 'block';
                } 
            }
        }
        pageStack.push(pageObj);
        document.getElementById(pageObj.id).style.display = 'block';
        if(pageObj.title != null){
            Bestpay.App.setTitle(pageObj.title);
        }
    };

    window.back = function(callback){
        initPage(null,'back');
        var len = pageStack.length;
        if (len <= 1) {
            if(len == 1 && pageStack[0].isGoToMain != null && pageStack[0].isGoToMain == true){
                console.log("isGoToMain:"+pageStack[0].isGoToMain);
                Bestpay.App.jumpToMain();
                return;
            }
            Bestpay.App.exitApp();
            return;
        }
        var oldObj = pageStack.pop();
        len = pageStack.length;
        var newObj = pageStack[len - 1];
        if (typeof callback === 'function') {
            callback(oldObj, newObj);
        }
        var element = document.getElementById(oldObj.id);
        element.style.display = 'none';
        element = document.getElementById(newObj.id);
        element.style.display = 'block';
        Bestpay.App.setTitle(newObj.title);
    };
    window.onback = function(event) {
        console.log('isBack() : ' + event);

        /**
         * status : // 问题与帮助，原生调的方法（无用）
         * status_newtianyibao : 点击添益宝tab键时，调006的接口
         * balanceAutomaticallyTransferred : 余额自动转入按钮，原生调的方法
         * transactionQuery : 交易查询008，原生调的方法
         * questionAndHelp : 问题与帮助，原生调的方法
         */


        //if(event == "status"){
        //    config.isBackStatus("status");
        //    return;
        //}
        //if(event == "status_newtianyibao"){
        //    config.isBack_newtianyibao("status_newtianyibao");
        //    return;
        //}
        //if(event == "balanceAutomaticallyTransferred"){  //余额自动转入按钮，原生调的方法
        //    config.isBack_AutomaticallyTransferred("balanceAutomaticallyTransferred");
        //    return;
        //}
        //if(event == "transactionQuery"){  //交易查询008，原生调的方法
        //    config.isBack_transactionQuery("transactionQuery");
        //    return;
        //}
        //if(event == "questionAndHelp"){  //问题与帮助，原生调的方法
        //    config.isBack_questionAndHelp("questionAndHelp");
        //    return;
        //}

        if(pageStack[pageStack.length - 1] === "overTimePage"){ 
        	var overTimePage = document.getElementById("overTimePage");
        	overTimePage.style.display = 'none';
        	Bestpay.App.exitApp();
        }

        console.log('state  ======= '  + config.payingBack);
        if(!!config.payingBack){
            isRecords = true;
            //console.log("goToRecords:"+pageStack[pageStack.length - 1].goToRecords+";"+"isOpen:"+config.isOpen);
            //console.log("TRADE_LIST_QUERY_TYPE:"+config.TRADE_LIST_QUERY_TYPE+";"+"TRADE_LIST_QUERY_NUMBER:"+config.TRADE_LIST_QUERY_NUMBER);
            //隐藏键盘
            PasswordKeyBoard.hideKeyboardUI3();
            config.payingBack = false;
            dismissDialog();
            Bestpay.Dialog.showAlertSynchroDialog(config.TITLE.submited_title,config.MSG.msg_submited_content,'确定',
                config.TRADE_LIST_QUERY_TYPE,config.TRADE_LIST_QUERY_NUMBER);
            if(typeof config.isBack === 'function'){
                config.isBack();
                config.isBack = null;
                return;
            }
            return;
        }
        if(pageStack.length > 1 && pageStack[pageStack.length - 1].goToRecords !=null && !!pageStack[pageStack.length - 1].goToRecords) {
        	$(document).scrollTop(0);
        	$("#order_comfirm").removeClass('goPayAnimation').addClass("backPayAnimation");
        	setTimeout(function(){back();},600)
        	return;
        }
        if(pageStack.length > 1 && pageStack[pageStack.length - 1].isDisable == true){
            return;

        }else if(pageStack.length > 1 && pageStack[pageStack.length - 1].goahead_main == true){ 
	       Bestpay.App.exitApp();
        }
        if(pageStack.length >= 1 && pageStack[pageStack.length - 1].togo != null){
            console.log("togo:"+pageStack[pageStack.length - 1].togo);
            if(pageStack[pageStack.length - 1].togo != true){
                pageStack = pageStack[pageStack.length - 1].togo;
            }else if(typeof config.isBack === 'function'){
                config.isBack();
                config.isBack = null;
                return;
            }
        }else if(typeof config.isBack === 'function' && pageStack.length == 0){
            config.isBack();
            config.isBack = null;
            return;
        }

        if(event == "dismissDialog"){
            config.isOpen = true;
            config.isDialogBack = true;
        }
        if (event == "backpress") {
            back();
        }else if(event != "backpress"){
            config.otherEvent(event);
        }

    };

    window.initPage = function(pageObj,type){
        PasswordKeyBoard.hideKeyboardUI3();
	if(!!NumberKeyBoard.HidenumKeyboard){ 
		NumberKeyBoard.HidenumKeyboard();
	}
        config.startPage(pageObj,type);
        if(!!pageObj && pageObj.goToRecords == true){ 
            return;
        }
        $(document).scrollTop(0);
    };

    require([bridgePath, 'subclass'], function(Bestpay, subclass) {
        window.Bestpay = Bestpay;
        window.BestpayHtml5 = Bestpay.BestpayHtml5;
        window.App = Bestpay.App;

        window.PasswordKeyBoard = Bestpay.PasswordKeyBoard;
        window.returnkey = Bestpay.PasswordKeyBoard.returnkey;
        window.deleteKey = Bestpay.PasswordKeyBoard.deleteKey;

        window.NumberKeyBoard = Bestpay.NumberKeyBoard;
        window.returnNum = Bestpay.NumberKeyBoard.returnNum;
        window.deleteNum = Bestpay.NumberKeyBoard.deleteNum;

        window.userInfo = Bestpay.User.getSuccessLoginInfo();
        window.product = Bestpay.User.getProduct();
        Bestpay.App.overrideBackPressed(true);
        Bestpay.App.setKeyEventListener(onback);
        new subclass().initApp();
    });
});

