lastshiftid = "";
swapid = "";
swapstatus = false;
$(document).on("click", "#enrollButton", function (event) {
	var fc = $('.fc');
	var user = Users.findOne({username: currentUser()});
    var userid = user._id;
    let currentGroup = user.current;
	$("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end']").popover('hide');
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

	removeUserFromShift(currentUserId(), lastshiftid);
	notifyDrop(currentGroup, userid, lastshiftid);
});
$(document).on("click", "#swapButton", function () {
	var fc = $('.fc');
	$("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end']").popover('hide');
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
	fc.fullCalendar('refetchEvents');

	var moment = findDate(lastshiftid);

	notifySub(currentGroup, userid, lastshiftid, moment);
});
$(document).on("click", "#cancelButton", function () {
  	var fc = $('.fc');
  	var user = Users.findOne({username: currentUser()});
    var userid = user._id;
	$("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end']").popover('hide');
	fc.fullCalendar('refetchEvents');

	var shift = Shifts.findOne({'_id':lastshiftid});
	var swaps = shift.swaps;

	for (let i = 0; i < swaps.length; i++) {
		if (swaps[i].date == findDate(lastshiftid) && (userid == swaps[i].swapin || userid == swaps[i].swapout)) {
			swaps.splice(i, 1);
			Shifts.update({_id: lastshiftid}, {$set: {"swaps": swaps}})
		}
	}
});
$(document).on("click", "#deleteShift", function () {
  	var fc = $('.fc');
	$("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end']").popover('hide');
	fc.fullCalendar('refetchEvents');

	Shifts.remove({'_id':lastshiftid});
});
$(document).on("click", ".currGroup", function () {
  	var fc = $('.fc');
	$("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end']").popover('hide');
	fc.fullCalendar('refetchEvents');
});
