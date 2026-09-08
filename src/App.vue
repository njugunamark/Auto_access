<script setup>
import { RouterView } from 'vue-router';
import NaVBar from './components/NavBar.vue';
</script>

<template>
  <v-app>
   <NaVBar/>
    <v-main>
     <RouterView/> 
    </v-main>
  </v-app>
 
</template>

<style scoped></style>
