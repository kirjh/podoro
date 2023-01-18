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

export { setSecret, getTimeFromStorage, updateTime};

import { alarmList, alarmExists } from "./alarms.js";

/*****************************************************************************/

//  @alarmTime:  (number) current alarm length
//  @alarmName:  (number) name of alarm
const setSecret = async (alarmTime, alarmName) => {
  const secret = document.getElementsByClassName("secret")[0];
  const clockElements = [document.getElementsByClassName("alarmbutton")[0]];
  clockElements.push(document.getElementsByClassName("stopbutton")[0]);
  clockElements.push(document.getElementsByClassName("pointer")[0]);

  secret.innerHTML = alarmTime;

  for (const element of clockElements) {
    switch (alarmName) {
      case "pomobreak":
        element.classList.add("greenalarm");
        element.classList.remove("bluealarm");
        break;
      case "pomobreaklong":
        element.classList.add("bluealarm");
        element.classList.remove("greenalarm");
        break;
      default:
        element.classList.remove("greenalarm");
        element.classList.remove("bluealarm");
        break;
    }
  }
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