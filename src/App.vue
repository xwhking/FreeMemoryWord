<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import MainLayout from "./Layout/Layout.vue";

const route = ref('')
const enterAction = ref({})

onMounted(() => {
  window.utools.onPluginEnter((action) => {
    route.value = action.code
    enterAction.value = action
  })
  window.utools.onPluginOut((isKill) => {
    route.value = ''
  })
})
</script>

<template>
  <MainLayout></MainLayout>
</template>
