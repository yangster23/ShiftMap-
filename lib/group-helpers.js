// Group functions
// Takes a userid and an array users of {userid: string}, and finds the index at which 
// userid is found. -1 if users does not contain userid
indexUser = function (userid, users) {
  for (var i = 0; i < users.length; i++) {
    if (users[i].userid == userid) {
      return i;
    }
  }
  return -1;
}

// Takes a userid and a groupid, and removes them from that group's list of employers
removeEmployerFromGroup = function (userid, groupid) {
  let employers = Groups.findOne({_id: groupid}).employers;
  let index = indexUser(userid, employers);
  if (index >= 0) {
    employers.splice(index, 1);
    Groups.update({_id: groupid}, {$set: {"employers": employers}});
  }
}

// Takes a userid and a groupid, and removes them as both an employee and an employer
removeUserFromGroup = function (userid, groupid) {
  removeEmployerFromGroup(userid, groupid);
  let groups = Users.findOne({_id: userid}).groups;
  let index = indexGroup(groupid, groups); 
  if (index >= 0) {
    groups.splice(index, 1);
    Users.update({_id: userid}, {$set: {"groups": groups, current: null}});
  }
  let users = Groups.findOne({_id: groupid}).users;
  index = indexUser(userid, users);
  if (index >= 0) {
    users.splice(index, 1);
    Groups.update({_id: groupid}, {$set: {"users": users}});
  }
  // Removes the user from all shifts of this group
  Shifts.find({"groupid": groupid}).forEach(function (shift) {
    removeUserFromShift(userid, shift._id);
  }); 
}

// Takes a userid, an a groupid, and adds the user to the group
addUserToGroup = function (userid, groupid) {
  let groups = Users.findOne({_id: userid}).groups;
  let index = indexGroup(groupid, groups); 
  if (index < 0) {
    groups.push({"groupid": groupid});
    Users.update({_id: userid}, {$set: {"groups": groups}});
  }
  let users = Groups.findOne({_id: groupid}).users;
  index = indexUser(userid, users);
  if (index < 0) {
    users.push({"userid": userid});
    Groups.update({_id: groupid}, {$set: {"users": users}});
  }
}
// Takes a userid and a groupid, and adds the user as an employer to that group
addEmployerToGroup = function (userid, groupid) {
  addUserToGroup(userid, groupid);
  let employers = Groups.findOne({_id: groupid}).employers;
  if (indexUser(userid, employers) < 0) {
    employers.push({"userid": userid});
    Groups.update({_id: groupid}, {$set: {"employers": employers}});
  }
}



