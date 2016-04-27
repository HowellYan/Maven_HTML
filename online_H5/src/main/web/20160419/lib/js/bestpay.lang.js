/**
 * Created by liuyun on 15/4/26.
 * Version 1.0
 */


define(function() {
    var DateTime = {
        /**
         * @Description 获取YYYYMMDD格式的日期字符串
         * @return {@link String}日期
         */
        getDate_YYYYMMDD : function(){
            var date = new Date();
            var y = date.getFullYear();
            var m = date.getMonth() + 1;
            m = m < 10 ? '0' + m : m;
            var d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
            return y + '' + m + '' + d;
        },
        /**
         * @Description 获取YYYYMMDD格式的日期字符串
         * @return {@link String}日期
         */
        getDate_YYYY_MM_DD : function(){
            var date = new Date();
            var y = date.getFullYear();
            var m = date.getMonth() + 1;
            m = m < 10 ? '0' + m : m;
            var d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
            return y + '-' + m;
        },
        /**
         * @Description 获取HHMMSS格式的时间字符串
         * @return {@link String}时间
         */
        getTime_HHMMSS : function(){
            var date = new Date();
            var h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
            var f = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
            var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
            return h + '' + f + '' + s;
        },
        /**
         * 比较两个日期的时间差
         * @param time1 是之前的时间
         * @param time2 是之后的时间
         * @param type  0是比较天数 1是相差小时 2是相差分钟
         * @returns {string}
         */
        getTime_CONTRAST : function (time1,time2,type) {
            var keep = '';
            var timeSet = function(timeOut){
                var abc = '';
                var a = timeOut .substring(0,4);
                var b = timeOut .substring(4,6);
                var c =  timeOut .substring(6,8);
                var d =  timeOut .substring(8,10);
                var e =  timeOut .substring(10,12);
                var f =  timeOut .substring(12,14);
                abc = a+'/'+b+'/'+c+' '+d+':'+e+':'+f;
                console.log('abc = ' + abc);
                return abc;
            };
            var d1 = new Date(Date.parse(timeSet(time1)));
            var d2 = new Date(Date.parse(timeSet(time2)));//
            if(type == '2'){ //分钟数   把当前时间转为格式 2014/10/30 17:40:00
                keep = (d2 - d1) / 60000;
            }
            return keep;
        }
    };

    var Util = {
        /**
         * 电信：telecom ，移动：mobile，联通：telecom
         * @param inputVal 手机号
         * @returns {*}
         */
        getPhoneOperators : function(inputVal){
            if(inputVal != null && inputVal.length >= 4){
                // 电信号码
                var telecomHead = [ "177", "180", "181", "189", "153", "133","149","1700"];
                // 移动号码
                var mobileHead = [ "134", "135", "136", "137", "138", "139", "147", "150", "151", "152", "157", "158", "159", "178", "182", "183", "184", "187", "188" ,"1709"];
                // 联通号码
                var unicomHead = [ "130", "131", "132", "145", "155", "156", "186", "185", "176" ,"1705"];
                for (var i = 0; i < telecomHead.length; i++) {
                    if (inputVal.indexOf(telecomHead[i]) == 0) {
                        return 'telecom';
                    }
                }
                for (var i = 0; i < mobileHead.length; i++) {
                    if (inputVal.indexOf(mobileHead[i]) == 0) {
                        return 'mobile';
                    }
                }
                for (var i = 0; i < unicomHead.length; i++) {
                    if (inputVal.indexOf(unicomHead[i]) == 0) {
                        return 'unicom';
                    }
                }
            }
            return '';
        },
        getIDCardInfo : function(UUserCard,num){
            if(num == 1){//获取出生日期
                birth=UUserCard.substring(6, 10) + "-" + UUserCard.substring(10, 12) + "-" + UUserCard.substring(12, 14);
                return birth;
            }
            if(num == 2){//获取性别
                if (parseInt(UUserCard.substr(16, 1)) % 2 == 1) {
                    return "男";
                } else {
                    return "女";
                }
            }
            if(num == 3){//获取年龄
                var myDate = new Date();
                var month = myDate.getMonth() + 1;
                var day = myDate.getDate();
                var age = myDate.getFullYear() - UUserCard.substring(6, 10) - 1;
                if (UUserCard.substring(10, 12) < month || UUserCard.substring(10, 12) == month && UUserCard.substring(12, 14) <= day) {
                    age++;
                }
                return age;
            }
        },
        getThausand : function(s,type){
                if (/[^0-9\.]/.test(s)) return "0";
                if (s == null || s == "") return "0";
                s = s.toString().replace(/^(\d*)$/, "$1.");
                s = (s + "00").replace(/(\d*\.\d\d)\d*/, "$1");
                s = s.replace(".", ",");
                var re = /(\d)(\d{3},)/;
                while (re.test(s))
                    s = s.replace(re, "$1,$2");
                s = s.replace(/,(\d\d)$/, ".$1");
                if (type == 0) {// 不带小数位(默认是有小数位)
                    var a = s.split(".");
                    if (a[1] == "00") {
                        s = a[0];
                    }
                }
                return s;
        }
    };

    String.prototype.startWith = function (s) {
        if (s == null || s == "" || this.length == 0 || s.length > this.length)
            return false;
        if (this.substr(0, s.length) == s)
            return true;
        else
            return false;
    };
    String.prototype.isEmpty = function(){
        if(typeof this == 'undefined' || this == 'undefined' || this == '' || this == null || this == 'null' || this == 'NULL' || this == '(null)')
            return false;
        else
            return true;
    };

    return {
        isFunction : function(func) {
            return typeof func === 'function';
        },

        fen2yuan : function(fen) {
            fen = fen + '';
            if(fen==null ||fen.length<1){
                return '0.00';
            }else if(fen.length==1){
                return '0.0'+fen;
            }else if(fen.length==2){
                return '0.'+fen;
            }else {
                var f = fen.substring(fen.length - 2);
                var y = fen.substring(0, fen.length - 2);
                return y + "." + f;
            }
        },

        yuan2fen : function(yuan) {
            var yuanStr = yuan+'';
            if (yuanStr.startWith('.')) {
                yuanStr = '0' + yuanStr;
            }
            yuan = new Number(yuanStr).toFixed(2);
            var currency = Math.round((yuan*100)*1000)/1000;
            if ((currency+"").indexOf(".") > 0) {
                currency = currency.substring(0, currency.indexOf("."));
            }
            return currency;
        },
        'getDate_YYYYMMDD' : DateTime.getDate_YYYYMMDD,
        'getDate_YYYY_MM_DD' : DateTime.getDate_YYYY_MM_DD,
        'getTime_HHMMSS' : DateTime.getTime_HHMMSS,
        'getTime_CONTRAST' : DateTime.getTime_CONTRAST,
        'getPhoneOperators' : Util.getPhoneOperators,
        'getIDCardInfo' : Util.getIDCardInfo,
        'getThausand' : Util.getThausand
    };
});