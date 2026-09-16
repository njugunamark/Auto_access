import { createRouter, createWebHistory } from 'vue-router'
import Admin from '@/components/Admin.vue'
import ImageUploader from '@/components/ImageUploader.vue'
import LandingPage from '@/components/LandingPage.vue'
import Login from '@/components/Login.vue'
import MySubmissions from '@/components/MySubmissions.vue'
import OfferForm from '@/components/OfferForm.vue'
import Profile from '@/components/Profile.vue'
import Signup from '@/components/Signup.vue'
import StatusChip from '@/components/StatusChip.vue'
import SubmitVehicle from '@/components/SubmitVehicle.vue'
import VehicleDetail from '@/components/VehicleDetail.vue'
import VehicleCard from '@/components/VehicleCard.vue'
import { components } from 'vuetify/dist/vuetify.js'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
       {
    path: `/`,
     component: LandingPage
  },
  {
    path: `/Admin`,
     component: Admin
  },
    {
      path: `/ImageUploader`,
      component: ImageUploader
    },
    {
    path: `/Login`,
     component: Login
  },
    {
    path: `/MySubmissions`,
     component: MySubmissions
  },
    {
    path: `/Profile`,
     component: Profile
  },
    {
    path: `/Signup`,
     component: Signup
  },
    {
    path: `/StatusChip`,
     component: StatusChip
  },
    {
    path: `/SubmitVehicle`,
     component: SubmitVehicle
  },
    {
  path: `/VehicleDetail/:id`,
  component: VehicleDetail
  },
    {
    path: `/VehicleCard`,
     component: VehicleCard
  },
    {
    path: `/OfferForm`,
     component: OfferForm
  },
    { path: '/Transfers',
       component: () => import('../components/Transfers.vue')
    },

    
  ],
})

export default router
