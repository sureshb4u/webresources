// new file added
var data = new Data();
var DEFAULT_START_TIME = "8:00 AM";
var DEFAULT_END_TIME = "9:00 AM";
var deliveryType = data.getDeliveryType();
var currentCalendarDate = moment(new Date()).format("YYYY-MM-DD");
// Calendar max and min time
var maxClatime = 20;
var minClatime = 8;
var slotS = 15;
// 4 Weeks to get master schedule data.
var numOfDays = 42;

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
var SIMPLICITY_STATUS = 1;
// Session type
var REGULAR_TYPE = 1;
var FLOAT_TYPE = 2;
var MAKEUP_TYPE = 3;
var FLOAT_TEACHER_TYPE = 4;

var personalInstruction = 1;
var groupFacilitation = 2;
var groupInstruction = 3;
var disableddates = [];
var isIE = /*@cc_on!@*/false || !!document.documentMode;

var FLOAT_LABEL = "F";
var MAKEUP_LABEL = "MU";
var REGULAR_LABEL = "REG";
var instructionalHours = [];

setTimeout(function () {
    var deliveryTypeList = [];
    var sylvanCalendar = new SylvanCalendar();
    sylvanCalendar.locationList = data.getLocation();
    var defaultCenter = data.getRecentlyViewedCenter();
    if (!defaultCenter) {
        defaultCenter = [];
    }
    var locationId = sylvanCalendar.populateLocation(data.getLocation(), defaultCenter);
    wjQuery('.headerDate').text(moment(currentCalendarDate).format('MM/DD/YYYY'));
    setTimeout(function () {
        for (var i = 0; i < deliveryType.length; i++) {
            switch (deliveryType[i]['hub_code']) {
                case personalInstruction:
                    wjQuery('#pi-btn input').val(deliveryType[i]['hub_deliverytypeid']);
                    deliveryTypeList.push(deliveryType[i]['hub_deliverytypeid']);
                    break;
                case groupInstruction:
                    wjQuery('#gi-btn input').val(deliveryType[i]['hub_deliverytypeid']);
                    break;
            }
        }

        wjQuery('#datepicker').datepicker({
            buttonImage: "/webresources/hub_/calendar/images/calendar.png",
            buttonImageOnly: true,
            changeMonth: true,
            changeYear: true,
            showOn: 'button',
            onSelect: function (date) {
                wjQuery('.headerDate').text(date);
                if (moment(new Date(date)).format('MM/DD/YYYY') == moment(new Date()).format('MM/DD/YYYY')) {
                    wjQuery('.headerDate').addClass('today');
                }
                else {
                    wjQuery('.headerDate').removeClass('today');
                }
                
                if (sylvanCalendar.calendar != undefined) {
                    wjQuery(".loading").show();
                    sylvanCalendar.dateFromCalendar(date, locationId);
                    fetchResources(locationId, deliveryTypeList, true);
                }
                wjQuery('#datepicker').hide();
            }
        });

        wjQuery(".loc-dropdown .dropdown-menu").on('click', 'li a', function () {
            if (wjQuery(".location-btn").val() != wjQuery(this).attr('value-id')) {
                wjQuery(".location-btn").text(wjQuery(this).text());
                wjQuery(".location-btn").val(wjQuery(this).attr('value-id'));
                wjQuery(".sof-btn").removeClass('overflow-info');
                locationId = wjQuery(this).attr('value-id');
                wjQuery('#datepicker').datepicker('destroy');
                var recentRecordId = wjQuery(this).attr("recent-record-id");
                if (defaultCenter.length) {
                    recentRecordId = defaultCenter[0].hub_recently_viewed_recordsid;
                }
                var recordId = data.updateRecentlyViewedCenter(locationId, recentRecordId);
                if (recordId) {
                    wjQuery(this).attr("recent-record-id", recordId);
                    if (!defaultCenter.length) {
                        defaultCenter[0] = {};
                    }
                    defaultCenter[0].hub_recently_viewed_recordsid = recordId;
                }
                var view = "resourceDay";
                if (sylvanCalendar.calendar != undefined) {
                    view = sylvanCalendar.calendar.fullCalendar('getView');
                }
                if (view.name == "resourceDay" || view.name == undefined) {
                    wjQuery('#dayBtn').trigger("click");
                    wjQuery('#datepicker').datepicker({
                        buttonImage: "/webresources/hub_/calendar/images/calendar.png",
                        buttonImageOnly: true,
                        changeMonth: true,
                        changeYear: true,
                        showOn: 'button',
                        onSelect: function (date) {
                            wjQuery('.headerDate').text(date);
                            if (moment(new Date(date)).format('MM/DD/YYYY') == moment(new Date()).format('MM/DD/YYYY')) {
                                wjQuery('.headerDate').addClass('today');
                            }
                            else {
                                wjQuery('.headerDate').removeClass('today');
                            }
                            if (sylvanCalendar.calendar != undefined) {
                                wjQuery(".loading").show();
                                sylvanCalendar.dateFromCalendar(date, locationId);
                                fetchResources(locationId, deliveryTypeList, true);
                            }
                            wjQuery('#datepicker').hide();
                        }
                    });
                    return fetchResources(locationId, deliveryTypeList, true);
                } else {
                    wjQuery(".sof-btn").prop("disabled", true);
                    wjQuery(".sa-btn").prop("disabled", true);
                    wjQuery(".ta-btn").prop("disabled", true);
                    wjQuery(".filter-section").hide();
                    if (wjQuery(".sof-pane").hasClass("open")) {
                        wjQuery(".sof-btn,.sof-close-icon").trigger('click');
                    }
                    if (wjQuery(".sa-pane").hasClass("open")) {
                        wjQuery(".sa-btn,.sa-close-icon").trigger('click');
                    }
                    if (wjQuery(".ta-pane").hasClass("open")) {
                        wjQuery(".ta-btn,.ta-close-icon").trigger('click');
                    }
                    sylvanCalendar.locationId = locationId;
                    fetchResources(sylvanCalendar.locationId, deliveryTypeList, true);
                    wjQuery(".sof-btn").removeClass('overflow-info');
                }
            }
        });
        var rtime;
        var timeout = false;
        var delta = 300;
        wjQuery(window).resize(function () {
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
                fetchResources(sylvanCalendar.locationId, deliveryTypeList, true);
            }
        }
        var resources = [];
        var groupI = false;
        var pi1 = [];
        var gi1 = [];
        var gf1 = [];
        var groupPI = false;

        function fetchResources(locationId, selectedDeliveryType, fetchData) {
            wjQuery(".loading").show();
            var locationChanged = false;
            // asign deliverytpeList to  
            sylvanCalendar.selectedDeliveryType = selectedDeliveryType;
            var currentCalendarDate = wjQuery(".headerDate").text();
            currentCalendarDate = new Date(currentCalendarDate);
            if (sylvanCalendar.locationId != locationId) {
                locationChanged = true;
                sylvanCalendar.locationId = locationId;
            }
            var resourceList = [];
            if (fetchData) {
                var obj = data.getResources(locationId);
                resources = obj == null ? [] : obj;
                var tempList = resources.filter(function (resource) {
                    if (resource.hub_deactivating_start_date && resource.hub_deactivating_end_date &&
                    !(currentCalendarDate.getTime() >= new Date(moment(resource.hub_deactivating_start_date).format("MM-DD-YYYY")).getTime()
                    && currentCalendarDate.getTime() <= new Date(moment(resource.hub_deactivating_end_date).format("MM-DD-YYYY")).getTime())) {
                        return resource;
                    } else if (!resource.hub_deactivating_end_date && resource.hub_deactivating_start_date
                        && !(currentCalendarDate.getTime() >= new Date(moment(resource.hub_deactivating_start_date).format("MM-DD-YYYY")).getTime())) {
                        return resource;
                    } else if (!resource.hub_deactivating_start_date) {
                        return resource;
                    }
                });
                resources = tempList;
                var pi = [];
                var gi = [];
                var gf = [];
                if (resources.length) {
                    for (var i = 0; i < resources.length; i++) {
                        switch (resources[i]['adeliverytype_x002e_hub_code']) {
                            case personalInstruction:
                                pi.push(resources[i]);
                                pi1.push(resources[i]);
                                break;
                            case groupFacilitation:
                                gf.push(resources[i]);
                                gf1.push(resources[i]);
                                break;
                            case groupInstruction:
                                gi.push(resources[i]);
                                gi1.push(resources[i]);
                                break;
                        }
                    }
                    resources = pi.concat(gf);
                    resources = resources.concat(gi);
                    if (pi.length == 0 && (gf.length != 0 || gi.length != 0)) {
                        sylvanCalendar.prompt("The selected center doesn't have the PI Resource. Please change the filter to see the Group Resources.");
                    }
                } else {
                    if (selectedDeliveryType.length) {
                        sylvanCalendar.prompt("The selected center doesn't have the Resources.");
                    }
                }
            } else {
                if (resources.length == 0 && selectedDeliveryType.length) {
                    sylvanCalendar.prompt("The selected center doesn't have the Resources.");
                }
            }

            if (selectedDeliveryType.length == deliveryType.length) {
                resourceList = resources;
                if (groupI) {
                    sylvanCalendar.prompt("The selected center doesn't have the GI Resource. Please change the filter to see the Personal Instruction Resources.");
                }
                if (groupPI) {
                    sylvanCalendar.prompt("The selected center doesn't have the PI Resource. Please change the filter to see the Group Resources.");
                }
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
            if (locationChanged) {
                sylvanCalendar.populateResource(resourceList, fetchData);
            }
            else {
                if (sylvanCalendar.calendar == undefined || sylvanCalendar.calendar.fullCalendar('getView').name == 'resourceDay') {
                    sylvanCalendar.populateResource(resourceList, fetchData);
                }
                else {
                    sylvanCalendar.resourceList = [];
                    for (var i = 0; i < resourceList.length; i++) {
                        sylvanCalendar.resourceList.push({
                            name: resourceList[i].hub_name,
                            id: resourceList[i].hub_center_resourcesid,
                            deliveryType: resourceList[i]["_hub_deliverytype_value@OData.Community.Display.V1.FormattedValue"],
                            deliveryTypeId: resourceList[i]['_hub_deliverytype_value'],
                            deliveryTypeCode: resourceList[i]['adeliverytype_x002e_hub_code'],
                            deliveryTypeCodeVal: resourceList[i]['adeliverytype_x002e_hub_code@OData.Community.Display.V1.FormattedValue'],
                            capacity: resourceList[i]["hub_capacity"]
                        });
                    }
                }
            }
            if (resourceList.length) {


                sylvanCalendar.refreshCalendarEvent(locationId, true);
                wjQuery('.prevBtn').off('click').on('click', function () {
                    var date = new Date(wjQuery('.headerDate').text());
                    if (wjQuery('#dayBtn:checked').val() == 'on') {
                        date = new Date(new Date(date).setDate(date.getDate() - 1));
                    }
                    else {
                        date = new Date(new Date(date).setDate(date.getDate() - 7));
                    }
                    wjQuery('.headerDate').text(moment(date).format('MM/DD/YYYY'));
                    if (moment(date).format('MM/DD/YYYY') == moment(new Date()).format('MM/DD/YYYY')) {
                        wjQuery('.headerDate').addClass('today');
                    }
                    else {
                        wjQuery('.headerDate').removeClass('today');
                    }
                    if (sylvanCalendar.calendar != undefined) {
                        wjQuery(".loading").show();
                        sylvanCalendar.prev(locationId);
                        fetchResources(locationId, deliveryTypeList, true);
                    }
                });

                wjQuery('.nextBtn').off('click').on('click', function () {
                    var date = new Date(wjQuery('.headerDate').text());
                    if (wjQuery('#dayBtn:checked').val() == 'on') {
                        date = new Date(new Date(date).setDate(date.getDate() + 1));
                    }
                    else {
                        date = new Date(new Date(date).setDate(date.getDate() + 7));
                    }
                    wjQuery('.headerDate').text(moment(date).format('MM/DD/YYYY'));
                    if (moment(date).format('MM/DD/YYYY') == moment(new Date()).format('MM/DD/YYYY')) {
                        wjQuery('.headerDate').addClass('today');
                    }
                    else {
                        wjQuery('.headerDate').removeClass('today');
                    }
                    if (sylvanCalendar.calendar != undefined) {
                        wjQuery(".loading").show();
                        sylvanCalendar.next(locationId);
                        fetchResources(locationId, deliveryTypeList, true);
                    }
                });

                wjQuery('.wkView').off('click').on('click', function () {
                    wjQuery(".sof-btn").prop("disabled", true);
                    wjQuery(".sa-btn").prop("disabled", true);
                    wjQuery(".ta-btn").prop("disabled", true);
                    wjQuery(".filter-section").hide();
                    if (wjQuery(".sof-pane").hasClass("open")) {
                        wjQuery(".sof-btn,.sof-close-icon").trigger('click');
                    }
                    if (wjQuery(".sa-pane").hasClass("open")) {
                        wjQuery(".sa-btn,.sa-close-icon").trigger('click');
                    }
                    if (wjQuery(".ta-pane").hasClass("open")) {
                        wjQuery(".ta-btn,.ta-close-icon").trigger('click');
                    }
                    sylvanCalendar.weekView();
                    wjQuery(".sof-btn").removeClass('overflow-info');
                });
                wjQuery('.dayView').off('click').on('click', function () {
                    wjQuery(".sof-btn").prop("disabled", false);
                    wjQuery(".sa-btn").prop("disabled", false);
                    wjQuery(".ta-btn").prop("disabled", false);
                    wjQuery(".filter-section").show();
                    sylvanCalendar.openSofPane();
                    sylvanCalendar.dayView();
                });
                
                wjQuery('.sof-btn,.sof-close-icon').off('click').on('click', function () {
                    sylvanCalendar.sofPane();
                });
                wjQuery('.sa-btn,.sa-close-icon').off('click').on('click', function () {
                    sylvanCalendar.saPane();
                });
                wjQuery('.ta-btn,.ta-close-icon').off('click').on('click', function () {
                    sylvanCalendar.taPane();
                });
                sylvanCalendar.draggable('teacher-container');
                wjQuery(".refresh-icon").off('click').on('click', function () {
                    fetchResources(sylvanCalendar.locationId, deliveryTypeList, true);

                });
            }
            else {
                if (sylvanCalendar.calendar != undefined) {
                    sylvanCalendar.calendar.fullCalendar('removeEvents');
                    sylvanCalendar.calendar.fullCalendar('removeEventSource');
                    sylvanCalendar.calendar.fullCalendar('refetchEvents');
                    sylvanCalendar.calendar.fullCalendar('destroy');
                    sylvanCalendar.calendar = undefined;
                }
                wjQuery(".loading").hide();
            }
        }
        wjQuery('#pi-btn input').attr('checked', 'checked');
        wjQuery('.dtBtn').click(function () {
            var parentId = wjQuery(this).parents("div").attr("id");

            if (parentId == 'pi-btn') {
                if (pi1.length != 0 && (gi1.length == 0 || gf1.length == 0)) {
                    groupPI = false;
                    groupI = false;
                }
                if (pi1.length == 0 && (gi1.length != 0 || gf1.length != 0)) {
                    groupPI = true;
                    groupI = false;
                }

            }
            else {
                if ((gi1.length == 0 || gf1.length == 0) && pi1.length > 0) {
                    groupI = true;
                    groupPI = false;
                }
                if ((gi1.length != 0 || gf1.length != 0) && pi1.length == 0) {
                    groupPI = false;
                    groupI = false;
                }
            }

            // var clickedType = wjQuery('.dtBtn').attr('bname');
            deliveryTypeList = [];
            wjQuery('.student-overflow').remove();
            wjQuery('.student-attendance').remove();
            wjQuery('.teacher-availability').remove();
            wjQuery.each(wjQuery('.dtBtn'), function (index, elm) {
                if (wjQuery(elm).is(':checked')) {
                    deliveryTypeList.push(wjQuery(elm).val());
                    for (var i = 0; i < deliveryType.length; i++) {
                        if (deliveryType[i]['hub_deliverytypeid'] == wjQuery(elm).val() &&
                          deliveryType[i]['hub_code'] == groupInstruction) {

                            for (var j = 0; j < deliveryType.length; j++) {
                                if (deliveryType[j]['hub_code'] == groupFacilitation) {

                                    deliveryTypeList.push(deliveryType[j]['hub_deliverytypeid']);
                                }
                            }
                        }

                    }
                }
            });
            fetchResources(sylvanCalendar.locationId, deliveryTypeList, false);
        });
        fetchResources(locationId, deliveryTypeList, true);
    }, 300);
    var filterObject = {
        student: data.getStudentSession(locationId, currentCalendarDate, currentCalendarDate) == null ? [] : data.getStudentSession(locationId, currentCalendarDate, currentCalendarDate),
        grade: data.getGrade() == null ? [] : data.getGrade(),
        subject: data.getSubject() == null ? [] : data.getSubject(),
        time: data.getTime() == null ? [] : data.getTime()
    }
    sylvanCalendar.generateFilterObject(filterObject);
}, 500);

function SylvanCalendar() {
    this.resourceList = [];
    this.calendar = undefined;
    this.filters = new Object();
    this.eventList = [];
    this.sofList = [];
    this.saList = [];
    this.makeupList = [];
    this.locationId = "";
    this.sofList['Personal Instruction'] = [];
    this.sofList['Group Instruction'] = [];
    this.sofList['Group Facilitation'] = [];
    this.saList['Personal Instruction'] = [];
    this.saList['Group Instruction'] = [];
    this.saList['Group Facilitation'] = [];
    this.taList = [];
    // 1. Teacher conflict
    // 2. Capacity Conflict
    // 3. OneToOne Conflict
    // 4. Do not sit with student
    this.conflictMsg = ["Multiple teachers are placed",
                        "Capacity has reached max",
                        "OneToOne Conflict",
                        "Non preferred teacher Conflict",
                        "Slot Timings are Overlapped"
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
    this.locationList = [];
    this.accountClosure = {};
    this.uniqueIdLength = 12;
    this.timestamp = +new Date;

    //Student pane and TA pane Functionality
    var sofExpanded = false;
    var saExpanded = false;
    var taExpanded = false;
    this.loadMasterInformation = function () {
        var self = this;
        saExpanded = false;
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
        // Table firstcolumn fixed code start
        this.buildCalfirstCol();
        // Table firstcolumn fixed code end
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
                    var searchVal = wjQuery(this).val();
                    if (searchVal.search("_time") != -1) {
                        searchVal = searchVal.split("_")[0];
                        var d = new Date();
                        var n = d.getHours();
                        var scrollNum = ((n - 8) * wjQuery(".fc-slot1").height() * 4) - 2;
                        wjQuery("#scrollarea").animate({ scrollTop: scrollNum }, 500, function () {
                            wjQuery(".loading").hide();
                        });
                    } else {
                        if (wjQuery(this).is(':checked')) {
                            self.eventList = [];
                            self.calendar.fullCalendar('removeEvents');
                            self.calendar.fullCalendar('removeEventSource');
                            var index = checkedList.map(function (y) {
                                return y;
                            }).indexOf(searchVal);
                            if (index == -1) {
                                checkedList.push(searchVal);
                            }
                            self.calendar.fullCalendar('refetchEvents');
                        } else {
                            self.eventList = [];
                            self.calendar.fullCalendar('removeEvents');
                            self.calendar.fullCalendar('removeEventSource');
                            var index = checkedList.map(function (y) {
                                return y;
                            }).indexOf(searchVal);
                            if (index != -1) {
                                checkedList.splice(checkedList.indexOf(searchVal), 1);
                            }
                            self.calendar.fullCalendar('refetchEvents');
                        }
                        if (checkedList.length == 0) {
                            self.populateStudentEvent(self.convertedStudentObj, true);
                            self.populateSOFPane(self.sofList, self.calendarOptions.minTime, self.calendarOptions.maxTime);
                            self.populateTeacherEvent(self.convertedTeacherObj, true);
                            self.populateTAPane(self.taList);
                            self.openSofPane();
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
                            self.openSofPane();
                        }
                    }
                });
            }
        });
        wjQuery('.sof-pane').css('height', wjQuery('#calendar').height() - 10 + "px");
        wjQuery('.sa-pane').css('height', wjQuery('#calendar').height() - 10 + "px");
        wjQuery('.ta-pane').css('height', wjQuery('#calendar').height() - 10 + "px");
        wjQuery('.sof-pane').css('overflow', 'auto');
        wjQuery('.sa-pane').css('overflow', 'auto');
        wjQuery('.ta-pane').css('overflow-y', 'auto');
        wjQuery('.ta-pane').hide();
        wjQuery('.sof-pane').hide();
        wjQuery('.sa-pane').hide();
        //ScrollHeiht 
        if (self.resourceList.length > 6) {
            wjQuery('.calendar-firstCol').css('height', wjQuery('#scrollarea').height() - 10 + 'px');
        }
    }

    // Location Dropdown population
    this.populateLocation = function (args,defaultCenter) {
        var self = this;
        if (args != null) {
            var locationData = [];
            args[0][0] == undefined ? locationData = args : locationData = args[0];
            var locationList = [];
            var index = -1;
            for (var i = 0; i < locationData.length; i++) {
                if (!i) {
                    wjQuery(".location-btn").text(locationData[i].hub_centername);
                    wjQuery(".location-btn").val(locationData[i].hub_centerid);
                }
                locationList.push('<li><a tabindex="-1" value-id=' + locationData[i].hub_centerid + ' href="javascript:void(0)">' + locationData[i].hub_centername + '</a></li>');
                if (defaultCenter.length && defaultCenter[0].hub_center == locationData[i].hub_centerid) {
                    index = i;
                }
            }
            wjQuery(".loc-dropdown ul").html(locationList);
            if (index != -1) {
                wjQuery(".location-btn").text(locationData[index].hub_centername);
                wjQuery(".location-btn").val(locationData[index].hub_centerid);
                wjQuery(".loc-dropdown li a[value-id='" + locationData[index].hub_centerid + "']").attr("recent-record-id", defaultCenter[0].hub_recently_viewed_recordsid);
                return locationData[index].hub_centerid
            }
            return locationData[0].hub_centerid;
        }
    }

    // Class room population
    this.populateResource = function (args, isFetch) {
        var self = this;
        var currentCalendarDate;
        var self = this;
        if (self.calendar != undefined) {
            currentCalendarDate = self.calendar.fullCalendar('getDate');
        }
        self.clearAll();
        if (args != null) {
            var resourceData = [];
            if (args[0] != undefined) {
                args[0][0] == undefined ? resourceData = args : resourceData = args[0];
                self.resourceList = [];
                for (var i = 0; i < resourceData.length; i++) {
                    self.resourceList.push({
                        name: resourceData[i].hub_name,
                        id: resourceData[i].hub_center_resourcesid,
                        deliveryType: resourceData[i]["_hub_deliverytype_value@OData.Community.Display.V1.FormattedValue"],
                        deliveryTypeId: resourceData[i]['_hub_deliverytype_value'],
                        deliveryTypeCode: resourceData[i]['adeliverytype_x002e_hub_code'],
                        deliveryTypeCodeVal: resourceData[i]['adeliverytype_x002e_hub_code@OData.Community.Display.V1.FormattedValue'],
                        capacity: resourceData[i]["hub_capacity"]
                    });
                }
                var view = 'resourceDay';
                setTimeout(function () {
                    if (wjQuery('#dayBtn:checked').val() == 'on') {
                        view = 'resourceDay';
                    }
                    else {
                        view = 'agendaWeek';
                    }
                    self.loadCalendar(currentCalendarDate, view);
                }, 150);
            }
        }
    }

    this.clearAll = function () {
        var self = this;
        this.calendar != undefined ? this.calendar.fullCalendar('removeEvents') : undefined;
        this.calendar != undefined ? this.calendar.fullCalendar('removeEventSource') : undefined;
        this.calendar != undefined ? this.calendar.fullCalendar('destroy') : undefined;
        this.calendar = undefined;
        this.resourceList = [];
        this.eventList = [];
        this.sofList = [];
        this.saList = [];
        this.makeupList = [];

        this.sofList['Personal Instruction'] = [];
        this.sofList['Group Instruction'] = [];
        this.sofList['Group Facilitation'] = [];

        this.saList['Personal Instruction'] = [];
        this.saList['Group Instruction'] = [];
        this.saList['Group Facilitation'] = [];

        // this.conflictMsg = [];
        wjQuery('.teacher-block').remove();
        wjQuery('.student-overflow').remove();
        wjQuery('.student-attendance').remove();
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
        var self = this;
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
        var self = this;
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

    this.convertMinsNumToTime = function (minsNum) {
        var self = this;
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
        var self = this;
        time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
        if (time.length > 1) {
            time = time.slice(1);
            time[5] = +time[0] < 12 ? ' AM' : ' PM';
            time[0] = +time[0] % 12 || 12;
        }
        return time.join('');
    }

    this.getDayValue = function (date) {
        var self = this;
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

    // First Column fixed Code Start
    this.buildCalfirstCol = function () {
        var self = this;
        var max = maxClatime;
        var min = minClatime;
        var slot = slotS;
        wjQuery('.calendar-firstCol').html('<div class="firstcolContainer"></div');
        for (var i = min; i < max; i++) {
            for (var j = 0; j < Math.floor(60 / slotS) ; j++) {
                var mins = "00";
                if (j == 1 && slotS == 30) {
                    mins = "30";
                } else if (slotS == 15 && j == 2) {
                    mins = "30";
                }
                if ((j == 0 || mins == 30) && i < 12) {
                    wjQuery('.firstcolContainer').append(
                    '<div class="coldata col_' + (i - min) + '" >' + i + ':'+mins+' AM' + '</div>'

                    );
                } else if ((j == 0 || mins == 30) && i == 12) {
                    wjQuery('.firstcolContainer').append(
                   '<div class="coldata col_' + (i - min) + '" >' + i + ':' + mins + ' PM' + '</div>'

                   );
                }
                else if ((j == 0 || mins == 30) && i > 12) {
                    wjQuery('.firstcolContainer').append(
                   '<div class="coldata col_' + (i - min) + '" >' + (i - 12) + ':' + mins + ' PM' + '</div>'

                   );
                }
                else {
                    wjQuery('.firstcolContainer').append(
                     '<div class="slotdata">' + "&nbsp;" + '</div>'

                     );
                }
            }

        };
        if (self.resourceList.length > 6) {
            if (wjQuery('.calendar-firstCol').length == 0)
                wjQuery(".fc-agenda-divider").after("<div class='calendar-firstCol'></div>");
        }
        if (self.resourceList.length < 6) {
            wjQuery('.calendar-firstCol').css('display', 'none');
            wjQuery('.firstColTable').css('display', 'none');
        }
        wjQuery('#scrollarea').scroll(function (e) {
            wjQuery('.firstcolContainer').scrollTop(wjQuery(this).scrollTop());
        })
        wjQuery('.weekscroller').scroll(function (e) {
            wjQuery('.firstcolContainer').scrollTop(wjQuery(this).scrollTop());
        })

    }
    // First Column fixed Code End

    this.calendarFilter = function () {
        var self = this;
        this.buildFilterBody();
    }

    this.filterSlide = function (expanded) {
        var self = this;
        wjQuery('.filter-label-outer').click(function () {
            wjQuery('.filter-section').animate(expanded ? { 'marginLeft': '-275px' } : { marginLeft: '0px' }, 500);
            expanded ? wjQuery('.filter-slide-icon').removeClass('open') : wjQuery('.filter-slide-icon').addClass('open');
            expanded = !expanded;
        });
    }

    /*
     *  Populates dom for filter panel
     */    
    this.buildFilterBody = function () {
        var self = this;
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


    /*
     *  Populates Student overflow panel
     */
    this.populateSOFPane = function (sofList, minTime, maxTime) {
        var self = this;
        var sofTemplate = [];
        wjQuery('.student-overflow').remove();
        var blockCount = 0;
        var sortedSofList = [];
        //Merging the lists to a single for sorting
        sortedSofList = sofList['Personal Instruction'].concat(sofList['Group Instruction'],sofList['Group Facilitation']);
        sortedSofList = sortedSofList.sort(function (a, b) {
            return new Date(a.start) - new Date(b.start)
        });
        wjQuery.each(sortedSofList, function (i, sofList) {
            var studentStartHour = sofList.start.getHours();
            if (studentStartHour >= minTime && studentStartHour <= maxTime) {
                var studentPosition = studentStartHour - minTime;
                var elm = '<div class="student-container cursor padding-lr-xxs" isfromSa="false" type="student" enrollmentId="' + sofList.enrollmentId + '" studUniqueId="' +
                    sofList.studUniqueId + '" uniqueValue="' + sofList.id + '_' + sofList.start + '"  value="' +
                    sofList.id + '"><span>' + sofList.name + ',' + sofList.grade +
                    '</span><span class="timingDetail">, ' + moment(sofList.start).format("h:mm A") + ' - ' + moment(sofList.end).format("h:mm A") +
                    '</span><i class="material-icons serviceIndicator" title="' + sofList['serviceValue'] + '" style="';
                if (!isIE) {
                    elm += 'background:' + sofList['subjectGradient'] + ';-webkit-background-clip: text;';
                }
                elm += 'color:' + sofList['subjectColorCode'] + '">location_on</i></div>';
                var deliveryTypeIndex = self.selectedDeliveryType.map(function (y) {
                    return y;
                }).indexOf(sofList.deliveryTypeId);
                if (deliveryTypeIndex != -1) {
                    var studBlock = '<div class="student-overflow" id="student_block_' + blockCount + '" style="height:auto;overflow:auto"></div>';
                    wjQuery('.sof-pane').append(studBlock);
                    var blockColor = "";
                    switch (sofList.deliveryTypeCode) {
                        case 1:{
                            blockColor = "sof-pi";
                            break;
                        }
                        case 2: {
                            blockColor = "sof-gf";
                            break;
                        }
                        case 3: {
                            blockColor = "sof-gi";
                            break;
                        }
                    }
                    wjQuery('#student_block_' + blockCount).append('<div class="' + blockColor + '"></div>');
                    wjQuery('#student_block_' + blockCount + ' .'+blockColor).append(elm);
                    blockCount++;
                }
            }
            self.showConflictMsg();
            if (!self.checkAccountClosure()) {
                self.draggable('student-container');
            }
        });
    }

    /*
     * Populates Student attendance panel
     */
    this.populateSAPane = function (saList, minTime, maxTime) {
        var self = this;
        var sofTemplate = [];
        wjQuery('.student-attendance').remove();
        var sortedSaList = [];
        //Merging the lists to a single for sorting
        sortedSaList = saList['Personal Instruction'].concat(saList['Group Instruction'], saList['Group Facilitation']);
        sortedSaList = sortedSaList.sort(function (a, b) {
            return new Date(a.start) - new Date(b.start)
        });
        var blockCount = 0;
        wjQuery.each(sortedSaList, function (i, saList) {
            var studentObject = saList;
            var studentStartHour = saList.start.getHours();
            if (studentStartHour >= minTime && studentStartHour <= maxTime) {
                var statusText = "Excused";
                var draggable1 = "";
                if (!self.checkAccountClosure() && studentObject['sessionStatus'] == UNEXCUSED_STATUS) {
                    draggable1 = " draggable";
                    statusText = "Unexcused";
                } else if (studentObject['sessionStatus'] == OMIT_STATUS) {
                    statusText = "Omitted";
                }
                var studentPosition = studentStartHour - minTime;
                var elm = '<div class="saStudent-container cursor padding-lr-xxs' + draggable1 + '" isfromSa="true" type="student" enrollmentId="' + saList.enrollmentId +
                    '" studUniqueId="' + saList.studUniqueId + '" uniqueValue="' + saList.id + '_' + saList.start +
                    '"  value="' + saList.id + '"><span>' + saList.name + ',' + saList.grade + " (" + statusText + ")" +
                    '</span><span class="timingDetail">,  ' + moment(saList.start).format("h:mm A") + ' - ' + moment(saList.end).format("h:mm A") +
                   '<i class="material-icons serviceIndicator" title="' + saList['serviceValue'] + '" style="';
                if (!isIE) {
                    elm += 'background:' + saList['subjectGradient'] + ';-webkit-background-clip: text;';
                }
                elm += ' color:' + saList['subjectColorCode'] + '">location_on</i></div>';
                var deliveryTypeIndex = self.selectedDeliveryType.map(function (y) {
                    return y;
                }).indexOf(saList.deliveryTypeId);
                if (deliveryTypeIndex != -1) {
                    var block = '<div class="student-attendance" id="sa_student_block_' + blockCount + '" style="height:auto;overflow:auto"></div>';
                    wjQuery('.sa-pane').append(block);
                    var blockColor = "";
                    switch (saList.deliveryTypeCode) {
                        case 1: {
                            blockColor = "sof-pi";
                            break;
                        }
                        case 2: {
                            blockColor = "sof-gf";
                            break;
                        }
                        case 3: {
                            blockColor = "sof-gi";
                            break;
                        }
                    }
                    wjQuery('#sa_student_block_' + blockCount).append('<div class="' + blockColor + '"></div>');
                    wjQuery('#sa_student_block_' + blockCount + ' .' + blockColor).append(elm);
                    blockCount++;
                }
            }
            self.showConflictMsg();
            if (!self.checkAccountClosure()) {
                self.draggable('draggable');
            }
        });
    }

    this.getTeacherSubjects = function (teacherObj) {
        var self = this;
        var subjects = [];
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

    /*
     * Populate Teacher availability panel
     */
    this.populateTAPane = function (teacherData) {
        var self = this;
        wjQuery(".teacher-availability").remove();
        for (var i = 0; i < teacherData.length ; i++) {
            var elm = '<div class="teacher-availability" id="teacher_block_' + i + '" style="overflow-y:auto;height:auto"></div>';
            wjQuery('.ta-pane').append(elm);
        }
        var currentCalendarDate = this.calendar.fullCalendar('getDate');
        teacherData = teacherData.sort(function (a, b) {
            return new Date(moment(currentCalendarDate).format('MM-DD-YYYY') + ' ' + a.startTime) - new Date(moment(currentCalendarDate).format('MM-DD-YYYY') + ' ' + b.startTime);
        });
        var blockCount = 0;
        for (var i = 0; i < teacherData.length; i++) {
            var teacherStart = new Date(moment(currentCalendarDate).format('MM-DD-YYYY') + ' ' + teacherData[i].startTime);
            var teacherEnd = new Date(moment(currentCalendarDate).format('MM-DD-YYYY') + ' ' + (teacherData[i].endTime));
            var teacherStartHour = teacherStart.getHours();
            if (teacherStartHour >= this.calendarOptions.minTime && teacherStartHour <= this.calendarOptions.maxTime) {
                var teacherPosition = teacherStartHour - this.calendarOptions.minTime;
                if (wjQuery("div[value='" + teacherData[i].id + "']").length > 0) {
                    var teacherTimingDetail = wjQuery("div[value='" + teacherData[i].id + "']").children();
                    var additionalTiming = "<span class='teacherTimingDetails'>, " + teacherData[i].startTime + " - " + teacherData[i].endTime + "</span>";
                    wjQuery(teacherTimingDetail[0]).append(additionalTiming)
                } else {
                    var elm = '<div class="teacher-block"> <div class="teacher-container" type="teacher" value="' + teacherData[i].id + '">' +
                                '<div class="display-inline-block teacherDetails"><span>' + teacherData[i].name + '</span><span class="teacherTimingDetails"> ' + teacherData[i].startTime + ' - ' + teacherData[i].endTime + '</span></div>';
                    var staffPrograms = this.getProgramObj(teacherData[i].id);
                    if (staffPrograms.length != 0) {
                        var serviceInfoBox = "";
                        for (var a = 0; a < staffPrograms.length; a++) {
                            if (staffPrograms[a].name.length <= 25) {
                                serviceInfoBox += "<div class='subject-detail'><span class='subject-identifier' style='background:" + staffPrograms[a].color + "'></span>" +
                                                "<span class='subject-name'>" + staffPrograms[a].name + "</span></div>";
                            }
                            else {
                                serviceInfoBox += "<div class='subject-detail'><span class='subject-identifier' style='background:" + staffPrograms[a].color + "'></span>" +
                                                "<span class='subject-name'>" + (staffPrograms[a].name).substr(0, 25) + " <span title='" + staffPrograms[a].name + "'>...</span>" + "</span></div>";
                            }
                        }

                        elm += '<i class="material-icons info-icon cursor service-info service-info-custom s_' + i + '"style="padding-left: 5px;top: -2px;">info<div class="custom_title custom_title_' +
                            i + '">' + serviceInfoBox + '</div></i>';

                    }
                    elm += '</div></div>';
                    wjQuery('#teacher_block_' + blockCount).append(elm);
                    blockCount++;
                    if (!self.checkAccountClosure()) {
                        this.draggable('teacher-container');
                    }
                }
            }
        }
        var tooltips = wjQuery('.service-info-custom .custom_title');
        wjQuery('.service-info-custom').hover(function (e) {
            var x = (e.clientX - 260) + 'px';
            var y = (e.clientY + 5) + 'px';
            for (var i = 0; i < tooltips.length; i++) {
                tooltips[i].style.top = y;
                tooltips[i].style.left = x;
            }
        })

        //}
    }

    /*
     *  Method accepts student object and this will be called after dragging student
     *  from sa pane to session 
     */
    this.saveSOFtoSession = function (student, oldStudent) {
        var self = this;
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
                if (student[0]['makeupExpiryDate']) {
                    objNewSession['hub_makeup_expiry_date'] =  moment(student[0]['makeupExpiryDate']).format('YYYY-MM-DD');
                    objSession['hub_makeup_expiry_date'] = moment(student[0]['makeupExpiryDate']).format('YYYY-MM-DD');
                }

                objNewSession['hub_is_1to1'] = student[0]['is1to1'];
                objNewSession['hub_isattended'] = student[0]['isAttended'];
                objNewSession['hub_enrollment@odata.bind'] = oldStudent['enrollmentId'];
                objNewSession['hub_service@odata.bind'] = oldStudent['serviceId'];
                objNewSession['hub_center@odata.bind'] = student[0]["locationId"];
                objNewSession['hub_student@odata.bind'] = student[0].id;
                objNewSession['hub_resourceid@odata.bind'] = student[0].resourceId;
                objNewSession['hub_session_date'] = moment(student[0].start).format("YYYY-MM-DD");
                objNewSession['hub_deliverytype'] = student[0].deliveryTypeId;
                objNewSession['hub_deliverytype@OData.Community.Display.V1.FormattedValue'] = student[0].deliveryType;
                objNewSession['hub_deliverytype_code'] = student[0].deliveryTypeCode;
                objSession['hub_deliverytype_code'] = student[0].deliveryTypeCode;
                
                objSession['hub_start_time'] = this.convertToMinutes(moment(student[0]['start']).format("h:mm A"));
                objSession['hub_end_time'] = this.convertToMinutes(moment(student[0]['end']).format("h:mm A"));
                objSession['hub_isattended'] = student[0]['isAttended'];

                // get location obj
                var locationObj = self.getLocationObject(self.locationId);
                objNewSession['ownerObj'] = locationObj['ownerObj'];
                objSession['ownerObj'] = locationObj['ownerObj'];

                if (oldStudent['studentSession']) {
                    objNewSession['hub_student_session@odata.bind'] = oldStudent['studentSession'];
                    objSession['hub_student_session@odata.bind'] = oldStudent['studentSession'];
                }
                if (oldStudent.masterScheduleId) {
                    objNewSession['hub_master_schedule@odata.bind'] = oldStudent['masterScheduleId'];
                    objSession['hub_master_schedule@odata.bind'] = oldStudent['masterScheduleId'];
                }
                if (oldStudent.sourceAppId) {
                    objNewSession['hub_sourceapplicationid'] = oldStudent['sourceAppId'];
                    objSession['hub_sourceapplicationid'] = oldStudent['sourceAppId'];
                }
                return data.saveSOFtoSession(objNewSession, objSession);
            }
        }
    };

    /*
     *  Method accepts teacher object and this will be called after dragging teacher
     *  from ta pane to session 
     */
    this.saveTAtoSession = function (teacher) {
        var self = this;
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
            objNewSession.hub_schedule_type = teacher.scheduleType;
            // Get Location Obj 
            var locationObj = self.getLocationObject(self.locationId);
            objNewSession['ownerObj'] = locationObj['ownerObj'];
            objStaff['ownerObj'] = locationObj['ownerObj'];
            objStaff['hub_centerid'] = locationObj['hub_centerid'];
            var responseObj = data.saveTAtoSession(objStaff, objNewSession);
            if(responseObj != null && responseObj != undefined){
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
            }
            return responseObj;
        }
    };


    /*
     *  Method will be called on drop of student/teacher(all calendar drag and drop) 
     */
    this.createEventOnDrop = function (t, date, allDay, ev, ui, resource, elm) {
        var self = t;
        var newResourceObj = t.getResourceObj(resource.id);
        var prevEventId = wjQuery(elm).attr("eventid");
        var studUniqueId = wjQuery(elm).attr("studUniqueId");
        var enrollmentId = wjQuery(elm).attr("enrollmentId");
        if (wjQuery(elm).attr("type") == 'student') {
            var newEvent = this.calendar.fullCalendar('clientEvents', resource.id + date);
            var stuId = wjQuery(elm).attr("value");
            var uniqueVal = wjQuery(elm).attr("uniqueValue").split("_");
            var startHour = new Date(date);
            var prevStudObj = [];
            if(wjQuery(elm).attr("isfromSa") == "true"){
                var prevStudObj = this.saList['Personal Instruction'].filter(function (x) {
                    return  x.studUniqueId == studUniqueId
                    // return  x.id == uniqueVal[0] &&
                    //         x.enrollmentId == enrollmentId &&
                    //         x.start.getTime() == new Date(uniqueVal[1]).getTime()
                })
                if (prevStudObj.length == 0) {
                    prevStudObj = this.saList['Group Facilitation'].filter(function (x) {
                        return  x.studUniqueId == studUniqueId
                        // return  x.id == uniqueVal[0] &&
                        //         x.start.getTime() == new Date(uniqueVal[1]).getTime()
                    })
                    if (prevStudObj.length == 0) {
                        prevStudObj = this.saList['Group Instruction'].filter(function (x) {
                            return  x.studUniqueId == studUniqueId
                            // return  x.id == uniqueVal[0] &&
                            //         x.start.getTime() == new Date(uniqueVal[1]).getTime()
                        })
                    }
                }
            }else{
                var prevStudObj = this.sofList['Personal Instruction'].filter(function (x) {
                    // return  x.studUniqueId == studUniqueId
                    return  x.id == uniqueVal[0] &&
                            x.enrollmentId == enrollmentId &&
                            x.start.getTime() == new Date(uniqueVal[1]).getTime()
                })
                if (prevStudObj.length == 0) {
                    prevStudObj = this.sofList['Group Facilitation'].filter(function (x) {
                        return  x.studUniqueId == studUniqueId
                        // return  x.id == uniqueVal[0] &&
                        //         x.start.getTime() == new Date(uniqueVal[1]).getTime()
                    })
                    if (prevStudObj.length == 0) {
                        prevStudObj = this.sofList['Group Instruction'].filter(function (x) {
                            return  x.studUniqueId == studUniqueId
                            // return  x.id == uniqueVal[0] &&
                            //         x.start.getTime() == new Date(uniqueVal[1]).getTime()
                        })
                    }
                }
            }

            if (prevStudObj.length) {
                prevStudObj = prevStudObj[0];
                var giValidation = true;
                var numHour = prevStudObj['duration'] / 60;
                var prevdate1 = new Date(prevStudObj['startHour']);
                var prevStudEndHour = new Date(prevdate1.setHours(prevdate1.getHours() + numHour));
                var date1 = new Date(date);
                var endHour = new Date(date1.setHours(date1.getHours() + 1));
                if (prevStudObj['deliveryTypeCode'] == groupInstruction) {
                    if (prevStudObj['startHour'].getTime() == date.getTime() && prevStudEndHour.getTime() == endHour.getTime()) {
                        giValidation = false;
                    }
                } else {
                    giValidation = false;
                }

                var displayStart = moment(new Date(prevStudObj['startHour'])).format("DD-MM-YYYY hh:mm A");
                var displayEnd = moment(new Date(prevStudEndHour)).format("DD-MM-YYYY hh:mm A");

                if (giValidation) {
                    t.prompt("The selected student is not allowed to scheduled for the respective timeslot.<br>Student session start time:-" + displayStart + "<br> Student session end time:-" + displayEnd);
                } else {
                    // var allowToDropStudent = true;
                    // if(prevStudObj['deliveryTypeCode'] == personalInstruction){
                    var allowToDropStudent = self.validateStudentOnSameRow(stuId, startHour, prevStudObj, false, true, enrollmentId);
                    // }
                    var instructionalHourValidation = self.checkInstructionalHours(prevStudObj, startHour);
                    if (allowToDropStudent && instructionalHourValidation) {
                        if (newEvent.length == 0) {
                            if (prevStudObj['deliveryType'] == resource.deliveryType) {
                                t.studentSofConflictCheck(t, date, allDay, ev, ui, resource, elm);
                            } else {
                                var msg = "DeliveryType is different. Do you wish to continue?";
                                t.studentSofCnfmPopup(t, date, allDay, ev, ui, resource, elm, msg);
                            }
                            
                        } else if (newEvent.length == 1) {
                            var errArry = self.checkEventValidation(resource.id + date, prevEventId, prevStudObj, elm, newResourceObj, prevStudObj,startHour);
                            if(errArry.alert.length){
                                var messageString = '';
                                for (var i = 0; i < errArry.alert.length; i++) {
                                    messageString += errArry.alert[i] + ", ";
                                }
                                messageString = messageString.substr(0, messageString.length - 2);
                                errArry.confirmation = [];
                                self.prompt(messageString);
                            } else if (errArry.confirmation.length) {
                                var messageString = '';
                                for (var i = 0; i < errArry.confirmation.length; i++) {
                                    messageString += errArry.confirmation[i] + ", ";
                                }
                                messageString = messageString.substr(0, messageString.length - 2);
                                self.studentSofCnfmPopup(t, date, allDay, ev, ui, resource, elm, messageString+". Do you wish to continue?");
                            }else{
                                self.studentSofConflictCheck(t, date, allDay, ev, ui, resource, elm);
                            }
                        }
                    } else {
                        var msg = "The selected student with same service is already scheduled for the respective timeslot.";
                        if (!instructionalHourValidation) {
                            msg = "No instructional hours are starting at this time.Cannot be placed."
                        }
                        t.prompt(msg);
                    }
                }
            }else{
                wjQuery(".loading").hide();
            }
        }
        else if (wjQuery(elm).attr("type") == 'teacher') {
            var newEvent = this.calendar.fullCalendar('clientEvents', resource.id + date);
            var teacherId = wjQuery(elm).attr("value");
            var techerPrograms = this.getProgramObj(teacherId);
            var startHour = new Date(date);
            var teacher = t.taList.filter(function (x) {
                if (x.id == teacherId) {
                    return x;
                };
            });
            var eventDuration = 60;
            if (newEvent.length != 0) {
                eventDuration = (new Date(newEvent[0].end).getTime() - new Date(newEvent[0].start).getTime()) / (1000 * 60);
            }
            var allowToDropTeacher = self.validateTeacherOnSameRow(teacherId, startHour, teacher[0], false);
            if (allowToDropTeacher) {
                if (self.checkTeacherScheduleInDiffCenter(teacherId, startHour, eventDuration)) {
                    self.prompt("The selected staff is already scheduled for the respective timeslot in different center.");
                } else {
                    if (self.checkForStaffAvailability(teacherId, startHour)) {
                         if (newEvent.length == 0) {
                             this.tapaneConflictCheck(t, date, allDay, ev, ui, resource, elm, false,eventDuration);
                         } else if (newEvent.length == 1) {
                             eventDuration = (new Date(newEvent[0].end).getTime() - new Date(newEvent[0].start).getTime()) / (1000 * 60);
                            var isNonPreferred = self.checkNonPreferredStudentForTeacher(teacherId, newEvent[0]);
                            if (!isNonPreferred) {
                                if (!(newEvent[0].hasOwnProperty('teachers')) || (newEvent[0].hasOwnProperty('teachers') && newEvent[0]['teachers'].length == 0)) {
                                    if (!newEvent[0].hasOwnProperty('students')) {
                                        this.tapaneConflictCheck(t, date, allDay, ev, ui, resource, elm, false,eventDuration);
                                    } else{
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
                                            var msg = "Teacher program is not matching. Do you wish to continue?";
                                            this.taPaneCnfmPopup(t, date, allDay, ev, ui, resource, elm, msg, false, eventDuration);
                                        } else {
                                            this.tapaneConflictCheck(t, date, allDay, ev, ui, resource, elm, false, eventDuration);
                                        }
                                    }
                                }
                            } else {
                                // Non prefered case
                                if (!(newEvent[0].hasOwnProperty('teachers')) || (newEvent[0].hasOwnProperty('teachers') && newEvent[0]['teachers'].length == 0)) {
                                    if (!newEvent[0].hasOwnProperty('students')) {
                                        var msg = "Non preferred teacher. Do you wish to continue?"
                                        self.taPaneCnfmPopup(t, date, allDay, ev, ui, resource, elm, msg, false, eventDuration);
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
                                        var msg = "Non preferred teacher";
                                        if (showPopup) { msg += " and Teacher program is not matching" }
                                        self.taPaneCnfmPopup(t, date, allDay, ev, ui, resource, elm, msg + ". Do you wish to continue?", false, eventDuration);
                                    } 
                                }
                            }
                        }
                    } else {
                        if (newEvent.length == 0) {
                            var msg = "Teacher is not available. Do you wish to continue?"
                            this.taPaneCnfmPopup(t, date, allDay, ev, ui, resource, elm, msg, true, eventDuration);
                        } else if (newEvent.length == 1) {
                            var isNonPreferred = self.checkNonPreferredStudentForTeacher(teacherId, newEvent[0]);
                            if (!isNonPreferred) {
                                if (!(newEvent[0].hasOwnProperty('teachers')) || (newEvent[0].hasOwnProperty('teachers') && newEvent[0]['teachers'].length == 0)) {
                                    if (!newEvent[0].hasOwnProperty('students')) {
                                        var msg = "Teacher is not available. Do you wish to continue?"
                                        this.taPaneCnfmPopup(t, date, allDay, ev, ui, resource, elm, msg, true, eventDuration);
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
                                        var msg = "Teacher is not available";
                                        if (showPopup) { msg += " and Teacher program is not matching" }
                                        this.taPaneCnfmPopup(t, date, allDay, ev, ui, resource, elm, msg+". Do you wish to continue?", true,eventDuration);
                                    }
                                }
                            } else {
                                // non prefered case
                                if (!(newEvent[0].hasOwnProperty('teachers')) || (newEvent[0].hasOwnProperty('teachers') && newEvent[0]['teachers'].length == 0)) {
                                    if (!newEvent[0].hasOwnProperty('students')) {
                                        var msg = "Non preferred teacher and Teacher is not available. Do you wish to continue?"
                                        this.taPaneCnfmPopup(t, date, allDay, ev, ui, resource, elm, msg, true, eventDuration);
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
                                        var msg = "Non preferred teacher, Teacher is not available";
                                        if (showPopup) { msg += " and Teacher program is not matching" }
                                        this.taPaneCnfmPopup(t, date, allDay, ev, ui, resource, elm, msg+". Do you wish to continue?", true, eventDuration);
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                t.prompt("The selected staff is already scheduled for the respective timeslot.");
            }
        }
        else if (wjQuery(elm).attr("type") == 'studentSession') {
            var stuId = wjQuery(elm).attr("value");
            var startHour = new Date(date);
            var newEvent = this.calendar.fullCalendar('clientEvents', resource.id + date);
            var prevEvent = this.calendar.fullCalendar('clientEvents', prevEventId);
            var eventDuration = (new Date(prevEvent[0].end).getTime() - new Date(prevEvent[0].start).getTime()) / (1000 * 60);

            var prevResourceObj = t.getResourceObj(prevEvent[0]['resourceId']);
            var uniqueId = wjQuery(elm).attr('uniqueId');
            var startTime = uniqueId.split('_')[2];
            var index = -1;
            if (resource.id + date != prevEventId) {
                for (var i = 0; i < t.convertedStudentObj.length; i++) {
                    if(studUniqueId == t.convertedStudentObj[i].studUniqueId){
                        index = i;
                        break; 
                    }
                    // if (t.convertedStudentObj[i].id == stuId &&
                    //         t.convertedStudentObj[i].resourceId == uniqueId.split('_')[1] &&
                    //         t.convertedStudentObj[i].startHour.getTime() == new Date(startTime).getTime()) {
                    //     index = i;
                    //     break;
                    // }
                }
                if (index != -1) {
                    var prevStudObj = t.convertedStudentObj[index];
                    if (newResourceObj.deliveryTypeCode != groupInstruction) {
                        // var allowToDropStudent = true;
                        // if(prevStudObj.deliveryTypeCode == personalInstruction){
                        var allowToDropStudent = self.validateStudentOnSameRow(stuId, startHour, prevStudObj, true, false, enrollmentId);
                        var instructionalHourValidation = self.checkInstructionalHours(prevStudObj, startHour);
                        // }
                        if (allowToDropStudent && instructionalHourValidation) {
                            var minuteflag = true;
                            if (newEvent.length > 0) {
                                var newEventDuration = (new Date(newEvent[0].end).getTime() - new Date(newEvent[0].start).getTime()) / (1000 * 60);
                                if (newEventDuration != eventDuration) {
                                    minuteflag = false;
                                    t.prompt("Student slot timings are mismatching.Cannot be placed.");
                                }
                            }
                            if (minuteflag) {
                                if (newEvent.length == 0) {
                                    if (newResourceObj.deliveryTypeCode == prevStudObj.deliveryTypeCode) {
                                        t.studentSessionConflictCheck(t, date, allDay, ev, ui, resource, elm);
                                    } else {
                                        var msg = "DeliveryType is different. Do you wish to continue?";
                                        t.studentSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, msg);
                                    } 
                                }
                                else if (newEvent.length == 1) {
                                    var errArry = self.checkEventValidation(resource.id + date, prevEventId, prevStudObj, elm, newResourceObj, prevStudObj,startHour);
                                    if(errArry.alert.length){
                                        var messageString = '';
                                        for (var i = 0; i < errArry.alert.length; i++) {
                                            messageString += errArry.alert[i] + ", ";
                                        }
                                        messageString = messageString.substr(0, messageString.length - 2);
                                        errArry.confirmation = [];
                                        self.prompt(messageString);
                                    } else if (errArry.confirmation.length) {
                                        var messageString = '';
                                        for (var i = 0; i < errArry.confirmation.length; i++) {
                                            messageString += errArry.confirmation[i] + ", ";
                                        }
                                        messageString = messageString.substr(0, messageString.length - 2);
                                        self.studentSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, messageString+". Do you wish to continue?");
                                    }else{
                                        self.studentSessionConflictCheck(t, date, allDay, ev, ui, resource, elm);
                                    }
                                }
                            }
                        } else {
                            var msg = "The selected student with same service is already scheduled for the respective timeslot."
                            if (!instructionalHourValidation) {
                                msg = "No instructional hours are starting at this time.Cannot be placed.";
                            }
                            t.prompt(msg);
                        }
                    } else {
                        t.prompt("Can not be placed to a GI session.");
                    }
                }
            }
            wjQuery(".loading").hide();
        }
        else if (wjQuery(elm).attr("type") == 'teacherSession') {
            var teacherId = wjQuery(elm).attr("value");
            var startHour = new Date(date);
            var prevEventId = wjQuery(elm).attr("eventid");
            var techerPrograms = this.getProgramObj(teacherId);
            var newEvent = this.calendar.fullCalendar('clientEvents', resource.id + date);
            var prevEvent = this.calendar.fullCalendar('clientEvents', prevEventId);
            var eventDurationTeacher = (new Date(prevEvent[0].end).getTime() - new Date(prevEvent[0].start).getTime()) / (1000 * 60);
            prevEvent[0].duration = eventDurationTeacher;
            if (resource.id + date != prevEventId) {
                var updateFlag = false;
                var newEvent = this.calendar.fullCalendar('clientEvents', resource.id + date);
                var allowToDropTeacher = true;
                if (startHour.getTime() != prevEvent[0].start.getTime()) {
                    allowToDropTeacher = self.validateTeacherOnSameRow(teacherId, startHour, prevEvent[0], true);
                }
                if (allowToDropTeacher) {
                    if (self.checkTeacherScheduleInDiffCenter(teacherId, startHour, eventDurationTeacher)) {
                        t.prompt("The selected staff is already scheduled for the respective timeslot in different center.");
                    } else {
                        if (newEvent.length == 0) {
                            var staffAvailabilityCheck = self.checkForStaffAvailability(teacherId, startHour);
                            if (staffAvailabilityCheck ) {
                                self.teacherSessionConflictCheck(t, date, allDay, ev, ui, resource, elm, false);
                            } else{
                                var msg = "Teacher is not available. Do you wish to continue?";
                                self.teacherSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, msg, true);
                            } 
                        } else if (newEvent.length == 1) {
                            var isNonPreferred = self.checkNonPreferredStudentForTeacher(teacherId, newEvent[0]);
                            if (!isNonPreferred) {
                                if (!(newEvent[0].hasOwnProperty('teachers')) || (newEvent[0].hasOwnProperty('teachers') && newEvent[0]['teachers'].length == 0)) {
                                    if (!newEvent[0].hasOwnProperty('students')) {
                                        var staffAvailabilityCheck = self.checkForStaffAvailability(teacherId, startHour);
                                        if (staffAvailabilityCheck) {
                                            self.teacherSessionConflictCheck(t, date, allDay, ev, ui, resource, elm, false);
                                        } else {
                                            var msg = "Teacher is not available. Do you wish to continue?";
                                            self.teacherSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, msg, true);
                                        }
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
                                        var msg = "Teacher is not available";
                                        var staffAvailabilityCheck = self.checkForStaffAvailability(teacherId, startHour);
                                        if (showPopup) { msg = "Teacher program is not matching" };
                                        if (!staffAvailabilityCheck && showPopup) { msg += " and teacher is not available" }
                                        if (showPopup) {
                                          self.teacherSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, msg+". Do you wish to continue?", !staffAvailabilityCheck);
                                        } else {
                                            if (staffAvailabilityCheck) {
                                                this.teacherSessionConflictCheck(t, date, allDay, ev, ui, resource, elm, !staffAvailabilityCheck);
                                            } else if (!staffAvailabilityCheck) {
                                                self.teacherSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, msg + ". Do you wish to continue?", !staffAvailabilityCheck);
                                            }
                                        }
                                    }
                                }
                            } else {
                                // Non preffred teacher case
                                if (!(newEvent[0].hasOwnProperty('teachers')) || (newEvent[0].hasOwnProperty('teachers') && newEvent[0]['teachers'].length == 0)) {
                                    if (!newEvent[0].hasOwnProperty('students')) {
                                        var staffAvailabilityCheck = self.checkForStaffAvailability(teacherId, startHour);
                                        var msg = "Non preferred teacher";
                                        if (!staffAvailabilityCheck) { msg += " and teacher is not available" };
                                        this.teacherSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, msg+". Do you wish to continue?", !staffAvailabilityCheck);
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
                                        var staffAvailabilityCheck = self.checkForStaffAvailability(teacherId, startHour);
                                        var msg = "Non preferred teacher";
                                        if (showPopup) { msg += ", Teacher program is not matching" };
                                        if (!staffAvailabilityCheck){msg+= " and Teacher is not available"}
                                        this.teacherSessionCnfmPopup(t, date, allDay, ev, ui, resource, elm, msg+". Do you wish to continue?", !staffAvailabilityCheck);
                                    }
                                }
                            }
                        }
                    }
                } else {
                    t.prompt("The selected staff is already scheduled for the respective timeslot.");
                }
            }else{
                wjQuery(".loading").hide();
            }
        }else{
            wjQuery(".loading").hide();
        }
        wjQuery(".loading").hide();
    };

    /*
     *  Method will be called on drop of teacher from ta pane to session
     *  This method is responsible for checking teacher related conflict/validation check and popup dispaly before drop.  
     */
    this.tapaneConflictCheck = function (t, date, allDay, ev, ui, resource, elm, notAvailable, eventDuration) {
        var self = this;
        var endDate = new Date(date);
        var startHour = new Date(date);
        if (!eventDuration) {
            eventDuration = 60;
        }
        var currentCalendarDate = this.calendar.fullCalendar('getDate');
        currentCalendarDate = new Date(currentCalendarDate.setMinutes(00));
        currentCalendarDate = new Date(currentCalendarDate.setSeconds(00));
        var endHour = moment(startHour).add(eventDuration,"m").toDate();
        var teacherId = wjQuery(elm).attr("value");
        var teacher = t.taList.filter(function (x) {
            return x.id == teacherId;
        });
        if (teacher) {
            var teacherObj = {
                id: teacher[0].id,
                name: teacher[0].name,
                start: date,
                startHour: startHour,
                end: new Date(endDate.setHours(endDate.getHours() + (eventDuration / 60))),
                resourceId: resource.id,
                deliveryTypeId: this.getResourceObj(resource.id).deliveryTypeId,
                deliveryType: this.getResourceObj(resource.id).deliveryType,
                locationId: teacher[0].locationId,
                centerId: self.locationId,
            };
            if (notAvailable) {
                teacherObj['scheduleType'] = FLOAT_TEACHER_TYPE;
            } else {
                teacherObj['scheduleType'] = SCHEDULE_STATUS;
            }
            var responseObj = this.saveTAtoSession(teacherObj);
            if (responseObj != undefined && responseObj != null) {
                teacherObj.scheduleId = responseObj['hub_staff_scheduleid'];
                if (self.convertedPinnedList.length && teacherObj.scheduleType != FLOAT_TEACHER_TYPE) {
                    var isPinned = self.convertedPinnedList.filter(function (obj) {
                        return (obj.startTime != undefined && obj.resourceId != undefined &&
                                obj.teacherId == teacherObj.id &&
                                obj.resourceId == teacherObj.resourceId &&
                                obj.startTime == moment(date).format("h:mm A") &&
                                obj.dayId == self.getDayValue(currentCalendarDate))
                    });
                    if (isPinned[0] != undefined) {
                        teacherObj['pinId'] = isPinned[0].id;
                    }
                }
                this.convertedTeacherObj.push(teacherObj);
                t.populateTeacherEvent([teacherObj], true);
                t.populateTAPane(t.taList);
            }
        }
        wjQuery(".loading").hide();
    }

    /*
     *  Method will be called on drop of teacher between session to session
     *  This method is responsible for checking teacher related conflict/validation check and popup dispaly before drop.  
     */
    this.teacherSessionConflictCheck = function (t, date, allDay, ev, ui, resource, elm, notAvailable) {
        var self = this;
        var endDate = new Date(date);
        var startHour = new Date(date);
        var teacherId = wjQuery(elm).attr("value");
        var uniqTeacherId = wjQuery(elm).attr("id");
        var prevEventId = wjQuery(elm).attr("eventid");
        var uniqueId = wjQuery(elm).attr('uniqueId');
        var prevEvent = this.calendar.fullCalendar('clientEvents', prevEventId);
        var currentCalendarDate = self.calendar.fullCalendar('getDate');

        // get teacher index based on prev resourceId and start time
        var index = -1;
        for (var i = 0; i < t.convertedTeacherObj.length; i++) {
            if (t.convertedTeacherObj[i].id == teacherId &&
              t.convertedTeacherObj[i].resourceId == uniqueId.split('_')[1] &&
              t.convertedTeacherObj[i].startHour.getTime() == new Date(uniqueId.split('_')[2]).getTime()) {
                index = i;
                break;
            }
        }

        if (t.convertedTeacherObj[index]) {
            var newTeacherSession = wjQuery.extend(true, {}, t.convertedTeacherObj[index]);
            elm.remove();
            newTeacherSession.start = date;
            newTeacherSession.startHour = startHour;
            newTeacherSession.end = this.setEnd(t.convertedTeacherObj[index], newTeacherSession);
            newTeacherSession.resourceId = resource.id;
            newTeacherSession.deliveryTypeId = t.getResourceObj(resource.id).deliveryTypeId;
            newTeacherSession.deliveryType = t.getResourceObj(resource.id).deliveryType;
            newTeacherSession.pinId = undefined;
            if (self.convertedPinnedList.length && newTeacherSession.scheduleType != FLOAT_TEACHER_TYPE) {
                var isPinned = self.convertedPinnedList.filter(function (obj) {
                    return (obj.startTime != undefined && obj.resourceId != undefined &&
                            obj.teacherId == newTeacherSession.id &&
                            obj.resourceId == newTeacherSession.resourceId &&
                            obj.startTime == moment(date).format("h:mm A") &&
                            obj.dayId == self.getDayValue(currentCalendarDate))
                });
                if (isPinned[0] != undefined) {
                    newTeacherSession.pinId = isPinned[0].id;
                }
            }
            var responseObj = t.saveTeacherToSession(newTeacherSession, t.convertedTeacherObj[index], notAvailable);
            var teacher =  newTeacherSession;
            var prevTeacher = t.convertedTeacherObj[index];
            if (typeof responseObj == 'boolean' && responseObj) {
                if (notAvailable) {
                    teacher['scheduleType'] = FLOAT_TEACHER_TYPE;
                } else {
                    teacher['scheduleType'] = teacher['scheduleType'] == undefined ? SCHEDULE_STATUS : teacher['scheduleType'];
                }
                self.populateTeacherEvent([teacher], true);
                self.updatePrevTeacherEvent(prevEvent, teacherId, prevEventId);
            }else if (typeof responseObj == 'object' && responseObj != null) {
                if (responseObj.hasOwnProperty('hub_staff_scheduleid')) {
                    if (notAvailable) {
                        teacher['scheduleType'] = FLOAT_TEACHER_TYPE;
                    } else {
                        teacher['scheduleType'] = teacher['scheduleType'] == undefined ? SCHEDULE_STATUS : teacher['scheduleType'];
                    }
                    if (teacher.hasOwnProperty('isFromMasterSchedule')) {
                        delete teacher.isFromMasterSchedule;
                        delete teacher.pinId;
                    }
                    teacher['scheduleId'] = responseObj['hub_staff_scheduleid'];
                    var index = -1;
                    for (var i = 0; i < self.convertedTeacherObj.length; i++) {
                        if (self.convertedTeacherObj[i].startHour != undefined &&
                            self.convertedTeacherObj[i].id == teacher.id &&
                            self.convertedTeacherObj[i].startHour.getTime() == prevTeacher.startHour.getTime() &&
                            self.convertedTeacherObj[i].resourceId == prevTeacher.resourceId) {
                            index = i;
                            break;
                        }
                    }
                    if (index != -1) {
                        self.convertedTeacherObj[index] = teacher;
                        self.populateTeacherEvent([teacher], true);
                        self.populateTAPane(self.taList);
                        self.updatePrevTeacherEvent(prevEvent, teacherId, prevEventId);
                    }
                }
            }
        }
        this.openSofPane();
        this.showConflictMsg();
        this.draggable('draggable');
    }

    this.setEnd = function (prevObj, newObj) {
        if (prevObj.end != undefined && prevObj.start != undefined) {
            var duration = (prevObj.end.getTime() - prevObj.start.getTime()) / (1000 * 60);
            return new Date(new Date(newObj.start).setMinutes(new Date(newObj.start).getMinutes() + duration))
        }
    }

    /*
     *  Method will be called on drop of student from sa pane to session
     *  This method is responsible for checking student related conflict/validation check and popup dispaly before drop.  
     */
    this.studentSofConflictCheck = function (t, date, allDay, ev, ui, resource, elm) {
        var self = this;
        var newEvent = this.calendar.fullCalendar('clientEvents', resource.id + date);
        var endDate = new Date(date);
        var startHour = new Date(date);
        var stuId = wjQuery(elm).attr("value");
        var enrollmentId = wjQuery(elm).attr("enrollmentId");
        var studUniqueId = wjQuery(elm).attr("studUniqueId");
        var uniqueVal = wjQuery(elm).attr("uniqueValue").split("_");
        var parentElement = elm.parentElement;
        var student = [];
        var stdIndex = -1;
        var sofType = "";

        if(wjQuery(elm).attr("isfromSa") == "true"){
            for (var sw = 0; sw < this.saList['Personal Instruction'].length; sw++) {
                // if (this.saList['Personal Instruction'][sw].id == uniqueVal[0] &&
                //     this.saList['Personal Instruction'][sw].enrollmentId == enrollmentId &&
                //     this.saList['Personal Instruction'][sw].start.getTime() == new Date(uniqueVal[1]).getTime()) {
                if (this.saList['Personal Instruction'][sw].studUniqueId == studUniqueId) {
                    sofType = "Personal Instruction";
                    stdIndex = sw;
                    break;
                }
            }
            if (stdIndex != -1) {
                student.push(this.saList['Personal Instruction'][stdIndex]);
            }
            if (student[0] == undefined) {
                student = [];
                for (var sw = 0; sw < this.saList['Group Facilitation'].length; sw++) {
                    if (this.saList['Group Facilitation'][sw].studUniqueId == studUniqueId) {
                        sofType = "Group Facilitation";
                        stdIndex = sw;
                        break;
                    }
                }
                if (stdIndex != -1) {
                    student.push(this.saList['Group Facilitation'][stdIndex]);
                }
                if (student[0] == undefined) {
                    student = [];
                    for (var sw = 0; sw < this.saList['Group Instruction'].length; sw++) {
                        if (this.saList['Group Instruction'][sw].studUniqueId == studUniqueId) {
                            sofType = "Group Instruction";
                            stdIndex = sw;
                            break;
                        }
                    }
                    if (stdIndex != -1) {
                        student.push(this.saList['Group Instruction'][stdIndex]);
                    }
                }
            }
        }else{
            for (var sw = 0; sw < this.sofList['Personal Instruction'].length; sw++) {
                // if (this.sofList['Personal Instruction'][sw].studUniqueId == studUniqueId) {
                if (this.sofList['Personal Instruction'][sw].id == uniqueVal[0] &&
                    this.sofList['Personal Instruction'][sw].enrollmentId == enrollmentId &&
                    this.sofList['Personal Instruction'][sw].start.getTime() == new Date(uniqueVal[1]).getTime()) {
                    sofType = "Personal Instruction";
                    stdIndex = sw;
                    break;
                }
            }
            if (stdIndex != -1) {
                student.push(this.sofList['Personal Instruction'][stdIndex]);
            }
            if (student[0] == undefined) {
                student = [];
                for (var sw = 0; sw < this.sofList['Group Facilitation'].length; sw++) {
                    if (this.sofList['Group Facilitation'][sw].studUniqueId == studUniqueId) {
                        sofType = "Group Facilitation";
                        stdIndex = sw;
                        break;
                    }
                }
                if (stdIndex != -1) {
                    student.push(this.sofList['Group Facilitation'][stdIndex]);
                }
                if (student[0] == undefined) {
                    student = [];
                    for (var sw = 0; sw < this.sofList['Group Instruction'].length; sw++) {
                        if (this.sofList['Group Instruction'][sw].studUniqueId == studUniqueId) {
                            sofType = "Group Instruction";
                            stdIndex = sw;
                            break;
                        }
                    }
                    if (stdIndex != -1) {
                        student.push(this.sofList['Group Instruction'][stdIndex]);
                    }
                }
            }
        }

        if (student[0] != undefined) {
            var prevStudent = wjQuery.extend(true, {}, student[0]);
            var newStudent = wjQuery.extend(true, [], student);
            newStudent[0].start = date;
            newStudent[0].startHour = startHour;
            newStudent[0].end = this.setEnd(prevStudent, newStudent[0]);
            newStudent[0].resourceId = resource.id;
            var responseObj = this.saveSOFtoSession(newStudent, prevStudent);
            if (typeof (responseObj) == 'boolean' && responseObj) {
                elm.remove();
                if(wjQuery(elm).attr("isfromSa") == "true"){
                    this.saList[sofType].splice(stdIndex, 1);
                }else{
                    this.sofList[sofType].splice(stdIndex, 1);
                }
                if (wjQuery(parentElement).html() == '') {
                    parentElement.remove();
                }
                newStudent[0]['sessionStatus'] = SCHEDULE_STATUS;
                if (prevStudent.startHour.getTime() != newStudent[0].startHour.getTime()) {
                    if (newStudent[0]['pinId']) {
                        delete newStudent[0]['pinId'];
                    }
                }
                this.convertedStudentObj.push(newStudent[0]);
                t.populateStudentEvent(newStudent, true);
            } else if (typeof (responseObj) == 'object' && responseObj != null && responseObj != undefined) {
                elm.remove();
                if(wjQuery(elm).attr("isfromSa") == "true"){
                    this.saList[sofType].splice(stdIndex, 1);
                }else{
                    this.sofList[sofType].splice(stdIndex, 1);
                }

                if (wjQuery(parentElement).html() == '') {
                    parentElement.remove();
                }
                if (responseObj['hub_student_session@odata.bind']) {
                    newStudent[0]['studentSession'] = responseObj['hub_student_session@odata.bind'];
                }
                if (responseObj['hub_master_schedule@odata.bind']) {
                    newStudent[0]['masterScheduleId'] = responseObj['hub_master_schedule@odata.bind'];
                }
                if (responseObj['hub_sourceapplicationid']) {
                    newStudent[0]['sourceAppId'] = responseObj['hub_sourceapplicationid'];
                }
                newStudent[0].sessionId = responseObj['hub_studentsessionid'];
                newStudent[0]['sessiontype'] = responseObj['hub_sessiontype'];
                newStudent[0]['sessionStatus'] = responseObj['hub_session_status'];
                newStudent[0]['isAttended'] = responseObj['hub_isattended'];
                if (newStudent[0].hasOwnProperty('isFromMasterSchedule')) {
                    delete newStudent[0].isFromMasterSchedule;
                    newStudent[0]['sessionStatus'] = SCHEDULE_STATUS;
                }
                if (prevStudent.startHour.getTime() != newStudent[0].startHour.getTime()) {
                    if (newStudent[0]['pinId']) {
                        delete newStudent[0]['pinId'];
                    }
                }
                this.convertedStudentObj.push(newStudent[0]);
                t.populateStudentEvent(newStudent, true);
            }else if(typeof responseObj == 'string'){
                self.prompt(responseObj);
            }
        }
        wjQuery(".loading").hide();
    }

    /*
     *  Method will be called on drop of student between session to session
     *  This method is responsible for checking student related conflict/validation check and popup dispaly before drop.  
     */
    this.studentSessionConflictCheck = function (t, date, allDay, ev, ui, resource, elm) {
        var self = this;
        var endDate = new Date(date);
        var startHour = new Date(date);
        var stuId = wjQuery(elm).attr("value");
        var uniqStuId = wjQuery(elm).attr("id");
        var studUniqueId = wjQuery(elm).attr("studUniqueId");
        var prevEventId = wjQuery(elm).attr("eventid");
        var prevEvent = this.calendar.fullCalendar('clientEvents', prevEventId);
        var uniqueId = wjQuery(elm).attr('uniqueId');
        var startTime = uniqueId.split('_')[2];

        var index = -1;
        for (var i = 0; i < t.convertedStudentObj.length; i++) {
            // if (t.convertedStudentObj[i].id == stuId &&
            //     t.convertedStudentObj[i].resourceId == uniqueId.split('_')[1] &&
            //        t.convertedStudentObj[i].startHour.getTime() == new Date(startTime).getTime()) {
            //     index = i;
            //     break;
            // }
            if(studUniqueId == t.convertedStudentObj[i].studUniqueId){
                index = i;
                break; 
            }
        }
        
        if (index != -1 && t.convertedStudentObj[index]) {
            var newStudentObj = wjQuery.extend(true, {}, t.convertedStudentObj[index]);
            newStudentObj.start = date;
            newStudentObj.startHour = startHour;
            newStudentObj.end = this.setEnd(t.convertedStudentObj[index], newStudentObj);
            newStudentObj.resourceId = resource.id;
            if (t.convertedStudentObj[index].startHour.getTime() != newStudentObj.startHour.getTime() && t.convertedStudentObj[index].isAttended) {
                newStudentObj.isAttended = false;
            }
            var prevStudent = t.convertedStudentObj[index];
            var newStudent = newStudentObj;
            var responseObj = t.saveStudentToSession(t.convertedStudentObj[index], newStudentObj);
            if (typeof responseObj == 'boolean' && responseObj) {
                delete newStudentObj.pinId; 
                if (t.convertedStudentObj[index].startHour.getTime() != newStudentObj.startHour.getTime()) {
                    newStudentObj.sessionStatus = RESCHEDULE_STATUS;
                }
                elm.remove();
                self.updatePrevStudentEvent(prevEvent, stuId, prevEventId, elm);
                var index = -1;
                for (var i = 0; i < this.convertedStudentObj.length; i++) {
                    // if (this.convertedStudentObj[i].id == prevStudent.id &&
                    //     this.convertedStudentObj[i].resourceId == prevStudent.resourceId &&
                    //     this.convertedStudentObj[i].startHour.getTime() == prevStudent.startHour.getTime()) {
                    //     index = i;
                    //     break;
                    // }
                    if(studUniqueId == this.convertedStudentObj[i].studUniqueId){
                        index = i;
                        break; 
                    }
                }
                if (index != -1) {
                    this.convertedStudentObj[index] = newStudentObj;
                    this.populateStudentEvent([newStudentObj], true);
                }
            }
            else if (typeof responseObj == 'object' && responseObj != null && responseObj != undefined) {
                if (responseObj['hub_student_session@odata.bind']) {
                    newStudentObj.studentSession = responseObj['hub_student_session@odata.bind'];
                }
                if (responseObj['hub_master_schedule@odata.bind']) {
                    newStudentObj.masterScheduleId = responseObj['hub_master_schedule@odata.bind'];
                }
                if (responseObj['hub_sourceapplicationid']) {
                    newStudentObj.sourceAppId = responseObj['hub_sourceapplicationid'];
                }
                if (responseObj.hasOwnProperty('hub_studentsessionid')) {
                    elm.remove();
                    self.updatePrevStudentEvent(prevEvent, stuId, prevEventId, elm);
                    delete newStudentObj.pinId;
                    delete newStudentObj.isFromMasterSchedule;
                    newStudentObj['sessionId'] = responseObj['hub_studentsessionid'];
                    newStudentObj['start'] = newStudentObj.start;
                    newStudentObj['end'] = newStudentObj.end;
                    newStudentObj['resourceId'] = responseObj['hub_resourceid@odata.bind'];
                    newStudentObj['sessiontype'] = responseObj['hub_sessiontype'];
                    newStudentObj['isAttended'] = responseObj['hub_isattended'];
                    newStudentObj['sessionStatus'] = responseObj['hub_session_status'];
                    var index = -1;
                    for (var i = 0; i < this.convertedStudentObj.length; i++) {
                        // if (this.convertedStudentObj[i].id == prevStudent.id &&
                        //     this.convertedStudentObj[i].resourceId == prevStudent.resourceId &&
                        //     this.convertedStudentObj[i].startHour.getTime() == prevStudent.startHour.getTime()) {
                        //     index = i;
                        //     break;
                        // }
                        if(studUniqueId == this.convertedStudentObj[i].studUniqueId){
                            index = i;
                            break; 
                        }
                    }
                    if (index != -1) {
                        this.convertedStudentObj[index] = newStudentObj;
                        this.populateStudentEvent([newStudentObj], true);
                    }
                }
            }else if(typeof responseObj == 'string'){
                self.prompt(responseObj);
            }
        }
        wjQuery(".loading").hide();
        this.openSofPane();
        this.showConflictMsg();
        this.draggable('draggable');
    }

    /*
     *  Method will be called on click of student right click option excuse
     *  This method is responsible for updateing excused student properties.  
     */
    this.updateExcuseStudent = function(element, prevEvent){
        var self = this;
        var eventTitleHTML = wjQuery(prevEvent[0].title);
        eventTitleHTML1 = "";
        wjQuery.each(eventTitleHTML, function (k, v) {
            if (wjQuery(v).attr("uniqueId") == wjQuery(element).attr("uniqueId")) {
                eventTitleHTML[k] = wjQuery(element).addClass('excuse-student');
                eventTitleHTML[k] = wjQuery(element).removeClass('draggable');
                eventTitleHTML1 += eventTitleHTML[k][0].outerHTML;
            }else{
                eventTitleHTML1 += v.outerHTML;
            }
        });
        prevEvent[0].title = eventTitleHTML1;
        self.calendar.fullCalendar('updateEvent', prevEvent);
    }

    /*
     *  Method will be called on each drag and drop of student
     *  This method is responsible for updateing student properties.  
     */
    this.updatePrevStudentEvent = function(prevEvent, stuId, prevEventId, element){
        var self = this;
        if (prevEvent != undefined && prevEvent.length) {
            var studUniqueId = wjQuery(element).attr("studUniqueId");
            var eventTitleHTML = wjQuery(prevEvent[0].title);
            for (var i = 0; i < eventTitleHTML.length; i++) {
                if (wjQuery(eventTitleHTML[i]).attr('studUniqueId') == studUniqueId) {
                    eventTitleHTML.splice(i, 1);
                }
            }
            if (eventTitleHTML.prop('outerHTML') != undefined) {

                // update noOfStudent property from previous event Object.
                if (eventTitleHTML.length == 1) {
                    prevEvent[0].title = eventTitleHTML.prop('outerHTML');
                } else {
                    prevEvent[0].title = "";
                    for (var i = 0; i < eventTitleHTML.length; i++) {
                        prevEvent[0].title += eventTitleHTML[i].outerHTML;
                    }
                }
                // var removeStudentIndex = prevEvent[0].students.map(function (x) {
                //     return x.id;
                // }).indexOf(stuId);

                var removeStudentIndex = prevEvent[0].students.map(function (x) {
                    return x.studUniqueId;
                }).indexOf(studUniqueId);

                prevEvent[0].students.splice(removeStudentIndex, 1);
                // No students remove lock from prev event
                if (prevEvent[0]['students'] == undefined || prevEvent[0].hasOwnProperty('students') && prevEvent[0]['students'].length == 0) {
                    if (prevEvent[0].title.indexOf('<img class="onetoone" title="1:1 Session" src="/webresources/hub_/calendar/images/lock.png">') != -1) {
                        prevEvent[0].title = prevEvent[0].title.replace('<img class="onetoone" title="1:1 Session" src="/webresources/hub_/calendar/images/lock.png">', "");
                        prevEvent[0].is1to1 = false;
                    }
                }

                // remove all conflicts By passing prevEvent Object 
                prevEvent[0]['noOfStudents'] = 0; 
                if(prevEvent[0].hasOwnProperty('students') && prevEvent[0]['students'].length){
                    wjQuery.each(prevEvent[0]['students'], function (key, val) {
                        prevEvent[0]['noOfStudents'] += 1; 
                    });
                }

                self.removeAllConflictsFromPrevEvent(prevEvent[0]);
                eventTitleHTML = wjQuery(prevEvent[0].title);
                if ((eventTitleHTML.length == 1 && (eventTitleHTML[0].className == "placeholder teacher-placeholder" || eventTitleHTML[0].className == "student-placeholder-" + prevEvent[0].deliveryType)) ||
                  (eventTitleHTML.length == 2 && eventTitleHTML[0].className == "placeholder teacher-placeholder" && eventTitleHTML[1].className == "student-placeholder-" + prevEvent[0].deliveryType) ||
                  (eventTitleHTML.length == 3 && eventTitleHTML[0].className == "onetoone" && eventTitleHTML[1].className == "placeholder teacher-placeholder" && eventTitleHTML[2].className == "student-placeholder-" + prevEvent[0].deliveryType)) {
                    for (var i = 0; i < this.eventList.length; i++) {
                        if (this.eventList[i].id == prevEventId){
                            this.eventList.splice(i, 1);
                            this.calendar.fullCalendar('removeEvents', prevEventId);
                        }
                    }
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

    /*
     *  Method will be called on each drag and drop of teacher
     *  This method is responsible for updateing teacher properties.  
     */
    this.updatePrevTeacherEvent = function(prevEvent, teacherId, prevEventId){
        var self = this;
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
                        prevEvent[0].title = "<span class='placeholder teacher-placeholder'>Teacher name</span>";
                        self.addContext("", 'teacherPlaceholder', true, true);
                        prevEvent[0].title += eventTitleHTML.prop('outerHTML');
                    } else {
                        prevEvent[0].title = eventTitleHTML.prop('outerHTML');
                    }
                } else {
                    prevEvent[0].title = "";
                    if (prevEvent[0].teachers.length == 1) {
                        prevEvent[0].title += "<span class='placeholder teacher-placeholder'>Teacher name</span>";
                        self.addContext("", 'teacherPlaceholder', true, true);
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
                        if (prevEvent[0].title.indexOf('<span class="student-placeholder-' + prevEvent[0].deliveryType + '">Student name</span>') == -1) {
                            prevEvent[0].title += '<span class="student-placeholder-' + prevEvent[0].deliveryType + '">Student name</span>';
                            self.addContext("", 'studentPlaceholder', true, prevEvent[0].deliveryTypeCode);
                        }
                    }
                }
                // No students remove lock from prev event
                if (prevEvent[0]['students'] == undefined || prevEvent[0].hasOwnProperty('students') && prevEvent[0]['students'].length == 0) {
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
               self.removeAllConflictsFromPrevEvent(prevEvent[0]);
                eventTitleHTML = wjQuery(prevEvent[0].title);
                if ((eventTitleHTML.length == 1 && (eventTitleHTML[0].className == "placeholder teacher-placeholder" || eventTitleHTML[0].className == "student-placeholder-" + prevEvent[0].deliveryType)) ||
                   (eventTitleHTML.length == 2 && eventTitleHTML[0].className == "placeholder teacher-placeholder" && eventTitleHTML[1].className == "student-placeholder-" + prevEvent[0].deliveryType) ||
                   (eventTitleHTML.length == 3 && eventTitleHTML[0].className == "onetoone" && eventTitleHTML[1].className == "placeholder teacher-placeholder" && eventTitleHTML[2].className == "student-placeholder-" + prevEvent[0].deliveryType)) {
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
    }

    /*
     *  Method will be called on Calendar refresh
     *  This method is responsible for clearing all events and related global variables used to render calendar events.  
     */    
    this.clearEvents = function () {
        var self = this;
        self.filters = new Object();
        self.eventList = [];
        self.sofList = [];
        self.saList = [];
        wjQuery('.teacher-block').remove();
        wjQuery('.student-overflow').remove();
        wjQuery('.student-attendance').remove()
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

    var timeout;
    this.loadCalendar = function (args, view) {
        var self = this;
        // assign filter object to local scope filter to avoid this conflict
        var filters = this.filters;
        var t = this;
        var date = new Date(wjQuery('.headerDate').text());

        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();


        this.calendarOptions = {
            header: false,
            defaultView: view,
            disableResizing: true,
            minTime: minClatime,
            maxTime: maxClatime,
            axisFormat:'h:mm TT',
            allDayText: '',
            allDaySlot: true,
            droppable: true,
            onDrag: function (date, allDay, ev, ui, resource) {
                self.helperStartTime = moment(date).format('hh:mm A');
                if (self.resourceList.length >= 6) {
                    if (wjQuery(window).width() > 1100) {
                        self.bindMouseMovement();
                        self.scrollVertically();
                    }
                }
            },
            drop: function (date, allDay, ev, ui, resource) {
                clearTimeout(timeout);
                wjQuery(".loading").show();
                timeout = setTimeout(function () {
                    t.createEventOnDrop(t, date, allDay, ev, ui, resource, ui.helper.context);
                }, 100);
            },
            handleWindowResize: true,
            height: window.innerHeight - 50,
            slotMinutes: slotS,
            selectable: false,
            slotEventOverlap: true,
            selectHelper: true,
            select: function (start, end, allDay, event, resourceId) {
                if (title) {
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
            eventClick: function (calEvent, jsEvent, view) {
                if (calEvent.className[0] != "leave-day-class") {
                    self.renderWeekModal(calEvent, jsEvent, view);
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
        else {
            this.calendarOptions.year = y;
            this.calendarOptions.month = m;
            this.calendarOptions.date = d;
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

     /*
     *  Method will be called on Calendar refresh
     *  This method is responsible for calling master schedule records from backend.  
     */  
    this.findDataSource = function (currentCalendarDate, view) {
        var self = this;
        var now = new Date();
        now = self.getEndOfWeek(now);
        now.setDate(now.getDate() + numOfDays);
        //constant from instruction view js
        // now.setDate(now.getDate() + MASTER_SCHEDULE_CONST);
        if (view.name == 'resourceDay') {
            if (currentCalendarDate > now.getTime()) {
                return true;
            }
            return false;
        }
        else {
            if (view.end.getTime() > now.getTime()) {
                return true;
            }
            return false;
        }
    }

    this.getStartOfWeek = function (date) {
        // Copy date if provided, or use current date if not
        date = date ? new Date(date) : new Date();
        date.setHours(0, 0, 0, 0);
        // Set date to previous Sunday
        date.setDate(date.getDate() - date.getDay());
        return date;
    }

    this.getEndOfWeek = function (date) {
        date = this.getStartOfWeek(date);
        date.setDate(date.getDate() + 6);
        return date;
    }

    /*
     *  Method will be called on click of calendar navigation 
     *  This method is responsible for navigating date and renders calendar by calling resresh calendar event.  
     */  
    this.prev = function (locationId) {
        var self = this;
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
    }

    /*
     *  Method will be called on click of calendar navigation 
     *  This method is responsible for navigating date and renders calendar by calling resresh calendar event.  
     */ 
    this.next = function (locationId) {
        var self = this;
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
    }

    /*
     *  Method will be called on initial rendar of calendar
     *  This method is responsible for fixing all columns width to 230px(Hardcoded).  
     */ 
    this.calendarFixedWidth = function () {
        var self = this;
        // Table Fixed column code +scroll  Start
        var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var d = new Date(wjQuery('.headerDate').text());
        var calDate = moment(d).format("MM/DD");
        var dayName = days[d.getDay()];
        var scwidth = (wjQuery(window).width() - 118);
        var cwidth;
        if (self.resourceList.length == 6) {
            if (wjQuery(window).width() > 1100) {
                cwidth = (Math.floor(scwidth / 6));
            }
            else {
                cwidth = 230;
            }
        }
        else {
            cwidth = 230;
            //alert(cwidth);
        }
        wjQuery('table.fc-border-separate, table.fc-border-separate.fc td,.fc th').css('width', +cwidth + 'px');
        var contentWidth = (((self.resourceList.length + 1) * cwidth) + 91) - cwidth + 27;
        //alert(contentWidth);
        wjQuery('.fc-content div.fc-view').css({ 'width': +contentWidth + 'px', 'background': '#fff' });
        if (wjQuery(window).width() >= 1100) {
            if (self.resourceList.length > 6) {
                wjQuery('#calendar div.fc-content').addClass('fc-scroll-content');
                if (wjQuery('.firstColTable').length == 0) {
                    wjQuery(".fc-view-resourceDay table thead tr").append("<div class='firstColTable'>" + dayName + "<br><span>" + calDate + "</span></div>");
                } else {
                    wjQuery('.firstColTable').remove();
                    wjQuery(".fc-view-resourceDay table thead tr").append("<div class='firstColTable'>" + dayName + "<br><span>" + calDate + "</span></div>");
                }
            }
            if (self.resourceList.length <= 6) {
                wjQuery('#calendar div.fc-content').removeClass('fc-scroll-content');
            }
        }
        if (wjQuery(window).width() < 1100) {
            wjQuery('#calendar div.fc-content').addClass('fc-scroll-content');
            wjQuery('.fc-scroll-content').css('height', wjQuery('.fc-view').height() - 20 + 'px');
        }
        wjQuery(".fc-scroll-content").off().on('scroll', function () {
            wjQuery(".open").removeClass("moveLeft");
            var scrollLeft = wjQuery(".fc-scroll-content").scrollLeft();
            var scrollWidth = wjQuery(".fc-scroll-content")[0].scrollWidth;
            var scrollContentWidth = wjQuery(".fc-scroll-content").width();
            if (scrollContentWidth == (scrollWidth - scrollLeft)) {
                wjQuery(".open").addClass("moveLeft");
            }
        });
    }

     /*
     *  Method will be called on initial rendar of calendar
     *  This method is responsible for calling backend all recoders to populate calendar events based on certain conditions like 
     *  Master data/ actual data.  
     */ 
    this.refreshCalendarEvent = function (locationId, isFetch) {
        var self = this;
        setTimeout(function () {
            //table Fixed column code End
            var currentCalendarDate = self.calendar.fullCalendar('getDate');
            instructionalHours = data.getInstructionalHours((moment(currentCalendarDate).day()), moment(currentCalendarDate).format("YYYY-MM-DD"), locationId);
            var currentView = self.calendar.fullCalendar('getView');
            var studentDataSource = self.findDataSource(currentCalendarDate, currentView);
            var locationObj = self.getLocationObject(self.locationId);
            windowWidth = null;
            calendarWidth = null;
            computedWidth = null;
            if (currentView.name == 'resourceDay') {
                self.buildCalfirstCol();
                self.calendarFixedWidth();
                windowWidth = window.outerWidth;
                calendarWidth = wjQuery(".fc-view-resourceDay").width();
                computedWidth = windowWidth - wjQuery(".ta-pane").width();
                var parentCenterId = locationObj['_hub_parentcenter_value'];
                if (parentCenterId == undefined) {
                    parentCenterId = locationObj['hub_centerid'];
                }
                self.accountClosure = data.getAccountClosure(parentCenterId, (currentCalendarDate.getMonth() + 1), currentCalendarDate.getFullYear());
                startDate = endDate = moment(currentCalendarDate).format("YYYY-MM-DD");
                // staff program fetching
                var businessClosure1 = data.getBusinessClosure(locationId, startDate, endDate, locationObj['_hub_parentcenter_value']);
                self.businessClosure = businessClosure1 == null ? [] : businessClosure1;
                if (self.businessClosure == null) {
                    self.businessClosure = [];
                }
                var findingLeaveFlag = true;
                if (self.businessClosure.length) {
                    for (var i = 0; i < self.businessClosure.length; i++) {
                        var businessStartDate = self.businessClosure[i]['hub_startdatetime@OData.Community.Display.V1.FormattedValue'];
                        var businessEndDate = self.businessClosure[i]['hub_enddatetime@OData.Community.Display.V1.FormattedValue'];
                        // var businessStartDate = moment(self.businessClosure[i]['hub_startdatetime']).format("YYYY-MM-DD");
                        // var businessEndDate = moment(self.businessClosure[i]['hub_enddatetime']).format("YYYY-MM-DD");
                        businessStartDate = new Date(businessStartDate + ' ' + '00:00').getTime();
                        businessEndDate = new Date(businessEndDate + ' ' + '00:00').getTime();
                        var calendarStartDate = new Date(moment(startDate).format("MM-DD-YYYY") + ' ' + '00:00').getTime();
                        var calendarEndDate = new Date(moment(endDate).format("MM-DD-YYYY") + ' ' + '00:00').getTime();
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
                            if (self.programList[i].hub_name.length <= 25) {
                                msg += "<div style='margin:0 5px;display:inline-block;width:10px;height:10px;background:" + self.programList[i].hub_color + "'></div>" +
                                       "<span style='padding:5px;'>" + self.programList[i].hub_name + "</span><br/>";
                            } else {
                                msg += "<div style='margin:0 5px;display:inline-block;width:10px;height:10px;background:" + self.programList[i].hub_color + "'></div>" +
                                       "<span style='padding:5px;'>" + (self.programList[i].hub_name).substr(0, 25) + "<span class='showFulltext' title='" + (self.programList[i].hub_name) + "'>...</span>" + "</span><br/>";
                            }
                        }
                        //info tooltip size increments
                        //wjQuery('.info-icon').attr('title', msg);
                        wjQuery('.info-icon .custom_title').html(msg);
                        // wjQuery(".info-icon").tooltip({
                        //     open: function (event, ui) {
                        //         ui.tooltip.css({"max-width": "350px","font-size":"13px"});
                        //     }
                        // });
                        wjQuery(".info_custom").hover(function () {
                            wjQuery('.info_custom .custom_title').show('slow');
                        }, function () {
                            wjQuery('.info_custom .custom_title').hide();
                        });
                    }

                    self.staffExceptions = isFetch || (self.staffExceptions.length == 0) ? data.getStaffException(locationId, startDate, endDate, locationObj['_hub_parentcenter_value']) : self.staffExceptions;
                    if (self.staffExceptions == null) {
                        self.staffExceptions = [];
                    }
                    self.teacherSchedule = isFetch || (self.teacherSchedule.length == 0) ? data.getTeacherSchedule(locationId, startDate, endDate, locationObj['_hub_parentcenter_value']) : self.teacherSchedule;
                    if (self.teacherSchedule == null) {
                        self.teacherSchedule = [];
                    }
                    self.teacherAvailability = isFetch || (self.teacherAvailability.length == 0) ? data.getTeacherAvailability(locationId, startDate, endDate) : self.teacherAvailability;
                    if (self.teacherAvailability == null) {
                        self.teacherAvailability = [];
                    }

                    var beSaList =  data.getsaList(locationId, startDate, endDate);
                    if (beSaList == null) {
                        beSaList = [];
                    }

                    self.pinnedData = isFetch || (self.pinnedData.length == 0) ? data.getPinnedData(locationId, startDate, endDate, locationObj['_hub_parentcenter_value']) : self.pinnedData;
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
                        self.generateEventObject(self.masterScheduleStudents, "masterStudentSession");
                        self.populateTeacherEvent(self.generateEventObject(self.convertedPinnedList == null ? [] : self.convertedPinnedList, "masterTeacherSchedule"), true);
                    }
                    else {
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
                    self.populateSAPane(self.convertSAList(beSaList), self.calendarOptions.minTime, self.calendarOptions.maxTime);
                    self.showConflictMsg();
                    self.scrollToEvent();
                    // self.buildCalfirstCol();
                }
                else {
                    wjQuery('.loading').hide();
                    wjQuery('table.fc-agenda-slots td div').css('backgroundColor', '#ddd');
                    wjQuery(".sof-btn").removeClass('overflow-info');
                    wjQuery(".sof-btn").removeAttr('title');
                }
            }
            else if (self.calendar.fullCalendar('getView').name == 'agendaWeek') {
                self.eventList = [];
                self.weekEventObject = {};
                startDate = moment(currentView.start).format("YYYY-MM-DD");
                endDate = moment(moment(currentView.start).add(6, 'd')).format("YYYY-MM-DD");
                var businessClosure1 = data.getBusinessClosure(locationId, startDate, endDate, locationObj['_hub_parentcenter_value']);
                self.businessClosure = businessClosure1 == null ? [] : businessClosure1;
                if (self.businessClosure == null) {
                    self.businessClosure = [];
                }
                self.findLeaveDays();
                self.teacherSchedule = isFetch || (self.teacherSchedule.length == 0) ? data.getTeacherSchedule(locationId, startDate, endDate, locationObj['_hub_parentcenter_value']) : self.teacherSchedule;
                if (self.teacherSchedule == null) {
                    self.teacherSchedule = [];
                }
                self.generateFilterObject(self.filterObject);
                self.generateWeekEventObject(self.generateEventObject(self.teacherSchedule, "teacherSchedule"), 'teacherSchedule');
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
                else {
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

    /*
     *  Method will be called on initial rendar of calendar
     *  This method is responsible for finding renderded calendar date is leave day/not
     *   
     */ 
    this.findLeaveDays = function () {
        var self = this;
        self.leaveDays = [];
        var currentView = self.calendar.fullCalendar('getView');
        for (var j = currentView.start.getTime() ; j < currentView.end.getTime() ; j = j + (24 * 60 * 60 * 1000)) {
            for (var i = 0; i < self.businessClosure.length; i++) {
                var businessStartDate = self.businessClosure[i]['hub_startdatetime@OData.Community.Display.V1.FormattedValue'];
                var businessEndDate = self.businessClosure[i]['hub_enddatetime@OData.Community.Display.V1.FormattedValue'];
                // var businessStartDate = moment(self.businessClosure[i]['hub_startdatetime']).format("YYYY-MM-DD");
                // var businessEndDate = moment(self.businessClosure[i]['hub_enddatetime']).format("YYYY-MM-DD");
                businessStartDate = new Date(businessStartDate + ' ' + '00:00').getTime();
                businessEndDate = new Date(businessEndDate + ' ' + '00:00').getTime();
                if (j >= businessStartDate && j <= businessEndDate) {
                    self.leaveDays.push(new Date(j));
                }
            }
        }
    };

    /*
     *  Method will be called only wen user selects on week view button
     *  This method is responsible for rendering week view
     *   
     */ 
    this.weekView = function () {
        var self = this;
        var filterElement = undefined;
        wjQuery('.loading').show();
        if (self.calendar != undefined) {
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
                wjQuery('.fc-view-agendaWeek table tbody tr td').addClass('fc-state-highlight');
            }
            this.weekEventObject = {};
            this.calendar.fullCalendar('removeEvents');
            this.refreshCalendarEvent(this.locationId, true);
            //this.buildCalfirstCol();
        }
        else {
            wjQuery('.loading').hide();
        }
    }


     /*
     *  Method will be called only wen user selects on day view button as well as on page load
     *  This method is responsible for rendering day view
     *   
     */ 
    this.dayView = function () {
        var self = this;
        var filterElement = undefined;
        var self = this;
        self.eventList = [];
        wjQuery('.loading').show();
        if (self.calendar != undefined) {
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

                }, 800);
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
            var resources = data.getResources(this.locationId);
            var currentCalendarDate = wjQuery(".headerDate").text();
            currentCalendarDate = new Date(currentCalendarDate);
            var tempList = resources.filter(function (resource) {
                if (resource.hub_deactivating_start_date && resource.hub_deactivating_end_date &&
                    !(currentCalendarDate.getTime() >= new Date(moment(resource.hub_deactivating_start_date).format("MM-DD-YYYY")).getTime()
                    && currentCalendarDate.getTime() <= new Date(moment(resource.hub_deactivating_end_date).format("MM-DD-YYYY")).getTime())) {
                    return resource;
                } else if (!resource.hub_deactivating_end_date && resource.hub_deactivating_start_date
                    && !(currentCalendarDate.getTime() >= new Date(moment(resource.hub_deactivating_start_date).format("MM-DD-YYYY")).getTime())) {
                    return resource;
                } else if (!resource.hub_deactivating_start_date) {
                    return resource;
                }
            });
            resources = tempList;
            if (resources.length) {
                var pi = [];
                var gi = [];
                var gf = [];
                for (var i = 0; i < resources.length; i++) {
                    switch (resources[i]['adeliverytype_x002e_hub_code']) {
                        case personalInstruction:
                            pi.push(resources[i]);
                            break;
                        case groupFacilitation:
                            gf.push(resources[i]);
                            break;
                        case groupInstruction:
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
            this.populateResource(this.resourceList, true);
            this.refreshCalendarEvent(this.locationId, true);
        }
        else {
            wjQuery('.loading').hide();
        }
    }

    /*
     *  Method will be called only wen user clicks on sof pane button
     *  This method is responsible for sliding sof pane from left to right and vice versa
     *   
     */ 
    this.sofPane = function () {
        var self = this;
        self.attachMouseEvent();
        wjQuery('.bg').removeClass("bg");
        wjQuery('.stick').removeClass("stick");
        wjQuery('.sof-pane').show();
        if (taExpanded) {
            taExpanded = !taExpanded; // to change the slide
            taExpanded ? wjQuery('.ta-pane').addClass('open') : wjQuery('.ta-pane').removeClass('open');
            wjQuery('.ta-pane').css('opacity', '1');
            wjQuery('.ta-pane').animate(taExpanded ? { 'marginRight': '0px' } : { marginRight: '-260px' }, 500);
        }
        if (saExpanded) {
            saExpanded = !saExpanded; // to change the slide
            saExpanded ? wjQuery('.sa-pane').addClass('open') : wjQuery('.sa-pane').removeClass('open');
            wjQuery('.sa-pane').css('opacity', '1');
            wjQuery('.sa-pane').animate(saExpanded ? { 'marginRight': '0px' } : { marginRight: '-260px' }, 500);
        }
        sofExpanded = !sofExpanded;
        if (sofExpanded) {
            this.scrollTop = wjQuery("#scrollarea").scrollTop();
            wjQuery('.sof-pane').prop("scrollTop", this.scrollTop);
            wjQuery('.ta-pane').hide();
            wjQuery('.sa-pane').hide();
            wjQuery('.sof-pane').css('opacity', '1');
        }
        sofExpanded ? wjQuery('.sof-pane').addClass('open') : wjQuery('.sof-pane').removeClass('open');
        wjQuery('.sof-pane').animate(sofExpanded ? { 'marginRight': '0px' } : { marginRight: '-260px' }, 500);
        if (!sofExpanded) {
            setTimeout(function () {
                wjQuery('.sof-pane').hide();
            }, 600);
        }
        self.addMarginToSidePane();
    }

    /*
     *  Method will be called only wen user clicks on sa pane button
     *  This method is responsible for sliding sa pane from left to right and vice versa
     *   
     */
    this.saPane = function () {
        var self = this;
        self.attachMouseEvent();
        wjQuery('.bg').removeClass("bg");
        wjQuery('.stick').removeClass("stick");
        wjQuery('.sa-pane').show();
        if (taExpanded) {
            taExpanded = !taExpanded; // to change the slide
            taExpanded ? wjQuery('.ta-pane').addClass('open') : wjQuery('.ta-pane').removeClass('open');
            wjQuery('.ta-pane').css('opacity', '1');
            wjQuery('.ta-pane').animate(taExpanded ? { 'marginRight': '0px' } : { marginRight: '-260px' }, 500);
        }
        if (sofExpanded) {
            sofExpanded = !sofExpanded;
            sofExpanded ? wjQuery('.sof-pane').addClass('open') : wjQuery('.sof-pane').removeClass('open');
            wjQuery('.sof-pane').css('opacity', '1');
            wjQuery('.sof-pane').animate(sofExpanded ? { 'marginRight': '0px' } : { marginRight: '-260px' }, 500);
        }
        saExpanded = !saExpanded;
        if (saExpanded) {
            this.scrollTop = wjQuery("#scrollarea").scrollTop();
            wjQuery('.sa-pane').prop("scrollTop", this.scrollTop);
            wjQuery('.ta-pane').hide();
            wjQuery('.sof-pane').hide();
            wjQuery('.sa-pane').css('opacity', '1');
        }
        saExpanded ? wjQuery('.sa-pane').addClass('open') : wjQuery('.sa-pane').removeClass('open');
        wjQuery('.sa-pane').animate(saExpanded ? { 'marginRight': '0px' } : { marginRight: '-260px' }, 500);
        if (!saExpanded) {
            setTimeout(function () {
                wjQuery('.sa-pane').hide();
            }, 600);
        }
        self.addMarginToSidePane();
    }

    /*
     *  Method will be called only wen user clicks on ta pane button
     *  This method is responsible for sliding ta pane from left to right and vice versa
     *   
     */
    this.taPane = function () {
        var self = this;
        self.attachMouseEvent();
        wjQuery('.bg').removeClass("bg");
        wjQuery('.stick').removeClass("stick");
        wjQuery('.ta-pane').show();

        if (sofExpanded) {
            sofExpanded = !sofExpanded;
            sofExpanded ? wjQuery('.sof-pane').addClass('open') : wjQuery('.sof-pane').removeClass('open');
            wjQuery('.sof-pane').css('opacity', '1');
            wjQuery('.sof-pane').animate(sofExpanded ? { 'marginRight': '0px' } : { marginRight: '-260px' }, 500);
        }
        if (saExpanded) {
            saExpanded = !saExpanded; // to change the slide
            saExpanded ? wjQuery('.sa-pane').addClass('open') : wjQuery('.sa-pane').removeClass('open');
            wjQuery('.sa-pane').css('opacity', '1');
            wjQuery('.sa-pane').animate(saExpanded ? { 'marginRight': '0px' } : { marginRight: '-260px' }, 500);
        }
        taExpanded = !taExpanded;
        if (taExpanded) {
            this.scrollTop = wjQuery("#scrollarea").scrollTop();
            wjQuery('.ta-pane').css('opacity', '1');
            wjQuery('.sof-pane').hide();
            wjQuery('.sa-pane').hide();
        }
        taExpanded ? wjQuery('.ta-pane').addClass('open') : wjQuery('.ta-pane').removeClass('open');
        wjQuery('.ta-pane').animate(taExpanded ? { 'marginRight': '0px' } : { marginRight: '-260px' }, 500);
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
        self.addMarginToSidePane();
    }

    /*
     *  Method will be called only wen user clicks on filter pane
     *  This method is responsible for formating json sent from backend
     *   
     */
    this.generateFilterObject = function (args) {
        var self = this;
        args[0] == undefined ? filterObj = args : filterObj = args[0];
        self.filterObject = filterObj;
        wjQuery.each(filterObj, function (key, value) {
            self.filters[key] = [];
            wjQuery.each(value, function (ke, val) {
                if (key == "time") {
                    self.filters[key].push({ id: val.id, name: val.name, radio: true });
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
                            deliveryTypeId: val['aproductservice_x002e_hub_deliverytype'],
                            deliveryTypeCode: val['adeliverytype_x002e_hub_code'],
                            deliveryTypeCodeVal: val['adeliverytype_x002e_hub_code@OData.Community.Display.V1.FormattedValue'],
                            deliveryType: val['aproductservice_x002e_hub_deliverytype@OData.Community.Display.V1.FormattedValue'],
                            radio: false
                        });
                    }
                }
            });
        });
    }

    this.getEffectiveEndDate = function (val) {
        var self = this;
        var endDateArray = [];
        var deliveryTypeCode = val['adeliverytype_x002e_hub_code'];
        var timeSlotType = val['aproductservice_x002e_hub_timeslottype'];
        var instructionalHourEndDate = [];
        if (instructionalHours) {
                instructionalHourEndDate = instructionalHours.filter(function (insHour, key) {
                if (deliveryTypeCode == groupFacilitation) {
                    return (deliveryTypeCode == insHour['adeliverytype_x002e_hub_code'] && val['aproductservice_x002e_hub_namedgfhoursid'] == insHour['_hub_workhours_value'])
                } else {
                    return (deliveryTypeCode == insHour['adeliverytype_x002e_hub_code'] && timeSlotType == insHour['hub_timeslottype'])
                }
            });
        }
        wjQuery.each(instructionalHourEndDate, function (key,val) {
            if (val['hub_effectiveenddate@OData.Community.Display.V1.FormattedValue']) {
                endDateArray.push(moment(val['hub_effectiveenddate@OData.Community.Display.V1.FormattedValue']).format("MM-DD-YYYY"));
            }
        })
        var currentCalendarDate = self.calendar.fullCalendar('getDate');
        if (val['hub_effectiveenddate@OData.Community.Display.V1.FormattedValue']) {
            endDateArray.push(moment(val['hub_effectiveenddate@OData.Community.Display.V1.FormattedValue']).format("MM-DD-YYYY"));
        }
        if (val['aenrollment_x002e_hub_enrollmentenddate@OData.Community.Display.V1.FormattedValue']) {
            endDateArray.push(moment(val['aenrollment_x002e_hub_enrollmentenddate@OData.Community.Display.V1.FormattedValue']).format("MM-DD-YYYY"));
        }
        if (val['aenrollment_x002e_hub_committedsessionenddate@OData.Community.Display.V1.FormattedValue']) {
            endDateArray.push(moment(val['aenrollment_x002e_hub_committedsessionenddate@OData.Community.Display.V1.FormattedValue']).format("MM-DD-YYYY"));
        }
        endDateArray.push(currentCalendarDate);
        var leastEndDate = endDateArray.sort(function (a, b) { return new Date(a) - new Date(b); })[0];
        return new Date(leastEndDate);
    }

    /*
     *  Method will be called on page load
     *  This method is responsible for formating all json sent from backend
     *   
     */
    this.generateEventObject = function (args, label) {
        var self = this;
        var currentView = self.calendar.fullCalendar('getView');
        var eventObjList = [];
        if (label == "masterTeacherSchedule") {
            var currentCalendarDate = self.calendar.fullCalendar('getDate');
            wjQuery.each(args, function (ke, val) {
                if (val['resourceId'] != undefined && val['teacherId'] != undefined && val['dayId'] == self.getDayValue(currentCalendarDate)) {
                    var sDate, eDate, startHour, teacherAvailableFlag = true;
                    // for (var i = 0; i < self.teacherAvailability.length; i++) {
                    //     if(self.teacherAvailability[i]['_hub_staffid_value'] == val['teacherId']){
                    //         if(self.teacherAvailability[i]['hub_enddate'] != undefined){
                    //             if(moment(moment(currentCalendarDate).format('YYYY-MM-DD')).isSameOrBefore(moment(self.teacherAvailability[i]['hub_enddate']).format('YYYY-MM-DD'))){
                    //                 teacherAvailableFlag = true;
                    //             }
                    //             else{
                    //                 teacherAvailableFlag = false;
                    //             }
                    //         }
                    //         else{
                    //             teacherAvailableFlag = true;
                    //         }
                    //     }
                    // }
                    var resourceObj = self.getResourceObj(val['resourceId']);
                    if (!resourceObj) {
                        teacherAvailableFlag = false;
                    }
                    if (teacherAvailableFlag) {
                        if (val['startTime'] != undefined && val['endTime'] != undefined) {
                            sDate = new Date(moment(currentCalendarDate).format('MM-DD-YYYY') + " " + val['startTime']);
                            eDate = new Date(moment(currentCalendarDate).format('MM-DD-YYYY') + " " + val['endTime']);
                            startHour = new Date(moment(currentCalendarDate).format('MM-DD-YYYY') + " " + val['startTime']);
                            var teacher = {
                                id: val['teacherId'],
                                name: val["teacherName"],
                                start: sDate,
                                end: eDate,
                                locationId: val['astaff_x002e_hub_center'],
                                locationName: val['astaff_x002e_hub_center@OData.Community.Display.V1.FormattedValue'],
                                centerId: val['centerId'],
                                centerName: val['centerName'],
                                startHour: startHour,
                                resourceId: val['resourceId'],
                                scheduleType: val['hub_schedule_type'],
                                locationId: self.locationId,
                                pinId: val['id'],
                                isFromMasterSchedule: true
                            };
                            var index = -1;
                            // for (var i = 0; i < self.staffExceptions.length; i++) {
                            //     if(self.staffExceptions['astaff_x002e_hub_staffid'] == teacher.id){
                            //         index = i;
                            //         break;
                            //     }
                            // }
                            if (index == -1) {
                                eventObjList.push(teacher);
                            }
                        }
                    }
                }
            });
            if (self.convertedTeacherObj.length != 0) {
                self.convertedTeacherObj = self.convertedTeacherObj.concat(eventObjList);
            }
            else {
                self.convertedTeacherObj = eventObjList;
            }
        }
        else if (label == "teacherSchedule") {
            wjQuery.each(args, function (ke, val) {
                var sDate, eDate, startHour, currentCalendarDate;
                var currentView = self.calendar.fullCalendar('getView');
                if (val['hub_date@OData.Community.Display.V1.FormattedValue'] != undefined &&
                  val['hub_start_time@OData.Community.Display.V1.FormattedValue'] != undefined) {
                    sDate = new Date(val['hub_date@OData.Community.Display.V1.FormattedValue'] + " " + val['hub_start_time@OData.Community.Display.V1.FormattedValue']);
                    eDate = new Date(val['hub_date@OData.Community.Display.V1.FormattedValue'] + " " + val['hub_end_time@OData.Community.Display.V1.FormattedValue']);
                    startHour = new Date(val['hub_date@OData.Community.Display.V1.FormattedValue'] + " " + val['hub_start_time@OData.Community.Display.V1.FormattedValue']);
                    currentCalendarDate = startHour;
                    if (val['_hub_resourceid_value'] == undefined) {
                        // Terminate loop if resource is not there for staff
                        return true;
                    }
                }
                else {
                    currentCalendarDate = self.calendar.fullCalendar('getDate');
                    // Terminate loop if time is not there for staff
                    return true;
                }
                if (val['_hub_resourceid_value']) {
                    var resourceObj = self.getResourceObj(val['resourceId']);
                    if (!resourceObj) {
                        // if Deactivated Resource Found terminate the loop
                        return true;
                    }
                }
                var teacher = {
                    id: val['_hub_staff_value'],
                    name: val["_hub_staff_value@OData.Community.Display.V1.FormattedValue"],
                    start: currentCalendarDate,
                    end: eDate,
                    startHour: currentCalendarDate,
                    resourceId: val['_hub_resourceid_value'],
                    deliveryTypeId: val['aproductservice_x002e_hub_deliverytype'],
                    deliveryType: val['aproductservice_x002e_hub_deliverytype@OData.Community.Display.V1.FormattedValue'],
                    locationId: val['astaff_x002e_hub_center'],
                    locationName: val['astaff_x002e_hub_center@OData.Community.Display.V1.FormattedValue'],
                    centerId: val['_hub_centerid_value'],
                    centerName: val['_hub_centerid_value@OData.Community.Display.V1.FormattedValue'],
                    subjectId: val['subjectId'],
                    scheduleId: val['hub_staff_scheduleid'],
                    serviceId: val['_hub_product_service_value'],
                    scheduleType: val['hub_schedule_type']
                };
                if (self.convertedPinnedList.length && teacher.scheduleType != FLOAT_TEACHER_TYPE) {
                    var isPinned = self.convertedPinnedList.filter(function (obj) {
                        return (obj.startTime != undefined && obj.resourceId != undefined &&
                                    obj.teacherId == teacher.id &&
                                    obj.resourceId == teacher.resourceId &&
                                    obj.startTime == moment(sDate).format("h:mm A") &&
                                    obj.dayId == self.getDayValue(currentCalendarDate))
                    });
                    if (isPinned[0] != undefined) {
                        teacher.pinId = isPinned[0].id;
                    }
                }
                var index = -1;
                // if(self.staffExceptions.length){
                //     for(var k=0; k< self.staffExceptions.length ; k++){
                //         if(teacher.id == self.staffExceptions[k]['astaff_x002e_hub_staffid']){
                //             var exceptionStartDate = new Date(self.staffExceptions[k]['hub_startdate@OData.Community.Display.V1.FormattedValue']);
                //             // Set time for start date
                //             exceptionStartDate = new Date(exceptionStartDate).setHours(0);
                //             exceptionStartDate = new Date(new Date(exceptionStartDate).setMinutes(0));

                //             var exceptionEndDate = self.staffExceptions[k]['hub_enddate'];
                //             exceptionEndDate = exceptionEndDate == undefined ? exceptionStartDate : new Date(exceptionEndDate);
                //             // Set time for end date
                //             exceptionEndDate = new Date(exceptionEndDate).setHours(23);
                //             exceptionEndDate = new Date(new Date(exceptionEndDate).setMinutes(59));
                //             if(currentCalendarDate != undefined){
                //                 if(currentCalendarDate.getTime() >= exceptionStartDate.getTime() && currentCalendarDate.getTime() <= exceptionEndDate.getTime()){
                //                     if(self.staffExceptions[k]['hub_entireday']){
                //                         index = 1;
                //                         break;
                //                     }
                //                     else{
                //                         exceptionStartHour = self.staffExceptions[k]['hub_starttime'] / 60;
                //                         exceptionEndHour = self.staffExceptions[k]['hub_endtime'] / 60;
                //                         if(moment(currentCalendarDate).format('h') >= exceptionStartHour && moment(currentCalendarDate).format('h') < exceptionEndHour){
                //                             index = 1;
                //                             break;
                //                         }
                //                     }

                //                 }
                //             }
                //         }
                //     }
                // }
                if (index == -1) {
                    eventObjList.push(teacher);
                }
            });
            self.convertedTeacherObj = eventObjList;
        }
        else if (label == "studentSession") {
            wjQuery.each(args, function (ke, val) {
                var sDate = new Date(val['hub_session_date@OData.Community.Display.V1.FormattedValue'] + " " + val['hub_start_time@OData.Community.Display.V1.FormattedValue']);
                var eDate = new Date(val['hub_session_date@OData.Community.Display.V1.FormattedValue'] + " " + val['hub_end_time@OData.Community.Display.V1.FormattedValue']);
                var startHour = new Date(val['hub_session_date@OData.Community.Display.V1.FormattedValue'] + " " + val['hub_start_time@OData.Community.Display.V1.FormattedValue']);
                var allowStudentFlag = false;
                var currentView = self.calendar.fullCalendar('getView');
                var effStartDate = sDate;
                effStartDate = new Date(effStartDate).setHours(00);
                effStartDate = new Date(new Date(effStartDate).setMinutes(00));
                // Effective end date logic
                var effEndDate = self.getEffectiveEndDate(val);
                effEndDate = new Date(effEndDate).setHours(23);
                effEndDate = new Date(new Date(effEndDate).setMinutes(59));
                if (effStartDate.getTime() <= currentView.end.getTime() &&
                    effEndDate.getTime() >= currentView.start.getTime()) {
                    allowStudentFlag = true;
                }
                if (allowStudentFlag || val['hub_isattended']) {
                    if (!val['aprogram_x002e_hub_color']) {
                        val['aprogram_x002e_hub_color'] = "#000";
                    }
                    var obj = {
                        studUniqueId: self.generateUniqueId(),
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
                        deliveryTypeCode: val['adeliverytype_x002e_hub_code'],
                        deliveryTypeCodeVal: val['adeliverytype_x002e_hub_code@OData.Community.Display.V1.FormattedValue'],
                        locationId: val['_hub_center_value'],
                        locationName: val['_hub_center_value@OData.Community.Display.V1.FormattedValue'],
                        enrollmentId: val['_hub_enrollment_value'],
                        subject: val['aprogram_x002e_hub_areaofinterest@OData.Community.Display.V1.FormattedValue'],
                        subjectId: val['aprogram_x002e_hub_areaofinterest'],
                        subjectGradient: val['aprogram_x002e_hub_color'],
                        is1to1: val["hub_is_1to1"],
                        programId: val['aprogram_x002e_hub_programid'],
                        serviceId: val['_hub_service_value'],
                        serviceValue: val['_hub_service_value@OData.Community.Display.V1.FormattedValue'],
                        sessionId: val['hub_studentsessionid'],
                        sessiontype: val['hub_sessiontype'],
                        sessionStatus: val['hub_session_status'],
                        duration: val['aproductservice_x002e_hub_duration'],
                        timeSlotType: val['aproductservice_x002e_hub_timeslottype'],
                        makeupExpiryDate: val['hub_makeup_expiry_date@OData.Community.Display.V1.FormattedValue'],
                        isAttended: val['hub_isattended'],
                        enrolStartDate: val['aenrollment_x002e_hub_enrollmentstartdate@OData.Community.Display.V1.FormattedValue'],
                        enrolEndDate: val['aenrollment_x002e_hub_enrollmentenddate@OData.Community.Display.V1.FormattedValue'],
                        namedHoursId: val['aproductservice_x002e_hub_namedgfhoursid']
                    }
                    if (obj.subjectGradient && obj.subjectGradient.split(",")[1]) {
                        obj.subjectColorCode = obj.subjectGradient.split(",")[1].replace(");", '');
                    } else {
                        obj.subjectColorCode = val['aprogram_x002e_hub_color'];
                    }
                    if (val['_hub_student_session_value']) {
                        obj.studentSession = val['_hub_student_session_value'];
                    }

                    if (val['_hub_master_schedule_value']) {
                        obj.masterScheduleId = val['_hub_master_schedule_value'];
                    }
                    if (val['hub_sourceapplicationid']) {
                        obj.sourceAppId = val['hub_sourceapplicationid'];
                    }
                    if (val.hasOwnProperty('aenrollment_x002e_hub_nonpreferredteacher')) {
                        obj['nonPreferredTeacher'] = val['aenrollment_x002e_hub_nonpreferredteacher'];
                    }
                    if (val['aproductservice_x002e_hub_namedgfhoursid']) {
                        obj.namedGfid = val['aproductservice_x002e_hub_namedgfhoursid'];
                    }
                    if (val.hasOwnProperty('_hub_resourceid_value')) {
                        obj.resourceId = val['_hub_resourceid_value'];
                        //
                        // Below Condition to put pinIcon only for PI DT student. 
                        if (self.convertedPinnedList.length) {
                            var isPinned = self.convertedPinnedList.filter(function (x) {
                                return (x.studentId == obj.id &&
                                        // x.resourceId == obj.resourceId &&
                                        x.dayId == self.getDayValue(startHour) &&
                                        x.startTime == moment(startHour).format("h:mm A") &&
                                        (obj.sessionStatus == SCHEDULE_STATUS))

                            });
                            if (isPinned[0] != undefined && isPinned[0].resourceId != undefined) {
                                if (isPinned[0].resourceId == obj.resourceId) {
                                    obj.pinId = isPinned[0].id;
                                }
                            }
                        }

                        var index = -1;
                        for (var i = 0; i < eventObjList.length; i++) {
                            // if (eventObjList[i].id == obj.id &&
                            //     eventObjList[i].resourceId == obj.resourceId &&
                            //     eventObjList[i].start.getTime() == obj.start.getTime()) {
                            //     index = i;
                            //     break;
                            // }
                            if (obj.studUniqueId == eventObjList[i].studUniqueId) {
                                index = i;
                                break;
                            }
                        }
                        if (index == -1) {
                            eventObjList.push(obj);
                        }
                    } else if (obj.sessionStatus != INVALID_STATUS &&
                                obj.sessionStatus != OMIT_STATUS) {
                        self.pushStudentToSOF(obj);
                    }
                }                
            });
            setTimeout(function () {
                if (Object.keys(self.sofList).length) {
                    if (self.sofList['Personal Instruction'].length > 0 || self.sofList['Group Instruction'].length > 0 || self.sofList['Group Facilitation'].length > 0) {
                        self.populateSOFPane(self.sofList, self.calendarOptions.minTime, self.calendarOptions.maxTime);
                        var currentView = self.calendar.fullCalendar('getView');
                        if (currentView.name != "agendaWeek") {
                            self.openSofPane();
                        }
                    }
                }
            }, 800);
            self.convertedStudentObj = eventObjList;
        }
        else if (label == "masterStudentSession") {
            var pinnedList = [];
            var affinityList = [];
            var noResourceList = [];
            var currentCalendarDate = self.calendar.fullCalendar('getDate');
            var currentView = self.calendar.fullCalendar('getView');
            var serviceGF = {};
            var serviceGI = {};
            wjQuery.each(args, function (ke, val) {
                var effStartDate = new Date(val['hub_effectivestartdate@OData.Community.Display.V1.FormattedValue']);
                effStartDate = new Date(effStartDate).setHours(00);
                effStartDate = new Date(new Date(effStartDate).setMinutes(00));
                var allowStudentFlag = false;
                if (currentView.name == 'resourceDay') {
                    // Effective end date logic
                    effEndDate = self.getEffectiveEndDate(val);
                    effEndDate = new Date(effEndDate).setHours(23);
                    effEndDate = new Date(new Date(effEndDate).setMinutes(59));
                    if (currentCalendarDate.getTime() >= effStartDate.getTime() &&
                       currentCalendarDate.getTime() <= effEndDate.getTime()) {
                        allowStudentFlag = true;
                    }
                    var timeSplit = self.convertMinsNumToTime(val['hub_starttime']);
                    var startHour
                    if (timeSplit) {
                        timeSplit = timeSplit.split(":")
                        var startHour = new Date(currentCalendarDate.setHours(timeSplit[0]));
                        startHour = new Date(currentCalendarDate.setMinutes(timeSplit[1]));
                    }
                    
                    obj = {}
                    obj.deliveryTypeCode = val['adeliverytype_x002e_hub_code'];
                    if (val['aproductservice_x002e_hub_namedgfhoursid']) {
                        obj.namedGfid = val['aproductservice_x002e_hub_namedgfhoursid'];
                    }
                    obj.timeSlotType = val['aproductservice_x002e_hub_timeslottype'];
                    obj.duration = val['aproductservice_x002e_hub_duration'];
                   var instructionalHourValidity = self.checkInstructionalHours(obj, startHour);
                }
                else if (currentView.name == 'agendaWeek') {
                    // Effective end date logic
                    effEndDate = self.getEffectiveEndDate(val);
                    effEndDate = new Date(effEndDate).setHours(23);
                    effEndDate = new Date(new Date(effEndDate).setMinutes(59));
                    if (effStartDate.getTime() <= currentView.end.getTime() &&
                       effEndDate.getTime() >= currentView.start.getTime()) {
                        allowStudentFlag = true;
                    }
                }
                if (allowStudentFlag && instructionalHourValidity) {
                    if (!val['aprogram_x002e_hub_color']) {
                        val['aprogram_x002e_hub_color'] = "#000";
                    }
                    var obj = {
                        studUniqueId:self.generateUniqueId(),
                        id: val['aenrollment_x002e_hub_student'],
                        name: val["aenrollment_x002e_hub_student@OData.Community.Display.V1.FormattedValue"],
                        gradeId: val['astudent_x002e_hub_grade'],
                        grade: val['astudent_x002e_hub_grade@OData.Community.Display.V1.FormattedValue'],
                        deliveryTypeId: val['aproductservice_x002e_hub_deliverytype'],
                        deliveryType: val['aproductservice_x002e_hub_deliverytype@OData.Community.Display.V1.FormattedValue'],
                        deliveryTypeCode: val['adeliverytype_x002e_hub_code'],
                        deliveryTypeCodeVal: val['adeliverytype_x002e_hub_code@OData.Community.Display.V1.FormattedValue'],
                        locationId: val['aenrollment_x002e_hub_location'],
                        locationName: val['aenrollment_x002e_hub_location@OData.Community.Display.V1.FormattedValue'],
                        subject: val['aprogram_x002e_hub_areaofinterest@OData.Community.Display.V1.FormattedValue'],
                        subjectId: val['aprogram_x002e_hub_areaofinterest'],
                        subjectGradient: val['aprogram_x002e_hub_color'],
                        programId: val['aprogram_x002e_hub_programid'],
                        serviceId: val['aenrollment_x002e_hub_service'],
                        serviceValue: val['aenrollment_x002e_hub_service@OData.Community.Display.V1.FormattedValue'],
                        enrollmentId: val['aenrollment_x002e_hub_enrollmentid'],
                        duration : val['aproductservice_x002e_hub_duration'],
                        isFromMasterSchedule: true,
                        sessiontype:1,
                        is1to1: false,
                        timeSlotType: val['aproductservice_x002e_hub_timeslottype'],
                        namedHoursId: val['aproductservice_x002e_hub_namedgfhoursid']
                    }
                    if (obj.subjectGradient && obj.subjectGradient.split(",")[1]) {
                        obj.subjectColorCode = obj.subjectGradient.split(",")[1].replace(");", '');
                    } else {
                        obj.subjectColorCode = obj.subjectGradient;
                    }
                    var sDate = currentCalendarDate;
                    if (currentView.name == 'agendaWeek') {
                        val['hub_days'] = val['hub_days'] == 7 ? 0 : val['hub_days'];
                        sDate = currentView.start;
                        sDate = new Date(new Date(sDate).setDate(sDate.getDate() + val['hub_days']))
                    }
                    if (val['hub_timingsid']) {
                        obj.masterScheduleId = val['hub_timingsid'];
                    }
                    if (val['_hub_student_session_value']) {
                        obj.studentSession = val['_hub_student_session_value'];
                    }
                    if (val['_hub_master_schedule_value']) {
                        obj.masterScheduleId = val['_hub_master_schedule_value'];
                    }
                    if (val['hub_sourceapplicationid']) {
                        obj.sourceAppId = val['hub_sourceapplicationid'];
                    }
                    obj['sessionDate'] = moment(sDate).format('YYYY-MM-DD');

                    if (val.hasOwnProperty('aenrollment_x002e_hub_nonpreferredteacher')) {
                        obj['nonPreferredTeacher'] = val['aenrollment_x002e_hub_nonpreferredteacher'];
                    }

                    var pinnedStudent = self.convertedPinnedList.filter(function (x) {
                        return x.studentId == obj.id &&
                               x.enrollmentId == obj.enrollmentId &&
                               x.startTime == val['hub_starttime@OData.Community.Display.V1.FormattedValue'] &&
                               x.dayId == self.getDayValue(sDate);
                    });

                    if (obj.deliveryTypeCode == personalInstruction) {
                        var priceList = self.enrollmentPriceList.filter(function (x) {
                            return x['aenrollment_x002e_hub_enrollmentid'] == obj.enrollmentId;
                        });
                        if (priceList[0] != undefined) {
                            if (priceList[0]['apricelist_x002e_hub_ratio@OData.Community.Display.V1.FormattedValue'] == '1:1') {
                                obj.is1to1 = true;
                            }
                        }
                    }

                    for (var i = 0; i < pinnedStudent.length; i++) {
                        if (pinnedStudent[i] != undefined) {
                            var newObj = wjQuery.extend(true, {}, obj);
                            newObj.pinId = undefined;
                            newObj.enrollmentId = pinnedStudent[i].enrollmentId;
                            newObj.start = new Date(moment(sDate).format('MM-DD-YYYY') + " " + pinnedStudent[i].startTime);
                            newObj.end = new Date(moment(sDate).format('MM-DD-YYYY') + " " + pinnedStudent[i].endTime);
                            var startHour = new Date(moment(sDate).format('MM-DD-YYYY') + " " + pinnedStudent[i].startTime);
                            var studentStart = new Date(moment(sDate).format('MM-DD-YYYY') + " " + val['hub_starttime@OData.Community.Display.V1.FormattedValue']);
                            newObj.startHour = startHour;
                            if (studentStart.getTime() == newObj.start.getTime()) {
                                if (pinnedStudent[i].hasOwnProperty('resourceId')) {
                                    var resourceObj = self.getResourceObj(pinnedStudent[i].hasOwnProperty('resourceId'));
                                    if (!resourceObj) {
                                        var xindex = -1;
                                        noResourceList.forEach(function (noresource, key) {
                                            if (noresource.id == newObj.id &&
                                            noresource.enrollmentId == newObj.enrollmentId &&
                                            noresource.startHour.getTime() == startHour.getTime()) {
                                                xindex = key;
                                            }
                                        });
                                        if (xindex == -1) {
                                            noResourceList.push(newObj);
                                        }
                                    } else {
                                        newObj.resourceId = pinnedStudent[i].resourceId;
                                        var zindex = -1;
                                        for (var z = 0; z < pinnedList.length; z++) {
                                            if (pinnedList[z].id == newObj.id &&
                                                pinnedList[z].enrollmentId == obj.enrollmentId &&
                                                pinnedList[z].startHour.getTime() == startHour.getTime()) {
                                                zindex = z;
                                                break;
                                            }
                                        }
                                        if (zindex == -1) {
                                            newObj.pinId = pinnedStudent[i].id;
                                            pinnedList.push(newObj);
                                        }
                                    }
                                }
                                else if (pinnedStudent[i].hasOwnProperty('affinityResourceId') && obj.deliveryTypeCode == personalInstruction) {
                                    newObj.resourceId = pinnedStudent[i].affinityResourceId;
                                    var resourceObj = self.getResourceObj(newObj.resourceId);
                                    if (!resourceObj) {
                                        var xindex = -1;
                                        noResourceList.forEach(function (noresource, key) {
                                            if (noresource.id == newObj.id &&
                                            noresource.enrollmentId == newObj.enrollmentId &&
                                            noresource.startHour.getTime() == startHour.getTime()) {
                                                xindex = key;
                                            }
                                        });
                                        if (xindex == -1) {
                                            noResourceList.push(newObj);
                                        }
                                    } else {
                                        var xindex = -1;
                                        for (var x = 0; x < affinityList.length; x++) {
                                            if (affinityList[x].id == newObj.id &&
                                                affinityList[x].enrollmentId == newObj.enrollmentId &&
                                                affinityList[x].startHour.getTime() == startHour.getTime()) {
                                                xindex = x;
                                                break;
                                            }
                                        }
                                        if (xindex == -1) {
                                            affinityList.push(newObj);
                                        }
                                    }
                                } else {
                                    var xindex = -1;
                                    noResourceList.forEach(function (noresource, key) {
                                        if (noresource.id == newObj.id &&
                                        noresource.enrollmentId == newObj.enrollmentId &&
                                        noresource.startHour.getTime() == startHour.getTime()) {
                                            xindex = key;
                                        }
                                    });
                                    if (xindex == -1) {
                                        noResourceList.push(newObj);
                                    }
                                }
                            } else {
                                newObj.start = new Date(moment(sDate).format('MM-DD-YYYY') + " " + val['hub_starttime@OData.Community.Display.V1.FormattedValue']);
                                newObj.end = new Date(moment(sDate).format('MM-DD-YYYY') + " " + val['hub_endtime@OData.Community.Display.V1.FormattedValue']);
                                var startHour = new Date(moment(sDate).format('MM-DD-YYYY') + " " + val['hub_starttime@OData.Community.Display.V1.FormattedValue']);
                                newObj.startHour = startHour;

                                var findex = -1;
                                for (var f = 0; f < noResourceList.length; f++) {
                                    if (noResourceList[f].id == newObj.id &&
                                        noResourceList[f].enrollmentId == newObj.enrollmentId &&
                                        noResourceList[f].startHour.getTime() == startHour.getTime()) {
                                        findex = f;
                                        break;
                                    }
                                }
                                if (findex == -1) {
                                    noResourceList.push(newObj);
                                }
                            }
                            obj.start = newObj.start;
                            obj.end = newObj.end;
                            obj.startHour = newObj.startHour;
                        }
                    }
                    if (pinnedStudent.length == 0) {
                        obj.start = new Date(moment(sDate).format('MM-DD-YYYY') + " " + val['hub_starttime@OData.Community.Display.V1.FormattedValue']);
                        obj.end = new Date(moment(sDate).format('MM-DD-YYYY') + " " + val['hub_endtime@OData.Community.Display.V1.FormattedValue']);
                        var startHour = new Date(moment(sDate).format('MM-DD-YYYY') + " " + val['hub_starttime@OData.Community.Display.V1.FormattedValue']);
                        obj.startHour = startHour;
                        var index = -1;
                        for (var i = 0; i < noResourceList.length; i++) {
                            if (noResourceList[i].id == obj.id &&
                                noResourceList[i].enrollmentId == obj.enrollmentId &&
                                noResourceList[i].startHour.getTime() == startHour.getTime()) {
                                index = i;
                                break;
                            }
                        }
                        if (index == -1) {
                            noResourceList.push(obj);
                        }
                    }

                    if (obj.deliveryTypeCode != personalInstruction) {
                        if (val.hasOwnProperty('aproductservice_x002e_hub_resource')) {
                            obj.resourceId = val['aproductservice_x002e_hub_resource'];
                            var index = -1;
                            for (var i = 0; i < self.convertedStudentObj.length; i++) {
                                if (self.convertedStudentObj[i].id == obj.id &&
                                    self.convertedStudentObj[i].enrollmentId == obj.enrollmentId &&
                                    self.convertedStudentObj[i].startHour.getTime() == startHour.getTime()) {
                                    index = i;
                                    break;
                                }
                            }
                            if (index == -1) {
                                if (currentView.name == 'resourceDay') {
                                    self.populateStudentEvent([obj], true, true);
                                }
                                else {
                                    self.generateWeekEventObject([obj], 'studentSession');
                                }
                                var index = -1;
                                for (var i = 0; i < self.convertedStudentObj.length; i++) {
                                    if (self.convertedStudentObj[i].id == obj.id &&
                                        self.convertedStudentObj[i].enrollmentId == obj.enrollmentId &&
                                        self.convertedStudentObj[i].startHour.getTime() == obj.startHour.getTime()) {
                                        index = i;
                                        break;
                                    }
                                }
                                if (index == -1) {
                                    self.convertedStudentObj.push(obj);
                                }
                            }
                        }
                        else {
                            if (obj.deliveryTypeCode == groupInstruction) {
                                if (serviceGI.hasOwnProperty(obj.serviceId + obj.startHour)) {
                                    var index = -1;
                                    for (var i = 0; i < serviceGI[obj.serviceId + obj.startHour].length; i++) {
                                        if (serviceGI[obj.serviceId + obj.startHour][i].id == obj.id &&
                                            serviceGI[obj.serviceId + obj.startHour][i].startHour.getTime() == obj.startHour.getTime()) {
                                            index = i;
                                            break;
                                        }
                                    }
                                    if (index == -1) {
                                        serviceGI[obj.serviceId + obj.startHour].push(obj);
                                    }
                                }
                                else {
                                    serviceGI[obj.serviceId + obj.startHour] = [];
                                    serviceGI[obj.serviceId + obj.startHour].push(obj);
                                }
                            }
                            else if (obj.deliveryTypeCode == groupFacilitation) {
                                if (serviceGF.hasOwnProperty(obj.serviceId + obj.startHour)) {
                                    var index = -1;
                                    for (var i = 0; i < serviceGF[obj.serviceId + obj.startHour].length; i++) {
                                        if (serviceGF[obj.serviceId + obj.startHour][i].id == obj.id &&
                                               serviceGF[obj.serviceId + obj.startHour][i].startHour.getTime() == obj.startHour.getTime()) {
                                            index = i;
                                            break;
                                        }
                                    }
                                    if (index == -1) {
                                        serviceGF[obj.serviceId + obj.startHour].push(obj);
                                    }
                                }
                                else {
                                    serviceGF[obj.serviceId + obj.startHour] = [];
                                    serviceGF[obj.serviceId + obj.startHour].push(obj);
                                }
                            }
                        }
                    }
                }
            });

            //out of loop
            if (pinnedList.length) {
                var uniquePinnedList = [];
                for (var i = 0; i < pinnedList.length; i++) {
                    var index = -1;
                    for (var j = 0; j < self.convertedStudentObj.length; j++) {
                        if (self.convertedStudentObj[j].id == pinnedList[i].id &&
                            self.convertedStudentObj[j].enrollmentId == pinnedList[i].enrollmentId &&
                            self.convertedStudentObj[j].startHour.getTime() == pinnedList[i].startHour.getTime()) {
                            index = j;
                            break;
                        }
                    }
                    if (index == -1) {
                        self.convertedStudentObj.push(pinnedList[i]);
                        uniquePinnedList.push(pinnedList[i]);
                    }
                }
                pinnedList = uniquePinnedList;
                if (currentView.name == 'resourceDay') {
                    self.populateStudentEvent(pinnedList, true, true);
                }
                else {
                    self.generateWeekEventObject(pinnedList, 'studentSession');
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
                    var currentView = self.calendar.fullCalendar('getView');
                    if (currentView.name != "agendaWeek") {
                        self.openSofPane();
                    }
                }
            }, 800);
        }
        else if (label == "teacherAvailability") {
            var currentCalendarDate = this.calendar.fullCalendar('getDate');
            var currentView = new Date(currentCalendarDate).setHours(0);
            currentView = new Date(new Date(currentCalendarDate).setMinutes(0));
            currentView = new Date(new Date(currentCalendarDate).setSeconds(0));
            for (var i = 0; i < args.length; i++) {
                var exceptionTimeArray = [];
                var index = -1;
                if (self.staffExceptions.length) {
                    for (var k = 0; k < self.staffExceptions.length ; k++) {
                        if (args[i]['_hub_staffid_value'] == self.staffExceptions[k]['astaff_x002e_hub_staffid']) {
                            var exceptionStartDate = new Date(self.staffExceptions[k]['hub_startdate@OData.Community.Display.V1.FormattedValue']);
                            // Set time for start date
                            exceptionStartDate = new Date(exceptionStartDate).setHours(0);
                            exceptionStartDate = new Date(new Date(exceptionStartDate).setMinutes(0));

                            var exceptionEndDate = self.staffExceptions[k]['hub_enddate'];
                            exceptionEndDate = exceptionEndDate == undefined ? exceptionStartDate : new Date(exceptionEndDate);
                            // Set time for end date
                            exceptionEndDate = new Date(exceptionEndDate).setHours(23);
                            exceptionEndDate = new Date(new Date(exceptionEndDate).setMinutes(59));
                            if (currentView.getTime() >= exceptionStartDate.getTime() && currentView.getTime() <= exceptionEndDate.getTime()) {
                                if (self.staffExceptions[k]['hub_entireday']) {
                                    index = 1;
                                    break;
                                }
                                else {
                                    var tempObj = {};
                                    tempObj.exceptionStartHour = self.staffExceptions[k]['hub_starttime'];
                                    tempObj.exceptionEndHour = self.staffExceptions[k]['hub_endtime'];
                                    exceptionTimeArray.push(tempObj);
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
                        //sorted the exceptions in ascending order of start time
                        exceptionTimeArray = exceptionTimeArray.sort(function (a, b) {
                            return a.exceptionStartHour - b.exceptionStartHour;
                        });
                        switch (moment(currentCalendarDate).format('dddd').toLowerCase()) {
                            case 'monday':
                                obj.startTime = args[i]['hub_monstarttime@OData.Community.Display.V1.FormattedValue'];
                                obj.endTime = args[i]['hub_monendtime@OData.Community.Display.V1.FormattedValue'];
                                break;
                            case 'tuesday':
                                obj.startTime = args[i]['hub_tuestarttime@OData.Community.Display.V1.FormattedValue'];
                                obj.endTime = args[i]['hub_tueendtime@OData.Community.Display.V1.FormattedValue'];
                                break;
                            case 'wednesday':
                                obj.startTime = args[i]['hub_wedstarttime@OData.Community.Display.V1.FormattedValue'];
                                obj.endTime = args[i]['hub_wedendtime@OData.Community.Display.V1.FormattedValue'];
                                break;
                            case 'thursday':
                                obj.startTime = args[i]['hub_thurstarttime@OData.Community.Display.V1.FormattedValue'];
                                obj.endTime = args[i]['hub_thurendtime@OData.Community.Display.V1.FormattedValue'];
                                break;
                            case 'friday':
                                obj.startTime = args[i]['hub_fristarttime@OData.Community.Display.V1.FormattedValue'];
                                obj.endTime = args[i]['hub_friendtime@OData.Community.Display.V1.FormattedValue'];
                                break;
                            case 'saturday':
                                obj.startTime = args[i]['hub_satstarttime@OData.Community.Display.V1.FormattedValue'];
                                obj.endTime = args[i]['hub_satendtime@OData.Community.Display.V1.FormattedValue'];
                                break;
                            case 'sunday':
                                obj.startTime = args[i]['hub_sunstarttime@OData.Community.Display.V1.FormattedValue'];
                                obj.endTime = args[i]['hub_satendtime@OData.Community.Display.V1.FormattedValue'];
                                break;
                        }
                        if (!obj.endTime) {
                            obj.endTime = moment(obj.startTime, 'h:mm A').hours(20).format("h:mm A");
                            obj.endTime = moment(obj.endTime, 'h:mm A').minutes(00).format("h:mm A");
                            obj.endTime = moment(obj.endTime, 'h:mm A').seconds(00).format("h:mm A");
                        }
                        var finalStaffHours = self.removeExceptionalHours(obj, obj.endTime, exceptionTimeArray)
                        if (finalStaffHours.length) {
                            finalStaffHours.forEach(function (staffHours) {
                                eventObjList.push(staffHours);
                            });
                        } else {
                            if (!obj.endDate) {
                                obj.endDate = new Date();
                                obj.endDate = moment(obj.endDate).format("MM/DD/YYYY");
                            }
                            obj.startHour = new Date(moment(obj.startDate, "MM/DD/YYYY").format("MM/DD/YYYY") + " " + obj.startTime).getHours();
                            obj.endHour = new Date(moment(obj.endDate, "MM/DD/YYYY").format("MM/DD/YYYY") + " " + obj.endTime).getHours();
                            eventObjList.push(obj);
                        }
                    }
                }
            }
            this.taList = eventObjList;
        }
        return eventObjList;
    }

    /*
     *  Method will be called on page load
     *  This method is responsible for populating teacher events on calendar 
     *   
     */
    this.populateTeacherEvent = function (teacherObject, isFromFilter) {
        var self = this;
        wjQuery(".loading").show();
        if (teacherObject.length) {
            wjQuery.each(teacherObject, function (key, value) {
                if (value['centerId'] == self.locationId) {
                    var id = value['id'];
                    var name = value['name'];
                    var eventId = value['resourceId'] + value['startHour'];
                    var uniqueId = id + "_" + value['resourceId'] + "_" + value['startHour'];
                    var event = self.calendar.fullCalendar('clientEvents', eventId);
                    var resourceObj = self.getResourceObj(value['resourceId']);
                    var draggable = "";
                    if(!self.checkAccountClosure()){
                        draggable = "draggable";
                    }
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
                                        return x;
                                    }).indexOf(0);
                                    if (msgIndex == -1) {
                                        event[k].conflictMsg.push(0);
                                    }
                                    self.updateConflictMsg(event[k]);

                                    event[k].teachers.push({ id: id, name: name, pinId: value['pinId'] });
                                    wjQuery.each(event[k].teachers, function (ka, teacherObj) {
                                        var uniqueId = teacherObj.id + "_" + value['resourceId'] + "_" + value['startHour'];
                                        if (teacherObj['pinId'] != undefined) {
                                            event[k].title += "<span class='"+ draggable + " drag-teacher' pinnedId='" + value['pinId'] + "' eventid='" + eventId + "' uniqueId='" + uniqueId + "' id='" + teacherObj.id + value['resourceId'] + "' type='teacherSession' value='" + teacherObj.id + "'><img src='/webresources/hub_/calendar/images/pin.png'/>" + teacherObj.name + "</span>";
                                            self.addContext(uniqueId, 'teacher', true, "", teacherObj['scheduleType']);
                                        } else {
                                            event[k].title += "<span class='"+ draggable + " drag-teacher' eventid='" + eventId + "' uniqueId='" + uniqueId + "' id='" + teacherObj.id + value['resourceId'] + "' type='teacherSession' value='" + teacherObj.id + "'>" + teacherObj.name + "</span>";
                                            self.addContext(uniqueId, 'teacher', false, "", teacherObj['scheduleType']);
                                        }
                                        event[k].isConflict = true;
                                    });
                                    if (event[k].hasOwnProperty("students")) {
                                        wjQuery.each(event[k].students, function (ke, val) {
                                            var stDraggable = "drag-student";
                                            if(!self.checkAccountClosure() && val.deliveryTypeCode != groupInstruction){
                                                stDraggable = "draggable drag-student";
                                            }
                                            var indicator = self.addSessionTypeIndicator(val.sessiontype);
                                            if (val['pinId'] != undefined) {
                                                event[k].title += "<span class='" + stDraggable + "' enrollmentId='" + val['enrollmentId'] + "' pinnedId='" + val['pinId'] + "' eventid='" + eventId + "' studUniqueId='" + val['studUniqueId'] + "' uniqueId='" + val.id + "_" + value['resourceId'] + "_" + value['startHour'] + "' id='" + val.id + value['resourceId'] + "' type='studentSession' value='" + val.id + "'><img src='/webresources/hub_/calendar/images/pin.png'/>" + val.name + ", " + val.grade + "<i class='material-icons' style='";
                                                if (!isIE) {
                                                    event[k].title += "background:" + val['subjectGradient']+";-webkit-background-clip: text;";
                                                }
                                                event[k].title +="color:" + val['subjectColorCode'] + "'>location_on</i>" + indicator + "</span>";""
                                            } else {
                                                event[k].title += "<span class='" + stDraggable + "' enrollmentId='" + val['enrollmentId'] + "' eventid='" + eventId + "' studUniqueId='" + val['studUniqueId'] + "' uniqueId='" + val.id + "_" + value['resourceId'] + "_" + value['startHour'] + "' id='" + val.id + value['resourceId'] + "' type='studentSession' value='" + val.id + "'>" + val.name + ", " + val.grade + "<i class='material-icons' title='" + val['serviceValue'] + "' style='";
                                                if (!isIE) {
                                                    event[k].title += "background:" + val['subjectGradient'] + ";-webkit-background-clip: text;";
                                                }
                                                event[k].title += "color:" + val['subjectColorCode'] + "'>location_on</i>" + indicator + "</span>";
                                            }
                                            
                                        });
                                    }
                                    // capacity check for students place holder
                                    if (event[k].hasOwnProperty("students")) {
                                        if (resourceObj['capacity'] > event[k]['noOfStudents']) {
                                            if (event[k].title.indexOf('<span class="student-placeholder-' + event[k].deliveryType + '">Student name</span>') == -1) {
                                                event[k].title += '<span class="student-placeholder-' + event[k].deliveryType + '">Student name</span>';
                                                self.addContext("", 'studentPlaceholder', true, event[k].deliveryTypeCode);
                                            }
                                        }
                                    } else {
                                        if (event[k].title.indexOf('<span class="student-placeholder-' + event[k].deliveryType + '">Student name</span>') == -1) {
                                            event[k].title += '<span class="student-placeholder-' + event[k].deliveryType + '">Student name</span>';
                                            self.addContext("", 'studentPlaceholder', true, event[k].deliveryTypeCode);
                                        }
                                    }
                                }
                            } else {
                                var uniqueId = id + "_" + value['resourceId'] + "_" + value['startHour'];
                                if (event[k].title.indexOf("<img class='onetoone' title='1:1 Session' src='/webresources/hub_/calendar/images/lock.png'>") != -1) {
                                    event[k].title = "<img class='onetoone' title='1:1 Session' src='/webresources/hub_/calendar/images/lock.png'>";
                                    if (value['pinId'] != undefined) {
                                        event[k].title += "<span class='"+ draggable +" drag-teacher' pinnedId='" + value['pinId'] + "' eventid='" + eventId + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='teacherSession' value='" + id + "'><img src='/webresources/hub_/calendar/images/pin.png'/>" + value.name + "</span>";
                                    } else {
                                        event[k].title += "<span class='"+ draggable +" drag-teacher' eventid='" + eventId + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='teacherSession' value='" + id + "'>" + value.name + "</span>";
                                    }
                                } else {
                                    if (value['pinId'] != undefined) {
                                        event[k].title = "<span class='"+ draggable +" drag-teacher' pinnedId='" + value['pinId'] + "' eventid='" + eventId + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='teacherSession' value='" + id + "'><img src='/webresources/hub_/calendar/images/pin.png'/>" + value.name + "</span>";
                                    } else {
                                        event[k].title = "<span class='"+ draggable +" drag-teacher' eventid='" + eventId + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='teacherSession' value='" + id + "'>" + value.name + "</span>";
                                    }
                                }
                                var studentList = event[k].students;
                                event[k].teachers = [{ id: id, name: name }];
                                wjQuery.each(studentList, function (ke, val) {
                                    var stDraggable = "drag-student";
                                    if(!self.checkAccountClosure() && val.deliveryTypeCode != groupInstruction){
                                        stDraggable = "draggable drag-student";
                                    }
                                    var indicator = self.addSessionTypeIndicator(val.sessiontype);
                                    if (val['pinId']) {
                                        event[k].title += "<span class='" + stDraggable + "' enrollmentId='" + val['enrollmentId'] + "' pinnedId='" + val['pinId'] + "' eventid='" + eventId + "' studUniqueId='" + val['studUniqueId'] + "' uniqueId='" + val.id + "_" + value['resourceId'] + "_" + value['startHour'] + "' id='" + val.id + value['resourceId'] + "' type='studentSession' value='" + val.id + "'><img src='/webresources/hub_/calendar/images/pin.png'/>" + val.name + ", " + val.grade + "<i class='material-icons' title='" + val['serviceValue'] + "' style='";
                                        if (!isIE) {
                                            event[k].title += "background:" + val['subjectGradient'] + ";-webkit-background-clip: text;";
                                        }
                                        event[k].title += "color:" + val['subjectColorCode'] + "'>location_on</i>" + indicator + "</span>";
                                    } else {
                                        event[k].title += "<span class='" + stDraggable + "' enrollmentId='" + val['enrollmentId'] + "' eventid='" + eventId + "' studUniqueId='" + val['studUniqueId'] + "' uniqueId='" + val.id + "_" + value['resourceId'] + "_" + value['startHour'] + "' id='" + val.id + value['resourceId'] + "' type='studentSession' value='" + val.id + "'>" + val.name + ", " + val.grade + "<i class='material-icons' title='" + val['serviceValue'] + "' style='";
                                        if (!isIE) {
                                            event[k].title += "background:" + val['subjectGradient']+";-webkit-background-clip: text;";
                                        }
                                        event[k].title += "color:" + val['subjectColorCode'] + "'>location_on</i>" + indicator + "</span>";
                                    }
                                });
                            }
                            if (event[k].students != undefined) {
                                if (event[k]['noOfStudents'] < resourceObj["capacity"] || resourceObj["capacity"] == undefined) {
                                    if (event[k].title.indexOf('<span class="student-placeholder-' + event[k].deliveryType + '">Student name</span>') == -1) {
                                        event[k].title += '<span class="student-placeholder-' + event[k].deliveryType + '">Student name</span>';
                                        self.addContext("", 'studentPlaceholder', true, event[k].deliveryTypeCode);
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
                                } else if (event[k]['noOfStudents'] > resourceObj["capacity"]) {
                                    var msgIndex = event[k].conflictMsg.map(function (z) {
                                        return z;
                                    }).indexOf(1);
                                    if (msgIndex == -1) {
                                        event[k].conflictMsg.push(1);
                                    }
                                    self.updateConflictMsg(event[k]);
                                }
                            }
                            if (event[k].title.indexOf('<span class="student-placeholder-' + event[k].deliveryType + '">Student name</span>') != -1) {
                                event[k].title = event[k].title.replace('<span class="student-placeholder-' + event[k].deliveryType + '"-' + event[k].deliveryType + '>Student name</span>', "");
                            }
                            if (event[k].hasOwnProperty("students")) {
                                if (resourceObj['capacity'] > event[k]['noOfStudents']) {
                                    if (event[k].title.indexOf('<span class="student-placeholder-' + event[k].deliveryType + '">Student name</span>') == -1) {
                                        event[k].title += '<span class="student-placeholder-' + event[k].deliveryType + '">Student name</span>';
                                        self.addContext("", 'studentPlaceholder', true, event[k].deliveryTypeCode);
                                    }
                                }
                            } else {
                                if (event[k].title.indexOf('<span class="student-placeholder-' + event[k].deliveryType + '">Student name</span>') == -1) {
                                    event[k].title += '<span class="student-placeholder-' + event[k].deliveryType + '">Student name</span>';
                                    self.addContext("", 'studentPlaceholder', true, event[k].deliveryTypeCode);
                                }
                            }


                            if (resourceObj['deliveryTypeCode'] == personalInstruction) {
                                var eventIs1to1 = self.checkEventIsOneToOne(event[k]['students']);
                                if (eventIs1to1) {
                                    event[k].is1to1 = true;
                                }

                                if (event[k].is1to1) {
                                    if (event[k].title.indexOf('<img class="onetoone" title="1:1 Session" src="/webresources/hub_/calendar/images/lock.png">') == -1) {
                                        event[k].title += '<img class="onetoone" title="1:1 Session" src="/webresources/hub_/calendar/images/lock.png">';
                                    }
                                }

                                // Update one to one conflict check
                                if (event[k].is1to1 && event[k].hasOwnProperty('students') && event[k]['students'].length > 1) {
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
                            if (isNonPreferred) {
                                // non preferred teacher conflict check
                                var msgIndex = event[k].conflictMsg.map(function (x) {
                                    return x;
                                }).indexOf(3);
                                if (msgIndex == -1) {
                                    event[k].conflictMsg.push(3);
                                }
                                self.updateConflictMsg(event[k]);
                            }


                        });
                        if (value['pinId'] != undefined) {
                            self.addContext(uniqueId, 'teacher', true, "", value['scheduleType']);
                        }
                        else {
                            self.addContext(uniqueId, 'teacher', false, "", value['scheduleType']);
                        }
                        self.calendar.fullCalendar('updateEvent', event);
                    } else {
                        var obj = {
                            id: value['resourceId'] + value['startHour'],
                            teachers: [{ id: id, name: name, pinId: value['pinId'] }],
                            start: value['startHour'],
                            end: value['end'],
                            allDay: false,
                            resourceId: value['resourceId'],
                            isTeacher: true,
                            isConflict: false,
                            deliveryTypeId: resourceObj.deliveryTypeId,
                            deliveryType: resourceObj.deliveryType,
                            deliveryTypeCode: resourceObj.deliveryTypeCode,
                            deliveryTypeCodeVal: resourceObj.deliveryTypeCodeVal,
                            textColor: "#333333",
                            conflictMsg: [],
                            noOfStudents:0
                        }

                        var draggable = ""
                        if(!self.checkAccountClosure()){
                            draggable = "draggable";
                        }
                        if (value['pinId'] != undefined) {
                            obj.title = "<span class='"+draggable+" drag-teacher' pinnedId='" + value['pinId'] + "' eventid='" + eventId + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='teacherSession' value='" + id + "'><img src='/webresources/hub_/calendar/images/pin.png'/>" + name + "</span>";
                        } else {
                            obj.title = "<span class='"+draggable+" drag-teacher' eventid='" + eventId + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='teacherSession' value='" + id + "'>" + name + "</span>";
                        }

                        if (obj.deliveryTypeCode == groupFacilitation) {
                            obj.backgroundColor = "#dff0d5";
                            obj.borderColor = "#7bc143";
                            obj.deliveryType = "Group-Facilitation";
                        } else if (obj.deliveryTypeCode == groupInstruction) {
                            obj.backgroundColor = "#fedeb7";
                            obj.borderColor = "#f88e50";
                            obj.deliveryType = "Group-Instruction";
                        } else if (obj.deliveryTypeCode == personalInstruction) {
                            obj.backgroundColor = "#ebf5fb";
                            obj.borderColor = "#9acaea";
                            obj.deliveryType = "Personal-Instruction";
                        }

                        if (obj.deliveryType != undefined) {
                            obj.title += '<span class="student-placeholder-' + obj.deliveryType + '">Student name</span>';
                            self.addContext("", 'studentPlaceholder', true, obj.deliveryTypeCode);
                        }

                        if (value['pinId'] != undefined) {
                            self.addContext(uniqueId, 'teacher', true, "", value['scheduleType']);
                        }
                        else {
                            self.addContext(uniqueId, 'teacher', false, "", value['scheduleType']);
                        }
                        self.eventList.push(obj);
                        if (isFromFilter) {
                            self.calendar.fullCalendar('removeEvents');
                            self.calendar.fullCalendar('removeEventSource');
                            self.calendar.fullCalendar('addEventSource', { events: self.eventList });
                            self.calendar.fullCalendar('refetchEvents');
                        }
                    }
                    self.draggable('draggable');
                }
            });
        }
        wjQuery(".loading").hide();
        this.showConflictMsg();
    }

    /*
     *  Method will be called on page load(Logical sessions)
     *  This method is responsible for populating students, who's objects are having affinity resource 
     *   
     */
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
                                var index = -1;
                                for (var a = 0; a < self.convertedStudentObj.length; a++) {
                                    if (self.convertedStudentObj[a].id == affinityList[i].id &&
                                           self.convertedStudentObj[a].enrollmentId == affinityList[i].enrollmentId &&
                                           self.convertedStudentObj[a].startHour.getTime() == affinityList[i].startHour.getTime()) {
                                        index = a;
                                        break;
                                    }
                                }
                                if (index == -1 && self.sofvalidation(affinityList[i])) {
                                    self.convertedStudentObj.push(affinityList[i]);
                                    if (currentView.name == 'resourceDay') {
                                        self.populateStudentEvent(obj, true, true);
                                    }
                                    else {
                                        self.generateWeekEventObject(obj, 'studentSession');
                                    }
                                }
                                else {
                                    affinityList.splice(i, 1);
                                    i -= 1;
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
                        var index = -1;
                        for (var a = 0; a < self.convertedStudentObj.length; a++) {
                            if (self.convertedStudentObj[a].id == affinityList[i].id &&
                                   self.convertedStudentObj[a].enrollmentId == affinityList[i].enrollmentId &&
                                   self.convertedStudentObj[a].startHour.getTime() == affinityList[i].startHour.getTime()) {
                                index = a;
                                break;
                            }
                        }
                        if (index == -1  && self.sofvalidation(affinityList[i])) {
                            self.convertedStudentObj.push(affinityList[i]);
                            if (currentView.name == 'resourceDay') {
                                self.populateStudentEvent(obj, true, true);
                            }
                            else {
                                self.generateWeekEventObject(obj, 'studentSession');
                            }
                        }
                        else {
                            affinityList.splice(i, 1);
                            i -= 1;
                        }
                    }
                });
            }
            else {
                var obj = [];
                obj.push(affinityList[i]);
                var index = -1;
                for (var a = 0; a < self.convertedStudentObj.length; a++) {
                    if (self.convertedStudentObj[a].id == affinityList[i].id &&
                        self.convertedStudentObj[a].enrollmentId == affinityList[i].enrollmentId &&
                        self.convertedStudentObj[a].startHour.getTime() == affinityList[i].startHour.getTime()) {
                        index = a;
                        break;
                    }
                }
                if (index == -1 && self.sofvalidation(affinityList[i])) {
                    self.convertedStudentObj.push(affinityList[i]);
                    if (currentView.name == 'resourceDay') {
                        self.populateStudentEvent(obj, true, true);
                    }
                    else {
                        self.generateWeekEventObject(obj, 'studentSession');
                    }
                }
                else {
                    affinityList.splice(i, 1);
                    i -= 1;
                }
            }
        }
        if (affinityNotPlaceStudents.length) {
            self.populateNoResourceStudent(affinityNotPlaceStudents);
        }
    }

    /*
     *  Method will be called on page load(Logical sessions)
     *  This method is responsible for populating students, who's objects are not having resource 
        will be moved to sof panel    
     */
    this.populateNoResourceStudent = function (studentList) {
        var self = this;
        var studentsForSOF = [];
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
                                        var index = -1;
                                        for (var a = 0; a < self.convertedStudentObj.length; a++) {
                                            if (self.convertedStudentObj[a].id == studentList[i].id &&
                                                self.convertedStudentObj[a].enrollmentId == studentList[i].enrollmentId &&
                                                self.convertedStudentObj[a].startHour.getTime() == studentList[i].startHour.getTime()) {
                                                index = a;
                                                break;
                                            }
                                        }
                                        if (index == -1 && self.sofvalidation(studentList[i])) {
                                            self.convertedStudentObj.push(studentList[i]);
                                            if (currentView.name == 'resourceDay') {
                                                self.populateStudentEvent(obj, true, true);
                                            } else {
                                                self.generateWeekEventObject(obj, 'studentSession');
                                            }
                                        } else {
                                            studentList.splice(i, 1);
                                            i -= 1;
                                        }
                                    }
                                }
                            }
                            else {
                                studentList[i].resourceId = self.resourceList[j].id;
                                var obj = [];
                                studentNotPlacedFlag = false;
                                obj.push(studentList[i]);
                                var index = -1;
                                for (var a = 0; a < self.convertedStudentObj.length; a++) {
                                    if (self.convertedStudentObj[a].id == studentList[i].id &&
                                        self.convertedStudentObj[a].enrollmentId == studentList[i].enrollmentId &&
                                        self.convertedStudentObj[a].startHour.getTime() == studentList[i].startHour.getTime()) {
                                        index = a;
                                        break;
                                    }
                                }
                                if (index == -1 && self.sofvalidation(studentList[i])) {
                                    self.convertedStudentObj.push(studentList[i]);
                                    if (currentView.name == 'resourceDay') {
                                        self.populateStudentEvent(obj, true, true);
                                    }
                                    else {
                                        self.generateWeekEventObject(obj, 'studentSession');
                                    }
                                }
                                else {
                                    studentList.splice(i, 1);
                                    i -= 1;
                                }
                            }
                        });
                    }
                    else {
                        studentList[i].resourceId = self.resourceList[j].id;
                        var obj = [];
                        studentNotPlacedFlag = false;
                        obj.push(studentList[i]);
                        var index = -1;
                        for (var a = 0; a < self.convertedStudentObj.length; a++) {
                            if (self.convertedStudentObj[a].id == studentList[i].id &&
                                self.convertedStudentObj[a].enrollmentId == studentList[i].enrollmentId &&
                                self.convertedStudentObj[a].startHour.getTime() == studentList[i].startHour.getTime()) {
                                index = a;
                                break;
                            }
                        }
                        if (index == -1 && self.sofvalidation(studentList[i])) {
                            self.convertedStudentObj.push(studentList[i]);
                            if (currentView.name == 'resourceDay') {
                                self.populateStudentEvent(obj, true, true);
                            }
                            else {
                                self.generateWeekEventObject(obj, 'studentSession');
                            }
                        }
                        else {
                            studentList.splice(i, 1);
                            i -= 1;
                        }
                    }
                }
                if (!studentNotPlacedFlag) {
                    break;
                }
            }
            if (studentNotPlacedFlag) {
                var index = -1;
                for (var a = 0; a < self.convertedStudentObj.length; a++) {
                    if (self.convertedStudentObj[a].id == studentList[i].id &&
                        self.convertedStudentObj[a].enrollmentId == studentList[i].enrollmentId &&
                        self.convertedStudentObj[a].startHour.getTime() == studentList[i].startHour.getTime()) {
                        index = a;
                        break;
                    }
                }
                if (index == -1 && self.sofvalidation(studentList[i])) {
                    studentsForSOF.push(studentList[i]);
                } else {
                    studentList.splice(i, 1);
                    i -= 1;
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
                var currentView = self.calendar.fullCalendar('getView');
                if (currentView.name != "agendaWeek") {
                    self.openSofPane();
                }
            }
        }, 300);
    }

    /*
     *  Method will be called on page load(Logical sessions)
     *  This method is responsible for populating students, who's objects are having matching services 
        will be grouped and populated in one event     
     */
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
                        for (var k = 0; k < serviceStudentList[Object.keys(serviceStudentList)[i]].length; k++) {
                            var e = serviceStudentList[Object.keys(serviceStudentList)[i]][k];
                            e['resourceId'] = self.resourceList[j].id;
                            var index = -1;
                            for (var a = 0; a < self.convertedStudentObj.length; a++) {
                                if (self.convertedStudentObj[a].id == e.id &&
                                    self.convertedStudentObj[a].enrollmentId == e.enrollmentId &&
                                    self.convertedStudentObj[a].startHour.getTime() == e.startHour.getTime()) {
                                    index = a;
                                    break;
                                }
                            }
                            if (index == -1 && self.sofvalidation(e)) {
                                self.convertedStudentObj.push(e);
                            }
                            else {
                                serviceStudentList[Object.keys(serviceStudentList)[i]].splice(k, 1);
                                k -= 1;
                            }
                        }
                        studentNotPlacedFlag = false;
                        if (currentView.name == 'resourceDay') {
                            self.populateStudentEvent(serviceStudentList[Object.keys(serviceStudentList)[i]], true, true);
                        }
                        else {
                            self.generateWeekEventObject(serviceStudentList[Object.keys(serviceStudentList)[i]], 'studentSession');
                        }
                        break;
                    }
                }
            }
            if (studentNotPlacedFlag) {
                for (var l = 0; l < serviceStudentList[Object.keys(serviceStudentList)[i]].length; l++) {
                    var student = serviceStudentList[Object.keys(serviceStudentList)[i]][l];
                    var index = -1;
                    for (var a = 0; a < self.convertedStudentObj.length; a++) {
                        if (self.convertedStudentObj[a].id == student.id &&
                            self.convertedStudentObj[a].enrollmentId == student.enrollmentId &&
                            self.convertedStudentObj[a].startHour.getTime() == student.startHour.getTime()) {
                            index = a;
                            break;
                        }
                    }
                    if (index == -1 && self.sofvalidation(e)) {
                        studentsForSOF.push(student);
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
                var currentView = self.calendar.fullCalendar('getView');
                if (currentView.name != "agendaWeek") {
                    self.openSofPane();
                }
            }
        }, 300);
    }

    /*
     *  Method will be called on page load
     *  This method is responsible for pushing students in sof list     
     */
    this.pushStudentToSOF = function (data) {
        var self = this;
        var currentView = this.calendar.fullCalendar('getView');
        if (currentView.name == 'resourceDay') {
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
            if (studentPushFlagDecision && dateFlag) {
                if (data.deliveryTypeCode == personalInstruction) {
                    var index = -1;
                    for (var i = 0; i < this.sofList['Personal Instruction'].length; i++) {
                        if (this.sofList['Personal Instruction'][i].id == data.id &&
                            this.sofList['Personal Instruction'][i].startHour.getTime() == data.startHour.getTime()) {
                            index = i;
                            break;
                        }
                    }
                    if (index == -1) {
                        this.sofList['Personal Instruction'].push(data);
                    }
                } else if (data.deliveryTypeCode == groupInstruction) {
                    var index = -1;
                    for (var i = 0; i < this.sofList['Group Instruction'].length; i++) {
                        if (
                            this.sofList['Group Instruction'][i].studUniqueId == data.studUniqueId
                            // this.sofList['Group Instruction'][i].id == data.id &&
                            // this.sofList['Group Instruction'][i].startHour.getTime() == data.startHour.getTime()
                            ) {
                            index = i;
                            break;
                        }
                    }
                    if (index == -1) {
                        this.sofList['Group Instruction'].push(data);
                    }
                } else if (data.deliveryTypeCode == groupFacilitation) {
                    var index = -1;
                    for (var i = 0; i < this.sofList['Group Facilitation'].length; i++) {
                        if (this.sofList['Group Facilitation'][i].studUniqueId == data.studUniqueId
                            // this.sofList['Group Facilitation'][i].id == data.id &&
                            // this.sofList['Group Facilitation'][i].startHour.getTime() == data.startHour.getTime()
                            ) {
                            index = i;
                            break;
                        }
                    }
                    if (index == -1) {
                        this.sofList['Group Facilitation'].push(data);
                    }
                }
            }
        }
        else if (currentView.name == 'agendaWeek') {
            this.generateWeekEventObject([data], 'studentSession');
        }
    };

    /*
     *  Method will be called on page load
     *  This method is responsible for pushing students in sa list     
     */
    this.pushStudentToSA = function (data) {
        var self = this;
        var currentView = this.calendar.fullCalendar('getView');
        if (currentView.name == 'resourceDay') {
            if (Object.keys(this.saList).length == 0) {
                this.saList['Personal Instruction'] = [];
                this.saList['Group Instruction'] = [];
                this.saList['Group Facilitation'] = [];
            }
            var studentPushFlagDecision = true;
            var currentCalendarDate = this.calendar.fullCalendar('getDate');
            var dateFlag = moment(currentCalendarDate).format("YYYY-MM-DD") == moment(data.startHour).format("YYYY-MM-DD");
            if (studentPushFlagDecision && dateFlag) {
                if (data.deliveryTypeCode == personalInstruction) {
                    var index = -1;
                    for (var i = 0; i < this.saList['Personal Instruction'].length; i++) {
                        if (this.saList['Personal Instruction'][i].studUniqueId == data.studUniqueId
                            // this.saList['Personal Instruction'][i].id == data.id &&
                            // this.saList['Personal Instruction'][i].sessionStatus == data.sessionStatus &&
                            // this.saList['Personal Instruction'][i].startHour.getTime() == data.startHour.getTime()
                            ) {
                            index = i;
                            break;
                        }
                    }
                    if (index == -1) {
                        this.saList['Personal Instruction'].push(data);
                    }
                } else if (data.deliveryTypeCode == groupInstruction) {
                    var index = -1;
                    for (var i = 0; i < this.saList['Group Instruction'].length; i++) {
                        if (this.saList['Group Instruction'][i].studUniqueId == data.studUniqueId
                            // this.saList['Group Instruction'][i].id == data.id &&
                            // this.saList['Group Instruction'][i].startHour.getTime() == data.startHour.getTime()
                            ) {
                            index = i;
                            break;
                        }
                    }
                    if (index == -1) {
                        this.saList['Group Instruction'].push(data);
                    }
                } else if (data.deliveryTypeCode == groupFacilitation) {
                    var index = -1;
                    for (var i = 0; i < this.saList['Group Facilitation'].length; i++) {
                        if ( this.saList['Group Facilitation'][i].studUniqueId == data.studUniqueId
                            // this.saList['Group Facilitation'][i].id == data.id &&
                            // this.saList['Group Facilitation'][i].startHour.getTime() == data.startHour.getTime()
                            ) {
                            index = i;
                            break;
                        }
                    }
                    if (index == -1) {
                        this.saList['Group Facilitation'].push(data);
                    }
                }
            }
        }
    };


    ///
    //  This mothod will take studentLis and populates studnt event on calendar.
    ///
    this.populateStudentEvent = function (studentList, isFromFilter, checkFor1to1) {
        var self = this;
        wjQuery(".loading").show();
        checkFor1to1 = checkFor1to1 != undefined;
        if (studentList.length) {
            wjQuery.each(studentList, function (key, value) {
                if (value['sessionStatus'] == SCHEDULE_STATUS ||
                    value['sessionStatus'] == RESCHEDULE_STATUS || 
                    value['isFromMasterSchedule']) {
                    var id = value['id'];
                    var name = value['name'];
                    var grade = value['grade'];
                    var subjectId = value['subjectId'];
                    var serviceId = value['serviceId'];
                    var subjectName = value['subject'];
                    var programId = value['programId'];
                    var enrollmentId = value['enrollmentId'];
                    var is1to1 = value['is1to1'];
                    var eventId = value['resourceId'] + value['startHour'];
                    var uniqueId = id + "_" + value['resourceId'] + "_" + value['startHour'];
                    var event = self.calendar.fullCalendar('clientEvents', eventId);
                    // if(event.length == 0){
                    //    event = self.calendar.fullCalendar('clientEvents', function(el){
                    //         return  el.start == value['startHour'] && 
                    //                 el.resourceId == value['resourceId'] 
                    //    });    
                    // }
                    var resourceObj = self.getResourceObj(value['resourceId']);
                    var draggable = "drag-student";
                    if(!self.checkAccountClosure() && resourceObj.deliveryTypeCode != groupInstruction){
                        draggable = "draggable drag-student";
                    }
                    if (event.length) {
                        if(event[0].hasOwnProperty("students")){
                            event[0].students.push(value);
                            if(!event[0].is1to1){
                                event[0].is1to1 = value['is1to1'];
                            }
                        }else{
                            event[0].students = [value];
                            event[0].is1to1 = value['is1to1'];
                        }
                        event[0]['noOfStudents'] += 1;
                        var indicator = self.addSessionTypeIndicator(value.sessiontype);
                        if (value['pinId'] != undefined) {
                            event[0].title += "<span class='" + draggable + "' enrollmentId='" + enrollmentId + "' eventid='" + eventId + "' studUniqueId='" + value['studUniqueId'] + "' pinnedId='" + value['pinId'] + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='studentSession' value='" + id + "'><img src='/webresources/hub_/calendar/images/pin.png'/>" + name + ", " + grade + "<i class='material-icons' title='" + value['serviceValue'] + "' style='";
                            if(!isIE){
                                event[0].title += "background:" + value['subjectGradient'] + ";-webkit-background-clip: text;";
                            }
                            event[0].title +="color:" + value['subjectColorCode'] + "'>location_on</i>" + indicator + "</span>";
                        } else {
                            event[0].title += "<span class='" + draggable + "' enrollmentId='" + enrollmentId + "' eventid='" + eventId + "' studUniqueId='" + value['studUniqueId'] + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='studentSession' value='" + id + "'>" + name + ", " + grade + "<i class='material-icons' title='" + value['serviceValue'] + "' style='";
                            if(!isIE){
                                event[0].title += "background:" + value['subjectGradient'] + ";-webkit-background-clip: text;";
                            }
                            event[0].title +="color:" + value['subjectColorCode'] + "'>location_on</i>" + indicator + "</span>";
                        }

                        if (event[0].title.indexOf('<span class="student-placeholder-' + event[0].deliveryType + '">Student name</span>') != -1) {
                            event[0].title = event[0].title.replace('<span class="student-placeholder-' + event[0].deliveryType + '">Student name</span>', '');
                        }

                        // Capcity check and add/remove of capacity conflict.
                        if (event[0]['noOfStudents'] < resourceObj["capacity"] || resourceObj["capacity"] == undefined) {
                            event[0].title += '<span class="student-placeholder-' + event[0].deliveryType + '">Student name</span>';
                            self.addContext("", 'studentPlaceholder', true, event[0].deliveryTypeCode);
                            // capacity conflict removal
                            var msgIndex = event[0].conflictMsg.map(function (x) {
                                return x;
                            }).indexOf(1);
                            if (msgIndex > -1) {
                                event[0].conflictMsg.splice(msgIndex, 1);
                            }
                            self.updateConflictMsg(event[0]);
                        } else if (event[0]['noOfStudents'] > resourceObj["capacity"]) {
                            // capacity conflict addition
                            var msgIndex = event[0].conflictMsg.map(function (x) {
                                return x;
                            }).indexOf(1);
                            if (msgIndex == -1) {
                                event[0].conflictMsg.push(1);
                            }
                            self.updateConflictMsg(event[0]);
                        }

                        // One to one type lock and conflict ico is only for PI DT
                        if (resourceObj.deliveryTypeCode == personalInstruction) {
                            if (event[0].is1to1 == true || value.is1to1 == true) {
                                if (event[0].title.indexOf('<img class="onetoone" title="1:1 Session" src="/webresources/hub_/calendar/images/lock.png">') == -1) {
                                    event[0].title += '<img class="onetoone" title="1:1 Session" src="/webresources/hub_/calendar/images/lock.png">';
                                }
                            } 
                            if (event[0].is1to1 && event[0].hasOwnProperty('students') && event[0]['students'].length > 1) {
                                var msgIndex = event[0].conflictMsg.map(function (x) {
                                    return x;
                                }).indexOf(2);
                                if (msgIndex == -1) {
                                    event[0].conflictMsg.push(2);
                                }
                                self.updateConflictMsg(event[0]);
                            }
                        }

                        var isNonPreferred = self.checkNonPreferredTeacherConflict(event[0]);
                        if (isNonPreferred) {
                            // non preferred teacher conflict check
                            var msgIndex = event[0].conflictMsg.map(function (x) {
                                return x;
                            }).indexOf(3);
                            if (msgIndex == -1) {
                                event[0].conflictMsg.push(3);
                                self.updateConflictMsg(event[0]);
                            }
                        }
                        // });
                        if (value['pinId'] != undefined) {
                            self.addContext(uniqueId, 'student', true, value['deliveryTypeCode'], value['sessionStatus'], value['sessiontype'], value['isAttended'], value['studUniqueId']);
                        }else {
                            self.addContext(uniqueId, 'student', false, value['deliveryTypeCode'], value['sessionStatus'], value['sessiontype'], value['isAttended'], value['studUniqueId']);
                        }
                        self.calendar.fullCalendar('updateEvent', event);
                    } else {
                        var obj = {
                            id: eventId,
                            students: [value],
                            start: value['startHour'],
                            end: value['end'],
                            allDay: false,
                            resourceId: value['resourceId'],
                            isTeacher: false,
                            is1to1: value['is1to1'],
                            isConflict: false,
                            textColor: "#333333",
                            conflictMsg: []
                        }
                        obj.title = "";

                        // Exclude excused and unexcused student in the event available capacity count
                        obj['noOfStudents'] = 1;
                        // Display one to one icon only for PI DT
                        if (resourceObj.deliveryTypeCode == personalInstruction) {
                            if (value['is1to1']) {
                                obj.title += '<img class="onetoone" title="1:1 Session" src="/webresources/hub_/calendar/images/lock.png">';
                            }
                        }

                        obj.title += "<span class='placeholder teacher-placeholder'>Teacher name</span>";
                        self.addContext("", 'teacherPlaceholder', true, true);
                        var indicator = self.addSessionTypeIndicator(value.sessiontype);
                        if (value['pinId'] != undefined) {
                            obj.title += "<span class='" + draggable + "' enrollmentId='" + enrollmentId + "' eventid='" + eventId + "' studUniqueId='" + value['studUniqueId'] + "' pinnedId='" + value['pinId'] + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='studentSession' value='" + id + "'><img src='/webresources/hub_/calendar/images/pin.png'/>" + name + ", " + grade + "<i class='material-icons' title='" + value['serviceValue'] + "' style='";
                            if(!isIE){
                                obj.title += "background:" + value['subjectGradient'] + ";-webkit-background-clip: text;";
                            }
                            obj.title +="color:" + value['subjectColorCode'] + "'>location_on</i>" + indicator + "</span>";
                        } else {
                            obj.title += "<span class='" + draggable + "' enrollmentId='" + enrollmentId + "' eventid='" + eventId + "' studUniqueId='" + value['studUniqueId'] + "' uniqueId='" + uniqueId + "' id='" + id + value['resourceId'] + "' type='studentSession' value='" + id + "'>" + name + ", " + grade + "<i class='material-icons' title='" + value['serviceValue'] + "' style='";
                            if (!isIE) {
                                obj.title += "background:" + value['subjectGradient'] + ";-webkit-background-clip: text;";
                            }
                            obj.title += "color:" + value['subjectColorCode'] + "'>location_on</i>" + indicator + "</span>";
                        }

                        if (resourceObj.deliveryTypeCode == groupFacilitation) {
                            obj.backgroundColor = "#dff0d5";
                            obj.borderColor = "#7bc143";
                            obj.deliveryType = "Group-Facilitation";
                            obj.deliveryTypeCode = groupFacilitation;
                        } else if (resourceObj.deliveryTypeCode == groupInstruction) {
                            obj.backgroundColor = "#fedeb7";
                            obj.borderColor = "#f88e50";
                            obj.deliveryType = "Group-Instruction";
                            obj.deliveryTypeCode = groupInstruction;
                        } else if (resourceObj.deliveryTypeCode == personalInstruction) {
                            obj.backgroundColor = "#ebf5fb";
                            obj.borderColor = "#9acaea";
                            obj.deliveryType = "Personal-Instruction";
                            obj.deliveryTypeCode = personalInstruction;
                        }

                        if (resourceObj["capacity"] > 1 && obj.deliveryType != undefined) {
                            obj.title += '<span class="student-placeholder-' + obj.deliveryType + '">Student name</span>';
                            self.addContext("", 'studentPlaceholder', true, value['deliveryTypeCode']);
                        }
                        if (value['pinId'] != undefined) {
                            self.addContext(uniqueId, 'student', true, value['deliveryTypeCode'], value['sessionStatus'], value['sessiontype'], value['isAttended'], value['studUniqueId']);
                        }
                        else {
                            self.addContext(uniqueId, 'student', false, value['deliveryTypeCode'], value['sessionStatus'], value['sessiontype'], value['isAttended'], value['studUniqueId']);
                        }


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

    /*
     *  Method will be called on page load
     *  This method is responsible for showing flag for sof availabilty
        If students are available in panel then button color will turn to red      
     */
    this.openSofPane = function () {
        var self = this;
        var closeSofPane = false;
        if (Object.keys(this.sofList).length == 0) {
            this.sofList['Personal Instruction'] = [];
            this.sofList['Group Facilitation'] = [];
            this.sofList['Group Instruction'] = [];
        }
        if (this.selectedDeliveryType.length == 1) {
            if (this.getDeliveryTypeVal(this.selectedDeliveryType[0]) == personalInstruction) {
                var filteredList = this.sofList['Personal Instruction'].filter(function (x) {
                    return x.startHour.getHours() >= 8
                });
                if (this.sofList['Personal Instruction'].length == 0 || filteredList.length == 0) {
                    closeSofPane = true;
                }
            }
        } else if (this.selectedDeliveryType.length == 2) {
            var filteredList = this.sofList['Group Facilitation'].filter(function (x) {
                return x.startHour.getHours() >= 8
            });
            if (this.sofList['Group Facilitation'].length == 0 || filteredList.length == 0) {
                closeSofPane = true;
            }
        } else {
            if (this.sofList['Personal Instruction'].length == 0 && this.sofList['Group Facilitation'].length == 0 && this.sofList['Group Instruction'].length == 0) {
                closeSofPane = true;
            }
            var filteredGFList = this.sofList['Group Facilitation'].filter(function (x) {
                return x.startHour.getHours() >= 8
            });
            var filteredGIList = this.sofList['Group Instruction'].filter(function (x) {
                return x.startHour.getHours() >= 8
            });
            var filteredPIList = this.sofList['Personal Instruction'].filter(function (x) {
                return x.startHour.getHours() >= 8
            });
            if (filteredGFList.length == 0 && filteredGIList.length == 0 && filteredPIList.length == 0) {
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

    /*
     *  Method will be called on click of filter elemets
     *  This method is responsible for filtering student/teacher/grade etc...      
     */
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

    /*
     *  Method will be called on click of student right click option pin 
     *  This method is responsible for filtering student/teacher/grade etc...      
     */
    this.pinStudent = function (element) {
        var self = this;
        wjQuery('.loading').show();
        var id = wjQuery(element).attr('value');
        var uniqueId = wjQuery(element).attr('uniqueId');
        var eventId = wjQuery(element).attr('eventid');
        var studUniqueId = wjQuery(element).attr("studUniqueId");
        var startTime = uniqueId.split('_')[2];
        var today = self.calendar.fullCalendar('getDate');
        var student = self.convertedStudentObj.filter(function (x) {
            return x.studUniqueId == studUniqueId
            // return x.id == id &&
            //        x.resourceId == uniqueId.split('_')[1];
        });
        var objPinnedStudent = {};
        if (student.length) {
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
        objPinnedStudent['hub_sessiontype'] = 1;
        objPinnedStudent['hub_deliverytype_code'] = student[0].deliveryTypeCode;
        if (student[0]['sessiontype'] != undefined) {
            objPinnedStudent['hub_sessiontype'] = student[0]['sessiontype'];
        }
        if (student[0]['makeupExpiryDate']) {
            objPinnedStudent['hub_makeup_expiry_date'] = moment(student[0]['makeupExpiryDate']).format('YYYY-MM-DD');
        }
        objPinnedStudent['hub_session_status'] = student[0]['sessionStatus'];
        var locationObj = self.getLocationObject(self.locationId);
        objPinnedStudent['ownerObj'] = locationObj['ownerObj'];
        if (student[0]['studentSession']) {
            objPinnedStudent['hub_student_session@odata.bind'] = student[0]['studentSession'];
        }
        if (student[0]['masterScheduleId']) {
            objPinnedStudent['hub_master_schedule@odata.bind'] = student[0]['masterScheduleId'];
        }
        if (student[0]['sourceAppId']) {
            objPinnedStudent['hub_sourceapplicationid'] = student[0]['sourceAppId'];
        }
        var responseObj = data.savePinStudent(objPinnedStudent);
        var eventObj = self.calendar.fullCalendar('clientEvents', eventId);
        if (typeof (responseObj) == 'boolean') {
            if (responseObj) {
                var txt = wjQuery(element)[0].innerHTML;
                if (txt.indexOf('<img style="transform:rotate(45deg);" src="/webresources/hub_/calendar/images/pin.png">') != 1) {
                    txt = txt.replace('<img style="transform:rotate(45deg);" src="/webresources/hub_/calendar/images/pin.png">', '');
                }
                wjQuery(element).html("<img src='/webresources/hub_/calendar/images/pin.png'/>" + txt);
                wjQuery(element).attr('pinnedId', objPinnedStudent.hub_sch_pinned_students_teachersid);
                stdIndex = -1;
                for (var ij = 0; ij < eventObj[0].students.length; ij++) {
                    var st = eventObj[0].students[ij];
                    if (st.id == student[0].id) {
                        stdIndex = ij;
                        break;
                    }
                }
                if (stdIndex != -1) {
                    eventObj[0].students[stdIndex]['pinId'] = objPinnedStudent.hub_sch_pinned_students_teachersid;
                }
                self.updateEventTitle(eventObj, element);
            }
        }
        else if (typeof (responseObj) == 'object') {
            if (responseObj != undefined) {
                //self.convertPinnedData(responseObj, true);
                var txt = wjQuery(element)[0].innerHTML;
                if (txt.indexOf('<img style="transform:rotate(45deg);" src="/webresources/hub_/calendar/images/pin.png">') != 1) {
                    txt = txt.replace('<img style="transform:rotate(45deg);" src="/webresources/hub_/calendar/images/pin.png">', '');
                }
                wjQuery(element).html("<img src='/webresources/hub_/calendar/images/pin.png'/>" + txt);
                wjQuery(element).attr('pinnedId', responseObj['hub_sch_pinned_students_teachersid']);
                stdIndex = -1;
                for (var ij = 0; ij < eventObj[0].students.length; ij++) {
                    var st = eventObj[0].students[ij];
                    if (st.id == student[0].id) {
                        stdIndex = ij;
                        break;
                    }
                }
                if (stdIndex != -1) {
                    eventObj[0].students[stdIndex]['pinId'] = responseObj['hub_sch_pinned_students_teachersid'];
                }
                self.updateEventTitle(eventObj, element);
            }
        }
        wjQuery('.loading').hide();
    };

    this.unPinStudent = function (element) {
        var self = this;
        var id = wjQuery(element).attr('value');
        var eventId = wjQuery(element).attr('eventid');
        var uniqueId = wjQuery(element).attr('uniqueId');
        var studUniqueId = wjQuery(element).attr("studUniqueId");
        var startTime = uniqueId.split('_')[2];
        var today = this.calendar.fullCalendar('getDate');
        var student = this.convertedStudentObj.filter(function (x) {        
            return x.studUniqueId == studUniqueId
            // return x.id == id &&
            //        x.resourceId == uniqueId.split('_')[1] &&
            //        x.startHour.getTime() == new Date(startTime).getTime();
        });

        var objUnPinnedStudent = {};
        if (student[0] != undefined) {
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
        objUnPinnedStudent['hub_deliverytype_code'] = student[0].deliveryTypeCode;
        if (wjQuery(element).attr('pinnedId') != undefined) {
            objUnPinnedStudent.hub_sch_pinned_students_teachersid = wjQuery(element).attr('pinnedId');
        }
        var locationObj = self.getLocationObject(self.locationId);
        objUnPinnedStudent['ownerObj'] = locationObj['ownerObj'];
        if (student[0]['studentSession']) {
            objUnPinnedStudent['hub_student_session@odata.bind'] = student[0]['studentSession'];
        }
        if (student[0]['masterScheduleId']) {
            objUnPinnedStudent['hub_master_schedule@odata.bind'] = student[0]['masterScheduleId'];
        }
        if (student[0]['sourceAppId']) {
            objUnPinnedStudent['hub_sourceapplicationid'] = student[0]['sourceAppId'];
        }
        var unPinResponse = data.saveUnPinStudent(objUnPinnedStudent);
        if (unPinResponse) {
            var eventObj = self.calendar.fullCalendar('clientEvents', eventId);
            wjQuery(element).removeAttr('pinnedId')
            wjQuery(element).find("img").remove();
            self.updateEventTitle(eventObj, element);
        }
        wjQuery('.loading').hide();
    };

    this.pinTeacher = function (element) {
        var self = this;
        var currentCalendarDate = self.calendar.fullCalendar('getDate');
        var id = wjQuery(element).attr('value');
        var eventId = wjQuery(element).attr('eventid');
        var uniqueId = wjQuery(element).attr('uniqueId');
        var uniqueIds = wjQuery(element).attr('uniqueId').split('_');
        var startTime = uniqueId.split('_')[2];
        var today = this.calendar.fullCalendar('getDate');
        var teacher = this.convertedTeacherObj.filter(function (x) {
            return x.id == uniqueIds[0] &&
                   x.resourceId == uniqueIds[1] &&
                   x.startHour.getTime() == new Date(uniqueIds[2]).getTime();
        });
        var objPinnedStaff = {};
        if (teacher != undefined) {
            var resourceObj = self.getResourceObj(teacher[0]['resourceId']);
            objPinnedStaff["hub_deliverytype_code"] = resourceObj.deliveryTypeCode;
            objPinnedStaff['hub_center@odata.bind'] = teacher[0].locationId;
            objPinnedStaff['hub_teacher@odata.bind'] = id;
            objPinnedStaff.hub_day = this.getDayValue(today);
            objPinnedStaff.hub_date = moment(today).format("YYYY-MM-DD");

            objPinnedStaff['hub_start_time'] = this.convertToMinutes(moment(startTime).format("h:mm A"));
            objPinnedStaff['hub_end_time'] = objPinnedStaff.hub_start_time + 60;
            objPinnedStaff['hub_resourceid@odata.bind'] = teacher[0].resourceId;

            var locationObj = self.getLocationObject(self.locationId);
            objPinnedStaff['ownerObj'] = locationObj['ownerObj'];
            objPinnedStaff['hub_centerid'] = locationObj['hub_centerid'];
            var responseObj = data.savePinTeacher(objPinnedStaff);
            if (typeof (responseObj) == 'boolean') {
                if (self.convertedPinnedList.length) {
                    index = -1;
                    for (var i = 0; i < self.convertedPinnedList.length; i++) {
                        var obj = self.convertedPinnedList[i];
                        if (obj.startTime != undefined && obj.resourceId != undefined &&
                                obj.teacherId == id &&
                                obj.startTime == moment(new Date(uniqueIds[2])).format("h:mm A") &&
                                obj.dayId == self.getDayValue(currentCalendarDate)) {
                            index = i;
                            break;
                        }
                    }
                    if (index != -1) {
                        self.convertedPinnedList[index].resourceId = uniqueIds[1];
                        var eventObj = self.calendar.fullCalendar('clientEvents', eventId);
                        var txt = wjQuery(element).text();
                        wjQuery(element).html("<img src='/webresources/hub_/calendar/images/pin.png'/>" + txt);
                        wjQuery(element).attr('pinnedId', self.convertedPinnedList[index]['id']);
                        self.updateEventTitle(eventObj, element);
                    }
                }
            } else if (typeof (responseObj) == 'object') {
                var eventObj = self.calendar.fullCalendar('clientEvents', eventId);
                var txt = wjQuery(element).text();
                wjQuery(element).html("<img src='/webresources/hub_/calendar/images/pin.png'/>" + txt);
                wjQuery(element).attr('pinnedId', responseObj['hub_sch_pinned_students_teachersid']);
                self.updateEventTitle(eventObj, element);
                var teacherPinRec = {
                    id: responseObj['hub_sch_pinned_students_teachersid'],
                    dayId: responseObj['hub_day'],
                    dayValue: objPinnedStaff.hub_day,
                    startTime: moment(startTime).format("h:mm A"),
                    resourceId: responseObj['hub_resourceid@odata.bind'],
                    teacherId: id
                }
                self.convertedPinnedList.push(teacherPinRec);
            } else {
                wjQuery('.loading').hide();
            }
        }
        wjQuery('.loading').hide();
    }

    this.unPinTeacher = function (element) {
        var self = this;
        var currentCalendarDate = self.calendar.fullCalendar('getDate');
        var id = wjQuery(element).attr('value');
        var eventId = wjQuery(element).attr('eventid');
        var uniqueId = wjQuery(element).attr('uniqueId');
        var uniqueIds = wjQuery(element).attr('uniqueId').split('_');
        var startTime = uniqueId.split('_')[2];
        var today = this.calendar.fullCalendar('getDate');
        var teacher = this.convertedTeacherObj.filter(function (x) {
            return x.id == uniqueIds[0] &&
                   x.resourceId == uniqueIds[1] &&
                   x.startHour.getTime() == new Date(uniqueIds[2]).getTime();
        });
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
            var locationObj = self.getLocationObject(self.locationId);
            objUnPinnedStaff['ownerObj'] = locationObj['ownerObj'];
            objUnPinnedStaff['hub_centerid'] = locationObj['hub_centerid'];
            if (data.saveUnPinTeacher(objUnPinnedStaff)) {
                var eventObj = self.calendar.fullCalendar('clientEvents', eventId);
                wjQuery(element).removeAttr('pinnedId');
                wjQuery(element).find("img").remove();
                self.updateEventTitle(eventObj, element);
                if (self.convertedPinnedList.length) {
                    index = -1;
                    for (var i = 0; i < self.convertedPinnedList.length; i++) {
                        var obj = self.convertedPinnedList[i];
                        if (obj.startTime != undefined && obj.resourceId != undefined &&
                                obj.teacherId == id &&
                                obj.resourceId == uniqueIds[1] &&
                                obj.startTime == moment(new Date(uniqueIds[2])).format("h:mm A") &&
                                obj.dayId == self.getDayValue(currentCalendarDate)) {
                            index = i;
                            break;
                        }
                    }
                    if (index != -1) {
                        self.convertedPinnedList.splice(index, 1);
                    }
                }
                wjQuery('.loading').hide();
            } else {
                wjQuery('.loading').hide();
            }
        }
        wjQuery('.loading').hide();
    };

    this.omitStudentFromSession = function (element,status) {
        var self = this;
        var uniqueIds = wjQuery(element).attr("uniqueId").split('_');
        var studUniqueId = wjQuery(element).attr("studUniqueId");
        var objStudent = this.convertedStudentObj.filter(function (x) {
            return x.studUniqueId == studUniqueId
            // return x.id == uniqueIds[0] &&
            //        x.resourceId == uniqueIds[1] &&
            //        x.startHour.getTime() == new Date(uniqueIds[2]).getTime();
        });
        if (objStudent[0] != undefined) {
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
            var locationObj = self.getLocationObject(self.locationId);
            objCancelSession['ownerObj'] = locationObj['ownerObj'];
            if (objStudent[0]['studentSession']) {
                objCancelSession['hub_student_session@odata.bind'] = objStudent[0]['studentSession'];
            }
            if (objStudent[0]['masterScheduleId']) {
                objCancelSession['hub_master_schedule@odata.bind'] = objStudent[0]['masterScheduleId'];
            }
            if (objStudent[0]['sourceAppId']) {
                objCancelSession['hub_sourceapplicationid'] = objStudent[0]['sourceAppId'];;
            }
            if (status == "attended") {
                var responseObj = data.markAsAttended(objCancelSession);
            } else if (status == UNEXCUSED_STATUS) {
                var responseObj = data.unExcuseSession(objCancelSession);
            }else{
                var responseObj = data.omitStudentSession(objCancelSession);
            }
            if ((typeof (responseObj) == 'boolean' && responseObj) || typeof (responseObj) == 'object') {
                var index = -1;
                for (var i = 0; i < this.convertedStudentObj.length; i++) {
                    if(studUniqueId == this.convertedStudentObj[i]['studUniqueId']){
                        index = i;
                        break;
                    }
                    // if (this.convertedStudentObj[i].id == uniqueIds[0] &&
                    //     this.convertedStudentObj[i].resourceId == uniqueIds[1] &&
                    //     this.convertedStudentObj[i].startHour.getTime() == new Date(uniqueIds[2]).getTime()) {
                    //     index = i;
                    //     break;
                    // }
                }
                if (index != -1) {
                    if (responseObj['hub_student_session@odata.bind']) {
                        this.convertedStudentObj[index]['studentSession'] = responseObj['hub_student_session@odata.bind'];
                    }
                    if (responseObj['hub_master_schedule@odata.bind']) {
                        this.convertedStudentObj[index]['masterScheduleId'] = responseObj['hub_master_schedule@odata.bind'];
                    }
                    if (responseObj['hub_sourceapplicationid']) {
                        this.convertedStudentObj[index]['sourceAppId'] = responseObj['hub_sourceapplicationid'];
                    }
                    if (status != "attended") {
                        this.convertedStudentObj[index]['sessionStatus'] = status;
                        this.convertedStudentObj[index]['isAttended'] = false;
                        this.pushStudentToSA(this.convertedStudentObj[index]);
                        self.saList = this.saList;
                        setTimeout(function () {
                            if (self.saList['Personal Instruction'].length > 0 || self.saList['Group Instruction'].length > 0 || self.saList['Group Facilitation'].length > 0) {
                                self.populateSAPane(self.saList, self.calendarOptions.minTime, self.calendarOptions.maxTime);
                            }
                        }, 300);
                        this.convertedStudentObj.splice(index, 1);
                        var prevEventId = wjQuery(element).attr("eventid");
                        var prevEvent = this.calendar.fullCalendar('clientEvents', prevEventId);
                        self.updatePrevStudentEvent(prevEvent, uniqueIds[0], prevEventId, element);
                    } else {
                        this.convertedStudentObj[index]['isAttended'] = true;
                    }
                }
            }
        }
        if (status != "attended") {
            this.openSofPane();
            this.showConflictMsg();
        }
        this.draggable('draggable');
        wjQuery('.loading').hide();
    };

    this.excuseStudentFromSession = function (element) {
        var self = this;
        var uniqueIds = wjQuery(element).attr("uniqueId").split('_');
        var studUniqueId = wjQuery(element).attr("studUniqueId");
        var h = new Date(uniqueIds[2]).getHours();
        if (h > 12) {
            h -= 12;
        }
        var objStudent = this.convertedStudentObj.filter(function (x) {
            return x.studUniqueId == studUniqueId
            // return x.id == uniqueIds[0] &&
            //        x.resourceId == uniqueIds[1] &&
            //        moment(x.startHour).format('h') == h;
        });
        if (objStudent[0] != undefined) {
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
            objCancelSession['hub_center@odata.bind'] = this.locationId;
            var locationObj = this.getLocationObject(this.locationId);
            if (locationObj['_hub_parentcenter_value'] != undefined) {
                objCancelSession['hub_parentcenter'] = locationObj['_hub_parentcenter_value'];
            }
            objCancelSession['hub_student@odata.bind'] = objStudent[0]['id'];
            objCancelSession['hub_resourceid@odata.bind'] = null;
            var locationObj = self.getLocationObject(self.locationId);
            objCancelSession['ownerObj'] = locationObj['ownerObj'];
            if (objStudent[0]['studentSession']) {
                objCancelSession['hub_student_session@odata.bind'] = objStudent[0]['studentSession'];
            }
            if (objStudent[0]['masterScheduleId']) {
                objCancelSession['hub_master_schedule@odata.bind'] = objStudent[0]['masterScheduleId'];
            }
            if (objStudent[0]['sourceAppId']) {
                objCancelSession['hub_sourceapplicationid'] = objStudent[0]['sourceAppId'];
            }
            var responseObj = data.excuseStudentFromSession(objCancelSession);
            if ((typeof (responseObj) == 'boolean' && responseObj) || typeof (responseObj) == 'object') {
                var index = -1;
                for (var i = 0; i < this.convertedStudentObj.length; i++) {
                    if(studUniqueId == this.convertedStudentObj[i]['studUniqueId']){
                        index = i;
                        break;
                    }
                    // if (this.convertedStudentObj[i].id == uniqueIds[0] &&
                    //     this.convertedStudentObj[i].resourceId == uniqueIds[1] &&
                    //     moment(this.convertedStudentObj[i].startHour).format('h') == h) {
                    //     index = i;
                    //     break;
                    // }
                }
                if (index != -1) {
                    if (responseObj['hub_student_session@odata.bind']) {
                        this.convertedStudentObj[index]['studentSession'] = responseObj['hub_student_session@odata.bind'];
                    }
                    if (responseObj['hub_master_schedule@odata.bind']) {
                        this.convertedStudentObj[index]['masterScheduleId'] = responseObj['hub_master_schedule@odata.bind'];
                    }
                    if (responseObj['hub_sourceapplicationid']) {
                        this.convertedStudentObj[index]['sourceAppId'] = responseObj['hub_sourceapplicationid'];
                    }
                    this.convertedStudentObj[index]['sessionStatus'] = EXCUSED_STATUS;
                    this.pushStudentToSA(this.convertedStudentObj[index]);
                    self.saList = this.saList;
                    setTimeout(function () {
                        if (self.saList['Personal Instruction'].length > 0 || self.saList['Group Instruction'].length > 0 || self.saList['Group Facilitation'].length > 0) {
                            self.populateSAPane(self.saList, self.calendarOptions.minTime, self.calendarOptions.maxTime);
                        }
                    }, 300);
                    this.convertedStudentObj.splice(index, 1);
                    var prevEventId = wjQuery(element).attr("eventid");
                    var prevEvent = this.calendar.fullCalendar('clientEvents', prevEventId);
                    self.updatePrevStudentEvent(prevEvent, uniqueIds[0], prevEventId, element);
                }
            }
        }
        self.openSofPane();
        self.showConflictMsg();
        self.draggable('draggable');
        wjQuery('.loading').hide();
    };

    this.excuseAndMakeUpStudent = function (element) {
        var self = this;
        var uniqueIds = wjQuery(element).attr("uniqueId").split('_');
        var studUniqueId = wjQuery(element).attr("studUniqueId");
        var h = new Date(uniqueIds[2]).getHours();
        if (h > 12) {
            h -= 12;
        }
        var objStudent = self.convertedStudentObj.filter(function (x) {
            return x.studUniqueId == studUniqueId
            // return x.id == uniqueIds[0] &&
            //        x.resourceId == uniqueIds[1] &&
            //        moment(x.startHour).format('h') == h;
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
                if (selectedFromDate != undefined) {
                    var duration = objStudent[0]['duration'] == undefined ? 60 : objStudent[0]['duration'];
                    var timeList = self.getStudentTimings(self.locationId, selectedFromDate, objStudent[0]['timeSlotType'], duration, true);
                    var timeHTML = [];
                    if (timeList.length) {
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
                    } else {
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
                width: 350
            });
            wjQuery(".excuseSave").removeClass('reschedule').addClass('makeup');
            wjQuery("#excuseModal").dialog('option', 'title', 'Add MakeUp');
            wjQuery(".makeup").off('click').on('click', function () {
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
                var locationObj = self.getLocationObject(self.locationId);
                objSession['ownerObj'] = locationObj['ownerObj'];
                if (objStudent[0]['studentSession']) {
                    objSession['hub_student_session@odata.bind'] = objStudent[0]['studentSession'];
                }
                if (objStudent[0]['masterScheduleId']) {                
                    objSession['hub_master_schedule@odata.bind'] = objStudent[0]['masterScheduleId'];		
                  }
                if (objStudent[0]['sourceAppId']) {
                    objSession['hub_sourceapplicationid'] = objStudent[0]['sourceAppId'];
                }
                if (data.excuseAndMakeUpStudent(objSession) && flag) {
                    wjQuery(".excuseSave").removeClass('makeup');
                    var index = -1;
                    for (var i = 0; i < this.self.convertedStudentObj.length; i++) {
                        if(studUniqueId == this.convertedStudentObj[i]['studUniqueId']){
                            index = i;
                            break;
                        }
                        // if (self.convertedStudentObj[i].id == uniqueIds[0] &&
                        //     self.convertedStudentObj[i].resourceId == uniqueIds[1] &&
                        //     moment(self.convertedStudentObj[i].startHour).format('h') == h) {
                        //     index = i;
                        //     break;
                        // }
                    }
                    if (index != -1) {
                        delete self.convertedStudentObj[index].resourceId;
                        var makeupDate = moment(objSession.hub_makeup_date).format("MM-DD-YYYY");
                        self.convertedStudentObj[index].start = new Date(makeupDate + " " + wjQuery(".timing-dropdown-btn").val());
                        self.convertedStudentObj[index].end = new Date(makeupDate + " " + wjQuery(".excuse-to-timepicker-input").text());
                        self.convertedStudentObj[index].startHour = self.convertedStudentObj[index].start;
                        setTimeout(function () {
                            self.pushStudentToSOF(self.convertedStudentObj[index]);
                            self.populateSOFPane(self.sofList, self.calendarOptions.minTime, self.calendarOptions.maxTime);
                            self.openSofPane();
                        }, 500);
                    }
                    wjQuery("#excuseModal").dialog("close");
                    var prevEventId = wjQuery(element).attr("eventid");
                    var prevEvent = self.calendar.fullCalendar('clientEvents', prevEventId);
                    self.updatePrevStudentEvent(prevEvent, uniqueIds[0], prevEventId, element);
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
        wjQuery('.loading').hide();
    };

    this.disableSpecificDates = function (date) {
        var string = jQuery.datepicker.formatDate('mm/dd/yy', date);
        return [disableddates.indexOf(string) == -1];
    }

    this.getDisableDates = function (minDate, maxDate) {
        var self = this;
        var locationObj = self.getLocationObject(self.locationId);
        var businessClosures = data.getBusinessClosure(self.locationId, moment(minDate).format("YYYY-MM-DD"), moment(maxDate).format("YYYY-MM-DD"), locationObj['_hub_parentcenter_value']);
        disableddates = [];
        if (businessClosures != null && businessClosures.length) {
            for (var i = 0; i < businessClosures.length; i++) {
                var startDate = businessClosures[i]['hub_startdatetime@OData.Community.Display.V1.FormattedValue'];
                var endDate = businessClosures[i]['hub_enddatetime@OData.Community.Display.V1.FormattedValue'];
                var businessClosureStartDate = new Date(startDate);
                var businessClosureEndDate = new Date(endDate);
                if (businessClosureStartDate.getTime() == businessClosureEndDate.getTime()) {
                    disableddates.push(moment(businessClosureStartDate).format('MM/DD/YYYY'));
                } else {
                    for (var j = businessClosureStartDate.getTime() ; j <= businessClosureEndDate.getTime() ; j += (24 * 60 * 60 * 1000)) {
                        disableddates.push(moment(new Date(j)).format('MM/DD/YYYY'));
                    }
                }
            }
        }
    }

    this.rescheduleStudentSession = function (element) {
        var self = this;
        var currentCalendarDate = self.calendar.fullCalendar('getDate');
        var startDate = moment(currentCalendarDate).format("YYYY-MM-DD");
        var uniqueIds = wjQuery(element).attr("uniqueId").split('_');
        var studUniqueId = wjQuery(element).attr("studUniqueId");
        var h = new Date(uniqueIds[2]).getHours();
        if (h > 12) {
            h -= 12;
        }
        var objStudent = self.convertedStudentObj.filter(function (x) {
            return x.studUniqueId == studUniqueId
            // return x.id == uniqueIds[0] &&
            //        x.resourceId == uniqueIds[1] &&
            //        moment(x.startHour).format('h') == h;
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

            var maxDate1 = moment(self.calendar.fullCalendar('getDate')).add(30, 'days')._d;
            var minDate1 = moment(self.calendar.fullCalendar('getDate')).subtract(30, 'days')._d;
            if (objStudent[0]['enrolEndDate'] != undefined) {
                var maxDate1 = new Date(moment(objStudent[0]['enrolEndDate']).format("MM-DD-YYYY"));
                maxDate2 = moment(self.calendar.fullCalendar('getDate')).add(30, 'days')._d;
                if (maxDate2.getTime() <= maxDate1.getTime()) {
                    maxDate1 = maxDate2;
                }
            }
            if (objStudent[0]['enrolStartDate'] != undefined) {
                var minDate1 = new Date(moment(objStudent[0]['enrolStartDate']).format("MM-DD-YYYY"));
                minDate2 = moment(self.calendar.fullCalendar('getDate')).subtract(30, 'days')._d;
                if (minDate2.getTime() >= minDate1.getTime()) {
                    minDate1 = minDate2;
                }
            }

            var objNewSession = {};
            objNewSession['hub_resourceid@odata.bind'] = null;
            wjQuery("#studentNameofExcuse").text(objStudent[0]['name']);
            //checkif the starting month is an AccountClosure
            var isClosure = self.checkClosure(minDate1);
            if (isClosure) {
                var minDateMonth = moment(minDate1).month() + 1;
                minDate1 =  moment(minDate1).set('month', minDateMonth)._d;
                minDate1 =  moment(minDate1).set('date', 1)._d;
            }
            isClosure = self.checkClosure(maxDate1);
            if (isClosure) {
                var maxDateMonth = moment(maxDate1).month() - 1;
                var maxClosureDate = maxDate1;
                maxClosureDate = moment(moment(maxClosureDate).set('month', maxDateMonth)._d).format("MM-DD-YYYY");
                maxDate1 = moment(maxClosureDate).endOf('month')._d;
            }
            // Get business closures for date picker
            self.getDisableDates(minDate1, maxDate1);
            wjQuery(".excuse-datepicker-input").datepicker("destroy");
            wjQuery(".excuse-datepicker-input").datepicker({
                minDate: minDate1,
                maxDate: maxDate1,
                beforeShowDay: self.disableSpecificDates,
                format: 'mm/dd/yyyy'
            });
            var selectedFromDate;
            wjQuery("#start-space, #end-space, .excuseSave").css("visibility", "hidden");
            wjQuery("#error_block").text("");
            wjQuery(".excuse-datepicker-input").off('change').on("change", function () {
                wjQuery("#error_block").text("");
                selectedFromDate = wjQuery(this).val();
                if (selectedFromDate != undefined) {
                    var duration = objStudent[0]['duration'] == undefined ? 60 : objStudent[0]['duration'];
                    var timeList = self.getStudentTimings(self.locationId, selectedFromDate, objStudent[0]['namedHoursId'], duration, false);
                    var timeHTML = [];
                    if (timeList.length) {
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
                    } else {
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
                width: 350
            });
            wjQuery(".excuseSave").removeClass('makeup').addClass('reschedule');
            wjQuery("#excuseModal").dialog('option', 'title', 'Re-Schedule');
            wjQuery(".reschedule").off('click').on('click', function () {
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
                var locationObj = self.getLocationObject(self.locationId);
                objPrevSession['ownerObj'] = locationObj['ownerObj'];
                objNewSession['ownerObj'] = locationObj['ownerObj'];
                if (objStudent[0]['studentSession']) {
                    objNewSession['hub_student_session@odata.bind'] = objStudent[0]['studentSession'];
                    objPrevSession['hub_student_session@odata.bind'] = objStudent[0]['studentSession'];
                }
                if (objStudent[0]['masterScheduleId']) {
                    objNewSession['hub_master_schedule@odata.bind'] = objStudent[0]['masterScheduleId'];
                    objPrevSession['hub_master_schedule@odata.bind'] = objStudent[0]['masterScheduleId'];
                }
                if (objStudent[0]['sourceAppId']) {
                    objNewSession['hub_sourceapplicationid'] = objStudent[0]['sourceAppId'];
                    objPrevSession['hub_sourceapplicationid'] = objStudent[0]['sourceAppId'];
                }
                var responseObj = data.rescheduleStudentSession(objPrevSession, objNewSession);
                if (typeof (responseObj) == 'boolean' || typeof (responseObj) == 'object') {
                    if (responseObj && flag) {
                        wjQuery(".excuseSave").removeClass('reschedule');
                        var index = -1;
                        for (var i = 0; i < self.convertedStudentObj.length; i++) {
                            if(studUniqueId == self.convertedStudentObj[i]['studUniqueId']){
                                index = i;
                                break;
                            }
                            // if (self.convertedStudentObj[i].id == uniqueIds[0] &&
                            //     self.convertedStudentObj[i].resourceId == uniqueIds[1] &&
                            //     moment(self.convertedStudentObj[i].startHour).format('h') == h) {
                            //     index = i;
                            //     break;
                            // }
                        }
                        if (index != -1) {
                            delete self.convertedStudentObj[index].resourceId;
                            var sessionDate = moment(objNewSession.hub_session_date).format("MM-DD-YYYY");
                            self.convertedStudentObj[index].start = new Date(sessionDate + " " + wjQuery(".timing-dropdown-btn").val());
                            self.convertedStudentObj[index].end = new Date(sessionDate + " " + wjQuery(".excuse-to-timepicker-input").text());

                            // self.convertedStudentObj[index].start =  new Date(objNewSession.hub_session_date+" "+wjQuery(".timing-dropdown-btn").val());
                            // self.convertedStudentObj[index].end =  new Date(objNewSession.hub_session_date+" "+wjQuery(".excuse-to-timepicker-input").text());
                            self.convertedStudentObj[index].startHour = self.convertedStudentObj[index].start;
                            if (responseObj.hub_studentsessionid) {
                                self.convertedStudentObj[index].sessionId = responseObj.hub_studentsessionid;
                            }
                            if (responseObj['hub_sessiontype']) {
                                self.convertedStudentObj[index].sessiontype = responseObj['hub_sessiontype'];
                            }
                            if (responseObj['hub_session_status']) {
                                self.convertedStudentObj[index].sessionStatus = responseObj['hub_session_status'];
                            }
                            if (responseObj['hub_student_session@odata.bind']) {
                                self.convertedStudentObj[index]['studentSession'] = responseObj['hub_student_session@odata.bind'];
                            }
                            if (responseObj['hub_master_schedule@odata.bind']) {
                                self.convertedStudentObj[index]['masterScheduleId'] = responseObj['hub_master_schedule@odata.bind'];
                            }
                            if (responseObj['hub_sourceapplicationid']) {
                                self.convertedStudentObj[index]['sourceAppId'] = responseObj['hub_sourceapplicationid'];
                            }
                            setTimeout(function () {
                                self.pushStudentToSOF(self.convertedStudentObj[index]);
                                self.populateSOFPane(self.sofList, self.calendarOptions.minTime, self.calendarOptions.maxTime);
                                self.openSofPane();
                            }, 500);
                            // self.convertedStudentObj.splice(index, 1);
                        }

                        wjQuery("#excuseModal").dialog("close");
                        var prevEventId = wjQuery(element).attr("eventid");
                        var prevEvent = self.calendar.fullCalendar('clientEvents', prevEventId);
                        self.updatePrevStudentEvent(prevEvent, uniqueIds[0], prevEventId, element);
                    } else {
                        if (wjQuery('#error_block').text() == '') {
                            wjQuery('#error_block').text('All Fields are mandatory');
                            wjQuery('#error_block').css('color', 'red');
                        }
                    }
                }
                else {
                    if (wjQuery('#error_block').text() == '') {
                        wjQuery('#error_block').text(responseObj);
                        wjQuery('#error_block').css('color', 'red');
                    }
                }
                wjQuery('.loading').hide();
            });
        }
        self.openSofPane();
        self.showConflictMsg();
        self.draggable('draggable');
        wjQuery('.loading').hide();
    };

    //
    //  This Method is to add the context menu(Right CLick options) for Student and Teacher
    //
    this.addContext = function (uniqueId, labelFor, isPinned, deliveryType, sessionStatus, sessionType, isAttended, studUniqueId) {
        var self = this;
        var currentView = self.calendar.fullCalendar('getView');
        var obj = {};
        if (labelFor == 'student') {
            var resourceObj = self.getResourceObj(uniqueId.split("_")[1]);
            if ((sessionStatus == SCHEDULE_STATUS || sessionStatus == undefined) &&
                sessionType != FLOAT_TYPE &&
                sessionType != MAKEUP_TYPE) {
                obj.unpin = {
                    name: "Unpin",
                    disabled: self.checkAccountClosure()
                };
                obj.unpin.visible = true;
                obj.unpin.callback = function (key, options) {
                    wjQuery(".loading").show();
                    options = wjQuery.extend(true, {}, options);
                    setTimeout(function () {
                        if (obj.unpin.visible) {
                            obj.unpin.visible = false;
                            obj.pin.visible = true;
                            self.unPinStudent(options.$trigger[0]);
                        }
                    }, 300);
                }
                obj.pin = {
                    name: "Pin",
                    disabled: self.checkAccountClosure()
                };
                obj.pin.visible = true;
                obj.pin.callback = function (key, options) {
                    wjQuery(".loading").show();
                    options = wjQuery.extend(true, {}, options);
                    setTimeout(function () {
                        if (obj.pin.visible) {
                            obj.unpin.visible = true;
                            obj.pin.visible = false;
                            self.pinStudent(options.$trigger[0]);
                        }
                    }, 300);
                }

                if (isPinned) {
                    obj.unpin.visible = true;
                    obj.pin.visible = false;
                }
                else {
                    obj.unpin.visible = false;
                    obj.pin.visible = true;
                }
            }
            if (deliveryType == personalInstruction) {
                if(sessionType != MAKEUP_TYPE ){
                    obj.omit = {
                        name: "Omit",
                        disabled: self.checkAccountClosure(),
                        callback: function (key, options) {
                            wjQuery(".loading").show();
                            options = wjQuery.extend(true, {}, options);
                            setTimeout(function () {
                                var studUniqueId = wjQuery(options.$trigger[0]).attr("studUniqueId");
                                var objStudent = self.convertedStudentObj.filter(function (x) {
                                    return x.studUniqueId == studUniqueId
                                });
                                if (objStudent[0] && objStudent[0].sourceAppId == SIMPLICITY_STATUS) {
                                    self.omitConfirmPopup(options.$trigger[0], OMIT_STATUS);
                                } else {
                                    self.omitStudentFromSession(options.$trigger[0], OMIT_STATUS);
                                }
                            }, 300);
                        }
                    }
                }

                obj.excuse = {
                    name: "Excuse",
                    disabled: self.checkAccountClosure(),
                    // disabled:MAKEUP_TYPE == sessionType,
                    callback: function (key, options) {
                        wjQuery(".loading").show();
                        options = wjQuery.extend(true, {}, options);
                        setTimeout(function () {
                            self.excuseStudentFromSession(options.$trigger[0]);
                        }, 300);
                    }
                }
                obj.moveToSof = {
                    name: "Move to SOF",
                    disabled: self.checkAccountClosure(),
                    callback: function (key, options) {
                        wjQuery(".loading").show();
                        options = wjQuery.extend(true, {}, options);
                        setTimeout(function () {
                            self.moveStudentToSOF(options.$trigger[0]);
                        }, 300);
                    }
                }

                wjQuery.contextMenu('destroy', 'span[studUniqueId="' + studUniqueId + '"]');
                wjQuery.contextMenu({
                    selector: 'span[studUniqueId="' + studUniqueId + '"]',
                    build: function ($trigger, e) {
                        return {
                            items: obj
                        };
                    }
                });
            }
            else if (deliveryType == groupFacilitation) {
                obj.reschedule = {
                    name: "Reschedule",
                    disabled: self.checkAccountClosure(),
                    callback: function (key, options) {
                        wjQuery(".loading").show();
                        options = wjQuery.extend(true, {}, options);
                        setTimeout(function () {
                            self.rescheduleStudentSession(options.$trigger[0]);
                        }, 300);
                    }
                }
                obj.omit = {
                    name: "Omit",
                    disabled: self.checkAccountClosure(),
                    callback: function (key, options) {
                        wjQuery(".loading").show();
                        options = wjQuery.extend(true, {}, options);
                        setTimeout(function () {
                            var studUniqueId = wjQuery(options.$trigger[0]).attr("studUniqueId");
                            var objStudent = self.convertedStudentObj.filter(function (x) {
                                return x.studUniqueId == studUniqueId
                            });
                            if (objStudent[0] && objStudent[0].sourceAppId == SIMPLICITY_STATUS) {
                                self.omitConfirmPopup(options.$trigger[0], OMIT_STATUS);
                            } else {
                                self.omitStudentFromSession(options.$trigger[0], OMIT_STATUS);
                            }
                        }, 300);
                    }
                }
                obj.moveToSof = {
                    name: "Move to SOF",
                    disabled: self.checkAccountClosure(),
                    callback: function (key, options) {
                        wjQuery(".loading").show();
                        options = wjQuery.extend(true, {}, options);
                        setTimeout(function () {
                            self.moveStudentToSOF(options.$trigger[0]);
                        }, 300);
                    }
                }
                wjQuery.contextMenu('destroy', 'span[studUniqueId="' + studUniqueId + '"]');
                wjQuery.contextMenu({
                    selector: 'span[studUniqueId="' + studUniqueId + '"]',
                    build: function ($trigger, e) {
                        return {
                            items: obj
                        };
                    }
                });
            }
            else if (deliveryType == groupInstruction) {
                obj.omit = {
                    name: "Omit",
                    disabled: self.checkAccountClosure(),
                    callback: function (key, options) {
                        wjQuery(".loading").show();
                        options = wjQuery.extend(true, {}, options);
                        setTimeout(function () {
                            var studUniqueId = wjQuery(options.$trigger[0]).attr("studUniqueId");
                            var objStudent = self.convertedStudentObj.filter(function (x) {
                                return x.studUniqueId == studUniqueId
                            });
                            if (objStudent[0] && objStudent[0].sourceAppId == SIMPLICITY_STATUS) {
                                self.omitConfirmPopup(options.$trigger[0], OMIT_STATUS);
                            } else {
                                self.omitStudentFromSession(options.$trigger[0], OMIT_STATUS);
                            }
                        }, 300);
                    }
                }
                wjQuery.contextMenu('destroy', 'span[studUniqueId="' + studUniqueId + '"]');
                wjQuery.contextMenu({
                    selector: 'span[studUniqueId="' + studUniqueId + '"]',
                    build: function ($trigger, e) {
                        return {
                            items: obj
                        };
                    }
                });
            }
            if (sessionStatus != INVALID_STATUS) {
                var currentCalendarDate = self.calendar.fullCalendar('getDate');
                var setVisibility = (self.checkAccountClosure() || currentCalendarDate.getTime() > new Date().getTime());
                    obj.attended = {
                        name: "Attended",
                        disabled: setVisibility,
                        visible: !isAttended,
                        callback: function (key, options) {
                            wjQuery(".loading").show();
                            options = wjQuery.extend(true, {}, options);
                            setTimeout(function () {
                                if (obj.attended.visible) {
                                    obj.attended.visible = false;
                                    self.omitStudentFromSession(options.$trigger[0], "attended");
                                }
                            }, 300);
                        }
                    }
                    obj.unExcused = {
                        name: "Un-Excuse",
                        disabled: setVisibility,
                        visible: sessionStatus != UNEXCUSED_STATUS,
                        callback: function (key, options) {
                            wjQuery(".loading").show();
                            options = wjQuery.extend(true, {}, options);
                            setTimeout(function () {
                                self.omitStudentFromSession(options.$trigger[0],UNEXCUSED_STATUS);
                            }, 300);
                        }
                    }
            }
        }
        else if (labelFor == 'teacher') {
            if ((sessionStatus == undefined || sessionStatus == SCHEDULE_STATUS) && sessionStatus != FLOAT_TEACHER_TYPE) {
                obj.pin = {
                    "name": "Pin",
                    "visible": true,
                    callback: function (key, options) {
                        wjQuery(".loading").show();
                        options = wjQuery.extend(true, {}, options);
                        setTimeout(function () {
                            if (obj.pin.visible) {
                                obj.unpin.visible = true;
                                obj.pin.visible = false;
                                self.pinTeacher(options.$trigger[0]);
                            }
                        }, 300);
                    }
                };
                obj.unpin = {
                    "name": "Unpin",
                    "visible": false,
                    callback: function (key, options) {
                        wjQuery(".loading").show();
                        options = wjQuery.extend(true, {}, options);
                        setTimeout(function () {
                            if (obj.unpin.visible) {
                                obj.unpin.visible = false;
                                obj.pin.visible = true;
                                self.unPinTeacher(options.$trigger[0]);
                            }
                        }, 300);
                    }
                };
                if (isPinned) {
                    obj.unpin.visible = true;
                    obj.pin.visible = false;
                }
                else {
                    obj.unpin.visible = false;
                    obj.pin.visible = true;
                }
            }
            obj.moveToSof = {
                name: "Remove",
                callback: function (key, options) {
                    wjQuery(".loading").show();
                    options = wjQuery.extend(true, {}, options);
                    setTimeout(function () {
                        self.removeTeacher(options.$trigger[0]);
                    }, 300);
                }
            }
            wjQuery.contextMenu('destroy', 'span[uniqueId="' + uniqueId + '"]');
            wjQuery.contextMenu({
                selector: 'span[uniqueId="' + uniqueId + '"]',
                build: function ($trigger, e) {
                    return {
                        items: obj
                    };
                }
            });
        } else if (labelFor == "studentPlaceholder") {
            if (deliveryType != groupInstruction) {
                if (deliveryType == personalInstruction) {
                    obj.makeup = {
                        name: "Makeup",
                        disabled: self.checkAccountClosure(),
                        callback: function (key, options) {
                            wjQuery(".loading").show();
                            options = wjQuery.extend(true, {}, options);
                            setTimeout(function () {
                                currentView = self.calendar.fullCalendar('getView');
                                var startDate = moment(currentView.start).format("YYYY-MM-DD");
                                var locationObj = self.getLocationObject(self.locationId);
                                if (locationObj['_hub_parentcenter_value'] != undefined) {
                                    self.makeupPopup(data.getMakeupNFloat({ "hub_center@odata.bind": self.locationId, "isForMakeup": true, "hub_date": startDate, "hub_parentcenter": locationObj['_hub_parentcenter_value'] }), options.$trigger[0], true);
                                } else {
                                    self.makeupPopup(data.getMakeupNFloat({ "hub_center@odata.bind": self.locationId, "isForMakeup": true, "hub_date": startDate }), options.$trigger[0], true);
                                }
                            }, 300);
                        }
                    }
                    // float menu
                    obj.float = {
                        name: "Float",
                        disabled: self.checkAccountClosure(),
                        callback: function (key, options) {
                            wjQuery(".loading").show();
                            options = wjQuery.extend(true, {}, options);
                            setTimeout(function () {
                                currentView = self.calendar.fullCalendar('getView');
                                var startDate = moment(currentView.start).format("YYYY-MM-DD");
                                var locationObj = self.getLocationObject(self.locationId);
                                if (locationObj['_hub_parentcenter_value'] != undefined) {
                                    self.makeupPopup(data.getMakeupNFloat({ "hub_center@odata.bind": self.locationId, "isForMakeup": false, "hub_date": startDate, "hub_parentcenter": locationObj['_hub_parentcenter_value'] }), options.$trigger[0], false);
                                } else {
                                    self.makeupPopup(data.getMakeupNFloat({ "hub_center@odata.bind": self.locationId, "isForMakeup": false, "hub_date": startDate }), options.$trigger[0], false);
                                }
                            }, 300);
                        }
                    }
                    wjQuery.contextMenu('destroy', '.student-placeholder-Personal-Instruction');
                    wjQuery.contextMenu({
                        selector: '.student-placeholder-Personal-Instruction',
                        build: function ($trigger, e) {
                            return {
                                items: obj
                            };
                        }
                    });
                } else {
                    // float menu Only For GF
                    obj.float = {
                        name: "Float",
                        disabled: self.checkAccountClosure(),
                        callback: function (key, options) {
                            wjQuery(".loading").show();
                            options = wjQuery.extend(true, {}, options);
                            setTimeout(function () {
                                currentView = self.calendar.fullCalendar('getView');
                                var startDate = moment(currentView.start).format("YYYY-MM-DD");
                                var locationObj = self.getLocationObject(self.locationId);
                                if (locationObj['_hub_parentcenter_value'] != undefined) {
                                    self.makeupPopup(data.getMakeupNFloat({ "hub_center@odata.bind": self.locationId, "isForMakeup": false, "hub_date": startDate, "hub_parentcenter": locationObj['_hub_parentcenter_value'] }), options.$trigger[0], false);
                                } else {
                                    self.makeupPopup(data.getMakeupNFloat({ "hub_center@odata.bind": self.locationId, "isForMakeup": false, "hub_date": startDate }), options.$trigger[0], false);
                                }
                            });
                        }
                    }
                    wjQuery.contextMenu('destroy', '.student-placeholder-Group-Facilitation');
                    wjQuery.contextMenu({
                        selector: '.student-placeholder-Group-Facilitation',
                        build: function ($trigger, e) {
                            return {
                                items: obj
                            };
                        }
                    });
                }
            }
        } else if (labelFor == "teacherPlaceholder") {
            // float menu
            obj.float = {
                name: "Float",
                disabled: self.checkAccountClosure(),
                callback: function (key, options) {
                    wjQuery(".loading").show();
                    currentView = self.calendar.fullCalendar('getView');
                    var startDate = moment(currentView.start).format("YYYY-MM-DD");
                    var locationObj = self.getLocationObject(self.locationId);
                    options = wjQuery.extend(true, {}, options);
                    setTimeout(function () {
                        var locationObj = self.getLocationObject(self.locationId);
                        var teacherFloatResp = data.getFLoatTeacher(self.locationId, startDate, startDate, locationObj['_hub_parentcenter_value']);
                        self.floatTeacher(teacherFloatResp, options.$trigger[0]);
                    }, 500)
                }
            }
            wjQuery.contextMenu('destroy', '.teacher-placeholder');
            wjQuery.contextMenu({
                selector: '.teacher-placeholder',
                build: function ($trigger, e) {
                    return {
                        items: obj
                    };
                }
            });
        }
    };

    this.omitConfirmPopup = function (element, status) {
        var self = this;
        wjQuery("#dialog > .dialog-msg").text("This session was paid and migrated from Symplicity, please make sure to add Account Credit.");
        wjQuery("#dialog").dialog({
            resizable: false,
            height: "auto",
            width: 350,
            modal: true,
            draggable: false,
            show: {
                effect: 'slide',
                complete: function () {
                    wjQuery(".loading").hide();
                }
            },
            buttons: {
                Yes: function () {
                    wjQuery(this).dialog("close");
                    self.omitStudentFromSession(element, OMIT_STATUS);
                },
                No: function () {
                    wjQuery(this).dialog("close");
                }
            }
        });
    }

    //
    //  This Method is to move student from session to sof pane on right click option moveStudentToSOF
    //
    this.moveStudentToSOF = function (element) {
        var self = this;
        var uniqueIds = wjQuery(element).attr("uniqueId").split('_');
        var studUniqueId = wjQuery(element).attr("studUniqueId");
        var h = new Date(uniqueIds[2]).getHours();
        var uniqueId = wjQuery(element).attr('uniqueId');
        var startTime = uniqueId.split('_')[2];

        if (h > 12) {
            h -= 12;
        }
        var objStudent = self.convertedStudentObj.filter(function (x) {
        //     return x.id == uniqueIds[0] &&
        //            x.resourceId == uniqueIds[1] &&
        //            x.startHour.getTime() == new Date(uniqueIds[2]).getTime();
            return x.studUniqueId == studUniqueId;
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
            objMovetoSOF.hub_isattended = objStudent[0]['isAttended'];
            objMovetoSOF['hub_resourceid@odata.bind'] = null;
            if (objStudent[0].hasOwnProperty('resourceId')) {
                delete objStudent[0]['resourceId'];
            }
            var locationObj = self.getLocationObject(self.locationId);
            objMovetoSOF['ownerObj'] = locationObj['ownerObj'];
            if (objStudent[0]['studentSession']) {
                objMovetoSOF['hub_student_session@odata.bind'] = objStudent[0]['studentSession'];
            }
            if (objStudent[0]['masterScheduleId']) {
                objMovetoSOF['hub_master_schedule@odata.bind'] = objStudent[0]['masterScheduleId'];
            }
            if (objStudent[0]['sourceAppId']) {
                objMovetoSOF['hub_sourceapplicationid'] = objStudent[0]['sourceAppId'];
            }
            var responseObj = data.moveStudentToSOF(objMovetoSOF);
            if ((typeof (responseObj) == 'boolean' && responseObj )|| typeof (responseObj) == 'object') {
                if (responseObj.hasOwnProperty('hub_studentsessionid')) {
                    objStudent[0]['sessionId'] = responseObj['hub_studentsessionid'];
                    objStudent[0]['resourceId'] = responseObj['hub_resourceid@odata.bind'];
                    objStudent[0]['sessiontype'] = responseObj['hub_sessiontype'];
                    objStudent[0]['sessionStatus'] = responseObj['hub_session_status'];
                    delete objStudent[0]['isFromMasterSchedule'];
                }
                if (responseObj['hub_student_session@odata.bind']) {
                    objStudent[0]['studentSession'] = responseObj['hub_student_session@odata.bind'];
                }
                if (responseObj['hub_master_schedule@odata.bind']) {
                    objStudent[0]['masterScheduleId'] = responseObj['hub_student_session@odata.bind'];
                }
                if (responseObj['hub_sourceapplicationid']) {
                    objStudent[0]['sourceAppId'] = responseObj['hub_sourceapplicationid'];
                }
                var index = -1;
                for (var i = 0; i < self.convertedStudentObj.length; i++) {
                    if(studUniqueId == self.convertedStudentObj[i]['studUniqueId']){
                        index = i;
                        break;
                    }
                    // if (self.convertedStudentObj[i].id == uniqueIds[0] &&
                    //    self.convertedStudentObj[i].resourceId == uniqueIds[1] &&
                    //    self.convertedStudentObj[i].startHour.getTime() == new Date(uniqueIds[2]).getTime()) {
                    //     index = i;
                    //     break;
                    // }
                }
                if (index != -1) {
                    element.remove();
                    self.convertedStudentObj.splice(index, 1);
                    setTimeout(function () {
                        self.pushStudentToSOF(objStudent[0]);
                        if (self.sofList['Personal Instruction'].length > 0 || self.sofList['Group Instruction'].length > 0 || self.sofList['Group Facilitation'].length > 0) {
                            self.populateSOFPane(self.sofList, self.calendarOptions.minTime, self.calendarOptions.maxTime);
                            self.openSofPane();
                        }
                    }, 500);
                    var prevEventId = wjQuery(element).attr("eventid");
                    var prevEvent = self.calendar.fullCalendar('clientEvents', prevEventId);
                    self.updatePrevStudentEvent(prevEvent, uniqueIds[0], prevEventId, element);
                }
            }
        }
        self.openSofPane();
        self.showConflictMsg();
        self.draggable('draggable');
        wjQuery('.loading').hide();
    };

    //
    // This function adds draggable event to Student/Teacher DOM element 
    // 
    this.draggable = function (selector) {
        var self = this;
        wjQuery('.' + selector).draggable({
            revert: true,
            revertDuration: 0,
            appendTo: '#scrollarea',
            helper: 'clone',
            cursor: "move",
            scroll: true,
            cursorAt: { top: 0 },
            /* drag: function () {
                 if (sofExpanded) {
                     wjQuery('.sof-pane').css('opacity', '.1');
                 }
                 if (taExpanded) {
                     wjQuery('.ta-pane').css('opacity', '.1');
                 }
             },*/
            stop: function () {
                if (sofExpanded) {
                    wjQuery('.sof-pane').css('opacity', '1');
                }
                if (saExpanded) {
                    wjQuery('.sa-pane').css('opacity', '1');
                }
                if (taExpanded) {
                    wjQuery('.ta-pane').css('opacity', '1');
                }
            }
        });
        wjQuery('.' + selector).bind("drag", function (event, ui) {
            if (sofExpanded) {
                wjQuery('.sof-pane').css('opacity', '.1');
            }
            if (saExpanded) {
                wjQuery('.sa-pane').css('opacity', '.1');
            }
            if (taExpanded) {
                wjQuery('.ta-pane').css('opacity', '.1');
            }
            var elm = ui.helper;
            setTimeout(function () {
                var name;
                if (wjQuery(event.currentTarget).hasClass("teacher-container") && wjQuery(event.currentTarget).children()[0]) {
                    name = wjQuery(event.currentTarget).children().find("span:not(.teacherTimingDetails)")[0].innerHTML;
                } else if(wjQuery(event.currentTarget).find(".timingDetail").length){
                    name = wjQuery(event.currentTarget).find("span:not(.timingDetail)")[0].innerHTML;
                }else {
                    var rawText = wjQuery(event.currentTarget).text();
                    rawText = rawText.split(",");
                    name = rawText[0]
                    if (rawText[1]) {
                        name += ", " + rawText[1].replace("location_on","").slice(1,2);
                    }
                }
                wjQuery(elm).text(name + " (Starting at " + self.helperStartTime + ")");
            }, 30);
        });
        wjQuery('.drag-student').off('dblclick').on('dblclick', function (e) {
            self.findStudentEnrollment(this);
        });
    };

    this.findStudentEnrollment = function (element) {
        var self = this;
        var uniqueIds = wjQuery(element).attr("uniqueId").split('_');
        var studUniqueId = wjQuery(element).attr("studUniqueId");
        var objStudent = this.convertedStudentObj.filter(function (x) {
        //     return x.id == uniqueIds[0] &&
        //            x.resourceId == uniqueIds[1] &&
        //            x.startHour.getTime() == new Date(uniqueIds[2]).getTime();
                return x.studUniqueId == studUniqueId
        });

        if (objStudent.length) {
            data.openEnrollment(objStudent[0].enrollmentId);
        }
    };

    this.convertPinnedData = function (data, isFromSave) {
        var self = this;
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
                centerId: data['_hub_center_value'],
                centerName: data['_hub_center_value@OData.Community.Display.V1.FormattedValue'],
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
                        centerId: data[i]['_hub_center_value'],
                        centerName: data[i]['_hub_center_value@OData.Community.Display.V1.FormattedValue'],
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
        var self = this;
        var resourceObj = {};
        wjQuery.each(this.resourceList, function (k, v) {
            if (resourceId == v.id) {
                resourceObj = v;
            }
        });
        return resourceObj;
    }

    this.getDeliveryTypeVal = function (deliveryTypeId) {
        var self = this;
        var deliveryTypeCode = "";
        wjQuery.each(this.resourceList, function (k, v) {
            if (deliveryTypeId == v.deliveryTypeId) {
                deliveryTypeCode = v.deliveryTypeCode;
            }
        });
        return deliveryTypeCode;
    }

    this.saveStudentToSession = function (prevStudent, newStudent) {
        var self = this;
        var objPrevSession = {};
        var objNewSession = {};
        if (prevStudent != undefined) {
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
                objPrevSession['hub_isattended'] = prevStudent['isAttended'];
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
                objNewSession['hub_isattended'] = newStudent['isAttended'];
            }

            if (prevStudent['makeupExpiryDate']) {
                objNewSession['hub_makeup_expiry_date'] = moment(prevStudent['makeupExpiryDate']).format('YYYY-MM-DD');
                objPrevSession['hub_makeup_expiry_date'] = moment(prevStudent['makeupExpiryDate']).format('YYYY-MM-DD');
            }

            objPrevSession['hub_enrollment@odata.bind'] = prevStudent['enrollmentId'];
            objPrevSession['hub_deliverytype'] = prevStudent['deliveryTypeId'];
            objPrevSession['hub_service@odata.bind'] = prevStudent['serviceId'];
            objPrevSession['hub_student@odata.bind'] = prevStudent['id'];
            objPrevSession['hub_center@odata.bind'] = prevStudent["locationId"];
            objPrevSession['hub_deliverytype@OData.Community.Display.V1.FormattedValue'] = prevStudent['deliveryType'];
            objPrevSession['hub_deliverytype_code'] = newStudent.deliveryTypeCode;

            objNewSession['hub_center@odata.bind'] = prevStudent["locationId"];
            objNewSession['hub_enrollment@odata.bind'] = prevStudent['enrollmentId'];
            objNewSession['hub_student@odata.bind'] = prevStudent['id'];
            objNewSession['hub_service@odata.bind'] = prevStudent['serviceId'];

            objNewSession['hub_resourceid@odata.bind'] = newStudent.resourceId;
            objNewSession['hub_session_date'] = moment(newStudent.startHour).format('YYYY-MM-DD');
            objNewSession['hub_start_time'] = this.convertToMinutes(moment(newStudent.start).format("h:mm A"));
            objNewSession['hub_end_time'] = objNewSession['hub_start_time'] + prevStudent.duration;
            objNewSession['hub_deliverytype'] = newStudent.deliveryTypeId;
            objNewSession['hub_deliverytype@OData.Community.Display.V1.FormattedValue'] = newStudent.deliveryType;
            objNewSession['hub_deliverytype_code'] = newStudent.deliveryTypeCode;
            if (prevStudent.studentSession) {
                objNewSession['hub_student_session@odata.bind'] = prevStudent.studentSession;
                objPrevSession['hub_student_session@odata.bind'] = prevStudent.studentSession;
            }
            if (prevStudent.masterScheduleId) {
                objNewSession['hub_master_schedule@odata.bind'] = prevStudent.masterScheduleId;
                objPrevSession['hub_master_schedule@odata.bind'] = prevStudent.masterScheduleId;
            }
            if (prevStudent.sourceAppId) {
                objNewSession['hub_sourceapplicationid'] = prevStudent.sourceAppId;
                objPrevSession['hub_sourceapplicationid'] = prevStudent.sourceAppId;
            }

            // Get location object
            var locationObj = self.getLocationObject(self.locationId);
            objNewSession['ownerObj'] = locationObj['ownerObj'];
            objPrevSession['ownerObj'] = locationObj['ownerObj'];
            return data.saveStudenttoSession(objPrevSession, objNewSession);
            
        }
    }

    this.saveTeacherToSession = function (teacher, prevTeacher, notAvailable) {
        var self = this;
        var objPrevSession = {};
        var objNewSession = {};
        if (teacher != undefined) {
            if (prevTeacher['isFromMasterSchedule']) {
            }
            else {
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
            if (teacher.end == undefined) {
                objNewSession['hub_end_time'] = objNewSession['hub_start_time'] + 60;
            } else {
                objNewSession['hub_end_time'] = this.convertToMinutes(moment(teacher.end).format("h:mm A"));
            }

            if (notAvailable) {
                objNewSession['hub_schedule_type'] = FLOAT_TEACHER_TYPE;
            } else {
                objNewSession['hub_schedule_type'] = teacher['scheduleType'] == undefined ? SCHEDULE_STATUS : teacher['scheduleType'];
            }

            // Get location Object
            var locationObj = self.getLocationObject(self.locationId);
            objNewSession['ownerObj'] = locationObj['ownerObj'];
            objNewSession['hub_centerid'] = locationObj['hub_centerid'];
            objPrevSession['ownerObj'] = locationObj['ownerObj'];
            objPrevSession['hub_centerid'] = locationObj['hub_centerid'];
            return data.saveTeachertoSession(objPrevSession, objNewSession);
        }
    }

    this.studentSessionCnfmPopup = function (t, date, allDay, ev, ui, resource, elm, message) {
        var self = this;
        wjQuery("#dialog > .dialog-msg").text(message);
        wjQuery("#dialog").dialog({
            resizable: false,
            height: "auto",
            width: 350,
            draggable: false,
            modal: true,
            show: {
                effect: 'slide',
                complete: function() {
                    wjQuery(".loading").hide();
                }
            },
            buttons: {
                Yes: function () {
                    wjQuery(this).dialog("close");
                    t.studentSessionConflictCheck(t, date, allDay, ev, ui, resource, elm);
                },
                No: function () {
                    wjQuery(this).dialog("close");
                }
            }
        });
    }

    this.studentSofCnfmPopup = function (t, date, allDay, ev, ui, resource, elm, message) {
        var self = this;
        wjQuery("#dialog > .dialog-msg").text(message);
        wjQuery("#dialog").dialog({
            resizable: false,
            height: "auto",
            width: 350,
            modal: true,
            draggable:false,
            show: {
                effect: 'slide',
                complete: function() {
                    wjQuery(".loading").hide();
                }
            },
            buttons: {
                Yes: function () {
                    wjQuery(this).dialog("close");
                    t.studentSofConflictCheck(t, date, allDay, ev, ui, resource, elm);
                },
                No: function () {
                    wjQuery(this).dialog("close");
                }
            }
        });
    }

    this.teacherSessionCnfmPopup = function (t, date, allDay, ev, ui, resource, elm, message, notAvailable) {
        var self = this;
        wjQuery("#dialog > .dialog-msg").text(message);
        wjQuery("#dialog").dialog({
            resizable: false,
            height: "auto",
            width: 350,
            modal: true,
            draggable:false,
            show: {
                effect: 'slide',
                complete: function() {
                    wjQuery(".loading").hide();
                }
            },
            buttons: {
                Yes: function () {
                    wjQuery(this).dialog("close");
                    t.teacherSessionConflictCheck(t, date, allDay, ev, ui, resource, elm, notAvailable);
                },
                No: function () {
                    wjQuery(this).dialog("close");
                }
            }
        });
    }

    this.taPaneCnfmPopup = function (t, date, allDay, ev, ui, resource, elm, message, notAvailable, eventDuration) {
        var self = this;
        wjQuery("#dialog > .dialog-msg").text(message);
        wjQuery("#dialog").dialog({
            resizable: false,
            height: "auto",
            width: 350,
            modal: true,
            draggable:false,
            show: {
                effect: 'slide',
                complete: function() {
                    wjQuery(".loading").hide();
                }
            },
            buttons: {
                Yes: function () {
                    wjQuery(this).dialog("close");
                    t.tapaneConflictCheck(t, date, allDay, ev, ui, resource, elm, notAvailable,eventDuration);
                },
                No: function () {
                    wjQuery(this).dialog("close");
                }
            }
        });
    }

    this.prompt = function (message) {
        var self = this;
        wjQuery("#dialog > .dialog-msg").html(message);
        wjQuery("#dialog").dialog({
            resizable: false,
            height: "auto",
            width: 400,
            modal: true,
            draggable:false,
            show: {
                effect: 'slide',
                complete: function () {
                    wjQuery(".loading").hide();
                }
            },
            buttons: {
                Close: function () {
                    wjQuery(this).dialog("close");
                }
            }
        });
    }

    this.getProgramObj = function (teacherId) {
        var self = this;
        var programObj = [];
        this.staffProgram.map(function (x) {
            if (x.astaffprogram_x002e_hub_staffid == teacherId) {
                var PrograExist = programObj.map(function (y) {
                    return y;
                }).indexOf(x['hub_programid']);
                if (PrograExist == -1) {
                    var obj = {
                        id: x['hub_programid'],
                        name: x['hub_name'],
                        color: x['hub_color']
                    }
                    programObj.push(obj);
                }
            }
        }).indexOf(teacherId);
        return programObj;
    }

    this.showConflictMsg = function () {
        var self = this;
        wjQuery(".sof-btn, .fc-event,.info-icon, .onetoone, .serviceIndicator").tooltip({
            tooltipClass: "custom-conflict",
            track: true,
            content: function () {
                return wjQuery(this).prop('title').replace('|', '<br/>');
            }
        });
    }

    // Conflict messages update method
    this.updateConflictMsg = function (event) {
        var self = this;
        var msg = "";
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
            var uniqueNames = [];
            $.each(event.conflictMsg, function (i, el) {
                if ($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
            });
            wjQuery.each(uniqueNames, function (k, v) {
                msg += (k + 1) + ". " + self.conflictMsg[v] + "|";
            });
            var lastIndex = msg.lastIndexOf("|");
            msg = msg.substring(0, lastIndex);
            if (event.title.indexOf('<img class="conflict" title="' + msg + '" src="/webresources/hub_/calendar/images/warning.png">') == -1) {
                event.title += '<img class="conflict" title="' + msg + '" src="/webresources/hub_/calendar/images/warning.png">';
            }
        }
        else {

        }
    }

    this.makeupPopup = function (makeupList, placeholderEvent, isForMakeup) {
        var self = this;
        makeupList = (makeupList == null || makeupList == undefined) ? [] : makeupList;
        makeupList = this.getUniqueFromMakeupNFloat(this.convertMakeupNFloatObj(makeupList));
        self.makeupList = makeupList;
        var selectedPlaceHolder = wjQuery(placeholderEvent).prev("span").attr("uniqueid");
        if (selectedPlaceHolder != undefined) {
            var idArry = selectedPlaceHolder.split('_');
            if (makeupList.length) {
                wjQuery("#makeup > .error_block").html("");
                wjQuery("#makeup .makeup-lst").html("");
                wjQuery("#makeup input").val("");
                wjQuery("#makeup").dialog({
                    resizable: false,
                    height: 300,
                    width: 350,
                    modal: true,
                    draggable:false,
                    show: {
                        effect: 'slide',
                        complete: function () {
                            wjQuery(".loading").hide();
                        }
                    },
                    buttons: {
                        Cancel: function () {
                            wjQuery(this).dialog("close");
                        }
                    }
                });

                if (isForMakeup) {
                    wjQuery("#makeup").dialog('option', 'title', 'Add Makeup');
                } else {
                    wjQuery("#makeup").dialog('option', 'title', 'Add Float');
                }
                self.makeUpItemPopulation(makeupList);
                self.makeupSearch(makeupList, idArry, isForMakeup);
                self.makeupClickEvent(makeupList, idArry, isForMakeup);
            } else {
                wjQuery("#makeup .error_block").html("");
                wjQuery("#makeup .makeup-lst").html('No Students found');
                wjQuery("#makeup").dialog({
                    resizable: false,
                    height: 300,
                    width: 350,
                    draggable:false,
                    modal: true,
                    show: {
                        effect: 'slide',
                        complete: function () {
                            wjQuery(".loading").hide();
                        }
                    },
                    buttons: {
                        Cancel: function () {
                            wjQuery(this).dialog("close");
                        }
                    }
                });
                if (isForMakeup) {
                    wjQuery("#makeup").dialog('option', 'title', 'Add Makeup');
                } else {
                    wjQuery("#makeup").dialog('option', 'title', 'Add Float');
                }
            }
        } else {
            wjQuery("#makeup").dialog("close");
            wjQuery(".loading").hide();
        }
    }

    this.makeupSearch = function(makeupList, idArry, isForMakeup){
        var self = this;
        wjQuery("#searchMakeup").keyup(function (event) {
            var searchVal = wjQuery(this).val();
            if(searchVal.length){
                var filtertedList = [];
                filtertedList = self.makeupList.filter(function (object) {
                    if (object.fullName) {
                        return object.fullName.toLowerCase().search(searchVal.toLowerCase()) != -1;
                    }
                });
                self.makeUpItemPopulation(filtertedList);
                self.makeupClickEvent(filtertedList, idArry, isForMakeup);
            }else{
                self.makeUpItemPopulation(makeupList);
                self.makeupClickEvent(makeupList, idArry, isForMakeup);
            }
        });
    }

    this.floatSearch = function(floarList, idArry){
        var self = this;
        wjQuery("#searchMakeup").keyup(function (event) {
            var searchVal = wjQuery(this).val();
            if(searchVal.length){
                var filtertedList = [];
                filtertedList = floarList.filter(function (object) {
                    if (object.hub_name) {
                        return object.hub_name.toLowerCase().search(searchVal.toLowerCase()) != -1;
                    }
                });
                self.floatItemPopulation(filtertedList);
                self.floatClickEvent(filtertedList, idArry);
            }else{
                self.floatItemPopulation(floarList);
                self.floatClickEvent(floarList, idArry);
            }
        });
    }

    this.makeUpItemPopulation = function(makeupList){
        var self = this;
        var list = "";
        wjQuery("#makeup .makeup-lst").html("");
        wjQuery.each(makeupList, function (k, v) {
            list += "<li id='" + v.enrollmentId + "' class='makeup-item' >" + v.fullName + ", " + v.grade + "</li>";
        });
        wjQuery("#makeup .makeup-lst").html(list);
    }


    this.floatItemPopulation = function(floatTeacherObj){
        var self = this;
        var list = "";
        wjQuery("#makeup .makeup-lst").html("");
        wjQuery.each(floatTeacherObj, function (k, v) {
            list += "<li id='" + v.hub_staffid + "' class='float-item' >" + v.hub_name + "</li>";
        });
        wjQuery("#makeup .makeup-lst").html(list);
    }

    this.makeupClickEvent = function(makeupList, idArry, isForMakeup){
        var self = this;
        // On click Makeup student save makeup session will be called
        wjQuery(".makeup-item").click(function (event) {
            var objSession = {};
            var id = wjQuery(this).attr("id");
            var nameNGrade = wjQuery(this).text();
            var start = self.convertToMinutes(moment(idArry[2]).format("h:mm A"));
            var studentObj = [];
            studentObj = makeupList.filter(function (obj) {
                return obj.enrollmentId == id;
            });

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
                objSession["hub_center@odata.bind"] = self.locationId;
                var locationObj = self.getLocationObject(self.locationId);
                if (locationObj['_hub_parentcenter_value'] != undefined) {
                    objSession["hub_parentcenter"] = locationObj['_hub_parentcenter_value'];
                }
                objSession["hub_session_date"] = moment(new Date(idArry[2])).format("YYYY-MM-DD");
                objSession["hub_start_time"] = start;
                objSession["hub_end_time"] = start + 60;
                objSession["hub_sessiontype"] = studentObj[0]['sessionType'];
                objSession["hub_session_status"] = studentObj[0]['sessionStatus'];
                if (studentObj[0]['makeupExpiryDate']) {
                    objSession["hub_makeup_expiry_date"] = moment(studentObj[0]['makeupExpiryDate']).format('YYYY-MM-DD');
                }
                objSession['hub_deliverytype_code'] = studentObj[0].deliveryTypeCode;
                if (studentObj[0]["is1to1"] != undefined) {
                    objSession["hub_is_1to1"] = studentObj[0]["is1to1"];
                }
                objSession["hub_resourceid@odata.bind"] = idArry[1];
                var eventId = idArry[1] + idArry[2];
                var eventObj = self.calendar.fullCalendar('clientEvents', eventId);
                var callSave = false;
                // var allowToDropStudent = true;
                // if(studentObj[0].deliveryTypeCode == personalInstruction){
                var allowToDropStudent = self.validateStudentOnSameRow(studentObj[0].id, idArry[2], studentObj[0], false, false, id);
                // }
                if (allowToDropStudent) {
                    if (eventObj[0].hasOwnProperty("students") && eventObj[0].students.length > 0) {
                        var stdIndex = -1;
                        for (var i = 0; i < eventObj[0].students.length; i++) {
                            if (eventObj[0].students[i].studUniqueId == studentObj[0].studUniqueId) {
                                stdIndex = i;
                                break;
                            }
                        }
                        if (stdIndex == -1) {
                            callSave = true;
                        }
                    } else {
                        callSave = true;
                    }
                    var instructionalHourCheck = self.checkInstructionalHours(studentObj[0], idArry[2]);
                    if (callSave) {
                        var locationObj = self.getLocationObject(self.locationId);
                        objSession['ownerObj'] = locationObj['ownerObj'];
                        if (studentObj[0]['studentSession']) {
                            objSession['hub_student_session@odata.bind'] = studentObj[0]['studentSession'];
                        }
                        if (studentObj[0]['masterScheduleId']) {
                            objSession['hub_master_schedule@odata.bind'] = studentObj[0]['masterScheduleId'];
                        }
                        if (studentObj[0]['sourceAppId']) {
                            objSession['hub_sourceapplicationid'] = studentObj[0]['sourceAppId'];
                        }
                        if (instructionalHourCheck) {
                            self.saveMakeupOrFloat(objSession, studentObj, idArry);
                        } else {
                            wjQuery("#makeup > .error_block").html("");
                            wjQuery("#makeup").dialog("close");
                            var msg = "Instructional Hour is not available. Do you want to continue?";
                            self.saveMakeupConfirmPopup(objSession, studentObj, idArry, msg);
                        }
                    }else {
                        wjQuery("#makeup > .error_block").html("");
                        wjQuery("#makeup").dialog("close");
                    }
                } else {
                    wjQuery("#makeup").dialog("close");
                    self.prompt("The selected student with same service is already scheduled for the respective timeslot.");
                }
            }
        });
    }

    this.saveMakeupOrFloat = function (objSession, studentObj, idArry) {
        var self = this;
        var responseObj = data.saveMakeupNFloat(objSession);
        if (typeof (responseObj) == 'object') {
            var uniqueid = studentObj[0].id + "_" + idArry[1] + "_" + idArry[2];
            // Update New student Session
            studentObj[0]['resourceId'] = idArry[1];
            studentObj[0]['start'] = new Date(idArry[2]);
            studentObj[0]['startHour'] = new Date(idArry[2]);
            studentObj[0]['end'] = new Date(new Date(idArry[2]).setHours(new Date(idArry[2]).getHours() + 1));
            studentObj[0]['sessionId'] = responseObj['hub_studentsessionid'];
            studentObj[0]['sessionDate'] = responseObj['hub_session_date'];
            if (responseObj['hub_sessiontype'] != undefined) {
                studentObj[0]['sessiontype'] = responseObj['hub_sessiontype'];
            }
            if (responseObj['hub_session_status'] != undefined) {
                studentObj[0]['sessionStatus'] = responseObj['hub_session_status'];
            }
            if (responseObj['hub_student_session@odata.bind']) {
                studentObj['studentSession'] = responseObj['hub_student_session@odata.bind'];
            }
            if (responseObj['hub_master_schedule@odata.bind']) {
                studentObj['masterScheduleId'] = responseObj['hub_master_schedule@odata.bind'];
            }
            if (responseObj['hub_sourceapplicationid']) {
                studentObj['sourceAppId'] = responseObj['hub_sourceapplicationid'];
            }
            // update Student
            self.convertedStudentObj.push(studentObj[0]);
            self.populateStudentEvent([studentObj[0]], true);
            self.draggable('draggable');
            wjQuery("#makeup > .error_block").html("");
            wjQuery("#makeup").dialog("close");
        } else {
            wjQuery("#makeup > .error_block").html(responseObj);
        }
    }

    this.saveMakeupConfirmPopup = function (objSession, studentObj, idArry, message) {
        var self = this;
        wjQuery("#dialog > .dialog-msg").text(message);
        wjQuery("#dialog").dialog({
            resizable: false,
            height: "auto",
            width: 350,
            draggable: false,
            modal: true,
            show: {
                effect: 'slide',
                complete: function () {
                    wjQuery(".loading").hide();
                }
            },
            buttons: {
                Yes: function () {
                    self.saveMakeupOrFloat(objSession, studentObj, idArry);
                    wjQuery(this).dialog("close");
                },
                No: function () {
                    wjQuery(this).dialog("close");
                }
            }
        });
    }

    this.getUniqueFromMakeupNFloat = function (makeupList) {
        var self = this;
        var uniquewList = [];
        wjQuery.each(makeupList, function (ke, val) {
            var index = -1;
            for (var i = 0; i < uniquewList.length; i++) {
                if (uniquewList[i].id == val.id && uniquewList[i].enrollmentId == val.enrollmentId) {
                    index = i;
                    break;
                }
            }
            if (index == -1) {
                uniquewList.push(val);
            } else {
                if ((new Date(uniquewList[index].makeupExpiryDate)).getTime() > (new Date(val.makeupExpiryDate)).getTime()) {
                    uniquewList.splice(index, 1);
                    uniquewList.push(val);
                }
            }

        });
        return uniquewList;
    }

    this.convertMakeupNFloatObj = function (makeupList) {
        var self = this;
        eventObjList = [];
        wjQuery.each(makeupList, function (ke, val) {
            var sDate = new Date(val['hub_session_date@OData.Community.Display.V1.FormattedValue'] + " " + val['hub_start_time@OData.Community.Display.V1.FormattedValue']);
            var eDate = new Date(val['hub_session_date@OData.Community.Display.V1.FormattedValue'] + " " + val['hub_end_time@OData.Community.Display.V1.FormattedValue']);
            var startHour = new Date(val['hub_session_date@OData.Community.Display.V1.FormattedValue'] + " " + val['hub_start_time@OData.Community.Display.V1.FormattedValue']);
            if (!val['aprogram_x002e_hub_color']) {
                val['aprogram_x002e_hub_color'] = "#000";
            }
            var obj = {
                studUniqueId:self.generateUniqueId(),
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
                deliveryTypeCode: val['adeliverytype_x002e_hub_code'],
                deliveryTypeCodeVal: val['adeliverytype_x002e_hub_code@OData.Community.Display.V1.FormattedValue'],
                subject: val['aprogram_x002e_hub_areaofinterest@OData.Community.Display.V1.FormattedValue'],
                subjectId: val['aprogram_x002e_hub_areaofinterest'],
                subjectGradient: val['aprogram_x002e_hub_color'],
                programId: val['aprogram_x002e_hub_programid'],
                serviceId: val['_hub_service_value'],
                serviceValue: val['_hub_service_value@OData.Community.Display.V1.FormattedValue'],
                sessionId: val['hub_studentsessionid'],
                sessionType: val['hub_sessiontype'],
                sessionStatus: val['hub_session_status'],
                duration: val['aproductservice_x002e_hub_duration'],
                timeSlotType: val['aproductservice_x002e_hub_timeslottype'],
                namedHoursId: val['aproductservice_x002e_hub_namedgfhoursid'],
                isAttended: val['hub_isattended'],
                makeupExpiryDate: val['hub_makeup_expiry_date@OData.Community.Display.V1.FormattedValue'],
                namedHoursId: val['aproductservice_x002e_hub_namedgfhoursid']
            }
            if (obj.subjectGradient && obj.subjectGradient.split(",")[1]) {
                obj.subjectColorCode = obj.subjectGradient.split(",")[1].replace(");", '');
            } else {
                obj.subjectColorCode = val['aprogram_x002e_hub_color'];
            }
            if (val['hub_name'] != undefined) {
                obj['fullName'] = val['hub_name'];
            } else {
                obj['fullName'] = val["_hub_enrollment_value@OData.Community.Display.V1.FormattedValue"];
            }

            if (val["hub_is_1to1"] == undefined) {
                obj['is1to1'] = false;
            } else {
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
            if (val['_hub_student_session_value']) {
                obj['studentSession'] = val['_hub_student_session_value'];
            }
            if (val['_hub_master_schedule_value']) {
                obj.masterScheduleId = val['_hub_master_schedule_value'];
            }
            if (val['hub_sourceapplicationid']) {
                obj.sourceAppId = val['hub_sourceapplicationid'];
            }
            eventObjList.push(obj);
        });
        return eventObjList;
    }

    this.convertSAList = function (saList) {
        var self = this;
        eventObjList = [];
        wjQuery.each(saList, function (ke, val) {
            var sDate = new Date(val['hub_session_date@OData.Community.Display.V1.FormattedValue'] + " " + val['hub_start_time@OData.Community.Display.V1.FormattedValue']);
            var eDate = new Date(val['hub_session_date@OData.Community.Display.V1.FormattedValue'] + " " + val['hub_end_time@OData.Community.Display.V1.FormattedValue']);
            var startHour = new Date(val['hub_session_date@OData.Community.Display.V1.FormattedValue'] + " " + val['hub_start_time@OData.Community.Display.V1.FormattedValue']);
            if (!val['aprogram_x002e_hub_color']) {
                val['aprogram_x002e_hub_color'] = "#000";
            }
            var obj = {
                studUniqueId:self.generateUniqueId(),
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
                deliveryTypeCode: val['adeliverytype_x002e_hub_code'],
                deliveryTypeCodeVal: val['adeliverytype_x002e_hub_code@OData.Community.Display.V1.FormattedValue'],
                subject: val['aprogram_x002e_hub_areaofinterest@OData.Community.Display.V1.FormattedValue'],
                subjectId: val['aprogram_x002e_hub_areaofinterest'],
                subjectGradient: val['aprogram_x002e_hub_color'],
                programId: val['aprogram_x002e_hub_programid'],
                serviceId: val['_hub_service_value'],
                serviceValue: val['_hub_service_value@OData.Community.Display.V1.FormattedValue'],
                sessionId: val['hub_studentsessionid'],
                sessionType: val['hub_sessiontype'],
                sessionStatus: val['hub_session_status'],
                duration: val['aproductservice_x002e_hub_duration'],
                timeSlotType: val['aproductservice_x002e_hub_timeslottype'],
                namedHoursId: val['aproductservice_x002e_hub_namedgfhoursid'],
                isAttended: val['hub_isattended'],
                makeupExpiryDate: val['hub_makeup_expiry_date@OData.Community.Display.V1.FormattedValue'],
                namedHoursId: val['aproductservice_x002e_hub_namedgfhoursid']
            }
            if (obj.subjectGradient && obj.subjectGradient.split(",")[1]) {
                obj.subjectColorCode = obj.subjectGradient.split(",")[1].replace(");", '');
            } else {
                obj.subjectColorCode = val['aprogram_x002e_hub_color'];
            }
            if (val['hub_name'] != undefined) {
                obj['fullName'] = val['hub_name'];
            } else {
                obj['fullName'] = val["_hub_enrollment_value@OData.Community.Display.V1.FormattedValue"];
            }

            if (val["hub_is_1to1"] == undefined) {
                obj['is1to1'] = false;
            } else {
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

            if (val['_hub_student_session_value']) {
                obj['studentSession'] = val['_hub_student_session_value'];
            }
            if (val['_hub_master_schedule_value']) {
                obj.masterScheduleId = val['_hub_master_schedule_value'];
            }
            if (val['hub_sourceapplicationid']) {
                obj.sourceAppId = val['hub_sourceapplicationid'];
            }
            self.pushStudentToSA(obj);
        });
        return this.saList;
    }


    this.removeTeacher = function (event) {
        var self = this;
        var removeTeacherObj = {};
        var uniqueId = wjQuery(event).attr('uniqueId');
        var uniqueIds = wjQuery(event).attr('uniqueId').split('_');
        var startTime = uniqueId.split('_')[2];
        var teacherId = wjQuery(event).attr("uniqueid").split("_")[0];
        var index = -1;
        var currentCalendarDate = self.calendar.fullCalendar('getDate');
        currentCalendarDate = new Date(currentCalendarDate.setMinutes(00));
        currentCalendarDate = new Date(currentCalendarDate.setSeconds(00));
        for (var a = 0; a < self.convertedTeacherObj.length; a++) {
            if (self.convertedTeacherObj[a].startHour != undefined &&
                self.convertedTeacherObj[a].resourceId != undefined &&
                self.convertedTeacherObj[a].id == teacherId &&
                self.convertedTeacherObj[a].resourceId == uniqueIds[1] &&
                self.convertedTeacherObj[a].startHour.getTime() == new Date(startTime).getTime()) {
                index = a;
                break;
            }
        }
        if (index != -1) {
            var teacherObj = self.convertedTeacherObj[index];
            eventDuration = (teacherObj.end.getTime() - teacherObj.start.getTime()) /(1000 * 60);
            if (teacherObj.hasOwnProperty('isFromMasterSchedule')) {
                removeTeacherObj['hub_staff@odata.bind'] = teacherObj['id'];
                removeTeacherObj['hub_center_value'] = teacherObj['locationId'];
                removeTeacherObj['hub_resourceid@odata.bind'] = teacherObj['resourceId'];
                removeTeacherObj['hub_date'] = moment(teacherObj.start).format("YYYY-MM-DD");
                removeTeacherObj['hub_start_time'] = this.convertToMinutes(moment(teacherObj.start).format("h:mm A"));
                removeTeacherObj['hub_end_time'] = this.convertToMinutes(moment(teacherObj.end).format("h:mm A"));
                removeTeacherObj['hub_schedule_type'] = 3;
            }
            else {
                removeTeacherObj['hub_staff_scheduleid'] = teacherObj["scheduleId"];
            }
            var responseObj = true;
            if (teacherObj.hasOwnProperty('isFromMasterSchedule')) {
                responseObj = true;
            }
            else {
                var locationObj = self.getLocationObject(self.locationId);
                removeTeacherObj['ownerObj'] = locationObj['ownerObj'];
                removeTeacherObj['hub_centerid'] = locationObj['hub_centerid'];
                responseObj = data.removeTeacher(removeTeacherObj);
            }
            if (typeof (responseObj) == 'boolean' || typeof (responseObj) == 'object') {
                var index = -1;
                var filteredTeacher = self.taList.filter(function (x, key) {
                    x.id == teacherObj.id 
                });
                if (typeof (responseObj) == 'object') {
                    if (teacherObj.hasOwnProperty('isFromMasterSchedule')) {
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
                                prevEvent[0].title = "<span class='placeholder teacher-placeholder'>Teacher name</span>";
                                self.addContext("", 'teacherPlaceholder', true, true);
                                prevEvent[0].title += eventTitleHTML.prop('outerHTML');
                            } else {
                                prevEvent[0].title = eventTitleHTML.prop('outerHTML');
                            }
                        } else {
                            prevEvent[0].title = "";
                            if (prevEvent[0].teachers.length == 1) {
                                prevEvent[0].title += "<span class='placeholder teacher-placeholder'>Teacher name</span>";
                                self.addContext("", 'teacherPlaceholder', true, true);
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
                                if (prevEvent[0].title.indexOf('<span class="student-placeholder-' + prevEvent[0].deliveryType + '">Student name</span>') == -1) {
                                    prevEvent[0].title += '<span class="student-placeholder-' + prevEvent[0].deliveryType + '">Student name</span>';
                                    self.addContext("", 'studentPlaceholder', true, prevEvent[0].deliveryTypeCode);
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

                        if ((eventTitleHTML.length == 1 && (eventTitleHTML[0].className == "placeholder teacher-placeholder" || eventTitleHTML[0].className == "student-placeholder-" + prevEvent[0].deliveryType)) ||
                           (eventTitleHTML.length == 2 && eventTitleHTML[0].className == "placeholder teacher-placeholder" && eventTitleHTML[1].className == "student-placeholder-" + prevEvent[0].deliveryType) ||
                           (eventTitleHTML.length == 3 && eventTitleHTML[0].className == "onetoone" && eventTitleHTML[1].className == "placeholder teacher-placeholder" && eventTitleHTML[2].className == "student-placeholder-" + prevEvent[0].deliveryType)) {
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
                }
            } else {
                // Dont remove taecher from event on which he is placed
            }
        }
        self.openSofPane();
        self.showConflictMsg();
        self.draggable('draggable');
        wjQuery(".loading").hide();
    }

    this.generateWeekEventObject = function (arrayList, label) {
        var self = this;
        if (arrayList.length) {
            if (label == 'teacherSchedule') {
                for (var i = 0; i < arrayList.length; i++) {
                    if (arrayList[i]['centerId'] == self.locationId) {
                        if (arrayList[i].hasOwnProperty('startHour') && arrayList[i].hasOwnProperty('resourceId')) {
                            var resourceObj = this.getResourceObj(arrayList[i].resourceId);
                            arrayList[i].isTeacher = true;
                            arrayList[i].deliveryType = resourceObj.deliveryType;
                            arrayList[i].deliveryTypeId = resourceObj.deliveryTypeId;
                            arrayList[i].deliveryTypeCode = resourceObj.deliveryTypeCode;
                            if (this.weekEventObject.hasOwnProperty(arrayList[i].startHour)) {
                                if (this.weekEventObject[arrayList[i].startHour].hasOwnProperty('teacherSchedule')) {
                                    if (arrayList[i].deliveryTypeCode == personalInstruction) {
                                        var index = -1;
                                        for (var k = 0; k < this.weekEventObject[arrayList[i].startHour].teacherSchedule.pi.length; k++) {
                                            if (this.weekEventObject[arrayList[i].startHour].teacherSchedule.pi[k].id == arrayList[i].id) {
                                                index = k;
                                                break;
                                            }
                                        }
                                        if (index == -1) {
                                            this.weekEventObject[arrayList[i].startHour].teacherSchedule.pi.push(arrayList[i]);
                                        }
                                    }
                                    else if (arrayList[i].deliveryTypeCode == groupInstruction) {
                                        var index = -1;
                                        for (var k = 0; k < this.weekEventObject[arrayList[i].startHour].teacherSchedule.gi.length; k++) {
                                            if (this.weekEventObject[arrayList[i].startHour].teacherSchedule.gi[k].id == arrayList[i].id) {
                                                index = k;
                                                break;
                                            }
                                        }
                                        if (index == -1)
                                            this.weekEventObject[arrayList[i].startHour].teacherSchedule.gi.push(arrayList[i]);
                                    }
                                    else if (arrayList[i].deliveryTypeCode == groupFacilitation) {
                                        var index = -1;
                                        for (var k = 0; k < this.weekEventObject[arrayList[i].startHour].teacherSchedule.gf.length; k++) {
                                            if (this.weekEventObject[arrayList[i].startHour].teacherSchedule.gf[k].id == arrayList[i].id) {
                                                index = k;
                                                break;
                                            }
                                        }
                                        if (index == -1)
                                            this.weekEventObject[arrayList[i].startHour].teacherSchedule.gf.push(arrayList[i]);
                                    }
                                } else {
                                    this.weekEventObject[arrayList[i].startHour].teacherSchedule = {};
                                    this.weekEventObject[arrayList[i].startHour].teacherSchedule.pi = [];
                                    this.weekEventObject[arrayList[i].startHour].teacherSchedule.gi = [];
                                    this.weekEventObject[arrayList[i].startHour].teacherSchedule.gf = [];
                                    if (arrayList[i].deliveryTypeCode == personalInstruction) {
                                        this.weekEventObject[arrayList[i].startHour].teacherSchedule.pi.push(arrayList[i]);
                                    }
                                    else if (arrayList[i].deliveryTypeCode == groupInstruction) {
                                        this.weekEventObject[arrayList[i].startHour].teacherSchedule.gi.push(arrayList[i]);
                                    }
                                    else if (arrayList[i].deliveryTypeCode == groupFacilitation) {
                                        this.weekEventObject[arrayList[i].startHour].teacherSchedule.gf.push(arrayList[i]);
                                    }
                                }
                            }
                            else {
                                this.weekEventObject[arrayList[i].startHour] = {};
                                this.weekEventObject[arrayList[i].startHour].teacherSchedule = {};
                                this.weekEventObject[arrayList[i].startHour].teacherSchedule.pi = [];
                                this.weekEventObject[arrayList[i].startHour].teacherSchedule.gi = [];
                                this.weekEventObject[arrayList[i].startHour].teacherSchedule.gf = [];
                                if (arrayList[i].deliveryTypeCode == personalInstruction) {
                                    this.weekEventObject[arrayList[i].startHour].teacherSchedule.pi.push(arrayList[i]);
                                }
                                else if (arrayList[i].deliveryTypeCode == groupInstruction) {
                                    this.weekEventObject[arrayList[i].startHour].teacherSchedule.gi.push(arrayList[i]);
                                }
                                else if (arrayList[i].deliveryTypeCode == groupFacilitation) {
                                    this.weekEventObject[arrayList[i].startHour].teacherSchedule.gf.push(arrayList[i]);
                                }
                            }
                        }
                    }
                }
            }
            else if (label == 'teacherAvailability') {
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
                    if (arrayList[i]['hub_startdate@OData.Community.Display.V1.FormattedValue'] != undefined) {
                        obj.startDate = new Date(arrayList[i]['hub_startdate@OData.Community.Display.V1.FormattedValue']);
                        obj.startDate = new Date(obj.startDate).setHours(0);
                        obj.startDate = new Date(new Date(obj.startDate).setMinutes(0));
                        obj.startDate = new Date(new Date(obj.startDate).setSeconds(0));
                    }
                    if (arrayList[i]['hub_enddate@OData.Community.Display.V1.FormattedValue'] != undefined) {
                        obj.endDate = new Date(arrayList[i]['hub_enddate@OData.Community.Display.V1.FormattedValue']);
                        obj.endDate = new Date(obj.endDate).setHours(0);
                        obj.endDate = new Date(new Date(obj.endDate).setMinutes(0));
                        obj.endDate = new Date(new Date(obj.endDate).setSeconds(0));
                    } else {
                        obj.endDate = new Date(currentView.end.getTime());
                        obj.endDate = new Date(obj.endDate).setHours(0);
                        obj.endDate = new Date(new Date(obj.endDate).setMinutes(0));
                        obj.endDate = new Date(new Date(obj.endDate).setSeconds(0));
                    }
                    for (var j = currentView.start.getTime() ; j < currentView.end.getTime() ; j = j + (24 * 60 * 60 * 1000)) {
                        if (arrayList[i]['hub_' + moment(j).format('dddd').toLowerCase()]) {
                            var taObject = wjQuery.extend(true, {}, obj);
                            if (j >= taObject.startDate.getTime() && j <= taObject.endDate.getTime()) {
                                switch (moment(j).format('dddd').toLowerCase()) {
                                    case 'monday':
                                        taObject.startTime = new Date(moment(j).format('MM-DD-YYYY') + " " + arrayList[i]['hub_monstarttime@OData.Community.Display.V1.FormattedValue']);
                                        if (arrayList[i]['hub_monendtime@OData.Community.Display.V1.FormattedValue'] == undefined) {
                                            taObject.endTime = new Date(taObject.startTime.setHours(taObject.startTime.getHours() + 1));
                                            taObject.startHour = taObject.startTime;
                                            taObject.startHour = new Date(taObject.startHour.setMinutes(0));
                                            this.taList.push(taObject);
                                        }
                                        else {
                                            taObject.endTime = new Date(moment(j).format('MM-DD-YYYY') + " " + arrayList[i]['hub_monendtime@OData.Community.Display.V1.FormattedValue']);
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
                                        taObject.startTime = new Date(moment(j).format('MM-DD-YYYY') + " " + arrayList[i]['hub_tuestarttime@OData.Community.Display.V1.FormattedValue']);
                                        if (arrayList[i]['hub_tueendtime@OData.Community.Display.V1.FormattedValue'] == undefined) {
                                            taObject.endTime = new Date(taObject.startTime.setHours(taObject.startTime.getHours() + 1));
                                            taObject.startHour = taObject.startTime;
                                            taObject.startHour = new Date(taObject.startHour.setMinutes(0));
                                            this.taList.push(taObject);
                                        }
                                        else {
                                            taObject.endTime = new Date(moment(j).format('MM-DD-YYYY') + " " + arrayList[i]['hub_tueendtime@OData.Community.Display.V1.FormattedValue']);
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
                                        taObject.startTime = new Date(moment(j).format('MM-DD-YYYY') + " " + arrayList[i]['hub_wedstarttime@OData.Community.Display.V1.FormattedValue']);
                                        if (arrayList[i]['hub_wedendtime@OData.Community.Display.V1.FormattedValue'] == undefined) {
                                            taObject.endTime = new Date(taObject.startTime.setHours(taObject.startTime.getHours() + 1));
                                            taObject.startHour = taObject.startTime;
                                            taObject.startHour = new Date(taObject.startHour.setMinutes(0));
                                            this.taList.push(taObject);
                                        }
                                        else {
                                            taObject.endTime = new Date(moment(j).format('MM-DD-YYYY') + " " + arrayList[i]['hub_wedendtime@OData.Community.Display.V1.FormattedValue']);
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
                                        taObject.startTime = new Date(moment(j).format('MM-DD-YYYY') + " " + arrayList[i]['hub_thurstarttime@OData.Community.Display.V1.FormattedValue']);
                                        if (arrayList[i]['hub_thurendtime@OData.Community.Display.V1.FormattedValue'] == undefined) {
                                            taObject.endTime = new Date(taObject.startTime.setHours(taObject.startTime.getHours() + 1));
                                            taObject.startHour = taObject.startTime;
                                            taObject.startHour = new Date(taObject.startHour.setMinutes(0));
                                            this.taList.push(taObject);
                                        }
                                        else {
                                            taObject.endTime = new Date(moment(j).format('MM-DD-YYYY') + " " + arrayList[i]['hub_thurendtime@OData.Community.Display.V1.FormattedValue']);
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
                                        taObject.startTime = new Date(moment(j).format('MM-DD-YYYY') + " " + arrayList[i]['hub_fristarttime@OData.Community.Display.V1.FormattedValue']);
                                        if (arrayList[i]['hub_friendtime@OData.Community.Display.V1.FormattedValue'] == undefined) {
                                            taObject.endTime = new Date(taObject.startTime.setHours(taObject.startTime.getHours() + 1));
                                            taObject.startHour = taObject.startTime;
                                            taObject.startHour = new Date(taObject.startHour.setMinutes(0));
                                            this.taList.push(taObject);
                                        }
                                        else {
                                            taObject.endTime = new Date(moment(j).format('MM-DD-YYYY') + " " + arrayList[i]['hub_friendtime@OData.Community.Display.V1.FormattedValue']);
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
                                        taObject.startTime = new Date(moment(j).format('MM-DD-YYYY') + " " + arrayList[i]['hub_satstarttime@OData.Community.Display.V1.FormattedValue']);
                                        if (arrayList[i]['hub_satendtime@OData.Community.Display.V1.FormattedValue'] == undefined) {
                                            taObject.endTime = new Date(taObject.startTime.setHours(taObject.startTime.getHours() + 1));
                                            taObject.startHour = taObject.startTime;
                                            taObject.startHour = new Date(taObject.startHour.setMinutes(0));
                                            this.taList.push(taObject);
                                        }
                                        else {
                                            taObject.endTime = new Date(moment(j).format('MM-DD-YYYY') + " " + arrayList[i]['hub_satendtime@OData.Community.Display.V1.FormattedValue']);
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
                                        taObject.startTime = new Date(moment(j).format('MM-DD-YYYY') + " " + arrayList[i]['hub_sunstarttime@OData.Community.Display.V1.FormattedValue']);
                                        if (arrayList[i]['hub_sunendtime@OData.Community.Display.V1.FormattedValue'] == undefined) {
                                            taObject.endTime = new Date(taObject.startTime.setHours(taObject.startTime.getHours() + 1));
                                            taObject.startHour = taObject.startTime;
                                            taObject.startHour = new Date(taObject.startHour.setMinutes(0));
                                            this.taList.push(taObject);
                                        }
                                        else {
                                            taObject.endTime = new Date(moment(j).format('MM-DD-YYYY') + " " + arrayList[i]['hub_sunendtime@OData.Community.Display.V1.FormattedValue']);
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
                    if (this.taList[i].hasOwnProperty('startHour')) {
                        if (this.weekEventObject.hasOwnProperty(this.taList[i].startHour)) {
                            if (this.weekEventObject[this.taList[i].startHour].hasOwnProperty('teacherAvailability')) {
                                var index = -1;
                                for (var k = 0; k < this.weekEventObject[this.taList[i].startHour].teacherAvailability.length; k++) {
                                    if (this.weekEventObject[this.taList[i].startHour].teacherAvailability[k].id == this.taList[i].id) {
                                        index = k;
                                        break;
                                    }
                                }
                                if (index == -1)
                                    this.weekEventObject[this.taList[i].startHour].teacherAvailability.push(this.taList[i]);
                            } else {
                                this.weekEventObject[this.taList[i].startHour].teacherAvailability = [];
                                this.weekEventObject[this.taList[i].startHour].teacherAvailability.push(this.taList[i]);
                            }
                        }
                        else {
                            this.weekEventObject[this.taList[i].startHour] = {};
                            this.weekEventObject[this.taList[i].startHour].teacherAvailability = [];
                            this.weekEventObject[this.taList[i].startHour].teacherAvailability.push(this.taList[i]);
                        }
                    }
                }
            }
            else {
                for (var i = 0; i < arrayList.length; i++) {
                    if (arrayList[i].hasOwnProperty('startHour')) {
                        if (this.weekEventObject.hasOwnProperty(arrayList[i].startHour)) {
                            if (this.weekEventObject[arrayList[i].startHour].hasOwnProperty('student')) {
                                if (arrayList[i].deliveryTypeCode == personalInstruction) {
                                    var index = -1;
                                    // for (var k = 0; k < this.weekEventObject[arrayList[i].startHour].student.pi.length; k++) {
                                    //     if (this.weekEventObject[arrayList[i].startHour].student.pi[k].id == arrayList[i].id) {
                                    //         index = k;
                                    //         break;
                                    //     }
                                    // }
                                    if (index == -1) {
                                        if (arrayList[i].sessionStatus == SCHEDULE_STATUS ||
                                            arrayList[i].sessionStatus == RESCHEDULE_STATUS ||
                                            arrayList[i].sessionStatus == MAKEUP_STATUS ||
                                            arrayList[i].isFromMasterSchedule)
                                            this.weekEventObject[arrayList[i].startHour].student.pi.push(arrayList[i]);
                                    }

                                }
                                else if (arrayList[i].deliveryTypeCode == groupInstruction) {
                                    var index = -1;
                                    // for (var k = 0; k < this.weekEventObject[arrayList[i].startHour].student.gi.length; k++) {
                                    //     if (this.weekEventObject[arrayList[i].startHour].student.gi[k].id == arrayList[i].id) {
                                    //         index = k;
                                    //         break;
                                    //     }
                                    // }
                                    if (index == -1) {
                                        if (arrayList[i].sessionStatus == SCHEDULE_STATUS ||
                                            arrayList[i].sessionStatus == RESCHEDULE_STATUS ||
                                            arrayList[i].sessionStatus == MAKEUP_STATUS ||
                                            arrayList[i].isFromMasterSchedule)
                                            this.weekEventObject[arrayList[i].startHour].student.gi.push(arrayList[i]);
                                    }
                                }
                                else if (arrayList[i].deliveryTypeCode == groupFacilitation) {
                                    var index = -1;
                                    // for (var k = 0; k < this.weekEventObject[arrayList[i].startHour].student.gf.length; k++) {
                                    //     if (this.weekEventObject[arrayList[i].startHour].student.gf[k].id == arrayList[i].id) {
                                    //         index = k;
                                    //         break;
                                    //     }
                                    // }
                                    if (index == -1) {
                                        if (arrayList[i].sessionStatus == SCHEDULE_STATUS ||
                                            arrayList[i].sessionStatus == RESCHEDULE_STATUS ||
                                            arrayList[i].sessionStatus == MAKEUP_STATUS ||
                                            arrayList[i].isFromMasterSchedule)
                                            this.weekEventObject[arrayList[i].startHour].student.gf.push(arrayList[i]);
                                    }
                                }

                            }
                            else {
                                this.weekEventObject[arrayList[i].startHour].student = {};
                                this.weekEventObject[arrayList[i].startHour].student.pi = [];
                                this.weekEventObject[arrayList[i].startHour].student.gf = [];
                                this.weekEventObject[arrayList[i].startHour].student.gi = [];
                                if (arrayList[i].deliveryTypeCode == personalInstruction) {
                                    if (arrayList[i].sessionStatus == SCHEDULE_STATUS ||
                                            arrayList[i].sessionStatus == RESCHEDULE_STATUS ||
                                            arrayList[i].sessionStatus == MAKEUP_STATUS ||
                                            arrayList[i].isFromMasterSchedule)
                                        this.weekEventObject[arrayList[i].startHour].student.pi.push(arrayList[i]);
                                }
                                else if (arrayList[i].deliveryTypeCode == groupInstruction) {
                                    if (arrayList[i].sessionStatus == SCHEDULE_STATUS ||
                                            arrayList[i].sessionStatus == RESCHEDULE_STATUS ||
                                            arrayList[i].sessionStatus == MAKEUP_STATUS ||
                                            arrayList[i].isFromMasterSchedule)
                                        this.weekEventObject[arrayList[i].startHour].student.gi.push(arrayList[i]);
                                }
                                else if (arrayList[i].deliveryTypeCode == groupFacilitation) {
                                    if (arrayList[i].sessionStatus == SCHEDULE_STATUS ||
                                            arrayList[i].sessionStatus == RESCHEDULE_STATUS ||
                                            arrayList[i].sessionStatus == MAKEUP_STATUS ||
                                            arrayList[i].isFromMasterSchedule)
                                        this.weekEventObject[arrayList[i].startHour].student.gf.push(arrayList[i]);
                                }
                            }
                        }
                        else {
                            this.weekEventObject[arrayList[i].startHour] = {};
                            this.weekEventObject[arrayList[i].startHour].student = {};
                            this.weekEventObject[arrayList[i].startHour].student.pi = [];
                            this.weekEventObject[arrayList[i].startHour].student.gf = [];
                            this.weekEventObject[arrayList[i].startHour].student.gi = [];
                            if (arrayList[i].deliveryTypeCode == personalInstruction) {
                                if (arrayList[i].sessionStatus == SCHEDULE_STATUS ||
                                            arrayList[i].sessionStatus == RESCHEDULE_STATUS ||
                                            arrayList[i].sessionStatus == MAKEUP_STATUS ||
                                            arrayList[i].isFromMasterSchedule)
                                    this.weekEventObject[arrayList[i].startHour].student.pi.push(arrayList[i]);
                            }
                            else if (arrayList[i].deliveryTypeCode == groupInstruction) {
                                if (arrayList[i].sessionStatus == SCHEDULE_STATUS ||
                                            arrayList[i].sessionStatus == RESCHEDULE_STATUS ||
                                            arrayList[i].sessionStatus == MAKEUP_STATUS ||
                                            arrayList[i].isFromMasterSchedule)
                                    this.weekEventObject[arrayList[i].startHour].student.gi.push(arrayList[i]);
                            }
                            else if (arrayList[i].deliveryTypeCode == groupFacilitation) {
                                if (arrayList[i].sessionStatus == SCHEDULE_STATUS ||
                                            arrayList[i].sessionStatus == RESCHEDULE_STATUS ||
                                            arrayList[i].sessionStatus == MAKEUP_STATUS ||
                                            arrayList[i].isFromMasterSchedule)
                                    this.weekEventObject[arrayList[i].startHour].student.gf.push(arrayList[i]);
                            }
                        }
                    }
                }
            }
        }
    }

    this.renderWeekModal = function (calEvent, jsEvent, view) {
        var self = this;
        if (view.name == 'agendaWeek') {
            if (calEvent.deliveryType == 'Personal-Instruction') {
                for (var i in this.weekEventObject) {
                    if (i == calEvent.start) {
                        var groupByResource = {}, sof = [], taList = [];
                        if (this.weekEventObject[i].hasOwnProperty('student')) {
                            if (this.weekEventObject[i].student.hasOwnProperty('pi')) {
                                for (var x = 0; x < this.weekEventObject[i].student.pi.length; x++) {
                                    if (this.weekEventObject[i].student.pi[x].hasOwnProperty('resourceId')) {
                                        if (groupByResource.hasOwnProperty(this.weekEventObject[i].student.pi[x].resourceId)) {
                                            groupByResource[this.weekEventObject[i].student.pi[x].resourceId].push(this.weekEventObject[i].student.pi[x]);
                                        }
                                        else {
                                            groupByResource[this.weekEventObject[i].student.pi[x].resourceId] = [];
                                            groupByResource[this.weekEventObject[i].student.pi[x].resourceId].push(this.weekEventObject[i].student.pi[x]);
                                        }
                                    }
                                    else {
                                        sof.push(this.weekEventObject[i].student.pi[x]);
                                    }
                                }
                            }
                        }
                        if (this.weekEventObject[i].hasOwnProperty('teacherSchedule')) {
                            if (this.weekEventObject[i].teacherSchedule.hasOwnProperty('pi')) {
                                for (var x = 0; x < this.weekEventObject[i].teacherSchedule.pi.length; x++) {
                                    if (groupByResource.hasOwnProperty(this.weekEventObject[i].teacherSchedule.pi[x].resourceId)) {
                                        groupByResource[this.weekEventObject[i].teacherSchedule.pi[x].resourceId].push(this.weekEventObject[i].teacherSchedule.pi[x]);
                                    }
                                    else {
                                        groupByResource[this.weekEventObject[i].teacherSchedule.pi[x].resourceId] = [];
                                        groupByResource[this.weekEventObject[i].teacherSchedule.pi[x].resourceId].push(this.weekEventObject[i].teacherSchedule.pi[x]);
                                    }
                                }
                            }
                        }
                        if (this.weekEventObject[i].hasOwnProperty('teacherAvailability')) {
                            for (var a = 0; a < this.weekEventObject[i].teacherAvailability.length; a++) {
                                var teacherAvailable = true;
                                for (var b in groupByResource) {
                                    for (var j = 0; j < groupByResource[b].length; j++) {
                                        if (groupByResource[b][j].isTeacher && groupByResource[b][j].id == this.weekEventObject[i].teacherAvailability[a].id) {
                                            teacherAvailable = false;
                                        }
                                    }
                                }
                                if (teacherAvailable) {
                                    taList.push(this.weekEventObject[i].teacherAvailability[a]);
                                }
                            }
                        }
                    }
                }
                this.generateModalHtml(groupByResource, sof, taList);
            }
            else if (calEvent.deliveryType == 'Group-Instruction') {
                for (var i in this.weekEventObject) {
                    if (i == calEvent.start) {
                        var groupByResource = {}, sof = [], taList = [];
                        if (this.weekEventObject[i].hasOwnProperty('student')) {
                            if (this.weekEventObject[i].student.hasOwnProperty('gi')) {
                                for (var x = 0; x < this.weekEventObject[i].student.gi.length; x++) {
                                    if (this.weekEventObject[i].student.gi[x].hasOwnProperty('resourceId')) {
                                        if (groupByResource.hasOwnProperty(this.weekEventObject[i].student.gi[x].resourceId)) {
                                            groupByResource[this.weekEventObject[i].student.gi[x].resourceId].push(this.weekEventObject[i].student.gi[x]);
                                        }
                                        else {
                                            groupByResource[this.weekEventObject[i].student.gi[x].resourceId] = [];
                                            groupByResource[this.weekEventObject[i].student.gi[x].resourceId].push(this.weekEventObject[i].student.gi[x]);
                                        }
                                    }
                                    else {
                                        sof.push(this.weekEventObject[i].student.gi[x]);
                                    }
                                }
                            }
                        }
                        if (this.weekEventObject[i].hasOwnProperty('teacherSchedule')) {
                            if (this.weekEventObject[i].teacherSchedule.hasOwnProperty('gi')) {
                                for (var x = 0; x < this.weekEventObject[i].teacherSchedule.gi.length; x++) {
                                    if (groupByResource.hasOwnProperty(this.weekEventObject[i].teacherSchedule.gi[x].resourceId)) {
                                        groupByResource[this.weekEventObject[i].teacherSchedule.gi[x].resourceId].push(this.weekEventObject[i].teacherSchedule.gi[x]);
                                    }
                                    else {
                                        groupByResource[this.weekEventObject[i].teacherSchedule.gi[x].resourceId] = [];
                                        groupByResource[this.weekEventObject[i].teacherSchedule.gi[x].resourceId].push(this.weekEventObject[i].teacherSchedule.gi[x]);
                                    }
                                }
                            }
                        }
                        if (this.weekEventObject[i].hasOwnProperty('teacherAvailability')) {
                            for (var a = 0; a < this.weekEventObject[i].teacherAvailability.length; a++) {
                                var teacherAvailable = true;
                                for (var b in groupByResource) {
                                    for (var j = 0; j < groupByResource[b].length; j++) {
                                        if (groupByResource[b][j].isTeacher && groupByResource[b][j].id == this.weekEventObject[i].teacherAvailability[a].id) {
                                            teacherAvailable = false;
                                        }
                                    }
                                }
                                if (teacherAvailable) {
                                    taList.push(this.weekEventObject[i].teacherAvailability[a]);
                                }
                            }
                        }
                    }
                }
                this.generateModalHtml(groupByResource, sof, taList);
            }
            else if (calEvent.deliveryType == 'Group-Facilitation') {
                for (var i in this.weekEventObject) {
                    if (i == calEvent.start) {
                        var groupByResource = {}, sof = [], taList = [];
                        if (this.weekEventObject[i].hasOwnProperty('student')) {
                            if (this.weekEventObject[i].student.hasOwnProperty('gf')) {
                                for (var x = 0; x < this.weekEventObject[i].student.gf.length; x++) {
                                    if (this.weekEventObject[i].student.gf[x].hasOwnProperty('resourceId')) {
                                        if (groupByResource.hasOwnProperty(this.weekEventObject[i].student.gf[x].resourceId)) {
                                            groupByResource[this.weekEventObject[i].student.gf[x].resourceId].push(this.weekEventObject[i].student.gf[x]);
                                        }
                                        else {
                                            groupByResource[this.weekEventObject[i].student.gf[x].resourceId] = [];
                                            groupByResource[this.weekEventObject[i].student.gf[x].resourceId].push(this.weekEventObject[i].student.gf[x]);
                                        }
                                    }
                                    else {
                                        sof.push(this.weekEventObject[i].student.gf[x]);
                                    }
                                }
                            }
                        }
                        if (this.weekEventObject[i].hasOwnProperty('teacherSchedule')) {
                            if (this.weekEventObject[i].teacherSchedule.hasOwnProperty('gf')) {
                                for (var x = 0; x < this.weekEventObject[i].teacherSchedule.gf.length; x++) {
                                    if (groupByResource.hasOwnProperty(this.weekEventObject[i].teacherSchedule.gf[x].resourceId)) {
                                        groupByResource[this.weekEventObject[i].teacherSchedule.gf[x].resourceId].push(this.weekEventObject[i].teacherSchedule.gf[x]);
                                    }
                                    else {
                                        groupByResource[this.weekEventObject[i].teacherSchedule.gf[x].resourceId] = [];
                                        groupByResource[this.weekEventObject[i].teacherSchedule.gf[x].resourceId].push(this.weekEventObject[i].teacherSchedule.gf[x]);
                                    }
                                }
                            }
                        }
                        if (this.weekEventObject[i].hasOwnProperty('teacherAvailability')) {
                            for (var a = 0; a < this.weekEventObject[i].teacherAvailability.length; a++) {
                                var teacherAvailable = true;
                                for (var b in groupByResource) {
                                    for (var j = 0; j < groupByResource[b].length; j++) {
                                        if (groupByResource[b][j].isTeacher && groupByResource[b][j].id == this.weekEventObject[i].teacherAvailability[a].id) {
                                            teacherAvailable = false;
                                        }
                                    }
                                }
                                if (teacherAvailable) {
                                    taList.push(this.weekEventObject[i].teacherAvailability[a]);
                                }
                            }
                        }
                    }
                }
                this.generateModalHtml(groupByResource, sof, taList);
            }
            wjQuery("#weekmodal").dialog({
                modal: true,
                draggable: false,
                resizable: false,
                height: "auto",
                width: 800
            });
            wjQuery("#weekmodal").dialog('option', 'title', moment(calEvent.start).format('dddd') + " " + moment(calEvent.start).format('hh:mm A'));
        }
    };

    this.generateModalHtml = function (groupByResource, sof, taList) {
        var self = this;
        var width = 0, html = "<div class='holder'>";
        if (Object.keys(groupByResource).length) {
            width = Object.keys(groupByResource).length * 150;
            for (var i in groupByResource) {
                var oneResource = "<div class='resourceHolder'>";
                var teacherPlaceFlag = true, studentPlaceFlag = true, teacherHtml = '', studentHtml = '';
                for (var j = 0; j < groupByResource[i].length; j++) {
                    if (groupByResource[i][j].isTeacher) {
                        if (teacherPlaceFlag) {
                            teacherPlaceFlag = false;
                            teacherHtml += "<div class='teacherHolder'>";
                        }
                        teacherHtml += "<div>" + groupByResource[i][j].name + "</div>";
                    }
                    else {
                        if (studentPlaceFlag) {
                            studentPlaceFlag = false;
                            studentHtml += "<div class='studentHolder'>";
                        }
                        var indicator = self.addSessionTypeIndicator(groupByResource[i][j].sessiontype);
                        studentHtml += "<div class='wk-student'>" + groupByResource[i][j].name + ", " + groupByResource[i][j].grade + "<i class='material-icons'  style=";
                        if (!isIE) {
                            studentHtml += "'background:" + groupByResource[i][j]['subjectGradient'] + ";-webkit-background-clip: text;";
                        }
                        studentHtml += "'color:" + groupByResource[i][j]['subjectColorCode'] + "'>location_on</i>" + indicator + "</div>";
                    }
                }
                if (!teacherPlaceFlag) {
                    teacherHtml += "</div>";
                    oneResource += teacherHtml;
                }
                else {
                    teacherHtml += "<div class='teacherHolder'><div class='placeholder'>Teacher Name</div></div>";
                    self.addContext("", 'teacherPlaceholder', true, true);
                    oneResource += teacherHtml;
                }
                if (!studentPlaceFlag) {
                    studentHtml += "</div>";
                    oneResource += studentHtml;
                }
                else {
                    studentHtml += "<div class='studentHolder'><div class='placeholder'>Student Name</div></div>";
                    oneResource += studentHtml;
                }
                oneResource += "</div>";
                html += oneResource;
            }
        }
        if (sof.length) {
            width += 150;
            var oneResource = "<div class='resourceHolder'>";
            var SOFPlaceFlag = true, sofHtml = '';
            for (var j = 0; j < sof.length; j++) {
                if (SOFPlaceFlag) {
                    SOFPlaceFlag = false;
                    sofHtml += "<div class='teacherHolder'><div class='placeholder'>Student Overflow</div>";
                }
                sofHtml += "<div>" + sof[j].name + ", " + sof[j].grade + "</div>";
            }
            if (!SOFPlaceFlag) {
                sofHtml += "</div>";
                oneResource += sofHtml;
            }
            oneResource += "</div>";
            html += oneResource;
        }
        if (taList != undefined && taList.length) {
            width += 150;
            var oneResource = "<div class='resourceHolder'>";
            var TAPlaceFlag = true, taHtml = '';
            for (var j = 0; j < taList.length; j++) {
                if (TAPlaceFlag) {
                    TAPlaceFlag = false;
                    taHtml += "<div class='teacherHolder'><div class='placeholder'>Teacher Availability</div>";
                }
                taHtml += "<div>" + taList[j].name + "</div>";
            }
            if (!TAPlaceFlag) {
                taHtml += "</div>";
                oneResource += taHtml;
            }
            oneResource += "</div>";
            html += oneResource;
        }
        html += "</div>";
        wjQuery('#weekStudentsPlaceHolder').css('width', width + 'px');
        wjQuery('#weekStudentsPlaceHolder').html(html);
    };


    this.populateWeekEvents = function () {
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
        if (self.selectedDeliveryType.length == 1) {
            piSelected = true;
            giSelected = false;
            gfSelected = false;
        }
        if (self.selectedDeliveryType.length == 2) {
            piSelected = false;
            giSelected = true;
            gfSelected = true;
        }
        if (self.selectedDeliveryType.length == 3) {
            piSelected = true;
            giSelected = true;
            gfSelected = true;
        }

        var piSpace = 0, giSpace = 0, gfSpace = 0;
        var hasPiResource = false, hasGiResource = false, hasGfResource = false;
        for (var i = 0; i < self.resourceList.length; i++) {
            if (self.resourceList[i].deliveryTypeCode == personalInstruction) {
                piSpace += self.resourceList[i].capacity;
                hasPiResource = true;
            }
            else if (self.resourceList[i].deliveryTypeCode == groupInstruction) {
                giSpace += self.resourceList[i].capacity;
                hasGiResource = true;
            }
            else if (self.resourceList[i].deliveryTypeCode == groupFacilitation) {
                gfSpace += self.resourceList[i].capacity;
                hasGfResource = true;
            }
        }
        if (Object.keys(this.weekEventObject).length) {
            var leaveList = [];
            for (var i = 0; i < Object.keys(this.weekEventObject).length; i++) {
                var index = -1;
                for (var a = 0; a < self.leaveDays.length; a++) {
                    if (moment(self.leaveDays[a]).format('YYYY-MM-DD') == moment(Object.keys(this.weekEventObject)[i]).format('YYYY-MM-DD')) {
                        index = a;
                        break;
                    }
                }
                if (index == -1) {
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
                    var addLabel = false, oneDtStudent = false, oneDtTeacher = false;
                    if (giSelected) {
                        if (this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('teacherAvailability')) {
                            if (this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherAvailability.length) {
                                addLabel = true;
                            }
                        }
                        else if (this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('student')) {
                            if (piSelected) {
                                if ((this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.pi.length > 0 &&
                                   this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gi.length > 0) ||
                                   (this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.pi.length > 0 &&
                                   this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gf.length > 0) ||
                                   (this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gf.length > 0 &&
                                   this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gi.length > 0)) {
                                    addLabel = true;
                                }
                                else {
                                    oneDtStudent = true;
                                }
                            }
                            else {
                                if (this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gf.length > 0 &&
                                   this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gi.length > 0) {
                                    addLabel = true;
                                }
                                else {
                                    oneDtStudent = true;
                                }
                            }
                        }
                        else if (this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('teacherSchedule')) {
                            if (piSelected) {
                                if ((this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.pi.length > 0 &&
                                   this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.gi.length > 0) ||
                                   (this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.pi.length > 0 &&
                                   this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.gf.length > 0) ||
                                   (this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.gf.length > 0 &&
                                   this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.gi.length > 0)) {
                                    addLabel = true;
                                }
                                else {
                                    oneDtTeacher = true;
                                }
                            }
                            else {
                                if (this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.gf.length > 0 &&
                                   this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.gi.length > 0) {
                                    addLabel = true;
                                }
                                else {
                                    oneDtStudent = true;
                                }
                            }
                        }
                        if (!addLabel && oneDtStudent && oneDtTeacher) {
                            addLabel = true;
                        }
                    }

                    if (piSelected) {
                        var piFlag = false;
                        piObj.title = "";
                        piObj.backgroundColor = "#ebf5fb";
                        piObj.borderColor = "#9acaea";
                        piObj.deliveryType = "Personal-Instruction";
                        piObj.title += "<div class='stplace'>";
                        if (!giSelected || !addLabel) {
                            piObj.title += "S:T = ";
                        }
                        if (this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('student') &&
                           this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('teacherSchedule')) {
                            if (this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.hasOwnProperty('pi') &&
                               this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.hasOwnProperty('pi')) {
                                if (this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.pi.length != 0 &&
                                    this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.pi.length != 0) {
                                    piFlag = true;
                                    var num = this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.pi.length + ":" + parseFloat(this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.pi.length);
                                    piObj.title += num + " </div>"
                                }
                                else {
                                    piObj.title += "NA </div>"
                                }
                            }
                            else {
                                piObj.title += "NA </div>"
                            }
                        }
                        else {
                            piObj.title += "NA </div>"
                        }
                        piObj.title += "<div class='ssplace'>"
                        if (!giSelected || !addLabel) {
                            piObj.title += "Seats = ";
                        }
                        if (this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('student')) {
                            if (this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.hasOwnProperty('pi')) {
                                var find1to1 = false, count = 0, groupStudentsByResource = {};
                                for (var x = 0; x < this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.pi.length; x++) {
                                    if (groupStudentsByResource.hasOwnProperty(this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.pi[x].resourceId)) {
                                        groupStudentsByResource[this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.pi[x].resourceId].push(this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.pi[x]);
                                    }
                                    else {
                                        groupStudentsByResource[this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.pi[x].resourceId] = [];
                                        groupStudentsByResource[this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.pi[x].resourceId].push(this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.pi[x]);
                                    }
                                }
                                for (var x = 0; x < Object.keys(groupStudentsByResource).length; x++) {
                                    find1to1 = false;
                                    piFlag = true;
                                    for (var y = 0; y < groupStudentsByResource[Object.keys(groupStudentsByResource)[x]].length; y++) {
                                        if (groupStudentsByResource[Object.keys(groupStudentsByResource)[x]][y].is1to1) {
                                            find1to1 = true;
                                            break;
                                        }
                                    }
                                    if (find1to1) {
                                        if (this.getResourceObj(Object.keys(groupStudentsByResource)[x]).capacity != undefined) {
                                            count += this.getResourceObj(Object.keys(groupStudentsByResource)[x]).capacity;
                                        }
                                    }
                                    else {
                                        count += groupStudentsByResource[Object.keys(groupStudentsByResource)[x]].length
                                    }
                                }
                                piObj.title += count + "/" + piSpace + "</div>";
                            }
                            else {
                                piObj.title += "0/" + piSpace + "</div>";
                            }
                        }
                        else {
                            piObj.title += "0/" + piSpace + "</div>";
                        }
                        piObj.title += "<div class='tsplace'>";
                        if (!giSelected || !addLabel) {
                            piObj.title += "Teachers = ";
                        }
                        if (this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('teacherSchedule')) {
                            if (this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.hasOwnProperty('pi')) {
                                piFlag = true;
                                piObj.title += this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.pi.length + "/";
                            }
                            else {
                                piObj.title += "0/";
                            }
                        }
                        else {
                            piObj.title += "0/";
                        }
                        if (this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('teacherAvailability')) {
                            if (this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherAvailability.length)
                                piObj.title += this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherAvailability.length + "</div>";
                            piFlag = true;
                        }
                        else {
                            piObj.title += "0 </div>"
                        }
                        if (piFlag && hasPiResource)
                            self.eventList.push(piObj);
                    }
                    if (giSelected) {
                        var giFlag = false;
                        giObj.title = "";
                        giObj.backgroundColor = "#fedeb7";
                        giObj.borderColor = "#f88e50";
                        giObj.deliveryType = "Group-Instruction";
                        giObj.title += "<div class='stplace'>";
                        if (!addLabel) {
                            giObj.title += "S:T = ";
                        }
                        if (this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('student') &&
                           this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('teacherSchedule')) {
                            if (this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.hasOwnProperty('gi') &&
                               this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.hasOwnProperty('gi')) {
                                if (this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gi.length != 0 &&
                                    this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.gi.length != 0) {
                                    giFlag = true;
                                    var num = this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gi.length / parseFloat(this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.gi.length);
                                    giObj.title += num.toFixed(2) + " </div>"
                                }
                                else {
                                    giObj.title += "NA </div>"
                                }
                            }
                            else {
                                giObj.title += "NA </div>"
                            }
                        }
                        else {
                            giObj.title += "NA </div>"
                        }
                        giObj.title += "<div class='ssplace'>";
                        if (!addLabel) {
                            giObj.title += "Seats = ";
                        }
                        if (this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('student')) {
                            if (this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.hasOwnProperty('gi')) {
                                var find1to1 = false, count = 0, groupStudentsByResource = {};
                                for (var x = 0; x < this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gi.length; x++) {
                                    if (groupStudentsByResource.hasOwnProperty(this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gi[x].resourceId)) {
                                        groupStudentsByResource[this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gi[x].resourceId].push(this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gi[x]);
                                    }
                                    else {
                                        groupStudentsByResource[this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gi[x].resourceId] = [];
                                        groupStudentsByResource[this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gi[x].resourceId].push(this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gi[x]);
                                    }
                                }
                                for (var x = 0; x < Object.keys(groupStudentsByResource).length; x++) {
                                    find1to1 = false;
                                    giFlag = true;
                                    for (var y = 0; y < groupStudentsByResource[Object.keys(groupStudentsByResource)[x]].length; y++) {
                                        if (groupStudentsByResource[Object.keys(groupStudentsByResource)[x]][y].is1to1) {
                                            find1to1 = true;
                                            break;
                                        }
                                    }
                                    if (find1to1) {
                                        if (this.getResourceObj(Object.keys(groupStudentsByResource)[x]).capacity != undefined) {
                                            count += this.getResourceObj(Object.keys(groupStudentsByResource)[x]).capacity;
                                        }
                                    }
                                    else {
                                        count += groupStudentsByResource[Object.keys(groupStudentsByResource)[x]].length
                                    }
                                }
                                giObj.title += count + "/" + giSpace + "</div>";
                            }
                            else {
                                giObj.title += "0/" + giSpace + "</div>";
                            }
                        }
                        else {
                            giObj.title += "0/" + giSpace + "</div>";
                        }
                        giObj.title += "<div class='tsplace'>";
                        if (!addLabel) {
                            giObj.title += "Teachers = ";
                        }
                        if (this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('teacherSchedule')) {
                            if (this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.hasOwnProperty('gi')) {
                                giObj.title += this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.gi.length + "/";
                            }
                            else {
                                giObj.title += "0/";
                            }
                        }
                        else {
                            giObj.title += "0/";
                        }
                        if (this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('teacherAvailability')) {
                            giObj.title += this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherAvailability.length + "</div>";
                            if (this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherAvailability.length)
                                giFlag = true;
                        }
                        else {
                            giObj.title += "0</div>"
                        }
                        if (giFlag && hasGiResource)
                            self.eventList.push(giObj);
                    }
                    if (gfSelected) {
                        var gfFlag = false;
                        gfObj.title = "";
                        gfObj.backgroundColor = "#dff0d5";
                        gfObj.borderColor = "#7bc143";
                        gfObj.deliveryType = "Group-Facilitation";
                        gfObj.title += "<div class='stplace'>";
                        if (!addLabel) {
                            gfObj.title += "S:T = ";
                        }
                        if (this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('student') &&
                           this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('teacherSchedule')) {
                            if (this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.hasOwnProperty('gf') &&
                               this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.hasOwnProperty('gf')) {
                                if (this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gf.length != 0 &&
                                    this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.gf.length != 0) {
                                    gfFlag = true;
                                    var num = this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gf.length / parseFloat(this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.gf.length);
                                    gfObj.title += num.toFixed(2) + " </div>"
                                }
                                else {
                                    gfObj.title += "NA </div>"
                                }
                            }
                            else {
                                gfObj.title += "NA </div>"
                            }
                        }
                        else {
                            gfObj.title += "NA </div>"
                        }
                        gfObj.title += "<div class='ssplace'>";
                        if (!addLabel) {
                            gfObj.title += "Seats = ";
                        }
                        if (this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('student')) {
                            if (this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.hasOwnProperty('gf')) {
                                var find1to1 = false, count = 0, groupStudentsByResource = {};
                                for (var x = 0; x < this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gf.length; x++) {
                                    if (groupStudentsByResource.hasOwnProperty(this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gf[x].resourceId)) {
                                        groupStudentsByResource[this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gf[x].resourceId].push(this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gf[x]);
                                    }
                                    else {
                                        groupStudentsByResource[this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gf[x].resourceId] = [];
                                        groupStudentsByResource[this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gf[x].resourceId].push(this.weekEventObject[Object.keys(this.weekEventObject)[i]].student.gf[x]);
                                    }
                                }
                                for (var x = 0; x < Object.keys(groupStudentsByResource).length; x++) {
                                    find1to1 = false;
                                    gfFlag = true;
                                    for (var y = 0; y < groupStudentsByResource[Object.keys(groupStudentsByResource)[x]].length; y++) {
                                        if (groupStudentsByResource[Object.keys(groupStudentsByResource)[x]][y].is1to1) {
                                            find1to1 = true;
                                            break;
                                        }
                                    }
                                    if (find1to1) {
                                        if (this.getResourceObj(Object.keys(groupStudentsByResource)[x]).capacity != undefined) {
                                            count += this.getResourceObj(Object.keys(groupStudentsByResource)[x]).capacity;
                                        }
                                    }
                                    else {
                                        count += groupStudentsByResource[Object.keys(groupStudentsByResource)[x]].length
                                    }
                                }
                                gfObj.title += count + "/" + gfSpace + "</div>";
                            }
                            else {
                                gfObj.title += "0/" + gfSpace + "</div>";
                            }
                        }
                        else {
                            gfObj.title += "0/" + gfSpace + "</div>";
                        }
                        gfObj.title += "<div class='tsplace'>";
                        if (!addLabel) {
                            gfObj.title += "Teachers = ";
                        }
                        if (this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('teacherSchedule')) {
                            if (this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.hasOwnProperty('gf')) {
                                gfObj.title += this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherSchedule.gf.length + "/";
                            }
                            else {
                                gfObj.title += "0/";
                            }
                        }
                        else {
                            gfObj.title += "0/";
                        }
                        if (this.weekEventObject[Object.keys(this.weekEventObject)[i]].hasOwnProperty('teacherAvailability')) {
                            gfObj.title += this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherAvailability.length + "</div>";
                            if (this.weekEventObject[Object.keys(this.weekEventObject)[i]].teacherAvailability.length)
                                gfFlag = true;
                        }
                        else {
                            gfObj.title += "0</div>"
                        }
                        if (gfFlag && hasGfResource)
                            self.eventList.push(gfObj);
                    }
                }
            }
            for (var j = currentView.start.getTime() ; j < currentView.end.getTime() ; j = j + (24 * 60 * 60 * 1000)) {
                var sample = -1;
                for (var b = 0; b < self.leaveDays.length; b++) {
                    if (moment(self.leaveDays[b]).format('YYYY-MM-DD') == moment(j).format('YYYY-MM-DD')) {
                        sample = b;
                        var obj = {
                            start: new Date(j),
                            allDay: true,
                            className: "leave-day-class",
                            title: '',
                        };
                        self.eventList.push(obj);
                    }
                }

            }
            self.calendar.fullCalendar('removeEvents');
            self.calendar.fullCalendar('removeEventSource');
            self.calendar.fullCalendar('addEventSource', { events: self.eventList });
            self.calendar.fullCalendar('refetchEvents');
            wjQuery('.fc-view-agendaWeek .fc-event-time').css('visibility', 'hidden');
            wjQuery('.loading').hide();
        }
        else {
            wjQuery('.loading').hide();
        }
    }

    this.getStudentTimings = function (locationId, selectedDate, timeSlotType, studentDuration, istimeSlotType) {
        var self = this;
        var day = this.getDayValue(new Date(selectedDate));
        var timingArry = [];
        var ConvertedTimingArry = [];
        if (day != undefined) {
            var selectedDate = moment(selectedDate).format("YYYY-MM-DD");
            var availableTime = [];
            if (!isNaN(timeSlotType)) {
                availableTime = data.getPiStudentAvailableTime(locationId, selectedDate, timeSlotType);
            } else {
                availableTime = data.getGfStudentAvailableTime(locationId, selectedDate, timeSlotType);
            }
            availableTime = (availableTime == null) ? [] : availableTime;
            for (var i = 0; i < availableTime.length; i++) {
                if (day == availableTime[i]['hub_days']) {
                    for (var j = availableTime[i]['hub_starttime']; j < availableTime[i]['hub_endtime']; j = j + studentDuration) {
                        timingArry.push(j);
                    }
                }
            }
            if (timingArry.length) {
                timingArry.sort(function (a, b) { return a - b });
                for (var i = 0; i < timingArry.length; i++) {
                    ConvertedTimingArry.push(this.tConvert(this.convertMinsNumToTime(timingArry[i])));
                }
            }
            return ConvertedTimingArry;
        }
    }

    this.validateStudentOnSameRow = function (stuId, startHour, prevEvent, sessionDrag, isFromSof, enrollmentId) {
        var self = this;
        var allowToDropStudent = true;
        startHour = new Date(startHour);

        if (prevEvent['duration'] == undefined) {
            prevEvent['duration'] = 60;
        }

        var numHour;
        var numMinite;
        var endHour;
        if (prevEvent['duration'] % 60 == 0) {
            numHour = prevEvent['duration'] / 60;
            numMinite = 0;
        } else {
            numHour = Math.floor(prevEvent['duration'] / 60);
            numMinite = prevEvent['duration'] % 60;
        }
        var startHour1 = new Date(startHour);
        if ((startHour1.getMinutes() + numMinite) < 60) {
            endHour = new Date(startHour1.setHours(startHour1.getHours() + numHour));
            endHour = new Date(startHour1.setMinutes(startHour1.getMinutes() + numMinite));
        }
        if ((startHour1.getMinutes() + numMinite) >= 60) {
            numHour += Math.floor((startHour1.getMinutes() + numMinite) / 60);
            numMinite += (startHour1.getMinutes() + numMinite) % 60;
            endHour = new Date(startHour1.setHours(startHour1.getHours() + numHour));
            endHour = new Date(startHour1.setMinutes(startHour1.getMinutes() + numMinite));
        }

        var dropableEvent = [];
        if (sessionDrag) {
            dropableEvent = self.calendar.fullCalendar('clientEvents', function (el) {
                return el.end != null &&
                        el.hasOwnProperty("students") &&
                        prevEvent.resourceId + prevEvent.startHour != el.id &&
                        (
                            (
                                startHour.getTime() <= el.start.getTime() &&
                                endHour.getTime() >= el.end.getTime()
                            ) ||
                            (
                                el.start.getTime() <= startHour.getTime() &&
                                el.end.getTime() >= endHour.getTime()
                            ) ||
                            (
                                endHour.getTime() > el.start.getTime() &&
                                el.end.getTime() > startHour.getTime()
                            )
                        )
            });
        } else {
            dropableEvent = self.calendar.fullCalendar('clientEvents', function (el) {
                return el.end != null &&
                        el.hasOwnProperty("students") &&
                        (
                            (
                                startHour.getTime() <= el.start.getTime() &&
                                endHour.getTime() >= el.end.getTime()
                            ) ||
                            (
                                el.start.getTime() <= startHour.getTime() &&
                                el.end.getTime() >= endHour.getTime()
                            ) ||
                            (
                                endHour.getTime() > el.start.getTime() &&
                                el.end.getTime() > startHour.getTime()
                            )
                        )
            });
        }
        if (dropableEvent.length) {
            for (var s = 0; s < dropableEvent.length; s++) {
                var val = dropableEvent[s];
                if (val.hasOwnProperty("students") && val['students'].length) {
                    for (var i = 0; i < val['students'].length; i++) {
                        if(prevEvent['deliveryTypeCode'] == personalInstruction){
                            if (val['students'][i]['deliveryTypeCode'] == personalInstruction && 
                                stuId == val['students'][i]['id']) {
                                allowToDropStudent = false;
                                break;
                            }
                        }else{
                            if (enrollmentId == val['students'][i]['enrollmentId']) {
                                allowToDropStudent = false;
                                break;
                            }
                        }
                    }
                    if (!allowToDropStudent) {
                        allowToDropStudent = false;
                        break;
                    }
                }
            }
        }
        if (allowToDropStudent && !isFromSof) {
            dropableEvent = [];
            if (self.sofList['Personal Instruction'].length) {
                dropableEvent = self.sofList['Personal Instruction'].filter(function (el) {
                    return el.id == stuId &&
                            (
                                    (
                                        startHour.getTime() <= el.start.getTime() &&
                                        endHour.getTime() >= el.end.getTime()
                                    ) ||
                                    (
                                        el.start.getTime() <= startHour.getTime() &&
                                        el.end.getTime() >= endHour.getTime()
                                    ) ||
                                    (
                                        endHour.getTime() > el.start.getTime() &&
                                        el.end.getTime() > startHour.getTime()
                                    )
                            )
                });
            }
            if (dropableEvent.length == 0) {
                if (self.sofList['Group Facilitation'].length) {
                    dropableEvent = self.sofList['Group Facilitation'].filter(function (el) {
                        return el.enrollmentId == enrollmentId &&
                                (
                                        (
                                            startHour.getTime() <= el.start.getTime() &&
                                            endHour.getTime() >= el.end.getTime()
                                        ) ||
                                        (
                                            el.start.getTime() <= startHour.getTime() &&
                                            el.end.getTime() >= endHour.getTime()
                                        ) ||
                                        (
                                            endHour.getTime() > el.start.getTime() &&
                                            el.end.getTime() > startHour.getTime()
                                        )
                                )
                    });
                }
                if(dropableEvent.length == 0){
                    if (self.sofList['Group Facilitation'].length) {
                        dropableEvent = self.sofList['Group Facilitation'].filter(function (el) {
                            return el.enrollmentId == enrollmentId &&
                                    (
                                            (
                                                startHour.getTime() <= el.start.getTime() &&
                                                endHour.getTime() >= el.end.getTime()
                                            ) ||
                                            (
                                                el.start.getTime() <= startHour.getTime() &&
                                                el.end.getTime() >= endHour.getTime()
                                            ) ||
                                            (
                                                endHour.getTime() > el.start.getTime() &&
                                                el.end.getTime() > startHour.getTime()
                                            )
                                    )
                        });
                    }
                    if(dropableEvent.length == 0){
                        allowToDropStudent = true;
                    }else{
                        allowToDropStudent = false;
                    }
                }else{
                    allowToDropStudent = false;
                }
            } else {
                allowToDropStudent = false;
            }
        }
        return allowToDropStudent;
    }

    this.validateTeacherOnSameRow = function (teacherId, startHour, prevEvent, sessionDrag) {
        var self = this;
        var allowToDropTeacher = true;
        startHour = new Date(startHour);
        if (prevEvent['duration'] == undefined) {
            prevEvent['duration'] = 60;
        }
        var numHour;
        var numMinite;
        var endHour;
        if (prevEvent['duration'] % 60 == 0) {
            numHour = prevEvent['duration'] / 60;
            numMinite = 0;
        } else {
            numHour = Math.floor(prevEvent['duration'] / 60);
            numMinite = prevEvent['duration'] % 60;
        }
        var startHour1 = new Date(startHour);
        if ((startHour1.getMinutes() + numMinite) < 60) {
            endHour = new Date(startHour1.setHours(startHour1.getHours() + numHour));
            endHour = new Date(startHour1.setMinutes(startHour1.getMinutes() + numMinite));
        }
        if ((startHour1.getMinutes() + numMinite) >= 60) {
            numHour += Math.floor((startHour1.getMinutes() + numMinite) / 60);
            numMinite += (startHour1.getMinutes() + numMinite) % 60;
            endHour = new Date(startHour1.setHours(startHour1.getHours() + numHour));
            endHour = new Date(startHour1.setMinutes(startHour1.getMinutes() + numMinite));
        }

        var dropableEvent = [];
        if (sessionDrag) {
            dropableEvent = self.calendar.fullCalendar('clientEvents', function (el) {
                return el.end != null &&
                        prevEvent.resourceId + prevEvent.start != el.id &&
                        el.hasOwnProperty("teachers") &&
                        (
                            (
                                startHour.getTime() <= el.start.getTime() &&
                                endHour.getTime() >= el.end.getTime()
                            ) ||
                            (
                                el.start.getTime() <= startHour.getTime() &&
                                el.end.getTime() >= endHour.getTime()
                            ) ||
                            (
                                endHour.getTime() > el.start.getTime() &&
                                el.end.getTime() > startHour.getTime()
                            )
                        )
            });
        } else {
            dropableEvent = self.calendar.fullCalendar('clientEvents', function (el) {
                return el.end != null &&
                        el.hasOwnProperty("teachers") &&
                        (
                            (
                                startHour.getTime() <= el.start.getTime() &&
                                endHour.getTime() >= el.end.getTime()
                            ) ||
                            (
                                el.start.getTime() <= startHour.getTime() &&
                                el.end.getTime() >= endHour.getTime()
                            ) ||
                            (
                                endHour.getTime() > el.start.getTime() &&
                                el.end.getTime() > startHour.getTime()
                            )
                        )
            });
        }
        if (dropableEvent.length) {
            for (var s = 0; s < dropableEvent.length; s++) {
                var val = dropableEvent[s];
                if (val.hasOwnProperty("teachers") && val['teachers'].length) {
                    for (var i = 0; i < val['teachers'].length; i++) {
                        if (teacherId == val['teachers'][i]['id']) {
                            allowToDropTeacher = false;
                            break;
                        }
                    }
                    if (!allowToDropTeacher) {
                        allowToDropTeacher = false;
                        break;
                    }
                }
            }
        }
        return allowToDropTeacher;
    }

    this.validateOverlapingEvent = function (startHour, resourceId, prevEvent, sessionDrag) {
        var self = this;
        var allowToDropStudent = true;
        startHour = new Date(startHour);

        if (prevEvent['duration'] == undefined) {
            prevEvent['duration'] = 60;
        }
        var numHour;
        var numMinite;
        var endHour;
        if (prevEvent['duration'] % 60 == 0) {
            numHour = prevEvent['duration'] / 60;
            numMinite = 0;
        } else {
            numHour = Math.floor(prevEvent['duration'] / 60);
            numMinite = prevEvent['duration'] % 60;
        }
        var startHour1 = new Date(startHour);
        if ((startHour1.getMinutes() + numMinite) < 60) {
            endHour = new Date(startHour1.setHours(startHour1.getHours() + numHour));
            endHour = new Date(startHour1.setMinutes(startHour1.getMinutes() + numMinite));
        }
        if ((startHour1.getMinutes() + numMinite) >= 60) {
            numHour += Math.floor((startHour1.getMinutes() + numMinite) / 60);
            numMinite += (startHour1.getMinutes() + numMinite) % 60;
            endHour = new Date(startHour1.setHours(startHour1.getHours() + numHour));
            endHour = new Date(startHour1.setMinutes(startHour1.getMinutes() + numMinite));
        }
        var dropableEvent = [];
        var dropableEvent = [];
        if (sessionDrag) {
            var prevEventObj = self.calendar.fullCalendar('clientEvents', prevEvent.resourceId + prevEvent.startHour);
            var eventTitleHTML = wjQuery(prevEventObj[0].title);
            if (prevEventObj[0].hasOwnProperty("students") && prevEventObj[0]['students'].length > 1 ||
                prevEventObj[0].hasOwnProperty("teachers") && prevEventObj[0]['teachers'].length > 1 ||
                prevEventObj[0].hasOwnProperty("students") && prevEventObj[0]['students'].length >= 1 &&
                prevEventObj[0].hasOwnProperty("teachers") && prevEventObj[0]['teachers'].length >= 1
              ) {
                dropableEvent = self.calendar.fullCalendar('clientEvents', function (el) {
                    return el.end != null &&
                            resourceId == el.resourceId &&
                            // prevEvent.resourceId+prevEvent.startHour == el.id &&
                            resourceId + startHour != el.id &&
                            (
                                (
                                    startHour.getTime() <= el.start.getTime() &&
                                    endHour.getTime() >= el.end.getTime()
                                ) ||
                                (
                                    el.start.getTime() <= startHour.getTime() &&
                                    el.end.getTime() >= endHour.getTime()
                                ) ||
                                (
                                    endHour.getTime() > el.start.getTime() &&
                                    el.end.getTime() > startHour.getTime()
                                )
                            )
                });
            } else {
                dropableEvent = self.calendar.fullCalendar('clientEvents', function (el) {
                    return el.end != null &&
                            resourceId == el.resourceId &&
                            prevEvent.resourceId + prevEvent.startHour != el.id &&
                            resourceId + startHour != el.id &&
                            (
                                (
                                    startHour.getTime() <= el.start.getTime() &&
                                    endHour.getTime() >= el.end.getTime()
                                ) ||
                                (
                                    el.start.getTime() <= startHour.getTime() &&
                                    el.end.getTime() >= endHour.getTime()
                                ) ||
                                (
                                    endHour.getTime() > el.start.getTime() &&
                                    el.end.getTime() > startHour.getTime()
                                )
                            )
                });
            }
        } else {
            dropableEvent = self.calendar.fullCalendar('clientEvents', function (el) {
                return el.end != null &&
                        resourceId == el.resourceId &&
                        resourceId + startHour != el.id &&
                        (
                            (
                                startHour.getTime() <= el.start.getTime() &&
                                endHour.getTime() >= el.end.getTime()
                            ) ||
                            (
                                el.start.getTime() <= startHour.getTime() &&
                                el.end.getTime() >= endHour.getTime()
                            ) ||
                            (
                                endHour.getTime() > el.start.getTime() &&
                                el.end.getTime() > startHour.getTime()
                            )
                        )
            });
        }
        if (dropableEvent.length) {
            allowToDropStudent = false;
        }
        return allowToDropStudent;
    }

    this.checkEventIsOneToOne = function (studentList) {
        var self = this;
        var is1to1 = false;
        if (studentList != undefined && studentList.length) {
            for (var i = 0; i < studentList.length; i++) {
                if (studentList[i].is1to1) {
                    is1to1 = true;
                    break;
                }
            }
        }
        return is1to1
    }

    this.checkForStaffAvailability = function (teacherId, startHour) {
        var self = this;
        var teacherIsAvialble = false;
        var currentCalendarDate = self.calendar.fullCalendar('getDate');
        var startHour1 = new Date(startHour);
        startHour1 = self.convertToMinutes(moment(startHour1).format("h:mm A"));
        var endHour1 = startHour1 + 60;
        startHour = new Date(startHour);
        startHour = startHour.getHours();
        var teacher = self.taList.filter(function (x) {
            if (x.id == teacherId && x.startHour <= startHour && startHour < x.endHour) {
                return x;
            };
        });
        teacher.forEach(function (staff, key) {
            var staffStartTime = new Date(moment(teacher[key]['startDate'], "MM/DD/YYYY").format("MM/DD/YYYY") + " " + teacher[0]['startTime']);
            var staffEndTime = new Date(moment(teacher[key]['endDate'], "MM/DD/YYYY").format("MM/DD/YYYY") + " " + teacher[0]['endTime']);
            if (self.taList.length) {
                for (var i = 0; i < self.taList.length; i++) {
                    var startDateTime = new Date(moment(self.taList[i]['startDate'], "MM/DD/YYYY").format("MM/DD/YYYY") + " " + self.taList[i]['startTime']);
                    var endDateTime = new Date(moment(self.taList[i]['endDate'], "MM/DD/YYYY").format("MM/DD/YYYY") + " " + self.taList[i]['endTime']);
                    if (startDateTime.getTime() <= staffStartTime.getTime() && self.taList[i]['id'] == teacherId && staffEndTime.getTime() <= endDateTime.getTime()) {
                        teacherIsAvialble = true;
                        break;
                    }
                }
            }
        });
        if (this.staffExceptions.length && teacherIsAvialble) {
            for (var i = 0; i < this.staffExceptions.length; i++) {
                var staffDetail = this.staffExceptions[i];
                if (staffDetail['astaff_x002e_hub_staffid'] == teacherId &&
                    (
                        (
                            startHour1 <= staffDetail['hub_starttime'] &&
                            endHour1 >= staffDetail['hub_endtime']
                        ) ||
                        (
                            staffDetail['hub_starttime'] <= startHour1 &&
                            staffDetail['hub_endtime'] >= endHour1
                        ) ||
                        (
                            endHour1 > staffDetail['hub_starttime'] &&
                            staffDetail['hub_endtime'] > startHour1
                        )
                    )) {
                    teacherIsAvialble = false;
                    break;
                }
            }
        }
        return teacherIsAvialble;
    }

    // Student drag and drop case
    this.checkNonPreferredTeacher = function (studentObj, newEvent) {
        var self = this;
        var nonPreferedTeacher = false;
        if (studentObj['nonPreferredTeacher'] != undefined) {
            if (newEvent.hasOwnProperty('teachers') && newEvent['teachers'].length > 0) {
                for (var i = 0; i < newEvent['teachers'].length; i++) {
                    if (newEvent['teachers'][i]['id'] == studentObj['nonPreferredTeacher']) {
                        nonPreferedTeacher = true;
                        break;
                    }
                }
            }
        }
        return nonPreferedTeacher;
    }

    // Teacher drag and drop case
    this.checkNonPreferredStudentForTeacher = function (teacherId, newEvent) {
        var self = this;
        var nonPreferedTeacher = false;
        if (teacherId != undefined) {
            if (newEvent.hasOwnProperty('students') && newEvent['students'].length > 0) {
                for (var i = 0; i < newEvent['students'].length; i++) {
                    if (newEvent['students'][i]['nonPreferredTeacher'] != undefined &&
                          newEvent['students'][i]['nonPreferredTeacher'] == teacherId) {
                        nonPreferedTeacher = true;
                        break;
                    }
                }
            }
        }
        return nonPreferedTeacher;
    }

    // remove Non preferred teacher coflict check for prev event
    this.checkNonPreferredTeacherConflict = function (prevEvent) {
        var self = this;
        var isNonPreferred = false;
        if (prevEvent.hasOwnProperty('students') && prevEvent.hasOwnProperty('teachers') && prevEvent['students'].length > 0 && prevEvent['teachers'].length > 0) {
            for (var i = 0; i < prevEvent['teachers'].length; i++) {
                for (var j = 0; j < prevEvent['students'].length; j++) {
                    if (prevEvent['teachers'][i]['id'] == prevEvent['students'][j]['nonPreferredTeacher']) {
                        isNonPreferred = true;
                        break;
                    }
                }
                if (isNonPreferred) {
                    break;
                }
            }
        }
        return isNonPreferred;
    }

    // remove conflicts form previous event from where we dragged students/ teacher 
    this.removeAllConflictsFromPrevEvent = function (prevEvent) {
        var self = this;
        var resourceObj = self.getResourceObj(prevEvent["resourceId"]);
        // oneToOne conflict removal prevevent student Darg
        if (prevEvent['students'] != undefined && prevEvent['students'].length != 0) {
            var eventIs1to1 = self.checkEventIsOneToOne(prevEvent['students']);
            if (eventIs1to1) {
                prevEvent['is1to1'] = true;
            } else {
                prevEvent['is1to1'] = false;
            }
        } else {
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
        } else if (prevEvent.hasOwnProperty('students') && prevEvent['noOfStudents'] <= 1) {
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
        if (prevEvent.hasOwnProperty('students') && resourceObj['capacity'] >= prevEvent['noOfStudents']) {
            var msgIndex = prevEvent.conflictMsg.map(function (x) {
                return x;
            }).indexOf(1);
            if (msgIndex > -1) {
                prevEvent.conflictMsg.splice(msgIndex, 1);
            }
            self.updateConflictMsg(prevEvent);
        }

        if (prevEvent.hasOwnProperty('students') && resourceObj['capacity'] > prevEvent['noOfStudents']) {
            if (prevEvent.title.indexOf('<span class="student-placeholder-' + prevEvent.deliveryType + '">Student name</span>') == -1) {
                prevEvent.title += '<span class="student-placeholder-' + prevEvent.deliveryType + '">Student name</span>';
                self.addContext("", 'studentPlaceholder', true, prevEvent.deliveryTypeCode);
            }
        }

        // remove Non Preferred Teacher Conflict
        var isNonPreferred = self.checkNonPreferredTeacherConflict(prevEvent);
        if (!isNonPreferred) {
            var msgIndex = prevEvent.conflictMsg.map(function (x) {
                return x;
            }).indexOf(3);
            if (msgIndex > -1) {
                prevEvent.conflictMsg.splice(msgIndex, 1);
            }
            self.updateConflictMsg(prevEvent);
        }

        // remove Slot Timings Overlap Conflict
        if ((!prevEvent.hasOwnProperty('students') || prevEvent['students'].length == 0) &&
          (!prevEvent.hasOwnProperty('teachers') || prevEvent['teachers'].length == 0)) {
            var msgIndex = prevEvent.conflictMsg.map(function (x) {
                return x;
            }).indexOf(4);
            if (msgIndex > -1) {
                prevEvent.conflictMsg.splice(msgIndex, 1);
            }
            self.updateConflictMsg(prevEvent);
        }
    }

    this.scrollToEvent = function () {
        var self = this;
        var currentCalendarDate = moment(this.calendar.fullCalendar('getDate')).format("MM-DD-YYYY");
        var dateObj = new Date(currentCalendarDate + " " + "08:00 AM");
        var first = true;
        if (this.eventList.length) {
            for (var i = 0; i < this.eventList.length; i++) {
                var tempDate = moment(this.eventList[i]['start']).format("MM-DD-YYYY");
                var resourceObj = this.getResourceObj(this.eventList[i]['resourceId']);
                var index = this.selectedDeliveryType.map(function (y) {
                    return y;
                }).indexOf(resourceObj['deliveryTypeId']);
                if (currentCalendarDate == tempDate && index != -1) {
                    if (first) {
                        dateObj = this.eventList[i]['start'];
                        first = false;
                    }
                    if (dateObj > this.eventList[i]['start']) {
                        dateObj = this.eventList[i]['start'];
                    }
                }
            }
        }
        var n = dateObj.getHours();
        var scrollNum = ((n - 8) * wjQuery(".fc-slot1").height() * 4) - 2;
        wjQuery("#scrollarea").animate({ scrollTop: scrollNum });
    }

    this.getLocationObject = function (locationId) {
        var self = this;
        // var locationObj = data.getLocation();
        // var locationObj1 = {};
        self.locationList = self.locationList == null ? [] : self.locationList;
        for (var i = 0; i < self.locationList.length; i++) {
            if (locationId == self.locationList[i]['hub_centerid']) {
                self.locationList[i]['ownerObj'] = {
                    id: self.locationList[i]['_ownerid_value'],
                    entityType: self.locationList[i]['_ownerid_value@Microsoft.Dynamics.CRM.lookuplogicalname']
                }
                return self.locationList[i];
                break;
            }
        }
    }

    this.floatTeacher = function (floatTeacherObj, placeholderEvent) {
        var self = this;
        floatTeacherObj = floatTeacherObj == null ? [] : floatTeacherObj;
        var selectedPlaceHolder = wjQuery(placeholderEvent).next("span").attr("uniqueid");
        var currentView = self.calendar.fullCalendar('getView');
        var startDate = moment(currentView.start).format("YYYY-MM-DD");
        if (selectedPlaceHolder != undefined) {
            if(floatTeacherObj.length){
                var idArry = selectedPlaceHolder.split('_');
                wjQuery("#makeup .makeup-lst").html("");
                wjQuery("#makeup input").val("");
                wjQuery("#makeup").dialog({
                    resizable: false,
                    height: 300,
                    width: 350,
                    modal: true,
                    draggable:false,
                    show: {
                        effect: 'slide',
                        complete: function () {
                            wjQuery(".loading").hide();
                        }
                    },
                    buttons: {
                        Cancel: function () {
                            wjQuery(this).dialog("close");
                        }
                    }
                });
                wjQuery("#makeup").dialog('option', 'title', 'Add Float');
                self.floatItemPopulation(floatTeacherObj);
                self.floatSearch(floatTeacherObj, idArry);
                self.floatClickEvent(floatTeacherObj, idArry);
            }else{
                wjQuery("#makeup .error_block").html("");
                wjQuery("#makeup .makeup-lst").html('No Teachers found');
                wjQuery("#makeup").dialog({
                    resizable: false,
                    height: 300,
                    width: 350,
                    draggable:false,
                    modal: true,
                    show: {
                        effect: 'slide',
                        complete: function () {
                            wjQuery(".loading").hide();
                        }
                    },
                    buttons: {
                        Cancel: function () {
                            wjQuery(this).dialog("close");
                        }
                    }
                });
                wjQuery("#makeup").dialog('option', 'title', 'Add Float');
            }
        }else{
            wjQuery("#makeup").dialog("close");
            wjQuery(".loading").hide();
        }
        wjQuery(".loading").hide();
    }


    this.floatClickEvent = function(floatTeacherObj, idArry){
        var self = this;
        wjQuery(".float-item").click(function (event) {
            wjQuery(".loading").show();
            var teacherId = wjQuery(this).attr("id");
            setTimeout(function () {
                // var teacherObj = floatTeacherObj.filter(function (obj) {
                //     return obj.hub_staffid == teacherId ;
                // });
                var teacherObj = [];
                for (var s = 0; s < floatTeacherObj.length; s++) {
                    var obj = floatTeacherObj[s];
                    if (obj.hub_staffid == teacherId) {
                        teacherObj.push(obj);
                        break;
                    }
                }
                var allowToDropTeacher = self.validateTeacherOnSameRow(teacherId, idArry[2], teacherObj[0], false);
                if (allowToDropTeacher) {
                    if (self.checkTeacherScheduleInDiffCenter(teacherId, idArry[2])) {
                        wjQuery(".loading").hide();
                        wjQuery("#makeup").dialog("close");
                        self.prompt("The selected staff is already scheduled for the respective timeslot in different center.");
                    } else {
                        var isStaffAvailable = self.checkForStaffAvailability(teacherId, idArry[2]);
                        if (isStaffAvailable) {
                            var objStaffSch = {};
                            if (teacherObj.length) {
                                teacherObj = teacherObj[0];
                                var startTime = moment(idArry[2]).format("hh:mm A");
                                var startObj = new Date(idArry[2]);
                                objStaffSch["hub_resourceid@odata.bind"] = idArry[1];
                                objStaffSch['hub_date'] = startDate;
                                objStaffSch["hub_start_time"] = self.convertToMinutes(startTime);
                                objStaffSch["hub_end_time"] = self.convertToMinutes(startTime) + 60;
                                objStaffSch["hub_schedule_type"] = FLOAT_TEACHER_TYPE;
                                objStaffSch["hub_staff@odata.bind"] = teacherObj['hub_staffid'];
                                var locationObj = self.getLocationObject(self.locationId);
                                objStaffSch['ownerObj'] = locationObj['ownerObj'];
                                objStaffSch['hub_centerid'] = locationObj['hub_centerid'];
                                var responseObj = data.saveTeacherFloat(objStaffSch);
                                if (typeof (responseObj) == "object") {
                                    var teacherObj = {
                                        id: teacherObj['hub_staffid'],
                                        name: teacherObj['hub_name'],
                                        start: new Date(idArry[2]),
                                        startHour: new Date(idArry[2]),
                                        end: new Date(startObj.setHours(startObj.getHours() + 1)),
                                        resourceId: idArry[1],
                                        locationId: self.locationId,
                                        scheduleType: FLOAT_TEACHER_TYPE,
                                        scheduleId: responseObj["hub_staff_scheduleid"],
                                        centerId: self.locationId
                                    };
                                    self.convertedTeacherObj.push(teacherObj);
                                    self.populateTeacherEvent([teacherObj], true);
                                    self.populateTAPane(self.taList);
                                }
                                wjQuery("#makeup").dialog("close");
                            } else {
                                wjQuery("#makeup").dialog("close");
                            }
                            wjQuery(".loading").hide();
                        } else {
                            wjQuery(".loading").hide();
                            self.floatTeacherCnfmPopup(teacherObj, idArry, "Teacher is not available. Do you wish to continue?");
                            wjQuery("#makeup").dialog("close");
                        }
                    }
                } else {
                    wjQuery(".loading").hide();
                    wjQuery("#makeup").dialog("close");
                    self.prompt("The selected staff is already scheduled for the respective timeslot.");
                }
            }, 300);
        });
    }

    this.floatTeacherCnfmPopup = function (teacherObj, idArry, message) {
        var self = this;
        wjQuery("#dialog > .dialog-msg").text(message);
        wjQuery("#dialog").dialog({
            resizable: false,
            height: "auto",
            width: 350,
            draggable: false,
            modal: true,
            buttons: {
                Yes: function () {
                    self.floatTeacherDrop(teacherObj, idArry);
                    wjQuery(this).dialog("close");
                },
                No: function () {
                    wjQuery(this).dialog("close");
                }
            }
        });
    }

    this.floatTeacherDrop = function (teacherObj, idArry) {
        self = this;
        var objStaffSch = {};
        if (teacherObj.length) {
            teacherObj = teacherObj[0];
            var startTime = moment(idArry[2]).format("hh:mm A");
            var startObj = new Date(idArry[2]);
            objStaffSch["hub_resourceid@odata.bind"] = idArry[1];
            objStaffSch['hub_date'] = startDate;
            objStaffSch["hub_start_time"] = self.convertToMinutes(startTime);
            objStaffSch["hub_end_time"] = self.convertToMinutes(startTime) + 60;
            objStaffSch["hub_schedule_type"] = FLOAT_TEACHER_TYPE;
            objStaffSch["hub_staff@odata.bind"] = teacherObj['hub_staffid'];
            var locationObj = self.getLocationObject(self.locationId);
            objStaffSch['ownerObj'] = locationObj['ownerObj'];
            objStaffSch['hub_centerid'] = locationObj['hub_centerid'];
            var responseObj = data.saveTeacherFloat(objStaffSch);
            if (typeof (responseObj) == "object") {
                var teacherObj = {
                    id: teacherObj['hub_staffid'],
                    name: teacherObj['hub_name'],
                    start: new Date(idArry[2]),
                    startHour: new Date(idArry[2]),
                    end: new Date(startObj.setHours(startObj.getHours() + 1)),
                    resourceId: idArry[1],
                    locationId: self.locationId,
                    scheduleType: FLOAT_TEACHER_TYPE,
                    scheduleId: responseObj["hub_staff_scheduleid"],
                    centerId: self.locationId
                };
                self.convertedTeacherObj.push(teacherObj);
                self.populateTeacherEvent([teacherObj], true);
                self.populateTAPane(self.taList);
            }
            wjQuery("#makeup").dialog("close");
        } else {
            wjQuery("#makeup").dialog("close");
        }
        wjQuery(".loading").hide();
    }

    this.updateEventTitle = function (eventObj, element) {
        var self = this;
        var eventTitleHTML = wjQuery(eventObj[0].title);
        for (var i = 0; i < eventTitleHTML.length; i++) {
            if (wjQuery(eventTitleHTML[i]).attr('value') == wjQuery(element).attr('value')) {
                eventTitleHTML[i] = element;
            }
        }
        if (eventTitleHTML.prop('outerHTML') != undefined) {
            if (eventTitleHTML.length == 1) {
                eventObj[0].title = eventTitleHTML.prop('outerHTML');
            } else {
                eventObj[0].title = "";
                for (var i = 0; i < eventTitleHTML.length; i++) {
                    eventObj[0].title += eventTitleHTML[i].outerHTML;
                }
            }
            self.calendar.fullCalendar('updateEvent', eventObj);
            self.draggable('draggable');
        }
    }

    if (!('remove' in Element.prototype)) {
        Element.prototype.remove = function () {
            if (this.parentNode) {
                this.parentNode.removeChild(this);
            }
        };
    }

    this.scrollVertically = function () {
        var screenWidth = window.screen.width;
        screenWidth = screenWidth.toString();
        var minScrollingCoord = screenWidth - 380;  //380 is filter and timeslot width + resource width
        var maxScrollingCoord = wjQuery('.fc-agenda-slots').width();
        var draggedEl = wjQuery('.ui-draggable-dragging');
        var scollArea = wjQuery('.fc-scroll-content');
        var scrollWidth = scollArea.scrollLeft();
        draggedEl = draggedEl[0];
        if (draggedEl.offsetLeft) {
            if (mouseX > minScrollingCoord && mouseX <= maxScrollingCoord) {
                scrollWidth = scrollWidth + 250;
                scollArea.animate({ scrollLeft: scrollWidth }, "fast");
            } else if (mouseX <= 250 && scrollWidth != 0) {
                scrollWidth = scrollWidth - 250;
                scollArea.animate({ scrollLeft: scrollWidth }, "fast");
            }
        }
    }

    var mouseX;
    this.bindMouseMovement = function () {
        wjQuery('#scrollarea').off('mousemove').on('mousemove', function (e) {
            mouseX = e.clientX;
        })
    }

    this.checkTeacherScheduleInDiffCenter = function (teacherId, startHour, endHour) {
        var self = this;
        var StaffAvailable = false;
        startHour = new Date(startHour);
        // Set end hour to start hour + 1
        if (!endHour) {
            endHour = new Date(startHour);
            endHour = new Date(endHour.setHours(endHour.getHours() + 1));
        } else {
            endHour = new Date(startHour);
            endHour = new Date(endHour.setHours(endHour / 60));
        }
        for (var ab = 0; ab < self.convertedTeacherObj.length; ab++) {
            var el = self.convertedTeacherObj[ab];
            var elStart = new Date(el['start']);
            var elEnd = new Date(el['end']);
            // var elStart = new Date(el['hub_date@OData.Community.Display.V1.FormattedValue']+" "+ el['hub_start_time@OData.Community.Display.V1.FormattedValue']);
            // var elEnd = new Date(el['hub_date@OData.Community.Display.V1.FormattedValue']+" "+ el["hub_end_time@OData.Community.Display.V1.FormattedValue"]);
            if (el['id'] == teacherId &&
                el['centerId'] != self.locationId &&
                (
                    (
                        startHour.getTime() <= elStart.getTime() &&
                        endHour.getTime() >= elEnd.getTime()
                    ) ||
                    (
                        elStart.getTime() <= startHour.getTime() &&
                        elEnd.getTime() >= endHour.getTime()
                    ) ||
                    (
                        endHour.getTime() > elStart.getTime() &&
                        elEnd.getTime() > startHour.getTime()
                    )
                )
            ) {
                StaffAvailable = true;
                break;
            }
        }
        return StaffAvailable;
    }

    this.checkTeacherScheduleInSameCenter = function (teacherId, startHour, endHour) {
        var self = this;
        var StaffAvailable = false;
        startHour = new Date(startHour);
        // Set end hour to start hour + 1
        
        for (var ab = 0; ab < self.convertedTeacherObj.length; ab++) {
            var el = self.convertedTeacherObj[ab];
            var elStart = new Date(el['start']);
            var elEnd = new Date(el['end']);
            // var elStart = new Date(el['hub_date@OData.Community.Display.V1.FormattedValue']+" "+ el['hub_start_time@OData.Community.Display.V1.FormattedValue']);
            // var elEnd = new Date(el['hub_date@OData.Community.Display.V1.FormattedValue']+" "+ el["hub_end_time@OData.Community.Display.V1.FormattedValue"]);
            if (el['id'] == teacherId &&
                // el['centerId'] != self.locationId &&
                (
                    (
                        startHour.getTime() <= elStart.getTime() &&
                        endHour.getTime() >= elEnd.getTime()
                    ) ||
                    (
                        elStart.getTime() <= startHour.getTime() &&
                        elEnd.getTime() >= endHour.getTime()
                    ) ||
                    (
                        endHour.getTime() > elStart.getTime() &&
                        elEnd.getTime() > startHour.getTime()
                    )
                )
            ) {
                StaffAvailable = true;
                break;
            }
        }
        return StaffAvailable;
    }

    this.checkAccountClosure = function () {
        var self = this;
        var closed = false;
        if (self.accountClosure != null && self.accountClosure.length) {
            if (self.accountClosure[0]['hub_status'] == 2) {
                closed = true;
            }
        }
        return closed;
    }

    this.getRandomInt = function( min, max ) {
        return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
    }

    this.generateUniqueId = function() {
        var ts = this.timestamp.toString();
        var parts = ts.split( "" ).reverse();
        var id = "";
        for( var i = 0; i < this.uniqueIdLength; ++i ) {
            var index = this.getRandomInt( 0, parts.length - 1 );
            id += parts[index];  
        }
        return id;
    }


    this.checkEventValidation = function (newEventId, prevEventId, newStudentObj, element, newResourceObj, prevStudObj, startHour) {
        var self = this;
        var messageObject = {
            alert: [],
            confirmation: [],
        };

        var stuId = wjQuery(element).attr("value");
        var studUniqueId = wjQuery(element).attr("studUniqueId");
        var newEvent = this.calendar.fullCalendar('clientEvents', newEventId);
        var prevEvent = this.calendar.fullCalendar('clientEvents', prevEventId);

        // 1. GI Validation
        // 2. Valdation on same row for PI sessions
        // 3. Duplicate student validation for droping Pi and Gf
        // 4. Instructional Hour validation 
        // Different DT case
        if (newResourceObj.deliveryTypeCode != newStudentObj.deliveryTypeCode) {
            if (messageObject.confirmation.indexOf(" DeliveryType is different") == -1) {
                messageObject.confirmation.push(" DeliveryType is different");
            }
        }

        //InstructionalHour Validation
        //var instructionalHourValidation = self.checkInstructionalHours(newStudentObj, startHour);
        //if (!instructionalHourValidation) {
        //    messageObject.alert.push(" Instructional Hour is not available");
        //}

        if(newEvent.length){
            // Non prefered teacher.
            var nonPreferedTeacher = self.checkNonPreferredTeacher(newStudentObj, newEvent[0]);
            if(nonPreferedTeacher){
               if (messageObject.confirmation.indexOf(" Non preferred teacher") == -1) {
                    messageObject.confirmation.push(" Non preferred teacher");
                } 
            }

            if(newEvent[0].hasOwnProperty('students') && newEvent[0]['students'].length){
             
                // Capacity check
                if(newEvent[0]['noOfStudents'] >= newResourceObj.capacity){
                    if (messageObject.confirmation.indexOf(" Capacity has reached the maximum") == -1) {
                        messageObject.confirmation.push(" Capacity has reached the maximum");
                    }   
                }

                if(newResourceObj.deliveryTypeCode == personalInstruction){
                    var eventIs1to1 = self.checkEventIsOneToOne(newEvent[0]['students']);
                    if(eventIs1to1){
                        if (messageObject.confirmation.indexOf(" Session is OneToOne") == -1) {
                            messageObject.confirmation.push(" Session is OneToOne");
                        }
                    }
                    // showPromt = false;
                    // wjQuery.each(newEvent[0]['students'], function (k, v) {
                    //     if (v['is1to1']) {
                    //         showPromt = true;
                    //         return true;
                    //     }
                    // });
                    // if(showPromt){
                    //     if (messageObject.confirmation.indexOf(" Session is OneToOne") == -1) {
                    //         messageObject.confirmation.push(" Session is OneToOne");
                    //     }
                    // }
                }else{
                    var newServiceId = newStudentObj['serviceId'];
                    var showPromt = false;
                    wjQuery.each(newEvent[0]['students'], function (k, v) {
                        if (v.serviceId != newServiceId) {
                            showPromt = true;
                            return true;
                        }
                    });
                    if(showPromt){
                        if (messageObject.confirmation.indexOf(" Services are not matching") == -1) {
                            messageObject.confirmation.push(" Services are not matching");
                        }
                    }
                }
            }
        }

        return messageObject;
    }

    this.sofvalidation = function(studentObj){
        var self = this;
        var allowToPush = true;
        var prevStudObj = [];
        if(self.sofList.length){
            prevStudObj = this.sofList['Personal Instruction'].filter(function (x) {
                return  x.id == studentObj.id &&
                        x.enrollmentId == studentObj.enrollmentId &&
                        x.start.getTime() == new Date(studentObj.start).getTime()
            })
            if (prevStudObj.length == 0) {
                prevStudObj = this.sofList['Group Facilitation'].filter(function (x) {
                    return  x.id == studId &&
                            x.enrollmentId == enrollmentId &&
                            x.start.getTime() == new Date(studentObj.start).getTime()
                })
                if (prevStudObj.length == 0) {
                    prevStudObj = this.sofList['Group Instruction'].filter(function (x) {
                        return  x.id == studentObj.id &&
                                x.enrollmentId == studentObj.enrollmentId &&
                                x.start.getTime() == new Date(studentObj.start).getTime()
                    })
                }
            }
        }
        if(prevStudObj.length){
            allowToPush = false;
        }
        return allowToPush;
    }

    this.addSessionTypeIndicator = function (sessionType) {
        var indicator;
        var title="";
            if (sessionType == FLOAT_TYPE) {
                indicator = FLOAT_LABEL;
            } else if (sessionType == MAKEUP_TYPE) {
                indicator = MAKEUP_LABEL;
            }
            if (indicator) {
                title = "<span class='typeIndicator'>" + indicator + "</span>";
            }
            return title;
    };

    this.checkClosure = function (date) {
        var self = this;
        date = new Date(date);
        var locationObj = self.getLocationObject(self.locationId);
        var parentCenterId = locationObj['_hub_parentcenter_value'];
        if (parentCenterId == undefined) {
            parentCenterId = locationObj['hub_centerid'];
        }
        var accntClosure = data.getAccountClosure(parentCenterId, (date.getMonth() + 1), date.getFullYear());
        if (accntClosure && accntClosure.length) {
            if (accntClosure[0]['hub_status'] == 2) {
                return true;
            }
        }
        return false;
    }

    this.checkInstructionalHours = function (student,startHour) {
        var currentCalendarDate = this.calendar.fullCalendar('getDate');
        var formattedStartTime = moment(startHour).format("h:mm A");
        startHour = this.convertToMinutes(moment(startHour).format("h:mm A"));
        var endHour = startHour + student.duration;
        var result = false;
        if (student.deliveryTypeCode == groupInstruction) {
            return true;
        }
        if (instructionalHours) {
            var workHours = instructionalHours.filter(function (workHour) {
                if (student['namedGfid']) {
                    return workHour ? workHour._hub_workhours_value == student.namedGfid : [];
                } else {
                    if (workHour['adeliverytype_x002e_hub_code'] == student.deliveryTypeCode && student.timeSlotType == workHour.hub_timeslottype) {
                        return workHour;
                    }
                }
            });
            if (workHours) {
                var availableTimings = [];
                wjQuery.each(workHours, function (key, val) {
                    if (val['hub_effectiveenddate']) {
                        if (currentCalendarDate.getTime() >= new Date(moment(val['hub_effectivestartdate']).format("MM-DD-YYYY")).getTime() &&
                            currentCalendarDate.getTime() <= new Date(moment(val['hub_effectiveenddate']).format("MM-DD-YYYY")).getTime()) {
                            if (startHour >= val['hub_starttime'] && startHour <= val['hub_endtime'] && endHour <= val['hub_endtime'] && endHour >= val['hub_starttime']) {
                                var startTime = val.hub_starttime;
                                availableTimings.push(startTime);
                                while ((startTime + student.duration) < val.hub_endtime) {
                                    startTime += student.duration;
                                    availableTimings.push(startTime);
                                }
                            }
                        }
                    } else {
                        if (currentCalendarDate.getTime() >= new Date(moment(val['hub_effectivestartdate']).format("MM-DD-YYYY")).getTime() &&
                            startHour >= val['hub_starttime'] && startHour <= val['hub_endtime'] && endHour <= val['hub_endtime'] && endHour >= val['hub_starttime']) {
                            var startTime = val.hub_starttime;
                            availableTimings.push(startTime);
                            while ((startTime + student.duration) < val.hub_endtime) {
                                startTime += student.duration;
                                availableTimings.push(startTime);
                            }
                        }
                    }
                });
                if (availableTimings.indexOf(startHour) != -1) {
                    result = true;
                }
            }
        }
        return result;
    }

    this.addMarginToSidePane = function () {
        var self = this;
            wjQuery(".open").removeClass("moveLeft");
            if (self.resourceList.length == 6) {
                wjQuery(".open").addClass("moveLeft");
            } else if (self.resourceList.length > 6) {
                var scrollLeft = wjQuery(".fc-scroll-content").scrollLeft();
                var scrollWidth = wjQuery(".fc-scroll-content")[0].scrollWidth;
                var scrollContentWidth = wjQuery(".fc-scroll-content").width();
                if (scrollContentWidth == (scrollWidth - scrollLeft)) {
                    wjQuery(".open").addClass("moveLeft");
                }
            }
    }

    this.removeExceptionalHours = function (obj, endTime, exceptionTimeArray) {
        var self = this;
        obj.startHour = self.convertToMinutes(obj.startTime);
        obj.endHour = self.convertToMinutes(obj.endTime);
        var eventObjList = [];
        exceptionTimeArray.forEach(function (exception, key) {
            if (key == 0) {
                if (obj.startHour >= exception.exceptionStartHour && obj.startHour < exception.exceptionEndHour && obj.endHour > exception.exceptionStartHour) {
                    obj.startTime = self.tConvert(self.convertMinsNumToTime(exception.exceptionEndHour));
                    obj.startHour = exception.exceptionEndHour;
                    eventObjList.push(obj);
                } else if (exception.exceptionStartHour >= obj.startHour && obj.startHour < exception.exceptionEndHour && obj.endHour > exception.exceptionStartHour) {
                    obj.endTime = self.tConvert(self.convertMinsNumToTime(exception.exceptionStartHour));
                    obj.endHour = exception.exceptionStartHour;
                    eventObjList.push(obj);
                    var splittedObj = wjQuery.extend(true,{},obj);
                    splittedObj.startTime = self.tConvert(self.convertMinsNumToTime(exception.exceptionEndHour));
                    splittedObj.startHour = exception.exceptionEndHour;
                    splittedObj.endTime = endTime;
                    splittedObj.endHour = self.convertToMinutes(endTime);
                    eventObjList.push(splittedObj);
                }
            } else {
                var lastObject = eventObjList[eventObjList.length - 1]
                if ((lastObject.startHour > exception.exceptionStartHour && lastObject.startHour < exception.exceptionEndHour) && lastObject.endHour > exception.exceptionStartHour) {
                    lastObject.startTime = self.tConvert(self.convertMinsNumToTime(exception.exceptionEndHour));
                    lastObject.startHour = exception.exceptionEndHour;
                    eventObjList[eventObjList.length - 1] = lastObject;
                } else if (exception.exceptionStartHour >= lastObject.startHour && lastObject.startHour < exception.exceptionEndHour && lastObject.endHour > exception.exceptionStartHour) {
                    if (lastObject.startHour == exception.exceptionStartHour) {
                        lastObject.startTime = self.tConvert(self.convertMinsNumToTime(exception.exceptionEndHour));
                        lastObject.startHour = exception.exceptionEndHour;
                        eventObjList[eventObjList.length - 1] = lastObject;
                    } else {
                        lastObject.endTime = self.tConvert(self.convertMinsNumToTime(exception.exceptionStartHour));
                        lastObject.endHour = exception.exceptionStartHour;
                        var splittedObj = wjQuery.extend(true, {}, lastObject);
                        splittedObj.startTime = self.tConvert(self.convertMinsNumToTime(exception.exceptionEndHour));
                        splittedObj.startHour = exception.exceptionEndHour;
                        splittedObj.endTime = endTime;
                        splittedObj.endHour = self.convertToMinutes(endTime);
                        eventObjList.push(splittedObj);
                    }
                }
            }
        });

        eventObjList.forEach(function (eventObj) {
            if (!eventObj.endDate) {
                eventObj.endDate = new Date();
                eventObj.endDate = moment(eventObj.endDate).format("MM/DD/YYYY");
            }
            eventObj.startHour = new Date(moment(eventObj.startDate, "MM/DD/YYYY").format("MM/DD/YYYY") + " " + eventObj.startTime).getHours();
            eventObj.endHour = new Date(moment(eventObj.endDate, "MM/DD/YYYY").format("MM/DD/YYYY") + " " + eventObj.endTime).getHours();
        });
        return eventObjList;
    }

    var windowWidth;
    var calendarWidth;
    var computedWidth;
    var horizantalScroll
    var overlappingResolution = false;
    this.attachMouseEvent = function () {
        var self = this;
            if (calendarWidth < windowWidth && computedWidth < calendarWidth) {
                overlappingResolution = true;
            } else {
                overlappingResolution = false;
                wjQuery(".open").removeClass("bg");
                wjQuery(".stick").removeClass("stick");
            }

        wjQuery("body").off("click").on("click", ".open", function (e) {
            if (!wjQuery(e.target).hasClass("ta-close-icon") && overlappingResolution) {
                wjQuery(".open").addClass("stick");
                wjQuery(".open").removeClass("bg");
                wjQuery("#calendar").removeClass("stick");
            }
        });

        wjQuery("#calendar").off("click").on("click", function (e) {
            if (overlappingResolution) {
                wjQuery(".open").removeClass("stick");
                wjQuery(".open").addClass("bg");
                wjQuery("#calendar").addClass("stick");
            }
        });
    }

}

