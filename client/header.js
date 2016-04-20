
Template.Header.helpers({
  getGroups : function (netid) {
    var user = Users.findOne({username: netid});
    // console.log(netid + ' added');
    return user.groups;
  },
  getGroupName : function (groupid) {
    return Groups.findOne({_id: groupid}).groupname;
   }
});
  
Template.Header.events({
  'click .groupElement' : function (event) {
    let id = event.currentTarget.id;
    let userid = currentUserId();
    Users.update({_id: userid}, {$set: {current: id}});
  },
  rendered: function() {
    console.log("is this even getting called?");
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
  }
});


