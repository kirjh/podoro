/******************************************************************************
  Podoro - Pomodoro timer, built into your browser
  Copyright (C) 2023-Present  Kirjh

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
******************************************************************************/

export { getTimeFromStorage, updateTime};

import { alarmList, alarmExists } from "./alarms.js";

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
  let alarmLength = await chrome.storage.local.get("currentAlarm").then((r) => {return r.currentAlarm});
  let time;
  const alarm = await alarmExists();
  
  // If an active alarm does not exist, display current value of 
  // the pomowork setting.
  if (!alarm) {
    console.log("NA"); // REMOVE
    timeDisplay.innerHTML = (!document.getElementById("pomowork").value) ? 0 : document.getElementById("pomowork").value;
    clockPointer.style.setProperty("transform", "rotate(0)");
    return;
  }

  time = Math.ceil((alarm.scheduledTime-Date.now())/60000);

  alarmLength = parseInt(alarmLength)
  if (time > alarmLength) time = alarmLength;

  timeDisplay.innerHTML = time;
  clockPointer.style.setProperty("transform", `rotate(${-((360/alarmLength)*time)}deg)`);
  //console.log(`-((360/${alarmLength})*${time} = ${-((360/alarmLength)*time)}`)
  return;
}

/*****************************************************************************/