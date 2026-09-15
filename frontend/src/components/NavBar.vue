<script setup>
import { useAuth } from '../services/Auth'
import { useRouter } from 'vue-router'

const { isAuthenticated, isAdmin, logout } = useAuth()
const router = useRouter()

function logOut() {
  logout()
  router.push('/')
}
</script>

<template>
  <v-app-bar color="white" elevation="1" height="72">
    <v-container class="d-flex align-center" fluid>
      <router-link to="/" class="d-flex align-center text-decoration-none mr-8">
        <v-avatar color="primary" size="36" class="mr-2">
          <v-icon icon="mdi-car" color="white" size="20"></v-icon>
        </v-avatar>
        <span class="text-h6 font-weight-bold text-black">AutoAccess</span>
      </router-link>

      <v-btn to="/" variant="text" class="text-body-2">Home</v-btn>

      <template v-if="!isAuthenticated">
        <v-btn to="/Login" variant="text" class="text-body-2">Login</v-btn>
        <v-btn to="/Signup" variant="text" class="text-body-2">Signup</v-btn>
      </template>

      <template v-else-if="!isAdmin">
        <v-btn to="/SubmitVehicle" variant="text" class="text-body-2">Submit Vehicle</v-btn>
        <v-btn to="/MySubmissions" variant="text" class="text-body-2">My Submissions</v-btn>
      </template>

      <template v-else>
        <v-btn to="/Admin" variant="text" class="text-body-2">Review Queue</v-btn>
        <v-btn to="/Transfers" variant="text" class="text-body-2">Transfers</v-btn>
      </template>

      <v-spacer></v-spacer>

      <v-btn v-if="isAuthenticated" to="/Profile" variant="text" class="text-body-2 mr-2">
        Profile
      </v-btn>
      <v-btn v-if="isAuthenticated" variant="text" class="text-body-2 mr-2" @click="logOut">
        Logout
      </v-btn>

      <v-btn
        v-if="!isAdmin"
        to="/SubmitVehicle"
        color="primary"
        rounded="pill"
        class="text-none px-6"
      >
        Get an Offer
      </v-btn>
    </v-container>
  </v-app-bar>
</template>