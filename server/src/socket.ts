import log from './log'
import { matches } from './mockData'

export function configureSocketServer (io: SocketIO.Server) {
  io.on('connection', (socket: SocketIO.Socket) => {
    log.debug('user connected', { ip: socket.handshake.address })

    socket.on('login', (nickname) => {
      log.debug('login: ' + nickname, socket.handshake.address)

      const userMatches = matches.filter(match =>
        match.users.find(user =>
          user.name === nickname
        )
      )
      socket.emit('matches', userMatches)
    })

    socket.on('disconnect', () => {
      log.debug('user disconnected', socket.handshake.address)
    })
  })
}
