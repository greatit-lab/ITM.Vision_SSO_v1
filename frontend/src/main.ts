// frontend/src/main.ts
import { createApp } from "vue";
import { createPinia } from "pinia"; // [추가]
import App from "./App.vue";
import router from "./router";
import PrimeVue from "primevue/config";
import Aura from "@primevue/themes/aura";
import Tooltip from "primevue/tooltip";
import "primeicons/primeicons.css";
import "./style.css";

const app = createApp(App);

app.use(createPinia()); // [추가] Pinia 등록
app.use(router);

app.use(PrimeVue, {
  ripple: true,
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: ".dark",
    },
  },
});

app.directive("tooltip", Tooltip);

app.mount("#app");
