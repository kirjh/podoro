export { alarmList, alarmExists, clearAlarm, createAlarm, startSession, pauseSession, resumeSession};

import { setSecret } from "./time.js";

const alarmList = {
  timeInputs: ["pomowork", "pomobreak", "pomobreaklong", "pomointerval"]
}

/*****************************************************************************/

// Returns: alarm or null
const alarmExists = async () => {
  for (const alarm of alarmList.timeInputs) {
    let activeAlarm = await chrome.alarms.get(alarm);
    if (activeAlarm) return activeAlarm;
  }
  const storage = await chrome.storage.local.get(["paused", "activeAlarm"]);
  if (storage.paused && storage.paused == true) {
    // Alarms in storage must be reconverted to unix to ensure
    // compatibility with other functions
    storage.activeAlarm.scheduledTime += Date.now();
    return storage.activeAlarm;
  }
  return null;
}

/*****************************************************************************/

const startSession = async () => {
  console.log("creating timer");
  const time = await chrome.storage.local.get(["pomowork"]);
  chrome.storage.local.set({["currentAlarm"] : time.pomowork});

  setSecret(time.pomowork);
  createAlarm("pomowork", parseInt(time.pomowork));
  return;
}

/*****************************************************************************/

//  @alarm  (object) alarm
const clearAlarm = async (alarm=null) => {
  console.log("clearing timers");
  if (alarm) {
    chrome.alarms.clear(alarm.name);
    return;
  }
  // If @alarm is not specified all podoro alarms will be cleared instead.
  await chrome.alarms.clear("pomowork");
  await chrome.alarms.clear("pomobreak");
  await chrome.alarms.clear("pomobreaklong");
  return;
}

/*****************************************************************************/

//  @name  (string) name of alarm. Must be either of: 
//                    ["pomowork", "pomobreak", "pomobreaklong"]
//  @time  (number) length of alarm
const createAlarm = (name, time) => {
  chrome.alarms.create(name, {delayInMinutes: time});
  console.log(`created alarm "${name}" with a delay of (${time}) minutes`);
  return;
}

/*****************************************************************************/

const pauseSession = async() => {
  const alarm = await alarmExists();
  if (!alarm) return;
  
  clearAlarm();

  // Convert unix time to time in milliseconds
  alarm.scheduledTime -= Date.now();
  alarm.paused = true;

  await chrome.storage.local.set({paused: true, activeAlarm: alarm});
  return;
} 

/*****************************************************************************/

const resumeSession = async() => {
  const storage = await chrome.storage.local.get(["activeAlarm"]);

  console.log("resuming timer");
  createAlarm(storage.activeAlarm.name, storage.activeAlarm.scheduledTime/60000);

  chrome.storage.local.set({paused: false});
  return;
}

/*****************************************************************************/