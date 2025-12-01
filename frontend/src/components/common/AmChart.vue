<!-- frontend/src/components/common/AmChart.vue -->
<template>
  <div ref="chartRef" class="w-full h-full" :style="{ height: height }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";

const props = defineProps<{
  chartType: string;
  data: any[];
  config: any;
  height?: string;
  isDarkMode?: boolean;
}>();

const chartRef = ref<HTMLElement | null>(null);
let root: am5.Root | null = null;
let chart: am5xy.XYChart | null = null;

const createChart = () => {
  if (!chartRef.value) return;
  if (root) root.dispose();

  root = am5.Root.new(chartRef.value);
  const myTheme = props.isDarkMode
    ? am5themes_Dark.new(root)
    : am5themes_Animated.new(root);
  root.setThemes([myTheme]);

  createLineChart(root, props.data, props.config, props.isDarkMode || false);
};

const createLineChart = (
  root: am5.Root,
  data: any[],
  config: any,
  isDark: boolean
) => {
  // [수정] 로컬 변수를 사용하여 null 가능성 제거
  const chartInstance = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
      layout: root.verticalLayout,
    })
  );

  // 전역 변수 업데이트
  chart = chartInstance;

  // 이후 로직에서는 chartInstance 사용
  const cursor = chartInstance.set(
    "cursor",
    am5xy.XYCursor.new(root, { behavior: "zoomXY" })
  );
  cursor.lineY.set("visible", false);

  const textColor = isDark ? am5.color(0xffffff) : am5.color(0x000000);

  // 1. X축 설정
  const xAxis = chartInstance.xAxes.push(
    am5xy.DateAxis.new(root, {
      baseInterval: { timeUnit: config.xTimeUnit || "minute", count: 1 },
      renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 80 }),
      tooltip: am5.Tooltip.new(root, {}),
    })
  );

  if (config.xAxisDateFormat) {
    const dateFormats = xAxis.get("dateFormats");
    const periodChangeDateFormats = xAxis.get("periodChangeDateFormats");

    if (dateFormats) {
      dateFormats["minute"] = config.xAxisDateFormat;
      dateFormats["hour"] = config.xAxisDateFormat;
      dateFormats["day"] = config.xAxisDateFormat;
      dateFormats["week"] = config.xAxisDateFormat;
      dateFormats["month"] = config.xAxisDateFormat;
    }
    if (periodChangeDateFormats) {
      periodChangeDateFormats["minute"] = config.xAxisDateFormat;
      periodChangeDateFormats["hour"] = config.xAxisDateFormat;
      periodChangeDateFormats["day"] = config.xAxisDateFormat;
      periodChangeDateFormats["week"] = config.xAxisDateFormat;
      periodChangeDateFormats["month"] = config.xAxisDateFormat;
    }
  }

  if (config.tooltipDateFormat) {
    xAxis.set("tooltipDateFormat", config.tooltipDateFormat);
  }

  xAxis.get("renderer").labels.template.setAll({
    fill: textColor,
    rotation: -45,
    centerY: am5.p50,
    centerX: am5.p100,
  });

  // 2. Y축 설정
  const yAxes: am5xy.ValueAxis<am5xy.AxisRenderer>[] = [];

  if (config.yAxes && Array.isArray(config.yAxes)) {
    config.yAxes.forEach((yCfg: any) => {
      const renderer = am5xy.AxisRendererY.new(root, {
        opposite: yCfg.opposite || false,
      });
      renderer.labels.template.set("fill", textColor);
      // [수정] chartInstance 사용
      const axis = chartInstance.yAxes.push(
        am5xy.ValueAxis.new(root, {
          renderer,
          min: yCfg.min,
          max: yCfg.max,
        })
      );
      yAxes.push(axis);
    });
  } else {
    const renderer = am5xy.AxisRendererY.new(root, {});
    renderer.labels.template.set("fill", textColor);
    // [수정] chartInstance 사용
    yAxes.push(
      chartInstance.yAxes.push(am5xy.ValueAxis.new(root, { renderer }))
    );
  }

  // 3. 시리즈 생성
  if (config.series) {
    config.series.forEach((s: any) => {
      const yAxisIndex = s.yAxisIndex || 0;
      const targetYAxis = yAxes[yAxisIndex] || yAxes[0];

      if (!targetYAxis) return;

      const seriesColor = am5.color(s.color);

      const tooltip = am5.Tooltip.new(root, {
        labelText: s.tooltipText || "{valueY}",
        autoTextColor: false,
      });

      tooltip.get("background")?.setAll({
        fill: seriesColor,
        stroke: seriesColor,
        fillOpacity: 0.9,
      });

      tooltip.label.setAll({
        fill: am5.color(0xffffff),
      });

      // [수정] chartInstance 사용
      const series = chartInstance.series.push(
        am5xy.LineSeries.new(root, {
          name: s.name,
          xAxis: xAxis,
          yAxis: targetYAxis,
          valueYField: s.valueField,
          valueXField: config.xField,
          stroke: seriesColor,
          fill: seriesColor,
          tooltip: tooltip,
        })
      );

      series.strokes.template.setAll({
        strokeWidth: s.strokeWidth || 2,
      });

      if (s.bulletRadius) {
        series.bullets.push(() =>
          am5.Bullet.new(root, {
            sprite: am5.Circle.new(root, {
              radius: s.bulletRadius,
              fill: series.get("stroke"),
            }),
          })
        );
      }

      series.data.processor = am5.DataProcessor.new(root, {
        dateFields: [config.xField],
        dateFormat: "yyyy-MM-ddTHH:mm:ss",
      });

      series.data.setAll(data);
    });
  }

  // [수정] chartInstance 사용
  const legend = chartInstance.children.push(
    am5.Legend.new(root, { centerX: am5.p50, x: am5.p50 })
  );
  legend.labels.template.set("fill", textColor);
  // [수정] chartInstance 사용
  legend.data.setAll(chartInstance.series.values);
};

onMounted(() => createChart());

onUnmounted(() => {
  if (root) root.dispose();
});

watch(
  () => props.data,
  (newData) => {
    // [수정] chart가 null이 아님을 확인
    if (chart && root) {
      chart.series.each((series) => {
        series.data.setAll(newData);
      });
    } else {
      createChart();
    }
  },
  { deep: true }
);

watch(
  [() => props.config, () => props.chartType, () => props.isDarkMode],
  () => {
    nextTick(() => createChart());
  },
  { deep: true }
);
</script>

