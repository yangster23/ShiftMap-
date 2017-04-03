let closeModal = () => {
  $( '#add-edit-event-modal' ).modal( 'hide' );
  $( '.modal-backdrop' ).fadeOut();
};

Template.addEditEventModal.helpers({
	// Using eventModal Session variable's type property and testing if it equals the type value passed to our helper like {{#if modalType 'edit'}}
	modalType(type) {
		let eventModal = Session.get( 'eventModal' );
		if ( eventModal ) {
			return eventModal.type === type;
		}
	},
	modalLabel() {
		let eventModal = Session.get( 'eventModal' );

		if ( eventModal ) {
			return {
				button: eventModal.type === 'edit' ? 'Edit' : 'Add',
				label: eventModal.type === 'edit' ? 'Edit' : 'Add an'
			};
		}
	},
	selected( v1, v2 ) {
		return v1 === v2;
	},
	event() {
		let eventModal = Session.get( 'eventModal' );

		if ( eventModal ) {
			return eventModal.type === 'edit' ? Events.findOne( eventModal.event ) : {
				start: eventModal.date,
				end: eventModal.date
			};
		}
	}
});


Template.addEditEventModal.events({
	'submit form' ( event, template ) {
		event.preventDefault();

		let eventModal = Session.get('eventModal'),
		submitType = eventModal.type === 'edit' ? 'editEvent' : 'addEvent',
		eventItem  = {
			start: template.find( '[name="start"]' ).value,
			end: template.find( '[name="end"]' ).value,
			type: template.find( '[name="type"] option:selected' ).value,
			guests: parseInt( template.find( '[name="guests"]' ).value, 10 )
		};

		if ( submitType === 'editEvent' ) {
			eventItem._id = eventModal.event;
		}

		Meteor.call(submitType, eventItem, ( error ) => {
			if ( error ) {
				Bert.alert( error.reason, 'danger', 'growl-bottom-right' );
			} else {
				Bert.alert( `Event ${ eventModal.type }ed!`, 'success', 'growl-bottom-right' );
				closeModal();
			}
		});
	}, 
	'click .delete-event' ( event, template ) {
		let eventModal = Session.get( 'eventModal' );
		if ( confirm( 'Are you sure? This is permanent.' ) ) {
			Meteor.call('removeEvent', eventModal.event, ( error ) => {
				if ( error ) {
					Bert.alert( error.reason, 'danger', 'growl-bottom-right' );
				} else {
					console.log("WHY NOT DELETE");
					Bert.alert( 'Event deleted!', 'success', 'growl-bottom-right' );
					closeModal();
				}
			});
		}
	}, 
});


