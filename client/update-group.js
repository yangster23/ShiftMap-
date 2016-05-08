Template.updateGroup.events({
  // adds an employer to the group
  'submit .new-employer' (event) {
    // Prevent default browser form submit
    event.preventDefault();
 
    // Get value from form element
    const target = event.target;
    const text = target.text.value;
   
    // Insert an employer into the collection
    if (text != "")
      addEmployerToGroup(idFromName(text), getCurrentGroupId());

    // Clear form
    target.text.value = '';
  },
  // adds an employee to a group 
  'submit .new-employee' (event) {
    // Prevent default browser form submit
    event.preventDefault();
   
    // Get value from form element
    let target = event.target;
    let text = target.text.value;
   
    // Insert an employee into the collection
    if (text != "")
      addUserToGroup(idFromName(text), getCurrentGroupId());
    // Clear form
    target.text.value = '';
  },
  // adds a shift to a group
  'submit .form-inline'(event) {

    event.preventDefault();

    let start = event.target.start.value;
    let end = event.target.end.value;
    let capacity = event.target.capacity.value;
    let date = document.getElementById("datepicker").value;

    let repeat = document.getElementById("repeat").checked;

    var re = "^(0|1)?[0-9]:[0-5][0-9](am|pm)$";
    // makes sure that the input is of the right form
    if (start.match(re) != null && end.match(re) != null && parseInt(capacity) > 0 && date != "") {
      addShift({"start": formatTime(start), "end": formatTime(end), "capacity": capacity, "date": date, "repeat": repeat}, getCurrentGroupId());
      event.target.start.value = '';
      event.target.end.value = '';
      event.target.capacity.value = '';
    }
  },
  // ensure that closing the form works
  'click .btn btn-primary'(event) {
    Router.go('/');

  }
});

// Renders the datepicker
Template.updateGroup.rendered = function() {
  $('#datepicker').datepicker({
    dateFormat: "dd/mm/yyyy"
  });
};


Template.updateGroup.helpers({
  // returns the employers of a group
  employers() {
    let groupid = getCurrentGroupId(); 
    let employers = Groups.findOne({_id: groupid}).employers;
    for (let i = 0; i < employers.length; i++) {
      name = nameFromId(employers[i].userid);
      employers[i].employer = name; 
    }
    return employers;
  },
  // returns employees who are not employers
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
  // returns shifts of the group
  formShifts() {
    return Shifts.find({groupid: getCurrentGroupId()});
  }
}); 

Template.employer.events({
  // clicking the x makes an employer an employee
  'click .delete'() {
    if (this.userid != currentUserId())
      removeEmployerFromGroup(this.userid, getCurrentGroupId());
  },
});

Template.employee.events({
  // clicking the x removes an employee from the group
  'click .delete'() {
    removeUserFromGroup(this.userid, getCurrentGroupId());
  },
});

Template.shift.events({
  // Removes the shift by clcking the x
  'click .delete'() {
    removeShift(this._id);
  },
});

// mapping from integers to string days of week
var weekdays = {0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday"};
Template.shift.helpers({
  // for a shift, provides display information 
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



