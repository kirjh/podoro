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

export { toggleHandler, toggleTools, sendMessage, updateInput, menuHandler, actionHandler, inputChange, increaseAlarmLength, updateProgress };

import { alarmExists, createAlarm } from "./alarms.js";

/*****************************************************************************/

//  @param:  (string) parameter of the request
const sendMessage = (param) => {
  chrome.runtime.sendMessage({backendRequest: param})
    .catch((e) => {console.log(`[${e}]\n Likely popup is not active`)});
}

/*****************************************************************************/

const toggleTools = () => {
  const header = document.getElementsByClassName("tabheadtools")[0];
  const menu = document.getElementsByClassName("tools")[0];

  menu.classList.toggle("show");
  header.classList.toggle("hideborder");
  
}

/*****************************************************************************/

//  @button:  (DOM object) menu button
const toggleHandler = (button) => {
  switch (button.id) {
    case "toggletheme":
      sendMessage("theme");
      break;
    case "toggleauto":
      sendMessage("toggleauto");
      break;
    default:
      break;
  }
}

/*****************************************************************************/

//  @button:  (DOM object) menu button
//  @args:    (array)      arguments
const actionHandler = (button, args) => {
  switch (button.id) {
    case "theme":
      sendMessage("theme");
      break;
    case "reset":
      sendMessage("setCounter")
      createAlert("Reseting number of pomodoros completed");
      break;
    case "increment":
      increaseAlarmLength();
      break;
    case "block": 
      toggleBlock();
    default:
      break;
  }
}

/*****************************************************************************/

//  @button:  (DOM object) menu button
const menuHandler = (button) => {
  const container = document.getElementsByClassName("togglecontainer")[0];
  const tab = document.getElementById(button.id + "tab");
  const togglebuttonList = document.getElementsByClassName("darktoolicon");
  
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
}

/*****************************************************************************/

//  @msg:             (string)  message to pass onto the user
//  @alarmMustExist:  (boolean) toggle whether an active alarm must exist     
const createAlert = async (msg, alarmMustExist=false) => {
  const existingAlert = document.getElementById("helppopup");
  const alarm = await alarmExists();
  if (alarmMustExist && !alarm) return;
  if (existingAlert) existingAlert.remove();

  const dropDownButton = document.getElementById("maincontainer");
  dropDownButton.insertAdjacentHTML("beforeend", 
    `
    <div id="helppopup">
      <span>${msg}</span>
      <button id="closealert" type="button">&#215;&#xFE0E;</button>
    </div>
    `
  );
  const alertButton = document.getElementById("closealert");
  alertButton.addEventListener("click", () => {
    document.getElementById("helppopup").remove();
  });
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
  }
  element.style.display = "none";
  return false;
}

/*****************************************************************************/

//  @inputListItem:  (DOM object) input
const inputChange = (inputListItem) => {
  const input = document.getElementById(inputListItem.id);

  input.value = (isNaN(parseFloat(input.value))) ? input.min : Math.round(parseFloat(input.value));
  if (input.value < parseInt(input.min)) input.value = parseInt(input.min);
  if (input.value > parseInt(input.max)) input.value = parseInt(input.max);

  chrome.storage.local.set({[input.id] : input.value})
  if (input.id != "pomointerval") {
    createAlert("Changes will be applied to your next session", true);
  }
  input.blur();
}

/*****************************************************************************/

//  @key    (string) input 
//  @value  (string) new value of input
const updateInput = (key, value) => {
  const input = document.getElementById(key);
  input.value = value;
}

/*****************************************************************************/

// Chrome API does not allow changes to be made to alarms, so
// the original alarm must be deleted and replaced with a new alarm.
const increaseAlarmLength = async () => {
  const alarm = await alarmExists();
  const alarmLength = await chrome.storage.local.get("currentAlarm").then((r) => {return r.currentAlarm});

  if (!alarm || alarm.paused) {
    createAlert("Cannot adjust time when there are no active sessions");
    return;
  }

  let time = (alarm.scheduledTime-Date.now());
  await chrome.alarms.clear(alarm.name);
  
  if (time + 60000 < alarmLength * 60000) {
    time += 60000
  } else {
    createAlert("Cannot adjust time past the session's original length");
  }
  if (time < 60000) time = 60000;

  createAlarm(alarm.name, time/60000)
}

/*****************************************************************************/

const toggleBlock = () => {
  createAlert("Error: function not implemented");
}

/*****************************************************************************/

//  @intervalLength:  (number) long break interval
const updateProgress = async (intervalLength = null) => {
  if (!intervalLength) {
    const storage = await chrome.storage.local.get("pomointerval");
    intervalLength = storage.pomointerval;
  }
  const progressBar = document.getElementById("currentprogress");
  const sessionStorage = await chrome.storage.session.get("pomocount");
  const alarm = await alarmExists();
  if (!alarm) {
    progressBar.style.width = "0%";
    return;
  }
  if (alarm.name == "pomobreaklong") {
    progressBar.style.width = "100%";
    return;
  }
  const progress = ((sessionStorage.pomocount % intervalLength) / intervalLength) * 100;
  progressBar.style.width = `${progress}%`;
}

/*****************************************************************************/