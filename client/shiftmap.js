// If the current date and time today is after the passed date, we respond with 
// true meaning the date in question has already past. 
let isPast = (date) => {
  let today = moment().format();
  return moment(today).isAfter(date);
};

Template.calendar.onCreated( () => {
  // At the top, we make sure to subscribe to the data from our events collection. 
  let template = Template.instance();
  // connects the “real” collection with the client’s version, and constantly keeps it up to date with the latest information on the server.
  template.subscribe('Shifts');
});

Template.calendar.helpers({
  getGroupHeader: function () {
    let currentGroup = getCurrentGroupId();
    // console.log(currentGroup);
    if (currentGroup == null)
      return "No Groups";
    return Groups.findOne({_id: currentGroup}).groupname; 
  },
  getGroupDescription: function () {
    return Groups.findOne({_id: getCurrentGroupId()}).groupdescription;
  },
  isCurrentEmployer: function() {
    let userid = currentUserId();
    let employers = Groups.findOne({_id: getCurrentGroupId()}).employers;
    return indexUser(userid,employers) >= 0;
  },
  getCurrentGroupId: function() {
    return Users.findOne({_id: currentUserId()}).current;
  },
}); 

// The calendar is rendered via FullCalendar API. 
Template.calendar.onRendered( () => {
  $( '#events-calendar' ).fullCalendar({
    header: {
      left: 'prev,next today',
      center: 'title',
      right: 'agendaWeek,month'
    },
    events(start, end, timezone, callback) {
      let user = Users.findOne({username: currentUser()});
      let userid = user._id;
      let currentGroup = user.current;
      let data;

      if (currentGroup == undefined) {
        currentGroup = user.groups[0].groupid;
        if (currentGroup == undefined) {
          data = [];
        }
        setCurrentGroup(currentGroup);
      }
      // the .fetch() method converts the result from a MongoDB cursor of that specific group to a plain array. 
      data = Shifts.find({groupid: currentGroup}).fetch().map((event) => {
        event.editable = !isPast(event.start);
        return event;
      });
      console.log(data);

      // Once data is available, "update" the calendar. 
      if (data) {
        callback(data);
      }
    },

    // We get two arguments event—the actual event item on the calendar and the element where the item is being rendered (the data square) 
    // as a jQuery element. To customize the contents of our event, we make a call on our calendar square to .find() 
    // the <div></div> with the class .fc-content. Once we have it, we make a call to set its inner HTML with jQuery's .html() method
    eventRender(event, element) {
      element.find( '.fc-content' ).html(
       `<h4>${String(event.start)} - ${String(event.end)}</h4>
       <p class="type-${ event.type }">#${ event.type }</p>
       `
       );
    },
    eventDrop( event, delta, revert ) {
      let date = event.start.format();
      if ( !isPast( date ) ) {
        let update = {
          _id: event._id,
          start: date,
          end: date
        };
        Meteor.call( 'editEvent', update, ( error ) => {
          if ( error ) {
            Bert.alert( error.reason, 'danger', 'growl-bottom-right');
          }
        });
      } else {
        revert();
        Bert.alert( 'Sorry, you can\'t move items to the past!', 'danger', 'growl-bottom-right' );
      }
    },
    // Because we're dealing with an external template that we need to "toggle" the state of, here, we're using a Session variable to store that state. 
    // We do this in two ways. First, for both event and day clicks, we pass an object with a type property letting us know whether we're adding an event or editing an event.
    // whenever we click on the actual day square in the calendar
    dayClick(date) {
      Session.set( 'eventModal', { type: 'add', date: date.format() } ); //  passing date property formatted as an ISO8601 date string noting the day of the calendar that was clicked
      $( '#add-edit-event-modal' ).modal( 'show' );
    },
    // whenever we click directly on an event.
    eventClick(event) {
      Session.set( 'eventModal', { type: 'edit', event: event._id } ); // we simply pass the _id property of the event. 
      $( '#add-edit-event-modal' ).modal( 'show' );
    }
  });

  /* 
    Whenever our collection updates, the refetchEvents method being called on our
    calendar element here will re-run the events() method on our FullCalendar 
    instance and repopulate the calendar. If we look at the events() method's 
    callback() method, we can see how this works. When refetchEvents fires, 
    the method is called, our data is fetched, and only when we have some result, 
    we tell the calendar to update with callback(data);.
    */ 
    Tracker.autorun( () => {
      Shifts.find().fetch();
      $( '#events-calendar' ).fullCalendar( 'refetchEvents' );
    });

  });
