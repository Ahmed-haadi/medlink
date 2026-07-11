import type { UserRole } from './roles.js'

declare global {
  namespace Express {
    interface Request {
      auth?: { userId: string; role: UserRole; status: string }
    }
  }
}

export {}

