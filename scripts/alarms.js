export {createTimer, clearTimers, createAlarm};

// Create an alarm 
const createTimer = async () => {
  console.log("creating timer");
  const time = await chrome.storage.local.get(["pomowork"]);
  createAlarm("pomowork", parseInt(time.pomowork));
  return;
}

// Clear pomo alarms
const clearTimers = async () => {
  console.log("clearing timers");
  await chrome.alarms.clear("pomowork")
  await chrome.alarms.clear("pomobreak")
  return;
}

const createAlarm = (name, time) => {
  chrome.alarms.create(name, {delayInMinutes: time});
  console.log(`created alarm "${name}" with a delay of (${time}) minutes`);
  return;
}