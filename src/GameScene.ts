import Phaser from 'phaser'

import woodTiles from './assets/Wood'
import availableDie from './dice'

const boardSize = 4

export default class GameScene extends Phaser.Scene {
  preload () {
    for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
      this.load.image(`wood_${letter}`, woodTiles[letter])
    }
  }

  create () {
    const board = this.initBoard(boardSize)
    console.log(board)
    this.initBoardView(board)
  }

  initBoard (size: number): string[][] {
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

  initBoardView (board: string[][]) {
    const boardX = 100
    const boardY = 100
    const tileSize = 100
  
    const view = []
    for (let y = 0; y < board.length; ++y) {
      const row = []
      for (let x = 0; x < board[0].length; ++x) {
        const letter = board[y][x]
        const tileX = boardX + x * tileSize
        const tileY = boardY + y * tileSize
        const img = this.add.image(tileX, tileY, `wood_${letter}`)
        img.scale = tileSize / img.width
        img.setOrigin(0)
        row.push(img)
      }
      view.push(row)
    }
    return view
  }
}
