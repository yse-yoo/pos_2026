import { useEffect, useState, type PropsWithChildren } from 'react'
import type { StaffUser } from '../api/authRepository'
import { getCurrentStaff, loginStaff, logoutStaff } from '../api/authRepository'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }: PropsWithChildren) {
  const [staff, setStaff] = useState<StaffUser | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [loginErrorMessage, setLoginErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      try {
        const currentStaff = await getCurrentStaff()
        if (isMounted) {
          setStaff(currentStaff)
        }
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false)
        }
      }
    }

    void checkAuth()

    return () => {
      isMounted = false
    }
  }, [])

  const login = async (loginId: string, password: string) => {
    setLoginErrorMessage(null)

    try {
      setStaff(await loginStaff(loginId, password))
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'ログインに失敗しました。'
      setLoginErrorMessage(message)
      throw error
    }
  }

  const logout = async () => {
    await logoutStaff()
    setStaff(null)
    setLoginErrorMessage(null)
  }

  return (
    <AuthContext.Provider value={{ staff, isCheckingAuth, loginErrorMessage, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
