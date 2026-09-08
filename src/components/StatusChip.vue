<script setup>
defineProps({
  status: { type: String, required: true },
})

const config = {
  pending: { text: 'Pending Review', color: 'primary' },
  under_review: { text: 'Under Review', color: 'primary' },
  offer_made: { text: 'Offer Made', color: 'primary' },
  countered: { text: 'Countered', color: 'orange' },
  accepted: { text: 'Accepted', color: 'success' },
  transfer_submitted: { text: 'Transfer Submitted', color: 'blue-grey' },
  completed: { text: 'Completed', color: 'success' },
  rejected: { text: 'Rejected', color: 'error' },
}
</script>

<template>
  <v-chip
    :color="config[status]?.color || 'grey'"
    size="small"
    variant="outlined"
    label
  >
    <template #prepend>
      <v-icon icon="mdi-circle-small" size="18" />
    </template>
    {{ config[status]?.text || status }}
  </v-chip>
</template>