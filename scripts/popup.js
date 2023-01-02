import { alarmExists } from "./alarms.js";
import { setSecret, getStorageTime, updateTime } from "./time.js";
import { buttonToggle, menuToggle, inputChange } from "./menu.js";

document.addEventListener('DOMContentLoaded', async () => {
  let button = document.getElementsByClassName("alarmbutton")[0];
  let dropDownButton = document.getElementsByClassName("dropdownbutton")[0];
  let inputList = document.getElementsByClassName("timeinput");

  const storage = await getStorageTime();

  // Initialize play/pause button
  // If alarm exists, retrieve it and set the hidden value to its length
  const alarm = await alarmExists();
  if (alarm) {
    button.id = "exist";
    let alarmTime = await chrome.storage.local.get([alarm.name]);
    await setSecret(alarmTime[alarm.name]);
  } 
  
  buttonToggle(button);

  // Update displayed time
  // Update every 10000ms (10s)
  updateTime(); // Initial set
  setInterval(updateTime, 1000);

  // Listener for menu buttons
  button.addEventListener('click', () => {buttonToggle(button);});
  dropDownButton.addEventListener('click', () => {menuToggle(dropDownButton);});


  // Listen for input field changes
  for (const input of inputList) {
    document.getElementById(input.id).value = storage[input.id];
    input.addEventListener('change', ()=> {inputChange(input);})
  }

  // WIP
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.pomomsg) {
      console.log(message.pomomsg);
      console.log(sender);
    }
  });
});