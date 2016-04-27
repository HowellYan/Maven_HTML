'use restrict';
require.config({
	baseUrl:"js",
	paths: {
        'jquery': '../../common/js/lib/jquery/jquery-1.10.2.min',
        'android': '../../common/js/bestpay/android',
        'ios': '../../common/js/bestpay/ios',
        'jquery-jtemplates': '../../common/js/lib/jquery-jtemplates',
        'static': 'static'
	},
    shim: {
        'jquery-jtemplates' : ['jquery']
    }
	//,
	//urlArgs:"bust=" + (new Date()).getTime()
	
});
	
require(['jquery','utils'],function($,Utils){
	window.$ = $;
	window.Utils = Utils;
	if((/android/gi).test(navigator.appVersion)){//android
		window.androidOrIos="android";
		bisChannel="01";
		require(['android/bestpay.html5'],function(Bestpay){
			window.BestpayHtml5 = Bestpay.BestpayHtml5;
			window.exec = Bestpay.exec;
			window.Dialog = Bestpay.Dialog;
			window.App = Bestpay.App;
			window.PasswordKeyBoard = Bestpay.PasswordKeyBoard;
			window.Scanner = Bestpay.Scanner;
			window.User = Bestpay.User;
			window.Toast = Bestpay.Toast;
			window.exec_asyn = Bestpay.exec_asyn;
			window.Security = Bestpay.Security;
			window.returnkey = Bestpay.PasswordKeyBoard.returnkey;
			window.deleteKey = Bestpay.PasswordKeyBoard.deleteKey;
			window.DB_Data=Bestpay.DB_Data;
			window.TalkingData=Bestpay.TalkingData;
//			window.Contacts = Bestpay.Contacts;
			window.Preference = Bestpay.Preference;
			App.overrideBackPressed(true);
			App.setKeyEventListener(Utils.onback);

			console.log("-------------------------222222222222222222");
			var href = window.location.href;
			href = href.substring(href.lastIndexOf("/")+1,href.lastIndexOf(".html"));
			if("authority" == href){
				Utils.pageIds.push("choseShop");
				require(['authority'],function(A){});
			}else if("bindCard" == href){
				Utils.pageIds.push("bindCardPage");
				require(['bind'],function(B){});
			}else{
				console.log("--------------------5");
				require(['charge'],function(C){});
			}
            useInfoIOS =JSON.parse(User.getSuccessLoginInfo());
			console.log("href-   ------------load end "+href);
		});
	}else{//ios
		bisChannel="02";
		window.androidOrIos="ios";
		require(['ios/bestpay.html5'],function(Bestpay){
			window.BestpayHtml5 = Bestpay.BestpayHtml5;
			window.Dialog = Bestpay.Dialog;
			window.App = Bestpay.App;
			window.exec_asyn = Bestpay.exec_asyn;
//			window.Contacts = Bestpay.Contacts;
			window.exec_syn = Bestpay.exec_syn;
			window.DB_Data=Bestpay.DB_Data;
			window.Scanner = Bestpay.Scanner;
			window.exec = Bestpay.exec_syn;
			window.User = Bestpay.User;
			window.Toast = Bestpay.Toast;
			window.Security = Bestpay.Security;
			window.PasswordKeyBoard = Bestpay.PasswordKeyBoard;
			window.returnkey = Bestpay.PasswordKeyBoard.returnkey;
			window.deleteKey = Bestpay.PasswordKeyBoard.deleteKey;
			window.TalkingData=Bestpay.TalkingData;
			window.Preference = Bestpay.Preference;
			App.overrideBackPressed(true);
			App.setKeyEventListener(Utils.onback);
			var href = window.location.href;
			href = href.substring(href.lastIndexOf("/")+1,href.lastIndexOf(".html"));
			if("authority" == href){
				Utils.pageIds.push("choseShop");
				require(['authority'],function(A){});
			}else if("bindCard" == href){
				Utils.pageIds.push("bindCardPage");
				require(['bind'],function(B){});
			}else{
				console.log("--------------------5");
				require(['charge'],function(C){});
			}
            useInfoIOS = User.getSuccessLoginInfo();
			console.log("href-   ------------load end "+href);
		});
	}

});