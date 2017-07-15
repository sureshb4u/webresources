var data = new Data();
var deliveryType = data.getDeliveryType();
var currentCalendarDate = moment(new Date()).format("YYYY-MM-DD");
setTimeout(function(){
  var deliveryTypeList = [];
    var sylvanCalendar = new SylvanCalendar();
    sylvanCalendar.init("widget-calendar");
    var locationId = sylvanCalendar.populateLocation(data.getLocation());
    setTimeout(function(){
    var filterObject = {
      time: time == null ? []: time,
      student:data.getStudentSession(locationId,currentCalendarDate,currentCalendarDate) == null ? []:data.getStudentSession(locationId,currentCalendarDate,currentCalendarDate) ,
      grade: data.getGrade() == null? [] : data.getGrade(),
      subject: data.getSubject() == null ? [] : data.getSubject()
    }
    sylvanCalendar.generateFilterObject(filterObject);
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
      if(selectedDeliveryType.length == 0 || selectedDeliveryType.length == deliveryType.length){
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
                            '<input type="radio" class="filterCheckBox" name="checkbox" value="'+self.filters[index][i].id+'">'+self.filters[index][i].name+
                        '</label>'+
                    '</div>');
                    }else{
                        wjQuery('#'+id).append('<div class="option_'+self.filters[index][i].id+' option-header-container">'+
                        '<label class="cursor option-title">'+
                            '<input type="checkbox" class="filterCheckBox" name="checkbox" value="'+self.filters[index][i].id+'">'+self.filters[index][i].name+
                        '</label>'+
                    '</div>');
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
                        self.populateTeacherEvent(self.convertedTeacherObj, true);
                        if(checkedList.length  == 0){
                            self.populateStudentEvent(self.convertedStudentObj, true);
                        }else{
                            var newArray = [];
                            wjQuery.each(checkedList, function(k, v){
                                newArray = wjQuery.merge(self.filterItems(self.convertedStudentObj, v), newArray);
                            });
                            self.populateStudentEvent(newArray, true);
                        }
                     }else{
                        self.eventList = [];
                        self.calendar.fullCalendar( 'removeEvents');
                        checkedList.splice(checkedList.indexOf(wjQuery(this).val()), 1);
                        self.calendar.fullCalendar('refetchEvents');
                        self.populateTeacherEvent(self.convertedTeacherObj, true);
                        if(checkedList.length == 0){
                            self.populateStudentEvent(self.convertedStudentObj, true);
                        }else{
                            var newArray = [];
                            wjQuery.each(checkedList, function(k, v){
                                newArray = wjQuery.merge(self.filterItems(self.convertedStudentObj, v), newArray);
                            });
                            self.populateStudentEvent(newArray, true);
                        }
                    }
                });
            }
        });
        wjQuery('.sof-pane').css('height',wjQuery('#calendar').height() - 10 +"px"); 
        wjQuery('.ta-pane').css('height',wjQuery('#calendar').height() - 10 +"px"); 
        wjQuery('.sof-pane').css('overflow-y','auto'); 
        wjQuery('.ta-pane').css('overflow-y','auto');
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
              });
          }
          this.loadCalendar(currentCalendarDate);
          this.loadMasterInformation();
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
      this.students = [];
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
        for(var i=0;i<(maxTime - minTime);i++){
            var elm = '<div class="student-overflow" id="student_block_'+i+'" style="height:'+ wjQuery(".fc-agenda-slots td div").height() * 2 +'px"></div>';
            wjQuery('.sof-pane').append(elm);;
        }
        for(var i=0;i<studentData.length;i++){
            var studentStartHour = studentData[i].start.getHours();
            if(studentStartHour >= minTime && studentStartHour <= maxTime){
              var studentPosition = studentStartHour - minTime;
              var elm = '<div class="student-container padding-lr-xxs" type="student" value="'+studentData[i].id+'">'+studentData[i].name+',<span>'+studentData[i].grade+'</span></div>';
              wjQuery('#student_block_'+studentPosition).append(elm);
              this.draggable('student-container');
            }
        }
    }

    this.populateTAPane = function(teacherData){
        var teacherArray = this.taList;
        var currentCalendarDate = this.calendar.fullCalendar('getDate');
        for(var i=0;i<teacherData.length; i++){
            if(teacherData[i]['hub_'+ moment(currentCalendarDate).format('dddd').toLowerCase()]){
                var obj = {
                    name : teacherData[i]['_hub_staffid_value@OData.Community.Display.V1.FormattedValue'],
                    id: teacherData[i]['_hub_staffid_value'],
                    startDate : teacherData[i]['hub_startdate@OData.Community.Display.V1.FormattedValue'],
                    endDate : teacherData[i]['hub_enddate@OData.Community.Display.V1.FormattedValue'],
                    locationId : teacherData[i]['astaff_x002e_hub_center'] ,
                    deliveryTypeId : teacherData[i]['_hub_deliverytype_value']
                }
                switch(moment(currentCalendarDate).format('dddd').toLowerCase()){
                    case 'monday':
                        obj.startTime = teacherData[i]['hub_monstarttime@OData.Community.Display.V1.FormattedValue'];
                    break;
                    case 'tuesday':
                        obj.startTime = teacherData[i]['hub_tuestarttime@OData.Community.Display.V1.FormattedValue'];
                    break;
                    case 'wednesday':
                        obj.startTime = teacherData[i]['hub_wedstarttime@OData.Community.Display.V1.FormattedValue'];
                    break;
                    case 'thursday':
                        obj.startTime = teacherData[i]['hub_thurstarttime@OData.Community.Display.V1.FormattedValue'];
                    break;
                    case 'friday':
                        obj.startTime = teacherData[i]['hub_fristarttime@OData.Community.Display.V1.FormattedValue'];
                    break;
                    case 'saturday':
                        obj.startTime = teacherData[i]['hub_satstarttime@OData.Community.Display.V1.FormattedValue'];
                    break ;
                    case 'sunday':
                        obj.startTime = teacherData[i]['hub_sunstarttime@OData.Community.Display.V1.FormattedValue'];
                    break;
                }
                obj.endTime = moment(obj.startTime, 'h:mm A').add(1,'h').format('h:mm A');
                obj.startHour = obj.startTime.split(' ')[1] == 'AM' ? parseInt(moment(obj.startTime, 'h:mm A').format('h')) : parseInt(moment(obj.startTime, 'h:mm A').format('h')) +12 ;
                teacherArray.push(obj);
            }
        }
        this.taList = teacherArray;
        for(var i=0;i<(this.calendarOptions.maxTime - this.calendarOptions.minTime);i++){
            var elm = '<div class="teacher-availability" id="teacher_block_'+i+'" style="height:'+ wjQuery(".fc-agenda-slots td div").height() * 2 +'px"></div>';
            wjQuery('.ta-pane').append(elm);
        }
        for(var i=0;i<teacherArray.length;i++){
            var studentStartHour = teacherArray[i].startHour;
            if(studentStartHour >= this.calendarOptions.minTime && studentStartHour <= this.calendarOptions.maxTime){
               var studentPosition = studentStartHour - this.calendarOptions.minTime;
               var elm =   '<div class="teacher-block"> <div class="teacher-container" type="teacher" value="'+teacherArray[i].id+'">'+
                            '<div class="display-inline-block padding-right-xs">'+ teacherArray[i].name+'</div>'+
                            '<div class="subject-identifier"></div>'+
                        '</div></div>';
               wjQuery('#teacher_block_'+studentPosition).append(elm);
               this.draggable('teacher-container');
            }
        }  
    }

    this.createEventOnDrop = function(t,date, allDay,ev,ui,resource,elm) {
        if(wjQuery(elm).attr("type") == 'student'){
            var endDate = new Date(date);
            var stuId = wjQuery(elm).attr("value"); 
            var student = t.sofList.filter(function( obj ) {
              return obj.id == stuId;
            });
            var index = t.sofList.map(function(x){
                    return x.id;
            }).indexOf(stuId);
            t.sofList.splice(index,1);
            if(student){
                elm.remove(); 
                student[0].start = date;
                student[0].end = new Date(endDate.setHours(endDate.getHours() + 1));
                student[0].resourceId = resource.id;
                t.populateStudentEvent(student);
            }          
        }
        else if(wjQuery(elm).attr("type") == 'teacher'){
            var endDate = new Date(date);
            var teacherId = wjQuery(elm).attr("value"); 
            var teacher = t.taList.filter(function(x){
                return x.id == teacherId;
            }); 
            var index = t.taList.map(function(x){
                    return x.id;
            }).indexOf(teacherId);
            t.taList.splice(index,1);
            if(teacher){
                elm.remove(); 
                var teacherObj = {
                    id: teacher[0].id, 
                    name: teacher[0].name,
                    start: date,
                    end: new Date(endDate.setHours(endDate.getHours() + 1)),
                    resourceId:resource.id,
                    deliveryTypeId: teacher[0].deliveryTypeId,
                    locationId: teacher[0].locationId,
                };
                t.populateTeacherEvent([teacherObj]);
            } 
        }
        else if(wjQuery(elm).attr("type") == 'studentSession'){
          var endDate = new Date(date);
          var stuId = wjQuery(elm).attr("value"); 
          var uniqStuId = wjQuery(elm).attr("id"); 
          var index = t.convertedStudentObj.map(function(x){
                  return x.id;
          }).indexOf(stuId);
          if(t.convertedStudentObj[index]){
            elm.remove(); 
            t.convertedStudentObj[index].start = date;
            t.convertedStudentObj[index].end = new Date(endDate.setHours(endDate.getHours() + 1));
            t.convertedStudentObj[index].resourceId = resource.id;
            t.convertedStudentObj[index].deliveryTypeId = t.getDeliveryTypeObj(resource.id).deliveryTypeId;
            t.convertedStudentObj[index].deliveryType = t.getDeliveryTypeObj(resource.id).deliveryType;
            t.populateStudentEvent([t.convertedStudentObj[index]]);
          } 
        }
        else if(wjQuery(elm).attr("type") == 'teacherSession'){
          var endDate = new Date(date);
          var teacherId = wjQuery(elm).attr("value"); 
          var uniqStuId = wjQuery(elm).attr("id"); 
          var index = t.convertedTeacherObj.map(function(x){
                  return x.id;
          }).indexOf(teacherId);
          if(t.convertedTeacherObj[index]){
            elm.remove(); 
            t.convertedTeacherObj[index].start = date;
            t.convertedTeacherObj[index].end = new Date(endDate.setHours(endDate.getHours() + 1));
            t.convertedTeacherObj[index].resourceId = resource.id;
            t.convertedTeacherObj[index].deliveryTypeId = t.getDeliveryTypeObj(resource.id).deliveryTypeId;
            t.convertedTeacherObj[index].deliveryType = t.getDeliveryTypeObj(resource.id).deliveryType;
            t.populateTeacherEvent([t.convertedTeacherObj[index]]);
          } 
        }
    };

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
            slotMinutes : 30,
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
            eventResize: function(event, dayDelta, minuteDelta) {
                console.log("@@ resize event " + event.title + ", start " + event.start + ", end " + event.end + ", resource " + event.resourceId);
            },
            eventDrop: function( event, dayDelta, minuteDelta, allDay) {
                console.log("@@ drag/drop event " + event.title + ", start " + event.start + ", end " + event.end + ", resource " + event.resourceId);
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
      self.teacherSchedule = isFetch || (self.teacherSchedule.length == 0) ? data.getTeacherSchedule(locationId,startDate,endDate) : self.teacherSchedule;
      self.teacherAvailability = isFetch || (self.teacherAvailability.length == 0) ? data.getTeacherAvailability(locationId,startDate,endDate) : self.teacherAvailability;
      self.populateTeacherEvent(self.generateEventObject(self.teacherSchedule== null ? [] : self.teacherSchedule, "teacherSchedule"), true);
      self.populateTAPane(self.teacherAvailability == null ? []:self.teacherAvailability); 
      if(!studentDataSource){  
        self.students = isFetch || (self.students.length == 0) ? data.getStudentSession(locationId,startDate,endDate) : self.students;
        self.populateStudentEvent(self.generateEventObject(self.students == null ? [] : self.students, "studentSession"), true);
        self.filterObject.student = self.students == null ? [] : self.students;
        self.generateFilterObject(self.filterObject);
      }
      else{
        self.students = data.getStudentMasterSchedule(locationId,startDate,endDate);
        self.pinnedData = data.getPinnedData(locationId,startDate,endDate);
        self.populateStudentEvent(self.generateEventObject(self.students == null ? [] : self.students, "masterStudentSession"), true);
        self.filterObject.student = self.students == null ? [] : self.students;
        self.generateFilterObject(self.filterObject);
      }
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
        wjQuery('.sof-pane').on('mousewheel DOMMouseScroll touchmove', function(e) {
            e.preventDefault();
        }, false);
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
        wjQuery('.ta-pane').on('mousewheel DOMMouseScroll touchmove', function(e) {
            e.preventDefault();
        }, false);
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
                    wjQuery.each(val, function(name, id){
                        self.filters[key].push( {id: id, name: name, radio: false});
                    });
                }else if(key == "student"){
                    self.filters[key].push({
                        id: val._hub_student_value, 
                        name: val['_hub_student_value@OData.Community.Display.V1.FormattedValue'], 
                        startTime: val['hub_session_date@OData.Community.Display.V1.FormattedValue'] +" "+ val['hub_start_time@OData.Community.Display.V1.FormattedValue'],
                        endTime: val['hub_session_date@OData.Community.Display.V1.FormattedValue'] +" "+ val['hub_end_time@OData.Community.Display.V1.FormattedValue'],
                        sessionDate:val['hub_session_date@OData.Community.Display.V1.FormattedValue'],
                        resourceId:val['_hub_resourceid_value'],
                        centerId:val['_hub_center_value'],
                        radio: false
                    });
                }
            });
        });
    }

    this.generateEventObject = function(args, label){
        var self = this;
        var eventObjList = [];
        if (label == "teacherSchedule") {
            wjQuery.each(args, function(ke, val) {
                var sDate = new Date(val['hub_start_date@OData.Community.Display.V1.FormattedValue'] +" "+ val['hub_start_time@OData.Community.Display.V1.FormattedValue']);
                var eDate = new Date(val['hub_end_date@OData.Community.Display.V1.FormattedValue'] +" "+ val['hub_end_time@OData.Community.Display.V1.FormattedValue']);
                eventObjList.push({
                    id: val['_hub_staff_value'], 
                    name: val["_hub_staff_value@OData.Community.Display.V1.FormattedValue"],
                    start: sDate,
                    end: eDate,
                    resourceId:val['_hub_resourceid_value'],
                    deliveryTypeId: val['aproductservice_x002e_hub_deliverytype'],
                    deliveryType: val['aproductservice_x002e_hub_deliverytype@OData.Community.Display.V1.FormattedValue'],
                    locationId: val['aa_x002e_hub_center'],
                    locationName: val['aa_x002e_hub_center@OData.Community.Display.V1.FormattedValue'],
                    subjectId: val['subjectId']
                });
            });
            self.convertedTeacherObj = eventObjList;
        }else if(label == "studentSession"){
            wjQuery.each(args, function(ke, val) {
                var sDate = new Date(val['hub_session_date@OData.Community.Display.V1.FormattedValue'] +" "+ val['hub_start_time@OData.Community.Display.V1.FormattedValue']);
                var eDate = new Date(val['hub_session_date@OData.Community.Display.V1.FormattedValue'] +" "+ val['hub_end_time@OData.Community.Display.V1.FormattedValue']);
                var obj = {
                    id: val._hub_student_value, 
                    name: val["_hub_student_value@OData.Community.Display.V1.FormattedValue"],
                    start: sDate,
                    end: eDate,
                    gradeId:val['astudent_x002e_hub_grade'],
                    grade: val['astudent_x002e_hub_grade@OData.Community.Display.V1.FormattedValue'],
                    deliveryTypeId: val['aproductservice_x002e_hub_deliverytype'],
                    deliveryType: val['aproductservice_x002e_hub_deliverytype@OData.Community.Display.V1.FormattedValue'],
                    locationId: val['_hub_center_value'],
                    locationName: val['_hub_center_value@OData.Community.Display.V1.FormattedValue']
                }
                if (val.hasOwnProperty('_hub_resourceid_value')) {
                    obj.resourceId = val['_hub_resourceid_value']; 
                    eventObjList.push(obj);
                }else{
                    self.sofList.push(obj);  
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
            var obj = {
                id: val['aenrollment_x002e_hub_student'], 
                name: val["aenrollment_x002e_hub_student@OData.Community.Display.V1.FormattedValue"],
                start: sDate,
                end: eDate,
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
                self.sofList.push(obj);  
            }
          });
          setTimeout(function(){
              if(self.sofList.length){
                  self.populateSOFPane(self.sofList,self.calendarOptions.minTime,self.calendarOptions.maxTime);
              }
          },800);
          self.convertedStudentObj = eventObjList;
        }
        return eventObjList;
    }

    this.populateTeacherEvent = function(teacherObject, isFromFilter=false){
        var self = this;
        if (teacherObject.length) {
          wjQuery.each(teacherObject, function(key, value) {
            id = value['id'];
            name = value['name'];
            event = self.calendar.fullCalendar('clientEvents', value['resourceId']+value['start']);
            if(event.length == 1){
              wjQuery.each(event, function(k, v){
                if(event[k].hasOwnProperty("teachers")){
                  index = event[k].teachers.map(function(x){
                      return x.id;
                  }).indexOf(id);
                  if(index == -1){
                    event[k].isConflict = true;
                    event[k].title += "<span class='draggable' id='"+id+value['resourceId']+"' type='teacherSession' value='"+id+"'><b>"+name+"</b></span>";
                    event[k].teachers.push({id:id, name:name});
                  }
                }else{
                  var studentList = event[k].name;
                  event[k].title = "<span class='draggable' id='"+id+value['resourceId']+"' type='teacherSession' value='"+id+"'><b>"+name+"</b></span>";
                  event[k].teachers = [{id:id, name:name}];
                  wjQuery.each(studentList, function(ke, val){
                    event[k].title += "<span class='draggable' id='"+val.id+value['resourceId']+"' type='studentSession' value='"+val.id+"'>"+val.name+", "+val.grade+"</span>";
                  });
                }
              });
              self.calendar.fullCalendar('updateEvent', event);
            }else{
              var obj = {
                  id: value['resourceId']+value['start'],
                  title:"<span class='draggable' id='"+id+value['resourceId']+"' type='teacherSession' value='"+id+"'><b>"+name+"</b></span>",
                  teachers:[{id:id, name:name}],
                  start:value['start'],
                  end:value['end'],
                  allDay: false,
                  resourceId: value['resourceId'],
                  isTeacher: true,
                  isConflict: false,
                  textColor:"#333333",
              }
              if(value.deliveryType == "Group Facilitation"){
                  obj.backgroundColor = "#dff0d5";
                  obj.borderColor = "#7bc143";
              }else if(value.deliveryType== "Group Instruction"){
                  obj.backgroundColor = "#fedeb7";
                  obj.borderColor = "#f88e50";
              }else if(value.deliveryType== "Personal Instruction"){ 
                  obj.backgroundColor = "#ebf5fb";
                  obj.borderColor = "#9acaea";
              }
              self.eventList.push(obj);
              if(isFromFilter){
                self.calendar.fullCalendar('removeEvents');
                self.calendar.fullCalendar('addEventSource', {events:self.eventList});
              }
              self.calendar.fullCalendar('refetchEvents');
            }
            self.draggable('draggable');
          });
        }
    }

    this.populateStudentEvent = function(studentList, isFromFilter=false){
        var self = this;
        if (studentList.length) {
            wjQuery.each(studentList, function(key, value) {
                id = value['id'];
                name = value['name'];
                grade = value['grade'];
                event = self.calendar.fullCalendar('clientEvents', value['resourceId']+value['start']);
                if(event.length){
                    wjQuery.each(event, function(k, v){
                      if(event[k].hasOwnProperty("name")){
                        index = event[k].name.map(function(x){
                             return x.id;
                        }).indexOf(id);
                        if(index == -1){
                          event[k].title += "<span class='draggable' id='"+id+value['resourceId']+"' type='studentSession' value='"+id+"'>"+name+", "+grade+"</span>";
                          event[k].name.push({id:id, name:name, grade:grade});
                        }
                      }else{
                        event[k].title += "<span class='draggable' id='"+id+value['resourceId']+"' type='studentSession' value='"+id+"'>"+name+", "+grade+"</span>";
                        event[k].name = [{id:id, name:name, grade:grade}];
                      }
                    });
                    self.calendar.fullCalendar('updateEvent', event);
                }else{
                    var obj = {
                        id: value['resourceId']+value['start'],
                        title:"<span class='draggable' id='"+id+value['resourceId']+"' type='studentSession' value='"+id+"'>"+name+", "+grade+"</span>",
                        name:[{id:id, name:name, grade:grade}],
                        start:value['start'],
                        end:value['end'],
                        allDay: false,
                        resourceId: value['resourceId'],
                        isTeacher: false,
                        isConflict: false,
                        textColor:"#333333",
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
                    if(isFromFilter){
                      self.calendar.fullCalendar('removeEvents');
                      self.calendar.fullCalendar('addEventSource', {events:self.eventList});
                    }
                    self.calendar.fullCalendar('refetchEvents');
                }
                self.draggable('draggable');
            });
        }
    }

    this.filterItems = function(obj, filterTerm){
        return obj.filter(function(el){
            if(el.id == filterTerm || el.gradeId == filterTerm ){
                return el;
            }
        });
    }

    this.draggable = function(selector){
      wjQuery('.'+selector).draggable({
        revert: true,      
        revertDuration: 0,
        appendTo: 'body',
        containment: 'window',
        helper: 'clone'
      });
    }

    this.getDeliveryTypeObj = function(resourceId){
      var deliveryTypeObj = {}; 
      wjQuery.each(this.resourceList, function(k, v){
          if (resourceId == v.id) {
            deliveryTypeObj = v;
          }
      });
      return deliveryTypeObj;
    }
}


