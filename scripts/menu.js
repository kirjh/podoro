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

export { changeButtonColour, togglePrimaryButton, toggleStopButton, menuHandler, actionHandler, inputChange, increaseAlarmLength, setCounter };

import { alarmExists, startSession, clearAlarm, createAlarm, pauseSession, resumeSession } from "./alarms.js";
import { updateTime } from "./time.js";

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
  return;
}

/*****************************************************************************/

//  @alarmName:  (number) name of alarm
const changeButtonColour = (alarmName) => {
  const clockElements = [document.getElementsByClassName("alarmbutton")[0]];
  clockElements.push(document.getElementsByClassName("stopbutton")[0]);
  clockElements.push(document.getElementsByClassName("pointer")[0]);

  for (const element of clockElements) {
    switch (alarmName) {
      case "pomobreak":
        chrome.action.setIcon({path: "../icons/green_pomo64.png"});
        element.classList.add("greenalarm");
        element.classList.remove("bluealarm");
        break;
      case "pomobreaklong":
        chrome.action.setIcon({path: "../icons/blue_pomo64.png"});
        element.classList.add("bluealarm");
        element.classList.remove("greenalarm");
        break;
      default:
        chrome.action.setIcon({path: "../icons/pomo64.png"});
        element.classList.remove("greenalarm");
        element.classList.remove("bluealarm");
        break;
    }
  }
}

/*****************************************************************************/

//  @button:  (DOM object) button to apply changes to
//  @id:      (string)     new id
//  @icon:    (string)     new icon name
const updateButton = (button, id, icon) => {
  if (icon == "pause") {
    button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="svgbutton" viewBox="0 0 320 512"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/></svg>`;
  } else {
    button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="svgbutton" viewBox="0 0 384 512"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>`;
  }
  
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
    updateButton(button, "start", "play_arrow");
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
  changeButtonColour("pomowork");
  setCounter(0);
  chrome.storage.local.set({paused: false});
  button.classList.remove("alarmbuttonactive");
  stopButton.classList.remove("stopbuttonactive");
  updateButton(button, "start", "play_arrow");
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
  const container = document.getElementsByClassName("togglecontainer")[0];
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

//  @init:  (boolean) called on init
const changeTheme = (init = false) => {
  const tabs = document.getElementsByClassName("tab");
  const accentElements = document.getElementsByClassName("lightaccent");
  const fontElements = document.getElementsByClassName("lightfont");
  const borderElements = document.getElementsByClassName("lightborder");
  const iconElements = document.getElementsByClassName("darkicon");
  const playbutton = document.getElementsByClassName("alarmbutton")[0];
  const stopbutton = document.getElementsByClassName("stopbutton")[0];
  const subtextElements = document.getElementsByClassName("subtext");
  const linkElements = document.getElementsByClassName("githublink");

  if (!playbutton.classList.contains("darkfont")) {
    chrome.storage.local.set({theme: "dark"});
  } else {
    chrome.storage.local.set({theme: "light"});
  }

  for (const tab of tabs) {
    tab.classList.toggle("darktab");
  }
  for (const element of accentElements) {
    element.classList.toggle("darkaccent");
  }
  playbutton.classList.toggle("darkfont");
  playbutton.classList.toggle("darkborder");
  stopbutton.classList.toggle("darkfont");
  playbutton.classList.toggle("darkborder");
  for (const element of fontElements) {
    element.classList.toggle("darkfont");
  }
  for (const element of iconElements) {
    element.classList.toggle("darkfont");
  }
  for (const element of subtextElements) {
    element.classList.toggle("darksubtext");
  }
  for (const element of linkElements) {
    element.classList.toggle("darklink");
  }
  for (const element of borderElements) {
    element.classList.toggle("darkborder");
  }
  
  return;
}

/*****************************************************************************/

//  @inputListItem: (DOM object) input
const inputChange = (inputListItem) => {
  let input = document.getElementById(inputListItem.id);

  input.value = (isNaN(parseFloat(input.value))) ? input.min : Math.round(parseFloat(input.value));
  if (input.value < parseInt(input.min)) input.value = parseInt(input.min);
  if (input.value > parseInt(input.max)) input.value = parseInt(input.max);

  chrome.storage.local.set({[input.id] : input.value})
  if (input.id != "pomointerval") {
    createAlert("Changes will be applied to your next session", true);
  }
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
  return;
}

/*****************************************************************************/

//  @pomodoro:  (number) number of pomodoros elapsed
//  @alert:     (boolean) toggle creation of an alert
const setCounter = (pomodoro, alert=false) => {
  return; // TODO: remove
  const pomoCounter = document.getElementById("reset");
  pomoCounter.innerHTML = pomodoro;
  chrome.storage.session.set({pomocount: pomodoro});
  
  if (alert) createAlert("Reset number of pomodoros completed");
  return;
}

/*****************************************************************************/

//  @button:  (DOM object) menu button
//  @args:    (array)      arguments
const actionHandler = (button, args) => {
  switch (button.id) {
    case "theme":
      changeTheme();
      break;
    case "reset":
      setCounter(0, true);
      break;
    case "increment":
      increaseAlarmLength();
      break;
    default:
      break;
  }
}

/*****************************************************************************/