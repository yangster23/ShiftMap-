Shifts = new Mongo.Collection('Shifts');
Shifts.allow({
  insert: () => false, 
  update: () => false,
  remove: () => false
});

Shifts.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
});

let ShiftsSchema = new SimpleSchema({
  'groupid': {
    type: String, 
    label: 'The group in which the shifts are in.'
  },
  'start': {
    type: String,
    label: 'When the shift will start.',
    regEx: /^(0|1)?[0-9]:[0-5][0-9](am|pm)$/ 
  },
  'end': {
    type: String,
    label: 'When this shift will end.',
    regEx: /^(0|1)?[0-9]:[0-5][0-9](am|pm)$/ 
  },
  'capacity': {
    type: Number, 
    label: 'The capacity of the shift'
  },
  'date': {
    type: String, 
    label: 'For a one-time shift, the date of the shift is formatted: YYYY-MM-DD'
  },
  'weekday': {
    type: Number, 
    label: 'For a weekly repeating shift, int represents day of week: 0-6',
    optional: true
  }, 
  'swaps.$.swapin': {
    type: String, 
    label: 'The userid who is swapping in for this specific shift'
  },
  'swaps.$.swapout': {
    type: String,
    label: 'The userid who is swapping out for this specific shift'
  },
  'swaps.$.date': {
    type: Number, 
    label: 'The date of this specific shift when a swap occurs'
  },
  'users': {
    type: String, 
    label: 'The userids in the shift',
  }
});

Shifts.attachSchema(ShiftsSchema);
/* 
May need to create a ID for each swap 

"_id" : "2BvgJz8FNNjemYBbu", "groupid" : "4NMtW9YR5mQpnLCRM", "start" : "16:00", "end" : "18:00", "capacity" : "10", "swaps" : [ ], "users" : [ ], "weekday" : 3 }

_id" : "TDTNDxAyyehdh8Ecy", "groupid" : "hbdRBgccWZWfiYRSK", "start" : "10:00", "end" : "16:00", "capacity" : "10", "swaps" : [ ], "users" : [ ], "date" : "2017-3-8" }


Shifts: {_id: str,
  [date: str | weekday: int], //date is formatted: YYYY-MM-DD
//weekday: 0 - 6
//date field is given for one-time shift;
  Weekday for repeating; int represents 
  day of week
  start: str,
  end: str,
  users: [{userid: str}],
  //array of swaps involving this specific shift
  swaps: [{swapid: str, swapin: str, swapout: str, date: str}],
  groupid: string}
  */ 