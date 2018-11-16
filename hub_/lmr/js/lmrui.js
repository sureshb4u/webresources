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
    this.countryConst = "United States Of America";

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

    this.printElem = function(elem){
        wjQuery("#print").hide();
        wjQuery(".lmr-submit").hide();
        wjQuery(".getLmr").hide();
        setTimeout(function () {
            window.print();
            wjQuery("#print").show();
            wjQuery(".lmr-submit").show();
            wjQuery(".getLmr").show();
        }, 200);

        // var contents = wjQuery(elem).html();
        // var frame1 = wjQuery('<iframe />');
        // frame1[0].name = "frame1";
        // frame1.css({ "position": "absolute", "top": "-1000000px", "width" : "200px", "height" : "200px"});
        // wjQuery("body").append(frame1);
        // var frameDoc = frame1[0].contentWindow ? frame1[0].contentWindow : frame1[0].contentDocument.document ? frame1[0].contentDocument.document : frame1[0].contentDocument;
        // frameDoc.document.open();
        // //Create a new HTML document.
        // frameDoc.document.write('<html><head><title>License Marketing Royalties</title>');
        // frameDoc.document.write('</head><body>');
        // //Append the external CSS file.
        // frameDoc.document.write('<link href="/webresources/hub_/lmr/css/lmr.css" rel="stylesheet" type="text/css" />');
        // //Append the DIV contents.
        // frameDoc.document.write("<header><span>License Marketing Royalties</span></header>"+contents);
        // frameDoc.document.write('</body></html>');
        // frameDoc.document.close();
        // setTimeout(function () {
        //     window.frames["frame1"].focus();
        //     window.frames["frame1"].print();
        //     frame1.remove();
        //     wjQuery("#print").show();
        //     wjQuery(".lmr-submit").show();
        //     wjQuery(".getLmr").show();
        // }, 500);
    }

    this.callOnLoad = function () {
        var self = this;
        Xrm.Utility.showProgressIndicator("Processing Please wait...");
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
            var currentMonth = new Date().getMonth();
            var pastMonths = self.months.splice(0, currentMonth + 1);
            self.populateMonths(pastMonths);
            onLoad(result.recordid, result.entityname, self.selectedMonth, self.selectedYear);
        } else {
            // self.promptUi("No changes to reconcile");
            Xrm.Utility.closeProgressIndicator();
        }
    }

    // After getting data
    this.generateTemplate = function (dataTodisplay) {
        var self = this;
        if (dataTodisplay == undefined) {
            self.promptUi("No changes to reconcile");
            Xrm.Utility.closeProgressIndicator();
        } else {
            this.lmrList = dataTodisplay;
            self.generateSkeleton();
        }
    }

    this.generateSkeleton = function () {
        var self = this;
        var skeleton = "";
        var foreignExchange;
        var foreignWitholdings;
        var localAdPayment;
        var render = true;
        wjQuery(".lmr-submit").removeClass("disabledBtn");
        wjQuery(".lmr-submit").removeAttr("title");
        wjQuery(".lmr-submit").removeAttr("data-original-title");
        self.selectedMonth = wjQuery("#monthSelected").val();
        self.selectedYear = wjQuery("#yearSelected").val();
        if (self.lmrList.length) {
            if (self.lmrList[0].onboardingDate) {
                var onBoardDate = new Date(self.lmrList[0].onboardingDate).setDate("1");
                var selectedDate = new Date((parseInt(self.selectedMonth)+1) + "/01/" + self.selectedYear).getTime();
                if (onBoardDate > selectedDate) {
                    render = false;
                }
            }
            var isClosedText = self.lmrList[0].IsClosed ? "disabled" : "";
            wjQuery.each(self.lmrList, function (index, el) {
                foreignExchange = el.TotalDue;
                foreignWitholdings = el.TotalDue;
                if (!el.returnPaymentFees) {
                    el.returnPaymentFees = 0;
                }
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
                                    '<span class="first"><b>Center Address:</b></span>';
                    if (el.CenterAddress) {
                        skeleton += '<span>' + el.CenterAddress + '</span>' ;
                            
                    } else {
                        skeleton += '<span> - </span>';
                    }
                    skeleton += '</article>';
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
                            '        <article id="royaltySection" class="dark">' +
                            '            <span class="first-colm">&nbsp;</span>' +
                            '            <span>Amount</span>' +
                            '            <span>Royalty%</span>' +
                            '            <span>Total <img id="royaltySection" class="accord" src="/webresources/hub_/calendar/images/accord.png"/></span>' +
                            '        </article>' +
                            '        <div class="royaltySection"><article style="height: 80px;">' +
                            '            <span class="first-colm"> ' +
                            '               <div style="padding: 5px;">Core Revenue summary</div><div style="padding: 5px;padding-top:15px;">Return Payment Fees</div>'+
                            '            </span>';
                if (el.hasOwnProperty("CoreAmount")) {
                    skeleton += '<span id="coreval"><div style="padding:5px">$' + parseFloat(el.CoreAmount).toFixed(2) + '</div>' +
                                '<div style="padding: 5px;padding-top:15px;" class="input-field returnPaymentContainer"><b>$</b><input type="text" class="form-control table-input" id="returnPayVal" name="returnPayment" value="' + el.returnPaymentFees + '" ' + isClosedText + '></div></span>';
                }
                if (el.hasOwnProperty("CorePecent")) {
                    if (!el.CorePecent) {
                        el.CorePecent = "0.00";
                    }
                    skeleton += '<span>' + (el.CorePecent*100) + '</span>';
                }
                if (el.hasOwnProperty("CoreTotal")) {
                    skeleton += '<span id="coreTotal" >$' + parseFloat(el.CoreTotal).toFixed(2) + '</span>';
                }
                skeleton += '        </article>' +
                            '        <article>' +
                            '            <span class="first-colm">EDGE revenue summary</span>';
                if (el.hasOwnProperty("EdgeAmount")) {
                    skeleton += '<span id="edgeval" >$' + parseFloat(el.EdgeAmount).toFixed(2) + '</span>';
                }
                if (el.hasOwnProperty("EdgePercent")) {
                    if (!el.EdgePercent) {
                        el.EdgePercent = "0.00";
                    }
                    skeleton += '<span>' + (el.EdgePercent*100) + '</span>';
                }
                if (el.hasOwnProperty("EdgeTotal")) {
                    skeleton += '<span id="edgeTotal" >$' + parseFloat(el.EdgeTotal).toFixed(2) + '</span>';
                }

                skeleton += '        </article>' +
                            '        <article>' +
                            '            <span class="first-colm">Credit Card Fees:</span>';
                skeleton += '<span class="input-field"><b>$</b><input type="text" class="form-control table-input" id="creditval" name="creditval" value="' + el.creditval + '" '+isClosedText+'></span>';
                if (el.hasOwnProperty("CreditPercent")) {
                    if (!el.CreditPercent) {
                        el.CreditPercent = "0.00";
                    }
                    skeleton += '<span id="creditPercent" >' + (el.CreditPercent * 100) + '</span>';
                }
                skeleton += '<span id="creditTotal" >($' + parseFloat(el.creditTotal).toFixed(2) + ')</span>';

                skeleton += '        </article>';
                if(el.ManualAdjustment != undefined && el.ManualAdjustment){
                    skeleton +=  '<article>' +
                                        '<span class="first-colm">Misc Royalty Adjustment</span>'+
                                        '<span class="input-field"><b>$</b><input type="text" class="form-control table-input" id="miscval" name="miscval" value="' + el.miscval + '" '+isClosedText+' ></span>'+
                                        '<span >-</span>'+
                                        '<span id="miscTotal" >$' + parseFloat(el.miscTotal).toFixed(2) + '</span>'+
                                    '</article>';
                }
                skeleton += '        <article>' +
                            '            <span class="first-colm"><b>Total Cash subject to Royalty</b></span>';
                if (el.hasOwnProperty("TotalRoyaltyAmount")) {
                    skeleton += '<span id="r1Total" >$' + parseFloat(el.TotalRoyaltyAmount).toFixed(2) + '</span>' +
                    '            <span>&nbsp;</span>' +
                    '            <span>&nbsp;</span>';
                }
                if (el.Country && el.Country.toLowerCase() != self.countryConst.toLowerCase()) {
                    if (!el.Wrate) {
                        el.Wrate = 0.00;
                    }
                    if (!el.Erate) {
                        el.Erate = 0.00;
                    }
                    foreignWitholdings = parseFloat(el.TotalDue).toFixed(2) * el.Wrate;
                    var localRoyaltyDue = parseFloat(el.TotalDue).toFixed(2) - foreignWitholdings;
                    foreignExchange = parseFloat(localRoyaltyDue).toFixed(2) * el.Erate;
                    skeleton += ' </article><article class="subHeader">' +
                        '<span></span><span></span><span>local currency gross royalty: </span>'+
                        '<span class="rTotal">$' + parseFloat(el.TotalDue).toFixed(2) + '</span></article>' +
                        '<article><span>Foreign Tax Witholdings : </span><span class="rTotal">$' + parseFloat(el.TotalDue).toFixed(2) + '</span>' +
                        '<span id="wrate" raw-value=' + el.Wrate + '>' + parseFloat((el.Wrate * 100)).toFixed(2) + '</span><span id="foreignWitholdings">$ ' + parseFloat(foreignWitholdings).toFixed(2) + '</span>' +
                        '</article><article class="subHeader">'+
                        '<span></span><span></span><span> total royalty due local currency: </span>'+
                        '<span class="royaltyDueLocal">$' + parseFloat(localRoyaltyDue).toFixed(2) + '</span></article>' +
                        '<article><span>Foreign Exchange Conversion : </span><span class="royaltyDueLocal">$' + parseFloat(localRoyaltyDue).toFixed(2) + '</span>' +
                        '<span  id="erate" raw-value=' + el.Erate + '>' + parseFloat((el.Erate * 100)).toFixed(2) + '</span><span class="foreignExchange">$ ' + parseFloat(foreignExchange).toFixed(2) + '</span>'
                }
                skeleton += '        </article>' +
                            '        <article class="brdr-btm">' +
                            '            <span class="first-colm">&nbsp;</span>';
                if (el.Country && el.Country.toLowerCase() != self.countryConst.toLowerCase()) {
                    skeleton += ' <span>&nbsp;</span>' +
                                '<span><b>Total Royalty Due USD</b></span>' +
                                '<span class="foreignExchange">$' + parseFloat(foreignExchange).toFixed(2) + '</span>';
                }else{
                    skeleton += ' <span>&nbsp;</span>' +
                                '<span><b>Total Royalty Due USD</b></span>' +
                                '<span class="rTotal">$' + parseFloat(el.TotalDue).toFixed(2) + '</span>';
                }
                skeleton += '        </article></div>' +
                            '        <h1>NATIONAL ADVERTISING:</h1>' +
                            '        <article id="advertisingSection" class="dark">' +
                            '            <span class="first-colm">&nbsp;</span>' +
                            '            <span>Amount</span>' +
                            '            <span>NAC/NAF%</span>' +
                            '            <span>Total<img id="advertisingSection" class="accord" src="/webresources/hub_/calendar/images/accord.png"/></span>' +
                            '        </article>' +
                            '        <div class="advertisingSection" ><article>' +
                            '        <span class="first-colm">National Advertising Fund</span>';
                if (el.hasOwnProperty("NAFAmount")) {
                    skeleton += ' <span id="nafAmount" >$' +  parseFloat(el.NAFAmount).toFixed(2) + '</span>';
                }
                if (el.hasOwnProperty("NAFRate")) {
                    if (!el.NAFRate) {
                        el.NAFRate = "0.00";
                    }
                    skeleton += ' <span>' + parseFloat(el.NAFRate*100).toFixed(2) + '</span>';
                }
                if (el.hasOwnProperty("NAFPayment")) {
                    skeleton += ' <span id="nafPayment" >$' + parseFloat(el.NAFPayment).toFixed(2) + '</span>';
                }
                skeleton += '        </article>' +
                            '        <article>' +
                            '           <span class="first-colm">National Advertising Campaign</span>';
                if (el.hasOwnProperty("NACAmount")) {
                    skeleton += ' <span  id="nacAmount" >$' + parseFloat(el.NACAmount).toFixed(2) + '</span>';
                }
                if (el.hasOwnProperty("NACRate")) {
                    if (!el.NACRate) {
                        el.NACRate = "0.00";
                    }
                    skeleton += ' <span>' + parseFloat(el.NACRate*100).toFixed(2) + '</span>';
                }
                if (el.hasOwnProperty("NACPayment")) {
                    skeleton += ' <span id="nacPayment" >$' + parseFloat(el.NACPayment).toFixed(2) + '</span>';
                }          
                if (el.Country && el.Country.toLowerCase() != self.countryConst.toLowerCase()) {
                    localAdPayment =  parseFloat(el.TotalAdvertisingPayment).toFixed(2) * el.Erate;
                    skeleton += '</article><article class="subHeader"><span></span><span></span><span><b>Total National Advertising Local Currency:</b></span>' +
                        '<span class="totalAdvertisingPayment" >$' + parseFloat(el.TotalAdvertisingPayment).toFixed(2) + '</span>' +
                        '</article><article>'+
                        '<span>Foreign Exchange Conversion : </span><span class="totalAdvertisingPayment">$' + parseFloat(el.TotalAdvertisingPayment).toFixed(2) + '</span>' +
                        '<span>' + parseFloat((el.Erate) * 100).toFixed(2) + '</span><span class="totalAdvertisingPaymentLocal">$' + parseFloat(localAdPayment).toFixed(2) + '</span>'
                }
                skeleton += '        </article>' +
                            '        <article class="btm-brdr">' +
                            '            <span class="first-colm">&nbsp;</span>' +
                            '            <span>&nbsp;</span>'+
                            '<span><b>Total National Advertising Due USD:</b></span>';
                if (localAdPayment) {
                    skeleton += ' <span class="totalAdvertisingPaymentLocal" >$' + parseFloat(localAdPayment).toFixed(2) + '</span>';
                } else {
                    skeleton += ' <span class="totalAdvertisingPayment" >$' + parseFloat(el.TotalAdvertisingPayment).toFixed(2) + '</span>';
                }
                skeleton += '</article></div>' +
                '    </section>' +
                '</aside>';
        });
        } else {
            skeleton = "<div class='noData'>No data found</div>";
        }
        wjQuery("#lmr-table").html(skeleton);
        wjQuery("#lmr-table").next("#adNMarketing").remove();
        wjQuery("#lmr-table").next(".adNMarketing").remove();
        wjQuery("#lmr-table").next(".btn-article").remove();
        wjQuery("#lmr-table").after(self.appendOtherSkeleten());
        if (!render) {
            wjQuery(".lmr-submit").removeClass("disabledBtn");
            wjQuery(".lmr-submit").removeAttr("title");
            wjQuery(".lmr-submit").removeAttr("data-original-title");
            wjQuery(".lmr-submit").attr("title", "You cannot submit LMR for dates before the Onboading Date");
            wjQuery(".lmr-submit").attr("data-original-title", "You cannot submit LMR for dates before the Onboading Date");
            wjQuery(".lmr-submit").addClass("disabledBtn");
        }
        setTimeout(function () {
            self.attachAllEvent();
            wjQuery("#creditval").trigger("input");
            Xrm.Utility.closeProgressIndicator();
            wjQuery("#lmr").removeAttr('style');
        }, 500);
    }

    this.appendOtherSkeleten = function(){
        var self = this;
        var el= self.lmrList[0];
        var isClosedText = el.IsClosed ? "disabled" : "";
        var skeleton = '<article id="adNMarketing" class="dark"><div class="header">advertising & Marketing<span><img id="adNMarketing" class="accord" src="/webresources/hub_/calendar/images/accord.png"/><span></div></article>' +
                '<div class="adNMarketing"><section class="form-area">' +
                '        <aside class="form-aside">'+
                '           <h1>ADVERTISING</h1>'+
                '           <p class="form-row">'+
                '               <label><b>TV</b></label>'+
                '               <input type="text" class="table-input advtVal" value="'+el.tv+'" name="tv" '+isClosedText+'>'+
                '           </p>'+
                '           <p class="form-row">'+
                '               <label><b>Radio</b></label>'+
                '               <input type="text" class="table-input advtVal" value="'+el.radio+'" name="radio" '+isClosedText+'>'+
                '           </p>'+
                '           <p class="form-row">'+
                '               <label><b>Outdoor</b></label>'+
                '               <input type="text" class="table-input advtVal" value="'+el.outdoor+'" name="outdoor" '+isClosedText+'>'+
                '           </p>'+
                '           <p class="form-row">'+
                '               <label><b>Magazine/Newpaper</b></label>'+
                '               <input type="text" class="table-input advtVal" value="'+el.magazine+'" name="magazine" '+isClosedText+'>'+
                '           </p>'+
                '           <p class="form-row">'+
                '               <label><b>Other</b></label>'+
                '               <input type="text" class="table-input advtVal" value="'+el.aother+'" name="aother" '+isClosedText+'>'+
                '           </p>'+
                '           <p class="form-row">'+
                '               <label></label>'+
                '           </p>'+
                '           <p class="form-row">'+
                '               <label></label>'+
                '           </p>'+
                '           <p class="form-row">'+
                '               <label><b>TOTAL ADVERTISING SPEND:</b></label>'+
                '               <span id="advTotal">$'+parseFloat(el.advTotal).toFixed(2)+'</span>'+
                '           </p>'+
                '        </aside>'+
                '        <aside class="form-aside">'+
                '           <h1>LOCAL MARKETING</h1>'+
                '           <p class="form-row">'+
                '               <label><b>Direct Mail</b></label>'+
                '               <input type="text" class="table-input localVal" value="'+el.mail+'" name="mail" '+isClosedText+'>'+
                '           </p>'+
                '           <p class="form-row">'+
                '               <label><b>Sylvan Promotional Items</b></label>'+
                '               <input type="text" class="table-input localVal" value="'+el.promotional+'" name="promotional" '+isClosedText+'>'+
                '           </p>'+
                '           <p class="form-row">'+
                '               <label><b>Brochures and Flyers</b></label>'+
                '               <input type="text" class="table-input localVal" value="'+el.brochure+'" name="brochure" '+isClosedText+'>'+
                '           </p>'+
                '           <p class="form-row">'+
                '               <label><b>Demos and Events</b></label>'+
                '               <input type="text" class="table-input localVal" value="'+el.demos+'" name="demos" '+isClosedText+'>'+
                '           </p>'+
                '           <p class="form-row">'+
                '               <label><b>Teams or Club Sponsorships</b></label>'+
                '               <input type="text" class="table-input localVal" value="'+el.teams+'" name="teams" '+isClosedText+'>'+
                '           </p>'+
                '           <p class="form-row">'+
                '               <label><b>Payroll</b></label>'+
                '               <input type="text" class="table-input localVal" value="'+el.payroll+'" name="payroll" '+isClosedText+'>'+
                '           </p>'+
                '           <p class="form-row">'+
                '               <label><b>Other</b></label>'+
                '               <input type="text" class="table-input localVal" value="'+el.lother+'" name="lother" '+isClosedText+'>'+
                '           </p>'+
                '           <p class="form-row">'+
                '               <label><b>TOTAL LOCAL MARKETING SPEND:</b></label>'+
                '               <span id="localTotal">$'+ parseFloat(el.localTotal).toFixed(2) +'</span>'+
                '           </p>'+
                '        </aside>'+
                '</section></div>' +
                '<article class="no-brdr btn-article">' +
                '            <span class="first-colm">Comment</span>' +
                '            <span><input type="text" value="'+el.Comments+'" class="form-control" id="comment"  '+isClosedText+'></span>' +
                '            <span>&nbsp;</span>' +
                '            <span><button class="lmr-submit">Submit LMR</button></span>' +
                '</article>';
                return skeleton;
    }


    this.attachAllEvent = function () {
        var self = this;
        wjQuery("#monthSelected,#yearSelected").off().on("change", function () {
            wjQuery(".lmr-submit").attr("title", "The Month/Year has been changed Please click on view LMR to view and submit.");
            wjQuery(".lmr-submit").attr("data-original-title", "The Month/Year has been changed Please click on view LMR to view and submit.");
            wjQuery(".lmr-submit").tooltip({
                tooltipClass: "custom-conflict",
                track: false,
            });
            wjQuery(".lmr-submit").addClass("disabledBtn");
         });

         wjQuery("#yearSelected").on("change", function () {
             self.selectedYear = wjQuery(this).val();
             if (self.selectedYear == new Date().getFullYear()) {
                 Xrm.Utility.showProgressIndicator("Processing Please wait...");
                 var currentMonth = new Date().getMonth();
                 var pastMonths = self.months.splice(0, currentMonth + 1);
                 self.populateMonths(pastMonths);
                 Xrm.Utility.closeProgressIndicator();
             } else {
                 self.populateMonths();
             }
         })
        wjQuery(".getLmr").off();
        wjQuery(".getLmr").click(function (event) {
            Xrm.Utility.showProgressIndicator("Processing Please wait...");
            self.selectedYear = wjQuery("#yearSelected").val();
            self.selectedMonth = wjQuery("#monthSelected").val();
            setTimeout(function () {
                wjQuery("#lmr-table").html("");
                var query = self.getQueryParm();
                onLoad(query.recordid, query.entityname, self.selectedMonth, self.selectedYear);
            }, 300);
        });

        wjQuery(".lmr-submit").off();
        wjQuery("body").off().on("click",".lmr-submit", function (event) {
            if (!wjQuery(".lmr-submit").hasClass("disabledBtn")) {
                Xrm.Utility.showProgressIndicator("Processing Please wait...");
                self.centerId = wjQuery("#center-id").text();
                self.selectedYear = wjQuery("#yearSelected").val();
                self.selectedMonth = wjQuery("#monthSelected").val();
                if (!self.lmrList[0].Reconciled) {
                    var dialogTemplate = "<ul class='reconcileDialog'> <li>Click <a href='" + self.lmrList[0].ReconLink + "' target='_blank'><img src='/webresources/hub_/images/reconcile.png'></a> to Reconcile All</li>" +
                        "<li>Click on Yes to ignore and save </li><li>Click on Cancel to close the dialog</li></ul>"
                    self.confirmPopup(dialogTemplate, "Not all bills for the selected month is reconciled");
                } else {
                    self.confirmPopup("Are you sure to submit?");
                }
            }
        });

        wjQuery(".lmr-submit").off().tooltip({
            tooltipClass: "custom-conflict",
            track: false,
        });

        wjQuery("#print").off();
        wjQuery("#print").click(function (event) {
            self.printElem("#lmr");           
        });


        wjQuery(".table-input").keydown(function (e) {
            // validation
            var alllowKeys = [8, 13, 9, 110,190, 37, 39, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 109, 189];
            var index = alllowKeys.indexOf(e.keyCode);
            var allow = false;
            // console.log(e.keyCode);
            if (e.shiftKey) {
                allow = false;
                e.preventDefault();
            }
            if ((e.keyCode === 190 || e.keyCode === 110) && (this.value.split('.').length === 2 || this.value.length == 0)) {
                allow = false;
                e.preventDefault();
            }

            var indexOfMinus = this.value.indexOf("-");
            

            if ((e.keyCode === 189 || e.keyCode === 109) && (this.value.length >= 1) || (this.id == "returnPayVal" && (e.keyCode === 189 || e.keyCode === 109))) {
                allow = false;
                e.preventDefault();
            }
            if(e.keyCode >= 96 && e.keyCode <= 105){
                allow = true;
            }else{
                if(index == -1){
                    allow = false;
                    e.preventDefault();
                }
            }
        });

        wjQuery(".table-input").keyup(function (e) {
            if (this.value && this.value.split(".") && this.value.split(".")[1]) {
                //Splitted the value instead of parseFloat as parseFloat will round off the entered Values
                var decimalVal = this.value.split(".")[1].slice(0, 2); 
                var convertedVal = this.value.split(".")[0] + "." + decimalVal;
                if (decimalVal.length == 2) {
                    wjQuery(e.target).val(parseFloat(convertedVal).toFixed(2));
                }
            } else if (this.value && !this.value.includes(".") && this.value != "-") {
                wjQuery(e.target).val(parseInt(this.value));
            }
        });

        wjQuery("#creditval").on("input", function(e) {
            var val = wjQuery(this).val();
            if(val == ""){
                val = 0;
            }
            if(wjQuery("#miscval").val() == ""){
                wjQuery("#miscval").val(0);
            }
            var creditVal = parseFloat(val);
            var creditPercent = parseFloat(wjQuery("#creditPercent").text())/100;
            var creditTotal = ((creditVal*creditPercent)).toFixed(2);
            wjQuery("#creditTotal").text("($"+creditTotal+")");
            creditTotal = parseFloat(wjQuery("#creditTotal").text().replace("($",""));
            var coreVal = parseFloat(wjQuery("#coreval").text().replace("$", ""));
            var returnFess = parseFloat(wjQuery("#returnPayVal").val());
            if(returnFess && returnFess <= coreVal){
                coreVal = coreVal - returnFess;
            }
            var coreTotal = parseFloat(wjQuery("#coreTotal").text().replace("$",""));
            var edgeVal = parseFloat(wjQuery("#edgeval").text().replace("$",""));
            var edgeTotal = parseFloat(wjQuery("#edgeTotal").text().replace("$",""));
            var miscVal = parseFloat(wjQuery("#miscval").val());
            miscVal = isNaN(miscVal) ? 0 : miscVal; 
            var miscTotal = parseFloat(wjQuery("#miscTotal").text().replace("$",""));
            miscTotal = isNaN(miscTotal) ? 0 : miscTotal; 
            var rTotal = parseFloat((coreTotal+miscTotal+edgeTotal) - creditTotal).toFixed(2);
            var r1Total = parseFloat(coreVal+edgeVal+miscVal).toFixed(2);

            //var rTotal = parseFloat((coreTotal+edgeTotal+miscVal) - (creditTotal)).toFixed(2);
            //var r1Total = parseFloat(coreVal+edgeVal- miscVal).toFixed(2);
            var wrate = parseFloat(wjQuery("#wrate").attr("raw-value"));
            var erate = parseFloat(wjQuery("#erate").attr("raw-value"));
            var nafAmount;
            var nacAmount
            if (!self.lmrList[0].IsClosed) {
                nafAmount = parseFloat(((parseFloat(self.lmrList[0].NAFAmount) + miscVal) - creditVal).toFixed(2));
                nacAmount = parseFloat(((parseFloat(self.lmrList[0].NACAmount) + miscVal) - creditVal).toFixed(2));
            } else {
                nafAmount = parseFloat(self.lmrList[0].NAFAmount).toFixed(2);
                nacAmount = parseFloat(self.lmrList[0].NACAmount).toFixed(2);
            }
            var nafPayment = parseFloat((parseFloat(self.lmrList[0].NAFRate)*nafAmount).toFixed(2));
            var nacPayment = parseFloat((parseFloat(self.lmrList[0].NACRate)*nacAmount).toFixed(2));
            var totalAdvertisingPayment = parseFloat(nafPayment + nacPayment).toFixed(2);
            
            if(nafAmount >=0){
                wjQuery("#nafAmount").text("$"+nafAmount);
            }else{
                wjQuery("#nafAmount").text("($"+Math.abs(nafAmount)+")");
            }    

            if(nacAmount >=0){
                wjQuery("#nacAmount").text("$"+nacAmount);
            }else{
                wjQuery("#nacAmount").text("($"+Math.abs(nacAmount)+")");
            }    

            if(nacPayment >=0){
                wjQuery("#nacPayment").text("$"+nacPayment);
            }else{
                wjQuery("#nacPayment").text("($"+Math.abs(nacPayment)+")");
            } 

            if(nafPayment >=0){
                wjQuery("#nafPayment").text("$"+nafPayment);
            }else{
                wjQuery("#nafPayment").text("($"+Math.abs(nafPayment)+")");
            } 

            if(totalAdvertisingPayment >=0){
                wjQuery(".totalAdvertisingPayment").text("$"+parseFloat(totalAdvertisingPayment).toFixed(2));
            }else{
                totalAdvertisingPayment = Math.abs(parseFloat(totalAdvertisingPayment).toFixed(2));
                wjQuery(".totalAdvertisingPayment").text("($"+Math.abs(parseFloat(totalAdvertisingPayment).toFixed(2))+")");
            }
            if (rTotal >= 0) {
                wjQuery(".rTotal").text("$" + rTotal);
            } else {
                wjQuery(".rTotal").text("($" + Math.abs(rTotal) + ")");
            }
            if (wjQuery('.royaltyDueLocal').length) {
                var foreignWithHolding = parseFloat(rTotal).toFixed(2) * wrate;
                wjQuery("#foreignWitholdings").text("$" + parseFloat(foreignWithHolding).toFixed(2));
                var localRoyaltyDue = parseFloat(rTotal).toFixed(2) - foreignWithHolding.toFixed(2);
                wjQuery(".royaltyDueLocal").text("$" + parseFloat(localRoyaltyDue).toFixed(2));
                var foreignExchange = parseFloat(localRoyaltyDue).toFixed(2) * erate;
                wjQuery(".foreignExchange").text("$" + parseFloat(foreignExchange).toFixed(2));
                var adPaymentLocal = parseFloat(totalAdvertisingPayment).toFixed(2) * erate;
                wjQuery(".totalAdvertisingPaymentLocal").text("$" + parseFloat(foreignExchange).toFixed(2));
            }
            if(r1Total >= 0){
                wjQuery("#r1Total").text("$"+r1Total);
            }else{
                wjQuery("#r1Total").text("($"+Math.abs(r1Total)+")");
            }
        });

        wjQuery("#miscval").on("input", function(e) {
            var val = wjQuery(this).val();
            if(val == ""){
                val = 0;
            }
            if(wjQuery("#creditval").val() == ""){
                wjQuery("#creditval").val(0);
            }
            var miscVal = parseFloat(val);
            if(miscVal>=0){
                wjQuery("#miscTotal").text("$"+miscVal.toFixed(2));
            }else{
                wjQuery("#miscTotal").text("($"+Math.abs(miscVal.toFixed(2))+")");
            }

            miscVal = isNaN(miscVal) ? 0 : miscVal; 
            var coreVal = parseFloat(wjQuery("#coreval").text().replace("$", ""));
            var returnFess = parseFloat(wjQuery("#returnPayVal").val());
            if (returnFess && returnFess <= coreVal) {
                coreVal = coreVal - returnFess;
            }
            var coreTotal = parseFloat(wjQuery("#coreTotal").text().replace("$",""));
            var edgeVal = parseFloat(wjQuery("#edgeval").text().replace("$",""));
            var edgeTotal = parseFloat(wjQuery("#edgeTotal").text().replace("$",""));
            var creditVal1 = parseFloat(wjQuery("#creditval").val());
            var creditTotal = parseFloat(wjQuery("#creditTotal").text().replace("($",""));

            var rTotal = parseFloat((coreTotal+edgeTotal+miscVal) - (creditTotal)).toFixed(2);
            var r1Total = parseFloat(coreVal+edgeVal+miscVal).toFixed(2);
            var wrate = parseFloat(wjQuery("#wrate").attr("raw-value"));
            var erate = parseFloat(wjQuery("#erate").attr("raw-value"));
            var nafAmount = parseFloat(((parseFloat(self.lmrList[0].NAFAmount) + miscVal) - creditVal1).toFixed(2));
            var nacAmount = parseFloat(((parseFloat(self.lmrList[0].NACAmount) + miscVal) - creditVal1).toFixed(2));
            var nafPayment = parseFloat((parseFloat(self.lmrList[0].NAFRate)*nafAmount).toFixed(2));
            var nacPayment = parseFloat((parseFloat(self.lmrList[0].NACRate)*nacAmount).toFixed(2));
            var totalAdvertisingPayment = parseFloat(nafPayment + nacPayment).toFixed(2);
            

            if(nafAmount >=0){
                wjQuery("#nafAmount").text("$"+nafAmount);
            }else{
                wjQuery("#nafAmount").text("($"+Math.abs(nafAmount)+")");
            }    

            if(nacAmount >=0){
                wjQuery("#nacAmount").text("$"+nacAmount);
            }else{
                wjQuery("#nacAmount").text("($"+Math.abs(nacAmount)+")");
            }    

            if(nacPayment >=0){
                wjQuery("#nacPayment").text("$"+nacPayment);
            }else{
                wjQuery("#nacPayment").text("($"+Math.abs(nacPayment)+")");
            } 

            if(nafPayment >=0){
                wjQuery("#nafPayment").text("$"+nafPayment);
            }else{
                wjQuery("#nafPayment").text("($"+Math.abs(nafPayment)+")");
            } 

            if(totalAdvertisingPayment >=0){
                wjQuery(".totalAdvertisingPayment").text("$"+parseFloat(totalAdvertisingPayment).toFixed(2));
            } else {
                totalAdvertisingPayment = Math.abs(parseFloat(totalAdvertisingPayment).toFixed(2));
                wjQuery(".totalAdvertisingPayment").text("($"+Math.abs(parseFloat(totalAdvertisingPayment).toFixed(2))+")");
            }
            if (rTotal >= 0) {
                wjQuery(".rTotal").text("$" + rTotal);
            } else {
                rTotal = rTotal.toString().replace("-", "");
                wjQuery(".rTotal").text("($" + rTotal + ")");
            }
            if (wjQuery('.royaltyDueLocal').length) {
                var foreignWithHolding = parseFloat(rTotal).toFixed(2) * wrate;
                wjQuery("#foreignWitholdings").text("$" + parseFloat(foreignWithHolding).toFixed(2));
                var localRoyaltyDue = parseFloat(rTotal).toFixed(2) - foreignWithHolding.toFixed(2);
                wjQuery(".royaltyDueLocal").text("$" + parseFloat(localRoyaltyDue).toFixed(2));
                var foreignExchange = parseFloat(localRoyaltyDue).toFixed(2) * erate;
                wjQuery(".foreignExchange").text("$" + parseFloat(foreignExchange).toFixed(2));
                var adPaymentLocal = parseFloat(totalAdvertisingPayment).toFixed(2) * erate;
                wjQuery(".totalAdvertisingPaymentLocal").text("$" + parseFloat(foreignExchange).toFixed(2));
            } 
            if(r1Total >= 0){
                wjQuery("#r1Total").text("$"+r1Total);
            }else{
                wjQuery("#r1Total").text("($"+Math.abs(r1Total)+")");
            }
        });

        wjQuery(".localVal").on("input", function(e) {
            var val = wjQuery(this).val();
            var ltotal = 0;
            if(val){
                wjQuery(".localVal").each(function(index, element){
                    var elVal = wjQuery(element).val();
                    if(elVal.length == 0){
                        wjQuery(element).val(0);
                        elVal = 0;
                    }
                    // console.log(elVal);
                    ltotal += parseFloat(elVal);
                });
                wjQuery("#localTotal").text("$"+parseFloat(ltotal).toFixed(2));
            }
        });

        wjQuery("#returnPayVal").on("input", function (e) {
            var val = wjQuery(this).val();
            var coreTotal = wjQuery('#coreTotal');
            var coreVal = parseFloat(wjQuery("#coreval").text().replace("$", ""));
            var royaltyPercent = self.lmrList[0].CorePecent;
            var coreRevenuetotal = parseFloat(coreVal * royaltyPercent).toFixed(2);
            wjQuery(".returnPaymentContainer").tooltip({
                tooltipClass: "custom-conflict",
                track: false,
            });
            if (val) {
                if (parseFloat(val) <= parseFloat(self.lmrList[0].CoreAmount)) {
                    coreVal = coreVal - val;
                    coreRevenuetotal = parseFloat(coreVal * royaltyPercent).toFixed(2);
                    coreTotal.text("$" + parseFloat(coreRevenuetotal).toFixed(2));
                    wjQuery(".returnPaymentContainer").removeAttr("title");
                    wjQuery(".returnPaymentContainer").removeAttr("data-original-title");
                    wjQuery(".lmr-submit").removeClass("disabledBtn");
                    wjQuery(this).removeClass("errorField");
                } else {
                    coreTotal.text("$" + parseFloat(coreRevenuetotal).toFixed(2));
                    wjQuery(this).addClass("errorField");
                    wjQuery(".lmr-submit").addClass("disabledBtn");
                    wjQuery(".returnPaymentContainer").attr("title", "Return Payment cannot be greater than Core Revenue Amount");
                    wjQuery(".returnPaymentContainer").attr("data-original-title", "Return Payment cannot be greater than Core Revenue Amount");
                }
            } else {
                coreTotal.text("$" + parseFloat(coreRevenuetotal).toFixed(2));
            }
            wjQuery("#creditval").trigger("input");
        });

        wjQuery(".advtVal").on("input", function(e) {
            var val = wjQuery(this).val();
            var ltotal = 0;
            if(val){
                wjQuery(".advtVal").each(function(index, element){
                    var elVal = wjQuery(element).val();
                    if(elVal.length == 0){
                        wjQuery(element).val(0);
                        elVal = 0;
                    }
                    // console.log(elVal);
                    ltotal += parseFloat(elVal);
                });
                wjQuery("#advTotal").text("$"+parseFloat(ltotal).toFixed(2));
            }
        });

        wjQuery("article.dark").off("click").on("click", function (el) {
            var sectionId = wjQuery(el.target).parent().attr("id");
            if (wjQuery(el.target).hasClass("accord")) {
                sectionId = wjQuery(el.target).attr("id");
            }
            if (sectionId == "adNMarketing") {
                if (wjQuery("." + sectionId + " section").hasClass("displayNone")) {
                    wjQuery("." + sectionId + " section").removeClass("displayNone");
                    autoHeightAnimate(wjQuery("." + sectionId));
                    wjQuery("#" + sectionId + " .accord").stop().animate({ textIndent: 90 }, {
                        step: function (now, fx) {
                            wjQuery(this).css('-webkit-transform', 'rotate(' + now + 'deg)');
                        }, duration: "500"
                    }, "swing");
                } else {
                    wjQuery("." + sectionId).stop().animate({ "height": "0" }, "500", "swing", function () {
                        wjQuery("." + sectionId + " section").addClass("displayNone");
                    });
                    wjQuery("#" + sectionId + " .accord").stop().animate({ textIndent: 0 }, {
                        step: function (now, fx) {
                            wjQuery(this).css('-webkit-transform', 'rotate(' + now + 'deg)');
                        }, duration: "500"
                    }, "swing");
                }
            } else {
                if (wjQuery("." + sectionId + " article").hasClass("displayNone")) {
                    wjQuery("." + sectionId + " article").removeClass("displayNone");
                    wjQuery("#" + sectionId + " .accord").stop().animate({ textIndent: 90 }, {
                        step: function (now, fx) {
                            wjQuery(this).css('-webkit-transform', 'rotate(' + now + 'deg)');
                        }, duration: "500"
                    }, "swing");
                    autoHeightAnimate(wjQuery("." + sectionId));
                } else {
                    wjQuery("." + sectionId).stop().animate({ "height": "0" }, "500", "swing", function () {
                        wjQuery("." + sectionId + " article").addClass("displayNone");
                    });
                    wjQuery("#" + sectionId + " .accord").stop().animate({ textIndent: 0 }, {
                        step: function (now, fx) {
                            wjQuery(this).css('-webkit-transform', 'rotate(' + now + 'deg)');
                        }, duration: "500"
                    }, "swing");
                }
            }
            
        });

       var autoHeightAnimate = function(element) {
            var curHeight = element.height(), // Get Default Height
                autoHeight = element.css('height', 'auto').height(); // Get Auto Height
            element.height(curHeight); // Reset to Default Height
            element.stop().animate({ height: autoHeight }, "500","swing"); // Animate to Auto Height
       }

       wjQuery("#advertisingSection span:first").click();
       wjQuery("#adNMarketing .header").click()

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
        self.lmrList[0]['creditval'] = parseFloat(wjQuery("#creditval").val()).toFixed(2);
        self.lmrList[0]['miscval'] = parseFloat(wjQuery("#miscval").val()).toFixed(2);
        self.lmrList[0]['Comments'] = wjQuery("#comment").val();

        if(wjQuery("#creditTotal").text().indexOf("($") != -1){
            self.lmrList[0]['creditTotal'] = wjQuery("#creditTotal").text().replace("($","");
            self.lmrList[0]['creditTotal'] = "-"+self.lmrList[0]['creditTotal'].replace(")","");
        }else{
            self.lmrList[0]['creditTotal'] = wjQuery("#creditTotal").text().replace("$","");
        }

        if(wjQuery("#miscTotal").text().indexOf("($") != -1){
            self.lmrList[0]['miscTotal'] = wjQuery("#miscTotal").text().replace("($","");
            self.lmrList[0]['miscTotal'] = "-"+self.lmrList[0]['miscTotal'].replace(")","");
        }else{
            self.lmrList[0]['miscTotal'] = wjQuery("#miscTotal").text().replace("$","");
        }

        if(wjQuery("#r1Total").text().indexOf("($") != -1){
            self.lmrList[0]['TotalRoyaltyAmount'] = wjQuery("#r1Total").text().replace("($","");
            self.lmrList[0]['TotalRoyaltyAmount'] = "-"+self.lmrList[0]['TotalRoyaltyAmount'].replace(")","");
        }else{
            self.lmrList[0]['TotalRoyaltyAmount'] = wjQuery("#r1Total").text().replace("$","");
        }

        

        if(wjQuery("#localTotal").text().indexOf("($") != -1){
            self.lmrList[0]['localTotal'] = wjQuery("#localTotal").text().replace("($","");
            self.lmrList[0]['localTotal'] = "-"+self.lmrList[0]['localTotal'].replace(")","");
        }else{
            self.lmrList[0]['localTotal'] = wjQuery("#localTotal").text().replace("$","");
        }

        if(wjQuery("#advTotal").text().indexOf("($") != -1){
            self.lmrList[0]['advTotal'] = wjQuery("#advTotal").text().replace("($","");
            self.lmrList[0]['advTotal'] = "-"+self.lmrList[0]['advTotal'].replace(")","");
        }else{
            self.lmrList[0]['advTotal'] = wjQuery("#advTotal").text().replace("$","");
        }

        if(wjQuery("#nafAmount").text().indexOf("($") != -1){
            self.lmrList[0]['NAFAmount'] = wjQuery("#nafAmount").text().replace("($","");
            self.lmrList[0]['NAFAmount'] = "-"+self.lmrList[0]['NAFAmount'].replace(")","");
        }else{
            self.lmrList[0]['NAFAmount'] = wjQuery("#nafAmount").text().replace("$","");
        }

        if(wjQuery("#nacAmount").text().indexOf("($") != -1){
            self.lmrList[0]['NACAmount'] = wjQuery("#nacAmount").text().replace("($","");
            self.lmrList[0]['NACAmount'] = "-"+self.lmrList[0]['NACAmount'].replace(")","");
        }else{
            self.lmrList[0]['NACAmount'] = wjQuery("#nacAmount").text().replace("$","");
        }

        if(wjQuery("#nafPayment").text().indexOf("($") != -1){
            self.lmrList[0]['NAFPayment'] = wjQuery("#nafPayment").text().replace("($","");
            self.lmrList[0]['NAFPayment'] = "-"+self.lmrList[0]['NAFPayment'].replace(")","");
        }else{
            self.lmrList[0]['NAFPayment'] = wjQuery("#nafPayment").text().replace("$","");
        }

        if(wjQuery("#nacPayment").text().indexOf("($") != -1){
            self.lmrList[0]['NACPayment'] = wjQuery("#nacPayment").text().replace("($","");
            self.lmrList[0]['NACPayment'] = "-"+self.lmrList[0]['NACPayment'].replace(")","");
        }else{
            self.lmrList[0]['NACPayment'] = wjQuery("#nacPayment").text().replace("$","");
        }

        var royaltyTotalSelector = ".rTotal";
        var adTotalSelector = ".totalAdvertisingPayment";
        if (wjQuery(".totalAdvertisingPaymentLocal").length) {
            royaltyTotalSelector = ".foreignExchange:first";
            adTotalSelector = ".totalAdvertisingPaymentLocal:first";
        }

        if (wjQuery(royaltyTotalSelector).text().indexOf("($") != -1) {
            self.lmrList[0]['TotalDue'] = wjQuery(royaltyTotalSelector).text().replace("($", "");
            self.lmrList[0]['TotalDue'] = "-" + self.lmrList[0]['TotalDue'].replace(")", "");
        } else {
            self.lmrList[0]['TotalDue'] = wjQuery(royaltyTotalSelector).text().replace("$", "");
        }

        if (wjQuery(adTotalSelector).text().indexOf("($") != -1) {
            self.lmrList[0]['TotalAdvertisingPayment'] = wjQuery(adTotalSelector).text().replace("($", "");
            self.lmrList[0]['TotalAdvertisingPayment'] = "-"+self.lmrList[0]['TotalAdvertisingPayment'].replace(")","");
        }else{
            self.lmrList[0]['TotalAdvertisingPayment'] = wjQuery(adTotalSelector).text().replace("$", "");
        }
        if (wjQuery("#returnPayVal").val()) {
            self.lmrList[0]['CoreTotal'] = wjQuery("#coreTotal").text().replace("$", "");
            self.lmrList[0].returnPaymentFees = wjQuery("#returnPayVal").val();
        }
        var prevYear;
        var prevMonth;
        if (self.lmrList[0].onboardingDate) {
            var onBoardDate = new Date(self.lmrList[0].onboardingDate).setDate("1");
            var selectedDate = new Date((parseInt(self.selectedMonth)+1) + "/01/" + self.selectedYear);
            if (onBoardDate < selectedDate.getTime()) {
                prevMonth = self.selectedMonth - 1;
                if (prevMonth < 0) {
                    prevMonth = 11;
                    prevYear = parseInt(self.selectedYear - 1);
                } else {
                    prevYear = parseInt(self.selectedYear);
                }
            }
        }
        this.lmrList = self.lmrList;
        
        var response = OnSubmitLMR(result.recordid, self.selectedMonth, self.selectedYear, self.lmrList[0], prevMonth, prevYear);
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
        for (var i = 1; i <= 10; i++) {
            if (presentYear == pushYear) {
                yearSkeleton += '<option value="' + pushYear + '" selected>' + pushYear + '</option>';
            } else {
                yearSkeleton += '<option value="' + pushYear + '">' + pushYear + '</option>';
            }
            pushYear = presentYear - i;
        }
        yearSkeleton += "</selction>";
        wjQuery("#dropdown > .year").html(yearSkeleton);
        wjQuery("#dropdown").append('<button class="getLmr">View LMR</button><img id="print" src="/webresources/hub_/images/print.png">');
        this.selectedYear = wjQuery("#yearSelected").val();
    }

    this.populateMonths = function (months) {
        var self = this;
        if (!months) {
            months = self.months;
        }
        var monthSkeleton = '<select class="form-control" id="monthSelected">';
        wjQuery.each(months, function (key, val) {
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

    this.confirmPopup = function (message,title) {
        var self = this;
        wjQuery(".ui-dialog").fadeIn("slow");
        wjQuery(".ui-widget-overlay").fadeIn('slow');
        if (!title) {
            title = "";
            wjQuery("#dialog > .dialog-msg").text(message);
        } else {
            wjQuery("#dialog > .dialog-msg").empty();
            wjQuery("#dialog > .dialog-msg").append(message);
        }
        var dialogWidth = 350;
        if(title){
            dialogWidth = 400;
        }
        wjQuery("#dialog").dialog({
            dialogClass: "no-close",
            resizable: false,
            height: "auto",
            draggable: false,
            title: title,
            width: dialogWidth,
            modal: true,
            position: ['center',10],
            show: {
                effect: 'slide',
                complete: function () {
                    Xrm.Utility.closeProgressIndicator();
                }
            },
            close: function (event, ui) {
                wjQuery(this).dialog("close");
                window.close();
            },
            buttons: {
                Yes: function () {
                    Xrm.Utility.showProgressIndicator("Processing Please wait...");
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
                    Xrm.Utility.closeProgressIndicator();
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
        Xrm.Utility.closeProgressIndicator();
    }
}
