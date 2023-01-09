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