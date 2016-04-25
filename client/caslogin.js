
Template.CasLogin.events({
  /*
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
  /*
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

/* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */
$(document).on("click", "button.logout", function(event) {
    document.getElementById("myDropdown").classList.toggle("show");
    event.stopPropagation();
  });

$(document).on("click", "button.group", function(event) {
    document.getElementById("myDropdownGroup").classList.toggle("show");
    event.stopPropagation();
  });


// Close the dropdown if the user clicks outside of the button
window.onclick = function(e) {
  if (!e.target.matches('button.logout')) {

    var dropdowns = document.getElementsByClassName("dropdown-content");
    for (var d = 0; d < dropdowns.length; d++) {
      var openDropdown = dropdowns[d];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

// Close the dropdown if the user clicks outside of the button
window.onclick = function(e) {
  if (!e.target.matches('button.group')) {

    var dropdowns = document.getElementsByClassName("dropdown-content");
    for (var d = 0; d < dropdowns.length; d++) {
      var openDropdown = dropdowns[d];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}