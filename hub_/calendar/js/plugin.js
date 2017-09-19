
var data = new Data();
var DEFAULT_START_TIME = "8:00 AM";
var DEFAULT_END_TIME = "9:00 AM";
var deliveryType = data.getDeliveryType();
var currentCalendarDate = moment(new Date()).format("YYYY-MM-DD");
/*
 * Student Session Status
 */
var SCHEDULE_STATUS = 1;
var RESCHEDULE_STATUS = 2;
var EXCUSED_STATUS = 3;
var UNEXCUSED_STATUS = 4;
var OMIT_STATUS = 5;
var MAKEUP_STATUS = 6;
var INVALID_STATUS = 7;

setTimeout(function () {
    var deliveryTypeList = [];
    var sylvanCalendar = new SylvanCalendar();
    sylvanCalendar.init("widget-calendar");
    var locationId = sylvanCalendar.populateLocation(data.getLocation());
    wjQuery('.headerDate').text(moment(currentCalendarDate).format('MM/DD/YYYY'));
    setTimeout(function () {
        for (var i = 0; i < deliveryType.length; i++) {
            switch (deliveryType[i]['hub_name']) {
                case 'Personal Instruction':
                    wjQuery('#pi-btn input').val(deliveryType[i]['hub_deliverytypeid']);
                    deliveryTypeList.push(deliveryType[i]['hub_deliverytypeid']);
                    break;
                case 'Group Instruction':
                    wjQuery('#gi-btn input').val(deliveryType[i]['hub_deliverytypeid']);
                    break;
            }
        }

        wjQuery(".loc-dropdown .dropdown-menu").on('click', 'li a', function () {
            if (wjQuery(".location-btn").val() != wjQuery(this).attr('value-id')) {
                wjQuery(".location-btn").text(wjQuery(this).text());
                wjQuery(".location-btn").val(wjQuery(this).attr('value-id'));
                locationId = wjQuery(this).attr('value-id');
                wjQuery('#datepicker').datepicker('destroy');
                wjQuery('#datepicker').datepicker({
                    buttonImage: "/webresources/hub_/calendar/images/calendar.png",
                    buttonImageOnly: true,
                    changeMonth: true,
                    changeYear: true,
                    showOn: 'button',
                    onSelect: function (date) {
                        wjQuery(".loading").show();
                        sylvanCalendar.dateFromCalendar(date, locationId);
                        wjQuery('#datepicker').hide();
                    }
                });
                return fetchResources(locationId, deliveryTypeList, true);
            }
        });
        var rtime;
        var timeout = false;
        var delta = 300;
        wjQuery(window).resize(function() {
            rtime = new Date();
            if (timeout === false) {
                timeout = true;
                setTimeout(resizeend, delta);
            }
        });

        function resizeend() {
            if (new Date() - rtime < delta) {
                setTimeout(resizeend, delta);
            } else {
                timeout = false;
                fetchResources(locationId, deliveryTypeList, true);
            }               
        }
        var resources = [];
        function fetchResources(locationId, selectedDeliveryType, fetchData) {
            wjQuery(".loading").show();
            // asign deliverytpeList to  
            sylvanCalendar.selectedDeliveryType = selectedDeliveryType;
            sylvanCalendar.locationId = locationId;
            var resourceList = [];
            if (fetchData) {
                var obj = data.getResources(locationId);
                resources = obj == null ? [] : obj;
                if (resources.length) {
                    var pi = [];
                    var gi = [];
                    var gf = [];
                    for (var i = 0; i < resources.length; i++) {
                        switch (resources[i]['_hub_deliverytype_value@OData.Community.Display.V1.FormattedValue']) {
                            case 'Personal Instruction':
                                pi.push(resources[i]);
                                break;
                            case 'Group Facilitation':
                                gf.push(resources[i]);
                                break;
                            case 'Group Instruction':
                                gi.push(resources[i]);
                                break;
                        }
                    }
                    resources = pi.concat(gf);
                    resources = resources.concat(gi);
                }
            }
            if (selectedDeliveryType.length == deliveryType.length) {
                resourceList = resources;
            }
            else {
                for (var i = 0; i < selectedDeliveryType.length; i++) {
                    for (var j = 0; j < resources.length; j++) {
                        if (resources[j]['_hub_deliverytype_value'] == selectedDeliveryType[i]) {
                            resourceList.push(resources[j]);
                        }
                    }
                }
            }
            if(sylvanCalendar.calendar == undefined || sylvanCalendar.calendar.fullCalendar('getView').name == 'resourceDay'){
                sylvanCalendar.populateResource(resourceList, fetchData);
            }
            else{
                sylvanCalendar.resourceList = [];
                for (var i = 0; i < resourceList.length; i++) {
                    sylvanCalendar.resourceList.push({
                        name: resourceList[i].hub_name,
                        id: resourceList[i].hub_center_resourcesid,
                        deliveryType: resourceList[i]["_hub_deliverytype_value@OData.Community.Display.V1.FormattedValue"],
                        deliveryTypeId: resourceList[i]['_hub_deliverytype_value'],
                        capacity: resourceList[i]["hub_capacity"]
                    });
                }
            }
            if (resourceList.length) {
                sylvanCalendar.refreshCalendarEvent(locationId, true);
                wjQuery('.prevBtn').off('click').on('click', function () {
                    wjQuery(".loading").show();
                    sylvanCalendar.prev(locationId);
                });

                wjQuery('#datepicker').datepicker({
                    buttonImage: "/webresources/hub_/calendar/images/calendar.png",
                    buttonImageOnly: true,
                    changeMonth: true,
                    changeYear: true,
                    showOn: 'button',
                    onSelect: function (date) {
                        wjQuery(".loading").show();
                        sylvanCalendar.dateFromCalendar(date, locationId);
                        wjQuery('#datepicker').hide();
                    }
                });

                wjQuery('.nextBtn').off('click').on('click', function () {
                    wjQuery(".loading").show();
                    sylvanCalendar.next(locationId);
                });

                wjQuery('.wkView').off('click').on('click', function () {
                    wjQuery(".sof-btn").prop("disabled", true);
                    wjQuery(".sof-btn,.sof-close-icon").trigger('click');
                    wjQuery(".sof-btn").removeClass('overflow-info');
                    sylvanCalendar.weekView();
                });
                wjQuery('.dayView').off('click').on('click', function () {
                    wjQuery(".sof-btn").prop("disabled", false);
                    sylvanCalendar.openSofPane();
                    sylvanCalendar.dayView();
                });
                wjQuery('#addAppointment').click(function () {
                    sylvanCalendar.addAppointment();
                });
                wjQuery('.sof-btn,.sof-close-icon').off('click').on('click', function () {
                    sylvanCalendar.sofPane();
                });
                wjQuery('.ta-btn,.ta-close-icon').off('click').on('click', function () {
                    sylvanCalendar.taPane();
                });
                sylvanCalendar.draggable('teacher-container');
                wjQuery(".refresh-icon").off('click').on('click',function (){
                    fetchResources(locationId, deliveryTypeList, true);
                });

            } else {
                wjQuery(".loading").hide();
            }
        }
        wjQuery('#pi-btn input').attr('checked', 'checked');
        wjQuery('.dtBtn').click(function () {
            deliveryTypeList = [];
            wjQuery('.student-overflow').remove();
            wjQuery('.teacher-availability').remove();
            wjQuery.each(wjQuery('.dtBtn'), function (index, elm) {
                if (wjQuery(elm).is(':checked')) {
                    deliveryTypeList.push(wjQuery(elm).val());
                    for (var i = 0; i < deliveryType.length; i++) {
                        if (deliveryType[i]['hub_deliverytypeid'] == wjQuery(elm).val() &&
                          deliveryType[i]['hub_name'] == 'Group Instruction') {
                            for (var j = 0; j < deliveryType.length; j++) {
                                if (deliveryType[j]['hub_name'] == 'Group Facilitation') {
                                    deliveryTypeList.push(deliveryType[j]['hub_deliverytypeid']);
                                }
                            }
                        }
                    }
                }
            });
            fetchResources(locationId, deliveryTypeList, false);
        });
        fetchResources(locationId, deliveryTypeList, true);
    }, 300);
    var filterObject = {
        student: data.getStudentSession(locationId, currentCalendarDate, currentCalendarDate) == null ? [] : data.getStudentSession(locationId, currentCalendarDate, currentCalendarDate),
        grade: data.getGrade() == null ? [] : data.getGrade(),
        subject: data.getSubject() == null ? [] : data.getSubject()
    }
    sylvanCalendar.generateFilterObject(filterObject);
}, 500);

function SylvanCalendar() {
    this.resourceList = [];
    this.calendar = undefined;
    this.filters = new Object();
    this.eventList = [];
    this.sofList = [];
    this.makeupList = [];
    this.locationId = "";
    this.sofList['Personal Instruction'] = [];
    this.sofList['Group Instruction'] = [];
    this.sofList['Group Facilitation'] = [];
    this.taList = [];
    // 1. Teacher conflict
    // 2. Capacity Conflict
    // 3. OneToOne Conflict
    // 4. Do not sit with student
    this.conflictMsg = ["Multiple teachers are placed", 
                        "Capacity has reached max", 
                        "OneToOne Conflict", 
                        "Non preferred teacher Conflict"
                      ];
    this.calendarOptions = {};
    this.convertedTeacherObj = [];
    this.convertedStudentObj = [];
    this.teacherSchedule = [];
    this.pinnedData = [];
    this.students = [];
    this.teacherAvailability = [];
    this.selectedDeliveryType = [];
    this.convertedPinnedList = [];
    this.staffProgram = [];
    this.programList = [];
    this.businessClosure = [];
    this.staffExceptions = [];
    this.enrollmentPriceList = [];
    this.masterScheduleStudents = [];
    this.init = function (element) {
    }

    //Student pane and TA pane Functionality
    var sofExpanded = false;
    var taExpanded = false;
    this.loadMasterInformation = function () {
        var self = this;
        sofExpanded = false;
        taExpanded = false;
        var checkedList = [];
        var currentCalendarDate = this.calendar.fullCalendar('getDate');
        wjQuery('.headerDate').text(moment(currentCalendarDate).format('MM/DD/YYYY'));
        if (moment(currentCalendarDate).format('MM/DD/YYYY') == moment(new Date()).format('MM/DD/YYYY')) {
            wjQuery('.headerDate').addClass('today');
        }
        else {
            wjQuery('.headerDate').removeClass('today');
        }
        if (wjQuery('thead .fc-agenda-axis.fc-widget-header.fc-first').length) {
            var dayOfWeek = moment(currentCalendarDate).format('dddd');
            var dayofMonth = moment(currentCalendarDate).format('M/D');
            wjQuery('thead .fc-agenda-axis.fc-widget-header.fc-first').css('text-align', 'center');
            wjQuery('thead .fc-agenda-axis.fc-widget-header.fc-first').html(dayOfWeek + " <br/> " + dayofMonth);

        }
        if (wjQuery('.filter-section').length == 0)
            wjQuery(".fc-agenda-divider.fc-widget-header").after("<div class='filter-section'></div>");
        this.calendarFilter();
        this.filterSlide(false);

        wjQuery('.filter-header').on('click', function () {
            var id = wjQuery(this).parent().attr('id');
            var flag = wjQuery("#" + id).hasClass("open");
            if (flag) {
                wjQuery(this).parent().children('.option-header-container').remove();
                wjQuery('#' + id).removeClass('open');
                wjQuery("#" + id).find('.filter-nav-icon').removeClass('open');
            }
            else {
                var indices = id.split('_');
                var index = indices[1];
                for (var i = 0; i < self.filters[index].length; i++) {
                    if (self.filters[index][i].radio) {
                        wjQuery('#' + id).append('<div class="option_' + self.filters[index][i].id + ' option-header-container">' +
                        '<label class="cursor option-title">' +
                            '<input type="radio" class="filterCheckBox" name="' + index + '" value="' + self.filters[index][i].id + '">' + self.filters[index][i].name +
                        '</label>' +
                    '</div>');
                    } else {
                        if (index == "subject") {
                            wjQuery('#' + id).append('<div class="option_' + self.filters[index][i].id + ' option-header-container">' +
                               '<label class="cursor option-title">' +
                                   '<input type="checkbox" class="filterCheckBox" name="' + index + '" value="' + self.filters[index][i].name + '">' + self.filters[index][i].name +
                               '</label>' +
                           '</div>');
                        } else {
                            wjQuery('#' + id).append('<div class="option_' + self.filters[index][i].id + ' option-header-container">' +
                              '<label class="cursor option-title">' +
                                  '<input type="checkbox" class="filterCheckBox" name="' + index + '" value="' + self.filters[index][i].id + '">' + self.filters[index][i].name +
                              '</label>' +
                          '</div>');
                        }
                    }

                }
                wjQuery('#' + id).addClass('open');
                wjQuery("#" + id).find('.filter-nav-icon').addClass('open');

                wjQuery(".filterCheckBox").click(function () {
                    wjQuery(".loading").show();
                    if (wjQuery(this).is(':checked')) {
                        self.eventList = [];
                        self.calendar.fullCalendar('removeEvents');
                        self.calendar.fullCalendar('removeEventSource');
                        var index = checkedList.map(function (y) {
                            return y;
                        }).indexOf(wjQuery(this).val());
                        if (index == -1) {
                            checkedList.push(wjQuery(this).val());
                        }
                        self.calendar.fullCalendar('refetchEvents');
                    } else {
                        self.eventList = [];
                        self.calendar.fullCalendar('removeEvents');
                        self.calendar.fullCalendar('removeEventSource');
                        var index = checkedList.map(function (y) {
                            return y;
                        }).indexOf(wjQuery(this).val());
                        if (index != -1) {
                            checkedList.splice(checkedList.indexOf(wjQuery(this).val()), 1);
                        }
                        self.calendar.fullCalendar('refetchEvents');
                    }

                    if (checkedList.length == 0) {
                        self.populateStudentEvent(self.convertedStudentObj, true);
                        self.populateSOFPane(self.sofList, self.calendarOptions.minTime, self.calendarOptions.maxTime);
                        self.populateTeacherEvent(self.convertedTeacherObj, true);
                        self.populateTAPane(self.taList);
                    } else {
                        var newArray = [];
                        var sofNewArray = [];
                        sofNewArray['Personal Instruction'] = [];
                        sofNewArray['Group Instruction'] = [];
                        sofNewArray['Group Facilitation'] = [];
                        var taNewArray = [];
                        wjQuery.each(checkedList, function (k, v) {
                            var vasdjfjsdfsjdf = self.filterItems(self.convertedStudentObj, v, "default");
                            newArray = wjQuery.merge(self.filterItems(self.convertedStudentObj, v, "default"), newArray);
                            taNewArray = wjQuery.merge(self.filterItems(self.taList, v, "tapane"), taNewArray);
                            piResponse = self.filterItems(self.sofList['Personal Instruction'], v, "sofpane");
                            giResponse = self.filterItems(self.sofList['Group Instruction'], v, "sofpane");
                            gfResponse = self.filterItems(self.sofList['Group Facilitation'], v, "sofpane");

                            var piIndex = sofNewArray['Personal Instruction'].map(function (x) {
                                return x;
                            }).indexOf(v);
                            if (piIndex == -1) {
                                sofNewArray['Personal Instruction'] = wjQuery.merge(piResponse, sofNewArray['Personal Instruction']);
                            }

                            var giIndex = sofNewArray['Group Instruction'].map(function (y) {
                                return y;
                            }).indexOf(v);
                            if (giIndex == -1) {
                                sofNewArray['Group Instruction'] = wjQuery.merge(giResponse, sofNewArray['Group Instruction']);
                            }

                            var gfIndex = sofNewArray['Group Facilitation'].map(function (z) {
                                return z;
                            }).indexOf(v);
                            if (gfIndex == -1) {
                                sofNewArray['Group Facilitation'] = wjQuery.merge(gfResponse, sofNewArray['Group Facilitation']);
                            }
                        });
                        self.populateSOFPane(sofNewArray, self.calendarOptions.minTime, self.calendarOptions.maxTime);
                        self.populateStudentEvent(newArray, true);
                        self.populateTeacherEvent(self.convertedTeacherObj, true);
                        self.populateTAPane(taNewArray);
                    }
                });
            }
        });
        wjQuery('.sof-pane').css('height', wjQuery('#calendar').height() - 10 + "px");
        wjQuery('.ta-pane').css('height', wjQuery('#calendar').height() - 10 + "px");
        wjQuery('.sof-pane').css('overflow', 'hidden');
        wjQuery('.ta-pane').css('overflow', 'hidden');
        wjQuery('.ta-pane').hide();
        wjQuery('.sof-pane').hide();
    }

    this.populateLocation = function (args) {
        if (args != null) {
            var locationData = [];
            args[0][0] == undefined ? locationData = args : locationData = args[0];
            var locationList = [];
            for (var i = 0; i < locationData.length; i++) {
                if (!i) {
                    wjQuery(".location-btn").text(locationData[i].hub_centername);
                    wjQuery(".location-btn").val(locationData[i].hub_centerid);
                }
                locationList.push('<li><a tabindex="-1" value-id=' + locationData[i].hub_centerid + ' href="javascript:void(0)">' + locationData[i].hub_centername + '</a></li>');
            }
            wjQuery(".loc-dropdown ul").html(locationList);
            return locationData[0].hub_centerid;
        }
    }

    this.populateResource = function (args, isFetch) {
        var currentCalendarDate;
        if (this.calendar != undefined) {
            currentCalendarDate = this.calendar.fullCalendar('getDate');
        }
        this.clearAll();
        if (args != null) {
            var resourceData = [];
            if (args[0] != undefined) {
                args[0][0] == undefined ? resourceData = args : resourceData = args[0];
                this.resourceList = [];
                for (var i = 0; i < resourceData.length; i++) {
                    this.resourceList.push({
                        name: resourceData[i].hub_name,
                        id: resourceData[i].hub_center_resourcesid,
                        deliveryType: resourceData[i]["_hub_deliverytype_value@OData.Community.Display.V1.FormattedValue"],
                        deliveryTypeId: resourceData[i]['_hub_deliverytype_value'],
                        capacity: resourceData[i]["hub_capacity"]
                    });
                }
                this.loadCalendar(currentCalendarDate);
            }
        }
    }

    
    this.clearAll = function () {
        this.calendar != undefined ? this.calendar.fullCalendar('removeEvents') : undefined;
        this.calendar != undefined ? this.calendar.fullCalendar('removeEventSource') : undefined;
        this.calendar != undefined ? this.calendar.fullCalendar('destroy') : undefined;
        this.calendar = undefined;
        this.resourceList = [];
        this.eventList = [];
        this.sofList = [];
        this.makeupList = [];
        this.sofList['Personal Instruction'] = [];
        this.sofList['Group Instruction'] = [];
        this.sofList['Group Facilitation'] = [];
        // this.conflictMsg = [];
        wjQuery('.teacher-block').remove();
        wjQuery('.student-overflow').remove();
        this.taList = [];
        this.convertedTeacherObj = [];
        this.convertedStudentObj = [];
        this.calendarOptions = {};
        this.teacherSchedule = [];
        this.pinnedData = [];
        this.teacherAvailability = [];
        this.convertedPinnedList = [];
        this.staffProgram = [];
        this.programList = [];
        this.businessClosure = [];
        this.staffExceptions = [];
        this.enrollmentPriceList = [];
        this.masterScheduleStudents = [];
        this.students = [];
        this.teacherSchedule = [];
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
    this.takeHourValue = function (timeString) {
        if (timeString != undefined) {
            if (timeString.split(' ')[1] == 'AM') {
                return parseInt(moment(timeString, 'h:mm A').format('h')); 
            }
            else {
                var hours = parseInt(moment(timeString, 'h:mm A').format('h'));
                hours = hours != 12 ? hours + 12 : hours;
                return hours;
            }
        }
    }

    this.convertMinsNumToTime = function(minsNum){
      if(minsNum){
        // var mins_num = parseFloat(this, 10); // don't forget the second param
        var hours   = Math.floor(minsNum / 60);
        var minutes = Math.floor((minsNum - ((hours * 3600)) / 60));
        var seconds = Math.floor((minsNum * 60) - (hours * 3600) - (minutes * 60));

        // Appends 0 when unit is less than 10
        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        return hours+':'+minutes;
      }
    }

    this.tConvert = function(time) {
      time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
      if (time.length > 1) { 
        time = time.slice (1);  
        time[5] = +time[0] < 12 ? ' AM' : ' PM'; 
        time[0] = +time[0] % 12 || 12; 
      }
      return time.join (''); 
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

    this.calendarFilter = function () {
        this.buildFilterBody();
    }

    this.filterSlide = function (expanded) {
        wjQuery('.filter-label-outer').click(function () {
            wjQuery('.filter-section').animate(expanded ? { 'marginLeft': '-275px' } : { marginLeft: '0px' }, 500);
            expanded ? wjQuery('.filter-slide-icon').removeClass('open') : wjQuery('.filter-slide-icon').addClass('open');
            expanded = !expanded;
        });
    }

    this.buildFilterBody = function () {
        wjQuery('.filter-section').html('<div class="filter-container"></div>' +
            '<div class="filter-label-outer">' +
                '<span class="filter-slide-icon"></span>' +
                '<div class="filter-label">FILTERS' +
                '</div>' +
            '</div>');
        wjQuery.each(this.filters, function (key, value) {
            wjQuery('.filter-container').append(
                '<div id="filter_' + key + '" class="filter-header-container">' +
                    '<div class="filter-header cursor">' +
                        '<div class="filter-title">' + key + '</div>' +
                        '<span class="filter-nav-icon"></span>' +
                    '</div>' +
                '</div>'
            );
        });
        wjQuery('.filter-section').css('height', wjQuery('.filter-section').next().height() - 2 + "px");
        wjQuery('.filter-container').css({ 'height': wjQuery('.filter-section').next().height() - 2 + "px", "overflow-y": "auto" });
    }

    this.populateSOFPane = function (sofList, minTime, maxTime) {
        var sofTemplate = [];
        wjQuery('.student-overflow').html("");
        for (var i = 0; i < (maxTime - minTime) ; i++) {
            var elm = '<div class="student-overflow" id="student_block_' + i + '" style="height:' + wjQuery(".fc-agenda-slots td div").height() + 'px;overflow:auto"></div>';
            wjQuery('.sof-pane').append(elm);;
        }
        for (var j = 0; j < Object.keys(sofList).length; j++) {
            if (Object.keys(sofList)[j] == 'Personal Instruction') {
                for (var i = 0; i < sofList[Object.keys(sofList)[j]].length; i++) {
                    var studentStartHour = sofList[Object.keys(sofList)[j]][i].start.getHours();
                    if (studentStartHour >= minTime && studentStartHour <= maxTime) {
                        var studentPosition = studentStartHour - minTime;
                        var elm = '<div class="student-container cursor padding-lr-xxs" type="student" value="' + sofList[Object.keys(sofList)[j]][i].id + '">' + sofList[Object.keys(sofList)[j]][i].name + ',<span>' + sofList[Object.keys(sofList)[j]][i].grade + '</span></div>';
                        var deliveryTypeIndex = this.selectedDeliveryType.map(function (y) {
                            return y;
                        }).indexOf(sofList[Object.keys(sofList)[j]][i].deliveryTypeId);
                        if (deliveryTypeIndex != -1) {
                            if (wjQuery('#student_block_' + studentPosition + ' .sof-pi').length == 0) {
                                wjQuery('#student_block_' + studentPosition).append('<div class="sof-pi"></div>');
                            }
                            wjQuery('#student_block_' + studentPosition + ' .sof-pi').append(elm);
                        }
                    }
                }
            } else if (Object.keys(sofList)[j] == 'Group Instruction') {
                // GI Student will not come in sof list
                for (var i = 0; i < sofList[Object.keys(sofList)[j]].length; i++) {
                    var studentStartHour = sofList[Object.keys(sofList)[j]][i].start.getHours();
                    if (studentStartHour >= minTime && studentStartHour <= maxTime) {
                        var studentPosition = studentStartHour - minTime;
                        var elm = '<div class="student-container cursor padding-lr-xxs" type="student" value="' + sofList[Object.keys(sofList)[j]][i].id + '">' + sofList[Object.keys(sofList)[j]][i].name + ',<span>' + sofList[Object.keys(sofList)[j]][i].grade + '</span></div>';
                        var deliveryTypeIndex = this.selectedDeliveryType.map(function (y) {
                            return y;
                        }).indexOf(sofList[Object.keys(sofList)[j]][i].deliveryTypeId);
                        if (deliveryTypeIndex != -1) {
                            if (wjQuery('#student_block_' + studentPosition + ' .sof-gi').length == 0) {
                                wjQuery('#student_block_' + studentPosition).append('<div class="sof-gi"></div>');
                            }
                            wjQuery('#student_block_' + studentPosition + ' .sof-gi').append(elm);
                        }
                    }
                }
            } else if (Object.keys(sofList)[j] == 'Group Facilitation') {
                for (var i = 0; i < sofList[Object.keys(sofList)[j]].length; i++) {
                    var studentStartHour = sofList[Object.keys(sofList)[j]][i].start.getHours();
                    if (studentStartHour >= minTime && studentStartHour <= maxTime) {
                        var studentPosition = studentStartHour - minTime;
                        var elm = '<div class="student-container cursor padding-lr-xxs" type="student" value="' + sofList[Object.keys(sofList)[j]][i].id + '">' + sofList[Object.keys(sofList)[j]][i].name + ',<span>' + sofList[Object.keys(sofList)[j]][i].grade + '</span></div>';
                        var deliveryTypeIndex = this.selectedDeliveryType.map(function (y) {
                            return y;
                        }).indexOf(sofList[Object.keys(sofList)[j]][i].deliveryTypeId);
                        if (deliveryTypeIndex != -1) {
                            if (wjQuery('#student_block_' + studentPosition + ' .sof-gf').length == 0) {
                                wjQuery('#student_block_' + studentPosition).append('<div class="sof-gf"></div>');
                            }
                            wjQuery('#student_block_' + studentPosition + ' .sof-gf').append(elm);
                        }
                    }
                }
            }
            this.sofWidthCalc();
            this.draggable('student-container');
        }
    }

    this.sofWidthCalc = function(){
        if(this.selectedDeliveryType.length == 1){
            wjQuery(".sof-pi").css("width", "calc(100% - 10px)");
        }else{
            
            if (this.sofList['Personal Instruction'].length != 0 &&
                this.sofList['Group Instruction'].length == 0 &&
                this.sofList['Group Facilitation'].length == 0) {
                wjQuery(".sof-pi").css("width", "calc(100% - 10px)");
            }
            else if (this.sofList['Personal Instruction'].length == 0 &&
                this.sofList['Group Instruction'].length != 0 &&
                this.sofList['Group Facilitation'].length == 0) {
                wjQuery(".sof-gi").css("width", "calc(100% - 10px)");
            }
            else if (this.sofList['Personal Instruction'].length == 0 &&
                this.sofList['Group Instruction'].length == 0 &&
                this.sofList['Group Facilitation'].length != 0) {
                wjQuery(".sof-gf").css("width", "calc(100% - 10px)");
            }
            else if (this.sofList['Personal Instruction'].length != 0 &&
                this.sofList['Group Instruction'].length == 0 &&
                this.sofList['Group Facilitation'].length != 0) {
                wjQuery(".sof-pi").css("width", "calc(50% - 10px)");
                wjQuery(".sof-gf").css("width", "calc(50% - 10px)");
            }
            else if (this.sofList['Personal Instruction'].length != 0 &&
                this.sofList['Group Instruction'].length != 0 &&
                this.sofList['Group Facilitation'].length == 0) {
                wjQuery(".sof-pi").css("width", "calc(50% - 10px)");
                wjQuery(".sof-gi").css("width", "calc(50% - 10px)");
            }
            else if (this.sofList['Personal Instruction'].length == 0 &&
                this.sofList['Group Instruction'].length != 0 &&
                this.sofList['Group Facilitation'].length != 0) {
                wjQuery(".sof-gi").css("width", "calc(50% - 10px)");
                wjQuery(".sof-gf").css("width", "calc(50% - 10px)");
            }
            else if (this.sofList['Personal Instruction'].length != 0 &&
                this.sofList['Group Instruction'].length != 0 &&
                this.sofList['Group Facilitation'].length != 0) {
                wjQuery(".sof-gi").css("width", "calc(33% - 10px)");
                wjQuery(".sof-gf").css("width", "calc(33% - 10px)");
                wjQuery(".sof-pi").css("width", "calc(33% - 10px)");
            }
        }
    }

    this.getTeacherSubjects = function (teacherObj) {
        var subjects = [];
        self = this;
        wjQuery.each(teacherObj, function (k, v) {
            if (k.indexOf("astaff_x002e_hub_") != -1 && typeof (v) == 'boolean' && v == true) {
                value = k.replace("astaff_x002e_hub_", "");
                // Subject Key is hardcoaded here
                var subject = self.filters["subject"].filter(function (obj) {
                    return obj.value == value;
                });
                subjects.push(subject[0].name.toLowerCase());
            }
        });
        return subjects;
    }

    this.populateTAPane = function (teacherData) {
        wjQuery(".teacher-availability").html("");
        for (var i = 0; i < (this.calendarOptions.maxTime - this.calendarOptions.minTime) ; i++) {
            var elm = '<div class="teacher-availability" id="teacher_block_' + i + '" style="overflow-y:auto;height:' + wjQuery(".fc-agenda-slots td div").height() + 'px"></div>';
            wjQuery('.ta-pane').append(elm);
        }
        var currentCalendarDate = this.calendar.fullCalendar('getDate');
        for (var i = 0; i < teacherData.length; i++) {
            var teacherStartHour = teacherData[i].startHour;
            var teacherStart = new Date(moment(currentCalendarDate).format('YYYY-MM-DD') + ' ' + teacherStartHour + ":00");
            var addTeacherToTA = true;
            for (var l = 0; l < this.resourceList.length; l++) {
                var event = this.calendar.fullCalendar('clientEvents', this.resourceList[l].id + teacherStart);
                if (event.length != 0) {
                    for (var j = 0; j < event.length; j++) {
                        if (event[j].hasOwnProperty('teachers') && event[j].teachers.length != 0) {
                            for (var k = 0; k < event[j].teachers.length; k++) {
                                if (event[j].teachers[k].id == teacherData[i].id) {
                                    addTeacherToTA = false;
                                    break;
                                }
                            }
                        }
                        if (!addTeacherToTA) {
                            break;
                        }
                    }
                }
                if (!addTeacherToTA) {
                    break;
                }
            }
            if (addTeacherToTA) {
                if (teacherStartHour >= this.calendarOptions.minTime && teacherStartHour <= this.calendarOptions.maxTime) {
                    var teacherPosition = teacherStartHour - this.calendarOptions.minTime;
                    var elm = '<div class="teacher-block"> <div class="teacher-container" type="teacher" value="' + teacherData[i].id + '">' +
                                  '<div class="display-inline-block padding-right-xs">' + teacherData[i].name + '</div>';
                    var staffPrograms = this.getProgramObj(teacherData[i].id);
                    if (staffPrograms.length != 0) {
                        for (var a = 0; a < staffPrograms.length; a++) {
                            elm += '<div class="subject-identifier" style="background:' + staffPrograms[a].color + '"></div>';
                        }
                    }
                    elm += '</div></div>';
                    wjQuery('#teacher_block_' + teacherPosition).append(elm);
                    this.draggable('teacher-container');
                }
            }
        }
    }

    /*
     * Method accepts from where student comes and student
     */
    this.saveSOFtoSession = function (student, oldStudent) {
        if (student[0] != undefined) {
            var h = new Date(student[0].startHour).getHours();
            if (h > 12) {
                h -= 12;
            }

            var objSession = {};
            var objNewSession = {};

            objSession['hub_center@odata.bind'] = student[0].locationId;
            objSession['hub_resourceid@odata.bind'] = student[0].resourceId;
            objSession.hub_session_date = moment(student[0].start).format("YYYY-MM-DD");

            if (oldStudent != undefined) {
                objNewSession['hub_end_time'] = this.convertToMinutes(moment(oldStudent['end']).format("h:mm A"));;
                objNewSession['hub_start_time'] = this.convertToMinutes(moment(oldStudent['start']).format("h:mm A"));
            }

            if (student[0] != undefined) {
                objSession['hub_start_time'] = this.convertToMinutes(moment(student[0]['start']).format("h:mm A"));
                objSession['hub_end_time'] = this.convertToMinutes(moment(student[0]['end']).format("h:mm A"));

                if (student[0]['isFromMasterSchedule']) {
                } else {
                    objNewSession['hub_studentsessionid'] = oldStudent['sessionId'];
                }

                objNewSession['hub_sessiontype'] = 1;
                objSession['hub_sessiontype'] = 1;
                if (student[0]['sessiontype'] != undefined) {
                    objNewSession['hub_sessiontype'] = student[0]['sessiontype'];
                    objSession['hub_sessiontype'] = student[0]['sessiontype'];
                }
                objNewSession['hub_session_status'] = student[0]['sessionStatus'];
                objSession['hub_session_status'] = student[0]['sessionStatus'];
                
                objNewSession['hub_is_1to1'] = student[0]['is1to1'];
                objNewSession['hub_enrollment@odata.bind'] = oldStudent['enrollmentId'];
                objNewSession['hub_service@odata.bind'] = oldStudent['serviceId'];
                objNewSession['hub_center@odata.bind'] = student[0]["locationId"];
                objNewSession['hub_student@odata.bind'] = student[0].id;
                objNewSession['hub_resourceid@odata.bind'] = student[0].resourceId;
                objNewSession['hub_session_date'] = moment(student[0].start).format("YYYY-MM-DD");
                objNewSession['hub_deliverytype'] = student[0].deliveryTypeId;
                objNewSession['hub_deliverytype@OData.Community.Display.V1.FormattedValue'] = student[0].deliveryType;

                objSession['hub_start_time'] = this.convertToMinutes(moment(student[0]['start']).format("h:mm A"));
                objSession['hub_end_time'] = this.convertToMinutes(moment(student[0]['end']).format("h:mm A"));
                return data.saveSOFtoSession(objNewSession, objSession);
            }
        }
    };

    this.saveTAtoSession = function (teacher) {
        if (teacher != undefined) {
            var objStaff = {};
            objStaff['hub_staff@odata.bind'] = teacher.id;
            objStaff['hub_center@odata.bind'] = teacher.locationId;
            var objNewSession = {};
            objNewSession.hub_deliverytype = teacher.deliveryTypeId;
            objNewSession['hub_resourceid@odata.bind'] = teacher.resourceId;
            objNewSession.hub_date = moment(teacher.start).format("YYYY-MM-DD");
            objNewSession.hub_start_time = this.convertToMinutes(moment(teacher.start).format("h:mm A"));
            objNewSession.hub_end_time = this.convertToMinutes(moment(teacher.end).format("h:mm A"));
            objNewSession.hub_schedule_type = 1;
            var responseObj = data.saveTAtoSession(objStaff, objNewSession);
           
            var newScheduleObj = {};
            newScheduleObj.hub_staff_scheduleid = responseObj['hub_staff_scheduleid'];
            newScheduleObj.hub_center = teacher.locationId;
            newScheduleObj.hub_date = moment(teacher.start).format("YYYY-MM-DD");
            newScheduleObj.hub_start_time = this.convertToMinutes(moment(teacher.start).format("h:mm A"));
            newScheduleObj.hub_end_time = this.convertToMinutes(moment(teacher.end).format("h:mm A"));
            newScheduleObj._hub_resourceid_value = teacher.resourceId;
            newScheduleObj._hub_staff_value = teacher.id;
            // update teacher schedule object
            this.teacherSchedule.push(newScheduleObj);
            return responseObj;
        }
    };

    this.createEventOnDrop = function (t, date, allDay, ev, ui, resource, elm) {
        if (wjQuery(elm).attr("type") == 'student') {
          var newEvent = this.calendar.fullCalendar('clientEvents', resource.id + date);
          var stuId = wjQuery(elm).attr("value");
          var startHour = new Date(date).setMinutes(0);
          startHour = new Date(new Date(startHour).setSeconds(0));

          var prevStudObj = {};
          var index = t.sofList['Personal Instruction'].map(function (x) {
              return x.id;
          }).indexOf(stuId);
          prevStudObj = t.sofList['Personal Instruction'][index];
          if (prevStudObj == undefined) {
            var index = t.sofList['Group Facilitation'].map(function (x) {
                return x.id;
            }).indexOf(stuId);
            prevStudObj = t.sofList['Group Facilitation'][index];
            if (prevStudObj == undefined) {
                var index = t.sofList['Group Instruction'].map(function (x) {
                    return x.id;
                }).indexOf(stuId);
                prevStudObj = t.sofList['Group Instruction'][index];
            }
          }
          // var allowToDropStudent = true;
          // if(startHour.getTime() != prevStudObj.start.getTime()){
          var allowToDropStudent = self.validateStudentOnSameRow(stuId, startHour);
          // }
          if(allowToDropStudent){
            if (prevStudObj['deliveryType'] == resource.deliveryType) {
              if (newEvent.length == 0) {
                t.studentSofConflictCheck(t, date, allDay, ev, ui, resource, elm);
              } else if (newEvent.length == 1) {
                var teacherIsPrefered = t.checkNonPreferredTeacher(prevStudObj, newEvent[0]);
                if(!teacherIsPrefered){
                  if (newEvent[0]['students'] == undefined) {
                      t.studentSofConflictCheck(t, date, allDay, ev, ui, resource, elm);
                  } else {
                    // Check Services for same DT
                    prevServiceId = prevStudObj['serviceId'];
                    var showPromt = true;
                    wjQuery.each(newEvent[0]['students'], function (k, v) {
                      if (v.serviceId == prevServiceId) {
                        showPromt = false;
                      }
                    });
                    if(showPromt){
                       // Services are not matching case
                       //  Validation for oneToOne check
                      if (newEvent[0]['is1to1']) {
                          // OneToOne Conflict
                          var msgIndex = newEvent[0].conflictMsg.map(function (x) {
                              return x;
                          }).indexOf(2);
                          if (msgIndex == -1) {
                              newEvent[0].conflictMsg.push(2);
                              self.updateConflictMsg(newEvent[0]);
                          }
                          t.studentSofCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Services are not matching and Session is 'OneToOne' Type. Do you wish to continue?");
                      } else {
                          if (!(newEvent[0].hasOwnProperty('students')) || newEvent[0].hasOwnProperty('students') && (newEvent[0]['students'].length < resource.capacity || resource.capacity == undefined)) {
                            t.studentSofCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Services are not matching. Do you wish to continue?");
                          } else if (newEvent[0].hasOwnProperty('students') && (newEvent[0]['students'].length >= resource.capacity || resource.capacity == undefined)) {
                            t.studentSofCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Services are not matching and Capacity has reached the maximum. Do you wish to continue?");
                          }
                      }
                    }else{
                      //  Validation for oneToOne check
                      if (newEvent[0]['is1to1']) {
                          // OneToOne Conflict
                          var msgIndex = newEvent[0].conflictMsg.map(function (x) {
                              return x;
                          }).indexOf(2);
                          if (msgIndex == -1) {
                              newEvent[0].conflictMsg.push(2);
                              self.updateConflictMsg(newEvent[0]);
                          }
                          t.studentSofCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Session is 'OneToOne' Type. Do you wish to continue?");
                      } else {
                          if (!(newEvent[0].hasOwnProperty('students')) || newEvent[0].hasOwnProperty('students') && (newEvent[0]['students'].length < resource.capacity || resource.capacity == undefined)) {
                              t.studentSofConflictCheck(t, date, allDay, ev, ui, resource, elm);
                          } else if (newEvent[0].hasOwnProperty('students') && (newEvent[0]['students'].length >= resource.capacity || resource.capacity == undefined)) {
                              t.studentSofCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Capacity has reached the maximum. Do you wish to continue?");
                          }
                      }
                    }




                  }
                }else{
                  // Non preferred teacher case
                  if (newEvent[0]['students'] == undefined) {
                      t.studentSofCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Non preferred teacher. Do you wish to continue?");
                  } else {
                    //  Validation for oneToOne check
                    if (newEvent[0]['is1to1']) {
                        // OneToOne Conflict
                        var msgIndex = newEvent[0].conflictMsg.map(function (x) {
                            return x;
                        }).indexOf(2);
                        if (msgIndex == -1) {
                            newEvent[0].conflictMsg.push(2);
                            self.updateConflictMsg(newEvent[0]);
                        }
                        t.studentSofCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Non preferred teacher and Session is 'OneToOne' Type. Do you wish to continue?");
                    } else {
                        if (!(newEvent[0].hasOwnProperty('students')) || newEvent[0].hasOwnProperty('students') && (newEvent[0]['students'].length < resource.capacity || resource.capacity == undefined)) {
                            t.studentSofCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Non preferred teacher. Do you wish to continue?");
                        } else if (newEvent[0].hasOwnProperty('students') && (newEvent[0]['students'].length >= resource.capacity || resource.capacity == undefined)) {
                            t.studentSofCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Non preferred teacher and Capacity has reached the maximum. Do you wish to continue?");
                        }
                    }
                  }
                }
              }
            } else {
              // Pending DT 
              t.studentSofCnfmPopup(t, date, allDay, ev, ui, resource, elm, "DeliveryType is different. Do you wish to continue?");
            }
          }else{
            t.prompt("The selected student is already scheduled for the respective timeslot.");
          }
        }
        else if (wjQuery(elm).attr("type") == 'teacher') {
          var newEvent = this.calendar.fullCalendar('clientEvents', resource.id + date);
          var teacherId = wjQuery(elm).attr("value");
          var techerPrograms = this.getProgramObj(teacherId);
          var startHour = new Date(date).setMinutes(0);
          startHour = new Date(new Date(startHour).setSeconds(0));

          allowToDropTeacher = self.validateTeacherOnSameRow(teacherId, startHour);
          if(allowToDropTeacher){
            if(self.checkForStaffAvailability(teacherId, startHour)){
              if (newEvent.length == 0) {
                this.tapaneConflictCheck(t, date, allDay, ev, ui, resource, elm);
              } else if (newEvent.length == 1) {
                var isNonPreferred = self.checkNonPreferredStudentForTeacher(teacherId, newEvent[0]);
                if(!isNonPreferred){
                  if (!(newEvent[0].hasOwnProperty('teachers')) || (newEvent[0].hasOwnProperty('teachers') && newEvent[0]['teachers'].length == 0)) {
                    if (!newEvent[0].hasOwnProperty('students')) {
                      this.tapaneConflictCheck(t, date, allDay, ev, ui, resource, elm);
                    } else {
                      var showPopup = false;
                      wjQuery.each(newEvent[0]['students'], function (k, v) {
                          var index = techerPrograms.map(function (x) {
                              return x.id;
                          }).indexOf(v.programId);
                          if (index == -1) {
                              showPopup = true;
                              return false;
                          }
                      });
                      if (showPopup) {
                          this.taPaneCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Teacher program is not matching. Do you wish to continue?");
                      } else {
                          this.tapaneConflictCheck(t, date, allDay, ev, ui, resource, elm);
                      }
                    }
                  }
                }else{
                  // Non prefered case
                  if (!(newEvent[0].hasOwnProperty('teachers')) || (newEvent[0].hasOwnProperty('teachers') && newEvent[0]['teachers'].length == 0)) {
                    if (!newEvent[0].hasOwnProperty('students')) {
                      self.taPaneCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Non preferred teacher. Do you wish to continue?");
                    } else {
                      var showPopup = false;
                      wjQuery.each(newEvent[0]['students'], function (k, v) {
                          var index = techerPrograms.map(function (x) {
                              return x.id;
                          }).indexOf(v.programId);
                          if (index == -1) {
                              showPopup = true;
                              return false;
                          }
                      });
                      if (showPopup) {
                        self.taPaneCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Non preferred teacher and Teacher program is not matching. Do you wish to continue?");
                      } else {
                        self.taPaneCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Non preferred teacher. Do you wish to continue?");
                      }
                    }
                  }
                }
              }
            }else{
              if (newEvent.length == 0) {
                this.taPaneCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Teacher is not available. Do you wish to continue?");
              } else if (newEvent.length == 1) {
                var isNonPreferred = self.checkNonPreferredStudentForTeacher(teacherId, newEvent[0]);
                if(!isNonPreferred){
                  if (!(newEvent[0].hasOwnProperty('teachers')) || (newEvent[0].hasOwnProperty('teachers') && newEvent[0]['teachers'].length == 0)) {
                    if (!newEvent[0].hasOwnProperty('students')) {
                      this.taPaneCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Teacher is not available. Do you wish to continue?");
                    } else {
                      var showPopup = false;
                      wjQuery.each(newEvent[0]['students'], function (k, v) {
                          var index = techerPrograms.map(function (x) {
                              return x.id;
                          }).indexOf(v.programId);
                          if (index == -1) {
                              showPopup = true;
                              return false;
                          }
                      });
                      if (showPopup) {
                        this.taPaneCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Teacher is not available and Teacher program is not matching. Do you wish to continue?");
                      } else {
                        this.taPaneCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Teacher is not available. Do you wish to continue?");
                      }
                    }
                  }
                }else{
                  // non prefered case
                  if (!(newEvent[0].hasOwnProperty('teachers')) || (newEvent[0].hasOwnProperty('teachers') && newEvent[0]['teachers'].length == 0)) {
                    if (!newEvent[0].hasOwnProperty('students')) {
                      this.taPaneCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Non preferred teacher and Teacher is not available. Do you wish to continue?");
                    } else {
                      var showPopup = false;
                      wjQuery.each(newEvent[0]['students'], function (k, v) {
                          var index = techerPrograms.map(function (x) {
                              return x.id;
                          }).indexOf(v.programId);
                          if (index == -1) {
                              showPopup = true;
                              return false;
                          }
                      });
                      if (showPopup) {
                        this.taPaneCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Non preferred teacher and Teacher is not available and Teacher program is not matching. Do you wish to continue?");
                      } else {
                        this.taPaneCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Non preferred teacher and Teacher is not available. Do you wish to continue?");
                      }
                    }
                  }
                }
              }
            }
          }else{
            t.prompt("The selected staff is already scheduled for the respective timeslot.");
          }
        }
        else if (wjQuery(elm).attr("type") == 'studentSession') {
            var stuId = wjQuery(elm).attr("value");
            var startHour = new Date(date).setMinutes(0);
            startHour = new Date(new Date(startHour).setSeconds(0));
            var prevEventId = wjQuery(elm).attr("eventid");
            var newEvent = this.calendar.fullCalendar('clientEvents', resource.id + date);
            var prevEvent = this.calendar.fullCalendar('clientEvents', prevEventId);
            var newResourceObj = t.getResourceObj(resource.id);
            var prevResourceObj = t.getResourceObj(prevEvent[0]['resourceId']);
            var uniqueId = wjQuery(elm).attr('uniqueId');
            var startTime = uniqueId.split('_')[2];
            var index = t.convertedStudentObj.findIndex(function (x) {
                return x.id == stuId &&
                        x.resourceId == uniqueId.split('_')[1] &&
                        moment(x.startHour).format("h:mm A") == moment(startTime).format("h:mm A");
            });
            var prevStudObj = t.convertedStudentObj[index];
            if (index != -1) {
              if (newResourceObj.deliveryType != "Group Instruction") {
                var allowToDropStudent = true;
                if(startHour.getTime() != prevEvent[0].start.getTime()){
                  allowToDropStudent = self.validateStudentOnSameRow(stuId, startHour);
                }
                if(allowToDropStudent){
                  if (newEvent.length == 0) {
                      if (wjQuery(elm).attr("pinnedId")) {
                          t.studentSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "This student will be temporarily un pinned. Do you wish to continue?");
                      } else {
                          if (newResourceObj.deliveryType == prevStudObj.deliveryType) {
                              t.studentSessionConflictCheck(t, date, allDay, ev, ui, resource, elm);
                          } else {
                              t.studentSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "DeliveryType is different. Do you wish to continue?");
                          }
                      }
                  }
                  else if (newEvent.length == 1) {
                      var teacherIsPrefered = t.checkNonPreferredTeacher(prevStudObj, newEvent[0]);
                      if(!teacherIsPrefered){
                        if (newEvent[0]['students'] == undefined) {
                            if (wjQuery(elm).attr("pinnedId")) {
                              if (newEvent[0]['is1to1']) {
                                // OneToOne Conflict
                                var msgIndex = newEvent[0].conflictMsg.map(function (x) {
                                    return x;
                                }).indexOf(2);
                                if (msgIndex == -1) {
                                    newEvent[0].conflictMsg.push(2);
                                    self.updateConflictMsg(newEvent[0]);
                                }
                                t.studentSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "This student will be temporarily un pinned and Session is 'OneToOne' Type . Do you wish to continue?");
                              }else{
                                t.studentSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "This student will be temporarily un pinned. Do you wish to continue?");
                              }
                            } else {
                                if (newResourceObj.deliveryType == prevStudObj.deliveryType) {
                                    t.studentSessionConflictCheck(t, date, allDay, ev, ui, resource, elm);
                                } else {
                                    t.studentSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "DeliveryType is different. Do you wish to continue?");
                                }
                            }
                        } else {
                          var studentIndex = newEvent[0]['students'].map(function (x) {
                              return x.id;
                          }).indexOf(stuId);
                          if (studentIndex == -1) {
                            if (wjQuery(elm).attr("pinnedId")) {
                              if (newEvent[0]['is1to1']) {
                                // OneToOne Conflict
                                var msgIndex = newEvent[0].conflictMsg.map(function (x) {
                                    return x;
                                }).indexOf(2);
                                if (msgIndex == -1) {
                                    newEvent[0].conflictMsg.push(2);
                                    self.updateConflictMsg(newEvent[0]);
                                }
                                t.studentSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "This student will be temporarily un pinned and Session is 'OneToOne' Type . Do you wish to continue?");
                              }else{
                                t.studentSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "This student will be temporarily un pinned. Do you wish to continue?");
                              }
                            } else {
                              if (newResourceObj.deliveryType == prevStudObj.deliveryType) {
                                if (newResourceObj.deliveryType == "Personal Instruction") {
                                  //  Validation for oneToOne check
                                  //* if oneToOne then show popup
                                  if (newEvent[0]['is1to1']) {
                                    // OneToOne Conflict
                                    var msgIndex = newEvent[0].conflictMsg.map(function (x) {
                                        return x;
                                    }).indexOf(2);
                                    if (msgIndex == -1) {
                                        newEvent[0].conflictMsg.push(2);
                                        self.updateConflictMsg(newEvent[0]);
                                    }
                                    t.studentSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Session is 'OneToOne' Type. Do you wish to continue?");
                                  } else {
                                    if (!(newEvent[0].hasOwnProperty('students')) || newEvent[0].hasOwnProperty('students') && (newEvent[0]['students'].length < resource.capacity || resource.capacity == undefined)) {
                                        t.studentSessionConflictCheck(t, date, allDay, ev, ui, resource, elm);
                                    } else if (newEvent[0].hasOwnProperty('students') && (newEvent[0]['students'].length >= resource.capacity || resource.capacity == undefined)) {
                                        t.studentSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Capacity has reached the maximum. Do you wish to continue?");
                                    }
                                  }
                                } else if (newResourceObj.deliveryType == "Group Facilitation") {
                                  // Check Services for same DI
                                  var studentIndex = prevEvent[0]['students'].map(function (x) {
                                    return x.id;
                                  }).indexOf(stuId);
                                  prevServiceId = prevEvent[0]['students'][studentIndex]['serviceId'];
                                  var showPromt = true;
                                  wjQuery.each(newEvent[0]['students'], function (k, v) {
                                    if (v.serviceId == prevServiceId) {
                                      showPromt = false;
                                    }
                                  });
                                  if (showPromt) {
                                    t.studentSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Services are not matching. Do you wish to continue?");
                                  } else {
                                    t.studentSessionConflictCheck(t, date, allDay, ev, ui, resource, elm);
                                  }
                                }
                              } else {
                                if (newResourceObj.deliveryType == "Personal Instruction") {
                                  //  Validation for oneToOne check
                                  //* if oneToOne then show popup
                                  if (newEvent[0]['is1to1']) {
                                    // OneToOne Conflict
                                    var msgIndex = newEvent[0].conflictMsg.map(function (x) {
                                        return x;
                                    }).indexOf(2);
                                    if (msgIndex == -1) {
                                        newEvent[0].conflictMsg.push(2);
                                        self.updateConflictMsg(newEvent[0]);
                                    }
                                    t.studentSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "DeliveryType is different and Session is 'OneToOne' Type. Do you wish to continue?");
                                  } else {
                                    if (!(newEvent[0].hasOwnProperty('students')) || newEvent[0].hasOwnProperty('students') && (newEvent[0]['students'].length < resource.capacity || resource.capacity == undefined)) {
                                        t.studentSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "DeliveryType is different. Do you wish to continue?");
                                    } else if (newEvent[0].hasOwnProperty('students') && (newEvent[0]['students'].length >= resource.capacity || resource.capacity == undefined)) {
                                        t.studentSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "DeliveryType is different and Capacity has reached the maximum. Do you wish to continue?");
                                    }
                                  }
                                } else if (newResourceObj.deliveryType == "Group Facilitation") {
                                  // Check Services for same DI
                                  var studentIndex = prevEvent[0]['students'].map(function (x) {
                                      return x.id;
                                  }).indexOf(stuId);
                                  prevServiceId = prevEvent[0]['students'][studentIndex]['serviceId'];
                                  var showPromt = true;
                                  wjQuery.each(newEvent[0]['students'], function (k, v) {
                                      if (v.serviceId == prevServiceId) {
                                          showPromt = false;
                                      }
                                  });
                                  if (showPromt) {
                                      t.studentSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "DeliveryType is different and Services are not matching. Do you wish to continue?");
                                  } else {
                                      t.studentSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "DeliveryType is different. Do you wish to continue?");
                                  }
                                }
                              }
                            }
                          }
                        }
                      }else{
                        // No prefered teacher case
                        if (newEvent[0]['students'] == undefined) {
                            if (wjQuery(elm).attr("pinnedId")) {
                              if (newEvent[0]['is1to1']) {
                                // OneToOne Conflict
                                var msgIndex = newEvent[0].conflictMsg.map(function (x) {
                                    return x;
                                }).indexOf(2);
                                if (msgIndex == -1) {
                                    newEvent[0].conflictMsg.push(2);
                                    self.updateConflictMsg(newEvent[0]);
                                }
                                t.studentSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Non preferred teacher and This student will be temporarily un pinned and Session is 'OneToOne' Type . Do you wish to continue?");
                              }else{
                                t.studentSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Non preferred teacher and This student will be temporarily un pinned. Do you wish to continue?");
                              }
                            } else {
                                if (newResourceObj.deliveryType == prevStudObj.deliveryType) {
                                    t.studentSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Non preferred teacher. Do you wish to continue?");
                                } else {
                                    t.studentSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Non preferred teacher and DeliveryType is different. Do you wish to continue?");
                                }
                            }
                        } else {
                          var studentIndex = newEvent[0]['students'].map(function (x) {
                              return x.id;
                          }).indexOf(stuId);
                          if (studentIndex == -1) {
                            if (wjQuery(elm).attr("pinnedId")) {
                              if (newEvent[0]['is1to1']) {
                                // OneToOne Conflict
                                var msgIndex = newEvent[0].conflictMsg.map(function (x) {
                                    return x;
                                }).indexOf(2);
                                if (msgIndex == -1) {
                                    newEvent[0].conflictMsg.push(2);
                                    self.updateConflictMsg(newEvent[0]);
                                }
                                t.studentSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Non preferred teacher and This student will be temporarily un pinned and Session is 'OneToOne' Type . Do you wish to continue?");
                              }else{
                                t.studentSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Non preferred teacher and This student will be temporarily un pinned. Do you wish to continue?");
                              }
                            } else {
                              if (newResourceObj.deliveryType == prevStudObj.deliveryType) {
                                if (newResourceObj.deliveryType == "Personal Instruction") {
                                  //  Validation for oneToOne check
                                  //* if oneToOne then show popup
                                  if (newEvent[0]['is1to1']) {
                                    // OneToOne Conflict
                                    var msgIndex = newEvent[0].conflictMsg.map(function (x) {
                                        return x;
                                    }).indexOf(2);
                                    if (msgIndex == -1) {
                                        newEvent[0].conflictMsg.push(2);
                                        self.updateConflictMsg(newEvent[0]);
                                    }
                                    t.studentSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Non preferred teacher and Session is 'OneToOne' Type. Do you wish to continue?");
                                  } else {
                                    if (!(newEvent[0].hasOwnProperty('students')) || newEvent[0].hasOwnProperty('students') && (newEvent[0]['students'].length < resource.capacity || resource.capacity == undefined)) {
                                        t.studentSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Non preferred teacher. Do you wish to continue?");
                                    } else if (newEvent[0].hasOwnProperty('students') && (newEvent[0]['students'].length >= resource.capacity || resource.capacity == undefined)) {
                                        t.studentSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Non preferred teacher and Capacity has reached the maximum. Do you wish to continue?");
                                    }
                                  }
                                } else if (newResourceObj.deliveryType == "Group Facilitation") {
                                  // Check Services for same DT
                                  var studentIndex = prevEvent[0]['students'].map(function (x) {
                                    return x.id;
                                  }).indexOf(stuId);
                                  prevServiceId = prevEvent[0]['students'][studentIndex]['serviceId'];
                                  var showPromt = true;
                                  wjQuery.each(newEvent[0]['students'], function (k, v) {
                                    if (v.serviceId == prevServiceId) {
                                      showPromt = false;
                                    }
                                  });
                                  if (showPromt) {
                                    t.studentSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Non preferred teacher and Services are not matching. Do you wish to continue?");
                                  } else {
                                    t.studentSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Non preferred teacher. Do you wish to continue?");
                                  }
                                }
                              } else {
                                if (newResourceObj.deliveryType == "Personal Instruction") {
                                  //  Validation for oneToOne check
                                  //* if oneToOne then show popup
                                  if (newEvent[0]['is1to1']) {
                                    // OneToOne Conflict
                                    var msgIndex = newEvent[0].conflictMsg.map(function (x) {
                                        return x;
                                    }).indexOf(2);
                                    if (msgIndex == -1) {
                                        newEvent[0].conflictMsg.push(2);
                                        self.updateConflictMsg(newEvent[0]);
                                    }
                                    t.studentSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Non preferred teacher and DeliveryType is different and Session is 'OneToOne' Type. Do you wish to continue?");
                                  } else {
                                    if (!(newEvent[0].hasOwnProperty('students')) || newEvent[0].hasOwnProperty('students') && (newEvent[0]['students'].length < resource.capacity || resource.capacity == undefined)) {
                                        t.studentSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Non preferred teacher and DeliveryType is different. Do you wish to continue?");
                                    } else if (newEvent[0].hasOwnProperty('students') && (newEvent[0]['students'].length >= resource.capacity || resource.capacity == undefined)) {
                                        t.studentSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Non preferred teacher and DeliveryType is different and Capacity has reached the maximum. Do you wish to continue?");
                                    }
                                  }
                                } else if (newResourceObj.deliveryType == "Group Facilitation") {
                                  // Check Services for same DI
                                  var studentIndex = prevEvent[0]['students'].map(function (x) {
                                      return x.id;
                                  }).indexOf(stuId);
                                  prevServiceId = prevEvent[0]['students'][studentIndex]['serviceId'];
                                  var showPromt = true;
                                  wjQuery.each(newEvent[0]['students'], function (k, v) {
                                      if (v.serviceId == prevServiceId) {
                                          showPromt = false;
                                      }
                                  });
                                  if (showPromt) {
                                      t.studentSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Non preferred teacher and DeliveryType is different and Services are not matching. Do you wish to continue?");
                                  } else {
                                      t.studentSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Non preferred teacher and DeliveryType is different. Do you wish to continue?");
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                  }
                }else{
                  t.prompt("The selected student is already scheduled for the respective timeslot.");
                }
            } else {
                t.prompt("Can not be placed to a GI session.");
            }
          }
        }
        else if (wjQuery(elm).attr("type") == 'teacherSession') {
            var teacherId = wjQuery(elm).attr("value");
            var startHour = new Date(date).setMinutes(0);
            startHour = new Date(new Date(startHour).setSeconds(0));
            var prevEventId = wjQuery(elm).attr("eventid");
            var techerPrograms = this.getProgramObj(teacherId);
            var prevEvent = this.calendar.fullCalendar('clientEvents', prevEventId);
            if (resource.id + date != prevEventId) {
                var updateFlag = false;
                var newEvent = this.calendar.fullCalendar('clientEvents', resource.id + date);
                var allowToDropTeacher = true;
                if(startHour.getTime() != prevEvent[0].start.getTime()){
                  allowToDropTeacher = self.validateTeacherOnSameRow(teacherId, startHour);
                }
                if(allowToDropTeacher){
                  if (newEvent.length == 0) {
                      this.teacherSessionConflictCheck(t, date, allDay, ev, ui, resource, elm);
                  } else if (newEvent.length == 1) {
                      var isNonPreferred = self.checkNonPreferredStudentForTeacher(teacherId, newEvent[0]);
                      if(!isNonPreferred){
                        if (!(newEvent[0].hasOwnProperty('teachers')) || (newEvent[0].hasOwnProperty('teachers') && newEvent[0]['teachers'].length == 0)) {
                            if (!newEvent[0].hasOwnProperty('students')) {
                                this.teacherSessionConflictCheck(t, date, allDay, ev, ui, resource, elm);
                            } else {
                                var showPopup = false;
                                wjQuery.each(newEvent[0]['students'], function (k, v) {
                                    var index = techerPrograms.map(function (x) {
                                        return x.id;
                                    }).indexOf(v.programId);
                                    if (index == -1) {
                                        showPopup = true;
                                        return false;
                                    }
                                });
                                if (showPopup) {
                                    this.teacherSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Teacher program is not matching. Do you wish to continue?");
                                } else {
                                    this.teacherSessionConflictCheck(t, date, allDay, ev, ui, resource, elm);
                                }
                            }
                        }
                      }else{
                        // Non preffred teacher case
                        if (!(newEvent[0].hasOwnProperty('teachers')) || (newEvent[0].hasOwnProperty('teachers') && newEvent[0]['teachers'].length == 0)) {
                          if (!newEvent[0].hasOwnProperty('students')) {
                              this.teacherSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Non preferred teacher. Do you wish to continue?");
                          } else {
                              var showPopup = false;
                              wjQuery.each(newEvent[0]['students'], function (k, v) {
                                  var index = techerPrograms.map(function (x) {
                                      return x.id;
                                  }).indexOf(v.programId);
                                  if (index == -1) {
                                      showPopup = true;
                                      return false;
                                  }
                              });
                              if (showPopup) {
                                  this.teacherSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Non preferred teacher and Teacher program is not matching. Do you wish to continue?");
                              } else {
                                  this.teacherSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, "Non preferred teacher. Do you wish to continue?");
                              }
                          }
                        }
                      }
                  }
                }else{
                  t.prompt("The selected staff is already scheduled for the respective timeslot.");
                }
            }
        }
    };

    this.tapaneConflictCheck = function (t, date, allDay, ev, ui, resource, elm) {
        var endDate = new Date(date);
        var startHour = new Date(date).setMinutes(0);
        var startHour = new Date(new Date(startHour).setSeconds(0));
        var teacherId = wjQuery(elm).attr("value");
        var teacher = t.taList.filter(function (x) {
            return x.id == teacherId;
        });
        var index = t.taList.map(function (x) {
            return x.id;
        }).indexOf(teacherId);
        if (teacher) {
            elm.remove();
            // t.taList.splice(index, 1);
            var teacherObj = {
                id: teacher[0].id,
                name: teacher[0].name,
                start: date,
                startHour: startHour,
                end: new Date(endDate.setHours(endDate.getHours() + 1)),
                resourceId: resource.id,
                deliveryTypeId: this.getResourceObj(resource.id).deliveryTypeId,
                deliveryType: this.getResourceObj(resource.id).deliveryType,
                locationId: teacher[0].locationId,
            };
            var responseObj = this.saveTAtoSession(teacherObj);
            if(responseObj != undefined &&responseObj != null){
                teacherObj.scheduleId = responseObj['hub_staff_scheduleid'];
            }
            this.convertedTeacherObj.push(teacherObj);
            t.populateTeacherEvent([teacherObj], true);
            t.populateTAPane(t.taList);
        }
    }

    this.teacherSessionConflictCheck = function (t, date, allDay, ev, ui, resource, elm) {
        var endDate = new Date(date);
        var startHour = new Date(date).setMinutes(0);
            startHour = new Date(new Date(startHour).setSeconds(0));
        var teacherId = wjQuery(elm).attr("value");
        var uniqTeacherId = wjQuery(elm).attr("id");
        var prevEventId = wjQuery(elm).attr("eventid");
        var uniqueId = wjQuery(elm).attr('uniqueId');
        var prevEvent = this.calendar.fullCalendar('clientEvents', prevEventId);

        // get teacher index based on prev resourceId and start time
        var index = t.convertedTeacherObj.findIndex(function (x) {
          return x.id == teacherId &&
              x.resourceId == uniqueId.split('_')[1] &&
              x.startHour.getTime() == new Date(uniqueId.split('_')[2]).getTime();
        });

        if (prevEvent.length) {
            var eventTitleHTML = wjQuery(prevEvent[0].title);
            for (var i = 0; i < eventTitleHTML.length; i++) {
                if (wjQuery(eventTitleHTML[i]).attr('value') == teacherId) {
                    eventTitleHTML.splice(i, 1);
                }
            }
            if (eventTitleHTML.prop('outerHTML') != undefined) {
                if (eventTitleHTML.length == 1) {
                    if (prevEvent[0].teachers.length == 1) {
                        prevEvent[0].title = "<span class='placeholder'>Teacher name</span>";
                        prevEvent[0].title += eventTitleHTML.prop('outerHTML');
                    } else {
                        prevEvent[0].title = eventTitleHTML.prop('outerHTML');
                    }
                } else {
                    prevEvent[0].title = "";
                    if (prevEvent[0].teachers.length == 1) {
                        prevEvent[0].title += "<span class='placeholder'>Teacher name</span>";
                    }
                    for (var i = 0; i < eventTitleHTML.length; i++) {
                        prevEvent[0].title += eventTitleHTML[i].outerHTML;
                    }

                    // Teacher conflict removal               
                    if (prevEvent[0].teachers.length == 2) {
                        var msgIndex = prevEvent[0].conflictMsg.map(function (x) {
                            return x;
                        }).indexOf(0);
                        if (msgIndex > -1) {
                            prevEvent[0].conflictMsg.splice(msgIndex, 1);
                        }
                        // self.updateConflictMsg(prevEvent[0]);
                        if (prevEvent[0].title.indexOf('<span class="student-placeholder-'+prevEvent[0].deliveryType+'">Student name</span>') == -1) {
                            prevEvent[0].title += '<span class="student-placeholder-'+prevEvent[0].deliveryType+'">Student name</span>';
                            self.addContext("", 'studentPlaceholder', true, prevEvent[0].deliveryType);
                        }
                    }
                }
                // No students remove lock from prev event
                if(prevEvent[0]['students'] == undefined || prevEvent[0].hasOwnProperty('students') && prevEvent[0]['students'].length == 0){
                  if (prevEvent[0].title.indexOf('<img class="onetoone" title="1:1 Session" src="/webresources/hub_/calendar/images/lock.png">') != -1) {
                      prevEvent[0].title = prevEvent[0].title.replace('<img class="onetoone" title="1:1 Session" src="/webresources/hub_/calendar/images/lock.png">', "");
                      prevEvent[0].is1to1 = false;
                  }
                }
                this.calendar.fullCalendar('updateEvent', prevEvent);
                var removeTeacherIndex = prevEvent[0].teachers.map(function (x) {
                    return x.id;
                }).indexOf(teacherId);
                prevEvent[0].teachers.splice(removeTeacherIndex, 1);

                // remove all conflicts By passing prevEvent Object 
                t.removeAllConflictsFromPrevEvent(prevEvent[0]);

                if ((eventTitleHTML.length == 1 && (eventTitleHTML[0].className == "placeholder" || eventTitleHTML[0].className == "student-placeholder-"+prevEvent[0].deliveryType)) ||
                   (eventTitleHTML.length == 2 && eventTitleHTML[0].className == "placeholder" && eventTitleHTML[1].className == "student-placeholder-"+prevEvent[0].deliveryType) ||
                   (eventTitleHTML.length == 3 && eventTitleHTML[0].className == "onetoone" && eventTitleHTML[1].className == "placeholder" && eventTitleHTML[2].className == "student-placeholder-"+prevEvent[0].deliveryType)) {
                    for (var i = 0; i < this.eventList.length; i++) {
                        if (this.eventList[i].id == prevEventId)
                            this.eventList.splice(i, 1);
                    }
                    this.calendar.fullCalendar('removeEvents', prevEventId);
                }
                 this.calendar.fullCalendar('updateEvent', prevEvent);
            } else {
                for (var i = 0; i < this.eventList.length; i++) {
                    if (this.eventList[i].id == prevEventId)
                        this.eventList.splice(i, 1);
                }
                this.calendar.fullCalendar('removeEvents', prevEventId);
            }
        }
        
        
        if (t.convertedTeacherObj[index]) {
            var newTeacherSession = wjQuery.extend(true, {}, t.convertedTeacherObj[index]);
            elm.remove();
            newTeacherSession.start = date;
            newTeacherSession.startHour = startHour;
            newTeacherSession.end = new Date(endDate.setHours(endDate.getHours() + 1));
            newTeacherSession.resourceId = resource.id;
            newTeacherSession.deliveryTypeId = t.getResourceObj(resource.id).deliveryTypeId;
            newTeacherSession.deliveryType = t.getResourceObj(resource.id).deliveryType;
            t.saveTeacherToSession(newTeacherSession, t.convertedTeacherObj[index]);
        }
        self.openSofPane();
        self.showConflictMsg();
        self.draggable('draggable');

    }

    this.studentSofConflictCheck = function (t, date, allDay, ev, ui, resource, elm) {
        var newEvent = this.calendar.fullCalendar('clientEvents', resource.id + date);
        var endDate = new Date(date);
        var startHour = new Date(date).setMinutes(0);
        startHour = new Date(new Date(startHour).setSeconds(0));
        var stuId = wjQuery(elm).attr("value");
        var parentElement = elm.parentElement;
        var student = [];
        var index = t.sofList['Personal Instruction'].map(function (x) {
            return x.id;
        }).indexOf(stuId);
        if (index != -1) {
            student.push(t.sofList['Personal Instruction'][index]);
            t.sofList['Personal Instruction'].splice(index, 1);

        }
        if (student[0] == undefined) {
            student = [];
            index = t.sofList['Group Facilitation'].map(function (x) {
                return x.id;
            }).indexOf(stuId);
            if (index != -1) {
                student.push(t.sofList['Group Facilitation'][index]);
                t.sofList['Group Facilitation'].splice(index, 1);
            }
            if (student[0] == undefined) {
                student = [];
                index = t.sofList['Group Instruction'].map(function (x) {
                    return x.id;
                }).indexOf(stuId);
                if (index != -1) {
                    student.push(t.sofList['Group Instruction'][index]);
                    t.sofList['Group Instruction'].splice(index, 1);
                }
            }
        }
        if (student) {
            elm.remove();
            t.sofWidthCalc();
            var prevStudent = wjQuery.extend(true, {}, student[0]);
            if (wjQuery(parentElement).html() == '') {
                parentElement.remove();
            }
            student[0].start = date;
            student[0].startHour = startHour;
            student[0].end = new Date(endDate.setHours(endDate.getHours() + 1));
            student[0].resourceId = resource.id;
            // student[0].deliveryType = t.getResourceObj(resource.id)['deliveryType'];
            // student[0].deliveryTypeId = t.getResourceObj(resource.id)['deliveryTypeId'];
            var responseObj = this.saveSOFtoSession(student, prevStudent);
            if (typeof (responseObj) == 'boolean') {
              if (responseObj) {
                    this.convertedStudentObj.push(student[0]);
                    t.populateStudentEvent(student, true);
                  // var txt = wjQuery(element)[0].innerHTML;
                  // wjQuery(element).html("<img src='/webresources/hub_/calendar/images/pin.png'/>" + txt);
                  // wjQuery(element).attr('pinnedId', objPinnedStudent.hub_sch_pinned_students_teachersid);
              }
            }else if (typeof (responseObj) == 'object') {
                if (responseObj != undefined) {
                    student[0].sessionId = responseObj['hub_studentsessionid']; 
                    student[0]['sessiontype'] = responseObj['hub_sessiontype'];
                    student[0]['sessionStatus'] = responseObj['hub_session_status'];
                    if(student[0].hasOwnProperty('isFromMasterSchedule')){
                        delete student[0].isFromMasterSchedule;
                    }
                    this.convertedStudentObj.push(student[0]);
                    t.populateStudentEvent(student, true);
                }
            }
        }
    }

    this.studentSessionConflictCheck = function (t, date, allDay, ev, ui, resource, elm) {
        var endDate = new Date(date);
        var startHour = new Date(date).setMinutes(0);
        var startHour = new Date(new Date(startHour).setSeconds(0));
        var stuId = wjQuery(elm).attr("value");
        var uniqStuId = wjQuery(elm).attr("id");
        var prevEventId = wjQuery(elm).attr("eventid");
        var prevEvent = this.calendar.fullCalendar('clientEvents', prevEventId);
        var uniqueId = wjQuery(elm).attr('uniqueId');
        var startTime = uniqueId.split('_')[2];

        var index = t.convertedStudentObj.findIndex(function (x) {
            return x.id == stuId &&
                   x.resourceId == uniqueId.split('_')[1] &&
                   x.startHour.getTime() == new Date(startTime).getTime();
        });

        if (resource.id + date != prevEventId) {
            if (prevEvent) {
                var eventTitleHTML = wjQuery(prevEvent[0].title);
                for (var i = 0; i < eventTitleHTML.length; i++) {
                    if (wjQuery(eventTitleHTML[i]).attr('value') == stuId) {
                        eventTitleHTML.splice(i, 1);
                    }
                }
                if (eventTitleHTML.prop('outerHTML') != undefined) {
                    if (eventTitleHTML.length == 1) {
                        prevEvent[0].title = eventTitleHTML.prop('outerHTML');
                    } else {
                        prevEvent[0].title = "";
                        for (var i = 0; i < eventTitleHTML.length; i++) {
                            prevEvent[0].title += eventTitleHTML[i].outerHTML;
                        }
                    }
                    var removeStudentIndex = prevEvent[0].students.map(function (x) {
                        return x.id;
                    }).indexOf(stuId);
                    prevEvent[0].students.splice(removeStudentIndex, 1);
                    // No students remove lock from prev event
                    if(prevEvent[0]['students'] == undefined || prevEvent[0].hasOwnProperty('students') && prevEvent[0]['students'].length == 0){
                      if (prevEvent[0].title.indexOf('<img class="onetoone" title="1:1 Session" src="/webresources/hub_/calendar/images/lock.png">') != -1) {
                          prevEvent[0].title = prevEvent[0].title.replace('<img class="onetoone" title="1:1 Session" src="/webresources/hub_/calendar/images/lock.png">', "");
                          prevEvent[0].is1to1 = false;
                      }
                    }

                    // remove all conflicts By passing prevEvent Object 
                    t.removeAllConflictsFromPrevEvent(prevEvent[0]);
                    if ((eventTitleHTML.length == 1 && (eventTitleHTML[0].className == "placeholder" || eventTitleHTML[0].className == "student-placeholder-"+prevEvent[0].deliveryType)) ||
                      (eventTitleHTML.length == 2 && eventTitleHTML[0].className == "placeholder" && eventTitleHTML[1].className == "student-placeholder-"+prevEvent[0].deliveryType) ||
                      (eventTitleHTML.length == 3 && eventTitleHTML[0].className == "onetoone" && eventTitleHTML[1].className == "placeholder" && eventTitleHTML[2].className == "student-placeholder-"+prevEvent[0].deliveryType)) {
                        for (var i = 0; i < this.eventList.length; i++) {
                            if (this.eventList[i].id == prevEventId)
                                this.eventList.splice(i, 1);
                        }
                        this.calendar.fullCalendar('removeEvents', prevEventId);
                    }
                    this.calendar.fullCalendar('updateEvent', prevEvent);
                }
                else {
                  for (var i = 0; i < this.eventList.length; i++) {
                    if (this.eventList[i].id == prevEventId)
                        this.eventList.splice(i, 1);
                  }
                  this.calendar.fullCalendar('removeEvents', prevEventId);
                }

            }
            if (t.convertedStudentObj[index]) {
                var newStudentObj = wjQuery.extend(true, {}, t.convertedStudentObj[index]);
                elm.remove();
                newStudentObj.start = date;
                newStudentObj.startHour = startHour;
                newStudentObj.end = new Date(endDate.setHours(endDate.getHours() + 1));
                newStudentObj.resourceId = resource.id;
                if (wjQuery(elm).attr("tempPinId")) {
                    newStudentObj.tempPinId = wjQuery(elm).attr("tempPinId");
                    delete newStudentObj.pinId;
                }
                // t.convertedStudentObj[index].deliveryTypeId = t.getResourceObj(resource.id).deliveryTypeId;
                // t.convertedStudentObj[index].deliveryType = t.getResourceObj(resource.id).deliveryType;
                t.saveStudentToSession(t.convertedStudentObj[index], newStudentObj);
            }
        }
        self.openSofPane();
        self.showConflictMsg();
        self.draggable('draggable');
    }

    this.clearEvents = function () {
        var self = this;
        self.filters = new Object();
        self.eventList = [];
        self.sofList = [];
        wjQuery('.teacher-block').remove();
        wjQuery('.student-overflow').remove();
        self.taList = [];
        self.convertedTeacherObj = [];
        self.convertedStudentObj = [];
        self.teacherSchedule = [];
        self.pinnedData = [];
        self.teacherAvailability = [];
        self.students = [];
        self.convertedPinnedList = [];
        self.staffProgram = [];
        self.programList = [];
        self.staffExceptions = [];
        self.businessClosure = [];
        self.enrollmentPriceList = [];
        self.masterScheduleStudents = [];
        self.teacherSchedule = [];
        self.calendar.fullCalendar('removeEvents');
        self.calendar.fullCalendar('removeEventSource');
    }

    this.loadCalendar = function (args) {

        // assign filter object to local scope filter to avoid this conflict
        var filters = this.filters;
        var t = this;
        var self = this;
        var date = new Date();

        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();

        this.calendarOptions = {
            header: false,
            defaultView: 'resourceDay',
            disableResizing: true,
            minTime: 8,
            maxTime: 20,
            allDayText: '',
            //allDaySlot:false,
            droppable: true,
            drop: function (date, allDay, ev, ui, resource) {
                t.createEventOnDrop(t, date, allDay, ev, ui, resource, this);
            },
            handleWindowResize: true,
            height: window.innerHeight - 60,
            slotMinutes: 60,
            selectable: false,
            slotEventOverlap: true,
            selectHelper: true,
            select: function (start, end, allDay, event, resourceId) {
                if (title) {
                    console.log("@@ adding event " + title + ", start " + start + ", end " + end + ", allDay " + allDay + ", resource " + resourceId);
                    this.calendar.fullCalendar('renderEvent',
                    {
                        title: title,
                        start: start,
                        end: end,
                        allDay: allDay,
                        resourceId: resourceId
                    },
                    true // make the event "stick"
                );
                }
                this.calendar.fullCalendar('unselect');
            },
            eventClick: function(calEvent, jsEvent, view) {
                self.renderWeekModal(calEvent, jsEvent, view);
            },
            eventRender: function(event, element, view) {
                if (view.name == 'agendaWeek' && event.allDay) {
                    wjQuery('.fc-col' + event.start.getDay()).not('.fc-widget-header').css('background-color', '#ddd');
                    wjQuery('.fc-event-skin').css('background-color', '#ddd');
                    wjQuery('.fc-event-skin').css('border-color', '#ddd');
                    wjQuery('.fc-event.fc-event-hori').css('overflow-y', 'visible');
                }
                else{
                    wjQuery('.fc-col' + event.start.getDay()).not('.fc-widget-header').css('background-color', '#fff');
                    wjQuery('.fc-event.fc-event-hori').css('overflow-y', 'visible'); 
                }
            },
            editable: false,
            resources: this.resourceList,
            events: this.eventList,
            windowResize: function (view) {
                self.calendar.fullCalendar('option', 'height', window.innerHeight - 60);
            }
        };

        if (args != undefined) {
            this.calendarOptions.year = args.getFullYear();
            this.calendarOptions.month = args.getMonth();
            this.calendarOptions.date = args.getDate();
        }
        this.calendar = wjQuery('#calendar').fullCalendar(this.calendarOptions);
        this.loadMasterInformation();

        wjQuery("#addResource").click(function () {
            var newResource = {
                name: "Resource " + (this.resourceList.length + 1),
                id: "resource" + (this.resourceList.length + 1)
            };
            this.resourceList.push(newResource);
            this.calendar.fullCalendar("addResource", [newResource]);
        });

        // From date for new appointment
        wjQuery(".from-datepicker-input").datepicker();
        var selectedFromDate;
        wjQuery(".from-datepicker-input").on("change", function () {
            selectedFromDate = wjQuery(this).val();
        });

        wjQuery(".from-up-arrow").on("click", function () {
            var date = new Date(selectedFromDate);
            date.setDate(date.getDate() + 1);
            selectedFromDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
            wjQuery(".from-datepicker-input").val(selectedFromDate);
        });

        wjQuery(".from-down-arrow").on("click", function () {
            var date = new Date(selectedFromDate);
            date.setDate(date.getDate() - 1);
            selectedFromDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
            wjQuery(".from-datepicker-input").val(selectedFromDate);
        });

        // To date for new appointment
        wjQuery(".to-datepicker-input").datepicker();
        var selectedToDate;
        wjQuery(".to-datepicker-input").on("change", function () {
            selectedToDate = wjQuery(this).val();
        });

        wjQuery(".to-up-arrow").on("click", function () {
            var date = new Date(selectedFromDate);
            date.setDate(date.getDate() + 1);
            selectedToDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
            wjQuery(".to-datepicker-input").val(selectedToDate);
        });

        wjQuery(".to-down-arrow").on("click", function () {
            var date = new Date(selectedToDate);
            date.setDate(date.getDate() - 1);
            selectedToDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
            wjQuery(".to-datepicker-input").val(selectedToDate);
        });

        wjQuery("#save").click(function () {
            alert("success");
            var fromDate = wjQuery("#fromDate").val();
            var fromTime = wjQuery("#fromTime").val();
            var toDate = wjQuery("#toDate").val();
            var toTime = wjQuery("#toTime").val();
            var type = wjQuery("#type").val();
            var capacity = wjQuery("#capacity").val();
            var staff = wjQuery("#staff").val();
            var location = wjQuery("#location").val();
            var notes = wjQuery("#notes").val();
        });
    }

    this.findDataSource = function (currentCalendarDate,view) {
        var now = new Date();
        //constant from instruction view js
        now.setDate(now.getDate() + MASTER_SCHEDULE_CONST);
        if(view.name == 'resourceDay'){
            if (currentCalendarDate > now.getTime()) {
                return true;
            }
            return false;
        }
        else{
            if(view.end.getTime() > now.getTime()){
                return true;
            }
            return false;
        }
    }

    this.prev = function (locationId) {
        this.calendar.fullCalendar('prev');
        var currentCalendarDate = this.calendar.fullCalendar('getDate');
        wjQuery('.headerDate').text(moment(currentCalendarDate).format('MM/DD/YYYY'));
        if (moment(currentCalendarDate).format('MM/DD/YYYY') == moment(new Date()).format('MM/DD/YYYY')) {
            wjQuery('.headerDate').addClass('today');
        }
        else {
            wjQuery('.headerDate').removeClass('today');
        }
        var currentView = this.calendar.fullCalendar('getView');
        if (currentView.name == 'resourceDay') {
            var dayOfWeek = moment(currentCalendarDate).format('dddd');
            var dayofMonth = moment(currentCalendarDate).format('M/D');
            wjQuery('thead .fc-agenda-axis.fc-widget-header.fc-first').html(dayOfWeek + " <br/> " + dayofMonth);
        }
        this.clearEvents();
        currentCalendarDate = moment(currentCalendarDate).format("YYYY-MM-DD");
        this.refreshCalendarEvent(this.locationId, true);
    }

    this.dateFromCalendar = function (date, locationId) {
        var self = this;
        var displayDate = new Date(date);
        self.calendar.fullCalendar('gotoDate', displayDate);
        wjQuery('.headerDate').text(date);
        if (moment(date).format('MM/DD/YYYY') == moment(new Date()).format('MM/DD/YYYY')) {
            wjQuery('.headerDate').addClass('today');
        }
        else {
            wjQuery('.headerDate').removeClass('today');
        }
        var currentView = self.calendar.fullCalendar('getView');
        if (currentView.name == 'resourceDay') {
            var dayOfWeek = moment(date).format('dddd');
            var dayofMonth = moment(date).format('M/D');
            wjQuery('thead .fc-agenda-axis.fc-widget-header.fc-first').html(dayOfWeek + " <br/> " + dayofMonth);
        }
        self.clearEvents();
        var currentCalendarDate = moment(date).format("YYYY-MM-DD");
        self.refreshCalendarEvent(this.locationId, true);
    }

    this.next = function (locationId) {
        this.calendar.fullCalendar('next');
        var currentCalendarDate = this.calendar.fullCalendar('getDate');
        wjQuery('.headerDate').text(moment(currentCalendarDate).format('MM/DD/YYYY'));
        if (moment(currentCalendarDate).format('MM/DD/YYYY') == moment(new Date()).format('MM/DD/YYYY')) {
            wjQuery('.headerDate').addClass('today');
        }
        else {
            wjQuery('.headerDate').removeClass('today');
        }
        var currentView = this.calendar.fullCalendar('getView');
        if (currentView.name == 'resourceDay') {
            var dayOfWeek = moment(currentCalendarDate).format('dddd');
            var dayofMonth = moment(currentCalendarDate).format('M/D');
            wjQuery('thead .fc-agenda-axis.fc-widget-header.fc-first').html(dayOfWeek + " <br/> " + dayofMonth);
        }
        this.clearEvents();
        currentCalendarDate = moment(currentCalendarDate).format("YYYY-MM-DD");
        this.refreshCalendarEvent(this.locationId, true);
    }

    this.refreshCalendarEvent = function (locationId, isFetch) {
        var self = this;
        setTimeout(function () {
            var currentCalendarDate = self.calendar.fullCalendar('getDate');
            var currentView = self.calendar.fullCalendar('getView');
            var studentDataSource = self.findDataSource(currentCalendarDate,currentView);
            if (currentView.name == 'resourceDay') {
                startDate = endDate = moment(currentCalendarDate).format("YYYY-MM-DD");
                // staff program fetching
                self.businessClosure = data.getBusinessClosure(locationId, startDate, endDate) == null ? [] : data.getBusinessClosure(locationId, startDate, endDate);
                if (self.businessClosure == null) {
                    self.businessClosure = [];
                }
                var findingLeaveFlag = true;
                if (self.businessClosure.length) {
                    for (var i = 0; i < self.businessClosure.length; i++) {
                        var businessStartDate = moment(self.businessClosure[i]['hub_startdatetime']).format("YYYY-MM-DD");
                        var businessEndDate = moment(self.businessClosure[i]['hub_enddatetime']).format("YYYY-MM-DD");
                        businessStartDate = new Date(businessStartDate + ' ' + '00:00').getTime();
                        businessEndDate = new Date(businessEndDate + ' ' + '00:00').getTime();
                        var calendarStartDate = new Date(startDate + ' ' + '00:00').getTime();
                        var calendarEndDate = new Date(endDate + ' ' + '00:00').getTime();
                        if (calendarStartDate >= businessStartDate && calendarEndDate <= businessEndDate) {
                            findingLeaveFlag = false;
                        }
                    }
                }
                if (findingLeaveFlag) {
                    wjQuery('table.fc-agenda-slots td div').css('backgroundColor', '');
                    self.staffProgram = data.getStaffProgram(locationId) == null ? [] : data.getStaffProgram(locationId);
                    if (self.staffProgram == null) {
                        self.staffProgram = [];
                    }
                    self.programList = data.getProgramList(locationId) == null ? [] : data.getProgramList(locationId);
                    if (self.programList == null) {
                        self.programList = [];
                    }
                    if (self.programList.length) {
                        var msg = '';
                        for (var i = 0; i < self.programList.length; i++) {
                            msg += "<div style='margin:0 5px;display:inline-block;width:10px;height:10px;background:" + self.programList[i].hub_color + "'></div>" +
                                   "<span style='padding:5px'>" + self.programList[i].hub_name + "</span><br/>";
                        }
                        wjQuery('.info-icon').attr('title', msg);
                    }

                    self.staffExceptions = isFetch || (self.staffExceptions.length == 0) ? data.getStaffException(locationId, startDate, endDate) : self.staffExceptions;
                    if (self.staffExceptions == null) {
                        self.staffExceptions = [];
                    }
                    self.teacherSchedule = isFetch || (self.teacherSchedule.length == 0) ? data.getTeacherSchedule(locationId, startDate, endDate) : self.teacherSchedule;
                    if (self.teacherSchedule == null) {
                        self.teacherSchedule = [];
                    }
                    self.teacherAvailability = isFetch || (self.teacherAvailability.length == 0) ? data.getTeacherAvailability(locationId, startDate, endDate) : self.teacherAvailability;
                    if (self.teacherAvailability == null) {
                        self.teacherAvailability = [];
                    }
                    self.pinnedData = isFetch || (self.pinnedData.length == 0) ? data.getPinnedData(locationId, startDate, endDate) : self.pinnedData;
                    if (self.pinnedData == null) {
                        self.pinnedData = [];
                    }
                    self.enrollmentPriceList = isFetch || (self.enrollmentPriceList.length == 0) ? data.getEnrollmentPriceList(locationId, startDate, endDate) : self.enrollmentPriceList;
                    if (self.enrollmentPriceList == null) {
                        self.enrollmentPriceList = [];
                    }
                    self.convertPinnedData(self.pinnedData == null ? [] : self.pinnedData, false);
                    if (studentDataSource) {
                        self.students = isFetch || (self.students.length == 0) ? data.getStudentMasterScheduleSession(locationId, startDate, endDate) : self.students;
                        if (self.students == null) {
                            self.students = [];
                        }
                        self.populateStudentEvent(self.generateEventObject(self.students == null ? [] : self.students, "studentSession"), true);
                        self.filterObject.student = self.students == null ? [] : self.students;
                        self.generateFilterObject(self.filterObject);
                        self.populateTeacherEvent(self.generateEventObject(self.teacherSchedule == null ? [] : self.teacherSchedule, "teacherSchedule"), true);
                        self.masterScheduleStudents = data.getStudentMasterSchedule(locationId, startDate, endDate)
                        if (self.masterScheduleStudents == null) {
                            self.masterScheduleStudents = [];
                        }
                        self.generateEventObject(self.masterScheduleStudents,"masterStudentSession");
                        self.populateTeacherEvent(self.generateEventObject(self.convertedPinnedList == null ? [] : self.convertedPinnedList, "masterTeacherSchedule"),true);
                    }
                    else{
                        self.students = isFetch || (self.students.length == 0) ? data.getStudentSession(locationId, startDate, endDate) : self.students;
                        if (self.students == null) {
                            self.students = [];
                        }
                        self.populateStudentEvent(self.generateEventObject(self.students == null ? [] : self.students, "studentSession"), true);
                        self.filterObject.student = self.students == null ? [] : self.students;
                        self.generateFilterObject(self.filterObject);
                        self.populateTeacherEvent(self.generateEventObject(self.teacherSchedule == null ? [] : self.teacherSchedule, "teacherSchedule"), true);
                    }
                    self.populateTAPane(self.generateEventObject(self.teacherAvailability == null ? [] : self.teacherAvailability, "teacherAvailability"));
                    self.showConflictMsg();
                }
                else {
                    wjQuery('.loading').hide();
                    wjQuery('table.fc-agenda-slots td div').css('backgroundColor', '#ddd');
                }
            }
            else if (self.calendar.fullCalendar('getView').name == 'agendaWeek'){
                self.eventList = [];
                startDate = moment(currentView.start).format("YYYY-MM-DD");
                endDate = moment(moment(currentView.start).add(6, 'd')).format("YYYY-MM-DD");
                self.businessClosure = data.getBusinessClosure(locationId, startDate, endDate) == null ? [] : data.getBusinessClosure(locationId, startDate, endDate);
                if (self.businessClosure == null) {
                    self.businessClosure = [];
                }
                self.findLeaveDays();
                self.teacherSchedule = isFetch || (self.teacherSchedule.length == 0) ? data.getTeacherSchedule(locationId, startDate, endDate) : self.teacherSchedule;
                if (self.teacherSchedule == null) {
                    self.teacherSchedule = [];
                }
                self.generateFilterObject(self.filterObject);
                self.generateWeekEventObject(self.generateEventObject(self.teacherSchedule, "teacherSchedule"),'teacherSchedule');
                self.teacherAvailability = isFetch || (self.teacherAvailability.length == 0) ? data.getTeacherAvailability(locationId, startDate, endDate) : self.teacherAvailability;
                if (self.teacherAvailability == null) {
                    self.teacherAvailability = [];
                }
                self.generateWeekEventObject(self.teacherAvailability, "teacherAvailability");
                if (studentDataSource) {
                    self.students = isFetch || (self.students.length == 0) ? data.getStudentMasterScheduleSession(locationId, startDate, endDate) : self.students;
                    if (self.students == null) {
                        self.students = [];
                    }
                    self.filterObject.student = self.students == null ? [] : self.students;
                    self.generateFilterObject(self.filterObject);
                    self.generateWeekEventObject(self.generateEventObject(self.students, "studentSession"));
                    self.masterScheduleStudents = data.getStudentMasterSchedule(locationId, startDate, endDate)
                    if (self.masterScheduleStudents == null) {
                        self.masterScheduleStudents = [];
                    }
                    self.generateEventObject(self.masterScheduleStudents, "masterStudentSession");
                }
                else{
                    self.students = isFetch || (self.students.length == 0) ? data.getStudentSession(locationId, startDate, endDate) : self.students;
                    if (self.students == null) {
                        self.students = [];
                    }
                    self.filterObject.student = self.students == null ? [] : self.students;
                    self.generateFilterObject(self.filterObject);
                    self.generateWeekEventObject(self.generateEventObject(self.students, "studentSession"));
                }
                self.populateWeekEvents();
            }
        }, 300);
    }

    this.findLeaveDays = function(){
        var self = this;
        self.leaveDays = [];
        var currentView = self.calendar.fullCalendar('getView');
        for(var j = currentView.start.getTime();j<currentView.end.getTime();j=j+(24*60*60*1000)){
            for (var i = 0; i < self.businessClosure.length; i++) {
                var businessStartDate = moment(self.businessClosure[i]['hub_startdatetime']).format("YYYY-MM-DD");
                var businessEndDate = moment(self.businessClosure[i]['hub_enddatetime']).format("YYYY-MM-DD");
                businessStartDate = new Date(businessStartDate + ' ' + '00:00').getTime();
                businessEndDate = new Date(businessEndDate + ' ' + '00:00').getTime();
                if (j >= businessStartDate && j <= businessEndDate) {
                    self.leaveDays.push(new Date(j));
                }
            }
        }
    };

    this.weekView = function () {
        var filterElement = undefined;
        wjQuery('.loading').show();
        wjQuery('thead .fc-agenda-axis.fc-widget-header.fc-first').css('text-align', 'center');
        if (this.calendar.fullCalendar('getView').name != 'agendaWeek') {
            var isFilterOpen = false;
            if (wjQuery('.filter-section').length) {
                isFilterOpen = wjQuery('.filter-section').css("marginLeft");
                filterElement = wjQuery('.filter-section');
                wjQuery('.filter-section').remove();
            }
            this.calendar.fullCalendar('changeView', 'agendaWeek');

            if (filterElement != undefined) {
                wjQuery(".fc-agenda-divider.fc-widget-header:visible").after(filterElement);
            }
            else {
                wjQuery(".fc-agenda-divider.fc-widget-header:visible").after("<div class='filter-section'></div>");
                this.calendarFilter();
            }
            this.filterSlide(wjQuery, isFilterOpen == '0px');
        }
        this.weekEventObject = {};
        this.calendar.fullCalendar('removeEvents');
        this.refreshCalendarEvent(this.locationId,true);
    }

    this.dayView = function () {
        var filterElement = undefined;
        var self = this;
        self.eventList = [];
        wjQuery('.loading').show();
        self.calendar.fullCalendar('removeEvents');
        if (self.calendar.fullCalendar('getView').name != 'resourceDay') {
            var isFilterOpen = false;
            if (wjQuery('.filter-section').length) {
                isFilterOpen = wjQuery('.filter-section').css("marginLeft");
                filterElement = wjQuery('.filter-section');
                wjQuery('.filter-section').remove();
            }
            self.calendar.fullCalendar('changeView', 'resourceDay');
            setTimeout(function () {
                var currentCalendarDate = self.calendar.fullCalendar('getDate');
                wjQuery('.headerDate').text(moment(currentCalendarDate).format('MM/DD/YYYY'));
                if (moment(currentCalendarDate).format('MM/DD/YYYY') == moment(new Date()).format('MM/DD/YYYY')) {
                    wjQuery('.headerDate').addClass('today');
                }
                else {
                    wjQuery('.headerDate').removeClass('today');
                }
                var dayOfWeek = moment(currentCalendarDate).format('dddd');
                var dayofMonth = moment(currentCalendarDate).format('M/D');
                wjQuery('thead .fc-agenda-axis.fc-widget-header.fc-first').html(dayOfWeek + " <br/> " + dayofMonth);

            }, 500);
            if (filterElement != undefined) {
                wjQuery(".fc-agenda-divider.fc-widget-header:visible").after(filterElement);
            }
            else {
                wjQuery(".fc-agenda-divider.fc-widget-header:visible").after("<div class='filter-section'></div>");
                self.calendarFilter();
            }
            self.filterSlide(wjQuery, isFilterOpen == '0px');
        }
        this.resourceList = [];
        var resources  = data.getResources(this.locationId);
        if (resources.length) {
            var pi = [];
            var gi = [];
            var gf = [];
            for (var i = 0; i < resources.length; i++) {
                switch (resources[i]['_hub_deliverytype_value@OData.Community.Display.V1.FormattedValue']) {
                    case 'Personal Instruction':
                        pi.push(resources[i]);
                        break;
                    case 'Group Facilitation':
                        gf.push(resources[i]);
                        break;
                    case 'Group Instruction':
                        gi.push(resources[i]);
                        break;
                }
            }
            resources = pi.concat(gf);
            resources = resources.concat(gi);
        }
        if (self.selectedDeliveryType.length == deliveryType.length) {
            this.resourceList = resources;
        }
        else {
            for (var i = 0; i < this.selectedDeliveryType.length; i++) {
                for (var j = 0; j < resources.length; j++) {
                    if (resources[j]['_hub_deliverytype_value'] == this.selectedDeliveryType[i]) {
                        this.resourceList.push(resources[j]);
                    }
                }
            }
        }
        this.populateResource(this.resourceList,true);
        this.refreshCalendarEvent(this.locationId, true);
    }

    this.addAppointment = function () {
        wjQuery("#appointmentModal").dialog({
            modal: true
        });
        wjQuery("#appointmentModal").dialog('option', 'title', 'Add New Appointment Slot');
        setTimeout(function () {
            var etime;
            wjQuery(".from-timepicker-input").timepicker({
                timeFormat: 'h:mm p',
                interval: 30,
                minTime: '9',
                maxTime: '6:00pm',
                startTime: '9:00',
                dynamic: false,
                dropdown: true,
                scrollbar: true,
                change: function () {
                    var stime = new Date;
                    stime.setMinutes(stime.getMinutes() + 30);
                    var hours = stime.getHours();
                    var minutes = stime.getMinutes();
                    var ampm = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12;
                    hours = hours ? hours : 12;
                    minutes = minutes < 10 ? '0' + minutes : minutes;
                    var etime = hours + ':' + minutes + ' ' + ampm;
                    wjQuery(".to-timepicker-input").val(etime);
                    wjQuery(".to-timepicker-input").timepicker('option', { 'minTime': stime.getHours() });
                }
            });
            wjQuery(".to-timepicker-input").timepicker({
                timeFormat: 'h:mm p',
                interval: 30,
                minTime: wjQuery(".to-timepicker-input").val().split(' ')[0] + ':00',
                maxTime: '6:00pm',
                dynamic: false,
                dropdown: true,
                scrollbar: true
            });
        }, 300);
    }

    this.sofPane = function () {
        wjQuery('.sof-pane').show();
        wjQuery("#scrollarea").scroll(function () {
            wjQuery('.sof-pane').prop("scrollTop", this.scrollTop)
                .prop("scrollLeft", this.scrollLeft);
        });
        wjQuery('.student-overflow').on('mousewheel DOMMouseScroll', function (e) {
            var e0 = e.originalEvent;
            var delta = e0.wheelDelta || -e0.detail;
            this.scrollTop += (delta < 0 ? 1 : -1) * 30;
            e.preventDefault();
        });
        if (taExpanded) {
            taExpanded = !taExpanded; // to change the slide
            taExpanded ? wjQuery('.ta-pane').addClass('open') : wjQuery('.ta-pane').removeClass('open');
            wjQuery('.ta-pane').css('opacity', '1');
            wjQuery('.ta-pane').animate(taExpanded ? { 'marginRight': '-15px' } : { marginRight: '-260px' }, 500);
        }
        sofExpanded = !sofExpanded;
        if (sofExpanded) {
            wjQuery('.ta-pane').hide();
            wjQuery('.sof-pane').css('opacity', '1');
        }
        sofExpanded ? wjQuery('.sof-pane').addClass('open') : wjQuery('.sof-pane').removeClass('open');
        wjQuery('.sof-pane').animate(sofExpanded ? { 'marginRight': '-15px' } : { marginRight: '-260px' }, 500);
        if (!sofExpanded) {
            setTimeout(function () {
                wjQuery('.sof-pane').hide();
            }, 600);
        }
    }

    this.taPane = function () {
        var self = this;
        wjQuery('.ta-pane').show();
        wjQuery("#scrollarea").scroll(function () {
            wjQuery('.ta-pane').prop("scrollTop", this.scrollTop)
                .prop("scrollLeft", this.scrollLeft);
        });
        wjQuery('.teacher-availability').on('mousewheel DOMMouseScroll', function (e) {
            var e0 = e.originalEvent;
            var delta = e0.wheelDelta || -e0.detail;
            this.scrollTop += (delta < 0 ? 1 : -1) * 30;
            e.preventDefault();
        });
        if (sofExpanded) {
            sofExpanded = !sofExpanded;
            sofExpanded ? wjQuery('.sof-pane').addClass('open') : wjQuery('.sof-pane').removeClass('open');
            wjQuery('.sof-pane').css('opacity', '1');
            wjQuery('.sof-pane').animate(sofExpanded ? { 'marginRight': '-15px' } : { marginRight: '-260px' }, 500);
        }
        taExpanded = !taExpanded;
        if (taExpanded) {
            wjQuery('.ta-pane').css('opacity', '1');
            wjQuery('.sof-pane').hide();
        }
        taExpanded ? wjQuery('.ta-pane').addClass('open') : wjQuery('.ta-pane').removeClass('open');
        wjQuery('.ta-pane').animate(taExpanded ? { 'marginRight': '-15px' } : { marginRight: '-260px' }, 500);
        if (!taExpanded) {
            setTimeout(function () {
                wjQuery('.ta-pane').hide();
                if (self.selectedDeliveryType.length == 1) {
                    if (self.sofList['Personal Instruction'].length > 0) {
                        // self.sofPane();
                    }
                } else if (self.selectedDeliveryType.length == 2) {
                    if (self.sofList['Personal Facilitation'].length > 0) {
                        // self.sofPane();
                    }
                } else {
                    if (self.sofList['Personal Instruction'].length > 0 || self.sofList['Group Instruction'].length > 0 || self.sofList['Group Facilitation'].length > 0) {
                        // self.sofPane();
                    }
                }
            }, 600);
        }
    }

    this.generateFilterObject = function (args) {
        var self = this;
        args[0] == undefined ? filterObj = args : filterObj = args[0];
        self.filterObject = filterObj;
        wjQuery.each(filterObj, function (key, value) {
            self.filters[key] = [];
            wjQuery.each(value, function (ke, val) {
                if (key == "time") {
                    self.filters[key].push({ id: val.id, name: val.name, radio: false });
                } else if (key == "grade") {
                    wjQuery.each(val, function (name, id) {
                        self.filters[key].push({ id: id, name: name, radio: false });
                    });
                } else if (key == "subject") {
                    self.filters[key].push({
                        id: val.id,
                        name: val.name,
                        value: val.value,
                        radio: false
                    });
                } else if (key == "student") {
                    // Remove duplicate entry
                    var index = self.filters[key].map(function (x) {
                        return x.id;
                    }).indexOf(val._hub_student_value);
                    var deliveryTypeIndex = self.selectedDeliveryType.map(function (y) {
                        return y;
                    }).indexOf(val.aproductservice_x002e_hub_deliverytype);

                    if (index == -1 && deliveryTypeIndex != -1) {
                        self.filters[key].push({
                            id: val._hub_student_value,
                            name: val['_hub_student_value@OData.Community.Display.V1.FormattedValue'],
                            startTime: val['hub_session_date@OData.Community.Display.V1.FormattedValue'] + " " + val['hub_start_time@OData.Community.Display.V1.FormattedValue'],
                            endTime: val['hub_session_date@OData.Community.Display.V1.FormattedValue'] + " " + val['hub_end_time@OData.Community.Display.V1.FormattedValue'],
                            sessionDate: val['hub_session_date@OData.Community.Display.V1.FormattedValue'],
                            resourceId: val['_hub_resourceid_value'],
                            centerId: val['_hub_center_value'],
                            deliveryTypeId: val.aproductservice_x002e_hub_deliverytype,
                            deliveryType: val['aproductservice_x002e_hub_deliverytype@OData.Community.Display.V1.FormattedValue'],
                            radio: false
                        });
                    }
                }
            });
        });
    }

    this.generateEventObject = function (args, label) {
        var self = this;
        var currentView = self.calendar.fullCalendar('getView');
        var eventObjList = [];
        if (label == "masterTeacherSchedule") {
            var currentCalendarDate = self.calendar.fullCalendar('getDate');
            wjQuery.each(args, function (ke, val) {
                if(val['teacherId'] != undefined && val['dayId'] == self.getDayValue(currentCalendarDate)){
                    var sDate, eDate, startHour,teacherAvailableFlag = false;
                    for (var i = 0; i < self.teacherAvailability.length; i++) {
                        if(self.teacherAvailability[i]['_hub_staffid_value'] == val['teacherId']){
                            if(self.teacherAvailability[i]['hub_enddate'] != undefined){
                                if(moment(moment(currentCalendarDate).format('YYYY-MM-DD')).isSameOrBefore(moment(self.teacherAvailability[i]['hub_enddate']).format('YYYY-MM-DD'))){
                                    teacherAvailableFlag = true;
                                }
                                else{
                                    teacherAvailableFlag = false;
                                }
                            }
                            else{
                                teacherAvailableFlag = true;
                            }
                        }
                    }
                    if(teacherAvailableFlag){
                        if (val['startTime'] != undefined && val['endTime'] != undefined) {
                            sDate = new Date(moment(currentCalendarDate).format('YYYY-MM-DD') + " " + val['startTime']);
                            eDate = new Date(moment(currentCalendarDate).format('YYYY-MM-DD') + " " + val['endTime']);
                            startHour = new Date(moment(currentCalendarDate).format('YYYY-MM-DD') + " " + val['startTime']);
                            startHour = startHour.setMinutes(0);
                            startHour = new Date(new Date(startHour).setSeconds(0));
                        }
                        var teacher = {
                            id: val['teacherId'],
                            name: val["teacherName"],
                            start: sDate,
                            end: eDate,
                            startHour: startHour,
                            resourceId: val['resourceId'],
                            locationId: self.locationId,
                            pinId:val['id'],
                            isFromMasterSchedule : true
                        };
                        var index = self.staffExceptions.findIndex(function (x) {
                            return x['astaff_x002e_hub_staffid'] == teacher.id;
                        });
                        if (index == -1) {
                            eventObjList.push(teacher);
                        }
                    }
                }                
            });
            if(self.convertedTeacherObj.length != 0){
                self.convertedTeacherObj = self.convertedTeacherObj.concat(eventObjList);
            }
            else{
                self.convertedTeacherObj = eventObjList;
            }
        }
        else if (label == "teacherSchedule") {
            wjQuery.each(args, function (ke, val) {
                var sDate, eDate, startHour,currentCalendarDate;
                if (val['hub_date@OData.Community.Display.V1.FormattedValue'] != undefined &&
                  val['hub_start_time@OData.Community.Display.V1.FormattedValue'] != undefined) {
                    sDate = new Date(val['hub_date@OData.Community.Display.V1.FormattedValue'] + " " + val['hub_start_time@OData.Community.Display.V1.FormattedValue']);
                    eDate = new Date(val['hub_date@OData.Community.Display.V1.FormattedValue'] + " " + val['hub_end_time@OData.Community.Display.V1.FormattedValue']);
                    startHour = new Date(val['hub_date@OData.Community.Display.V1.FormattedValue'] + " " + val['hub_start_time@OData.Community.Display.V1.FormattedValue']);
                    startHour = startHour.setMinutes(0);
                    startHour = new Date(new Date(startHour).setSeconds(0)); 
                    currentCalendarDate = startHour;
                }
                else{
                    currentCalendarDate = self.calendar.fullCalendar('getDate');
                }
                var teacher = {
                    id: val['_hub_staff_value'],
                    name: val["_hub_staff_value@OData.Community.Display.V1.FormattedValue"],
                    start: sDate,
                    end: eDate,
                    startHour: startHour,
                    resourceId: val['_hub_resourceid_value'],
                    deliveryTypeId: val['aproductservice_x002e_hub_deliverytype'],
                    deliveryType: val['aproductservice_x002e_hub_deliverytype@OData.Community.Display.V1.FormattedValue'],
                    locationId: val['astaff_x002e_hub_center'],
                    locationName: val['astaff_x002e_hub_center@OData.Community.Display.V1.FormattedValue'],
                    subjectId: val['subjectId'],
                    scheduleId: val['hub_staff_scheduleid'],
                    serviceId : val['_hub_product_service_value']
                };
                if (self.convertedPinnedList.length) {
                    var isPinned = self.convertedPinnedList.filter(function (obj) {
                        return (obj.teacherId == teacher.id &&
                               obj.resourceId == teacher.resourceId &&
                               obj.dayId == self.getDayValue(currentCalendarDate)) ||
                               (obj.teacherId == teacher.id &&
                                obj.startTime == moment(sDate).format("h:mm A") &&
                                obj.dayId == self.getDayValue(currentCalendarDate))
                    });
                    if (isPinned[0] != undefined) {
                        teacher.pinId = isPinned[0].id;
                    }
                }
                var index = -1;
                for (var i = 0; i < self.staffExceptions.length; ++i) {
                    if (self.staffExceptions[i]['astaff_x002e_hub_staffid'] == teacher.id && 
                        moment(self.staffExceptions[i]['hub_startdate']).format('YYYY-MM-DD') == moment(teacher.startHour).format('YYYY-MM-DD')) {
                        index = i;
                        break;
                    }
                }
                if (index == -1) {
                    eventObjList.push(teacher);
                }
            });
            self.convertedTeacherObj = eventObjList;
        } 
        else if (label == "studentSession") {
            wjQuery.each(args, function (ke, val) {
                var sDate = new Date(val['hub_session_date'] + " " + val['hub_start_time@OData.Community.Display.V1.FormattedValue']);
                var eDate = new Date(val['hub_session_date'] + " " + val['hub_end_time@OData.Community.Display.V1.FormattedValue']);
                var startHour = new Date(val['hub_session_date'] + " " + val['hub_start_time@OData.Community.Display.V1.FormattedValue']);
                startHour = startHour.setMinutes(0);
                startHour = new Date(new Date(startHour).setSeconds(0));
                var obj = {
                    id: val._hub_student_value,
                    name: val["_hub_student_value@OData.Community.Display.V1.FormattedValue"],
                    start: sDate,
                    end: eDate,
                    sessionDate: val['hub_session_date'],
                    startHour: startHour,
                    gradeId: val['astudent_x002e_hub_grade'],
                    grade: val['astudent_x002e_hub_grade@OData.Community.Display.V1.FormattedValue'],
                    deliveryTypeId: val['aproductservice_x002e_hub_deliverytype'],
                    deliveryType: val['aproductservice_x002e_hub_deliverytype@OData.Community.Display.V1.FormattedValue'],
                    locationId: val['_hub_center_value'],
                    locationName: val['_hub_center_value@OData.Community.Display.V1.FormattedValue'],
                    enrollmentId: val['_hub_enrollment_value'],
                    subject: val['aprogram_x002e_hub_areaofinterest@OData.Community.Display.V1.FormattedValue'],
                    subjectId: val['aprogram_x002e_hub_areaofinterest'],
                    subjectColorCode: val['aprogram_x002e_hub_color'],
                    is1to1: val["hub_is_1to1"],
                    programId: val['aprogram_x002e_hub_programid'],
                    serviceId: val['_hub_service_value'],
                    sessionId: val['hub_studentsessionid'],
                    sessiontype: val['hub_sessiontype'],
                    sessionStatus: val['hub_session_status'],
                    duration: val['aproductservice_x002e_hub_duration'],
                    timeSlotType: val['aproductservice_x002e_hub_timeslottype'],
                    namedHoursId: val['aproductservice_x002e_hub_namedgfhoursid']
                }

                if(val.hasOwnProperty('aenrollment_x002e_hub_nonpreferredteacher')){
                  obj['nonPreferredTeacher'] = val['aenrollment_x002e_hub_nonpreferredteacher'];
                }

                if (val.hasOwnProperty('_hub_resourceid_value')) {
                    obj.resourceId = val['_hub_resourceid_value'];
                    if (self.convertedPinnedList.length) {
                        var isPinned = self.convertedPinnedList.filter(function (x) {
                            return (x.studentId == obj.id &&
                                    x.resourceId == obj.resourceId &&
                                    x.dayId == self.getDayValue(startHour) &&
                                    x.startTime == moment(startHour).format("h:mm A"))
                        });
                        if (isPinned[0] != undefined) {
                            obj.pinId = isPinned[0].id;
                        }
                    }
                    var index = eventObjList.findIndex(function (x) {
                            return (x.id == obj.id &&
                                    x.resourceId == obj.resourceId &&
                                    x.start.getTime() == obj.start.getTime())
                        });
                    if(index == -1){
                        eventObjList.push(obj);
                    }
                }
                else if(obj.sessionStatus != INVALID_STATUS &&
                    obj.sessionStatus != UNEXCUSED_STATUS &&
                    obj.sessionStatus != OMIT_STATUS && 
                    obj.sessionStatus != EXCUSED_STATUS) {
                    self.pushStudentToSOF(obj);
                }

                if(obj.sessionStatus == INVALID_STATUS ||
                    obj.sessionStatus == UNEXCUSED_STATUS ||
                    obj.sessionStatus == OMIT_STATUS || 
                    obj.sessionStatus == EXCUSED_STATUS){
                     var index = eventObjList.findIndex(function (x) {
                            return (x.id == obj.id &&
                                    x.resourceId == obj.resourceId &&
                                    x.start.getTime() == obj.start.getTime())
                        });
                    if(index == -1){
                        eventObjList.push(obj);
                    }
                }
            });
            setTimeout(function () {
                if(Object.keys(self.sofList).length){
                    if (self.sofList['Personal Instruction'].length > 0 || self.sofList['Group Instruction'].length > 0 || self.sofList['Group Facilitation'].length > 0) {
                        self.populateSOFPane(self.sofList, self.calendarOptions.minTime, self.calendarOptions.maxTime);
                    }
                }
            }, 800);
            self.convertedStudentObj = eventObjList;
        }
        else if (label == 'masterStudentSession') {
            var pinnedList = [];
            var affinityList = [];
            var noResourceList = [];
            var currentCalendarDate = self.calendar.fullCalendar('getDate');
            var serviceGF = {};
            var serviceGI = {};
            wjQuery.each(args, function (ke, val) {
                var obj = {
                    id: val['aenrollment_x002e_hub_student'],
                    name: val["aenrollment_x002e_hub_student@OData.Community.Display.V1.FormattedValue"],
                    gradeId: val['astudent_x002e_hub_grade'],
                    grade: val['astudent_x002e_hub_grade@OData.Community.Display.V1.FormattedValue'],
                    deliveryTypeId: val['aproductservice_x002e_hub_deliverytype'],
                    deliveryType: val['aproductservice_x002e_hub_deliverytype@OData.Community.Display.V1.FormattedValue'],
                    locationId: val['aenrollment_x002e_hub_location'],
                    locationName: val['aenrollment_x002e_hub_location@OData.Community.Display.V1.FormattedValue'],
                    subject: val['aprogram_x002e_hub_areaofinterest@OData.Community.Display.V1.FormattedValue'],
                    subjectId: val['aprogram_x002e_hub_areaofinterest'],
                    subjectColorCode: val['aprogram_x002e_hub_color'],
                    programId: val['aprogram_x002e_hub_programid'],
                    serviceId: val['aenrollment_x002e_hub_service'],
                    enrollmentId: val['aenrollment_x002e_hub_enrollmentid'],
                    isFromMasterSchedule: true,
                    is1to1: false,
                    sessionDate: moment(currentCalendarDate).format('YYYY-MM-DD'),
                    timeSlotType : val['aproductservice_x002e_hub_timeslottype'],
                    namedHoursId: val['aproductservice_x002e_hub_namedgfhoursid']
                }

                if(val.hasOwnProperty('aenrollment_x002e_hub_nonpreferredteacher')){
                  obj['nonPreferredTeacher'] = val['aenrollment_x002e_hub_nonpreferredteacher'];
                }

                if (obj.deliveryType == 'Personal Instruction') {
                    var pinnedStudent = self.convertedPinnedList.filter(function (x) {
                        return x.studentId == obj.id &&
                               x.startTime == val['hub_starttime@OData.Community.Display.V1.FormattedValue'] &&
                               x.dayId == self.getDayValue(currentCalendarDate);
                    });
                    var priceList = self.enrollmentPriceList.filter(function (x) {
                        return x['aenrollment_x002e_hub_enrollmentid'] == obj.enrollmentId;
                    });
                    if (priceList[0] != undefined) {
                        if (priceList[0]['apricelist_x002e_hub_ratio@OData.Community.Display.V1.FormattedValue'] == '1:1') {
                            obj.is1to1 = true;
                        }
                    }
                    for (var i = 0; i < pinnedStudent.length; i++) {
                        if (pinnedStudent[i] != undefined) {
                          var newObj = wjQuery.extend(true, {}, obj);
                          newObj.pinId = undefined;
                          newObj.enrollmentId = pinnedStudent[i].enrollmentId,
                          newObj.start = new Date(moment(currentCalendarDate).format('YYYY-MM-DD') + " " + pinnedStudent[i].startTime);
                          newObj.end = new Date(moment(currentCalendarDate).format('YYYY-MM-DD') + " " + pinnedStudent[i].endTime);
                          var startHour = new Date(moment(currentCalendarDate).format('YYYY-MM-DD') + " " + pinnedStudent[i].startTime);
                          startHour = startHour.setMinutes(0);
                          startHour = new Date(new Date(startHour).setSeconds(0));
                          newObj.startHour = startHour;
                          var studentStart = new Date(moment(currentCalendarDate).format('YYYY-MM-DD') + " " + val['hub_starttime@OData.Community.Display.V1.FormattedValue']);
                          if(studentStart.getTime() == newObj.start.getTime()){
                              if (pinnedStudent[i].hasOwnProperty('resourceId')) {
                                  newObj.resourceId = pinnedStudent[i].resourceId;
                                  var index = pinnedList.findIndex(function (x) {
                                      return x.id == newObj.id &&
                                             x.startHour.getTime() == startHour.getTime();
                                  });
                                  if (index == -1) {
                                      pinnedList.push(newObj);
                                  }
                              }
                              else if (pinnedStudent[i].hasOwnProperty('affinityResourceId')) {
                                  newObj.resourceId = pinnedStudent[i].affinityResourceId;
                                  var index = affinityList.findIndex(function (x) {
                                      return x.id == newObj.id &&
                                             x.startHour.getTime() == startHour.getTime();
                                  });
                                  if (index == -1) {
                                      affinityList.push(newObj);
                                  }
                              }

                          }
                          else{
                              newObj.start = new Date(moment(currentCalendarDate).format('YYYY-MM-DD') + " " + val['hub_starttime@OData.Community.Display.V1.FormattedValue']);
                              newObj.end = new Date(moment(currentCalendarDate).format('YYYY-MM-DD') + " " + val['hub_endtime@OData.Community.Display.V1.FormattedValue']);
                              var startHour = new Date(moment(currentCalendarDate).format('YYYY-MM-DD') + " " + val['hub_starttime@OData.Community.Display.V1.FormattedValue']);
                              startHour = startHour.setMinutes(0);
                              startHour = new Date(new Date(startHour).setSeconds(0));
                              newObj.startHour = startHour;
                              var index = noResourceList.findIndex(function (x) {
                                  return x.id == newObj.id &&
                                         x.startHour.getTime() == startHour.getTime();
                              });
                              if (index == -1) {
                                  noResourceList.push(newObj);
                              }
                          }
                        }
                    }
                    if(pinnedStudent.length == 0){
                      obj.start = new Date(moment(currentCalendarDate).format('YYYY-MM-DD') + " " + val['hub_starttime@OData.Community.Display.V1.FormattedValue']);
                      obj.end = new Date(moment(currentCalendarDate).format('YYYY-MM-DD') + " " + val['hub_endtime@OData.Community.Display.V1.FormattedValue']);
                      var startHour = new Date(moment(currentCalendarDate).format('YYYY-MM-DD') + " " + val['hub_starttime@OData.Community.Display.V1.FormattedValue']);
                      startHour = startHour.setMinutes(0);
                      startHour = new Date(new Date(startHour).setSeconds(0));
                      obj.startHour = startHour;
                      var index = noResourceList.findIndex(function (x) {
                          return x.id == obj.id &&
                                 x.startHour.getTime() == startHour.getTime();
                      });
                      if (index == -1) {
                          noResourceList.push(obj);
                      }
                    }
                }
                else {
                    obj.start = new Date(moment(currentCalendarDate).format('YYYY-MM-DD') + " " + val['hub_starttime@OData.Community.Display.V1.FormattedValue']);
                    obj.end = new Date(moment(currentCalendarDate).format('YYYY-MM-DD') + " " + val['hub_endtime@OData.Community.Display.V1.FormattedValue']);
                    var startHour = new Date(moment(currentCalendarDate).format('YYYY-MM-DD') + " " + val['hub_starttime@OData.Community.Display.V1.FormattedValue']);
                    startHour = startHour.setMinutes(0);
                    startHour = new Date(new Date(startHour).setSeconds(0));
                    obj.startHour = startHour;
                    if (val.hasOwnProperty('aproductservice_x002e_hub_resource')) {
                        obj.resourceId = val['aproductservice_x002e_hub_resource'];
                        var index = self.convertedStudentObj.findIndex(function (x) {
                            return x.id == obj.id &&
                                   x.startHour.getTime() == startHour.getTime();
                        });
                        if (index == -1) {
                            if(currentView.name == 'resourceDay'){
                                self.populateStudentEvent([obj], true, true);
                            }
                            else{
                               self.generateWeekEventObject([obj],'studentSession'); 
                            }
                          var index = self.convertedStudentObj.findIndex(function (x) {
                          return x.id == obj.id &&
                                 x.startHour.getTime() == obj.startHour.getTime();
                          });
                          if (index == -1) {
                              self.convertedStudentObj.push(obj);
                          }
                          else{
                            // if( self.convertedStudentObj[index].sessionStatus == INVALID_STATUS ||
                            //     self.convertedStudentObj[index].sessionStatus == UNEXCUSED_STATUS ||
                            //     self.convertedStudentObj[index].sessionStatus == OMIT_STATUS || 
                            //     self.convertedStudentObj[index].sessionStatus == EXCUSED_STATUS){
                            // }
                            // else
                            // {
                            //     self.convertedStudentObj.push(obj);
                            //     self.populateStudentEvent([obj], true, true);
                            // }
                          }

                        }
                    }
                    else {
                        if (obj.deliveryType == 'Group Instruction') {
                          if (serviceGI.hasOwnProperty(obj.serviceId+obj.startHour)) {
                            var index = serviceGI[obj.serviceId+obj.startHour].findIndex(function (x) {
                              return x.id == obj.id &&
                                       x.startHour.getTime() == obj.startHour.getTime();
                            });
                            if (index == -1) {
                              serviceGI[obj.serviceId+obj.startHour].push(obj);
                            }
                          }
                          else {
                            serviceGI[obj.serviceId+obj.startHour] = [];
                            serviceGI[obj.serviceId+obj.startHour].push(obj);
                          }
                        }
                        else if (obj.deliveryType == 'Group Facilitation') {
                          if (serviceGF.hasOwnProperty(obj.serviceId+obj.startHour)) {
                            var index = serviceGF[obj.serviceId+obj.startHour].findIndex(function (x) {
                                return x.id == obj.id &&
                                       x.startHour.getTime() == obj.startHour.getTime();
                            });
                            if (index == -1) {
                                serviceGF[obj.serviceId+obj.startHour].push(obj);
                            }
                          }
                          else {
                            serviceGF[obj.serviceId+obj.startHour] = [];
                            serviceGF[obj.serviceId+obj.startHour].push(obj);
                          }
                        }
                    }
                }
            });
            if (pinnedList.length) {
                for(var i=0; i<pinnedList.length; i++){
                    var index = self.convertedStudentObj.findIndex(function (x) {
                      return x.id == pinnedList[i].id &&
                               x.startHour.getTime() == pinnedList[i].startHour.getTime();
                    });
                    if (index == -1) {
                      self.convertedStudentObj.push(pinnedList[i]);
                    }
                    else{
                      // if( self.convertedStudentObj[index].sessionStatus == INVALID_STATUS ||
                      //     self.convertedStudentObj[index].sessionStatus == UNEXCUSED_STATUS ||
                      //     self.convertedStudentObj[index].sessionStatus == OMIT_STATUS || 
                      //     self.convertedStudentObj[index].sessionStatus == EXCUSED_STATUS){
                      // }
                      // else
                      // {
                      //     self.convertedStudentObj.push(pinnedList[i]);
                      // }
                      pinnedList.splice(i,1);
                    }
                }
                if(currentView.name == 'resourceDay'){
                    self.populateStudentEvent(pinnedList, true, true);
                }
                else{
                   self.generateWeekEventObject(pinnedList,'studentSession'); 
                }
            }
            if (affinityList.length) {
                self.populateAffinityStudents(affinityList);
            }
            if (noResourceList.length) {
                self.populateNoResourceStudent(noResourceList);
            }
            if (Object.keys(serviceGF).length) {
                self.populateByService(serviceGF);
            }
            if (Object.keys(serviceGI).length) {
                self.populateByService(serviceGI);
            }
            setTimeout(function () {
                if (self.sofList['Personal Instruction'].length > 0 || self.sofList['Group Instruction'].length > 0 || self.sofList['Group Facilitation'].length > 0) {
                    self.populateSOFPane(self.sofList, self.calendarOptions.minTime, self.calendarOptions.maxTime);
                }
            }, 800);
        } 
        else if (label == "teacherAvailability") {
            var currentCalendarDate = this.calendar.fullCalendar('getDate');
            var currentView = new Date(currentCalendarDate).setHours(0);
            currentView = new Date(new Date(currentCalendarDate).setMinutes(0));
            currentView = new Date(new Date(currentCalendarDate).setSeconds(0));
            for (var i = 0; i < args.length; i++) {
                var exceptionStartHour = -1,exceptionEndHour = -1;
                var index = -1;
                if(self.staffExceptions.length){
                    for(var k=0; k< self.staffExceptions.length ; k++){
                        if(args[i]['_hub_staffid_value'] == self.staffExceptions[k]['astaff_x002e_hub_staffid']){
                            var exceptionStartDate = new Date(self.staffExceptions[k]['hub_startdate']);
                            // Set time for start date
                            exceptionStartDate = new Date(exceptionStartDate).setHours(0);
                            exceptionStartDate = new Date(new Date(exceptionStartDate).setMinutes(0));

                            var exceptionEndDate = self.staffExceptions[k]['hub_enddate'];
                            exceptionEndDate = exceptionEndDate == undefined ? exceptionStartDate : new Date(exceptionEndDate);
                            // Set time for end date
                            exceptionEndDate = new Date(exceptionEndDate).setHours(0);
                            exceptionEndDate = new Date(new Date(exceptionEndDate).setMinutes(0));
                            if(currentView.getTime() >= exceptionStartDate.getTime() && currentView.getTime() <= exceptionEndDate.getTime()){
                                if(self.staffExceptions[k]['hub_entireday']){
                                    index = 1;
                                    break;
                                }
                                else{
                                    exceptionStartHour = self.staffExceptions[k]['hub_starttime'] / 60;
                                    exceptionEndHour = self.staffExceptions[k]['hub_endtime']/60;
                                    break;
                                }

                            }
                        }
                    }
                }
                if (index == -1) {
                    if (args[i]['hub_' + moment(currentCalendarDate).format('dddd').toLowerCase()]) {
                        var obj = {
                            name: args[i]['_hub_staffid_value@OData.Community.Display.V1.FormattedValue'],
                            id: args[i]['_hub_staffid_value'],
                            startDate: args[i]['hub_startdate@OData.Community.Display.V1.FormattedValue'],
                            endDate: args[i]['hub_enddate@OData.Community.Display.V1.FormattedValue'],
                            locationId: args[i]['astaff_x002e_hub_center'],
                            deliveryTypeId: args[i]['_hub_deliverytype_value'],
                            subjects: self.getTeacherSubjects(args[i])
                        }
                        switch (moment(currentCalendarDate).format('dddd').toLowerCase()) {
                            case 'monday':
                                obj.startTime = args[i]['hub_monstarttime@OData.Community.Display.V1.FormattedValue'];
                                if (args[i]['hub_monendtime@OData.Community.Display.V1.FormattedValue'] == undefined) {
                                    obj.endTime = moment(obj.startTime, 'h:mm A').add(1, 'h').format('h:mm A');
                                    obj.startHour = self.takeHourValue(obj.startTime);
                                    if(!(obj.startHour >= exceptionStartHour && obj.startHour <= exceptionEndHour-1))
                                        eventObjList.push(obj);
                                }
                                else {
                                    var staffEndTime = args[i]['hub_monendtime@OData.Community.Display.V1.FormattedValue'];
                                    var staffEndHour = self.takeHourValue(staffEndTime);
                                    var staffStartHour = self.takeHourValue(obj.startTime);
                                    do {
                                        var newObject = wjQuery.extend(true, {}, obj);
                                        newObject.startHour = staffStartHour;
                                        if(!(newObject.startHour >= exceptionStartHour && newObject.startHour <= exceptionEndHour-1)){
                                            eventObjList.push(newObject);
                                        }
                                        staffStartHour++;
                                    }
                                    while (staffStartHour < staffEndHour);
                                }
                                break;
                            case 'tuesday':
                                obj.startTime = args[i]['hub_tuestarttime@OData.Community.Display.V1.FormattedValue'];
                                if (args[i]['hub_tueendtime@OData.Community.Display.V1.FormattedValue'] == undefined) {
                                    obj.endTime = moment(obj.startTime, 'h:mm A').add(1, 'h').format('h:mm A');
                                    obj.startHour = self.takeHourValue(obj.startTime);
                                    if(!(obj.startHour >= exceptionStartHour && obj.startHour <= exceptionEndHour-1))
                                        eventObjList.push(obj);
                                }
                                else {
                                    var staffEndTime = args[i]['hub_tueendtime@OData.Community.Display.V1.FormattedValue'];
                                    var staffEndHour = self.takeHourValue(staffEndTime);
                                    var staffStartHour = self.takeHourValue(obj.startTime);
                                    do {
                                        var newObject = wjQuery.extend(true, {}, obj);
                                        newObject.startHour = staffStartHour;
                                        if(!(newObject.startHour >= exceptionStartHour && newObject.startHour <= exceptionEndHour-1)){
                                            eventObjList.push(newObject);
                                        }
                                        staffStartHour++;
                                    }
                                    while (staffStartHour < staffEndHour);
                                }
                                break;
                            case 'wednesday':
                                obj.startTime = args[i]['hub_wedstarttime@OData.Community.Display.V1.FormattedValue'];
                                if (args[i]['hub_wedendtime@OData.Community.Display.V1.FormattedValue'] == undefined) {
                                    obj.endTime = moment(obj.startTime, 'h:mm A').add(1, 'h').format('h:mm A');
                                    obj.startHour = self.takeHourValue(obj.startTime);
                                    if(!(obj.startHour >= exceptionStartHour && obj.startHour <= exceptionEndHour-1))
                                        eventObjList.push(obj);
                                }
                                else {
                                    var staffEndTime = args[i]['hub_wedendtime@OData.Community.Display.V1.FormattedValue'];
                                    var staffEndHour = self.takeHourValue(staffEndTime);
                                    var staffStartHour = self.takeHourValue(obj.startTime);
                                    do {
                                        var newObject = wjQuery.extend(true, {}, obj);
                                        newObject.startHour = staffStartHour;
                                        if(!(newObject.startHour >= exceptionStartHour && newObject.startHour <= exceptionEndHour-1)){
                                            eventObjList.push(newObject);
                                        }
                                        staffStartHour++;
                                    }
                                    while (staffStartHour < staffEndHour);
                                }
                                break;
                            case 'thursday':
                                obj.startTime = args[i]['hub_thurstarttime@OData.Community.Display.V1.FormattedValue'];
                                if (args[i]['hub_thurendtime@OData.Community.Display.V1.FormattedValue'] == undefined) {
                                    obj.endTime = moment(obj.startTime, 'h:mm A').add(1, 'h').format('h:mm A');
                                    obj.startHour = self.takeHourValue(obj.startTime);
                                    if(!(obj.startHour >= exceptionStartHour && obj.startHour <= exceptionEndHour-1))
                                        eventObjList.push(obj);
                                }
                                else {
                                    var staffEndTime = args[i]['hub_thurendtime@OData.Community.Display.V1.FormattedValue'];
                                    var staffEndHour = self.takeHourValue(staffEndTime);
                                    var staffStartHour = self.takeHourValue(obj.startTime);
                                    do {
                                        var newObject = wjQuery.extend(true, {}, obj);
                                        newObject.startHour = staffStartHour;
                                        if(!(newObject.startHour >= exceptionStartHour && newObject.startHour <= exceptionEndHour-1)){
                                            eventObjList.push(newObject);
                                        }
                                        staffStartHour++;
                                    }
                                    while (staffStartHour < staffEndHour);
                                }
                                break;
                            case 'friday':
                                obj.startTime = args[i]['hub_fristarttime@OData.Community.Display.V1.FormattedValue'];
                                if (args[i]['hub_friendtime@OData.Community.Display.V1.FormattedValue'] == undefined) {
                                    obj.endTime = moment(obj.startTime, 'h:mm A').add(1, 'h').format('h:mm A');
                                    obj.startHour = self.takeHourValue(obj.startTime);
                                    if(!(obj.startHour >= exceptionStartHour && obj.startHour <= exceptionEndHour-1))
                                        eventObjList.push(obj);
                                }
                                else {
                                    var staffEndTime = args[i]['hub_friendtime@OData.Community.Display.V1.FormattedValue'];
                                    var staffEndHour = self.takeHourValue(staffEndTime);
                                    var staffStartHour = self.takeHourValue(obj.startTime);
                                    do {
                                        var newObject = wjQuery.extend(true, {}, obj);
                                        newObject.startHour = staffStartHour;
                                        if(!(newObject.startHour >= exceptionStartHour && newObject.startHour <= exceptionEndHour-1)){
                                            eventObjList.push(newObject);
                                        }
                                        staffStartHour++;
                                    }
                                    while (staffStartHour < staffEndHour);
                                }
                                break;
                            case 'saturday':
                                obj.startTime = args[i]['hub_satstarttime@OData.Community.Display.V1.FormattedValue'];
                                if (args[i]['hub_satendtime@OData.Community.Display.V1.FormattedValue'] == undefined) {
                                    obj.endTime = moment(obj.startTime, 'h:mm A').add(1, 'h').format('h:mm A');
                                    obj.startHour = self.takeHourValue(obj.startTime);
                                    if(!(obj.startHour >= exceptionStartHour && obj.startHour <= exceptionEndHour-1))
                                        eventObjList.push(obj);
                                }
                                else {
                                    var staffEndTime = args[i]['hub_satendtime@OData.Community.Display.V1.FormattedValue'];
                                    var staffEndHour = self.takeHourValue(staffEndTime);
                                    var staffStartHour = self.takeHourValue(obj.startTime);
                                    do {
                                        var newObject = wjQuery.extend(true, {}, obj);
                                        newObject.startHour = staffStartHour;
                                        if(!(newObject.startHour >= exceptionStartHour && newObject.startHour <= exceptionEndHour-1)){
                                            eventObjList.push(newObject);
                                        }
                                        staffStartHour++;
                                    }
                                    while (staffStartHour < staffEndHour);
                                }
                                break;
                            case 'sunday':
                                obj.startTime = args[i]['hub_sunstarttime@OData.Community.Display.V1.FormattedValue'];
                                if (args[i]['hub_sunendtime@OData.Community.Display.V1.FormattedValue'] == undefined) {
                                    obj.endTime = moment(obj.startTime, 'h:mm A').add(1, 'h').format('h:mm A');
                                    obj.startHour = self.takeHourValue(obj.startTime);
                                    if(!(obj.startHour >= exceptionStartHour && obj.startHour <= exceptionEndHour-1))
                                        eventObjList.push(obj);
                                }
                                else {
                                    var staffEndTime = args[i]['hub_sunendtime@OData.Community.Display.V1.FormattedValue'];
                                    var staffEndHour = self.takeHourValue(staffEndTime);
                                    var staffStartHour = self.takeHourValue(obj.startTime);
                                    do {
                                        var newObject = wjQuery.extend(true, {}, obj);
                                        newObject.startHour = staffStartHour;
                                        if(!(newObject.startHour >= exceptionStartHour && newObject.startHour <= exceptionEndHour-1)){
                                            eventObjList.push(newObject);
                                        }
                                        staffStartHour++;
                                    }
                                    while (staffStartHour < staffEndHour);
                                }
                                break;
                        }
                    }
                }
            }
            this.taList = eventObjList;
        }
        return eventObjList;
    }

    this.populateTeacherEvent = function (teacherObject, isFromFilter) {
        wjQuery(".loading").show();
        var self = this;
        if (teacherObject.length) {
            wjQuery.each(teacherObject, function (key, value) {
                var id = value['id'];
                var name = value['name'];
                if (value['resourceId'] == undefined) {
                    for (var i = 0; i < self.resourceList.length; i++) {
                        if (self.resourceList[i].deliveryType == 'Personal Instruction' ||
                          self.resourceList[i].deliveryType == 'Group Facilitation') {
                            eventId = self.resourceList[i].id + value['startHour'];
                            event = self.calendar.fullCalendar('clientEvents', eventId);
                            if (event.length == 0) {
                                value['resourceId'] = self.resourceList[i].id;
                                break;
                            } else {
                                if (!event[0].hasOwnProperty("teachers") ||
                                  (event[0].hasOwnProperty("teachers") && event[0]['teachers'].length == 0)) {
                                    value['resourceId'] = self.resourceList[i].id;
                                    break;
                                }
                            }
                        }
                    }
                }
                if (value['startHour'] == undefined) {
                    var currentCalendarDate = self.calendar.fullCalendar('getDate');
                    var calendarDate = moment(currentCalendarDate).format('YYYY-MM-DD');
                    for (var i = self.calendarOptions.minTime; i < self.calendarOptions.maxTime; i++) {
                        var slot = new Date(calendarDate + " " + i + ':00');
                        eventId = value['resourceId'] + slot;
                        event = self.calendar.fullCalendar('clientEvents', eventId);
                        if (event.length == 0) {
                            value['startHour'] = slot;
                            value['startTime'] = slot;
                            value['endTime'] = slot.setHours(slot.getHours() + 1);
                            break;
                        }
                        else {
                            if (!event[0].hasOwnProperty("teachers") ||
                              (event[0].hasOwnProperty("teachers") && event[0]['teachers'].length == 0)) {
                                value['startHour'] = slot;
                                value['startTime'] = slot;
                                value['endTime'] = slot.setHours(slot.getHours() + 1);
                                break;
                            }
                        }
                    }
                }
                var eventId = value['resourceId'] + value['startHour'];
                var uniqueId = id + "_" + value['resourceId'] + "_" + value['startHour'];
                var event = self.calendar.fullCalendar('clientEvents', eventId);
                var resourceObj = self.getResourceObj(value['resourceId']);
                if (event.length == 1) {
                    wjQuery.each(event, function (k, v) {
                        if (event[k].hasOwnProperty("teachers") && event[k]['teachers'].length != 0) {
                            index = event[k].teachers.map(function (x) {
                                return x.id;
                            }).indexOf(id);
                            if (index == -1) {
                                event[k].title = "";
                                if (event[k].title.indexOf("<img class='onetoone' title='1:1 Session' src='/webresources/hub_/calendar/images/lock.png'>") != -1) {
                                    event[k].title = event[k].title.replace("<img class='onetoone' title='1:1 Session' src='/webresources/hub_/calendar/images/lock.png'>", "");
                                }
                                // Conflict update
                                // More than one teacher conflict 
                                var msgIndex = event[k].conflictMsg.map(function (x) {
                                    return x.id;
                                }).indexOf(0);
                                if (msgIndex == -1) {
                                    event[k].conflictMsg.push(0);
                                    self.updateConflictMsg(event[k]);
                                }

                                event[k].teachers.push({ id: id, name: name });
                                wjQuery.each(event[k].teachers, function (ka, teacherObj) {
                                    var uniqueId = teacherObj.id + "_" + value['resourceId'] + "_" + value['startHour'];
                                    if (value['pinId'] != undefined) {
                                        event[k].title += "<span class='draggable drag-teacher' pinnedId='" + value['pinId'] + "' eventid='" + eventId + "' uniqueId='" + uniqueId + "' id='" + teacherObj.id + value['resourceId'] + "' type='teacherSession' value='" + teacherObj.id + "'><img src='/webresources/hub_/calendar/images/pin.png'/>" + teacherObj.name + "</span>";
                                    } else {
                                        // temp unpin teacher
                                        if (value['tempPinId'] != undefined) {
                                            event[k].title += "<span class='draggable drag-teacher' tempPinId='" + value['tempPinId'] + "' eventid='" + eventId + "' uniqueId='" + uniqueId + "' id='" + teacherObj.id + value['resourceId'] + "' type='teacherSession' value='" + teacherObj.id + "'><img style='transform:rotate(45deg);' src='/webresources/hub_/calendar/images/pin.png'/>" + teacherObj.name + "</span>";
                                        } else {
                                            event[k].title += "<span class='draggable drag-teacher' eventid='" + eventId + "' uniqueId='" + uniqueId + "' id='" + teacherObj.id + value['resourceId'] + "' type='teacherSession' value='" + teacherObj.id + "'>" + teacherObj.name + "</span>";
                                        }
                                    }
                                    event[k].isConflict = true;
                                });
                                if (event[k].hasOwnProperty("students")) {
                                    wjQuery.each(event[k].students, function (ke, val) {
                                        if (resourceObj.deliveryType == "Group Instruction") {
                                            event[k].title += "<span class='drag-student' eventid='" + eventId + "' uniqueId='" + val.id + "_" + value['resourceId'] + "_" + value['startHour'] + "' id='" + val.id + value['resourceId'] + "' type='studentSession' value='" + val.id + "'>" + val.name + ", " + val.grade + "<i class='material-icons' style='color:" + val['subjectColorCode'] + "'>location_on</i></span>";
                                        } else {
                                            if (val['pinId'] != undefined) {
                                                event[k].title += "<span class='draggable drag-student' pinnedId='" + val['pinId'] + "' eventid='" + eventId + "' uniqueId='" + val.id + "_" + value['resourceId'] + "_" + value['startHour'] + "' id='" + val.id + value['resourceId'] + "' type='studentSession' value='" + val.id + "'><img src='/webresources/hub_/calendar/images/pin.png'/>" + val.name + ", " + val.grade + "<i class='material-icons' style='color:" + val['subjectColorCode'] + "'>location_on</i></span>";
                                            } else {
                                                event[k].title += "<span class='draggable drag-student' eventid='" + eventId + "' uniqueId='" + val.id + "_" + value['resourceId'] + "_" + value['startHour'] + "' id='" + val.id + value['resourceId'] + "' type='studentSession' value='" + val.id + "'>" + val.name + ", " + val.grade + "<i class='material-icons' style='color:" + val['subjectColorCode'] + "'>location_on</i></span>";
                                            }
                                        }
                                    });
                                }
                                // capacity check for students place holder
                                if (event[k].hasOwnProperty("students")) {
                                    if (resourceObj['capacity'] > event[k].students.length) {
                                        if (event[k].title.indexOf('<span class="student-placeholder-'+event[k].deliveryType+'">Student name</span>') == -1) {
                                            event[k].title += '<span class="student-placeholder-'+event[k].deliveryType+'">Student name</span>';
                                            self.addContext("", 'studentPlaceholder', true, event[k].deliveryType);
                                        }
                                    }
                                } else {
                                    if (event[k].title.indexOf('<span class="student-placeholder-'+event[k].deliveryType+'">Student name</span>') == -1) {
                                        event[k].title += '<span class="student-placeholder-'+event[k].deliveryType+'">Student name</span>';
                                        self.addContext("", 'studentPlaceholder', true, event[k].deliveryType);
                                    }
                                }
                            }
                        } else {
                            var uniqueId = id + "_" + value['resourceId'] + "_" + value['startHour'];
                            if (event[k].title.indexOf("<img class='onetoone' title='1:1 Session' src='/webresources/hub_/calendar/images/lock.png'>") != -1) {
                                event[k].title = "<img class='onetoone' title='1:1 Session' src='/webresources/hub_/calendar/images/lock.png'>";
                                if (value['pinId'] != undefined) {
                                    event[k].title += "<span class='draggable drag-teacher' pinnedId='" + value['pinId'] + "' eventid='" + eventId + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='teacherSession' value='" + id + "'><img src='/webresources/hub_/calendar/images/pin.png'/>" + value.name + "</span>";
                                } else {
                                    // temp unpin teacher
                                    if (value['tempPinId'] != undefined) {
                                        event[k].title += "<span class='draggable drag-teacher' tempPinId='" + value['tempPinId'] + "' eventid='" + eventId + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='teacherSession' value='" + id + "'><img style='transform:rotate(45deg);' src='/webresources/hub_/calendar/images/pin.png'/>" + value.name + "</span>";
                                    } else {
                                        event[k].title += "<span class='draggable drag-teacher' eventid='" + eventId + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='teacherSession' value='" + id + "'>" + value.name + "</span>";
                                    }
                                }
                            } else {
                                if (value['pinId'] != undefined) {
                                    event[k].title = "<span class='draggable drag-teacher' pinnedId='" + value['pinId'] + "' eventid='" + eventId + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='teacherSession' value='" + id + "'><img src='/webresources/hub_/calendar/images/pin.png'/>" + value.name + "</span>";
                                } else {
                                    // temp unpin teacher
                                    if (value['tempPinId'] != undefined) {
                                        event[k].title = "<span class='draggable drag-teacher' tempPinId='" + value['tempPinId'] + "' eventid='" + eventId + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='teacherSession' value='" + id + "'><img style='transform:rotate(45deg);' src='/webresources/hub_/calendar/images/pin.png'/>" + value.name + "</span>";
                                    } else {
                                        event[k].title = "<span class='draggable drag-teacher' eventid='" + eventId + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='teacherSession' value='" + id + "'>" + value.name + "</span>";
                                    }
                                }
                            }
                            var studentList = event[k].students;
                            event[k].teachers = [{ id: id, name: name }];
                            wjQuery.each(studentList, function (ke, val) {
                                if (resourceObj.deliveryType == "Group Instruction") {
                                    event[k].title += "<span class='drag-student' eventid='" + eventId + "' uniqueId='" + val.id + "_" + value['resourceId'] + "_" + value['startHour'] + "' id='" + val.id + value['resourceId'] + "' type='studentSession' value='" + val.id + "'>" + val.name + ", " + val.grade + "<i class='material-icons' style='color:" + val['subjectColorCode'] + "'>location_on</i></span>";
                                } else {
                                    if (val['pinId']) {
                                        event[k].title += "<span class='draggable drag-student' pinnedId='" + val['pinId'] + "' eventid='" + eventId + "' uniqueId='" + val.id + "_" + value['resourceId'] + "_" + value['startHour'] + "' id='" + val.id + value['resourceId'] + "' type='studentSession' value='" + val.id + "'><img src='/webresources/hub_/calendar/images/pin.png'/>" + val.name + ", " + val.grade + "<i class='material-icons' style='color:" + val['subjectColorCode'] + "'>location_on</i></span>";
                                    } else {
                                        event[k].title += "<span class='draggable drag-student' eventid='" + eventId + "' uniqueId='" + val.id + "_" + value['resourceId'] + "_" + value['startHour'] + "' id='" + val.id + value['resourceId'] + "' type='studentSession' value='" + val.id + "'>" + val.name + ", " + val.grade + "<i class='material-icons' style='color:" + val['subjectColorCode'] + "'>location_on</i></span>";
                                    }
                                }
                            });
                        }
                        if (event[k].students != undefined) {
                            if (event[k].students.length < resourceObj["capacity"] || resourceObj["capacity"] == undefined) {
                                if (event[k].title.indexOf('<span class="student-placeholder-'+event[k].deliveryType+'">Student name</span>') == -1){
                                  event[k].title += '<span class="student-placeholder-'+event[k].deliveryType+'">Student name</span>';
                                  self.addContext("", 'studentPlaceholder', true, event[k].deliveryType);
                                }
                                // Conflict removal 
                                // Capacity conflict reamoval
                                var msgIndex = event[k].conflictMsg.map(function (y) {
                                    return y;
                                }).indexOf(1);
                                if (msgIndex > -1) {
                                    event[k].conflictMsg.splice(msgIndex, 1);
                                }
                                self.updateConflictMsg(event[k]);
                            } else if (event[k].students.length > resourceObj["capacity"]) {
                                var msgIndex = event[k].conflictMsg.map(function (z) {
                                    return z;
                                }).indexOf(1);
                                if (msgIndex == -1) {
                                    event[k].conflictMsg.push(1);
                                }
                                self.updateConflictMsg(event[k]);
                            }
                        }
                        if (event[k].title.indexOf('<span class="student-placeholder-'+event[k].deliveryType+'">Student name</span>') != -1) {
                            event[k].title = event[k].title.replace('<span class="student-placeholder-'+event[k].deliveryType+'"-'+event[k].deliveryType+'>Student name</span>', "");
                        }
                        if (event[k].hasOwnProperty("students")) {
                            if (resourceObj['capacity'] > event[k].students.length) {
                                if (event[k].title.indexOf('<span class="student-placeholder-'+event[k].deliveryType+'">Student name</span>') == -1) {
                                    event[k].title += '<span class="student-placeholder-'+event[k].deliveryType+'">Student name</span>';
                                    self.addContext("", 'studentPlaceholder', true, event[k].deliveryType);
                                }
                            }
                        } else {
                            if (event[k].title.indexOf('<span class="student-placeholder-'+event[k].deliveryType+'">Student name</span>') == -1) {
                                event[k].title += '<span class="student-placeholder-'+event[k].deliveryType+'">Student name</span>';
                                self.addContext("", 'studentPlaceholder', true, event[k].deliveryType);
                            }
                        }


                      if(resourceObj['deliveryType'] == "Personal Instruction"){
                        var eventIs1to1 = self.checkEventIsOneToOne(event[k]['students']); 
                        if(eventIs1to1){
                          event[k].is1to1 = true;
                        }

                        if(event[k].is1to1){
                          if(event[k].title.indexOf('<img class="onetoone" title="1:1 Session" src="/webresources/hub_/calendar/images/lock.png">') == -1){
                            event[k].title += '<img class="onetoone" title="1:1 Session" src="/webresources/hub_/calendar/images/lock.png">';
                          }
                        }

                        // Update one to one conflict check
                        if(event[k].is1to1 && event[k].hasOwnProperty('students') && event[k]['students'].length > 1){
                          var msgIndex = event[k].conflictMsg.map(function (x) {
                              return x;
                          }).indexOf(2);
                          if (msgIndex == -1) {
                              event[k].conflictMsg.push(2);
                          }
                          self.updateConflictMsg(event[k]);
                        }
                      }
                      
                      var isNonPreferred = self.checkNonPreferredTeacherConflict(event[k]);
                      if(isNonPreferred){
                        // non preferred teacher conflict check
                        var msgIndex = event[k].conflictMsg.map(function (x) {
                          return x;
                        }).indexOf(3);
                        if (msgIndex == -1) {
                          event[k].conflictMsg.push(3);
                          self.updateConflictMsg(event[k]);
                        }                      
                      }


                    });
                    self.calendar.fullCalendar('updateEvent', event);
                    if (value['pinId'] != undefined) {
                        self.addContext(uniqueId, 'teacher', true, "");
                    }
                    else {
                        self.addContext(uniqueId, 'teacher', false, "");
                    }
                } else {
                    var obj = {
                        id: value['resourceId']+value['startHour'],
                        teachers:[{id:id, name:name}],
                        start:value['startHour'],
                        //end:value['end'],
                        allDay: false,
                        resourceId: value['resourceId'],
                        isTeacher: true,
                        isConflict: false,
                        deliveryTypeId: resourceObj.deliveryTypeId,
                        deliveryType : resourceObj.deliveryType,
                        textColor:"#333333",
                        conflictMsg: []
                    }
                    if (value['pinId'] != undefined) {
                        obj.title = "<span class='draggable drag-teacher' pinnedId='" + value['pinId'] + "' eventid='" + eventId + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='teacherSession' value='" + id + "'><img src='/webresources/hub_/calendar/images/pin.png'/>" + name + "</span>";
                    } else {
                        // temp unpin teacher
                        if (value['tempPinId'] != undefined) {
                            obj.title = "<span class='draggable drag-teacher' tempPinId='" + value['tempPinId'] + "' eventid='" + eventId + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='teacherSession' value='" + id + "'><img style='transform:rotate(45deg);' src='/webresources/hub_/calendar/images/pin.png'/>" + name + "</span>";
                        } else {
                            obj.title = "<span class='draggable drag-teacher' eventid='" + eventId + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='teacherSession' value='" + id + "'>" + name + "</span>";
                        }
                    }

                    if (obj.deliveryType == "Group Facilitation") {
                        obj.backgroundColor = "#dff0d5";
                        obj.borderColor = "#7bc143";
                        obj.deliveryType = "Group-Facilitation";
                    } else if (obj.deliveryType == "Group Instruction") {
                        obj.backgroundColor = "#fedeb7";
                        obj.borderColor = "#f88e50";
                        obj.deliveryType = "Group-Instruction";
                    } else if (obj.deliveryType == "Personal Instruction") {
                        obj.backgroundColor = "#ebf5fb";
                        obj.borderColor = "#9acaea";
                        obj.deliveryType = "Personal-Instruction";
                    }

                    if(obj.deliveryType != undefined){
                      obj.title += '<span class="student-placeholder-'+obj.deliveryType+'">Student name</span>';
                      self.addContext("",'studentPlaceholder',true, obj.deliveryType);
                    }

                    if (value['pinId'] != undefined) {
                        self.addContext(uniqueId, 'teacher', true, "");
                    }
                    else {
                        self.addContext(uniqueId, 'teacher', false, "");
                    }
                    self.eventList.push(obj);
                    self.calendar.fullCalendar('refetchEvents');
                    if (isFromFilter) {
                        self.calendar.fullCalendar('removeEvents');
                        self.calendar.fullCalendar('removeEventSource');
                        self.calendar.fullCalendar('addEventSource', { events: self.eventList });
                    }
                }
                self.draggable('draggable');
            });
        }
        wjQuery(".loading").hide();
        this.showConflictMsg();
    }

    this.populateAffinityStudents = function (affinityList) {
        var self = this;
        var currentView = self.calendar.fullCalendar('getView');
        var affinityNotPlaceStudents = [];
        for (var i = 0; i < affinityList.length; i++) {
            var eventId = affinityList[i].resourceId + affinityList[i].startHour;
            var event = self.calendar.fullCalendar('clientEvents', eventId);
            if (event.length) {
                wjQuery.each(event, function (k, v) {
                    if (event[k].hasOwnProperty("students") && event[k]['students'].length != 0) {
                        var resourceObj = self.getResourceObj(affinityList[i].resourceId);
                        if (resourceObj.capacity > event[k]['students'].length) {
                            if (!event[k]['students'][0].is1to1 && !affinityList[i].is1to1) {
                                var obj = [];
                                obj.push(affinityList[i]);
                                var index = self.convertedStudentObj.findIndex(function (x) {
                                    return x.id == affinityList[i].id && x.enrollmentId == affinityList[i].enrollmentId &&
                                           x.startHour.getTime() == affinityList[i].startHour.getTime();
                                });
                                if (index == -1) {
                                    self.convertedStudentObj.push(affinityList[i]);
                                    if(currentView.name == 'resourceDay'){
                                        self.populateStudentEvent(obj, true, true);
                                    }
                                    else{
                                       self.generateWeekEventObject(obj,'studentSession'); 
                                    }
                                }
                                else{
                                    // if(self.convertedStudentObj[index].sessionStatus == INVALID_STATUS ||
                                    // self.convertedStudentObj[index].sessionStatus == UNEXCUSED_STATUS ||
                                    // self.convertedStudentObj[index].sessionStatus == OMIT_STATUS || 
                                    // self.convertedStudentObj[index].sessionStatus == EXCUSED_STATUS){
                                    // }
                                    // else{
                                    //     self.convertedStudentObj.push(affinityList[i]);
                                    //     self.populateStudentEvent(obj, true, true);
                                    // }
                                    affinityList.splice(i,1);
                                    i-=1;
                                }
                            }
                            else {
                                affinityNotPlaceStudents.push(affinityList[i]);
                            }
                        }
                        else {
                            affinityNotPlaceStudents.push(affinityList[i]);
                        }
                    }
                    else {
                        var obj = [];
                        obj.push(affinityList[i]);
                        var index = self.convertedStudentObj.findIndex(function (x) {
                            return x.id == affinityList[i].id && x.enrollmentId == affinityList[i].enrollmentId &&
                                   x.startHour.getTime() == affinityList[i].startHour.getTime();
                        });
                        if (index == -1) {
                            self.convertedStudentObj.push(affinityList[i]);
                            if(currentView.name == 'resourceDay'){
                                self.populateStudentEvent(obj, true, true);
                            }
                            else{
                               self.generateWeekEventObject(obj,'studentSession'); 
                            }
                        }
                        else{
                          // if(self.convertedStudentObj[index].sessionStatus == INVALID_STATUS ||
                          //      self.convertedStudentObj[index].sessionStatus == UNEXCUSED_STATUS ||
                          //      self.convertedStudentObj[index].sessionStatus == OMIT_STATUS || 
                          //      self.convertedStudentObj[index].sessionStatus == EXCUSED_STATUS){
                          // }
                          // else{
                          //     self.convertedStudentObj.push(affinityList[i]);
                          //     self.populateStudentEvent(obj, true, true);
                          // }
                          affinityList.splice(i,1);
                          i-=1;
                        }
                    }
                });
            }
            else {
                var obj = [];
                obj.push(affinityList[i]);
                var index = self.convertedStudentObj.findIndex(function (x) {
                    return x.id == affinityList[i].id &&
                           x.startHour.getTime() == affinityList[i].startHour.getTime();
                });
                if (index == -1) {
                    self.convertedStudentObj.push(affinityList[i]);
                    if(currentView.name == 'resourceDay'){
                        self.populateStudentEvent(obj, true, true);
                    }
                    else{
                       self.generateWeekEventObject(obj,'studentSession'); 
                    }
                }
                else{
                    // if(self.convertedStudentObj[index].sessionStatus == INVALID_STATUS||
                    //     self.convertedStudentObj[index].sessionStatus == UNEXCUSED_STATUS ||
                    //     self.convertedStudentObj[index].sessionStatus == OMIT_STATUS || 
                    //     self.convertedStudentObj[index].sessionStatus == EXCUSED_STATUS){
                    // }
                    // else{
                    //     self.convertedStudentObj.push(affinityList[i]);
                    //     self.populateStudentEvent(obj, true, true);
                    // }
                    affinityList.splice(i,1);
                    i-=1;
                }
            }
        }
        if (affinityNotPlaceStudents.length) {
            self.populateNoResourceStudent(affinityNotPlaceStudents);
        }
    }

    this.populateNoResourceStudent = function (studentList) {
        var studentsForSOF = [];
        var self = this;
        var currentView = self.calendar.fullCalendar('getView');
        for (var i = 0; i < studentList.length; i++) {
            var studentNotPlacedFlag = true;
            for (var j = 0; j < self.resourceList.length; j++) {
                if (studentList[i].deliveryType == self.resourceList[j].deliveryType) {
                    var eventId = self.resourceList[j].id + studentList[i].startHour;
                    var event = self.calendar.fullCalendar('clientEvents', eventId);
                    if (event.length) {
                        wjQuery.each(event, function (k, v) {
                            if (event[k].hasOwnProperty("students") && event[k]['students'].length != 0) {
                                var resourceObj = self.getResourceObj(self.resourceList[j].id);
                                if (resourceObj.capacity > event[k]['students'].length) {
                                    if (!event[k]['students'][0].is1to1 && !studentList[i].is1to1) {
                                        studentList[i].resourceId = self.resourceList[j].id;
                                        var obj = [];
                                        studentNotPlacedFlag = false;
                                        obj.push(studentList[i]);
                                        var index = self.convertedStudentObj.findIndex(function (x) {
                                            return x.id == studentList[i].id &&
                                                   x.startHour.getTime() == studentList[i].startHour.getTime();
                                        });
                                       if (index == -1) {
                                            self.convertedStudentObj.push(studentList[i]);
                                            if(currentView.name == 'resourceDay'){
                                                self.populateStudentEvent(obj, true, true);
                                            }
                                            else{
                                               self.generateWeekEventObject(obj,'studentSession'); 
                                            }
                                        }else{
                                          // if(self.convertedStudentObj[index].sessionStatus == INVALID_STATUS||
                                          //     self.convertedStudentObj[index].sessionStatus == UNEXCUSED_STATUS ||
                                          //     self.convertedStudentObj[index].sessionStatus == OMIT_STATUS || 
                                          //     self.convertedStudentObj[index].sessionStatus == EXCUSED_STATUS){
                                          // }
                                          // else{
                                          //     self.convertedStudentObj.push(studentList[i]);
                                          //     self.populateStudentEvent(obj, true, true);
                                          // }
                                          studentList.splice(i,1);
                                        }
                                    }
                                }
                            }
                            else {
                                studentList[i].resourceId = self.resourceList[j].id;
                                var obj = [];
                                studentNotPlacedFlag = false;
                                obj.push(studentList[i]);
                                var index = self.convertedStudentObj.findIndex(function (x) {
                                    return x.id == studentList[i].id &&
                                           x.startHour.getTime() == studentList[i].startHour.getTime();
                                });
                                if (index == -1) {
                                    self.convertedStudentObj.push(studentList[i]);
                                    if(currentView.name == 'resourceDay'){
                                        self.populateStudentEvent(obj, true, true);
                                    }
                                    else{
                                       self.generateWeekEventObject(obj,'studentSession'); 
                                    }
                                }
                                else{
                                    // if(self.convertedStudentObj[index].sessionStatus == INVALID_STATUS||
                                    //     self.convertedStudentObj[index].sessionStatus == UNEXCUSED_STATUS ||
                                    //     self.convertedStudentObj[index].sessionStatus == OMIT_STATUS || 
                                    //     self.convertedStudentObj[index].sessionStatus == EXCUSED_STATUS){
                                    // }
                                    // else{
                                    //     self.convertedStudentObj.push(studentList[i]);
                                    //     self.populateStudentEvent(obj, true, true);
                                    // }
                                    studentList.splice(i,1);
                                }
                            }
                        });
                    }
                    else {
                        studentList[i].resourceId = self.resourceList[j].id;
                        var obj = [];
                        studentNotPlacedFlag = false;
                        obj.push(studentList[i]);
                        var index = self.convertedStudentObj.findIndex(function (x) {
                            return x.id == studentList[i].id &&
                                   x.startHour.getTime() == studentList[i].startHour.getTime();
                        });
                        if (index == -1) {
                            self.convertedStudentObj.push(studentList[i]);
                            if(currentView.name == 'resourceDay'){
                                self.populateStudentEvent(obj, true, true);
                            }
                            else{
                               self.generateWeekEventObject(obj,'studentSession'); 
                            }
                        }
                        else{
                            // if(self.convertedStudentObj[index].sessionStatus == INVALID_STATUS ||
                            //     self.convertedStudentObj[index].sessionStatus == UNEXCUSED_STATUS ||
                            //     self.convertedStudentObj[index].sessionStatus == OMIT_STATUS || 
                            //     self.convertedStudentObj[index].sessionStatus == EXCUSED_STATUS){
                            // }
                            // else{
                            //     self.convertedStudentObj.push(studentList[i]);
                            //     self.populateStudentEvent(obj, true, true);
                            // }
                            studentList.splice(i,1);
                        }
                    }
                }
                if (!studentNotPlacedFlag) {
                    break;
                }
            }
            if (studentNotPlacedFlag) {
                var index = self.convertedStudentObj.findIndex(function (x) {
                    return x.id == studentList[i].id &&
                           x.startHour.getTime() == studentList[i].startHour.getTime();
                });
                if (index == -1) {
                    studentsForSOF.push(studentList[i]);
                }
                else{
                    // if(self.convertedStudentObj[index].sessionStatus == INVALID_STATUS||
                    //     self.convertedStudentObj[index].sessionStatus == UNEXCUSED_STATUS ||
                    //     self.convertedStudentObj[index].sessionStatus == OMIT_STATUS || 
                    //     self.convertedStudentObj[index].sessionStatus == EXCUSED_STATUS){
                    // }
                    // else{
                    //     studentsForSOF.push(studentList[i]);
                    // }
                    studentList.splice(i,1);
                }
            }
        }
        if (studentsForSOF.length) {
            for (var i = 0; i < studentsForSOF.length; i++) {
                self.pushStudentToSOF(studentsForSOF[i]);
            }
        }
        setTimeout(function () {
            if (self.sofList['Personal Instruction'].length > 0 || self.sofList['Group Instruction'].length > 0 || self.sofList['Group Facilitation'].length > 0) {
                self.populateSOFPane(self.sofList, self.calendarOptions.minTime, self.calendarOptions.maxTime);
            }
        }, 300);
    }

    this.populateByService = function (serviceStudentList) {
        var self = this;
        var studentsForSOF = [];
        var currentView = self.calendar.fullCalendar('getView');
        for (var i = 0; i < Object.keys(serviceStudentList).length; i++) {
            var studentNotPlacedFlag = true;
            for (var j = 0; j < self.resourceList.length; j++) {
                if (serviceStudentList[Object.keys(serviceStudentList)[i]][0].deliveryType == self.resourceList[j].deliveryType) {
                    var eventId = self.resourceList[j].id + serviceStudentList[Object.keys(serviceStudentList)[i]][0].startHour;
                    var event = self.calendar.fullCalendar('clientEvents', eventId);
                    if (event.length) {
                        studentNotPlacedFlag = true;
                    }
                    else {
                        for(var k=0; k<serviceStudentList[Object.keys(serviceStudentList)[i]].length; k++ ){
                            var e = serviceStudentList[Object.keys(serviceStudentList)[i]][k];
                            e['resourceId'] = self.resourceList[j].id;
                            var index = self.convertedStudentObj.findIndex(function (x) {
                            return x.id == e.id &&
                                   x.startHour.getTime() == e.startHour.getTime();
                            });
                            if (index == -1) {
                                self.convertedStudentObj.push(e);
                            }
                            else{
                                // if(self.convertedStudentObj[index].sessionStatus == INVALID_STATUS||
                                // self.convertedStudentObj[index].sessionStatus == UNEXCUSED_STATUS ||
                                // self.convertedStudentObj[index].sessionStatus == OMIT_STATUS || 
                                // self.convertedStudentObj[index].sessionStatus == EXCUSED_STATUS){
                                // }
                                // else{
                                //     self.convertedStudentObj.push(e);
                                // }
                                serviceStudentList[Object.keys(serviceStudentList)[i]].splice(k,1);
                                k -= 1;
                            }
                        }
                        studentNotPlacedFlag = false;
                        if(currentView.name == 'resourceDay'){
                            self.populateStudentEvent(serviceStudentList[Object.keys(serviceStudentList)[i]], true, true);
                        }
                        else{
                           self.generateWeekEventObject(serviceStudentList[Object.keys(serviceStudentList)[i]],'studentSession'); 
                        }
                        break;
                    }
                }
            }
            if (studentNotPlacedFlag) {
              for(var l=0; l<serviceStudentList[Object.keys(serviceStudentList)[i]].length; l++ ){
                var student = serviceStudentList[Object.keys(serviceStudentList)[i]][l];
                var index = self.convertedStudentObj.findIndex(function (x) {
                    return x.id == student.id && x.enrollmentId  == student.enrollmentId &&
                           x.startHour.getTime() == student.startHour.getTime();
                });
                if (index == -1) {
                    studentsForSOF.push(student);
                }
                else{
                    // if(self.convertedStudentObj[index].sessionStatus == INVALID_STATUS||
                    //     self.convertedStudentObj[index].sessionStatus == UNEXCUSED_STATUS ||
                    //     self.convertedStudentObj[index].sessionStatus == OMIT_STATUS || 
                    //     self.convertedStudentObj[index].sessionStatus == EXCUSED_STATUS){

                    // }
                    // else{
                    //     studentsForSOF.push(student);
                    // }
                }
              }
            }
        }
        if (studentsForSOF.length) {
            for (var i = 0; i < studentsForSOF.length; i++) {
                self.pushStudentToSOF(studentsForSOF[i]);
            }
        }
        setTimeout(function () {
            if (self.sofList['Personal Instruction'].length > 0 || self.sofList['Group Instruction'].length > 0 || self.sofList['Group Facilitation'].length > 0) {
                self.populateSOFPane(self.sofList, self.calendarOptions.minTime, self.calendarOptions.maxTime);
                self.openSofPane();
            }
        }, 300);
    }


    this.pushStudentToSOF = function (data) {
        var currentView = this.calendar.fullCalendar('getView');
        if(currentView.name == 'resourceDay'){
            if (Object.keys(this.sofList).length == 0) {
                this.sofList['Personal Instruction'] = [];
                this.sofList['Group Instruction'] = [];
                this.sofList['Group Facilitation'] = [];
            }
            var studentPushFlagDecision = true;
            //Methos to find the student having a slot on the same time before Pushing
            //the student to SOF pane
            /*for (var j = 0; j < this.resourceList.length; j++) {
                var eventId = this.resourceList[j].id + data.startHour;
                var event = this.calendar.fullCalendar('clientEvents', eventId);
                if(event.length){
                    wjQuery.each(event, function (k, v) {
                        if (event[k].hasOwnProperty("students") && event[k]['students'].length != 0) {
                            for (var i = 0; i < event[k]['students'].length; i++) {
                                if(event[k]['students'][i].id == data.id){
                                    studentPushFlagDecision = false;
                                }
                            }
                        }
                    });
                }
            }*/
            var currentCalendarDate = this.calendar.fullCalendar('getDate');
            var dateFlag = moment(currentCalendarDate).format("YYYY-MM-DD") == moment(data.startHour).format("YYYY-MM-DD");
            if(studentPushFlagDecision && dateFlag){
                if (data.deliveryType == "Personal Instruction") {
                    var index = this.sofList['Personal Instruction'].findIndex(function (x) {
                        return x.id == data.id &&
                               x.startHour.getTime() == data.startHour.getTime();
                    });
                    if (index == -1) {
                        this.sofList['Personal Instruction'].push(data);
                    }
                } else if (data.deliveryType == "Group Instruction") {
                    var index = this.sofList['Group Instruction'].findIndex(function (x) {
                        return x.id == data.id &&
                               x.startHour.getTime() == data.startHour.getTime();
                    });
                    if (index == -1) {
                        this.sofList['Group Instruction'].push(data);
                    }
                } else if (data.deliveryType == "Group Facilitation") {
                    var index = this.sofList['Group Facilitation'].findIndex(function (x) {
                        return x.id == data.id &&
                               x.startHour.getTime() == data.startHour.getTime();
                    });
                    if (index == -1) {
                        this.sofList['Group Facilitation'].push(data);
                    }
                }
            }
        }
        else if(currentView.name == 'agendaWeek'){
            this.generateWeekEventObject([data],'studentSession');
        }
    };

    this.populateStudentEvent = function (studentList, isFromFilter, checkFor1to1) {
        wjQuery(".loading").show();
        checkFor1to1 = checkFor1to1 != undefined;
        var self = this;
        if (studentList.length) {
            wjQuery.each(studentList, function (key, value) {
                if(value['sessionStatus'] == SCHEDULE_STATUS || 
                   value['sessionStatus'] == RESCHEDULE_STATUS ||
                   value['sessionStatus'] == MAKEUP_STATUS ||  value['isFromMasterSchedule']){
                    var id = value['id'];
                    var name = value['name'];
                    var grade = value['grade'];
                    var subjectId = value['subjectId'];
                    var serviceId = value['serviceId'];
                    var subjectName = value['subject'];
                    var programId = value['programId'];
                    var is1to1 = value['is1to1'];
                    var eventId = value['resourceId'] + value['startHour'];
                    var uniqueId = id + "_" + value['resourceId'] + "_" + value['startHour'];
                    var event = self.calendar.fullCalendar('clientEvents', eventId);
                    var resourceObj = self.getResourceObj(value['resourceId']);
                    if (event.length) {
                        wjQuery.each(event, function (k, v) {
                            if (event[k].hasOwnProperty("students") && event[k]['students'].length != 0) {
                                if (checkFor1to1 && ((is1to1 || event[k].students[0].is1to1) && event[k].students[0].id != id)) {
                                    self.pushStudentToSOF(value);
                                }
                                else {
                                    index = event[k].students.map(function (x) {
                                        return x.id;
                                    }).indexOf(id);
                                    if (index == -1) {
                                        if (resourceObj.deliveryType == "Group Instruction") {
                                            if (value['pinId'] != undefined) {
                                                event[k].title += "<span class='drag-student' eventid='" + eventId + "' pinnedId='" + value['pinId'] + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='studentSession' value='" + id + "'><img src='/webresources/hub_/calendar/images/pin.png'/>" + name + ", " + grade + "<i class='material-icons' style='color:" + value['subjectColorCode'] + "'>location_on</i></span>";
                                            } else {
                                                // temp unpin student
                                                if (value['tempPinId'] != undefined) {
                                                    event[k].title += "<span class='drag-student' eventid='" + eventId + "' tempPinId='" + value['tempPinId'] + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='studentSession' value='" + id + "'><img style='transform:rotate(45deg);' src='/webresources/hub_/calendar/images/pin.png'/>" + name + ", " + grade + "<i class='material-icons' style='color:" + value['subjectColorCode'] + "'>location_on</i></span>";
                                                } else {
                                                    event[k].title += "<span class='drag-student' eventid='" + eventId + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='studentSession' value='" + id + "'>" + name + ", " + grade + "<i class='material-icons' style='color:" + value['subjectColorCode'] + "'>location_on</i></span>";
                                                }
                                            }
                                        } else {
                                            if (value['pinId'] != undefined) {
                                                event[k].title += "<span class='draggable drag-student' eventid='" + eventId + "' pinnedId='" + value['pinId'] + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='studentSession' value='" + id + "'><img src='/webresources/hub_/calendar/images/pin.png'/>" + name + ", " + grade + "<i class='material-icons' style='color:" + value['subjectColorCode'] + "'>location_on</i></span>";
                                            } else {
                                                // temp unpin student
                                                if (value['tempPinId'] != undefined) {
                                                    event[k].title += "<span class='draggable drag-student' eventid='" + eventId + "' tempPinId='" + value['tempPinId'] + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='studentSession' value='" + id + "'><img style='transform:rotate(45deg);' src='/webresources/hub_/calendar/images/pin.png'/>" + name + ", " + grade + "<i class='material-icons' style='color:" + value['subjectColorCode'] + "'>location_on</i></span>";
                                                } else {
                                                    event[k].title += "<span class='draggable drag-student' eventid='" + eventId + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='studentSession' value='" + id + "'>" + name + ", " + grade + "<i class='material-icons' style='color:" + value['subjectColorCode'] + "'>location_on</i></span>";
                                                }
                                            }
                                        }
                                        event[k].students.push({  
                                            id: id, 
                                            subjectColorCode: value['subjectColorCode'], 
                                            name: name, 
                                            is1to1: is1to1, 
                                            pinId: value['pinId'], 
                                            grade: grade, 
                                            serviceId: serviceId, 
                                            programId: programId ,
                                            nonPreferredTeacher:value['nonPreferredTeacher']
                                        });
                                    }
                                }
                            } else {
                                if (resourceObj.deliveryType == "Group Instruction") {
                                    if (value['pinId'] != undefined) {
                                        event[k].title += "<span class='drag-student' eventid='" + eventId + "' pinnedId='" + value['pinId'] + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='studentSession' value='" + id + "'><img src='/webresources/hub_/calendar/images/pin.png'/>" + name + ", " + grade + "<i class='material-icons' style='color:" + value['subjectColorCode'] + "'>location_on</i></span>";
                                    } else {
                                        // temp unpin student
                                        if (value['tempPinId'] != undefined) {
                                            event[k].title += "<span class='drag-student' eventid='" + eventId + "' tempPinId='" + value['tempPinId'] + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='studentSession' value='" + id + "'><img style='transform:rotate(45deg);' src='/webresources/hub_/calendar/images/pin.png'/>" + name + ", " + grade + "<i class='material-icons' style='color:" + value['subjectColorCode'] + "'>location_on</i></span>";
                                        } else {
                                            event[k].title += "<span class='drag-student' eventid='" + eventId + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='studentSession' value='" + id + "'>" + name + ", " + grade + "<i class='material-icons' style='color:" + value['subjectColorCode'] + "'>location_on</i></span>";
                                        }
                                    }
                                } else {
                                    if (value['pinId'] != undefined) {
                                        event[k].title += "<span class='draggable drag-student' eventid='" + eventId + "' pinnedId='" + value['pinId'] + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='studentSession' value='" + id + "'><img src='/webresources/hub_/calendar/images/pin.png'/>" + name + ", " + grade + "<i class='material-icons' style='color:" + value['subjectColorCode'] + "'>location_on</i></span>";
                                    } else {
                                        // temp unpin student
                                        if (value['tempPinId'] != undefined) {
                                            event[k].title += "<span class='draggable drag-student' eventid='" + eventId + "' tempPinId='" + value['tempPinId'] + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='studentSession' value='" + id + "'><img style='transform:rotate(45deg);' src='/webresources/hub_/calendar/images/pin.png'/>" + name + ", " + grade + "<i class='material-icons' style='color:" + value['subjectColorCode'] + "'>location_on</i></span>";
                                        } else {
                                            event[k].title += "<span class='draggable drag-student' eventid='" + eventId + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='studentSession' value='" + id + "'>" + name + ", " + grade + "<i class='material-icons' style='color:" + value['subjectColorCode'] + "'>location_on</i></span>";
                                        }
                                    }
                                }
                                event[k].students = [{  
                                    id: id, 
                                    name: name, 
                                    grade: grade, 
                                    pinId: value['pinId'], 
                                    subjectColorCode: value['subjectColorCode'], 
                                    is1to1: is1to1, 
                                    serviceId: serviceId, 
                                    programId: programId,
                                    nonPreferredTeacher:value['nonPreferredTeacher'] 
                                }];
                                event[k].is1to1 =  value['is1to1'];
                            }
                            if (event[k].title.indexOf('<span class="student-placeholder-'+event[k].deliveryType+'">Student name</span>') != -1) {
                                event[k].title = event[k].title.replace('<span class="student-placeholder-'+event[k].deliveryType+'">Student name</span>', '');
                            }
                            if (event[k].students.length < resourceObj["capacity"] || resourceObj["capacity"] == undefined) {
                                event[k].title += '<span class="student-placeholder-'+event[k].deliveryType+'">Student name</span>';
                                self.addContext("", 'studentPlaceholder', true, event[k].deliveryType);
                                // Conflict removal
                                // capacity conflict removal
                                var msgIndex = event[k].conflictMsg.map(function (x) {
                                    return x;
                                }).indexOf(1);
                                if (msgIndex > -1) {
                                    event[k].conflictMsg.splice(msgIndex, 1);
                                }
                                self.updateConflictMsg(event[k]);
                            } else if (event[k].students.length > resourceObj["capacity"]) {
                                var msgIndex = event[k].conflictMsg.map(function (x) {
                                    return x;
                                }).indexOf(1);
                                if (msgIndex == -1) {
                                    event[k].conflictMsg.push(1);
                                }
                                self.updateConflictMsg(event[k]);
                            }

                            // One To one conflict check and icon show Logic for exist event 
                            if(value.is1to1){
                              event[k].is1to1 = value.is1to1;
                            }else{
                              var eventIs1to1 = self.checkEventIsOneToOne(event[k]['students']);
                              if(eventIs1to1){
                                event[k].is1to1 = true;
                              }else{
                                event[k].is1to1 = false;
                              }
                            }
                            
                            // One to one type lock and conflict ico is only for PI DT
                            if(resourceObj.deliveryType == "Personal Instruction"){
                              if(event[k].is1to1 == true || value.is1to1 == true){
                                if(event[k].title.indexOf('<img class="onetoone" title="1:1 Session" src="/webresources/hub_/calendar/images/lock.png">') == -1){
                                  event[k].title += '<img class="onetoone" title="1:1 Session" src="/webresources/hub_/calendar/images/lock.png">';
                                }
                              }
                              
                              if(event[k].is1to1 && event[k].hasOwnProperty('students') && event[k]['students'].length > 1){
                                var msgIndex = event[k].conflictMsg.map(function (x) {
                                    return x;
                                }).indexOf(2);
                                if (msgIndex == -1) {
                                    event[k].conflictMsg.push(2);
                                }
                                self.updateConflictMsg(event[k]);
                              }
                            }

                            var isNonPreferred = self.checkNonPreferredTeacherConflict(event[k]);
                            if(isNonPreferred){
                              // non preferred teacher conflict check
                              var msgIndex = event[k].conflictMsg.map(function (x) {
                                return x;
                              }).indexOf(3);
                              if (msgIndex == -1) {
                                event[k].conflictMsg.push(3);
                                self.updateConflictMsg(event[k]);
                              }                      
                            }

                        });
                        // if (value['deliveryType'] != "Group Instruction" ) {
                            if (value['pinId'] != undefined) {
                                self.addContext(uniqueId, 'student', true, value['deliveryType'], value['sessionStatus']);
                            }
                            else {
                                self.addContext(uniqueId, 'student', false, value['deliveryType'], value['sessionStatus']);
                            }
                        // }
                        self.calendar.fullCalendar('updateEvent', event);
                    } else {
                        var obj = {
                            id: eventId,
                            students: [{  
                                id: id, 
                                name: name, 
                                subjectColorCode: value['subjectColorCode'], 
                                grade: grade, 
                                is1to1: is1to1,
                                pinId: value['pinId'], 
                                serviceId: serviceId, 
                                programId: programId,
                                nonPreferredTeacher: value['nonPreferredTeacher']
                            }],
                            start: value['startHour'],
                            //end:value['end'],
                            allDay: false,
                            resourceId: value['resourceId'],
                            isTeacher: false,
                            is1to1: value['is1to1'],
                            isConflict: false,
                            textColor: "#333333",
                            conflictMsg: []
                        }
                        obj.title = "";

                        // Display one to one icon only for PI DT
                        if(resourceObj.deliveryType == "Personal Instruction"){
                          if (value['is1to1']) {
                              obj.title += '<img class="onetoone" title="1:1 Session" src="/webresources/hub_/calendar/images/lock.png">';
                          }
                        }

                        obj.title += "<span class='placeholder'>Teacher name</span>";
                        if (resourceObj.deliveryType == "Group Instruction") {
                            if (value['pinId'] != undefined) {
                                obj.title += "<span class='drag-student' eventid='" + eventId + "' pinnedId='" + value['pinId'] + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='studentSession' value='" + id + "'><img src='/webresources/hub_/calendar/images/pin.png'/>" + name + ", " + grade + "<i class='material-icons' style='color:" + value['subjectColorCode'] + "'>location_on</i></span>";
                            } else {
                                // temp unpin student
                                if (value['tempPinId'] != undefined) {
                                    obj.title += "<span class='drag-student' eventid='" + eventId + "' tempPinId='" + value['tempPinId'] + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='studentSession' value='" + id + "'><img style='transform:rotate(45deg);' src='/webresources/hub_/calendar/images/pin.png'/>" + name + ", " + grade + "<i class='material-icons' style='color:" + value['subjectColorCode'] + "'>location_on</i></span>";
                                } else {
                                    obj.title += "<span class='drag-student' eventid='" + eventId + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='studentSession' value='" + id + "'>" + name + ", " + grade + "<i class='material-icons' style='color:" + value['subjectColorCode'] + "'>location_on</i></span>";
                                }
                            }
                        } else {
                            if (value['pinId'] != undefined) {
                                obj.title += "<span class='draggable drag-student' eventid='" + eventId + "' pinnedId='" + value['pinId'] + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='studentSession' value='" + id + "'><img src='/webresources/hub_/calendar/images/pin.png'/>" + name + ", " + grade + "<i class='material-icons' style='color:" + value['subjectColorCode'] + "'>location_on</i></span>";
                            } else {
                                // temp unpin student
                                if (value['tempPinId'] != undefined) {
                                    obj.title += "<span class='draggable drag-student' eventid='" + eventId + "' tempPinId='" + value['tempPinId'] + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='studentSession' value='" + id + "'><img style='transform:rotate(45deg);' src='/webresources/hub_/calendar/images/pin.png'/>" + name + ", " + grade + "<i class='material-icons' style='color:" + value['subjectColorCode'] + "'>location_on</i></span>";
                                } else {
                                    obj.title += "<span class='draggable drag-student' eventid='" + eventId + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='studentSession' value='" + id + "'>" + name + ", " + grade + "<i class='material-icons' style='color:" + value['subjectColorCode'] + "'>location_on</i></span>";
                                }
                            }
                        }
                        if (resourceObj.deliveryType == "Group Facilitation") {
                            obj.backgroundColor = "#dff0d5";
                            obj.borderColor = "#7bc143";
                            obj.deliveryType = "Group-Facilitation";
                        } else if (resourceObj.deliveryType == "Group Instruction") {
                            obj.backgroundColor = "#fedeb7";
                            obj.borderColor = "#f88e50";
                            obj.deliveryType = "Group-Instruction";
                        } else if (resourceObj.deliveryType == "Personal Instruction") {
                            obj.backgroundColor = "#ebf5fb";
                            obj.borderColor = "#9acaea";
                            obj.deliveryType = "Personal-Instruction";
                        }

                        if (resourceObj["capacity"] > 1 && obj.deliveryType != undefined) {
                            obj.title += '<span class="student-placeholder-'+obj.deliveryType+'">Student name</span>';
                            self.addContext("", 'studentPlaceholder', true, obj.deliveryType);
                        }
                        // if (value['deliveryType'] != "Group Instruction") {
                            if (value['pinId'] != undefined) {
                                self.addContext(uniqueId, 'student', true, value['deliveryType'], value['sessionStatus']);
                            }
                            else {
                                self.addContext(uniqueId, 'student', false, value['deliveryType'], value['sessionStatus']);
                            }
                        // }
                        self.eventList.push(obj);
                        if (isFromFilter) {
                            self.calendar.fullCalendar('removeEvents');
                            self.calendar.fullCalendar('removeEventSource');
                            self.calendar.fullCalendar('addEventSource', { events: self.eventList });
                        }
                        self.calendar.fullCalendar('refetchEvents');
                    }
                    self.draggable('draggable');
                }
            });
        }
        wjQuery(".loading").hide();
        // Open Sof pane condition writen in below function 
        this.openSofPane();
        this.showConflictMsg();
    }

    this.openSofPane = function () {
        var closeSofPane = false;
        if (Object.keys(this.sofList).length == 0) {
            this.sofList['Personal Instruction'] = [];
            this.sofList['Group Facilitation'] = [];
            this.sofList['Group Instruction'] = [];
        }
        if (this.selectedDeliveryType.length == 1) {
            if (this.getDeliveryTypeVal(this.selectedDeliveryType[0]) == "Personal Instruction") {
                if (this.sofList['Personal Instruction'].length == 0) {
                    closeSofPane = true;
                }
            }
        } else if (this.selectedDeliveryType.length == 2) {
            if (this.sofList['Group Facilitation'].length == 0) {
                closeSofPane = true;
            }
        } else {
            if (this.sofList['Personal Instruction'].length == 0) {
                wjQuery(".sof-gf").css("width", "calc(100% - 10px)");
            } else if (this.sofList['Group Facilitation'].length == 0) {
                wjQuery(".sof-pi").css("width", "calc(100% - 10px)");
            }
            if (this.sofList['Personal Instruction'].length == 0 && this.sofList['Group Facilitation'].length == 0 && this.sofList['Group Instruction'].length == 0) {
                closeSofPane = true;
            }
        }

        if (closeSofPane) {
            if (sofExpanded) {
                this.sofPane();
            }
            // wjQuery('.sof-btn, .sof-close-icon').unbind('click');
            wjQuery(".sof-btn").removeClass('overflow-info');
            wjQuery('.sof-btn,.sof-close-icon').prop('title', "There are no student in overflow pane");
        } else {
            /*if(!sofExpanded){
              this.sofPane();
            }*/
            wjQuery(".sof-btn").removeClass('overflow-info');
            wjQuery(".sof-btn").addClass('overflow-info');
            wjQuery('.sof-btn,.sof-close-icon').prop('title', "There are students in overflow pane");
        }
    }

    this.filterItems = function (obj, filterTerm, filterFor) {
        var self = this;
        if (filterFor == "tapane") {
            return obj.filter(function (el) {
                if (el.subject == undefined || el.subject == null) {
                  el.subject = "";
                }
                if ((el['subjects'].indexOf(parseInt(filterTerm)) != -1)) {
                  return el;
                }
            });
        } else if (filterFor == "sofpane") {
            return obj.filter(function (el) {
                if (el.subject == undefined || el.subject == null) {
                  el.subject = "";
                }
                if ((el.id == filterTerm || el.gradeId == filterTerm || el.subject.toLowerCase() == filterTerm.toLowerCase()) && self.selectedDeliveryType.indexOf(el['deliveryTypeId']) != -1) {
                  return el;
                }
            });
        } else {
            return obj.filter(function (el) {
                if (el.subject == undefined || el.subject == null) {
                  el.subject = ""
                }
                if ((el.id == filterTerm || el.gradeId == filterTerm || el.subject.toLowerCase() == filterTerm.toLowerCase()) && self.selectedDeliveryType.indexOf(el['deliveryTypeId']) != -1) {
                    return el;
                }
            });
        }
    }

    this.pinStudent = function (element) {
        wjQuery('.loading').show();
        var self = this;
        var id = wjQuery(element).attr('value');
        var uniqueId = wjQuery(element).attr('uniqueId');
        var startTime = uniqueId.split('_')[2];
        var today = self.calendar.fullCalendar('getDate');
        var student = self.convertedStudentObj.filter(function (x) {
            return x.id == id &&
                   x.resourceId == uniqueId.split('_')[1];
        });
        var objPinnedStudent = {};
        if (student != undefined) {
            wjQuery('.loading').show();
            objPinnedStudent['hub_center@odata.bind'] = student[0].locationId;
            objPinnedStudent['hub_enrollment@odata.bind'] = student[0].enrollmentId;
            objPinnedStudent['hub_service@odata.bind'] = student[0].serviceId;
            objPinnedStudent['hub_student@odata.bind'] = id;
            objPinnedStudent['hub_resourceid@odata.bind'] = student[0].resourceId;
            if (self.convertedPinnedList.length) {
                var isPinned = self.convertedPinnedList.filter(function (x) {
                    return ((x.studentId == id &&
                            x.resourceId == student[0].resourceId &&
                            x.dayId == self.getDayValue(startTime) &&
                            x.startTime == moment(startTime).format("h:mm A")) ||
                            (x.studentId == id &&
                            x.affinityResourceId == student[0].resourceId &&
                            x.dayId == self.getDayValue(startTime) &&
                            x.startTime == moment(startTime).format("h:mm A")))
                });
                if (isPinned[0] != undefined) {
                    objPinnedStudent.hub_sch_pinned_students_teachersid = isPinned[0].id;
                }
            }
        }
        objPinnedStudent.hub_start_time = self.convertToMinutes(moment(startTime).format("h:mm A"));
        objPinnedStudent.hub_end_time = objPinnedStudent.hub_start_time + 60;
        objPinnedStudent.hub_day = self.getDayValue(today);
        objPinnedStudent.hub_session_date = moment(today).format("YYYY-MM-DD");
        var responseObj = data.savePinStudent(objPinnedStudent);
        wjQuery('.loading').hide();
        if (typeof (responseObj) == 'boolean') {
            if (responseObj) {
                var txt = wjQuery(element)[0].innerHTML;
                wjQuery(element).html("<img src='/webresources/hub_/calendar/images/pin.png'/>" + txt);
                wjQuery(element).attr('pinnedId', objPinnedStudent.hub_sch_pinned_students_teachersid);
            }
        }
        else if (typeof (responseObj) == 'object') {
            if (responseObj != undefined) {

                //self.convertPinnedData(responseObj, true);
                var txt = wjQuery(element)[0].innerHTML;
                wjQuery(element).html("<img src='/webresources/hub_/calendar/images/pin.png'/>" + txt);
                wjQuery(element).attr('pinnedId', responseObj['hub_pinned_student_teacher_id']);
            }
        }
        wjQuery('.loading').hide();
    };

    this.unPinStudent = function (element) {
        var id = wjQuery(element).attr('value');
        var uniqueId = wjQuery(element).attr('uniqueId');
        var startTime = uniqueId.split('_')[2];
        var today = this.calendar.fullCalendar('getDate');
        var student = this.convertedStudentObj.filter(function (x) {
            return x.id == id &&
                   x.resourceId == uniqueId.split('_')[1] &&
                   moment(x.startHour).format("h:mm A") == moment(startTime).format("h:mm A");
        });

        var objUnPinnedStudent = {};
        wjQuery('.loading').show();
        if (student != undefined) {
            objUnPinnedStudent['hub_center@odata.bind'] = student[0].locationId;
            objUnPinnedStudent['hub_enrollment@odata.bind'] = student[0].enrollmentId;
            objUnPinnedStudent['hub_service@odata.bind'] = student[0].serviceId;
            objUnPinnedStudent['hub_student@odata.bind'] = id;
            objUnPinnedStudent['hub_resourceid@odata.bind'] = student[0].resourceId;
        }
        objUnPinnedStudent.hub_start_time = this.convertToMinutes(moment(startTime).format("h:mm A"));
        objUnPinnedStudent.hub_end_time = objUnPinnedStudent.hub_start_time + 60;
        objUnPinnedStudent.hub_day = this.getDayValue(today);
        objUnPinnedStudent.hub_session_date = moment(today).format("YYYY-MM-DD");
        objUnPinnedStudent.hub_sch_pinned_students_teachersid = wjQuery(element).attr('pinnedId');
        if (data.saveUnPinStudent(objUnPinnedStudent)) {
            wjQuery(element).removeAttr('pinnedId')
            wjQuery(element).find("img").remove();
            wjQuery('.loading').hide();
        }
    };

    this.pinTeacher = function (element, pinFor) {
        var id = wjQuery(element).attr('value');
        var uniqueId = wjQuery(element).attr('uniqueId');
        var uniqueIds = wjQuery(element).attr('uniqueId').split('_');
        var startTime = uniqueId.split('_')[2];
        var today = this.calendar.fullCalendar('getDate');
        var teacher = this.convertedTeacherObj.filter(function (x) {
            return x.id == uniqueIds[0] &&
                   x.resourceId == uniqueIds[1] &&
                   x.startHour.getTime() == new Date(uniqueIds[2]).getTime();
        });
        wjQuery('.loading').show();
        var objPinnedStaff = {};
        if (teacher != undefined) {
            objPinnedStaff['hub_center@odata.bind'] = teacher[0].locationId;
            objPinnedStaff['hub_teacher@odata.bind'] = id;
            objPinnedStaff.hub_day = this.getDayValue(today);
            objPinnedStaff.hub_date = moment(today).format("YYYY-MM-DD");
            if (pinFor == 'time') {
                objPinnedStaff['hub_resourceid@odata.bind'] = null;
                objPinnedStaff.hub_start_time = this.convertToMinutes(moment(startTime).format("h:mm A"));
                objPinnedStaff.hub_end_time = objPinnedStaff.hub_start_time + 60;
            }
            else {
                objPinnedStaff['hub_resourceid@odata.bind'] = teacher[0].resourceId;
                objPinnedStaff.hub_start_time = null;
                objPinnedStaff.hub_end_time = null;
            }
            var responseObj = data.savePinTeacher(objPinnedStaff);
            wjQuery('.loading').hide();
            if (responseObj != undefined) {
                var txt = wjQuery(element).text();
                wjQuery(element).html("<img src='/webresources/hub_/calendar/images/pin.png'/>" + txt);
                wjQuery(element).attr('pinnedId', responseObj['hub_pinned_student_teacher_id']);
            }
        }
    };

    this.unPinTeacher = function (element) {
        var id = wjQuery(element).attr('value');
        var uniqueId = wjQuery(element).attr('uniqueId');
        var uniqueIds = wjQuery(element).attr('uniqueId').split('_');
        var startTime = uniqueId.split('_')[2];
        var today = this.calendar.fullCalendar('getDate');
        var teacher = this.convertedTeacherObj.filter(function (x) {
            return x.id == uniqueIds[0] &&
                   x.resourceId == uniqueIds[1] &&
                   x.startHour.getTime() == new Date(uniqueIds[2]).getTime();
        });
        wjQuery('.loading').show();
        var objUnPinnedStaff = {};
        if (teacher != undefined) {
            objUnPinnedStaff['hub_center@odata.bind'] = teacher[0].locationId;
            objUnPinnedStaff['hub_teacher@odata.bind'] = id;
            objUnPinnedStaff.hub_sch_pinned_students_teachersid = wjQuery(element).attr('pinnedId');
            objUnPinnedStaff.hub_day = this.getDayValue(today);
            objUnPinnedStaff.hub_date = moment(today).format("YYYY-MM-DD");
            objUnPinnedStaff.hub_start_time = this.convertToMinutes(moment(startTime).format("h:mm A"));
            objUnPinnedStaff.hub_end_time = objUnPinnedStaff.hub_start_time + 60;
            objUnPinnedStaff['hub_resourceid@odata.bind'] = teacher[0].resourceId;
            if (data.saveUnPinTeacher(objUnPinnedStaff)) {
                wjQuery(element).removeAttr('pinnedId');
                wjQuery(element).find("img").remove();
                wjQuery('.loading').hide();
            }
        }
    };

    this.omitStudentFromSession = function (element) {
        var uniqueIds = wjQuery(element).attr("uniqueId").split('_');
        var objStudent = this.convertedStudentObj.filter(function (x) {
            return x.id == uniqueIds[0] &&
                   x.resourceId == uniqueIds[1] &&
                   x.startHour.getTime() == new Date(uniqueIds[2]).getTime();
        });
        if (objStudent[0] != undefined) {
            wjQuery('.loading').show();
            var objCancelSession = {};
            if (objStudent[0]['isFromMasterSchedule']) {
                objCancelSession['hub_enrollment@odata.bind'] = objStudent[0]['enrollmentId'];
                objCancelSession['hub_service@odata.bind'] = objStudent[0]['serviceId'];
                objCancelSession['hub_center@odata.bind'] = objStudent[0]["locationId"];
                objCancelSession['hub_student@odata.bind'] = objStudent[0]['id'];
                objCancelSession.hub_session_date = moment(objStudent[0]['start']).format('YYYY-MM-DD');
                objCancelSession.hub_start_time = this.convertToMinutes(moment(new Date(uniqueIds[2])).format("h:mm A"));
                objCancelSession.hub_end_time = this.convertToMinutes(moment(objStudent[0]['end']).format("h:mm A"));
                objCancelSession.hub_resourceid = objStudent[0]['resourceId'];
                objCancelSession.hub_is_1to1 = objStudent[0]['is1to1'];
            }
            else {
                objCancelSession['hub_studentsessionid'] = objStudent[0]['sessionId'];
            }
            var responseObj = data.omitStudentSession(objCancelSession);
            if (typeof(responseObj) == 'boolean' || typeof(responseObj) == 'object') {
                var index = this.convertedStudentObj.findIndex(function (x) {
                    return x.id == uniqueIds[0] &&
                           x.resourceId == uniqueIds[1] &&
                           x.startHour.getTime() == new Date(uniqueIds[2]).getTime();
                });
                if (index != -1) {
                    this.convertedStudentObj.splice(index, 1);
                }
                wjQuery('.loading').hide();
                var prevEventId = wjQuery(element).attr("eventid");
                var prevEvent = this.calendar.fullCalendar('clientEvents', prevEventId);
                if (prevEvent) {
                    var eventTitleHTML = wjQuery(prevEvent[0].title);
                    for (var i = 0; i < eventTitleHTML.length; i++) {
                        if (wjQuery(eventTitleHTML[i]).attr('value') == wjQuery(element).attr('value')) {
                            eventTitleHTML.splice(i, 1);
                        }
                    }
                    if (eventTitleHTML.prop('outerHTML') != undefined) {
                        if (eventTitleHTML.length == 1) {
                            prevEvent[0].title = eventTitleHTML.prop('outerHTML');
                        } else {
                            prevEvent[0].title = "";
                            for (var i = 0; i < eventTitleHTML.length; i++) {
                                prevEvent[0].title += eventTitleHTML[i].outerHTML;
                            }
                        }
                        var removeStudentIndex = prevEvent[0].students.map(function (x) {
                            return x.id;
                        }).indexOf(wjQuery(element).attr('value'));
                        prevEvent[0].students.splice(removeStudentIndex, 1);
                        
                        self.removeAllConflictsFromPrevEvent(prevEvent[0]);
                        if ((eventTitleHTML.length == 1 && (eventTitleHTML[0].className == "placeholder" || eventTitleHTML[0].className == "student-placeholder-"+prevEvent[0].deliveryType)) ||
                          (eventTitleHTML.length == 2 && eventTitleHTML[0].className == "placeholder" && eventTitleHTML[1].className == "student-placeholder-"+prevEvent[0].deliveryType) ||
                          (eventTitleHTML.length == 3 && eventTitleHTML[0].className == "onetoone" && eventTitleHTML[1].className == "placeholder" && eventTitleHTML[2].className == "student-placeholder-"+prevEvent[0].deliveryType)) {
                            for (var i = 0; i < this.eventList.length; i++) {
                                if (this.eventList[i].id == prevEventId)
                                    this.eventList.splice(i, 1);
                            }
                            this.calendar.fullCalendar('removeEvents', prevEventId);
                        }
                        this.calendar.fullCalendar('updateEvent', prevEvent);
                    }
                    else {
                        for (var i = 0; i < this.eventList.length; i++) {
                            if (this.eventList[i].id == prevEventId)
                                this.eventList.splice(i, 1);
                        }
                        this.calendar.fullCalendar('removeEvents', prevEventId);
                    }
                }
            }
        }
        self.openSofPane();
        self.showConflictMsg();
        self.draggable('draggable');
    };

    this.excuseStudentFromSession = function (element) {
        var uniqueIds = wjQuery(element).attr("uniqueId").split('_');
        var h = new Date(uniqueIds[2]).getHours();
        if (h > 12) {
            h -= 12;
        }
        var objStudent = this.convertedStudentObj.filter(function (x) {
            return x.id == uniqueIds[0] &&
                   x.resourceId == uniqueIds[1] &&
                   moment(x.startHour).format('h') == h;
        });
        if (objStudent[0] != undefined) {
            wjQuery('.loading').show();
            var objCancelSession = {};
            if (objStudent[0]['isFromMasterSchedule']) {
                objCancelSession.hub_session_date = moment(objStudent[0].start).format("YYYY-MM-DD");
                objCancelSession.hub_start_time = this.convertToMinutes(moment(objStudent[0].start).format("h:mm A"));
                objCancelSession.hub_end_time = this.convertToMinutes(moment(objStudent[0].end).format("h:mm A"));
                objCancelSession.hub_is_1to1 = objStudent[0]['is1to1'];
            }
            else {
                objCancelSession['hub_studentsessionid'] = objStudent[0]['sessionId'];
                objCancelSession['hub_session_date'] = objStudent[0]['sessionDate'];
                objCancelSession.hub_start_time = this.convertToMinutes(moment(new Date(uniqueIds[2])).format("h:mm A"));
                objCancelSession.hub_end_time = objCancelSession.hub_start_time + 60;
            }
            objCancelSession['hub_enrollment@odata.bind'] = objStudent[0]['enrollmentId'];
            objCancelSession['hub_service@odata.bind'] = objStudent[0]['serviceId'];
            objCancelSession['hub_center@odata.bind'] = objStudent[0]["locationId"];
            objCancelSession['hub_student@odata.bind'] = objStudent[0]['id'];
            objCancelSession['hub_resourceid@odata.bind'] = null;
            var responseObj = data.excuseStudentFromSession(objCancelSession);
            if (typeof(responseObj) == 'boolean' || typeof(responseObj) == 'object') {
                var index = this.convertedStudentObj.findIndex(function (x) {
                    return x.id == uniqueIds[0] &&
                           x.resourceId == uniqueIds[1] &&
                           moment(x.startHour).format('h') == h;
                });
                if (index != -1) {
                    this.convertedStudentObj.splice(index, 1);
                }
                wjQuery('.loading').hide();

                var prevEventId = wjQuery(element).attr("eventid");
                var prevEvent = this.calendar.fullCalendar('clientEvents', prevEventId);
                if (prevEvent) {
                    var eventTitleHTML = wjQuery(prevEvent[0].title);
                    for (var i = 0; i < eventTitleHTML.length; i++) {
                        if (wjQuery(eventTitleHTML[i]).attr('value') == wjQuery(element).attr('value')) {
                            eventTitleHTML.splice(i, 1);
                        }
                    }
                    if (eventTitleHTML.prop('outerHTML') != undefined) {
                        if (eventTitleHTML.length == 1) {
                            prevEvent[0].title = eventTitleHTML.prop('outerHTML');
                        } else {
                            prevEvent[0].title = "";
                            for (var i = 0; i < eventTitleHTML.length; i++) {
                                prevEvent[0].title += eventTitleHTML[i].outerHTML;
                            }
                        }
                        var removeStudentIndex = prevEvent[0].students.map(function (x) {
                            return x.id;
                        }).indexOf(wjQuery(element).attr('value'));
                        prevEvent[0].students.splice(removeStudentIndex, 1);

                        self.removeAllConflictsFromPrevEvent(prevEvent[0]);
                        if ((eventTitleHTML.length == 1 && (eventTitleHTML[0].className == "placeholder" || eventTitleHTML[0].className == "student-placeholder-"+prevEvent[0].deliveryType)) ||
                          (eventTitleHTML.length == 2 && eventTitleHTML[0].className == "placeholder" && eventTitleHTML[1].className == "student-placeholder-"+prevEvent[0].deliveryType) ||
                          (eventTitleHTML.length == 3 && eventTitleHTML[0].className == "onetoone" && eventTitleHTML[1].className == "placeholder" && eventTitleHTML[2].className == "student-placeholder-"+prevEvent[0].deliveryType)) {
                            for (var i = 0; i < this.eventList.length; i++) {
                                if (this.eventList[i].id == prevEventId)
                                    this.eventList.splice(i, 1);
                            }
                            this.calendar.fullCalendar('removeEvents', prevEventId);
                        }
                        this.calendar.fullCalendar('updateEvent', prevEvent);
                    }
                    else {
                        for (var i = 0; i < this.eventList.length; i++) {
                            if (this.eventList[i].id == prevEventId)
                                this.eventList.splice(i, 1);
                        }
                        this.calendar.fullCalendar('removeEvents', prevEventId);
                    }
                }
            }
        }
        self.openSofPane();
        self.showConflictMsg();
        self.draggable('draggable');
    };

    this.excuseAndMakeUpStudent = function (element) {
        var self = this;
        var uniqueIds = wjQuery(element).attr("uniqueId").split('_');
        var h = new Date(uniqueIds[2]).getHours();
        if (h > 12) {
            h -= 12;
        }
        var objStudent = self.convertedStudentObj.filter(function (x) {
            return x.id == uniqueIds[0] &&
                   x.resourceId == uniqueIds[1] &&
                   moment(x.startHour).format('h') == h;
        });
        if (objStudent[0] != undefined) {
            var objSession = {};
            if (objStudent[0]['isFromMasterSchedule']) {
                objSession.hub_session_date = moment(objStudent[0].start).format("YYYY-MM-DD");
                objSession.hub_start_time = this.convertToMinutes(moment(objStudent[0].start).format("h:mm A"));
                objSession.hub_end_time = this.convertToMinutes(moment(objStudent[0].end).format("h:mm A"));
                objSession.hub_is_1to1 = objStudent[0]['is1to1'];
            }
            else {
                objSession['hub_session_date'] = objStudent[0]['sessionDate'];
                objSession.hub_studentsessionid = objStudent[0]['sessionId'];
                objSession.hub_start_time = self.convertToMinutes(moment(new Date(uniqueIds[2])).format("h:mm A"));
                objSession.hub_end_time = objSession.hub_start_time + 60;
            }
            objSession['hub_enrollment@odata.bind'] = objStudent[0]['enrollmentId'];
            objSession['hub_service@odata.bind'] = objStudent[0]['serviceId'];
            objSession['hub_center@odata.bind'] = objStudent[0]["locationId"];
            objSession['hub_student@odata.bind'] = objStudent[0]['id'];
            objSession['hub_resourceid@odata.bind'] = null;
            wjQuery("#studentNameofExcuse").text(objStudent[0]['name']);
            wjQuery(".excuse-datepicker-input").datepicker({
                minDate: self.calendar.fullCalendar('getDate'),
                format: 'mm/dd/yyyy'
            });
            var selectedFromDate;
            wjQuery("#start-space, #end-space, .excuseSave").css("visibility", "hidden");
            wjQuery("#error_block").text("");
            wjQuery(".excuse-datepicker-input").off('change').on("change", function () {
                selectedFromDate = wjQuery(this).val();
                wjQuery("#error_block").text("");
                if(selectedFromDate != undefined){
                  var duration =  objStudent[0]['duration'] == undefined ? 60 : objStudent[0]['duration'];
                  var timeList = self.getStudentTimings(self.locationId, selectedFromDate, objStudent[0]['timeSlotType'], duration, true);
                  var timeHTML = [];
                  if(timeList.length){
                    wjQuery("#start-space, #end-space, .excuseSave").css("visibility", "visible");
                    for (var i = 0; i < timeList.length; i++) {
                        if (!i) {
                            wjQuery(".timing-dropdown-btn").text(timeList[i]);
                            wjQuery(".timing-dropdown-btn").val(timeList[i]);
                            var startTime = timeList[i];
                            var endTime = self.tConvert(self.convertMinsNumToTime(self.convertToMinutes(startTime) + duration));
                            wjQuery(".excuse-to-timepicker-input").text(endTime);
                        }
                        timeHTML.push('<li><a tabindex="-1" value-id="' + timeList[i] + '" href="javascript:void(0)">' + timeList[i] + '</a></li>');
                    }
                    wjQuery(".timing-dropdown ul").html(timeHTML);
                    wjQuery(".timing-dropdown .dropdown-menu").on('click', 'li a', function () {
                      if (wjQuery(".timing-dropdown-btn").val() != wjQuery(this).attr('value-id')) {
                          wjQuery(".timing-dropdown-btn").text(wjQuery(this).text());
                          wjQuery(".timing-dropdown-btn").val(wjQuery(this).attr('value-id'));
                          var startTime = wjQuery(".timing-dropdown-btn").val();
                          var endTime = self.tConvert(self.convertMinsNumToTime(self.convertToMinutes(startTime) + duration));
                          wjQuery(".excuse-to-timepicker-input").text(endTime);
                      }
                    });
                  }else{
                    wjQuery("#start-space, #end-space, .excuseSave").css("visibility", "hidden");
                    wjQuery("#error_block").text("No Instructional hours found for the given date.");
                  }
                }
            });
            wjQuery('#error_block').text('');
            wjQuery(".excuse-to-timepicker-input").val('');
            wjQuery(".excuse-to-timepicker-input").text('');
            wjQuery(".excuse-datepicker-input").val('');
            wjQuery("#excuseModal").dialog({
                modal: true,
                draggable: false,
                resizable: false,
                width:350
            });
            wjQuery(".excuseSave").removeClass('reschedule').addClass('makeup');
            wjQuery("#excuseModal").dialog('option', 'title', 'Add MakeUp');
            wjQuery(".makeup").off('click').on('click',function () {
                wjQuery('.loading').show();
                var flag = true;
                if (selectedFromDate != '') {
                    objSession.hub_makeup_date = moment(moment(selectedFromDate).format('MM/DD/YYYY')).format('YYYY-MM-DD');
                }
                else {
                    flag = false;
                }
                if (wjQuery(".timing-dropdown-btn").val() != '' && flag) {
                    objSession.hub_makeup_start_time = self.convertToMinutes(wjQuery(".timing-dropdown-btn").val());
                }
                else {
                    flag = false;
                }
                if (wjQuery(".timing-dropdown-btn").val() != '' && flag) {
                    objSession.hub_makeup_end_time = self.convertToMinutes(wjQuery(".excuse-to-timepicker-input").text());
                    if (objSession.hub_makeup_end_time <= objSession.hub_makeup_start_time) {
                        wjQuery('#error_block').text('End Time is less than or equal to Start Time');
                        wjQuery('#error_block').css('color', 'red');
                        flag = false;
                    }
                }
                else {
                    flag = false;
                }
                if (data.excuseAndMakeUpStudent(objSession) && flag) {
                  wjQuery(".excuseSave").removeClass('makeup');
                    var index = self.convertedStudentObj.findIndex(function (x) {
                        return x.id == uniqueIds[0] &&
                               x.resourceId == uniqueIds[1] &&
                               moment(x.startHour).format('h') == h;
                    });
                    if (index != -1) {
                      delete self.convertedStudentObj[index].resourceId;
                      self.convertedStudentObj[index].start =  new Date(objSession.hub_makeup_date +" "+wjQuery(".timing-dropdown-btn").val());
                      self.convertedStudentObj[index].end =  new Date(objSession.hub_makeup_date +" "+wjQuery(".excuse-to-timepicker-input").text());
                      self.convertedStudentObj[index].startHour =  self.convertedStudentObj[index].start;
                      setTimeout(function() {
                          self.pushStudentToSOF(self.convertedStudentObj[index]);
                          self.populateSOFPane(self.sofList, self.calendarOptions.minTime, self.calendarOptions.maxTime);
                          self.openSofPane();
                      },500);
                      // self.convertedStudentObj.splice(index, 1);
                    }
                    wjQuery("#excuseModal").dialog("close");
                    var prevEventId = wjQuery(element).attr("eventid");
                    var prevEvent = self.calendar.fullCalendar('clientEvents', prevEventId);
                    if (prevEvent) {
                        var eventTitleHTML = wjQuery(prevEvent[0].title);
                        for (var i = 0; i < eventTitleHTML.length; i++) {
                            if (wjQuery(eventTitleHTML[i]).attr('value') == wjQuery(element).attr('value')) {
                                eventTitleHTML.splice(i, 1);
                            }
                        }
                        if (eventTitleHTML.prop('outerHTML') != undefined) {
                            if (eventTitleHTML.length == 1) {
                                prevEvent[0].title = eventTitleHTML.prop('outerHTML');
                            } else {
                                prevEvent[0].title = "";
                                for (var i = 0; i < eventTitleHTML.length; i++) {
                                    prevEvent[0].title += eventTitleHTML[i].outerHTML;
                                }
                            }
                            var removeStudentIndex = prevEvent[0].students.map(function (x) {
                                return x.id;
                            }).indexOf(wjQuery(element).attr('value'));
                            prevEvent[0].students.splice(removeStudentIndex, 1);

                            self.removeAllConflictsFromPrevEvent(prevEvent[0]);
                            if ((eventTitleHTML.length == 1 && (eventTitleHTML[0].className == "placeholder" || eventTitleHTML[0].className == "student-placeholder-"+prevEvent[0].deliveryType)) ||
                              (eventTitleHTML.length == 2 && eventTitleHTML[0].className == "placeholder" && eventTitleHTML[1].className == "student-placeholder-"+prevEvent[0].deliveryType) ||
                              (eventTitleHTML.length == 3 && eventTitleHTML[0].className == "onetoone" && eventTitleHTML[1].className == "placeholder" && eventTitleHTML[2].className == "student-placeholder-"+prevEvent[0].deliveryType)) {
                                for (var i = 0; i < self.eventList.length; i++) {
                                    if (self.eventList[i].id == prevEventId)
                                        self.eventList.splice(i, 1);
                                }
                                self.calendar.fullCalendar('removeEvents', prevEventId);
                            }
                            self.calendar.fullCalendar('updateEvent', prevEvent);
                        }
                        else {
                            for (var i = 0; i < self.eventList.length; i++) {
                                if (self.eventList[i].id == prevEventId)
                                    self.eventList.splice(i, 1);
                            }
                            self.calendar.fullCalendar('removeEvents', prevEventId);
                        }
                    }
                }
                else {
                    if (wjQuery('#error_block').text() == '') {
                        wjQuery('#error_block').text('All Fields are mandatory');
                        wjQuery('#error_block').css('color', 'red');
                    }
                }
                wjQuery('.loading').hide();
            });
        }
        self.openSofPane();
        self.showConflictMsg();
        self.draggable('draggable');
    };

    this.rescheduleStudentSession = function (element) {
        var self = this;
        var uniqueIds = wjQuery(element).attr("uniqueId").split('_');
        var h = new Date(uniqueIds[2]).getHours();
        if (h > 12) {
            h -= 12;
        }
        var objStudent = self.convertedStudentObj.filter(function (x) {
            return x.id == uniqueIds[0] &&
                   x.resourceId == uniqueIds[1] &&
                   moment(x.startHour).format('h') == h;
        });
        if (objStudent[0] != undefined) {
            var objPrevSession = {};

            if (objStudent[0]['isFromMasterSchedule']) {
                objPrevSession.hub_session_date = moment(objStudent[0].start).format("YYYY-MM-DD");
                objPrevSession.hub_start_time = this.convertToMinutes(moment(objStudent[0].start).format("h:mm A"));
                objPrevSession.hub_end_time = this.convertToMinutes(moment(objStudent[0].end).format("h:mm A"));
                objPrevSession.hub_is_1to1 = objStudent[0]['is1to1'];
            }
            else {
                objPrevSession.hub_studentsessionid = objStudent[0]['sessionId'];
                objPrevSession.hub_start_time = self.convertToMinutes(moment(new Date(uniqueIds[2])).format("h:mm A"));
                objPrevSession.hub_end_time = objPrevSession.hub_start_time + 60;
                objPrevSession['hub_session_date'] = objStudent[0]['sessionDate'];
            }
            objPrevSession['hub_enrollment@odata.bind'] = objStudent[0]['enrollmentId'];
            objPrevSession['hub_service@odata.bind'] = objStudent[0]['serviceId'];
            objPrevSession['hub_center@odata.bind'] = objStudent[0]["locationId"];
            objPrevSession['hub_student@odata.bind'] = objStudent[0]['id'];
            objPrevSession['hub_resourceid@odata.bind'] = null;

            var objNewSession = {};
            objNewSession['hub_resourceid@odata.bind'] = null;
            wjQuery("#studentNameofExcuse").text(objStudent[0]['name']);
            wjQuery(".excuse-datepicker-input").datepicker({
                minDate: self.calendar.fullCalendar('getDate'),
                format: 'mm/dd/yyyy'
            });
            var selectedFromDate;
            wjQuery("#start-space, #end-space, .excuseSave").css("visibility", "hidden");
            wjQuery("#error_block").text("");
            wjQuery(".excuse-datepicker-input").off('change').on("change", function () {
                wjQuery("#error_block").text("");
                selectedFromDate = wjQuery(this).val();
                if(selectedFromDate != undefined){
                  var duration =  objStudent[0]['duration'] == undefined ? 60 : objStudent[0]['duration'];
                  var timeList = self.getStudentTimings(self.locationId, selectedFromDate, objStudent[0]['namedHoursId'], duration, false);
                  var timeHTML = [];
                  if(timeList.length){
                    wjQuery("#error_block").text("");
                    wjQuery("#start-space, #end-space, .excuseSave").css("visibility", "visible");
                    for (var i = 0; i < timeList.length; i++) {
                        if (!i) {
                            wjQuery(".timing-dropdown-btn").text(timeList[i]);
                            wjQuery(".timing-dropdown-btn").val(timeList[i]);
                            var startTime = timeList[i];
                            var endTime = self.tConvert(self.convertMinsNumToTime(self.convertToMinutes(startTime) + duration));
                            wjQuery(".excuse-to-timepicker-input").text(endTime);
                        }
                        timeHTML.push('<li><a tabindex="-1" value-id="' + timeList[i] + '" href="javascript:void(0)">' + timeList[i] + '</a></li>');
                    }
                    wjQuery(".timing-dropdown ul").html(timeHTML);
                    wjQuery(".timing-dropdown .dropdown-menu").on('click', 'li a', function () {
                      if (wjQuery(".timing-dropdown-btn").val() != wjQuery(this).attr('value-id')) {
                          wjQuery(".timing-dropdown-btn").text(wjQuery(this).text());
                          wjQuery(".timing-dropdown-btn").val(wjQuery(this).attr('value-id'));
                          var startTime = wjQuery(".timing-dropdown-btn").val();
                          var endTime = self.tConvert(self.convertMinsNumToTime(self.convertToMinutes(startTime) + duration));
                          wjQuery(".excuse-to-timepicker-input").text(endTime);
                      }
                    });
                  }else{
                    wjQuery("#start-space, #end-space, .excuseSave").css("visibility", "hidden");
                    wjQuery("#error_block").text("No Instructional hours found for the given date.");
                  }
                }
            });
            wjQuery('#error_block').text('');
            wjQuery(".excuse-to-timepicker-input").text('');
            wjQuery(".excuse-datepicker-input").val('');
            wjQuery("#excuseModal").dialog({
                modal: true,
                draggable: false,
                resizable: false,
                width:350
            });
            wjQuery(".excuseSave").removeClass('makeup').addClass('reschedule');
            wjQuery("#excuseModal").dialog('option', 'title', 'Re-Schedule');
            wjQuery(".reschedule").off('click').on('click',function () {
                wjQuery('.loading').show();
                var flag = true;
                if (selectedFromDate != '') {
                    objNewSession.hub_session_date = moment(moment(selectedFromDate).format('MM/DD/YYYY')).format('YYYY-MM-DD');
                }
                else {
                    flag = false;
                }
                if (wjQuery(".timing-dropdown-btn").val() != '' && flag) {
                    objNewSession.hub_start_time = self.convertToMinutes(wjQuery(".timing-dropdown-btn").val());
                }
                else {
                    flag = false;
                }
                if (wjQuery(".timing-dropdown-btn").val() != '' && flag) {
                    objNewSession.hub_end_time = self.convertToMinutes(wjQuery(".excuse-to-timepicker-input").text());
                    if (objNewSession.hub_end_time <= objNewSession.hub_start_time) {
                        wjQuery('#error_block').text('End Time is less than or equal to Start Time');
                        wjQuery('#error_block').css('color', 'red');
                        flag = false;
                    }
                }
                else {
                    flag = false;
                }
                var responseObj = data.rescheduleStudentSession(objPrevSession, objNewSession);
                if (responseObj != undefined && flag) {
                    wjQuery(".excuseSave").removeClass('reschedule');
                    var index = self.convertedStudentObj.findIndex(function (x) {
                        return x.id == uniqueIds[0] &&
                               x.resourceId == uniqueIds[1] &&
                               moment(x.startHour).format('h') == h;
                    });
                    if (index != -1) {
                      delete self.convertedStudentObj[index].resourceId;
                      self.convertedStudentObj[index].start =  new Date(objNewSession.hub_session_date+" "+wjQuery(".timing-dropdown-btn").val());
                      self.convertedStudentObj[index].end =  new Date(objNewSession.hub_session_date+" "+wjQuery(".excuse-to-timepicker-input").text());
                      self.convertedStudentObj[index].startHour =  self.convertedStudentObj[index].start;
                     setTimeout(function() {
                          self.pushStudentToSOF(self.convertedStudentObj[index]);
                          self.populateSOFPane(self.sofList, self.calendarOptions.minTime, self.calendarOptions.maxTime);
                          self.openSofPane();
                      },500);
                      // self.convertedStudentObj.splice(index, 1);
                    }

                    wjQuery("#excuseModal").dialog("close");
                    var prevEventId = wjQuery(element).attr("eventid");
                    var prevEvent = self.calendar.fullCalendar('clientEvents', prevEventId);
                    if (prevEvent) {
                        var eventTitleHTML = wjQuery(prevEvent[0].title);
                        for (var i = 0; i < eventTitleHTML.length; i++) {
                            if (wjQuery(eventTitleHTML[i]).attr('value') == wjQuery(element).attr('value')) {
                                eventTitleHTML.splice(i, 1);
                            }
                        }
                        if (eventTitleHTML.prop('outerHTML') != undefined) {
                            if (eventTitleHTML.length == 1) {
                                prevEvent[0].title = eventTitleHTML.prop('outerHTML');
                            } else {
                                prevEvent[0].title = "";
                                for (var i = 0; i < eventTitleHTML.length; i++) {
                                    prevEvent[0].title += eventTitleHTML[i].outerHTML;
                                }
                            }
                            var removeStudentIndex = prevEvent[0].students.map(function (x) {
                                return x.id;
                            }).indexOf(wjQuery(element).attr('value'));
                            prevEvent[0].students.splice(removeStudentIndex, 1);

                            self.removeAllConflictsFromPrevEvent(prevEvent[0]);
                            if ((eventTitleHTML.length == 1 && (eventTitleHTML[0].className == "placeholder" || eventTitleHTML[0].className == "student-placeholder-"+prevEvent[0].deliveryType)) ||
                              (eventTitleHTML.length == 2 && eventTitleHTML[0].className == "placeholder" && eventTitleHTML[1].className == "student-placeholder-"+prevEvent[0].deliveryType) ||
                              (eventTitleHTML.length == 3 && eventTitleHTML[0].className == "onetoone" && eventTitleHTML[1].className == "placeholder" && eventTitleHTML[2].className == "student-placeholder-"+prevEvent[0].deliveryType)) {
                                for (var i = 0; i < self.eventList.length; i++) {
                                    if (self.eventList[i].id == prevEventId)
                                        self.eventList.splice(i, 1);
                                }
                                self.calendar.fullCalendar('removeEvents', prevEventId);
                            }
                            self.calendar.fullCalendar('updateEvent', prevEvent);
                        }else {
                            for (var i = 0; i < self.eventList.length; i++) {
                                if (self.eventList[i].id == prevEventId)
                                    self.eventList.splice(i, 1);
                            }
                            self.calendar.fullCalendar('removeEvents', prevEventId);
                        }
                        
                    }
                }else {
                    if (wjQuery('#error_block').text() == '') {
                        wjQuery('#error_block').text('All Fields are mandatory');
                        wjQuery('#error_block').css('color', 'red');
                    }
                }
                wjQuery('.loading').hide();
            });
        }
        self.openSofPane();
        self.showConflictMsg();
        self.draggable('draggable');
    };

    //Method to add the context menu for Student and Teacher
    this.addContext = function (uniqueId, labelFor, isPinned, deliveryType, sessionStatus) {
        var self = this;
        var obj = {};
        if (labelFor == 'student') {
            if (deliveryType == "Personal Instruction") {
                obj.unpin = { name: "Unpin" };
                obj.unpin.visible = true;
                obj.unpin.callback = function (key, options) {
                    obj.unpin.visible = false;
                    obj.pin.visible = true;
                    self.unPinStudent(options.$trigger[0]);
                }
                obj.pin = { name: "Pin" };
                obj.pin.visible = true;
                obj.pin.callback = function (key, options) {
                    obj.unpin.visible = true;
                    obj.pin.visible = false;
                    self.pinStudent(options.$trigger[0]);
                }
                obj.omit = {
                  name: "Omit",
                  callback: function (key, options) {
                      self.omitStudentFromSession(options.$trigger[0]);
                  }
                }
                obj.excuse = {
                    name: "Excuse",
                    disabled:MAKEUP_STATUS == sessionStatus,
                    callback: function (key, options) {
                        self.excuseStudentFromSession(options.$trigger[0]);
                    }
                }
                obj.excuseAndMakeUp = {
                    name: "Excuse with Makeup",
                    disabled:MAKEUP_STATUS == sessionStatus,
                    callback: function (key, options) {
                        self.excuseAndMakeUpStudent(options.$trigger[0]);
                    }
                }
                obj.moveToSof = {
                    name: "Move to SOF",
                    callback: function (key, options) {
                        self.moveStudentToSOF(options.$trigger[0]);
                    }
                }
                if (isPinned) {
                    obj.unpin.visible = true;
                    obj.pin.visible = false;
                }
                else {
                    obj.unpin.visible = false;
                    obj.pin.visible = true;
                }
                wjQuery.contextMenu( 'destroy', 'span[uniqueId="' + uniqueId + '"]');
                wjQuery.contextMenu({
                    selector: 'span[uniqueId="' + uniqueId + '"]',
                    build: function ($trigger, e) {
                        return {
                            items: obj
                        };
                    }
                });

            }
            else if (deliveryType == "Group Facilitation") {
                obj.reschedule = {
                    name: "Reschedule",
                    callback: function (key, options) {
                        self.rescheduleStudentSession(options.$trigger[0]);
                    }
                }
                obj.omit = {
                    name: "Omit",
                    callback: function (key, options) {
                        self.omitStudentFromSession(options.$trigger[0]);
                    }
                }
                obj.moveToSof = {
                    name: "Move to SOF",
                    callback: function (key, options) {
                        self.moveStudentToSOF(options.$trigger[0]);
                    }
                }
                wjQuery.contextMenu( 'destroy', 'span[uniqueId="' + uniqueId + '"]');
                wjQuery.contextMenu({
                    selector: 'span[uniqueId="' + uniqueId + '"]',
                    build: function ($trigger, e) {
                        return {
                            items: obj
                        };
                    }
                });
            }
            else if(deliveryType == "Group Instruction"){
                obj.omit = {
                    name: "Omit",
                    callback: function (key, options) {
                      self.omitStudentFromSession(options.$trigger[0]);
                    }
                }
                wjQuery.contextMenu( 'destroy', 'span[uniqueId="' + uniqueId + '"]');
                wjQuery.contextMenu({
                    selector: 'span[uniqueId="' + uniqueId + '"]',
                    build: function ($trigger, e) {
                      return {
                          items: obj
                      };
                    }
                });
            }
           
        } 
        else if (labelFor == 'teacher') {
            obj.pin = {
                "name": "Pin",
                "visible": true,
                "items": {
                    "pinbyTime": {
                        "name": "Time",
                        callback: function (key, options) {
                            obj.unpin.visible = true;
                            obj.pin.visible = false;
                            self.pinTeacher(options.$trigger[0], 'time');
                        }
                    },
                    "pinbyResource": {
                        "name": "Resource",
                        callback: function (key, options) {
                            obj.unpin.visible = true;
                            obj.pin.visible = false;
                            self.pinTeacher(options.$trigger[0], 'resource');
                        }

                    }
                }
            };
            obj.unpin = {
                "name": "Unpin",
                "visible": false,
                callback: function (key, options) {
                    obj.unpin.visible = false;
                    obj.pin.visible = true;
                    self.unPinTeacher(options.$trigger[0]);
                }
            };
            obj.moveToSof = {
                name: "Remove",
                callback: function (key, options) {
                    self.removeTeacher(options.$trigger[0]);
                }
            }
            if (isPinned) {
                obj.unpin.visible = true;
                obj.pin.visible = false;
            }
            else {
                obj.unpin.visible = false;
                obj.pin.visible = true;
            }
            wjQuery.contextMenu( 'destroy', 'span[uniqueId="' + uniqueId + '"]');
            wjQuery.contextMenu({
                selector: 'span[uniqueId="' + uniqueId + '"]',
                build: function ($trigger, e) {
                    return {
                        items: obj
                    };
                }
            });
        } else if (labelFor == "studentPlaceholder") {
          if(deliveryType != "Group-Instruction"){
            if(deliveryType == "Personal-Instruction"){
              obj.makeup = {
                name: "Makeup",
                callback : function(key, options) {
                  self.makeupPopup(data.getMakeupNFloat({"hub_center@odata.bind":self.locationId, "isForMakeup":true}), options.$trigger[0], true);
                }
              }
              // float menu
              obj.float = {
                name: "Float",
                callback : function(key, options) {
                    self.makeupPopup(data.getMakeupNFloat({"hub_center@odata.bind":self.locationId, "isForMakeup":false}), options.$trigger[0], false);
                }
              }
              wjQuery.contextMenu( 'destroy', 'span[uniqueId="' + uniqueId + '"]');
                wjQuery.contextMenu({
                    selector: '.student-placeholder-Personal-Instruction', 
                    build: function($trigger, e) {
                      return {
                        items: obj
                      };
                    }
                }); 
            }else{
              // float menu Only For GF
                obj.float = {
                    name: "Float",
                    callback : function(key, options) {
                        self.makeupPopup(data.getMakeupNFloat({"hub_center@odata.bind":self.locationId, "isForMakeup":false}), options.$trigger[0], false);
                    }
                }
                wjQuery.contextMenu( 'destroy', 'span[uniqueId="' + uniqueId + '"]');
                wjQuery.contextMenu({
                    selector: '.student-placeholder-Group-Facilitation', 
                    build: function($trigger, e) {
                      return {
                        items: obj
                      };
                    }
                }); 
            }
          }
        }
    };

    this.moveStudentToSOF = function (element) {
        var self = this;
        var uniqueIds = wjQuery(element).attr("uniqueId").split('_');
        var h = new Date(uniqueIds[2]).getHours();
        var uniqueId = wjQuery(element).attr('uniqueId');
        var startTime = uniqueId.split('_')[2];

        if (h > 12) {
          h -= 12;
        }
        var objStudent = self.convertedStudentObj.filter(function (x) {
          return x.id == uniqueIds[0] &&
                 x.resourceId == uniqueIds[1] &&
                 x.startHour.getTime() == new Date(uniqueIds[2]).getTime();
        });
        if (objStudent[0] != undefined) {
            var objMovetoSOF = {};
            if (objStudent[0]['isFromMasterSchedule']) {
              objMovetoSOF['hub_enrollment@odata.bind'] = objStudent[0]['enrollmentId'];
              objMovetoSOF['hub_service@odata.bind'] = objStudent[0]['serviceId'];
              objMovetoSOF['hub_center@odata.bind'] = objStudent[0]["locationId"];
              objMovetoSOF['hub_student@odata.bind'] = objStudent[0]['id'];
              objMovetoSOF.hub_session_date = moment(objStudent[0].start).format("YYYY-MM-DD");
              objMovetoSOF.hub_start_time = this.convertToMinutes(moment(objStudent[0].start).format("h:mm A"));
              objMovetoSOF.hub_end_time = this.convertToMinutes(moment(objStudent[0].end).format("h:mm A"));
              objMovetoSOF.hub_is_1to1 = objStudent[0]['is1to1'];
            } else {
                objMovetoSOF['hub_studentsessionid'] = objStudent[0]['sessionId'];
            }
            objMovetoSOF['hub_resourceid@odata.bind'] = null;
            if (objStudent[0].hasOwnProperty('resourceId')) {
              delete objStudent[0]['resourceId'];
            }
            wjQuery('.loading').show();
            var responseObj = data.moveStudentToSOF(objMovetoSOF);
            if (typeof(responseObj) == 'boolean' || typeof(responseObj) == 'object') {
              if (responseObj.hasOwnProperty('hub_studentsessionid')) {
                objStudent[0]['sessionId'] = responseObj['hub_studentsessionid'];
                objStudent[0]['resourceId'] = responseObj['hub_resourceid@odata.bind'];
                objStudent[0]['sessiontype'] = responseObj['hub_sessiontype'];
                objStudent[0]['sessionStatus'] = responseObj['hub_session_status'];
                delete objStudent[0]['isFromMasterSchedule'];
              }
              var index = self.convertedStudentObj.findIndex(function (x) {
                return x.id == uniqueIds[0] &&
                       x.resourceId == uniqueIds[1] &&
                       x.startHour.getTime() == new Date(uniqueIds[2]).getTime();
              });
              if(index != -1){
                self.convertedStudentObj.splice(index, 1);
              }
              wjQuery('.loading').hide();
              setTimeout(function () {
                self.pushStudentToSOF(objStudent[0]);
                if (self.sofList['Personal Instruction'].length > 0 || self.sofList['Group Instruction'].length > 0 || self.sofList['Group Facilitation'].length > 0) {
                    self.populateSOFPane(self.sofList, self.calendarOptions.minTime, self.calendarOptions.maxTime);
                    self.openSofPane();
                }
              }, 500);
              var prevEventId = wjQuery(element).attr("eventid");
              var prevEvent = self.calendar.fullCalendar('clientEvents', prevEventId);
              if (prevEvent) {
                var eventTitleHTML = wjQuery(prevEvent[0].title);
                for (var i = 0; i < eventTitleHTML.length; i++) {
                    if (wjQuery(eventTitleHTML[i]).attr('value') == wjQuery(element).attr('value')) {
                        eventTitleHTML.splice(i, 1);
                    }
                }
                if (eventTitleHTML.prop('outerHTML') != undefined) {
                  if (eventTitleHTML.length == 1) {
                      prevEvent[0].title = eventTitleHTML.prop('outerHTML');
                  } else {
                      prevEvent[0].title = "";
                      for (var i = 0; i < eventTitleHTML.length; i++) {
                          prevEvent[0].title += eventTitleHTML[i].outerHTML;
                      }
                  }

                  var removeStudentIndex = prevEvent[0].students.map(function (x) {
                      return x.id;
                  }).indexOf(wjQuery(element).attr('value'));
                  prevEvent[0].students.splice(removeStudentIndex, 1);

                  self.removeAllConflictsFromPrevEvent(prevEvent[0]);

                  if ((eventTitleHTML.length == 1 && (eventTitleHTML[0].className == "placeholder" || eventTitleHTML[0].className == "student-placeholder-"+prevEvent[0].deliveryType)) ||
                    (eventTitleHTML.length == 2 && eventTitleHTML[0].className == "placeholder" && eventTitleHTML[1].className == "student-placeholder-"+prevEvent[0].deliveryType) ||
                    (eventTitleHTML.length == 3 && eventTitleHTML[0].className == "onetoone" && eventTitleHTML[1].className == "placeholder" && eventTitleHTML[2].className == "student-placeholder-"+prevEvent[0].deliveryType)) {
                      for (var i = 0; i < self.eventList.length; i++) {
                        if (self.eventList[i].id == prevEventId)
                          self.eventList.splice(i, 1);
                      }
                      self.calendar.fullCalendar('removeEvents', prevEventId);
                  }
                  
                  self.calendar.fullCalendar('updateEvent', prevEvent[0]);
                }else {
                  for (var i = 0; i < self.eventList.length; i++) {
                      if (self.eventList[i].id == prevEventId)
                          self.eventList.splice(i, 1);
                  }
                  self.calendar.fullCalendar('removeEvents', prevEventId);
                }
              }
            }
        }
        self.openSofPane();
        self.showConflictMsg();
        self.draggable('draggable');
    };

    this.draggable = function (selector) {
        wjQuery('.' + selector).draggable({
            revert: true,
            revertDuration: 0,
            appendTo: '#scrollarea',
            helper: 'clone',
            cursor: "move",
            scroll: true,
            cursorAt: { top: 0 },
            drag: function () {
                if (sofExpanded) {
                    wjQuery('.sof-pane').css('opacity', '.1');
                }
                if (taExpanded) {
                    wjQuery('.ta-pane').css('opacity', '.1');
                }
            },
            stop: function () {
                if (sofExpanded) {
                    wjQuery('.sof-pane').css('opacity', '1');
                }
                if (taExpanded) {
                    wjQuery('.ta-pane').css('opacity', '1');
                }
            }
        });
    };

    this.convertPinnedData = function (data, isFromSave) {
        if (isFromSave) {
            var obj = {
                id: data['hub_sch_pinned_students_teachersid'],
                enrollmentId: data['_hub_enrollment_value'],
                startTime: data['hub_start_time@OData.Community.Display.V1.FormattedValue'],
                endTime: data['hub_end_time@OData.Community.Display.V1.FormattedValue'],
                studentId: data['_hub_student_value'],
                studentName: data['_hub_student_value@OData.Community.Display.V1.FormattedValue'],
                teacherId: data['_hub_teacher_value'],
                teacherName: data['_hub_teacher_value@OData.Community.Display.V1.FormattedValue'],
                dayId: data['hub_day'],
                dayValue: data['hub_day@OData.Community.Display.V1.FormattedValue']
            };
            if (data['_hub_resource_value'] != undefined) {
                obj.resourceId = data['_hub_resource_value'];
                obj.resourceName = data['_hub_resource_value@OData.Community.Display.V1.FormattedValue'];
            }
            if (data['_hub_affinity_resourceid_value'] != undefined) {
                obj.affinityResourceId = data['_hub_affinity_resourceid_value'];
                obj.affinityResourceName = data['_hub_affinity_resourceid_value@OData.Community.Display.V1.FormattedValue'];
            }
            this.convertedPinnedList.push(obj);
        }
        else {
            if (data.length) {
                for (var i = 0; i < data.length; i++) {
                    var obj = {
                        id: data[i]['hub_sch_pinned_students_teachersid'],
                        enrollmentId: data[i]['_hub_enrollment_value'],
                        startTime: data[i]['hub_start_time@OData.Community.Display.V1.FormattedValue'],
                        endTime: data[i]['hub_end_time@OData.Community.Display.V1.FormattedValue'],
                        studentId: data[i]['_hub_student_value'],
                        studentName: data[i]['_hub_student_value@OData.Community.Display.V1.FormattedValue'],
                        teacherId: data[i]['_hub_teacher_value'],
                        teacherName: data[i]['_hub_teacher_value@OData.Community.Display.V1.FormattedValue'],
                        dayId: data[i]['hub_day'],
                        dayValue: data[i]['hub_day@OData.Community.Display.V1.FormattedValue']
                    };
                    if (data[i]['_hub_resource_value'] != undefined) {
                        obj.resourceId = data[i]['_hub_resource_value'];
                        obj.resourceName = data[i]['_hub_resource_value@OData.Community.Display.V1.FormattedValue'];
                    }
                    if (data[i]['_hub_affinity_resourceid_value'] != undefined) {
                        obj.affinityResourceId = data[i]['_hub_affinity_resourceid_value'];
                        obj.affinityResourceName = data[i]['_hub_affinity_resourceid_value@OData.Community.Display.V1.FormattedValue'];
                    }
                    this.convertedPinnedList.push(obj);
                }
            }
            else {
                this.convertedPinnedList = [];
            }
        }
    };

    this.getResourceObj = function (resourceId) {
        var resourceObj = {};
        wjQuery.each(this.resourceList, function (k, v) {
            if (resourceId == v.id) {
                resourceObj = v;
            }
        });
        return resourceObj;
    }

    this.getDeliveryTypeVal = function (deliveryTypeId) {
        var deliveryType = "";
        wjQuery.each(this.resourceList, function (k, v) {
            if (deliveryTypeId == v.deliveryTypeId) {
                deliveryType = v.deliveryType;
            }
        });
        return deliveryType;
    }

    this.saveStudentToSession = function (prevStudent, newStudent) {
        var objPrevSession = {};
        var objNewSession = {};
        if (prevStudent != undefined) {
            // Session type condition
            /*if(oldDate == sessionDate && newTime != oldTime && student.deliveryType == "Personal Instruction"){
              objNewSession['hub_sessiontype'] = 1;
            }*/
            if (prevStudent['isFromMasterSchedule']) {
                objPrevSession['hub_session_date'] = moment(newStudent.startHour).format('YYYY-MM-DD');
                objPrevSession.hub_start_time = this.convertToMinutes(moment(prevStudent.start).format("h:mm A"));
                objPrevSession.hub_end_time = this.convertToMinutes(moment(prevStudent.end).format("h:mm A"));
                objPrevSession['hub_resourceid@odata.bind'] = null
                objPrevSession.hub_is_1to1 = prevStudent['is1to1'];

                objNewSession.hub_is_1to1 = newStudent['is1to1'];
            } else {
                objPrevSession['hub_session_date'] = prevStudent['sessionDate'];
                objPrevSession['hub_is_1to1'] = prevStudent['is1to1'];
                objPrevSession['hub_studentsessionid'] = prevStudent['sessionId'];
                objPrevSession['hub_start_time'] = this.convertToMinutes(moment(prevStudent.start).format("h:mm A"));
                objPrevSession['hub_end_time'] = this.convertToMinutes(moment(prevStudent.end).format("h:mm A"));
                objPrevSession['hub_resourceid@odata.bind'] = prevStudent.resourceId;

                objPrevSession['hub_sessiontype'] = 1;
                objPrevSession['hub_session_status'] = prevStudent['sessionStatus'];
                if (prevStudent['sessiontype'] != undefined) {
                    objPrevSession['hub_sessiontype'] = prevStudent['sessiontype'];
                }

                objNewSession['hub_sessiontype'] = 1;
                if (prevStudent['sessiontype'] != undefined) {
                    objNewSession['hub_sessiontype'] = prevStudent['sessiontype'];
                }
                objNewSession['hub_session_status'] = prevStudent['sessionStatus'];
                objNewSession['hub_studentsessionid'] = prevStudent['sessionId'];
                objNewSession['hub_is_1to1'] = newStudent['is1to1'];
            }

            objPrevSession['hub_enrollment@odata.bind'] = prevStudent['enrollmentId'];
            objPrevSession['hub_deliverytype'] = prevStudent['deliveryTypeId'];
            objPrevSession['hub_service@odata.bind'] = prevStudent['serviceId'];
            objPrevSession['hub_student@odata.bind'] = prevStudent['id'];
            objPrevSession['hub_center@odata.bind'] = prevStudent["locationId"];
            objPrevSession['hub_deliverytype@OData.Community.Display.V1.FormattedValue'] = prevStudent['deliveryType'];

            objNewSession['hub_center@odata.bind'] = prevStudent["locationId"];
            objNewSession['hub_enrollment@odata.bind'] = prevStudent['enrollmentId'];
            objNewSession['hub_student@odata.bind'] = prevStudent['id'];
            objNewSession['hub_service@odata.bind'] = prevStudent['serviceId'];

            objNewSession['hub_resourceid@odata.bind'] = newStudent.resourceId;
            objNewSession['hub_session_date'] = moment(newStudent.startHour).format('YYYY-MM-DD');
            objNewSession['hub_start_time'] = this.convertToMinutes(moment(newStudent.start).format("h:mm A"));
            objNewSession['hub_end_time'] = objNewSession['hub_start_time'] + 60;
            objNewSession['hub_deliverytype'] = newStudent.deliveryTypeId;
            objNewSession['hub_deliverytype@OData.Community.Display.V1.FormattedValue'] = newStudent.deliveryType;
            var responseObj = data.saveStudenttoSession(objPrevSession, objNewSession);
            if (typeof responseObj == 'boolean') {
                if (responseObj) {
                    var index = this.convertedStudentObj.findIndex(function (x) {
                        return x.id == prevStudent.id &&
                               x.resourceId == prevStudent.resourceId &&
                               x.startHour.getTime() == prevStudent.startHour.getTime();
                    });
                    if (index != -1) {
                        this.convertedStudentObj[index] = newStudent;
                        this.populateStudentEvent([newStudent], true);
                    } 
                }
            }
            else if (typeof responseObj == 'object' && responseObj != null) {
                if (responseObj.hasOwnProperty('hub_studentsessionid')) {
                    newStudent['sessionId'] = responseObj['hub_studentsessionid'];
                    newStudent['start'] = newStudent.start;
                    newStudent['end'] = newStudent.end;
                    newStudent['resourceId'] = responseObj['hub_resourceid@odata.bind'];
                    newStudent['sessiontype'] = responseObj['hub_sessiontype'];
                    newStudent['sessionStatus'] = responseObj['hub_session_status'];
                    delete newStudent.isFromMasterSchedule;
                    var index = this.convertedStudentObj.findIndex(function (x) {
                        return x.id == prevStudent.id &&
                               x.resourceId == prevStudent.resourceId &&
                               x.startHour.getTime() == prevStudent.startHour.getTime();;
                    });
                    if (index != -1) {
                        this.convertedStudentObj[index] = newStudent;
                        this.populateStudentEvent([newStudent], true);
                    }
                }
            }
        }
    }

    this.saveTeacherToSession = function (teacher, prevTeacher) {
        var self = this; 
        var objPrevSession = {};
        var objNewSession = {};
        if (teacher != undefined) {
            if(prevTeacher['isFromMasterSchedule']){
            }
            else{
                objPrevSession['hub_staff_scheduleid'] = prevTeacher['scheduleId'];
                objNewSession['hub_product_service@odata.bind'] = prevTeacher['serviceId'];
            }
            
            objPrevSession['hub_resourceid@odata.bind'] = prevTeacher['resourceId'];
            objPrevSession['hub_start_time'] = this.convertToMinutes(moment(prevTeacher.start).format("h:mm A"));
            objPrevSession['hub_end_time'] = this.convertToMinutes(moment(prevTeacher.end).format("h:mm A"));
            objPrevSession['hub_center_value'] = prevTeacher['locationId'];
            // New object
            objNewSession['hub_staff@odata.bind'] = teacher['id'];
            objNewSession['hub_center_value'] = teacher['locationId'];
            objNewSession['hub_resourceid@odata.bind'] = teacher['resourceId'];
            objNewSession['hub_date'] = moment(teacher.start).format("YYYY-MM-DD");
            objNewSession['hub_start_time'] = this.convertToMinutes(moment(teacher.start).format("h:mm A"));
            objNewSession['hub_end_time'] = this.convertToMinutes(moment(teacher.end).format("h:mm A"));
            objNewSession['hub_schedule_type'] = 3;
            var responseObj = data.saveTeachertoSession(objPrevSession, objNewSession);
            if (typeof responseObj == 'boolean') {
                if (responseObj) {
                    self.populateTeacherEvent([teacher], true);
                    return responseObj;
                }
            }
            else if (typeof responseObj == 'object' && responseObj != null) {
                if (responseObj.hasOwnProperty('hub_staff_scheduleid')) {
                    if(teacher.hasOwnProperty('isFromMasterSchedule')){
                        delete teacher.isFromMasterSchedule;
                        delete teacher.pinId;
                    }
                    teacher['scheduleId'] = responseObj['hub_staff_scheduleid'];
                    var index = self.convertedTeacherObj.findIndex(function (x) {
                        return x.id == teacher.id &&
                            x.startHour.getTime() == prevTeacher.startHour.getTime() &&
                            x.resourceId == prevTeacher.resourceId;
                    });
                    if (index != -1) {
                        self.convertedTeacherObj[index] = teacher;
                        self.populateTeacherEvent([teacher], true);
                    }
                }
            }
        }
    }

    this.studentSessionCnfmPopup = function (t, date, allDay, ev, ui, resource, elm, message) {
        wjQuery("#dialog > .dialog-msg").text(message);
        wjQuery("#dialog").dialog({
            resizable: false,
            height: "auto",
            width: 350,
            draggable : false,
            modal: true,
            buttons: {
                Yes: function () {
                    wjQuery(elm).attr("tempPinId", wjQuery(elm).attr("pinnedId"));
                    wjQuery(elm).removeAttr("pinnedId");
                    t.studentSessionConflictCheck(t, date, allDay, ev, ui, resource, elm);
                    wjQuery(this).dialog("close");
                },
                No: function () {
                    wjQuery(this).dialog("close");
                }
            }
        });
    }

    this.studentSofCnfmPopup = function (t, date, allDay, ev, ui, resource, elm, message) {
        wjQuery("#dialog > .dialog-msg").text(message);
        wjQuery("#dialog").dialog({
            resizable: false,
            height: "auto",
            width: 350,
            modal: true,
            buttons: {
                Yes: function () {
                    t.studentSofConflictCheck(t, date, allDay, ev, ui, resource, elm);
                    wjQuery(this).dialog("close");
                },
                No: function () {
                    wjQuery(this).dialog("close");
                }
            }
        });
    }

    this.teacherSessionCnfmPopup = function (t, date, allDay, ev, ui, resource, elm, message) {
        wjQuery("#dialog > .dialog-msg").text(message);
        wjQuery("#dialog").dialog({
            resizable: false,
            height: "auto",
            width: 350,
            modal: true,
            buttons: {
                Yes: function () {
                    t.teacherSessionConflictCheck(t, date, allDay, ev, ui, resource, elm);
                    wjQuery(this).dialog("close");
                },
                No: function () {
                    wjQuery(this).dialog("close");
                }
            }
        });
    }

    this.taPaneCnfmPopup = function (t, date, allDay, ev, ui, resource, elm, message) {
        wjQuery("#dialog > .dialog-msg").text(message);
        wjQuery("#dialog").dialog({
            resizable: false,
            height: "auto",
            width: 350,
            modal: true,
            buttons: {
                Yes: function () {
                    t.tapaneConflictCheck(t, date, allDay, ev, ui, resource, elm);
                    wjQuery(this).dialog("close");
                },
                No: function () {
                    wjQuery(this).dialog("close");
                }
            }
        });
    }

    this.prompt = function (message) {
        wjQuery("#dialog > .dialog-msg").text(message);
        wjQuery("#dialog").dialog({
            resizable: false,
            height: "auto",
            width: 350,
            modal: true,
            buttons: {
                // "Confirm": function() {
                //   t.tapaneConflictCheck(t,date, allDay,ev,ui,resource,elm);
                //   wjQuery( this ).dialog( "close" );
                // },
                Close: function () {
                    wjQuery(this).dialog("close");
                }
            }
        });
    }

    this.getProgramObj = function (teacherId) {
        var programObj = [];
        this.staffProgram.map(function (x) {
            if (x.astaffprogram_x002e_hub_staffid == teacherId) {
                var PrograExist = programObj.map(function (y) {
                    return y;
                }).indexOf(x['hub_programid']);
                if (PrograExist == -1) {
                    var obj = {
                        id: x['hub_programid'],
                        color: x['hub_color']
                    }
                    programObj.push(obj);
                }
            }
        }).indexOf(teacherId);
        return programObj;
    }

    this.showConflictMsg = function () {
      wjQuery(".sof-btn, .fc-event,.info-icon, .onetoone").tooltip({
          tooltipClass: "custom-conflict",
          track: true,
          content: function () {
              return wjQuery(this).prop('title').replace('|', '<br/>');
          }
      });
    }

    // Conflict messages update method
    this.updateConflictMsg = function (event) {
        var msg = "";
        var self = this;
        var title = wjQuery(event.title);
        for (var i = 0; i < title.length; i++) {
            if (title[i].className == 'conflict') {
                title.splice(i, 1);
                event.title = '';
                for (var j = 0; j < title.length; j++) {
                    event.title += title[j].outerHTML;
                }
                break;
            }
        }
        if (event.conflictMsg.length) {
          wjQuery.each(event.conflictMsg, function (k, v) {
              msg += (k + 1) + ". " + self.conflictMsg[v] + "|";
          });
          var lastIndex = msg.lastIndexOf("|");
          msg = msg.substring(0, lastIndex);
          if (event.title.indexOf('<img class="conflict" title="' + msg + '" src="/webresources/hub_/calendar/images/warning.png">') == -1) {
              event.title += '<img class="conflict" title="' + msg + '" src="/webresources/hub_/calendar/images/warning.png">';
          }
        }
    }

    this.makeupPopup = function (makeupList, placeholderEvent, isForMakeup) {
        var self = this;
        makeupList = (makeupList == null || makeupList == undefined) ? [] : makeupList;
        makeupList = this.getUniqueFromMakeupNFloat(this.convertMakeupNFloatObj(makeupList));
        var idArry = wjQuery(placeholderEvent).prev("span").attr("uniqueid").split('_');
        if (makeupList.length) {
            var list = "";
            if (isForMakeup) {
                wjQuery.each(makeupList, function (k, v) {
                    list += "<li id='" + v.sessionId + "' class='makeup-item' >" + v.fullName + ", " + v.grade + "</li>";
                });
            } else {
                wjQuery.each(makeupList, function (k, v) {
                    list += "<li id='" + v.id + "' class='makeup-item' >" + v.fullName + ", " + v.grade + "</li>";
                });
            }
            wjQuery("#makeup > .makeup-lst").html(list);
            wjQuery("#makeup").dialog({
                resizable: false,
                height: 300,
                width: 350,
                modal: true,
                buttons: {
                    Cancel: function () {
                        wjQuery(this).dialog("close");
                    }
                }
            });

            if (isForMakeup) {
                wjQuery("#makeup").dialog('option', 'title', 'Add Makup');
            } else {
                wjQuery("#makeup").dialog('option', 'title', 'Add Float');
            }

            // On click Makup student save makeup session will be called
            wjQuery(".makeup-item").click(function (event) {
                wjQuery(".loading").show();
                var objSession = {};
                var id = wjQuery(this).attr("id");
                var nameNGrade = wjQuery(this).text();
                var start = self.convertToMinutes(moment(idArry[2]).format("h:mm A"));
                var studentObj = [];
                if (isForMakeup) {
                    studentObj = makeupList.filter(function (obj) {
                        return obj.sessionId == id;
                    });
                }else{
                    studentObj = makeupList.filter(function (obj) {
                        return obj.id == id;
                    });
                }
                if (studentObj.length) {
                    if (isForMakeup) {
                        objSession['hub_studentsessionid'] = studentObj[0].sessionId;
                        objSession["isForMakeup"] = true;
                    } else {
                        objSession['hub_studentsessionid'] = "";
                        objSession["isForMakeup"] = false;
                    }
                    objSession["hub_enrollment@odata.bind"] = studentObj[0]["enrollmentId"];
                    objSession["hub_student@odata.bind"] = studentObj[0].id;
                    objSession["hub_service@odata.bind"] = studentObj[0]["serviceId"];
                    objSession["hub_center@odata.bind"] = studentObj[0]["locationId"];
                    objSession["hub_session_date"] = moment(new Date(idArry[2])).format("YYYY-MM-DD");
                    objSession["hub_start_time"] = start;
                    objSession["hub_end_time"] = start + 60;

                    if (studentObj[0]["is1to1"] != undefined) {
                        objSession["hub_is_1to1"] = studentObj[0]["is1to1"];
                    }
                    objSession["hub_resourceid@odata.bind"] = idArry[1];
                    var eventId = idArry[1] + idArry[2];
                    var eventObj = self.calendar.fullCalendar('clientEvents', eventId);
                    var callSave = false;
                    var allowToDropStudent = self.validateStudentOnSameRow(studentObj[0].id, idArry[2]);
                    if(allowToDropStudent){
                      if (eventObj[0].hasOwnProperty("students") && eventObj[0].students.length > 0) {
                          var stdIndex = eventObj[0].students.findIndex(function (x) {
                              return x.id == studentObj[0].id;
                          });
                          if (stdIndex == -1) {
                              callSave = true;
                          }
                      } else {
                          callSave = true;
                      }
                      if (callSave) {
                          var responseObj = data.saveMakeupNFloat(objSession);
                          if (responseObj != null) {
                              var uniqueid = studentObj[0].id + "_" + idArry[1] + "_" + idArry[2];
                              // Update New student Session
                              studentObj[0]['resourceId'] = idArry[1];
                              studentObj[0]['start'] = new Date(idArry[2]);
                              studentObj[0]['startHour'] = new Date(idArry[2]);
                              studentObj[0]['end'] = new Date(new Date(idArry[2]).setHours(new Date(idArry[2]).getHours() + 1));
                              studentObj[0]['sessionId'] = responseObj['hub_studentsessionid'];
                              studentObj[0]['sessionDate'] = responseObj['hub_session_date'];
                              if(responseObj['hub_sessiontype'] != undefined){
                                studentObj[0]['sessiontype'] = responseObj['hub_sessiontype'];
                              }
                              if(responseObj['hub_session_status'] != undefined){
                                studentObj[0]['sessionStatus'] = responseObj['hub_session_status'];
                              }
                              // update Student
                              self.convertedStudentObj.push(studentObj[0]);
                              self.populateStudentEvent([studentObj[0]], true);
                              self.draggable('draggable');
                              wjQuery("#makeup").dialog("close");
                              wjQuery(".loading").hide();
                          } else {
                              wjQuery(".loading").hide();
                              wjQuery("#makeup").dialog("close");
                          }
                      } else {
                          wjQuery(".loading").hide();
                          wjQuery("#makeup").dialog("close");
                      }
                    }else{
                      wjQuery(".loading").hide();
                      wjQuery("#makeup").dialog("close");
                      self.prompt("The selected student is already scheduled for the respective timeslot.");
                    }
                }
            });
        }
        else{
            wjQuery("#makeup > .makeup-lst").html('No Students found');
            wjQuery("#makeup").dialog({
                resizable: false,
                height: 300,
                width: 350,
                modal: true,
                buttons: {
                    Cancel: function () {
                        wjQuery(this).dialog("close");
                    }
                }
            });
            if (isForMakeup) {
                wjQuery("#makeup").dialog('option', 'title', 'Add Makup');
            } else {
                wjQuery("#makeup").dialog('option', 'title', 'Add Float');
            }
        }
    }

    this.getUniqueFromMakeupNFloat = function (makeupList){
      var uniquewList = [];
      wjQuery.each(makeupList, function (ke, val) {
        var index = uniquewList.findIndex(function (x) {
          return x.id == val.id && x.enrollmentId == val.enrollmentId
        });
        if(index == -1){
          uniquewList.push(val);
        }else{
          if((new Date(makeupList[index].expiryDate)).getTime() > (new Date(val.expiryDate)).getTime()){
            uniquewList.splice(index, 1);
            uniquewList.push(val);
          }
        }
      });
      return uniquewList;
    }

    this.convertMakeupNFloatObj = function (makeupList) {
        eventObjList = [];
        wjQuery.each(makeupList, function (ke, val) {
            var sDate = new Date(val['hub_session_date'] + " " + val['hub_start_time@OData.Community.Display.V1.FormattedValue']);
            var eDate = new Date(val['hub_session_date'] + " " + val['hub_end_time@OData.Community.Display.V1.FormattedValue']);
            var startHour = new Date(val['hub_session_date'] + " " + val['hub_start_time@OData.Community.Display.V1.FormattedValue']);
            startHour = startHour.setMinutes(0);
            startHour = new Date(new Date(startHour).setSeconds(0));
            var obj = {
                id: val._hub_student_value,
                name: val["_hub_student_value@OData.Community.Display.V1.FormattedValue"],
                start: sDate,
                end: eDate,
                sessionDate: val['hub_session_date'],
                startHour: startHour,
                gradeId: val['astudent_x002e_hub_grade'],
                grade: val['astudent_x002e_hub_grade@OData.Community.Display.V1.FormattedValue'],
                deliveryTypeId: val['aproductservice_x002e_hub_deliverytype'],
                deliveryType: val['aproductservice_x002e_hub_deliverytype@OData.Community.Display.V1.FormattedValue'],
                subject: val['aprogram_x002e_hub_areaofinterest@OData.Community.Display.V1.FormattedValue'],
                subjectId: val['aprogram_x002e_hub_areaofinterest'],
                subjectColorCode: val['aprogram_x002e_hub_color'],
                programId: val['aprogram_x002e_hub_programid'],
                serviceId: val['_hub_service_value'],
                sessionId: val['hub_studentsessionid'],
                sessionStatus : val['hub_session_status'],
                sessionType: val['hub_sessiontype'],
                duration: val['aproductservice_x002e_hub_duration'],
                timeSlotType: val['aproductservice_x002e_hub_timeslottype'],
                namedHoursId: val['aproductservice_x002e_hub_namedgfhoursid'],
                expiryDate: val['hub_makeup_expiry_date']
            }

            if(val['hub_name'] != undefined){
              obj['fullName'] = val['hub_name'];
            }else{
              obj['fullName'] = val["_hub_enrollment_value@OData.Community.Display.V1.FormattedValue"];
            }

            if(val["hub_is_1to1"] == undefined){
                obj['is1to1'] = false;
            }else{
                obj['is1to1'] = val["hub_is_1to1"];
            }

            if (val['_hub_enrollment_value'] != undefined) {
                obj['enrollmentId'] = val['_hub_enrollment_value'];
            } else if (val['hub_enrollmentid'] != undefined) {
                obj['enrollmentId'] = val['hub_enrollmentid'];
            }

            if (val['_hub_center_value'] != undefined) {
                obj['locationId'] = val['_hub_center_value'];
                obj['locationName'] = val['_hub_center_value@OData.Community.Display.V1.FormattedValue'];
            } else if (val['_hub_location_value'] != undefined) {
                obj['locationId'] = val['_hub_location_value'];
                obj['locationName'] = val['_hub_location_value@OData.Community.Display.V1.FormattedValue'];
            }
            eventObjList.push(obj);
        });
        return eventObjList;
    }

    this.removeTeacher = function (event) {
        var removeTeacherObj = {};
        var uniqueId = wjQuery(event).attr('uniqueId');
        var uniqueIds = wjQuery(event).attr('uniqueId').split('_');
        var startTime = uniqueId.split('_')[2];
        var teacherId = wjQuery(event).attr("uniqueid").split("_")[0];
        var index = this.convertedTeacherObj.findIndex(function (x) {
            return x.id == teacherId &&
                   x.resourceId == uniqueIds[1] &&
                   x.startHour.getTime() == new Date(startTime).getTime();
        });
        var teacherObj = this.convertedTeacherObj[index];
        if(teacherObj.hasOwnProperty('isFromMasterSchedule')){
            removeTeacherObj['hub_staff@odata.bind'] = teacherObj['id'];
            removeTeacherObj['hub_center_value'] = teacherObj['locationId'];
            removeTeacherObj['hub_resourceid@odata.bind'] = teacherObj['resourceId'];
            removeTeacherObj['hub_date'] = moment(teacherObj.start).format("YYYY-MM-DD");
            removeTeacherObj['hub_start_time'] = this.convertToMinutes(moment(teacherObj.start).format("h:mm A"));
            removeTeacherObj['hub_end_time'] = this.convertToMinutes(moment(teacherObj.end).format("h:mm A"));
            removeTeacherObj['hub_schedule_type'] = 3;
        }
        else{
            removeTeacherObj['hub_staff_scheduleid'] = teacherObj["scheduleId"];
        }
        var responseObj = true; 
        if(teacherObj.hasOwnProperty('isFromMasterSchedule')){
            responseObj = true;
        }    
        else{
           responseObj = data.removeTeacher(removeTeacherObj)
        }
        if (typeof(responseObj) == 'boolean' || typeof(responseObj) == 'object') {
            if(typeof(responseObj) == 'object'){
                if(teacherObj.hasOwnProperty('isFromMasterSchedule')){
                    delete teacherObj.isFromMasterSchedule;
                    teacherObj.scheduleId = responseObj.hub_staff_scheduleid;
                }
                this.convertedTeacherObj[index] = teacherObj;
            }
            var prevEventId = wjQuery(event).attr("eventid");
            var prevEvent = self.calendar.fullCalendar('clientEvents', prevEventId);
            if (prevEvent) {
                // remove teacher from staff sechedule
                this.convertedTeacherObj.splice(index, 1);

                var eventTitleHTML = wjQuery(prevEvent[0].title);
                for (var i = 0; i < eventTitleHTML.length; i++) {
                    if (wjQuery(eventTitleHTML[i]).attr('value') == teacherId) {
                        eventTitleHTML.splice(i, 1);
                    }
                }
                if (eventTitleHTML.prop('outerHTML') != undefined) {
                    if (eventTitleHTML.length == 1) {
                        if (prevEvent[0].teachers.length == 1) {
                            prevEvent[0].title = "<span class='placeholder'>Teacher name</span>";
                            prevEvent[0].title += eventTitleHTML.prop('outerHTML');
                        } else {
                            prevEvent[0].title = eventTitleHTML.prop('outerHTML');
                        }
                    } else {
                        prevEvent[0].title = "";
                        if (prevEvent[0].teachers.length == 1) {
                            prevEvent[0].title += "<span class='placeholder'>Teacher name</span>";
                        }
                        for (var i = 0; i < eventTitleHTML.length; i++) {
                            prevEvent[0].title += eventTitleHTML[i].outerHTML;
                        }

                        // Teacher conflict removal               
                        if (prevEvent[0].teachers.length == 2) {
                            var msgIndex = prevEvent[0].conflictMsg.map(function (x) {
                                return x;
                            }).indexOf(0);
                            if (msgIndex > -1) {
                                prevEvent[0].conflictMsg.splice(msgIndex, 1);
                            }
                            self.updateConflictMsg(prevEvent[0]);
                            if (prevEvent[0].title.indexOf('<span class="student-placeholder-'+prevEvent[0].deliveryType+'">Student name</span>') == -1) {
                                prevEvent[0].title += '<span class="student-placeholder-'+prevEvent[0].deliveryType+'">Student name</span>';
                                self.addContext("", 'studentPlaceholder', true, prevEvent[0].deliveryType);
                            }
                        }
                    }
                    this.calendar.fullCalendar('updateEvent', prevEvent);
                    var removeTeacherIndex = prevEvent[0].teachers.map(function (x) {
                        return x.id;
                    }).indexOf(teacherId);
                    prevEvent[0].teachers.splice(removeTeacherIndex, 1);

                    // remove all conflicts By passing prevEvent Object 
                    self.removeAllConflictsFromPrevEvent(prevEvent[0]);

                    if ((eventTitleHTML.length == 1 && (eventTitleHTML[0].className == "placeholder" || eventTitleHTML[0].className == "student-placeholder-"+prevEvent[0].deliveryType)) ||
                       (eventTitleHTML.length == 2 && eventTitleHTML[0].className == "placeholder" && eventTitleHTML[1].className == "student-placeholder-"+prevEvent[0].deliveryType) ||
                       (eventTitleHTML.length == 3 && eventTitleHTML[0].className == "onetoone" && eventTitleHTML[1].className == "placeholder" && eventTitleHTML[2].className == "student-placeholder-"+prevEvent[0].deliveryType)) {
                        for (var i = 0; i < this.eventList.length; i++) {
                          if (this.eventList[i].id == prevEventId)
                            this.eventList.splice(i, 1);
                            this.calendar.fullCalendar('removeEvents', prevEventId);
                        }
                    }
                } else {
                    for (var i = 0; i < this.eventList.length; i++) {
                      if (this.eventList[i].id == prevEventId)
                          this.eventList.splice(i, 1);
                          this.calendar.fullCalendar('removeEvents', prevEventId);
                    }
                }
                self.calendar.fullCalendar('updateEvent', prevEvent);
                self.populateTAPane(self.taList);
            }
        }else{
            // Dont remove taecher from event on which he is placed
        }
        self.openSofPane();
        self.showConflictMsg();
        self.draggable('draggable');
    }

    this.generateWeekEventObject = function(arrayList,label){
        if(arrayList.length){
            if(label == 'teacherSchedule'){
                for (var i = 0; i < arrayList.length; i++) {
                    if(arrayList[i].hasOwnProperty('startHour') && arrayList[i].hasOwnProperty('resourceId')){
                        var resourceObj = this.getResourceObj(arrayList[i].resourceId);
                        arrayList[i].isTeacher = true;
                        arrayList[i].deliveryType = resourceObj.deliveryType;
                        arrayList[i].deliveryTypeId = resourceObj.deliveryTypeId;
                        if(this.weekEventObject.hasOwnProperty(arrayList[i].startHour)){
                            if(this.weekEventObject[arrayList[i].startHour].hasOwnProperty('teacherSchedule')){
                                if(arrayList[i].deliveryType == 'Personal Instruction'){
                                    var index = -1;
                                    for (var k = 0; k < this.weekEventObject[arrayList[i].startHour].teacherSchedule.pi.length; k++) {
                                        if(this.weekEventObject[arrayList[i].startHour].teacherSchedule.pi[k].id == arrayList[i].id){
                                            index = k;
                                            break;
                                        }
                                    }
                                    if(index == -1){
                                        this.weekEventObject[arrayList[i].startHour].teacherSchedule.pi.push(arrayList[i]);
                                    }
                                }
                                else if(arrayList[i].deliveryType == 'Group Instruction'){
                                    var index = -1;
                                    for (var k = 0; k < this.weekEventObject[arrayList[i].startHour].teacherSchedule.gi.length; k++) {
                                        if(this.weekEventObject[arrayList[i].startHour].teacherSchedule.gi[k].id == arrayList[i].id){
                                            index = k;
                                            break;
                                        }
                                    }
                                    if(index == -1)
                                        this.weekEventObject[arrayList[i].startHour].teacherSchedule.gi.push(arrayList[i]);
                                }
                                else if(arrayList[i].deliveryType == 'Group Facilitation'){
                                    var index = -1;
                                    for (var k = 0; k < this.weekEventObject[arrayList[i].startHour].teacherSchedule.gf.length; k++) {
                                        if(this.weekEventObject[arrayList[i].startHour].teacherSchedule.gf[k].id == arrayList[i].id){
                                            index = k;
                                            break;
                                        }
                                    }
                                    if(index == -1)
                                        this.weekEventObject[arrayList[i].startHour].teacherSchedule.gf.push(arrayList[i]);
                                }
                            }else{
                                this.weekEventObject[arrayList[i].startHour].teacherSchedule = {};
                                this.weekEventObject[arrayList[i].startHour].teacherSchedule.pi = [];
                                this.weekEventObject[arrayList[i].startHour].teacherSchedule.gi = [];
                                this.weekEventObject[arrayList[i].startHour].teacherSchedule.gf = [];
                                if(arrayList[i].deliveryType == 'Personal Instruction'){
                                    this.weekEventObject[arrayList[i].startHour].teacherSchedule.pi.push(arrayList[i]);
                                }
                                else if(arrayList[i].deliveryType == 'Group Instruction'){
                                    this.weekEventObject[arrayList[i].startHour].teacherSchedule.gi.push(arrayList[i]);
                                }
                                else if(arrayList[i].deliveryType == 'Group Facilitation'){
                                    this.weekEventObject[arrayList[i].startHour].teacherSchedule.gf.push(arrayList[i]);
                                }
                            }
                        }
                        else{
                            this.weekEventObject[arrayList[i].startHour] = {};
                            this.weekEventObject[arrayList[i].startHour].teacherSchedule = {};
                            this.weekEventObject[arrayList[i].startHour].teacherSchedule.pi = [];
                            this.weekEventObject[arrayList[i].startHour].teacherSchedule.gi = [];
                            this.weekEventObject[arrayList[i].startHour].teacherSchedule.gf = [];
                            if(arrayList[i].deliveryType == 'Personal Instruction'){
                                this.weekEventObject[arrayList[i].startHour].teacherSchedule.pi.push(arrayList[i]);
                            }
                            else if(arrayList[i].deliveryType == 'Group Instruction'){
                                this.weekEventObject[arrayList[i].startHour].teacherSchedule.gi.push(arrayList[i]);
                            }
                            else if(arrayList[i].deliveryType == 'Group Facilitation'){
                                this.weekEventObject[arrayList[i].startHour].teacherSchedule.gf.push(arrayList[i]);
                            }
                        }
                    }
                }
            }
            else if(label == 'teacherAvailability'){
                this.taList = [];
                var currentView = this.calendar.fullCalendar('getView');
                currentView.start = new Date(currentView.start).setHours(0);
                currentView.start = new Date(new Date(currentView.start).setMinutes(0));
                currentView.start = new Date(new Date(currentView.start).setSeconds(0));
                currentView.end = new Date(currentView.end).setHours(0);
                currentView.end = new Date(new Date(currentView.end).setMinutes(0));
                currentView.end = new Date(new Date(currentView.end).setSeconds(0));
                for (var i = 0; i < arrayList.length; i++) {
                    var obj = {
                            name: arrayList[i]['_hub_staffid_value@OData.Community.Display.V1.FormattedValue'],
                            id: arrayList[i]['_hub_staffid_value'],
                            locationId: arrayList[i]['astaff_x002e_hub_center'],
                            deliveryTypeId: arrayList[i]['_hub_deliverytype_value'],
                            subjects: this.getTeacherSubjects(arrayList[i]),
                            isTeacher: true
                        };
                    if(arrayList[i]['hub_startdate'] != undefined){
                        obj.startDate = new Date(arrayList[i]['hub_startdate']);
                        obj.startDate = new Date(obj.startDate).setHours(0);
                        obj.startDate = new Date(new Date(obj.startDate).setMinutes(0));
                        obj.startDate = new Date(new Date(obj.startDate).setSeconds(0));
                    }
                    if(arrayList[i]['hub_enddate'] != undefined){
                        obj.endDate = new Date(arrayList[i]['hub_enddate']);
                        obj.endDate = new Date(obj.endDate).setHours(0);
                        obj.endDate = new Date(new Date(obj.endDate).setMinutes(0));
                        obj.endDate = new Date(new Date(obj.endDate).setSeconds(0));
                    }else{
                        obj.endDate = new Date(currentView.end.getTime());
                        obj.endDate = new Date(obj.endDate).setHours(0);
                        obj.endDate = new Date(new Date(obj.endDate).setMinutes(0));
                        obj.endDate = new Date(new Date(obj.endDate).setSeconds(0));
                    }
                    for(var j = currentView.start.getTime();j<currentView.end.getTime();j=j+(24*60*60*1000)){
                        if (arrayList[i]['hub_' + moment(j).format('dddd').toLowerCase()]) {    
                        var taObject = wjQuery.extend(true, {}, obj);
                            if(j > taObject.startDate.getTime() && j < taObject.endDate.getTime()){
                                switch (moment(j).format('dddd').toLowerCase()) {
                                case 'monday':
                                    taObject.startTime = new Date(moment(j).format('YYYY-MM-DD')+" "+arrayList[i]['hub_monstarttime@OData.Community.Display.V1.FormattedValue']);
                                    if (arrayList[i]['hub_monendtime@OData.Community.Display.V1.FormattedValue'] == undefined) {
                                        taObject.endTime = new Date(taObject.startTime.setHours(taObject.startTime.getHours() + 1));
                                        taObject.startHour = taObject.startTime;
                                        taObject.startHour = new Date(taObject.startHour.setMinutes(0));
                                        this.taList.push(taObject);
                                    }
                                    else {
                                        taObject.endTime = new Date(moment(j).format('YYYY-MM-DD')+" "+arrayList[i]['hub_monendtime@OData.Community.Display.V1.FormattedValue']);
                                        var staffStartHour = taObject.startTime;
                                        staffStartHour = new Date(staffStartHour.setMinutes(0));
                                        do {
                                            var newObject = wjQuery.extend(true, {}, taObject);
                                            var start = new Date(staffStartHour.getTime());
                                            newObject.startHour = start;
                                            this.taList.push(newObject);
                                            staffStartHour = new Date(staffStartHour.setHours(staffStartHour.getHours() + 1));
                                        }
                                        while (staffStartHour.getTime() < taObject.endTime.getTime());
                                    }
                                    break;
                                case 'tuesday':
                                    taObject.startTime = new Date(moment(j).format('YYYY-MM-DD')+" "+arrayList[i]['hub_tuestarttime@OData.Community.Display.V1.FormattedValue']);
                                    if (arrayList[i]['hub_tueendtime@OData.Community.Display.V1.FormattedValue'] == undefined) {
                                        taObject.endTime = new Date(taObject.startTime.setHours(taObject.startTime.getHours() + 1));
                                        taObject.startHour = taObject.startTime;
                                        taObject.startHour = new Date(taObject.startHour.setMinutes(0));
                                        this.taList.push(taObject);
                                    }
                                    else {
                                        taObject.endTime = new Date(moment(j).format('YYYY-MM-DD')+" "+arrayList[i]['hub_tueendtime@OData.Community.Display.V1.FormattedValue']);
                                        var staffStartHour = taObject.startTime;
                                        staffStartHour = new Date(staffStartHour.setMinutes(0));
                                        do {
                                            var newObject = wjQuery.extend(true, {}, taObject);
                                            var start = new Date(staffStartHour.getTime());
                                            newObject.startHour = start;
                                            this.taList.push(newObject);
                                            staffStartHour = new Date(staffStartHour.setHours(staffStartHour.getHours() + 1));
                                        }
                                        while (staffStartHour.getTime() < taObject.endTime.getTime());
                                    }
                                    break;
                                case 'wednesday':
                                        taObject.startTime = new Date(moment(j).format('YYYY-MM-DD')+" "+arrayList[i]['hub_wedstarttime@OData.Community.Display.V1.FormattedValue']);
                                        if (arrayList[i]['hub_wedendtime@OData.Community.Display.V1.FormattedValue'] == undefined) {
                                            taObject.endTime = new Date(taObject.startTime.setHours(taObject.startTime.getHours() + 1));
                                            taObject.startHour = taObject.startTime;
                                            taObject.startHour = new Date(taObject.startHour.setMinutes(0));
                                            this.taList.push(taObject);
                                        }
                                        else {
                                            taObject.endTime = new Date(moment(j).format('YYYY-MM-DD')+" "+arrayList[i]['hub_wedendtime@OData.Community.Display.V1.FormattedValue']);
                                            var staffStartHour = taObject.startTime;
                                            staffStartHour = new Date(staffStartHour.setMinutes(0));
                                            do {
                                                var newObject = wjQuery.extend(true, {}, taObject);
                                                var start = new Date(staffStartHour.getTime());
                                                newObject.startHour = start;
                                                this.taList.push(newObject);
                                                staffStartHour = new Date(staffStartHour.setHours(staffStartHour.getHours() + 1));
                                            }
                                            while (staffStartHour.getTime() < taObject.endTime.getTime());
                                        }
                                    break;
                                case 'thursday':
                                        taObject.startTime = new Date(moment(j).format('YYYY-MM-DD')+" "+arrayList[i]['hub_thurstarttime@OData.Community.Display.V1.FormattedValue']);
                                        if (arrayList[i]['hub_thurendtime@OData.Community.Display.V1.FormattedValue'] == undefined) {
                                            taObject.endTime = new Date(taObject.startTime.setHours(taObject.startTime.getHours() + 1));
                                            taObject.startHour = taObject.startTime;
                                            taObject.startHour = new Date(taObject.startHour.setMinutes(0));
                                            this.taList.push(taObject);
                                        }
                                        else {
                                            taObject.endTime = new Date(moment(j).format('YYYY-MM-DD')+" "+arrayList[i]['hub_thurendtime@OData.Community.Display.V1.FormattedValue']);
                                            var staffStartHour = taObject.startTime;
                                            staffStartHour = new Date(staffStartHour.setMinutes(0));
                                            do {
                                                var newObject = wjQuery.extend(true, {}, taObject);
                                                var start = new Date(staffStartHour.getTime());
                                                newObject.startHour = start;
                                                this.taList.push(newObject);
                                                staffStartHour = new Date(staffStartHour.setHours(staffStartHour.getHours() + 1));
                                            }
                                            while (staffStartHour.getTime() < taObject.endTime.getTime());
                                        }
                                    break;
                                case 'friday':
                                        taObject.startTime = new Date(moment(j).format('YYYY-MM-DD')+" "+arrayList[i]['hub_fristarttime@OData.Community.Display.V1.FormattedValue']);
                                        if (arrayList[i]['hub_friendtime@OData.Community.Display.V1.FormattedValue'] == undefined) {
                                            taObject.endTime = new Date(taObject.startTime.setHours(taObject.startTime.getHours() + 1));
                                            taObject.startHour = taObject.startTime;
                                            taObject.startHour = new Date(taObject.startHour.setMinutes(0));
                                            this.taList.push(taObject);
                                        }
                                        else {
                                            taObject.endTime = new Date(moment(j).format('YYYY-MM-DD')+" "+arrayList[i]['hub_friendtime@OData.Community.Display.V1.FormattedValue']);
                                            var staffStartHour = taObject.startTime;
                                            staffStartHour = new Date(staffStartHour.setMinutes(0));
                                            do {
                                                var newObject = wjQuery.extend(true, {}, taObject);
                                                var start = new Date(staffStartHour.getTime());
                                                newObject.startHour = start;
                                                this.taList.push(newObject);
                                                staffStartHour = new Date(staffStartHour.setHours(staffStartHour.getHours() + 1));
                                            }
                                            while (staffStartHour.getTime() < taObject.endTime.getTime());
                                        }
                                    break;
                                case 'saturday':
                                        taObject.startTime = new Date(moment(j).format('YYYY-MM-DD')+" "+arrayList[i]['hub_satstarttime@OData.Community.Display.V1.FormattedValue']);
                                        if (arrayList[i]['hub_satendtime@OData.Community.Display.V1.FormattedValue'] == undefined) {
                                            taObject.endTime = new Date(taObject.startTime.setHours(taObject.startTime.getHours() + 1));
                                            taObject.startHour = taObject.startTime;
                                            taObject.startHour = new Date(taObject.startHour.setMinutes(0));
                                            this.taList.push(taObject);
                                        }
                                        else {
                                            taObject.endTime = new Date(moment(j).format('YYYY-MM-DD')+" "+arrayList[i]['hub_satendtime@OData.Community.Display.V1.FormattedValue']);
                                            var staffStartHour = taObject.startTime;
                                            staffStartHour = new Date(staffStartHour.setMinutes(0));
                                            do {
                                                var newObject = wjQuery.extend(true, {}, taObject);
                                                var start = new Date(staffStartHour.getTime());
                                                newObject.startHour = start;
                                                this.taList.push(newObject);
                                                staffStartHour = new Date(staffStartHour.setHours(staffStartHour.getHours() + 1));
                                            }
                                            while (staffStartHour.getTime() < taObject.endTime.getTime());
                                        }
                                    break;
                                case 'sunday':
                                        taObject.startTime = new Date(moment(j).format('YYYY-MM-DD')+" "+arrayList[i]['hub_sunstarttime@OData.Community.Display.V1.FormattedValue']);
                                        if (arrayList[i]['hub_sunendtime@OData.Community.Display.V1.FormattedValue'] == undefined) {
                                            taObject.endTime = new Date(taObject.startTime.setHours(taObject.startTime.getHours() + 1));
                                            taObject.startHour = taObject.startTime;
                                            taObject.startHour = new Date(taObject.startHour.setMinutes(0));
                                            this.taList.push(taObject);
                                        }
                                        else {
                                            taObject.endTime = new Date(moment(j).format('YYYY-MM-DD')+" "+arrayList[i]['hub_sunendtime@OData.Community.Display.V1.FormattedValue']);
                                            var staffStartHour = taObject.startTime;
                                            staffStartHour = new Date(staffStartHour.setMinutes(0));
                                            do {
                                                var newObject = wjQuery.extend(true, {}, taObject);
                                                var start = new Date(staffStartHour.getTime());
                                                newObject.startHour = start;
                                                this.taList.push(newObject);
                                                staffStartHour = new Date(staffStartHour.setHours(staffStartHour.getHours() + 1));
                                            }
                                            while (staffStartHour.getTime() < taObject.endTime.getTime());
                                        }
                                    break;
                                }
                            }
                        }
                    }
                }
                for (var i = 0; i < this.taList.length; i++) {
                    if(this.taList[i].hasOwnProperty('startHour')){
                        if(this.weekEventObject.hasOwnProperty(this.taList[i].startHour)){
                            if(this.weekEventObject[this.taList[i].startHour].hasOwnProperty('teacherAvailability')){
                                var index = -1;
                                for (var k = 0; k < this.weekEventObject[this.taList[i].startHour].teacherAvailability.length; k++) {
                                    if(this.weekEventObject[this.taList[i].startHour].teacherAvailability[k].id == this.taList[i].id){
                                        index = k;
                                        break;
                                    }
                                }
                                if(index == -1)
                                    this.weekEventObject[this.taList[i].startHour].teacherAvailability.push(this.taList[i]);
                            }else{
                                this.weekEventObject[this.taList[i].startHour].teacherAvailability = [];
                                this.weekEventObject[this.taList[i].startHour].teacherAvailability.push(this.taList[i]);    
                            }
                        }
                        else{
                            this.weekEventObject[this.taList[i].startHour] = {};
                            this.weekEventObject[this.taList[i].startHour].teacherAvailability = [];
                            this.weekEventObject[this.taList[i].startHour].teacherAvailability.push(this.taList[i]);
                        }
                    }
                }
            }
            else{
                for (var i = 0; i < arrayList.length; i++) {
                    if(arrayList[i].hasOwnProperty('startHour')){
                        if(this.weekEventObject.hasOwnProperty(arrayList[i].startHour)){
                            if(this.weekEventObject[arrayList[i].startHour].hasOwnProperty('student')){
                                if(arrayList[i].deliveryType == 'Personal Instruction'){
                                    var index = -1;
                                    for (var k = 0; k < this.weekEventObject[arrayList[i].startHour].student.pi.length; k++) {
                                        if(this.weekEventObject[arrayList[i].startHour].student.pi[k].id == arrayList[i].id){
                                            index = k;
                                            break;
                                        }
                                    }
                                    if(index == -1){
                                        if(arrayList[i].sessionStatus == SCHEDULE_STATUS ||
                                            arrayList[i].sessionStatus == RESCHEDULE_STATUS || 
                                            arrayList[i].sessionStatus == MAKEUP_STATUS || 
                                            arrayList[i].isFromMasterSchedule)
                                        this.weekEventObject[arrayList[i].startHour].student.pi.push(arrayList[i]);
                                    }

                                }
                                else if(arrayList[i].deliveryType == 'Group Instruction'){
                                    var index = -1;
                                    for (var k = 0; k < this.weekEventObject[arrayList[i].startHour].student.gi.length; k++) {
                                        if(this.weekEventObject[arrayList[i].startHour].student.gi[k].id == arrayList[i].id){
                                            index = k;
                                            break;
                                        }
                                    }
                                    if(index == -1){
                                        if(arrayList[i].sessionStatus == SCHEDULE_STATUS ||
                                            arrayList[i].sessionStatus == RESCHEDULE_STATUS || 
                                            arrayList[i].sessionStatus == MAKEUP_STATUS|| 
                                            arrayList[i].isFromMasterSchedule)
                                        this.weekEventObject[arrayList[i].startHour].student.gi.push(arrayList[i]);
                                    }
                                }
                                else if(arrayList[i].deliveryType == 'Group Facilitation'){
                                    var index = -1;
                                    for (var k = 0; k < this.weekEventObject[arrayList[i].startHour].student.gf.length; k++) {
                                        if(this.weekEventObject[arrayList[i].startHour].student.gf[k].id == arrayList[i].id){
                                            index = k;
                                            break;
                                        }
                                    }
                                    if(index == -1){
                                        if(arrayList[i].sessionStatus == SCHEDULE_STATUS ||
                                            arrayList[i].sessionStatus == RESCHEDULE_STATUS || 
                                            arrayList[i].sessionStatus == MAKEUP_STATUS|| 
                                            arrayList[i].isFromMasterSchedule)
                                        this.weekEventObject[arrayList[i].startHour].student.gf.push(arrayList[i]);
                                    }
                                }
                                
                            }
                            else{
                                this.weekEventObject[arrayList[i].startHour].student = {};
                                this.weekEventObject[arrayList[i].startHour].student.pi = [];
                                this.weekEventObject[arrayList[i].startHour].student.gf = [];
                                this.weekEventObject[arrayList[i].startHour].student.gi = [];
                                if(arrayList[i].deliveryType == 'Personal Instruction'){
                                    if(arrayList[i].sessionStatus == SCHEDULE_STATUS ||
                                            arrayList[i].sessionStatus == RESCHEDULE_STATUS || 
                                            arrayList[i].sessionStatus == MAKEUP_STATUS|| 
                                            arrayList[i].isFromMasterSchedule)
                                    this.weekEventObject[arrayList[i].startHour].student.pi.push(arrayList[i]);
                                }
                                else if(arrayList[i].deliveryType == 'Group Instruction'){
                                    if(arrayList[i].sessionStatus == SCHEDULE_STATUS ||
                                            arrayList[i].sessionStatus == RESCHEDULE_STATUS || 
                                            arrayList[i].sessionStatus == MAKEUP_STATUS|| 
                                            arrayList[i].isFromMasterSchedule)
                                    this.weekEventObject[arrayList[i].startHour].student.gi.push(arrayList[i]);
                                }
                                else if(arrayList[i].deliveryType == 'Group Facilitation'){
                                    if(arrayList[i].sessionStatus == SCHEDULE_STATUS ||
                                            arrayList[i].sessionStatus == RESCHEDULE_STATUS || 
                                            arrayList[i].sessionStatus == MAKEUP_STATUS|| 
                                            arrayList[i].isFromMasterSchedule)
                                    this.weekEventObject[arrayList[i].startHour].student.gf.push(arrayList[i]);
                                }
                            }
                        }
                        else{
                            this.weekEventObject[arrayList[i].startHour] = {};
                            this.weekEventObject[arrayList[i].startHour].student = {};
                            this.weekEventObject[arrayList[i].startHour].student.pi = [];
                            this.weekEventObject[arrayList[i].startHour].student.gf = [];
                            this.weekEventObject[arrayList[i].startHour].student.gi = [];
                            if(arrayList[i].deliveryType == 'Personal Instruction'){
                                if(arrayList[i].sessionStatus == SCHEDULE_STATUS ||
                                            arrayList[i].sessionStatus == RESCHEDULE_STATUS || 
                                            arrayList[i].sessionStatus == MAKEUP_STATUS|| 
                                            arrayList[i].isFromMasterSchedule)
                                this.weekEventObject[arrayList[i].startHour].student.pi.push(arrayList[i]);
                            }
                            else if(arrayList[i].deliveryType == 'Group Instruction'){
                                if(arrayList[i].sessionStatus == SCHEDULE_STATUS ||
                                            arrayList[i].sessionStatus == RESCHEDULE_STATUS || 
                                            arrayList[i].sessionStatus == MAKEUP_STATUS|| 
                                            arrayList[i].isFromMasterSchedule)
                                this.weekEventObject[arrayList[i].startHour].student.gi.push(arrayList[i]);
                            }
                            else if(arrayList[i].deliveryType == 'Group Facilitation'){
                                if(arrayList[i].sessionStatus == SCHEDULE_STATUS ||
                                            arrayList[i].sessionStatus == RESCHEDULE_STATUS || 
                                            arrayList[i].sessionStatus == MAKEUP_STATUS|| 
                                            arrayList[i].isFromMasterSchedule)
                                this.weekEventObject[arrayList[i].startHour].student.gf.push(arrayList[i]);
                            }
                        }
                    }
                }
            }
        }
    }

    this.renderWeekModal = function(calEvent, jsEvent, view){
        if(view.name == 'agendaWeek'){
            if(calEvent.deliveryType == 'Personal-Instruction'){
                for(var i in this.weekEventObject){
                    if(i == calEvent.start){
                        var groupByResource = {},sof = [],taList = [];
                        if(this.weekEventObject[i].hasOwnProperty('student')){
                            if(this.weekEventObject[i].student.hasOwnProperty('pi')){
                                for(var x=0;x<this.weekEventObject[i].student.pi.length;x++){
                                    if(this.weekEventObject[i].student.pi[x].hasOwnProperty('resourceId')){
                                        if(groupByResource.hasOwnProperty(this.weekEventObject[i].student.pi[x].resourceId)){
                                            groupByResource[this.weekEventObject[i].student.pi[x].resourceId].push(this.weekEventObject[i].student.pi[x]);
                                        }
                                        else{
                                            groupByResource[this.weekEventObject[i].student.pi[x].resourceId] = [];
                                            groupByResource[this.weekEventObject[i].student.pi[x].resourceId].push(this.weekEventObject[i].student.pi[x]);
                                        }
                                    }
                                    else{
                                        sof.push(this.weekEventObject[i].student.pi[x]);
                                    }
                                }
                            }
                        }
                        if(this.weekEventObject[i].hasOwnProperty('teacherSchedule')){
                            if(this.weekEventObject[i].teacherSchedule.hasOwnProperty('pi')){
                                for(var x=0;x<this.weekEventObject[i].teacherSchedule.pi.length;x++){
                                    if(groupByResource.hasOwnProperty(this.weekEventObject[i].teacherSchedule.pi[x].resourceId)){
                                        groupByResource[this.weekEventObject[i].teacherSchedule.pi[x].resourceId].push(this.weekEventObject[i].teacherSchedule.pi[x]);
                                    }
                                    else{
                                        groupByResource[this.weekEventObject[i].teacherSchedule.pi[x].resourceId] = [];
                                        groupByResource[this.weekEventObject[i].teacherSchedule.pi[x].resourceId].push(this.weekEventObject[i].teacherSchedule.pi[x]);
                                    }
                                }
                            }
                        }
                        if(this.weekEventObject[i].hasOwnProperty('teacherAvailability')){
                            taList = this.weekEventObject[i].teacherAvailability;
                        }
                    }
                }
                this.generateModalHtml(groupByResource,sof,taList);
            }
            else if(calEvent.deliveryType == 'Group-Instruction'){
                for(var i in this.weekEventObject){
                    if(i == calEvent.start){
                        var groupByResource = {},sof = [],taList = [];
                        if(this.weekEventObject[i].student.hasOwnProperty('gi')){
                            for(var x=0;x<this.weekEventObject[i].student.gi.length;x++){
                                if(this.weekEventObject[i].student.gi[x].hasOwnProperty('resourceId')){
                                    if(groupByResource.hasOwnProperty(this.weekEventObject[i].student.gi[x].resourceId)){
                                        groupByResource[this.weekEventObject[i].student.gi[x].resourceId].push(this.weekEventObject[i].student.gi[x]);
                                    }
                                    else{
                                        groupByResource[this.weekEventObject[i].student.gi[x].resourceId] = [];
                                        groupByResource[this.weekEventObject[i].student.gi[x].resourceId].push(this.weekEventObject[i].student.gi[x]);
                                    }
                                }
                                else{
                                    sof.push(this.weekEventObject[i].student.gi[x]);
                                }
                            }
                        }
                        if(this.weekEventObject[i].hasOwnProperty('teacherSchedule')){
                            if(this.weekEventObject[i].teacherSchedule.hasOwnProperty('gi')){
                                for(var x=0;x<this.weekEventObject[i].teacherSchedule.gi.length;x++){
                                    if(groupByResource.hasOwnProperty(this.weekEventObject[i].teacherSchedule.gi[x].resourceId)){
                                        groupByResource[this.weekEventObject[i].teacherSchedule.gi[x].resourceId].push(this.weekEventObject[i].teacherSchedule.gi[x]);
                                    }
                                    else{
                                        groupByResource[this.weekEventObject[i].teacherSchedule.gi[x].resourceId] = [];
                                        groupByResource[this.weekEventObject[i].teacherSchedule.gi[x].resourceId].push(this.weekEventObject[i].teacherSchedule.gi[x]);
                                    }
                                }
                            }
                        }
                        if(this.weekEventObject[i].hasOwnProperty('teacherAvailability')){
                            taList = this.weekEventObject[i].teacherAvailability;
                        }
                    }
                }
                this.generateModalHtml(groupByResource,sof,taList);
            }
            else if(calEvent.deliveryType == 'Group-Facilitation'){
                for(var i in this.weekEventObject){
                    if(i == calEvent.start){
                        var groupByResource = {},sof=[],taList = [];
                        if(this.weekEventObject[i].student.hasOwnProperty('gf')){
                            for(var x=0;x<this.weekEventObject[i].student.gf.length;x++){
                                if(this.weekEventObject[i].student.gf[x].hasOwnProperty('resourceId')){
                                    if(groupByResource.hasOwnProperty(this.weekEventObject[i].student.gf[x].resourceId)){
                                        groupByResource[this.weekEventObject[i].student.gf[x].resourceId].push(this.weekEventObject[i].student.gf[x]);
                                    }
                                    else{
                                        groupByResource[this.weekEventObject[i].student.gf[x].resourceId] = [];
                                        groupByResource[this.weekEventObject[i].student.gf[x].resourceId].push(this.weekEventObject[i].student.gf[x]);
                                    }
                                }
                                else{
                                    sof.push(this.weekEventObject[i].student.gf[x]);
                                }
                            }
                        }
                        if(this.weekEventObject[i].hasOwnProperty('teacherSchedule')){
                            if(this.weekEventObject[i].teacherSchedule.hasOwnProperty('gf')){
                                for(var x=0;x<this.weekEventObject[i].teacherSchedule.gf.length;x++){
                                    if(groupByResource.hasOwnProperty(this.weekEventObject[i].teacherSchedule.gf[x].resourceId)){
                                        groupByResource[this.weekEventObject[i].teacherSchedule.gf[x].resourceId].push(this.weekEventObject[i].teacherSchedule.gf[x]);
                                    }
                                    else{
                                        groupByResource[this.weekEventObject[i].teacherSchedule.gf[x].resourceId] = [];
                                        groupByResource[this.weekEventObject[i].teacherSchedule.gf[x].resourceId].push(this.weekEventObject[i].teacherSchedule.gf[x]);
                                    }
                                }
                            }
                        }
                        if(this.weekEventObject[i].hasOwnProperty('teacherAvailability')){
                            taList = this.weekEventObject[i].teacherAvailability;
                        }
                    }
                }
                this.generateModalHtml(groupByResource,sof,taList);
            }
            wjQuery("#weekmodal").dialog({
                modal: true,
                draggable: false,
                resizable: false,
                height: "auto",
                width: 800
            });
            wjQuery("#weekmodal").dialog('option', 'title', moment(calEvent.start).format('dddd')+" "+moment(calEvent.start).format('hh:mm A'));
        }
    };

    this.generateModalHtml = function(groupByResource,sof,taList){
        var width = 0,html= "<div class='holder'>";
        if(Object.keys(groupByResource).length){
            width = Object.keys(groupByResource).length * 150;
            for(var i in groupByResource){
                var oneResource = "<div class='resourceHolder'>";
                var teacherPlaceFlag = true,studentPlaceFlag = true,teacherHtml= '',studentHtml = '';
                for(var j=0;j<groupByResource[i].length;j++){
                    if(groupByResource[i][j].isTeacher){
                        if(teacherPlaceFlag){
                            teacherPlaceFlag = false;
                            teacherHtml+="<div class='teacherHolder'>";
                        }
                        teacherHtml+="<div>"+groupByResource[i][j].name+"</div>";
                    }
                    else{
                        if(studentPlaceFlag){
                            studentPlaceFlag = false;
                            studentHtml+="<div class='studentHolder'>";
                        }
                        studentHtml+="<div class='wk-student'>"+groupByResource[i][j].name+", " + groupByResource[i][j].grade + "<i class='material-icons' style='color:" + groupByResource[i][j]['subjectColorCode'] + "'>location_on</i></div>";
                    }
                }
                if(!teacherPlaceFlag){
                    teacherHtml += "</div>";
                    oneResource += teacherHtml;
                }
                else{
                    teacherHtml += "<div class='teacherHolder'><div class='placeholder'>Teacher Name</div></div>";
                    oneResource += teacherHtml;
                }
                if(!studentPlaceFlag){
                    studentHtml += "</div>";
                    oneResource += studentHtml;
                }
                else{
                    studentHtml += "<div class='studentHolder'><div class='placeholder'>Student Name</div></div>";
                    oneResource += studentHtml;
                }
                oneResource += "</div>";
                html += oneResource;
            }
        }
        if(sof.length){
            width += 150;
            var oneResource = "<div class='resourceHolder'>";
            var SOFPlaceFlag=true,sofHtml = '';
            for(var j=0;j<sof.length;j++){
                if(SOFPlaceFlag){
                    SOFPlaceFlag = false;
                    sofHtml+="<div class='teacherHolder'><div class='placeholder'>Student Overflow</div>";
                }
                sofHtml+="<div>"+sof[j].name+", " + sof[j].grade +"</div>";
            }
            if(!SOFPlaceFlag){
                sofHtml += "</div>";
                oneResource += sofHtml;
            }
            oneResource += "</div>";
            html += oneResource;
        }
        if(taList != undefined && taList.length){
            width += 150;
            var oneResource = "<div class='resourceHolder'>";
            var TAPlaceFlag=true,taHtml = '';
            for(var j=0;j<taList.length;j++){
                if(TAPlaceFlag){
                    TAPlaceFlag = false;
                    taHtml+="<div class='teacherHolder'><div class='placeholder'>Teacher Availability</div>";
                }
                taHtml+="<div>"+taList[j].name+"</div>";
            }
            if(!TAPlaceFlag){
                taHtml += "</div>";
                oneResource += taHtml;
            }
            oneResource += "</div>";
            html += oneResource;
        }
        html+="</div>";
        wjQuery('#weekStudentsPlaceHolder').css('width', width +'px');
        wjQuery('#weekStudentsPlaceHolder').html(html);
    };


    this.populateWeekEvents = function(){
        var self = this;
        self.eventList = [];
        wjQuery('.fc-col' + 0).not('.fc-widget-header').css('background-color', '#fff');
        wjQuery('.fc-col' + 1).not('.fc-widget-header').css('background-color', '#fff');
        wjQuery('.fc-col' + 2).not('.fc-widget-header').css('background-color', '#fff');
        wjQuery('.fc-col' + 3).not('.fc-widget-header').css('background-color', '#fff');
        wjQuery('.fc-col' + 4).not('.fc-widget-header').css('background-color', '#fff');
        wjQuery('.fc-col' + 5).not('.fc-widget-header').css('background-color', '#fff');
        wjQuery('.fc-col' + 6).not('.fc-widget-header').css('background-color', '#fff');
        var currentView = self.calendar.fullCalendar('getView');
        var piSelected = false;
        var giSelected = false;
        var gfSelected = false;
        if(self.selectedDeliveryType.length == 1){
            piSelected = true;
            giSelected = false;
            gfSelected = false;
        }
        if(self.selectedDeliveryType.length == 2){
            piSelected = false;
            giSelected = true;
            gfSelected = true;
        }
        if(self.selectedDeliveryType.length == 3){
            piSelected = true;
            giSelected = true;
            gfSelected = true;
        }

        var piSpace = 0,giSpace=0,gfSpace=0;
        for (var i = 0; i < self.resourceList.length; i++) {
            if(self.resourceList[i].deliveryType == 'Personal Instruction'){
                piSpace += self.resourceList[i].capacity;
            }
            else if(self.resourceList[i].deliveryType == 'Group Instruction'){
                giSpace += self.resourceList[i].capacity;
            }
            else if(self.resourceList[i].deliveryType == 'Group Facilitation'){
                gfSpace += self.resourceList[i].capacity;
            }
        }
        if(Object.keys(this.weekEventObject).length){
            var leaveList= [];
            for (var i = 0; i < Object.keys(this.weekEventObject).length; i++) {
                var index = -1;
                for (var a = 0; a < self.leaveDays.length; a++) {
                    if(moment(self.leaveDays[a]).format('YYYY-MM-DD') == moment(Object.keys(this.weekEventObject)[i]).format('YYYY-MM-DD')){
                        index = a;
                        break;
                    }
                }
                if(index == -1){
                    var piObj = {
                            id: Object.keys(this.weekEventObject)[i],
                            start: new Date(Object.keys(this.weekEventObject)[i]),
                            allDay: false,
                            textColor: "#333333",
                        }
                    var giObj = {
                            id: Object.keys(this.weekEventObject)[i],
                            start: new Date(Object.keys(this.weekEventObject)[i]),
                            allDay: false,
                            textColor: "#333333",
                        }

                    var gfObj = {
                            id: Object.keys(this.weekEventObject)[i],
                            start: new Date(Object.keys(this.weekEventObject)[i]),
                            allDay: false,
                            textColor: "#333333",
                        }
                    var addLabel = false,oneDtStudent =false,oneDtTeacher = false;
                    if(giSelected){
                        if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('teacherAvailability')){
                            if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherAvailability.length){
                                addLabel = true;
                            }
                        }
                        else if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('student')){
                            if (piSelected) {
                                if((this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.pi.length > 0 && 
                                   this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gi.length > 0) ||
                                   (this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.pi.length > 0 && 
                                   this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gf.length > 0) ||
                                   (this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gf.length > 0 && 
                                   this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gi.length > 0)){
                                    addLabel = true;
                                }
                                else{
                                    oneDtStudent = true;
                                }
                            }
                            else{
                                if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gf.length > 0 && 
                                   this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gi.length > 0){
                                    addLabel = true;
                                }
                                else{
                                    oneDtStudent = true;
                                }
                            }
                        }
                        else if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('teacherSchedule')){
                            if (piSelected) {
                                if((this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.pi.length > 0 && 
                                   this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.gi.length > 0) ||
                                   (this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.pi.length > 0 && 
                                   this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.gf.length > 0) ||
                                   (this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.gf.length > 0 && 
                                   this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.gi.length > 0)){
                                    addLabel = true;
                                }
                                else{
                                    oneDtTeacher = true;
                                }
                            }
                            else{
                                if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.gf.length > 0 && 
                                   this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.gi.length > 0){
                                    addLabel = true;
                                }
                                else{
                                    oneDtStudent = true;
                                }
                            }
                        }
                        if(!addLabel && oneDtStudent && oneDtTeacher){
                            addLabel = true;
                        }
                    }
                    
                    if(piSelected){
                        var piFlag = false;
                        piObj.title = "";
                        piObj.backgroundColor = "#ebf5fb";
                        piObj.borderColor = "#9acaea";
                        piObj.deliveryType = "Personal-Instruction";
                        piObj.title += "<div class='stplace'>";
                        if(!giSelected || !addLabel){
                            piObj.title += "S/T = ";    
                        }
                        if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('student')){
                            if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.hasOwnProperty('pi')){
                                piObj.title += this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.pi.length +"/";
                                if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.pi.length)
                                    piFlag = true;
                            }
                            else{
                                piObj.title += "0/"
                            }
                        }
                        else{
                                piObj.title += "0/"
                        }
                        if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('teacherSchedule')){
                            if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.hasOwnProperty('pi')){
                                piObj.title += this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.pi.length +"</div>";
                                if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.pi.length)
                                    piFlag = true;
                            }
                            else{
                                piObj.title += "0 </div>"
                            }
                        }
                        else{
                                piObj.title += "0 </div>"
                        }
                        piObj.title += "<div class='ssplace'>"
                        if(!giSelected || !addLabel){
                            piObj.title += "S/S = ";    
                        }                   
                        if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('student')){
                            if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.hasOwnProperty('pi')){
                                var find1to1 = false,count = 0,groupStudentsByResource = {};
                                for(var x=0;x<this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.pi.length;x++){
                                    if(groupStudentsByResource.hasOwnProperty(this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.pi[x].resourceId)){
                                        groupStudentsByResource[this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.pi[x].resourceId].push(this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.pi[x]);
                                    }
                                    else{
                                        groupStudentsByResource[this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.pi[x].resourceId] = [];
                                        groupStudentsByResource[this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.pi[x].resourceId].push(this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.pi[x]);
                                    }
                                }
                                for (var x = 0; x < Object.keys(groupStudentsByResource).length; x++) {
                                    find1to1 = false;
                                    for (var y = 0; y < groupStudentsByResource[Object.keys(groupStudentsByResource)[x]].length; y++) {
                                        if(groupStudentsByResource[Object.keys(groupStudentsByResource)[x]][y].is1to1){
                                            find1to1 = true;
                                            break;
                                        }
                                    }
                                    if(find1to1){
                                        count += this.getResourceObj(Object.keys(groupStudentsByResource)[x]).capacity;
                                    }
                                    else{
                                        count += groupStudentsByResource[Object.keys(groupStudentsByResource)[x]].length
                                    }
                                }
                                piObj.title += count +"/"+piSpace +"</div>";
                            }
                            else{
                                piObj.title += "0/"+piSpace +"</div>";
                            }
                        }
                        else{
                            piObj.title += "0/"+piSpace +"</div>";
                        }
                        piObj.title += "<div class='tsplace'>";
                        if(!giSelected || !addLabel){
                            piObj.title += "TS = ";    
                        }
                        if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('teacherSchedule')){
                            if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.hasOwnProperty('pi')){
                                piObj.title += this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.pi.length +"/";
                            }
                            else{
                                piObj.title += "0/";
                            }
                        }
                        else{
                            piObj.title += "0/";
                        }
                        if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('teacherAvailability')){
                            piObj.title += this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherAvailability.length +"</div>";
                            if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherAvailability.length)
                                piFlag = true;
                        }
                        else{
                            piObj.title += "0 </div>"
                        }
                        if(piFlag)
                            self.eventList.push(piObj);
                    }
                    if(giSelected){
                        var giFlag = false;
                        giObj.title = "";
                        giObj.backgroundColor = "#fedeb7";
                        giObj.borderColor = "#f88e50";
                        giObj.deliveryType = "Group-Instruction";
                        giObj.title += "<div class='stplace'>";
                        if(!addLabel){
                            giObj.title += "S/T = ";    
                        }
                        if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('student')){
                            if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.hasOwnProperty('gi')){
                                giObj.title += this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gi.length +"/";
                                if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gi.length)
                                    giFlag = true;
                            }
                            else{
                                giObj.title += "0/"
                            }
                        }
                        else{
                            giObj.title += "0/"
                        }
                        if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('teacherSchedule')){
                            if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.hasOwnProperty('gi')){
                                giObj.title += this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.gi.length +"</div>";
                                if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.gi.length)
                                    giFlag = true;
                            }
                            else{
                                giObj.title += "0 </div>"
                            }
                        }
                        else{
                            giObj.title += "0 </div>"
                        }
                        giObj.title += "<div class='ssplace'>";
                        if(!addLabel){
                            giObj.title += "S/S = ";    
                        }                   
                        if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('student')){
                            if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.hasOwnProperty('gi')){
                                var find1to1 = false,count = 0,groupStudentsByResource = {};
                                for(var x=0;x<this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gi.length;x++){
                                    if(groupStudentsByResource.hasOwnProperty(this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gi[x].resourceId)){
                                        groupStudentsByResource[this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gi[x].resourceId].push(this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gi[x]);
                                    }
                                    else{
                                        groupStudentsByResource[this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gi[x].resourceId] = [];
                                        groupStudentsByResource[this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gi[x].resourceId].push(this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gi[x]);
                                    }
                                }
                                for (var x = 0; x < Object.keys(groupStudentsByResource).length; x++) {
                                    find1to1 = false;
                                    for (var y = 0; y < groupStudentsByResource[Object.keys(groupStudentsByResource)[x]].length; y++) {
                                        if(groupStudentsByResource[Object.keys(groupStudentsByResource)[x]][y].is1to1){
                                            find1to1 = true;
                                            break;
                                        }
                                    }
                                    if(find1to1){
                                        count += this.getResourceObj(Object.keys(groupStudentsByResource)[x]).capacity;
                                    }
                                    else{
                                        count += groupStudentsByResource[Object.keys(groupStudentsByResource)[x]].length
                                    }
                                }
                                giObj.title += count +"/"+giSpace +"</div>";
                            }
                            else{
                                giObj.title += "0/"+giSpace +"</div>";
                            }
                        }
                        else{
                            giObj.title += "0/"+giSpace +"</div>";
                        }
                        giObj.title += "<div class='tsplace'>";
                        if(!addLabel){
                            giObj.title += "TS = ";    
                        }
                        if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('teacherSchedule')){
                            if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.hasOwnProperty('gi')){
                                giObj.title += this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.gi.length +"/";
                            }
                            else{
                                giObj.title += "0/";
                            }
                        }
                        else{
                            giObj.title += "0/";
                        }
                        if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('teacherAvailability')){
                            giObj.title += this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherAvailability.length +"</div>";
                            if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherAvailability.length)
                                giFlag = true;
                        }
                        else{
                            giObj.title += "0</div>"
                        }
                        if(giFlag)
                            self.eventList.push(giObj);
                    }
                    if(gfSelected){
                        var gfFlag = false;
                        gfObj.title = "";
                        gfObj.backgroundColor = "#dff0d5";
                        gfObj.borderColor = "#7bc143";
                        gfObj.deliveryType = "Group-Facilitation";
                        gfObj.title += "<div class='stplace'>";
                        if(!addLabel){
                            gfObj.title += "S/T = ";    
                        }
                        if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('student')){
                            if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.hasOwnProperty('gf')){
                                gfObj.title += this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gf.length +"/";
                                if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gf.length)
                                    gfFlag = true;
                            }
                            else{
                                gfObj.title += "0/"
                            }
                        }
                        else{
                            gfObj.title += "0/"
                        }
                        if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('teacherSchedule')){
                            if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.hasOwnProperty('gf')){
                                gfObj.title += this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.gf.length +"</div>";
                                if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.gf.length)
                                    gfFlag = true;
                            }
                            else{
                                gfObj.title += "0 </div>"
                            }
                        }
                        else{
                            gfObj.title += "0 </div>"
                        }
                        gfObj.title += "<div class='ssplace'>";
                        if(!addLabel){
                            gfObj.title += "S/S = ";    
                        }                   
                        if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('student')){
                            if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.hasOwnProperty('gf')){
                                var find1to1 = false,count = 0,groupStudentsByResource = {};
                                for(var x=0;x<this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gf.length;x++){
                                    if(groupStudentsByResource.hasOwnProperty(this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gf[x].resourceId)){
                                        groupStudentsByResource[this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gf[x].resourceId].push(this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gf[x]);
                                    }
                                    else{
                                        groupStudentsByResource[this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gf[x].resourceId] = [];
                                        groupStudentsByResource[this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gf[x].resourceId].push(this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gf[x]);
                                    }
                                }
                                for (var x = 0; x < Object.keys(groupStudentsByResource).length; x++) {
                                    find1to1 = false;
                                    for (var y = 0; y < groupStudentsByResource[Object.keys(groupStudentsByResource)[x]].length; y++) {
                                        if(groupStudentsByResource[Object.keys(groupStudentsByResource)[x]][y].is1to1){
                                            find1to1 = true;
                                            break;
                                        }
                                    }
                                    if(find1to1){
                                        count += this.getResourceObj(Object.keys(groupStudentsByResource)[x]).capacity;
                                    }
                                    else{
                                        count += groupStudentsByResource[Object.keys(groupStudentsByResource)[x]].length
                                    }
                                }
                                gfObj.title += count +"/"+gfSpace +"</div>";
                            }
                            else{
                                gfObj.title += "0/"+gfSpace +"</div>";
                            }
                        }
                        else{
                            gfObj.title += "0/"+gfSpace +"</div>";
                        }
                        gfObj.title += "<div class='tsplace'>";
                        if(!addLabel){
                            gfObj.title += "TS = ";    
                        }
                        if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('teacherSchedule')){
                            if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.hasOwnProperty('gf')){
                                gfObj.title += this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.gf.length +"/";
                            }
                            else{
                                gfObj.title += "0/";
                            }
                        }
                        else{
                            gfObj.title += "0/";
                        }
                        if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('teacherAvailability')){
                            gfObj.title += this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherAvailability.length +"</div>";
                            if(this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherAvailability.length)
                                gfFlag = true;
                        }
                        else{
                            gfObj.title += "0</div>"
                        }
                        if(gfFlag)
                        self.eventList.push(gfObj);
                    }
                }
            }
            for(var j = currentView.start.getTime();j<currentView.end.getTime();j=j+(24*60*60*1000)){
                var sample = -1;
                for (var b = 0; b < self.leaveDays.length; b++) {
                    if(moment(self.leaveDays[b]).format('YYYY-MM-DD') == moment(j).format('YYYY-MM-DD')){
                        sample = b;
                        var obj = {
                            start: new Date(j),
                            allDay: true,
                            title:''
                        };
                        self.eventList.push(obj);
                    }
                }
               
            }
            self.calendar.fullCalendar('removeEvents');
            self.calendar.fullCalendar('removeEventSource');
            self.calendar.fullCalendar('addEventSource', { events: self.eventList });
            self.calendar.fullCalendar('refetchEvents');
            wjQuery('.loading').hide();
        }
    }

    this.getStudentTimings = function(locationId, selectedDate, timeSlotType, studentDuration, istimeSlotType){
      var day = this.getDayValue(new Date(selectedDate));
      var timingArry = [];
      var ConvertedTimingArry = [];
      if(day != undefined){
        var selectedDate = moment(selectedDate).format("YYYY-MM-DD");
        var availableTime = [];
        if(!isNaN(timeSlotType)){
          availableTime = data.getPiStudentAvailableTime(locationId, selectedDate, timeSlotType);
        }else{
          availableTime = data.getGfStudentAvailableTime(locationId, selectedDate, timeSlotType);
        }
        availableTime = ( availableTime == null ) ? [] : availableTime;
        for (var i = 0; i < availableTime.length; i++) {
          if(day == availableTime[i]['hub_days']){
            for(var j= availableTime[i]['hub_starttime']; j < availableTime[i]['hub_endtime']; j = j+studentDuration ){
              timingArry.push(j);
            }
          }
        }
        if(timingArry.length){
          timingArry.sort(function(a, b){return a-b});
          for(var i=0; i< timingArry.length; i++){
            ConvertedTimingArry.push(this.tConvert(this.convertMinsNumToTime(timingArry[i])));
          }
        }
        return ConvertedTimingArry;
      }
    }

    this.validateStudentOnSameRow = function(stuId, startHour){
      var self = this;
      var allowToDropStudent = true;
      for(var k=0; k< self.resourceList.length; k++){
        var newEventId = self.resourceList[k].id + startHour;
        var eventObj = self.calendar.fullCalendar('clientEvents', newEventId);
        if(eventObj.length && eventObj[0].hasOwnProperty("students")){
          for(var i=0; i< eventObj[0]['students'].length; i++){
            if(stuId == eventObj[0]['students'][i]['id']){
              allowToDropStudent = false;
              break;
            }
          }
          if(!allowToDropStudent){
            allowToDropStudent = false;
            break;
          }
        }
      }
      return allowToDropStudent;
    }

    this.validateTeacherOnSameRow = function(teacherId, startHour){
      var self = this;
      var allowToDropTeacher = true;
      for(var k=0; k< self.resourceList.length; k++){
        var newEventId = self.resourceList[k].id+startHour;
        var eventObj = self.calendar.fullCalendar('clientEvents', newEventId);
        if(eventObj.length && eventObj[0].hasOwnProperty("teachers")){
          for(var i=0; i< eventObj[0]['teachers'].length; i++){
            if(teacherId == eventObj[0]['teachers'][i]['id']){
              allowToDropTeacher = false;
              break;
            }
          }
          if(!allowToDropTeacher){
            allowToDropTeacher = false;
            break;
          }
        }
      }
      return allowToDropTeacher;
    }

    this.checkEventIsOneToOne = function(studentList){
      var is1to1 = false;
      if(studentList !=undefined && studentList.length){
        for(var i=0; i<studentList.length; i++){
          if(studentList[i].is1to1){
            is1to1 = true;
            break;
          }
        }
      }
      return is1to1
    }

    this.checkForStaffAvailability = function(teacherId, startHour){
      var teacherIsAvialble = false;
      startHour = startHour.getHours();
      if(this.taList.length){
        for(var i=0; i< this.taList.length; i++){
          if(this.taList[i]['startHour'] == startHour && this.taList[i]['id'] == teacherId){
            teacherIsAvialble = true;
            break;
          }
        }
      }
      return teacherIsAvialble;
    }

    // Student drag and drop case
    this.checkNonPreferredTeacher = function(studentObj, newEvent){
      var nonPreferedTeacher = false;
      if(studentObj['nonPreferredTeacher'] != undefined){
        if(newEvent.hasOwnProperty('teachers') && newEvent['teachers'].length > 0){
          for(var i=0; i<newEvent['teachers'].length; i++ ){
            if(newEvent['teachers'][i]['id'] ==  studentObj['nonPreferredTeacher']){
              nonPreferedTeacher = true;
              break;
            }
          }
        }
      }
      return nonPreferedTeacher;
    }

    // Teacher drag and drop case
    this.checkNonPreferredStudentForTeacher = function(teacherId, newEvent){
      var nonPreferedTeacher = false;
      if(teacherId != undefined){
        if(newEvent.hasOwnProperty('students') && newEvent['students'].length > 0){
          for(var i=0; i<newEvent['students'].length; i++ ){
            if(newEvent['students'][i]['nonPreferredTeacher'] != undefined &&
                  newEvent['students'][i]['nonPreferredTeacher'] ==  teacherId){
              nonPreferedTeacher = true;
              break;
            }
          }
        }
      }
      return nonPreferedTeacher;
    }


    // remove Non preferred teacher coflict check for prev event
    this.checkNonPreferredTeacherConflict = function(prevEvent){
      var isNonPreferred = false;
      if(prevEvent.hasOwnProperty('students') && prevEvent.hasOwnProperty('teachers') && prevEvent['students'].length > 0 && prevEvent['teachers'].length > 0){
        for(var i=0; i < prevEvent['teachers'].length; i++){
          for(var j=0; j < prevEvent['students'].length; j++){
            if(prevEvent['teachers'][i]['id'] == prevEvent['students'][j]['nonPreferredTeacher']){
              isNonPreferred = true;
              break;
            }
          }
          if(isNonPreferred){
            break;
          }
        }        
      }
      return isNonPreferred;
    } 

    // remove conflicts form previous event from where we dragged students/ teacher 
    this.removeAllConflictsFromPrevEvent = function (prevEvent){
      var self = this;
      var resourceObj = self.getResourceObj(prevEvent["resourceId"]);
      // oneToOne conflict removal prevevent student Darg
      if(prevEvent['students'] != undefined &&  prevEvent['students'].length != 0){
        var eventIs1to1 = self.checkEventIsOneToOne(prevEvent['students']);
        if(eventIs1to1){
          prevEvent['is1to1'] = true;
        }else{
          prevEvent['is1to1'] = false;
        }
      }else{
        prevEvent['is1to1'] = false;
      }

      // Conflict removal
      // OneToOne conflict removal prevevent student Darg
      if (!prevEvent['is1to1']) {
        if (prevEvent.title.indexOf('<img class="onetoone" title="1:1 Session" src="/webresources/hub_/calendar/images/lock.png">') != -1) {
            prevEvent.title = prevEvent.title.replace('<img class="onetoone" title="1:1 Session" src="/webresources/hub_/calendar/images/lock.png">', "");
            prevEvent.is1to1 = false;
            var msgIndex = prevEvent.conflictMsg.map(function (x) {
                return x;
            }).indexOf(2);
            if (msgIndex > -1) {
              prevEvent.conflictMsg.splice(msgIndex, 1);
            }
            self.updateConflictMsg(prevEvent);
        }
      }else if(prevEvent.hasOwnProperty('students') && prevEvent['students'].length <= 1){
        var msgIndex = prevEvent.conflictMsg.map(function (x) {
            return x;
        }).indexOf(2);
        if (msgIndex > -1) {
          prevEvent.conflictMsg.splice(msgIndex, 1);
        }
        self.updateConflictMsg(prevEvent);
      }

      // Conflict removal
      // Capacity conflict removal prevevent student Darg
      if (prevEvent.hasOwnProperty('students') && resourceObj['capacity'] >= prevEvent['students'].length) {
          var msgIndex = prevEvent.conflictMsg.map(function (x) {
              return x;
          }).indexOf(1);
          if (msgIndex > -1) {
              prevEvent.conflictMsg.splice(msgIndex, 1);
          }
          self.updateConflictMsg(prevEvent);
      }
      
      if (prevEvent.hasOwnProperty('students') && resourceObj['capacity'] > prevEvent['students'].length) {
        if (prevEvent.title.indexOf('<span class="student-placeholder-'+prevEvent.deliveryType+'">Student name</span>') == -1) {
          prevEvent.title += '<span class="student-placeholder-'+prevEvent.deliveryType+'">Student name</span>';
          self.addContext("", 'studentPlaceholder', true, prevEvent.deliveryType);
        }
      }

      // remove Non Preferred Teacher Conflict
      var isNonPreferred = self.checkNonPreferredTeacherConflict(prevEvent);
      if(!isNonPreferred){
        var msgIndex = prevEvent.conflictMsg.map(function (x) {
          return x;
        }).indexOf(3);
        if (msgIndex > -1) {
            prevEvent.conflictMsg.splice(msgIndex, 1);
        }
        self.updateConflictMsg(prevEvent);
      }

    }
}