Template.Home.events({
  // login button in a different place
  'click .caslogin': function(e) {
    e.preventDefault();
    var callback = function loginCallback(error){
        if (error) console.log(error);
    };
    Meteor.loginWithCas([callback]);
    return false;
  }
});

Template.Home.helpers({
  // Returns whether the user has groups
	hasGroups: function() {
		return getCurrentGroupId();
	}
});

