import { getStorageTime, updateTime } from "./time.js";
import { buttonToggle, menuToggle, inputChange } from "./menu.js";

import JSON from "../config.json" assert {type: 'json'};

document.addEventListener('DOMContentLoaded', async () => {
  let button = document.getElementsByClassName("alarmbutton")[0];
  let dropDownButton = document.getElementsByClassName("dropdownbutton")[0];
  let inputList = document.getElementsByClassName("timeinput");

  console.log(JSON.timeInputs);
  // Initialize play/pause button
  let alarm = await chrome.alarms.get("pomowork");
  if (!alarm) alarm = await chrome.alarms.get("pomobreak");
  if (alarm) button.id = "exist";
  
  buttonToggle(button);

  // Update displayed time
  // Update every 10000ms (10s)
  updateTime(); // Initial set
  setInterval(updateTime, 1000);

  // Listener for play/pause button
  button.addEventListener('click', () => {buttonToggle(button);});
  dropDownButton.addEventListener('click', () => {menuToggle(dropDownButton);});


  // Listen for input field changes
  for (const input of inputList) {
    document.getElementById(input.id).value = storage[input.id];
    input.addEventListener('change', ()=> {inputChange(input);})
  }
});