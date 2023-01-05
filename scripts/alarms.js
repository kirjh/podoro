export { alarmList, alarmExists, startTimer, clearTimers, createAlarm };

import { setSecret } from "./time.js";

const alarmList = {
  timeInputs: ["pomowork", "pomobreak", "pomobreaklong", "pomointerval"]
}

// Checks if pomoalarms exist
const alarmExists = async () => {
  for (const alarm of alarmList.timeInputs) {
    let activeAlarm = await chrome.alarms.get(alarm);
    if (activeAlarm) return activeAlarm;
  }
  return null;
}

// Create an alarm 
const startTimer = async () => {
  console.log("creating timer");
  const time = await chrome.storage.local.get(["pomowork"]);
  setSecret(time.pomowork);
  createAlarm("pomowork", parseInt(time.pomowork));
  return;
}

// Clear pomo alarms
const clearTimers = async () => {
  console.log("clearing timers");
  await chrome.alarms.clear("pomowork")
  await chrome.alarms.clear("pomobreak")
  await chrome.alarms.clear("pomobreaklong")
  return;
}

const createAlarm = (name, time) => {
  chrome.alarms.create(name, {delayInMinutes: time});
  console.log(`created alarm "${name}" with a delay of (${time}) minutes`);
  return;
}