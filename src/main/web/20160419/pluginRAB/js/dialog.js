/**
 * Created by Rg on 2015/3/17.
 */
define(['utils',"jquery"],function(Utils,$) {
    var infoShow  ;//避免多次提示
    /**
     * 底部消息提示
     */
    function showInfoDialog(info) {
        var params = {
            "text":info,
            "duration":"3000"
        }
        exec("Toast","makeText",JSON.stringify(params));
        //clearTimeout(infoShow);
        //$("#infoDialog").css("display", "none");
        //$("#infoDialog").text( info) ;
        //$("#infoDialog").css("display", "block");
        //infoShow = 1 ;
        //infoShow = setTimeout(function () {
        //    $("#infoDialog").css("display", "none");
        //    infoShow = 0;
        //}, 3000)
    }

    /**
     * 显示loading 加载提示
     * @param info
     */
    function nextLoadingShow(info){
        $("#loadingInfo").text(info == null || info== "" || info == undefined? "正在加载..":info);
        console.log("加载框show!!!!!!!!!!!!!");
        $("#ch_dialog").css("display","block");
    }

       /**
     * 隐藏loading加载提示
     */
    function nextLoadingHide(){
           console.log("加载框hide!!!!!!!!!!!!!");
        $("#ch_dialog").css("display","none");
    }


    return{
        showInfoDialog : showInfoDialog,
        nextLoadingShow:nextLoadingShow,
        nextLoadingHide:nextLoadingHide
    };
})


