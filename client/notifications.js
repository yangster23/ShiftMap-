// returns all the notifications that pertain to that user
Template.notifications.helpers({
	getNotifications : function() {
		return getCurrentNotifications();
	},
	zeroNotification : function() {
		return (getCurrentNotifications().length == 0);
	}
});

// the whole backend deal with pressing YES or NO per each notification
Template.notification.events({
		// when the button is a yes
	 'click .btn-success' : function (event) {
	 		let notifID = event.currentTarget.id;
	 		let found = Notifications.find({"_id" : temp});
	 		let type = found.type;

	 		// check what kind of request it is
	 		if (type == "sub") {
	 			let shiftID = found.shiftID;
	 			let send = found.send;
	 			let receive = found.receive;
	 			// from the "send" User, remove that shift
	 			changeUserInShift(send, shiftID);
	 			// for the "receive" User, add him to the shift
	 			changeUserinShift(receive, shiftID);
	 		}
	 		else {
	 			let shiftID = found.shiftID;
	 			let send = found.send;
	 			let receive = found.receive;
	 			let swapID = found.swapID;

	 			// from the "send" User, remove that shift
	 			changeUserInShift(send, shiftID);
	 			// for the "receive" User, add him to the shift
	 			changeUserinShift(receive, shiftID);

	 			// the other way around
	 			changeUserinShift(receive, swapID);
	 			changeUserinShift(send, swapID);
	 		}
	 },

	 // get rid of the notification if the user presses NO
	 'click .btn-danger' : function (event) {
	 		let notifID = event.currentTarget.id;
	 		Notifications.remove({"_id": notifID}); 
	 }
})

// a helper function for debugging purposes
addNotification = function () {
	Notifications.insert({receive : "mjang"});
}