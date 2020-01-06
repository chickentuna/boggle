import Phaser from 'phaser'

import greenfelt from './assets/greenfelt.jpg'
import socket from './socket'

export default class MatchListScene extends Phaser.Scene {
  constructor () {
    super({
      key: 'MatchListScene'
    })
  }

  preload (data) {
    this.load.image('background', greenfelt)
  }

  create (matches) {
    this.add.sprite(0, 0, 'background')
      .setOrigin(0)
      .setDisplaySize(this.scale.width, this.scale.height)

    this.add.text(this.scale.width / 2, 60, 'Active matches:')
      .setFontFamily('Arial')
      .setFontSize(25)
      .setColor('white')
      .setStroke('black', 4)
      .setAlign('center')
      .setOrigin(0.5)

    matches.forEach((match, index) => {
      this.add.text(this.scale.width / 3, 150 + index * 40,
        `${match.users[0].name} VS ${match.users[1].name}\nCurrent round: ${match.rounds.length + 1}/3`
      )
        .setFontFamily('Arial')
        .setFontSize(20)
        .setColor('white')
        .setStroke('black', 4)
        .setAlign('center')
        .setOrigin(0.5)
    })
  }
}
