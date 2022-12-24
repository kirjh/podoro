import { createAlarm } from "./alarms.js";

const breakmsg = {
  type:"basic",
  iconUrl: "../icons/pomo128.png",
  title:"Break time!",
  message: "default"
}

const workmsg = {
  type:"basic",
  iconUrl: "../icons/pomo128.png",
  title:"Focus time!",
  message: "default"
}

const createNotification = (msg) => {
  chrome.notifications.create("pomoalarm", msg, (notifId) => {
    setTimeout(() => {chrome.notifications.clear(notifId);}, 5000);
  });
}

chrome.alarms.onAlarm.addListener(async (alarm)=> {
  console.log(`${alarm.name} has triggered`);

  let time;
  switch (alarm.name) {
    case "pomowork":
      time = await chrome.storage.local.get(["pomobreak"]);
      breakmsg.message = `${time.pomobreak} minute break starts now`
      createNotification(breakmsg);
      createAlarm("pomobreak", parseInt(time.pomobreak));
      break;
    case "pomobreak":
      time = await chrome.storage.local.get(["pomowork"]);
      workmsg.message = `${time.pomowork} minute pomodoro starts now`
      createNotification(workmsg);
      createAlarm("pomowork", parseInt(time.pomowork));
      break;
    default:
      break;
  }
});