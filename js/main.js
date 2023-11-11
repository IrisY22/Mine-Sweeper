"use strict";

var safeCount = 3;

var gHistory = [];
var lastMoves = [];

var darkMode = false;

const BOMB = "💣";
const FLAG = "🚩";

var gStartTime;
var gInterval;
var tempCounter = 0;

var gBoard;
var gElSelected = null;
var gBombArr = [];
var gEmptyCell = [];
var life = 3;

var gLevel = {
  SIZE: 4,
  MINES: 3,
};

var gGame = {
  isOn: false,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
};

function onInit() {
  document.querySelector(".life").textContent = life;
  gGame.isOn = true;
  gGame.shownCount = 0;

  gBoard = buildBoard();
  renderBoard(gBoard);

  stopTimer();
  document.querySelector(".timer").innerText = "0:00";

  renderLife(life);
}

function buildBoard() {
  const board = createMat(gLevel.SIZE, gLevel.SIZE);

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      var cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
      };

      board[i][j] = cell;
    }
  }

  return board;
}

function renderBoard(gBoard) {
  var strHtml = "";
  const elBoard = document.querySelector(".board");
  for (var i = 0; i < gBoard.length; i++) {
    strHtml += `<tr>\n`;

    for (var j = 0; j < gBoard[i].length; j++) {
      const currCell = gBoard[i][j];

      var className = `cell cell-${i + 1}-${j + 1}`;
      if (!currCell.isShown) {
        strHtml += `\t<td class="${className}"  data-i="${i}" data-j="${j}" onclick="onCellClicked(this,${i}, ${j})"  oncontextmenu="flag(this,event,${i}, ${j})"></td>\n`;
      } else if (currCell.isMine) {
        strHtml += `\t<td class="${className}"  data-i="${i}" data-j="${j}" onclick="onCellClicked(this,event, ${i}, ${j})">${BOMB}</td>\n`;
      } else {
        strHtml += `\t<td class="${className}"  data-i="${i}" data-j="${j}" onclick="onCellClicked(this,event, ${i}, ${j})"></td>\n`;
      }
    }
    strHtml += `</tr>\n`;
  }

  elBoard.innerHTML = strHtml;
}

function renderCell(elCell, isMine, minesAroundCount, isMarked) {
  if (isMine) {
    elCell.textContent = BOMB;
  } else if (isMarked) {
    elCell.textContent = FLAG;
  } else {
    elCell.textContent = minesAroundCount;
    elCell.classList.add("selected");
  }
}

function flag(elCell, event, i, j) {
  lastMoves = [{ i, j }];
  event.preventDefault();
  var cell = gBoard[i][j];
  if (cell.isShown) return;
  cell.isMarked = true;
  renderCell(elCell, false, 0, true);
  gGame.markedCount++;
  gHistory.push(lastMoves);
  victory();
}

function gameLevel(setSize, setMines) {
  gLevel.SIZE = setSize;
  gLevel.MINES = setMines;
  resetGame();
}

function cellNeighbourBomb(board, rowIdx, colIdx) {
  var mainCell = board[rowIdx][colIdx];
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= board.length) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (i === rowIdx && j === colIdx) continue;
      if (j < 0 || j >= board[0].length) continue;
      var currCell = board[i][j];
      if (currCell.isMine) mainCell.minesAroundCount++;
    }
  }
}

function setMinesNegsCount(board) {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      cellNeighbourBomb(board, i, j);
    }
  }
}

function firstClick() {
  startTimer();
  getRandomEmptyCellPosition();
  for (let i = 0; i < gLevel.MINES; i++) {
    createBombRandomly();
  }
  setMinesNegsCount(gBoard);
}

function onCellClicked(elCell, i, j) {
  lastMoves = [{ i, j }];

  const currCell = gBoard[i][j];
  if (currCell.isShown) return;

  var idx = findByLocation(gEmptyCell, i, j);
  gEmptyCell.splice(idx, 1);

  if (gGame.shownCount === 0) {
    currCell.isShown = true;
    firstClick();
  }

  currCell.isShown = true;

  if (currCell.isMarked) {
    currCell.isMarked = false;
    gGame.markedCount--;
  }

  if (currCell.isMine) {
    renderCell(elCell, true, 0);
    bombClicked(elCell);
  } else {
    fullExpand(elCell, i, j);
  }
  gHistory.push(lastMoves);
  victory();
}

function bombClicked(elCell) {
  life--;
  renderLife(life);
  if (life > 0) {
    elCell.style.backgroundColor = "#ff6b6b";
  } else gameOver();
}

function showAllBomb() {
  for (let i = 0; i < gBombArr.length; i++) {
    var location = gBombArr[i];
    var elCell = document.querySelector(
      `[data-i="${location.i}"][data-j="${location.j}"]`
    );
    elCell.textContent = BOMB;
    elCell.style.backgroundColor = "#ff8787";
  }
}

function gameOver() {
  const elPopup = document.querySelector(".popup");
  elPopup.innerText = `YOU LOSE!`;
  elPopup.hidden = false;
  elPopup.style.display = "flex";

  var emojiBtn = document.querySelector(".resetBtn");
  emojiBtn.textContent = `😓`;
  setShownOn();

  gGame.isOn = false;
  showAllBomb();
  stopTimer();
}

function setShownOn() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      gBoard[i][j].isShown = true;
    }
  }
}

function victory() {
  var sum = gGame.shownCount + gLevel.MINES;
  if (
    sum !== gLevel.SIZE ** 2 ||
    gGame.shownCount !== gLevel.SIZE ** 2 - gLevel.MINES
  ) {
    return;
  }
  var timer = stopTimer();
  var emojiBtn = document.querySelector(".resetBtn");
  emojiBtn.textContent = `😎`;
  const elPopup = document.querySelector(".popup");
  elPopup.innerHTML = `<div>YOU WIN!</div>`;
  elPopup.style.display = "flex";
  const playerName = prompt("Well Done! Please enter your name Champ: ");
  var playerData = {
    playerName: playerName,
    score: timer,
  };
  saveData(playerData);
}

function saveData(playerData) {
  var storedValue = localStorage.getItem("scoreList");

  if (storedValue === null) {
    storedValue = [];
  } else {
    storedValue = JSON.parse(storedValue);
  }
  storedValue.push(playerData);
  localStorage.setItem("scoreList", JSON.stringify(storedValue));
  showBestScore(storedValue);
}

function showBestScore(scoreArr) {
  const elPopup = document.querySelector(".popup");
  var scoreHtml = `<ol class="scoreList">LAST SCORES:`;
  for (let i = 0; i < scoreArr.length && i < 3; i++) {
    var playerData = scoreArr[i];
    var li = `<li>  ${playerData.playerName} Score: ${playerData.score}</li>`;
    scoreHtml += li;
  }
  scoreHtml += `</ol>`;
  elPopup.innerHTML += scoreHtml;
}

function renderOnRestart() {
  const elPopup = document.querySelector(".popup");
  elPopup.hidden = true;
  elPopup.style.display = "none";

  var emojiBtn = document.querySelector(".resetBtn");
  emojiBtn.textContent = `😁`;

  var safeBtn = document.querySelector(".safe");
  safeBtn.textContent = "🛟🛟🛟";
}

function resetGame() {
  gBombArr = [];
  gEmptyCell = [];
  gHistory = [];
  life = 3;
  safeCount = 3;
  gGame.markedCount = 0;
  gGame.shownCount = 0;
  renderOnRestart();
  onInit();
  stopTimer();
}

function createBombRandomly() {
  const randIdx = getRandomInt(0, gEmptyCell.length);

  var location = gEmptyCell[randIdx];
  gBombArr.push(location);
  gBoard[location.i][location.j].isMine = true;
  gEmptyCell.splice(randIdx, 1);
}

function getRandomEmptyCellPosition() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      const cell = gBoard[i][j];
      if (!cell.isShown) {
        gEmptyCell.push({ i, j });
      }
    }
  }
}

function toggleSwitch() {
  var elBody = document.querySelector("body");
  if (darkMode) {
    elBody.style.backgroundColor = "#e9ecef";
    darkMode = false;
  } else {
    elBody.style.backgroundColor = "black";
    var elFooter = document.querySelector("footer");
    elFooter.style.color = " #868e96";
    darkMode = true;
  }
}

function renderLife(life) {
  var elLife = document.querySelector(".life");
  if (life === 3) {
    elLife.innerText = `🤍🤍🤍`;
  } else if (life === 2) {
    elLife.innerText = `🤍🤍`;
  } else if (life === 1) {
    elLife.innerText = `🤍`;
  } else if (life === 0) {
    elLife.innerText = ``;
  }
}

function fullExpand(elCell, rowIdx, colIdx) {
  var cell = gBoard[rowIdx][colIdx];
  gGame.shownCount++;

  if (cell.minesAroundCount !== 0) {
    renderCell(elCell, false, cell.minesAroundCount, false);
    return;
  }

  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (i === rowIdx && j === colIdx) continue;
      if (j < 0 || j >= gBoard[0].length) continue;
      var nearCell = gBoard[i][j];

      if (!nearCell.isMine && !nearCell.isShown && !nearCell.isMarked) {
        var idx = findByLocation(gEmptyCell, i, j);
        gEmptyCell.splice(idx, 1);
        lastMoves.push({ i, j });
        var elNearCell = document.querySelector(
          `[data-i="${i}"][data-j="${j}"]`
        );
        nearCell.isShown = true;
        fullExpand(elNearCell, i, j);
      }
    }
  }
  renderCell(elCell, false, cell.minesAroundCount, false);
}

function findByLocation(arr, rowIdx, colIdx) {
  for (var i = 0; i < arr.length; i++) {
    var location = arr[i];
    if (location.i === rowIdx && location.j === colIdx) return i;
  }
}

function unMark(location) {
  var cell = gBoard[location.i][location.j];
  gEmptyCell.push(location);
  var elCell = document.querySelector(
    `[data-i="${location.i}"][data-j="${location.j}"]`
  );
  elCell.textContent = "";
  elCell.classList.remove("selected");
  cell.isShown = false;
  if (cell.isMine) {
    elCell.style.backgroundColor = "";
    life++;
  }
  if (cell.isMarked) {
    cell.isMarked = false;
    gGame.markedCount--;
  }
}

function undoRecursion() {
  if (gHistory.length === 0) return;
  var lastMove = gHistory.pop();
  for (let i = 0; i < lastMove.length; i++) {
    unMark(lastMove[i]);
  }
  renderLife(life);
}

function safeBtn(elSafeBtn) {
  if (gGame.shownCount === 0) return;

  safeCount--;
  const randIdx = getRandomInt(0, gEmptyCell.length);
  var location = gEmptyCell[randIdx];
  var cell = gBoard[location.i][location.j];
  var elCell = document.querySelector(
    `[data-i="${location.i}"][data-j="${location.j}"]`
  );
  elCell.textContent = cell.minesAroundCount;
  cell.isShown = true;

  setTimeout(() => {
    elCell.textContent = "";
    cell.isShown = false;
  }, 2000);

  var strHtml = "";

  for (var i = 0; i < safeCount; i++) {
    strHtml += "🛟";
  }

  elSafeBtn.textContent = strHtml;
}
