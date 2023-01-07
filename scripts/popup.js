import { alarmExists } from "./alarms.js";
import { setSecret, getStorageTime, updateTime } from "./time.js";
import { buttonToggle, stopAlarms, menuToggle, inputChange, increaseLength } from "./menu.js";

document.addEventListener('DOMContentLoaded', async () => {
  const button = document.getElementsByClassName("alarmbutton")[0];
  const stopButton = document.getElementsByClassName("stopbutton")[0];
  const dropDownButton = document.getElementsByClassName("dropdownbutton")[0];
  const inputList = document.getElementsByClassName("timeinput");
  const increaseTime = document.getElementsByClassName("adjusttime")[0];

  const storage = await getStorageTime();

  // Initialize play/pause button
  // If alarm exists, retrieve it and set the hidden value to its length
  const alarm = await alarmExists();
  
  if (alarm) {
    button.id = (alarm.paused) ? "paused" : "exist";
    let alarmTime = await chrome.storage.local.get("currentAlarm");
    if (alarmTime.currentAlarm) await setSecret(alarmTime.currentAlarm);
  } else {
    await setSecret(storage.pomowork);
    chrome.storage.local.set({paused: false});
  }
  
  buttonToggle(button);

  // Update displayed time
  // Update every 10000ms (10s)
  setInterval(updateTime, 1000);

  // Listener for menu buttons
  button.addEventListener('click', () => {buttonToggle(button);});
  stopButton.addEventListener('click', () => {stopAlarms(button, stopButton);});
  dropDownButton.addEventListener('click', () => {menuToggle(dropDownButton);});

  // Listen for alarm increase request
  increaseTime.addEventListener('click', () => {increaseLength();});

  // Listen for input field changes
  for (const input of inputList) {
    document.getElementById(input.id).value = storage[input.id];
    input.addEventListener('change', ()=> {inputChange(input);})
  }

  // WIP
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.pomomsg) {
      setSecret(message.pomomsg);
    }
  });
});