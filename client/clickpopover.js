lastshiftid = "";
swapid = "";
swapstatus = false;
$(document).on("click", "#enrollButton", function () {
 	changeUsersInShift(currentUserId(), lastshiftid);
 });
$(document).on("click", "#dropButton", function () {
	changeUsersInShift(currentUserId(), lastshiftid);
});
$(document).on("click", "#swapButton", function () {
	swapid = lastshiftid;
	swapstatus = true;
	alert("Select shifts that you would like to swap with...");

});
$(document).on("click", "#subButton", function () {
  console.log("sub");
});
