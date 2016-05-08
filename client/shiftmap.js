/* used for closing popovers appropriately*/
prevEvent = null;
eventCounter = 0;

Template.calendar.helpers({
  // Gets the current group name
  getGroupHeader: function () {
    let currentGroup = getCurrentGroupId();
    if (currentGroup == null)
      return "No Groups";
    return Groups.findOne({_id: currentGroup}).groupname; 
  },
  // Gets the group description
  getGroupDescription: function () {
    return Groups.findOne({_id: getCurrentGroupId()}).groupdescription;
  },
  // Determines if the user is an employer
  isCurrentEmployer: function() {
    let userid = currentUserId();
    let employers = Groups.findOne({_id: getCurrentGroupId()}).employers;
    return indexUser(userid,employers) >= 0;
  },
  // Gets shifts to display
  events: function () {
    let fc = $('.fc');
    return function (start, end, tz, callback) {
      let userid = currentUserId();
      let currentGroup = getCurrentGroupId();
      let events = [];
      let secondEvent;

      events = Shifts.find({groupid: currentGroup}).map(function (shift) {
        let starttime = shift.start;
        let endtime = shift.end;
        let id = currentUserId();
        let colVal = "";
        let classVal = "";

        if (indexUser(id, shift.users) >= 0) {
          //you're in shift
          if (isSwappedOut(userid, shift.swaps, findDate(shift._id))) {
            colVal = "green";
            classVal = "transparent-event";
          } else if (isWaitingSwap(userid, currentGroup, shift._id, findDate(shift._id))) {
            colVal = "pink";
          } else //you're in shift with no swaps
            colVal = "green";
          } else {
            //you're not in shift
            if (isSwappedIn(userid, shift.swaps, findDate(shift._id))) {
              classVal = "transparent-event";
            }
            if (isShiftFull(shift._id)){
              colVal = "red";
            } else {
              colVal = "blue"; 
            }
          }
          // Sets events in proper format for fullcalendar
          if (shift.date) {
            return {
              start: formatDate(shift.date) + "T" + starttime,
              end: formatDate(shift.date) + "T" + endtime,
              _id: shift._id,
              color: colVal,
              className: classVal
            };
          } else {
            return {
              start: "2016-04-26T" + starttime,
              end: "2016-04-26T" + endtime,
              _id: shift._id,
              color: colVal,
              dow: [parseInt(shift.weekday)],
              className: classVal
            };
          }
      });
      callback(events);
      callback(secondEvent);
      fc.fullCalendar('refetchEvents');
      fc.fullCalendar('rerenderEvents');
    };
  },
  // Determines calendar options
  setCalHeader: function() {
    return {
      left: 'prev,next today',
      center: '',
      right: ''
    }
  },
  // Gets the current group
  getCurrentGroupId: function() {
    return Users.findOne({_id: currentUserId()}).current;
  },
  // When a shift is clicked
  onEventClicked: function() {
    return function(calEvent, jsEvent, view) {
        let fc = $('.fc');
        let userid = currentUserId();
        let currentGroup = getCurrentGroupId();
        let group = Groups.findOne({_id: currentGroup});
        let employers = group.employers;
        let buttonid = calEvent._id;
        lastshiftid = buttonid;
        let shift = Shifts.findOne({_id: lastshiftid});
        if (swapstatus) {
          //check if there is already an array of notification
          // add field swap into the shift {subin:_id, subout:_id, date:x}
          if (lastshiftid == swapid) {
            swapstatus = false;
            alert("You cannot swap with the same shift");
          } 
          else if (indexUser(userid,Shifts.findOne({_id: lastshiftid}).users) >= 0) {
            swapstatus = false;
            alert("You cannot swap with your own shift");
          }
          else {
            let swapMoment = findDate(swapid);
            let lastMoment = findDate(lastshiftid)
            
            notifySwap(currentGroup, userid, swapid, swapMoment, lastshiftid, lastMoment);
            swapstatus = false;
            alert("You will be notified if anyone accepts your request");
          }
        } else {
          if (indexUser(userid, employers) < 0) {
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
                  } else return $("#popover-content2").html();
                } else {
                  if (isSwappedIn(userid, shift.swaps, findDate(lastshiftid))) {
                    if (greaterOneDay("in", userid, shift.swaps))
                      return $("#popover-content4").html();
                    else return $("#popover-content1").html();
                  } else if (isShiftFull(lastshiftid)) {
                    return $("#popover-content1").html();
                  } else return $("#popover-content3").html();
                }
                return $("#popover-content1").html();
              }
            });
          } else {
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
                  } else {
                    if (isSwappedIn(userid, shift.swaps, findDate(lastshiftid))) {
                      if (greaterOneDay("in", userid, shift.swaps))
                        return $("#employer-popover-content4").html();
                      else return $("#employer-popover-content1").html(); 
                    } else if (isShiftFull(lastshiftid)) {
                      return $("#employer-popover-content1").html();
                    } else {
                      return $("#employer-popover-content3").html();
                    }
                  }
                return $("#employer-popover-content1").html();
              }
            });
          }
          if (prevEvent == calEvent) {
            if (eventCounter == 0) {
              $(this).popover('show');
              eventCounter = 1;
            } else {
              $(this).popover('destroy');
              eventCounter = 0;
            }
          } else {
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
  let fc = this.$('.fc');
  $(document).ready(function(){
    $('[data-toggle="popover"]').popover();   
  });
  this.autorun(function () {
    //1) trigger event re-rendering when the collection is changed in any way
    //2) find all, because we've already subscribed to a specific range
    Shifts.find();
    $("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end']").not(this).popover('destroy');
    $("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end fc-short']").not(this).popover('destroy');
    $("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end transparent-event']").not(this).popover('destroy');
    $("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end transparent-event fc-short']").not(this).popover('destroy');
    fc.fullCalendar('refetchEvents');
  });
};
 
