import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import 'vue3-ui-kit/dist/vue3-ui-kit.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
