
const body = document.querySelector('body');
const fieldMatrix = [];
const colNr = 15;
const rowNr = 15;
const bombsNumber = 30;
let moveCounter = 0;

// defining Class for cell 
class Cell {
  constructor(row, col, number) {
    this.row = row;
    this.col = col;
    this.number = number;
    this.bomb = false;
    this.bombsAround = 0;
    this.opened = false;
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
    cell.classList.remove('cell_flag');
    cell.classList.add('cell_opened');
    cell.innerText = this.bombsAround;
    this.opened = true;
  }
}
// ----------------------------------------------------

const makeDiv = (divname) => {
  const div = document.createElement('div');
  div.className = divname;
  return div;
}

// creating the field 
const setField = () => {
  const wrapper = makeDiv('wrapper');
  const head = makeDiv('head');
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

  wrapper.append(head);
  wrapper.append(field);
  body.append(wrapper);
}
// ----------------------------------------------------

// setting bombs on the field
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
const handleClicks = () => {
  const field = document.querySelector('.field');
  // right clics
  field.addEventListener('contextmenu', (e) => {
    const cell = e.target;
    if ((cell.classList.contains('cell'))
      && (!cell.classList.contains('cell_opened'))) {
      cell.classList.toggle('cell_flag');
    }
  });

  // left clics
  field.addEventListener('click', (e) => {
    const cell = e.target;
    if ((cell.classList.contains('cell'))
      && (!cell.classList.contains('cell_flag'))) {
      const nr = cell.dataset.number;
      fieldMatrix[nr].openCell();
      // cell.classList.add('cell_opened');
      moveCounter++;
      if (fieldMatrix[nr].bomb) {
        // clicked on a bomb
        cell.classList.add('cell_type_bomb-exploded');
        // gameOver();
      } else {
        if (fieldMatrix[nr].bombsAround === 0) { openAround(nr) };
      }
    }
  });
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
      countAround();
      fieldMatrix[nr].openCell();
      if (fieldMatrix[nr].bombsAround === 0) { openAround(nr) };
      handleClicks();
      console.log(fieldMatrix);
    }
    field.removeEventListener('click', initialClickHandler);
  }
  field.addEventListener('click', initialClickHandler);
}
// ----------------------------------------------------

setField();
start();
