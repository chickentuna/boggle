import React from 'react'
import Phaser from 'phaser'

import './App.css'
import woodTiles from './assets/Wood'
import availableDie from './dice'

const boardSize = 4

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  }
}

function preload () {
  for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    this.load.image(`wood_${letter}`, woodTiles[letter])
  }
}

function create () {
  const board = initBoard(boardSize)
  console.log(board.length, board[0].length)
  initBoardView(board, this)
}

function initBoard (size: number): string[][] {
  const board = []
  const dieLeft = Phaser.Math.RND.shuffle(availableDie)
  for (let y = 0; y < size; ++y) {
    const row = []
    for (let x = 0; x < size; ++x) {
      const dice = dieLeft.shift()
      // Roll dice
      const letter = Phaser.Math.RND.pick(dice)
      row.push(letter)
    }
    board.push(row)
  }
  return board
}

function initBoardView (board, game) {
  const boardX = 120
  const boardY = 120
  const tileSize = 80

  const view = []
  for (let y = 0; y < board.length; ++y) {
    const row = []
    for (let x = 0; x < board[0].length; ++x) {
      const letter = board[y][x]
      const tileX = boardX + x * tileSize
      const tileY = boardY + y * tileSize
      const img = game.add.image(tileX, tileY, `wood_${letter}`)
      img.scale = tileSize / 256
      row.push(img)
    }
    view.push(row)
  }
  return view
}

function App () {
  // eslint-disable-next-line
  const game = new Phaser.Game(config)

  return (
    <div className='App'>
      <div id='game' />
    </div>
  )
}

export default App
