import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

Users = new Mongo.Collection('Users');
Groups = new Mongo.Collection('Groups');
Shifts = new Mongo.Collection('Shifts');

//import './shiftmap.html';
/**********************************************************************/

// Routing
Router.configure({
  layoutTemplate: 'Layout',
  //waitOn: function() { return Meteor.subscribe("Stuff"); },
});

Router.route('/', function () {
  this.render('Home');
});
Router.route('/calendar', function () {
  this.render('calendar');
})

/**********************************************************************/
// helper functions

function currentUser() {
  return Meteor.user().profile.name;
}

function idFromName(netid) {
  user = Users.findOne({username: netid});
  return user._id;
}

function indexUser(userid, users) {
  for (i = 0; i < users.length; ++i) {
    if (users[i].userid == userid) {
      return i;
    }
  }
  return -1;
}

// adds cgroupid from the user with userid if it is not there, removes otherwise
function changeGroup(userid, cgroupid) {
  user = Users.findOne({_id: userid});
  newgroups = user.groups;
  for (i = 0; i < newgroups.length; ++i) {
    if (newgroups[i].groupid == cgroupid) {
      newgroups.splice(i, 1);
      Users.update({_id: userid}, {$set: {groups: newgroups}});
      return;
    }
  }
  newgroups.push({groupid: cgroupid});
  Users.update({_id: netid}, {$set: {groups: newgroups}});
}

// adds cuserid from the group with groupid if it is not there, removes otherwise
function changeUserInGroup(cuserid, groupid) {
  group = Groups.findOne({_id: groupid});
  newusers = group.users;
  i = indexUser(cuserid, newusers);
  if (i >= 0) {
    newusers.splice(i,1);
  } else {
    newusers.push({userid: cuserid});
  }
  Groups.update({_id: groupid}, {$set: {users: newusers}});
}

function changeUserInShift(cuserid, shiftid) {
  shift = Shifts.findOne({_id: shiftid});
  newusers = shift.users;
  i = indexUser(cuserid, newusers);
  console.log(i);
  if (i >= 0){
    newusers.splice(i,1);
  } else {
    newusers.push({userid: cuserid});
  }
  Shifts.update({_id: shiftid}, {$set: {users: newusers}});
}

// takes in a inputTime of the form hour:minuteam/pm and then converts
// it to am/pmHH:mm 
function parseTime(inputTime) {
  length = inputTime.length;
  copy = "" + inputTime;
  if (length < 7) {
    copy = "0" + copy;
  }
  meridiem = copy.substring(6, 8);
  return (meridiem + copy.substring(0, 6));
}

/**********************************************************************/

tempid = '';
if (Meteor.isClient) {
  Template.Header.helpers({
    getGroups : function (netid) {
      user = Users.findOne({username: netid});
      // console.log(user);
      if (user == undefined) {
        Users.insert({username: netid, groups:[]});
        return [];
      }
      // console.log(netid + ' added');
      return user.groups;
    },
    getGroupName : function (groupid) {
      return Groups.findOne({_id: groupid}).groupname;
    }
  });
  
  Template.Header.events({
    'click .groupElement' : function (event) {
      id = event.currentTarget.id;
      userid = idFromName(currentUser())
      // console.log(this.groupid);
      // TODO: Changes current calendar to the group with _id id.
      Users.update({_id: userid}, {$set: {current: id}});
    },
    'click .newGroup' : function (event) {
      // TODO: Something that adds a group, with this person as admin.
    }
  });

  Template.calendar.helpers({
    /*getDays : function () {
      group = Groups.findOne();
      console.log(group)
      console.log(Groups.find().count())
      if (group) {
        tempid = group._id;
        return group.days;
      }
    },*/

    // retrieve the current group's shifts in an array for the week
    getDays : function () {
      user = Users.findOne({username: currentUser()});
      userid = user._id;
      // returns the current GROUP!
      currentGroup = user.current;

      if (currentGroup == undefined) {
        currentGroup = user.groups[0].groupid;
        if (currentGroup == undefined) {
          return [];
        }
        Users.update({_id: userid}, {$set: {current: currentGroup}}); // TODO: if the user has no predefined current group
      }

      today = new Date();
      currdayofweek = today.getDay();
      firstday = today.getDate() - currdayofweek;
      days = [];
      min = "pm11:59";
      
      for (i = 0; i < 7; ++i) {
        days[i] = {oneday : Shifts.find({groupid: currentGroup, day: i+firstday})};

        shifts = days[i].oneday.fetch();
        for (j = 0; j < shifts.length; j++) {
          t = parseTime(shifts[j]);
          if (t < min) {
            min = t;
          }
        }


      } 
      return {week: days, startHour: parseInt(min.substring(2,4))};
    }
  });

  Template.setDay.helpers({
    mapShift : function (start, end, users) {
      id = idFromName(currentUser());
      if (indexUser(id, users) >= 0) {
        colVal = "red"
      } else {
        colVal = "blue"
      }
      height = "100";
      width = "100";
      return "style=\"color: " + colVal + ";height:" + height + ";width:" + width + "\"";
    }
    
  });

  /*Template.calendar.events({
    'click button' : function (event) {
      id = event.currentTarget.id;
      console.log(id);
      if (id == "erase") Groups.remove(tempid);
      if (id == "add") {
        tempid = Groups.insert({start: 9, end: 17, admin: 'hello', 
          days: [
          {day: "sun", shift: [{day: "sun", startS: 10, endS: 11, names: [], max: "10"}, {day: "sun", startS: 11, endS: 12, names: [], max: "10"}, {day: "sun", startS: 13, endS: 14, names: [], max: "10"}]},
          {day: "mon", shift: []},
          {day: "tue", shift: []},
          {day: "wed", shift: []},
          {day: "thu", shift: []},
          {day: "fri", shift: []},
          {day: "sat", shift: []}]
        });
      }
    }
  }); */

  Template.CasLogin.events({

  /**
   * Handle the click on the logout link.
   * @param e The click event.
   * @returns {boolean} False.
   */
  'click .cas-logout': function(e) {
    e.preventDefault();
    Meteor.logout();
    return false;
  },

  /**
   * Handle the click on the login link.
   * @param e The click event.
   * @returns {boolean} False.
   */
  'click .cas-login': function(e) {
    e.preventDefault();
    var callback = function loginCallback(error){
      if (error) {
        console.log(error);
      }
    };
    Meteor.loginWithCas([callback]);
    // console.log('login success');
    return false;
  }
});

  Template.setDay.events({
    'click button' : function (event) {

      id = event.currentTarget.id;
      userid = idFromName(currentUser());
      changeUserInShift(userid, id);
      /* shift = Shifts.findOne({_id: id})


      dayArray = Groups.findOne().days;
      startTime = id.slice(3,5);
      endTime = id.slice(5,7);

      if (id.slice(0,3) == "sun") {
        array = dayArray[0].shift;
        for (i = 0; i < array.length; i++) {
          if (array[i].startS == startTime && array[i].endS == endTime) {
            if (array[i].names.length >= 1) {
              document.getElementById(id).style.color = "blue";
              array[i].names = [];
            }
            else {
              array[i].names = ["Hello"];
              document.getElementById(id).style.color = "red";
            }
          }
        }
      }*/
      


    }
  });
}


if (Meteor.isServer) {

  Groups.allow({
    'update': function() {
      return true;
    },
    'insert': function() {
      return true;
    },
    'remove': function() {
      return true;
    }
  });

  Users.allow({
    'update': function() {
      return true;
    },
    'insert': function() {
      return true;
    },
    'remove': function() {
      return true;
    }
  });

  Shifts.allow({
    'update': function() {
      return true;
    },
    'insert': function() {
      return true;
    },
    'remove': function() {
      return true;
    }
  });
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
