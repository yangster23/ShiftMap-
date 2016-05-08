// Shift functions
// Takes a userid and a shiftid, and removes the user from the shift
removeUserFromShift = function (userid, shiftid) {
  let users = Shifts.findOne({_id: shiftid}).users;
  let i = indexUser(userid, users);
  if (i >= 0) {
    users.splice(i,1);
    Shifts.update({_id:shiftid}, {$set: {users: users}});
  }
}

// Takes a userid and a shiftid, and adds the user to that shift
addUserToShift = function (userid, shiftid) {
  let users = Shifts.findOne({_id: shiftid}).users;
  if (indexUser(userid, users) < 0) {
    users.push({'userid': userid});
    Shifts.update({_id: shiftid}, {$set: {users: users}});
  }
}

// Maps weekdays in string format to numbers
var weekdays = {'Sunday': 0, 'Monday': 1,'Tuesday': 2,'Wednesday': 3,
                'Thursday': 4, 'Friday':5,'Saturday':6};

// Takes a shift object, which contains the start and end time of the shift, 
// its capacity, a date and whether it is weekly or not and adds it to the group
addShift = function (shift, groupid) { 
  let shiftid = Shifts.insert({'groupid': groupid, 'start': shift.start, 'end': shift.end, 
                               'capacity': shift.capacity, 'swaps': [], 'users': []});
  let date = new Date(shift.date);
  if (shift.repeat) {
    Shifts.update({_id:shiftid}, {$set: {'weekday': date.getDay()}});
  } else {
    let d = date.getFullYear().toString() 
            + "-" + (date.getMonth()+1).toString() 
            + "-" + date.getDate().toString();
    Shifts.update({_id:shiftid}, {$set: {'date': d}});
  }
}

// Takes a shiftid and removes it and all references to it
removeShift = function (shiftid) {
  let shift = Shifts.findOne({_id: shiftid});
  Shifts.remove({_id: shiftid});
  // removes successful subs/swaps related to the shift
  for (let i = 0; i < shift.swaps.length; i++) {
    let otherShift = Shifts.findOne({"_id": shift.swaps[i].swapid});
    for (let j = otherShift.swaps.length-1; j >= 0; j--) {
      if (otherShift.swaps[j].swapid == shiftid) {
        otherShift.swaps.splice(j, 1);
      }
    }
    Shifts.update({"_id": shift.swaps[i].swapid}, {$set: {swaps: otherShift.swaps}}); 
  }
  // Removes notifications related to the shift
  Notifications.find({shiftid: shiftid}).forEach(function (notif) {
    Notifications.remove({"_id" : notif._id});
  });
  Notifications.find({swapid: shiftid}).forEach(function (notif) {
    Notifications.remove({"_id": notif._id});
  });
}

// Checks if the shift is full
isShiftFull = function (shiftid) {
  let shift = Shifts.findOne({_id: shiftid});
  if (shift.users.length >= shift.capacity) { 
    return true;
  } else {
    return false;
  }
}

// Determines if the user is in the shift
isUserInShift = function (userid, shiftid) {
  let shift = Shifts.findOne({_id: shiftid});
  if (indexUser(userid, shift.users) >= 0) {
    return true;
  } else {
    return false;
  }
}

// Creates a swap on date between users swapin and swapout, in shiftid, with an indentifier swapid
addSwap = function (date, swapin, swapout, shiftid, swapid) {
  let shift = Shifts.findOne({_id: shiftid});
  if (indexUser(swapout, shift.users) >= 0 && indexUser(swapin, shift.users) < 0) {
    shift.swaps.push({'swapin':swapin,'swapout':swapout,'date':date, 'swapid': swapid});
  }
  Shifts.update({_id: shiftid}, {$set:{swaps: shift.swaps}});
}

// Returns whether a user is swapped out of a shift
isSwappedOut = function (userid, swaps, date) {
  for (let i = 0; i < swaps.length; i++) {
    if (swaps[i].swapout == userid && swaps[i].date == date)
      return true;
  }
  return false;
}

// Returns whether a user is swapped into a shift
isSwappedIn = function (userid, swaps, date) {
  for (let i = 0; i < swaps.length; i++) {
    if (swaps[i].swapin == userid && swaps[i].date == date)
      return true;
  }
  return false;
}

// Returns whether a user has requested a swap/sub for a shift
isWaitingSwap = function(userid, groupid, shiftid, date) {
  var notifarray = Notifications.find({groupid: groupid, shiftid: shiftid, date: date}).fetch();
  for (let i=0; i < notifarray.length; i++) {
    if (notifarray[i].sender == userid && notifarray[i].acceptID == undefined)
      return true;
  }
  return false;
}


