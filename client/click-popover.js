/* click-popover.js
 * governs the behavior of different buttons in popovers for shifts
 */
// The id of the last shift pressed
lastshiftid = "";
// id of the shift the user is trying to swap
swapid = "";
// whether the user is currently swapping
swapstatus = false;

// Closes popovers after buttons pressed
let clickpopover = function (p) {
 	$("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end']").popover('hide');
	$("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end fc-short']").popover('hide');
	$("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end transparent-event']").popover('hide');
	$("[class='fc-time-grid-event fc-v-event fc-event fc-start fc-end transparent-event fc-short']").popover('hide');
}

// Button enroll
$(document).on("click", "#enrollButton", function (event) {
	let fc = $('.fc');
	let user = Users.findOne({username: currentUser()});
  let userid = user._id;
  let currentGroup = user.current;
  clickpopover(this);
	fc.fullCalendar('refetchEvents');
  
  // Adds user to shift, creates notification
 	addUserToShift(currentUserId(), lastshiftid);
 	notifyAdd(currentGroup, userid, lastshiftid);
});

// Button drop
$(document).on("click", "#dropButton", function () {
	let fc = $('.fc');
	let user = Users.findOne({username: currentUser()});
  let userid = user._id;
  let currentGroup = user.current;
  clickpopover(this);

  // Removes user from shift
	removeUserFromShift(currentUserId(), lastshiftid);
	notifyDrop(currentGroup, userid, lastshiftid);
});

// Button swap
$(document).on("click", "#swapButton", function () {
	let fc = $('.fc');
	clickpopover(this);
  fc.fullCalendar('refetchEvents');

  // saves this shift, and moves to swap mode
	swapid = lastshiftid;
	swapstatus = true;
	alert("Select a shift that you would like to swap with...");
});

// Button sub
$(document).on("click", "#subButton", function () {
  let fc = $('.fc');
  let user = Users.findOne({username: currentUser()});
  let userid = user._id;
  let currentGroup = user.current;
	clickpopover(this);
  fc.fullCalendar('refetchEvents');

	let moment = findDate(lastshiftid);

	notifySub(currentGroup, userid, lastshiftid, moment);
});

// Button cancel
$(document).on("click", "#cancelButton", function () {
  let fc = $('.fc');
  let user = Users.findOne({username: currentUser()});
  let userid = user._id;
  let currentGroup = user.current;

	let shift = Shifts.findOne({'_id':lastshiftid});
	let swaps = shift.swaps;

	let otherShiftId = "";
	let notifarray = [];
  
  // Removes the sub/swap
	for (let i = 0; i < swaps.length; i++) {
		if (swaps[i].date == findDate(lastshiftid) && (userid == swaps[i].swapin || userid == swaps[i].swapout)) {
			otherShiftId = swaps[i].swapid;
      let otherUserId = "";
			if (userid == swaps[i].swapin) otherUserId = swaps[i].swapout;
			else otherUserId = swaps[i].swapin;
			notifarray = Notifications.find({"groupid": currentGroup, "date": swaps[i].date, "shiftid": lastshiftid, "sender": userid, "acceptID": otherUserId}).fetch();
			notifarray = notifarray.concat(Notifications.find({"groupid": currentGroup, "date": swaps[i].date, "shiftid": lastshiftid, "sender": otherUserId, "acceptID": userid}).fetch());
			swaps.splice(i, 1);
			Shifts.update({_id: lastshiftid}, {$set: {"swaps": swaps}})
		}
	}

	let type = "subcancel";
  // If the cancel was a swap, removes other end of swap
	if (otherShiftId != undefined) {
		type = "swapcancel"
		let otherShift = Shifts.findOne({'_id':otherShiftId});
		let otherSwaps = otherShift.swaps;

		for (let i = 0; i < otherSwaps.length; i++) { 
			if (otherSwaps[i].date == findDate(otherShiftId) && (userid == otherSwaps[i].swapin || userid == otherSwaps[i].swapout)) {
				notifarray = notifarray.concat(Notifications.find({"groupid": currentGroup, "date": otherSwaps[i].date, "shiftid": otherShiftId, "sender": otherUserId, "acceptID": userid}).fetch());
				notifarray = notifarray.concat(Notifications.find({"groupid": currentGroup, "date": otherSwaps[i].date, "shiftid": otherShiftId, "sender": userid, "acceptID": otherUserId}).fetch());
				otherSwaps.splice(i, 1);
				Shifts.update({_id: otherShiftId}, {$set: {"swaps": otherSwaps}})
			}
		}
	}
  // Notifies cancellation
  for (let i = 0; i < notifarray.length; i++) {
  	if (notifarray[i].type == "subcancel" || notifarray[i].type == "swapcancel") continue;
  	Notifications.update({"_id": notifarray[i]._id}, {$set: {'type': type, 'seen': [], 'ok': []}});
	}

  clickpopover(this);
	fc.fullCalendar('refetchEvents');
});

// Button delete shift
$(document).on("click", "#deleteShift", function () {
  let fc = $('.fc');
	clickpopover(this);
  fc.fullCalendar('refetchEvents');
	removeShift(lastshiftid);
});

// When the popover loses too much focus, closes it
$(document).on("mouseover", function (event) {
	var fc = $('.fc');
	if (String($(event.toElement).prop('outerHTML')).indexOf("body") != -1) return;
  if(String($(event.toElement).prop('outerHTML')).indexOf("class=\"fc-next-button") != -1 
     || String($(event.toElement).prop('outerHTML')).indexOf("class=\"fc-prev-button") != -1) {
	  clickpopover(this);
    fc.fullCalendar('refetchEvents');
	}
	if(String($(event.toElement).prop('outerHTML')).indexOf("class=\"fc-today-button") != -1 ) {
    clickpopover(this);
		fc.fullCalendar('refetchEvents');
	}
});





