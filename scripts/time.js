export { alarmExists, setSecret, getStorageTime, updateTime};

import { alarmList, alarmExists } from "./alarms.js";

// set the secret value
const setSecret = async (alarmTime) => {
  const secret = document.getElementsByClassName("secret")[0];
  secret.innerHTML = alarmTime;
  return;
}

// Get time values from storage
// If time value does not exist, initialize it with default value;
const getStorageTime = async () => {
  const keyArray = alarmList.timeInputs;
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
  let alarmLength = document.getElementsByClassName("secret")[0].innerHTML;
  let time;
  const alarm = await alarmExists();
  if (!alarm) {
    timeDisplay.innerHTML = (!document.getElementById("pomowork").value) ? 0 : document.getElementById("pomowork").value;
    clockPointer.style.setProperty("transform", "rotate(0)");
    return;
  }

  //const inputTime = document.getElementById(alarm.name);
  if (alarm.paused) {
    console.log("time left:" + (alarm.scheduledTime)/60000);
    time = Math.ceil(alarm.scheduledTime/60000);
  } else {
    console.log("time left:" + (alarm.scheduledTime-Date.now())/60000);
    time = Math.ceil((alarm.scheduledTime-Date.now())/60000);
  }

  alarmLength = parseInt(alarmLength)
  // Correct time overcalculation due to rounding
  if (time > alarmLength) time = alarmLength;

  timeDisplay.innerHTML = time;
  clockPointer.style.setProperty("transform", `rotate(${-((360/alarmLength)*time)}deg)`);
  return;
}