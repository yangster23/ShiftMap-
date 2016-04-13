import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

Users = new Mongo.Collection('Users');
Groups = new Mongo.Collection('Groups');
Shifts = new Mongo.Collection('Shifts');


/**********************************************************************/

// Routing
Router.configure({
  layoutTemplate: 'Layout',
  //waitOn: function() { return Meteor.subscribe("Stuff"); },
});

Router.route('/', function () {
  this.render('Home');
});
Router.route('/employer-form', function () {
  this.render('addForm')
});
Router.route('/help', function () {
  this.render('help')
});
Router.route('/about-us', function () {
  this.render('about-us')
})

/**********************************************************************/
// helper functions

function currentUser() {
  return Meteor.user().profile.name;
}

function idFromName(netid) {
  var user = Users.findOne({username: netid});
  if (user == undefined) {
    return Users.insert({username: netid, groups:[]});
  }
  return user._id;
}

function indexUser(userid, users) {
  // console.log("inside indexUser");
  // console.log(users);
  var l = users.length;
  for (var i = 0; i < l; i++) {
    console.log(i);
    if (users[i].userid == userid) {
      return i;
    }
  }
  console.log("returning -1");
  return -1;
}

// adds cgroupid from the user with userid if it is not there, removes otherwise
function changeGroup(userid, cgroupid) {
  var user = Users.findOne({_id: userid});
  var newgroups = user.groups;
  if (indexUser(userid, newgroups) != -1) {
    newgroups.splice(i,1);
  } else { 
    newgroups.push({"groupid": cgroupid});
  }
  Users.update({_id: userid}, {$set: {groups: newgroups}});
}

// adds cuserid from the group with groupid if it is not there, removes otherwise
function changeUserInGroup(cuserid, groupid) {
  var group = Groups.findOne({_id: groupid});
  var newusers = group.users;
  var i = indexUser(cuserid, newusers);
  if (i >= 0) {
    newusers.splice(i,1);
  } else {
    newusers.push({userid: cuserid});
  }
  Groups.update({_id: groupid}, {$set: {users: newusers}});
}

function changeUserInShift(cuserid, shiftid) {
  var shift = Shifts.findOne({_id: shiftid});
  var newusers = shift.users;
  var i = indexUser(cuserid, newusers);
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
  var length = inputTime.length;
  var copy = "" + inputTime;
  if (length < 7) {
    copy = "0" + copy;
  }
  return copy.substring(6, 8) + copy.substring(0, 6);
}

/**********************************************************************/

tempid = '';
if (Meteor.isClient) {

  Tasks = new Mongo.Collection(null);
  Employees = new Mongo.Collection(null);
  FormShifts = new Mongo.Collection(null);

  Template.Header.helpers({
    getGroups : function (netid) {
      var user = Users.findOne({username: netid});
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
      var user = Users.findOne({username: currentUser()});
      var userid = user._id;
      // returns the current GROUP!
      var currentGroup = user.current;

      if (currentGroup == undefined) {
        currentGroup = user.groups[0].groupid;
        if (currentGroup == undefined) {
          return [];
        }
        Users.update({_id: userid}, {$set: {current: currentGroup}}); // TODO: if the user has no predefined current group
      }

      var today = new Date();
      var currdayofweek = today.getDay();
      var firstday = today.getDate() - currdayofweek;
      var days = [];
      var min = "pm11:59";
      
      for (i = 0; i < 7; ++i) {
        days[i] = {oneday : Shifts.find({groupid: currentGroup, day: i+firstday}), dayOfWeek: i+firstday};

        shifts = days[i].oneday.fetch();
        for (j = 0; j < shifts.length; j++) {
          t = parseTime(shifts[j]);
          if (t < min) {
            min = t;
          }
        }


      } 
      rowId = document.getElementsByClassName("hola");
      console.log(rowId);
      return {week: days, startHour: parseInt(min.substring(2,4))};
    }
  });


  Template.setDay.helpers({
    mapShift : function (start, end, users) {
      var id = idFromName(currentUser());
      var colVal = "";
      if (indexUser(id, users) >= 0) {
        colVal = "red"
      } else {
        colVal = "blue"
      }
      var height = "100";
      var width = "100";
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


  Template.Home.events({
    'click .caslogin': function(e) {
      e.preventDefault();
      var callback = function loginCallback(error){
          if (error) {
            console.log(error);
          }
      };
      Meteor.loginWithCas([callback]);
      return false;
    }
  });

  Template.CasLogin.events({
  /**
   * Handle the click on the logout link.
   * @param e The click event.
   * @returns {boolean} False.
     */
    'click .cas-logout': function(e) {
      Router.go('/');
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
      changeUserInShift(idFromName(currentUser()),event.currentTarget.id);
    }
  });

  Template.addForm.events({
    'submit .new-task' (event) {
      // Prevent default browser form submit
      event.preventDefault();
   
      // Get value from form element
      const target = event.target;
      const text = target.text.value;
   
      // Insert a task into the collection
      if (text != "" && Tasks.find({employer: text}).count() == 0)
        Tasks.insert({employer: text});

      // Clear form
      target.text.value = '';
    },
    'submit .new-employee' (event) {
      // Prevent default browser form submit
      event.preventDefault();
   
      // Get value from form element
      const target = event.target;
      const text = target.text.value;
   
      // Insert a task into the collection
      if (text != "")
        Employees.insert({employee: text});
      // Clear form
      target.text.value = '';
    },

    'submit .new-shift'(event) {

      event.preventDefault();

      start = event.target.start.value;
      end = event.target.end.value;
      capacity = event.target.capacity.value;

      var re = "^(0|1)?[0-9]:[0-5][0-9](am|pm)$"

      if (start.match(re) != null && end.match(re) != null && parseInt(capacity) > 0) {
        FormShifts.insert({"start": start, "end": end, "capacity": capacity});
      }

      event.target.start.value = '';
      event.target.end.value = '';
      event.target.capacity.value = '';

    },

    'click .btn-primary'(event) {
      var groupname = document.getElementById('employmentName').value;
      var repeat = document.getElementById('repeat').checked;
      Tasks.insert({employer: currentUser()});
      var employers = Tasks.find().fetch();
      var shifts = FormShifts.find().fetch();
      
      //console.log(employers);
      //console.log(employees);
      

      // convert employernames to employerids and then adds employerids to employee ids if it's not already there
      for (var i = 0; i < employers.length; i++) {
        if (Employees.find({employee: employers[i].employer}).count() == 0) {
          Employees.insert({employee: employers[i].employer});
        }
      }
      var employees = Employees.find().fetch();

      console.log(employers);
      console.log(employees);

      var employeeids = [];
      var employerids = [];
      console.log("id arrays made")
      console.log(employeeids);
      console.log(employerids);
      for (var i = 0; i < employees.length; i++) {
        employeeid = idFromName(employees[i].employee);
        employeeids.push({"userid": employeeid});
      }
      console.log(employeeids);

      for (var i = 0; i < employers.length; i++) {
        employerid = idFromName(employers[i].employer);
        employerids[i] = {"userid": employerid};
      }

      console.log(employerids);
      var groupid = Groups.insert({"groupname": groupname, "repeat": repeat, "employers": employerids, "users": employeeids});

      // adding the group to each employee
      var l = employeeids.length;
      console.log(employeeids.length);
     
      for (var i = 0; i < employeeids.length; i++) {
        changeGroup(employeeids[i].userid, groupid);
        console.log(i);
        console.log(employeeids.length);
        console.log(i < employeeids.length);
      }
      console.log("groups added");
      // adding the shifts to the Shifts collection
      for (var i = 0; i < shifts.length; i++) { 
        var today = new Date();
        Shifts.insert({"groupid" : groupid, "start" : shifts[i].start, "end" : shifts[i].end, "capacity" : shifts[i].capacity, "users" : [], day : today.getDate()});
      }

      Tasks.remove({});
      Employees.remove({});
      FormShifts.remove({});

      Router.go('/');
    }
  });

  Template.addForm.helpers({
    tasks() {
      return Tasks.find({});
    },
    employees() {
      return Employees.find({});
    },
    formShifts() {
      return FormShifts.find({});
    }
  }); 

  Template.task.events({
    'click .delete'() {
      Tasks.remove(this._id);
    },
  });

  Template.employee.events({
    'click .delete'() {
      Employees.remove(this._id);
    },
  });

  Template.shift.events({
    'click .delete'() {
      FormShifts.remove(this._id);
    },
  });

}


if (Meteor.isServer) {

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
}
