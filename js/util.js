"use strict";

var gTimer = 0;

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeId(length = 6) {
  var txt = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    txt += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return txt;
}

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getRandomEmptyCellPosition() {
  const emptyCells = [];
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      const cell = gBoard[i][j];
      if (!cell.gameElement && cell.type === FLOOR) {
        emptyCells.push({ i, j });
      }
    }
  }

  if (!emptyCells.length) return null;

  const randIdx = getRandomInt(0, emptyCells.length);
  return emptyCells[randIdx];
}

// get diagonal
function printPrimaryDiagonal(mat) {
  for (var d = 0; d < mat.length; d++) {
    var currItem = mat[d][d];
    console.log(currItem);
  }
}
// get diagonal
function printScondaryDiagonal(mat) {
  for (var d = 0; d < mat.length; d++) {
    var currItem = mat[d][mat.length - d - 1];
    console.log(currItem);
  }
}

// get random item from array
function getRandomItem(arr) {
  // get random index value
  const randomIndex = Math.floor(Math.random() * arr.length);

  // get random item
  const item = arr[randomIndex];

  return item;
}

//create matrix
function createMat(ROWS, COLS) {
  const mat = [];
  for (var i = 0; i < ROWS; i++) {
    const row = [];
    for (var j = 0; j < COLS; j++) {
      row.push("");
    }
    mat.push(row);
  }
  return mat;
}

// random
function getRandomInt(min, max) {
  var diff = max - min;
  var res = Math.floor(Math.random() * diff + min);
  return res;
}

// Timers
function updateTimer() {
  const currentTime = new Date().getTime();
  const elapsedTime = (currentTime - gStartTime) / 1000;
  gTimer = elapsedTime;
  gGame.secsPassed = elapsedTime;
  document.querySelector(".timer").innerText = elapsedTime.toFixed(2);
  return elapsedTime;
}

function startTimer() {
  gStartTime = new Date().getTime();
  gInterval = setInterval(updateTimer, 45);
}

function stopTimer() {
  clearInterval(gInterval);
  return gTimer;
}
