 /* used for closing popovers appropriately*/
 prevEvent = null;
 eventCounter = 0;

 Template.calendar.helpers({
  // retrieve the current group's shifts in an array for the week
  /*getDays : function (start) {
    let user = Users.findOne({username: currentUser()});
    let userid = user._id;
    let currentGroup = user.current;
 
    let meridian = String(start).slice(start.length-2,start.length);
    let time = String(start).slice(0, start.length-2);
    let regex = "^" + time + ":[0-5][0-9]" + meridian + "$";

    if (currentGroup == undefined) {
      currentGroup = user.groups[0].groupid;
      if (currentGroup == undefined) {
        return [];
      }
      setCurrentGroup(currentGroup);
    }

    let today = new Date();
    let currdayofweek = today.getDay();
    let firstday = today.getDate() - currdayofweek;
    let days = [];
      
    for (i = 0; i < 7; ++i) {
      days[i] = {oneday : Shifts.find({groupid: currentGroup, day: i+firstday, start: {$regex: regex}}), dayOfWeek: i+firstday};
    } 
    return days
  },*/
  events: function () {
    var fc = $('.fc');
    return function (start, end, tz, callback) {
      let user = Users.findOne({username: currentUser()});
      let userid = user._id;
      let currentGroup = user.current;
      var events;
      var secondEvent;

      if (currentGroup == undefined) {
        currentGroup = user.groups[0].groupid;
        if (currentGroup == undefined) {
          events = [];
        }
        setCurrentGroup(currentGroup);
      }
      console.log("id: " + currentGroup);

      events = Shifts.find({groupid: currentGroup}).map(function (it) {
          var starttime = String(it.start)
          var endtime = String(it.end)
          var id = currentUserId();
          var colVal = "";

          if (indexUser(id, it.users) >= 0) {
            colVal = "green"
          } else if (isShiftFull(it._id)){
            colVal = "red"
          } else {
            colVal = "blue"
          }

          if (it.date) {
            return {
              start: formatDate(it.date) + "T" + starttime,
              end: formatDate(it.date) + "T" + endtime,
              _id: it._id,
              color: colVal
            };
          }
          else {
            return {
              start: "2016-04-26T" + starttime,
              end: "2016-04-26T" + endtime,
              _id: it._id,
              color: colVal,
              dow: [parseInt(it.weekday)]
            };
          }

          return {
          //title: it.date.toISOString(),
            //start: it.start,
            //end: it.end,

            start: "2016-04-24T" + starttime,
            end: "2016-04-24T" + endtime,
            _id: it._id,
            color:colVal,
            dow: [1, 4]
          };
      });
      callback(events);
      callback(secondEvent);
      fc.fullCalendar('refetchEvents');
      console.log("calling rerender")
      fc.fullCalendar('rerenderEvents');
    };
  },
  setCalHeader() {
    return {
      left: 'prev,next today',
      center: '',
      right: ''
    }
  },
  onEventClicked: function() {
    var user = Users.findOne({username: currentUser()});
    var userid = user._id;
    let currentGroup = user.current;
    var group = Groups.findOne({_id: currentGroup});
    var employers = group.employers;
    return function(calEvent, jsEvent, view) {
        var fc = $('.fc');
        var buttonid = calEvent._id;
        lastshiftid = buttonid;
        if (swapstatus) {
          var firstperson = Shifts.find({_id: buttonid}).users[0];
          addUserToShift(currentUserId(), buttonid);
          removeUserFromShift(currentUserId(), swapid);
          removeUserFromShift(firstperson, buttonid);
          addUserToShift(firstperson, swapid);
        }
        if (indexUser(userid, employers) == -1) {
          $(this).popover({
              html: true,
              placement: 'right',
              title: function() {
                  return $("#popover-head").html();
              },
              content: function() {
                  let user = currentUserId();
          
                  if (isUserInShift(user, lastshiftid)) {
                    return $("#popover-content2").html();
                  }
                  else {
                    if (isShiftFull(lastshiftid)) {
                      return $("#popover-content1").html();
                    }
                    else {
                      return $("#popover-content3").html();
                   }
                  }
                return $("#popover-content1").html();
              }
          });
        }
        else {
          $(this).popover({
              html: true,
              placement: 'right',
              title: function() {
                  return $("#popover-head").html();
              },
              content: function() {
                  let user = currentUserId();
          
                  if (isUserInShift(user, lastshiftid)) {
                    return $("#employer-popover-content2").html();
                  }
                  else {
                    if (isShiftFull(lastshiftid)) {
                      return $("#employer-popover-content1").html();
                    }
                    else {
                      return $("#employer-popover-content3").html();
                   }
                  }
                return $("#employer-popover-content1").html();
              }
          });
        }
        if (prevEvent == calEvent) {
          console.log("hello");
          console.log(eventCounter);
          if (eventCounter == 0) {
            $(this).popover('show');
            eventCounter = 1;
          }
          else {
            console.log("setting to 0");
            $(this).popover('destroy');
            eventCounter = 0;
            console.log(eventCounter);
          }
        }
        else {  
          $("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end']").not(this).popover('destroy');
          $(this).popover('show');
          eventCounter = 1;
        }
        prevEvent = calEvent;

       /* console.log(calEvent.counter);
        if (calEvent.counter % 2 == 0) {
          $(this).popover('show');
          calEvent.counter += 1;
        }
        else {
          $(this).popover('destroy');
          calEvent.counter = 0;
        }*/
    }
  }
});

  Template.calendar.rendered = function () {
    // find id of full calendar
    var fc = this.$('.fc');
    //
    this.autorun(function () {
        //1) trigger event re-rendering when the collection is changed in any way
        //2) find all, because we've already subscribed to a specific range
        Shifts.find();
        fc.fullCalendar('refetchEvents');
    });
    $("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end']").popover('destroy');

  };

  // this is some confusing syntax..keeping it here for now..works only when you refresh
/*Template.setDay.rendered = function() {
    console.log("hello");
      $('[data-toggle="popover"]').popover({
        html: true,
        // this is to make it print out what I want
        title: function() {
          return $("#popover-head").html();
        },
        content: function() {
          return $("#popover-content").html();
        } 
      });
  }*/

  /*Template.calendar.rendered = function() {
      console.log("is this getting here1?");
      $('[data-toggle="popover"]').popover({
        html: true,
        // this is to make it print out what I want
        title: function() {
          return $("#popover-head").html();
        },
        content: function() {
          return $("#popover-content").html();
        } 
      });
  }*/
  /*Template.setDay.helpers({
    mapShift : function (start, end, users, day, shiftId) {
      var id = currentUserId();
      var colVal = "";
      if (indexUser(id, users) >= 0) {
        colVal = "green"
      } else if (isShiftFull(shiftId)){
        colVal = "red"
      } else {
        colVal = "blue"
      }
      var startMin = String(start).charAt(start.length-4);
      var endMin = String(end).charAt(end.length-4);
      var startFraction = parseFloat(startMin) / 6;
      var endFraction = parseFloat(endMin) / 6;

      var startHr = parseInt(String(start).slice(0, start.length-5)) % 12;
      var endHr = parseInt(String(end).slice(0, end.length-5)) % 12;

      if (String(start).indexOf("pm") != -1) startHr += 12;
      if (String(end).indexOf("pm") != -1) endHr += 12;
      startHr += startFraction;
      endHr += endFraction;

      var diff = endHr - startHr;
      if (diff < 0) diff = 24 + diff;

      var user = Users.findOne({username: currentUser()});
      var currentGroup = user.current;
      var list = [];

      console.log(startHr);
      console.log(endHr);

      Shifts.find({groupid: currentGroup, day: day}).forEach(function (shift) {
        var tempStart = shift.start
        var tempEnd = shift.end

        var tempStartMin = String(tempStart).charAt(tempStart.length-4);
        var tempEndMin = String(tempEnd).charAt(tempEnd.length-4);
        var tempStartFraction = parseFloat(tempStartMin) / 6;
        var tempEndFraction = parseFloat(tempEndMin) / 6;

        var tempStartHr = parseInt(String(tempStart).slice(0, tempStart.length-5)) % 12;
        var tempEndHr = parseInt(String(tempEnd).slice(0, tempEnd.length-5)) % 12;

        if (String(tempStart).indexOf("pm") != -1) tempStartHr += 12;
        if (String(tempEnd).indexOf("pm") != -1) tempEndHr += 12;
        tempStartHr += tempStartFraction;
        tempEndHr += tempEndFraction;

        if ((tempStartHr > startHr && tempStartHr < endHr) || (tempEndHr > startHr && tempEndHr < endHr)
            || (startHr > tempStartHr && startHr < tempEndHr) || (endHr > tempStartHr && endHr < tempEndHr)
            || (tempStartHr == startHr && tempEndHr == endHr)) {
          list.push({shift: shift, start: tempStartHr, end:tempEndHr});
        }
      });
      
      var currHr = startHr;
      var counter = 0;
      var overlapShift = [];
      while (currHr <= endHr) {
        var tempcounter = 0;
        var tempOverlapShift = [];
        for (var i = 0; i < list.length; i++) {
          var starttime = list[i].start;
          var endtime = list[i].end;
          var difftime = endtime - starttime
          if (difftime < 0) difftime = 24 + difftime
          if (currHr >= starttime && currHr <= endtime) {
            tempcounter += 1;
            tempOverlapShift.push({shift: list[i].shift, diff: difftime});
          }
        }
        if (tempcounter > counter) {
          counter = tempcounter;
          overlapShift = tempOverlapShift;
        }
        currHr += .1;
      }
      
      overlapShift.sort(function(a, b) {
        return b.diff - a.diff;
      });

      console.log(overlapShift);

      for (var index = 0; index < overlapShift.length; index++) {
        if (String(shiftId) == String(overlapShift[index].shift._id))
          break;
      };

      var topPadding = "" + 50*startFraction + "px";
      var height = "" + 50*diff-1 + "px";
      var width = "" + 159/counter + "px";
      var leftPadding = "" + (160/counter)*index + "px";

      return "color:" + colVal + ";margin-top:" + topPadding + ";margin-left:" + leftPadding + ";height:" + height + ";width:" + width;
    },
    
  'rendered' : function(shiftId) {
    console.log("hello");
    $('[data-toggle="popover"]').popover({
      html: true,
      // this is to make it print out what I want
      title: function() {
        return $("#popover-head").html();
      },
      // return content based on 
      // 1) if the capacity of the shift is full, then don't offer the add button
      // 2) if the current user is not in the shift, don't offer the drop button
      // 3) if these are not the case, offer all the buttons
      content: function () {
        let userid = currentUserId();
        console.log(lastshiftid);
        if (isUserInShift(userid, lastshiftid)) {
          return $("#popover-content2").html();
        }
        else {
          if (isShiftFull(lastshiftid)) {
            return $("#popover-content1").html();
        }
          else {
            return $("#popover-content3").html();
        }
      }
      return $("#popover-content1").html();
    }
  });
 }    
});

 popoverInit = function (shiftId) {
    $('[data-toggle="popover"]').popover({
      html: true,
      // this is to make it print out what I want
      title: function() {
        return $("#popover-head").html();
      },
      // return content based on 
      // 1) if the capacity of the shift is full, then don't offer the add button
      // 2) if the current user is not in the shift, don't offer the drop button
      // 3) if these are not the case, offer all the buttons
      content: function () {
        let user = currentUserId();
        
        if (isUserInShift(user, lastshiftid)) {
          return $("#popover-content2").html();
        }
        else {
          if (isShiftFull(lastshiftid)) {
            return $("#popover-content1").html();
        }
          else {
            return $("#popover-content3").html();
        }
      }
      return $("#popover-content1").html();
    }
  });
}*/

/*Template.setDay.events({
  'click button' : function (event) {
    var buttonid = event.currentTarget.id;
    lastshiftid = buttonid;
    popoverInit(buttonid);
    if (swapstatus) {
      var firstperson = Shifts.find({_id: buttonid}).users[0];
      changeUserInShift(currentUserId(), buttonid);
      changeUserInShift(currentUserId(), swapid);
      changeUserInShift(firstperson, buttonid);
      changeUserInShift(firstperson, buttonid);
    }
    $(buttonid).popover('show');//show popover
  }
});*/

