import log from './log'
import { matches as mockMatches } from './mockData'
import { User, Match } from './types'

const matches = [...mockMatches]

interface Sessions {
  [id: string]: User
}

const sessions : Sessions = {}

function isPending (match:Match): boolean {
  return match.users.length === 1
}

function matchmake (user: User): Match {
  let match :Match = null

  // Find a pending match
  match = matches
    .filter(isPending)
    .find((match: Match) =>
      match.users[0].name !== user.name
    )

  if (match != null) {
    return match
  }

  // Create a match
  match = {
    users: [user],
    rounds: []
  }

  matches.push(match)
  return match
}

export function configureSocketServer (io: SocketIO.Server) {
  io.on('connection', (socket: SocketIO.Socket) => {
    log.debug('user connected', { ip: socket.handshake.address })

    socket.on('login', (nickname: string) => {
      log.debug('login: ' + nickname, socket.handshake.address)

      const userMatches = matches.filter((match:Match) =>
        match.users.find((user: User) =>
          user.name === nickname
        )
      )

      const user: User = { name: nickname }
      sessions[socket.id] = user

      socket.emit('matches', userMatches)
    })

    socket.on('new match', () => {
      const user:User = sessions[socket.id]
      const match:Match = matchmake(user)

      socket.emit('match', match)
      // TODO: somehow emit this to the other player aswell
    })

    socket.on('disconnect', () => {
      log.debug('user disconnected', socket.handshake.address)

      delete sessions[socket.id]
    })
  })
}
