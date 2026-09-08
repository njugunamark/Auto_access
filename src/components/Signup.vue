<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../services/Auth'

const { signup } = useAuth()
const router = useRouter()

const form = ref(null)
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phoneNumber = ref('')
const location = ref('')
const address = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errorMessage = ref('')
const loading = ref(false)

const locations = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Nyeri', 'Thika']

const requiredRule = [v => !!v || 'This field is required']

const emailRules = [
  v => !!v || 'Email is required',
  v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email address',
]

const phoneRules = [
  v => !!v || 'Phone number is required',
  v => /^\+?\d{9,13}$/.test(v.replace(/\s/g, '')) || 'Enter a valid phone number',
]

const passwordRules = [
  v => !!v || 'Password is required',
  v => v.length >= 8 || 'Password must be at least 8 characters',
]

const confirmPasswordRules = [
  v => !!v || 'Please confirm your password',
  v => v === password.value || 'Passwords do not match',
]

async function handleSignup() {
  errorMessage.value = ''

  const { valid } = await form.value.validate()
  if (!valid) return

  loading.value = true

  const result = await signup({
    firstname: firstName.value,
    lastname: lastName.value,
    fullName: `${firstName.value} ${lastName.value}`,
    email: email.value,
    phoneNumber: phoneNumber.value,
    location: location.value,
    address: address.value,
    password: password.value,
  })

  loading.value = false

  if (result.success) {
    router.push('/')
  } else {
    errorMessage.value = result.message || 'Something went wrong. Please try again.'
  }
}
</script>

<template>
  <v-container fluid class="fill-height d-flex align-center justify-center py-10" style="background: linear-gradient(180deg, #EAF1FB 0%, #F7FAFD 100%); min-height: 100vh;">
    <v-col cols="12" sm="10" md="7" lg="6">

      <div class="d-flex align-center justify-center mb-8">
        <v-avatar color="primary" size="36" class="mr-2">
          <v-icon icon="mdi-car" color="white" size="20"></v-icon>
        </v-avatar>
        <span class="text-h6 font-weight-bold">AutoAccess</span>
      </div>

      <v-card rounded="lg" elevation="2" class="pa-8">
        <h2 class="text-h5 font-weight-bold mb-1">Create your account</h2>
        <p class="text-body-2 text-medium-emphasis mb-6">It takes a minute and costs nothing.</p>

        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          density="comfortable"
          rounded="lg"
          class="mb-6"
          icon="mdi-alert-circle-outline"
        >
          {{ errorMessage }}
        </v-alert>

        <v-form ref="form" @submit.prevent="handleSignup">
          <v-row>
            <v-col cols="12" sm="6">
              <label class="text-body-2 font-weight-medium mb-1 d-block">First name</label>
              <v-text-field
                v-model="firstName"
                :rules="requiredRule"
                placeholder="Mark"
                variant="outlined"
                density="comfortable"
                rounded="lg"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <label class="text-body-2 font-weight-medium mb-1 d-block">Last name</label>
              <v-text-field
                v-model="lastName"
                :rules="requiredRule"
                placeholder="Njuguna"
                variant="outlined"
                density="comfortable"
                rounded="lg"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <label class="text-body-2 font-weight-medium mb-1 d-block">Email</label>
              <v-text-field
                v-model="email"
                :rules="emailRules"
                type="email"
                placeholder="you@example.com"
                variant="outlined"
                density="comfortable"
                rounded="lg"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <label class="text-body-2 font-weight-medium mb-1 d-block">Phone number</label>
              <v-text-field
                v-model="phoneNumber"
                :rules="phoneRules"
                placeholder="+254 755882196"
                variant="outlined"
                density="comfortable"
                rounded="lg"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <label class="text-body-2 font-weight-medium mb-1 d-block">Location</label>
              <v-select
                v-model="location"
                :items="locations"
                :rules="requiredRule"
                placeholder="Select your town/city"
                variant="outlined"
                density="comfortable"
                rounded="lg"
              ></v-select>
            </v-col>

            <v-col cols="12" sm="6">
              <label class="text-body-2 font-weight-medium mb-1 d-block">Address</label>
              <v-text-field
                v-model="address"
                :rules="requiredRule"
                placeholder="Street, building, area"
                variant="outlined"
                density="comfortable"
                rounded="lg"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <label class="text-body-2 font-weight-medium mb-1 d-block">Password</label>
              <v-text-field
                v-model="password"
                :rules="passwordRules"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                placeholder="At least 8 characters"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                @click:append-inner="showPassword = !showPassword"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <label class="text-body-2 font-weight-medium mb-1 d-block">Confirm password</label>
              <v-text-field
                v-model="confirmPassword"
                :rules="confirmPasswordRules"
                :type="showConfirmPassword ? 'text' : 'password'"
                :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                placeholder="Re-enter password"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                @click:append-inner="showConfirmPassword = !showConfirmPassword"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-btn
            type="submit"
            color="primary"
            block
            size="large"
            rounded="lg"
            class="text-none mt-4"
            :loading="loading"
          >
            Create account
          </v-btn>
        </v-form>

        <p class="text-center text-body-2 text-medium-emphasis mt-6">
          Already have an account?
          <router-link to="/login" class="text-primary font-weight-medium text-decoration-none">Log in</router-link>
        </p>
      </v-card>

    </v-col>
  </v-container>
</template>