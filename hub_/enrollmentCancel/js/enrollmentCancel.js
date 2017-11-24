$(document).ready(function($) {
	$("input").keydown(function (e) {
        // validation
        var alllowKeys = [8, 13, 9, 110, 37, 39, 47, 48, 49, 50, 51, 52, 53, 54, 56, 57];
        var index = alllowKeys.indexOf(e.keyCode);
        var allow = false;
        // console.log(e.keyCode);
        if(e.keyCode >= 96 && e.keyCode <= 105){
            allow = true;
        }else{
            if(index == -1){
                allow = false;
                e.preventDefault();
            }
        }
    });	

    $("#submit").click(function(event) {
    	var val = $("input").val();
    	if(val.length){
    		console.log(val)
    	}else{
    		alert("Input can not be empty");
    	}
    });

    $("#cancel").click(function(event) {
    	window.close();
    });
});