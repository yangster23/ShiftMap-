 /* used for closing popovers appropriately*/
 prevEvent = null;
 eventCounter = 0;

 Template.calendar.helpers({
   getCurrentGroupId: function () {
    return Users.findOne({_id: currentUserId()}).current;
  },
  currentUserId: function () {
  return idFromName(currentUser());
  }, 
  indexUser: function (userid, users) {
  let l = users.length;
  for (var i = 0; i < l; i++) {
    if (users[i].userid == userid) {
      return i;
    }
  }
  return -1;
}, 
  getGroupHeader: function () {
     if (Users.findOne({_id: currentUserId()}).current == null)
      return "No Groups";
    else 
    {
      if (Groups.findOne({_id: getCurrentGroupId()}).groupname == null) {
        let groupid = Users.findOne({_id: currentUserId()}).groups[0];
        if (groupid != null) {
          setCurrentGroup(groupid);
        }
        else
          return "No Current Groups"
      }
    }
      return Groups.findOne({_id: getCurrentGroupId()}).groupname; 
  },
  getGroupDescription: function () {
    return Groups.findOne({_id: getCurrentGroupId()}).groupdescription;
  },
  isCurrentEmployer: function() {
    let userid = currentUserId();
    let employers = Groups.findOne({_id: getCurrentGroupId()}).employers;
    return indexUser(userid,employers) >= 0;
  }, 
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

   Template.calendar.rendered = function () {
$(document).ready(function(){
    $('[data-toggle="popover"]').popover();   
});

}; 

