
var data = new Data();
var DEFAULT_START_TIME = "8:00 AM";
var DEFAULT_END_TIME = "9:00 AM";
var deliveryType = data.getDeliveryType();
var currentCalendarDate = moment(new Date()).format("YYYY-MM-DD");
setTimeout(function(){
  var deliveryTypeList = [];
    var sylvanCalendar = new SylvanCalendar();
    sylvanCalendar.init("widget-calendar");
    var locationId = sylvanCalendar.populateLocation(data.getLocation());
    wjQuery('.headerDate').text(moment(currentCalendarDate).format('MM/DD/YYYY'));
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
          wjQuery('#datepicker').datepicker('destroy');
          wjQuery('#datepicker').datepicker({
            buttonImage: "/webresources/hub_/calendar/images/calendar.png",
            buttonImageOnly: true,
            changeMonth: true,
            changeYear: true,
            showOn: 'button',
            onSelect: function(date) {
              wjQuery(".loading").show();
              sylvanCalendar.dateFromCalendar(date,locationId);
              wjQuery('#datepicker').hide();
            }
          });
          return fetchResources(locationId,deliveryTypeList,true);
        }
    });
    var resources = [];
    function fetchResources(locationId,selectedDeliveryType,fetchData){
      wjQuery(".loading").show();
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
      sylvanCalendar.populateResource(resourceList,fetchData);
      if(resourceList.length){
        sylvanCalendar.refreshCalendarEvent(locationId,currentCalendarDate,currentCalendarDate,false,false);
        $( window ).resize(function() {
          // location.reload();
          wjQuery(".loading").show();
          sylvanCalendar.populateResource(resourceList,fetchData);
          sylvanCalendar.refreshCalendarEvent(locationId,currentCalendarDate,currentCalendarDate,false,false);
        });  
        wjQuery('.prevBtn').off('click').on('click',function(){
          wjQuery(".loading").show();
          sylvanCalendar.prev(locationId);
        });

        wjQuery('#datepicker').datepicker({
            buttonImage: "/webresources/hub_/calendar/images/calendar.png",
            buttonImageOnly: true,
            changeMonth: true,
            changeYear: true,
            showOn: 'button',
            onSelect: function(date) {
              wjQuery(".loading").show();
              sylvanCalendar.dateFromCalendar(date,locationId);
              wjQuery('#datepicker').hide();
            }
          });
       
        wjQuery('.nextBtn').off('click').on('click',function(){
          wjQuery(".loading").show();
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
        wjQuery(".icon-refresh").click(function(event) {
          fetchResources(locationId,deliveryTypeList,false);
        });
       
      }else{
        wjQuery(".loading").hide();
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
    this.sofList['Personal Instruction'] = [];
    this.sofList['Group Instruction'] = [];
    this.sofList['Group Facilitation'] = [];
    this.taList = [];
    // 1. Teacher conflict
    // 2. Capacity Conflict
    // 3. OneToOne Conflict
    // 4. Do not sit with stydent
    this.conflictMsg = ["Multiple teachers are placed", "Capacity has reached max", "OneToOne Conflict"];
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
    this.businessClosure = [];
    this.staffExceptions = [];
    this.enrollmentPriceList = [];
    this.masterScheduleStudents = [];
    this.init = function(element){
    }

    //Student pane and TA pane Functionality
    var sofExpanded = false;
    var taExpanded = false;
    this.loadMasterInformation = function(){
        var self = this;
        sofExpanded = false;
        taExpanded = false;
        var checkedList = [];
        var currentCalendarDate = this.calendar.fullCalendar('getDate');
        wjQuery('.headerDate').text(moment(currentCalendarDate).format('MM/DD/YYYY'));
        if(moment(currentCalendarDate).format('MM/DD/YYYY') == moment(new Date()).format('MM/DD/YYYY')){
          wjQuery('.headerDate').addClass('today');
        }
        else{
          wjQuery('.headerDate').removeClass('today');
        }
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

                wjQuery(".filterCheckBox").click(function() {
                  wjQuery(".loading").show();
                   if(wjQuery(this).is(':checked')){
                        self.eventList = [];
                        self.calendar.fullCalendar( 'removeEvents');
                        var index = checkedList.map(function(y){
                          return y;
                        }).indexOf(wjQuery(this).val());
                        if(index == -1){
                          checkedList.push(wjQuery(this).val()); 
                        }
                        self.calendar.fullCalendar('refetchEvents');
                     }else{
                        self.eventList = [];
                        self.calendar.fullCalendar( 'removeEvents');
                        var index = checkedList.map(function(y){
                          return y;
                        }).indexOf(wjQuery(this).val());
                        if(index != -1){
                          checkedList.splice(checkedList.indexOf(wjQuery(this).val()), 1);
                        }
                        self.calendar.fullCalendar('refetchEvents');
                    }
                    
                    if(checkedList.length == 0){
                        self.populateStudentEvent(self.convertedStudentObj, true);
                        self.populateSOFPane(self.sofList, self.calendarOptions.minTime, self.calendarOptions.maxTime);
                        self.populateTeacherEvent(self.convertedTeacherObj, true);
                        self.populateTAPane(self.taList);
                    }else{
                      var newArray = [];
                      var sofNewArray = [];
                      sofNewArray['Personal Instruction'] = [];
                      sofNewArray['Group Instruction'] = [];
                      sofNewArray['Group Facilitation'] = [];
                      var taNewArray = [];
                      wjQuery.each(checkedList, function(k, v){
                          newArray = wjQuery.merge(self.filterItems(self.convertedStudentObj, v, "default"), newArray);
                          taNewArray = wjQuery.merge(self.filterItems(self.taList, v, "tapane"), taNewArray);
                          piResponse = self.filterItems(self.sofList['Personal Instruction'], v ,"sofpane");
                          giResponse = self.filterItems(self.sofList['Group Instruction'], v ,"sofpane");
                          gfResponse = self.filterItems(self.sofList['Group Facilitation'], v ,"sofpane");
                          
                          var piIndex = sofNewArray['Personal Instruction'].map(function(x){
                            return x;
                          }).indexOf(v);
                          if(piIndex == -1){
                            sofNewArray['Personal Instruction'] = wjQuery.merge(piResponse, sofNewArray['Personal Instruction']);
                          }

                          var giIndex = sofNewArray['Group Instruction'].map(function(y){
                            return y;
                          }).indexOf(v);
                          if(giIndex == -1){
                            sofNewArray['Group Instruction'] = wjQuery.merge(giResponse, sofNewArray['Group Instruction']);
                          }

                          var gfIndex = sofNewArray['Group Facilitation'].map(function(z){
                            return z;
                          }).indexOf(v);
                          if(gfIndex == -1){
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
        wjQuery('.sof-pane').css('height',wjQuery('#calendar').height() - 10 +"px"); 
        wjQuery('.ta-pane').css('height',wjQuery('#calendar').height() - 10 +"px"); 
        wjQuery('.sof-pane').css('overflow','hidden'); 
        wjQuery('.ta-pane').css('overflow','hidden');
        wjQuery('.ta-pane').hide();
        wjQuery('.sof-pane').hide();
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

    this.populateResource = function(args,isFetch){
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
      this.businessClosure = [];
      this.staffExceptions = [];
      this.enrollmentPriceList = [];
      this.masterScheduleStudents = [];
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

    this.populateSOFPane = function(sofList,minTime,maxTime){
        var sofTemplate = [];
        wjQuery('.student-overflow').html("");
        for(var i=0;i<(maxTime - minTime);i++){
            var elm = '<div class="student-overflow" id="student_block_'+i+'" style="height:'+ wjQuery(".fc-agenda-slots td div").height() +'px;overflow:auto"></div>';
            wjQuery('.sof-pane').append(elm);;
        }
        for(var j=0; j<Object.keys(sofList).length; j++){  
          if(Object.keys(sofList)[j] == 'Personal Instruction'){
            for(var i=0;i<sofList[Object.keys(sofList)[j]].length;i++){
              var studentStartHour = sofList[Object.keys(sofList)[j]][i].start.getHours();
              if(studentStartHour >= minTime && studentStartHour <= maxTime){
                var studentPosition = studentStartHour - minTime;
                var elm = '<div class="student-container cursor padding-lr-xxs" type="student" value="'+sofList[Object.keys(sofList)[j]][i].id+'">'+sofList[Object.keys(sofList)[j]][i].name+',<span>'+sofList[Object.keys(sofList)[j]][i].grade+'</span></div>';
                var deliveryTypeIndex = this.selectedDeliveryType.map(function(y){
                  return y;
                }).indexOf(sofList[Object.keys(sofList)[j]][i].deliveryTypeId);
                if(deliveryTypeIndex != -1){
                  if(wjQuery('#student_block_'+studentPosition +' .sof-pi').length == 0){
                    wjQuery('#student_block_'+studentPosition).append('<div class="sof-pi"></div>');
                  }
                  wjQuery('#student_block_'+studentPosition +' .sof-pi').append(elm);
                }
              }
            }
          }else if(Object.keys(sofList)[j] == 'Group Instruction'){
            // GI Student will not come in sof list
            for(var i=0;i<sofList[Object.keys(sofList)[j]].length;i++){
              var studentStartHour = sofList[Object.keys(sofList)[j]][i].start.getHours();
              if(studentStartHour >= minTime && studentStartHour <= maxTime){
                var studentPosition = studentStartHour - minTime;
                var elm = '<div class="student-container cursor padding-lr-xxs" type="student" value="'+sofList[Object.keys(sofList)[j]][i].id+'">'+sofList[Object.keys(sofList)[j]][i].name+',<span>'+sofList[Object.keys(sofList)[j]][i].grade+'</span></div>';
                var deliveryTypeIndex = this.selectedDeliveryType.map(function(y){
                  return y;
                }).indexOf(sofList[Object.keys(sofList)[j]][i].deliveryTypeId);
                if(deliveryTypeIndex != -1){
                  if(wjQuery('#student_block_'+studentPosition +' .sof-gi').length == 0){
                    wjQuery('#student_block_'+studentPosition).append('<div class="sof-gi"></div>');
                  }
                  wjQuery('#student_block_'+studentPosition +' .sof-gi').append(elm);
                }
              }
            }
          }else if(Object.keys(sofList)[j] == 'Group Facilitation'){
            for(var i=0;i<sofList[Object.keys(sofList)[j]].length;i++){
              var studentStartHour = sofList[Object.keys(sofList)[j]][i].start.getHours();
              if(studentStartHour >= minTime && studentStartHour <= maxTime){
                var studentPosition = studentStartHour - minTime;
                var elm = '<div class="student-container cursor padding-lr-xxs" type="student" value="'+sofList[Object.keys(sofList)[j]][i].id+'">'+sofList[Object.keys(sofList)[j]][i].name+',<span>'+sofList[Object.keys(sofList)[j]][i].grade+'</span></div>';
                var deliveryTypeIndex = this.selectedDeliveryType.map(function(y){
                  return y;
                }).indexOf(sofList[Object.keys(sofList)[j]][i].deliveryTypeId);
                if(deliveryTypeIndex != -1){
                  if(wjQuery('#student_block_'+studentPosition +' .sof-gf').length == 0){
                    wjQuery('#student_block_'+studentPosition).append('<div class="sof-gf"></div>');
                  }
                  wjQuery('#student_block_'+studentPosition +' .sof-gf').append(elm);
                }
              }
            }
          }
          if(this.selectedDeliveryType.length == 1){
            wjQuery(".sof-pi").css("width", "calc(100% - 10px)");
          }else if(this.selectedDeliveryType.length == 2){
              wjQuery(".sof-gf").css("width", "calc(100% - 10px)");
          }else{
            if(this.sofList['Personal Instruction'].length == 0){
              wjQuery(".sof-gf").css("width", "calc(100% - 10px)");
            }else{
              wjQuery(".sof-gf").css("width", "calc(50% - 10px)");
              wjQuery(".sof-pi").css("width", "calc(50% - 10px)");
            }
          }
          this.draggable('student-container');
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
        var currentCalendarDate = this.calendar.fullCalendar('getDate');
        for(var i=0;i<teacherData.length;i++){
          var teacherStartHour = teacherData[i].startHour;
          var teacherStart = new Date(moment(currentCalendarDate).format('YYYY-MM-DD')+' '+teacherStartHour+":00");
          var addTeacherToTA = true;
          for (var  l = 0; l < this.resourceList.length; l++) {
            var event = this.calendar.fullCalendar('clientEvents' ,this.resourceList[l].id+teacherStart);
            if(event.length != 0){
              for (var j = 0; j < event.length; j++) {
                if(event[j].hasOwnProperty('teachers') && event[j].teachers.length != 0){
                  for (var k = 0; k < event[j].teachers.length; k++) {
                    if(event[j].teachers[k].id == teacherData[i].id){
                      addTeacherToTA = false;
                      break;
                    }
                  }
                }
                if(!addTeacherToTA){
                  break;
                }
              }
            }
            if(!addTeacherToTA){
              break;
            }
          }
          if(addTeacherToTA){
            if(teacherStartHour >= this.calendarOptions.minTime && teacherStartHour <= this.calendarOptions.maxTime){
              var teacherPosition = teacherStartHour - this.calendarOptions.minTime;
              var elm ='<div class="teacher-block"> <div class="teacher-container" type="teacher" value="'+teacherData[i].id+'">'+
                            '<div class="display-inline-block padding-right-xs">'+ teacherData[i].name+'</div>';
              var staffPrograms = this.getProgramObj(teacherData[i].id);       
              if(staffPrograms.length != 0){
                for (var a = 0; a < staffPrograms.length; a++) {
                  elm+='<div class="subject-identifier" style="background:'+staffPrograms[a].color+'"></div>';
                }
              }              
              elm+='</div></div>';
              wjQuery('#teacher_block_'+teacherPosition).append(elm);
              this.draggable('teacher-container');
            }
          }
        }  
    }

    /*
     * Method accepts from where student comes and student
     */
    this.saveSOFtoSession = function(student){
      if(student[0] != undefined){
        var h = new Date(student[0].startHour).getHours();
        if(h > 12){
          h -= 12;
        }
        var objStudent = this.convertedStudentObj.filter(function(x){
          return x.id == student[0].id &&
                 x.resourceId == student[0].resourceId &&
                 moment(x.startHour).format('h') == h;
        });

        var objSession = {};
            objSession['hub_center@odata.bind'] = student[0].locationId;
            objSession['hub_resourceid@odata.bind'] = student[0].resourceId;
            objSession.hub_session_date = moment(student[0].start).format("YYYY-MM-DD");
            objSession.hub_start_time = this.convertToMinutes(moment(student[0].start).format("h:mm A"));
            objSession.hub_end_time = this.convertToMinutes(moment(student[0].end).format("h:mm A"));
        
        if(objStudent[0] != undefined){
          var objNewSession = {};
          objNewSession['hub_studentsessionid'] = objStudent[0]['sessionId'];
          objNewSession['hub_center@odata.bind'] = objStudent[0]["locationId"];
          objNewSession['hub_enrollment@odata.bind'] = objStudent[0]['enrollmentId'];
          objNewSession['hub_student@odata.bind'] = objStudent[0]['id'];
          objNewSession['hub_resourceid@odata.bind'] = student[0].resourceId;
          objNewSession['hub_service@odata.bind'] = objStudent[0]['serviceId'];
          objNewSession['hub_session_date'] = moment(student[0].start).format("YYYY-MM-DD");
          objNewSession['hub_start_time'] = this.convertToMinutes(moment(objStudent[0]['start']).format("h:mm A"));
          objNewSession['hub_end_time'] = this.convertToMinutes(moment(objStudent[0]['end']).format("h:mm A"));
          objNewSession['hub_is_1to1'] = objStudent[0]['is1to1'];
          objNewSession['hub_deliverytype'] = student[0].deliveryTypeId;
          objNewSession['hub_deliverytype@OData.Community.Display.V1.FormattedValue'] = student[0].deliveryType;
          
          data.saveSOFtoSession(objNewSession,objSession);
        }
      }
    };
    
    this.saveTAtoSession = function(teacher){
      if(teacher != undefined){
        var objStaff = {};
            objStaff['hub_staff@odata.bind'] = teacher.id;
            objStaff['hub_center@odata.bind'] = teacher.locationId;
        var objNewSession = {};
            objNewSession.hub_deliverytype = teacher.deliveryTypeId;
            objNewSession['hub_resourceid@odata.bind'] = teacher.resourceId;
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
        var prevStudObj = {};
        var index = t.sofList['Personal Instruction'].map(function(x){
          return x.id;
        }).indexOf(stuId);
        prevStudObj = t.sofList['Personal Instruction'][index];
        if(prevStudObj == undefined){
          var index = t.sofList['Group Facilitation'].map(function(x){
            return x.id;
          }).indexOf(stuId);
          prevStudObj = t.sofList['Group Facilitation'][index];
          if(prevStudObj == undefined){
            var index = t.sofList['Group Instruction'].map(function(x){
                    return x.id;
            }).indexOf(stuId);
            prevStudObj = t.sofList['Group Instruction'][index];
          }
        }

        if(prevStudObj['deliveryType'] == resource.deliveryType ){
          if(newEvent.length == 0){
            t.studentSofConflictCheck(t,date, allDay,ev,ui,resource,elm);
          }else if(newEvent.length == 1){
            if(newEvent[0]['students'] == undefined){
              t.studentSofConflictCheck(t,date, allDay,ev,ui,resource,elm);
            }else{
              //  Validation for oneToOne check
              if(newEvent[0]['is1to1']){
                // OneToOne Conflict
                var msgIndex = newEvent[0].conflictMsg.map(function(x){
                  return x;
                }).indexOf(2);
                if(msgIndex == -1) {
                  newEvent[0].conflictMsg.push(2);
                  self.updateConflictMsg(newEvent[0]);
                }
                t.studentSofCnfmPopup(t,date, allDay,ev,ui,resource,elm, "Session is 'OneToOne' Type. Do you wish to continue?");
              }else{
                if(!(newEvent[0].hasOwnProperty('students')) || newEvent[0].hasOwnProperty('students') && (newEvent[0]['students'].length < resource.capacity || resource.capacity == undefined)){
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
                  return x.id;
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
        var uniqueId = wjQuery(elm).attr('uniqueId');
        var startTime = uniqueId.split('_')[2];
        var index = t.convertedStudentObj.findIndex(function(x){
         return x.id == stuId && 
                 x.resourceId == uniqueId.split('_')[1] &&
                 moment(x.startHour).format("h:mm A") == moment(startTime).format("h:mm A");
        });
        // var index = t.convertedStudentObj.map(function(x){
        //         return x.id;
        // }).indexOf(stuId);
        var prevStudObj = t.convertedStudentObj[index];
        if(newResourceObj.deliveryType != "Group Instruction"){
          if(newEvent.length == 0){
            if(wjQuery(elm).attr("pinnedId")){
              t.studentSessionCnfmPopup(t,date, allDay,ev,ui,resource,elm, "This student will be temporarily un pinned. Do you wish to continue?");
            }else{
              if(newResourceObj.deliveryType == prevStudObj.deliveryType){
                t.studentSessionConflictCheck(t,date, allDay,ev,ui,resource,elm);
              }else{
                t.studentSessionCnfmPopup(t,date, allDay,ev,ui,resource,elm, "DeliveryType is different. Do you wish to continue?");
              }
            }
          }
          else if(newEvent.length == 1){
            if(newEvent[0]['students'] == undefined){
              if(wjQuery(elm).attr("pinnedId")){
                t.studentSessionCnfmPopup(t,date, allDay,ev,ui,resource,elm, "This student will be temporarily un pinned. Do you wish to continue?");
              }else{
                if(newResourceObj.deliveryType == prevStudObj.deliveryType){
                  t.studentSessionConflictCheck(t,date, allDay,ev,ui,resource,elm);
                }else{
                  t.studentSessionCnfmPopup(t,date, allDay,ev,ui,resource,elm, "DeliveryType is different. Do you wish to continue?");
                }
              }
            }else{
              var studentIndex = newEvent[0]['students'].map(function(x){
                return x.id;
              }).indexOf(stuId);
              if(studentIndex == -1){
                if(wjQuery(elm).attr("pinnedId")){
                  t.studentSessionCnfmPopup(t,date, allDay,ev,ui,resource,elm, "This student will be temporarily un pinned. Do you wish to continue?");
                }else{
                  if(newResourceObj.deliveryType == prevStudObj.deliveryType){
                    if(newResourceObj.deliveryType == "Personal Instruction"){
                      //  Validation for oneToOne check
                      //* if oneToOne then show popup
                      if(newEvent[0]['is1to1']){
                        // OneToOne Conflict
                        var msgIndex = newEvent[0].conflictMsg.map(function(x){
                          return x;
                        }).indexOf(2);
                        if (msgIndex == -1) {
                          newEvent[0].conflictMsg.push(2);
                          self.updateConflictMsg(newEvent[0]);
                        }
                        t.studentSessionCnfmPopup(t,date, allDay,ev,ui,resource,elm, "Session is 'OneToOne' Type. Do you wish to continue?");
                      }else{
                        if(!(newEvent[0].hasOwnProperty('students')) || newEvent[0].hasOwnProperty('students') && (newEvent[0]['students'].length < resource.capacity || resource.capacity == undefined)){
                            t.studentSessionConflictCheck(t,date, allDay,ev,ui,resource,elm);
                        }else if(newEvent[0].hasOwnProperty('students') && (newEvent[0]['students'].length >= resource.capacity || resource.capacity == undefined)){
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
                    if(newResourceObj.deliveryType == "Personal Instruction"){
                      //  Validation for oneToOne check
                      //* if oneToOne then show popup
                      if(newEvent[0]['is1to1']){
                        // OneToOne Conflict
                        var msgIndex = newEvent[0].conflictMsg.map(function(x){
                          return x;
                        }).indexOf(2);
                        if (msgIndex == -1) {
                          newEvent[0].conflictMsg.push(2);
                          self.updateConflictMsg(newEvent[0]);
                        }
                        t.studentSessionCnfmPopup(t,date, allDay,ev,ui,resource,elm, "DeliveryType is different and Session is 'OneToOne' Type. Do you wish to continue?");
                      }else{
                        if(!(newEvent[0].hasOwnProperty('students')) || newEvent[0].hasOwnProperty('students') && (newEvent[0]['students'].length < resource.capacity || resource.capacity == undefined)){
                            t.studentSessionCnfmPopup(t,date, allDay,ev,ui,resource,elm, "DeliveryType is different. Do you wish to continue?");
                        }else if(newEvent[0].hasOwnProperty('students') && (newEvent[0]['students'].length >= resource.capacity || resource.capacity == undefined)){
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
        }else{
          t.prompt("Can not be placed to a GI session.");
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
                    return x.id;
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

            // Teacher conflict removal               
            if(prevEvent[0].teachers.length == 2){
              var msgIndex = prevEvent[0].conflictMsg.map(function(x){
                return x;
              }).indexOf(0);
              if (msgIndex > -1) {
                  prevEvent[0].conflictMsg.splice(msgIndex, 1);
              }
              self.updateConflictMsg(prevEvent[0]);
              if(!prevEvent[0].title.includes('<span class="student-placeholder">Student name</span>')){
                prevEvent[0].title += '<span class="student-placeholder">Student name</span>'; 
                self.addContext("",'studentPlaceholder',true, "");
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
      var student = [];
      var index = t.sofList['Personal Instruction'].map(function(x){
        return x.id;
      }).indexOf(stuId);
      if(index != -1){
        student.push(t.sofList['Personal Instruction'][index]);
        t.sofList['Personal Instruction'].splice(index,1);
      }
      if(student[0] == undefined){
        student = [];
        index = t.sofList['Group Facilitation'].map(function(x){
          return x.id;
        }).indexOf(stuId);
        if(index != -1){
          student.push(t.sofList['Group Facilitation'][index]);
          t.sofList['Group Facilitation'].splice(index,1);
        }
        if(student[0] == undefined){
          student = [];
          index = t.sofList['Group Instruction'].map(function(x){
            return x.id;
          }).indexOf(stuId);
          if(index != -1){
            student.push(t.sofList['Group Instruction'][index]);
            t.sofList['Group Instruction'].splice(index,1);
          }
        }
      }      
      if(student){
          elm.remove();
          if(wjQuery(parentElement).html() == ''){
            parentElement.remove();
          }
          student[0].start = date;
          student[0].startHour = startHour;
          student[0].end = new Date(endDate.setHours(endDate.getHours() + 1));
          student[0].resourceId = resource.id;
          // student[0].deliveryType = t.getResourceObj(resource.id)['deliveryType'];
          // student[0].deliveryTypeId = t.getResourceObj(resource.id)['deliveryTypeId'];
          this.convertedStudentObj.push(student[0]);
          this.saveSOFtoSession(student);
          t.populateStudentEvent(student,true);
      }          
    }

    this.studentSessionConflictCheck = function(t,date, allDay,ev,ui,resource,elm){
      var endDate = new Date(date);
      var startHour = new Date(date).setMinutes(0);
      var startHour = new Date(new Date(startHour).setSeconds(0));
      var stuId = wjQuery(elm).attr("value"); 
      var uniqStuId = wjQuery(elm).attr("id"); 
      var prevEventId = wjQuery(elm).attr("eventid");
      var prevEvent = this.calendar.fullCalendar('clientEvents', prevEventId);
      var uniqueId = wjQuery(elm).attr('uniqueId');
      var startTime = uniqueId.split('_')[2];
      
      var index = t.convertedStudentObj.findIndex(function(x){
       return x.id == stuId && 
               x.resourceId == uniqueId.split('_')[1] &&
               moment(x.startHour).format("h:mm A") == moment(startTime).format("h:mm A");
      });

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

          var resourceObj = t.getResourceObj(prevEvent[0]["resourceId"]);

          // oneToOne conflict removal prevevent student Darg
          if(prevEvent[0]['is1to1']){
            if(prevEvent[0]['students'].length == 1){
              var msgIndex = prevEvent[0].conflictMsg.map(function(x){
                return x;
              }).indexOf(2);
              if (msgIndex > -1) {
                  prevEvent[0].conflictMsg.splice(msgIndex, 1);
              }
              t.updateConflictMsg(prevEvent[0]);
            }
          }
          // Conflict removal
          // Capacity conflict removal prevevent student Darg
          if(resourceObj['capacity'] >= prevEvent[0]['students'].length){
            var msgIndex = prevEvent[0].conflictMsg.map(function(x){
              return x;
            }).indexOf(1);
            if (msgIndex > -1) {
                prevEvent[0].conflictMsg.splice(msgIndex, 1);
            }
            t.updateConflictMsg(prevEvent[0]);
          }

          if(resourceObj['capacity'] > prevEvent[0]['students'].length){
            if(!prevEvent[0].title.includes('<span class="student-placeholder">Student name</span>')){
              prevEvent[0].title += '<span class="student-placeholder">Student name</span>';
              self.addContext("",'studentPlaceholder',true, "");
            }
          }
        }
        if(t.convertedStudentObj[index]){
          var prevSessionObj = wjQuery.extend(true, {}, t.convertedStudentObj[index]);
          elm.remove(); 
          t.convertedStudentObj[index].start = date;
          t.convertedStudentObj[index].startHour = startHour;
          t.convertedStudentObj[index].end = new Date(endDate.setHours(endDate.getHours() + 1));
          t.convertedStudentObj[index].resourceId = resource.id;
          if(wjQuery(elm).attr("tempPinId")){
            t.convertedStudentObj[index].tempPinId = wjQuery(elm).attr("tempPinId");
            delete t.convertedStudentObj[index].pinId;
          }
          // t.convertedStudentObj[index].deliveryTypeId = t.getResourceObj(resource.id).deliveryTypeId;
          // t.convertedStudentObj[index].deliveryType = t.getResourceObj(resource.id).deliveryType;
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
      self.staffExceptions = [];
      self.businessClosure = [];
      self.enrollmentPriceList = [];
      self.masterScheduleStudents = [];
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
            minTime:8,
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
            },
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
        if(moment(currentCalendarDate).format('MM/DD/YYYY') == moment(new Date()).format('MM/DD/YYYY')){
          wjQuery('.headerDate').addClass('today');
        }
        else{
          wjQuery('.headerDate').removeClass('today');
        }
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
      if(moment(date).format('MM/DD/YYYY') == moment(new Date()).format('MM/DD/YYYY')){
        wjQuery('.headerDate').addClass('today');
      }
      else{
        wjQuery('.headerDate').removeClass('today');
      }
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
      if(moment(currentCalendarDate).format('MM/DD/YYYY') == moment(new Date()).format('MM/DD/YYYY')){
        wjQuery('.headerDate').addClass('today');
      }
      else{
        wjQuery('.headerDate').removeClass('today');
      }
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
        self.businessClosure = data.getBusinessClosure(locationId,startDate,endDate) == null? [] : data.getBusinessClosure(locationId,startDate,endDate);
        if(self.businessClosure == null){
          self.businessClosure = [];
        }
        var findingLeaveFlag = true;
        if(self.businessClosure.length){
          for(var i=0;i<self.businessClosure.length;i++){
            var businessStartDate = moment(self.businessClosure[i]['hub_startdatetime']).format("YYYY-MM-DD");
            var businessEndDate = moment(self.businessClosure[i]['hub_enddatetime']).format("YYYY-MM-DD");
            businessStartDate = new Date(businessStartDate+' '+'0:00').getTime();
            businessEndDate = new Date(businessEndDate+' '+'0:00').getTime();
            var calendarStartDate = new Date(startDate+' '+'0:00').getTime();
            var calendarEndDate = new Date(endDate+' '+'0:00').getTime();  
            if(calendarStartDate >= businessStartDate &&  calendarEndDate <= businessEndDate){
              findingLeaveFlag = false;
            }
          }
        }
        if(findingLeaveFlag){
          wjQuery('table.fc-agenda-slots td div').css('backgroundColor','');
          self.staffProgram = data.getStaffProgram(locationId) == null? [] : data.getStaffProgram(locationId);
          if(self.staffProgram == null){
            self.staffProgram = [];
          }
          self.staffExceptions = isFetch || (self.staffExceptions.length == 0) ? data.getStaffException(locationId,startDate,endDate) : self.staffExceptions;
          if(self.staffExceptions == null){
            self.staffExceptions = [];
          }
          self.teacherSchedule = isFetch || (self.teacherSchedule.length == 0) ? data.getTeacherSchedule(locationId,startDate,endDate) : self.teacherSchedule;
          if(self.teacherSchedule == null){
            self.teacherSchedule = [];
          }
          self.teacherAvailability = isFetch || (self.teacherAvailability.length == 0) ? data.getTeacherAvailability(locationId,startDate,endDate) : self.teacherAvailability;
          if(self.teacherAvailability == null){
            self.teacherAvailability = [];
          }
          self.pinnedData = isFetch || (self.pinnedData.length == 0) ? data.getPinnedData(locationId,startDate,endDate) : self.pinnedData;
          if(self.pinnedData == null){
            self.pinnedData = [];
          }
          self.enrollmentPriceList = isFetch || (self.enrollmentPriceList.length == 0) ? data.getEnrollmentPriceList(locationId,startDate,endDate) : self.enrollmentPriceList;
          if(self.enrollmentPriceList == null){
            self.enrollmentPriceList = [];
          }
          self.convertPinnedData(self.pinnedData == null ? [] : self.pinnedData,false);
          self.students = isFetch || (self.students.length == 0) ? data.getStudentSession(locationId,startDate,endDate) : self.students;
          self.populateStudentEvent(self.generateEventObject(self.students == null ? [] : self.students, "studentSession"), true);
          self.filterObject.student = self.students == null ? [] : self.students;
          self.generateFilterObject(self.filterObject);
          if(studentDataSource){  
            self.masterScheduleStudents = data.getStudentMasterSchedule(locationId,startDate,endDate)
            self.generateEventObject(self.masterScheduleStudents == null ? [] : self.masterScheduleStudents, "masterStudentSession");
          }
          self.populateTeacherEvent(self.generateEventObject(self.teacherSchedule== null ? [] : self.teacherSchedule, "teacherSchedule"), true);
          self.populateTAPane(self.generateEventObject(self.teacherAvailability == null ? []:self.teacherAvailability, "teacherAvailability")); 
		      self.showConflictMsg();
        }
        else{
          wjQuery('.loading').hide();
          wjQuery('table.fc-agenda-slots td div').css('backgroundColor','#ddd');
        }
      },300);
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
                if(moment(currentCalendarDate).format('MM/DD/YYYY') == moment(new Date()).format('MM/DD/YYYY')){
                  wjQuery('.headerDate').addClass('today');
                }
                else{
                  wjQuery('.headerDate').removeClass('today');
                }
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
      var self = this;
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
            if(self.selectedDeliveryType.length == 1){
              if(self.sofList['Personal Instruction'].length > 0){
                self.sofPane(); 
              }
            }else if(self.selectedDeliveryType.length == 2){
              if(self.sofList['Personal Facilitation'].length > 0){
                self.sofPane(); 
              }
            }else {
              if(self.sofList['Personal Instruction'].length > 0 || self.sofList['Group Instruction'].length > 0 || self.sofList['Group Facilitation'].length > 0){
                self.sofPane(); 
              }
            }
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
                var sDate,eDate,startHour;
                if(val['hub_date@OData.Community.Display.V1.FormattedValue'] != undefined &&
                  val['hub_start_time@OData.Community.Display.V1.FormattedValue'] != undefined){
                  sDate = new Date(val['hub_date@OData.Community.Display.V1.FormattedValue'] +" "+ val['hub_start_time@OData.Community.Display.V1.FormattedValue']);
                  eDate = new Date(val['hub_date@OData.Community.Display.V1.FormattedValue'] +" "+ val['hub_end_time@OData.Community.Display.V1.FormattedValue']);
                  startHour = new Date(val['hub_date@OData.Community.Display.V1.FormattedValue'] +" "+ val['hub_start_time@OData.Community.Display.V1.FormattedValue']);
                  startHour = startHour.setMinutes(0);
                  startHour = new Date(new Date(startHour).setSeconds(0));
                }
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
                if(self.convertedPinnedList.length){
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
                }
                var index = self.staffExceptions.map(function(x){
                  return x['astaff_x002e_hub_staffid'];
                }).indexOf(teacher.id);
                if(index == -1){
                  eventObjList.push(teacher);
                }
            });
            self.convertedTeacherObj = eventObjList;
        }else if(label == "studentSession"){
            wjQuery.each(args, function(ke, val) {
                var sDate = new Date(val['hub_session_date'] +" "+ val['hub_start_time@OData.Community.Display.V1.FormattedValue']);
                var eDate = new Date(val['hub_session_date'] +" "+ val['hub_end_time@OData.Community.Display.V1.FormattedValue']);
                var startHour = new Date(val['hub_session_date'] +" "+ val['hub_start_time@OData.Community.Display.V1.FormattedValue']);
                startHour = startHour.setMinutes(0);
                startHour = new Date(new Date(startHour).setSeconds(0));
                var obj = {
                    id: val._hub_student_value, 
                    name: val["_hub_student_value@OData.Community.Display.V1.FormattedValue"],
                    start: sDate,
                    end : eDate,
                    sessionDate:val['hub_session_date'],
                    startHour : startHour,
                    gradeId:val['astudent_x002e_hub_grade'],
                    grade: val['astudent_x002e_hub_grade@OData.Community.Display.V1.FormattedValue'],
                    deliveryTypeId: val['aproductservice_x002e_hub_deliverytype'],
                    deliveryType: val['aproductservice_x002e_hub_deliverytype@OData.Community.Display.V1.FormattedValue'],
                    locationId: val['_hub_center_value'],
                    locationName: val['_hub_center_value@OData.Community.Display.V1.FormattedValue'],
                    enrollmentId :val['_hub_enrollment_value'],
                    subject:val['aprogram_x002e_hub_areaofinterest@OData.Community.Display.V1.FormattedValue'],
                    subjectId:val['aprogram_x002e_hub_areaofinterest'],
                    subjectColorCode: val['aprogram_x002e_hub_color'],
                    is1to1 : val["hub_is_1to1"],
                    programId: val['aprogram_x002e_hub_programid'],
                    serviceId:val['_hub_service_value'],
                    sessionId:val['hub_studentsessionid']
                }
                if (val.hasOwnProperty('_hub_resourceid_value')) {
                    obj.resourceId = val['_hub_resourceid_value']; 
                    if(self.convertedPinnedList.length){
                      var isPinned = self.convertedPinnedList.filter(function(x){
                        return (x.studentId == obj.id &&
                                x.resourceId == obj.resourceId && 
                                x.dayId == self.getDayValue(startHour) &&
                                x.startTime == moment(startHour).format("h:mm A")) 
                      });
                      if(isPinned[0] != undefined){
                        obj.pinId = isPinned[0].id;
                      }
                    }
                    eventObjList.push(obj);
                }
                else{
                  self.pushStudentToSOF(obj);
                }
            });
            setTimeout(function(){
              if(self.sofList['Personal Instruction'].length > 0 || self.sofList['Group Instruction'].length > 0 || self.sofList['Group Facilitation'].length > 0){
                  self.populateSOFPane(self.sofList,self.calendarOptions.minTime,self.calendarOptions.maxTime);
              }
            },800);
            self.convertedStudentObj = eventObjList;
        }
        else if(label == 'masterStudentSession'){
          var pinnedList= [];
          var affinityList = [];
          var noResourceList = [];
          var currentCalendarDate = self.calendar.fullCalendar('getDate');
          wjQuery.each(args, function(ke, val) {
            var obj = {
                id: val['aenrollment_x002e_hub_student'], 
                name: val["aenrollment_x002e_hub_student@OData.Community.Display.V1.FormattedValue"],
                gradeId:val['astudent_x002e_hub_grade'],
                grade: val['astudent_x002e_hub_grade@OData.Community.Display.V1.FormattedValue'],
                deliveryTypeId: val['aproductservice_x002e_hub_deliverytype'],
                deliveryType: val['aproductservice_x002e_hub_deliverytype@OData.Community.Display.V1.FormattedValue'],
                locationId: val['aenrollment_x002e_hub_location'],
                locationName: val['aenrollment_x002e_hub_location@OData.Community.Display.V1.FormattedValue'],
                subject:val['aprogram_x002e_hub_areaofinterest@OData.Community.Display.V1.FormattedValue'],
                subjectId:val['aprogram_x002e_hub_areaofinterest'],
                subjectColorCode:val['aprogram_x002e_hub_color'],
                programId: val['aprogram_x002e_hub_programid'],
                serviceId: val['aenrollment_x002e_hub_service'],
                isFromMasterSchedule:true
            }
            if(obj.deliveryType == 'Personal Instruction'){
              var pinnedStudent = self.convertedPinnedList.filter(function(x){
                 return x.studentId == obj.id &&
                        x.dayId == self.getDayValue(currentCalendarDate);
              });
              var priceList = self.enrollmentPriceList.filter(function(x){
                  return x['aenrollment_x002e_hub_student'] == obj.id;
              });
              if(priceList[0] != undefined){
                if(priceList[0]['apricelist_x002e_hub_ratio@OData.Community.Display.V1.FormattedValue'] == '1:1'){
                  obj.is1to1 = true;
                }
              }
              for (var i = 0; i < pinnedStudent.length; i++) {
                if(pinnedStudent[i] != undefined){
                  var newObj = wjQuery.extend(true, {}, obj);
                  newObj.pinId = undefined;
                  newObj.enrollmentId  = pinnedStudent[i].enrollmentId,
                  newObj.start = new Date(moment(currentCalendarDate).format('YYYY-MM-DD')+" "+pinnedStudent[i].startTime);
                  newObj.end = new Date(moment(currentCalendarDate).format('YYYY-MM-DD')+" "+pinnedStudent[i].endTime);
                  var startHour = new Date(moment(currentCalendarDate).format('YYYY-MM-DD') +" "+ pinnedStudent[i].startTime);
                  startHour = startHour.setMinutes(0);
                  startHour = new Date(new Date(startHour).setSeconds(0));
                  newObj.startHour = startHour;
                  if (pinnedStudent[i].hasOwnProperty('resourceId')) {
                    newObj.resourceId = pinnedStudent[i].resourceId; 
                    newObj.pinId = pinnedStudent[i].id;
                    var index = pinnedList.map(function(x){
                      return x.id;
                    }).indexOf(newObj.id);
                    if(index == -1){
                      pinnedList.push(newObj);
                    }
                    else{
                      if(pinnedList[index].startHour.getTime() != startHour.getTime()){
                        pinnedList.push(newObj);
                      }
                    }
                  }
                  else if(pinnedStudent[i].hasOwnProperty('affinityResourceId')){
                    newObj.resourceId = pinnedStudent[i].affinityResourceId;
                    var index = affinityList.map(function(x){
                        return x.id;
                      }).indexOf(newObj.id);
                    if(index == -1){
                      affinityList.push(newObj);
                    }
                    else{
                      if(affinityList[index].startHour.getTime() != startHour.getTime()){
                        affinityList.push(newObj);
                      }
                    }
                  }
                }
                else{
                  newObj.start = new Date(moment(currentCalendarDate).format('YYYY-MM-DD')+" "+val['hub_starttime@OData.Community.Display.V1.FormattedValue']);
                  newObj.end = new Date(moment(currentCalendarDate).format('YYYY-MM-DD')+" "+val['hub_endtime@OData.Community.Display.V1.FormattedValue']);
                  var startHour = new Date(moment(currentCalendarDate).format('YYYY-MM-DD') +" "+val['hub_starttime@OData.Community.Display.V1.FormattedValue']);
                  startHour = startHour.setMinutes(0);
                  startHour = new Date(new Date(startHour).setSeconds(0));
                  newObj.startHour = startHour;
                  var index = noResourceList.map(function(x){
                      return x.id;
                    }).indexOf(newObj.id);
                  if(index == -1){
                    noResourceList.push(newObj);
                  }
                  else{
                    if(noResourceList[index].startHour.getTime() != startHour.getTime()){
                      noResourceList.push(newObj);
                    }
                  }
                }
              }
            }
            else{
              obj.start = new Date(moment(currentCalendarDate).format('YYYY-MM-DD')+" "+val['hub_starttime@OData.Community.Display.V1.FormattedValue']);
              obj.end = new Date(moment(currentCalendarDate).format('YYYY-MM-DD')+" "+val['hub_endtime@OData.Community.Display.V1.FormattedValue']);
              var startHour = new Date(moment(currentCalendarDate).format('YYYY-MM-DD') +" "+ val['hub_starttime@OData.Community.Display.V1.FormattedValue']);
              startHour = startHour.setMinutes(0);
              startHour = new Date(new Date(startHour).setSeconds(0));
              obj.startHour = startHour;
              if(val.hasOwnProperty('aproductservice_x002e_hub_resource')){
                obj.resourceId = val['aproductservice_x002e_hub_resource']; 
                var index = eventObjList.map(function(x){
                      return x.id;
                    }).indexOf(obj.id);
                if(index == -1){
                  eventObjList.push(obj);
                }
                else{
                  if(eventObjList[index].startHour.getTime() != startHour.getTime()){
                    eventObjList.push(obj);
                  }
                }
              }
              else{
                if(obj.deliveryType == 'Group Instruction'){
                  var serviceMatchedStudent = eventObjList.filter(function(x){
                    return x.serviceId == obj.serviceId;
                  });
                  if(serviceMatchedStudent[0] != undefined){
                    obj.resourceId = serviceMatchedStudent[0].resourceId;
                  }
                  else{
                    for (var i = 0; i < self.resourceList.length; i++) {
                      if(self.resourceList[i].deliveryType == 'Group Instruction'){
                        obj.resourceId = self.resourceList[i].id;
                        break;
                      }
                    }
                  }
                  var index = eventObjList.map(function(x){
                      return x.id;
                    }).indexOf(obj.id);
                  if(index == -1){
                    eventObjList.push(obj);
                  }
                  else{
                    if(eventObjList[index].startHour.getTime() != startHour.getTime()){
                      eventObjList.push(obj);
                    }
                  }
                }
                else if(obj.deliveryType == 'Group Facilitation'){
                  var serviceMatchedStudent = eventObjList.filter(function(x){
                    return x.serviceId == obj.serviceId;
                  });
                  if(serviceMatchedStudent[0] != undefined){
                    obj.resourceId = serviceMatchedStudent[0].resourceId;
                  }
                  else{
                    for (var i = 0; i < self.resourceList.length; i++) {
                      if(self.resourceList[i].deliveryType == 'Group Facilitation'){
                        obj.resourceId = self.resourceList[i].id;
                        break;
                      }
                    }
                  }
                  var index = eventObjList.map(function(x){
                      return x.id;
                    }).indexOf(obj.id);
                  if(index == -1){
                    eventObjList.push(obj);
                  }
                  else{
                    if(eventObjList[index].startHour.getTime() != startHour.getTime()){
                      eventObjList.push(obj);
                    }
                  }
                }
              }
            }
          });
          if(pinnedList.length){
            self.populateStudentEvent(pinnedList,true);
            self.convertedStudentObj.concat(pinnedList);
          }
          if(affinityList.length){
            self.populateAffinityStudents(affinityList);
          }
          if(noResourceList.length){
            self.populateNoResourceStudent(noResourceList);
          }
          setTimeout(function(){
              if(self.sofList['Personal Instruction'].length > 0 || self.sofList['Group Instruction'].length > 0 || self.sofList['Group Facilitation'].length > 0){
                  self.populateSOFPane(self.sofList,self.calendarOptions.minTime,self.calendarOptions.maxTime);
              }
          },800);
          self.convertedStudentObj = eventObjList;
        }else if(label == "teacherAvailability"){
          var currentCalendarDate = this.calendar.fullCalendar('getDate');
          for(var i=0;i<args.length; i++){
            var index = self.staffExceptions.map(function(x){
              return x['astaff_x002e_hub_staffid'];
            }).indexOf(args[i]['_hub_staffid_value']);
            if(index == -1){
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
          }
          this.taList = eventObjList;
        }
       
        return eventObjList;
    }

    this.populateTeacherEvent = function(teacherObject, isFromFilter){
        wjQuery(".loading").show();
        var self = this;
        if (teacherObject.length) {
          wjQuery.each(teacherObject, function(key, value) {
            var id = value['id'];
            var name = value['name'];
            var eventId = '';
            var event = [];
            if(value['resourceId'] == undefined){
              for (var i = 0; i < self.resourceList.length; i++) {
                if(self.resourceList[i].deliveryType == 'Personal Instruction' || 
                  self.resourceList[i].deliveryType == 'Group Facilitation'){
                  eventId = self.resourceList[i].id+value['startHour'];
                  event = self.calendar.fullCalendar('clientEvents', eventId);
                  if(event.length == 0){
                    value['resourceId'] = self.resourceList[i].id;
                    break;
                  }
                  else{
                    if(!event[0].hasOwnProperty("teachers") ||
                      (event[0].hasOwnProperty("teachers") && event[0]['teachers'].length == 0))
                    {
                      value['resourceId'] = self.resourceList[i].id;
                      break;
                    }
                  }
                }
              }
            }
            if(value['startHour'] == undefined){
              var currentCalendarDate = self.calendar.fullCalendar('getDate');
              var calendarDate = moment(currentCalendarDate).format('YYYY-MM-DD');
              for (var i = self.calendarOptions.minTime; i < self.calendarOptions.maxTime; i++) {
                var slot = new Date(calendarDate+" "+i+':00');
                eventId = value['resourceId']+ slot;
                event = self.calendar.fullCalendar('clientEvents', eventId);
                if(event.length == 0){
                  value['startHour'] = slot;
                  value['startTime'] = slot;
                  break;
                }
                else{
                  if(!event[0].hasOwnProperty("teachers") ||
                    (event[0].hasOwnProperty("teachers") && event[0]['teachers'].length == 0))
                  {
                    value['startHour'] = slot;
                    value['startTime'] = slot;
                    break;
                  }
                }
              }
            }
            eventId = value['resourceId']+value['startHour'];
            event = self.calendar.fullCalendar('clientEvents', eventId);
            var resourceObj = self.getResourceObj(value['resourceId']);
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
                    // Conflict update
                    // More than one teacher conflict 
                    var msgIndex = event[k].conflictMsg.map(function(x){
                      return x.id;
                    }).indexOf(0);
                    if(msgIndex == -1){
                      event[k].conflictMsg.push(0);
                      self.updateConflictMsg(event[k]);
                    }

                    event[k].teachers.push({id:id, name:name});
                    wjQuery.each(event[k].teachers, function(ka, v){
                      uniqueId = v.id+"_"+value['resourceId']+"_"+value['startHour'];
                      if(value['pinId'] != undefined){
                        event[k].title += "<span class='draggable drag-teacher' pinnedId='"+ value['pinId']+"' eventid='"+eventId+"' uniqueId='"+uniqueId+"' id='"+v.id+value['resourceId']+"' type='teacherSession' value='"+v.id+"'><img src='/webresources/hub_/calendar/images/pin.png'/>"+v.name+"</span>";
                      }else{
                        // temp unpin teacher
                        if(value['tempPinId'] != undefined){
                          event[k].title += "<span class='draggable drag-teacher' tempPinId='"+ value['tempPinId']+"' eventid='"+eventId+"' uniqueId='"+uniqueId+"' id='"+v.id+value['resourceId']+"' type='teacherSession' value='"+v.id+"'><img style='transform:rotate(45deg);' src='/webresources/hub_/calendar/images/pin.png'/>"+v.name+"</span>";
                        }else{
                          event[k].title += "<span class='draggable drag-teacher' eventid='"+eventId+"' uniqueId='"+uniqueId+"' id='"+v.id+value['resourceId']+"' type='teacherSession' value='"+v.id+"'>"+v.name+"</span>";
                        }
                      }
                      event[k].isConflict = true;
                    });
                    if(event[k].hasOwnProperty("students")){
                      wjQuery.each(event[k].students, function(ke, val){
                        if(resourceObj.deliveryType == "Group Instruction"){
                          event[k].title += "<span class='drag-student' eventid='"+eventId+"' uniqueId='"+val.id+"_"+value['resourceId']+"_"+value['startHour']+"' id='"+val.id+value['resourceId']+"' type='studentSession' value='"+val.id+"'>"+val.name+", "+val.grade+"<i class='material-icons' style='color:"+val['subjectColorCode'] +"'>location_on</i></span>";
                        }else{
                          if(val['pinId'] != undefined){
                            event[k].title += "<span class='draggable drag-student' pinnedId='"+ val['pinId']+"' eventid='"+eventId+"' uniqueId='"+val.id+"_"+value['resourceId']+"_"+value['startHour']+"' id='"+val.id+value['resourceId']+"' type='studentSession' value='"+val.id+"'><img src='/webresources/hub_/calendar/images/pin.png'/>"+val.name+", "+val.grade+"<i class='material-icons' style='color:"+val['subjectColorCode'] +"'>location_on</i></span>";
                          }else{
                            event[k].title += "<span class='draggable drag-student' eventid='"+eventId+"' uniqueId='"+val.id+"_"+value['resourceId']+"_"+value['startHour']+"' id='"+val.id+value['resourceId']+"' type='studentSession' value='"+val.id+"'>"+val.name+", "+val.grade+"<i class='material-icons' style='color:"+val['subjectColorCode'] +"'>location_on</i></span>";
                          }
                        }
                      });
                    }
                    // capacity check for students place holder
                    if(event[k].hasOwnProperty("students")){
                      if(resourceObj['capacity'] > event[k].students.length){
                        if(!event[k].title.includes('<span class="student-placeholder">Student name</span>')){
                          event[k].title += '<span class="student-placeholder">Student name</span>';
                          self.addContext("",'studentPlaceholder',true, "");
                        }
                      }
                    }
                  }
                }else{
                  uniqueId = id+"_"+value['resourceId']+"_"+value['startHour'];
                  if(event[k].title.includes("<img class='onetoone' src='/webresources/hub_/calendar/images/lock.png'>")){
                    event[k].title = "<img class='onetoone' src='/webresources/hub_/calendar/images/lock.png'>";
                    if(value['pinId'] != undefined){
                      event[k].title += "<span class='draggable drag-teacher' pinnedId='"+ value['pinId']+"' eventid='"+eventId+"' uniqueId='"+uniqueId+"' id='"+v.id+value['resourceId']+"' type='teacherSession' value='"+id+"'><img src='/webresources/hub_/calendar/images/pin.png'/>"+value.name+"</span>";
                    }else{
                      // temp unpin teacher
                      if(value['tempPinId'] != undefined){
                        event[k].title += "<span class='draggable drag-teacher' tempPinId='"+ value['tempPinId']+"' eventid='"+eventId+"' uniqueId='"+uniqueId+"' id='"+v.id+value['resourceId']+"' type='teacherSession' value='"+v.id+"'><img style='transform:rotate(45deg);' src='/webresources/hub_/calendar/images/pin.png'/>"+v.name+"</span>";
                      }else{
                        event[k].title += "<span class='draggable drag-teacher' eventid='"+eventId+"' uniqueId='"+uniqueId+"' id='"+v.id+value['resourceId']+"' type='teacherSession' value='"+v.id+"'>"+v.name+"</span>";
                      }
                    }
                  }else{
                    if(value['pinId'] != undefined){
                      event[k].title = "<span class='draggable drag-teacher' pinnedId='"+ value['pinId']+"' eventid='"+eventId+"' uniqueId='"+uniqueId+"' id='"+v.id+value['resourceId']+"' type='teacherSession' value='"+id+"'><img src='/webresources/hub_/calendar/images/pin.png'/>"+value.name+"</span>";
                    }else{
                      // temp unpin teacher
                      if(value['tempPinId'] != undefined){
                        event[k].title += "<span class='draggable drag-teacher' tempPinId='"+ value['tempPinId']+"' eventid='"+eventId+"' uniqueId='"+uniqueId+"' id='"+v.id+value['resourceId']+"' type='teacherSession' value='"+v.id+"'><img style='transform:rotate(45deg);' src='/webresources/hub_/calendar/images/pin.png'/>"+v.name+"</span>";
                      }else{
                        event[k].title += "<span class='draggable drag-teacher' eventid='"+eventId+"' uniqueId='"+uniqueId+"' id='"+v.id+value['resourceId']+"' type='teacherSession' value='"+v.id+"'>"+v.name+"</span>";
                      }
                    }
                  }
                  var studentList = event[k].students;
                  event[k].teachers = [{id:id, name:name}];
                  wjQuery.each(studentList, function(ke, val){
                    if(resourceObj.deliveryType == "Group Instruction"){
                      event[k].title += "<span class='drag-student' eventid='"+eventId+"' uniqueId='"+val.id+"_"+value['resourceId']+"_"+value['startHour']+"' id='"+val.id+value['resourceId']+"' type='studentSession' value='"+val.id+"'>"+val.name+", "+val.grade+"<i class='material-icons' style='color:"+val['subjectColorCode'] +"'>location_on</i></span>";
                    }else{
                      if(val['pinId']){
                        event[k].title += "<span class='draggable drag-student' pinnedId='"+ val['pinId']+"' eventid='"+eventId+"' uniqueId='"+val.id+"_"+value['resourceId']+"_"+value['startHour']+"' id='"+val.id+value['resourceId']+"' type='studentSession' value='"+val.id+"'><img src='/webresources/hub_/calendar/images/pin.png'/>"+val.name+", "+val.grade+"<i class='material-icons' style='color:"+val['subjectColorCode'] +"'>location_on</i></span>";
                      }else{
                        event[k].title += "<span class='draggable drag-student' eventid='"+eventId+"' uniqueId='"+val.id+"_"+value['resourceId']+"_"+value['startHour']+"' id='"+val.id+value['resourceId']+"' type='studentSession' value='"+val.id+"'>"+val.name+", "+val.grade+"<i class='material-icons' style='color:"+val['subjectColorCode'] +"'>location_on</i></span>";
                      }
                    }
                  });
                }
                if(event[k].students != undefined){
                  if(event[k].students.length < resourceObj["capacity"] || resourceObj["capacity"] == undefined){
                    event[k].title += '<span class="student-placeholder">Student name</span>';                  
                    self.addContext("",'studentPlaceholder',true, "");
                    // Conflict removal 
                    // Capacity conflict reamoval
                    var msgIndex = event[k].conflictMsg.map(function(y){
                      return y;
                    }).indexOf(1);
                    if (msgIndex > -1) {
                        event[k].conflictMsg.splice(msgIndex, 1);
                    }
                    self.updateConflictMsg(event[k]);
                  }else if(event[k].students.length > resourceObj["capacity"]){
                    var msgIndex = event[k].conflictMsg.map(function(z){
                      return z;
                    }).indexOf(1);
                    if(msgIndex == -1){
                      event[k].conflictMsg.push(1);
                    }
                    self.updateConflictMsg(event[k]);
                  }  
                }
                if(event[k].title.includes('<span class="student-placeholder">Student name</span>')){
                  event[k].title = event[k].title.replace('<span class="student-placeholder">Student name</span>', "");
                }
                if(event[k].hasOwnProperty("students")){
                  if(resourceObj['capacity'] > event[k].students.length){
                    if(!event[k].title.includes('<span class="student-placeholder">Student name</span>')){
                      event[k].title += '<span class="student-placeholder">Student name</span>';
                      self.addContext("",'studentPlaceholder',true, "");
                    }
                  }
                }
              });
              self.calendar.fullCalendar('updateEvent', event);
              if(value['pinId'] != undefined){
                self.addContext(uniqueId,'teacher',true, "");
              }
              else{
                self.addContext(uniqueId,'teacher',false, "");
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
                  deliveryTypeId: resourceObj.deliveryTypeId,
                  deliveryType : resourceObj.deliveryType,
                  textColor:"#333333",
                  conflictMsg: []
              }
              if(value['pinId'] != undefined){
                obj.title = "<span class='draggable drag-teacher' pinnedId='"+ value['pinId']+ "' eventid='"+eventId+"' uniqueId='"+uniqueId+"' id='"+id+value['resourceId']+"' type='teacherSession' value='"+id+"'><img src='/webresources/hub_/calendar/images/pin.png'/>"+name+"</span>";
              }else{
                // temp unpin teacher
                if(value['tempPinId'] != undefined){
                  obj.title = "<span class='draggable drag-teacher' tempPinId='"+ value['tempPinId']+ "' eventid='"+eventId+"' uniqueId='"+uniqueId+"' id='"+id+value['resourceId']+"' type='teacherSession' value='"+id+"'><img style='transform:rotate(45deg);' src='/webresources/hub_/calendar/images/pin.png'/>"+name+"</span>";
                }else{
                  obj.title = "<span class='draggable drag-teacher' eventid='"+eventId+"' uniqueId='"+uniqueId+"' id='"+id+value['resourceId']+"' type='teacherSession' value='"+id+"'>"+name+"</span>";
                }
              }
              
              obj.title += '<span class="student-placeholder">Student name</span>';
              self.addContext("",'studentPlaceholder',true, "");
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
              if(value['pinId'] != undefined){
                self.addContext(uniqueId,'teacher',true, "");
              }
              else{
                self.addContext(uniqueId,'teacher',false, "");
              }
              self.eventList.push(obj);
              self.calendar.fullCalendar('refetchEvents');
              if(isFromFilter){
                self.calendar.fullCalendar('removeEvents');
                self.calendar.fullCalendar('addEventSource', {events:self.eventList});
              }
            }
            self.draggable('draggable');
          });
        }
        wjQuery(".loading").hide();
        this.showConflictMsg();
    }

    this.populateAffinityStudents = function(affinityList){
      var self = this;
      var affinityNotPlaceStudents = [];
      for (var i = 0; i < affinityList.length; i++) {
        var eventId = affinityList[i].resourceId+affinityList[i].startHour;
        var event = self.calendar.fullCalendar('clientEvents',eventId);
        if(event.length){
          wjQuery.each(event, function(k, v){
            if(event[k].hasOwnProperty("students") && event[k]['students'].length !=0 ){
              var resourceObj = self.getResourceObj(affinityList[i].resourceId);
              if(resourceObj.capacity > event[k]['students'].length){
                var obj = [];
                obj.push(affinityList[i]);
                self.populateStudentEvent(obj,true);
                self.convertedStudentObj.push(affinityList[i]);
              }
              else{
                affinityNotPlaceStudents.push(affinityList[i]);
              }
            }
            else{
              var obj = [];
              obj.push(affinityList[i]);
              self.populateStudentEvent(obj,true);
              self.convertedStudentObj.push(affinityList[i]);
            }
          });
        }
        else{
          var obj = [];
          obj.push(affinityList[i]);
          self.populateStudentEvent(obj,true);
          self.convertedStudentObj.push(affinityList[i]);
        }
      }
      if(affinityNotPlaceStudents.length){
        self.populateNoResourceStudent(affinityNotPlaceStudents);
      }
    }

    this.populateNoResourceStudent = function(studentList){
      var studentsForSOF = [];
      var self = this;
      for (var i = 0; i < studentList.length; i++) {
        var studentNotPlacedFlag = true;
        for(var j=0; j< self.resourceList ; j++){
          var eventId = self.resourceList[j].id+studentList[i].startHour;
          var event = self.calendar.fullCalendar('clientEvents',eventId);
          if(event.length){
            wjQuery.each(event, function(k, v){
              if(event[k].hasOwnProperty("students") && event[k]['students'].length !=0 ){
                var resourceObj = self.getResourceObj(studentList[i].resourceId);
                if(resourceObj.capacity > event[k]['students'].length){
                  studentList[i].resourceId = self.resourceList[j].id;
                  var obj = [];
                  studentNotPlacedFlag = false;
                  obj.push(studentList[i]);
                  self.populateStudentEvent(obj,true);
                  self.convertedStudentObj.push(studentList[i]);
                }
              }
              else{
                studentList[i].resourceId = self.resourceList[j].id;
                var obj = [];
                studentNotPlacedFlag = false;
                obj.push(studentList[i]);
                self.populateStudentEvent(obj,true);
                self.convertedStudentObj.push(studentList[i]);
              }
            });
          }
          else{
            studentList[i].resourceId = self.resourceList[j].id;
            var obj = [];
            studentNotPlacedFlag = false;
            obj.push(studentList[i]);
            self.populateStudentEvent(obj,true);
            self.convertedStudentObj.push(studentList[i]);
          }
        }
        if(studentNotPlacedFlag){
          studentsForSOF.push(studentList[i]);
        }
      }
      if (studentsForSOF.length) {
        for (var i = 0; i < studentsForSOF.length; i++) {
          self.pushStudentToSOF(studentsForSOF[i]);
        }
      }
    }

    this.pushStudentToSOF = function(data){
      if(Object.keys(this.sofList).length == 0){
        this.sofList['Personal Instruction'] = [];
        this.sofList['Group Instruction'] = [];
        this.sofList['Group Facilitation'] = [];
      }
      if(data.deliveryType == "Personal Instruction"){
        var index = this.sofList['Personal Instruction'].map(function(x){
          return x.id;
        }).indexOf(data.id);
        if(index == -1){
          this.sofList['Personal Instruction'].push(data);
        }
      }else if(data.deliveryType == "Group Instruction"){
        var index = this.sofList['Group Instruction'].map(function(x){
          return x.id;
        }).indexOf(data.id);
        if(index == -1){
          this.sofList['Group Instruction'].push(data);
        }
      }else if(data.deliveryType == "Group Facilitation"){
        var index = this.sofList['Group Facilitation'].map(function(x){
          return x.id;
        }).indexOf(data.id);
        if(index == -1){
          this.sofList['Group Facilitation'].push(data);
        }
      }
    };

    this.populateStudentEvent = function(studentList, isFromFilter){
        wjQuery(".loading").show();
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
                var is1to1 = value['is1to1'];
                var eventId = value['resourceId']+value['startHour'];
                var uniqueId = id+"_"+value['resourceId']+"_"+value['startHour'];
                var event = self.calendar.fullCalendar('clientEvents', eventId);
                var resourceObj = self.getResourceObj(value['resourceId']);
                if(event.length){
                    wjQuery.each(event, function(k, v){
                      if(event[k].hasOwnProperty("students") && event[k]['students'].length !=0 ){
                        if((is1to1 || event[k].students[0].is1to1) && event[k].students[0].id != id){
                          self.pushStudentToSOF(value);
                        }
                        else{
                          index = event[k].students.map(function(x){
                               return x.id;
                          }).indexOf(id);
                          if(index == -1){
                              if(resourceObj.deliveryType == "Group Instruction"){
                                if(value['pinId'] != undefined){
                                  event[k].title += "<span class='drag-student' eventid='"+eventId+"' pinnedId='"+ value['pinId'] +"' uniqueId='"+uniqueId+"' id='"+id+value['resourceId']+"' type='studentSession' value='"+id+"'><img src='/webresources/hub_/calendar/images/pin.png'/>"+name+", "+grade+"<i class='material-icons' style='color:"+value['subjectColorCode'] +"'>location_on</i></span>";
                                }else{
                                  // temp unpin student
                                  if(value['tempPinId'] != undefined){
                                    event[k].title += "<span class='drag-student' eventid='"+eventId+"' tempPinId='"+ value['tempPinId'] +"' uniqueId='"+uniqueId+"' id='"+id+value['resourceId']+"' type='studentSession' value='"+id+"'><img style='transform:rotate(45deg);' src='/webresources/hub_/calendar/images/pin.png'/>"+name+", "+grade+"<i class='material-icons' style='color:"+value['subjectColorCode'] +"'>location_on</i></span>";
                                  }else{
                                    event[k].title += "<span class='drag-student' eventid='"+eventId+"' uniqueId='"+uniqueId+"' id='"+id+value['resourceId']+"' type='studentSession' value='"+id+"'>"+name+", "+grade+"<i class='material-icons' style='color:"+value['subjectColorCode'] +"'>location_on</i></span>";
                                  }
                                }
                              }else{
                                if(value['pinId'] != undefined){
                                  event[k].title += "<span class='draggable drag-student' eventid='"+eventId+"' pinnedId='"+ value['pinId'] +"' uniqueId='"+uniqueId+"' id='"+id+value['resourceId']+"' type='studentSession' value='"+id+"'><img src='/webresources/hub_/calendar/images/pin.png'/>"+name+", "+grade+"<i class='material-icons' style='color:"+value['subjectColorCode'] +"'>location_on</i></span>";
                                }else{
                                  // temp unpin student
                                  if(value['tempPinId'] != undefined){
                                    event[k].title += "<span class='draggable drag-student' eventid='"+eventId+"' tempPinId='"+ value['tempPinId'] +"' uniqueId='"+uniqueId+"' id='"+id+value['resourceId']+"' type='studentSession' value='"+id+"'><img style='transform:rotate(45deg);' src='/webresources/hub_/calendar/images/pin.png'/>"+name+", "+grade+"<i class='material-icons' style='color:"+value['subjectColorCode'] +"'>location_on</i></span>";
                                  }else{
                                    event[k].title += "<span class='draggable drag-student' eventid='"+eventId+"' uniqueId='"+uniqueId+"' id='"+id+value['resourceId']+"' type='studentSession' value='"+id+"'>"+name+", "+grade+"<i class='material-icons' style='color:"+value['subjectColorCode'] +"'>location_on</i></span>";
                                  }
                                }
                              }
                            event[k].students.push({id:id, name:name,is1to1:is1to1,pinId:value['pinId'], grade:grade, serviceId:serviceId, programId:programId});
                          }
                        }
                      }else{
                        if(resourceObj.deliveryType == "Group Instruction"){
                          if(value['pinId'] != undefined){
                              event[k].title += "<span class='drag-student' eventid='"+eventId+"' pinnedId='"+ value['pinId'] +"' uniqueId='"+uniqueId+"' id='"+id+value['resourceId']+"' type='studentSession' value='"+id+"'><img src='/webresources/hub_/calendar/images/pin.png'/>"+name+", "+grade+"<i class='material-icons' style='color:"+value['subjectColorCode'] +"'>location_on</i></span>";
                          }else{
                            // temp unpin student
                            if(value['tempPinId'] != undefined){
                              event[k].title += "<span class='drag-student' eventid='"+eventId+"' tempPinId='"+ value['tempPinId'] +"' uniqueId='"+uniqueId+"' id='"+id+value['resourceId']+"' type='studentSession' value='"+id+"'><img style='transform:rotate(45deg);' src='/webresources/hub_/calendar/images/pin.png'/>"+name+", "+grade+"<i class='material-icons' style='color:"+value['subjectColorCode'] +"'>location_on</i></span>";
                            }else{
                              event[k].title += "<span class='drag-student' eventid='"+eventId+"' uniqueId='"+uniqueId+"' id='"+id+value['resourceId']+"' type='studentSession' value='"+id+"'>"+name+", "+grade+"<i class='material-icons' style='color:"+value['subjectColorCode'] +"'>location_on</i></span>";
                            }
                          }
                        }else{
                          if(value['pinId'] != undefined){
                              event[k].title += "<span class='draggable drag-student' eventid='"+eventId+"' pinnedId='"+ value['pinId'] +"' uniqueId='"+uniqueId+"' id='"+id+value['resourceId']+"' type='studentSession' value='"+id+"'><img src='/webresources/hub_/calendar/images/pin.png'/>"+name+", "+grade+"<i class='material-icons' style='color:"+value['subjectColorCode'] +"'>location_on</i></span>";
                          }else{
                            // temp unpin student
                            if(value['tempPinId'] != undefined){
                              event[k].title += "<span class='draggable drag-student' eventid='"+eventId+"' tempPinId='"+ value['tempPinId'] +"' uniqueId='"+uniqueId+"' id='"+id+value['resourceId']+"' type='studentSession' value='"+id+"'><img style='transform:rotate(45deg);' src='/webresources/hub_/calendar/images/pin.png'/>"+name+", "+grade+"<i class='material-icons' style='color:"+value['subjectColorCode'] +"'>location_on</i></span>";
                            }else{
                              event[k].title += "<span class='draggable drag-student' eventid='"+eventId+"' uniqueId='"+uniqueId+"' id='"+id+value['resourceId']+"' type='studentSession' value='"+id+"'>"+name+", "+grade+"<i class='material-icons' style='color:"+value['subjectColorCode'] +"'>location_on</i></span>";
                            }
                          }
                        }
                        event[k].students = [{id:id, name:name, grade:grade,pinId:value['pinId'],is1to1:is1to1, serviceId:serviceId, programId:programId }];
                      }
                      if(event[k].title.includes('<span class="student-placeholder">Student name</span>')){
                        event[k].title = event[k].title.replace('<span class="student-placeholder">Student name</span>', '');
                      }
                      if(event[k].students.length < resourceObj["capacity"] || resourceObj["capacity"] == undefined){
                        event[k].title += '<span class="student-placeholder">Student name</span>'; 
                        self.addContext("",'studentPlaceholder',true, "");                 
                        // Conflict removal
                        // capacity conflict removal
                        var msgIndex = event[k].conflictMsg.map(function(x){
                          return x;
                        }).indexOf(1);
                        if (msgIndex > -1) {
                            event[k].conflictMsg.splice(msgIndex, 1);
                        }
                        self.updateConflictMsg(event[k]);
                      }else if(event[k].students.length > resourceObj["capacity"]){
                        var msgIndex = event[k].conflictMsg.map(function(x){
                          return x;
                        }).indexOf(1);
                        if(msgIndex == -1){
                          event[k].conflictMsg.push(1);
                        }
                        self.updateConflictMsg(event[k]);
                      } 
                    });
                    if(value['deliveryType'] != "Group Instruction"){
                      if(value['pinId'] != undefined){
                        self.addContext(uniqueId,'student',true, value['deliveryType']);
                      }
                      else{
                        self.addContext(uniqueId,'student',false, value['deliveryType']);
                      }
                    }
                    self.calendar.fullCalendar('updateEvent', event);
                }else{
                    var obj = {
                        id: eventId,
                        students:[{id:id, name:name, grade:grade,is1to1: is1to1,pinId:value['pinId'] ,serviceId:serviceId, programId:programId }],
                        start:value['startHour'],
                        //end:value['end'],
                        allDay: false,
                        resourceId: value['resourceId'],
                        isTeacher: false,
                        is1to1: value['is1to1'],
                        isConflict: false,
                        textColor:"#333333",
                        conflictMsg: []
                    }
                    obj.title = "";

                    if(value['is1to1']){
                      obj.title += "<img class='onetoone' src='/webresources/hub_/calendar/images/lock.png'>";
                    }
                    obj.title += "<span class='placeholder'>Teacher name</span>";
                    if(resourceObj.deliveryType == "Group Instruction"){
                      if(value['pinId'] != undefined){
                        obj.title += "<span class='drag-student' eventid='"+eventId+"' pinnedId='"+ value['pinId'] +"' uniqueId='"+uniqueId+"' id='"+id+value['resourceId']+"' type='studentSession' value='"+id+"'><img src='/webresources/hub_/calendar/images/pin.png'/>"+name+", "+grade+"<i class='material-icons' style='color:"+value['subjectColorCode'] +"'>location_on</i></span>";
                      }else{
                        // temp unpin student
                        if(value['tempPinId'] != undefined){
                          obj.title += "<span class='drag-student' eventid='"+eventId+"' tempPinId='"+ value['tempPinId'] +"' uniqueId='"+uniqueId+"' id='"+id+value['resourceId']+"' type='studentSession' value='"+id+"'><img style='transform:rotate(45deg);' src='/webresources/hub_/calendar/images/pin.png'/>"+name+", "+grade+"<i class='material-icons' style='color:"+value['subjectColorCode'] +"'>location_on</i></span>";
                        }else{
                          obj.title += "<span class='drag-student' eventid='"+eventId+"' uniqueId='"+uniqueId+"' id='"+id+value['resourceId']+"' type='studentSession' value='"+id+"'>"+name+", "+grade+"<i class='material-icons' style='color:"+value['subjectColorCode'] +"'>location_on</i></span>";
                        }
                      }
                    }else{
                      if(value['pinId'] != undefined){
                        obj.title += "<span class='draggable drag-student' eventid='"+eventId+"' pinnedId='"+ value['pinId'] +"' uniqueId='"+uniqueId+"' id='"+id+value['resourceId']+"' type='studentSession' value='"+id+"'><img src='/webresources/hub_/calendar/images/pin.png'/>"+name+", "+grade+"<i class='material-icons' style='color:"+value['subjectColorCode'] +"'>location_on</i></span>";
                      }else{
                        // temp unpin student
                        if(value['tempPinId'] != undefined){
                          obj.title += "<span class='draggable drag-student' eventid='"+eventId+"' tempPinId='"+ value['tempPinId'] +"' uniqueId='"+uniqueId+"' id='"+id+value['resourceId']+"' type='studentSession' value='"+id+"'><img style='transform:rotate(45deg);' src='/webresources/hub_/calendar/images/pin.png'/>"+name+", "+grade+"<i class='material-icons' style='color:"+value['subjectColorCode'] +"'>location_on</i></span>";
                        }else{
                          obj.title += "<span class='draggable drag-student' eventid='"+eventId+"' uniqueId='"+uniqueId+"' id='"+id+value['resourceId']+"' type='studentSession' value='"+id+"'>"+name+", "+grade+"<i class='material-icons' style='color:"+value['subjectColorCode'] +"'>location_on</i></span>";
                        }
                      }
                    }
                    if(resourceObj.deliveryType == "Group Facilitation"){ 
                        obj.backgroundColor = "#dff0d5";
                        obj.borderColor = "#7bc143";
                    }else if(resourceObj.deliveryType == "Group Instruction"){ 
                        obj.backgroundColor = "#fedeb7";
                        obj.borderColor = "#f88e50";
                    }else if(resourceObj.deliveryType == "Personal Instruction"){ 
                        obj.backgroundColor = "#ebf5fb";
                        obj.borderColor = "#9acaea";
                    }
                    var resourceObj = self.getResourceObj(value['resourceId']);
                    if(resourceObj["capacity"] >= 1 || resourceObj["capacity"] == undefined){
                      obj.title += '<span class="student-placeholder">Student name</span>'; 
                      self.addContext("",'studentPlaceholder',true, "");                 
                    } 
                    if(value['deliveryType'] != "Group Instruction"){
                      if(value['pinId'] != undefined){
                        self.addContext(uniqueId,'student',true, value['deliveryType']);
                      }
                      else{
                        self.addContext(uniqueId,'student',false, value['deliveryType']);
                      }
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
        wjQuery(".loading").hide();
        // Open Sof pane condition writen in below function 
      this.openSofPane();
      this.showConflictMsg();
    }

    this.openSofPane = function (){
      var closeSofPane = false;
        if(Object.keys(this.sofList). length == 0 ){
          this.sofList['Personal Instruction'] = [];
          this.sofList['Group Facilitation'] = [];
          this.sofList['Group Instruction'] = [];
        }
        if(this.selectedDeliveryType.length == 1){
          if(this.getDeliveryTypeVal(this.selectedDeliveryType[0]) == "Personal Instruction"){
            if(this.sofList['Personal Instruction'].length == 0){
              closeSofPane = true;
            }
          }
        }else if(this.selectedDeliveryType.length == 2){
          if(this.sofList['Group Facilitation'].length == 0){
            closeSofPane = true;
          }
        }else{
          if(this.sofList['Personal Instruction'].length == 0){
            wjQuery(".sof-gf").css("width", "calc(100% - 10px)");
          }else if(this.sofList['Group Facilitation'].length == 0){
            wjQuery(".sof-pi").css("width", "calc(100% - 10px)");
          }
          if(this.sofList['Personal Instruction'].length == 0 && this.sofList['Group Facilitation'].length == 0 && this.sofList['Group Instruction'].length == 0){
            closeSofPane = true;
          }
        }

        if(closeSofPane){
          if(sofExpanded){
            this.sofPane();
          }
          // wjQuery('.sof-btn, .sof-close-icon').unbind('click');
          wjQuery(".sof-btn").removeClass('overflow-info');
          wjQuery('.sof-btn,.sof-close-icon').prop('title', "There are no student in overflow pane");
        }else{
          /*if(!sofExpanded){
            this.sofPane();
          }*/
          wjQuery(".sof-btn").removeClass('overflow-info');
          wjQuery(".sof-btn").addClass('overflow-info');
          wjQuery('.sof-btn,.sof-close-icon').prop('title', "There are students in overflow pane");
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
      }else if(filterFor == "sofpane"){
        return obj.filter(function(el){
          if(el.subject != undefined || el.subject != null){
            if((el.id == filterTerm || el.gradeId == filterTerm || el.subject.toLowerCase() == filterTerm.toLowerCase()) && self.selectedDeliveryType.indexOf(el['deliveryTypeId']) != -1){
                return el;
            }
          }
        });
      }else{
        return obj.filter(function(el){
            if(el.subject != undefined || el.subject != null){
              if((el.id == filterTerm || el.gradeId == filterTerm || el.subject.toLowerCase() == filterTerm.toLowerCase()) && self.selectedDeliveryType.indexOf(el['deliveryTypeId']) != -1){
                  return el;
              }
            }
        });
      }
    }

    this.pinStudent = function(element){
      var self = this;
      var id = wjQuery(element).attr('value');
      var uniqueId = wjQuery(element).attr('uniqueId');
      var startTime = uniqueId.split('_')[2];
      var today = self.calendar.fullCalendar('getDate');
      var student = self.convertedStudentObj.filter(function(x){
        return x.id == id && 
               x.resourceId == uniqueId.split('_')[1];
      });
      var objPinnedStudent = {};
      if(student != undefined){
        objPinnedStudent['hub_center@odata.bind'] = student[0].locationId;
        objPinnedStudent['hub_enrollment@odata.bind'] = student[0].enrollmentId;
        objPinnedStudent['hub_service@odata.bind'] = student[0].serviceId;
        objPinnedStudent['hub_student@odata.bind'] = id;
        objPinnedStudent['hub_resourceid@odata.bind'] = student[0].resourceId;
        if(self.convertedPinnedList.length){
          var isPinned = self.convertedPinnedList.filter(function(x){
            return ((x.studentId == id &&
                    x.resourceId == student[0].resourceId && 
                    x.dayId == self.getDayValue(startTime) &&
                    x.startTime == moment(startTime).format("h:mm A")) ||
                    (x.studentId == id &&
                    x.affinityResourceId == student[0].resourceId && 
                    x.dayId == self.getDayValue(startTime) &&
                    x.startTime == moment(startTime).format("h:mm A"))) 
          });
          if(isPinned[0] != undefined){
            objPinnedStudent.hub_sch_pinned_students_teachersid = isPinned[0].id;
          }
        }
      }
      objPinnedStudent.hub_start_time = self.convertToMinutes(moment(startTime).format("h:mm A"));
      objPinnedStudent.hub_end_time = objPinnedStudent.hub_start_time + 60;
      objPinnedStudent.hub_day = self.getDayValue(today);
      objPinnedStudent.hub_session_date = moment(today).format("YYYY-MM-DD");
      var responseObj = data.savePinStudent(objPinnedStudent);
      if(typeof(responseObj) == 'boolean'){
        if(responseObj){
          var txt = wjQuery(element)[0].innerHTML;
          wjQuery(element).html("<img src='/webresources/hub_/calendar/images/pin.png'/>"+txt);
          wjQuery(element).attr('pinnedId',objPinnedStudent.hub_sch_pinned_students_teachersid);
        }
      }
      else if(typeof(responseObj) == 'object'){
        if(responseObj != undefined){
          self.convertPinnedData(responseObj,true);
          var txt = wjQuery(element)[0].innerHTML;
          wjQuery(element).html("<img src='/webresources/hub_/calendar/images/pin.png'/>"+txt);
          wjQuery(element).attr('pinnedId',responseObj['hub_pinned_student_teacher_id']);
        }
      }
    };

    this.unPinStudent = function(element){
      var id = wjQuery(element).attr('value');
      var uniqueId = wjQuery(element).attr('uniqueId');
      var startTime = uniqueId.split('_')[2];
      var today = this.calendar.fullCalendar('getDate');
      var student = this.convertedStudentObj.filter(function(x){
        return x.id == id && 
               x.resourceId == uniqueId.split('_')[1] &&
               moment(x.startHour).format("h:mm A") == moment(startTime).format("h:mm A");
      });

      var objUnPinnedStudent = {};
      if(student != undefined){
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
          objPinnedStaff['hub_resourceid@odata.bind'] = null;
          objPinnedStaff.hub_start_time = this.convertToMinutes(moment(startTime).format("h:mm A"));
          objPinnedStaff.hub_end_time = objPinnedStaff.hub_start_time + 60;
        }
        else{
          objPinnedStaff['hub_resourceid@odata.bind'] = teacher[0].resourceId;
          objPinnedStaff.hub_start_time = null;
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
        objUnPinnedStaff.hub_start_time = this.convertToMinutes(moment(startTime).format("h:mm A"));
        objUnPinnedStaff.hub_end_time = objUnPinnedStaff.hub_start_time + 60;
        objUnPinnedStaff['hub_resourceid@odata.bind'] = teacher[0].resourceId;
        if(data.saveUnPinTeacher(objUnPinnedStaff)){
          wjQuery(element).removeAttr('pinnedId');
          wjQuery(element).find("img").remove();
        }
      }
    };

    this.omitStudentFromSession = function(element) {
      var uniqueIds = wjQuery(element).attr("uniqueId").split('_');
      var h = new Date(uniqueIds[2]).getHours();
      if(h > 12){
        h -= 12;
      }
      var objStudent = this.convertedStudentObj.filter(function(x){
          return x.id == uniqueIds[0] && 
                 x.resourceId == uniqueIds[1] &&
                 moment(x.startHour).format("h") == h;
        });
      if(objStudent[0] != undefined){
        var objCancelSession = {};
        objCancelSession['hub_studentsessionid'] = objStudent[0]['sessionId'];
        if(data.omitStudentSession(objCancelSession)){
          var prevEventId = wjQuery(element).attr("eventid");
          var prevEvent = this.calendar.fullCalendar('clientEvents', prevEventId);
          if(prevEvent){
            var eventTitleHTML = wjQuery(prevEvent[0].title);
            for (var i = 0; i < eventTitleHTML.length; i++) {
              if(wjQuery(eventTitleHTML[i]).attr('value') == wjQuery(element).attr('value')){
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
              }).indexOf(wjQuery(element).attr('value'));
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
              self.addContext("",'studentPlaceholder',true, "");
            }
          }
        }
      }
    };

    this.excuseStudentFromSession = function(element) {
      var uniqueIds = wjQuery(element).attr("uniqueId").split('_');
      var h = new Date(uniqueIds[2]).getHours();
      if(h > 12){
        h -= 12;
      }
      var objStudent = this.convertedStudentObj.filter(function(x){
          return x.id == uniqueIds[0] &&
                 x.resourceId == uniqueIds[1] &&
                 moment(x.startHour).format('h') == h;
        });
      if(objStudent[0] != undefined){
        var objCancelSession = {};
        objCancelSession['hub_studentsessionid'] = objStudent[0]['sessionId'];
        objCancelSession['hub_enrollment@odata.bind'] = objStudent[0]['enrollmentId'];
        objCancelSession['hub_service@odata.bind'] = objStudent[0]['serviceId'];
        objCancelSession['hub_center@odata.bind'] = objStudent[0]["locationId"];
        objCancelSession['hub_student@odata.bind'] = objStudent[0]['id'];
        objCancelSession['hub_session_date'] = objStudent[0]['sessionDate'];
        objCancelSession['hub_resourceid@odata.bind'] = null;
        objCancelSession.hub_start_time = this.convertToMinutes(moment(new Date(uniqueIds[2])).format("h:mm A"));
        objCancelSession.hub_end_time = objCancelSession.hub_start_time + 60;
        if(data.excuseStudentFromSession(objCancelSession)){
          var prevEventId = wjQuery(element).attr("eventid");
          var prevEvent = this.calendar.fullCalendar('clientEvents', prevEventId);
          if(prevEvent){
            var eventTitleHTML = wjQuery(prevEvent[0].title);
            for (var i = 0; i < eventTitleHTML.length; i++) {
              if(wjQuery(eventTitleHTML[i]).attr('value') == wjQuery(element).attr('value')){
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
              }).indexOf(wjQuery(element).attr('value'));
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
              self.addContext("",'studentPlaceholder',true, "");
            }
          }
        }
      }
    };

    this.excuseAndMakeUpStudent =function(element){
      var self = this;
      var uniqueIds = wjQuery(element).attr("uniqueId").split('_');
      var h = new Date(uniqueIds[2]).getHours();
      if(h > 12){
        h -= 12;
      }
      var objStudent = self.convertedStudentObj.filter(function(x){
          return x.id == uniqueIds[0] &&
                 x.resourceId == uniqueIds[1] &&
                 moment(x.startHour).format('h') == h;
        });
      if(objStudent[0] != undefined){
        var objSession = {};
        objSession.hub_studentsessionid = objStudent[0]['sessionId'];
        objSession['hub_enrollment@odata.bind'] = objStudent[0]['enrollmentId'];
        objSession['hub_service@odata.bind'] = objStudent[0]['serviceId'];
        objSession['hub_center@odata.bind'] = objStudent[0]["locationId"];
        objSession['hub_student@odata.bind'] = objStudent[0]['id'];
        objSession['hub_session_date'] = objStudent[0]['sessionDate'];
        objSession['hub_resourceid@odata.bind'] = null;
        objSession.hub_start_time = self.convertToMinutes(moment(new Date(uniqueIds[2])).format("h:mm A"));
        objSession.hub_end_time = objSession.hub_start_time + 60;
         
        wjQuery( "#studentNameofExcuse").text(objStudent[0]['name']);
        wjQuery( ".excuse-datepicker-input" ).datepicker({
          minDate: self.calendar.fullCalendar('getDate'),
          format: 'mm/dd/yyyy'
        });
        var selectedFromDate; 
        wjQuery(".excuse-datepicker-input").on("change",function(){
            selectedFromDate = wjQuery(this).val();
        });
        wjQuery('#error_block').text('');
        setTimeout(function(){                      
          wjQuery(".excuse-from-timepicker-input" ).timepicker({
            timeFormat: 'h:mm p', 
            interval: 60,                            
            minTime: '8',                            
            maxTime: '19',                            
            dynamic: false,                            
            dropdown: true,                            
            scrollbar: true      
          });                                   
          wjQuery( ".excuse-to-timepicker-input" ).timepicker({    
            timeFormat: 'h:mm p',                            
            interval: 60, 
            minTime: '9',                            
            maxTime: '20',                            
            dynamic: false,                            
            dropdown: true,                            
            scrollbar: true                        
          });                                   
        },300); 
        wjQuery("#excuseModal").dialog({
          modal: true
        });
        wjQuery("#excuseModal").dialog('option', 'title', 'Excuse and MakeUp');
        wjQuery("#excuseSave").click(function(){
          var flag = true;
          if(selectedFromDate != ''){
            objSession.hub_makeup_date = moment(moment(selectedFromDate).format('MM/DD/YYYY')).format('YYYY-MM-DD');
          }
          else{
            flag = false;
          }
          if(wjQuery(".excuse-from-timepicker-input").val() != '' && flag){
            objSession.hub_makeup_start_time = self.convertToMinutes(wjQuery(".excuse-from-timepicker-input").val());
          }
          else{
            flag = false;
          }
          if(wjQuery(".excuse-from-timepicker-input").val() != '' && flag){
            objSession.hub_makeup_end_time = self.convertToMinutes(wjQuery(".excuse-to-timepicker-input").val());
            if(objSession.hub_makeup_end_time <=  objSession.hub_makeup_start_time){
              wjQuery('#error_block').text('End Time is less than or equal to Start Time');
              wjQuery('#error_block').css('color','red');
              flag = false;
            }
          } 
          else{
            flag = false;
          }
          if(data.excuseAndMakeUpStudent(objSession) && flag){
            wjQuery("#excuseModal").dialog( "close" );
            var prevEventId = wjQuery(element).attr("eventid");
            var prevEvent = self.calendar.fullCalendar('clientEvents', prevEventId);
            if(prevEvent){
              var eventTitleHTML = wjQuery(prevEvent[0].title);
              for (var i = 0; i < eventTitleHTML.length; i++) {
                if(wjQuery(eventTitleHTML[i]).attr('value') == wjQuery(element).attr('value')){
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
                }).indexOf(wjQuery(element).attr('value'));
                prevEvent[0].students.splice(removeStudentIndex,1);
                if((eventTitleHTML.length == 1 && (eventTitleHTML[0].className == "placeholder" || eventTitleHTML[0].className == "student-placeholder")) || 
                  (eventTitleHTML.length == 2 && eventTitleHTML[0].className == "placeholder" && eventTitleHTML[1].className == "student-placeholder") ||
                  (eventTitleHTML.length == 3 && eventTitleHTML[0].className == "onetoone" && eventTitleHTML[1].className == "placeholder" && eventTitleHTML[2].className == "student-placeholder")){
                  for (var i = 0; i < self.eventList.length; i++) {
                    if(self.eventList[i].id == prevEventId)
                      self.eventList.splice(i,1);
                  }
                  self.calendar.fullCalendar('removeEvents', prevEventId);
                }
                self.calendar.fullCalendar('updateEvent', prevEvent); 
              }
              else{
                for (var i = 0; i < self.eventList.length; i++) {
                  if(self.eventList[i].id == prevEventId)
                    self.eventList.splice(i,1);
                }
                self.calendar.fullCalendar('removeEvents', prevEventId);
              }
              if(!prevEvent[0].title.includes('<span class="student-placeholder">Student name</span>')){
                prevEvent[0].title += '<span class="student-placeholder">Student name</span>';
                self.addContext("",'studentPlaceholder',true, "");
              }
            }
          }
          else{
            if(wjQuery('#error_block').text() == ''){
              wjQuery('#error_block').text('All Fields are mandatory');
              wjQuery('#error_block').css('color','red');
            }
          }
        });
      }
    };

    this.rescheduleStudentSession =function(element){
      var self = this;
      var uniqueIds = wjQuery(element).attr("uniqueId").split('_');
      var h = new Date(uniqueIds[2]).getHours();
      if(h > 12){
        h -= 12;
      }
      var objStudent = self.convertedStudentObj.filter(function(x){
          return x.id == uniqueIds[0] &&
                 x.resourceId == uniqueIds[1] &&
                 moment(x.startHour).format('h') == h;
        });
      if(objStudent[0] != undefined){

        var objNewSession = {};
        objNewSession.hub_resourceid = null;

        var objPrevSession = {};
        objPrevSession.hub_studentsessionid = objStudent[0]['sessionId'];
        objPrevSession['hub_enrollment@odata.bind'] = objStudent[0]['enrollmentId'];
        objPrevSession['hub_service@odata.bind'] = objStudent[0]['serviceId'];
        objPrevSession['hub_center@odata.bind'] = objStudent[0]["locationId"];
        objPrevSession['hub_student@odata.bind'] = objStudent[0]['id'];
        objPrevSession['hub_session_date'] = objStudent[0]['sessionDate'];
        objPrevSession['hub_resourceid@odata.bind'] = null;
        objPrevSession.hub_start_time = self.convertToMinutes(moment(new Date(uniqueIds[2])).format("h:mm A"));
        objPrevSession.hub_end_time = objPrevSession.hub_start_time + 60;
         
        wjQuery( "#studentNameofExcuse").text(objStudent[0]['name']);
        wjQuery( ".excuse-datepicker-input" ).datepicker({
          minDate: self.calendar.fullCalendar('getDate'),
          format: 'mm/dd/yyyy'
        });
        var selectedFromDate; 
        wjQuery(".excuse-datepicker-input").on("change",function(){
            selectedFromDate = wjQuery(this).val();
        });
        wjQuery('#error_block').text('');
        setTimeout(function(){                      
          wjQuery(".excuse-from-timepicker-input" ).timepicker({
            timeFormat: 'h:mm p', 
            interval: 60,                            
            minTime: '8',                            
            maxTime: '19',                            
            dynamic: false,                            
            dropdown: true,                            
            scrollbar: true      
          });                                   
          wjQuery( ".excuse-to-timepicker-input" ).timepicker({    
            timeFormat: 'h:mm p',                            
            interval: 60, 
            minTime: '9',                            
            maxTime: '20',                            
            dynamic: false,                            
            dropdown: true,                            
            scrollbar: true                        
          });                                   
        },300); 
        wjQuery("#excuseModal").dialog({
          modal: true
        });
        wjQuery("#excuseModal").dialog('option', 'title', 'Re-Schedule');
        wjQuery("#excuseSave").click(function(){
          var flag = true;
          if(selectedFromDate != ''){
            objNewSession.hub_session_date = moment(moment(selectedFromDate).format('MM/DD/YYYY')).format('YYYY-MM-DD');
          }
          else{
            flag = false;
          }
          if(wjQuery(".excuse-from-timepicker-input").val() != '' && flag){
            objNewSession.hub_start_time = self.convertToMinutes(wjQuery(".excuse-from-timepicker-input").val());
          }
          else{
            flag = false;
          }
          if(wjQuery(".excuse-from-timepicker-input").val() != '' && flag){
            objNewSession.hub_end_time = self.convertToMinutes(wjQuery(".excuse-to-timepicker-input").val());
            if(objNewSession.hub_end_time <=  objNewSession.hub_start_time){
              wjQuery('#error_block').text('End Time is less than or equal to Start Time');
              wjQuery('#error_block').css('color','red');
              flag = false;
            }
          } 
          else{
            flag = false;
          }
          var responseObj = data.rescheduleStudentSession(objPrevSession,objNewSession);
          if(responseObj != undefined && flag){
            wjQuery("#excuseModal").dialog( "close" );
            var prevEventId = wjQuery(element).attr("eventid");
            var prevEvent = self.calendar.fullCalendar('clientEvents', prevEventId);
            if(prevEvent){
              var eventTitleHTML = wjQuery(prevEvent[0].title);
              for (var i = 0; i < eventTitleHTML.length; i++) {
                if(wjQuery(eventTitleHTML[i]).attr('value') == wjQuery(element).attr('value')){
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
                }).indexOf(wjQuery(element).attr('value'));
                prevEvent[0].students.splice(removeStudentIndex,1);
                if((eventTitleHTML.length == 1 && (eventTitleHTML[0].className == "placeholder" || eventTitleHTML[0].className == "student-placeholder")) || 
                  (eventTitleHTML.length == 2 && eventTitleHTML[0].className == "placeholder" && eventTitleHTML[1].className == "student-placeholder") ||
                  (eventTitleHTML.length == 3 && eventTitleHTML[0].className == "onetoone" && eventTitleHTML[1].className == "placeholder" && eventTitleHTML[2].className == "student-placeholder")){
                  for (var i = 0; i < self.eventList.length; i++) {
                    if(self.eventList[i].id == prevEventId)
                      self.eventList.splice(i,1);
                  }
                  self.calendar.fullCalendar('removeEvents', prevEventId);
                }
                self.calendar.fullCalendar('updateEvent', prevEvent); 
              }
              else{
                for (var i = 0; i < self.eventList.length; i++) {
                  if(self.eventList[i].id == prevEventId)
                    self.eventList.splice(i,1);
                }
                self.calendar.fullCalendar('removeEvents', prevEventId);
              }
              if(!prevEvent[0].title.includes('<span class="student-placeholder">Student name</span>')){
                prevEvent[0].title += '<span class="student-placeholder">Student name</span>';
                self.addContext("",'studentPlaceholder',true, "");
              }
            }
          }
          else{
            if(wjQuery('#error_block').text() == ''){
              wjQuery('#error_block').text('All Fields are mandatory');
              wjQuery('#error_block').css('color','red');
            }
          }
        });
      }
    };

    //Method to add the context menu for Student and Teacher
    this.addContext = function(uniqueId,labelFor,isPinned, deliveryType){
      var self = this;
      var obj = {}; 
      if(labelFor == 'student'){
        if(deliveryType == "Personal Instruction"){
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
          obj.omit = {
            name: "Omit",
            callback : function(key, options) {
              self.omitStudentFromSession(options.$trigger[0]);
            }
          }
          obj.excuse = {
            name: "Excuse",
            callback : function(key, options) {
              self.excuseStudentFromSession(options.$trigger[0]);
            }
          }
          obj.excuseAndMakeUp = {
            name: "Excuse & MakeUp",
            callback : function(key, options) {
              self.excuseAndMakeUpStudent(options.$trigger[0]);
            }
          }
          obj.moveToSof = {
            name: "Move to SOF",
            callback : function(key, options) {
              self.moveStudentToSOF(options.$trigger[0]);
            }
          }
        }
        if(deliveryType == "Group Facilitation"){
          obj.reschedule = {
            name: "Reschedule",
            callback : function(key, options) {
              self.rescheduleStudentSession(options.$trigger[0]);
            }
          }
          obj.omit = {
            name: "Omit",
            callback : function(key, options) {
              self.omitStudentFromSession(options.$trigger[0]);
            }
          }
          obj.moveToSof = {
            name: "Move to SOF",
            callback : function(key, options) {
              self.moveStudentToSOF(options.$trigger[0]);
            }
          }
        }
        /*obj.cancel = {
          name: "Cancel",
          callback : function(key, options) {
            self.removeStudentFromSession(options.$trigger[0]);
          }
        }*/
        if(deliveryType == "Personal Instruction"){
          if(isPinned){
            obj.unpin.visible = true;
            obj.pin.visible = false;
          }
          else{
            obj.unpin.visible = false;
            obj.pin.visible = true;
          }
        }
      }else if(labelFor == 'teacher'){
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
        if(isPinned){
          obj.unpin.visible = true;
          obj.pin.visible = false;
        }
        else{
          obj.unpin.visible = false;
          obj.pin.visible = true;
        }
        if(deliveryType == "Personal Instruction"){
          if(isPinned){
            obj.unpin.visible = true;
            obj.pin.visible = false;
          }
          else{
            obj.unpin.visible = false;
            obj.pin.visible = true;
          }
        }   
      }else if(labelFor == "studentPlaceholder"){
        obj.makeup = {
          name: "Makeup",
          callback : function(key, options) {
            // self.omitStudentFromSession(options.$trigger[0]);
              alert("Makeup called");
          }
        }
        obj.float = {
          name: "Float",
          callback : function(key, options) {
              alert("Float called");
            // self.omitStudentFromSession(options.$trigger[0]);
          }
        }
      }   

      wjQuery(function() {
        wjQuery.contextMenu({
            selector: 'span[uniqueId="'+uniqueId+'"], .student-placeholder', 
            build: function($trigger, e) {
              return {
                items: obj
              };
            }
        }); 
      });
    };

    this.moveStudentToSOF = function(element){
      var self = this;
      var uniqueIds = wjQuery(element).attr("uniqueId").split('_');
      var h = new Date(uniqueIds[2]).getHours();
      var uniqueId = wjQuery(element).attr('uniqueId');
      var startTime = uniqueId.split('_')[2];

      if(h > 12){
        h -= 12;
      }
      var objStudent = self.convertedStudentObj.filter(function(x){
          return x.id == uniqueIds[0] &&
                 x.resourceId == uniqueIds[1] &&
                 moment(x.startHour).format('YYYY-MM-DD') == moment(uniqueIds[2]).format('YYYY-MM-DD') &&
                 parseInt(moment(x.startHour).format('h')) == h;
        });
      if(objStudent[0] != undefined){
        var objMovetoSOF = {};
        objMovetoSOF['hub_studentsessionid'] = objStudent[0]['sessionId'];
        objMovetoSOF['hub_resourceid@odata.bind'] = null;
        if(objStudent[0].hasOwnProperty('resourceId')){
          delete objStudent[0]['resourceId'];
        }
        if(data.moveStudentToSOF(objMovetoSOF)){
            var index = self.convertedStudentObj.findIndex(function(x){
             return x.id == objStudent[0].id && 
                     x.resourceId == uniqueId.split('_')[1] &&
                     moment(x.startHour).format("h:mm A") == moment(startTime).format("h:mm A");
            });
            self.convertedStudentObj.splice(index, 1);
            self.pushStudentToSOF(objStudent[0]);
            setTimeout(function(){
              if(self.sofList['Personal Instruction'].length > 0 || self.sofList['Group Instruction'].length > 0 || self.sofList['Group Facilitation'].length > 0){
                  self.populateSOFPane(self.sofList,self.calendarOptions.minTime,self.calendarOptions.maxTime);
              }
            },500);
          self.openSofPane();
          var prevEventId = wjQuery(element).attr("eventid");
          var prevEvent = self.calendar.fullCalendar('clientEvents', prevEventId);
          if(prevEvent){
            var eventTitleHTML = wjQuery(prevEvent[0].title);
            for (var i = 0; i < eventTitleHTML.length; i++) {
              if(wjQuery(eventTitleHTML[i]).attr('value') == wjQuery(element).attr('value')){
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
              }).indexOf(wjQuery(element).attr('value'));
              prevEvent[0].students.splice(removeStudentIndex,1);
              if((eventTitleHTML.length == 1 && (eventTitleHTML[0].className == "placeholder" || eventTitleHTML[0].className == "student-placeholder")) || 
                (eventTitleHTML.length == 2 && eventTitleHTML[0].className == "placeholder" && eventTitleHTML[1].className == "student-placeholder") ||
                (eventTitleHTML.length == 3 && eventTitleHTML[0].className == "onetoone" && eventTitleHTML[1].className == "placeholder" && eventTitleHTML[2].className == "student-placeholder")){
                for (var i = 0; i < self.eventList.length; i++) {
                  if(self.eventList[i].id == prevEventId)
                    self.eventList.splice(i,1);
                }
                self.calendar.fullCalendar('removeEvents', prevEventId);
              }
              self.calendar.fullCalendar('updateEvent', prevEvent); 
            }
            else{
              for (var i = 0; i < self.eventList.length; i++) {
                if(self.eventList[i].id == prevEventId)
                  self.eventList.splice(i,1);
              }
              self.calendar.fullCalendar('removeEvents', prevEventId);
            }
            if(!prevEvent[0].title.includes('<span class="student-placeholder">Student name</span>')){
              prevEvent[0].title += '<span class="student-placeholder">Student name</span>';
              self.addContext("",'studentPlaceholder',true, "");
            }
          }
        }
      }
    };

    this.draggable = function(selector){
      wjQuery('.'+selector).draggable({
        revert: true,      
        revertDuration: 0,
        appendTo: '#scrollarea',
        helper: 'clone',
        cursor: "move",
        scroll: true,
        cursorAt: { top : 0 },
        drag : function(){
          if(sofExpanded){
            wjQuery('.sof-pane').css('opacity','.1');
          }
          if(taExpanded){
            wjQuery('.ta-pane').css('opacity','.1');
          }
        },
        stop : function(){
          if(sofExpanded){
            wjQuery('.sof-pane').css('opacity','1');
          }
          if(taExpanded){
            wjQuery('.ta-pane').css('opacity','1');
          }
        }
      });
    };

    this.convertPinnedData = function(data,isFromSave){
      if(isFromSave){
        var obj={
              id: data['hub_sch_pinned_students_teachersid'],
              enrollmentId : data['_hub_enrollment_value'],
              startTime : data['hub_start_time@OData.Community.Display.V1.FormattedValue'],
              endTime: data['hub_end_time@OData.Community.Display.V1.FormattedValue'],
              studentId : data['_hub_student_value'],
              studentName : data['_hub_student_value@OData.Community.Display.V1.FormattedValue'],
              teacherId: data['_hub_teacher_value'],
              teacherName: data['_hub_teacher_value@OData.Community.Display.V1.FormattedValue'],
              dayId: data['hub_day'],
              dayValue : data['hub_day@OData.Community.Display.V1.FormattedValue']
            };
        if(data['_hub_resource_value'] != undefined){
          obj.resourceId =  data['_hub_resource_value'];
          obj.resourceName = data['_hub_resource_value@OData.Community.Display.V1.FormattedValue'];
        }
        if(data['_hub_affinity_resourceid_value'] != undefined){
          obj.affinityResourceId =  data['_hub_affinity_resourceid_value'];
          obj.affinityResourceName = data['_hub_affinity_resourceid_value@OData.Community.Display.V1.FormattedValue'];
        }
        this.convertedPinnedList.push(obj);
      }
      else{
        if(data.length){
          for (var i = 0; i < data.length; i++) {
            var obj={
              id: data[i]['hub_sch_pinned_students_teachersid'],
              enrollmentId : data[i]['_hub_enrollment_value'],
              startTime : data[i]['hub_start_time@OData.Community.Display.V1.FormattedValue'],
              endTime: data[i]['hub_end_time@OData.Community.Display.V1.FormattedValue'],
              studentId : data[i]['_hub_student_value'],
              studentName : data[i]['_hub_student_value@OData.Community.Display.V1.FormattedValue'],
              teacherId: data[i]['_hub_teacher_value'],
              teacherName: data[i]['_hub_teacher_value@OData.Community.Display.V1.FormattedValue'],
              dayId: data[i]['hub_day'],
              dayValue : data[i]['hub_day@OData.Community.Display.V1.FormattedValue']
            };
            if(data[i]['_hub_resource_value'] != undefined){
              obj.resourceId =  data[i]['_hub_resource_value'];
              obj.resourceName = data[i]['_hub_resource_value@OData.Community.Display.V1.FormattedValue'];
            }
            if(data[i]['_hub_affinity_resourceid_value'] != undefined){
              obj.affinityResourceId =  data[i]['_hub_affinity_resourceid_value'];
              obj.affinityResourceName = data[i]['_hub_affinity_resourceid_value@OData.Community.Display.V1.FormattedValue'];
            }
            this.convertedPinnedList.push(obj);
          }
        }
        else{
          this.convertedPinnedList = [];
        }
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
    }

    this.getDeliveryTypeVal = function(deliveryTypeId){
      var deliveryType = ""; 
      wjQuery.each(this.resourceList, function(k, v){
          if (deliveryTypeId == v.deliveryTypeId) {
            deliveryType = v.deliveryType;
          }
      });
      return deliveryType;
    }

    this.saveStudentToSession = function(student,prevStudent){
      var objPrevSession = {};
      var objNewSession = {};
      if(student != undefined){
        var h = new Date(student.startHour).getHours();
        if(h > 12){
          h -= 12;
        }
        var objStudent = this.convertedStudentObj.filter(function(x){
          return x.id == student.id  && 
               x.resourceId == student.resourceId &&
               moment(x.startHour).format("h") == h;
        
        });
        if(objStudent[0]){
          var oldDate = objStudent[0].sessionDate;
          var sessionDate = moment(student.start).format("YYYY-MM-DD");
          var OldDeliveryType = prevStudent.deliveryTypeId;
          var oldTime = moment(prevStudent.start).format("h:mm A");
          var newTime = moment(student.start).format("h:mm A");

          // Session type condition
          objNewSession['hub_sessiontype'] = 5;
          if(oldDate == sessionDate && newTime != oldTime && student.deliveryType == "Personal Instruction"){
            objNewSession['hub_sessiontype'] = 1;
          }
          
          objPrevSession['hub_studentsessionid'] = objStudent[0]['sessionId'];
          objPrevSession['hub_enrollment@odata.bind'] = objStudent[0]['enrollmentId'];
          objPrevSession['hub_deliverytype'] = objStudent[0]['deliveryTypeId'];
          objPrevSession['hub_start_time'] = this.convertToMinutes(moment(prevStudent.start).format("h:mm A"));
          objPrevSession['hub_end_time'] = this.convertToMinutes(moment(prevStudent.end).format("h:mm A"));
          objPrevSession['hub_resourceid@odata.bind'] = prevStudent.resourceId;
          objPrevSession['hub_service@odata.bind'] = objStudent[0]['serviceId'];
          objPrevSession['hub_student@odata.bind'] = objStudent[0]['id'];
          objPrevSession['hub_center@odata.bind'] = objStudent[0]["locationId"];
          objPrevSession['hub_deliverytype@OData.Community.Display.V1.FormattedValue'] = objStudent[0]['deliveryType'];
          objPrevSession['hub_session_date'] = objStudent[0]['sessionDate'];
          objPrevSession['hub_is_1to1'] = objStudent[0]['is1to1'];
          objPrevSession.hub_ratio = objStudent[0]['is1to1'];

          objNewSession['hub_studentsessionid'] = objStudent[0]['sessionDate'];
          objNewSession['hub_center@odata.bind'] = objStudent[0]["locationId"];
          objNewSession['hub_enrollment@odata.bind'] = objStudent[0]['enrollmentId'];
          objNewSession['hub_student@odata.bind'] = objStudent[0]['id'];
          objNewSession['hub_resourceid@odata.bind'] = student.resourceId;
          objNewSession['hub_service@odata.bind'] = objStudent[0]['serviceId'];
          objNewSession['hub_session_date'] = sessionDate;
          objNewSession['hub_start_time'] = this.convertToMinutes(moment(student.start).format("h:mm A"));
          objNewSession['hub_end_time'] = objNewSession['hub_start_time'] + 60;
          objNewSession['hub_deliverytype'] = student.deliveryTypeId;
          objNewSession['hub_is_1to1'] = objStudent[0]['is1to1'];
          objNewSession['hub_deliverytype@OData.Community.Display.V1.FormattedValue'] = student.deliveryType;
          var responseObj = data.saveStudenttoSession(objPrevSession,objNewSession);
          if(typeof responseObj == 'boolean'){
            if(responseObj){
              return responseObj;
            }
          }
          else if(typeof responseObj == 'object' && responseObj != null){
            if(responseObj.hasOwnProperty('hub_studentsessionid')){
              objStudent[0]['sessionId'] = responseObj['hub_studentsessionid'];
              objStudent[0]['start'] = student.start;
              objStudent[0]['end'] = student.end;
              objStudent[0]['resourceId'] = responseObj['hub_resourceid@odata.bind'];
              var index = this.convertedStudentObj.findIndex(function(x){
                return x.id == student.id &&
                       x.resourceId == student.resourceId &&
                       moment(x.startHour).format('h') == h;
              });
              if(index != -1){
                this.convertedStudentObj[index] = objStudent[0];
              }
            }
          }
        }
      }
    }

    this.saveTeacherToSession = function(teacher,prevTeacher){
      var objPrevSession = {};
      var objNewSession = {};
      if(teacher != undefined){

        var h = new Date(teacher.startHour).getHours();
        if(h > 12){
          h -= 12;
        }
        var objTeacher = this.teacherSchedule.filter(function(x){
          return x._hub_staff_value == teacher.id;  
          /*&&
           x._hub_resourceid_value == teacher.resourceId &&
           parseInt(x['hub_start_time@OData.Community.Display.V1.FormattedValue'].split(':')[0]) == h;
          */       
        });
        if(objTeacher.length){
        // Old object
        objPrevSession['hub_staff_scheduleid'] = objTeacher[0]['hub_staff_scheduleid'];
        objPrevSession['hub_resourceid@odata.bind'] = prevTeacher['resourceId'];
        objPrevSession['hub_start_time'] = this.convertToMinutes(moment(prevTeacher.start).format("h:mm A"));
        objPrevSession['hub_end_time'] = this.convertToMinutes(moment(prevTeacher.end).format("h:mm A"));
        objPrevSession['hub_center_value'] = prevTeacher['locationId'];
        // New object
        objNewSession['hub_staff@odata.bind'] = teacher['id'];
        objNewSession['hub_center_value'] = teacher['locationId'];
        objNewSession['hub_product_service@odata.bind'] = objTeacher[0]['_hub_product_service_value'];
        objNewSession['hub_resourceid@odata.bind'] = teacher['resourceId'];
        objNewSession['hub_date'] = moment(teacher.start).format("YYYY-MM-DD");
        objNewSession['hub_start_time'] = this.convertToMinutes(moment(teacher.start).format("h:mm A"));
        objNewSession['hub_end_time'] = this.convertToMinutes(moment(teacher.end).format("h:mm A"));
        objNewSession['hub_schedule_type'] = 3;
        var responseObj = data.saveTeachertoSession(objPrevSession,objNewSession);
        if(typeof responseObj == 'boolean'){
          if(responseObj){
            return responseObj;
          }
        }
        else if(typeof responseObj == 'object' && responseObj != null){
          if(responseObj.hasOwnProperty('hub_staff_scheduleid')){
            objTeacher[0]['hub_staff_scheduleid'] = responseObj['hub_staff_scheduleid'];
            objTeacher[0]['hub_start_time'] = objNewSession['hub_start_time'];
            objTeacher[0]['hub_end_time'] = objNewSession['hub_end_time'];
            objTeacher[0]['_hub_resourceid_value'] = responseObj['hub_resourceid@odata.bind'];
            var index = this.teacherSchedule.findIndex(function(x){
              return x._hub_staff_value == teacher.id;
               /*&&
                 x._hub_resourceid_value == teacher.resourceId &&
                 parseInt(x['hub_start_time@OData.Community.Display.V1.FormattedValue'].split(':')[0]) == h;
                */            
              });
            if(index != -1){
              this.teacherSchedule[index] = objTeacher[0];
            }
          }
        }
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
          Yes: function() {
            wjQuery(elm).attr("tempPinId", wjQuery(elm).attr("pinnedId"));
            wjQuery(elm).removeAttr("pinnedId");
            t.studentSessionConflictCheck(t,date, allDay,ev,ui,resource,elm);
            wjQuery( this ).dialog( "close" );
          },
          No: function() {
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
          Yes: function() {
            t.studentSofConflictCheck(t,date, allDay,ev,ui,resource,elm);
            wjQuery( this ).dialog( "close" );
          },
          No: function() {
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
          Yes: function() {
            t.teacherSessionConflictCheck(t,date, allDay,ev,ui,resource,elm);
            wjQuery( this ).dialog( "close" );
          },
          No: function() {
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
          Yes: function() {
            t.tapaneConflictCheck(t,date, allDay,ev,ui,resource,elm);
            wjQuery( this ).dialog( "close" );
          },
          No: function() {
            wjQuery( this ).dialog( "close" );
          }
        }
      });
    }

    this.prompt = function(message){
      wjQuery("#dialog > .dialog-msg").text(message);
      wjQuery("#dialog").dialog({
        resizable: false,
        height: "auto",
        width: 400,
        modal: true,
        buttons: {
          // "Confirm": function() {
          //   t.tapaneConflictCheck(t,date, allDay,ev,ui,resource,elm);
          //   wjQuery( this ).dialog( "close" );
          // },
          Close: function() {
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
            var obj = {
              id : x['hub_programid'],
              color: x['hub_color'] 
            }
            programObj.push(obj);
          }
        }
      }).indexOf(teacherId);
      return programObj;
    }

    this.showConflictMsg = function(){
      wjQuery(".sof-btn, .fc-event").tooltip({
        tooltipClass:"custom-conflict",
        track: true,
        content: function () {
          return wjQuery(this).prop('title').replace('|','<br />');
        }
      });
    }

    // Conflict messages update method
    this.updateConflictMsg = function(event){
      var msg = "";
      var self = this;
      var title =  wjQuery(event.title);
      for (var i = 0; i < title.length; i++) {
        if(title[i].className == 'conflict'){ 
          title.splice(i,1);
          event.title = '';
          for (var j = 0; j < title.length; j++) {
          event.title+= title[j].outerHTML;
          }
          break;
        }
      }
      if(event.conflictMsg.length){
        wjQuery.each(event.conflictMsg, function(k, v){
          msg += (k+1)+". "+ self.conflictMsg[v]+"|";
        });
        var lastIndex = msg.lastIndexOf("|");
        msg = msg.substring(0, lastIndex);
        if(!event.title.includes('<img class="conflict" title="'+msg+'" src="/webresources/hub_/calendar/images/warning.png">')){
          event.title +=  '<img class="conflict" title="'+msg+'" src="/webresources/hub_/calendar/images/warning.png">';
        }
      }
    }
}

  
