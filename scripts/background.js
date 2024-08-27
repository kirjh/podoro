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
import { sendMessage, countSessions, setTheme, setCounter, toggleAuto, checkDate, increaseDailyProgress, updateStats, addTask, closeTask, completeTask } from "./background_functions.js";
import { alarmExists } from "./alarms.js";

let notifId = null;

/*****************************************************************************/
const notif = {
  pomowork: {
    iconUrl: "../icons/red_icon_256.png",
    title: "Focus Time",
    message: "focus session"
  },
  pomobreak: {
    iconUrl: "../icons/green_icon_256.png",
    title: "Break Time",
    message: "break"
  },
  pomobreaklong: {
    iconUrl: "../icons/blue_icon_256.png",
    title: "Break Time",
    message: "break"
  }
}

/*****************************************************************************/

// @msg (string) notification message
const createNotification = (msg) => {
  chrome.notifications.create("pomoalarm", msg, (id) => {
    notifId = id;
  });
  return;
}

const createButtonNotification = (msg) => {
  chrome.notifications.create("pomoalarm", {
    type: msg.type,
    iconUrl: msg.iconUrl,
    title: msg.title,
    message: msg.message,
    buttons: [{
      title: "Start Now"
    }, {
      title: "Later"
    }]
  }, (id) => {
    notifId = id;
  });
  return;
}

/*****************************************************************************/

chrome.notifications.onButtonClicked.addListener(async (id, button)=>{
  if (id != notifId || button != 0) return;
  const storage = await chrome.storage.local.get(["paused"]);
  if (storage.paused) {
    await resumeSession();
    sendMessage("resumeTimer");
  }
});
/*****************************************************************************/

chrome.alarms.onAlarm.addListener(async (alarm)=> {
  console.log(`${alarm.name} has triggered`);

  let time;
  let alarmName;
  const storage = await chrome.storage.local.get(["toggleauto"]);
  await processBackendRequest("checkDate");
  await updateStats(alarm.name);

  // Toggle next alarm
  switch (alarm.name) {
    case "pomowork":
      const breakTime = await countSessions(alarm);
      await increaseDailyProgress();
      if (breakTime) {
        alarmName = "pomobreaklong";
        chrome.action.setIcon({
          path: {
            "16":"../icons/blue_icon_16.png",
            "32":"../icons/blue_icon_32.png",
            "64":"../icons/blue_icon_64.png",
          }
        });
        setCounter(0);
      } else {
        alarmName = "pomobreak";
        chrome.action.setIcon({
          path: {
            "16":"../icons/green_icon_16.png",
            "32":"../icons/green_icon_32.png",
            "64":"../icons/green_icon_64.png",
          }
        });
      }
      break;
    default:
      alarmName = "pomowork";
      chrome.action.setIcon({
        path: {
          "16":"../icons/red_icon_16.png",
          "32":"../icons/red_icon_32.png",
          "64":"../icons/red_icon_64.png"
        }
      });
      break;
  }

  // Update time 
  time = await chrome.storage.local.get([alarmName]);
  time = time[alarmName];

  // Create Notification
  const notifTemplate = new Object();
  notifTemplate.type = "basic";
  notifTemplate.iconUrl = notif[alarmName].iconUrl;
  notifTemplate.title = notif[alarmName].title;
  if (storage.toggleauto) {
    notifTemplate.message = `Your ${time} minute ${notif[alarmName].message} starts now.`;
    createNotification(notifTemplate);
  } else {
    notifTemplate.message = `Your ${time} minute ${notif[alarmName].message} is ready.`;
    createButtonNotification(notifTemplate);
  }

  

  // Create alarm
  chrome.storage.local.set({["currentAlarm"] : time});
  await createAlarm(alarmName, parseInt(time));

  sendMessage("changeButtonColour", alarmName);
  sendMessage("setCounter", null);

  if (!storage.toggleauto) {
    await pauseSession();
    sendMessage("pauseTimer");
  }
    
});

/*****************************************************************************/

chrome.storage.onChanged.addListener((changes) => {
  const list = alarmList.timeInputs;
  for (const [key, {newValue}] of Object.entries(changes)) {
    if (newValue) {

      if (key == "pomointerval") sendMessage("updateProgress", newValue);
      if (list.includes(key)) sendMessage(`updateInput`, {key: key, value: newValue});
    }
  }
});

/*****************************************************************************/

//  Returns: return value of called function
const runBackend = {
  startTimer: async (param) => {return await startSession();},
  resumeTimer: async (param) => {return await resumeSession();},
  pauseTimer: async (param) => {return await pauseSession();},
  
  stopTimer: async (param) => {setCounter(0); 
                          sendMessage("setCounter", null);
                          await chrome.storage.local.set({activeAlarm: null});
                          return await clearAlarm();},

  theme: async (param) => {return await setTheme();},
  toggleauto: async (param) => {return await toggleAuto();},
  setCounter: async (param) => {return setCounter(0);},
  checkDate: async (param) => {return await checkDate();},
  
  addTask: async (param) => {return await addTask(param)},
  closeTask: async (param) => {return await closeTask(param);},
  completeTask: async (param) => {return await completeTask(param);}
}

/*****************************************************************************/

const processBackendRequest = (async (request, param) => {
  const returnParam = await runBackend[request](param);

  sendMessage(request, returnParam);
});

/*****************************************************************************/

chrome.runtime.onMessage.addListener(async (message) => {
  if (!message.backendRequest) return;
  
  processBackendRequest(message.backendRequest, message.param);
});

/*****************************************************************************/

// Change icon on browser start
chrome.tabs.onActivated.addListener(async () => {
  let alarm = await alarmExists();
  if (!alarm) alarm = {name: "pomowork"};

  switch (alarm.name) {
    case "pomobreak":
      chrome.action.setIcon({
        path: {
          "16":"../icons/green_icon_16.png",
          "32":"../icons/green_icon_32.png",
          "64":"../icons/green_icon_64.png"
        }
      });
      break;
    case "pomobreaklong":
      chrome.action.setIcon({
        path: {
          "16":"../icons/blue_icon_16.png",
          "32":"../icons/blue_icon_32.png",
          "64":"../icons/blue_icon_64.png"
        }
      });
      break;
    default:
      chrome.action.setIcon({
        path: {
          "16":"../icons/red_icon_16.png",
          "32":"../icons/red_icon_32.png",
          "64":"../icons/red_icon_64.png"
        }
      });
      break;
  }
});