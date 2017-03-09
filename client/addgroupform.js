Template.addForm.events({
  'click .btn-primary' (event) {
    event.preventDefault();

    let groupname = document.getElementById('inputEmployment').value;
    let groupdescription = document.getElementById('inputDescription').value;
    
    let groupid = Groups.insert({'groupname': groupname, 
                                 'groupdescription': groupdescription,
                                 'users':[],
                                 'employers':[]});
    addEmployerToGroup(currentUserId(),groupid);
    setCurrentGroup(groupid); 
    Router.go('/');
  }
});