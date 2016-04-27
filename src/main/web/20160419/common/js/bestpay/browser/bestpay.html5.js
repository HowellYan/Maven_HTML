define(function(){


	var timeFlag ;
	// Platform:Android
	// Version:1.0
	// 交费易html5访问本地数据api
	var PasswordKeyBoard = {
		keyStr:"",
		keyInputId:"",
		initPwdId :function(id){
			PasswordKeyBoard.keyStr="";
			PasswordKeyBoard.keyInputId = id;
			$("#"+id).blur(function(){
				PasswordKeyBoard.hideKeyboard();
			})
			$("#"+id).css("font-size","15px");
		},
		popPswKeyboard: function () {
			return exec("PasswordKeyBoard", "popPswKeyboard", null);
		},
		hideKeyboard : function(){
			return exec("PasswordKeyBoard", "hideKeyboard", null);
		},
		pswInputStr:function pswInputStr(flag){
			var str = "";
			for(var i = 0 ; i <PasswordKeyBoard.keyStr.length ; i ++ ){
				if(i==PasswordKeyBoard.keyStr.length - 1&& flag ){
					clearTimeout(timeFlag);
					str += PasswordKeyBoard.keyStr.charAt(i)
					$("#"+PasswordKeyBoard.keyInputId).val(str);
					timeFlag = setTimeout(function(){
						str = str.substring(0,str.length-1);
						str += '●';
						$("#"+PasswordKeyBoard.keyInputId).val(str);
					},500)
				}else
					str += '●';
			}
			$("#"+PasswordKeyBoard.keyInputId).val(str);
		},
		returnkey:function returnkey(str){
			PasswordKeyBoard.keyStr += str ;
			PasswordKeyBoard.pswInputStr(true);
		},
		deleteKey:function deleteKey(){
			PasswordKeyBoard.keyStr = PasswordKeyBoard.keyStr.substr(0,PasswordKeyBoard.keyStr.length-1 );
			PasswordKeyBoard.pswInputStr(false);
		}
	};
	/**
	 * 支付功能
	 */
	var Payment = {
	
		// params:订单信息。
		// callback:支付成功。
		// fail:支付失败
		pay : function(params, callback, fail) {
			var json = {
				'params' : params
			};
			return exec_asyn("Payment", "pay", JSON.stringify(json), callback, fail);
		},
	
		recharge : function(productNo, location, callback, fail) {
			var json = {
				'productNo' : productNo,
				'location' : location
			}
			return exec_asyn("Payment", "recharge", JSON.stringify(json), callback,
					fail);
		}
	}
	/**
	 * 条码扫描
	 */
	var Scanner = {
		scan : function(params, callback, fail) {
			var json = {
				'params' : params
			};
			return exec_asyn("Scanner", "scan", JSON.stringify(json), callback,
					fail);
		},
		handlerVerifyPhoto : function(params, callback, fail) {
			return exec_asyn("Scanner", "handlerVerifyPhoto", JSON.stringify(params), callback,
				fail);
		},
		handlerPreviewPhoto: function (params, callback, fail) {
			return exec("Scanner", "handlerPreviewPhoto", JSON.stringify(params), callback,
				fail);
		}
	}
	
	/**
	 * 用户信息
	 */
	var User = {
		// 获取用户产品号，也就是电话号码
		getProduct : function() {
			return exec("User", "getProduct", null);
		},
		// 获取用户地区码
		getLocation : function() {
			return exec("User", "getLocation", null);
		},
		// 获取登录成功后，用接口返回的用户信息
		getSuccessLoginInfo : function() {
			return exec("User", "getSuccessLoginInfo", null);
		},
		login : function(phone){
//			var params = {
//				productNo :phone
//			};
			return exec("User", "login", null);
		}
	}
	/**
	 * 获取html5应用相关信息
	 */
	var App = {
		/**
		 * 右上角按钮显示状态
		 */
		setThresholdBtnIsVisable : function(visable){
			var json = {
				"isvisable" : visable
			};
			console.log("app--------------->"+JSON.stringify(json));
			exec("App", "setThresholdBtnIsVisable", JSON.stringify(json));
		},
		/**
		 * 跳转到认证界面
		 */
		jumpToRecertify : function(){
			var json = {
				"comefrom" : "tianyibao"
			};
			exec_asyn("App", "jumpToRecertify", JSON.stringify(json));
		},
		/**
		 * 跳转到绑卡界面
		 */
		jumpToBindCard : function(){
			var json = {
				"comefrom" : "tianyibao"
			};
			exec_asyn("App", "jumpToBindCard", JSON.stringify(json));
		},
		/**
		 * 跳转到解绑界面
		 */
		jumpToUnBindCard : function(){
			var json = {
				"comefrom" : "tianyibao"
			};
			exec_asyn("App", "jumpToUnBindCard", JSON.stringify(json));
		},
		/**
		 * 获取应用ID
		 * 
		 * @return 当前运行时的HTML5子应用ID
		 */
		getAppId : function() {
			return exec("App", "getAppId", null);
		},
		jumpToNewH5View : function(url){
			var json = {
				"url" : url
			};
			exec_asyn("App", "jumpToNewH5View", JSON.stringify(json));
		},
		/**
		 * 验证SessionKey超时后调用自动登录函数
		 * 
		 * @return {"sessionKey":"EEDSSDSD"} 失败，sessionKey为""
		 */
		autoLogin : function(callback) {
			// return exec("App", "autoLogin", null);
			var json = {
				"productNo" : "",
				"location" : ""
			};
			exec_asyn("App", "autoLogin", JSON.stringify(json), callback);
		},
	
		/**
		 * 获取SessionKey
		 */
		getSessionKey : function() {
			return exec("App", "getSessionKey", null);
		},
	
		/**
		 * 获取版本号
		 */
		getVersion : function() {
			return exec("App", "getVersion", null);
		},
	
		/**
		 *获取html5应用目录
		 */
		getHome : function() {
			return exec("App", "getHome", null);
		},
	
		/**
		 *获取html5应用请求平台需要的key 
		 */
		getSecurityKey : function() {
			return exec("App", "getSecurityKey", null);
		},
	
		/**
		 *截断android 返回键事件，用户在按返回键的时候就不会退出html5渲染界面了。 
		 */
		overrideBackPressed : function(bound) {
//			var json = {
//				"bound" : bound
//			}
//			return exec("App", "overrideBackPressed", JSON.stringify(json));
		},
	
		/**
		 *退出应用，html5渲染界面关闭 
		 */
		exitApp : function() {
			return exec("App", "exitApp", null);
		},
	
		/*
		 * hardware key listener function onKeyDown(event){ if(event ==
		 * "backpress"){//key back //code }else if(event == "menupress"){// key menu
		 * //code }else if(event == "searchpress"){// key search //code } }
		 */
		// 设置硬键盘监听，当用户按下返回，菜单，搜索按键的时候，onKeyEvent回调函数会被触发。
		// 事件如上 backpress、menupress、searchpress
		setKeyEventListener : function(listener) {
			App.listener = listener;
		},
	
		// 按键事件监听。如若setKeyEventListener设置了监听器，则当用户按下返回，菜单，搜索按键的时候，此函数会被触发
		// 事件如上 backpress、menupress、searchpress
		onKeyEvent : function(event) {
			if (typeof App.listener == 'function') {
				App.listener(event);
			}
		},
	
		// 设置html5应用标题内容。html5应用的标题是由android实现。
		setTitle : function(title) {
			var json = {
				"title" : title
			}
			exec("App", "setTitle", JSON.stringify(json));
		},
	
		// 设置html5应用标题背景颜色。
		setTitleBackgroundColor : function(color) {
			var json = {
				"color" : color
			}
			exec("App", "setTitleBackground", JSON.stringify(json));
		},
	
		// 设置html5应用背景图片。
		setTitleBackgroundPath : function(path) {
			var json = {
				"path" : path
			}
			exec("App", "setTitleBackground", JSON.stringify(json));
		},
	
		getScreen : function() {
			return exec("App", "getScreen", null);
		},
	
		// 设置html5应用框架右上角按钮
		showRightButton : function(caption, callback) {
			var json = {
				"caption" : caption,
				"callback" : callback
			}
			exec("App", "showRightButton", JSON.stringify(json));
		},
		// 隐藏html5应用框架右上角按钮
		hideRightButton : function() {
			exec("App", "hideRightButton", "{}");
		},
	
		/**
		 * 跳到高级实名认证页面
		 * 
		 * @param {}
		 *            productNo - 当前人的手机号码
		 */
		jumpToRealnameVerify : function() {
			exec("App", "jumpToRealnameVerify", "{}");
		},
	
		/**
		 * 跳到帐号充值页面
		 * 
		 * @param {}
		 *            productNo - 当前人的手机号码
		 */
		jumpToAccountRecharge : function(productNo, location, callback) {
			var json = {
				"productNo" : productNo,
				"location" : location
			}
			exec_asyn("App", "jumpToAccountRecharge", JSON.stringify(json),
					callback);
		},
	
		/**
		 * 返回时执行函数
		 * 
		 * @since 1.0.8
		 */
		execWhenReturnAndAppear : function(jsFunctionName) {
			var json = {
				"execWhenReturnAndAppearJSFunc" : jsFunctionName
			}
			exec_asyn("App", "execWhenReturnAndAppear", json);
		},
	
		/**
		 * 跳转到原生页面
		 * 
		 * @param viewName -
		 *            预定义的页面名称
		 * @param args －
		 *            bundle参数
		 * @param callback -
		 *            调用成功返回时调用的函数
		 * @param fail －
		 *            调用失败时执行的函数
		 * @since 1.0.8
		 */
		jumpToNativeView : function(viewName, args, callback, fail) {
			if (typeof args == 'undefined')
				args = {};
			var json = args;
			json["viewName"] = viewName;
			exec_asyn("App", "jumpToNativeView", JSON.stringify(json), callback,
					fail);
		}
	}
	
	/*
	 * native提供uitl。
	 */
	
	var util = {
	
		/*
		 * js与Android交互，通过调用该接口实现base64编码。
		 * 
		 * @params {JSON} data {id_no:1;name:'ztm';card:'6225'} @return {JSON}
		 * result {id_no:1;name:"enRt";card:"NjIyNQ=="}
		 */
		base64Encode : function(jsonobj) {
	
			if (typeof (jsonobj) == "undefined" || typeof (jsonobj) != "object") {
				return false;
			} else {
				var _resultJson = {};
				var _result = "";
				_result = exec("UtilPlugin", "base64Encode", JSON
						.stringify(jsonobj));
				_resultJson = JSON.parse(_result);
				return _resultJson;
			}
		},
		/*
		 * js与Android交互，通过调用该接口实现base64解码。
		 * 
		 * @params {JSON} data {id_no:1;name:"enRt";card:"NjIyNQ=="} @return {JSON}
		 * result {id_no:1;name:'ztm';card:'6225'}
		 */
		base64Decode : function(jsonobj) {
	
			if (typeof (jsonobj) == "undefined" || typeof (jsonobj) != "object") {
				return false;
			} else {
				var _resultJson = {};
				var _result = "";
				_result = exec("UtilPlugin", "base64Decode", JSON
						.stringify(jsonobj));
				_resultJson = JSON.parse(_result);
				return _resultJson;
			}
		}
	
	}
	
	// 键值对本地数据存储。
	var Preference = {
		// 存储
		put : function(key, value, prefname) {
			console.log("put-key:" + key + " value:" + value + " prefname:"
					+ prefname);
			var args = {
				"key" : key,
				"value" : value,
				"prefname" : prefname
			};
			exec("Preference", "put", JSON.stringify(args));
		},
		// 取值
		get : function(key, defValue, prefname) {
			console.log("get-key:" + key + " defValue:" + defValue + " prefname:"
					+ prefname);
			var args = {
				"key" : key,
				"defValue" : defValue,
				"prefname" : prefname
			};
			return exec("Preference", "get", JSON.stringify(args));
		},
		// 存值，指定SP文件的名称 By Cloudy 2013/11/20
		putWithApp : function(key, value, spname) {
			this.put(key, value, spname);
		},
		// 取值， 指定SP文件的名称 By Cloudy 2013/11/20
		getWithApp : function(key, defValue, spname) {
			return this.get(key, defValue, spname);
		}
	}
	// 本地数据库操作
	var Storage = {
		// 执行sql
		// dbName： 数据库名
		// sql：sqlite sql
		// params:数组 where 数据
		execSQL : function(dbName, sql, params) {
			var args = {
				"dbName" : dbName,
				"sql" : sql,
				"params" : params
			};

			var result = exec("Storage", "exeSQL", JSON.stringify(args));
			return result;
		},
	
		// 创建数据库
		createDatabase : function(dbName, createSQL, upgradSQL, version) {
			var args = {
				"dbName" : dbName,
				"createSQL" : createSQL,
				"upgradSQL" : upgradSQL,
				"version" : version
			};
			return exec("Storage", "createDatabase", JSON.stringify(args));
		},
	
		// 批量插入
		/*
		 * @params {String} db Database name @params {String} table Table name
		 * @params {String} columns Columns use to insert like "id,name" @params
		 * {Array.JSON} args JSON array like
		 * "［｛id:1,name:'jack'｝,{id:2,name:'jerry'}］"
		 */
		batchInsert : function(db, table, columns, data) {
			var args = {
				'dbName' : db,
				'tableName' : table,
				'columns' : columns,
				'data' : data
			};
			return exec("Storage", "batchInsert", JSON.stringify(args));
		}
	};
	
	// 文件操作
	var File = {
		SERVICE : "File",
		// 拷贝
		copy : function(path, newpath) {
			var json = {
				"path" : path,
				"newpath" : newpath
			};
	
			var json_str = JSON.stringify(json);
			return exec(File.SERVICE, "copy", json_str);
		},
	
		// 文件是否存在
		exists : function(path) {
			var json = {
				file_path : path
			};
	
			var json_str = JSON.stringify(json);
			return exec(File.SERVICE, "exists", json_str);
		},
	
		// 删除文件
		remove : function(path) {
			var json = {
				"path" : path
			};
			return exec(File.SERVICE, "remove", JSON.stringify(json));
		}
	
	};
	
	var Notification = {
	// TODO add function;
	};
	
	// android风格Dialog
	var Dialog = {
	
		// 显示单选Dialog
		// title:标题
		// list:单选列表数据 json数组格式
		// check_item:缺省选择的项 0开始
		// display_key:单选列表显示的key list json数组中的key
	
		showSingleChoiceDialog : function(title, list, check_item, display_key,
				callback) {
			var json = {
				"title" : title,
				"list" : list,
				"checkedItem" : check_item,
				"displayKey" : display_key
			};
	
			return exec_asyn("Dialog", "showSingleChoiceDialog", JSON
					.stringify(json), callback, null);
		},
	
		showSwitchDialog : function(title, message, postext, negtext, callback) {
			var json = {
				"title" : title,
				"message" : message,
				"postext" : postext,
				"negtext" : negtext
			};
			return exec_asyn("Dialog", "showSwitchDialog", JSON.stringify(json),
					callback, null);
		},
		// 弹出等待对话框
		// title:对话框标题
		// msg:对话框内容
		// return : 动态分配的id，供取消等待
		showWaitDialog : function(title, msg) {
			var json = {
				'title' : title,
				'msg' : msg
			};
			return exec("Dialog", "showWaitDialog", JSON.stringify(json));
		},
	
		// 消失对话框
		// id: showDialog调用后返回的id。
		dismissDialog : function(id) {
			var json = {
				'id' : id
			};
			return exec("Dialog", "dismissDialog", JSON.stringify(json));
		},
		// 弹出等待对话框
		// title:对话框标题
		// msg:对话框内容
		// return : 动态分配的id，供取消等待
		showProgressDialog : function(title, msg) {
			var json = {
				'title' : title,
				'msg' : msg
			};
			return exec("Dialog", "showProgressDialog", JSON.stringify(json));
		},
		// 体验商户用户跳去认证页面
		jumpToAuthorityDialog : function() {
			return exec("Dialog", "jumpToAuthorityDialog", null);
		},
		alert : function(msg) {
			window.alert(msg);
		}
	}
	// Toast提示。功能如同android Toast
	var Toast = {
		LENGTH_LONG : 1,
		LENGTH_SHORT : 0,
		/*
		 * 
		 * @params {String} text the text to make toast. @params {Int} duration
		 * LENGTH_SHORT:short,LENGTH_LONG:long
		 * 
		 */
		makeText : function(text, duration) {
			var json = {
				"text" : text,
				"duration" : duration
			}
            alert(text);
//			exec("Toast", "makeText", JSON.stringify(json));
		}
	}
	
	// 联系人
	var Contacts = {
		// 打开联系人
		openContacts : function(success, fail) {
			exec_asyn("Contacts", "openContacts", '{}', success, fail);
		},
		// 打电话
		tel : function(tel)
	
		{
			var json = {
	
				'tel' : tel
			}
			return exec("Contacts", "call", JSON.stringify(json));
		}
	}
	
	// 摘要算法
	var MessageDigest = {
		// 计算摘要
		// algorithm：算法名
		// source：文本资源
		digest : function(algorithm, source) {
			var json = {
				"algorithm" : algorithm,
				"source" : source
			}
			return exec("MessageDigest", "digest", JSON.stringify(json));
		}
	}
	// 安全模块
	// 算法实现由native决定，秘钥也在native中。
	// 所有应用只提供一套算法
	var Security = {
		//获取sign
		getSign : function(data){
			return {};
		},
		//获取inf sign
		getSignINF : function(data){
			return exec("Security","getSignINF",JSON.stringify(data));
		},
		// des算法加密文本
		encrypt : function(source) {
			var json = {
				"source" : source
			}
			return exec("Security", "encrypt", JSON.stringify(json));
		},
		// des算法解密十六进制字符串
		decrypt : function(encryptedData) {
			var json = {
				"encryptedData" : encryptedData
			}
			return exec("Security", "decrypt", JSON.stringify(json));
		},
		// pinkeyEncrypt
		pinkeyEncrypt : function(source, salt) {
			var json = {
				"source" : source,
				"salt" : salt
			}
			return exec("Security", "pinkeyEncrypt", JSON.stringify(json));
		},
		//密码加密
		encryptPassword : function(acc,pwd,random) {
			var json = {
				"account" : acc,
				"password" : pwd,
				"encrypRandNumber" : random
			}
			return exec("Security", "encryptPassword", JSON.stringify(json));
		}
	}
	
	/*
	 * Html5与Android交互接口，通过调用该接口实现html5与android的交互。
	 * 所有需要调用android端功能的function都需要调用该方法
	 * 
	 * @params {String} service The name of the service to use @params {String}
	 * action Action to be run in proxy @params {JSON} args Arguments to pass to the
	 * method,it's maybe null if the method doesn't need arguments @params {Boolean}
	 * syn 是否同步 @params {Function} success The success callback @params {Function}
	 * fail The fail callback
	 */
	var android_exec = function(service, action, args, syn, success, fail) {
		if (syn) {
			return exec(service, action, args);
		} else {
			exec(service, action, args, success, fail);
		}
	}
	
	/**
	 * HTML5与Android异步交互
	 * 
	 */
	var BestpayHtml5 = {
		idCounter : 0, // 参数序列计数器
		INPUT_CMDS : "", // 入参服务与命令名
		INPUT_ARGS : "", // 入参的参数
		OUTPUT_RESULTS : "", // 输出的结果
	
		// 输出的结果成功时调用的方法
		CALLBACK_SUCCESS : function(result) {
			// stub
			console.log(result);
			return;
		},
		// 输出的结果失败时调用的方法
		CALLBACK_FAIL : function(result) {
			// stub
			console.log(result);
			return;
		},
		/*
		 * exec_asyn调用的方法 @params {JSONObject} cmd 服务名和动作命令 @params {String} args 参数
		 */
		callNative : function(cmd, args) {
			this.INPUT_CMDS = cmd;
			this.INPUT_ARGS = args;
			var key = "ID_" + (++this.idCounter);
			window.nintf.setCmds(this.getInputCmd(), key);
			window.nintf.setArgs(this.getInputArgs(), key);
			var iframe = document.createElement("IFRAME");
			iframe.setAttribute("src", "bestpayhtml://ready?id=" + key);
			document.documentElement.appendChild(iframe);
			iframe.parentNode.removeChild(iframe);
			iframe = null;
	
			console.log(2);
			console.log("return this.OUTPUT_RESULTS:" + this.OUTPUT_RESULTS);
			return this.OUTPUT_RESULTS;
		},
		getInputCmd : function() {
			// alert("c=="+JSON.stringify(INPUT_CMDS));
			return JSON.stringify(this.INPUT_CMDS);
		},
		getInputArgs : function() {
			// alert("p=="+(INPUT_ARGS));
			return this.INPUT_ARGS;
		},
	
		callBackJs : function(result) {
			// alert("BACK:"+result);
			this.OUTPUT_RESULTS = result;
			console.log(1);
			var obj = JSON.parse(result);
			var message = obj.message;
			console.log("message:" + message);
			var status = obj.status;
			if (status == 0) {
				if (typeof this.CALLBACK_SUCCESS != "undefined")
					setTimeout("BestpayHtml5.CALLBACK_SUCCESS('" + message + "')",
							0);
			} else {
				if (typeof this.CALLBACK_FAIL != "undefined")
					setTimeout("BestpayHtml5.CALLBACK_FAIL('" + message + "')", 0);
			}
			console.log("你先:" + "(" + (BestpayHtml5.idCounter) + ")" + result);
		}
	};
	
	/*
	 * Html5与Android同步交互接口
	 * 在本应用中，prompt被拦截（DroidHtml5中的WebServerChromeClient中的onJsPrompt方法），
	 * Android本地代码会拦截该对话框，取得JavaScript数据，解析处理数据后，将结果返回给JavaScript。
	 * 
	 * @params {String} service 使用的Service，即后台IPlugin的实现类 @params {String} action
	 * 在IPlugin中执行哪个方法 @params {JSON} args 传递给该方法的参数。如果不需要参数则设置为null
	 */
	var exec = function(service, action, args) {
		var json = {
			"service" : service,
			"action" : action
		};
		var result_str = prompt(JSON.stringify(json), args);
		var result;
		try {
			result = JSON.parse(result_str);
		} catch (e) {
			console.error(e.message);
		}
	
		var status = result.status;
		var message = result.message;
		if (status == 0) {
	
			return message;
		} else {
			console.error("service:" + service + " action:" + action + " error:"
					+ message);
		}
	}
	// Webserver 端口
	var port;
	
	/*
	 * Html5与Android异步交互接口
	 * 
	 * @params {String} service The name of the service to use @params {String}
	 * action Action to be run in proxy @params {JSON} args Arguments to pass to the
	 * method,it's maybe null if the method doesn't need arguments @params
	 * {Function} success The success callback @params {Function} fail The fail
	 * callback
	 */
	var exec_asyn = function(service, action, args, success, fail) {
		var json = {
			"service" : service,
			"action" : action
		};
	
		if (typeof fail != 'success')
			BestpayHtml5.CALLBACK_SUCCESS = success;
		if (typeof fail != 'undefined') {
			BestpayHtml5.CALLBACK_FAIL = fail;
		} else {
			BestpayHtml5.CALLBACK_FAIL = function() {
			};// add by ztm 2014/4/17 cause by 全局函数引起的问题
		}
	
		var result = BestpayHtml5.callNative(json, args);
	
		console.log("我先:" + "(" + (BestpayHtml5.idCounter) + ")" + result);
	}
	return{
		Dialog : Dialog,
		App : App,
		exec_asyn : exec_asyn,
		exec : exec,
		Preference : Preference,
		Contacts : Contacts,
		User : User,
		Toast : Toast,
		BestpayHtml5 : BestpayHtml5,
		Storage : Storage,
		Security : Security,
		PasswordKeyBoard : PasswordKeyBoard,
		Scanner:Scanner
	};

});