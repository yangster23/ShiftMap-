/* allow.js
 * Allows changes to occur which begin on the client side.
 * ie user changes shifts
 */

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
  'remove': function() {return true;}
});

Notifications.allow({
  'update': function() {return true;},
  'insert': function() {return true;},
  'remove': function() {return true;}
});

