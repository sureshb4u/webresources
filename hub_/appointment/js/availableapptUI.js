var data = new Data();
var DEFAULT_START_TIME = "8:00 AM";
var DEFAULT_END_TIME = "9:00 AM";
var currentCalendarDate = moment(new Date()).format("YYYY-MM-DD");

setTimeout(function () {
    var appointment = new Appointment();
    wjQuery('.headerDate').text(moment(currentCalendarDate).format('MM/DD/YYYY'));
    setTimeout(function () {
        function fetchResources(fetchData) {
            wjQuery(".loading").show();
            // Get duraion from user
            var weekInfo = appointment.getCurrentWeekInfo(currentCalendarDate);
            var startDate = moment(weekInfo.firstDay).format('YYYY-MM-DD');
            var endDate = moment(weekInfo.lastDay).format('YYYY-MM-DD');
            var eventDuration = appointment.getCalendarEventDuraion(data.getAppointmentHours(startDate, endDate, false));
            appointment.loadCalendar(currentCalendarDate, eventDuration);

            wjQuery('.nextBtn').off('click').on('click', function () {
                wjQuery(".loading").show();
                appointment.next();
            });

            wjQuery('.prevBtn').off('click').on('click', function () {
                wjQuery(".loading").show();
                appointment.prev();
            });

            wjQuery('#datepicker').datepicker({
                buttonImage: "/webresources/hub_/calendar/images/calendar.png",
                buttonImageOnly: true,
                changeMonth: true,
                changeYear: true,
                showOn: 'button',
                // minDate: '0', 
                onSelect: function (date) {
                    wjQuery(".loading").show();
                    appointment.dateFromCalendar(date);
                    wjQuery('#datepicker').hide();
                }
            });
            appointment.refreshCalendarEvent(true);
        }
        fetchResources(true);
    }, 500);
}, 500);


function Appointment() {
    this.appointment = undefined;
    this.appointmentList = [];
    this.eventList = [];
    this.appointmentHours = [];
    this.businessClosure = [];
    this.appointmentHourException = [];
    this.leaveDays = [];

    this.clearEvents = function () {
        this.eventList = [];
        this.appointmentList = [];
        this.appointmentHours = [];
        this.businessClosure = [];
        this.appointmentHourException = [];
        this.leaveDays = [];
        this.appointment.fullCalendar('removeEvents');
        this.appointment.fullCalendar('removeEventSource');
        this.appointment.fullCalendar('refetchEvents');
    }

    this.getCalendarEventDuraion = function (args) {
        var self = this;
        args = args == null ? [] : args;
        // Deafault assign it to 60 Min.
        var eventDuration = 60;
        if (args.length) {
            for (var i = 0; i < args.length; i++) {
                eventDuration = args[i]['aworkhours_x002e_hub_duration'];
                // var eventColorObj = self.getEventColor(args[i]['aworkhours_x002e_hub_type']);
                // eventDuration = eventColorObj['slotMinutes'] == undefined ? 60 : eventColorObj['slotMinutes'];
                break;
            }
        }
        return eventDuration;
    }

    this.converDateToObject = function (appointmentObj) {
        var stDateArry = appointmentHour['hub_effectivestartdate'].split("-");
        var stTimeArry = self.convertMinsNumToTime(self.convertToMinutes(appointmentHour['hub_starttime@OData.Community.Display.V1.FormattedValue'])).split(":");
        var endDateArry = [];
        if (appointmentHour['hub_effectiveenddate'] != undefined) {
            endDateArry = appointmentHour['hub_effectiveenddate'].split("-");
        }
        var endTimeArry = self.convertMinsNumToTime(self.convertToMinutes(appointmentHour['hub_endtime@OData.Community.Display.V1.FormattedValue'])).split(":");
        var startObj = new Date(stDateArry[0], stDateArry[1], stDateArry[2], stTimeArry[0], stTimeArry[1]);
        var endObj = new Date(endDateArry[0], endDateArry[1], endDateArry[2], endTimeArry[0], endTimeArry[1]);
        return { startObj: startObj, endObj: endObj };
    }

    this.formatObjects = function (args, label) {
        args = args == null ? [] : args;
        var self = this;
        var tempList = [];
        if (label == "appointmentList") {
            tempList = [];
            wjQuery.each(args, function (index, appointmentObj) {
                var stDateArry = appointmentObj['hub_start_date'].split("-");
                var stTimeArry = self.convertMinsNumToTime(self.convertToMinutes(appointmentObj['hub_starttime@OData.Community.Display.V1.FormattedValue'])).split(":");
                var endDateArry = appointmentObj['hub_end_date'].split("-");
                var endTimeArry = self.convertMinsNumToTime(self.convertToMinutes(appointmentObj['hub_endtime@OData.Community.Display.V1.FormattedValue'])).split(":");
                var startObj = new Date(stDateArry[0], stDateArry[1] - 1, stDateArry[2], stTimeArry[0], stTimeArry[1]);
                var endObj = new Date(endDateArry[0], endDateArry[1] - 1, endDateArry[2], endTimeArry[0], endTimeArry[1]);
                tempList.push({
                    type: appointmentObj['hub_type'],
                    typeValue: appointmentObj['hub_type@OData.Community.Display.V1.FormattedValue'],
                    startDate: appointmentObj['hub_start_date'],
                    startTime: appointmentObj['hub_starttime@OData.Community.Display.V1.FormattedValue'],
                    endDate: appointmentObj['hub_end_date'],
                    endTime: appointmentObj['hub_endtime@OData.Community.Display.V1.FormattedValue'],
                    startObj: startObj,
                    endObj: endObj,
                });
            });
        } else if (label == "appointmentHours") {
            tempList = [];
            wjQuery.each(args, function (index, appointmentHour) {
                var stDateArry = appointmentHour['hub_effectivestartdate'].split("-");
                var stTimeArry = self.convertMinsNumToTime(self.convertToMinutes(appointmentHour['hub_starttime@OData.Community.Display.V1.FormattedValue'])).split(":");
                var endDateArry = [];
                if (appointmentHour['hub_effectiveenddate'] != undefined) {
                    endDateArry = appointmentHour['hub_effectiveenddate'].split("-");
                }

                var endTimeArry = self.convertMinsNumToTime(self.convertToMinutes(appointmentHour['hub_endtime@OData.Community.Display.V1.FormattedValue'])).split(":");
                var startObj = new Date(stDateArry[0], stDateArry[1] - 1, stDateArry[2], stTimeArry[0], stTimeArry[1]);
                var endObj = new Date(endDateArry[0], endDateArry[1] - 1, endDateArry[2], endTimeArry[0], endTimeArry[1]);

                tempList.push({
                    type: appointmentHour['aworkhours_x002e_hub_type'],
                    typeValue: appointmentHour['aworkhours_x002e_hub_type@OData.Community.Display.V1.FormattedValue'],
                    startObj: startObj,
                    startDate: appointmentHour['hub_effectivestartdate'],
                    startTime: appointmentHour['hub_starttime@OData.Community.Display.V1.FormattedValue'],
                    endDate: appointmentHour['hub_effectiveenddate'],
                    endTime: appointmentHour['hub_endtime@OData.Community.Display.V1.FormattedValue'],
                    endObj: endObj,
                    capacity: appointmentHour['hub_capacity'],
                    day: appointmentHour['hub_days'],
                    dayVal: appointmentHour['hub_days@OData.Community.Display.V1.FormattedValue'],
                    duration: appointmentHour['aworkhours_x002e_hub_duration']
                });
            });
            this.appointmentHours = tempList;
        } else if (label == "businessClosure") {
            tempList = [];
            wjQuery.each(args, function (index, businessObj) {
                tempList.push({
                    id: businessObj['hub_businessclosureid'],
                    reason: businessObj['hub_reason'],
                    startDate: businessObj['hub_startdatetime@OData.Community.Display.V1.FormattedValue'],
                    endDate: businessObj['hub_enddatetime@OData.Community.Display.V1.FormattedValue'],
                    duration: businessObj['hub_duration'],
                    centerId: businessObj['_hub_center_value'],
                    centerValue: businessObj['_hub_center_value@OData.Community.Display.V1.FormattedValue']
                });
            });
        } else if(label == "appointmentException"){
            tempList = [];
            wjQuery.each(args, function(index, appException) {
                appException['hub_date'] = appException['hub_date@OData.Community.Display.V1.FormattedValue'];
                var startObj = new Date(appException['hub_date']+" "+self.convertMinsNumToTime(appException['hub_start_time']));
                var endObj = new Date(appException['hub_date']+" "+self.convertMinsNumToTime(appException['hub_end_time']));
                var eventId = appException['aa_x002e_hub_type']+"_"+startObj;
                var obj = {
                    eventId:eventId,
                    appointmentHourId:appException['hub_timingsid'],
                    id: appException['hub_appointment_slot_exceptionid'],
                    type: appException['aa_x002e_hub_type'],
                    typeName: appException['aa_x002e_hub_type@OData.Community.Display.V1.FormattedValue'],
                    startObj: startObj,
                    endObj: endObj
                } 
                tempList.push(obj);
            });
            this.appointmentHourException = tempList;
        }
        return tempList;
    }

    this.loadCalendar = function (args, eventDuration) {
        var self = this;
        // assign filter object to local scope filter to avoid this conflict
        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();

        this.calendarOptions = {
            header: false,
            defaultView: 'agendaWeek',
            disableResizing: true,
            minTime: 8,
            maxTime: 20,
            allDayText: '',
            allDaySlot: true,
            droppable: false,
            handleWindowResize: true,
            height: window.innerHeight - 42,
            slotMinutes: eventDuration,
            selectable: true,
            slotEventOverlap: true,
            selectHelper: false,
            // select: function (start, end, allDay, event, resourceId) {
            //     var calEvent = { start: start, end: end };
            //     if (!self.checkBusinessClosure(start)) {
            //         self.confirmPopup(calEvent, "Selected slot ", false);
            //     }
            // },
            eventClick: function (calEvent, jsEvent, view) {
                if(!calEvent['isHourException']){
                    self.confirmPopup(calEvent, "Selected slot ", true);
                }else{
                    self.prompt("Exceptional appointment is not selectable");
                }
            },
            eventRender: function (event, element, view) {
                if (view.name == 'agendaWeek' && event.allDay) {
                    wjQuery('.fc-col' + event.start.getDay()).not('.fc-widget-header').css('background-color', '#ddd');
                    wjQuery('.fc-event-skin').css('background-color', '#ddd');
                    wjQuery('.fc-event-skin').css('border-color', '#ddd');
                    wjQuery('.fc-event.fc-event-hori').css('overflow-y', 'visible');
                }
                else {
                    wjQuery('.fc-col' + event.start.getDay()).not('.fc-widget-header').css('background-color', '#fff');
                    wjQuery('.fc-event.fc-event-hori').css('overflow-y', 'visible');
                }
            },
            editable: false,
            events: self.eventList
        };

        if (args != undefined) {
            args = new Date(args);
            this.calendarOptions.year = args.getFullYear();
            this.calendarOptions.month = args.getMonth();
            this.calendarOptions.date = args.getDate();
        }
        self.appointment = wjQuery('#appointment').fullCalendar(this.calendarOptions);
    }

    this.clearBusinessClosure = function(){
        var self = this;
        this.clearEvents();
        // wjQuery('table.fc-agenda-slots td div').css('backgroundColor', '#ddd');
        wjQuery('.fc-col' + 0).not('.fc-widget-header').css('background-color', '#fff');
        wjQuery('.fc-col' + 1).not('.fc-widget-header').css('background-color', '#fff');
        wjQuery('.fc-col' + 2).not('.fc-widget-header').css('background-color', '#fff');
        wjQuery('.fc-col' + 3).not('.fc-widget-header').css('background-color', '#fff');
        wjQuery('.fc-col' + 4).not('.fc-widget-header').css('background-color', '#fff');
        wjQuery('.fc-col' + 5).not('.fc-widget-header').css('background-color', '#fff');
        wjQuery('.fc-col' + 6).not('.fc-widget-header').css('background-color', '#fff');
    }

    this.next = function () {
        var self = this;
        self.clearEvents();
        this.appointment.fullCalendar('next');
        var currentCalendarDate = this.appointment.fullCalendar('getDate');
        var currentView = this.appointment.fullCalendar('getView');
        wjQuery('.headerDate').text(moment(currentView.start).format('MM/DD/YYYY'));
        if (moment(currentCalendarDate).format('MM/DD/YYYY') == moment(new Date()).format('MM/DD/YYYY')) {
            wjQuery('.headerDate').addClass('today');
        } else {
            wjQuery('.headerDate').removeClass('today');
        }
        if (currentView.name == 'resourceDay') {
            var dayOfWeek = moment(currentCalendarDate).format('dddd');
            var dayofMonth = moment(currentCalendarDate).format('M/D');
            wjQuery('thead .fc-agenda-axis.fc-widget-header.fc-first').html(dayOfWeek + " <br/> " + dayofMonth);
        }
        currentCalendarDate = moment(currentCalendarDate).format("YYYY-MM-DD");
        self.refreshCalendarEvent(true);
    }

    this.prev = function () {
        var self = this;
        var currentCalendarDate = this.appointment.fullCalendar('getDate');
        var currentView = this.appointment.fullCalendar('getView');
        // if(currentCalendarDate > new Date()){
        self.clearEvents();
        this.appointment.fullCalendar('prev');
        wjQuery('.headerDate').text(moment(currentView.start).format('MM/DD/YYYY'));
        if (moment(currentCalendarDate).format('MM/DD/YYYY') == moment(new Date()).format('MM/DD/YYYY')) {
            wjQuery('.headerDate').addClass('today');
        } else {
            wjQuery('.headerDate').removeClass('today');
        }
        if (currentView.name == 'resourceDay') {
            var dayOfWeek = moment(currentCalendarDate).format('dddd');
            var dayofMonth = moment(currentCalendarDate).format('M/D');
            wjQuery('thead .fc-agenda-axis.fc-widget-header.fc-first').html(dayOfWeek + " <br/> " + dayofMonth);
        }
        currentCalendarDate = moment(currentCalendarDate).format("YYYY-MM-DD");
        this.refreshCalendarEvent(true);
        // }else{
        //     wjQuery(".loading").hide();
        // }
    }

    this.dateFromCalendar = function (date, locationId) {
        var self = this;
        self.clearEvents();
        var displayDate = new Date(date);
        self.appointment.fullCalendar('gotoDate', displayDate);
        wjQuery('.headerDate').text(date);
        if (moment(date).format('MM/DD/YYYY') == moment(new Date()).format('MM/DD/YYYY')) {
            wjQuery('.headerDate').addClass('today');
        }
        else {
            wjQuery('.headerDate').removeClass('today');
        }
        var dayOfWeek = moment(date).format('dddd');
        var dayofMonth = moment(date).format('M/D');
        wjQuery('thead .fc-agenda-axis.fc-widget-header.fc-first').html(dayOfWeek + " <br/> " + dayofMonth);
        var currentCalendarDate = moment(date).format("YYYY-MM-DD");
        self.refreshCalendarEvent(true);
    }

    this.refreshCalendarEvent = function (fetchData) {
        var self = this;
        self.clearBusinessClosure()
        setTimeout(function () {
            var currentCalendarDate = self.appointment.fullCalendar('getDate');
            var currentView = self.appointment.fullCalendar('getView');
            if (currentView.name == 'agendaWeek') {
                // var weekInfo = self.getCurrentWeekInfo(currentCalendarDate);
                // var startDate = moment(weekInfo.firstDay).format('YYYY-MM-DD');
                // var endDate = moment(weekInfo.lastDay).format('YYYY-MM-DD');
                var startDate = moment(currentView.start).format('YYYY-MM-DD');
                var endDate = moment(currentView.end).format('YYYY-MM-DD');
                self.businessClosure = self.formatObjects(data.getBusinessClosure(startDate, endDate), "businessClosure");
                if (self.businessClosure == null) {
                    self.businessClosure = [];
                }
                self.findLeaveDays();
                var appointmentException = self.formatObjects(data.getappointmentExceptions(startDate, endDate), "appointmentException");
                if (fetchData) {
                    self.appointmentHours = self.formatObjects(data.getAppointmentHours(startDate, endDate, false), "appointmentHours");
                    self.appointmentList = self.formatObjects(data.getAppointment(startDate, endDate, false), "appointmentList");
                }
                self.populateBusinessClosure();
                self.populateAppointmentHours(self.appointmentHours);
                self.populateAppointment(self.appointmentList);
            }
        }, 300);
    }

    this.getEventColor = function (eventType) {
        var eventTypeList = data.getAppointmentType();
        for (var i = 0 ; i < eventTypeList.length; i++) {
            if (eventType == eventTypeList[i]["type"]) {
                return eventTypeList[i];
                break;
            }
        }
    }

    this.populateAppointmentHours = function (appointmentHours) {
        var self = this;
        appointmentHours = appointmentHours == null ? [] : appointmentHours;
        if (appointmentHours.length) {
            wjQuery.each(appointmentHours, function (index, appointmentHrObj) {
                var response = self.checkDateRage(appointmentHrObj['startDate'], appointmentHrObj['endDate'], appointmentHrObj['day']);
                if (response != false) {
                    if (!self.checkBusinessClosure(response)) {
                        var timingArry = self.splitTimeBySlotMin(appointmentHrObj['startTime'], appointmentHrObj['endTime'], appointmentHrObj['duration']);
                        if (timingArry.length) {
                            for (var d = 0; d < timingArry.length; d++) {
                                var stDateArry = moment(response).format("YYYY-MM-DD").split("-");
                                var stTimeArry = self.convertMinsNumToTime(self.convertToMinutes(timingArry[d]['start'])).split(":");
                                appointmentHrObj['startObj'] = new Date(stDateArry[0], stDateArry[1] - 1, stDateArry[2], stTimeArry[0], stTimeArry[1]);
                                var endTimeArry = self.convertMinsNumToTime(self.convertToMinutes(timingArry[d]['end'])).split(":");
                                appointmentHrObj['endObj'] = new Date(stDateArry[0], stDateArry[1] - 1, stDateArry[2], endTimeArry[0], endTimeArry[1]);
                                var eventColorObj = self.getEventColor(appointmentHrObj["type"]);
                                var eventId = appointmentHrObj["type"] + "_" + appointmentHrObj['startObj'];
                                var eventPopulated = self.appointment.fullCalendar('clientEvents', eventId);
                                if (eventPopulated.length) {
                                    eventPopulated[0].capacity += appointmentHrObj['capacity'];
                                    eventPopulated[0].title = "0/" + eventPopulated[0].capacity;
                                    var isexception = self.appointmentHourException.filter(function(x) {
                                       return x.eventId == eventId;
                                    });
                                    if(isexception.length){
                                        eventPopulated[0].title = "";
                                    }
                                    self.appointment.fullCalendar('updateEvent', eventPopulated);
                                } else {
                                    var eventObj = {};
                                    eventObj = {
                                        id: eventId,
                                        start: appointmentHrObj['startObj'],
                                        end: appointmentHrObj['endObj'],
                                        allDay: false,
                                        type: appointmentHrObj['type'],
                                        typeValue: appointmentHrObj['typeValue'],
                                        color: "#333",
                                        title: "0/" + appointmentHrObj['capacity'],
                                        studentList: [],
                                        parentList: [],
                                        occupied: 0,
                                        capacity: appointmentHrObj['capacity']
                                    }
                                    var isexception = self.appointmentHourException.filter(function(x) {
                                       return x.eventId == eventId;
                                    });
                                    if(isexception.length == 0){
                                        // if(new Date().getTime() < appointmentHrObj['startObj'].getTime()){
                                        eventObj["backgroundColor"] = eventColorObj.backgroundColor;
                                        eventObj["borderColor"] = eventColorObj.borderColor;
                                        eventObj["isHourException"] = false;
                                        // }else{
                                        //     eventObj["backgroundColor"] = "#ddd";
                                        //     eventObj["borderColor"] = "#ddd";
                                        // }
                                    }else{
                                        eventObj['title'] = "";
                                        eventObj["isHourException"] = true;
                                        eventObj["backgroundColor"] = "#999";
                                        eventObj["borderColor"] = "#999";
                                    }
                                    self.eventList.push(eventObj);
                                    self.appointment.fullCalendar('removeEvents');
                                    self.appointment.fullCalendar('removeEventSource');
                                    self.appointment.fullCalendar('addEventSource', { events: self.eventList });
                                }
                                self.appointment.fullCalendar('refetchEvents');
                            }
                        }
                    }
                }
            });
            wjQuery(".loading").hide();
        } else {
            wjQuery(".loading").hide();
        }
    }

    this.populateAppointment = function (appointmentList) {
        var self = this;
        appointmentList = appointmentList == null ? [] : appointmentList;
        if (appointmentList.length) {
            wjQuery.each(appointmentList, function (index, appointmentObj) {
                var eventColorObj = self.getEventColor(appointmentObj["type"]);
                var eventId = appointmentObj["type"] + "_" + appointmentObj['startObj'];
                var eventPopulated = self.appointment.fullCalendar('clientEvents', eventId);
                if (eventPopulated.length) {
                    eventPopulated[0].occupied += 1;
                    eventPopulated[0].title = eventPopulated[0].occupied + "/" + eventPopulated[0].capacity;
                    var isexception = self.appointmentHourException.filter(function(x) {
                       return x.eventId == eventId;
                    });
                    if(isexception.length){
                        eventPopulated[0].title = "";
                    }
                    self.appointment.fullCalendar('updateEvent', eventPopulated);
                } else {
                    // var eventObj = {};
                    // eventObj = {
                    //     id:eventId,
                    //     start:appointmentObj['startObj'],
                    //     end:appointmentObj['endObj'],
                    //     allDay : false,
                    //     type:appointmentObj['type'],
                    //     typeValue:appointmentObj['typeValue'],
                    //     borderColor:eventColorObj.borderColor,
                    //     color:"#333",
                    //     backgroundColor:eventColorObj.backgroundColor,
                    //     studentList:[],
                    //     parentList:[],
                    //     occupied:1,
                    //     capacity:appointmentObj['capacity']
                    // }

                    // if(appointmentObj['capacity'] == undefined){
                    //     eventObj["title"] = "1/NA";
                    // }else{
                    //     eventObj["title"] = "1/"+appointmentObj['capacity'];
                    // }
                    // self.eventList.push(eventObj);
                    // self.appointment.fullCalendar('removeEvents');
                    // self.appointment.fullCalendar('removeEventSource');
                    // self.appointment.fullCalendar('addEventSource', { events: self.eventList });
                }
                self.appointment.fullCalendar('refetchEvents');
            });
        } else {
            wjQuery(".loading").hide();
        }
    }

    this.findLeaveDays = function(){
        var self = this;
        this.leaveDays = [];
        var currentView = self.appointment.fullCalendar('getView');
        for(var j = currentView.start.getTime();j<=currentView.end.getTime();j=j+(24*60*60*1000)){
            for (var i = 0; i < self.businessClosure.length; i++) {
                var businessStartDate = moment(self.businessClosure[i]['startDate']).format("MM-DD-YYYY");
                var businessEndDate = moment(self.businessClosure[i]['endDate']).format("MM-DD-YYYY");
                businessStartDate = new Date(businessStartDate + ' ' + '00:00').getTime();
                businessEndDate = new Date(businessEndDate + ' ' + '00:00').getTime();
                if (j >= businessStartDate && j <= businessEndDate) {
                    this.leaveDays.push(new Date(j));
                }
            }
        }
    };


    this.populateBusinessClosure = function(){
        var self = this;
        var currentView = self.appointment.fullCalendar('getView');
        currentView.end = moment(moment(currentView.start).add(6, 'd'))._d;
        for(var j = currentView.start.getTime();j<=currentView.end.getTime();j=j+(24*60*60*1000)){
            var sample = -1;
            for (var b = 0; b < self.leaveDays.length; b++) {
                if(moment(self.leaveDays[b]).format('YYYY-MM-DD') == moment(j).format('YYYY-MM-DD')){
                    sample = b;
                    var obj = {
                        start: new Date(j),
                        allDay: true,
                        className: "leave-day-class",
                        title:'',
                    };
                    self.eventList.push(obj);
                }
            }
        }
        self.appointment.fullCalendar('removeEvents');
        self.appointment.fullCalendar('removeEventSource');
        self.appointment.fullCalendar('addEventSource', { events: self.eventList });
        self.appointment.fullCalendar('refetchEvents');
    }


    this.checkBusinessClosure = function (startDate) {
        var self = this;
        var populateEvent = false;
        for (var i = 0; i < self.leaveDays.length; i++) {
            if (moment(self.leaveDays[i]).format("YYYY-MM-DD") == moment(startDate).format("YYYY-MM-DD")) {
                populateEvent = true;
                break;
            }
        };
        return populateEvent;
    }

    this.splitTimeBySlotMin = function (startTime, endTime, duration) {
        var self = this;
        timingArry = [];
        startTime = self.convertToMinutes(startTime);
        endTime = self.convertToMinutes(endTime);
        for (var j = startTime; j < endTime; j = j + duration) {
            var start = self.tConvert(self.convertMinsNumToTime(j));
            var end = self.tConvert(self.convertMinsNumToTime(j + duration));
            timingArry.push({ start: start, end: end });
        }
        return timingArry;
    }

    this.convertToMinutes = function (timeString) {
        if (timeString != undefined) {
            if (timeString.split(' ')[1] == 'AM') {
                var hours = parseInt(moment(timeString, 'h:mm A').format('h'));
                var minutes = parseInt(moment(timeString, 'h:mm A').format('mm'));
                return (hours * 60) + minutes;
            }
            else {
                var hours = parseInt(moment(timeString, 'h:mm A').format('h'));
                hours = hours != 12 ? hours + 12 : hours;
                var minutes = parseInt(moment(timeString, 'h:mm A').format('mm'));
                return (hours * 60) + minutes;
            }
        }
    }

    this.convertMinsNumToTime = function (minsNum) {
        if (minsNum) {
            // var mins_num = parseFloat(this, 10); // don't forget the second param
            var hours = Math.floor(minsNum / 60);
            var minutes = Math.floor((minsNum - ((hours * 3600)) / 60));
            var seconds = Math.floor((minsNum * 60) - (hours * 3600) - (minutes * 60));

            // Appends 0 when unit is less than 10
            if (hours < 10) { hours = "0" + hours; }
            if (minutes < 10) { minutes = "0" + minutes; }
            if (seconds < 10) { seconds = "0" + seconds; }
            return hours + ':' + minutes;
        }
    }

    this.tConvert = function (time) {
        time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
        if (time.length > 1) {
            time = time.slice(1);
            time[5] = +time[0] < 12 ? ' AM' : ' PM';
            time[0] = +time[0] % 12 || 12;
        }
        return time.join('');
    }

    this.getCurrentWeekInfo = function (newDate) {
        var curr = new Date(newDate);
        var first = curr.getDate() - curr.getDay();
        var last = first + 6;
        var firstDay = new Date(curr.setDate(first));
        var lastDay = new Date(curr.setDate(last));
        return { firstDay: firstDay, lastDay: lastDay };
    }

    this.confirmPopup = function (event, message, fromEvent) {
        var self = this;
        var dateString = moment(event.start).format('LL');
        var slotStart = moment(event.start).format('hh:mm A');
        var slotEnd = moment(event.end).format('hh:mm A');
        var msg = "<p>" + message + " " + dateString + "(" + slotStart + " to " + slotEnd + ")" + "</p>";
        wjQuery("#dialog > .dialog-msg").html(msg);
        wjQuery("#dialog").dialog({
            resizable: false,
            height: "auto",
            width: 400,
            modal: true,
            buttons: {
                Yes: function () {
                    var newDate = moment(event.start).format("YYYY-MM-DD");
                    var startTime = self.convertToMinutes(moment(event.start).format("HH:mm A"));
                    var endTime = self.convertToMinutes(moment(event.end).format("HH:mm A"));
                    wjQuery(this).dialog("close");
                    var isException = false;
                    if (!fromEvent || event.capacity === event.occupied) {
                        isException = true;
                        self.exceptionaConfirm(newDate, startTime, endTime, isException);
                    }else{
                        window.selectedSlot = { date: newDate, start: startTime, end: endTime, isException: isException };
                        window.close();
                    }
                },
                No: function () {
                    wjQuery(this).dialog("close");
                }
            }
        });
    }

    this.exceptionaConfirm = function(newDate, startTime, endTime, isException){
        var self = this;
        var dateString = moment(event.start).format('LL');
        var slotStart = moment(event.start).format('hh:mm A');
        var slotEnd = moment(event.end).format('hh:mm A');
        var msg = "<p>Appointment is exception. Do you wish to continue?</p>";
        wjQuery("#dialog > .dialog-msg").html(msg);
        wjQuery("#dialog").dialog({
            resizable: false,
            height: "auto",
            width: 400,
            modal: true,
            buttons: {
                Yes: function () {
                    window.selectedSlot = { date: newDate, start: startTime, end: endTime, isException: isException };
                    window.close();
                },
                No: function () {
                    wjQuery(this).dialog("close");
                }
            }
        });
    }

    this.prompt = function (msg) {
        wjQuery("#dialog > .dialog-msg").html(msg);
        wjQuery("#dialog").dialog({
            resizable: false,
            height: "auto",
            width: 350,
            modal: true,
            buttons: {
                Ok: function () {
                    wjQuery(this).dialog("close");
                }
            }
        });
    }

    this.checkDateRage = function (start, end, day) {
        var self = this;
        var currentView = wjQuery.extend(true, {}, self.appointment.fullCalendar('getView'));
        var returnDate = false;
        start = new Date(start);
        start = new Date(start).setHours(0);
        start = new Date(new Date(start).setMinutes(0));
        start = new Date(new Date(start).setSeconds(0));

        currentView.start = new Date(currentView.start).setHours(0);
        currentView.start = new Date(new Date(currentView.start).setMinutes(0));
        currentView.start = new Date(new Date(currentView.start).setSeconds(0));

        currentView.end = new Date(currentView.end).setHours(0);
        currentView.end = new Date(new Date(currentView.end).setMinutes(0));
        currentView.end = new Date(new Date(currentView.end).setSeconds(0));
       
         for (var i = currentView.start.getTime(); i <= currentView.end.getTime(); i=i+(24*60*60*1000)) {
            var date = new Date(i);
            var dayNum = date.getDay();
            dayNum = dayNum == 0 ? 7 : dayNum;
            if (dayNum === day) {
                returnDate = date;
                break;
            }
        }
        if(returnDate != false){
            if (end == undefined) {
                if (returnDate.getTime() >= start.getTime()) {
                    returnDate = returnDate;
                } else {
                    returnDate = false;
                }
            } else {
                end = new Date(end);
                if (returnDate.getTime() >= start.getTime() && returnDate.getTime() <= end.getTime()) {
                    returnDate = returnDate;
                } else {
                    returnDate = false;
                }
            }
        }
        return returnDate;
    }


    this.getDayValue = function (date) {
        if (date != undefined) {
            switch (moment(date).format('dddd').toLowerCase()) {
                case 'monday':
                    return 1;
                    break;
                case 'tuesday':
                    return 2;
                    break;
                case 'wednesday':
                    return 3;
                    break;
                case 'thursday':
                    return 4;
                    break;
                case 'friday':
                    return 5;
                    break;
                case 'saturday':
                    return 6;
                    break;
                case 'sunday':
                    return 7;
                    break;
            }
        }
    }
}

