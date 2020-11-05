const omok = document.querySelector("#omok");
const ctx = omok.getContext("2d");

// draw info
const cellSize = 40;
const offsetX = 40;
const offsetY = 40;
const stoneRadius = 17;
const CELLS_DRAW = 18;

// logic info
const CELLS = 19;

let lines = [];
let player1HighScore = 0;
let player2HighScore = 0;
let clicked = false;
let myTurn = true;
let myConfig = {
  stoneColor: {
    player1: "#f8faf5",
    player2: "#121212",
  },
  boardColor: "#FFE4B5",
  // my stone color; player2 stone color; ...
};
let stoneColor = myConfig["stoneColor"]["player1"];
// canvas의 크기만큼 cell을 채운다.
// cell을 채울 때 정보를 저장한다. {x: i, y: j, centerX: something, centerY: something isOccupied: false}
// 바둑알을 놓을 때 mouse offSet의 위치에 따라 자동으로 보정하는 함수를 만든다.
// 바둑알을 놓았을 때 주변을 확인하여 연속된 type이 있는지 확인한다. (가로, 세로, 대각선)

function Cell(x, y, size) {
  this.x = x;
  this.y = y;
  this.size = size;
}

function Stone(x, y, size, color) {
  this.x = x;
  this.y = y;
  this.size = size;
  this.color = color;
}

Cell.prototype.draw = function () {
  ctx.beginPath();
  ctx.fillStyle = myConfig["boardColor"];
  ctx.rect(this.x, this.y, this.size, this.size);
  ctx.strokeStyle = "black";
  ctx.fill();
  ctx.stroke();
};

Stone.prototype.draw = function () {
  ctx.beginPath();
  ctx.fillStyle = this.color;
  ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
  ctx.fill();
};

function checkCondition(row, col) {
  // x = row, y = col
  let currentLocation = lines[row][col]; // {x, y, offsetX, offsetY, isOccupied, OccupiedType}
  let numberOfSameColorStones = 0;
  let temp = 0;
  console.log("check condition");
  // 가로줄 탐색
  for (
    let i = col - 4 >= 0 ? col - 4 : 0;
    i <= (col + 4 < CELLS ? col + 4 : CELLS - 1);
    i++
  ) {
    console.log("가로줄 탐색", i);
    if (currentLocation.occupiedType === lines[row][i].occupiedType) {
      temp++;
      // console.log("temp 증가:", temp);
      if (numberOfSameColorStones <= temp) {
        numberOfSameColorStones = temp;
      }
    } else {
      // console.log("temp 원위치:", temp);
      temp = 0;
    }
  }

  // temp 초기화
  temp = 0;

  // 세로줄 탐색
  for (
    let i = row - 4 >= 0 ? row - 4 : 0;
    i <= (row + 4 < CELLS ? row + 4 : CELLS - 1);
    i++
  ) {
    console.log("세로줄 탐색", i);
    if (currentLocation.occupiedType === lines[i][col].occupiedType) {
      temp++;
      if (numberOfSameColorStones <= temp) {
        numberOfSameColorStones = temp;
      }
    } else {
      temp = 0;
    }
  }

  // temp 초기화
  temp = 0;

  // 대각선 탐색
  for (let i = -4; i < 5; i++) {
    console.log("대각선 탐색 (우하향)");
    console.log(i);
    if (row + i >= 0 && col + i >= 0 && row + i < 19 && col + i < 19) {
      console.log(lines[row + i][col + i]);
      if (
        currentLocation.occupiedType === lines[row + i][col + i].occupiedType
      ) {
        temp++;
        if (numberOfSameColorStones <= temp) {
          numberOfSameColorStones = temp;
        }
      } else {
        temp = 0;
      }
    }
  }

  for (let i = -4; i < 5; i++) {
    console.log("대각선 탐색 (우상향)");
    if (row - i >= 0 && col + i >= 0 && row - i < 19 && col + i < 19) {
      console.log(lines[row - i][col + i]);
      if (
        currentLocation.occupiedType === lines[row - i][col + i].occupiedType
      ) {
        temp++;
        if (numberOfSameColorStones <= temp) {
          numberOfSameColorStones = temp;
        }
      } else {
        temp = 0;
      }
    }
  }

  if (myTurn) {
    player1HighScore =
      player1HighScore < numberOfSameColorStones
        ? numberOfSameColorStones
        : player1HighScore;
  } else {
    player2HighScore =
      player2HighScore < numberOfSameColorStones
        ? numberOfSameColorStones
        : player2HighScore;
  }
  console.log("p1:", player1HighScore);
  console.log("p2:", player2HighScore);
}

function drawStone(e) {
  if (30 > e.offsetX || e.offsetX >= 770 || 30 > e.offsetY || e.offsetY >= 770)
    return;
  const [x, y] = [e.offsetX, e.offsetY];
  const [calibratedX, calibratedY] = [
    Math.round(x / cellSize) * cellSize,
    Math.round(y / cellSize) * cellSize,
  ];
  const [col, row] = [calibratedX / cellSize - 1, calibratedY / cellSize - 1];
  stoneColor = myTurn
    ? myConfig["stoneColor"]["player1"]
    : myConfig["stoneColor"]["player2"];
  console.log(calibratedX, calibratedY);
  if (!lines[row][col].isOccupied) {
    const stone = new Stone(calibratedX, calibratedY, stoneRadius, stoneColor);
    stone.draw();
    handleCell(row, col);
    checkCondition(row, col);
    myTurn = !myTurn;
    // console.table(lines);
    // 그린 다음에 돌이 연속으로 다섯개 놓여져 있는지 확인
  }
}

function handleCell(row, col) {
  lines[row][col].isOccupied = true;
  const occupiedType = myTurn ? 1 : 2;
  lines[row][col].occupiedType = occupiedType;
}

function makeInformation() {
  for (let j = 0; j < CELLS; j++) {
    let row = [];
    for (let i = 0; i < CELLS; i++) {
      const lineInfo = {
        x: i,
        y: j,
        offsetX: offsetX + i * cellSize,
        offsetY: offsetY + j * cellSize,
        isOccupied: false,
        occupiedType: 0,
      };
      row.push(lineInfo);
    }
    lines.push(row);
  }
}

function loop() {
  for (let j = 0; j < CELLS_DRAW; j++) {
    for (let i = 0; i < CELLS_DRAW; i++) {
      const cell = new Cell(
        offsetX + i * cellSize,
        offsetY + j * cellSize,
        cellSize
      );
      cell.draw();
    }
  }
}

requestAnimationFrame(loop);
makeInformation();
// console.table(lines);
omok.addEventListener("click", drawStone);
