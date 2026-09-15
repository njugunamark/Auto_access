<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVehicleStore } from '../stores/vehicles'
import { useAuth } from '../services/Auth'
import StatusChip from './StatusChip.vue'

const route = useRoute()
const router = useRouter()
const vehicleStore = useVehicleStore()
const { isAdmin } = useAuth()

const vehicle = computed(() => vehicleStore.getVehicleById(route.params.id))

// Transfer upload form state
const sellerName = ref('')
const sellerEmail = ref('')
const transferFile = ref(null)
const uploading = ref(false)

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

async function acceptOffer() {
  await vehicleStore.acceptOffer(vehicle.value.id)
}

async function rejectOffer() {
  await vehicleStore.rejectOffer(vehicle.value.id)
}

async function submitTransfer() {
  if (!sellerName.value || !sellerEmail.value || !transferFile.value) return
  uploading.value = true
  await vehicleStore.submitTransferProof(vehicle.value.id, {
    sellerName: sellerName.value,
    sellerEmail: sellerEmail.value,
    file: transferFile.value,
  })
  uploading.value = false
}

function goBack() {
  router.push('/MySubmissions')
}
</script>

<template>
  <v-container class="py-8" style="max-width: 800px">
    <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="goBack">
      Back
    </v-btn>

    <template v-if="vehicle">
      <v-card rounded="lg" elevation="1" class="pa-4">
        <v-img
          :src="vehicle.images?.[0]?.url"
          height="280"
          rounded="lg"
          cover
          class="mb-4"
        />

        <div class="d-flex align-center flex-wrap mb-2" style="gap: 8px">
          <h1 class="text-h5 font-weight-bold">
            {{ vehicle.make }} {{ vehicle.model }}
          </h1>
          <StatusChip :status="vehicle.status" />
        </div>

        <div class="text-body-2 text-medium-emphasis mb-4">
          {{ vehicle.year }} · {{ vehicle.plateOrRef }} · Submitted
          {{ formatDate(vehicle.submittedAt) }}
        </div>

        <p v-if="vehicle.description" class="text-body-1 mb-4">
          {{ vehicle.description }}
        </p>

        <v-divider class="mb-4" />

        <div class="d-flex justify-space-between align-center mb-2">
          <span class="text-body-2 text-medium-emphasis">Your desired range</span>
          <span class="font-weight-medium">
            {{ formatPrice(vehicle.desiredPriceMin) }} –
            {{ formatPrice(vehicle.desiredPriceMax) }}
          </span>
        </div>

        <div
          v-if="vehicle.offerAmount"
          class="d-flex justify-space-between align-center mb-4"
        >
          <span class="text-body-2 text-medium-emphasis">Company's offer</span>
          <span class="text-h6 font-weight-bold text-primary">
            {{ formatPrice(vehicle.offerAmount) }}
          </span>
        </div>

        <!-- Seller: respond to an offer -->
        <div
          v-if="!isAdmin && vehicle.status === 'offer_made'"
          class="d-flex mt-4"
          style="gap: 12px"
        >
          <v-btn color="primary" rounded="pill" @click="acceptOffer">
            Accept offer
          </v-btn>
          <v-btn variant="outlined" color="error" rounded="pill" @click="rejectOffer">
            Reject offer
          </v-btn>
        </div>

        <!-- Seller: upload transfer proof once accepted -->
        <div v-if="!isAdmin && vehicle.status === 'accepted'" class="mt-4">
          <v-alert type="info" variant="tonal" class="mb-4">
            Offer accepted! Upload your NTSA transfer document to proceed with payment.
          </v-alert>

          <v-text-field
            v-model="sellerName"
            label="Your full name"
            variant="outlined"
            density="compact"
            class="mb-2"
          />
          <v-text-field
            v-model="sellerEmail"
            label="Your email"
            type="email"
            variant="outlined"
            density="compact"
            class="mb-2"
          />
          <v-file-input
            v-model="transferFile"
            label="NTSA proof of transfer (PDF or image)"
            variant="outlined"
            density="compact"
            accept=".pdf,.png,.jpg,.jpeg"
            prepend-icon="mdi-file-upload-outline"
            class="mb-2"
          />

          <v-btn
            color="primary"
            rounded="pill"
            :loading="uploading"
            :disabled="!sellerName || !sellerEmail || !transferFile"
            @click="submitTransfer"
          >
            Submit transfer document
          </v-btn>
        </div>

        <!-- Status after submission -->
        <v-alert
          v-if="!isAdmin && vehicle.status === 'transfer_submitted'"
          type="success"
          variant="tonal"
          class="mt-4"
        >
          Document submitted — awaiting admin verification.
        </v-alert>
      </v-card>
    </template>

    <v-empty-state
      v-else
      icon="mdi-car-off"
      title="Vehicle not found"
      text="This submission may have been removed or the link is incorrect."
    />
  </v-container>
</template>