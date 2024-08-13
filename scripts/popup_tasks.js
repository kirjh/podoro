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

export { createTask, addTask, completeTask, closeTask, updateTasks };
import { sendMessage } from "./popup_handler.js";

/*****************************************************************************/

const completeTask = (task) => {
  const e = document.getElementById(task.guid);
  console.log(`complete${e}`);
  if (!e) return;
  if (task.complete) 
    e.classList.add("complete")
  else
    e.classList.remove("complete")
  //e.classList.contains("complete") ? e.classList.remove("complete") : e.classList.add("complete");
}

/*****************************************************************************/

const closeTask = (guid) => {
  const e = document.getElementById(guid);
  console.log(`remove${e}`);
  if (!e) return;
  e.remove();
}

/*****************************************************************************/

const addTask = (input) => {
  let textNode = document.createTextNode(input.text);

  const task = document.createElement("li");
  const text = document.createElement("span");
  const close = document.createElement("span");

  text.appendChild(textNode);
  text.className = "tasktext";
  text.addEventListener("click", (e)=>{sendMessage("completeTask", e.currentTarget.parentNode.id);});

  close.innerHTML = "\u00D7";
  close.className = "closetask";
  close.addEventListener("click", (e)=>{sendMessage("closeTask", e.currentTarget.parentNode.id);});
  
  task.appendChild(text);
  task.appendChild(close);
  task.id = input.guid;
  if (input.complete)
    task.className = "taskitem complete";
  else
    task.className = "taskitem";

  document.getElementById("createtask").value = "";
  document.getElementById("tasklist").appendChild(task);
}

/*****************************************************************************/

const createTask = () => {
  const text = document.getElementById("createtask").value;
  if (!text) return;

  sendMessage("addTask", text);
}

/*****************************************************************************/

const updateTasks = async () => {
  const storage = await chrome.storage.local.get("tasks");
  if (!storage.tasks) return;

  console.log(storage.tasks);
  for (const task in storage.tasks) {
    console.log(storage.tasks[task]);
    addTask(storage.tasks[task]);
  }
}