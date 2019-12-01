import React, { useEffect } from 'react'
import Phaser from 'phaser'

import './App.css'
import GameScene from './GameScene'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 800,
  height: 600,
  scene: GameScene
}

function App () {
  useEffect(() => {
    // eslint-disable-next-line
    const game = new Phaser.Game(config)
  }, [])

  return (
    <div className='App'>
      <div id='game' />
    </div>
  )
}

export default App
