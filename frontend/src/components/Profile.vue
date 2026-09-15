<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../services/Auth'

const router = useRouter()
const { isAdmin, logout } = useAuth()

const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

const initials = computed(() => {
  if (!user.value?.name) return '?'
  return user.value.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const maskedPhone = computed(() => {
  const phone = user.value?.phone
  if (!phone) return null
  return phone.replace(/(\+\d{3}\s?\d{1})\d+(\d{3})$/, '$1●●●●●●$2')
})

const memberSince = computed(() => {
  if (!user.value?.joinedAt) return ''
  return new Date(user.value.joinedAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
})

// --- Profile picture upload ---
const fileInput = ref(null)

function triggerFileSelect() {
  fileInput.value.click()
}

function onPhotoSelected(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    // Save as a base64 data URL so it survives a page refresh via localStorage
    user.value.photoUrl = reader.result
    localStorage.setItem('user', JSON.stringify(user.value))
  }
  reader.readAsDataURL(file)
}

function logOut() {
  logout()
  router.push('/')
}
</script>

<template>
  <v-container class="py-8" style="max-width: 900px">
    <h1 class="text-h4 font-weight-bold mb-1">Profile</h1>
    <p class="text-body-2 text-medium-emphasis mb-6">
      Your account details and role permissions.
    </p>

    <template v-if="user">
      <v-row>
        <v-col cols="12" md="8">
          <v-card rounded="lg" elevation="1" class="pa-6">
            <div class="d-flex align-center mb-4" style="gap: 16px">
              <div class="position-relative">
                <v-avatar color="blue-lighten-4" size="56">
                  <v-img v-if="user.photoUrl" :src="user.photoUrl" cover />
                  <span v-else class="text-subtitle-1 font-weight-bold text-primary">
                    {{ initials }}
                  </span>
                </v-avatar>
                <v-btn
                  icon="mdi-camera"
                  size="x-small"
                  color="primary"
                  style="position: absolute; bottom: -4px; right: -4px"
                  @click="triggerFileSelect"
                />
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  class="d-none"
                  @change="onPhotoSelected"
                />
              </div>
              <div>
                <div class="text-h6 font-weight-bold">{{ user.name }}</div>
                <v-chip
                  :color="isAdmin ? 'primary' : 'blue'"
                  size="small"
                  variant="flat"
                  class="mt-1"
                  prepend-icon="mdi-account"
                >
                  {{ isAdmin ? 'Admin' : 'Seller' }}
                </v-chip>
              </div>
            </div>

            <v-divider class="mb-2" />

            <div class="d-flex justify-space-between align-center py-3" style="border-bottom: 1px solid #eee">
              <span class="text-body-2 text-medium-emphasis">
                <v-icon icon="mdi-email-outline" size="18" class="mr-1" />
                Email
              </span>
              <span class="text-body-2 font-weight-medium">{{ user.email }}</span>
            </div>

            <div class="d-flex justify-space-between align-center py-3" style="border-bottom: 1px solid #eee">
              <span class="text-body-2 text-medium-emphasis">Member since</span>
              <span class="text-body-2 font-weight-medium">{{ memberSince }}</span>
            </div>

            <div
              v-if="maskedPhone"
              class="d-flex justify-space-between align-center py-3"
              style="border-bottom: 1px solid #eee"
            >
              <span class="text-body-2 text-medium-emphasis">Phone</span>
              <span class="text-body-2 font-weight-medium">{{ maskedPhone }}</span>
            </div>

            <div class="d-flex mt-4" style="gap: 12px">
              <v-btn variant="outlined" rounded="pill">Edit details</v-btn>
              <v-btn variant="text">Change password</v-btn>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card rounded="lg" elevation="1" color="blue-lighten-5" class="pa-5">
            <div class="text-subtitle-1 font-weight-bold mb-3">
              {{ isAdmin ? 'Admin shortcuts' : 'Seller shortcuts' }}
            </div>

            <template v-if="!isAdmin">
              <v-btn color="primary" block rounded="pill" class="mb-3 justify-space-between" to="/MySubmissions" append-icon="mdi-arrow-right">
                My submissions
              </v-btn>
              <v-btn variant="flat" color="white" block rounded="pill" class="justify-space-between" to="/SubmitVehicle" append-icon="mdi-arrow-right">
                Submit a vehicle
              </v-btn>
            </template>

            <template v-else>
              <v-btn color="primary" block rounded="pill" class="mb-3 justify-space-between" to="/Admin" append-icon="mdi-arrow-right">
                Review queue
              </v-btn>
              <v-btn variant="flat" color="white" block rounded="pill" class="justify-space-between" to="/Transfers" append-icon="mdi-arrow-right">
                Transfers
              </v-btn>
            </template>
          </v-card>

          <v-btn variant="outlined" color="error" block rounded="pill" class="mt-4" @click="logOut">
            Logout
          </v-btn>
        </v-col>
      </v-row>
    </template>

    <v-empty-state
      v-else
      icon="mdi-account-off"
      title="Not signed in"
      text="Log in to view your profile."
    >
      <template #actions>
        <v-btn color="primary" to="/Login">Go to Login</v-btn>
      </template>
    </v-empty-state>
  </v-container>
</template>