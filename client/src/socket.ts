import io from 'socket.io-client'

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

export default socket
