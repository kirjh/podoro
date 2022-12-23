export {buttonToggle, menuToggle, inputChange};

import { createTimer, clearTimers } from "./alarms.js";
import { updateTime } from "./time.js";

// Toggle play/pause button
const buttonToggle = (button) => {
  if (button.id == "init" || button.id == "stop") {
    clearTimers();
    button.innerHTML = "Start";
    button.id = "start";
    updateTime();
    return;
  }
  if (button.id == "start") createTimer();
  button.innerHTML = "Stop";
  button.id = "stop"
  updateTime();
  return;
}

// Toggle between menus
const menuToggle = (button) => {
  button.id = (button.id == "down") ? "up" : "down";
  button.innerHTML = (button.id == "up") ? "up" : "down";

  let divs = document.getElementsByClassName("dropdown");

  for (let div of divs) {
    div.classList.toggle("dropdownshow");
  }
}

// Updates input
// First converts input.value to a valid number
// Then reflects value change to alarms
const inputChange = (inputListItem) => {
  let input = document.getElementById(inputListItem.id);
  input.value = (isNaN(parseFloat(input.value))) ? input.value = input.min : Math.round(parseFloat(input.value));
  if (input.value < parseInt(input.min)) input.value = parseInt(input.min);
  if (input.value > parseInt(input.max)) input.value = parseInt(input.max);

  chrome.storage.local.set({[input.id] : input.value})
}