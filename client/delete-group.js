Template.deleteGroup.events({
  // Pressing the delete group button
  'click .btn-ok'(event) {
    // get the group, find the group, get the users from that group and remove them from it and remove group. 
    let groupid = getCurrentGroupId();
    let users = Groups.findOne({_id: groupid}).users;
    for (let i = 0; i < users.length; i++) {
      removeUserFromGroup(users[i].userid, groupid);
    }
    Groups.remove({_id: groupid});
  }
});
