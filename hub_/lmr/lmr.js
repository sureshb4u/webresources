var wjQuery = jQuery.noConflict();

setTimeout(function(){
	var lmr= new LmrUI();
	lmr.populateYears();
	lmr.populateMonths();
}, 300);

function LmrUI() {
    this.months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    this.todayDate = new Date();


	this.populateYears = function(){
    	var self = this;
        var presentYear = (new Date()).getFullYear();
    	var yearSkeleton = '<select class="form-control" id="yearSelected">';
    	for (var i = 0; i < 9; i++) {
    		var pushYear = presentYear+i;
            if (presentYear == pushYear) {
                yearSkeleton += '<option value="' + pushYear+ '" selected>' + pushYear + '</option>';
            } else {
                yearSkeleton += '<option value="' + pushYear + '">' + pushYear + '</option>';
            }
    	}
        yearSkeleton += "</selction>";
        wjQuery("#dropdown > .year").html(yearSkeleton);
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
}