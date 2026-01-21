// frontend/src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

// PrimeVue 및 스타일
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura'; // (PrimeVue 4 사용 시) 또는 사용하는 테마
import 'primeicons/primeicons.css';

// [New] Quill Editor CSS (게시판 에디터 스타일 필수)
import '@vueup/vue-quill/dist/vue-quill.snow.css';

import './style.css'; // Tailwind 등 사용자 정의 스타일

// [필수] 서비스 플러그인 추가
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

// 기타 플러그인 (Tooltip 등)
import Tooltip from 'primevue/tooltip';

const app = createApp(App);

app.use(createPinia());
app.use(router);

// PrimeVue 설정
app.use(PrimeVue, {
    theme: {
        preset: Aura, // 사용 중인 테마에 맞게 설정
        options: {
            darkModeSelector: '.dark',
        }
    }
});

// [중요] 서비스 등록
app.use(ConfirmationService);
app.use(ToastService);

// 전역 디렉티브
app.directive('tooltip', Tooltip);

app.mount('#app');
