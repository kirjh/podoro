import { alarmExists } from "./alarms.js";
import { setSecret, getTimeFromStorage, updateTime } from "./time.js";
import { togglePrimaryButton, toggleStopButton, toggleMenu, inputChange, increaseAlarmLength, setCounter } from "./menu.js";
import JSON from '../manifest.json' assert {type: 'json'};

/*****************************************************************************/

// Call when the extension is opened, and initializes everything the 
// popup needs to work correctly.
document.addEventListener('DOMContentLoaded', async () => {
  const primaryButton = document.getElementsByClassName("alarmbutton")[0];
  const stopButton = document.getElementsByClassName("stopbutton")[0];
  const dropDownButton = document.getElementsByClassName("dropdownbutton")[0];
  const inputList = document.getElementsByClassName("timeinput");
  const increaseTime = document.getElementsByClassName("adjusttime")[0];
  const pomoCounter = document.getElementsByClassName("pomocounter")[0];
  const ver = document.getElementById("Version");

  // Update version
  ver.innerHTML = JSON.version;

  const storage = await getTimeFromStorage();
  const sessionStorage = await chrome.storage.session.get("pomocount");
  if (!sessionStorage.pomocount) sessionStorage.pomocount = 0;

  const alarm = await alarmExists();
  
  // Initialize active/inactive state
  if (alarm) {
    primaryButton.id = (alarm.paused) ? "paused" : "exist";
    let alarmTime = await chrome.storage.local.get("currentAlarm");
    if (alarmTime.currentAlarm) await setSecret(alarmTime.currentAlarm);
  } else {
    await setSecret(storage.pomowork);
    chrome.storage.local.set({paused: false});
  }
  togglePrimaryButton(primaryButton);
  setCounter(sessionStorage.pomocount);
  setInterval(updateTime, 1000);

  // Listeners
  primaryButton.addEventListener('click', () => {togglePrimaryButton(primaryButton);});
  stopButton.addEventListener('click', () => {toggleStopButton(primaryButton, stopButton);});
  dropDownButton.addEventListener('click', () => {toggleMenu(dropDownButton);});
  pomoCounter.addEventListener('click', () => {setCounter(0, true)});

  increaseTime.addEventListener('click', () => {increaseAlarmLength();});

  for (const input of inputList) {
    document.getElementById(input.id).value = storage[input.id];
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