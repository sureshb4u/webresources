var lmrList = 
[
    {
        "CenterNumber":"00313",
        "CenterName":"00313 - Success Opeartion, Inc.",
        "CenterAddress":"11000 SE 264th street",
        "LicenseAgreement":0,
        "CoreAmount":"0.00",
        "EdgeAmount":"0.00",
        "creditval":0,
        "creditTotal":0,
        "CorePecent":16,
        "EdgePercent":0,
        "CoreTotal":"0.00",
        "EdgeTotal":"0.00",
        "TotalDue":"0.00",
        "TotalRoyaltyAmount":"0.00",
        "NACRate":0,
        "NAFRate":0,
        "NACPayment":"0.00",
        "NAFPayment":"0.00",
        "NACAmount":"0.00",
        "NAFAmount":"0.00",
        "TotalAdvertisingPayment":"0.00",
        "tv":0,
        "radio":0,
        "outdoor":0,
        "magazine":0,
        "aother":0,
        "atotal":0,
        "mail":0,
        "Promotional":0,
        "brochure":0,
        "demos":0,
        "teams":0,
        "payroll":0,
        "lother":0,
        "localTotal":0,
        "Comments":"",
        "IsClosed":false,
        "advTotal":0,
        "miscval":0,
        "miscTotal":0,
        "promotional":0
    }
];

function onLoad(recordid, entityname, selectedMonth, selectedYear) {
  var LmrUi = new LmrUI();
  LmrUi.generateTemplate(lmrList);
}

function OnSubmitLMR(centerId, selectedMonth, selectedYear){
    return true;
}