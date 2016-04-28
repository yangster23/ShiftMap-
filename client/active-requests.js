Template.activeRequest.helpers({
	getRequests : function() {
		let notifArray = getCurrentNotifications();
		notifArray = filterRequests(notifArray);
		return notifArray;
	},
	zeroRequest : function() {
		let notifArray = getCurrentNotifications();
		notifArray = filterRequests(notifArray);
		return (notifArray.length == 0);
	},
	isSub : function(type) {
		return (type == "sub");
	}
});


Template.activeRequest.events({
	'click .btn-danger' : function(event) {
		let notifID = event.currentTarget.id;
	 	Notifications.remove({"_id" : notifID});
	}
})