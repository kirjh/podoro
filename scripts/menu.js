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

export { togglePrimaryButton, toggleStopButton, menuHandler, actionHandler, inputChange, increaseAlarmLength };

import { alarmExists, startSession, clearAlarm, createAlarm, pauseSession, resumeSession } from "./alarms.js";
import { updateTime } from "./time.js";

/*****************************************************************************/

/*
//  @msg:             (string)  message to pass onto the user
//  @alarmMustExist:  (boolean) toggle whether an active alarm must exist     
const createAlert = async (msg, alarmMustExist=false) => {
  const existingAlert = document.getElementsByClassName("helppopup")[0]
  if (alarmMustExist && !await alarmExists()) return;
  if (existingAlert) existingAlert.remove();

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
*/

/*****************************************************************************/

//  @button:  (DOM object) button to apply changes to
//  @id:      (string)     new id
//  @icon:    (string)     new icon name
const updateButton = (button, id, icon) => {
  button.innerHTML = `<i class="material-icons">${icon}</i>`;
  button.id = id;

  return;
}

/*****************************************************************************/

// @button:  (DOM object) button to apply changes to
const togglePrimaryButton = async (button) => {
  const stopButton = document.getElementsByClassName("stopbutton")[0];

  // init condition does not need to add classes to the two buttons
  // so it is separated from the switch statement and returns early.
  if (button.id == "init") {
    clearAlarm();
    updateButton(button, "start", "play_arrow", "Start session");
    updateTime();
    return;
  }

  button.classList.add("alarmbuttonactive");
  stopButton.classList.add("stopbuttonactive");

  switch (button.id) {
    case "pause":
      await pauseSession();
      updateButton(button, "resume", "play_arrow");
      break;
    case "paused":
      updateButton(button, "resume", "play_arrow");
      break;
    case "resume":
      await resumeSession();
      updateButton(button, "pause", "pause");
      break;
    case "start":
      await startSession();
      updateButton(button, "pause", "pause");
      break;
    default:
      updateButton(button, "pause", "pause");
      break;
  }

  updateTime();
  return;
}

/*****************************************************************************/

//  @button:      (DOM object) play/pause button
//  @stopButton:  (DOM object) stop button
const toggleStopButton = async (button, stopButton) => {
  clearAlarm();
  // setCounter(0);
  chrome.storage.local.set({paused: false});
  button.classList.remove("alarmbuttonactive");
  stopButton.classList.remove("stopbuttonactive");
  updateButton(button, "start", "play_arrow", "Start session");
  updateTime();
  return;
}

/*****************************************************************************/

//  @element:    (DOM object) element
//  @display:    (string)     display property
//  @forceDisplay:  (boolean)    force display property 
//
//  Returns: true if tab was opened, false otherwise
const toggleTab = (element, display, forceDisplay = false) => {
  if (forceDisplay || !element.style.display || element.style.display == "none") {
    element.style.display = display;
    return true;
  } else {
    element.style.display = "none";
    return false;
  }
}
/*****************************************************************************/

//  @button:  (DOM object) menu button
const menuHandler = (button) => {
  const container = document.getElementById("togglecontainer");
  const tab = document.getElementById(button.id + "tab");
  const togglebuttonList = document.getElementsByClassName("darkicon");
  
  if (button.id == "help") {
    chrome.tabs.create({"url": "https://github.com/kirjh/podoro/wiki"});
    return;
  }

  const tabOpened = toggleTab(tab, "flex");
  toggleTab(container, "flex", tabOpened);
  

  for (const togglebutton of togglebuttonList) {
    if (togglebutton.classList.contains("activeicon")) {
      const tab = document.getElementById(togglebutton.id + "tab");
      toggleTab(tab, "none", true);
    }
    togglebutton.classList.remove("activeicon");
  }
  
  if (tabOpened) button.classList.add("activeicon");

  return;
}
/*****************************************************************************/

//  @button:  (DOM object) menu button
const actionHandler = (button) => {
  switch (button.id) {
    case "theme":
      // changeTheme();
      break;
    default:
      break;
  }
}

/*****************************************************************************/

//  @inputListItem: (DOM object) input
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

/*****************************************************************************/

// Chrome API does not allow changes to be made to alarms, so
// the original alarm must be deleted and replaced with a new alarm.
const increaseAlarmLength = async () => {
  const alarm = await alarmExists();
  const alarmLength = document.getElementsByClassName("secret")[0].innerHTML;

  if (!alarm || alarm.paused) {
    createAlert("Could not find an active alarm to increase length of");
    return;
  }

  let time = (alarm.scheduledTime-Date.now());
  await chrome.alarms.clear(alarm.name);
  
  if (time + 60000 < alarmLength * 60000) {
    time += 60000
  } else {
    createAlert("Cannot adjust time past the original alarm's length");
  }
  createAlarm(alarm.name, time/60000)
  return;
}

/*****************************************************************************/

/*
//  @pomodoro:  (number) number of pomodoros elapsed
//  @alert:     (boolean) toggle creation of an alert
const setCounter = (pomodoro, alert=false) => {
  const pomoCounter = document.getElementsByClassName("pomocounter")[0];
  pomoCounter.innerHTML = pomodoro;
  chrome.storage.session.set({pomocount: pomodoro});
  
  if (alert) createAlert("Reset count of completed pomodoros");
  return;
}
*/