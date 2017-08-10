 var wjQuery;
(function() {

    // Localize jQuery variable
    /******** Load jQuery if not present *********/
    if (window.jQuery === undefined || window.jQuery.fn.jquery !== '1.8.2') {
        var jQ_script_tag = document.createElement('script');
        jQ_script_tag.setAttribute("type","text/javascript");
        jQ_script_tag.setAttribute("src","/webresources/hub_/calendar/js/jquery_1.9.0.min.js");
        if (jQ_script_tag.readyState) {
          jQ_script_tag.onreadystatechange = function () { // For old versions of IE
              if (this.readyState == 'complete' || this.readyState == 'loaded') {
                  scriptLoadHandler();
              }
          };
        } 
        else {
          jQ_script_tag.onload = scriptLoadHandler;
        }
        // Try to find the head, otherwise default to the documentElement
        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(jQ_script_tag);
        
    } 
    else {
        // The jQuery version on the window is the one we want to use
        wjQuery = window.jQuery;
    }

    /******** Called once jQuery has loaded ******/
    function scriptLoadHandler() {
        // Restore $ and window.jQuery to their previous values and store the
        // new jQuery in our local jQuery variable
        wjQuery = window.jQuery.noConflict(false);    
    }
})();
