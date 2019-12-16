import log from './log'

export function configureSocketServer (io: SocketIO.Server) {
  io.on('connection', (socket: SocketIO.Socket) => {
    log.debug('user connected', { ip: socket.handshake.address })

    socket.on('login', (nickname) => {
      log.debug('login: ' + nickname, socket.handshake.address)
    })

    socket.on('disconnect', () => {
      log.debug('user disconnected', socket.handshake.address)
    })
  })
}
