// Notifications functions
// returns an array of all the notifications for the groups the current user is a part of
getCurrentNotifications = function () {
    let notifications = [];
    let groups = Users.findOne({_id: currentUserId()}).groups;
    for (let i = 0; i < groups.length; i++) {
      notifications = notifications.concat(Notifications.find({groupid : groups[i].groupid}).fetch());
    }
    return notifications;
}

// creates a notification for a sub request
notifySub = function (groupid, subout, outid, dateout) {
  let shift = Shifts.findOne({_id: outid});
  Notifications.insert({'groupid': groupid, 'sender': subout, 'shiftid': outid, 'date': dateout, 
                        'startin': shift.start, 'endin': shift.end, 'type': 'sub', 'seen':[], 'ok':[]});
}

// creates a notification for a shift addition
notifyAdd = function (groupid, subin, inid) {
  let shift = Shifts.findOne({_id: inid});
  Notifications.insert({'groupid': groupid, 'sender': subin, 'shiftid': inid, 'startin': shift.start, 
                        'endin': shift.end, 'type': 'add', 'seen':[], 'ok':[]});
}

// creates a notification for a shift drop
notifyDrop = function (groupid, subout, outid) {
  let shift = Shifts.findOne({_id: outid});
  Notifications.insert({
    'groupid': groupid, 'sender': subout, 'shiftid': outid, 'ok':[],
    'startin': shift.start, 'endin': shift.end, 'type': 'drop', 'seen':[]
  });
}

// creates a notification for a swap request
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

// Finds notifications corresponding to requests by the user
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

// Returns an array with no repeated elements
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

    /* remove all notifications not pertaining to this group*/
    if (copy[i].groupid != getCurrentGroupId()) {
      record.push(i);
    /* pending sub or swap request sent by user*/
    } else if (copy[i].sender == curUser && copy[i].acceptID == undefined && copy[i].type != "drop" && copy[i].type != "add") {
      record.push(i);
    } else if (swapid) {
      let shift = Shifts.findOne({_id: swapid});
      let original = Shifts.findOne({_id: copy[i].shiftid});
      /* pending swap request for someone else*/
      if (indexUser(curUser,shift.users) < 0 && copy[i].acceptID == undefined) {
        record.push(i);
      } 
      /*pending swap request into a shift that you are part of*/
      if (indexUser(curUser, original.users) >= 0 && copy[i].acceptID == undefined) {
        record.push(i);
      }
    } 
    /* employee */
    if (!isCurrentEmployer()) {
      if (copy[i].type == "subcancel" || copy[i].type == "swapcancel") {
        if (copy[i].sender != curUser && copy[i].acceptID != curUser) {
          record.push(i);
        }
      }
      else {
      /*accepted and user is not the sender*/
        if (copy[i].acceptID != undefined && copy[i].sender != curUser)
          record.push(i);
      }
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

