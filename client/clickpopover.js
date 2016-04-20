lastshiftid = "";
swapid = "";
swapstatus = false;
$(document).on("click", "#enrollButton", function (event) {
 	changeUserInShift(currentUserId(), lastshiftid);
 	console.log(lastshiftid);
 	$(lastshiftid).popover('hide');
 });
$(document).on("click", "#dropButton", function () {
	changeUserInShift(currentUserId(), lastshiftid);
	$(lastshiftid).popover('hide');
});
$(document).on("click", "#swapButton", function () {
	swapid = lastshiftid;
	swapstatus = true;
	$(lastshiftid).popover('hide');
	alert("Select shifts that you would like to swap with...");
});
$(document).on("click", "#subButton", function () {
  console.log("sub");
  $(lastshiftid).popover('hide');
});
