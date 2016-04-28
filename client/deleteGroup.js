Template.deleteGroup.events({
  // Pressing the delete group button
  'click .btn-danger'(event) {
    // get the group, find the group, get the rusers from that group and remove them front it and remove group. 
    let groupid = getCurrentGroupId();
    let users = Groups.findOne({_id: groupid}).users;
    console.log(users);
    for (let i = 0; i < users.length; i++) {
      console.log(users[i]);
      removeUserFromGroup(users[i].userid, groupid);
      //setCurrentGroup(Users.findOne({_id: users[i].userid}).groups[0].groupid);
    }
    Groups.remove({_id: groupid});

    setCurrentGroup(Users.findOne({_id: currentUserId()}).groups[0].groupid);
  }
});
