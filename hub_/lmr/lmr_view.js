var lmrList = [
	 {
    "CenterNumber": "00310",
    "CenterName": "JCP Ascension, LLC",
    "CenterAddress": "24020 132nd Avenue SE",
    "LicenseAgreement": "21",
    "CoreAmount": 400,
    "EdgeAmount": 0,
    "CorePecent": 0.16,
    "EdgePercent": 0.12,
    "CoreTotal": 0.64,
    "EdgeTotal": 0,
    "TotalDue": 0.64,
    "TotalRoyaltyAmount": 400,
    "NACRate": 0,
    "NAFRate": 0,
    "NACPayment": 100000,
    "NAFPayment": 0,
    "NAFAmount":10,
    "NACAmount":10,
    "TotalAdvertisingPayment": 0
  }

];

function onLoad(recordid, entityname, selectedMonth, selectedYear) {
  var LmrUi = new LmrUI();
  LmrUi.generateTemplate(lmrList);
}

function OnSubmitLMR(centerId, selectedMonth, selectedYear){
	setTimeOut(function(){
		return true;
	}, 500);
}