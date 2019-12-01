import Phaser from 'phaser'

import woodTiles from './assets/Wood'
import availableDie from './dice'

interface Tile {
  row: number
  column: number
  letter: string
  sprite: Phaser.GameObjects.Sprite
}

const boardX = 100
const boardY = 100
const boardSize = 4
const tileSize = 100

export default class GameScene extends Phaser.Scene {
  board: Tile[][]
  currentTiles: Tile[]
  currentWordText: Phaser.GameObjects.Text
  wordInProgress = false

  preload () {
    for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
      this.load.image(letter, woodTiles[letter])
    }
  }

  create () {
    this.initBoard()
    this.input.on('pointerdown', pointer => this.onPointerDown(pointer))
    this.input.on('pointermove', pointer => this.onPointerMove(pointer))
    this.input.on('pointerup', pointer => this.onPointerUp(pointer))

    this.currentWordText = this.add.text(boardX + (tileSize * boardSize) / 2, boardY / 2, '')
      .setFontFamily('Arial')
      .setFontSize(25)
      .setColor('white')
      .setAlign('center')
  }

  initBoard () {
    const board = createBoard(boardSize)
    this.board = board

    for (const row of board) {
      for (const tile of row) {
        const { letter, row, column } = tile
        const tileX = boardX + column * tileSize
        const tileY = boardY + row * tileSize
        const sprite = this.add.sprite(tileX, tileY, letter).setInteractive()
        sprite.scale = tileSize / sprite.width
        sprite.setOrigin(0)

        tile.sprite = sprite
      }
    }
  }

  onPointerDown (pointer: Phaser.Input.Pointer) {
    const tile = this.getTileAt(pointer)
    console.log(tile)
    
    this.wordInProgress = true
    this.currentTiles = [tile]
    this.highlightTile(tile)

    this.currentWordText.setText(tile.letter)
  }

  highlightTile(tile: Tile) {
    tile.sprite.setTint(0x00ff00)
  }

  unhighlightTile(tile: Tile) {
    tile.sprite.clearTint()
  }

  onPointerMove(pointer: Phaser.Input.Pointer) {
    if (!this.wordInProgress) {
      return
    }
    const tile = this.getTileAt(pointer)
    if (tile == null || this.currentTiles.includes(tile)) {
      return
    }
    const lastTile = this.currentTiles[this.currentTiles.length - 1]
    if (Math.abs(lastTile.row - tile.row) > 1 || Math.abs(lastTile.column - tile.column) > 1) {
      return
    }
    
    this.currentTiles.push(tile)
    this.highlightTile(tile)

    const word = this.currentTiles.map(tile => tile.letter).join('')
    this.currentWordText.setText(word).setOrigin(0.5)
  }

  onPointerUp(pointer: Phaser.Input.Pointer) {
    const word = this.currentTiles.map(tile => tile.letter).join('')

    console.log(word)

    // TODO: score

    this.currentTiles.forEach(tile => this.unhighlightTile(tile))
    this.wordInProgress = false
    this.currentTiles = null
    this.currentWordText.setText('')
  }

  getTileAt (pointer: Phaser.Input.Pointer): Tile {
    const row = Math.floor((pointer.worldY - boardY) / tileSize)
    const column = Math.floor((pointer.worldX - boardX) / tileSize)

    if (row >= 0 && row < boardSize && column >= 0 && column < boardSize) {
      return this.board[row][column]
    }
    return null
  }
}

function createBoard (size: number): Tile[][] {
  const board: Tile[][] = []
  const dieLeft = Phaser.Math.RND.shuffle(availableDie)
  for (let y = 0; y < size; ++y) {
    const row: Tile[] = []
    for (let x = 0; x < size; ++x) {
      const dice = dieLeft.shift()
      // Roll dice
      const letter = Phaser.Math.RND.pick(dice)
      row.push({ row: y, column: x, letter, sprite: null })
    }
    board.push(row)
  }
  return board
}