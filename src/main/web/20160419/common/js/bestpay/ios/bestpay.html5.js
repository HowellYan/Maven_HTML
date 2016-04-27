define(function(){

	var testData = "a";

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
			$("#"+id).val("");
			$("#"+id).blur(function(){
				//PasswordKeyBoard.hideKeyboard();
			});
			$("#"+id).css("font-size","18px");
		},
		popPswKeyboard: function () {
			return exec_syn("PasswordKeyBoard", "popPswKeyboard", null);
		},
		hideKeyboard : function(){
			return exec_syn("PasswordKeyBoard", "hideKeyboard", null);
		},
		initPwdUI3 : function(inputCallback){
			PasswordKeyBoard.inputCallback = inputCallback;
		},
		popKeyboardUI3: function () {
			return exec_asyn("PasswordKeyBoard", "showPwd", null);
		},
		hideKeyboardUI3 : function(){
			return exec_asyn("PasswordKeyBoard", "hidPwd", null);
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
			//PasswordKeyBoard.keyStr += str ;
			if(PasswordKeyBoard.keyStr.length>12){
				return;
			}
			//PasswordKeyBoard.delBtn($("#"+PasswordKeyBoard.keyInputId));
			//PasswordKeyBoard.pswInputStr(true);
			PasswordKeyBoard.inputCallback(str);
		},
		delBtn : function(elt){
			var value = elt.val() ;
			var pBothor = elt[0].parentNode.parentNode;
			if(pBothor.children[1] =='undefined' || pBothor.children[1] ==undefined){
				return;
			}
			pBothor.children[1].onclick = function(){
				PasswordKeyBoard.initPwdId(PasswordKeyBoard.keyInputId);
				pBothor.children[1].className = pBothor.children[1].className.replace("_1","");
			}
			pBothor.children[1].className = "del_1";
			console.log("--------------"+pBothor.children[1].className)
		},
		deleteKey:function deleteKey(){
			if(PasswordKeyBoard.keyStr.length>12){
				PasswordKeyBoard.keyStr = PasswordKeyBoard.keyStr.substr(0,12);
			}
			PasswordKeyBoard.keyStr = PasswordKeyBoard.keyStr.substr(0,PasswordKeyBoard.keyStr.length-1 );
			PasswordKeyBoard.pswInputStr(false);
		}
	};

	// Platform:IOS
	// Version:1.0
	// 翼支付html5访问本地数据api
	
	
	//支付功能
	var Payment = {
	    
	pay:function(params,callback,fail){
	    
	    return exec_asyn("Payment","pay",params,callback,fail);
	}
	
	
	}
	
	
	var Scanner = {
		/**
		 * 扫码（二维码、条码）
		 * @param － params 自定义参数（暂时无用1.0.1）
		 * @param callback － 成功返回时执行的函数
		 * @param fail － 失败返回时执行的函数
		 * @return 扫码后得到的字符串
		 * @since 1.0.1
		 * @memo REQUEST_CODE_SCANNER = 3928461；相机静候300秒后自动返回，超时扫码无效
		 */
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
			return exec_syn("Scanner", "handlerPreviewPhoto", JSON.stringify(params), callback,
				fail);
		},
		bankOCR: function (callback, fail) {
			console.log('调用bankOCR 123成功');
			return exec_asyn("Scanner", "bankOCR", JSON.stringify({}), callback,
				fail);
		}
	};
	
	
	//用户信息
	var User = {
		login : function(phone){
			return exec_asyn("User", "login", null);
		},
		//获取用户产品号，也就是电话号码
		getProduct:function(){
		    return exec_syn("User","getProduct",null);
		},
			//获取用户地区码
		getLocation:function(){
		    return exec_syn("User","getLocation",null);
		},
		// 获取登录成功后，用接口返回的用户信息
		getSuccessLoginInfo : function(callback) {
			return exec_syn("User", "getSuccessLoginInfo", callback);
		}
	}
	//html5应用
	var App = {
		/**
		 * 绑卡成功或者解绑后更新用户信息
		 * {"bandCard":"0|1"}绑卡传1，解绑传0
		 */
		updateUserInfo:function(bindCard){
			var json={
				"bindCard":bindCard
			}
			return exec_syn("App", "updateUserInfo", JSON.stringify(json));
		},
		
		/**
		 * 获取设备详细信息
		 */
		getDeviceInfo: function() {
        	return exec_syn('App', 'getDeviceInfo', null);
    	},
		/**
		 * 退出apk
		 */
		exitCompleteApp :function(){
			exec_syn("App", "exitCompleteApp", null);
		},
		/**
		 * 右上角按钮显示状态
		 */
		setThresholdBtnIsVisable : function(visable){
			var json = {
				"isvisable" : visable
			};
			
			exec_syn("App", "setThresholdBtnIsVisable", JSON.stringify(json));
		},
		jumpToNewH5View : function(url){
			var json = {
				"url" : url
			};
			exec_asyn("App", "jumpToNewH5View", JSON.stringify(json));
		},
    //跳到添益宝页面
        jumpToNewTianyibao : function(){
        var json = {

        };
            exec_syn("App", "jumpToNewTianyibao", JSON.stringify(json));
    },
    /**
     * 所有应用支付成功之后，原生返回一个0；h5传回一个1给原生;原生再根据1去判断调用添益宝的js方法
     */
    updateTybRereshFlag : function(){
        var json = {
            "tybRefreshFlag" : '1'
        };
        exec_syn("App", "updateTybRereshFlag", JSON.stringify(json));
    },
        /**
         * 所有应用支付成功之后，右上角有个完成，左上角的返回按钮去掉
         */
        setFinishIcon : function(){
        var json = {
        };
        exec_syn("App", "setFinishIcon", JSON.stringify(json));
    },
        //完成之后隐藏
        setFinishIconHidden : function(){
            var json = {
            };
            exec_syn("App", "setFinishIconHidden", JSON.stringify(json));
        },

		/**
		 * 跳转到认证界面
		 */
		jumpToRecertify : function(){
			var json = {
				"comefrom" : "tianyibao"
			};
			exec_syn("App", "jumpToRecertify", JSON.stringify(json));
		},
		/**
		 * 跳转到绑卡界面
		 */
		jumpToBindCard : function(){
			var json = {
				"comefrom" : "tianyibao"
			};
			exec_syn("App", "jumpToBindCard", JSON.stringify(json));
		},
		/**
		 * 跳转到解绑界面
		 */
		jumpToUnBindCard : function(){
			var json = {
				"comefrom" : "tianyibao"
			};
			exec_syn("App", "jumpToUnBindCard", JSON.stringify(json));
		},
	    //获取html5应用请求平台需要的key
	getSecurityKey:function(){
	    return exec_syn("App","getSecurityKey",null);
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
	     * @return SESSIONEY
	     * @since 1.0.5
	     */
	    getSessionKey : function() {
	        return exec_syn("App","getSessionKey",null);
	    } ,
	    
	    
	    
	setTitle:function(title){
	    var json = {
	        "title":title
	    }
	    exec_syn("App","setTitle",JSON.stringify(json));
	},
	getScreen:function(){
	    return screen.width+"x"+screen.height;
	    
	},
	    
	overrideBackPressed:function(bound){
	    var json = {
	        "bound":"1"
	    }
	    exec_asyn("App","overrideBackPressed",JSON.stringify(json));
	},
		//退出应用，html5渲染界面关闭
	exitApp:function(){
	    return exec_syn("App","exitApp",null);
	},
		
	setKeyEventListener:function(listener){
	    App.listener = listener;
	    
	},
	    
	onKeyEvent:function(event){
	    if(typeof App.listener == 'function'){
	        App.listener(event);
	    }
	},
	    /**
		 * 跳到高级实名认证页面
		 * @param {} productNo - 当前人的手机号码
		 */
	jumpToRealnameVerify:function() {
	    exec_syn("App","jumpToRealnameVerify","{}");
	},
		/**
		 * 跳到帐号充值页面
		 * @param {} productNo - 当前人的手机号码
		 */
	jumpToAccountRecharge:function(productNo,location) {
	    
	    var json = {
	        "productNo":productNo,
	        "location":location
	    }
	    exec_syn("App","jumpToAccountRecharge",JSON.stringify(json));
	},
	    
	execWhenReturnAndAppear:function(msg) {
	    exec_asyn("App","execWhenReturnAndAppear",msg);
	},
	    
	jumpToNativeView:function(viewName, args, callback, fail) {
	    if (typeof args=='undefined') args={};
	    var json = args;
	    json["viewName"]=viewName;
	    exec_asyn("App","jumpToNativeView",JSON.stringify(json), callback, fail);
	},
	    /**
		 * 获取版本号
		 * @return 当前运行时的HTML5子应用版本号
		 * @since 1.0.0
		 */
	getVersion:function(){
	    //alert("app");
	    var version = exec_syn("App","getVersion",null);
	    return version;
	},
	//短信验证码加密
		verifyCodeEncrypt : function(verifyCode){
		var json = {
			"verifyCode" : verifyCode
		}
		return exec_syn("App", "verifyCodeEncrypt", JSON.stringify(json));
	},
		/**
		 *  帮付通跳转页面
		 */
		startBangfutongActivity : function (forwardUrl, orderNo, bankAcct, callback, fail){
			var json = {
				'forwardUrl':forwardUrl,
				'orderNo':orderNo,
				'bankAcct':bankAcct
			};
			exec_asyn("App", "startBangfutongActivity",JSON.stringify(json), callback,fail);
		},
		/**
		 * 绑卡成功后回调处理上个webview,1：充值 ， 2： 确定
		 */
		exitAppFromBandCard:function(event){
			var json={
				"event":event
			};
			exec_syn("App", "exitAppFromBandCard", JSON.stringify(json));
		},
		//账号余额
		goBalanQuery : function(){
			var json = {};
			return exec_asyn("App", "goBalanQuery", JSON.stringify(json));
		}
	}

	//sqlite 数据查询
	var DB_Data={
		//银行卡信息
		getCardList:function(){
			return exec("CardList", "queryAll", null);
		},

		/**
		 * getProCityDistricName:省市区名称
		 * @param areaNo 省市区的code
		 */
		getProCityDistric:function(areaNo){
			var args={
				"code":areaNo
			};
			return exec("AreaManagerPlugin","getProCityDistricName",JSON.stringify(args));
		},

		/**
		 * @param action getProvinceData、getCityData()、getDistrictData；返回所有省份、对应省份的所有市、对应市的所有区
		 * @param code {"code":code} ,当action为getProvinceData时code可以为null
		 */
		getActionCode:function(action,args){
			var param=null;
			if(args!=null){
				param=args;
			}
			return exec("AreaManagerPlugin",action,param);
		}
	};


	/**
	 * 文件操作
	 */
	var File = {
	SERVICE:"File",
		/**
		 * 拷贝
		 * @param {String} path	原文件路径名
		 * @param {String} newpath 目标路径名
		 * @return {String} like 'ok'
		 * @since 1.0.0
		 */
	copy:function(path,newpath){
	    var json = {
	        "path":path,
	        "newpath":newpath
	    };
	    
	    var json_str = JSON.stringify(json);
	    return exec_syn(File.SERVICE,"copy",json_str);
	},
		
		/**
		 * 文件是否存在
		 * @param {String} path	原文件路径名
		 * @return {String} 'true'表示存在；'false'表示不存在
		 * @since 1.0.0
		 */
	exists:function(path){
	    var json = {
	    file_path:path
	    };
	    
	    var json_str = JSON.stringify(json);
	    return exec_syn(File.SERVICE,"exists",json_str);
	},
		
		/**
		 * 删除文件
		 * @param {String} path	原文件路径名
		 * @return {String} 'true'表示删除成功；'false'表示删除不成功
		 * @since 1.0.0
		 */
		remove : function(path) {
			var json = {
				"path":path
			};
			return exec_syn(File.SERVICE,"delete",JSON.stringify(json));
		}
		
	};
	
	
	var Dialog = {
	    
	    //showSingleChik
	showSingleChoiceDialog:function(title,list,check_item,display_key,callback){
	    //alert ("liuningjie");
	    var json = {
	        "title":title,
	        "list":list,
	        "checkedItem":check_item,
	        "displayKey":display_key
	    };
	    return exec_asyn("Dialog","showSingleChoiceDialog",JSON.stringify(json),callback,null);
	},
	dismissDialog:function(id){
	    var json = {
			"service":"showWaitDialog",
			"action":"dismissDialog"
		};
		BestpayHtml5.callNative(JSON.stringify(json));
	},
	    
	showProgressDialog:function(title,msg){
	    
	    var json = {
			"service":"showWaitDialog",
			"action":"showProgressDialog"
		};
		BestpayHtml5.callNative(JSON.stringify(json),msg);
	},
	// 体验商户用户跳去认证页面
	jumpToAuthorityDialog : function() {
		return exec("Dialog", "jumpToAuthorityDialog", null);
	},
	//alert: function(msg){
	//    return exec_syn("Dialog","alert",msg);
	//    
	//}
	alert: function(msg){
	    exec_asyn("Dialog","alert",msg,function(){},function(){});
	    
	},
		showAlertDialog : function(title, content, btn, code, callback){
			var json = {
				'title' : title,
				'code' : code,
				'content' : content,
				'btn' : btn
			};
			exec_asyn("Dialog","showAlertDialog",JSON.stringify(json),callback);
		},
		showAlertTwoBtnDialog : function(title, content,  okBtn, cancelBtn, code, callback){
			var json = {
				'title' : title,
				'code' : code,
				'content' : content,
				'okBtn' : okBtn,
				'cancelBtn' : cancelBtn
			};
			exec_asyn("Dialog","showAlertTwoBtnDialog",JSON.stringify(json),callback);
		}
	    
	}
	
	var Storage = {
		/**
	     * 执行sql
	     * @param dbName： 数据库名
	     * @param sql：sqlite sql
	     * @param params:数组 where 数据
	     * @return 返回结果集的字符串，可转化成JSON数组格式。
	     * @since 1.0.0
	     */
		execSQL : function(dbName, sql, params) {
			var args = {
				"dbName" : dbName,
				"sql" : sql,
				"params" : params
			};
	        
			var result = exec_syn("Storage", "exeSQL", JSON.stringify(args));
			return JSON.stringify(result);
		},
		
		/**
		 * 创建数据库
	     * @param dbName： 数据库名
	     * @param createSQL：首次执行的创建语句
	     * @param upgradSQL：更新执行的语句
	     * @param version：版本号
	     * @return {String} like 'ok'
	     * @since 1.0.0
		 */
	createDatabase:function(dbName,createSQL,upgradSQL,version){
	    var args = {
	        "dbName":dbName,
	        "createSQL":createSQL,
	        "upgradSQL":upgradSQL,
	        "version":version
	    };
	    return exec_syn("Storage","createDatabase",JSON.stringify(args));
	},
		
		
		/**
		 * 批量插入
		 * @params {String} db         Database name
		 * @params {String} table      Table name
		 * @params {String} columns    Columns use to insert like "id,name"
		 * @params {Array.JSON} args   JSON array like "［｛id:1,name:'jack'｝,{id:2,name:'jerry'}］"
		 * @return {String} like 'ok'
		 * @since 1.0.0
		 */
		batchInsert : function(db, table, columns, data) {
			var args = {
				'dbName' : db,
				'tableName' : table,
				'columns' : columns,
				'data' : data
			};
			return exec_syn("Storage", "batchInsert", JSON.stringify(args));
		}
	};
	
	
	var Toast = {
	    
	    LENGTH_LONG : 1,
	    LENGTH_SHORT : 0,
	    
	makeText:function(text){
	    
	    exec_asyn("Toast","makeText",text,function(){},function(){});
	}
	    
	}
	
	//联系人
	var Contacts = {
		//打开联系人
	openContacts:function(success,fail){
	    exec_asyn("Contacts","openContacts",'{}',success,fail);
	},
		//打电话
	tel:function(tel)
	    {
			var json = {
				
				"tel":tel
			}
	        return  exec_syn("Contacts","call",json);
		}
	}
	
	var Preference = {
		// 存储
	put:function(key, value, prefname) {
	    var args = {
	        "key" : key,
	        "value" : value,
	        "prefname": prefname
	    };
	    exec_asyn ("Preference", "put", JSON.stringify(args));
	},
		// 取值
	get:function(key, defValue, prefname) {
	    var args = {
	        "key" : key,
	        "defValue" : defValue,
	        "prefname": prefname
	    };
	    return exec_syn("Preference", "get", JSON.stringify(args));
	}
	}
	
	
	//摘要算法
	var MessageDigest = {
		//计算摘要
		//algorithm：算法名
		//source：文本资源
	digest:function(algorithm,source){
	    return hex_md5(source);
	}
	}
	//安全模块
	//算法实现由native决定，秘钥也在native中。
	//所有应用只提供一套算法
	var Security = {
		//获取sign
		getSign : function(data){
//			var json = {
//				"":""
//			};
			return exec_syn("Security","getSign",data);
		},
		//获取inf sign
		getSignINF : function(data){
			return exec_syn("Security","getSignINF",JSON.stringify(data));
		},
		//des算法加密文本
		encrypt:function(source){
			var json = {
				"source":source
			}
			return exec_syn("Security","encrypt",JSON.stringify(json));
		},
		//des算法解密十六进制字符串
		decrypt:function(encryptedData){

			return encryptedData;
		},
	    /**
		 * pinkeyEncrypt
		 * @param source 文本资源
		 * @param salt
		 * @return 加密结果
		 * @since 1.0.2
		 */
		pinkeyEncrypt:function(source, salt){
			var json = {
				"source":source,
				"salt":salt
			}
			return exec_syn("Security","pinkeyEncrypt",JSON.stringify(json));
		},
		//密码加密
		encryptPassword : function(acc,pwd,random) {
			var json = {
				"account" : acc,
				"password" : pwd,
				"encrypRandNumber" : random
			}
			return exec_syn("Security", "encryptPassword", JSON.stringify(json));
		},
		verifySign : function(response){
			var json = {
				"response" : response
			};
			return exec_syn("Security", "verifySign", JSON.stringify(json));
		}
	};
	/**
	 * TalkingData 行为数据分析
	 * @type {{}}
	 */
	var TalkingData = {
		//调用摄像头的时候，统计点击率
		onEventWithLabel:function(eventId, eventLabel) {
			var json = {
				'eventId' : eventId,
				'eventLabel' : eventLabel
			};
			return exec_syn("TalkingData", "trackEventWithLabel", JSON.stringify(json));
		}
	};
	
	
	
	/**
	 * native提供uitl。
	 */
	var util = {
	    /**
	     * 实现base64编码
	     * @params {JSON} data {name:'ztm';card:'6225'}
	     * @return {JSON} result {name:"enRt";card:"NjIyNQ=="}
	     * @since 1.0.6
	     */
	    base64Encode : function(jsonobj){
	        if(typeof(jsonobj) == "undefined" || typeof(jsonobj) != "object") {
	            return false;
	        } else {
	            
	            var _result ="";
	            _result = exec_syn("UtilPlugin","base64Encode",JSON.stringify(jsonobj));
	//            alert(_result);
	            return _result;
	        }
	    },
	    /**
	     * 实现base64解码
	     * @params {JSON} data {name:"enRt";card:"NjIyNQ=="}
	     * @return {JSON} result {name:'ztm';card:'6225'}
	     * @since 1.0.6
	     */
	    base64Decode : function(jsonobj){
	        if(typeof(jsonobj) == "undefined" || typeof(jsonobj) != "object") {
	            return false;
	        } else {
	            var _resultJson ={};
	            var _result ="";
	            
	            _result = exec_syn("UtilPlugin","base64Decode",JSON.stringify(jsonobj));
	            
	            return _result;
	        }
	    }
	}
	
	
	var android_exec = function(service,action,args,syn,success,fail){
		if(syn){
			return exec(service,action,args);
		}else{
			exec(service,action,args,success,fail);
		}
	}
	
	
	
	var BestpayHtml5 = {
	idCounter:0, //参数序列计数器
	INPUT_CMDS: {}, //入参服务与命令名
	INPUT_ARGS: {}, //入参的参数
	OUTPUT_RESULTS: {}, //输出的结果
	CALLBACK_SUCCESS:{}, //输出的结果成功时调用的方法
	CALLBACK_FAIL:{},    //输出的结果失败时调用的方法
	    /*
	     * exec/exec_asyn调用的方法
	     * @params {JSONObject} cmd 		服务名和动作命令
	     * @params {String} args			参数
	     * @params {JS FUNCTION} success			成功时回调函数
	     * @params {JS FUNCTION} fail			失败时回调函数
	     */
	callNative:function(cmd, args, success, fail) {
	    var key = "ID_"+(++this.idCounter);
	    testData = key;
	    this.INPUT_CMDS[key] = cmd;
	    this.INPUT_ARGS[key] = JSON.stringify(args);
	    if (typeof success !='undefined') this.CALLBACK_SUCCESS[key] = success;
	    if (typeof fail !='undefined') this.CALLBACK_FAIL[key] = fail;
	    var iframe = document.createElement("IFRAME");
	    iframe.setAttribute("src", "bestpayhtml://ready?id="+key);
	    document.documentElement.appendChild(iframe);
	    iframe.parentNode.removeChild(iframe);
	    iframe = null;
	    
	    return this.OUTPUT_RESULTS[key]; //同步调用时返回值
	},
	    /*
	     * 获取执行服务和动作
	     * @params {String} key			队列标识
	     */
	getInputCmd:function(key) {
	    return JSON.stringify(this.INPUT_CMDS[key]);
	},
	    /*
	     * 获取执行参数
	     * @params {String} key			队列标识
	     */
	getInputArgs:function(key) {
	    return this.INPUT_ARGS[key];
	},
	    /*
	     * 回调返回结果函数
	     * @params {String} result		后台处理的结果
	     * @params {String} key			队列标识
	     */
	callBackJs:function(result,key) {
	    this.OUTPUT_RESULTS[key] = result;
	    //    alert(result);
	    var obj = JSON.parse(result);
	    var message = obj.message;
	    var status = obj.status;
	    if(status==0){
	        if (typeof this.CALLBACK_SUCCESS[key] !="undefined")
	            setTimeout("BestpayHtml5.CALLBACK_SUCCESS['"+key+"']('"+message+"')",0);
	    }else{
	        if (typeof this.CALLBACK_FAIL[key] !="undefined")
	            setTimeout("BestpayHtml5.CALLBACK_FAIL['"+key+"']('"+message+"')",0);
	    }
	}
	};
	
	//异步
	var exec_asyn = function(service,action,args,success,fail){
	   	var json = {
	        "service":service,
	        "action":action
	    };
	    
		BestpayHtml5.callNative(JSON.stringify(json),args,success,fail);
	    
	}
	
	//同步
	var exec_syn = function(service,action,args){
	    
		var json = {
			"service":service,
			"action":action
		};
	    
		var result_str = BestpayHtml5.callNative(JSON.stringify(json),args);
	    //alert("exec_syn result_str = " + result_str);
		var result;
		try{
	        
	        result = JSON.parse(result_str);
	    }catch(e){
			console.error(e.message);
			fail(e.message);
		}
	    
		var status = result.status;
		var message = result.message;
	    
		return message;
	}
	
	
	/*
	 * MD5加密
	 */
	
	////////////////////////////////
	var hexcase = 0; /* hex output format. 0 - lowercase; 1 - uppercase */
	var b64pad = ""; /* base-64 pad character. "=" for strict RFC compliance */
	var chrsz = 8; /* bits per input character. 8 - ASCII; 16 - Unicode */
	
	/*
	 * These are the functions you'll usually want to call
	 * They take string arguments and return either hex or base-64 encoded strings
	 */
	function hex_md5(s){ return binl2hex(core_md5(str2binl(s), s.length * chrsz));}
	function b64_md5(s){ return binl2b64(core_md5(str2binl(s), s.length * chrsz));}
	function hex_hmac_md5(key, data) { return binl2hex(core_hmac_md5(key, data)); }
	function b64_hmac_md5(key, data) { return binl2b64(core_hmac_md5(key, data)); }
	
	/* Backwards compatibility - same as hex_md5() */
	function calcMD5(s){ return binl2hex(core_md5(str2binl(s), s.length * chrsz));}
	
	/*
	 * Perform a simple self-test to see if the VM is working
	 */
	function md5_vm_test()
	{
	    return hex_md5("abc") == "900150983cd24fb0d6963f7d28e17f72";
	}
	
	/*
	 * Calculate the MD5 of an array of little-endian words, and a bit length
	 */
	function core_md5(x, len)
	{
	    /* append padding */
	    x[len >> 5] |= 0x80 << ((len) % 32);
	    x[(((len + 64) >>> 9) << 4) + 14] = len;
	    
	    var a = 1732584193;
	    var b = -271733879;
	    var c = -1732584194;
	    var d = 271733878;
	    
	    for(var i = 0; i < x.length; i += 16)
	    {
	        var olda = a;
	        var oldb = b;
	        var oldc = c;
	        var oldd = d;
	        
	        a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
	        d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
	        c = md5_ff(c, d, a, b, x[i+ 2], 17, 606105819);
	        b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
	        a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
	        d = md5_ff(d, a, b, c, x[i+ 5], 12, 1200080426);
	        c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
	        b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
	        a = md5_ff(a, b, c, d, x[i+ 8], 7 , 1770035416);
	        d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
	        c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
	        b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
	        a = md5_ff(a, b, c, d, x[i+12], 7 , 1804603682);
	        d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
	        c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
	        b = md5_ff(b, c, d, a, x[i+15], 22, 1236535329);
	        
	        a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
	        d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
	        c = md5_gg(c, d, a, b, x[i+11], 14, 643717713);
	        b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
	        a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
	        d = md5_gg(d, a, b, c, x[i+10], 9 , 38016083);
	        c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
	        b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
	        a = md5_gg(a, b, c, d, x[i+ 9], 5 , 568446438);
	        d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
	        c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
	        b = md5_gg(b, c, d, a, x[i+ 8], 20, 1163531501);
	        a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
	        d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
	        c = md5_gg(c, d, a, b, x[i+ 7], 14, 1735328473);
	        b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);
	        
	        a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
	        d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
	        c = md5_hh(c, d, a, b, x[i+11], 16, 1839030562);
	        b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
	        a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
	        d = md5_hh(d, a, b, c, x[i+ 4], 11, 1272893353);
	        c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
	        b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
	        a = md5_hh(a, b, c, d, x[i+13], 4 , 681279174);
	        d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
	        c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
	        b = md5_hh(b, c, d, a, x[i+ 6], 23, 76029189);
	        a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
	        d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
	        c = md5_hh(c, d, a, b, x[i+15], 16, 530742520);
	        b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);
	        
	        a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
	        d = md5_ii(d, a, b, c, x[i+ 7], 10, 1126891415);
	        c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
	        b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
	        a = md5_ii(a, b, c, d, x[i+12], 6 , 1700485571);
	        d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
	        c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
	        b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
	        a = md5_ii(a, b, c, d, x[i+ 8], 6 , 1873313359);
	        d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
	        c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
	        b = md5_ii(b, c, d, a, x[i+13], 21, 1309151649);
	        a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
	        d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
	        c = md5_ii(c, d, a, b, x[i+ 2], 15, 718787259);
	        b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);
	        
	        a = safe_add(a, olda);
	        b = safe_add(b, oldb);
	        c = safe_add(c, oldc);
	        d = safe_add(d, oldd);
	    }
	    return Array(a, b, c, d);
	    
	}
	
	/*
	 * These functions implement the four basic operations the algorithm uses.
	 */
	function md5_cmn(q, a, b, x, s, t)
	{
	    return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
	}
	function md5_ff(a, b, c, d, x, s, t)
	{
	    return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
	}
	function md5_gg(a, b, c, d, x, s, t)
	{
	    return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
	}
	function md5_hh(a, b, c, d, x, s, t)
	{
	    return md5_cmn(b ^ c ^ d, a, b, x, s, t);
	}
	function md5_ii(a, b, c, d, x, s, t)
	{
	    return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
	}
	
	/*
	 * Calculate the HMAC-MD5, of a key and some data
	 */
	function core_hmac_md5(key, data)
	{
	    var bkey = str2binl(key);
	    if(bkey.length > 16) bkey = core_md5(bkey, key.length * chrsz);
	    
	    var ipad = Array(16), opad = Array(16);
	    for(var i = 0; i < 16; i++)
	    {
	        ipad[i] = bkey[i] ^ 0x36363636;
	        opad[i] = bkey[i] ^ 0x5C5C5C5C;
	    }
	    
	    var hash = core_md5(ipad.concat(str2binl(data)), 512 + data.length * chrsz);
	    return core_md5(opad.concat(hash), 512 + 128);
	}
	
	/*
	 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	 * to work around bugs in some JS interpreters.
	 */
	function safe_add(x, y)
	{
	    var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	    return (msw << 16) | (lsw & 0xFFFF);
	}
	
	/*
	 * Bitwise rotate a 32-bit number to the left.
	 */
	function bit_rol(num, cnt)
	{
	    return (num << cnt) | (num >>> (32 - cnt));
	}
	
	/*
	 * Convert a string to an array of little-endian words
	 * If chrsz is ASCII, characters >255 have their hi-byte silently ignored.
	 */
	function str2binl(str)
	{
	    var bin = Array();
	    var mask = (1 << chrsz) - 1;
	    for(var i = 0; i < str.length * chrsz; i += chrsz)
	        bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (i%32);
	    return bin;
	}
	
	/*
	 * Convert an array of little-endian words to a hex string.
	 */
	function binl2hex(binarray)
	{
	    var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
	    var str = "";
	    for(var i = 0; i < binarray.length * 4; i++)
	    {
	        str += hex_tab.charAt((binarray[i>>2] >> ((i%4)*8+4)) & 0xF) +
	        hex_tab.charAt((binarray[i>>2] >> ((i%4)*8 )) & 0xF);
	    }
	    return str;
	}
	
	/*
	 * Convert an array of little-endian words to a base-64 string
	 */
	function binl2b64(binarray)
	{
	    var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	    var str = "";
	    for(var i = 0; i < binarray.length * 4; i += 3)
	    {
	        var triplet = (((binarray[i >> 2] >> 8 * ( i %4)) & 0xFF) << 16)
	        | (((binarray[i+1 >> 2] >> 8 * ((i+1)%4)) & 0xFF) << 8 )
	        | ((binarray[i+2 >> 2] >> 8 * ((i+2)%4)) & 0xFF);
	        for(var j = 0; j < 4; j++)
	        {
	            if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;
	            else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
	        }
	    }
	    return str;
	}
	return{
		Dialog : Dialog,
		App : App,
		exec_syn : exec_syn,
		DB_Data : DB_Data,
		Preference : Preference,
		Contacts : Contacts,
		User : User,
		Toast : Toast,
		BestpayHtml5 : BestpayHtml5,
		Storage : Storage,
		Security : Security,
		testData :testData,
		PasswordKeyBoard : PasswordKeyBoard,
		Scanner:Scanner,
		TalkingData:TalkingData
};

});