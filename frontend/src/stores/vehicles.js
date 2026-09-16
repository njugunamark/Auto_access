import { defineStore } from 'pinia'
import api from '../services/api'

export const useVehicleStore = defineStore('vehicles', {
  state: () => ({
    vehicles: [],       // seller's own vehicles (My Submissions)
    pendingVehicles: [], // admin's review queue
    transferVehicles: [], // admin's transfers queue
  }),

  getters: {
    getVehicleById: (state) => (id) =>
      state.vehicles.find((v) => v.id === Number(id)) ||
      state.pendingVehicles.find((v) => v.id === Number(id)) ||
      state.transferVehicles.find((v) => v.id === Number(id)),
  },

  actions: {
    // ----- Seller actions -----

    async fetchMyVehicles() {
      try {
        const response = await api.get('/vehicles')
        this.vehicles = response.data.vehicles
        return { success: true }
      } catch (err) {
        return { success: false, message: err.response?.data?.message || 'Failed to load vehicles' }
      }
    },

    async fetchVehicle(id) {
      try {
        const response = await api.get(`/vehicles/${id}`)
        return { success: true, vehicle: response.data.vehicle }
      } catch (err) {
        return { success: false, message: err.response?.data?.message || 'Vehicle not found' }
      }
    },

    async submitVehicle(vehicleData) {
      try {
        const formData = new FormData()

        formData.append('make', vehicleData.make)
        formData.append('model', vehicleData.model)
        formData.append('year', vehicleData.year)
        formData.append('registration_number', vehicleData.registrationNumber)
        formData.append('condition_notes', vehicleData.conditionNotes || '')
        formData.append('description', vehicleData.description || '')
        formData.append('desired_price_min', vehicleData.desiredPriceMin)
        formData.append('desired_price_max', vehicleData.desiredPriceMax)
        formData.append('national_id', vehicleData.nationalId)
        formData.append('logbook', vehicleData.logbookFile)

        vehicleData.photos.forEach((photo) => {
          formData.append('photos[]', photo)
        })

        const response = await api.post('/vehicles', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        this.vehicles.unshift(response.data.vehicle)
        return { success: true, vehicle: response.data.vehicle }
      } catch (err) {
        return { success: false, message: err.response?.data?.message || 'Submission failed' }
      }
    },

    async acceptOffer(vehicleId) {
      try {
        const response = await api.post(`/vehicles/${vehicleId}/accept`)
        this._updateLocalVehicle(response.data.vehicle)
        return { success: true }
      } catch (err) {
        return { success: false, message: err.response?.data?.message || 'Failed to accept offer' }
      }
    },

    async rejectOffer(vehicleId) {
      try {
        const response = await api.post(`/vehicles/${vehicleId}/reject`)
        this._updateLocalVehicle(response.data.vehicle)
        return { success: true }
      } catch (err) {
        return { success: false, message: err.response?.data?.message || 'Failed to reject offer' }
      }
    },

    async submitTransferProof(vehicleId, { sellerName, sellerEmail, file }) {
      try {
        const formData = new FormData()
        formData.append('seller_name', sellerName)
        formData.append('seller_email', sellerEmail)
        formData.append('proof', file)

        const response = await api.post(`/vehicles/${vehicleId}/transfer-proof`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        this._updateLocalVehicle(response.data.vehicle)
        return { success: true }
      } catch (err) {
        return { success: false, message: err.response?.data?.message || 'Failed to submit proof' }
      }
    },

    async deleteVehicle(vehicleId) {
      try {
        await api.delete(`/vehicles/${vehicleId}`)
        this.vehicles = this.vehicles.filter((v) => v.id !== vehicleId)
        return { success: true }
      } catch (err) {
        return { success: false, message: err.response?.data?.message || 'Failed to delete vehicle' }
      }
    },

    // ----- Admin actions -----

    async fetchPendingVehicles() {
      try {
        const response = await api.get('/admin/vehicles/pending')
        this.pendingVehicles = response.data.vehicles
        return { success: true }
      } catch (err) {
        return { success: false, message: err.response?.data?.message || 'Failed to load pending vehicles' }
      }
    },

    async makeOffer(vehicleId, amount) {
      try {
        const response = await api.post(`/admin/vehicles/${vehicleId}/offer`, { offer_amount: amount })
        this.pendingVehicles = this.pendingVehicles.filter((v) => v.id !== vehicleId)
        return { success: true, vehicle: response.data.vehicle }
      } catch (err) {
        return { success: false, message: err.response?.data?.message || 'Failed to send offer' }
      }
    },

    async declineVehicle(vehicleId) {
      try {
        const response = await api.post(`/admin/vehicles/${vehicleId}/decline`)
        this.pendingVehicles = this.pendingVehicles.filter((v) => v.id !== vehicleId)
        return { success: true, vehicle: response.data.vehicle }
      } catch (err) {
        return { success: false, message: err.response?.data?.message || 'Failed to decline vehicle' }
      }
    },

    async fetchTransfersQueue() {
      try {
        const response = await api.get('/admin/vehicles/transfers')
        this.transferVehicles = response.data.vehicles
        return { success: true }
      } catch (err) {
        return { success: false, message: err.response?.data?.message || 'Failed to load transfers' }
      }
    },

    async verifyTransfer(vehicleId) {
      try {
        const response = await api.post(`/admin/vehicles/${vehicleId}/verify-transfer`)
        this._updateLocalVehicle(response.data.vehicle, 'transferVehicles')
        return { success: true }
      } catch (err) {
        return { success: false, message: err.response?.data?.message || 'Failed to verify transfer' }
      }
    },

    async markCompleted(vehicleId) {
      try {
        const response = await api.post(`/admin/vehicles/${vehicleId}/complete`)
        this.transferVehicles = this.transferVehicles.filter((v) => v.id !== vehicleId)
        return { success: true, vehicle: response.data.vehicle }
      } catch (err) {
        return { success: false, message: err.response?.data?.message || 'Failed to mark completed' }
      }
    },

    async rejectTransferDocument(vehicleId, reason) {
      try {
        const response = await api.post(`/admin/vehicles/${vehicleId}/reject-transfer`, { reason })
        this.transferVehicles = this.transferVehicles.filter((v) => v.id !== vehicleId)
        return { success: true, vehicle: response.data.vehicle }
      } catch (err) {
        return { success: false, message: err.response?.data?.message || 'Failed to reject document' }
      }
    },

    // ----- Internal helper -----
    _updateLocalVehicle(updatedVehicle, listName = 'vehicles') {
      const index = this[listName].findIndex((v) => v.id === updatedVehicle.id)
      if (index !== -1) this[listName][index] = updatedVehicle
    },
  },
})