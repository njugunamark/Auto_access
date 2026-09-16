<script setup>
import { ref, computed, onMounted } from 'vue'
import { useVehicleStore } from '../stores/vehicles'
import StatusChip from './StatusChip.vue'

const vehicleStore = useVehicleStore()
const loading = ref(true)
const loadError = ref('')

const submissions = computed(() =>
  [...vehicleStore.vehicles].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  )
)

const selectedVehicle = ref(null)
const showDetail = ref(false)
const showDeleteConfirm = ref(false)

const STORAGE_BASE = 'http://127.0.0.1:8000/storage/'

function imageUrl(vehicle) {
  const path = vehicle.images?.[0]?.image_path
  return path ? STORAGE_BASE + path : null
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatPrice(vehicle) {
  const fmt = (n) => `KES ${Number(n).toLocaleString()}`
  if (vehicle.offer_amount) return fmt(vehicle.offer_amount)
  return `${fmt(vehicle.desired_price_min)} – ${fmt(vehicle.desired_price_max)}`
}

function openDetail(vehicle) {
  selectedVehicle.value = vehicle
  showDetail.value = true
}

async function confirmDelete() {
  await vehicleStore.deleteVehicle(selectedVehicle.value.id)
  showDeleteConfirm.value = false
  showDetail.value = false
  selectedVehicle.value = null
}

onMounted(async () => {
  loading.value = true
  const result = await vehicleStore.fetchMyVehicles()
  if (!result.success) {
    loadError.value = result.message
  }
  loading.value = false
})
</script>

<template>
  <v-container class="py-8" style="max-width: 1200px">
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">My submissions</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">
          Every vehicle you've sent for assessment, with its current status.
        </p>
      </div>
      <v-btn
        color="primary"
        rounded="pill"
        class="text-none px-6"
        prepend-icon="mdi-plus"
        to="/SubmitVehicle"
      >
        Submit vehicle
      </v-btn>
    </div>

    <v-alert v-if="loadError" type="error" variant="tonal" class="mb-6">
      {{ loadError }}
    </v-alert>

    <div v-if="loading" class="text-center py-10">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <v-row v-else-if="submissions.length">
      <v-col
        v-for="vehicle in submissions"
        :key="vehicle.id"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card
          class="submission-card"
          rounded="lg"
          elevation="1"
          @click="openDetail(vehicle)"
        >
          <v-img
            :src="imageUrl(vehicle)"
            height="180"
            cover
          />
          <v-card-text>
            <div class="text-subtitle-1 font-weight-bold text-black">
              {{ vehicle.make }} {{ vehicle.model }}
            </div>
            <div class="text-body-2 text-medium-emphasis mb-3">
              {{ vehicle.year }} · {{ vehicle.registration_number }}
            </div>

            <div class="d-flex justify-space-between align-center mb-2">
              <StatusChip :status="vehicle.status" />
              <span class="text-subtitle-2 font-weight-bold">
                {{ formatPrice(vehicle) }}
              </span>
            </div>

            <div class="text-caption text-medium-emphasis">
              Submitted {{ formatDate(vehicle.created_at) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-empty-state
      v-else
      icon="mdi-car-off"
      title="No submissions yet"
      text="Submit your first vehicle to get an offer."
    >
      <template #actions>
        <v-btn color="primary" to="/SubmitVehicle">Submit vehicle</v-btn>
      </template>
    </v-empty-state>

    <!-- Floating detail dialog -->
    <v-dialog v-model="showDetail" max-width="480">
      <v-card v-if="selectedVehicle" rounded="lg" class="pa-2">
        <v-img
          :src="imageUrl(selectedVehicle)"
          height="200"
          rounded="lg"
          cover
          class="mb-3"
        />
        <v-card-text>
          <div class="d-flex align-center flex-wrap mb-2" style="gap: 8px">
            <span class="text-h6 font-weight-bold">
              {{ selectedVehicle.make }} {{ selectedVehicle.model }}
            </span>
            <StatusChip :status="selectedVehicle.status" />
          </div>

          <div class="text-body-2 text-medium-emphasis mb-3">
            {{ selectedVehicle.year }} · {{ selectedVehicle.registration_number }} ·
            Submitted {{ formatDate(selectedVehicle.created_at) }}
          </div>

          <p v-if="selectedVehicle.description" class="text-body-2 mb-3">
            {{ selectedVehicle.description }}
          </p>

          <div class="d-flex justify-space-between text-body-2 mb-1">
            <span class="text-medium-emphasis">Your desired range</span>
            <span class="font-weight-medium">
              KES {{ Number(selectedVehicle.desired_price_min).toLocaleString() }} –
              KES {{ Number(selectedVehicle.desired_price_max).toLocaleString() }}
            </span>
          </div>

          <div
            v-if="selectedVehicle.offer_amount"
            class="d-flex justify-space-between text-body-2"
          >
            <span class="text-medium-emphasis">Company's offer</span>
            <span class="font-weight-bold text-primary">
              KES {{ Number(selectedVehicle.offer_amount).toLocaleString() }}
            </span>
          </div>
        </v-card-text>

        <v-card-actions class="justify-space-between px-4 pb-3">
          <v-btn
            variant="text"
            color="error"
            prepend-icon="mdi-delete-outline"
            @click="showDeleteConfirm = true"
          >
            Delete submission
          </v-btn>

          <div class="d-flex" style="gap: 8px">
            <v-btn
              v-if="['offer_made', 'accepted', 'transfer_submitted'].includes(selectedVehicle.status)"
              color="primary"
              variant="tonal"
              class="text-none"
              :to="`/VehicleDetail/${selectedVehicle.id}`"
            >
              Respond to Offer
            </v-btn>
            <v-btn variant="text" @click="showDetail = false">Close</v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete confirmation -->
    <v-dialog v-model="showDeleteConfirm" max-width="360">
      <v-card rounded="lg" class="pa-4">
        <v-card-title class="text-body-1 font-weight-bold">
          Delete this submission?
        </v-card-title>
        <v-card-text class="text-body-2 text-medium-emphasis">
          This can't be undone.
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="showDeleteConfirm = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.submission-card {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.submission-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08) !important;
}
</style>