export { setSecret, getTimeFromStorage, updateTime};

import { alarmList, alarmExists } from "./alarms.js";

/*****************************************************************************/

//  @alarmTime:  (number) current alarm length
const setSecret = async (alarmTime) => {
  const secret = document.getElementsByClassName("secret")[0];
  secret.innerHTML = alarmTime;
  return;
}

/*****************************************************************************/

// Returns: Object containing alarm lengths
const getTimeFromStorage = async () => {
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

/*****************************************************************************/

// Chrome API returns the remaining time of an active alarm as unix 
// epoch time, which is a specific time in the future. It must be 
// converted into minutes remaining by subtracting Date.now()
const updateTime = async () => {
  const timeDisplay = document.getElementById("timeDisplay");
  const clockPointer = document.getElementById("clockPointer");
  let alarmLength = document.getElementsByClassName("secret")[0].innerHTML;
  let time;
  const alarm = await alarmExists();

  // If an active alarm does not exist, display current value of 
  // the pomowork setting.
  if (!alarm) {
    timeDisplay.innerHTML = (!document.getElementById("pomowork").value) ? 0 : document.getElementById("pomowork").value;
    clockPointer.style.setProperty("transform", "rotate(0)");
    return;
  }

  time = Math.ceil((alarm.scheduledTime-Date.now())/60000);

  alarmLength = parseInt(alarmLength)
  if (time > alarmLength) time = alarmLength;

  timeDisplay.innerHTML = time;
  clockPointer.style.setProperty("transform", `rotate(${-((360/alarmLength)*time)}deg)`);
  return;
}

/*****************************************************************************/