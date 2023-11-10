"use strict";

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
  MINES: 2,
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
  document.querySelector(".timer").innerText = "0:000";
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
  event.preventDefault();
  var cell = gBoard[i][j];
  if (cell.isShown) return;
  cell.isMarked = true;
  renderCell(elCell, false, 0, true);
  gGame.markedCount++;
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
  const currCell = gBoard[i][j];
  if (currCell.isShown) return;
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
    renderCell(elCell, false, currCell.minesAroundCount);
    gGame.shownCount++;
  }

  victory();
}

function bombClicked(elCell) {
  life--;
  document.querySelector(".life").textContent = life;
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
  var finalScore = gLevel.SIZE ** 2 - gLevel.MINES;
  var finalMark = gLevel.MINES - 3 + life;
  if (gGame.markedCount === finalMark && gGame.shownCount === finalScore) {
    var emojiBtn = document.querySelector(".resetBtn");
    emojiBtn.textContent = `😎`;
    const elPopup = document.querySelector(".popup");
    elPopup.innerText = `YOU WIN!`;
    elPopup.style.display = "flex";
  }
}

function renderOnRestart() {
  const elPopup = document.querySelector(".popup");
  elPopup.hidden = true;
  elPopup.style.display = "none";

  var emojiBtn = document.querySelector(".resetBtn");
  emojiBtn.textContent = `😁`;
}

function resetGame() {
  gBombArr = [];
  gEmptyCell = [];
  life = 3;
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
