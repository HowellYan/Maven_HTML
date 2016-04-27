/**
 * true 44 测试环境
 * false 42 测试环境
 * @type Boolean
 */
var test = false;
var product=true; //true :生产 false 测试
var URL = "";
var ZjUrl = "";

var localUrl=location.href;
var urlJSON = urlParameters(localUrl);

var urlName = localUrl.substring(localUrl.lastIndexOf('/') + 1, localUrl.length);
localUrl=localUrl.replace(urlName,"");
console.log("------------------------------------"+localUrl);
var useInfoIOS = "";
var deviceInfo = "";
var bisChannel= "01";//二级渠道号；
var RZ_Url = "";
var BK_URl = "";

var productName;
var productIdCard;
var TOKENLOST = "010054";//token 失效
var ErrorPwd = "002135";//password error
var LockPed = "002136";//password locked
var LENGTHLONG = "3000";
var rzType="0";//认证状态    0：认证，1：修改认证
var productType = ''; //0:不支持产品线；1:资金归集；2：手机交费易；3双产品线（资金归集、手机交费易）

var PRODUCT = 0;//生产环境
var PRE_PRODUCT = 1;//准生产环境
var PUBLIC 	= 2;//42，常规版环境
var PRIVATE = 3;//87.4，开发环境
var ENV44	= 4;//44环境，紧急版测试环境
var ENV_REFINE= 5;//重构环境
var ENV46	= 6;//46环境，紧急版测试环境

var ENV =0;//当前环境
/**
 * 绑卡状态
 * @type Boolean
 */
var bindBankState = false;
/**
 * 
 * @type String
 */
var faZhState = false;
var zjTmnNum="";
var merId = "8613052900079605";
var tmnNum = "440106014021";

RZ_Url = localUrl + "authority.html";
BK_URl = localUrl + "bindCard.html";
CZ_URl = localUrl + "reCharge.html";

var SHOPTYPE_Z = '01'; //有无营业执照  01(有) 02(无)
var licence = '000000000000000'; //营业执照编号
var show321 = false; //三证合一弹出框显示

var NGINX_CPS = {
	'PUBLIC' : '/cps/',
	'ENV44' : '/NewCps44/',
	'ENV46' : '/NewCps46/',
	'ENV60' : '/NewCps60/',
	'PRODUCT' : '/cps_product/'
}, NGINX_INF = {
	'PUBLIC' : '/zijcps/',
	'ENV44' : '/zijcps44/',
	'ENV46' : '/zijcps46/',
	'ENV60' : '/cps60/',
	'PRODUCT' : '/zijcps_product/'
},TMNNUM = {
	'PRODUCT' : '440106014022',
	'PRE_PRODUCT' : '440106014022',
	'PUBLIC' : '440106003094',
	'ENV44' : '440106003094',
	'ENV46' : '440106003094',
	'DEFAULT' : '440106014021'
};

if(product){
	ENV=PRODUCT;
	URL = "/cps_product/";
	ZjUrl = "/zijcps_product/";
	zjTmnNum = "440106014021";
	merId = "8613052900079605";
	console.log = function () {};
	console.info = function () {};
	console.error = function() {};
}else if(test){//44测试环境
	ENV=ENV44;
	URL = "/cps44/";
	ZjUrl = "/zijcps44/";
	zjTmnNum = "440106003094";//440106003346 440106014022 440106003094
}else{//42测试地址
	ENV=PUBLIC;
	URL = "/cps/";
	ZjUrl = "/zijcps/";
	zjTmnNum = "440106003094";//440106003346 440106014022 440106003094
}

if(urlJSON.ENV != null){
	ENV = urlJSON.ENV;
	URL = NGINX_CPS[ENV];
	ZjUrl = NGINX_INF[ENV];
	zjTmnNum =NGINX_INF[ENV];
	RZ_Url = localUrl + "authority.html?ENV="+ENV;
	BK_URl = localUrl + "bindCard.html?ENV="+ENV;
	CZ_URl = localUrl + "reCharge.html?ENV="+ENV;
}





var Method = {
	"MSMS001" : "MSms001",//验证码
	"SBinCrd004" : "SBinCrd004",// 绑卡状态查询
	"SCbk001" : "SCbk001",// 客户银行信息查询
	"TAcc002" : "TAcc002",// 银行账户充值
	"TCard002" : "TCard002",//翼充卡充值
	"MRdcMake" : "MRdc001",//随机数
	"SPrm001" : "SPrm001",//溢价查询
	"MBinCrd005" : "MBinCrd005",
	"SAcc003" : "SAcc003",//账户余额
	"01_004" : "01_004", //资金账户充值
	"SAcc001" : "SAcc001",  	//	账户信息查询
	"MAut101":"MAut101",	//无纸化认证
	"MAccSmsSend":"MSms001", //短信下发接口
	"MBinCrd002":"MBinCrd002", //快捷绑卡
	"MBinCrd001":"MBinCrd001",	//帮付通绑卡验证
	"SReg003":"SReg003",	//注册信息查询
	"SThm003":"SThm003",   //阀值校验
	"SAut102":"SAut102",     //认证资料查询
	"SAcc009":"SAcc009",    //账户充值手续费查询    
    "SAut004":"SAut004",     //企业编码查询企业名称
    "MEpt002":"MEpt002",     //企业理财申购预校验
    'TEpt004':'TEpt004',   //3.6企业理财申购 (TEpt004)
    'SEpt006':'SEpt006',   ///* 企业理财账户信息接口(SEpt006) 请求参数*/
	'SCbk002':'SCbk002',   //查询支持绑卡银行列表
	'MAut005':'MAut005' //认证信息校验接口
};
var ERROR = {
	"fail" : "请求失败，请检查网络或稍后再试",
	"moneyError1" : "请输入1-1000的金额！",
	"moneyError2" : "请输入10-100000的金额！",
	"moneyError3" : "请输入充值金额的金额！",
	"tokenLost" : "请您重新登陆",
	"pwdError" : "请输入6-12位长度的密码",
    "noProduct " : "您好你的账号不支持充值业务",
	"cardNoError" : "请输入正确的翼支付卡号",
	"cardPwdError" : "请输入正确的密码",
	"authState1" : "亲，为了您的资金安全，请先进行认证再绑卡",
	"authState2" : "亲，审核通过后才能绑卡哟，我们正在努力加快审核，请耐心等待",
	"authState3" : "亲，您当前的认证状态为失败，为了您的资金安全，请等待认证后再绑卡",
	"bankNameEmptyError":"请选择银行",
	"bankCardEmptyError":"请输入银行卡号",
	"authShangHuNameEmptyError":"请输入商户名称",
	"authapplyNameEmptyError":"请输入经营者姓名",
	"openBankPhoneEmptyError":"请输入开户手机号码",
	"selectOpenBankCityEmptyError":"请选择省市",
	"openBankZhiHangInfoEmptyError":"请输入支行信息",
	"bankReservePhoneEmptyError":"请输入银行预留手机号",
	"contactAddressEmptyError":"请输入您的联系地址",
	"bindingcard_tips":"仅支持绑卡本人银行卡。"
};

var BANK = {
	"bankInfo":{
		zgbank:{"bankName":"中国银行","bankNum":"866100"},
		nybank:{"bankName":"农业银行","bankNum":"866300"},
		jsbank:{"bankName":"建设银行","bankNum":"866500"},
		msbank:{"bankName":"民生银行","bankNum":"866600"},
		zxbank:{"bankName":"中信银行","bankNum":"867400"},
		gfbank:{"bankName":"广发银行","bankNum":"866800"},
		zsbank:{"bankName":"招商银行","bankNum":"866900"},
		gsbank:{"bankName":"工商银行","bankNum":"866200"},
		xybank:{"bankName":"兴业银行","bankNum":"867600"},
		jtbank:{"bankName":"交通银行","bankNum":"866400"},
		gdbank:{"bankName":"光大银行","bankNum":"867200"},
		pabank:{"bankName":"平安银行","bankNum":"865700"},
		shbank:{"bankName":"上海银行","bankNum":"865500"},
		yzbank:{"bankName":"邮储银行","bankNum":"866000"},
		pfbank:{"bankName":"浦发银行","bankNum":"867100"}
	}
};

function  notouchmove(event) {
	event.preventDefault();
}
function $_id(id) {
	return document.getElementById(id);
}
/**
 * 
 * @param {} elt
 * @param {} status 0获取焦点 1失去焦点
 */
function onfocusInput(elt,status,flag){
	var pNode = elt.parentNode.parentNode.parentNode;
	var pBothor = elt.parentNode.parentNode;
	pBothor.children[1].onclick = function(){
		$(elt).val("");
		pBothor.children[1].className = pBothor.children[1].className.replace("_1","");
	}
	if(flag == true){
		if (status == 0) {
			pNode.className = pNode.className+"-select";
		}else{
			pNode.className = pNode.className.replace("-select", "");
		}
	}
	
	elt.addEventListener("input",function(){
			var value = elt.value ;
			if(value.length >0){
				if(pBothor.children[1].className.indexOf("_1") == -1){
					pBothor.children[1].className = pBothor.children[1].className+"_1";
				}
			}else{
				pBothor.children[1].className = pBothor.children[1].className.replace("_1","");
			}
		},false);
}






function urlParameters(urlParame) {
	var url;
	if(urlParame==null){
		url=document.URL;
	}else{
		url=urlParame;
	}
	//url = url.replace('?authenStatus','&authenStatus');
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
		console.log("url-------------"+JSON.stringify(retJson));
	} else {
		console.log("没有参数!");
	}
	return retJson;
}

