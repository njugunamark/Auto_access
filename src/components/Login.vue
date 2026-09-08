<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../services/Auth'

const router = useRouter()
const { checkCredentials } = useAuth()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

async function handleLogin() {
  errorMessage.value = ''
  loading.value = true

  const result = await checkCredentials({ email: email.value, password: password.value })

  loading.value = false

  if (result.success) {
    router.push('/')
  } else {
    errorMessage.value = 'Invalid email or password. Please try again.'
  }
}
</script>

<template>
  <v-container fluid class="fill-height d-flex align-center justify-center" style="background: linear-gradient(180deg, #EAF1FB 0%, #F7FAFD 100%); min-height: 100vh;">
    <div style="width: 100%; max-width: 460px;">

      <!-- Logo header -->
      <div class="d-flex align-center justify-center mb-6">
        <v-avatar color="primary" size="40" class="mr-2">
          <v-icon icon="mdi-car" color="white" size="22"></v-icon>
        </v-avatar>
        <span class="text-h6 font-weight-bold text-black">AutoAccess</span>
      </div>

      <!-- Card -->
      <v-card rounded="lg" elevation="2" class="pa-8">
        <h2 class="text-h5 font-weight-bold mb-1">Welcome back</h2>
        <p class="text-body-2 text-medium-emphasis mb-6">Log in to view your submissions and offers.</p>

        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          density="compact"
          rounded="lg"
          class="mb-6"
        >
          {{ errorMessage }}
        </v-alert>

        <v-form @submit.prevent="handleLogin">
          <div class="mb-4">
            <label class="text-body-2 font-weight-medium d-block mb-1">Email</label>
            <v-text-field
              v-model="email"
              type="email"
              placeholder="you@example.com"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              hide-details
              required
            ></v-text-field>
          </div>

          <div class="mb-2">
            <div class="d-flex justify-space-between align-center mb-1">
              <label class="text-body-2 font-weight-medium">Password</label>
              <router-link to="/forgot-password" class="text-body-2 text-primary text-decoration-none">
                Forgot password?
              </router-link>
            </div>
            <v-text-field
              v-model="password"
              type="password"
              placeholder="••••••••"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              hide-details
              required
            ></v-text-field>
          </div>

          <v-btn
            type="submit"
            color="primary"
            size="large"
            rounded="lg"
            block
            class="text-none mt-6"
            :loading="loading"
          >
            Log in
          </v-btn>
        </v-form>

        <p class="text-center text-body-2 text-medium-emphasis mt-6">
          Don't have an account?
          <router-link to="/signup" class="text-primary font-weight-medium text-decoration-none">Sign up</router-link>
        </p>
      </v-card>
    </div>
  </v-container>
</template>