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

import { createAlarm } from "./alarms.js";

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
  chrome.runtime.sendMessage({pomocount: sessionStorage.pomocount})
    .catch((e) => {console.log(`[${e}] Likely popup is not active`)});

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
      } else {
        alarmName = "pomobreak";
      }
      break;
    case "pomobreak":
      alarmName = "pomowork";
      break;
    case "pomobreaklong":
      alarmName = "pomowork";
      break;
    default:
      return;
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
  chrome.runtime.sendMessage({pomomsg: time})
    .catch((e) => {console.log(`[${e}] Likely popup is not active`)});
  createAlarm(alarmName, parseInt(time));
});

/*****************************************************************************/