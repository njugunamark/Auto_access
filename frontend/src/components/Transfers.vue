<script setup>
import { ref, onMounted } from 'vue'
import { useVehicleStore } from '../stores/vehicles'
import StatusChip from './StatusChip.vue'

const vehicleStore = useVehicleStore()
const loading = ref(true)
const loadError = ref('')
const actionError = ref('')

const STORAGE_BASE = 'http://127.0.0.1:8000/storage/'

const rejectDialogVehicle = ref(null)
const rejectReason = ref('')

function imageUrl(vehicle) {
  const path = vehicle.images?.[0]?.image_path
  return path ? STORAGE_BASE + path : null
}

function documentUrl(vehicle) {
  return vehicle.transfer_proof_path ? STORAGE_BASE + vehicle.transfer_proof_path : null
}

function documentName(vehicle) {
  if (!vehicle.transfer_proof_path) return 'No document'
  return vehicle.transfer_proof_path.split('/').pop()
}

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

async function loadTransfers() {
  loading.value = true
  loadError.value = ''
  const result = await vehicleStore.fetchTransfersQueue()
  if (!result.success) loadError.value = result.message
  loading.value = false
}

function viewDocument(vehicle) {
  const url = documentUrl(vehicle)
  if (url) window.open(url, '_blank')
}

async function verifyTransfer(vehicleId) {
  actionError.value = ''
  const result = await vehicleStore.verifyTransfer(vehicleId)
  if (!result.success) actionError.value = result.message
}

async function markCompleted(vehicleId) {
  actionError.value = ''
  const result = await vehicleStore.markCompleted(vehicleId)
  if (!result.success) actionError.value = result.message
}

function openRejectDialog(vehicle) {
  rejectDialogVehicle.value = vehicle
  rejectReason.value = ''
}

async function confirmReject() {
  actionError.value = ''
  const result = await vehicleStore.rejectTransferDocument(
    rejectDialogVehicle.value.id,
    rejectReason.value
  )
  if (!result.success) actionError.value = result.message
  rejectDialogVehicle.value = null
}

onMounted(loadTransfers)
</script>

<template>
  <v-container class="py-8" style="max-width: 1000px">
    <h1 class="text-h4 font-weight-bold mb-2">Transfer verification</h1>
    <p class="text-body-2 text-medium-emphasis mb-6">
      Vehicles whose sellers have uploaded NTSA proof of transfer. Verify the
      document, then release payment.
    </p>

    <v-alert v-if="actionError" type="error" variant="tonal" class="mb-6">
      {{ actionError }}
    </v-alert>

    <div v-if="loading" class="text-center py-10">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <v-alert v-else-if="loadError" type="error" variant="tonal">
      {{ loadError }}
    </v-alert>

    <template v-else>
      <v-card
        v-for="vehicle in vehicleStore.transferVehicles"
        :key="vehicle.id"
        class="mb-6 pa-4"
        rounded="lg"
        elevation="1"
      >
        <v-row no-gutters>
          <v-col cols="12" sm="3" class="pr-sm-4 mb-4 mb-sm-0">
            <v-img
              :src="imageUrl(vehicle)"
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
              {{ vehicle.year }} · {{ vehicle.registration_number }} ·
              {{ vehicle.user?.name }} ({{ vehicle.user?.email }})
            </div>

            <v-card variant="outlined" rounded="lg" class="pa-3 mb-3">
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center" style="gap: 12px">
                  <v-avatar color="blue-lighten-5" size="36" rounded="lg">
                    <v-icon icon="mdi-file-document-outline" color="primary" size="20" />
                  </v-avatar>
                  <div>
                    <div class="text-body-2 font-weight-medium">
                      {{ documentName(vehicle) }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Updated {{ formatDate(vehicle.updated_at) }} · NTSA proof of transfer
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
              <span class="font-weight-bold">{{ formatPrice(vehicle.offer_amount) }}</span>
            </div>
          </v-col>

          <v-col
            cols="12"
            sm="3"
            class="d-flex flex-column justify-center align-sm-end mt-4 mt-sm-0"
            style="gap: 10px"
          >
            <v-btn
              v-if="vehicle.status === 'transfer_submitted'"
              color="primary"
              rounded="pill"
              prepend-icon="mdi-check-decagram"
              @click="verifyTransfer(vehicle.id)"
            >
              Verify transfer
            </v-btn>
            <v-btn
              v-if="vehicle.status === 'transfer_verified'"
              color="success"
              rounded="pill"
              prepend-icon="mdi-wallet-outline"
              @click="markCompleted(vehicle.id)"
            >
              Mark completed
            </v-btn>
            <v-btn
              v-if="vehicle.status === 'transfer_submitted'"
              variant="text"
              color="error"
              size="small"
              @click="openRejectDialog(vehicle)"
            >
              Reject document
            </v-btn>
          </v-col>
        </v-row>
      </v-card>

      <v-empty-state
        v-if="!vehicleStore.transferVehicles.length"
        icon="mdi-file-check-outline"
        title="No transfers to verify"
        text="Vehicles will appear here once sellers upload their NTSA proof of transfer."
      />
    </template>

    <!-- Reject document dialog -->
    <v-dialog v-model="rejectDialogVehicle" max-width="420">
      <v-card v-if="rejectDialogVehicle" rounded="lg" class="pa-4">
        <v-card-title class="text-body-1 font-weight-bold">
          Reject transfer document?
        </v-card-title>
        <v-card-text>
          <v-textarea
            v-model="rejectReason"
            label="Reason (shown to the seller)"
            variant="outlined"
            rows="3"
          />
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="rejectDialogVehicle = null">Cancel</v-btn>
          <v-btn color="error" variant="flat" @click="confirmReject">Reject</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>