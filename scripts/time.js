export {alarmExists, getStorageTime, updateTime};

import JSON from "../config.json" assert {type: 'json'};

// Checks if pomoalarms exist
const alarmExists = async () => {
  for (const alarm of JSON.timeInputs) {
    let activeAlarm = await chrome.alarms.get(alarm);
    if (activeAlarm) return activeAlarm;
  }
  return null;
}

// Get time values from storage
// If time value does not exist, initialize it with default value;
const getStorageTime = async () => {
  const keyArray = JSON.timeInputs;
  let storage = await chrome.storage.local.get(keyArray);

  for (const key of keyArray) {
    if (!storage[key]) {
      const value = document.getElementById(key).value;
      chrome.storage.local.set({[key] : value});
      storage[key] = value;
    }
  }

  return storage;
}

// Update the time displayed by pomopomo every interval
const updateTime = async () => {
  const timeDisplay = document.getElementById("timeDisplay");
  const clockPointer = document.getElementById("clockPointer");
  const pomoAlarm = document.getElementById("pomowork");
  
  const alarm = await alarmExists();
  if (!alarm) {
    timeDisplay.innerHTML = pomoAlarm.value;
    clockPointer.style.setProperty("transform", "rotate(0)");
    return;
  }

  const inputTime = document.getElementById(alarm.name);
  let time = Math.ceil((alarm.scheduledTime-Date.now())/60000);

  // Correct time overcalculation due to rounding
  if (time > inputTime.value) time = inputTime.value;

  timeDisplay.innerHTML = time;
  clockPointer.style.setProperty("transform", `rotate(${-((360/inputTime.value)*time)}deg)`);
  return;
}