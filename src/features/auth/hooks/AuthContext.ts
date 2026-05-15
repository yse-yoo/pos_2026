import { createContext } from 'react'
import type { StaffUser } from '../api/authRepository'

export type AuthContextValue = {
  staff: StaffUser | null
  isCheckingAuth: boolean
  loginErrorMessage: string | null
  login: (loginId: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
