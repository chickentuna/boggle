import Phaser from 'phaser'
import greenfelt from './assets/greenfelt.jpg'
import socket from './socket'

export default class MatchListScene extends Phaser.Scene {
  newGameButton: Phaser.GameObjects.Text

  constructor () {
    super({
      key: 'MatchListScene'
    })
  }

  preload (data) {
    this.load.image('background', greenfelt)
  }

  startNewGame () {
    this.scene.switch('GameScene')
  }

  enterButtonHoverState (button) {
    button.setStyle({ fill: '#ff4' })
      .setShadow(-4, -4, '#222')
      .setPadding(4, 4, 0, 0)
  }

  enterButtonRestState (button) {
    button.setStyle({ fill: '#ff0' })
      .setShadow(0, 0)
      .setPadding(0, 0, 0, 0)
  }

  create (matches) {
    this.add.sprite(0, 0, 'background')
      .setOrigin(0)
      .setDisplaySize(this.scale.width, this.scale.height)

    this.newGameButton = this.add.text(this.scale.width / 2, 40, 'New match')
      .setFontFamily('Arial')
      .setFontSize(25)
      .setColor('#ff0')
      .setStroke('black', 4)
      .setAlign('center')
      .setOrigin(0.5)
      .setInteractive()

    this.newGameButton.on('pointerdown', () => this.startNewGame())
      .on('pointerover', () => this.enterButtonHoverState(this.newGameButton))
      .on('pointerout', () => this.enterButtonRestState(this.newGameButton))

    this.add.text(this.scale.width / 2, 90, 'Active matches:')
      .setFontFamily('Arial')
      .setFontSize(25)
      .setColor('white')
      .setStroke('black', 4)
      .setAlign('center')
      .setOrigin(0.5)

    matches.forEach((match, index) => {
      const matchText = this.add.text(this.scale.width / 3, 150 + index * 40,
        `${match.users[0].name} VS ${match.users[1].name}\nCurrent round: ${match.rounds.length + 1}/3`
      )
        .setFontFamily('Arial')
        .setFontSize(20)
        .setColor('#ff0')
        .setStroke('black', 4)
        .setAlign('center')
        .setOrigin(0.5)
        .setInteractive()

      matchText
        .on('pointerover', () => this.enterButtonHoverState(matchText))
        .on('pointerout', () => this.enterButtonRestState(matchText))
    })
  }
}
