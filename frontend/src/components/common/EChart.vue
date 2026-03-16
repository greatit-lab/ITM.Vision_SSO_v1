<!-- frontend/src/components/common/EChart.vue -->
<template>
  <div ref="chartRef" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import * as echarts from "echarts";

const props = defineProps<{
  option: any;
  theme?: string | object;
}>();

// 차트 생성 완료 이벤트를 정의합니다.
const emit = defineEmits(["chartCreated"]);

const chartRef = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;

const initChart = () => {
  if (chartRef.value) {
    if (chartInstance) {
      chartInstance.dispose();
    }

    const isDark = document.documentElement.classList.contains("dark");
    const theme = props.theme || (isDark ? "dark" : undefined);

    chartInstance = echarts.init(chartRef.value, theme);

    // 차트 인스턴스가 생성되면 부모에게 전달합니다.
    emit("chartCreated", chartInstance);

    if (props.option) {
      // 초기 렌더링 시에도 확실한 덮어쓰기 적용
      chartInstance.setOption(props.option, { notMerge: true });
    }
  }
};

const setupResizeObserver = () => {
  if (!chartRef.value) return;
  resizeObserver = new ResizeObserver(() => {
    if (chartInstance) chartInstance.resize();
  });
  resizeObserver.observe(chartRef.value);
};

watch(
  () => props.option,
  (newOption) => {
    if (chartInstance && newOption) {
      // [핵심 변경] notMerge: true 로 설정하여
      // 이전 조회 조건(예: 7일)의 차트 잔여물이 현재 조회 조건(예: 1일)에
      // 누적되어 중복으로 그려지는(Ghosting) 문제를 완벽히 차단합니다.
      chartInstance.setOption(newOption, { notMerge: true, lazyUpdate: true });
    }
  },
  { deep: true },
);

const themeObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === "class") {
      initChart();
    }
  });
});

onMounted(() => {
  initChart();
  setupResizeObserver();
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
  themeObserver.disconnect();
  chartInstance?.dispose();
});
</script>
