var data = new Data();
var deliveryType = data.getDeliveryType();
var currentCalendarDate = moment(new Date()).format("YYYY-MM-DD");
setTimeout(function(){
  var deliveryTypeList = [];
    var sylvanCalendar = new SylvanCalendar();
    sylvanCalendar.init("widget-calendar");
    var locationId = sylvanCalendar.populateLocation(data.getLocation());
    setTimeout(function(){
    for (var i = 0; i < deliveryType.length; i++) {
      switch(deliveryType[i]['hub_name']){
        case 'Personal Instruction':
          wjQuery('#pi-btn input').val(deliveryType[i]['hub_deliverytypeid']);
          deliveryTypeList.push(deliveryType[i]['hub_deliverytypeid']);
          break;
        case 'Group Instruction':
          wjQuery('#gi-btn input').val(deliveryType[i]['hub_deliverytypeid']);
          break;
      }
    }

    wjQuery(".loc-dropdown .dropdown-menu").on('click', 'li a', function(){
        if(wjQuery(".loc-dropdown .btn:first-child").val() != wjQuery(this).attr('value-id')){
          wjQuery(".loc-dropdown .btn:first-child").text(wjQuery(this).text());
          wjQuery(".loc-dropdown .btn:first-child").val(wjQuery(this).attr('value-id'));
          locationId = wjQuery(this).attr('value-id');
          return fetchResources(locationId,deliveryTypeList,true);
        }
    });
    var resources = [];
    function fetchResources(locationId,selectedDeliveryType,fetchData){
      // asign deliverytpeList to  
      sylvanCalendar.selectedDeliveryType = selectedDeliveryType;
      var resourceList = [];
      if(fetchData){
        var obj = data.getResources(locationId);
        resources = obj == null ? [] : obj;
        if(resources.length){
          var pi = [];
          var gi = [];
          var gf = [];
          for (var i = 0; i < resources.length; i++) {
            switch(resources[i]['_hub_deliverytype_value@OData.Community.Display.V1.FormattedValue']){
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
      if(selectedDeliveryType.length == deliveryType.length){
        resourceList = resources;
      }
      else{
        for (var i = 0; i < selectedDeliveryType.length; i++) {
          for(var j=0;j<resources.length;j++){
            if(resources[j]['_hub_deliverytype_value'] == selectedDeliveryType[i]){
              resourceList.push(resources[j]);
            }      
          }
        }
      }
      sylvanCalendar.populateResource(resourceList);
      if(resourceList.length){
        sylvanCalendar.refreshCalendarEvent(locationId,currentCalendarDate,currentCalendarDate,false,false);
        wjQuery('.prevBtn').off('click').on('click',function(){
          sylvanCalendar.prev(locationId);
        });
       
        wjQuery('.nextBtn').off('click').on('click',function(){
          sylvanCalendar.next(locationId);
        });

        wjQuery('.wkView').off('click').on('click',function(){
          sylvanCalendar.weekView();
        });
        wjQuery('.dayView').off('click').on('click',function(){
          sylvanCalendar.dayView();
        });
        wjQuery('#addAppointment').click(function() {
          sylvanCalendar.addAppointment();
        });
        wjQuery('.sof-btn,.sof-close-icon').off('click').on('click',function(){
          sylvanCalendar.sofPane();
        });
        wjQuery('.ta-btn,.ta-close-icon').off('click').on('click',function(){
          sylvanCalendar.taPane();
        });
        sylvanCalendar.draggable('teacher-container');

        wjQuery('#datepicker').datepicker({
            buttonImage: "/webresources/hub_/calendar/images/calendar.png",
            buttonImageOnly: true,
            changeMonth: true,
            changeYear: true,
            showOn: 'button',
            onSelect: function(date) {
              sylvanCalendar.dateFromCalendar(date,locationId);
              wjQuery('#datepicker').hide();
            }
        });
      }
    }   
    wjQuery('#pi-btn input').attr('checked', 'checked');
    wjQuery('.dtBtn').click(function() {
      deliveryTypeList = [];
      wjQuery('.student-overflow').remove();
      wjQuery('.teacher-availability').remove();
      wjQuery.each(wjQuery('.dtBtn'), function(index,elm){
        if(wjQuery(elm).is(':checked')){ 
          deliveryTypeList.push(wjQuery(elm).val());
          for (var i = 0; i < deliveryType.length; i++) {
            if(deliveryType[i]['hub_deliverytypeid'] == wjQuery(elm).val() && 
              deliveryType[i]['hub_name'] == 'Group Instruction'){
              for (var j = 0; j < deliveryType.length; j++) {
                if(deliveryType[j]['hub_name'] == 'Group Facilitation'){
                  deliveryTypeList.push(deliveryType[j]['hub_deliverytypeid']);
                }
              }
            }
          }
        }
      });
      fetchResources(locationId,deliveryTypeList,false);
    });
      fetchResources(locationId,deliveryTypeList,true);    
    },300);
    var filterObject = {
      student:data.getStudentSession(locationId,currentCalendarDate,currentCalendarDate) == null ? []:data.getStudentSession(locationId,currentCalendarDate,currentCalendarDate) ,
      grade: data.getGrade() == null? [] : data.getGrade(),
      subject: data.getSubject() == null ? [] : data.getSubject()
    }
    sylvanCalendar.generateFilterObject(filterObject); 
},500);

function SylvanCalendar(){
    this.resourceList = [];
    this.calendar = undefined;
    this.filters = new Object();
    this.eventList = [];
    this.sofList = [];
    this.taList = [];
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
    this.init = function(element){
    }

    //Student pane and TA pane Functionality
    var sofExpanded = false;
    var taExpanded = false;
    this.loadMasterInformation = function(){
        var self = this;
        sofExpanded = false;
        taExpanded = false;
        var currentCalendarDate = this.calendar.fullCalendar('getDate');
        wjQuery('.headerDate').text(moment(currentCalendarDate).format('MM/DD/YYYY'));
        if(wjQuery('thead .fc-agenda-axis.fc-widget-header.fc-first').length){
            var dayOfWeek = moment(currentCalendarDate).format('dddd');
            var dayofMonth = moment(currentCalendarDate).format('M/D');
            wjQuery('thead .fc-agenda-axis.fc-widget-header.fc-first').css('text-align','center');
            wjQuery('thead .fc-agenda-axis.fc-widget-header.fc-first').html(dayOfWeek +" <br/> "+ dayofMonth);
            
        }
        if(wjQuery('.filter-section').length == 0)
        wjQuery(".fc-agenda-divider.fc-widget-header").after("<div class='filter-section'></div>");
        this.calendarFilter();
        this.filterSlide(false);

        wjQuery('.filter-header').on('click',function() { 
            var id = wjQuery(this).parent().attr('id');
            let flag = wjQuery( "#"+id ).hasClass( "open" );
            if(flag){
                wjQuery(this).parent().children('.option-header-container').remove();
                wjQuery('#'+id).removeClass('open');
                wjQuery( "#"+id ).find('.filter-nav-icon').removeClass('open');
            }
            else{
                var indices = id.split('_');
                var index = indices[1];
                for(var i=0;i<self.filters[index].length;i++){
                    if (self.filters[index][i].radio) {
                        wjQuery('#'+id).append('<div class="option_'+self.filters[index][i].id+' option-header-container">'+
                        '<label class="cursor option-title">'+
                            '<input type="radio" class="filterCheckBox" name="'+index+'" value="'+self.filters[index][i].id+'">'+self.filters[index][i].name+
                        '</label>'+
                    '</div>');
                    }else{
                      if(index == "subject"){
                         wjQuery('#'+id).append('<div class="option_'+self.filters[index][i].id+' option-header-container">'+
                            '<label class="cursor option-title">'+
                                '<input type="checkbox" class="filterCheckBox" name="'+index+'" value="'+self.filters[index][i].name+'">'+self.filters[index][i].name+
                            '</label>'+
                        '</div>');
                      }else{
                        wjQuery('#'+id).append('<div class="option_'+self.filters[index][i].id+' option-header-container">'+
                          '<label class="cursor option-title">'+
                              '<input type="checkbox" class="filterCheckBox" name="'+index+'" value="'+self.filters[index][i].id+'">'+self.filters[index][i].name+
                          '</label>'+
                      '</div>');
                      }
                    }
                    
                }
                wjQuery('#'+id).addClass('open');
                wjQuery( "#"+id ).find('.filter-nav-icon').addClass('open');

                // filter functionality
                var checkedList = [];
                wjQuery(".filterCheckBox").click(function() {
                   if(wjQuery(this).is(':checked')){
                        self.eventList = [];
                        self.calendar.fullCalendar( 'removeEvents');
                        checkedList.push(wjQuery(this).val()); 
                        self.calendar.fullCalendar('refetchEvents');
                     }else{
                        self.eventList = [];
                        self.calendar.fullCalendar( 'removeEvents');
                        checkedList.splice(checkedList.indexOf(wjQuery(this).val()), 1);
                        self.calendar.fullCalendar('refetchEvents');
                    }
                    
                    if(checkedList.length == 0){
                        self.populateStudentEvent(self.convertedStudentObj, true);
                        self.populateSOFPane(self.sofList, self.calendarOptions.minTime, self.calendarOptions.maxTime);
                        self.populateTAPane(self.taList);
                    }else{
                      var newArray = [];
                      var sofNewArray = [];
                      var taNewArray = [];
                      wjQuery.each(checkedList, function(k, v){
                          newArray = wjQuery.merge(self.filterItems(self.convertedStudentObj, v, "default"), newArray);
                          sofNewArray = wjQuery.merge(self.filterItems(self.sofList, v ,"default"), sofNewArray);
                          taNewArray = wjQuery.merge(self.filterItems(self.taList, v, "tapane"), taNewArray);
                      });
                      self.populateTAPane(taNewArray);
                      self.populateSOFPane(sofNewArray, self.calendarOptions.minTime, self.calendarOptions.maxTime);
                      self.populateStudentEvent(newArray, true);
                    }
                });
            }
        });
        wjQuery('.sof-pane').css('height',wjQuery('#calendar').height() - 10 +"px"); 
        wjQuery('.ta-pane').css('height',wjQuery('#calendar').height() - 10 +"px"); 
        wjQuery('.sof-pane').css('overflow-y','hidden'); 
        wjQuery('.ta-pane').css('overflow-y','hidden');
    }

    this.populateLocation = function(args){
      if(args != null){
        var locationData = [];
        args[0][0] == undefined ? locationData = args:locationData = args[0];
        var locationList = [];
        for(var i=0;i<locationData.length;i++){
            if(!i)
            {
                wjQuery(".loc-dropdown .btn:first-child").text(locationData[i].hub_centername);
                wjQuery(".loc-dropdown .btn:first-child").val(locationData[i].hub_centerid);
            }
            locationList.push('<li><a tabindex="-1" value-id='+locationData[i].hub_centerid+' href="javascript:void(0)">'+locationData[i].hub_centername+'</a></li>');
        }
        wjQuery(".loc-dropdown ul").html(locationList);
        return locationData[0].hub_centerid;
      } 
    }

    this.populateResource = function(args){
      var currentCalendarDate;
      if(this.calendar != undefined){
        currentCalendarDate = this.calendar.fullCalendar('getDate');
      }
      this.clearAll();
      if(args != null){
        var resourceData = [];
        if(args[0] != undefined){
          args[0][0] == undefined ? resourceData = args:resourceData = args[0];
          this.resourceList = [];
          for(var i=0;i<resourceData.length;i++){
              this.resourceList.push({
                  name: resourceData[i].hub_name,
                  id: resourceData[i].hub_center_resourcesid,
                  deliveryType:resourceData[i]["_hub_deliverytype_value@OData.Community.Display.V1.FormattedValue"],
                  deliveryTypeId:resourceData[i]['_hub_deliverytype_value'],
                  capacity:resourceData[i]["hub_capacity"]
              });
          }
          this.loadCalendar(currentCalendarDate);
        }
      }
    }

    this.clearAll = function(){
      this.calendar != undefined ? this.calendar.fullCalendar('destroy') : undefined;
      this.calendar = undefined;
      this.resourceList = [];
      this.eventList = [];
      this.sofList = [];
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
      this.students = [];
    }

    this.convertToMinutes = function(timeString){
      if(timeString != undefined){
        if(timeString.split(' ')[1] == 'AM'){
          var hours = parseInt(moment(timeString,'h:mm A').format('h'));
          var minutes = parseInt(moment(timeString,'h:mm A').format('mm'));
          return (hours * 60) + minutes;
        }
        else{
         var hours = parseInt(moment(timeString,'h:mm A').format('h'));
         hours = hours!=12 ? hours + 12 : hours;
          var minutes = parseInt(moment(timeString,'h:mm A').format('mm'));
          return (hours * 60) + minutes;
        }
      }
    }

    this.getDayValue = function(date){
      if(date != undefined){
        switch(moment(date).format('dddd').toLowerCase()){
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

    this.calendarFilter = function(){
         this.buildFilterBody();
    }

    this.filterSlide = function(expanded){
        wjQuery('.filter-label-outer').click(function(){
            wjQuery('.filter-section').animate(expanded?{'marginLeft':'-275px'} : {marginLeft:'0px'},500);
            expanded ? wjQuery('.filter-slide-icon').removeClass('open') : wjQuery('.filter-slide-icon').addClass('open');
            expanded = !expanded;
        });
    }

    this.buildFilterBody = function(){
        wjQuery('.filter-section').html('<div class="filter-container"></div>'+
            '<div class="filter-label-outer">'+
                '<span class="filter-slide-icon"></span>'+
                '<div class="filter-label">FILTERS'+ 
                '</div>'+
            '</div>');
        wjQuery.each(this.filters, function(key, value){
            wjQuery('.filter-container').append(
                '<div id="filter_'+key+'" class="filter-header-container">'+
                    '<div class="filter-header cursor">' +
                        '<div class="filter-title">'+key+'</div>' +
                        '<span class="filter-nav-icon"></span>' +
                    '</div>' +
                '</div>'
            );  
        });
        wjQuery('.filter-section').css('height',wjQuery('.filter-section').next().height() - 2 +"px");  
        wjQuery('.filter-container').css({'height':wjQuery('.filter-section').next().height() - 2 +"px","overflow-y":"auto"});
    } 

    this.populateSOFPane = function(studentData,minTime,maxTime){
        var sofTemplate = [];
        wjQuery('.student-overflow').html("");
        for(var i=0;i<(maxTime - minTime);i++){
            var elm = '<div class="student-overflow" id="student_block_'+i+'" style="height:'+ wjQuery(".fc-agenda-slots td div").height() +'px;overflow:auto"></div>';
            wjQuery('.sof-pane').append(elm);;
        }
        for(var i=0;i<studentData.length;i++){
            var studentStartHour = studentData[i].start.getHours();
            if(studentStartHour >= minTime && studentStartHour <= maxTime){
              var studentPosition = studentStartHour - minTime;
              var elm = '<div class="student-container cursor padding-lr-xxs" type="student" value="'+studentData[i].id+'">'+studentData[i].name+',<span>'+studentData[i].grade+'</span></div>';
              var deliveryTypeIndex = this.selectedDeliveryType.map(function(y){
                return y;
              }).indexOf(studentData[i].deliveryTypeId);
              if(studentData[i].deliveryType == 'Personal Instruction' && deliveryTypeIndex != -1){
                if(wjQuery('#student_block_'+studentPosition +' .sof-pi').length == 0){
                  wjQuery('#student_block_'+studentPosition).append('<div class="sof-pi"></div>');
                }
                wjQuery('#student_block_'+studentPosition +' .sof-pi').append(elm);
              }
              else if(studentData[i].deliveryType == 'Group Instruction' && deliveryTypeIndex != -1){
                if(wjQuery('#student_block_'+studentPosition +' .sof-gi').length == 0){
                  wjQuery('#student_block_'+studentPosition).append('<div class="sof-gi"></div>');
                }
                wjQuery('#student_block_'+studentPosition +' .sof-gi').append(elm);
              }
              else if(studentData[i].deliveryType == 'Group Facilitation' && deliveryTypeIndex != -1){
                if(wjQuery('#student_block_'+studentPosition +' .sof-gf').length == 0){
                  wjQuery('#student_block_'+studentPosition).append('<div class="sof-gf"></div>');
                }
                wjQuery('#student_block_'+studentPosition +' .sof-gf').append(elm);
              }
              this.draggable('student-container');
            }
        }
    }

    this.getTeacherSubjects = function(teacherObj){
      var subjects = [];
      self = this;
      wjQuery.each(teacherObj, function(k, v){
        if(k.includes("astaff_x002e_hub_") && typeof(v) == 'boolean' && v == true ){
          value = k.replace("astaff_x002e_hub_", "");
          // Subject Key is hardcoaded here
          var subject = self.filters["subject"].filter(function( obj ) {
            return obj.value == value;
          });
          subjects.push(subject[0].name.toLowerCase());
        }
      });
      return subjects;
    }

    this.populateTAPane = function(teacherData){
      wjQuery(".teacher-availability").html("");
        for(var i=0;i<(this.calendarOptions.maxTime - this.calendarOptions.minTime);i++){
            var elm = '<div class="teacher-availability" id="teacher_block_'+i+'" style="overflow-y:auto;height:'+ wjQuery(".fc-agenda-slots td div").height() +'px"></div>';
            wjQuery('.ta-pane').append(elm);
        }
        for(var i=0;i<teacherData.length;i++){
          var studentStartHour = teacherData[i].startHour;
          if(studentStartHour >= this.calendarOptions.minTime && studentStartHour <= this.calendarOptions.maxTime){
             var studentPosition = studentStartHour - this.calendarOptions.minTime;
             var elm =   '<div class="teacher-block"> <div class="teacher-container" type="teacher" value="'+teacherData[i].id+'">'+
                          '<div class="display-inline-block padding-right-xs">'+ teacherData[i].name+'</div>'+
                          '<div class="subject-identifier"></div>'+
                      '</div></div>';
             wjQuery('#teacher_block_'+studentPosition).append(elm);
             this.draggable('teacher-container');
          }
        }  
    }

    /*
     * Method accepts from where student comes and student
     */
    this.saveSOFtoSession = function(student){
      if(student[0] != undefined){
        var objStudent = this.students.filter(function(x){
          return x._hub_student_value == student[0].id;
        });
        var objSession = {};
            objSession['hub_center@odata.bind'] = "/hub_centers(" + student[0].locationId + ")";
            objSession['hub_resourceid@odata.bind'] = "/hub_center_resourceses(" + student[0].resourceId + ")";
            objSession.hub_session_date = moment(student[0].start).format("YYYY-MM-DD");
            objSession.hub_start_time = this.convertToMinutes(moment(student[0].start).format("h:mm A"));
            objSession.hub_end_time = this.convertToMinutes(moment(student[0].end).format("h:mm A"));
        data.saveSOFtoSession(objStudent[0],objSession);
      }
    };
    
    this.saveTAtoSession = function(teacher){
      if(teacher != undefined){
        var objStaff = {};
            objStaff['hub_staff@odata.bind'] = "/hub_staffs(" + teacher.id + ")";
            objStaff['hub_center@odata.bind'] = "/hub_centers(" + teacher.locationId + ")";
        var objNewSession = {};
            objNewSession.hub_deliverytype = teacher.deliveryTypeId;
            objNewSession['hub_resourceid@odata.bind'] = "/hub_center_resourceses(" + teacher.resourceId + ")";
            objNewSession.hub_date = moment(teacher.start).format("YYYY-MM-DD");
            objNewSession.hub_start_time = this.convertToMinutes(moment(teacher.start).format("h:mm A"));
            objNewSession.hub_end_time  = this.convertToMinutes(moment(teacher.end).format("h:mm A"));
            objNewSession.hub_schedule_type = 1;
            var responseObj = data.saveTAtoSession(objStaff,objNewSession);
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
    };

    this.createEventOnDrop = function(t,date, allDay,ev,ui,resource,elm) {
      if(wjQuery(elm).attr("type") == 'student'){
        var newEvent = this.calendar.fullCalendar('clientEvents', resource.id+date);
        var stuId = wjQuery(elm).attr("value"); 
        var index = t.sofList.map(function(x){
                return x.id;
        }).indexOf(stuId);
        var prevStudObj = t.sofList[index];
        if(prevStudObj['deliveryType'] == resource.deliveryType ){
          if(newEvent.length == 0){
            t.studentSofConflictCheck(t,date, allDay,ev,ui,resource,elm);
          }else if(newEvent.length == 1){
            if(newEvent[0]['students'] == undefined){
              t.studentSofConflictCheck(t,date, allDay,ev,ui,resource,elm);
            }else{
              //  Validation for oneToOne check
              if(newEvent[0]['is1to1']){
                t.studentSofCnfmPopup(t,date, allDay,ev,ui,resource,elm, "Session is 'OneToOne' Type. Do you wish to continue?");
              }else{
                if(!(newEvent[0].hasOwnProperty('students')) || newEvent[0].hasOwnProperty('students') && (newEvent[0]['students'].length <= resource.capacity || resource.capacity == undefined)){
                    t.studentSofConflictCheck(t,date, allDay,ev,ui,resource,elm);
                }else if(newEvent[0].hasOwnProperty('students') && (newEvent[0]['students'].length >= resource.capacity || resource.capacity == undefined)){
                  t.studentSofCnfmPopup(t,date, allDay,ev,ui,resource,elm, "Capacity has reached the maximum. Do you wish to continue?");
                }
              }
            }
          }
        }else{
          t.studentSofCnfmPopup(t,date, allDay,ev,ui,resource,elm, "DeliveryType is different. Do you wish to continue?");
        }
      }
      else if(wjQuery(elm).attr("type") == 'teacher'){
        var newEvent = this.calendar.fullCalendar('clientEvents', resource.id+date);
        var teacherId = wjQuery(elm).attr("value"); 
        var techerPrograms = this.getProgramObj(teacherId);
        if(newEvent.length == 0){
          this.tapaneConflictCheck(t,date, allDay,ev,ui,resource,elm);
        }else if(newEvent.length == 1){
          if(!(newEvent[0].hasOwnProperty('teachers')) || (newEvent[0].hasOwnProperty('teachers') && newEvent[0]['teachers'].length == 0)){
            if(!newEvent[0].hasOwnProperty('students')){
              this.tapaneConflictCheck(t,date, allDay,ev,ui,resource,elm);
            }else{
              var showPopup = false;
              wjQuery.each(newEvent[0]['students'], function(k, v){
                var index = techerPrograms.map(function(x){
                  return x;
                }).indexOf(v.programId);
                if(index == -1){
                  showPopup = true;
                  return false; 
                }
              });
              if(showPopup){
                this.taPaneCnfmPopup(t,date, allDay,ev,ui,resource,elm, "Teacher program is not matching. Do you wish to continue?");
              }else{
                this.tapaneConflictCheck(t,date, allDay,ev,ui,resource,elm);
              }
            }
          }
        }
      }
      else if(wjQuery(elm).attr("type") == 'studentSession'){
        var stuId = wjQuery(elm).attr("value"); 
        var prevEventId = wjQuery(elm).attr("eventid");
        var newEvent = this.calendar.fullCalendar('clientEvents', resource.id+date);
        var prevEvent = this.calendar.fullCalendar('clientEvents', prevEventId);
        var newResourceObj = t.getResourceObj(resource.id);
        var prevResourceObj = t.getResourceObj(prevEvent[0]['resourceId']);
  
        if(newEvent.length == 0){
          if(newResourceObj.deliveryType != "Group Instruction"){
            if(newResourceObj.deliveryType == prevResourceObj.deliveryType){
              t.studentSessionConflictCheck(t,date, allDay,ev,ui,resource,elm);
            }else{
              t.studentSessionCnfmPopup(t,date, allDay,ev,ui,resource,elm, "DeliveryType is different. Do you wish to continue?");
            }
          }
        }else if(newEvent.length == 1){
          if(newEvent[0]['students'] == undefined){
            if(newResourceObj.deliveryType == prevResourceObj.deliveryType){
              t.studentSessionConflictCheck(t,date, allDay,ev,ui,resource,elm);
            }else{
              t.studentSessionCnfmPopup(t,date, allDay,ev,ui,resource,elm, "DeliveryType is different. Do you wish to continue?");
            }
          }else{
            var studentIndex = newEvent[0]['students'].map(function(x){
              return x.id;
            }).indexOf(stuId);
            if(studentIndex == -1){
              if(newResourceObj.deliveryType != "Group Instruction"){
                if(newResourceObj.deliveryType == prevResourceObj.deliveryType){
                  if(newResourceObj.deliveryType == "Personal Instruction"){
                    //  Validation for oneToOne check
                    //* if oneToOne then show popup
                    if(newEvent[0]['is1to1']){
                      t.studentSessionCnfmPopup(t,date, allDay,ev,ui,resource,elm, "Session is 'OneToOne' Type. Do you wish to continue?");
                    }else{
                      if(!(newEvent[0].hasOwnProperty('students')) || newEvent[0].hasOwnProperty('students') && (newEvent[0]['students'].length <= resource.capacity || resource.capacity == undefined)){
                          t.studentSessionConflictCheck(t,date, allDay,ev,ui,resource,elm);
                      }else if(newEvent[0].hasOwnProperty('students') && (newEvent[0]['students'].length > resource.capacity || resource.capacity == undefined)){
                        t.studentSessionCnfmPopup(t,date, allDay,ev,ui,resource,elm, "Capacity has reached the maximum. Do you wish to continue?");
                      }
                    }
                  }else if(newResourceObj.deliveryType == "Group Facilitation"){
                    // Check Services for same DI
                    var studentIndex = prevEvent[0]['students'].map(function(x){
                      return x.id;
                    }).indexOf(stuId);
                    prevServiceId = prevEvent[0]['students'][studentIndex]['serviceId'];
                    var showPromt = true;
                    wjQuery.each(newEvent[0]['students'], function(k, v){

                      if(v.serviceId == prevServiceId){
                        showPromt = false;
                      }
                    });
                    if(showPromt){
                      t.studentSessionCnfmPopup(t,date, allDay,ev,ui,resource,elm, "Servieces are not matching. Do you wish to continue?");
                    }else{
                      t.studentSessionConflictCheck(t,date, allDay,ev,ui,resource,elm);
                    }
                  }
                }else{
                  // condition's for different DI
                  if(newResourceObj.deliveryType != "Group Instruction"){
                    if(newResourceObj.deliveryType == "Personal Instruction"){
                      //  Validation for oneToOne check
                      //* if oneToOne then show popup
                      if(newEvent[0]['is1to1']){
                        t.studentSessionCnfmPopup(t,date, allDay,ev,ui,resource,elm, "DeliveryType is different and Session is 'OneToOne' Type. Do you wish to continue?");
                      }else{
                        if(!(newEvent[0].hasOwnProperty('students')) || newEvent[0].hasOwnProperty('students') && (newEvent[0]['students'].length <= resource.capacity || resource.capacity == undefined)){
                            t.studentSessionCnfmPopup(t,date, allDay,ev,ui,resource,elm, "DeliveryType is different. Do you wish to continue?");
                        }else if(newEvent[0].hasOwnProperty('students') && (newEvent[0]['students'].length > resource.capacity || resource.capacity == undefined)){
                          t.studentSessionCnfmPopup(t,date, allDay,ev,ui,resource,elm, "DeliveryType is different and Capacity has reached the maximum. Do you wish to continue?");
                        }
                      }
                    }else if(newResourceObj.deliveryType == "Group Facilitation"){
                      // Check Services for same DI
                      var studentIndex = prevEvent[0]['students'].map(function(x){
                        return x.id;
                      }).indexOf(stuId);
                      prevServiceId = prevEvent[0]['students'][studentIndex]['serviceId'];
                      var showPromt = true;
                      wjQuery.each(newEvent[0]['students'], function(k, v){
                        if(v.serviceId == prevServiceId){
                          showPromt = false;
                        }
                      });
                      if(showPromt){
                        t.studentSessionCnfmPopup(t,date, allDay,ev,ui,resource,elm, "DeliveryType is different and Servieces are not matching. Do you wish to continue?");
                      }else{
                        t.studentSessionCnfmPopup(t,date, allDay,ev,ui,resource,elm, "DeliveryType is different. Do you wish to continue?");
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      else if(wjQuery(elm).attr("type") == 'teacherSession'){
        var teacherId = wjQuery(elm).attr("value"); 
        var prevEventId = wjQuery(elm).attr("eventid");
        var techerPrograms = this.getProgramObj(teacherId);
        if(resource.id+date != prevEventId){
          var updateFlag = false;
          var newEvent = this.calendar.fullCalendar('clientEvents', resource.id+date);
          if(newEvent.length == 0){
            this.teacherSessionConflictCheck(t,date, allDay,ev,ui,resource,elm);
          }else if(newEvent.length == 1){
            if(!(newEvent[0].hasOwnProperty('teachers')) || (newEvent[0].hasOwnProperty('teachers') && newEvent[0]['teachers'].length == 0)){
              if(!newEvent[0].hasOwnProperty('students')){
                this.teacherSessionConflictCheck(t,date, allDay,ev,ui,resource,elm);
              }else{
                var showPopup = false;
                wjQuery.each(newEvent[0]['students'], function(k, v){
                  var index = techerPrograms.map(function(x){
                    return x;
                  }).indexOf(v.programId);
                  if(index == -1){
                    showPopup = true;
                    return false; 
                  }
                });
                if(showPopup){
                  this.teacherSessionCnfmPopup(t,date, allDay,ev,ui,resource,elm, "Teacher program is not matching. Do you wish to continue?");
                }else{
                  this.teacherSessionConflictCheck(t,date, allDay,ev,ui,resource,elm);
                }
              }
            }
          }
        }
      }
    };

    this.tapaneConflictCheck = function (t,date, allDay,ev,ui,resource,elm){
      var endDate = new Date(date);
      var startHour = new Date(date).setMinutes(0);
      var startHour = new Date(new Date(startHour).setSeconds(0));
      var teacherId = wjQuery(elm).attr("value"); 
      var teacher = t.taList.filter(function(x){
          return x.id == teacherId;
      }); 
      var index = t.taList.map(function(x){
              return x.id;
      }).indexOf(teacherId);
      if(teacher){
        elm.remove(); 
        t.taList.splice(index,1);
        var teacherObj = {
            id: teacher[0].id, 
            name: teacher[0].name,
            start: date,
            startHour :startHour,
            end: new Date(endDate.setHours(endDate.getHours() + 1)),
            resourceId:resource.id,
            deliveryTypeId: this.getResourceObj(resource.id).deliveryTypeId,
            deliveryType : this.getResourceObj(resource.id).deliveryType,
            locationId: teacher[0].locationId,
        };
        this.convertedTeacherObj.push(teacherObj);
        this.saveTAtoSession(teacherObj);
        t.populateTeacherEvent([teacherObj],false);
      } 
    }

    this.teacherSessionConflictCheck = function (t,date, allDay,ev,ui,resource,elm){
      var endDate = new Date(date);
      var startHour = new Date(date).setMinutes(0);
      var startHour = new Date(new Date(startHour).setSeconds(0));
      var teacherId = wjQuery(elm).attr("value"); 
      var uniqTeacherId = wjQuery(elm).attr("id"); 
      var prevEventId = wjQuery(elm).attr("eventid");
      var prevEvent = this.calendar.fullCalendar('clientEvents', prevEventId);
      var index = t.convertedTeacherObj.map(function(x){
        return x.id;
      }).indexOf(teacherId);

      if(prevEvent){
        var eventTitleHTML = wjQuery(prevEvent[0].title);
        for (var i = 0; i < eventTitleHTML.length; i++) {
          if(wjQuery(eventTitleHTML[i]).attr('value') == teacherId){
            eventTitleHTML.splice(i,1);
          }
        }
        if(eventTitleHTML.prop('outerHTML') != undefined){
          if(eventTitleHTML.length == 1){                  
            if(prevEvent[0].teachers.length == 1){
                prevEvent[0].title = "<span class='placeholder'>Teacher name</span>";                  
                prevEvent[0].title += eventTitleHTML.prop('outerHTML');                
            }else{
                prevEvent[0].title = eventTitleHTML.prop('outerHTML');                
            }
          }else{                  
            prevEvent[0].title = "";
            if(prevEvent[0].teachers.length == 1){
                prevEvent[0].title += "<span class='placeholder'>Teacher name</span>";                  
            }
            for (var i = 0; i < eventTitleHTML.length; i++) {                    
              prevEvent[0].title += eventTitleHTML[i].outerHTML;                  
            }                
            if(prevEvent[0].teachers.length == 2){
              if(prevEvent[0].title.includes('<img class="conflict" src="/webresources/hub_/calendar/images/warning.png">')){
                prevEvent[0].title = prevEvent[0].title.replace('<img class="conflict" src="/webresources/hub_/calendar/images/warning.png">', '');
                if(!prevEvent[0].title.includes('<span class="student-placeholder">Student name</span>')){
                  prevEvent[0].title += '<span class="student-placeholder">Student name</span>'; 
                }
              }
            }
          }                
          this.calendar.fullCalendar('updateEvent', prevEvent);
          var removeTeacherIndex = prevEvent[0].teachers.map(function(x){
                  return x.id;
          }).indexOf(teacherId);
          prevEvent[0].teachers.splice(removeTeacherIndex,1);
           if((eventTitleHTML.length == 1 && (eventTitleHTML[0].className == "placeholder" || eventTitleHTML[0].className == "student-placeholder")) || 
              (eventTitleHTML.length == 2 && eventTitleHTML[0].className == "placeholder" && eventTitleHTML[1].className == "student-placeholder") ||
              (eventTitleHTML.length == 3 && eventTitleHTML[0].className == "onetoone" && eventTitleHTML[1].className == "placeholder" && eventTitleHTML[2].className == "student-placeholder")){
              for (var i = 0; i < this.eventList.length; i++) {
              if(this.eventList[i].id == prevEventId)
                this.eventList.splice(i,1);
            }
            this.calendar.fullCalendar('removeEvents', prevEventId);
          }
        }else{
          for (var i = 0; i < this.eventList.length; i++) {
            if(this.eventList[i].id == prevEventId)
              this.eventList.splice(i,1);
          }
          this.calendar.fullCalendar('removeEvents', prevEventId);
        }
      }
      if(t.convertedTeacherObj[index]){
        var prevTeacherSession = wjQuery.extend(true, {}, t.convertedTeacherObj[index]);
        elm.remove(); 
        t.convertedTeacherObj[index].start = date;
        t.convertedTeacherObj[index].startHour = startHour;
        t.convertedTeacherObj[index].end = new Date(endDate.setHours(endDate.getHours() + 1));
        t.convertedTeacherObj[index].resourceId = resource.id;
        t.convertedTeacherObj[index].deliveryTypeId = t.getResourceObj(resource.id).deliveryTypeId;
        t.convertedTeacherObj[index].deliveryType = t.getResourceObj(resource.id).deliveryType;
        t.saveTeacherToSession(t.convertedTeacherObj[index],prevTeacherSession);
        t.populateTeacherEvent([t.convertedTeacherObj[index]], true);
      } 
    }

    this.studentSofConflictCheck = function(t,date, allDay,ev,ui,resource,elm){
      var newEvent = this.calendar.fullCalendar('clientEvents', resource.id+date);
      var endDate = new Date(date);
      var startHour = new Date(date).setMinutes(0);
      startHour = new Date(new Date(startHour).setSeconds(0));
      var stuId = wjQuery(elm).attr("value"); 
      var parentElement = elm.parentElement;
      var student = t.sofList.filter(function( obj ) {
        return obj.id == stuId;
      });
      var index = t.sofList.map(function(x){
              return x.id;
      }).indexOf(stuId);
      var prevStudObj = t.sofList[index];
      if(student){
          t.sofList.splice(index,1);
          elm.remove();
          if(wjQuery(parentElement).html() == ''){
            parentElement.remove();
          }
          student[0].start = date;
          student[0].startHour = startHour;
          student[0].end = new Date(endDate.setHours(endDate.getHours() + 1));
          student[0].resourceId = resource.id;
          student[0].deliveryType = t.getResourceObj(resource.id)['deliveryType'];
          student[0].deliveryTypeId = t.getResourceObj(resource.id)['deliveryTypeId'];
          this.convertedStudentObj.push(student[0]);
          this.saveSOFtoSession(student);
          t.populateStudentEvent(student,false);
      }          
    }

    this.studentSessionConflictCheck = function(t,date, allDay,ev,ui,resource,elm){
      var endDate = new Date(date);
      var startHour = new Date(date).setMinutes(0);
      var startHour = new Date(new Date(startHour).setSeconds(0));
      var stuId = wjQuery(elm).attr("value"); 
      var uniqStuId = wjQuery(elm).attr("id"); 
      var prevEventId = wjQuery(elm).attr("eventid");
      prevEvent = this.calendar.fullCalendar('clientEvents', prevEventId);
      var index = t.convertedStudentObj.map(function(x){
              return x.id;
      }).indexOf(stuId);

      if(resource.id+date != prevEventId){
        if(prevEvent){
          var eventTitleHTML = wjQuery(prevEvent[0].title);
          for (var i = 0; i < eventTitleHTML.length; i++) {
            if(wjQuery(eventTitleHTML[i]).attr('value') == stuId){
              eventTitleHTML.splice(i,1);
            }
          }
          if(eventTitleHTML.prop('outerHTML') != undefined){
            if(eventTitleHTML.length == 1){ 
              prevEvent[0].title = eventTitleHTML.prop('outerHTML');                
            }else{                  
              prevEvent[0].title = "";
              for (var i = 0; i < eventTitleHTML.length; i++) {                    
                prevEvent[0].title += eventTitleHTML[i].outerHTML;                  
              }                
            }                
            var removeStudentIndex = prevEvent[0].students.map(function(x){
                    return x.id;
            }).indexOf(stuId);
            prevEvent[0].students.splice(removeStudentIndex,1);
            if((eventTitleHTML.length == 1 && (eventTitleHTML[0].className == "placeholder" || eventTitleHTML[0].className == "student-placeholder")) || 
              (eventTitleHTML.length == 2 && eventTitleHTML[0].className == "placeholder" && eventTitleHTML[1].className == "student-placeholder") ||
              (eventTitleHTML.length == 3 && eventTitleHTML[0].className == "onetoone" && eventTitleHTML[1].className == "placeholder" && eventTitleHTML[2].className == "student-placeholder")){
              for (var i = 0; i < this.eventList.length; i++) {
                if(this.eventList[i].id == prevEventId)
                  this.eventList.splice(i,1);
              }
              this.calendar.fullCalendar('removeEvents', prevEventId);
            }
            this.calendar.fullCalendar('updateEvent', prevEvent); 
          }
          else{
            for (var i = 0; i < this.eventList.length; i++) {
              if(this.eventList[i].id == prevEventId)
                this.eventList.splice(i,1);
            }
            this.calendar.fullCalendar('removeEvents', prevEventId);
          }
          if(!prevEvent[0].title.includes('<span class="student-placeholder">Student name</span>')){
            prevEvent[0].title += '<span class="student-placeholder">Student name</span>';
          }
        }
        if(t.convertedStudentObj[index]){
          var prevSessionObj = wjQuery.extend(true, {}, t.convertedStudentObj[index]);
          elm.remove(); 
          t.convertedStudentObj[index].start = date;
          t.convertedStudentObj[index].startHour = startHour;
          t.convertedStudentObj[index].end = new Date(endDate.setHours(endDate.getHours() + 1));
          t.convertedStudentObj[index].resourceId = resource.id;
          t.convertedStudentObj[index].deliveryTypeId = t.getResourceObj(resource.id).deliveryTypeId;
          t.convertedStudentObj[index].deliveryType = t.getResourceObj(resource.id).deliveryType;
          t.saveStudentToSession(t.convertedStudentObj[index],prevSessionObj);
          t.populateStudentEvent([t.convertedStudentObj[index]],true);  
        } 
      }
    }

    this.clearEvents = function(){
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
      self.calendar.fullCalendar( 'removeEvents');
    }

    this.loadCalendar = function(args){

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
            disableResizing : true,
            minTime:9,
            maxTime:20,
            allDayText : '',
            droppable: true,
            drop: function(date, allDay,ev,ui,resource){
                t.createEventOnDrop(t,date, allDay,ev,ui,resource,this);
            },
            handleWindowResize:true,
            height:window.innerHeight - 60,
            slotMinutes : 60,
            selectable: false,
            slotEventOverlap:false,
            selectHelper: true,
            select: function(start, end, allDay, event, resourceId) {
                //var title = prompt('Event Title:');
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
            editable: false,
            resources: this.resourceList,
            events: this.eventList,
            windowResize: function(view) {
              self.calendar.fullCalendar('option','height',window.innerHeight - 60);
            }
        };  
        
        if(args != undefined){
          this.calendarOptions.year = args.getFullYear();
          this.calendarOptions.month = args.getMonth();
          this.calendarOptions.date = args.getDate();
        }
        this.calendar = wjQuery('#calendar').fullCalendar(this.calendarOptions);
        this.loadMasterInformation();

        wjQuery("#addResource").click(function(){
            var newResource = {
                name:"Resource "+ (this.resourceList.length+1),
                id:"resource"+ (this.resourceList.length+1)
            };
            this.resourceList.push(newResource);
            this.calendar.fullCalendar("addResource",[newResource]);
        }); 
               
        // From date for new appointment
        wjQuery( ".from-datepicker-input" ).datepicker();
        var selectedFromDate; 
        wjQuery(".from-datepicker-input").on("change",function(){
            selectedFromDate = wjQuery(this).val();
        });

        wjQuery(".from-up-arrow").on("click",function(){
            var date = new Date(selectedFromDate);
            date.setDate(date.getDate() + 1);
            selectedFromDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();
            wjQuery( ".from-datepicker-input" ).val(selectedFromDate);
        });

        wjQuery(".from-down-arrow").on("click",function(){
            var date = new Date(selectedFromDate);
            date.setDate(date.getDate() - 1);
            selectedFromDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();
            wjQuery( ".from-datepicker-input" ).val(selectedFromDate);
        });

         // To date for new appointment
        wjQuery( ".to-datepicker-input" ).datepicker();
        var selectedToDate; 
        wjQuery(".to-datepicker-input").on("change",function(){
            selectedToDate = wjQuery(this).val();
        });
         
        wjQuery(".to-up-arrow").on("click",function(){
            var date = new Date(selectedFromDate);
            date.setDate(date.getDate() + 1);
            selectedToDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();
            wjQuery( ".to-datepicker-input" ).val(selectedToDate);
        });

        wjQuery(".to-down-arrow").on("click",function(){
            var date = new Date(selectedToDate);
            date.setDate(date.getDate() - 1);
            selectedToDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();
            wjQuery( ".to-datepicker-input" ).val(selectedToDate);
        });

        wjQuery("#save").click(function(){
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

    this.findDataSource = function(currentCalendarDate) {
      var now = new Date();
      //constant from instruction view js
      now.setDate(now.getDate() + MASTER_SCHEDULE_CONST); ;
      if(currentCalendarDate > now.getTime()){
        return true;
      }
      return false;
    }

    this.prev = function(locationId){
        this.calendar.fullCalendar('prev');
        var currentCalendarDate = this.calendar.fullCalendar('getDate');
        wjQuery('.headerDate').text(moment(currentCalendarDate).format('MM/DD/YYYY'));
        var dayOfWeek = moment(currentCalendarDate).format('dddd');
        var dayofMonth = moment(currentCalendarDate).format('M/D');
        wjQuery('thead .fc-agenda-axis.fc-widget-header.fc-first').html(dayOfWeek +" <br/> "+ dayofMonth);
        this.clearEvents();
        var flag = this.findDataSource(currentCalendarDate);
        currentCalendarDate = moment(currentCalendarDate).format("YYYY-MM-DD");
        this.refreshCalendarEvent(locationId,currentCalendarDate,currentCalendarDate,flag,true);
    }

    this.dateFromCalendar = function(date,locationId){
      var self = this;
      var displayDate = new Date(date);
      self.calendar.fullCalendar( 'gotoDate', displayDate );
      wjQuery('.headerDate').text(date);
      var dayOfWeek = moment(date).format('dddd');
      var dayofMonth = moment(date).format('M/D');
      wjQuery('thead .fc-agenda-axis.fc-widget-header.fc-first').html(dayOfWeek +" <br/> "+ dayofMonth);  
      self.clearEvents();
      var flag = this.findDataSource(new Date(date));
      var currentCalendarDate = moment(date).format("YYYY-MM-DD");
      self.refreshCalendarEvent(locationId,currentCalendarDate,currentCalendarDate,flag,true);
    }

    this.next = function(locationId){
      this.calendar.fullCalendar('next');
      var currentCalendarDate = this.calendar.fullCalendar('getDate');
      wjQuery('.headerDate').text(moment(currentCalendarDate).format('MM/DD/YYYY'));
      var dayOfWeek = moment(currentCalendarDate).format('dddd');
      var dayofMonth = moment(currentCalendarDate).format('M/D');
      wjQuery('thead .fc-agenda-axis.fc-widget-header.fc-first').html(dayOfWeek +" <br/> "+ dayofMonth);
      this.clearEvents();
      var flag = this.findDataSource(currentCalendarDate);
      currentCalendarDate = moment(currentCalendarDate).format("YYYY-MM-DD");
      this.refreshCalendarEvent(locationId,currentCalendarDate,currentCalendarDate,flag,true);
    }

    this.refreshCalendarEvent = function(locationId,startDate,endDate,studentDataSource,isFetch){
      var self = this;
      setTimeout(function(){
        var currentCalendarDate = self.calendar.fullCalendar('getDate');
        if(self.calendar.fullCalendar('getView').name == 'resourceDay'){
          startDate = endDate = moment(currentCalendarDate).format("YYYY-MM-DD");  
        }
        else{
          startDate = moment(currentCalendarDate).format("YYYY-MM-DD");  
          endDate = moment(moment(currentCalendarDate).format("YYYY-MM-DD").add(7,'d')).format("YYYY-MM-DD");
        }
        // staff program fetching
        self.staffProgram = data.getStaffProgram(locationId) == null? [] : data.getStaffProgram(locationId);
        self.teacherSchedule = isFetch || (self.teacherSchedule.length == 0) ? data.getTeacherSchedule(locationId,startDate,endDate) : self.teacherSchedule;
        self.teacherAvailability = isFetch || (self.teacherAvailability.length == 0) ? data.getTeacherAvailability(locationId,startDate,endDate) : self.teacherAvailability;
        self.pinnedData = isFetch || (self.pinnedData.length == 0) ? data.getPinnedData(locationId,startDate,endDate) : self.pinnedData;
        self.convertPinnedData(self.pinnedData);
        if(!studentDataSource){  
          self.students = isFetch || (self.students.length == 0) ? data.getStudentSession(locationId,startDate,endDate) : self.students;
          self.populateStudentEvent(self.generateEventObject(self.students == null ? [] : self.students, "studentSession"), true);
          self.filterObject.student = self.students == null ? [] : self.students;
          self.generateFilterObject(self.filterObject);
        }
        else{
          self.students = data.getStudentMasterSchedule(locationId,startDate,endDate);
          self.populateStudentEvent(self.generateEventObject(self.students == null ? [] : self.students, "masterStudentSession"), true);
          self.filterObject.student = self.students == null ? [] : self.students;
          self.generateFilterObject(self.filterObject);
        }
        self.populateTeacherEvent(self.generateEventObject(self.teacherSchedule== null ? [] : self.teacherSchedule, "teacherSchedule"), true);
        self.populateTAPane(self.generateEventObject(self.teacherAvailability == null ? []:self.teacherAvailability, "teacherAvailability")); 
      },500);
    }

    this.weekView = function(){
        var filterElement = undefined;
        wjQuery('thead .fc-agenda-axis.fc-widget-header.fc-first').css('text-align','center');
        if(this.calendar.fullCalendar('getView').name != 'agendaWeek'){
            var isFilterOpen = false;
            if(wjQuery('.filter-section').length){
                isFilterOpen = wjQuery('.filter-section').css("marginLeft");
                filterElement = wjQuery('.filter-section');
                wjQuery('.filter-section').remove();
            }
            this.calendar.fullCalendar('changeView','agendaWeek');
            
            if(filterElement != undefined){
                wjQuery(".fc-agenda-divider.fc-widget-header:visible").after(filterElement);
            }
            else{
                wjQuery(".fc-agenda-divider.fc-widget-header:visible").after("<div class='filter-section'></div>");
                this.calendarFilter();
            }
            this.filterSlide(wjQuery,isFilterOpen == '0px');
        }
    }

    this.dayView = function(){
        var filterElement = undefined;
        var self = this;
        if(self.calendar.fullCalendar('getView').name != 'resourceDay'){
            var isFilterOpen = false;
            if(wjQuery('.filter-section').length){
                isFilterOpen = wjQuery('.filter-section').css("marginLeft");
                filterElement = wjQuery('.filter-section');
                wjQuery('.filter-section').remove();
            }
            self.calendar.fullCalendar('changeView','resourceDay');
            setTimeout(function(){
                var currentCalendarDate = self.calendar.fullCalendar('getDate');
                wjQuery('.headerDate').text(moment(currentCalendarDate).format('MM/DD/YYYY'));
                var dayOfWeek = moment(currentCalendarDate).format('dddd');
                var dayofMonth = moment(currentCalendarDate).format('M/D');
                wjQuery('thead .fc-agenda-axis.fc-widget-header.fc-first').html(dayOfWeek +" <br/> "+ dayofMonth);
                
            },500); 
            if(filterElement != undefined){
                wjQuery(".fc-agenda-divider.fc-widget-header:visible").after(filterElement);
            }
            else{
                wjQuery(".fc-agenda-divider.fc-widget-header:visible").after("<div class='filter-section'></div>");
                self.calendarFilter();
            }
            self.filterSlide(wjQuery,isFilterOpen == '0px');
        }
    }

    this.addAppointment = function(){
        wjQuery("#appointmentModal").dialog({
            modal: true 
        });
        wjQuery("#appointmentModal").dialog('option', 'title', 'Add New Appointment Slot');
        setTimeout(function(){                      
            var etime;                        
            wjQuery(".from-timepicker-input" ).timepicker({
                timeFormat: 'h:mm p', 
                interval: 30,                            
                minTime: '9',                            
                maxTime: '6:00pm',                            
                startTime: '9:00',                            
                dynamic: false,                            
                dropdown: true,                            
                scrollbar: true,       
                change: function ()
                {                            
                    var stime = new Date;                            
                    stime.setMinutes(stime.getMinutes() + 30);    
                    var hours = stime.getHours();       
                    var minutes = stime.getMinutes();  
                    var ampm = hours >= 12 ? 'PM' : 'AM';    
                    hours = hours % 12;            
                    hours = hours ? hours : 12; 
                    minutes = minutes < 10 ? '0'+minutes : minutes; 
                    var etime = hours + ':' + minutes + ' ' + ampm; 
                    wjQuery(".to-timepicker-input").val(etime);  
                    wjQuery(".to-timepicker-input").timepicker('option',{'minTime': stime.getHours()});
                } 
                });                                   
                wjQuery( ".to-timepicker-input" ).timepicker({    
                    timeFormat: 'h:mm p',                            
                    interval: 30,                            
                    minTime: wjQuery(".to-timepicker-input").val().split(' ')[0]+':00', 
                    maxTime: '6:00pm',                            
                    dynamic: false,                            
                    dropdown: true,                            
                    scrollbar: true                        
                });                                   
        },300);              
    }
    
     this.sofPane = function(){
        wjQuery('.sof-pane').show();
        wjQuery("#scrollarea").scroll(function() {
            wjQuery('.sof-pane').prop("scrollTop", this.scrollTop)
                .prop("scrollLeft", this.scrollLeft);
        });
        wjQuery('.student-overflow').on( 'mousewheel DOMMouseScroll', function (e) { 
          var e0 = e.originalEvent;
          var delta = e0.wheelDelta || -e0.detail;
          this.scrollTop += ( delta < 0 ? 1 : -1 ) * 30;
          e.preventDefault();  
        });
        if(taExpanded){
            taExpanded = !taExpanded; // to change the slide
            taExpanded ? wjQuery('.ta-pane').addClass('open') : wjQuery('.ta-pane').removeClass('open');
            wjQuery('.ta-pane').animate(taExpanded?{'marginRight':'-15px'} : {marginRight:'-260px'},500);
        }
        sofExpanded = !sofExpanded;
        if(sofExpanded){
            wjQuery('.ta-pane').hide();
        }
        sofExpanded ? wjQuery('.sof-pane').addClass('open') : wjQuery('.sof-pane').removeClass('open');
        wjQuery('.sof-pane').animate(sofExpanded?{'marginRight':'-15px'} : {marginRight:'-260px'},500);
        if(!sofExpanded){
          setTimeout(function(){
            wjQuery('.sof-pane').hide();
          },600);
        }
    }

    this.taPane = function(){
        wjQuery('.ta-pane').show();
         wjQuery("#scrollarea").scroll(function() {
            wjQuery('.ta-pane').prop("scrollTop", this.scrollTop)
                .prop("scrollLeft", this.scrollLeft);
        });
        wjQuery('.teacher-availability').on( 'mousewheel DOMMouseScroll', function (e) { 
          var e0 = e.originalEvent;
          var delta = e0.wheelDelta || -e0.detail;
          this.scrollTop += ( delta < 0 ? 1 : -1 ) * 30;
          e.preventDefault();  
        });
        if(sofExpanded){
            sofExpanded = !sofExpanded;
            sofExpanded ? wjQuery('.sof-pane').addClass('open') : wjQuery('.sof-pane').removeClass('open');
            wjQuery('.sof-pane').animate(sofExpanded?{'marginRight':'-15px'} : {marginRight:'-260px'},500);
        }
        taExpanded = !taExpanded;
        if(taExpanded){
            wjQuery('.sof-pane').hide();
        }
        taExpanded ? wjQuery('.ta-pane').addClass('open') : wjQuery('.ta-pane').removeClass('open');
        wjQuery('.ta-pane').animate(taExpanded?{'marginRight':'-15px'} : {marginRight:'-260px'},500);
        if(!taExpanded){
          setTimeout(function(){
            wjQuery('.ta-pane').hide();
          },600);
        }
    } 

    this.generateFilterObject = function(args){
        var self = this;
        args[0] == undefined ? filterObj = args : filterObj = args[0];
        self.filterObject = filterObj;
        wjQuery.each(filterObj, function(key, value) {
            self.filters[key] = [];
            wjQuery.each(value, function(ke, val) {
                if(key == "time"){
                  self.filters[key].push( {id: val.id, name: val.name, radio: false});
                }else if(key == "grade"){
                  wjQuery.each(val, function(name, id){
                      self.filters[key].push( {id: id, name: name, radio: false});
                  });
                }else if(key == "subject"){
                  self.filters[key].push({
                    id: val.id, 
                    name: val.name, 
                    value: val.value, 
                    radio: false
                  });
                }else if(key == "student"){
                  // Remove duplicate entry
                  var index = self.filters[key].map(function(x){
                          return x.id;
                  }).indexOf(val._hub_student_value);
                  var deliveryTypeIndex = self.selectedDeliveryType.map(function(y){
                          return y;
                  }).indexOf(val.aproductservice_x002e_hub_deliverytype);

                  if(index == -1 && deliveryTypeIndex != -1){
                    self.filters[key].push({
                        id: val._hub_student_value, 
                        name: val['_hub_student_value@OData.Community.Display.V1.FormattedValue'], 
                        startTime: val['hub_session_date@OData.Community.Display.V1.FormattedValue'] +" "+ val['hub_start_time@OData.Community.Display.V1.FormattedValue'],
                        endTime: val['hub_session_date@OData.Community.Display.V1.FormattedValue'] +" "+ val['hub_end_time@OData.Community.Display.V1.FormattedValue'],
                        sessionDate:val['hub_session_date@OData.Community.Display.V1.FormattedValue'],
                        resourceId:val['_hub_resourceid_value'],
                        centerId:val['_hub_center_value'],
                        deliveryTypeId: val.aproductservice_x002e_hub_deliverytype,
                        deliveryType: val['aproductservice_x002e_hub_deliverytype@OData.Community.Display.V1.FormattedValue'],
                        radio: false
                    });
                  }
                }
            });
        });
    }

    this.generateEventObject = function(args, label){
        var self = this;
        var eventObjList = [];
        if (label == "teacherSchedule") {
            wjQuery.each(args, function(ke, val) {
                var sDate = new Date(val['hub_date@OData.Community.Display.V1.FormattedValue'] +" "+ val['hub_start_time@OData.Community.Display.V1.FormattedValue']);
                var eDate = new Date(val['hub_date@OData.Community.Display.V1.FormattedValue'] +" "+ val['hub_end_time@OData.Community.Display.V1.FormattedValue']);
                var startHour = new Date(val['hub_date@OData.Community.Display.V1.FormattedValue'] +" "+ val['hub_start_time@OData.Community.Display.V1.FormattedValue']);
                startHour = startHour.setMinutes(0);
                startHour = new Date(new Date(startHour).setSeconds(0));
                var teacher = {
                    id: val['_hub_staff_value'], 
                    name: val["_hub_staff_value@OData.Community.Display.V1.FormattedValue"],
                    start: sDate,
                    end: eDate,
                    startHour : startHour,
                    resourceId:val['_hub_resourceid_value'],
                    deliveryTypeId: val['aproductservice_x002e_hub_deliverytype'],
                    deliveryType: val['aproductservice_x002e_hub_deliverytype@OData.Community.Display.V1.FormattedValue'],
                    locationId: val['astaff_x002e_hub_center'],
                    locationName: val['astaff_x002e_hub_center@OData.Community.Display.V1.FormattedValue'],
                    subjectId: val['subjectId']
                };
                var isPinned = self.convertedPinnedList.filter(function(obj){
                  return (obj.teacherId == teacher.id &&
                         obj.resourceId == teacher.resourceId && 
                         obj.dayId == self.getDayValue(startHour))||
                         (obj.teacherId == teacher.id &&
                          obj.startTime == moment(startHour).format("h:mm A") &&
                          obj.dayId == self.getDayValue(startHour)) 
                });
                if(isPinned[0] != undefined){
                  teacher.pinId = isPinned[0].id;
                }
                eventObjList.push(teacher);
            });
            self.convertedTeacherObj = eventObjList;
        }else if(label == "studentSession"){
            wjQuery.each(args, function(ke, val) {
                var sDate = new Date(val['hub_session_date@OData.Community.Display.V1.FormattedValue'] +" "+ val['hub_start_time@OData.Community.Display.V1.FormattedValue']);
                var eDate = new Date(val['hub_session_date@OData.Community.Display.V1.FormattedValue'] +" "+ val['hub_end_time@OData.Community.Display.V1.FormattedValue']);
                var startHour = new Date(val['hub_session_date@OData.Community.Display.V1.FormattedValue'] +" "+ val['hub_start_time@OData.Community.Display.V1.FormattedValue']);
                startHour = startHour.setMinutes(0);
                startHour = new Date(new Date(startHour).setSeconds(0));
                var obj = {
                    id: val._hub_student_value, 
                    name: val["_hub_student_value@OData.Community.Display.V1.FormattedValue"],
                    start: sDate,
                    enrollmentId :val['_hub_enrollment_value'],
                    is1to1 : val["hub_is_1to1"],
                    programId: val['aprogram_x002e_hub_programid'],
                    serviceId:val['_hub_service_value'],
                    startHour : startHour,
                    gradeId:val['astudent_x002e_hub_grade'],
                    grade: val['astudent_x002e_hub_grade@OData.Community.Display.V1.FormattedValue'],
                    deliveryTypeId: val['aproductservice_x002e_hub_deliverytype'],
                    deliveryType: val['aproductservice_x002e_hub_deliverytype@OData.Community.Display.V1.FormattedValue'],
                    locationId: val['_hub_center_value'],
                    subject:val['aprogram_x002e_hub_areaofinterest@OData.Community.Display.V1.FormattedValue'],
                    subjectId:val['aprogram_x002e_hub_areaofinterest'],
                    locationName: val['_hub_center_value@OData.Community.Display.V1.FormattedValue']
                }
                if (val.hasOwnProperty('_hub_resourceid_value')) {
                    obj.resourceId = val['_hub_resourceid_value']; 
                    var isPinned = self.convertedPinnedList.filter(function(x){
                      return (x.studentId == obj.id &&
                              x.resourceId == obj.resourceId && 
                              x.dayId == self.getDayValue(startHour) &&
                              x.startTime == moment(startHour).format("h:mm A")) 
                    });
                    if(isPinned[0] != undefined){
                      obj.pinId = isPinned[0].id;
                    }
                    eventObjList.push(obj);
                }else{
                    // Don not allow duplicate students into sofList
                    var index = self.sofList.map(function(x){
                            return x.id;
                    }).indexOf(val._hub_student_value);
                    if(index == -1){
                      self.sofList.push(obj);  
                    }
                }
            });
            setTimeout(function(){
                if(self.sofList.length){
                    self.populateSOFPane(self.sofList,self.calendarOptions.minTime,self.calendarOptions.maxTime);
                }
            },800);
            self.convertedStudentObj = eventObjList;
        }
        else if(label == 'masterStudentSession'){
          wjQuery.each(args, function(ke, val) {
            var sDate = new Date(moment(new Date()).format('YYYY-MM-DD') +" "+ val['hub_starttime@OData.Community.Display.V1.FormattedValue']);
            var eDate = new Date(moment(new Date()).format('YYYY-MM-DD') +" "+ val['hub_endtime@OData.Community.Display.V1.FormattedValue']);
            var startHour = new Date(moment(new Date()).format('YYYY-MM-DD') +" "+ val['hub_starttime@OData.Community.Display.V1.FormattedValue']);
                startHour = startHour.setMinutes(0);
                startHour = new Date(new Date(startHour).setSeconds(0));
            var obj = {
                id: val['aenrollment_x002e_hub_student'], 
                name: val["aenrollment_x002e_hub_student@OData.Community.Display.V1.FormattedValue"],
                start: sDate,
                end: eDate,
                startHour: startHour,
                gradeId:val['astudent_x002e_hub_grade'],
                grade: val['astudent_x002e_hub_grade@OData.Community.Display.V1.FormattedValue'],
                deliveryTypeId: val['aproductservice_x002e_hub_deliverytype'],
                deliveryType: val['aproductservice_x002e_hub_deliverytype@OData.Community.Display.V1.FormattedValue'],
                locationId: val['aenrollment_x002e_hub_location'],
                locationName: val['aenrollment_x002e_hub_location@OData.Community.Display.V1.FormattedValue']
            }

            if (val.hasOwnProperty('_hub_resourceid_value')) {
                obj.resourceId = val['_hub_resourceid_value']; 
                eventObjList.push(obj);
            }else{
              // Don not allow duplicate students into sofList
              var index = self.sofList.map(function(x){
                      return x.id;
              }).indexOf(val._hub_student_value);
              if(index == -1){
                self.sofList.push(obj);  
              }
            }
          });
          setTimeout(function(){
              if(self.sofList.length){
                  self.populateSOFPane(self.sofList,self.calendarOptions.minTime,self.calendarOptions.maxTime);
              }
          },800);
          self.convertedStudentObj = eventObjList;
        }else if(label == "teacherAvailability"){
          var currentCalendarDate = this.calendar.fullCalendar('getDate');
          for(var i=0;i<args.length; i++){
              if(args[i]['hub_'+ moment(currentCalendarDate).format('dddd').toLowerCase()]){
                  var obj = {
                      name : args[i]['_hub_staffid_value@OData.Community.Display.V1.FormattedValue'],
                      id: args[i]['_hub_staffid_value'],
                      startDate : args[i]['hub_startdate@OData.Community.Display.V1.FormattedValue'],
                      endDate : args[i]['hub_enddate@OData.Community.Display.V1.FormattedValue'],
                      locationId : args[i]['astaff_x002e_hub_center'] ,
                      deliveryTypeId : args[i]['_hub_deliverytype_value'],
                      subjects:this.getTeacherSubjects(args[i])
                  }
                  switch(moment(currentCalendarDate).format('dddd').toLowerCase()){
                      case 'monday':
                          obj.startTime = args[i]['hub_monstarttime@OData.Community.Display.V1.FormattedValue'];
                          if(args[i]['hub_monendtime@OData.Community.Display.V1.FormattedValue'] == undefined)
                          {
                            obj.endTime = moment(obj.startTime, 'h:mm A').add(1,'h').format('h:mm A');
                            obj.startHour = obj.startTime.split(' ')[1] == 'AM' ? parseInt(moment(obj.startTime, 'h:mm A').format('h')) : parseInt(moment(obj.startTime, 'h:mm A').format('h')) +12 ;
                            eventObjList.push(obj);
                          }
                          else{
                            var staffEndTime = args[i]['hub_monendtime@OData.Community.Display.V1.FormattedValue'];
                            var staffEndHour = staffEndTime.split(' ')[1] == 'AM' ? parseInt(moment(staffEndTime, 'h:mm A').format('h')) : parseInt(moment(staffEndTime, 'h:mm A').format('h')) +12;
                            var staffStartHour = obj.startTime.split(' ')[1] == 'AM' ? parseInt(moment(obj.startTime, 'h:mm A').format('h')) : parseInt(moment(obj.startTime, 'h:mm A').format('h')) +12 ;
                            do{
                              var newObject = wjQuery.extend(true, {}, obj);
                              newObject.startHour = staffStartHour;
                              eventObjList.push(newObject);
                              staffStartHour++;
                            }
                            while(staffStartHour < staffEndHour);
                          }
                      break;
                      case 'tuesday':
                          obj.startTime = args[i]['hub_tuestarttime@OData.Community.Display.V1.FormattedValue'];
                          if(args[i]['hub_tueendtime@OData.Community.Display.V1.FormattedValue'] == undefined)
                          {
                            obj.endTime = moment(obj.startTime, 'h:mm A').add(1,'h').format('h:mm A');
                            obj.startHour = obj.startTime.split(' ')[1] == 'AM' ? parseInt(moment(obj.startTime, 'h:mm A').format('h')) : parseInt(moment(obj.startTime, 'h:mm A').format('h')) +12 ;
                            eventObjList.push(obj);
                          }
                          else{
                            var staffEndTime = args[i]['hub_tueendtime@OData.Community.Display.V1.FormattedValue'];
                            var staffEndHour = staffEndTime.split(' ')[1] == 'AM' ? parseInt(moment(staffEndTime, 'h:mm A').format('h')) : parseInt(moment(staffEndTime, 'h:mm A').format('h')) +12;
                            var staffStartHour = obj.startTime.split(' ')[1] == 'AM' ? parseInt(moment(obj.startTime, 'h:mm A').format('h')) : parseInt(moment(obj.startTime, 'h:mm A').format('h')) +12 ;
                            do{
                              var newObject = wjQuery.extend(true, {}, obj);
                              newObject.startHour = staffStartHour;
                              eventObjList.push(newObject);
                              staffStartHour++;
                            }
                            while(staffStartHour < staffEndHour);
                          }
                      break;
                      case 'wednesday':
                          obj.startTime = args[i]['hub_wedstarttime@OData.Community.Display.V1.FormattedValue'];
                           if(args[i]['hub_wedendtime@OData.Community.Display.V1.FormattedValue'] == undefined)
                          {
                            obj.endTime = moment(obj.startTime, 'h:mm A').add(1,'h').format('h:mm A');
                            obj.startHour = obj.startTime.split(' ')[1] == 'AM' ? parseInt(moment(obj.startTime, 'h:mm A').format('h')) : parseInt(moment(obj.startTime, 'h:mm A').format('h')) +12 ;
                            eventObjList.push(obj);
                          }
                          else{
                            var staffEndTime = args[i]['hub_wedendtime@OData.Community.Display.V1.FormattedValue'];
                            var staffEndHour = staffEndTime.split(' ')[1] == 'AM' ? parseInt(moment(staffEndTime, 'h:mm A').format('h')) : parseInt(moment(staffEndTime, 'h:mm A').format('h')) +12;
                            var staffStartHour = obj.startTime.split(' ')[1] == 'AM' ? parseInt(moment(obj.startTime, 'h:mm A').format('h')) : parseInt(moment(obj.startTime, 'h:mm A').format('h')) +12 ;
                            do{
                              var newObject = wjQuery.extend(true, {}, obj);
                              newObject.startHour = staffStartHour;
                              eventObjList.push(newObject);
                              staffStartHour++;
                            }
                            while(staffStartHour < staffEndHour);
                          }
                      break;
                      case 'thursday':
                          obj.startTime = args[i]['hub_thurstarttime@OData.Community.Display.V1.FormattedValue'];
                           if(args[i]['hub_thurendtime@OData.Community.Display.V1.FormattedValue'] == undefined)
                          {
                            obj.endTime = moment(obj.startTime, 'h:mm A').add(1,'h').format('h:mm A');
                            obj.startHour = obj.startTime.split(' ')[1] == 'AM' ? parseInt(moment(obj.startTime, 'h:mm A').format('h')) : parseInt(moment(obj.startTime, 'h:mm A').format('h')) +12 ;
                            eventObjList.push(obj);
                          }
                          else{
                            var staffEndTime = args[i]['hub_thurendtime@OData.Community.Display.V1.FormattedValue'];
                            var staffEndHour = staffEndTime.split(' ')[1] == 'AM' ? parseInt(moment(staffEndTime, 'h:mm A').format('h')) : parseInt(moment(staffEndTime, 'h:mm A').format('h')) +12;
                            var staffStartHour = obj.startTime.split(' ')[1] == 'AM' ? parseInt(moment(obj.startTime, 'h:mm A').format('h')) : parseInt(moment(obj.startTime, 'h:mm A').format('h')) +12 ;
                            do{
                              var newObject = wjQuery.extend(true, {}, obj);
                              newObject.startHour = staffStartHour;
                              eventObjList.push(newObject);
                              staffStartHour++;
                            }
                            while(staffStartHour < staffEndHour);
                          }
                      break;
                      case 'friday':
                          obj.startTime = args[i]['hub_fristarttime@OData.Community.Display.V1.FormattedValue'];
                           if(args[i]['hub_friendtime@OData.Community.Display.V1.FormattedValue'] == undefined)
                          {
                            obj.endTime = moment(obj.startTime, 'h:mm A').add(1,'h').format('h:mm A');
                            obj.startHour = obj.startTime.split(' ')[1] == 'AM' ? parseInt(moment(obj.startTime, 'h:mm A').format('h')) : parseInt(moment(obj.startTime, 'h:mm A').format('h')) +12 ;
                            eventObjList.push(obj);
                          }
                          else{
                            var staffEndTime = args[i]['hub_friendtime@OData.Community.Display.V1.FormattedValue'];
                            var staffEndHour = staffEndTime.split(' ')[1] == 'AM' ? parseInt(moment(staffEndTime, 'h:mm A').format('h')) : parseInt(moment(staffEndTime, 'h:mm A').format('h')) +12;
                            var staffStartHour = obj.startTime.split(' ')[1] == 'AM' ? parseInt(moment(obj.startTime, 'h:mm A').format('h')) : parseInt(moment(obj.startTime, 'h:mm A').format('h')) +12 ;
                            do{
                              var newObject = wjQuery.extend(true, {}, obj);
                              newObject.startHour = staffStartHour;
                              eventObjList.push(newObject);
                              staffStartHour++;
                            }
                            while(staffStartHour < staffEndHour);
                          }
                      break;
                      case 'saturday':
                          obj.startTime = args[i]['hub_satstarttime@OData.Community.Display.V1.FormattedValue'];
                           if(args[i]['hub_satendtime@OData.Community.Display.V1.FormattedValue'] == undefined)
                          {
                            obj.endTime = moment(obj.startTime, 'h:mm A').add(1,'h').format('h:mm A');
                            obj.startHour = obj.startTime.split(' ')[1] == 'AM' ? parseInt(moment(obj.startTime, 'h:mm A').format('h')) : parseInt(moment(obj.startTime, 'h:mm A').format('h')) +12 ;
                            eventObjList.push(obj);
                          }
                          else{
                            var staffEndTime = args[i]['hub_satendtime@OData.Community.Display.V1.FormattedValue'];
                            var staffEndHour = staffEndTime.split(' ')[1] == 'AM' ? parseInt(moment(staffEndTime, 'h:mm A').format('h')) : parseInt(moment(staffEndTime, 'h:mm A').format('h')) +12;
                            var staffStartHour = obj.startTime.split(' ')[1] == 'AM' ? parseInt(moment(obj.startTime, 'h:mm A').format('h')) : parseInt(moment(obj.startTime, 'h:mm A').format('h')) +12 ;
                            do{
                              var newObject = wjQuery.extend(true, {}, obj);
                              newObject.startHour = staffStartHour;
                              eventObjList.push(newObject);
                              staffStartHour++;
                            }
                            while(staffStartHour < staffEndHour);
                          }
                      break ;
                      case 'sunday':
                          obj.startTime = args[i]['hub_sunstarttime@OData.Community.Display.V1.FormattedValue'];
                           if(args[i]['hub_sunendtime@OData.Community.Display.V1.FormattedValue'] == undefined)
                          {
                            obj.endTime = moment(obj.startTime, 'h:mm A').add(1,'h').format('h:mm A');
                            obj.startHour = obj.startTime.split(' ')[1] == 'AM' ? parseInt(moment(obj.startTime, 'h:mm A').format('h')) : parseInt(moment(obj.startTime, 'h:mm A').format('h')) +12 ;
                            eventObjList.push(obj);
                          }
                          else{
                            var staffEndTime = args[i]['hub_sunendtime@OData.Community.Display.V1.FormattedValue'];
                            var staffEndHour = staffEndTime.split(' ')[1] == 'AM' ? parseInt(moment(staffEndTime, 'h:mm A').format('h')) : parseInt(moment(staffEndTime, 'h:mm A').format('h')) +12;
                            var staffStartHour = obj.startTime.split(' ')[1] == 'AM' ? parseInt(moment(obj.startTime, 'h:mm A').format('h')) : parseInt(moment(obj.startTime, 'h:mm A').format('h')) +12 ;
                            do{
                              var newObject = wjQuery.extend(true, {}, obj);
                              newObject.startHour = staffStartHour;
                              eventObjList.push(newObject);
                              staffStartHour++;
                            }
                            while(staffStartHour < staffEndHour);
                          }
                      break;
                  }
              }
          }
          this.taList = eventObjList;
        }
       
        return eventObjList;
    }

    this.populateTeacherEvent = function(teacherObject, isFromFilter){
        var self = this;
        if (teacherObject.length) {
          wjQuery.each(teacherObject, function(key, value) {
            id = value['id'];
            name = value['name'];
            eventId = value['resourceId']+value['startHour'];
            event = self.calendar.fullCalendar('clientEvents', eventId);
            if(event.length == 1){
              var uniqueId ='';
              wjQuery.each(event, function(k, v){
                if(event[k].hasOwnProperty("teachers") && event[k]['teachers'].length !=0 ){
                  index = event[k].teachers.map(function(x){
                      return x.id;
                  }).indexOf(id);
                  if(index == -1){
                    event[k].title = "";
                    if(event[k].title.includes("<img class='onetoone' src='/webresources/hub_/calendar/images/lock.png'>")){
                      event[k].title = event[k].title.replace("<img class='onetoone' src='/webresources/hub_/calendar/images/lock.png'>", "");
                    }
                    if(!event[k].title.includes('<img class="conflict" src="/webresources/hub_/calendar/images/warning.png">')){
                      event[k].title +=  '<img class="conflict" src="/webresources/hub_/calendar/images/warning.png">';
                    }
                    event[k].teachers.push({id:id, name:name});
                    wjQuery.each(event[k].teachers, function(ka, v){
                      uniqueId = v.id+"_"+value['resourceId']+"_"+value['startHour'];
                      if(value['pinId'] != undefined){
                        event[k].title += "<span class='draggable drag-teacher' pinnedId='"+ value['pinId']+"' eventid='"+eventId+"' uniqueId='"+uniqueId+"' id='"+v.id+value['resourceId']+"' type='teacherSession' value='"+v.id+"'><img src='/webresources/hub_/calendar/images/pin.png'/>"+v.name+"</span>";
                      }else{
                        event[k].title += "<span class='draggable drag-teacher' eventid='"+eventId+"' uniqueId='"+uniqueId+"' id='"+v.id+value['resourceId']+"' type='teacherSession' value='"+v.id+"'>"+v.name+"</span>";
                      }
                      event[k].isConflict = true;
                    });
                    if(event[k].hasOwnProperty("students")){
                      wjQuery.each(event[k].students, function(ke, val){
                        event[k].title += "<span class='draggable drag-student' eventid='"+eventId+"' uniqueId='"+val.id+"_"+value['resourceId']+"_"+value['startHour']+"' id='"+val.id+value['resourceId']+"' type='studentSession' value='"+val.id+"'>"+val.name+", "+val.grade+"</span>";
                      });
                    }
                    if(!event[k].title.includes('<span class="student-placeholder">Student name</span>')){
                      event[k].title +='<span class="student-placeholder" >Student name</span>';
                    }
                  }
                }else{
                  uniqueId = id+"_"+value['resourceId']+"_"+value['startHour'];
                  if(event[k].title.includes("<img class='onetoone' src='/webresources/hub_/calendar/images/lock.png'>")){
                    event[k].title = "<img class='onetoone' src='/webresources/hub_/calendar/images/lock.png'>";
                    if(value['pinId'] != undefined){
                      event[k].title += "<span class='draggable drag-teacher' pinnedId='"+ value['pinId']+"' eventid='"+eventId+"' uniqueId='"+uniqueId+"' id='"+v.id+value['resourceId']+"' type='teacherSession' value='"+id+"'><img src='/webresources/hub_/calendar/images/pin.png'/>"+value.name+"</span>";
                    }else{
                      event[k].title += "<span class='draggable drag-teacher' eventid='"+eventId+"' uniqueId='"+uniqueId+"' id='"+v.id+value['resourceId']+"' type='teacherSession' value='"+id+"'>"+value.name+"</span>";
                    }
                  }else{
                    if(value['pinId'] != undefined){
                      event[k].title = "<span class='draggable drag-teacher' pinnedId='"+ value['pinId']+"' eventid='"+eventId+"' uniqueId='"+uniqueId+"' id='"+v.id+value['resourceId']+"' type='teacherSession' value='"+id+"'><img src='/webresources/hub_/calendar/images/pin.png'/>"+value.name+"</span>";
                    }else{
                      event[k].title = "<span class='draggable drag-teacher' eventid='"+eventId+"' uniqueId='"+uniqueId+"' id='"+id+value['resourceId']+"' type='teacherSession' value='"+id+"'>"+value.name+"</span>";
                    }
                  }
                  var studentList = event[k].students;
                  event[k].teachers = [{id:id, name:name}];
                  wjQuery.each(studentList, function(ke, val){
                    event[k].title += "<span class='draggable drag-student' eventid='"+eventId+"' uniqueId='"+val.id+"_"+value['resourceId']+"_"+value['startHour']+"' id='"+val.id+value['resourceId']+"' type='studentSession' value='"+val.id+"'>"+val.name+", "+val.grade+"</span>";
                  });
                }
                var resourceObj = self.getResourceObj(value['resourceId']);
                if(event[k].title.includes('<span class="student-placeholder">Student name</span>')){
                  event[k].title = event[k].title.replace('<span class="student-placeholder">Student name</span>', "");
                }
                if(event[k].students != undefined){
                  if(event[k].students.length <= resourceObj["capacity"] || resourceObj["capacity"] == undefined){
                    event[k].title += '<span class="student-placeholder">Student name</span>';                  
                  } 
                }
              });
              self.calendar.fullCalendar('updateEvent', event);
              if(value['pinId'] != undefined){
                self.addContext(uniqueId,'teacher',true);
              }
              else{
                self.addContext(uniqueId,'teacher',false);
              }
            }else{
              var uniqueId = id+"_"+value['resourceId']+"_"+value['startHour'];
              var obj = {
                  id: value['resourceId']+value['startHour'],
                  teachers:[{id:id, name:name}],
                  start:value['startHour'],
                  //end:value['end'],
                  allDay: false,
                  resourceId: value['resourceId'],
                  isTeacher: true,
                  isConflict: false,
                  deliveryTypeId: self.getResourceObj(value['resourceId']).deliveryTypeId,
                  deliveryType : self.getResourceObj(value['resourceId']).deliveryType,
                  textColor:"#333333",
              }
              if(value['pinId'] != undefined){
                obj.title = "<span class='draggable drag-teacher' pinnedId='"+ value['pinId']+ "' eventid='"+eventId+"' uniqueId='"+uniqueId+"' id='"+id+value['resourceId']+"' type='teacherSession' value='"+id+"'><img src='/webresources/hub_/calendar/images/pin.png'/>"+name+"</span>";
              }
              else{
                obj.title = "<span class='draggable drag-teacher' eventid='"+eventId+"' uniqueId='"+uniqueId+"' id='"+id+value['resourceId']+"' type='teacherSession' value='"+id+"'>"+name+"</span>";
              }
              
              obj.title += '<span class="student-placeholder">Student name</span>';
              if(obj.deliveryType == "Group Facilitation"){
                  obj.backgroundColor = "#dff0d5";
                  obj.borderColor = "#7bc143";
              }else if(obj.deliveryType== "Group Instruction"){
                  obj.backgroundColor = "#fedeb7";
                  obj.borderColor = "#f88e50";
              }else if(obj.deliveryType== "Personal Instruction"){ 
                  obj.backgroundColor = "#ebf5fb";
                  obj.borderColor = "#9acaea";
              }
              self.eventList.push(obj);
              if(isFromFilter){
                self.calendar.fullCalendar('removeEvents');
                self.calendar.fullCalendar('addEventSource', {events:self.eventList});
              }
              self.calendar.fullCalendar('refetchEvents');
              if(value['pinId'] != undefined){
                self.addContext(uniqueId,'teacher',true);
              }
              else{
                self.addContext(uniqueId,'teacher',false);
              }
            }
            self.draggable('draggable');
          });
        }
    }

    this.populateStudentEvent = function(studentList, isFromFilter){
        var self = this;
        if (studentList.length) {
            wjQuery.each(studentList, function(key, value) {
                var id = value['id'];
                var name = value['name'];
                var grade = value['grade'];
                var subjectId = value['subjectId'];
                var serviceId = value['serviceId'];
                var subjectName = value['subject'];
                var programId = value['programId'];
                var eventId = value['resourceId']+value['startHour'];
                var uniqueId = id+"_"+value['resourceId']+"_"+value['startHour'];
                var event = self.calendar.fullCalendar('clientEvents', eventId);
                if(event.length){
                    wjQuery.each(event, function(k, v){
                      if(event[k].hasOwnProperty("students") && event[k]['students'].length !=0 ){
                        index = event[k].students.map(function(x){
                             return x.id;
                        }).indexOf(id);
                        if(index == -1){
                            if(value['pinId'] != undefined){
                              event[k].title += "<span class='draggable drag-student' eventid='"+eventId+"' pinnedId='"+ value['pinId'] +"' uniqueId='"+uniqueId+"' id='"+id+value['resourceId']+"' type='studentSession' value='"+id+"'><img src='/webresources/hub_/calendar/images/pin.png'/>"+name+", "+grade+"</span>";
                            }else{
                              event[k].title += "<span class='draggable drag-student' eventid='"+eventId+"' uniqueId='"+uniqueId+"' id='"+id+value['resourceId']+"' type='studentSession' value='"+id+"'>"+name+", "+grade+"</span>";
                            }
                          event[k].students.push({id:id, name:name, grade:grade, serviceId:serviceId, programId:programId});
                        }
                      }else{
                        if(value['pinId'] != undefined){
                            event[k].title += "<span class='draggable drag-student' eventid='"+eventId+"' pinnedId='"+ value['pinId'] +"' uniqueId='"+uniqueId+"' id='"+id+value['resourceId']+"' type='studentSession' value='"+id+"'><img src='/webresources/hub_/calendar/images/pin.png'/>"+name+", "+grade+"</span>";
                        }else{
                          event[k].title += "<span class='draggable drag-student' eventid='"+eventId+"' uniqueId='"+uniqueId+"' id='"+id+value['resourceId']+"' type='studentSession' value='"+id+"'>"+name+", "+grade+"</span>";
                        }
                        event[k].students = [{id:id, name:name, grade:grade, serviceId:serviceId, programId:programId }];
                      }
                      var resourceObj = self.getResourceObj(value['resourceId']);
                      if(event[k].title.includes('<span class="student-placeholder" >Student name</span>')){
                        event[k].title = event[k].title.replace('<span class="student-placeholder" >Student name</span>', '');
                      }
                      if(event[k].title.includes('<span class="student-placeholder">Student name</span>')){
                        event[k].title = event[k].title.replace('<span class="student-placeholder">Student name</span>', '');
                      }
                      if(event[k].students.length <= resourceObj["capacity"] || resourceObj["capacity"] == undefined){
                        event[k].title += '<span class="student-placeholder">Student name</span>';                  
                      } 
                    });
                    self.calendar.fullCalendar('updateEvent', event);
                    if(value['pinId'] != undefined){
                      self.addContext(uniqueId,'student',true);
                    }
                    else{
                      self.addContext(uniqueId,'student',false);
                    }
                }else{
                    var obj = {
                        id: eventId,
                        students:[{id:id, name:name, grade:grade, serviceId:serviceId, programId:programId }],
                        start:value['startHour'],
                        //end:value['end'],
                        allDay: false,
                        resourceId: value['resourceId'],
                        isTeacher: false,
                        is1to1: value['is1to1'],
                        isConflict: false,
                        textColor:"#333333",
                    }
                    obj.title = "";
                    if(value['is1to1']){
                      obj.title += "<img class='onetoone' src='/webresources/hub_/calendar/images/lock.png'>";
                    }
                    obj.title += "<span class='placeholder'>Teacher name</span>";
                    if(value['pinId'] != undefined){
                      obj.title += "<span class='draggable drag-student' eventid='"+eventId+"' pinnedId='"+ value['pinId'] +"' uniqueId='"+uniqueId+"' id='"+id+value['resourceId']+"' type='studentSession' value='"+id+"'><img src='/webresources/hub_/calendar/images/pin.png'/>"+name+", "+grade+"</span>";
                    }else{
                      obj.title += "<span class='draggable drag-student' eventid='"+eventId+"' uniqueId='"+uniqueId+"' id='"+id+value['resourceId']+"' type='studentSession' value='"+id+"'>"+name+", "+grade+"</span>";
                    }
                    if(value.deliveryType == "Group Facilitation"){ 
                        obj.backgroundColor = "#dff0d5";
                        obj.borderColor = "#7bc143";
                    }else if(value.deliveryType == "Group Instruction"){ 
                        obj.backgroundColor = "#fedeb7";
                        obj.borderColor = "#f88e50";
                    }else if(value.deliveryType == "Personal Instruction"){ 
                        obj.backgroundColor = "#ebf5fb";
                        obj.borderColor = "#9acaea";
                    }
                    self.eventList.push(obj);
                    var resourceObj = self.getResourceObj(value['resourceId']);
                    if(resourceObj["capacity"] >= 1 || resourceObj["capacity"] == undefined){
                      obj.title += '<span class="student-placeholder">Student name</span>';                  
                    } 
                    if(isFromFilter){
                      self.calendar.fullCalendar('removeEvents');
                      self.calendar.fullCalendar('addEventSource', {events:self.eventList});
                    }
                    self.calendar.fullCalendar('refetchEvents');
                    if(value['pinId'] != undefined){
                      self.addContext(uniqueId,'student',true);
                    }
                    else{
                      self.addContext(uniqueId,'student',false);
                    }
                }
                self.draggable('draggable');
            });
        }
    }

    this.filterItems = function(obj, filterTerm, filterFor){
      var self = this;
      if(filterFor == "tapane"){
        return obj.filter(function(el){
            if((el['subjects'].indexOf(parseInt(filterTerm)) != -1 )){
                return el;
            }
        });
      }else{
        return obj.filter(function(el){
            if(el.subject != undefined){
              if((el.id == filterTerm || el.gradeId == filterTerm || el.subject.toLowerCase() == filterTerm.toLowerCase()) && self.selectedDeliveryType.indexOf(el['deliveryTypeId']) != -1){
                  return el;
              }
            }
        });
      }
    }

    this.pinStudent = function(element){
      var id = wjQuery(element).attr('value');
      var uniqueId = wjQuery(element).attr('uniqueId');
      var startTime = uniqueId.split('_')[2];
      var today = this.calendar.fullCalendar('getDate');
      var student = this.convertedStudentObj.filter(function(x){
        return x.id == id;
      });
      var objPinnedStudent = {};
      if(student != undefined){
        objPinnedStudent['hub_center@odata.bind'] = student[0].locationId;
        objPinnedStudent['hub_enrollment@odata.bind'] = student[0].enrollmentId;
        objPinnedStudent['hub_productservice@odata.bind'] = student[0].serviceId;
        objPinnedStudent['hub_studnet@odata.bind'] = id;
        objPinnedStudent['hub_resource@odata.bind'] = student[0].resourceId;
      }
      objPinnedStudent.hub_strat_time = this.convertToMinutes(moment(startTime).format("h:mm A"));
      objPinnedStudent.hub_end_time = objPinnedStudent.hub_strat_time + 60;
      objPinnedStudent.hub_day = this.getDayValue(today);
      objPinnedStudent.hub_date = moment(today).format("YYYY-MM-DD");
      var responseObj = data.savePinStudent(objPinnedStudent);
      if(responseObj != undefined){
        var txt = wjQuery(element).text();
        wjQuery(element).html("<img src='/webresources/hub_/calendar/images/pin.png'/>"+txt);
        wjQuery(element).attr('pinnedId',responseObj['hub_pinned_student_teacher_id']);
      }
    };

    this.unPinStudent = function(element){
      var id = wjQuery(element).attr('value');
      var uniqueId = wjQuery(element).attr('uniqueId');
      var startTime = uniqueId.split('_')[2];
      var today = this.calendar.fullCalendar('getDate');
      var student = this.convertedStudentObj.filter(function(x){
        return x.id == id;
      });
      var objUnPinnedStudent = {};
      if(student != undefined){
        objUnPinnedStudent['hub_center@odata.bind'] = student[0].locationId;
        objUnPinnedStudent['hub_enrollment@odata.bind'] = student[0].enrollmentId;
        objUnPinnedStudent['hub_productservice@odata.bind'] = student[0].serviceId;
        objUnPinnedStudent['hub_studnet@odata.bind'] = id;
        objUnPinnedStudent['hub_resource@odata.bind'] = student[0].resourceId;
      }
      objUnPinnedStudent.hub_strat_time = this.convertToMinutes(moment(startTime).format("h:mm A"));
      objUnPinnedStudent.hub_end_time = objUnPinnedStudent.hub_strat_time + 60;
      objUnPinnedStudent.hub_day = this.getDayValue(today);
      objUnPinnedStudent.hub_date = moment(today).format("YYYY-MM-DD");
      objUnPinnedStudent.hub_sch_pinned_students_teachersid = wjQuery(element).attr('pinnedId');
      if(data.saveUnPinStudent(objUnPinnedStudent)){
          wjQuery(element).removeAttr('pinnedId')
          wjQuery(element).find("img").remove();    
        }
    };

    this.pinTeacher = function(element,pinFor){
      var id = wjQuery(element).attr('value');
      var uniqueId = wjQuery(element).attr('uniqueId');
      var startTime = uniqueId.split('_')[2];
      var today = this.calendar.fullCalendar('getDate');
      var teacher = this.convertedTeacherObj.filter(function(x){
        return x.id == id;
      });
      var objPinnedStaff = {};
      if(teacher != undefined){
        objPinnedStaff['hub_center@odata.bind'] = teacher[0].locationId;
        objPinnedStaff['hub_teacher@odata.bind'] = id;
        objPinnedStaff.hub_day = this.getDayValue(today);
        objPinnedStaff.hub_date = moment(today).format("YYYY-MM-DD");
        if(pinFor == 'time'){
          objPinnedStaff['hub_resource@odata.bind'] = null;
          objPinnedStaff.hub_strat_time = this.convertToMinutes(moment(startTime).format("h:mm A"));
          objPinnedStaff.hub_end_time = objPinnedStaff.hub_strat_time + 60;
        }
        else{
          objPinnedStaff['hub_resource@odata.bind'] = teacher[0].resourceId;
          objPinnedStaff.hub_strat_time = null;
          objPinnedStaff.hub_end_time = null;
        }
        var responseObj = data.savePinTeacher(objPinnedStaff);
        if(responseObj != undefined){
          var txt = wjQuery(element).text();
          wjQuery(element).html("<img src='/webresources/hub_/calendar/images/pin.png'/>"+txt);
          wjQuery(element).attr('pinnedId',responseObj['hub_pinned_student_teacher_id']);
        }
      }
    };

    this.unPinTeacher = function(element){
      var id = wjQuery(element).attr('value');
      var uniqueId = wjQuery(element).attr('uniqueId');
      var startTime = uniqueId.split('_')[2];
      var today = this.calendar.fullCalendar('getDate');
      var teacher = this.convertedTeacherObj.filter(function(x){
        return x.id == id;
      });
      var objUnPinnedStaff = {};
      if(teacher != undefined){
        objUnPinnedStaff['hub_center@odata.bind'] = teacher[0].locationId;
        objUnPinnedStaff['hub_teacher@odata.bind'] = id;
        objUnPinnedStaff.hub_sch_pinned_students_teachersid = wjQuery(element).attr('pinnedId');
        objUnPinnedStaff.hub_day = this.getDayValue(today);
        objUnPinnedStaff.hub_date = moment(today).format("YYYY-MM-DD");
        objUnPinnedStaff.hub_strat_time = this.convertToMinutes(moment(startTime).format("h:mm A"));
        objUnPinnedStaff.hub_end_time = objUnPinnedStaff.hub_strat_time + 60;
        objUnPinnedStaff['hub_resource@odata.bind'] = teacher[0].resourceId;
        if(data.saveUnPinTeacher(objUnPinnedStaff)){
          wjQuery(element).removeAttr('pinnedId');
          wjQuery(element).find("img").remove();
        }
      }
    };

    this.addContext = function(uniqueId,labelFor,isPinned){
      var self = this;
      var obj = {}; 
      if(labelFor == 'student'){
        obj.unpin = {name: "Unpin"};
        obj.unpin.visible = true;
        obj.unpin.callback = function(key, options) {
          obj.unpin.visible = false;
          obj.pin.visible = true;
          self.unPinStudent(options.$trigger[0]);
        }
        obj.pin = {name: "Pin"};
        obj.pin.visible = true;
        obj.pin.callback = function(key, options) {
          obj.unpin.visible = true;
          obj.pin.visible = false;
          self.pinStudent(options.$trigger[0]);
        }  
        
      }
      else{
        obj.pin = {
          "name": "Pin",
          "visible": true,
          "items": {
            "pinbyTime": {"name": "Time",
            callback : function(key, options) {
              obj.unpin.visible = true;
              obj.pin.visible = false;
              self.pinTeacher(options.$trigger[0],'time');
              }  
            },
            "pinbyResource": {"name": "Resource",
              callback : function(key, options) {
              obj.unpin.visible = true;
              obj.pin.visible = false;
              self.pinTeacher(options.$trigger[0],'resource');
              }

            }
          }
        };
        obj.unpin = {
          "name": "Unpin",
          "visible": false,
          callback : function(key, options) {
          obj.unpin.visible = false;
          obj.pin.visible = true;
          self.unPinTeacher(options.$trigger[0]);
        }
        };
      }   
      if(isPinned){
          obj.unpin.visible = true;
          obj.pin.visible = false;
        }
        else{
          obj.unpin.visible = false;
          obj.pin.visible = true;
        } 
      //obj.reschedule = {name: "Reschedule"};
      //obj.remove = {name: "Remove"};
      obj.cancel = {name: "Cancel"};
      wjQuery(function() {
        wjQuery.contextMenu({
            selector: 'span[uniqueId="'+uniqueId+'"]', 
            build: function($trigger, e) {
              return {
                items: obj
              };
            }
        }); 
      });
    };

    this.draggable = function(selector){
      wjQuery('.'+selector).draggable({
        revert: true,      
        revertDuration: 0,
        appendTo: '#scrollarea',
        helper: 'clone',
        cursor: "move",
        scroll: true,
        cursorAt: { top : 0 }
        /*drag : function(){
          if(sofExpanded){
            wjQuery('.sof-pane').css('opacity','.3');
          }
          if(taExpanded){
            wjQuery('.ta-pane').css('opacity','.3');
          }
        },
        stop : function(){
          if(sofExpanded){
            wjQuery('.sof-pane').css('opacity','1');
          }
          if(taExpanded){
            wjQuery('.ta-pane').css('opacity','1');
          }
        }*/
      });
    };

    this.convertPinnedData = function(data){
      for (var i = 0; i < data.length; i++) {
        var obj={
          id: data[i]['hub_sch_pinned_students_teachersid'],
          startTime : data[i]['hub_start_time@OData.Community.Display.V1.FormattedValue'],
          endTime: data[i]['hub_end_time@OData.Community.Display.V1.FormattedValue'],
          studentId : data[i]['_hub_student_value'],
          studentName : data[i]['_hub_student_value@OData.Community.Display.V1.FormattedValue'],
          teacherId: data[i]['_hub_teacher_value'],
          teacherName: data[i]['_hub_teacher_value@OData.Community.Display.V1.FormattedValue'],
          resourceId: data[i]['_hub_resource_value'],
          resourceName: data[i]['_hub_resource_value@OData.Community.Display.V1.FormattedValue'],
          dayId: data[i]['hub_day'],
          dayValue : data[i]['hub_day@OData.Community.Display.V1.FormattedValue']
        };
        this.convertedPinnedList.push(obj);
      }
    };

    this.getResourceObj = function(resourceId){
      var resourceObj = {}; 
      wjQuery.each(this.resourceList, function(k, v){
          if (resourceId == v.id) {
            resourceObj = v;
          }
      });
      return resourceObj;
    };

    this.saveStudentToSession = function(student,prevStudent){
      var objPrevSession = {};
      var objNewSession = {};
      if(student != undefined){
        var objStudent = this.students.filter(function(x){
          return x._hub_student_value == student.id;
        });
        var oldDate = objStudent[0].hub_session_date;
        var sessionDate = moment(student.start).format("YYYY-MM-DD");
        var OldDeliveryType = objStudent[0]["aproductservice_x002e_hub_deliverytype@OData.Community.Display.V1.FormattedValue"];
        var oldTime = objStudent[0]['hub_start_time@OData.Community.Display.V1.FormattedValue'];
        var newTime = moment(student.start).format("h:mm A");

        // Session type condition
        objNewSession['hub_sessiontype'] = 5;
        if(oldDate == sessionDate && newTime != oldTime && student.deliveryType == "Personal Instruction"){
          objNewSession['hub_sessiontype'] = 1;
        }

        objPrevSession['hub_studentsessionid'] = objStudent[0]['hub_studentsessionid'];
        objPrevSession['hub_deliverytype'] = objStudent[0]['aproductservice_x002e_hub_deliverytype'];
        objPrevSession['hub_start_time'] = this.convertToMinutes(moment(prevStudent.start).format("h:mm A"));
        objPrevSession['hub_end_time'] = this.convertToMinutes(moment(prevStudent.end).format("h:mm A"));
        objPrevSession['hub_resourceid@odata.bind'] = "/hub_center_resourceses(" + prevStudent.resourceId + ")";
        objPrevSession['hub_deliverytype@OData.Community.Display.V1.FormattedValue'] = objStudent[0]['aproductservice_x002e_hub_deliverytype@OData.Community.Display.V1.FormattedValue'];
        objPrevSession['hub_session_date'] = objStudent[0]['hub_session_date'];

        objNewSession['hub_studentsessionid'] = objStudent[0]['hub_studentsessionid'];
        objNewSession['hub_center@odata.bind'] = "/hub_centers(" + objStudent[0]["_hub_center_value"] + ")";
        objNewSession['hub_enrollment@odata.bind'] = "/hub_enrollments(" + objStudent[0]['_hub_enrollment_value'] + ")";
        objNewSession['hub_student@odata.bind'] = "/contacts(" + objStudent[0]['_hub_student_value'] + ")";
        objNewSession['hub_resourceid@odata.bind'] = "/hub_center_resourceses(" + student.resourceId + ")";
        objNewSession['hub_service@odata.bind'] = "/hub_productservices(" + objStudent[0]['_hub_service_value'] + ")";
        objNewSession['hub_session_date'] = sessionDate;
        objNewSession['hub_start_time'] = this.convertToMinutes(moment(student.start).format("h:mm A"));
        objNewSession['hub_end_time'] = this.convertToMinutes(moment(student.end).format("h:mm A"));
        objNewSession['hub_deliverytype'] = student.deliveryTypeId;
        objNewSession['hub_deliverytype@OData.Community.Display.V1.FormattedValue'] = student.deliveryType;
        data.saveStudenttoSession(objPrevSession,objNewSession);
      }
    }

    this.saveTeacherToSession = function(teacher,prevTeacher){
      var objPrevSession = {};
      var objNewSession = {};
      if(teacher != undefined){
        var objTeacher = this.teacherSchedule.filter(function(x){
          return x._hub_staff_value == teacher.id;
        });
        if(objTeacher.length){
        // Old object
        objPrevSession['hub_staff_scheduleid'] = objTeacher[0]['hub_staff_scheduleid'];
        objPrevSession['hub_resourceid@odata.bind'] = "/hub_center_resourceses(" + prevTeacher['resourceId']+ ")";
        objPrevSession['hub_start_time'] = this.convertToMinutes(moment(prevTeacher.start).format("h:mm A"));
        objPrevSession['hub_end_time'] = this.convertToMinutes(moment(prevTeacher.end).format("h:mm A"));
        objPrevSession['hub_center_value'] = prevTeacher['locationId'];
        // New object
        objNewSession['hub_staff@odata.bind'] = "/hub_staffs(" + teacher['id']+ ")";
        objNewSession['hub_center_value'] = teacher['locationId'];
        objNewSession['hub_product_service@odata.bind'] = "/hub_productservices(" + objTeacher[0]['_hub_product_service_value'] + ")";
        objNewSession['hub_resourceid@odata.bind'] = "/hub_center_resourceses(" + teacher['resourceId']+ ")";
        objNewSession['hub_date'] = moment(teacher.start).format("YYYY-MM-DD");
        objNewSession['hub_start_time'] = this.convertToMinutes(moment(teacher.start).format("h:mm A"));
        objNewSession['hub_end_time'] = this.convertToMinutes(moment(teacher.end).format("h:mm A"));
        objNewSession['hub_schedule_type'] = 3;
        data.saveTeachertoSession(objPrevSession,objNewSession);
        }
      }
    }

    this.studentSessionCnfmPopup = function(t, date, allDay, ev, ui, resource, elm, message){
      wjQuery("#dialog > .dialog-msg").text(message);
      wjQuery("#dialog").dialog({
        resizable: false,
        height: "auto",
        width: 400,
        modal: true,
        buttons: {
          "Confirm": function() {
            t.studentSessionConflictCheck(t,date, allDay,ev,ui,resource,elm);
            wjQuery( this ).dialog( "close" );
          },
          Cancel: function() {
            wjQuery( this ).dialog( "close" );
          }
        }
      });
    }

    this.studentSofCnfmPopup = function(t, date, allDay, ev, ui, resource, elm, message){
      wjQuery("#dialog > .dialog-msg").text(message);
      wjQuery("#dialog").dialog({
        resizable: false,
        height: "auto",
        width: 400,
        modal: true,
        buttons: {
          "Confirm": function() {
            t.studentSofConflictCheck(t,date, allDay,ev,ui,resource,elm);
            wjQuery( this ).dialog( "close" );
          },
          Cancel: function() {
            wjQuery( this ).dialog( "close" );
          }
        }
      });
    }

    this.teacherSessionCnfmPopup = function(t, date, allDay, ev, ui, resource, elm, message){
      wjQuery("#dialog > .dialog-msg").text(message);
      wjQuery("#dialog").dialog({
        resizable: false,
        height: "auto",
        width: 400,
        modal: true,
        buttons: {
          "Confirm": function() {
            t.teacherSessionConflictCheck(t,date, allDay,ev,ui,resource,elm);
            wjQuery( this ).dialog( "close" );
          },
          Cancel: function() {
            wjQuery( this ).dialog( "close" );
          }
        }
      });
    }

    this.taPaneCnfmPopup = function(t, date, allDay, ev, ui, resource, elm, message){
      wjQuery("#dialog > .dialog-msg").text(message);
      wjQuery("#dialog").dialog({
        resizable: false,
        height: "auto",
        width: 400,
        modal: true,
        buttons: {
          "Confirm": function() {
            t.tapaneConflictCheck(t,date, allDay,ev,ui,resource,elm);
            wjQuery( this ).dialog( "close" );
          },
          Cancel: function() {
            wjQuery( this ).dialog( "close" );
          }
        }
      });
    }

    this.getProgramObj = function(teacherId){
      var programObj = [];
      this.staffProgram.map(function(x){
        if(x.astaffprogram_x002e_hub_staffid == teacherId){
          var PrograExist = programObj.map(function(y){
            return y;
          }).indexOf(x['hub_programid']);
          if(PrograExist == -1){
            programObj.push(x['hub_programid']);
          }
        }
      }).indexOf(teacherId);
      return programObj;
    }
    
}


