<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useVehicleStore } from '../stores/vehicles'

const router = useRouter()
const vehicleStore = useVehicleStore()
const form = ref(null)

// Vehicle details
const make = ref('')
const model = ref('')
const year = ref('')
const registrationNumber = ref('')
const conditionNotes = ref('')
const description = ref('')

// Price range
const minPrice = ref('')
const maxPrice = ref('')

// Photos
const photos = ref([]) // array of { file, previewUrl }
const fileInput = ref(null)

// Camera
const showCamera = ref(false)
const videoRef = ref(null)
const canvasRef = ref(null)
let mediaStream = null

// Ownership proof
const nationalId = ref('')
const logbookFile = ref(null)
const logbookInput = ref(null)

const loading = ref(false)
const errorMessage = ref('')
const showSuccess = ref(false)
const showError = ref(false)

const years = Array.from({ length: 35 }, (_, i) => `${2026 - i}`)

const requiredRule = [v => !!v || 'This field is required']
const priceRules = [
  v => !!v || 'Required',
  v => /^\d+$/.test(v) || 'Numbers only',
]
const idRules = [
  v => !!v || 'National ID number is required',
  v => /^\d{6,10}$/.test(v) || 'Enter a valid ID number',
]

// --- Photo upload handlers ---
function browseFiles() {
  fileInput.value.click()
}

function handleFileChange(e) {
  addPhotos(Array.from(e.target.files))
  e.target.value = '' // allow re-selecting the same file
}

function handleDrop(e) {
  e.preventDefault()
  addPhotos(Array.from(e.dataTransfer.files))
}

function addPhotos(files) {
  files.forEach(file => {
    if (!file.type.startsWith('image/')) return
    photos.value.push({ file, previewUrl: URL.createObjectURL(file) })
  })
}

function removePhoto(index) {
  URL.revokeObjectURL(photos.value[index].previewUrl)
  photos.value.splice(index, 1)
}

// --- Camera capture ---
async function openCamera() {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
    showCamera.value = true
    await new Promise(resolve => setTimeout(resolve, 100)) // wait for video element to render
    if (videoRef.value) videoRef.value.srcObject = mediaStream
  } catch (err) {
    errorMessage.value = 'Could not access camera. Please check permissions.'
    showError.value = true
  }
}

function capturePhoto() {
  const video = videoRef.value
  const canvas = canvasRef.value
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  canvas.getContext('2d').drawImage(video, 0, 0)

  canvas.toBlob(blob => {
    const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' })
    photos.value.push({ file, previewUrl: URL.createObjectURL(file) })
  }, 'image/jpeg')

  closeCamera()
}

function closeCamera() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }
  showCamera.value = false
}

// --- Logbook upload ---
function browseLogbook() {
  logbookInput.value.click()
}

function handleLogbookChange(e) {
  const file = e.target.files[0]
  if (file) logbookFile.value = file
}

const logbookFileName = computed(() => logbookFile.value ? logbookFile.value.name : 'No file chosen')

// --- Submit ---
async function handleSubmit() {
  errorMessage.value = ''

  const { valid } = await form.value.validate()
  if (!valid) return

  if (photos.value.length < 4) {
    errorMessage.value = 'Please upload at least four photos.'
    showError.value = true
    return
  }

  if (!logbookFile.value) {
    errorMessage.value = 'Please upload a logbook photo for ownership verification.'
    showError.value = true
    return
  }

  loading.value = true

  const result = await vehicleStore.submitVehicle({
    make: make.value,
    model: model.value,
    year: year.value,
    registrationNumber: registrationNumber.value,
    conditionNotes: conditionNotes.value,
    description: description.value,
    desiredPriceMin: Number(minPrice.value),
    desiredPriceMax: Number(maxPrice.value),
    nationalId: nationalId.value,
    logbookFile: logbookFile.value,
    photos: photos.value.map(p => p.file),
  })

  loading.value = false

  if (result.success) {
    showSuccess.value = true
    setTimeout(() => {
      router.push('/MySubmissions')
    }, 1800)
  } else {
    errorMessage.value = result.message || 'Something went wrong. Please try again.'
    showError.value = true
  }
}

function saveDraft() {
  // TODO: persist draft to local storage or store
  router.push('/MySubmissions')
}
</script>

<template>
  <v-container fluid class="py-10 bg-grey-lighten-5" style="min-height: 100vh;">
    <v-container style="max-width: 1200px;">

      <h1 class="text-h4 font-weight-bold mb-2">Submit a vehicle</h1>
      <p class="text-body-1 text-medium-emphasis mb-8">
        Tell us about the car and upload clear photos. Our team reviews every submission within 24 hours.
      </p>

      <v-row>
        <!-- Main column -->
        <v-col cols="12" md="8">
          <v-form ref="form" @submit.prevent="handleSubmit">

            <!-- Vehicle details -->
            <v-card variant="outlined" rounded="lg" class="pa-6 mb-6">
              <h2 class="text-h6 font-weight-bold mb-1">Vehicle details</h2>
              <p class="text-body-2 text-medium-emphasis mb-4">The basics about the car.</p>

              <v-row>
                <v-col cols="12" sm="6">
                  <label class="text-body-2 font-weight-medium mb-1 d-block">Make</label>
                  <v-text-field v-model="make" :rules="requiredRule" placeholder="Toyota" variant="outlined" density="comfortable" rounded="lg"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <label class="text-body-2 font-weight-medium mb-1 d-block">Model</label>
                  <v-text-field v-model="model" :rules="requiredRule" placeholder="Corolla NZE" variant="outlined" density="comfortable" rounded="lg"></v-text-field>
                </v-col>

                <v-col cols="12" sm="6">
                  <label class="text-body-2 font-weight-medium mb-1 d-block">Year</label>
                  <v-select v-model="year" :items="years" :rules="requiredRule" placeholder="Select year" variant="outlined" density="comfortable" rounded="lg"></v-select>
                </v-col>
                <v-col cols="12" sm="6">
                  <label class="text-body-2 font-weight-medium mb-1 d-block">Registration number</label>
                  <v-text-field v-model="registrationNumber" :rules="requiredRule" placeholder="KBX 123A" variant="outlined" density="comfortable" rounded="lg"></v-text-field>
                </v-col>

                <v-col cols="12">
                  <label class="text-body-2 font-weight-medium mb-1 d-block">Condition notes</label>
                  <v-textarea v-model="conditionNotes" :rules="requiredRule" placeholder="Dents, rust, non-running parts, missing components..." variant="outlined" rounded="lg" rows="3"></v-textarea>
                </v-col>

                <v-col cols="12">
                  <label class="text-body-2 font-weight-medium mb-1 d-block">Description</label>
                  <v-textarea v-model="description" :rules="requiredRule" placeholder="How long has it been parked? Any history we should know about?" variant="outlined" rounded="lg" rows="3"></v-textarea>
                </v-col>
              </v-row>
            </v-card>

            <!-- Price range -->
            <v-card variant="outlined" rounded="lg" class="pa-6 mb-6">
              <h2 class="text-h6 font-weight-bold mb-1">Desired price range</h2>
              <p class="text-body-2 text-medium-emphasis mb-4">Give us a range in Kenyan shillings. This guides our offer but doesn't bind you.</p>

              <v-row>
                <v-col cols="12" sm="6">
                  <label class="text-body-2 font-weight-medium mb-1 d-block">Minimum (KES)</label>
                  <v-text-field v-model="minPrice" :rules="priceRules" placeholder="180,000" variant="outlined" density="comfortable" rounded="lg"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <label class="text-body-2 font-weight-medium mb-1 d-block">Maximum (KES)</label>
                  <v-text-field v-model="maxPrice" :rules="priceRules" placeholder="260,000" variant="outlined" density="comfortable" rounded="lg"></v-text-field>
                </v-col>
              </v-row>
            </v-card>

            <!-- Photos -->
            <v-card variant="outlined" rounded="lg" class="pa-6 mb-6">
              <h2 class="text-h6 font-weight-bold mb-1">Photos</h2>
              <p class="text-body-2 text-medium-emphasis mb-4">At least four photos: front, rear, both sides, interior and any damage.</p>

              <div
                class="upload-dropzone pa-8 text-center mb-4"
                @dragover.prevent
                @drop="handleDrop"
              >
                <v-avatar color="blue-lighten-5" size="48" class="mb-3">
                  <v-icon icon="mdi-cloud-upload-outline" color="primary"></v-icon>
                </v-avatar>
                <div class="text-body-1 font-weight-medium mb-1">Drag and drop images here</div>
                <div class="text-body-2 text-medium-emphasis mb-4">JPG or PNG, up to 10 MB each</div>

                <div class="d-flex justify-center ga-3 flex-wrap">
                  <v-btn variant="outlined" rounded="pill" prepend-icon="mdi-image-plus-outline" class="text-none" @click="browseFiles">
                    Browse files
                  </v-btn>
                  <v-btn variant="outlined" rounded="pill" prepend-icon="mdi-camera-outline" class="text-none" @click="openCamera">
                    Use camera
                  </v-btn>
                </div>

                <input ref="fileInput" type="file" accept="image/*" multiple class="d-none" @change="handleFileChange" />
              </div>

              <div v-if="photos.length" class="d-flex flex-wrap ga-3">
                <div v-for="(photo, i) in photos" :key="i" class="photo-thumb">
                  <v-img :src="photo.previewUrl" cover rounded="lg" height="100" width="100"></v-img>
                  <v-btn icon="mdi-close" size="x-small" color="white" class="photo-remove-btn" @click="removePhoto(i)"></v-btn>
                </div>
              </div>
            </v-card>

            <!-- Ownership proof -->
            <v-card variant="outlined" rounded="lg" class="pa-6 mb-6">
              <h2 class="text-h6 font-weight-bold mb-1">Ownership proof</h2>
              <p class="text-body-2 text-medium-emphasis mb-4">We can only make an offer on vehicles with verifiable ownership.</p>

              <v-row>
                <v-col cols="12" sm="6">
                  <label class="text-body-2 font-weight-medium mb-1 d-block">National ID number</label>
                  <v-text-field
                    v-model="nationalId"
                    :rules="idRules"
                    placeholder="28471234"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    prepend-inner-icon="mdi-card-account-details-outline"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <label class="text-body-2 font-weight-medium mb-1 d-block">Logbook photo</label>
                  <div class="d-flex align-center logbook-field pa-2">
                    <v-icon icon="mdi-file-document-outline" class="mx-2" color="grey"></v-icon>
                    <span class="text-body-2 text-medium-emphasis flex-grow-1">{{ logbookFileName }}</span>
                    <v-btn variant="outlined" rounded="pill" size="small" class="text-none" @click="browseLogbook">Upload</v-btn>
                  </div>
                  <input ref="logbookInput" type="file" accept="image/*,.pdf" class="d-none" @change="handleLogbookChange" />
                </v-col>
              </v-row>
            </v-card>

            <div class="d-flex align-center ga-6">
              <v-btn type="submit" color="primary" size="large" rounded="lg" class="text-none px-6" :loading="loading">
                Submit for assessment
              </v-btn>
              <v-btn variant="text" class="text-none" @click="saveDraft">Save as draft</v-btn>
            </div>

          </v-form>
        </v-col>

        <!-- Sidebar -->
        <v-col cols="12" md="4">
          <div style="position: sticky; top: 90px;">
            <v-card color="blue-lighten-5" rounded="lg" class="pa-6 mb-6">
              <h3 class="text-subtitle-1 font-weight-bold mb-3">Photo tips</h3>
              <ul class="text-body-2 text-medium-emphasis pl-4" style="line-height: 2;">
                <li>Shoot in daylight, avoid shadows</li>
                <li>Include the dashboard and odometer</li>
                <li>Photograph every dent and rust patch</li>
                <li>Capture the logbook flat and in focus</li>
              </ul>
            </v-card>

            <v-card variant="outlined" rounded="lg" class="pa-6">
              <h3 class="text-subtitle-1 font-weight-bold mb-3">What happens next</h3>
              <p class="text-body-2 text-medium-emphasis">
                Your submission enters the review queue. You'll see the status change from Pending Review to Offer Made on the My Submissions page.
              </p>
            </v-card>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- Camera modal -->
    <v-dialog v-model="showCamera" max-width="600" @update:model-value="val => !val && closeCamera()">
      <v-card rounded="lg" class="pa-4">
        <video ref="videoRef" autoplay playsinline style="width: 100%; border-radius: 8px;"></video>
        <canvas ref="canvasRef" class="d-none"></canvas>
        <div class="d-flex justify-center ga-4 mt-4">
          <v-btn color="primary" rounded="pill" class="text-none" @click="capturePhoto">Capture</v-btn>
          <v-btn variant="outlined" rounded="pill" class="text-none" @click="closeCamera">Cancel</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Success confirmation -->
    <v-snackbar
      v-model="showSuccess"
      color="success"
      location="top"
      :timeout="1800"
    >
      <div class="d-flex align-center" style="gap: 8px">
        <v-icon icon="mdi-check-circle" />
        <span>Submitted successfully! Please wait for review by our team.</span>
      </div>
    </v-snackbar>

    <!-- Error notification -->
    <v-snackbar
      v-model="showError"
      color="error"
      location="top"
      :timeout="4000"
    >
      <div class="d-flex align-center" style="gap: 8px">
        <v-icon icon="mdi-alert-circle" />
        <span>{{ errorMessage }}</span>
      </div>
    </v-snackbar>
  </v-container>
</template>

<style scoped>
.upload-dropzone {
  border: 2px dashed #C5D3E0;
  border-radius: 12px;
  background: #FAFBFC;
}
.photo-thumb {
  position: relative;
}
.photo-remove-btn {
  position: absolute;
  top: -6px;
  right: -6px;
  background: rgba(0,0,0,0.6) !important;
}
.logbook-field {
  border: 1px solid #C5D3E0;
  border-radius: 8px;
}
</style>