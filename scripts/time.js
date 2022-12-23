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
  let timeDisplay = document.getElementById("timeDisplay");
  let clockPointer = document.getElementById("clockPointer");
  //const settings = document.getElementsById();
  
  let alarm = await alarmExists();
  if (!alarm) {
    timeDisplay.innerHTML = "25";
    clockPointer.style.setProperty("transform", "rotate(0)");
    return;
  }

  let time = Math.ceil((alarm.scheduledTime-Date.now())/60000);
  // REPLACE 25 WITH VARIABLE LATER
  if (alarm.name == "pomowork" && time > 25) time = 25;
  if (alarm.name == "pomobreak" && time > 5) time = 5;

  timeDisplay.innerHTML = time;
  // REPLACE 25 WITH VARIABLE LATER
  clockPointer.style.setProperty("transform", `rotate(${-((360/25)*time)}deg)`);
  console.log(`At ${-((360/25)*time)} degrees`);
  return;
}