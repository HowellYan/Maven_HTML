var urlAll=window.location.href,url,isRecords,isMin=false;url=urlAll.substring(urlAll.lastIndexOf("/")+1,urlAll.lastIndexOf(".html"));if(url.indexOf(".min")>0){isMin=true;url=url.substring(0,url.lastIndexOf(".min"))}!function(N,M){function L(){console.log("base:flexible1");var b=G.getBoundingClientRect().width;b/z>540&&(b=540*z);var a=b/9;G.style.fontSize=a+"px",x.rem=N.rem=a;console.log("base:flexible2")}var K,I=N.document,G=I.documentElement,D=I.querySelector('meta[name="viewport"]'),B=I.querySelector('meta[name="flexible"]'),z=0,y=0,x=M.flexible||(M.flexible={});if(D){console.warn("将根据已有的meta标签来设置缩放比例");var w=D.getAttribute("content").match(/initial\-scale=([\d\.]+)/);w&&(y=parseFloat(w[1]),z=parseInt(1/y))}else{if(B){var v=B.getAttribute("content");if(v){var u=v.match(/initial\-dpr=([\d\.]+)/),J=v.match(/maximum\-dpr=([\d\.]+)/);u&&(z=parseFloat(u[1]),y=parseFloat((1/z).toFixed(2))),J&&(z=parseFloat(J[1]),y=parseFloat((1/z).toFixed(2)))}}}if(!z&&!y){var H=N.navigator.userAgent,F=(!!H.match(/android/gi),!!H.match(/iphone/gi)),E=F&&!!H.match(/OS 9_3/),C=N.devicePixelRatio;z=F&&!E?C>=3&&(!z||z>=3)?3:C>=2&&(!z||z>=2)?2:1:1,y=1/z}if(G.setAttribute("data-dpr",z),!D){if(D=I.createElement("meta"),D.setAttribute("name","viewport"),D.setAttribute("content","initial-scale="+y+", maximum-scale="+y+", minimum-scale="+y+", user-scalable=no"),G.firstElementChild){G.firstElementChild.appendChild(D)}else{var A=I.createElement("div");A.appendChild(D),I.write(A.innerHTML)}}N.addEventListener("resize",function(){clearTimeout(K),K=setTimeout(L,300)},!1),N.addEventListener("pageshow",function(a){a.persisted&&(clearTimeout(K),K=setTimeout(L,300))},!1),"complete"===I.readyState?I.body.style.fontSize=12*z+"px":I.addEventListener("DOMContentLoaded",function(){I.body.style.fontSize=12*z+"px"},!1),L(),x.dpr=N.dpr=z,x.refreshRem=L,x.rem2px=function(b){var a=parseFloat(b)*this.rem;return"string"==typeof b&&b.match(/rem$/)&&(a+="px"),a},x.px2rem=function(b){var a=parseFloat(b)/this.rem;return"string"==typeof b&&b.match(/px$/)&&(a+="rem"),a}}(window,window.lib||(window.lib={}));var eObj=document.getElementById("page_main");if(!!eObj){eObj.style.display="block"}(function(){this.FastButton=function(a,b){console.log("fastbutton init");this.element=a;this.handler=b;console.log(this);a.addEventListener("touchstart",this,false);a.addEventListener("click",this,false)};this.FastButton.prototype.handleEvent=function(a){console.log(a);switch(a.type){case"touchstart":this.onTouchStart(a);break;case"touchmove":this.onTouchMove(a);break;case"touchend":this.onClick(a);break;case"click":this.onClick(a);break}};this.FastButton.prototype.onTouchStart=function(a){a.stopPropagation();this.element.addEventListener("touchend",this,false);document.body.addEventListener("touchmove",this,false);this.startX=a.touches[0].clientX;this.startY=a.touches[0].clientY};this.FastButton.prototype.onTouchMove=function(a){if(Math.abs(a.touches[0].clientX-this.startX)>10||Math.abs(a.touches[0].clientY-this.startY)>10){this.reset()}};this.FastButton.prototype.onClick=function(a){a.stopPropagation();this.reset();this.handler(a);if(a.type=="touchend"){console.log("touchend")}};this.FastButton.prototype.reset=function(){this.element.removeEventListener("touchend",this,false);document.body.removeEventListener("touchmove",this,false)};this.clickbuster=function(){console.log("init clickbuster")};this.clickbuster.preventGhostClick=function(a,b){clickbuster.coordinates.push(a,b);window.setTimeout(this.clickbuster.pop,2500)};this.clickbuster.pop=function(){this.clickbuster.coordinates.splice(0,2)};this.clickbuster.onClick=function(a){for(var d=0;d<clickbuster.coordinates.length;d+=2){console.log(this);var c=clickbuster.coordinates[d];var b=clickbuster.coordinates[d+1];if(Math.abs(a.clientX-c)<25&&Math.abs(a.clientY-b)<25){a.stopPropagation();a.preventDefault()}}}})(this);function urlParameters(c){var a;if(c==null){a=document.URL}else{a=c}if(a.lastIndexOf("#")!=-1){a=a.substring(0,a.lastIndexOf("#"))}var f="";var d={};if(a.lastIndexOf("?")>0){f=a.substring(a.lastIndexOf("?")+1,a.length);var e=f.split("&");f="";for(var b=0;b<e.length;b++){d[e[b].split("=")[0]]=e[b].split("=")[1]}console.log(JSON.stringify(d))}else{console.log("没有参数!")}return d}document.addEventListener("click",clickbuster.onClick,true);clickbuster.coordinates=[];var baseUrl="../../lib/js/",minStr="";if(isMin){minStr="min.";baseUrl="../../lib/js/"+minStr}require.config({baseUrl:"js",waitSeconds:0,paths:{jquery:"../../lib/js/jquery-1.10.2.min",android:"../../lib/js/android",ios:"../../lib/js/ios",browser:"../../lib/js/browser","bestpay.lang":baseUrl+"bestpay.lang","bestpay.ui":baseUrl+"bestpay.ui","bestpay.http":baseUrl+"bestpay.http",global:baseUrl+"global","bestpay.base":baseUrl+"bestpay.base",jtemplates:"../../lib/js/jquery-jtemplates",dummy:"../../dummy",subconfig:minStr+"config",subclass:minStr+url},shim:{jtemplates:["jquery"]},urlArgs:"bust=${online_version}"});require(["global","subconfig"],function(d,e){for(var c in e){d[c]=e[c]}window.config=d;window.dialogId=0;var a=urlParameters(urlAll);if(a.ENV!=null){d.ENV=a.ENV}if(!d.debug||d.ENV==="PRODUCT"){console.log=function(){};console.info=function(){};console.error=function(){}}var b="";if(!!d.browser){b="browser/"+minStr+"bestpay.html5";d.dummy=true}else{if((/android/gi).test(navigator.appVersion)){b="android/"+minStr+"bestpay.html5";d.bisChannel="01"}else{b="ios/bestpay.html5";d.bisChannel="02"}}console.log("loading "+b);window.showDialog=function(f){if(dialogId!==0){dismissDialog()}if(f==null||f==""){f=d.MSG.loading}dialogId=Bestpay.Dialog.showProgressDialog("",f)};window.dismissDialog=function(){if(dialogId===0){return}Bestpay.Dialog.dismissDialog(dialogId);dialogId=0};window.pageStack=new Array();window.goTo=function(i,g){console.log("----------goTo page--------- : "+i.title);initPage(i,"goto");if(typeof g==="function"){g()}if(d.isDialogBack==true){d.isDialogBack=false;return}if(isRecords==true){isRecords=false;return}if(i.prompt!=true){var h=pageStack.length;if(h>0){var f=pageStack[pageStack.length-1];document.getElementById(f.id).style.display="none";if(i.goToRecords!=null&&i.goToRecords==true){document.getElementById(f.id).style.display="block"}}}pageStack.push(i);document.getElementById(i.id).style.display="block";if(i.title!=null){Bestpay.App.setTitle(i.title)}};window.back=function(g){initPage(null,"back");var h=pageStack.length;if(h<=1){if(h==1&&pageStack[0].isGoToMain!=null&&pageStack[0].isGoToMain==true){console.log("isGoToMain:"+pageStack[0].isGoToMain);Bestpay.App.jumpToMain();return}Bestpay.App.exitApp();return}var i=pageStack.pop();h=pageStack.length;var j=pageStack[h-1];if(typeof g==="function"){g(i,j)}var f=document.getElementById(i.id);f.style.display="none";f=document.getElementById(j.id);f.style.display="block";Bestpay.App.setTitle(j.title)};window.onback=function(g){console.log("isBack() : "+g);if(pageStack[pageStack.length-1]==="overTimePage"){var f=document.getElementById("overTimePage");f.style.display="none";Bestpay.App.exitApp()}console.log("state  ======= "+d.payingBack);if(!!d.payingBack){isRecords=true;PasswordKeyBoard.hideKeyboardUI3();d.payingBack=false;dismissDialog();Bestpay.Dialog.showAlertSynchroDialog(d.TITLE.submited_title,d.MSG.msg_submited_content,"确定",d.TRADE_LIST_QUERY_TYPE,d.TRADE_LIST_QUERY_NUMBER);if(typeof d.isBack==="function"){d.isBack();d.isBack=null;return}return}if(pageStack.length>1&&pageStack[pageStack.length-1].goToRecords!=null&&!!pageStack[pageStack.length-1].goToRecords){$(document).scrollTop(0);$("#order_comfirm").removeClass("goPayAnimation").addClass("backPayAnimation");setTimeout(function(){back()},600);return}if(pageStack.length>1&&pageStack[pageStack.length-1].isDisable==true){return}else{if(pageStack.length>1&&pageStack[pageStack.length-1].goahead_main==true){Bestpay.App.exitApp()}}if(pageStack.length>=1&&pageStack[pageStack.length-1].togo!=null){console.log("togo:"+pageStack[pageStack.length-1].togo);if(pageStack[pageStack.length-1].togo!=true){pageStack=pageStack[pageStack.length-1].togo}else{if(typeof d.isBack==="function"){d.isBack();d.isBack=null;return}}}else{if(typeof d.isBack==="function"&&pageStack.length==0){d.isBack();d.isBack=null;return}}if(g=="dismissDialog"){d.isOpen=true;d.isDialogBack=true}if(g=="backpress"){back()}else{if(g!="backpress"){d.otherEvent(g)}}};window.initPage=function(f,g){PasswordKeyBoard.hideKeyboardUI3();if(!!NumberKeyBoard.HidenumKeyboard){NumberKeyBoard.HidenumKeyboard()}d.startPage(f,g);if(!!f&&f.goToRecords==true){return}$(document).scrollTop(0)};require([b,"subclass"],function(g,f){window.Bestpay=g;window.BestpayHtml5=g.BestpayHtml5;window.App=g.App;window.PasswordKeyBoard=g.PasswordKeyBoard;window.returnkey=g.PasswordKeyBoard.returnkey;window.deleteKey=g.PasswordKeyBoard.deleteKey;window.NumberKeyBoard=g.NumberKeyBoard;window.returnNum=g.NumberKeyBoard.returnNum;window.deleteNum=g.NumberKeyBoard.deleteNum;window.userInfo=g.User.getSuccessLoginInfo();window.product=g.User.getProduct();g.App.overrideBackPressed(true);g.App.setKeyEventListener(onback);new f().initApp()})});