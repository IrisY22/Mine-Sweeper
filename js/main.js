"use strict";

const BOMB = "💣";

var gBoard;
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
  gBoard = buildBoard();
  renderBoard(gBoard);
}

function buildBoard() {
  const board = createMat(4, 4);
  console.log(board);

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      var cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
      };

      if (board[i][j] === BOMB) cell.isMine;

      board[i][j] = cell;
    }
  }
  board[1][1].isMine = true;
  board[3][2].isMine = true;

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
      if (currCell.isMine) {
        strHtml += `\t<td class="${className}"  onclick="onCellClicked(this, ${i}, ${j})">${BOMB}</td>\n`;
      } else {
        strHtml += `\t<td class="${className}"  onclick="onCellClicked(this, ${i}, ${j})"></td>\n`;
      }
    }
    strHtml += `</tr>\n`;
  }

  elBoard.innerHTML = strHtml;
}

function setMinesNegsCount(board, rowIdx, colIdx) {
  gBoard.minesAroundCount = 0;
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= board.length) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (i === rowIdx && j === colIdx) continue;
      if (j < 0 || j >= board[0].length) continue;
      var currCell = board[i][j];
      if (currCell === BOMB) gBoard.minesAroundCount++;
    }
  }
  return gBoard.minesAroundCount;
}

function onCellClicked(elCell, i, j) {
  const cell = gBoard[i][j];
  console.log(elCell, i, j);

  if (cell !== BOMB) {
    elCell.classList.add(".selected");
  }
}
