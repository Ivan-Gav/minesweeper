const body = document.querySelector('body');
const fieldMatrix = [];
const colNr = 10;
const rowNr = 10;
const bombsNumber = 10;
let moveCounter = 0;
let openCounter = 0;
let flagCounter = 0;
let timer = 0;

// defining Class for cell 
class Cell {
  constructor(row, col, number) {
    this.row = row;
    this.col = col;
    this.number = number;
    this.bomb = false;
    this.bombsAround = 0;
    this.opened = false;
    this.flag = false;
  }

  generateCell() {
    let cell = document.createElement('div');
    cell.className = 'cell';
    cell.setAttribute('data-number', this.number);
    cell.setAttribute('data-row', this.row);
    cell.setAttribute('data-col', this.col);
    return cell;
  }

  openCell() {
    let cell = document.querySelector(`[data-number="${this.number}"]`);
    cell.classList.add('cell_opened');
    if (this.bombsAround) {
      cell.innerText = this.bombsAround;
      cell.classList.add(`cell_type_${this.bombsAround}`);
    }
        
    this.opened = true;
    openCounter++;
    if (this.flag) {
      cell.classList.remove('cell_flag');
      cell.innerHTML = '';
      this.flag = false;
      flagCounter--;
    }
  }

  showBomb() {
    let cell = document.querySelector(`[data-number="${this.number}"]`);
    cell.classList.add('cell_opened');
    cell.classList.add('cell_type_bomb');
    cell.innerHTML = '<i class="fa-solid fa-virus">'
    this.opened = true;
    if (this.flag) {
      cell.classList.remove('cell_flag');
      this.flag = false;
      flagCounter--;
    }
  }

  toggleFlag() {
    let cell = document.querySelector(`[data-number="${this.number}"]`);
    // if (this.flag) {
    //   cell.innerHTML = '';
    // } else {
    //   cell.innerHTML = '<i class="fa-solid fa-flag"></i>';
    // }
    cell.classList.toggle('cell_flag');
    this.flag = !this.flag;
    flagCounter += (this.flag) ? 1 : (-1);
  }
}
// ----------------------------------------------------

// auxillary function to create divs
const makeDiv = (divname) => {
  const div = document.createElement('div');
  div.className = divname;
  return div;
}
// ----------------------------------------------------

// creating the header
// const setHeader = () => {


// }
// ----------------------------------------------------

// timer
const formatTime = timer => {
  let seconds = timer % 60;
  let minutes = Math.floor(timer / 60) % 60;
  let hours = Math.floor(timer / 3600);

  seconds = (seconds < 10) ? '0' + seconds : seconds;
  minutes = (minutes < 10) ? '0' + minutes : minutes;

  return hours ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
}

const countTime = () => {
  const field = document.querySelector('.field')

  const stopTimer = () => {
    clearInterval(showTimer);
    field.removeEventListener('gameOverEvent', stopTimer);
  }

  field.addEventListener('gameOverEvent', stopTimer);

  const showTimer = setInterval(() => {
    timer++;
    document.querySelector('.time').innerText = formatTime(timer);
  }, 1000)
}
// ----------------------------------------------------

// creating the field 
const setField = () => {
  const wrapper = makeDiv('wrapper');
  // const head = makeDiv('head');
  const field = makeDiv('field');

  for (let i = 0; i < rowNr; i++) {
    const row = makeDiv('row');
    for (let j = 0; j < colNr; j++) {
      const cellNumber = ((i * colNr) + j);
      const cell = new Cell(i, j, cellNumber);
      row.append(cell.generateCell());
      fieldMatrix.push(cell);
    }
    field.append(row);
  }

  // wrapper.append(head);
  wrapper.append(field);
  body.append(wrapper);

  document.querySelector('.bombs-nr').innerText = bombsNumber;
}
// ----------------------------------------------------

// planting bombs on the field
const plantBombs = (bombsNr, startingCellNr) => {
  const fieldSize = colNr * rowNr;
  const minedCells = new Set();

  while (minedCells.size < bombsNr) {
    let nr = Math.round(fieldSize * Math.random())
    if (nr !== startingCellNr) {
      minedCells.add(nr)
      fieldMatrix[nr].bomb = true;
    }
  }
}
// ----------------------------------------------------

// count bombs around each cell
const countAround = () => {

  fieldMatrix.forEach(cell => {
    const { row, col, number, bomb } = cell;
    if (!bomb) {
      let count = 0
      if ((row > 0) && (col > 0)) { count += (fieldMatrix[number - colNr - 1].bomb) ? 1 : 0 }
      if (row > 0) { count += (fieldMatrix[number - colNr].bomb) ? 1 : 0 }
      if ((row > 0) && (col < (colNr - 1))) { count += (fieldMatrix[number - colNr + 1].bomb) ? 1 : 0 }
      if (col > 0) { count += (fieldMatrix[number - 1].bomb) ? 1 : 0 }
      if (col < (colNr - 1)) { count += (fieldMatrix[number + 1].bomb) ? 1 : 0 }
      if ((col > 0) && (row < (rowNr - 1))) { count += (fieldMatrix[number + colNr - 1].bomb) ? 1 : 0 }
      if (row < (rowNr - 1)) { count += (fieldMatrix[number + colNr].bomb) ? 1 : 0 }
      if ((col < (colNr - 1)) && (row < (rowNr - 1))) { count += (fieldMatrix[number + colNr + 1].bomb) ? 1 : 0 }

      cell.bombsAround = count;

    }
  })
}
// ----------------------------------------------------

// open cells around when zero
const openAround = (cellNumber) => {
  const cell = fieldMatrix[cellNumber];
  const { row, col, number } = cell;

  const openAdjacentCell = (nr) => {
    if (!fieldMatrix[nr].opened) {
      fieldMatrix[nr].openCell();
      document.querySelector('.flags-nr').innerText = flagCounter;
      if (fieldMatrix[nr].bombsAround === 0) { openAround(nr) };
    }
  }

  if ((row > 0) && (col > 0)) { openAdjacentCell(number - colNr - 1) };
  if (row > 0) { openAdjacentCell(number - colNr) };
  if ((row > 0) && (col < (colNr - 1))) { openAdjacentCell(number - colNr + 1) };
  if (col > 0) { openAdjacentCell(number - 1) };
  if (col < (colNr - 1)) { openAdjacentCell(number + 1) };
  if ((col > 0) && (row < (rowNr - 1))) { openAdjacentCell(number + colNr - 1) };
  if (row < (rowNr - 1)) { openAdjacentCell(number + colNr) };
  if ((col < (colNr - 1)) && (row < (rowNr - 1))) { openAdjacentCell(number + colNr + 1) };
}
// ----------------------------------------------------

// handle clicks
const rightClickHandler = e => {
  const cell = e.target;
  if ((cell.classList.contains('cell'))
    && (!cell.classList.contains('cell_opened'))) {
    fieldMatrix[cell.dataset.number].toggleFlag();
    document.querySelector('.flags-nr').innerText = flagCounter;
  }
}

const leftClickHandler = (e) => {
  const cell = e.target;
  if ((cell.classList.contains('cell'))
    && (!cell.classList.contains('cell_flag'))
    && (!fieldMatrix[cell.dataset.number].opened)) {
    const nr = cell.dataset.number;
    fieldMatrix[nr].openCell();
    moveCounter++;
    document.querySelector('.moves-nr').innerText = moveCounter;
    if (fieldMatrix[nr].bomb) {
      // clicked on a bomb
      cell.classList.add('cell_type_bomb-exploded');
      gameOver(false);
    } else {
      if (fieldMatrix[nr].bombsAround === 0) { openAround(nr) };
      if ((openCounter + bombsNumber) === fieldMatrix.length) { gameOver(true) };
    }
  }
}

const handleClicks = () => {
  const field = document.querySelector('.field');
  // right clics
  field.addEventListener('contextmenu', rightClickHandler);

  // left clics
  field.addEventListener('click', leftClickHandler);
}
// ----------------------------------------------------

// handling first click
const start = () => {
  const field = document.querySelector('.field');

  field.addEventListener('contextmenu', (e) => {
    const cell = e.target;
    if (cell.classList.contains('cell')) {
      e.preventDefault();
    }
  });

  const initialClickHandler = (e) => {
    const cell = e.target;
    if (cell.classList.contains('cell')) {
      const nr = cell.dataset.number
      plantBombs(bombsNumber, nr);
      moveCounter++;
      document.querySelector('.moves-nr').innerText = moveCounter;
      countAround();
      fieldMatrix[nr].openCell();
      if (fieldMatrix[nr].bombsAround === 0) { openAround(nr) };
      handleClicks();
      console.log(fieldMatrix);
      countTime();
    }
    field.removeEventListener('click', initialClickHandler);
  }
  field.addEventListener('click', initialClickHandler);
}
// ----------------------------------------------------

// game over
const gameOver = (win) => {
  const field = document.querySelector('.field');

  field.removeEventListener('contextmenu', rightClickHandler);
  field.removeEventListener('click', leftClickHandler);

  fieldMatrix.map(cell => {
    if (cell.bomb) {
      cell.showBomb();
    };
  })

  const gameOverEvent = new Event('gameOverEvent');
  field.dispatchEvent(gameOverEvent);

  // const message = win ? 'you win!' : 'you loose!';
  // console.log(message);

  const resetButton =  document.querySelector('.game-status');
  if (win) {
    resetButton.classList.add('win');
    resetButton.innerText = 'You win!\nPress to start a new game';
  } else {
    resetButton.classList.add('lose');
    resetButton.innerText = 'You lose!\nPress to start a new game';
  }
}
// ----------------------------------------------------

// restart
const restart = () => {
  moveCounter = 0;
  openCounter = 0;
  flagCounter = 0;
  timer = 0;
  document.querySelector('.moves-nr').innerText = moveCounter;
  document.querySelector('.flags-nr').innerText = flagCounter;
  document.querySelector('.time').innerText = formatTime(timer);
  fieldMatrix.length = 0;

  const resetButton =  document.querySelector('.game-status');
  resetButton.classList.remove('win');
  resetButton.classList.remove('lose');
  resetButton.innerText = 'Restart';

  const field = document.querySelector('.field');
  const restartEvent = new Event('gameOverEvent');
  field.dispatchEvent(restartEvent);

  document.querySelector('.wrapper').remove();

  setField();
  start();
}

const handleRestartClick = () => {
  document.querySelector('.game-status').addEventListener('click', (e) => {
    restart();
  });
}
// ----------------------------------------------------

setField();
start();
handleRestartClick();
