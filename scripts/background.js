import { createAlarm } from "./alarms.js";
import { setSecret } from "./time.js";

const pomoNotif = {
  type: "basic",
  iconUrl: "../icons/zoe256x256.png",
  title:"default",
  message: "default"
}

const notifTitle = {
  pomowork: "Focus Time!",
  pomobreak: "Break Time!",
  pomobreaklong: "Long Break Time!"
}

const notifMsg = {
  pomowork: " minute focus session starts now",
  pomobreak: " minute break starts now",
  pomobreaklong: " minute break starts now"
}

const notifIcon = {
  pomowork: "../icons/zoe256x256.png",
  pomobreak: "../icons/zoe256x256.png",
  pomobreaklong: "../icons/zoe256x256.png"
}

const createNotification = (msg) => {
  chrome.notifications.create("pomoalarm", msg, (notifId) => {
    setTimeout(() => {chrome.notifications.clear(notifId);}, 20000);
  });
}

chrome.alarms.onAlarm.addListener(async (alarm)=> {
  console.log(`${alarm.name} has triggered`);

  let time;
  let alarmName;
  let tempMsg;
  // let [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true }) ;

  // Toggle to the next alarm
  switch (alarm.name) {
    case "pomowork":
      alarmName = "pomobreak";
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

  tempMsg = notifMsg[alarmName];
  notifMsg[alarmName] = time.toString().concat(notifMsg[alarmName]);

  pomoNotif.iconUrl = notifIcon[alarmName];
  pomoNotif.title = notifTitle[alarmName];
  pomoNotif.message = notifMsg[alarmName];

  createNotification(pomoNotif);

  // Reset message
  notifMsg[alarmName] = tempMsg;

  // Create Alarm and notify content scripts
  // chrome.tabs.sendMessage(tab.id, {pomomsg: time});
  createAlarm(alarmName, parseInt(time));
});