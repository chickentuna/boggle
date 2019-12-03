import React from 'react'

import './App.css'
import Game from './Game'

function App () {
  return (
    <div className='App'>
      <header className='App-header'>
        <h1 className='App-header-title'>BOGGLZ</h1>
      </header>
      <div className='App-content'>
        <Game />
      </div>
    </div>
  )
}

export default App
