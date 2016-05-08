Template.activeRequest.helpers({
	// Gets all unaccepted requests sent by the user
  getRequests : function() {
		let notifArray = getCurrentNotifications();
		notifArray = filterRequests(notifArray);
		return notifArray;
	},
  // Checks whether there are no active requests to display
	zeroRequest : function() {
		let notifArray = getCurrentNotifications();
		notifArray = filterRequests(notifArray);
		copy = notifArray.slice();
		record = [];
		for (let i = 0; i < copy.length; i++) {
			if (copy[i].type == "add" || copy[i].type == "drop")
				record.push(i);
		}
		for (let i = record.length - 1; i >= 0; i--) {
			copy.splice(record[i], 1);
		}

		return (copy.length == 0);
	},
  // Checks if the request was a sub request
	isSub : function(type) {
		return (type == "sub");
	},
  // Checks if the request was a swap request
	isSwap : function(type) {
		return (type == "swap");
	}
});


Template.activeRequest.events({
  // Removes the request if the user presses the cancel button
	'click .btn-danger' : function(event) {
		let notifID = event.currentTarget.id;
	 	Notifications.remove({"_id" : notifID});
	}
})
