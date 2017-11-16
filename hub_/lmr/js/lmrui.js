var wjQuery = jQuery.noConflict();

setTimeout(function () {
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

    this.getQueryParm = function () {
        var self = this;
        var query = decodeURIComponent(window.location.search).replace("?Data=", "");
        var result = {};
        if (typeof query == "undefined" || query == null) {
            return result;
        }
        var queryparts = query.split("&");
        for (var i = 0; i < queryparts.length; i++) {
            var params = queryparts[i].split("=");
            result[params[0]] = params.length > 1 ? params[1] : null;
        }
        if (result.recordid != undefined && result.entityname != undefined) {
            result.recordid = result.recordid.replace("{", "");
            result.recordid = result.recordid.replace("}", "");
        }
        return result;
    }

    this.callOnLoad = function () {
        var self = this;
        wjQuery(".loading").show();
        var query = decodeURIComponent(window.location.search).replace("?Data=", "");
        var result = {};
        if (typeof query == "undefined" || query == null) {
            return result;
        }
        var queryparts = query.split("&");
        for (var i = 0; i < queryparts.length; i++) {
            var params = queryparts[i].split("=");
            result[params[0]] = params.length > 1 ? params[1] : null;
        }
        if (result.recordid != undefined && result.entityname != undefined) {
            result.recordid = result.recordid.replace("{", "");
            result.recordid = result.recordid.replace("}", "");
            self.populateYears();
            self.populateMonths();
            onLoad(result.recordid, result.entityname, self.selectedMonth, self.selectedYear);
        } else {
            // self.promptUi("No changes to reconcile");
            wjQuery(".loading").hide();
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
        if (self.lmrList.length) {
            wjQuery.each(self.lmrList, function (index, el) {
                skeleton = '<aside class="heading">';
                if (el.hasOwnProperty("CenterNumber")) {
                    skeleton += '<article class="row">' +
                                    '<span class="first"><b>Center#</b></span>' +
                                    '<span id="center-id" >' + el.CenterNumber + '</span>' +
                            '</article>';
                }
                if (el.hasOwnProperty("CenterName")) {
                    skeleton += '<article class="row">' +
                                    '<span class="first"><b>Center Name:</b></span>' +
                                    '<span>' + el.CenterName + '</span>' +
                            '</article>';
                }
                if (el.hasOwnProperty("CenterAddress")) {
                    skeleton += '<article class="row">' +
                                    '<span class="first"><b>Center Address:</b></span>' +
                                    '<span>' + el.CenterAddress + '</span>' +
                            '</article>';
                }
                if (el.hasOwnProperty("LicenseAgreement")) {
                    skeleton += '<article class="row">' +
                                    '<span class="first"><b>License Agreement:</b></span>' +
                                    '<span>' + el.LicenseAgreement + '</span>' +
                            '</article>';
                }
                skeleton += '</aside>';
                '<aside class="desc">';
                skeleton += '    <section class="by4">' +
                            '       <h1>ROYALTY CALCULATION:</h1>' +
                            '        <article class="dark">' +
                            '            <span class="first-colm">&nbsp;</span>' +
                            '            <span>Amount</span>' +
                            '            <span>Royalty%</span>' +
                            '            <span>Total</span>' +
                            '        </article>' +
                            '        <article>' +
                            '            <span class="first-colm">Core Revenue summary</span>';
                if (el.hasOwnProperty("CoreAmount")) {
                    skeleton += '<span id="coreval">$' + el.CoreAmount + '</span>';
                }
                if (el.hasOwnProperty("CorePecent")) {
                    skeleton += '<span>' + el.CorePecent + '</span>';
                }
                if (el.hasOwnProperty("CoreTotal")) {
                    skeleton += '<span id="coreTotal" >$' + el.CoreTotal + '</span>';
                }
                skeleton += '        </article>' +
                            '        <article>' +
                            '            <span class="first-colm">EDGE revenue summary</span>';
                if (el.hasOwnProperty("EdgeAmount")) {
                    skeleton += '<span id="edgeval" >$' + el.EdgeAmount + '</span>';
                }
                if (el.hasOwnProperty("EdgePercent")) {
                    skeleton += '<span>' + el.EdgePercent + '</span>';
                }
                if (el.hasOwnProperty("EdgeTotal")) {
                    skeleton += '<span id="edgeTotal" >$' + el.EdgeTotal + '</span>';
                }

                skeleton += '        </article>' +
                            '        <article>' +
                            '            <span class="first-colm">Credit Card Fees:</span>';
                skeleton += '<span class="input-field">$<input type="text" class="form-control table-input" id="creditval" name="creditval" value="' + el.creditval + '" ></span>';
                if (el.hasOwnProperty("CorePecent")) {
                    skeleton += '<span id="creditPercent" >' + el.CorePecent + '</span>';
                }
                    skeleton += '<span id="creditTotal" >$' + el.creditTotal + '</span>';

                skeleton += '        </article>' +
                            '        <article>' +
                            '            <span class="first-colm">Misc Royalty Reduction</span>';
                    skeleton += '<span class="input-field">$<input type="text" class="form-control table-input" id="miscval" name="miscval" value="' + el.miscval + '" ></span>';
                    skeleton += '<span >-</span>';
                    skeleton += '<span id="miscTotal" >$' + el.miscTotal + '</span>';

                skeleton += '        </article>' +
                            '        <article>' +
                            '            <span class="first-colm"><b>Total Cash subject to Royalty</b></span>';
                if (el.hasOwnProperty("TotalRoyaltyAmount")) {
                    skeleton += '<span id="r1Total" >$' + el.TotalRoyaltyAmount + '</span>' +
                    '            <span>&nbsp;</span>' +
                    '            <span>&nbsp;</span>';
                }
                skeleton += '        </article>' +
                            '        <article class="brdr-btm">' +
                            '            <span class="first-colm">&nbsp;</span>';
                if (el.hasOwnProperty("TotalDue")) {
                    skeleton += ' <span>&nbsp;</span>' +
                                '<span><b>Total Royalty Due</b></span>' +
                                '<span id="rTotal">$' + el.TotalDue + '</span>';
                }
                skeleton += '        </article>' +
                            '        <h1>NATIONAL ADVERTISING:</h1>' +
                            '        <article class="dark">' +
                            '            <span class="first-colm">&nbsp;</span>' +
                            '            <span>Amount</span>' +
                            '            <span>NAC/NAF%</span>' +
                            '            <span>Total</span>' +
                            '        </article>' +
                            '        <article>' +
                            '           <span class="first-colm">National Advertising Fund</span>';
                if (el.hasOwnProperty("NAFAmount")) {
                    skeleton += ' <span>$' + el.NAFAmount + '</span>';
                }
                if (el.hasOwnProperty("NAFRate")) {
                    skeleton += ' <span>' + el.NAFRate + '</span>';
                }
                if (el.hasOwnProperty("NAFPayment")) {
                    skeleton += ' <span>$' + el.NAFPayment + '</span>';
                }
                skeleton += '        </article>' +
                            '        <article>' +
                            '           <span class="first-colm">National Advertising Campaign</span>';
                if (el.hasOwnProperty("NACAmount")) {
                    skeleton += ' <span>$' + el.NACAmount + '</span>';
                }
                if (el.hasOwnProperty("NACRate")) {
                    skeleton += ' <span>' + el.NACRate + '</span>';
                }
                if (el.hasOwnProperty("NACPayment")) {
                    skeleton += ' <span>$' + el.NACPayment + '</span>';
                }
                skeleton += '        </article>' +
                            '        <article class="btm-brdr">' +
                            '            <span class="first-colm">&nbsp;</span>' +
                            '            <span>&nbsp;</span>' +
                            '            <span><b>Total National Advertising due:</b></span>';
                if (el.hasOwnProperty("TotalAdvertisingPayment")) {
                    skeleton += ' <span>$' + el.TotalAdvertisingPayment + '</span>';
                }

                skeleton += '</article>' +
                '    </section>' +
                '</aside>';
            });
        } else {
            skeleton = "<span>No data found</span>";
        }
        wjQuery("#lmr-table").html(skeleton);
        wjQuery("#lmr-table").nextAll().remove();
        wjQuery("#lmr-table").after(self.appendOtherSkeleten());
        setTimeout(function () {
            self.attachAllEvent();
            wjQuery(".loading").hide();
        }, 500);
    }

    this.appendOtherSkeleten = function(){
        var self = this;
        var el= self.lmrList[0];
        var skeleton =  '<section class="form-area">'+
                '        <aside class="form-aside">'+
                '           <h1>ADVERTISING</h1>'+
                '           <p class="form-row">'+
                '               <label><b>TV</b></label>'+
                '               <input type="text" class="table-input advtVal" value="'+el.tv+'" name="tv">'+
                '           </p>'+
                '           <p class="form-row">'+
                '               <label><b>Radio</b></label>'+
                '               <input type="text" class="table-input advtVal" value="'+el.radio+'" name="radio">'+
                '           </p>'+
                '           <p class="form-row">'+
                '               <label><b>Outdoor</b></label>'+
                '               <input type="text" class="table-input advtVal" value="'+el.outdoor+'" name="outdoor">'+
                '           </p>'+
                '           <p class="form-row">'+
                '               <label><b>Magazine/Newpaper</b></label>'+
                '               <input type="text" class="table-input advtVal" value="'+el.magazine+'" name="magazine">'+
                '           </p>'+
                '           <p class="form-row">'+
                '               <label><b>Other</b></label>'+
                '               <input type="text" class="table-input advtVal" value="'+el.aother+'" name="aother">'+
                '           </p>'+
                '           <p class="form-row">'+
                '               <label></label>'+
                '           </p>'+
                '           <p class="form-row">'+
                '               <label></label>'+
                '           </p>'+
                '           <p class="form-row">'+
                '               <label><b>TOTAL ADVERTISING SPEND:</b></label>'+
                '               <span id="advTotal">$'+el.advTotal+'</span>'+
                '           </p>'+
                '        </aside>'+
                '        <aside class="form-aside">'+
                '           <h1>LOCAL MARKETING</h1>'+
                '           <p class="form-row">'+
                '               <label><b>Direct Mail</b></label>'+
                '               <input type="text" class="table-input localVal" value="'+el.mail+'" name="mail">'+
                '           </p>'+
                '           <p class="form-row">'+
                '               <label><b>Sylvan Promotional Items</b></label>'+
                '               <input type="text" class="table-input localVal" value="'+el.promotional+'" name="promotional">'+
                '           </p>'+
                '           <p class="form-row">'+
                '               <label><b>Brochures and Flyers</b></label>'+
                '               <input type="text" class="table-input localVal" value="'+el.brochure+'" name="brochure">'+
                '           </p>'+
                '           <p class="form-row">'+
                '               <label><b>Demos and Events</b></label>'+
                '               <input type="text" class="table-input localVal" value="'+el.demos+'" name="demos">'+
                '           </p>'+
                '           <p class="form-row">'+
                '               <label><b>Teams or Club Sponsorships</b></label>'+
                '               <input type="text" class="table-input localVal" value="'+el.teams+'" name="teams">'+
                '           </p>'+
                '           <p class="form-row">'+
                '               <label><b>Payroll</b></label>'+
                '               <input type="text" class="table-input localVal" value="'+el.payroll+'" name="payroll">'+
                '           </p>'+
                '           <p class="form-row">'+
                '               <label><b>Other</b></label>'+
                '               <input type="text" class="table-input localVal" value="'+el.lother+'" name="lother">'+
                '           </p>'+
                '           <p class="form-row">'+
                '               <label><b>TOTAL LOCAL MARKETING SPEND:</b></label>'+
                '               <span id="localTotal">$'+el.localTotal+'</span>'+
                '           </p>'+
                '        </aside>'+
                '</section>'+
                '<article class="no-brdr btn-article">' +
                '            <span class="first-colm">Comment</span>' +
                '            <span><input type="text" value="'+el.comment+'" class="form-control" id="comment" ></span>' +
                '            <span>&nbsp;</span>' +
                '            <span><button class="lmr-submit" >Submit LMR</button></span>' +
                '</article>';
                return skeleton;
    }


    this.attachAllEvent = function () {
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
        wjQuery(".getLmr").off();
        wjQuery(".getLmr").click(function (event) {
            wjQuery(".loading").show();
            self.selectedYear = wjQuery("#yearSelected").val();
            self.selectedMonth = wjQuery("#monthSelected").val();
            setTimeout(function () {
                wjQuery("#lmr-table").html("");
                var query = self.getQueryParm();
                onLoad(query.recordid, query.entityname, self.selectedMonth, self.selectedYear);
            }, 300);
        });

        wjQuery(".lmr-submit").off();
        wjQuery(".lmr-submit").click(function (event) {
            wjQuery(".loading").show();
            self.centerId = wjQuery("#center-id").text();
            self.selectedYear = wjQuery("#yearSelected").val();
            self.selectedMonth = wjQuery("#monthSelected").val();
            self.confirmPopup("Are you sure to submit?");
        });

        wjQuery(".table-input").keydown(function (e) {
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

        wjQuery("#creditval").on("input", function(e) {
            var val = wjQuery(this).val();
            if(val){
                var creditval = parseFloat(val);
                var creditPercent = parseFloat(wjQuery("#creditPercent").text());
                var creditTotal = ((creditval*creditPercent)/100).toFixed(2)
                wjQuery("#creditTotal").text("$"+creditTotal);
                creditTotal = parseFloat(wjQuery("#creditTotal").text().replace("$",""));
                var coreVal = parseFloat(wjQuery("#coreval").text().replace("$",""));
                var coreTotal = parseFloat(wjQuery("#coreTotal").text().replace("$",""));
                var edgeVal = parseFloat(wjQuery("#edgeval").text().replace("$",""));
                var edgeTotal = parseFloat(wjQuery("#edgeTotal").text().replace("$",""));
                var miscVal = parseFloat(wjQuery("#miscval").val());
                var miscTotal = parseFloat(wjQuery("#miscTotal").text().replace("$",""));
                var rTotal = creditTotal+coreTotal+miscTotal+edgeTotal;
                var r1Total = coreVal+edgeVal+creditval+miscVal;
                wjQuery("#rTotal").text("$"+rTotal);
                wjQuery("#r1Total").text("$"+r1Total);
            }
        });

        wjQuery("#miscval").on("input", function(e) {
            var val = wjQuery(this).val();
            if(val){
                var miscVal = parseFloat(val);
                var coreVal = parseFloat(wjQuery("#coreval").text().replace("$",""));
                var coreTotal = parseFloat(wjQuery("#coreTotal").text().replace("$",""));
                var edgeVal = parseFloat(wjQuery("#edgeval").text().replace("$",""));
                var edgeTotal = parseFloat(wjQuery("#edgeTotal").text().replace("$",""));
                var creditVal1 = parseFloat(wjQuery("#creditval").val());
                var creditTotal = parseFloat(wjQuery("#creditTotal").text().replace("$",""));
                wjQuery("#miscTotal").text("$"+miscVal);
                var rTotal = creditTotal+coreTotal+miscVal+edgeTotal;
                var r1Total = coreVal+edgeVal+creditVal1+miscVal;
                wjQuery("#rTotal").text("$"+rTotal);
                wjQuery("#r1Total").text("$"+r1Total);
            }
        });

        wjQuery(".localVal").off();
        wjQuery(".localVal").on("input", function(e) {
            var val = wjQuery(this).val();
            var ltotal = 0;
            if(val){
                wjQuery(".localVal").each(function(index, element){
                    var elVal = wjQuery(element).val();
                    // console.log(elVal);
                    ltotal += parseFloat(elVal);
                });
                wjQuery("#localTotal").text("$"+ltotal);
            }
        });

        wjQuery(".advtVal").off();
        wjQuery(".advtVal").on("input", function(e) {
            var val = wjQuery(this).val();
            var ltotal = 0;
            if(val){
                wjQuery(".advtVal").each(function(index, element){
                    var elVal = wjQuery(element).val();
                    // console.log(elVal);
                    ltotal += parseFloat(elVal);
                });
                wjQuery("#advTotal").text("$"+ltotal);
            }
        });

    }

    this.submitLmr = function () {
        var self = this;
        wjQuery(".ui-dialog").fadeOut('slow');
        wjQuery(".ui-widget-overlay").fadeOut('slow');
        var result = self.getQueryParm();

        wjQuery(".localVal").each(function(index, element){
            var elVal = wjQuery(element).val();
            var elName = wjQuery(element).attr("name");
            self.lmrList[0][elName] = elVal;
        });

        wjQuery(".advtVal").each(function(index, element){
            var elVal = wjQuery(element).val();
            var elName = wjQuery(element).attr("name");
            self.lmrList[0][elName] = elVal;
        });

        // update lmr object
        self.lmrList[0]['creditval'] = wjQuery("#creditval").val();
        self.lmrList[0]['miscval'] = wjQuery("#miscval").val();
        self.lmrList[0]['creditTotal'] = wjQuery("#creditTotal").text().replace("$","");
        self.lmrList[0]['miscTotal'] = wjQuery("#miscTotal").text().replace("$","");
        self.lmrList[0]['TotalRoyaltyAmount'] = wjQuery("#r1Total").text().replace("$","");
        self.lmrList[0]['TotalDue'] = wjQuery("#rTotal").text().replace("$","");
        self.lmrList[0]['localTotal'] = wjQuery("#localTotal").text().replace("$","");
        self.lmrList[0]['advTotal'] = wjQuery("#advTotal").text().replace("$","");
        self.lmrList[0]['Comment'] = wjQuery("#comment").val();

        this.lmrList = self.lmrList;
        var response = OnSubmitLMR(result.recordid, self.selectedMonth, self.selectedYear, self.lmrList[0]);
        if (response)
        {
            self.promptUi(response);
        }
        else
        {
            self.promptUi("Error occured in generating LMR");
        }
    }

    this.populateYears = function () {
        var self = this;
        var presentYear = (new Date()).getFullYear();
        var yearSkeleton = '<select class="form-control" id="yearSelected">';
        var pushYear = presentYear;
        for (var i = 9; i >= 0; i--) {
            if (presentYear == pushYear) {
                yearSkeleton += '<option value="' + pushYear + '" selected>' + pushYear + '</option>';
            } else {
                yearSkeleton += '<option value="' + pushYear + '">' + pushYear + '</option>';
            }
            pushYear = presentYear - i;
        }
        yearSkeleton += "</selction>";
        wjQuery("#dropdown > .year").html(yearSkeleton);
        wjQuery("#dropdown").append('<button class="getLmr">View LMR</button>');
        this.selectedYear = wjQuery("#yearSelected").val();
    }

    this.populateMonths = function () {
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
                complete: function () {
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
                    setTimeout(function () {
                        self.submitLmr();
                    }, 300)
                },
                Cancel: function () {
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
                complete: function () {
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