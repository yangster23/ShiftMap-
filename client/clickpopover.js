lastshiftid = "";
swapid = "";
swapstatus = false;
$(document).on("click", "#enrollButton", function (event) {
	var fc = $('.fc');
	var user = Users.findOne({username: currentUser()});
    var userid = user._id;
    let currentGroup = user.current;
	$("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end']").popover('hide');
	$("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end transparent-event']").popover('hide');
	fc.fullCalendar('refetchEvents');

 	addUserToShift(currentUserId(), lastshiftid);
 	notifyAdd(currentGroup, userid, lastshiftid);
 });
$(document).on("click", "#dropButton", function () {
	var fc = $('.fc');
	var user = Users.findOne({username: currentUser()});
    var userid = user._id;
    let currentGroup = user.current;
	$("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end']").popover('hide');
	$("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end transparent-event']").popover('hide');

	removeUserFromShift(currentUserId(), lastshiftid);
	notifyDrop(currentGroup, userid, lastshiftid);
});
$(document).on("click", "#swapButton", function () {
	var fc = $('.fc');
	$("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end']").popover('hide');
	$("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end transparent-event']").popover('hide');
	fc.fullCalendar('refetchEvents');

	swapid = lastshiftid;
	swapstatus = true;
	alert("Select a shift that you would like to swap with...");
});
$(document).on("click", "#subButton", function () {
  	var fc = $('.fc');
  	var user = Users.findOne({username: currentUser()});
    var userid = user._id;
    let currentGroup = user.current;
	$("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end']").popover('hide');
	$("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end transparent-event']").popover('hide');
	fc.fullCalendar('refetchEvents');

	var moment = findDate(lastshiftid);

	notifySub(currentGroup, userid, lastshiftid, moment);
});
$(document).on("click", "#cancelButton", function () {
  	var fc = $('.fc');
  	var user = Users.findOne({username: currentUser()});
    var userid = user._id;
    let currentGroup = user.current;

	var shift = Shifts.findOne({'_id':lastshiftid});
	var swaps = shift.swaps;

	var otherShiftId = "";
	var notifarray = [];

	for (let i = 0; i < swaps.length; i++) {
		if (swaps[i].date == findDate(lastshiftid) && (userid == swaps[i].swapin || userid == swaps[i].swapout)) {
			otherShiftId = swaps[i].swapid;
			if (userid == swaps[i].swapin) var otherUserId = swaps[i].swapout;
			else otherUserId = swaps[i].swapin;
			notifarray = Notifications.find({"groupid": currentGroup, "date": swaps[i].date, "shiftid": lastshiftid, "sender": userid, "acceptID": otherUserId}).fetch();
			swaps.splice(i, 1);
			Shifts.update({_id: lastshiftid}, {$set: {"swaps": swaps}})
		}
	}

	var otherShift = Shifts.findOne({'_id':otherShiftId});
	var otherSwaps = otherShift.swaps;

	for (let i = 0; i < otherSwaps.length; i++) {
		if (otherSwaps[i].date == findDate(otherShiftId) && (userid == otherSwaps[i].swapin || userid == otherSwaps[i].swapout)) {
			notifarray = notifarray.concat(Notifications.find({"groupid": currentGroup, "date": otherSwaps[i].date, "shiftid": otherShiftId, "sender": otherUserId, "acceptID": userid}).fetch());
			otherSwaps.splice(i, 1);
			Shifts.update({_id: otherShiftId}, {$set: {"swaps": otherSwaps}})
		}
	}

  	for (let i=0; i < notifarray.length; i++) {
  		Notifications.remove({"_id": notifarray[i]._id})
	}
	$("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end']").popover('hide');
	$("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end transparent-event']").popover('hide');
	fc.fullCalendar('refetchEvents');
});
$(document).on("click", "#deleteShift", function () {
  	var fc = $('.fc');
	$("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end']").popover('hide');
	$("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end transparent-event']").popover('hide');
	fc.fullCalendar('refetchEvents');

	Shifts.remove({'_id':lastshiftid});
});

$(document).on("click", function (event) {
	var fc = $('.fc');
	console.log(event.toElement);
  	if(String($(event.toElement).prop('outerHTML')).indexOf("class=\"popover-content\"") == -1 && String($(event.toElement).prop('outerHTML')).indexOf("class=\"fc-bg\"") == -1) {
  		$("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end']").popover('hide');
		$("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end transparent-event']").popover('hide');
		fc.fullCalendar('refetchEvents');
	}
});

$(document).on("mouseover", function (event) {
	var fc = $('.fc');
	if (String($(event.toElement).prop('outerHTML')).indexOf("body") != -1) return;
  	if(String($(event.toElement).prop('outerHTML')).indexOf("class=\"fc-next-button") != -1 || String($(event.toElement).prop('outerHTML')).indexOf("class=\"fc-prev-button") != -1) {
  		$("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end']").popover('hide');
		$("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end transparent-event']").popover('hide');
		fc.fullCalendar('refetchEvents');
	}
	if(String($(event.toElement).prop('outerHTML')).indexOf("class=\"fc-today-button") != -1 ) {
  		$("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end']").popover('hide');
		$("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end transparent-event']").popover('hide');
		fc.fullCalendar('refetchEvents');
	}
});





