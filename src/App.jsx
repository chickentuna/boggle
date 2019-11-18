import React from 'react';
import './App.css';
import Phaser from "phaser";
import woodTiles from './assets/Wood.js'
import availableDie from './dice'

var boardSize = 4
var state = {

}


const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  }
};

/**
 * Shuffles an array inplace
 **/
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Returns an int in [low;high[
 * or [0; high[ if second parameter is left out
 **/
function randomInt(low, high) {
  if (high == null) {
    return randomInt(0, low)
  }
  if (low > high) {
    return randomInt(high, low)
  }
  return Math.floor((Math.random() * (high - low)) + low)
}

function preload() {
  for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    this.load.image(`wood_${letter}`, woodTiles[letter]);
  }
}

function create() {
  const logo = this.add.image(400, 150, "wood_A");
  // const board = initBoard(boardSize)
  // initBoardView(board,this)
}

function initBoard(size) {
  const board = []
  const dieLeft = [...availableDie]
  shuffleArray(dieLeft)
  for (let y = 0; y < size; ++y) {
    const row = []
    for (let x = 0; x < size; ++x) {
      
      const dice = dieLeft.shift()
      // Roll dice
      const letter = dice[randomInt(dice.length)]
      row.push(letter)
    }
    board.push(row)
  }
  return board
}


function initBoardView(board, game) {
  const view = []
  for (let y = 0; y < board.length; ++y) {
    const row = []
    for (let x = 0; x < board[0].length; ++x) {
      const letter = board[y][x]
      game.add.image(400, 150, `wood_${letter}`);
    }
    board.push(row)
  }
  return board
}


function App() {

  const game = new Phaser.Game(config);

  return (
    <div className="App">
      <div id="game"></div>
    </div>
  );
}

export default App;
