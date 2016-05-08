// routing.js
// Layout is template which encapsulates overall page appearance
Router.configure({
  layoutTemplate: 'Layout',
});

// Determines which html pages to display based on the path

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


