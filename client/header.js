Template.Header.helpers({
  getGroups : function (netid) {
    var user = Users.findOne({username: netid});
    // console.log(netid + ' added');
    let groupid = getCurrentGroupId();
    let groups = user.groups
    for (let i = 0; i < groups.length; i++) {
      console.log(groups[i])
      if (groupid == groups[i].groupid) {
        user.groups.splice(i,1);
      }
    }    
    return groups;
  },
  getGroupName : function (groupid) {
    return Groups.findOne({_id: groupid}).groupname;
   },
   getCurrentGroupId: function () {
    return Users.findOne({_id: currentUserId()}).current;
  },
  getNotificationCount : function () {
    return getCurrentNotifications().length;
  },
  getGroupHeader: function () {
    if (Users.findOne({_id: currentUserId()}).current == null)
      return "No Current Groups";
    else 
      return Groups.findOne({_id: getCurrentGroupId()}).groupname;
  }
});
  
Template.Header.events({
  'click .groupElement' : function (event) {
    let id = event.currentTarget.id;
    let userid = currentUserId();
    Users.update({_id: userid}, {$set: {current: id}});
  }
});


