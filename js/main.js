"use strict";

const BOMB = "💣";

var gBoard;
var gElSelected = null;
var gBombArr = [];
var life = 1;

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
  gGame.shownCount;
  gBoard = buildBoard();
  renderBoard(gBoard);
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
        strHtml += `\t<td class="${className}"  data-i="${i}" data-j="${j}" onclick="onCellClicked(this, ${i}, ${j})"></td>\n`;
      } else if (currCell.isMine) {
        strHtml += `\t<td class="${className}"  data-i="${i}" data-j="${j}" onclick="onCellClicked(this, ${i}, ${j})">${BOMB}</td>\n`;
      } else {
        strHtml += `\t<td class="${className}"  data-i="${i}" data-j="${j}" onclick="onCellClicked(this, ${i}, ${j})"></td>\n`;
      }
    }
    strHtml += `</tr>\n`;
  }

  elBoard.innerHTML = strHtml;
}

function renderCell(elCell, isMine, minesAroundCount) {
  if (isMine) {
    elCell.textContent = BOMB;
  } else {
    elCell.textContent = minesAroundCount;
    elCell.classList.add("selected");
  }
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

  if (currCell.isMine) {
    renderCell(elCell, true, 0);
    bombClicked(elCell);
    return;
  }

  renderCell(elCell, false, currCell.minesAroundCount);
  gGame.shownCount++;
}

function bombClicked(elCell) {
  life--;
  elCell.style.backgroundColor = "red";
  document.querySelector(".life").textContent = life;
  if (life === 0) gameOver();
}

function gameOver() {
  const elPopup = document.querySelector(".popup");
  elPopup.innerText = `YOU LOSE`;
  elPopup.hidden = false;
}

function resetGame() {
  onInit();
}

function createBombRandomly() {
  const randIdx = getRandomInt(0, gBombArr.length);

  var location = gBombArr[randIdx];
  gBoard[location.i][location.j].isMine = true;
  gBombArr.splice(randIdx, 1);
}

function getRandomEmptyCellPosition() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      const cell = gBoard[i][j];
      if (!cell.isShown) {
        gBombArr.push({ i, j });
      }
    }
  }
}
