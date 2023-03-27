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
import { sendMessage, togglePrimaryButton, toggleStopButton, menuHandler, actionHandler, inputChange, setCounter, changeButtonColour, updateProgress } from "./menu.js";
import JSON from '../manifest.json' assert {type: 'json'};

/*****************************************************************************/

const runFrontend = {
  startTimer: (param) => {togglePrimaryButton("start");},
  resumeTimer: (param) => {togglePrimaryButton("resume");},
  pauseTimer: (param) => {togglePrimaryButton("pause");},
  
  stopTimer: (param) => {toggleStopButton();},

  setSecret: (param) => {setSecret(param);},
  changeButtonColour: (param) => {changeButtonColour(param);},
  setCounter: (param) => {setCounter(param); 
                          updateProgress();},
  updateProgress: (param) => updateProgress(param)     

}

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
  const borderElements = document.getElementsByClassName("lightborder");

  // Update version
  for (const link of versionLinks) {
    link.innerHTML = JSON.version;
  }

  // Retrive data from storage
  const storedTime = await getTimeFromStorage();
  const storage = await chrome.storage.local.get("theme");
  //const sessionStorage = await chrome.storage.session.get("pomocount");
  //if (!sessionStorage.pomocount) sessionStorage.pomocount = 0;

  const alarm = await alarmExists();
  
  // Initialize active/inactive state
  if (alarm) {
    primaryButton.id = (alarm.paused) ? "pause" : "start";
    let alarmTime = await chrome.storage.local.get("currentAlarm");
    if (alarmTime.currentAlarm) {
      changeButtonColour(alarm.name);
      setSecret(alarmTime.currentAlarm);
    }
  } else {
    changeButtonColour("pomowork");
    setSecret(storedTime.pomowork);
    // chrome.storage.local.set({paused: false});
  }
  if (storage.theme && storage.theme == "dark") {
    actionHandler(document.getElementById("theme"));
  }
  setTimeout(()=> {
    for (const element of borderElements) {
      element.classList.add("animatedbackground");
    }
    primaryButton.classList.add("animatedbackground");
    stopButton.classList.add("animatedbackground");
  },500);

  togglePrimaryButton(primaryButton.id);
  //setCounter(sessionStorage.pomocount);
  updateTime();
  setInterval(updateTime, 1000);
  updateProgress();

  // Listeners
  primaryButton.addEventListener('click', () => {sendMessage(`${primaryButton.id}Timer`)});
  stopButton.addEventListener('click', () => {sendMessage(`stopTimer`)});

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

  // Message handler passes message onto the relevant function
  // Use to sync background updates to instance of itself
  chrome.runtime.onMessage.addListener((message) => {
    if (message.frontendRequest) {
      runFrontend[message.frontendRequest](message.param);
    }
  });
});

/*****************************************************************************/