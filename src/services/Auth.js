import { ref } from 'vue'

const isAuthenticated = ref(localStorage.getItem('isAuthenticated') === 'true')
const isAdmin = ref(localStorage.getItem('isAdmin') === 'true')

// Mock "allowlist" — a real backend would check this against a database
const ADMIN_EMAILS = ['admin@autoaccess.com', 'reviewer@autoaccess.com']

function resolveRole(email) {
  return ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : 'seller'
}

export function useAuth() {

  async function checkCredentials(credentials) {
    try {
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required')
      }

      const stored = localStorage.getItem('user')
      if (!stored) throw new Error('No user found')

      const user = JSON.parse(stored)

      if (user.email !== credentials.email || user.password !== credentials.password) {
        throw new Error('Invalid email or password')
      }

      isAuthenticated.value = true
      isAdmin.value = resolveRole(user.email) === 'admin'

      localStorage.setItem('isAuthenticated', isAuthenticated.value)
      localStorage.setItem('isAdmin', isAdmin.value)

      return { success: true }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  async function signup(data) {
    try {
      const role = resolveRole(data.email)
      const user = { ...data, role }

      isAuthenticated.value = true
      isAdmin.value = role === 'admin'

      localStorage.setItem('isAuthenticated', isAuthenticated.value)
      localStorage.setItem('isAdmin', isAdmin.value)
      localStorage.setItem('user', JSON.stringify(user))

      return { success: true }
    } catch (err) {
      return { success: false, message: 'Error signing up' }
    }
  }

  function logout() {
    isAuthenticated.value = false
    isAdmin.value = false
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('isAdmin')
  }

  return { isAuthenticated, isAdmin, checkCredentials, signup, logout }
}