import { defineStore } from 'pinia'

export const useVehicleStore = defineStore('vehicles', {
  state: () => ({
    vehicles: [], // starts empty — fills up as you submit vehicles
  }),

  getters: {
    getVehicleById: (state) => (id) =>
      state.vehicles.find((v) => v.id === id),
  },

  actions: {
    async submitVehicle(vehicleData) {
      const newVehicle = {
        id: `AA-${1000 + this.vehicles.length + 1}`,
        status: 'pending',
        submittedAt: new Date().toISOString().slice(0, 10),
        offerAmount: null,
        ...vehicleData, // make, model, year, images, desiredPriceMin/Max, description
      }
      this.vehicles.unshift(newVehicle)
      return { success: true, vehicle: newVehicle }
    },

    async makeOffer(vehicleId, amount) {
      const vehicle = this.getVehicleById(vehicleId)
      if (!vehicle) return { success: false, message: 'Vehicle not found' }
      vehicle.offerAmount = amount
      vehicle.status = 'offer_made'
      return { success: true }
    },

    async acceptOffer(vehicleId) {
      const vehicle = this.getVehicleById(vehicleId)
      if (!vehicle) return { success: false, message: 'Vehicle not found' }
      vehicle.status = 'accepted'
      return { success: true }
    },

    async rejectOffer(vehicleId) {
      const vehicle = this.getVehicleById(vehicleId)
      if (!vehicle) return { success: false, message: 'Vehicle not found' }
      vehicle.status = 'rejected'
      return { success: true }
    },

    async deleteVehicle(vehicleId) {
      const index = this.vehicles.findIndex(v => v.id === vehicleId)
      if (index === -1) return { success: false, message: 'Vehicle not found' }
      this.vehicles.splice(index, 1)
      return { success: true }
    },

        async submitTransferProof(vehicleId, { sellerName, sellerEmail, file }) {
      const vehicle = this.getVehicleById(vehicleId)
      if (!vehicle) return { success: false, message: 'Vehicle not found' }

      vehicle.transferProof = {
        sellerName,
        sellerEmail,
        fileName: file?.name || null,
        fileUrl: file ? URL.createObjectURL(file) : null,
        submittedAt: new Date().toISOString(),
      }
      vehicle.status = 'transfer_submitted'
      return { success: true }
    },

    async verifyTransfer(vehicleId) {
      const vehicle = this.getVehicleById(vehicleId)
      if (!vehicle) return { success: false, message: 'Vehicle not found' }

      vehicle.transferVerifiedAt = new Date().toISOString()
      vehicle.status = 'transfer_verified'
      return { success: true }
    },

    async markCompleted(vehicleId) {
      const vehicle = this.getVehicleById(vehicleId)
      if (!vehicle) return { success: false, message: 'Vehicle not found' }

      vehicle.completedAt = new Date().toISOString()
      vehicle.status = 'completed'
      return { success: true }
    },

    async rejectTransferDocument(vehicleId, reason = '') {
      const vehicle = this.getVehicleById(vehicleId)
      if (!vehicle) return { success: false, message: 'Vehicle not found' }

      vehicle.transferProof = null
      vehicle.transferRejectionReason = reason
      vehicle.status = 'accepted' // bounce back so seller can re-upload
      return { success: true }
    },

    
  },
})