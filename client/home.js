
Template.Home.events({
  'click .caslogin': function(e) {
    e.preventDefault();
    var callback = function loginCallback(error){
        if (error) console.log(error);
    };
    Meteor.loginWithCas([callback]);
    return false;
  }
});

