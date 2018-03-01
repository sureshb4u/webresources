var lmrList = 
[
    {
        "CenterNumber":"00313",
        "CenterName":"00313 - Success Opeartion, Inc.",
        "CenterAddress":"11000 SE 264th street",
        "LicenseAgreement":0,
        "CoreAmount":"500.55055",
        "EdgeAmount":"250.235698",
        "creditval":0,
        "creditTotal":0,
        "CreditPercent":0.1,
        "CorePecent":0.16,
        "EdgePercent":0.16,
        "CoreTotal":"80.58975",
        "EdgeTotal":"40.8958",
        "TotalDue":"120.59865",
        "TotalRoyaltyAmount":"750.6989",
        "NACRate":5,
        "NAFRate":6,
        "NACPayment":"1225.58258",
        "NAFPayment":"1470.5689",
        "NACAmount":"245.5689",
        "NAFAmount":"245.5689",
        "TotalAdvertisingPayment":"2695.5689",
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