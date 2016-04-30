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

nameFromId = function (id) {
  let user = Users.findOne({_id: id});
  return user.username;
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
  let group = Groups.findOne({_id: groupid});
  let employers = group.employers;
  index = indexUser(userid, employers);
  if (index >= 0) {
    employers.splice(index, 1);
    Groups.update({_id: groupid}, {$set: {"employers": employers}});
  }
}

removeUserFromGroup = function (userid, groupid) {
  removeEmployerFromGroup(userid, groupid);
  let user = Users.findOne({_id: userid});
  let groups = user.groups;
  let index = indexGroup(groupid, groups); 
  if (index >= 0) {
    groups.splice(index, 1);
    Users.update({_id: userid}, {$set: {"groups": groups, current: null}});
  }
  let group = Groups.findOne({_id: groupid});
  let users = group.users;
  index = indexUser(userid, users);
  if (index >= 0) {
    users.splice(index, 1);
    Groups.update({_id: groupid}, {$set: {"users": users}});
  }
  Shifts.find({"groupid": groupid}).forEach(function (shift) {removeUserFromShift(userid, shift._id);}); 
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
    Groups.update({_id: groupid}, {$set: {"users": users}});
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

removeUserFromShift = function (userid, shiftid) {
  let shift = Shifts.findOne({_id: shiftid});
  let newusers = shift.users;
  let i = indexUser(userid,newusers);
  if (i >= 0) {
    newusers.splice(i,1);
    Shifts.update({_id:shiftid}, {$set: {users: newusers}});
  }
}

addUserToShift = function (userid, shiftid) {
  let shift = Shifts.findOne({_id: shiftid});
  let newusers = shift.users;
  let i = indexUser(userid, newusers);
  if (i < 0) {
    newusers.push({'userid': userid});
    Shifts.update({_id: shiftid}, {$set: {users: newusers}});
  }
}

var weekdays = {'Sunday': 0, 'Monday':1,'Tuesday':2,'Wednesday':3,'Thursday':4,
'Friday':5,'Saturday':6};

addShift = function (shift, groupid) { 
  let shiftid = Shifts.insert({'groupid': groupid,start:shift.start,end:shift.end,capacity: shift.capacity,users:[]});
  let date = new Date(shift.date);
  if (shift.repeat) {
    Shifts.update({_id:shiftid}, {$set: {'weekday':date.getDay()}});
  } else {
    let d = date.getFullYear().toString() 
            + "-" + (date.getMonth()+1).toString() 
            + "-" + date.getDate().toString();
    Shifts.update({_id:shiftid}, {$set: {'date': d}});
  }
}

removeShift = function (shiftid) {
  Shifts.remove({_id: shiftid});
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
  let user = Users.findOne({_id: currentUserId()});
  if (user.current)
    return user.current; 
  if (user.groups.length > 0) {
    Users.update({_id: currentUserId()}, {$set: {current: user.groups[0]}}); 
    return user.groups[0]; 
  }
  return null; 
}

isCurrentEmployer = function() {
  let userid = currentUserId();
  let employers = Groups.findOne({_id: getCurrentGroupId()}).employers;
  return indexUser(userid,employers) >= 0;
}

formatTime = function(time) {
  let timeHr = parseInt(time.slice(0, time.length-5));
  if (String(time).indexOf("pm") != -1) timeHr += 12;
  if (timeHr < 10) timeHr = "0" + String(timeHr);

  let timeMin = String(time).slice(time.length-4, time.length-2);

  return timeHr + ":" + timeMin;
}

unformatTime = function (time) {
  let timeHr = parseInt(time.slice(0,time.length-3));
  let meridien = "";
  if (timeHr >= 12) {
    meridien = "pm";
  } else {
    meridien = "am";
  }
  timeHr = timeHr % 12;
  if (timeHr == 0) {
    timeHr = 12;
  }
  return String(timeHr)+time.slice(time.length-3, time.length)+meridien;
}

formatDate = function(date) {
  var array = date.split("-");
  var month = array[1];
  var day = array[2];

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return array[0] + "-" + month + "-" + day
}

getCurrentNotifications = function () {
    let notifications = [];
    let groups = Users.findOne({_id: currentUserId()}).groups;
    for (i = 0; i < groups.length; i++) {
      notifications = notifications.concat(Notifications.find({group : groups[i].groupid}).fetch());
    }
    return notifications;
}
