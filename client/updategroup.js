
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
      Employers.insert({employer: text});

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
      Employees.insert({employee: text});
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

    if (start.match(re) != null && end.match(re) != null && parseInt(capacity) > 0) {
      FormShifts.insert({"start": start, "end": end, "capacity": capacity, "date": date, "repeat": repeat});
    }

    event.target.start.value = '';
    event.target.end.value = '';
    event.target.capacity.value = '';
    
  },
  // Pressing the update button
  'click .btn-primary'(event) {
          
    let employers = Employers.find().fetch();
    let shifts = FormShifts.find().fetch();
    let employees = Employees.find().fetch();
    
    let groupid = getCurrentGroupId();
    addEmployerToGroup(currentUserId(), groupid);
    for (let i = 0; i < employers.length; i++) {
      addEmployerToGroup(idFromName(employers[i].employer), groupid);
    }
    
    for (let i = 0; i < employees.length; i++) {
      addUserToGroup(idFromName(employees[i].employee), groupid);
    }

    for (let i = 0; i < shifts.length; i++) {
      addShift(shifts[i],groupid);
    }
    if (Employers.find({}).count() != 0 || 
        Employees.find({}).count() != 0 || 
        FormShifts.find({}).count() != 0) {
      $('#myModal').modal('hide');
    }
    
    Employers.remove({});
    Employees.remove({});
    FormShifts.remove({});

    Router.go('/');
  }
});

Template.updateGroup.rendered=function() {
  $('#datepicker').datepicker({
    dateFormat: "dd/mm/yyyy"
  });
};


Template.updateGroup.helpers({
  employers: function () {
    return Employers.find({});
  },
  employees: function () {
    return Employees.find({});
  },
  formShifts: function() {
    return FormShifts.find({});
  },
  repeat: function() {
    return document.getElementById("repeat").checked;
  }
}); 

Template.employer.events({
  'click .delete'() {
    Employers.remove(this._id);
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




