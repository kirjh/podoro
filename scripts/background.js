const breakmsg = {
  type:"basic",
  iconUrl: "../icons/pomo128.png",
  title:"Break time!",
  message: "5 minute break starts now"
}
import { createWorkAlarm, createBreakAlarm } from "./alarms.js";

const workmsg = {
  type:"basic",
  iconUrl: "../icons/pomo128.png",
  title:"Work time!",
  message: "25 minute session starts now"
}

const createNotification = (msg) => {
  chrome.notifications.create("pomoalarm", msg, (notifId) => {
    setTimeout(() => {chrome.notifications.clear(notifId);}, 5000);
  });
}

chrome.alarms.onAlarm.addListener((alarm)=> {
  console.log(`${alarm.name} has triggered`);
  switch (alarm.name) {
    case "pomowork":
      createNotification(breakmsg);
      createBreakAlarm();
      break;
    case "pomobreak":
      createNotification(workmsg);
      createWorkAlarm();
      break;
    default:
      break;
  }
});