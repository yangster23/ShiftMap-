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
});
Router.route('/notifications', function() {
	this.render('notifications')
});
Router.route('/activeRequest', function() {
	this.render('activeRequest')
})


