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
	existAcceptID : function(acceptID) {
		console.log(acceptID);
		if (acceptID == undefined) return false;
		return true;
	}
});

Template.subRequestResponse.helpers({
	userId : function(acceptID) {
		var user = Users.findOne({_id: acceptID});
		return user.username;
	}
});

Template.swapRequestResponse.helpers({
	userId : function(acceptID) {
		var user = Users.findOne({_id: acceptID});
		return user.username;
	}
});

Template.subRequestResponse.events({
	'click .btn-danger' : function (event) {
		let notifID = event.currentTarget.id;
		Notifications.remove({"_id" : notifID});
	}
});

Template.swapRequestResponse.events({
	'click .btn-danger' : function(event) {
		let notifID = event.currentTarget.id;
		Notifications.remove({"_id" : notifID});
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

	 		// check what kind of request it is
	 		if (type == "sub") {
	 			addSwap(date, swapInId, swapOutId, shiftId);
	 			//Notifications.remove({"_id" : notifID});
	 			Notifications.update({"_id": notifID}, {$set: {"acceptID": swapInId}});
	 		}
	 		else {
	 			let swapId = notif.swapid;
	 			let swapdate = notif.swapdate;
	 			addSwap(date, swapInId, swapOutId, shiftId);
	 			addSwap(swapdate, swapOutId, swapInId, swapId);
	 			//let noteID = notif.noteid;
	 			//Notifications.find({"noteid" : noteid}).forEach(function (notif) {
	 				//Notifications.remove({"_id" : notif._id});
	 				Notifications.update({"_id": notifID}, {$set: {"acceptID": swapInId}});
	 			//});
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

	 		// check what kind of request it is
	 		if (type == "sub") {
	 			addSwap(date, swapInId, swapOutId, shiftId);
	 			//Notifications.remove({"_id" : notifID});
	 			Notifications.update({"_id": notifID}, {$set: {"acceptID": swapInId}});
	 		}
	 		else {
	 			let swapId = notif.swapid;
	 			let swapdate = notif.swapdate;
	 			addSwap(date, swapInId, swapOutId, shiftId);
	 			addSwap(swapdate, swapOutId, swapInId, swapId);
	 			//let noteID = notif.noteid;
	 			//Notifications.find({"noteid" : noteID}).forEach(function (notif) {
	 				//Notifications.remove({"_id" : notif._id});
	 				Notifications.update({"_id": notifID}, {$set: {"acceptID": swapInId}});
	 			//});
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