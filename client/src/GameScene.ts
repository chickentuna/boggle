import Phaser from 'phaser'

import woodTiles from './assets/Wood'
import availableDie from './dice'

interface Tile {
  row: number
  column: number
  letter: string
  sprite: Phaser.GameObjects.Sprite
}

enum Language {
  EN = 'EN',
  FR = 'FR',
}

const boardX = 100
const boardY = 100
const boardSize = 4
const tileSize = 100

export default class GameScene extends Phaser.Scene {
  board: Tile[][]
  currentTiles: Tile[]
  currentWordText: Phaser.GameObjects.Text
  currentWordTextStartPosition: Phaser.Geom.Point
  wordInProgress = false
  dictionaries: { [language in Language]: string[] }
  dictionary: string[]
  score: number
  scoreText: Phaser.GameObjects.Text
  words: string[]

  preload () {
    for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
      this.load.image(letter, woodTiles[letter])
    }
  }

  async create () {
    await this.fetchDictionaries() // TODO: loader?
    this.initBoard()
    this.input.on('pointerdown', pointer => this.onPointerDown(pointer))
    this.input.on('pointermove', pointer => this.onPointerMove(pointer))
    this.input.on('pointerupoutside', pointer => this.onPointerUp(pointer))
    this.input.on('pointerup', pointer => this.onPointerUp(pointer))

    this.currentWordTextStartPosition = new Phaser.Geom.Point(
      boardX + (tileSize * boardSize) / 2,
      boardY / 2
    )
    this.currentWordText = this.add.text(this.currentWordTextStartPosition.x, this.currentWordTextStartPosition.y, '')
      .setFontFamily('Arial')
      .setFontSize(25)
      .setColor('white')
      .setAlign('center')
      .setOrigin(0.5)

    this.words = []
    this.score = 0
    this.scoreText = this.add.text(boardX + (tileSize * boardSize) / 2, boardY + (tileSize * boardSize) + boardY / 2, '0')
      .setFontFamily('Arial')
      .setFontSize(25)
      .setColor('white')
      .setAlign('center')
      .setOrigin(0.5)
  }

  async fetchDictionaries () {
    const response = await fetch('http://localhost:3001/dictionaries')
    this.dictionaries = await response.json()
    this.dictionary = this.dictionaries.FR
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
    if (!tile) {
      return
    }

    this.wordInProgress = true
    this.currentTiles = [tile]
    this.highlightTile(tile)

    this.currentWordText.setText(tile.letter)
  }

  highlightTile (tile: Tile) {
    tile.sprite.setTint(0x00ff00)
  }

  unhighlightTile (tile: Tile) {
    tile.sprite.clearTint()
  }

  onPointerMove (pointer: Phaser.Input.Pointer) {
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
    this.currentWordText.setText(word)
  }

  getWordScore (word: string): number {
    const wordExists = this.dictionary.includes(word)
    if (!wordExists) {
      return 0
    }
    if (word.length < 3) {
      return 0
    } else if (word.length < 5) {
      return 1
    } else if (word.length === 5) {
      return 2
    } else if (word.length === 6) {
      return 3
    } else if (word.length === 7) {
      return 5
    } else {
      return 11
    }
  }

  onPointerUp (pointer: Phaser.Input.Pointer) {
    if (this.currentTiles == null) {
      return
    }

    const word = this.currentTiles.map(tile => tile.letter).join('')
    console.log(word)

    const wordExists = this.dictionary.includes(word)
    const alreadyFound = this.words.includes(word)
    const isValid = word.length > 2
    const isNewWord = wordExists && !alreadyFound && isValid
    if (isNewWord) {
      this.words.push(word)
      this.score += this.getWordScore(word)
      this.scoreText.setText(this.score.toString())
      this.animateNewWord()
    } else if (!isValid || !wordExists) {
      this.animateInvalidWord()
    } else if (alreadyFound) {
      this.animateAlreadyFoundWord()
    }

    this.currentTiles.forEach(tile => this.unhighlightTile(tile))
    this.wordInProgress = false
    this.currentTiles = null
  }

  animateNewWord (): void {
    // Bump up
    this.tweens.add({
      targets: this.currentWordText,
      y: '-=40',
      ease: 'Power1',
      duration: 300,
      yoyo: true,
      repeat: 0,
      onComplete: () => {
        this.resetCurrentWordText()
      }
    })

    // Fade to green
    this.tweens.addCounter({
      from: 0xff,
      to: 0,
      duration: 300,
      onUpdate: tween => {
        var value = Math.floor(tween.getValue())
        this.currentWordText.setTint(Phaser.Display.Color.GetColor(value, 0xff, value))
      }
    })
  }

  animateInvalidWord (): void {
    const shakeForce = 10

    // Shake
    this.tweens.addCounter({
      from: 0,
      to: 4 * Math.PI,
      duration: 300,
      onUpdate: tween => {
        this.currentWordText.setX(this.currentWordTextStartPosition.x + shakeForce * Math.sin(tween.getValue()))
      },
      onComplete: () => {
        this.resetCurrentWordText()
      }
    })
    // Fade to red
    this.tweens.addCounter({
      from: 0xff,
      to: 0,
      duration: 300,
      onUpdate: tween => {
        var value = Math.floor(tween.getValue())
        this.currentWordText.setTint(Phaser.Display.Color.GetColor(0xff, value, value))
      },
      onComplete: () => {
        this.resetCurrentWordText()
      }
    })
  }

  animateAlreadyFoundWord (): void {
    // Fade out
    this.tweens.add({
      targets: this.currentWordText,
      alpha: 0,
      duration: 300,
      repeat: 0,
      onComplete: () => {
        this.resetCurrentWordText()
      }
    })
  }

  resetCurrentWordText (): void {
    this.currentWordText.setText('')
    this.currentWordText.setTint(0xffffff)
    this.currentWordText.setAlpha(1)
    this.currentWordText.setPosition(this.currentWordTextStartPosition.x, this.currentWordTextStartPosition.y)
  }

  getTileAt (pointer: Phaser.Input.Pointer): Tile {
    const x = pointer.worldX - boardX
    const y = pointer.worldY - boardY

    const row = Math.floor(y / tileSize)
    const column = Math.floor(x / tileSize)

    const radius = tileSize / 2

    const centerX = column * tileSize + radius
    const centerY = row * tileSize + radius

    if (Phaser.Math.Distance.Between(x, y, centerX, centerY) <= radius) {
      return this.board[row] && this.board[row][column]
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
