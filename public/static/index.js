var grid = document.getElementById('grid');
var msg = document.querySelector('.message');
var chooser = document.querySelector('form');
var mark;
var userMark = '';
var cells;
var thatsGame = false;
var score = 0;

// add click listener to radio buttons
function setPlayer() {
  mark = this.value;
  userMark = mark;
  msg.textContent = mark + ', click on a square to make your move!';
  chooser.classList.add('game-on');
  this.checked = false;
  buildGrid();
}

// add click listener to each cell
function playerMove() {
  if (thatsGame) {
    return;
  }
  if (this.querySelector("p").textContent == '') {
    this.querySelector("p").textContent = mark;
    if (checkRow()) {
      console.log("winner was found!");
      gameOver();
      return;
    }
    switchMark();
    computerMove();
  }
}

// let the computer make the next move
function computerMove() {
  var emptyCells = [];
  var random;

  cells.forEach(function(cell){
    if (cell.querySelector("p").textContent == '') {
      emptyCells.push(cell);
    }
  });

  if (emptyCells.length == 0) { //All filled and no winner (because we check[ed]Row before)
    draw();
    return;
  }

  // computer marks a random EMPTY cell
  random = Math.ceil(Math.random() * emptyCells.length) - 1;
  emptyCells[random].querySelector("p").textContent = mark;
  checkRow();
  switchMark();
}

// switch player mark
function switchMark() {
  if (mark == 'X') {
    mark = 'O';
  } else {
    mark = 'X';
  }
}

// determine a winner
function winner(a, b, c) {
  if (a.querySelector("p").textContent == mark && b.querySelector("p").textContent == mark && c.querySelector("p").textContent == mark) {
    if (mark == userMark) {
      msg.textContent = "You won!";
      score += 1;
    } else {
      msg.textContent = "You lost!";
      score = 0;
    }

    setScore();

    a.classList.add('winner');
    b.classList.add('winner');
    c.classList.add('winner');
    return true;
  } else {
    return false;
  }
}

function draw() {
  msg.textContent = 'It\'s a draw!';
  gameOver();
}

function gameOver() {
  thatsGame = true;
}

function setScore() {
  document.getElementById("score").textContent = "Score: " + score.toString();
}

// check cell combinations
function checkRow() {
  var isAWinner = false;
  isAWinner += winner(document.getElementById('c1'), document.getElementById('c2'), document.getElementById('c3'));
  isAWinner += winner(document.getElementById('c4'), document.getElementById('c5'), document.getElementById('c6'));
  isAWinner += winner(document.getElementById('c7'), document.getElementById('c8'), document.getElementById('c9'));
  isAWinner += winner(document.getElementById('c1'), document.getElementById('c4'), document.getElementById('c7'));
  isAWinner += winner(document.getElementById('c2'), document.getElementById('c5'), document.getElementById('c8'));
  isAWinner += winner(document.getElementById('c3'), document.getElementById('c6'), document.getElementById('c9'));
  isAWinner += winner(document.getElementById('c1'), document.getElementById('c5'), document.getElementById('c9'));
  isAWinner += winner(document.getElementById('c3'), document.getElementById('c5'), document.getElementById('c7'));
  return isAWinner;
}

// clear the grid
function resetGrid() {
  mark = 'X';
  userMark = '';
  cells.forEach(function(cell){
    cell.querySelector("p").textContent = '';
    cell.classList.remove('winner');
  });
  msg.textContent = 'Choose your player:';
  chooser.classList.remove('game-on');
  grid.innerHTML = '';
  thatsGame = false;
}

// build the grid
function buildGrid() {
  for (var i = 1; i <= 9; i++) {
    var cell = document.createElement('div');
    var p = document.createElement('p');
    cell.appendChild(p);
    cell.id = 'c' + i;
    cell.addEventListener('click', playerMove, false);
    grid.appendChild(cell);
  }
  cells = Array.prototype.slice.call(grid.getElementsByTagName('div'));
}

var players = Array.prototype.slice.call(document.querySelectorAll('input[name=player-choice]'));
players.forEach(function(choice){
  choice.addEventListener('click', setPlayer, false);
});

var resetButton = chooser.querySelector('button');
resetButton.addEventListener('click', function(e) {
  e.preventDefault();
  resetGrid();
});

function updateStatus(status) {
  document.querySelector("#title-status > h2").innerHTML = "Status: " + status;
}
