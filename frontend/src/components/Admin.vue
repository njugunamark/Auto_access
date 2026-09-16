<script setup>
import { ref, computed, onMounted } from 'vue'
import { useVehicleStore } from '../stores/vehicles'
import StatusChip from './StatusChip.vue'

const vehicleStore = useVehicleStore()
const loading = ref(true)
const loadError = ref('')

// Vehicles still awaiting an initial offer
const queue = computed(() =>
  vehicleStore.pendingVehicles.filter(
    (v) => v.status === 'pending' || v.status === 'under_review'
  )
)

// Tracks the offer amount being typed per vehicle, keyed by vehicle id
const offerInputs = ref({})

const STORAGE_BASE = 'http://127.0.0.1:8000/storage/'

function imageUrl(vehicle) {
  const path = vehicle.images?.[0]?.image_path
  return path ? STORAGE_BASE + path : null
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

async function sendOffer(vehicleId) {
  const amount = offerInputs.value[vehicleId]
  if (!amount || Number(amount) <= 0) return
  await vehicleStore.makeOffer(vehicleId, Number(amount))
  offerInputs.value[vehicleId] = null
}

// reject even before it gets an offer
async function rejectVehicle(vehicleId) {
  await vehicleStore.declineVehicle(vehicleId)
}

onMounted(async () => {
  loading.value = true
  const result = await vehicleStore.fetchPendingVehicles()
  if (!result.success) {
    loadError.value = result.message
  }
  loading.value = false
})
</script>

<template>
  <v-container class="py-8" style="max-width: 1000px">
    <h1 class="text-h4 font-weight-bold mb-2">Review queue</h1>
    <p class="text-body-2 text-medium-emphasis mb-6">
      New vehicle submissions awaiting assessment. Review the details and
      send a fair offer, or decline if it doesn't meet criteria.
    </p>

    <v-alert v-if="loadError" type="error" variant="tonal" class="mb-6">
      {{ loadError }}
    </v-alert>

    <div v-if="loading" class="text-center py-10">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <template v-else>
      <v-card
        v-for="vehicle in queue"
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
            <div class="text-body-2 text-medium-emphasis mb-2">
              {{ vehicle.year }} · {{ vehicle.registration_number }} ·
              {{ vehicle.user?.name }} ({{ vehicle.user?.email }})
            </div>

            <p class="text-body-2 mb-3">{{ vehicle.description }}</p>

            <div class="text-body-2">
              Seller's desired range:
              <span class="font-weight-bold">
                {{ formatPrice(vehicle.desired_price_min) }} –
                {{ formatPrice(vehicle.desired_price_max) }}
              </span>
            </div>
            <div class="text-caption text-medium-emphasis">
              Submitted {{ formatDate(vehicle.created_at) }}
            </div>
          </v-col>

          <v-col
            cols="12"
            sm="3"
            class="d-flex flex-column justify-center mt-4 mt-sm-0"
            style="gap: 10px"
          >
            <v-text-field
              v-model="offerInputs[vehicle.id]"
              label="Offer amount (KES)"
              type="number"
              density="compact"
              variant="outlined"
              hide-details
            />
            <v-btn
              color="primary"
              rounded="pill"
              block
              prepend-icon="mdi-send"
              @click="sendOffer(vehicle.id)"
            >
              Send offer
            </v-btn>
            <v-btn
              variant="text"
              color="error"
              size="small"
              @click="rejectVehicle(vehicle.id)"
            >
              Decline vehicle
            </v-btn>
          </v-col>
        </v-row>
      </v-card>

      <v-empty-state
        v-if="!queue.length"
        icon="mdi-clipboard-check-outline"
        title="Queue is empty"
        text="New vehicle submissions will appear here for review."
      />
    </template>
  </v-container>
</template>