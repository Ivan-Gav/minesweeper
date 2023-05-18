const body = document.querySelector('body');
const fieldMatrix = [];
let colNr = 10;
let rowNr = 10;
let bombsNumber = 10;
let moveCounter = 0;
let openCounter = 0;
let flagCounter = 0;
let timer = 0;

// Class for switcher
class Switcher {

  constructor(id) {
    this.id = id;
  }

  generateSwitcher() {
    let switcher = document.createElement('label');
    switcher.className = 'switcher';
    let input = document.createElement('input');
    if (this.id) { input.id = this.id };
    input.className = 'switcher_input';
    input.type = 'checkbox';
    let switcherSpan = document.createElement('span');
    switcherSpan.className = 'switcher_check';

    switcher.append(input);
    switcher.append(switcherSpan)

    return switcher
  }
}

// ----------------------------------------------------

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

// color theme
const switchTheme = () => {
  document.querySelector('#theme-dark').addEventListener('change', (e) => {
    if (e.target.checked) {
      body.setAttribute('data-dark', 'on')
    } else {
      body.removeAttribute('data-dark', 'on')
    }
  })
}
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

// auxillary function to create divs
const makeDiv = (divname) => {
  const div = document.createElement('div');
  div.className = divname;
  return div;
}
// ----------------------------------------------------

// creating header
const setHeader = () => {
  const header = document.createElement('header');
  header.className = 'header';
  header.innerHTML = `    <nav class="main-menu">
    <div class="menu">
      <div class="menu_item">
        <input type="radio" id="radio_easy" name="difficulty" value="easy" checked>
        <label for="radio_easy">
          Easy
        </label>
      </div>
      <div class="menu_item">
        <input type="radio" id="radio_medium" name="difficulty" value="medium">
        <label for="radio_medium">
          Medium
        </label>
      </div>
      <div class="menu_item">
        <input type="radio" id="radio_hard" name="difficulty" value="hard">
        <label for="radio_hard">
          Hard
        </label>
      </div>
      <div class="menu_item">
        <label for="bombs-qty">
          Bombs:&nbsp;                 
        <input id="bombs-qty" type="number" min="10" max="99" placeholder="10">
        </label>
        
      </div>
      <div class="menu_item">
        <div id="stats">
          Stats
        </div>
      </div>
    </div>
    <div class="tech-menu">
      <div class="tech-menu_item" id="sound-switcher"></div>
      <div class="tech-menu_item" id="theme-switcher"></div>
    </div>
    </nav>`;
  body.append(header);

  const soundSwitch = new Switcher('sound-on');
  document.querySelector('#sound-switcher').append(soundSwitch.generateSwitcher());

  const themeSwitch = new Switcher('theme-dark');
  document.querySelector('#theme-switcher').append(themeSwitch.generateSwitcher());

  switchTheme();
}


// ----------------------------------------------------

// creating the parameters section
const setParametersSection = () => {
  const wrapper = makeDiv('wrapper');
  const parameters = makeDiv('parameters');
  parameters.innerHTML = `<div class="icon bombs-display"><span class="bombs-nr">-</span></div>
  <div class="icon flags-display"><span class="flags-nr">0</span></div>
  <div class="icon moves-display"><span class="moves-nr">0</span></div>
  <div class="icon time-display"><span class="time">00:00</span></div>`;
  const gameStatus = makeDiv('game-status');
  gameStatus.innerHTML = '<div style="margin-bottom: auto">Click on the field to start</div>';

  wrapper.append(parameters);
  wrapper.append(gameStatus);
  body.append(wrapper);
  document.querySelector('.bombs-nr').innerText = bombsNumber;
}

const restartButton = () => {
  const restartBtn = makeDiv('restart');
  restartBtn.innerText = 'Restart';
  return restartBtn;
}
// ----------------------------------------------------

// set difficulty and bombs number
const getDifficulty = () => {
  document.querySelectorAll('.menu_item').forEach(item => {
    item.addEventListener('change', (e) => {
      if ((e.target.id === 'radio_easy') && (colNr !== 10)) {
        colNr = rowNr = 10;
        restart();
      } else if ((e.target.id === 'radio_medium') && (colNr !== 15)) {
        colNr = rowNr = 15;
        restart();
      } else if ((e.target.id === 'radio_hard') && (colNr !== 25)) {
        colNr = rowNr = 25;
        restart();
      } else if (e.target.id === 'bombs-qty') {
        if ((e.target.value > 9) && (e.target.value < 100) && (e.target.value !== bombsNumber)) {
          bombsNumber = e.target.value;

        }
      }

    })
  })
}

// ----------------------------------------------------

// creating the field 
const setField = () => {
  const wrapper = document.querySelector('.wrapper');
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
  wrapper.append(field);
}
// ----------------------------------------------------

// planting bombs on the field
const plantBombs = (bombsNr, startingCellNr) => {
  const arr = [];
  for (let i = 0; i < fieldMatrix.length; i++) {
    arr.push(i)
  };
  arr.splice(+startingCellNr, 1);
  const randomArr = [];
  for (let i = 0; i < fieldMatrix.length; i++) {
    let randomIndex = Math.floor(Math.random() * arr.length)
    randomArr.push(arr[randomIndex])
    arr.splice(randomIndex, 1)
  };
  randomArr.length = bombsNr;
  randomArr.forEach(nr => {
    fieldMatrix[nr].bomb = true;
  })
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
      if ((openCounter + +bombsNumber) === fieldMatrix.length) { 
        gameOver(true);
        console.log('gameover - true'); };
      console.log(`openCounter = ${openCounter}, bombsNumber = ${bombsNumber}`);
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

// handle first click
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
      console.log(`frst click - row ${cell.dataset.row}, column ${cell.dataset.col}, number ${cell.dataset.number}`);
      plantBombs(bombsNumber, nr);
      moveCounter++;
      document.querySelector('.bombs-nr').innerText = bombsNumber;
      document.querySelector('.moves-nr').innerText = moveCounter;
      countAround();
      fieldMatrix[nr].openCell();
      if (fieldMatrix[nr].bombsAround === 0) { openAround(nr) };
      handleClicks();
      // console.log(fieldMatrix);
      countTime();
      document.querySelector('.game-status').innerHTML = '';
      document.querySelector('.game-status').append(restartButton());
      if ((openCounter + +bombsNumber) === fieldMatrix.length) { gameOver(true) };
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

  const restartBlock = document.querySelector('.game-status');
  if (win) {
    restartBlock.classList.add('win');
    restartBlock.innerHTML = '<div>You win!</div>';
    restartBlock.append(restartButton());
  } else {
    restartBlock.classList.add('lose');
    restartBlock.innerHTML = '<div>You lose!</div>';
    restartBlock.append(restartButton());
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

  const restartBlock = document.querySelector('.game-status');
  restartBlock.classList.remove('win');
  restartBlock.classList.remove('lose');
  restartBlock.innerHTML = restartButton();

  const field = document.querySelector('.field');
  const restartEvent = new Event('gameOverEvent');
  field.dispatchEvent(restartEvent);

  document.querySelector('.wrapper').remove();

  setParametersSection();
  setField();
  start();
  handleRestartClick();//???
}

const handleRestartClick = () => {
  document.querySelector('.game-status').addEventListener('click', (e) => {
    if (e.target.className === 'restart') {
      restart();
    }
  });
}
// ----------------------------------------------------

setHeader();
setParametersSection();
setField();
start();
handleRestartClick();

getDifficulty();


