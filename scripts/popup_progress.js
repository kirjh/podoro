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

export { updateBreakText }

/*****************************************************************************/

//  @num:  (integer) sessions remaining until long break; can be null value
const updateBreakText = (num) => {
    const text = document.getElementById("nexttextbox");
    if (!num) {
        text.innerText = "Enjoy the break!";
        return;
    }
    text.innerText = "Long break in " + (num > 1 ? `${num} sessions` : "1 session");
}