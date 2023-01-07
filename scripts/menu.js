export {buttonToggle, stopAlarms, menuToggle, inputChange, increaseLength};

import { alarmExists, startTimer, clearTimers, resumeTimer, createAlarm } from "./alarms.js";
import { updateTime } from "./time.js";

// Popup
const createAlert = async (msg, alarmMustExist) => {
  const existing = document.getElementsByClassName("helppopup")[0]
  if (alarmMustExist && !await alarmExists()) return;
  if (existing) existing.remove();

  const dropDownButton = document.getElementsByClassName("dropdownbutton")[0];
  dropDownButton.insertAdjacentHTML("afterend", 
    `
    <div class="helppopup">
      <p>${msg}</p>
      <button id="closealert" type="button">&#215;&#xFE0E;</button>
    </div>
    `
  );
  const alertButton = document.getElementById("closealert");
  alertButton.addEventListener("click", () => {
    document.getElementsByClassName("helppopup")[0].remove();
  });
  return;
}

// Update play/pause icon in main button
const updateButton = (button, id, icon, title) => {
  button.innerHTML = `<i class="material-icons">${icon}</i>`;
  button.id = id;
  button.title= title;

  return;
}

const pauseAlarm = async() => {
  const secret = document.getElementsByClassName("secret")[0];
  const alarm = await alarmExists();
  if (!alarm) return;
  clearTimers();

  alarm.scheduledTime -= Date.now();
  alarm.paused = true;

  await chrome.storage.local.set({paused: true, activeAlarm: {alarm: alarm, length: secret}});
  return;
} 

const resumeAlarm = async() => {
  const storage = await chrome.storage.local.get(["activeAlarm"]);
  console.log(storage);

  await resumeTimer(storage.activeAlarm.alarm);
  chrome.storage.local.set({paused: false});
  return;
}

// Toggle play/pause button
const buttonToggle = async (button) => {
  const stopButton = document.getElementsByClassName("stopbutton")[0];

  if (button.id == "init") {
    clearTimers();
    updateButton(button, "start", "play_arrow", "Start session");
    updateTime();
    return;
  }

  button.classList.add("alarmbuttonactive");
  stopButton.classList.add("stopbuttonactive");
  if (button.id == "pause" || button.id == "paused") {
    if (button.id == "pause") await pauseAlarm();
    updateButton(button, "resume", "play_arrow", "Resume session");
    updateTime();
    return;
  }
  if (button.id == "resume") {
    await resumeAlarm();
    updateButton(button, "pause", "pause", "Pause session");
    updateTime();
    return;
  }
  if (button.id == "start") await startTimer();

  updateButton(button, "pause", "pause", "Pause session");
  updateTime();
  return;
}

const stopAlarms = async (button, stopButton) => {
  clearTimers();
  chrome.storage.local.set({paused: false});
  button.classList.remove("alarmbuttonactive");
  stopButton.classList.remove("stopbuttonactive");
  updateButton(button, "start", "play_arrow", "Start session");
  updateTime();
  return;
}

// Toggle between menus
const menuToggle = (button) => {
  button.id = (button.id == "down") ? "up" : "down";
  button.innerHTML = (button.id == "up") ? "Less &#9206;&#xFE0E;" : "More &#9207;&#xFE0E;";

  let div = document.getElementsByClassName("innermenu")[0];

  div.classList.toggle("innermenushow");
  return;
}

// Updates input
// First converts input.value to a valid number
// Then reflects value change to alarms
const inputChange = (inputListItem) => {
  let input = document.getElementById(inputListItem.id);
  input.value = (isNaN(parseFloat(input.value))) ? input.min : Math.round(parseFloat(input.value));
  if (input.value < parseInt(input.min)) input.value = parseInt(input.min);
  if (input.value > parseInt(input.max)) input.value = parseInt(input.max);

  chrome.storage.local.set({[input.id] : input.value})
  createAlert("Changes will be applied to all future alarms", true);
  input.blur();
  return;
}

// Increase time for current timer
const increaseLength = async () => {
  const alarm = await alarmExists();
  const alarmLength = document.getElementsByClassName("secret")[0].innerHTML;
  if (!alarm || alarm.paused) {
    createAlert("Alarm is not active", false);
    return;
  }
  let time = (alarm.scheduledTime-Date.now());

  await chrome.alarms.clear(alarm.name);
  
  if ((time+60000) < (alarmLength*60000)) {
    time += 60000
  } else {
    createAlert("Cannot adjust time past the original alarm's length", false);
  }
  createAlarm(alarm.name, Math.floor(time)/60000)
  return;
}