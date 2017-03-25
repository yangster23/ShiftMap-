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

addShift = function (shift, groupid) { 
  let shiftid = Shifts.insert({'groupid': groupid,start:shift.start,end:shift.end,capacity: shift.capacity,swaps:[],users:[]});
  let date = new Date(shift.date);
  if (shift.repeat) {
    console.log(date.getDay());
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
  if (user.current) {
    return user.current;
  }
  if (user.groups.length > 0) {
    Users.update({_id: currentUserId()}, {$set: {current: user.groups[0].groupid}}); 
    return user.groups[0].groupid; 
  }
  return null; 
}

isCurrentEmployer = function() {
  let userid = currentUserId();
  let employers = Groups.findOne({_id: getCurrentGroupId()}).employers;
  return indexUser(userid,employers) >= 0;
}

formatTime = function(time) {
  var timeHr = parseInt(String(time).slice(0, time.length-5));
  if (String(time).indexOf("pm") != -1 && timeHr != 12) timeHr += 12;
  if (timeHr < 10) timeHr = "0" + String(timeHr);

  var timeMin = String(time).slice(time.length-4, time.length-2);

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
  console.log(currentUserId());
  let groups = Users.findOne({_id: currentUserId()}).groups;
  for (let i = 0; i < groups.length; i++) {
    console.log(Notifications.find({groupid : groups[i].groupid}).fetch());
    notifications = notifications.concat(Notifications.find({groupid : groups[i].groupid}).fetch());
  }
  console.log(notifications);
  return notifications;
}

getStartDate = function(increment) {
  var fc = $('.fc');
  var calendar = fc.fullCalendar('getCalendar');
  var view = calendar.view;
  var start = view.start;
  return moment(start).add(parseInt(increment), 'day').format("YYYY-MM-DD");
}

addSwap = function (date, swapin, swapout, shiftid, swapid) {
  let shift = Shifts.findOne({_id: shiftid});
  if (indexUser(swapout, shift.users) >= 0 && indexUser(swapin, shift.users) < 0) {
    shift.swaps.push({'swapin':swapin,'swapout':swapout,'date':date, 'swapid': swapid});
  }
  Shifts.update({_id: shiftid}, {$set:{swaps: shift.swaps}});
}

notifySub = function (groupid, subout, outid, dateout) {
  let shift = Shifts.findOne({_id: outid});
  Notifications.insert({'groupid': groupid, 'sender': subout, 'shiftid': outid, 'date': dateout, 'startin': shift.start, 'endin': shift.end, 'type': 'sub', 'seen':[], 'ok':[]});
}

notifyAdd = function (groupid, subin, inid) {
  let shift = Shifts.findOne({_id: inid});
  Notifications.insert({'groupid': groupid, 'sender': subin, 'shiftid': inid, 'startin': shift.start, 'endin': shift.end, 'type': 'add', 'seen':[], 'ok':[]});
}

notifyDrop = function (groupid, subout, outid) {
  let shift = Shifts.findOne({_id: outid});
  Notifications.insert({'groupid': groupid, 'sender': subout, 'shiftid': outid, 'startin': shift.start, 'endin': shift.end, 'type': 'drop', 'seen':[], 'ok':[]});
}

notifySwap = function (groupid, swapout, outid, dateout, inid, datein) {
  let shiftin = Shifts.findOne({_id: outid});
  let shiftout = Shifts.findOne({_id: inid});
  let notes = Notifications.find({'groupid': groupid, 'sender': swapout, 'shiftid':outid, 'date': dateout}).fetch();
  if (notes.length == 0) {
    let id = Notifications.insert({'groupid': groupid, 'sender': swapout, 'shiftid': outid, 'date': dateout, 'startin': shiftin.start, 'endin':shiftin.end, 
     'startout': shiftout.start, 'endout': shiftout.end, 'type': 'swap', 'swapid': inid, 'swapdate': datein, seen: [], ok:[]});
    Notifications.update({_id: id},{$set: {noteid: id}});
  } else {
    let id = notes[0].noteid;
    Notifications.insert({'groupid': groupid, noteid: id, 'sender': swapout, 'shiftid': outid, 'date': dateout, 'startin': shiftin.start, 'endin':shiftin.end, 
     'startout': shiftout.start, 'endout': shiftout.end, 'type': 'swap', 'swapid': inid, 'swapdate': datein, seen: [], ok:[]});
  }
}

filterRequests = function (notifArray) {
  let curUser = currentUserId();
  let record = [];

  for (let i = 0; i < notifArray.length; i ++) {
    if (notifArray[i].sender == curUser && notifArray[i].acceptID == undefined) {
      record.push(notifArray[i]);
    }
  }

  return record;
}

unique = function(arr) {
  var u = {}, a = [];
  for(var i = 0, l = arr.length; i < l; ++i){
    if(!u.hasOwnProperty(arr[i])) {
      a.push(arr[i]);
      u[arr[i]] = 1;
    }
  }
  return a;
}

// returns an array of notifications which the currentUser has NOT seen
checkSeen = function (notifArray) {
  let curUser = currentUserId();
  let copy = notifArray.slice();
  let record = [];
  console.log(curUser);
  for (let i = 0; i < copy.length; i++) {
    let seenArray = copy[i].seen;
    let okayArray = copy[i].ok;
    let swapid = copy[i].swapid;

    /* pending sub or swap request sent by user*/
    if (copy[i].sender == curUser && copy[i].acceptID == undefined && copy[i].type != "drop" && copy[i].type != "add") {
      console.log(copy[i].acceptID);
      record.push(i);
    } 
    /* pending swap request for someone else*/
    if (swapid) {
      let shift = Shifts.findOne({_id: swapid});
      if (indexUser(curUser,shift.users) < 0 && copy[i].acceptID == undefined) {
        console.log("hello");
        record.push(i);
      } 
    }
    /* employee */
    if (!isCurrentEmployer()) {
      /*accepted and user is not the sender*/
      if (copy[i].acceptID != undefined && copy[i].sender != curUser)
        record.push(i);
      if (copy[i].type == "drop")
        record.push(i);
      if (copy[i].type == "add")
        record.push(i);
      //check if you've seen it
      for (let j = 0; j < seenArray.length; j++) {
        if (curUser == seenArray[j]) {
          record.push(i);
        }
      }
    }
    /*employer */
    else {
      for (let j = 0; j < seenArray.length; j++) {
        if (curUser == seenArray[j] && copy[i].acceptID == undefined) {
          record.push(i);
        }
      }
    }
    for (let j = 0; j < okayArray.length; j++) {
      if (curUser == okayArray[j]) {
        record.push(i);
      }
    }
  }

  record = unique(record);

  for (let i = record.length - 1; i >= 0; i--) {
    copy.splice(record[i], 1)
  }
  return copy;
}

isSwappedOut = function (userid, swaps, date) {
  for (let i = 0; i < swaps.length; i++) {
    if (swaps[i].swapout == userid && swaps[i].date == date)
      return true;
  }
  return false;
}

isSwappedIn = function (userid, swaps, date) {
  for (let i = 0; i < swaps.length; i++) {
    if (swaps[i].swapin == userid && swaps[i].date == date)
      return true;
  }
  return false;
}

isWaitingSwap = function(userid, groupid, shiftid, date) {
  var notifarray = Notifications.find({groupid: groupid, shiftid: shiftid, date: date}).fetch();
  for (let i=0; i < notifarray.length; i++) {
    if (notifarray[i].sender == userid && notifarray[i].acceptID == undefined)
      return true;
  }
  return false;
}

findDate = function(shiftid) {
  var shiftSwap = Shifts.findOne({_id: shiftid});
  if (shiftSwap.date) swapMoment = formatDate(shiftSwap.date);
  else swapMoment = getStartDate(shiftSwap.weekday);
  return swapMoment;
}

greaterOneDay = function (inOut, userid, swaps) {
  var currentDate = moment(new Date()).format("YYYY-MM-DD");

  var fc = $('.fc');
  var calendar = fc.fullCalendar('getCalendar');
  var view = calendar.view;
  var start = moment(view.start).format("YYYY-MM-DD");


  for (let i = 0; i < swaps.length; i++) {
    if (inOut == "in") {
      if (swaps[i].swapin == userid && moment(start).isBefore(swaps[i].date, 'day')) {
        console.log("currentdate comes before swapdate: " + moment(currentDate).isBefore(swaps[i].date, 'day'));
        return moment(currentDate).isBefore(swaps[i].date, 'day');
      }
    }
    else {
      if (swaps[i].swapout == userid && moment(start).isBefore(swaps[i].date, 'day')) {
        console.log("currentdate comes before swapdate: " + moment(currentDate).isBefore(swaps[i].date, 'day'));
        return moment(currentDate).isBefore(swaps[i].date, 'day');
      }
    }
  }
}




