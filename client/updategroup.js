Employers = new Mongo.Collection(null);
Employees = new Mongo.Collection(null);
FormShifts = new Mongo.Collection(null);

Template.updateGroup.events({
  'submit .new-employer' (event) {
    // Prevent default browser form submit
    event.preventDefault();
 
    // Get value from form element
    const target = event.target;
    const text = target.text.value;
   
    // Insert an employer into the collection
    if (text != "" && Employers.find({employer: text}).count() == 0)
      addEmployerToGroup(idFromName(text), getCurrentGroupId());

    // Clear form
    target.text.value = '';
  },
  'submit .new-employee' (event) {
    // Prevent default browser form submit
    event.preventDefault();
   
    // Get value from form element
    let target = event.target;
    let text = target.text.value;
   
    // Insert an employee into the collection
    if (text != "" && Employees.find({employee: text}).count() == 0)
      addUserToGroup(idFromName(text), getCurrentGroupId());
    // Clear form
    target.text.value = '';
  },

  'submit .form-inline'(event) {

    event.preventDefault();

    let start = event.target.start.value;
    let end = event.target.end.value;
    let capacity = event.target.capacity.value;
    let date = document.getElementById("datepicker").value;

    let repeat = document.getElementById("repeat").checked;

    var re = "^(0|1)?[0-9]:[0-5][0-9](am|pm)$";

    if (start.match(re) != null && end.match(re) != null && parseInt(capacity) > 0 && date != "") {
      addShift({"start": formatTime(start), "end": formatTime(end), "capacity": capacity, "date": date, "repeat": repeat}, getCurrentGroupId());
      event.target.start.value = '';
      event.target.end.value = '';
      event.target.capacity.value = '';
    }
  },

  'click .btn btn-primary'(event) {
    Router.go('/');

  }
});

Template.updateGroup.rendered=function() {
  $('#datepicker').datepicker({
    dateFormat: "dd/mm/yyyy"
  });
};

Template.updateGroup.helpers({
  employers() {
    let groupid = getCurrentGroupId(); 
    let group = Groups.findOne({_id: groupid});
    let employers = group.employers;
    for (let i = 0; i < employers.length; i++) {
      name = nameFromId(employers[i].userid);
      employers[i].employer = name; 
    }
    return employers;
  },
  employees() {
    let groupid = getCurrentGroupId(); 
    let group = Groups.findOne({_id: groupid});
    let employees = group.users;
    let employers = group.employers; 
    for (let i = employees.length - 1; i >= 0; i--) {
      name = nameFromId(employees[i].userid);
      employees[i].employee = name; 
      if (indexUser(employees[i].userid, employers) >= 0)
        employees.splice(i, 1); 
    }
    return employees; 
  },
  formShifts() {
    return Shifts.find({groupid: getCurrentGroupId()});
  }
}); 

Template.employer.events({
  'click .delete'() {
    if (this.userid != currentUserId())
      removeEmployerFromGroup(this.userid, getCurrentGroupId());
  },
});

Template.employee.events({
  'click .delete'() {
    removeUserFromGroup(this.userid, getCurrentGroupId());
  },
});

Template.shift.events({
  'click .delete'() {
    removeShift(this._id);
  },
});

var weekdays = {0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday"};
Template.shift.helpers({
  displayShift: function () {
    let display = "Start: " + unformatTime(this.start);
    display = display + ". End: " + unformatTime(this.end);
    if (this.date) {
      display = display + ". Date: " + this.date;
    } else {

      display = display + ". Day of week: " + weekdays[this.weekday];
    }
    display = display + ". Capacity: " + this.capacity;
    return display;
  }
});



