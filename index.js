
const body = document.querySelector('body');
const fieldMatrix = [];

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

// setting mines on the field
const mine = (colNr, rowNr, minesNr, startingCellNr) => {
  const fieldSize = colNr * rowNr;
  const minedCells = new Set();

  while (minedCells.size < minesNr) {
    let nr = Math.round(fieldSize * Math.random())
    if (nr !== startingCellNr) {
      minedCells.add(nr)
      fieldMatrix[nr].bomb = true;
    }
  }
}
// ----------------------------------------------------

// count bombs around each cell
const countAround = (fieldMatrix, colNr, rowNr) => {
  
  fieldMatrix.forEach(cell => {
    const { row, col, number, bomb } = cell;
    if (!bomb) {
      let count = 0
        if ((row > 0) && (col > 0)) { count += (fieldMatrix[number - colNr - 1].bomb) ? 1 : 0}
        if (row > 0) { count += (fieldMatrix[number - colNr].bomb) ? 1 : 0}
        if ((row > 0) && (col < (colNr - 1))) { count += (fieldMatrix[number - colNr + 1].bomb) ? 1 : 0}
        if (col > 0) { count += (fieldMatrix[number - 1].bomb) ? 1 : 0}
        if (col < (colNr - 1)) { count += (fieldMatrix[number + 1].bomb) ? 1 : 0}
        if ((col > 0) && (row < (rowNr - 1))) { count += (fieldMatrix[number + colNr - 1].bomb) ? 1 : 0}
        if (row < (rowNr - 1)) { count += (fieldMatrix[number + colNr].bomb) ? 1 : 0}
        if ((col < (colNr - 1)) && (row < (rowNr - 1))) { count += (fieldMatrix[number + colNr +1 ].bomb) ? 1 : 0}

        cell.bombsAround = count;

      }
  })
  // for (let i = 0; i < rowNr; i++) {
  //   for (let j = 0; j < colNr; j++) {
  //     let count = 0
  //       if ((i > 0) && (j > 0)) { count += (matrix[i - 1][j - 1]) ? 1 : 0}
  //       if (i > 0) { count += (matrix[i - 1][j]) ? 1 : 0}
  //       if ((i > 0) && (j < cols)) { count += (matrix[i - 1][j + 1]) ? 1 : 0}
  //       if (j > 0) { count += (matrix[i][j - 1]) ? 1 : 0}
  //       if (j < cols) { count += (matrix[i][j + 1]) ? 1 : 0}
  //       if ((j > 0) && (i < rows)) { count += (matrix[i + 1][j - 1]) ? 1 : 0}
  //       if (i < rows) { count += (matrix[i+1][j]) ? 1 : 0}
  //       if ((j < cols) && (i < rows)) { count += (matrix[i + 1][j + 1]) ? 1 : 0}
        
  //   }
  // }
  
}
// ----------------------------------------------------

// handle clicks
const handleClicks = () => {
  const field = document.querySelector('.field');
  // right clics
  field.addEventListener('contextmenu', (e) => {
    const cell = e.target;
    if (cell.classList.contains('cell')) {
      e.preventDefault();
      if (!cell.classList.contains('cell_opened')) {
        cell.classList.toggle('cell_flag');
      }
    }
  });

  // left clics
  field.addEventListener('click', (e) => {
    const cell = e.target;
    if ((cell.classList.contains('cell'))
      && (!cell.classList.contains('cell_flag'))) {
        cell.classList.add('cell_opened');
        const nr = cell.dataset.number;
        if (fieldMatrix[nr].bomb) {
          // clicked on a bomb
          cell.classList.add('cell_type_bomb-exploded');
          // gameOver();
        } else {
          cell.innerText = fieldMatrix[nr].bombsAround;
        }

        

    }
  });
}
// ----------------------------------------------------




setField(15, 15);
mine(15, 15, 40,);
countAround(fieldMatrix, 15, 15);
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
