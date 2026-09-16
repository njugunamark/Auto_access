<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVehicleStore } from '../stores/vehicles'
import { useAuth } from '../services/Auth'
import StatusChip from './StatusChip.vue'

const route = useRoute()
const router = useRouter()
const vehicleStore = useVehicleStore()
const { isAdmin } = useAuth()

const vehicle = ref(null)
const loading = ref(true)
const loadError = ref('')

const STORAGE_BASE = 'http://127.0.0.1:8000/storage/'

// Transfer upload form state
const sellerName = ref('')
const sellerEmail = ref('')
const transferFile = ref(null)
const uploading = ref(false)
const actionError = ref('')

function imageUrl(v) {
  const path = v?.images?.[0]?.image_path
  return path ? STORAGE_BASE + path : null
}

function formatPrice(amount) {
  if (amount === null || amount === undefined) return '—'
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

async function loadVehicle() {
  loading.value = true
  loadError.value = ''
  const result = await vehicleStore.fetchVehicle(route.params.id)
  if (result.success) {
    vehicle.value = result.vehicle
  } else {
    loadError.value = result.message
  }
  loading.value = false
}

async function acceptOffer() {
  actionError.value = ''
  const result = await vehicleStore.acceptOffer(vehicle.value.id)
  if (result.success) {
    await loadVehicle()
  } else {
    actionError.value = result.message
  }
}

async function rejectOffer() {
  actionError.value = ''
  const result = await vehicleStore.rejectOffer(vehicle.value.id)
  if (result.success) {
    await loadVehicle()
  } else {
    actionError.value = result.message
  }
}

async function submitTransfer() {
  if (!sellerName.value || !sellerEmail.value || !transferFile.value) return
  uploading.value = true
  actionError.value = ''
  const result = await vehicleStore.submitTransferProof(vehicle.value.id, {
    sellerName: sellerName.value,
    sellerEmail: sellerEmail.value,
    file: transferFile.value,
  })
  uploading.value = false
  if (result.success) {
    await loadVehicle()
  } else {
    actionError.value = result.message
  }
}

function goBack() {
  router.push('/MySubmissions')
}

onMounted(loadVehicle)
</script>

<template>
  <v-container class="py-8" style="max-width: 800px">
    <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="goBack">
      Back
    </v-btn>

    <div v-if="loading" class="text-center py-10">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <v-alert v-else-if="loadError" type="error" variant="tonal">
      {{ loadError }}
    </v-alert>

    <template v-else-if="vehicle">
      <v-card rounded="lg" elevation="1" class="pa-4">
        <v-alert v-if="actionError" type="error" variant="tonal" class="mb-4">
          {{ actionError }}
        </v-alert>

        <v-img
          :src="imageUrl(vehicle)"
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
          {{ vehicle.year }} · {{ vehicle.registration_number }} · Submitted
          {{ formatDate(vehicle.created_at) }}
        </div>

        <p v-if="vehicle.description" class="text-body-1 mb-4">
          {{ vehicle.description }}
        </p>

        <v-divider class="mb-4" />

        <div class="d-flex justify-space-between align-center mb-2">
          <span class="text-body-2 text-medium-emphasis">Your desired range</span>
          <span class="font-weight-medium">
            {{ formatPrice(vehicle.desired_price_min) }} –
            {{ formatPrice(vehicle.desired_price_max) }}
          </span>
        </div>

        <div
          v-if="vehicle.offer_amount"
          class="d-flex justify-space-between align-center mb-4"
        >
          <span class="text-body-2 text-medium-emphasis">Company's offer</span>
          <span class="text-h6 font-weight-bold text-primary">
            {{ formatPrice(vehicle.offer_amount) }}
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

  <!-- NEW: transfer details card goes here -->
  <v-card variant="outlined" rounded="lg" class="pa-4 mb-4">
    <div class="text-subtitle-2 font-weight-bold mb-2">Transfer the vehicle to:</div>
    <div class="d-flex justify-space-between align-center mb-1">
      <span class="text-body-2 text-medium-emphasis">Company name</span>
      <span class="text-body-2 font-weight-medium">
        AutoAccess Motors Ltd
        <v-btn icon="mdi-content-copy" size="x-small" variant="text" @click="copyText('AutoAccess Motors Ltd')" />
      </span>
    </div>
    <div class="d-flex justify-space-between align-center mb-1">
      <span class="text-body-2 text-medium-emphasis">KRA PIN</span>
      <span class="text-body-2 font-weight-medium">
        P051234567X
        <v-btn icon="mdi-content-copy" size="x-small" variant="text" @click="copyText('P051234567X')" />
      </span>
    </div>
    <div class="d-flex justify-space-between align-center">
      <span class="text-body-2 text-medium-emphasis">National ID (registered agent)</span>
      <span class="text-body-2 font-weight-medium">
        28471234
        <v-btn icon="mdi-content-copy" size="x-small" variant="text" @click="copyText('28471234')" />
      </span>
    </div>
    <p class="text-caption text-medium-emphasis mt-3">
      Log into the NTSA TIMS portal and transfer ownership to the details above.
      Once done, download the confirmation and upload it below.
    </p>
  </v-card>
  <!-- END NEW -->

  <v-text-field
    v-model="sellerName"
    label="Your full name"
    variant="outlined"
    density="compact"
    class="mb-2"
  />
  <v-text-field
    v-model="sellerEmail"
    label="Your email address"
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