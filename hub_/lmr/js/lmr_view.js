var lmrList = 
[
    {
        "CenterNumber":"00313",
        "CenterName":"00313 - Success Opeartion, Inc.",
        "CenterAddress":"11000 SE 264th street",
        "LicenseAgreement":0,
        "CoreAmount":"500",
        "EdgeAmount":"250",
        "creditval":0,
        "creditTotal":0,
        "CorePecent":0.16,
        "EdgePercent":0.16,
        "CoreTotal":"80",
        "EdgeTotal":"40",
        "TotalDue":"120",
        "TotalRoyaltyAmount":"750",
        "NACRate":5,
        "NAFRate":6,
        "NACPayment":"1225",
        "NAFPayment":"1470",
        "NACAmount":"245",
        "NAFAmount":"245",
        "TotalAdvertisingPayment":"2695",
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
        "ManualAdjustment":true,
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