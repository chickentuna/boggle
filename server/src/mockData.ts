import { User, Match } from './types'

// Mock "persistent" data

const users:Array<User> = [
  { name: 'Julien' },
  { name: 'Val' }
]
const julien = users[0]
const val = users[1]

export const matches:Array<Match> = [
  {
    users: [julien, val],
    rounds: [
      {
        results: [{
          score: 10,
          user: julien,
          words: ['test', 'data']
        },
        {
          score: 1000,
          user: val,
          words: ['mock', 'stuff', 'for', 'testing']
        }]
      }
    ]

  }
]
