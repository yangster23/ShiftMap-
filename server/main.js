
Groups.allow({
  'update': function() {return true;},
  'insert': function() {return true;},
  'remove': function() {return true;}
});

Users.allow({
  'update': function() {return true;},
  'insert': function() {return true;},
  'remove': function() {return true;}
});

Shifts.allow({
  'update': function() {return true;},
  'insert': function() {return true;},
  'remove': function() {return true;
  }
});

Meteor.startup(function () {
  // code to run on server at startup
});
