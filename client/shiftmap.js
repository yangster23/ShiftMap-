 /* used for closing popovers appropriately*/
 prevEvent = null;
 eventCounter = 0;

 Template.calendar.helpers({
  getGroupHeader: function () {
    let currentGroup = getCurrentGroupId();
    console.log(currentGroup);
    if (currentGroup == null)
      return "No Groups";
    return Groups.findOne({_id: currentGroup}).groupname; 
  },
  getGroupDescription: function () {
    return Groups.findOne({_id: getCurrentGroupId()}).groupdescription;
  },
  isCurrentEmployer: function() {
    let userid = currentUserId();
    let employers = Groups.findOne({_id: getCurrentGroupId()}).employers;
    return indexUser(userid,employers) >= 0;
  },
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
          var classVal = "";

          if (indexUser(id, it.users) >= 0) {
            //you're in it
            if (isSwappedOut(userid, it.swaps, findDate(it._id))) {
              colVal = "green";
              classVal = "transparent-event";
            }
            else if (isWaitingSwap(userid, currentGroup, it._id, findDate(it._id))) {
              colVal = "pink";
            }
            else //you're in it with no swaps
              colVal = "green";
          } 
          else {
            //you're not in it
            if (isSwappedIn(userid, it.swaps, findDate(it._id))) {
              colVal = "blue";
              classVal = "transparent-event";
            }
            else if (isShiftFull(it._id)){
              colVal = "red";
            }
            else
              colVal = "blue"; 
          }

          if (it.date) {
            return {
              start: formatDate(it.date) + "T" + starttime,
              end: formatDate(it.date) + "T" + endtime,
              _id: it._id,
              color: colVal,
              className: classVal
            };
          }
          else {
            return {
              start: "2016-04-26T" + starttime,
              end: "2016-04-26T" + endtime,
              _id: it._id,
              color: colVal,
              dow: [parseInt(it.weekday)],
              className: classVal
            };
          }

      });
      callback(events);
      callback(secondEvent);
      fc.fullCalendar('refetchEvents');
      console.log("calling rerender");
      fc.fullCalendar('rerenderEvents');
    };
  },
  setCalHeader: function() {
    return {
      left: 'prev,next today',
      center: '',
      right: ''
    }
  },
  getCurrentGroupId: function() {
    return Users.findOne({_id: currentUserId()}).current;
  },
  onEventClicked: function() {
    var fc = $('.fc');
    var user = Users.findOne({username: currentUser()});
    var userid = user._id;
    let currentGroup = user.current;
    var group = Groups.findOne({_id: currentGroup});
    var employers = group.employers;
    return function(calEvent, jsEvent, view) {
        var buttonid = calEvent._id;
        lastshiftid = buttonid;
        var shift = Shifts.findOne({_id: lastshiftid});
        if (swapstatus) {
          //notifyswap(subout, groupid, shiftid, dateOut, swapid, dateIn)
            //check if there is already an array of notification
          // add field swap into the shift {subin:_id, subout:_id, date:x}
          if (lastshiftid == swapid) {
            swapstatus = false;
            alert("You cannot swap with the same shift");
          } else if (indexUser(userid,Shifts.findOne({_id: lastshiftid}).users) >= 0) {
            swapstatus = false;
            alert("You cannot swap with your own shift");
          } else {
            var swapMoment = findDate(swapid);
            var lastMoment = findDate(lastshiftid)
            
            notifySwap(currentGroup, userid, swapid, swapMoment, lastshiftid, lastMoment);
            swapstatus = false;
            alert("You will be notified if anyone accepts your request");
          }
        } 
        else {
        if (indexUser(userid, employers) == -1) {
          $(this).popover({
              html: true,
              placement: 'right',
              title: function() {
                  return $("#popover-head").html();
              },
              container: 'body',
              content: function() {          
                  if (isUserInShift(userid, lastshiftid)) {
                    if (isSwappedOut(userid, shift.swaps, findDate(lastshiftid))) {
                      if (greaterOneDay("out", userid, shift.swaps))
                        return $("#popover-content4").html();
                      else return $("#popover-content1").html();
                    }
                    else return $("#popover-content2").html();
                  }
                  else {
                    if (isSwappedIn(userid, shift.swaps, findDate(lastshiftid))) {
                      if (greaterOneDay("in", userid, shift.swaps))
                        return $("#popover-content4").html();
                      else return $("#popover-content1").html();
                    }
                    else if (isShiftFull(lastshiftid)) {
                      return $("#popover-content1").html();
                    }
                    else return $("#popover-content3").html();
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
              container: 'body',
              content: function() {
                  if (isUserInShift(userid, lastshiftid)) {
                    if (isSwappedOut(userid, shift.swaps, findDate(lastshiftid))) {
                      if (greaterOneDay("out", userid, shift.swaps))
                        return $("#employer-popover-content4").html();
                      else return $("#employer-popover-content1").html();
                    }
                    else return $("#employer-popover-content2").html();
                  }
                  else {
                    if (isSwappedIn(userid, shift.swaps, findDate(lastshiftid))) {
                      if (greaterOneDay("in", userid, shift.swaps))
                        return $("#employer-popover-content4").html();
                      else return $("#employer-popover-content1").html(); 
                    }
                    else if (isShiftFull(lastshiftid)) {
                      return $("#employer-popover-content1").html();
                    }
                    else
                      return $("#employer-popover-content3").html();
                  }
                return $("#employer-popover-content1").html();
              }
          });
        }
        if (prevEvent == calEvent) {
          if (eventCounter == 0) {
            $(this).popover('show');
            eventCounter = 1;
          }
          else {
            $(this).popover('destroy');
            eventCounter = 0;
          }
        }
        else {
          console.log("is this getting here");  
          $("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end']").not(this).popover('destroy');
          $("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end fc-short']").not(this).popover('destroy');
          $("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end transparent-event']").not(this).popover('destroy');
          $("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end transparent-event fc-short']").not(this).popover('destroy');
          $(this).popover('show');
          eventCounter = 1;
        }
        prevEvent = calEvent;
      }
    }
  }
});

  Template.calendar.rendered = function () {
    // find id of full calendar
    var fc = this.$('.fc');
    //
    this.autorun(function () {
        console.log("hello");
        //1) trigger event re-rendering when the collection is changed in any way
        //2) find all, because we've already subscribed to a specific range
        fc.fullCalendar('refetchEvents');
    });
    $("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end']").not(this).popover('destroy');
    $("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end fc-short']").not(this).popover('destroy');
    $("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end transparent-event']").not(this).popover('destroy');
    $("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end transparent-event fc-short']").not(this).popover('destroy');
  };


Template.calendar.rendered = function () {
  $(document).ready(function(){
      $('[data-toggle="popover"]').popover();   
  });
};
 
