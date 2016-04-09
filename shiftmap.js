import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

Users = new Mongo.Collection('Users');
Groups = new Mongo.Collection('Groups');
Shifts = new Mongo.Collection('Shifts');

//import './shiftmap.html';

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

//each group is one document

/*tempId = Groups.insert({start: 9, end: 17, admin: 'hello', 
  days: [
  {day: "sun", shift: [{day: "sun", startS: 10, endS: 11, names: [], max: "10"}, {day: "sun", startS: 11, endS: 12, names: [], max: "10"}, {day: "sun", startS: 13, endS: 14, names: [], max: "10"}]},
  {day: "mon", shift: []},
  {day: "tue", shift: []},
  {day: "wed", shift: []},
  {day: "thu", shift: []},
  {day: "fri", shift: []},
  {day: "sat", shift: []}]
});*/

// adds cgroupid from the user with userid if it is not there, removes otherwise
/*function changeGroup(userid, cgroupid) {
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
function changeUser(cuserid, groupid) {
  group = Groups.findOne({_id: groupid});
  newusers = group.users;
  for (i = 0; i < newusers.length; ++i) {
    if (newusers[i].userid == cnetid) {
      newusers.splice(i,1);
      Groups.update({_id: groupid}, {$set: {users: newusers}}});
      return;
    }
  }
  newusers.push({userid: cuserid});
  Groups.update({_id: groupid}, {$set: {users: newusers}});
}*/

tempid = '';
if (Meteor.isClient) {
 // Session.set('currentGroup',Users.findOne({currentUser.profile.name));// TODO

  Template.Header.helpers({
    getGroups : function (netid) {
      user = Users.findOne({username: netid});
      //console.log(user);
      if (user == undefined) {
        Users.insert({username: netid, groups:[]});
        return [];
      }
      console.log(netid + ' added');
      return user.groups;
    },
    getGroupName : function (groupid) {
     
      return Groups.findOne({_id: groupid}).groupname;
    }
  });
  
  Template.Header.events({
    'click .groupElement' : function (event) {
      id = event.currentTarget.id;
      console.log(this.groupid);
      // TODO: Changes current calendar to the group with _id id.
      Users.update({username: currentUser.profile.name}, {$set: {current: this.groupid}});
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
    getDays : function () {
      today = new Date();
      currdayofweek = today.getDay();
      firstday = today.getDate() - currdayofweek;
      days = [];
      for (i = 0; i < 7; ++i) {
        days[i] = {oneday : Shifts.find({day: i+firstday})};
      }
      
      return days;
    }
  });

  Template.setDay.helpers({
    mapShift : function (start, end, names) {
      height = 100;
      width = "100";
      if (names.length >= 1) colVal = "red";
      else colVal = "blue";
      return "style=\"color: " + colVal + ";height:" + height + "px;width:" + width + "px\"";
    }
    
  });

  Template.calendar.events({
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
  });

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
      }
      Groups.update(tempid,{$set: {days: [{days:"sun", shift: array}, dayArray[1], dayArray[2], dayArray[3], dayArray[4], dayArray[5], dayArray[6]]}});
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
  })


  Meteor.startup(function () {
    // code to run on server at startup
  });
}
