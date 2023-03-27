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

import { alarmList, createAlarm, startSession, pauseSession, resumeSession, clearAlarm } from "./alarms.js";
import { setCounter } from "./menu.js";

/*****************************************************************************/

const notifTemplate = {
  type: "basic",
  iconUrl: "../icons/work_zoe.png",
  title:"default",
  message: "default"
}

const notif = {
  pomowork: {
    iconUrl: "../icons/work_zoe.png",
    title: "Focus Time!",
    message: " minute focus session starts now"
  },
  pomobreak: {
    iconUrl: "../icons/break_zoe.png",
    title: "Break Time!",
    message: " minute break starts now"
  },
  pomobreaklong: {
    iconUrl: "../icons/long_break_zoe.png",
    title: "Long Break Time!",
    message: " minute break starts now"
  }
}

/*****************************************************************************/

//  @func   (string) function name
//  @param  (object) parameters
const sendMessage = (func, param) => {
  chrome.runtime.sendMessage({frontendRequest: func, param: param})
      .catch((e) => {console.log(`[${e}]\n Likely popup is not active`)});
}

/*****************************************************************************/

// @msg (string) notification message
const createNotification = (msg) => {
  chrome.notifications.create("pomoalarm", msg, (notifId) => {
    setTimeout(() => {chrome.notifications.clear(notifId);}, 30000);
  });
  return;
}

/*****************************************************************************/

//  @alarm  (object) alarm
//
//  Returns: true if interval divides count cleanly, false otherwise
const countSessions = async (alarm) => {
  const storage = await chrome.storage.local.get("pomointerval");
  const sessionStorage = await chrome.storage.session.get("pomocount");
  
  if (!sessionStorage.pomocount) sessionStorage.pomocount = 0;
  sessionStorage.pomocount += 1;

  chrome.storage.session.set({pomocount: sessionStorage.pomocount});
  sendMessage("setCounter", sessionStorage.pomocount);

  if (sessionStorage.pomocount % storage.pomointerval == 0) return true;
  return false;
}

/*****************************************************************************/

chrome.alarms.onAlarm.addListener(async (alarm)=> {
  console.log(`${alarm.name} has triggered`);

  let time;
  let alarmName;

  // Toggle next alarm
  switch (alarm.name) {
    case "pomowork":
      const breakTime = await countSessions(alarm);
      if (breakTime) {
        alarmName = "pomobreaklong";
        chrome.action.setIcon({path: "../icons/blue_pomo64.png"});
      } else {
        alarmName = "pomobreak";
        chrome.action.setIcon({path: "../icons/green_pomo64.png"});
      }
      break;
    default:
      alarmName = "pomowork";  
      chrome.action.setIcon({path: "../icons/pomo64.png"});
      break;
  }

  // Update time 
  time = await chrome.storage.local.get([alarmName]);
  time = time[alarmName];

  notifTemplate.iconUrl = notif[alarmName].iconUrl;
  notifTemplate.title = notif[alarmName].title;
  notifTemplate.message = time.toString().concat(notif[alarmName].message);
  createNotification(notifTemplate);

  // Create alarm
  chrome.storage.local.set({["currentAlarm"] : time});
  sendMessage("setSecret", time);
  sendMessage("changeButtonColour", alarmName);
  createAlarm(alarmName, parseInt(time));
});

/*****************************************************************************/

const setTheme = async () => {
  const storage = await chrome.storage.local.get("theme");

  if (storage.theme == "dark") {
    chrome.storage.local.set({theme: "light"});
    return true;
  } else {
    chrome.storage.local.set({theme: "dark"});
    return false;
  }
}

/*****************************************************************************/

chrome.storage.onChanged.addListener((changes) => {
  const list = alarmList.timeInputs;
  for (const [key, {newValue}] of Object.entries(changes)) {
    if (newValue) {
      console.log(key + " :: " + newValue);

      if (key == "pomointerval") sendMessage("updateProgress", newValue);
      if (list.includes(key)) sendMessage(`updateInput`, {key: key, value: newValue});
    }
  }
});

/*****************************************************************************/

//  Returns: return value of called function
const runBackend = {
  startTimer: async () => {return await startSession();},
  resumeTimer: async () => {return await resumeSession();},
  pauseTimer: async () => {return await pauseSession();},
  
  stopTimer: async () => {return await clearAlarm();},

  theme: async () => {return await setTheme();},
  setCounter: async () => {return setCounter(0)}
}
// Start timer
// Stop timer
// Pause timer
// Dark mode
// Reset progress
// Tasks
// Update settings?

chrome.runtime.onMessage.addListener(async (message) => {
  if (!message.backendRequest) return;

  const param = await runBackend[message.backendRequest]();
  console.log(message.backendRequest);
  message.backendRequest;

  sendMessage(message.backendRequest, param);
  
});