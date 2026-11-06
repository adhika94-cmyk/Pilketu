<template>
  <button
    type="button"
    class="theme-toggle-btn shadow-sm"
    :title="isDarkMode ? 'Beralih ke Mode Terang (Light Mode)' : 'Beralih ke Mode Gelap (Dark Mode)'"
    :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggleTheme"
  >
    <i v-if="isDarkMode" class="bi bi-sun-fill text-warning fs-5"></i>
    <i v-else class="bi bi-moon-stars-fill text-primary fs-5"></i>
  </button>
</template>

<script setup lang="ts">
import { themeState } from '../services/theme';

const isDarkMode = themeState.isDarkMode;
const toggleTheme = themeState.toggleTheme;
</script>
