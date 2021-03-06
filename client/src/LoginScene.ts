import Phaser from 'phaser'

import greenfelt from './assets/greenfelt.jpg'
import { GAME_HEIGHT, GAME_WIDTH } from './constants'
import socket from './socket'
import './LoginForm.scss'

export default class LoginScene extends Phaser.Scene {
  constructor () {
    super({
      key: 'LoginScene',
      active: true
    })
  }

  preload () {
    this.load.image('background', greenfelt)
    this.load.html('LoginForm', 'LoginForm.html')
  }

  create () {
    this.add.sprite(0, 0, 'background')
      .setOrigin(0)
      .setDisplaySize(this.scale.width, this.scale.height)

    const element = this.add.dom(GAME_WIDTH / 2, GAME_HEIGHT / 2).createFromCache('LoginForm')

    element.addListener('click')

    element.on('click', (event) => {
      if (event.target.className === 'LoginForm-playButton') {
        const input = element.getChildByProperty('className', 'LoginForm-nickname_input') as HTMLInputElement

        const nickname = input.value

        console.log('play', nickname)

        // Have they entered anything?
        if (nickname !== '') {
          element.removeListener('click')
          element.setVisible(false)

          socket.emit('login', nickname)
        } else {
          // TODO: handle empty/already taken nicknames
        }
      }
    })

    const self = this
    function handleMatches (data) {
      // Without the timeout, the form stays on top
      setTimeout(() => self.scene.start('MatchListScene', data), 500)
      socket.off('matches', handleMatches)
    }

    socket.on('matches', handleMatches)
  }
}
