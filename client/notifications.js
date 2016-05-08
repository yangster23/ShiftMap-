// returns all the notifications that pertain to that user
Template.notifications.helpers({
	// Returns relevant notifications for a user
  getNotifications : function() {
		let notifArray = getCurrentNotifications();
		return checkSeen(notifArray);
	},
  // Checks if there are no notifications for a user
	zeroNotification : function() {
		let notifArray = getCurrentNotifications();
		return (checkSeen(notifArray.length) == 0);
	},
  // Checks if it is a sub notification
	isSub : function(type) {
		return (type == "sub");
	},
  // Checks if it is a swap notification
	isSwap : function(type) {
		return (type == "swap");
	},
  // Checks if it is an add notification
	isAdd : function(type) {
		return (type == "add");
	},
  // Checks if it is a drop notification
	isDrop : function(type) {
		return (type == "drop");
	},
  // Returns whether the current user is an employer
	isEmployer : function() {
		return isCurrentEmployer();
	},
  // Checks if it is a sub cancellation notification
	isCancelSub : function(type) {
		return (type == "subcancel");
	},
  // Checks if it is a swap cancellation notification
	isCancelSwap : function(type) {
		return (type == "swapcancel");
	},
  // Checks if the acceptID exists 
	existAcceptID : function(acceptID) {
		if (acceptID == undefined) return false;
		return true;
	}
});

// Helpers to retrieve display information
Template.cancelSubResponse.helpers({
	idOfAccepter : function(acceptID) {
		var user = Users.findOne({_id: acceptID});
		return user.username;
	},
	idOfSender : function(sender) {
		var user = Users.findOne({_id: sender});
		return user.username;
	},
	getGroupName : function(groupid) {
		return Groups.findOne({_id: groupid}).groupname;
	}
});

// Helpers to retrieve display information
Template.cancelSwapResponse.helpers({
	idOfAccepter : function(acceptID) {
		var user = Users.findOne({_id: acceptID});
		return user.username;
	},
	idOfSender : function(sender) {
		var user = Users.findOne({_id: sender});
		return user.username;
	},
	getGroupName : function(groupid) {
		return Groups.findOne({_id: groupid}).groupname;
	}
});

// Hides notification after user sees it
Template.cancelSubResponse.events({
	'click .btn-danger' : function (event) {
		let notifID = event.currentTarget.id;
		let seenArray = Notifications.findOne({"_id" : notifID}).ok;
	 	seenArray = seenArray.concat(currentUserId());
	 	Notifications.update({"_id": notifID}, {$set: {"ok": seenArray}});
	}
});

// Hides notification after user sees it
Template.cancelSwapResponse.events({
	'click .btn-danger' : function (event) {
		let notifID = event.currentTarget.id;
		let seenArray = Notifications.findOne({"_id" : notifID}).ok;
	 	seenArray = seenArray.concat(currentUserId());
	 	Notifications.update({"_id": notifID}, {$set: {"ok": seenArray}});
	}
});

// Helpers to retrieve information to display
Template.subRequestResponse.helpers({
	idOfAccepter : function(acceptID) {
		var user = Users.findOne({_id: acceptID});
		return user.username;
	},
	idOfSender : function(sender) {
		var user = Users.findOne({_id: sender});
		return user.username;
	},
	getGroupName : function(groupid) {
		return Groups.findOne({_id: groupid}).groupname;
	}
});

// Helpers to retrieve information to display
Template.swapRequestResponse.helpers({
	idOfAccepter : function(acceptID) {
		var user = Users.findOne({_id: acceptID});
		return user.username;
	},
	idOfSender : function(sender) {
		var user = Users.findOne({_id: sender});
		return user.username;
	},
	getGroupName : function(groupid) {
		return Groups.findOne({_id: groupid}).groupname;
	}
});

// Hides notification when pressed
Template.subRequestResponse.events({
	'click .btn-danger' : function (event) {
		let notifID = event.currentTarget.id;
		let seenArray = Notifications.findOne({"_id" : notifID}).ok;
	 	seenArray = seenArray.concat(currentUserId());
	 	Notifications.update({"_id": notifID}, {$set: {"ok": seenArray}});
	}
});

// Hides notification when pressed
Template.swapRequestResponse.events({
	'click .btn-danger' : function(event) {
		let notifID = event.currentTarget.id;
		let seenArray = Notifications.findOne({"_id" : notifID}).ok;
	 	seenArray = seenArray.concat(currentUserId());
	 	Notifications.update({"_id": notifID}, {$set: {"ok": seenArray}});
	}
});

// For an add/drop notification, gets important information to display to the user
Template.addNotification.helpers({
	idOfSender : function(sender) {
		var user = Users.findOne({_id: sender});
		return user.username;
	},
	isRepeating : function(shiftid) {
		var shift = Shifts.findOne({_id: shiftid});
		if (shift.weekday) return "repeating";
		return "";
	},
	formatDate : function(shiftid) {
		return findDate(shiftid);
	},
	getGroupName : function(groupid) {
		return Groups.findOne({_id: groupid}).groupname;
	}
});

Template.dropNotification.helpers({
	idOfSender : function(sender) {
		var user = Users.findOne({_id: sender});
		return user.username;
	},
	isRepeating : function(shiftid) {
		var shift = Shifts.findOne({_id: shiftid});
		if (shift.weekday) return "repeating";
		return "";
	},
	formatDate : function(shiftid) {
		return findDate(shiftid);
	},
	getGroupName : function(groupid) {
		return Groups.findOne({_id: groupid}).groupname;
	}
});

// These hide notifications after they are seen
Template.addNotification.events({
	'click .btn-danger' : function (event) {
		let notifID = event.currentTarget.id;
		let seenArray = Notifications.findOne({"_id" : notifID}).ok;
	 	seenArray = seenArray.concat(currentUserId());
	 	Notifications.update({"_id": notifID}, {$set: {"ok": seenArray}});
	}
});

Template.dropNotification.events({
	'click .btn-danger' : function(event) {
		let notifID = event.currentTarget.id;
		let seenArray = Notifications.findOne({"_id" : notifID}).ok;
	 	seenArray = seenArray.concat(currentUserId());
	 	Notifications.update({"_id": notifID}, {$set: {"ok": seenArray}});
	}
});

// These display the groupname for sub/swap notifications
Template.subNotification.helpers({
	getGroupName : function(groupid) {
		return Groups.findOne({_id: groupid}).groupname;
	}
});

Template.swapNotification.helpers({
	getGroupName : function(groupid) {
		return Groups.findOne({_id: groupid}).groupname;
	}
});

// the whole backend deal with pressing YES or NO per each notification
Template.subNotification.events({
		// when the button is a yes
	 'click .btn-success' : function (event) {
	 		let notifID = event.currentTarget.id;
	 		let notif = Notifications.findOne({"_id" : notifID});
	 		let type = notif.type;
	 		let swapInId = currentUserId();
	 		let swapOutId = notif.sender;
	 		let shiftId = notif.shiftid;
	 		let date = notif.date;

	 		let swapId = notif.swapid;
	 		let swapdate = notif.swapdate;

	 		// check what kind of request it is
	 		if (type == "sub") {
	 			addSwap(date, swapInId, swapOutId, shiftId, swapId);
	 			Notifications.update({"_id": notifID}, {$set: {"acceptID": swapInId}});
	 		}
	 		else {
	 			addSwap(date, swapInId, swapOutId, shiftId, swapId);
	 			addSwap(swapdate, swapOutId, swapInId, swapId, shiftId);
	 			let noteID = notif.noteid;
	 			Notifications.find({"noteid" : noteID}).forEach(function (notif) {
	 				if (notif._id == notifID)
	 					Notifications.update({"_id": notif._id}, {$set: {"acceptID": swapInId}});
	 				else
	 					Notifications.remove({"_id" : notif._id});
	 			});
	 		}
	 		let seenArray = Notifications.findOne({"_id" : notifID}).seen;
	 		seenArray = seenArray.concat(currentUserId());
	 		Notifications.update({"_id": notifID}, {$set: {"seen": seenArray}});
	 },

	 // get rid of the notification for that user if the user presses NO
	 'click .btn-danger' : function (event) {
	 		let notifID = event.currentTarget.id;
	 		let seenArray = Notifications.findOne({"_id" : notifID}).seen;
	 		seenArray = seenArray.concat(currentUserId());
	 		Notifications.update({"_id": notifID}, {$set: {"seen": seenArray}});
	 }
});

Template.swapNotification.events({
	  // when the button is a yes
	  'click .btn-success' : function (event) {
	 		let notifID = event.currentTarget.id;
	 		let notif = Notifications.findOne({"_id" : notifID});
	 		let type = notif.type;
	 		let swapInId = currentUserId();
	 		let swapOutId = notif.sender;
	 		let shiftId = notif.shiftid;
	 		let date = notif.date;

	 		let swapId = notif.swapid;
	 		let swapdate = notif.swapdate;

	 		// check what kind of request it is
	 		if (type == "sub") {
	 			addSwap(date, swapInId, swapOutId, shiftId, swapId);
	 			Notifications.update({"_id": notifID}, {$set: {"acceptID": swapInId}});
	 		}
	 		else {
	 			addSwap(date, swapInId, swapOutId, shiftId, swapId);
	 			addSwap(swapdate, swapOutId, swapInId, swapId, shiftId);
	 			let noteID = notif.noteid;
	 			Notifications.find({"noteid" : noteID}).forEach(function (notif) {
	 				if (notif._id == notifID)
	 					Notifications.update({"_id": notif._id}, {$set: {"acceptID": swapInId}});
	 				else
	 					Notifications.remove({"_id" : notif._id});
	 			});
	 		}
	 		let seenArray = Notifications.findOne({"_id" : notifID}).seen;
	 		seenArray = seenArray.concat(currentUserId());
	 		Notifications.update({"_id": notifID}, {$set: {"seen": seenArray}});
	 },

	 // get rid of the notification for that user if the user presses NO
	 'click .btn-danger' : function (event) {
	 		let notifID = event.currentTarget.id;
	 		let seenArray = Notifications.findOne({"_id" : notifID}).seen;
	 		seenArray = seenArray.concat(currentUserId());
	 		Notifications.update({"_id": notifID}, {$set: {"seen": seenArray}});
	 }
});
