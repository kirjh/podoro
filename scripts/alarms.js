export {createWorkAlarm, createBreakAlarm};

// Creates a 25 minute work alarm
const createWorkAlarm = () => {
  chrome.alarms.create("pomowork", {delayInMinutes: 25});
  console.log("creating pomowork");
  return;
}

// Creates a 5 minute break alarm
const createBreakAlarm = () => {
  chrome.alarms.create("pomobreak", {delayInMinutes: 5});
  console.log("creating pomobreak");
  return;
}