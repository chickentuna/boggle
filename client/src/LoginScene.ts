import Phaser from 'phaser'

import greenfelt from './assets/greenfelt.jpg'
import { GAME_HEIGHT, GAME_WIDTH } from './constants'

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
        const inputText = element.getChildByProperty('className', 'LoginForm-nickname_input') as HTMLInputElement

        console.log('play', inputText.value)

        // Have they entered anything?
        if (inputText.value !== '') {
          // // Turn off the click events
          // element.removeListener('click')

          // // Hide the login element
          // element.setVisible(false)

          // // Populate the text with whatever they typed in
          // text.setText('Welcome ' + inputText.value)
        } else {
          // Flash the prompt
          // this.tweens.add({
          //   targets: text,
          //   alpha: 0.2,
          //   duration: 250,
          //   ease: 'Power3',
          //   yoyo: true
          // })
        }
      }
    })
  }
}
