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

export { setTheme, setCounter, toggleAuto };
 
/*****************************************************************************/

const setTheme = async () => {
    const storage = await chrome.storage.local.get("theme");
  
    if (storage.theme == "dark") {
      chrome.storage.local.set({theme: "light"});
      return true;
    } else {
      chrome.storage.local.set({theme: "dark"});
      return false;
    }
  }
  
/*****************************************************************************/
  
//  @pomodoro:  (number) number of pomodoros elapsed
const setCounter = async (pomodoro) => {
  await chrome.storage.session.set({pomocount: pomodoro});
  return null;
}

/*****************************************************************************/

const toggleAuto = async () => {
  const storage = await chrome.storage.local.get(["toggleauto"]);
  let updatedValue = storage.toggleauto ? false : true;
  chrome.storage.local.set({toggleauto: updatedValue});
  return updatedValue;
}

  