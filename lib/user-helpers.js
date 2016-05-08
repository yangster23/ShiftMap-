// User functions
// The current user's username
currentUser = function () {
  return Meteor.user().profile.name;
}

// Takes a netid, and returns the corresponding _id in Users
idFromName = function (netid) {
  let user = Users.findOne({username: netid});
  // If the user does not exist, inserts them and returns the netid anyways
  if (user == undefined) {
    return Users.insert({username: netid, groups:[]});  
  }
  return user._id;
}

// Takes an _id and returns the username associated with it
nameFromId = function (id) {
  let user = Users.findOne({_id: id});
  return user.username;
}

// Returns the current user's id
currentUserId = function () {
  return idFromName(currentUser());
}

// Takes a groupid, and an array of groupids, and finds the index at which 
// groupid is found. -1 if it is not there
indexGroup = function (groupid, groups) {
  let l = groups.length;
  for (var i = 0; i < l; i++) {
    if (groups[i].groupid == groupid) {
      return i;
    }
  }
  return -1;
}

// Sets the current group of the user to groupid
setCurrentGroup = function (groupid) {
  Users.update({_id: currentUserId()}, {$set: {current: groupid}});
}

// Returns the current group of the current user
getCurrentGroupId = function () {
  let user = Users.findOne({_id: currentUserId()});
  if (user.current) {
    return user.current;
  }
  if (user.groups.length > 0) {
    Users.update({_id: currentUserId()}, {$set: {current: user.groups[0].groupid}}); 
    return user.groups[0].groupid; 
  }
  return undefined; 
}

// Determines if the current user is an employer or not
isCurrentEmployer = function() {
  let employers = Groups.findOne({_id: getCurrentGroupId()}).employers;
  return indexUser(currentUserId(), employers) >= 0;
}

