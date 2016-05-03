// returns all the notifications that pertain to that user
Template.notifications.helpers({
	getNotifications : function() {
		let notifArray = getCurrentNotifications();
		notifArray = checkSeen(notifArray);
		console.log(notifArray);
		return notifArray;
	},
	zeroNotification : function() {
		let notifArray = getCurrentNotifications();
		notifArray = checkSeen(notifArray);
		return (notifArray.length == 0);
	},
	isSub : function(type) {
		return (type == "sub");
	},
	isSwap : function(type) {
		return (type == "swap");
	},
	isAdd : function(type) {
		return (type == "add");
	},
	isDrop : function(type) {
		return (type == "drop");
	},
	isEmployer : function() {
		return isCurrentEmployer();
	},
	isCancelSub : function(type) {
		return (type == "subcancel");
	},
	isCancelSwap : function(type) {
		return (type == "swapcancel");
	},
	existAcceptID : function(acceptID) {
		console.log(acceptID);
		if (acceptID == undefined) return false;
		return true;
	}
});

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

Template.cancelSubResponse.events({
	'click .btn-danger' : function (event) {
		let notifID = event.currentTarget.id;
		let seenArray = Notifications.findOne({"_id" : notifID}).ok;
	 	seenArray = seenArray.concat(currentUserId());
	 	Notifications.update({"_id": notifID}, {$set: {"ok": seenArray}});
	}
});

Template.cancelSwapResponse.events({
	'click .btn-danger' : function (event) {
		let notifID = event.currentTarget.id;
		let seenArray = Notifications.findOne({"_id" : notifID}).ok;
	 	seenArray = seenArray.concat(currentUserId());
	 	Notifications.update({"_id": notifID}, {$set: {"ok": seenArray}});
	}
});

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

Template.subRequestResponse.events({
	'click .btn-danger' : function (event) {
		let notifID = event.currentTarget.id;
		let seenArray = Notifications.findOne({"_id" : notifID}).ok;
	 	seenArray = seenArray.concat(currentUserId());
	 	Notifications.update({"_id": notifID}, {$set: {"ok": seenArray}});
	}
});

Template.swapRequestResponse.events({
	'click .btn-danger' : function(event) {
		let notifID = event.currentTarget.id;
		let seenArray = Notifications.findOne({"_id" : notifID}).ok;
	 	seenArray = seenArray.concat(currentUserId());
	 	Notifications.update({"_id": notifID}, {$set: {"ok": seenArray}});
	}
});

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
	 			//Notifications.remove({"_id" : notifID});
	 			Notifications.update({"_id": notifID}, {$set: {"acceptID": swapInId}});
	 		}
	 		else {
	 			addSwap(date, swapInId, swapOutId, shiftId, swapId);
	 			addSwap(swapdate, swapOutId, swapInId, swapId, shiftId);
	 			let noteID = notif.noteid;
	 			Notifications.find({"noteid" : noteID}).forEach(function (notif) {
	 				//Notifications.remove({"_id" : notif._id});
	 				console.log(notif);
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
	 			//Notifications.remove({"_id" : notifID});
	 			Notifications.update({"_id": notifID}, {$set: {"acceptID": swapInId}});
	 		}
	 		else {
	 			addSwap(date, swapInId, swapOutId, shiftId, swapId);
	 			addSwap(swapdate, swapOutId, swapInId, swapId, shiftId);
	 			let noteID = notif.noteid;
	 			Notifications.find({"noteid" : noteID}).forEach(function (notif) {
	 				//Notifications.remove({"_id" : notif._id});
	 				console.log(notif);
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