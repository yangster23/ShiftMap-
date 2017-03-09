
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

Notifications.allow({
  'update': function() {return true;},
  'insert': function() {return true;},
  'remove': function() {return true;
  }
});

//this is only necessary if you don't want to provide shifts that fit inside interval [start, end]
/*Meteor.publish('events', function (start, end) {
    return Events.find({
        $or: [
            {date: {$gte: start}},
            {date: {$lte: end}}
        ]
    });
});*/

Meteor.startup(function () {
  // code to run on server at startup
});
