// Time and date functions
// Takes a time in form 10:00pm and converts it to 22:00
formatTime = function(time) {
  let timeHr = parseInt(time.slice(0, time.length-5));
  if (String(time).indexOf("pm") != -1 && timeHr != 12) timeHr += 12;
  if (timeHr < 10) timeHr = "0" + String(timeHr);
  let timeMin = time.slice(time.length-4, time.length-2);
  return timeHr + ":" + timeMin;
}

// Reverses the transformation above
unformatTime = function (time) {
  let timeHr = parseInt(time.slice(0,time.length-3));
  let meridien = "";
  if (timeHr >= 12) {
    meridien = "pm";
  } else {
    meridien = "am";
  }
  timeHr = timeHr % 12;
  if (timeHr == 0) {
    timeHr = 12;
  }
  return String(timeHr)+time.slice(time.length-3, time.length)+meridien;
}

// Ensures that a date is properly formatted
formatDate = function(date) {
  let array = date.split("-");
  let month = array[1];
  let day = array[2];
  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;
  return array[0] + "-" + month + "-" + day
}

// returns the starting date of the current calendar view
getStartDate = function(increment) {
  var start = $('.fc').fullCalendar('getCalendar').view.start;
  return moment(start).add(parseInt(increment), 'day').format("YYYY-MM-DD");
}

// finds the date of a shift for this week
findDate = function(shiftid) {
  let shiftSwap = Shifts.findOne({_id: shiftid});
  if (shiftSwap.date) {
    return formatDate(shiftSwap.date);
  } else {
    return getStartDate(shiftSwap.weekday);
  }
}

// Determines if a swap is at least a day later
greaterOneDay = function (inOut, userid, swaps) {
  let currentDate = moment(new Date()).format("YYYY-MM-DD");
  let calendar = $('.fc').fullCalendar('getCalendar');
  let start = moment(calendar.view.start).format("YYYY-MM-DD");
  for (let i = 0; i < swaps.length; i++) {
    if (inOut == "in") {
      if (swaps[i].swapin == userid && moment(start).isBefore(swaps[i].date, 'day')) {
        return moment(currentDate).isBefore(swaps[i].date, 'day');
      }
    }
    else {
      if (swaps[i].swapout == userid && moment(start).isBefore(swaps[i].date, 'day')) {
        return moment(currentDate).isBefore(swaps[i].date, 'day');
      }
    }
  }
}

