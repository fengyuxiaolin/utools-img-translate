<script setup>
import { shallowRef, onMounted } from 'vue';
import TranslatePage from './components/TranslatePage.vue'

const page = shallowRef('');

onMounted(() => {
  let interval = setInterval(() => {
    if (window.utools) {
      clearInterval(interval);
      page.value = TranslatePage;
    }
  }, 100);
});
function changePage (newPage) {
  page.value = newPage;
}
</script>

<template>
  <component v-if="page" :is="page" @changePage='changePage' />
</template>

<style>
html,
body,
#app {
  width: 99%;
  height: 99%;
}
</style>
