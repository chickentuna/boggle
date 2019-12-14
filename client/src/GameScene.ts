import Phaser from 'phaser'
import io from 'socket.io-client'

import blankDice from './assets/blank_dice.png'
import woodTiles from './assets/Wood'
import greenfelt from './assets/greenfelt.jpg'
import availableDie from './dice'

const socket = io('ws://localhost:3001', {
  transports: ['websocket']
})
socket.on('connect', (...args) => {
  console.log('connect', ...args)
})
socket.on('event', (data) => {
  console.log('event', data)
})
socket.on('disconnect', () => {
  console.log('disconnect')
})

interface Tile {
  row: number
  column: number
  letter: string
  sprite: Phaser.GameObjects.Sprite
  container: Phaser.GameObjects.Container
}

interface GameLayers {
  foreground: Phaser.GameObjects.Container
  middleground: Phaser.GameObjects.Container
  background: Phaser.GameObjects.Container
}

interface ValidWord {
  word: string
  sequence: Tile[]
}

enum Language {
  EN = 'EN',
  FR = 'FR',
}

const boardX = 100
const boardY = 100
const boardSize = 4
const tileSize = 100
const roundTimeSeconds = 180

export default class GameScene extends Phaser.Scene {
  board: Tile[][]
  currentTiles: Tile[]
  timerText: Phaser.GameObjects.Text
  timerEvent: Phaser.Time.TimerEvent
  currentWordText: Phaser.GameObjects.Text
  currentWordTextStartPosition: Phaser.Geom.Point
  wordInProgress = false
  dictionaries: { [language in Language]: string[] }
  dictionary: string[]
  score: number
  scoreText: Phaser.GameObjects.Text
  words: string[]
  layers: GameLayers
  foreground: Phaser.GameObjects.Container

  preload () {
    for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
      this.load.image(letter, woodTiles[letter])
    }
    this.load.image('dice', blankDice)
    this.load.image('background', greenfelt)
  }

  update (time, delta) {
    if (this.timerText) {
      this.timerText.setText(Math.ceil(roundTimeSeconds - this.timerEvent.getElapsedSeconds()).toString())
    }
  }

  async create () {
    // TODO: proper loader, not part of the game scene
    const dictLoadText = this.add.text(10, 10, 'Loading dictionaries...')
    await this.fetchDictionaries()
    dictLoadText.destroy()
    this.initBoard()
    this.findValidWords()
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
      .setStroke('black', 4)
      .setAlign('center')
      .setOrigin(0.5)

    this.words = []
    this.score = 0
    this.scoreText = this.add.text(boardX + (tileSize * boardSize) / 2, boardY + (tileSize * boardSize) + boardY / 2, '0')
      .setFontFamily('Arial')
      .setFontSize(25)
      .setColor('white')
      .setStroke('black', 4)
      .setAlign('center')
      .setOrigin(0.5)

    const background = this.add.sprite(0, 0, 'background')
      .setOrigin(0)
      .setDisplaySize(this.scale.width, this.scale.height)

    const allTileContainers = this.board.flatMap(v => v.map(tile => tile.container))
    this.layers = {
      background: this.add.container(0, 0, [background]),
      middleground: this.add.container(0, 0, [...allTileContainers, this.currentWordText, this.scoreText]),
      foreground: this.add.container(0, 0)
    }

    this.timerEvent = this.time.addEvent({
      delay: roundTimeSeconds * 1000,
      callback: this.onTimeOut,
      callbackScope: this
    })

    this.timerText = this.add.text(10, 10, roundTimeSeconds.toString())
      .setFontFamily('Arial')
      .setFontSize(25)
      .setColor('white')
      .setStroke('black', 4)
      .setAlign('left')
  }

  findValidWords (): ValidWord[] {
    const start = Date.now()

    const validWords: ValidWord[] = []
    for (const word of this.dictionary) {
      const sequence = this.findSequence(word)
      if (sequence != null) {
        validWords.push({ word, sequence })
      }
    }

    const end = Date.now()
    const duration = end - start
    console.log(`Found ${validWords.length} solutions in ${duration}ms`, validWords)

    return validWords
  }

  findSequence (word: string): Tile[] {
    for (const row of this.board) {
      for (const tile of row) {
        const sequence = this.findSequenceFromTile(word, tile)
        if (sequence != null) {
          return sequence
        }
      }
    }
    return null
  }

  findSequenceFromTile (word: string, tile: Tile): Tile[] {
    if (tile.letter !== word[0]) {
      return null
    }

    let tileSequences: Tile[][] = [[tile]]

    for (let i = 1; i < word.length && tileSequences.length > 0; i++) {
      const letter = word[i]
      tileSequences = tileSequences
        .flatMap(sequence => {
          const lastTile = sequence[sequence.length - 1]
          const neighboursCoords = [
            [lastTile.row - 1, lastTile.column],
            [lastTile.row - 1, lastTile.column + 1],
            [lastTile.row, lastTile.column + 1],
            [lastTile.row + 1, lastTile.column + 1],
            [lastTile.row + 1, lastTile.column],
            [lastTile.row + 1, lastTile.column - 1],
            [lastTile.row, lastTile.column - 1],
            [lastTile.row - 1, lastTile.column - 1]
          ]
          const neighbours = neighboursCoords
            .filter(([row, column]) => column >= 0 && column < boardSize && row >= 0 && row < boardSize)
            .map(([row, column]) => this.board[row][column])
          return neighbours
            .filter(neighbour => neighbour.letter === letter && !sequence.includes(neighbour))
            .map(neighbour => [...sequence, neighbour])
        })
    }
    return tileSequences.length > 0 ? tileSequences[0] : null
  }

  onTimeOut () {
    this.scene.restart()
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
        const tileX = boardX + column * tileSize + tileSize / 2
        const tileY = boardY + row * tileSize + tileSize / 2
        const container = this.add.container(tileX, tileY)
        const sprite = this.add.sprite(0, 0, 'dice').setInteractive()
        const letterText = this.add.text(0, 0, letter)
          .setFontFamily('Arial')
          .setFontSize(60)
          .setColor('black')
          .setAlign('center')
          .setFontStyle('bold')
          .setOrigin(0.5)

        sprite.scale = tileSize / sprite.width
        sprite.setOrigin(0.5)
        container.add(sprite)
        container.add(letterText)
        tile.sprite = sprite
        tile.container = container
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
    this.bulgeTile(tile)

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
    this.unbulgeTile(lastTile)
    this.bulgeTile(tile)

    const word = this.currentTiles.map(tile => tile.letter).join('')
    this.currentWordText.setText(word)
  }

  bulgeTile (tile: Tile) {
    this.layers.middleground.remove(tile.container)
    this.layers.foreground.add(tile.container)
    tile.container.setScale(1.1)
  }

  unbulgeTile (tile: Tile) {
    this.layers.foreground.remove(tile.container)
    this.layers.middleground.add(tile.container)
    tile.container.setScale(1)
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
    this.unbulgeTile(this.currentTiles[this.currentTiles.length - 1])
    this.wordInProgress = false
    this.currentTiles = null
  }

  animateNewWord (): void {
    // Bump up
    this.tweens.add({
      targets: this.currentWordText,
      y: '-=30',
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
    this.currentWordText.clearTint()
    this.currentWordText.clearAlpha()
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
  const dieLeft = Phaser.Math.RND.shuffle([...availableDie])
  for (let y = 0; y < size; ++y) {
    const row: Tile[] = []
    for (let x = 0; x < size; ++x) {
      const dice = dieLeft.shift()
      // Roll dice
      const letter = Phaser.Math.RND.pick(dice)
      row.push({ row: y, column: x, letter, sprite: null, container: null })
    }
    board.push(row)
  }
  return board
}
