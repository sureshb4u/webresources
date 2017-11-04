var wjQuery = jQuery.noConflict();

setTimeout(function(){
	var lmrui = new LmrUI();
	lmrui.callOnLoad();
}, 300);

function LmrUI() {
    this.months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    this.todayDate = new Date();
    this.lmrList = [];
    this.years = [];
    this.selectedYear = "";
    this.selectedMonth = "";
    this.centerId = "";

    this.getQueryParm = function(){
        var self = this;
        var query = decodeURIComponent(window.location.search).replace("?Data=","");
        var result = {};
        if (typeof query == "undefined" || query == null) {
            return result;
        }
        var queryparts = query.split("&");
        for (var i = 0; i < queryparts.length; i++) {
            var params = queryparts[i].split("=");
            result[params[0]] = params.length > 1 ? params[1] : null;
        }
        if(result.recordid != undefined && result.entityname != undefined){
            result.recordid = result.recordid.replace("{","");
            result.recordid = result.recordid.replace("}","");
        }
        return result;
    }

    this.callOnLoad = function(){
        var self = this;
        wjQuery(".loading").show();
        var query = decodeURIComponent(window.location.search).replace("?Data=","");
        var result = {};
        if (typeof query == "undefined" || query == null) {
            return result;
        }
        var queryparts = query.split("&");
        for (var i = 0; i < queryparts.length; i++) {
            var params = queryparts[i].split("=");
            result[params[0]] = params.length > 1 ? params[1] : null;
        }
        if(result.recordid != undefined && result.entityname != undefined){
            result.recordid = result.recordid.replace("{","");
            result.recordid = result.recordid.replace("}","");
            self.populateYears();
            self.populateMonths();
            onLoad(result.recordid, result.entityname, self.selectedMonth, self.selectedYear);
        }else{
            // self.promptUi("No changes to reconcile");
            // wjQuery(".loading").hide();
        }
    }

    // After getting data
    this.generateTemplate = function (dataTodisplay) {
        var self = this;
        if (dataTodisplay == undefined) {
            self.promptUi("No changes to reconcile");
            wjQuery(".loading").hide();
        } else {
            self.lmrList = dataTodisplay;
            self.generateSkeleton();
        }
    }

    this.generateSkeleton = function () {
        var self = this;
        var skeleton = "";
        if(self.lmrList.length){
            wjQuery.each(self.lmrList, function(index, el) {
                skeleton = '<aside class="heading">';
                                if(el.hasOwnProperty("CenterNumber")){
                                    skeleton += '<article class="row">'+
                                                    '<span class="first"><b>Center#</b></span>'+
                                                    '<span id="center-id" >'+el.CenterNumber+'</span>'+
                                            '</article>';
                                }
                                if(el.hasOwnProperty("CenterName")){
                                    skeleton += '<article class="row">'+
                                                    '<span class="first"><b>Center Name:</b></span>'+
                                                    '<span>'+el.CenterName+'</span>'+
                                            '</article>';
                                }
                                if(el.hasOwnProperty("CenterAddress")){
                                    skeleton += '<article class="row">'+
                                                    '<span class="first"><b>Center Address:</b></span>'+
                                                    '<span>'+el.CenterAddress+'</span>'+
                                            '</article>';
                                }
                                if(el.hasOwnProperty("LicenseAgreement")){
                                    skeleton += '<article class="row">'+
                                                    '<span class="first"><b>License Agreement:</b></span>'+
                                                    '<span>'+el.LicenseAgreement+'</span>'+
                                            '</article>';
                                }
                            skeleton += '</aside>';
                            '<aside class="desc">';
                skeleton += '    <section class="by4">'+
                            '       <h1>ROYALTY CALCULATION:</h1>'+
                            '        <article class="dark">'+
                            '            <span class="first-colm">&nbsp;</span>'+
                            '            <span>Amount</span>'+
                            '            <span>Royalty%</span>'+
                            '            <span>Total</span>'+
                            '        </article>'+
                            '        <article>'+
                            '            <span class="first-colm">Core Revenue summary</span>';
                                            if(el.hasOwnProperty("CoreAmount")){
                                                skeleton += '<span>$'+el.CoreAmount+'</span>';
                                            }
                                            if(el.hasOwnProperty("CorePecent")){
                                                skeleton += '<span>'+el.CorePecent+'</span>';
                                            }
                                            if(el.hasOwnProperty("CoreTotal")){
                                                skeleton += '<span>$'+el.CoreTotal+'</span>';
                                            }
                skeleton += '        </article>'+
                            '        <article>'+
                            '            <span class="first-colm">EDGE revenue summary</span>';
                                            if(el.hasOwnProperty("EdgeAmount")){
                                                skeleton += '<span>$'+el.EdgeAmount+'</span>';
                                            }
                                            if(el.hasOwnProperty("EdgePercent")){
                                                skeleton += '<span>'+el.EdgePercent+'</span>';
                                            }
                                            if(el.hasOwnProperty("EdgeTotal")){
                                                skeleton += '<span>$'+el.EdgeTotal+'</span>';
                                            }
                skeleton += '        </article>'+
                            '        <article>'+
                            '            <span class="first-colm"><b>Total Cash subject to Royalty</b></span>';
                                            if(el.hasOwnProperty("TotalRoyaltyAmount")){
                                                skeleton += '<span>$'+el.TotalRoyaltyAmount+'</span>'+
                                                '            <span>&nbsp;</span>'+
                                                '            <span>&nbsp;</span>';
                                            }
                skeleton += '        </article>'+
                            '        <article class="brdr-btm">'+
                            '            <span class="first-colm">&nbsp;</span>';
                                            if(el.hasOwnProperty("TotalDue")){
                                                skeleton += ' <span>&nbsp;</span>'+
                                                            '<span><b>Total Royalty Due</b></span>'+
                                                            '<span>$'+el.TotalDue+'</span>';
                                            }
                skeleton += '        </article>'+
                            '        <h1>NATIONAL ADVERTISING:</h1>'+
                            '        <article class="dark">'+
                            '            <span class="first-colm">&nbsp;</span>'+
                            '            <span>Amount</span>'+
                            '            <span>NAC/NAF%</span>'+
                            '            <span>Total</span>'+
                            '        </article>'+
                            '        <article>'+
                            '           <span class="first-colm">National Advertising Fund</span>';
                                        if(el.hasOwnProperty("NACAmount")){
                                            skeleton += ' <span>$'+el.NACAmount+'</span>';
                                        }
                                        if(el.hasOwnProperty("NACRate")){
                                            skeleton += ' <span>'+el.NACRate+'</span>';
                                        }
                                        if(el.hasOwnProperty("NACPayment")){
                                            skeleton += ' <span>$'+el.NACPayment+'</span>';
                                        }
                skeleton += '        </article>'+
                            '        <article>'+
                            '           <span class="first-colm">National Advertising Campaign</span>';
                                        if(el.hasOwnProperty("NAFAmount")){
                                            skeleton += ' <span>$'+el.NAFAmount+'</span>';
                                        }
                                        if(el.hasOwnProperty("NAFRate")){
                                            skeleton += ' <span>'+el.NAFRate+'</span>';
                                        }
                                        if(el.hasOwnProperty("NAFPayment")){
                                            skeleton += ' <span>$'+el.NAFPayment+'</span>';
                                        }
                skeleton += '        </article>'+
                            '        <article>'+
                            '            <span class="first-colm">&nbsp;</span>'+
                            '            <span>&nbsp;</span>'+
                            '            <span><b>Total National Advertising due:</b></span>';
                                        if(el.hasOwnProperty("TotalAdvertisingPayment")){
                                            skeleton += ' <span>$'+el.TotalAdvertisingPayment+'</span>';
                                        }
                skeleton += '        </article>'+
                            '        <article class="no-brdr btn-article">'+
                            '            <span class="first-colm">&nbsp;</span>'+
                            '            <span>&nbsp;</span>'+
                            '            <span>&nbsp;</span>'+
                            '            <span><button class="lmr-submit" >Submit LMR</button></span>'+
                            '        </article>';
                            '    </section>'+
                            '</aside>';     
            });
        } else {
            skeleton = "<span>No data found</span>";
        }
        wjQuery("#lmr-table").html(skeleton);
        setTimeout(function () {
            self.attachAllEvent();
            wjQuery(".loading").hide();
        }, 500);
    }

    this.attachAllEvent = function(){
        var self = this;
        // wjQuery("#monthSelected").on("change", function () {
        //     wjQuery(".loading").show();
        //     self.selectedMonth = wjQuery(this).val();
        //     self.selectedYear = wjQuery("#yearSelected").val();
        //     setTimeout(function(){
        //         wjQuery("#lmr-table").html("");
        //         var query = self.getQueryParm();
        //         onLoad(query.recordid, query.entityname, self.selectedMonth, self.selectedYear);
        //     },300);
        // });

        // wjQuery("#yearSelected").on("change", function () {
        //     wjQuery(".loading").show();
        //     self.selectedYear = wjQuery(this).val();
        //     self.selectedMonth = wjQuery("#monthSelected").val();
        //     setTimeout(function(){
        //         wjQuery("#lmr-table").html("");
        //         var query = self.getQueryParm();
        //         onLoad(query.recordid, query.entityname, self.selectedMonth, self.selectedYear);
        //     },300);
        // })
        wjQuery(".getLmr").click(function(event) {
            wjQuery(".loading").show();
            self.selectedYear = wjQuery("#yearSelected").val();
            self.selectedMonth = wjQuery("#monthSelected").val();
            setTimeout(function(){
                wjQuery("#lmr-table").html("");
                var query = self.getQueryParm();
                onLoad(query.recordid, query.entityname, self.selectedMonth, self.selectedYear);
            },300);
        });

        wjQuery(".lmr-submit").click(function(event) {
            wjQuery(".loading").show();
            self.centerId = wjQuery("#center-id").text();
            self.selectedYear = wjQuery("#yearSelected").val();
            self.selectedMonth = wjQuery("#monthSelected").val();
            self.confirmPopup("Are you sure to submit?");
        });

    }


    this.submitLmr = function(){
        var self = this;
        wjQuery(".ui-dialog").fadeOut('slow');
        wjQuery(".ui-widget-overlay").fadeOut('slow');
        var result = self.getQueryParm();
        var response = OnSubmitLMR(result.recordid, self.selectedMonth, self.selectedYear);
        if(response){
            self.promptUi("LMR submited successfully");
        }else{
            self.promptUi("LMR alredy exist for selected period");
        }
    }

	this.populateYears = function(){
    	var self = this;
        var presentYear = (new Date()).getFullYear();
    	var yearSkeleton = '<select class="form-control" id="yearSelected">';
        var pushYear = presentYear;
        for (var i = 9; i > 0; i--) {
            if (presentYear == pushYear) {
                yearSkeleton += '<option value="' + pushYear+ '" selected>' + pushYear + '</option>';
            } else {
                yearSkeleton += '<option value="' + pushYear + '">' + pushYear + '</option>';
            }
    		pushYear = presentYear-i;
    	}
        yearSkeleton += "</selction>";
        wjQuery("#dropdown > .year").html(yearSkeleton);
        wjQuery("#dropdown").append('<button class="getLmr">Submit</button>');
        this.selectedYear = wjQuery("#yearSelected").val();
    }

    this.populateMonths = function(){
    	var self = this;
        var monthSkeleton = '<select class="form-control" id="monthSelected">';
        wjQuery.each(self.months, function (key, val) {
            if (self.todayDate.getMonth() === key) {
                monthSkeleton += '<option value="' + key + '" selected>' + val + '</option>';
            } else {
                monthSkeleton += '<option value="' + key + '">' + val + '</option>';
            }
        });
        monthSkeleton += "</selction>";
        wjQuery("#dropdown > .month").html(monthSkeleton);
        this.selectedMonth = wjQuery("#monthSelected").val();
    }

    this.confirmPopup = function (message) {
        var self = this;
        wjQuery(".ui-dialog").fadeIn("slow");
        wjQuery(".ui-widget-overlay").fadeIn('slow');
        wjQuery("#dialog > .dialog-msg").text(message);
        wjQuery("#dialog").dialog({
            dialogClass: "no-close",
            resizable: false,
            height: "auto",
            width: 350,
            modal: true,
            show: {
                effect: 'slide',
                complete: function() {
                    wjQuery(".loading").hide();
                }
            },
            close: function (event, ui) {
                wjQuery(this).dialog("close");
                window.close();
            },
            buttons: {
                Yes: function () {
                    wjQuery(".loading").show();
                    setTimeout(function(){
                        self.submitLmr();
                    },300)
                },
                Cancel: function(){
                    wjQuery(this).dialog("close");
                    window.close();
                }
            }
        });
    }


    this.promptUi = function (message) {
        var self = this;
        wjQuery(".ui-dialog").fadeIn("slow");
        wjQuery(".ui-widget-overlay").fadeIn('slow');
        wjQuery("#dialog > .dialog-msg").text(message);
        wjQuery("#dialog").dialog({
            dialogClass: "no-close",
            resizable: false,
            height: "auto",
            width: 350,
            modal: true,
            show: {
                effect: 'slide',
                complete: function() {
                    wjQuery(".loading").hide();
                }
            },
            close: function (event, ui) {
                wjQuery(this).dialog("close");
                window.close();
            },
            buttons: {
                Ok: function () {
                    wjQuery(this).dialog("close");
                    window.close();
                }
            }
        });
        wjQuery(".loading").hide();
    }
}