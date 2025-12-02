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
  const chartInstance = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
      layout: root.verticalLayout,
    })
  );

  chart = chartInstance;

  const cursor = chartInstance.set(
    "cursor",
    am5xy.XYCursor.new(root, { behavior: "zoomXY" })
  );
  cursor.lineY.set("visible", false);

  const textColor = isDark ? am5.color(0xffffff) : am5.color(0x000000);

  // 1. X축 설정 (타입에 따른 분기)
  let xAxis: am5xy.Axis<am5xy.AxisRenderer>;

  if (config.xAxisType === "value") {
    // 숫자형 X축 (예: Wavelength)
    xAxis = chartInstance.xAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 50 }),
        tooltip: am5.Tooltip.new(root, {}),
      })
    );
  } else {
    // 기본값: 날짜형 X축
    xAxis = chartInstance.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: config.xTimeUnit || "minute", count: 1 },
        renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 80 }),
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    if (config.xAxisDateFormat) {
      // 날짜 포맷 설정 로직 (기존 유지)
      const dateFormats = (xAxis as am5xy.DateAxis<am5xy.AxisRenderer>).get("dateFormats");
      const periodChangeDateFormats = (xAxis as am5xy.DateAxis<am5xy.AxisRenderer>).get("periodChangeDateFormats");

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
      (xAxis as am5xy.DateAxis<am5xy.AxisRenderer>).set("tooltipDateFormat", config.tooltipDateFormat);
    }
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
      
      const axis = chartInstance.yAxes.push(
        am5xy.ValueAxis.new(root, {
          renderer,
          min: yCfg.min,
          max: yCfg.max,
        })
      );
      
      // 축 제목 추가
      if (yCfg.title) {
        axis.children.unshift(
          am5.Label.new(root, {
            rotation: -90,
            text: yCfg.title,
            y: am5.p50,
            centerX: am5.p50,
            fill: textColor,
            fontWeight: "bold"
          })
        );
      }
      
      yAxes.push(axis);
    });
  } else {
    const renderer = am5xy.AxisRendererY.new(root, {});
    renderer.labels.template.set("fill", textColor);
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

      // X축이 DateAxis일 때만 날짜 처리
      if (config.xAxisType !== "value") {
        series.data.processor = am5.DataProcessor.new(root, {
          dateFields: [config.xField],
          dateFormat: "yyyy-MM-ddTHH:mm:ss",
        });
      }

      series.data.setAll(data);
    });
  }

  const legend = chartInstance.children.push(
    am5.Legend.new(root, { centerX: am5.p50, x: am5.p50 })
  );
  legend.labels.template.set("fill", textColor);
  legend.data.setAll(chartInstance.series.values);
};

onMounted(() => createChart());

onUnmounted(() => {
  if (root) root.dispose();
});

watch(
  () => props.data,
  (newData) => {
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
