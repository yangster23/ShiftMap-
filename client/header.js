Template.Header.helpers({
  // Finds the groups a user is in
  getGroups : function (netid) {
    let user = Users.findOne({username: netid});
    let groupid = getCurrentGroupId();
    let groups = user.groups
    for (let i = 0; i < groups.length; i++) {
      if (groupid == groups[i].groupid) {
        user.groups.splice(i,1);
      }
    }    
    return groups;
  },
  // Gets the groupname of a group 
  getGroupName : function (groupid) {
    return Groups.findOne({_id: groupid}).groupname;
  },
  // Gets the current group
  getCurrentGroupId: function () {
    return Users.findOne({_id: currentUserId()}).current;
  },
  // Gets the number of unchecked notifications for a user
  getNotificationCount : function () {
    return checkSeen(getCurrentNotifications()).length;
  },
  // Shows the current group, or no groups if there are none
  getGroupHeader: function () {
     if (Users.findOne({_id: currentUserId()}).current == null)
      return "No Groups";
    else {
      if (Groups.findOne({_id: getCurrentGroupId()}).groupname == null) {
        let groupid = Users.findOne({_id: currentUserId()}).groups[0];
        if (groupid != null) {
          setCurrentGroup(groupid);
        } else {
          return "No Current Groups"
        }
      }
    }
    return Groups.findOne({_id: getCurrentGroupId()}).groupname; 
  }
});
  
Template.Header.events({
  // Changes the calendar display by updating the current group to the group clicked
  'click .groupElement' : function (event) {
    let id = event.currentTarget.id;
    let userid = currentUserId();
    Users.update({_id: userid}, {$set: {current: id}});
  },
  // Hides popovers when switching pages
  'click .currGroup' : function(event) {
    let fc = $('.fc');
    $("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end']").popover('hide');
    $("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end fc-short']").popover('hide');
    $("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end transparent-event']").popover('hide');
    $("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end transparent-event fc-short']").popover('hide');
    fc.fullCalendar('refetchEvents');
  }
});


