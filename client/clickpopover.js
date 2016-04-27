lastshiftid = "";
swapid = "";
swapstatus = false;
$(document).on("click", "#enrollButton", function (event) {
	var fc = $('.fc');
	$("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end']").popover('hide');
	fc.fullCalendar('refetchEvents');

 	addUserToShift(currentUserId(), lastshiftid);
 });
$(document).on("click", "#dropButton", function () {
	var fc = $('.fc');
	$("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end']").popover('hide');
	removeUserFromShift(currentUserId(), lastshiftid);
});
$(document).on("click", "#swapButton", function () {
	var fc = $('.fc');
	$("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end']").popover('hide');
	fc.fullCalendar('refetchEvents');

	swapid = lastshiftid;
	swapstatus = true;
	alert("Select shifts that you would like to swap with...");
});
$(document).on("click", "#subButton", function () {
  	var fc = $('.fc');
	$("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end']").popover('hide');
	fc.fullCalendar('refetchEvents');
});
$(document).on("click", "#deleteShift", function () {
  	var fc = $('.fc');
	$("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end']").popover('hide');
	fc.fullCalendar('refetchEvents');

	Shifts.remove({'_id':lastshiftid});
});
$(document).on("click", "#currGroup", function () {
  	var fc = $('.fc');
	$("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end']").popover('hide');
	fc.fullCalendar('refetchEvents');
});