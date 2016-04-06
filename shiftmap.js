import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

//import './shiftmap.html';

Router.route('/', function () {
  this.render('home');
});
Router.route('/login', function () {
  this.render('login');
})
Router.route('/calendar', function () {
  this.render('calendar');
})

Groups = new Mongo.Collection('Groups');

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

//tempId = Coll.insert({counter: 0 }, {hello: 1}), ;
tempid = '';
if (Meteor.isClient) {
  Template.calendar.helpers({
      getDays : function () {
        group = Groups.findOne();
        tempid = group._id;
        return group.days;
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
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup

  });
}
