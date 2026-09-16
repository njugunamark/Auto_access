import { ref } from 'vue'
import api from './api'

const isAuthenticated = ref(!!localStorage.getItem('token'))
const isAdmin = ref(localStorage.getItem('role') === 'admin')

export function useAuth() {

  async function signup(data) {
    try {
      const response = await api.post('/register', {
        name: data.fullName,
        email: data.email,
        password: data.password,
        password_confirmation: data.password,
        phone_number: data.phoneNumber,
        location: data.location,
        address: data.address,
      })

      const { user, token } = response.data

      localStorage.setItem('token', token)
      localStorage.setItem('role', user.role)
      localStorage.setItem('user', JSON.stringify(user))

      isAuthenticated.value = true
      isAdmin.value = user.role === 'admin'

      return { success: true }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Something went wrong. Please try again.',
      }
    }
  }

  async function checkCredentials(credentials) {
    try {
      const response = await api.post('/login', {
        email: credentials.email,
        password: credentials.password,
      })

      const { user, token } = response.data

      localStorage.setItem('token', token)
      localStorage.setItem('role', user.role)
      localStorage.setItem('user', JSON.stringify(user))

      isAuthenticated.value = true
      isAdmin.value = user.role === 'admin'

      return { success: true }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Invalid email or password.',
      }
    }
  }

  async function logout() {
    try {
      await api.post('/logout')
    } catch (err) {
      // even if the request fails, still clear local state
    }

    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('user')

    isAuthenticated.value = false
    isAdmin.value = false
  }

  return { isAuthenticated, isAdmin, checkCredentials, signup, logout }
}