// Helper functions

currentUser = function () {
  return Meteor.user().profile.name;
}

idFromName = function (netid) {
  let user = Users.findOne({username: netid});
  if (user == undefined) {
  return Users.insert({username: netid, groups:[]});  
  }
  return user._id;
}

currentUserId = function () {
  return idFromName(currentUser());
}

indexUser = function (userid, users) {
  let l = users.length;
  for (var i = 0; i < l; i++) {
    if (users[i].userid == userid) {
      return i;
    }
  }
  return -1;
}

indexGroup = function (groupid, groups) {
  let l = groups.length;
  for (var i = 0; i < l; i++) {
    if (groups[i].groupid == groupid) {
      return i;
    }
  }
  return -1;
}



removeEmployerFromGroup = function (userid, groupid) {
  let group = Groups.findOne({_id: groupuid});
  let employers = groups.employers;
  index = indexUser(userid, employers);
  if (index >= 0) {
    users.splice(index, 1);
    Groups.update({_id: groupid}, {$set: {"employers": employers}});
  }
}

removeUserFromGroup = function (userid, groupid) {
  removeEmployerFromGroup(userid, groupid);
  let user = Users.findOne({_id: userid});
  let groups = user.groups;
  let index = indexGroup(groupid, groups);  if (indexu >= 0) {
    groups.splice(index, 1);
    Users.update({_id: userid}, {$set: {"groups": groups}});
  }

  let group = Groups.findOne({_id: groupuid});
  let users = groups.users;
  index = indexUser(userid, users);
  if (index >= 0) {
    users.splice(index, 1);
    Groups.update({_id: groupid}, {$set: {"users": users}});
  }
}

addUserToGroup = function (userid, groupid) {
  let user = Users.findOne({_id: userid});
  let groups = user.groups;
  let index = indexGroup(groupid, groups); 
  if (index < 0) {
    groups.push({"groupid": groupid});
    Users.update({_id: userid}, {$set: {"groups": groups}});
  }
  let group = Groups.findOne({_id: groupid});
  let users = group.users;
  index = indexUser(userid, users);
  if (index < 0) {
    users.push({"userid": userid});
    Users.update({_id: groupid}, {$set: {"users": users}});
  }
}

addEmployerToGroup = function (userid, groupid) {
  addUserToGroup(userid, groupid);
  let group = Groups.findOne({_id: groupid});
  let employers = group.employers;
  index = indexUser(userid, employers);
  if (index < 0) {
    employers.push({"userid": userid});
    Groups.update({_id: groupid}, {$set: {"employers": employers}});
  }
}

changeUserInShift = function (cuserid, shiftid) {
  let shift = Shifts.findOne({_id: shiftid});
  let newusers = shift.users;
  let i = indexUser(cuserid, newusers);
  console.log(i);
  if (i >= 0){
    newusers.splice(i,1);
  } else {
    newusers.push({userid: cuserid});
  }
  Shifts.update({_id: shiftid}, {$set: {users: newusers}});
}


var weekdays = {'Sunday': 0, 'Monday':1,'Tuesday':2,'Wednesday':3,'Thursday':4,
'Friday':5,'Saturday':6};
addShiftToGroup = function (start,end,cap,repeat,weekday,groupid) {
  let today = new Date();

  Shifts.insert({'start': start, 'end': end, 'capacity': cap, 'repeat': repeat,
                 'weekday': weekday, 
                 'day': today.getDate()+weekdays[weekday]-today.getDay(),
                 'groupid':groupid,'users':[]});
}

setCurrentGroup = function (groupid) {
  Users.update({_id: currentUserId()}, {$set: {current: groupid}});
}

isShiftFull = function (shiftid) {
  let shift = Shifts.findOne({_id: shiftid});
  if (shift.users.length >= shift.capacity) { 
    return true;
  } else {
    return false;
  }
}

isUserInShift = function (userid, shiftid) {
  let shift = Shifts.findOne({_id: shiftid});
  if (indexUser(userid, shift.users) >= 0) {
    return true;
  } else {
    return false;
  }
}

getCurrentGroupId = function () {
  return Users.findOne({_id: currentUserId()}).current;
}