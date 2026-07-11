export type UserRole = 'patient' | 'doctor' | 'admin'
export type AccountStatus = 'active' | 'pending' | 'suspended' | 'rejected'

export interface Profile {
  id: string
  role: UserRole
  status: AccountStatus
  full_name: string
}

