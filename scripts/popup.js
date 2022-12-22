import { createWorkAlarm } from "./alarms.js";

// Create an alarm 
const createTimer = () => {
  console.log("creating timer");
  createWorkAlarm();
  return;
}

// Clear pomo alarms
const clearTimers = async () => {
  console.log("clearing timers");
  await chrome.alarms.clear("pomowork")
  await chrome.alarms.clear("pomobreak")
  return;
}

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

// Update the time displayed by pomopomo every interval
const updateTime = async () => {
  let timeDisplay = document.getElementById("timeDisplay");
  let clockPointer = document.getElementById("clockPointer");
  let alarm = await chrome.alarms.get("pomowork");
  if (!alarm) alarm = await chrome.alarms.get("pomobreak");
  if (!alarm) {
    timeDisplay.innerHTML = "25";
    clockPointer.style.setProperty("transform", "rotate(0)");
    return;
  }
  let time = Math.ceil((alarm.scheduledTime-Date.now())/60000);
  // REPLACE 25 WITH VARIABLE LATER
  if (alarm.name == "pomowork" && time > 25) time = 25;
  if (alarm.name == "pomobreak" && time > 5) time = 5;

  timeDisplay.innerHTML = time;
  // REPLACE 25 WITH VARIABLE LATER
  clockPointer.style.setProperty("transform", `rotate(${-((360/25)*time)}deg)`);
  console.log(`At ${-((360/25)*time)} degrees`);
  return;
}

document.addEventListener('DOMContentLoaded', async () => {
  let button = document.getElementsByClassName("alarmbutton")[0];
  let dropDownButton = document.getElementsByClassName("dropdownbutton")[0];
  
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



  
});