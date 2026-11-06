import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './index.css';
import { initTheme } from './services/theme';

// Initialize dark/light mode preference from localStorage
initTheme();

const app = createApp(App);
app.use(router);
app.mount('#app');
