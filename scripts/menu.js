export {buttonToggle, menuToggle, inputChange};

import { alarmExists, startTimer, clearTimers } from "./alarms.js";
import { updateTime } from "./time.js";

// Popup
const createAlert = async (msg) => {
  const existing = document.getElementsByClassName("helppopup")[0]
  if (!await alarmExists()) return;
  if (existing) existing.remove();

  const dropDownButton = document.getElementsByClassName("dropdownbutton")[0];
  dropDownButton.insertAdjacentHTML("afterend", 
    `
    <div class="helppopup">
      <p>${msg}</p>
      <button id="closealert">&#215;&#xFE0E;</button>
    </div>
    `
  );
  const alertButton = document.getElementById("closealert");
  alertButton.addEventListener("click", () => {
    document.getElementsByClassName("helppopup")[0].remove();
  });
  return;
}

// Toggle disable on settings inputs
const updateTimeInputs = (inputList, boolean) => {
  for (const input of inputList) {
    const element = document.getElementById(input.id);
    
    if (element.title) element.removeAttribute("title");
    if (boolean) element.title="Cannot change time during an active session";

    element.disabled = boolean;
  }
  return;
}

// Update play/pause icon in main button
const updateButton = (button, id, icon, title) => {
  button.innerHTML = `<i class="material-icons">${icon}</i>`;
  button.id = id;
  button.title= title;
  return;
}

// Toggle play/pause button
const buttonToggle = async (button) => {
  //let inputList = document.getElementsByClassName("timeinput");

  if (button.id == "init" || button.id == "stop") {
    clearTimers();
    updateButton(button, "start", "play_arrow", "Start session");
    // updateTimeInputs(inputList, false);
    updateTime();
    return;
  }
  if (button.id == "start") await startTimer();

  updateButton(button, "stop", "stop", "Stop session");
  // updateTimeInputs(inputList, true);
  updateTime();
  return;
}

// Toggle between menus
const menuToggle = (button) => {
  button.id = (button.id == "down") ? "up" : "down";
  button.innerHTML = (button.id == "up") ? "Less &#9206;&#xFE0E;" : "More &#9207;&#xFE0E;";

  let div = document.getElementsByClassName("innermenu")[0];

  div.classList.toggle("innermenushow");
  return;
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
  createAlert("Changes will be applied to all future alarms");
  input.blur();
  return;
}