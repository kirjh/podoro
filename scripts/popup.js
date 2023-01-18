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

import { alarmExists } from "./alarms.js";
import { setSecret, getTimeFromStorage, updateTime } from "./time.js";
import { togglePrimaryButton, toggleStopButton, menuHandler, actionHandler, inputChange } from "./menu.js";
import JSON from '../manifest.json' assert {type: 'json'};

/*****************************************************************************/

// Call when the extension is opened, and initializes everything the 
// popup needs to work correctly.
document.addEventListener('DOMContentLoaded', async () => {
  const primaryButton = document.getElementsByClassName("alarmbutton")[0];
  const stopButton = document.getElementsByClassName("stopbutton")[0];
  const inputList = document.getElementsByClassName("timeinput");
  const actionButtonList = document.getElementsByClassName("toolicon");
  const toggleButtonList = document.getElementsByClassName("darkicon");
  const versionLinks = document.getElementsByClassName("githublink");

  // Update version
  for (const link of versionLinks) {
    link.innerHTML = JSON.version;
  }

  const storedTime = await getTimeFromStorage();
  const storage = await chrome.storage.local.get("theme");
  const sessionStorage = await chrome.storage.session.get("pomocount");
  if (!sessionStorage.pomocount) sessionStorage.pomocount = 0;

  const alarm = await alarmExists();
  
  // Initialize active/inactive state
  if (alarm) {
    primaryButton.id = (alarm.paused) ? "paused" : "exist";
    let alarmTime = await chrome.storage.local.get("currentAlarm");
    if (alarmTime.currentAlarm) await setSecret(alarmTime.currentAlarm);
  } else {
    await setSecret(storedTime.pomowork);
    chrome.storage.local.set({paused: false});
  }
  if (storage.theme && storage.theme == "dark") {
    const button = document.getElementById("theme");
    actionHandler(button, true);
  }

  togglePrimaryButton(primaryButton);
  // setCounter(sessionStorage.pomocount);
  setInterval(updateTime, 1000);

  // Listeners
  primaryButton.addEventListener('click', () => {togglePrimaryButton(primaryButton);});
  stopButton.addEventListener('click', () => {toggleStopButton(primaryButton, stopButton);});
  // pomoCounter.addEventListener('click', () => {setCounter(0, true)});

  // increaseTime.addEventListener('click', () => {increaseAlarmLength();});

  for (const button of toggleButtonList) {
    button.addEventListener('click', ()=> {menuHandler(button);})
  }
  for (const button of actionButtonList) {
    button.addEventListener('click', ()=> {actionHandler(button);})
  }
  for (const input of inputList) {
    document.getElementById(input.id).value = storedTime[input.id];
    input.addEventListener('change', ()=> {inputChange(input);})
  }

  // Sync values between length of active alarm and local variable.
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.pomomsg) {
      setSecret(message.pomomsg);
    }
    if (message.pomocount) {
      setCounter(message.pomocount);
    }
  });
});

/*****************************************************************************/