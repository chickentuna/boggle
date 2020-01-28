export interface User {
    name:string
  }
export interface Round {
    results: Result[]
}
export interface Match {
    users: [User] | [User, User]
    rounds: Array<Round>
}
export interface Result {
    user: User
    score: Number
    words: string[]
}
