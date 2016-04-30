Template.activeRequest.helpers({
	getRequests : function() {
		let notifArray = getCurrentNotifications();
		notifArray = filterRequests(notifArray);
		return notifArray;
	},
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
	isSub : function(type) {
		return (type == "sub");
	},
	isSwap : function(type) {
		return (type == "swap");
	}
});


Template.activeRequest.events({
	'click .btn-danger' : function(event) {
		let notifID = event.currentTarget.id;
	 	Notifications.remove({"_id" : notifID});
	}
})