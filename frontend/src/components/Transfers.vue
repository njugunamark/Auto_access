<script setup>
import { computed } from 'vue'
import { useVehicleStore } from '../stores/vehicles'
import StatusChip from './StatusChip.vue'

const vehicleStore = useVehicleStore()

// Only vehicles waiting on transfer document verification show up here
const transfers = computed(() =>
  vehicleStore.vehicles.filter((v) => v.status === 'transfer_submitted')
)

function formatPrice(amount) {
  return `KES ${Number(amount).toLocaleString()}`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function viewDocument(vehicle) {
  window.open(vehicle.transferDoc?.url || '#', '_blank')
}

function verifyTransfer(vehicleId) {
  vehicleStore.verifyTransfer(vehicleId)
}

function markCompleted(vehicleId) {
  vehicleStore.markCompleted(vehicleId)
}

function rejectDocument(vehicleId) {
  vehicleStore.rejectTransferDocument(vehicleId)
}
</script>

<template>
  <v-container class="py-8" style="max-width: 1000px">
    <h1 class="text-h4 font-weight-bold mb-2">Transfer verification</h1>
    <p class="text-body-2 text-medium-emphasis mb-6">
      Vehicles whose sellers have uploaded NTSA proof of transfer. Verify the
      document, then release payment.
    </p>

    <v-card
      v-for="vehicle in transfers"
      :key="vehicle.id"
      class="mb-6 pa-4"
      rounded="lg"
      elevation="1"
    >
      <v-row no-gutters>
        <v-col cols="12" sm="3" class="pr-sm-4 mb-4 mb-sm-0">
          <v-img
            :src="vehicle.images?.[0]?.url"
            height="140"
            rounded="lg"
            cover
          />
        </v-col>

        <v-col cols="12" sm="6">
          <div class="d-flex align-center flex-wrap mb-1" style="gap: 8px">
            <span class="text-h6 font-weight-bold">
              {{ vehicle.make }} {{ vehicle.model }}
            </span>
            <StatusChip :status="vehicle.status" />
          </div>
          <div class="text-body-2 text-medium-emphasis mb-3">
            {{ vehicle.year }} · {{ vehicle.plateOrRef }} ·
            {{ vehicle.sellerName }} ({{ vehicle.sellerEmail }})
          </div>

          <v-card variant="outlined" rounded="lg" class="pa-3 mb-3">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center" style="gap: 12px">
                <v-avatar color="blue-lighten-5" size="36" rounded="lg">
                  <v-icon icon="mdi-file-document-outline" color="primary" size="20" />
                </v-avatar>
                <div>
                  <div class="text-body-2 font-weight-medium">
                    {{ vehicle.transferDoc?.name }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Uploaded {{ formatDate(vehicle.transferDoc?.uploadedAt) }} · NTSA proof of transfer
                  </div>
                </div>
              </div>
              <v-btn
                variant="outlined"
                rounded="pill"
                size="small"
                prepend-icon="mdi-download"
                @click="viewDocument(vehicle)"
              >
                View
              </v-btn>
            </div>
          </v-card>

          <div class="text-body-2">
            Agreed payout:
            <span class="font-weight-bold">{{ formatPrice(vehicle.offerAmount) }}</span>
          </div>
        </v-col>

        <v-col
          cols="12"
          sm="3"
          class="d-flex flex-column justify-center align-sm-end mt-4 mt-sm-0"
          style="gap: 10px"
        >
          <v-btn
            color="primary"
            rounded="pill"
            block
            prepend-icon="mdi-check-decagram"
            @click="verifyTransfer(vehicle.id)"
          >
            Verify transfer
          </v-btn>
          <v-btn
            variant="outlined"
            rounded="pill"
            block
            prepend-icon="mdi-wallet-outline"
            @click="markCompleted(vehicle.id)"
          >
            Mark completed
          </v-btn>
          <v-btn
            variant="text"
            color="error"
            size="small"
            @click="rejectDocument(vehicle.id)"
          >
            Reject document
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <v-empty-state
      v-if="!transfers.length"
      icon="mdi-file-check-outline"
      title="No transfers to verify"
      text="Vehicles will appear here once sellers upload their NTSA proof of transfer."
    />
  </v-container>
</template>