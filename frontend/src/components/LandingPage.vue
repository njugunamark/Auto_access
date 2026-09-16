<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../services/Auth'

const router = useRouter()
const { isAuthenticated, isAdmin } = useAuth()

function getStarted() {
  if (isAdmin.value) return // admins don't get an offer
  if (isAuthenticated.value) {
    router.push('/SubmitVehicle')
  } else {
    router.push('/Signup')
  }
}

const stats = [
  { value: '500+', label: 'Cars Assessed' },
  { value: 'KES 2M+', label: 'Paid Out' },
  { value: '4.8/5', label: 'Avg Rating' },
]

const whyChooseUs = [
  { icon: 'mdi-timer-outline', title: 'Fast Assessments', text: 'Most submissions get a valuation within 24 hours of upload.' },
  { icon: 'mdi-handshake-outline', title: 'Fair Pricing', text: 'Offers are based on real salvage and resale data, not guesswork.' },
  { icon: 'mdi-shield-check-outline', title: 'No Obligation', text: 'Accept, reject or counter. Nothing moves until you say yes.' },
]

const partners = [
  { name: 'NTSA Agents Ltd', logo: '/trustees/ntsa.png' },
  { name: 'Kenlite Insurance', logo: '/trustees/kenlite.png' },
  { name: 'Mombasa Salvage', logo: '/trustees/wrecked.png' },
  { name: 'Rift Valley Auto', logo: '/trustees/rift valley.png' },
  { name: 'Jubilee Motors', logo: '/trustees/jubillee.png' },
  { name: 'Sarit Auto', logo: '/trustees/sarit.png' },
]

const howItWorks = [
  { step: 1, icon: 'mdi-upload', title: 'Upload Photos', text: 'Snap your car from every angle and add condition notes and your price range.' },
  { step: 2, icon: 'mdi-camera-outline', title: 'We Assess It', text: 'Our team reviews the images and documents, then sends a written cash offer.' },
  { step: 3, icon: 'mdi-cash-multiple', title: 'Accept & Get Paid', text: 'Complete the NTSA transfer, upload proof, and we release payment.' },
]

const reviews = [
  { text: 'My Corolla sat in the compound for three years. Uploaded photos on Sunday, had an offer on Monday.', name: 'Achieng O., Kisumu', rating: 5 },
  { text: 'The offer was higher than the scrapyard quote and they handled the towing themselves.', name: 'Brian K., Eldoret', rating: 5 },
  { text: 'The transfer instructions were clear and payment landed the same day it was verified.', name: 'Wanjiru K., Nairobi', rating: 5 },
]

const faqs = [
  { q: 'How long does assessment take?', a: 'Most vehicles are assessed within 24 hours of a complete submission (photos, description, and ownership documents).' },
  { q: 'What condition of car do you accept?', a: 'We accept old, unused, damaged, or non-running vehicles. Submit photos and notes and we\'ll assess regardless of condition.' },
  { q: 'Do you tow it away?', a: 'Yes, once an offer is accepted and the NTSA transfer is verified, we arrange collection at no extra cost.' },
]
</script>

<template>
  <div class="bg-white">
    <!-- Hero -->
    <v-container fluid class="py-16" style="background: linear-gradient(180deg, #EAF1FB 0%, #F7FAFD 100%);">
      <v-container>
        <v-row align="center">
          <v-col cols="12" md="6">
            <v-chip color="primary" variant="tonal" size="small" class="mb-4" prepend-icon="mdi-shield-check-outline">
              NTSA-compliant transfers
            </v-chip>
            <h1 class="text-h2 font-weight-bold mb-4" style="line-height: 1.1; color: #0F1B2D;">
              Turn Your Old Car Into Cash
            </h1>
            <p class="text-body-1 text-medium-emphasis mb-5" style="max-width: 480px;">
              Upload a few photos of your old, unused or knocked-out car and get a fair cash valuation from our assessment team , No dealership visits, no haggling on the roadside.
            </p>
            <v-btn
              v-if="!isAdmin"
              color="primary"
              size="large"
              rounded="lg"
              class="text-none px-6"
              @click="getStarted"
            >
              Get an Offer Now
            </v-btn>
          </v-col>
          <v-col cols="12" md="6">
            <v-img
              src="beetle.jpg"
              rounded="lg"
              cover
              height="420"
            ></v-img>
          </v-col>
        </v-row>
      </v-container>
    </v-container>

    <!-- Stats -->
    <v-container>
      <v-row class="text-center py-10">
        <v-col v-for="(stat, i) in stats" :key="i" cols="12" sm="4" :class="i < 2 ? 'border-e' : ''">
          <div class="text-h4 font-weight-bold text-primary">{{ stat.value }}</div>
          <div class="text-body-2 text-maximum-emphasis">{{ stat.label }}</div>
        </v-col>
      </v-row>
    </v-container>

    <!-- Why Choose Us -->
    <v-container class="py-10">
      <h2 class="text-h4 font-weight-bold text-center mb-10">Why Choose Us</h2>
      <v-row>
        <v-col v-for="(item, i) in whyChooseUs" :key="i" cols="12" md="4">
          <v-card rounded="lg" class="pa-6 h-100 border border-grey-lighten-5"  hover>
            <v-avatar color="blue-lighten-4" size="48" class="mb-4">
              <v-icon :icon="item.icon" color="primary"></v-icon>
            </v-avatar>
            <div class="text-h6 font-weight-bold mb-2">{{ item.title }}</div>
            <div class="text-body-2 text-medium-emphasis">{{ item.text }}</div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

   <!-- Trusted By -->
<v-container fluid class="py-10 bg-grey-lighten-3 mt-10 mb-10">
  <h3 class="text-overline text-center text-maximum-emphasis mb-6">Trusted By</h3>
  <div class="partner-wrapper ">
    <div class="partner-track">
      <div v-for="(partner, i) in [...partners, ...partners,...partners]" :key="i" class="partner-item">
        <v-avatar :image="partner.logo" size="56" class="mb-5"></v-avatar>
        <div class="text-caption text-maximum-emphasis">{{ partner.name }}</div>
      </div>
    </div>
  </div>
</v-container>

    <!-- How It Works -->
    <v-container class="py-10">
      <h2 class="text-h4 font-weight-bold text-center mb-10">How It Works</h2>
      <v-row>
        <v-col v-for="item in howItWorks" :key="item.step" cols="12" md="4">
          <v-card  rounded="lg" class="pa-6 h-100">
            <div class="d-flex align-center mb-4">
              <v-avatar color="primary" size="32" class="mr-2">
                <span class="text-white text-body-2 font-weight-bold">{{ item.step }}</span>
              </v-avatar>
              <v-icon :icon="item.icon" color="primary"></v-icon>
            </div>
            <div class="text-h6 font-weight-bold mb-2">{{ item.title }}</div>
            <div class="text-body-2 text-maximum-emphasis">{{ item.text }}</div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

  <!-- Reviews -->
<v-container fluid class="py-10 bg-primary" height="600px">
  <v-container>
    <h2 class="text-h4 font-weight-bold text-center mb-10 text-white">What Sellers Say</h2>
    <v-row>
      <v-col v-for="(review, i) in reviews" :key="i" cols="12" md="4">
        <v-card rounded="lg" class="pa-6 h-100"height="250px" style="background: rgba(255,255,255,0.4);">
          <v-rating :model-value="review.rating" readonly color="amber" density="compact" size="small"></v-rating>
          <p class="text-body-2 my-4" style="min-height: 72px;">"{{ review.text }}"</p>
          <div class="text-body-2 font-weight-medium">{{ review.name }}</div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</v-container>

    <!-- FAQ -->
    <v-container class="py-10" style="max-width: 800px;">
      <h2 class="text-h4 font-weight-bold text-center mb-10">Frequently Asked Questions</h2>
      <v-expansion-panels variant="accordion">
        <v-expansion-panel v-for="(faq, i) in faqs" :key="i" :title="faq.q" :text="faq.a" :text-bold="faq.a"></v-expansion-panel>
      </v-expansion-panels>
    </v-container>

    <!-- Final CTA -->
    <v-container fluid class="py-16 text-center bg-primary">
      <h2 class="text-h4 font-weight-bold text-white mb-3">Ready to find out what it's worth?</h2>
      <p class="text-body-1 mb-6" style="color: rgba(255,255,255,0.85);">
        One submission, one valuation, one payout. No listings, no buyers to chase.
      </p>
      <v-btn
        v-if="!isAdmin"
        color="white"
        size="large"
        rounded="lg"
        class="text-none px-8"
        @click="getStarted"
      >
        Get Started
      </v-btn>
    </v-container>

    <!-- Footer -->
    <v-container class="py-6 d-flex justify-space-between flex-wrap text-body-2 text-medium-emphasis">
      <div class="font-weight-bold text-black">AutoAccess</div>
      <div>Nairobi, Kenya · NTSA-compliant transfers</div>
      <div>© 2026 AutoAccess Ltd.</div>
    </v-container>
  </div>
</template>

<style scoped>
.partner-wrapper {
  overflow: hidden;
  mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
}
.partner-track {
  display: flex;
  gap: 48px;
  width: max-content;
  animation: scroll-horizontal 20s linear infinite;
}
.partner-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}
@keyframes scroll-horizontal {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
</style>