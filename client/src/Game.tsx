import React, { useEffect } from 'react'
import Phaser from 'phaser'

import GameScene from './GameScene'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 600,
  height: 600,
  scene: GameScene
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
