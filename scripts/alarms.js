export {createTimer, clearTimers, createWorkAlarm, createBreakAlarm};

// Create an alarm 
const createTimer = () => {
  console.log("creating timer");
  createWorkAlarm();
  return;
}

// Clear pomo alarms
const clearTimers = async () => {
  console.log("clearing timers");
  await chrome.alarms.clear("pomowork")
  await chrome.alarms.clear("pomobreak")
  return;
}

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