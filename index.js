const body = document.querySelector('body');

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
    gameState.openCounter++;
    if (this.flag) {
      cell.classList.remove('cell_flag');
      cell.innerHTML = '';
      this.flag = false;
      gameState.flagCounter--;
    }

    if (gameState.soundOn) { clickFX.play() };
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
      gameState.flagCounter--;
    }
  }

  toggleFlag() {
    let cell = document.querySelector(`[data-number="${this.number}"]`);
    cell.classList.toggle('cell_flag');
    if (gameState.soundOn) { flagFX.play() };
    this.flag = !this.flag;
    gameState.flagCounter += (this.flag) ? 1 : (-1);
  }
}
// ----------------------------------------------------

// initialize gamestate or load it from localstorage
let fieldMatrix = [];

let game = {
  cellNr: 10,
  bombsNumber: 10,
  moveCounter: 0,
  openCounter: 0,
  flagCounter: 0,
  timer: 0,
  soundOn: false,
  darkOn: false,
  firstTime: true
}

let gameStats = []

if (localStorage.gameStats) {
  gameStats = JSON.parse(localStorage.gameStats);
} else {
  gameStats.length = 10;
  gameStats.fill({
    fieldsize: '-',
    bombs: '-',
    moves: '-',
    time: '--:--'
  });
}


if (localStorage.getItem('fieldMatrix') && localStorage.getItem('game')) {
  const tempArr = JSON.parse(localStorage.fieldMatrix);
  tempArr.forEach(cell => {
    fieldMatrix.push(Object.assign(new Cell, cell));
  });
  game = JSON.parse(localStorage.game);
}

const gameStateChangeHandler = {
  set(target, prop, value) {
    target[prop] = value;
    // localStorage.clear();

    localStorage.setItem('fieldMatrix', JSON.stringify(fieldMatrix));
    localStorage.setItem('game', JSON.stringify(game));
    return true;
  },
}

const gameState = new Proxy(game, gameStateChangeHandler);
// ----------------------------------------------------

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



// color theme
const switchTheme = () => {
  const themeSwitcher = document.querySelector('#theme-dark');
  if (gameState.darkOn) {
    body.setAttribute('data-dark', 'on')
    themeSwitcher.setAttribute('checked', 'true');
  } else {
    body.removeAttribute('data-dark', 'on')
  }
  themeSwitcher.addEventListener('change', (e) => {
    if (e.target.checked) {
      gameState.darkOn = true;
      body.setAttribute('data-dark', 'on')
    } else {
      gameState.darkOn = false;
      body.removeAttribute('data-dark', 'on')
    }
  })
}
// ----------------------------------------------------

//  sound FX
const switchSound = () => {
  const soundSwitcher = document.querySelector('#sound-on');
  if (gameState.soundOn) {
    soundSwitcher.setAttribute('checked', 'true');
  }
  soundSwitcher.addEventListener('change', (e) => {
    if (e.target.checked) {
      gameState.soundOn = true;
      if (gameState.soundOn) { flagFX.play() };
    } else {
      gameState.soundOn = false;
    }
  })
}

const clickFX = new Audio('./assets/sounds/mixkit-arcade-game-jump-coin-216.mp3');
const flagFX = new Audio('./assets/sounds/mixkit-classic-click-1117.mp3');
const loseFX = new Audio('./assets/sounds/mixkit-arcade-chiptune-explosion-1691.mp3');
const winFX = new Audio('./assets/sounds/mixkit-ethereal-fairy-win-sound-2019.mp3');
// ----------------------------------------------------

// burger menu

const activateBurger = () => {
  const burger = document.querySelector('.burger');
  const menu = document.querySelector('.menu');
  burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    menu.classList.toggle('open');
    if (menu.classList.contains('open')) {
      addOverlay(menu);
      document.querySelector('.overlay').addEventListener('click', () => {
        burger.classList.remove('active');
        menu.classList.remove('open');
        removeOverlay();
      })
    } else {
      removeOverlay();
    }
  })
}

const addOverlay = (element) => {
  const overlay = makeDiv('overlay');
  element.before(overlay);
  overlay.classList.add('active')
  body.classList.add('disable-scroll')
}

const removeOverlay = () => {
  const overlay = document.querySelector('.overlay');
  overlay.remove();
  body.classList.remove('disable-scroll')
}

// ----------------------------------------------------

// Stats-modal
const buildStatsPopUp = () => {
  const popUpWrapper = makeDiv('popup-wrapper');
  const popUp = makeDiv('popup');
  
  const closeSign = makeDiv('close-sign');
  closeSign.innerHTML = '<i class="fa-regular fa-circle-xmark"></i>';
  popUp.append(closeSign);

  const statHeader = makeDiv('stat-header');
  const headers = [
    '<i class="fa-solid fa-table-cells"></i>',
    '<i class="fa-solid fa-virus"></i>',
    '<i class="fa-solid fa-arrow-pointer"></i>',
    '<i class="fa-solid fa-stopwatch"></i>'
  ];
  headers.forEach(header => {
    const colHead = makeDiv('col-head');
    colHead.innerHTML = header;
    statHeader.append(colHead);
  })
  popUp.append(statHeader)

  gameStats.forEach(row => {
    const statRow = makeDiv('stat-row');
    for (const prop in row) {
      const tableCell = makeDiv('stats-table-cell');
      tableCell.innerText = row[prop];
      statRow.append(tableCell);
    }
    popUp.append(statRow);
  })
  popUpWrapper.append(popUp)
  body.append(popUpWrapper);
  popUp.classList.add('popup_active')
  addOverlay(popUpWrapper);
}

const showStats = () => {
  document.querySelector('#stats').addEventListener('click', (e) => {
    console.log('stats clicked');
    buildStatsPopUp();
        
    const closePopup = (e) => {
      const popUp = document.querySelector('.popup')
      const popUpWrapper = document.querySelector('.popup-wrapper')
      if ((e.target.classList.contains('close-sign'))
        || (e.target.parentElement.classList.contains('close-sign')) 
        || (e.target.classList.contains('popup-wrapper'))
        || (e.target.classList.contains('popup')))
        {
          popUp.classList.remove('popup_active')
          popUpWrapper.remove();
          removeOverlay();
          body.removeEventListener('click', closePopup);
        }
    }

    body.addEventListener('click', closePopup);
  })
}


// ----------------------------------------------------

// timer
const formatTime = time => {
  let seconds = time % 60;
  let minutes = Math.floor(time / 60) % 60;
  let hours = Math.floor(time / 3600);

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
    gameState.timer++;
    document.querySelector('.time').innerText = formatTime(gameState.timer);
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

  <div class="burger">
    <span></span>
  </div>
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
        <input id="bombs-qty" type="number" min="10" max="99" placeholder="${gameState.bombsNumber}">
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

  if (gameState.cellNr == 15) {
    document.querySelector('#radio_medium').setAttribute('checked', 'true');
  } else if (gameState.cellNr == 25) {
    document.querySelector('#radio_hard').setAttribute('checked', 'true');
  }
  
  activateBurger();

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
  
  if (gameState.timer) {
    gameStatus.append(restartButton());
  } else {
    gameStatus.innerHTML = '<div style="margin-bottom: auto">Click on the field to start</div>';
  }

  wrapper.append(parameters);
  wrapper.append(gameStatus);
  body.append(wrapper);
  document.querySelector('.bombs-nr').innerText = gameState.bombsNumber;
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
      if ((e.target.id === 'radio_easy') && (gameState.cellNr !== 10)) {
        gameState.cellNr = 10;
        restart();
      } else if ((e.target.id === 'radio_medium') && (gameState.cellNr !== 15)) {
        gameState.cellNr = 15;
        restart();
      } else if ((e.target.id === 'radio_hard') && (gameState.cellNr !== 25)) {
        gameState.cellNr = 25;
        restart();
      } else if (e.target.id === 'bombs-qty') {
        if ((e.target.value > 9) && (e.target.value < 100) && (e.target.value !== gameState.bombsNumber)) {
          gameState.bombsNumber = e.target.value;

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

  field.classList.add(`fieldsize-${gameState.cellNr}`);

  if (fieldMatrix.length == (gameState.cellNr * gameState.cellNr)) {
    console.log('get cells from storage')
    for (let i = 0; i < gameState.cellNr; i++) {
      const row = makeDiv('row');
      for (let j = 0; j < gameState.cellNr; j++) {
        const cellNumber = ((i * gameState.cellNr) + j);
        const cell = fieldMatrix[cellNumber];
        const cellDOMelement = cell.generateCell();
        if (cell.flag) { cellDOMelement.classList.add('cell_flag') }
        if (cell.opened) {
          cellDOMelement.classList.add('cell_opened');
          if (cell.bombsAround) {
            cellDOMelement.classList.add(`cell_type_${cell.bombsAround}`);
            cellDOMelement.innerText = cell.bombsAround;
          }
        }
        row.append(cellDOMelement);
      }
      field.append(row);
    }
  } else {
    console.log('build new cells')
    for (let i = 0; i < gameState.cellNr; i++) {
      const row = makeDiv('row');
      for (let j = 0; j < gameState.cellNr; j++) {
        const cellNumber = ((i * gameState.cellNr) + j);
        const cell = new Cell(i, j, cellNumber);
        row.append(cell.generateCell());
        fieldMatrix.push(cell);
      }
      field.append(row);
    }
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
  arr.splice(startingCellNr, 1);
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
      if ((row > 0) && (col > 0)) { count += (fieldMatrix[number - gameState.cellNr - 1].bomb) ? 1 : 0 }
      if (row > 0) { count += (fieldMatrix[number - gameState.cellNr].bomb) ? 1 : 0 }
      if ((row > 0) && (col < (gameState.cellNr - 1))) { count += (fieldMatrix[number - gameState.cellNr + 1].bomb) ? 1 : 0 }
      if (col > 0) { count += (fieldMatrix[number - 1].bomb) ? 1 : 0 }
      if (col < (gameState.cellNr - 1)) { count += (fieldMatrix[number + 1].bomb) ? 1 : 0 }
      if ((col > 0) && (row < (gameState.cellNr - 1))) { count += (fieldMatrix[number + gameState.cellNr - 1].bomb) ? 1 : 0 }
      if (row < (gameState.cellNr - 1)) { count += (fieldMatrix[number + gameState.cellNr].bomb) ? 1 : 0 }
      if ((col < (gameState.cellNr - 1)) && (row < (gameState.cellNr - 1))) { count += (fieldMatrix[number + gameState.cellNr + 1].bomb) ? 1 : 0 }

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
      document.querySelector('.flags-nr').innerText = gameState.flagCounter;
      if (fieldMatrix[nr].bombsAround === 0) { openAround(nr) };
    }
  }

  if ((row > 0) && (col > 0)) { openAdjacentCell(number - gameState.cellNr - 1) };
  if (row > 0) { openAdjacentCell(number - gameState.cellNr) };
  if ((row > 0) && (col < (gameState.cellNr - 1))) { openAdjacentCell(number - gameState.cellNr + 1) };
  if (col > 0) { openAdjacentCell(number - 1) };
  if (col < (gameState.cellNr - 1)) { openAdjacentCell(number + 1) };
  if ((col > 0) && (row < (gameState.cellNr - 1))) { openAdjacentCell(number + gameState.cellNr - 1) };
  if (row < (gameState.cellNr - 1)) { openAdjacentCell(number + gameState.cellNr) };
  if ((col < (gameState.cellNr - 1)) && (row < (gameState.cellNr - 1))) { openAdjacentCell(number + gameState.cellNr + 1) };
}
// ----------------------------------------------------

// handle clicks
const rightClickHandler = e => {
  const cell = e.target;

  if (cell.classList.contains('cell')) {
    e.preventDefault();
  }

  if ((cell.classList.contains('cell'))
    && (!cell.classList.contains('cell_opened'))) {
    fieldMatrix[cell.dataset.number].toggleFlag();
    document.querySelector('.flags-nr').innerText = gameState.flagCounter;
  }
}

const leftClickHandler = (e) => {
  const cell = e.target;
  if ((cell.classList.contains('cell'))
    && (!cell.classList.contains('cell_flag'))
    && (!fieldMatrix[cell.dataset.number].opened)) {
    const nr = cell.dataset.number;
    fieldMatrix[nr].openCell();
    gameState.moveCounter++;
    document.querySelector('.moves-nr').innerText = gameState.moveCounter;
    if (fieldMatrix[nr].bomb) {
      // clicked on a bomb
      cell.classList.add('cell_type_bomb-exploded');
      gameOver(false);
    } else {
      if (fieldMatrix[nr].bombsAround === 0) { openAround(nr) };
      if ((gameState.openCounter + +gameState.bombsNumber) === fieldMatrix.length) { gameOver(true); };
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
      plantBombs(gameState.bombsNumber, nr);
      gameState.moveCounter++;
      document.querySelector('.bombs-nr').innerText = gameState.bombsNumber;
      document.querySelector('.moves-nr').innerText = gameState.moveCounter;
      countAround();
      fieldMatrix[nr].openCell();
      if (fieldMatrix[nr].bombsAround === 0) { openAround(nr) };
      handleClicks();
      countTime();
      document.querySelector('.game-status').innerHTML = '';
      document.querySelector('.game-status').append(restartButton());
      if ((gameState.openCounter + +gameState.bombsNumber) === fieldMatrix.length) { gameOver(true) };
      gameState.firstTime = false;
    }
    field.removeEventListener('click', initialClickHandler);
  }
  field.addEventListener('click', initialClickHandler);
}

const displayParameters = () => {
  document.querySelector('.bombs-nr').innerText = gameState.bombsNumber;
  document.querySelector('.moves-nr').innerText = gameState.moveCounter;
  document.querySelector('.flags-nr').innerText = gameState.flagCounter;
  document.querySelector('.time').innerText = formatTime(gameState.timer);
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

  const restartBlock = document.querySelector('.game-status');
  
  if (win) {
    if (gameState.soundOn) { winFX.play() };
    restartBlock.classList.add('win');
    restartBlock.innerHTML = '<div>You win!</div>';
    restartBlock.append(restartButton());
    updateStats();
  } else {
    if (gameState.soundOn) { loseFX.play() };
    restartBlock.classList.add('lose');
    restartBlock.innerHTML = '<div>You lose!</div>';
    restartBlock.append(restartButton());
  }

  fieldMatrix.forEach(cell => {
    cell.bomb = false;
    cell.bombsAround = 0;
    cell.opened = false;
    cell.flag = false;
  });
  gameState.firstTime = true;
  gameState.flagCounter = 0;
  gameState.openCounter = 0;
  gameState.moveCounter = 0;
  gameState.timer = 0;
}

const updateStats = () => {
  
  const gameResult = {
    fieldsize: `${gameState.cellNr} x ${gameState.cellNr}`,
    bombs: gameState.bombsNumber,
    moves: gameState.moveCounter,
    time: formatTime(gameState.timer)
  };
  gameStats.unshift(gameResult);
  gameStats.length = 10;
  console.log(gameStats);
  localStorage.setItem('gameStats', JSON.stringify(gameStats)); 
}
// ----------------------------------------------------

// restart
const restart = () => {
  gameState.moveCounter = 0;
  gameState.openCounter = 0;
  gameState.flagCounter = 0;
  gameState.timer = 0;
  document.querySelector('.moves-nr').innerText = gameState.moveCounter;
  document.querySelector('.flags-nr').innerText = gameState.flagCounter;
  document.querySelector('.time').innerText = formatTime(gameState.timer);
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
  handleRestartClick();
}

const handleRestartClick = () => {
  document.querySelector('.game-status').addEventListener('click', (e) => {
    if (e.target.className === 'restart') {
      restart();
      if (gameState.soundOn) { flagFX.play() };
    }
  });
}
// ----------------------------------------------------

setHeader();
setParametersSection();
switchSound();
setField();
if (gameState.firstTime) {
  start();
} else {
  handleClicks();
  displayParameters();
  countTime();
}
handleRestartClick();

showStats();
getDifficulty();
