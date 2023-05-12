
const body = document.querySelector('body');
const fieldMatrix = [];

// defining Class for cell 
class Cell {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.bomb = false;
    this.number = null;
    this.type = null;
    this.opened = false;
  }

  generateCell() {
    let cell = document.createElement('div');
    cell.className = 'cell';
    cell.setAttribute('data-row', this.row);
    cell.setAttribute('data-col', this.col);

    return cell;
  } 
}
// ----------------------------------------------------

const makeDiv = (divname) => {
  const div = document.createElement('div');
  div.className = divname;
  return div;
}

// creating the field 
const setField = (colNr, rowNr) => {
  const wrapper = makeDiv('wrapper');
  const head = makeDiv('head');
  const field = makeDiv('field');

  for (let i = 0; i < rowNr; i++) {
    const row = makeDiv('row');
    for (let j = 0; j < colNr; j++) {
      const cell = new Cell (i, j);
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

// setting mines on the field
const mine = (colNr, rowNr, minesNr, startingCellNr) => {
  const fieldSize = colNr*rowNr;
  const minedCells = new Set();

  while (minedCells.size < minesNr) {
    let nr = Math.round(fieldSize * Math.random())
    if (nr !== startingCellNr) {
      minedCells.add(nr)
      fieldMatrix[nr].bomb = true;
    }
  }

  // minedCells.forEach(cell => {
  //   const i = Math.floor(cell / colNr);
  //   const j = cell % colNr;
  //   body.querySelector(`[data-row="${i}"][data-col="${j}"]`).classList.add('cell_type_bomb-exploded');
  // });
}
// ----------------------------------------------------

// handle ckicks
const handleClicks = () => {
  const field = document.querySelector('.field');
  field.addEventListener('click', (e) => {
    const cell = e.target
    if (cell.dataset) {
      cell.classList.add('cell_opened');
      console.log(`you clicked cell row=${cell.dataset.row}, col=${cell.dataset.col}`);
    } 
  })

} 





setField(15, 15);
mine(15, 15, 40, );
handleClicks();
console.log(fieldMatrix);


// temporary code to test styles
// document.querySelectorAll('.cell').forEach(cell => {
//   if (((cell.dataset.row === '1')
//     || cell.dataset.row === '2')
//     && ((cell.dataset.col === '2')
//       || (cell.dataset.col === '3')
//       || (cell.dataset.col === '4')
//       || (cell.dataset.col === '5'))) {
//     cell.classList.add('opened')
//   }
// });
