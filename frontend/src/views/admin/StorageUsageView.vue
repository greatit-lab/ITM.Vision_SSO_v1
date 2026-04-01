<!-- frontend/src/views/admin/StorageUsageView.vue -->
<template>
  <div
    class="min-h-full transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B] font-sans flex flex-col p-4 gap-4"
  >
    <div class="flex items-center justify-between shrink-0">
      <div class="flex items-center gap-3">
        <div
          class="flex items-center justify-center w-10 h-10 bg-white border shadow-sm rounded-xl dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
        >
          <i
            class="text-xl text-indigo-600 pi pi-database dark:text-indigo-400"
          ></i>
        </div>
        <div>
          <h1
            class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            Storage & DB Analytics
          </h1>
          <p class="text-xs font-medium text-slate-500 dark:text-slate-400">
            Monitor physical database table sizes, row counts, and object
            storage capacity.
          </p>
        </div>
      </div>

      <div
        class="flex items-center gap-2 p-1.5 bg-white border rounded-xl shadow-sm dark:bg-[#111111] border-slate-200 dark:border-zinc-800"
      >
        <Select
          v-model="selectedInterval"
          :options="intervalOptions"
          optionLabel="label"
          optionValue="value"
          class="w-[120px] !h-8 !text-sm custom-dropdown"
          @change="fetchData"
        />
        <div class="w-px h-5 mx-1 bg-slate-200 dark:bg-zinc-700"></div>
        <DatePicker
          v-model="startDate"
          dateFormat="yy-mm-dd"
          class="w-[130px] !h-8 !text-sm date-picker"
        />
        <span class="text-slate-400">-</span>
        <DatePicker
          v-model="endDate"
          dateFormat="yy-mm-dd"
          class="w-[130px] !h-8 !text-sm date-picker"
        />
        <Button
          icon="pi pi-search"
          class="!w-8 !h-8 !bg-indigo-600 !border-indigo-600 hover:!bg-indigo-700 ml-1"
          @click="fetchData"
          :loading="isLoading"
        />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 shrink-0">
      <div
        class="p-4 bg-white border shadow-sm dark:bg-[#111111] rounded-2xl border-slate-200 dark:border-zinc-800 relative overflow-hidden group"
      >
        <div
          class="absolute top-0 right-0 w-24 h-24 transition-transform duration-500 transform translate-x-8 -translate-y-8 rounded-full bg-indigo-50 dark:bg-indigo-900/20 group-hover:scale-110"
        ></div>
        <div class="relative z-10 flex items-center justify-between">
          <div>
            <p
              class="mb-1 text-sm font-bold text-slate-500 dark:text-slate-400"
            >
              Total Database Size
            </p>
            <div class="flex items-baseline gap-2">
              <span
                class="text-3xl font-extrabold text-slate-800 dark:text-slate-100"
                >{{ formatGB(summaryData.totalDbUsageMB) }}</span
              >
              <span class="text-sm font-bold text-slate-400">GB</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-1">
              Targeted specific tables & dynamic monthly tables
            </p>
          </div>
          <div
            class="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full dark:bg-indigo-900/40"
          >
            <i
              class="text-2xl text-indigo-600 pi pi-server dark:text-indigo-400"
            ></i>
          </div>
        </div>
      </div>

      <div
        class="p-4 bg-white border shadow-sm dark:bg-[#111111] rounded-2xl border-slate-200 dark:border-zinc-800 relative overflow-hidden group"
      >
        <div
          class="absolute top-0 right-0 w-24 h-24 transition-transform duration-500 transform translate-x-8 -translate-y-8 rounded-full bg-teal-50 dark:bg-teal-900/20 group-hover:scale-110"
        ></div>
        <div class="relative z-10 flex items-center justify-between">
          <div>
            <p
              class="mb-1 text-sm font-bold text-slate-500 dark:text-slate-400"
            >
              Object Storage Size (S3/MinIO)
            </p>
            <div class="flex items-baseline gap-2">
              <span
                class="text-3xl font-extrabold text-slate-800 dark:text-slate-100"
                >{{ formatGB(summaryData.totalObjectStorageMB) }}</span
              >
              <span class="text-sm font-bold text-slate-400">GB</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-1">
              Raw files, logs, and images
            </p>
          </div>
          <div
            class="flex items-center justify-center w-12 h-12 bg-teal-100 rounded-full dark:bg-teal-900/40"
          >
            <i
              class="text-2xl text-teal-600 pi pi-cloud dark:text-teal-400"
            ></i>
          </div>
        </div>
      </div>
    </div>

    <div
      class="p-4 bg-white border shadow-sm dark:bg-[#111111] rounded-2xl border-slate-200 dark:border-zinc-800 shrink-0 flex flex-col h-[320px]"
    >
      <h3
        class="flex items-center gap-2 mb-2 text-sm font-bold text-slate-700 dark:text-slate-200"
      >
        <i class="text-indigo-500 pi pi-chart-area"></i> Storage Growth Trend
        (Cumulative vs Daily Actuals)
      </h3>
      <div class="flex-1 w-full min-h-0">
        <EChart
          v-if="!isLoading && trendData.length > 0"
          :option="trendChartOption"
        />
        <div
          v-else-if="!isLoading && trendData.length === 0"
          class="flex flex-col items-center justify-center h-full text-sm text-slate-400"
        >
          <i class="mb-2 text-2xl opacity-50 pi pi-info-circle"></i>
          <span>No trend data found for this period.</span>
        </div>
      </div>
    </div>

    <div class="grid flex-1 grid-cols-12 gap-4 min-h-[300px]">
      <div
        class="col-span-4 p-4 bg-white border shadow-sm dark:bg-[#111111] rounded-2xl border-slate-200 dark:border-zinc-800 flex flex-col"
      >
        <h3
          class="flex items-center gap-2 mb-2 text-sm font-bold text-slate-700 dark:text-slate-200"
        >
          <i class="text-indigo-500 pi pi-chart-pie"></i> Database Distribution
        </h3>
        <div class="flex-1 w-full min-h-0">
          <EChart v-if="tableData.length > 0" :option="pieChartOption" />
        </div>
      </div>

      <div
        class="col-span-8 p-0 overflow-hidden bg-white border shadow-sm dark:bg-[#111111] rounded-2xl border-slate-200 dark:border-zinc-800 flex flex-col"
      >
        <div
          class="p-4 border-b bg-slate-50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 shrink-0"
        >
          <h3
            class="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200"
          >
            <i class="text-indigo-500 pi pi-table"></i> Physical Table Sizes &
            Rows
          </h3>
        </div>
        <div class="flex-1 overflow-auto custom-scrollbar">
          <table
            class="w-full text-sm text-left table-fixed text-slate-600 dark:text-slate-400"
          >
            <colgroup>
              <col class="w-[30%]" />
              <col class="w-[15%]" />
              <col class="w-[20%]" />
              <col class="w-[15%]" />
              <col class="w-[20%]" />
            </colgroup>
            <thead
              class="text-xs uppercase bg-white dark:bg-[#111111] text-slate-500 dark:text-slate-400 sticky top-0 z-10 shadow-sm"
            >
              <tr>
                <th
                  class="px-4 py-3 font-bold border-b border-slate-200 dark:border-zinc-800"
                >
                  Table Name
                </th>
                <th
                  class="px-4 py-3 font-bold text-center border-b border-slate-200 dark:border-zinc-800"
                >
                  Type
                </th>
                <th
                  class="px-4 py-3 font-bold text-right border-b border-slate-200 dark:border-zinc-800"
                >
                  Row Count
                </th>
                <th
                  class="px-4 py-3 font-bold text-right border-b border-slate-200 dark:border-zinc-800"
                >
                  Size (GB)
                </th>
                <th
                  class="px-4 py-3 font-bold text-center border-b border-slate-200 dark:border-zinc-800"
                >
                  % of DB
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-zinc-800">
              <tr
                v-for="item in tableData"
                :key="item.tableName"
                class="transition-colors hover:bg-slate-50 dark:hover:bg-zinc-900/50"
              >
                <td
                  class="px-4 py-3 font-mono font-bold truncate text-slate-700 dark:text-slate-300"
                  :title="item.tableName"
                >
                  {{ item.tableName }}
                </td>
                <td class="px-4 py-3 text-center">
                  <span
                    class="px-2 py-0.5 text-[10px] font-bold rounded-full whitespace-nowrap"
                    :class="
                      item.type === 'Static'
                        ? 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-slate-400'
                        : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                    "
                  >
                    {{ item.type }}
                  </span>
                </td>
                <td
                  class="px-4 py-3 font-mono text-right text-slate-600 dark:text-slate-300"
                >
                  {{ item.rowCount.toLocaleString() }}
                  <span class="text-[10px] text-slate-400 ml-1">Rows</span>
                </td>
                <td
                  class="px-4 py-3 font-mono font-bold text-right text-indigo-600 dark:text-indigo-400"
                >
                  {{ formatGB(item.sizeMB) }} GB
                </td>
                <td class="px-4 py-3 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <div
                      class="w-16 h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden shrink-0"
                    >
                      <div
                        class="h-full bg-indigo-500 rounded-full"
                        :style="`width: ${((item.sizeMB / summaryData.totalDbUsageMB) * 100).toFixed(1)}%`"
                      ></div>
                    </div>
                    <span class="w-10 font-mono text-xs text-right shrink-0"
                      >{{
                        (
                          (item.sizeMB / summaryData.totalDbUsageMB) *
                          100
                        ).toFixed(1)
                      }}%</span
                    >
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import EChart from "@/components/common/EChart.vue";
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import Button from "primevue/button";
import { adminApi } from "@/api/admin";
import dayjs from "dayjs";

const isLoading = ref(false);
const intervalOptions = [
  { label: "Daily View", value: "daily" },
  { label: "Monthly View", value: "monthly" },
];
const selectedInterval = ref("daily");

const today = new Date();
const lastMonth = new Date();
lastMonth.setMonth(today.getMonth() - 1);

const startDate = ref(lastMonth);
const endDate = ref(today);

const summaryData = ref({ totalDbUsageMB: 0, totalObjectStorageMB: 0 });
const tableData = ref<any[]>([]);
const trendData = ref<any[]>([]);

const isDarkMode = ref(document.documentElement.classList.contains("dark"));

const formatGB = (mb: number) => {
  if (!mb || mb === 0) return "0.00";
  return (mb / 1024).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const fetchData = async () => {
  isLoading.value = true;
  try {
    const startStr = dayjs(startDate.value).format("YYYY-MM-DD");
    const endStr = dayjs(endDate.value).format("YYYY-MM-DD");
    const response = await adminApi.getStorageUsage(
      startStr,
      endStr,
      selectedInterval.value,
    );

    summaryData.value = response.summary;
    tableData.value = response.tableDetails;
    trendData.value = response.trends;
  } catch (error) {
    console.error("Failed to fetch storage usage", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchData();

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "class") {
        isDarkMode.value = document.documentElement.classList.contains("dark");
      }
    });
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
});

// 혼합 차트 (누적은 Line, 일별은 Bar)
const trendChartOption = computed(() => {
  const textColor = isDarkMode.value ? "#cbd5e1" : "#475569";
  const gridColor = isDarkMode.value
    ? "rgba(255, 255, 255, 0.05)"
    : "rgba(0, 0, 0, 0.05)";

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      backgroundColor: isDarkMode.value
        ? "rgba(24, 24, 27, 0.9)"
        : "rgba(255, 255, 255, 0.95)",
      borderColor: isDarkMode.value ? "#3f3f46" : "#e2e8f0",
      textStyle: { color: textColor, fontSize: 11 },
      formatter: function (params: any) {
        let html = `<div class="pb-1 mb-1 font-bold border-b border-gray-500">${params[0].name}</div>`;
        params.forEach((p: any) => {
          const colorDot = `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${p.color};"></span>`;
          html += `<div class="flex justify-between items-center gap-4 text-[10px] mb-0.5">
                     <span>${colorDot} ${p.seriesName}</span>
                     <span class="font-mono font-bold">${Number(p.value).toLocaleString(undefined, { maximumFractionDigits: 1 })} MB</span>
                   </div>`;
        });
        return html;
      },
    },
    legend: { textStyle: { color: textColor }, bottom: 0, itemGap: 15 },
    grid: { left: 60, right: 60, top: 30, bottom: 40 },
    xAxis: {
      type: "category",
      data: trendData.value.map((d) => d.date),
      axisLabel: { color: textColor },
      axisLine: { lineStyle: { color: gridColor } },
    },
    // 듀얼 Y축 적용
    yAxis: [
      {
        type: "value",
        name: "Cumulative (MB)",
        nameTextStyle: {
          color: textColor,
          padding: [0, 0, 0, 10],
          fontSize: 10,
        },
        axisLabel: { color: textColor, fontSize: 10 },
        splitLine: { lineStyle: { color: gridColor } },
      },
      {
        type: "value",
        name: "Daily (MB)",
        nameTextStyle: {
          color: textColor,
          padding: [0, 10, 0, 0],
          fontSize: 10,
        },
        axisLabel: { color: textColor, fontSize: 10 },
        splitLine: { show: false }, // 우측 축 라인 숨김 처리로 깔끔하게 구성
      },
    ],
    series: [
      // 누적 합계 (선 그래프)
      {
        name: "Cum. DB Usage",
        type: "line",
        yAxisIndex: 0, // 좌측 Y축
        smooth: true,
        showSymbol: false,
        itemStyle: { color: "#6366f1" }, // Indigo
        lineStyle: { width: 3 },
        data: trendData.value.map((d) => d.cumDbMB.toFixed(2)),
      },
      {
        name: "Cum. Object Storage",
        type: "line",
        yAxisIndex: 0, // 좌측 Y축
        smooth: true,
        showSymbol: false,
        itemStyle: { color: "#14b8a6" }, // Teal
        lineStyle: { width: 3 },
        data: trendData.value.map((d) => d.cumObjMB.toFixed(2)),
      },
      // 일별 실제 발생량 (막대 그래프)
      {
        name: "Daily DB Ingestion",
        type: "bar",
        yAxisIndex: 1, // 우측 Y축
        barWidth: "20%",
        itemStyle: {
          color: "rgba(99, 102, 241, 0.7)",
          borderRadius: [2, 2, 0, 0],
        },
        data: trendData.value.map((d) => d.dailyDbMB.toFixed(2)),
      },
      {
        name: "Daily Object Ingestion",
        type: "bar",
        yAxisIndex: 1, // 우측 Y축
        barWidth: "20%",
        itemStyle: {
          color: "rgba(20, 184, 166, 0.7)",
          borderRadius: [2, 2, 0, 0],
        },
        data: trendData.value.map((d) => d.dailyObjMB.toFixed(2)),
      },
    ],
  };
});

const pieChartOption = computed(() => {
  const topTables = tableData.value.slice(0, 5);
  const others = tableData.value.slice(5);
  const othersSize = others.reduce((sum, t) => sum + t.sizeMB, 0);

  const pieData = topTables.map((t) => ({
    name: t.tableName,
    value: t.sizeMB,
  }));
  if (othersSize > 0) {
    pieData.push({ name: "Others", value: othersSize });
  }

  const textColor = isDarkMode.value ? "#cbd5e1" : "#475569";

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: isDarkMode.value
        ? "rgba(24, 24, 27, 0.9)"
        : "rgba(255, 255, 255, 0.95)",
      borderColor: isDarkMode.value ? "#3f3f46" : "#e2e8f0",
      textStyle: { color: textColor, fontSize: 12 },
      formatter: (params: any) =>
        `<div class="pb-1 mb-1 font-bold border-b border-gray-500">${params.name}</div>${formatGB(params.value)} GB (${params.percent}%)`,
    },
    legend: {
      orient: "horizontal",
      bottom: 0,
      textStyle: { color: textColor, fontSize: 10 },
      itemWidth: 10,
      itemHeight: 10,
    },
    series: [
      {
        name: "Table Size",
        type: "pie",
        radius: ["40%", "70%"],
        center: ["50%", "45%"],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 4,
          borderColor: isDarkMode.value ? "#111111" : "#ffffff",
          borderWidth: 2,
        },
        label: { show: false },
        color: [
          "#6366f1",
          "#8b5cf6",
          "#ec4899",
          "#f43f5e",
          "#f97316",
          "#94a3b8",
        ],
        data: pieData,
      },
    ],
  };
});
</script>

<style scoped>
:deep(.p-select),
:deep(.custom-dropdown),
:deep(.date-picker .p-inputtext) {
  @apply !bg-slate-50 dark:!bg-zinc-900/50 !border-0 text-slate-700 dark:text-slate-200 rounded-lg shadow-none;
}
:deep(.p-select-dropdown) {
  @apply text-slate-400 dark:text-zinc-500 w-6 !bg-transparent !border-0;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #3f3f46;
}
</style>
