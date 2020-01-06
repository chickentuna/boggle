import React, { useEffect } from 'react'
import Phaser from 'phaser'

import { GAME_HEIGHT, GAME_WIDTH } from './constants'
import GameScene from './GameScene'
import LoginScene from './LoginScene'
import MatchListScene from './MatchListScene'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  scene: [LoginScene, MatchListScene, GameScene],
  dom: {
    createContainer: true
  }
}

function Game () {
  useEffect(() => {
    // eslint-disable-next-line
    const game = new Phaser.Game(config)
  }, [])

  return (
    <div id='game' />
  )
}

export default Game
