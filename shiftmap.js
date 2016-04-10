import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

Groups = new Mongo.Collection('Groups');
export const Tasks = new Mongo.Collection('tasks');
export const Employees = new Mongo.Collection('employees');
export const Shifts = new Mongo.Collection('shifts');

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

tempid = '';
if (Meteor.isClient) {
  Template.calendar.helpers({
      getDays : function () {
        group = Groups.findOne();
        console.log(group)
        console.log(Groups.find().count())
        if (group) {
          tempid = group._id;
          return group.days;
        }
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
    return false;
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

  Template.addForm.events({
    'submit .new-task' (event) {
      // Prevent default browser form submit
      event.preventDefault();
   
      // Get value from form element
      const target = event.target;
      const text = target.text.value;
   
      // Insert a task into the collection
      if (text != "")
        Tasks.insert({text});

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
      Employees.insert({
        text
      });
      // Clear form
      target.text.value = '';
    },

    'click .btn-xs'(event) {

      const start = template.find("start").value;
      console.log(start);

    }
  });

  Template.addForm.helpers({
    tasks() {
    return Tasks.find({});
    },
    employees() {
      return Employees.find({});
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
