import type { NextFunction, Request, Response } from 'express'
import { supabaseAdmin } from '../services/supabase.js'
import type { UserRole } from '../types/roles.js'

export async function requireAuth(request: Request, response: Response, next: NextFunction) {
  const token = request.header('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return response.status(401).json({ error: 'Missing bearer token' })

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)
  if (userError || !userData.user) return response.status(401).json({ error: 'Invalid session' })

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role, status')
    .eq('id', userData.user.id)
    .single()
  if (profileError || !profile) return response.status(403).json({ error: 'Profile unavailable' })
  if (profile.status !== 'active') return response.status(403).json({ error: 'Account is not active' })

  request.auth = { userId: userData.user.id, role: profile.role as UserRole, status: profile.status }
  next()
}

export function requireRole(...roles: UserRole[]) {
  return (request: Request, response: Response, next: NextFunction) => {
    if (!request.auth || !roles.includes(request.auth.role)) {
      return response.status(403).json({ error: 'Insufficient permissions' })
    }
    next()
  }
}

