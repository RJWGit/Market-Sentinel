//Take inputs for hour and minutes
import moment from "moment";

let numberOfhours = process.argv[2];
let numberOfMinutes = process.argv[3];

//Default to 0 minutes
if (numberOfMinutes === undefined) {
  numberOfMinutes = 0;
}

//Default to 1 hour
if (numberOfhours === undefined) {
  numberOfhours = 1;
}

// Get the current moment object in your local timezone (PDT)
let currentTime = moment();

//1 minute and 3 seconds before current time
let oneMinuteBefore = currentTime.subtract(numberOfhours, "hours").subtract(numberOfMinutes, "minute");

// Format the resulting moment object to ISO 8601 with the local (PDT) offset
let isoStringOneMinuteBefore = oneMinuteBefore.format();

//Pass time to batch file
console.log(`${isoStringOneMinuteBefore}`);
