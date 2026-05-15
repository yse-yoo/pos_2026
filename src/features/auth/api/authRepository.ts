import { apiRequest } from '../../../lib/api/client'

export type StaffUser = {
  id: number
  loginId: string
  name: string
  role: string
}

type StaffResource = {
  id: number
  login_id: string
  name: string
  role: string
}

const mapStaff = (staff: StaffResource): StaffUser => ({
  id: Number(staff.id),
  loginId: staff.login_id,
  name: staff.name,
  role: staff.role,
})

export const getCurrentStaff = async (): Promise<StaffUser | null> => {
  const staff = await apiRequest<StaffResource | null>('/api/auth/me')
  return staff ? mapStaff(staff) : null
}

export const loginStaff = async (loginId: string, password: string): Promise<StaffUser> => {
  const staff = await apiRequest<StaffResource>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      login_id: loginId,
      password,
    }),
  })

  return mapStaff(staff)
}

export const logoutStaff = async (): Promise<void> => {
  await apiRequest<null>('/api/auth/logout', {
    method: 'POST',
  })
}
